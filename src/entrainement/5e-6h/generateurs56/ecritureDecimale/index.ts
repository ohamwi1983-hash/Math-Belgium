import { ent, melanger, parmi, pgcd } from "../communReels/outilsReels";
import { developper, seulement2et5, valeurDeveloppement } from "./core/decimales";
import type { Developpement } from "./core/decimales";
import type { ExerciceDecimale, VarianteDecimale, VerdictCritere } from "./core/types";

/**
 * Couche A — générateur de `56gen16`. `Math.random()` seul (le `?code=` rejoue le tirage).
 * - diviser : fraction irréductible PÉRIODIQUE, période de 1 à 6 chiffres, numérateur parfois plus
 *   grand que le dénominateur (2617/7) ;
 * - versFraction : 0 à 2 chiffres avant la période, période de 1 à 3 chiffres (minimale), partie entière
 *   0 à 9 ; une fois sur six la période est « 9 » (7,07999… = 7,08) ;
 * - critere : verdict limitée / périodique tiré à 50/50 AVANT la fraction ; la fraction donnée est
 *   toujours réductible (facteur commun g pris dans la même liste pour les deux verdicts : quand le
 *   verdict est « limitée », un facteur 3, 7 ou 11 du dénominateur donné disparaît en simplifiant).
 */

export type IdVarianteDecimale = VarianteDecimale;

export const CATALOGUE_VARIANTES: { id: IdVarianteDecimale; label: string }[] = [
  { id: "diviser", label: "Fraction → écriture décimale et période" },
  { id: "versFraction", label: "Écriture périodique → fraction irréductible" },
  { id: "critere", label: "Limitée ou périodique ? (dénominateur)" },
];

const VIDE = { numDonne: 0, denDonne: 0, g: 1, verdict: null, k: 0, p: 0, paires: [] as [number, number][], neuf: false, lignesDivision: [], resteRepete: null };

function construireDiviser(): ExerciceDecimale {
  for (;;) {
    const den = ent(3, 75);
    if (seulement2et5(den)) continue;
    const num = Math.random() < 0.25 ? ent(den + 1, 40 * den) : ent(1, den - 1);
    if (pgcd(num, den) !== 1) continue;
    const { dev, lignes, resteRepete } = developper(num, den);
    if (dev.periode.length < 1 || dev.periode.length > 6 || dev.avant.length > 3) continue;
    return { ...VIDE, variante: "diviser", num, den, dev, lignesDivision: lignes, resteRepete };
  }
}

/** Paires d'exposants proposées (la bonne en premier), triées ensuite par ordre croissant. */
function paires(k: number, p: number): [number, number][] {
  const bonne: [number, number] = [k + p, k];
  const candidats: [number, number][] = [
    [p, 0],
    [k + p + 1, k],
    [k + p, k + 1],
    [k, 0],
    [p + 1, 1],
    [k + p + 1, k + 1],
    [2 * p, 0],
  ];
  const vus = new Set([`${bonne}`]);
  const autres: [number, number][] = [];
  for (const c of melanger(candidats)) {
    if (c[0] <= c[1] || vus.has(`${c}`)) continue;
    vus.add(`${c}`);
    autres.push(c);
    if (autres.length === 3) break;
  }
  return [bonne, ...autres].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

function construireVersFraction(): ExerciceDecimale {
  for (;;) {
    const neuf = Math.random() < 1 / 6;
    const k = neuf ? ent(1, 2) : ent(0, 2);
    const p = neuf ? 1 : ent(1, 3);
    const entier = Math.random() < 0.5 ? 0 : ent(1, 9);
    const avant = Array.from({ length: k }, () => ent(0, 9)).join("");
    const periode = neuf ? "9" : Array.from({ length: p }, () => ent(0, 9)).join("");
    if (!neuf && /^9+$/.test(periode)) continue;
    const dev: Developpement = { negatif: false, entier, avant, periode };
    const v = valeurDeveloppement(dev);
    if (neuf) {
      if (avant.endsWith("9") || v.n === 0) continue;
    } else {
      // Période minimale et partie avant la période minimale : le développement recalculé doit être le même.
      const re = developper(v.n, v.d).dev;
      if (re.avant !== avant || re.periode !== periode || /^0+$/.test(periode)) continue;
    }
    return { ...VIDE, variante: "versFraction", num: v.n, den: v.d, dev, k, p, paires: paires(k, p), neuf };
  }
}

const DEN_LIMITES = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50];
const DEN_PERIODIQUES = [3, 6, 7, 9, 11, 12, 14, 15, 18, 21, 22, 24, 30, 33, 35, 45];
const FACTEURS = [2, 3, 4, 5, 6, 7, 9, 11, 12];

function construireCritere(): ExerciceDecimale {
  const verdict: VerdictCritere = Math.random() < 0.5 ? "limitee" : "periodique";
  for (;;) {
    const den = parmi(verdict === "limitee" ? DEN_LIMITES : DEN_PERIODIQUES);
    const num = ent(1, 3 * den);
    if (pgcd(num, den) !== 1 || num % den === 0) continue;
    const g = parmi(FACTEURS);
    if (den * g > 600) continue;
    const { dev } = developper(num, den);
    return { ...VIDE, variante: "critere", num, den, dev, numDonne: num * g, denDonne: den * g, g, verdict };
  }
}

export function construireAvecVarianteId(id: IdVarianteDecimale): ExerciceDecimale {
  if (id === "diviser") return construireDiviser();
  if (id === "versFraction") return construireVersFraction();
  return construireCritere();
}

export function genererExerciceDecimale(): ExerciceDecimale {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
