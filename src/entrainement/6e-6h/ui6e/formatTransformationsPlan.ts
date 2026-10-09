import type { AffixeEntiere, ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransformationsPlan, ParametresTransfoA, SousTypeTransfoA } from "../core6e/transformationsPlan.types";
import type { PhaseTransformationsPlan, ResultatExerciceTransformationsPlan } from "../moteur6e/typesTransformationsPlan";
import { phasesPourExercice } from "../moteur6e/typesTransformationsPlan";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen40`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts` (6gen37), jamais importé
 * par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/6gen26/
 * 6gen34/6gen37, documenté par CLAUDE.md) — `affixeLatex` ci-dessous est la SEULE fonction qui
 * assemble un "a+bi" (a,b toujours des ENTIERS ici, voir `core6e/transformationsPlan.types.ts`) —
 * assemble TOUJOURS signe+magnitude ENSEMBLE, jamais un signe bare. Couverture de régression :
 * `formatTransformationsPlan.test.ts`, "signe orphelin", scanne le LaTeX rendu sur de nombreux
 * tirages aléatoires des 3 familles à la recherche d'un `++`/`+-`/groupe vide.
 *
 * **`\cdot` suivi d'un identifiant** (piège documenté CLAUDE.md, a touché 6gen37 pour `z_1\cdotz_2`)
 * — toute concaténation LaTeX ici insère `\,` après un `\cdot` collé à `z`/`k`/`e` (voir
 * `formuleSubstitueeA`).
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Assemblage "a+bi" (a,b entiers) — voir en-tête de fichier.
// ============================================================================

