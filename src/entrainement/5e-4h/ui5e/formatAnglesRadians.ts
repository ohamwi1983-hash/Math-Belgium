import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { souderPonctuation } from "../../4e/ui/formatDetectiveVecteurs";
import { mul, piLatex, rat, val, type Rat } from "../moteur5e/trigExact";
import { angle, angleLatex, angleReference, cosinus, quadrant, sinus, tangente, type ExerciceAnglesRadians, type Quadrant } from "../moteur5e/modeleAnglesRadians";

/**
 * Textes de 5gen51 « Angles en radians sur le cercle » (écran ET papier : une seule source). Formules
 * en KaTeX, « − » typographique, notation du cours (§ 4 : point image, cos = abscisse, sin = ordonnée,
 * tan = sin/cos, non définie quand cos = 0).
 */

type Fragments = FragmentConsigne[];
type E = ExerciceAnglesRadians;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export { souderPonctuation };

export const TITRES_ECRANS = ["Angle ramené dans [0 ; 2π[", "Le quadrant", "Cosinus et sinus", "La tangente"];

export const CONSIGNE_GENERALE = "Place l'angle sur le cercle trigonométrique, puis donne ses valeurs exactes.";

export const INTERVALLE = "[0\\,;\\,2\\pi[";

export function enonceExercice(e: E): Fragments {
  return souderPonctuation([t("On donne l'angle "), l(`\\theta = ${angleLatex(e)}`), t(" (en radians). Le cercle trigonométrique est quadrillé aux valeurs remarquables.")]);
}

/** Énoncé papier autosuffisant (une seule consigne, sans les étapes). */
export function consignePapier(e: E): Fragments {
  return souderPonctuation([
    t("Ramène "),
    l(`\\theta = ${angleLatex(e)}`),
    t(" dans "),
    l(INTERVALLE),
    t(", précise le quadrant du point image M (ou l'axe sur lequel il se trouve), puis donne les valeurs exactes de "),
    l("\\cos\\theta"),
    t(", "),
    l("\\sin\\theta"),
    t(" et "),
    l("\\tan\\theta"),
    t(" (ou dis pourquoi elle n'existe pas)."),
  ]);
}

