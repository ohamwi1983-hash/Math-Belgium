import type { ExerciceTauxInstantane } from "../core5e/tauxInstantane";
import { contexte, deriveeCoefs, pointsControle, tauxInstantane, tauxMoyen, valeur } from "../core5e/tauxInstantane";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { polyVal } from "../ui5e/ecrituresApplicationsDerivees";
import type { PhaseTauxInstantane } from "../ui5e/formatTauxInstantane";
import { F, V } from "../ui5e/formatTauxInstantane";
import { egal, lireFonctionVar, lireNombre, memesFonctions, statut, statutNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen70`. Saisie LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireNombre` (fractions, unité finale recopiée ignorée), dérivée en t (ou
 * q) comparée en cinq points du domaine. Choix fermés (unité, interprétation) : une tentative.
 * Messages ciblés : taux moyen sans diviser par b − a ou à l'envers, f′(a) donné pour le taux moyen,
 * constante gardée dans la dérivée, exposant non diminué, f(a) donné pour f′(a), unité de f,
 * quotient inversé, signe, instant / moyenne, valeur / vitesse.
 */

type E = ExerciceTauxInstantane;

export function diagnostiquer(e: E, p: PhaseTauxInstantane, valeurs: string[]): StatutVerification[] {
  if (p === "moyen") return [statutNombre(valeurs[0] ?? "", tauxMoyen(e))];
  if (p === "derivee") {
    const g = lireFonctionVar(valeurs[0] ?? "", V(e));
    if (!g) return ["parse_error"];
    return [statut(memesFonctions(g, (x) => polyVal(deriveeCoefs(e), x), pointsControle(e)))];
  }
  if (p === "instantane") return [statutNombre(valeurs[0] ?? "", tauxInstantane(e))];
  if (p === "unite") return [statut(valeurs[0] === "u0")];
  return [statut(valeurs[0] === "i0")];
}

export function piege(e: E, p: PhaseTauxInstantane, valeurs: string[]): Frag[] | null {
  const f = F(e);
  const v = V(e);
  if (p === "moyen") {
    const x = lireNombre(valeurs[0] ?? "");
    if (x === null) return null;
    const dv = valeur(e, e.b) - valeur(e, e.a);
    if (egal(x, dv) && e.b - e.a !== 1) return [tx("C'est la variation de "), lx(f), tx(" : divise-la encore par la longueur de l'intervalle, "), lx(`${e.b}-${e.a}`), tx(".")];
    if (egal(x, -tauxMoyen(e))) return [tx("Signe faux : calcule "), lx(`${f}(${e.b})-${f}(${e.a})`), tx(" (valeur finale moins valeur initiale).")];
    if (dv !== 0 && egal(x, (e.b - e.a) / dv)) return [tx("Le quotient est à l'envers : la variation de la grandeur va au numérateur.")];
    if (egal(x, tauxInstantane(e))) return [tx("C'est le taux instantané en "), lx(`${v}=${e.a}`), tx(" : ici on demande la moyenne entre les deux instants.")];
    return null;
  }
  if (p === "derivee") {
    const g = lireFonctionVar(valeurs[0] ?? "", v);
    if (!g) return null;
    const pts = pointsControle(e);
    const cst = e.coefs[e.coefs.length - 1]!;
    if (cst !== 0 && memesFonctions(g, (x) => polyVal(deriveeCoefs(e), x) + cst, pts)) return [tx("La dérivée d'une constante est nulle.")];
    const deg = e.coefs.length - 1;
    if (memesFonctions(g, (x) => e.coefs.slice(0, -1).reduce((acc, c, i) => acc + c * (deg - i) * x ** (deg - i), 0), pts)) return [tx("L'exposant passe devant et diminue de 1 : "), lx(`(${v}^n)'=n\\,${v}^{n-1}`), tx(".")];
    return null;
  }
  if (p === "instantane") {
    const x = lireNombre(valeurs[0] ?? "");
    if (x === null) return null;
    if (egal(x, valeur(e, e.a))) return [tx("C'est la valeur "), lx(`${f}(${e.a})`), tx(" : le taux instantané se calcule avec la dérivée.")];
    if (egal(x, tauxMoyen(e))) return [tx("C'est le taux moyen : le taux instantané est "), lx(`${f}'(${e.a})`), tx(".")];
    if (egal(x, -tauxInstantane(e))) return [tx("Vérifie les signes en remplaçant "), lx(v), tx(" par "), lx(`${e.a}`), tx(".")];
    return null;
  }
  const c = contexte(e);
  if (p === "unite") {
    const k = Number((valeurs[0] ?? "").slice(1));
    if (k === 1) return [tx(`C'est l'unité de ${f} lui-même ; un taux de variation est un quotient : des ${c.uniteF} par ${c.uniteX}.`)];
    if (k === 2) return [tx(`Le quotient est à l'envers : variation de ${f} (en ${c.uniteF}) divisée par variation de ${v} (en ${c.uniteX}).`)];
    if (k === 3) return [tx("Un taux de variation est un quotient, pas un produit.")];
    return null;
  }
  const k = Number((valeurs[0] ?? "").slice(1));
  if (k === 1) return [tx("Le signe compte : "), lx(`${f}'(${e.a})`), tx(tauxInstantane(e) > 0 ? " est positif, la grandeur augmente." : " est négatif, la grandeur diminue.")];
  if (k === 2) return [tx("Le nombre dérivé est un taux instantané, en "), lx(`${v}=${e.a}`), tx(" ; une moyenne sur un intervalle, c'est le taux moyen.")];
  if (k === 3) return [lx(`${f}'(${e.a})`), tx(" n'est pas la valeur de la grandeur, mais la vitesse à laquelle elle varie.")];
  return null;
}
