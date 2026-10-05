/**
 * Couche B (5e) — vérification pour 5gen15 ("Suites géométriques, formule générale et termes").
 * REFONTE (`prompt5gen15refontefamillesbonus.md`, miroir direct de `verificationSuiteArithmetique.ts`,
 * 5gen14). N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur la plateforme) :
 * - `diagnostiquerNombre`/`diagnostiquerTermes` (`verificationSuiteArithmetique.ts`, 5gen14) pour
 *   tout champ "nombre simple"/liste de nombres.
 * - `diagnostiquerEnsembleNumerique` (`verificationEquationTrig.ts`, 5gen10) pour l'écran
 *   "trouverQ" (1 ou 2 valeurs, ordre indifférent).
 *
 * RÉPLIQUE localement (jamais importées, patron confirmé par investigation — voir aussi
 * `verificationModelisationSinusoide.ts`) :
 * - `sommeGeometriqueFinie`/`sommeInfinieExiste`/`sommeInfinie` (`generateurs5e/suitesGeometriques/parametres.ts`).
 * - `diagnostiquerEquationLineaire`/`diagnostiquerEquationComplete`/`diagnostiquerRangEntierPositif`
 *   (`verificationSuiteArithmetique.ts`, 5gen14) — le patron établi sur ce projet pour ce mécanisme
 *   précis est de RÉPLIQUER localement, jamais un import moteur→moteur.
 *
 * Nouvelle technique — `diagnostiquerEquationExponentielleEnN` : la cible `u_1·q^(n-1)=k` n'est PAS
 * linéaire en n (`q^(n-1)` est EXPONENTIEL en n), le mécanisme "différences finies + affinité"
 * (`diagnostiquerEquationLineaire`) ne s'applique donc pas. Vérifie que `gauche(n)-droite(n)` est
 * PROPORTIONNEL à la forme canonique `u_1·q^(n-1)-k` sur plusieurs points d'échantillonnage RÉELS
 * NON ENTIERS (q>0 garanti par la génération de la famille C — voir `core5e/suitesGeometriques.types.ts`
 * — donc `Math.pow` reste réel pour tout n) — jamais une comparaison littérale de chaîne.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre, diagnostiquerTermes } from "./verificationSuiteArithmetique";
import { diagnostiquerEnsembleNumerique } from "./verificationEquationTrig";
import type { ExercicePrincipalSuiteGeometrique, FractionQ } from "../core5e/suitesGeometriques.types";
import { fractionQVersNombre, sommeGeometriqueFinieQ } from "./fractionQ";

export { diagnostiquerNombre, diagnostiquerTermes, diagnostiquerEnsembleNumerique };

// ============================================================================
// Formules répliquées (voir generateurs5e/suitesGeometriques/fraction.ts, source de vérité pour
// l'arithmétique EXACTE — `prompt5gen155gen16arithmetiqueexacte.md`). Les fonctions ci-dessous ne
// convertissent en flottant qu'AU POINT de comparaison tolérante avec la saisie décimale/fraction
// libre de l'élève (`evaluerExpressionGenerale`, intrinsèquement flottante) — jamais pour dériver une
// AUTRE valeur en amont.
// ============================================================================

function sommeGeometriqueFinieLocal(u1: FractionQ, q: FractionQ, n: number): number {
  return fractionQVersNombre(sommeGeometriqueFinieQ(u1, q, n));
}

function sommeInfinieExisteLocal(q: FractionQ): boolean {
  return Math.abs(q.num) < q.den;
}

function sommeInfinieLocal(u1: FractionQ, q: FractionQ): number | null {
  if (!sommeInfinieExisteLocal(q)) return null;
  return fractionQVersNombre(u1) / (1 - fractionQVersNombre(q));
}

/** Renomme "n" en "x" par un lookaround "ni précédé ni suivi d'une lettre" — jamais `\bn\b` (`\b` ne
 * matche jamais entre un chiffre et une lettre, donc casse silencieusement "2n"), même technique
 * déjà en place ailleurs sur ce chantier pour ce genre de renommage de variable (`substituerHParX`,
 * `verificationDefinitionDerivee.ts` ; `substituerVariable`, `verificationOptimisationGeometrique.ts`). */
function substituerNParX(texte: string): string {
  return texte.replace(/(?<![a-zA-Z])n(?![a-zA-Z])/gi, "x");
}

// ============================================================================
// Écrans "principal"
// ============================================================================

