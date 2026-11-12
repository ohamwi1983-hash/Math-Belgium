import type { DescripteursTable, ExerciceFamilleAPannes, ExerciceFamilleAUnion, ExerciceFamilleBReconstruire, ExerciceFamilleBTableauDonne, ExerciceFamilleBTestIndependance, ExerciceFamilleC, ExerciceIndependanceBayes, TableauDouble, TypeQuestionTable, VerdictTestIndependance } from "../core6e/independanceBayes.types";
import type { PhaseIndependanceBayes } from "../moteur6e/typesIndependanceBayes";
import { bayesEcran3C, branchesArbreC, cellule00Reconstruire, cellule10Reconstruire, cellule20Reconstruire, effectifsTest, fractionDepuisTable, pBDeduitUnion, probabiliteEffetC, tableCompleteReconstruire, totauxLigneReconstruire, valeurEcran2Pannes, verdictTestIndependance } from "../moteur6e/verificationIndependanceBayes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage pour `6gen32`. Dispatch sur
 * `exercice.famille` PUIS `exercice.sousType`/`phase`. Toutes les quantités DÉRIVÉES affichées
 * réutilisent les fonctions de `moteur6e/verificationIndependanceBayes.ts` — JAMAIS recalculées ici.
 *
 * Conventions (audit 6e ch. 6) :
 * - aucune prose en mode mathématique : les fragments KaTeX ne contiennent que des symboles
 *   (A, Ā, c₁, E, L₁, C₁, n(·)…) ; les mots restent dans des fragments texte ;
 * - libellés de champs en notation propre (« P(c₁ ∩ E) = », jamais « P(cause1 ∩ effet) = ») ;
 * - placeholders SANS valeur numérique tirable (jamais « ex : 0,3 », qui peut être la réponse) ;
 * - décimaux affichés EXACTS (plus d'arrondi silencieux au centième des données : 0,6425 n'est plus
 *   affiché « 0,64 ») ; un résultat non décimal est affiché « ≈ » avec 4 décimales ;
 * - un seul écran à choix : `bIndepEcran2` (incompatibles / indépendants / ni l'un ni l'autre).
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface OptionChoix {
  id: string;
  label: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Texte brut mêlé à du LaTeX inline court, rendu via `components/RenduFragments.tsx`. Les fragments
 * "latex" ne contiennent QUE des symboles mathématiques courts (jamais un libellé français). */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function txt(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function ltx(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Table en lecture seule (données) — TEXTE BRUT, rendue comme un `<table>` HTML ordinaire.
 * `null` = case pas encore connue (affichée « ? »). */
export interface TableauAffichage {
  libelleLignes: string[];
  libelleColonnes: string[];
  cellules: (string | null)[][];
}

/** Placeholders hors de l'espace de tirage : la forme attendue, jamais une valeur d'exemple. La
 * règle d'arrondi est énoncée une fois, à la fin de la consigne générale (`NOTE_ARRONDI`). */
const PLACEHOLDER_PROBA = "fraction, décimal ou %";
const NOTE_ARRONDI = " Probabilités : valeur exacte, ou arrondie au centième (au millième si elle est inférieure à 0,1).";
const PLACEHOLDER_EFFECTIF = "nombre entier";

/** Décimal EXACT (les données sont des décimaux à 4 chiffres au plus), virgule française. */
function formatDecimal(v: number): string {
  return String(Math.round(v * 1e8) / 1e8).replace(".", "{,}");
}

function estDecimalCourt(v: number): boolean {
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-6;
}

/** « =0{,}1485 » si la valeur est un décimal à 4 chiffres au plus, « \approx 0{,}6667 » sinon. */
function egalLatex(v: number): string {
  return estDecimalCourt(v) ? `=${formatDecimal(v)}` : `\\approx ${formatDecimal(Math.round(v * 1e4) / 1e4)}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Fraction irréductible d'effectifs entiers. */
function fracLatex(num: number, den: number): string {
  const g = pgcd(num, den) || 1;
  const n = num / g;
  const d = den / g;
  return d === 1 ? String(n) : `\\dfrac{${n}}{${d}}`;
}

/** « \dfrac{23}{97}\approx 0{,}2371 » (ou « \dfrac{1}{4}=0{,}25 »). */
function fracEtDecimalLatex(num: number, den: number): string {
  const f = fracLatex(num, den);
  return f.startsWith("\\dfrac") ? `${f}${egalLatex(num / den)}` : f;
}

// ============================================================================
// Famille A — sous-type "pannes".
// ============================================================================

/** Symboles courts A₁/A₂ dans TOUT fragment KaTeX — jamais `labelElement1`/`labelPanne` (des phrases)
 * en mode mathématique. La définition de A₁/A₂ (en prose) est donnée UNE FOIS ici. */
function consigneGeneraleAPannes(ex: ExerciceFamilleAPannes): FragmentConsigne[] {
  return [
    txt(`${ex.contexte.texte} `),
    ltx("A_1"),
    txt(` : ${ex.contexte.labelElement1} ${ex.contexte.labelPanne}. `),
    ltx("A_2"),
    txt(` : ${ex.contexte.labelElement2} ${ex.contexte.labelPanne}.`),
  ];
}

function blocDonneesAPannes(ex: ExerciceFamilleAPannes): string[] {
  return [`P(A_1)=${formatDecimal(ex.p1)}`, `P(A_2)=${formatDecimal(ex.p2)}`];
}

const LIBELLE_DEMANDE_PANNES: Record<ExerciceFamilleAPannes["demandeEcran2"], string> = {
  lesDeux: "que les deux événements se produisent",
  aucun: "qu'aucun des deux événements ne se produise",
  auMoinsUn: "qu'au moins un des deux événements se produise",
  exactementUn: "qu'exactement un des deux événements se produise",
};

const NOTATION_DEMANDE_PANNES: Record<ExerciceFamilleAPannes["demandeEcran2"], string> = {
  lesDeux: "P(A_1\\cap A_2)",
  aucun: "P(\\overline{A_1}\\cap\\overline{A_2})",
  auMoinsUn: "P(A_1\\cup A_2)",
  exactementUn: "P(A_1\\cap\\overline{A_2})+P(\\overline{A_1}\\cap A_2)",
};

function consigneEcranAPannes(ex: ExerciceFamilleAPannes, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (phase === "aPannesEcran1") {
    return [
      txt("Calcule les probabilités complémentaires "),
      ltx("P(\\overline{A_1})"),
      txt(" et "),
      ltx("P(\\overline{A_2})"),
      txt(` : la probabilité que ${ex.contexte.labelElement1} ${ex.contexte.labelPanneNegatif}, et que ${ex.contexte.labelElement2} ${ex.contexte.labelPanneNegatif}.`),
    ];
  }
  return [txt(`Calcule la probabilité ${LIBELLE_DEMANDE_PANNES[ex.demandeEcran2]}.`)];
}

function champsAPannes(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "aPannesEcran1") {
    return [
      { label: "P(Ā₁) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(Ā₂) =", placeholder: PLACEHOLDER_PROBA },
    ];
  }
  return [{ label: "Probabilité demandée =", placeholder: PLACEHOLDER_PROBA }];
}

function aideNiveau1APannes(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aPannesEcran1") return { texte: "Rappel : probabilité de l'événement contraire.", latex: "P(\\overline{A})=1-P(A)" };
  return { texte: "Deux événements indépendants : la probabilité que les DEUX se produisent est le PRODUIT de leurs probabilités — même règle avec les événements contraires.", latex: "P(A_1\\cap A_2)=P(A_1)\\cdot P(A_2)" };
}

function aideNiveau2APannes(ex: ExerciceFamilleAPannes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aPannesEcran1") return { texte: "Valeurs connues, soustraction non faite :", latex: `1-${formatDecimal(ex.p1)}\\qquad 1-${formatDecimal(ex.p2)}` };
  if (ex.demandeEcran2 !== "exactementUn") return { texte: "Calcul à effectuer (facteurs connus, calcul non fait) :", latex: latexProduitPannes(ex) };
  return { texte: "Deux cas incompatibles (A₁ seul, ou A₂ seul) : deux produits, PUIS leur somme.", latex: NOTATION_DEMANDE_PANNES.exactementUn };
}

function latexProduitPannes(ex: ExerciceFamilleAPannes): string {
  const p1 = formatDecimal(ex.p1);
  const p2 = formatDecimal(ex.p2);
  const q1 = formatDecimal(1 - ex.p1);
  const q2 = formatDecimal(1 - ex.p2);
  if (ex.demandeEcran2 === "lesDeux") return `${p1}\\cdot ${p2}`;
  if (ex.demandeEcran2 === "aucun") return `${q1}\\cdot ${q2}`;
  return `1-${q1}\\cdot ${q2}`;
}

// ============================================================================
// Famille A — sous-type "unionIndependance".
// ============================================================================

function consigneGeneraleAUnion(ex: ExerciceFamilleAUnion): FragmentConsigne[] {
  return [txt(ex.contexte.texte)];
}

function blocDonneesAUnion(ex: ExerciceFamilleAUnion): string[] {
  return [`P(A)=${formatDecimal(ex.pA)}`, `P(A\\cup B)=${formatDecimal(ex.pAouB)}`];
}

function consigneEcranAUnion(phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (phase === "aUnionEcran1") {
    return [txt("Calcule "), ltx("P(\\overline{A})"), txt(" — il servira à résoudre l'équation de l'étape suivante.")];
  }
  if (phase === "aUnionEcran2") {
    return [txt("Résous "), ltx("P(A\\cup B)=P(A)+P(B)-P(A)\\cdot P(B)"), txt(" pour trouver "), ltx("P(B)"), txt(".")];
  }
  return [txt("Calcule "), ltx("P(A|B)"), txt(" et "), ltx("P(B|A)"), txt(".")];
}

function champsAUnion(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "aUnionEcran1") return [{ label: "P(Ā) =", placeholder: PLACEHOLDER_PROBA }];
  if (phase === "aUnionEcran2") return [{ label: "P(B) =", placeholder: PLACEHOLDER_PROBA }];
  return [
    { label: "P(A | B) =", placeholder: PLACEHOLDER_PROBA },
    { label: "P(B | A) =", placeholder: PLACEHOLDER_PROBA },
  ];
}

function aideNiveau1AUnion(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aUnionEcran1") return { texte: "Rappel : probabilité de l'événement contraire.", latex: "P(\\overline{A})=1-P(A)" };
  if (phase === "aUnionEcran2") return { texte: "Rappel : probabilité d'une union, avec l'indépendance pour l'intersection.", latex: "P(A\\cup B)=P(A)+P(B)-P(A)\\cdot P(B)" };
  return { texte: "Rappel : si A et B sont indépendants, savoir que l'un est réalisé ne change pas la probabilité de l'autre.", latex: "P(A|B)=P(A)\\qquad P(B|A)=P(B)" };
}

function aideNiveau2AUnion(ex: ExerciceFamilleAUnion, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "aUnionEcran1") return { texte: "Valeur connue, soustraction non faite :", latex: `1-${formatDecimal(ex.pA)}` };
  if (phase === "aUnionEcran2") return { texte: "Équation posée, valeurs connues substituées (résolution non faite) — regroupe les termes en P(B) :", latex: `${formatDecimal(ex.pAouB)}=${formatDecimal(ex.pA)}+P(B)-${formatDecimal(ex.pA)}\\cdot P(B)` };
  return { texte: "Le calcul complet par la définition de la probabilité conditionnelle, avec l'indépendance au numérateur, se simplifie :", latex: "P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{P(A)\\cdot P(B)}{P(B)}" };
}

// ============================================================================
// Famille B — sous-type "testIndependance".
// ============================================================================

function consigneGeneraleBIndep(ex: ExerciceFamilleBTestIndependance): FragmentConsigne[] {
  return [txt(`${ex.contexte.texte} `), ltx("A"), txt(` : ${ex.contexte.definitionA}. `), ltx("B"), txt(` : ${ex.contexte.definitionB}.`)];
}

function tableauBIndep(ex: ExerciceFamilleBTestIndependance): TableauAffichage {
  return { libelleLignes: ["A", "Ā"], libelleColonnes: ["B", "B̄"], cellules: ex.cellules.map((ligne) => ligne.map((v) => String(v))) };
}

function consigneEcranBIndep(ex: ExerciceFamilleBTestIndependance, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (phase === "bIndepEcran1") {
    return ex.methode === "produit"
      ? [txt("Calcule "), ltx("P(A)"), txt(", "), ltx("P(B)"), txt(" et "), ltx("P(A\\cap B)"), txt(".")]
      : [txt("Calcule "), ltx("P(A)"), txt(" et "), ltx("P(A|B)"), txt(".")];
  }
  return [
    txt("Compare "),
    ...(ex.methode === "produit" ? [ltx("P(A\\cap B)"), txt(" et "), ltx("P(A)\\cdot P(B)")] : [ltx("P(A|B)"), txt(" et "), ltx("P(A)")]),
    txt(", puis conclus : les événements A et B sont-ils incompatibles, indépendants, ou ni l'un ni l'autre ?"),
  ];
}

function champsBIndep(ex: ExerciceFamilleBTestIndependance): ChampDef[] {
  if (ex.methode === "produit") {
    return [
      { label: "P(A) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(B) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(A ∩ B) =", placeholder: PLACEHOLDER_PROBA },
    ];
  }
  return [
    { label: "P(A) =", placeholder: PLACEHOLDER_PROBA },
    { label: "P(A | B) =", placeholder: PLACEHOLDER_PROBA },
  ];
}

const OPTIONS_VERDICT: OptionChoix[] = [
  { id: "incompatibles", label: "A et B sont incompatibles" },
  { id: "independants", label: "A et B sont indépendants" },
  { id: "ni", label: "Ni l'un ni l'autre" },
];

function aideNiveau1BIndep(ex: ExerciceFamilleBTestIndependance, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bIndepEcran1") {
    return ex.methode === "produit"
      ? { texte: "Chaque probabilité est un effectif divisé par l'effectif total n :", latex: "P(A)=\\dfrac{n(A)}{n}\\qquad P(A\\cap B)=\\dfrac{n(A\\cap B)}{n}" }
      : { texte: "Pour la probabilité conditionnelle, on ne choisit que parmi les individus de B :", latex: "P(A)=\\dfrac{n(A)}{n}\\qquad P(A|B)=\\dfrac{n(A\\cap B)}{n(B)}" };
  }
  return { texte: "Incompatibles : la première égalité. Indépendants : la deuxième (ou la troisième, qui lui est équivalente).", latex: "P(A\\cap B)=0\\qquad P(A\\cap B)=P(A)\\cdot P(B)\\qquad P(A|B)=P(A)" };
}

function aideNiveau2BIndep(ex: ExerciceFamilleBTestIndependance, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bIndepEcran1") {
    return { texte: "Méthode : n(A) est le total de la ligne A (somme de ses deux cases), n(B) le total de la colonne B, n(A ∩ B) la case au croisement de la ligne A et de la colonne B, et n la somme des quatre cases.", latex: null };
  }
  return ex.methode === "produit"
    ? { texte: "Regarde d'abord si l'intersection est vide. Sinon, calcule le produit avec les valeurs EXACTES de l'étape 1 (garde les fractions, n'arrondis pas) : l'égalité doit être exacte.", latex: "P(A)\\cdot P(B)\\overset{?}{=}P(A\\cap B)" }
    : { texte: "Regarde d'abord si l'intersection est vide. Sinon, compare les valeurs EXACTES de l'étape 1 (garde les fractions, n'arrondis pas) : l'égalité doit être exacte.", latex: "P(A|B)\\overset{?}{=}P(A)" };
}

function reponseBIndep(ex: ExerciceFamilleBTestIndependance, phase: PhaseIndependanceBayes): string[] {
  const { n, nA, nB, nAetB } = effectifsTest(ex);
  if (phase === "bIndepEcran1") {
    return ex.methode === "produit"
      ? [`P(A)=${fracLatex(nA, n)}`, `P(B)=${fracLatex(nB, n)}`, `P(A\\cap B)=${fracLatex(nAetB, n)}`]
      : [`P(A)=${fracLatex(nA, n)}`, `P(A|B)=${fracLatex(nAetB, nB)}`];
  }
  const verdict: VerdictTestIndependance = verdictTestIndependance(ex);
  if (verdict === "incompatibles") return ["P(A\\cap B)=0"];
  if (ex.methode === "produit") {
    const produit = `P(A)\\cdot P(B)=${fracLatex(nA * nB, n * n)}`;
    return verdict === "independants" ? [`${produit}=P(A\\cap B)`] : ["P(A\\cap B)\\neq 0", `${produit}\\neq P(A\\cap B)`];
  }
  return verdict === "independants" ? [`P(A|B)=${fracLatex(nAetB, nB)}=P(A)`] : ["P(A\\cap B)\\neq 0", `P(A|B)=${fracLatex(nAetB, nB)}\\neq P(A)`];
}

// ============================================================================
// Famille B — question sur un tableau à double entrée (partagée tableauDonne / reconstruire).
// ============================================================================

/** Formule la question EN FRANÇAIS, sans annoncer sa nature (jointe, marginale, conditionnelle) —
 * c'est précisément ce que l'élève doit reconnaître (audit 6e ch. 6). */
function questionTable(d: DescripteursTable, type: TypeQuestionTable, ligne: number, colonne: number): string {
  const qu = d.pronom.startsWith("e") || d.pronom.startsWith("i") ? `qu'${d.pronom}` : `que ${d.pronom}`;
  const l = d.lignes[ligne];
  const c = d.colonnes[colonne];
  const auHasard = `On choisit ${d.individu} au hasard.`;
  switch (type) {
    case "jointe":
      return `${auHasard} Quelle est la probabilité ${qu} ${l.sujet} et ${qu} ${c.sujet} ?`;
    case "margLigne":
      return `${auHasard} Quelle est la probabilité ${qu} ${l.sujet} ?`;
    case "margColonne":
      return `${auHasard} Quelle est la probabilité ${qu} ${c.sujet} ?`;
    case "condLigneSachantColonne":
      return `On choisit au hasard l'un des ${c.groupe}. Quelle est la probabilité ${qu} ${l.sujet} ?`;
    case "condColonneSachantLigne":
      return `On choisit au hasard l'un des ${l.groupe}. Quelle est la probabilité ${qu} ${c.sujet} ?`;
  }
}

const AIDE1_TABLE: AideAvecLatex = {
  texte: "Une probabilité, c'est le nombre de cas favorables divisé par le nombre de cas possibles — et les cas possibles sont les individus PARMI LESQUELS on choisit.",
  latex: null,
};

const AIDE2_TABLE: AideAvecLatex = {
  texte: "Méthode : 1) Parmi qui choisit-on ? Dans tout le tableau (le dénominateur est le total général), ou seulement dans une ligne ou une colonne quand l'énoncé dit « l'un des … » (le dénominateur est le total de cette ligne ou colonne). 2) Dans ce groupe, combien vérifient ce qui est demandé ? C'est le numérateur.",
  latex: null,
};

function reponseTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): string {
  const [num, den] = fractionDepuisTable(t, type, ligne, colonne);
  return `p=${fracEtDecimalLatex(num, den)}`;
}

// ============================================================================
// Famille B — sous-type "tableauDonne".
// ============================================================================

function tableauBTable(ex: ExerciceFamilleBTableauDonne): TableauAffichage {
  return { libelleLignes: ex.table.libelleLignes, libelleColonnes: ex.table.libelleColonnes, cellules: ex.table.cellules.map((ligne) => ligne.map((v) => String(v))) };
}

function blocDonneesBTable(ex: ExerciceFamilleBTableauDonne): string[] {
  const total = ex.table.cellules.reduce((acc, l) => acc + l.reduce((a, b) => a + b, 0), 0);
  return [`n=${total}`];
}

function consigneEcranBTable(ex: ExerciceFamilleBTableauDonne): FragmentConsigne[] {
  return [txt(questionTable(ex.contexte.descripteurs, ex.typeQuestion, ex.ligneCible, ex.colonneCible))];
}

// ============================================================================
// Famille B — sous-type "tableauReconstruire" (lignes L₁, L₂, L₃ ; colonnes C₁, C₂).
// ============================================================================

const INDICES = ["₁", "₂", "₃"];

function consigneGeneraleBRecon(ex: ExerciceFamilleBReconstruire): FragmentConsigne[] {
  const [l1, l2, l3] = ex.contexte.libelleLignes;
  const [c1, c2] = ex.contexte.libelleColonnes;
  const [p1, p2, p3] = ex.pourcentageLigne;
  return [
    txt(`${ex.contexte.texte} On note `),
    ltx("L_1"),
    txt(` : «\u00a0${l1}\u00a0», `),
    ltx("L_2"),
    txt(` : «\u00a0${l2}\u00a0», `),
    ltx("L_3"),
    txt(` : «\u00a0${l3}\u00a0», `),
    ltx("C_1"),
    txt(` : «\u00a0${c1}\u00a0» et `),
    ltx("C_2"),
    txt(` : «\u00a0${c2}\u00a0». On sait que `),
    ltx("L_1"),
    txt(`, `),
    ltx("L_2"),
    txt(" et "),
    ltx("L_3"),
    txt(` représentent respectivement ${p1}\u00a0%, ${p2}\u00a0% et ${p3}\u00a0% de l'effectif total ; ${ex.pourcentageReussiteLigne1}\u00a0% de `),
    ltx("L_1"),
    txt(` et ${ex.pourcentageReussiteLigne2}\u00a0% de `),
    ltx("L_2"),
    txt(" sont dans "),
    ltx("C_1"),
    txt(` ; au total, ${ex.pourcentageReussiteGlobale}\u00a0% de l'effectif est dans `),
    ltx("C_1"),
    txt("."),
  ];
}

function blocDonneesBRecon(ex: ExerciceFamilleBReconstruire): string[] {
  return [`N=${ex.total}`];
}

function libellesLignesRecon(ex: ExerciceFamilleBReconstruire): string[] {
  return ex.contexte.libelleLignes.map((l, i) => `${l} (L${INDICES[i]})`);
}
function libellesColonnesRecon(ex: ExerciceFamilleBReconstruire): string[] {
  return ex.contexte.libelleColonnes.map((c, j) => `${c} (C${INDICES[j]})`);
}

/** Tableau des cases déjà connues — affiché aux écrans 2 et 3 (à côté des données). */
function tableauEtatActuelBRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): TableauAffichage | null {
  if (phase === "bReconEcran1") return null;
  const [r0, r1, r2] = totauxLigneReconstruire(ex);
  const colonnes = [...libellesColonnesRecon(ex), "Total"];
  if (phase === "bReconEcran2") {
    return {
      libelleLignes: libellesLignesRecon(ex),
      libelleColonnes: colonnes,
      cellules: [
        [String(cellule00Reconstruire(ex)), null, String(r0)],
        [String(cellule10Reconstruire(ex)), null, String(r1)],
        [null, null, String(r2)],
      ],
    };
  }
  const table = tableCompleteReconstruire(ex);
  const totauxLigne = [r0, r1, r2];
  return { libelleLignes: libellesLignesRecon(ex), libelleColonnes: colonnes, cellules: table.cellules.map((ligne, i) => [...ligne.map((v) => String(v)), String(totauxLigne[i])]) };
}

function consigneEcranBRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (phase === "bReconEcran1") return [txt("Traduis les pourcentages en effectifs : le total de chaque ligne, puis les deux cases de la colonne "), ltx("C_1"), txt(" directement calculables.")];
  if (phase === "bReconEcran2") return [txt("Complète les cases restantes par différence : chaque ligne et la colonne "), ltx("C_1"), txt(" doivent redonner leur total.")];
  return [txt(`Utilise le tableau reconstruit. ${questionTable(ex.contexte.descripteurs, ex.typeQuestionFinale, ex.ligneCibleFinale, ex.colonneCibleFinale)}`)];
}

