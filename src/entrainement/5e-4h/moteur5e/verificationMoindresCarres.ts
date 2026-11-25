import type { ExerciceMoindresCarres } from "../core5e/moindresCarres";
import { arrondi, decimales, egal, mayer, sommesEcarts } from "../core5e/stat2vLotH1";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseMoindresCarres } from "../ui5e/formatMoindresCarres";
import { prevX, prevXArrondie, prevY, prevYArrondie, sommeProduitsBruts } from "../ui5e/formatMoindresCarres";
import type { StatutArrondi } from "./lectureStat2vLotH1";
import { lireDroiteAffine, lireNb, statutArrondi, statutDroite, vaut } from "./lectureStat2vLotH1";

/**
 * Vérification de `5gen37`. `main` : valeurs EXACTES (une valeur arrondie est refusée sans tentative) ;
 * `calculatrice` : a et b à une demi-unité de la précision affichée, prévisions avec l'équation exacte OU
 * arrondie ; « trop arrondie » sans tentative. Messages ciblés : x̄ et ȳ échangés, Σ Yᵢ² au lieu de Σ Xᵢ²,
 * Σ xᵢyᵢ (non centrés) au lieu de Σ XᵢYᵢ, quotient renversé, b = x̄ − a·ȳ, a et b échangés (« y = bx + a »),
 * droite de Mayer donnée à la place, x et y échangés dans une prévision. Jamais sur une réponse juste.
 */

type E = ExerciceMoindresCarres;
const exact = (brut: string, v: number): StatutArrondi => statutArrondi(brut, v, decimales(v));

function statuts(e: E, p: PhaseMoindresCarres, v: string[]): StatutArrondi[] {
  const v0 = v[0] ?? "";
  if (p === "g") return [exact(v0, e.G.x), exact(v[1] ?? "", e.G.y)];
  if (p === "ecarts") return [exact(v0, e.sXY), exact(v[1] ?? "", e.sX2)];
  if (p === "pente") return [exact(v0, e.a)];
  if (p === "equation") return [exact(v0, e.b), statutDroite(v[1] ?? "", e.a, e.b, 10, 10)];
  if (p === "prevision") return [exact(v0, prevY(e))];
  if (p === "coefs") return [statutArrondi(v0, e.a, e.da), statutArrondi(v[1] ?? "", e.b, e.db)];
  if (p === "prevY") return [statutArrondi(v0, prevY(e), e.dp, [prevYArrondie(e)])];
  return [statutArrondi(v0, prevX(e), e.dpx, [prevXArrondie(e)])];
}

export function diagnostiquer(e: E, p: PhaseMoindresCarres, v: string[]): StatutVerification[] {
  return statuts(e, p, v).map((s) => (s === "trop" ? "not_equivalent" : s));
}

export function approchee(e: E, p: PhaseMoindresCarres, v: string[]): string | null {
  if (!statuts(e, p, v).includes("trop")) return null;
  if (e.variante === "main") return "Valeur arrondie : ici tout se calcule exactement, donne la valeur sans l'arrondir. Cette saisie ne compte pas comme une tentative.";
  return "Valeur trop arrondie : respecte la précision demandée dans la consigne. Cette saisie ne compte pas comme une tentative.";
}

export function piege(e: E, p: PhaseMoindresCarres, v: string[]): Frag[] | null {
  const ok = diagnostiquer(e, p, v);
  if (ok.every((s) => s === "correct")) return null;
  const v0 = v[0] ?? "";
  const v1 = v[1] ?? "";
  if (p === "g") {
    if (vaut(v0, e.G.y) && vaut(v1, e.G.x)) return [tx("Tu as échangé "), lx("\\bar{x}"), tx(" et "), lx("\\bar{y}"), tx(".")];
    return null;
  }
  if (p === "ecarts") {
    const { sY2 } = sommesEcarts(e.points);
    if (ok[1] !== "correct" && vaut(v1, sY2)) return [tx("C'est "), lx("\\sum Y_i^2"), tx(" : la formule de a utilise les carrés des écarts de x, "), lx("\\sum X_i^2"), tx(".")];
    if (ok[0] !== "correct" && vaut(v0, sommeProduitsBruts(e))) return [tx("C'est la somme des produits "), lx("x_iy_i"), tx(" : on multiplie les écarts à la moyenne, "), lx("X_iY_i=(x_i-\\bar{x})(y_i-\\bar{y})"), tx(".")];
    return null;
  }
  if (p === "pente") {
    if (vaut(v0, e.sX2 / e.sXY)) return [tx("Quotient renversé : "), lx("a=\\dfrac{\\sum X_iY_i}{\\sum X_i^2}"), tx(".")];
    const { sY2 } = sommesEcarts(e.points);
    if (vaut(v0, e.sXY / sY2)) return [tx("Le dénominateur est "), lx("\\sum X_i^2"), tx(" (écarts de x), pas "), lx("\\sum Y_i^2"), tx(".")];
    return null;
  }
  if (p === "equation") {
    if (ok[0] !== "correct" && vaut(v0, e.G.x - e.a * e.G.y)) return [tx("Tu as échangé "), lx("\\bar{x}"), tx(" et "), lx("\\bar{y}"), tx(" : "), lx("b=\\bar{y}-a\\,\\bar{x}"), tx(".")];
    if (ok[0] !== "correct" && vaut(v0, e.G.y + e.a * e.G.x)) return [tx("Signe : "), lx("b=\\bar{y}-a\\,\\bar{x}"), tx(".")];
    const d = lireDroiteAffine(v1);
    if (ok[1] !== "correct" && d && d.a !== null && egal(d.a, e.b) && egal(d.b!, e.a)) return [tx("Pente et ordonnée à l'origine sont échangées : dans "), lx("y=ax+b"), tx(", a multiplie x.")];
    return null;
  }
  if (p === "coefs") {
    if (vaut(v0, arrondi(e.b, e.db)) && vaut(v1, arrondi(e.a, e.da))) return [tx("a et b sont échangés : la calculatrice affiche la droite "), lx("y=ax+b"), tx(" (a est la pente, b l'ordonnée à l'origine).")];
    const m = mayer(e.points);
    const lu = lireNb(v0);
    if (lu !== null && Math.abs(lu - m.a) <= 0.5 * 10 ** -e.da + 1e-9 && !egal(arrondi(m.a, e.da), arrondi(e.a, e.da))) return [tx("C'est la pente de la droite de Mayer : on demande la droite des moindres carrés (a et b de « 2-Var Stats »).")];
    return null;
  }
  if (p === "prevision" || p === "prevY") {
    if (vaut(v0, arrondi((e.x0 - e.b) / e.a, e.dp))) return [tx("Ici x est donné : on calcule "), lx("y=ax+b"), tx(" (sans isoler x).")];
    return null;
  }
  if (vaut(v0, arrondi(e.a * e.y0! + e.b, e.dpx))) return [tx("Tu as remplacé x par l'ordonnée donnée : ici c'est y qui est connu, isole x dans "), lx("ax+b=y"), tx(".")];
  return null;
}
