import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExercicePL, PhasePL } from "../core6e/poissonInverse";
import { auMoins, cumul, lambdaAjuste, lambdaBase, lambdaFinal, modes, p0, refsProba, seuil, terme } from "../core6e/poissonInverse";
import { lireListeVA, lireValeurVA } from "./lectureVariablesAleatoires";
import { piegeDesigne, proche, statutValeur, tropArrondie } from "./verificationLoisLotH2";
import { nL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen121`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative ; « -ln(0,0498) », « √3 », « 3 ; 4 » lus). λ depuis P(X = 0) : à 0,01 près (valeur exacte
 * ou −ln de la probabilité donnée) ; λ ajusté : idem, multiplié ; λ par la récurrence, E(X) : exacts ;
 * σ : au centième ; valeurs les plus probables : l'ensemble exact (ordre libre) ; seuil : entier ;
 * probabilité : à 0,0001 près, moins de quatre décimales et proche → message sans tentative. Messages
 * ciblés : λ non ajusté, −ln oublié, σ = λ, une seule des deux valeurs les plus probables, seuil décalé
 * d'une unité (P(X ≥ k) = 1 − P(X ≤ k − 1)), probabilité calculée avec le taux non ajusté.
 */

type E = ExercicePL;
type P = PhasePL;
const t = tx;
const l = lx;

export function messageIllisible(_e: E, p: P): string {
  if (p === "mode") return "Valeur non reconnue : écris un entier, ou deux entiers séparés par un point-virgule (3 ; 4). Cette saisie ne compte pas comme une tentative.";
  if (p === "proba") return "Probabilité non reconnue : écris un nombre décimal à quatre décimales, par exemple 0,1954. Cette saisie ne compte pas comme une tentative.";
  return "Valeur non reconnue : écris un nombre (par exemple 2,5, 3/2 ou -ln(0,05)). Cette saisie ne compte pas comme une tentative.";
}

const refsLambda = (e: E) => (e.variante === "lambdaZero" ? [lambdaBase(e), -Math.log(p0(e))] : [lambdaBase(e)]);
const refsAjuste = (e: E) => (e.variante === "lambdaZero" ? [lambdaAjuste(e), -Math.log(p0(e)) * e.d.m!] : [lambdaAjuste(e)]);

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  switch (p) {
    case "lambda":
      return [statutValeur(v, refsLambda(e), { tol: e.variante === "lambdaZero" ? 0.01 : 1e-9 })];
    case "lambdaAjuste":
      return [statutValeur(v, refsAjuste(e), { tol: e.variante === "lambdaZero" ? 0.01 * e.d.m! : 1e-9 })];
    case "esperance":
      return [statutValeur(v, [lambdaBase(e)], { tol: 1e-9 }), statutValeur(valeurs[1] ?? "", [Math.sqrt(lambdaBase(e))], { tol: 0.005 + 1e-9 })];
    case "mode": {
      const liste = lireListeVA(v);
      if (!liste) return ["parse_error"];
      const m = modes(lambdaFinal(e));
      const ok = liste.length === m.length && m.every((x) => liste.some((y) => Math.abs(x - y) < 1e-9));
      return [ok ? "correct" : "not_equivalent"];
    }
    case "seuil":
      return [statutValeur(v, [seuil(lambdaFinal(e), e.d.a100! / 100)], { tol: 1e-9 })];
    default:
      return [statutValeur(v, refsProba(e), { tol: 0.0001 })];
  }
}

export function approchee(e: E, p: P, valeurs: string[]): string | null {
  if (p === "proba") return tropArrondie(valeurs[0] ?? "", refsProba(e), { tol: 0.0001, decMin: 4, ecart: 0.01, message: "Valeur trop arrondie : donne quatre décimales. Cette saisie ne compte pas comme une tentative." });
  if (p === "esperance") {
    const lu = lireValeurVA(valeurs[1] ?? "");
    const s = Math.sqrt(lambdaBase(e));
    if (lu && lu.dec !== null && lu.dec < 2 && Math.abs(lu.v - s) > 0.005 && Math.abs(lu.v - s) < 0.1) return "Écart-type trop arrondi : donne-le au centième. Cette saisie ne compte pas comme une tentative.";
  }
  return null;
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  const lu = lireValeurVA(v);
  switch (p) {
    case "lambda":
      if (!lu || e.variante !== "lambdaZero") return null;
      if (Math.abs(lu.v - p0(e)) < 1e-6) return [t("C'est la probabilité donnée ; "), l("\\lambda"), t(" vérifie "), l(`e^{-\\lambda}=${nL(p0(e))}`), t(" : prends le logarithme népérien.")];
      if (Math.abs(lu.v + lambdaBase(e)) < 0.01) return [t("Le signe est faux : "), l("\\ln(e^{-\\lambda})=-\\lambda"), t(", donc "), l("\\lambda=-\\ln P(X=0)"), t(", un nombre positif.")];
      return null;
    case "lambdaAjuste":
      if (!lu || proche(v, refsAjuste(e), { tol: e.variante === "lambdaZero" ? 0.01 * e.d.m! : 1e-9 })) return null;
      if (proche(v, refsLambda(e), { tol: 0.01 }) && e.d.m !== 1) return [t("C'est le paramètre de départ, pas encore ajusté : l'échelle de la question est "), l(`${e.d.m}`), t(" fois plus grande.")];
      if (proche(v, refsLambda(e).map((x) => x / e.d.m!), { tol: 0.01 })) return [t("On multiplie par "), l(`${e.d.m}`), t(", on ne divise pas : plus la durée est longue, plus on attend d'événements.")];
      return null;
    case "esperance": {
      const s = lireValeurVA(valeurs[1] ?? "");
      if (s && Math.abs(s.v - lambdaBase(e)) < 1e-9 && Math.abs(lambdaBase(e) - 1) > 1e-9) return [t("C'est la variance "), l("V(X)=\\lambda"), t(" ; l'écart-type est sa racine carrée.")];
      return null;
    }
    case "mode": {
      const liste = lireListeVA(v);
      if (!liste) return null;
      const lam = lambdaFinal(e);
      const m = modes(lam);
      if (m.length === 2 && liste.length === 1 && m.some((x) => Math.abs(x - liste[0]!) < 1e-9)) return [l(`\\lambda=${nL(lam)}`), t(" est entier : "), l(`P(X=${m[1]})=P(X=${m[0]})\\times\\dfrac{${nL(lam)}}{${m[1]}}=P(X=${m[0]})`), t(". Il y a deux valeurs les plus probables.")];
      if (m.length === 1 && liste.length === 1 && Math.abs(liste[0]! - Math.ceil(lam)) < 1e-9) return [t("Pour "), l(`k=${Math.ceil(lam)}`), t(", le rapport "), l(`\\dfrac{\\lambda}{k}=\\dfrac{${nL(lam)}}{${Math.ceil(lam)}}`), t(" est inférieur à 1 : la probabilité a déjà commencé à diminuer.")];
      return null;
    }
    case "seuil": {
      if (!lu) return null;
      const lam = lambdaFinal(e);
      const a = e.d.a100! / 100;
      const k = seuil(lam, a);
      if (Math.abs(lu.v - (k - 1)) < 1e-9) return [l(`P(X\\ge ${k - 1})\\approx ${nL(auMoins(lam, k - 1), 4)}`), t(", plus grand que "), l(nL(a)), t(" : ce seuil serait atteint trop souvent. Attention : "), l("P(X\\ge k)=1-P(X\\le k-1)"), t(".")];
      if (Math.abs(lu.v - (k + 1)) < 1e-9) return [t("Ce seuil convient, mais ce n'est pas le plus petit : vérifie "), l(`P(X\\ge ${k})`), t(".")];
      return null;
    }
    default: {
      const pieges: { x: number; message: Frag[] }[] = [];
      const d = e.d;
      if (e.variante === "lambdaZero") {
        const lb = lambdaBase(e);
        pieges.push({ x: d.q === 1 ? terme(lb, 0) + terme(lb, 1) : terme(lb, d.j!), message: [t("Ce calcul utilise "), l(`\\lambda=${nL(lb)}`), t(", le paramètre de "), l("X"), t(" ; pour "), l("Y"), t(", il faut le paramètre ajusté.")] });
      }
      if (e.variante === "seuil") {
        const lam = lambdaFinal(e);
        const k = seuil(lam, d.a100! / 100);
        pieges.push({ x: 1 - cumul(lam, k), message: [t("C'est "), l(`P(X>${k})`), t(" ; "), l(`P(X\\ge ${k})=1-P(X\\le ${k - 1})`), t(".")] });
        pieges.push({ x: lambdaBase(e) === lam ? -1 : auMoins(lambdaBase(e), k), message: [t("Ce calcul utilise le taux non ajusté.")] });
      }
      if (d.q === 1 && e.variante !== "mode" && e.variante !== "seuil") pieges.push({ x: terme(lambdaFinal(e), 0), message: [t("Il manque le cas "), l("1"), t(" : « au plus 1 » regroupe les valeurs 0 et 1.")] });
      return piegeDesigne(v, refsProba(e), pieges, { tol: 0.0001 });
    }
  }
}
