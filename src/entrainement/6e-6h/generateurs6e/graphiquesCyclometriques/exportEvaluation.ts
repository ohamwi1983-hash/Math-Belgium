import type { ExerciceGraphiquesCyclometriques } from "../../core6e/graphiquesCyclometriques.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireGrilleSvgCandidatsCyclo } from "../../export6e/svgGraphCyclo";
import {
  LIBELLE_PARITE,
  calculerViewBoxGraphique,
  formatEnsembleReelApproxLatex,
  formatExpressionLatex,
  formatExtremumLatex,
  formatOrdonneeLatex,
} from "../../ui6e/formatGraphiquesCyclometriques";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceGraphiquesCyclometriques } from "./index";

const LETTRES = "ABCDEF";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiquesCyclometriques>` pour `6gen5` (Apparier
 * graphiques et expressions de fonctions cyclométriques) — feuille d'évaluation.
 *
 * Reprend désormais le VRAI QCM graphique de l'écran interactif (choisir le bon graphe parmi les
 * candidats tracés, `exercice.candidats`/`indexCorrect`) — les 4 (ou 6) graphiques sont rendus en
 * `<svg>` statique (`export/svgGraphCyclo.ts`, moteur de tracé à la main indépendant de Mafs, à
 * partir des mêmes données pures `evaluerCandidat`/`calculerViewBoxGraphique` que l'écran) et
 * injectés via `SectionExercice.enteteHtml` (pipeline HTML de l'évaluation uniquement — voir ce
 * champ). Les 5 questions de propriétés restent posées ENSUITE, comme justification écrite du choix
 * — même finalité pédagogique que l'écran unique (« sélectionne le graphique, puis justifie »),
 * réutilisant directement les formatteurs déjà écrits côté écran (`ui6e/
 * formatGraphiquesCyclometriques.ts`), jamais recalculés indépendamment.
 */

function construireEnonceGraphiquesCyclometriques(exercice: ExerciceGraphiquesCyclometriques): SectionExercice {
  const viewBox = calculerViewBoxGraphique(exercice);
  return {
    // Jamais de texte à la suite de la formule ici : l'entête est rendu en mode "bloc" (formule
    // centrée en évidence, `assemblerEvaluationHtml.ts`), qui isole tout fragment suivant sur sa
    // propre ligne — un simple "." finirait seul, orphelin, sous la formule.
    enteteFragments: [texte("On considère la fonction "), latex(formatExpressionLatex(exercice))],
    enteteHtml: construireGrilleSvgCandidatsCyclo(exercice, viewBox),
    questions: [
      { consigne: [texte("Quel graphique correspond à f ?")], reponse: { type: "lignes", nombre: 1 } },
      { consigne: [texte("Détermine le domaine de définition de f.")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Détermine l'image de f.")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("f a-t-elle une parité particulière (paire, impaire, ou aucune) ? Justifie.")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Détermine l'ordonnée à l'origine de f, si elle existe.")], reponse: { type: "lignes", nombre: 1 } },
      { consigne: [texte("f admet-elle un maximum ? un minimum ? Donne leur valeur si c'est le cas.")], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionGraphiquesCyclometriques(exercice: ExerciceGraphiquesCyclometriques): BlocCorrection[] {
  const { proprietes } = exercice;
  const viewBox = calculerViewBoxGraphique(exercice);
  const lettreCorrecte = LETTRES[exercice.indexCorrect] ?? String(exercice.indexCorrect + 1);
  return [
    { type: "paragraphe", fragments: [texte(`a) Réponse : le graphique ${lettreCorrecte}.`)] },
    { type: "html", html: construireGrilleSvgCandidatsCyclo(exercice, viewBox, exercice.indexCorrect) },
    { type: "paragraphe", fragments: [texte("b) Domaine : "), latex(formatEnsembleReelApproxLatex(proprietes.domf)), texte(".")] },
    { type: "paragraphe", fragments: [texte("c) Image : "), latex(formatEnsembleReelApproxLatex(proprietes.imf)), texte(".")] },
    { type: "paragraphe", fragments: [texte(`d) Parité : ${LIBELLE_PARITE[proprietes.parite]}.`)] },
    { type: "paragraphe", fragments: [texte("e) Ordonnée à l'origine : "), latex(formatOrdonneeLatex(proprietes.ordonnee))] },
    {
      type: "paragraphe",
      fragments: [
        texte("f) Maximum : "),
        latex(formatExtremumLatex(proprietes.maximum)),
        texte(" — Minimum : "),
        latex(formatExtremumLatex(proprietes.minimum)),
      ],
    },
  ];
}

export const adaptateurEvaluationGraphiquesCyclometriques: AdaptateurFeuilleExercices<ExerciceGraphiquesCyclometriques> = {
  titreDocument: "Propriétés de fonctions cyclométriques — Évaluation",
  nomFichierBase: "graphiques-cyclometriques",
  genererInstance: genererExerciceGraphiquesCyclometriques,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceGraphiquesCyclometriques,
  construireCorrection: construireCorrectionGraphiquesCyclometriques,
};
