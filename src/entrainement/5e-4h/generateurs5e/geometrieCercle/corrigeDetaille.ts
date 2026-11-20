import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { CalculSegmentCirculaire, ExerciceGeometrieCercle, ExerciceLentille, ExerciceSecteurBalaye } from "../../core5e/geometrieCercle.types";
import type { PhaseGeometrieCercle } from "../../moteur5e/typesGeometrieCercle";
import { construireSvgGeometrieCercle } from "../../export5e/svgGraphGeometrieCercle";
import { formatValeurPhaseLatex, phasesDuScenario, texteAideNiveau2 } from "../../ui5e/formatGeometrieCercle";
import {
  COURS_ARCS,
  COURS_GEOMETRIE_CERCLE,
  FORMULE_DEG_VERS_RAD,
  approche,
  demiCarreLatex,
  finaliserCorrige,
  fracBrute,
  jf,
  justifDemiCarre,
  lignesAireSecteurExacte,
  lignesDegresVersRadians,
  lignesDifferencePi,
  ligneSimplifierQ,
  nt,
  piQ,
  q,
  sansDoublons,
  type Q,
} from "../../ui5e/corrigeTrigonometrie1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen12 (problèmes de géométrie du cercle) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par ÉCRAN (`phasesDuScenario`) :
 * - secteur balayé : θ converti EXACTEMENT (multiple de π, cours § 1), secteurs ½r²θ exacts, aire
 *   balayée = différence exacte, puis l'arrondi ; vérification ½(r₁² − r₂²)θ ;
 * - segment circulaire / lentille : loi des cosinus (première ligne = aide de niveau 2), cos θ en
 *   fraction, θ = arccos(…) en radians ; aires ½r²θ, ½r² sin θ et ½r²(θ − sin θ) calculées avec θ
 *   NON arrondi (« ≈ » seulement sur la valeur approchée, jamais des aires arrondies soustraites).
 * « Résultat » = la réponse de l'écran (`formatValeurPhaseLatex` : arrondi demandé, valeur précise
 * entre parenthèses). Croquis de l'énoncé sous le « Ce qu'on utilise » de la première étape.
 * SANS `docx` : importé par l'adaptateur ET par `App5gen12.tsx` (étape échouée).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";
const t = texte;
const f = latex;

export function lettreGeometrieCercle(e: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): string {
  return LETTRES[phasesDuScenario(e.scenario).indexOf(phase)] ?? "a";
}

const resultatPhase = (sq: string, e: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle) => resultat(sq, [f(formatValeurPhaseLatex(e, phase))]);

const UTILISE_SECTEUR: FragmentConsigne[] = [t("Aire d'un secteur circulaire, θ en radians : "), f("A=\\dfrac{1}{2}r^2\\theta"), t(` ${COURS_ARCS}.`)];
const UTILISE_TRIANGLE: FragmentConsigne[] = [t("Aire d'un triangle à partir de deux côtés (deux rayons r) et de l'angle compris θ : "), f("A=\\dfrac{1}{2}r^2\\sin\\theta"), t(` ${COURS_GEOMETRIE_CERCLE}.`)];
const UTILISE_SEGMENT: FragmentConsigne[] = [t("Le triangle est contenu dans le secteur : segment = secteur − triangle, soit "), f("A_{segment}=\\dfrac{1}{2}r^2(\\theta-\\sin\\theta)"), t(` ${COURS_GEOMETRIE_CERCLE}.`)];

function utiliseCosinus(indice: string): FragmentConsigne[] {
  const r = indice ? `r_${indice}` : "r";
  const th = indice ? `\\theta_${indice}` : "\\theta";
  return [
    t("Loi des cosinus dans le triangle isocèle rayon–rayon–corde : "),
    f(`c^2=${r}^2+${r}^2-2${r}^2\\cos ${th}`),
    t(", d'où "),
    f(`\\cos ${th}=\\dfrac{2${r}^2-c^2}{2${r}^2}`),
    t(`, puis la touche cos⁻¹ de la calculatrice en mode radian ${COURS_GEOMETRIE_CERCLE}.`),
  ];
}

