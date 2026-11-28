import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DonneesDetectiveComplexes, IdDescriptionComplexes, TypeErreurComplexes } from "../core6e/detectiveComplexes.types";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import {
  DIRECTIONS_MOIVRE,
  DIRECTIONS_RACINES,
  DIRECTIONS_TRIGO,
  angle,
  angleLatex,
  argumentsMoivre,
  carreSurd,
  champsCorrection,
  carreI,
  coefI,
  complexeEntierLatex,
  complexeLatex,
  cosSinExacts,
  copieEleve,
  indiceLigneFausse,
  nombreLignes,
  moduleMoivre,
  nomRacines,
  numerateurQuotient,
  par,
  puissanceMoivre,
  racineNegatifLatex,
  rhoRacines,
  sommeZW,
  surdLatex,
  wRacines,
  zMoivre,
  zTrigo,
} from "../moteur6e/modeleDetectiveComplexes";

/**
 * Textes de 6gen99 « Détective d'erreurs : nombres complexes » (écran ET papier : une seule
 * source). Formules toujours en LaTeX, jamais au clavier ; notation du chapitre 5 de 6e (i, z = a + bi,
 * |z| = √(a² + b²), arg z corrigé de ±π si a < 0, Moivre, z_k = ⁿ√r e^{i(θ + 2kπ)/n}).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

const INTERVALLE = "\\mathopen{]}-\\pi\\,;\\pi\\mathclose{]}";

/** Terme « coef·i » ou « coef·i² » écrit seul (« 3i », « -i^2 »). */
function terme(coef: number, symbole: string): string {
  return coef === 1 ? symbole : coef === -1 ? `-${symbole}` : `${coef}${symbole}`;
}

/** Argument d'un cos / sin avec parenthèses si négatif. */
function argTrig(latex: string): string {
  return latex.startsWith("-") ? `\\left(${latex}\\right)` : /^\d/.test(latex) ? ` ${latex}` : latex;
}

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

export function enonceExercice(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  switch (e.variante) {
    case "formeTrigo": {
      const { a, b } = zTrigo(e);
      return [t("L'élève doit écrire "), l(`z = ${complexeLatex(a, b)}`), t(" sous forme trigonométrique.")];
    }
    case "quotient": {
      const { a, b } = numerateurQuotient(e);
      return [t("L'élève doit écrire "), l(`z = \\dfrac{${complexeEntierLatex(a, b)}}{${complexeEntierLatex(e.c, e.d)}}`), t(" sous forme algébrique.")];
    }
    case "puissance":
      return [t("L'élève doit calculer "), l("z^3"), t(" sous forme algébrique pour "), l(`z = ${complexeEntierLatex(e.a, e.b)}`), t(", en passant par "), l("z^2"), t(".")];
    case "moivre": {
      const { a, b } = zMoivre(e);
      return [t("L'élève doit calculer "), l(`z^{${e.n}}`), t(" pour "), l(`z = ${complexeLatex(a, b)}`), t(" à l'aide de la formule de Moivre, puis l'écrire sous forme algébrique.")];
    }
    case "racines": {
      const { a, b } = wRacines(e);
      return [t(`L'élève doit calculer les racines ${nomRacines(e.n)} de `), l(`w = ${complexeLatex(a, b)}`), t(" et les écrire sous forme exponentielle.")];
    }
    case "moduleSomme":
      return [
        t("On donne "),
        l(`z = ${complexeEntierLatex(e.a, e.b)}`),
        t(" et "),
        l(`w = ${complexeEntierLatex(e.c, e.d)}`),
        t(". L'élève doit calculer "),
        l("|z|"),
        t(", "),
        l("|w|"),
        t(" et "),
        l("|z + w|"),
        t("."),
      ];
    case "racineProduit":
      return [t("L'élève prétend démontrer que "), l(`${e.n} = -${e.n}`), t(" à l'aide des nombres complexes.")];
  }
}

