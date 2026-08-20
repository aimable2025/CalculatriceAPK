/* ============================================================
   CALCULATRICE
   ============================================================ */


/* ============================================================
   ÉLÉMENTS DE L'INTERFACE
============================================================ */

const display = document.getElementById("display");

let resultDisplayed = false;


/* ============================================================
   RÉSULTAT PRÉVISIONNEL
   ------------------------------------------------------------
   Une petite zone est créée automatiquement sous l'écran.
   Exemple :

       2+3*4
             ≈ 14
============================================================ */

let liveResult = document.getElementById("liveResult");

if (!liveResult) {

    liveResult = document.createElement("div");

    liveResult.id = "liveResult";

    liveResult.style.width = "100%";
    liveResult.style.minHeight = "22px";
    liveResult.style.marginTop = "-8px";
    liveResult.style.marginBottom = "10px";
    liveResult.style.padding = "0 8px";

    liveResult.style.textAlign = "right";

    liveResult.style.fontSize = "17px";
    liveResult.style.fontWeight = "600";

    liveResult.style.color = "#697386";

    liveResult.style.overflow = "hidden";
    liveResult.style.whiteSpace = "nowrap";
    liveResult.style.textOverflow = "ellipsis";

    display.parentNode.insertBefore(
        liveResult,
        display.nextSibling
    );
}


/* ============================================================
   AJOUTER UNE VALEUR
============================================================ */

function appendValue(value) {

    /*
       Si un résultat vient d'être affiché avec "="
       et que l'utilisateur commence par un nombre,
       on démarre un nouveau calcul.
    */
    if (resultDisplayed) {

        if (
            /^[0-9.]$/.test(value) ||
            value === "√"
        ) {
            display.value = "";
        }

        resultDisplayed = false;
    }

    display.value += value;

    updateLiveResult();
}


/* ============================================================
   EFFACER
============================================================ */

function clearDisplay() {

    display.value = "";

    resultDisplayed = false;

    liveResult.textContent = "";
}


/* ============================================================
   SUPPRIMER LE DERNIER CARACTÈRE
============================================================ */

function deleteLast() {

    if (display.value === "Erreur") {

        clearDisplay();

        return;
    }

    display.value =
        display.value.slice(0, -1);

    resultDisplayed = false;

    updateLiveResult();
}


/* ============================================================
   PARENTHESES
============================================================ */

function appendParenthesis() {

    if (display.value === "Erreur") {
        display.value = "";
    }

    const expression = display.value;

    const openCount =
        (expression.match(/\(/g) || []).length;

    const closeCount =
        (expression.match(/\)/g) || []).length;


    if (
        expression === "" ||
        /[+\-*/%^√(]$/.test(expression)
    ) {

        display.value += "(";

    }

    else if (openCount > closeCount) {

        display.value += ")";

    }

    else {

        display.value += "*(";
    }

    resultDisplayed = false;

    updateLiveResult();
}


/* ============================================================
   PRÉPARER L'EXPRESSION
============================================================ */

function prepareExpression(expression) {

    expression = expression.replace(/\s+/g, "");


    /*
       Pourcentage :

       25% → (25/100)
    */
    expression = expression.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );


    /*
       Racine carrée :

       √9 → Math.sqrt(9)

       √25 → Math.sqrt(25)

       2+√9 → 2+Math.sqrt(9)

       √(9+16) → Math.sqrt(9+16)
    */
    let previous;

    do {

        previous = expression;

        expression = expression.replace(
            /√(\d+(?:\.\d+)?|\([^()]*\))/g,
            "Math.sqrt($1)"
        );

    } while (expression !== previous);


    /*
       Puissance :

       2^3 → 2**3
    */
    expression =
        expression.replace(/\^/g, "**");


    return expression;
}


/* ============================================================
   ÉVALUER UNE EXPRESSION
============================================================ */

function evaluateExpression(expression) {

    if (!expression) {
        throw new Error("Expression vide");
    }

    let prepared =
        prepareExpression(expression);


    /*
       Sécurité :
       on retire Math.sqrt avant de vérifier les caractères.
    */
    const testExpression =
        prepared.replace(/Math\.sqrt/g, "");


    if (
        !/^[0-9+\-*/().%\s*]+$/.test(
            testExpression
        )
    ) {

        throw new Error(
            "Expression invalide"
        );
    }


    const result =
        Function(
            '"use strict"; return (' +
            prepared +
            ')'
        )();


    if (!Number.isFinite(result)) {

        throw new Error(
            "Résultat invalide"
        );
    }


    return result;
}


