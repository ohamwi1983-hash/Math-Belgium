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
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveStatistique } from "../../core/detectiveStatistique.types";
import { indiceLigneFausse } from "../../moteur/modeleDetectiveStatistique";
import {
  CONSIGNE_GENERALE,
  consignesEcrans,
  lignesCopie,
  nomErreur,
  recitApres,
  recitAvant,
  reponseFragments,
  souderPonctuation,
  tableauDonnees,
} from "../../ui/formatDetectiveStatistique";
import { tableauHtml } from "../../ui/formatValeurManquante";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveStatistique } from "./index";
import { profilDetectiveStatistique } from "./profil";
import { correctionDetailleeDetectiveStatistique } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen112 « Détective d'erreurs : statistique ».
 * Énoncé papier = ce que l'élève devait faire (récit, tableau éventuel), la copie numérotée et la
 * consigne globale (« Une ligne de cette résolution est fausse. Trouve-la, explique l'erreur et
 * corrige la résolution. ») ; les trois écrans (ligne, erreur, correction) deviennent les étapes
 * a, b, c du corrigé. Séries équilibrées : `profil.ts`. Même mise en page de copie que 5gen49.
 */

/** Données (récit, tableau) puis la copie, lignes numérotées EXPLICITEMENT (les puces d'une liste
 * `<ol>` sont retirées par la feuille de style des documents) et marge rouge ; une formule longue
 * défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveStatistique): string {
  const items = lignesCopie(e)
    .map(
      (f, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(f)}</span></div>`,
    )
    .join("");
  const tab = tableauDonnees(e);
  return [
    `<p class="paragraphe">${fragmentsVersHtml(recitAvant(e))}</p>`,
    tab ? `<div class="paragraphe">${tableauHtml(tab)}</div>` : "",
    `<p class="paragraphe">${fragmentsVersHtml(recitApres(e))}</p>`,
    `<p class="paragraphe">Copie de l'élève :</p>`,
    `<div class="paragraphe copie-eleve">${items}</div>`,
  ].join("");
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDetectiveStatistique): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveStatistique): EnoncePapier {
  const precision = e.variante === "dispersion" ? " Donne l'écart-type arrondi au centième." : "";
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice de statistique rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(`${CONSIGNE_GENERALE}${precision}`)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveStatistique): FragmentConsigne[] {
  return souderPonctuation([texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}). `), ...reponseFragments(e)]);
}

/** Niveau (grille commune) : trois écrans qui transforment (la ligne et l'erreur se trouvent en
 * refaisant le calcul) ; méthode : retrouver la règle du cours qui n'a pas été suivie (1) ; aucun
 * piège dans les données (l'erreur est la question). */
function criteresDifficulte(e: ExerciceDetectiveStatistique): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeDetectiveStatistique(e)), methode: 1, piege: 0 };
}

function construireCorrection(e: ExerciceDetectiveStatistique): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveStatistique): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
    { description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "moitié des points de c)" },
  ];
  if (e.variante === "dispersion") erreurs.push({ description: [texte("Écart-type calculé à partir de la variance non arrondie, ou avec n − 1 au lieu de n")], cout: "moitié des points de c)" });
  if (e.variante === "position" || e.variante === "cumules") erreurs.push({ description: [texte("Seuil « atteint » pris au lieu de « strictement dépassé » pour un autre paramètre")], cout: "moitié des points de c)" });
  const acceptees: FragmentConsigne[][] =
    e.variante === "dispersion"
      ? [[texte("Valeur arrondie au centième (un écart de 0,01 dû aux arrondis est accepté), avec ou sans l'unité")]]
      : [[texte("Valeur exacte, avec ou sans l'unité (par exemple "), latex("35"), texte(" ou "), latex("35\\,\\%"), texte(")")]];
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

export const adaptateurEvaluationDetectiveStatistique: AdaptateurFeuilleExercices<ExerciceDetectiveStatistique> = {
  profilInstance: profilDetectiveStatistique,
  titreDocument: "Détective d'erreurs : statistique — Évaluation",
  nomFichierBase: "detective-erreurs-statistique",
  genererInstance: genererExerciceDetectiveStatistique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  calculatriceIndispensable: ["dispersion"],
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDetectiveStatistique,
  bareme,
  enoncePapier,
};
