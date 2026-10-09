import type { ExerciceLoiPoisson, ExerciceLoiPoissonA, ExerciceLoiPoissonB, FamilleLoiPoisson, StrategiePoissonB } from "../core6e/loiPoisson.types";
import type { PhaseLoiPoisson, ResultatExerciceLoiPoisson } from "../moteur6e/typesLoiPoisson";
import { phasesPourExercice } from "../moteur6e/typesLoiPoisson";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen53`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatLoiBinomiale.ts` (6gen50), jamais importé par un
 * autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **PREMIÈRE apparition de la loi de Poisson sur la plateforme** — la formule P(X=k)=e^(−λ)·λᵏ/k!
 * est introduite explicitement : en PROSE dans la consigne de l'écran de calcul famille A (aEcran3,
 * qui n'a pas d'aide prévue par la spec), et en LaTeX dans l'aide niveau 1 des écrans de calcul
 * famille B (aide toujours prévue là, par la spec).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths ;
 * `%` toujours échappé `\%` (piège documenté 6gen50 — jamais utilisé ici, aucun pourcentage dans ce
 * générateur, uniquement des comptages/taux). Couverture de régression :
 * `formatLoiPoisson.test.ts`, scan sur 300 tirages réels.
 *
 * **Pas de nombre énorme illisible dans une aide** — pour `strategie==="termeUnique"` (λ pouvant
 * atteindre 75, spec), l'aide niveau 2 révèle `e^{-λ}` (toujours dans (0,1], sûr à afficher) plutôt
 * que `λ^k`/`k!` séparément (peuvent atteindre 10^100+, illisibles et inutiles — voir
 * `generateurs6e/loiPoisson/poisson.ts` pour la raison de fond).
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
  /** `true` pour un label réduit à une lettre/symbole de variable (ex. "λ =") — évite que le
   * `text-transform: uppercase` global de `.field-label` transforme "λ" en "Λ" (majuscule grecque
   * distincte), mirroir `.field-label-minuscule` déjà établi pour "n"/"p" (6gen50). */
  minuscule?: boolean;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string, minuscule = false): ChampDef {
  return { type: "texte", label, placeholder, minuscule };
}

/** Seuil de découpage — RÉDUIT à 24 (au lieu de 28 chez `6gen48`/`6gen50`, `formatLoiBinomiale.ts`)
 * suite à un débordement RÉELLEMENT observé en vérification Playwright à 375px : le contexte
 * "allergieA" produit une ligne de 28 caractères pile au seuil ("Un médicament est administré")
 * dont le rendu KaTeX déborde malgré tout du conteneur — les lettres ACCENTUÉES (ici "é" ×2, dans
 * "médicament"/"administré") se composent en base+accent superposé (voir en-tête
 * `generateurs6e/loiPoisson/contextes.ts`/`familleA.ts`, aucun rapport direct mais même famille de
 * piège KaTeX) et rendent visiblement plus large qu'un caractère ASCII simple à taille de police
 * égale — un compte de caractères brut ne capture pas cet écart. Seuil resserré ICI (fichier propre
 * à ce générateur, aucun autre générateur affecté) plutôt que retouché globalement. */
const LONGUEUR_MAX_LIGNE = 24;

/** Découpe un texte français long en PLUSIEURS entrées `string[]`, aux frontières de MOTS
 * uniquement — mirroir EXACT `decouperEnFragmentsTexte` de `formatLoiBinomiale.ts` (6gen50). */
function decouperEnFragmentsTexte(texte: string): string[] {
  const mots = texte.split(" ");
  const lignes: string[] = [];
  let courante = "";
  for (const mot of mots) {
    const candidate = courante === "" ? mot : `${courante} ${mot}`;
    if (candidate.length > LONGUEUR_MAX_LIGNE && courante !== "") {
      lignes.push(courante);
      courante = mot;
    } else {
      courante = candidate;
    }
  }
  if (courante !== "") lignes.push(courante);
  return lignes.map((ligne) => `\\text{${ligne}}`);
}

