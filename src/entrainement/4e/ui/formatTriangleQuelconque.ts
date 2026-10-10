/**
 * Présentation — "Triangle quelconque" (chapitre 3, remplace "Aire d'un triangle quelconque" à la
 * position 19, `promptcreationgenerateur19trianglequelconque.md`, corrigé depuis par
 * `promptcorrectionsgenerateur19unitesnotation.md` — voir les 3 points ci-dessous). Réutilise
 * `TriangleSketchValeurs` (`triangleSketch.ts`) et l'arrondi transversal déjà établi par les 3
 * autres générateurs "triangle" de ce chapitre — `arrondi1` (1 décimale, côtés) / `Math.round`
 * (entier, angles en degrés), même convention exacte que `formatAire.ts`/`formatLoiSinus.ts`/
 * `formatLoiCosinus.ts` (confirmée transversale par lecture directe du code avant implémentation —
 * "point à clarifier" du prompt de création, jamais redemandé à l'utilisateur puisqu'une convention
 * claire existait déjà).
 *
 * **Notation des côtés en segments** (point 2 du prompt de correction) : `a`/`b`/`c` (jamais
 * affichés sur le croquis) sont désormais toujours rendus sous la notation du segment correspondant
 * — `SEGMENT_COTE` — `a`(=BC, opposé à A) → `"BC"`, `b`(=AC, opposé à B) → `"AC"`, `c`(=AB, opposé à
 * C) → `"AB"`. Les angles (A/B/C, correspondant aux sommets) restent notés tels quels — seule la
 * notation des côtés change.
 *
 * **Retrait du jargon "assignation côté/angle opposé"** (point 1) : l'ancien texte d'aide
 * intermédiaire de l'écran 1 (qui énumérait explicitement "le côté X est opposé à l'angle Y") est
 * retiré — le croquis montre déjà cette correspondance visuellement, via les connecteurs de paire
 * (`pairesPertinentes`, toujours utilisée pour le croquis, plus jamais pour un texte). L'aide de
 * l'écran 1 passe donc de 3 à 2 niveaux : niveau 1 nomme la loi + surligne les données connues,
 * niveau 2 ajoute directement les connecteurs de paire au croquis ET révèle la formule substituée
 * — sans plus jamais d'étape textuelle intermédiaire entre les deux.
 */
import type { CoteTriangle, SommetTriangle } from "../core/triangle.types";
import type { ConfigurationTriangleQuelconque, ExerciceTriangleQuelconque, LettreTriangle, UniteLongueur } from "../core/triangleQuelconque.types";
import type { TriangleSketchValeurs } from "./triangleSketch";
import type { TriangleQuelconqueSketchOptions } from "./triangleQuelconqueSketch";
import { donneesFormuleAire } from "../moteur/verificationTriangleQuelconque";

function arrondi1(valeur: number): number {
  return Math.round(valeur * 10) / 10;
}

/** Exportée pour que les composants d'écran sachent si un menu déroulant d'unité doit apparaître
 * (côté manquant uniquement — un angle n'a pas d'unité de longueur, voir `EtapeDonneeManquante.tsx`). */
export function estCote(lettre: LettreTriangle): lettre is CoteTriangle {
  return lettre === "a" || lettre === "b" || lettre === "c";
}

/** Notation du segment correspondant à chaque côté — `a`=BC (opposé à A), `b`=AC (opposé à B),
 * `c`=AB (opposé à C) — jamais la lettre abstraite `a`/`b`/`c`, absente du croquis. */
const SEGMENT_COTE: Record<CoteTriangle, string> = { a: "BC", b: "AC", c: "AB" };

function libelleCote(cote: CoteTriangle): string {
  return `le côté ${SEGMENT_COTE[cote]}`;
}

function libelleAngle(angle: SommetTriangle): string {
  return `l'angle ${angle}`;
}

function libelleLettre(lettre: LettreTriangle): string {
  return estCote(lettre) ? libelleCote(lettre) : libelleAngle(lettre);
}

/** Un côté (segment, unité tirée, 1 décimale) ou un angle (degrés, entier) formaté pour l'affichage —
 * ex. `"9,4 cm"` ou `"57°"`. */
function formatValeurLettre(exercice: ExerciceTriangleQuelconque, lettre: LettreTriangle): string {
  const valeur = exercice.triangle[lettre];
  return estCote(lettre) ? `${arrondi1(valeur)} ${exercice.unite}` : `${Math.round(valeur)}°`;
}

