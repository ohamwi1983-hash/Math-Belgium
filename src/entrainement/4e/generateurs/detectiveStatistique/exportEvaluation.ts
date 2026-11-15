import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveStatistique } from "../../core/detectiveStatistique.types";
import { descriptionCorrecte, indiceLigneFausse, resolutionCorrecte } from "../../moteur/modeleDetectiveStatistique";
import {
  CONSIGNE_GENERALE,
  consignesEcrans,
  constat,
  descriptionFragments,
  lignesCopie,
  nomErreur,
  piege,
  recitApres,
  recitAvant,
  reponseFragments,
  souderPonctuation,
  tableauDonnees,
} from "../../ui/formatDetectiveStatistique";
import { tableauHtml } from "../../ui/formatValeurManquante";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveStatistique } from "./index";
import { profilDetectiveStatistique } from "./profil";

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

/** « Moyenne : … » → « moyenne : … » après « Ligne n corrigée : ». */
function enMinuscule(ligne: FragmentConsigne[]): FragmentConsigne[] {
  return ligne.map((f, j) => (j === 0 && f.type === "texte" && /^[A-ZÉ][a-zé]/.test(f.valeur) ? { ...f, valeur: f.valeur[0]!.toLowerCase() + f.valeur.slice(1) } : f));
}

function correctionDetaillee(e: ExerciceDetectiveStatistique): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const etapes: EtapeCorrection[] = [
    { label: "Contrôle", sousQuestion: "a", fragments: constat(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La ligne ${i + 1} est fausse.`)] },
    { label: "Erreur", sousQuestion: "b", fragments: descriptionFragments(descriptionCorrecte(e), e) },
  ];
  const lignes = resolutionCorrecte(e).map(souderPonctuation);
  /** Une dernière ligne « Conclusion : … » (dispersion, groupes) devient la ligne « Conclusion »
   * du corrigé, sans son préfixe ; sinon la conclusion est la réponse rédigée. */
  const derniere = lignes[lignes.length - 1]![0];
  let conclusion = reponseFragments(e);
  if (derniere?.type === "texte" && derniere.valeur.startsWith("Conclusion : ")) {
    const reste = derniere.valeur.slice("Conclusion : ".length);
    conclusion = [texte(reste[0]!.toUpperCase() + reste.slice(1)), ...lignes.pop()!.slice(1)];
  }
  lignes.slice(i).forEach((ligne, k) => {
    etapes.push({
      label: k === 0 ? "Correction" : "Calcul",
      sousQuestion: "c",
      fragments: souderPonctuation(k === 0 ? [texte(`Ligne ${i + 1} corrigée : `), ...enMinuscule(ligne)] : ligne),
    });
  });
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: conclusion });
  etapes.push({ label: "Piège", sousQuestion: "b", fragments: piege(e) });
  return etapes;
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

/** Difficulté selon le support (jamais selon le type d'erreur, qui est le verdict). */
function difficulte(e: ExerciceDetectiveStatistique): 1 | 2 | 3 {
  return e.variante === "dispersion" || e.variante === "cumules" ? 3 : 2;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