function champsBRecon(phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "bReconEcran1") {
    return [
      { label: "n(L₁) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₂) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₃) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₁ ∩ C₁) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₂ ∩ C₁) =", placeholder: PLACEHOLDER_EFFECTIF },
    ];
  }
  if (phase === "bReconEcran2") {
    return [
      { label: "n(L₃ ∩ C₁) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₁ ∩ C₂) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₂ ∩ C₂) =", placeholder: PLACEHOLDER_EFFECTIF },
      { label: "n(L₃ ∩ C₂) =", placeholder: PLACEHOLDER_EFFECTIF },
    ];
  }
  return [{ label: "Probabilité =", placeholder: PLACEHOLDER_PROBA }];
}

function aideNiveau1BRecon(phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bReconEcran1") return { texte: "p % de l'effectif total N, cela représente :", latex: "\\dfrac{p}{100}\\times N" };
  if (phase === "bReconEcran2") return { texte: "Le total de la colonne C₁ se déduit de son pourcentage global ; chaque ligne doit redonner son total.", latex: "n(L_1\\cap C_1)+n(L_1\\cap C_2)=n(L_1)" };
  return AIDE1_TABLE;
}

function aideNiveau2BRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "bReconEcran1") return { texte: "Attention : un pourcentage « de L₁ » s'applique au total de L₁, pas à N.", latex: `n(L_1\\cap C_1)=\\dfrac{${ex.pourcentageReussiteLigne1}}{100}\\times n(L_1)` };
  if (phase === "bReconEcran2") return { texte: "La case manquante de C₁ s'obtient par différence avec le total de la colonne :", latex: "n(L_3\\cap C_1)=n(C_1)-n(L_1\\cap C_1)-n(L_2\\cap C_1)" };
  return AIDE2_TABLE;
}