/** Valeur affichée (arrondie, avec unité) de la donnée manquante — pour le récapitulatif de
 * l'écran 2 et la révélation du panneau de résultat. */
export function valeurAffichageDonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return formatValeurLettre(exercice, exercice.donneeManquante);
}

function poserValeur(valeurs: TriangleSketchValeurs, lettre: LettreTriangle, texte: string): void {
  if (estCote(lettre)) valeurs[lettre] = texte;
  else valeurs[`ang${lettre}` as `ang${SommetTriangle}`] = texte;
}

/** Données CONNUES à l'écran 1, selon la configuration — jamais la donnée manquante elle-même. */
const DONNEES_CONNUES: Record<ConfigurationTriangleQuelconque, { cotes: CoteTriangle[]; angles: SommetTriangle[] }> = {
  loiSinus: { cotes: ["a"], angles: ["A", "B"] },
  alKashi: { cotes: ["a", "b", "c"], angles: [] },
};

export function donneesConnues(exercice: ExerciceTriangleQuelconque): { cotes: CoteTriangle[]; angles: SommetTriangle[] } {
  return DONNEES_CONNUES[exercice.configuration];
}

/**
 * Paires côté–angle-opposé pertinentes pour le piège d'assignation de l'écran 1 — `loiSinus` : a↔A
 * et b↔B (le ratio de la loi des sinus, `BC/sinA = AC/sinB`) ; `alKashi` : a↔A (le côté isolé face
 * à l'angle cherché dans la formule d'Al-Kashi, `BC² = AC²+AB²-2·AC·AB·cos(A)`). Uniquement
 * consommée par le croquis (connecteurs de paire) depuis le retrait du texte d'aide correspondant
 * (point 1 du prompt de correction) — plus aucun consommateur textuel.
 */
const PAIRES_PERTINENTES: Record<ConfigurationTriangleQuelconque, CoteTriangle[]> = {
  loiSinus: ["a", "b"],
  alKashi: ["a"],
};

export function pairesPertinentes(exercice: ExerciceTriangleQuelconque): CoteTriangle[] {
  return PAIRES_PERTINENTES[exercice.configuration];
}

/** Croquis de l'écran 1 — la donnée manquante affichée "?", jamais sa vraie valeur. */
export function valeursTriangleSketchDonneeManquante(exercice: ExerciceTriangleQuelconque): TriangleSketchValeurs {
  const { cotes, angles } = donneesConnues(exercice);
  const valeurs: TriangleSketchValeurs = {};
  for (const cote of cotes) poserValeur(valeurs, cote, formatValeurLettre(exercice, cote));
  for (const angle of angles) poserValeur(valeurs, angle, formatValeurLettre(exercice, angle));
  poserValeur(valeurs, exercice.donneeManquante, "?");
  return valeurs;
}

/** Croquis de l'écran 2 — les deux côtés + l'angle compris de la formule d'aire, tous connus
 * désormais (voir `donneesFormuleAire`, la donnée manquante de l'écran 1 est confirmée). */
export function valeursTriangleSketchAire(exercice: ExerciceTriangleQuelconque): TriangleSketchValeurs {
  const { cote1, cote2, angleCompris } = donneesFormuleAire(exercice);
  const valeurs: TriangleSketchValeurs = {};
  poserValeur(valeurs, cote1, formatValeurLettre(exercice, cote1));
  poserValeur(valeurs, cote2, formatValeurLettre(exercice, cote2));
  poserValeur(valeurs, angleCompris, formatValeurLettre(exercice, angleCompris));
  return valeurs;
}

export function libelleDonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return libelleLettre(exercice.donneeManquante);
}

const LIBELLE_CONFIGURATION: Record<ConfigurationTriangleQuelconque, string> = {
  loiSinus: "Loi des sinus",
  alKashi: "Loi des cosinus (Al-Kashi)",
};

export function libelleConfiguration(configuration: ConfigurationTriangleQuelconque): string {
  return LIBELLE_CONFIGURATION[configuration];
}

/** Tolérance réellement vérifiée = `max(0.05, |attendu|·0.01)` (`diagnostiquerCalculNumeriqueTriangle`,
 * `verificationTriangle.ts`) — relative à environ 1 %, même convention que `consigneAire`. */
