import type { ExerciceLoiBinomiale, ExerciceLoiBinomialeA, ExerciceLoiBinomialeB, ExerciceLoiBinomialeC, FamilleLoiBinomiale } from "../core6e/loiBinomiale.types";
import type { StrategieBinomialeA } from "../core6e/binomialeSequenceOrdonnee.types";
import { coefficientBinomial } from "../generateurs6e/combinatoire";
import type { PhaseLoiBinomiale, ResultatExerciceLoiBinomiale } from "../moteur6e/typesLoiBinomiale";
import { phasesPourExercice } from "../moteur6e/typesLoiBinomiale";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen50`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatBinomialeSequenceOrdonnee.ts` (6gen48), jamais
 * importé par un autre générateur (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths.
 * Couverture de régression : `formatLoiBinomiale.test.ts`, scan sur fixtures ET 300 tirages réels.
 *
 * `p`/`seuil` sont toujours DÉCIMAUX en interne mais toujours AFFICHÉS sous forme de FRACTION
 * irréductible (convention transversale CLAUDE.md) — voir `FRACTIONS` ci-dessous, table statique car
 * ces valeurs sont toujours tirées d'ensembles FIXES de candidats (`generateurs6e/loiBinomiale/
 * familleA.ts`/`familleB.ts`/`familleC.ts`). **Exception explicite (spec)** : `valeurN` (famille C,
 * écran 3) est un entier positif brut (nombre d'épreuves), jamais une fraction.
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
  /** `true` pour un label RÉDUIT À UNE LETTRE DE VARIABLE (ex. "n =", "p ="), où le
   * `text-transform: uppercase` global de `.field-label` casserait une distinction pédagogique —
   * ici spécifiquement "p" (paramètre de Bernoulli) vs "P" (notation `P(X=k)` déjà utilisée pour la
   * probabilité demandée ailleurs sur le même écran) — mirroir `.field-label-minuscule` déjà établi
   * pour "a"/"b"/"c" dans "Analyse d'une fonction du second degré" (voir `App.css`). Jamais utilisé
   * pour un label-phrase complet (checklist, stratégie, interprétation QCM), où la MAJUSCULE ne
   * casse aucune distinction. */
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

/** Seuil de découpage identique à `6gen48` (`formatBinomialeSequenceOrdonnee.ts`), revérifié à
 * 375px lors de la vérification Playwright de ce générateur. */
const LONGUEUR_MAX_LIGNE = 28;

/** Découpe un texte français long en PLUSIEURS entrées `string[]`, aux frontières de MOTS
 * uniquement — mirroir EXACT `decouperEnFragmentsTexte` de `formatBinomialeSequenceOrdonnee.ts`
 * (6gen48), voir son en-tête pour la justification complète du piège évité. */
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

// ============================================================================
// Fractions irréductibles pour p/seuil (ensembles FIXES de candidats).
// ============================================================================

const FRACTIONS: Record<string, [number, number]> = {
  "0.02": [1, 50],
  "0.05": [1, 20],
  "0.08": [2, 25],
  "0.1": [1, 10],
  "0.15": [3, 20],
  "0.2": [1, 5],
  "0.25": [1, 4],
  "0.3": [3, 10],
  "0.4": [2, 5],
  "0.5": [1, 2],
  "0.6": [3, 5],
  "0.7": [7, 10],
  "0.75": [3, 4],
  "0.8": [4, 5],
  "0.9": [9, 10],
  "0.95": [19, 20],
  "0.99": [99, 100],
};

function formatFraction(v: number, style: "frac" | "dfrac" = "dfrac"): string {
  const paire = FRACTIONS[`${v}`];
  if (!paire) return `${v}`;
  const [num, den] = paire;
  return `\\${style}{${num}}{${den}}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** `n·p` en fraction irréductible — `p` toujours tiré de `FRACTIONS` (dénominateur connu). */
function formatEsperanceFraction(n: number, p: number): string {
  const paire = FRACTIONS[`${p}`];
  if (!paire) return formatDecimalExact(n * p);
  const [num, den] = paire;
  const numeroTotal = n * num;
  if (numeroTotal % den === 0) return `${numeroTotal / den}`;
  const d = pgcd(numeroTotal, den);
  return `\\dfrac{${numeroTotal / d}}{${den / d}}`;
}

/** Décimal EXACT (jamais arrondi de façon trompeuse) — mirroir `formatDecimalExact` de
 * `formatBinomialeSequenceOrdonnee.ts` (6gen48). */
function formatDecimalExact(v: number): string {
  const s = v.toFixed(10).replace(/0+$/, "").replace(/\.$/, "");
  return s === "" || s === "-" ? "0" : s;
}

const LIBELLE_STRATEGIE: Record<StrategieBinomialeA, string> = {
  termeUnique: "un seul terme",
  somme: "une somme de plusieurs termes",
  complement: "un complément (1 moins un terme)",
};

// ============================================================================
// Famille A — Justifier qu'une variable suit une loi binomiale.
// ============================================================================

const CONDITIONS_BERNOULLI = (labelSucces: string): string[] => [
  "Le nombre d'épreuves est fixé à l'avance.",
  "Les épreuves sont indépendantes les unes des autres.",
  `Chaque épreuve n'a que 2 issues possibles : « ${labelSucces} » ou non.`,
  "La probabilité de succès reste constante d'une épreuve à l'autre.",
];

export function consigneGeneraleA(): string {
  return "Un contexte décrit une répétition d'épreuves. Identifie le nombre d'épreuves n et la probabilité de succès p, puis vérifie que les conditions du schéma de Bernoulli répété sont réunies.";
}

export function blocDonneesA(e: ExerciceLoiBinomialeA): string[] {
  return decouperEnFragmentsTexte(e.contexte.texteTemplate(e.n, e.p));
}

export function consigneEcranA(phase: PhaseLoiBinomiale): string {
  if (phase === "aEcran1") return "Identifie le nombre d'épreuves n et la probabilité de succès p décrits dans l'énoncé.";
  return "Vérifie si chacune des 4 conditions suivantes est remplie dans ce contexte.";
}

export function etatActuelA(e: ExerciceLoiBinomialeA, phase: PhaseLoiBinomiale): string[] | null {
  if (phase !== "aEcran2") return null;
  return [`n=${e.n}`, `p=${formatFraction(e.p)}`];
}

export function champsA(e: ExerciceLoiBinomialeA, phase: PhaseLoiBinomiale): ChampDef[] {
  if (phase === "aEcran1") {
    return [champTexte("n (nombre d'épreuves) =", "ex : 8", true), champTexte("p (probabilité de succès) =", "ex : 0,2 ou 1/5", true)];
  }
  const options: OptionChoix[] = [
    { valeur: "vrai", label: "Vrai" },
    { valeur: "faux", label: "Faux" },
  ];
  return CONDITIONS_BERNOULLI(e.contexte.labelSucces).map((label) => ({ type: "choix", label, options }));
}

export function niveauAideMaxA(phase: PhaseLoiBinomiale): number {
  return phase === "aEcran2" ? 2 : 0;
}

export function aideNiveau1A(phase: PhaseLoiBinomiale): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return {
    texte: "Rappel des 4 conditions du schéma de Bernoulli répété : un nombre d'épreuves fixé à l'avance ; des épreuves indépendantes entre elles ; exactement 2 issues possibles à chaque épreuve (succès/échec) ; une probabilité de succès constante d'une épreuve à l'autre.",
    latex: null,
  };
}

