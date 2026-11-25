import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceCM, ModeleCM, PhaseCM } from "../core6e/choisirModele";
import { lambda, parametres, probaAutreModele, raisonJuste, refsProba } from "../core6e/choisirModele";
import { lireValeurVA } from "./lectureVariablesAleatoires";
import { piegeDesigne, proche, statutValeur, tropArrondie } from "./verificationLoisLotH2";
import { nL } from "../ui6e/textesLoisLotH2";

/**
 * Vérification de `6gen119`. Modèle et raison : identifiants (choix fermés, une tentative), message
 * ciblé sur la confusion commise (avec / sans remise, nombre d'épreuves fixé ou comptage sur une durée,
 * cloche ou valeurs également possibles…). Paramètres : exacts (σ, μ entiers ; p en fraction ou en
 * décimal ; λ ajusté). Probabilité : valeur exacte (fraction, « e^(-2)·2^3/6 ») ou au moins quatre
 * décimales à 0,00005 près ; loi normale : table ou valeur exacte, à 0,0001 près. Saisie illisible ou
 * trop arrondie : message, aucune tentative.
 */

type E = ExerciceCM;
type P = PhaseCM;
const t = tx;
const l = lx;

export function messageIllisible(_e: E, p: P): string {
  return p === "parametres"
    ? "Valeur non reconnue : écris un nombre, par exemple 12, 0,25 ou 1/4. Cette saisie ne compte pas comme une tentative."
    : "Probabilité non reconnue : écris une fraction (3/8), un décimal à quatre décimales (0,3087) ou un calcul (e^(-2)·2^3/6). Cette saisie ne compte pas comme une tentative.";
}

const tolProba = (e: E) => (e.variante === "normale" ? 0.0001 : 0.00005);

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "modele") return [valeurs[0] === e.variante ? "correct" : "not_equivalent"];
  if (p === "raison") return [valeurs[0] === raisonJuste(e) ? "correct" : "not_equivalent"];
  if (p === "parametres") return parametres(e).map((x, i) => statutValeur(valeurs[i] ?? "", [x], { tol: 1e-9 }));
  return [statutValeur(valeurs[0] ?? "", refsProba(e), { tol: tolProba(e) })];
}

export function approchee(e: E, p: P, valeurs: string[]): string | null {
  if (p !== "proba") return null;
  return tropArrondie(valeurs[0] ?? "", refsProba(e), { tol: tolProba(e), decMin: 4, ecart: 0.01, message: "Valeur trop arrondie : donne la valeur exacte ou quatre décimales. Cette saisie ne compte pas comme une tentative." });
}

/** Pourquoi le modèle juste convient (message d'un choix faux). */
function pourquoi(e: E): Frag[] {
  const d = e.d;
  switch (e.variante) {
    case "binomiale":
      return [t("Le nombre d'épreuves est fixé ("), l(`n=${d.n}`), t("), elles sont identiques et indépendantes, et "), l("X"), t(" compte les succès : loi binomiale.")];
    case "hypergeometrique":
      return [t("Les éléments sont tirés sans remise (ou ensemble) dans une population qui contient "), l(`${d.K}`), t(" succès : loi hypergéométrique.")];
    case "poisson":
      return [t("On compte des événements qui arrivent au hasard, connus par une moyenne, sans nombre d'épreuves fixé : loi de Poisson.")];
    case "normale":
      return [l("X"), t(" est une mesure continue répartie en cloche autour de sa moyenne : loi normale.")];
    case "uniforme":
      return [l("X"), t(" est une mesure continue dont toutes les valeurs d'un intervalle sont également possibles : loi uniforme.")];
    case "aucune":
      return e.ctx === 1 ? [l("X"), t(" est une somme de deux résultats : ce n'est pas un nombre de succès, ses valeurs ne sont pas également probables.")] : [t("Le nombre d'épreuves n'est pas fixé à l'avance : on s'arrête au premier succès. Aucune loi du cours ne convient.")];
  }
}

