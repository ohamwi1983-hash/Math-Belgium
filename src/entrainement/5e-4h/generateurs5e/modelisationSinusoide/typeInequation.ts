/**
 * Couche A (5e) — Phase 2, Type 3 de 5gen13 ("Résoudre f(t)≥k ou f(t)≤k"), technique NOUVELLE sur
 * la plateforme. Isole `sin(ωt+φ)◇m` (m=(k-b)/A), résout le cas général `sin(u)◇m` par bornes
 * `[borneInfU;borneSupU]` (répétées tous les 2π), isole t (division par ω), puis balaie k pour
 * lister les sous-intervalles de t contenus dans [0;fenêtre].
 *
 * Preuve des bornes générales (voir aussi `typeInequation.test.ts`, cross-vérifié par échantillon
 * du signe de sin en dehors/dedans) : sin(u)≥m ⟺ u∈[arcsin(m);π−arcsin(m)] (mod 2π) — l'arc "haut"
 * du cercle contenant π/2, où sin atteint son maximum. Le complémentaire (sin(u)≤m) est donc l'arc
 * "bas" contenant −π/2 (ou 3π/2) : u∈[π−arcsin(m);2π+arcsin(m)] (mod 2π) — même largeur de période
 * 2π que le cas 'ge', bornes différentes.
 */
import type { FonctionModelisationSinusoide, IntervalleModelisation, QuestionInequation } from "../../core5e/modelisationSinusoide.types";

export function casSpecialPourM(m: number, sens: "ge" | "le"): "toujoursVrai" | "toujoursFaux" {
  // sin(u)∈[-1;1] toujours : sin(u)>=m est structurellement vrai si m<=-1, faux si m>1 ; l'inverse pour <=.
  if (sens === "ge") return m < -1 ? "toujoursVrai" : "toujoursFaux";
  return m > 1 ? "toujoursVrai" : "toujoursFaux";
}

/** Intersecte l'intervalle [inf;sup] répété tous les `periode` avec [0;fenetre] — balayage BORNÉ de
 * k, jamais de solveur analytique du nombre exact d'intervalles. Résultat trié, jamais de
 * chevauchement (les répétitions de période sont, par construction, disjointes dès que
 * `sup-inf<periode`). */
export function intervallesDansFenetre(inf: number, sup: number, periode: number, fenetre: number): IntervalleModelisation[] {
  const K_MIN = -200;
  const K_MAX = 200;
  const resultat: IntervalleModelisation[] = [];
  for (let k = K_MIN; k <= K_MAX; k++) {
    const debut = inf + k * periode;
    const fin = sup + k * periode;
    const interInf = Math.max(0, debut);
    const interSup = Math.min(fenetre, fin);
    if (interInf <= interSup) resultat.push({ inf: interInf, sup: interSup });
  }
  resultat.sort((a, b) => a.inf - b.inf);
  return resultat;
}

const PROBABILITE_SOLVABLE = 0.75;

function reelAleatoire(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function genererQuestionInequation(fonction: FonctionModelisationSinusoide, fenetre: number): QuestionInequation {
  const { A, omega, phi, b } = fonction;
  if (phi === null) throw new Error("genererQuestionInequation : phi doit être numériquement connu (jamais tiré pour la technique 'b1')");

  const sens: "ge" | "le" = Math.random() < 0.5 ? "ge" : "le";
  const solvable = Math.random() < PROBABILITE_SOLVABLE;
  const m = solvable ? reelAleatoire(-0.85, 0.85) : reelAleatoire(1.05, 1.6) * (Math.random() < 0.5 ? 1 : -1);
  const k = A * m + b;

  if (!solvable) {
    const casSpecial = casSpecialPourM(m, sens);
    return { type: "inequation", k, sens, fenetre, m, casSpecial, borneInfU: 0, borneSupU: 0, borneInfT: 0, borneSupT: 0, intervalles: [] };
  }

  const arc = Math.asin(m);
  const [borneInfU, borneSupU] = sens === "ge" ? [arc, Math.PI - arc] : [Math.PI - arc, 2 * Math.PI + arc];

  const borneInfT = (borneInfU - phi) / omega;
  const borneSupT = (borneSupU - phi) / omega;
  const periodeT = (2 * Math.PI) / omega;

  const intervalles = intervallesDansFenetre(borneInfT, borneSupT, periodeT, fenetre);

  return { type: "inequation", k, sens, fenetre, m, casSpecial: null, borneInfU, borneSupU, borneInfT, borneSupT, intervalles };
}
