import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceTangenteExpo, VarianteTangenteExpo } from "../../core6e/tangenteExponentielle";
import { aVal } from "../../core6e/tangenteExponentielle";
import { consigne, consigneGenerale, fonctionL, phases, reponse } from "../../ui6e/formatTangenteExponentielle";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTangenteExpo } from "./index";
import { correctionDetailleeTangenteExpo } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen149` « Tangente à une exponentielle et nombre ln a ». Une consigne globale
 * (la fonction et ce qu'on cherche) ; les trois écrans passent dans le corrigé (étapes a–c). Valeurs
 * exactes acceptées partout : faisable calculatrice interdite (aucun `calcul` dans le profil).
 */

type E = ExerciceTangenteExpo;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function enoncePapier(e: E): EnoncePapier {
  const section =
    e.variante === "en-zero"
      ? { enteteFragments: [t("Soit "), f(fonctionL(e)), t(". Sans calculatrice, donne le signe de la pente de la tangente à la courbe de "), f("f"), t(" au point "), f("(0\\,;1)"), t(" en justifiant, puis la valeur exacte de cette pente et l'équation de cette tangente.")], questions: [] }
      : { enteteFragments: [t("Soit "), f(fonctionL(e)), t(". Détermine l'équation de la tangente à la courbe de "), f("f"), t(" au point d'abscisse "), f(String(e.x0)), t(" (valeurs exactes, puis coefficients arrondis au centième).")], questions: [] };
  return { section };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const p = phases(e);
  return [...reponse(e, p[0]), t(" ; "), ...reponse(e, p[1]), t(" ; "), ...reponse(e, p[2])];
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Aucune lecture ; méthode imposée (formule de la tangente) ; piège dans les données : pente
  // négative (base < 1, k < 0, m < 0) ou exposant négatif ; ln a / e^n → nombres 1. En `en-zero`,
  // le signe de la pente EST le verdict de l'écran a : piège constant 0, sinon le niveau imprimé
  // (3 ou 4) trahirait le verdict (même règle que gen81).
  const piege = e.variante === "en-zero" ? 0 : (e.base && aVal(e) < 1) || e.k < 0 || e.m < 0 || e.x0 < 0 ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeTangenteExpo(e), []), methode: 0, piege, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  const p = phases(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: p[0] === "signe" ? [t("Signe de la pente justifié par la base : "), ...reponse(e, "signe")] : [t("Image exacte : "), ...reponse(e, "image")], points: 1 },
      { sousQuestion: "b", critere: [t("Pente par la dérivée : "), ...reponse(e, "pente")], points: 1.5 },
      { sousQuestion: "c", critere: [t("Équation de la tangente : "), ...reponse(e, "tangente")], points: 1.5 },
    ],
    erreursFrequentes: [
      ...(e.base ? [{ description: [t("Facteur "), f("\\ln a"), t(" oublié dans la dérivée")], cout: "0 pt sur la pente, suite notée sans double pénalité" }] : [{ description: [t("Facteur "), f("m"), t(" de la règle de la chaîne oublié")], cout: "0 pt sur la pente, suite notée sans double pénalité" }]),
      { description: [f("f(x_0)"), t(" pris comme ordonnée à l'origine sans développer")], cout: "−0,5" },
      { description: [f("\\ln a"), t(" arrondi avant de multiplier")], cout: "−0,25" },
    ],
    reponsesAcceptees: [[t("Valeur exacte ou arrondie au centième ; toute forme d'équation de la droite (développée ou non)")]],
  };
}

export function profilTangenteExpo(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTangenteExpo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Tangente à une exponentielle — Évaluation",
  nomFichierBase: "tangente-exponentielle",
  genererInstance: genererExerciceTangenteExpo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteTangenteExpo),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTangenteExpo,
  bareme,
  enoncePapier,
  profilInstance: profilTangenteExpo,
};
