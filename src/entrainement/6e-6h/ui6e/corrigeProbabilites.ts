import katex from "katex";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../export/corrigeTableau";
import { normaliserLimites } from "../../../lib/notationLog";
import { finaliserCorrige } from "./corrigeLogarithmes1";
import { sansRepetition } from "./corrigeLogarithmes2";
import { COULEURS } from "./figureRepereIntegrales";

/**
 * Briques communes du corrigé détaillé « comme au tableau » du chapitre 6 de 6e (« Les
 * probabilités » : 6gen30–33, 6gen74–76) — règle `.claude/rules/feuilles-evaluations.md`
 * (« Corrigé détaillé — comme au tableau »). SANS `docx` : importé par les adaptateurs papier ET par
 * les générateurs interactifs (corrigé de l'étape révélée).
 *
 * - renvois `COURS_*` aux sections du chapitre (§ 1 à 4) ;
 * - nombres : fraction irréductible (`frac`), fraction brute (`brute`), valeur décimale exacte
 *   (« = 0,25 ») ou arrondie comme l'annoncent les consignes (« ≈ 0,27 », au millième sous 0,1) ;
 * - `lignesFraction` : « = n/d » brute, puis la fraction simplifiée, puis la valeur décimale — une
 *   transformation par ligne ;
 * - figures HTML autonomes (`figureHtml`) : tableau à double entrée, diagrammes de Venn à deux et à
 *   trois ensembles (valeur de chaque zone en KaTeX).
 */

export const COURS_ENSEMBLES = "(cours, § 1)";
export const COURS_ARBRES = "(cours, § 2)";
export const COURS_INDEPENDANCE = "(cours, § 3)";
export const COURS_PROBLEMES = "(cours, § 4)";

export { calcul, latex, ligne, piege, resultat, texte, utilise, verification };

type Fragments = FragmentConsigne[];

// ============================================================================
// Nombres
// ============================================================================

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible (« 3 », « \dfrac{2}{3} », « 0 »). */
export function frac(n: number, d = 1): string {
  if (n === 0) return "0";
  const signe = n < 0 !== d < 0 ? "-" : "";
  const g = pgcd(n, d);
  const a = Math.abs(n) / g;
  const b = Math.abs(d) / g;
  return b === 1 ? `${signe}${a}` : `${signe}\\dfrac{${a}}{${b}}`;
}

/** Fraction telle quelle (non simplifiée). */
export function brute(n: number, d: number): string {
  return `\\dfrac{${n}}{${d}}`;
}

/** Décimal écrit à la française (`{,}`), sans zéros inutiles, `chiffres` décimales au plus. */
export function dec(v: number, chiffres = 8): string {
  const r = Math.round(v * 10 ** chiffres) / 10 ** chiffres;
  return String(Number(r.toFixed(chiffres))).replace(".", "{,}");
}

/** Décimal court exact (au plus 4 décimales) ? */
export function estDecimalCourt(v: number): boolean {
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-7;
}

/** Arrondi annoncé par les consignes : au centième, au millième si la valeur est inférieure à 0,1. */
export function arrondiAnnonce(v: number): string {
  const d = Math.abs(v) < 0.1 ? 3 : 2;
  return (Math.round(v * 10 ** d + 1e-9) / 10 ** d).toFixed(d).replace(".", "{,}");
}

/** « =0{,}25 » (décimal exact) ou « \approx 0{,}27 » (arrondi annoncé) ; « » pour un entier. */
export function suffixeDecimal(v: number): string {
  if (Math.abs(v - Math.round(v)) < 1e-12) return "";
  return estDecimalCourt(v) ? `=${dec(v, 4)}` : `\\approx ${arrondiAnnonce(v)}`;
}

/** Probabilité n/d : fraction irréductible puis valeur décimale (« \dfrac{3}{8}=0{,}375 »). */
export function valeur(n: number, d: number): string {
  return `${frac(n, d)}${suffixeDecimal(n / d)}`;
}

