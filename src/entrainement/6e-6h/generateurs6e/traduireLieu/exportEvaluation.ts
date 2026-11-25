import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceTL } from "../../core6e/traduireLieu";
import { exclus, phases } from "../../core6e/traduireLieu";
import { listeL } from "../../ui6e/outilsLieuxLotH2";
import { CONSIGNE_GLOBALE, consigne, consigneGenerale, equationLisibleL, lieuFinal } from "../../ui6e/formatTraduireLieu";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTL } from "./index";
import { correctionDetailleeTL } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen128` « Traduire un lieu : réciproque et points exclus ». Énoncé papier =
 * données + question (le lieu à déterminer) + consigne globale (traduire, puis vérifier la réciproque
 * et préciser les points à exclure) ; aucune figure dans l'énoncé (les données sont dans le texte), la
 * figure du lieu (points exclus en creux) est dans le corrigé. Les écrans deviennent les étapes du
 * corrigé. VERDICT = nombre de points exclus, tiré dans chaque série : jamais dans `forme` (= variante),
 * jamais un cas particulier ; niveau et durée CONSTANTS quel que soit le verdict (trois étapes
 * `sansCharge`, méthode 2 — l'élève traduit lui-même la condition —, piège 1 constant : décider s'il
 * faut exclure EST le piège). Aucun `calcul` (traduire et démontrer : tiré « interdite » ET
 * « autorisée »). Regroupement écarté : énoncé propre à l'instance.
 */

type E = ExerciceTL;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [L(equationLisibleL(e)), t(" ; "), ...fr(lieuFinal(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), questions: [{ consigne: [t(CONSIGNE_GLOBALE)] }] },
    etapesParQuestion: [phases(e).map((_p, i) => "abcd"[i]!)],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 2, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ex = exclus(e);
  const criteres =
    ex.length === 0
      ? [
          { sousQuestion: "a", critere: [t("Condition traduite et équation du lieu complet : "), L(equationLisibleL(e))], points: 2.5 },
          { sousQuestion: "b", critere: [t("Réciproque vérifiée : aucun point à exclure, justifié")], points: 1.5 },
        ]
      : [
          { sousQuestion: "a", critere: [t("Condition traduite et équation du lieu complet : "), L(equationLisibleL(e))], points: 2 },
          { sousQuestion: "b", critere: [t("Réciproque : il faut exclure des points")], points: 0.5 },
          { sousQuestion: "c", critere: [t("Points exclus : "), L(listeL(ex))], points: 1 },
          { sousQuestion: "d", critere: [t("Exclusion justifiée par la condition de l'énoncé")], points: 0.5 },
        ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [t("Lieu complet donné comme réponse, sans vérifier la réciproque")], cout: ex.length ? "0 pt sur les points exclus" : "moitié des points de la réciproque" },
      { description: [t("Points exclus « par réflexe », alors que la condition a un sens pour eux")], cout: "−0,5" },
      { description: [t("Une seule des deux équations données par une valeur absolue ou un « ou »")], cout: "moitié des points de l'équation" },
    ],
    reponsesAcceptees: [[t("Toute équation équivalente (développée, réduite, multipliée par un nombre non nul) ; deux droites données par leurs deux équations")]],
  };
}

/** `forme` = variante seule (jamais la situation ni le nombre de points exclus). */
export function profilTL(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationTL: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Traduire un lieu : réciproque et points exclus — Évaluation",
  nomFichierBase: "traduire-un-lieu-points-exclus",
  genererInstance: genererExerciceTL,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTL,
  bareme,
  enoncePapier,
  profilInstance: profilTL,
};