/** Décimal EXACT (jamais arrondi de façon trompeuse pour un affichage "réponse correcte") — mirroir
 * `formatDecimalExact` de `formatLoiBinomiale.ts`. */
function formatDecimalExact(v: number): string {
  const s = v.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  return s === "" || s === "-" ? "0" : s;
}

/** Décimal ARRONDI pour un affichage d'AIDE (valeur partielle, pas la réponse finale) — un nombre
 * "normal" dans l'immense majorité des cas, puisque cette fonction n'est appelée que sur des
 * quantités volontairement bornées dans (0,1] (voir en-tête de fichier, "pas de nombre énorme
 * illisible"). **Piège trouvé en vérification Playwright** : pour λ=75 (exemple même de la spec),
 * `e^{-λ}≈2,7×10⁻³³` — arrondi à 6 décimales, cette valeur devient EXACTEMENT `0`, une aide
 * trompeuse (suggère faussement une valeur nulle plutôt qu'infinitésimale). Bascule donc en
 * notation scientifique `m×10^e` UNIQUEMENT quand l'arrondi décimal classique collapse à 0 pour une
 * valeur réellement non nulle — jamais dans le cas normal, qui reste un simple décimal lisible. */
function formatDecimalArrondi(v: number, chiffres = 6): string {
  const arrondi = Number(v.toFixed(chiffres));
  if (arrondi === 0 && v !== 0) {
    const [mantisse, exposant] = v.toExponential(2).split("e");
    return `${mantisse}\\times10^{${Number(exposant)}}`;
  }
  return formatDecimalExact(arrondi);
}

/** `p` (famille A) toujours affiché en fraction irréductible — ensemble FIXE de candidats
 * (`generateurs6e/loiPoisson/familleA.ts`, `CANDIDATS_A`). */
const FRACTIONS_P_A: Record<string, [number, number]> = {
  "0.1": [1, 10],
  "0.08": [2, 25],
  "0.05": [1, 20],
};

function formatFractionPA(p: number): string {
  const paire = FRACTIONS_P_A[`${p}`];
  if (!paire) return `${p}`;
  return `\\dfrac{${paire[0]}}{${paire[1]}}`;
}

const LIBELLE_STRATEGIE: Record<StrategiePoissonB, string> = {
  termeUnique: "un seul terme",
  somme: "une somme de plusieurs termes",
  complement: "un complément (1 moins une somme de termes)",
};

// ============================================================================
// Famille A — Approximation binomiale → Poisson.
// ============================================================================

const CONDITIONS_APPROXIMATION = ["Le nombre d'épreuves n est au moins égal à 30 (n≥30).", "La probabilité de succès p est au plus égale à 0,1 (p≤0,1).", "Le produit n·p est au plus égal à 15 (n·p≤15)."];

export function consigneGeneraleA(): string {
  return "Un contexte binomial B(n,p) est donné, avec n grand et p petit. Vérifie les conditions d'approximation par une loi de Poisson, calcule λ, puis calcule la probabilité demandée.";
}

export function blocDonneesA(e: ExerciceLoiPoissonA): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `n=${e.n}`, `p=${formatFractionPA(e.p)}`, `\\text{Demandé : }P(X=${e.k})`];
}

