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
import type { ExerciceDetectiveComplexes } from "../../core6e/detectiveComplexes.types";
import { indiceLigneFausse } from "../../moteur6e/modeleDetectiveComplexes";
import { CONSIGNE_GENERALE, consignesEcrans, enonceExercice, lignesCopie, nomErreur, reponseFragments, souderPonctuation } from "../../ui6e/formatDetectiveComplexes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveComplexes } from "./index";
import { profilDetectiveComplexes } from "./profil";
import { correctionDetailleeDetective } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de 6gen99 « Détective d'erreurs : nombres
 * complexes ». Énoncé papier = ce que l'élève devait faire, la copie numérotée et la consigne
 * globale (« Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la
 * résolution. ») ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Séries équilibrées : `profil.ts`. Même mise en page de copie que 5gen49 / 6gen88.
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées par la
 * feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveComplexes): string {
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
function construireEnonce(e: ExerciceDetectiveComplexes): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveComplexes): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice sur les nombres complexes rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveComplexes): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...reponseFragments(e)]);
}

const correctionDetaillee = correctionDetailleeDetective;

function construireCorrection(e: ExerciceDetectiveComplexes): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveComplexes): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de c)" },
    { description: [texte("Valeur approchée donnée au lieu de la valeur exacte")], cout: "moitié des points de c)" },
  ];
  if (e.variante === "formeTrigo" || e.variante === "racines") erreurs.push({ description: [texte("Argument donné en degrés au lieu de radians")], cout: "moitié des points de c)" });
  if (e.variante === "racines") erreurs.push({ description: [texte("Une seule racine donnée au lieu des "), latex(`${e.n}`)], cout: "moitié des points de c)" });
  const acceptees: FragmentConsigne[][] =
    e.variante === "formeTrigo" || e.variante === "racines"
      ? [[texte("Tout argument égal au bon à "), latex("2k\\pi"), texte(" près (par exemple "), latex("-\\dfrac{2\\pi}{3}"), texte(" ou "), latex("\\dfrac{4\\pi}{3}"), texte(")")]]
      : [[texte("Toute écriture exacte équivalente (par exemple "), latex("2\\sqrt{3}"), texte(" ou "), latex("\\sqrt{12}"), texte(")")]];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      { sousQuestion: "c", critere: [texte("Résolution reprise à partir de la ligne fausse : résultat correct")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

/** Difficulté selon le support (jamais selon le type d'erreur, qui est le verdict). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceDetectiveComplexes): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 1, anglesEnPi: true };
}

export const adaptateurEvaluationDetectiveComplexes: AdaptateurFeuilleExercices<ExerciceDetectiveComplexes> = {
  profilInstance: profilDetectiveComplexes,
  titreDocument: "Détective d'erreurs : nombres complexes — Évaluation",
  nomFichierBase: "detective-erreurs-complexes",
  genererInstance: genererExerciceDetectiveComplexes,
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
