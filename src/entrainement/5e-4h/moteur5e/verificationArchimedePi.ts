import type { ExerciceArchimedePi } from "../core5e/archimedePi";
import { largeurDe } from "../core5e/archimedePi";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseArchimede } from "../ui5e/formatArchimedePi";
import { lireValeur, statutProche, valeurProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen56`. α en degrés (180/n, ±0,01) ou en radians (π/n, « π/6 », « 30° ») ;
 * côtés au centième (±0,0051) ; bornes de π au millième (±0,0011 : arrondi ordinaire, par défaut
 * ou par excès) ; nombre de côtés exact.
 */

type E = ExerciceArchimedePi;
const RAD = Math.PI / 180;
const TOL_COTE = 0.0051;
const TOL_PI = 0.0011;

export function diagnostiquer(e: E, phase: PhaseArchimede, v: string[]): StatutVerification[] {
  switch (phase) {
    case "angle": {
      const x = lireValeur(v[0]);
      if (x === null) return ["parse_error"];
      return [Math.abs(x - e.alphaDeg) <= 0.01 || Math.abs(x - Math.PI / e.n) <= 0.001 ? "correct" : "not_equivalent"];
    }
    case "cotes":
      return [statutProche(v[0], e.coteInscrit, TOL_COTE), statutProche(v[1], e.coteCirconscrit, TOL_COTE)];
    case "encadrement":
      return [statutProche(v[0], e.minorant, TOL_PI), statutProche(v[1], e.majorant, TOL_PI)];
    case "doublement":
      return [statutProche(v[0], e.minorant2, TOL_PI), statutProche(v[1], e.majorant2, TOL_PI)];
    case "precision":
      return [statutProche(v[0], e.nSeuil, 0.001)];
  }
}

export function piege(e: E, phase: PhaseArchimede, v: string[]): Frag[] | null {
  const p = (s: string, c: number, t: number) => valeurProche(s, c, t);
  switch (phase) {
    case "angle":
      if (p(v[0], 360 / e.n, 0.01)) return [tx("C'est l'angle au centre entier ; la hauteur [CH] le partage en deux.")];
      if (p(v[0], (2 * Math.PI) / e.n, 0.001)) return [tx("C'est l'angle au centre entier (en radians) ; "), lx("\\alpha"), tx(" en est la moitié.")];
      return null;
    case "cotes": {
      const a = e.alphaDeg * RAD;
      const msg: Frag[] = [];
      const deux = [v[0], v[1]];
      if (deux.some((s, i) => p(s, (i === 0 ? e.coteInscrit : e.coteCirconscrit) / 2, TOL_COTE))) msg.push(tx("Le côté vaut le double de [HB] (ou de [FD]) : "), lx("2r\\sin\\alpha"), tx(". "));
      if (p(v[0], 2 * e.r * Math.sin(e.alphaDeg), 0.02) || p(v[1], 2 * e.r * Math.tan(e.alphaDeg), 0.02)) msg.push(tx("Ta calculatrice est en mode radian : passe en mode degré (α est en degrés). "));
      if (p(v[0], e.coteCirconscrit, TOL_COTE) && p(v[1], e.coteInscrit, TOL_COTE)) msg.push(tx("Tu as inversé : le polygone inscrit (le plus petit) utilise le sinus, le circonscrit la tangente. "));
      if (p(v[0], 2 * e.r * Math.cos(a), TOL_COTE)) msg.push(tx("Dans CHB, [HB] est le côté opposé à "), lx("\\alpha"), tx(" : c'est le sinus. "));
      return msg.length ? msg : null;
    }
    case "encadrement":
    case "doublement": {
      const [mi, ma] = phase === "encadrement" ? [e.minorant, e.majorant] : [e.minorant2, e.majorant2];
      if (p(v[0], 2 * mi, 0.003) || p(v[1], 2 * ma, 0.003)) return [tx("Divise les périmètres par le diamètre "), lx("2r"), tx(" (et non par "), lx("r"), tx(") : on encadre "), lx("\\pi"), tx(", pas "), lx("2\\pi"), tx(".")];
      if (p(v[0], phase === "encadrement" ? e.n * e.coteInscrit : 2 * e.n * e.coteInscrit, 0.01)) return [tx("C'est un périmètre : divise-le par "), lx("2r"), tx(".")];
      if (phase === "doublement") {
        if (p(v[0], e.minorant, TOL_PI) || p(v[1], e.majorant, TOL_PI)) return [tx("C'est l'encadrement à "), lx(`${e.n}`), tx(" côtés : avec deux fois plus de côtés, le demi-angle est divisé par 2.")];
        if (p(v[0], 2 * e.n * Math.sin(e.alphaDeg * RAD), 0.003)) return [tx("Avec "), lx(`${2 * e.n}`), tx(" côtés, le demi-angle vaut "), lx("\\dfrac{\\alpha}{2}"), tx(".")];
      }
      if (p(v[0], ma, TOL_PI) && p(v[1], mi, TOL_PI)) return [tx("Le minorant vient du polygone inscrit (sinus), le majorant du circonscrit (tangente).")];
      return null;
    }
    case "precision": {
      const x = lireValeur(v[0]);
      if (x === null) return null;
      let k = 0;
      for (let m = e.n; m <= e.nSeuil * 8; m *= 2, k++) {
        if (Math.abs(x - m) < 0.001) {
          return largeurDe(m) >= e.seuil
            ? [tx("Avec ce nombre de côtés, la largeur est encore au-dessus du seuil : double encore.")]
            : [tx("La largeur est déjà sous le seuil avec moitié moins de côtés : cherche le premier nombre de côtés qui convient.")];
        }
      }
      for (let kk = 1; kk <= 8; kk++) if (Math.abs(x - kk) < 0.001) return [tx("On demande un nombre de côtés, pas un nombre de doublements.")];
      return [tx(`Le nombre de côtés est ${e.n}, ${2 * e.n}, ${4 * e.n}, ${8 * e.n}… : on double à chaque fois.`)];
    }
  }
}
