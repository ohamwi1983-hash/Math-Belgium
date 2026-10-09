import type { ExerciceLimiteExponentielle } from "../../core6e/limitesExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreAffiche } from "../../ui6e/formatGraphiquesCyclometriques";
import { CONSIGNE_GENERALE, formatCibleTexte, formatLimiteEnonceLatex } from "../../ui6e/formatLimitesExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteExponentielle>` pour `6gen6` (Calcul de
 * limites, fonctions exponentielles) — feuille d'évaluation.
 *
 * L'écran interactif se déroule en 2-3 écrans guidés selon la famille (voir
 * `core6e/limitesExponentielles.types.ts`) ; la version papier condense ces écrans en UNE seule
 * question écrite (« calcule la limite »), l'élève justifiant sa démarche sur feuille — même
 * principe déjà retenu pour `deriveesCyclometriques`/`fonctionsCyclometriques` (6gen4/6gen2), qui
 * ne redemandent pas chaque étape intermédiaire séparément. Le corrigé donne la valeur exacte
 * finale, extraite directement des champs déjà calculés par le générateur (`limiteGlobale`/
 * `limiteFinale` selon la famille) — jamais recalculée indépendamment.
 */

function formatLimiteFinaleLatex(exercice: ExerciceLimiteExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return formatCibleTexte(exercice.limiteGlobale);
    case "B":
      return formatCibleTexte(exercice.limiteGlobale);
    case "C":
      return formatNombreAffiche(exercice.limiteGlobale);
    case "G":
    case "H":
    case "I":
    case "J":
    case "K":
    case "L":
    case "N":
      return formatNombreAffiche(exercice.limiteFinale);
  }
}

function construireEnonceLimitesExponentielles(exercice: ExerciceLimiteExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE), latex(formatLimiteEnonceLatex(exercice))],
    questions: [{ consigne: [texte("Détermine la valeur de cette limite, en justifiant chaque étape de ta démarche.")], reponse: { type: "lignes", nombre: 4 } }],
  };
}

function construireCorrectionLimitesExponentielles(exercice: ExerciceLimiteExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [texte("Résultat : "), latex(formatLimiteEnonceLatex(exercice) + " = " + formatLimiteFinaleLatex(exercice))] }];
}

export const adaptateurEvaluationLimitesExponentielles: AdaptateurFeuilleExercices<ExerciceLimiteExponentielle> = {
  titreDocument: "Calcul de limites (fonctions exponentielles) — Évaluation",
  nomFichierBase: "limites-exponentielles",
  genererInstance: genererExerciceLimiteExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceLimitesExponentielles,
  construireCorrection: construireCorrectionLimitesExponentielles,
};
