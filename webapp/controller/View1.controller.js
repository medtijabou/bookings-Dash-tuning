
sap.ui.define([
    // Contrôleur de base de SAPUI5
    "sap/ui/core/mvc/Controller",

    // Permet d'afficher des messages temporaires à l'écran
    "sap/m/MessageToast",

    // Permet de charger et de gérer les fragments XML
    "sap/ui/core/Fragment",

    // Permet d'appliquer la classe CSS de densité aux dialogues
    "sap/ui/core/syncStyleClass"
], function (Controller, MessageToast, Fragment, syncStyleClass) {
    "use strict"; // Active le mode strict de JavaScript

    // Création du contrôleur associé à la vue View1
    return Controller.extend(
        "etudiant14.sap.training.helloworld.controller.View1",
        {

            /**
             * onInit()
             * Fonction appelée lors de l'initialisation du contrôleur.
             * Elle est vide pour le moment.
             */
            onInit: function () {
            },

            /**
             * onButtonPress()
             * Fonction exécutée lorsque l'utilisateur clique sur le bouton.
             */
            onButtonPress: function () {
                // Affiche un message temporaire de confirmation
                MessageToast.show("Bonjour ! Le bouton fonctionne.");
            },

            /**
             * onSave()
             * Charge le fragment de dialogue s'il n'existe pas encore,
             * puis ouvre ce dialogue.
             *
             * async permet d'utiliser await pour attendre son chargement.
             */
            onSave: async function () {

                // Vérifie si le dialogue n'a pas encore été créé
                if (!this._oDialog) {

                    // Charge le fragment XML Dialog et attend sa création
                    this._oDialog = await this.loadFragment({
                        name: "etudiant14.sap.training.helloworld.view.Dialog"
                    });

                    // Applique au dialogue la même densité d'affichage
                    // que celle utilisée par la vue principale
                    syncStyleClass(
                        this.getOwnerComponent().getContentDensityClass(),
                        this.getView(),
                        this._oDialog
                    );
                }

                // Ouvre le dialogue, qu'il soit nouvellement chargé
                // ou déjà disponible
                this._oDialog.open();
            },

            /**
             * onCloseDialog()
             * Ferme le dialogue lorsque cette fonction est appelée.
             */
            onCloseDialog: function () {

                // Ferme le dialogue précédemment chargé
                this._oDialog.close();
            }

        }
    );
});
