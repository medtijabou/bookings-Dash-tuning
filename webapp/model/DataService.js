sap.ui.define([], function () {
    "use strict";

    // Accepte "X", "x", true, "true", "1", "yes" comme annulé
    function isCancelled(v) {
        return v === true || /^(x|true|1|yes)$/i.test(String(v === null || v === undefined ? "" : v).trim());
    }

    return {
        /**
         * Charge les clients avec leurs réservations ($expand=_Bookings),
         * comme le fait déjà la page Customers, puis aplatit les réservations.
         * Si rien n'est reçu, essaie en secours l'entité racine /UX_Booking.
         */
        load: function (oModel) {
            return oModel.bindList("/UX_Customer", null, null, null, { $expand: "_Bookings" })
                .requestContexts(0, 5000)
                .then(function (aCtx) {
                    var aCust = [], aRaw = [];
                    aCtx.forEach(function (c) {
                        var o = c.getObject();
                        aCust.push(o);
                        (o._Bookings || []).forEach(function (b) {
                            aRaw.push(Object.assign({}, b, { CustomerGuid: o.CustomerGuid }));
                        });
                    });
                    if (aRaw.length) { return { customers: aCust, raw: aRaw }; }

                    return oModel.bindList("/UX_Booking").requestContexts(0, 5000).then(function (a) {
                        return { customers: aCust, raw: a.map(function (c) { return c.getObject(); }) };
                    });
                })
                .then(function (r) {
                    var mC = {};
                    r.customers.forEach(function (c) { mC[c.CustomerGuid] = c; });
                    var aB = r.raw.map(function (b) {
                        return Object.assign({}, b, {
                            Customer: (mC[b.CustomerGuid] || {}).CustomerName,
                            Cancelled: isCancelled(b.IsCancelled),
                            Amount: Number(b.ForeignCurrencyPayment)
                        });
                    });
                    aB.sort(function (a, b) {
                        return (b.FlightDate || "").localeCompare(a.FlightDate || "");
                    });
                    return { customers: r.customers, bookings: aB };
                });
        }
    };
});
