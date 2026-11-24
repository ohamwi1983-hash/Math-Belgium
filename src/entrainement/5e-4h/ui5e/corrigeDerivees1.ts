import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ValeurLigne2Tableau, ValeurSigneTableau } from "../core5e/etudeLocale.types";
import type { TableauEtudeLocaleAttendu } from "../moteur5e/verificationEtudeLocale";
import { finaliser, jf, largeurVisible, lignesValeur, monomesDe, nbT, par, polyLatex, sansDoublons, type Poly } from "./corrigeLimites";
import { fracQ, pgcd, q, qAdd, qMul, qVal, type Q } from "./corrigeTrigonometrie1";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 5 de 5e (« Dérivées et
 * applications »), première moitié : 5gen25 (association), 5gen26 (définition), 5gen27 (fonction
 * dérivée), 5gen28 (tangentes), 5gen29 (étude locale), 5gen30 (lecture graphique) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ». SANS
 * `docx` : importé par les générateurs interactifs ET par les adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de
 *   `content/chapters/5e-4h/derivees-applications.ts`).
 * - Rationnels `Q` (`corrigeTrigonometrie1.ts`), polynômes entiers à coefficients ascendants
 *   (`corrigeLimites.ts`) : valeur en un point entier ou fractionnaire, dérivée terme à terme,
 *   trinôme unitaire = 0, tangente distribuée puis réduite.
 * - Tableau de signes en LaTeX (`tableauSignesEtudeLatex`, sorti de l'adaptateur de 5gen29 qui importe
 *   `docx`) et phrases « f est croissante sur … » tirées du MÊME tableau attendu que l'écran.
 */

export const COURS_DEFINITION = "(cours, § 1)";
export const COURS_TANGENTES = "(cours, § 2)";
export const COURS_DERIVEE = "(cours, § 3)";
export const COURS_SIGNE = "(cours, § 4)";
export const COURS_ETUDE = "(cours, § 5)";
export const COURS_LECTURE = "(cours, § 6)";

export type Fragments = FragmentConsigne[];
export const t = texte;
export const f = latex;
export { finaliser, jf, largeurVisible, nbT, par, polyLatex, sansDoublons, q, qAdd, qMul, qVal, fracQ, pgcd };
export type { Poly, Q };

// ============================================================================
// Écritures.
// ============================================================================

/** Fraction réduite, signe devant (« -\dfrac{3}{4} », « 5 »). */
export function qL(x: Q): string {
  return fracQ(x);
}

/** Rationnel entre parenthèses s'il est négatif ou fractionnaire (base d'une puissance, facteur). */
export function qPar(x: Q): string {
  if (x.d === 1) return par(x.n);
  return `\\left(${qL(x)}\\right)`;
}

/** « h », « h+2 », « h-3 ». */
export function hPlus(c: number): string {
  if (c === 0) return "h";
  return c > 0 ? `h+${c}` : `h-${-c}`;
}

/** « x », « x-2 », « x+3 ». */
export function xMoins(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `x-${r}` : `x+${-r}`;
}

/** Coefficient devant un facteur : « 3(h+2) », « (h+2) », « -(h+2) ». */
export function coefFacteur(c: number, facteur: string): string {
  if (c === 1) return facteur;
  if (c === -1) return `-${facteur}`;
  return `${c}${facteur}`;
}

/** Terme signé pour une somme : « +5 », « -3 », « » pour 0 en tête (`premier`). */
export function signe(v: number, premier = false): string {
  if (premier) return `${v}`;
  return v < 0 ? `${v}` : `+${v}`;
}

/** Somme de termes LaTeX déjà signés (« -… » ou non) : « a+b-c ». Termes vides ignorés. */
export function somme(termes: string[]): string {
  const ts = termes.filter((x) => x !== "" && x !== "0" && x !== "+0" && x !== "-0");
  if (ts.length === 0) return "0";
  return ts.map((x, i) => (i === 0 ? x.replace(/^\+/, "") : x.startsWith("-") || x.startsWith("+") ? x : `+${x}`)).join("");
}

/** Monôme c·vᵏ (« 3x^{2} », « -h », « 7 »), « » pour c = 0. */
export function monome(c: number, k: number, v = "x"): string {
  if (c === 0) return "";
  const variable = k === 0 ? "" : k === 1 ? v : `${v}^{${k}}`;
  if (k === 0) return `${c}`;
  if (c === 1) return variable;
  if (c === -1) return `-${variable}`;
  return `${c}${variable}`;
}

