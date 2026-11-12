/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen35 ("Vitesse et position").
 * Dépend librement des couches inférieures (jamais l'inverse) : réutilise `valeurPosition`/
 * `valeurVitesseExacte` (`generateurs5e/vitessePosition/index.ts`).
 *
 * Notation s(t) PARTOUT (distance parcourue, comme le cours §11) ; v(t) = s'(t) ; a(t) = v'(t).
 * Consignes et aides écran en `$…$` (rendues par `TexteRiche5e`) — `consigneEcran` en donne une
 * version texte (Unicode, sans `$`) pour l'adaptateur papier. Nombres à virgule décimale.
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { valeurPosition, valeurVitesseExacte } from "../generateurs5e/vitessePosition/index";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../moteur5e/typesVitessePosition";
import type { SegmentTexte } from "../components/SegmentsInline";

type EcranDemande = EcranVitessePosition;

function ecranReel(ecran: EcranDemande): EcranVitessePosition {
  return ecran;
}

// ============================================================================
// Nombres et fragments LaTeX de bas niveau.
// ============================================================================

/** Nombre à virgule décimale, au plus `decimales` chiffres significatifs après la virgule (zéros
 * finaux retirés), « − » typographique. */
export function formatNombreFr(v: number, decimales = 2): string {
  const arrondi = Number(v.toFixed(decimales));
  const texte = String(Math.abs(arrondi)).replace(".", "{,}");
  return arrondi < 0 ? `-${texte}` : texte;
}

function estEntierOuUnDixieme(v: number): boolean {
  return Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
}

/** s(t) = (a/2)t² + b·t — a∈{1,2} : « ½t² » ou « t² », jamais de terme « +0t ». */
export function formatPositionLatex(a: number, b: number): string {
  const termeT2 = a === 2 ? "t^2" : "\\dfrac{1}{2}t^2";
  const termeT = b === 0 ? "" : b === 1 ? "+t" : `+${b}t`;
  return `s(t)=${termeT2}${termeT}`;
}

/** v(t) = a·t + b — jamais de coefficient « 1 » ni de terme « +0 ». */
export function formatVitesseLatex(a: number, b: number): string {
  const termeT = a === 1 ? "t" : `${a}t`;
  return b === 0 ? termeT : `${termeT}+${b}`;
}

function formatVDeTLatex(exercice: ExerciceVitessePosition): string {
  return `v(t)=${formatVitesseLatex(exercice.a, exercice.b)}`;
}

// ============================================================================
// Énoncé narratif — "prose + fragments KaTeX courts".
// ============================================================================
const REGEX_DOLLAR = /\$([^$]+)\$/g;

export function segmentsEnonce(phrase: string): SegmentTexte[] {
  const segments: SegmentTexte[] = [];
  let dernierIndex = 0;
  let match: RegExpExecArray | null;
  REGEX_DOLLAR.lastIndex = 0;
  while ((match = REGEX_DOLLAR.exec(phrase)) !== null) {
    if (match.index > dernierIndex) segments.push({ type: "texte", valeur: phrase.slice(dernierIndex, match.index) });
    segments.push({ type: "katex", valeur: match[1] });
    dernierIndex = match.index + match[0].length;
  }
  if (dernierIndex < phrase.length) segments.push({ type: "texte", valeur: phrase.slice(dernierIndex) });
  return segments;
}

/** Phrase narrative complète (contexte + s(t) + distance(s)) — persistante sur tous les écrans. */
export function phraseEnonce(exercice: ExerciceVitessePosition): string {
  const sLatex = formatPositionLatex(exercice.a, exercice.b);
  return exercice.variante === "A"
    ? exercice.contexte.phraseA(sLatex, exercice.D, exercice.b)
    : exercice.contexte.phraseB(sLatex, exercice.distanceCible, exercice.D, exercice.b);
}

/** Bloc de données structuré — chaque donnée sur sa propre ligne. */
export function formatTermesDonneesLatex(exercice: ExerciceVitessePosition): string[] {
  const sLatex = formatPositionLatex(exercice.a, exercice.b);
  if (exercice.variante === "A") return [sLatex, `D=${exercice.D}\\text{ m}`];
  return [sLatex, `D_1=${exercice.distanceCible}\\text{ m}`, `D=${exercice.D}\\text{ m (distance totale)}`];
}

export function questionFinale(exercice: ExerciceVitessePosition): string {
  return exercice.variante === "A"
    ? `Trouve le temps mis pour parcourir les ${exercice.D} m, puis la vitesse atteinte à cet instant, en km/h.`
    : "Trouve le temps total du parcours (les deux segments).";
}

// ============================================================================
// Libellés/consignes par écran.
// ============================================================================

export const LIBELLE_ECRAN: Record<EcranVitessePosition, string> = {
  derivee: "Vitesse v(t) = s'(t)",
  acceleration: "Accélération a(t) = v'(t)",
  resoudre: "Solutions de l'équation",
  rejet: "Solution rejetée",
  vitessePointe: "Vitesse atteinte",
  conversion: "Conversion en km/h",
  segmentConstant: "Temps du second segment",
  tempsTotal: "Temps total du parcours",
};

/** Consigne ÉCRAN (formules en `$…$`, rendue par `TexteRiche5e`). */
export function consigneEcranRiche(exercice: ExerciceVitessePosition, ecranDemande: EcranDemande): string {
  const ecran = ecranReel(ecranDemande);
  switch (ecran) {
    case "derivee":
      return "Dérive $s(t)$ pour obtenir la fonction vitesse $v(t)=s'(t)$, en m/s.";
    case "acceleration":
      return "L'accélération est la dérivée de la vitesse : calcule $a(t)=v'(t)$, en m/s².";
    case "resoudre": {
      const cible = exercice.variante === "A" ? `D=${exercice.D}` : `D_1=${exercice.distanceCible}`;
      const membre = exercice.variante === "A" ? `${exercice.D}` : `${exercice.distanceCible}`;
      return `Résous l'équation $s(t)=${membre}$ (avec $${cible}$ m) : c'est une équation du second degré, donne ses deux solutions.`;
    }
    case "rejet":
      return "Une seule des deux solutions convient dans ce contexte. Pourquoi l'autre est-elle rejetée ? Une seule tentative.";
    case "vitessePointe":
      return "Calcule la vitesse atteinte à l'instant que tu viens de trouver : évalue $v$ (et non $s$) en cet instant. C'est une vitesse instantanée, pas une vitesse moyenne.";
    case "conversion":
      return "Convertis cette vitesse de m/s en km/h.";
    case "segmentConstant":
      return "Changement de modèle : sur le segment restant, la vitesse reste constante, égale à la vitesse atteinte à la fin de l'accélération, et $s(t)$ ne s'applique plus. Calcule la longueur $D_2$ de ce segment, puis le temps $t_2=\\dfrac{D_2}{v}$ (arrondi au dixième).";
    case "tempsTotal":
      return "Additionne la durée du premier segment (la solution retenue de l'équation) et $t_2$ pour obtenir le temps total du parcours (arrondi au dixième).";
  }
}

/** Version TEXTE (Unicode, sans `$`) de la consigne — lue par l'adaptateur papier. */
export function consigneEcran(exercice: ExerciceVitessePosition, ecran: EcranDemande): string {
  return consigneEcranRiche(exercice, ecran)
    .replace(/\\dfrac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/_1/g, "₁")
    .replace(/_2/g, "₂")
    .replace(/\$/g, "");
}

// ============================================================================
// Aides — texte en prose (formules courtes en `$…$`) + formule display éventuelle.
// ============================================================================

export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau1(ecranDemande: EcranDemande): AideFragmentee {
  const ecran = ecranReel(ecranDemande);
  switch (ecran) {
    case "derivee":
      return { texte: "$s(t)$ est un polynôme du second degré en $t$ : dérive-le terme à terme, comme une fonction en $x$.", latex: "\\left(t^{n}\\right)'=n\\,t^{n-1}" };
    case "acceleration":
      return { texte: "Dérive $v(t)$, la formule trouvée à l'écran précédent : la dérivée d'un terme constant est nulle.", latex: null };
    case "resoudre":
      return { texte: "Ramène l'équation à la forme $at^2+bt+c=0$ (tous les termes à gauche), puis calcule le discriminant :", latex: "\\Delta=b^2-4ac \\qquad t=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}" };
    case "rejet":
      return { texte: "Relis ce que représente la variable $t$ dans l'énoncé : à partir de quel instant est-elle comptée ?", latex: null };
    case "vitessePointe":
      return { texte: "La vitesse à un instant précis s'obtient en remplaçant $t$ par cet instant dans $v(t)$. La vitesse moyenne (distance ÷ durée) n'est pas demandée.", latex: null };
    case "conversion":
      return { texte: "1 m/s, c'est 3 600 m en une heure, soit 3,6 km/h :", latex: "v_{\\text{km/h}}=v_{\\text{m/s}}\\times3{,}6" };
    case "segmentConstant":
      return { texte: "À vitesse constante, distance = vitesse × durée, donc la durée vaut la distance divisée par la vitesse :", latex: "D_2=D-D_1 \\qquad t_2=\\dfrac{D_2}{v}" };
    case "tempsTotal":
      return { texte: "Le temps total est la somme des durées des deux segments :", latex: "t_{\\text{total}}=t_1+t_2" };
  }
}

export function texteAideNiveau2(ecranDemande: EcranDemande): AideFragmentee {
  const ecran = ecranReel(ecranDemande);
  switch (ecran) {
    case "derivee":
      return { texte: "Exemple :", latex: "s(t)=\\dfrac{3}{2}t^2+7t \\;\\Rightarrow\\; v(t)=s'(t)=3t+7" };
    case "acceleration":
      return { texte: "Exemple :", latex: "v(t)=3t+7 \\;\\Rightarrow\\; a(t)=v'(t)=3\\ \\text{m/s}^2" };
    case "resoudre":
      return { texte: "Exemple :", latex: "t^2+3t=40 \\iff t^2+3t-40=0,\\ \\Delta=169 \\;\\Rightarrow\\; t=5 \\text{ ou } t=-8" };
    case "rejet":
      return { texte: "L'équation est juste et ses deux solutions la vérifient : seule l'une d'elles a un sens physique ici.", latex: null };
    case "vitessePointe":
      return { texte: "Exemple :", latex: "v(t)=3t+7,\\ t=5 \\;\\Rightarrow\\; v(5)=3\\cdot5+7=22\\ \\text{m/s}" };
    case "conversion":
      return { texte: "Exemple :", latex: "13\\ \\text{m/s}\\times3{,}6=46{,}8\\ \\text{km/h}" };
    case "segmentConstant":
      return { texte: "Exemple :", latex: "D_2=150-24=126\\ \\text{m},\\ v=9\\ \\text{m/s} \\;\\Rightarrow\\; t_2=\\dfrac{126}{9}=14\\ \\text{s}" };
    case "tempsTotal":
      return { texte: "Exemple :", latex: "t_1=4\\ \\text{s},\\ t_2\\approx7{,}3\\ \\text{s} \\;\\Rightarrow\\; t_{\\text{total}}\\approx11{,}3\\ \\text{s}" };
  }
}

// ============================================================================
// Valeurs CONFIRMÉES — formes canoniques (état actuel + récapitulatif), virgule décimale.
// ============================================================================

function vAtCible(exercice: ExerciceVitessePosition): number {
  return valeurVitesseExacte(exercice, exercice.tCible);
}

function formatAccelerationConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `a(t)=${exercice.a}\\text{ m/s}^2 \\;(>0\\text{ : la vitesse augmente})`;
}

function formatRacineRetenueConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `t=${exercice.tCible}\\text{ s (retenue)}`;
}

function formatRacineRejeteeConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `t=${exercice.racineRejetee}\\text{ (rejetée)}`;
}

function formatRejetConfirmeLatex(exercice: ExerciceVitessePosition): string {
  return `t=${exercice.racineRejetee}<0\\text{ : le temps est compté à partir du départ}`;
}

function formatVitessePointeConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  return `v(${exercice.tCible})=${vAtCible(exercice)}\\text{ m/s}`;
}

function formatConversionConfirmeeLatex(exercice: ExerciceVitessePosition): string {
  const kmh = vAtCible(exercice) * 3.6;
  return `${vAtCible(exercice)}\\times3{,}6=${formatNombreFr(kmh, 1)}\\text{ km/h}`;
}

function t2Exact(exercice: ExerciceVitessePosition): number {
  if (exercice.variante !== "B") throw new Error("t2Exact : exercice hors variante B");
  return exercice.D2 / vAtCible(exercice);
}

function formatAuDixiemeLatex(v: number): string {
  return `${estEntierOuUnDixieme(v) ? "=" : "\\approx"}${formatNombreFr(v, 1)}`;
}

function formatSegmentConstantConfirmeLatex(exercice: ExerciceVitessePosition): string {
  if (exercice.variante !== "B") throw new Error("formatSegmentConstantConfirmeLatex : exercice hors variante B");
  return `t_2=\\dfrac{${exercice.D2}}{${vAtCible(exercice)}}${formatAuDixiemeLatex(t2Exact(exercice))}\\text{ s}`;
}

