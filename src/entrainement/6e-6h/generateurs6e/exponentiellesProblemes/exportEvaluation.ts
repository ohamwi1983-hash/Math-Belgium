import type { ExerciceExponentiellesProblemes } from "../../core6e/exponentiellesProblemes.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, QuestionExercice, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { PhaseExponentiellesProblemes } from "../../moteur6e/typesExponentiellesProblemes";
import { blocDonnees, consigneEcran, consigneGenerale, formatDecimal, formatReponseAttenduePhaseLatex, LIBELLE_PHASE, PHASES_PAR_FAMILLE, uniteTempsProblemes } from "../../ui6e/formatExponentiellesProblemes";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceExponentiellesProblemes } from "./index";
import { correctionDetailleeExponentiellesProblemes } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceExponentiellesProblemes>` pour `6gen12`
 * (Exponentielles : problèmes contextualisés) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par écran (`PHASES_PAR_FAMILLE`, consignes de l'appli) = les
 * étapes du corrigé. L'énoncé PAPIER (`enoncePapier`) garde le contexte, les données et les VRAIES
 * questions du problème (a), b)… ; les étapes de pur guidage — poser le modèle, factoriser la
 * dérivée — passent dans le corrigé). Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts`
 * (source unique, partagée avec `App6gen12.tsx`) ; résultats = `formatReponseAttenduePhaseLatex`.
 */

type E = ExerciceExponentiellesProblemes;
const LETTRES = "abcd";

