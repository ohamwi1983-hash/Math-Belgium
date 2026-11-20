import type { ExerciceFonctionsCyclometriques } from "../../core6e/fonctionsCyclometriques.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_GENERALE, formatExpressionLatex } from "../../ui6e/formatFonctionsCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionsCyclometriques } from "./index";
import { correctionDetailleeFonctionsCyclometriques as correction, resultatFonctionsCyclometriquesLatex } from "./corrigeDetaille";
import { GROUPES_VERDICT_FONCTIONS_CYCLOMETRIQUES, profilFonctionsCyclometriques } from "../profilsEvaluationCyclometriques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionsCyclometriques>` pour `6gen2` (valeurs
 * cyclométriques : existence et calcul) — feuille d'exercices et évaluation.
 *
 * Un seul écran (existence + valeur exacte) : une seule question, consigne générique
 * (`CONSIGNE_GENERALE`, celle de l'écran) — `regroupable` (plusieurs expressions sous une même
 * question a) b) c)). Corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`).
 */

type E = ExerciceFonctionsCyclometriques;

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [latex(formatExpressionLatex(e))], questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }] };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatExpressionLatex(e))], questions: [] } };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const r = resultatFonctionsCyclometriquesLatex(e);
  return r ? [latex(r)] : [latex(formatExpressionLatex(e)), texte(" n'existe pas.")];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const condition = e.variante === "trigArc" && e.causeInexistence === "anglePiSur2" ? "Domaine vérifié, puis angle intermédiaire et tangente non définie" : "Condition d'existence vérifiée (domaine de l'arcfonction)";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte(condition)], points: 1.5 },
      { sousQuestion: "a", critere: e.existe ? [texte("Valeur intermédiaire exacte (valeur remarquable ou angle dans l'intervalle de restriction)")] : [texte("Conclusion justifiée : l'expression n'existe pas")], points: 1.5 },
      { sousQuestion: "a", critere: reponseBreve(e), points: 1 },
    ],
    erreursFrequentes: [
      e.variante === "arcTrig"
        ? { description: [texte("Simplifier en "), latex("\\arcsin(\\sin\\theta)=\\theta"), texte(" sans vérifier l'intervalle de restriction")], cout: "0 pt sur la valeur" }
        : { description: [texte("Angle hors de l'intervalle de restriction (arccos d'un nombre négatif, par exemple)")], cout: "−1" },
    ],
  };
}

/**
 * Niveau 1–7 — méthode 0 (lecture directe d'une valeur remarquable) ou 1 (composée : valeur
 * intermédiaire puis définition) ; piège : composée (intervalle de restriction, domaine, tangente
 * en π/2 — le même que l'expression existe ou non, l'existence étant la question) ou arccos d'un
 * nombre négatif. Nombres 0 (valeurs exactes).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  const piege: 0 | 1 = e.variante !== "directe" || (e.arcfonction === "arccos" && e.nombreNumerique < 0) ? 1 : 0;
  return { ...etapesDuCorrige(correction(e)), methode: e.variante === "directe" ? 0 : 1, piege, nombres: 0 };
}

export const adaptateurEvaluationFonctionsCyclometriques: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilFonctionsCyclometriques,
  groupesVerdict: GROUPES_VERDICT_FONCTIONS_CYCLOMETRIQUES,
  titreDocument: "Valeurs cyclométriques — Évaluation",
  nomFichierBase: "fonctions-cyclometriques",
  genererInstance: genererExerciceFonctionsCyclometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
  // Une seule question par instance, consigne GÉNÉRIQUE (`CONSIGNE_GENERALE`, constante) — voir
  // `AdaptateurFeuilleExercices.regroupable`.
  regroupable: true,
};
