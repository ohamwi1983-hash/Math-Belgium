import type { ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesD, ExerciceComplexesE } from "../../core6e/complexesAvances.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul as ligneCalcul, latex, ligne, lignesDepuisChaine, piege as lignePiege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { affixeLatex, affixeLatexRationnel, aideNiveau1, aideNiveau2, formatReponseAttenduePhaseLatex } from "../../ui6e/formatComplexesAvances";
import { phasesPourExercice, type PhaseComplexesAvances } from "../../moteur6e/typesComplexesAvances";
import { ratioE, solutionsDModules } from "../../moteur6e/verificationComplexesAvances";
import { lignesCarre, lignesQuotient, mono, somme, suite, v } from "../../ui6e/corrigeComplexes";
import { COULEURS, planComplexeSvg } from "../figuresPlanComplexe40-42";
import type { Coord, PointPlan } from "../figuresPlanComplexe40-42";

/**
 * Corrigé détaillé « comme au tableau » de `6gen42` (nombres complexes — problèmes avancés) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape
 * par écran : ce qu'on utilise (aide de l'écran ou méthode), les formules de calcul de l'écran
 * (aides, valeurs substituées) éclatées en une transformation par ligne et alignées sur « = »,
 * quotients par le conjugué ; figure du lieu / des solutions à la dernière étape.
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, § 9)";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  return [f(formatReponseAttenduePhaseLatex(e, phase).join(",\\quad "))];
}

// ---------------------------------------------------------------------------------------------
// Figures du corrigé
// ---------------------------------------------------------------------------------------------

const xy = (z: { a: number; b: number }): Coord => [z.a, z.b];

function figureA(e: Extract<ExerciceComplexesAvances, { famille: "A" }>): string {
  const R = Math.pow(e.k, 1 / e.n);
  const angles = e.n === 4 ? [0, Math.PI / 2, Math.PI, -Math.PI / 2] : [0, (2 * Math.PI) / 3, (-2 * Math.PI) / 3];
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: R, pointilles: true, couleur: COULEURS.doux, epaisseur: 1.1 }],
    demiDroites: angles.map((angle) => ({ origine: [0, 0] as Coord, angle, depuis: R, couleur: COULEURS.accent })),
    points: angles.map((angle) => ({ x: R * Math.cos(angle), y: R * Math.sin(angle), creux: true, couleur: COULEURS.accent })),
    inclure: [
      [-3.2, -3.2],
      [3.2, 3.2],
    ],
    libelle: "Points M dont l'affixe z vérifie la condition",
  });
}

function figureB(e: ExerciceComplexesB): string {
  if (e.sousType === "intersection") {
    return planComplexeSvg({
      droites: [{ p1: xy(e.q1), p2: xy(e.q2), couleur: COULEURS.ciel }],
      cercles: [{ cx: 0, cy: 0, r: Math.sqrt(e.kCercleO), couleur: COULEURS.accent }],
      points: [
        { x: e.q1.a, y: e.q1.b, etiquette: affixeLatexTexte(e.q1), couleur: COULEURS.bon },
        { x: e.q2.a, y: e.q2.b, etiquette: affixeLatexTexte(e.q2), couleur: COULEURS.bon, position: "so" },
      ],
      libelle: "La droite, le cercle et leurs points d'intersection",
    });
  }
  const r = e.resultat;
  const points: PointPlan[] = [];
  const pole = e.poleExclu ? [{ x: e.poleExclu.a, y: e.poleExclu.b, creux: true, couleur: COULEURS.mauvais, etiquette: "exclu" } as PointPlan] : [];
  if (r.nature === "droite") {
    return planComplexeSvg({
      droites: [{ p1: xy(r.point1), p2: xy(r.point2), couleur: COULEURS.accent }],
      points: [...points, ...[r.point1, r.point2].filter((p) => !e.poleExclu || p.a !== e.poleExclu.a || p.b !== e.poleExclu.b).map((p) => ({ x: p.a, y: p.b, couleur: COULEURS.encre })), ...pole],
      libelle: "Le lieu de M : une droite",
    });
  }
  if (r.nature === "cercle") {
    return planComplexeSvg({
      cercles: [{ cx: r.centre.a, cy: r.centre.b, r: r.rayon, couleur: COULEURS.accent }],
      points: [{ x: r.centre.a, y: r.centre.b, etiquette: "centre", couleur: COULEURS.encre, position: "s" }, ...pole],
      libelle: "Le lieu de M : un cercle",
    });
  }
  return planComplexeSvg({
    demiDroites: r.angles.map((a) => ({ origine: xy(r.origine), angle: a.numerique, couleur: COULEURS.accent })),
    points: [{ x: r.origine.a, y: r.origine.b, creux: true, couleur: COULEURS.accent, etiquette: "origine exclue", position: "s" }, ...pole],
    libelle: "Le lieu de M : demi-droite(s)",
  });
}

/** Étiquette texte d'une affixe entière (« 2−i ») pour la figure : signe moins typographique. */
function affixeLatexTexte(z: { a: number; b: number }): string {
  return affixeLatex(z).replace(/-/g, "−");
}