export function aideNiveau2A(phase: PhaseLoiBinomiale): AideAvecLatex {
  if (phase !== "aEcran2") return AUCUNE_AIDE;
  return {
    texte: "2 des 4 conditions sont déjà confirmées : le nombre d'épreuves est fixé à l'avance, et chaque épreuve n'a que 2 issues possibles. Il reste à vérifier les 2 autres.",
    latex: null,
  };
}

// ============================================================================
// Famille B — Calculs directs (référence à 6gen48).
// ============================================================================

function formatQuestionMathB(e: ExerciceLoiBinomialeB): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `P(X=${e.k})`;
    case "auMoins":
      return `P(X\\geq ${e.k})`;
    case "auPlus":
      return `P(X\\leq ${e.k})`;
    case "aucun":
      return "P(X=0)";
    case "tous":
      return `P(X=${e.n})`;
  }
}

function formatQuestionQualificatifB(e: ExerciceLoiBinomialeB): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `(exactement ${e.k} succès)`;
    case "auMoins":
      return `(au moins ${e.k} succès)`;
    case "auPlus":
      return `(au plus ${e.k} succès)`;
    case "aucun":
      return "(aucun succès)";
    case "tous":
      return "(tous des succès)";
  }
}

function estEcran1B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bTermeUniqueEcran1" || phase === "bSommeEcran1" || phase === "bComplementEcran1";
}
function estEcran2B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bTermeUniqueEcran2" || phase === "bSommeEcran2" || phase === "bComplementEcran2";
}
function estEcran3B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bSommeEcran3" || phase === "bComplementEcran3";
}
function estEsperanceB(phase: PhaseLoiBinomiale): boolean {
  return phase === "bTermeUniqueEsperance" || phase === "bSommeEsperance" || phase === "bComplementEsperance";
}

