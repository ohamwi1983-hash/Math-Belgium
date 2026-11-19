import type { CourbeLog, ExerciceLireCourbeLogarithmique } from "../../core6e/lireCourbeLogarithmique.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  LETTRES_EXPRESSIONS,
  argumentLatex,
  baseLatex,
  consigneEcran,
  consigneGenerale,
  coordonneesLatex,
  courbesExercice,
  domaineLatex,
  entierBase,
  equationAsymptoteLatex,
  estCroissante,
  expressionLatex,
  fonctionLatex,
  listeExpressions,
  pointBase,
  pointUn,
} from "../../ui6e/formatLireCourbeLogarithmique";
import { figureLecture, figuresAssocier } from "../../ui6e/figureCourbeLogarithmique";
import { PHASES_ASSOCIER, PHASES_LECTURE } from "../../moteur6e/typesLireCourbeLogarithmique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLireCourbeLogarithmique } from "./index";
import { profilLireCourbeLogarithmique } from "./profilEvaluation";
import { correctionDetailleeLireCourbeLogarithmique } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLireCourbeLogarithmique>` de `6gen85` « Lire une
 * courbe logarithmique ». Énoncé papier : la COURBE seule (aucun point marqué, aucune coordonnée —
 * décision de l'utilisateur, comme gen8/gen10), sur un quadrillage d'une unité aux bornes entières :
 * le point d'abscisse c + 1 et celui qui donne la base tombent sur des intersections. Les étapes de
 * l'écran (asymptote, domaine, base, expression ; ou une association par courbe) passent dans le
 * corrigé. Tous les textes viennent de `ui6e/formatLireCourbeLogarithmique.ts`, la figure de
 * `ui6e/figureCourbeLogarithmique.ts` — les mêmes fonctions que l'écran.
 */

const LETTRES_ETAPES = ["a", "b", "c", "d"];

function grilleFigures(svgs: string[]): string {
  return `<div class="grille-graphes-cyclo">${svgs.join("")}</div>`;
}

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceLireCourbeLogarithmique): SectionExercice {
  if (e.variante === "lecture") {
    return {
      enteteFragments: consigneGenerale(e),
      enteteHtml: figureLecture(e, "papier"),
      questions: PHASES_LECTURE.map((phase) => ({ consigne: consigneEcran(e, phase) })),
    };
  }
  return {
    enteteFragments: [...consigneGenerale(e), texte(" "), ...listeExpressions(e)],
    enteteHtml: grilleFigures(figuresAssocier(e, "papier")),
    questions: PHASES_ASSOCIER.map((phase) => ({ consigne: consigneEcran(e, phase) })),
  };
}

function enoncePapier(e: ExerciceLireCourbeLogarithmique): EnoncePapier {
  if (e.variante === "lecture") {
    return {
      section: {
        enteteFragments: [
          texte("Le graphique ci-dessous est celui d'une fonction "),
          latex("f(x) = \\log_a(x - c) + d"),
          texte(", où la base a ("),
          latex("a > 0"),
          texte(", "),
          latex("a \\neq 1"),
          texte(") et les nombres entiers c et d sont inconnus. Détermine l'équation de son asymptote verticale, son domaine, la base a et l'expression de "),
          latex("f(x)"),
          texte("."),
        ],
        enteteHtml: figureLecture(e, "papier"),
        questions: [],
      },
    };
  }
  return {
    section: {
      enteteFragments: [
        texte("Les courbes 1 à 4 ci-dessous représentent les fonctions A à D suivantes (asymptotes verticales en pointillés) : "),
        ...listeExpressions(e),
        texte(". Associe chaque courbe à son expression, en justifiant."),
      ],
      enteteHtml: grilleFigures(figuresAssocier(e, "papier")),
      questions: [],
    },
  };
}

// ============================================================================
// Corrigés.
// ============================================================================

/** Lecture de la base au point (c + k ; d ± 1) : log_a(k) = ±1. */
function calculBaseLatex(k: CourbeLog): string {
  const n = entierBase(k.base);
  return estCroissante(k.base) ? `\\log_a(${n}) = 1 \\iff a = ${n}` : `\\log_a(${n}) = -1 \\iff a^{-1} = ${n} \\iff a = ${baseLatex(k.base)}`;
}

const correctionDetaillee = correctionDetailleeLireCourbeLogarithmique;

function construireCorrection(e: ExerciceLireCourbeLogarithmique): BlocCorrection[] {
  if (e.variante === "lecture") {
    const k = e.courbe;
    return [
      { type: "html", html: figureLecture(e, "corrige") },
      { type: "paragraphe", fragments: [texte("a) "), latex(equationAsymptoteLatex(k)), texte(" ; b) "), latex(domaineLatex(k)), texte(" ; c) "), latex(calculBaseLatex(k)), texte(" ; d) "), latex(fonctionLatex(k)), texte(".")] },
    ];
  }
  return [
    { type: "html", html: grilleFigures(figuresAssocier(e, "corrige")) },
    ...courbesExercice(e).map((k, j): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`Courbe ${j + 1} : ${LETTRES_EXPRESSIONS[e.expressionDeCourbe[j]]}, `), latex(`y = ${expressionLatex(k)}`), texte(".")] })),
  ];
}

function reponseBreve(e: ExerciceLireCourbeLogarithmique): FragmentConsigne[] {
  if (e.variante === "lecture") {
    const k = e.courbe;
    return [latex(equationAsymptoteLatex(k)), texte(" ; "), latex(domaineLatex(k)), texte(" ; "), latex(`a = ${baseLatex(k.base)}`), texte(" ; "), latex(fonctionLatex(k))];
  }
  return [texte(e.expressionDeCourbe.map((i, j) => `${j + 1} → ${LETTRES_EXPRESSIONS[i]}`).join(" ; "))];
}

/** Lettres d'étapes du corrigé (toutes les étapes, quand elles sont toutes des lectures). */
function lettresDe(etapes: { sousQuestion?: string }[]): string[] {
  return [...new Set(etapes.map((x) => x.sousQuestion).filter((l): l is string => !!l))];
}

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceLireCourbeLogarithmique): CriteresDifficulte {
  // Lire l'asymptote et le domaine (lecture) ; associer une expression à chaque courbe (lecture).
  const etapes = correctionDetaillee(e);
  return { ...etapesDuCorrige(etapes, e.variante === "lecture" ? ["a", "b"] : lettresDe(etapes)), methode: 1, piege: 1 };
}

function bareme(e: ExerciceLireCourbeLogarithmique): BaremeExercice {
  if (e.variante === "associer") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: courbesExercice(e).map((k, j) => ({
        sousQuestion: LETTRES_ETAPES[j],
        critere: [texte(`Courbe ${j + 1} associée à ${LETTRES_EXPRESSIONS[e.expressionDeCourbe[j]]}, justifiée (asymptote `), latex(equationAsymptoteLatex(k)), texte(", sens de variation, point)")],
        points: 1,
      })),
      erreursFrequentes: [
        { description: [texte("Associer une courbe décroissante à une base supérieure à 1 (ou l'inverse)")], cout: "0 pt sur la courbe concernée" },
        { description: [texte("Signe de la translation horizontale inversé : asymptote "), latex("x = -c"), texte(" au lieu de "), latex("x = c")], cout: "0 pt sur la courbe concernée" },
        { description: [texte("Association correcte sans justification")], cout: "−0,5 par courbe" },
      ],
      reponsesAcceptees: [[texte("Toute justification graphique correcte (asymptote, sens de variation, point d'abscisse c + 1, point qui donne la base)")]],
    };
  }
  const k = e.courbe;
  const { c, d } = k;
  const n = entierBase(k.base);
  const erreurs: ErreurFrequente[] = [];
  if (c !== 0) erreurs.push({ description: [texte("Signe de c inversé : "), latex(`x = ${-c}`), texte(" ou "), latex(argumentLatex(-c)), texte(" dans l'argument")], cout: "0 pt sur a), suite notée sans double pénalité" });
  erreurs.push({ description: [texte("Borne comprise dans le domaine : "), latex(`\\left[${c}\\,;+\\infty\\right[`)], cout: "0 pt sur b)" });
  if (!estCroissante(k.base)) erreurs.push({ description: [latex(`a = ${n}`), texte(" au lieu de "), latex(`a = ${baseLatex(k.base)}`), texte(" (sens de variation ignoré)")], cout: "0 pt sur c)" });
  else if (d !== 0) erreurs.push({ description: [texte("Base lue au point d'ordonnée 1 au lieu du point d'ordonnée "), latex(`d + 1 = ${d + 1}`)], cout: "0 pt sur c)" });
  else if (c !== 0) erreurs.push({ description: [texte("Base prise égale à l'abscisse du point lu, sans retrancher c")], cout: "0 pt sur c)" });
  const acceptees: FragmentConsigne[][] = [[texte("Toute écriture équivalente de l'expression")]];
  if (!estCroissante(k.base)) {
    const reste = d === 0 ? "" : d > 0 ? ` + ${d}` : ` - ${-d}`;
    acceptees.push([latex(`f(x) = -\\log_{${n}}(${argumentLatex(c)})${reste}`), texte(" ou "), latex(`f(x) = \\dfrac{\\ln(${argumentLatex(c)})}{\\ln\\left(${baseLatex(k.base)}\\right)}${reste}`)]);
  }
  if (k.base.num === 10) acceptees.push([texte("La base 10 écrite explicitement en indice (logarithme décimal)")]);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Asymptote verticale : "), latex(equationAsymptoteLatex(k))], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Domaine, borne exclue : "), latex(domaineLatex(k))], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Point "), latex(coordonneesLatex(pointBase(k))), texte(" traduit par "), latex(`\\log_a(${n}) = ${estCroissante(k.base) ? "1" : "-1"}`), texte(", d'où "), latex(`a = ${baseLatex(k.base)}`)], points: 1.5 },
      { sousQuestion: "d", critere: [texte("d lu au point "), latex(coordonneesLatex(pointUn(k))), texte(" et expression complète : "), latex(fonctionLatex(k))], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

export const adaptateurEvaluationLireCourbeLogarithmique: AdaptateurFeuilleExercices<ExerciceLireCourbeLogarithmique> = {
  profilInstance: profilLireCourbeLogarithmique,
  titreDocument: "Lire une courbe logarithmique — Évaluation",
  nomFichierBase: "lire-courbe-logarithmique",
  genererInstance: genererExerciceLireCourbeLogarithmique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
