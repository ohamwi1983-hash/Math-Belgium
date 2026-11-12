import type { AffixeEntiere, ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransfoD, ExerciceTransformationsPlan } from "../../core6e/transformationsPlan.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { affixeLatex, aideNiveau1, aideNiveau2, blocDonneesA, blocDonneesB, blocDonneesC, etatActuelA, formuleD, formatReponseAttenduePhaseLatex, nomPoint } from "../../ui6e/formatTransformationsPlan";
import { phasesPourExercice } from "../../moteur6e/typesTransformationsPlan";
import type { PhaseTransformationsPlan } from "../../moteur6e/typesTransformationsPlan";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTransformationsPlan } from "./index";
import type { IdVarianteTransformationsPlan } from "./index";
import { profilTransformationsPlan } from "../profilsEvaluationComplexes40-42";
import { COULEURS, planComplexeSvg } from "../figuresPlanComplexe40-42";
import type { PointPlan, SegmentPlan } from "../figuresPlanComplexe40-42";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTransformationsPlan>` pour `6gen40` (Transformations
 * du plan via les nombres complexes) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran du générateur (titres « Étape n — … » du corrigé),
 *   reformulées pour le papier (plus de QCM « parmi les formules proposées », plus de « confirmée »).
 * - `enoncePapier` :
 *   - A : la transformation est DONNÉE en toutes lettres (« … par la rotation de centre O et d'angle
 *     θ ») : une seule demande, l'image de P ; la formule complexe est l'étape 1 du corrigé ;
 *   - B : deux vraies questions — a) le point construit (et sa place dans le plan), b) les éléments
 *     de la transformation qui envoie A sur ce point ;
 *   - C : a) la rotation de centre O qui envoie A sur B (existence et angle), b) les images des
 *     autres points ;
 *   - D : « détermine la nature et les éléments caractéristiques » (une seule demande : la nature
 *     n'est jamais annoncée).
 * - Figures du corrigé (`figureHtml`) : les points et leurs images, le centre, le vecteur de
 *   translation (`figuresPlanComplexe40-42.ts`) — jamais dans l'énoncé (elles montrent la réponse).
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

const coord = (z: AffixeEntiere): [number, number] => [z.a, z.b];

/** e^{iθ} pour un angle d'axe (π/2, π, −π/2) : i, −1 ou −i — même calcul que `appliquerRotationAxe`. */
function expIThetaLatex(angle: { numerique: number }): string {
  return affixeLatex({ a: Math.round(Math.cos(angle.numerique)), b: Math.round(Math.sin(angle.numerique)) });
}

function expITheta(angleLatex: string): string {
  return `e^{${angleLatex.startsWith("-") ? `-i${angleLatex.slice(1)}` : `i${angleLatex}`}}`;
}

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function descriptionA(e: ExerciceTransfoA): FragmentConsigne[] {
  const p = e.parametres;
  const lignes = blocDonneesA(e);
  switch (p.sousType) {
    case "translation":
      return [t("par la translation de vecteur d'affixe "), f(lignes[1])];
    case "homothetie":
      return [t("par l'homothétie de centre O et de rapport "), f(lignes[1])];
    case "rotation":
      return [t("par la rotation de centre O et d'angle "), f(lignes[1])];
    case "similitude":
      return [t("par la similitude de centre O, de rapport "), f(lignes[1]), t(" et d'angle "), f(lignes[2]), t(" (rotation puis homothétie)")];
    case "rotationTranslation":
      return [t("par la rotation de centre O et d'angle "), f(lignes[1]), t(", suivie de la translation de vecteur d'affixe "), f(lignes[2])];
  }
}

function entetePapier(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [t("Le point P a pour affixe "), f(blocDonneesA(e)[0]), t(". Calcule l'affixe de son image P′ "), ...descriptionA(e), t(".")];
    case "B": {
      const [zA, zB] = blocDonneesB(e);
      return [t("Les points A et B ont pour affixes "), f(zA), t(" et "), f(zB), t(".")];
    }
    case "C": {
      const lignes = blocDonneesC(e);
      const autres = lignes.slice(2);
      return [
        t("Les points A et B ont pour affixes "),
        f(lignes[0]),
        t(" et "),
        f(lignes[1]),
        t(`. On donne aussi les points ${e.autresPoints.map((_, i) => nomPoint(i)).join(", ").replace(/, ([^,]*)$/, " et $1")} : `),
        ...autres.flatMap((l, i) => (i === 0 ? [f(l)] : [t(i === autres.length - 1 ? " et " : ", "), f(l)])),
        t("."),
      ];
    }
    case "D":
      return [
        t("On considère la transformation du plan qui associe au point M d'affixe "),
        f("z"),
        t(" le point M′ d'affixe "),
        f(formuleD(e)),
        t(". Détermine sa nature et ses éléments caractéristiques (le vecteur pour une translation ; sinon le centre, et l'angle et/ou le rapport selon sa nature)."),
      ];
  }
}

function questionsPapier(e: ExerciceTransformationsPlan): QuestionExercice[] {
  if (e.famille === "B") {
    if (e.sousType === "somme")
      return [
        { consigne: [t("Calcule l'affixe du point M tel que "), f("z_M=z_A+z_B"), t(", puis place les points A, B et M dans le plan complexe.")] },
        { consigne: [t("Le point M est l'image du point A par une translation. Donne l'affixe du vecteur de cette translation.")] },
      ];
    return [
      { consigne: [t("Calcule l'affixe du point P tel que "), f("z_P=z_A\\cdot z_B"), t(", puis place les points A, B et P dans le plan complexe.")] },
      { consigne: [t("Le point P est l'image du point A par une similitude de centre O. Donne le rapport et l'angle de cette similitude.")] },
    ];
  }
  if (e.famille === "C") {
    const noms = e.autresPoints.map((_, i) => nomPoint(i)).join(", ").replace(/, ([^,]*)$/, " et $1");
    return [
      { consigne: [t("Justifie qu'il existe une rotation de centre O qui transforme A en B, et détermine son angle.")] },
      { consigne: [t(`Calcule les affixes des images des points ${noms} par cette rotation.`)] },
    ];
  }
  return [];
}

function etapesParQuestion(e: ExerciceTransformationsPlan): string[][] | undefined {
  if (e.famille === "B") return [["a"], ["b"]];
  if (e.famille === "C") return [["a", "b"], ["c"]];
  return undefined;
}

/** Titres d'étapes du corrigé — reformulation papier des consignes d'écran (`consigneEcran`). */
function titreEtape(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  switch (phase) {
    case "aEcran1":
      return [t("Écris la formule complexe de cette transformation.")];
    case "aEcran2":
      return [t("Calcule l'image de P à l'aide de cette formule.")];
    case "bEcran1":
      return e.famille === "B" && e.sousType === "produit" ? [t("Calcule "), f("z_P=z_A\\cdot z_B"), t(".")] : [t("Calcule "), f("z_M=z_A+z_B"), t(".")];
    case "bEcran2":
      return e.famille === "B" && e.sousType === "produit"
        ? [t("Donne le rapport et l'angle de la similitude de centre O qui envoie A sur P.")]
        : [t("Donne l'affixe du vecteur de la translation qui envoie A sur M.")];
    case "cEcran1":
      return [t("Calcule "), f("|z_A|"), t(" et "), f("|z_B|"), t(", et vérifie qu'ils sont égaux.")];
    case "cEcran2":
      return [t("Détermine l'angle de la rotation de centre O qui transforme A en B.")];
    case "cEcran3":
      return [t("Applique cette rotation à chacun des autres points donnés.")];
    case "dEcran1":
      return [t("Détermine la nature de cette transformation.")];
    case "dEcran2":
      return [t("Détermine ses éléments caractéristiques.")];
  }
}

function construireEnonce(e: ExerciceTransformationsPlan): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

/** Corrigé historique (pipelines Word/PDF sans corrigé détaillé) : le résultat de chaque étape. */
function construireCorrection(e: ExerciceTransformationsPlan): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function phaseFinale(e: ExerciceTransformationsPlan): PhaseTransformationsPlan {
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

/** Réponse finale d'une famille sans sous-question papier (A, D). */
function reponseFinaleSimple(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  if (e.famille === "D") return [...reponse(e, "dEcran1"), t(" : "), ...reponse(e, "dEcran2")];
  return reponse(e, phaseFinale(e));
}

function enoncePapier(e: ExerciceTransformationsPlan): EnoncePapier {
  const questions = questionsPapier(e);
  if (questions.length === 0) return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseFinaleSimple(e) };
  const phases = phasesPourExercice(e);
  const groupes = etapesParQuestion(e) ?? [];
  const reponsesQuestions = groupes.map((lettres, q) => [t(`${q === 0 ? "" : " ; "}${LETTRES[q]}) `), ...reponse(e, phases[LETTRES.indexOf(lettres[lettres.length - 1])])]);
  return { section: { enteteFragments: entetePapier(e), questions }, etapesParQuestion: groupes, reponseBreve: reponsesQuestions.flat() };
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

function figureA(e: ExerciceTransfoA): string {
  const p = e.parametres;
  const P = coord(e.zP);
  const Pp = coord(e.image);
  const points: PointPlan[] = [
    { x: P[0], y: P[1], etiquette: "P", couleur: COULEURS.encre },
    { x: Pp[0], y: Pp[1], etiquette: "P′", couleur: COULEURS.accent },
  ];
  const segments: SegmentPlan[] = [];
  if (p.sousType === "translation") segments.push({ de: P, a: Pp, fleche: true, couleur: COULEURS.accent });
  else if (p.sousType === "rotationTranslation") {
    const R: [number, number] = [Pp[0] - p.zV.a, Pp[1] - p.zV.b];
    points.push({ x: R[0], y: R[1], etiquette: "R", couleur: COULEURS.ciel });
    segments.push({ de: [0, 0], a: P, pointilles: true, couleur: COULEURS.doux }, { de: [0, 0], a: R, pointilles: true, couleur: COULEURS.ciel }, { de: R, a: Pp, fleche: true, couleur: COULEURS.accent });
  } else segments.push({ de: [0, 0], a: P, pointilles: true, couleur: COULEURS.doux }, { de: [0, 0], a: Pp, pointilles: true, couleur: COULEURS.accent });
  return planComplexeSvg({ points, segments, libelle: "Le point P et son image P′" });
}

function figureB(e: ExerciceTransfoB): string {
  const A = coord(e.zA);
  const B = coord(e.zB);
  const R = coord(e.zResultat);
  const nom = e.sousType === "somme" ? "M" : "P";
  const points: PointPlan[] = [
    { x: A[0], y: A[1], etiquette: "A", couleur: COULEURS.encre },
    { x: B[0], y: B[1], etiquette: "B", couleur: COULEURS.ciel },
    { x: R[0], y: R[1], etiquette: nom, couleur: COULEURS.accent },
  ];
  const segments: SegmentPlan[] =
    e.sousType === "somme"
      ? [
          { de: [0, 0], a: A, pointilles: true, couleur: COULEURS.doux },
          { de: [0, 0], a: B, pointilles: true, couleur: COULEURS.doux },
          { de: B, a: R, pointilles: true, couleur: COULEURS.doux },
          { de: A, a: R, fleche: true, couleur: COULEURS.accent },
        ]
      : [
          { de: [0, 0], a: A, pointilles: true, couleur: COULEURS.doux },
          { de: [0, 0], a: R, pointilles: true, couleur: COULEURS.accent },
        ];
  return planComplexeSvg({ points, segments, libelle: `Les points A, B et ${nom}` });
}

function figureC(e: ExerciceTransfoC): string {
  const points: PointPlan[] = [
    { x: e.zA.a, y: e.zA.b, etiquette: "A", couleur: COULEURS.encre },
    { x: e.zB.a, y: e.zB.b, etiquette: "B", couleur: COULEURS.accent },
  ];
  const segments: SegmentPlan[] = [
    { de: [0, 0], a: coord(e.zA), pointilles: true, couleur: COULEURS.doux },
    { de: [0, 0], a: coord(e.zB), pointilles: true, couleur: COULEURS.accent },
  ];
  e.autresPoints.forEach((pt, i) => {
    const img = e.imagesAutresPoints[i];
    points.push({ x: pt.a, y: pt.b, etiquette: nomPoint(i), couleur: COULEURS.encre }, { x: img.a, y: img.b, etiquette: `${nomPoint(i)}′`, couleur: COULEURS.accent });
    segments.push({ de: [0, 0], a: coord(pt), pointilles: true, couleur: COULEURS.pale }, { de: [0, 0], a: coord(img), pointilles: true, couleur: COULEURS.pale });
  });
  return planComplexeSvg({ points, segments, cercles: [{ cx: 0, cy: 0, r: e.moduleCommun, pointilles: true, couleur: COULEURS.ciel, epaisseur: 1 }], libelle: "Points, images et rotation de centre O" });
}

/** D : l'image O′ (affixe b) de l'origine, et le centre Ω (ou le vecteur de translation). */
function figureD(e: ExerciceTransfoD): string {
  const Op = coord(e.b);
  const points: PointPlan[] = [{ x: Op[0], y: Op[1], etiquette: "O′", couleur: COULEURS.accent }];
  const segments: SegmentPlan[] = [];
  if (e.centre === null) segments.push({ de: [0, 0], a: Op, fleche: true, couleur: COULEURS.accent });
  else {
    const W = coord(e.centre);
    points.push({ x: W[0], y: W[1], etiquette: "Ω", couleur: COULEURS.bon });
    segments.push({ de: W, a: [0, 0], pointilles: true, couleur: COULEURS.doux }, { de: W, a: Op, pointilles: true, couleur: COULEURS.accent });
  }
  return planComplexeSvg({ points, segments, libelle: e.centre === null ? "Vecteur de la translation" : "Centre Ω, l'origine O et son image O′" });
}

function figure(e: ExerciceTransformationsPlan): string {
  switch (e.famille) {
    case "A":
      return figureA(e);
    case "B":
      return figureB(e);
    case "C":
      return figureC(e);
    case "D":
      return figureD(e);
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function piege(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] | null {
  if (e.famille === "A" && phase === "aEcran1") {
    switch (e.parametres.sousType) {
      case "translation":
        return [t("Écrire "), f("z_P-z_v"), t(" ou "), f("z_v-z_P"), t(" : une translation ajoute l'affixe du vecteur.")];
      case "homothetie":
        return [t("Ajouter k au lieu de multiplier par k : "), f("z_P+k"), t(" n'est pas une homothétie.")];
      case "rotation":
        return [t("Multiplier par "), f("e^{-i\\theta}"), t(" : la rotation d'angle θ tourne dans le sens trigonométrique, on multiplie par "), f("e^{i\\theta}"), t(".")];
      case "similitude":
        return [t("Mettre le rapport dans l'exposant ("), f("e^{ik\\theta}"), t(") au lieu de multiplier par k.")];
      case "rotationTranslation":
        return [t("Translater avant de tourner : "), f("(z_P+z_v)\\cdot e^{i\\theta}"), t(" applique les deux transformations dans le mauvais ordre.")];
    }
  }
  if (e.famille === "A" && phase === "aEcran2" && e.parametres.sousType !== "translation" && e.parametres.sousType !== "homothetie") return [t("Se tromper de signe en multipliant par i : "), f("i^2=-1"), t(".")];
  if (e.famille === "B" && phase === "bEcran2")
    return e.sousType === "somme"
      ? [t("Donner "), f("z_M"), t(" au lieu de l'écart "), f("z_M-z_A"), t(".")]
      : [t("Donner "), f("z_B"), t(" lui-même comme rapport : le rapport est "), f("|z_B|"), t(" et l'angle un argument de "), f("z_B"), t(".")];
  if (e.famille === "C" && phase === "cEcran2") return [t("Calculer "), f("\\arg z_A-\\arg z_B"), t(" : l'angle de la rotation qui envoie A sur B est "), f("\\arg z_B-\\arg z_A"), t(".")];
  if (e.famille === "D" && phase === "dEcran1") return [t("Confondre rotation et homothétie : "), f("|a|=1"), t(" (et "), f("a\\neq1"), t(") donne une rotation, "), f("a"), t(" réel (différent de 0 et 1) une homothétie.")];
  if (e.famille === "D" && phase === "dEcran2" && e.centre !== null) return [t("Erreur de signe sur le centre : "), f("z_\\Omega=\\dfrac{b}{1-a}"), t(", pas "), f("\\dfrac{b}{a-1}"), t(".")];
  return null;
}

/** Ligne « Calcul » propre à chaque étape — valeurs tirées des mêmes données que l'écran. */
function calcul(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] | null {
  switch (e.famille) {
    case "A": {
      if (phase !== "aEcran2") return null;
      const substituee = (etatActuelA(e, "aEcran2") ?? [""])[0].replace("\\text{ (formule confirmée)}", "");
      const p = e.parametres;
      const lignes: FragmentConsigne[] = [];
      if (p.sousType === "rotation" || p.sousType === "similitude" || p.sousType === "rotationTranslation") {
        lignes.push(t("Ici "), f(`${expITheta(p.angle.latex)}=${expIThetaLatex(p.angle)}`), t(", donc "));
      }
      lignes.push(f(`z_{P'}=${substituee.split("=").slice(1).join("=")}=${affixeLatex(e.image)}`));
      return lignes;
    }
    case "B":
      if (phase === "bEcran1") {
        const op = e.sousType === "somme" ? "+" : "\\cdot";
        const nom = e.sousType === "somme" ? "M" : "P";
        return [f(`z_{${nom}}=(${affixeLatex(e.zA)})${op}(${affixeLatex(e.zB)})=${affixeLatex(e.zResultat)}`)];
      }
      if (e.sousType === "somme") return [f(`z_M-z_A=(${affixeLatex(e.zResultat)})-(${affixeLatex(e.zA)})=${affixeLatex(e.zB)}`)];
      {
        // Rapport et angle : les valeurs de la réponse attendue (« \text{rapport : }r », « \theta=… »).
        const [rapport, angle] = formatReponseAttenduePhaseLatex(e, "bEcran2");
        return [f(`${aideNiveau2(e, phase).latex ?? ""}=${rapport.replace("\\text{rapport : }", "")}`), t(" et "), f(angle.replace("\\theta", "\\arg z_B"))];
      }
    case "C":
      if (phase === "cEcran1") {
        const r = formatReponseAttenduePhaseLatex(e, "cEcran1")[0].split("=").pop() ?? "";
        return [f(`|z_A|=\\sqrt{(${e.zA.a})^2+(${e.zA.b})^2}=${r}`), t(" et "), f(`|z_B|=\\sqrt{(${e.zB.a})^2+(${e.zB.b})^2}=${r}`)];
      }
      if (phase === "cEcran2") return [f(aideNiveau2(e, phase).latex ?? ""), t(", donc "), f(`\\theta=${e.angleB.latex}-\\left(${e.angleA.latex}\\right)\\equiv ${e.angleRotation.latex}\\pmod{2\\pi}`)];
      return [
        t("Multiplier chaque affixe par "),
        f(`${expITheta(e.angleRotation.latex)}=${expIThetaLatex(e.angleRotation)}`),
        t(" : "),
        f(e.autresPoints.map((pt, i) => `z_{${nomPoint(i)}'}=${expIThetaLatex(e.angleRotation)}\\cdot(${affixeLatex(pt)})`).join(",\\quad ")),
      ];
    case "D":
      if (phase === "dEcran1") return aideNiveau2(e, phase).latex ? [f(aideNiveau2(e, phase).latex as string)] : null;
      if (e.centre === null) return [f(`z'-z=${affixeLatex(e.b)}`), t(" pour tout point M.")];
      return [f(`${aideNiveau2(e, phase).latex ?? ""}=${affixeLatex(e.centre)}`)];
  }
}