function reponseBRecon(ex: ExerciceFamilleBReconstruire, phase: PhaseIndependanceBayes): string[] {
  if (phase === "bReconEcran1") {
    const [r0, r1, r2] = totauxLigneReconstruire(ex);
    return [`n(L_1)=${r0}`, `n(L_2)=${r1}`, `n(L_3)=${r2}`, `n(L_1\\cap C_1)=${cellule00Reconstruire(ex)}`, `n(L_2\\cap C_1)=${cellule10Reconstruire(ex)}`];
  }
  const table = tableCompleteReconstruire(ex);
  if (phase === "bReconEcran2") return [`n(L_3\\cap C_1)=${cellule20Reconstruire(ex)}`, `n(L_1\\cap C_2)=${table.cellules[0][1]}`, `n(L_2\\cap C_2)=${table.cellules[1][1]}`, `n(L_3\\cap C_2)=${table.cellules[2][1]}`];
  return [reponseTable(table, ex.typeQuestionFinale, ex.ligneCibleFinale, ex.colonneCibleFinale)];
}

// ============================================================================
// Famille C — arbre et théorème de Bayes (symboles c₁, c₂, E).
// ============================================================================

function consigneGeneraleC(ex: ExerciceFamilleC): FragmentConsigne[] {
  return [
    txt(`${ex.contexte.texte} `),
    ltx("c_1"),
    txt(` : ${ex.contexte.labelCause1}. `),
    ltx("c_2"),
    txt(` : ${ex.contexte.labelCause2}. `),
    ltx("E"),
    txt(` : ${ex.contexte.labelEffet}.`),
  ];
}