const CONFUSIONS: Partial<Record<`${ModeleCM}-${ModeleCM}`, string>> = {
  "hypergeometrique-binomiale": "Ici les tirages se font sans remise : la composition de la population change, les épreuves ne sont pas indépendantes.",
  "binomiale-hypergeometrique": "Ici rien n'est retiré : chaque épreuve se fait dans les mêmes conditions, avec la même probabilité de succès.",
  "poisson-binomiale": "Ici aucun nombre d'épreuves n'est fixé : on compte des événements sur une durée (ou des pages), à partir d'une moyenne.",
  "binomiale-poisson": "Ici le nombre d'épreuves est fixé et chaque épreuve a la même probabilité de succès.",
  "uniforme-normale": "Ici aucune valeur n'est plus probable qu'une autre : la densité est constante, ce n'est pas une cloche.",
  "normale-uniforme": "Ici les valeurs se concentrent autour de la moyenne (cloche) : elles ne sont pas toutes également probables.",
};

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "modele") {
    if (v === e.variante) return null;
    const c = CONFUSIONS[`${e.variante}-${v}` as `${ModeleCM}-${ModeleCM}`];
    return c ? [t(c)] : pourquoi(e);
  }
  if (p === "raison") return v === raisonJuste(e) ? null : pourquoi(e);
  if (p === "parametres") {
    const d = e.d;
    if (parametres(e).every((x, i) => proche(valeurs[i] ?? "", [x], { tol: 1e-9 }))) return null;
    if (e.variante === "poisson") {
      const lu = lireValeurVA(v);
      if (lu && Math.abs(lu.v - d.r!) < 1e-9 && Math.abs(d.r! - lambda(e)) > 1e-9) return [t("C'est le taux donné, pas encore ajusté à l'échelle de la question : "), l("\\lambda"), t(" se calcule par proportionnalité.")];
    }
    if (e.variante === "binomiale") {
      const lu = lireValeurVA(valeurs[1] ?? "");
      const pv = parametres(e)[1]!;
      if (lu && Math.abs(lu.v - (1 - pv)) < 1e-9 && Math.abs(pv - 0.5) > 1e-9) return [t("C'est la probabilité d'un échec ; "), l("p"), t(" est celle de l'issue comptée par "), l("X"), t(".")];
    }
    if (e.variante === "hypergeometrique") {
      const lu = lireValeurVA(valeurs[1] ?? "");
      if (lu && Math.abs(lu.v - (d.N! - d.K!)) < 1e-9) return [l("K"), t(" est le nombre de succès (les éléments comptés par "), l("X"), t(").")];
    }
    if (e.variante === "uniforme") {
      const [a, b] = parametres(e);
      const la = lireValeurVA(v);
      const lb = lireValeurVA(valeurs[1] ?? "");
      if (la && lb && Math.abs(la.v - b!) < 1e-9 && Math.abs(lb.v - a!) < 1e-9) return [t("Les bornes sont échangées : "), l("a"), t(" est la plus petite valeur, "), l("b"), t(" la plus grande.")];
    }
    return null;
  }
  const pieges: { x: number; message: Frag[] }[] = [];
  const autre = probaAutreModele(e);
  if (autre !== null) pieges.push({ x: autre, message: [t("C'est la probabilité pour des tirages avec remise (loi binomiale) ; ici les tirages se font sans remise.")] });
  if (e.variante === "poisson") {
    const d = e.d;
    const l0 = d.r!;
    const terme = (k: number) => (Math.exp(-l0) * l0 ** k) / [1, 1, 2, 6, 24][k]!;
    if (Math.abs(l0 - lambda(e)) > 1e-9) pieges.push({ x: d.q === 1 ? terme(0) + terme(1) : terme(d.k!), message: [t("Ce calcul utilise "), l(`\\lambda=${nL(l0)}`), t(", le taux non ajusté ; ici "), l("\\lambda"), t(" correspond à l'échelle de la question.")] });
  }
  return piegeDesigne(v, refsProba(e), pieges, { tol: tolProba(e) });
}
