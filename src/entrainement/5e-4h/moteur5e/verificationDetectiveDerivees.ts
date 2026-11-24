import type { ExerciceDetectiveDerivees } from "../core5e/detectiveDerivees.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseDetectiveDerivees } from "../ui5e/formatDetectiveDerivees";
import { numeroLigneFausse } from "../ui5e/formatDetectiveDerivees";
import type { Droite, Extremums } from "./modeleDetectiveDerivees";
import { copie, qL, valeurDroite } from "./modeleDetectiveDerivees";
import { lireFonctionX, memesValeurs } from "./lectureLimitesLotG";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen72`. Ligne et description comparées à leur identifiant ; écran 3 LU avant
 * tout verdict (illisible → `parse_error`, aucune tentative) : la tangente est comparée en cinq
 * points (préfixe « y = » ignoré, fractions, « − – — ») ; une abscisse d'extremum est un nombre
 * (`lireValeur`) ou « aucun » (aucune, rien, ∅, néant, pas de…, n'existe pas). Une saisie qui
 * reprend le résultat de la copie reçoit le message ciblé ; sinon messages « pente juste » / « point
 * juste » (tangente), « échangés » / « un seul extremum » (extremums).
 */

type E = ExerciceDetectiveDerivees;
const PTS = [-3.3, -1.1, 0.4, 2.2, 4.7];
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const AUCUN = /^(aucun|aucune|aucun extremum|rien|∅|néant|neant|pas de .*|pas d'.*|n'existe pas|il n'y en a pas|inexistant|none)$/i;

/** Abscisse lue : nombre, `null` pour « aucun », `undefined` si illisible. */
export function lireAbscisse(brut: string): number | null | undefined {
  let s = normaliserSigneMoins(brut).replace(/[’`]/g, "'").trim();
  s = s.replace(/^x\s*(_?\s*(max|min))?\s*=/i, "").replace(/\.$/, "").trim();
  if (s === "") return undefined;
  if (AUCUN.test(s)) return null;
  const v = lireValeur(s);
  return v === null ? undefined : v;
}

const memeAbs = (a: number | null, b: number | null) => (a === null || b === null ? a === b : Math.abs(a - b) < 1e-9);
const lireDroite = (s: string) => lireFonctionX(s);
const droiteF = (d: Droite) => (x: number) => valeurDroite(d, x);

export function diagnostiquer(e: E, p: PhaseDetectiveDerivees, valeurs: string[]): StatutVerification[] {
  if (p === "ligne") return [st(valeurs[0] === `L${numeroLigneFausse(e)}`)];
  if (p === "erreur") return [st(valeurs[0] === e.variante)];
  const v = copie(e).valeur;
  if (v.genre === "droite") {
    const f = lireDroite(valeurs[0] ?? "");
    if (!f) return ["parse_error"];
    return [st(memesValeurs(f, droiteF(v.droite), PTS))];
  }
  const attendu: (number | null)[] = [v.xMax, v.xMin];
  return attendu.map((x, i) => {
    const lu = lireAbscisse(valeurs[i] ?? "");
    return lu === undefined ? "parse_error" : st(memeAbs(lu, x));
  });
}

export function piege(e: E, p: PhaseDetectiveDerivees, valeurs: string[]): Frag[] | null {
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
    const f = lireDroite(valeurs[0] ?? "");
    if (!f) return null;
    if (c.copieDroite && memesValeurs(f, droiteF(c.copieDroite), PTS)) return c.piege;
    const pt = c.point!;
    const pente = f(1.3) - f(0.3);
    const penteJuste = Math.abs(pente - pt.m.n / pt.m.d) < 1e-7 * Math.max(1, Math.abs(pente));
    const passe = Math.abs(f(pt.a) - pt.fa.n / pt.fa.d) < 1e-7 * Math.max(1, Math.abs(pt.fa.n / pt.fa.d));
    if (penteJuste && !passe) return [tx("La pente est juste, mais ta droite ne passe pas par le point de tangence "), lx(`\\left(${pt.a}\\,;${qL(pt.fa)}\\right)`), tx(".")];
    if (passe && !penteJuste) return [tx("Ta droite passe bien par le point de tangence, mais sa pente n'est pas f′(a) : recalcule la dérivée.")];
    return null;
  }
  const lus = [lireAbscisse(valeurs[0] ?? ""), lireAbscisse(valeurs[1] ?? "")];
  if (lus.some((x) => x === undefined)) return null;
  const [lMax, lMin] = lus as (number | null)[];
  const cop: Extremums | undefined = c.copieExtremums;
  if (cop && memeAbs(lMax!, cop.xMax) && memeAbs(lMin!, cop.xMin)) return c.piege;
  if (memeAbs(lMax!, v.xMin) && memeAbs(lMin!, v.xMax)) return [tx("Maximum et minimum sont échangés : un maximum local est là où f′ passe de + à −.")];
  return null;
}
