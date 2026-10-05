import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { ArgumentLineaire, ArgumentQuadratique, ExerciceEquationsCyclometriques, SousCasArcfonctionsDifferentes } from "../core6e/equationsCyclometriques.types";
import { BANQUES_ARC } from "../generateurs6e/cyclometrique/banqueAngles";
import { approxFractionLatex } from "./formatFraction";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen3` (REFONTE TOTALE).
 *
 * BUG 1 (artefacts flottants/décimales périodiques brutes, variantes 4a/4c) — `approxFractionLatex`
 * cherche le PLUS PETIT dénominateur ≤ `MAX_DEN` reproduisant la valeur ; au-delà, elle tombe dans
 * son filet de sécurité et renvoie le flottant JS BRUT (ex. `0.26923076923076925`). La variante 4a
 * (`asin_acos`) combine 2 points de `BANQUE_CERCLE_RATIONNEL` dont les dénominateurs peuvent différer
 * (`1`, `5`, `13`) puis divise par un écart entier `x2-x1∈{1..4}` : dénominateur final jusqu'à
 * `lcm(5,13)×4=260`. La variante 4c (`acos_atan`) combine un triplet pythagoricien (`q∈{3,4,5,12,15}`
 * ⟹ `q²` jusqu'à `225`) avec un entier `b∈[-3;3]`. `20` (l'ancien seuil, déjà relevé depuis `12`)
 * était donc insuffisant dans les deux cas — `300` couvre le maximum théorique (`260`) avec marge de
 * sécurité ; toute valeur affichée par ce module reste un rationnel EXACT par construction (jamais
 * une approximation numérique accidentelle), donc élargir la recherche ne risque aucun faux positif.
 */
export const MAX_DEN = 300;

export const CONSIGNE_GENERALE = "Résous l'équation cyclométrique suivante, étape par étape :";
export const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const NOM_FR: Record<Arcfonction, string> = { arcsin: "sinus", arccos: "cosinus", arctan: "tangente" };
const TRIG_LATEX: Record<Arcfonction, string> = { arcsin: "\\sin", arccos: "\\cos", arctan: "\\tan" };

function fx(v: number): string {
  return approxFractionLatex(v, MAX_DEN);
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const absLatex = fx(abs);
      const corps = t.suffixe === "" ? absLatex : abs === 1 ? t.suffixe : `${absLatex}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

function formatLineaireLatex(arg: ArgumentLineaire): string {
  return formatSommeTermes([
    { valeur: arg.a, suffixe: "x" },
    { valeur: arg.b, suffixe: "" },
  ]);
}

function formatQuadratiqueLatex(arg: ArgumentQuadratique): string {
  return formatSommeTermes([
    { valeur: arg.a, suffixe: "x^{2}" },
    { valeur: arg.b, suffixe: "x" },
    { valeur: arg.c, suffixe: "" },
  ]);
}

const TOLERANCE_RECHERCHE_ANGLE = 1e-9;

/**
 * BUG 2 (trig remarquable non évaluée, écran "équation non cyclométrique", variantes 1/3) — `angle`
 * est TOUJOURS une entrée de `BANQUES_ARC[arcfonction]` par construction (`angleLineaire.ts`/
 * `angleQuadratique.ts` filtrent sur les entrées entières de cette même banque, PARTAGÉE avec
 * 6gen2 — voir `generateurs6e/fonctionsCyclometriques/index.ts::trouverAngleBanque` pour le même
 * principe de lookup, jamais un calcul flottant direct). On retrouve donc ici la valeur EXACTE déjà
 * connue (`entree.valeur`, ex. `-1`) par recherche inverse dans la banque plutôt que de construire
 * `\cos(\pi)` en LaTeX brut non résolu.
 */
function valeurTrigDepuisAngle(arcfonction: Arcfonction, angle: { latex: string; numerique: number }): string {
  const entree = BANQUES_ARC[arcfonction].find((e) => Math.abs(e.angle.numerique - angle.numerique) < TOLERANCE_RECHERCHE_ANGLE);
  if (!entree) throw new Error(`valeurTrigDepuisAngle : aucune entrée trouvée pour ${arcfonction}(${angle.latex}) — ne devrait jamais arriver`);
  return entree.valeur.latex;
}

