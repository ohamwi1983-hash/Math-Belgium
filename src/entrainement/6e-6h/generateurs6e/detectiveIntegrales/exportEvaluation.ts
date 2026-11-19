import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveIntegrales } from "../../core6e/detectiveIntegrales.types";
import { indiceLigneFausse, valeursAttendues } from "../../moteur6e/modeleDetectiveIntegrales";
import { CONSIGNE_GENERALE, consignesEcrans, enonceExercice, lignesCopie, nomErreur, valeurFragments } from "../../ui6e/formatDetectiveIntegrales";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveIntegrales } from "./index";
import { profilDetectiveIntegrales } from "./profil";
import { correctionDetailleeDetectiveIntegrales } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de 6gen84. Énoncé papier = les données, la copie
 * numérotée et la consigne globale (« Une ligne de cette résolution est fausse. Trouve-la, explique
 * l'erreur et corrige la résolution. ») ; les trois écrans (ligne, erreur, correction) deviennent les
 * étapes a, b, c du corrigé. Séries équilibrées : `profil.ts`. Même mise en page de copie que
 * gen81/gen91.
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées par la
 * feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveIntegrales): string {
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
function construireEnonce(e: ExerciceDetectiveIntegrales): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveIntegrales): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice sur les intégrales rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function valeurs(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return valeursAttendues(e).flatMap((v, i) => (i === 0 ? valeurFragments(v) : [texte(" ; "), ...valeurFragments(v)]));
}

function reponseBreve(e: ExerciceDetectiveIntegrales): FragmentConsigne[] {
  return [texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...valeurs(e)];
}

const correctionDetaillee = correctionDetailleeDetectiveIntegrales;

function construireCorrection(e: ExerciceDetectiveIntegrales): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveIntegrales): BaremeExercice {
  const deuxValeurs = valeursAttendues(e).length === 2;
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Valeur approchée donnée au lieu de la valeur exacte")], cout: "moitié des points de c)" },
  ];
  if (deuxValeurs) erreurs.push({ description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "0 pt sur le résultat final" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      ...(deuxValeurs
        ? [
            { sousQuestion: "c", critere: [texte("Ligne fausse corrigée (bonne valeur exacte)")], points: 1 },
            { sousQuestion: "c", critere: [texte("Suite reprise : résultat final exact")], points: 1 },
          ]
        : [{ sousQuestion: "c", critere: [texte("Résolution reprise à partir de la ligne fausse : résultat final exact")], points: 2 }]),
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [
        texte("Toute forme exacte équivalente (par exemple "),
        latex("-2\\ln(2)"),
        texte(" ou "),
        latex("\\ln\\left(\\dfrac{1}{4}\\right)"),
        texte(", "),
        latex("\\dfrac{9\\pi}{2}"),
        texte(" ou "),
        latex("4{,}5\\pi"),
        texte(") ; une primitive à une constante près quand la ligne ne demande qu'une primitive"),
      ],
    ],
  };
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceDetectiveIntegrales): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 1 };
}

export const adaptateurEvaluationDetectiveIntegrales: AdaptateurFeuilleExercices<ExerciceDetectiveIntegrales> = {
  profilInstance: profilDetectiveIntegrales,
  titreDocument: "Le détective d'erreurs : intégrales et primitives — Évaluation",
  nomFichierBase: "detective-erreurs-integrales",
  genererInstance: genererExerciceDetectiveIntegrales,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
