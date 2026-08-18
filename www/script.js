const display = document.getElementById("display");

/* ==============================
   AJOUTER UNE VALEUR
================================ */

function appendValue(value) {

    // Si l'écran affiche une erreur, on recommence
    if (display.value === "Erreur") {
        display.value = "";
    }

    display.value += value;
}


/* ==============================
   EFFACER TOUT
================================ */

function clearDisplay() {
    display.value = "";
}


/* ==============================
   SUPPRIMER LE DERNIER CARACTÈRE
================================ */

function deleteLast() {

    if (display.value === "Erreur") {
        display.value = "";
        return;
    }

    display.value = display.value.slice(0, -1);
}


/* ==============================
   PARENTHESES
================================ */

function appendParenthesis() {

    if (display.value === "Erreur") {
        display.value = "";
    }

    const expression = display.value;

    const openCount = (expression.match(/\(/g) || []).length;
    const closeCount = (expression.match(/\)/g) || []).length;

    // Première parenthèse ou après un opérateur
    if (
        expression === "" ||
        /[+\-*/%^(]$/.test(expression)
    ) {
        display.value += "(";
    }

    // Fermer si une parenthèse est ouverte
    else if (openCount > closeCount) {
        display.value += ")";
    }

    // Sinon ouvrir une nouvelle parenthèse
    else {
        display.value += "*(";
    }
}


/* ==============================
   PRÉPARER L'EXPRESSION
================================ */

function prepareExpression(expression) {

    // Remplace les pourcentages
    expression = expression.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    return expression;
}


/* ==============================
   CALCUL
================================ */

function calculate() {

    if (display.value === "") {
        return;
    }

    try {

        let expression = display.value;

        expression = prepareExpression(expression);

        // Vérification basique des caractères autorisés
        if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
            throw new Error("Expression invalide");
        }

        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Résultat invalide");
        }

        display.value = formatResult(result);

    } catch {

        display.value = "Erreur";
    }
}


/* ==============================
   RACINE CARRÉE
================================ */

function squareRoot() {

    if (display.value === "" || display.value === "Erreur") {
        return;
    }

    try {

        const value = evaluateCurrentExpression();

        if (value < 0) {
            throw new Error("Racine négative");
        }

        display.value = formatResult(Math.sqrt(value));

    } catch {

        display.value = "Erreur";
    }
}


/* ==============================
   CARRÉ
================================ */

function square() {

    if (display.value === "" || display.value === "Erreur") {
        return;
    }

    try {

        const value = evaluateCurrentExpression();

        display.value = formatResult(value * value);

    } catch {

        display.value = "Erreur";
    }
}


/* ==============================
   INVERSE 1/x
================================ */

function inverse() {

    if (display.value === "" || display.value === "Erreur") {
        return;
    }

    try {

        const value = evaluateCurrentExpression();

        if (value === 0) {
            throw new Error("Division par zéro");
        }

        display.value = formatResult(1 / value);

    } catch {

        display.value = "Erreur";
    }
}


/* ==============================
   CHANGER LE SIGNE
================================ */

function toggleSign() {

    if (display.value === "" || display.value === "Erreur") {
        return;
    }

    try {

        const value = evaluateCurrentExpression();

        display.value = formatResult(value * -1);

    } catch {

        display.value = "Erreur";
    }
}


/* ==============================
   ÉVALUER L'EXPRESSION COURANTE
================================ */

function evaluateCurrentExpression() {

    let expression = display.value;

    expression = prepareExpression(expression);

    if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
        throw new Error("Expression invalide");
    }

    const result = Function(
        '"use strict"; return (' + expression + ')'
    )();

    if (!Number.isFinite(result)) {
        throw new Error("Résultat invalide");
    }

    return result;
}


/* ==============================
   FORMATAGE DU RÉSULTAT
================================ */

function formatResult(result) {

    // Évite les longues décimales
    if (Number.isInteger(result)) {
        return result.toString();
    }

    return parseFloat(result.toFixed(10)).toString();
}
