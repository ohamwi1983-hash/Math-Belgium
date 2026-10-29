import type { KeyboardEvent } from "react";

/**
 * "Blocage numérique" (promptcorrectionsgenerateur14aides.md, section 4 ;
 * promptcorrectionsgenerateur14lot2.md, section 2 — durci après un premier signalement "toujours
 * pas actif") — bloque la saisie de tout caractère qui n'est pas un chiffre, `-`, `.` ou `,`. Scope
 * actuel : les champs strictement numériques du générateur 14 ("Placement et lecture sur le cercle
 * trigonométrique") et du dix-septième générateur ("Angles associés", champ "Valeur finale") —
 * jamais appliqué transversalement à la plateforme, et jamais sur un champ qui accepterait une
 * fraction ou une racine (le `/` et `sqrt(...)` doivent y rester autorisés, non gérés ici — voir
 * `bloquerSaisieNonNumeriqueRacine.ts`, extension scopée à "L'un sans l'autre").
 *
 * Deux mécanismes complémentaires, jamais l'un sans l'autre sur un champ de ce générateur :
 * - `gererKeyDownNumerique` (onKeyDown) — bloque AVANT que le caractère n'apparaisse dans le champ,
 *   pour l'entrée clavier directe (pas de flash visuel du caractère invalide). Laisse toujours
 *   passer les raccourcis avec modificateur (Ctrl/Cmd/Alt — copier/coller...) et les touches de
 *   contrôle/navigation (Backspace, Delete, flèches, Tab, Entrée...), reconnaissables par
 *   `e.key.length > 1` (contrairement à un caractère imprimable, toujours de longueur 1).
 * - `filtrerSaisieNumerique` (onChange) — filet de sécurité qui retire tout caractère non autorisé
 *   de la valeur reçue, quel que soit le chemin de saisie qui l'a produite (collage, glisser-
 *   déposer, autocomplétion, clavier virtuel mobile...) : `onKeyDown` seul ne couvre que la frappe
 *   clavier directe, jamais ces autres chemins qui ne déclenchent aucun événement `keydown` par
 *   caractère. Garantit que le champ ne peut JAMAIS contenir de caractère invalide, indépendamment
 *   du mode de saisie utilisé.
 */
const CARACTERE_NUMERIQUE_AUTORISE = /^[0-9\-.,]$/;
const CARACTERE_FRACTION_AUTORISE = /^[0-9\-.,/]$/;

/** Signes moins typographiques (« − » U+2212, « – » U+2013, « — » U+2014) : un clavier mobile ou un
 * copier-coller en produit souvent. Ils sont CONVERTIS en « - » au lieu d'être retirés — audit
 * chapitre 6, point 6 : l'ancien filtre les supprimait sans prévenir, « −3 » devenait « 3 » (le
 * signe disparaissait et la réponse devenait fausse). */
const SIGNES_MOINS = /[\u2212\u2013\u2014]/g;

function estSigneMoinsTypographique(caractere: string): boolean {
  return caractere === "\u2212" || caractere === "\u2013" || caractere === "\u2014";
}

function gererKeyDown(e: KeyboardEvent<HTMLInputElement>, autorise: RegExp): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1) return;
  if (estSigneMoinsTypographique(e.key)) return; // converti par le filtre onChange
  if (!autorise.test(e.key)) {
    e.preventDefault();
  }
}

function filtrer(valeur: string, autorise: RegExp): string {
  return valeur
    .replace(SIGNES_MOINS, "-")
    .split("")
    .filter((caractere) => autorise.test(caractere))
    .join("");
}

export function gererKeyDownNumerique(e: KeyboardEvent<HTMLInputElement>): void {
  gererKeyDown(e, CARACTERE_NUMERIQUE_AUTORISE);
}

export function filtrerSaisieNumerique(valeur: string): string {
  return filtrer(valeur, CARACTERE_NUMERIQUE_AUTORISE);
}

/** Variante qui laisse aussi passer « / » — UNIQUEMENT pour un champ dont la lecture accepte une
 * fraction p/q (`parserNombreOuFraction`, `verificationAnalyseFonction.ts`) : ailleurs « / » reste
 * refusé, un champ qui lirait « 1/2 » avec `Number()` le jugerait illisible. */
export function gererKeyDownNumeriqueFraction(e: KeyboardEvent<HTMLInputElement>): void {
  gererKeyDown(e, CARACTERE_FRACTION_AUTORISE);
}

export function filtrerSaisieNumeriqueFraction(valeur: string): string {
  return filtrer(valeur, CARACTERE_FRACTION_AUTORISE);
}
