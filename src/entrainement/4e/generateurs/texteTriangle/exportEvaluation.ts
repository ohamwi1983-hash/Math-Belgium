import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceTexteTriangle} from "../../core/texteTriangle.types";
import { arrondir, sequenceEcrans, type TypeEcran } from "../../moteur/modeleTexteTriangle";
import { consigneEcran, degres, loiAttendue, n, nomLoi, nomsDeuxPositions, uniteLatex } from "../../ui/formatTexteTriangle";
import { construireFigureTexteTriangle, PALETTE_PAPIER } from "../../ui/figureTexteTriangle";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTexteTriangle } from "./index";
import { profilTexteTriangle } from "./profil";
import { correctionDetailleeTexteTriangle } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen77 (« Du texte au triangle »). Énoncé papier =
 * le texte de la situation, la figure (inconnue en « ? ») et la question finale (arrondi compris) ;
 * les cinq écrans (identifier, convertir, loi, calcul, réponse) deviennent les étapes a à e du
 * corrigé, la figure RÉSOLUE sous la conclusion (`figureHtml`). « Deux positions possibles » garde
 * deux VRAIES questions : a) les deux distances possibles, b) la position retenue grâce à
 * l'information de l'énoncé. Calculatrice indispensable ; séries équilibrées : `profil.ts`.
 */

function figure(e: ExerciceTexteTriangle, resolue: boolean): string {
  return construireFigureTexteTriangle(e, { palette: PALETTE_PAPIER, resolue }).replace(
    "<svg ",
    '<svg style="display:block;margin:8px auto 12px;width:300px;max-width:100%;height:auto;border:1px solid #e6e6f0;border-radius:8px" ',
  );
}

/** Consigne d'écran sans la mention de tolérance (titre d'étape du corrigé papier). */
function sansTolerance(fragments: FragmentConsigne[]): FragmentConsigne[] {
  return fragments.map((f) => (f.type === "texte" ? { ...f, valeur: f.valeur.replace(/ \(une valeur approchée est acceptée, à environ 1 % près\)/, "").replace(/, en degrés \./, ", en degrés.") } : f));
}

function consignePapierEcran(e: ExerciceTexteTriangle, type: TypeEcran): FragmentConsigne[] {
  switch (type) {
    case "identifier":
      return [texte(`Dans le triangle ${e.triangle}, repère les données, les angles à déduire du texte et l'inconnue.`)];
    case "repondre":
      return [texte("Rédige la réponse avec l'unité et l'arrondi demandés.")];
    case "trancher":
      return [texte("Retiens la bonne position grâce à l'information de l'énoncé.")];
    default:
      return sansTolerance(consigneEcran(e, type));
  }
}

function construireEnonce(e: ExerciceTexteTriangle): SectionExercice {
  return {
    enteteFragments: [texte(`${e.contexte} ${e.question}`)],
    enteteHtml: figure(e, false),
    questions: sequenceEcrans(e).map((type) => ({ consigne: consignePapierEcran(e, type) })),
  };
}

function enoncePapier(e: ExerciceTexteTriangle): EnoncePapier {
  if (e.variante !== "deuxPositions") {
    return { section: { enteteFragments: [texte(`${e.contexte} ${e.question}`)], enteteHtml: figure(e, false), questions: [] } };
  }
  const N = nomsDeuxPositions(e);
  return {
    section: {
      enteteFragments: [texte(e.contexte)],
      enteteHtml: figure(e, false),
      questions: [
        { consigne: [texte("Calcule les deux distances possibles "), latex(N.PB), texte(`, ${e.precision.texte}.`)] },
        { consigne: [texte("Grâce à l'information supplémentaire de l'énoncé, détermine la distance "), latex(N.PB), texte(" réelle. Justifie.")] },
      ],
    },
    etapesParQuestion: [
      ["a", "b", "c", "d"],
      ["e"],
    ],
    reponseBreve: [
      texte("a) "),
      latex(`${N.PB1} \\approx ${nFixe(e.distances[0], 1)}\\text{ km}`),
      texte(" et "),
      latex(`${N.PB2} \\approx ${nFixe(e.distances[1], 1)}\\text{ km}`),
      texte(" ; b) "),
      latex(`${N.PB} \\approx ${nFixe(e.distances[e.retenue], 1)}\\text{ km}`),
    ],
  };
}

/** Nombre LaTeX arrondi à la précision demandée, avec ses décimales (« 23{,}0 »). */
function nFixe(v: number, decimales: number): string {
  if (decimales <= 0) return String(arrondir(v, decimales));
  return arrondir(v, decimales).toFixed(decimales).replace(".", "{,}");
}