export function consigneDonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return `Retrouve ${libelleDonneeManquante(exercice)} de ce triangle (une valeur approchée est acceptée, à environ 1 % près).`;
}

/** Libellé du champ de saisie de l'écran 1 (unité selon côté/angle). */
export function labelChampDonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return estCote(exercice.donneeManquante) ? `${libelleDonneeManquante(exercice)} (longueur)` : `${libelleDonneeManquante(exercice)} (en degrés)`;
}

/** Exemple concret, dans l'unité réellement tirée pour cet exercice (point 3 du prompt de
 * correction) — jamais un exemple générique sans échelle. */
export function placeholderDonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return estCote(exercice.donneeManquante) ? `ex : 12,4 ${exercice.unite}` : "ex : 47";
}

/** Nom de la loi à appliquer selon la configuration — révélé par l'aide 1 de l'écran 1. */
const NOM_LOI: Record<ConfigurationTriangleQuelconque, string> = {
  loiSinus: "la loi des sinus",
  alKashi: "la loi des cosinus (Al-Kashi)",
};

export function texteAide1DonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return `Utilise ${NOM_LOI[exercice.configuration]} — les 3 données connues du triangle sont surlignées ci-dessus.`;
}

/**
 * Formule substituée de la loi des sinus — toujours `BC/sin(A) = AC/sin(B)` (le côté manquant est
 * toujours `AC`=`b`, rôle fixe de la configuration `loiSinus`, voir `generateurs/triangleQuelconque/`),
 * résolue pour `AC`. Notation segment (jamais `a`/`b`) et unité incluse sur chaque longueur, degrés
 * sur les angles — même format que `formatValeurLettre`.
 */
function formuleLoiSinus(exercice: ExerciceTriangleQuelconque): string {
  return `BC/sin(A) = AC/sin(B) → AC = ${formatValeurLettre(exercice, "a")}·sin(${formatValeurLettre(exercice, "B")})/sin(${formatValeurLettre(exercice, "A")})`;
}

/** Formule substituée d'Al-Kashi pour l'angle `A` (toujours l'angle cherché, rôle fixe de la
 * configuration `alKashi`) — chaque longueur parenthésée avant d'être élevée au carré (`(9 cm)²`),
 * jamais `9 cm²` qui se lirait comme une aire. */
function formuleAlKashi(exercice: ExerciceTriangleQuelconque): string {
  const b = formatValeurLettre(exercice, "b");
  const c = formatValeurLettre(exercice, "c");
  const a = formatValeurLettre(exercice, "a");
  return `BC² = AC²+AB²-2·AC·AB·cos(A) → cos(A) = ((${b})²+(${c})²-(${a})²)/(2·${b}·${c})`;
}

export function texteAide2DonneeManquante(exercice: ExerciceTriangleQuelconque): string {
  return exercice.configuration === "loiSinus" ? formuleLoiSinus(exercice) : formuleAlKashi(exercice);
}

export const NOMBRE_NIVEAUX_AIDE_DONNEE_MANQUANTE = 2;

const TEXTES_AIDE_DONNEE_MANQUANTE: ((exercice: ExerciceTriangleQuelconque) => string)[] = [
  texteAide1DonneeManquante,
  texteAide2DonneeManquante,
];

export function textesAideDonneeManquante(exercice: ExerciceTriangleQuelconque, niveau: number): string[] {
  return TEXTES_AIDE_DONNEE_MANQUANTE.slice(0, niveau).map((f) => f(exercice));
}

/**
 * Options de surlignage du croquis de l'écran 1, selon le niveau d'aide atteint — niveau 0 : rien
 * (croquis nu) ; niveau 1 : les 3 données connues surlignées, sans les paires (aide 1) ; niveau 2 :
 * les mêmes données PLUS les connecteurs de paire côté–angle-opposé, en même temps que la formule
 * substituée est révélée (aide 2, plus aucune étape intermédiaire séparée depuis le retrait du
 * jargon "assignation côté/angle opposé").
 */
export function optionsCroquisDonneeManquante(exercice: ExerciceTriangleQuelconque, niveau: number): TriangleQuelconqueSketchOptions {
  if (niveau <= 0) return {};
  const { cotes, angles } = donneesConnues(exercice);
  if (niveau === 1) return { cotesSurlignes: cotes, anglesSurlignes: angles };
  return { cotesSurlignes: cotes, anglesSurlignes: angles, paires: pairesPertinentes(exercice) };
}

