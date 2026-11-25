import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceNP, PhaseNP } from "../core6e/normaleParametres";
import { proportion, xDe, zDe } from "../core6e/normaleParametres";
import { lireValeurVA } from "./lectureVariablesAleatoires";
import { proche, statutValeur } from "./verificationLoisLotH2";
import { nL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen120`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative ; unité finale « 8 cm » lue). z : arrondi au centième égal à celui de la case (la valeur
 * inverse de la calculatrice, « 1,2501 », est acceptée) ; σ et μ : à 0,05 près (au dixième). Messages
 * ciblés : signe de z, probabilité prise pour z, écart-type négatif (signe de z), x = μ − zσ,
 * multiplication au lieu de division.
 */

type E = ExerciceNP;
type P = PhaseNP;
const t = tx;
const l = lx;
const TOL = 0.05 + 1e-9;

export function messageIllisible(_e: E, p: P): string {
  return p === "z" ? "Valeur non reconnue : écris un nombre décimal avec son signe, par exemple −1,25. Cette saisie ne compte pas comme une tentative." : "Valeur non reconnue : écris un nombre, par exemple 8,5 (l'unité peut suivre). Cette saisie ne compte pas comme une tentative.";
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "z") return e.donnees.map((d, i) => statutValeur(valeurs[i] ?? "", [zDe(d)], { tol: 0.005 - 1e-9 }));
  if (p === "sigma") return [statutValeur(valeurs[0] ?? "", [e.sigma], { tol: TOL })];
  return [statutValeur(valeurs[0] ?? "", [e.mu], { tol: TOL })];
}

export function approchee(): string | null {
  return null;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "z") {
    for (let i = 0; i < e.donnees.length; i++) {
      const d = e.donnees[i]!;
      const v = valeurs[i] ?? "";
      if (proche(v, [zDe(d)], { tol: 0.005 })) continue;
      if (proche(v, [-zDe(d)], { tol: 0.005 })) return zDe(d) < 0 ? [t("Le signe manque : "), l(nL(xDe(e, d))), t(" est sous la moyenne (la probabilité à sa gauche est inférieure à "), l("0{,}5"), t("), donc son "), l("z"), t(" est négatif.")] : [t("Le signe est faux : la probabilité à gauche de cette valeur dépasse "), l("0{,}5"), t(", donc son "), l("z"), t(" est positif.")];
      if (proche(v, [proportion(d), 1 - proportion(d), proportion(d) * 100], { tol: 1e-6 })) return [t("C'est une probabilité ; "), l("z"), t(" se lit dans les marges de la table, en face de cette probabilité (ou de son complément).")];
    }
    return null;
  }
  const lu = lireValeurVA(valeurs[0] ?? "");
  if (!lu || Math.abs(lu.v - (p === "sigma" ? e.sigma : e.mu)) <= TOL) return null;
  const d = e.donnees[0]!;
  const z = zDe(d);
  const x = xDe(e, d);
  if (p === "sigma") {
    if (Math.abs(lu.v + e.sigma) <= TOL) return [t("Un écart-type est toujours positif : vérifie le signe de "), l("z"), t(" (une valeur sous la moyenne a un "), l("z"), t(" négatif).")];
    if (e.variante === "sigma" && Math.abs(lu.v - (x - e.mu) * z) <= TOL) return [t("De "), l("x-\\mu=z\\sigma"), t(", on tire "), l("\\sigma=\\dfrac{x-\\mu}{z}"), t(" : on divise par "), l("z"), t(".")];
    return null;
  }
  if (e.variante === "mu" && Math.abs(lu.v - (x + z * e.sigma)) <= TOL) return [t("De "), l("x=\\mu+z\\sigma"), t(", on tire "), l("\\mu=x-z\\sigma"), t(" : attention au signe.")];
  if (Math.abs(lu.v - x) <= TOL) return [t("C'est la valeur donnée dans l'énoncé ; la moyenne s'en déduit par "), l("\\mu=x-z\\sigma"), t(".")];
  return null;
}