function reponseBreve(e: ExerciceTexteTriangle): FragmentConsigne[] {
  if (e.variante === "deuxPositions") return [latex(`${nomsDeuxPositions(e).PB} \\approx ${nFixe(e.distances[e.retenue], 1)}\\text{ km}`)];
  return [latex(`${e.inconnue.latex} \\approx ${nFixe(e.inconnue.valeur, e.precision.decimales)}${uniteLatex(e.unite)}`)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function construireCorrection(e: ExerciceTexteTriangle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: [texte(e.options.find((o) => o.correcte)!.texte)] }];
}

function listeLatex(liste: string[]): FragmentConsigne[] {
  return liste.flatMap((l, i) => [...(i > 0 ? [texte(i === liste.length - 1 ? " et " : ", ")] : []), latex(l)]);
}

function bareme(e: ExerciceTexteTriangle): BaremeExercice {
  if (e.variante === "deuxPositions") {
    const N = nomsDeuxPositions(e);
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Configuration reconnue : deux côtés et un angle non compris (cas ambigu)")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Loi des sinus appliquée à l'angle "), latex(N.angleB)], points: 0.5 },
        { sousQuestion: "c", critere: [texte("Les deux angles candidats, dont le supplémentaire")], points: 1 },
        { sousQuestion: "d", critere: [texte("Les deux distances "), latex(`${N.PB1} \\approx ${n(e.distances[0], 1)}`), texte(" et "), latex(`${N.PB2} \\approx ${n(e.distances[1], 1)}`)], points: 1.5 },
        { sousQuestion: "e", critere: [texte("Position retenue, justifiée par l'information de l'énoncé")], points: 0.5 },
      ],
      erreursFrequentes: [
        { description: [texte("Une seule position (supplémentaire oublié)")], cout: "0 pt à l'étape 3, moitié des points à l'étape 4" },
        { description: [texte("Calculatrice en radians")], cout: "−1" },
        { description: [texte("Choix de la position non justifié")], cout: "0 pt à l'étape 5" },
      ],
      reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Données, angle(s) à convertir et inconnue repérés dans le triangle")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Angle(s) intérieur(s) : "), ...listeLatex(e.conversions.map((c) => `${c.latex} = ${degres(c.valeur)}`))], points: 1 },
      { sousQuestion: "c", critere: [texte(`Loi adaptée : ${nomLoi(loiAttendue(e))}`)], points: 0.5 },
      { sousQuestion: "d", critere: [texte("Calcul : "), latex(`${e.inconnue.latex} \\approx ${n(e.inconnue.valeur)}${uniteLatex(e.unite)}`)], points: 1.5 },
      { sousQuestion: "e", critere: [texte(`Réponse rédigée avec l'unité, ${e.precision.texte}`)], points: 0.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Angle du texte utilisé sans conversion (cap, élévation ou dépression pris pour un angle du triangle)")], cout: "0 pt à l'étape 2 ; calcul compté si la méthode est juste" },
      { description: [texte("Calculatrice en radians")], cout: "−1" },
      { description: [texte("Unité absente ou arrondi non respecté")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Écart d'environ 1 % dû aux arrondis intermédiaires")], [texte("Résultat juste à partir d'un angle faux : points de calcul accordés (pas de double sanction)")]],
  };
}

/** Niveau : méthode 2 (l'élève construit le triangle à partir du texte et traduit les angles) ;
 * piège seulement dans les données — « deux positions » (cas ambigu : deux triangles) ; écrans de
 * lecture : a (repérer données / inconnue dans le texte) et e (réponse arrondie, ou position
 * retenue par comparaison au seuil de l'énoncé) ; calculatrice. */
function criteresDifficulte(e: ExerciceTexteTriangle): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTexteTriangle(e), ["a", "e"]), methode: 2, piege: e.variante === "deuxPositions" ? 1 : 0, nombres: 1 };
}

export const adaptateurEvaluationTexteTriangle: AdaptateurFeuilleExercices<ExerciceTexteTriangle> = {
  titreDocument: "Du texte au triangle : problèmes en contexte — Évaluation",
  nomFichierBase: "texte-triangle-contexte",
  genererInstance: genererExerciceTexteTriangle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTexteTriangle,
  bareme,
  enoncePapier,
  profilInstance: profilTexteTriangle,
  calculatriceIndispensable: true,
};
