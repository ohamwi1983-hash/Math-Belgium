import type { Exercice161, Jeu, Variante161, Verdict161 } from "../../core6e/quelJeuChoisir";
import { CONTEXTES_161, VERDICTS_161, catalogueJeux, famille, proba } from "../../core6e/quelJeuChoisir";
import { q, qVal } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen161` « Quel jeu choisir ? ». `Math.random()` seul (`?code=` : mêmes
 * fonctions que l'adaptateur papier). Le VERDICT (jeu A / jeu B / autant de chances) est tiré au
 * tiers AVANT de choisir les jeux ; les paires possibles sont précalculées une fois (catalogue
 * déterministe) : paires de probabilités ÉGALES construites exprès (deux jeux différents), paires
 * différentes à au plus 0,12 d'écart (la comparaison ne saute jamais aux yeux). Deux jeux de même
 * structure (roue 2 secteurs sur 4 et 3 sur 6, urnes avec remise de même proportion) ne sont jamais
 * mis face à face. Aucun nom de variante ne dit le verdict.
 */

export const CATALOGUE_VARIANTES: { id: Variante161; label: string }[] = [
  { id: "des", label: "Dés et pièces" },
  { id: "urnes", label: "Urnes : avec ou sans remise" },
  { id: "melange", label: "Deux jeux de natures différentes (dé, pièces, urne, roue)" },
];

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)];

/** Clé de structure : deux jeux de même clé sont « le même jeu » (mêmes probabilités à chaque étape). */
function structure(j: Jeu): string {
  if (j.type === "roue") {
    const g = q(j.k, j.n);
    return `roue|${j.evt}|${g.n}/${g.d}`;
  }
  if (j.type === "urne") {
    // Événements symétriques (même couleur, couleurs différentes) : rouges et vertes échangeables.
    const sym = j.evt === "meme" || j.evt === "differentes";
    const [r, v] = sym ? [Math.min(j.r, j.v), Math.max(j.r, j.v)] : [j.r, j.v];
    if (!j.remise) return `urneS|${j.evt}|${r}|${v}`;
    const g = q(r, r + v);
    return `urneR|${j.evt}|${g.n}/${g.d}`;
  }
  // Sommes symétriques (s et 14 − s), pièces symétriques (k et n − k « exactement ») : même jeu.
  if (j.type === "somme" && j.mode === "egal") return `somme|${Math.min(j.s, 14 - j.s)}`;
  if (j.type === "pieces" && j.mode === "exactement") return `pieces|${j.n}|${Math.min(j.k, j.n - j.k)}`;
  return JSON.stringify(j);
}

function dansVariante(v: Variante161, a: Jeu, b: Jeu): boolean {
  const fa = famille(a);
  const fb = famille(b);
  if (v === "des") return (fa === "de" || fa === "pieces") && (fb === "de" || fb === "pieces");
  if (v === "urnes") return fa === "urne" && fb === "urne";
  return fa !== fb;
}

/** Groupe d'un jeu pour équilibrer le tirage des paires (sinon roue + urne écrasait tout). */
function groupe(v: Variante161, j: Jeu): string {
  if (v === "melange") return famille(j);
  return j.type === "urne" ? `urne${j.remise ? "R" : "S"}-${j.evt}` : j.type;
}

interface Listes {
  /** Paires groupées par couple de groupes : le groupe est tiré (poids √taille), puis la paire. */
  egal: [number, number][][];
  differents: [number, number][][];
}

let JEUX: Jeu[] | null = null;
let PROBAS: number[] = [];
const LISTES: Partial<Record<Variante161, Listes>> = {};

function jeux(): Jeu[] {
  if (!JEUX) {
    JEUX = catalogueJeux();
    PROBAS = JEUX.map((j) => qVal(proba(j)));
  }
  return JEUX;
}

/** Paires (indices, i < j) de la variante : égales / différentes d'au plus 0,12. */
export function listesVariante(v: Variante161): Listes {
  const deja = LISTES[v];
  if (deja) return deja;
  const J = jeux();
  const cles = J.map(structure);
  const egal = new Map<string, [number, number][]>();
  const differents = new Map<string, [number, number][]>();
  const ajouter = (m: Map<string, [number, number][]>, i: number, k: number) => {
    const g = [groupe(v, J[i]), groupe(v, J[k])].sort().join("+");
    const l = m.get(g);
    if (l) l.push([i, k]);
    else m.set(g, [[i, k]]);
  };
  for (let i = 0; i < J.length; i++)
    for (let k = i + 1; k < J.length; k++) {
      if (cles[i] === cles[k] || !dansVariante(v, J[i], J[k])) continue;
      const d = Math.abs(PROBAS[i] - PROBAS[k]);
      if (d < 1e-12) ajouter(egal, i, k);
      else if (d <= 0.12) ajouter(differents, i, k);
    }
  LISTES[v] = { egal: [...egal.values()], differents: [...differents.values()] };
  return LISTES[v]!;
}

/** Groupe tiré avec un poids √(taille) : ni un groupe énorme (roue + urne) ni une paire isolée ne domine. */
function groupePondere(groupes: [number, number][][]): [number, number][] {
  const poids = groupes.map((g) => Math.sqrt(g.length));
  let r = Math.random() * poids.reduce((a, b) => a + b, 0);
  for (let i = 0; i < groupes.length; i++) {
    r -= poids[i];
    if (r < 0) return groupes[i];
  }
  return groupes[groupes.length - 1];
}

export function construireAvecVariante(id: string, verdictImpose?: Verdict161): Exercice161 {
  const variante = (CATALOGUE_VARIANTES.some((x) => x.id === id) ? id : "des") as Variante161;
  // Verdict tiré AVANT les jeux, au tiers.
  const verdict = verdictImpose ?? parmi(VERDICTS_161);
  const L = listesVariante(variante);
  const J = jeux();
  const [i, k] = parmi(groupePondere(verdict === "egal" ? L.egal : L.differents));
  let a = i;
  let b = k;
  if (verdict === "egal") {
    if (Math.random() < 0.5) [a, b] = [b, a];
  } else {
    const iPlus = PROBAS[i] > PROBAS[k] ? i : k;
    const iMoins = iPlus === i ? k : i;
    [a, b] = verdict === "A" ? [iPlus, iMoins] : [iMoins, iPlus];
  }
  return { variante, verdict, ctx: Math.floor(Math.random() * CONTEXTES_161.length), jeuA: J[a], jeuB: J[b] };
}

export function genererExercice161(): Exercice161 {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}

/** Verdict recalculé depuis les deux probabilités exactes. */
export function verdictCalcule161(e: Exercice161): Verdict161 {
  const a = proba(e.jeuA);
  const b = proba(e.jeuB);
  const d = a.n * b.d - b.n * a.d;
  return d === 0 ? "egal" : d > 0 ? "A" : "B";
}