function figureDModules(e: Extract<ExerciceComplexesD, { sousType: "modules" }>): string {
  const num = 2 * (e.dImaginaire ? e.q : e.p);
  const d: Coord = e.dImaginaire ? [0, num / e.r] : [num / e.r, 0];
  const milieu: Coord = [d[0] / 2, d[1] / 2];
  const sol = solutionsDModules(e);
  return planComplexeSvg({
    cercles: [{ cx: 0, cy: 0, r: 1, couleur: COULEURS.accent }],
    droites: [{ p1: milieu, p2: e.dImaginaire ? [milieu[0] + 1, milieu[1]] : [milieu[0], milieu[1] + 1], couleur: COULEURS.ciel }],
    segments: [{ de: [0, 0], a: d, pointilles: true, couleur: COULEURS.doux }],
    points: [{ x: d[0], y: d[1], etiquette: "d", couleur: COULEURS.encre, position: "se" }, ...sol.map((z) => ({ x: z.re, y: z.im, couleur: COULEURS.bon }))],
    inclure: [
      [-1.5, -1.5],
      [1.5, 1.5],
    ],
    libelle: "Cercle unité et médiatrice du segment joignant O au point d'affixe d",
  });
}

function figureE(e: ExerciceComplexesE): string {
  return planComplexeSvg({
    droites: [
      { p1: xy(e.zA), p2: xy(e.zB), couleur: COULEURS.accent },
      { p1: xy(e.zC), p2: xy(e.zD), couleur: COULEURS.ciel },
    ],
    points: [
      { x: e.zA.a, y: e.zA.b, etiquette: "A", couleur: COULEURS.accent },
      { x: e.zB.a, y: e.zB.b, etiquette: "B", couleur: COULEURS.accent },
      { x: e.zC.a, y: e.zC.b, etiquette: "C", couleur: COULEURS.ciel },
      { x: e.zD.a, y: e.zD.b, etiquette: "D", couleur: COULEURS.ciel },
    ],
    libelle: "Les droites (AB) et (CD)",
  });
}

