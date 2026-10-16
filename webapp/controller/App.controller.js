sap.ui.define(["sap/ui/core/mvc/Controller"], function (BaseController) {
    "use strict";

    var mKeys = { RouteDashboard: "dashboard", RouteOverview: "customers", RouteBookings: "bookings" };
    var mRoutes = { dashboard: "RouteDashboard", customers: "RouteOverview", bookings: "RouteBookings" };

    return BaseController.extend("etudiant14.sap.training.helloworld.controller.App", {
        onInit: function () {
            var oComp = this.getOwnerComponent();
            this.getView().addStyleClass(oComp.getContentDensityClass());
            // Garde l'entrée du menu synchronisée avec la route active
            oComp.getRouter().attachRouteMatched(function (oEvent) {
                var sKey = mKeys[oEvent.getParameter("name")];
                if (sKey) { this.byId("sideNav").setSelectedKey(sKey); }
            }, this);
        },

        onItemSelect: function (oEvent) {
            this.getOwnerComponent().getRouter()
                .navTo(mRoutes[oEvent.getParameter("item").getKey()]);
        },

        onToggleMenu: function () {
            var oPage = this.byId("toolPage");
            oPage.setSideExpanded(!oPage.getSideExpanded());
        }
    });
});
