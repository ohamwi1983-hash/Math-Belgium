/**
 * Textes des retours de saisie du 5e ch. 2 (audit 5e ch. 2, lot B), sur le modèle de
 * `4e/ui/aidesSecondDegre.ts` :
 * - aides à DEUX niveaux par écran (`AideTrig`) : niveau 1 = la propriété du cours, niveau 2 = son
 *   application à l'instance ; une phrase terminée par « : », puis la formule en KaTeX — jamais de
 *   notation clavier, jamais de majuscules d'insistance, jamais la réponse ;
 * - messages CIBLÉS sur une erreur du cours trahie par la réponse fausse (degrés dans s = rθ, ½
 *   oublié, T pris pour ω, φ pris pour Φ, seconde série oubliée…) : `null` si la réponse ne trahit
 *   aucune erreur connue (message générique).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { ExerciceModeConversion, ExerciceModeDeuxVersTrois, QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import { labelSommet } from "./formatPolygonesArcsSecteurs";
import type { ParametresSinusoideBase } from "../core5e/parametresSinusoide.types";
import { inverseRationnelPi, multiplierRationnelPi, valeurNumerique } from "../generateurs5e/parametresSinusoide/rationnelPi";
import { formatRationnelPiLatex, phiRetenu } from "./formatParametresSinusoideGraphique";
import type { ExerciceEgaliteExpressions, ExerciceEquationTrig, ExerciceProduitFacteurs, FonctionTrig } from "../core5e/equationsTrigonometriques.types";
import { lireReseau, memesReunions } from "../moteur5e/reseauxSolutionsTrig";
import type { Reseau } from "../moteur5e/reseauxSolutionsTrig";
import { lireSerieEnX, memesSeriesEnX } from "../moteur5e/verificationExtremumsSinusoide";
import type { CalculSegmentCirculaire, ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../moteur5e/typesGeometrieCercle";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";

/** Un niveau d'aide : une phrase (texte et petites formules en ligne), puis des formules en bloc. */
export interface AideTrig {
  texte: FragmentConsigne[];
  formules?: string[];
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Valeur numérique d'une saisie (null si illisible). */
export function lireValeurTrig(texte: string, variables: Record<string, number> = {}): number | null {
  try {
    const v = evaluerExpressionGenerale(texte, 0, variables);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Égalité à la précision d'une réponse arrondie au centième (ou 0,1 % pour les grandes valeurs). */
export function proche(a: number, b: number, tolerance = 0.011): boolean {
  return Math.abs(a - b) <= Math.max(tolerance, 1e-3 * Math.abs(b));
}

/** Premier message dont la condition est vraie pour la valeur saisie (null : aucun). */
function premierMessage(texte: string, regles: [number | null | undefined, FragmentConsigne[]][], cible?: number): FragmentConsigne[] | null {
  const v = lireValeurTrig(texte);
  if (v === null) return null;
  if (cible !== undefined && proche(v, cible)) return null;
  for (const [valeur, message] of regles) {
    if (valeur === null || valeur === undefined || !Number.isFinite(valeur)) continue;
    if (cible !== undefined && proche(valeur, cible)) continue;
    if (proche(v, valeur)) return message;
  }
  return null;
}

// ============================================================================
// Messages communs (erreurs du cours)
// ============================================================================

const MSG_DEGRES_DANS_FORMULE = [t("Dans "), l("s = r\\theta"), t(" et "), l("A = \\tfrac{1}{2}r^2\\theta"), t(", l'angle θ s'exprime en radians, jamais en degrés.")];
const MSG_DEMI_OUBLIE = [t("L'aire d'un secteur porte un facteur "), l("\\tfrac{1}{2}"), t(" : "), l("A = \\tfrac{1}{2}r^2\\theta"), t(".")];
const MSG_SENS_DEG_RAD = [t("Pour passer des degrés aux radians, on multiplie par "), l("\\tfrac{\\pi}{180}"), t(" (et par "), l("\\tfrac{180}{\\pi}"), t(" dans l'autre sens).")];
const MSG_RACINE_OUBLIEE = [t("De "), l("A = \\tfrac{1}{2}r^2\\theta"), t(", on tire "), l("r^2 = \\tfrac{2A}{\\theta}"), t(" : il reste à prendre la racine carrée.")];
const MSG_UNITE_DEMANDEE_RAD = [t("L'angle est demandé en radians : convertis la mesure en degrés.")];
const MSG_UNITE_DEMANDEE_DEG = [t("L'angle est demandé en degrés : convertis la mesure en radians.")];

// ============================================================================
// 5gen6 — arcs et secteurs
// ============================================================================

export function messageCibleArcSecteur(texte: string, exercice: ExerciceModeDeuxVersTrois, quantite: QuantiteArcSecteur): FragmentConsigne[] | null {
  const { thetaDeg, thetaRad, r, l: s, A } = exercice.valeurs;
  const cible = exercice.valeurs[quantite];
  switch (quantite) {
    case "thetaRad":
      return premierMessage(texte, [[(thetaDeg * 180) / Math.PI, MSG_SENS_DEG_RAD], [thetaDeg, MSG_UNITE_DEMANDEE_RAD]], cible);
    case "thetaDeg":
      return premierMessage(texte, [[(thetaRad * Math.PI) / 180, MSG_SENS_DEG_RAD], [thetaRad, MSG_UNITE_DEMANDEE_DEG]], cible);
    case "l":
      return premierMessage(texte, [[r * thetaDeg, MSG_DEGRES_DANS_FORMULE], [A / r, MSG_DEMI_OUBLIE]], cible);
    case "A":
      return premierMessage(texte, [[r * r * thetaRad, MSG_DEMI_OUBLIE], [0.5 * r * r * thetaDeg, MSG_DEGRES_DANS_FORMULE], [r * s, MSG_DEMI_OUBLIE], [r * thetaRad * 0.5, [t("Le rayon est au carré : "), l("A = \\tfrac{1}{2}r^2\\theta"), t(".")]]], cible);
    case "r":
      return premierMessage(texte, [[(2 * A) / thetaRad, MSG_RACINE_OUBLIEE], [s * thetaRad, [t("De "), l("s = r\\theta"), t(", on tire r en divisant s par θ.")]], [s / ((thetaRad * 180) / Math.PI), MSG_DEGRES_DANS_FORMULE], [A / s, MSG_DEMI_OUBLIE]], cible);
  }
}

export function messageCibleConversion(texte: string, exercice: ExerciceModeConversion): FragmentConsigne[] | null {
  const d = exercice.valeurDepart;
  const inverse = exercice.direction === "degVersRad" ? (d * 180) / Math.PI : (d * Math.PI) / 180;
  return premierMessage(texte, [[inverse, MSG_SENS_DEG_RAD]], exercice.valeurCible);
}

/** Aides de la conversion : la règle, puis la multiplication à faire. */
export function aidesConversion(latexNiveau2: string): AideTrig[] {
  return [
    { texte: [t("Un tour complet mesure 360°, soit 2π radians. Pour convertir, on multiplie :")], formules: ["\\theta_{rad} = \\theta° \\times \\dfrac{\\pi}{180} \\qquad \\theta° = \\theta_{rad} \\times \\dfrac{180}{\\pi}"] },
    { texte: [t("Ici, il reste à calculer :")], formules: [latexNiveau2] },
  ];
}

/** Aides d'une quantité (2 → 3) : formules du cours utilisables, puis la première substituée. */
export function aidesQuantiteArcSecteur(formulesGenerales: string[], latexNiveau2: string, substituee: boolean): AideTrig[] {
  return [
    { texte: [t(formulesGenerales.length > 1 ? "Formules du cours qui relient cette grandeur à celles que tu connais (θ en radians) :" : "Formule du cours qui relie cette grandeur à celles que tu connais (θ en radians) :")], formules: formulesGenerales },
    { texte: [t(substituee ? "Avec les valeurs connues, il reste à calculer :" : "Calcule d'abord les grandeurs qui y figurent, puis applique :")], formules: [latexNiveau2] },
  ];
}

// ============================================================================
// 5gen7 — polygones, arcs et secteurs
// ============================================================================

export function aidesPolygone(exercice: ExercicePolygonesArcsSecteurs, phase: PhasePolygonesArcsSecteurs): AideTrig[] {
  const { r, n } = exercice;
  switch (phase) {
    case "cercleEntier":
      return [
        { texte: [t("La circonférence et l'aire d'un cercle de rayon r valent :")], formules: ["C = 2\\pi r \\qquad \\mathcal{A} = \\pi r^2"] },
        { texte: [t("Ici, r = " + r + " :")], formules: [`C = 2\\pi \\times ${r} \\qquad \\mathcal{A} = \\pi \\times ${r}^2`] },
      ];
    case "arcElementaire":
      return [
        { texte: [t("Les " + n + " sommets partagent le cercle en " + n + " arcs égaux : un arc élémentaire est la fraction "), l(`\\tfrac{1}{${n}}`), t(" de la circonférence :")], formules: ["s = \\dfrac{1}{n} \\times 2\\pi r"] },
        { texte: [t("Ici, il reste à calculer :")], formules: [`s = \\dfrac{1}{${n}} \\times 2\\pi \\times ${r}`] },
      ];
    case "secteurElementaire":
      return [
        { texte: [t("Les " + n + " rayons partagent le disque en " + n + " secteurs égaux : un secteur élémentaire est la fraction "), l(`\\tfrac{1}{${n}}`), t(" de l'aire du disque :")], formules: ["A = \\dfrac{1}{n} \\times \\pi r^2"] },
        { texte: [t("Ici, il reste à calculer :")], formules: [`A = \\dfrac{1}{${n}} \\times \\pi \\times ${r}^2`] },
      ];
    case "arcMultiPas":
    case "secteurMultiPas": {
      const arc = phase === "arcMultiPas";
      const seg = arc ? exercice.arcMultiPas : exercice.secteurMultiPas;
      return [
        {
          texte: [t(arc ? "Un arc qui couvre k côtés du polygone est la fraction " : "Un secteur qui couvre k côtés du polygone est la fraction "), l(`\\tfrac{k}{${n}}`), t(arc ? " de la circonférence (compte les côtés, pas les sommets) :" : " de l'aire du disque (compte les côtés, pas les sommets) :")],
          formules: [arc ? `s = \\dfrac{k}{${n}} \\times 2\\pi r` : `A = \\dfrac{k}{${n}} \\times \\pi r^2`],
        },
        seg
          ? {
              texte: [t(`De ${labelSommet(seg.indexDepart)} à ${labelSommet(seg.indexArrivee)}, ${arc ? "l'arc surligné" : "le secteur surligné"} couvre ${seg.k} côtés sur ${n} : c'est la fraction `), l(`\\tfrac{${seg.k}}{${n}}`), t(" du cercle. Il reste à calculer :")],
              formules: [arc ? `s = \\dfrac{${seg.k}}{${n}} \\times 2\\pi \\times ${r}` : `A = \\dfrac{${seg.k}}{${n}} \\times \\pi \\times ${r}^2`],
            }
          : { texte: [t("Compte les côtés couverts, puis calcule cette fraction du cercle.")] },
      ];
    }
  }
}

export function messageCiblePolygone(texte: string, exercice: ExercicePolygonesArcsSecteurs, phase: Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">, cible: number): FragmentConsigne[] | null {
  const { r, n } = exercice;
  const C = 2 * Math.PI * r;
  const D = Math.PI * r * r;
  const MSG_ARC_AIRE = [t("Un arc est une fraction de la circonférence "), l("2\\pi r"), t(", un secteur une fraction de l'aire "), l("\\pi r^2"), t(".")];
  const MSG_FRACTION = [t("Un côté sur " + n + " : on prend "), l(`\\tfrac{1}{${n}}`), t(" du cercle, donc on divise par " + n + ".")];
  const MSG_COMPTE = [t("Recompte les côtés du polygone couverts (et non les sommets) : entre deux sommets consécutifs, il y a un côté.")];
  switch (phase) {
    case "arcElementaire":
      return premierMessage(texte, [[D / n, MSG_ARC_AIRE], [C * n, MSG_FRACTION], [C, MSG_FRACTION], [(Math.PI * r) / n, [t("La circonférence vaut "), l("2\\pi r"), t(" : n'oublie pas le facteur 2.")]]], cible);
    case "secteurElementaire":
      return premierMessage(texte, [[C / n, MSG_ARC_AIRE], [D * n, MSG_FRACTION], [D, MSG_FRACTION]], cible);
    case "arcMultiPas":
    case "secteurMultiPas": {
      const seg = phase === "arcMultiPas" ? exercice.arcMultiPas : exercice.secteurMultiPas;
      const total = phase === "arcMultiPas" ? C : D;
      const autre = phase === "arcMultiPas" ? D : C;
      if (!seg) return null;
      return premierMessage(
        texte,
        [
          [(seg.k * autre) / n, MSG_ARC_AIRE],
          [((seg.k + 1) * total) / n, MSG_COMPTE],
          [((seg.k - 1) * total) / n, MSG_COMPTE],
          [total / n, [t("L'arc surligné couvre plusieurs côtés du polygone : compte-les.")]],
          [((n - seg.k) * total) / n, [t("Le calcul donne la partie non surlignée : compte les côtés couverts par la partie surlignée.")]],
        ],
        cible,
      );
    }
  }
}

export function messageCibleCercleEntier(champ: "circonference" | "aire", texte: string, exercice: ExercicePolygonesArcsSecteurs): FragmentConsigne[] | null {
  const r = exercice.r;
  const C = 2 * Math.PI * r;
  const D = Math.PI * r * r;
  if (champ === "circonference") return premierMessage(texte, [[D, [t("La circonférence vaut "), l("2\\pi r"), t(" ; "), l("\\pi r^2"), t(" est l'aire.")]], [Math.PI * r, [t("La circonférence vaut "), l("2\\pi r"), t(" : n'oublie pas le facteur 2.")]]], C);
  return premierMessage(texte, [[C, [t("L'aire du disque vaut "), l("\\pi r^2"), t(" ; "), l("2\\pi r"), t(" est la circonférence.")]], [2 * Math.PI * r * r, [t("L'aire du disque vaut "), l("\\pi r^2"), t(", sans facteur 2.")]], [Math.PI * 2 * r, [t("Le rayon est au carré : "), l("\\pi r^2"), t(".")]]], D);
}

// ============================================================================
// 5gen8 et 5gen9 — paramètres d'une sinusoïde
// ============================================================================

/** a ≡ b à une période près. */
function procheModulo(a: number, b: number, periode: number): boolean {
  const e = a - b;
  return Math.abs(e - Math.round(e / periode) * periode) <= 0.011;
}

/** Premier message dont la valeur (à une période près) correspond à la saisie. */
function premierMessageModulo(texte: string, regles: [number, FragmentConsigne[]][], cible: number, periode: number): FragmentConsigne[] | null {
  const v = lireValeurTrig(texte);
  if (v === null || procheModulo(v, cible, periode)) return null;
  for (const [valeur, message] of regles) {
    if (!Number.isFinite(valeur) || procheModulo(valeur, cible, periode)) continue;
    if (procheModulo(v, valeur, periode)) return message;
  }
  return null;
}

const MSG_AMPLITUDE_POSITIVE = [t("L'amplitude est toujours positive : c'est la valeur absolue du coefficient du sinus, "), l("|A|"), t(".")];
const MSG_T_OMEGA = [t("La pulsation ω et la période T sont liées par "), l("T = \\tfrac{2\\pi}{\\omega}"), t(" : ce ne sont pas le même nombre.")];
const MSG_FREQUENCE = [t("La fréquence est l'inverse de la période : "), l("\\tfrac{1}{T}"), t(".")];
const MSG_PHI_PHI = [t("Le déphasage φ et le décalage horizontal Φ ne sont pas le même nombre : "), l("\\varphi = -\\omega\\Phi"), t(".")];
const MSG_SIGNE_PHI = [t("Attention au signe : "), l("\\varphi = -\\omega\\Phi"), t(" et "), l("\\Phi = -\\tfrac{\\varphi}{\\omega}"), t(".")];
const MSG_SIGNE_B = [t("Le décalage vertical garde son signe : c'est le terme constant ajouté après le sinus.")];

/** Valeurs numériques d'une sinusoïde (5gen8) utiles aux messages ciblés. */
export interface ValeursSinusoide {
  A: number;
  omega: number;
  T: number;
  phi: number;
  Phi: number;
  b: number;
}

export type PhaseSinusoideTrig = "amplitude" | "pulsation" | "periode" | "frequence" | "dephasage" | "phi" | "decalage";

export function messageCibleParametreSinusoide(texte: string, phase: PhaseSinusoideTrig, v: ValeursSinusoide): FragmentConsigne[] | null {
  const deuxPi = 2 * Math.PI;
  switch (phase) {
    case "amplitude":
      return premierMessage(texte, [[v.A, MSG_AMPLITUDE_POSITIVE]], Math.abs(v.A));
    case "pulsation":
      return premierMessage(texte, [[v.T, MSG_T_OMEGA], [v.T / deuxPi, MSG_T_OMEGA], [1 / v.T, MSG_T_OMEGA]], v.omega);
    case "periode":
      return premierMessage(texte, [[v.omega, MSG_T_OMEGA], [v.omega / deuxPi, MSG_T_OMEGA], [1 / v.T, MSG_FREQUENCE]], v.T);
    case "frequence":
      return premierMessage(texte, [[v.T, MSG_FREQUENCE], [v.omega, MSG_FREQUENCE]], 1 / v.T);
    case "dephasage":
      return premierMessageModulo(texte, [[v.Phi, MSG_PHI_PHI], [-v.phi, MSG_SIGNE_PHI], [-v.Phi, MSG_PHI_PHI]], v.phi, deuxPi);
    case "phi":
      return premierMessageModulo(texte, [[v.phi, MSG_PHI_PHI], [-v.Phi, MSG_SIGNE_PHI], [-v.phi, MSG_PHI_PHI]], v.Phi, v.T);
    case "decalage":
      return premierMessage(texte, [[-v.b, MSG_SIGNE_B]], v.b);
  }
}

/** 5gen8 : la règle du cours (texte + formule existants), puis où lire / quoi calculer ici. */
export function aidesParametreSinusoide(niveau1: { texte: string; latex: string | null }, latexNiveau2: string, lecture: boolean): AideTrig[] {
  return [
    { texte: [t(niveau1.texte)], formules: niveau1.latex ? [niveau1.latex] : [] },
    { texte: [t(lecture ? "Dans la formule de cette fonction, la partie à lire est repérée par l'accolade :" : "Ici, il reste à calculer :")], formules: [latexNiveau2] },
  ];
}

/** 5gen9 : lecture sur le graphique (points mis en évidence au niveau 2), ou calcul avec les valeurs
 * déjà trouvées (`T`, `omega`, `x0` en LaTeX exact). */
export function aidesParametreGraphique(phase: PhaseSinusoideTrig, valeurs: { T: string; omega: string; x0: string }): AideTrig[] {
  const frac = (x: string) => x.replace(/\\dfrac/g, "\\frac");
  const par = (x: string) => (x.startsWith("-") ? `\\left(${x}\\right)` : x);
  switch (phase) {
    case "decalage":
      return [
        { texte: [t("Le décalage vertical b est l'ordonnée de la ligne médiane, à mi-chemin entre le maximum et le minimum (ce n'est pas forcément l'axe des abscisses) :")], formules: ["b = \\dfrac{\\max f + \\min f}{2}"] },
        { texte: [t("Lis sur la courbe l'ordonnée du point le plus haut et celle du point le plus bas, puis calcule leur moyenne.")] },
      ];
    case "amplitude":
      return [
        { texte: [t("L'amplitude est la distance d'un sommet à la ligne médiane : la moitié de l'écart entre le maximum et le minimum, jamais l'écart complet :")], formules: ["|A| = \\dfrac{\\max f - \\min f}{2}"] },
        { texte: [t("Repère un sommet mis en évidence et la ligne médiane trouvée à l'écran précédent : l'amplitude est l'écart vertical entre les deux.")] },
      ];
    case "periode":
      return [
        { texte: [t("La période T est l'écart horizontal entre deux maximums consécutifs (ou deux minimums consécutifs) ; entre un maximum et le minimum suivant, il n'y a qu'une demi-période :")], formules: ["T = x_{\\max,2} - x_{\\max,1}"] },
        { texte: [t("Lis les abscisses des deux maximums consécutifs mis en évidence, puis calcule leur écart.")] },
      ];
    case "pulsation":
      return [
        { texte: [t("La pulsation se déduit de la période :")], formules: ["\\omega = \\dfrac{2\\pi}{T}"] },
        { texte: [t("Avec la période trouvée, il reste à calculer :")], formules: [`\\omega = \\dfrac{2\\pi}{${frac(valeurs.T)}}`] },
      ];
    case "frequence":
      return [
        { texte: [t("La fréquence est l'inverse de la période :")], formules: ["\\text{fréquence} = \\dfrac{1}{T}"] },
        { texte: [t("Avec la période trouvée, il reste à calculer :")], formules: [`\\text{fréquence} = \\dfrac{1}{${frac(valeurs.T)}}`] },
      ];
    case "phi":
      return [
        { texte: [t("Le décalage horizontal Φ est l'abscisse x₀ d'un passage de la courbe par la ligne médiane en montant (un passage en descendant est décalé d'une demi-période) :")], formules: ["\\Phi = x_0"] },
        { texte: [t("Repère le point mis en évidence où la courbe traverse la ligne médiane en montant, juste après un minimum, et lis son abscisse.")] },
      ];
    case "dephasage":
      return [
        { texte: [t("Le déphasage se déduit de la pulsation et d'un passage ascendant x₀ (à 2π près) :")], formules: ["\\varphi = -\\omega\\, x_0"] },
        { texte: [t("Avec ω et x₀ trouvés aux écrans précédents, il reste à calculer :")], formules: [`\\varphi = -${par(valeurs.omega)} \\times ${par(valeurs.x0)}`] },
      ];
  }
}

export function messageCibleParametreGraphique(texte: string, phase: PhaseSinusoideTrig, v: { A: number; b: number; T: number; x0: number }): FragmentConsigne[] | null {
  const omega = (2 * Math.PI) / v.T;
  const max = v.b + v.A;
  const min = v.b - v.A;
  const MSG_MEDIANE = [t("La ligne médiane est à mi-hauteur entre le maximum et le minimum : "), l("b = \\tfrac{\\max f + \\min f}{2}"), t(".")];
  switch (phase) {
    case "decalage":
      return premierMessage(texte, [[0, MSG_MEDIANE], [max, MSG_MEDIANE], [min, MSG_MEDIANE]], v.b);
    case "amplitude":
      return premierMessage(texte, [[2 * v.A, [t("L'amplitude est la moitié de l'écart entre le maximum et le minimum, jamais l'écart complet.")]], [max, [t("L'amplitude est la distance d'un sommet à la ligne médiane, pas l'ordonnée du sommet.")]]], v.A);
    case "periode":
      return premierMessage(texte, [[v.T / 2, [t("Entre un maximum et le minimum suivant, il n'y a qu'une demi-période : prends deux maximums consécutifs.")]], [v.T / 4, [t("La période va d'un maximum au maximum suivant.")]], [omega, MSG_T_OMEGA]], v.T);
    case "pulsation":
      return premierMessage(texte, [[v.T, MSG_T_OMEGA], [v.T / (2 * Math.PI), MSG_T_OMEGA], [1 / v.T, MSG_T_OMEGA]], omega);
    case "frequence":
      return premierMessage(texte, [[v.T, MSG_FREQUENCE], [omega, MSG_FREQUENCE]], 1 / v.T);
    case "phi":
      return premierMessageModulo(
        texte,
        [
          [v.x0 + v.T / 2, [t("À cet endroit, la courbe traverse la ligne médiane en descendant : prends un passage en montant.")]],
          [v.x0 + v.T / 4, [t("C'est l'abscisse d'un maximum : le passage en montant par la ligne médiane est un quart de période plus tôt.")]],
          [v.x0 - v.T / 4, [t("C'est l'abscisse d'un minimum : le passage en montant par la ligne médiane est un quart de période plus tard.")]],
        ],
        v.x0,
        v.T,
      );
    case "dephasage":
      return premierMessageModulo(texte, [[omega * v.x0, MSG_SIGNE_PHI], [v.x0, MSG_PHI_PHI], [-v.x0, MSG_PHI_PHI]], -omega * v.x0, 2 * Math.PI);
  }
}

/** 5gen9 : valeurs exactes (LaTeX) et numériques de l'instance — mêmes fonctions que l'écran et le
 * corrigé (`phiRetenu`). */
export function valeursGraphique(exercice: ParametresSinusoideBase):{ latex: { T: string; omega: string; x0: string }; nombres: { A: number; b: number; T: number; x0: number } } {
  const omega = multiplierRationnelPi({ numerateur: 2, denominateur: 1, degrePi: 1 }, inverseRationnelPi(exercice.T));
  const x0 = phiRetenu(exercice);
  const A = exercice.A.rationnelle ? exercice.A.rationnelle.numerateur / exercice.A.rationnelle.denominateur : Math.sqrt(exercice.A.radicande ?? 0);
  return {
    latex: { T: formatRationnelPiLatex(exercice.T), omega: formatRationnelPiLatex(omega), x0: formatRationnelPiLatex(x0) },
    nombres: { A, b: exercice.b, T: valeurNumerique(exercice.T), x0: valeurNumerique(x0) },
  };
}

// ============================================================================
// 5gen10 (et 5gen11, 5gen13) — équations trigonométriques
// ============================================================================

const NOM_FN: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
const DEUX_PI = 2 * Math.PI;

function versReseauxTrig(branches: { constante: { decimal: number }; periode: { decimal: number } }[]): Reseau[] {
  return branches.map((b) => ({ constante: b.constante.decimal, periode: b.periode.decimal }));
}

/** Séries lues (null : une ligne illisible ; "nonAffine" : une ligne sans k ou non affine en k). */
function lireSeries(lignes: string[]): Reseau[] | "nonAffine" | null {
  const lus = lignes.map(lireReseau);
  if (lus.some((r) => r === null)) return null;
  if (lus.some((r) => r === "nonAffine")) return "nonAffine";
  return lus as Reseau[];
}

const MSG_SERIE_AVEC_K = [t("Chaque ligne est une série : une constante plus k fois la période, par exemple "), l("\\tfrac{\\pi}{6} + 2k\\pi"), t(".")];

/** Formules du cours pour trig(u) = c (u : l'argument). */
export function formuleSeriesCours(fonction: FonctionTrig, u = "u"): string {
  if (fonction === "sin") return `\\sin ${u} = \\sin\\alpha \\iff ${u} = \\alpha + 2k\\pi \\ \\text{ ou } \\ ${u} = \\pi - \\alpha + 2k\\pi`;
  if (fonction === "cos") return `\\cos ${u} = \\cos\\alpha \\iff ${u} = \\alpha + 2k\\pi \\ \\text{ ou } \\ ${u} = -\\alpha + 2k\\pi`;
  return `\\tan ${u} = \\tan\\alpha \\iff ${u} = \\alpha + k\\pi`;
}

function phraseSeriesCours(fonction: FonctionTrig): string {
  if (fonction === "sin") return "Deux angles supplémentaires (α et π − α) ont le même sinus ; si |c| > 1, il n'y a aucune solution :";
  if (fonction === "cos") return "Deux angles opposés (α et −α) ont le même cosinus ; si |c| > 1, il n'y a aucune solution :";
  return "La tangente ne donne qu'une série de solutions, de période π :";
}

function msgSecondeSerie(fonction: FonctionTrig): FragmentConsigne[] {
  return fonction === "sin"
    ? [t("Il manque une série : deux angles supplémentaires, α et π − α, ont le même sinus.")]
    : [t("Il manque une série : deux angles opposés, α et −α, ont le même cosinus.")];
}

/** Message ciblé d'un écran « séries de l'argument » (trig(u) = c). */
export function messageCibleArgument(
  fonction: FonctionTrig,
  branchesU: { constante: { decimal: number }; periode: { decimal: number } }[],
  aucuneSolution: boolean,
  reponse: { aucuneSolution: boolean; lignes?: string[] },
): FragmentConsigne[] | null {
  if (aucuneSolution && !reponse.aucuneSolution) return [t("Le sinus et le cosinus restent compris entre −1 et 1 : ici, l'équation n'a aucune solution.")];
  if (!aucuneSolution && reponse.aucuneSolution) return [t(fonction === "tan" ? "La tangente prend toutes les valeurs réelles : l'équation a des solutions." : "Le second membre est compris entre −1 et 1 : l'équation a des solutions.")];
  if (reponse.aucuneSolution || !reponse.lignes) return null;
  const lus = lireSeries(reponse.lignes);
  if (lus === null) return null;
  if (lus === "nonAffine") return MSG_SERIE_AVEC_K;
  const attendus = versReseauxTrig(branchesU);
  if (memesReunions(lus, attendus)) return null;
  if (fonction !== "tan") {
    if (lus.some((r) => Math.abs(Math.abs(r.periode) - Math.PI) < 0.01)) return [t("Pour le sinus et le cosinus, la période des séries est "), l("2\\pi"), t(" ("), l("\\pi"), t(" seulement pour la tangente).")];
  } else if (lus.some((r) => Math.abs(Math.abs(r.periode) - DEUX_PI) < 0.01)) {
    return [t("Pour la tangente, la période des séries est "), l("\\pi"), t(" : une seule série suffit.")];
  }
  if (attendus.length === 2) {
    if (lus.every((s) => attendus.some((a) => memesReunions([s], [a])))) return msgSecondeSerie(fonction);
    for (const a of attendus) {
      const alpha = a.constante;
      const faux = fonction === "sin" ? [alpha, -alpha] : [alpha, Math.PI - alpha];
      if (memesReunions(lus, faux.map((c) => ({ constante: c, periode: DEUX_PI })))) {
        return fonction === "sin"
          ? [t("Pour le sinus, le second angle est π − α (angles supplémentaires) ; −α, c'est pour le cosinus.")]
          : [t("Pour le cosinus, le second angle est −α (angles opposés) ; π − α, c'est pour le sinus.")];
      }
    }
  }
  return null;
}

/** Message ciblé d'un écran « isoler x » (u = ax + b). */
export function messageCibleIsolerX(lignes: string[], branchesX: { constante: { decimal: number }; periode: { decimal: number } }[], a: number, b: number): FragmentConsigne[] | null {
  const lus = lireSeries(lignes);
  if (lus === null) return null;
  if (lus === "nonAffine") return MSG_SERIE_AVEC_K;
  const attendus = versReseauxTrig(branchesX);
  if (memesReunions(lus, attendus)) return null;
  if (a !== 1 && memesReunions(lus, attendus.map((r) => ({ constante: r.constante, periode: r.periode * a })))) {
    return [t("On divise chaque terme par a, la période aussi : "), l("\\tfrac{2k\\pi}{a}"), t(", pas "), l("2k\\pi"), t(".")];
  }
  if (b !== 0 && memesReunions(lus, attendus.map((r) => ({ constante: r.constante + (2 * b) / a, periode: r.periode })))) {
    return [t("Pour isoler x, on soustrait b des deux membres (attention au signe), puis on divise par a.")];
  }
  if (a !== 1 && b !== 0 && memesReunions(lus, attendus.map((r) => ({ constante: r.constante + b / a - b, periode: r.periode })))) {
    return [t("On soustrait b d'abord, puis on divise tout le membre de droite par a.")];
  }
  return null;
}

/** Message ciblé d'un écran « solutions dans [0 ; 2π[ ». */
/** `borne`, `fenetre` : fenêtre [0 ; borne[ (2π par défaut ; 5gen11 : deux périodes quand x s'écrit sans π). */
export function messageCibleSolutions(textes: string[], cible: number[], exclues: number[] = [], borne = DEUX_PI, fenetre = "[0 ; 2π["): FragmentConsigne[] | null {
  const valeurs: number[] = [];
  for (const texte of textes) {
    const v = lireValeurTrig(texte);
    if (v === null) return null;
    valeurs.push(v);
  }
  const dans = (v: number, liste: number[]) => liste.some((w) => Math.abs(v - w) <= 0.011);
  const enTrop = valeurs.filter((v) => !dans(v, cible));
  const manquantes = cible.filter((c) => !dans(c, valeurs));
  if (enTrop.some((v) => v < -0.005 || v > borne - 0.005)) return [t(`Garde seulement les valeurs de x comprises dans ${fenetre} : 0 compris, ${fenetre.slice(4, -1)} exclu.`)];
  if (enTrop.some((v) => dans(v, exclues))) return [t("En une de ces valeurs, une tangente de l'équation n'est pas définie : elle doit être écartée.")];
  if (enTrop.length === 0 && manquantes.length > 0) {
    if (valeurs.length > new Set(valeurs.map((v) => Math.round(v * 100))).size) return [t("Écris chaque solution une seule fois : deux séries peuvent donner la même valeur.")];
    return [t(`Il manque des solutions : dans chaque série, donne à k d'autres valeurs entières (…, −1, 0, 1, 2, …) tant que x reste dans ${fenetre}.`)];
  }
  return null;
}

/** Valeurs de [0 ; 2π[ où tan(ax + b) n'est pas définie (ax + b = π/2 + kπ). */
export function valeursInterditesTan(a: number, b: number): number[] {
  const res: number[] = [];
  for (let k = -60; k <= 60; k++) {
    const x = (Math.PI / 2 + k * Math.PI - b) / a;
    if (x >= -1e-9 && x < DEUX_PI - 1e-9) res.push(Math.max(0, x));
  }
  return res;
}

/** Aides de l'écran « séries de l'argument » : la propriété, puis l'équation de l'instance. */
export function aidesArgument(fonction: FonctionTrig, argument: string, cLatex: string): AideTrig[] {
  const arc = fonction === "sin" ? "\\arcsin" : fonction === "cos" ? "\\arccos" : "\\arctan";
  const u = `u = ${argument}`;
  const alpha = `\\alpha = ${arc}\\left(${cLatex}\\right)`;
  return [
    { texte: [t(phraseSeriesCours(fonction))], formules: [formuleSeriesCours(fonction)] },
    {
      texte: [t("Ici, on pose "), l(u), t(" et on cherche un angle α tel que "), l(`${NOM_FN[fonction]}\\alpha = ${cLatex}`), t(" (valeur remarquable, ou calculatrice) :")],
      formules: [alpha],
    },
  ];
}

/** Aides de l'écran « isoler x ». */
export function aidesIsolerX(substitutions: string[]): AideTrig[] {
  return [
    { texte: [t("Pour isoler x, on soustrait b, puis on divise chaque terme du membre de droite par a, la période aussi :")], formules: ["ax + b = \\alpha + 2k\\pi \\iff x = \\dfrac{\\alpha - b}{a} + \\dfrac{2k\\pi}{a}"] },
    { texte: [t("Ici, il reste à simplifier :")], formules: substitutions },
  ];
}

/** Aides d'un écran « solutions dans [0 ; 2π[ ». */
export function aidesSolutions(seriesLatex: string[], avecTangente = false): AideTrig[] {
  return [
    { texte: [t("Dans chaque série, donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) et garde toutes les valeurs de x comprises dans "), l("[0 ; 2\\pi["), t(avecTangente ? ", sauf celles où une tangente n'est pas définie :" : " :")], formules: ["0 \\leqslant x < 2\\pi"] },
    { texte: [t("Ici, les séries sont les suivantes ; un premier point est placé sur le cercle, retrouve les autres :")], formules: seriesLatex },
  ];
}

export function aidesPrefacteur(fnArg: string, cLatex: string): AideTrig[] {
  return [
    { texte: [t("Les deux membres contiennent la même fonction trigonométrique : ramène tout dans le membre de gauche, puis mets-la en évidence (ne divise jamais par elle, tu perdrais des solutions) :")], formules: ["X^2 = cX \\iff X^2 - cX = 0 \\iff X(X - c) = 0"] },
    { texte: [t("Ici, "), l(`X = ${fnArg}`), t(" et "), l(`c = ${cLatex}`), t(".")] },
  ];
}

export function aidesSeparerFacteurs(): AideTrig[] {
  return [
    { texte: [t("Un produit est nul si et seulement si l'un de ses facteurs est nul : on écrit deux équations, reliées par « ou » :")], formules: ["A \\cdot B = 0 \\iff A = 0 \\ \\text{ ou } \\ B = 0"] },
    { texte: [t("Ici, chaque parenthèse égalée à 0 donne une équation ; écris-la sous la forme "), l("\\sin(\\ldots) = c"), t(", "), l("\\cos(\\ldots) = c"), t(" ou "), l("\\tan(\\ldots) = c"), t(".")] },
  ];
}

export function aidesConversionPythagoricienne(identite: string, fonctionCible: "cos" | "sin"): AideTrig[] {
  return [
    { texte: [t("La relation fondamentale permet de remplacer le carré de l'autre fonction :")], formules: ["\\sin^2 x + \\cos^2 x = 1", identite] },
    { texte: [t(`Remplace, distribue le coefficient, puis réduis : il ne doit plus rester que ${fonctionCible}(x) et son carré.`)] },
  ];
}

export function aidesRacinesPythagoricienne(equationEnT: string): AideTrig[] {
  return [
    { texte: [t("Avec t = cos(x) ou sin(x), c'est une équation du second degré en t : discriminant, ou mise en évidence, ou produit remarquable :")], formules: ["at^2 + bt + c = 0 \\qquad \\Delta = b^2 - 4ac \\qquad t = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}"] },
    { texte: [t("Ici, l'équation en t est :")], formules: [equationEnT] },
  ];
}

export function aidesRacinesResolution(fonctionCible: "cos" | "sin"): AideTrig[] {
  return [
    { texte: [t(`${fonctionCible}(x) reste toujours compris entre −1 et 1 : une racine hors de cet intervalle ne donne aucune solution et doit être rejetée :`)], formules: [`-1 \\leqslant \\${fonctionCible} x \\leqslant 1`] },
    { texte: [t("Pour une racine gardée, écris les deux séries du cours :")], formules: [formuleSeriesCours(fonctionCible, "x")] },
  ];
}

export function aidesConversionEgalite(texteNiveau1: string, latexNiveau1: string, latexNiveau2: string): AideTrig[] {
  return [
    { texte: [t(texteNiveau1)], formules: [latexNiveau1] },
    { texte: [t("Ici, le membre de droite devient :")], formules: [latexNiveau2] },
  ];
}

export function aidesResoudreEgalite(fonction: FonctionTrig, egaliteArguments: string): AideTrig[] {
  const phrase = fonction === "tan" ? "Deux tangentes égales : une seule série, de période π (k entier) :" : fonction === "sin" ? "Deux sinus égaux : deux séries, angles égaux ou supplémentaires (k entier) :" : "Deux cosinus égaux : deux séries, angles égaux ou opposés (k entier) :";
  const formule = fonction === "tan" ? "\\tan A = \\tan B \\iff A = B + k\\pi" : fonction === "sin" ? "\\sin A = \\sin B \\iff A = B + 2k\\pi \\ \\text{ ou } \\ A = \\pi - B + 2k\\pi" : "\\cos A = \\cos B \\iff A = B + 2k\\pi \\ \\text{ ou } \\ A = -B + 2k\\pi";
  return [
    { texte: [t(phrase)], formules: [formule] },
    { texte: [t("Ici, égale les arguments, puis isole x dans chaque série (la période est divisée aussi) :")], formules: [egaliteArguments] },
  ];
}

/** « Diviser par la fonction » au lieu de factoriser : une réponse sans produit ni carré. */
export function messageCiblePrefacteur(texte: string): FragmentConsigne[] | null {
  if (/\^|²|\)\s*\(|\)\s*[·*×.]\s*[(a-z]/i.test(texte)) return null;
  return [t("Mets la fonction trigonométrique en évidence au lieu de diviser par elle : diviser ferait perdre les solutions où elle s'annule.")];
}

/** « Équation 1 : … » devant le message d'un des deux facteurs (null si aucun message). */
export function messageFacteur(numero: 1 | 2, message: FragmentConsigne[] | null): FragmentConsigne[] | null {
  return message ? [t(`Équation ${numero} : `), ...message] : null;
}

/** Racines d'une équation du second degré : signes inversés (−b oublié). */
export function messageCibleRacines(textes: string[], t1: number, t2: number): FragmentConsigne[] | null {
  const v = textes.map((x) => lireValeurTrig(x));
  if (v.some((x) => x === null) || v.length !== 2) return null;
  const [a, b] = v as number[];
  const memes = (x: number, y: number, p: number, q: number) => (proche(x, p) && proche(y, q)) || (proche(x, q) && proche(y, p));
  if (memes(a, b, t1, t2)) return null;
  if (memes(a, b, -t1, -t2)) return [t("Vérifie les signes : les racines valent "), l("\\tfrac{-b \\pm \\sqrt{\\Delta}}{2a}"), t(", avec −b.")];
  return null;
}

/** Racine t d'une substitution : |t| > 1 gardée, ou racine valable rejetée ; sinon séries. */
export function messageCibleRacine(fonctionCible: "cos" | "sin", racine: { t: number; invalide: boolean; resolution: { branchesU: { constante: { decimal: number }; periode: { decimal: number } }[] } | null }, reponse: { rejeter: boolean; lignes?: string[] }): FragmentConsigne[] | null {
  if (racine.invalide && !reponse.rejeter) return [t(`${fonctionCible}(x) reste compris entre −1 et 1 : une racine t telle que |t| > 1 ne donne aucune solution, elle doit être rejetée.`)];
  if (!racine.invalide && reponse.rejeter) return [t("Cette racine est comprise entre −1 et 1 : elle donne des solutions, garde-la.")];
  if (reponse.rejeter || !racine.resolution) return null;
  return messageCibleArgument(fonctionCible, racine.resolution.branchesU, false, { aucuneSolution: false, lignes: reponse.lignes });
}

/** Séries finales en x (égalité de deux fonctions) : série oubliée, période non divisée. */
export function messageCibleSeriesX(lignes: string[], branches: { constante: { decimal: number }; periode: { decimal: number } }[], fonction: FonctionTrig): FragmentConsigne[] | null {
  const lus = lireSeries(lignes);
  if (lus === null) return null;
  if (lus === "nonAffine") return MSG_SERIE_AVEC_K;
  const attendus = versReseauxTrig(branches);
  if (memesReunions(lus, attendus)) return null;
  if (fonction !== "tan" && attendus.length === 2 && lus.every((s) => attendus.some((a) => memesReunions([s], [a])))) return msgSecondeSerie(fonction);
  const periodesAttendues = attendus.map((a) => Math.abs(a.periode));
  if (lus.some((s) => !periodesAttendues.some((p) => Math.abs(Math.abs(s.periode) - p) < 0.01) && [Math.PI, DEUX_PI].some((p) => Math.abs(Math.abs(s.periode) - p) < 0.01))) {
    return [t("En isolant x, on divise tout le membre de droite par le coefficient de x, la période aussi.")];
  }
  return null;
}

/** Aides de l'écran « séries de l'argument » pour les deux équations d'un produit. */
export function aidesArgumentProduit(f1: ExerciceEquationTrig, f2: ExerciceEquationTrig): AideTrig[] {
  const fonctions = [...new Set([f1.fonction, f2.fonction])];
  const arc = (f: FonctionTrig) => (f === "sin" ? "\\arcsin" : f === "cos" ? "\\arccos" : "\\arctan");
  return [
    { texte: [t("Pour chaque équation, applique la propriété du cours (si |c| > 1 pour sin ou cos, aucune solution) :")], formules: fonctions.map((f) => formuleSeriesCours(f)) },
    {
      texte: [t("Ici, cherche pour chaque équation un angle α dont la fonction vaut le second membre :")],
      formules: [`\\alpha_1 = ${arc(f1.fonction)}\\left(${f1.k.latex}\\right)`, `\\alpha_2 = ${arc(f2.fonction)}\\left(${f2.k.latex}\\right)`],
    },
  ];
}

/** Valeurs de [0 ; 2π[ où une tangente du produit n'est pas définie. */
export function exclusionsProduit(exercice: ExerciceProduitFacteurs): number[] {
  return [exercice.facteur1, exercice.facteur2].filter((f) => f.fonction === "tan").flatMap((f) => valeursInterditesTan(f.a.numerateur / f.a.denominateur, f.b.decimal));
}

/** Valeurs de [0 ; 2π[ où une tangente de l'égalité n'est pas définie. */
export function exclusionsEgalite(exercice: ExerciceEgaliteExpressions): number[] {
  if (exercice.identite !== "tanVersTan") return [];
  return [...valeursInterditesTan(exercice.a1.numerateur / exercice.a1.denominateur, exercice.b1.decimal), ...valeursInterditesTan(exercice.a2.numerateur / exercice.a2.denominateur, exercice.b2.decimal)];
}

// ============================================================================
// 5gen11 — extremums d'une sinusoïde
// ============================================================================

/** Message ciblé des écrans « équation des positions » et « isoler x » (séries en x). */
export function messageCibleExtremums(texte: string, phase: "poserEquation" | "isolerX", donnees: { mode: "maximums" | "minimums" | "extremums"; fonction: "sin" | "cos"; amplitudeNegative: boolean; a: number; c: number; p: number; pU: number }): FragmentConsigne[] | null {
  const serie = lireSerieEnX(phase === "isolerX" && !texte.includes("=") ? `x = ${texte}` : texte);
  if (serie === null) return null;
  if (serie === "nonAffine") return [t("Écris une série : une équation du premier degré en x, avec k (entier) pour parcourir les positions.")];
  const { a, c, p, pU } = donnees;
  if (memesSeriesEnX(serie, c, p)) return null;
  if (donnees.mode === "extremums" && memesSeriesEnX(serie, c, 2 * p)) return [t("Tous les extremums réunis : la série en X a une période π (et non 2π), car la fonction vaut 1 ou −1.")];
  if (donnees.mode !== "extremums" && (memesSeriesEnX(serie, c, p / 2) || memesSeriesEnX(serie, c + p / 2, p / 2))) return [t(`Les ${donnees.mode} seuls : une seule valeur visée, donc une série de période 2π (π réunirait maximums et minimums).`)];
  if (donnees.mode !== "extremums" && memesSeriesEnX(serie, c + p / 2, p)) {
    return donnees.amplitudeNegative
      ? [t(`L'amplitude est négative : les ${donnees.mode} sont atteints quand ${donnees.fonction}(X) vaut ${donnees.mode === "maximums" ? "−1" : "1"}.`)]
      : [t(`Les ${donnees.mode} sont atteints quand ${donnees.fonction}(X) vaut ${donnees.mode === "maximums" ? "1" : "−1"} (l'amplitude est positive).`)];
  }
  if (Math.abs(a - 1) > 1e-9 && memesSeriesEnX(serie, c, pU)) return [t("On divise tout par le coefficient de x, la période aussi.")];
  return null;
}

export function aidesPoserEquationExtremums(texteNiveau1: string, latexNiveau1: string, argument: string): AideTrig[] {
  return [
    { texte: [t(texteNiveau1)], formules: [latexNiveau1] },
    { texte: [t("Ici, X est l'argument de la fonction : remplace X par cette expression dans la série.")], formules: [`X = ${argument}`] },
  ];
}

export function aidesSolutionsExtremums(serieX: string, fenetre: string, cercle: boolean): AideTrig[] {
  return [
    { texte: [t(`Donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) dans la série de x, et garde les valeurs comprises dans ${fenetre} (0 compris, ${fenetre.slice(4, -1)} exclu).`)] },
    { texte: [t(cercle ? "Ici, la série est la suivante ; un premier point est placé sur le cercle, retrouve les autres :" : "Ici, la série est la suivante ; calcule x pour k = 0, puis pour les entiers voisins :")], formules: [serieX] },
  ];
}

// ============================================================================
// 5gen12 — géométrie du cercle (secteur balayé, segment, lentille)
// ============================================================================

/** Message ciblé d'un écran de 5gen12 : `cible` = valeur exacte de l'écran ; `tolerance` = celle
 * de la précision demandée (dixième de radian, unité d'aire). */
function messageArrondi(texte: string, regles: [number, FragmentConsigne[]][], cible: number, tolerance: number): FragmentConsigne[] | null {
  const v = lireValeurTrig(texte);
  if (v === null || Math.abs(v - cible) <= tolerance) return null;
  for (const [valeur, message] of regles) {
    if (!Number.isFinite(valeur) || Math.abs(valeur - cible) <= tolerance) continue;
    if (Math.abs(v - valeur) <= tolerance) return message;
  }
  return null;
}

const MSG_MODE_RADIAN = [t("La calculatrice doit être en mode radian : l'angle θ est en radians.")];
const MSG_SEGMENT = [t("Le segment circulaire est le secteur moins le triangle : "), l("A_{segment} = A_{secteur} - A_{triangle}"), t(".")];
const MSG_ARCCOS = [t("Ce nombre est cos θ : il reste à trouver θ avec la touche "), l("\\cos^{-1}"), t(" (en mode radian).")];

/** Données numériques d'un écran (r, θ en radians, aires déjà trouvées) : voir `App5gen12.tsx`. */
export interface DonneesEcranCercle {
  r: number;
  c: number;
  thetaRad: number;
  thetaDeg: number;
  secteur: number;
  triangle: number;
}

export function messageCibleGeometrieCercle(texte: string, genre: "conversion" | "angle" | "secteur" | "triangle" | "segment" | "difference" | "somme", d: DonneesEcranCercle, cible: number, autre = 0): FragmentConsigne[] | null {
  const tolAngle = 0.051;
  const tolAire = 0.51;
  switch (genre) {
    case "conversion":
      return messageArrondi(texte, [[(d.thetaDeg * 180) / Math.PI, MSG_SENS_DEG_RAD]], cible, tolAngle);
    case "angle": {
      const cos = (2 * d.r * d.r - d.c * d.c) / (2 * d.r * d.r);
      return messageArrondi(texte, [[(cible * 180) / Math.PI, MSG_MODE_RADIAN], [cos, MSG_ARCCOS]], cible, tolAngle);
    }
    case "secteur":
      return messageArrondi(texte, [[d.r * d.r * d.thetaRad, MSG_DEMI_OUBLIE], [0.5 * d.r * d.r * d.thetaDeg, MSG_DEGRES_DANS_FORMULE]], cible, tolAire);
    case "triangle":
      return messageArrondi(texte, [[d.r * d.r * Math.sin(d.thetaRad), [t("L'aire du triangle porte un facteur "), l("\\tfrac{1}{2}"), t(" : "), l("\\tfrac{1}{2}r^2\\sin\\theta"), t(".")]], [0.5 * d.r * d.r * Math.sin((d.thetaRad * Math.PI) / 180), MSG_MODE_RADIAN]], cible, tolAire);
    case "segment":
      return messageArrondi(texte, [[d.secteur + d.triangle, MSG_SEGMENT], [d.triangle - d.secteur, MSG_SEGMENT]], cible, tolAire);
    case "difference":
      return messageArrondi(texte, [[d.secteur + autre, [t("L'aire balayée est la différence des deux secteurs : "), l("A = A_1 - A_2"), t(".")]]], cible, tolAire);
    case "somme":
      return null;
  }
}

export function aidesGeometrieCercle(niveau1: { texte: string; latex: string }, latexNiveau2: string): AideTrig[] {
  return [
    { texte: [t(niveau1.texte)], formules: [niveau1.latex] },
    { texte: [t("Ici, il reste à calculer :")], formules: latexNiveau2 ? [latexNiveau2] : [] },
  ];
}

/** Message ciblé de l'écran `phase` de 5gen12 (valeurs exactes de l'instance). */
export function messageCibleEcranCercle(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle, texte: string): FragmentConsigne[] | null {
  const seg = (s: CalculSegmentCirculaire): DonneesEcranCercle => ({ r: s.r, c: s.c, thetaRad: s.thetaRad, thetaDeg: s.thetaDeg, secteur: s.aireSecteur, triangle: s.aireTriangle });
  switch (exercice.scenario) {
    case "secteurBalaye": {
      const base = { c: 0, thetaRad: exercice.thetaRad, thetaDeg: exercice.thetaDeg, triangle: 0 };
      if (phase === "conversionRad") return messageCibleGeometrieCercle(texte, "conversion", { ...base, r: exercice.r1, secteur: 0 }, exercice.thetaRad);
      if (phase === "aireGrandSecteur") return messageCibleGeometrieCercle(texte, "secteur", { ...base, r: exercice.r1, secteur: 0 }, exercice.aireGrandSecteur);
      if (phase === "airePetitSecteur") return messageCibleGeometrieCercle(texte, "secteur", { ...base, r: exercice.r2, secteur: 0 }, exercice.airePetitSecteur);
      return messageCibleGeometrieCercle(texte, "difference", { ...base, r: exercice.r1, secteur: exercice.aireGrandSecteur }, exercice.aireBalayee, exercice.airePetitSecteur);
    }
    case "segmentCirculaire": {
      const d = seg(exercice);
      if (phase === "angleTheta") return messageCibleGeometrieCercle(texte, "angle", d, exercice.thetaRad);
      if (phase === "aireSecteur") return messageCibleGeometrieCercle(texte, "secteur", d, exercice.aireSecteur);
      if (phase === "aireTriangle") return messageCibleGeometrieCercle(texte, "triangle", d, exercice.aireTriangle);
      return messageCibleGeometrieCercle(texte, "segment", d, exercice.aireSegment);
    }
    case "lentille": {
      const premier = /1$/.test(phase);
      const s = premier ? exercice.segment1 : exercice.segment2;
      const d = seg(s);
      if (phase === "angle1" || phase === "angle2") return messageCibleGeometrieCercle(texte, "angle", d, s.thetaRad);
      if (phase === "secteur1" || phase === "secteur2") return messageCibleGeometrieCercle(texte, "secteur", d, s.aireSecteur);
      if (phase === "triangle1" || phase === "triangle2") return messageCibleGeometrieCercle(texte, "triangle", d, s.aireTriangle);
      if (phase === "segmentAire1" || phase === "segmentAire2") return messageCibleGeometrieCercle(texte, "segment", d, s.aireSegment);
      return null;
    }
  }
}

// ============================================================================
// 5gen13 — modéliser par une sinusoïde
// ============================================================================

/** Nombre décimal en LaTeX (virgule `{,}`, « − » géré par KaTeX). */
function decLatex(v: number, decimales: number): string {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return String(Object.is(r, -0) ? 0 : r).replace(".", "{,}");
}

/** « u = 0{,}24166t + 1{,}32914 » : ω et φ du modèle, au cent-millième (même précision que le modèle). */
function argumentULatex(omega: number, phi: number): string {
  const p = Math.abs(phi) < 5e-6 ? "" : phi > 0 ? `+${decLatex(phi, 5)}` : decLatex(phi, 5);
  return `u=${decLatex(omega, 5)}\\,t${p}`;
}

const FORMULE_ISOLER_T = "\\omega t + \\varphi = U + 2k\\pi \\iff t = \\dfrac{U - \\varphi}{\\omega} + \\dfrac{2k\\pi}{\\omega}";

/** Aides de l'écran `phase` de 5gen13 : niveau 1 = la propriété du cours, niveau 2 = la formule de
 * l'instance (`latexNiveau2`, l'ancienne aide de niveau 2 en KaTeX), jamais la réponse. */
export function aidesModelisation(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide, latexNiveau2: string): AideTrig[] {
  const d = exercice.phase1;
  const ici = (texte = "Ici :"): AideTrig => ({ texte: [t(texte)], formules: latexNiveau2 ? [latexNiveau2] : [] });
  const { omega, phi } = d.fonction;
  const u = typeof phi === "number" ? argumentULatex(omega, phi) : "";
  switch (phase) {
    case "amplitude":
      return d.technique === "b1"
        ? [{ texte: [t("Pour une grande roue, la nacelle s'écarte du centre d'un rayon : l'amplitude est le rayon.")], formules: ["A = R"] }, ici()]
        : [{ texte: [t("L'amplitude est la moitié de l'écart entre le maximum et le minimum :")], formules: ["A = \\dfrac{\\max - \\min}{2}"] }, ici("Ici, il reste à calculer :")];
    case "decalage":
      return d.technique === "b1"
        ? [{ texte: [t("Le décalage vertical est la hauteur du centre de la roue : le rayon plus la hauteur du point le plus bas.")], formules: ["b = R + h"] }, ici("Ici, il reste à calculer :")]
        : [{ texte: [t("Le décalage vertical b est la position d'équilibre, à mi-hauteur entre le maximum et le minimum :")], formules: ["b = \\dfrac{\\max + \\min}{2}"] }, ici("Ici, il reste à calculer :")];
    case "pulsation":
      return [{ texte: [t("La pulsation se déduit de la période T, la durée d'un cycle complet :")], formules: ["\\omega = \\dfrac{2\\pi}{T}"] }, ici("Ici, il reste à calculer :")];
    case "phi":
      return [
        { texte: [t("En un maximum, sin(ωt + φ) = 1 et l'argument vaut π/2 ; en un minimum, sin(ωt + φ) = −1 et l'argument vaut −π/2 (à 2π près) :")], formules: ["\\omega t_0 + \\varphi = \\dfrac{\\pi}{2} \\ \\text{(maximum)} \\qquad \\omega t_0 + \\varphi = -\\dfrac{\\pi}{2} \\ \\text{(minimum)}"] },
        ici("Ici, il reste à isoler φ (puis à le ramener dans ]−π ; π] si besoin) :"),
      ];
    case "systeme":
      return [
        { texte: [t("En chaque point, isole le sinus, puis prends l'arcsin : on obtient deux équations du premier degré en ω et φ :")], formules: ["A\\sin(\\omega t_i + \\varphi) + b = f_i \\iff \\omega t_i + \\varphi = \\arcsin\\dfrac{f_i - b}{A}"] },
        ici("Ici, les deux équations à écrire sont :"),
      ];
    case "resolution":
      return [
        { texte: [t("Soustrais les deux équations membre à membre : φ s'élimine et donne ω ; additionne-les pour trouver φ :")], formules: ["\\omega = \\dfrac{\\alpha_1 - \\alpha_2}{t_1 - t_2} \\qquad \\varphi = \\dfrac{\\alpha_1 + \\alpha_2 - \\omega(t_1 + t_2)}{2}"] },
        ici("Ici, avec α₁ et α₂ calculés à la calculatrice (en radians) :"),
      ];
    case "fonctionFinale":
      return d.technique === "b1"
        ? [{ texte: [t("Aucune donnée ne fixe la position de la nacelle à t = 0 : garde φ sous forme littérale (écris phi) dans le modèle :")], formules: ["f(t) = A\\sin(\\omega t + \\varphi) + b"] }, ici("Ici, avec A, ω et b trouvés :")]
        : [{ texte: [t("Remplace A, ω, φ et b, déjà trouvés, dans le modèle (au moins 4 décimales pour ω et φ) :")], formules: ["f(t) = A\\sin(\\omega t + \\varphi) + b"] }, ici("Ici :")];
    case "argumentResoudre":
      return [
        { texte: [t("Avec m le nombre que doit valoir le sinus, sin u = m a deux séries de solutions (aucune si |m| > 1) :")], formules: ["\\sin u = m \\iff u = \\arcsin m + 2k\\pi \\ \\text{ ou } \\ u = \\pi - \\arcsin m + 2k\\pi"] },
        ici("Ici, f(t) = A sin u + b, donc :"),
      ];
    case "isolerTResoudre":
    case "isolerTExtremum":
    case "isolerTInequation":
      return [
        { texte: [t("On retranche φ, puis on divise chaque terme par ω, la période aussi (sans arrondir ω et φ davantage) :")], formules: [FORMULE_ISOLER_T] },
        { texte: [t("Ici, l'argument du modèle est :")], formules: [u] },
      ];
    case "solutionsResoudre":
    case "solutionsExtremum":
      return [
        { texte: [t("Dans chaque série en t, donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) et garde les valeurs de la fenêtre :")], formules: [`0 \\leqslant t \\leqslant ${decLatex(exercice.phase2?.fenetre ?? 0, 2)}`] },
        { texte: [t("Ici, l'argument du modèle est le suivant ; calcule t pour chaque valeur de k :")], formules: [u] },
      ];
    case "poserExtremum":
      return [
        { texte: [t("Un extremum est atteint quand sin u vaut 1 ou −1 : ces deux cas se réunissent en une seule série, de période π :")], formules: ["\\sin u = \\pm 1 \\iff u = \\dfrac{\\pi}{2} + k\\pi"] },
        { texte: [t("Ici, u est l'argument du modèle :")], formules: [u] },
      ];
    case "isolerSinInequation": {
      const q = exercice.phase2;
      const special = q !== null && q.type === "inequation" && q.casSpecial !== null;
      return [
        special
          ? { texte: [t("Le sinus reste compris entre −1 et 1 : si |m| > 1, l'inéquation est toujours vraie ou toujours fausse, quel que soit t :")], formules: ["-1 \\leqslant \\sin u \\leqslant 1"] }
          : { texte: [t("Isole le sinus : retranche b, puis divise par A (positif) ; le sens de l'inégalité ne change pas :")], formules: ["A\\sin u + b \\geqslant y_0 \\iff \\sin u \\geqslant m = \\dfrac{y_0 - b}{A}"] },
        ici("Ici, avec la valeur visée y₀ :"),
      ];
    }
    case "resoudreUInequation": {
      const q = exercice.phase2;
      const ge = q !== null && q.type === "inequation" && q.sens === "ge";
      return [
        ge
          ? { texte: [t("Sur une période, sin u ⩾ m sur l'arc qui contient π/2 (le haut du cercle) :")], formules: ["\\sin u \\geqslant m \\iff u \\in [\\arcsin m \\,;\\, \\pi - \\arcsin m]"] }
          : { texte: [t("Sur une période, sin u ⩽ m sur l'arc qui contient −π/2 (le bas du cercle), écrit d'un seul tenant :")], formules: ["\\sin u \\leqslant m \\iff u \\in [\\pi - \\arcsin m \\,;\\, 2\\pi + \\arcsin m]"] },
        ici("Ici, il reste à calculer les deux bornes avec m :"),
      ];
    }
    case "listerIntervallesInequation":
      return [
        { texte: [t("Les bornes en t se répètent toutes les périodes : ajoute des multiples entiers de la période tant que l'intervalle reste dans la fenêtre :")], formules: ["[t_g + kT \\,;\\, t_d + kT] \\qquad T = \\dfrac{2\\pi}{\\omega}"] },
        ici("Ici :"),
      ];
  }
}

/** Message ciblé d'un écran à un champ de 5gen13. */
export function messageCibleModelisation(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide, texte: string): FragmentConsigne[] | null {
  const d = exercice.phase1;
  const { A, omega, b } = d.fonction;
  switch (phase) {
    case "amplitude":
      return d.technique === "b2" ? premierMessage(texte, [[d.max - d.min, [t("L'amplitude est la moitié de l'écart entre le maximum et le minimum.")]], [d.max, [t("L'amplitude est l'écart entre le maximum et la position d'équilibre, pas le maximum lui-même.")]]], A) : d.technique === "b1" ? premierMessage(texte, [[2 * d.rayon, [t("L'amplitude est le rayon de la roue, pas son diamètre.")]]], A) : null;
    case "decalage":
      return d.technique === "b2" ? premierMessage(texte, [[(d.max - d.min) / 2, [t("Le décalage vertical est la moyenne du maximum et du minimum : "), l("\\tfrac{\\max + \\min}{2}"), t(".")]]], b) : d.technique === "b1" ? premierMessage(texte, [[d.hauteurSol, [t("Le décalage vertical est la hauteur du centre de la roue : rayon plus hauteur du bas.")]], [d.rayon, [t("Le décalage vertical est la hauteur du centre de la roue : rayon plus hauteur du bas.")]]], b) : null;
    case "pulsation": {
      const T = (2 * Math.PI) / omega;
      return premierMessage(texte, [[T, MSG_T_OMEGA], [1 / T, MSG_T_OMEGA], [360 / T, [t("La pulsation s'exprime en radians par unité de temps : "), l("\\omega = \\tfrac{2\\pi}{T}"), t(".")]]], omega);
    }
    case "phi": {
      if (d.technique !== "b2" || typeof d.fonction.phi !== "number") return null;
      const mauvaiseCible = (d.estMax ? -Math.PI / 2 : Math.PI / 2) - omega * d.t0;
      return premierMessageModulo(
        texte,
        [
          [mauvaiseCible, [t(d.estMax ? "En un maximum, l'argument vaut π/2 (sin vaut 1)." : "En un minimum, l'argument vaut −π/2 (sin vaut −1), pas π/2.")]],
          [-d.fonction.phi, [t("Attention au signe : "), l("\\varphi = \\tfrac{\\pi}{2} - \\omega t_0"), t(" pour un maximum.")]],
        ],
        d.fonction.phi,
        2 * Math.PI,
      );
    }
    case "poserExtremum": {
      const lus = lireSeries([texte.includes("=") ? texte.slice(texte.indexOf("=") + 1) : texte]);
      if (lus === null || lus === "nonAffine") return lus === "nonAffine" ? MSG_SERIE_AVEC_K : null;
      if (Math.abs(Math.abs(lus[0].periode) - 2 * Math.PI) < 0.01) return [t("Les maximums et les minimums se réunissent en une seule série de période π : "), l("u = \\tfrac{\\pi}{2} + k\\pi"), t(".")];
      return null;
    }
    case "isolerTExtremum": {
      const q = exercice.phase2;
      if (q === null || q.type !== "extremum") return null;
      return messageCibleIsolerX([texte.replace(/^\s*t\s*=\s*/, "")], [{ constante: { decimal: q.brancheT.constante }, periode: { decimal: q.brancheT.periode } }], omega, 0);
    }
    default:
      return null;
  }
}

/** Message ciblé des écrans à plusieurs lignes ou bornes de 5gen13. */
export function messageCibleModelisationLignes(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide, lignes: string[]): FragmentConsigne[] | null {
  const q = exercice.phase2;
  const omega = exercice.phase1.fonction.omega;
  if (q === null) return null;
  const branches = (bs: { constante: number; periode: number }[]) => bs.map((br) => ({ constante: { decimal: br.constante }, periode: { decimal: br.periode } }));
  if (phase === "isolerTResoudre" && q.type === "resoudre") return messageCibleIsolerX(lignes.map((x) => x.replace(/^\s*t\s*=\s*/, "")), branches(q.branchesT), omega, 0);
  if (phase === "solutionsResoudre" && q.type === "resoudre") return messageCibleSolutions(lignes, q.solutions, [], q.fenetre + 0.01, `[0 ; ${String(Math.round(q.fenetre * 100) / 100).replace(".", ",")}]`);
  if (phase === "solutionsExtremum" && q.type === "extremum") return messageCibleSolutions(lignes, q.solutions, [], q.fenetre + 0.01, `[0 ; ${String(Math.round(q.fenetre * 100) / 100).replace(".", ",")}]`);
  return null;
}

/** Écran « séries de u » (résoudre f(t) = k) : séries, ou « aucun angle » si |m| > 1. */
export function messageCibleArgumentModelisation(exercice: ExerciceModelisationSinusoide, reponse: { aucuneSolution: boolean; lignes: string[] }): FragmentConsigne[] | null {
  const q = exercice.phase2;
  if (q === null || q.type !== "resoudre") return null;
  return messageCibleArgument("sin", q.branchesU.map((br) => ({ constante: { decimal: br.constante }, periode: { decimal: br.periode } })), q.aucuneSolution, reponse);
}

/** Bornes de l'arc en u (inéquation) : arc du mauvais côté. */
export function messageCibleBornesU(exercice: ExerciceModelisationSinusoide, reponse: { inf: string; sup: string }): FragmentConsigne[] | null {
  const q = exercice.phase2;
  if (q === null || q.type !== "inequation") return null;
  const a = lireValeurTrig(reponse.inf);
  const s = lireValeurTrig(reponse.sup);
  if (a === null || s === null) return null;
  const alpha = Math.asin(Math.max(-1, Math.min(1, q.m)));
  const [fa, fs] = q.sens === "ge" ? [Math.PI - alpha, 2 * Math.PI + alpha] : [alpha, Math.PI - alpha];
  if (procheModulo(a, fa, 2 * Math.PI) && procheModulo(s, fs, 2 * Math.PI)) {
    return q.sens === "ge" ? [t("Cet arc est celui où sin u ⩽ m : pour sin u ⩾ m, prends l'arc qui contient π/2.")] : [t("Cet arc est celui où sin u ⩾ m : pour sin u ⩽ m, prends l'arc qui contient −π/2.")];
  }
  return null;
}