/** Polynôme (coefficients ascendants) dans la variable `v` (« 2h^{2}-12h+19 »). */
export function polyV(p: number[], v = "x"): string {
  return polyLatex(p, v);
}

/** Droite y = mx + p à coefficients entiers (« 5x-3 », « -x », « 4 ») — même écriture que l'écran. */
export function droiteEntiere(m: number, p: number): string {
  let out = "";
  if (m !== 0) out = m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
  if (p !== 0 || out === "") out += out === "" ? `${p}` : p > 0 ? `+${p}` : `${p}`;
  return out;
}

/** Membres d'une égalité « A=B=C » coupés aux « = » de niveau 0 (accolades comprises). */
export function membresEgalite(l: string): string[] {
  const out: string[] = [];
  let prof = 0;
  let debut = 0;
  for (let i = 0; i < l.length; i++) {
    const c = l[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "{") prof++;
    else if (c === "}") prof--;
    else if (c === "=" && prof === 0) {
      out.push(l.slice(debut, i));
      debut = i + 1;
    }
  }
  out.push(l.slice(debut));
  return out;
}

/** Dernier membre d'une égalité de l'écran (« f'(2)=-\dfrac{5}{4} » → « -\dfrac{5}{4} »). */
export function dernierMembre(l: string): string {
  const m = membresEgalite(l);
  return m[m.length - 1];
}

/** Formules séparées par des virgules, « et » avant la dernière. */
export function liste(formules: string[]): Fragments {
  return formules.flatMap((l, i) => [...(i === 0 ? [] : [t(i === formules.length - 1 ? " et " : ", ")]), f(l)]);
}

// ============================================================================
// Polynômes entiers (coefficients ascendants) : valeur, dérivée.
// ============================================================================

/** Valeur d'un polynôme en un point entier OU fractionnaire, une transformation par ligne. */
export function lignesValeurPoly(gauche: string, p: number[], x: Q, justification?: string | Fragments): { lignes: LigneCalcul[]; valeur: Q } {
  const valeur = p.reduce((s, c, k) => qAdd(s, qMul(q(c), puissanceQ(x, k))), q(0));
  if (x.d === 1) {
    const m = monomesDe(polyLatex(p)) ?? [];
    return { lignes: lignesValeur(gauche, m, x.n, justification ?? `on remplace x par ${nbT(x.n)}`).lignes, valeur };
  }
  const termes: { c: number; k: number }[] = [];
  for (let k = p.length - 1; k >= 0; k--) if (p[k]) termes.push({ c: p[k], k });
  const base = qPar(x);
  const sub = termes.map(({ c, k }, i) => {
    const s = c < 0 ? "-" : i === 0 ? "" : "+";
    if (k === 0) return `${s}${Math.abs(c)}`;
    const coef = Math.abs(c) === 1 ? "" : `${Math.abs(c)}\\cdot `;
    if (k > 1) return `${s}${coef}${base}^{${k}}`;
    // Facteur du premier degré : parenthèses s'il est négatif, sauf en tête sans coefficient.
    const seulEnTete = s === "" && coef === "";
    return `${s}${coef}${x.n < 0 && !seulEnTete ? base : qL(x)}`;
  });
  const valeurs = termes.map(({ c, k }) => qMul(q(c), puissanceQ(x, k)));
  const D = valeurs.reduce((m, v) => (m * v.d) / pgcd(m, v.d), 1);
  const termesQ = somme(valeurs.map((v) => qL(v)));
  const numerateurs = valeurs.map((v) => v.n * (D / v.d));
  const lignes = [
    ligne(`${gauche}=${sub.join("")}`, justification ?? jf("on remplace x par ", { l: qL(x) })),
    ligne(`=${termesQ}`, "on calcule chaque terme"),
    ligne(`=\\dfrac{${somme(numerateurs.map((n) => `${n}`))}}{${D}}`, `même dénominateur ${D}`),
    ligne(`=${qL(valeur)}`),
  ];
  return { lignes: sansDoublons(lignes), valeur };
}

export function puissanceQ(x: Q, k: number): Q {
  let r = q(1);
  for (let i = 0; i < k; i++) r = qMul(r, x);
  return r;
}

