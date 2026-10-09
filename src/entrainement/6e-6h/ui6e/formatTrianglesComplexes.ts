import type { ExerciceTrianglesA, ExerciceTrianglesB, ExerciceTrianglesC, ExerciceTrianglesD, ExerciceTrianglesComplexes, StatutSommet } from "../core6e/trianglesComplexes.types";
import type { PhaseTrianglesComplexes, ResultatExerciceTrianglesComplexes } from "../moteur6e/typesTrianglesComplexes";
import { phasesPourExercice } from "../moteur6e/typesTrianglesComplexes";
import { pointEntierLatex } from "../generateurs6e/trianglesComplexes/construction";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen41`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode math** (bugs déjà
 * rencontrés et corrigés ailleurs, documentés CLAUDE.md) — ce générateur affiche beaucoup de
 * conclusions en PROSE ("isocèle en B", "pas rectangle") : ces libellés restent TOUJOURS du texte
 * HTML brut hors KaTeX (label de bouton, `etat-actuel-box` texte) ou `\text{...}`-wrappés à
 * l'intérieur d'un fragment KaTeX — jamais du français injecté nu dans une expression `Katex`.
 * Couverture de régression : `formatTrianglesComplexes.test.ts`.
 */

export type TypeChamp = "texte";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface ChoixDef {
  id: string;
  label: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Libellés de statut partagés (famille A : sommets A/B/C ; famille B : sommet fixe O/A/B).
// ============================================================================

export const LIBELLE_ISOCELE_ABC: Record<StatutSommet, string> = { A: "Isocèle en A", B: "Isocèle en B", C: "Isocèle en C", aucun: "Pas isocèle" };
export const LIBELLE_RECTANGLE_ABC: Record<StatutSommet, string> = { A: "Rectangle en A", B: "Rectangle en B", C: "Rectangle en C", aucun: "Pas rectangle" };
export const LIBELLE_ISOCELE_OAB: Record<"O" | "A" | "B" | "aucun", string> = { O: "Isocèle en O", A: "Isocèle en A", B: "Isocèle en B", aucun: "Pas isocèle" };
export const LIBELLE_RECTANGLE_OAB: Record<"O" | "A" | "B" | "aucun", string> = { O: "Rectangle en O", A: "Rectangle en A", B: "Rectangle en B", aucun: "Pas rectangle" };

const OPTIONS_ISOCELE_ABC: ChoixDef[] = [
  { id: "A", label: LIBELLE_ISOCELE_ABC.A },
  { id: "B", label: LIBELLE_ISOCELE_ABC.B },
  { id: "C", label: LIBELLE_ISOCELE_ABC.C },
  { id: "aucun", label: LIBELLE_ISOCELE_ABC.aucun },
];
const OPTIONS_RECTANGLE_ABC: ChoixDef[] = [
  { id: "A", label: LIBELLE_RECTANGLE_ABC.A },
  { id: "B", label: LIBELLE_RECTANGLE_ABC.B },
  { id: "C", label: LIBELLE_RECTANGLE_ABC.C },
  { id: "aucun", label: LIBELLE_RECTANGLE_ABC.aucun },
];
const OPTIONS_ISOCELE_OAB: ChoixDef[] = [
  { id: "O", label: LIBELLE_ISOCELE_OAB.O },
  { id: "A", label: LIBELLE_ISOCELE_OAB.A },
  { id: "B", label: LIBELLE_ISOCELE_OAB.B },
  { id: "aucun", label: LIBELLE_ISOCELE_OAB.aucun },
];
const OPTIONS_RECTANGLE_OAB: ChoixDef[] = [
  { id: "O", label: LIBELLE_RECTANGLE_OAB.O },
  { id: "A", label: LIBELLE_RECTANGLE_OAB.A },
  { id: "B", label: LIBELLE_RECTANGLE_OAB.B },
  { id: "aucun", label: LIBELLE_RECTANGLE_OAB.aucun },
];
const OPTIONS_EQUIDISTANCE: ChoixDef[] = [
  { id: "equidistant", label: "A est équidistant des 3 sommets (= centre du triangle)" },
  { id: "non", label: "A n'est pas équidistant des 3 sommets" },
];
const OPTIONS_COHERENCE: ChoixDef[] = [
  { id: "coherent", label: "Cohérent — même rapport et même angle retrouvés via (B,D)" },
  { id: "incoherent", label: "Incohérent" },
];

// ============================================================================
// Famille A — Démontrer isocèle et/ou rectangle.
// ============================================================================

export function consigneGeneraleA(): string {
  return "Étudie les propriétés du triangle ABC défini par les affixes de ses sommets : calcule ses côtés, puis démontre s'il est isocèle et/ou rectangle.";
}
export function blocDonneesA(e: ExerciceTrianglesA): string[] {
  return [`z_A=${e.A.latex}`, `z_B=${e.B.latex}`, `z_C=${e.C.latex}`];
}
export function consigneEcranA(phase: PhaseTrianglesComplexes): string {
  if (phase === "aEcran1") return "Calcule les 3 longueurs de côtés du triangle, via le module d'une différence d'affixes (ex. AB=|z_B-z_A|).";
  if (phase === "aEcran2") return "À partir des longueurs CONFIRMÉES, indique en quel sommet le triangle est isocèle (ou choisis \"pas isocèle\").";
  return "Vérifie la relation de Pythagore entre les 3 longueurs CONFIRMÉES pour conclure si le triangle est rectangle (ou choisis \"pas rectangle\").";
}
export function etatActuelA(e: ExerciceTrianglesA, phase: PhaseTrianglesComplexes): string[] | null {
  const longueursConfirmees = `AB=${e.longueurAB}\\text{, }AC=${e.longueurAC}\\text{, }BC=${e.longueurBC}\\text{ (confirmées)}`;
  if (phase === "aEcran2") return [longueursConfirmees];
  // Écran 3 : cumule les longueurs (écran 1) ET la conclusion isocèle (écran 2), du plus ancien au
  // plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état actuel
  // cumulatif").
  if (phase === "aEcran3") return [longueursConfirmees, `\\text{${LIBELLE_ISOCELE_ABC[e.sommetIsocele]} (confirmé)}`];
  return null;
}
export function champsA(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "AB =", placeholder: "ex : 5" }, { type: "texte", label: "AC =", placeholder: "ex : 5" }, { type: "texte", label: "BC =", placeholder: "ex : 6" }];
  return [];
}
export function choixA(phase: PhaseTrianglesComplexes): ChoixDef[] {
  if (phase === "aEcran2") return OPTIONS_ISOCELE_ABC;
  if (phase === "aEcran3") return OPTIONS_RECTANGLE_ABC;
  return [];
}
export function niveauAideMaxA(phase: PhaseTrianglesComplexes): number {
  return phase === "aEcran3" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "aEcran3") return AUCUNE_AIDE;
  return { texte: "Dans un triangle rectangle, le carré du plus grand côté (l'hypoténuse) est égal à la somme des carrés des deux autres.", latex: null };
}
export function aideNiveau2A(e: ExerciceTrianglesA, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "aEcran3") return AUCUNE_AIDE;
  return { texte: "Les 3 carrés des longueurs (comparaison non faite) :", latex: `AB^2=${e.longueurAB * e.longueurAB}\\text{, }AC^2=${e.longueurAC * e.longueurAC}\\text{, }BC^2=${e.longueurBC * e.longueurBC}` };
}

// ============================================================================
// Famille B — Triangle isocèle non rectangle, loi des cosinus.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Étudie le triangle isocèle OAB : calcule ses côtés, démontre qu'il n'est pas rectangle, puis détermine ses 3 angles grâce à la loi des cosinus.";
}
export function blocDonneesB(e: ExerciceTrianglesB): string[] {
  return [`z_O=${e.O.latex}`, `z_A=${e.A.latex}`, `z_B=${e.B.latex}`];
}
export function consigneEcranB(phase: PhaseTrianglesComplexes): string {
  if (phase === "bEcran1") return "Calcule les 3 longueurs de côtés OA, OB, AB.";
  if (phase === "bEcran2") return "À partir des longueurs CONFIRMÉES, indique en quel sommet le triangle est isocèle.";
  if (phase === "bEcran3") return "Vérifie que la relation de Pythagore ne se vérifie pour AUCUNE paire de côtés : conclus que le triangle n'est pas rectangle.";
  return "Applique la loi des cosinus pour trouver l'angle à l'apex, puis déduis les 2 angles de base (égaux entre eux, somme des 3 angles=180°). Réponses en DEGRÉS.";
}
export function etatActuelB(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): string[] | null {
  // 4 écrans — chaque phase >=2 cumule TOUTES les conclusions précédentes, du plus ancien au plus
  // récent, jamais seulement l'écran immédiatement précédent (audit transversal "état actuel
  // cumulatif" — bug trouvé ici : bEcran3/4 ne montraient QUE les longueurs de l'écran 1, jamais la
  // conclusion isocèle de l'écran 2, ni — pour bEcran4 — la conclusion rectangle de l'écran 3).
  const longueursConfirmees = `OA=${e.longueurOA}\\text{, }OB=${e.longueurOB}\\text{, }AB=${e.longueurAB}\\text{ (confirmées)}`;
  const isoceleConfirme = `\\text{${LIBELLE_ISOCELE_OAB[e.sommetIsocele]} (confirmé)}`;
  const rectangleConfirme = `\\text{${LIBELLE_RECTANGLE_OAB[e.sommetRectangle]} (confirmé)}`;
  if (phase === "bEcran2") return [longueursConfirmees];
  if (phase === "bEcran3") return [longueursConfirmees, isoceleConfirme];
  if (phase === "bEcran4") return [longueursConfirmees, isoceleConfirme, rectangleConfirme];
  return null;
}
export function champsB(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "bEcran1") return [{ type: "texte", label: "OA =", placeholder: "ex : 5" }, { type: "texte", label: "OB =", placeholder: "ex : 5" }, { type: "texte", label: "AB =", placeholder: "ex : 6" }];
  if (phase === "bEcran4") return [{ type: "texte", label: "Angle en O (°) =", placeholder: "ex : 73.74" }, { type: "texte", label: "Angle en A (°) =", placeholder: "ex : 53.13" }, { type: "texte", label: "Angle en B (°) =", placeholder: "ex : 53.13" }];
  return [];
}
export function choixB(phase: PhaseTrianglesComplexes): ChoixDef[] {
  if (phase === "bEcran2") return OPTIONS_ISOCELE_OAB;
  if (phase === "bEcran3") return OPTIONS_RECTANGLE_OAB;
  return [];
}
export function niveauAideMaxB(phase: PhaseTrianglesComplexes): number {
  return phase === "bEcran4" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "bEcran4") return AUCUNE_AIDE;
  return { texte: "Loi des cosinus, appliquée à l'angle de l'apex O :", latex: "AB^2=OA^2+OB^2-2\\cdot\\,OA\\cdot\\,OB\\cdot\\cos(\\widehat{O})" };
}
export function aideNiveau2B(e: ExerciceTrianglesB, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "bEcran4") return AUCUNE_AIDE;
  return { texte: "Équation substituée (résolution en l'angle non faite) :", latex: `${e.longueurAB * e.longueurAB}=${e.longueurOA * e.longueurOA}+${e.longueurOB * e.longueurOB}-2\\times ${e.longueurOA}\\times ${e.longueurOB}\\times\\cos(\\widehat{O})` };
}

// ============================================================================
// Famille C — Triangle équilatéral et point remarquable.
// ============================================================================

export function consigneGeneraleC(): string {
  return "Vérifie que OBF est équilatéral, puis démontre que A est équidistant des 3 sommets (donc le centre du triangle).";
}
export function blocDonneesC(e: ExerciceTrianglesC): string[] {
  return [`z_O=${e.O.latex}`, `z_B=${e.B.latex}`, `z_F=${e.F.latex}`, `z_A=${e.A.latex}`];
}
export function consigneEcranC(phase: PhaseTrianglesComplexes): string {
  if (phase === "cEcran1") return "Calcule les 3 longueurs OB, BF, OF, et vérifie qu'elles sont toutes égales (triangle équilatéral).";
  return "Calcule les 3 distances AO, AB, AF, vérifie l'équidistance, puis conclus.";
}
export function etatActuelC(e: ExerciceTrianglesC, phase: PhaseTrianglesComplexes): string[] | null {
  if (phase === "cEcran2") return [`OB=BF=OF=${e.cote}\\text{ (confirmé — triangle équilatéral)}`];
  return null;
}
export function champsC(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "OB =", placeholder: "ex : 6" }, { type: "texte", label: "BF =", placeholder: "ex : 6" }, { type: "texte", label: "OF =", placeholder: "ex : 6" }];
  return [{ type: "texte", label: "AO =", placeholder: "ex : sqrt(3)" }, { type: "texte", label: "AB =", placeholder: "ex : sqrt(3)" }, { type: "texte", label: "AF =", placeholder: "ex : sqrt(3)" }];
}
export function choixC(phase: PhaseTrianglesComplexes): ChoixDef[] {
  return phase === "cEcran2" ? OPTIONS_EQUIDISTANCE : [];
}
export function niveauAideMaxC(phase: PhaseTrianglesComplexes): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Un point équidistant des 3 sommets d'un triangle est son centre (cercle circonscrit) — pour un triangle équilatéral, ce point est aussi le centre de gravité.", latex: null };
}
export function aideNiveau2C(e: ExerciceTrianglesC, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "2 des 3 distances (la 3e non calculée) :", latex: `AO=${e.distanceCentre.latex}\\text{, }AB=${e.distanceCentre.latex}` };
}

// ============================================================================
// Famille D — Similitude entre deux triangles.
// ============================================================================

export function consigneGeneraleD(): string {
  return "Le triangle OCD est l'image du triangle OAB par une similitude de centre O. Détermine cette similitude.";
}
export function blocDonneesD(e: ExerciceTrianglesD): string[] {
  return [`z_O=0\\quad z_A=${e.A.latex}\\quad z_B=${e.B.latex}`, `z_C=${e.C.latex}\\quad z_D=${e.D.latex}`];
}
export function consigneEcranD(phase: PhaseTrianglesComplexes): string {
  if (phase === "dEcran1") return "Calcule le rapport (|z_C|/|z_A|) et l'angle (arg(z_C)-arg(z_A)) de la similitude.";
  if (phase === "dEcran2") return "Vérifie la cohérence en retrouvant le même rapport et le même angle via la seconde paire de points (B,D).";
  return "Écris le nombre complexe qui caractérise cette similitude (multiplicateur=k·e^{iθ}) sous forme a+bi, à partir du rapport et de l'angle CONFIRMÉS.";
}
export function etatActuelD(e: ExerciceTrianglesD, phase: PhaseTrianglesComplexes): string[] | null {
  const rapportAngleConfirmes = `k=${e.rapport}\\text{, }\\theta=${e.angleLatex}\\text{ (confirmés)}`;
  if (phase === "dEcran2") return [rapportAngleConfirmes];
  // Écran 3 : cumule rapport/angle (écran 1) ET la conclusion de cohérence (écran 2), du plus
  // ancien au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal
  // "état actuel cumulatif").
  if (phase === "dEcran3") return [rapportAngleConfirmes, `\\text{${OPTIONS_COHERENCE[0].label} (confirmé)}`];
  return null;
}
export function champsD(phase: PhaseTrianglesComplexes): ChampDef[] {
  if (phase === "dEcran1") return [{ type: "texte", label: "Rapport k =", placeholder: "ex : 3" }, { type: "texte", label: "Angle θ =", placeholder: "ex : pi/2" }];
  if (phase === "dEcran3") return [{ type: "texte", label: "Multiplicateur =", placeholder: "ex : 3i" }];
  return [];
}
export function choixD(phase: PhaseTrianglesComplexes): ChoixDef[] {
  return phase === "dEcran2" ? OPTIONS_COHERENCE : [];
}
export function niveauAideMaxD(phase: PhaseTrianglesComplexes): number {
  return phase === "dEcran1" ? 2 : 0;
}
export function aideNiveau1D(phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: "Une similitude centrée en O multiplie tous les affixes par un même nombre complexe (de module=rapport et d'argument=angle).", latex: null };
}
export function aideNiveau2D(e: ExerciceTrianglesD, phase: PhaseTrianglesComplexes): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: "Rapport déjà calculé via A et C (angle non calculé) :", latex: `k=${e.rapport}` };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceTrianglesComplexes): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
  }
}

export function blocDonnees(exercice: ExerciceTrianglesComplexes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
  }
}

export function consigneEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
  }
}

export function etatActuel(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
    case "D":
      return champsD(phase);
  }
}

export function choixEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): ChoixDef[] {
  switch (exercice.famille) {
    case "A":
      return choixA(phase);
    case "B":
      return choixB(phase);
    case "C":
      return choixC(phase);
    case "D":
      return choixD(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseTrianglesComplexes, string> = {
  aEcran1: "Étape 1 (longueurs)",
  aEcran2: "Étape 2 (isocèle ?)",
  aEcran3: "Étape 3 (rectangle ?)",
  bEcran1: "Étape 1 (longueurs)",
  bEcran2: "Étape 2 (isocèle ?)",
  bEcran3: "Étape 3 (rectangle ?)",
  bEcran4: "Étape 4 (loi des cosinus)",
  cEcran1: "Étape 1 (OBF équilatéral)",
  cEcran2: "Étape 2 (A équidistant)",
  dEcran1: "Étape 1 (rapport, angle)",
  dEcran2: "Étape 2 (cohérence)",
  dEcran3: "Étape 3 (multiplicateur)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTrianglesComplexes["famille"], string> = {
  A: "A — Démontrer isocèle et/ou rectangle",
  B: "B — Triangle isocèle non rectangle, loi des cosinus",
  C: "C — Triangle équilatéral et point remarquable",
  D: "D — Similitude entre deux triangles",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [`AB=${exercice.longueurAB}\\text{, }AC=${exercice.longueurAC}\\text{, }BC=${exercice.longueurBC}`];
      if (phase === "aEcran2") return [`\\text{${LIBELLE_ISOCELE_ABC[exercice.sommetIsocele]}}`];
      return [`\\text{${LIBELLE_RECTANGLE_ABC[exercice.sommetRectangle]}}`];
    case "B":
      if (phase === "bEcran1") return [`OA=${exercice.longueurOA}\\text{, }OB=${exercice.longueurOB}\\text{, }AB=${exercice.longueurAB}`];
      if (phase === "bEcran2") return [`\\text{${LIBELLE_ISOCELE_OAB[exercice.sommetIsocele]}}`];
      if (phase === "bEcran3") return [`\\text{${LIBELLE_RECTANGLE_OAB[exercice.sommetRectangle]}}`];
      return [`\\widehat{O}\\approx ${exercice.angleApexDeg.toFixed(2)}°\\text{, }\\widehat{A}=\\widehat{B}\\approx ${exercice.angleBaseDeg.toFixed(2)}°`];
    case "C":
      if (phase === "cEcran1") return [`OB=BF=OF=${exercice.cote}`];
      return [`AO=AB=AF=${exercice.distanceCentre.latex}\\text{, }\\text{A est le centre du triangle}`];
    case "D":
      if (phase === "dEcran1") return [`k=${exercice.rapport}\\text{, }\\theta=${exercice.angleLatex}`];
      if (phase === "dEcran2") return [`\\text{${OPTIONS_COHERENCE[0].label}}`];
      return [pointEntierLatex(exercice.multiplicateurRe, exercice.multiplicateurIm)];
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 3 pour A/D, 4 pour B, 2 pour C). */
export function calculerTotalPointsTrianglesComplexes(resultat: ResultatExerciceTrianglesComplexes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
