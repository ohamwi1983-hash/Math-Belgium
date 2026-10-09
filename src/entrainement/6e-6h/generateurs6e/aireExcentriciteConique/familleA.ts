import type { ExerciceFamilleA, FractionExacte } from "../../core6e/aireExcentriciteConique.types";
import { reduireFraction, tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — famille A de `6gen60` ("Aire du triangle foyer-point-foyer"). Ellipse
 * x²/a²+y²/b²=1 (a,b tirés entiers, a>b), P un point de l'ellipse tel que |PF|=k·|PF'| (k tiré,
 * k≠1). AUCUNE infrastructure platform réutilisable ici (géométrie neuve pour le chapitre, voir
 * en-tête `core6e/aireExcentriciteConique.types.ts`) : tout calculé localement, en arithmétique
 * EXACTE (fractions) jusqu'à `cosAngle` inclus — seule l'aire finale (`sin(angle)`) retombe en
 * `number` flottant, génériquement irrationnelle.
 *
 * ## Dérivation
 *
 * Écran 1 — système `{|PF|+|PF'|=2a, |PF|=k|PF'|}` (PIÈGE CENTRAL : point d'entrée obligatoire,
 * aucune autre donnée ne fixe |PF|/|PF'| individuellement) : avec `k=p/q` (fraction réduite),
 * `D=p+q` → `|PF'|=2aq/D`, `|PF|=2ap/D`.
 *
 * Écran 2 — loi des cosinus dans FPF' (`|FF'|=2c`, `|FF'|²=4c²=4(a²-b²)` — jamais besoin de `c`
 * lui-même, potentiellement irrationnel) :
 * `cos(angle) = (|PF|²+|PF'|²-4c²) / (2|PF||PF'|)`. En posant `Npf=2ap`,`Npfprime=2aq` (numérateurs
 * AVANT réduction individuelle, dénominateur commun `D`), ceci se réécrit ENTIÈREMENT en entiers :
 * `cos(angle) = (Npf²+Npfprime²-4·cCarre·D²) / (2·Npf·Npfprime)` — TOUJOURS rationnel (aucune racine
 * n'intervient), contrairement à `c` lui-même.
 *
 * Écran 3 — `sin(angle)=√(1-cos²(angle))` (angle nécessairement dans ]0°;180°[, voir garde
 * `b/a≤0.8` ci-dessous) puis `aire=(1/2)|PF||PF'|sin(angle)`.
 *
 * ## Garde de génération — existence RÉELLE du point P
 *
 * Pour k>1 fixé, `|PF|=2ak/(k+1)` doit rester dans `[a-c,a+c]` (plage réellement atteinte par
 * `|PF|` quand P parcourt l'ellipse) pour qu'un point P existe VRAIMENT — sans quoi le triangle
 * FPF' ne se refermerait pas (`|cos(angle)|≥1`). Cette condition se réduit à
 * `b/a ≤ 2√k/(k+1)` ; le plus petit seuil sur `k∈{3/2,2,5/2,3}` vaut `√3/2≈0.866` (k=3) — imposer
 * `b ≤ ⌊0.8·a⌋` (marge confortable, jamais pile au seuil) garantit un point P réel pour TOUTE
 * combinaison `(a,b,k)` tirée, quel que soit `k`.
 */

const CHOIX_K: FractionExacte[] = [
  { num: 3, den: 2 },
  { num: 2, den: 1 },
  { num: 5, den: 2 },
  { num: 3, den: 1 },
];

interface OverridesFamilleA {
  a?: number;
  b?: number;
  k?: FractionExacte;
}

export function construireFamilleA(overrides: OverridesFamilleA = {}): ExerciceFamilleA {
  const a = overrides.a ?? tirerEntier(4, 9);
  const bMax = Math.max(2, Math.floor(0.8 * a));
  const b = overrides.b ?? tirerEntier(2, bMax);
  const k = overrides.k ?? tirerParmi(CHOIX_K);

  const cCarre = a * a - b * b;
  const D = k.num + k.den;
  const Npf = 2 * a * k.num;
  const NpfPrime = 2 * a * k.den;

  const pf = reduireFraction(Npf, D);
  const pfPrime = reduireFraction(NpfPrime, D);

  const cosNum = Npf * Npf + NpfPrime * NpfPrime - 4 * cCarre * D * D;
  const cosDen = 2 * Npf * NpfPrime;
  const cosAngle = reduireFraction(cosNum, cosDen);

  const cosValue = cosAngle.num / cosAngle.den;
  const sinValue = Math.sqrt(Math.max(0, 1 - cosValue * cosValue));
  const pfValue = pf.num / pf.den;
  const pfPrimeValue = pfPrime.num / pfPrime.den;
  const aire = 0.5 * pfValue * pfPrimeValue * sinValue;

  return { famille: "A", a, b, k, cCarre, pfPrime, pf, cosAngle, aire };
}