function fragmentsReponse(e: E, phase: PhaseExponentiellesProblemes): FragmentConsigne[] {
  return [latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

function construireEnonce(e: E): SectionExercice {
  const donnees = blocDonnees(e);
  return {
    enteteFragments: [...consigneGenerale(e), ...(donnees.length > 0 ? [latex(donnees.join(",\\quad "))] : [])],
    questions: PHASES_PAR_FAMILLE[e.famille].map((phase) => ({ consigne: [texte(`${LIBELLE_PHASE[phase]} — `), ...consigneEcran(e, phase)] })),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_PAR_FAMILLE[e.famille].map((phase) => ({ type: "paragraphe", fragments: [texte(`${LIBELLE_PHASE[phase]} : `), ...fragmentsReponse(e, phase)] }));
}

/** Questions papier (vraies questions du problème) et lettres d'étapes (écrans) que chacune couvre. */
function questionsPapier(e: E): { questions: QuestionExercice[]; etapes: string[][]; donnees: string[]; enPlus: FragmentConsigne[] } {
  const u = uniteTempsProblemes(e);
  const donnees = blocDonnees(e);
  switch (e.famille) {
    case "A":
      if (e.sousType === "evaluer") return { questions: [{ consigne: [texte(`Détermine la valeur au bout de ${e.n} ${u}, arrondie à l'unité.`)] }], etapes: [["a", "b"]], donnees, enPlus: [] };
      return {
        questions: [{ consigne: [texte("Détermine l'instant t où la quantité valait "), latex(`\\dfrac{1}{2^{${e.k}}}`), texte(" de sa valeur à l'instant "), latex(`T=${e.T}`), texte(".")] }],
        etapes: [["a", "b"]],
        donnees: donnees.slice(0, 1),
        enPlus: [],
      };
    case "B":
      return {
        questions: [
          { consigne: [texte("Exprime, en fonction de t, ce qui reste à faire "), latex("\\text{reste}(t)"), texte(", puis ce qui est déjà fait "), latex("\\text{complément}(t)=Q_0-\\text{reste}(t)"), texte(".")] },
          { consigne: [texte("Calcule "), latex(`\\text{complément}(${e.n})`), texte(", arrondi au dixième.")] },
          { consigne: [texte("Détermine à partir de quel temps t le complément atteint "), latex(`Q_0-${formatDecimal(e.toleranceSeuil, 1)}`), texte(", arrondi au dixième.")] },
        ],
        etapes: [["a", "b"], ["c"], ["d"]],
        donnees,
        enPlus: [],
      };
    case "C":
      return {
        questions: [
          { consigne: [texte("On suppose une évolution exponentielle "), latex("Q(t)=Q_0\\cdot r^{t}"), texte(". Détermine le taux multiplicateur r (au millième) et "), latex("Q_0"), texte(" (au centième).")] },
          { consigne: [texte("Calcule la valeur aux temps "), latex(e.tempsDemandes.map((t) => `t=${t}`).join(",\\ ")), texte(" (au centième).")] },
        ],
        etapes: [["a", "b"], ["c"]],
        donnees,
        enPlus: [],
      };
    case "D":
      return {
        questions: [
          { consigne: [texte("Calcule le rapport "), latex("\\dfrac{b-c}{a-b}"), texte(" des deux différences consécutives : il vaut "), latex(e.d === 1 ? "r" : `r^{${e.d}}`), texte(".")] },
          { consigne: [texte("Détermine la valeur de stabilisation L, arrondie au dixième.")] },
          { consigne: [texte("Donne l'expression complète de "), latex("T(t)"), texte(".")] },
          { consigne: [texte("Évalue le modèle en "), latex(`t=${e.tSuppl}`), texte(", arrondi au dixième.")] },
        ],
        etapes: [["a"], ["b"], ["c"], ["d"]],
        donnees,
        enPlus: [
          texte(" On note a, b et c ces trois valeurs, mesurées à "),
          latex(`d=${e.d}`),
          texte(` ${e.d === 1 ? "unité" : "unités"} d'intervalle, et on modélise l'évolution par `),
          latex("T(t)=L+C\\cdot r^{t}"),
          texte(" : le rapport de deux différences consécutives porte sur d unités."),
        ],
      };
    case "E":
      return {
        questions: [{ consigne: [texte("Détermine, à l'aide de la dérivée, l'instant t du maximum de f.")] }, { consigne: [texte("Calcule la valeur maximale, arrondie au centième.")] }],
        etapes: [["a", "b"], ["c"]],
        donnees,
        enPlus: [texte(" On la modélise par la fonction f ci-dessous (t en "), texte(`${u}).`)],
      };
    case "F":
      return {
        questions: [
          { consigne: consigneEcran(e, "fEcran1") },
          { consigne: [texte("Calcule "), latex(`p(${e.n1})`), texte(", arrondi au millième.")] },
          { consigne: [texte(`Calcule le nombre de personnes touchées après ${e.n2} ${u}, arrondi à l'unité.`)] },
          { consigne: [texte(`Calcule le bénéfice net après ${e.n2} ${u}, arrondi à l'unité : `), latex("\\text{bénéfice}=\\text{revenu}-(\\text{coûts fixes}+\\text{coûts variables})"), texte(".")] },
        ],
        etapes: [["a"], ["b"], ["c"], ["d"]],
        donnees,
        enPlus: [],
      };
    case "G":
      return {
        questions: [
          { consigne: [texte("Évalue "), latex(`f(${e.tEval1})`), texte(" et "), latex(`f(${e.tEval2})`), texte(", au centième.")] },
          { consigne: [texte("Résous "), latex(`f(t)=${formatDecimal(e.sAffiche, 1)}`), texte(", au centième.")] },
          { consigne: [texte("Compare ce temps à la durée "), latex(`D=${e.duree}`), texte(" : l'objectif est-il atteignable ?")] },
        ],
        etapes: [["a"], ["b"], ["c"]],
        donnees,
        enPlus: [],
      };
  }
}

function enoncePapier(e: E): EnoncePapier {
  const { questions, etapes, donnees, enPlus } = questionsPapier(e);
  const phases = PHASES_PAR_FAMILLE[e.famille];
  const reponse = (lettres: string[]) => lettres.flatMap((l, i) => [...(i > 0 ? [texte(", ")] : []), ...fragmentsReponse(e, phases[LETTRES.indexOf(l)]!)]);
  // Réponse brève alignée sur les questions papier : celle de la DERNIÈRE étape de chaque question,
  // plus r et Q₀ (C a), reste et complément (B a).
  const reponseBreve = questions.length === 1 ? fragmentsReponse(e, phases[phases.length - 1]!) : etapes.flatMap((lettres, q) => [texte(`${q === 0 ? "" : " ; "}${LETTRES[q]}) `), ...(e.famille === "B" || e.famille === "C" ? reponse(lettres) : reponse([lettres[lettres.length - 1]!]))]);
  return {
    section: { enteteFragments: [...consigneGenerale(e), ...enPlus, ...(donnees.length > 0 ? [texte(" Données : "), latex(donnees.join(",\\quad ")), texte(".")] : [])], questions },
    etapesParQuestion: etapes,
    reponseBreve,
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_PAR_FAMILLE[e.famille].flatMap((phase, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...fragmentsReponse(e, phase)]);
}

/**
 * Niveau (grille commune), jugé sur l'énoncé PAPIER : méthode 2 quand l'élève construit le modèle
 * (A : pourcentage composé ou doublements ; B : reste et complément), 1 quand la forme du modèle
 * est donnée (C, D, E, F, G) ; piège dans les DONNÉES : baisse en pourcentage (A), pourcentage du
 * reste (B), valeurs décroissantes r < 1 (C), approche par en dessous C < 0 (D) ; G : la décision
 * est le verdict, piège constant 0. Écran de pure lecture : G c (comparer deux nombres). Nombres :
 * calculatrice partout sauf A « doublement » et D avec d = 1 (données exactes).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  let methode: 0 | 1 | 2 = 1;
  let piege: 0 | 1 = 0;
  switch (e.famille) {
    case "A":
      methode = 2;
      piege = e.sousType === "evaluer" && !e.croissance ? 1 : 0;
      break;
    case "B":
      methode = 2;
      piege = 1;
      break;
    case "C":
      piege = e.r < 1 ? 1 : 0;
      break;
    case "D":
      piege = e.C < 0 ? 1 : 0;
      break;
  }
  // D : données entières exactes ; seule la racine d-ième (d ≥ 2) du rapport demande la calculatrice.
  const nombres: 0 | 1 = (e.famille === "A" && e.sousType === "doublement") || (e.famille === "D" && e.d === 1) ? 0 : 1;
  return { ...etapesDuCorrige(correctionDetailleeExponentiellesProblemes(e), e.famille === "G" ? ["c"] : []), methode, piege, nombres };
}

function bareme(e: E): BaremeExercice {
  const phases = PHASES_PAR_FAMILLE[e.famille];
  const poids = phases.length === 2 ? [2, 2] : phases.length === 3 ? [1, 2, 1] : [1, 1, 1, 1];
  const erreurs: ErreurFrequente[] = [];
  switch (e.famille) {
    case "A":
      erreurs.push(e.sousType === "evaluer" ? { description: [texte("Taux ajouté n fois (croissance linéaire) au lieu d'être multiplié")], cout: "−1" } : { description: [texte("Moitié placée à T/2 au lieu de T − 1")], cout: "−2" });
      break;
    case "B":
      erreurs.push({ description: [texte("Pourcentage appliqué à la quantité de départ au lieu de ce qui reste")], cout: "−1" });
      break;
    case "C":
      erreurs.push({ description: [texte("Exposant 1/t₂ au lieu de 1/(t₂ − t₁)")], cout: "−1" });
      break;
    case "D":
      erreurs.push({ description: [texte("Rapport inversé (a − b)/(b − c)")], cout: "−1" });
      break;
    case "E":
      erreurs.push({ description: [texte("t = 0 retenu comme maximum")], cout: "−1" });
      break;
    case "F":
      erreurs.push({ description: [texte("p(n₁) réutilisé au lieu de recalculer p(n₂)")], cout: "−1" });
      break;
    case "G":
      erreurs.push({ description: [texte("Logarithme pris avant d'isoler l'exponentielle")], cout: "−1" });
      break;
  }
  erreurs.push({ description: [texte("Valeur intermédiaire arrondie trop tôt")], cout: "−0,5" });
  return {
    reponseFinale: fragmentsReponse(e, phases[phases.length - 1]!),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: [texte(`${LIBELLE_PHASE[phase].replace(/^Étape \d+ \(([^)]*)\)$/, "$1")} : `), ...fragmentsReponse(e, phase)], points: poids[i]! })),
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeur arrondie à la précision demandée ; un écart dû à l'arrondi d'une étape intermédiaire est toléré")]],
  };
}

export const adaptateurEvaluationExponentiellesProblemes: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Exponentielles : problèmes contextualisés — Évaluation",
  nomFichierBase: "exponentielles-problemes",
  genererInstance: genererExerciceExponentiellesProblemes,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeExponentiellesProblemes,
  bareme,
  enoncePapier,
};
