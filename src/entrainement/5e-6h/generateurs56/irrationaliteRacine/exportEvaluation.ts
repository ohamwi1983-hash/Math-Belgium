import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { PHASES_IRRATIONALITE } from "./core/types";
import type { ExerciceIrrationalite } from "./core/types";
import { consigne, consigneGenerale, racineNL, reponse } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIrrationalite } from "./index";
import type { IdVarianteIrrationalite } from "./index";
import { correctionDetailleeIrrationalite } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen15`. Énoncé papier = la question seule (« … est-il rationnel ou
 * irrationnel ? Démontre ta réponse. »), sans la méthode ni le verdict ; les cinq écrans passent dans
 * le corrigé « comme au tableau » (partagé avec l'appli).
 */

type E = ExerciceIrrationalite;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_IRRATIONALITE.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return e.verdict === "naturel" ? [f(`${racineNL(e)}=${e.racine}`), t(" : c'est un naturel (donc un rationnel)")] : [f(racineNL(e)), t(" est irrationnel")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Le nombre "), f(racineNL(e)), t(" est-il rationnel ou irrationnel ? Démontre ta réponse.")], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_IRRATIONALITE.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Cinq étapes, méthode 1 (la démonstration du cours n'est pas imposée par l'énoncé papier), aucune
 * donnée piège, `sansCharge` (la décomposition peut compter jusqu'à dix divisions) : niveau et durée
 * identiques dans les deux verdicts. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeIrrationalite(e)), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

const POINTS = [0.5, 0.5, 1, 1, 1];
const LIBELLES = ["Hypothèse posée", "Égalité entre naturels", "Décomposition en facteurs premiers", "Exposants comparés", "Conclusion justifiée"];

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_IRRATIONALITE.map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t(`${LIBELLES[i]} : `), ...reponse(e, p)], points: POINTS[i] })),
    erreursFrequentes: [
      { description: [t("Conclusion affirmée sans démonstration (valeur approchée de la calculatrice)")], cout: "1 pt au plus" },
      { description: [t("Décomposition avec un facteur non premier")], cout: "−0,5" },
      { description: [t("Parité des exposants affirmée sans référence à l'unicité de la décomposition")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("La démonstration par le facteur témoin seul (exposant de ce facteur dans les deux membres) ; pour un naturel, l'écriture de N comme carré (ou cube) d'un naturel")]],
  };
}

/** `forme` = variante (carrée, grande, cubique), jamais le verdict ; pas de `calcul` : on DÉMONTRE (la
 * calculatrice ne fait pas la démonstration), tiré « interdite » et « autorisée ». */
export function profilIrrationalite(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationIrrationalite: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Démontrer qu'un nombre est irrationnel — Évaluation",
  nomFichierBase: "demontrer-irrationnel",
  genererInstance: genererExerciceIrrationalite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIrrationalite),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIrrationalite,
  bareme,
  enoncePapier,
  profilInstance: profilIrrationalite,
};