export function consigneGeneraleB(): string {
  return "n épreuves indépendantes sont répétées, chacune avec la même probabilité de succès p. Identifie la stratégie de calcul adaptée à la question, calcule la probabilité demandée, puis calcule le nombre moyen de succès attendu.";
}

export function blocDonneesB(e: ExerciceLoiBinomialeB): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `n=${e.n}`, `p=${formatFraction(e.p)}`, `\\text{Demandé : }${formatQuestionMathB(e)}`, ...decouperEnFragmentsTexte(formatQuestionQualificatifB(e))];
}

export function consigneEcranB(e: ExerciceLoiBinomialeB, phase: PhaseLoiBinomiale): string {
  if (estEcran1B(phase)) return "Identifie la stratégie de calcul (un seul terme, une somme de plusieurs termes, ou un complément), puis indique le(s) nombre(s) de succès k pour lesquels il faut calculer P(X=k).";
  if (estEcran2B(phase)) return "Calcule la valeur de chaque terme P(X=k) identifié à l'étape précédente, à l'aide de la formule C(n,k)·p^k·(1-p)^(n-k).";
  if (estEcran3B(phase)) return e.strategie === "somme" ? "Additionne les termes CONFIRMÉS de l'étape précédente pour obtenir la probabilité demandée." : "Calcule 1 moins le terme CONFIRMÉ de l'étape précédente pour obtenir la probabilité demandée.";
  return "Calcule l'espérance E(X)=n·p, puis choisis l'interprétation correcte de cette valeur.";
}

/** Lignes confirmées à l'écran 1 (stratégie + termes identifiés) — réutilisées par tout écran
 * ultérieur (correctif transversal accumulation, voir CLAUDE.md/`docs/historique-6e.md`). */
function lignesEcran1B(e: ExerciceLoiBinomialeB): string[] {
  const termes = e.termesACalculer.map((k) => `P(X=${k})`).join(",\\ ");
  return [...decouperEnFragmentsTexte(`Stratégie (étape 1) : ${LIBELLE_STRATEGIE[e.strategie]}`), `\\text{Termes (étape 1) : }${termes}`];
}

/** Lignes confirmées à l'écran 2 (valeur de chaque terme) — réutilisées par tout écran ultérieur. */
function lignesEcran2B(e: ExerciceLoiBinomialeB): string[] {
  return e.termesACalculer.map((k, i) => `P(X=${k})=${formatDecimalExact(e.valeursTermes[i])}\\text{ (confirmé, étape 2)}`);
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug que sur `6gen1`/`6gen58`) : `bXxxEcran3` (somme/complément) ne montrait QUE les
 * valeurs de l'écran 2, jamais la stratégie/les termes de l'écran 1 ; `bXxxEsperance` (dernier écran,
 * quelle que soit la stratégie) ne montrait QUE le résultat de l'écran immédiatement précédent,
 * jamais les écrans antérieurs. Plus ancien en premier. */
export function etatActuelB(e: ExerciceLoiBinomialeB, phase: PhaseLoiBinomiale): string[] | null {
  if (estEcran2B(phase)) return lignesEcran1B(e);
  if (estEcran3B(phase)) return [...lignesEcran1B(e), ...lignesEcran2B(e)];
  if (estEsperanceB(phase)) {
    const lignes = [...lignesEcran1B(e), ...lignesEcran2B(e)];
    if (e.strategie !== "termeUnique") lignes.push(`${formatQuestionMathB(e)}=${formatDecimalExact(e.resultatFinal)}\\text{ (confirmé, étape 3)}`);
    return lignes;
  }
  return null;
}