// ============================================================================
// Secteur balayé.
// ============================================================================

function etapesSecteurBalaye(e: ExerciceSecteurBalaye): EtapeCorrection[] {
  const theta: Q = q(e.thetaDeg, 180);
  const A1: Q = q(e.r1 * e.r1 * e.thetaDeg, 360);
  const A2: Q = q(e.r2 * e.r2 * e.thetaDeg, 360);
  const balayee = q(A1.n * A2.d - A2.n * A1.d, A1.d * A2.d);
  const valeurA = (x: Q) => (x.n * Math.PI) / x.d;
  return [
    { ...utilise("a", [t("Conversion des degrés en radians : "), f(FORMULE_DEG_VERS_RAD), t(` ${COURS_ARCS}.`)]), figureHtml: construireSvgGeometrieCercle(e) },
    calcul("a", [...lignesDegresVersRadians(e.thetaDeg), ligne(`\\approx ${approche(e.thetaRad, 1)}`, jf("arrondi au dixième ; on garde la valeur exacte ", { l: piQ(theta) }, " pour la suite"))]),
    resultatPhase("a", e, "conversionRad"),
    utilise("b", UTILISE_SECTEUR),
    calcul("b", [...lignesAireSecteurExacte("A_1", e.r1, theta, jf("on remplace ", { l: "r_1" }, " et θ (valeur exacte)")), ligne(`\\approx ${approche(valeurA(A1), 2)}`, "arrondi au centième")]),
    resultatPhase("b", e, "aireGrandSecteur"),
    piege("b", [t("θ doit être en radians dans "), f("\\dfrac{1}{2}r^2\\theta"), t(" : avec θ en degrés, l'aire serait environ 57 fois trop grande.")]),
    utilise("c", UTILISE_SECTEUR),
    calcul("c", [...lignesAireSecteurExacte("A_2", e.r2, theta, jf("on remplace ", { l: "r_2" }, " et θ (valeur exacte)")), ligne(`\\approx ${approche(valeurA(A2), 2)}`, "arrondi au centième")]),
    resultatPhase("c", e, "airePetitSecteur"),
    utilise("d", [t("L'aire balayée est le grand secteur moins le petit : "), f("A=A_1-A_2"), t(".")]),
    calcul("d", sansDoublons([ligne("A=A_1-A_2", "le petit secteur est retiré du grand"), ligne(`=${piQ(A1)}-${piQ(A2)}`, "aires exactes des étapes b et c"), ...lignesDifferencePi(A1, A2), ligne(`\\approx ${approche(e.aireBalayee, 2)}`, "arrondi au centième")])),
    resultatPhase("d", e, "aireBalayee"),
    verification(
      "d",
      [t("Directement : "), f("A=\\dfrac{1}{2}(r_1^2-r_2^2)\\,\\theta"), t(" :")],
      sansDoublons([
        ligne(`\\dfrac{1}{2}(r_1^2-r_2^2)\\,\\theta=\\dfrac{1}{2}\\times ${e.r1 * e.r1 - e.r2 * e.r2}\\times ${piQ(theta)}`, jf("on calcule ", { l: `${e.r1}^2-${e.r2}^2=${e.r1 * e.r1 - e.r2 * e.r2}` })),
        ligne(`=${piQ(balayee)}`, "même aire ✓"),
      ]),
    ),
    piege("d", [t("On soustrait les aires des deux secteurs, pas les rayons : "), f("\\dfrac{1}{2}(r_1-r_2)^2\\theta"), t(" est faux.")]),
  ];
}

// ============================================================================
// Segment circulaire (un cercle) — briques partagées avec la lentille.
// ============================================================================

