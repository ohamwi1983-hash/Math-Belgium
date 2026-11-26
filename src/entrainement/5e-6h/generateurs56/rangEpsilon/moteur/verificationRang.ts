import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireValeur } from "../../../../5e-4h/moteur5e/lectureValeurTrigo";
import type { ExerciceRang } from "../index";
import { ecart, fibonacci, limite, terme, valeurEps } from "../index";
import type { PhaseRang } from "../ui/formatRang";
import { borneValeur, epsL } from "../ui/formatRang";
import { expressionEgale, statutExpression } from "../../expression56";

/**
 * Vérification de `56gen22`. Limite exacte (fraction ; Φ : valeur exacte ou au moins trois décimales,
 * ±6·10⁻⁴) — une valeur décimale approchée d'une fraction est refusée SANS tentative ; écart en fonction
 * de n comparé aux rangs 1 à 8 ; borne B exacte (fraction) ou au centième ; rangs entiers exacts ;
 * v_{n₀} en fraction. Saisie illisible → `parse_error` (aucune tentative).
 */

type E = ExerciceRang;
const POINTS = [1, 2, 3, 4, 5, 6, 7, 8];
const lire = (s: string) => lireValeur(s ?? "");

function statut(brut: string, cible: number, tol: number): StatutVerification {
  const v = lire(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tol + 1e-12 * Math.max(1, Math.abs(cible)) ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, phase: PhaseRang, v: string[]): StatutVerification[] {
  switch (phase) {
    case "limite":
      return [statut(v[0], limite(e), e.variante === "fibonacci" ? 6e-4 : 1e-9)];
    case "ecart":
      return [statutExpression(v[0], "n", POINTS, (n) => ecart(e, n))];
    case "inequation": {
      if (e.variante !== "rationnelle") return ["not_equivalent"];
      const B = borneValeur(e);
      return [statut(v[0], B, e.bDen === 1 ? 1e-9 : 0.006)];
    }
    case "premier":
      return [statut(v[0], e.N, 1e-9)];
    case "rang":
      return [statut(v[0], e.m, 1e-9)];
    case "terme": {
      const n0 = (e as { n0: number }).n0;
      return [statut(v[0], fibonacci(n0 + 1) / fibonacci(n0), 1e-12)];
    }
  }
}

/** Valeur exacte demandée : une écriture décimale proche mais pas exacte est refusée sans tentative. */
export function approchee(e: E, phase: PhaseRang, v: string[]): string | null {
  const x = lire(v[0]);
  if (x === null || !/[.,]/.test(v[0] ?? "")) return null;
  if (phase === "limite" && e.variante === "rationnelle") {
    const l = limite(e);
    if (Math.abs(x - l) > 1e-9 && Math.abs(x - l) < 0.01) return "On demande la valeur exacte : écris-la sous forme de fraction (par exemple 2/3). Cette saisie ne compte pas comme une tentative.";
  }
  if (phase === "terme") {
    const n0 = (e as { n0: number }).n0;
    const t = fibonacci(n0 + 1) / fibonacci(n0);
    if (Math.abs(x - t) > 1e-12 && Math.abs(x - t) < 0.01) return "On demande une fraction (écrite avec une barre, par exemple 8/5), pas une valeur décimale. Cette saisie ne compte pas comme une tentative.";
  }
  return null;
}

function proche(brut: string, cible: number, tol = 1e-9): boolean {
  const x = lire(brut);
  return x !== null && Math.abs(x - cible) <= tol;
}

export function piege(e: E, phase: PhaseRang, v: string[]): Frag[] | null {
  switch (phase) {
    case "limite":
      if (e.variante === "rationnelle") {
        if (proche(v[0], e.b / e.d)) return [tx("Ce sont les termes constants : pour n très grand, ce sont les termes en n qui l'emportent.")];
        if (proche(v[0], e.c / e.a)) return [tx("Tu as inversé : numérateur sur dénominateur.")];
        if (proche(v[0], terme(e, 1))) return [tx("C'est le premier terme, pas la limite.")];
        return null;
      }
      if (e.variante === "geometrique") {
        if (proche(v[0], 0)) return [tx("C'est le terme en n qui tend vers 0 ; la suite, elle, tend vers le nombre qui reste.")];
        if (proche(v[0], e.ell + e.k)) return [tx("Le terme en n ne vaut pas k à l'infini : il tend vers 0.")];
        return null;
      }
      if (proche(v[0], (1 - Math.sqrt(5)) / 2, 1e-3)) return [tx("C'est la solution négative ; les rapports sont positifs.")];
      if (proche(v[0], 1.62, 1e-9) || proche(v[0], 1.6, 1e-9)) return [tx("Pas assez précis : donne la valeur exacte, ou au moins trois décimales.")];
      return null;
    case "ecart":
      if (expressionEgale(v[0], "n", POINTS, (n) => -ecart(e, n)) || (e.variante === "geometrique" && expressionEgale(v[0], "n", POINTS, (n) => terme(e, n) - limite(e)))) return [tx("Une valeur absolue est toujours positive : enlève le signe « − » (et le facteur "), lx("(-1)^n"), tx(" éventuel).")];
      if (expressionEgale(v[0], "n", POINTS, (n) => terme(e, n))) return [tx("Retire la limite : on demande l'écart entre "), lx("u_n"), tx(" et "), lx("\\ell"), tx(".")];
      return [tx("Vérifie ton expression avec "), lx("n=1"), tx(" : tu dois retrouver "), lx("|u_1-\\ell|"), tx(".")];
    case "inequation": {
      if (e.variante !== "rationnelle") return null;
      const B = borneValeur(e);
      if (proche(v[0], Math.floor(B) + 1)) return [tx("On demande la borne de l'inéquation "), lx("n>B"), tx(", pas le premier rang qui convient.")];
      if (proche(v[0], e.K / (e.c * valeurEps(e.eps)), 1e-6) || proche(v[0], e.K / valeurEps(e.eps), 1e-6)) return [tx("Isole n jusqu'au bout : retire "), lx(`${e.d}`), tx(" puis divise par "), lx(`${e.c}`), tx(".")];
      if (proche(v[0], -B, 0.006)) return [tx("En passant aux inverses de deux nombres positifs, l'inégalité change de sens, mais pas le signe des nombres.")];
      return null;
    }
    case "premier": {
      const x = lire(v[0]);
      if (x === null || !Number.isInteger(x) || x < 1) return [tx("Donne un rang : un naturel non nul.")];
      if (ecart(e, x) >= valeurEps(e.eps)) return [tx("Au rang "), lx(`${x}`), tx(", l'écart vaut encore au moins "), lx(epsL(e.eps)), tx(" : continue dans la table.")];
      return [tx("L'écart est déjà sous "), lx(epsL(e.eps)), tx(" à un rang plus petit : cherche le premier rang qui convient.")];
    }
    case "rang":
      if (proche(v[0], e.N)) return [tx("C'est le premier rang qui convient. La définition dit « pour tout n > m » : m est le rang juste avant.")];
      if (proche(v[0], e.m - 1)) return [tx("Avec ce rang, "), lx(`n=${e.m}`), tx(" serait aussi demandé, mais l'écart n'y est pas encore sous "), lx("\\varepsilon"), tx(".")];
      return null;
    case "terme": {
      const n0 = (e as { n0: number }).n0;
      if (proche(v[0], fibonacci(n0) / fibonacci(n0 + 1))) return [tx("Tu as inversé : "), lx("v_n=\\dfrac{F_{n+1}}{F_n}"), tx(" est plus grand que 1.")];
      if (proche(v[0], fibonacci(n0 + 2) / fibonacci(n0 + 1)) || proche(v[0], fibonacci(n0) / fibonacci(n0 - 1))) return [tx("Décalage d'un rang : vérifie la numérotation "), lx("F_1=F_2=1"), tx(".")];
      return null;
    }
  }
}
