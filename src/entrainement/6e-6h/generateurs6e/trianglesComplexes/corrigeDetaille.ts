import type { ExerciceTrianglesB, ExerciceTrianglesComplexes, Longueur, PointComplexe } from "../../core6e/trianglesComplexes.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul as ligneCalcul, latex, ligne, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { aideNiveau1, formatReponseAttenduePhaseLatex } from "../../ui6e/formatTrianglesComplexes";
import { phasesPourExercice, type PhaseTrianglesComplexes } from "../../moteur6e/typesTrianglesComplexes";
import { cq, lignesQuotient, quotientExact, suite, v } from "../../ui6e/corrigeComplexes";
import { pointEntierLatex } from "./construction";
import { COULEURS, planComplexeSvg, positionLoinDe } from "../figuresPlanComplexe40-42";
import type { Coord, PointPlan, SegmentPlan } from "../figuresPlanComplexe40-42";

/**
 * Corrigé détaillé « comme au tableau » de `6gen41` (propriétés géométriques de triangles) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Longueurs
 * MN = |z_N − z_M| écrites pas à pas, comparaisons (isocèle), réciproque de Pythagore (rectangle),
 * loi des cosinus, quotients par le conjugué ; figure du triangle après les verdicts.
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, § 8)";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).flatMap((l, i) => (i === 0 ? [f(l)] : [t(" ; "), f(l)]));
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const c = (p: PointComplexe): Coord => [p.re, p.im];

function centre(pts: Coord[]): Coord {
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
}

function pointsNommes(liste: [string, PointComplexe, string?][], g: Coord): PointPlan[] {
  return liste.map(([nom, p, couleur]) => ({ x: p.re, y: p.im, etiquette: nom, couleur: couleur ?? COULEURS.encre, position: positionLoinDe(c(p), g) }));
}

export function figure(e: ExerciceTrianglesComplexes): string {
  switch (e.famille) {
    case "A": {
      const g = centre([c(e.A), c(e.B), c(e.C)]);
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.A), c(e.B), c(e.C)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        points: pointsNommes([["A", e.A], ["B", e.B], ["C", e.C]], g),
        libelle: "Le triangle ABC",
      });
    }
    case "B": {
      const g = centre([c(e.O), c(e.A), c(e.B)]);
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.O), c(e.A), c(e.B)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        points: pointsNommes([["O", e.O], ["A", e.A], ["B", e.B]], g),
        libelle: "Le triangle OAB",
      });
    }
    case "C": {
      const g = centre([c(e.O), c(e.B), c(e.F)]);
      const segments: SegmentPlan[] = [c(e.O), c(e.B), c(e.F)].map((s) => ({ de: c(e.A), a: s, pointilles: true, couleur: COULEURS.ciel }));
      return planComplexeSvg({
        polygones: [{ sommets: [c(e.O), c(e.B), c(e.F)], couleur: COULEURS.accent, remplissage: COULEURS.accentDoux }],
        segments,
        points: [...pointsNommes([["O", e.O], ["B", e.B], ["F", e.F]], g), { x: e.A.re, y: e.A.im, etiquette: "A", couleur: COULEURS.ciel, position: "se" }],
        libelle: "Le triangle OBF et le point A",
      });
    }
    case "D": {
      const g = centre([c(e.O), c(e.A), c(e.B), c(e.C), c(e.D)]);
      return planComplexeSvg({
        polygones: [
          { sommets: [c(e.O), c(e.A), c(e.B)], couleur: COULEURS.encre },
          { sommets: [c(e.O), c(e.C), c(e.D)], couleur: COULEURS.accent, pointilles: !e.coherent },
        ],
        points: pointsNommes(
          [
            ["O", e.O],
            ["A", e.A],
            ["B", e.B],
            ["C", e.C, COULEURS.accent],
            ["D", e.D, COULEURS.accent],
          ],
          g,
        ),
        libelle: "Les triangles OAB et OCD",
      });
    }
    case "E": {
      const g = centre([c(e.A), c(e.B), c(e.C)]);
      return planComplexeSvg({
        droites: [
          { p1: c(e.A), p2: c(e.B), couleur: COULEURS.accent },
          { p1: c(e.A), p2: c(e.C), couleur: COULEURS.ciel },
        ],
        points: pointsNommes([["A", e.A], ["B", e.B], ["C", e.C]], g),
        libelle: "Les droites (AB) et (AC)",
      });
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

const carre = (l: Longueur) => Math.round(l.numerique * l.numerique);
const entier = (p: PointComplexe) => Number.isInteger(p.re) && Number.isInteger(p.im);

/** MN = |z_N − z_M| = |…| = √(…) = …, une transformation par ligne (affixes entières). */
function lignesLongueur(nom: string, p: PointComplexe, q: PointComplexe, l: Longueur): LigneCalcul[] {
  const [zp, zq] = [nom[0], nom[1]];
  if (!entier(p) || !entier(q)) return [ligne(`${nom}=|z_${zq}-z_${zp}|=${l.latex}`, "module de la différence")];
  const dx = q.re - p.re;
  const dy = q.im - p.im;
  const lignes = [
    ligne(`${nom}=|z_${zq}-z_${zp}|`, "distance = module de la différence"),
    ligne(`=|${pointEntierLatex(dx, dy)}|`, "on calcule la différence"),
    ligne(`=\\sqrt{(${dx})^2+(${dy})^2}`, "|x + yi| = √(x² + y²)"),
  ];
  const n = dx * dx + dy * dy;
  if (`\\sqrt{${n}}` !== l.latex) lignes.push(ligne(`=\\sqrt{${n}}`));
  lignes.push(ligne(`=${l.latex}`));
  return lignes;
}

