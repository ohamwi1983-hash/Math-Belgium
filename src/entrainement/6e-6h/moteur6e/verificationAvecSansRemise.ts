import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceASR, ModeleASR, PhaseASR } from "../core6e/avecSansRemise";
import { autreModele, loi, parametres, probaEvenement, probaJuste } from "../core6e/avecSansRemise";
import { C, frVal } from "../ui6e/nombresCombinatoireLotH2";
import { decimalesEcrites, lireRationnel, ratVal } from "./lectureCombinatoireLotH2";

/**
 * Vérification de `6gen108`. Écran 1 : identifiant du modèle (choix fermé, une tentative). Écrans 2
 * et 3 : saisie LUE avant tout verdict (illisible → `parse_error`, aucune tentative) : entier, fraction,
 * décimal, « C(4,1)·C(28,2)/C(32,3) », préfixe « P(X ≥ 1) = ». Probabilité : écriture exacte (égale à
 * 1e-12 près) ou décimale d'AU MOINS quatre décimales à 0,00005 près (arrondi au dix-millième) ; un
 * décimal plus court et proche (à 0,01) est une valeur trop arrondie : message, AUCUNE tentative.
 * Messages ciblés : probabilité de l'AUTRE modèle (avec / sans remise), complément oublié, un seul des
 * deux cas de « au plus un », coefficient Cₙᵏ oublié (un seul ordre), Cₙᵏ au dénominateur, paramètres
 * p = (N − K)/N ou n et N échangés.
 */

type E = ExerciceASR;
type P = PhaseASR;
const t = tx;
const l = lx;

export function messageIllisible(_e: E, p: P): string {
  if (p === "parametres") return "Valeur non reconnue : écris un entier, une fraction (3/10) ou un décimal (0,3). Cette saisie ne compte pas comme une tentative.";
  return "Probabilité non reconnue : écris une fraction (par exemple 3/8), un décimal à quatre décimales (0,3087) ou un calcul avec C(n,k). Cette saisie ne compte pas comme une tentative.";
}

const lire = (v: string): number | null => {
  const r = lireRationnel(v);
  return r === null ? null : ratVal(r);
};

/** La saisie de probabilité désigne-t-elle la valeur `x` (exacte, ou décimale à 4 décimales au moins) ? */
function designe(v: string, x: number): boolean {
  const lu = lire(v);
  if (lu === null) return false;
  const dec = decimalesEcrites(v);
  if (dec !== null && dec >= 4) return Math.abs(lu - x) <= 0.00005 + 1e-12;
  return Math.abs(lu - x) <= 1e-12;
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "modele") return [valeurs[0] === e.modele ? "correct" : "not_equivalent"];
  if (p === "parametres")
    return parametres(e).map((x, i) => {
      const lu = lire(valeurs[i] ?? "");
      if (lu === null) return "parse_error";
      return Math.abs(lu - frVal(x)) < 1e-12 ? "correct" : "not_equivalent";
    });
  const lu = lire(valeurs[0] ?? "");
  if (lu === null) return ["parse_error"];
  return [designe(valeurs[0] ?? "", frVal(probaJuste(e))) ? "correct" : "not_equivalent"];
}

/** Décimal de moins de quatre décimales, proche de la valeur : message, aucune tentative. */
export function approchee(e: E, p: P, valeurs: string[]): string | null {
  if (p !== "proba") return null;
  const v = valeurs[0] ?? "";
  const dec = decimalesEcrites(v);
  const lu = lire(v);
  if (dec === null || lu === null || dec >= 4) return null;
  const x = frVal(probaJuste(e));
  return Math.abs(lu - x) > 1e-12 && Math.abs(lu - x) <= 0.01 ? "Valeur trop arrondie : donne la valeur exacte (une fraction) ou arrondis au dix-millième (quatre décimales). Cette saisie ne compte pas comme une tentative." : null;
}