export function affixeLatex(z: AffixeEntiere): string {
  const { a, b } = z;
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

/** `e^{iθ}` — jamais une simple concaténation `"i"+angle.latex` (piège déjà rencontré/corrigé sur
 * 6gen37, `formatFormeTrigonometrique.ts` — voir son en-tête) : le signe négatif est ramené DEVANT
 * le `i` (`e^{-i\frac{\pi}{2}}`), jamais laissé coller au `i` par la droite (se lirait "i MOINS..."
 * au lieu de "i fois..."). Réimplication délibérée (jamais importée de `formatFormeTrigonometrique.
 * ts`, "jamais importé par un autre générateur" — voir son en-tête). */
function formatExpIAngle(angleLatex: string): string {
  return angleLatex.startsWith("-") ? `-i${angleLatex.slice(1)}` : `i${angleLatex}`;
}

/** Module d'un point construit par `tirerAffixeEntiereRemarquable` (axe `q∈{1,2}` → `r` entier ;
 * "quart" `q=4` → `r=k√2`) — mêmes conventions que `latexModuleDepuisAngle` de
 * `formatFormeTrigonometrique.ts` (6gen37), réimpliquée ici. */
function moduleLatex(r: number, angleQ: number): string {
  if (angleQ === 4) {
    const k = Math.round(r / Math.SQRT2);
    return k === 1 ? "\\sqrt{2}" : `${k}\\sqrt{2}`;
  }
  return `${Math.round(r)}`;
}

// ============================================================================
// Famille A — Image d'un point par une transformation classique ou composée.
// ============================================================================

/**
 * Description PURE PROSE de la transformation, consommée par `consigneGeneraleA` UNIQUEMENT — texte
 * PLAIN (`<p className="prompt-text">`, jamais `<Katex>`, voir `consigneGeneraleA`), jamais un
 * fragment `blocDonnees` (bug réel rencontré et corrigé : une PREMIÈRE version la plaçait dans
 * `blocDonneesA` sous forme `\text{Transformation : ...}` — 2 bugs en cascade trouvés par inspection
 * visuelle Playwright (jamais par les tests automatisés seuls, CLAUDE.md) : (1) le `\text{}` se
 * refermait AVANT le label — texte français qui fuyait en mode MATH KaTeX, lettres collées sans
 * espaces, syntaxiquement valide donc AUCUNE exception levée ; (2) une fois corrigé pour englober
 * tout le label DANS `\text{}`, un `_` isolé (ex. "z_v") à l'intérieur d'un bloc `\text{...}` lève
 * une VRAIE erreur KaTeX — contrairement au LaTeX standard où `\text{}` est un vrai mode texte,
 * `_`/`^` y restent des caractères spéciaux côté KaTeX, jamais neutralisés sans `\_`/`\^` explicite.
 * Une phrase descriptive complète n'a de toute façon pas sa place dans une formule KaTeX à largeur
 * fixe (débordement horizontal d'`.equation-box`, illisible même une fois la syntaxe corrigée) — fix
 * définitif : texte 100% PLAIN, aucun symbole KaTeX, intégré à la consigne générale (qui, elle,
 * wrap normalement comme tout paragraphe HTML). Voir `docs/historique-6e.md`, section 6gen40.
 */
const LIBELLE_SOUS_TYPE_A: Record<SousTypeTransfoA, string> = {
  translation: "une translation",
  homothetie: "une homothétie de centre O",
  rotation: "une rotation de centre O",
  similitude: "une similitude de centre O (rotation puis homothétie)",
  rotationTranslation: "une rotation de centre O, SUIVIE d'une translation",
};

export function consigneGeneraleA(e: ExerciceTransfoA): string {
  return `P est un point d'affixe z_P. Identifie la formule complexe correspondant à ${LIBELLE_SOUS_TYPE_A[e.parametres.sousType]}, puis calcule l'image de P.`;
}

export function blocDonneesA(e: ExerciceTransfoA): string[] {
  const lignes = [`z_P=${affixeLatex(e.zP)}`];
  const p = e.parametres;
  if (p.sousType === "translation") lignes.push(`z_v=${affixeLatex(p.zV)}`);
  else if (p.sousType === "homothetie") lignes.push(`k=${p.k}`);
  else if (p.sousType === "rotation") lignes.push(`\\theta=${p.angle.latex}`);
  else if (p.sousType === "similitude") lignes.push(`k=${p.k}\\quad\\theta=${p.angle.latex}`);
  else lignes.push(`\\theta=${p.angle.latex}\\quad z_v=${affixeLatex(p.zV)}`);
  return lignes;
}

/** Formule CORRECTE, symboles substitués par les valeurs numériques réelles de l'exercice — utilisée
 * pour le "état actuel" de l'écran 2 et le récapitulatif final (jamais pour l'écran 1, un QCM
 * volontairement SYMBOLIQUE — voir `optionsFormuleA`). */
function formuleSubstitueeA(e: ExerciceTransfoA): string {
  const p = e.parametres;
  const zP = affixeLatex(e.zP);
  switch (p.sousType) {
    case "translation":
      return `z_P+z_v=(${zP})+(${affixeLatex(p.zV)})`;
    case "homothetie":
      return `k\\cdot\\, z_P=${p.k}\\cdot\\,(${zP})`;
    case "rotation":
      return `z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}=(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}`;
    case "similitude":
      return `k\\cdot\\, z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}=${p.k}\\cdot\\,(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}`;
    case "rotationTranslation":
      return `z_P\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}+z_v=(${zP})\\cdot\\, e^{${formatExpIAngle(p.angle.latex)}}+(${affixeLatex(p.zV)})`;
  }
}

export function consigneEcranA(phase: PhaseTransformationsPlan): string {
  if (phase === "aEcran1") return "Parmi les formules proposées, choisis celle qui correspond EXACTEMENT à cette transformation.";
  return "Calcule l'image de P à partir de la formule CONFIRMÉE à l'étape précédente.";
}

export function etatActuelA(e: ExerciceTransfoA, phase: PhaseTransformationsPlan): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`${formuleSubstitueeA(e)}\\text{ (formule confirmée)}`];
}

export function champsA(phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase === "aEcran2") return [{ type: "texte", label: "Image de P =", placeholder: "ex : 3+2i" }];
  return []; // aEcran1 : écran de CHOIX (QCM), aucun champ texte — voir EtapeChoixFormuleTransformationsPlan.
}