/** Comparaison des trois côtés (isocèle ?) : on regroupe les longueurs égales. */
function lignesComparaison(cotes: [string, Longueur][]): LigneCalcul[] {
  const groupes = new Map<string, string[]>();
  for (const [nom, l] of cotes) groupes.set(l.latex, [...(groupes.get(l.latex) ?? []), nom]);
  return [...groupes.entries()].map(([val, noms]) => ligne(`${noms.join("=")}=${val}`, noms.length > 1 ? "deux côtés égaux" : undefined));
}

/** Réciproque de Pythagore : carré du plus grand côté et somme des carrés des deux autres. */
function lignesPythagore(cotes: [string, Longueur][]): LigneCalcul[] {
  const tries = [...cotes].sort((x, y) => y[1].numerique - x[1].numerique);
  const [g, a, b] = tries;
  const s = carre(a[1]) + carre(b[1]);
  return [
    ligne(`${g[0]}^2=${carre(g[1])}`, "le plus grand côté"),
    ligne(`${a[0]}^2+${b[0]}^2=${carre(a[1])}+${carre(b[1])}=${s}`, s === carre(g[1]) ? "égal : rectangle ✓" : "différent : pas rectangle"),
  ];
}

function lignesCosinus(e: ExerciceTrianglesB): LigneCalcul[] {
  const s = e.sommetIsocele;
  const [l1, l2, lo] = s === "O" ? [carre(e.OA), carre(e.OB), carre(e.AB)] : s === "A" ? [carre(e.OA), carre(e.AB), carre(e.OB)] : [carre(e.OB), carre(e.AB), carre(e.OA)];
  const num = l1 + l2 - lo;
  const den = 2 * l1;
  let a = Math.abs(num);
  let b = den;
  while (b) [a, b] = [b, a % b];
  const g = a || 1;
  const frac = num === 0 ? "0" : `${num < 0 ? "-" : ""}\\dfrac{${Math.abs(num) / g}}{${den / g}}`;
  const autres = (["O", "A", "B"] as const).filter((x) => x !== s);
  const deg = (v: number) => `${(Math.round(v * 10) / 10).toString().replace(".", "{,}")}^{\\circ}`;
  return [
    ligne(`\\cos\\widehat{${s}}=\\dfrac{${l1}+${l2}-${lo}}{2\\cdot ${l1}}`, "loi des cosinus (côtés adjacents égaux)"),
    ligne(`=${frac}`),
    ligne(`\\widehat{${s}}\\approx ${deg(e.anglesDeg[s])}`, "arccos, calculatrice en degrés"),
    ligne(`\\widehat{${autres[0]}}=\\widehat{${autres[1]}}=\\dfrac{180^{\\circ}-\\widehat{${s}}}{2}\\approx ${deg(e.anglesDeg[autres[0]])}`, "angles à la base égaux, somme 180°"),
  ];
}

