import type {
  ExerciceFamilleAPannes,
  ExerciceFamilleAUnion,
  ExerciceFamilleBReconstruire,
  ExerciceFamilleBTableauDonne,
  ExerciceFamilleBTestIndependance,
  ExerciceFamilleC,
  ExerciceIndependanceBayes,
  TableauDouble,
  TypeQuestionTable,
} from "../../core6e/independanceBayes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIndependanceBayes";
import { arbreSvg, tableauSvg, type EtiquetteFigure } from "../../ui6e/figuresIndependanceBayes";
import { phasesPourExercice, type PhaseIndependanceBayes } from "../../moteur6e/typesIndependanceBayes";
import {
  branchesArbreC,
  cellule00Reconstruire,
  cellule10Reconstruire,
  cellule20Reconstruire,
  effectifsTest,
  fractionDepuisTable,
  pBDeduitUnion,
  probabiliteEffetC,
  tableCompleteReconstruire,
  totalColonne1Reconstruire,
  totalColonneTable,
  totalLigneTable,
  totalTable,
  totauxLigneReconstruire,
  valeurEcran2Pannes,
  verdictTestIndependance,
} from "../../moteur6e/verificationIndependanceBayes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIndependanceBayes, type IdVarianteIndependanceBayes } from "./index";
import { VARIANTES_CALCULATRICE_INDEPENDANCE_BAYES, profilIndependanceBayes } from "../profilsEvaluationIndependanceBayes";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen32` (« Indépendance, conditionnement et
 * Bayes ») — méthode `.claude/rules/feuilles-evaluations.md` (audit 6e ch. 6, décision I).
 *
 * - Énoncé papier = la situation, TOUTES ses données (tableau à double entrée en figure SVG, rendue
 *   aussi en Word) et UNE consigne globale, suivie de la règle d'arrondi. Jamais les écrans de guidage
 *   (« calcule P(Ā) — il servira… », « traduis les pourcentages… ») : ils deviennent les étapes du
 *   corrigé (`sousQuestion` = lettre de l'écran, dans l'ordre de `phasesPourExercice`).
 * - Écran à choix (incompatibles / indépendants / ni l'un ni l'autre) : sur papier, la question est
 *   posée telle quelle avec sa comparaison à faire ; le corrigé donne la comparaison EXACTE (sur les
 *   effectifs entiers) et le libellé du verdict.
 * - Valeurs : exactes (fraction irréductible, ou décimal exact), puis « ≈ » avec l'arrondi annoncé
 *   (centième, millième sous 0,1). Toutes viennent des fonctions du moteur de l'écran.
 * - Figures du corrigé (`figureHtml`) : tableau complet avec totaux, arbre pondéré de Bayes.
 * - Version aménagée : même énoncé (contrat du pipeline).
 */

type Ex = ExerciceIndependanceBayes;

const LETTRES = "abcdefghij";

// ============================================================================
// Nombres
// ============================================================================

/** Décimal EXACT (données à 4 chiffres au plus), virgule française, pour KaTeX. */
function dec(v: number): string {
  return String(Math.round(v * 1e8) / 1e8).replace(".", "{,}");
}
/** Même chose, pour une figure (texte brut). */
function decTexte(v: number): string {
  return String(Math.round(v * 1e8) / 1e8).replace(".", ",");
}

function estDecimalCourt(v: number): boolean {
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-6;
}

/** Arrondi annoncé : au centième, au millième si la valeur est inférieure à 0,1. */
function arrondiAnnonce(v: number): string {
  const d = v >= 0.1 ? 2 : 3;
  return (Math.round(v * 10 ** d + 1e-9) / 10 ** d).toFixed(d).replace(".", "{,}");
}

/** « =0{,}1485 » (décimal exact) ou « \approx 0{,}77 » (arrondi annoncé). */
function valeur(v: number): string {
  return estDecimalCourt(v) ? `=${dec(v)}` : `\\approx ${arrondiAnnonce(v)}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Fraction irréductible d'entiers. */
function frac(num: number, den: number): string {
  const g = pgcd(num, den) || 1;
  const n = num / g;
  const d = den / g;
  return d === 1 ? String(n) : `\\dfrac{${n}}{${d}}`;
}

/** « \dfrac{72}{117}=\dfrac{8}{13} » : la fraction des effectifs, puis sa forme irréductible si elle diffère. */
function fracBrute(num: number, den: number): string {
  const reduite = frac(num, den);
  return reduite === `\\dfrac{${num}}{${den}}` ? reduite : `\\dfrac{${num}}{${den}}=${reduite}`;
}

/** « \dfrac{23}{97}\approx 0{,}24 » ou « \dfrac{1}{4}=0{,}25 » (ou un entier). */
function fracValeur(num: number, den: number): string {
  const f = frac(num, den);
  return f.startsWith("\\dfrac") ? `${f}${valeur(num / den)}` : f;
}

/** Quotient de deux décimaux à 4 chiffres au plus, en fraction irréductible puis valeur. */
function quotientDecimaux(a: number, b: number): string {
  return fracValeur(Math.round(a * 1e4), Math.round(b * 1e4));
}

const NOTE_ARRONDI_PAPIER = " Donne chaque probabilité sous forme exacte, ou arrondie au centième (au millième si elle est inférieure à 0,1).";

