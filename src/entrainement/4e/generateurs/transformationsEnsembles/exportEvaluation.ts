import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceTransformationsEnsembles, Transformation } from "../../core/transformationsEnsembles.types";
import { ensembleFinal, natureDe } from "../../moteur/modeleTransformationsEnsembles";
import {
  CONSIGNE_GENERALE,
  CONSIGNE_PAPIER,
  DOM_G,
  IM_G,
  consignesEcrans,
  donneesFragments,
  intervalleLatex,
  listeTransformations,
} from "../../ui/formatTransformationsEnsembles";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationsEnsembles } from "./index";
import { correctionDetailleeTransformationsEnsembles } from "./corrigeDetaille";
import { LIBELLE_CAS_TRANSFORMATIONS_ENSEMBLES, profilTransformationsEnsembles } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen72. Énoncé papier = données + liste des
 * transformations + consigne globale (« Détermine le domaine et l'ensemble image de g ») ; les trois
 * écrans (classer, suivre le domaine, suivre l'ensemble image) deviennent les étapes a, b, c du
 * corrigé. Séries équilibrées : `profil.ts`.
 */

function donneesHtml(e: ExerciceTransformationsEnsembles): string {
  const items = listeTransformations(e).map((f) => `<li>${fragmentsVersHtml(f)}</li>`).join("");
  return `<p class="paragraphe">${fragmentsVersHtml(donneesFragments(e))}</p><ul class="paragraphe" style="list-style:none;padding-left:0">${items}</ul>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTransformationsEnsembles): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceTransformationsEnsembles): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceTransformationsEnsembles): FragmentConsigne[] {
  return [latex(`${DOM_G} = ${intervalleLatex(ensembleFinal(e, "H"))}`), texte(" ; "), latex(`${IM_G} = ${intervalleLatex(ensembleFinal(e, "V"))}`)];
}

const correctionDetaillee = correctionDetailleeTransformationsEnsembles;

function construireCorrection(e: ExerciceTransformationsEnsembles): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceTransformationsEnsembles): BaremeExercice {
  const symetrie = e.transformations.some((t: Transformation) => natureDe(t) === "S");
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Transformation appliquée au mauvais ensemble (ex. une TH appliquée à l'ensemble image)")], cout: "0 pt sur l'ensemble concerné" },
    { description: [texte("Transformations d'un même ensemble appliquées dans le désordre")], cout: "moitié des points de l'ensemble concerné" },
  ];
  if (symetrie) erreurs.unshift({ description: [texte("Symétrie : signes changés sans échanger les bornes ni les crochets")], cout: "0,5 pt sur l'ensemble concerné" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Chaque transformation rattachée au domaine ou à l'ensemble image")], points: 1 },
      { sousQuestion: "b", critere: [texte("Domaine de g : bornes et crochets justes, étapes montrées")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Ensemble image de g : bornes et crochets justes, étapes montrées")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Bornes écrites sous forme de fraction ou de décimal équivalent")]],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceTransformationsEnsembles): CriteresDifficulte {
  // Une étape = une transformation de la chaîne (2 à 5), pas les trois écrans ; piège : une symétrie
  // (bornes opposées ET échangées).
  const piege = /S[1-9]/.test(profilTransformationsEnsembles(e).forme ?? "") ? 1 : 0;
  return { etapesTransformation: e.transformations.length, etapesLecture: 0, sansCharge: true, methode: 0, piege };
}

export const adaptateurEvaluationTransformationsEnsembles: AdaptateurFeuilleExercices<ExerciceTransformationsEnsembles> = {
  profilInstance: profilTransformationsEnsembles,
  libelleCasParticulier: LIBELLE_CAS_TRANSFORMATIONS_ENSEMBLES,
  titreDocument: "Domaine et ensemble image après transformations — Évaluation",
  nomFichierBase: "domaine-image-transformations",
  genererInstance: genererExerciceTransformationsEnsembles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
