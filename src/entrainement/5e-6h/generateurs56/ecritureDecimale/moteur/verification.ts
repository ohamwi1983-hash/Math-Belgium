import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { estPremier, lireDecomposition, pgcd } from "../../communReels/outilsReels";
import { lireNaturel } from "../../irrationaliteRacine/moteur/verification";
import { developpementL, lireDecimale, lireFraction, memeValeur } from "../core/decimales";
import type { ExerciceDecimale, PhaseDecimale } from "../core/types";
import { bonneOptionId, difference, estChoix, fracL, options, puissanceX } from "../ui/format";

/**
 * Couche B — vérification de `56gen16`. Écriture décimale comparée en VALEUR EXACTE (toute écriture
 * du même nombre acceptée, période non minimale comprise) ; une écriture coupée par « … » est à
 * reprendre sans tentative. Fraction : la bonne valeur non irréductible, ou écrite en décimal, est à
 * reprendre sans tentative. Décomposition : produit juste mais facteur non premier, à reprendre.
 */

type E = ExerciceDecimale;
type P = PhaseDecimale;

const lireEntier = (s: string): number | null => lireNaturel(s);

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (estChoix(e, p)) {
    if (!options(e, p).some((o) => o.id === v)) return ["parse_error"];
    return [v === bonneOptionId(e, p) ? "correct" : "not_equivalent"];
  }
  switch (p) {
    case "ecriture": {
      const l = lireDecimale(v);
      if (l.type === "illisible") return ["parse_error"];
      if (l.type === "points") return ["not_equivalent"];
      return [memeValeur(l, { n: e.num, d: e.den }) ? "correct" : "not_equivalent"];
    }
    case "longueur":
    case "difference": {
      const n = lireEntier(v);
      if (n === null) return ["parse_error"];
      const attendu = p === "longueur" ? e.dev.periode.length : difference(e);
      return [n === attendu ? "correct" : "not_equivalent"];
    }
    case "fraction":
    case "simplifier": {
      const f = lireFraction(v);
      if (!f) return ["parse_error"];
      return [f.ecrit !== "decimal" && memeValeur(f, { n: e.num, d: e.den }) && pgcd(f.n, f.d) === 1 ? "correct" : "not_equivalent"];
    }
    case "denominateur": {
      const d = lireDecomposition(v);
      if (!d) return ["parse_error"];
      return [d.valeur === e.den && (d.tousPremiers || e.den === 1) ? "correct" : "not_equivalent"];
    }
    default:
      return ["parse_error"];
  }
}

export function aReprendre(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (p === "ecriture" && lireDecimale(v).type === "points") return [tx("Une écriture coupée par « … » ne dit pas quels chiffres se répètent : tape la période entre parenthèses. Cette saisie ne compte pas comme une tentative.")];
  if (p === "fraction" || p === "simplifier") {
    const f = lireFraction(v);
    if (!f || !memeValeur(f, { n: e.num, d: e.den })) return null;
    if (f.ecrit === "decimal") return [tx("C'est la bonne valeur, mais on demande une fraction irréductible. Cette saisie ne compte pas comme une tentative.")];
    if (pgcd(f.n, f.d) !== 1) return [tx("C'est la bonne valeur, mais cette fraction se simplifie encore (par "), lx(`${pgcd(f.n, f.d)}`), tx("). Cette saisie ne compte pas comme une tentative.")];
  }
  if (p === "denominateur") {
    const d = lireDecomposition(v);
    if (d && d.valeur === e.den && !d.tousPremiers && e.den !== 1) {
      const b = d.facteurs.find(([x]) => !estPremier(x));
      return [tx("Le produit vaut bien "), lx(`${e.den}`), tx(", mais "), lx(`${b ? b[0] : ""}`), tx(" n'est pas premier : décompose-le encore. Cette saisie ne compte pas comme une tentative.")];
    }
  }
  return null;
}

export function bonneOption(e: E, p: P): string {
  return bonneOptionId(e, p);
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  if (diagnostiquer(e, p, valeurs)[0] === "correct") return null;
  switch (p) {
    case "ecriture": {
      const l = lireDecimale(v);
      if (l.type !== "valeur") return null;
      if (!l.dev.periode) return [tx("Cette écriture est limitée : c'est une valeur approchée. Repère le reste qui revient et mets la période entre parenthèses.")];
      return [tx("Vérifie la division : "), lx(developpementL(l.dev)), tx(" ne vaut pas "), lx(fracL(e.num, e.den)), tx(".")];
    }
    case "longueur":
      return [tx("La période est le bloc le plus court qui se répète, sans les chiffres placés avant lui.")];
    case "borne":
      if (v === "B") return [tx("Un reste nul arrête la division (écriture limitée) : il ne peut pas faire partie d'une période.")];
      if (v === "D") return [tx("Les restes sont en nombre fini : un reste revient forcément.")];
      return [tx("Ce sont les restes de la division par "), lx(`${e.den}`), tx(" qui comptent, pas le numérateur.")];
    case "puissances":
      return [tx("Les deux multiples de "), lx("x"), tx(" doivent avoir la même partie après la virgule : la virgule doit tomber juste avant une période, à une période d'écart.")];
    case "difference": {
      const n = lireEntier(v);
      if (n === null) return null;
      return [tx("Écris "), lx(puissanceX(e.k + e.p)), tx(" et "), lx(puissanceX(e.k)), tx(" en décalant la virgule, puis soustrais leurs parties entières.")];
    }
    case "fraction":
    case "simplifier": {
      const f = lireFraction(v);
      if (!f) return null;
      if (p === "simplifier") return [tx("Divise le numérateur et le dénominateur par le même nombre : la valeur ne doit pas changer.")];
      if (memeValeur(f, { n: difference(e), d: 10 ** (e.k + e.p) })) return [tx("Le dénominateur n'est pas une puissance de 10 : c'est "), lx(`${10 ** (e.k + e.p)}-${10 ** e.k}`), tx(".")];
      return [tx("Reprends "), lx(`x=\\dfrac{${difference(e)}}{${10 ** (e.k + e.p) - 10 ** e.k}}`), tx(" et simplifie-la.")];
    }
    case "denominateur": {
      const d = lireDecomposition(v);
      if (!d) return null;
      return [tx("Ce produit vaut "), lx(`${d.valeur}`), tx(", pas "), lx(`${e.den}`), tx(".")];
    }
    case "verdict":
      if (v === "nonPeriodique") return [tx("Un rationnel n'a jamais une écriture illimitée non périodique : c'est la marque des irrationnels.")];
      return e.verdict === "limitee"
        ? [tx("Le facteur qui gênait a disparu en simplifiant : il ne reste que des 2 et des 5 dans "), lx(`${e.den}`), tx(".")]
        : [tx("Le dénominateur irréductible "), lx(`${e.den}`), tx(" contient un facteur premier autre que 2 et 5.")];
  }
}