interface NomsSegment {
  indice: string;
  phaseAngle: PhaseGeometrieCercle;
  phaseSecteur: PhaseGeometrieCercle;
  phaseTriangle: PhaseGeometrieCercle;
  phaseSegment: PhaseGeometrieCercle;
  secteur: string;
  triangle: string;
  segment: string;
}

const NOMS_SEUL: NomsSegment = { indice: "", phaseAngle: "angleTheta", phaseSecteur: "aireSecteur", phaseTriangle: "aireTriangle", phaseSegment: "aireSegment", secteur: "A_{secteur}", triangle: "A_{triangle}", segment: "A_{segment}" };
const nomsLentille = (i: 1 | 2): NomsSegment => ({
  indice: `${i}`,
  phaseAngle: i === 1 ? "angle1" : "angle2",
  phaseSecteur: i === 1 ? "secteur1" : "secteur2",
  phaseTriangle: i === 1 ? "triangle1" : "triangle2",
  phaseSegment: i === 1 ? "segmentAire1" : "segmentAire2",
  secteur: `A_{secteur,${i}}`,
  triangle: `A_{triangle,${i}}`,
  segment: `A_{segment,${i}}`,
});

/** θ écrit avec son indice (« \theta_1 ») et la justification « valeur non arrondie ». */
const nomTheta = (n: NomsSegment) => (n.indice ? `\\theta_${n.indice}` : "\\theta");
const justifNonArrondi = (n: NomsSegment, s: CalculSegmentCirculaire) => jf("avec la valeur non arrondie ", { l: `${nomTheta(n)}\\approx ${approche(s.thetaRad, 4)}` });

function etapesSegment(e: ExerciceGeometrieCercle, s: CalculSegmentCirculaire, n: NomsSegment, lettres: [string, string, string, string]): EtapeCorrection[] {
  const [la, lb, lc, ld] = lettres;
  const th = nomTheta(n);
  const deuxR2 = 2 * s.r * s.r;
  const num = deuxR2 - s.c * s.c;
  const cos = q(num, deuxR2);
  const cosLatex = fracBrute(cos.n, cos.d);
  const arg = `\\left(${cosLatex}\\right)`;
  const k = demiCarreLatex(s.r);
  const kTheta = (expr: string) => (k.startsWith("\\dfrac") ? `${k}${expr}` : `${k}\\,${expr}`);
  const lignesAngle: LigneCalcul[] = sansDoublons([
    ligne(texteAideNiveau2(e, n.phaseAngle).replace(/\s+/g, " "), `on remplace ${n.indice ? (n.indice === "1" ? "r₁" : "r₂") : "r"} et c`),
    ligne(`=\\dfrac{${deuxR2}-${s.c * s.c}}{${deuxR2}}`, "on calcule les carrés et les produits"),
    ligne(`=${fracBrute(num, deuxR2)}`, "on soustrait"),
    ...ligneSimplifierQ(num, deuxR2),
    ligne(`${th}=\\arccos${arg}`, "touche cos⁻¹, calculatrice en mode radian"),
    ligne(`\\approx ${approche(s.thetaRad, 4)}`, "valeur gardée pour la suite"),
    ligne(`\\approx ${approche(s.thetaRad, 1)}`, "arrondi au dixième"),
  ]);
  return [
    utilise(la, utiliseCosinus(n.indice)),
    calcul(la, lignesAngle),
    resultatPhase(la, e, n.phaseAngle),
    piege(la, [t(`La calculatrice doit être en mode radian : en degrés, la touche cos⁻¹ donnerait ${nt(s.thetaDeg, 1)}°, un angle en degrés inutilisable dans `), f("\\dfrac{1}{2}r^2\\theta"), t(".")]),
    utilise(lb, UTILISE_SECTEUR),
    calcul(lb, [ligne(`${n.secteur}=\\dfrac{1}{2}\\times ${s.r}^2\\times ${th}`, "θ en radians"), ligne(`=${kTheta(th)}`, justifDemiCarre(s.r)), ligne(`\\approx ${approche(s.aireSecteur, 2)}`, justifNonArrondi(n, s))]),
    resultatPhase(lb, e, n.phaseSecteur),
    ...(n.indice === "2" ? [] : [piege(lb, [t("θ doit être en radians dans "), f("\\dfrac{1}{2}r^2\\theta"), t(" : avec θ en degrés, l'aire serait environ 57 fois trop grande.")])]),
    utilise(lc, UTILISE_TRIANGLE),
    calcul(lc, [ligne(`${n.triangle}=\\dfrac{1}{2}\\times ${s.r}^2\\times\\sin ${th}`, "θ en radians"), ligne(`=${k}\\sin ${th}`, justifDemiCarre(s.r)), ligne(`\\approx ${approche(s.aireTriangle, 2)}`, justifNonArrondi(n, s))]),
    resultatPhase(lc, e, n.phaseTriangle),
    ...(n.indice === "2" ? [] : [piege(lc, [t("L'aire du triangle n'est pas "), f("\\dfrac{r\\times c}{2}"), t(" (c n'est pas la hauteur relative à un rayon) : c'est "), f("\\dfrac{1}{2}r^2\\sin\\theta"), t(".")])]),
    utilise(ld, UTILISE_SEGMENT),
    calcul(ld, [
      ligne(`${n.segment}=${n.secteur}-${n.triangle}`, "le triangle est contenu dans le secteur"),
      ligne(`=${kTheta(th)}-${k}\\sin ${th}`, `aires des étapes ${lb} et ${lc}`),
      ligne(`=${k}(${th}-\\sin ${th})`, [t("on met "), f(k), t(" en évidence")]),
      ligne(`\\approx ${approche(s.aireSegment, n.indice ? 4 : 2)}`, jf("avec ", { l: `${th}` }, " non arrondi : on ne soustrait pas des aires déjà arrondies")),
    ]),
    resultatPhase(ld, e, n.phaseSegment),
  ];
}

