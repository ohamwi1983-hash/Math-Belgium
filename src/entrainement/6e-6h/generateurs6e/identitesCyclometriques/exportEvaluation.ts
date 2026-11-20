import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceIdentites } from "../../core6e/identitesCyclometriques.types";
import { arcDe } from "../../moteur6e/modeleIdentitesCyclometriques";
import { consigne, consigneGenerale, consignePapier, PHASES_IDENTITES, questionsPapierLitteral, reponse } from "../../ui6e/formatIdentitesCyclometriques";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceIdentites } from "./index";
import { correctionDetailleeIdentites } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen153` « Identités trig∘arc et arc∘trig ».
 * arcTrig et trigArc : énoncé papier = le nombre A + « calcule sa valeur exacte en justifiant » ;
 * les deux écrans (verdict, valeur) deviennent les étapes a et b du corrigé. Littéral : deux VRAIES
 * questions (domaine, forme simplifiée). Tout est exact (aucune calculatrice) ; le verdict de
 * l'écran 1 (θ dans l'image, signe) est tiré 50/50 dans la variante, jamais un cas particulier ;
 * niveau constant dans la variante (le piège compte pour toute la variante).
 */

type E = ExerciceIdentites;
const t = texte;
const f = latex;
const fr = (x: unknown): FragmentConsigne[] => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES_IDENTITES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "litteral") return [t("a) "), ...fr(reponse(e, "verdict")), t(" ; b) "), ...fr(reponse(e, "valeur"))];
  return fr(reponse(e, "valeur"));
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "litteral") {
    return {
      section: { enteteFragments: fr(consigneGenerale(e)), questions: questionsPapierLitteral().map((q) => ({ consigne: fr(q) })) },
      etapesParQuestion: [["a"], ["b"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), questions: [{ consigne: [t(consignePapier(e))] }] },
    etapesParQuestion: [["a", "b"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  const base = etapesDuCorrige(correctionDetailleeIdentites(e), []);
  if (e.variante === "arcTrig") return { ...base, methode: 0, piege: 1, nombres: 0 };
  // sansCharge : la longueur du quotient (tangente) ne doit pas trahir le signe tiré.
  if (e.variante === "trigArc") return { ...base, methode: 1, piege: 1, nombres: 0, sansCharge: true };
  return { ...base, methode: 1, piege: 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  if (e.variante === "arcTrig")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("θ comparé aux bornes de l'image (même dénominateur) : "), ...fr(reponse(e, "verdict"))], points: 1.5 },
        { sousQuestion: "b", critere: [t("Angle de même valeur ramené dans l'image : "), ...fr(reponse(e, "valeur"))], points: 2.5 },
      ],
      erreursFrequentes: [
        { description: [t("Réponse "), f("A=\\theta"), t(" alors que θ est hors de l'image")], cout: "0 pt sur la valeur" },
        { description: [t("Angle de même valeur mais hors de l'image")], cout: "moitié des points de la valeur" },
        { description: [t("Valeur approchée en radians ou en degrés")], cout: "moitié des points de la valeur" },
      ],
      reponsesAcceptees: [[t("Toute écriture exacte de l'angle ("), f("-\\dfrac{\\pi}{4}=-\\dfrac{3\\pi}{12}"), t(")")]],
    };
  if (e.variante === "trigArc")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t(`Angle situé dans l'image de arc${arcDe(e.couple)}, signe justifié : `), ...fr(reponse(e, "verdict"))], points: 1.5 },
        { sousQuestion: "b", critere: [t("Identité substituée, racine simplifiée : "), ...fr(reponse(e, "valeur"))], points: 2.5 },
      ],
      erreursFrequentes: [
        { description: [t("Signe déduit du seul signe de "), f("a"), t(" sans regarder l'image")], cout: "0 pt sur le signe" },
        { description: [t("Racine oubliée (carré donné comme résultat)")], cout: "moitié des points de la valeur" },
        { description: [t("Racine non simplifiée ou dénominateur irrationnel")], cout: "−0,5" },
      ],
      reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{1}{\\sqrt{3}}=\\dfrac{\\sqrt{3}}{3}"), t(")")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Domaine (arcfonction, dénominateur) : "), ...fr(reponse(e, "verdict"))], points: 1.5 },
      { sousQuestion: "b", critere: [t("Identité, carré de tout l'argument, racine positive : "), ...fr(reponse(e, "valeur"))], points: 2.5 },
    ],
    erreursFrequentes: [
      { description: [f(`(${e.k}x)^{2}`), t(" écrit "), f(`${e.k}x^{2}`)], cout: "moitié des points de la forme" },
      { description: [t("Signe « ± » laissé devant la racine")], cout: "−0,5" },
      { description: [t("Domaine de l'arcfonction oublié, ou dénominateur nul gardé")], cout: "0 pt sur le domaine" },
    ],
    reponsesAcceptees: [[t("Toute forme équivalente sur le domaine")]],
  };
}

/** Même variante (et même arcfonction) dans toutes les séries ; le verdict reste tiré au hasard. */
export function profilIdentites(e: E): ProfilInstance {
  const forme = e.variante === "arcTrig" ? `arcTrig|${e.fn}` : e.variante === "trigArc" ? `trigArc|${arcDe(e.couple)}` : "litteral";
  return { casParticulier: null, calcul: "exacte", forme };
}

export const adaptateurEvaluationIdentites: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Identités trig∘arc et arc∘trig — Évaluation",
  nomFichierBase: "identites-trig-arc",
  genererInstance: genererExerciceIdentites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeIdentites,
  bareme,
  enoncePapier,
  profilInstance: profilIdentites,
};
