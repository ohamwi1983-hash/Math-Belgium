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
import type { ExerciceDetectiveComplexes } from "../../core6e/detectiveComplexes.types";
import { correction, descriptionCorrecte, indiceLigneFausse } from "../../moteur6e/modeleDetectiveComplexes";
import { CONSIGNE_GENERALE, consignesEcrans, constat, descriptionFragments, enonceExercice, lignesCopie, nomErreur, piege, reponseFragments, souderPonctuation } from "../../ui6e/formatDetectiveComplexes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveComplexes } from "./index";
import { profilDetectiveComplexes } from "./profil";

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

function correctionDetaillee(e: ExerciceDetectiveComplexes): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const etapes: EtapeCorrection[] = [
    { label: "Contrôle", sousQuestion: "a", fragments: constat(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La ligne ${i + 1} est fausse.`)] },
    { label: "Erreur", sousQuestion: "b", fragments: descriptionFragments(descriptionCorrecte(e), e) },
  ];
  /** « Ligne n corrigée : … » : minuscule après les deux-points. */
  const enMinuscule = (ligne: FragmentConsigne[]): FragmentConsigne[] =>
    ligne.map((f, j) => (j === 0 && f.type === "texte" && /^[A-ZÉ][a-zé]/.test(f.valeur) ? { ...f, valeur: f.valeur[0]!.toLowerCase() + f.valeur.slice(1) } : f));
  // La résolution corrigée, à partir de la ligne fausse ; les lignes suivantes sont reprises.
  const lignes = correction(e).slice(i).map(souderPonctuation);
  lignes.forEach((ligne, k) => {
    etapes.push({ label: k === 0 ? "Correction" : "Calcul", sousQuestion: "c", fragments: souderPonctuation(k === 0 ? [texte(`Ligne ${i + 1} corrigée : `), ...enMinuscule(ligne)] : ligne) });
  });
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: souderPonctuation(reponseFragments(e)) });
  etapes.push({ label: "Piège", sousQuestion: "b", fragments: piege(e) });
  return etapes;
}

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
function difficulte(e: ExerciceDetectiveComplexes): 1 | 2 | 3 {
  return e.variante === "moivre" || e.variante === "racines" ? 3 : 2;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
