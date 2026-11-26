import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { PHASES_RATIONNEL } from "./core/types";
import type { ExerciceRationnel } from "./core/types";
import { consigne, consigneGenerale, ENSEMBLE_L, nombreDe, nombreNommeL, reponse } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRationnel } from "./index";
import type { IdVarianteRationnel } from "./index";
import { correctionDetailleeRationnel } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen14` « Rationnel ou irrationnel ? ». Énoncé papier = consigne globale et
 * les quatre nombres en VRAIES questions a) b) c) d) (quatre nombres distincts, à classer chacun) ;
 * la simplification de chacun passe dans le corrigé « comme au tableau » (partagé avec l'appli).
 */

type E = ExerciceRationnel;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_RATIONNEL.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const r: FragmentConsigne[] = [];
  PHASES_RATIONNEL.forEach((p, i) => {
    if (i > 0) r.push(t(" · "));
    r.push(t(`${LETTRES[i]}) `), f(ENSEMBLE_L[nombreDe(e, p).ensemble]));
  });
  return r;
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: [t("Donne le plus petit des ensembles "), f("\\mathbb{N}"), t(", "), f("\\mathbb{Z}"), t(", "), f("\\mathbb{Q}"), t(" et "), f("\\mathbb{R}\\setminus\\mathbb{Q}"), t(" qui contient chacun des nombres suivants. Justifie en simplifiant.")],
      questions: PHASES_RATIONNEL.map((p) => ({ consigne: [f(nombreNommeL(e, p))] })),
    },
    etapesParQuestion: PHASES_RATIONNEL.map((_p, i) => [LETTRES[i]]),
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_RATIONNEL.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Quatre étapes (une décision par nombre, simplification comprise), méthode imposée (simplifier puis
 * classer), piège CONSTANT 1 : chaque exercice contient au moins une écriture déguisée (garanti par le
 * générateur), donc niveau et durée identiques quels que soient les verdicts. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeRationnel(e)), methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES_RATIONNEL.map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t("Nombre simplifié et plus petit ensemble justifié : "), ...reponse(e, p)], points: 1 })),
    erreursFrequentes: [
      { description: [t("Racine, cosinus ou écriture décimale jugés irrationnels sans simplifier")], cout: "0 pt sur ce nombre" },
      { description: [t("Un ensemble trop grand (ℚ pour un naturel, ℤ pour un naturel…)")], cout: "−0,5" },
      { description: [t("Irrationalité affirmée sans justification (racine d'un non-carré, π, Φ, écriture non périodique)")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute justification correcte (simplification, écriture décimale, raisonnement par l'absurde)")]],
  };
}

/** `forme` = variante (famille des nombres, structure reproduite d'une série à l'autre), jamais les
 * verdicts. `calcul: 'exacte'` : la Casio Graph Math+ en mode naturel affiche directement la forme
 * simplifiée (3/2, 2√3, √3/2), qui donne la réponse — exercice à faire sans calculatrice. */
export function profilRationnel(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante, calcul: "exacte" };
}

export const adaptateurEvaluationRationnel: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Rationnel ou irrationnel ? — Évaluation",
  nomFichierBase: "rationnel-ou-irrationnel",
  genererInstance: genererExerciceRationnel,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteRationnel),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRationnel,
  bareme,
  enoncePapier,
  profilInstance: profilRationnel,
};
