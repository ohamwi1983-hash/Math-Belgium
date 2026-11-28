import type { AffixeEntiere, ExerciceTransfoA, ExerciceTransfoB, ExerciceTransfoC, ExerciceTransfoD, ExerciceTransformationsPlan } from "../../core6e/transformationsPlan.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { aideNiveau1, formatReponseAttenduePhaseLatex, nomPoint } from "../../ui6e/formatTransformationsPlan";
import { phasesPourExercice, type PhaseTransformationsPlan } from "../../moteur6e/typesTransformationsPlan";
import { type V, addV, cv, lignesProduit, lignesQuotient, lignesRamenerAngle, mono, mulV, pn, pv, somme, subV, suite, v } from "../../ui6e/corrigeComplexes";
import { COULEURS, planComplexeSvg } from "../figuresPlanComplexe40-42";
import type { PointPlan, SegmentPlan } from "../figuresPlanComplexe40-42";

/**
 * Corrigé détaillé « comme au tableau » de `6gen40` (transformations du plan via les nombres
 * complexes) — règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au
 * tableau »). Une étape par écran ; produits par i développés (i² = −1), sommes regroupées,
 * centre Ω = b/(1 − a) par le conjugué ; figure des points construits (`figureHtml`).
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, point 7)";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const V_ = (z: AffixeEntiere): V => v(z.a, z.b);
const coord = (z: AffixeEntiere): [number, number] => [z.a, z.b];

/** e^{iθ} pour un angle d'axe (π/2, π, −π/2) : i, −1 ou −i — même calcul que `appliquerRotationAxe`. */
function expI(angle: { numerique: number }): V {
  return v(Math.round(Math.cos(angle.numerique)), Math.round(Math.sin(angle.numerique)));
}

function expITheta(angleLatex: string): string {
  return `e^{${angleLatex.startsWith("-") ? `-i${angleLatex.slice(1)}` : `i${angleLatex}`}}`;
}

