import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceValeurManquante } from "../../core/valeurManquante.types";
import {
  conclusionBreve,
  conclusions,
  ecrans,
  inconnue,
  justificationEquation,
  nombreLatex,
  piegeCorrige,
  recit,
  resolutionLatex,
  solution,
  tableauHtml,
} from "../../ui/formatValeurManquante";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurManquante } from "./index";
import { profilValeurManquante } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen109. Énoncé papier = récit, tableau éventuel
 * (avec « ? » pour l'inconnue) et UNE question : les trois écrans (poser l'équation, résoudre,
 * conclure) sont des étapes d'apprentissage, qui vont dans le corrigé (« Étape n — … »).
 * Séries équilibrées : `profil.ts`.
 */

const CONSIGNE_PAPIER = "Traduis la situation par une équation, résous-la, puis conclus par une phrase dans le contexte. Donne des valeurs exactes.";

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function donneesHtml(e: ExerciceValeurManquante): string {
  const r = recit(e);
  const p = (t: string) => `<p class="paragraphe">${echapper(t)}</p>`;
  return (
    r.avant.map(p).join("") +
    (r.tableau ? `<div class="paragraphe">${tableauHtml(r.tableau)}</div>` : "") +
    r.apres.map(p).join("") +
    `<p class="paragraphe"><strong>${echapper(r.question)}</strong></p>`
  );
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceValeurManquante): SectionExercice {
  const consignes: FragmentConsigne[][] = [
    [texte("Écris l'équation qui traduit la situation.")],
    ecrans(e)[1]!.consigne,
    [texte("Conclus par une phrase, dans le contexte.")],
  ];
  return {
    enteteFragments: [texte(CONSIGNE_PAPIER)],
    enteteHtml: donneesHtml(e),
    questions: consignes.map((consigne) => ({ consigne })),
  };
}

function reponseBreve(e: ExerciceValeurManquante): FragmentConsigne[] {
  const c = conclusionBreve(e);
  return [latex(`${inconnue(e)} = ${nombreLatex(solution(e))}`), texte(` ; ${c}`)];
}

function enoncePapier(e: ExerciceValeurManquante): EnoncePapier {
  return {
    section: { enteteFragments: [texte(CONSIGNE_PAPIER)], enteteHtml: donneesHtml(e), questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function sousQuestionPiege(e: ExerciceValeurManquante): string {
  return e.variante === "valeur-pour-mediane" ? "c" : "a";
}

function correctionDetaillee(e: ExerciceValeurManquante): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: justificationEquation(e) },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(resolutionLatex(e))] },
    { label: "Conclusion", sousQuestion: "c", fragments: conclusions(e)[0]! },
    { label: "Piège", sousQuestion: sousQuestionPiege(e), fragments: piegeCorrige(e) },
  ];
}

function construireCorrection(e: ExerciceValeurManquante): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: reponseBreve(e) },
    { type: "paragraphe", fragments: conclusions(e)[0]! },
  ];
}

function erreurs(e: ExerciceValeurManquante): ErreurFrequente[] {
  switch (e.variante) {
    case "note-a-obtenir":
      return e.forme === "sans-coef"
        ? [
            { description: [texte("Moyenne de deux moyennes (moyenne des notes connues et dernière note)")], cout: "0 pt sur les étapes 1 et 2" },
            { description: [texte("Nombre de notes non mis à jour au dénominateur")], cout: "−1" },
            { description: [texte("Verdict absent ou « au plus » au lieu de « au moins »")], cout: "−0,5" },
          ]
        : [
            { description: [texte("Coefficients oubliés")], cout: "0 pt sur les étapes 1 et 2" },
            { description: [texte("Coefficient de la dernière épreuve absent du dénominateur, ou de la note cherchée")], cout: "−1" },
            { description: [texte("Verdict absent (une note ne dépasse pas 20)")], cout: "−0,5" },
          ];
    case "effectif-manquant":
      return [
        { description: [texte("Effectif total non mis à jour (dénominateur sans "), latex("k"), texte(")")], cout: "−1" },
        { description: [texte("Effectif "), latex("k"), texte(" seul au numérateur, sans sa valeur")], cout: "−1" },
        { description: [texte("Moyenne des valeurs distinctes au lieu de la moyenne pondérée")], cout: "0 pt sur les étapes 1 et 2" },
      ];
    case "valeur-pour-mediane":
      return [
        { description: [texte("Effectif cumulé de la mauvaise valeur, ou valeurs ajoutées mal placées dans les effectifs cumulés")], cout: "−1" },
        { description: [texte("Effectif total non mis à jour dans le seuil")], cout: "−1" },
        { description: [texte(e.forme === "haut" ? "Une valeur de trop ajoutée « pour dépasser strictement » (l'égalité suffit ici)" : "Égalité prise pour un dépassement strict (une valeur de moins)")], cout: "−0,5" },
      ];
    case "moyenne-groupes":
      return [
        { description: [texte("Moyenne des deux moyennes")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [texte("Division par 2 au lieu de l'effectif total")], cout: "−1" },
        { description: [texte("Unité absente")], cout: "−0,5" },
      ];
  }
}

function bareme(e: ExerciceValeurManquante): BaremeExercice {
  const accepte: FragmentConsigne[][] =
    e.variante === "valeur-pour-mediane"
      ? [[texte("Recherche par essais successifs du nombre de valeurs à ajouter, si chaque essai est vérifié par la règle du seuil")]]
      : [[texte("Raisonnement direct sans équation écrite (total à atteindre, puis différence), s'il est justifié")]];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Équation correcte (bon numérateur, effectif total ou coefficients à jour)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Résolution exacte de l'équation")], points: 1.5 },
      { sousQuestion: "c", critere: [texte(e.variante === "note-a-obtenir" ? "Conclusion en contexte, avec le verdict (possible ou non)" : "Conclusion en contexte, avec l'unité")], points: 1 },
    ],
    erreursFrequentes: erreurs(e),
    reponsesAcceptees: accepte,
  };
}

function difficulte(e: ExerciceValeurManquante): 1 | 2 | 3 {
  if (e.variante === "valeur-pour-mediane") return 3;
  if (e.variante === "moyenne-groupes" && e.forme === "globale") return 1;
  return 2;
}

export const adaptateurEvaluationValeurManquante: AdaptateurFeuilleExercices<ExerciceValeurManquante> = {
  profilInstance: profilValeurManquante,
  titreDocument: "Retrouver une valeur manquante — Évaluation",
  nomFichierBase: "valeur-manquante",
  genererInstance: genererExerciceValeurManquante,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