/* ============================================================
   CALCUL AUTOMATIQUE
============================================================ */

function updateLiveResult() {

    if (!liveResult) {
        return;
    }

    const expression =
        display.value;


    if (
        expression === "" ||
        expression === "Erreur"
    ) {

        liveResult.textContent = "";

        return;
    }


    try {

        const result =
            evaluateExpression(
                expression
            );


        if (Number.isFinite(result)) {

            liveResult.textContent =
                "≈ " +
                formatResult(result);

        } else {

            liveResult.textContent = "";
        }

    } catch {

        /*
           Une expression incomplète n'affiche
           simplement aucun résultat.
        */

        liveResult.textContent = "";
    }
}


/* ============================================================
   CALCUL FINAL =
============================================================ */

function calculate() {

    if (
        display.value === "" ||
        display.value === "Erreur"
    ) {
        return;
    }


    try {

        const result =
            evaluateExpression(
                display.value
            );


        display.value =
            formatResult(result);


        resultDisplayed = true;

        liveResult.textContent = "";

    } catch {

        display.value = "Erreur";

        resultDisplayed = true;

        liveResult.textContent = "";
    }
}


/* ============================================================
   RACINE CARRÉE
============================================================ */

function squareRoot() {

    appendValue("√");
}


/* ============================================================
   ÉVALUATION COURANTE
============================================================ */

function evaluateCurrentExpression() {

    return evaluateExpression(
        display.value
    );
}


/* ============================================================
   FORMATAGE
============================================================ */

function formatResult(result) {

    /*
       On conserve toute la précision disponible
       pour les divisions décimales.
    */

    if (Number.isInteger(result)) {

        return result.toString();
    }

    return result.toString();
}

/* ============================================================
   ============================================================
   FENÊTRE FX — FONCTIONS DE TYPE EXCEL
   ============================================================
   
   Fonctionnement :

   1. L'utilisateur appuie sur FX
   2. Il choisit une fonction
   3. Le formulaire correspondant apparaît
   4. Il saisit les arguments
   5. Il appuie sur "Calculer"
   6. Le résultat revient dans l'écran principal

   Fonctions disponibles :

   SOMME
   MOYENNE
   MIN
   MAX
   NB
   SI
   PRODUIT
   DIVISION
   QUOTIENT
============================================================ */


/* ============================================================
   OUVRIR LA FENÊTRE FX
============================================================ */

function showFxMenu() {

    const overlay =
        document.getElementById("fxOverlay");

    const menu =
        document.getElementById("fxFunctionMenu");

    const form =
        document.getElementById("fxForm");

    const cancel =
        document.querySelector(".fx-cancel");


    if (!overlay) {
        return;
    }


    overlay.style.display = "flex";


    /*
       Lorsque la fenêtre s'ouvre,
       on affiche toujours la liste des fonctions.
    */

    if (menu) {
        menu.style.display = "flex";
    }


    if (form) {
        form.style.display = "none";
    }


    if (cancel) {
        cancel.style.display = "block";
    }
}


/* ============================================================
   FERMER LA FENÊTRE FX
============================================================ */

function closeFxMenu(event) {

    const overlay =
        document.getElementById("fxOverlay");


    /*
       Si on clique à l'intérieur de la fenêtre,
       on ne ferme pas la fenêtre.
    */

    if (
        event &&
        event.target !== overlay
    ) {
        return;
    }


    if (overlay) {

        overlay.style.display = "none";
    }
}


/* ============================================================
   CHOISIR UNE FONCTION
============================================================ */