function lignesEtape(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan, sousQuestion: string, avecFigure: boolean): EtapeCorrection[] {
  const aide1 = aideNiveau1(e, phase);
  const lignes: EtapeCorrection[] = [];
  if (aide1.texte.length > 0) lignes.push({ label: "Méthode", sousQuestion, fragments: [...aide1.texte, ...(aide1.latex ? [t(" Soit : "), f(aide1.latex)] : [])] });
  else if (phase === "aEcran2" || phase === "cEcran3") lignes.push({ label: "Méthode", sousQuestion, fragments: [t("On applique la formule de la transformation à l'affixe du point.")] });
  const c = calcul(e, phase);
  if (c) lignes.push({ label: "Calcul", sousQuestion, fragments: c });
  const conclusion = phase === "aEcran1" ? [f(`z_{P'}=${formatReponseAttenduePhaseLatex(e, phase)[0]}`)] : reponse(e, phase);
  lignes.push({ label: "Conclusion", sousQuestion, fragments: conclusion, ...(avecFigure ? { figureHtml: figure(e) } : {}) });
  const p = piege(e, phase);
  if (p) lignes.push({ label: "Piège", sousQuestion, fragments: p });
  return lignes;
}

/** Étape qui porte la figure : celle où les points construits sont connus. */
function phaseFigure(e: ExerciceTransformationsPlan): PhaseTransformationsPlan {
  return e.famille === "B" ? "bEcran1" : phaseFinale(e);
}