/** Consigne générale de l'écran, sans sa note d'arrondi (remplacée par `NOTE_ARRONDI_PAPIER`). */
function situation(e: Ex): FragmentConsigne[] {
  const frags = consigneGenerale(e) as FragmentConsigne[];
  const dernier = frags[frags.length - 1];
  return dernier?.type === "texte" && dernier.valeur.trimStart().startsWith("Probabilités :") ? frags.slice(0, -1) : frags;
}

function lettre(e: Ex, i: number): string {
  return LETTRES[Math.min(i, phasesPourExercice(e).length - 1)];
}

function crit(sousQuestion: string, points: number, ...critere: FragmentConsigne[]): CritereBareme {
  return { sousQuestion, points, critere };
}

// ============================================================================
// Figures
// ============================================================================

const SYMB = (symbole: string, barre = false): EtiquetteFigure => ({ symbole, barre });
const TXT = (t: string): EtiquetteFigure => ({ texte: t });

function tableauTestSvg(e: ExerciceFamilleBTestIndependance, avecTotaux: boolean): string {
  const { n, nA, nB } = effectifsTest(e);
  const [[x, y], [z, t]] = e.cellules;
  if (!avecTotaux) {
    return tableauSvg({ enTetesLignes: [SYMB("A"), SYMB("A", true)], enTetesColonnes: [SYMB("B"), SYMB("B", true)], cellules: [[String(x), String(y)], [String(z), String(t)]] }, "Tableau des effectifs");
  }
  return tableauSvg(
    {
      enTetesLignes: [SYMB("A"), SYMB("A", true), TXT("Total")],
      enTetesColonnes: [SYMB("B"), SYMB("B", true), TXT("Total")],
      cellules: [
        [String(x), String(y), String(nA)],
        [String(z), String(t), String(n - nA)],
        [String(nB), String(n - nB), String(n)],
      ],
      avecTotaux: true,
    },
    "Tableau des effectifs avec les totaux",
  );
}

function tableauDoubleSvg(t: TableauDouble, avecTotaux: boolean, libelle: string): string {
  const cellules = t.cellules.map((l) => l.map(String));
  if (!avecTotaux) return tableauSvg({ enTetesLignes: t.libelleLignes.map(TXT), enTetesColonnes: t.libelleColonnes.map(TXT), cellules }, libelle);
  return tableauSvg(
    {
      enTetesLignes: [...t.libelleLignes.map(TXT), TXT("Total")],
      enTetesColonnes: [...t.libelleColonnes.map(TXT), TXT("Total")],
      cellules: [...t.cellules.map((l, i) => [...l.map(String), String(totalLigneTable(t, i))]), [...t.libelleColonnes.map((_, j) => String(totalColonneTable(t, j))), String(totalTable(t))]],
      avecTotaux: true,
    },
    libelle,
  );
}

function arbreBayesSvg(e: ExerciceFamilleC): string {
  const [b1, b2, b3, b4] = branchesArbreC(e);
  const c = (i: string): EtiquetteFigure => ({ symbole: "c", indice: i });
  const chemin = (v: number) => (estDecimalCourt(v) ? decTexte(v) : `≈ ${decTexte(Math.round(v * 1e4) / 1e4)}`);
  return arbreSvg(
    {
      noeuds1: [c("1"), c("2")],
      feuilles: [SYMB("E"), SYMB("E", true), SYMB("E"), SYMB("E", true)],
      branches1: [decTexte(e.p), decTexte(1 - e.p)],
      branches2: [decTexte(e.q1), decTexte(1 - e.q1), decTexte(e.q2), decTexte(1 - e.q2)],
      chemins: [chemin(b1), chemin(b2), chemin(b3), chemin(b4)],
    },
    "Arbre pondéré : causes puis effet, avec les probabilités des chemins",
  );
}

// ============================================================================
// Énoncé papier
// ============================================================================

function donneesLatex(...egalites: string[]): FragmentConsigne[] {
  const frags: FragmentConsigne[] = [texte(" On donne ")];
  egalites.forEach((eg, i) => {
    if (i > 0) frags.push(texte(i === egalites.length - 1 ? " et " : ", "));
    frags.push(latex(eg));
  });
  frags.push(texte("."));
  return frags;
}

/** Demande de l'écran 2, rédigée pour le papier (élision et subjonctif). */
const DEMANDE_PANNES_PAPIER: Record<ExerciceFamilleAPannes["demandeEcran2"], string> = {
  lesDeux: "que les deux événements se produisent",
  aucun: "qu'aucun des deux événements ne se produise",
  auMoinsUn: "qu'au moins un des deux événements se produise",
  exactementUn: "qu'exactement un des deux événements se produise",
};

function consigneGlobale(e: Ex): FragmentConsigne[] {
  if (e.famille === "A" && e.sousType === "pannes") return [...donneesLatex(`P(A_1)=${dec(e.p1)}`, `P(A_2)=${dec(e.p2)}`), texte(` Calcule la probabilité ${DEMANDE_PANNES_PAPIER[e.demandeEcran2]}.`)];
  if (e.famille === "A") return [...donneesLatex(`P(A)=${dec(e.pA)}`, `P(A\\cup B)=${dec(e.pAouB)}`), texte(" Calcule "), latex("P(B)"), texte(", puis "), latex("P(A|B)"), texte(" et "), latex("P(B|A)"), texte(".")];
  if (e.famille === "B" && e.sousType === "testIndependance") return [texte(" "), ...(consigneEcran(e, "bIndepEcran2") as FragmentConsigne[]), texte(" Justifie.")];
  if (e.famille === "B" && e.sousType === "tableauDonne") return [texte(" "), ...(consigneEcran(e, "bTableEcran1") as FragmentConsigne[])];
  if (e.famille === "B") {
    const question = (consigneEcran(e, "bReconEcran3") as FragmentConsigne[]).map((f) => (f.type === "texte" ? { ...f, valeur: f.valeur.replace("Utilise le tableau reconstruit. ", "") } : f));
    return [texte(" Calcule l'effectif de chaque case du tableau croisé (lignes et colonnes ci-dessus, avec les totaux), puis réponds à la question suivante. "), ...question];
  }
  return [
    ...donneesLatex(`P(c_1)=${dec(e.p)}`, `P(E|c_1)=${dec(e.q1)}`, `P(E|c_2)=${dec(e.q2)}`),
    texte(" Représente la situation par un arbre pondéré, puis calcule "),
    latex(e.demandeEcran3 === "cause1SachantEffet" ? "P(c_1|E)" : "P(c_1|\\overline{E})"),
    texte("."),
  ];
}

