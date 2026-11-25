import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { calcul, latex, lettreEtape, ligne, lignesDeLEtape, piege, resultat, texte, utilise, verification } from "../../export/corrigeTableau";
import { combinaisonBig, rationnel, versNombre } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";
import { arrondiLatex, decimalesAffichage, fractionLatex, milliers } from "./fragmentsCombinatoire";

/**
 * Briques du corrigé détaillé « comme au tableau » des générateurs 6gen43–6gen48 (6e ch. 7, audit,
 * lot E) — règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »).
 * SANS `docx` : importé par les adaptateurs papier ET par les applis (corrigé de l'étape révélée,
 * `AppCombinatoire.corrigeDetaille`). Une lettre par écran (`lettreEtape(indice de l'écran)`).
 *
 * - renvois `COURS_*` aux sections du chapitre ;
 * - entiers avec espaces de milliers (`milliers`, comme l'écran), nombres exacts en BigInt ;
 * - `lignesCombinaison` : Cₙᵏ par le quotient du produit décroissant (symétrie si k > n − k) ;
 * - `lignesProbabilite` : fraction brute, puis simplifiée (« on simplifie par g »), puis l'arrondi
 *   annoncé (au millième, davantage pour une très petite probabilité) — une transformation par ligne.
 */

export const COURS_FONDAMENTAL = "cours, § 1";
export const COURS_COMBINE = "cours, § 2";
export const COURS_BINOME = "cours, § 3";
export const COURS_PROBLEMES = "cours, § 4";
export const COURS_HYPERGEO = "cours, § 5";
export const COURS_BINOMIALE = "cours, § 6";

export { calcul, latex, ligne, piege, resultat, texte, utilise, verification };

type Fragments = FragmentConsigne[];

/** « texte $formule$ texte » → fragments du corrigé. */
export function fx(s: string): Fragments {
  const r: Fragments = [];
  s.split("$").forEach((morceau, i) => {
    if (morceau !== "") r.push(i % 2 === 1 ? latex(morceau) : texte(morceau));
  });
  return r;
}

export const CC = (n: number | string, k: number | string) => `C_{${n}}^{${k}}`;

/** Produit de facteurs entiers en LaTeX (« 9\times 8\times 7 »). */
export function produit(facteurs: (number | bigint)[]): string {
  return facteurs.map((x) => milliers(x)).join("\\times ");
}

/** Entier entre parenthèses s'il est négatif. */
export function par(x: number | bigint): string {
  return x < 0 ? `(${milliers(x)})` : milliers(x);
}

/** Cₙᵏ calculé par le quotient du produit décroissant ; `gauche` faux : la première ligne commence par « = ». */
export function lignesCombinaison(n: number, k: number, gauche = true): LigneCalcul[] {
  const g = gauche ? CC(n, k) : "";
  const valeur = combinaisonBig(n, k);
  if (k === 0 || k === n) return [ligne(`${g}=1`, k === 0 ? "un seul choix : aucun élément" : "un seul choix : tous les éléments")];
  if (k === 1 || k === n - 1) return [ligne(`${g}=${n}`, k === 1 ? `${n} choix d'un élément` : "symétrie : autant que de choisir l'élément laissé")];
  const lignes: LigneCalcul[] = [];
  let kk = k;
  if (k > n - k) {
    kk = n - k;
    lignes.push(ligne(`${g}=${CC(n, kk)}`, "symétrie"));
  }
  const num = Array.from({ length: kk }, (_, i) => n - i);
  const den = Array.from({ length: kk }, (_, i) => kk - i);
  lignes.push(ligne(`${lignes.length === 0 ? g : ""}=\\dfrac{${num.join("\\times ")}}{${den.join("\\times ")}}`, lignes.length === 0 ? "produit de k facteurs décroissants sur k!" : undefined));
  lignes.push(ligne(`=${milliers(valeur)}`));
  return lignes;
}

/** Valeur d'une probabilité : fraction irréductible ≈ arrondi lisible (comme l'écran). */
export function valeurProbabilite(r: Rationnel): string {
  const x = versNombre(r);
  if (r.d === 1n) return milliers(r.n);
  const dec = decimalExact(r);
  return dec !== null && dec.decimales <= 4 ? `${fractionLatex(r)}=${dec.latex}` : `${fractionLatex(r)}\\approx ${arrondiLatex(x, decimalesAffichage(x))}`;
}

/** Arrondi annoncé d'une probabilité (« ≈ 0,107 ») ou son écriture décimale exacte courte (« = 0,25 »). */
export function suffixeDecimal(r: Rationnel): string {
  if (r.d === 1n) return "";
  const dec = decimalExact(r);
  if (dec !== null && dec.decimales <= 4) return `=${dec.latex}`;
  const x = versNombre(r);
  return `\\approx ${arrondiLatex(x, decimalesAffichage(x))}`;
}

function justificationArrondi(r: Rationnel): string {
  const d = decimalesAffichage(versNombre(r));
  return d === 3 ? "arrondi au millième" : `arrondi à ${d} décimales`;
}

/** Écriture décimale EXACTE d'un rationnel dont le dénominateur n'a que des facteurs 2 et 5 (sinon
 * `null`) ; décimales groupées par trois au-delà de quatre (« 0{,}082\,354\,3 »). */
