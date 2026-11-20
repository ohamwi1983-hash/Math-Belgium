import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveTrig } from "../../core5e/detectiveTrig.types";
import { indiceLigneFausse } from "../../moteur5e/modeleDetectiveTrig";
import { CONSIGNE_GENERALE, consignesEcrans, enonceExercice, lignesCopie, nomErreur, reponseFragments, souderPonctuation } from "../../ui5e/formatDetectiveTrig";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveTrig } from "./index";
import { profilDetectiveTrig } from "./profil";
import { correctionDetailleeDetectiveTrig } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de 5gen50 « Détective d'erreurs : trigonométrie ».
 * Énoncé papier = ce que l'élève devait faire, la copie numérotée et la consigne globale ; les trois
 * écrans (ligne, erreur, correction) deviennent les étapes a, b, c du corrigé détaillé « comme au
 * tableau » (`corrigeDetaille.ts`, partagé avec l'appli). Même mise en page de copie que 5gen49.
 */

function copieHtml(e: ExerciceDetectiveTrig): string {
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

function construireEnonce(e: ExerciceDetectiveTrig): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveTrig): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice de trigonométrie rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveTrig): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...reponseFragments(e)]);
}

function construireCorrection(e: ExerciceDetectiveTrig): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveTrig): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de c)" },
    { description: [texte("Valeur approchée donnée au lieu de la valeur exacte")], cout: "moitié des points de c)" },
  ];
  if (e.variante === "equation" || e.variante === "produit") erreurs.push({ description: [texte("Une solution de l'intervalle oubliée, ou une valeur hors de l'intervalle gardée")], cout: "moitié des points de c)" });
  const acceptees: FragmentConsigne[][] =
    e.variante === "parametres"
      ? [[texte("Toute abscisse où f atteint son maximum (la valeur attendue plus un multiple de la période)")]]
      : e.variante === "secteur"
        ? [[texte("Toute écriture exacte équivalente (par exemple "), latex("\\dfrac{25\\pi}{4}"), texte(" ou "), latex("6{,}25\\pi"), texte(")")]]
        : [[texte("Les solutions dans n'importe quel ordre, toute écriture exacte équivalente")]];
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

/** Niveau : méthode 1 (reconnaître la règle en défaut parmi celles du cours), piège 1 (une ligne
 * fausse cachée parmi des lignes cohérentes), comme 5gen49 ; étapes lues sur le corrigé. */
function criteresDifficulte(e: ExerciceDetectiveTrig): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveTrig(e)), methode: 1, piege: 1, nombres: 0 };
}

export const adaptateurEvaluationDetectiveTrig: AdaptateurFeuilleExercices<ExerciceDetectiveTrig> = {
  profilInstance: profilDetectiveTrig,
  titreDocument: "Détective d'erreurs : trigonométrie — Évaluation",
  nomFichierBase: "detective-erreurs-trigonometrie",
  genererInstance: genererExerciceDetectiveTrig,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveTrig,
  bareme,
  enoncePapier,
};