/** Dérivée d'un polynôme entier, terme à terme : « n·c·xⁿ⁻¹ » écrit, puis réduit. */
export function lignesDeriveePoly(gauche: string, p: number[]): { lignes: LigneCalcul[]; derivee: number[] } {
  const derivee = p.slice(1).map((c, i) => (i + 1) * c);
  const termes: string[] = [];
  for (let k = p.length - 1; k >= 1; k--) {
    const c = p[k];
    if (!c) continue;
    if (k === 1) termes.push(`${c}`);
    else {
      const v = k - 1 === 1 ? "x" : `x^{${k - 1}}`;
      termes.push(c === 1 ? `${k}${v}` : c === -1 ? `-${k}${v}` : `${k}\\cdot ${par(c)}${v}`);
    }
  }
  const lignes = sansDoublons([
    ligne(`${gauche}=${somme(termes)}`, jf("on dérive terme à terme : ", { l: "(x^n)'=n\\,x^{n-1}" }, ", la constante disparaît")),
    ligne(`=${polyLatex(derivee)}`, "on calcule chaque coefficient"),
  ]);
  return { lignes, derivee };
}

// ============================================================================
// Trinôme unitaire x² + Bx + C = 0 (après division par le coefficient de x²).
// ============================================================================

export interface RacineExacte {
  /** Écriture LaTeX (« 2 », « 1-\sqrt{3} »). */
  latex: string;
  valeur: number;
}

/** Racine carrée simplifiée : √n = s√t (t sans facteur carré). */
export function racineSimplifiee(n: number): { s: number; t: number } {
  let s = 1;
  let t = n;
  for (let k = 2; k * k <= t; k++) {
    while (t % (k * k) === 0) {
      t /= k * k;
      s *= k;
    }
  }
  return { s, t };
}

/** e ± s√t écrit simplement (« 1-\sqrt{3} », « -2+2\sqrt{5} », « \sqrt{2} »). */
export function centrePlusRacine(e: number, s: number, t: number, signeRacine: 1 | -1): string {
  const r = `${s === 1 ? "" : s}\\sqrt{${t}}`;
  if (e === 0) return signeRacine < 0 ? `-${r}` : r;
  return `${e}${signeRacine < 0 ? "-" : "+"}${r}`;
}

/**
 * Lignes « \iff » qui résolvent x² + Bx + C = 0 (B, C entiers), à la suite d'une première ligne
 * déjà écrite par l'appelant. Mise en évidence (C = 0), identité remarquable (Δ = 0), sinon Δ et la
 * formule (racines entières, ou e ± s√t simplifiées). Renvoie aussi les racines triées.
 */
export function lignesTrinomeUnitaireNul(B: number, C: number): { lignes: LigneCalcul[]; racines: RacineExacte[] } {
  const tri = polyLatex([C, B, 1]);
  if (C === 0) {
    const r = -B;
    const rs = [0, r].sort((u, v) => u - v);
    return {
      lignes: [ligne(`\\iff x(${xMoins(r)})=0`, "on met x en évidence"), ligne(`\\iff x=${rs[0]}\\text{ ou }x=${rs[1]}`, "un produit est nul si l'un des facteurs est nul")],
      racines: rs.map((v) => ({ latex: `${v}`, valeur: v })),
    };
  }
  const delta = B * B - 4 * C;
  if (delta === 0) {
    const r = -B / 2;
    return {
      lignes: [ligne(`\\iff (${xMoins(r)})^{2}=0`, r > 0 ? "identité remarquable a² − 2ab + b²" : "identité remarquable a² + 2ab + b²"), ligne(`\\iff x=${r}`, "un carré est nul si ce qu'il contient est nul")],
      racines: [{ latex: `${r}`, valeur: r }],
    };
  }
  const lignes: LigneCalcul[] = [
    ligne(`\\Delta=${par(B)}^{2}-4\\cdot 1\\cdot ${par(C)}`, [t("discriminant de "), f(tri)]),
    ligne(`=${delta}`),
  ];
  const { s, t: tt } = racineSimplifiee(delta);
  if (tt === 1) {
    const r1 = (-B - s) / 2;
    const r2 = (-B + s) / 2;
    lignes.push(
      ligne(`x_1=\\dfrac{${-B}-\\sqrt{${delta}}}{2}`, [f("x_1=\\frac{-b-\\sqrt{\\Delta}}{2a}")]),
      ligne(`=${r1}`, [t("car "), f(`\\sqrt{${delta}}=${s}`)]),
      ligne(`x_2=\\dfrac{${-B}+\\sqrt{${delta}}}{2}`, [f("x_2=\\frac{-b+\\sqrt{\\Delta}}{2a}")]),
      ligne(`=${r2}`),
    );
    return { lignes, racines: [{ latex: `${r1}`, valeur: r1 }, { latex: `${r2}`, valeur: r2 }] };
  }
  // Racines irrationnelles : √Δ = s√t ; ici B et s sont pairs (Δ = 4r), on divise par 2.
  const racines: RacineExacte[] = [];
  for (const [nom, sg] of [["x_1", -1], ["x_2", 1]] as const) {
    const brut = `\\dfrac{${-B}${sg < 0 ? "-" : "+"}\\sqrt{${delta}}}{2}`;
    lignes.push(ligne(`${nom}=${brut}`, [f(sg < 0 ? "x_1=\\frac{-b-\\sqrt{\\Delta}}{2a}" : "x_2=\\frac{-b+\\sqrt{\\Delta}}{2a}")]));
    if (s > 1) lignes.push(ligne(`=\\dfrac{${-B}${sg < 0 ? "-" : "+"}${s}\\sqrt{${tt}}}{2}`, [t("car "), f(`\\sqrt{${delta}}=${s}\\sqrt{${tt}}`)]));
    let ecrit: string;
    if (B % 2 === 0 && s % 2 === 0) {
      ecrit = centrePlusRacine(-B / 2, s / 2, tt, sg);
      lignes.push(ligne(`=${ecrit}`, "on divise chaque terme par 2"));
    } else ecrit = brut;
    racines.push({ latex: ecrit, valeur: (-B + sg * Math.sqrt(delta)) / 2 });
  }
  return { lignes, racines };
}