function methode(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  if (aide.texte) return [t(`${aide.texte} `), ...(aide.latex ? [f(aide.latex)] : [])];
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
    case "cEcran1":
    case "cEcran2":
      return [t("La distance entre deux points est le module de la différence de leurs affixes : "), f("MN=|z_N-z_M|"), t(".")];
    case "aEcran2":
    case "bEcran2":
      return [t("Un triangle est isocèle quand deux de ses côtés ont la même longueur ; le sommet principal est le sommet commun à ces deux côtés.")];
    case "aEcran3":
    case "bEcran3":
      return [t("Réciproque de Pythagore : le triangle est rectangle si le carré du plus grand côté est égal à la somme des carrés des deux autres ; l'angle droit est opposé à ce plus grand côté.")];
    case "cEcran3":
      return [t("Le centre d'un triangle équilatéral est le seul point situé à égale distance de ses trois sommets.")];
    case "dEcran2":
      return [t("D est l'image de B par la même similitude si et seulement si "), f("\\dfrac{z_D}{z_B}=\\dfrac{z_C}{z_A}"), t(" (même rapport et même angle).")];
    case "dEcran3":
      return [t("La similitude de centre O de rapport k et d'angle θ multiplie les affixes par "), f("k\\cdot e^{i\\theta}=k\\cos\\theta+i\\,k\\sin\\theta"), t(".")];
    default:
      return [t("On applique la propriété de l'étape.")];
  }
}

export function conclusion(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): FragmentConsigne[] {
  if (e.famille === "D" && phase === "dEcran2")
    return e.coherent ? [t("Oui : B et D donnent le même rapport et le même angle, donc la similitude envoie B sur D.")] : [t("Non : B et D donnent un autre rapport ou un autre angle, donc la similitude n'envoie pas B sur D.")];
  return reponse(e, phase);
}

export function piege(phase: PhaseTrianglesComplexes): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
    case "bEcran1":
      return [t("Additionner les modules au lieu de prendre le module de la différence : "), f("|z_B-z_A|\\neq|z_B|-|z_A|"), t(".")];
    case "aEcran2":
    case "bEcran2":
      return [t("Se tromper de sommet principal : c'est le sommet commun aux deux côtés égaux.")];
    case "aEcran3":
    case "bEcran3":
      return [t("Conclure sans comparer le carré du plus grand côté à la somme des carrés des deux autres.")];
    case "bEcran4":
      return [t("Calculer l'arccosinus avec la calculatrice réglée en radians : les angles sont demandés en degrés.")];
    case "cEcran3":
      return [t("Conclure « centre » dès que deux distances sont égales : il faut les trois égales.")];
    case "dEcran2":
      return [t("Ne comparer que les rapports (ou que les angles) : il faut le même rapport et le même angle.")];
    case "eEcran2":
      return [t("Inverser les deux critères : quotient réel → points alignés ; quotient imaginaire pur → droites perpendiculaires.")];
    default:
      return null;
  }
}

/** Quotient z/w de deux affixes entières, compact (division par le conjugué). */
function quotientCompact(nom: string, z: PointComplexe, w: PointComplexe): LigneCalcul {
  if (!entier(z) || !entier(w)) {
    const n = w.re * w.re + w.im * w.im;
    const re = (z.re * w.re + z.im * w.im) / n;
    const im = (z.im * w.re - z.re * w.im) / n;
    return ligne(`${nom}\\approx ${re.toFixed(2).replace(".", "{,}")}${im < 0 ? "-" : "+"}${Math.abs(im).toFixed(2).replace(".", "{,}")}i`, "par le conjugué du dénominateur");
  }
  const q = quotientExact(z.re, z.im, w.re, w.im);
  return ligne(`${nom}=\\dfrac{${pointEntierLatex(z.re, z.im)}}{${pointEntierLatex(w.re, w.im)}}=${cq(q.re, q.im)}`, w.im === 0 ? "on divise chaque partie" : "par le conjugué du dénominateur");
}