const OPTIONS_INTERPRETATION_ESPERANCE: OptionChoix[] = [
  { valeur: "correcte", label: "E(X) représente le nombre moyen de succès attendu si l'on répète l'expérience un grand nombre de fois." },
  { valeur: "probabiliteExacte", label: "E(X) représente la probabilité d'obtenir exactement ce nombre de succès à chaque répétition." },
  { valeur: "maximumPossible", label: "E(X) représente le nombre maximal de succès possible sur n épreuves." },
  { valeur: "certitude", label: "E(X) représente le nombre de succès obtenu à coup sûr après n épreuves." },
];

export function champsB(e: ExerciceLoiBinomialeB, phase: PhaseLoiBinomiale): ChampDef[] {
  if (estEcran1B(phase)) {
    return [
      {
        type: "choix",
        label: "Stratégie =",
        options: [
          { valeur: "termeUnique", label: "Un seul terme" },
          { valeur: "somme", label: "Une somme de plusieurs termes" },
          { valeur: "complement", label: "Un complément (1 moins un terme)" },
        ],
      },
      champTexte("Nombre(s) de succès k à calculer (séparés par une virgule) =", "ex : 3"),
    ];
  }
  if (estEcran2B(phase)) return e.termesACalculer.map((k) => champTexte(`P(X=${k}) =`, "ex : 0,21875"));
  if (estEcran3B(phase)) return [champTexte("Résultat final (probabilité demandée) =", "ex : 0,5")];
  return [champTexte("E(X)=n·p =", "ex : 4", true), { type: "choix", label: "Interprétation correcte de E(X) =", options: OPTIONS_INTERPRETATION_ESPERANCE }];
}

export function niveauAideMaxB(phase: PhaseLoiBinomiale): number {
  return estEcran1B(phase) || estEcran2B(phase) ? 2 : 0;
}

export function aideNiveau1B(phase: PhaseLoiBinomiale): AideAvecLatex {
  if (estEcran1B(phase)) {
    return {
      texte: "3 stratégies possibles selon la formulation de la question : un seul terme (« exactement »/« aucun »/« tous »), une somme de plusieurs termes (« au plus »/« au moins », en sommant directement quand il y a peu de termes), ou un complément (1 moins un terme extrême, ex. « au moins 1 » = 1 − P(X=0)).",
      latex: null,
    };
  }
  if (estEcran2B(phase)) return { texte: "Rappel de la formule :", latex: "P(X=k)=C(n,k)\\cdot p^k\\cdot(1-p)^{n-k}" };
  return AUCUNE_AIDE;
}

