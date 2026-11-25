import type { ExerciceDetectiveStat } from "../core5e/detectiveStatistique";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDetectiveStat } from "../ui5e/formatDetectiveStatistique";
import { numeroLigneFausse } from "../ui5e/formatDetectiveStatistique";
import { messageTropArrondi } from "../ui5e/nombresStatLotH2";
import { copie } from "./modeleDetectiveStatistique";
import { lireFonctionX } from "./lectureLimitesLotG";
import { lireValeur, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen81`. Ligne, description et conclusion comparées à leur identifiant ; écran 3
 * LU avant tout verdict (illisible → `parse_error`, aucune tentative) : droite lue comme fonction de x
 * (préfixe « y = » ignoré), jugée AFFINE puis par sa pente (± 0,005) et son ordonnée à l'origine
 * (± 0,006 : coefficients exacts ou arrondis au centième) ; point moyen exact ; r au centième (plus
 * précis accepté, trop arrondi refusé sans tentative). Une saisie qui reprend le résultat de la copie
 * reçoit le message ciblé.
 */

type E = ExerciceDetectiveStat;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const TOL_A = 0.005 + 1e-9;
const TOL_B = 0.006 + 1e-9;
const TOL_R = 0.005 + 1e-9;

/** Coefficients d'une droite saisie (`null` : lisible mais pas affine ; `undefined` : illisible). */
export function lireDroite(brut: string): { a: number; b: number } | null | undefined {
  const f = lireFonctionX(brut);
  if (!f) return undefined;
  const b = f(0);
  const a = f(1) - b;
  if (![a, b].every(Number.isFinite)) return null;
  for (const x of [-3.7, 2.3, 7.1]) if (Math.abs(f(x) - (a * x + b)) > 1e-6 * Math.max(1, Math.abs(a * x + b))) return null;
  return { a, b };
}

export function diagnostiquer(e: E, p: PhaseDetectiveStat, v: string[]): StatutVerification[] {
  if (p === "ligne") return [st(v[0] === `L${numeroLigneFausse(e)}`)];
  if (p === "erreur") return [st(v[0] === e.variante)];
  const val = copie(e).valeur;
  if (val.genre === "choix") return [st(v[0] === "C0")];
  if (val.genre === "droite") {
    const d = lireDroite(v[0] ?? "");
    if (d === undefined) return ["parse_error"];
    return [st(d !== null && Math.abs(d.a - val.a) <= TOL_A && Math.abs(d.b - val.b) <= TOL_B)];
  }
  if (val.genre === "point") return [statutProche(v[0] ?? "", val.x, 1e-6), statutProche(v[1] ?? "", val.y, 1e-6)];
  return [statutProche(v[0] ?? "", val.r, TOL_R)];
}

export function approchee(e: E, p: PhaseDetectiveStat, v: string[]): string | null {
  if (p !== "correction") return null;
  const val = copie(e).valeur;
  if (val.genre === "r") return messageTropArrondi(v[0] ?? "", val.r, 2, TOL_R, "au centième");
  return null;
}

export function piege(e: E, p: PhaseDetectiveStat, v: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((v[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  if (diagnostiquer(e, p, v).every((s) => s === "correct")) return null;
  const val = c.valeur;
  const cop = c.valeurCopie;
  if (val.genre === "droite" && cop?.genre === "droite") {
    const d = lireDroite(v[0] ?? "");
    if (!d) return null;
    if (Math.abs(d.a - cop.a) <= TOL_A && Math.abs(d.b - cop.b) <= TOL_B) return c.piege;
    if (Math.abs(d.a - val.a) <= TOL_A) return [tx("La pente est juste, mais pas l'ordonnée à l'origine : calcule b avec la pente exacte, la droite passe par G.")];
    return null;
  }
  if (val.genre === "point" && cop?.genre === "point") {
    if (valeurProche(v[0] ?? "", cop.x, 1e-6) || valeurProche(v[1] ?? "", cop.y, 1e-6)) return c.piege;
    return null;
  }
  if (val.genre === "r" && cop?.genre === "r") {
    const x = lireValeur(v[0] ?? "");
    if (x !== null && Math.abs(x - cop.r) <= TOL_R) return c.piege;
    if (x !== null && Math.abs(x) > 1) return [tx("Un coefficient de corrélation est toujours compris entre −1 et 1.")];
    if (x !== null && Math.abs(x + val.r) <= TOL_R) return [tx("Vérifie le signe : r a le signe de la covariance.")];
  }
  return null;
}
