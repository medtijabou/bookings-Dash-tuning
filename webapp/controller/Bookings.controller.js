sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/syncStyleClass",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "etudiant14/sap/training/helloworld/model/DataService"
], function (Controller, JSONModel, DateFormat, syncStyleClass, MessageToast, MessageBox, DataService) {
    "use strict";

    var NS = "com.sap.gateway.srvd.ux_ui_customer.v0001.";
    var oIso = DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });

    return Controller.extend("etudiant14.sap.training.helloworld.controller.Bookings", {

        onInit: function () {
            this.getView().setModel(new JSONModel({ all: [], view: [], count: 0, airlines: [] }), "b");
            this.getOwnerComponent().getRouter().getRoute("RouteBookings")
                .attachPatternMatched(this._load, this);
        },

        _load: function () {
            return DataService.load(this.getOwnerComponent().getModel()).then(function (d) {
                var oM = this.getView().getModel("b");
                var aIds = [];
                d.bookings.forEach(function (x) { if (aIds.indexOf(x.AirlineID) < 0) { aIds.push(x.AirlineID); } });
                oM.setProperty("/all", d.bookings);
                oM.setProperty("/airlines", aIds.sort().map(function (k) { return { k: k }; }));
                this.onGo();
            }.bind(this));
        },

        // Applique les filtres du bandeau
        onGo: function () {
            var sAirline = this.byId("fAirline").getSelectedKey();
            var sClass = this.byId("fClass").getSelectedKey();
            var sStatus = this.byId("fStatus").getSelectedKey();
            var oFrom = this.byId("fDate").getDateValue();
            var oTo = this.byId("fDate").getSecondDateValue();
            var sFrom = oFrom ? oIso.format(oFrom) : "";
            var sTo = oTo ? oIso.format(oTo) : "";

            var aView = this.getView().getModel("b").getProperty("/all").filter(function (x) {
                return (!sAirline || x.AirlineID === sAirline)
                    && (!sClass || x.Class === sClass)
                    && (sStatus === "all" || (sStatus === "cancelled") === x.Cancelled)
                    && (!sFrom || x.FlightDate >= sFrom)
                    && (!sTo || x.FlightDate <= sTo);
            });
            this.getView().getModel("b").setProperty("/view", aView);
            this.getView().getModel("b").setProperty("/count", aView.length);
        },

        onReset: function () {
            this.byId("fAirline").setSelectedKey("").setValue("");
            this.byId("fClass").setSelectedKey("");
            this.byId("fStatus").setSelectedKey("all");
            this.byId("fDate").setValue("");
            this.onGo();
        },

        onCustomer: function (oEvent) {
            var oB = oEvent.getSource().getBindingContext("b").getObject();
            this.getOwnerComponent().getRouter().navTo("RouteDetail", { customerId: oB.CustomerGuid });
        },

        // Ouvre le détail d'une réservation
        onRowPress: function (oEvent) {
            var oB = oEvent.getSource().getBindingContext("b").getObject();
            var open = function () {
                this._oDialog.setModel(new JSONModel(oB), "sel");
                this._oDialog.open();
            }.bind(this);

            if (this._oDialog) { return open(); }
            this.loadFragment({ name: "etudiant14.sap.training.helloworld.view.BookingDialog" })
                .then(function (oDialog) {
                    this._oDialog = oDialog;
                    syncStyleClass(this.getOwnerComponent().getContentDensityClass(), this.getView(), oDialog);
                    open();
                }.bind(this));
        },

        onCloseDialog: function () { this._oDialog.close(); },

        // Exécute l'action OData liée cancel_booking, puis recharge la liste
        onCancelBooking: function () {
            var sGuid = this._oDialog.getModel("sel").getProperty("/BookingGuid");
            var oModel = this.getOwnerComponent().getModel();
            var oCtx = oModel.bindContext("/UX_Booking(" + sGuid + ")").getBoundContext();

            oModel.bindContext(NS + "cancel_booking(...)", oCtx).execute().then(function () {
                MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("bookingCancelledMessage"));
                this._oDialog.close();
                return this._load();
            }.bind(this)).catch(function (oErr) {
                MessageBox.error(oErr.message);
            });
        }
    });
});
