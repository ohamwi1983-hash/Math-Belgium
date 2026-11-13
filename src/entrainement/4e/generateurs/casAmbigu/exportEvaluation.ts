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
import type { ExerciceCasAmbigu } from "../../core/casAmbigu.types";
import { resoudreSSA, type ResolutionSSA } from "../../moteur/modeleCasAmbigu";
import { A_CHAPEAU, B_CHAPEAU, consignesEcrans, donneesFragments, egalOuEnviron, questionsPapier, sinusBLatex, sinusLatex, uniteLatex, angleLatex } from "../../ui/formatCasAmbigu";
import { figureCasAmbiguSvg } from "../../ui/figureCasAmbigu";
import { nombreFrLatex } from "../../ui/nombreFr";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceCasAmbigu } from "./index";
import { profilCasAmbigu } from "./profil";

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

function etapesCandidats(e: ExerciceCasAmbigu, r: ResolutionSSA): EtapeCorrection[] {
  if (r.candidats.length === 0) {
    return [
      {
        label: "Conclusion",
        sousQuestion: "c",
        fragments: [texte("Aucun candidat à tester. Sur la figure, l'arc de cercle de centre C et de rayon a n'atteint pas la demi-droite [Ax) : a est plus court que la distance de C à cette demi-droite.")],
      },
    ];
  }
  if (r.candidats.length === 1) {
    const c = r.candidats[0]!;
    return [
      { label: "Calcul", sousQuestion: "c", fragments: [latex(`${B_CHAPEAU} = 90^\\circ`), texte(" (le seul angle de sinus 1).")] },
      { label: "Condition", sousQuestion: "c", fragments: [latex(`${A_CHAPEAU} + ${B_CHAPEAU} = ${e.angleA}^\\circ + 90^\\circ = ${nombreFrLatex(c.somme)}^\\circ < 180^\\circ`), texte(" : le candidat convient.")] },
    ];
  }
  const [c1, c2] = r.candidats as [ResolutionSSA["candidats"][number], ResolutionSSA["candidats"][number]];
  const verdict = (ok: boolean) => (ok ? " : il convient." : " : refusé, il ne reste aucune place pour le troisième angle.");
  return [
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [latex(`${B_CHAPEAU}_1 = \\sin^{-1}(${sinusLatex(r.sinB)}\\ldots) ${egalOuEnviron(c1.angleB, 1, "^\\circ")}`), texte(" et "), latex(`${B_CHAPEAU}_2 = 180^\\circ - ${B_CHAPEAU}_1 ${egalOuEnviron(c2.angleB, 1, "^\\circ")}`)],
    },
    { label: "Condition", sousQuestion: "c", fragments: [latex(`${A_CHAPEAU} + ${B_CHAPEAU}_1 ${egalOuEnviron(c1.somme, 1, "^\\circ")} < 180^\\circ`), texte(verdict(c1.valide))] },
    {
      label: "Condition",
      sousQuestion: "c",
      fragments: [latex(`${A_CHAPEAU} + ${B_CHAPEAU}_2 ${egalOuEnviron(c2.somme, 1, "^\\circ")} ${c2.valide ? "<" : "\\geq"} 180^\\circ`), texte(verdict(c2.valide))],
    },
  ];
}

function etapeNombre(e: ExerciceCasAmbigu, r: ResolutionSSA): EtapeCorrection {
  const texteFigure =
    r.nombreTriangles === 0
      ? "Aucun triangle : l'arc de centre C et de rayon a ne rencontre pas la demi-droite [Ax)."
      : r.nombreTriangles === 2
        ? "Deux triangles : l'arc de centre C et de rayon a coupe la demi-droite [Ax) en deux points, B₁ et B₂."
        : r.comparaison === "egal"
          ? "Un seul triangle, rectangle en B : l'arc de centre C et de rayon a touche la demi-droite [Ax) en un seul point."
          : "Un seul triangle : l'arc de centre C et de rayon a coupe la droite (Ax) deux fois, mais un seul point est sur la demi-droite [Ax) — l'autre, derrière A, correspond au candidat refusé.";
  return { label: "Conclusion", sousQuestion: "d", fragments: [texte(texteFigure)], figureHtml: figureCasAmbiguSvg(e, true) };
}