/** Les 2 arcfonctions (gauche=u, droite=v) associées à chaque sous-cas de la variante 4. */
const ARCFONCTIONS_SOUS_CAS: Record<SousCasArcfonctionsDifferentes, [Arcfonction, Arcfonction]> = {
  asin_acos: ["arcsin", "arccos"],
  asin_atan: ["arcsin", "arctan"],
  acos_atan: ["arccos", "arctan"],
};

// ============================================================================
// Équation ORIGINALE (bloc "données", affichée sur les 4 écrans).
// ============================================================================

export function formatEquationOriginaleLatex(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${formatLineaireLatex(exercice.arg)}\\right) = ${exercice.angle.latex}`;
    case "memeArcfonction": {
      const nom = NOM_LATEX[exercice.arcfonction];
      return `${nom}\\left(${formatLineaireLatex(exercice.arg1)}\\right) = ${nom}\\left(${formatLineaireLatex(exercice.arg2)}\\right)`;
    }
    case "angleQuadratique":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${formatQuadratiqueLatex(exercice.arg)}\\right) = ${exercice.angle.latex}`;
    case "arcfonctionsDifferentes": {
      const [nom1, nom2] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
      return `${NOM_LATEX[nom1]}\\left(${formatLineaireLatex(exercice.arg1)}\\right) = ${NOM_LATEX[nom2]}\\left(${formatLineaireLatex(exercice.arg2)}\\right)`;
    }
  }
}

// ============================================================================
// Équation NON CYCLOMÉTRIQUE (bloc "état actuel", à partir de l'écran "equation").
// ============================================================================

export function formatEquationNonCycloLatex(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
      return `${formatLineaireLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}`;
    case "memeArcfonction":
      return `${formatLineaireLatex(exercice.arg1)} = ${formatLineaireLatex(exercice.arg2)}`;
    case "angleQuadratique":
      return `${formatQuadratiqueLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}`;
    case "arcfonctionsDifferentes": {
      const u = formatLineaireLatex(exercice.arg1);
      const v = formatLineaireLatex(exercice.arg2);
      if (exercice.sousCas === "asin_acos") return `\\left(${v}\\right)^{2} = 1 - \\left(${u}\\right)^{2}`;
      if (exercice.sousCas === "asin_atan") return `\\left(${v}\\right)^{2}\\left(1-\\left(${u}\\right)^{2}\\right) = \\left(${u}\\right)^{2}`;
      return `\\left(${u}\\right)^{2}\\left(1+\\left(${v}\\right)^{2}\\right) = 1`;
    }
  }
}

/** Forme intermédiaire, AVANT mise au carré (variante 4 seulement) — utilisée par l'aide de
 * l'écran "equation" (niveau 2, "transformation partiellement appliquée") et par l'aide de l'écran
 * "acceptRejet" (réinjection pour détecter une solution parasite). */
function formatIdentiteAvantCarreLatex(exercice: Extract<ExerciceEquationsCyclometriques, { variante: "arcfonctionsDifferentes" }>): string {
  const u = formatLineaireLatex(exercice.arg1);
  const v = formatLineaireLatex(exercice.arg2);
  if (exercice.sousCas === "asin_acos") return `${v} = \\sqrt{1-\\left(${u}\\right)^{2}}`;
  if (exercice.sousCas === "asin_atan") return `${v} = \\dfrac{${u}}{\\sqrt{1-\\left(${u}\\right)^{2}}}`;
  return `${v} = \\dfrac{\\sqrt{1-\\left(${u}\\right)^{2}}}{${u}}`;
}

// ============================================================================
// Écran "ce" — condition d'existence.
// ============================================================================

