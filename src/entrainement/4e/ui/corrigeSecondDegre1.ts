import type { Categorie, Exercice } from "../core/generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "../core/simplification.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { mono, nombreTexte, plusQ, q, qp, racineSimplifiee, rationnel, sansDoublons } from "./corrigeChapitre3";
import { formatEnonceAffichage, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import { formatFractionSimplifiee, formatPolynome } from "./formatSimplification";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 2 de 4e (« Équations et
 * inéquations du second degré »), moitié 1 : gen1 (méthode la plus rapide), gen2 (signe d'un
 * trinôme), gen3 (simplifier une fraction rationnelle), gen4 (l'inconnue au dénominateur) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ».
 *
 * Écritures EXACTES (entiers, fractions irréductibles, radicaux simplifiés `c√k`), « − »
 * typographique (LaTeX « - »), une transformation par ligne. Les formes finales (forme factorisée,
 * fraction simplifiée…) sont celles des fonctions de l'écran (`formeFactorisee` de l'instance,
 * `formatFormeFactoriseeDepuisRacines`, `formatFractionSimplifiee`) : les lignes intermédiaires y
 * mènent. Aucune dépendance à `docx` (importé par les générateurs interactifs).
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `equations-inequations-second-degre.ts`). */
export const COURS_RESOUDRE = "(cours, point 1)";
export const COURS_SIGNE = "(cours, point 2)";
export const COURS_SIMPLIFIER = "(cours, point 4)";
export const COURS_DENOMINATEUR = "(cours, point 5)";
export const COURS_VOCABULAIRE = "(cours, « Avant de commencer »)";

function net(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-12 ? 0 : v;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** PGCD des valeurs absolues non nulles (1 si toutes nulles). */
export function pgcdListe(valeurs: number[]): number {
  return valeurs.filter((v) => v !== 0).reduce((g, v) => pgcd(g, v), 0) || 1;
}

// ---------------------------------------------------------------------------------------------
// Nombres c·√k (racines des variantes irrationnelles de gen1)
// ---------------------------------------------------------------------------------------------

/** Nombre c·√k (k sans facteur carré, 1 pour un rationnel). */
export interface Rac {
  c: number;
  k: number;
}

export function rac(c: number, k = 1): Rac {
  return { c: net(c), k: net(c) === 0 ? 1 : k };
}

export function racValeur(r: Rac): number {
  return r.c * Math.sqrt(r.k);
}

export function racLatex(r: Rac): string {
  if (r.k === 1) return q(r.c);
  const signe = r.c < 0 ? "-" : "";
  const abs = Math.abs(r.c);
  const fr = rationnel(abs);
  if (fr && fr.d > 1) return `${signe}\\dfrac{${fr.n === 1 ? "" : fr.n}\\sqrt{${r.k}}}{${fr.d}}`;
  return `${signe}${abs === 1 ? "" : q(abs)}\\sqrt{${r.k}}`;
}

/** Entre parenthèses s'il est négatif, fractionnaire ou irrationnel (base d'une puissance). */
export function racPuissance(r: Rac): string {
  const s = racLatex(r);
  return r.c < 0 || r.k !== 1 || !Number.isInteger(r.c) ? `(${s})` : s;
}

/** Entre parenthèses s'il est négatif (facteur d'un produit). */
export function racFacteur(r: Rac): string {
  const s = racLatex(r);
  return r.c < 0 ? `(${s})` : s;
}

/** Texte d'un nombre c√k dans une justification (« −2√3 », « 5 »). */
export function racTexte(r: Rac): string {
  if (r.k === 1) return nombreTexte(r.c);
  const signe = r.c < 0 ? "−" : "";
  const abs = Math.abs(r.c);
  return `${signe}${abs === 1 ? "" : nombreTexte(abs)}√${r.k}`;
}

// ---------------------------------------------------------------------------------------------
// Trinôme ax² + bx + c (b éventuellement irrationnel : variante irrationnelle de gen1)
// ---------------------------------------------------------------------------------------------

export interface Trinome {
  a: number;
  b: Rac;
  c: number;
}

export function trinomeDe(ex: Exercice): Trinome {
  const { a, b, c } = ex.enonce;
  return { a, b: ex.irrationnel ? rac(ex.irrationnel.B, ex.irrationnel.k) : rac(b), c };
}

/** Membre de gauche développé, écrit par la fonction de l'écran. */
export function trinomeLatex(ex: Exercice): string {
  return ex.irrationnel ? formatEnonceAffichage(ex.enonce, "canonique", undefined, ex.irrationnel).replace(/\s*=\s*0$/, "") : formatMembreGauche(ex.enonce);
}

/** Racines exactes (distinctes, dans l'ordre croissant) d'un trinôme de l'instance. */
export function racinesExactes(ex: Exercice): Rac[] {
  if (ex.irrationnel) {
    const [c1, c2] = [...ex.irrationnel.racinesCoefficients].sort((x, y) => x - y);
    return c1 === c2 ? [rac(c1, ex.irrationnel.k)] : [rac(c1, ex.irrationnel.k), rac(c2, ex.irrationnel.k)];
  }
  const [r1, r2] = [...ex.solution.racines].sort((x, y) => x - y);
  // Aucune racine réelle (Δ < 0, ou b = 0 avec a, c de même signe) : racines [NaN, NaN].
  if (Number.isNaN(r1) || Number.isNaN(r2)) return [];
  return r1 === r2 ? [rac(r1)] : [rac(r1), rac(r2)];
}

/** « S = {−1 ; 3} », « S = ∅ » (accolades littérales, point-virgule à la belge). */
export function ensembleSolutionsLatex(valeurs: Rac[]): string {
  if (valeurs.length === 0) return "S=\\varnothing";
  return `S=\\{${valeurs.map(racLatex).join("\\,;\\,")}\\}`;
}

// ---------------------------------------------------------------------------------------------
// Cadre : on travaille sur une équation « … = 0 » ou sur un polynôme nommé « D(x) = … »
// ---------------------------------------------------------------------------------------------

/** `nom` (« D », « N »…) : écriture « D(x) = … » ; absent : équation « … = 0 ». */
export interface Cadre {
  nom?: string;
}

function depart(cadre: Cadre, expr: string): string {
  return cadre.nom ? `${cadre.nom}(x)=${expr}` : `${expr}=0`;
}

function suite(cadre: Cadre, expr: string): string {
  return cadre.nom ? `=${expr}` : `${expr}=0`;
}

/** Résultat d'une factorisation : « D(x) = … » ou « … = 0 ». */
export function formeLatex(cadre: Cadre, expr: string): string {
  return cadre.nom ? `${cadre.nom}(x)=${expr}` : `${expr}=0`;
}

// ---------------------------------------------------------------------------------------------
// Forme factorisée : lecture des facteurs (chaîne de l'écran) et facteurs nuls
// ---------------------------------------------------------------------------------------------

export interface Facteur {
  /** Facteur αx + β (β = c√k). */
  alpha: number;
  beta: Rac;
  /** LaTeX du facteur tel qu'il est écrit dans la forme factorisée (sans parenthèses). */
  latex: string;
  carre: boolean;
}

export function racineFacteur(f: Facteur): Rac {
  return rac(-f.beta.c / f.alpha, f.beta.k);
}

function decouperTermes(s: string): string[] {
  const termes: string[] = [];
  let prof = 0;
  let debut = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") prof++;
    else if (ch === "}") prof--;
    else if (prof === 0 && (ch === "+" || ch === "-") && i > debut) {
      termes.push(s.slice(debut, i));
      debut = i;
    }
  }
  termes.push(s.slice(debut));
  return termes.filter((t) => t !== "" && t !== "+");
}

