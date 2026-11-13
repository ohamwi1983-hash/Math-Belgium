import type { ExerciceGraphiqueContexte, QuestionGraphique, TypeQuestionGraphique } from "../core/graphiqueContexte.types";
import type { Morceau } from "../core/inequation.types";
import { pointsDeChangement } from "../moteur/courbeGraphiqueContexte";
import { formatNombreTexte, TEXTES_CONTEXTES } from "../generateurs/graphiqueContexte/contextes";
import type { GuideSvg } from "./svgGraphiqueContexte";

/**
 * gen70 — textes partagés par l'écran (`AppGraphiqueContexte.tsx`) et l'adaptateur de feuilles
 * (`generateurs/graphiqueContexte/exportEvaluation.ts`) : question, caractéristique attendue et sa
 * justification, aides, réponse attendue. Une seule source de vérité.
 */

/** Ordre FIXE des choix de l'écran « quelle caractéristique ? » (jamais mélangé : seul l'ordre des
 * questions l'est). */
export const ORDRE_TYPES: TypeQuestionGraphique[] = ["image", "antecedent", "inequation", "extremum", "variation", "tendance"];

export const LIBELLE_TYPE: Record<TypeQuestionGraphique, string> = {
  image: "L'image d'un nombre",
  antecedent: "Le ou les antécédents d'un nombre",
  inequation: "Les solutions d'une inéquation",
  extremum: "Un extremum (maximum ou minimum)",
  variation: "Des intervalles de croissance ou de décroissance",
  tendance: "Une asymptote horizontale (comportement à long terme)",
};

export const CONSIGNE_TYPE = "Quelle caractéristique de la fonction cette question demande-t-elle de lire ?";

export function questionTexte(exercice: ExerciceGraphiqueContexte, q: QuestionGraphique): string {
  const t = TEXTES_CONTEXTES[exercice.contexte];
  switch (q.type) {
    case "image":
      return t.questionImage(q.x);
    case "antecedent":
      return t.questionAntecedent(q.k);
    case "inequation":
      return t.questionInequation(q.comparateur, q.k);
    case "extremum":
      return t.questionExtremum(q.nature);
    case "variation":
      return t.questionVariation(q.sens);
    case "tendance":
      return t.questionTendance();
  }
}

/** Pourquoi c'est CETTE caractéristique (révélation de l'écran 1, « Méthode » du corrigé). */
export function justificationType(exercice: ExerciceGraphiqueContexte, q: QuestionGraphique): string {
  const t = TEXTES_CONTEXTES[exercice.contexte];
  switch (q.type) {
    case "image":
      return `On connaît une valeur de l'axe horizontal (${t.grandeurX} : ${t.valeurX(q.x)}) et on cherche ${t.grandeurY}, sur l'axe vertical : on demande l'image de ${formatNombreTexte(q.x)}.`;
    case "antecedent":
      return `On connaît une valeur de l'axe vertical (${t.grandeurY} : ${t.valeurY(q.k)}) et on cherche la ou les valeurs correspondantes sur l'axe horizontal (${t.grandeurX}) : on demande le ou les antécédents de ${formatNombreTexte(q.k)}.`;
    case "inequation":
      return `On cherche TOUTES les valeurs de l'axe horizontal (${t.grandeurX}) pour lesquelles ${t.grandeurY} est ${q.comparateur === ">=" || q.comparateur === ">" ? "au-dessus" : "au-dessous"} du niveau ${t.valeurY(q.k)} : c'est une inéquation, sa réponse est un ou plusieurs intervalles.`;
    case "extremum":
      return `On cherche ${q.nature === "max" ? "le point le plus haut" : "le point le plus bas"} de la courbe sur toute la période : c'est un ${q.nature === "max" ? "maximum" : "minimum"}. On donne sa valeur ET le moment où il est atteint.`;
    case "variation":
      return `On demande quand ${t.grandeurY} ${q.sens === "croissante" ? "augmente" : "diminue"} : ce sont les intervalles de ${q.sens === "croissante" ? "croissance" : "décroissance"} de la fonction.`;
    case "tendance":
      return `On demande ce que devient ${t.grandeurY} à long terme, au-delà de la période représentée : la courbe se rapproche d'une droite horizontale, une asymptote.`;
  }
}

