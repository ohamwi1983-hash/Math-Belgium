import type { ExerciceIntegraleGraphique, Morceau } from "../../core6e/integraleGraphique.types";
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
import type { PhaseIntegraleGraphique } from "../../moteur6e/typesIntegraleGraphique";
import { PHASES_INTEGRALE_GRAPHIQUE } from "../../moteur6e/typesIntegraleGraphique";
import {
  abscissesAttendues,
  aireTotale,
  integraleMorceau,
  integraleTotale,
  intervallesSigne,
  signeMorceau,
  valeurAbsolue,
  valeurDonnee,
} from "../../moteur6e/verificationIntegraleGraphique";
import {
  bornes,
  bornesDonnee,
  bornesInconnue,
  bornesInversees,
  calculAireLatex,
  consigneGenerale,
  exactDansSomme,
  exactLatex,
  formatReponseAttenduePhaseLatex,
  integraleLatex,
  intervalleLatex,
  nomFigure,
  positionFigure,
} from "../../ui6e/formatIntegraleGraphique";
import { figureIntegraleGraphiqueSvg } from "../../ui6e/figureIntegraleGraphique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceIntegraleGraphique } from "./index";
import type { IdVarianteIntegraleGraphique } from "./index";
import { profilIntegraleGraphique } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceIntegraleGraphique>` de `6gen77` « L'intégrale lue
 * sur un graphique (aire signée) » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la consigne générale de l'écran, la courbe sur quadrillage (`enteteHtml`, la MÊME
 *   figure qu'à l'écran, sans aucune région coloriée) et UNE demande. Les trois écrans (découpe ou
 *   lecture, aires signées ou additivité, somme ou bornes inversées) deviennent les étapes du corrigé
 *   (lettres a, b, c).
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `moteur6e/verificationIntegraleGraphique.ts`) ; la figure coloriée (aires positives en vert,
 *   négatives en rouge, valeur de chaque morceau) en `figureHtml` ; une ligne « Piège » ciblée.
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES: Record<PhaseIntegraleGraphique, string> = { ecran1: "a", ecran2: "b", ecran3: "c" };

type Proprietes = Extract<ExerciceIntegraleGraphique, { variante: "proprietes" }>;


/** `\int_{x0}^{x1} f(x)dx = −(calcul d'aire)` pour un morceau. */
function ligneMorceau(m: Morceau): string {
  const calcul = calculAireLatex(m);
  return `${integraleLatex(m.x0, m.x1)}=${signeMorceau(m) > 0 ? calcul : `-${calcul.replace(/=([^=]*)$/, (_, v: string) => `=-${v}`)}`}`;
}

function listeLatex(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

// ============================================================================
// Énoncé.
// ============================================================================

function demande(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  if (e.variante === "calcul") return [t(" Donne la valeur exacte.")];
  if (e.variante === "aireIntegrale") return [t(" Calcule ces deux nombres (valeurs exactes).")];
  const [hi, lo] = bornesInversees(e);
  return [t(" Calcule "), f(integraleLatex(hi, lo)), t(" (valeur exacte).")];
}

function entetePapier(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  return [...consigneGenerale(e), ...demande(e)];
}

function titreEtape(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): FragmentConsigne[] {
  const { a, b } = bornes(e);
  if (e.variante === "calcul") {
    if (phase === "ecran1") return [t("Découpe "), f(intervalleLatex(a, b)), t(" à chaque sommet de la courbe et à chaque point où elle traverse l'axe des abscisses.")];
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), f("f"), t(" sur chaque morceau (aire comptée négativement sous l'axe).")];
    return [t("Déduis-en "), f(integraleLatex(a, b)), t(".")];
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran1") return [t("Repère les abscisses où "), f("f"), t(" change de signe.")];
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), f("f"), t(" sur chaque intervalle où elle garde un signe constant.")];
    return [t("Déduis-en l'intégrale "), f(integraleLatex(a, b)), t(" et l'aire de la région.")];
  }
  const [g, d] = bornesInconnue(e);
  const [hi, lo] = bornesInversees(e);
  if (phase === "ecran1") return [t("Lis "), f(integraleLatex(e.c, e.d)), t(" sur le graphique, à l'aide d'aires de figures simples.")];
  if (phase === "ecran2") return [t("Calcule "), f(integraleLatex(g, d)), t(" par additivité (relation de Chasles).")];
  return [t("Déduis-en "), f(integraleLatex(hi, lo)), t(".")];
}

