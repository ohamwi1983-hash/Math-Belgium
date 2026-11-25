import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceDetectiveCombi } from "../core6e/detectiveCombinatoire";
import type { PhaseDetectiveCombi } from "../ui6e/formatDetectiveCombinatoire";
import { numeroLigneFausse } from "../ui6e/formatDetectiveCombinatoire";
import { frVal } from "../ui6e/nombresCombinatoireLotH2";
import { copie } from "./modeleDetectiveCombinatoire";
import { decimalesEcrites, lireRationnel, ratVal } from "./lectureCombinatoireLotH2";

/**
 * Vérification de `6gen109`. Ligne et description comparées à leur identifiant (choix fermés, une
 * tentative) ; écran 3 LU avant tout verdict (illisible → `parse_error`, aucune tentative) : nombre
 * (espaces de milliers), fraction, calcul avec C(n,k), A(n,k), n!, puissances. Valeur exacte à 1e-12
 * près ; une écriture décimale proche mais différente d'une probabilité exacte est une valeur
 * approchée : message, AUCUNE tentative ; un décimal non entier pour un dénombrement aussi. Messages
 * ciblés : résultat de la copie repris, et les confusions propres à chaque scénario.
 */

type E = ExerciceDetectiveCombi;
const t = tx;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const lire = (v: string): number | null => {
  const r = lireRationnel(v);
  return r === null ? null : ratVal(r);
};
const egal = (a: number, b: number) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(b));

export function messageIllisible(e: E): string {
  return copie(e).probabilite
    ? "Probabilité non reconnue : écris une fraction (par exemple 3/8) ou un calcul avec C(n,k). Cette saisie ne compte pas comme une tentative."
    : "Nombre non reconnu : écris un entier (par exemple 360) ou un calcul comme 6!/(2!·2!). Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: PhaseDetectiveCombi, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [st(valeurs[0] === `L${numeroLigneFausse(e)}`)];
  if (p === "erreur") return [st(valeurs[0] === e.variante)];
  const v = lire(valeurs[0] ?? "");
  if (v === null) return ["parse_error"];
  return [st(egal(v, frVal(copie(e).valeur)))];
}

export function approchee(e: E, p: PhaseDetectiveCombi, valeurs: string[]): string | null {
  if (p !== "correction") return null;
  const brut = valeurs[0] ?? "";
  const v = lire(brut);
  if (v === null) return null;
  const c = copie(e);
  if (!c.probabilite) return Math.abs(v - Math.round(v)) > 1e-9 ? "Un dénombrement est un entier : vérifie ton calcul. Cette saisie ne compte pas comme une tentative." : null;
  if (decimalesEcrites(brut) === null) return null;
  const exact = frVal(c.valeur);
  const ecart = Math.abs(v - exact);
  return ecart > 1e-12 && ecart <= 0.01 ? "C'est une valeur approchée : donne la valeur exacte (une fraction). Cette saisie ne compte pas comme une tentative." : null;
}

export function piege(e: E, p: PhaseDetectiveCombi, valeurs: string[]): Frag[] | null {
  const c = copie(e);
  if (p === "ligne") {
    const k = Number((valeurs[0] ?? "").slice(1)) - 1;
    if (k > c.ligneFausse) return [t(`La ligne ${k + 1} découle correctement d'une ligne précédente : l'erreur est plus haut.`)];
    if (k < c.ligneFausse) return [t(`La ligne ${k + 1} est juste : relis la règle employée par les lignes suivantes.`)];
    return null;
  }
  if (p === "erreur") return null;
  const v = lire(valeurs[0] ?? "");
  if (v === null) return null;
  const juste = frVal(c.valeur);
  if (egal(v, juste)) return null;
  if (egal(v, frVal(c.valeurCopie))) return c.piege;
  for (const x of c.autres) if (!egal(frVal(x.valeur), juste) && egal(v, frVal(x.valeur))) return x.message;
  if (c.probabilite && (v < 0 || v > 1)) return [t("Une probabilité est toujours comprise entre 0 et 1.")];
  return null;
}
