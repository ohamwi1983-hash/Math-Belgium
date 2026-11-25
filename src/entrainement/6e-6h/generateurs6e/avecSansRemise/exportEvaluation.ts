import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { texte } from "../../../export/corrigeTableau";
import type { ExerciceASR } from "../../core6e/avecSansRemise";
import { PHASES_ASR } from "../../core6e/avecSansRemise";
import { CONSIGNE_PAPIER, consigne, question, reponse, situation } from "../../ui6e/formatAvecSansRemise";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceASR } from "./index";
import { correctionDetailleeASR } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen108` « Avec ou sans remise ? Choisir le modèle ». Énoncé papier = situation
 * (la façon de tirer est dans le texte) + question (P(X = j), P(X ≥ 1) ou P(X ≤ 1), valeur exacte ou
 * arrondie au dix-millième) + « Justifie le modèle de probabilité choisi. » ; les trois écrans (modèle,
 * paramètres, probabilité) deviennent les étapes a, b, c du corrigé. Le MODÈLE est un VERDICT, tiré à
 * parts égales dans chaque série, jamais dans `forme` (= l'événement) ; niveau et durée ne dépendent
 * pas du modèle (étapes a et c, lecture b, `sansCharge`, méthode 1, piège = « au moins / au plus »,
 * nombres 1 : arrondi). Aucun cas particulier ; aucun `calcul` : la Casio Graph Math+ a les deux lois,
 * mais choisir la loi EST l'exercice (décision du 24/11 : modéliser → tiré dans les deux modes).
 * Regroupement a), b), c) écarté : situation propre à chaque instance.
 */

type E = ExerciceASR;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: PHASES_ASR.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return fr(reponse(e, "proba"));
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: [{ consigne: [t(CONSIGNE_PAPIER)] }] },
    etapesParQuestion: [["a", "b", "c"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [...fr(reponse(e, "modele")), t(" ; "), ...fr(reponse(e, "parametres")), t(" ; "), ...fr(reponse(e, "proba"))] }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeASR(e), ["b"]), methode: 1, piege: e.evenement === "exactement" ? 0 : 1, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Modèle justifié par la façon de tirer : "), ...fr(reponse(e, "modele"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Paramètres : "), ...fr(reponse(e, "parametres"))], points: 0.5 },
      { sousQuestion: "c", critere: [t("Probabilité (formule, complément ou somme, valeur) : "), ...fr(reponse(e, "proba"))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [t("Mauvais modèle (binomiale pour des tirages sans remise, ou l'inverse), calcul juste dans ce modèle")], cout: "0 pt sur l'étape 1, moitié des points de l'étape 3" },
      ...(e.evenement === "auMoinsUn" ? [{ description: [t("Complément oublié : P(X = 0) donnée pour « au moins un »")], cout: "moitié des points de l'étape 3" }] : []),
      ...(e.evenement === "auPlusUn" ? [{ description: [t("Un seul des deux cas X = 0 et X = 1 compté")], cout: "moitié des points de l'étape 3" }] : []),
      { description: [t("Valeur arrondie au centième ou moins précise que demandé")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Valeur exacte (fraction, même non réduite) ou arrondie au dix-millième ; résultat obtenu avec la loi de la calculatrice si le modèle et ses paramètres sont écrits")]],
  };
}

/** `forme` = événement seul (jamais le modèle : c'est le verdict de l'écran 1). */
export function profilASR(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.evenement };
}

export const adaptateurEvaluationASR: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Avec ou sans remise ? Choisir le modèle — Évaluation",
  nomFichierBase: "avec-ou-sans-remise",
  genererInstance: genererExerciceASR,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeASR,
  bareme,
  enoncePapier,
  profilInstance: profilASR,
};