function selectFxFunction(functionName) {

    const menu =
        document.getElementById(
            "fxFunctionMenu"
        );

    const form =
        document.getElementById(
            "fxForm"
        );

    const title =
        document.getElementById(
            "fxTitle"
        );

    const functionNameElement =
        document.getElementById(
            "fxFunctionName"
        );

    const description =
        document.getElementById(
            "fxDescription"
        );

    const argumentsContainer =
        document.getElementById(
            "fxArguments"
        );

    const result =
        document.getElementById(
            "fxFunctionResult"
        );

    const cancel =
        document.querySelector(
            ".fx-cancel"
        );


    if (
        !menu ||
        !form ||
        !argumentsContainer
    ) {
        return;
    }


    /*
       Cacher le menu des fonctions.
    */

    menu.style.display = "none";


    /*
       Afficher le formulaire.
    */

    form.style.display = "block";


    /*
       Modifier le titre.
    */

    if (title) {
        title.textContent =
            functionName;
    }


    if (functionNameElement) {
        functionNameElement.textContent =
            functionName;
    }


    /*
       Effacer les anciens champs.
    */

    argumentsContainer.innerHTML = "";


    /*
       Cacher l'ancien résultat.
    */

    if (result) {

        result.style.display = "none";

        result.textContent = "";
    }


    /*
       ANNULER reste disponible.
    */

    if (cancel) {
        cancel.style.display = "block";
    }


    /*
       Créer les champs selon la fonction.
    */

    switch (functionName) {


        /* ====================================================
           SOMME
        ==================================================== */

        case "SOMME":

            if (description) {

                description.textContent =
                    "Entrez les valeurs à additionner. Séparez-les par des virgules.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "10, 20, 30, 40"
            );

            break;


        /* ====================================================
           MOYENNE
        ==================================================== */

        case "MOYENNE":

            if (description) {

                description.textContent =
                    "Entrez les valeurs dont vous voulez calculer la moyenne.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "10, 20, 30, 40"
            );

            break;


        /* ====================================================
           MIN
        ==================================================== */

        case "MIN":

            if (description) {

                description.textContent =
                    "Entrez les valeurs parmi lesquelles rechercher la plus petite.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "10, 20, 5, 40"
            );

            break;


        /* ====================================================
           MAX
        ==================================================== */

        case "MAX":

            if (description) {

                description.textContent =
                    "Entrez les valeurs parmi lesquelles rechercher la plus grande.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "10, 20, 50, 40"
            );

            break;


        /* ====================================================
           NB
        ==================================================== */

        case "NB":

            if (description) {

                description.textContent =
                    "Entrez les valeurs à compter.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "10, 20, 30, 40"
            );

            break;


        /* ====================================================
           PRODUIT
        ==================================================== */

        case "PRODUIT":

            if (description) {

                description.textContent =
                    "Entrez les valeurs à multiplier.";
            }


            createMultiValueInput(
                argumentsContainer,
                "Valeurs",
                "2, 3, 4"
            );

            break;


        /* ====================================================
           DIVISION
        ==================================================== */

        case "DIVISION":

            if (description) {

                description.textContent =
                    "Entrez le dividende et le diviseur.";
            }


            createSingleInput(
                argumentsContainer,
                "Dividende",
                "10",
                "fxDividend"
            );


            createSingleInput(
                argumentsContainer,
                "Diviseur",
                "3",
                "fxDivisor"
            );

            break;


        /* ====================================================
           QUOTIENT
        ==================================================== */

        case "QUOTIENT":

            if (description) {

                description.textContent =
                    "Retourne uniquement la partie entière d'une division.";
            }


            createSingleInput(
                argumentsContainer,
                "Dividende",
                "10",
                "fxDividend"
            );


            createSingleInput(
                argumentsContainer,
                "Diviseur",
                "3",
                "fxDivisor"
            );

            break;


        /* ====================================================
           SI
        ==================================================== */

        case "SI":

            if (description) {

                description.textContent =
                    "Entrez une condition et les deux résultats possibles.";
            }


            createSingleInput(
                argumentsContainer,
                "Condition",
                "10 > 5",
                "fxCondition"
            );


            createSingleInput(
                argumentsContainer,
                "Si VRAI",
                "100",
                "fxTrue"
            );


            createSingleInput(
                argumentsContainer,
                "Si FAUX",
                "0",
                "fxFalse"
            );

            break;
    }


    /*
       Placer automatiquement le curseur
       dans le premier champ.
    */

    const firstInput =
        argumentsContainer.querySelector(
            "input"
        );


    if (firstInput) {

        setTimeout(
            () => firstInput.focus(),
            100
        );
    }
}


/* ============================================================
   CRÉER UN CHAMP POUR UNE SEULE VALEUR
============================================================ */

function createSingleInput(
    container,
    label,
    placeholder,
    id
) {

    const group =
        document.createElement("div");

    group.className =
        "fx-input-group";


    const labelElement =
        document.createElement("label");

    labelElement.textContent =
        label;


    const input =
        document.createElement("input");

    input.type = "text";

    input.id = id;

    input.className =
        "fx-input";

    input.placeholder =
        placeholder;

    input.autocomplete = "off";


    group.appendChild(
        labelElement
    );

    group.appendChild(
        input
    );


    container.appendChild(
        group
    );
}