export function texteAideCENiveau1(exercice: ExerciceEquationsCyclometriques): string {
  if (exercice.variante === "arcfonctionsDifferentes") {
    const [nom1] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
    const base =
      nom1 === "arctan"
        ? "arctan est toujours définie sur ℝ tout entier."
        : `Le domaine de ${NOM_FR[nom1]} inverse (${NOM_LATEX[nom1]}) est [-1;1] : son argument doit y rester.`;
    if (exercice.sousCas === "acos_atan") return `${base} En plus de cela, l'identité utilisée à l'étape suivante exige que cet argument soit STRICTEMENT POSITIF.`;
    return base;
  }
  const arcfonction = exercice.arcfonction;
  if (arcfonction === "arctan") return "arctan est définie sur ℝ tout entier ⟹ aucune condition d'existence à poser.";
  return `Le domaine de ${NOM_FR[arcfonction]} inverse est [-1;1] : l'argument de ${NOM_LATEX[arcfonction]} doit rester dans cet intervalle.`;
}

// ============================================================================
// Écran "condition" — NOUVEAU, intercalaire (entre "ce" et "equation"), variante 4 UNIQUEMENT :
// condition de compatibilité des codomaines des 2 arcfonctions, distincte de la CE (domaine) posée
// à l'écran précédent — c'est ELLE qui filtrera les racines parasites à l'écran final.
// ============================================================================

const NOM_FR_MAJ: Record<Arcfonction, string> = { arcsin: "sinus", arccos: "cosinus", arctan: "tangente" };

export function texteAideConditionNiveau1(exercice: Extract<ExerciceEquationsCyclometriques, { variante: "arcfonctionsDifferentes" }>): string {
  const [nom1, nom2] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
  const base = `${NOM_LATEX[nom1].replace("\\", "")} a pour codomaine ${nom1 === "arcsin" ? "[-π/2;π/2]" : "[0;π]"}, ${NOM_LATEX[nom2].replace("\\", "")} a pour codomaine ${nom2 === "arccos" ? "[0;π]" : "(-π/2;π/2)"}.`;
  if (exercice.sousCas === "asin_acos") return `${base} Sur l'intersection [0;π/2], ${NOM_FR_MAJ.arcsin} ET ${NOM_FR_MAJ.arccos} sont TOUS LES DEUX ≥0 : les 2 arguments doivent donc être ≥0.`;
  if (exercice.sousCas === "asin_atan") return `${base} arctan ⊂ arcsin en codomaine ; sur cet intervalle, sinus et tangente sont impaires : elles ont le MÊME SIGNE que l'angle. Les 2 arguments doivent donc avoir le même signe.`;
  return `${base} Sur l'intersection [0;π/2), le cosinus ne s'annule pas et reste >0 — mais cette moitié de la condition est déjà dans la CE de l'étape 1 (regarde-la). La condition qui RESTE à poser porte sur l'AUTRE argument (celui de arctan) : il doit être ≥0.`;
}

export function texteAideConditionNiveau2(exercice: Extract<ExerciceEquationsCyclometriques, { variante: "arcfonctionsDifferentes" }>): { texte: string; latex: string } {
  const u = formatLineaireLatex(exercice.arg1);
  const v = formatLineaireLatex(exercice.arg2);
  if (exercice.sousCas === "asin_acos") return { texte: "Les 2 inégalités à poser (non résolues) :", latex: `\\begin{gathered} ${u} \\geq 0 \\\\ ${v} \\geq 0 \\end{gathered}` };
  if (exercice.sousCas === "asin_atan") return { texte: "Les 2 arguments doivent avoir le même signe :", latex: `\\operatorname{signe}\\left(${u}\\right) = \\operatorname{signe}\\left(${v}\\right)` };
  return { texte: "La seule inégalité qui reste à poser (l'autre moitié est déjà dans la CE) :", latex: `${v} \\geq 0` };
}

