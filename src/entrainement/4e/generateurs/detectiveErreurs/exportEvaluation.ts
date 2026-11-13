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
import type { ExerciceDetectiveErreurs } from "../../core/detectiveErreurs.types";
import { descriptionCorrecte, indiceLigneFausse, resolutionCorrecte, typeErreur } from "../../moteur/modeleDetectiveErreurs";
import { champsAttendus } from "../../moteur/verificationDetectiveErreurs";
import {
  CONSIGNE_GENERALE,
  NOTE_MEMOIRE,
  consignesEcrans,
  constat,
  descriptionFragments,
  enonceTriangle,
  fragmentsLigne,
  lignesCopie,
  nomErreur,
  piege,
  valeurLatex,
} from "../../ui/formatDetectiveErreurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveErreurs } from "./index";
import { profilDetectiveErreurs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen81. Énoncé papier = les données du triangle,
 * la copie numérotée et la consigne globale (« Une ligne de cette résolution est fausse. Trouve-la,
 * explique l'erreur et corrige la résolution. ») ; les trois écrans (ligne, erreur, correction)
 * deviennent les étapes a, b, c du corrigé. Séries équilibrées : `profil.ts`.
 */

/** La copie, lignes numérotées EXPLICITEMENT (les puces d'une liste `<ol>` sont retirées par la
 * feuille de style des documents) et marge rouge ; une formule longue défile dans sa ligne. */
function copieHtml(e: ExerciceDetectiveErreurs): string {
  const items = lignesCopie(e)
    .map(
      (f, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(f)}</span></div>`,
    )
    .join("");
  return [
    `<p class="paragraphe">${fragmentsVersHtml(enonceTriangle(e))}</p>`,
    `<p class="paragraphe">${fragmentsVersHtml([texte(NOTE_MEMOIRE)])}</p>`,
    `<p class="paragraphe">Copie de l'élève :</p>`,
    `<div class="paragraphe copie-eleve">${items}</div>`,
  ].join("");
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDetectiveErreurs): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: copieHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveErreurs): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Voici la résolution d'un triangle rédigée par un élève.")],
      enteteHtml: copieHtml(e),
      questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
    },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveErreurs): FragmentConsigne[] {
  const valeurs = champsAttendus(e).flatMap((v, i) => (i === 0 ? [latex(valeurLatex(v))] : [texte(" ; "), latex(valeurLatex(v))]));
  return [texte(`Ligne ${indiceLigneFausse(e) + 1} fausse (${nomErreur(e)}) ; `), ...valeurs];
}

function correctionDetaillee(e: ExerciceDetectiveErreurs): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const correcte = resolutionCorrecte(e);
  const etapes: EtapeCorrection[] = [
    { label: "Contrôle", sousQuestion: "a", fragments: constat(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La ligne ${i + 1} est fausse.`)] },
    { label: "Erreur", sousQuestion: "b", fragments: descriptionFragments(descriptionCorrecte(e), e) },
  ];
  correcte.slice(i).forEach((l, k) => {
    const numero = i + k + 1;
    const rang = e.scenario === "G1" ? "" : `Ligne ${numero} : `;
    etapes.push({ label: k === 0 ? "Correction" : l.valeur === null ? "Conclusion" : "Calcul", sousQuestion: "c", fragments: [...(rang ? [texte(rang)] : []), ...fragmentsLigne(l)] });
  });
  const valeurs = champsAttendus(e).flatMap((v, k) => (k === 0 ? [latex(valeurLatex(v))] : [texte(" ; "), latex(valeurLatex(v))]));
  etapes.push({ label: "Conclusion", sousQuestion: "c", fragments: valeurs });
  etapes.push({ label: "Piège", sousQuestion: "b", fragments: piege(e) });
  return etapes;
}

function construireCorrection(e: ExerciceDetectiveErreurs): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDetectiveErreurs): BaremeExercice {
  const deuxChamps = champsAttendus(e).length === 2;
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = la première valeur absurde (une conséquence de l'erreur) au lieu de la ligne qui la cause")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« le résultat est faux ») sans être nommée")], cout: "moitié des points de b)" },
  ];
  if (deuxChamps) erreurs.push({ description: [texte("Ligne fausse corrigée sans recalculer les lignes suivantes")], cout: "0 pt sur le résultat final" });
  if (typeErreur(e) !== "arrondi") erreurs.push({ description: [texte("Correction recalculée avec des valeurs arrondies trop tôt (écart au-delà de la précision demandée)")], cout: "−0,5 pt" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée")], points: 1 },
      ...(deuxChamps
        ? [
            { sousQuestion: "c", critere: [texte("Ligne fausse corrigée (bonne valeur)")], points: 1 },
            { sousQuestion: "c", critere: [texte("Lignes suivantes recalculées : résultat final juste")], points: 1 },
          ]
        : [{ sousQuestion: "c", critere: [texte("Ligne fausse corrigée (bonne valeur, démarche montrée)")], points: 2 }]),
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs à une unité près du dernier chiffre demandé")]],
  };
}

function difficulte(e: ExerciceDetectiveErreurs): 1 | 2 | 3 {
  const type = typeErreur(e);
  return type === "arrondi" || type === "ambigu" || type === "obtus" ? 3 : 2;
}

export const adaptateurEvaluationDetectiveErreurs: AdaptateurFeuilleExercices<ExerciceDetectiveErreurs> = {
  profilInstance: profilDetectiveErreurs,
  calculatriceIndispensable: true,
  titreDocument: "Le détective d'erreurs — Évaluation",
  nomFichierBase: "detective-erreurs-triangle",
  genererInstance: genererExerciceDetectiveErreurs,
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