function blocDonneesC(ex: ExerciceFamilleC): string[] {
  return [`P(c_1)=${formatDecimal(ex.p)}`, `P(E|c_1)=${formatDecimal(ex.q1)}`, `P(E|c_2)=${formatDecimal(ex.q2)}`];
}

function consigneEcranC(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (phase === "cEcran1") return [txt("Construis l'arbre : calcule les probabilités des 4 branches finales.")];
  if (phase === "cEcran2") return [txt("Calcule "), ltx("P(E)"), txt(" par la formule des probabilités totales.")];
  return [txt("Applique le théorème de Bayes pour calculer "), ltx(ex.demandeEcran3 === "cause1SachantEffet" ? "P(c_1|E)" : "P(c_1|\\overline{E})"), txt(".")];
}

function champsC(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): ChampDef[] {
  if (phase === "cEcran1") {
    return [
      { label: "P(c₁ ∩ E) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(c₁ ∩ Ē) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(c₂ ∩ E) =", placeholder: PLACEHOLDER_PROBA },
      { label: "P(c₂ ∩ Ē) =", placeholder: PLACEHOLDER_PROBA },
    ];
  }
  if (phase === "cEcran2") return [{ label: "P(E) =", placeholder: PLACEHOLDER_PROBA }];
  return [{ label: ex.demandeEcran3 === "cause1SachantEffet" ? "P(c₁ | E) =" : "P(c₁ | Ē) =", placeholder: PLACEHOLDER_PROBA }];
}

