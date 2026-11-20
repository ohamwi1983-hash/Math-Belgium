import type { ExercicePhiHorsExtremum } from "../core5e/phiHorsExtremum";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { qVal } from "../ui5e/nombresTrigo";
import type { PhasePhi } from "../ui5e/formatPhiHorsExtremum";
import { idChoixAttendu } from "../ui5e/formatPhiHorsExtremum";
import { angleProche, ecartModulo, lireValeur, statutAngle, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen54`. Tolérances : A, b, sin φ au centième près (±0,005, une valeur exacte ou
 * arrondie au centième passe) ; ω à ±0,005 (π/4 ou 0,79) ; candidats φ à ±0,01 et À 2π PRÈS
 * (décision de l'utilisateur), dans n'importe quel ordre ; premier maximum à ±0,006 (exact) ou
 * ±(0,006 + 0,0055/ω) quand φ a été arrondi au centième (erreur propagée par la division par ω).
 */

type E = ExercicePhiHorsExtremum;

export function toleranceTMax(e: E): number {
  return e.mode === "exact" ? 0.006 : 0.006 + 0.0055 / e.omega;
}

export function diagnostiquer(e: E, phase: PhasePhi, v: string[]): StatutVerification[] {
  switch (phase) {
    case "parametres":
      return [statutProche(v[0], e.A, 0.005), statutProche(v[1], e.b, 0.005), statutProche(v[2], e.omega, 0.005)];
    case "sinus":
      return [statutProche(v[0], qVal(e.m), 0.005)];
    case "candidats": {
      const a = lireValeur(v[0]);
      const b = lireValeur(v[1]);
      if (a === null || b === null) return [a === null ? "parse_error" : "correct", b === null ? "parse_error" : "correct"];
      const ok = (x: string, c: number) => angleProche(x, c, 0.01);
      if (ok(v[0], e.phi1) && ok(v[1], e.phi2)) return ["correct", "correct"];
      if (ok(v[0], e.phi2) && ok(v[1], e.phi1)) return ["correct", "correct"];
      // Statut par champ : juste si la valeur est l'un des candidats et différente de l'autre champ.
      const memes = Math.abs(ecartModulo(a, b, 2 * Math.PI)) < 0.01;
      const s0: StatutVerification = !memes && (ok(v[0], e.phi1) || ok(v[0], e.phi2)) ? "correct" : "not_equivalent";
      const s1: StatutVerification = !memes && (ok(v[1], e.phi1) || ok(v[1], e.phi2)) ? "correct" : "not_equivalent";
      return [s0, s1 === "correct" && s0 === "correct" ? "not_equivalent" : s1];
    }
    case "choix":
      return [v[0] === idChoixAttendu(e) ? "correct" : "not_equivalent"];
    case "maximum":
      return [statutProche(v[0], e.tMax, toleranceTMax(e))];
  }
}

const proche = (x: string, c: number, tol = 0.006) => valeurProche(x, c, tol);

export function piege(e: E, phase: PhasePhi, v: string[]): Frag[] | null {
  switch (phase) {
    case "parametres": {
      const msg: Frag[] = [];
      if (proche(v[0], e.max - e.min)) msg.push(tx("L'amplitude est la moitié de l'écart entre le maximum et le minimum. "));
      else if (proche(v[0], e.b) && Math.abs(e.A - e.b) > 0.01) msg.push(tx("Tu as inversé A et b : A est la demi-différence des extrêmes, b leur moyenne. "));
      if (!proche(v[1], e.b, 0.005)) {
        if (e.variante === "roue" && proche(v[1], e.r!)) msg.push(tx("Le décalage vertical b est la hauteur du centre (la moyenne du maximum et du minimum), pas le rayon. "));
        else if (proche(v[1], e.max + e.min)) msg.push(tx("b est la moyenne des extrêmes : divise leur somme par 2. "));
        else if (proche(v[1], e.A)) msg.push(tx("b est la moyenne du maximum et du minimum, pas leur demi-différence. "));
      }
      if (!proche(v[2], e.omega, 0.005)) {
        const T = qVal(e.T);
        if (proche(v[2], T / (2 * Math.PI), 0.005)) msg.push(tx("La pulsation est "), lx("\\omega=\\dfrac{2\\pi}{T}"), tx(", pas l'inverse. "));
        else if (proche(v[2], 1 / T, 0.005) || proche(v[2], 2 * Math.PI * T, 0.01) || proche(v[2], Math.PI / T, 0.005)) msg.push(tx("Relis la formule de la pulsation : "), lx("\\omega=\\dfrac{2\\pi}{T}"), tx(". "));
      }
      return msg.length ? msg : null;
    }
    case "sinus": {
      const m = qVal(e.m);
      if (proche(v[0], -m, 0.005)) return [tx("Vérifie le signe : on retranche "), lx("b"), tx(" à la valeur de départ, puis on divise par "), lx("A"), tx(".")];
      if (proche(v[0], e.y0 / e.A, 0.005)) return [tx("Retranche d'abord le décalage vertical "), lx("b"), tx(" avant de diviser par "), lx("A"), tx(".")];
      if (proche(v[0], e.y0 - e.b, 0.005)) return [tx("Il reste à diviser par l'amplitude "), lx("A"), tx(".")];
      if (Math.abs(lireValeur(v[0]) ?? 0) > 1) return [tx("Un sinus est toujours compris entre "), lx("-1"), tx(" et "), lx("1"), tx(".")];
      return null;
    }
    case "candidats": {
      const a = lireValeur(v[0]);
      const b = lireValeur(v[1]);
      if (a === null || b === null) return null;
      const deg = (x: number) => Math.abs(x) > Math.PI + 0.01 && (Math.abs(x - (e.phi1 * 180) / Math.PI) < 0.6 || Math.abs(x - (e.phi2 * 180) / Math.PI) < 0.6 || Math.abs(x - ((e.phi2 + 2 * Math.PI) * 180) / Math.PI) < 0.6);
      if (deg(a) || deg(b)) return [tx("Les angles s'écrivent en radians (avec "), lx("\\pi"), tx(" ou en décimal), pas en degrés.")];
      if (Math.abs(ecartModulo(a, b, 2 * Math.PI)) < 0.01) return [tx("Il faut deux angles différents : hors d'un extremum, deux angles de "), lx("]-\\pi\\,;\\pi]"), tx(" ont le même sinus.")];
      if (angleProche(v[0], -e.phi1, 0.01) || angleProche(v[1], -e.phi1, 0.01)) return [lx("-\\arcsin m"), tx(" n'a pas le même sinus (c'est le cosinus qui serait le même) ; le second angle est "), lx("\\pi-\\arcsin m"), tx(".")];
      if (angleProche(v[0], Math.PI + e.phi1, 0.01) || angleProche(v[1], Math.PI + e.phi1, 0.01)) return [lx("\\pi+\\arcsin m"), tx(" a un sinus opposé ; le second angle est "), lx("\\pi-\\arcsin m"), tx(".")];
      return null;
    }
    case "choix":
      return null;
    case "maximum": {
      const t = lireValeur(v[0]);
      if (t === null) return null;
      const T = qVal(e.T);
      const tol = toleranceTMax(e) + 0.01;
      if (Math.abs(t - (e.tMax - T)) < tol || t <= 0) return [tx("Le premier maximum doit arriver après "), lx("t=0"), tx(" : ajoute une période "), lx("T"), tx(".")];
      const autre = e.phi === e.phi1 ? e.phi2 : e.phi1;
      let x = Math.PI / 2 - autre;
      while (x <= 1e-9) x += 2 * Math.PI;
      if (Math.abs(t - x / e.omega) < tol) return [tx("C'est le premier maximum obtenu avec l'autre candidat ; reprends le "), lx("\\varphi"), tx(" retenu.")];
      let y = Math.PI / 2 + e.phi;
      while (y <= 1e-9) y += 2 * Math.PI;
      if (Math.abs(t - y / e.omega) < tol) return [tx("Isole "), lx("\\omega t"), tx(" : "), lx("\\omega t=\\dfrac{\\pi}{2}-\\varphi+2k\\pi"), tx(".")];
      let z = -Math.PI / 2 - e.phi;
      while (z <= 1e-9) z += 2 * Math.PI;
      if (Math.abs(t - z / e.omega) < tol) return [tx("Cet instant est celui du minimum : au maximum, le sinus vaut 1 (argument "), lx("\\dfrac{\\pi}{2}"), tx("), pas "), lx("-1"), tx(".")];
      return null;
    }
  }
}

export { statutAngle };