/* ============================================================
   CRÉER UN CHAMP POUR PLUSIEURS VALEURS
   ------------------------------------------------------------
   Exemple :

   10, 20, 30, 40
============================================================ */

function createMultiValueInput(
    container,
    label,
    placeholder
) {

    const group =
        document.createElement("div");

    group.className =
        "fx-input-group";


    const labelElement =
        document.createElement("label");

    labelElement.textContent =
        label;


    const input =
        document.createElement("input");

    input.type = "text";

    input.id = "fxValues";

    input.className =
        "fx-input";

    input.placeholder =
        placeholder;

    input.autocomplete = "off";


    group.appendChild(
        labelElement
    );

    group.appendChild(
        input
    );


    container.appendChild(
        group
    );
}


/* ============================================================
   CONVERTIR UNE LISTE DE VALEURS EN NOMBRES
============================================================ */

function parseFxValues(value) {

    /*
       On accepte :

       10,20,30
       10, 20, 30
       10;20;30
       10 20 30

       Les séparateurs virgule, point-virgule
       et espace sont acceptés.
    */

    const parts =
        value
            .split(/[,;]+/)
            .map(
                item => item.trim()
            )
            .filter(
                item => item !== ""
            );


    if (parts.length === 0) {

        throw new Error(
            "Aucune valeur saisie."
        );
    }


    const numbers =
        parts.map(
            item => {

                const number =
                    Number(
                        item.replace(",", ".")
                    );


                if (
                    !Number.isFinite(
                        number
                    )
                ) {

                    throw new Error(
                        "Valeur invalide : " +
                        item
                    );
                }


                return number;
            }
        );


    return numbers;
}


/* ============================================================
   CALCULER LA FONCTION FX
============================================================ */