function formatTempsTotalConfirmeLatex(exercice: ExerciceVitessePosition): string {
  return `t_{\\text{total}}${formatAuDixiemeLatex(exercice.tCible + t2Exact(exercice))}\\text{ s}`;
}

/** Bloc "état actuel" — valeurs CONFIRMÉES des écrans déjà traversés, `null` sur le premier écran. */
export function formatTermesEtatActuelLatex(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string[] | null {
  const ordre = ordreEcransVitessePosition(exercice);
  const index = ordre.indexOf(ecran);
  if (index <= 0) return null;
  const termes: string[] = [];
  for (const precedent of ordre.slice(0, index)) termes.push(...formatReponseAttenduePhaseLatex(exercice, precedent));
  return termes;
}

// ============================================================================
// Réponse ATTENDUE, par écran.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceVitessePosition, ecranDemande: EcranDemande): string[] {
  const ecran = ecranReel(ecranDemande);
  switch (ecran) {
    case "derivee":
      return [formatVDeTLatex(exercice)];
    case "acceleration":
      return [formatAccelerationConfirmeeLatex(exercice)];
    case "resoudre":
      return [formatRacineRetenueConfirmeeLatex(exercice), formatRacineRejeteeConfirmeeLatex(exercice)];
    case "rejet":
      return [formatRejetConfirmeLatex(exercice)];
    case "vitessePointe":
      return [formatVitessePointeConfirmeeLatex(exercice)];
    case "conversion":
      return [formatConversionConfirmeeLatex(exercice)];
    case "segmentConstant":
      return [formatSegmentConstantConfirmeLatex(exercice)];
    case "tempsTotal":
      return [formatTempsTotalConfirmeLatex(exercice)];
  }
}

export { valeurPosition };