export function aideNiveau2B(e: ExerciceLoiBinomialeB, phase: PhaseLoiBinomiale): AideAvecLatex {
  if (estEcran1B(phase)) {
    const strategie = LIBELLE_STRATEGIE[e.strategie];
    if (e.strategie === "termeUnique") return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: `P(X=${e.k})` };
    if (e.strategie === "complement") return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: `1-P(X=${e.termesACalculer[0]})` };
    const somme = e.termesACalculer.map((k) => `P(X=${k})`).join("+");
    return { texte: `La stratégie identifiée dans l'énoncé est : ${strategie}.`, latex: somme };
  }
  if (estEcran2B(phase)) {
    const premierK = e.termesACalculer[0];
    const coefficient = coefficientBinomial(e.n, premierK);
    return { texte: `Coefficient binomial déjà calculé pour le premier terme (les puissances de p et 1−p restent à substituer) :`, latex: `C(${e.n},${premierK})=${coefficient}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Trouver n via logarithme, "au moins 1 succès".
// ============================================================================

export function consigneGeneraleC(): string {
  return "Une épreuve est répétée n fois, indépendamment, avec une probabilité p de succès à chaque fois. Détermine le nombre minimal n de répétitions pour que la probabilité d'obtenir au moins un succès dépasse le seuil donné.";
}

export function blocDonneesC(e: ExerciceLoiBinomialeC): string[] {
  return [...decouperEnFragmentsTexte(e.contexte.texte), `p=${formatFraction(e.p)}`, `\\text{Seuil : }${formatFraction(e.seuil)}`];
}

export function consigneEcranC(phase: PhaseLoiBinomiale): string {
  if (phase === "cEcran1") return "Pose l'inéquation correspondant à « P(au moins 1 succès) > seuil », en fonction de n.";
  if (phase === "cEcran2") return "Isole (1−p)ⁿ dans l'inéquation CONFIRMÉE de l'étape précédente.";
  return "Résous l'inéquation CONFIRMÉE pour trouver n (utilise le logarithme), puis arrondis au nombre entier supérieur pour obtenir le nombre minimal d'épreuves.";
}

function formatInequationPoseeC(e: ExerciceLoiBinomialeC): string {
  return `1-(1-${formatFraction(e.p, "frac")})^n>${formatFraction(e.seuil, "frac")}`;
}

function formatInequationIsoleeC(e: ExerciceLoiBinomialeC): string {
  return `(1-${formatFraction(e.p, "frac")})^n<1-${formatFraction(e.seuil, "frac")}`;
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal, voir CLAUDE.md/`docs/historique-
 * 6e.md`) : `cEcran3` omettait l'inéquation posée de `cEcran1`, ne montrant que l'inéquation isolée
 * de `cEcran2`. Plus ancien en premier. */
export function etatActuelC(e: ExerciceLoiBinomialeC, phase: PhaseLoiBinomiale): string[] | null {
  if (phase === "cEcran2") return [`${formatInequationPoseeC(e)}\\text{ (confirmé, étape 1)}`];
  if (phase === "cEcran3") return [`${formatInequationPoseeC(e)}\\text{ (confirmé, étape 1)}`, `${formatInequationIsoleeC(e)}\\text{ (confirmé, étape 2)}`];
  return null;
}

function exempleInequationPoseeC(e: ExerciceLoiBinomialeC): string {
  const [np, dp] = FRACTIONS[`${e.p}`] ?? [e.p, 1];
  const [ns, ds] = FRACTIONS[`${e.seuil}`] ?? [e.seuil, 1];
  return `ex : 1-(1-${np}/${dp})^n > ${ns}/${ds}`;
}

function exempleInequationIsoleeC(e: ExerciceLoiBinomialeC): string {
  const [np, dp] = FRACTIONS[`${e.p}`] ?? [e.p, 1];
  const un = FRACTIONS[`${1 - e.seuil}`.replace(/^0\.(\d+)0*$/, "0.$1")] ?? null;
  const droite = un ? `${un[0]}/${un[1]}` : formatDecimalExact(1 - e.seuil);
  return `ex : (1-${np}/${dp})^n < ${droite}`;
}

export function champsC(e: ExerciceLoiBinomialeC, phase: PhaseLoiBinomiale): ChampDef[] {
  if (phase === "cEcran1") return [champTexte("Inéquation posée (en n) =", exempleInequationPoseeC(e))];
  if (phase === "cEcran2") return [champTexte("Inéquation isolée (en n) =", exempleInequationIsoleeC(e))];
  return [champTexte("n (nombre minimal d'épreuves) =", "ex : 22")];
}

export function niveauAideMaxC(phase: PhaseLoiBinomiale): number {
  return phase === "cEcran3" ? 2 : 0;
}

export function aideNiveau1C(phase: PhaseLoiBinomiale): AideAvecLatex {
  if (phase !== "cEcran3") return AUCUNE_AIDE;
  return { texte: "Diviser (ou multiplier) une inégalité par un nombre négatif en inverse le sens. Ici, ln(1−p) est toujours négatif car 0<1−p<1.", latex: "\\ln(1-p)<0" };
}

export function aideNiveau2C(e: ExerciceLoiBinomialeC, phase: PhaseLoiBinomiale): AideAvecLatex {
  if (phase !== "cEcran3") return AUCUNE_AIDE;
  const v = Math.log(1 - e.seuil) / Math.log(1 - e.p);
  return {
    texte: "La division a déjà été effectuée, SANS préciser le sens de l'inégalité ni arrondir (à toi de déterminer le sens correct, puis d'arrondir au nombre entier supérieur) :",
    latex: `n \\approx ${v.toFixed(3)}`,
  };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLoiBinomiale): string {
  if (exercice.famille === "A") return consigneGeneraleA();
  if (exercice.famille === "B") return consigneGeneraleB();
  return consigneGeneraleC();
}

export function blocDonnees(exercice: ExerciceLoiBinomiale): string[] {
  if (exercice.famille === "A") return blocDonneesA(exercice);
  if (exercice.famille === "B") return blocDonneesB(exercice);
  return blocDonneesC(exercice);
}

export function consigneEcran(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): string {
  if (exercice.famille === "A") return consigneEcranA(phase);
  if (exercice.famille === "B") return consigneEcranB(exercice, phase);
  return consigneEcranC(phase);
}

export function etatActuel(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): string[] | null {
  if (exercice.famille === "A") return etatActuelA(exercice, phase);
  if (exercice.famille === "B") return etatActuelB(exercice, phase);
  return etatActuelC(exercice, phase);
}

export function champsEcran(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): ChampDef[] {
  if (exercice.famille === "A") return champsA(exercice, phase);
  if (exercice.famille === "B") return champsB(exercice, phase);
  return champsC(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): number {
  if (exercice.famille === "A") return niveauAideMaxA(phase);
  if (exercice.famille === "B") return niveauAideMaxB(phase);
  return niveauAideMaxC(phase);
}

export function aideNiveau1(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): AideAvecLatex {
  if (exercice.famille === "A") return aideNiveau1A(phase);
  if (exercice.famille === "B") return aideNiveau1B(phase);
  return aideNiveau1C(phase);
}

export function aideNiveau2(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): AideAvecLatex {
  if (exercice.famille === "A") return aideNiveau2A(phase);
  if (exercice.famille === "B") return aideNiveau2B(exercice, phase);
  return aideNiveau2C(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseLoiBinomiale, string> = {
  aEcran1: "Étape 1 (identifier n et p)",
  aEcran2: "Étape 2 (conditions de Bernoulli)",
  bTermeUniqueEcran1: "Étape 1 (stratégie + terme à calculer)",
  bTermeUniqueEcran2: "Étape 2 (calcul du terme)",
  bTermeUniqueEsperance: "Étape supplémentaire (espérance E(X))",
  bSommeEcran1: "Étape 1 (stratégie + termes à calculer)",
  bSommeEcran2: "Étape 2 (calcul des termes)",
  bSommeEcran3: "Étape 3 (somme des termes)",
  bSommeEsperance: "Étape supplémentaire (espérance E(X))",
  bComplementEcran1: "Étape 1 (stratégie + terme à calculer)",
  bComplementEcran2: "Étape 2 (calcul du terme)",
  bComplementEcran3: "Étape 3 (complément)",
  bComplementEsperance: "Étape supplémentaire (espérance E(X))",
  cEcran1: "Étape 1 (inéquation posée)",
  cEcran2: "Étape 2 (inéquation isolée)",
  cEcran3: "Étape 3 (résolution par logarithme)",
};

export const LIBELLE_FAMILLE: Record<FamilleLoiBinomiale, string> = {
  A: "A — Justifier la loi binomiale",
  B: "B — Calculs directs",
  C: "C — Trouver n via logarithme",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`n=${exercice.n}`, `p=${formatFraction(exercice.p)}`];
    return [`\\text{Les 4 conditions sont réunies (Vrai)}`];
  }
  if (exercice.famille === "B") {
    if (estEcran1B(phase)) {
      const termes = exercice.termesACalculer.map((k) => `k=${k}`).join(",\\ ");
      return [...decouperEnFragmentsTexte(LIBELLE_STRATEGIE[exercice.strategie]), termes];
    }
    if (estEcran2B(phase)) return exercice.termesACalculer.map((k, i) => `P(X=${k})=${formatDecimalExact(exercice.valeursTermes[i])}`);
    if (estEcran3B(phase)) return [formatDecimalExact(exercice.resultatFinal)];
    return [`E(X)=${formatEsperanceFraction(exercice.n, exercice.p)}`, "\\text{Nombre moyen de succès attendu}"];
  }
  if (phase === "cEcran1") return [formatInequationPoseeC(exercice)];
  if (phase === "cEcran2") return [formatInequationIsoleeC(exercice)];
  return [`n=${exercice.valeurN}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsLoiBinomiale(resultat: ResultatExerciceLoiBinomiale): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}

export type { ExerciceLoiBinomialeA, ExerciceLoiBinomialeB, ExerciceLoiBinomialeC };
