import type { ExerciceRacinesB, ExerciceRacinesNiemes, RacineExacte } from "../../core6e/racinesNiemes.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne as ligneCalcul, lignesDepuisChaine, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { etiquetteNombre } from "../../ui6e/figureRepereIntegrales";
import { LIBELLE_RELATION_C, aideNiveau1, assembleRacineLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatRacinesNiemes";
import { phasesPourExercice, type PhaseRacinesNiemes } from "../../moteur6e/typesRacinesNiemes";
import { anglePiLatex, indice, planComplexeSvg } from "../../ui6e/papierComplexes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen39` (racines n-ièmes d'un nombre complexe) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape par
 * écran ; θₖ calculé pour chaque k, puis zₖ = r(cos θₖ + i sin θₖ) converti avec les valeurs
 * remarquables ; polygone des racines (`figureHtml`). Valeurs de l'écran
 * (`formatReponseAttenduePhaseLatex`, `assembleRacineLatex`).
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, point 6)";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

export function virgule(v: number, decimales = 2): string {
  const r = Number(v.toFixed(decimales));
  return (Object.is(r, -0) ? 0 : r).toFixed(decimales).replace(".", "{,}");
}

/** Retire la ponctuation finale « \text{ ;} » des lignes de récapitulatif de l'écran. */
export function ligne(s: string): string {
  return s.replace(/\\text\{ ;\}$/, "").replace(/\\sqrt\[2\]\{/g, "\\sqrt{").replace(/\\frac\{0\+/g, "\\frac{");
}

/** Plusieurs formules séparées par « ; » (texte) : elles passent à la ligne entre elles. */
export function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

export function reponse(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] {
  return liste(formatReponseAttenduePhaseLatex(e, phase).map(ligne));
}

export function listeK(n: number): string {
  return `k=${Array.from({ length: n }, (_, k) => k).join(",\\,")}`;
}

function fractionLatex(num: number, den: number): string {
  const signe = num * den < 0 ? "-" : "";
  return `${signe}\\frac{${Math.abs(num)}}{${Math.abs(den)}}`;
}

/** Lignes θₖ puis zₖ = r(cos θₖ + i sin θₖ) = a + bi, pour chaque k. */
function lignesRacines(module: string, numDepart: (k: number) => number, den: number, racines: RacineExacte[], nom: string, ecritureTheta: (k: number) => string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  racines.forEach((r, k) => {
    const brut = anglePiLatex(numDepart(k), den);
    const ang = brut.startsWith("-") ? `\\left(${brut}\\right)` : brut;
    const trig = `\\cos ${ang}+i\\sin ${ang}`;
    const ecrit = ecritureTheta(k);
    lignes.push(ligneCalcul(`\\theta_{${k}}=${ecrit.replace(/\\dfrac/g, "\\frac") === brut ? brut : `${ecrit}=${brut}`}`, k === 0 ? "on remplace k par 0, 1, …" : undefined));
    lignes.push(ligneCalcul(`${nom}_{${k}}=${module === "" ? trig : `${module}\\left(${trig}\\right)`}`));
    lignes.push(ligneCalcul(`=${assembleRacineLatex(r.re, r.im)}`, "valeurs remarquables"));
  });
  return lignes;
}

function figureRacines(rayon: number, points: { x: number; y: number }[], nom: string, libelle: string): string {
  return planComplexeSvg({ rayonCercle: rayon, polygone: true, points: points.map((p, k) => ({ ...p, etiquette: `${nom}${indice(k)}` })), libelle });
}

function figure(e: ExerciceRacinesNiemes): string {
  if (e.famille === "B") {
    const rho = Math.pow(e.r, 1 / e.n);
    const pts = Array.from({ length: e.n }, (_, k) => {
      const a = (e.angle.numerique + 2 * k * Math.PI) / e.n;
      return { x: rho * Math.cos(a), y: rho * Math.sin(a) };
    });
    return figureRacines(rho, pts, "z", `Les ${e.n} racines de w, sommets d'un polygone régulier inscrit dans le cercle de rayon ${etiquetteNombre(rho)}`);
  }
  const rayon = e.famille === "A" ? e.kModule : e.r;
  const pts = e.racines.map((r) => ({ x: r.re.numerique, y: r.im.numerique }));
  return figureRacines(rayon, pts, "z", `Les ${e.n} ${e.famille === "A" ? "racines de w" : "solutions"}, sommets d'un polygone régulier inscrit dans le cercle de rayon ${rayon}`);
}

/** Argument de w = a + bi (famille B), avec la correction de quadrant. */
function lignesArgumentB(e: ExerciceRacinesB): { intro: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const egalite = ligne(formatReponseAttenduePhaseLatex(e, "bEcran1")[1]);
  if (e.angle.q !== 1e6) return { intro: [t("Le point (a ; b) est sur un axe ou sur une bissectrice : l'argument est remarquable.")], lignes: [ligneCalcul(egalite)] };
  const quotient = e.b % e.a === 0 ? `${e.b / e.a}` : fractionLatex(e.b, e.a);
  const arct = `\\arctan\\left(${quotient}\\right)`;
  if (e.a > 0) return { intro: [t("a > 0 : la calculatrice donne directement l'argument.")], lignes: lignesDepuisChaine(`\\theta=${arct}${egalite.slice("\\theta".length)}`, ["tan θ = b / a"]) };
  const correction = e.b >= 0 ? "+\\pi" : "-\\pi";
  const quadrant = e.b >= 0 ? "2" : "3";
  return { intro: [t(`a < 0 (quadrant ${quadrant}) : on corrige l'angle donné par la calculatrice d'un demi-tour.`)], lignes: lignesDepuisChaine(`\\theta=${arct}${correction}${egalite.slice("\\theta".length)}`, [e.b >= 0 ? "on ajoute π" : "on retire π"]) };
}

const PIEGES: Partial<Record<PhaseRacinesNiemes, (e: ExerciceRacinesNiemes) => FragmentConsigne[]>> = {
  aEcran2: () => [t("Diviser seulement θ par n et oublier le terme "), f("\\dfrac{2k\\pi}{n}"), t(" : on n'obtiendrait qu'une seule racine.")],
  aEcran3: (e) => [t(`Oublier des racines : il y en a exactement ${e.n}, régulièrement espacées de `), f(`\\dfrac{2\\pi}{${e.n}}`), t(" sur le cercle.")],
  bEcran1: (e) =>
    e.famille === "B" && e.a < 0
      ? [t("Garder l'angle donné par la calculatrice : "), f("\\arctan\\dfrac{b}{a}"), t(" ne convient que si "), f("a>0"), t(" ; ici "), f("a<0"), t(", il faut ajouter ou retirer π.")]
      : [t("Confondre le module "), f("r=\\sqrt{a^2+b^2}"), t(" avec "), f("a^2+b^2"), t(".")],
  bEcran2: () => [t("Prendre la racine n-ième de θ, ou diviser seulement θ par n et oublier le terme "), f("\\dfrac{2k\\pi}{n}"), t(".")],
  cEcran1: () => [t("Écrire "), f("z=w+\\zeta_k"), t(", ou calculer "), f("w^n"), t(" puis ses racines n-ièmes (calcul bien plus long).")],
  cEcran3: (e) => [t("Multiplier les arguments au lieu de les additionner : multiplier par "), f("\\zeta_k"), t(" ajoute "), f(`\\dfrac{2k\\pi}{${e.n}}`), t(" à l'argument de w.")],
};

/** Piège de l'écran (repris dans les erreurs fréquentes du barème). */
export function piege(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes): FragmentConsigne[] | null {
  return PIEGES[phase]?.(e) ?? null;
}

function sommeNulle(racines: RacineExacte[], nom: string, sq: string): EtapeCorrection {
  return verification(sq, [t("Les sommets d'un polygone régulier centré en O ont une somme nulle :")], [
    ligneCalcul(`${racines.map((_, k) => `${nom}_{${k}}`).join("+")}=${racines.map((r) => `\\left(${assembleRacineLatex(r.re, r.im)}\\right)`).join("+")}`),
    ligneCalcul("=0", "on regroupe : somme nulle ✓"),
  ]);
}

function lignesEtape(e: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes, sq: string): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const formule = [f("|z_k|=\\sqrt[n]{r}"), t(" et "), f("\\theta_k=\\dfrac{\\theta+2k\\pi}{n}"), t(", pour "), f("k=0,\\ldots,n-1"), t(` ${COURS}.`)];
  switch (phase) {
    case "aEcran1":
      L.push(utilise(sq, [t("w est déjà écrit sous forme trigonométrique "), f("r\\left(\\cos\\theta+i\\sin\\theta\\right)"), t(" : on lit directement le module r (le facteur devant la parenthèse) et l'argument θ.")]));
      L.push(resultat(sq, reponse(e, phase)));
      break;
    case "aEcran2": {
      if (e.famille !== "A") break;
      L.push(utilise(sq, [t("Les n racines ont toutes le même module et leurs arguments sont espacés de "), f("\\dfrac{2\\pi}{n}"), t(" : "), ...formule]));
      const [mod, th] = formatReponseAttenduePhaseLatex(e, phase).map(ligne);
      L.push(calcul(sq, [ligneCalcul(mod, `car ${e.kModule}^${e.n} = ${e.r}`.replace(/\^(\d+)/, (_, x: string) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(x)] ?? `^${x}`)), ligneCalcul(th, "θ et n de l'énoncé")]));
      L.push(resultat(sq, reponse(e, phase)));
      break;
    }
    case "aEcran3": {
      if (e.famille !== "A") break;
      const module = e.kModule === 1 ? "" : `${e.kModule}`;
      L.push(utilise(sq, [t("Pour chaque k, on calcule θₖ, on le remplace dans "), f(`z_k=${module}\\left(\\cos\\theta_k+i\\sin\\theta_k\\right)`), t(" et on utilise les valeurs remarquables du cosinus et du sinus.")]));
      const th = e.angle.latex;
      L.push(calcul(sq, lignesRacines(module, (k) => e.angle.p + 2 * k * e.angle.q, e.angle.q * e.n, e.racines, "z", (k) => (k === 0 ? (th === "0" ? "0" : `\\dfrac{${th}}{${e.n}}`) : `\\dfrac{${th === "0" ? "" : `${th}+`}${2 * k}\\pi}{${e.n}}`))));
      L.push({ ...resultat(sq, reponse(e, phase)), figureHtml: figure(e) });
      L.push(sommeNulle(e.racines, "z", sq));
      break;
    }
    case "bEcran1": {
      if (e.famille !== "B") break;
      const rLatex = ligne(formatReponseAttenduePhaseLatex(e, "bEcran1")[0]).replace(/^r=/, "");
      const carre = e.a * e.a + e.b * e.b;
      const par = (v: number) => (v < 0 ? `(${v})` : `${v}`);
      const lignesR: LigneCalcul[] = [ligneCalcul(`r=\\sqrt{${par(e.a)}^2+${par(e.b)}^2}`, "|a + bi| = √(a² + b²)"), ligneCalcul(`=\\sqrt{${carre}}`)];
      if (rLatex !== `\\sqrt{${carre}}`) lignesR.push(ligneCalcul(`=${rLatex}`));
      if (!Number.isInteger(e.r)) lignesR[lignesR.length - 1] = { ...lignesR[lignesR.length - 1], latex: `${lignesR[lignesR.length - 1].latex}\\approx ${virgule(e.r)}` };
      const arg = lignesArgumentB(e);
      L.push(utilise(sq, [f("r=\\sqrt{a^2+b^2}"), t(" ; pour l'argument, "), f("\\tan\\theta=\\dfrac{b}{a}"), t(` et le quadrant du point (a ; b) fixe le bon angle ${COURS.replace("6", "4")}.`)]));
      L.push(calcul(sq, lignesR, [], "Module"));
      L.push(calcul(sq, arg.lignes, arg.intro, "Argument"));
      L.push(resultat(sq, reponse(e, phase)));
      break;
    }
    case "bEcran2": {
      if (e.famille !== "B") break;
      const [mod, th] = formatReponseAttenduePhaseLatex(e, phase).map(ligne);
      L.push(utilise(sq, [t("Les n racines ont toutes le même module et leurs arguments sont espacés de "), f("\\dfrac{2\\pi}{n}"), t(" : "), ...formule]));
      const thetas = Array.from({ length: e.n }, (_, k) => ligneCalcul(`\\theta_{${k}}\\approx ${virgule((e.angle.numerique + 2 * k * Math.PI) / e.n)}`, k === 0 ? "on remplace k par 0, 1, …" : undefined));
      L.push(calcul(sq, [ligneCalcul(mod, "racine n-ième du module (calculatrice)"), ligneCalcul(th, "formule des arguments"), ...thetas]));
      L.push({ ...resultat(sq, reponse(e, phase)), figureHtml: figure(e) });
      break;
    }
    case "cEcran1": {
      const a1 = aideNiveau1(e, phase);
      L.push(utilise(sq, [t(`${a1.texte} `), ...(a1.latex ? [f(a1.latex)] : []), t(` ; un nombre dont la puissance n-ième vaut 1 est une racine n-ième de l'unité ${COURS}.`)]));
      L.push(
        calcul(sq, [
          ligneCalcul(`z^{${e.n}}=w^{${e.n}}`, "équation de l'énoncé"),
          ligneCalcul(`\\left(\\dfrac{z}{w}\\right)^{${e.n}}=1`, "on divise par wⁿ (w ≠ 0)"),
          ligneCalcul("\\dfrac{z}{w}=\\zeta_k", "racine n-ième de l'unité"),
          ligneCalcul("z=w\\cdot\\zeta_k", "on multiplie par w"),
        ]),
      );
      L.push(resultat(sq, [f(LIBELLE_RELATION_C.correct)]));
      break;
    }
    case "cEcran2": {
      if (e.famille !== "C") break;
      L.push(utilise(sq, [t("Les racines n-ièmes de l'unité sont "), f(`\\zeta_k=\\cos\\dfrac{2k\\pi}{${e.n}}+i\\sin\\dfrac{2k\\pi}{${e.n}}`), t(", pour "), f(listeK(e.n)), t(` (module 1, arguments espacés de `), f(`\\dfrac{2\\pi}{${e.n}}`), t(").")]));
      L.push(calcul(sq, lignesRacines("", (k) => 2 * k, e.n, e.zetas, "\\zeta", (k) => (k === 0 ? "0" : `\\dfrac{${2 * k}\\pi}{${e.n}}`))));
      L.push(resultat(sq, reponse(e, phase)));
      L.push(sommeNulle(e.zetas, "\\zeta", sq));
      break;
    }
    case "cEcran3": {
      if (e.famille !== "C") break;
      const module = e.r === 1 ? "" : `${e.r}`;
      L.push(utilise(sq, [t("Multiplier w par "), f("\\zeta_k"), t(" (de module 1) garde le module r et ajoute "), f(`\\dfrac{2k\\pi}{${e.n}}`), t(" à l'argument : "), f(`z_k=${module}\\left(\\cos\\left(\\theta+\\dfrac{2k\\pi}{${e.n}}\\right)+i\\sin\\left(\\theta+\\dfrac{2k\\pi}{${e.n}}\\right)\\right)`), t(".")]));
      const th = e.angle.latex;
      L.push(calcul(sq, lignesRacines(module, (k) => e.angle.p * e.n + 2 * k * e.angle.q, e.angle.q * e.n, e.racines, "z", (k) => (k === 0 ? th : `${th === "0" ? "" : `${th}+`}\\dfrac{${2 * k}\\pi}{${e.n}}`))));
      L.push({ ...resultat(sq, reponse(e, phase)), figureHtml: figure(e) });
      break;
    }
  }
  const p = piege(e, phase);
  if (p) L.push(lignePiege(sq, p));
  return L;
}

export function correctionDetailleeRacinesNiemes(e: ExerciceRacinesNiemes): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}
