import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceHeron } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceHeron } from "./index";
import type { IdVarianteHeron } from "./index";
import { baseL, consigne, phasesDe, racineL, reponse, situation } from "./ui/formatHeron";
import { correctionDetailleeHeron } from "./corrigeDetaille";
import { dixMoinsL } from "../nombres56";

/**
 * Adaptateur papier de `56gen20` « Héron et encadrements successifs ». Deux VRAIES questions
 * (exception de `.claude/rules/feuilles-evaluations.md`) :
 * Héron — a) encadrements donnés par les deuxième et troisième rectangles (étapes a, b) ; b) premier
 * rectangle assez précis et valeur approchée (étapes c, d).
 * Puissances — a) fraction irréductible proche de √p (étapes a, b, c) ; b) écart avec la calculatrice (d).
 */

type E = ExerciceHeron;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: situation(e), questions: phasesDe(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.type === "heron") return [t("a) "), ...reponse(e, "encadrement"), t(" ; b) "), ...reponse(e, "etapes"), t(" "), ...reponse(e, "valeur")];
  return [t("a) "), ...reponse(e, "fraction"), t(" ; b) "), ...reponse(e, "ecart")];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.type === "heron") {
    return {
      section: {
        enteteFragments: situation(e),
        questions: [
          { consigne: [t("Calcule les dimensions des deuxième et troisième rectangles (au dix-millième) et écris l'encadrement de "), f(racineL(e)), t(" que donne chacun d'eux.")] },
          {
            consigne: [
              t("À partir de quel rectangle l'écart entre la longueur et la largeur devient-il inférieur à "),
              f(dixMoinsL(e.k)),
              t(" ? Déduis-en une valeur approchée de "),
              f(racineL(e)),
              t(" à "),
              f(dixMoinsL(e.k)),
              t(" près."),
            ],
          },
        ],
      },
      etapesParQuestion: [["a", "b"], ["c", "d"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: situation(e),
      questions: [
        { consigne: [t("En élevant deux fois de suite au carré le nombre "), f(baseL(e)), t(", trouve une fraction irréductible proche de "), f(`\\sqrt{${e.P}}`), t(".")] },
        { consigne: [t("Avec la calculatrice, calcule l'écart entre cette fraction et "), f(`\\sqrt{${e.P}}`), t(". Que remarques-tu ?")] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phasesDe(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode imposée par l'énoncé ; aucun piège dans les données ; calculatrice (menu Récurrence,
  // valeur de la racine) dans les deux familles. Héron : la valeur approchée se LIT sur le dernier
  // encadrement (écran d).
  return { ...etapesDuCorrige(correctionDetailleeHeron(e), e.type === "heron" ? ["d"] : []), methode: 0, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  if (e.type === "heron") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Deuxième rectangle : "), ...reponse(e, "rect2")], points: 1 },
        { sousQuestion: "b", critere: [t("Troisième rectangle et encadrement : "), ...reponse(e, "encadrement")], points: 1 },
        { sousQuestion: "c", critere: [t("Rectangles successifs et premier écart sous le seuil : "), ...reponse(e, "etapes")], points: 1.25 },
        { sousQuestion: "d", critere: [t("Valeur approchée : "), ...reponse(e, "valeur")], points: 0.75 },
      ],
      erreursFrequentes: [
        { description: [t("Ancienne largeur gardée, ou somme des côtés non divisée par 2")], cout: "0 pt sur le rectangle, suite notée sans double pénalité" },
        { description: [t("Valeurs arrondies réutilisées dans la suite des calculs")], cout: "−0,25" },
        { description: [t("Nombre d'étapes donné au lieu du numéro du rectangle")], cout: "−0,5" },
        { description: [t("Valeur approchée avec trop peu de décimales")], cout: "0 pt sur la valeur approchée" },
      ],
      reponsesAcceptees: [[t("Bornes arrondies au plus proche (au lieu de par défaut / par excès), à un dix-millième près")], [t("Toute valeur comprise entre la largeur et la longueur du rectangle trouvé")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Premier carré : "), ...reponse(e, "carre1")], points: 1 },
      { sousQuestion: "b", critere: [t("Second carré : "), ...reponse(e, "carre2")], points: 1 },
      { sousQuestion: "c", critere: [t("Fraction irréductible : "), ...reponse(e, "fraction")], points: 1 },
      { sousQuestion: "d", critere: [t("Écart positif (valeur par excès) : "), ...reponse(e, "ecart")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Double produit oublié")], cout: "0 pt sur le carré, suite notée sans double pénalité" },
      { description: [t("Carré du terme en racine sans le facteur sous la racine")], cout: "−0,5" },
      { description: [t("Fraction inversée ou non simplifiée")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Écart écrit en écriture décimale (0,0000…) ou avec plus de chiffres significatifs")]],
  };
}

export function profilHeron(_e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice" };
}

export const adaptateurEvaluationHeron: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Héron et encadrements successifs — Évaluation",
  nomFichierBase: "heron-encadrements",
  genererInstance: genererExerciceHeron,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteHeron),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeHeron,
  bareme,
  enoncePapier,
  profilInstance: profilHeron,
  calculatriceIndispensable: true,
};