/** Écriture décimale d'une probabilité réelle : exacte, ou arrondie (avec « ≈ » dans `valeurDec`). */
export function valeurDec(v: number): string {
  return estDecimalCourt(v) ? dec(v, 4) : `${arrondiAnnonce(v)}`;
}

/**
 * Lignes d'une probabilité n/d : « gauche = n/d » (fraction brute), puis « = » la fraction
 * simplifiée si elle diffère, puis « = » ou « ≈ » la valeur décimale. `gauche` vide : la première
 * ligne commence par « = » (elle continue la chaîne précédente).
 */
export function lignesFraction(gauche: string, n: number, d: number, justification?: string | Fragments): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${brute(n, d)}`, justification)];
  const r = frac(n, d);
  const g = pgcd(n, d);
  if (r !== brute(n, d)) lignes.push(ligne(`=${r}`, d / g === 1 ? undefined : `on simplifie par ${g}`));
  const s = suffixeDecimal(n / d);
  if (s) lignes.push(ligne(s, s.startsWith("=") ? "valeur décimale" : Math.abs(n / d) < 0.1 ? "arrondi au millième" : "arrondi au centième"));
  return lignes;
}

/** Comme `lignesFraction`, mais la valeur non décimale courte est arrondie à 10⁻⁴ (générateurs dont
 * l'écran affiche « ≈ 0,2371 », 6gen32). */
export function lignesFraction4(gauche: string, n: number, d: number, justification?: string | Fragments): LigneCalcul[] {
  const lignes = lignesFraction(gauche, n, d, justification);
  const v = n / d;
  if (estDecimalCourt(v) || Math.abs(v - Math.round(v)) < 1e-12) return lignes;
  return [...lignes.filter((l) => !l.latex.startsWith("\\approx")), ligne(`\\approx ${dec(Math.round(v * 1e4) / 1e4, 4)}`, "valeur arrondie à 0,0001")];
}

/** « = » décimal exact (≤ 4 décimales) ou « ≈ » arrondi à 10⁻⁴ d'un réel. */
export function egal4(v: number): string {
  return estDecimalCourt(v) ? `=${dec(v, 4)}` : `\\approx ${dec(Math.round(v * 1e4) / 1e4, 4)}`;
}

/** Fraction simplifiée puis décimal, à la suite d'une chaîne qui vient d'écrire `n/d` brute. */
export function lignesSimplifier(n: number, d: number): LigneCalcul[] {
  return lignesFraction("", n, d).slice(1);
}

/** « gauche = a/b × c/d × … » (fractions brutes), puis le produit effectué, simplifié, décimal. */
export function lignesProduit(gauche: string, facteurs: [number, number][], justification = "règle du produit"): LigneCalcul[] {
  const num = facteurs.reduce((x, f) => x * f[0], 1);
  const den = facteurs.reduce((x, f) => x * f[1], 1);
  const ecrit = facteurs.map(([n, d]) => brute(n, d)).join("\\times ");
  if (facteurs.length === 1) return lignesFraction(gauche, num, den, justification);
  return [ligne(`${gauche}=${ecrit}`, justification), ...lignesFraction("", num, den, "on multiplie numérateurs et dénominateurs")];
}

function ppcm(a: number, b: number): number {
  return (a / pgcd(a, b)) * b;
}

/** « gauche = a/b + c/d + … » (fractions telles que données), puis au même dénominateur, la somme,
 * simplifiée, décimale. */
export function lignesSommeFractions(gauche: string, termes: [number, number][], justification = "événements incompatibles : on additionne"): LigneCalcul[] {
  const L = termes.reduce((x, t) => ppcm(x, t[1]), 1);
  const nums = termes.map(([n, d]) => n * (L / d));
  const S = nums.reduce((x, y) => x + y, 0);
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${termes.map(([n, d]) => frac(n, d)).join("+")}`, justification)];
  if (termes.some(([n, d]) => frac(n, d) !== brute(n * (L / d), L))) lignes.push(ligne(`=${nums.map((n) => brute(n, L)).join("+")}`, `même dénominateur ${L}`));
  return [...lignes, ...lignesFraction("", S, L)];
}

