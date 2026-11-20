import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DonneesDetectiveTrig, IdDescriptionTrig, ResultatDetectiveTrig } from "../core5e/detectiveTrig.types";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import { ensembleLatex, piLatex, rat } from "../moteur5e/trigExact";
import {
  angleRadians,
  calculEquation,
  calculParametres,
  calculProduit,
  copieEleve,
  equationLatex,
  fonctionLatex,
  indiceLigneFausse,
  maximum,
  produitLatex,
  resultat,
  secondTangente,
} from "../moteur5e/modeleDetectiveTrig";

/**
 * Textes de 5gen50 « Détective d'erreurs : trigonométrie » (écran ET papier : une seule source).
 * Formules toujours en LaTeX ; notation du cours (θ en radians, A = ½r²θ, T = 2π/ω, Φ = −φ/ω, c =
 * second membre, k ∈ ℤ, α l'angle de référence).
 */

type Fragments = FragmentConsigne[];
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["La ligne fausse", "L'erreur commise", "La correction"];

export const CONSIGNE_GENERALE = "Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution.";

/** Section du cours de la variante (renvois « (cours, § n) »). */
export function sectionCours(e: DonneesDetectiveTrig): number {
  return e.variante === "secteur" ? 1 : e.variante === "parametres" ? 4 : 7;
}

// ---------------------------------------------------------------------------------------------
// Énoncé et copie
// ---------------------------------------------------------------------------------------------

export function enonceExercice(e: DonneesDetectiveTrig): Fragments {
  return souderPonctuation(enonceBrut(e));
}

function enonceBrut(e: DonneesDetectiveTrig): Fragments {
  switch (e.variante) {
    case "secteur":
      return [t(`Un secteur circulaire a un rayon de ${e.r} cm et un angle au centre de ${e.d}°. L'élève doit calculer son aire (valeur exacte).`)];
    case "parametres":
      return [
        t("On donne "),
        l(fonctionLatex(e)),
        t(". L'élève doit trouver une abscisse où "),
        l("f"),
        t(" atteint son maximum, en construisant une période à partir du décalage horizontal "),
        l("\\Phi"),
        t("."),
      ];
    case "equation":
      return [t("L'élève doit résoudre "), l(equationLatex(e)), t(" dans "), l("[0\\,;\\,2\\pi["), t(".")];
    case "produit":
      return [t("L'élève doit résoudre "), l(produitLatex(e)), t(" dans "), l("[0\\,;\\,2\\pi["), t(".")];
  }
}

export function lignesCopie(e: DonneesDetectiveTrig): Fragments[] {
  return copieEleve(e).map(souderPonctuation);
}

// ---------------------------------------------------------------------------------------------
// Réponse (écran 3, fiche, corrigé)
// ---------------------------------------------------------------------------------------------

export function resultatLatex(r: ResultatDetectiveTrig): string {
  if (r.genre === "aire") return r.latex;
  if (r.genre === "abscisse") return piLatex(r.x);
  return ensembleLatex(r.angles);
}

export function reponseFragments(e: DonneesDetectiveTrig, r: ResultatDetectiveTrig = resultat(e)): Fragments {
  switch (e.variante) {
    case "secteur":
      return [l(`A = ${resultatLatex(r)}`), t(" cm²")];
    case "parametres":
      return [l("f"), t(" atteint son maximum "), l(String(maximum(e))), t(" en "), l(`x = ${resultatLatex(r)}`), t(" (à une période "), l(`T = ${piLatex(r.genre === "abscisse" ? r.periode : rat(0))}`), t(" près)")];
    default:
      return [l(`S = ${resultatLatex(r)}`)];
  }
}

export function prefixeChamp(e: DonneesDetectiveTrig): string {
  return e.variante === "secteur" ? "A =" : e.variante === "parametres" ? "x =" : "S =";
}

export function aideSaisie(e: DonneesDetectiveTrig): string {
  switch (e.variante) {
    case "secteur":
      return "Écris la valeur exacte, par exemple 6π ou 25π/4 (bouton π ou « pi »).";
    case "parametres":
      return "Écris une abscisse exacte, par exemple 5π/12 ou −π/8.";
    default:
      return "Écris toutes les solutions séparées par « ; », par exemple π/6 ; 5π/6.";
  }
}

// ---------------------------------------------------------------------------------------------
// Consignes des écrans
// ---------------------------------------------------------------------------------------------

