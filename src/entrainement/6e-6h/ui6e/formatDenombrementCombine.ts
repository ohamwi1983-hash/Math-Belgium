import type {
  ExerciceDenombCombA,
  ExerciceDenombCombB,
  ExerciceDenombCombC,
  ExerciceDenombCombD,
  ExerciceDenombrementCombine,
  SousTypeDenombCombB,
  TypeContrainteD,
} from "../core6e/denombrementCombine.types";
import type { PhaseDenombrementCombine, ResultatExerciceDenombrementCombine } from "../moteur6e/typesDenombrementCombine";
import { phasesPourExercice } from "../moteur6e/typesDenombrementCombine";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen44`. Dispatch sur
 * `exercice.famille` PUIS `sousType` PUIS `phase`, mirroir `formatDenombrementFondamental.ts`
 * (6gen43), jamais importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** (bug déjà rencontré
 * et corrigé sur plusieurs générateurs 6e, documenté par CLAUDE.md) — toute clause en français mêlée
 * à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths. **Vigilance
 * débordement horizontal** (bug 6gen43, leçon documentée `docs/historique-6e.md`) — jamais une phrase
 * française de plus d'une cinquantaine de caractères dans un seul fragment `\text{...}` : toujours
 * répartie sur plusieurs entrées du tableau `string[]` retourné par `blocDonnees`/`etatActuel`.
 * Couverture de régression : `formatDenombrementCombine.test.ts`, scan sur de nombreux tirages
 * aléatoires à la recherche d'un `++`/`+-`/`--`/groupe `{}` vide, et `scrollWidth` en Playwright.
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

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

const CHIFFRES_INDICE: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };
const CHIFFRES_EXPOSANT: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

/** Notation `Cₙᵏ` en Unicode indice/exposant (jamais de vrai KaTeX ici, ce label de champ est rendu
 * en texte BRUT — voir en-tête de fichier) — approximation valable UNIQUEMENT pour des valeurs
 * NUMÉRIQUES CONCRÈTES (chiffres 0-9, tous ont un équivalent Unicode indice/exposant), jamais pour
 * une lettre générique hors de l'ensemble Unicode restreint (voir CLAUDE.md/piège notation
 * combinatoire) — usage ICI limité aux 2 champs `champsD` où `e.n`/`e.k` sont déjà résolus en
 * nombres concrets par l'appelant. */
function labelCombinaison(n: number, k: number): string {
  const indice = String(n)
    .split("")
    .map((c) => CHIFFRES_INDICE[c] ?? c)
    .join("");
  const exposant = String(k)
    .split("")
    .map((c) => CHIFFRES_EXPOSANT[c] ?? c)
    .join("");
  return `C${indice}${exposant}`;
}

// ============================================================================
// Famille A — Répartition en groupes de tailles données (multinomiale).
// ============================================================================

export function consigneGeneraleA(): string {
  return "n personnes sont réparties en k équipes nommées, de tailles fixées et toutes différentes. Détermine, par la formule multinomiale, le nombre de répartitions possibles.";
}

export function blocDonneesA(e: ExerciceDenombCombA): string[] {
  const lignesGroupes = e.noms.map((nom, i) => `\\text{${nom} : }${e.tailles[i]}\\text{ personnes}`);
  return [`n=${e.n}\\text{ personnes}`, `k=${e.k}\\text{ équipes}`, ...lignesGroupes];
}

export function consigneEcranA(phase: PhaseDenombrementCombine): string {
  if (phase === "aEcran1") return "Pose la formule multinomiale (NON calculée). Utilise ! pour une factorielle (ex : 10!/(3!*3!*4!)).";
  return "Calcule la valeur du résultat à partir de la formule CONFIRMÉE.";
}

export function etatActuelA(e: ExerciceDenombCombA, phase: PhaseDenombrementCombine): string[] | null {
  if (phase !== "aEcran2") return null;
  const denominateur = e.tailles.map((t) => `${t}!`).join("\\cdot\\,");
  return [`\\text{Formule confirmée :}`, `\\dfrac{${e.n}!}{${denominateur}}`];
}

export function champsA(phase: PhaseDenombrementCombine): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("Formule =", "ex : 10!/(3!*3!*4!)")];
  return [champTexte("Résultat =", "ex : 4200")];
}

export function niveauAideMaxA(phase: PhaseDenombrementCombine): number {
  return phase === "aEcran1" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Répartir n objets en groupes de tailles fixées (sans ordre à l'intérieur de chaque groupe) suit la formule multinomiale : n! divisé par le produit des factorielles de chaque taille.", latex: null };
}

export function aideNiveau2A(e: ExerciceDenombCombA): AideAvecLatex {
  return { texte: "Numérateur déjà posé (dénominateur non assemblé) :", latex: `${e.n}!` };
}

// ============================================================================
// Famille B — Sélections combinées indépendantes.
// ============================================================================

export const LIBELLE_STRUCTURE_B: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "Rôle distingué + reste en combinaison : n×Cₙ₋₁ᵏ",
  // poolsSepares/memeContrainte : notation NON convertie en Unicode (indices composés n1/k1/n2/k2,
  // équivalent LaTeX C_{n_1}^{k_1} — un sous-indice DANS le sous-indice, impossible à représenter
  // fidèlement avec les caractères Unicode indice/exposant à un seul niveau) — voir
  // `LIBELLE_STRUCTURE_B_COURT` juste en dessous pour la version KaTeX réelle, correctement rendue.
  poolsSepares: "Pools séparés indépendants (ET) : C(n1,k1)×C(n2,k2)",
  memeContrainte: "Même contrainte sur 2 groupes (OU) : C(n1,k)+C(n2,k)",
  partitionComplementaire: "Partition en 2 groupes complémentaires : Cₙᵏ",
};

/** Version COURTE (juste la forme algébrique, sans le nom descriptif) — utilisée dans les fragments
 * KaTeX `etatActuel`/`formatReponseAttenduePhaseLatex` (contrainte de largeur `.equation-box`, voir
 * en-tête de fichier), jamais dans les boutons QCM (`champsB`, qui utilisent la version complète —
 * un bouton peut être plus long, pas de contrainte `nowrap` KaTeX). */
const LIBELLE_STRUCTURE_B_COURT: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "n\\times C_{n-1}^{k}",
  poolsSepares: "C_{n_1}^{k_1}\\times C_{n_2}^{k_2}",
  memeContrainte: "C_{n_1}^{k}+C_{n_2}^{k}",
  partitionComplementaire: "C_n^{k}",
};

export function consigneGeneraleB(): string {
  return "Identifie la structure de la sélection (rôle distingué, pools séparés, contrainte sur le même groupe, ou partition complémentaire), pose la formule, puis calcule le résultat.";
}

export function blocDonneesB(e: ExerciceDenombCombB): string[] {
  switch (e.sousType) {
    case "roleDistingue":
      return [`n=${e.n}\\text{ personnes}`, `\\text{1 rôle distingué, puis }k=${e.k}\\text{ personnes}`, `\\text{pour un rôle commun}`];
    case "poolsSepares":
      return [`\\text{Groupe 1 : }n_1=${e.n1}\\text{, choisir }k_1=${e.k1}`, `\\text{Groupe 2 : }n_2=${e.n2}\\text{, choisir }k_2=${e.k2}`, `\\text{(les 2 choix sont indépendants)}`];
    case "memeContrainte":
      return [`\\text{Groupe 1 : }n_1=${e.n1}\\text{ personnes}`, `\\text{Groupe 2 : }n_2=${e.n2}\\text{ personnes}`, `\\text{Choisir }k=${e.k}\\text{ personnes,}`, `\\text{TOUTES du même groupe}`];
    case "partitionComplementaire":
      return [`n=${e.n}\\text{ éléments}`, `\\text{Choisir un sous-groupe de taille }k=${e.k}`];
  }
}

export function consigneEcranB(phase: PhaseDenombrementCombine): string {
  if (phase === "bEcran1") return "Les 2 choix sont-ils liés par un ET (indépendants → multiplication) ou par un OU exclusif (l'un ou l'autre → addition) ? Choisis la structure appropriée.";
  return "Calcule le résultat à partir de la structure CONFIRMÉE.";
}

export function etatActuelB(e: ExerciceDenombCombB, phase: PhaseDenombrementCombine): string[] | null {
  if (phase !== "bEcran2") return null;
  return [`\\text{Structure confirmée :}`, LIBELLE_STRUCTURE_B_COURT[e.sousType]];
}

export function champsB(phase: PhaseDenombrementCombine): ChampDef[] {
  if (phase === "bEcran1") {
    return [
      {
        type: "choix",
        label: "Structure =",
        options: (["roleDistingue", "poolsSepares", "memeContrainte", "partitionComplementaire"] as const).map((v) => ({ valeur: v, label: LIBELLE_STRUCTURE_B[v] })),
      },
    ];
  }
  return [champTexte("Résultat =", "ex : 120")];
}

export function niveauAideMaxB(phase: PhaseDenombrementCombine): number {
  return phase === "bEcran1" ? 2 : 0;
}

export function aideNiveau1B(phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "Distingue si les 2 choix sont liés par un ET (les deux se produisent ensemble → multiplication) ou par un OU exclusif (l'un OU l'autre, jamais les deux → addition).", latex: null };
}

const AIDE_2_STRUCTURE_B: Record<SousTypeDenombCombB, string> = {
  roleDistingue: "Choix successif : 1 rôle précis, PUIS un groupe pour un rôle commun — un ET (multiplication), formule précise non posée.",
  poolsSepares: "Les 2 choix sont indépendants l'un de l'autre — un ET (multiplication de 2 termes), formule précise non posée.",
  memeContrainte: "La contrainte porte sur un OU exclusif entre 2 groupes — une addition de 2 termes, formule précise non posée.",
  partitionComplementaire: "Choisir le 1ᵉʳ sous-groupe détermine automatiquement le second — une seule combinaison suffit, formule précise non posée.",
};

export function aideNiveau2B(e: ExerciceDenombCombB, phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: AIDE_2_STRUCTURE_B[e.sousType], latex: null };
}

// ============================================================================
// Famille C — Combinaisons avec répétition et distinguabilité.
// ============================================================================

const LIBELLE_ATTRIBUTION_C = { carre: "n² (résultats ORDONNÉS)", combinaisonRep: "Cₙ₊₁² (résultats NON ORDONNÉS, avec répétition)" };

export function consigneGeneraleC(): string {
  return "Détermine, selon le contexte, le nombre de résultats distincts (répétition et/ou distinguabilité des objets).";
}

export function blocDonneesC(e: ExerciceDenombCombC): string[] {
  if (e.sousType === "repetition") {
    return [`n=${e.n}\\text{ valeurs possibles}`, `\\text{Choisir 2 valeurs, répétition autorisée,}`, `\\text{ordre indifférent}`];
  }
  return [`n=${e.n}\\text{ faces/valeurs possibles}`, `\\text{2 objets, chacun donnant 1 valeur parmi les }n`];
}

export function consigneEcranC(e: ExerciceDenombCombC, phase: PhaseDenombrementCombine): string {
  if (e.sousType === "repetition") {
    if (phase === "cEcran1") return "Pose la formule (NON calculée). Utilise C(a,b) pour un coefficient binomial si besoin (ex : C(n,2)+n).";
    return "Calcule le résultat à partir de la formule CONFIRMÉE.";
  }
  if (phase === "cEcran1") return "Le contexte précise si les 2 objets peuvent être distingués l'un de l'autre (ex : couleurs différentes) ou non (ex : objets identiques). Attribue la bonne formule à chaque cas.";
  return "Calcule les 2 valeurs correspondantes, à partir de l'attribution CONFIRMÉE.";
}

export function etatActuelC(e: ExerciceDenombCombC, phase: PhaseDenombrementCombine): string[] | null {
  if (e.sousType === "comparaison" && phase === "cEcran2") {
    return [`\\text{Discernable}\\to n^2\\text{ (confirmé)}`, `\\text{Indiscernable}\\to C_{n+1}^{2}\\text{ (confirmé)}`];
  }
  return null;
}

export function champsC(e: ExerciceDenombCombC, phase: PhaseDenombrementCombine): ChampDef[] {
  if (e.sousType === "repetition") {
    if (phase === "cEcran1") return [champTexte("Formule =", "ex : C(n,2)+n")];
    return [champTexte("Résultat =", "ex : 28")];
  }
  if (phase === "cEcran1") {
    const options = (["carre", "combinaisonRep"] as const).map((v) => ({ valeur: v, label: LIBELLE_ATTRIBUTION_C[v] }));
    return [
      { type: "choix", label: "Discernables (ex : couleurs différentes) =", options },
      { type: "choix", label: "Indiscernables (ex : objets identiques) =", options },
    ];
  }
  return [champTexte("Résultat discernable =", "ex : 36"), champTexte("Résultat indiscernable =", "ex : 21")];
}

export function niveauAideMaxC(phase: PhaseDenombrementCombine): number {
  return phase === "cEcran1" ? 2 : 0;
}

export function aideNiveau1C(e: ExerciceDenombCombC, phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  if (e.sousType === "repetition") {
    return { texte: "Choisir 2 valeurs avec répétition et sans ordre revient à choisir 2 éléments parmi n+1 (bijection classique), ou à séparer le cas des 2 valeurs identiques (n façons) de celui de 2 valeurs distinctes.", latex: null };
  }
  return { texte: "2 objets de couleurs différentes peuvent être distingués (discernables) ; 2 objets identiques, une fois le résultat obtenu, ne peuvent plus être distingués l'un de l'autre (indiscernables).", latex: null };
}

export function aideNiveau2C(e: ExerciceDenombCombC, phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  if (e.sousType === "repetition") {
    return { texte: "Cas des 2 valeurs identiques déjà compté (l'autre cas reste à déterminer) :", latex: `${e.n}` };
  }
  return { texte: "Distinguer les 2 objets (discernables) donne des résultats ORDONNÉS — attribution précise non donnée.", latex: null };
}

// ============================================================================
// Famille D — Sélections avec restrictions.
// ============================================================================

export const LIBELLE_CONTRAINTE_D: Record<TypeContrainteD, string> = {
  exclusion: "Exclusion mutuelle (ne peuvent être ensemble) : Cₙᵏ − Cₙ₋₂ᵏ⁻²",
  indissociable: "Couple indissociable (ensemble ou pas du tout) : Cₙ₋₂ᵏ⁻² + Cₙ₋₂ᵏ",
};

/** Version COURTE — mêmes raisons que `LIBELLE_STRUCTURE_B_COURT` ci-dessus. */
const LIBELLE_CONTRAINTE_D_COURT: Record<TypeContrainteD, string> = {
  exclusion: "C_n^{k}-C_{n-2}^{k-2}",
  indissociable: "C_{n-2}^{k-2}+C_{n-2}^{k}",
};

export function consigneGeneraleD(): string {
  return "n éléments, dont 2 éléments précis notés X et Y, soumis à une contrainte sur leur présence conjointe dans une sélection de k éléments. Identifie la contrainte, calcule chaque terme, puis combine-les.";
}

export function blocDonneesD(e: ExerciceDenombCombD): string[] {
  const base = [`n=${e.n}\\text{ éléments, dont X et Y}`, `\\text{Choisir }k=${e.k}\\text{ éléments au total}`];
  if (e.sousType === "coupleIndissociable") {
    return [...base, `\\text{X et Y : ENSEMBLE ou PAS DU TOUT}`];
  }
  if (e.sousType === "contrainteRiche") {
    return [`\\text{Catégorie A : }n_A=${e.nA}\\text{ (contient X et Y)}`, `\\text{Catégorie B : }n_B=${e.nB}`, `\\text{Choisir }k=${e.k}\\text{ éléments au total}`, `\\text{X et Y NE PEUVENT PAS être ensemble}`];
  }
  return [...base, `\\text{X et Y NE PEUVENT PAS être ensemble}`];
}

export function consigneEcranD(phase: PhaseDenombrementCombine): string {
  if (phase === "dEcran1") return "La contrainte empêche-t-elle X et Y d'être ensemble, ou les oblige-t-elle à être ensemble ? Choisis le type de contrainte.";
  if (phase === "dEcran2") return "Calcule séparément les 2 termes nécessaires, à partir du type de contrainte CONFIRMÉ.";
  return "Combine les 2 termes CONFIRMÉS (soustraction pour une exclusion, addition pour un couple indissociable) pour obtenir le résultat final.";
}

export function etatActuelD(e: ExerciceDenombCombD, phase: PhaseDenombrementCombine): string[] | null {
  if (phase === "dEcran2") return [`\\text{Type confirmé :}`, LIBELLE_CONTRAINTE_D_COURT[e.typeContrainte]];
  if (phase === "dEcran3")
    return [
      `\\text{Type confirmé :}`,
      LIBELLE_CONTRAINTE_D_COURT[e.typeContrainte],
      `\\text{Terme 1 = }${e.terme1}\\text{ (confirmé)}`,
      `\\text{Terme 2 = }${e.terme2}\\text{ (confirmé)}`,
    ];
  return null;
}

export function champsD(e: ExerciceDenombCombD, phase: PhaseDenombrementCombine): ChampDef[] {
  if (phase === "dEcran1") {
    return [
      {
        type: "choix",
        label: "Type de contrainte =",
        options: (["exclusion", "indissociable"] as const).map((v) => ({ valeur: v, label: LIBELLE_CONTRAINTE_D[v] })),
      },
    ];
  }
  if (phase === "dEcran2") {
    if (e.typeContrainte === "exclusion") {
      return [champTexte(`${labelCombinaison(e.n, e.k)} =`, "ex : 15504"), champTexte(`${labelCombinaison(e.n - 2, e.k - 2)} =`, "ex : 816")];
    }
    return [champTexte(`${labelCombinaison(e.n - 2, e.k - 2)} =`, "ex : 816"), champTexte(`${labelCombinaison(e.n - 2, e.k)} =`, "ex : 8568")];
  }
  return [champTexte("Résultat final =", "ex : 14688")];
}

export function niveauAideMaxD(phase: PhaseDenombrementCombine): number {
  return phase === "dEcran1" ? 2 : 0;
}

export function aideNiveau1D(phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: "« Ne peuvent être ensemble » se traite par soustraction (total moins le cas où les 2 sont présents) ; « vont toujours ensemble » se traite par addition de 2 cas complémentaires.", latex: null };
}

export function aideNiveau2D(e: ExerciceDenombCombD, phase: PhaseDenombrementCombine): AideAvecLatex {
  if (phase !== "dEcran1") return AUCUNE_AIDE;
  return { texte: `Type de contrainte identifié : ${e.typeContrainte === "exclusion" ? "exclusion mutuelle" : "couple indissociable"} — expression de comptage précise non posée.`, latex: null };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceDenombrementCombine): string {
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

export function blocDonnees(exercice: ExerciceDenombrementCombine): string[] {
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

export function consigneEcran(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "D":
      return consigneEcranD(phase);
  }
}

export function etatActuel(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): string[] | null {
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

export function champsEcran(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(exercice, phase);
    case "D":
      return champsD(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): number {
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

export function aideNiveau1(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau1A();
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(exercice, phase);
    case "D":
      return aideNiveau1D(phase);
  }
}

export function aideNiveau2(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
    case "D":
      return aideNiveau2D(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseDenombrementCombine, string> = {
  aEcran1: "Étape 1 (formule multinomiale)",
  aEcran2: "Étape 2 (calcul)",
  bEcran1: "Étape 1 (structure identifiée)",
  bEcran2: "Étape 2 (calcul)",
  cEcran1: "Étape 1 (formule / attribution)",
  cEcran2: "Étape 2 (calcul)",
  dEcran1: "Étape 1 (type de contrainte)",
  dEcran2: "Étape 2 (termes séparés)",
  dEcran3: "Étape 3 (combinaison finale)",
};

export const LIBELLE_FAMILLE: Record<ExerciceDenombrementCombine["famille"], string> = {
  A: "A — Répartition en groupes de tailles données",
  B: "B — Sélections combinées indépendantes",
  C: "C — Combinaisons avec répétition et distinguabilité",
  D: "D — Sélections avec restrictions",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceDenombrementCombine, phase: PhaseDenombrementCombine): string[] {
  if (exercice.famille === "A") {
    return [`${exercice.resultat}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [LIBELLE_STRUCTURE_B_COURT[exercice.sousType]];
    return [`${exercice.resultat}`];
  }
  if (exercice.famille === "C") {
    if (exercice.sousType === "repetition") return [`${exercice.resultat}`];
    if (phase === "cEcran1") return [`\\text{Discernable : }n^2`, `\\text{Indiscernable : }C_{n+1}^{2}`];
    return [`${exercice.resultatDiscernable},\\,${exercice.resultatIndiscernable}`];
  }
  // famille D
  if (phase === "dEcran1") return [LIBELLE_CONTRAINTE_D_COURT[exercice.typeContrainte]];
  if (phase === "dEcran2") return [`${exercice.terme1},\\,${exercice.terme2}`];
  return [`${exercice.resultatFinal}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 2 pour A/B/C, 3 pour D). */
export function calculerTotalPointsDenombrementCombine(resultat: ResultatExerciceDenombrementCombine): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