function entetePapier(e: Ex): FragmentConsigne[] {
  // Test d'indépendance : une égalité EXACTE se vérifie sur des fractions, jamais sur des arrondis.
  const note = e.famille === "B" && e.sousType === "testIndependance" ? " Travaille avec les valeurs exactes." : NOTE_ARRONDI_PAPIER;
  return [...situation(e), ...consigneGlobale(e), texte(note)];
}

/** Données en figure dans l'énoncé : les tableaux à double entrée (jamais un arbre : les données de
 * Bayes sont des probabilités écrites, l'arbre est à construire). */
function figureEnonce(e: Ex): string | undefined {
  if (e.famille !== "B") return undefined;
  if (e.sousType === "testIndependance") return tableauTestSvg(e, false);
  if (e.sousType === "tableauDonne") return tableauDoubleSvg(e.table, false, "Tableau des effectifs");
  return undefined;
}

/** Consigne d'un écran, titre d'étape du corrigé : celle de l'écran, sauf la demande des pannes,
 * réécrite au subjonctif avec élision (« qu'aucun des deux événements ne se produise »). */
function consigneEtape(e: Ex, phase: PhaseIndependanceBayes): FragmentConsigne[] {
  if (e.famille === "A" && e.sousType === "pannes" && phase === "aPannesEcran2") return [texte(`Calcule la probabilité ${DEMANDE_PANNES_PAPIER[e.demandeEcran2]}.`)];
  return consigneEcran(e, phase) as FragmentConsigne[];
}

/** Énoncé « par écrans » : ses questions donnent les titres d'étapes du corrigé (« Étape n — … »). */
function construireEnonce(e: Ex): SectionExercice {
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: Ex): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: [] } };
}

function construireCorrection(e: Ex): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [texte(`${LETTRES[i]}) `), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\ "))] }));
}

// ============================================================================
// Famille A — pannes
// ============================================================================

const NOTATION_PANNES: Record<ExerciceFamilleAPannes["demandeEcran2"], string> = {
  lesDeux: "P(A_1\\cap A_2)",
  aucun: "P(\\overline{A_1}\\cap\\overline{A_2})",
  auMoinsUn: "P(A_1\\cup A_2)",
  exactementUn: "P(A_1\\cap\\overline{A_2})+P(\\overline{A_1}\\cap A_2)",
};

function calculPannes(e: ExerciceFamilleAPannes): string {
  const p1 = dec(e.p1);
  const p2 = dec(e.p2);
  const q1 = dec(1 - e.p1);
  const q2 = dec(1 - e.p2);
  const v = dec(valeurEcran2Pannes(e));
  switch (e.demandeEcran2) {
    case "lesDeux":
      return `P(A_1\\cap A_2)=P(A_1)\\cdot P(A_2)=${p1}\\times ${p2}=${v}`;
    case "aucun":
      return `P(\\overline{A_1}\\cap\\overline{A_2})=P(\\overline{A_1})\\cdot P(\\overline{A_2})=${q1}\\times ${q2}=${v}`;
    case "auMoinsUn":
      return `P(A_1\\cup A_2)=1-P(\\overline{A_1}\\cap\\overline{A_2})=1-${q1}\\times ${q2}=1-${dec((1 - e.p1) * (1 - e.p2))}=${v}`;
    case "exactementUn":
      return `${NOTATION_PANNES.exactementUn}=${p1}\\times ${q2}+${q1}\\times ${p2}=${dec(e.p1 * (1 - e.p2))}+${dec((1 - e.p1) * e.p2)}=${v}`;
  }
}

