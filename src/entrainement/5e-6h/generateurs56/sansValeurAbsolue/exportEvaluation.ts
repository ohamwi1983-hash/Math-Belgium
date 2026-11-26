import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { PHASES_SANS_ABS } from "./core/types";
import type { ExerciceSansAbs } from "./core/types";
import { casesL, consigne, consigneGenerale, fL, reponse } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSansAbs } from "./index";
import type { IdVarianteSansAbs } from "./index";
import { correctionDetailleeSansAbs } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen19`. Énoncé papier = « Écris f(x) = … sans valeur absolue. » ; zéros et
 * intervalles passent dans le corrigé « comme au tableau » (partagé avec l'appli). Regroupable
 * (« Écris chaque expression sans valeur absolue »).
 */

type E = ExerciceSansAbs;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_SANS_ABS.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [f(casesL(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [t("Écris "), f(fL(e)), t(" sans valeur absolue.")], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_SANS_ABS.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Quatre étapes (zéros, trois morceaux), méthode imposée, piège 1 (l'intervalle du milieu : les deux
 * expressions de signes contraires ; « difference » : un signe « − » devant une valeur absolue — constant
 * dans chaque variante), `sansCharge`. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeSansAbs(e)), methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Zéros rangés : "), ...reponse(e, "zeros")], points: 0.75 },
      { sousQuestion: "b", critere: [t("Premier intervalle : "), ...reponse(e, "gauche")], points: 1 },
      { sousQuestion: "c", critere: [t("Deuxième intervalle : "), ...reponse(e, "milieu")], points: 1.25 },
      { sousQuestion: "d", critere: [t("Troisième intervalle et écriture par morceaux : "), ...reponse(e, "droite")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Signe d'une expression faux sur un intervalle")], cout: "0 pt sur ce morceau" },
      { description: [t("Signe « − » non distribué devant une parenthèse")], cout: "−0,5" },
      { description: [t("Bornes des intervalles non précisées (x < …, … ≤ x < …)")], cout: "−0,25" },
    ],
    reponsesAcceptees: [[t("Les bornes comprises dans l'un ou l'autre intervalle voisin (les morceaux se raccordent) ; un tableau à la place des lignes de calcul")]],
  };
}

/** `forme` = variante ; aucun cas particulier, pas de `calcul`. */
export function profilSansAbs(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationSansAbs: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Écrire sans valeur absolue — Évaluation",
  nomFichierBase: "sans-valeur-absolue",
  genererInstance: genererExerciceSansAbs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteSansAbs),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSansAbs,
  bareme,
  enoncePapier,
  profilInstance: profilSansAbs,
};
