
/**
 * Désactive la règle ESLint concernant les commentaires JSDoc.
 */

/* =========================================================
   IMPORTATION DES MODULES SAPUI5
   ========================================================= */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "etudiant14/sap/training/helloworld/model/models"
], function (UIComponent, Device, JSONModel, models) {
    "use strict";

    /* =====================================================
       COMPOSANT PRINCIPAL DE L'APPLICATION
       ===================================================== */
    return UIComponent.extend(
        "etudiant14.sap.training.helloworld.Component",
        {
            metadata: {
                manifest: "json"
            },

            /* =====================================================
               INITIALISATION DE L'APPLICATION
               ===================================================== */
            init: function () {

                // Initialise le composant SAPUI5 parent
                UIComponent.prototype.init.apply(this, arguments);

                // Initialise la navigation
                this.getRouter().initialize();

                // ---------------------------------------------
                // MODÈLE ODATA DES CLIENTS ET DES RÉSERVATIONS
                // ---------------------------------------------
                // Le modèle OData V4 est déclaré dans manifest.json.
                // SAPUI5 le crée automatiquement comme modèle par défaut.
                // Les données seront accessibles via /UX_Customer
                // et /UX_Booking selon les liaisons de la vue.

                // ---------------------------------------------
                // MODÈLE DE L'APPAREIL
                // ---------------------------------------------
                var oDeviceModel = new JSONModel(Device);

                // Empêche la modification du modèle de l'appareil
                oDeviceModel.setDefaultBindingMode("OneWay");

                // Rend le modèle accessible sous le nom "device"
                this.setModel(oDeviceModel, "device");

                // Informations de diagnostic
                console.log("Device system :", Device.system);
                console.log(
                    "Device model :",
                    oDeviceModel.getData().system
                );
            },

            /* =====================================================
               DENSITÉ D'AFFICHAGE DES CONTRÔLES
               ===================================================== */
            getContentDensityClass: function () {

                if (!this._sContentDensityClass) {

                    if (Device.support.touch) {
                        this._sContentDensityClass = "sapUiSizeCozy";
                    } else {
                        this._sContentDensityClass = "sapUiSizeCompact";
                    }
                }

                return this._sContentDensityClass;
            }
        }
    );
});