function messagesModele(choisi: ModeleASR, e: E): Frag[] | null {
  if (choisi === e.modele) return null;
  return e.modele === "binomiale"
    ? [t("Chaque élément tiré est remis avant le tirage suivant : la population ne change pas et la probabilité d'un succès reste "), l(`\\dfrac{${e.K}}{${e.N}}`), t(" à chaque tirage. C'est une loi binomiale.")]
    : [t("Les éléments tirés ne sont pas remis : après un succès, il en reste "), l(`${e.K - 1}`), t(" sur "), l(`${e.N - 1}`), t(". Les tirages ne sont pas indépendants : loi hypergéométrique.")];
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "modele") return messagesModele(valeurs[0] as ModeleASR, e);
  if (p === "parametres") {
    const vals = valeurs.map((v) => lire(v ?? ""));
    const attendus = parametres(e).map(frVal);
    const fauxEn = (i: number) => vals[i] !== null && Math.abs(vals[i]! - attendus[i]!) > 1e-12;
    if (e.modele === "binomiale") {
      if (fauxEn(1) && Math.abs(vals[1]! - (e.N - e.K) / e.N) < 1e-12) return [t("C'est la probabilité d'un échec : le succès est l'élément compté par "), l("X"), t(".")];
      if (fauxEn(0) && vals[0] === e.N) return [l("n"), t(" est le nombre de tirages, pas la taille de la population.")];
    } else {
      if (fauxEn(0) && vals[0] === e.n && vals[2] === e.N) return [l("N"), t(" et "), l("n"), t(" sont échangés : "), l("N"), t(" est la population entière, "), l("n"), t(" le nombre d'éléments tirés.")];
      if (fauxEn(1) && vals[1] === e.N - e.K) return [l("K"), t(" est le nombre de succès (les éléments comptés par "), l("X"), t("), pas celui des échecs.")];
    }
    return null;
  }
  const v = valeurs[0] ?? "";
  const juste = frVal(probaJuste(e));
  if (designe(v, juste) || lire(v) === null) return null;
  const autre = autreModele(e.modele);
  if (designe(v, frVal(probaEvenement(e, autre))))
    return e.modele === "binomiale" ? [t("C'est la probabilité pour des tirages sans remise (loi hypergéométrique) ; ici, chaque élément est remis.")] : [t("C'est la probabilité pour des tirages avec remise (loi binomiale) ; ici, les éléments tirés ne sont pas remis.")];
  const m = e.modele;
  const essais: { x: number; message: Frag[] }[] = [];
  if (e.evenement === "auMoinsUn") {
    essais.push({ x: frVal(loi(e, m, 0)), message: [t("C'est "), l("P(X=0)"), t(", la probabilité de n'avoir aucun succès : il reste à passer au contraire, "), l("1-P(X=0)"), t(".")] });
    essais.push({ x: frVal(loi(e, m, 1)), message: [t("« Au moins un » ne veut pas dire « exactement un » : passe par le contraire, "), l("1-P(X=0)"), t(".")] });
  }
  if (e.evenement === "auPlusUn") {
    essais.push({ x: frVal(loi(e, m, 0)), message: [t("Il manque le cas "), l("X=1"), t(" : « au plus un » regroupe "), l("X=0"), t(" et "), l("X=1"), t(".")] });
    essais.push({ x: frVal(loi(e, m, 1)), message: [t("Il manque le cas "), l("X=0"), t(" : « au plus un » regroupe "), l("X=0"), t(" et "), l("X=1"), t(".")] });
    essais.push({ x: 1 - frVal(loi(e, m, 0)) - frVal(loi(e, m, 1)), message: [t("C'est la probabilité d'au moins deux succès, le contraire de ce qui est demandé.")] });
  }
  const j = e.evenement === "exactement" ? e.j : null;
  if (j !== null && m === "binomiale") {
    const pS = e.K / e.N;
    essais.push({ x: pS ** j * (1 - pS) ** (e.n - j), message: [t("Tu as calculé la probabilité d'un seul ordre de tirage ; les "), l(`C_{${e.n}}^{${j}}`), t(" ordres possibles ont tous cette probabilité : multiplie.")] });
  }
  if (j !== null && m === "hypergeometrique") {
    essais.push({ x: (C(e.K, j) * C(e.N - e.K, e.n - j)) / C(e.N, j), message: [t("Le dénominateur compte tous les tirages possibles de "), l(`${e.n}`), t(" éléments parmi "), l(`${e.N}`), t(" : c'est "), l(`C_{${e.N}}^{${e.n}}`), t(".")] });
    essais.push({ x: C(e.K, j) / C(e.N, e.n), message: [t("Il faut aussi choisir les "), l(`${e.n - j}`), t(" autres éléments parmi les "), l(`${e.N - e.K}`), t(" qui ne sont pas des succès : multiplie par "), l(`C_{${e.N - e.K}}^{${e.n - j}}`), t(".")] });
  }
  for (const x of essais) if (Math.abs(x.x - juste) > 1e-9 && designe(v, x.x)) return x.message;
  const lu = lire(v)!;
  if (lu < 0 || lu > 1) return [t("Une probabilité est toujours comprise entre 0 et 1.")];
  return null;
}
