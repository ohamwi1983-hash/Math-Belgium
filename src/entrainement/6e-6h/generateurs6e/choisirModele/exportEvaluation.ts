import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceCM } from "../../core6e/choisirModele";
import { MODELES_CM, phases } from "../../core6e/choisirModele";
import { consigne, question, reponse, situation } from "../../ui6e/formatChoisirModele";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCM } from "./index";
import { correctionDetailleeCM } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen119` « Choisir le modèle ». Énoncé papier = situation (le nom de la loi
 * n'y figure jamais) + « Quelle loi de probabilité suit X ? Justifie ton choix et donne ses
 * paramètres (si X ne suit aucune des lois du cours, explique pourquoi). Calcule ensuite P(…). » ; les
 * trois écrans deviennent les étapes a, b, c du corrigé. Le MODÈLE est le verdict et la variante :
 * groupe à verdict `groupe_modele` (six variantes) ; niveau et durée CONSTANTS (critères fixes : trois
 * étapes, méthode 2 — l'élève construit le modèle —, `sansCharge`). `besoinTablePhi` pour TOUTES les
 * instances (une table jointe seulement pour la loi normale trahirait le modèle). Aucun `calcul`
 * (modéliser : tiré « interdite » ET « autorisée », décision du 24/11 ; valeurs exactes acceptées, y
 * compris avec e^(−λ)). Aucun cas particulier. Regroupement écarté : situation propre à l'instance.
 */

type E = ExerciceCM;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...fr(reponse(e, "modele")), t(" ; "), ...fr(reponse(e, e.variante === "aucune" ? "raison" : "parametres")), t(" ; "), ...fr(reponse(e, "proba"))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [["a", "b", "c"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 2, piege: 0, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Modèle justifié par la situation : "), ...fr(reponse(e, "modele"))], points: 1.5 },
      { sousQuestion: "b", critere: e.variante === "aucune" ? [t("Raison : "), ...fr(reponse(e, "raison"))] : [t("Paramètres : "), ...fr(reponse(e, "parametres"))], points: 1 },
      { sousQuestion: "c", critere: [t("Probabilité : "), ...fr(reponse(e, "proba"))], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Modèle faux (avec / sans remise, nombre d'épreuves fixé ou comptage sur une durée, cloche ou valeurs également possibles), calcul juste dans ce modèle")], cout: "0 pt sur l'étape 1, moitié des points de l'étape 3" },
      ...(e.variante === "poisson" ? [{ description: [t("λ non ajusté à l'échelle de la question")], cout: "0 pt sur l'étape 2" }] : []),
    ],
    reponsesAcceptees: [[t("Valeur exacte (fraction, écriture avec e) ou arrondie au dix-millième ; valeur donnée par la loi de la calculatrice si la loi et ses paramètres sont écrits")]],
  };
}

export function profilCM(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationCM: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Choisir le modèle — Évaluation",
  nomFichierBase: "choisir-le-modele",
  genererInstance: genererExerciceCM,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCM,
  bareme,
  enoncePapier,
  profilInstance: profilCM,
  groupesVerdict: [{ id: "groupe_modele", label: "Situation (modèle tiré au hasard)", variantes: [...MODELES_CM] }],
  besoinTablePhi: true,
};