function construireEnonce(e: ExerciceIntegraleGraphique): SectionExercice {
  return {
    enteteFragments: entetePapier(e),
    enteteHtml: figureIntegraleGraphiqueSvg(e, false),
    questions: PHASES_INTEGRALE_GRAPHIQUE.map((phase) => ({ consigne: titreEtape(e, phase) })),
  };
}

function construireCorrection(e: ExerciceIntegraleGraphique): BlocCorrection[] {
  return PHASES_INTEGRALE_GRAPHIQUE.map((phase) => ({ type: "paragraphe", fragments: [t(`${LETTRES[phase]}) `), ...listeLatex(formatReponseAttenduePhaseLatex(e, phase))] }));
}

function reponseBreve(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  return listeLatex(formatReponseAttenduePhaseLatex(e, "ecran3"));
}

function enoncePapier(e: ExerciceIntegraleGraphique): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureIntegraleGraphiqueSvg(e, false), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function methodeAires(morceaux: Morceau[]): FragmentConsigne[] {
  const disque = morceaux.find((m) => m.type !== "segment");
  return [
    t("Sur chaque morceau, l'intégrale vaut l'aire de la figure, comptée positivement au-dessus de l'axe et négativement en dessous. Les morceaux sont : "),
    t(morceaux.map((m) => `${nomFigure(m)} ${positionFigure(m)}`).join(", ") + "."),
    ...(disque ? [t(disque.type === "demiDisque" ? " Un demi-disque a pour aire " : " Un quart de disque a pour aire "), f(disque.type === "demiDisque" ? "\\dfrac{\\pi r^2}{2}" : "\\dfrac{\\pi r^2}{4}"), t(".")] : []),
  ];
}

function piegeDisqueOuSigne(morceaux: Morceau[]): FragmentConsigne[] {
  const disque = morceaux.find((m) => m.type !== "segment");
  if (disque) {
    return disque.type === "demiDisque"
      ? [t("Compter le demi-disque comme un disque entier ("), f(`\\pi\\times ${disque.r}^2`), t(" au lieu de "), f(`\\dfrac{\\pi\\times ${disque.r}^2}{2}`), t(").")]
      : [t("Compter le quart de disque comme un demi-disque ("), f(`\\dfrac{\\pi\\times ${disque.r}^2}{2}`), t(" au lieu de "), f(`\\dfrac{\\pi\\times ${disque.r}^2}{4}`), t(").")];
  }
  return [t("Oublier le signe moins d'un morceau situé sous l'axe : son intégrale est négative.")];
}

