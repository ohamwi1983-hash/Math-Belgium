import type { ExerciceEtudierFonction } from "../../core5e/etudierFonction.types";
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
import { formatCoordonneesLatex, formatDomaineLatex, formatFDeXLatex, formatFPrimeDeXLatex, formatFSecondeDeXLatex, formatResumeTableauLatex } from "../../ui5e/formatEtudierFonction";
import { ordreEcransEtudierFonction, type EcranEtudierFonction } from "../../moteur5e/typesEtudierFonction";
import { etapesDuCorrige, lignesCalculParEtape } from "../../../export/niveauDifficulte";
import { correctionDetailleeEtudierFonction, lettresLectureEtudierFonction } from "./corrigeDetaille";
import { asymptotesLatex } from "./figures";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudierFonction } from "./index";
import { profilEtudierFonction } from "../profilsEvaluationDerivees31-33";
import type { ExerciceRationnelleAO } from "../../core5e/etudierFonction.types";
import type { ExerciceEtudeLocale } from "../../core5e/etudeLocale.types";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudierFonction>` pour 5gen31 (« Étudier une
 * fonction », chapitre 5 de 5e « Dérivées et applications ») — feuille d'exercices et évaluation,
 * selon `.claude/rules/feuilles-evaluations.md`.
 *
 * - **Énoncé papier** (`enoncePapier`) = la fonction + 4 VRAIES questions du problème (domaine et
 *   asymptotes ; f′ et variations ; f″ et concavité ; coordonnées des points remarquables et allure
 *   du graphique). Aucune ne révèle la réponse d'une autre (pas de « la valeur exclue x = … », pas de
 *   nombre d'extremums annoncé).
 * - **Étapes** (`construireEnonce`) = un écran du générateur par étape, dans l'ordre de l'écran
 *   (`ordreEcransEtudierFonction`, écran « recap » purement présentationnel exclu) : elles
 *   deviennent les titres « Étape n — consigne » du corrigé.
 * - **Corrigé** tiré des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `formatResumeTableauLatex`, `formatCoordonneesLatex`, `tableauFPrimeAttendu`…, `valeurF` qui
 *   inclut le décalage vertical des rationnelles). Les deux tableaux de signes et le graphique
 *   (courbe, asymptotes, points remarquables) sont donnés en figures (`figureHtml`).
 */

const LETTRES = "abcdefghij";

/** Étapes = écrans du générateur, sans l'écran « recap » (aucune nouvelle question). */
function etapes(exercice: ExerciceEtudierFonction): EcranEtudierFonction[] {
  return ordreEcransEtudierFonction(exercice).filter((e) => e !== "recap");
}

function lettreDe(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string {
  return LETTRES[etapes(exercice).indexOf(ecran)] ?? "a";
}

function fonctionFragments(exercice: ExerciceEtudierFonction): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(formatFDeXLatex(exercice)), texte(".")];
}

// ============================================================================
// Étapes (une par écran) — consignes rédigées pour le papier (rien de propre à la saisie).
// ============================================================================

function consigneEtape(ecran: EcranEtudierFonction): FragmentConsigne[] {
  switch (ecran) {
    case "domaine":
      return [texte("Détermine le domaine de définition de f.")];
    case "limites":
      return [texte("Calcule les limites de f aux bornes de son domaine et en −∞ et +∞ ; donne l'équation de chaque asymptote.")];
    case "calculerFPrime":
      return [texte("Calcule "), latex("f'(x)"), texte(".")];
    case "tableauFPrime":
      return [texte("Dresse le tableau de signes de "), latex("f'"), texte(" et déduis-en les variations de f (nature de chaque zéro de "), latex("f'"), texte(").")];
    case "calculerFSeconde":
      return [texte("Calcule "), latex("f''(x)"), texte(".")];
    case "tableauFSeconde":
      return [texte("Dresse le tableau de signes de "), latex("f''"), texte(" et déduis-en la concavité de f (points d'inflexion).")];
    case "coordonnees":
      return [texte("Calcule les coordonnées des points remarquables de f.")];
    case "graphique":
      return [texte("Trace l'allure du graphique de f.")];
    case "recap":
      return [];
  }
}

function construireEnonceEtudierFonction(exercice: ExerciceEtudierFonction): SectionExercice {
  return { enteteFragments: fonctionFragments(exercice), questions: etapes(exercice).map((e) => ({ consigne: consigneEtape(e) })) };
}

/** 4 vraies questions : (domaine +) limites | f′ + tableau | f″ + tableau | coordonnées + graphique. */
function enoncePapierEtudierFonction(exercice: ExerciceEtudierFonction): EnoncePapier {
  const l = (e: EcranEtudierFonction) => lettreDe(exercice, e);
  const avecDomaine = etapes(exercice).includes("domaine");
  return {
    section: {
      enteteFragments: [...fonctionFragments(exercice), texte(" Étudie cette fonction.")],
      questions: [
        { consigne: [texte("Détermine le domaine de définition de f, puis les limites de f aux bornes de son domaine et en −∞ et +∞. Donne l'équation de chaque asymptote éventuelle.")] },
        { consigne: [texte("Calcule "), latex("f'(x)"), texte(", dresse son tableau de signes et déduis-en les variations de f ainsi que la nature de chaque zéro de "), latex("f'"), texte(".")] },
        { consigne: [texte("Calcule "), latex("f''(x)"), texte(", dresse son tableau de signes et déduis-en la concavité de f et ses éventuels points d'inflexion.")] },
        { consigne: [texte("Calcule les coordonnées des points remarquables de f (extremums, points d'inflexion et point d'abscisse 0), puis trace l'allure du graphique de f.")] },
      ],
    },
    etapesParQuestion: [avecDomaine ? [l("domaine"), l("limites")] : [l("limites")], [l("calculerFPrime"), l("tableauFPrime")], [l("calculerFSeconde"), l("tableauFSeconde")], [l("coordonnees"), l("graphique")]],
    reponseBreve: reponseBreveEtudierFonction(exercice, true),
  };
}

// ============================================================================
// Valeurs communes.
// ============================================================================

function joindre(valeurs: string[], separateur = " ; "): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => (i === 0 ? [latex(v)] : [texte(separateur), latex(v)]));
}

function reponseBreveEtudierFonction(exercice: ExerciceEtudierFonction, parQuestion = false): FragmentConsigne[] {
  const asym = asymptotesLatex(exercice);
  const morceaux: FragmentConsigne[][] = [
    [latex(formatDomaineLatex(exercice)), texte(" ; "), ...(asym.length === 0 ? [texte("aucune asymptote")] : [texte("asymptotes "), ...joindre(asym, ", ")])],
    [latex(formatFPrimeDeXLatex(exercice)), texte(" ; "), ...joindre(formatResumeTableauLatex(exercice, "fprime"), ", ")],
    [latex(formatFSecondeDeXLatex(exercice)), texte(" ; "), ...joindre(formatResumeTableauLatex(exercice, "fseconde"), ", ")],
    [...joindre(formatCoordonneesLatex(exercice), ", ")],
  ];
  return morceaux.flatMap((m, i) => [...(i > 0 ? [texte(" — ")] : []), ...(parQuestion ? [texte(`${LETTRES[i]}) `)] : []), ...m]);
}

function baremeEtudierFonction(exercice: ExerciceEtudierFonction): BaremeExercice {
  const l = (e: EcranEtudierFonction) => lettreDe(exercice, e);
  const avecDomaine = etapes(exercice).includes("domaine");
  const c = (sousQuestion: string, t: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(t)], points });
  return {
    reponseFinale: reponseBreveEtudierFonction(exercice, true),
    criteres: [
      c(avecDomaine ? l("domaine") : l("limites"), "Domaine, limites aux bornes et équations des asymptotes", 1),
      c(l("calculerFPrime"), "f′(x) correcte", 0.5),
      c(l("tableauFPrime"), "Tableau de signes de f′, variations et nature des zéros", 0.5),
      c(l("calculerFSeconde"), "f″(x) correcte", 0.5),
      c(l("tableauFSeconde"), "Tableau de signes de f″ et concavité (points d'inflexion)", 0.5),
      c(l("coordonnees"), "Coordonnées des points remarquables", 0.5),
      c(l("graphique"), "Allure du graphique cohérente (points, asymptotes, variations)", 0.5),
    ],
    erreursFrequentes: [
      { description: [texte("Classer une racine double de f′ comme extremum")], cout: "0 pt sur le tableau de f′" },
      { description: [texte("Calculer l'ordonnée d'un point dans f′(x) au lieu de f(x)")], cout: "0 pt sur les coordonnées" },
      ...(exercice.famille === "rationnelleAO" ? [{ description: [texte("Inclure la fraction dans l'équation de l'asymptote oblique")], cout: "−0,5" }] : []),
    ],
    reponsesAcceptees: [[texte("Ordonnées exactes (fraction, racine) ; f′ et f″ sous une forme équivalente (développée ou factorisée)")]],
  };
}

/** Niveau 1–7 : méthode 1 (fonction donnée, l'élève choisit les techniques de l'étude) ; piège 1
 * quand les DONNÉES en contiennent un — valeur exclue (rationnelles à asymptotes), polynôme (racine
 * double possible : la nature des zéros est le verdict, le piège reste constant dans la famille), 0
 * pour la rationnelle sans valeur exclue ; nombres = profil (racines irrationnelles) ; l'écran
 * « graphique » (placer des points déjà calculés) est une lecture. */
function criteresDifficulteEtudierFonction(exercice: ExerciceEtudierFonction): CriteresDifficulte {
  const piege = exercice.famille === "etudeLocale" && exercice.noyau.type === "rationnelleSansCE" ? 0 : 1;
  // Groupes à verdict (lot D) : « sans extremum » prend le niveau et la durée du membre « avec
  // extremums » du même groupe — la feuille ne trahit pas le verdict.
  // La charge vient du corrigé de l'instance : celle du jumeau est imposée par `lignesMinimales`.
  const reference = referenceVerdict(exercice);
  const corrigeReference = correctionDetailleeEtudierFonction(reference);
  return {
    ...etapesDuCorrige(corrigeReference, lettresLectureEtudierFonction(reference)),
    methode: 1,
    piege,
    nombres: 0,
    ...(reference !== exercice ? { lignesMinimales: Object.fromEntries(lignesCalculParEtape(corrigeReference)) } : {}),
  };
}

/** Jumeau « avec extremums » d'une instance sans extremum (même famille, mêmes paramètres visibles) :
 * polynomiale à racine double → 2x³ − 6x + d (zéros de f′ : −1 et 1) ; asymptote oblique sans
 * extremum → même a, b, e avec c = a (zéros de f′ : e − 1 et e + 1). */
function referenceVerdict(e: ExerciceEtudierFonction): ExerciceEtudierFonction {
  const entier = (n: number) => ({ exact: true as const, valeur: { num: n, den: 1 } });
  if (e.famille === "rationnelleAO") {
    if (e.racinesFPrime.length > 0) return e;
    const ao: ExerciceRationnelleAO = { famille: "rationnelleAO", a: e.a, b: e.b, e: e.e, c: 4 * e.a, racinesFPrime: [entier(e.e - 2), entier(e.e + 2)], classificationFPrime: e.a > 0 ? ["max", "min"] : ["min", "max"] };
    return ao;
  }
  const n = e.noyau;
  if (n.type !== "polynomiale" || n.natureRacines !== "double") return e;
  const noyau: ExerciceEtudeLocale = { ...n, natureRacines: "simple", a: 2, b: -6, c: -18, racinesFPrime: [entier(-1), entier(3)], classificationFPrime: ["max", "min"], racinesFSeconde: [entier(1)], classificationFSeconde: ["pi"] };
  return { ...e, noyau };
}

/** Groupes à verdict (lot D, audit : `groupe_extremums`) : le nom d'une variante « racine double » ou
 * « aucun extremum » dit le verdict de l'étude ; dans le panneau d'évaluation, une rangée par groupe. */
const GROUPES_VERDICT_ETUDIER_FONCTION = [
  { id: "groupe_extremums_poly", label: "Polynomiale — racines simples ou double (aucune asymptote)", variantes: ["polynomiale-simple", "polynomiale-double"] },
  { id: "groupe_extremums_ao", label: "Rationnelle — asymptote oblique (extremums ou non, racines exactes)", variantes: ["rationnelleAO-exacte", "rationnelleAO-sansExtremum"] },
];


/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionEtudierFonction(exercice: ExerciceEtudierFonction): BlocCorrection[] {
  return correctionDetailleeEtudierFonction(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationEtudierFonction: AdaptateurFeuilleExercices<ExerciceEtudierFonction> = {
  titreDocument: "Étudier une fonction — Dérivées et applications — Évaluation",
  nomFichierBase: "etudier-fonction-derivees-applications",
  genererInstance: genererExerciceEtudierFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudierFonction,
  construireCorrection: construireCorrectionEtudierFonction,
  criteresDifficulte: criteresDifficulteEtudierFonction,
  reponseBreve: (exercice) => reponseBreveEtudierFonction(exercice),
  correctionDetaillee: correctionDetailleeEtudierFonction,
  bareme: baremeEtudierFonction,
  enoncePapier: enoncePapierEtudierFonction,
  profilInstance: profilEtudierFonction,
  groupesVerdict: GROUPES_VERDICT_ETUDIER_FONCTION,
};