function lireLineaire(inner: string): { alpha: number; beta: Rac } {
  let alpha = 0;
  let beta = rac(0);
  for (const t of decouperTermes(inner)) {
    if (t.includes("x")) {
      const m = /^([+-]?)(\d*)x$/.exec(t);
      if (!m) throw new Error(`lireLineaire : terme ${t}`);
      alpha += (m[1] === "-" ? -1 : 1) * (m[2] === "" ? 1 : Number(m[2]));
    } else {
      const m = /^([+-]?)(\d*)(\\sqrt\{(\d+)\})?$/.exec(t);
      if (!m) throw new Error(`lireLineaire : terme ${t}`);
      const signe = m[1] === "-" ? -1 : 1;
      const k = m[4] ? Number(m[4]) : 1;
      const c = signe * (m[2] === "" ? 1 : Number(m[2]));
      beta = rac(beta.c + c, k);
    }
  }
  return { alpha, beta };
}

/** Facteurs d'une forme factorisée de l'écran (« 2x(x - 3) », « -(x + 1)^2 », « (x - 2\sqrt{3})(x + 2\sqrt{3}) »…). */
export function lireFormeFactorisee(forme: string): { prefixe: number; facteurs: Facteur[] } {
  let t = forme.replace(/\s+/g, "");
  const pre = /^-?\d*/.exec(t)![0];
  t = t.slice(pre.length);
  const prefixe = pre === "" ? 1 : pre === "-" ? -1 : Number(pre);
  const facteurs: Facteur[] = [];
  while (t.length > 0) {
    if (t.startsWith("x^2")) {
      facteurs.push({ alpha: 1, beta: rac(0), latex: "x", carre: true });
      t = t.slice(3);
    } else if (t.startsWith("x")) {
      facteurs.push({ alpha: 1, beta: rac(0), latex: "x", carre: false });
      t = t.slice(1);
    } else if (t.startsWith("(")) {
      let prof = 0;
      let fin = -1;
      for (let i = 0; i < t.length; i++) {
        if (t[i] === "(") prof++;
        else if (t[i] === ")") {
          prof--;
          if (prof === 0) {
            fin = i;
            break;
          }
        }
      }
      const inner = t.slice(1, fin);
      t = t.slice(fin + 1);
      const carre = t.startsWith("^2");
      if (carre) t = t.slice(2);
      facteurs.push({ ...lireLineaire(inner), latex: inner, carre });
    } else {
      throw new Error(`lireFormeFactorisee : ${forme}`);
    }
  }
  return { prefixe, facteurs };
}