export function consigneEcranA(phase: PhaseLoiPoisson): string {
  if (phase === "aEcran1") return "Vérifie si chacune des 3 conditions suivantes est remplie dans ce contexte.";
  if (phase === "aEcran2") return "Calcule la valeur de λ=n·p, la moyenne théorique du nombre d'occurrences.";
  return "Calcule P(X=k) à l'aide de la formule de Poisson P(X=k)=e^(-λ)·λ^k/k!, avec la valeur de λ CONFIRMÉE à l'étape précédente.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `aEcran3` omettait la confirmation des 3 conditions d'approximation de `aEcran1`, ne
 * montrant que λ de `aEcran2`. Plus ancien en premier. */
export function etatActuelA(e: ExerciceLoiPoissonA, phase: PhaseLoiPoisson): string[] | null {
  if (phase !== "aEcran3") return null;
  return ["\\text{Les 3 conditions sont réunies (confirmé, étape 1)}", `\\lambda=${formatDecimalExact(e.lambda)}\\text{ (confirmé, étape 2)}`];
}

export function champsA(e: ExerciceLoiPoissonA, phase: PhaseLoiPoisson): ChampDef[] {
  if (phase === "aEcran1") {
    const options: OptionChoix[] = [
      { valeur: "vrai", label: "Vrai" },
      { valeur: "faux", label: "Faux" },
    ];
    return CONDITIONS_APPROXIMATION.map((label) => ({ type: "choix", label, options }));
  }
  if (phase === "aEcran2") return [champTexte("λ = n·p =", "ex : 5", true)];
  return [champTexte(`P(X=${e.k}) =`, "ex : 0,175467")];
}

export function niveauAideMaxA(phase: PhaseLoiPoisson): number {
  return phase === "aEcran1" ? 2 : 0;
}

export function aideNiveau1A(phase: PhaseLoiPoisson): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return {
    texte: "Rappel des 3 conditions nécessaires pour approcher une loi binomiale B(n,p) par une loi de Poisson : n≥30 (un grand nombre d'épreuves) ; p≤0,1 (une probabilité de succès faible) ; n·p≤15 (le produit reste modéré).",
    latex: null,
  };
}

export function aideNiveau2A(phase: PhaseLoiPoisson): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return {
    texte: "2 des 3 conditions sont déjà confirmées : n≥30 et p≤0,1. Il reste à vérifier n·p≤15.",
    latex: null,
  };
}

// ============================================================================
// Famille B — Application directe.
// ============================================================================

function formatQuestionMathB(e: ExerciceLoiPoissonB): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `P(X=${e.k})`;
    case "entreAetB":
      return `P(${e.k}\\leq X\\leq ${e.kSecondaire})`;
    case "auPlus":
      return `P(X\\leq ${e.k})`;
    case "auMoins":
      return `P(X\\geq ${e.k})`;
  }
}

function estEcranLambdaB(phase: PhaseLoiPoisson): boolean {
  return phase === "bTermeUniqueEcran1" || phase === "bSommeEcran1" || phase === "bComplementEcran1";
}
function estEcranIdentificationB(phase: PhaseLoiPoisson): boolean {
  return phase === "bSommeEcran2" || phase === "bComplementEcran2";
}
function estEcranFinalSepareB(phase: PhaseLoiPoisson): boolean {
  return phase === "bSommeEcran3" || phase === "bComplementEcran3";
}

export function consigneGeneraleB(): string {
  return "Un taux moyen d'occurrence est donné pour une échelle de référence. Détermine λ adapté à la question posée, identifie la stratégie de calcul adaptée, puis calcule la probabilité demandée à l'aide de la loi de Poisson.";
}

export function blocDonneesB(e: ExerciceLoiPoissonB): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texteTauxBase(e.tauxBase)), ...decouperEnFragmentsTexte(e.contexte.texteCible(e.valeurCible)), `\\text{Demandé : }${formatQuestionMathB(e)}`];
}