function aideNiveau1C(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Chaque branche finale : on multiplie les probabilités rencontrées le long du chemin.", latex: "P(c_1\\cap E)=P(c_1)\\cdot P(E|c_1)" };
  if (phase === "cEcran2") return { texte: "Rappel de la formule des probabilités totales :", latex: "P(E)=P(c_1\\cap E)+P(c_2\\cap E)" };
  return ex.demandeEcran3 === "cause1SachantEffet"
    ? { texte: "Rappel de la formule de Bayes :", latex: "P(c_1|E)=\\dfrac{P(c_1\\cap E)}{P(E)}" }
    : { texte: "Rappel de la formule de Bayes (avec l'événement contraire de E) :", latex: "P(c_1|\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}" };
}

function aideNiveau2C(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): AideAvecLatex {
  const p = formatDecimal(ex.p);
  const q1 = formatDecimal(ex.q1);
  if (phase === "cEcran1") return { texte: "Une branche complète (les trois autres suivent le même principe, avec les probabilités contraires) :", latex: `P(c_1\\cap E)=${p}\\times ${q1}` };
  if (phase === "cEcran2") return { texte: "Valeurs connues substituées (calcul non fait) :", latex: `${p}\\times ${q1}+(1-${p})\\times ${formatDecimal(ex.q2)}` };
  const [b1, b2] = branchesArbreC(ex);
  const pE = probabiliteEffetC(ex);
  return ex.demandeEcran3 === "cause1SachantEffet"
    ? { texte: "Numérateur (branche de l'arbre) et dénominateur (étape précédente), division non faite :", latex: `\\dfrac{${formatDecimal(b1)}}{${formatDecimal(pE)}}` }
    : { texte: "Numérateur (branche de l'arbre) et dénominateur (contraire de l'étape précédente), division non faite :", latex: `\\dfrac{${formatDecimal(b2)}}{1-${formatDecimal(pE)}}` };
}