function correctionAPannes(e: ExerciceFamilleAPannes): EtapeCorrection[] {
  const a = lettre(e, 0);
  const b = lettre(e, 1);
  const methode: Record<ExerciceFamilleAPannes["demandeEcran2"], FragmentConsigne[]> = {
    lesDeux: [texte("Les deux événements se produisent : c'est l'intersection, et pour deux événements indépendants, la probabilité de l'intersection est le produit des probabilités.")],
    aucun: [texte("Aucun ne se produit : c'est "), latex("\\overline{A_1}\\cap\\overline{A_2}"), texte(". Les contraires de deux événements indépendants sont encore indépendants : on multiplie.")],
    auMoinsUn: [texte("« Au moins un » est le contraire de « aucun » : on calcule "), latex("P(\\overline{A_1}\\cap\\overline{A_2})"), texte(" par le produit (indépendance), puis on passe au complément.")],
    exactementUn: [texte("Exactement un : soit "), latex("A_1"), texte(" seul, soit "), latex("A_2"), texte(" seul. Ces deux cas sont incompatibles : on additionne leurs probabilités, chacune obtenue par un produit (indépendance).")],
  };
  const piege: Record<ExerciceFamilleAPannes["demandeEcran2"], FragmentConsigne[]> = {
    lesDeux: [texte("« Et » avec des événements indépendants donne un produit, pas une somme : "), latex(`${dec(e.p1)}+${dec(e.p2)}`), texte(" est faux.")],
    aucun: [texte("« Aucun » n'est pas le contraire de « les deux » : "), latex(`1-${dec(e.p1)}\\times ${dec(e.p2)}`), texte(" est la probabilité que les deux ne tombent pas en panne en même temps.")],
    auMoinsUn: [texte("La somme "), latex(`${dec(e.p1)}+${dec(e.p2)}`), texte(" compte deux fois le cas où les deux se produisent.")],
    exactementUn: [texte("Il y a deux cas : n'en calculer qu'un seul, ou calculer "), latex(`${dec(e.p1)}\\times ${dec(e.p2)}`), texte(" (les deux à la fois), est faux.")],
  };
  return [
    { label: "Calcul", sousQuestion: a, fragments: [latex(`P(\\overline{A_1})=1-${dec(e.p1)}=${dec(1 - e.p1)}`), texte(" et "), latex(`P(\\overline{A_2})=1-${dec(e.p2)}=${dec(1 - e.p2)}`), texte(".")] },
    { label: "Méthode", sousQuestion: b, fragments: methode[e.demandeEcran2] },
    { label: "Calcul", sousQuestion: b, fragments: [latex(calculPannes(e))] },
    { label: "Conclusion", sousQuestion: b, fragments: [texte("La probabilité demandée vaut "), latex(dec(valeurEcran2Pannes(e))), texte(".")] },
    { label: "Piège", fragments: piege[e.demandeEcran2] },
  ];
}

function baremeAPannes(e: ExerciceFamilleAPannes): BaremeExercice {
  const a = lettre(e, 0);
  const b = lettre(e, 1);
  const v = dec(valeurEcran2Pannes(e));
  const reponseFinale = [latex(`${NOTATION_PANNES[e.demandeEcran2]}=${v}`)];
  switch (e.demandeEcran2) {
    case "lesDeux":
      return {
        reponseFinale,
        criteres: [crit(b, 1.5, texte("Indépendance : probabilité de l'intersection = produit")), crit(b, 1.5, latex(`${dec(e.p1)}\\times ${dec(e.p2)}`)), crit(b, 1, texte("Résultat : "), latex(v))],
        erreursFrequentes: [{ description: [texte("Somme des deux probabilités au lieu du produit")], cout: "0 pt" }],
      };
    case "aucun":
      return {
        reponseFinale,
        criteres: [crit(a, 1, texte("Probabilités contraires "), latex(`${dec(1 - e.p1)}`), texte(" et "), latex(`${dec(1 - e.p2)}`)), crit(b, 1.5, texte("Produit des contraires (indépendance)")), crit(b, 1.5, texte("Résultat : "), latex(v))],
        erreursFrequentes: [{ description: [texte("Calcul de "), latex("1-P(A_1)\\cdot P(A_2)"), texte(" (contraire de « les deux »)")], cout: "−2" }],
      };
    case "auMoinsUn":
      return {
        reponseFinale,
        criteres: [crit(a, 1, texte("Probabilités contraires")), crit(b, 1.5, texte("Passage par le contraire (ou formule de l'union avec "), latex("P(A_1)\\cdot P(A_2)"), texte(")")), crit(b, 1.5, texte("Résultat : "), latex(v))],
        erreursFrequentes: [{ description: [texte("Somme "), latex("P(A_1)+P(A_2)"), texte(" sans retirer l'intersection")], cout: "−2" }],
        reponsesAcceptees: [[latex(`${dec(e.p1)}+${dec(e.p2)}-${dec(e.p1)}\\times ${dec(e.p2)}=${v}`)]],
      };
    case "exactementUn":
      return {
        reponseFinale,
        criteres: [crit(a, 1, texte("Probabilités contraires")), crit(b, 1, texte("Les deux cas incompatibles identifiés")), crit(b, 1, texte("Les deux produits "), latex(`${dec(e.p1 * (1 - e.p2))}`), texte(" et "), latex(`${dec((1 - e.p1) * e.p2)}`)), crit(b, 1, texte("Somme : "), latex(v))],
        erreursFrequentes: [{ description: [texte("Un seul des deux cas calculé")], cout: "−1,5" }],
        reponsesAcceptees: [[latex(`P(A_1\\cup A_2)-P(A_1\\cap A_2)=${v}`)]],
      };
  }
}

// ============================================================================
// Famille A — union
// ============================================================================

