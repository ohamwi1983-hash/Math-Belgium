import type { ExerciceProprieteLogarithme, TypeProprieteLog } from "../../core6e/proprietesLogarithme.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  aideNiveau2,
  blocDonnees,
  CONSIGNE_GENERALE,
  consigneEcran,
  expressionDemandeeLatex,
  formatExpressionMN,
  formatReponseAttenduePhaseLatex,
} from "../../ui6e/formatProprietesLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesLogarithme } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProprieteLogarithme>` pour `6gen13` (Propriétés du
 * logarithme) — feuille d'évaluation, voir `generateurs/analyseFonction/exportWord.ts` pour le
 * mécanisme générique de référence.
 *
 * Condense les 2 écrans FIXES côté interactif (`App6gen13.tsx`, `ui6e/formatProprietesLogarithme.ts`)
 * en 2 questions écrites, dans le même ordre : a) exprimer log_a(...) en fonction de m et/ou n
 * (propriété du logarithme), b) substituer puis calculer la valeur numérique arrondie. Réutilise
 * directement les textes/formats déjà écrits côté écran (`consigneEcran`, `formatExpressionMN`,
 * `aideNiveau2`, `formatReponseAttenduePhaseLatex`) — jamais recalculés indépendamment.
 */

function construireEnonceProprietesLogarithme(exercice: ExerciceProprieteLogarithme): SectionExercice {
  return {
    enteteFragments: [
      texte(CONSIGNE_GENERALE + " Données : "),
      latex(blocDonnees(exercice).join(",\\quad ")),
      texte(". Calcule : "),
      latex(expressionDemandeeLatex(exercice)),
      texte("."),
    ],
    questions: [
      { consigne: [texte(consigneEcran(exercice, "ecran1"))], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte(consigneEcran(exercice, "ecran2"))], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionProprietesLogarithme(exercice: ExerciceProprieteLogarithme): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("a) Expression en fonction de m et/ou n : "), latex(formatExpressionMN(exercice)), texte(".")] },
    {
      type: "paragraphe",
      fragments: [
        texte("b) Substitution : "),
        latex(aideNiveau2(exercice, "ecran2").latex ?? ""),
        texte(" ≈ "),
        latex(formatReponseAttenduePhaseLatex(exercice, "ecran2")[0]),
        texte("."),
      ],
    },
  ];
}

export const adaptateurEvaluationProprietesLogarithme: AdaptateurFeuilleExercices<ExerciceProprieteLogarithme> = {
  titreDocument: "Propriétés du logarithme — Évaluation",
  nomFichierBase: "proprietes-logarithme",
  genererInstance: genererExerciceProprietesLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as TypeProprieteLog),
  construireEnonce: construireEnonceProprietesLogarithme,
  construireCorrection: construireCorrectionProprietesLogarithme,
  // 2 questions par instance (propriété puis calcul numérique) et consigne de l'écran 1 dépendante
  // du type (`NOM_PROPRIETE[exercice.type]`, voir `ui6e/formatProprietesLogarithme.ts::consigneEcran`)
  // — ni "1 seule question", ni "consigne générique" : `regroupable` reste absent (voir
  // `AdaptateurFeuilleExercices.regroupable`).
};
