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

/** Membre de gauche recopié par l'élève (le champ affiche déjà « y = », « C(t) = », « x = »…) :
 * « y = 2x+3 », « C(t)=… », « f(x) = … », « x = 7 », « a = 5 », « Cu(x) = … » sont acceptés (décision E). */
const PREFIXE_MEMBRE_GAUCHE = /^\s*(?:y|x|a|b|t|C\s*\(\s*t\s*\)|C_?u\s*\(\s*x\s*\)|f\s*\(\s*[\dx]+\s*\)(?:\s*[×x*]\s*\d+)?|lim[^=]*)\s*=\s*(?=\S)/i;

export function retirerMembreGauche(texte: string): string {
  return texte.replace(PREFIXE_MEMBRE_GAUCHE, "");
}

function diagnostiquerValeur(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(retirerMembreGauche(texte), 0);
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

/** Champs numériques « arrondis à l'unité » — évaluations converties. Tolérance 0,6 (et non 0,5) :
 * une démarche qui arrondit f(x) au centième AVANT de multiplier par le facteur (×100) reste
 * acceptée (audit 5c4b, point 24 : 1 % de refus à tort avec 0,5). */
export function diagnostiquerNombreArrondiUnite(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.6);
}

/** Champs numériques annonçant "(arrondi au centième accepté si besoin)" — valeurs non entières
 * (ex. population fractionnaire de millions). */
export function diagnostiquerNombreArrondiCentieme(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 0.01);
}

/** Équation de l'asymptote oblique (famille C, écran "asymptoteOblique") — réutilise TEL QUEL
 * `diagnostiquerQuotient` (5gen21) : même cible (ax+b), même équivalence algébrique en x. */
export { diagnostiquerQuotient };

/** Asymptote oblique du club (écran « asymptoteOblique ») : `diagnostiquerQuotient` (partagé avec
 * 5gen21, non modifié) après retrait d'un « y = » recopié. */
export function diagnostiquerAsymptoteObliqueClub(texte: string, a: number, b: number): StatutVerification {
  return diagnostiquerQuotient(retirerMembreGauche(texte), a, b);
}

const SUBSTITUTION_T = /(?<![a-zA-Z])t(?![a-zA-Z])/g;

/** Écran "construireC" (famille B) — le champ est en "t" (le contexte parle du temps), l'évaluateur
 * générique de la plateforme ne connaît que "x" (`moteur/expressionGenerale.ts`) : substitution
 * littérale "t"→"x" AVANT délégation, frontière sur les LETTRES seulement (jamais les chiffres —
 * pour ne jamais casser "3t"). */
export function diagnostiquerConstructionC(texte: string, v0: number, r: number, c: number): StatutVerification {
  try {
    const substitue = retirerMembreGauche(texte).replace(SUBSTITUTION_T, "x");
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
