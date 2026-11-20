import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceDetectiveFonction } from "../../core/detectiveFonction.types";
import { copieEleve, indiceLigneFausse, nomExtremum } from "../../moteur/modeleDetectiveFonction";
import { CONSIGNE_GENERALE, consignesEcrans, nomErreur, recit, reponseFragments, resultatCopieFragments, souderPonctuation } from "../../ui/formatDetectiveFonction";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveFonction } from "./index";
import { profilDetectiveFonction } from "./profil";
import { correctionDetailleeDetectiveFonction } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen127 « Détective d'erreurs : fonction du second
 * degré ». Énoncé papier = ce que l'élève devait faire, la copie numérotée et la consigne globale ;
 * les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du corrigé. Même mise
 * en page de copie que gen121 et gen112.
 */

type E = ExerciceDetectiveFonction;

/** La copie, lignes numérotées EXPLICITEMENT et marge rouge ; une formule longue défile dans sa ligne. */
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

function resultatDemande(e: E): string {
  if (e.variante === "image") return "Donne l'image correcte de f.";
  if (e.variante === "optimum") return `Donne le ${nomExtremum(e)} correct et l'abscisse où il est atteint.`;
  return "Donne le sommet correct.";
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: recit(e), enteteHtml: copieHtml(e), questions: [{ consigne: [texte(`${CONSIGNE_GENERALE} ${resultatDemande(e)}`)] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}). `), ...reponseFragments(e)]);
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
      { description: [texte("Résultat de la copie recopié : "), ...resultatCopieFragments(e)], cout: "0 pt sur c)" },
    ],
    reponsesAcceptees: [[texte("Toute écriture équivalente du résultat (sommet donné par son abscisse et son ordonnée, image décrite en mots si l’intervalle est juste)")]],
  };
}

/** Niveau : trois écrans qui transforment (la ligne et l'erreur se trouvent en refaisant le calcul) ;
 * méthode 1 (retrouver la règle du cours qui n'est pas suivie) ; aucun piège dans les données
 * (l'erreur est la question) ; sans charge — le nombre de lignes de la correction ne doit pas
 * dépendre du type d'erreur (verdict). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveFonction(e)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationDetectiveFonction: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilDetectiveFonction,
  titreDocument: "Détective d'erreurs : fonction du second degré — Évaluation",
  nomFichierBase: "detective-erreurs-fonction-second-degre",
  genererInstance: genererExerciceDetectiveFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveFonction,
  bareme,
  enoncePapier,
};