function correctionAUnion(e: ExerciceFamilleAUnion): EtapeCorrection[] {
  const pB = pBDeduitUnion(e);
  const pA = dec(e.pA);
  return [
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`P(\\overline{A})=1-${pA}=${dec(1 - e.pA)}`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Formule de l'union, avec l'indépendance pour l'intersection : "), latex("P(A\\cup B)=P(A)+P(B)-P(A)\\cdot P(B)")] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`${dec(e.pAouB)}=${pA}+P(B)\\,(1-${pA})`), texte(", donc "), latex(`P(B)=\\dfrac{${dec(e.pAouB)}-${pA}}{${dec(1 - e.pA)}}=\\dfrac{${dec(e.pAouB - e.pA)}}{${dec(1 - e.pA)}}=${dec(pB)}`), texte(".")],
    },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("A et B sont indépendants : savoir que l'un est réalisé ne change pas la probabilité de l'autre.")] },
    { label: "Calcul", sousQuestion: "c", fragments: [latex(`P(A|B)=\\dfrac{P(A)\\cdot P(B)}{P(B)}=P(A)=${pA}`), texte(" et "), latex(`P(B|A)=P(B)=${dec(pB)}`), texte(".")] },
    { label: "Piège", fragments: [texte("A et B ne sont pas incompatibles : "), latex(`P(B)=${dec(e.pAouB)}-${pA}`), texte(" oublie le terme "), latex("-P(A)\\cdot P(B)"), texte(".")] },
  ];
}

function baremeAUnion(e: ExerciceFamilleAUnion): BaremeExercice {
  const pB = dec(pBDeduitUnion(e));
  return {
    reponseFinale: [latex(`P(B)=${pB}`), texte(" ; "), latex(`P(A|B)=${dec(e.pA)}`), texte(" ; "), latex(`P(B|A)=${pB}`)],
    criteres: [crit("b", 1, texte("Formule de l'union avec "), latex("P(A\\cap B)=P(A)\\cdot P(B)")), crit("b", 1.5, texte("Équation résolue : "), latex(`P(B)=${pB}`)), crit("c", 1.5, texte("Conditionnelles égales aux probabilités simples (indépendance)"))],
    erreursFrequentes: [
      { description: [latex("P(B)=P(A\\cup B)-P(A)"), texte(" (intersection oubliée)")], cout: "−1,5" },
      { description: [texte("Conditionnelles recalculées sans utiliser l'indépendance, mais justes")], cout: "0" },
    ],
  };
}

// ============================================================================
// Famille B — test d'indépendance
// ============================================================================

const LIBELLE_VERDICT = { incompatibles: "A et B sont incompatibles", independants: "A et B sont indépendants", ni: "A et B ne sont ni incompatibles, ni indépendants" } as const;

function comparaisonTest(e: ExerciceFamilleBTestIndependance): FragmentConsigne[] {
  const { n, nA, nB, nAetB } = effectifsTest(e);
  const verdict = verdictTestIndependance(e);
  if (verdict === "incompatibles") {
    return [latex("n(A\\cap B)=0"), texte(", donc "), latex("P(A\\cap B)=0"), texte(" : aucun individu ne vérifie A et B à la fois. Comme "), latex(`P(A)\\cdot P(B)=${frac(nA * nB, n * n)}\\neq 0`), texte(", ils ne sont pas indépendants.")];
  }
  const signe = verdict === "independants" ? "=" : "\\neq ";
  if (e.methode === "produit") {
    return [
      latex(`P(A)\\cdot P(B)=${frac(nA, n)}\\times ${frac(nB, n)}=${frac(nA * nB, n * n)}`),
      texte(" et "),
      latex(`P(A\\cap B)=${frac(nAetB, n)}`),
      texte(verdict === "independants" ? " : mêmes fractions irréductibles, donc " : " : fractions irréductibles différentes, donc "),
      latex(`P(A)\\cdot P(B)${signe}P(A\\cap B)`),
      texte("."),
    ];
  }
  return [
    latex(`P(A|B)=${fracBrute(nAetB, nB)}`),
    texte(" et "),
    latex(`P(A)=${fracBrute(nA, n)}`),
    texte(" ; produits en croix : "),
    latex(`${nAetB}\\times ${n}=${nAetB * n}`),
    texte(" et "),
    latex(`${nA}\\times ${nB}=${nA * nB}`),
    texte(", donc "),
    latex(`P(A|B)${signe}P(A)`),
    texte("."),
  ];
}

function correctionBTest(e: ExerciceFamilleBTestIndependance): EtapeCorrection[] {
  const { n, nA, nB, nAetB } = effectifsTest(e);
  const verdict = verdictTestIndependance(e);
  const probas =
    e.methode === "produit"
      ? [latex(`P(A)=${fracBrute(nA, n)}`), texte(", "), latex(`P(B)=${fracBrute(nB, n)}`), texte(" et "), latex(`P(A\\cap B)=${fracBrute(nAetB, n)}`), texte(".")]
      : [latex(`P(A)=${fracBrute(nA, n)}`), texte(" et, en ne choisissant que parmi les individus de B, "), latex(`P(A|B)=${fracBrute(nAetB, nB)}`), texte(".")];
  const conclusion: FragmentConsigne[] =
    verdict === "incompatibles"
      ? [texte(`${LIBELLE_VERDICT.incompatibles} (et donc pas indépendants).`)]
      : verdict === "independants"
        ? [texte(`${LIBELLE_VERDICT.independants} (mais pas incompatibles, car `), latex("P(A\\cap B)\\neq 0"), texte(").")]
        : [texte("L'égalité n'est pas vérifiée et "), latex("P(A\\cap B)\\neq 0"), texte(` : ${LIBELLE_VERDICT.ni}.`)];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On complète les totaux du tableau ; chaque probabilité est un effectif divisé par l'effectif du groupe dans lequel on choisit.")], figureHtml: tableauTestSvg(e, true) },
    { label: "Calcul", sousQuestion: "a", fragments: probas },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Incompatibles : "), latex("P(A\\cap B)=0"), texte(". Indépendants : "), latex("P(A\\cap B)=P(A)\\cdot P(B)"), texte(", ou de façon équivalente "), latex("P(A|B)=P(A)"), texte(" — une égalité EXACTE, vérifiée sur les fractions.")] },
    { label: "Calcul", sousQuestion: "b", fragments: comparaisonTest(e) },
    { label: "Conclusion", sousQuestion: "b", fragments: conclusion },
    { label: "Piège", fragments: [texte("Incompatibles et indépendants ne sont pas synonymes : deux événements incompatibles de probabilités non nulles ne sont jamais indépendants. Et des valeurs arrondies « presque égales » ne prouvent pas l'indépendance.")] },
  ];
}

