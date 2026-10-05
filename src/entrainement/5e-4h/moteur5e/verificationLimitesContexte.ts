/**
 * Couche B (5e) — vérification pour 5gen23 ("Limites et asymptotes en contexte"). N'importe jamais
 * rien de `src/generateurs5e/`. Réutilise DIRECTEMENT `diagnostiquerQuotient` (5gen21, Couche B ↔
 * Couche B autorisé) pour l'équation de l'asymptote oblique (famille C) — jamais réimplémentée.
 *
 * Écrans "interprétation" (familles A/B/D) : QCM `optionsInterpretation`, JAMAIS de saisie libre en
 * français (aucun précédent sur la plateforme, confirmé par audit avant conception) — statut booléen
 * simple, pas `StatutVerification` (aucune saisie libre possible, donc aucun risque de parse_error,
 * convention déjà établie ailleurs sur la plateforme pour tout écran purement QCM).
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { OptionInterpretation } from "../core5e/limitesContexte.types";
import { diagnostiquerQuotient } from "./verificationAsymptoteOblique";

function diagnostiquerValeur(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

/** Champs numériques "exacts" (limites, coefficients entiers) — tolérance flottante minimale. */
export function diagnostiquerNombreExact(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.01);
}

/** Champs numériques annonçant "(arrondi à l'unité accepté si besoin)" — évaluations converties. */
export function diagnostiquerNombreArrondiUnite(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.5);
}

/** Champs numériques annonçant "(arrondi au centième accepté si besoin)" — valeurs non entières
 * (ex. population fractionnaire de millions). */
export function diagnostiquerNombreArrondiCentieme(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.01);
}

/** Équation de l'asymptote oblique (famille C, écran "asymptoteOblique") — réutilise TEL QUEL
 * `diagnostiquerQuotient` (5gen21) : même cible (ax+b), même équivalence algébrique en x. */
export { diagnostiquerQuotient };

const SUBSTITUTION_T = /(?<![a-zA-Z])t(?![a-zA-Z])/g;

/** Écran "construireC" (famille B) — le champ est en "t" (le contexte parle du temps), l'évaluateur
 * générique de la plateforme ne connaît que "x" (`moteur/expressionGenerale.ts`) : substitution
 * littérale "t"→"x" AVANT délégation, frontière sur les LETTRES seulement (jamais les chiffres —
 * pour ne jamais casser "3t"). */
export function diagnostiquerConstructionC(texte: string, v0: number, r: number, c: number): StatutVerification {
  try {
    const substitue = texte.replace(SUBSTITUTION_T, "x");
    const points = [0, 1, 2, 3, 5, 10];
    for (const t of points) {
      const valeurEntree = evaluerExpressionGenerale(substitue, t);
      const cible = (c * r * t) / (v0 + r * t);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - cible) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** QCM "interprétation"/"AV sens"/"croissance-régression" — motif du précédent 4e
 * (`optionsInterpretation`) : booléen simple, jamais `StatutVerification`. */
export function verifierInterpretation(options: OptionInterpretation[], indexChoisi: number | null): boolean {
  if (indexChoisi === null) return false;
  return options[indexChoisi]?.correcte === true;
}

/** Écran "evaluerSeuil" (famille D) — champ numérique (valeur convertie) + choix Supérieur/Inférieur
 * gradé EN PARALLÈLE (motif `EtapeDecisionOptimisation`, 4e : jamais un Oui/Non isolé, toujours
 * accompagné d'un second élément structuré vérifié indépendamment). */
export interface ReponseEvaluerSeuil {
  valeur: string;
  comparaison: "superieur" | "inferieur" | null;
}

export interface StatutEvaluerSeuil {
  valeur: StatutVerification;
  comparaisonCorrecte: boolean;
}

export function diagnostiquerEvaluerSeuil(reponse: ReponseEvaluerSeuil, cible: number, seuil: number): StatutEvaluerSeuil {
  const valeur = diagnostiquerNombreArrondiCentieme(reponse.valeur, cible);
  const comparaisonAttendue: "superieur" | "inferieur" = cible > seuil ? "superieur" : "inferieur";
  return { valeur, comparaisonCorrecte: reponse.comparaison === comparaisonAttendue };
}
