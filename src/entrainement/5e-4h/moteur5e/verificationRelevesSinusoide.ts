import type { ExerciceRelevesSinusoide } from "../core5e/relevesSinusoide";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseReleves } from "../ui5e/formatRelevesSinusoide";
import { angleProche, lireValeur, statutAngle, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen57`. Extrêmes à la demi-unité du tableau ; A, b à ±0,006 ; ω à 0,1 % près
 * (2π/T exact ou arrondi à quatre décimales) ; φ à 2π près, à ±(0,01 + 0,0002·t_max) (erreur d'un ω
 * arrondi multipliée par t_max) ; prévision et durée : tolérance PROPAGÉE (φ arrondi au centième,
 * ω à 0,05 % près) plus la demi-unité de l'arrondi demandé.
 */

type E = ExerciceRelevesSinusoide;

export const tolPhi = (e: E) => 0.01 + 0.0002 * e.tMax;

export function tolPrevision(e: E): number {
  const f = (phi: number, w: number) => e.A * Math.sin(w * e.tPrev + phi) + e.b;
  let ecart = 0;
  for (const dp of [-0.006, 0.006]) for (const dw of [-0.0005, 0.0005]) ecart = Math.max(ecart, Math.abs(f(e.phi + dp, e.omega * (1 + dw)) - e.prevision));
  const demi = e.variante === "temperature" ? 0.05 : 0.005;
  return demi + ecart + 1e-6;
}

export function tolDuree(e: E): number {
  const demi = 0.5 * 10 ** -e.decimalesDuree;
  return demi + e.duree * 0.0006 + 1e-6;
}

export function diagnostiquer(e: E, phase: PhaseReleves, v: string[]): StatutVerification[] {
  const demi = 0.5 * 10 ** -e.decimales + 1e-9;
  switch (phase) {
    case "lecture":
      return [statutProche(v[0], e.max, demi), statutProche(v[1], e.min, demi), statutProche(v[2], e.T, e.variante === "jour" ? 0.5 : 0.01)];
    case "parametres":
      return [statutProche(v[0], e.A, 0.006), statutProche(v[1], e.b, 0.006), statutProche(v[2], e.omega, 0.001 * e.omega + 1e-6)];
    case "phase":
      return [statutAngle(v[0], e.phi, tolPhi(e))];
    case "prevision":
      return [statutProche(v[0], e.prevision, tolPrevision(e))];
    case "duree":
      return [statutProche(v[0], e.duree, tolDuree(e))];
  }
}

export function piege(e: E, phase: PhaseReleves, v: string[]): Frag[] | null {
  const p = (s: string, c: number, t: number) => valeurProche(s, c, t);
  switch (phase) {
    case "lecture":
      if (p(v[2], e.T / 2, 0.01)) return [tx(`C'est une demi-période : la période sépare deux maximums${e.variante === "maree" ? " (deux pleines mers)" : ""}, pas un maximum et un minimum.`)];
      if (p(v[0], e.min, 0.001) && p(v[1], e.max, 0.001)) return [tx("Tu as inversé le maximum et le minimum.")];
      return null;
    case "parametres": {
      const msg: Frag[] = [];
      if (p(v[0], e.max - e.min, 0.006)) msg.push(tx("L'amplitude est la moitié de l'écart entre le maximum et le minimum. "));
      if (p(v[1], (e.max - e.min) / 2, 0.006) && Math.abs(e.A - e.b) > 0.01) msg.push(tx("b est la moyenne du maximum et du minimum. "));
      if (p(v[2], e.T / (2 * Math.PI), 0.001)) msg.push(tx("La pulsation est "), lx("\\omega=\\dfrac{2\\pi}{T}"), tx(", pas l'inverse. "));
      else if (p(v[2], 360 / e.T, 0.01)) msg.push(tx("La pulsation s'exprime en radians : "), lx("\\omega=\\dfrac{2\\pi}{T}"), tx(". "));
      return msg.length ? msg : null;
    }
    case "phase": {
      const tol = tolPhi(e);
      if (angleProche(v[0], -e.phi, tol)) return [tx("Vérifie le signe : "), lx("\\varphi=\\dfrac{\\pi}{2}-\\omega\\, t_{\\max}"), tx(".")];
      if (angleProche(v[0], -e.omega * e.tMax, tol)) return [tx("Au maximum, l'argument vaut "), lx("\\dfrac{\\pi}{2}"), tx(", pas 0.")];
      if (angleProche(v[0], Math.PI / 2 - e.tMax, tol)) return [tx("Multiplie "), lx("t_{\\max}"), tx(" par la pulsation "), lx("\\omega"), tx(".")];
      return null;
    }
    case "prevision": {
      const x = lireValeur(v[0]);
      if (x === null) return null;
      const deg = e.A * Math.sin(((e.omega * e.tPrev + e.phi) * Math.PI) / 180) + e.b;
      if (Math.abs(x - deg) < 0.02 && Math.abs(deg - e.prevision) > 0.05) return [tx("Ta calculatrice est en mode degré : l'argument est en radians.")];
      if (x > e.max + 0.01 || x < e.min - 0.01) return [tx("Une valeur du modèle reste toujours entre le minimum et le maximum.")];
      return null;
    }
    case "duree": {
      const x = lireValeur(v[0]);
      if (x === null) return null;
      const tol = tolDuree(e) + 0.01;
      if (Math.abs(x - (e.T - e.duree)) < tol) return [tx("C'est la durée sous le seuil : pour être au-dessus du seuil, garde l'arc du haut, de "), lx("\\arcsin m"), tx(" à "), lx("\\pi-\\arcsin m"), tx(".")];
      if (Math.abs(x - e.duree / 2) < tol) return [tx("L'arc va de "), lx("\\arcsin m"), tx(" à "), lx("\\pi-\\arcsin m"), tx(" : sa longueur est "), lx("\\pi-2\\arcsin m"), tx(".")];
      if (Math.abs(x - e.duree * e.omega) < tol) return [tx("C'est la longueur de l'arc en "), lx("u"), tx(" : divise-la par "), lx("\\omega"), tx(" pour obtenir une durée.")];
      return null;
    }
  }
}
