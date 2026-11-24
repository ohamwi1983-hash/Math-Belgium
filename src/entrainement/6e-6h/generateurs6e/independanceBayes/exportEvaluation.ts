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
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeIndependanceBayes as correctionDetaillee, questionsTableDonne, tableauDoubleSvg, tableauTestSvg } from "./corrigeDetaille";
import { consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIndependanceBayes";
import { phasesPourExercice, type PhaseIndependanceBayes } from "../../moteur6e/typesIndependanceBayes";
import {
  branchesArbreC,
  effectifsTest,
  fractionDepuisTable,
  pBDeduitUnion,
  probabiliteEffetC,
  tableCompleteReconstruire,
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
  if (e.famille === "B" && e.sousType === "tableauDonne") return [texte(" À l'aide du tableau, réponds aux trois questions suivantes.")];
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
  if (e.famille === "B" && e.sousType === "tableauDonne") return { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: questionsTableDonne(e).map((q) => ({ consigne: q.consigne })) };
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: Ex): EnoncePapier {
  if (e.famille === "B" && e.sousType === "tableauDonne") {
    const qs = questionsTableDonne(e);
    return {
      section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: qs.map((q) => ({ consigne: q.consigne })) },
      etapesParQuestion: qs.map((_, i) => [LETTRES[i]]),
      reponseBreve: reponseBreveTableDonne(e),
    };
  }
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




function reponseTableLatex(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): string {
  const [num, den] = fractionDepuisTable(t, type, ligne, colonne);
  return `p=${fracValeur(num, den)}`;
}



function reponseBreveTableDonne(e: ExerciceFamilleBTableauDonne): FragmentConsigne[] {
  const frags: FragmentConsigne[] = [];
  questionsTableDonne(e).forEach((q, i) => {
    if (i > 0) frags.push(texte(" ; "));
    frags.push(texte(`${LETTRES[i]}) `), latex(reponseTableLatex(e.table, q.type, e.ligneCible, e.colonneCible)));
  });
  return frags;
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
  const [qa, qb, qc] = questionsTableDonne(e);
  const f = (q: { type: TypeQuestionTable }) => fractionDepuisTable(e.table, q.type, e.ligneCible, e.colonneCible);
  const [na, da] = f(qa);
  const [, db] = f(qb);
  const [nc, dc] = f(qc);
  return {
    reponseFinale: reponseBreveTableDonne(e),
    criteres: [
      crit("a", 1, texte("Total de la ligne (ou colonne) sur le total général : "), latex(fracValeur(na, da))),
      crit("b", 0.5, texte("Une seule case, sur le total général "), latex(String(db))),
      crit("b", 1, texte("Résultat : "), latex(reponseTableLatex(e.table, qb.type, e.ligneCible, e.colonneCible).replace(/^p=/, ""))),
      crit("c", 0.5, texte("Bon groupe de choix : dénominateur "), latex(String(dc))),
      crit("c", 1, texte("Résultat : "), latex(fracValeur(nc, dc))),
    ],
    erreursFrequentes: [
      { description: [texte("En c), division par le total général (probabilité de l'intersection au lieu de la conditionnelle)")], cout: "0 pt sur c)" },
      { description: [texte("En a), une seule case prise au lieu du total de la ligne (ou colonne)")], cout: "−0,5" },
    ],
  };
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


function bareme(e: Ex): BaremeExercice {
  if (e.famille === "A") return e.sousType === "pannes" ? baremeAPannes(e) : baremeAUnion(e);
  if (e.famille === "B") {
    if (e.sousType === "testIndependance") return baremeBTest(e);
    if (e.sousType === "tableauDonne") return baremeBTable(e);
    return baremeBRecon(e);
  }
  return baremeC(e);
}

/** Niveau (`niveauDifficulte.ts`) : une étape par écran (« tableau donné » : les trois vraies
 * questions papier) ; méthode 1 (outils du cours à choisir : contraire, produit d'indépendants,
 * union, tableau, conditionnelle, arbre, Bayes) ; aucun piège dans les données ; nombres : la
 * famille C (Bayes, calculatrice) seulement. Étape du verdict (test d'indépendance) sans charge :
 * niveau et durée constants quel que soit le verdict. */
function criteresDifficulte(e: Ex): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetaillee(e));
  const sansCharge = e.famille === "B" && e.sousType === "testIndependance" ? ["b"] : [];
  return { ...base, lettresSansCharge: [...(base.lettresSansCharge ?? []), ...sansCharge], methode: 1, piege: 0, nombres: e.famille === "C" ? 1 : 0 };
}

function reponseBreve(e: Ex): FragmentConsigne[] {
  return bareme(e).reponseFinale;
}


export const adaptateurEvaluationIndependanceBayes: AdaptateurFeuilleExercices<ExerciceIndependanceBayes> = {
  titreDocument: "Indépendance et formule de Bayes — Évaluation",
  nomFichierBase: "independance-bayes",
  genererInstance: genererExerciceIndependanceBayes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIndependanceBayes),
  construireEnonce,
  construireCorrection,
  reponseBreve,
  correctionDetaillee,
  criteresDifficulte,
  bareme,
  enoncePapier,
  profilInstance: profilIndependanceBayes,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_INDEPENDANCE_BAYES,
};
