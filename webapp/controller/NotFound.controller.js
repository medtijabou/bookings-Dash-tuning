sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend(
        "etudiant14.sap.training.helloworld.controller.NotFound",
        {
            onNavBack() {
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteOverview", {}, true);
            }
        }
    );
});