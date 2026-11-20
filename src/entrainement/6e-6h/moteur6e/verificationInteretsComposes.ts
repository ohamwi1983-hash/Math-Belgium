import type { ExerciceInteretsComposes } from "../core6e/interetsComposes";
import { capital, capitalLimite, tauxDecimal, tauxEquivalent } from "../core6e/interetsComposes";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { PhaseInteretsComposes } from "../ui6e/formatInteretsComposes";
import { lireValeur, statutProche } from "./lectureExpoLotG";

/**
 * Vérification de `6gen151` (statut à 3 valeurs). Capitaux au centime (± un demi-centime) ou écrits
 * en expression (« 1000(1+0,05/12)^120 ») ; limite exacte (« 1000e^0,5 ») ou au centime ; taux
 * équivalent en % au centième, ou en décimal (« 0,0513 » — même nombre, autre écriture).
 */

type E = ExerciceInteretsComposes;
const tolCentime = (x: number) => 0.0051 + 1e-9 * Math.abs(x);

export function diagnostiquer(e: E, phase: PhaseInteretsComposes, v: string[]): StatutVerification[] {
  switch (phase) {
    case "capitaux":
      return e.frequences.map((n, i) => statutProche(v[i], capital(e, n), tolCentime(capital(e, n))));
    case "limite":
      return [statutProche(v[0], capitalLimite(e), tolCentime(capitalLimite(e)))];
    case "taux": {
      const s = statutProche(v[0], tauxEquivalent(e), 0.0051);
      if (s !== "not_equivalent") return [s];
      return [statutProche(v[0], tauxEquivalent(e) / 100, 0.000051)];
    }
  }
}

export function piege(e: E, phase: PhaseInteretsComposes, v: string[]): Frag[] | null {
  const r = tauxDecimal(e);
  const proche = (x: number | null, c: number, tol = 0.011 + 1e-6 * Math.abs(c)) => x !== null && Math.abs(x - c) <= tol;
  switch (phase) {
    case "capitaux": {
      for (let i = 0; i < 3; i++) {
        const n = e.frequences[i];
        const x = lireValeur(v[i]);
        if (proche(x, capital(e, n))) continue;
        if (n > 1 && proche(x, e.K0 * Math.pow(1 + r, n * e.t))) return [tx("Le taux de chaque versement est "), lx("\\dfrac{r}{n}"), tx(", pas "), lx("r"), tx(".")];
        if (e.t > 1 && proche(x, e.K0 * Math.pow(1 + r / n, n))) return [tx("En "), lx(`${e.t}`), tx(" ans, il y a "), lx("n\\cdot t"), tx(" versements : l'exposant est "), lx("n\\cdot t"), tx(".")];
        if (n > 1 && proche(x, e.K0 * Math.pow(1 + r / n, e.t))) return [tx("L'exposant est le nombre de versements "), lx("n\\cdot t"), tx(", pas le nombre d'années.")];
        if (r < 1 && proche(x, e.K0 * Math.pow(1 + e.tauxPourcent / n, n * e.t), 1e-6 * e.K0 * Math.pow(1 + e.tauxPourcent / n, n * e.t))) return [tx("Le taux s'écrit en décimal : "), lx(`${e.tauxPourcent}\\,\\%=${String(r).replace(".", "{,}")}`), tx(".")];
        if (proche(x, e.K0 * (1 + r * e.t))) return [tx("C'est un intérêt simple : en intérêts composés, les intérêts rapportent à leur tour.")];
        return null;
      }
      return null;
    }
    case "limite": {
      const x = lireValeur(v[0]);
      if (e.t > 1 && proche(x, e.K0 * Math.exp(r))) return [tx("Sur "), lx(`${e.t}`), tx(" ans, l'exposant de e est "), lx("r\\cdot t"), tx(".")];
      if (r < 1 && proche(x, e.K0 * Math.E)) return [tx("La limite de "), lx("\\left(1+\\frac{r}{n}\\right)^{n}"), tx(" est "), lx("e^{r}"), tx(", pas e (sauf si r = 1).")];
      if (proche(x, capital(e, e.frequences[2]))) return [tx("C'est le capital pour un versement quotidien ; la limite est un peu plus grande.")];
      return null;
    }
    case "taux": {
      const x = lireValeur(v[0]);
      if (proche(x, 100 * Math.exp(r), 0.006) || proche(x, Math.exp(r), 0.00006)) return [tx("Retire 1 : "), lx("e^{r}"), tx(" est le facteur multiplicatif, le taux est "), lx("e^{r}-1"), tx(".")];
      if (proche(x, e.tauxPourcent, 1e-6)) return [tx("C'est le taux nominal r ; versés en continu, les intérêts rapportent un peu plus.")];
      return null;
    }
  }
}