export function consignesEcrans(e: E): Fragments[] {
  return [
    souderPonctuation([t("Ramène "), l(`\\theta = ${angleLatex(e)}`), t(" dans "), l(INTERVALLE), t(" : donne l'angle "), l("\\theta_0"), t(" de cet intervalle qui a le même point image.")]),
    [t("Où se trouve le point image M ?")],
    souderPonctuation([t("Lis sur le cercle les valeurs exactes de "), l("\\cos\\theta"), t(" et de "), l("\\sin\\theta"), t(".")]),
    souderPonctuation([t("Donne la valeur exacte de "), l("\\tan\\theta"), t(", ou indique qu'elle n'existe pas.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Quadrants (écran 2)
// ---------------------------------------------------------------------------------------------

export const OPTIONS_QUADRANT: { id: Quadrant; fragments: Fragments }[] = [
  { id: "I", fragments: [t("Premier quadrant : "), l("\\left]0\\,;\\,\\dfrac{\\pi}{2}\\right[")] },
  { id: "II", fragments: [t("Deuxième quadrant : "), l("\\left]\\dfrac{\\pi}{2}\\,;\\,\\pi\\right[")] },
  { id: "III", fragments: [t("Troisième quadrant : "), l("\\left]\\pi\\,;\\,\\dfrac{3\\pi}{2}\\right[")] },
  { id: "IV", fragments: [t("Quatrième quadrant : "), l("\\left]\\dfrac{3\\pi}{2}\\,;\\,2\\pi\\right[")] },
  { id: "axe", fragments: [t("Sur un des axes")] },
];

export function nomQuadrant(q: Quadrant): string {
  return q === "I" ? "premier quadrant" : q === "II" ? "deuxième quadrant" : q === "III" ? "troisième quadrant" : q === "IV" ? "quatrième quadrant" : "sur un axe";
}

/** Axe et sens pour un angle sur un axe (« sur l'axe horizontal, à droite »). */
export function positionAxe(e: E): string {
  const v = val(e.reduit);
  return v === 0 ? "sur l'axe horizontal, à droite (point (1 ; 0))" : v === 0.5 ? "sur l'axe vertical, en haut (point (0 ; 1))" : v === 1 ? "sur l'axe horizontal, à gauche (point (−1 ; 0))" : "sur l'axe vertical, en bas (point (0 ; −1))";
}

// ---------------------------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------------------------

export function reponseReduction(e: E): Fragments {
  return [l(`\\theta_0 = ${piLatex(e.reduit)}`), t(" : même point image que "), l("\\theta"), t(", dans "), l(INTERVALLE), t(".")];
}

export function reponseQuadrant(e: E): Fragments {
  const q = quadrant(e);
  return q === "axe" ? [t(`M est ${positionAxe(e)}.`)] : [t(`M est dans le ${nomQuadrant(q)}.`)];
}

export function reponseCosSin(e: E): Fragments {
  return [l(`\\cos\\theta = ${cosinus(e).latex}`), t(" et "), l(`\\sin\\theta = ${sinus(e).latex}`)];
}

export function reponseTangente(e: E): Fragments {
  const tg = tangente(e);
  return tg ? [l(`\\tan\\theta = ${tg.latex}`)] : [l("\\tan\\theta"), t(" n'existe pas ("), l("\\cos\\theta = 0"), t(").")];
}

export function reponsesEcrans(e: E): Fragments[] {
  return [reponseReduction(e), reponseQuadrant(e), reponseCosSin(e), reponseTangente(e)];
}

// ---------------------------------------------------------------------------------------------
// Aides (deux niveaux ; jamais la réponse)
// ---------------------------------------------------------------------------------------------

/** 2π écrit avec le dénominateur de θ (« \dfrac{12\pi}{6} »). */
export function deuxPiMemeDenominateur(e: E): string {
  const d = angle(e).d;
  return d === 1 ? "2\\pi" : `\\dfrac{${2 * d}\\pi}{${d}}`;
}

/** Fraction de π « \dfrac{k\pi}{d} » forcée au dénominateur d (non réduite). */
export function piSurD(c: Rat, d: number): string {
  const k = Math.round(val(c) * d);
  if (d === 1 || k === 0) return piLatex(rat(k));
  const s = k < 0 ? "-" : "";
  const a = Math.abs(k);
  return `${s}\\dfrac{${a === 1 ? "" : a}\\pi}{${d}}`;
}

export function aidesEcran(e: E, ecran: number): Fragments[] {
  const q = quadrant(e);
  const th = angleLatex(e);
  const n = Math.abs(e.tours);
  switch (ecran) {
    case 0:
      return [
        [t("Un tour complet mesure "), l("2\\pi"), t(" : ajouter ou retirer des tours ne change pas le point image, donc "), l("\\theta"), t(" et "), l("\\theta + 2k\\pi"), t(" ("), l("k \\in \\mathbb{Z}"), t(") ont le même point M.")],
        souderPonctuation([
          t("Ici "),
          l(`2\\pi = ${deuxPiMemeDenominateur(e)}`),
          t(e.tours > 0 ? ` : retire ${n} tour${n > 1 ? "s" : ""} à ` : ` : ajoute ${n} tour${n > 1 ? "s" : ""} à `),
          l(th),
          t(` (soit ${n} × `),
          l("2\\pi"),
          t(`), puis vérifie que le résultat est dans `),
          l(INTERVALLE),
          t("."),
        ]),
      ];
    case 1: {
      const d = e.reduit.d % 2 === 0 ? e.reduit.d : 2 * e.reduit.d;
      return [
        [t("Les quadrants sont séparés par "), l("\\dfrac{\\pi}{2}"), t(", "), l("\\pi"), t(" et "), l("\\dfrac{3\\pi}{2}"), t(" ; un angle égal à l'un d'eux (ou à 0) place M sur un axe.")],
        souderPonctuation([
          t("Écris les repères et l'angle réduit avec un même dénominateur : "),
          l(`\\dfrac{\\pi}{2} = ${piSurD(rat(1, 2), d)}`),
          t(", "),
          l(`\\pi = ${piSurD(rat(1), d)}`),
          t(", "),
          l(`\\dfrac{3\\pi}{2} = ${piSurD(rat(3, 2), d)}`),
          t(", puis compare."),
        ]),
      ];
    }
    case 2: {
      if (q === "axe")
        return [
          [l("\\cos\\theta"), t(" est l'abscisse de M, "), l("\\sin\\theta"), t(" son ordonnée.")],
          [t("M est le point où le cercle coupe un axe : ses deux coordonnées se lisent directement, l'une vaut 0.")],
        ];
      const alpha = angleReference(e);
      const signeCos = q === "I" || q === "IV" ? "positif" : "négatif";
      const signeSin = q === "I" || q === "II" ? "positif" : "négatif";
      return [
        [l("\\cos\\theta"), t(" est l'abscisse de M, "), l("\\sin\\theta"), t(" son ordonnée ; leurs signes dépendent du quadrant.")],
        souderPonctuation([
          t("L'angle de référence est "),
          l(`\\alpha = ${piLatex(alpha)}`),
          t(" : les valeurs sans signe sont celles de "),
          l(`\\cos ${piLatex(alpha)}`),
          t(" et "),
          l(`\\sin ${piLatex(alpha)}`),
          t(`. Dans le ${nomQuadrant(q)}, le cosinus est ${signeCos} et le sinus ${signeSin}.`),
        ]),
      ];
    }
    default:
      return [
        [l("\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"), t(" : elle n'existe que si "), l("\\cos\\theta \\neq 0"), t(".")],
        souderPonctuation([t("Ici "), l(`\\sin\\theta = ${sinus(e).latex}`), t(" et "), l(`\\cos\\theta = ${cosinus(e).latex}`), t(" : divise le premier par le second, si c'est possible.")]),
      ];
  }
}

export function aideSaisie(ecran: number): string {
  if (ecran === 0) return "Écris l'angle exact en radians, par exemple 5π/6 (bouton π ou « pi »).";
  if (ecran === 2) return "Écris des valeurs exactes, par exemple −√3/2 ou 1/2 (boutons √ et π).";
  return "Écris une valeur exacte, par exemple −√3/3, ou utilise le bouton « n'existe pas ».";
}

// ---------------------------------------------------------------------------------------------
// Messages ciblés
// ---------------------------------------------------------------------------------------------

export const MSG_HORS_INTERVALLE: Fragments = [t("C'est bien le même point image, mais l'angle demandé doit être dans "), l(INTERVALLE), t(" : ajoute ou retire encore un tour.")];
export const MSG_DEMI_TOUR: Fragments = [t("Tu as ajouté ou retiré un demi-tour "), l("\\pi"), t(" : seuls des tours complets "), l("2\\pi"), t(" gardent le même point image.")];
export const MSG_DEGRES: Fragments = [t("C'est une mesure en degrés : écris l'angle en radians, avec "), l("\\pi"), t(".")];
export const MSG_ECHANGE: Fragments = [t("Tu as échangé les deux : "), l("\\cos\\theta"), t(" est l'abscisse de M (lue sur l'axe horizontal), "), l("\\sin\\theta"), t(" son ordonnée.")];

export function messageSigne(e: E): Fragments {
  return [t(`Le signe est faux : regarde de quel côté des axes se trouve M (${nomQuadrant(quadrant(e))}).`)];
}

export const MSG_TAN_INVERSE: Fragments = [t("Tu as calculé "), l("\\dfrac{\\cos\\theta}{\\sin\\theta}"), t(" : la tangente vaut "), l("\\dfrac{\\sin\\theta}{\\cos\\theta}"), t(".")];
export const MSG_TAN_EXISTE: Fragments = [l("\\cos\\theta \\neq 0"), t(" ici : la tangente existe, calcule le quotient.")];
export const MSG_TAN_INEXISTANTE: Fragments = [l("\\cos\\theta = 0"), t(" ici : on ne peut pas diviser par 0.")];

/** Pour le corrigé : 2π·tours en LaTeX. */
export function toursLatex(e: E): string {
  return piSurD(mul(rat(2 * Math.abs(e.tours)), rat(1)), angle(e).d);
}