function lignesCalcul(e: ExerciceIntegraleGraphique): EtapeCorrection[] {
  const { a, b } = bornes(e);
  const sq = (p: PhaseIntegraleGraphique) => LETTRES[p];
  const figure = figureIntegraleGraphiqueSvg(e, true);
  const coupes = abscissesAttendues(e);
  // Traversée de l'axe EN LIGNE DROITE (deux segments dans le prolongement) : le zéro n'est pas un
  // sommet, c'est la découpe qu'on oublie.
  const zeroTraverse = e.morceaux.slice(1).some((m, i) => {
    const p = e.morceaux[i];
    return m.type === "segment" && p.type === "segment" && m.y0 === 0 && Math.abs((m.y1 - m.y0) / (m.x1 - m.x0) - (p.y1 - p.y0) / (p.x1 - p.x0)) < 1e-9;
  });
  const total = integraleTotale(e);
  const valeurs = e.morceaux.map(integraleMorceau);
  return [
    { label: "Méthode", sousQuestion: sq("ecran1"), fragments: [t("On coupe à chaque sommet de la courbe (changement de direction, début ou fin d'un arc de cercle) et là où elle traverse l'axe des abscisses : chaque morceau est une figure simple d'un seul signe.")] },
    {
      label: "Conclusion",
      sousQuestion: sq("ecran1"),
      fragments: [t("Découpes en "), ...listeLatex(coupes.map((x) => `x=${x}`)), t(", d'où "), t(`${e.morceaux.length} morceaux : `), ...listeLatex(e.morceaux.map((m) => intervalleLatex(m.x0, m.x1))), t(".")],
    },
    ...(zeroTraverse
      ? [{ label: "Piège", sousQuestion: sq("ecran1"), fragments: [t("Ne pas couper là où la courbe traverse l'axe en ligne droite (ce n'est pas un sommet) : un morceau « à cheval » sur l'axe mélange une partie positive et une partie négative.")] }]
      : []),
    { label: "Méthode", sousQuestion: sq("ecran2"), fragments: methodeAires(e.morceaux) },
    ...e.morceaux.map((m) => ({ label: "Calcul", sousQuestion: sq("ecran2"), fragments: [f(ligneMorceau(m))] })),
    { label: "Conclusion", sousQuestion: sq("ecran2"), fragments: listeLatex(formatReponseAttenduePhaseLatex(e, "ecran2")), figureHtml: figure },
    { label: "Piège", sousQuestion: sq("ecran2"), fragments: piegeDisqueOuSigne(e.morceaux) },
    { label: "Calcul", sousQuestion: sq("ecran3"), fragments: [f(`${integraleLatex(a, b)}=${valeurs.map(exactDansSomme).join("+")}=${exactLatex(total)}`)] },
    { label: "Conclusion", sousQuestion: sq("ecran3"), fragments: [f(`${integraleLatex(a, b)}=${exactLatex(total)}`), t(".")] },
    {
      label: "Piège",
      sousQuestion: sq("ecran3"),
      fragments: [t("Additionner les aires sans leur signe donne "), f(exactLatex(aireTotale(e))), t(" : c'est l'aire de la région, pas l'intégrale.")],
    },
  ];
}

function lignesAireIntegrale(e: ExerciceIntegraleGraphique): EtapeCorrection[] {
  const { a, b } = bornes(e);
  const intervalles = intervallesSigne(e);
  const zeros = abscissesAttendues(e);
  const total = integraleTotale(e);
  const aire = aireTotale(e);
  const figure = figureIntegraleGraphiqueSvg(e, true);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("La fonction change de signe là où la courbe traverse l'axe des abscisses.")] },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments: [
        t(zeros.length === 1 ? "Un changement de signe, en " : `${zeros.length} changements de signe, en `),
        ...listeLatex(zeros.map((x) => `x=${x}`)),
        t(" : "),
        ...intervalles.flatMap((i, k) => [...(k > 0 ? [t(" ; ")] : []), f(`f\\${i.signe > 0 ? "geq" : "leq"} 0`), t(" sur "), f(intervalleLatex(i.x0, i.x1))]),
        t("."),
      ],
    },
    { label: "Méthode", sousQuestion: "b", fragments: methodeAires(e.morceaux) },
    ...intervalles.map((i) => {
      if (i.morceaux.length === 1) return { label: "Calcul", sousQuestion: "b", fragments: [f(ligneMorceau(i.morceaux[0]))] };
      const aires = i.morceaux.map((m) => exactLatex(valeurAbsolue(integraleMorceau(m)))).join("+");
      const corps = i.signe > 0 ? aires : `-\\left(${aires}\\right)`;
      return { label: "Calcul", sousQuestion: "b", fragments: [f(`${integraleLatex(i.x0, i.x1)}=${corps}=${exactLatex(i.valeur)}`)] };
    }),
    { label: "Conclusion", sousQuestion: "b", fragments: listeLatex(formatReponseAttenduePhaseLatex(e, "ecran2")), figureHtml: figure },
    { label: "Piège", sousQuestion: "b", fragments: piegeDisqueOuSigne(e.morceaux) },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`${integraleLatex(a, b)}=${intervalles.map((i) => exactDansSomme(i.valeur)).join("+")}=${exactLatex(total)}`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`\\mathcal{A}=${intervalles.map((i) => `\\left|${exactLatex(i.valeur)}\\right|`).join("+")}=${exactLatex(aire)}`)] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [f(`${integraleLatex(a, b)}=${exactLatex(total)}`), t(" et l'aire vaut "), f(exactLatex(aire)), t(" u.a. : dans l'intégrale, les parties sous l'axe se retranchent ; dans l'aire, elles s'ajoutent.")],
    },
    { label: "Piège", sousQuestion: "c", fragments: [t("Donner l'intégrale comme aire (ou l'inverse) : une aire est toujours positive, on additionne les valeurs absolues des intégrales de chaque intervalle.")] },
  ];
}