function baremeBTest(e: ExerciceFamilleBTestIndependance): BaremeExercice {
  const { n, nA, nB, nAetB } = effectifsTest(e);
  const verdict = verdictTestIndependance(e);
  const criteresA =
    e.methode === "produit"
      ? [crit("a", 0.5, latex(`P(A)=${frac(nA, n)}`)), crit("a", 0.5, latex(`P(B)=${frac(nB, n)}`)), crit("a", 0.5, latex(`P(A\\cap B)=${frac(nAetB, n)}`))]
      : [crit("a", 0.75, latex(`P(A)=${frac(nA, n)}`)), crit("a", 0.75, latex(`P(A|B)=${frac(nAetB, nB)}`))];
  const autre =
    e.methode === "produit"
      ? [texte("Comparaison de "), latex(`P(A|B)=${frac(nAetB, nB)}`), texte(" et "), latex(`P(A)=${frac(nA, n)}`)]
      : [texte("Comparaison de "), latex(`P(A\\cap B)=${frac(nAetB, n)}`), texte(" et "), latex(`P(A)\\cdot P(B)=${frac(nA * nB, n * n)}`)];
  return {
    reponseFinale: [texte(`${LIBELLE_VERDICT[verdict]}.`)],
    criteres: [...criteresA, crit("b", 1.5, texte("Comparaison exacte (fractions ou produits en croix)")), crit("b", 1, texte("Conclusion avec le bon mot : "), texte(LIBELLE_VERDICT[verdict]))],
    erreursFrequentes: [
      { description: [texte("Incompatibles et indépendants confondus")], cout: "0 pt sur la conclusion" },
      { description: [texte("Égalité « vérifiée » sur des valeurs arrondies")], cout: "−1" },
    ],
    reponsesAcceptees: [autre],
  };
}

// ============================================================================
// Famille B — lecture d'un tableau (donné ou reconstruit)
// ============================================================================

function methodeTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): FragmentConsigne[] {
  const l = `« ${t.libelleLignes[ligne]} »`;
  const c = `« ${t.libelleColonnes[colonne]} »`;
  switch (type) {
    case "jointe":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = la case au croisement de la ligne ${l} et de la colonne ${c}.`)];
    case "margLigne":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = le total de la ligne ${l}.`)];
    case "margColonne":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = le total de la colonne ${c}.`)];
    case "condLigneSachantColonne":
      return [texte(`On choisit seulement dans la colonne ${c} : dénominateur = total de cette colonne ; numérateur = la case de la ligne ${l}.`)];
    case "condColonneSachantLigne":
      return [texte(`On choisit seulement dans la ligne ${l} : dénominateur = total de cette ligne ; numérateur = la case de la colonne ${c}.`)];
  }
}

function piegeTable(type: TypeQuestionTable): FragmentConsigne[] {
  if (type === "condLigneSachantColonne" || type === "condColonneSachantLigne") return [texte("« On choisit au hasard l'un des … » restreint le groupe : diviser par le total général donnerait la probabilité de l'intersection, pas la probabilité conditionnelle.")];
  if (type === "jointe") return [texte("Pour une intersection, on divise par le total général, pas par le total de la ligne ou de la colonne (ce serait une probabilité conditionnelle).")];
  return [texte("Pour une probabilité simple, le numérateur est tout le total de la ligne (ou de la colonne), pas une seule case.")];
}

function calculTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): FragmentConsigne[] {
  const [num, den] = fractionDepuisTable(t, type, ligne, colonne);
  const approx = frac(num, den).startsWith("\\dfrac") ? valeur(num / den) : "";
  return [latex(`p=${fracBrute(num, den)}${approx}`)];
}

function reponseTableLatex(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): string {
  const [num, den] = fractionDepuisTable(t, type, ligne, colonne);
  return `p=${fracValeur(num, den)}`;
}

function difficulteTable(type: TypeQuestionTable): 1 | 2 {
  return type === "condLigneSachantColonne" || type === "condColonneSachantLigne" ? 2 : 1;
}

function correctionBTable(e: ExerciceFamilleBTableauDonne): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodeTable(e.table, e.typeQuestion, e.ligneCible, e.colonneCible), figureHtml: tableauDoubleSvg(e.table, true, "Tableau des effectifs avec les totaux") },
    { label: "Calcul", sousQuestion: "a", fragments: calculTable(e.table, e.typeQuestion, e.ligneCible, e.colonneCible) },
    { label: "Piège", fragments: piegeTable(e.typeQuestion) },
  ];
}

function baremeTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number, lettreQ: string, poids: [number, number, number]): CritereBareme[] {
  const [num, den] = fractionDepuisTable(t, type, ligne, colonne);
  return [
    crit(lettreQ, poids[0], texte("Bon groupe de choix : dénominateur "), latex(String(den))),
    crit(lettreQ, poids[1], texte("Numérateur "), latex(String(num))),
    crit(lettreQ, poids[2], texte("Résultat : "), latex(fracValeur(num, den))),
  ];
}

function baremeBTable(e: ExerciceFamilleBTableauDonne): BaremeExercice {
  return {
    reponseFinale: [latex(reponseTableLatex(e.table, e.typeQuestion, e.ligneCible, e.colonneCible))],
    criteres: baremeTable(e.table, e.typeQuestion, e.ligneCible, e.colonneCible, "a", [1.5, 1.5, 1]),
    erreursFrequentes: [{ description: [texte("Probabilité conditionnelle et probabilité de l'intersection confondues (mauvais dénominateur)")], cout: "−1,5" }],
  };
}

function correctionBRecon(e: ExerciceFamilleBReconstruire): EtapeCorrection[] {
  const [r0, r1, r2] = totauxLigneReconstruire(e);
  const table = tableCompleteReconstruire(e);
  const [p1, p2, p3] = e.pourcentageLigne;
  const nC1 = totalColonne1Reconstruire(e);
  const c00 = cellule00Reconstruire(e);
  const c10 = cellule10Reconstruire(e);
  const c20 = cellule20Reconstruire(e);
  const tableAvecLibelles: TableauDouble = { libelleLignes: e.contexte.libelleLignes.map((l, i) => `${l} (L${["₁", "₂", "₃"][i]})`), libelleColonnes: e.contexte.libelleColonnes.map((c, j) => `${c} (C${["₁", "₂"][j]})`), cellules: table.cellules };
  return [
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [
        texte("Totaux des lignes : "),
        latex(`n(L_1)=\\dfrac{${p1}}{100}\\times ${e.total}=${r0}`),
        texte(", "),
        latex(`n(L_2)=\\dfrac{${p2}}{100}\\times ${e.total}=${r1}`),
        texte(", "),
        latex(`n(L_3)=\\dfrac{${p3}}{100}\\times ${e.total}=${r2}`),
        texte("."),
      ],
    },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [texte("Un pourcentage « de L₁ » s'applique au total de L₁ : "), latex(`n(L_1\\cap C_1)=\\dfrac{${e.pourcentageReussiteLigne1}}{100}\\times ${r0}=${c00}`), texte(" et "), latex(`n(L_2\\cap C_1)=\\dfrac{${e.pourcentageReussiteLigne2}}{100}\\times ${r1}=${c10}`), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`n(C_1)=\\dfrac{${e.pourcentageReussiteGlobale}}{100}\\times ${e.total}=${nC1}`), texte(", donc "), latex(`n(L_3\\cap C_1)=${nC1}-${c00}-${c10}=${c20}`), texte(".")],
    },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [texte("Colonne C₂ par différence avec les totaux des lignes : "), latex(`${r0}-${c00}=${table.cellules[0][1]}`), texte(", "), latex(`${r1}-${c10}=${table.cellules[1][1]}`), texte(", "), latex(`${r2}-${c20}=${table.cellules[2][1]}`), texte(".")],
      figureHtml: tableauDoubleSvg(tableAvecLibelles, true, "Tableau des effectifs reconstruit, avec les totaux"),
    },
    { label: "Méthode", sousQuestion: "c", fragments: methodeTable(table, e.typeQuestionFinale, e.ligneCibleFinale, e.colonneCibleFinale) },
    { label: "Calcul", sousQuestion: "c", fragments: calculTable(table, e.typeQuestionFinale, e.ligneCibleFinale, e.colonneCibleFinale) },
    { label: "Piège", fragments: [texte(`« ${e.pourcentageReussiteLigne1} % de L₁ » se calcule sur n(L₁) = ${r0}, pas sur l'effectif total ${e.total}.`)] },
  ];
}

function baremeBRecon(e: ExerciceFamilleBReconstruire): BaremeExercice {
  const table = tableCompleteReconstruire(e);
  return {
    reponseFinale: [latex(reponseTableLatex(table, e.typeQuestionFinale, e.ligneCibleFinale, e.colonneCibleFinale))],
    criteres: [
      crit("a", 0.5, texte("Totaux des trois lignes")),
      crit("a", 1, texte("Cases "), latex("L_1\\cap C_1"), texte(" et "), latex("L_2\\cap C_1"), texte(" (pourcentage appliqué au total de la ligne)")),
      crit("b", 1, texte("Cases restantes par différence")),
      ...baremeTable(table, e.typeQuestionFinale, e.ligneCibleFinale, e.colonneCibleFinale, "c", [0.5, 0.5, 0.5]),
    ],
    erreursFrequentes: [{ description: [texte("Pourcentage d'une ligne appliqué à l'effectif total")], cout: "−1" }],
  };
}

// ============================================================================
// Famille C — Bayes
// ============================================================================

