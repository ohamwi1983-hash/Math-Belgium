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
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { consigneEcran, formatReponseAttenduePhaseLatex } from "../../ui6e/formatIndependanceBayes";
import { arbreSvg, tableauSvg, type EtiquetteFigure } from "../../ui6e/figuresIndependanceBayes";
import { phasesPourExercice, type PhaseIndependanceBayes } from "../../moteur6e/typesIndependanceBayes";
import {
  bayesEcran3C,
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
import { COURS_INDEPENDANCE, brute, calcul, dec, egal4, finaliser, frac, latex, ligne, lignesFraction4, listeEt, piege, resultat, texte, utiliseCours, verification } from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen32` (Indépendance, conditionnement et Bayes) —
 * partagé par l'adaptateur papier et le générateur interactif (étape révélée). Une lettre par écran
 * (`phasesPourExercice`) ; « tableau donné » : trois vraies questions papier a), b), c) (marginale,
 * intersection, conditionnelle), l'écran en pose une (`lettreEcranIndependanceBayes`). Valeurs du
 * moteur de l'écran ; tableaux complets et arbre de Bayes en `figureHtml`.
 */

type Ex = ExerciceIndependanceBayes;
type Fragments = FragmentConsigne[];
const LETTRES = "abcdefghij";

const COURS = COURS_INDEPENDANCE;

function reponse(e: Ex, phase: PhaseIndependanceBayes): Fragments {
  return listeEt(formatReponseAttenduePhaseLatex(e, phase));
}

// ============================================================================
// Figures (partagées avec l'énoncé papier)
// ============================================================================

const SYMB = (symbole: string, barre = false): EtiquetteFigure => ({ symbole, barre });
const TXT = (t: string): EtiquetteFigure => ({ texte: t });

function decTexte(v: number): string {
  return String(Math.round(v * 1e8) / 1e8).replace(".", ",");
}
function estDecimalCourt(v: number): boolean {
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-6;
}

export function tableauTestSvg(e: ExerciceFamilleBTestIndependance, avecTotaux: boolean): string {
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

export function tableauDoubleSvg(t: TableauDouble, avecTotaux: boolean, libelle: string): string {
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
// Lettres
// ============================================================================

/** « Tableau donné » : les trois questions papier (marginale, intersection, conditionnelle). */
export function questionsTableDonne(e: ExerciceFamilleBTableauDonne): { type: TypeQuestionTable; consigne: Fragments }[] {
  const marginale: TypeQuestionTable = e.typeQuestion === "margColonne" ? "margColonne" : "margLigne";
  const conditionnelle: TypeQuestionTable = e.typeQuestion === "condColonneSachantLigne" ? "condColonneSachantLigne" : "condLigneSachantColonne";
  return [marginale, "jointe" as TypeQuestionTable, conditionnelle].map((type) => ({ type, consigne: consigneEcran({ ...e, typeQuestion: type }, "bTableEcran1") as Fragments }));
}

/** Lettre du corrigé de l'écran `phase` (l'écran « tableau donné » pose l'une des trois questions). */
export function lettreEcranIndependanceBayes(e: Ex, phase: PhaseIndependanceBayes): string {
  if (e.famille === "B" && e.sousType === "tableauDonne") return LETTRES[Math.max(0, questionsTableDonne(e).findIndex((q) => q.type === e.typeQuestion))];
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

// ============================================================================
// Famille A — pannes
// ============================================================================


function etapesAPannes(e: ExerciceFamilleAPannes): EtapeCorrection[] {
  const [a, b] = ["a", "b"];
  const p1 = dec(e.p1);
  const p2 = dec(e.p2);
  const q1 = dec(1 - e.p1);
  const q2 = dec(1 - e.p2);
  const v = valeurEcran2Pannes(e);
  const lignes: Record<ExerciceFamilleAPannes["demandeEcran2"], LigneCalcul[]> = {
    lesDeux: [ligne("P(A_1\\cap A_2)=P(A_1)\\cdot P(A_2)", "événements indépendants"), ligne(`=${p1}\\times ${p2}`), ligne(`=${dec(v)}`)],
    aucun: [ligne("P(\\overline{A_1}\\cap\\overline{A_2})=P(\\overline{A_1})\\cdot P(\\overline{A_2})", "contraires indépendants"), ligne(`=${q1}\\times ${q2}`, "étape 1"), ligne(`=${dec(v)}`)],
    auMoinsUn: [
      ligne("P(A_1\\cup A_2)=1-P(\\overline{A_1}\\cap\\overline{A_2})", "contraire de « aucun »"),
      ligne("=1-P(\\overline{A_1})\\cdot P(\\overline{A_2})", "contraires indépendants"),
      ligne(`=1-${q1}\\times ${q2}`, "étape 1"),
      ligne(`=1-${dec((1 - e.p1) * (1 - e.p2))}`),
      ligne(`=${dec(v)}`),
    ],
    exactementUn: [
      ligne(`P(A_1\\cap\\overline{A_2})=${p1}\\times ${q2}`, "indépendance : produit"),
      ligne(`=${dec(e.p1 * (1 - e.p2))}`),
      ligne(`P(\\overline{A_1}\\cap A_2)=${q1}\\times ${p2}`, "indépendance : produit"),
      ligne(`=${dec((1 - e.p1) * e.p2)}`),
      ligne(`P(\\text{exactement un})=${dec(e.p1 * (1 - e.p2))}+${dec((1 - e.p1) * e.p2)}`, "deux cas incompatibles"),
      ligne(`=${dec(v)}`),
    ],
  };
  const utiliseB: Record<ExerciceFamilleAPannes["demandeEcran2"], Fragments> = {
    lesDeux: [texte("Les deux événements se produisent : c'est l'intersection, et pour deux événements indépendants, "), latex("P(A_1\\cap A_2)=P(A_1)\\cdot P(A_2)")],
    aucun: [texte("Aucun ne se produit : c'est "), latex("\\overline{A_1}\\cap\\overline{A_2}"), texte(". Les contraires de deux événements indépendants sont encore indépendants : on multiplie")],
    auMoinsUn: [texte("« Au moins un » est le contraire de « aucun » : "), latex("P(A_1\\cup A_2)=1-P(\\overline{A_1}\\cap\\overline{A_2})"), texte(", et l'intersection des contraires se calcule par un produit (indépendance)")],
    exactementUn: [texte("Exactement un : soit "), latex("A_1"), texte(" seul, soit "), latex("A_2"), texte(" seul ; ces deux cas sont incompatibles, on additionne leurs probabilités, chacune obtenue par un produit (indépendance)")],
  };
  const piegeB: Record<ExerciceFamilleAPannes["demandeEcran2"], Fragments> = {
    lesDeux: [texte("« Et » avec des événements indépendants donne un produit, pas une somme : "), latex(`${p1}+${p2}`), texte(" est faux.")],
    aucun: [texte("« Aucun » n'est pas le contraire de « les deux » : "), latex(`1-${p1}\\times ${p2}`), texte(" est la probabilité que les deux ne se produisent pas en même temps.")],
    auMoinsUn: [texte("La somme "), latex(`${p1}+${p2}`), texte(" compte deux fois le cas où les deux se produisent.")],
    exactementUn: [texte("Il y a deux cas : n'en calculer qu'un seul, ou calculer "), latex(`${p1}\\times ${p2}`), texte(" (les deux à la fois), est faux.")],
  };
  return [
    utiliseCours(a, [texte("Événement contraire : "), latex("P(\\overline{A})=1-P(A)")], COURS),
    calcul(a, [ligne("P(\\overline{A_1})=1-P(A_1)", "événement contraire"), ligne(`=1-${p1}`), ligne(`=${q1}`), ligne("P(\\overline{A_2})=1-P(A_2)", "événement contraire"), ligne(`=1-${p2}`), ligne(`=${q2}`)]),
    resultat(a, reponse(e, "aPannesEcran1")),
    piege(a, [texte("Prendre "), latex("P(A_1)"), texte(" au lieu de sa probabilité contraire quand la question porte sur « ne pas » se produire.")]),
    utiliseCours(b, utiliseB[e.demandeEcran2], COURS),
    calcul(b, lignes[e.demandeEcran2]),
    resultat(b, reponse(e, "aPannesEcran2")),
    ...(e.demandeEcran2 === "auMoinsUn" ? [verification(b, [texte("Par l'union : "), latex(`${p1}+${p2}-${p1}\\times ${p2}=${dec(v)}`), texte(".")])] : []),
    piege(b, piegeB[e.demandeEcran2]),
  ];
}

// ============================================================================
// Famille A — union et indépendance
// ============================================================================

function etapesAUnion(e: ExerciceFamilleAUnion): EtapeCorrection[] {
  const pB = pBDeduitUnion(e);
  const pA = dec(e.pA);
  const u = dec(e.pAouB);
  return [
    utiliseCours("a", [texte("Événement contraire : "), latex("P(\\overline{A})=1-P(A)")], COURS),
    calcul("a", [ligne("P(\\overline{A})=1-P(A)", "événement contraire"), ligne(`=1-${pA}`), ligne(`=${dec(1 - e.pA)}`)]),
    resultat("a", reponse(e, "aUnionEcran1")),
    piege("a", [texte("Confondre "), latex("P(\\overline{A})"), texte(" et "), latex("P(A)"), texte(".")]),
    utiliseCours("b", [texte("Formule de l'union, avec l'indépendance pour l'intersection : "), latex("P(A\\cup B)=P(A)+P(B)-P(A)\\cdot P(B)")], COURS),
    calcul("b", [
      ligne(`${u}=${pA}+P(B)-${pA}\\cdot P(B)`, "on remplace"),
      ligne(`${u}-${pA}=P(B)\\cdot(1-${pA})`, "on isole, P(B) en facteur"),
      ligne(`${dec(e.pAouB - e.pA)}=P(B)\\cdot ${dec(1 - e.pA)}`),
      ligne(`P(B)=\\dfrac{${dec(e.pAouB - e.pA)}}{${dec(1 - e.pA)}}`, `on divise par ${dec(1 - e.pA).replace("{,}", ",")}`),
      ligne(egal4(pB)),
    ]),
    resultat("b", reponse(e, "aUnionEcran2")),
    verification("b", [latex(`${pA}+${dec(pB, 4)}-${pA}\\times ${dec(pB, 4)}${estDecimalCourt(pB) ? "=" : "\\approx "}${u}`), texte(".")]),
    piege("b", [texte("A et B ne sont pas incompatibles : "), latex(`P(B)=${u}-${pA}`), texte(" oublie le terme "), latex("-P(A)\\cdot P(B)"), texte(".")]),
    utiliseCours("c", [texte("A et B sont indépendants : "), latex("P(A\\cap B)=P(A)\\cdot P(B)"), texte(", donc savoir que l'un est réalisé ne change pas la probabilité de l'autre")], COURS),
    calcul("c", [
      ligne("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}", "définition"),
      ligne("=\\dfrac{P(A)\\cdot P(B)}{P(B)}", "indépendance"),
      ligne("=P(A)", "on simplifie par P(B)"),
      ligne(`=${pA}`),
      ligne("P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}", "définition"),
      ligne("=P(B)", "même raisonnement"),
      ligne(egal4(pB)),
    ]),
    resultat("c", reponse(e, "aUnionEcran3")),
    piege("c", [texte("Recalculer les conditionnelles sans voir qu'elles valent "), latex("P(A)"), texte(" et "), latex("P(B)"), texte(" : c'est justement ce que dit l'indépendance.")]),
  ];
}

// ============================================================================
// Famille B — test d'indépendance
// ============================================================================

const LIBELLE_VERDICT = { incompatibles: "A et B sont incompatibles", independants: "A et B sont indépendants", ni: "A et B ne sont ni incompatibles, ni indépendants" } as const;

function etapesBTest(e: ExerciceFamilleBTestIndependance): EtapeCorrection[] {
  const { n, nA, nB, nAetB } = effectifsTest(e);
  const verdict = verdictTestIndependance(e);
  const lignesA: LigneCalcul[] =
    e.methode === "produit"
      ? [...lignesFraction4("P(A)", nA, n, "total de la ligne A sur le total"), ...lignesFraction4("P(B)", nB, n, "total de la colonne B sur le total"), ...lignesFraction4("P(A\\cap B)", nAetB, n, "case A ∩ B sur le total")]
      : [...lignesFraction4("P(A)", nA, n, "total de la ligne A sur le total"), ...lignesFraction4("P(A|B)", nAetB, nB, "on choisit seulement dans la colonne B")];
  const N2 = n * n;
  const lignesB: LigneCalcul[] = [];
  if (verdict === "incompatibles") {
    lignesB.push(ligne("n(A\\cap B)=0", "case vide"), ligne("P(A\\cap B)=0"), ligne(`P(A)\\cdot P(B)=${brute(nA, n)}\\times ${brute(nB, n)}`, "produit des probabilités"), ligne(`=${brute(nA * nB, N2)}`), ligne(`0\\neq ${brute(nA * nB, N2)}`, [texte("donc "), latex("P(A\\cap B)\\neq P(A)\\cdot P(B)")]));
  } else if (e.methode === "produit") {
    const egal = nAetB * n === nA * nB;
    lignesB.push(
      ligne(`P(A)\\cdot P(B)=${brute(nA, n)}\\times ${brute(nB, n)}`, "produit des probabilités"),
      ligne(`=${brute(nA * nB, N2)}`),
      ligne(`P(A\\cap B)=${brute(nAetB, n)}`),
      ligne(`=${brute(nAetB * n, N2)}`, `même dénominateur ${N2}`),
      ligne(`${brute(nAetB * n, N2)}${egal ? "=" : "\\neq "}${brute(nA * nB, N2)}`, [texte("donc "), latex(egal ? "P(A\\cap B)=P(A)\\cdot P(B)" : "P(A\\cap B)\\neq P(A)\\cdot P(B)")]),
    );
  } else {
    const egal = nAetB * n === nA * nB;
    lignesB.push(
      ligne(`${nAetB}\\times ${n}=${nAetB * n}`, [texte("produit en croix de "), latex(`P(A|B)=${brute(nAetB, nB)}`)]),
      ligne(`${nA}\\times ${nB}=${nA * nB}`, [texte("produit en croix de "), latex(`P(A)=${brute(nA, n)}`)]),
      ligne(`${nAetB * n}${egal ? "=" : "\\neq "}${nA * nB}`, [texte("donc "), latex(egal ? "P(A|B)=P(A)" : "P(A|B)\\neq P(A)")]),
    );
  }
  const conclusion: Fragments =
    verdict === "incompatibles"
      ? [texte(`${LIBELLE_VERDICT.incompatibles} (et donc pas indépendants).`)]
      : verdict === "independants"
        ? [texte(`${LIBELLE_VERDICT.independants} (mais pas incompatibles, car `), latex("P(A\\cap B)\\neq 0"), texte(").")]
        : [texte("L'égalité n'est pas vérifiée et "), latex("P(A\\cap B)\\neq 0"), texte(` : ${LIBELLE_VERDICT.ni}.`)];
  return [
    { ...utiliseCours("a", [texte("On complète les totaux du tableau ; chaque probabilité est un effectif divisé par l'effectif du groupe dans lequel on choisit")], COURS), figureHtml: tableauTestSvg(e, true) },
    calcul("a", lignesA),
    resultat("a", reponse(e, "bIndepEcran1")),
    piege("a", [texte("Diviser par le total général pour "), latex("P(A|B)"), texte(" : on ne choisit que parmi les individus de B.")]),
    utiliseCours("b", [texte("Incompatibles : "), latex("P(A\\cap B)=0"), texte(". Indépendants : "), latex("P(A\\cap B)=P(A)\\cdot P(B)"), texte(", ou de façon équivalente "), latex("P(A|B)=P(A)"), texte(" — une égalité exacte, vérifiée sur les fractions")], COURS),
    calcul("b", lignesB),
    resultat("b", conclusion),
    piege("b", [texte("Incompatibles et indépendants ne sont pas synonymes : deux événements incompatibles de probabilités non nulles ne sont jamais indépendants. Et des valeurs arrondies « presque égales » ne prouvent pas l'indépendance.")]),
  ];
}

// ============================================================================
// Famille B — lecture d'un tableau (donné ou reconstruit)
// ============================================================================

function utiliseTable(t: TableauDouble, type: TypeQuestionTable, ligneT: number, colonne: number): Fragments {
  const l = `« ${t.libelleLignes[ligneT]} »`;
  const c = `« ${t.libelleColonnes[colonne]} »`;
  switch (type) {
    case "jointe":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = la case au croisement de la ligne ${l} et de la colonne ${c}`)];
    case "margLigne":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = le total de la ligne ${l}`)];
    case "margColonne":
      return [texte(`On choisit dans tout le tableau : dénominateur = total général ; numérateur = le total de la colonne ${c}`)];
    case "condLigneSachantColonne":
      return [texte(`Probabilité conditionnelle : on choisit seulement dans la colonne ${c} ; dénominateur = total de cette colonne, numérateur = la case de la ligne ${l}`)];
    case "condColonneSachantLigne":
      return [texte(`Probabilité conditionnelle : on choisit seulement dans la ligne ${l} ; dénominateur = total de cette ligne, numérateur = la case de la colonne ${c}`)];
  }
}

function justificationTable(type: TypeQuestionTable): string {
  return type === "jointe" ? "case sur total général" : type === "margLigne" ? "total de la ligne sur total général" : type === "margColonne" ? "total de la colonne sur total général" : type === "condLigneSachantColonne" ? "case sur total de la colonne" : "case sur total de la ligne";
}

function etapesQuestionTable(t: TableauDouble, type: TypeQuestionTable, ligneT: number, colonne: number, L: string, avecFigure: boolean, piegeFr: Fragments): EtapeCorrection[] {
  const [num, den] = fractionDepuisTable(t, type, ligneT, colonne);
  const lignes = lignesFraction4("p", num, den, justificationTable(type));
  return [
    { ...utiliseCours(L, utiliseTable(t, type, ligneT, colonne), COURS), ...(avecFigure ? { figureHtml: tableauDoubleSvg(t, true, "Tableau des effectifs avec les totaux") } : {}) },
    calcul(L, lignes),
    resultat(L, [latex(`p=${frac(num, den)}${num % den === 0 ? "" : egal4(num / den)}`)]),
    piege(L, piegeFr),
  ];
}

function etapesBTable(e: ExerciceFamilleBTableauDonne): EtapeCorrection[] {
  const qs = questionsTableDonne(e);
  const etapes: EtapeCorrection[] = [];
  qs.forEach((q, i) => {
    const total = totalTable(e.table);
    const [, den] = fractionDepuisTable(e.table, q.type, e.ligneCible, e.colonneCible);
    const piegeFr: Fragments =
      i === 2
        ? [texte("On ne choisit que parmi les individus d'un groupe : le dénominateur est leur total, "), latex(String(den)), texte(", pas le total général "), latex(String(total)), texte(" (qui donnerait la probabilité de l'intersection).")]
        : i === 1
          ? [texte("Prendre le total d'une ligne ou d'une colonne : « et » désigne une seule case.")]
          : [texte("Prendre une seule case au lieu du total de la ligne (ou de la colonne).")];
    etapes.push(...etapesQuestionTable(e.table, q.type, e.ligneCible, e.colonneCible, LETTRES[i], i === 0, piegeFr));
  });
  return etapes;
}

function etapesBRecon(e: ExerciceFamilleBReconstruire): EtapeCorrection[] {
  const [r0, r1, r2] = totauxLigneReconstruire(e);
  const table = tableCompleteReconstruire(e);
  const [p1, p2, p3] = e.pourcentageLigne;
  const nC1 = totalColonne1Reconstruire(e);
  const c00 = cellule00Reconstruire(e);
  const c10 = cellule10Reconstruire(e);
  const c20 = cellule20Reconstruire(e);
  const tableAvecLibelles: TableauDouble = { libelleLignes: e.contexte.libelleLignes.map((l, i) => `${l} (L${["₁", "₂", "₃"][i]})`), libelleColonnes: e.contexte.libelleColonnes.map((c, j) => `${c} (C${["₁", "₂"][j]})`), cellules: table.cellules };
  const pct = (p: number, total: number, nom: string, v: number): LigneCalcul[] => [ligne(`${nom}=\\dfrac{${p}}{100}\\times ${total}`, `${p} % de l'effectif total`), ligne(`=${v}`)];
  return [
    utiliseCours("a", [texte("Un pourcentage s'applique à l'effectif du groupe dont il parle : "), latex("\\dfrac{p}{100}\\times N"), texte(" pour toute la population, "), latex("\\dfrac{p}{100}\\times n(L_1)"), texte(" pour un pourcentage « de L₁ »")], COURS),
    calcul("a", [
      ...pct(p1, e.total, "n(L_1)", r0),
      ...pct(p2, e.total, "n(L_2)", r1),
      ...pct(p3, e.total, "n(L_3)", r2),
      ligne(`n(L_1\\cap C_1)=\\dfrac{${e.pourcentageReussiteLigne1}}{100}\\times ${r0}`, "pourcentage de la ligne L₁"),
      ligne(`=${c00}`),
      ligne(`n(L_2\\cap C_1)=\\dfrac{${e.pourcentageReussiteLigne2}}{100}\\times ${r1}`, "pourcentage de la ligne L₂"),
      ligne(`=${c10}`),
    ]),
    resultat("a", reponse(e, "bReconEcran1")),
    piege("a", [texte(`« ${e.pourcentageReussiteLigne1} % de L₁ » se calcule sur n(L₁) = ${r0}, pas sur l'effectif total ${e.total}.`)]),
    utiliseCours("b", [texte("Par différence : la colonne "), latex("C_1"), texte(" a pour total son pourcentage global de l'effectif, et chaque ligne redonne son total")], COURS),
    calcul("b", [
      ligne(`n(C_1)=\\dfrac{${e.pourcentageReussiteGlobale}}{100}\\times ${e.total}`, "pourcentage global"),
      ligne(`=${nC1}`),
      ligne(`n(L_3\\cap C_1)=${nC1}-${c00}-${c10}`, "total de la colonne C₁"),
      ligne(`=${c20}`),
      ligne(`n(L_1\\cap C_2)=${r0}-${c00}`, "total de la ligne L₁"),
      ligne(`=${table.cellules[0][1]}`),
      ligne(`n(L_2\\cap C_2)=${r1}-${c10}`, "total de la ligne L₂"),
      ligne(`=${table.cellules[1][1]}`),
      ligne(`n(L_3\\cap C_2)=${r2}-${c20}`, "total de la ligne L₃"),
      ligne(`=${table.cellules[2][1]}`),
    ]),
    { ...resultat("b", reponse(e, "bReconEcran2")), figureHtml: tableauDoubleSvg(tableAvecLibelles, true, "Tableau des effectifs reconstruit, avec les totaux") },
    verification("b", [texte("Total général : "), latex(`${r0}+${r1}+${r2}=${e.total}`), texte(".")]),
    piege("b", [texte("Calculer la case manquante de "), latex("C_1"), texte(" avec un pourcentage de ligne : elle se déduit du total de la colonne.")]),
    ...etapesQuestionTable(table, e.typeQuestionFinale, e.ligneCibleFinale, e.colonneCibleFinale, "c", false, [texte("Se tromper de groupe de choix : le dénominateur est l'effectif du groupe parmi lequel on choisit.")]),
  ];
}