function lignesProprietes(e: Proprietes): EtapeCorrection[] {
  const [g, d] = bornesInconnue(e);
  const [gd, dd] = bornesDonnee(e);
  const [hi, lo] = bornesInversees(e);
  const lu = integraleTotale(e);
  const donnee = valeurDonnee(e);
  const inconnue = { q4: 4 * e.inconnue, p4: 0 };
  const valeurs = e.morceaux.map(integraleMorceau);
  const figure = figureIntegraleGraphiqueSvg(e, true);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodeAires(e.morceaux) },
    ...e.morceaux.map((m) => ({ label: "Calcul", sousQuestion: "a", fragments: [f(ligneMorceau(m))] })),
    { label: "Conclusion", sousQuestion: "a", fragments: [f(`${integraleLatex(e.c, e.d)}=${valeurs.length > 1 ? `${valeurs.map(exactDansSomme).join("+")}=` : ""}${exactLatex(lu)}`)], figureHtml: figure },
    { label: "Méthode", sousQuestion: "b", fragments: [t("Additivité (relation de Chasles) : "), f(`${integraleLatex(gd, dd)}=${e.cote === "gauche" ? `${integraleLatex(g, d)}+${integraleLatex(e.c, e.d)}` : `${integraleLatex(e.c, e.d)}+${integraleLatex(g, d)}`}`), t(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`${integraleLatex(g, d)}=${exactLatex(donnee)}-${exactDansSomme(lu)}=${exactLatex(inconnue)}`)] },
    { label: "Piège", sousQuestion: "b", fragments: [t("Ajouter l'intégrale lue au lieu de la retrancher, ou se tromper de sous-intervalle : écris d'abord la relation de Chasles avec les bornes, puis isole l'inconnue.")] },
    { label: "Méthode", sousQuestion: "c", fragments: [t("Échanger les bornes change le signe : "), f(`${integraleLatex(hi, lo)}=-${integraleLatex(lo, hi)}`), t(".")] },
    {
      label: "Conclusion",
      sousQuestion: "c",
      fragments: [f(`${integraleLatex(hi, lo)}=${e.inconnue < 0 ? `-${exactDansSomme(inconnue)}=` : ""}${exactLatex({ q4: -inconnue.q4, p4: 0 })}`), t(".")],
    },
    { label: "Piège", sousQuestion: "c", fragments: [t("Garder le même signe : la borne du haut ("), f(`${lo}`), t(") est plus petite que celle du bas, l'intégrale change de signe.")] },
  ];
}