function reponseC(ex: ExerciceFamilleC, phase: PhaseIndependanceBayes): string[] {
  if (phase === "cEcran1") {
    const [b1, b2, b3, b4] = branchesArbreC(ex);
    return [`P(c_1\\cap E)${egalLatex(b1)}`, `P(c_1\\cap\\overline{E})${egalLatex(b2)}`, `P(c_2\\cap E)${egalLatex(b3)}`, `P(c_2\\cap\\overline{E})${egalLatex(b4)}`];
  }
  if (phase === "cEcran2") return [`P(E)${egalLatex(probabiliteEffetC(ex))}`];
  const libelle = ex.demandeEcran3 === "cause1SachantEffet" ? "P(c_1|E)" : "P(c_1|\\overline{E})";
  return [`${libelle}${egalLatex(bayesEcran3C(ex))}`];
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIndependanceBayes): FragmentConsigne[] {
  return [...consigneGeneraleSansNote(exercice), txt(NOTE_ARRONDI)];
}

function consigneGeneraleSansNote(exercice: ExerciceIndependanceBayes): FragmentConsigne[] {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? consigneGeneraleAPannes(exercice) : consigneGeneraleAUnion(exercice);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return consigneGeneraleBIndep(exercice);
    if (exercice.sousType === "tableauDonne") return [txt(exercice.contexte.texte)];
    return consigneGeneraleBRecon(exercice);
  }
  return consigneGeneraleC(exercice);
}

