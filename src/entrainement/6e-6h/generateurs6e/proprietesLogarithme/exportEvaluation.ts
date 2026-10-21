import type { ExerciceProprieteLogarithme } from "../../core6e/proprietesLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { nombreEtapesAlgebriques } from "../../moteur6e/typesProprietesLogarithme";
import { aideNiveau2, blocDonnees, consigneGenerale, consigneEcran, expressionDemandeeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatProprietesLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProprieteLogarithme>` pour `6gen13` (Propriétés du
 * logarithme) — feuille d'évaluation, REFONTE TOTALE : le nombre de questions par instance n'est
 * plus FIXE (2) mais dépend de la combinaison de caractéristiques tirée (1 à 4 étapes algébriques,
 * voir `moteur6e/typesProprietesLogarithme.ts::nombreEtapesAlgebriques`) — boucle sur tous les écrans
 * plutôt que 2 appels écrits en dur, réutilise directement les textes/formats déjà écrits côté écran
 * interactif (`consigneEcran`, `aideNiveau2`, `formatReponseAttenduePhaseLatex`), jamais recalculés
 * indépendamment. Exercice PUREMENT SYMBOLIQUE : AUCUNE question numérique finale, toutes les
 * questions ont la même forme "étape intermédiaire".
 */

function construireEnonceProprietesLogarithme(exercice: ExerciceProprieteLogarithme): SectionExercice {
  const total = nombreEtapesAlgebriques(exercice);
  return {
    enteteFragments: [
      texte(consigneGenerale(exercice) + " Données : "),
      latex(blocDonnees(exercice).join(",\\quad ")),
      texte(". Calcule : "),
      latex(expressionDemandeeLatex(exercice)),
      texte("."),
    ],
    questions: Array.from({ length: total }, (_, phase) => ({ consigne: [texte(consigneEcran(exercice, phase))], reponse: { type: "lignes" as const, nombre: 2 } })),
  };
}

function construireCorrectionProprietesLogarithme(exercice: ExerciceProprieteLogarithme): BlocCorrection[] {
  const total = nombreEtapesAlgebriques(exercice);
  return Array.from({ length: total }, (_, phase) => {
    const lettre = String.fromCharCode(97 + phase); // a), b), c)...
    return {
      type: "paragraphe" as const,
      fragments: [
        texte(`${lettre}) Étape intermédiaire : `),
        latex(aideNiveau2(exercice, phase).latex ?? ""),
        texte(" = "),
        latex(formatReponseAttenduePhaseLatex(exercice, phase)[0]),
        texte("."),
      ],
    };
  });
}

export const adaptateurEvaluationProprietesLogarithme: AdaptateurFeuilleExercices<ExerciceProprieteLogarithme> = {
  titreDocument: "Propriétés du logarithme — Évaluation",
  nomFichierBase: "proprietes-logarithme",
  genererInstance: genererExerciceProprietesLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceProprietesLogarithme,
  construireCorrection: construireCorrectionProprietesLogarithme,
  // Nombre de questions VARIABLE par instance (1 à 5, selon la combinaison tirée) et consigne de
  // chaque écran dépendante de la caractéristique réellement testée — ni "1 seule question", ni
  // "consigne générique" : `regroupable` reste absent (voir `AdaptateurFeuilleExercices.regroupable`).
};