function correctionC(e: ExerciceFamilleC): EtapeCorrection[] {
  const [b1, b2, b3, b4] = branchesArbreC(e);
  const pE = probabiliteEffetC(e);
  const p = dec(e.p);
  const q1 = dec(e.q1);
  const q2 = dec(e.q2);
  const effet = e.demandeEcran3 === "cause1SachantEffet";
  const bayes = effet
    ? `P(c_1|E)=\\dfrac{P(c_1\\cap E)}{P(E)}=\\dfrac{${dec(b1)}}{${dec(pE)}}=${quotientDecimaux(b1, pE)}`
    : `P(c_1|\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}=\\dfrac{${dec(b2)}}{1-${dec(pE)}}=\\dfrac{${dec(b2)}}{${dec(1 - pE)}}=${quotientDecimaux(b2, 1 - pE)}`;
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Arbre : d'abord la cause ("), latex("c_1"), texte(" ou "), latex("c_2"), texte("), puis l'effet. Branches complémentaires : "), latex(`P(c_2)=1-${p}=${dec(1 - e.p)}`), texte(", "), latex(`P(\\overline{E}|c_1)=${dec(1 - e.q1)}`), texte(", "), latex(`P(\\overline{E}|c_2)=${dec(1 - e.q2)}`), texte(".")],
      figureHtml: arbreBayesSvg(e),
    },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [
        texte("Probabilité d'un chemin = produit des probabilités de ses branches : "),
        latex(`P(c_1\\cap E)=${p}\\times ${q1}=${dec(b1)}`),
        texte(", "),
        latex(`P(c_1\\cap\\overline{E})=${dec(b2)}`),
        texte(", "),
        latex(`P(c_2\\cap E)=${dec(1 - e.p)}\\times ${q2}=${dec(b3)}`),
        texte(", "),
        latex(`P(c_2\\cap\\overline{E})=${dec(b4)}`),
        texte("."),
      ],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [texte("Probabilités totales : "), latex(`P(E)=P(c_1\\cap E)+P(c_2\\cap E)=${dec(b1)}+${dec(b3)}=${dec(pE)}`), texte(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: [texte("Formule de Bayes : "), latex(bayes), texte(".")] },
    { label: "Piège", fragments: effet ? [texte("Ne pas confondre "), latex("P(c_1|E)"), texte(" (demandée) avec "), latex(`P(E|c_1)=${q1}`), texte(" (donnée) : on remonte de l'effet vers la cause.")] : [latex("P(\\overline{E})=1-P(E)"), texte(", et non "), latex(`1-P(E|c_1)=${dec(1 - e.q1)}`), texte(", qui est une probabilité conditionnelle.")] },
  ];
}

function baremeC(e: ExerciceFamilleC): BaremeExercice {
  const [b1, b2] = branchesArbreC(e);
  const pE = probabiliteEffetC(e);
  const effet = e.demandeEcran3 === "cause1SachantEffet";
  const valeurFinale = effet ? quotientDecimaux(b1, pE) : quotientDecimaux(b2, 1 - pE);
  return {
    reponseFinale: [latex(`${effet ? "P(c_1|E)" : "P(c_1|\\overline{E})"}=${valeurFinale}`)],
    criteres: [
      crit("a", 1, texte("Arbre complet : branches complémentaires et probabilités des chemins")),
      crit("b", 1, latex(`P(E)=${dec(pE)}`), texte(" (probabilités totales)")),
      crit("c", 1.5, texte("Formule de Bayes : "), latex(effet ? "\\dfrac{P(c_1\\cap E)}{P(E)}" : "\\dfrac{P(c_1\\cap\\overline{E})}{1-P(E)}")),
      crit("c", 0.5, texte("Résultat : "), latex(valeurFinale)),
    ],
    erreursFrequentes: [
      { description: effet ? [texte("Réponse "), latex(`P(E|c_1)=${dec(e.q1)}`), texte(" (sens inversé)")] : [texte("Réponse "), latex(`P(\\overline{E}|c_1)=${dec(1 - e.q1)}`), texte(" (sens inversé)")], cout: "0 pt sur la formule de Bayes" },
      { description: [texte("Branches complémentaires fausses (1 − p oublié)")], cout: "−1" },
    ],
    reponsesAcceptees: [[texte("Valeur décimale exacte ou arrondie au centième (au millième sous 0,1)")]],
  };
}

// ============================================================================
// Dispatch
// ============================================================================

function correctionDetaillee(e: Ex): EtapeCorrection[] {
  if (e.famille === "A") return e.sousType === "pannes" ? correctionAPannes(e) : correctionAUnion(e);
  if (e.famille === "B") {
    if (e.sousType === "testIndependance") return correctionBTest(e);
    if (e.sousType === "tableauDonne") return correctionBTable(e);
    return correctionBRecon(e);
  }
  return correctionC(e);
}

function bareme(e: Ex): BaremeExercice {
  if (e.famille === "A") return e.sousType === "pannes" ? baremeAPannes(e) : baremeAUnion(e);
  if (e.famille === "B") {
    if (e.sousType === "testIndependance") return baremeBTest(e);
    if (e.sousType === "tableauDonne") return baremeBTable(e);
    return baremeBRecon(e);
  }
  return baremeC(e);
}

function reponseBreve(e: Ex): FragmentConsigne[] {
  return bareme(e).reponseFinale;
}

function difficulte(e: Ex): 1 | 2 | 3 {
  if (e.famille === "A" && e.sousType === "pannes") return e.demandeEcran2 === "lesDeux" ? 1 : e.demandeEcran2 === "exactementUn" ? 3 : 2;
  if (e.famille === "A") return 2;
  if (e.famille === "B" && e.sousType === "testIndependance") return 2;
  if (e.famille === "B" && e.sousType === "tableauDonne") return difficulteTable(e.typeQuestion);
  return 3;
}

export const adaptateurEvaluationIndependanceBayes: AdaptateurFeuilleExercices<ExerciceIndependanceBayes> = {
  titreDocument: "Indépendance et formule de Bayes — Évaluation",
  nomFichierBase: "independance-bayes",
  genererInstance: genererExerciceIndependanceBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIndependanceBayes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
  profilInstance: profilIndependanceBayes,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_INDEPENDANCE_BAYES,
};