export function texteAideCENiveau2(exercice: ExerciceEquationsCyclometriques): { texte: string; latex: string } | null {
  if (exercice.variante === "angleLineaire" || exercice.variante === "angleQuadratique") {
    if (exercice.arcfonction === "arctan") return null;
    const interieur = exercice.variante === "angleLineaire" ? formatLineaireLatex(exercice.arg) : formatQuadratiqueLatex(exercice.arg);
    return { texte: "L'inégalité à poser (non résolue) :", latex: `-1 \\leq ${interieur} \\leq 1` };
  }
  if (exercice.variante === "memeArcfonction") {
    if (exercice.arcfonction === "arctan") return null;
    return {
      texte: "Les 2 conditions à poser (non résolues) :",
      latex: `\\begin{gathered} -1 \\leq ${formatLineaireLatex(exercice.arg1)} \\leq 1 \\\\ -1 \\leq ${formatLineaireLatex(exercice.arg2)} \\leq 1 \\end{gathered}`,
    };
  }
  // arcfonctionsDifferentes
  const [nom1] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
  const u = formatLineaireLatex(exercice.arg1);
  if (nom1 === "arctan") return null; // ne devrait jamais arriver (nom1 toujours asin/acos pour les 3 sous-cas actuels)
  const conditions = [`-1 \\leq ${u} \\leq 1`];
  if (exercice.sousCas === "acos_atan") conditions.push(`${u} > 0`);
  return { texte: "La/les condition(s) à poser (non résolues) :", latex: conditions.length === 1 ? conditions[0] : `\\begin{gathered} ${conditions.join(" \\\\ ")} \\end{gathered}` };
}

// ============================================================================
// Écran "equation" — équation non cyclométrique.
// ============================================================================

export function texteAideEquationNiveau1(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
    case "angleQuadratique":
      return `Applique la fonction directe (${TRIG_LATEX[exercice.arcfonction].replace("\\", "")}) des deux côtés pour éliminer ${NOM_LATEX[exercice.arcfonction].replace("\\", "")}.`;
    case "memeArcfonction":
      return `${NOM_LATEX[exercice.arcfonction].replace("\\", "")} est injective sur son domaine ⟹ deux images égales ⟹ les arguments eux-mêmes sont égaux.`;
    case "arcfonctionsDifferentes": {
      const [nom1, nom2] = ARCFONCTIONS_SOUS_CAS[exercice.sousCas];
      return `Applique ${TRIG_LATEX[nom1].replace("\\", "")} (ou ${TRIG_LATEX[nom2].replace("\\", "")}) des deux côtés en utilisant l'identité trigonométrique adaptée à cette paire, PUIS élève au carré pour obtenir une équation polynomiale.`;
    }
  }
}

export function texteAideEquationNiveau2(exercice: ExerciceEquationsCyclometriques): { texte: string; latex: string } {
  if (exercice.variante === "angleLineaire") {
    return { texte: "Applique la fonction directe à droite (le membre de gauche est déjà isolé), puis évalue-la :", latex: `${formatLineaireLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}` };
  }
  if (exercice.variante === "angleQuadratique") {
    return { texte: "Applique la fonction directe à droite, puis évalue-la :", latex: `${formatQuadratiqueLatex(exercice.arg)} = ${valeurTrigDepuisAngle(exercice.arcfonction, exercice.angle)}` };
  }
  if (exercice.variante === "memeArcfonction") {
    return { texte: "Par injectivité, les arguments sont égaux :", latex: `${formatLineaireLatex(exercice.arg1)} = ${formatLineaireLatex(exercice.arg2)}` };
  }
  return { texte: "L'identité trigonométrique donne (mise au carré/simplification finale non faite) :", latex: formatIdentiteAvantCarreLatex(exercice) };
}

// ============================================================================
// Écran "solutions" — existence de solutions (sans tenir compte de la CE).
// ============================================================================

export function texteAideSolutionsNiveau1(exercice: ExerciceEquationsCyclometriques): string {
  switch (exercice.variante) {
    case "angleLineaire":
    case "memeArcfonction":
      return "Une équation du 1er degré (a≠0) a toujours EXACTEMENT une solution : isole x normalement.";
    case "angleQuadratique":
      return "Isole x² d'un côté, puis n'oublie pas le double signe ± en prenant la racine carrée — sauf si x² est strictement négatif, auquel cas il n'y a AUCUNE solution réelle.";
    case "arcfonctionsDifferentes":
      if (exercice.sousCas === "asin_acos") return "Développe et regroupe : tu obtiens une équation du 2nd degré — calcule son discriminant.";
      return "Factorise en repérant un facteur commun (x apparaît souvent en facteur), ou substitue u²=X pour te ramener à une équation du 2nd degré en X.";
  }
}