/**
 * Un facteur égal à 0 (ou différent de 0 : `relation = "\\neq"`, conditions d'existence), résolu :
 * « x − 3 = 0 », « x = 3 » ; « −2x + 6 = 0 », « −2x = −6 », « x = 3 ».
 */
export function lignesFacteurNul(f: Facteur, justification: string | Fragments, relation: "=" | "\\neq" = "="): LigneCalcul[] {
  const r = racineFacteur(f);
  if (f.alpha === 1 && f.beta.c === 0) return [ligne(`x${relation}0`, justification)];
  const lignes = [ligne(`${f.latex}${relation}0`, justification)];
  if (f.alpha === 1) {
    lignes.push(ligne(`x${relation}${racLatex(r)}`, f.beta.c > 0 ? `on soustrait ${racTexte(f.beta)} aux deux membres` : `on ajoute ${racTexte(rac(-f.beta.c, f.beta.k))} aux deux membres`));
    return lignes;
  }
  if (f.beta.c !== 0) lignes.push(ligne(`${mono(f.alpha, "x")}${relation}${racLatex(rac(-f.beta.c, f.beta.k))}`, "on isole le terme en x"));
  lignes.push(ligne(`x${relation}${racLatex(r)}`, f.alpha === -1 ? "on multiplie les deux membres par −1" : `on divise les deux membres par ${nombreTexte(f.alpha)}`));
  return lignes;
}

/**
 * Produit nul : chaque facteur distinct (contenant x) égal à 0, résolu. Racine double : un seul
 * facteur (« le carré est nul si et seulement si … »).
 */
export function lignesProduitNul(forme: string): LigneCalcul[] {
  const { facteurs } = lireFormeFactorisee(forme);
  const lignes: LigneCalcul[] = [];
  facteurs.forEach((f, i) => {
    const just = f.carre ? "un carré est nul si et seulement si sa base est nulle" : facteurs.length === 1 ? "facteur nul" : i === 0 ? "premier facteur nul" : "second facteur nul";
    lignes.push(...lignesFacteurNul(f, just));
  });
  return lignes;
}

