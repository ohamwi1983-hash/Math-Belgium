import { chaineLinearisation, coordX, coordY, defContexte, inverseY } from "../../core6e/linearisationDonnees";
import type { ExerciceLinearisation, ModeleDonnees } from "../../core6e/linearisationDonnees";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLinearisation";
import type { PhaseLinearisation } from "../../moteur6e/typesLinearisation";
import { OPTIONS_CHOIX, unitePrevision } from "../../moteur6e/verificationLinearisation";
import {
  approxLatex,
  consigneEcran,
  consigneGenerale,
  consignePrevision,
  droiteLatex,
  formatReponseAttenduePhaseLatex,
  formulePenteLatex,
  grandeurXLatex,
  grandeurYLatex,
  modeleLatex,
  modeleNumeriqueLatex,
  nombreLatex,
  nomPrevisionLatex,
  precisionTexte,
  previsionLatex,
  reponseChoix,
  retourModeleLatex,
  substitutionDroiteLatex,
  substitutionOrdonneeLatex,
  substitutionPenteLatex,
  substitutionPrevisionLatex,
  tableauHtml,
  uniteLatex,
  varX,
} from "../../ui6e/formatLinearisation";
import { figureCorrigeSvg } from "../../ui6e/figureLinearisation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./index";
import type { IdVarianteLinearisation } from "./index";
import { profilLinearisation } from "./profilEvaluation";

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

function lettre(e: ExerciceLinearisation, phase: PhaseLinearisation): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

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

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Pente entre deux lignes du tableau dans une représentation donnée. */
function penteEntre(e: ExerciceLinearisation, modele: ModeleDonnees, a: number, b: number): number {
  return (coordY(modele, e.ys[b]) - coordY(modele, e.ys[a])) / (coordX(modele, e.xs[b]) - coordX(modele, e.xs[a]));
}

function nomRepresentation(m: ModeleDonnees): string {
  return m === "affine" ? "Sans transformation" : m === "exponentiel" ? "Semi-log" : "Log-log";
}

function lignesChoix(e: ExerciceLinearisation): EtapeCorrection[] {
  const n = e.xs.length;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("Dans la représentation qui aligne les points, la pente entre deux points voisins est la même partout. On la compare au début et à la fin du tableau, dans les trois représentations.")] },
    ...OPTIONS_CHOIX.map((m) => {
      const p1 = penteEntre(e, m, 0, 1);
      const p2 = penteEntre(e, m, n - 2, n - 1);
      return {
        label: "Calcul",
        sousQuestion: "a",
        fragments: [
          t(`${nomRepresentation(m)} (`),
          f(grandeurYLatex(e, m)),
          t(" en fonction de "),
          f(grandeurXLatex(e, m)),
          t(") : pentes "),
          f(`${approxLatex(p1, 3)}`.replace(/^=/, "")),
          t(" puis "),
          f(`${approxLatex(p2, 3)}`.replace(/^=/, "")),
          t(m === e.modele ? " : (presque) égales, points alignés." : " : différentes."),
        ],
      };
    }),
    { label: "Conclusion", sousQuestion: "a", fragments: reponseChoix(e) },
    { label: "Piège", sousQuestion: "a", fragments: [t("Conclure sur l'allure des mesures (« elles augmentent de plus en plus vite ») : une croissance accélérée peut être exponentielle ou puissance ; seul le test d'alignement tranche.")] },
  ];
}

function lignesLogs(e: ExerciceLinearisation): EtapeCorrection[] {
  const l = lettre(e, "logs");
  const methode =
    e.modele === "exponentiel"
      ? [t("Représentation semi-logarithmique : on garde "), f(varX(e)), t(" en abscisse et on remplace chaque mesure par son logarithme népérien.")]
      : [t("Représentation log-log : on remplace l'abscisse ET la mesure par leur logarithme népérien.")];
  return [
    { label: "Méthode", sousQuestion: l, fragments: methode },
    { label: "Calcul", sousQuestion: l, fragments: reponseEtape(e, "logs") },
    { label: "Piège", sousQuestion: l, fragments: [t("Calculer avec le logarithme décimal log : la droite reste une droite, mais on ne pourrait plus revenir au modèle avec l'exponentielle de base e.")] },
  ];
}

function lignesDroite(e: ExerciceLinearisation): EtapeCorrection[] {
  const c = chaineLinearisation(e);
  const lp = lettre(e, "pente");
  const lo = lettre(e, "ordonnee");
  return [
    { label: "Méthode", sousQuestion: lp, fragments: [t("Pente de la droite "), f(droiteLatex(e)), t(" passant par les deux points désignés : "), f("m=\\dfrac{Y_2-Y_1}{X_2-X_1}"), t(".")] },
    { label: "Calcul", sousQuestion: lp, fragments: [f(formulePenteLatex(e))] },
    { label: "Calcul", sousQuestion: lp, fragments: [f(`${substitutionPenteLatex(e)}${approxLatex(c.m)}`)] },
    { label: "Piège", sousQuestion: lp, fragments: [t("Inverser le quotient (écart des abscisses sur écart des ordonnées) ou calculer la pente sur les mesures brutes au lieu des valeurs transformées.")] },
    { label: "Méthode", sousQuestion: lo, fragments: [t("Un point de la droite vérifie son équation : "), f("p=Y-m\\,X"), t(".")] },
    { label: "Calcul", sousQuestion: lo, fragments: [f(`${substitutionOrdonneeLatex(e)}${approxLatex(c.p)}`)] },
    { label: "Conclusion", sousQuestion: lo, fragments: [f(`${grandeurYLatex(e)}\\approx ${nombreLatex(c.m, 3)}\\,${grandeurXLatex(e)}+${nombreLatex(c.p, 3).startsWith("-") ? `(${nombreLatex(c.p, 3)})` : nombreLatex(c.p, 3)}`)], figureHtml: figureCorrigeSvg(e) },
  ];
}

