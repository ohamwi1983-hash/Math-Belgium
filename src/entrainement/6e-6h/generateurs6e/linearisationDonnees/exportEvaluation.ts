import { chaineLinearisation } from "../../core6e/linearisationDonnees";
import type { ExerciceLinearisation } from "../../core6e/linearisationDonnees";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLinearisation";
import type { PhaseLinearisation } from "../../moteur6e/typesLinearisation";
import {
  consigneEcran,
  consigneGenerale,
  consignePrevision,
  droiteLatex,
  formatReponseAttenduePhaseLatex,
  grandeurXLatex,
  grandeurYLatex,
  modeleLatex,
  modeleNumeriqueLatex,
  nombreLatex,
  precisionTexte,
  previsionLatex,
  reponseChoix,
  tableauHtml,
  varX,
} from "../../ui6e/formatLinearisation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./index";
import type { IdVarianteLinearisation } from "./index";
import { profilLinearisation } from "./profilEvaluation";
import { correctionDetailleeLinearisation } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLinearisation>` de `6gen89` « Linéariser des
 * données : du tableau au modèle » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le contexte et l'objectif (consigne générale de l'écran), le TABLEAU des mesures
 *   (`enteteHtml`, jamais de figure : la droite est ce qu'on cherche), puis deux VRAIES questions —
 *   a) le modèle (droite par les deux lignes désignées, puis k et a ou k et n ; pour « choisir » :
 *   la représentation et la droite), b) la prévision, avec la précision demandée.
 * - Corrigé : une étape par écran (lettres a, b, c… dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran, une ligne « Piège » ciblée, le nuage transformé et la droite en
 *   `figureHtml` (étape de l'ordonnée à l'origine).
 * - Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function reponseEtape(e: ExerciceLinearisation, phase: PhaseLinearisation): FragmentConsigne[] {
  return phase === "choix" ? reponseChoix(e) : liste(formatReponseAttenduePhaseLatex(e, phase));
}

/** Abscisse d'une ligne du tableau en LaTeX : `t=4`. */
function ligneLatex(e: ExerciceLinearisation, indice: number): string {
  return `${varX(e)}=${nombreLatex(e.xs[indice])}`;
}

// ============================================================================
// Énoncés.
// ============================================================================

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceLinearisation, phase: PhaseLinearisation): FragmentConsigne[] {
  if (phase === "choix") return [t("Détermine la représentation qui aligne les points du tableau (justifie).")];
  if (phase === "prevision") return consignePrevision(e);
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceLinearisation): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: tableauHtml(e, false), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceLinearisation): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseEtape(e, phase)] }));
}

/** Question a) papier : le modèle (ou la représentation et la droite). */
function questionModele(e: ExerciceLinearisation): FragmentConsigne[] {
  const [i, j] = e.lignes;
  const c = chaineLinearisation(e);
  const lignes = [t("des lignes "), f(ligneLatex(e, i)), t(" et "), f(ligneLatex(e, j)), t(" du tableau")];
  if (e.variante === "choisir") {
    return [t("Détermine la représentation qui aligne les points (justifie), puis l'équation "), f("Y=m\\,X+p"), t(" de la droite de cette représentation qui passe par les points "), ...lignes, t(" ("), f("m"), t(" et "), f("p"), t(" arrondis au millième).")];
  }
  const parametre = e.modele === "exponentiel" ? "a" : "n";
  return [
    t("À partir "),
    ...lignes,
    t(", détermine l'équation "),
    f(droiteLatex(e)),
    t(" de la droite ("),
    f("m"),
    t(" et "),
    f("p"),
    t(" arrondis au millième), puis le modèle "),
    f(modeleLatex(e)),
    t(" ("),
    f("k"),
    t(` arrondi ${precisionTexte(c.decimalesK)}, `),
    f(parametre),
    t(" arrondi au millième)."),
  ];
}

function reponseBreve(e: ExerciceLinearisation): FragmentConsigne[] {
  const c = chaineLinearisation(e);
  const droite = `${grandeurYLatex(e)}\\approx ${nombreLatex(c.m, 3)}\\,${grandeurXLatex(e)}+${nombreLatex(c.p, 3).startsWith("-") ? `(${nombreLatex(c.p, 3)})` : nombreLatex(c.p, 3)}`;
  if (e.variante === "choisir") {
    return [t("a) "), ...reponseChoix(e), t(" ; "), f(droite), t(". b) "), f(previsionLatex(e)), t(".")];
  }
  return [t("a) "), f(droite), t(" ; "), f(modeleNumeriqueLatex(e)), t(". b) "), f(previsionLatex(e)), t(".")];
}

function enoncePapier(e: ExerciceLinearisation): EnoncePapier {
  const phases = phasesPourExercice(e);
  const lettres = phases.map((_, i) => LETTRES[i]);
  return {
    section: { enteteFragments: consigneGenerale(e), enteteHtml: tableauHtml(e, false), questions: [{ consigne: questionModele(e) }, { consigne: consignePrevision(e) }] },
    etapesParQuestion: [lettres.slice(0, -1), lettres.slice(-1)],
    reponseBreve: reponseBreve(e),
  };
}

const correctionDetaillee = correctionDetailleeLinearisation;

/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceLinearisation): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: 1, piege: e.variante === "choisir" ? 1 : 0 };
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function bareme(e: ExerciceLinearisation): BaremeExercice {
  const r = (phase: PhaseLinearisation) => reponseEtape(e, phase);
  const accepte = [[t("Écarts dus aux arrondis des étapes intermédiaires (valeurs recopiées arrondies au millième, ou valeurs de la calculatrice)")]];
  if (e.variante === "choisir") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Représentation justifiée (pentes ou alignement comparés) : "), ...r("choix")], points: 1 },
        { sousQuestion: "b", critere: r("pente"), points: 1 },
        { sousQuestion: "c", critere: r("ordonnee"), points: 0.75 },
        { sousQuestion: "d", critere: [t("Prévision avec l'unité : "), ...r("prevision")], points: 1.25 },
      ],
      erreursFrequentes: [
        { description: [t("Représentation choisie sans justification (allure des mesures seulement)")], cout: "−0,5" },
        { description: [t("Pente inversée (écart des abscisses sur écart des ordonnées)")], cout: "−0,75" },
        { description: [t("Ordonnée transformée donnée comme prévision, sans revenir à y par l'exponentielle")], cout: "−0,75" },
        { description: [t("Unité absente")], cout: "−0,25" },
      ],
      reponsesAcceptees: accepte,
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: r("logs"), points: 0.5 },
      { sousQuestion: "b", critere: r("pente"), points: 0.75 },
      { sousQuestion: "c", critere: r("ordonnee"), points: 0.75 },
      { sousQuestion: "d", critere: [t("Modèle : "), ...r("modele")], points: 1 },
      { sousQuestion: "e", critere: [t("Prévision avec l'unité : "), ...r("prevision")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Logarithme décimal au lieu du logarithme népérien")], cout: "−0,5" },
      { description: e.modele === "exponentiel" ? [f("k=p"), t(" ou "), f("a=m"), t(" (exponentielle oubliée)")] : [f("k=p"), t(" (exponentielle oubliée) ou "), f("n=e^{m}")], cout: "−0,75" },
      ...(e.ambiante > 0 ? [{ description: [t("Écart à la pièce confondu avec la température")], cout: "−0,5" }] : []),
      { description: [t("Unité absente")], cout: "−0,25" },
    ],
    reponsesAcceptees: accepte,
  };
}

export const adaptateurEvaluationLinearisationDonnees: AdaptateurFeuilleExercices<ExerciceLinearisation> = {
  titreDocument: "Linéariser des données — Évaluation",
  nomFichierBase: "lineariser-donnees",
  genererInstance: genererExerciceLinearisation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLinearisation),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilLinearisation,
  calculatriceIndispensable: true,
};