export function niveauAideMaxA(phase: PhaseTransformationsPlan): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "Formules complexes de base : translation de vecteur z_v → on ADDITIONNE z_v ; homothétie de rapport k → on MULTIPLIE par k ; rotation d'angle θ → on MULTIPLIE par e^{iθ}.", latex: null };
}
export function aideNiveau2A(e: ExerciceTransfoA, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  const p = e.parametres;
  if (p.sousType === "translation") return { texte: "Ici, une translation SEULE :", latex: "z_P+z_v" };
  if (p.sousType === "homothetie") return { texte: "Ici, une homothétie SEULE :", latex: "k\\cdot\\, z_P" };
  if (p.sousType === "rotation") return { texte: "Ici, une rotation SEULE :", latex: "z_P\\cdot\\, e^{i\\theta}" };
  if (p.sousType === "similitude") return { texte: "Formules de base rappelées séparément (assemblage non fait) :", latex: "k\\cdot\\, z_P\\qquad z_P\\cdot\\, e^{i\\theta}" };
  return { texte: "Formules de base rappelées séparément (ordre d'application non donné) :", latex: "z_P\\cdot\\, e^{i\\theta}\\qquad z_P+z_v" };
}

/**
 * QCM famille A, écran 1 — options SYMBOLIQUES (z_P, k, θ, z_v), UNE formule EXACTE (id "correct")
 * parmi 3-4 distracteurs plausibles par sous-type. Le piège central de la spec (ordre des opérations
 * pour une transformation composée) est encodé dans `rotationTranslation` : le distracteur
 * `"ordreInverse"` applique la translation AVANT la rotation — `(z_P+z_v)\cdot e^{i\theta}`, diverge
 * en général de la formule correcte `z_P\cdot e^{i\theta}+z_v` (rotation+homothétie, elles, sont
 * commutatives — même centre O — donc `similitude` n'a pas ce piège d'ordre, seulement des pièges
 * d'opération/signe).
 */
export function optionsFormuleA(sousType: SousTypeTransfoA): { id: string; latex: string }[] {
  switch (sousType) {
    case "translation":
      return [
        { id: "sensInverse", latex: "z_v-z_P" },
        { id: "correct", latex: "z_P+z_v" },
        { id: "signeInverse", latex: "z_P-z_v" },
        { id: "operationErronee", latex: "z_P\\cdot\\, z_v" },
      ];
    case "homothetie":
      return [
        { id: "operationErronee", latex: "z_P+k" },
        { id: "operationInverse", latex: "\\dfrac{z_P}{k}" },
        { id: "correct", latex: "k\\cdot\\, z_P" },
        { id: "puissanceErronee", latex: "z_P^{k}" },
      ];
    case "rotation":
      return [
        { id: "operationErronee", latex: "z_P+e^{i\\theta}" },
        { id: "correct", latex: "z_P\\cdot\\, e^{i\\theta}" },
        { id: "signeInverse", latex: "z_P\\cdot\\, e^{-i\\theta}" },
        { id: "sensInverse", latex: "\\dfrac{e^{i\\theta}}{z_P}" },
      ];
    case "similitude":
      return [
        { id: "correct", latex: "k\\cdot\\, z_P\\cdot\\, e^{i\\theta}" },
        { id: "kDansExposant", latex: "z_P\\cdot\\, e^{ik\\theta}" },
        { id: "operationErronee", latex: "k+z_P\\cdot\\, e^{i\\theta}" },
        { id: "signeInverse", latex: "k\\cdot\\, z_P\\cdot\\, e^{-i\\theta}" },
      ];
    case "rotationTranslation":
      return [
        { id: "ordreInverse", latex: "(z_P+z_v)\\cdot\\, e^{i\\theta}" },
        { id: "zvDansRotation", latex: "z_P+z_v\\cdot\\, e^{i\\theta}" },
        { id: "correct", latex: "z_P\\cdot\\, e^{i\\theta}+z_v" },
        { id: "signeInverse", latex: "z_P\\cdot\\, e^{i\\theta}-z_v" },
      ];
  }
}

