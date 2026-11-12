import type { EvenementTableauA, ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";
import type { PhaseProbabilitesEnsembles } from "../moteur6e/typesProbabilitesEnsembles";
import { estPhaseChoix } from "../moteur6e/typesProbabilitesEnsembles";
import type { CleQuantiteEcran1A } from "../moteur6e/verificationProbabilitesEnsembles";
import { champsEcran1A, comparaisonConditionnellesA, effectifEvenementA, effectifIntersectionA, independantsB, relationPaireEcran3 } from "../moteur6e/verificationProbabilitesEnsembles";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen30`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et le champ pertinent de l'exercice où besoin), même principe que
 * `formatCalculPrimitives.ts` (6gen23). La précision acceptée est annoncée dans la CONSIGNE de
 * chaque écran à saisie (`ANNONCE_PRECISION`), conforme à ce que vérifie réellement
 * `diagnostiquerProbabilite` (audit 6e ch. 6, décision A) ; les placeholders ne sont que des
 * exemples de FORMAT, choisis hors de l'espace du tirage (`PLACEHOLDERS`).
 *
 * **2 types d'écran** : à CHAMP(S) libre(s) (`champsEcran`, consommé par
 * `EtapeChampsProbabilitesEnsembles`) ou à CHOIX (`choixEcran`, boutons `.btn.toggle-active`,
 * consommé par `EtapeChoixProbabilitesEnsembles`) — `estEcranChoix(phase)` indique lequel des deux
 * `App6gen30.tsx` doit rendre. `aEcran3`/`bEcran4` sont les 2 seuls écrans à choix de ce générateur.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionChoix {
  id: string;
  label: string;
}

/** Contenu d'une case du tableau à double entrée de l'écran 1 (famille A) : un champ (index dans
 * `champsEcran`) ou une valeur DONNÉE affichée telle quelle. */
export type ContenuCaseTableau = { type: "champ"; index: number } | { type: "fixe"; latex: string };

/** Tableau à double entrée à compléter : lignes A, Ā ; colonnes B, B̄. */
export interface TableauSaisie {
  enTetesLignes: [string, string];
  enTetesColonnes: [string, string];
  cases: [[ContenuCaseTableau, ContenuCaseTableau], [ContenuCaseTableau, ContenuCaseTableau]];
}

/** Fragment de consigne mêlant texte français et LaTeX court (CLAUDE.md, convention établie sur
 * `formatProprietesLogarithme.ts`/6gen13, dupliquée ici localement — chaque générateur garde la
 * sienne). */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texteFrag(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latexFrag(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Précision acceptée par `diagnostiquerProbabilite` (décision A de l'audit 6e ch. 6). */
const ANNONCE_PRECISION = " Donne chaque probabilité sous forme exacte, ou décimale arrondie au centième (au millième si la probabilité est inférieure à 0,1), ou en %.";

/** Exemples de FORMAT hors de l'espace du tirage : 2/97 n'est la valeur d'aucune probabilité de ce
 * générateur (dénominateurs ≤ 52), et 0,021 n'en arrondit aucune (seules 1/47, 1/48, 1/49 le
 * feraient, jamais tirées). */
const PLACEHOLDERS = ["ex : 2/97", "ex : 0,021"] as const;

function placeholder(i: number): string {
  return PLACEHOLDERS[i % 2];
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — jamais de décimal (CLAUDE.md). */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

/** Écriture décimale d'un rationnel positif num/den : exacte (« = ») si elle tient en 4 décimales
 * au plus, sinon arrondie (« ≈ ») au centième, ou au millième sous 0,1 — la règle annoncée. */
function decimalLatex(num: number, den: number): { exacte: boolean; latex: string } {
  const v = num / den;
  for (let d = 0; d <= 4; d++) {
    const m = v * Math.pow(10, d);
    if (Math.abs(m - Math.round(m)) < 1e-9) return { exacte: true, latex: v.toFixed(d).replace(".", "{,}") };
  }
  const d = v >= 0.1 ? 2 : 3;
  return { exacte: false, latex: v.toFixed(d).replace(".", "{,}") };
}

/** Probabilité exacte : fraction irréductible puis « = décimal » ou « ≈ décimal » (point 5 de
 * l'audit) ; un entier (0 ou 1) seul. */
export function formatProbaLatex(num: number, den: number): string {
  const frac = formatFractionLatex(num, den);
  if (num % den === 0) return frac;
  const { exacte, latex } = decimalLatex(num, den);
  return `${frac}${exacte ? "=" : "\\approx "}${latex}`;
}

// ============================================================================
// Famille A.
// ============================================================================

function nAetBbarA(ex: ExerciceFamilleA): number {
  return ex.nA - ex.nAetB;
}
function nAbaretBA(ex: ExerciceFamilleA): number {
  return ex.nB - ex.nAetB;
}
function nAbaretBbarA(ex: ExerciceFamilleA): number {
  return ex.denominateur - ex.nA - ex.nB + ex.nAetB;
}
function nAouBA(ex: ExerciceFamilleA): number {
  return ex.nA + ex.nB - ex.nAetB;
}

const LATEX_EVENEMENT: Record<EvenementTableauA, string> = {
  A: "A",
  Abar: "\\overline{A}",
  B: "B",
  Bbar: "\\overline{B}",
  AetB: "A\\cap B",
  AetBbar: "A\\cap\\overline{B}",
  AbaretB: "\\overline{A}\\cap B",
  AbaretBbar: "\\overline{A}\\cap\\overline{B}",
};

function estCompose(ev: EvenementTableauA): boolean {
  return ev.length > 4;
}

/** « X ∩ Y » en LaTeX, avec parenthèses autour d'un événement déjà composé. */
function latexIntersection(x: EvenementTableauA, y: EvenementTableauA): string {
  const p = (ev: EvenementTableauA) => (estCompose(ev) ? `(${LATEX_EVENEMENT[ev]})` : LATEX_EVENEMENT[ev]);
  return `${p(x)}\\cap ${p(y)}`;
}

function consigneGeneraleA(ex: ExerciceFamilleA): FragmentConsigne[] {
  return [texteFrag(ex.contexte.texte)];
}

function troisiemeDonneeLatexA(ex: ExerciceFamilleA): string {
  if (ex.troisiemeDonnee === "PAetB") return `P(A\\cap B)=${formatFractionLatex(ex.nAetB, ex.denominateur)}`;
  if (ex.troisiemeDonnee === "PAouB") return `P(A\\cup B)=${formatFractionLatex(nAouBA(ex), ex.denominateur)}`;
  return `P(\\overline{A}\\cap\\overline{B})=${formatFractionLatex(nAbaretBbarA(ex), ex.denominateur)}`;
}

function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`P(A)=${formatFractionLatex(ex.nA, ex.denominateur)}`, `P(B)=${formatFractionLatex(ex.nB, ex.denominateur)}`, troisiemeDonneeLatexA(ex)];
}

const LIBELLE_QUANTITE_ECRAN1: Record<CleQuantiteEcran1A, string> = {
  AouB: "P(A∪B) =",
  AetB: "P(A∩B) =",
  AetBbar: "P(A∩B̄) =",
  AbaretB: "P(Ā∩B) =",
  AbaretBbar: "P(Ā∩B̄) =",
};

function numerateurQuantiteEcran1(ex: ExerciceFamilleA, cle: CleQuantiteEcran1A): number {
  return cle === "AouB" ? nAouBA(ex) : cle === "AetB" ? ex.nAetB : cle === "AetBbar" ? nAetBbarA(ex) : cle === "AbaretB" ? nAbaretBA(ex) : nAbaretBbarA(ex);
}

/** Tableau de l'écran 1 : chaque case est un champ, sauf la case DONNÉE (A∩B ou Ā∩B̄). */
function tableauEcran1A(ex: ExerciceFamilleA): TableauSaisie {
  const cles = champsEcran1A(ex);
  const contenu = (cle: CleQuantiteEcran1A): ContenuCaseTableau => {
    const index = cles.indexOf(cle);
    return index >= 0 ? { type: "champ", index } : { type: "fixe", latex: formatFractionLatex(numerateurQuantiteEcran1(ex, cle), ex.denominateur) };
  };
  return {
    enTetesLignes: ["A", "\\overline{A}"],
    enTetesColonnes: ["B", "\\overline{B}"],
    cases: [
      [contenu("AetB"), contenu("AetBbar")],
      [contenu("AbaretB"), contenu("AbaretBbar")],
    ],
  };
}

const LATEX_INCLUSION_EXCLUSION = "P(A\\cup B)=P(A)+P(B)-P(A\\cap B)";

function tableauCorrectA(ex: ExerciceFamilleA): string[] {
  return [
    `P(A\\cap B)=${formatProbaLatex(ex.nAetB, ex.denominateur)}`,
    `P(A\\cap\\overline{B})=${formatProbaLatex(nAetBbarA(ex), ex.denominateur)}`,
    `P(\\overline{A}\\cap B)=${formatProbaLatex(nAbaretBA(ex), ex.denominateur)}`,
    `P(\\overline{A}\\cap\\overline{B})=${formatProbaLatex(nAbaretBbarA(ex), ex.denominateur)}`,
  ];
}

/** Libellé/latex/fraction exacte de la quantité demandée à l'écran 2. */
function infoDemandeEcran2A(ex: ExerciceFamilleA): { libelle: string; latexGauche: string; num: number; den: number } {
  switch (ex.demandeEcran2) {
    case "AetBbar":
      return { libelle: "P(A∩B̄)", latexGauche: "P(A\\cap\\overline{B})", num: nAetBbarA(ex), den: ex.denominateur };
    case "AbaretB":
      return { libelle: "P(Ā∩B)", latexGauche: "P(\\overline{A}\\cap B)", num: nAbaretBA(ex), den: ex.denominateur };
    case "condAsachantB":
      return { libelle: "P(A|B)", latexGauche: "P(A|B)", num: ex.nAetB, den: ex.nB };
    case "condBsachantA":
      return { libelle: "P(B|A)", latexGauche: "P(B|A)", num: ex.nAetB, den: ex.nA };
  }
}

function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): FragmentConsigne[] {
  if (phase === "aEcran1") {
    if (ex.troisiemeDonnee === "PAetB") {
      return [texteFrag("Calcule "), latexFrag("P(A\\cup B)"), texteFrag(" grâce à la relation d'inclusion-exclusion "), latexFrag(LATEX_INCLUSION_EXCLUSION), texteFrag(", puis complète les cases vides du tableau à double entrée (la case "), latexFrag("A\\cap B"), texteFrag(" est donnée)."), texteFrag(ANNONCE_PRECISION)];
    }
    if (ex.troisiemeDonnee === "PAouB") {
      return [texteFrag("Déduis "), latexFrag("P(A\\cap B)"), texteFrag(" de la relation d'inclusion-exclusion "), latexFrag(LATEX_INCLUSION_EXCLUSION), texteFrag(", puis complète les 4 cases du tableau à double entrée."), texteFrag(ANNONCE_PRECISION)];
    }
    return [texteFrag("Déduis "), latexFrag("P(A\\cup B)=1-P(\\overline{A}\\cap\\overline{B})"), texteFrag(", puis "), latexFrag("P(A\\cap B)"), texteFrag(" grâce à la relation d'inclusion-exclusion "), latexFrag(LATEX_INCLUSION_EXCLUSION), texteFrag(", et complète les cases vides du tableau à double entrée (la case "), latexFrag("\\overline{A}\\cap\\overline{B}"), texteFrag(" est donnée)."), texteFrag(ANNONCE_PRECISION)];
  }
  if (phase === "aEcran2") return [texteFrag("Calcule "), latexFrag(infoDemandeEcran2A(ex).latexGauche), texteFrag(" à partir du tableau complété."), texteFrag(ANNONCE_PRECISION)];
  if (ex.sousTypeEcran3 === "relation" && ex.paireEcran3) {
    const [x, y] = ex.paireEcran3;
    return [texteFrag("Les événements "), latexFrag(LATEX_EVENEMENT[x]), texteFrag(" et "), latexFrag(LATEX_EVENEMENT[y]), texteFrag(" sont-ils incompatibles, indépendants, ou ni l'un ni l'autre ?")];
  }
  return [texteFrag("Compare "), latexFrag("P(A|\\overline{B})"), texteFrag(" et "), latexFrag("P(A|B)"), texteFrag(" : laquelle est la plus grande, ou sont-elles égales ?")];
}

function etatActuelA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): string[] | null {
  if (phase === "aEcran1") return null;
  const table = tableauCorrectA(ex);
  if (phase === "aEcran2") return table;
  const { latexGauche, num, den } = infoDemandeEcran2A(ex);
  return [...table, `${latexGauche}=${formatProbaLatex(num, den)}`];
}

function champsA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (phase === "aEcran1") return champsEcran1A(ex).map((cle, i) => ({ label: LIBELLE_QUANTITE_ECRAN1[cle], placeholder: placeholder(i) }));
  return [{ label: `${infoDemandeEcran2A(ex).libelle} =`, placeholder: placeholder(0) }];
}

const OPTIONS_RELATION: OptionChoix[] = [
  { id: "incompatibles", label: "Incompatibles" },
  { id: "independants", label: "Indépendants" },
  { id: "ni_l_un_ni_l_autre", label: "Ni l'un ni l'autre" },
];

const OPTIONS_COMPARAISON: OptionChoix[] = [
  { id: "superieur", label: "P(A|B̄) > P(A|B)" },
  { id: "inferieur", label: "P(A|B̄) < P(A|B)" },
  { id: "egal", label: "P(A|B̄) = P(A|B)" },
];

function choixA(ex: ExerciceFamilleA): OptionChoix[] {
  return ex.sousTypeEcran3 === "relation" ? OPTIONS_RELATION : OPTIONS_COMPARAISON;
}

function aideNiveau1A(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Rappel : la relation d'inclusion-exclusion, et la lecture du tableau (les deux cases d'une ligne ont pour somme la probabilité de cette ligne, de même pour une colonne).", latex: `${LATEX_INCLUSION_EXCLUSION}\\qquad P(A\\cap B)+P(A\\cap\\overline{B})=P(A)` };
  if (phase === "aEcran2") return { texte: "Réutilise les cases du tableau : une probabilité d'intersection se lit dans une case ; une probabilité conditionnelle est le quotient d'une case par le total d'une ligne ou d'une colonne.", latex: null };
  if (ex.sousTypeEcran3 === "relation" && ex.paireEcran3) {
    const [x, y] = ex.paireEcran3;
    return { texte: "Incompatibles : les deux événements ne peuvent pas se produire en même temps (intersection vide). Indépendants : la probabilité de l'intersection est égale au produit des deux probabilités.", latex: `${latexIntersection(x, y)}=\\varnothing\\qquad\\qquad P(${latexIntersection(x, y)})=P(${LATEX_EVENEMENT[x]})\\cdot P(${LATEX_EVENEMENT[y]})` };
  }
  return { texte: "Calcule séparément les deux probabilités conditionnelles avant de les comparer.", latex: "P(A|\\overline{B})=\\dfrac{P(A\\cap\\overline{B})}{P(\\overline{B})}\\qquad P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}" };
}

function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  const N = ex.denominateur;
  const fA = formatFractionLatex(ex.nA, N);
  const fB = formatFractionLatex(ex.nB, N);
  if (phase === "aEcran1") {
    const latex =
      ex.troisiemeDonnee === "PAetB"
        ? `P(A\\cup B)=${fA}+${fB}-${formatFractionLatex(ex.nAetB, N)}`
        : ex.troisiemeDonnee === "PAouB"
          ? `${formatFractionLatex(nAouBA(ex), N)}=${fA}+${fB}-P(A\\cap B)`
          : `1-${formatFractionLatex(nAbaretBbarA(ex), N)}=${fA}+${fB}-P(A\\cap B)`;
    return { texte: "La relation, valeurs connues substituées (calcul non fait) :", latex };
  }
  if (phase === "aEcran2") {
    const latex =
      ex.demandeEcran2 === "AetBbar"
        ? "P(A\\cap\\overline{B})=P(A)-P(A\\cap B)"
        : ex.demandeEcran2 === "AbaretB"
          ? "P(\\overline{A}\\cap B)=P(B)-P(A\\cap B)"
          : ex.demandeEcran2 === "condAsachantB"
            ? "P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}"
            : "P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}";
    return { texte: "La formule à appliquer :", latex };
  }
  if (ex.sousTypeEcran3 === "relation" && ex.paireEcran3) {
    const [x, y] = ex.paireEcran3;
    return { texte: "Probabilités des deux événements, lues dans le tableau ; il reste à trouver celle de leur intersection, puis à conclure :", latex: `P(${LATEX_EVENEMENT[x]})=${formatFractionLatex(effectifEvenementA(ex, x), N)}\\qquad P(${LATEX_EVENEMENT[y]})=${formatFractionLatex(effectifEvenementA(ex, y), N)}` };
  }
  return {
    texte: "Les deux quotients, valeurs du tableau substituées (divisions non faites) :",
    latex: `P(A|\\overline{B})=\\dfrac{${formatFractionLatex(nAetBbarA(ex), N)}}{${formatFractionLatex(N - ex.nB, N)}}\\qquad P(A|B)=\\dfrac{${formatFractionLatex(ex.nAetB, N)}}{${fB}}`,
  };
}

/** Justification mathématique de la réponse de l'écran 3 (famille A) — jamais de prose en mode
 * math : le libellé du choix correct est fourni à part (`libelleChoixCorrect`). */
function justificationEcran3A(ex: ExerciceFamilleA): string[] {
  const N = ex.denominateur;
  if (ex.sousTypeEcran3 === "relation" && ex.paireEcran3) {
    const [x, y] = ex.paireEcran3;
    const inter = latexIntersection(x, y);
    const relation = relationPaireEcran3(ex);
    if (relation === "incompatibles") return [`${inter}=\\varnothing`];
    const nX = effectifEvenementA(ex, x);
    const nY = effectifEvenementA(ex, y);
    const nXY = effectifIntersectionA(ex, x, y);
    const produit = `P(${LATEX_EVENEMENT[x]})\\cdot P(${LATEX_EVENEMENT[y]})=${formatFractionLatex(nX, N)}\\cdot ${formatFractionLatex(nY, N)}=${formatFractionLatex(nX * nY, N * N)}`;
    const pInter = `P(${inter})=${formatFractionLatex(nXY, N)}`;
    return relation === "independants" ? [produit, pInter, `P(${inter})=P(${LATEX_EVENEMENT[x]})\\cdot P(${LATEX_EVENEMENT[y]})`] : [`${inter}\\neq\\varnothing`, produit, pInter, `P(${inter})\\neq P(${LATEX_EVENEMENT[x]})\\cdot P(${LATEX_EVENEMENT[y]})`];
  }
  const c = comparaisonConditionnellesA(ex);
  const signe = c === "egal" ? "=" : c === "superieur" ? ">" : "<";
  return [`P(A|\\overline{B})=${formatProbaLatex(nAetBbarA(ex), N - ex.nB)}`, `P(A|B)=${formatProbaLatex(ex.nAetB, ex.nB)}`, `P(A|\\overline{B})${signe}P(A|B)`];
}

// ============================================================================
// Famille B.
// ============================================================================

function consigneGeneraleB(ex: ExerciceFamilleB): FragmentConsigne[] {
  const situation = ex.sousType === "cartes" ? "On tire une carte au hasard dans un jeu de 52 cartes bien mélangé." : `On lance deux dés équilibrés à ${ex.facesParDe} faces.`;
  return [texteFrag(`${situation} A : ${ex.eventA.label}. B : ${ex.eventB.label}.`)];
}

function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`n(\\Omega)=${ex.denominateur}`];
}

function infoDemandeEcran2B(ex: ExerciceFamilleB): { libelle: string; symbole: string } {
  return ex.demandeEcran2 === "intersection" ? { libelle: "P(A∩B)", symbole: "P(A\\cap B)" } : { libelle: "P(A∪B)", symbole: "P(A\\cup B)" };
}

function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): FragmentConsigne[] {
  if (phase === "bEcran1") return [texteFrag("Calcule la probabilité de chacun des deux événements A et B."), texteFrag(ANNONCE_PRECISION)];
  if (phase === "bEcran2") {
    return ex.demandeEcran2 === "intersection"
      ? [texteFrag("Calcule "), latexFrag("P(A\\cap B)"), texteFrag(" en dénombrant les issues qui réalisent A et B à la fois."), texteFrag(ANNONCE_PRECISION)]
      : [texteFrag("Calcule "), latexFrag("P(A\\cup B)"), texteFrag(", par la relation d'inclusion-exclusion ou par dénombrement direct."), texteFrag(ANNONCE_PRECISION)];
  }
  if (phase === "bEcran3") return [texteFrag("Calcule la probabilité conditionnelle "), latexFrag("P(A|B)"), texteFrag("."), texteFrag(ANNONCE_PRECISION)];
  return [texteFrag("A et B sont-ils indépendants ? Vérifie-le par le calcul, ne te fie pas à une impression.")];
}

function etatActuelB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): string[] | null {
  if (phase === "bEcran1") return null;
  const base = [`P(A)=${formatProbaLatex(ex.eventA.count, ex.denominateur)}`, `P(B)=${formatProbaLatex(ex.eventB.count, ex.denominateur)}`];
  if (phase === "bEcran2") return base;
  const { symbole } = infoDemandeEcran2B(ex);
  const numEcran2 = ex.demandeEcran2 === "intersection" ? ex.countAetB : ex.eventA.count + ex.eventB.count - ex.countAetB;
  const avecEcran2 = [...base, `${symbole}=${formatProbaLatex(numEcran2, ex.denominateur)}`];
  if (phase === "bEcran3") return avecEcran2;
  return [...avecEcran2, `P(A|B)=${formatProbaLatex(ex.countAetB, ex.eventB.count)}`];
}

function champsB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "P(A) =", placeholder: placeholder(0) }, { label: "P(B) =", placeholder: placeholder(1) }];
  if (phase === "bEcran2") return [{ label: `${infoDemandeEcran2B(ex).libelle} =`, placeholder: placeholder(0) }];
  return [{ label: "P(A|B) =", placeholder: placeholder(0) }];
}

const OPTIONS_INDEPENDANCE: OptionChoix[] = [
  { id: "independants", label: "Indépendants" },
  { id: "non_independants", label: "Non indépendants" },
];

function aideNiveau1B(phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Compte les issues favorables à chaque événement, puis divise par le nombre d'issues de l'univers.", latex: "P(A)=\\dfrac{n(A)}{n(\\Omega)}" };
  if (phase === "bEcran2") return { texte: "Dénombre directement les issues communes, ou utilise la relation d'inclusion-exclusion :", latex: LATEX_INCLUSION_EXCLUSION };
  if (phase === "bEcran3") return { texte: "Rappel :", latex: "P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}" };
  return { texte: "Deux événements sont indépendants lorsque la probabilité de leur intersection est EXACTEMENT égale au produit de leurs probabilités.", latex: "P(A\\cap B)=P(A)\\cdot P(B)" };
}

function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  const N = ex.denominateur;
  if (phase === "bEcran1") return { texte: "Effectifs favorables (division non faite) :", latex: `n(A)=${ex.eventA.count}\\qquad n(B)=${ex.eventB.count}` };
  if (phase === "bEcran2") {
    return ex.demandeEcran2 === "intersection"
      ? { texte: "Écris la probabilité comme un quotient : issues qui réalisent A et B à la fois, sur toutes les issues.", latex: `P(A\\cap B)=\\dfrac{n(A\\cap B)}{${N}}` }
      : { texte: "Effectif de l'intersection, à utiliser dans la relation (calcul non fait) :", latex: `n(A\\cap B)=${ex.countAetB}` };
  }
  if (phase === "bEcran3") return { texte: "Valeurs connues, quotient non calculé :", latex: `P(A\\cap B)=${formatFractionLatex(ex.countAetB, N)}\\qquad P(B)=${formatFractionLatex(ex.eventB.count, N)}` };
  return { texte: "Les deux membres, écrits sur le même dénominateur (produits et comparaison non faits) :", latex: `P(A)\\cdot P(B)=\\dfrac{${ex.eventA.count}\\times ${ex.eventB.count}}{${N}^2}\\qquad P(A\\cap B)=\\dfrac{${ex.countAetB}\\times ${N}}{${N}^2}` };
}

function justificationEcran4B(ex: ExerciceFamilleB): string[] {
  const N = ex.denominateur;
  const produit = `P(A)\\cdot P(B)=${formatFractionLatex(ex.eventA.count, N)}\\cdot ${formatFractionLatex(ex.eventB.count, N)}=${formatFractionLatex(ex.eventA.count * ex.eventB.count, N * N)}`;
  const inter = `P(A\\cap B)=${formatFractionLatex(ex.countAetB, N)}`;
  return [produit, inter, independantsB(ex) ? "P(A\\cap B)=P(A)\\cdot P(B)" : "P(A\\cap B)\\neq P(A)\\cdot P(B)"];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceProbabilitesEnsembles): FragmentConsigne[] {
  return exercice.famille === "A" ? consigneGeneraleA(exercice) : consigneGeneraleB(exercice);
}

export function blocDonnees(exercice: ExerciceProbabilitesEnsembles): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): FragmentConsigne[] {
  return exercice.famille === "A" ? consigneEcranA(exercice, phase) : consigneEcranB(exercice, phase);
}

export function etatActuel(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

/** Vrai pour `aEcran3`/`bEcran4` — les 2 seuls écrans à CHOIX de ce générateur (voir en-tête de
 * fichier). `App6gen30.tsx` rend `EtapeChoixProbabilitesEnsembles` (via `choixEcran`) si vrai,
 * `EtapeChampsProbabilitesEnsembles` (via `champsEcran`) sinon. */
export function estEcranChoix(phase: PhaseProbabilitesEnsembles): boolean {
  return estPhaseChoix(phase);
}

/** Tableau à double entrée de l'écran 1 de la famille A (`null` ailleurs) : les champs qu'il
 * référence sont rendus DANS ses cases, les autres (P(A∪B)) au-dessus. */
export function tableauEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): TableauSaisie | null {
  return exercice.famille === "A" && phase === "aEcran1" ? tableauEcran1A(exercice) : null;
}

export function champsEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (estEcranChoix(phase)) return [];
  return exercice.famille === "A" ? champsA(exercice, phase as "aEcran1" | "aEcran2") : champsB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3");
}

export function choixEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): OptionChoix[] {
  if (!estEcranChoix(phase)) return [];
  return exercice.famille === "A" ? choixA(exercice) : OPTIONS_INDEPENDANCE;
}

export function aideNiveau1(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau1A(exercice, phase) : aideNiveau1B(phase);
}

export function aideNiveau2(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau2A(exercice, phase) : aideNiveau2B(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseProbabilitesEnsembles, string> = {
  aEcran1: "Étape 1 (tableau à double entrée)",
  aEcran2: "Étape 2 (probabilité dérivée)",
  aEcran3: "Étape 3 (déduction structurelle)",
  bEcran1: "Étape 1 (probabilités de base)",
  bEcran2: "Étape 2 (intersection/union)",
  bEcran3: "Étape 3 (probabilité conditionnelle)",
  bEcran4: "Étape 4 (indépendance)",
};

export const LIBELLE_FAMILLE: Record<ExerciceProbabilitesEnsembles["famille"], string> = {
  A: "A — Inclusion-exclusion, tableau à double entrée",
  B: "B — Cartes, dés et indépendance",
};

/** Libellé du choix correct d'un écran à choix (`null` pour un écran à saisie) — affiché en texte,
 * devant la justification mathématique de `formatReponseAttenduePhaseLatex`. */
export function libelleChoixCorrect(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string | null {
  if (!estPhaseChoix(phase)) return null;
  const id = exercice.famille === "A" ? (exercice.sousTypeEcran3 === "relation" ? relationPaireEcran3(exercice) : comparaisonConditionnellesA(exercice)) : independantsB(exercice) ? "independants" : "non_independants";
  return choixEcran(exercice, phase).find((o) => o.id === id)?.label ?? null;
}

/** Réponse CORRECTE de chaque écran, jamais recalculée depuis la saisie élève. Écran à saisie : les
 * valeurs attendues (fraction irréductible puis « ≈ décimal »). Écran à choix : la justification
 * mathématique (le libellé du choix, du texte, vient de `libelleChoixCorrect` — jamais de prose en
 * mode math). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") {
      const N = exercice.denominateur;
      const lignes = tableauCorrectA(exercice);
      return exercice.troisiemeDonnee === "PAetB" ? [`P(A\\cup B)=${formatProbaLatex(nAouBA(exercice), N)}`, ...lignes] : lignes;
    }
    if (phase === "aEcran2") {
      const { latexGauche, num, den } = infoDemandeEcran2A(exercice);
      return [`${latexGauche}=${formatProbaLatex(num, den)}`];
    }
    return justificationEcran3A(exercice);
  }
  if (phase === "bEcran1") return [`P(A)=${formatProbaLatex(exercice.eventA.count, exercice.denominateur)}`, `P(B)=${formatProbaLatex(exercice.eventB.count, exercice.denominateur)}`];
  if (phase === "bEcran2") {
    const { symbole } = infoDemandeEcran2B(exercice);
    const num = exercice.demandeEcran2 === "intersection" ? exercice.countAetB : exercice.eventA.count + exercice.eventB.count - exercice.countAetB;
    return [`${symbole}=${formatProbaLatex(num, exercice.denominateur)}`];
  }
  if (phase === "bEcran3") return [`P(A|B)=${formatProbaLatex(exercice.countAetB, exercice.eventB.count)}`];
  return justificationEcran4B(exercice);
}