export function consignesEcrans(e: DonneesDetectiveTrig): Fragments[] {
  const n = indiceLigneFausse(e) + 1;
  let precision: Fragments = [t(" (valeur exacte).")];
  if (e.variante === "secteur") precision = [t(" : l'aire exacte du secteur, en cm².")];
  else if (e.variante === "parametres") precision = [t(" : une abscisse exacte où "), l("f"), t(" atteint son maximum.")];
  else precision = [t(" : toutes les solutions de "), l("[0\\,;\\,2\\pi["), t(", séparées par « ; ».")];
  return [
    [t("Quelle ligne de la copie est fausse ?")],
    [t(`Quelle erreur l'élève a-t-il commise à la ligne ${n} ?`)],
    souderPonctuation([t(`Corrige la copie : reprends la résolution à partir de la ligne ${n} et donne le résultat final correct`), ...precision]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Descriptions d'erreur (écran 2)
// ---------------------------------------------------------------------------------------------

export function descriptionFragments(id: IdDescriptionTrig, e: DonneesDetectiveTrig): Fragments {
  return souderPonctuation(descriptionBrute(id, e));
}

function descriptionBrute(id: IdDescriptionTrig, e: DonneesDetectiveTrig): Fragments {
  const d = e.variante === "secteur" ? e.d : 0;
  const sinus = e.variante === "equation" && e.fonction === "sin";
  switch (id) {
    // --- secteur ---
    case "piOublie":
      return [t("La conversion a perdu "), l("\\pi"), t(" : "), l(`\\theta = ${d} \\times \\dfrac{\\pi}{180} = ${e.variante === "secteur" ? piLatex(angleRadians(e)) : ""}`), t(", et non "), l(`\\dfrac{${d}}{180}`), t(".")];
    case "conversionInverse":
      return [t("Pour passer des degrés aux radians, on multiplie par "), l("\\dfrac{180}{\\pi}"), t(" : il fallait écrire "), l(`\\theta = ${d} \\times \\dfrac{180}{\\pi}`), t(".")];
    case "convertirInutile":
      return [t("Il ne fallait pas convertir : la formule de l'aire s'utilise avec l'angle en degrés.")];
    case "diviser360":
      return [t("Il fallait diviser par 360 : "), l(`\\theta = \\dfrac{${d}}{360}`), t(".")];
    case "demi":
      return [t("Le facteur "), l("\\dfrac{1}{2}"), t(" est oublié : l'aire d'un secteur vaut "), l("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", et non "), l("r^2\\,\\theta"), t(".")];
    case "rayonNonCarre":
      return [t("Le rayon ne doit pas être au carré : l'aire d'un secteur vaut "), l("A = \\dfrac{1}{2}\\,r\\,\\theta"), t(".")];
    case "formuleArc":
      return [t("C'est la formule de l'arc qu'il fallait utiliser : "), l("A = r\\,\\theta"), t(".")];
    case "formuleDisque":
      return [t("L'aire d'un secteur vaut "), l("\\pi r^2"), t(" : l'angle n'intervient pas.")];
    case "degres":
      return [t("Dans "), l("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", l'angle doit être en radians : la ligne remplace "), l("\\theta"), t(" par sa mesure en degrés ("), l(String(d)), t(") au lieu de "), l(e.variante === "secteur" ? piLatex(angleRadians(e)) : "\\theta"), t(".")];
    case "carreDouble":
      return [t("Le carré du rayon est faux : il fallait écrire "), l("2 \\times r"), t(" au lieu de "), l("r^2"), t(".")];
    case "fractionTour":
      return [t("Il fallait remplacer "), l("\\theta"), t(" par la fraction du tour "), l(`\\dfrac{${d}}{360}`), t(", sans "), l("\\pi"), t(".")];
    case "demiEnTrop":
      return [t("Le facteur "), l("\\dfrac{1}{2}"), t(" est en trop : l'aire d'un secteur vaut "), l("r^2\\,\\theta"), t(".")];
    // --- paramètres ---
    case "periode":
      return [t("La période vaut "), l("T = \\dfrac{2\\pi}{\\omega}"), t(" : un tour complet de l'argument mesure "), l("2\\pi"), t(". La copie a écrit "), l("\\dfrac{\\pi}{\\omega}"), t(".")];
    case "periodeOmega":
      return [t("La période est égale à la pulsation : "), l("T = \\omega"), t(".")];
    case "periodeProduit":
      return [t("La période vaut "), l("T = 2\\pi \\times \\omega"), t(".")];
    case "periodeInverse":
      return [t("La période vaut "), l("T = \\dfrac{\\omega}{2\\pi}"), t(".")];
    case "phiPourPhi":
      return [t("Le décalage horizontal n'est pas le déphasage : "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(", et non "), l("\\Phi = \\varphi"), t(".")];
    case "phiSansSigne":
      return [t("Le décalage horizontal vaut "), l("\\Phi = \\dfrac{\\varphi}{\\omega}"), t(", sans signe moins.")];
    case "phiFoisOmega":
      return [t("Le décalage horizontal vaut "), l("\\Phi = -\\varphi \\times \\omega"), t(".")];
    case "phiSurT":
      return [t("Le décalage horizontal vaut "), l("\\Phi = \\dfrac{\\varphi}{T}"), t(".")];
    case "ordre":
      if (e.variante === "parametres" && e.A < 0)
        return [t("Avec "), l("A < 0"), t(", la courbe est retournée : à partir de "), l("\\Phi"), t(", elle passe par le minimum avant le maximum. La copie a gardé l'ordre de "), l("A > 0"), t(".")];
      return [t("Avec "), l("A > 0"), t(", à partir de "), l("\\Phi"), t(", la courbe monte : le maximum vient avant le minimum. La copie a inversé l'ordre.")];
    case "ordreB":
      return [t("L'ordre des extremums dépend du signe de "), l("b"), t(", pas de celui de "), l("A"), t(".")];
    case "ordreOmega":
      return [t("L'ordre des extremums dépend de "), l("\\omega"), t(" : il s'inverse dès que "), l("\\omega > 1"), t(".")];
    case "maxEnPhi":
      return [t("Le maximum est atteint en "), l("x = \\Phi"), t(" lui-même : il ne fallait rien ajouter.")];
    // --- équation ---
    case "angleConfondu":
      return sinus
        ? [t("L'angle de référence est faux : il faut l'angle dont le sinus vaut "), l("c"), t(", "), l("\\alpha = \\arcsin c"), t(", et non celui dont le cosinus vaut "), l("c"), t(".")]
        : [t("L'angle de référence est faux : il faut l'angle dont le cosinus vaut "), l("c"), t(", "), l("\\alpha = \\arccos c"), t(", et non celui dont le sinus vaut "), l("c"), t(".")];
    case "alphaDegres":
      return [t("L'angle "), l("\\alpha"), t(" devait être écrit en degrés.")];
    case "alphaOppose":
      return [t("Il fallait prendre l'opposé de l'angle de la table : "), l(sinus ? "\\alpha = -\\arcsin c" : "\\alpha = -\\arccos c"), t(".")];
    case "alphaMoitie":
      return [t("À cause de "), l("2x"), t(", il fallait chercher l'angle dont le "), t(sinus ? "sinus" : "cosinus"), t(" vaut "), l("\\dfrac{c}{2}"), t(".")];
    case "familleOubliee":
      return sinus
        ? [t("Il manque la seconde famille : "), l("\\sin u = \\sin\\alpha \\iff u = \\alpha + 2k\\pi"), t(" ou "), l("u = \\pi - \\alpha + 2k\\pi"), t(".")]
        : [t("Il manque la seconde famille : "), l("\\cos u = \\cos\\alpha \\iff u = \\alpha + 2k\\pi"), t(" ou "), l("u = -\\alpha + 2k\\pi"), t(".")];
    case "uneFamilleSuffit":
      return [t("Le signe de l'angle est faux : il fallait écrire "), l("2x = -\\alpha + 2k\\pi"), t(" au lieu de "), l("2x = \\alpha + 2k\\pi"), t(".")];
    case "familleKpi":
      return [t("Il fallait écrire "), l("2x = \\alpha + k\\pi"), t(" : la période est "), l("\\pi"), t(".")];
    case "familleAlphaPlusPi":
      return [t("La seconde famille est "), l("2x = \\alpha + \\pi + 2k\\pi"), t(".")];
    case "familleFausse":
      return sinus
        ? [t("La seconde famille est fausse : pour le sinus, c'est "), l("\\pi - \\alpha"), t(" (symétrie par rapport à l'axe vertical), et non "), l("-\\alpha"), t(".")]
        : [t("La seconde famille est fausse : pour le cosinus, c'est "), l("-\\alpha"), t(" (symétrie par rapport à l'axe horizontal), et non "), l("\\pi - \\alpha"), t(".")];
    case "famillePeriodePi":
      return [t("Les deux familles ont la période "), l("\\pi"), t(" : il fallait écrire "), l("+ k\\pi"), t(" au lieu de "), l("+ 2k\\pi"), t(".")];
    case "famillePiSurDeux":
      return [t("La seconde famille est "), l("2x = \\dfrac{\\pi}{2} - \\alpha + 2k\\pi"), t(".")];
    case "periodeNonDivisee":
      return [t("Pour isoler "), l("x"), t(", il faut diviser tout le membre de droite par 2, y compris "), l("2k\\pi"), t(" : "), l("+ k\\pi"), t(", et non "), l("+ 2k\\pi"), t(".")];
    case "periodeMultipliee":
      return [t("Il fallait multiplier "), l("2k\\pi"), t(" par 2 : "), l("x = \\ldots + 4k\\pi"), t(".")];
    case "alphaNonDivise":
      return [t("Il ne fallait pas diviser l'angle par 2 : seul "), l("2k\\pi"), t(" se divise.")];
    case "periodeQuart":
      return [t("Il fallait écrire "), l("x = \\ldots + \\dfrac{k\\pi}{2}"), t(".")];
    // --- produit ---
    case "periodeTan":
      return [t("La tangente a pour période "), l("\\pi"), t(" : "), l("\\tan x = c \\iff x = \\alpha + k\\pi"), t(", et non "), l("+ 2k\\pi"), t(".")];
    case "tanDeuxFamilles":
      return [t("Comme pour le sinus, il fallait une seconde famille "), l("x = \\pi - \\alpha + 2k\\pi"), t(".")];
    case "tanPiSurDeux":
      return [t("La tangente a pour période "), l("\\dfrac{\\pi}{2}"), t(" : "), l("x = \\alpha + \\dfrac{k\\pi}{2}"), t(".")];
    case "tanArccos":
      return [t("Il fallait utiliser "), l("\\arccos c"), t(" au lieu de "), l("\\arctan c"), t(".")];
    case "cosZero":
      return [l("\\cos x = 0 \\iff x = \\dfrac{\\pi}{2} + k\\pi"), t(" (point image sur l'axe vertical), et non "), l("x = k\\pi"), t(" : c'est la solution de "), l("\\sin x = 0"), t(".")];
    case "cosZeroDeuxKpi":
      return [l("\\cos x = 0"), t(" seulement pour "), l("x = \\dfrac{\\pi}{2} + 2k\\pi"), t(".")];
    case "cosZeroAucune":
      return [l("\\cos x = 0"), t(" n'a aucune solution.")];
    case "cosZeroKpiSur2":
      return [l("\\cos x = 0 \\iff x = \\dfrac{k\\pi}{2}"), t(".")];
    case "valeurInterdite":
      return [t("Pour "), l("x = \\dfrac{\\pi}{2} + k\\pi"), t(", "), l("\\tan x"), t(" n'existe pas : ces valeurs ne sont pas solutions de l'équation de départ, il fallait les rejeter.")];
    case "produitDeuxNuls":
      return [t("Un produit est nul seulement si ses deux facteurs sont nuls en même temps.")];
    case "rejeterTan":
      return [t("Il fallait rejeter les solutions de "), l("\\tan x = c"), t(" et garder celles de "), l("\\cos x = 0"), t(".")];
    case "rejeterKpi":
      return [t("Il fallait aussi rejeter les valeurs "), l("x = k\\pi"), t(".")];
  }
}

/** Nom court de l'erreur (réponse brève, barème). */
export function nomErreur(e: DonneesDetectiveTrig): string {
  switch (e.type) {
    case "piOublie":
      return "π perdu dans la conversion en radians";
    case "demi":
      return "facteur ½ oublié dans l'aire";
    case "degres":
      return "angle en degrés dans une formule en radians";
    case "periode":
      return "période π/ω au lieu de 2π/ω";
    case "phiPourPhi":
      return "déphasage φ pris pour le décalage Φ";
    case "ordre":
      return e.variante === "parametres" && e.A < 0 ? "ordre des extremums non inversé alors que A < 0" : "ordre des extremums inversé alors que A > 0";
    case "angleConfondu":
      return "angle de référence pris dans la mauvaise table";
    case "familleOubliee":
      return "seconde famille oubliée";
    case "familleFausse":
      return e.variante === "equation" && e.fonction === "sin" ? "seconde famille −α au lieu de π − α" : "seconde famille π − α au lieu de −α";
    case "periodeNonDivisee":
      return "2kπ non divisé par 2";
    case "periodeTan":
      return "période 2π au lieu de π pour la tangente";
    case "cosZero":
      return "cos x = 0 confondu avec sin x = 0";
    case "valeurInterdite":
      return "valeurs où tan x n'existe pas gardées";
  }
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux par écran ; jamais le résultat final)
// ---------------------------------------------------------------------------------------------

function reglesCopie(e: DonneesDetectiveTrig): Fragments {
  switch (e.variante) {
    case "secteur":
      return [t("Règles utilisées dans cette copie : la conversion "), l("\\theta = d \\times \\dfrac{\\pi}{180}"), t(" et l'aire d'un secteur "), l("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", avec "), l("\\theta"), t(" en radians.")];
    case "parametres":
      return [t("Règles utilisées : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(", "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" et l'ordre des points à partir de "), l("\\Phi"), t(" (maximum d'abord si "), l("A > 0"), t(", minimum d'abord si "), l("A < 0"), t(").")];
    case "equation":
      return e.fonction === "sin"
        ? [t("Règles utilisées : "), l("\\alpha = \\arcsin c"), t(", les deux familles "), l("u = \\alpha + 2k\\pi"), t(" et "), l("u = \\pi - \\alpha + 2k\\pi"), t(", puis on divise tout par 2.")]
        : [t("Règles utilisées : "), l("\\alpha = \\arccos c"), t(", les deux familles "), l("u = \\alpha + 2k\\pi"), t(" et "), l("u = -\\alpha + 2k\\pi"), t(", puis on divise tout par 2.")];
    case "produit":
      return [t("Règles utilisées : produit nul, "), l("\\tan x = c \\iff x = \\alpha + k\\pi"), t(", "), l("\\cos x = 0 \\iff x = \\dfrac{\\pi}{2} + k\\pi"), t(", et "), l("\\tan x"), t(" n'existe que si "), l("\\cos x \\neq 0"), t(".")];
  }
}

function regleLigne(e: DonneesDetectiveTrig): Fragments {
  switch (e.type) {
    case "piOublie":
      return [t("Rappel : "), l("\\theta_{\\text{rad}} = \\theta_{\\text{deg}} \\times \\dfrac{\\pi}{180}"), t(".")];
    case "demi":
    case "degres":
      return [t("Rappel : "), l("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", où "), l("\\theta"), t(" est l'angle en radians.")];
    case "periode":
      return [t("Rappel : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(".")];
    case "phiPourPhi":
      return [t("Rappel : "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")];
    case "ordre":
      return [t("Rappel : à partir de "), l("\\Phi"), t(", la courbe passe par la ligne moyenne puis le maximum si "), l("A > 0"), t(", puis le minimum si "), l("A < 0"), t(".")];
    case "angleConfondu":
    case "familleOubliee":
    case "familleFausse":
      return reglesCopie(e);
    case "periodeNonDivisee":
      return [t("Rappel : pour isoler "), l("x"), t(" dans "), l("2x = \\ldots + 2k\\pi"), t(", on divise chaque terme par 2.")];
    case "periodeTan":
    case "cosZero":
    case "valeurInterdite":
      return reglesCopie(e);
  }
}

export function aidesEcran(e: DonneesDetectiveTrig, ecran: number): Fragments[] {
  const n = indiceLigneFausse(e) + 1;
  if (ecran === 0)
    return [
      [t("Contrôle chaque ligne avec la règle du cours qui la justifie, dans l'ordre. La ligne fausse est la première qui ne respecte pas une règle ; les lignes suivantes n'en sont que des conséquences.")],
      souderPonctuation(reglesCopie(e)),
    ];
  if (ecran === 1)
    return [
      [t(`Refais toi-même le calcul de la ligne ${n} avec les données de l'énoncé, puis compare avec ce qu'a écrit l'élève.`)],
      souderPonctuation(regleLigne(e)),
    ];
  return aidesCorrection(e).map(souderPonctuation);
}

function aidesCorrection(e: DonneesDetectiveTrig): Fragments[] {
  switch (e.variante) {
    case "secteur": {
      const th = piLatex(angleRadians(e));
      return [
        [t("Aire d'un secteur, avec l'angle en radians (cours, § 1) : "), l("A = \\dfrac{1}{2}\\,r^2\\,\\theta"), t(", où "), l("\\theta = d \\times \\dfrac{\\pi}{180}"), t(".")],
        [t("Ici "), l(`\\theta = ${e.d} \\times \\dfrac{\\pi}{180} = ${th}`), t(", donc "), l(`A = \\dfrac{1}{2} \\times ${e.r}^2 \\times ${th}`), t(" : il reste à calculer.")],
      ];
    }
    case "parametres": {
      const c = calculParametres(e, false);
      return [
        [t("Construction (cours, § 4) : "), l("T = \\dfrac{2\\pi}{\\omega}"), t(", "), l("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" ; à partir de "), l("\\Phi"), t(", le maximum vient un quart de période plus loin si "), l("A > 0"), t(", trois quarts de période plus loin si "), l("A < 0"), t(".")],
        [t("Ici "), l(`T = ${piLatex(c.T)}`), t(", "), l(`\\Phi = ${piLatex(c.Phi)}`), t(" et "), l(`A ${e.A > 0 ? ">" : "<"} 0`), t(" : calcule "), l(e.A > 0 ? "\\Phi + \\dfrac{T}{4}" : "\\Phi + \\dfrac{3T}{4}"), t(".")],
      ];
    }
    case "equation": {
      const c = calculEquation(e, false);
      const sinus = e.fonction === "sin";
      return [
        [
          t(`Pour ${sinus ? "le sinus" : "le cosinus"} (cours, § 7) : `),
          l(sinus ? "u = \\alpha + 2k\\pi" : "u = \\alpha + 2k\\pi"),
          t(" ou "),
          l(sinus ? "u = \\pi - \\alpha + 2k\\pi" : "u = -\\alpha + 2k\\pi"),
          t(", puis on divise tout par 2, y compris "),
          l("2k\\pi"),
          t("."),
        ],
        [t("Ici "), l(`\\alpha = ${piLatex(c.alpha)}`), t(", donc "), l(`2x = ${piLatex(c.familles[0]!)} + 2k\\pi`), t(" ou "), l(`2x = ${piLatex(c.familles[1]!)} + 2k\\pi`), t(". Garde les valeurs de "), l("x"), t(" de "), l("[0\\,;\\,2\\pi["), t(".")],
      ];
    }
    case "produit": {
      const c = calculProduit(e, false);
      return [
        [t("Produit nul (cours, § 7) : un des facteurs est nul. "), l("\\tan x = c \\iff x = \\alpha + k\\pi"), t(", et "), l("\\tan x"), t(" n'existe pas là où "), l("\\cos x = 0"), t(".")],
        [t("Ici "), l(`\\tan x = ${secondTangente(e).latex} \\iff x = ${piLatex(c.beta)} + k\\pi`), t(" ; "), l("\\cos x = 0"), t(" donne "), l("x = \\dfrac{\\pi}{2} + k\\pi"), t(", où "), l("\\tan x"), t(" n'existe pas.")],
      ];
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Messages ciblés (écran 3)
// ---------------------------------------------------------------------------------------------

export function messageResultatCopie(e: DonneesDetectiveTrig): Fragments {
  return [t(`C'est le résultat de la copie : reprends la résolution à partir de la ligne ${indiceLigneFausse(e) + 1}.`)];
}

export function messageMinimum(): Fragments {
  return [t("En cette abscisse, "), l("f"), t(" atteint son minimum : relis l'ordre des points à partir de "), l("\\Phi"), t(".")];
}

export function messageEnsemble(manquantes: number, enTrop: number): Fragments {
  if (enTrop > 0) return [t(enTrop === 1 ? "Une des valeurs écrites n'est pas solution." : `${enTrop} des valeurs écrites ne sont pas solutions.`)];
  return [t(manquantes === 1 ? "Il manque une solution de " : `Il manque ${manquantes} solutions de `), l("[0\\,;\\,2\\pi["), t(".")];
}

export function messageHorsIntervalle(): Fragments {
  return [t("Une valeur est solution, mais elle n'est pas dans "), l("[0\\,;\\,2\\pi["), t(" : ajoute ou retire un tour "), l("2\\pi"), t(".")];
}