// ============================================================================
// Famille B — Construire un point depuis somme/produit, identifier la transformation.
// ============================================================================

export function consigneGeneraleB(): string {
  return "A et B sont 2 points d'affixes z_A et z_B. Construis le point demandé, puis identifie la transformation géométrique qu'il représente.";
}

export function blocDonneesB(e: ExerciceTransfoB): string[] {
  const symbole = e.sousType === "somme" ? "+" : "\\cdot\\,";
  const nomPoint = e.sousType === "somme" ? "M" : "P";
  return [`z_A=${affixeLatex(e.zA)}\\quad z_B=${affixeLatex(e.zB)}`, `z_{${nomPoint}}=z_A${symbole}z_B=\\,?`];
}

export function consigneEcranB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): string {
  if (phase === "bEcran1") return e.sousType === "somme" ? "Calcule z_M=z_A+z_B." : "Calcule z_P=z_A·z_B.";
  return "À partir du point CONFIRMÉ ci-dessus, identifie la transformation géométrique qu'il représente : choisis le type, puis donne le(s) paramètre(s).";
}

export function etatActuelB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): string[] | null {
  if (phase !== "bEcran2") return null;
  const nomPoint = e.sousType === "somme" ? "M" : "P";
  return [`z_{${nomPoint}}=${affixeLatex(e.zResultat)}\\text{ (confirmé)}`];
}

export function champsB(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase !== "bEcran1") return [];
  const label = e.sousType === "somme" ? "z_M =" : "z_P =";
  return [{ type: "texte", label, placeholder: "ex : 3+2i" }];
}

export function niveauAideMaxB(phase: PhaseTransformationsPlan): number {
  return phase === "bEcran2" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  return { texte: "z_A+z_B est TOUJOURS une translation ; z_A·z_B est TOUJOURS une similitude centrée en O — sans dire encore laquelle correspond à quel point.", latex: null };
}
export function aideNiveau2B(e: ExerciceTransfoB, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "bEcran2") return AUCUNE_AIDE;
  return { texte: "Module et argument de A et de B (lien avec la transformation non fait) :", latex: `r_A=${moduleLatex(e.rA, e.angleA.q)}\\text{, }\\theta_A=${e.angleA.latex}\\text{, }r_B=${moduleLatex(e.rB, e.angleB.q)}\\text{, }\\theta_B=${e.angleB.latex}` };
}

// ============================================================================
// Famille C — Similitude centrée en O, modules égaux.
// ============================================================================

const NOMS_AUTRES_POINTS = ["C", "D", "E"];

export function nomPoint(index: number): string {
  return NOMS_AUTRES_POINTS[index] ?? `P_{${index}}`;
}

export function consigneGeneraleC(): string {
  return "A et B sont 2 points tels que |z_A|=|z_B|. Vérifie cette égalité, détermine la rotation de centre O qui transforme A en B, puis applique-la aux autres points donnés.";
}

export function blocDonneesC(e: ExerciceTransfoC): string[] {
  const lignes = [`z_A=${affixeLatex(e.zA)}\\quad z_B=${affixeLatex(e.zB)}`];
  e.autresPoints.forEach((p, i) => lignes.push(`z_{${nomPoint(i)}}=${affixeLatex(p)}`));
  return lignes;
}

export function consigneEcranC(phase: PhaseTransformationsPlan): string {
  if (phase === "cEcran1") return "Calcule |z_A| et |z_B| (elles doivent être égales).";
  if (phase === "cEcran2") return "À partir de l'égalité CONFIRMÉE, détermine l'angle de la rotation de centre O qui transforme A en B (rapport 1, rotation pure).";
  return "Applique la rotation CONFIRMÉE à chacun des autres points donnés pour trouver leurs images.";
}

