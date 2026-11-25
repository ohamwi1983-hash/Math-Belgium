import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../moteur/statutVerification";
import { lireDroite } from "../../4e/ui/outilsAnalytiqueLotG";
import { lireNombre } from "./lectureApplicationsDerivees";
import { egal } from "../core5e/stat2vLotH1";

/**
 * Lecture des saisies du lot H1 du 5e ch. 6 (5gen76, 5gen77, 5gen36, 5gen37, 5gen38). Jamais de blocage de
 * frappe : la saisie est lue APRÈS coup ; `null` = illisible (`parse_error`, AUCUNE tentative).
 * - `lireNb` : `lireNombre` du 5e (fractions, √, « − – — », virgule ou point, préfixe « x̄ = », « a = »,
 *   « Cov(x, y) = » ignoré — on garde ce qui suit le dernier « = » / « ≈ ») + point final et unité recopiée
 *   (« ans », « mm », « L », « % »…) ignorés ;
 * - `statutArrondi` : valeur demandée « exacte ou arrondie à 10⁻ᵈ » : juste si elle vaut la valeur exacte
 *   (ou une valeur acceptée calculée avec des arrondis intermédiaires), ou si c'est un décimal d'au moins
 *   d décimales à une demi-unité près ; « trop arrondie » (message SANS tentative) si c'est un décimal plus
 *   court qui est l'arrondi juste à sa propre précision ;
 * - `lireDroiteAffine` : équation de droite sous n'importe quelle forme (`lireDroite` du 4e ch. 7 :
 *   « y = 0,6x + 2,2 », « y = 2,2 + 0,6x », « y − 4 = 0,6(x − 3) ») → pente et ordonnée à l'origine.
 */

const UNITE = /\s*(ans?|années?|mm|cm|km|m|kg|g|l|litres?|°\s*c|degrés?|%|points?|€|euros?|h|heures?|min|cv|tonnes?|t|kw|ml|personnes?|parents?|abonnements?|boissons?)\s*$/i;

/** Nettoyage commun : « − », point final, unité finale, espaces des milliers. */
function nettoyer(brut: string): string {
  let s = normaliserSigneMoins(brut).replace(/[   ]/g, " ").trim();
  s = s.replace(/\.\s*$/, "").trim();
  s = s.replace(/^.*[=≈]/, "").trim();
  s = s.replace(UNITE, "").trim();
  s = s.replace(/(\d) (?=\d{3}(?!\d))/g, "$1");
  return s;
}

/** Nombre saisi ; `null` si illisible ou vide. */
export function lireNb(brut: string): number | null {
  const s = nettoyer(brut);
  if (s === "") return null;
  // « 3 4 » : jamais un produit deviné.
  if (/\d\s+[\d.,]/.test(s)) return null;
  const v = lireNombre(s);
  return v === null || !Number.isFinite(v) ? null : v;
}

/** Nombre de décimales ÉCRITES (« 1,19 » → 2, « 3 » → 0) ; `null` si ce n'est pas un décimal écrit
 * (fraction, racine…). */
export function decimalesEcrites(brut: string): number | null {
  const s = nettoyer(brut).replace(/\s/g, "");
  const m = /^-?\d+(?:[.,](\d*))?$/.exec(s);
  if (!m) return null;
  return m[1] ? m[1].length : 0;
}

export type StatutArrondi = StatutVerification | "trop";

/**
 * Valeur « exacte ou arrondie à 10⁻ᵈ ». `autres` : valeurs également acceptées (calculées avec des
 * arrondis intermédiaires permis par la consigne).
 */
export function statutArrondi(brut: string, exact: number, d: number, autres: number[] = []): StatutArrondi {
  const v = lireNb(brut);
  if (v === null) return "parse_error";
  const cibles = [exact, ...autres];
  if (cibles.some((c) => egal(v, c))) return "correct";
  const k = decimalesEcrites(brut);
  if (k === null) return "not_equivalent";
  const demi = (dd: number) => 0.5 * 10 ** -dd + 1e-9;
  if (k >= d && cibles.some((c) => Math.abs(v - c) <= demi(d))) return "correct";
  if (k < d && cibles.some((c) => Math.abs(v - c) <= demi(k))) return "trop";
  return "not_equivalent";
}

/** Statut d'une valeur attendue EXACTEMENT (décimal exact, fraction…). */
export function statutExact(brut: string, exact: number): StatutVerification {
  const v = lireNb(brut);
  if (v === null) return "parse_error";
  return egal(v, exact) ? "correct" : "not_equivalent";
}

/** La saisie vaut-elle (à 1e-9, ou à une demi-unité de sa dernière décimale) la valeur candidate ? Pour
 * les messages ciblés seulement. */
export function vaut(brut: string, candidat: number): boolean {
  const v = lireNb(brut);
  if (v === null || !Number.isFinite(candidat)) return false;
  if (egal(v, candidat)) return true;
  const k = decimalesEcrites(brut);
  return k !== null && Math.abs(v - candidat) <= 0.5 * 10 ** -k + 1e-9;
}

export interface DroiteLue {
  /** `null` : droite verticale (x = k). */
  a: number | null;
  b: number | null;
}

/** Équation de droite saisie → pente et ordonnée à l'origine ; `null` si illisible. */
export function lireDroiteAffine(brut: string): DroiteLue | null {
  const s = normaliserSigneMoins(brut).replace(/[  ]/g, " ").replace(/\.\s*$/, "").trim();
  if (s === "") return null;
  const d = lireDroite(s);
  if (!d) return null;
  if (Math.abs(d.b) < 1e-12) return { a: null, b: null };
  return { a: -d.a / d.b, b: -d.c / d.b };
}

/**
 * Équation y = ax + b demandée avec a arrondi à 10⁻ᵈᵃ et b à 10⁻ᵈᵇ (ou exacts) : juste si chaque
 * coefficient est à une demi-unité près ; « trop arrondie » si l'un d'eux n'est qu'à une demi-unité de la
 * précision inférieure ET que la saisie a moins de décimales que demandé ; illisible = `parse_error`.
 */
export function statutDroite(brut: string, a: number, b: number, da: number, db: number): StatutArrondi {
  const d = lireDroiteAffine(brut);
  if (!d) return "parse_error";
  if (d.a === null || d.b === null) return "not_equivalent";
  const tol = (dd: number) => 0.5 * 10 ** -dd + 1e-9;
  const aOk = egal(d.a, a) || Math.abs(d.a - a) <= tol(da);
  const bOk = egal(d.b, b) || Math.abs(d.b - b) <= tol(db);
  if (aOk && bOk) return "correct";
  const aPres = aOk || Math.abs(d.a - a) <= tol(da - 1);
  const bPres = bOk || Math.abs(d.b - b) <= tol(db - 1);
  const dec = decimalesDesNombres(brut);
  if (aPres && bPres && dec.some((k) => k > 0 && k < Math.max(da, db))) return "trop";
  return "not_equivalent";
}

/** Nombre écrit dans une équation saisie (pente ou ordonnée) : décimales écrites de chaque coefficient
 * décimal de la saisie (« y = 0,03x + 2,9 » → [2, 1]) ; sert à reconnaître une équation trop arrondie. */
export function decimalesDesNombres(brut: string): number[] {
  return [...normaliserSigneMoins(brut).matchAll(/\d+(?:[.,](\d+))?/g)].map((m) => (m[1] ? m[1].length : 0));
}
