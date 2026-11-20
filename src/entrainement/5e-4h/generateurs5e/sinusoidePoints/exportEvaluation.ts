import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceSinusoidePoints } from "../../moteur5e/modeleSinusoidePoints";
import { CONSIGNE_GENERALE, consignePapier, consignesEcrans, enonceExercice, reponseParametres, reponsePeriode, reponseReport, souderPonctuation } from "../../ui5e/formatSinusoidePoints";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceSinusoidePoints } from "./index";
import { profilSinusoidePoints } from "./profil";
import { correctionDetailleeSinusoidePoints } from "./corrigeDetaille";

/**
 * Adaptateur feuilles / évaluations de 5gen52 « Construire une sinusoïde point par point ». Énoncé
 * papier = la fonction, l'intervalle et une consigne globale (pas de repère imprimé : aucune place de
 * réponse) ; les trois écrans deviennent les étapes a–c du corrigé, dont les figures (période, puis
 * courbe complète avec ses neuf points clés : la réponse est un graphique).
 */

function construireEnonce(e: ExerciceSinusoidePoints): SectionExercice {
  return { enteteFragments: [texte(`${CONSIGNE_GENERALE} `), ...enonceExercice(e)], questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceSinusoidePoints): EnoncePapier {
  return { section: { enteteFragments: enonceExercice(e), questions: [{ consigne: consignePapier(e) }] }, etapesParQuestion: [["a", "b", "c"]] };
}

function reponseBreve(e: ExerciceSinusoidePoints): FragmentConsigne[] {
  return souderPonctuation([...reponseParametres(e), texte(" ; période : "), ...reponsePeriode(e), texte(" ; points reportés : "), ...reponseReport(e), texte(".")]);
}

function construireCorrection(e: ExerciceSinusoidePoints): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceSinusoidePoints): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("A, b, T et Φ exacts")], points: 1 },
      { sousQuestion: "b", critere: [texte("Les cinq points d'une période à partir de Φ, dans le bon ordre")], points: 2 },
      { sousQuestion: "c", critere: [texte("Courbe prolongée sur l'intervalle (points reportés à ± T)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("T = ω ou Φ = φ")], cout: "0 pt sur a), b) corrigée avec les valeurs de l'élève" },
      { description: [texte(e.A < 0 ? "Ordre des extremums non inversé alors que A < 0" : "Période commencée en 0 au lieu de Φ")], cout: "moitié des points de b)" },
      { description: [texte("Courbe tracée sans les points clés (allure seule)")], cout: "moitié des points de b) et c)" },
    ],
    reponsesAcceptees: [[texte("Toute écriture exacte équivalente ; Φ à une période près")]],
  };
}

/** Niveau : trois étapes de calcul (les points sont CALCULÉS, pas lus), méthode 0 (imposée par le cours),
 * piège = A < 0 (ordre inversé). */
function criteresDifficulte(e: ExerciceSinusoidePoints): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeSinusoidePoints(e)), methode: 0, piege: e.A < 0 ? 1 : 0, nombres: 0 };
}

export const adaptateurEvaluationSinusoidePoints: AdaptateurFeuilleExercices<ExerciceSinusoidePoints> = {
  profilInstance: profilSinusoidePoints,
  titreDocument: "Construire une sinusoïde point par point — Évaluation",
  nomFichierBase: "sinusoide-point-par-point",
  genererInstance: genererExerciceSinusoidePoints,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSinusoidePoints,
  bareme,
  enoncePapier,
};
