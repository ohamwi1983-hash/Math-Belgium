import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceDetectiveSecondDegre } from "../../core/detectiveSecondDegre.types";
import { copieEleve, estInequation, indiceLigneFausse } from "../../moteur/modeleDetectiveSecondDegre";
import { CONSIGNE_GENERALE, consignesEcrans, nomErreur, recit, reponseFragments, souderPonctuation } from "../../ui/formatDetectiveSecondDegre";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveSecondDegre } from "./index";
import { profilDetectiveSecondDegre } from "./profil";
import { correctionDetailleeDetectiveSecondDegre, ensembleCopieLatex } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen121 « Détective d'erreurs : second degré ».
 * Énoncé papier = ce que l'élève devait résoudre, la copie numérotée et la consigne globale
 * (« Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la
 * résolution. ») ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Séries équilibrées : `profil.ts`. Même mise en page de copie que gen112.
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées
 * par la feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveSecondDegre): string {
  const items = copieEleve(e)
    .map(
      (f, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(f)}</span></div>`,
    )
    .join("");
  return `<div class="paragraphe copie-eleve">${items}</div>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDetectiveSecondDegre): SectionExercice {
  return {
    enteteFragments: [...recit(e), texte(` ${CONSIGNE_GENERALE}`)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveSecondDegre): EnoncePapier {
  return {
    section: {
      enteteFragments: recit(e),
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(`${CONSIGNE_GENERALE} Donne l'ensemble-solution correct.`)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveSecondDegre): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}). `), ...reponseFragments(e)]);
}

/** Niveau (grille commune) : trois écrans qui transforment (la ligne et l'erreur se trouvent en
 * refaisant le calcul) ; méthode : retrouver la règle du cours qui n'a pas été suivie (1) ; aucun
 * piège dans les données (l'erreur est la question). Le nombre de lignes du corrigé dépend de la
 * variante, jamais du type d'erreur (verdict). */
function criteresDifficulte(e: ExerciceDetectiveSecondDegre): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveSecondDegre(e)), methode: 1, piege: 0 };
}

function construireCorrection(e: ExerciceDetectiveSecondDegre): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveSecondDegre): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Ensemble de la copie recopié : "), latex(`S=${ensembleCopieLatex(e)}`)], cout: "0 pt sur c)" },
  ];
  if (estInequation(e)) erreurs.push({ description: [texte("Bonnes bornes mais crochets faux (borne interdite fermée, racine d'une inégalité large ouverte)")], cout: "moitié des points de c)" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      { sousQuestion: "c", critere: [texte("Résolution reprise sans l'erreur : ensemble-solution correct")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Solutions écrites « x = … ou x = … » au lieu de l'ensemble, ou ensemble écrit en mots, si les valeurs et les crochets sont justes")]],
  };
}

export const adaptateurEvaluationDetectiveSecondDegre: AdaptateurFeuilleExercices<ExerciceDetectiveSecondDegre> = {
  profilInstance: profilDetectiveSecondDegre,
  titreDocument: "Détective d'erreurs : second degré — Évaluation",
  nomFichierBase: "detective-erreurs-second-degre",
  genererInstance: genererExerciceDetectiveSecondDegre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveSecondDegre,
  bareme,
  enoncePapier,
};