export function decimalExact(r: Rationnel): { latex: string; decimales: number } | null {
  let d = r.d;
  let k = 0;
  let deux = 0;
  let cinq = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    deux++;
  }
  while (d % 5n === 0n) {
    d /= 5n;
    cinq++;
  }
  if (d !== 1n) return null;
  k = Math.max(deux, cinq);
  const puissance = 10n ** BigInt(k);
  const n = (r.n * puissance) / r.d;
  const signe = n < 0n ? "-" : "";
  const abs = n < 0n ? -n : n;
  const s = abs.toString().padStart(k + 1, "0");
  const ent = s.slice(0, s.length - k);
  const frac = s.slice(s.length - k);
  if (k === 0) return { latex: `${signe}${milliers(BigInt(ent))}`, decimales: 0 };
  const fracGroupee = frac.length > 4 ? frac.replace(/(\d{3})(?=\d)/g, "$1\\,") : frac;
  return { latex: `${signe}${milliers(BigInt(ent))}{,}${fracGroupee}`, decimales: k };
}

/**
 * Lignes d'une probabilité num/den : « gauche = num/den » (fraction brute), puis « = » la fraction
 * irréductible si elle diffère (« on simplifie par g »), puis l'écriture décimale exacte courte ou
 * l'arrondi annoncé. `gauche` vide : la première ligne continue la chaîne précédente.
 */
export function lignesProbabilite(gauche: string, num: bigint | number, den: bigint | number, justification?: string | Fragments): LigneCalcul[] {
  const N = BigInt(num);
  const D = BigInt(den);
  const brute = `\\dfrac{${milliers(N)}}{${milliers(D)}}`;
  const r = rationnel(N, D);
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${brute}`, justification)];
  const g = N / r.n;
  if (r.n !== N || r.d !== D) lignes.push(ligne(`=${fractionLatex(r)}`, r.d === 1n ? undefined : `on simplifie par ${milliers(g).replace(/\\,/g, " ")}`));
  const s = suffixeDecimal(r);
  if (s) lignes.push(ligne(s, s.startsWith("=") ? "valeur décimale" : justificationArrondi(r)));
  return lignes;
}

/** Fin de chaîne pour une probabilité déjà écrite comme fraction irréductible : décimal / arrondi. */
export function ligneDecimale(r: Rationnel): LigneCalcul[] {
  const s = suffixeDecimal(r);
  return s ? [ligne(s, s.startsWith("=") ? "valeur décimale" : justificationArrondi(r))] : [];
}

/** Retire une ligne de calcul identique à la précédente (même LaTeX). */
export function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.filter((l, i) => i === 0 || l.latex !== lignes[i - 1].latex);
}

/** La formule est-elle déjà un seul groupe `{…}` ? */
function dejaGroupee(v: string): boolean {
  if (!v.startsWith("{") || !v.endsWith("}")) return false;
  let p = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === "\\") {
      i++;
      continue;
    }
    if (v[i] === "{") p++;
    else if (v[i] === "}") {
      p--;
      if (p === 0 && i < v.length - 1) return false;
    }
  }
  return true;
}

/**
 * Formules des lignes de TEXTE rendues insécables (`{…}` : un seul bloc KaTeX) — contrôle « formule
 * coupée » du lot E : KaTeX en ligne passe à la ligne après un « = » ou un « + » de niveau 0, et une
 * formule se retrouvait scindée en bout de ligne (« P(X = 2) = » / « 0,149 »). Les lignes de CALCUL
 * (alignées sur leur relation) ne passent pas par ici.
 */
export function insecables(fragments: Fragments): Fragments {
  return fragments.map((f) => (f.type === "latex" && !dejaGroupee(f.valeur) ? { ...f, valeur: `{${f.valeur}}` } : f));
}

export function finaliserCombinatoire(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => ({
    ...e,
    fragments: insecables(e.fragments),
    ...(e.calcul ? { calcul: sansDoublons(e.calcul).map((l) => (Array.isArray(l.justification) ? { ...l, justification: insecables(l.justification) } : l)) } : {}),
  }));
}

/** Lignes du corrigé de l'écran `p` (même source que le papier) : lettre = rang de l'écran. */
export function corrigeDeLEcran<P extends string>(etapes: EtapeCorrection[], phases: P[], p: P): EtapeCorrection[] {
  return lignesDeLEtape(etapes, lettreEtape(Math.max(0, phases.indexOf(p))));
}

/** « Ce qu'on utilise » suivi du renvoi au cours (« (cours, § 5) »). */
export function utiliseCours(sq: string, fragments: Fragments, renvoi: string): EtapeCorrection {
  return utilise(sq, [...fragments, texte(` (${renvoi}).`)]);
}

/** Calcul d'une suite de facteurs « gauche = a × b × … » puis le produit. */
export function lignesProduit(gauche: string, facteurs: (number | bigint)[], justification?: string | Fragments): LigneCalcul[] {
  const valeur = facteurs.reduce<bigint>((a, b) => a * BigInt(b), 1n);
  if (facteurs.length === 1) return [ligne(`${gauche}=${milliers(valeur)}`, justification)];
  return [ligne(`${gauche}=${produit(facteurs)}`, justification), ligne(`=${milliers(valeur)}`)];
}
