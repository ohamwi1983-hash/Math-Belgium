import type { FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { OptionDetective } from "../../core/detectiveEspace.types";
import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import { normalePlan, normeCarree3D, EPSILON_3D, pointAppartientAuPlan, points3Colineaires } from "../solide3D/geometrieEspace";

/**
 * Outils communs aux thèmes de gen107. Tout le hasard passe par `Math.random` (remplacé par une
 * graine dans `genererAvecCode` : le QR code d'une feuille rouvre le MÊME exercice).
 */

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** Un fragment de texte seul. */
export function t(s: string): FragmentConsigne[] {
  return [texte(s)];
}

/** La bonne proposition et ses leurres, dans un ordre mélangé. */
export function propositions(correcte: FragmentConsigne[], leurres: FragmentConsigne[][]): OptionDetective[] {
  return melanger([{ fragments: correcte, correcte: true }, ...leurres.map((fragments) => ({ fragments, correcte: false }))]);
}

/** « (AB) » ; « [AB] » ; « (ABC) ». */
export const dr = (a: string, b: string) => `(${a}${b})`;
export const sg = (a: string, b: string) => `[${a}${b}]`;
export const pl = (noms: readonly string[]) => `(${noms.join("")})`;

/** « A, I et C ». */
export function listeEt(noms: readonly string[]): string {
  if (noms.length <= 1) return noms.join("");
  return `${noms.slice(0, -1).join(", ")} et ${noms[noms.length - 1]}`;
}

/** Libellé du solide : « le cube ABCDEFGH », « la pyramide SABCD »… */
export function libelleSolide(solide: Solide3D): string {
  const s = Object.keys(solide.sommets);
  switch (solide.id) {
    case "cube":
      return `le cube ${s.join("")}`;
    case "parallelepipede":
      return `le parallélépipède rectangle ${s.join("")}`;
    case "prisme":
      return `le prisme droit ${s.join("")}`;
    case "pyramideCarree":
      return `la pyramide ${["S", ...s.filter((n) => n !== "S")].join("")}`;
    default:
      return `le tétraèdre ${s.join("")}`;
  }
}

/** « Sur le cube ABCDEFGH ci-contre, I est le milieu de [EF] et J le centre de la face ABCD. » */
export function definitions(points: { nom: string; definition: string }[]): string {
  if (points.length === 0) return "";
  const morceaux = points.map((x, i) => (i === 0 ? `${x.nom} est ${x.definition}` : `${x.nom} ${x.definition}`));
  return `${listeEt(morceaux)}.`;
}

/** Point nommé d'une copie (sommet ou point défini). */
export interface PointNomme {
  nom: string;
  position: Point3D;
}

/** Plans passant par au moins 3 points nommés, chacun avec TOUS les points nommés qu'il contient. */
export function plansDesPoints(nommes: PointNomme[]): PointNomme[][] {
  const vus = new Set<string>();
  const plans: PointNomme[][] = [];
  for (let i = 0; i < nommes.length; i++) {
    for (let j = i + 1; j < nommes.length; j++) {
      for (let k = j + 1; k < nommes.length; k++) {
        const trois: [Point3D, Point3D, Point3D] = [nommes[i]!.position, nommes[j]!.position, nommes[k]!.position];
        if (normeCarree3D(normalePlan(...trois)) < EPSILON_3D) continue;
        const contenus = nommes.filter((c) => pointAppartientAuPlan(c.position, trois));
        const cle = contenus.map((c) => c.nom).join(",");
        if (vus.has(cle)) continue;
        vus.add(cle);
        plans.push(contenus);
      }
    }
  }
  return plans;
}

export function contient(plan: PointNomme[], nom: string): boolean {
  return plan.some((p) => p.nom === nom);
}

/** Ordre d'écriture des lettres d'un nom : sommets dans l'ordre alphabétique, puis points définis. */
function rang(nom: string, sommets: readonly string[]): string {
  return sommets.includes(nom) ? `0${nom}` : `1${nom}`;
}

/** Nom d'un plan par 3 de ses points non alignés, tirés au hasard (les `obligatoires` y figurent
 * toujours, les `interdits` jamais). Lettres écrites dans l'ordre : sommets, puis points définis. */
export function nommerPlan(plan: PointNomme[], sommets: readonly string[], obligatoires: string[] = [], interdits: string[] = []): string[] | null {
  const dispo = plan.filter((p) => !interdits.includes(p.nom));
  const triples: PointNomme[][] = [];
  for (let i = 0; i < dispo.length; i++) {
    for (let j = i + 1; j < dispo.length; j++) {
      for (let k = j + 1; k < dispo.length; k++) {
        const tri = [dispo[i]!, dispo[j]!, dispo[k]!];
        if (points3Colineaires(tri[0]!.position, tri[1]!.position, tri[2]!.position)) continue;
        if (obligatoires.some((o) => !tri.some((p) => p.nom === o))) continue;
        triples.push(tri);
      }
    }
  }
  if (triples.length === 0) return null;
  return choisir(triples)
    .map((p) => p.nom)
    .sort((a, b) => rang(a, sommets).localeCompare(rang(b, sommets)));
}

/** Indice de la face qui contient tous ces points (`-1` sinon). */
export function faceContenant(solide: Solide3D, points: Point3D[]): number {
  return solide.faces.findIndex((f) => {
    const trois = f.slice(0, 3).map((n) => solide.sommets[n]!) as [Point3D, Point3D, Point3D];
    return points.every((p) => pointAppartientAuPlan(p, trois));
  });
}

/** Nom usuel d'une face : plus petite lettre d'abord, dans le sens où la suivante est la plus petite. */
export function nomFace(face: readonly string[]): string {
  const n = face.length;
  const i = face.indexOf([...face].sort()[0]!);
  const avant = face[(i - 1 + n) % n]!;
  const apres = face[(i + 1) % n]!;
  const sens = apres < avant ? 1 : -1;
  return Array.from({ length: n }, (_, k) => face[(i + sens * k + 2 * n) % n]!).join("");
}

/** Met une majuscule à la première lettre. */
export function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lettres I, J, K, L… pour les points définis. */
export const LETTRES = ["I", "J", "K", "L", "M"];

/** Débuts neutres d'une description d'erreur (écran b), tirés indépendamment pour CHAQUE
 * proposition : la longueur d'une proposition ne désigne plus la bonne (mesuré : sans eux, la bonne
 * description était souvent la plus longue ou la plus courte d'une même variante). */
const DEBUTS = ["", "En fait, ", "Ici, ", "Il faut voir que "];

function avecDebut(f: FragmentConsigne[], debut: string): FragmentConsigne[] {
  if (!debut || f.length === 0 || f[0]!.type !== "texte") return f;
  const v = f[0]!.valeur;
  // Minuscule seulement pour un mot courant (« Les », « C'est »…), jamais pour un nom de point ou de face.
  const premier = /^[A-ZÉ][a-zéèàù']/.test(v) ? v.charAt(0).toLowerCase() + v.slice(1) : v;
  return [{ type: "texte", valeur: debut + premier }, ...f.slice(1)];
}

/** Une description sans son début neutre (corrigé : « Erreur : … » se lit mieux sans « En fait, »). */
export function retirerDebut(f: FragmentConsigne[]): FragmentConsigne[] {
  if (f.length === 0 || f[0]!.type !== "texte") return f;
  const v = f[0]!.valeur;
  const debut = DEBUTS.find((d) => d && v.startsWith(d));
  if (!debut) return f;
  const reste = v.slice(debut.length);
  return [{ type: "texte", valeur: reste.charAt(0).toUpperCase() + reste.slice(1) }, ...f.slice(1)];
}

/** Variante « : en effet, » d'une proposition « verdict : justification » (écran c des thèmes
 * droites et plan), quand elle se lit naturellement. */
function variantesEnEffet(f: FragmentConsigne[]): FragmentConsigne[][] {
  if (f.length === 0 || f[0]!.type !== "texte" || !f[0]!.valeur.includes(" : ") || f[0]!.valeur.includes(" : le plan (")) return [f];
  // Après « : », ces propositions commencent toujours par un mot en minuscule ou par un nom.
  return [f, [{ type: "texte", valeur: f[0]!.valeur.replace(" : ", " : en effet, ") }, ...f.slice(1)]];
}

const longueur = (f: FragmentConsigne[]) => f.reduce((s, x) => s + x.valeur.length, 0);

/**
 * Choisit une variante (même idée, tournure plus ou moins longue) pour chaque proposition, de sorte
 * que le RANG de la bonne proposition par longueur soit tiré au hasard parmi les rangs possibles :
 * mesuré sans ce choix, la bonne proposition était souvent la plus longue (ou la plus courte), ce qui
 * se devinait sans lire. `options[0]` est la bonne proposition.
 */
function equilibrer(options: FragmentConsigne[][], variantes: (f: FragmentConsigne[]) => FragmentConsigne[][]): FragmentConsigne[][] {
  const choix = options.map(variantes);
  let combos: number[][] = [[]];
  for (const v of choix) combos = combos.flatMap((c) => v.map((_, k) => [...c, k]));
  const parRang = new Map<number, number[][]>();
  for (const c of combos) {
    const l = c.map((k, i) => longueur(choix[i]![k]!));
    if (l.slice(1).some((x) => x === l[0])) continue; // jamais d'égalité avec la bonne
    const rang = l.slice(1).filter((x) => x > l[0]!).length;
    parRang.set(rang, [...(parRang.get(rang) ?? []), c]);
  }
  const rangs = [...parRang.keys()].sort();
  const combo = rangs.length > 0 ? choisir(parRang.get(choisir(rangs))!) : choisir(combos);
  return combo.map((k, i) => choix[i]![k]!);
}

export function propositionsVariees(correcte: FragmentConsigne[], leurres: FragmentConsigne[][]): OptionDetective[] {
  const [c, ...l] = equilibrer([correcte, ...leurres], variantesEnEffet);
  return propositions(c!, l);
}

export function descriptionsVariees(correcte: FragmentConsigne[], leurres: FragmentConsigne[][]): OptionDetective[] {
  const [c, ...l] = equilibrer([correcte, ...leurres], (f) => DEBUTS.map((d) => avecDebut(f, d)));
  return propositions(c!, l);
}
