import type { ExerciceInequationTrigo } from "../core5e/inequationsTrigo";
import { estStrict, estSup, inverser, valeurM } from "../core5e/inequationsTrigo";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { decoderLigne, lx, tx } from "../ui5e/ecransTrigo.types";
import { qVal } from "../ui5e/nombresTrigo";
import type { PhaseInequation } from "../ui5e/formatInequationsTrigo";
import { ecartModulo, lireValeur, statutProche } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen55`. Toute écriture juste est acceptée : m exact ou décimal (±0,005) ;
 * arc donné par n'importe quelle représentation (borne gauche à 2π près, longueur de l'arc exacte à
 * ±0,01) ; famille en x à une période près ; ensemble des solutions comparé intervalle par
 * intervalle (bornes à ±0,01, crochets exacts — 2π toujours exclu de [0 ; 2π[), lignes dans
 * n'importe quel ordre.
 */

type E = ExerciceInequationTrigo;
const PI = Math.PI;
const TOL = 0.01;
const v = (x: { n: number; d: number }) => (x.n / x.d) * PI;

function arcLongueur(e: E): number {
  return v(e.arcU![1]) - v(e.arcU![0]);
}

export interface LigneLue {
  g: number;
  d: number;
  o: "[" | "]";
  f: "[" | "]";
}

/** Lignes d'intervalle saisies, lues ; null si une borne est illisible. */
export function lireLignes(valeurs: string[]): LigneLue[] | null {
  const out: LigneLue[] = [];
  for (const s of valeurs) {
    const l = decoderLigne(s);
    const g = lireValeur(l.gauche);
    const d = lireValeur(l.droite);
    if (g === null || d === null) return null;
    out.push({ g, d, o: l.ouvrant, f: l.fermant });
  }
  return out.sort((a, b) => a.g - b.g);
}

function memesIntervalles(e: E, lues: LigneLue[]): boolean {
  if (lues.length !== e.intervalles.length) return false;
  return e.intervalles.every((iv, i) => {
    const l = lues[i];
    return Math.abs(l.g - v(iv.g)) <= TOL && Math.abs(l.d - v(iv.d)) <= TOL && l.o === iv.o && l.f === iv.f;
  });
}

export function diagnostiquer(e: E, phase: PhaseInequation, val: string[]): StatutVerification[] {
  switch (phase) {
    case "isoler":
      return [val[0] === e.symbole ? "correct" : "not_equivalent", statutProche(val[1], valeurM(e.m), 0.005)];
    case "arc": {
      const a = lireValeur(val[0]);
      const b = lireValeur(val[1]);
      if (a === null || b === null) return [a === null ? "parse_error" : "correct", b === null ? "parse_error" : "correct"];
      const s0: StatutVerification = Math.abs(ecartModulo(a, v(e.arcU![0]), 2 * PI)) <= TOL ? "correct" : "not_equivalent";
      const s1: StatutVerification = s0 === "correct" ? (Math.abs(b - a - arcLongueur(e)) <= 2 * TOL ? "correct" : "not_equivalent") : Math.abs(ecartModulo(b, v(e.arcU![1]), 2 * PI)) <= TOL ? "correct" : "not_equivalent";
      return [s0, s1];
    }
    case "retour": {
      const a = lireValeur(val[0]);
      const b = lireValeur(val[1]);
      const p = lireValeur(val[2]);
      if (a === null || b === null || p === null) return [a, b, p].map((x) => (x === null ? "parse_error" : "correct"));
      const per = v(e.periode);
      const s0: StatutVerification = Math.abs(ecartModulo(a, v(e.xg!), per)) <= TOL ? "correct" : "not_equivalent";
      const s1: StatutVerification = s0 === "correct" ? (Math.abs(b - a - (v(e.xd!) - v(e.xg!))) <= 2 * TOL ? "correct" : "not_equivalent") : Math.abs(ecartModulo(b, v(e.xd!), per)) <= TOL ? "correct" : "not_equivalent";
      const s2: StatutVerification = Math.abs(p - per) <= TOL ? "correct" : "not_equivalent";
      return [s0, s1, s2];
    }
    case "intervalles": {
      const lues = lireLignes(val);
      if (!lues) return ["parse_error"];
      return [memesIntervalles(e, lues) ? "correct" : "not_equivalent"];
    }
    case "conclusion":
      return [val[0] === (e.cas === "toujoursVraie" ? "vraie" : "fausse") ? "correct" : "not_equivalent"];
  }
}

export function piege(e: E, phase: PhaseInequation, val: string[]): Frag[] | null {
  switch (phase) {
    case "isoler": {
      const m = valeurM(e.m);
      const lu = lireValeur(val[1]);
      if (e.inversion && val[0] === inverser(e.symbole)) return [tx("Tu as divisé par un nombre négatif : le sens de l'inégalité change.")];
      if (!e.inversion && val[0] === inverser(e.symbole)) return [tx("Le sens de l'inégalité ne change que si l'on divise (ou multiplie) par un nombre négatif.")];
      if (val[0] !== e.symbole && estSup(val[0] as never) === estSup(e.symbole) && estStrict(val[0] as never) !== estStrict(e.symbole)) return [tx("Garde le même type d'inégalité : large (≥, ≤) ou stricte (>, <).")];
      if (lu !== null && Math.abs(lu + m) < 0.006 && Math.abs(m) > 0.01) return [tx("Vérifie le signe de "), lx("m"), tx(" : la constante change de signe en passant de l'autre côté.")];
      if (lu !== null && Math.abs(e.k) !== 1 && Math.abs(lu - (valeurM(e.e) - qVal(e.d))) < 0.006) return [tx("Il reste à diviser par le coefficient "), lx(`${e.k}`), tx(".")];
      return null;
    }
    case "arc": {
      const a = lireValeur(val[0]);
      const b = lireValeur(val[1]);
      if (a === null || b === null) return null;
      if (b <= a) return [tx("La borne de gauche doit être la plus petite : parcours l'arc dans le sens trigonométrique, quitte à ajouter "), lx("2\\pi"), tx(" à la borne de droite.")];
      const L = arcLongueur(e);
      if (Math.abs(ecartModulo(a, v(e.arcU![1]), 2 * PI)) <= TOL && Math.abs(b - a - (2 * PI - L)) <= 2 * TOL)
        return [tx(e.fonction === "sin" ? "C'est l'arc complémentaire : pour ≥ on garde l'arc au-dessus de la droite horizontale sin u = m, pour ≤ celui en dessous." : "C'est l'arc complémentaire : pour ≥ on garde l'arc à droite de la droite verticale cos u = m, pour ≤ celui de gauche.")];
      if (e.fonction === "sin") {
        const al = v(e.arcU![0]);
        if (estSup(e.symbole) && (Math.abs(ecartModulo(b, -al, 2 * PI)) <= TOL || Math.abs(ecartModulo(a, -al, 2 * PI)) <= TOL)) return [tx("Le second angle de même sinus est "), lx("\\pi-\\alpha"), tx(", pas "), lx("-\\alpha"), tx(".")];
      }
      return null;
    }
    case "retour": {
      const p = lireValeur(val[2]);
      const a = lireValeur(val[0]);
      const msg: Frag[] = [];
      if (p !== null && Math.abs(p - 2 * PI) <= TOL) msg.push(tx("La période se divise aussi par "), lx(`a=${e.a}`), tx(" : "), lx("p=\\dfrac{2\\pi}{a}"), tx(". "));
      if (a !== null) {
        const u = v(e.arcU![0]);
        const b = (e.bPi.n / e.bPi.d) * PI;
        const per = v(e.periode);
        if (Math.abs(ecartModulo(a, u / e.a - b, per)) <= TOL && Math.abs(b) > 0.01) msg.push(tx("Retranche "), lx("b"), tx(" avant de diviser par "), lx("a"), tx(" (ou divise chaque terme, "), lx("b"), tx(" compris). "));
        else if (Math.abs(ecartModulo(a, (u + b) / e.a, per)) <= TOL && Math.abs(b) > 0.01) msg.push(tx("Vérifie le signe : on retranche "), lx("b"), tx(" des deux côtés. "));
      }
      return msg.length ? msg : null;
    }
    case "intervalles": {
      const lues = lireLignes(val);
      if (!lues) return null;
      if (lues.some((l) => l.g > l.d + 1e-9)) return [tx("Dans un intervalle, la borne de gauche est la plus petite.")];
      if (lues.some((l) => l.g < -TOL || l.d > 2 * PI + TOL)) return [tx("Garde seulement ce qui est dans "), lx("[0\\,;\\,2\\pi\\mathclose{[}"), tx(" : coupe en 0 et en "), lx("2\\pi"), tx(".")];
      if (lues.length < e.intervalles.length) return [tx("Il manque des intervalles : ajoute ou retranche la période tant que tu restes dans "), lx("[0\\,;\\,2\\pi\\mathclose{[}"), tx(".")];
      if (lues.length > e.intervalles.length) return [tx("Il y a trop d'intervalles : vérifie qu'ils rencontrent tous "), lx("[0\\,;\\,2\\pi\\mathclose{[}"), tx(".")];
      const bornesOk = e.intervalles.every((iv, i) => Math.abs(lues[i].g - v(iv.g)) <= TOL && Math.abs(lues[i].d - v(iv.d)) <= TOL);
      if (bornesOk) return [tx("Les bornes sont justes ; vérifie les crochets : inégalité stricte → crochets ouverts ; "), lx("2\\pi"), tx(" est exclu, 0 est inclus quand il est solution.")];
      return null;
    }
    case "conclusion":
      return null;
  }
}