function correctionDetaillee(e: ExerciceIntegraleGraphique): EtapeCorrection[] {
  if (e.variante === "calcul") return lignesCalcul(e);
  if (e.variante === "aireIntegrale") return lignesAireIntegrale(e);
  return lignesProprietes(e);
}

function difficulte(e: ExerciceIntegraleGraphique): 1 | 2 | 3 {
  return e.variante === "aireIntegrale" ? 3 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function erreurDisque(e: ExerciceIntegraleGraphique): { description: FragmentConsigne[]; cout: string }[] {
  if (e.disque === "aucun") return [];
  return [{ description: [t(e.disque === "demi" ? "Demi-disque compté comme un disque entier" : "Quart de disque compté comme un demi-disque ou un disque entier")], cout: "−0,5" }];
}

function bareme(e: ExerciceIntegraleGraphique): BaremeExercice {
  const r2 = formatReponseAttenduePhaseLatex(e, "ecran2");
  const r3 = formatReponseAttenduePhaseLatex(e, "ecran3");
  const accepte = [[t("Toute écriture exacte équivalente (fraction non simplifiée, décimal exact, π factorisé)")], [t("Un autre découpage en figures simples, s'il aboutit au même résultat")]];
  if (e.variante === "calcul") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Découpage aux changements de forme et aux zéros : "), ...listeLatex(abscissesAttendues(e).map((x) => `x=${x}`))], points: 0.75 },
        { sousQuestion: "b", critere: [t("Aires des figures correctes (formules et dimensions lues)")], points: 1.25 },
        { sousQuestion: "b", critere: [t("Signes corrects (négatif sous l'axe) : "), ...listeLatex(r2)], points: 1 },
        { sousQuestion: "c", critere: [f(r3[0])], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Morceaux sous l'axe comptés positivement (aire au lieu d'intégrale)")], cout: "−1,5" },
        ...erreurDisque(e),
        { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,25" },
      ],
      reponsesAcceptees: accepte,
    };
  }
  if (e.variante === "aireIntegrale") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Changements de signe : "), ...listeLatex(abscissesAttendues(e).map((x) => `x=${x}`))], points: 0.5 },
        { sousQuestion: "b", critere: [t("Intégrales signées sur chaque intervalle : "), ...listeLatex(r2)], points: 1.5 },
        { sousQuestion: "c", critere: [f(r3[0])], points: 1 },
        { sousQuestion: "c", critere: [t("Aire : "), f(r3[1])], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Même nombre donné pour l'intégrale et l'aire")], cout: "0 pt sur l'une des deux réponses" },
        { description: [t("Aire négative (intégrale recopiée)")], cout: "−1" },
        ...erreurDisque(e),
      ],
      reponsesAcceptees: accepte,
    };
  }
  const [g, d] = bornesInconnue(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [f(formatReponseAttenduePhaseLatex(e, "ecran1")[0]), t(", par des aires signées")], points: 1.5 },
      { sousQuestion: "b", critere: [t("Relation de Chasles écrite et "), f(`${integraleLatex(g, d)}=${e.inconnue}`)], points: 1.5 },
      { sousQuestion: "c", critere: [f(r3[0]), t(" (bornes inversées)")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Signe oublié lors de l'inversion des bornes")], cout: "−1" },
      { description: [t("Intégrale lue ajoutée au lieu d'être retranchée")], cout: "0 pt sur b)" },
      { description: [t("Partie sous l'axe comptée positivement")], cout: "−0,75" },
    ],
    reponsesAcceptees: accepte,
  };
}

export const adaptateurEvaluationIntegraleGraphique: AdaptateurFeuilleExercices<ExerciceIntegraleGraphique> = {
  titreDocument: "L'intégrale lue sur un graphique — Évaluation",
  nomFichierBase: "integrale-graphique",
  genererInstance: genererExerciceIntegraleGraphique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteIntegraleGraphique),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilIntegraleGraphique,
};

