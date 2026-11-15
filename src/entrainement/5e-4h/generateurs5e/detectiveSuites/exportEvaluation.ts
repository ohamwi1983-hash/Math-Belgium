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
import type { ExerciceDetectiveSuites } from "../../core5e/detectiveSuites.types";
import { correction, descriptionCorrecte, indiceLigneFausse, majuscule } from "../../moteur5e/modeleDetectiveSuites";
import { CONSIGNE_GENERALE, consignesEcrans, constat, descriptionFragments, enonceExercice, lignesCopie, nomErreur, piege, reponseFragments, souderPonctuation } from "../../ui5e/formatDetectiveSuites";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveSuites } from "./index";
import { profilDetectiveSuites } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de 5gen49 « Détective d'erreurs : suites ».
 * Énoncé papier = ce que l'élève devait faire, la copie numérotée et la consigne globale (« Une
 * ligne de cette résolution est fausse. Trouve-la, explique l'erreur et corrige la résolution. ») ;
 * les trois écrans (ligne, erreur, correction) deviennent les étapes a, b, c du corrigé. Séries
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

function correctionDetaillee(e: ExerciceDetectiveSuites): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const etapes: EtapeCorrection[] = [
    { label: "Contrôle", sousQuestion: "a", fragments: constat(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La ligne ${i + 1} est fausse.`)] },
    { label: "Erreur", sousQuestion: "b", fragments: descriptionFragments(descriptionCorrecte(e), e) },
  ];
  /** « Ligne n corrigée : formule générale… » (minuscule après les deux-points). */
  const enMinuscule = (ligne: FragmentConsigne[]): FragmentConsigne[] =>
    ligne
      // « Raison : », « Formule générale : », « Baisse de 4 % par an : suite géométrique de raison »
      // en tête de ligne : déjà dit par « Ligne n corrigée : » (pas de deux-points en cascade).
      .filter((f, j) => !(j === 0 && f.type === "texte" && /^(Raison|Formule générale) : $|^(Hausse|Baisse) de .* : suite géométrique de raison $/.test(f.valeur)))
      .map((f, j) => (j === 0 && f.type === "texte" && /^[A-ZÉ][a-zé]/.test(f.valeur) ? { ...f, valeur: f.valeur[0]!.toLowerCase() + f.valeur.slice(1) } : f));
  /** La dernière ligne de la résolution corrigée est toujours sa conclusion (la ligne fausse n'est
   * jamais la dernière) : elle devient la ligne « Conclusion », sans son éventuel « Conclusion : ». */
  const lignes = correction(e).map(souderPonctuation);
  const conclusion = lignes.pop()!.map((f, j) => (j === 0 && f.type === "texte" && f.valeur.startsWith("Conclusion : ") ? { ...f, valeur: majuscule(f.valeur.slice("Conclusion : ".length)) } : f));
  lignes.forEach((ligne, k) => {
    etapes.push({ label: k === 0 ? "Correction" : "Calcul", sousQuestion: "c", fragments: souderPonctuation(k === 0 ? [texte(`Ligne ${i + 1} corrigée : `), ...enMinuscule(ligne)] : ligne) });
  });
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: conclusion });
  etapes.push({ label: "Piège", sousQuestion: "b", fragments: piege(e) });
  return etapes;
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
function difficulte(e: ExerciceDetectiveSuites): 1 | 2 | 3 {
  return e.variante === "convergence" ? 3 : 2;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
