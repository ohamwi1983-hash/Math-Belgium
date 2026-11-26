import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireValeur } from "../../../../5e-4h/moteur5e/lectureValeurTrigo";
import type { ExerciceSigma } from "../index";
import { nombreTermes, partieGeo, sommeArithN, sommeDe, sommeGeoN, termesDe, totalMixte, valeurTerme } from "../index";
import type { PhaseSigma } from "../ui/formatSigma";
import { bonneNature } from "../ui/formatSigma";
import { egaux, expressionEgale, statutExpression } from "../../expression56";

/**
 * Vérification de `56gen21`. Nombres entiers exacts (espaces de milliers acceptés) ; expressions en i, j
 * ou n comparées en plusieurs valeurs (toute forme équivalente : « 3·2^(i−1) » = « 1,5·2^i ») ; nature
 * en choix fermé (une tentative). Saisie illisible → `parse_error` (aucune tentative).
 */

type E = ExerciceSigma;

const lire = (s: string) => lireValeur((s ?? "").replace(/(\d)[\s  ](?=\d{3}\b)/g, "$1"));

function statutNombre(brut: string, cible: number): StatutVerification {
  const v = lire(brut);
  if (v === null) return "parse_error";
  return egaux(v, cible) ? "correct" : "not_equivalent";
}

const pointsDe = (e: E) => {
  const out: number[] = [];
  for (let i = 1; i <= Math.min(e.m, 12); i++) out.push(i);
  return out;
};
const POINTS_N = [1, 2, 3, 4, 5, 6, 7, 8];

/** g(j) = f(j + k − 1). */
const gDe = (e: E) => (j: number) => valeurTerme(e.terme, j + e.k - 1);
const sommeN = (e: E) => (n: number) => (e.terme.kind === "arith" ? sommeArithN(e.terme.a, e.terme.b, n) : e.terme.kind === "geo" ? sommeGeoN(e.terme.c, e.terme.q, n) : Number.NaN);

export function diagnostiquer(e: E, phase: PhaseSigma, v: string[]): StatutVerification[] {
  const t = termesDe(e);
  switch (phase) {
    case "terme":
      return [statutExpression(v[0], "i", pointsDe(e), (i) => valeurTerme(e.terme, i))];
    case "borne":
      return [statutNombre(v[0], e.m)];
    case "valeur":
      return [statutNombre(v[0], sommeDe(e))];
    case "nbTermes":
      return [statutNombre(v[0], nombreTermes(e))];
    case "extremes":
      return [statutNombre(v[0], t[0]), statutNombre(v[1], t[t.length - 1])];
    case "nature":
      return [v[0] === bonneNature(e) ? "correct" : "not_equivalent"];
    case "elements":
      return e.terme.kind === "geo"
        ? [statutNombre(v[0], t[0]), statutNombre(v[1], e.terme.q), statutNombre(v[2], nombreTermes(e))]
        : [statutNombre(v[0], t[0]), statutNombre(v[1], t[t.length - 1]), statutNombre(v[2], nombreTermes(e))];
    case "partieGeo":
      return [statutNombre(v[0], partieGeo(e))];
    case "partieArith":
      return [statutNombre(v[0], sommeDe(e))];
    case "total":
      return [statutNombre(v[0], totalMixte(e))];
    case "extremesN":
      return [statutNombre(v[0], valeurTerme(e.terme, 1)), statutExpression(v[1], "n", POINTS_N, (n) => valeurTerme(e.terme, n))];
    case "sommeN":
      return [statutExpression(v[0], "n", POINTS_N, sommeN(e))];
    case "nouvelleBorne":
      return [statutNombre(v[0], nombreTermes(e))];
    case "nouveauTerme":
      return [statutExpression(v[0], "j", POINTS_N, gDe(e))];
  }
}

function proche(brut: string, cible: number): boolean {
  const x = lire(brut);
  return x !== null && egaux(x, cible);
}