function etapesLentille(e: ExerciceLentille): EtapeCorrection[] {
  const s1 = e.segment1;
  const s2 = e.segment2;
  return [
    ...etapesSegment(e, s1, nomsLentille(1), ["a", "b", "c", "d"]),
    ...etapesSegment(e, s2, nomsLentille(2), ["e", "f", "g", "h"]),
    utilise("i", [t("Les centres sont de part et d'autre de la corde commune : la lentille est la réunion des deux segments, qui ne se recouvrent pas "), t(`${COURS_GEOMETRIE_CERCLE}.`)]),
    calcul("i", [
      ligne("A_{lentille}=A_{segment,1}+A_{segment,2}", "on additionne les deux segments"),
      ligne(`\\approx ${approche(s1.aireSegment, 4)}+${approche(s2.aireSegment, 4)}`, "aires des étapes d et h, non arrondies au centième"),
      ligne(`\\approx ${approche(e.aireLentille, 2)}`, "arrondi au centième"),
    ]),
    resultatPhase("i", e, "aireLentille"),
    piege("i", [t("Les deux segments sont de part et d'autre de la corde commune : on les additionne (pas de différence), chacun calculé avec son propre rayon.")]),
  ];
}

export function correctionDetailleeGeometrieCercle(e: ExerciceGeometrieCercle): EtapeCorrection[] {
  let etapes: EtapeCorrection[];
  if (e.scenario === "secteurBalaye") etapes = etapesSecteurBalaye(e);
  else if (e.scenario === "segmentCirculaire") {
    etapes = etapesSegment(e, e, NOMS_SEUL, ["a", "b", "c", "d"]);
  } else etapes = etapesLentille(e);
  if (e.scenario !== "secteurBalaye") etapes[0] = { ...etapes[0]!, figureHtml: construireSvgGeometrieCercle(e) };
  return finaliserCorrige(etapes);
}