/** Aide 1 : la méthode de lecture, jamais la réponse. */
export function texteAideNiveau1(q: QuestionGraphique): string {
  switch (q.type) {
    case "image":
      return "Pars de la valeur donnée sur l'axe horizontal, monte verticalement jusqu'à la courbe, puis lis l'ordonnée de ce point sur l'axe vertical.";
    case "antecedent":
      return "Repère la valeur donnée sur l'axe vertical et suis l'horizontale à cette hauteur : chaque point où elle rencontre la courbe donne un antécédent, lu sur l'axe horizontal. Il peut y en avoir plusieurs.";
    case "inequation":
      return "Suis l'horizontale à la hauteur donnée et garde les parties de la courbe situées du bon côté. « Au moins » et « au plus » incluent le niveau (crochet fermé) ; « plus de » et « moins de » l'excluent (crochet ouvert). Une extrémité de la période représentée est incluse si elle convient.";
    case "extremum":
      return "Cherche le point le plus haut (ou le plus bas) de toute la courbe, extrémités comprises : son abscisse donne le moment, son ordonnée la valeur.";
    case "variation":
      return "Parcours la courbe de gauche à droite : elle monte quand la grandeur augmente. Les bornes des intervalles sont les abscisses des sommets, des creux et des extrémités des paliers ; un palier n'est ni croissant ni décroissant.";
    case "tendance":
      return "Regarde la partie droite du graphique : la courbe s'aplatit et se rapproche d'une droite horizontale sans jamais l'atteindre. Lis la hauteur de cette droite.";
  }
}

export const TEXTE_AIDE_NIVEAU2 = "Un repère a été tracé sur le graphique (en bleu) pour guider ta lecture.";

/** Aide 2 : repère tracé sur le graphique, sans la valeur cherchée. */
export function guideAideNiveau2(exercice: ExerciceGraphiqueContexte, q: QuestionGraphique): GuideSvg {
  switch (q.type) {
    case "image":
      return { type: "verticale", x: q.x };
    case "antecedent":
    case "inequation":
      return { type: "horizontale", y: q.k };
    case "extremum":
      return { type: "points", points: [{ x: q.x, y: q.y }] };
    case "variation":
      return { type: "points", points: exercice.courbe.type === "saturation" ? [] : pointsDeChangement(exercice.courbe.points) };
    case "tendance":
      return { type: "horizontale", y: q.L };
  }
}

function formatBorne(b: Morceau["borneGauche"]): string {
  return b === "-inf" ? "−∞" : b === "+inf" ? "+∞" : formatNombreTexte(b);
}

export function formatMorceauxTexte(morceaux: Morceau[]): string {
  return morceaux.map((m) => `${m.crochetGauche}${formatBorne(m.borneGauche)} ; ${formatBorne(m.borneDroite)}${m.crochetDroit}`).join(" ∪ ");
}

/** Réponse attendue de l'écran de lecture, en texte, toujours avec son unité. */
export function reponseAttendueTexte(exercice: ExerciceGraphiqueContexte, q: QuestionGraphique): string {
  const t = TEXTES_CONTEXTES[exercice.contexte];
  switch (q.type) {
    case "image":
      return t.valeurY(q.y);
    case "antecedent":
      return q.solutions.map(t.valeurX).join(" et ");
    case "inequation":
      return `${formatMorceauxTexte(q.solution)} (en ${t.uniteX})`;
    case "extremum":
      return `${q.nature === "max" ? "maximum" : "minimum"} de ${t.valeurY(q.y)}, atteint ${t.moment(q.x)}`;
    case "variation":
      return `${formatMorceauxTexte(q.intervalles)} (en ${t.uniteX})`;
    case "tendance":
      return t.valeurY(q.L);
  }
}

/** Titre court d'un écran (fiche des puces cliquables). */
export function titreEcran(indexEcran: number): string {
  const numero = Math.floor(indexEcran / 2) + 1;
  return indexEcran % 2 === 0 ? `Question ${numero} — caractéristique demandée` : `Question ${numero} — lecture`;
}
