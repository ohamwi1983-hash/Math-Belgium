import type { ExerciceEquationExponentielle } from "../../core6e/equationsExponentielles.types";
import { LIBELLE_CAS_EQUATIONS_EXPONENTIELLES, profilEquationsExponentielles } from "../profilsEvaluationExponentielles";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_GENERALE, consigneEcran, formatEnonceLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatEquationsExponentielles";
import { estExactExpo } from "../../ui6e/formatEquationsExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceEquationExponentielle } from "./index";
import { correctionDetailleeEquationsExponentielles as correction, ensembleSolutionsEquExpoLatex, sequenceEquationsExponentielles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationExponentielle>` pour `6gen9` (Résoudre une
 * équation exponentielle) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (consignes de l'écran) — titres d'étapes du corrigé.
 * Papier : l'équation et la consigne globale (« Résous l'équation suivante »). Corrigé détaillé
 * partagé avec l'appli (`corrigeDetaille.ts`), sans logarithme (décision de l'utilisateur).
 */

function construireEnonceEquationsExponentielles(exercice: ExerciceEquationExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(exercice))],
    questions: sequenceEquationsExponentielles(exercice).map((phase) => ({ consigne: consigneEcran(phase, exercice) })),
  };
}

function reponseBreve(exercice: ExerciceEquationExponentielle): FragmentConsigne[] {
  return [latex(ensembleSolutionsEquExpoLatex(exercice))];
}

function construireCorrectionEquationsExponentielles(exercice: ExerciceEquationExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(exercice) }];
}

function enoncePapier(exercice: ExerciceEquationExponentielle): EnoncePapier {
  return { section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatEnonceLatex(exercice)), texte(" Justifie chaque étape.")], questions: [] } };
}

function bareme(exercice: ExerciceEquationExponentielle): BaremeExercice {
  let criteres: CritereBareme[];
  let erreursFrequentes: BaremeExercice["erreursFrequentes"];
  const reponsesAcceptees: FragmentConsigne[][] = [];
  const S = [latex(ensembleSolutionsEquExpoLatex(exercice))];
  switch (exercice.famille) {
    case "A":
      criteres =
        exercice.sousType === "A2"
          ? [
              { sousQuestion: "a", critere: [texte("Radical nul ⟺ radicande nul : "), latex(formatReponseAttenduePhaseLatex(exercice, "aEcran1")[0])], points: 1 },
              { sousQuestion: "b", critere: [texte("Second membre écrit comme une puissance de la même base")], points: 1 },
              { sousQuestion: "b", critere: [texte("Exposants égalés, équation résolue")], points: 1 },
              { sousQuestion: "b", critere: [texte("Solution : "), ...S], points: 1 },
            ]
          : [
              { sousQuestion: "a", critere: [texte("Second membre écrit comme une puissance de la même base (exposant "), latex(formatReponseAttenduePhaseLatex(exercice, "aEcran1")[0]), texte(")")], points: 1 },
              { sousQuestion: "b", critere: [texte("Exposants égalés (injectivité de l'exponentielle)")], points: 1 },
              { sousQuestion: "b", critere: [texte(exercice.sousType === "A3" ? "Équation du second degré résolue (discriminant)" : "Équation du premier degré résolue")], points: 1 },
              { sousQuestion: "b", critere: [texte("Solutions : "), ...S], points: 1 },
            ];
      erreursFrequentes = [{ description: [texte("Exposant mal lu (signe d'un exposant négatif oublié pour une fraction ou un décimal)")], cout: "0 pt sur les étapes 1 et 2" }];
      break;
    case "B":
      criteres = [
        { sousQuestion: "a", critere: [texte("Racine écrite comme puissance : exposant divisé par 2")], points: 1 },
        { sousQuestion: "b", critere: [texte("Exposants égalés et équation multipliée par 2")], points: 1 },
        { sousQuestion: "b", critere: [texte(exercice.contradictoire ? "Égalité impossible reconnue (les termes en x s'annulent)" : "Équation du premier degré résolue")], points: 1 },
        { sousQuestion: "b", critere: [texte("Conclusion : "), ...S], points: 1 },
      ];
      erreursFrequentes = [{ description: [texte("Diviser un seul terme de l'exposant par 2")], cout: "−1" }];
      break;
    case "C":
      criteres = [
        { sousQuestion: "a", critere: [texte("Changement de variable posé, équation en t : "), latex(formatReponseAttenduePhaseLatex(exercice, "cEcran1")[0])], points: 1 },
        { sousQuestion: "b", critere: [texte("Racines en t : "), latex(`t=${exercice.solutionsT[0]}`), texte(" et "), latex(`t=${exercice.solutionsT[1]}`)], points: 1 },
        { sousQuestion: "c", critere: [texte("Racines t ≤ 0 rejetées (une exponentielle est strictement positive)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Retour à x : "), ...S], points: 1 },
      ];
      erreursFrequentes = [{ description: [texte("Garder une valeur négative de t")], cout: "−1" }];
      if (!exercice.solutionsX.every((x) => estExactExpo(x))) reponsesAcceptees.push([texte("Valeur approchée de x à 0,01 près, obtenue à la calculatrice")]);
      break;
    case "D":
      criteres = [
        { sousQuestion: "a", critere: [texte("Chaque puissance est strictement positive")], points: 2 },
        { sousQuestion: "a", critere: [texte("Conclusion : aucune solution, "), latex("S=\\varnothing")], points: 2 },
      ];
      erreursFrequentes = [{ description: [texte("Chercher à résoudre (logarithme, changement de variable) au lieu de conclure par la positivité")], cout: "−1" }];
      break;
  }
  return { reponseFinale: S, criteres, erreursFrequentes, ...(reponsesAcceptees.length ? { reponsesAcceptees } : {}) };
}

/**
 * Niveau 1–7 — méthode et piège jugés sur l'énoncé papier : méthode 1 pour C (changement de
 * variable à reconnaître, parfois déguisé), 0 ailleurs (même base / positivité imposées par la
 * forme). Piège dans les données : une racine t ≤ 0 à rejeter (C). « Aucune solution » (A3, B, D)
 * est un cas particulier, pas un piège (décision de l'utilisateur). Nombres : une solution x qui
 * n'est pas exacte (C). Aucun écran de pure lecture.
 */
function criteresDifficulte(e: ExerciceEquationExponentielle): CriteresDifficulte {
  const methode: 0 | 1 = e.famille === "C" ? 1 : 0;
  const piege: 0 | 1 = e.famille === "C" && e.solutionsT.some((t) => t <= 0) ? 1 : 0;
  const nombres: 0 | 1 = e.famille === "C" && !e.solutionsX.every((x) => estExactExpo(x)) ? 1 : 0;
  return { ...etapesDuCorrige(correction(e)), methode, piege, nombres };
}

export const adaptateurEvaluationEquationsExponentielles: AdaptateurFeuilleExercices<ExerciceEquationExponentielle> = {
  profilInstance: profilEquationsExponentielles,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_EXPONENTIELLES,
  titreDocument: "Résoudre une équation exponentielle — Évaluation",
  nomFichierBase: "equations-exponentielles",
  genererInstance: genererExerciceEquationExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceEquationsExponentielles,
  construireCorrection: construireCorrectionEquationsExponentielles,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
