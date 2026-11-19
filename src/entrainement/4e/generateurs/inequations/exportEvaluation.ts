import type { ExerciceInequation } from "../../core/inequation.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import {
  consigneEtapeInequation,
  correctionDetailleeInequations,
  ensembleLatex,
  lettrePhaseInequation,
  phasesInequation,
  type PhaseInequationCorrige,
} from "./corrigeDetaille";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatInequationLatex } from "../../ui/formatInequation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequation, type VarianteInequationId } from "./index";
import { profilInequationTrinome, LIBELLE_CAS_TRINOME } from "../profilsEvaluation4eCh2Ch3";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceInequation>` pour gen2 (tableau de signes d'un
 * trinôme du second degré, `AppInequation.tsx`).
 *
 * Étapes = les écrans de l'appli (`moteur/sessionInequation.ts`) : simplification (seulement si
 * `necessiteSimplification`, même condition que `phaseInitiale`) → racines de l'équation associée →
 * signe de a → ensemble-solution. Sur papier, ces étapes ne sont PAS des sous-questions : l'énoncé
 * imprimé (`enoncePapier`) ne garde que l'inéquation et la consigne globale, les étapes titrent le
 * corrigé détaillé (voir `.claude/rules/feuilles-evaluations.md`).
 *
 * Toutes les valeurs (delta, racines, a, solution) viennent de l'instance — jamais recalculées
 * indépendamment (voir classification.ts). Après simplification, la suite travaille sur la forme
 * réduite, comme l'écran (`exerciceCourant`) : a, les racines et S sont inchangés (division par un
 * réel positif), Δ est divisé par g².
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

type PhaseInequation = PhaseInequationCorrige;

interface EtapeResolution {
  phase: PhaseInequation;
  consigne: FragmentConsigne[];
}

/** Étapes = écrans de l'appli, dans l'ordre (`corrigeDetaille.ts::phasesInequation`). */
function etapesResolution(instance: ExerciceInequation): EtapeResolution[] {
  return phasesInequation(instance).map((phase) => ({ phase, consigne: consigneEtapeInequation(instance, phase) }));
}

/** Étapes d'apprentissage (une par écran) : titres du corrigé, jamais imprimées dans l'énoncé. */
function construireEnonceInequations(instance: ExerciceInequation): SectionExercice {
  return {
    enteteFragments: [texte("Résous l'inéquation suivante : "), latex(formatInequationLatex(instance.enonce, instance.symbole))],
    questions: etapesResolution(instance).map((e) => ({ consigne: e.consigne })),
  };
}

function enoncePapierInequations(instance: ExerciceInequation): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Résous l'inéquation suivante à l'aide d'un tableau de signes : "), latex(formatInequationLatex(instance.enonce, instance.symbole)), texte(".")],
      questions: [],
    },
  };
}

/** Ancien corrigé (pipelines historiques) : les résultats de chaque étape, en paragraphes. */
function construireCorrectionInequations(instance: ExerciceInequation): BlocCorrection[] {
  return correctionDetailleeInequations(instance)
    .filter((e) => e.type === "resultat")
    .map((e): BlocCorrection => ({ type: "paragraphe", fragments: e.fragments }));
}

function reponseBreveInequations(instance: ExerciceInequation): FragmentConsigne[] {
  return [latex(`S = ${ensembleLatex(instance.solution)}`)];
}

const POIDS: Record<PhaseInequation, number> = { simplification: 0.5, racines: 1.5, signe_a: 0.5, intervalle: 1.5 };

function baremeInequations(instance: ExerciceInequation): BaremeExercice {
  const etapes = etapesResolution(instance);
  const lettre = (phase: PhaseInequation) => LETTRES[etapes.findIndex((e) => e.phase === phase)];
  const criteres: CritereBareme[] = etapes.map((e, i) => ({
    sousQuestion: LETTRES[i],
    critere:
      e.phase === "simplification"
        ? [texte("Division par le plus grand commun diviseur, sens conservé")]
        : e.phase === "racines"
          ? [texte("Discriminant et racines de l'équation associée")]
          : e.phase === "signe_a"
            ? [texte("Signe de a")]
            : [texte("Ensemble-solution, crochets corrects : "), latex(`S = ${ensembleLatex(instance.solution)}`)],
    points: POIDS[e.phase],
  }));
  const erreurs: ErreurFrequente[] = [];
  if (instance.delta > 0) {
    erreurs.push({ description: [texte("Signes intérieur/extérieur des racines inversés")], cout: `0 pt sur ${lettre("intervalle")})` });
    erreurs.push({ description: [texte("Crochets ouverts/fermés inversés (inégalité stricte ou large)")], cout: `moitié des points sur ${lettre("intervalle")})` });
  }
  if (instance.delta === 0) erreurs.push({ description: [texte("Racine double comptée comme deux racines distinctes, ou mal incluse/exclue")], cout: `moitié des points sur ${lettre("intervalle")})` });
  if (instance.delta < 0) erreurs.push({ description: [texte("Δ < 0 conclu en S = ∅ sans regarder le signe de a")], cout: `0 pt sur ${lettre("intervalle")})` });
  return {
    reponseFinale: [latex(`S = ${ensembleLatex(instance.solution)}`)],
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Ensemble écrit avec des inégalités (par exemple "), latex("x < 1"), texte(" ou "), latex("x > 3"), texte(") ; tableau de signes complet à la place de la phrase de signe")]],
  };
}

/** Critères du niveau (grille commune) : étapes = écrans du corrigé, « signe de a » est une lecture ;
 * méthode : choisir la méthode des racines parmi celles du cours ; piège dans les données : Δ ≤ 0
 * (S = ℝ, ∅, un point ou ℝ privé d'un point — un cas qui n'en est pas un) ou a < 0 (signe opposé). */
function criteresDifficulteInequations(instance: ExerciceInequation): CriteresDifficulte {
  const piege = instance.delta <= 0 || instance.enonce.a < 0 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeInequations(instance), [lettrePhaseInequation(instance, "signe_a")]), methode: 1, piege };
}

/** Décision 4 de l'utilisateur (audit 4e ch. 2) : le signe de Δ décide du nombre de racines et de
 * la forme de l'ensemble-solution — le choisir dans le panneau d'évaluation, c'est donner le verdict.
 * Une seule rangée ; variante tirée par `construirePlan`, équilibrée d'une série à l'autre. */
const GROUPES_VERDICT: { id: string; label: string; variantes: VarianteInequationId[] }[] = [
  { id: "groupe_signe_delta", label: "Signe de Δ au hasard (Δ < 0, Δ = 0 ou Δ > 0)", variantes: ["deltaNegatif", "deltaNul", "deltaPositif"] },
];

export const adaptateurEvaluationInequations: AdaptateurFeuilleExercices<ExerciceInequation> = {
  profilInstance: profilInequationTrinome,
  libelleCasParticulier: LIBELLE_CAS_TRINOME,
  titreDocument: "Tableau de signes d'un trinôme du second degré — Évaluation",
  nomFichierBase: "tableau-signes-trinome",
  genererInstance: genererExerciceInequation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  groupesVerdict: GROUPES_VERDICT,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteInequationId),
  construireEnonce: construireEnonceInequations,
  construireCorrection: construireCorrectionInequations,
  criteresDifficulte: criteresDifficulteInequations,
  reponseBreve: reponseBreveInequations,
  correctionDetaillee: correctionDetailleeInequations,
  bareme: baremeInequations,
  enoncePapier: enoncePapierInequations,
};
