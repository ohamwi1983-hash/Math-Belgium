import type { ExerciceModeleSaturation } from "../core6e/modeleSaturation";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseModeleSaturation } from "../ui6e/formatModeleSaturation";
import { lireValeur, statutProche } from "./lectureExpoLotG";

/**
 * Vérification de `6gen150` (statut à 3 valeurs). r exact (fraction, décimal exact) ou arrondi au
 * centième ; L, C entiers ; q au dix-millième (ou écriture exacte « (3/4)^(1/5) ») ; prévision et
 * instant au dixième, tolérance PROPAGÉE depuis q arrondi au dix-millième.
 */

type E = ExerciceModeleSaturation;
const rv = (e: E) => e.r.num / e.r.den;
export const TOL_Q = 0.00006;
export const tolPrevision = (e: E) => 0.05 + Math.abs(e.C * e.tPrev * Math.pow(e.q, e.tPrev - 1)) * TOL_Q + 1e-6;
export function tolSeuil(e: E): number {
  const u = (e.seuil - e.L) / e.C;
  return 0.05 + Math.abs(Math.log(u) / (e.q * Math.log(e.q) ** 2)) * TOL_Q + 1e-6;
}

export function diagnostiquer(e: E, phase: PhaseModeleSaturation, v: string[]): StatutVerification[] {
  switch (phase) {
    case "rapport":
      return [statutProche(v[0], rv(e), 0.0051)];
    case "limite":
      return [statutProche(v[0], e.L, 0.006), statutProche(v[1], e.C, 0.006)];
    case "q":
      return [statutProche(v[0], e.q, TOL_Q)];
    case "prevision":
      return [statutProche(v[0], e.prevision, tolPrevision(e))];
    case "seuil":
      return [statutProche(v[0], e.tSeuil, tolSeuil(e))];
  }
}

export function piege(e: E, phase: PhaseModeleSaturation, v: string[]): Frag[] | null {
  const [m0, m1, m2] = e.mesures;
  const x = lireValeur(v[0]);
  const p = (c: number, tol: number) => x !== null && Number.isFinite(c) && Math.abs(x - c) <= tol;
  switch (phase) {
    case "rapport":
      if (p(m1 / m0, 0.0051) || p(m2 / m1, 0.0051)) return [tx("Le modèle a une valeur limite L : fais le rapport des écarts successifs, pas des mesures.")];
      if (p(1 / rv(e), 0.0051)) return [tx("Rapport à l'envers : l'écart le plus récent au numérateur.")];
      if (p(m2 - m1, 1e-6) || p(m1 - m0, 1e-6)) return [tx("C'est un écart ; le modèle se reconnaît au rapport de deux écarts.")];
      return null;
    case "limite": {
      const L = x;
      const C = lireValeur(v[1]);
      if (L !== null && Math.abs(L - m2) < 1e-6) return [tx("La dernière mesure n'est pas la valeur limite : la grandeur continue de se rapprocher de L.")];
      if (L !== null && Math.abs(L - e.L) < 0.006 && C !== null && Math.abs(C - m0) < 1e-6) return [lx("C"), tx(" est l'écart initial à la limite : "), lx(`C=${e.variante === "plafonnement" ? "N" : "T"}(0)-L`), tx(".")];
      if (L !== null && Math.abs(L - e.L) < 0.006 && C !== null && Math.abs(C + e.C) < 1e-6) return [tx("Signe de "), lx("C"), tx(e.C < 0 ? " : la grandeur augmente vers L, la mesure initiale est sous L." : " : la grandeur diminue vers L, la mesure initiale est au-dessus de L.")];
      return null;
    }
    case "q":
      if (p(rv(e), 0.0051)) return [tx("r est le facteur sur "), lx(`${e.d}`), tx(" unités de temps : "), lx(`q^{${e.d}}=r`), tx(", donc q est la racine de r, pas r.")];
      if (p(rv(e) / e.d, 0.0006)) return [tx("Racine, pas division : "), lx(`q=r^{\\frac{1}{${e.d}}}`), tx(".")];
      if (p(Math.pow(rv(e), e.d), 0.0006)) return [tx("Exposant inversé : "), lx(`q=r^{\\frac{1}{${e.d}}}`), tx(", pas "), lx(`r^{${e.d}}`), tx(".")];
      return null;
    case "prevision":
      if (p(e.C * Math.pow(e.q, e.tPrev), 0.06)) return [tx("Il manque la valeur limite L dans le modèle.")];
      if (p(e.L + e.C * Math.pow(rv(e), e.tPrev), 0.06)) return [tx("Le facteur par unité de temps est q, pas r (qui porte sur "), lx(`${e.d}`), tx(" unités).")];
      return null;
    case "seuil": {
      if (x !== null && x < 0) return [tx("Un instant futur est positif : vérifie le quotient "), lx("\\dfrac{S-L}{C}"), tx(" (signes).")];
      const u2 = e.seuil / e.C;
      if (u2 > 0 && p(Math.log(u2) / Math.log(e.q), 0.06)) return [tx("Retire d'abord L : "), lx("q^{t}=\\dfrac{S-L}{C}"), tx(".")];
      if (p(Math.log((e.seuil - e.L) / e.C) / Math.log(rv(e)), 0.06)) return [tx("Avec r, on compte en paquets de "), lx(`${e.d}`), tx(" : multiplie par "), lx(`${e.d}`), tx(", ou utilise q.")];
      return null;
    }
  }
}