export function blocDonnees(exercice: ExerciceIndependanceBayes): string[] {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? blocDonneesAPannes(exercice) : blocDonneesAUnion(exercice);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return [];
    if (exercice.sousType === "tableauDonne") return blocDonneesBTable(exercice);
    return blocDonneesBRecon(exercice);
  }
  return blocDonneesC(exercice);
}

/** Table de données affichée à côté de `blocDonnees` — `null` si la famille/sous-type n'en a pas. */
export function tableauDonnees(exercice: ExerciceIndependanceBayes): TableauAffichage | null {
  if (exercice.famille !== "B") return null;
  if (exercice.sousType === "testIndependance") return tableauBIndep(exercice);
  if (exercice.sousType === "tableauDonne") return tableauBTable(exercice);
  return null;
}

/** Table « cases déjà connues » — UNIQUEMENT pour "tableauReconstruire" (écrans 2 et 3). */
export function tableauEtatActuel(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): TableauAffichage | null {
  if (exercice.famille !== "B" || exercice.sousType !== "tableauReconstruire") return null;
  return tableauEtatActuelBRecon(exercice, phase);
}

export function consigneEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? consigneEcranAPannes(exercice, phase) : consigneEcranAUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return consigneEcranBIndep(exercice, phase);
    if (exercice.sousType === "tableauDonne") return consigneEcranBTable(exercice);
    return consigneEcranBRecon(exercice, phase);
  }
  return consigneEcranC(exercice, phase);
}

/** Seul écran à choix fermé du générateur (une seule tentative, voir `sessionIndependanceBayes.ts`). */
export function estEcranChoix(phase: PhaseIndependanceBayes): boolean {
  return phase === "bIndepEcran2";
}