/** Écran "formuleGenerale" — un=u1*q^(n-1). */
export function diagnostiquerFormuleGenerale(u1: FractionQ, q: FractionQ, texte: string): StatutVerification {
  try {
    const expr = substituerNParX(texte);
    const u1Nombre = fractionQVersNombre(u1);
    const qNombre = fractionQVersNombre(q);
    for (const n of [1, 2, 3, 5]) {
      const valeur = evaluerExpressionGenerale(expr, n);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - u1Nombre * Math.pow(qNombre, n - 1)) > 1e-4 * Math.max(1, Math.abs(u1Nombre * Math.pow(qNombre, n - 1)))) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Écran "trouverQ" — ensemble numérique add-as-needed (1 valeur si "unique", 2 si "double", ordre
 * indifférent) — `StatutQ="aucune"` étant devenu impossible (voir core5e/suitesGeometriques.types.ts),
 * plus de bouton "aucune solution" à gérer ici (retiré, voir historique). */
export function diagnostiquerTrouverQ(exercice: ExercicePrincipalSuiteGeometrique, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(
    valeurs,
    exercice.branches.map((b) => fractionQVersNombre(b.q)),
  );
}

/** Écran "trouverU1"/"trouverU1B1"/"trouverU1B2" — la cible est simplement `branches[i].u1`, déjà
 * résolue à la génération (aucune formule à réappliquer ici). */
export function diagnostiquerTrouverU1(texte: string, u1Cible: FractionQ): StatutVerification {
  return diagnostiquerNombre(texte, fractionQVersNombre(u1Cible));
}

export function diagnostiquerSommeSn(u1: FractionQ, q: FractionQ, n: number, texte: string): StatutVerification {
  return diagnostiquerNombre(texte, sommeGeometriqueFinieLocal(u1, q, n));
}

export interface ReponseSommeInfinie {
  existe: boolean;
  valeur: string;
}

/** Écran "sommeInfinie"/"sommeInfinieB1"/"sommeInfinieB2" — |q|<1 STRICTEMENT (condition PLUS
 * STRICTE que la convergence de la suite elle-même, voir parametres.ts). */
export function diagnostiquerSommeInfinie(u1: FractionQ, q: FractionQ, reponse: ReponseSommeInfinie): StatutVerification {
  const cible = sommeInfinieLocal(u1, q);
  if (cible === null) {
    return reponse.existe ? "not_equivalent" : "correct";
  }
  if (!reponse.existe) return "not_equivalent";
  return diagnostiquerNombre(reponse.valeur, cible);
}

// ============================================================================
// Équation linéaire (variable x) — RÉPLIQUÉE localement (voir en-tête de fichier), jamais importée
// depuis verificationSuiteArithmetique.ts pour ce mécanisme précis.
// ============================================================================

export function diagnostiquerEquationLineaire(gauche: string, droite: string, penteCible: number, constanteCible: number): StatutVerification {
  try {
    const diff = (x: number) => evaluerExpressionGenerale(gauche, x) - evaluerExpressionGenerale(droite, x);
    const c0 = diff(0);
    const pente = diff(1) - c0;
    const c2 = diff(2);
    if (![c0, pente, c2].every(Number.isFinite)) return "parse_error";
    if (Math.abs(pente * 2 + c0 - c2) > 1e-4) return "not_equivalent";

    const k = pente / penteCible;
    if (!Number.isFinite(k) || Math.abs(k) < 1e-9) return "not_equivalent";
    const memeConstante = Math.abs(c0 - k * constanteCible) < 1e-4;
    return memeConstante ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

/** Écran "poserEquationAlgebrique" — UN SEUL champ texte libre où l'élève tape l'équation COMPLÈTE
 * ("=" inclus). Split sur "=" PUIS délégation à `diagnostiquerEquationLineaire`. Ni 0 ni 2+ signes
 * "=" ⟹ `parse_error` (une équation a EXACTEMENT un signe "="). */
export function diagnostiquerEquationComplete(texte: string, penteCible: number, constanteCible: number): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "parse_error";
  return diagnostiquerEquationLineaire(parties[0], parties[1], penteCible, constanteCible);
}

// ============================================================================
// Famille C — équation EXPONENTIELLE en n (u_1·q^(n-1)=k), nouvelle technique de vérification.
// ============================================================================

/** Vérifie que `gauche(n)-droite(n)` est PROPORTIONNEL à `u_1·q^(n-1)-k` sur 4 points
 * d'échantillonnage réels NON ENTIERS (jamais la vraie solution, toujours entière par construction)
 * — voir en-tête de fichier. Un simple facteur d'échelle constant (`r`) reste accepté (ex.
 * `2·u_1·q^{n-1}=2k`), même principe que `diagnostiquerEquationLineaire`. */
export function diagnostiquerEquationExponentielleEnN(gauche: string, droite: string, u1: number, q: number, k: number): StatutVerification {
  try {
    const substituees = (n: number) => {
      const g = evaluerExpressionGenerale(substituerNParX(gauche), n);
      const d = evaluerExpressionGenerale(substituerNParX(droite), n);
      return g - d;
    };
    const cible = (n: number) => u1 * Math.pow(q, n - 1) - k;
    const points = [0.37, 1.53, 2.81, 4.19];
    const ratios: number[] = [];
    for (const n of points) {
      const c = cible(n);
      const d = substituees(n);
      if (!Number.isFinite(c) || !Number.isFinite(d) || Math.abs(c) < 1e-9) return "parse_error";
      ratios.push(d / c);
    }
    const r0 = ratios[0];
    if (Math.abs(r0) < 1e-9) return "not_equivalent";
    const coherent = ratios.every((r) => Math.abs(r - r0) < 1e-4);
    return coherent ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

/** Écran "poserEquationRangN" — même patron "champ unique" que `diagnostiquerEquationComplete`,
 * délégant à `diagnostiquerEquationExponentielleEnN` (variable réelle "n"). */
export function diagnostiquerEquationCompleteEnN(texte: string, u1: number, q: number, k: number): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "parse_error";
  return diagnostiquerEquationExponentielleEnN(parties[0], parties[1], u1, q, k);
}

/** Écran "resoudreRangN" — validation STRICTE (jamais de tolérance d'arrondi) : un rang n'est jamais
 * décimal ni négatif, toute valeur non entière ou non strictement positive est rejetée comme
 * "not_equivalent" (le texte s'est bien évalué, il ne satisfait juste pas la contrainte du domaine). */
export function diagnostiquerRangEntierPositif(texte: string, cible: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    if (!Number.isInteger(valeur) || valeur <= 0) return "not_equivalent";
    return valeur === cible ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}
