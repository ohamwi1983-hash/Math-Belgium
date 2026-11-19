import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceTransformationDonnees } from "../../core/transformationDonnees.types";
import {
  CONSIGNE_GENERALE,
  conclusionBreve,
  ecrans,
  indicateursTexte,
  phrasesConclusion,
  populationTexte,
  tableauIndicateursHtml,
  transformationTexte,
  valeurAvecUnite,
} from "../../ui/formatTransformationDonnees";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTransformationDonnees } from "./index";
import { profilTransformationDonnees } from "./profil";
import { correctionDetailleeTransformationDonnees } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen108. Énoncé papier = population, tableau des
 * indicateurs de départ, transformation (mots du contexte) et deux VRAIES questions : a) les cinq
 * nouveaux indicateurs (étapes 1 à 3 de l'écran : y = a·x + b, position, dispersion) ; b) une phrase
 * qui explique l'effet de la transformation (étape 4). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function donneesHtml(e: ExerciceTransformationDonnees): string {
  return (
    `<p class="paragraphe">${echapper(populationTexte(e))}</p>` +
    `<div class="paragraphe">${tableauIndicateursHtml(e)}</div>` +
    `<p class="paragraphe"><strong>${echapper(transformationTexte(e))}</strong></p>`
  );
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceTransformationDonnees): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: ecrans(e).map((ecran) => ({ consigne: ecran.type === "choix" ? [texte("Décris l'effet de cette transformation sur la série.")] : ecran.consigne })),
  };
}

function enoncePapier(e: ExerciceTransformationDonnees): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [
        { consigne: [texte("Détermine la moyenne, la médiane, l'étendue, la variance et l'écart-type de la nouvelle série, avec leur unité. Justifie à l'aide de la transformation écrite sous la forme "), latex("y = a\\,x + b"), texte(".")] },
        { consigne: [texte("Explique en une phrase l'effet de cette transformation sur la moyenne et sur la dispersion de la série.")] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"]],
    reponseBreve: [texte(`a) ${indicateursTexte(e)}. b) ${conclusionBreve(e).charAt(0).toUpperCase()}${conclusionBreve(e).slice(1)}`)],
  };
}

function reponseBreve(e: ExerciceTransformationDonnees): FragmentConsigne[] {
  return [texte(`${indicateursTexte(e).charAt(0).toUpperCase()}${indicateursTexte(e).slice(1)}.`)];
}

function nombreTexte(n: number): string {
  return valeurAvecUnite(n, "").trim();
}

/** Niveau (grille commune) : trois écrans qui transforment, la conclusion (d) se lit sur les résultats
 * chiffrés des étapes b et c (écran de lecture) ; méthode à choisir (traduire le récit en
 * y = a·x + b, savoir quels indicateurs sont touchés) ; piège dans les données : constante ajoutée
 * AVANT la multiplication, ou a < 0. */
function criteresDifficulte(e: ExerciceTransformationDonnees): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTransformationDonnees(e), ["d"]), methode: 1, piege: e.forme === "avant" || e.forme === "negatif" ? 1 : 0 };
}

function construireCorrection(e: ExerciceTransformationDonnees): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: reponseBreve(e) },
    { type: "paragraphe", fragments: phrasesConclusion(e)[0]! },
  ];
}

function bareme(e: ExerciceTransformationDonnees): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (e.b !== 0) erreurs.push({ description: [texte("Constante "), latex("b"), texte(" ajoutée à l'étendue, à la variance ou à l'écart-type")], cout: "−0,5 par indicateur" });
  if (Math.abs(e.a) !== 1) erreurs.push({ description: [texte("Variance multipliée par "), latex("a"), texte(" au lieu de "), latex("a^2")], cout: "−0,5" });
  if (e.pourcentage !== null) erreurs.push({ description: [texte(`Coefficient ${nombreTexte(Math.abs(e.pourcentage) / 100)} au lieu de ${nombreTexte(e.a)} pour un pourcentage`)], cout: "0 pt sur a), b) et c)" });
  if (e.forme === "avant") erreurs.push({ description: [texte(`b = ${nombreTexte(e.constante!)} au lieu de ${nombreTexte(e.b)} (constante non multipliée)`)], cout: "−1 (moyenne et médiane fausses)" });
  if (e.a < 0) erreurs.push({ description: [texte("Écart-type ou étendue négatifs (multipliés par "), latex("a"), texte(" au lieu de "), latex("|a|"), texte(")")], cout: "−0,5" });
  erreurs.push({ description: [texte("Tous les indicateurs recalculés « à l'aveugle » avec la formule complète "), latex("a\\,x + b")], cout: "0 pt sur c) et d)" });
  erreurs.push({ description: [texte("Unité absente ou fausse (la variance est en unité au carré)")], cout: "−0,5 au total" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Transformation écrite sous la forme "), latex("y = a\\,x + b"), texte(" (coefficients justes)")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Nouvelle moyenne et nouvelle médiane")], points: 1 },
      { sousQuestion: "c", critere: [texte("Nouvelle étendue, variance et écart-type (facteurs "), latex("|a|"), texte(" et "), latex("a^2"), texte(", constante sans effet)")], points: 1.5 },
      { sousQuestion: "d", critere: [texte("Effet sur la position et sur la dispersion expliqué en une phrase")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Écart-type obtenu comme racine carrée de la nouvelle variance (même valeur)")],
      [texte("Explication équivalente, par exemple « la série est décalée / étirée, ses écarts sont multipliés par |a| »")],
    ],
  };
}

export const adaptateurEvaluationTransformationDonnees: AdaptateurFeuilleExercices<ExerciceTransformationDonnees> = {
  profilInstance: profilTransformationDonnees,
  titreDocument: "Effet d'une transformation des données — Évaluation",
  nomFichierBase: "transformation-donnees",
  genererInstance: genererExerciceTransformationDonnees,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTransformationDonnees,
  bareme,
  enoncePapier,
};