export function consigneEcranB(phase: PhaseLoiPoisson): string {
  if (estEcranLambdaB(phase)) return "Détermine la valeur de λ adaptée à la question posée : ajuste le taux de base donné à la bonne échelle (durée ou effectif demandé), ne le recopie jamais tel quel.";
  if (phase === "bTermeUniqueEcranFinal") return "Identifie la stratégie de calcul, indique le nombre d'occurrences k concerné, puis calcule directement la probabilité demandée à l'aide de la formule de Poisson P(X=k)=e^(-λ)·λ^k/k!.";
  if (estEcranIdentificationB(phase)) return "Identifie la stratégie de calcul adaptée à la question posée, puis indique le(s) nombre(s) d'occurrences pour lesquels il faut calculer P(X=i).";
  if (phase === "bSommeEcran3") return "Additionne les termes CONFIRMÉS de l'étape précédente pour obtenir la probabilité demandée.";
  return "Calcule 1 moins la somme des termes CONFIRMÉS de l'étape précédente pour obtenir la probabilité demandée.";
}

export function etatActuelB(e: ExerciceLoiPoissonB, phase: PhaseLoiPoisson): string[] | null {
  if (phase === "bTermeUniqueEcranFinal") return [`\\lambda=${formatDecimalExact(e.lambda)}\\text{ (confirmé)}`];
  if (estEcranIdentificationB(phase)) return [`\\lambda=${formatDecimalExact(e.lambda)}\\text{ (confirmé)}`];
  if (estEcranFinalSepareB(phase)) {
    const termes = e.termesACalculer.map((k) => `P(X=${k})`).join(",\\ ");
    return [`\\lambda=${formatDecimalExact(e.lambda)}\\text{ (confirmé)}`, ...decouperEnFragmentsTexte(`Stratégie : ${LIBELLE_STRATEGIE[e.strategie]}`), `\\text{Termes : }${termes}`];
  }
  return null;
}

export function champsB(_e: ExerciceLoiPoissonB, phase: PhaseLoiPoisson): ChampDef[] {
  if (estEcranLambdaB(phase)) return [champTexte("λ =", "ex : 75", true)];
  const optionsStrategie: OptionChoix[] = [
    { valeur: "termeUnique", label: "Un seul terme" },
    { valeur: "somme", label: "Une somme de plusieurs termes" },
    { valeur: "complement", label: "Un complément (1 moins une somme de termes)" },
  ];
  if (phase === "bTermeUniqueEcranFinal") {
    return [{ type: "choix", label: "Stratégie =", options: optionsStrategie }, champTexte("Nombre d'occurrences k =", "ex : 75", true), champTexte("Probabilité demandée =", "ex : 0,046")];
  }
  if (estEcranIdentificationB(phase)) {
    return [{ type: "choix", label: "Stratégie =", options: optionsStrategie }, champTexte("Nombre(s) d'occurrences à calculer (séparés par une virgule) =", "ex : 0,1,2,3")];
  }
  return [champTexte("Résultat final (probabilité demandée) =", "ex : 0,37")];
}

export function niveauAideMaxB(phase: PhaseLoiPoisson): number {
  if (estEcranLambdaB(phase)) return 2;
  if (phase === "bTermeUniqueEcranFinal") return 2;
  if (estEcranIdentificationB(phase)) return 0;
  return 2; // écrans finaux séparés (somme/complement)
}

export function aideNiveau1B(phase: PhaseLoiPoisson): AideAvecLatex {
  if (estEcranLambdaB(phase)) {
    return { texte: "Rappel : λ doit être adapté à l'unité de temps ou à l'effectif de la question posée — jamais simplement recopié du taux de base donné.", latex: null };
  }
  if (phase === "bTermeUniqueEcranFinal" || phase === "bSommeEcran3" || phase === "bComplementEcran3") {
    return { texte: "Rappel de la formule de Poisson, à appliquer pour chaque terme nécessaire :", latex: "P(X=k)=e^{-\\lambda}\\cdot\\dfrac{\\lambda^k}{k!}" };
  }
  return AUCUNE_AIDE;
}

