// Copie 5e (6h) de `5e-4h/generateurs5e/detectiveSuites/exportEvaluation.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveSuites } from "./core/detectiveSuites.types";
import { indiceLigneFausse } from "./moteur/modeleDetectiveSuites";
import { CONSIGNE_GENERALE, consignesEcrans, enonceExercice, lignesCopie, nomErreur, reponseFragments, souderPonctuation } from "./ui/formatDetectiveSuites";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveSuites } from "./";
import { profilDetectiveSuites } from "./profil";
import { correctionDetailleeDetectiveSuites } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de 5gen49 « Détective d'erreurs : suites ».
 * Énoncé papier = ce que l'élève devait faire, la copie numérotée et la consigne globale (« Une
 * ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution. ») ;
 * les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du corrigé détaillé
 * « comme au tableau » (`corrigeDetaille.ts`, partagé avec l'appli). Séries
 * équilibrées : `profil.ts`. Même mise en page de copie que 6gen88 (gen81/gen91, 6gen84).
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées par la
 * feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveSuites): string {
  const items = lignesCopie(e)
    .map(
      (f, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(f)}</span></div>`,
    )
    .join("");
  return [`<p class="paragraphe">${fragmentsVersHtml(enonceExercice(e))}</p>`, `<p class="paragraphe">Copie de l'élève :</p>`, `<div class="paragraphe copie-eleve">${items}</div>`].join("");
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDetectiveSuites): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveSuites): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice sur les suites rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveSuites): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...reponseFragments(e)]);
}

function construireCorrection(e: ExerciceDetectiveSuites): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveSuites): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de c)" },
  ];
  if (e.variante === "pourcentage" && e.mode === "calcul") erreurs.push({ description: [texte("Résultat intermédiaire arrondi trop tôt, ou unité oubliée")], cout: "moitié des points de c)" });
  if (e.variante === "pourcentage" && e.mode === "exact") erreurs.push({ description: [texte("Valeur approchée donnée au lieu de la valeur exacte")], cout: "moitié des points de c)" });
  if (e.variante === "convergence" && e.support === "sommeInfinie") erreurs.push({ description: [texte("Valeur donnée alors que la somme infinie n'existe pas, ou l'inverse")], cout: "0 pt sur c)" });
  if (e.variante === "convergence" && e.support === "limite") erreurs.push({ description: [texte("Limite infinie donnée avec le mauvais signe")], cout: "moitié des points de c)" });
  const acceptees: FragmentConsigne[][] =
    e.variante === "pourcentage" && e.mode === "calcul"
      ? [[texte("Valeur arrondie à l'unité (un écart d'une unité, dû aux arrondis, est accepté)")]]
      : [[texte("Toute écriture exacte équivalente (par exemple "), latex("\\dfrac{9}{2}"), texte(" ou "), latex("4{,}5"), texte(")")]];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      { sousQuestion: "c", critere: [texte("Résolution reprise à partir de la ligne fausse : résultat final correct")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

/** Difficulté selon le support (jamais selon le type d'erreur, qui est le verdict). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceDetectiveSuites): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveSuites(e)), methode: 1, piege: 1 };
}

export const adaptateurEvaluationDetectiveSuites: AdaptateurFeuilleExercices<ExerciceDetectiveSuites> = {
  profilInstance: profilDetectiveSuites,
  titreDocument: "Détective d'erreurs : suites — Évaluation",
  nomFichierBase: "detective-erreurs-suites",
  genererInstance: genererExerciceDetectiveSuites,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveSuites,
  bareme,
  enoncePapier,
};
