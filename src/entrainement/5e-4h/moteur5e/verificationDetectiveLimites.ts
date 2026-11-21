import type { ExerciceDetectiveLimites } from "../core5e/detectiveLimites.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDetectiveLimites } from "../ui5e/formatDetectiveLimites";
import { MESSAGE_APPROCHEE, numeroLigneFausse } from "../ui5e/formatDetectiveLimites";
import { copie } from "./modeleDetectiveLimites";
import { estApprochee, lireFonctionX, lireLimite, memeLimite, memesValeurs } from "./lectureLimitesLotG";

/**
 * Vérification de `5gen67`. Ligne et description comparées à leur identifiant ; écran 3 LU avant
 * tout verdict (illisible → `parse_error`, aucune tentative) : limite(s) par `lireLimite` (+∞, inf,
 * ∞, fractions, « − – — »), droite comparée en cinq points (préfixe « y = » ignoré). Une saisie qui
 * reprend le résultat de la copie reçoit le message ciblé ; une valeur décimale proche d'une valeur
 * exacte non décimale est « approchée » (message, aucune tentative).
 */

type E = ExerciceDetectiveLimites;
const PTS = [-3.3, -1.1, 0.4, 2.2, 4.7];
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");

export function diagnostiquer(e: E, p: PhaseDetectiveLimites, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [st(valeurs[0] === `L${numeroLigneFausse(e)}`)];
  if (p === "erreur") return [st(valeurs[0] === e.variante)];
  const v = copie(e).valeur;
  if (v.genre === "droite") {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (!f) return ["parse_error"];
    const { m, q } = v.droite!;
    return [st(memesValeurs(f, (x) => m * x + q, PTS))];
  }
  return v.nombres!.map((n, i) => {
    const x = lireLimite(valeurs[i] ?? "");
    return x === null ? "parse_error" : st(memeLimite(x, n));
  });
}

export function approchee(e: E, p: PhaseDetectiveLimites, valeurs: string[]): string | null {
  if (p !== "correction") return null;
  const v = copie(e).valeur;
  if (v.genre === "droite") return null;
  return v.nombres!.some((n, i) => estApprochee(valeurs[i] ?? "", n)) ? MESSAGE_APPROCHEE : null;
}

export function piege(e: E, p: PhaseDetectiveLimites, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  const v = c.valeur;
  if (v.genre === "droite") {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (f && c.copieDroite && memesValeurs(f, (x) => c.copieDroite!.m * x + c.copieDroite!.q, PTS)) return c.piege;
    return null;
  }
  const lus = v.nombres!.map((_, i) => lireLimite(valeurs[i] ?? ""));
  if (lus.some((x) => x === null)) return null;
  if (c.copieNombres && c.copieNombres.every((n, i) => memeLimite(lus[i]!, n))) return c.piege;
  if (v.genre === "deux" && memeLimite(lus[0]!, v.nombres![1]!) && memeLimite(lus[1]!, v.nombres![0]!)) return [tx("Les deux limites sont échangées : la première est la limite à gauche.")];
  return null;
}