export function figure(e: ExerciceComplexesAvances): string | null {
  switch (e.famille) {
    case "A":
      return figureA(e);
    case "B":
      return figureB(e);
    case "D":
      return e.sousType === "modules" ? figureDModules(e) : null;
    case "E":
      return figureE(e);
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function methode(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  const aide = aideNiveau1(e, phase);
  if (aide.texte) return [t(`${aide.texte} `), ...(aide.latex ? [f(aide.latex)] : [])];
  switch (phase) {
    case "aEcran2":
      return [t("Un argument de z se lit sur la position du point (a ; b) : θ = 0 sur la demi-droite des réels positifs, et "), f("\\tan\\theta=\\dfrac{b}{a}"), t(" en tenant compte du signe de a.")];
    case "aEcran3":
      return [t("Le module d'une puissance est la puissance du module :"), f("\\ |z^n|=|z|^n"), t(".")];
    case "bEcran2":
      return [t("On reconnaît l'équation : ax + by + c = 0 pour une droite, "), f("(x-x_0)^2+(y-y_0)^2=r^2"), t(" pour un cercle de centre "), f("x_0+y_0\\,i"), t(" et de rayon r ; une condition de signe ou d'argument ne garde qu'une partie (demi-droite, origine exclue).")];
    case "bInterEcran1":
      return [t("Rapport réel : M est sur la droite passant par les points d'affixes "), f("q_1"), t(" et "), f("q_2"), t(" ; "), f("z\\cdot\\bar z=x^2+y^2"), t(".")];
    case "bInterEcran2":
      return [t("On lit les deux lieux sur leurs équations.")];
    case "bInterEcran3":
      return [t("On remplace, dans l'équation du cercle, une inconnue tirée de l'équation de la droite.")];
    case "cEcran2":
      return [t("Même méthode : "), f("|w|^2=w\\,\\bar w"), t(" et le conjugué d'un produit est le produit des conjugués.")];
    case "cEcran3":
      return [t("Sur le cercle unité, "), f("z\\cdot\\bar z=1"), t(". Le module d'un quotient est le quotient des modules : "), f("|z'|=1"), t(" si et seulement si le carré du module du numérateur est égal à celui du dénominateur.")];
    case "dRatioEcran1":
      return [t("Les solutions de "), f("u^n=m^n"), t(" sont "), f("u=m\\cdot e^{\\frac{2ik\\pi}{n}}"), t(", pour "), f("k=0,\\ldots,n-1"), t(".")];
    case "dRatioEcran2":
      return [f("u=\\dfrac{z+c}{z}\\iff z(u-1)=c\\iff z=\\dfrac{c}{u-1}"), t(" (u ≠ 1).")];
    case "dReellesEcran1":
      return [t("Si z = x est réel, l'équation est nulle si et seulement si sa partie réelle et sa partie imaginaire sont nulles.")];
    case "dReellesEcran2":
      return [t("Les deux racines réelles de la première équation doivent aussi vérifier la seconde, qui est un produit : son facteur indépendant de x doit être nul.")];
    case "dReellesEcran3":
      return [t("Les deux solutions sont les racines de la première équation.")];
    case "dCoefEcran1":
      return [t("On remplace z par "), f("z_0"), t(" ; α et β étant réels, on identifie partie réelle et partie imaginaire.")];
    case "dCoefEcran2":
      return [t("La seconde équation donne α, la première β.")];
    case "dModulesEcran1":
      return [f("\\left|\\dfrac{1}{z}\\right|=\\dfrac{1}{|z|}"), t(", donc "), f("|z|^2=1"), t(".")];
    case "dModulesEcran2":
      return [t("|z| = |z − d| : M est à égale distance de O et du point d'affixe d, donc sur la médiatrice de ce segment ; on l'intersecte avec le cercle unité.")];
    case "eEcran1":
      return [t("On calcule les deux différences, puis on divise en multipliant par le conjugué du dénominateur : "), f("\\dfrac{u}{v}=\\dfrac{u\\cdot\\bar v}{|v|^2}"), t(".")];
    case "eEcran2":
      return [t("Un argument de a + bi se lit sur la position du point (a ; b) : "), f("\\tan\\theta=\\dfrac{b}{a}"), t(", en tenant compte du quadrant.")];
    default:
      return null;
  }
}

function calcul(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  if (e.famille === "A") {
    if (phase === "aEcran1") return aideNiveau2(e, phase).latex ? [t("Un réel a pour argument 0 ou π : "), f(aideNiveau2(e, phase).latex as string), t(", et seuls les multiples pairs de π donnent un réel positif.")] : null;
    if (phase === "aEcran2")
      return e.n === 4
        ? [f("4\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\equiv 0\\pmod{\\frac{\\pi}{2}}"), t(" : z est sur l'un des deux axes.")]
        : [f("3\\theta\\equiv 0\\pmod{2\\pi}\\iff\\theta\\in\\left\\{0\\,;\\,\\frac{2\\pi}{3}\\,;\\,-\\frac{2\\pi}{3}\\right\\}"), t(" ; pour "), f("\\theta=\\pm\\frac{2\\pi}{3}"), t(", "), f("a<0"), t(" et "), f("\\tan\\theta=\\mp\\sqrt{3}"), t(".")];
    return [f(`|z^{${e.n}}|=|z|^{${e.n}}>${e.k}\\iff\\sqrt{a^2+b^2}>\\sqrt[${e.n}]{${e.k}}`)];
  }
  if (e.famille === "B" && phase === "bEcran1") {
    const aide = aideNiveau2(e, phase);
    return aide.latex ? [t(`${aide.texte.replace(" (simplification non faite)", "")} `), f(aide.latex)] : null;
  }
  if (e.famille === "C" && phase === "cEcran3") {
    const p2 = e.a * e.a + e.b * e.b;
    const [num] = formatReponseAttenduePhaseLatex(e, "cEcran1");
    const [den] = formatReponseAttenduePhaseLatex(e, "cEcran2");
    const numSubst = num.replace(/^z\\bar z/, "1");
    const denSubst = den.replace(`+${p2}\\,z\\bar z`, `+${p2}`);
    return [t("Avec "), f("z\\cdot\\bar z=1"), t(" : "), f(`|z-p|^2=${numSubst}`), t(" et "), f(`|${e.conjugue ? "1-\\bar p z" : "1-pz"}|^2=${denSubst}`), t(".")];
  }
  if (e.famille === "D" && e.sousType === "ratio" && phase === "dRatioEcran2") return [f(`z=\\dfrac{${e.c}}{${e.m}-1}`)];
  if (e.famille === "E") {
    if (phase === "eEcran1") {
      const num = affixeLatex({ a: e.zD.a - e.zC.a, b: e.zD.b - e.zC.b });
      const den = affixeLatex({ a: e.zB.a - e.zA.a, b: e.zB.b - e.zA.b });
      const r = ratioE(e);
      return [f(`\\dfrac{z_D-z_C}{z_B-z_A}=\\dfrac{${num}}{${den}}=${affixeLatexRationnel(r.re, r.im)}`)];
    }
    if (phase === "eEcran3") {
      const aide = aideNiveau2(e, phase);
      return aide.latex ? [f(aide.latex)] : null;
    }
  }
  return null;
}

export function piege(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] | null {
  switch (phase) {
    case "aEcran1":
      return [t("S'arrêter à "), f("n\\theta\\equiv 0\\pmod{\\pi}"), t(" : un multiple impair de π donne un réel négatif.")];
    case "aEcran3":
      return [t("Comparer |z| à k au lieu de "), f(e.famille === "A" ? `\\sqrt[${e.n}]{${e.k}}` : "\\sqrt[n]{k}"), t(" : c'est "), f("|z|^n"), t(" qui doit dépasser k.")];
    case "bEcran2": {
      if (e.famille !== "B" || e.sousType === "intersection") return null;
      if (e.resultat.nature === "demiDroite") return [t("Donner la droite entière : la condition de signe (ou d'argument modulo 2π) ne garde qu'une partie, origine exclue.")];
      if (e.poleExclu) return [t("Oublier d'exclure le point d'affixe "), f(affixeLatex(e.poleExclu)), t(", où la condition n'est pas définie.")];
      if (e.sousType === "cercleO") return [t("Prendre k pour rayon : le rayon est "), f("\\sqrt{k}"), t(".")];
      if (e.sousType === "cercleA") return [t("Confondre k et "), f("k^2"), t(" : le rayon est k.")];
      return [t("Se tromper de centre : regrouper les termes en x et en y, puis compléter les carrés.")];
    }
    case "bInterEcran3":
      return [t("Ne garder qu'une des deux solutions de l'équation du second degré obtenue.")];
    case "cEcran2":
      return [t("Mal conjuguer : le conjugué de "), f("pz"), t(" est "), f("\\bar p\\,\\bar z"), t(".")];
    case "dRatioEcran1":
      return [t("Ne donner que la solution réelle : "), f("u^n=k"), t(" a n solutions complexes.")];
    case "dReellesEcran2":
      return [t("N'utiliser que la partie réelle et oublier la condition donnée par la partie imaginaire.")];
    case "dCoefEcran1":
      return [t("Oublier que α et β sont réels : c'est ce qui permet d'identifier parties réelle et imaginaire.")];
    case "dModulesEcran2":
      return [t("Oublier l'un des deux points d'intersection de la médiatrice avec le cercle unité.")];
    case "eEcran3":
      return [t("Inverser les critères : rapport réel → parallèles ; rapport imaginaire pur → perpendiculaires.")];
    default:
      return null;
  }
}


/** Fragments « calcul » de l'écran → lignes alignées : chaque formule est coupée à ses « \iff »,
 * « \qquad » et « \quad », puis à ses « = » (une transformation par ligne) ; le texte sert
 * d'introduction. */
function enLignes(fragments: FragmentConsigne[]): { intro: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const intro: FragmentConsigne[] = [];
  const lignes: LigneCalcul[] = [];
  for (const fr of fragments) {
    if (fr.type === "texte") {
      if (lignes.length === 0) intro.push(fr);
      continue;
    }
    for (const morceau of fr.valeur.split(/\\iff|\\qquad|\\quad|\\ \\Rightarrow\\ /)) {
      const m = morceau.trim().replace(/^,|,$/g, "").trim();
      if (m) lignes.push(...lignesDepuisChaine(m));
    }
  }
  return { intro, lignes };
}

/** Dérivations écrites ligne à ligne pour les lieux usuels et les équations à coefficients
 * inconnus (valeurs de l'instance). */
function calculsExplicites(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): { intro: FragmentConsigne[]; lignes: LigneCalcul[] } | null {
  if (e.famille === "B" && e.sousType !== "intersection" && phase === "bEcran1") {
    const [a1, b1, a2, b2] = [e.p1.a, e.p1.b, e.p2.a, e.p2.b];
    const px = (k: number) => (k === 0 ? "x" : `(x${k < 0 ? "+" : "-"}${Math.abs(k)})`);
    const py = (k: number) => (k === 0 ? "y" : `(y${k < 0 ? "+" : "-"}${Math.abs(k)})`);
    if (e.sousType === "droite") {
      const A = b2 - b1;
      const B = a1 - a2;
      const C = a2 * b1 - a1 * b2;
      const pg = (x: number, y: number): number => (y === 0 ? Math.abs(x) : pg(y, x % y));
      const g0 = pg(pg(A, B), C) || 1;
      const g = A / g0 < 0 || (A === 0 && B / g0 < 0) ? -g0 : g0;
      return {
        intro: [t("Un quotient est réel quand "), f("(z-p_1)\\,\\overline{(z-p_2)}"), t(" a une partie imaginaire nulle :")],
        lignes: [
          ligne(`(z-p_1)\\,\\overline{(z-p_2)}=\\left(${px(a1)}+${py(b1)}i\\right)\\left(${px(a2)}-${py(b2)}i\\right)`, "z = x + yi"),
          ligne(`\\operatorname{Im}=${py(b1)}${px(a2)}-${px(a1)}${py(b2)}=0`, "partie imaginaire du produit"),
          ligne(`${somme([mono(A, "x"), mono(B, "y"), mono(C)])}=0`, "on développe, les termes en xy s'annulent"),
          ...(Math.abs(g) > 1 || g < 0 ? [ligne(`${somme([mono(A / g, "x"), mono(B / g, "y"), mono(C / g)])}=0`, g === -1 ? "on multiplie par −1" : `on divise par ${g}`.replace("-", "−"))] : []),
        ],
      };
    }
    if (e.sousType === "cercleA" && e.k !== undefined) {
      return { intro: [], lignes: [ligne(`|z-a|^2=${px(a1)}^2+${py(b1)}^2`, "|X + Yi|² = X² + Y²"), ligne(`${px(a1)}^2+${py(b1)}^2=${e.k * e.k}`, "on élève |z − a| = k au carré")] };
    }
    if (e.sousType === "cercleO" && e.k !== undefined) {
      return { intro: [], lignes: [ligne("z\\cdot\\bar z=(x+yi)(x-yi)", "z = x + yi"), ligne("=x^2-(yi)^2", "(a + b)(a − b) = a² − b²"), ligne("=x^2+y^2", "car i² = −1"), ligne(`x^2+y^2=${e.k}`, "condition de l'énoncé")] };
    }
  }
  if (e.famille === "D" && e.sousType === "coef") {
    const { p, q } = e;
    const z0 = somme([mono(p), mono(q, "i")]);
    const re = p * p - q * q;
    const im = 2 * p * q;
    if (phase === "dCoefEcran1")
      return {
        intro: [],
        lignes: [
          ...lignesCarre(p, q, "z_0^2"),
          ligne(`z_0^2+\\alpha z_0+\\beta=${somme([mono(re), mono(im, "i")])}+\\alpha(${z0})+\\beta`.replace(/\\\\/g, "\\"), "on remplace z par z₀"),
          ligne(`=(${somme([mono(re), mono(p, "\\alpha"), "\\beta"])})+(${somme([mono(im), mono(q, "\\alpha")])})\\,i`.replace(/\\\\/g, "\\"), "on regroupe parties réelle et imaginaire"),
        ],
      };
    const alpha = -im / q;
    return { intro: [], lignes: [ligne(`${mono(q, "\\alpha")}${im < 0 ? "" : "+"}${im}=0`.replace(/\\\\/g, "\\"), "partie imaginaire nulle"), ligne(`\\alpha=${alpha}`.replace(/\\\\/g, "\\")), ligne(`\\beta=-(${re})-${p < 0 ? `(${p})` : p}\\cdot(${alpha})=${-re - p * alpha}`.replace(/\\\\/g, "\\"), "partie réelle nulle")] };
  }
  if (e.famille === "D" && e.sousType === "modules" && phase === "dModulesEcran1") {
    return { intro: [], lignes: [ligne("|z|=\\left|\\dfrac{1}{z}\\right|=\\dfrac{1}{|z|}".replace(/\\\\/g, "\\"), "module d'un inverse"), ligne("|z|^2=1", "on multiplie par |z| > 0"), ligne("|z|=1", "un module est positif")] };
  }
  return null;
}

function calculsEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances): { intro: FragmentConsigne[]; lignes: LigneCalcul[] } | null {
  if (e.famille === "E" && phase === "eEcran1") {
    const num = v(e.zD.a - e.zC.a, e.zD.b - e.zC.b);
    const den = v(e.zB.a - e.zA.a, e.zB.b - e.zA.b);
    return { intro: [], lignes: [ligne("\\dfrac{z_D-z_C}{z_B-z_A}"), ...suite(lignesQuotient(num, den, "q")).map((l, i) => (i === 0 ? { ...l, justification: "on calcule les différences" } : l))] };
  }
  const explicite = calculsExplicites(e, phase);
  if (explicite) return explicite;
  const c = calcul(e, phase);
  if (c) return enLignes(c);
  const a2 = aideNiveau2(e, phase);
  if (a2.latex && /=/.test(a2.latex)) return enLignes([f(a2.latex)]);
  return null;
}

function lignesEtape(e: ExerciceComplexesAvances, phase: PhaseComplexesAvances, sq: string, derniere: boolean): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const m = methode(e, phase) ?? [t("On applique la propriété de l'étape aux données.")];
  L.push(utilise(sq, [...m, t(` ${COURS}`)]));
  const c = calculsEtape(e, phase);
  if (c && c.lignes.length) L.push(ligneCalcul(sq, c.lignes, c.intro));
  const fig = derniere ? figure(e) : null;
  L.push({ ...resultat(sq, reponse(e, phase)), ...(fig ? { figureHtml: fig } : {}) });
  const p = piege(e, phase);
  if (p) L.push(lignePiege(sq, p));
  return L;
}

export function correctionDetailleeComplexesAvances(e: ExerciceComplexesAvances): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i], i === phases.length - 1));
}
