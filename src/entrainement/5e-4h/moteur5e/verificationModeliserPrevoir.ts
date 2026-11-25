import type { ExerciceModeliserPrevoir } from "../core5e/modeliserPrevoir";
import { abscisseSeuil, prevision } from "../core5e/modeliserPrevoir";
import { regressionXenY } from "../core5e/statistiqueLotH2";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseModeliser } from "../ui5e/formatModeliserPrevoir";
import { bonneFiabilite, bonneNature, penteMayer } from "../ui5e/formatModeliserPrevoir";
import { messageTropArrondi, precisionTexte } from "../ui5e/nombresStatLotH2";
import { lireValeur, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen78`. a, b, r : demi-unité de la précision demandée (une valeur plus précise
 * est acceptée) ; prévision et seuil : tolérance PROPAGÉE (a et b arrondis à la précision demandée
 * ou non arrondis) plus la demi-unité de l'arrondi demandé. Saisie trop arrondie : message, aucune
 * tentative (`approchee`). Choix fermés comparés à leur identifiant.
 */

type E = ExerciceModeliserPrevoir;

export const tolA = (e: E) => 0.5 * 10 ** -e.da + 1e-9;
export const tolB = (e: E) => 0.5 * 10 ** -e.db + 1e-9;
export const TOL_R = 0.0005 + 1e-9;

function coins(e: E): [number, number][] {
  const da = 0.5 * 10 ** -e.da;
  const db = 0.5 * 10 ** -e.db;
  const t: [number, number][] = [];
  for (const u of [-da, 0, da]) for (const v of [-db, 0, db]) t.push([e.stats.a + u, e.stats.b + v]);
  return t;
}

export function tolPrevision(e: E): number {
  const y0 = prevision(e);
  return Math.max(...coins(e).map(([a, b]) => Math.abs(a * e.x0 + b - y0))) + 0.5 * 10 ** -e.dp + 1e-9;
}

export function tolSeuil(e: E): number {
  const xs = abscisseSeuil(e);
  return Math.max(...coins(e).map(([a, b]) => Math.abs((e.seuil - b) / a - xs))) + 0.5 * 10 ** -e.ds + 1e-9;
}

export function diagnostiquer(e: E, p: PhaseModeliser, v: string[]): StatutVerification[] {
  switch (p) {
    case "equation":
      return [statutProche(v[0] ?? "", e.stats.a, tolA(e)), statutProche(v[1] ?? "", e.stats.b, tolB(e))];
    case "correlation":
      return [statutProche(v[0] ?? "", e.stats.r, TOL_R)];
    case "fiabilite":
      return [v[0] === bonneFiabilite(e) ? "correct" : "not_equivalent"];
    case "prevision":
      return [statutProche(v[0] ?? "", prevision(e), tolPrevision(e))];
    case "nature":
      return [v[0] === bonneNature(e) ? "correct" : "not_equivalent"];
    case "seuil":
      return [statutProche(v[0] ?? "", abscisseSeuil(e), tolSeuil(e))];
  }
}

export function approchee(e: E, p: PhaseModeliser, v: string[]): string | null {
  switch (p) {
    case "equation":
      return messageTropArrondi(v[0] ?? "", e.stats.a, e.da, tolA(e), `${precisionTexte(e.da)} (a)`) ?? messageTropArrondi(v[1] ?? "", e.stats.b, e.db, tolB(e), `${precisionTexte(e.db)} (b)`);
    case "correlation":
      return messageTropArrondi(v[0] ?? "", e.stats.r, 3, TOL_R, "au millième");
    case "prevision":
      return messageTropArrondi(v[0] ?? "", prevision(e), e.dp, tolPrevision(e), precisionTexte(e.dp));
    case "seuil":
      return messageTropArrondi(v[0] ?? "", abscisseSeuil(e), e.ds, tolSeuil(e), precisionTexte(e.ds));
    default:
      return null;
  }
}

export function piege(e: E, p: PhaseModeliser, v: string[]): Frag[] | null {
  // Jamais de message ciblé sur une réponse juste.
  if (p !== "fiabilite" && p !== "nature" && diagnostiquer(e, p, v).every((x) => x === "correct")) return null;
  const s = e.stats;
  switch (p) {
    case "equation": {
      const ok = diagnostiquer(e, p, v);
      if (ok.every((x) => x === "correct")) return null;
      if (valeurProche(v[0] ?? "", s.b, tolB(e)) && valeurProche(v[1] ?? "", s.a, tolA(e))) return [tx("Tu as échangé a et b : a est le coefficient de x (la pente), b l'ordonnée à l'origine.")];
      const inv = regressionXenY(e.points);
      if (valeurProche(v[0] ?? "", inv.a, 0.5 * 10 ** -e.da + 1e-9) && Math.abs(inv.a - s.a) > 2 * tolA(e)) return [tx("Tu as sans doute échangé les listes : les x (première ligne du tableau) vont dans L1, les y dans L2.")];
      const m = penteMayer(e);
      if (valeurProche(v[0] ?? "", m, 0.5 * 10 ** -e.da + 1e-9) && Math.abs(m - s.a) > 2 * tolA(e)) return [tx("C'est la pente de la droite de Mayer : on demande ici la droite des moindres carrés, donnée par la calculatrice.")];
      if (valeurProche(v[0] ?? "", -s.a, tolA(e))) return [tx(`Vérifie le signe de a : le nuage ${s.a < 0 ? "descend" : "monte"}.`)];
      return null;
    }
    case "correlation": {
      if (valeurProche(v[0] ?? "", s.r * s.r, TOL_R)) return [tx("C'est "), lx("R^2=r^2"), tx(" (coefficient de détermination) : "), lx("r=\\pm\\sqrt{R^2}"), tx(", avec le signe de a.")];
      if (s.r < 0 && valeurProche(v[0] ?? "", -s.r, TOL_R)) return [tx("r a le même signe que a : ici, il est négatif.")];
      return null;
    }
    case "prevision": {
      const x = lireValeur(v[0] ?? "");
      if (x === null) return null;
      if (Math.abs(x - (e.x0 - s.b) / s.a) < tolSeuil(e) + 0.5) return [tx("On connaît x et on cherche y : remplace x par "), lx(`${e.x0}`.replace(".", "{,}")), tx(" dans l'équation (ne résous pas d'équation).")];
      return null;
    }
    case "seuil": {
      const x = lireValeur(v[0] ?? "");
      if (x === null) return null;
      if (Math.abs(x - (s.a * e.seuil + s.b)) < tolPrevision(e) + 0.05 * Math.abs(s.a * e.seuil + s.b)) return [tx("On connaît y et on cherche x : il faut résoudre "), lx("ax+b=\\text{seuil}"), tx(", pas remplacer x par le seuil.")];
      if (e.variante === "dilatation") {
        const L = e.longueurSeuil ?? 10;
        for (const mauvais of [L, L - 10, (L - 10) * 100])
          if (Math.abs(x - (mauvais - s.b) / s.a) < 0.6) return [tx("Convertis d'abord : l'allongement est la longueur moins 10 m, et le modèle l'exprime en millimètres.")];
      }
      return null;
    }
    default:
      return null;
  }
}
