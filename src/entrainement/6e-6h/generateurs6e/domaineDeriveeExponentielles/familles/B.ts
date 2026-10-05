import type { ExerciceDomaineDeriveeB, ExerciceDomaineDeriveeBFraction, ExerciceDomaineDeriveeBRacine } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ensembleDeuxMorceaux, ensemblePrivePoints, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntier, tirerParmi } from "../aleatoire";

const BASES = [2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Famille B — a^u avec u à domaine restreint DANS L'EXPOSANT (2 écrans : domaine, dérivée). Base
 * TOUJOURS entière (littéral spec, aucun des deux sous-types ne mentionne "e").
 *
 * Sous-type "racine" — f(x) = base^(√(x²−k²)). u=√(x²−k²) n'est défini que pour x²≥k² — domaine
 * ]-∞;-k]∪[k;+∞[, directement `k` (aucun calcul supplémentaire nécessaire, "cible d'abord" trivial
 * puisque k EST déjà la borne). u'(x) = x/√(x²−k²) (chaîne), f'(x) = ln(base)·base^u·u'.
 *
 * Sous-type "fraction" — f(x) = base^((mx+n)/(px+q)), p≠0 (garanti, p∈{1,2,3}). u=(mx+n)/(px+q),
 * domaine ℝ\{-q/p} — la seule valeur qui annule le dénominateur. u' par la règle du quotient :
 * u'(x) = (m(px+q)−p(mx+n))/(px+q)² = (mq−np)/(px+q)² (constante au numérateur, jamais fonction de
 * x — développée ici pour rester honnête sur le calcul réel plutôt que la forme réduite).
 */
export function construireB(): ExerciceDomaineDeriveeB {
  return Math.random() < 0.5 ? construireRacine() : construireFraction();
}

function construireRacine(): ExerciceDomaineDeriveeBRacine {
  const base = tirerParmi(BASES);
  const k = tirerEntier(1, 4);
  const domaine = ensembleDeuxMorceaux(versLeBasJusque(-k, true), versLeHautDepuis(k, true));
  return { famille: "B", sousType: "racine", domaine, base, k };
}

/** Retry BORNÉ pour éviter un cas dégénéré : si `mq=np`, les polynômes `mx+n` et `px+q` sont
 * PROPORTIONNELS (même racine `-q/p`) — u(x) devient CONSTANT (=m/p) partout hors du point exclu,
 * une "fraction" qui n'en est pas vraiment une (`u'=0` partout, dérivée triviale) — jamais le cas
 * pédagogiquement voulu par la spec. Rare (une seule coïncidence entière), mais réel — trouvé par
 * test avant tout code de présentation, jamais supposé a priori (voir CLAUDE.md, "Création — 6gen7"). */
const TENTATIVES_MAX = 200;

function construireFraction(): ExerciceDomaineDeriveeBFraction {
  const base = tirerParmi(BASES);
  const m = tirerParmi([1, 2, 3] as const);
  const p = tirerParmi([1, 2, 3] as const);
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const n = tirerEntier(-4, 4);
    const q = tirerEntier(-4, 4);
    if (m * q === n * p) continue;
    const domaine = ensemblePrivePoints([-q / p]);
    return { famille: "B", sousType: "fraction", domaine, base, m, n, p, q };
  }
  throw new Error("construireFraction : aucune combinaison non dégénérée trouvée après retirage");
}

export function evaluerFB(exercice: ExerciceDomaineDeriveeB, x: number): number {
  if (exercice.sousType === "racine") {
    return Math.pow(exercice.base, Math.sqrt(x * x - exercice.k * exercice.k));
  }
  const u = (exercice.m * x + exercice.n) / (exercice.p * x + exercice.q);
  return Math.pow(exercice.base, u);
}
