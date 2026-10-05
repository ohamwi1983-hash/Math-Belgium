/**
 * Couche B (5e) — vérification pour 5gen14 ("Suites arithmétiques, formule générale et termes").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur la plateforme) :
 * - `diagnostiquerValeurArcSecteur` (`verificationArcsSecteurs.ts`, 5gen6) pour tout champ "nombre
 *   simple" (trouverR/trouverU1/termeEloigne/sommeSn/resoudreXAlgebrique/calculerTermesAlgebrique).
 *
 * RÉPLIQUE localement (même patron que 5gen5/5gen13, jamais importée — fonctions privées à leur
 * module d'origine) le mécanisme "équation linéaire à un facteur d'échelle près".
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeurArcSecteur } from "./verificationArcsSecteurs";

export function diagnostiquerNombre(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurArcSecteur(texte, cible);
}

/** Renomme "n" en "x" par un lookaround "ni précédé ni suivi d'une lettre" — jamais `\bn\b` (`\b` ne
 * matche jamais entre un chiffre et une lettre, donc casse silencieusement "2n"), même technique
 * déjà en place ailleurs sur ce chantier pour ce genre de renommage de variable (`substituerHParX`,
 * `verificationDefinitionDerivee.ts` ; `substituerVariable`, `verificationOptimisationGeometrique.ts`). */
function substituerNParX(texte: string): string {
  return texte.replace(/(?<![a-zA-Z])n(?![a-zA-Z])/gi, "x");
}

/** Écran "formuleGenerale" — un=u1+(n-1)r, le champ ne contient QUE le membre droit (le label
 * affiche déjà "un ="), variable "n" substituée en "x" avant délégation à
 * `evaluerExpressionGenerale` (qui ne reconnaît que "x"). */
export function diagnostiquerFormuleGenerale(u1: number, r: number, texte: string): StatutVerification {
  try {
    const expr = substituerNParX(texte);
    for (const n of [1, 2, 5, 8, -3]) {
      const valeur = evaluerExpressionGenerale(expr, n);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - (u1 + (n - 1) * r)) > 1e-6) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Écrans "termesProches"/"termesConsecutifsMoyenne" — N champs numériques, TOUS corrects requis
 * (parse_error prioritaire sur not_equivalent, même convention que le reste de la plateforme). */
export function diagnostiquerTermes(textes: string[], cibles: number[]): StatutVerification {
  const statuts = textes.map((t, i) => diagnostiquerNombre(t, cibles[i]));
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Écran "poserEquationAlgebrique"/"poserEquationRangN" — vérifie que `gauche=droite` représente
 * la MÊME équation linéaire que `penteCible·x+constanteCible=0`, à un facteur d'échelle près
 * (extraction par différences finies, même patron que `diagnostiquerSysteme`/5gen13). Remplace
 * l'ancienne `diagnostiquerEquationMoyenne` (spécifique à la structure "moyenne de 3 termes",
 * retirée — `prompt5gen14remplacementvariante.md`) par une primitive GÉNÉRIQUE, réutilisable par
 * n'importe quelle équation linéaire cible (`penteCible`/`constanteCible` calculés côté
 * `sessionSuiteArithmetique.ts` selon la famille réelle de l'exercice). */
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

/** Même mécanisme que `diagnostiquerEquationLineaire`, pour une équation dont la variable réelle
 * est "n" (famille "algebriqueRangN", écran "poserEquationRangN" — u1+(n-1)r=k) plutôt que "x" —
 * substitution AVANT délégation, même patron que `diagnostiquerFormuleGenerale`. */
export function diagnostiquerEquationLineaireEnN(gauche: string, droite: string, penteCible: number, constanteCible: number): StatutVerification {
  return diagnostiquerEquationLineaire(substituerNParX(gauche), substituerNParX(droite), penteCible, constanteCible);
}

/** Écran "poserEquationAlgebrique"/"poserEquationRangN" — REFONTE `prompt5gen14refontefamillesbonus.md`
 * : UN SEUL champ texte libre où l'élève tape l'équation COMPLÈTE ("=" inclus), remplace le patron
 * "2 champs gauche/droite séparés par un '=' visuel". Split sur "=" PUIS délégation à
 * `diagnostiquerEquationLineaire` — la logique de vérification par différences finies reste écrite
 * UNE SEULE FOIS (celle-ci en devient un simple détail d'implémentation, jamais dupliquée). Ni 0 ni
 * 2+ signes "=" dans le texte ⟹ `parse_error` (une équation a EXACTEMENT un signe "="). */
export function diagnostiquerEquationComplete(texte: string, penteCible: number, constanteCible: number): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "parse_error";
  return diagnostiquerEquationLineaire(parties[0], parties[1], penteCible, constanteCible);
}

/** Même principe que `diagnostiquerEquationComplete`, variable réelle "n" (famille "algebriqueRangN"
 * — même remarque que `diagnostiquerEquationLineaireEnN` : substitution AVANT délégation). */
export function diagnostiquerEquationCompleteEnN(texte: string, penteCible: number, constanteCible: number): StatutVerification {
  const parties = texte.split("=");
  if (parties.length !== 2) return "parse_error";
  return diagnostiquerEquationLineaireEnN(parties[0], parties[1], penteCible, constanteCible);
}

/** Écran "resoudreRangN" — validation STRICTE (jamais de tolérance d'arrondi, contrairement à
 * `diagnostiquerNombre`) : un rang n'est jamais décimal ni négatif, donc toute valeur non entière
 * ou non strictement positive est rejetée comme "not_equivalent" (une réponse ERRONÉE, jamais un
 * `parse_error` — le texte s'est bien évalué, il ne satisfait juste pas la contrainte du domaine). */
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

/** Écran "coherenceJugement" — jugement binaire, jamais un calcul, comparé directement au champ
 * réel de l'exercice. */
export function verifierCoherence(choix: boolean, coherentReel: boolean): boolean {
  return choix === coherentReel;
}
