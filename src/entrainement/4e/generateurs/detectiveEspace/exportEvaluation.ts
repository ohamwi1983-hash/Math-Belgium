import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeDetectiveEspace } from "./corrigeDetaille";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDetectiveEspace } from "../../core/detectiveEspace.types";
import { CONSIGNE_GENERALE, consignesEcrans, correctionCorrecte, dessinPaveSvg, figureSolideSvg } from "../../ui/formatDetectiveEspace";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDetectiveEspace } from "./index";
import { profilDetectiveEspace } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen107 « Détective d'erreurs : géométrie dans
 * l'espace ». Énoncé papier = ce que l'élève fictif devait faire, la figure (solide, ou son dessin
 * sur un quadrillage de 1 cm à l'échelle réelle), la copie numérotée et la consigne globale (« Une
 * ligne de cette copie est fausse. Trouve-la, explique l'erreur et corrige-la. ») ; les trois
 * écrans (ligne, erreur, correction) deviennent les étapes a, b, c du corrigé. La figure du corrigé
 * (droites, plan témoin, section complète ; ou le dessin juste) va dans `figureHtml`. Les choix
 * proposés à l'écran n'apparaissent jamais sur papier. Séries équilibrées : `profil.ts`.
 */

/** La copie, lignes numérotées EXPLICITEMENT et marge rouge (même mise en page que gen91/6gen99). */
function copieHtml(e: ExerciceDetectiveEspace): string {
  const items = e.lignes
    .map(
      (f, i) =>
        `<div style="display:flex;align-items:baseline;margin:3px 0">` +
        `<span style="flex:0 0 2em;text-align:right;padding-right:0.6em;border-right:2px solid #c0392b;color:#555">${i + 1}</span>` +
        `<span style="flex:1 1 auto;min-width:0;padding-left:0.7em;overflow-x:auto;overflow-y:hidden">${fragmentsVersHtml(f)}</span></div>`,
    )
    .join("");
  return `<p class="paragraphe">Copie de l'élève :</p><div class="paragraphe copie-eleve">${items}</div>`;
}

function figureEnonce(e: ExerciceDetectiveEspace): string {
  return e.figure.type === "solide" ? figureSolideSvg(e.figure, "papier") : dessinPaveSvg(e.figure.dessin, "papier");
}

function enteteHtml(e: ExerciceDetectiveEspace): string {
  return `<p class="paragraphe">${fragmentsVersHtml(e.enonce)}</p>${figureEnonce(e)}${copieHtml(e)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDetectiveEspace): SectionExercice {
  const consignes = consignesEcrans(e);
  // Écran c : la question de l'écran, sans « Choisis… » (aucun choix n'est imprimé).
  const c = e.theme === "cavaliere" ? [texte("Décris le dessin que l'élève aurait dû obtenir.")] : [texte(`Corrige la ligne ${e.ligneFausse + 1}.`)];
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: enteteHtml(e),
    questions: [consignes[0]!, consignes[1]!, c].map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDetectiveEspace): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

function reponseBreve(e: ExerciceDetectiveEspace): FragmentConsigne[] {
  return [texte(`Ligne ${e.ligneFausse + 1} fausse (${e.nomErreur}).`)];
}

function correctionDetaillee(e: ExerciceDetectiveEspace): EtapeCorrection[] {
  return correctionDetailleeDetectiveEspace(e);
}

function construireCorrection(e: ExerciceDetectiveEspace): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [...reponseBreve(e), texte(" "), ...(e.theme === "cavaliere" ? e.ligneCorrigee : correctionCorrecte(e).fragments)] }];
}

function bareme(e: ExerciceDetectiveEspace): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ligne signalée = une conséquence de l'erreur (ou la conclusion) au lieu de la ligne fausse")], cout: "0 pt sur a)" },
    { description: [texte("Erreur seulement constatée (« c'est faux ») sans dire quelle propriété n'est pas respectée")], cout: "moitié des points de b)" },
    { description: [texte("Correction juste mais non justifiée (aucun plan, aucune face ni aucune propriété citée)")], cout: "moitié des points de c)" },
  ];
  if (e.theme === "droites") erreurs.push({ description: [texte("Position déduite du dessin (traits qui se croisent ou non) au lieu d'un plan commun")], cout: "0 pt sur c)" });
  if (e.theme === "parallelisme") erreurs.push({ description: [texte("Conclusion recopiée sans revoir les lignes qui la justifient")], cout: "0 pt sur c)" });
  return {
    reponseFinale: [...reponseBreve(e), texte(" "), ...e.ligneCorrigee],
    criteres: [
      { sousQuestion: "a", critere: [texte("Ligne fausse identifiée")], points: 1 },
      { sousQuestion: "b", critere: [texte("Erreur nommée et expliquée (propriété du cours en jeu)")], points: 1 },
      { sousQuestion: "c", critere: [texte(e.theme === "cavaliere" ? "Ligne corrigée et dessin juste décrit (angle, longueur des fuyantes, pointillés)" : "Ligne corrigée, vraie et justifiée")], points: 2 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute rédaction équivalente ; un plan peut être nommé par n'importe quels trois de ses points non alignés.")]],
  };
}

/** Niveau (grille commune) : trois étapes qui raisonnent (ligne fausse, erreur, correction), sans
 * charge (la longueur des contrôles dépend de la ligne fausse et du type d'erreur, qui sont les
 * verdicts : le niveau ne doit pas les trahir) ; méthode 1 (trouver la propriété du cours en jeu),
 * aucun piège ni nombre. Constant pour toutes les instances : niveau 3, 8 min. */
function criteresDifficulte(e: ExerciceDetectiveEspace): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

export const adaptateurEvaluationDetectiveEspace: AdaptateurFeuilleExercices<ExerciceDetectiveEspace> = {
  profilInstance: profilDetectiveEspace,
  titreDocument: "Détective d'erreurs : géométrie dans l'espace — Évaluation",
  nomFichierBase: "detective-erreurs-espace",
  genererInstance: genererExerciceDetectiveEspace,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
