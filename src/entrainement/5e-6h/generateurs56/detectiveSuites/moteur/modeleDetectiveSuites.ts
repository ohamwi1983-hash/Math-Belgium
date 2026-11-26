// Copie 5e (6h) de `5e-4h/moteur5e/modeleDetectiveSuites.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { FragmentConsigne } from "../../../../export/genererFeuilleExercices";
import type { FractionQ } from "../../../../5e-4h/core5e/suitesGeometriques.types";
import type {
  ContextePourcentage,
  DonneesDetectiveSuites,
  ExerciceArithmetique,
  ExerciceGeometrique,
  ExerciceLimite,
  ExercicePourcentage,
  ExerciceSommeInfinie,
  IdDescriptionSuites,
  ReponseDetectiveSuites,
  TypeErreurSuites,
} from "../core/detectiveSuites.types";
import { diviserFractionQ, fractionQ, fractionQVersNombre, multiplierFractionQ, puissanceFractionQ, soustraireFractionQ } from "../../../../5e-4h/moteur5e/fractionQ";

/**
 * Modèle de 5gen49 « Détective d'erreurs : suites » : la copie de l'élève fictif (avec son erreur),
 * la même résolution sans erreur (corrigé), la ligne fausse et le résultat final attendu. Source
 * UNIQUE pour l'écran, la vérification et l'adaptateur de feuilles.
 *
 * Toutes les lignes sont construites par le même code, avec ou sans l'erreur (`err`) : la copie
 * reste cohérente avec son erreur (chaque ligne suivante est calculée à partir de la ligne fausse).
 * Valeurs exactes (entiers, fractions) partout, sauf la variante « pourcentage » en mode `calcul`
 * (résultat arrondi à l'unité, tolérance d'une unité).
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ---------------------------------------------------------------------------------------------
// Contextes de la variante « pourcentage »
// ---------------------------------------------------------------------------------------------

export const CONTEXTES_POURCENTAGE: ContextePourcentage[] = [
  { sujet: "une ville", verbe: "compte", unite: "habitants", grandeur: "la population de la ville", evolution: "Sa population", sens: ["hausse", "baisse"] },
  { sujet: "la chaîne vidéo d'Inès", verbe: "compte", unite: "abonnés", grandeur: "le nombre d'abonnés de la chaîne", evolution: "Son nombre d'abonnés", sens: ["hausse"] },
  { sujet: "une voiture neuve", verbe: "vaut", unite: "€", grandeur: "la valeur de la voiture", evolution: "Sa valeur", sens: ["baisse"] },
  { sujet: "un parc d'attractions", verbe: "accueille", unite: "visiteurs", grandeur: "le nombre de visiteurs du parc", evolution: "Sa fréquentation", sens: ["hausse", "baisse"] },
  { sujet: "une usine", verbe: "produit", unite: "tonnes", grandeur: "la production annuelle de l'usine", evolution: "Sa production", sens: ["hausse", "baisse"] },
  { sujet: "une colonie d'oiseaux marins", verbe: "compte", unite: "oiseaux", grandeur: "le nombre d'oiseaux de la colonie", evolution: "Son effectif", sens: ["hausse", "baisse"] },
  { sujet: "une commune", verbe: "produit", unite: "tonnes de déchets", grandeur: "la quantité de déchets produite par la commune", evolution: "Cette quantité", sens: ["baisse"] },
  { sujet: "un jeu vidéo", verbe: "compte", unite: "joueurs", grandeur: "le nombre de joueurs du jeu", evolution: "Le nombre de joueurs", sens: ["hausse", "baisse"] },
];

// ---------------------------------------------------------------------------------------------
// Écriture des nombres (LaTeX, virgule décimale, espace des milliers, signe moins)
// ---------------------------------------------------------------------------------------------

/** Nombre décimal en LaTeX : « 12\,500 », « 1{,}04 », « -3 » (au plus `decimales` décimales). */
export function nombreLatex(x: number, decimales = 6): string {
  let v = Number(x.toFixed(decimales));
  if (Object.is(v, -0) || v === 0) v = 0;
  const neg = v < 0;
  const brut = Math.abs(v).toFixed(decimales);
  const [ent, dec] = (brut.includes(".") ? brut.replace(/0+$/, "").replace(/\.$/, "") : brut).split(".");
  const groupe = ent!.length > 3 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  return `${neg ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Fraction : entier, ou `\dfrac{a}{b}` (signe devant). */
export function fractionLatex(f: FractionQ): string {
  if (f.den === 1) return nombreLatex(f.num);
  return `${f.num < 0 ? "-" : ""}\\dfrac{${nombreLatex(Math.abs(f.num))}}{${nombreLatex(f.den)}}`;
}

/** Valeur exacte « lisible » : décimal court (au plus 3 décimales) sinon fraction. */
export function valeurLatex(f: FractionQ): string {
  if (f.den === 1) return nombreLatex(f.num);
  let d = f.den;
  while (d % 2 === 0) d /= 2;
  while (d % 5 === 0) d /= 5;
  const v = fractionQVersNombre(f);
  if (d === 1 && Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9) return nombreLatex(v, 3);
  return fractionLatex(f);
}

/** Met entre parenthèses une écriture qui commence par un signe moins. */
export function par(latex: string): string {
  if (!latex.startsWith("-")) return latex;
  return latex.includes("\\dfrac") ? `\\left(${latex}\\right)` : `(${latex})`;
}

/** Puissance d'une fraction : `2^{3}`, `(-2)^{3}`, `\left(\dfrac{1}{2}\right)^{3}`. */
export function puissanceLatex(base: FractionQ, exposant: number): string {
  if (base.den === 1) return `${par(nombreLatex(base.num))}^{${exposant}}`;
  return `\\left(${fractionLatex(base)}\\right)^{${exposant}}`;
}

/** `a n + b` réduit (« 3n + 4 », « -2n », « n - 5 »). */
export function affineNLatex(a: number, b: number): string {
  const coef = a === 1 ? "" : a === -1 ? "-" : nombreLatex(a);
  const terme = a === 0 ? "" : `${coef}n`;
  if (b === 0) return terme || "0";
  if (!terme) return nombreLatex(b);
  return `${terme} ${b < 0 ? "-" : "+"} ${nombreLatex(Math.abs(b))}`;
}

/** `a × k + b` (calcul d'un terme à partir de la forme réduite). */
function calculAffineLatex(a: number, b: number, k: number): string {
  const debut = `${nombreLatex(a)} \\times ${k}`;
  if (b === 0) return debut;
  return `${debut} ${b < 0 ? "-" : "+"} ${nombreLatex(Math.abs(b))}`;
}

const q = (num: number, den = 1) => fractionQ(num, den);
const inverse = (f: FractionQ) => fractionQ(f.den, f.num);
const absQ = (f: FractionQ) => fractionQ(Math.abs(f.num), f.den);

// ---------------------------------------------------------------------------------------------
// Ligne fausse par type d'erreur (même étape d'une instance à l'autre d'une variante)
// ---------------------------------------------------------------------------------------------

export function indiceLigneFausse(e: DonneesDetectiveSuites): number {
  switch (e.variante) {
    case "arithmetique":
      return e.type === "rangFormule" ? 0 : 2;
    case "geometrique":
      return e.type === "raisonInversee" ? 0 : e.type === "exposant" ? 1 : 2;
    case "pourcentage":
      return e.type === "taux" ? 0 : e.type === "nombreTermes" ? 1 : 2;
    case "convergence":
      return e.support === "limite" ? 1 : e.type === "raisonInversee" ? 0 : 1;
  }
}

export function typeErreur(e: DonneesDetectiveSuites): TypeErreurSuites {
  return e.type;
}

/** Bonne description de l'erreur (écran 2). */
export function descriptionCorrecte(e: DonneesDetectiveSuites): IdDescriptionSuites {
  if (e.variante === "pourcentage" && e.type === "nombreTermes") return "rangAnnee";
  return e.type;
}

export function nombreLignes(e: DonneesDetectiveSuites): number {
  return e.variante === "arithmetique" || e.variante === "geometrique" ? 5 : 4;
}

// ---------------------------------------------------------------------------------------------
// Variante « arithmetique » : somme u_p + … + u_m d'une suite arithmétique (u₁ et r donnés)
// ---------------------------------------------------------------------------------------------

interface CalculArithmetique {
  /** Forme réduite uₙ = a·n + b utilisée par la copie. */
  a: number;
  b: number;
  up: number;
  um: number;
  N: number;
  S: FractionQ;
}

export function calculArithmetique(e: ExerciceArithmetique, avecErreur: boolean): CalculArithmetique {
  const decale = avecErreur && e.type === "rangFormule";
  const a = e.r;
  const b = decale ? e.u1 : e.u1 - e.r;
  const up = a * e.p + b;
  const um = a * e.m + b;
  const N = avecErreur && e.type === "nombreTermes" ? e.m - e.p : e.m - e.p + 1;
  return { a, b, up, um, N, S: fractionQ(N * (up + um), 2) };
}

function lignesArithmetique(e: ExerciceArithmetique, avecErreur: boolean): FragmentConsigne[][] {
  const c = calculArithmetique(e, avecErreur);
  const formule =
    avecErreur && e.type === "rangFormule"
      ? `u_n = u_1 + n \\times r = ${nombreLatex(e.u1)} + n \\times ${par(nombreLatex(e.r))} = ${affineNLatex(c.a, c.b)}`
      : `u_n = u_1 + (n - 1) \\times r = ${nombreLatex(e.u1)} + (n - 1) \\times ${par(nombreLatex(e.r))} = ${affineNLatex(c.a, c.b)}`;
  const compte = avecErreur && e.type === "nombreTermes" ? `${e.m} - ${e.p} = ${c.N}` : `${e.m} - ${e.p} + 1 = ${c.N}`;
  return [
    [t("Formule générale : "), l(formule)],
    [l(`u_{${e.p}} = ${calculAffineLatex(c.a, c.b, e.p)} = ${nombreLatex(c.up)}`), t(" et "), l(`u_{${e.m}} = ${calculAffineLatex(c.a, c.b, e.m)} = ${nombreLatex(c.um)}`)],
    [t("De "), l(`u_{${e.p}}`), t(" à "), l(`u_{${e.m}}`), t(", il y a "), l(compte), t(" termes.")],
    [l(`S = ${c.N} \\times \\dfrac{${nombreLatex(c.up)} ${c.um < 0 ? "-" : "+"} ${nombreLatex(Math.abs(c.um))}}{2}`)],
    [l(`S = ${valeurLatex(c.S)}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Variante « geometrique » : somme u_p + … + u_m d'une suite géométrique (u₁ et u₂ donnés)
// ---------------------------------------------------------------------------------------------

interface CalculGeometrique {
  q: FractionQ;
  exposant: number;
  up: FractionQ;
  N: number;
  S: FractionQ;
}

export function u2Geometrique(e: ExerciceGeometrique | ExerciceSommeInfinie): number {
  return fractionQVersNombre(multiplierFractionQ(q(e.u1), e.q));
}

export function calculGeometrique(e: ExerciceGeometrique, avecErreur: boolean): CalculGeometrique {
  const raison = avecErreur && e.type === "raisonInversee" ? inverse(e.q) : e.q;
  const exposant = avecErreur && e.type === "exposant" ? e.p : e.p - 1;
  const up = multiplierFractionQ(q(e.u1), puissanceFractionQ(raison, exposant));
  const N = avecErreur && e.type === "nombreTermes" ? e.m - e.p : e.m - e.p + 1;
  const S = multiplierFractionQ(up, diviserFractionQ(soustraireFractionQ(q(1), puissanceFractionQ(raison, N)), soustraireFractionQ(q(1), raison)));
  return { q: raison, exposant, up, N, S };
}

function lignesGeometrique(e: ExerciceGeometrique, avecErreur: boolean): FragmentConsigne[][] {
  const c = calculGeometrique(e, avecErreur);
  const u1 = nombreLatex(e.u1);
  const u2 = nombreLatex(u2Geometrique(e));
  const raison = avecErreur && e.type === "raisonInversee" ? `q = \\dfrac{u_1}{u_2} = \\dfrac{${u1}}{${u2}} = ${fractionLatex(c.q)}` : `q = \\dfrac{u_2}{u_1} = \\dfrac{${u2}}{${u1}} = ${fractionLatex(c.q)}`;
  const compte = avecErreur && e.type === "nombreTermes" ? `${e.m} - ${e.p} = ${c.N}` : `${e.m} - ${e.p} + 1 = ${c.N}`;
  return [
    [t("Raison : "), l(raison)],
    [l(`u_{${e.p}} = u_1 \\times q^{${c.exposant}} = ${u1} \\times ${puissanceLatex(c.q, c.exposant)} = ${valeurLatex(c.up)}`)],
    [t("De "), l(`u_{${e.p}}`), t(" à "), l(`u_{${e.m}}`), t(", il y a "), l(compte), t(" termes.")],
    [l(`S = u_{${e.p}} \\times \\dfrac{1 - q^{${c.N}}}{1 - q} = ${par(valeurLatex(c.up))} \\times \\dfrac{1 - ${puissanceLatex(c.q, c.N)}}{1 - ${par(fractionLatex(c.q))}}`)],
    [l(`S = ${valeurLatex(c.S)}`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Variante « pourcentage » : valeur d'une année (évolution de t % par an)
// ---------------------------------------------------------------------------------------------

export function anneeDemandee(e: ExercicePourcentage): number {
  return e.annee1 + e.rang - 1;
}

export function raisonPourcentage(e: ExercicePourcentage): number {
  return 1 + e.t / 100;
}

interface CalculPourcentage {
  q: number;
  rang: number;
  exposant: number;
  valeur: number;
}

export function calculPourcentage(e: ExercicePourcentage, avecErreur: boolean): CalculPourcentage {
  const raison = avecErreur && e.type === "taux" ? Math.abs(e.t) / 100 : raisonPourcentage(e);
  const rang = avecErreur && e.type === "nombreTermes" ? e.rang - 1 : e.rang;
  const exposant = avecErreur && e.type === "exposant" ? rang : rang - 1;
  // Puissance calculée en entiers quand c'est possible (mode exact : valeur entière sans bruit).
  const valeur = e.u1 * raison ** exposant;
  return { q: raison, rang, exposant, valeur: e.mode === "exact" ? Math.round(valeur * 1e6) / 1e6 : valeur };
}

/** Le pourcentage écrit en LaTeX (« 4 », « 2{,}5 »). */
export function pourcentLatex(e: ExercicePourcentage): string {
  return nombreLatex(Math.abs(e.t), 2);
}

function lignesPourcentage(e: ExercicePourcentage, avecErreur: boolean): FragmentConsigne[][] {
  const c = calculPourcentage(e, avecErreur);
  const ctx = CONTEXTES_POURCENTAGE[e.contexte]!;
  const tl = pourcentLatex(e);
  const hausse = e.t > 0;
  const raison =
    avecErreur && e.type === "taux"
      ? `q = \\dfrac{${tl}}{100} = ${nombreLatex(c.q, 4)}`
      : `q = 1 ${hausse ? "+" : "-"} \\dfrac{${tl}}{100} = ${nombreLatex(c.q, 4)}`;
  const Y = anneeDemandee(e);
  const rang = avecErreur && e.type === "nombreTermes" ? `n = ${Y} - ${e.annee1} = ${c.rang}` : `n = ${Y} - ${e.annee1} + 1 = ${c.rang}`;
  const resultat = e.mode === "calcul" ? `u_{${c.rang}} \\approx ${nombreLatex(Math.round(c.valeur), 0)}` : `u_{${c.rang}} = ${nombreLatex(c.valeur, 4)}`;
  return [
    [t(`${hausse ? "Hausse" : "Baisse"} de ${tl.replace("{,}", ",")} % par an : suite géométrique de raison `), l(raison)],
    [t(`L'année ${Y} a le rang `), l(rang)],
    [l(`u_{${c.rang}} = u_1 \\times q^{${c.exposant}} = ${nombreLatex(e.u1)} \\times ${nombreLatex(c.q, 4)}^{${c.exposant}}`)],
    [t(`${majuscule(ctx.grandeur)} en ${Y} : `), l(resultat), t(` ${ctx.unite}.`)],
  ];
}

// ---------------------------------------------------------------------------------------------
// Variante « convergence » : somme infinie, ou limite de P(n)/Q(n)
// ---------------------------------------------------------------------------------------------

export function sommeInfinieExiste(raison: FractionQ): boolean {
  return Math.abs(raison.num) < raison.den;
}

function sommeInfinie(u1: number, raison: FractionQ): FractionQ {
  return diviserFractionQ(q(u1), soustraireFractionQ(q(1), raison));
}

interface CalculSommeInfinie {
  q: FractionQ;
  /** Ce que la copie affirme (existe / n'existe pas). */
  existe: boolean;
  S: FractionQ | null;
}

export function calculSommeInfinie(e: ExerciceSommeInfinie, avecErreur: boolean): CalculSommeInfinie {
  const raison = avecErreur && e.type === "raisonInversee" ? inverse(e.q) : e.q;
  const existe = avecErreur && e.type === "sommeInfinie" ? true : sommeInfinieExiste(raison);
  return { q: raison, existe, S: existe ? sommeInfinie(e.u1, raison) : null };
}

export function troisTermes(e: ExerciceSommeInfinie): number[] {
  return [0, 1, 2].map((k) => fractionQVersNombre(multiplierFractionQ(q(e.u1), puissanceFractionQ(e.q, k))));
}

function lignesSommeInfinie(e: ExerciceSommeInfinie, avecErreur: boolean): FragmentConsigne[][] {
  const c = calculSommeInfinie(e, avecErreur);
  const [u1, u2] = troisTermes(e).map((v) => nombreLatex(v));
  const raison = avecErreur && e.type === "raisonInversee" ? `q = \\dfrac{u_1}{u_2} = \\dfrac{${u1}}{${u2}} = ${fractionLatex(c.q)}` : `q = \\dfrac{u_2}{u_1} = \\dfrac{${u2}}{${u1}} = ${fractionLatex(c.q)}`;
  const condition: FragmentConsigne[] =
    avecErreur && e.type === "sommeInfinie"
      ? [l(`q = ${fractionLatex(c.q)} < 1`), t(" : la somme infinie existe.")]
      : c.existe
        ? [l(`|q| = ${fractionLatex(absQ(c.q))} < 1`), t(" : la somme infinie existe.")]
        : [l(`|q| = ${fractionLatex(absQ(c.q))} \\geq 1`), t(" : la somme infinie n'existe pas.")];
  const formule: FragmentConsigne[] = c.existe
    ? [l(`S_\\infty = \\dfrac{u_1}{1 - q} = \\dfrac{${u1}}{1 - ${par(fractionLatex(c.q))}}`)]
    : [t("La formule "), l("S_\\infty = \\dfrac{u_1}{1 - q}"), t(" ne s'applique donc pas.")];
  const conclusion: FragmentConsigne[] = c.existe ? [l(`S_\\infty = ${valeurLatex(c.S!)}`)] : [t("Conclusion : la somme "), l("u_1 + u_2 + u_3 + \\ldots"), t(" n'existe pas.")];
  return [[t("Raison : "), l(raison)], condition, formule, conclusion];
}

export const degre = (coefs: number[]) => coefs.length - 1;

/** P(n) ou Q(n) en LaTeX (« 3n^{2} - n + 2 »). */
export function polynomeLatex(coefs: number[]): string {
  const d = degre(coefs);
  let s = "";
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = d - i;
    const mono = p === 0 ? "" : p === 1 ? "n" : `n^{${p}}`;
    const abs = Math.abs(c);
    const corps = p === 0 ? nombreLatex(abs) : abs === 1 ? mono : `${nombreLatex(abs)}${mono}`;
    if (s === "") s = `${c < 0 ? "-" : ""}${corps}`;
    else s += ` ${c < 0 ? "-" : "+"} ${corps}`;
  });
  return s || "0";
}

/** Chaque terme c·n^p divisé par n^k : « 3n », « 3 », « \frac{3}{n^{2}} ». */
function diviseLatex(coefs: number[], k: number): string {
  const d = degre(coefs);
  let s = "";
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = d - i - k;
    const abs = Math.abs(c);
    let corps: string;
    if (p === 0) corps = nombreLatex(abs);
    else if (p > 0) corps = `${abs === 1 ? "" : nombreLatex(abs)}${p === 1 ? "n" : `n^{${p}}`}`;
    else corps = `\\frac{${nombreLatex(abs)}}{${p === -1 ? "n" : `n^{${-p}}`}}`;
    if (s === "") s = `${c < 0 ? "-" : ""}${corps}`;
    else s += ` ${c < 0 ? "-" : "+"} ${corps}`;
  });
  return s;
}

export function puissanceN(k: number): string {
  return k === 1 ? "n" : `n^{${k}}`;
}

/** Rapport des coefficients dominants (la « limite » de la copie). */
export function rapportDominants(e: ExerciceLimite): FractionQ {
  return fractionQ(e.P[0]!, e.Q[0]!);
}

function lignesLimite(e: ExerciceLimite, avecErreur: boolean): FragmentConsigne[][] {
  const dp = degre(e.P);
  const dq = degre(e.Q);
  const r = rapportDominants(e);
  const ligne1: FragmentConsigne[] = [t("Degré du numérateur : "), l(`${dp}`), t(" ; degré du dénominateur : "), l(`${dq}`), t(".")];
  if (avecErreur) {
    return [
      ligne1,
      [t("On divise le numérateur par "), l(puissanceN(dp)), t(" et le dénominateur par "), l(puissanceN(dq)), t(" : "), l(`u_n = \\dfrac{${diviseLatex(e.P, dp)}}{${diviseLatex(e.Q, dq)}}`)],
      [t("Quand "), l("n \\to +\\infty"), t(", chaque terme en "), l("\\frac{1}{n}"), t(" tend vers 0 : "), l(`u_n \\to \\dfrac{${nombreLatex(e.P[0]!)}}{${nombreLatex(e.Q[0]!)}}`)],
      [t("La suite converge vers "), l(valeurLatex(r)), t(".")],
    ];
  }
  const division: FragmentConsigne[] = [t("On divise le numérateur ET le dénominateur par "), l(puissanceN(dq)), t(" : "), l(`u_n = \\dfrac{${diviseLatex(e.P, dq)}}{${diviseLatex(e.Q, dq)}}`)];
  if (dp < dq) {
    return [
      ligne1,
      division,
      [t("Quand "), l("n \\to +\\infty"), t(", tous les termes du numérateur tendent vers 0 et le dénominateur tend vers "), l(nombreLatex(e.Q[0]!)), t(" : "), l(`u_n \\to \\dfrac{0}{${nombreLatex(e.Q[0]!)}} = 0`)],
      [t("La suite converge vers "), l("0"), t(".")],
    ];
  }
  const signe = r.num > 0 ? "+" : "-";
  return [
    ligne1,
    division,
    [t("Quand "), l("n \\to +\\infty"), t(", le numérateur tend vers "), l(`${signe}\\infty`), t(" et le dénominateur vers "), l(nombreLatex(e.Q[0]!)), t(" : "), l(`u_n \\to ${signe}\\infty`)],
    [t("La suite diverge : "), l(`\\lim_{n \\to +\\infty} u_n = ${signe}\\infty`), t(".")],
  ];
}

// ---------------------------------------------------------------------------------------------
// Copie, corrigé, réponse
// ---------------------------------------------------------------------------------------------

function lignes(e: DonneesDetectiveSuites, avecErreur: boolean): FragmentConsigne[][] {
  switch (e.variante) {
    case "arithmetique":
      return lignesArithmetique(e, avecErreur);
    case "geometrique":
      return lignesGeometrique(e, avecErreur);
    case "pourcentage":
      return lignesPourcentage(e, avecErreur);
    case "convergence":
      return e.support === "limite" ? lignesLimite(e, avecErreur) : lignesSommeInfinie(e, avecErreur);
  }
}

/** La copie de l'élève fictif (une ligne fausse, la suite cohérente avec elle). */
export function copieEleve(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  return lignes(e, true);
}

/** La résolution correcte, à partir de la ligne fausse (corrigé). */
export function correction(e: DonneesDetectiveSuites): FragmentConsigne[][] {
  return lignes(e, false).slice(indiceLigneFausse(e));
}

/** Résultat final, avec ou sans l'erreur (même représentation que la réponse attendue). */
export function resultat(e: DonneesDetectiveSuites, avecErreur: boolean): ReponseDetectiveSuites {
  const exact = (f: FractionQ): ReponseDetectiveSuites => ({ genre: "nombre", valeur: fractionQVersNombre(f), latex: valeurLatex(f), tolerance: 1e-9, exacte: true });
  switch (e.variante) {
    case "arithmetique":
      return exact(calculArithmetique(e, avecErreur).S);
    case "geometrique":
      return exact(calculGeometrique(e, avecErreur).S);
    case "pourcentage": {
      const v = calculPourcentage(e, avecErreur).valeur;
      return e.mode === "calcul"
        ? { genre: "nombre", valeur: Math.round(v), latex: nombreLatex(Math.round(v), 0), tolerance: 1 + 1e-9, exacte: false }
        : { genre: "nombre", valeur: v, latex: nombreLatex(v, 4), tolerance: 1e-9, exacte: true };
    }
    case "convergence": {
      if (e.support === "sommeInfinie") {
        const c = calculSommeInfinie(e, avecErreur);
        return c.S ? exact(c.S) : { genre: "nexistePas" };
      }
      if (avecErreur) return exact(rapportDominants(e));
      if (degre(e.P) < degre(e.Q)) return exact(q(0));
      return { genre: "infini", signe: rapportDominants(e).num > 0 ? 1 : -1 };
    }
  }
}

/** Réponse attendue à l'écran 3. */
export function reponseAttendue(e: DonneesDetectiveSuites): ReponseDetectiveSuites {
  return resultat(e, false);
}

export function memesResultats(a: ReponseDetectiveSuites, b: ReponseDetectiveSuites): boolean {
  if (a.genre !== b.genre) return false;
  if (a.genre === "nombre" && b.genre === "nombre") return Math.abs(a.valeur - b.valeur) < 1e-9;
  if (a.genre === "infini" && b.genre === "infini") return a.signe === b.signe;
  return true;
}

export function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}
