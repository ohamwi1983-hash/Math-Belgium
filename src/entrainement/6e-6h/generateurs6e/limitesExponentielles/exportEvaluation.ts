import type { ExerciceLimiteExponentielle } from "../../core6e/limitesExponentielles.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CONSIGNE_GENERALE, consigneEcran, formatLimiteEnonceLatex, formatLimiteFinaleLatex } from "../../ui6e/formatLimitesExponentielles";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLimiteExponentielle } from "./index";
import { correctionDetailleeLimitesExponentielles as correction, sequenceLimitesExponentielles } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLimiteExponentielle>` pour `6gen6` (Calcul de
 * limites, fonctions exponentielles) — feuille d'exercices et évaluation.
 *
 * `construireEnonce` : une question par ÉCRAN du générateur (consignes de l'écran, `consigneEcran`)
 * — ce sont les titres « Étape n — … » du corrigé. Sur papier (`enoncePapier`), l'énoncé est la
 * limite et la consigne globale seulement ; les étapes passent dans le corrigé détaillé « comme au
 * tableau » (`corrigeDetaille.ts`, partagé avec l'appli). Valeurs exactes de l'écran
 * (`formatLimiteFinaleLatex`), jamais un flottant brut.
 */

function construireEnonceLimitesExponentielles(exercice: ExerciceLimiteExponentielle): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatLimiteEnonceLatex(exercice))],
    questions: sequenceLimitesExponentielles(exercice).map((phase) => ({ consigne: consigneEcran(phase, exercice) })),
  };
}

function reponseBreve(exercice: ExerciceLimiteExponentielle): FragmentConsigne[] {
  return [latex(`${formatLimiteEnonceLatex(exercice)}=${formatLimiteFinaleLatex(exercice)}`)];
}

function construireCorrectionLimitesExponentielles(exercice: ExerciceLimiteExponentielle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [texte("Résultat : "), ...reponseBreve(exercice)] }];
}

/** Énoncé PAPIER : la limite et la consigne globale (« Calcule la limite suivante »), justifications
 * attendues ; les écrans du générateur sont les étapes du corrigé. */
function enoncePapier(exercice: ExerciceLimiteExponentielle): EnoncePapier {
  return {
    section: { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), latex(formatLimiteEnonceLatex(exercice)), texte(" Justifie chaque étape.")], questions: [] },
  };
}

/**
 * Niveau 1–7 (grille commune) — méthode et piège jugés sur l'énoncé papier (« Calcule la limite ») :
 * A directe (méthode 0, piège : base entre 0 et 1, ou x → 0⁻ sous une puissance impaire) ; B somme
 * (méthode 1, piège : forme +∞ − ∞ d'apparence « −∞ ») ; C produit ∞·0 (méthode 1) ; G (méthode 2 :
 * développements construits par l'élève, piège : l'ordre 1 s'annule) ; H, I, J L'Hôpital
 * (méthode 1) ; K (piège : la forme persiste après une application) ; L 1^∞ et N ∞⁰/0⁰ (piège : la
 * forme n'est pas 1). Nombres : ln(a) ou e^{km} non remarquables (H, I, J, K, L). Aucun écran de
 * pure lecture.
 */
function criteresDifficulte(e: ExerciceLimiteExponentielle): CriteresDifficulte {
  let methode: 0 | 1 | 2 = 1;
  let piege: 0 | 1 = 0;
  let nombres: 0 | 1 = 0;
  switch (e.famille) {
    case "A":
      methode = 0;
      piege = e.sousCas === "puissance" ? (e.baseSuperieureA1 ? 0 : 1) : e.s % 2 === 1 && e.directionZero === "zero_moins" ? 1 : 0;
      break;
    case "B":
      piege = e.baseSuperieureA1 && e.limitePolynomiale.type === "moins_infini" ? 1 : 0;
      break;
    case "G":
      methode = 2;
      piege = 1;
      break;
    case "H":
    case "I":
    case "J":
      nombres = 1;
      break;
    case "K":
      piege = 1;
      nombres = 1;
      break;
    case "L":
      piege = 1;
      nombres = 1;
      break;
    case "N":
      piege = 1;
      break;
  }
  return { ...etapesDuCorrige(correction(e)), methode, piege, nombres };
}

export const adaptateurEvaluationLimitesExponentielles: AdaptateurFeuilleExercices<ExerciceLimiteExponentielle> = {
  titreDocument: "Calcul de limites (fonctions exponentielles) — Évaluation",
  nomFichierBase: "limites-exponentielles",
  genererInstance: genererExerciceLimiteExponentielle,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as Parameters<typeof construireAvecFamilleId>[0]),
  construireEnonce: construireEnonceLimitesExponentielles,
  construireCorrection: construireCorrectionLimitesExponentielles,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correction,
  enoncePapier,
};