// ============================================================================
// Famille C — Bayes
// ============================================================================

function etapesC(e: ExerciceFamilleC): EtapeCorrection[] {
  const [b1, b2, b3, b4] = branchesArbreC(e);
  const pE = probabiliteEffetC(e);
  const p = dec(e.p);
  const q1 = dec(e.q1);
  const q2 = dec(e.q2);
  const effet = e.demandeEcran3 === "cause1SachantEffet";
  const bayes = bayesEcran3C(e);
  return [
    { ...utiliseCours("a", [texte("Arbre : d'abord la cause ("), latex("c_1"), texte(" ou "), latex("c_2"), texte("), puis l'effet ; branches issues d'un même nœud de somme 1 ; probabilité d'un chemin = produit des probabilités de ses branches")], COURS), figureHtml: arbreBayesSvg(e) },
    calcul("a", [
      ligne("P(c_2)=1-P(c_1)", "branches complémentaires"),
      ligne(`=1-${p}`),
      ligne(`=${dec(1 - e.p)}`),
      ligne(`P(c_1\\cap E)=${p}\\times ${q1}`, "règle du produit"),
      ligne(`=${dec(b1)}`),
      ligne(`P(c_1\\cap\\overline{E})=${p}\\times ${dec(1 - e.q1)}`, [texte("car "), latex(`P(\\overline{E}|c_1)=1-${q1}`)]),
      ligne(`=${dec(b2)}`),
      ligne(`P(c_2\\cap E)=${dec(1 - e.p)}\\times ${q2}`, "règle du produit"),
      ligne(`=${dec(b3)}`),
      ligne(`P(c_2\\cap\\overline{E})=${dec(1 - e.p)}\\times ${dec(1 - e.q2)}`, [texte("car "), latex(`P(\\overline{E}|c_2)=1-${q2}`)]),
      ligne(`=${dec(b4)}`),
    ]),
    resultat("a", reponse(e, "cEcran1")),
    verification("a", [texte("Les quatre chemins ont pour somme 1 : "), latex(`${dec(b1)}+${dec(b2)}+${dec(b3)}+${dec(b4)}=1`), texte(".")]),
    piege("a", [texte("Oublier une branche complémentaire ("), latex("1-P(c_1)"), texte(", "), latex("1-P(E|c_1)"), texte(").")]),
    utiliseCours("b", [texte("Formule des probabilités totales : "), latex("P(E)=P(c_1\\cap E)+P(c_2\\cap E)")], COURS),
    calcul("b", [ligne("P(E)=P(c_1\\cap E)+P(c_2\\cap E)", "probabilités totales"), ligne(`=${dec(b1)}+${dec(b3)}`, "chemins de l'étape 1"), ligne(`=${dec(pE)}`)]),
    resultat("b", reponse(e, "cEcran2")),
    piege("b", [texte("Oublier l'un des deux chemins qui mènent à "), latex("E"), texte(".")]),
    utiliseCours("c", [texte("Formule de Bayes : "), latex(effet ? "P(c_1|E)=\\dfrac{P(c_1\\cap E)}{P(E)}" : "P(c_1|\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}"), texte(" (on remonte de l'effet vers la cause)")], COURS),
    calcul(
      "c",
      effet
        ? [ligne("P(c_1|E)=\\dfrac{P(c_1\\cap E)}{P(E)}", "formule de Bayes"), ligne(`=\\dfrac{${dec(b1)}}{${dec(pE)}}`, "étapes 1 et 2"), ligne(egal4(bayes))]
        : [
            ligne("P(\\overline{E})=1-P(E)", "événement contraire"),
            ligne(`=1-${dec(pE)}`),
            ligne(`=${dec(1 - pE)}`),
            ligne("P(c_1|\\overline{E})=\\dfrac{P(c_1\\cap\\overline{E})}{P(\\overline{E})}", "formule de Bayes"),
            ligne(`=\\dfrac{${dec(b2)}}{${dec(1 - pE)}}`, "étapes 1 et 2"),
            ligne(egal4(bayes)),
          ],
    ),
    resultat("c", reponse(e, "cEcran3")),
    piege("c", effet ? [texte("Ne pas confondre "), latex("P(c_1|E)"), texte(" (demandée) avec "), latex(`P(E|c_1)=${q1}`), texte(" (donnée).")] : [latex("P(\\overline{E})=1-P(E)"), texte(", et non "), latex(`1-P(E|c_1)=${dec(1 - e.q1)}`), texte(", qui est une probabilité conditionnelle.")]),
  ];
}

export function correctionDetailleeIndependanceBayes(e: Ex): EtapeCorrection[] {
  if (e.famille === "A") return finaliser(e.sousType === "pannes" ? etapesAPannes(e) : etapesAUnion(e));
  if (e.famille === "B") {
    if (e.sousType === "testIndependance") return finaliser(etapesBTest(e));
    if (e.sousType === "tableauDonne") return finaliser(etapesBTable(e));
    return finaliser(etapesBRecon(e));
  }
  return finaliser(etapesC(e));
}