export function texteAideSolutionsNiveau2(exercice: ExerciceEquationsCyclometriques): { texte: string; latex: string } {
  if (exercice.variante === "angleLineaire" || exercice.variante === "memeArcfonction") {
    const gauche = exercice.variante === "angleLineaire" ? exercice.arg.a : exercice.arg1.a - exercice.arg2.a;
    return { texte: "Le coefficient de x, une fois tout regroupé du même côté :", latex: `${fx(gauche)} \\cdot x = \\ldots` };
  }
  if (exercice.variante === "angleQuadratique") {
    const T = exercice.angle.latex;
    return { texte: "Une fois x² isolé (avant la racine carrée) :", latex: `x^{2} = \\ldots \\quad \\text{(à partir de } ${TRIG_LATEX[exercice.arcfonction]}\\left(${T}\\right)\\text{)}` };
  }
  // arcfonctionsDifferentes
  const degre = exercice.sousCas === "asin_acos" ? 2 : 4;
  return { texte: `Le degré de l'équation polynomiale obtenue :`, latex: `\\deg = ${degre}` };
}

// ============================================================================
// Écran "acceptRejet" — accepter/rejeter chaque candidat.
// ============================================================================

export function texteAideAcceptRejetNiveau1(exercice: ExerciceEquationsCyclometriques): string {
  const base = "Une solution doit vérifier la CE établie à l'étape 1.";
  if (exercice.variante !== "arcfonctionsDifferentes") return base;
  return `${base} DE PLUS, la mise au carré a pu introduire une solution PARASITE : réinjecte la valeur dans l'équation AVANT mise au carré (rappelée ci-dessous) et vérifie que le signe du membre isolé est cohérent.`;
}

export function texteAideAcceptRejetNiveau2(exercice: ExerciceEquationsCyclometriques): { texte: string; latex: string } {
  if (exercice.variante !== "arcfonctionsDifferentes") {
    return { texte: "La CE établie à l'étape 1 (compare chaque candidat à cet ensemble) :", latex: formatEquationOriginaleLatex(exercice) };
  }
  return { texte: "L'équation AVANT mise au carré, à réinjecter pour chaque candidat (le signe du membre isolé doit rester cohérent) :", latex: formatIdentiteAvantCarreLatex(exercice) };
}

export function formatCandidatLatex(x: number): string {
  return `x = ${fx(x)}`;
}

// ============================================================================
// Total de points du récapitulatif — SOMME des scores réellement calculés par le moteur (voir
// `sessionEquationsCyclometriques.ts`), affiché EN PLUS de `LigneRecap`, jamais à sa place.
// `maximum` = 100 × nombre d'écrans réellement traversés (3 à 5 selon que "condition"/"acceptRejet"
// ont été traversés ou sautés, voir `phaseApres`) — "condition" n'existe que pour la variante 4 (et
// y est alors TOUJOURS traversé, aucun sous-cas ne produisant jamais 0 candidat).
// ============================================================================

export interface TotalPoints {
  points: number;
  maximum: number;
}

export function calculerTotalPointsEquationsCyclometriques(resultat: {
  scoreCE: number;
  scoreCondition: number | null;
  scoreEquation: number;
  scoreSolutions: number;
  scoreAcceptRejet: number | null;
}): TotalPoints {
  let points = resultat.scoreCE + resultat.scoreEquation + resultat.scoreSolutions;
  let maximum = 300;
  if (resultat.scoreCondition !== null) {
    points += resultat.scoreCondition;
    maximum += 100;
  }
  if (resultat.scoreAcceptRejet !== null) {
    points += resultat.scoreAcceptRejet;
    maximum += 100;
  }
  return { points, maximum };
}
