/**
 * Couche B (5e) — vérification pour 5gen16 ("Convergence et divergence des suites"). N'importe
 * jamais rien de `src/generateurs5e/`. Réutilise DIRECTEMENT (moteur→moteur) `diagnostiquerNombre`
 * (`verificationSuiteArithmetique.ts`, 5gen14) pour la valeur numérique de la limite quand
 * `degP===degQ`.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationSuiteArithmetique";
import type { ClassificationArithmetique, ClassificationGeometrique, ClassificationQuelconque, ExerciceConvergenceArithmetique, ExerciceConvergenceGeometrique, ExerciceConvergenceQuelconque, PolynomeConvergence } from "../core5e/convergenceSuites.types";

export function verifierClassificationArithmetique(choix: ClassificationArithmetique, exercice: ExerciceConvergenceArithmetique): boolean {
  return choix === exercice.classification;
}

export function verifierClassificationGeometrique(choix: ClassificationGeometrique, exercice: ExerciceConvergenceGeometrique): boolean {
  return choix === exercice.classification;
}

function evaluerPolynome(p: PolynomeConvergence, n: number): number {
  return p.a * n * n + p.b * n + p.c;
}

const POINTS_ECHANTILLON = [1, 2, 3, 5, -2, -3, 7];

/** Renomme "n" en "x" par un lookaround "ni précédé ni suivi d'une lettre" — jamais `\bn\b` (`\b` ne
 * matche jamais entre un chiffre et une lettre, donc casse silencieusement "2n"), même technique
 * déjà en place ailleurs sur ce chantier pour ce genre de renommage de variable (`substituerHParX`,
 * `verificationDefinitionDerivee.ts` ; `substituerVariable`, `verificationOptimisationGeometrique.ts`). */
function substituerNParX(texte: string): string {
  return texte.replace(/(?<![a-zA-Z])n(?![a-zA-Z])/gi, "x");
}

/** Écran "diviserQuelconque" — équivalence algébrique EXACTE (pas asymptotique) entre le texte
 * soumis et P(n)/Q(n) évalué directement depuis les coefficients : diviser numérateur ET
 * dénominateur par la MÊME quantité non nulle préserve la valeur pour tout n≠0, quelle que soit la
 * puissance choisie — seule une division INCOHÉRENTE entre les 2 membres (le vrai piège) change la
 * valeur et est donc détectée ici. Variable "n" substituée en "x" avant délégation à
 * `evaluerExpressionGenerale` (qui ne reconnaît que "x", même piège déjà rencontré côté 5gen14). */
export function diagnostiquerDiviserQuelconque(texte: string, exercice: ExerciceConvergenceQuelconque): StatutVerification {
  try {
    const expr = substituerNParX(texte);
    for (const n of POINTS_ECHANTILLON) {
      const qn = evaluerPolynome(exercice.Q, n);
      if (Math.abs(qn) < 1e-6) continue; // point pathologique (racine de Q), échantillon suivant
      const cible = evaluerPolynome(exercice.P, n) / qn;
      const valeur = evaluerExpressionGenerale(expr, n);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - cible) > 1e-4 * Math.max(1, Math.abs(cible))) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

export interface ReponseClassifierQuelconque {
  classification: ClassificationQuelconque;
  valeur?: string;
}

/** Écran "classifierQuelconque" — la classification catégorielle doit correspondre EXACTEMENT ;
 * pour `limiteValeur` (degP=degQ), une valeur numérique est EN PLUS exigée (piège : répondre juste
 * "converge" sans le rapport des coefficients dominants). */
export function diagnostiquerClassifierQuelconque(reponse: ReponseClassifierQuelconque, exercice: ExerciceConvergenceQuelconque): StatutVerification {
  if (reponse.classification !== exercice.classification) return "not_equivalent";
  if (exercice.classification === "limiteValeur") {
    return diagnostiquerNombre(reponse.valeur ?? "", exercice.limiteValeur as number);
  }
  return "correct";
}