function lignesModele(e: ExerciceLinearisation): EtapeCorrection[] {
  const c = chaineLinearisation(e);
  const l = lettre(e, "modele");
  const calculPar = e.modele === "exponentiel" ? `a=e^{m}\\approx e^{${nombreLatex(c.m, 3)}}${approxLatex(c.parametre)}` : `n=m${approxLatex(c.parametre)}`;
  return [
    { label: "Méthode", sousQuestion: l, fragments: [f(retourModeleLatex(e))] },
    { label: "Calcul", sousQuestion: l, fragments: [t("Par identification : "), f(`k=e^{p}\\approx e^{${nombreLatex(c.p, 3)}}${approxLatex(c.k, c.decimalesK)}`), t(" et "), f(calculPar), t(".")] },
    { label: "Conclusion", sousQuestion: l, fragments: [f(modeleNumeriqueLatex(e))] },
    {
      label: "Piège",
      sousQuestion: l,
      fragments:
        e.modele === "exponentiel"
          ? [t("Prendre "), f("k=p"), t(" ou "), f("a=m"), t(" : ce sont leurs LOGARITHMES qui valent p et m.")]
          : [t("Prendre "), f("k=p"), t(" (c'est "), f("\\ln(k)"), t(" qui vaut p) ou calculer "), f("n=e^{m}"), t(" : en log-log, l'exposant est la pente elle-même.")],
    },
  ];
}

function lignesPrevision(e: ExerciceLinearisation): EtapeCorrection[] {
  const c = chaineLinearisation(e);
  const l = lettre(e, "prevision");
  const def = defContexte(e.contexte);
  const unite = uniteLatex(unitePrevision(e));
  const lignes: EtapeCorrection[] = [];
  if (e.variante === "choisir") {
    const Y = c.p + c.m * coordX(e.modele, e.cible);
    lignes.push({ label: "Calcul", sousQuestion: l, fragments: [f(`${substitutionDroiteLatex(e)}${approxLatex(Y)}`)] });
    if (e.modele !== "affine") lignes.push({ label: "Calcul", sousQuestion: l, fragments: [t("On revient à la mesure avec l'exponentielle : "), f(`y\\approx e^{${nombreLatex(Y, 3)}}${approxLatex(inverseY(e.modele, Y), c.decimalesPrevision)}`), t(".")] });
  } else if (e.typePrevision === "valeur") {
    const yv = `${substitutionPrevisionLatex(e)}${approxLatex(c.yPrevision, c.decimalesPrevision + (e.ambiante > 0 ? 1 : 0))}`;
    lignes.push({ label: "Calcul", sousQuestion: l, fragments: [f(yv)] });
    if (e.ambiante > 0) lignes.push({ label: "Calcul", sousQuestion: l, fragments: [t("Le modèle donne l'écart à la pièce ; la température vaut : "), f(`T=${e.ambiante}+\\theta${approxLatex(c.prevision, c.decimalesPrevision)}`), t(".")] });
  } else {
    if (e.ambiante > 0) lignes.push({ label: "Méthode", sousQuestion: l, fragments: [t("Le modèle donne l'écart à la pièce : la température visée correspond à "), f(`\\theta=${nombreLatex(e.cible)}-${e.ambiante}=${nombreLatex(c.yPrevision)}`), t(".")] });
    lignes.push({ label: "Calcul", sousQuestion: l, fragments: [f(`${substitutionPrevisionLatex(e)}${approxLatex(c.prevision, c.decimalesPrevision)}`)] });
  }
  lignes.push({ label: "Conclusion", sousQuestion: l, fragments: [f(`${nomPrevisionLatex(e)}${approxLatex(c.prevision, c.decimalesPrevision)}\\,${unite}`), t(" (arrondi " + precisionTexte(c.decimalesPrevision) + ").")] });
  lignes.push({
    label: "Piège",
    sousQuestion: l,
    fragments:
      e.ambiante > 0
        ? [t("Confondre l'écart "), f(def.varY), t(" et la température : le modèle décrit l'écart à la pièce, il faut ajouter (ou retirer) les " + e.ambiante + " °C.")]
        : [t("Arrondir trop tôt : une extrapolation amplifie les erreurs d'arrondi ; garder " + (e.variante === "choisir" ? "m et p" : e.modele === "exponentiel" ? "k et a" : "k et n") + " avec la précision demandée (ou les valeurs de la calculatrice).")],
  });
  return lignes;
}

function correctionDetaillee(e: ExerciceLinearisation): EtapeCorrection[] {
  if (e.variante === "choisir") return [...lignesChoix(e), ...lignesDroite(e), ...lignesPrevision(e)];
  return [...lignesLogs(e), ...lignesDroite(e), ...lignesModele(e), ...lignesPrevision(e)];
}

function difficulte(e: ExerciceLinearisation): 1 | 2 | 3 {
  return e.variante === "semilog" ? 2 : 3;
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilLinearisation,
  calculatriceIndispensable: true,
};