function calculEtape(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes): { lignes: LigneCalcul[]; intro?: FragmentConsigne[] } | null {
  switch (e.famille) {
    case "A": {
      const cotes: [string, Longueur][] = [["AB", e.AB], ["AC", e.AC], ["BC", e.BC]];
      if (phase === "aEcran1") return { lignes: [...lignesLongueur("AB", e.A, e.B, e.AB), ...lignesLongueur("AC", e.A, e.C, e.AC), ...lignesLongueur("BC", e.B, e.C, e.BC)] };
      if (phase === "aEcran2") return { lignes: lignesComparaison(cotes), intro: [t("Longueurs de l'étape 1 :")] };
      return { lignes: lignesPythagore(cotes) };
    }
    case "B": {
      const cotes: [string, Longueur][] = [["OA", e.OA], ["OB", e.OB], ["AB", e.AB]];
      if (phase === "bEcran1") return { lignes: [...lignesLongueur("OA", e.O, e.A, e.OA), ...lignesLongueur("OB", e.O, e.B, e.OB), ...lignesLongueur("AB", e.A, e.B, e.AB)] };
      if (phase === "bEcran2") return { lignes: lignesComparaison(cotes), intro: [t("Longueurs de l'étape 1 :")] };
      if (phase === "bEcran3") return { lignes: lignesPythagore(cotes) };
      return { lignes: lignesCosinus(e) };
    }
    case "C":
      if (phase === "cEcran1") return { lignes: [ligne(`OB=|z_B-z_O|=${e.cote}`, "module de la différence"), ligne(`BF=|z_F-z_B|=${e.cote}`), ligne(`OF=|z_F-z_O|=${e.cote}`)] };
      if (phase === "cEcran2") return { lignes: [...lignesLongueur("AO", e.A, e.O, e.AO), ...lignesLongueur("AB", e.A, e.B, e.AB), ...lignesLongueur("AF", e.A, e.F, e.AF)] };
      return { lignes: lignesComparaison([["AO", e.AO], ["AB", e.AB], ["AF", e.AF]]), intro: [t("Distances de l'étape 2 :")] };
    case "D":
      if (phase === "dEcran1") return { lignes: [ligne(`k=\\dfrac{OC}{OA}=\\dfrac{|z_C|}{|z_A|}=${e.rapport}`, "rapport des longueurs"), ligne(`\\theta=\\arg z_C-\\arg z_A=${e.angleLatex}`, "angle de la similitude")] };
      if (phase === "dEcran2") return { lignes: [quotientCompact("\\dfrac{z_C}{z_A}", e.C, e.A), quotientCompact("\\dfrac{z_D}{z_B}", e.D, e.B)] };
      return { lignes: [ligne(`k\\cos\\theta+i\\,k\\sin\\theta=${e.rapport}\\cos\\left(${e.angleLatex}\\right)+i\\cdot ${e.rapport}\\sin\\left(${e.angleLatex}\\right)`, "k et θ de l'étape 1"), ligne(`=${pointEntierLatex(e.multiplicateurRe, e.multiplicateurIm)}`, "valeurs remarquables")] };
    case "E": {
      if (phase !== "eEcran1") return { lignes: [ligne(`q=${pointEntierLatex(e.quotientRe, e.quotientIm)}`, e.quotientIm === 0 ? "partie imaginaire nulle : q réel" : e.quotientRe === 0 ? "partie réelle nulle : q imaginaire pur" : "ni réel, ni imaginaire pur")] };
      const [ua, ub] = [e.C.re - e.A.re, e.C.im - e.A.im];
      const [va, vb] = [e.B.re - e.A.re, e.B.im - e.A.im];
      return { lignes: [ligne("q=\\dfrac{z_C-z_A}{z_B-z_A}"), ...suite(lignesQuotient(v(ua, ub), v(va, vb), "q")).map((l, i) => (i === 0 ? { ...l, justification: "on calcule les différences" } : l))] };
    }
  }
}

function lignesEtape(e: ExerciceTrianglesComplexes, phase: PhaseTrianglesComplexes, sq: string, avecFigure: boolean): EtapeCorrection[] {
  const L: EtapeCorrection[] = [utilise(sq, [...methode(e, phase), t(` ${COURS}`)])];
  const c0 = calculEtape(e, phase);
  if (c0 && c0.lignes.length) L.push(ligneCalcul(sq, c0.lignes, c0.intro ?? []));
  L.push({ ...resultat(sq, conclusion(e, phase)), ...(avecFigure ? { figureHtml: figure(e) } : {}) });
  const p = piege(phase);
  if (p) L.push(lignePiege(sq, p));
  return L;
}

/** La figure va APRÈS les verdicts : dernière étape (D : étape 2, le verdict de cohérence). */
function phaseFigure(e: ExerciceTrianglesComplexes): PhaseTrianglesComplexes {
  if (e.famille === "D") return "dEcran2";
  const phases = phasesPourExercice(e);
  return phases[phases.length - 1];
}

export function correctionDetailleeTriangles(e: ExerciceTrianglesComplexes): EtapeCorrection[] {
  const avecFig = phaseFigure(e);
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], phase === avecFig));
}