export function choixEcran(_exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): OptionChoix[] {
  return estEcranChoix(phase) ? OPTIONS_VERDICT : [];
}

export function champsEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): ChampDef[] {
  if (estEcranChoix(phase)) return [];
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? champsAPannes(phase) : champsAUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return champsBIndep(exercice);
    if (exercice.sousType === "tableauDonne") return [{ label: "Probabilité =", placeholder: PLACEHOLDER_PROBA }];
    return champsBRecon(phase);
  }
  return champsC(exercice, phase);
}

export function aideNiveau1(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? aideNiveau1APannes(phase) : aideNiveau1AUnion(phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return aideNiveau1BIndep(exercice, phase);
    if (exercice.sousType === "tableauDonne") return AIDE1_TABLE;
    return aideNiveau1BRecon(phase);
  }
  return aideNiveau1C(exercice, phase);
}

export function aideNiveau2(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): AideAvecLatex {
  if (exercice.famille === "A") return exercice.sousType === "pannes" ? aideNiveau2APannes(exercice, phase) : aideNiveau2AUnion(exercice, phase);
  if (exercice.famille === "B") {
    if (exercice.sousType === "testIndependance") return aideNiveau2BIndep(exercice, phase);
    if (exercice.sousType === "tableauDonne") return AIDE2_TABLE;
    return aideNiveau2BRecon(exercice, phase);
  }
  return aideNiveau2C(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseIndependanceBayes, string> = {
  aPannesEcran1: "Étape 1 (compléments)",
  aPannesEcran2: "Étape 2 (combinaison demandée)",
  aUnionEcran1: "Étape 1 (P(Ā))",
  aUnionEcran2: "Étape 2 (P(B) déduit)",
  aUnionEcran3: "Étape 3 (conditionnelles et indépendance)",
  bIndepEcran1: "Étape 1 (probabilités lues dans le tableau)",
  bIndepEcran2: "Étape 2 (incompatibles, indépendants ou ni l'un ni l'autre)",
  bTableEcran1: "Étape unique (lecture du tableau)",
  bReconEcran1: "Étape 1 (cases directement calculables)",
  bReconEcran2: "Étape 2 (cases déduites par différence)",
  bReconEcran3: "Étape 3 (lecture du tableau reconstruit)",
  cEcran1: "Étape 1 (arbre de probabilité)",
  cEcran2: "Étape 2 (probabilités totales)",
  cEcran3: "Étape 3 (théorème de Bayes)",
};

export const LIBELLE_FAMILLE_SOUS_TYPE: Record<string, string> = {
  "A-pannes": "A — Indépendance : pannes",
  "A-unionIndependance": "A — Indépendance : union",
  "B-testIndependance": "B — Tester l'indépendance sur un tableau",
  "B-tableauDonne": "B — Lecture d'un tableau donné",
  "B-tableauReconstruire": "B — Reconstruire un tableau",
  C: "C — Arbre et théorème de Bayes",
};

export function libelleFamilleSousType(exercice: ExerciceIndependanceBayes): string {
  if (exercice.famille === "C") return LIBELLE_FAMILLE_SOUS_TYPE.C;
  return LIBELLE_FAMILLE_SOUS_TYPE[`${exercice.famille}-${exercice.sousType}`];
}

/** Récapitulatif / réponse attendue — réponse CORRECTE de chaque écran, jamais recalculée depuis la
 * saisie élève. Symboles seulement (aucune prose en mode mathématique). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes): string[] {
  if (exercice.famille === "A" && exercice.sousType === "pannes") {
    if (phase === "aPannesEcran1") return [`P(\\overline{A_1})${egalLatex(1 - exercice.p1)}`, `P(\\overline{A_2})${egalLatex(1 - exercice.p2)}`];
    return [`${NOTATION_DEMANDE_PANNES[exercice.demandeEcran2]}${egalLatex(valeurEcran2Pannes(exercice))}`];
  }
  if (exercice.famille === "A" && exercice.sousType === "unionIndependance") {
    if (phase === "aUnionEcran1") return [`P(\\overline{A})${egalLatex(1 - exercice.pA)}`];
    if (phase === "aUnionEcran2") return [`P(B)${egalLatex(pBDeduitUnion(exercice))}`];
    return [`P(A|B)=P(A)${egalLatex(exercice.pA)}`, `P(B|A)=P(B)${egalLatex(pBDeduitUnion(exercice))}`];
  }
  if (exercice.famille === "B" && exercice.sousType === "testIndependance") return reponseBIndep(exercice, phase);
  if (exercice.famille === "B" && exercice.sousType === "tableauDonne") {
    return [reponseTable(exercice.table, exercice.typeQuestion, exercice.ligneCible, exercice.colonneCible)];
  }
  if (exercice.famille === "B" && exercice.sousType === "tableauReconstruire") return reponseBRecon(exercice, phase);
  return reponseC(exercice as ExerciceFamilleC, phase);
}

