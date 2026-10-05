/**
 * Couche B (5e) — vérification pour 5gen20 ("Limites, reconnaissance et calcul"). N'importe jamais
 * rien de `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur la plateforme) :
 * - `diagnostiquerValeurArcSecteur` (`verificationArcsSecteurs.ts`, 5gen6) pour tout champ "nombre
 *   simple".
 *
 * RÉPLIQUE localement (jamais importée, petite duplication assumée — même patron que
 * `verificationSuiteArithmetique.ts`) le mécanisme "équivalence algébrique par échantillonnage de
 * points" pour les facteurs/termes symboliques.
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { ExerciceLimite, FractionExacte } from "../core5e/limites.types";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";

export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

/** Écran "factoriser" (famille "formeIndeterminee") — `textes` = les facteurs saisis, UN par ligne
 * (add-as-needed), vérifiés par le PRODUIT de leurs valeurs (jamais une comparaison ligne à ligne :
 * n'importe quelle répartition valide du coefficient/des racines entre les lignes est acceptée,
 * ex. "2" + "(x-3)" + "(x+5)" ou "2*(x-3)" + "(x+5)"). Échantillonné en `a+{1,2,-1,3,-2}` — jamais
 * en `a` lui-même, où le facteur commun (x-a) annule les deux membres sans rien discriminer. */
export function diagnostiquerFacteurs(textes: string[], a: number, coeff: number, autreRacine: number): StatutVerification {
  const expr = textes.map((t) => `(${t})`).join("*");
  try {
    for (const decalage of [1, 2, -1, 3, -2]) {
      const x = a + decalage;
      const valeurEntree = evaluerExpressionGenerale(expr, x);
      const valeurAttendue = coeff * (x - a) * (x - autreRacine);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - valeurAttendue) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Équivalence algébrique par échantillonnage — `texte` doit valoir `(coeffNum/coeffDen)·x^degre`
 * en x=2,3,5 (points fixes, non nuls, sans lien avec une racine de l'exercice puisque cette famille
 * n'a pas de "a"). Partagée par `diagnostiquerTermeDominant` (coeffDen=1, un monôme "brut") et
 * `diagnostiquerRatioDominant` (coeffNum/coeffDen = un ratio de coefficients dominants, degré
 * pouvant être 0 — un nombre pur — ou positif — un monôme). */
function diagnostiquerMonome(texte: string, coeffNum: number, coeffDen: number, degre: number): StatutVerification {
  try {
    for (const x of [2, 3, 5]) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      const valeurAttendue = (coeffNum / coeffDen) * Math.pow(x, degre);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - valeurAttendue) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Écran "termeDominant" (famille "limiteInfini") — un des 2 champs (numérateur OU dénominateur). */
export function diagnostiquerTermeDominant(texte: string, coeff: number, degre: number): StatutVerification {
  return diagnostiquerMonome(texte, coeff, 1, degre);
}

/** Écran "simplifierLimiteRef" (famille "limiteInfini") — même vérification, `fraction` = le ratio
 * des coefficients dominants (degré 0 si "degresEgaux" — un nombre pur — sinon `degreResultat`). */
export function diagnostiquerRatioDominant(texte: string, fraction: FractionExacte, degre: number): StatutVerification {
  return diagnostiquerMonome(texte, fraction.num, fraction.den, degre);
}

/** Écrans à choix de signe (famille "limiteInfiniePoint" : signeNumerateur/signeDenominateur/
 * conclureLimite ; famille "limiteInfini" : evaluerLimiteFinale quand la limite est infinie) — un
 * simple booléen, jamais de `StatutVerification` (pas de saisie libre à parser). */
export function verifierSigne(choix: 1 | -1, attendu: 1 | -1): boolean {
  return choix === attendu;
}

/** Écran "reconnaissance" (écran 0, IDENTIQUE pour les 4 familles) — `choix` comparé DIRECTEMENT à
 * la vraie famille générée (`"limiteReelle"|"formeIndeterminee"|"limiteInfiniePoint"|"limiteInfini"`,
 * les 2 sous-boutons "∞/∞"/"0/0" de "Forme indéterminée" transmettant respectivement
 * "limiteInfini"/"formeIndeterminee"). Jamais consommé pour dispatcher la suite (voir en-tête
 * `typesLimites.ts`) — SAUF pour "limiteReelle", seul et dernier écran de cette famille (aucun écran
 * supplémentaire) : `valeurTexte` doit alors AUSSI être fourni et numériquement correct, en un seul
 * geste avec la classification. */
export function verifierReconnaissance(choix: string, exercice: ExerciceLimite, valeurTexte?: string): boolean {
  if (choix !== exercice.famille) return false;
  if (exercice.famille !== "limiteReelle") return true;
  if (valeurTexte === undefined) return false;
  const cible = exercice.limite.num / exercice.limite.den;
  return diagnostiquerNombre(valeurTexte, cible) === "correct";
}