/** Conditions d'existence lues sur un dénominateur factorisé : chaque facteur différent de 0. */
export function lignesFacteursNonNuls(forme: string): LigneCalcul[] {
  const { facteurs } = lireFormeFactorisee(forme);
  const vus = new Set<string>();
  const lignes: LigneCalcul[] = [];
  for (const f of facteurs) {
    if (vus.has(f.latex)) continue;
    vus.add(f.latex);
    lignes.push(...lignesFacteurNul(f, vus.size === 1 ? "chaque facteur du dénominateur doit être non nul" : "", "\\neq"));
  }
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// Méthode la plus rapide : reconnaissance (tests sur a, b, c)
// ---------------------------------------------------------------------------------------------

/** Méthode « rapide » d'un trinôme sans catégorie (gen2) : c = 0, b = 0 avec a·c < 0, b² = 4ac, sinon Δ. */
export function categorieTrinome(a: number, b: number, c: number): Categorie {
  if (b === 0 && c === 0) return "produit_remarquable";
  if (c === 0) return "mise_en_evidence";
  if (b === 0 && a * c < 0) return "binome_conjugue";
  if (b * b === 4 * a * c) return "produit_remarquable";
  return "cas_general";
}

export const NOM_METHODE: Record<Categorie, string> = {
  mise_en_evidence: "mise en évidence de x",
  binome_conjugue: "différence de deux carrés (binôme conjugué)",
  produit_remarquable: "carré parfait (produit remarquable)",
  cas_general: "formule du discriminant",
  mise_en_evidence_generalisee: "mise en évidence d'une expression entière",
  irreductible: "aucune factorisation",
};

/** Tests de reconnaissance, une condition par ligne, sur les coefficients (réduits) du trinôme. */
export function lignesReconnaissance(t: Trinome, categorie: Categorie): LigneCalcul[] {
  const b2 = t.b.c * t.b.c * t.b.k;
  const a4c = 4 * t.a * t.c;
  const ligneB2 = ligne(`b^2=${racPuissance(t.b)}^2=${q(b2)}`);
  const ligne4ac = ligne(`4ac=4\\cdot ${qp(t.a)}\\cdot ${qp(t.c)}=${q(a4c)}`);
  switch (categorie) {
    case "mise_en_evidence":
      return [ligne("c=0", "pas de terme constant : x est un facteur commun aux deux termes")];
    case "binome_conjugue":
      return [
        ligne("b=0", "pas de terme en x"),
        ligne(`a=${q(t.a)}`, t.a > 0 ? "a > 0" : "a < 0"),
        ligne(`c=${q(t.c)}`, `c ${t.c > 0 ? ">" : "<"} 0 : a et c de signes opposés, différence de deux carrés`),
      ];
    case "produit_remarquable":
      return [ligneB2, ligne4ac, ligne("b^2=4ac", "donc Δ = 0 : le trinôme est un carré parfait")];
    default:
      return [
        ligne(`b=${racLatex(t.b)}`, "b ≠ 0 : pas une différence de deux carrés"),
        ligne(`c=${q(t.c)}`, "c ≠ 0 : x n'est pas facteur commun"),
        ligneB2,
        ligne4ac,
        ligne("b^2\\neq 4ac", "pas un carré parfait : on utilise la formule du discriminant"),
      ];
  }
}

export function utiliseReconnaissance(): Fragments {
  return [
    texte(
      `Avant le discriminant, on essaie les raccourcis du tableau du cours : c = 0 → mise en évidence de x ; b = 0 et a, c de signes opposés → différence de deux carrés ; b² = 4ac (Δ = 0) → carré parfait ; sinon, formule du discriminant ${COURS_RESOUDRE}.`,
    ),
  ];
}

// ---------------------------------------------------------------------------------------------
// Discriminant et formule
// ---------------------------------------------------------------------------------------------

export function deltaDe(t: Trinome): number {
  return net(t.b.c * t.b.c * t.b.k - 4 * t.a * t.c);
}

/** Δ = b² − 4ac substitué, puis ses deux termes, puis sa valeur. */
export function lignesDelta(t: Trinome): LigneCalcul[] {
  const b2 = t.b.c * t.b.c * t.b.k;
  const m4ac = net(-4 * t.a * t.c);
  return sansDoublons([
    ligne(`\\Delta=${racPuissance(t.b)}^2-4\\cdot ${qp(t.a)}\\cdot ${qp(t.c)}`, [texte("on remplace "), latex(`a=${q(t.a)}`), texte(", "), latex(`b=${racLatex(t.b)}`), texte(", "), latex(`c=${q(t.c)}`)]),
    ligne(`=${q(b2)}${plusQ(m4ac)}`),
    ligne(`=${q(b2 + m4ac)}`),
  ]);
}

export function utiliseDelta(): Fragments {
  return [texte("Discriminant du trinôme "), latex("ax^2+bx+c"), texte(" : "), latex("\\Delta=b^2-4ac"), texte(` ; le carré de b est toujours positif ${COURS_RESOUDRE}.`)];
}

export function utiliseFormule(): Fragments {
  return [
    texte("Si Δ > 0, deux solutions distinctes "),
    latex("x_1=\\dfrac{-b-\\sqrt{\\Delta}}{2a}"),
    texte(" et "),
    latex("x_2=\\dfrac{-b+\\sqrt{\\Delta}}{2a}"),
    texte(` ; si Δ = 0, une solution double ; si Δ < 0, aucune solution réelle ${COURS_RESOUDRE}.`),
  ];
}

/** √Δ (simplifiée), puis x₁ et x₂ par la formule — Δ > 0. `indices` : noms des deux racines. */
export function lignesRacinesFormule(t: Trinome, indices: [string, string] = ["x_1", "x_2"]): { lignes: LigneCalcul[]; racines: [Rac, Rac] } {
  const delta = deltaDe(t);
  const { k: kk, m } = racineSimplifiee(delta);
  const racDelta = rac(kk, m);
  const lignes: LigneCalcul[] = [ligne(`\\sqrt{\\Delta}=\\sqrt{${delta}}`)];
  if (m === 1) lignes[0] = ligne(`\\sqrt{\\Delta}=\\sqrt{${delta}}=${kk}`, `car ${delta} = ${kk}²`);
  else if (kk !== 1) lignes.push(ligne(`=${racLatex(racDelta)}`, `on simplifie la racine : ${delta} = ${kk * kk} · ${m}`));
  // −b et √Δ ont le même radical (variante irrationnelle : b = B√k, Δ = k·(r₁ − r₂)²).
  const k = t.b.c !== 0 ? t.b.k : racDelta.k;
  if (t.b.c !== 0 && racDelta.k !== t.b.k) throw new Error("lignesRacinesFormule : radicaux différents");
  const moinsB = t.b.c === 0 ? "" : t.b.c < 0 ? `-(${racLatex(t.b)})` : `-${racLatex(t.b)}`;
  const racines: Rac[] = [];
  ([-1, 1] as const).forEach((s, i) => {
    const num = rac(-t.b.c + s * racDelta.c, k);
    const x = rac(num.c / (2 * t.a), k);
    racines.push(x);
    const signe = s < 0 ? "-" : "+";
    const just: Fragments = [texte("formule, signe "), latex(signe === "-" ? "-" : "+")];
    lignes.push(ligne(`${indices[i]}=\\dfrac{${moinsB}${moinsB === "" && s > 0 ? "" : signe}${racLatex(racDelta)}}{2\\cdot ${qp(t.a)}}`, just));
    const fractionNum = `=\\dfrac{${racLatex(num)}}{${q(2 * t.a)}}`;
    if (racLatex(x) !== racLatex(num) || 2 * t.a !== 1) lignes.push(ligne(fractionNum));
    lignes.push(ligne(`=${racLatex(x)}`));
  });
  return { lignes: sansDoublons(lignes), racines: [racines[0]!, racines[1]!] };
}

/** Vérification par la somme et le produit des racines : x₁ + x₂ = −b/a, x₁·x₂ = c/a. */
export function lignesVerificationViete(t: Trinome, x1: Rac, x2: Rac, indices: [string, string] = ["x_1", "x_2"]): LigneCalcul[] {
  const somme = rac(x1.c + x2.c, x1.c !== 0 ? x1.k : x2.k);
  const produit = net(x1.c * x2.c * Math.sqrt(x1.k * x2.k));
  const moinsBsurA = rac(-t.b.c / t.a, t.b.k);
  const somLatex = x2.c < 0 ? `${racLatex(x1)}+(${racLatex(x2)})` : `${racLatex(x1)}+${racLatex(x2)}`;
  return [
    ligne(`${indices[0]}+${indices[1]}=${somLatex}=${racLatex(somme)}`, [texte("égal à "), latex(`-\\dfrac{b}{a}=${racLatex(moinsBsurA)}`), texte(" ✓")]),
    ligne(`${indices[0]}\\cdot ${indices[1]}=${racFacteur(x1)}\\cdot ${racFacteur(x2)}=${q(produit)}`, [texte("égal à "), latex(`\\dfrac{c}{a}=${q(t.c / t.a)}`), texte(" ✓")]),
  ];
}

/** Valeur de ax² + bx + c en x = r (exacte : r² et b·r rationnels). */
export function valeurTrinome(t: Trinome, r: Rac): number {
  return net(t.a * r.c * r.c * r.k + t.b.c * r.c * Math.sqrt(t.b.k * r.k) + t.c);
}

/** x remplacé par r dans ax² + bx + c : terme à terme, puis la valeur. `fin` : justification de la valeur. */
export function lignesValeurTrinome(t: Trinome, r: Rac, fin: string | Fragments): LigneCalcul[] {
  const carre = `${racPuissance(r)}^2`;
  const t1 = t.a === 1 ? carre : t.a === -1 ? `-${carre}` : `${q(t.a)}\\cdot ${carre}`;
  let t2 = "";
  if (t.b.c !== 0) {
    const absB = rac(Math.abs(t.b.c), t.b.k);
    const signe = t.b.c > 0 ? "+" : "-";
    t2 = absB.k === 1 && absB.c === 1 ? `${signe}${racFacteur(r)}` : `${signe}${racLatex(absB)}\\cdot ${racFacteur(r)}`;
  }
  const v1 = net(t.a * r.c * r.c * r.k);
  const v2 = net(t.b.c * r.c * Math.sqrt(t.b.k * r.k));
  const termes = `${q(v1)}${plusQ(v2)}${plusQ(t.c)}`;
  const lignes = [ligne(`${t1}${t2}${plusQ(t.c)}=${termes}`, [texte("on remplace x par "), latex(racLatex(r))])];
  lignes.push(ligne(`=${q(valeurTrinome(t, r))}`, fin));
  return sansDoublons(lignes);
}

/** Vérification en remplaçant x par r dans ax² + bx + c : la valeur 0 au bout. */
export function lignesVerificationSubstitution(t: Trinome, r: Rac): LigneCalcul[] {
  return lignesValeurTrinome(t, r, "✓");
}

// ---------------------------------------------------------------------------------------------
// Factorisation par la méthode reconnue (forme factorisée finale = celle de l'écran)
// ---------------------------------------------------------------------------------------------

/** Préfixe numérique de la forme factorisée : « mise en évidence de 2 » (texte). */
function texteMiseEnEvidence(coef: number, partie = ""): string {
  const c = coef === 1 ? (partie ? "" : "1") : coef === -1 ? (partie ? "−" : "−1") : nombreTexte(coef);
  return `mise en évidence de ${c}${partie}`;
}

/** r² écrit comme un carré : « 3^2 », « (2\sqrt{3})^2 ». */
function carreDe(r: Rac): string {
  return `${racPuissance(rac(Math.abs(r.c), r.k))}^2`;
}

/**
 * Lignes de la factorisation d'un trinôme de catégorie mise en évidence / binôme conjugué /
 * produit remarquable, de la forme développée `developpe` jusqu'à la forme factorisée `forme`
 * (chaîne de l'écran). Une transformation par ligne.
 */
export function lignesFactorisation(ex: Exercice, cadre: Cadre, forme: string, developpe = trinomeLatex(ex)): LigneCalcul[] {
  const t = trinomeDe(ex);
  const lignes: LigneCalcul[] = [ligne(depart(cadre, developpe))];
  const { prefixe } = lireFormeFactorisee(forme);
  switch (ex.categorie) {
    case "mise_en_evidence": {
      const avecX = forme.replace(/\s+/g, "").match(/^(-?\d*)x\(/);
      const coef = avecX ? (avecX[1] === "" ? 1 : avecX[1] === "-" ? -1 : Number(avecX[1])) : prefixe;
      lignes.push(ligne(suite(cadre, forme.replace(/\s+/g, "")), texteMiseEnEvidence(coef, "x")));
      break;
    }
    case "binome_conjugue": {
      const r = racinesExactes(ex)[1]!;
      if (t.a !== 1) lignes.push(ligne(suite(cadre, `${t.a === -1 ? "-" : q(t.a)}(x^2-${racLatex(rac(r.c * r.c * r.k))})`), texteMiseEnEvidence(t.a)));
      const pre = t.a === 1 ? "" : t.a === -1 ? "-" : q(t.a);
      lignes.push(ligne(suite(cadre, `${pre}${t.a === 1 ? "" : "("}x^2-${carreDe(r)}${t.a === 1 ? "" : ")"}`), [latex(`${q(r.c * r.c * r.k)}=${carreDe(r)}`)]));
      lignes.push(ligne(suite(cadre, forme.replace(/\s+/g, "")), [latex("A^2-B^2=(A-B)(A+B)")]));
      break;
    }
    case "produit_remarquable": {
      const r = racinesExactes(ex)[0]!;
      const pre = t.a === 1 ? "" : t.a === -1 ? "-" : q(t.a);
      const interieur = (s: string) => (t.a === 1 ? s : `${pre}(${s})`);
      if (t.a !== 1) lignes.push(ligne(suite(cadre, interieur(`x^2${r.c > 0 ? "-" : "+"}${r.k === 1 ? mono(2 * Math.abs(r.c), "x") : `${racLatex(rac(2 * Math.abs(r.c), r.k))}x`}+${q(r.c * r.c * r.k)}`)), texteMiseEnEvidence(t.a)));
      lignes.push(ligne(suite(cadre, interieur(`x^2${r.c > 0 ? "-" : "+"}2\\cdot x\\cdot ${racLatex(rac(Math.abs(r.c), r.k))}+${carreDe(r)}`)), [texte("on repère "), latex(r.c > 0 ? "A^2-2AB+B^2" : "A^2+2AB+B^2")]));
      lignes.push(ligne(suite(cadre, forme.replace(/\s+/g, "")), [latex(r.c > 0 ? "A^2-2AB+B^2=(A-B)^2" : "A^2+2AB+B^2=(A+B)^2")]));
      break;
    }
    default:
      lignes.push(ligne(suite(cadre, forme.replace(/\s+/g, ""))));
  }
  return sansDoublons(lignes);
}

export function utiliseFactorisation(categorie: Categorie): Fragments {
  switch (categorie) {
    case "mise_en_evidence":
      return [texte(`Pas de terme constant : on met en évidence x (et le facteur numérique commun) ${COURS_RESOUDRE}.`)];
    case "binome_conjugue":
      return [texte("Différence de deux carrés : "), latex("A^2-B^2=(A-B)(A+B)"), texte(`, après avoir mis le coefficient de x² en évidence ${COURS_RESOUDRE}.`)];
    case "produit_remarquable":
      return [texte("Carré parfait : "), latex("A^2\\pm 2AB+B^2=(A\\pm B)^2"), texte(`, après avoir mis le coefficient de x² en évidence ${COURS_RESOUDRE}.`)];
    default:
      return [texte("Si le trinôme a deux racines "), latex("x_1"), texte(" et "), latex("x_2"), texte(", il se factorise en "), latex("a(x-x_1)(x-x_2)"), texte(` ${COURS_RESOUDRE}.`)];
  }
}

export function utiliseProduitNul(): Fragments {
  return [texte(`Un produit de facteurs est nul si et seulement si l'un au moins de ses facteurs est nul : on égale chaque facteur à 0 ${COURS_RESOUDRE}.`)];
}

/** Facteur x − r écrit « x - 3 », « x + 2 », « x » (r = 0). */
export function xMoins(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `x-${q(r)}` : `x+${q(-r)}`;
}

/** Facteur x − r entre parenthèses, ou x nu. */
export function facteurX(r: number): string {
  return r === 0 ? "x" : `(${xMoins(r)})`;
}

/**
 * Cas général : a(x − x₁)(x − x₂) à partir des racines (étape précédente), jusqu'à la forme de
 * l'écran `formatFormeFactoriseeDepuisRacines`. Racines entières (gen3, gen4).
 */
export function lignesFactorisationCasGeneral(ex: Exercice, cadre: Cadre): LigneCalcul[] {
  const forme = formatFormeFactoriseeDepuisRacines(ex.enonce, ex.solution.racines).replace(/\s+/g, "");
  const [r1, r2] = [...ex.solution.racines].sort((x, y) => y - x);
  const pre = ex.enonce.a === 1 ? "" : ex.enonce.a === -1 ? "-" : q(ex.enonce.a);
  const sub = (r: number) => (r < 0 ? `(x-(${q(r)}))` : r === 0 ? "(x-0)" : `(x-${q(r)})`);
  return sansDoublons([
    ligne(depart(cadre, "a(x-x_1)(x-x_2)"), [texte("avec "), latex(`a=${q(ex.enonce.a)}`), texte(" et les racines "), latex(`${q(r1)}`), texte(" et "), latex(`${q(r2)}`)]),
    ligne(suite(cadre, `${pre}${sub(r1)}${sub(r2)}`), "on remplace a et les racines"),
    ligne(suite(cadre, forme)),
  ]);
}

/** Vérification d'une factorisation : on redéveloppe a(x − r₁)(x − r₂) (racines entières). */
export function lignesRedeveloppement(ex: Exercice, cadre: Cadre): LigneCalcul[] {
  const [r1, r2] = [...ex.solution.racines].sort((x, y) => y - x);
  const forme = formatFormeFactoriseeDepuisRacines(ex.enonce, ex.solution.racines).replace(/\s+/g, "");
  const a = ex.enonce.a;
  const pre = a === 1 ? "" : a === -1 ? "-" : q(a);
  const interieur = formatMembreGauche({ a: 1, b: -(r1 + r2), c: r1 * r2 });
  const developpe = formatMembreGauche(ex.enonce);
  const fin: Fragments = [texte("c'est bien "), latex(cadre.nom ? `${cadre.nom}(x)` : developpe), texte(" ✓")];
  if (a === 1) return [ligne(`${forme}=${interieur}`, [texte("on développe : "), ...fin])];
  return [ligne(`${forme}=${pre}(${interieur})`, "on développe le produit des facteurs en x"), ligne(`=${developpe}`, [texte("on distribue a : "), ...fin])];
}

// ---------------------------------------------------------------------------------------------
// Fractions rationnelles (gen3, gen4) : réduction d'un polynôme, simplification d'une fraction
// ---------------------------------------------------------------------------------------------

/** « 3x - 6 » → « 3(x - 2) » ; « 2x^2 - 8x + 6 » → « 2(x^2 - 4x + 3) » (PGCD des coefficients). */
export function lignesMiseEnEvidenceNumerique(poly: Exercice | PolynomeLineaire, nom: string): LigneCalcul[] {
  if ("k" in poly) {
    return [ligne(`${nom}(x)=${formatPolynome(poly)}`), ligne(`=${poly.k}(${xMoins(poly.p)})`, texteMiseEnEvidence(poly.k))];
  }
  const { a, b, c } = poly.enonce;
  const g = pgcdListe([a, b, c]);
  const coefs = [a, b, c].filter((v) => v !== 0).map((v) => Math.abs(v));
  return [
    ligne(`\\operatorname{PGCD}(${coefs.join("\\,;\\,")})=${g}`, "plus grand diviseur commun des coefficients"),
    ligne(`${nom}(x)=${formatMembreGauche(poly.enonce)}`),
    ligne(`=${g}(${formatMembreGauche({ a: a / g, b: b / g, c: c / g })})`, texteMiseEnEvidence(g)),
  ];
}

/** Forme factorisée complète d'un côté d'une fraction (écran : `formatFormeFactoriseeDepuisRacines` / k(x − p)). */
export function formeFactoriseeCote(poly: Exercice | PolynomeLineaire): string {
  if ("k" in poly) return poly.k === 1 ? xMoins(poly.p) : `${poly.k}${facteurX(poly.p)}`;
  return formatFormeFactoriseeDepuisRacines(poly.enonce, poly.solution.racines).replace(/\s+/g, "");
}

function coefficient(poly: Exercice | PolynomeLineaire): number {
  return "k" in poly ? poly.k : poly.enonce.a;
}

/** Ce qui reste d'un côté après simplification par (x − p) : coefficient et racine restante (null pour un P1). */
function resteApresSimplification(poly: Exercice | PolynomeLineaire, p: number): { coef: number; r: number | null } {
  if ("k" in poly) return { coef: poly.k, r: null };
  const copie = [...poly.solution.racines];
  copie.splice(copie.indexOf(p), 1);
  return { coef: poly.enonce.a, r: copie[0]! };
}

function coteLatex(coef: number, r: number | null): string {
  if (r === null) return q(coef);
  if (coef === 1) return xMoins(r);
  return `${coef === -1 ? "-" : q(coef)}${facteurX(r)}`;
}

/** \frac → \dfrac ; « …/1 » sans barre (même règle que le papier de gen3). */
export function fractionPapier(l: string): string {
  const m = /^\\frac\{(.*)\}\{(-?)1\}$/.exec(l);
  if (m) return m[2] === "-" ? `-\\left(${m[1]}\\right)` : m[1]!;
  return l.replace(/\\frac/g, "\\dfrac");
}

/**
 * Simplification d'une fraction factorisée par le facteur commun (x − p), puis par le PGCD des
 * coefficients — jusqu'à `formatFractionSimplifiee` (écran). `gauche` : membre de gauche de la
 * première ligne (« F(x) » ou la fraction développée).
 */
export function lignesSimplificationFraction(fs: ExerciceSimplification, gauche: string): LigneCalcul[] {
  const p = fs.racineCommune;
  const num = resteApresSimplification(fs.numerateur, p);
  const den = resteApresSimplification(fs.denominateur, p);
  const g = pgcd(coefficient(fs.numerateur), coefficient(fs.denominateur));
  const finale = fractionPapier(formatFractionSimplifiee(fs));
  const frac = (n: string, d: string) => (d === "1" ? n : `\\dfrac{${n}}{${d}}`);
  const lignes: LigneCalcul[] = [
    ligne(`${gauche}=\\dfrac{${formeFactoriseeCote(fs.numerateur)}}{${formeFactoriseeCote(fs.denominateur)}}`, "numérateur et dénominateur factorisés"),
    ligne(`=${frac(coteLatex(num.coef, num.r), coteLatex(den.coef, den.r))}`, [texte("on simplifie par le facteur commun "), latex(facteurX(p)), texte(" (non nul sous les CE)")]),
  ];
  if (g > 1) lignes.push(ligne(`=${finale}`, `on simplifie par ${g}`));
  else lignes.push(ligne(`=${finale}`));
  return sansDoublons(lignes);
}

/** Texte d'un polynôme pour une justification (« x² − 4x + 3 »). */
export function polynomeTexte(latexPoly: string): string {
  return latexPoly.replace(/\^2/g, "²").replace(/\\sqrt\{(\d+)\}/g, "√$1").replace(/-/g, "−").replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------------------------
// Finition : formules insécables dans les justifications et les résultats rédigés
// ---------------------------------------------------------------------------------------------

function groupe(l: string): string {
  return l.startsWith("{") && l.endsWith("}") ? l : `{${l}}`;
}

/**
 * Formules des justifications (colonne étroite), de « Ce qu'on utilise » et des résultats rédigés
 * groupées `{…}` : KaTeX ne les coupe plus après « = » en fin de ligne (« c » / « =12 » sur deux
 * lignes, mesuré à 680, 820 et 1 280 px). Un résultat qui n'est qu'une formule reste découpable.
 */
export function finaliserCorrige(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => {
    const calculs = e.calcul?.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map((f) => (f.type === "latex" ? latex(groupe(f.valeur)) : f)) } : l));
    const redige = e.fragments.some((f) => f.type === "texte" && f.valeur.trim() !== "");
    const fragments = redige ? e.fragments.map((f) => (f.type === "latex" ? latex(groupe(f.valeur)) : f)) : e.fragments;
    return { ...e, fragments, ...(calculs ? { calcul: calculs } : {}) };
  });
}
