import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceAN, PhaseAN } from "../core6e/approximationNormale";
import { bornesBrutes, bornesCorrigees, mu, pDe, probaDepuisZ, probaExacte, probasAcceptees, sigma, sigma2, zExact } from "../core6e/approximationNormale";
import { phiExact } from "../core6e/tablePhi";
import { lireValeurVA } from "./lectureVariablesAleatoires";
import { piegeDesigne, proche, statutValeur, tropArrondie } from "./verificationLoisLotH2";
import { nL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen118`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative ; « √24 », « sqrt(24) » lus). μ et bornes : exacts ; σ : exact ou au centième ; z : à un
 * centième près du z exact (σ arrondi admis) ; probabilité approchée : la table avec ces z, ou Φ exact,
 * à 0,0001 près ; probabilité exacte (non approximable) : à 0,00005 près. Moins de quatre décimales et
 * proche : message, aucune tentative. Messages ciblés : condition stricte (n = 30, p = 0,3 ou 0,7),
 * racine oubliée dans σ, correction oubliée ou du mauvais côté, 1 − Φ oublié, valeur sans correction,
 * valeur exacte donnée au lieu de l'approximation.
 */

type E = ExerciceAN;
type P = PhaseAN;
const t = tx;
const l = lx;

export const probaExacteRef = (e: E) => Math.round(probaExacte(e) * 1e4) / 1e4;

export function messageIllisible(_e: E, p: P): string {
  if (p === "proba" || p === "exacte") return "Probabilité non reconnue : écris un nombre décimal à quatre décimales, par exemple 0,8643. Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris un nombre, par exemple 55,5 ou 4,9 (une racine s'écrit √24 ou sqrt(24)). Cette saisie ne compte pas comme une tentative.";
}

const TOL_Z = 0.0101;

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "verdict") return [valeurs[0] === (e.approximable ? "oui" : "non") ? "correct" : "not_equivalent"];
  if (p === "condition") return [valeurs[0] === e.echec ? "correct" : "not_equivalent"];
  if (p === "exacte") return [statutValeur(valeurs[0] ?? "", [probaExacte(e), probaExacteRef(e)], { tol: 0.00005 })];
  if (p === "parametres") return [statutValeur(valeurs[0] ?? "", [mu(e)], { tol: 1e-9 }), statutValeur(valeurs[1] ?? "", [sigma(e)], { tol: 0.005 + 1e-9 })];
  if (p === "bornes") return bornesCorrigees(e).map((b, i) => statutValeur(valeurs[i] ?? "", [b], { tol: 1e-9 }));
  if (p === "z") return bornesCorrigees(e).map((b, i) => statutValeur(valeurs[i] ?? "", [zExact(e, b)], { tol: TOL_Z }));
  return [statutValeur(valeurs[0] ?? "", probasAcceptees(e), { tol: 0.0001 })];
}

export function approchee(e: E, p: P, valeurs: string[]): string | null {
  const message = "Valeur trop arrondie : donne quatre décimales. Cette saisie ne compte pas comme une tentative.";
  if (p === "proba") return tropArrondie(valeurs[0] ?? "", probasAcceptees(e), { tol: 0.0001, decMin: 4, ecart: 0.01, message });
  if (p === "exacte") return tropArrondie(valeurs[0] ?? "", [probaExacte(e)], { tol: 0.00005, decMin: 4, ecart: 0.01, message });
  if (p === "parametres") {
    const lu = lireValeurVA(valeurs[1] ?? "");
    if (lu && lu.dec !== null && lu.dec < 2 && Math.abs(lu.v - sigma(e)) > 0.005 && Math.abs(lu.v - sigma(e)) < 0.1) return "Écart-type trop arrondi : donne-le au centième. Cette saisie ne compte pas comme une tentative.";
  }
  return null;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "verdict") {
    if (v === (e.approximable ? "oui" : "non")) return null;
    if (e.approximable) return [l(`n=${e.n}>30`), t(" et "), l(`p=${nL(pDe(e))}`), t(" est strictement compris entre "), l("0{,}3"), t(" et "), l("0{,}7"), t(" : les deux conditions sont remplies.")];
    if (e.n === 30) return [t("La condition est "), l("n>30"), t(", une inégalité stricte : "), l("n=30"), t(" ne convient pas.")];
    if (e.pc === 30 || e.pc === 70) return [t("La condition est "), l("0{,}3<p<0{,}7"), t(", avec des inégalités strictes : "), l(`p=${nL(pDe(e))}`), t(" ne convient pas.")];
    return e.echec === "n" ? [l(`n=${e.n}`), t(" n'est pas supérieur à "), l("30"), t(".")] : [l(`p=${nL(pDe(e))}`), t(" n'est pas entre "), l("0{,}3"), t(" et "), l("0{,}7"), t(".")];
  }
  if (p === "condition") return v === e.echec ? null : e.echec === "n" ? [l(`p=${nL(pDe(e))}`), t(" convient ; c'est "), l(`n=${e.n}`), t(" qui n'est pas strictement supérieur à "), l("30"), t(".")] : [l(`n=${e.n}>30`), t(" convient ; c'est "), l("p"), t(" qui ne convient pas.")];
  if (p === "exacte") {
    if (proche(v, [probaExacte(e), probaExacteRef(e)], { tol: 0.00005 })) return null;
    const sansCumul = e.variante === "exactement" ? null : probaExacte({ ...e, variante: "exactement" });
    if (sansCumul !== null && proche(v, [sansCumul], { tol: 0.00005 })) return [t("C'est "), l(`P(X=${e.k})`), t(" seulement : l'événement regroupe plusieurs valeurs de "), l("X"), t(".")];
    if (e.variante === "auMoins" && proche(v, [1 - probaExacte({ ...e, variante: "auPlus" })], { tol: 0.00005 })) return [t("C'est "), l(`P(X>${e.k})`), t(" : le contraire de "), l(`X\\ge ${e.k}`), t(" est "), l(`X\\le ${e.k - 1}`), t(".")];
    if (e.variante === "moinsDe" && proche(v, [probaExacte({ ...e, variante: "auPlus" })], { tol: 0.00005 })) return [t("C'est "), l(`P(X\\le ${e.k})`), t(" : « "), l(`X<${e.k}`), t(" » exclut "), l(`${e.k}`), t(".")];
    return null;
  }
  if (p === "parametres") {
    const lu = lireValeurVA(valeurs[1] ?? "");
    const luMu = lireValeurVA(v);
    if (luMu && Math.abs(luMu.v - e.n * (1 - pDe(e))) < 1e-9 && Math.abs(luMu.v - mu(e)) > 1e-9) return [l("\\mu=np"), t(" : "), l("p"), t(" est la probabilité du succès compté par "), l("X"), t(".")];
    if (lu && Math.abs(lu.v - sigma2(e)) < 0.005) return [t("C'est la variance "), l("np(1-p)"), t(" : l'écart-type est sa racine carrée.")];
    if (lu && Math.abs(lu.v - Math.sqrt(mu(e))) < 0.005) return [l("\\sigma=\\sqrt{np(1-p)}"), t(" : il manque le facteur "), l("1-p"), t(".")];
    return null;
  }
  if (p === "bornes") {
    const brutes = bornesBrutes(e);
    const corr = bornesCorrigees(e);
    for (let i = 0; i < corr.length; i++) {
      const lu = lireValeurVA(valeurs[i] ?? "");
      if (!lu || Math.abs(lu.v - corr[i]!) < 1e-9) continue;
      if (Math.abs(lu.v - brutes[i]!) < 1e-9 && e.variante !== "moinsDe") return [t("Correction de continuité oubliée : la valeur entière "), l(`${brutes[i]}`), t(" occupe l'intervalle "), l(`[${nL(brutes[i]! - 0.5)}\\,;${nL(brutes[i]! + 0.5)}]`), t(".")];
      if (e.variante === "moinsDe" && Math.abs(lu.v - (e.k + 0.5)) < 1e-9) return [l(`X<${e.k}`), t(" exclut "), l(`${e.k}`), t(" : c'est "), l(`X\\le ${e.k - 1}`), t(", donc "), l(`${e.k - 1}+0{,}5`), t(".")];
      if (Math.abs(Math.abs(lu.v - corr[i]!) - 1) < 1e-9) return [t("La demi-unité est du mauvais côté : la borne entière fait partie de l'événement, on garde la demi-unité qui l'entoure du côté de l'événement.")];
      if (e.variante === "moinsDe" && Math.abs(lu.v - e.k) < 1e-9) return [t("Correction de continuité : "), l(`P(X<${e.k})=P(X\\le ${e.k - 1})`), t(", puis on ajoute la demi-unité.")];
    }
    return null;
  }
  if (p === "z") {
    const brutes = bornesBrutes(e);
    for (let i = 0; i < brutes.length; i++) {
      const lu = lireValeurVA(valeurs[i] ?? "");
      if (!lu) continue;
      if (Math.abs(lu.v - zExact(e, bornesCorrigees(e)[i]!)) <= TOL_Z) continue;
      if (Math.abs(lu.v - zExact(e, brutes[i]!)) <= TOL_Z) return [t("Ce "), l("z"), t(" est calculé sans la correction de continuité : utilise la borne corrigée de l'écran précédent.")];
      if (Math.abs(lu.v + zExact(e, bornesCorrigees(e)[i]!)) <= TOL_Z) return [t("Le signe est faux : "), l("z=\\dfrac{b-\\mu}{\\sigma}"), t(" est négatif quand la borne est sous la moyenne.")];
      if (Math.abs(lu.v - (bornesCorrigees(e)[i]! - mu(e)) / sigma2(e)) <= TOL_Z) return [t("On divise par l'écart-type "), l("\\sigma"), t(", pas par la variance.")];
    }
    return null;
  }
  // p === "proba"
  const zs = bornesCorrigees(e).map((b) => zExact(e, b));
  const pieges: { x: number; message: Frag[] }[] = [];
  if (e.variante === "auMoins") pieges.push({ x: phiExact(zs[0]!), message: [l("\\Phi(z)"), t(" est l'aire à gauche ; on demande "), l("P(Y\\ge b)=1-\\Phi(z)"), t(".")] });
  if (e.variante !== "auMoins" && e.variante !== "exactement" && e.variante !== "entre") pieges.push({ x: 1 - phiExact(zs[0]!), message: [t("C'est l'aire à droite de "), l("z"), t(" ; on demande l'aire à gauche, "), l("\\Phi(z)"), t(".")] });
  const brutes = bornesBrutes(e);
  if (e.variante !== "exactement") pieges.push({ x: probaDepuisZ(e, brutes.map((b) => zExact(e, b)), phiExact), message: [t("C'est la valeur sans correction de continuité ; reprends avec les bornes corrigées.")] });
  pieges.push({ x: probaExacte(e), message: [t("C'est la valeur exacte de la loi binomiale ; on demande ici l'estimation par la loi normale (avec la table de "), l("\\Phi"), t(").")] });
  return piegeDesigne(v, probasAcceptees(e), pieges, { tol: 0.0001 });
}
