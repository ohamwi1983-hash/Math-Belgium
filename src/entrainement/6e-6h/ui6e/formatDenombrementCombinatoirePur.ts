import type {
  DecompositionSommeDes,
  ExerciceDenombCombPurA,
  ExerciceDenombCombPurB,
  ExerciceDenombCombPurC,
  ExerciceDenombCombPurD,
  ExerciceDenombrementCombinatoirePur,
  SousTypeDenombCombPurA,
} from "../core6e/denombrementCombinatoirePur.types";
import type { PhaseDenombrementCombinatoirePur, ResultatExerciceDenombrementCombinatoirePur } from "../moteur6e/typesDenombrementCombinatoirePur";
import { phasesPourExercice } from "../moteur6e/typesDenombrementCombinatoirePur";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen46`. Dispatch sur
 * `exercice.famille` PUIS `phase` (PUIS `sousType` pour la famille A uniquement), mirroir
 * `formatDenombrementFondamental.ts` (6gen43) / `formatDenombrementCombine.ts` (6gen44), jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** (bug déjà
 * rencontré et corrigé sur plusieurs générateurs 6e, documenté par CLAUDE.md) — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * **Vigilance débordement horizontal** (bug 6gen43) — jamais une phrase française de plus d'une
 * cinquantaine de caractères dans un seul fragment `\text{...}` : toujours répartie sur plusieurs
 * entrées du tableau `string[]`. Couverture de régression :
 * `formatDenombrementCombinatoirePur.test.ts`.
 *
 * **Famille D, écran 1 — cas particulier** : cet écran est rendu par un composant DÉDIÉ
 * (`EtapeListeDecompositionsDenombrementCombinatoirePur.tsx`, 2 listes add-as-needed simultanées,
 * jamais géré par `champsEcran`/le composant générique `EtapeChampsDenombrementCombinatoirePur`) —
 * `champsEcran`/`niveauAideMaxEcran`/`aideNiveau1`/`aideNiveau2` ne sont donc jamais appelés pour
 * `dEcran1` par `App6gen46.tsx` (qui branche vers le composant dédié AVANT), mais restent définis
 * ici pour rester total sur toutes les phases (cohérence de la signature du dispatcher).
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

// ============================================================================
// Famille A — Dénombrement au poker.
// ============================================================================

// Fragments COURTS (≲25 caractères chacun) — un fragment `\text{...}` trop long DÉBORDE de
// `.equation-box` en mobile (KaTeX ne fait jamais de retour à la ligne à l'intérieur d'un même
// fragment, contrairement à un `<p>` HTML) : bug de débordement horizontal déjà rencontré et
// documenté (`docs/historique-6e.md`), ici trouvé et corrigé pendant la vérification Playwright de
// CE générateur — voir la section dédiée du devlog.
const LIBELLE_MAIN_A: Record<SousTypeDenombCombPurA, string[]> = {
  carre: ["\\text{Main : un CARRÉ}", "\\text{(4 cartes de même hauteur)}", "\\text{+ 1 autre carte}"],
  brelan: ["\\text{Main : un BRELAN}", "\\text{(3 cartes de même hauteur)}", "\\text{+ 2 cartes d'hauteurs}", "\\text{différentes entre elles}", "\\text{et du brelan}"],
  paire: ["\\text{Main : UNE SEULE PAIRE}", "\\text{(2 cartes de même hauteur)}", "\\text{+ 3 cartes d'hauteurs}", "\\text{toutes différentes entre elles}", "\\text{et de la paire}"],
  deuxPaires: ["\\text{Main : DEUX PAIRES}", "\\text{d'hauteurs différentes}", "\\text{+ 1 carte d'une 3ᵉ hauteur}"],
};

const CONSIGNE_ECRAN1_A: Record<SousTypeDenombCombPurA, string> = {
  carre: "Combien de façons de choisir la hauteur du carré ? (les 4 couleurs sont alors automatiquement toutes utilisées, une seule façon).",
  brelan: "Combien de façons de choisir la hauteur du brelan ET les 3 couleurs (parmi 4) qui le composent ?",
  paire: "Combien de façons de choisir la hauteur de la paire ET les 2 couleurs (parmi 4) qui la composent ?",
  deuxPaires: "Combien de façons de choisir les 2 hauteurs des paires (parmi 8) ET les 2 couleurs de CHAQUE paire (parmi 4) ?",
};

/** Nombre de hauteurs consommées par la combinaison spéciale de l'écran 1 — 1 pour carré/brelan/
 * paire, 2 pour deuxPaires. Redondant avec `generateurs6e/denombrementCombinatoirePur/familleA.ts::
 * hauteursUtiliseesEtape1`, jamais importé (ui6e/ pourrait, mais cette valeur ne dépend que du
 * `sousType` déjà présent dans l'exercice — autant rester local, cohérent avec le style
 * "dispatch pur" du reste de ce fichier). */
function hauteursUtiliseesEtape1(sousType: SousTypeDenombCombPurA): number {
  return sousType === "deuxPaires" ? 2 : 1;
}

const NB_HAUTEURS_A = 8;

export function consigneGeneraleA(): string {
  return "Jeu de 32 cartes (8 hauteurs × 4 couleurs), main de 5 cartes tirée au hasard. Détermine, étape par étape, le nombre de mains possibles pour la combinaison demandée.";
}

export function blocDonneesA(e: ExerciceDenombCombPurA): string[] {
  return ["\\text{Jeu de 32 cartes}", "8\\text{ hauteurs}\\times 4\\text{ couleurs}", ...LIBELLE_MAIN_A[e.sousType]];
}

export function consigneEcranA(e: ExerciceDenombCombPurA, phase: PhaseDenombrementCombinatoirePur): string {
  if (phase === "aEcran1") return CONSIGNE_ECRAN1_A[e.sousType];
  if (phase === "aEcran2") return "Combien de façons de compléter la main avec les cartes restantes ? Les hauteurs déjà utilisées à l'étape 1 ne sont plus disponibles.";
  return "Multiplie les 2 étapes CONFIRMÉES pour obtenir le nombre total de mains possibles.";
}

export function etatActuelA(e: ExerciceDenombCombPurA, phase: PhaseDenombrementCombinatoirePur): string[] | null {
  if (phase === "aEcran2") return ["\\text{Étape 1 confirmée :}", `${e.etape1}\\text{ façons}`];
  if (phase === "aEcran3") return ["\\text{Étape 1 confirmée :}", `${e.etape1}\\text{ façons}`, "\\text{Étape 2 confirmée :}", `${e.etape2}\\text{ façons}`];
  return null;
}

export function champsA(phase: PhaseDenombrementCombinatoirePur): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("Nombre de façons (étape 1) =", "ex : 8")];
  if (phase === "aEcran2") return [champTexte("Nombre de façons pour les cartes restantes =", "ex : 28")];
  return [champTexte("Résultat final =", "ex : 224")];
}

export function niveauAideMaxA(phase: PhaseDenombrementCombinatoirePur): number {
  return phase === "aEcran2" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Les hauteurs déjà utilisées pour la combinaison spéciale (étape 1) ne sont plus disponibles pour choisir les cartes restantes — le nombre de hauteurs à considérer diminue.", latex: null };
}

export function aideNiveau2A(e: ExerciceDenombCombPurA): AideAvecLatex {
  const hauteursRestantes = NB_HAUTEURS_A - hauteursUtiliseesEtape1(e.sousType);
  return { texte: "Nombre de hauteurs encore disponibles pour les cartes restantes (le choix précis des couleurs reste à faire) :", latex: `${hauteursRestantes}` };
}

// ============================================================================
// Famille B — Répartition en groupes de tailles données (multinomiale).
// ============================================================================

export function consigneGeneraleB(): string {
  return "n objets numérotés sont répartis dans k boîtes numérotées, chaque boîte recevant un nombre d'objets fixé à l'avance (le total imposé). Détermine, par la formule multinomiale, le nombre de répartitions possibles.";
}

export function blocDonneesB(e: ExerciceDenombCombPurB): string[] {
  const lignesBoites = e.noms.map((nom, i) => `\\text{Boîte ${nom} : }${e.tailles[i]}\\text{ objets}`);
  return [`n=${e.n}\\text{ objets}`, `k=${e.k}\\text{ boîtes}`, ...lignesBoites];
}

export function consigneEcranB(phase: PhaseDenombrementCombinatoirePur): string {
  if (phase === "bEcran1") return "Pose la formule multinomiale (NON calculée). Utilise ! pour une factorielle (ex : 10!/(3!*3!*4!)).";
  return "Calcule la valeur du résultat à partir de la formule CONFIRMÉE.";
}

export function etatActuelB(e: ExerciceDenombCombPurB, phase: PhaseDenombrementCombinatoirePur): string[] | null {
  if (phase !== "bEcran2") return null;
  const denominateur = e.tailles.map((t) => `${t}!`).join("\\cdot\\,");
  return [`\\text{Formule confirmée :}`, `\\dfrac{${e.n}!}{${denominateur}}`];
}

export function champsB(phase: PhaseDenombrementCombinatoirePur): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("Formule =", "ex : 20!/(9!*11!)")];
  return [champTexte("Résultat =", "ex : 167960")];
}

export function niveauAideMaxB(phase: PhaseDenombrementCombinatoirePur): number {
  return phase === "bEcran1" ? 2 : 0;
}

export function aideNiveau1B(): AideAvecLatex {
  return { texte: "Répartir n objets en groupes de tailles fixées (sans ordre à l'intérieur de chaque groupe) suit la formule multinomiale : n! divisé par le produit des factorielles de chaque taille.", latex: null };
}

export function aideNiveau2B(e: ExerciceDenombCombPurB): AideAvecLatex {
  return { texte: "Numérateur déjà posé (dénominateur non assemblé) :", latex: `${e.n}!` };
}

// ============================================================================
// Famille C — Dénombrement avec répétition (n^k).
// ============================================================================

export function consigneGeneraleC(): string {
  return "Un dispositif comporte k éléments indépendants, chacun réglable sur n positions possibles. Détermine le nombre total d'affichages (configurations) possibles du dispositif.";
}

export function blocDonneesC(e: ExerciceDenombCombPurC): string[] {
  return [`n=${e.n}\\text{ positions par élément}`, `k=${e.k}\\text{ éléments indépendants}`];
}

export function consigneEcranC(): string {
  return "Calcule le nombre total de configurations possibles du dispositif.";
}

export function etatActuelC(): string[] | null {
  return null;
}

export function champsC(): ChampDef[] {
  return [champTexte("Résultat =", "ex : 16")];
}

export function niveauAideMaxC(): number {
  return 0;
}

export function aideNiveau1C(): AideAvecLatex {
  return AUCUNE_AIDE;
}

export function aideNiveau2C(): AideAvecLatex {
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille D — Comptage de triplets ordonnés pour une somme donnée.
// ============================================================================

export function consigneGeneraleD(): string {
  return "n dés à f faces sont lancés. Compare le nombre de triplets ORDONNÉS distincts (résultat des 3 dés, dans l'ordre du lancer) menant à chacune de 2 sommes cibles.";
}

export function blocDonneesD(e: ExerciceDenombCombPurD): string[] {
  return [`n=${e.n}\\text{ dés}`, `f=${e.f}\\text{ faces}`, `S_1=${e.s1}`, `S_2=${e.s2}`];
}

export function consigneEcranD(phase: PhaseDenombrementCombinatoirePur): string {
  if (phase === "dEcran1") return "Pour chaque somme cible, liste TOUTES les décompositions possibles en 3 entiers entre 1 et 6 (sans tenir compte de l'ordre).";
  if (phase === "dEcran2") return "Pour chaque décomposition CONFIRMÉE, indique son nombre d'arrangements ordonnés distincts (dans l'ordre où elles sont listées : décompositions de S₁ puis de S₂).";
  return "Somme les arrangements CONFIRMÉS pour chaque somme cible, puis compare les deux totaux.";
}

/** Formate CHAQUE décomposition sur sa PROPRE ligne (jamais une liste jointe sur une seule ligne
 * `\text{...}` — jusqu'à 6 décompositions par somme, un fragment joint dépasserait largement le
 * seuil observé de débordement horizontal en mobile sur `.equation-box`/`.etat-actuel-box`, voir
 * en-tête de fichier et `docs/historique-6e.md`). */
function formatListeDecompositionsMultiligne(prefixe: string, decompositions: DecompositionSommeDes[]): string[] {
  return [prefixe, ...decompositions.map((d) => `(${d.valeurs.join(",")})`)];
}

export function etatActuelD(e: ExerciceDenombCombPurD, phase: PhaseDenombrementCombinatoirePur): string[] | null {
  if (phase === "dEcran2") {
    return [...formatListeDecompositionsMultiligne("\\text{Décompositions }S_1\\text{ confirmées :}", e.decompositionsS1), ...formatListeDecompositionsMultiligne("\\text{Décompositions }S_2\\text{ confirmées :}", e.decompositionsS2)];
  }
  if (phase === "dEcran3") {
    return [
      ...formatListeDecompositionsMultiligne("\\text{Décompositions }S_1\\text{ confirmées :}", e.decompositionsS1),
      ...formatListeDecompositionsMultiligne("\\text{Décompositions }S_2\\text{ confirmées :}", e.decompositionsS2),
      "\\text{Arrangements }S_1\\text{ confirmés :}",
      e.decompositionsS1.map((d) => d.arrangements).join(",\\,"),
      "\\text{Arrangements }S_2\\text{ confirmés :}",
      e.decompositionsS2.map((d) => d.arrangements).join(",\\,"),
    ];
  }
  return null;
}

/** Jamais appelée pour `dEcran1` (composant dédié) — voir en-tête de fichier. */
export function champsD(e: ExerciceDenombCombPurD, phase: PhaseDenombrementCombinatoirePur): ChampDef[] {
  if (phase === "dEcran2") {
    const champsS1 = e.decompositionsS1.map((d) => champTexte(`(${d.valeurs.join(",")}) — arrangements =`, "ex : 6"));
    const champsS2 = e.decompositionsS2.map((d) => champTexte(`(${d.valeurs.join(",")}) — arrangements =`, "ex : 6"));
    return [...champsS1, ...champsS2];
  }
  if (phase === "dEcran3") {
    return [
      champTexte(`Total pour S_1=${e.s1} =`, "ex : 25"),
      champTexte(`Total pour S_2=${e.s2} =`, "ex : 27"),
      {
        type: "choix",
        label: "Quelle somme obtient le plus de triplets ordonnés ? =",
        options: [
          { valeur: "s1", label: `S_1=${e.s1} plus fréquente` },
          { valeur: "s2", label: `S_2=${e.s2} plus fréquente` },
          { valeur: "egal", label: "Également fréquentes" },
        ],
      },
    ];
  }
  return [];
}

export function niveauAideMaxD(phase: PhaseDenombrementCombinatoirePur): number {
  return phase === "dEcran2" ? 2 : 0;
}

export function aideNiveau1D(): AideAvecLatex {
  return { texte: "Le nombre d'arrangements ordonnés d'un triplet dépend du nombre de valeurs DISTINCTES qu'il contient : 3 valeurs différentes → 6 arrangements ; exactement une paire → 3 ; les 3 valeurs identiques → 1.", latex: null };
}

export function aideNiveau2D(e: ExerciceDenombCombPurD): AideAvecLatex {
  const exemple = e.decompositionsS1[0];
  return { texte: `Exemple déjà traité — décomposition (${exemple.valeurs.join(",")}) : ${exemple.arrangements} arrangement(s) (les autres décompositions restent à déterminer).`, latex: null };
}

// Labels dédiés à l'écran 1 de la famille D (composant `EtapeListeDecompositionsDenombrementCombinatoirePur.tsx`).

export function placeholderDecompositionD(): string {
  return "ex : 1,2,6";
}

export function labelListeDecompositionD(sommeCible: number): string {
  return `Décompositions pour la somme S=${sommeCible}`;
}

export function labelAjoutDecompositionD(): string {
  return "+ Ajouter une décomposition";
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceDenombrementCombinatoirePur): string {
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

export function blocDonnees(exercice: ExerciceDenombrementCombinatoirePur): string[] {
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

export function consigneEcran(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC();
    case "D":
      return consigneEcranD(phase);
  }
}

export function etatActuel(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC();
    case "D":
      return etatActuelD(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC();
    case "D":
      return champsD(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC();
    case "D":
      return niveauAideMaxD(phase);
  }
}

export function aideNiveau1(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau1A();
    case "B":
      return niveauAideMaxB(phase) === 0 ? AUCUNE_AIDE : aideNiveau1B();
    case "C":
      return aideNiveau1C();
    case "D":
      return niveauAideMaxD(phase) === 0 ? AUCUNE_AIDE : aideNiveau1D();
  }
}

export function aideNiveau2(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase) === 0 ? AUCUNE_AIDE : aideNiveau2A(exercice);
    case "B":
      return niveauAideMaxB(phase) === 0 ? AUCUNE_AIDE : aideNiveau2B(exercice);
    case "C":
      return aideNiveau2C();
    case "D":
      return niveauAideMaxD(phase) === 0 ? AUCUNE_AIDE : aideNiveau2D(exercice);
  }
}

export const LIBELLE_PHASE: Record<PhaseDenombrementCombinatoirePur, string> = {
  aEcran1: "Étape 1 (combinaison spéciale)",
  aEcran2: "Étape 2 (cartes restantes)",
  aEcran3: "Étape 3 (résultat final)",
  bEcran1: "Étape 1 (formule multinomiale)",
  bEcran2: "Étape 2 (calcul)",
  cEcran1: "Étape unique (calcul direct)",
  dEcran1: "Étape 1 (décompositions)",
  dEcran2: "Étape 2 (arrangements par décomposition)",
  dEcran3: "Étape 3 (totaux et comparaison)",
};

export const LIBELLE_FAMILLE: Record<ExerciceDenombrementCombinatoirePur["famille"], string> = {
  A: "A — Dénombrement au poker",
  B: "B — Répartition en groupes de tailles données",
  C: "C — Dénombrement avec répétition",
  D: "D — Triplets ordonnés pour une somme donnée",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceDenombrementCombinatoirePur, phase: PhaseDenombrementCombinatoirePur): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`${exercice.etape1}`];
    if (phase === "aEcran2") return [`${exercice.etape2}`];
    return [`${exercice.resultatFinal}`];
  }
  if (exercice.famille === "B") {
    return [`${exercice.resultat}`];
  }
  if (exercice.famille === "C") {
    return [`${exercice.resultat}`];
  }
  // famille D
  if (phase === "dEcran1") {
    return [...formatListeDecompositionsMultiligne("S_1\\text{ :}", exercice.decompositionsS1), ...formatListeDecompositionsMultiligne("S_2\\text{ :}", exercice.decompositionsS2)];
  }
  if (phase === "dEcran2") {
    return ["\\text{Arrangements }S_1\\text{ :}", exercice.decompositionsS1.map((d) => d.arrangements).join(",\\,"), "\\text{Arrangements }S_2\\text{ :}", exercice.decompositionsS2.map((d) => d.arrangements).join(",\\,")];
  }
  const libelleComparaison = exercice.comparaison === "s1" ? `S_1=${exercice.s1}\\text{ plus fréquente}` : exercice.comparaison === "s2" ? `S_2=${exercice.s2}\\text{ plus fréquente}` : "\\text{Également fréquentes}";
  return [`S_1=${exercice.totalS1}\\text{, }S_2=${exercice.totalS2}`, libelleComparaison];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsDenombrementCombinatoirePur(resultat: ResultatExerciceDenombrementCombinatoirePur): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
