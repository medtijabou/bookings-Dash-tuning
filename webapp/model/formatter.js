sap.ui.define([
    "sap/base/i18n/ResourceBundle"
], function (ResourceBundle) {
    "use strict";

    // Charge le fichier de traductions de l'application
    var oResourceBundle = ResourceBundle.create({
        url: sap.ui.require.toUrl(
            "etudiant14/sap/training/helloworld/i18n/i18n.properties"
        )
    });

    return {
        // Traduit le code de la classe du vol
        classText: function (sClass) {
            switch (sClass) {
                case "C":
                    return oResourceBundle.getText("flightClassC");

                case "Y":
                    return oResourceBundle.getText("flightClassY");

                case "F":
                    return oResourceBundle.getText("flightClassF");

                default:
                    return sClass;
            }
        }
    };
});