/** « gauche = 1 − P(contraire) », remplie (n/d), puis 1 − n/d calculé, simplifié, décimal. */
export function lignesComplement(gauche: string, contraire: string, n: number, d: number): LigneCalcul[] {
  return [ligne(`${gauche}=1-${contraire}`, "événement contraire"), ligne(`=1-${frac(n, d)}`), ...lignesFraction("", d / pgcd(n, d) - n / pgcd(n, d), d / pgcd(n, d), [texte("car "), latex(`1=${brute(d / pgcd(n, d), d / pgcd(n, d))}`)])];
}

/** Liste « a, b et c » de formules. */
export function listeEt(formules: string[]): Fragments {
  const f: Fragments = [];
  formules.forEach((x, i) => {
    if (i > 0) f.push(texte(i === formules.length - 1 ? " et " : ", "));
    f.push(latex(x));
  });
  return f;
}

/** « Ce qu'on utilise » suivi du renvoi au cours. */
export function utiliseCours(sq: string, fragments: Fragments, renvoi: string): EtapeCorrection {
  return utilise(sq, [...fragments, texte(` ${renvoi}.`)]);
}

/** Finition des corrigés du chapitre : lignes répétées retirées, fractions lisibles, justifications
 * insécables. */
export function finaliser(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return finaliserCorrige(etapes.map((e) => (e.calcul ? { ...e, calcul: sansRepetition(e.calcul) } : e)));
}

// ============================================================================
// Figures HTML (corrigé ; écran ET papier)
// ============================================================================

function rendre(expr: string): string {
  return katex.renderToString(normaliserLimites(expr), { throwOnError: false });
}

const BORD = "border:1px solid #888;padding:0.35em 0.9em;text-align:center;min-width:3.6em";

/** Tableau à double entrée : en-têtes (LaTeX), valeurs (LaTeX) ; `null` = inconnue, marquée « ? »
 * (jamais une case vide, qui passerait pour une place de réponse). */
export function tableauDoubleHtml(entetesLignes: string[], entetesColonnes: string[], valeurs: (string | null)[][]): string {
  let h = `<table style="border-collapse:collapse;margin:0.5em auto"><tr><th style="${BORD}"></th>`;
  for (const c of entetesColonnes) h += `<th style="${BORD}">${rendre(c)}</th>`;
  h += "</tr>";
  valeurs.forEach((ligneV, i) => {
    h += `<tr><th style="${BORD}">${rendre(entetesLignes[i])}</th>`;
    for (const v of ligneV) h += `<td style="${BORD}">${v === null ? '<span style="color:#8a8f98">?</span>' : rendre(v)}</td>`;
    h += "</tr>";
  });
  return `${h}</table>`;
}

const POLICE = "Georgia, 'Times New Roman', serif";

/** Étiquette centrée en (x, y) d'une figure W × H, positionnée EN POURCENTAGES : quand la carte est
 * plus étroite que la figure (téléphone), le SVG rétrécit (`max-width:100%`) et les étiquettes suivent
 * (en px, elles restaient en place et glissaient sur les contours). */
function placer(x: number, y: number, v: string, W: number, H: number): string {
  return `<span style="position:absolute;left:${((100 * x) / W).toFixed(2)}%;top:${((100 * y) / H).toFixed(2)}%;transform:translate(-50%,-50%);white-space:nowrap">${rendre(v)}</span>`;
}

/** Valeur d'une zone dessinée DANS le SVG (entier, décimal `{,}`, `\\dfrac{a}{b}`, « ? ») : la figure
 * reste juste quand elle rétrécit, et le Word (qui ne rasterise que le `<svg>`) garde les valeurs.
 * Autre écriture → `null` (étiquette KaTeX en HTML, `placer`). */
