import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceCasAmbigu } from "../../core/casAmbigu.types";
import { resoudreSSA, type ResolutionSSA } from "../../moteur/modeleCasAmbigu";
import { A_CHAPEAU, B_CHAPEAU, consignesEcrans, donneesFragments, egalOuEnviron, questionsPapier, uniteLatex } from "../../ui/formatCasAmbigu";
import { figureCasAmbiguSvg } from "../../ui/figureCasAmbigu";
import { nombreFrLatex } from "../../ui/nombreFr";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCasAmbigu } from "./index";
import { profilCasAmbigu } from "./profil";
import { correctionDetailleeCasAmbigu } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen74. Énoncé papier = données + figure SANS arc
 * (le cadre ne dépend que de Â et b : rien ne trahit l'issue) + deux vraies questions (combien de
 * triangles ? puis le côté c de chacun, ou la plus petite longueur de BC s'il n'y en a aucun),
 * imprimées à l'identique quelle que soit l'issue. Les cinq écrans deviennent les étapes a à e du
 * corrigé ; la figure avec l'arc de compas (0, 1 ou 2 intersections) est dans le CORRIGÉ
 * (`figureHtml`, étape d). Séries équilibrées : `profil.ts` (l'issue n'est jamais imposée).
 * Toutes les valeurs : `resoudreSSA` (module pur) et les formateurs de l'écran, sans arrondi
 * intermédiaire (valeurs exactes gardées en mémoire, seul l'affichage est arrondi).
 */

const CONSIGNE_PAPIER: FragmentConsigne[] = [
  texte("Dans un triangle ABC, on connaît deux côtés et l'angle "),
  latex(A_CHAPEAU),
  texte(", opposé à l'un d'eux (chaque côté minuscule est opposé au sommet de même lettre). Le sommet B est à placer sur la demi-droite [Ax) de la figure, tracée à l'échelle réduite."),
];

function enteteHtml(e: ExerciceCasAmbigu): string {
  return `<p class="paragraphe">${fragmentsVersHtml(donneesFragments(e))}</p>${figureCasAmbiguSvg(e, false)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceCasAmbigu): SectionExercice {
  return { enteteFragments: CONSIGNE_PAPIER, enteteHtml: enteteHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function enoncePapier(e: ExerciceCasAmbigu): EnoncePapier {
  return {
    section: { enteteFragments: CONSIGNE_PAPIER, enteteHtml: enteteHtml(e), questions: questionsPapier().map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a", "b", "c", "d"], ["e"]],
    reponseBreve: reponseBreve(e),
  };
}

function libelleNombre(n: number): string {
  return n === 0 ? "aucun triangle" : n === 1 ? "un seul triangle" : "deux triangles";
}

function cotesLatex(e: ExerciceCasAmbigu, r: ResolutionSSA): string {
  const u = uniteLatex(e);
  if (r.nombreTriangles === 2) return r.triangles.map((t) => `c_${t.rang} ${egalOuEnviron(t.c, 2, u)}`).join(" \\text{ et } ");
  return `c ${egalOuEnviron(r.triangles[0]!.c, 2, u)}`;
}

function reponseBreve(e: ExerciceCasAmbigu): FragmentConsigne[] {
  const r = resoudreSSA(e);
  if (r.nombreTriangles === 0) {
    return [texte("a) Aucun triangle ("), latex(`\\sin ${B_CHAPEAU} ${egalOuEnviron(r.sinB, 3)} > 1`), texte(") ; b) "), latex(`BC \\geq ${nombreFrLatex(Math.round(r.hauteur * 100) / 100)}${uniteLatex(e)}`)];
  }
  return [texte(`a) ${libelleNombre(r.nombreTriangles).replace(/^./, (c) => c.toUpperCase())} ; b) `), latex(cotesLatex(e, r))];
}

function construireCorrection(e: ExerciceCasAmbigu): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Niveau CONSTANT, quelle que soit l'issue (0, 1 ou 2 triangles) : le nombre de triangles est le
 * VERDICT de l'exercice — un niveau, une durée ou une charge qui en dépendraient le trahiraient sur la
 * feuille. Méthode 0 (la consigne impose la loi des sinus), piège 0 (l'ambiguïté EST la question),
 * écran « nombre de triangles » = lecture des tests de l'écran précédent, aucune charge. */
function criteresDifficulte(e: ExerciceCasAmbigu): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeCasAmbigu(e), ["d"]), sansCharge: true, methode: 0, piege: 0, nombres: 1 };
}

function bareme(e: ExerciceCasAmbigu): BaremeExercice {
  const r = resoudreSSA(e);
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Calculatrice en radians")], cout: "−1" },
    { description: [texte("Sinus arrondi trop tôt, d'où un angle ou un côté hors de la précision demandée")], cout: "−0,5" },
  ];
  if (r.comparaison === "inferieur") {
    erreurs.unshift(
      { description: [texte("Second candidat "), latex(`180^\\circ - ${B_CHAPEAU}_1`), texte(" oublié (conclusion « toujours un seul triangle »)")], cout: "0 pt sur les étapes 3 et 4" },
      { description: [texte("Second candidat gardé sans tester "), latex(`${A_CHAPEAU} + ${B_CHAPEAU} < 180^\\circ`)], cout: "0 pt sur l'étape 4" },
    );
  } else if (r.comparaison === "superieur") {
    erreurs.unshift({ description: [texte("Erreur de la calculatrice interprétée comme une faute de calcul (aucune conclusion)")], cout: "0 pt sur les étapes 2 à 4" });
  }
  if (r.nombreTriangles === 2) erreurs.push({ description: [texte("Côtés attribués au mauvais triangle ("), latex("c_1"), texte(" calculé avec "), latex(`${B_CHAPEAU}_2`), texte(")")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Loi des sinus isolée en "), latex(`\\sin ${B_CHAPEAU}`), texte(" et valeur au millième")], points: 1 },
      { sousQuestion: "b", critere: [texte("Comparaison de "), latex(`\\sin ${B_CHAPEAU}`), texte(" à 1 et conséquence sur les candidats")], points: 0.5 },
      { sousQuestion: "c", critere: [texte(r.candidats.length === 0 ? "Absence de candidat justifiée (arc trop court)" : "Candidats calculés et testés par la somme des angles")], points: 0.5 },
      { sousQuestion: "d", critere: [texte(`Nombre de triangles justifié : ${libelleNombre(r.nombreTriangles)}`)], points: 1 },
      { sousQuestion: "e", critere: [texte(r.nombreTriangles === 0 ? "Plus petite longueur de BC : la hauteur issue de C, au centième" : "Côté c de chaque triangle, au centième, avec l'unité")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs obtenues en gardant les résultats intermédiaires en mémoire, ou arrondies au dixième de degré pour les angles (écart d'au plus 1 % sur les côtés)")]],
  };
}

export const adaptateurEvaluationCasAmbigu: AdaptateurFeuilleExercices<ExerciceCasAmbigu> = {
  profilInstance: profilCasAmbigu,
  calculatriceIndispensable: true,
  titreDocument: "Cas ambigu : 0, 1 ou 2 triangles ? — Évaluation",
  nomFichierBase: "cas-ambigu-triangles",
  genererInstance: genererExerciceCasAmbigu,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeCasAmbigu,
  bareme,
  enoncePapier,
};