function etapesCotes(e: ExerciceCasAmbigu, r: ResolutionSSA): EtapeCorrection[] {
  const u = uniteLatex(e);
  if (r.nombreTriangles === 0) {
    return [
      {
        label: "Méthode",
        sousQuestion: "e",
        fragments: [texte("L'arc touche la demi-droite dès que a atteint la distance h de C à [Ax) — la hauteur issue de C, dans un triangle rectangle : "), latex(`h = b \\cdot \\sin ${A_CHAPEAU}`)],
      },
      { label: "Calcul", sousQuestion: "e", fragments: [latex(`h = ${nombreFrLatex(e.b)} \\cdot \\sin ${e.angleA}^\\circ ${egalOuEnviron(r.hauteur, 2, u)}`)] },
      {
        label: "Conclusion",
        sousQuestion: "e",
        fragments: [texte("Il faudrait "), latex(`BC \\geq ${nombreFrLatex(Math.round(r.hauteur * 100) / 100)}${u}`), texte(" ; pour BC = h, un seul triangle, rectangle en B.")],
      },
    ];
  }
  const etapes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "e", fragments: [texte("Dans chaque triangle, "), latex(`\\hat{C} = 180^\\circ - ${A_CHAPEAU} - ${B_CHAPEAU}`), texte(", puis la loi des sinus : "), latex(`c = \\dfrac{a \\cdot \\sin \\hat{C}}{\\sin ${A_CHAPEAU}}`)] },
  ];
  for (const t of r.triangles) {
    const i = r.nombreTriangles === 2 ? `_${t.rang}` : "";
    etapes.push({
      label: "Calcul",
      sousQuestion: "e",
      fragments: [
        ...(r.nombreTriangles === 2 ? [texte(`Triangle AB${t.rang === 1 ? "₁" : "₂"}C : `)] : []),
        latex(`\\hat{C}${i} = 180^\\circ - ${e.angleA}^\\circ - ${angleLatex(t.angleB)} ${egalOuEnviron(t.angleC, 1, "^\\circ")}`),
        texte(" ; "),
        latex(`c${i} = \\dfrac{${nombreFrLatex(e.a)} \\cdot \\sin ${angleLatex(t.angleC)}}{\\sin ${e.angleA}^\\circ} ${egalOuEnviron(t.c, 2, u)}`),
      ],
    });
  }
  return etapes;
}

function piege(r: ResolutionSSA): EtapeCorrection {
  if (r.nombreTriangles === 0) {
    return {
      label: "Piège",
      sousQuestion: "b",
      fragments: [texte("La calculatrice affiche une erreur pour "), latex(`\\sin^{-1}(${sinusLatex(r.sinB)}\\ldots)`), texte(" : ce n'est pas une faute de calcul, c'est la preuve qu'aucun triangle n'existe.")],
    };
  }
  if (r.comparaison === "egal") {
    return { label: "Piège", sousQuestion: "c", fragments: [texte("Avec "), latex(`\\sin ${B_CHAPEAU} = 1`), texte(", il n'y a qu'un candidat : "), latex("180^\\circ - 90^\\circ = 90^\\circ"), texte(" est le même angle, pas un second triangle.")] };
  }
  if (r.nombreTriangles === 1) {
    return {
      label: "Piège",
      sousQuestion: "c",
      fragments: [latex(`${B_CHAPEAU}_2`), texte(" a le même sinus que "), latex(`${B_CHAPEAU}_1`), texte(", mais "), latex(`${A_CHAPEAU} + ${B_CHAPEAU}_2 \\geq 180^\\circ`), texte(" : le garder sans tester la somme conduirait à un « second triangle » impossible.")],
    };
  }
  return {
    label: "Piège",
    sousQuestion: "c",
    fragments: [texte("Ne pas s'arrêter à l'angle aigu donné par la touche sin⁻¹ : son supplémentaire "), latex(`${B_CHAPEAU}_2`), texte(" a le même sinus et donne ici un second triangle.")],
  };
}

function correctionDetaillee(e: ExerciceCasAmbigu): EtapeCorrection[] {
  const r = resoudreSSA(e);
  const conclusionB: FragmentConsigne[] =
    r.comparaison === "superieur"
      ? [latex(`\\sin ${B_CHAPEAU} ${egalOuEnviron(r.sinB, 3)} > 1`), texte(" : impossible, un sinus ne dépasse jamais 1. Aucun angle "), latex(B_CHAPEAU), texte(" ne convient.")]
      : r.comparaison === "egal"
        ? [latex(`\\sin ${B_CHAPEAU} = 1`), texte(" : un seul angle candidat, "), latex(`${B_CHAPEAU} = 90^\\circ`), texte(".")]
        : [latex(`\\sin ${B_CHAPEAU} ${egalOuEnviron(r.sinB, 3)} < 1`), texte(" : deux angles candidats, "), latex(`${B_CHAPEAU}_1`), texte(" (aigu) et "), latex(`${B_CHAPEAU}_2 = 180^\\circ - ${B_CHAPEAU}_1`), texte(" (obtus), de même sinus.")];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Loi des sinus, isolée en "), latex(`\\sin ${B_CHAPEAU}`), texte(" : "), latex(`\\dfrac{a}{\\sin ${A_CHAPEAU}} = \\dfrac{b}{\\sin ${B_CHAPEAU}} \\iff \\sin ${B_CHAPEAU} = \\dfrac{b \\cdot \\sin ${A_CHAPEAU}}{a}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`${sinusBLatex(e)} ${egalOuEnviron(r.sinB, 3)}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: conclusionB },
    ...etapesCandidats(e, r),
    etapeNombre(e, r),
    ...etapesCotes(e, r),
    piege(r),
  ];
}

function construireCorrection(e: ExerciceCasAmbigu): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion" || (etape.sousQuestion === "e" && etape.label === "Calcul"))
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
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
  // Constante : une difficulté qui dépendrait de l'issue (★★ pour 0 triangle, ★★★ pour 2) la
  // trahirait sur la feuille.
  difficulte: () => 3,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