// ============================================================================
// Tangente : y = f(a) + f'(a)(x − a), distribuée puis réduite (valeurs entières).
// ============================================================================

export function lignesTangenteEntiere(a: number, fa: number, fpa: number, droiteFinale: string): LigneCalcul[] {
  const pente = fpa === 0 ? "+0" : fpa === 1 ? "+" : fpa === -1 ? "-" : fpa < 0 ? `${fpa}` : `+${fpa}`;
  const facteur = a === 0 ? "x" : `(${xMoins(a)})`;
  const lignes: LigneCalcul[] = [
    ligne(`y=${fa}${fpa === 0 ? `+0\\cdot ${facteur}` : `${pente}${facteur}`}`, jf("on remplace ", { l: `f(${a})=${fa}` }, " et ", { l: `f'(${a})=${fpa}` })),
  ];
  if (fpa !== 0 && a !== 0) {
    lignes.push(ligne(`=${somme([fa === 0 ? "" : `${fa}`, monome(fpa, 1), `${-fpa * a}`])}`, fpa === 1 ? "on supprime les parenthèses" : `on distribue ${nbT(fpa)}`));
  }
  lignes.push(ligne(`=${droiteFinale}`, fpa === 0 ? "0 fois un nombre vaut 0" : "on réduit"));
  return sansDoublons(lignes);
}

// ============================================================================
// Tableau de signes (5gen29, 5gen30) et phrases de monotonie / concavité.
// ============================================================================

function signeLatex(v: ValeurSigneTableau): string {
  return v === "∄" ? "\\|" : v;
}

function ligne2Latex(v: ValeurLigne2Tableau | null): string {
  switch (v) {
    case null:
      return "\\|";
    case "↗":
      return "\\nearrow";
    case "↘":
      return "\\searrow";
    case "∪":
      return "\\cup";
    case "∩":
      return "\\cap";
    case "max":
      return "\\text{max}";
    case "min":
      return "\\text{min}";
    case "ni_lun_ni_lautre":
      return "\\text{ni max ni min}";
    case "pi":
      return "\\text{PI}";
    case "pas_de_pi":
      return "\\text{pas de PI}";
  }
}

/** Tableau (environnement `array`) : ligne x (−∞, en-têtes des colonnes, +∞), ligne du signe de la
 * dérivée, ligne des variations (f') ou de la concavité (f'') de f. `entetes` : une entrée par
 * colonne de `attendu` (« » pour une zone). */