function reponse(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

// ---------------------------------------------------------------------------------------------
// Figures (points construits).
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

export function figure(e: ExerciceTransformationsPlan): string {
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
// Pièges (repris dans le barème).
// ---------------------------------------------------------------------------------------------

export function piege(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan): FragmentConsigne[] | null {
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

// ---------------------------------------------------------------------------------------------
// Calculs.
// ---------------------------------------------------------------------------------------------

/** k·z (k entier, z entier) : on distribue. */
function lignesFoisReel(k: number, z: V, gauche: string): LigneCalcul[] {
  return [ligne(`${gauche}=${somme([mono(k * z.re), mono(k * z.im, "i")])}`, "on distribue")];
}

/** Image d'un point par la transformation de A, une transformation par ligne. */
function lignesImageA(e: ExerciceTransfoA): LigneCalcul[] {
  const p = e.parametres;
  const P = V_(e.zP);
  switch (p.sousType) {
    case "translation":
      return [ligne(`z_{P'}=z_P+z_v=${pv(P)}+${pv(V_(p.zV))}`, "on remplace"), ligne(`=(${P.re}+${pn(p.zV.a)})+(${P.im}+${pn(p.zV.b)})\\,i`, "on regroupe"), ligne(`=${cv(V_(e.image))}`)];
    case "homothetie":
      return [ligne(`z_{P'}=k\\,z_P=${pn(p.k)}\\cdot ${pv(P)}`, "on remplace"), ...suite(lignesFoisReel(p.k, P, "x"))];
    case "rotation": {
      const w = expI(p.angle);
      return [ligne(`z_{P'}=${expITheta(p.angle.latex)}\\,z_P=${pv(w)}\\cdot ${pv(P)}`, [f(`${expITheta(p.angle.latex)}=${cv(w)}`)]), ...suite(lignesProduit(w.re, w.im, P.re, P.im))];
    }
    case "similitude": {
      const w = expI(p.angle);
      const kw = v(p.k * w.re, p.k * w.im);
      return [
        ligne(`z_{P'}=k\\,${expITheta(p.angle.latex)}\\,z_P=${pn(p.k)}\\cdot ${pv(w)}\\cdot ${pv(P)}`, [f(`${expITheta(p.angle.latex)}=${cv(w)}`)]),
        ligne(`=${pv(kw)}\\cdot ${pv(P)}`, "on multiplie d'abord k par l'exponentielle"),
        ...suite(lignesProduit(kw.re, kw.im, P.re, P.im)),
      ];
    }
    case "rotationTranslation": {
      const w = expI(p.angle);
      const R = mulV(w, P);
      const zv = V_(p.zV);
      return [
        ligne(`z_{P'}=${expITheta(p.angle.latex)}\\,z_P+z_v=${pv(w)}\\cdot ${pv(P)}+${pv(zv)}`, [f(`${expITheta(p.angle.latex)}=${cv(w)}`)]),
        ...lignesProduit(w.re, w.im, P.re, P.im, `${pv(w)}\\cdot ${pv(P)}`),
        ligne(`z_{P'}=${pv(R)}+${pv(zv)}`, "on tourne d'abord, puis on translate"),
        ligne(`=${cv(addV(R, zv))}`, "on regroupe"),
      ];
    }
  }
}

function lignesEtape(e: ExerciceTransformationsPlan, phase: PhaseTransformationsPlan, sq: string, avecFigure: boolean): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const aide1 = aideNiveau1(e, phase);
  const methode = aide1.texte.length > 0 ? [...aide1.texte, ...(aide1.latex ? [t(" Soit : "), f(aide1.latex)] : [])] : [t("On applique la formule de la transformation à l'affixe du point.")];
  L.push(utilise(sq, [...methode, t(` ${COURS}`)]));
  const res = phase === "aEcran1" && e.famille === "A" ? [f(`z_{P'}=${formatReponseAttenduePhaseLatex(e, phase)[0]}`)] : reponse(e, phase);
  let verif: EtapeCorrection | null = null;
  switch (e.famille) {
    case "A":
      if (phase === "aEcran2") L.push(calcul(sq, lignesImageA(e)));
      break;
    case "B":
      if (phase === "bEcran1") {
        const nom = e.sousType === "somme" ? "M" : "P";
        const A = V_(e.zA);
        const B = V_(e.zB);
        L.push(
          calcul(
            sq,
            e.sousType === "somme"
              ? [ligne(`z_M=z_A+z_B=${pv(A)}+${pv(B)}`, "on remplace"), ligne(`=(${A.re}+${pn(B.re)})+(${A.im}+${pn(B.im)})\\,i`, "on regroupe"), ligne(`=${cv(V_(e.zResultat))}`)]
              : [ligne(`z_${nom}=z_A\\cdot z_B=${pv(A)}\\cdot ${pv(B)}`, "on remplace"), ...suite(lignesProduit(A.re, A.im, B.re, B.im))],
          ),
        );
      } else if (e.sousType === "somme") {
        const M = V_(e.zResultat);
        const A = V_(e.zA);
        L.push(calcul(sq, [ligne(`z_M-z_A=${pv(M)}-${pv(A)}`, "affixe du vecteur AM"), ligne(`=(${M.re}-${pn(A.re)})+(${M.im}-${pn(A.im)})\\,i`, "on regroupe"), ligne(`=${cv(subV(M, A))}`)]));
      } else {
        const [rapport] = formatReponseAttenduePhaseLatex(e, "bEcran2");
        const r = rapport.replace("\\text{rapport : }", "");
        const n2 = e.zB.a * e.zB.a + e.zB.b * e.zB.b;
        L.push(calcul(sq, [ligne(`|z_B|=\\sqrt{${pn(e.zB.a)}^2+${pn(e.zB.b)}^2}`, "rapport = module de zB"), ligne(`=\\sqrt{${n2}}${`\\sqrt{${n2}}` === r ? "" : `=${r}`}`), ligne(`\\arg z_B=${e.angleB.latex}`, "angle = argument de zB")], [], "Rapport, angle"));
      }
      break;
    case "C":
      if (phase === "cEcran1") {
        const r = formatReponseAttenduePhaseLatex(e, "cEcran1")[0].split("=").pop() ?? "";
        const m = (z: AffixeEntiere, nom: string) => [ligne(`|z_${nom}|=\\sqrt{${pn(z.a)}^2+${pn(z.b)}^2}`, "|x + yi| = √(x² + y²)"), ligne(`=\\sqrt{${z.a * z.a + z.b * z.b}}${`\\sqrt{${z.a * z.a + z.b * z.b}}` === r ? "" : `=${r}`}`)];
        L.push(calcul(sq, [...m(e.zA, "A"), ...m(e.zB, "B")]));
      } else if (phase === "cEcran2") {
        const num = e.angleB.p * e.angleA.q - e.angleA.p * e.angleB.q;
        const den = e.angleA.q * e.angleB.q;
        L.push(calcul(sq, [ligne(`\\theta=\\arg z_B-\\arg z_A=${e.angleB.latex}-\\left(${e.angleA.latex}\\right)`, "arguments de A et B"), ligne(`=${anglePiTexte(num, den)}`), ...lignesRamenerAngle(num, den)]));
      } else {
        const w = expI(e.angleRotation);
        L.push(
          calcul(
            sq,
            e.autresPoints.flatMap((pt, i) => [ligne(`z_{${nomPoint(i)}'}=${expITheta(e.angleRotation.latex)}\\cdot z_{${nomPoint(i)}}=${pv(w)}\\cdot ${pv(V_(pt))}`, i === 0 ? [f(`${expITheta(e.angleRotation.latex)}=${cv(w)}`)] : undefined), ...suite(lignesProduit(w.re, w.im, pt.a, pt.b))]),
          ),
        );
      }
      break;
    case "D": {
      const a = V_(e.a);
      if (phase === "dEcran1") {
        const mod2 = e.a.a * e.a.a + e.a.b * e.a.b;
        L.push(calcul(sq, [ligne(`a=${cv(a)}`, "coefficient de z"), ligne(`|a|^2=${pn(e.a.a)}^2+${pn(e.a.b)}^2=${mod2}`, mod2 === 1 ? "|a| = 1" : `|a| ≠ 1${e.a.b === 0 ? ", a réel" : ", a non réel"}`)]));
      } else if (e.centre === null) {
        L.push(calcul(sq, [ligne(`z'-z=(z+b)-z=${cv(V_(e.b))}`, "a = 1 : le même vecteur pour tout point")]));
      } else {
        const unMoinsA = subV(v(1), a);
        L.push(calcul(sq, [ligne(`z_\\Omega=\\dfrac{b}{1-a}=\\dfrac{${cv(V_(e.b))}}{1-${pv(a)}}`, "point fixe : Ω = aΩ + b"), ...suite(lignesQuotient(V_(e.b), unMoinsA, "z_\\Omega")).map((l, i) => (i === 0 ? { ...l, justification: "on calcule 1 − a" } : l))], [], "Centre"));
        if (e.nature !== "homothetie") L.push(calcul(sq, [ligne(`\\theta=\\arg a=${e.angle.latex}`, "angle = argument de a")], [], "Angle"));
        if (e.nature !== "rotation") L.push(calcul(sq, [ligne(`${e.nature === "homothetie" ? "k=a" : "|a|"}=${e.nature === "homothetie" ? cv(a) : `\\sqrt{${pn(e.a.a)}^2+${pn(e.a.b)}^2}`}${e.nature === "homothetie" ? "" : `=${e.rapportLatex}`}`, "rapport")], [], "Rapport"));
        const c = V_(e.centre);
        const image = addV(mulV(a, c), V_(e.b));
        verif = verification(sq, [texte("Ω est bien fixe : "), f(`a\\,z_\\Omega+b=${pv(a)}\\cdot ${pv(c)}+${pv(V_(e.b))}=${cv(image)}=z_\\Omega`), texte(" ✓")]);
      }
      break;
    }
  }
  L.push({ ...resultat(sq, res), ...(avecFigure ? { figureHtml: figure(e) } : {}) });
  if (verif) L.push(verif);
  const p = piege(e, phase);
  if (p) L.push(lignePiege(sq, p));
  return L;
}

function anglePiTexte(num: number, den: number): string {
  const g = (x: number, y: number): number => (y === 0 ? Math.abs(x) : g(y, x % y));
  const d0 = g(num, den) || 1;
  const n = num / d0;
  const d = den / d0;
  if (n === 0) return "0";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (d === 1) return a === 1 ? `${s}\\pi` : `${s}${a}\\pi`;
  return a === 1 ? `${s}\\frac{\\pi}{${d}}` : `${s}\\frac{${a}\\pi}{${d}}`;
}

/** Étape qui porte la figure : celle où les points construits sont connus. */
function phaseFigure(e: ExerciceTransformationsPlan): PhaseTransformationsPlan {
  const phases = phasesPourExercice(e);
  return e.famille === "B" ? "bEcran1" : phases[phases.length - 1];
}

export function correctionDetailleeTransformationsPlan(e: ExerciceTransformationsPlan): EtapeCorrection[] {
  const avecFig = phaseFigure(e);
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], phase === avecFig));
}
