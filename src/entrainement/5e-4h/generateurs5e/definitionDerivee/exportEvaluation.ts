import type { ExerciceDefinitionDerivee } from "../../core5e/definitionDerivee.types";
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
import { consigneGenerale, formatFDeXLatex, formatReponseAttendueEcranLatex, nombreTexte, questionSpecifiqueEcran } from "../../ui5e/formatDefinitionDerivee";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDefinitionDerivee } from "./corrigeDetaille";
import { ordreEcrans, type EcranDefinitionDerivee } from "../../moteur5e/typesDefinitionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDefinitionDerivee } from "./index";
import { LIBELLE_CAS_DEFINITION_DERIVEE, profilDefinitionDerivee } from "../profilsEvaluationDerivees25-27";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDefinitionDerivee>` pour 5gen26 (Calculer f'(a)
 * par la définition) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Calcule le nombre dérivé f'(a) à partir de sa
 * définition en termes de limite » (`consigneGenerale`, a substitué). Les écrans du générateur
 * (`ordreEcrans` : développer / taux d'accroissement simplifié / limite — 2 seulement pour une
 * fonction affine, sans écran « taux ») passent dans le corrigé « Étape n — consigne », avec la
 * consigne de l'écran (`questionSpecifiqueEcran`).
 *
 * Valeurs : `formatReponseAttendueEcranLatex` (réponses attendues de l'écran, a substitué) et
 * `texteAideNiveau1` (méthodes) — jamais recalculées ici.
 *
 * `regroupable` : non — la consigne contient la valeur de a tirée.
 */

function fonctionLatex(exercice: ExerciceDefinitionDerivee): string {
  return formatFDeXLatex(exercice);
}

function entete(exercice: ExerciceDefinitionDerivee): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(fonctionLatex(exercice)), texte(".")];
}

function consigneEtape(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): FragmentConsigne[] {
  const q = questionSpecifiqueEcran(exercice, ecran);
  return [texte(q.texteAvant), ...(q.latex ? [texte(" "), latex(q.latex)] : []), ...(q.texteApres ? [texte(/^[.,;:]/.test(q.texteApres) ? q.texteApres : ` ${q.texteApres}`)] : [])];
}

function construireEnonceDefinitionDerivee(exercice: ExerciceDefinitionDerivee): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcrans(exercice).map((ecran) => ({ consigne: consigneEtape(exercice, ecran) })) };
}

function enoncePapierDefinitionDerivee(exercice: ExerciceDefinitionDerivee): EnoncePapier {
  return { section: { enteteFragments: [...entete(exercice), texte(` ${consigneGenerale(exercice)}`)], questions: [] } };
}

function valeurFinaleLatex(exercice: ExerciceDefinitionDerivee): string {
  return formatReponseAttendueEcranLatex(exercice, "limite")[0];
}

function reponseBreveDefinitionDerivee(exercice: ExerciceDefinitionDerivee): FragmentConsigne[] {
  return [latex(valeurFinaleLatex(exercice))];
}

function baremeDefinitionDerivee(exercice: ExerciceDefinitionDerivee): BaremeExercice {
  const a = nombreTexte(exercice.a);
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  const criteres =
    exercice.famille === "affine"
      ? [
          c("a", `Valeur de f(${a})`, 0.5),
          c("a", `f(${a} + h) développé et réduit`, 1),
          c("b", `Différence f(${a} + h) − f(${a}) et simplification par h`, 1.5),
          c("b", `Passage à la limite : valeur de f'(${a})`, 1),
        ]
      : [
          c("a", `Valeur de f(${a})`, 0.5),
          c(
            "a",
            exercice.famille === "quadratique" || exercice.famille === "quadratiqueComplete"
              ? `f(${a} + h) développé et réduit`
              : exercice.famille === "racine"
                ? `f(${a} + h) avec la somme sous la racine réduite`
                : `f(${a} + h) écrit avec un seul numérateur et un seul dénominateur`,
            1,
          ),
          c("b", "Taux d'accroissement simplifié (le facteur h a disparu)", 1.5),
          c("c", `Passage à la limite : valeur de f'(${a})`, 1),
        ];
  return {
    reponseFinale: reponseBreveDefinitionDerivee(exercice),
    criteres,
    erreursFrequentes: [
      exercice.famille === "quadratique" || exercice.famille === "quadratiqueComplete"
        ? { description: [texte(`Oubli du terme croisé en développant le carré de ${a} + h`)], cout: `0 pt sur f(${a} + h)` }
        : { description: [texte("Remplacer h par 0 avant d'avoir simplifié le facteur h (forme 0/0)")], cout: "0 pt sur la limite" },
      { description: [texte("Résultat donné par les règles de dérivation, sans passer par la définition")], cout: "0 pt sur les étapes de calcul" },
    ],
    reponsesAcceptees: [[texte("f′(a) sous forme de fraction irréductible ou de nombre décimal exact")]],
  };
}

/** Niveau 1–7 : méthode imposée (la définition, méthode 0) ; piège dans les DONNÉES : a négatif
 * (signes en développant (a + h)² ou au même dénominateur), sauf pour une fonction affine où il
 * disparaît. Aucun écran de pure lecture. */
function criteresDifficulteDefinitionDerivee(exercice: ExerciceDefinitionDerivee): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDefinitionDerivee(exercice), []), methode: 0, piege: exercice.famille !== "affine" && exercice.a < 0 ? 1 : 0 };
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDefinitionDerivee(exercice: ExerciceDefinitionDerivee): BlocCorrection[] {
  return correctionDetailleeDefinitionDerivee(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDefinitionDerivee: AdaptateurFeuilleExercices<ExerciceDefinitionDerivee> = {
  titreDocument: "Calculer f′(a) par la définition — Évaluation",
  nomFichierBase: "definition-derivee",
  genererInstance: genererExerciceDefinitionDerivee,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceDefinitionDerivee,
  construireCorrection: construireCorrectionDefinitionDerivee,
  criteresDifficulte: criteresDifficulteDefinitionDerivee,
  reponseBreve: reponseBreveDefinitionDerivee,
  correctionDetaillee: correctionDetailleeDefinitionDerivee,
  bareme: baremeDefinitionDerivee,
  enoncePapier: enoncePapierDefinitionDerivee,
  profilInstance: profilDefinitionDerivee,
  libelleCasParticulier: LIBELLE_CAS_DEFINITION_DERIVEE,
};
