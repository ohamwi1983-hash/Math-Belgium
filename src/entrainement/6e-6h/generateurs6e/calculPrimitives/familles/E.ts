import type { ExerciceFamilleE } from "../../../core6e/calculPrimitives.types";
import { tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Substitution trigonométrique") de `6gen23`. PAS de
 * contrat de réutilisation en aval (D/E/F exclues).
 *
 * **Sous-type "sinus"** : f(x)=√(a²-x²), x=a·sinθ (θ∈]-π/2;π/2[), dx=a·cosθ dθ,
 * a²-x²=a²cos²θ ⇒ √(...)=a·cosθ (cosθ>0 sur cet intervalle).
 * ∫a·cosθ · a·cosθ dθ = a²∫cos²θ dθ = a²θ/2 + (a²/4)sin(2θ) [linéarisation cos²θ=(1+cos2θ)/2].
 * Retour à x : θ=arcsin(x/a), sin(2θ)=2sinθcosθ=2·(x/a)·(√(a²-x²)/a) ⇒
 * F(x) = (a²/2)·arcsin(x/a) + (x/2)·√(a²-x²).
 *
 * **Sous-type "tangente"** : f(x)=1/(x²√(a²+x²)), x=a·tanθ, dx=a·sec²θ dθ (sec²θ=1/cos²θ, la
 * fonction `sec` n'existe pas dans l'évaluateur partagé — toujours réexprimée en 1/cos²θ),
 * a²+x²=a²sec²θ ⇒ √(...)=a·secθ=a/cosθ (secθ>0 sur ]-π/2;π/2[).
 * Intégrande complet : 1/(a²tan²θ · a/cosθ) · a/cos²θ dθ = (1/a²)·cosθ/sin²θ dθ (développement à
 * la main : x²=a²tan²θ=a²sin²θ/cos²θ, division puis simplification des cos).
 * ∫cosθ/sin²θ dθ = -1/sinθ (standard). Retour à x (x>0) : sinθ=x/√(a²+x²) ⇒
 * F(x) = -√(a²+x²)/(a²·x).
 */

function construireSinus(): ExerciceFamilleE {
  const a = tirerParmi([2, 3, 4, 5] as const);
  const xDeThetaReference = (theta: number) => a * Math.sin(theta);
  const dxCoefReference = (theta: number) => a * Math.cos(theta);
  const expressionSimplifieeThetaReference = (theta: number) => a * Math.cos(theta);
  const integrandeThetaReference = (theta: number) => expressionSimplifieeThetaReference(theta) * dxCoefReference(theta);
  const primitiveThetaReference = (theta: number) => (a * a * theta) / 2 + (a * a * Math.sin(2 * theta)) / 4;
  const integrandeReference = (x: number) => Math.sqrt(a * a - x * x);
  const primitiveReference = (x: number) => (a * a * Math.asin(x / a)) / 2 + (x / 2) * Math.sqrt(a * a - x * x);

  return { famille: "E", sousType: "sinus", a, xDeThetaReference, dxCoefReference, expressionSimplifieeThetaReference, integrandeThetaReference, primitiveThetaReference, primitiveReference, integrandeReference };
}

function construireTangente(): ExerciceFamilleE {
  const a = tirerParmi([2, 3, 4, 5] as const);
  const xDeThetaReference = (theta: number) => a * Math.tan(theta);
  const dxCoefReference = (theta: number) => a / Math.pow(Math.cos(theta), 2);
  // Expression simplifiée en θ (spec : "simplifier l'expression sous la racine") — le radical
  // √(a²+x²) devient a/cosθ ; le reste de l'intégrande (1/x²) est absorbé par le produit complet
  // ci-dessous (voir en-tête de fichier — même convention que la famille C : seul le facteur
  // radical est isolé à cet écran, le reste est rewritten globalement à l'écran suivant).
  const expressionSimplifieeThetaReference = (theta: number) => a / Math.cos(theta);
  const integrandeThetaReference = (theta: number) => Math.cos(theta) / (a * a * Math.pow(Math.sin(theta), 2));
  const primitiveThetaReference = (theta: number) => -1 / (a * a * Math.sin(theta));
  const integrandeReference = (x: number) => 1 / (x * x * Math.sqrt(a * a + x * x));
  const primitiveReference = (x: number) => -Math.sqrt(a * a + x * x) / (a * a * x);

  return { famille: "E", sousType: "tangente", a, xDeThetaReference, dxCoefReference, expressionSimplifieeThetaReference, integrandeThetaReference, primitiveThetaReference, primitiveReference, integrandeReference };
}

/** Tirage équiprobable du sous-type. */
export function construireFamilleE(): ExerciceFamilleE {
  return tirerParmi(["sinus", "tangente"] as const) === "sinus" ? construireSinus() : construireTangente();
}

export { construireSinus as construireFamilleESinus, construireTangente as construireFamilleETangente };