/** Les 5 unités de longueur, dans l'ordre croissant d'échelle — ordre d'affichage du menu déroulant
 * de l'écran 1 (côté manquant uniquement). */
const UNITES_LONGUEUR_ORDRE: UniteLongueur[] = ["mm", "cm", "dm", "m", "km"];

export interface OptionUnite {
  value: UniteLongueur;
  label: string;
}

export const OPTIONS_UNITE_LONGUEUR: OptionUnite[] = UNITES_LONGUEUR_ORDRE.map((unite) => ({ value: unite, label: unite }));

/** Menu déroulant de l'écran 2 (aire) — mêmes 5 valeurs sous-jacentes que `OPTIONS_UNITE_LONGUEUR`
 * (la correction ne compare jamais que l'unité de LONGUEUR de l'exercice, voir
 * `verificationTriangleQuelconque.ts::diagnostiquerAire`), seul le LIBELLE affiché diffère (`"cm²"`
 * plutôt que `"cm"`). */
export const OPTIONS_UNITE_AIRE: OptionUnite[] = UNITES_LONGUEUR_ORDRE.map((unite) => ({ value: unite, label: `${unite}²` }));

// --- Écran 2 : calculer l'aire ---

/** Tolérance réellement vérifiée = `max(0.05, |attendu|·0.01)` (`diagnostiquerCalculNumeriqueTriangle`,
 * `verificationTriangle.ts`) — relative à environ 1 %, jamais une précision fixe en décimales.
 * Annonce alignée sur cette marge réelle plutôt que sur un nombre de décimales qu'elle ne
 * respecte pas (voir audit de traçabilité de précision, cas C). */
export function consigneAire(): string {
  return "Calcule l'aire de ce triangle (une valeur approchée est acceptée, à environ 1 % près).";
}

export function labelChampAire(): string {
  return "Aire";
}

export function placeholderAire(exercice: ExerciceTriangleQuelconque): string {
  return `ex : 24,3 ${exercice.unite}²`;
}

export function texteAide1Aire(exercice: ExerciceTriangleQuelconque): string {
  const { cote1, cote2, angleCompris } = donneesFormuleAire(exercice);
  return `Utilise ${libelleCote(cote1)} et ${libelleCote(cote2)}, avec ${libelleAngle(angleCompris)} compris entre eux — surlignés ci-dessus.`;
}

export function texteAide2Aire(exercice: ExerciceTriangleQuelconque): string {
  const { cote1, cote2, angleCompris } = donneesFormuleAire(exercice);
  const seg1 = SEGMENT_COTE[cote1];
  const seg2 = SEGMENT_COTE[cote2];
  return `Aire = ½ · ${seg1} · ${seg2} · sin(${angleCompris}) = ½ · ${formatValeurLettre(exercice, cote1)} · ${formatValeurLettre(exercice, cote2)} · sin(${formatValeurLettre(exercice, angleCompris)})`;
}

export const NOMBRE_NIVEAUX_AIDE_AIRE = 2;

const TEXTES_AIDE_AIRE: ((exercice: ExerciceTriangleQuelconque) => string)[] = [texteAide1Aire, texteAide2Aire];

export function textesAideAire(exercice: ExerciceTriangleQuelconque, niveau: number): string[] {
  return TEXTES_AIDE_AIRE.slice(0, niveau).map((f) => f(exercice));
}

/**
 * Options de surlignage du croquis de l'écran 2 — niveau 0 : rien ; niveau 1 ET 2 : les deux côtés
 * de la formule d'aire + l'angle compris surlignés, INCHANGÉ entre les deux niveaux (seul le texte
 * de l'aide 2 diffère, la formule substituée — le croquis, lui, ne change plus une fois l'aide 1
 * activée, conformément au prompt de création).
 */
export function optionsCroquisAire(exercice: ExerciceTriangleQuelconque, niveau: number): TriangleQuelconqueSketchOptions {
  if (niveau <= 0) return {};
  const { cote1, cote2, angleCompris } = donneesFormuleAire(exercice);
  return { cotesSurlignes: [cote1, cote2], anglesSurlignes: [angleCompris] };
}
