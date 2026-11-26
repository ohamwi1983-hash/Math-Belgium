import { decomposer, ent, estPremier, parmi } from "../communReels/outilsReels";
import type { ExerciceIrrationalite, VarianteIrrationalite, VerdictIrrationalite } from "./core/types";

/**
 * Couche A — générateur de `56gen15`. `Math.random()` seul (le `?code=` rejoue le tirage). Le
 * verdict est tiré à 50/50 AVANT N, puis N dans la MÊME plage pour les deux verdicts (carrée : 12 à
 * 200 ; grande : 200 à 1 000 ; cubique : 16 à 1 000). N n'est jamais premier (la décomposition doit
 * avoir au moins deux facteurs premiers, comptés avec leur exposant) ; un N irrationnel sur deux a un
 * facteur puissance k-ième (√72 = √(36 · 2) : la racine se simplifie mais reste irrationnelle).
 */

export type IdVarianteIrrationalite = VarianteIrrationalite;

export const CATALOGUE_VARIANTES: { id: IdVarianteIrrationalite; label: string }[] = [
  { id: "carree", label: "Racine carrée (N ≤ 200)" },
  { id: "grande", label: "Racine carrée d'un grand nombre (200 à 1 000)" },
  { id: "cubique", label: "Racine cubique" },
];

const PLAGES: Record<VarianteIrrationalite, [number, number]> = { carree: [12, 200], grande: [200, 1000], cubique: [16, 1000] };

const nombreFacteurs = (n: number) => decomposer(n).reduce((s, [, e]) => s + e, 0);
const estPuissance = (n: number, k: number) => Math.round(n ** (1 / k)) ** k === n;

function tirerN(variante: VarianteIrrationalite, verdict: VerdictIrrationalite): number {
  const k = variante === "cubique" ? 3 : 2;
  const [a, b] = PLAGES[variante];
  if (verdict === "naturel") {
    const racines: number[] = [];
    for (let m = 2; m ** k <= b; m++) if (m ** k >= a && nombreFacteurs(m ** k) >= 2) racines.push(m);
    return parmi(racines) ** k;
  }
  for (;;) {
    let n: number;
    if (Math.random() < 0.5) {
      const c = ent(2, k === 2 ? 12 : 5);
      const r = ent(2, Math.floor(b / c ** k));
      n = c ** k * r;
    } else n = ent(a, b);
    if (n < a || n > b || estPuissance(n, k) || estPremier(n) || nombreFacteurs(n) < 2) continue;
    return n;
  }
}

function construire(variante: VarianteIrrationalite): ExerciceIrrationalite {
  const verdict: VerdictIrrationalite = Math.random() < 0.5 ? "naturel" : "irrationnel";
  const k: 2 | 3 = variante === "cubique" ? 3 : 2;
  const N = tirerN(variante, verdict);
  const facteurs = decomposer(N);
  const temoin = facteurs.find(([, e]) => e % k !== 0);
  return {
    variante,
    k,
    N,
    verdict,
    facteurs,
    racine: verdict === "naturel" ? Math.round(N ** (1 / k)) : null,
    premierTemoin: temoin ? temoin[0] : null,
  };
}

export function construireAvecVarianteId(id: IdVarianteIrrationalite): ExerciceIrrationalite {
  return construire(id);
}

export function genererExerciceIrrationalite(): ExerciceIrrationalite {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