function etiquetteSvg(x: number, y: number, v: string): string | null {
  const t = (txt: string, yb: number, couleur = COULEURS.encre) => `<text x="${x}" y="${yb}" text-anchor="middle" font-size="16" font-family="${POLICE}" fill="${couleur}">${txt}</text>`;
  const nombre = (m: string) => m.replace("{,}", ",").replace(/^-/, "−");
  if (v === "?") return t("?", y + 6, "#8a8f98");
  if (/^-?\d+(\{,\}\d+)?$/.test(v)) return t(nombre(v), y + 6);
  const f = /^(-?)\\d?frac\{(\d+)\}\{(\d+)\}$/.exec(v);
  if (!f) return null;
  const largeur = 9 * Math.max(f[2].length, f[3].length) + 6;
  const signe = f[1] ? `<text x="${x - largeur / 2 - 7}" y="${y + 6}" text-anchor="middle" font-size="16" font-family="${POLICE}" fill="${COULEURS.encre}">−</text>` : "";
  return `${signe}${t(f[2], y - 5)}<line x1="${x - largeur / 2}" y1="${y}" x2="${x + largeur / 2}" y2="${y}" stroke="${COULEURS.encre}" stroke-width="1.1"/>${t(f[3], y + 17)}`;
}

/** Étiquettes d'une figure : dans le SVG quand c'est possible, sinon en HTML (KaTeX) par-dessus. */
function etiquettes(liste: [number, number, string][], W: number, H: number): { svg: string; html: string } {
  let svg = "";
  let html = "";
  for (const [x, y, v] of liste) {
    const e = etiquetteSvg(x, y, v);
    if (e !== null) svg += e;
    else html += placer(x, y, v, W, H);
  }
  return { svg, html };
}

/** Cadre d'une figure W × H qui rétrécit en gardant ses proportions (SVG à 100 %, étiquettes en %). */
function cadreFigure(libelle: string, W: number, H: number, contenu: string): string {
  return `<div role="img" aria-label="${libelle}" style="position:relative;width:${W}px;max-width:100%;aspect-ratio:${W} / ${H};margin:0.5em auto">${contenu}</div>`;
}

/** Diagramme de Venn à deux ensembles dans l'univers Ω : une valeur (LaTeX) par zone. */
export function vennDeuxHtml(valeurs: { aSeul: string; ab: string; bSeul: string; dehors: string }, libelle: string, noms: [string, string] = ["A", "B"]): string {
  const W = 340;
  const H = 200;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="position:absolute;left:0;top:0" aria-hidden="true">`;
  svg += `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="6" fill="none" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
  svg += `<circle cx="130" cy="104" r="70" fill="${COULEURS.accentDoux}" fill-opacity="0.55" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  svg += `<circle cx="210" cy="104" r="70" fill="${COULEURS.bonDoux}" fill-opacity="0.55" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  svg += `<text x="70" y="38" font-size="17" font-style="italic" font-family="${POLICE}" fill="${COULEURS.encre}">${noms[0]}</text>`;
  svg += `<text x="260" y="38" font-size="17" font-style="italic" font-family="${POLICE}" fill="${COULEURS.encre}">${noms[1]}</text>`;
  svg += `<text x="14" y="26" font-size="15" font-family="${POLICE}" fill="${COULEURS.doux}">Ω</text>`;
  const et = etiquettes(
    [
      [98, 108, valeurs.aSeul],
      [170, 108, valeurs.ab],
      [242, 108, valeurs.bSeul],
      [305, 170, valeurs.dehors],
    ],
    W,
    H,
  );
  return cadreFigure(libelle, W, H, `${svg}${et.svg}</svg>${et.html}`);
}

/** Les 8 zones d'un diagramme de Venn à trois ensembles A, B, C (Ω compris). Clé = appartenance à
 * A, B, C (« 110 » : dans A et B, pas dans C). */
export type ZoneVennTrois = "111" | "110" | "101" | "011" | "100" | "010" | "001" | "000";
export const ZONES_VENN_TROIS: readonly ZoneVennTrois[] = ["111", "110", "101", "011", "100", "010", "001", "000"];

/** Position (centre de l'étiquette) de chaque zone dans `vennTroisHtml` (viewBox 340 × 300). */
const POSITION_ZONE: Record<ZoneVennTrois, [number, number]> = {
  "111": [170, 152],
  "110": [170, 98],
  "101": [136, 166],
  "011": [204, 166],
  "100": [104, 104],
  "010": [236, 104],
  "001": [170, 226],
  "000": [44, 268],
};