/** Message ciblé sur l'erreur trahie par la réponse fausse (jamais la réponse). */
export function piege(e: E, phase: PhaseSigma, v: string[]): Frag[] | null {
  const t = termesDe(e);
  const N = nombreTermes(e);
  switch (phase) {
    case "terme": {
      if (e.terme.kind === "arith") {
        const r = e.terme.a;
        if (expressionEgale(v[0], "i", pointsDe(e), (i) => t[0] + i * r)) return [tx("Au rang 1, ton expression ne donne pas le premier terme : le terme de rang i vaut le premier terme plus "), lx("(i-1)"), tx(" fois la raison.")];
        if (expressionEgale(v[0], "i", pointsDe(e), (i) => -(valeurTerme(e.terme, i) - t[0]) + t[0])) return [tx("Vérifie le signe de la raison : calcule "), lx("u_2-u_1"), tx(".")];
      } else if (e.terme.kind === "geo") {
        const q = e.terme.q;
        if (expressionEgale(v[0], "i", pointsDe(e), (i) => t[0] * q ** i)) return [tx("Au rang 1, ton expression ne donne pas le premier terme : l'exposant de la raison est "), lx("i-1"), tx(".")];
      }
      return [tx("Vérifie ton expression en remplaçant i par 1, 2 et 3 : tu dois retrouver les trois premiers termes.")];
    }
    case "borne":
      if (proche(v[0], e.m - 1)) return [tx("Le nombre de termes est le nombre de pas plus 1 : n'oublie pas le premier terme.")];
      if (proche(v[0], t[t.length - 1])) return [tx("On demande le rang du dernier terme (le nombre de termes), pas sa valeur.")];
      return null;
    case "nbTermes":
    case "nouvelleBorne":
      if (proche(v[0], e.m - e.k)) return [tx("On compte les deux bornes : de "), lx(`i=${e.k}`), tx(" à "), lx(`i=${e.m}`), tx(", il y a "), lx("m-k+1"), tx(" termes.")];
      if (proche(v[0], e.m)) return [tx("La somme ne commence pas à "), lx("i=1"), tx(" : retire les rangs qui manquent au début.")];
      return null;
    case "extremes":
      if (proche(v[0], valeurTerme(e.terme, 1)) && e.k !== 1) return [tx("Le premier terme correspond à la borne inférieure "), lx(`i=${e.k}`), tx(", pas à "), lx("i=1"), tx(".")];
      return null;
    case "elements": {
      const msg: Frag[] = [];
      if (e.k !== 1 && proche(v[0], valeurTerme(e.terme, 1))) msg.push(tx("Le premier terme correspond à la borne inférieure "), lx(`i=${e.k}`), tx(". "));
      if (proche(v[2], e.m - e.k)) msg.push(tx("Le nombre de termes compte les deux bornes : "), lx("m-k+1"), tx(". "));
      else if (e.k !== 1 && proche(v[2], e.m)) msg.push(tx("La somme commence à "), lx(`i=${e.k}`), tx(" : il y a "), lx("m-k+1"), tx(" termes, pas "), lx("m"), tx(". "));
      return msg.length ? msg : null;
    }
    case "nature":
      return null;
    case "valeur":
    case "partieArith": {
      if (e.terme.kind === "arith" && proche(v[0], ((N - 1) * (t[0] + t[t.length - 1])) / 2)) return [tx("Le nombre de termes est "), lx(`${N}`), tx(" : compte les deux bornes.")];
      if (e.terme.kind === "arith" && proche(v[0], N * (t[0] + t[t.length - 1]))) return [tx("N'oublie pas de diviser par 2.")];
      if (e.terme.kind === "geo") {
        const q = e.terme.q;
        if (proche(v[0], (t[0] * (1 - q ** (N - 1))) / (1 - q)) || proche(v[0], (t[0] * (1 - q ** (N + 1))) / (1 - q))) return [tx("L'exposant de "), lx("q"), tx(" dans la formule est le nombre de termes, "), lx(`${N}`), tx(".")];
        if (proche(v[0], (valeurTerme(e.terme, 1) * (1 - q ** N)) / (1 - q)) && e.k !== 1) return [tx("Le premier terme de la somme est celui de rang "), lx(`i=${e.k}`), tx(".")];
      }
      return null;
    }
    case "partieGeo": {
      const { c, q } = e.geo!;
      if (proche(v[0], (c * (1 - q ** e.m)) / (1 - q))) return [tx("Le premier terme de la partie géométrique est sa valeur en "), lx("i=1"), tx(" : "), lx(`${c}\\cdot ${q}^1`), tx(", pas "), lx(`${c}`), tx(".")];
      if (proche(v[0], c * q ** e.m)) return [tx("C'est seulement le dernier terme : il faut la somme des "), lx(`${e.m}`), tx(" termes.")];
      return null;
    }
    case "total":
      if (proche(v[0], partieGeo(e)) || proche(v[0], sommeDe(e))) return [tx("Additionne les deux parties.")];
      return null;
    case "extremesN": {
      if (e.terme.kind === "geo" && expressionEgale(v[1], "n", POINTS_N, (n) => valeurTerme(e.terme, n - 1))) return [tx("Remplace i par n : l'exposant est "), lx("n"), tx(".")];
      return null;
    }
    case "sommeN": {
      const S = sommeN(e);
      if (expressionEgale(v[0], "n", POINTS_N, (n) => 2 * S(n))) return [tx("N'oublie pas de diviser par 2.")];
      if (e.terme.kind === "geo") {
        const { c, q } = e.terme;
        if (expressionEgale(v[0], "n", POINTS_N, (n) => (c * (q ** n - 1)) / (q - 1))) return [tx("Le premier terme est "), lx(`u_1=${c * q}`), tx(", pas "), lx(`${c}`), tx(".")];
      }
      if (expressionEgale(v[0], "n", POINTS_N, (n) => valeurTerme(e.terme, n))) return [tx("C'est le dernier terme, pas la somme.")];
      return [tx("Vérifie avec "), lx("n=1"), tx(" : "), lx("S_1"), tx(" doit être égale au premier terme.")];
    }
    case "nouveauTerme":
      if (expressionEgale(v[0], "j", POINTS_N, (j) => valeurTerme(e.terme, j))) return [tx("Tu as gardé le même terme : il faut remplacer i par son expression en fonction de j.")];
      if (expressionEgale(v[0], "j", POINTS_N, (j) => valeurTerme(e.terme, j - e.k + 1))) return [tx("Remplacement à l'envers : comme "), lx(`j=i${1 - e.k < 0 ? `-${e.k - 1}` : `+${1 - e.k}`}`), tx(", on a "), lx(`i=j${e.k - 1 < 0 ? `-${1 - e.k}` : `+${e.k - 1}`}`), tx(".")];
      return [tx("Vérifie avec "), lx("j=1"), tx(" : tu dois retrouver le premier terme de la somme.")];
  }
}
