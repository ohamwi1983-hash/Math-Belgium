import type { ExerciceEquationsCyclometriques } from "../../core6e/equationsCyclometriques.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { MAX_DEN, formatEquationNonCycloLatex, formatEquationOriginaleLatex } from "../../ui6e/formatEquationsCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEquationsCyclometriques } from "./index";
import { CONSIGNES_ECRANS, correctionDetailleeEquationsCyclometriques as correction, ensembleSolutionsLatex, lettresLectureEquations, sequenceEquationsCyclometriques } from "./corrigeDetaille";
import { LIBELLE_CAS_EQUATIONS_CYCLOMETRIQUES, profilEquationsCyclometriques } from "../profilsEvaluationCyclometriques";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEquationsCyclometriques>` pour `6gen3` (équations
 * cyclométriques) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN (CE, [condition], équation sans arcfonction,
 * solutions, [accepter / rejeter]) — titres « Étape n — … » du corrigé. Papier : l'équation et la
 * consigne globale. Corrigé détaillé partagé avec l'appli (`corrigeDetaille.ts`).
 */

type E = ExerciceEquationsCyclometriques;

function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'équation "), latex(formatEquationOriginaleLatex(e)), texte(".")],
    questions: sequenceEquationsCyclometriques(e).map((phase) => ({ consigne: [texte(CONSIGNES_ECRANS[phase])] })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [texte("Résous dans ℝ l'équation "), latex(formatEquationOriginaleLatex(e)), texte(", en justifiant chaque étape.")], questions: [] } };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [latex(ensembleSolutionsLatex(e))];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const seq = sequenceEquationsCyclometriques(e);
  const lettre = (phase: string) => "abcde"[seq.indexOf(phase as never)];
  const criteres: CritereBareme[] = [
    { sousQuestion: lettre("ce"), critere: [texte("CE : "), latex(`\\text{CE}=${formatEnsembleReelLatex(e.ce, MAX_DEN)}`)], points: 1 },
    ...(e.variante === "arcfonctionsDifferentes" ? [{ sousQuestion: lettre("condition"), critere: [texte("Condition de compatibilité : "), latex(`x\\in ${formatEnsembleReelLatex(e.conditionParasite, MAX_DEN)}`)], points: 0.5 }] : []),
    { sousQuestion: lettre("equation"), critere: [texte("Équation sans arcfonction : "), latex(formatEquationNonCycloLatex(e))], points: 1 },
    { sousQuestion: lettre("solutions"), critere: [texte(e.candidats.length === 0 ? "Absence de solution justifiée" : "Solutions de cette équation, calcul exact")], points: e.candidats.length === 0 ? 2 : 1 },
    ...(e.candidats.length > 0 ? [{ sousQuestion: lettre("acceptRejet"), critere: [texte("Tri des solutions et ensemble final : "), latex(ensembleSolutionsLatex(e))], points: e.variante === "arcfonctionsDifferentes" ? 0.5 : 1 }] : []),
  ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      e.variante === "arcfonctionsDifferentes"
        ? { description: [texte("Garder une solution parasite introduite par l'élévation au carré")], cout: "−1" }
        : { description: [texte("Oublier de confronter la solution à la CE")], cout: "−1" },
    ],
  };
}

/**
 * Niveau 1–7 — méthode 0 (appliquer la fonction trigonométrique, injectivité) ou 1 (équation du
 * second degré, choix de l'identité pour deux arcfonctions différentes) ; piège dans les données :
 * coefficient négatif devant x dans la CE (sens qui change), CE qui peut rejeter la solution
 * (même arcfonction, constant pour ne pas trahir l'issue), solutions parasites possibles (variante
 * 4). « Aucune solution » n'est pas un piège. Lecture : la CE vaut ℝ (arctan).
 */
function criteresDifficulte(e: E): CriteresDifficulte {
  let piege: 0 | 1 = 0;
  if (e.variante === "arcfonctionsDifferentes") piege = 1;
  else if (e.variante === "memeArcfonction") piege = e.arcfonction === "arctan" ? 0 : 1;
  else if (e.variante === "angleLineaire") piege = e.arcfonction !== "arctan" && e.arg.a < 0 ? 1 : 0;
  const methode: 0 | 1 = e.variante === "angleQuadratique" || e.variante === "arcfonctionsDifferentes" ? 1 : 0;
  return { ...etapesDuCorrige(correction(e), lettresLectureEquations(e)), methode, piege, nombres: 0 };
}

export const adaptateurEvaluationEquationsCyclometriques: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilEquationsCyclometriques,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_CYCLOMETRIQUES,
  titreDocument: "Équations avec fonctions cyclométriques — Évaluation",
  nomFichierBase: "equations-cyclometriques",
  genererInstance: genererExerciceEquationsCyclometriques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  bareme,
  enoncePapier,
};
