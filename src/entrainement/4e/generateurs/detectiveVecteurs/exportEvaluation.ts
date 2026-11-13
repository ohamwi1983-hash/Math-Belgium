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
import type { ExerciceDetectiveVecteurs } from "../../core/detectiveVecteurs.types";
import { descriptionCorrecte, indiceLigneFausse, resolutionCorrecte, typeErreur, valeursAttendues } from "../../moteur/modeleDetectiveVecteurs";
import { CONSIGNE_GENERALE, consignesEcrans, constat, descriptionFragments, enonceExercice, lignesCopie, nomErreur, piege, souderPonctuation, valeurFragments } from "../../ui/formatDetectiveVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveVecteurs } from "./index";
import { profilDetectiveVecteurs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen91. Énoncé papier = les données, la copie
 * numérotée et la consigne globale (« Une ligne de cette résolution est fausse. Trouve-la, explique
 * l'erreur et corrige la résolution. ») ; les trois écrans (ligne, erreur, correction) deviennent les
 * étapes a, b, c du corrigé. Séries équilibrées : `profil.ts`. Même mise en page de copie que gen81.
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées par la
 * feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveVecteurs): string {
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
function construireEnonce(e: ExerciceDetectiveVecteurs): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveVecteurs): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un exercice de calcul vectoriel rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function valeurs(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return valeursAttendues(e).flatMap((v, i) => (i === 0 ? valeurFragments(v) : [texte(" ; "), ...valeurFragments(v)]));
}

function reponseBreve(e: ExerciceDetectiveVecteurs): FragmentConsigne[] {
  return [texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...valeurs(e)];
}

function correctionDetaillee(e: ExerciceDetectiveVecteurs): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const correcte = resolutionCorrecte(e);
  const etapes: EtapeCorrection[] = [
    { label: "Contrôle", sousQuestion: "a", fragments: constat(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La ligne ${i + 1} est fausse.`)] },
    { label: "Erreur", sousQuestion: "b", fragments: descriptionFragments(descriptionCorrecte(e), e) },
  ];
  correcte.slice(i).forEach((ligne, k) => {
    etapes.push({ label: k === 0 ? "Correction" : "Calcul", sousQuestion: "c", fragments: souderPonctuation([texte(`Ligne ${i + k + 1} : `), ...ligne.fragments]) });
  });
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: valeurs(e) });
  etapes.push({ label: "Piège", sousQuestion: "b", fragments: piege(e) });
  return etapes;
}

function construireCorrection(e: ExerciceDetectiveVecteurs): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveVecteurs): BaremeExercice {
  const attendues = valeursAttendues(e);
  const deuxValeurs = attendues.length === 2;
  const verdict = attendues.some((v) => v.genre === "verdict");
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur étrange (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le calcul est faux ») sans être nommée")], cout: "moitié des points de b)" },
  ];
  if (deuxValeurs) erreurs.push({ description: [texte("Ligne fausse corrigée sans reprendre la suite de la résolution")], cout: "0 pt sur la conclusion" });
  if (verdict) erreurs.push({ description: [texte("Verdict de la copie recopié sans être revérifié avec la valeur corrigée")], cout: "0 pt sur la conclusion" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      ...(deuxValeurs
        ? [
            { sousQuestion: "c", critere: [texte("Ligne fausse corrigée (bonne valeur)")], points: 1 },
            { sousQuestion: "c", critere: [texte(verdict ? "Conclusion correcte, justifiée par la valeur corrigée" : "Suite reprise : conclusion juste")], points: 1 },
          ]
        : [{ sousQuestion: "c", critere: [texte("Résolution reprise à partir de la ligne fausse : conclusion juste")], points: 2 }]),
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute forme exacte équivalente (par exemple "), latex("2\\sqrt{5}"), texte(" ou "), latex("\\sqrt{20}"), texte(", "), latex("3{,}5"), texte(" ou "), latex("\\dfrac{7}{2}"), texte(")")]],
  };
}

function difficulte(e: ExerciceDetectiveVecteurs): 1 | 2 | 3 {
  const type = typeErreur(e);
  return type === "chasles" || type === "parallelogramme" ? 3 : 2;
}

export const adaptateurEvaluationDetectiveVecteurs: AdaptateurFeuilleExercices<ExerciceDetectiveVecteurs> = {
  profilInstance: profilDetectiveVecteurs,
  titreDocument: "Le détective d'erreurs vectoriel — Évaluation",
  nomFichierBase: "detective-erreurs-vecteurs",
  genererInstance: genererExerciceDetectiveVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
};