export function lignesCopie(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Réponse (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

/** La réponse, telle qu'on l'écrit dans un corrigé. */
export function reponseFragments(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  const champs = champsCorrection(e);
  const latexDe = (i: number) => champs[i]!.latex;
  switch (e.variante) {
    case "formeTrigo":
      return [l(`|z| = ${latexDe(0)}`), t(" et "), l(`\\arg z = ${latexDe(1)}`), t(", donc "), l(`z = ${latexDe(0)}\\left(\\cos${argTrig(latexDe(1))} + i\\sin${argTrig(latexDe(1))}\\right)`)];
    case "quotient":
      return [l(`z = ${latexDe(0)}`)];
    case "puissance":
      return [l(`z^3 = ${latexDe(0)}`)];
    case "moivre":
      {
      const { re, im } = puissanceMoivre(e);
      return [l(`z^{${e.n}} = ${complexeLatex(re, im)}`)];
    }
    case "racines": {
      const thetas = champs.slice(1).map((c) => c.latex);
      return [l(`|z_k| = ${latexDe(0)}`), t(" et "), l(thetas.map((th, k) => `\\theta_{${k}} = ${th}`).join(",\\; "))];
    }
    case "moduleSomme":
      return [l(`|z| = ${latexDe(0)},\\; |w| = ${latexDe(1)},\\; |z + w| = ${latexDe(2)}`)];
    case "racineProduit":
      return [l(`${champs[0]!.prefixe} ${latexDe(0)}`), t(` (et non ${e.n}) : la « démonstration » ne prouve rien.`)];
  }
}

/** Rappel de saisie (texte brut, symboles √ et π comme sur les boutons). */
export function aideSaisie(e: DonneesDetectiveComplexes): string {
  switch (e.variante) {
    case "formeTrigo":
      return "Écris le module (par exemple 6) et un argument en radians avec π (par exemple 2π/3 ou −5π/6). Les boutons √ et π complètent le champ.";
    case "quotient":
    case "puissance":
      return "Écris un nombre complexe sous forme réduite, par exemple 3 − 2i.";
    case "moivre":
      return "Écris des valeurs exactes, par exemple −64√3, 128 ou 0. Les boutons √ et π complètent le champ.";
    case "racines":
      return "Écris le module (par exemple 2) et chaque argument en radians avec π (par exemple 2π/9), dans l'ordre de ton choix.";
    case "moduleSomme":
      return "Écris des valeurs exactes, par exemple 5, √13 ou 2√5. Les boutons √ et π complètent le champ.";
    case "racineProduit":
      return "Écris un nombre réel, par exemple −4.";
  }
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  const n = indiceLigneFausse(e) + 1;
  const debut = e.variante === "racineProduit" ? `Corrige la copie : à la ligne ${n}, calcule ` : `Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne `;
  let fin: FragmentConsigne[];
  switch (e.variante) {
    case "formeTrigo":
      fin = [t("le module et un argument corrects de "), l("z"), t(" (valeurs exactes, argument en radians).")];
      break;
    case "quotient":
      fin = [l("z"), t(" sous forme algébrique "), l("a + bi"), t(".")];
      break;
    case "puissance":
      fin = [l("z^3"), t(" sous forme algébrique "), l("a + bi"), t(".")];
      break;
    case "moivre":
      fin = [t("la partie réelle et la partie imaginaire de "), l(`z^{${e.n}}`), t(" (valeurs exactes).")];
      break;
    case "racines":
      fin = [t(`le module des racines et leurs ${e.n} arguments (en radians, dans l'ordre de ton choix).`)];
      break;
    case "moduleSomme":
      fin = [l("|z|"), t(", "), l("|w|"), t(" et "), l("|z + w|"), t(" (valeurs exactes).")];
      break;
    case "racineProduit":
      fin = [t("la vraie valeur de "), l(`\\sqrt{-${e.n}} \\cdot \\sqrt{-${e.n}}`), t(" (en écrivant chaque facteur avec "), l("i"), t(").")];
      break;
  }
  return [[t("Quelle ligne de la copie est fausse ?")], [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)], souderPonctuation([t(debut), ...fin])];
}

// ---------------------------------------------------------------------------------------------
// Données utiles aux textes (par support)
// ---------------------------------------------------------------------------------------------

function ctxTrigo(e: Extract<DonneesDetectiveComplexes, { variante: "formeTrigo" }>) {
  const dir = DIRECTIONS_TRIGO[e.dir]!;
  const { a, b } = zTrigo(e);
  const A = carreSurd(a);
  const B = carreSurd(b);
  return { dir, aL: surdLatex(a), bL: surdLatex(b), A, B, r: 2 * e.k, haut: b.n > 0 };
}

function ctxQuotient(e: Extract<DonneesDetectiveComplexes, { variante: "quotient" }>) {
  const { a, b } = numerateurQuotient(e);
  return {
    a,
    b,
    numL: complexeEntierLatex(a, b),
    conjNumL: complexeEntierLatex(a, -b),
    denL: complexeEntierLatex(e.c, e.d),
    conjL: complexeEntierLatex(e.c, -e.d),
    /** Coefficient de i² dans le développement de la copie (le facteur de la ligne 1 est correct). */
    bf: -b * e.d,
  };
}

function ctxPuissance(e: Extract<DonneesDetectiveComplexes, { variante: "puissance" }>) {
  const { a, b } = e;
  const P = a * a - b * b;
  const Q = 2 * a * b;
  return { a, b, zL: complexeEntierLatex(a, b), bi: coefI(b), P, Q, PQ: complexeEntierLatex(P, Q) };
}

function ctxMoivre(e: Extract<DonneesDetectiveComplexes, { variante: "moivre" }>) {
  const dir = DIRECTIONS_MOIVRE[e.dir]!;
  const r = moduleMoivre(e);
  const { phi, theta, thetaFaux, sens } = argumentsMoivre(e);
  const { cos, sin } = cosSinExacts(theta);
  return { dir, r, n: e.n, phi, theta, thetaFaux, sens, cos, sin, R: r ** e.n };
}

function ctxRacines(e: Extract<DonneesDetectiveComplexes, { variante: "racines" }>) {
  const dir = DIRECTIONS_RACINES[e.dir]!;
  const { a, b } = wRacines(e);
  return { dir, aL: surdLatex(a), bL: surdLatex(b), haut: b.n > 0, n: e.n, R: e.R, rho: rhoRacines(e) };
}

/** Correction de quadrant écrite (« −π/3 + π = 2π/3 »). */
function correctionQuadrant(alpha: ReturnType<typeof angle>, haut: boolean): string {
  const corrige = angle(alpha.n * 1 + (haut ? alpha.d : -alpha.d), alpha.d);
  return `${angleLatex(alpha)} ${haut ? "+" : "-"} \\pi = ${angleLatex(corrige)}`;
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionComplexes, e: DonneesDetectiveComplexes): FragmentConsigne[] {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionComplexes, e: DonneesDetectiveComplexes): FragmentConsigne[] {
  switch (e.variante) {
    case "formeTrigo": {
      const c = ctxTrigo(e);
      switch (id) {
        case "racineOubliee":
          return [t("Le module est la RACINE CARRÉE de la somme des carrés : "), l(`|z| = \\sqrt{${c.A + c.B}} = ${c.r}`), t(", et non "), l(`${c.A + c.B}`), t(" (qui est "), l("|z|^2"), t(").")];
        case "racineOubliee_leurre1":
          return [t("Le module est la somme des valeurs absolues des parties : "), l("|z| = |a| + |b|"), t(".")];
        case "racineOubliee_leurre2":
          return [t("Comme "), l("i^2 = -1"), t(", le carré de la partie imaginaire se retranche : "), l("|z| = \\sqrt{a^2 - b^2}"), t(".")];
        case "racineOubliee_leurre3":
          return [t("La partie réelle étant négative, le module est négatif : "), l(`|z| = -${c.r}`), t(".")];
        case "rapportInverse":
          return [t("L'angle de référence est "), l("\\arctan\\dfrac{b}{a}"), t(" (partie imaginaire sur partie réelle) : "), l(`\\arctan\\dfrac{${c.bL}}{${c.aL}}`), t(", et non "), l(`\\arctan\\dfrac{${c.aL}}{${c.bL}}`), t(".")];
        case "rapportInverse_leurre1":
          return [t("Il fallait utiliser "), l("\\arccos\\dfrac{b}{a}"), t(" au lieu de l'arctangente.")];
        case "rapportInverse_leurre2":
          return [t("L'angle de référence est "), l("\\arctan\\dfrac{b}{|z|}"), t(" : on divise la partie imaginaire par le module.")];
        case "rapportInverse_leurre3":
          return [t("Il fallait multiplier les parties au lieu de les diviser : "), l("\\arctan(a \\cdot b)"), t(".")];
        case "quadrant":
          return descriptionQuadrant("z", c.dir.alpha, c.haut);
        case "quadrant_leurre1":
        case "quadrant_leurre2":
        case "quadrant_leurre3":
          return leurreQuadrant(id, c.dir.alpha);
        default:
          return [];
      }
    }
    case "quotient": {
      const c = ctxQuotient(e);
      switch (id) {
        case "sansConjugue":
          return [t("Le numérateur et le dénominateur doivent être multipliés par le MÊME nombre, le conjugué du dénominateur "), l(c.conjL), t(" : en multipliant le numérateur par "), l(c.denL), t(", on change la valeur du quotient.")];
        case "sansConjugue_leurre1":
          return [t("Il fallait multiplier le numérateur et le dénominateur par le conjugué du numérateur, "), l(c.conjNumL), t(".")];
        case "sansConjugue_leurre2":
          return [t("Il fallait multiplier seulement le dénominateur par son conjugué, sans toucher au numérateur.")];
        case "sansConjugue_leurre3":
          return [t("Il fallait diviser les parties une à une : "), l(`z = \\dfrac{${c.a}}{${e.c}} + \\dfrac{${c.b}}{${e.d}}\\,i`), t(".")];
        case "denominateur":
          return [t("Comme "), l("i^2 = -1"), t(", "), l(`(${c.denL})(${c.conjL}) = ${par(`${e.c}`)}^2 - ${carreI(e.d)} = ${e.c * e.c} + ${e.d * e.d}`), t(" : le carré de la partie imaginaire s'AJOUTE.")];
        case "denominateur_leurre1":
          return [t("Le produit d'un nombre par son conjugué n'est pas réel : il fallait garder le terme "), l(terme(2 * e.c * e.d, "i")), t(".")];
        case "denominateur_leurre2":
          return [t("Le dénominateur est le module "), l(`\\sqrt{${par(`${e.c}`)}^2 + ${par(`${e.d}`)}^2}`), t(", et non son carré.")];
        case "denominateur_leurre3":
          return [t("Il fallait écrire "), l(`(${e.c} - ${par(`${e.d}`)})^2`), t(", comme dans l'identité "), l("(x - y)^2"), t(".")];
        case "numerateurI2":
          return [t("Dans le développement, "), l(`${terme(c.bf, "i^2")} = ${-c.bf}`), t(" car "), l("i^2 = -1"), t(" : ce terme a été compté avec le mauvais signe.")];
        case "numerateurI2_leurre1":
          return [t("Les deux termes en "), l("i"), t(" ne pouvaient pas être regroupés : il fallait les laisser séparés.")];
        case "numerateurI2_leurre2":
          return [t("Le produit se calcule partie par partie : "), l(`(${c.numL})(${c.conjL}) = ${complexeEntierLatex(c.a * e.c, c.bf)}`), t(".")];
        case "numerateurI2_leurre3":
          return [t("Il fallait aussi multiplier par "), l("i"), t(" le terme réel "), l(`${c.a * e.c}`), t(".")];
        default:
          return [];
      }
    }
    case "puissance": {
      const c = ctxPuissance(e);
      const facteurBi = c.b < 0 ? `(${c.bi})` : c.bi;
      switch (id) {
        case "doubleProduit":
          return [t("Le carré d'une somme contient le double produit : "), l("(a + bi)^2 = a^2 + 2 \\cdot a \\cdot bi + (bi)^2"), t(" ; le terme "), l(`2 \\cdot ${par(`${c.a}`)} \\cdot ${facteurBi} = ${terme(c.Q, "i")}`), t(" a été oublié.")];
        case "doubleProduit_leurre1":
          return [l("(bi)^2 = b^2\\,i"), t(" : il fallait garder un seul "), l("i"), t(" dans le carré.")];
        case "doubleProduit_leurre2":
          return [t("Le carré d'un nombre complexe se calcule en doublant chaque partie : "), l("(a + bi)^2 = 2a + 2bi"), t(".")];
        case "doubleProduit_leurre3":
          return [t("Le carré d'un nombre complexe est le carré de son module : "), l("(a + bi)^2 = a^2 + b^2"), t(".")];
        case "carreI2":
          return [l(`${carreI(c.b)} = ${terme(c.b * c.b, "i^2")} = ${-c.b * c.b}`), t(", car "), l("i^2 = -1"), t(" : le carré de la partie imaginaire se retranche.")];
        case "carreI2_leurre1":
          return [l(`${carreI(c.b)} = ${terme(c.b * c.b, "i")}`), t(" : il reste un "), l("i"), t(" dans le résultat.")];
        case "carreI2_leurre2":
          return [t("Le double produit vaut "), l(`${par(`${c.a}`)} \\cdot ${facteurBi}`), t(", sans le facteur 2.")];
        case "carreI2_leurre3":
          return [l("i^2 = -i"), t(", donc "), l(`${terme(c.b * c.b, "i^2")} = ${terme(-c.b * c.b, "i")}`), t(".")];
        case "termeATerme":
          return [t("Pour multiplier deux nombres complexes, on distribue chaque terme sur chaque terme (quatre produits) : les produits croisés "), l(terme(c.P * c.b, "i")), t(" et "), l(terme(c.Q * c.a, "i")), t(" ont été oubliés.")];
        case "termeATerme_leurre1":
          return [t("Il fallait additionner les parties imaginaires au lieu de les multiplier.")];
        case "termeATerme_leurre2":
          return [l(`(${c.PQ})(${c.zL}) = ${c.P * c.a} ${c.Q * c.b < 0 ? "-" : "+"} ${Math.abs(c.Q * c.b)}`), t(" : le produit des parties imaginaires ne contient pas de "), l("i^2"), t(".")];
        case "termeATerme_leurre3":
          return [t("Il fallait calculer directement "), l(`(${c.zL})^3 = ${par(`${c.a}`)}^3 + (${c.bi})^3`), t(".")];
        default:
          return [];
      }
    }
    case "moivre": {
      const c = ctxMoivre(e);
      const thL = argTrig(angleLatex(c.theta));
      switch (id) {
        case "moduleOublie":
          return [t("La formule de Moivre élève aussi le module à la puissance "), l(`${c.n}`), t(" : "), l(`|z^{${c.n}}| = |z|^{${c.n}} = ${c.r}^{${c.n}}`), t(", et non "), l(`${c.r}`), t(".")];
        case "moduleOublie_leurre1":
          return [l(`|z^{${c.n}}| = ${c.n}\\,|z| = ${c.n * c.r}`), t(" : le module est multiplié par l'exposant, comme l'argument.")];
        case "moduleOublie_leurre2":
          return [t("Le module de "), l(`z^{${c.n}}`), t(" vaut toujours 1 : seul l'argument change.")];
        case "moduleOublie_leurre3":
          return [l(`|z^{${c.n}}| = \\dfrac{|z|}{${c.n}}`), t(" : le module se divise par l'exposant.")];
        case "reductionPi":
          return [
            t("Un argument est défini à "),
            l("2k\\pi"),
            t(" près : pour ramener "),
            l(angleLatex(c.phi)),
            t(" dans "),
            l(INTERVALLE),
            t(c.sens > 0 ? ", on ajoute un tour complet, " : ", on retire un tour complet, "),
            l("2\\pi"),
            t(", et non "),
            l("\\pi"),
            t(" (cela donnerait l'argument de l'opposé de "),
            l(`z^{${c.n}}`),
            t(")."),
          ];
        case "reductionPi_leurre1":
          return [t("Il ne fallait pas multiplier l'argument par l'exposant : "), l(`\\arg(z^{${c.n}}) = \\arg z`), t(".")];
        case "reductionPi_leurre2":
          return [t("Il fallait diviser l'argument par l'exposant : "), l(`\\arg(z^{${c.n}}) = \\dfrac{\\arg z}{${c.n}}`), t(".")];
        case "reductionPi_leurre3":
          return [t("L'argument de "), l(`z^{${c.n}}`), t(" est "), l(`\\arg z + ${c.n}`), t(" : on ajoute l'exposant.")];
        case "cosSin":
          return [t("Le cosinus donne la partie réelle et le sinus la partie imaginaire : "), l(`\\cos${thL} = ${surdLatex(c.cos)}`), t(" et "), l(`\\sin${thL} = ${surdLatex(c.sin)}`), t(" ont été échangés.")];
        case "cosSin_leurre1":
          return [t("La forme algébrique est "), l(`${c.R}\\cos${thL} + i\\sin${thL}`), t(" : le module ne multiplie que la partie réelle.")];
        case "cosSin_leurre2":
          return [t("Le cosinus et le sinus d'un angle sont toujours positifs : il fallait prendre leurs valeurs absolues.")];
        case "cosSin_leurre3":
          return [t("Il fallait remplacer l'angle par sa valeur en degrés avant de calculer le cosinus et le sinus.")];
        default:
          return [];
      }
    }
    case "racines": {
      const c = ctxRacines(e);
      const quel = c.n === 3 ? "cubique" : "quatrième";
      switch (id) {
        case "quadrant":
          return descriptionQuadrant("w", c.dir.alpha, c.haut);
        case "quadrant_leurre1":
        case "quadrant_leurre2":
        case "quadrant_leurre3":
          return leurreQuadrant(id, c.dir.alpha);
        case "moduleDivise":
          return [t(`Les racines ${nomRacines(c.n)} ont pour module la racine ${quel} du module de `), l("w"), t(" : "), l(`\\sqrt[${c.n}]{${c.R}} = ${c.rho}`), t(", et non "), l(`\\dfrac{${c.R}}{${c.n}}`), t(".")];
        case "moduleDivise_leurre1":
          return [t("Les racines ont le même module que "), l("w"), t(" : "), l(`|z_k| = ${c.R}`), t(".")];
        case "moduleDivise_leurre2":
          return [t("Le module des racines est "), l(`|w|^{${c.n}} = ${c.R}^{${c.n}}`), t(".")];
        case "moduleDivise_leurre3":
          return [t("Le module des racines est toujours la racine carrée : "), l(`|z_k| = \\sqrt{${c.R}}`), t(".")];
        case "pas2pi":
          return [
            t("Les arguments des racines sont "),
            l(`\\dfrac{\\arg w + 2k\\pi}{${c.n}}`),
            t(" : on divise aussi "),
            l("2k\\pi"),
            t(" par "),
            l(`${c.n}`),
            t(", d'où un pas de "),
            l(angleLatex(angle(2, c.n))),
            t(". Avec un pas de "),
            l("2\\pi"),
            t(", on retrouve toujours la même racine."),
          ];
        case "pas2pi_leurre1":
          return [t("Le pas entre deux arguments consécutifs est "), l(`\\dfrac{\\pi}{${c.n}}`), t(".")];
        case "pas2pi_leurre2":
          return [t("Il ne fallait pas diviser "), l("\\arg w"), t(" par "), l(`${c.n}`), t(" : "), l("\\theta_k = \\arg w + 2k\\pi"), t(".")];
        case "pas2pi_leurre3":
          return [t("Les arguments des racines sont "), l(`\\arg w + \\dfrac{2k\\pi}{${c.n}}`), t(" : seul le pas est divisé.")];
        default:
          return [];
      }
    }
    case "moduleSomme": {
      const { a, b, c, d } = e;
      switch (id) {
        case "carreBi":
          return [t("La partie imaginaire de "), l("z"), t(" est le réel "), l(`${b}`), t(", sans "), l("i"), t(" : "), l(`|z| = \\sqrt{${par(`${a}`)}^2 + ${par(`${b}`)}^2}`), t(". On ne met pas "), l("i"), t(" dans le carré.")];
        case "carreBi_leurre1":
          return [t("Le module se calcule sans carrés : "), l("|z| = \\sqrt{|a| + |b|}"), t(".")];
        case "carreBi_leurre2":
          return [l("|z| = |a| + |b|"), t(" : on additionne les valeurs absolues des parties.")];
        case "carreBi_leurre3":
          return [t("Il fallait multiplier "), l("z"), t(" par "), l("i"), t(" avant de calculer son module.")];
        case "sommeRacines":
          return [t("La racine d'une somme n'est pas la somme des racines : "), l(`\\sqrt{${par(`${c}`)}^2 + ${par(`${d}`)}^2} = \\sqrt{${c * c + d * d}}`), t(", et non "), l(`${Math.abs(c)} + ${Math.abs(d)}`), t(".")];
        case "sommeRacines_leurre1":
          return [t("Il fallait retrancher les carrés, car "), l("i^2 = -1"), t(" : "), l("|w| = \\sqrt{c^2 - d^2}"), t(".")];
        case "sommeRacines_leurre2":
          return [l("|w| = c + d"), t(" sans valeurs absolues : le module garde les signes des parties.")];
        case "sommeRacines_leurre3":
          return [t("Il fallait diviser par 2 : "), l("|w| = \\dfrac{|c| + |d|}{2}"), t(".")];
        case "inegaliteTriangulaire":
          return [t("Le module d'une somme n'est pas la somme des modules : on calcule d'abord "), l("z + w"), t(", puis son module. On a seulement "), l("|z + w| \\leq |z| + |w|"), t(".")];
        case "inegaliteTriangulaire_leurre1":
          return [l("|z + w| = |z| - |w|"), t(" : les modules se retranchent.")];
        case "inegaliteTriangulaire_leurre2":
          return [l("|z + w| = |z| \\cdot |w|"), t(" : le module d'une somme est le produit des modules.")];
        case "inegaliteTriangulaire_leurre3":
          return [l("|z + w| = \\sqrt{|z|^2 + |w|^2}"), t(" : c'est le théorème de Pythagore.")];
        default:
          return [];
      }
    }
    case "racineProduit": {
      const n = e.n;
      const ri = racineNegatifLatex(n);
      switch (id) {
        case "racineNegatifs":
          return [
            t("La règle "),
            l("\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}"),
            t(" n'est vraie que pour "),
            l("a \\geq 0"),
            t(" et "),
            l("b \\geq 0"),
            t(" ; ici "),
            l(`a = b = -${n}`),
            t(". En effet, "),
            l(`\\sqrt{(-${n}) \\cdot (-${n})} = ${n}`),
            t(", alors que "),
            l(`\\sqrt{-${n}} \\cdot \\sqrt{-${n}} = ${ri} \\cdot ${ri} = -${n}`),
            t("."),
          ];
        case "racineNegatifs_leurre1":
          return [t("Il est faux d'écrire "), l(`${n} = ${n === 1 ? "\\sqrt{1}" : `\\sqrt{${n * n}}`}`), t(" : cette racine carrée vaut "), l(`-${n}`), t(".")];
        case "racineNegatifs_leurre2":
          return [l(`(-${n}) \\cdot (-${n})`), t(" vaut "), l(`-${n * n}`), t(" et non "), l(`${n * n}`), t(" : le produit de deux négatifs est négatif.")];
        case "racineNegatifs_leurre3":
          return [l("i^2"), t(" vaut "), l("1"), t(" et non "), l("-1"), t(" : c'est le passage à "), l(`-${n}`), t(" qui est faux.")];
        default:
          return [];
      }
    }
  }
}

function descriptionQuadrant(nom: "z" | "w", alpha: ReturnType<typeof angle>, haut: boolean): FragmentConsigne[] {
  return [
    t("Comme "),
    l("a < 0"),
    t(`, le point d'affixe `),
    l(nom),
    t(` est dans le ${haut ? "2e" : "3e"} quadrant : `),
    l("\\arctan\\dfrac{b}{a}"),
    t(" donne un angle de "),
    l("\\mathopen{]}-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\mathclose{[}"),
    t(" qu'il faut corriger : "),
    l(correctionQuadrant(alpha, haut)),
    t("."),
  ];
}

function leurreQuadrant(id: IdDescriptionComplexes, alpha: ReturnType<typeof angle>): FragmentConsigne[] {
  if (id === "quadrant_leurre1") return [t("Il fallait prendre l'opposé de l'angle de référence : "), l(angleLatex(angle(-alpha.n, alpha.d))), t(".")];
  if (id === "quadrant_leurre2") return [t("Comme "), l("a < 0"), t(", il fallait ajouter "), l("\\dfrac{\\pi}{2}"), t(" à l'angle de référence.")];
  return [t("Un argument doit être positif : il fallait ajouter "), l("2\\pi"), t(" à l'angle de référence.")];
}

// ---------------------------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------------------------

function aidesLigne(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  const i = indiceLigneFausse(e);
  const n = nombreLignes(e);
  const [a, b] = i % 2 === 0 ? (i + 1 < n ? [i, i + 1] : [i - 1, i]) : [i - 1, i];
  return [
    [t("Refais la résolution à partir des données, ligne par ligne, en comparant chaque règle utilisée à celle du cours : la première ligne qui ne redonne pas le même résultat est la ligne fausse.")],
    [t(`L'erreur se trouve à la ligne ${a + 1} ou à la ligne ${b + 1}.`)],
  ];
}

function aidesErreur(type: TypeErreurComplexes): FragmentConsigne[][] {
  const formuleRacines = l("z_k = \\sqrt[n]{r}\\; e^{i\\frac{\\theta + 2k\\pi}{n}}, \\quad k = 0, 1, \\ldots, n - 1");
  switch (type) {
    case "racineOubliee":
      return [
        [t("Rappel du cours :"), l("|z| = \\sqrt{a^2 + b^2}")],
        [t("La valeur écrite par l'élève est-elle "), l("|z|"), t(" ou "), l("|z|^2"), t(" ?")],
      ];
    case "rapportInverse":
      return [
        [t("Rappel du cours : l'angle de référence est :"), l("\\arctan\\dfrac{b}{a}")],
        [t("Dans la fraction écrite par l'élève, qui est au numérateur : la partie réelle ou la partie imaginaire ?")],
      ];
    case "quadrant":
      return [
        [t("Rappel du cours : si "), l("a < 0"), t(", on corrige l'arctangente :"), l("\\arg = \\arctan\\dfrac{b}{a} + \\pi \\;\\text{ si } b > 0, \\qquad \\arctan\\dfrac{b}{a} - \\pi \\;\\text{ si } b < 0")],
        [t("Place le point dans le plan complexe : dans quel quadrant est-il, et l'angle trouvé y mène-t-il ?")],
      ];
    case "sansConjugue":
      return [
        [t("Rappel du cours : on multiplie le numérateur ET le dénominateur par le conjugué du dénominateur :"), l("\\dfrac{z_1}{c + di} = \\dfrac{z_1\\,(c - di)}{(c + di)(c - di)}")],
        [t("Les facteurs ajoutés en haut et en bas de la fraction sont-ils les mêmes ?")],
      ];
    case "denominateur":
      return [
        [t("Rappel du cours :"), l("(c + di)(c - di) = c^2 + d^2")],
        [t("Développe toi-même ce produit et regarde ce que devient le terme en "), l("i^2"), t(".")],
      ];
    case "numerateurI2":
      return [
        [t("Rappel :"), l("i^2 = -1")],
        [t("Relis le passage du développement au résultat : que devient le terme en "), l("i^2"), t(" ?")],
      ];
    case "doubleProduit":
      return [
        [t("Rappel — carré d'une somme :"), l("(x + y)^2 = x^2 + 2xy + y^2")],
        [t("Compte les termes du développement : combien en faut-il pour le carré d'une somme ?")],
      ];
    case "carreI2":
      return [
        [t("Rappel :"), l("(bi)^2 = b^2\\,i^2 = -b^2")],
        [t("Vérifie le signe de la partie réelle obtenue.")],
      ];
    case "termeATerme":
      return [
        [t("Rappel — distributivité :"), l("(x + yi)(a + bi) = xa + xbi + yai + ybi^2")],
        [t("Compte les produits écrits par l'élève : il en faut quatre.")],
      ];
    case "moduleOublie":
      return [
        [t("Rappel — formule de Moivre :"), l("\\left(re^{i\\theta}\\right)^n = r^n\\, e^{in\\theta}")],
        [t("Le module de "), l("z^n"), t(" vaut-il bien "), l("|z|^n"), t(" dans la copie ?")],
      ];
    case "reductionPi":
      return [
        [t("Rappel : deux arguments d'un même nombre diffèrent d'un multiple de :"), l("2\\pi")],
        [t("Regarde ce que l'élève a ajouté ou retiré pour ramener l'angle dans "), l(INTERVALLE), t(".")],
      ];
    case "cosSin":
      return [
        [t("Rappel :"), l("r\\left(\\cos\\Theta + i\\sin\\Theta\\right) = r\\cos\\Theta + i\\,r\\sin\\Theta")],
        [t("Calcule toi-même le cosinus et le sinus de l'angle, puis compare-les aux valeurs écrites par l'élève.")],
      ];
    case "moduleDivise":
      return [
        [t("Rappel du cours :"), formuleRacines],
        [t("Vérifie : élevée à la puissance "), l("n"), t(", une racine doit avoir pour module "), l("|w|"), t(".")],
      ];
    case "pas2pi":
      return [
        [t("Rappel du cours :"), formuleRacines],
        [t("Deux arguments consécutifs de la copie désignent-ils deux points différents du plan ?")],
      ];
    case "carreBi":
      return [
        [t("Rappel du cours, pour "), l("z = a + bi"), t(" avec "), l("a"), t(" et "), l("b"), t(" réels :"), l("|z| = \\sqrt{a^2 + b^2}")],
        [t("Dans cette formule, "), l("b"), t(" contient-il un "), l("i"), t(" ?")],
      ];
    case "sommeRacines":
      return [
        [t("Rappel du cours :"), l("|c + di| = \\sqrt{c^2 + d^2}")],
        [t("Teste sur un exemple : "), l("\\sqrt{3^2 + 4^2}"), t(" vaut-il "), l("3 + 4"), t(" ?")],
      ];
    case "inegaliteTriangulaire":
      return [
        [t("Rappel : le module d'une somme se calcule à partir de la somme :"), l("|z + w| = \\sqrt{(a + c)^2 + (b + d)^2}")],
        [t("Teste avec "), l("z = 3"), t(" et "), l("w = 4i"), t(" : que valent "), l("|z + w|"), t(" et "), l("|z| + |w|"), t(" ?")],
      ];
    case "racineNegatifs":
      return [
        [t("Rappel : la règle "), l("\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}"), t(" n'est vraie que si :"), l("a \\geq 0 \\text{ et } b \\geq 0")],
        [t("Revois le piège sur "), l("\\sqrt{-1}"), t(" du point 1 du cours : à quelle ligne l'élève applique-t-il cette règle à deux nombres négatifs ?")],
      ];
  }
}

function aidesCorrection(e: DonneesDetectiveComplexes): FragmentConsigne[][] {
  switch (e.variante) {
    case "formeTrigo": {
      const c = ctxTrigo(e);
      return [
        [t("Le module :"), l(`|z| = \\sqrt{${c.A} + ${c.B}}`)],
        [t("L'argument : l'angle de référence, puis la correction de quadrant :"), l(`\\arg z = \\arctan\\left(${surdLatex(c.dir.rapport)}\\right) ${c.haut ? "+" : "-"} \\pi`)],
      ];
    }
    case "quotient": {
      const c = ctxQuotient(e);
      return [
        [t("Multiplie par le conjugué du dénominateur :"), l(`z = \\dfrac{(${c.numL})(${c.conjL})}{${e.c * e.c + e.d * e.d}}`)],
        [t("Développe le numérateur (quatre produits), en utilisant :"), l("i^2 = -1")],
      ];
    }
    case "puissance": {
      const c = ctxPuissance(e);
      return [
        [t("Calcule d'abord le carré :"), l(`(${c.zL})^2 = ${par(`${c.a}`)}^2 + 2 \\cdot ${par(`${c.a}`)} \\cdot ${c.b < 0 ? `(${c.bi})` : c.bi} + ${c.bi === "i" ? "i^2" : `(${c.bi})^2`}`)],
        [t("Puis multiplie le résultat par "), l(c.zL), t(" en distribuant les quatre produits, avec :"), l("i^2 = -1")],
      ];
    }
    case "moivre": {
      const c = ctxMoivre(e);
      return [
        [t("Le module et l'argument de la puissance :"), l(`|z^{${c.n}}| = ${c.r}^{${c.n}} \\qquad \\arg(z^{${c.n}}) = ${c.n} \\cdot ${c.dir.theta.n < 0 ? `\\left(${angleLatex(c.dir.theta)}\\right)` : angleLatex(c.dir.theta)}`)],
        [t("Ramène l'argument dans "), l(INTERVALLE), t(" en ajoutant ou en retirant "), l("2\\pi"), t(", puis utilise :"), l(`z^{${c.n}} = |z^{${c.n}}|\\left(\\cos\\Theta + i\\sin\\Theta\\right)`)],
      ];
    }
    case "racines": {
      const c = ctxRacines(e);
      return [
        [t("Le module et l'argument de "), l("w"), t(" :"), l(`|w| = ${c.R} \\qquad \\arg w = ${angleLatex(c.dir.alpha)} ${c.haut ? "+" : "-"} \\pi`)],
        [t("Puis, pour "), l(`k = 0, \\ldots, ${c.n - 1}`), t(" :"), l(`|z_k| = \\sqrt[${c.n}]{${c.R}} \\qquad \\theta_k = \\dfrac{\\arg w + 2k\\pi}{${c.n}}`)],
      ];
    }
    case "moduleSomme": {
      const { s, tt } = sommeZW(e);
      return [
        [t("Pour chaque module :"), l("|a + bi| = \\sqrt{a^2 + b^2}")],
        [t("Calcule d'abord la somme, puis son module :"), l(`z + w = ${complexeEntierLatex(s, tt)}`)],
      ];
    }
    case "racineProduit":
      return [
        [t("Écris chaque facteur avec "), l("i"), t(" :"), l(`\\sqrt{-${e.n}} = ${racineNegatifLatex(e.n)}`)],
        [t("Multiplie les deux facteurs, en utilisant :"), l("i^2 = -1")],
      ];
  }
}

export function aidesEcran(e: DonneesDetectiveComplexes, ecran: number): FragmentConsigne[][] {
  if (ecran === 0) return aidesLigne(e);
  if (ecran === 1) return aidesErreur(e.type).map(souderPonctuation);
  return aidesCorrection(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Corrigé : comment repérer la ligne fausse, piège, nom court de l'erreur
// ---------------------------------------------------------------------------------------------

export function constat(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  return souderPonctuation(constatBrut(e));
}

function constatBrut(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  const n = indiceLigneFausse(e) + 1;
  const debut = t(`À la ligne ${n}, `);
  switch (e.variante) {
    case "formeTrigo": {
      const c = ctxTrigo(e);
      if (e.type === "racineOubliee") return [debut, l(`${c.A + c.B}`), t(" est la valeur de "), l("|z|^2"), t(" : le module vaut "), l(`\\sqrt{${c.A + c.B}} = ${c.r}`), t(".")];
      if (e.type === "rapportInverse") return [debut, t("la fraction est "), l(`\\dfrac{${c.aL}}{${c.bL}}`), t(" (partie réelle sur partie imaginaire) au lieu de "), l(`\\dfrac{${c.bL}}{${c.aL}}`), t(".")];
      return constatQuadrant(debut, c.dir.alpha, c.haut);
    }
    case "quotient": {
      const c = ctxQuotient(e);
      if (e.type === "sansConjugue") return [debut, t("le numérateur est multiplié par "), l(c.denL), t(" et le dénominateur par "), l(c.conjL), t(" : la nouvelle fraction n'est plus égale à "), l("z"), t(".")];
      if (e.type === "denominateur")
        return [debut, l(`(${c.denL})(${c.conjL})`), t(" vaut "), l(`${e.c * e.c + e.d * e.d}`), t(" (le terme "), l(`-${carreI(e.d)} = ${e.d * e.d}`), t(" s'ajoute), et non "), l(`${e.c * e.c - e.d * e.d}`), t(".")];
      return [debut, t("le terme "), l(terme(c.bf, "i^2")), t(" a été remplacé par "), l(`${c.bf}`), t(" au lieu de "), l(`${-c.bf}`), t(".")];
    }
    case "puissance": {
      const c = ctxPuissance(e);
      if (e.type === "doubleProduit") return [debut, t("le développement n'a que deux termes : le double produit "), l(terme(c.Q, "i")), t(" manque.")];
      if (e.type === "carreI2") return [debut, l(terme(c.b * c.b, "i^2")), t(" a été remplacé par "), l(`${c.b * c.b}`), t(" au lieu de "), l(`${-c.b * c.b}`), t(".")];
      return [debut, t("seuls deux produits sur quatre sont écrits : il manque "), l(terme(c.P * c.b, "i")), t(" et "), l(terme(c.Q * c.a, "i")), t(".")];
    }
    case "moivre": {
      const c = ctxMoivre(e);
      if (e.type === "moduleOublie") return [debut, t("le module de "), l(`z^{${c.n}}`), t(" est resté "), l(`${c.r}`), t(", alors que "), l(`|z^{${c.n}}| = |z|^{${c.n}}`), t(".")];
      if (e.type === "reductionPi")
        return [
          debut,
          l(`${angleLatex(c.phi)} ${c.sens > 0 ? "+" : "-"} \\pi = ${angleLatex(c.thetaFaux)}`),
          t(" n'est pas un argument de "),
          l(`z^{${c.n}}`),
          t(" : il diffère de "),
          l(angleLatex(c.phi)),
          t(" de "),
          l("\\pi"),
          t(", et non d'un multiple de "),
          l("2\\pi"),
          t("."),
        ];
      return [debut, l(`\\cos${argTrig(angleLatex(c.theta))} = ${surdLatex(c.cos)}`), t(", mais l'élève a écrit "), l(surdLatex(c.sin)), t(" à sa place.")];
    }
    case "racines": {
      const c = ctxRacines(e);
      if (e.type === "quadrant") return constatQuadrant(debut, c.dir.alpha, c.haut);
      if (e.type === "moduleDivise") return [debut, l(`\\left(\\dfrac{${c.R}}{${c.n}}\\right)^{${c.n}} \\neq ${c.R}`), t(" : une racine de ce module n'aurait pas le module de "), l("w"), t(".")];
      return [debut, t("deux arguments consécutifs diffèrent de "), l("2\\pi"), t(" : ils désignent le même point, et la copie trouve "), l(`${c.n}`), t(" fois la même racine.")];
    }
    case "moduleSomme": {
      const { b, c, d } = e;
      if (e.type === "carreBi") return [debut, t("le carré de la partie imaginaire est retranché : "), l(`${carreI(b)} = ${-b * b}`), t(" au lieu de "), l(`${par(`${b}`)}^2 = ${b * b}`), t(".")];
      if (e.type === "sommeRacines") {
        const s = Math.abs(c) + Math.abs(d);
        return [debut, l(`(${Math.abs(c)} + ${Math.abs(d)})^2 = ${s * s}`), t(" alors que "), l(`${c * c} + ${d * d} = ${c * c + d * d}`), t(" : l'égalité écrite est fausse.")];
      }
      const { s, tt } = sommeZW(e);
      return [debut, t("l'élève additionne les modules au lieu de calculer le module de "), l(`z + w = ${complexeEntierLatex(s, tt)}`), t(", obtenu à la ligne 3.")];
    }
    case "racineProduit": {
      const m = e.n;
      return [
        debut,
        t("l'élève remplace "),
        l(`\\sqrt{(-${m}) \\cdot (-${m})}`),
        t(", qui vaut "),
        l(`${m}`),
        t(", par "),
        l(`\\sqrt{-${m}} \\cdot \\sqrt{-${m}}`),
        t(", qui vaut "),
        l(`-${m}`),
        t(" : c'est la seule ligne où l'égalité est fausse."),
      ];
    }
  }
}

function constatQuadrant(debut: FragmentConsigne, alpha: ReturnType<typeof angle>, haut: boolean): FragmentConsigne[] {
  return [
    debut,
    t("l'angle "),
    l(angleLatex(alpha)),
    t(` mène au ${alpha.n > 0 ? "1er" : "4e"} quadrant, alors que le point, de partie réelle négative, est dans le ${haut ? "2e" : "3e"}.`),
  ];
}

export function piege(e: DonneesDetectiveComplexes): FragmentConsigne[] {
  return souderPonctuation(piegeBrut(e.type));
}

function piegeBrut(type: TypeErreurComplexes): FragmentConsigne[] {
  switch (type) {
    case "racineOubliee":
      return [l("a^2 + b^2"), t(" est le carré du module : "), l("|z| = \\sqrt{a^2 + b^2}"), t(" (contrôle : "), l("|z|"), t(" est une longueur, du même ordre que "), l("|a|"), t(" et "), l("|b|"), t(").")];
    case "rapportInverse":
      return [t("L'angle de référence est "), l("\\arctan\\dfrac{b}{a}"), t(" : la partie imaginaire au numérateur, comme une pente « vertical sur horizontal ».")];
    case "quadrant":
      return [l("\\arctan"), t(" ne renvoie que des angles du 1er ou du 4e quadrant : si "), l("a < 0"), t(", on corrige toujours de "), l("+\\pi"), t(" (si "), l("b > 0"), t(") ou de "), l("-\\pi"), t(" (si "), l("b < 0"), t(").")];
    case "sansConjugue":
      return [t("Une fraction ne garde sa valeur que si l'on multiplie le numérateur ET le dénominateur par le MÊME nombre : ici le conjugué du dénominateur.")];
    case "denominateur":
      return [l("(c + di)(c - di) = c^2 - d^2i^2 = c^2 + d^2"), t(" : à cause de "), l("i^2 = -1"), t(", le produit d'un nombre par son conjugué est une SOMME de carrés.")];
    case "numerateurI2":
      return [t("Dans tout développement, chaque "), l("i^2"), t(" se remplace par "), l("-1"), t(" : le signe du terme change.")];
    case "doubleProduit":
      return [l("(a + bi)^2 \\neq a^2 + (bi)^2"), t(" : comme pour les réels, le carré d'une somme contient le double produit "), l("2\\cdot a\\cdot bi"), t(".")];
    case "carreI2":
      return [l("(bi)^2 = b^2i^2 = -b^2"), t(" : la partie réelle de "), l("(a + bi)^2"), t(" est "), l("a^2 - b^2"), t(", jamais "), l("a^2 + b^2"), t(".")];
    case "termeATerme":
      return [t("Un produit de deux binômes a QUATRE produits : on ne multiplie pas seulement « les réels entre eux et les imaginaires entre eux ».")];
    case "moduleOublie":
      return [t("Moivre agit sur les deux composantes : le module est élevé à la puissance "), l("n"), t(", l'argument est multiplié par "), l("n"), t(".")];
    case "reductionPi":
      return [t("On ne réduit un argument que d'un multiple de "), l("2\\pi"), t(" ; retirer "), l("\\pi"), t(" change le nombre en son opposé.")];
    case "cosSin":
      return [l("\\cos"), t(" donne la partie réelle (axe horizontal), "), l("\\sin"), t(" la partie imaginaire (axe vertical) : contrôle avec la position du point dans le plan.")];
    case "moduleDivise":
      return [t("Les racines n-ièmes de "), l("w"), t(" ont pour module "), l("\\sqrt[n]{|w|}"), t(" : c'est le nombre qui, élevé à la puissance "), l("n"), t(", redonne "), l("|w|"), t(".")];
    case "pas2pi":
      return [t("Les "), l("n"), t(" racines sont réparties régulièrement sur un cercle : deux arguments consécutifs diffèrent de "), l("\\dfrac{2\\pi}{n}"), t(", pas de "), l("2\\pi"), t(".")];
    case "carreBi":
      return [t("Dans "), l("|z| = \\sqrt{a^2 + b^2}"), t(", "), l("b"), t(" est la partie imaginaire, un RÉEL : on n'élève jamais "), l("bi"), t(" au carré.")];
    case "sommeRacines":
      return [l("\\sqrt{c^2 + d^2} \\neq |c| + |d|"), t(" : la racine d'une somme n'est pas la somme des racines.")];
    case "inegaliteTriangulaire":
      return [l("|z + w| \\leq |z| + |w|"), t(" (inégalité triangulaire), avec égalité seulement si "), l("z"), t(" et "), l("w"), t(" ont le même argument.")];
    case "racineNegatifs":
      return [
        l("\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}"),
        t(" seulement si "),
        l("a \\geq 0"),
        t(" et "),
        l("b \\geq 0"),
        t(". Dans ℂ, "),
        l("-1"),
        t(" a deux racines carrées, "),
        l("i"),
        t(" et "),
        l("-i"),
        t(" : on définit "),
        l("i"),
        t(" par "),
        l("i^2 = -1"),
        t(", jamais par "),
        l("i = \\sqrt{-1}"),
        t("."),
      ];
  }
}

/** Nom court de l'erreur (réponse brève, texte brut). */
export function nomErreur(e: DonneesDetectiveComplexes): string {
  switch (e.type) {
    case "racineOubliee":
      return "racine carrée oubliée dans le module";
    case "rapportInverse":
      return "arctan(a/b) au lieu de arctan(b/a)";
    case "quadrant":
      return "argument sans correction de quadrant";
    case "sansConjugue":
      return "numérateur non multiplié par le conjugué";
    case "denominateur":
      return "(c + di)(c − di) écrit c² − d²";
    case "numerateurI2":
      return "i² remplacé par 1 dans le numérateur";
    case "doubleProduit":
      return "double produit oublié";
    case "carreI2":
      return "(bi)² = b² au lieu de −b²";
    case "termeATerme":
      return "produits croisés oubliés";
    case "moduleOublie":
      return "module non élevé à la puissance n";
    case "reductionPi":
      return "argument réduit de π au lieu de 2π";
    case "cosSin":
      return "cosinus et sinus échangés";
    case "moduleDivise":
      return "module divisé par n au lieu de sa racine n-ième";
    case "pas2pi":
      return "pas de 2π au lieu de 2π/n";
    case "carreBi":
      return "i placé dans le carré de la partie imaginaire";
    case "sommeRacines":
      return "√(c² + d²) écrit |c| + |d|";
    case "inegaliteTriangulaire":
      return "|z + w| = |z| + |w|";
    case "racineNegatifs":
      return "√(ab) = √a·√b appliquée à deux nombres négatifs";
  }
}
