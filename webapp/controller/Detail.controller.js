sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "etudiant14/sap/training/helloworld/model/DataService"
], function (Controller, History, JSONModel, DataService) {
    "use strict";

    return Controller.extend("etudiant14.sap.training.helloworld.controller.Detail", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ c: {}, shown: [], airlines: [] }), "d");
            this.getOwnerComponent().getRouter().getRoute("RouteDetail")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        // Retour à la page précédente (Dashboard, Bookings ou Customers)
        onNavBack: function () {
            if (History.getInstance().getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteDashboard", {}, true);
            }
        },

        onNav: function (sRoute) {
            this.getOwnerComponent().getRouter().navTo(sRoute);
        },

        _onRouteMatched: function (oEvent) {
            var sGuid = oEvent.getParameter("arguments").customerId.toLowerCase();

            DataService.load(this.getOwnerComponent().getModel()).then(function (d) {
                var oCust = d.customers.filter(function (c) {
                    return String(c.CustomerGuid).toLowerCase() === sGuid;
                })[0];
                if (!oCust) { return this._showNotFound(); }

                var aB = d.bookings.filter(function (b) { return b.CustomerGuid === oCust.CustomerGuid; });
                var nX = aB.filter(function (b) { return b.Cancelled; }).length;
                var nRate = aB.length ? Math.round(nX / aB.length * 100) : 0;

                // Compagnies utilisées, triées par nombre de réservations
                var mAir = {};
                aB.forEach(function (b) {
                    var o = mAir[b.AirlineID] = mAir[b.AirlineID] || { id: b.AirlineID, total: 0, cancelled: 0 };
                    o.total++;
                    if (b.Cancelled) { o.cancelled++; }
                });

                this.getView().getModel("d").setData({
                    c: oCust,
                    initials: (oCust.CustomerName || "").slice(0, 2).toUpperCase(),
                    all: aB,
                    shown: aB,
                    n: aB.length,
                    active: aB.length - nX,
                    cancelled: nX,
                    rate: nRate,
                    rateState: nRate <= 20 ? "Success" : nRate <= 40 ? "Warning" : "Error",
                    airlines: Object.keys(mAir).map(function (k) { return mAir[k]; })
                        .sort(function (a, b) { return b.total - a.total; })
                });
                this.byId("statusTabs").setSelectedKey("all");
            }.bind(this)).catch(this._showNotFound.bind(this));
        },

        // Filtre le tableau selon l'onglet : tous / actives / annulées
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var oM = this.getView().getModel("d");
            oM.setProperty("/shown", oM.getProperty("/all").filter(function (b) {
                return sKey === "all" || (sKey === "cancelled") === b.Cancelled;
            }));
        },

        _showNotFound: function () {
            this.getOwnerComponent().getTargets().display("TargetNotFound");
        }
    });
});
