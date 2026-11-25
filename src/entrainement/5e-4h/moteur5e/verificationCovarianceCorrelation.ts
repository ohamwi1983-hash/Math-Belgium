import type { ExerciceCorrelation } from "../core5e/covarianceCorrelation";
import { arrondi, decimales, sommesEcarts } from "../core5e/stat2vLotH1";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseCorrelation } from "../ui5e/formatCovarianceCorrelation";
import { bonneOption, covAvecArrondis, n, rAvecSigmasArrondis, sxEch, syEch } from "../ui5e/formatCovarianceCorrelation";
import type { StatutArrondi } from "./lectureStat2vLotH1";
import { nL } from "../ui5e/ecrituresStat2vLotH1";
import { lireNb, statutArrondi, vaut } from "./lectureStat2vLotH1";

/**
 * Vérification de `5gen38`. Champs : covariance exacte (`main`), σ au centième (forme exacte « √2 »
 * acceptée), r au centième (`main`, aussi avec σ arrondis) ou au millième (`calculatrice`), covariance
 * r·σx·σy au centième (aussi avec r et σ arrondis) ; « trop arrondie » sans tentative. Choix fermés (sens,
 * intensité) : une tentative, jugés ✗ / ✓. Messages ciblés : Sx au lieu de σx (division par n − 1),
 * variance au lieu de l'écart-type (racine oubliée), somme des produits non divisée par n, x̄·ȳ oublié,
 * r > 1, signe, intensité lue sans la valeur absolue ou à la mauvaise ligne du tableau. Jamais sur une
 * réponse juste.
 */

type E = ExerciceCorrelation;
const exact = (brut: string, v: number): StatutArrondi => statutArrondi(brut, v, decimales(v));
const estChoix = (p: PhaseCorrelation) => p === "sens" || p === "intensite";

function statuts(e: E, p: PhaseCorrelation, v: string[]): StatutArrondi[] {
  const v0 = v[0] ?? "";
  if (estChoix(p)) return [v0 === bonneOption(e, p) ? "correct" : "not_equivalent"];
  if (p === "covEcarts") return [exact(v0, e.cov)];
  if (p === "covProduits") return [exact(v0, e.moyProduits), exact(v[1] ?? "", e.cov)];
  if (p === "sigmas") return [statutArrondi(v0, e.sx, e.ds), statutArrondi(v[1] ?? "", e.sy, e.ds)];
  if (p === "r") return [statutArrondi(v0, e.r, e.dr, e.variante === "main" ? [rAvecSigmasArrondis(e)] : [])];
  return [statutArrondi(v0, e.cov, e.dc, [covAvecArrondis(e)])];
}

export function diagnostiquer(e: E, p: PhaseCorrelation, v: string[]): StatutVerification[] {
  return statuts(e, p, v).map((s) => (s === "trop" ? "not_equivalent" : s));
}

export function approchee(e: E, p: PhaseCorrelation, v: string[]): string | null {
  if (!statuts(e, p, v).includes("trop")) return null;
  if (p === "covEcarts" || p === "covProduits") return "Valeur arrondie : ici la covariance se calcule exactement, donne-la sans l'arrondir. Cette saisie ne compte pas comme une tentative.";
  return "Valeur trop arrondie : respecte la précision demandée dans la consigne. Cette saisie ne compte pas comme une tentative.";
}

const NOMS = { parfaite: 5, tresForte: 4, forte: 3, moyenne: 2, faible: 1, nulle: 0 } as const;

export function piege(e: E, p: PhaseCorrelation, v: string[]): Frag[] | null {
  const ok = diagnostiquer(e, p, v);
  if (ok.every((s) => s === "correct")) return null;
  const v0 = v[0] ?? "";
  const v1 = v[1] ?? "";
  const { sXY } = sommesEcarts(e.points);
  if (p === "covEcarts") {
    if (vaut(v0, sXY)) return [tx("C'est la somme des produits des écarts : la covariance en est la moyenne, divise par n.")];
    if (vaut(v0, sXY / (n(e) - 1))) return [tx(`La covariance divise par n = ${n(e)}, pas par n − 1.`)];
    return null;
  }
  if (p === "covProduits") {
    if (ok[1] !== "correct" && vaut(v1, e.moyProduits)) return [tx("Tu as oublié de retirer le produit des moyennes "), lx("\\bar{x}\\,\\bar{y}"), tx(".")];
    if (ok[0] !== "correct" && vaut(v0, e.moyProduits * n(e))) return [tx("C'est la somme des produits "), lx("x_iy_i"), tx(" : divise-la par n.")];
    return null;
  }
  if (p === "sigmas") {
    if ((ok[0] !== "correct" && vaut(v0, arrondi(sxEch(e), e.ds))) || (ok[1] !== "correct" && vaut(v1, arrondi(syEch(e), e.ds)))) return [tx("C'est "), lx("S_x"), tx(" (ou "), lx("S_y"), tx(") : division par n − 1. Le cours utilise "), lx("\\sigma_x"), tx(", division par n.")];
    if ((ok[0] !== "correct" && vaut(v0, arrondi(e.sx * e.sx, e.ds))) || (ok[1] !== "correct" && vaut(v1, arrondi(e.sy * e.sy, e.ds)))) return [tx("C'est la variance : l'écart-type en est la racine carrée.")];
    return null;
  }
  if (p === "r") {
    const lu = lireNb(v0);
    if (lu !== null && Math.abs(lu) > 1) return [tx("Un coefficient de corrélation est toujours compris entre −1 et 1 : il y a une erreur de calcul (racine oubliée, Sx au lieu de σx…).")];
    if (vaut(v0, arrondi(-e.r, e.dr))) return [tx("Le signe de r est celui de la covariance.")];
    if (vaut(v0, arrondi(e.cov / (sxEch(e) * syEch(e)), e.dr))) return [tx("Tu as utilisé "), lx("S_x"), tx(" et "), lx("S_y"), tx(" (division par n − 1) : avec "), lx("\\sigma_x"), tx(" et "), lx("\\sigma_y"), tx(", r change.")];
    return null;
  }
  if (p === "cov") {
    if (vaut(v0, arrondi(e.r * sxEch(e) * syEch(e), e.dc))) return [tx("Tu as utilisé "), lx("S_x"), tx(" et "), lx("S_y"), tx(" : la covariance du cours utilise "), lx("\\sigma_x"), tx(" et "), lx("\\sigma_y"), tx(".")];
    if (vaut(v0, arrondi(e.r / (e.sx * e.sy), e.dc))) return [tx("On multiplie r par "), lx("\\sigma_x\\,\\sigma_y"), tx(".")];
    return null;
  }
  if (p === "sens") return [tx(`La covariance est ${e.positif ? "positive" : "négative"} : x et y varient ${e.positif ? "dans le même sens" : "en sens contraire"}.`)];
  const choisi = NOMS[v0 as keyof typeof NOMS];
  if (choisi === undefined) return null;
  if (v0 === "parfaite") return [tx("« Parfaite » est réservé à "), lx("|r|=1"), tx(" (points exactement alignés).")];
  return choisi > NOMS[e.classe] ? [tx("Tu surestimes l'intensité : place "), lx(`|r|\\approx${nL(Math.abs(e.r), e.dr)}`), tx(" dans le tableau du cours.")] : [tx("Tu sous-estimes l'intensité : place "), lx(`|r|\\approx${nL(Math.abs(e.r), e.dr)}`), tx(" dans le tableau du cours (c'est la valeur absolue qui compte, pas le signe).")];
}