export function aideNiveau2B(e: ExerciceLoiPoissonB, phase: PhaseLoiPoisson): AideAvecLatex {
  if (estEcranLambdaB(phase)) {
    return { texte: "Le facteur d'ajustement a déjà été identifié, le calcul final n'est pas fait :", latex: `\\lambda = ${formatDecimalExact(e.tauxBase)}\\times ${formatDecimalExact(e.facteurEchelle)}` };
  }
  if (phase === "bTermeUniqueEcranFinal") {
    return {
      texte: "Astuce pour éviter de manipuler des nombres énormes : pars de e^(-λ), puis multiplie successivement par λ/1, puis λ/2, ... jusqu'à λ/k, plutôt que de calculer λ^k et k! séparément.",
      latex: `e^{-\\lambda}\\approx ${formatDecimalArrondi(Math.exp(-e.lambda))}`,
    };
  }
  if (phase === "bSommeEcran3" || phase === "bComplementEcran3") {
    const premierK = e.termesACalculer[0];
    const restants = e.termesACalculer.length - 1;
    return {
      texte: restants > 0 ? `Le premier terme est déjà calculé, il reste ${restants} terme(s) à calculer :` : "Ce terme est déjà calculé :",
      latex: `P(X=${premierK})\\approx ${formatDecimalArrondi(e.valeursTermes[0])}`,
    };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLoiPoisson): string {
  return exercice.famille === "A" ? consigneGeneraleA() : consigneGeneraleB();
}

export function blocDonnees(exercice: ExerciceLoiPoisson): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): string {
  return exercice.famille === "A" ? consigneEcranA(phase) : consigneEcranB(phase);
}

export function etatActuel(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

export function champsEcran(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): ChampDef[] {
  return exercice.famille === "A" ? champsA(exercice, phase) : champsB(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): number {
  return exercice.famille === "A" ? niveauAideMaxA(phase) : niveauAideMaxB(phase);
}

export function aideNiveau1(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau1A(phase) : aideNiveau1B(phase);
}

export function aideNiveau2(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau2A(phase) : aideNiveau2B(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseLoiPoisson, string> = {
  aEcran1: "Étape 1 (conditions d'approximation)",
  aEcran2: "Étape 2 (calcul de λ)",
  aEcran3: "Étape 3 (calcul de P(X=k))",
  bTermeUniqueEcran1: "Étape 1 (calcul de λ)",
  bTermeUniqueEcranFinal: "Étape 2 (stratégie + calcul final)",
  bSommeEcran1: "Étape 1 (calcul de λ)",
  bSommeEcran2: "Étape 2 (stratégie + termes à calculer)",
  bSommeEcran3: "Étape 3 (somme des termes)",
  bComplementEcran1: "Étape 1 (calcul de λ)",
  bComplementEcran2: "Étape 2 (stratégie + terme(s) à calculer)",
  bComplementEcran3: "Étape 3 (complément)",
};

export const LIBELLE_FAMILLE: Record<FamilleLoiPoisson, string> = {
  A: "A — Approximation binomiale → Poisson",
  B: "B — Application directe",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return ["\\text{Les 3 conditions sont réunies (Vrai)}"];
    if (phase === "aEcran2") return [`\\lambda=${formatDecimalExact(exercice.lambda)}`];
    return [formatDecimalExact(exercice.probabilite)];
  }
  if (estEcranLambdaB(phase)) return [`\\lambda=${formatDecimalExact(exercice.lambda)}`];
  if (phase === "bTermeUniqueEcranFinal") {
    return [...decouperEnFragmentsTexte(LIBELLE_STRATEGIE[exercice.strategie]), `k=${exercice.k}`, formatDecimalExact(exercice.resultatFinal)];
  }
  if (estEcranIdentificationB(phase)) {
    const termes = exercice.termesACalculer.map((k) => `k=${k}`).join(",\\ ");
    return [...decouperEnFragmentsTexte(LIBELLE_STRATEGIE[exercice.strategie]), termes];
  }
  return [formatDecimalExact(exercice.resultatFinal)];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsLoiPoisson(resultat: ResultatExerciceLoiPoisson): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}

export type { ExerciceLoiPoissonA, ExerciceLoiPoissonB };