export function etatActuelC(e: ExerciceTransfoC, phase: PhaseTransformationsPlan): string[] | null {
  const modulesConfirmes = `|z_A|=|z_B|=${moduleLatex(e.moduleCommun, e.angleA.q)}\\text{ (confirmé)}`;
  if (phase === "cEcran2") return [modulesConfirmes];
  // Écran 3 : cumule les modules égaux (écran 1) ET l'angle de la rotation (écran 2), du plus ancien
  // au plus récent — jamais seulement l'écran immédiatement précédent (audit transversal "état
  // actuel cumulatif").
  if (phase === "cEcran3") return [modulesConfirmes, `\\theta=${e.angleRotation.latex}\\text{ (confirmé)}`];
  return null;
}

export function champsC(phase: PhaseTransformationsPlan): ChampDef[] {
  if (phase === "cEcran1")
    return [
      { type: "texte", label: "|z_A| =", placeholder: "ex : sqrt(2)" },
      { type: "texte", label: "|z_B| =", placeholder: "ex : sqrt(2)" },
    ];
  if (phase === "cEcran2") return [{ type: "texte", label: "θ =", placeholder: "ex : pi/2" }];
  return []; // cEcran3 : add-as-needed, voir EtapeImagesTransformationsPlan.
}

export function niveauAideMaxC(phase: PhaseTransformationsPlan): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Une similitude centrée en O de rapport 1 est une ROTATION PURE — aucune homothétie associée.", latex: null };
}
export function aideNiveau2C(e: ExerciceTransfoC, phase: PhaseTransformationsPlan): AideAvecLatex {
  if (phase !== "cEcran2") return AUCUNE_AIDE;
  return { texte: "Arguments de A et de B (différence non calculée) :", latex: `\\theta_A=${e.angleA.latex}\\text{, }\\theta_B=${e.angleB.latex}` };
}

// ============================================================================
// Dispatch commun (mirroir 6gen37).
// ============================================================================

export function consigneGenerale(exercice: ExerciceTransformationsPlan): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceTransformationsPlan): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
  }
}

export function aideNiveau2(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseTransformationsPlan, string> = {
  aEcran1: "Étape 1 (formule)",
  aEcran2: "Étape 2 (image calculée)",
  bEcran1: "Étape 1 (point construit)",
  bEcran2: "Étape 2 (transformation identifiée)",
  cEcran1: "Étape 1 (modules égaux)",
  cEcran2: "Étape 2 (angle de la rotation)",
  cEcran3: "Étape 3 (images des autres points)",
};

export const LIBELLE_FAMILLE: Record<ExerciceTransformationsPlan["famille"], string> = {
  A: "A — Image d'un point par une transformation",
  B: "B — Construire un point, identifier la transformation",
  C: "C — Similitude centrée en O, modules égaux",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [optionsFormuleA(exercice.parametres.sousType).find((o) => o.id === "correct")?.latex ?? ""];
      return [`z_{P'}=${affixeLatex(exercice.image)}`];
    case "B":
      if (phase === "bEcran1") return [affixeLatex(exercice.zResultat)];
      if (exercice.sousType === "somme") return [`\\text{translation, vecteur : }${affixeLatex(exercice.zB)}`];
      return [`\\text{similitude, rapport : }${moduleLatex(exercice.rB, exercice.angleB.q)}\\text{, angle : }${exercice.angleB.latex}`];
    case "C":
      if (phase === "cEcran1") return [`|z_A|=|z_B|=${moduleLatex(exercice.moduleCommun, exercice.angleA.q)}`];
      if (phase === "cEcran2") return [`\\theta=${exercice.angleRotation.latex}`];
      return exercice.imagesAutresPoints.map((img, i) => `z_{${nomPoint(i)}'}=${affixeLatex(img)}`);
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 2 pour A/B, 3 pour C). */
export function calculerTotalPointsTransformationsPlan(resultat: ResultatExerciceTransformationsPlan): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}

export type { ParametresTransfoA };
