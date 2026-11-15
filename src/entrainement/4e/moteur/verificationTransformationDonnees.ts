import type { Champ } from "../ui/formatTransformationDonnees";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";

/**
 * Vérification de gen108. Chaque champ attend un nombre EXACT (toutes les réponses sont des
 * décimaux courts, l'énoncé le dit) : lecture par `parserNombreOuFraction` (virgule ou point,
 * fraction « p/q », signe moins typographique), après retrait des espaces de milliers et d'une
 * unité recopiée en fin de saisie (« 1 905,5 € »). Tolérance : bruit flottant seulement.
 *
 * Statuts :
 * - `parse_error` : saisie illisible — aucune tentative comptée (c'est l'appli qui ne l'envoie pas) ;
 * - `arrondi` : la bonne valeur, mais arrondie (« 57,15 » pour 57,1536) — aucune tentative comptée
 *   non plus : c'est une question de présentation, l'élève est invité à donner la valeur exacte ;
 * - `piege` : erreur typique reconnue (constante ajoutée à l'écart-type, variance × a…), avec son
 *   message ciblé ;
 * - `faux` / `correct`.
 */

export type EtatChamp = "correct" | "faux" | "piege" | "arrondi" | "parse_error";

export interface StatutChamp {
  etat: EtatChamp;
  message?: string;
}

const TOLERANCE_RELATIVE = 1e-9;

/** Lit un nombre : espaces (de milliers) retirées, unité finale tolérée. `null` si illisible. */
export function lireNombre(saisie: string): number | null {
  const sansEspaces = saisie.replace(/[\s   ]/g, "");
  const m = /^([−–—\-+]?[0-9.,/]+)([a-zA-Z°€$²%]*)$/.exec(sansEspaces);
  if (!m) return null;
  return parserNombreOuFraction(m[1]!.replace(/^\+/, ""));
}

function egaux(v: number, cible: number): boolean {
  return Math.abs(v - cible) <= TOLERANCE_RELATIVE * Math.max(1, Math.abs(cible));
}

function nombreDecimales(saisie: string): number {
  const t = saisie.replace(/[\s   ]/g, "").replace(/[a-zA-Z°€$²%]+$/, "");
  const i = Math.max(t.lastIndexOf(","), t.lastIndexOf("."));
  return i < 0 ? 0 : t.length - i - 1;
}

/** La saisie est-elle la cible arrondie (ou tronquée) à son propre nombre de décimales ? */
function estArrondi(saisie: string, v: number, cible: number): boolean {
  if (saisie.includes("/")) return false;
  const k = nombreDecimales(saisie);
  const f = 10 ** k;
  const arrondie = Math.round(cible * f) / f;
  const tronquee = Math.trunc(cible * f) / f;
  return !egaux(arrondie, cible) && (egaux(v, arrondie) || egaux(v, tronquee));
}

export function diagnostiquerChamp(saisie: string, champ: Champ): StatutChamp {
  if (saisie.trim() === "") return { etat: "parse_error" };
  const v = lireNombre(saisie);
  if (v === null) return { etat: "parse_error" };
  if (egaux(v, champ.cible)) return { etat: "correct" };
  const piege = champ.pieges.find((p) => egaux(v, p.valeur));
  if (piege) return { etat: "piege", message: piege.message };
  if (estArrondi(saisie, v, champ.cible)) return { etat: "arrondi" };
  return { etat: "faux", message: champ.messageSiFaux };
}

export function diagnostiquerChamps(saisies: string[], champs: Champ[]): StatutChamp[] {
  return champs.map((c, i) => diagnostiquerChamp(saisies[i] ?? "", c));
}