/**
 * Diagramme de Venn à trois ensembles A, B (en haut) et C (en bas) dans l'univers Ω : une valeur
 * (LaTeX) par zone ; `null` = zone sans étiquette ; `"?"` s'écrit tel quel. Les disques sont
 * TRANSPARENTS (contours seulement, trois tracés distincts — plein, tirets, pointillés — pour rester
 * lisibles en noir et blanc), les noms à l'extérieur des disques. Largeur 340 px (tient à 390 px).
 * `surligner` : zones teintées (ex. l'événement demandé), jamais dans un énoncé où ce serait la
 * réponse.
 */
export function vennTroisHtml(valeurs: Partial<Record<ZoneVennTrois, string | null>>, libelle: string, options: { noms?: [string, string, string]; surligner?: readonly ZoneVennTrois[] } = {}): string {
  const W = 340;
  const H = 300;
  const noms = options.noms ?? ["A", "B", "C"];
  const r = 74;
  const cA: [number, number] = [128, 118];
  const cB: [number, number] = [212, 118];
  const cC: [number, number] = [170, 190];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" height="100%" style="position:absolute;left:0;top:0" aria-hidden="true">`;
  svg += `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="6" fill="none" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
  const surl = options.surligner ?? [];
  if (surl.length) {
    // Teinte des zones demandées : un masque par zone (intersection / exclusion des trois disques),
    // construit avec des clipPath imbriqués et des masques — identifiants dérivés du libellé.
    const id = `v3${libelle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}${surl.join("")}`;
    const disque = (c: [number, number]) => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}"/>`;
    const centres = [cA, cB, cC];
    svg += "<defs>";
    centres.forEach((c, i) => {
      svg += `<clipPath id="${id}c${i}">${disque(c)}</clipPath>`;
      svg += `<mask id="${id}m${i}"><rect x="0" y="0" width="${W}" height="${H}" fill="white"/><circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="black"/></mask>`;
    });
    svg += "</defs>";
    for (const z of surl) {
      // Rectangle plein, découpé : dans chaque disque « 1 » (clipPath), hors de chaque disque « 0 » (mask).
      let el = `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="${COULEURS.accentDoux}" fill-opacity="0.9"/>`;
      for (let i = 0; i < 3; i++) el = z[i] === "1" ? `<g clip-path="url(#${id}c${i})">${el}</g>` : `<g mask="url(#${id}m${i})">${el}</g>`;
      svg += el;
    }
  }
  svg += `<circle cx="${cA[0]}" cy="${cA[1]}" r="${r}" fill="none" stroke="${COULEURS.encre}" stroke-width="1.5"/>`;
  svg += `<circle cx="${cB[0]}" cy="${cB[1]}" r="${r}" fill="none" stroke="${COULEURS.encre}" stroke-width="1.5" stroke-dasharray="7 4"/>`;
  svg += `<circle cx="${cC[0]}" cy="${cC[1]}" r="${r}" fill="none" stroke="${COULEURS.encre}" stroke-width="1.6" stroke-dasharray="2 3"/>`;
  svg += `<text x="38" y="52" font-size="17" font-style="italic" font-family="${POLICE}" fill="${COULEURS.encre}">${noms[0]}</text>`;
  svg += `<text x="290" y="52" font-size="17" font-style="italic" font-family="${POLICE}" fill="${COULEURS.encre}">${noms[1]}</text>`;
  svg += `<text x="252" y="268" font-size="17" font-style="italic" font-family="${POLICE}" fill="${COULEURS.encre}">${noms[2]}</text>`;
  svg += `<text x="14" y="26" font-size="15" font-family="${POLICE}" fill="${COULEURS.doux}">Ω</text>`;
  const liste: [number, number, string][] = [];
  for (const z of ZONES_VENN_TROIS) {
    const v = valeurs[z];
    if (v !== null && v !== undefined) liste.push([...POSITION_ZONE[z], v]);
  }
  const et = etiquettes(liste, W, H);
  return cadreFigure(libelle, W, H, `${svg}${et.svg}</svg>${et.html}`);
}
