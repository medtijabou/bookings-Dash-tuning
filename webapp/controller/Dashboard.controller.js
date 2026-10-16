sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/viz/ui5/controls/VizFrame",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "etudiant14/sap/training/helloworld/model/DataService",
    "sap/m/MessageBox",
    "sap/m/Text"
], function (Controller, JSONModel, DateFormat, VizFrame, FlattenedDataset, FeedItem, DataService, MessageBox, Text) {
    "use strict";

    var BLUE = "#4589dd", ORANGE = "#e8692a", GREEN = "#17a074", RED = "#e00b1b", LGREEN = "#3ba55d";

    // Regroupe un tableau selon une clé
    function group(a, fnKey) {
        var m = {};
        a.forEach(function (x) { var k = fnKey(x); (m[k] = m[k] || []).push(x); });
        return m;
    }

    return Controller.extend("etudiant14.sap.training.helloworld.controller.Dashboard", {

        onInit: function () {
            this.getView().setModel(new JSONModel({}), "k");
            this.getOwnerComponent().getRouter().getRoute("RouteDashboard")
                .attachPatternMatched(this._load, this);
        },

        onRefresh: function () { this._load(); },

        onTile: function (sRoute) {
            this.getOwnerComponent().getRouter().navTo(sRoute);
        },

        _load: function () {
            DataService.load(this.getOwnerComponent().getModel()).then(function (d) {
                var aB = d.bookings;
                var nX = aB.filter(function (b) { return b.Cancelled; }).length;
                this.getView().getModel("k").setData({
                    customers: d.customers.length,
                    bookings: aB.length,
                    cancelled: nX,
                    rate: aB.length ? Math.round(nX / aB.length * 100) : 0
                });

                // Clients par pays
                var mCountry = group(d.customers, function (c) { return c.Country; });
                this._chart("boxCountry", "donut", "Country", ["Customers"], [BLUE, ORANGE, GREEN, "#e8497f"],
                    Object.keys(mCountry).map(function (k) { return { Country: k, Customers: mCountry[k].length }; }),
                    { dataLabel: { visible: true, type: "percentage" } });

                // Réservations par client (cliquable)
                var mGuid = {};
                var aCust = [];
                var mCust = group(aB, function (b) { return b.CustomerGuid; });
                Object.keys(mCust).forEach(function (g) {
                    var a = mCust[g], n = a.filter(function (b) { return b.Cancelled; }).length;
                    mGuid[a[0].Customer] = g;
                    aCust.push({ Customer: a[0].Customer, Cancelled: n, Active: a.length - n });
                });
                aCust.sort(function (x, y) { return (y.Cancelled + y.Active) - (x.Cancelled + x.Active); });
                this._chart("boxCustomer", "stacked_bar", "Customer", ["Cancelled", "Active"], [RED, LGREEN], aCust, {}, function (oEvent) {
                    var sGuid = mGuid[oEvent.getParameter("data")[0].data.Customer];
                    if (sGuid) { this.getOwnerComponent().getRouter().navTo("RouteDetail", { customerId: sGuid }); }
                }.bind(this));

                // Réservations par mois de vol
                var oFmt = DateFormat.getDateInstance({ pattern: "MMM yyyy" });
                var mMonth = group(aB.filter(function (b) { return b.FlightDate; }), function (b) { return b.FlightDate.slice(0, 7); });
                this._chart("boxMonth", "line", "Month", ["Bookings", "Cancelled"], [BLUE, RED],
                    Object.keys(mMonth).sort().map(function (k) {
                        return {
                            Month: oFmt.format(new Date(k + "-01T12:00:00")),
                            Bookings: mMonth[k].length,
                            Cancelled: mMonth[k].filter(function (b) { return b.Cancelled; }).length
                        };
                    }), {});

                // Réservations par compagnie, réparties par classe
                var mAir = group(aB, function (b) { return b.AirlineID; });
                var aAir = Object.keys(mAir).map(function (k) {
                    var n = function (c) { return mAir[k].filter(function (b) { return b.Class === c; }).length; };
                    return { Airline: k, Economy: n("Y"), Business: n("C"), First: n("F"), Total: mAir[k].length };
                }).sort(function (x, y) { return y.Total - x.Total; });
                this._chart("boxAirline", "stacked_column", "Airline", ["Economy", "Business", "First"], [BLUE, ORANGE, GREEN], aAir, {});
            }.bind(this)).catch(function (e) {
                /* eslint-disable no-console */
                console.error("Dashboard: chargement impossible", e);
                MessageBox.error("Impossible de charger les données du tableau de bord.\n" + (e && e.message ? e.message : e));
            });
        },

        /**
         * Construit un VizFrame dans la boîte indiquée.
         * Donut : feeds size/color ; autres types : valueAxis/categoryAxis.
         */
        _chart: function (sBoxId, sType, sDim, aMeasures, aColors, aRows, oPlot, fnSelect) {
            var oBox = this.byId(sBoxId), bDonut = sType === "donut";
            if (!oBox) { return; }
            oBox.destroyItems();
            if (!aRows || !aRows.length) {
                oBox.addItem(new Text({ text: "Aucune donnée" }));
                return;
            }

            var oViz = new VizFrame({
                vizType: sType, width: "100%", height: "320px",
                uiConfig: { applicationSet: "fiori" },
                vizProperties: {
                    title: { visible: false },
                    plotArea: Object.assign({ colorPalette: aColors, dataLabel: { visible: true } }, oPlot)
                }
            });
            var oModel = new JSONModel({ rows: aRows });
            oModel.setSizeLimit(1000);
            oViz.setModel(oModel);
            oViz.setDataset(new FlattenedDataset({
                dimensions: [{ name: sDim, value: "{" + sDim + "}" }],
                measures: aMeasures.map(function (m) { return { name: m, value: "{" + m + "}" }; }),
                data: { path: "/rows" }
            }));
            oViz.addFeed(new FeedItem({ uid: bDonut ? "size" : "valueAxis", type: "Measure", values: aMeasures }));
            oViz.addFeed(new FeedItem({ uid: bDonut ? "color" : "categoryAxis", type: "Dimension", values: [sDim] }));
            if (fnSelect) { oViz.attachSelectData(fnSelect); }
            oBox.addItem(oViz);
        }
    });
});
