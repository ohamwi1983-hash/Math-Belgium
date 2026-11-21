import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceDetectiveAnalytique } from "../../core/detectiveAnalytique.types";
import { NOM_ERREUR, copieEleve, indiceLigneFausse, scenario } from "../../moteur/modeleDetectiveAnalytique";
import { CONSIGNE_GENERALE, consignesEcrans, recit, reponseFragments } from "../../ui/formatDetectiveAnalytique";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveAnalytique } from "./index";
import { profilDetectiveAnalytique } from "./profil";
import { correctionDetailleeDetectiveAnalytique } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen99 « Détective d'erreurs : géométrie
 * analytique ». Énoncé papier = ce que l'élève devait faire, la copie numérotée (marge rouge) et la
 * consigne globale ; les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du
 * corrigé. Même mise en page de copie que gen127, gen121 et gen112 (non regroupable : copie longue
 * propre à l'instance).
 */

type E = ExerciceDetectiveAnalytique;

function copieHtml(e: E): string {
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

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: [...recit(e), texte(` ${CONSIGNE_GENERALE}`)], enteteHtml: copieHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: recit(e), enteteHtml: copieHtml(e), questions: [{ consigne: [texte(`${CONSIGNE_GENERALE} ${scenario(e).demande}`)] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${NOM_ERREUR[e.type]}). `), ...reponseFragments(e)];
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée (règle du cours)")], points: 1 },
      { sousQuestion: "c", critere: [texte("Copie reprise sans l'erreur : résultat correct")], points: 2 },
    ],
    erreursFrequentes: [
      { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
      { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points sur b)" },
      { description: [texte("Résultat de la copie recopié : "), ...scenario(e).resultatCopie], cout: "0 pt sur c)" },
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente du résultat (équation multipliée par un nombre non nul, autre forme d'équation de droite, racine non simplifiée)")]],
  };
}

/** Niveau : trois écrans qui transforment (la ligne et l'erreur se trouvent en refaisant le calcul) ;
 * méthode 1 ; aucun piège dans les données (l'erreur est la question) ; sans charge — le nombre de
 * lignes de la correction ne doit pas dépendre du type d'erreur (verdict). Niveau 3, 8 min constants. */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveAnalytique(e)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationDetectiveAnalytique: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDetectiveAnalytique,
  titreDocument: "Détective d'erreurs : géométrie analytique — Évaluation",
  nomFichierBase: "detective-geometrie-analytique",
  genererInstance: genererExerciceDetectiveAnalytique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveAnalytique,
  bareme,
  enoncePapier,
};