function correctionDetaillee(e: ExerciceTransformationsPlan): EtapeCorrection[] {
  const avecFig = phaseFigure(e);
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], phase === avecFig));
}

function difficulte(e: ExerciceTransformationsPlan): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return e.parametres.sousType === "translation" || e.parametres.sousType === "homothetie" ? 1 : 2;
    case "B":
      return 2;
    case "C":
      return 3;
    case "D":
      return e.nature === "translation" ? 1 : 3;
  }
}

function reponseBreve(e: ExerciceTransformationsPlan): FragmentConsigne[] {
  return enoncePapier(e).reponseBreve ?? reponseFinaleSimple(e);
}

const POIDS: Record<ExerciceTransformationsPlan["famille"], number[]> = { A: [1.5, 2.5], B: [2, 2], C: [1, 1.5, 1.5], D: [1.5, 2.5] };

function bareme(e: ExerciceTransformationsPlan): BaremeExercice {
  const phases = phasesPourExercice(e);
  const poids = POIDS[e.famille];
  const erreurs = phases.map((phase) => piege(e, phase)).filter((p): p is FragmentConsigne[] => !!p);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({
      sousQuestion: LETTRES[i],
      critere: phase === "aEcran1" ? [f(`z_{P'}=${formatReponseAttenduePhaseLatex(e, phase)[0]}`)] : reponse(e, phase),
      points: poids[i],
    })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [[t("Toute écriture équivalente d'un angle (à 2π près)")], [t("Affixes sous la forme a + bi, ou coordonnées (a ; b) du point")]],
  };
}

export const adaptateurEvaluationTransformationsPlan: AdaptateurFeuilleExercices<ExerciceTransformationsPlan> = {
  titreDocument: "Transformations du plan complexe — Évaluation",
  nomFichierBase: "transformations-plan",
  genererInstance: genererExerciceTransformationsPlan,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteTransformationsPlan),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilTransformationsPlan,
};
