import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { decimalesEcrites, lireRationnel, ratVal } from "./lectureCombinatoireLotH2";

/**
 * Lecture des saisies des générateurs 6gen116–6gen122 (6e ch. 8, lot H, seconde moitié) — jamais de
 * blocage de frappe : la saisie est lue telle quelle, `null` = illisible (l'écran le dit, AUCUNE
 * tentative consommée). Écritures admises :
 * - tout ce que lit `lectureCombinatoireLotH2` (entier, décimal à virgule ou à point, espaces de
 *   milliers, fraction, « × · * », « − », C(n,k), n!, « % » final) ;
 * - à défaut, l'évaluateur du 6e ch. 2 : ln, e, exp, √, sqrt, puissances (« -ln(0,05) »,
 *   « e^(-2)·2^3/6 », « √24 ») ;
 * - préfixe « z = », « P(X ≥ 3) = », « λ = »… (on garde ce qui suit le dernier « = » ou « ≈ ») ;
 * - unité finale (« 172 cm », « 3,5 min », « 8 g ») ignorée.
 */

export interface ValeurLue {
  v: number;
  /** Nombre de décimales ÉCRITES pour un décimal simple (« 0,8907 » → 4), sinon `null`. */
  dec: number | null;
  /** Saisie terminée par « % ». */
  pourcent: boolean;
}

function essai(s: string): number | null {
  if (s === "") return null;
  const r = lireRationnel(s);
  if (r !== null) return ratVal(r);
  // « 3 4 » (deux nombres séparés par une espace) reste illisible : jamais un produit deviné.
  if (/%$/.test(s) || /\d\s+\d/.test(s)) return null;
  return evaluerValeurExponentielle(s.replace(/\s+/g, " "));
}

/** Valeur d'une saisie (`null` si illisible). */
export function lireValeurVA(brut: string): ValeurLue | null {
  let s = normaliserSigneMoins(brut ?? "").trim();
  const i = Math.max(s.lastIndexOf("="), s.lastIndexOf("≈"));
  if (i >= 0) s = s.slice(i + 1).trim();
  if (s === "") return null;
  const pourcent = /%\s*$/.test(s);
  let v = essai(s);
  if (v === null) {
    // Unité finale : « 172 cm », « 3,5 min », « 8 g » (jamais « e », nombre d'Euler).
    const sansUnite = s.replace(/\s*(?:[A-Za-zÀ-ÿµ°€α-ωΑ-Ω]{2,}|[a-df-zA-DF-Z°€α-ωΑ-Ω])\.?\s*$/u, "").trim();
    if (sansUnite !== s && /\d\s*$|\)\s*$/.test(sansUnite)) v = essai(sansUnite);
    if (v === null) return null;
    s = sansUnite;
  }
  if (!Number.isFinite(v)) return null;
  return { v, dec: decimalesEcrites(s), pourcent };
}

/** Lecture d'un pourcentage demandé « en % » : « 95,4 », « 95,4 % » ou la proportion « 0,954 ».
 * Renvoie les valeurs possibles EN POURCENT (sans « % », les deux interprétations). */
export function lirePourcent(brut: string): number[] | null {
  const lu = lireValeurVA(brut);
  if (!lu) return null;
  if (lu.pourcent) return [lu.v * 100];
  return [lu.v, lu.v * 100];
}

/** Liste « 3 ; 4 », « 3 et 4 », « 3, 4 » (virgule suivie d'une espace), « {3 ; 4} » → valeurs (`null` si
 * un élément est illisible). Un seul nombre → une liste à un élément. */
export function lireListeVA(brut: string): number[] | null {
  const s = normaliserSigneMoins(brut ?? "").trim().replace(/^[{(]|[})]$/g, "");
  const morceaux = s.split(/\s*;\s*|\s+et\s+|\s+ou\s+|,\s+/).filter((m) => m.trim() !== "");
  if (morceaux.length === 0) return null;
  const vals: number[] = [];
  for (const m of morceaux) {
    const lu = lireValeurVA(m.replace(/^[a-zA-Zλ]\s*=\s*/, ""));
    if (!lu) return null;
    vals.push(lu.v);
  }
  return vals;
}
