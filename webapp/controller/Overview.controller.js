// Importation des modules nécessaires à SAPUI5
sap.ui.define([
    "sap/ui/core/mvc/Controller",       // Contrôleur de base SAPUI5
    "sap/ui/model/json/JSONModel",      // Modèle JSON pour les données du formulaire
    "sap/ui/model/Filter",              // Création de filtres
    "sap/ui/model/FilterOperator",      // Opérateurs de filtrage
    "sap/ui/model/Sorter",              // Création de critères de tri
    "sap/m/MessageToast"                // Affichage de messages temporaires
], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    Sorter,
    MessageToast
) {
    "use strict"; // Active le mode strict JavaScript

    // Création du contrôleur de la vue Overview
    return Controller.extend(
        "etudiant14.sap.training.helloworld.controller.Overview",
        {
            /**
             * onInit()
             * Fonction exécutée lors de l'initialisation du contrôleur.
             * Elle crée le modèle utilisé par le formulaire client.
             */
            onInit: function () {
                // Création d'un modèle JSON vide
                var oModel = new JSONModel();

                // Association du modèle à la vue sous le nom "customer"
                // Les champs du formulaire utilisent ce modèle.
                this.getView().setModel(oModel, "customer");

                // Récupération du tableau des clients par son identifiant XML
                var oTable = this.byId("customerTable");

                // Exécution de cette fonction une seule fois,
                // lorsque le tableau a terminé sa première mise à jour.
                oTable.attachEventOnce("updateFinished", function () {
                    // Récupération de la liaison de données des lignes
                    var oBinding = oTable.getBinding("items");

                    // Vérification que la liaison existe
                    if (oBinding) {
                        // Application du comparateur numérique personnalisé
                        oBinding.sort(this.createIdSorter());
                    }
                }.bind(this)); // Conserve le contexte du contrôleur dans la fonction
            },

            /**
             * createIdSorter()
             * Crée un critère de tri pour les numéros de clients.
             */
            createIdSorter: function () {
                return new Sorter(
                    "CustomerNumber", // Propriété utilisée pour le tri
                    false,             // Tri croissant
                    false,             // Pas de regroupement
                    function (a, b) {
                        // Conversion des numéros en valeurs numériques
                        var nA = Number(a);
                        var nB = Number(b);

                        // Si le premier numéro est inférieur au second
                        if (nA < nB) {
                            return -1;
                        }

                        // Si le premier numéro est supérieur au second
                        if (nA > nB) {
                            return 1;
                        }

                        // Les deux numéros sont égaux
                        return 0;
                    }
                );
            },

            /**
             * onSave()
             * Récupère les données du formulaire et crée un client
             * dans le tableau lié au service OData.
             */
            onSave: function () {
                // Récupération des données saisies dans le formulaire
                var oModelData = this.getView()
                    .getModel("customer")
                    .getData();

                // Récupération des traductions de l'application
                var oResourceBundle = this.getView()
                    .getModel("i18n")
                    .getResourceBundle();

                // Si aucune remise n'a été renseignée, utiliser 0
                if (oModelData.Discount === undefined) {
                    oModelData.Discount = 0;
                }

                // Création d'un nouvel enregistrement via la liaison OData
                this.byId("customerTable")
                    .getBinding("items")
                    .create({
                        Form: oModelData.Form,
                        CustomerName: oModelData.CustomerName,
                        Discount: oModelData.Discount + "",
                        Street: oModelData.Street,
                        PostCode: oModelData.PostCode,
                        City: oModelData.City,
                        Country: oModelData.Country,
                        Email: oModelData.Email,
                        Telephone: oModelData.Telephone
                    })
                    // Attendre la confirmation de création
                    .created()
                    .then(function () {
                        // Afficher le message traduit de confirmation
                        MessageToast.show(
                            oResourceBundle.getText(
                                "customerCreatedMessage"
                            )
                        );
                    });
            },

            /**
             * onCustomerChange()
             * Réagit à la sélection d'un client.
             * Associe le contexte du client sélectionné au tableau
             * de ses réservations.
             */
            onCustomerChange: function (oEvent) {
                // Récupération de la ligne sélectionnée
                var oListItem = oEvent.getParameter("listItem");

                // Arrêter la fonction si aucune ligne n'est sélectionnée
                if (!oListItem) {
                    return;
                }

                // Récupération du contexte de données de la ligne
                var oBindingContext = oListItem.getBindingContext();

                // Arrêter la fonction si le contexte est absent
                if (!oBindingContext) {
                    return;
                }

                // Récupération du tableau des réservations
                var oBookingTable = this.byId("bookingTable");

                // Le tableau des réservations utilise le client sélectionné
                // comme contexte pour sa liaison "_Bookings".
                oBookingTable.setBindingContext(oBindingContext);

                // Affichage d'informations de diagnostic dans la console
                console.log(
                    "Client sélectionné :",
                    oBindingContext.getPath()
                );
                console.log(
                    "CustomerNumber :",
                    oBindingContext.getProperty("CustomerNumber")
                );
                console.log(
                    "Bookings path :",
                    oBookingTable.getBinding("items")?.getPath()
                );
            },

            /**
             * onShowCustomerDetails()
             * Ouvre la page Detail correspondant au client sélectionné.
             */
            onShowCustomerDetails: function (oEvent) {
                // Récupération du contexte de données du bouton cliqué
                var oContext = oEvent.getSource().getBindingContext();

                // Vérification de la présence du contexte
                if (!oContext) {
                    return;
                }

                // Récupération de l'identifiant unique du client
                var sCustomerGuid = oContext.getProperty("CustomerGuid");

                // Arrêter si l'identifiant est absent
                if (!sCustomerGuid) {
                    return;
                }

                // Navigation vers la route RouteDetail
                // en transmettant l'identifiant du client dans l'URL
                this.getOwnerComponent()
                    .getRouter()
                    .navTo("RouteDetail", {
                        customerId: sCustomerGuid
                    });
            },

            /**
             * onFilterCustomers()
             * Filtre le tableau des clients selon le nom recherché.
             */
            onFilterCustomers: function (oEvent) {
                // Récupération du texte saisi dans le champ de recherche
                var sQuery = oEvent.getParameter("query");

                // Tableau qui contiendra les filtres à appliquer
                var aFilters = [];

                // Créer un filtre uniquement si la recherche n'est pas vide
                if (sQuery && sQuery.length > 0) {
                    aFilters.push(
                        new Filter(
                            "CustomerName",       // Propriété à rechercher
                            FilterOperator.Contains, // Contient le texte saisi
                            sQuery                // Texte recherché
                        )
                    );
                }

                // Récupération du tableau des clients
                var oTable = this.byId("customerTable");

                // Récupération de sa liaison de données
                var oBinding = oTable.getBinding("items");

                // Application du filtre au tableau
                oBinding.filter(aFilters);
            }
        }
    );
});