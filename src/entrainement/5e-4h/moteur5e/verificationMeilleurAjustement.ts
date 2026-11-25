import type { ExerciceMeilleurAjustement } from "../core5e/meilleurAjustement";
import { droiteSans, previsionSans, resumeSans, resumeTous, sommes } from "../core5e/meilleurAjustement";
import { resume, somme } from "../core5e/statistiqueLotH2";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseMeilleur } from "../ui5e/formatMeilleurAjustement";
import { bonneRepere, bonneVerdict, contexteAberrant, ecartAttendu } from "../ui5e/formatMeilleurAjustement";
import { messageTropArrondi, precisionTexte } from "../ui5e/nombresStatLotH2";
import { lireValeur, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen79`. Écart et G : valeurs exactes (fraction ou décimal) ; S₁, S₂ : exactes
 * (deuxDroites) ou au centième (mayerMoindres), une valeur plus précise est acceptée ; r : au millième ;
 * a, b : demi-unité de la précision demandée ; prévision : tolérance propagée (a, b arrondis ou
 * non). Saisie trop arrondie : message sans tentative. Choix fermés comparés à leur identifiant.
 */

type E = ExerciceMeilleurAjustement;
const EXACT = 1e-6;
const tolS = (e: E) => (e.variante === "mayerMoindres" ? 0.005 + 1e-9 : EXACT);
const TOL_R = 0.0005 + 1e-9;

export function tolPrevisionSans(e: E): number {
  const ca = contexteAberrant(e);
  const d = droiteSans(e);
  const y0 = previsionSans(e);
  let m = 0;
  for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) m = Math.max(m, Math.abs((d.a + u * 0.5 * 10 ** -ca.da) * e.x0 + d.b + v * 0.5 * 10 ** -ca.db - y0));
  return m + 0.5 * 10 ** -ca.dp + 1e-9;
}

const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");

export function diagnostiquer(e: E, p: PhaseMeilleur, v: string[]): StatutVerification[] {
  const [s1, s2] = sommes(e);
  switch (p) {
    case "ecart":
      return [statutProche(v[0] ?? "", ecartAttendu(e), EXACT)];
    case "pointMoyen": {
      const s = resume(e.points);
      return [statutProche(v[0] ?? "", s.mx, EXACT), statutProche(v[1] ?? "", s.my, EXACT)];
    }
    case "somme1":
      return [statutProche(v[0] ?? "", s1, tolS(e))];
    case "somme2":
      return [statutProche(v[0] ?? "", s2, tolS(e))];
    case "verdict":
      return [st(v[0] === bonneVerdict(e))];
    case "repere":
      return [st(v[0] === bonneRepere(e))];
    case "correlations":
      return [statutProche(v[0] ?? "", resumeTous(e).r, TOL_R), statutProche(v[1] ?? "", resumeSans(e).r, TOL_R)];
    case "droite": {
      const ca = contexteAberrant(e);
      const d = droiteSans(e);
      return [statutProche(v[0] ?? "", d.a, 0.5 * 10 ** -ca.da + 1e-9), statutProche(v[1] ?? "", d.b, 0.5 * 10 ** -ca.db + 1e-9)];
    }
    case "prevision":
      return [statutProche(v[0] ?? "", previsionSans(e), tolPrevisionSans(e))];
  }
}

export function approchee(e: E, p: PhaseMeilleur, v: string[]): string | null {
  const [s1, s2] = sommes(e);
  switch (p) {
    case "somme1":
    case "somme2":
      return e.variante === "mayerMoindres" ? messageTropArrondi(v[0] ?? "", p === "somme1" ? s1 : s2, 2, tolS(e), "au centième") : null;
    case "correlations":
      return messageTropArrondi(v[0] ?? "", resumeTous(e).r, 3, TOL_R, "au millième") ?? messageTropArrondi(v[1] ?? "", resumeSans(e).r, 3, TOL_R, "au millième");
    case "droite": {
      const ca = contexteAberrant(e);
      const d = droiteSans(e);
      return messageTropArrondi(v[0] ?? "", d.a, ca.da, 0.5 * 10 ** -ca.da + 1e-9, `${precisionTexte(ca.da)} (a)`) ?? messageTropArrondi(v[1] ?? "", d.b, ca.db, 0.5 * 10 ** -ca.db + 1e-9, `${precisionTexte(ca.db)} (b)`);
    }
    case "prevision":
      return messageTropArrondi(v[0] ?? "", previsionSans(e), contexteAberrant(e).dp, tolPrevisionSans(e), precisionTexte(contexteAberrant(e).dp));
    default:
      return null;
  }
}

export function piege(e: E, p: PhaseMeilleur, v: string[]): Frag[] | null {
  if (p !== "verdict" && p !== "repere" && diagnostiquer(e, p, v).every((s) => s === "correct")) return null;
  const [s1, s2] = sommes(e);
  switch (p) {
    case "ecart":
      if (valeurProche(v[0] ?? "", -ecartAttendu(e), EXACT)) return [tx("Attention au signe : on calcule l'ordonnée du point moins celle de la droite, "), lx("y-(ax+b)"), tx(".")];
      return null;
    case "somme1":
    case "somme2": {
      const d = e.droites[p === "somme1" ? 0 : 1];
      const ec = e.points.map((q) => q.y - (d.a * q.x + d.b));
      const tol = Math.max(tolS(e), 0.005);
      if (valeurProche(v[0] ?? "", somme(ec), tol)) return [tx("Tu as additionné les écarts sans les élever au carré : les écarts positifs et négatifs se compensent.")];
      if (valeurProche(v[0] ?? "", somme(ec.map(Math.abs)), tol)) return [tx("Élève chaque écart au carré avant d'additionner (somme des carrés des écarts).")];
      if (valeurProche(v[0] ?? "", p === "somme1" ? s2 : s1, tol)) return [tx("C'est la somme pour l'autre droite.")];
      return null;
    }
    case "pointMoyen": {
      const xs = [...e.points.map((q) => q.x)].sort((a, b) => a - b);
      const ys = [...e.points.map((q) => q.y)].sort((a, b) => a - b);
      if (valeurProche(v[0] ?? "", (xs[2]! + xs[3]!) / 2, EXACT) && Math.abs((xs[2]! + xs[3]!) / 2 - resume(e.points).mx) > 1e-6) return [tx("C'est la médiane des x : le point moyen utilise la moyenne.")];
      if (valeurProche(v[1] ?? "", (ys[2]! + ys[3]!) / 2, EXACT) && Math.abs((ys[2]! + ys[3]!) / 2 - resume(e.points).my) > 1e-6) return [tx("C'est la médiane des y : le point moyen utilise la moyenne.")];
      return null;
    }
    case "correlations": {
      const rt = resumeTous(e).r;
      const rs = resumeSans(e).r;
      if (valeurProche(v[0] ?? "", rs, TOL_R) && valeurProche(v[1] ?? "", rt, TOL_R)) return [tx("Les deux valeurs sont échangées : sans le point aberrant, les points sont mieux alignés, donc |r| est plus proche de 1.")];
      if (valeurProche(v[0] ?? "", rt * rt, TOL_R) || valeurProche(v[1] ?? "", rs * rs, TOL_R)) return [tx("C'est "), lx("R^2=r^2"), tx(" : r est sa racine carrée, avec le signe de a.")];
      return null;
    }
    case "droite": {
      const t = resumeTous(e);
      const ca = contexteAberrant(e);
      if (valeurProche(v[0] ?? "", t.a, 0.5 * 10 ** -ca.da + 1e-9)) return [tx("C'est la droite calculée avec les huit points : retire le point aberrant des deux listes.")];
      return null;
    }
    case "prevision": {
      const x = lireValeur(v[0] ?? "");
      if (x === null) return null;
      const t = resumeTous(e);
      if (Math.abs(x - (t.a * e.x0 + t.b)) < tolPrevisionSans(e) + 0.5 * 10 ** -contexteAberrant(e).dp) return [tx("Tu as utilisé la droite calculée avec le point aberrant : prends celle des sept autres points.")];
      return null;
    }
    default:
      return null;
  }
}
