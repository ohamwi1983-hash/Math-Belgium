import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { qVal } from "../../5e-4h/ui5e/nombresTrigo";
import type { ExerciceDetectiveProba } from "../core6e/detectiveProbabilites";
import type { PhaseDetectiveProba } from "../ui6e/formatDetectiveProbabilites";
import { numeroLigneFausse } from "../ui6e/formatDetectiveProbabilites";
import { copie } from "./modeleDetectiveProbabilites";
import { lireProbaGeo } from "./verificationProbabilitesGeometriques";

/**
 * Vérification de `6gen163`. Ligne et description comparées à leur identifiant (choix fermés, une
 * tentative) ; écran 3 LU avant tout verdict (illisible → `parse_error`, aucune tentative) : même
 * lecture que 6gen162 (fractions, décimaux, puissances, « − », pourcentage, préfixe « P = »). Valeur
 * exacte à 1e-9 près ; une écriture décimale proche mais différente (« 0,33 » pour 1/3) est une
 * valeur approchée : message, AUCUNE tentative. Messages ciblés : résultat de la copie repris, et les
 * confusions propres à chaque scénario (complément oublié, intersection, P(T ∩ B)…).
 */

type E = ExerciceDetectiveProba;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const egal = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));

export function diagnostiquer(e: E, p: PhaseDetectiveProba, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [st(valeurs[0] === `L${numeroLigneFausse(e)}`)];
  if (p === "erreur") return [st(valeurs[0] === e.variante)];
  const v = lireProbaGeo(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  return [st(egal(v, qVal(copie(e).valeur)))];
}

export const MESSAGE_APPROCHEE_DETECTIVE = "C'est une valeur approchée : donne la valeur exacte (une fraction, ou un décimal exact). Cette saisie ne compte pas comme une tentative.";

export function approchee(e: E, p: PhaseDetectiveProba, valeurs: string[]): string | null {
  if (p !== "correction") return null;
  const brut = (valeurs[0] ?? "").trim();
  if (!/^\s*(P\s*=\s*)?-?\d+[.,]\d+\s*%?\s*$/i.test(brut)) return null;
  const v = lireProbaGeo(brut);
  if (v === null) return null;
  const exact = qVal(copie(e).valeur);
  const ecart = Math.abs(v - exact);
  return ecart > 1e-9 && ecart <= 0.01 * Math.max(1, Math.abs(exact)) ? MESSAGE_APPROCHEE_DETECTIVE : null;
}

export function piege(e: E, p: PhaseDetectiveProba, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [tx(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [tx(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  const v = lireProbaGeo(valeurs[0] ?? "");
  if (v === null) return null;
  const juste = qVal(c.valeur);
  if (egal(v, juste)) return null;
  if (egal(v, qVal(c.valeurCopie))) return c.piege;
  for (const x of c.autres) if (!egal(qVal(x.valeur), juste) && egal(v, qVal(x.valeur))) return x.message;
  if (v < 0 || v > 1) return [tx("Une probabilité est toujours comprise entre 0 et 1.")];
  return null;
}
