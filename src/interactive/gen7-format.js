/* Gen7 formatting helpers — texte/unicode uniquement (pas de KaTeX), cohérent avec le
 * style du chapitre (voir .mexpr dans l'artefact). Module pur, testable sous Node. */
(function (root) {
  "use strict";
  var Fmt = {};

  function formatNombreFr(n) {
    var arrondi = Math.round(n * 1000) / 1000;
    var s = arrondi.toString().replace(".", ",");
    return s.replace("-", "−");
  }

  /** Formate un terme isolé ("a"->coefficient*x², "b"->coefficient*x, "c"->constante). */
  function formatTerme(type, valeur) {
    var abs = Math.abs(valeur);
    if (type === "a") return (abs === 1 ? "" : formatNombreFr(abs)) + "x²";
    if (type === "b") return (abs === 1 ? "" : formatNombreFr(abs)) + "x";
    return formatNombreFr(abs);
  }

  /** f(x) = ... en n'affichant QUE les termes non nuls, dans l'ordre fourni (ordreTermes,
   * potentiellement mélangé — c'est le but pédagogique de l'écran "coefficients"). */
  function formatFonctionOrdre(enonce, ordreTermes) {
    if (ordreTermes.length === 0) return "f(x) = 0";
    var morceaux = [];
    ordreTermes.forEach(function (type, i) {
      var valeur = enonce[type];
      var signe = valeur < 0 ? "−" : (i === 0 ? "" : "+");
      morceaux.push((i === 0 ? signe : " " + signe + " ") + formatTerme(type, valeur));
    });
    return "f(x) = " + morceaux.join("");
  }

  /** Forme canonique colorée (aide écran 1) : TOUJOURS les 3 termes a,b,c dans cet ordre,
   * même si nuls — chaque terme porte une couleur fixe (a=rose, b=bleu, c=vert). */
  var COULEUR_A = "#c2255c", COULEUR_B = "#1864ab", COULEUR_C = "#2b8a3e";
  function formatCanoniqueColoreHtml(enonce) {
    var termes = [
      { type: "a", couleur: COULEUR_A },
      { type: "b", couleur: COULEUR_B },
      { type: "c", couleur: COULEUR_C }
    ];
    var html = "f(x) = ";
    termes.forEach(function (t, i) {
      var valeur = enonce[t.type];
      var signe = valeur < 0 ? "−" : (i === 0 ? "" : "+");
      var corps = formatTerme(t.type, valeur);
      html += (i === 0 ? signe : " " + signe + " ") + '<span style="color:' + t.couleur + ';font-weight:700;">' + corps + "</span>";
    });
    return html;
  }

  /** ax²+bx+c = 0, toujours dans cet ordre canonique (écrans racines). */
  function formatEquationCanonique(enonce) {
    var ordre = ["a", "b", "c"].filter(function (t) { return enonce[t] !== 0; });
    if (ordre.length === 0) return "0 = 0";
    var morceaux = [];
    ordre.forEach(function (type, i) {
      var valeur = enonce[type];
      var signe = valeur < 0 ? "−" : (i === 0 ? "" : "+");
      morceaux.push((i === 0 ? signe : " " + signe + " ") + formatTerme(type, valeur));
    });
    return morceaux.join("") + " = 0";
  }

  /** Aperçu texte d'un intervalle en cours de construction (notation française : crochet
   * "[" à gauche = fermé, "]" à gauche = ouvert ; inverse à droite). "?" si valeur absente. */
  function formatApercuIntervalle(morceau) {
    var texteGauche = morceau.borneGauche === "-inf" ? "−∞" : (typeof morceau.borneGauche === "number" ? formatNombreFr(morceau.borneGauche) : "?");
    var texteDroite = morceau.borneDroite === "+inf" ? "+∞" : (typeof morceau.borneDroite === "number" ? formatNombreFr(morceau.borneDroite) : "?");
    return morceau.crochetGauche + texteGauche + " ; " + texteDroite + morceau.crochetDroit;
  }

  Fmt.formatNombreFr = formatNombreFr;
  Fmt.formatTerme = formatTerme;
  Fmt.formatFonctionOrdre = formatFonctionOrdre;
  Fmt.formatCanoniqueColoreHtml = formatCanoniqueColoreHtml;
  Fmt.formatEquationCanonique = formatEquationCanonique;
  Fmt.formatApercuIntervalle = formatApercuIntervalle;

  root.Gen7Format = Fmt;
})(window);