export function tableauSignesEtudeLatex(attendu: TableauEtudeLocaleAttendu, entetes: string[], mode: "fprime" | "fseconde"): string {
  const n = attendu.colonnes.length;
  const ligneT = (libelle: string, cellules: string[]) => [libelle, "", ...cellules, ""].join(" & ");
  return [
    `\\begin{array}{c|${"c".repeat(n + 2)}}`,
    `${ligneT("x", entetes).replace(/^x &  &/, "x & -\\infty &").replace(/ & $/, " & +\\infty")} \\\\ \\hline`,
    `${ligneT(mode === "fprime" ? "f'(x)" : "f''(x)", attendu.signes.map(signeLatex))} \\\\ \\hline`,
    `${ligneT("f(x)", attendu.ligne2.map(ligne2Latex))}`,
    "\\end{array}",
  ].join(" ");
}

export interface ZoneTableau {
  /** Bornes LaTeX (« -\infty », « 2 », « 1+\sqrt{3} »). */
  gauche: string;
  droite: string;
  /** Crochet fermé (point de la courbe) ou ouvert (infini, valeur interdite). */
  gaucheFermee: boolean;
  droiteFermee: boolean;
  signe: "+" | "-";
  symbole: ValeurLigne2Tableau | null;
}

/** Zones d'un tableau attendu, bornées par les en-têtes de colonnes (racine = crochet fermé). */
export function zonesTableau(attendu: TableauEtudeLocaleAttendu, entetes: string[]): ZoneTableau[] {
  const zones: ZoneTableau[] = [];
  let gauche = "-\\infty";
  let gaucheFermee = false;
  attendu.colonnes.forEach((col, i) => {
    if (col.type === "zone") {
      // la droite est fixée au marqueur suivant (ou +∞)
      const suivant = attendu.colonnes[i + 1];
      const droite = suivant ? entetes[i + 1] : "+\\infty";
      const droiteFermee = !!suivant && suivant.type === "racine";
      zones.push({ gauche, droite, gaucheFermee, droiteFermee, signe: attendu.signes[i] === "-" ? "-" : "+", symbole: attendu.ligne2[i] });
    } else {
      gauche = entetes[i];
      gaucheFermee = col.type === "racine";
    }
  });
  return zones;
}

export function intervalleLatex(z: Pick<ZoneTableau, "gauche" | "droite" | "gaucheFermee" | "droiteFermee">): string {
  return `${z.gaucheFermee ? "[" : "]"}${z.gauche}\\,;\\,${z.droite}${z.droiteFermee ? "]" : "["}`;
}

/** « f est croissante sur ]−∞ ; −1], décroissante sur [−1 ; 2] et croissante sur [2 ; +∞[. » */
export function phraseSens(zones: ZoneTableau[], mode: "fprime" | "fseconde"): Fragments {
  const mot = (z: ZoneTableau) => (mode === "fprime" ? (z.signe === "+" ? "croissante" : "décroissante") : z.signe === "+" ? "convexe (∪)" : "concave (∩)");
  const out: Fragments = [t("f est ")];
  zones.forEach((z, i) => {
    if (i > 0) out.push(t(i === zones.length - 1 ? " et " : ", "));
    out.push(t(`${mot(z)} sur `), f(intervalleLatex(z)));
  });
  out.push(t("."));
  return out;
}

/** Lignes de calcul « f'(x) > 0 sur … » (une par zone), la justification dit d'où vient le signe. */
export function lignesSignesZones(zones: ZoneTableau[], nom: string, justification: (z: ZoneTableau, i: number) => string | Fragments): LigneCalcul[] {
  return zones.map((z, i) => ligne(`${nom}${z.signe === "+" ? ">" : "<"}0\\text{ sur }${intervalleLatex({ ...z, gaucheFermee: false, droiteFermee: false })}`, justification(z, i)));
}

/** Valeur décimale arrondie au dixième (graphique), virgule et « − » (LaTeX). */
export function dixiemeL(v: number): string {
  const r = Math.round(v * 10) / 10;
  return `${Object.is(r, -0) ? 0 : r}`.replace(".", "{,}");
}

/** Même valeur dans une phrase. */
export function dixiemeT(v: number): string {
  return dixiemeL(v).replace("{,}", ",").replace("-", "−");
}

/** Largeur visible du membre de droite d'une ligne (au-delà de ≈ 32, on découpe). */
export function droiteTropLongue(l: string, max = 32): boolean {
  const i = l.indexOf("=");
  return largeurVisible(i >= 0 ? l.slice(i + 1) : l) > max;
}