function calculateFxFunction() {

    const functionNameElement =
        document.getElementById(
            "fxFunctionName"
        );


    const resultElement =
        document.getElementById(
            "fxFunctionResult"
        );


    if (!functionNameElement) {
        return;
    }


    const functionName =
        functionNameElement.textContent
            .trim()
            .toUpperCase();


    try {

        let result;


        /* ====================================================
           SOMME
        ==================================================== */

        if (
            functionName === "SOMME"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                values.reduce(
                    (total, value) =>
                        total + value,
                    0
                );
        }


        /* ====================================================
           MOYENNE
        ==================================================== */

        else if (
            functionName === "MOYENNE"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                values.reduce(
                    (total, value) =>
                        total + value,
                    0
                ) / values.length;
        }


        /* ====================================================
           MIN
        ==================================================== */

        else if (
            functionName === "MIN"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                Math.min(
                    ...values
                );
        }


        /* ====================================================
           MAX
        ==================================================== */

        else if (
            functionName === "MAX"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                Math.max(
                    ...values
                );
        }


        /* ====================================================
           NB
           ----------------------------------------------------
           Compte le nombre de valeurs numériques.
        ==================================================== */

        else if (
            functionName === "NB"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                values.length;
        }


        /* ====================================================
           PRODUIT
        ==================================================== */

        else if (
            functionName === "PRODUIT"
        ) {

            const input =
                document.getElementById(
                    "fxValues"
                );


            const values =
                parseFxValues(
                    input.value
                );


            result =
                values.reduce(
                    (total, value) =>
                        total * value,
                    1
                );
        }


        /* ====================================================
           DIVISION
           ----------------------------------------------------
           Exemple :

           10 ÷ 3

           → 3.3333333333333335
        ==================================================== */

        else if (
            functionName === "DIVISION"
        ) {

            const dividend =
                Number(
                    document.getElementById(
                        "fxDividend"
                    ).value
                );


            const divisor =
                Number(
                    document.getElementById(
                        "fxDivisor"
                    ).value
                );


            if (
                !Number.isFinite(
                    dividend
                ) ||
                !Number.isFinite(
                    divisor
                )
            ) {

                throw new Error(
                    "Entrez des nombres valides."
                );
            }


            if (divisor === 0) {

                throw new Error(
                    "Division par zéro impossible."
                );
            }


            result =
                dividend / divisor;
        }


        /* ====================================================
           QUOTIENT
           ----------------------------------------------------
           Exemple :

           10 ÷ 3

           → 3
        ==================================================== */

        else if (
            functionName === "QUOTIENT"
        ) {

            const dividend =
                Number(
                    document.getElementById(
                        "fxDividend"
                    ).value
                );


            const divisor =
                Number(
                    document.getElementById(
                        "fxDivisor"
                    ).value
                );


            if (
                !Number.isFinite(
                    dividend
                ) ||
                !Number.isFinite(
                    divisor
                )
            ) {

                throw new Error(
                    "Entrez des nombres valides."
                );
            }


            if (divisor === 0) {

                throw new Error(
                    "Division par zéro impossible."
                );
            }


            /*
               Math.trunc() supprime la partie décimale.
            */

            result =
                Math.trunc(
                    dividend / divisor
                );
        }


        /* ====================================================
           SI
           ----------------------------------------------------
           Exemple :

           Condition : 10 > 5
           Si VRAI   : 100
           Si FAUX   : 0

           → 100
        ==================================================== */

        else if (
            functionName === "SI"
        ) {

            const condition =
                document.getElementById(
                    "fxCondition"
                ).value.trim();


            const valueTrue =
                document.getElementById(
                    "fxTrue"
                ).value;


            const valueFalse =
                document.getElementById(
                    "fxFalse"
                ).value;


            if (!condition) {

                throw new Error(
                    "Entrez une condition."
                );
            }


            /*
               Évaluation de la condition.

               Exemples acceptés :

               10 > 5
               10 < 5
               10 === 10
               10 !== 5
            */

            const conditionResult =
                Function(
                    '"use strict"; return (' +
                    condition +
                    ')'
                )();


            result =
                conditionResult
                    ? valueTrue
                    : valueFalse;
        }


        /* ====================================================
           FONCTION INCONNUE
        ==================================================== */

        else {

            throw new Error(
                "Fonction inconnue."
            );
        }


        /* ====================================================
           VÉRIFICATION DU RÉSULTAT
        ==================================================== */

        if (
            typeof result === "number" &&
            !Number.isFinite(result)
        ) {

            throw new Error(
                "Résultat invalide."
            );
        }


        /*
           Pour une division, on ne tronque surtout pas
           les décimales.
        */

        const formattedResult =
            typeof result === "number"
                ? formatFxResult(result)
                : result;


        /* ====================================================
           AFFICHER LE RÉSULTAT DANS LA FENÊTRE FX
        ==================================================== */

        if (resultElement) {

            resultElement.textContent =
                "Résultat : " +
                formattedResult;

            resultElement.style.display =
                "block";
        }


        /* ====================================================
           METTRE LE RÉSULTAT DANS L'ÉCRAN PRINCIPAL
        ==================================================== */

        display.value =
            formattedResult;


        /*
           Le prochain nombre saisi commencera
           un nouveau calcul.
        */

        resultDisplayed = true;


        /*
           Effacer le résultat prévisionnel.
        */

        if (
            typeof liveResult !== "undefined" &&
            liveResult
        ) {

            liveResult.textContent = "";
        }


    } catch (error) {

        /*
           Afficher l'erreur dans la fenêtre FX
           au lieu de casser la calculatrice.
        */

        if (resultElement) {

            resultElement.textContent =
                "Erreur : " +
                error.message;

            resultElement.style.display =
                "block";
        }


        console.error(
            "Erreur fonction FX :",
            error
        );
    }
}


/* ============================================================
   FORMATAGE DES RÉSULTATS FX
   ------------------------------------------------------------
   IMPORTANT :
   On ne fait PAS de toFixed(10).

   Ainsi :

   10 / 3
   → 3.3333333333333335

   au lieu de :

   3.3333333333
============================================================ */

function formatFxResult(result) {

    if (
        Number.isInteger(result)
    ) {

        return result.toString();
    }


    return result.toString();
}


/* ============================================================
   RETOUR À LA LISTE DES FONCTIONS
============================================================ */

function backToFxFunctions() {

    const menu =
        document.getElementById(
            "fxFunctionMenu"
        );

    const form =
        document.getElementById(
            "fxForm"
        );

    const title =
        document.getElementById(
            "fxTitle"
        );

    const result =
        document.getElementById(
            "fxFunctionResult"
        );

    const cancel =
        document.querySelector(
            ".fx-cancel"
        );


    /*
       Afficher la liste.
    */

    if (menu) {

        menu.style.display = "flex";
    }


    /*
       Cacher le formulaire.
    */

    if (form) {

        form.style.display = "none";
    }


    /*
       Remettre le titre.
    */

    if (title) {

        title.textContent =
            "Fonctions";
    }


    /*
       Effacer le résultat précédent.
    */

    if (result) {

        result.style.display = "none";

        result.textContent = "";
    }


    if (cancel) {

        cancel.style.display = "block";
    }
}



            
            
