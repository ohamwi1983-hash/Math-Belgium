import type { ExercicePointMoyen } from "../core5e/pointMoyenStat";
import { decimales, egal, moyenne, net, somme } from "../core5e/stat2vLotH1";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhasePointMoyen } from "../ui5e/formatPointMoyenStat";
import { manquantDe, n, PRECISION_PREV_X, prevX, prevY, sommeConnue, sommeTotale, valeurManquante } from "../ui5e/formatPointMoyenStat";
import type { StatutArrondi } from "./lectureStat2vLotH1";
import { nL } from "../ui5e/ecrituresStat2vLotH1";
import { lireDroiteAffine, statutArrondi, vaut } from "./lectureStat2vLotH1";

/**
 * Vérification de `5gen77`. Saisies LUES avant le verdict (`lectureStat2vLotH1.ts`) : illisible →
 * `parse_error` (aucune tentative) ; valeur exacte écrite avec moins de décimales que la valeur exacte
 * (13,13 pour 13,125) ou x de la prévision inverse donné à moins de deux décimales → « trop arrondie »
 * (`approchee`, aucune tentative). Messages ciblés : médiane ou milieu des extrêmes au lieu de la moyenne,
 * x̄ et ȳ échangés, somme des valeurs CONNUES au lieu de n·x̄, moyenne des valeurs connues, différence
 * des abscisses sur celle des ordonnées, b calculé avec la mauvaise abscisse, x et y échangés dans la
 * prévision. Jamais sur une réponse juste.
 */

type E = ExercicePointMoyen;

const exact = (brut: string, v: number): StatutArrondi => statutArrondi(brut, v, decimales(v));
const sansTrop = (s: StatutArrondi): StatutVerification => (s === "trop" ? "not_equivalent" : s);

function statuts(e: E, p: PhasePointMoyen, valeurs: string[]): StatutArrondi[] {
  const v0 = valeurs[0] ?? "";
  if (p === "g") return [exact(v0, e.G.x), exact(valeurs[1] ?? "", e.G.y)];
  if (p === "somme") return [exact(v0, sommeTotale(e, e.manquants[0]!.coord))];
  if (p === "valeur") return [exact(v0, valeurManquante(e, e.manquants[0]!))];
  if (p === "xManquant") return [exact(v0, valeurManquante(e, manquantDe(e, "x")!))];
  if (p === "yManquant") return [exact(v0, valeurManquante(e, manquantDe(e, "y")!))];
  if (p === "pente") return [exact(v0, e.a!)];
  if (p === "prevY") return [exact(v0, prevY(e))];
  if (p === "prevX") return [statutArrondi(v0, prevX(e), PRECISION_PREV_X)];
  const d = lireDroiteAffine(v0);
  if (!d) return ["parse_error"];
  return [d.a !== null && egal(d.a, e.a!) && egal(d.b!, e.b!) ? "correct" : "not_equivalent"];
}

export function diagnostiquer(e: E, p: PhasePointMoyen, valeurs: string[]): StatutVerification[] {
  return statuts(e, p, valeurs).map(sansTrop);
}

export function approchee(e: E, p: PhasePointMoyen, valeurs: string[]): string | null {
  if (!statuts(e, p, valeurs).includes("trop")) return null;
  if (p === "prevX") return "Valeur trop arrondie : donne x arrondi au centième (deux décimales). Cette saisie ne compte pas comme une tentative.";
  return "Valeur arrondie : cette valeur se calcule exactement, donne-la sans l'arrondir. Cette saisie ne compte pas comme une tentative.";
}

const mediane = (v: number[]): number => {
  const t = [...v].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m]! : (t[m - 1]! + t[m]!) / 2;
};

export function piege(e: E, p: PhasePointMoyen, valeurs: string[]): Frag[] | null {
  const ok = diagnostiquer(e, p, valeurs);
  const v0 = valeurs[0] ?? "";
  if (p === "g") {
    if (ok.every((s) => s === "correct")) return null;
    const X = e.points.map((q) => q.x);
    const Y = e.points.map((q) => q.y);
    const v1 = valeurs[1] ?? "";
    if (vaut(v0, e.G.y) && vaut(v1, e.G.x)) return [tx("Tu as échangé "), lx("\\bar{x}"), tx(" et "), lx("\\bar{y}"), tx(" : l'abscisse de G est la moyenne des x.")];
    if ((ok[0] !== "correct" && vaut(v0, mediane(X)) && !egal(mediane(X), e.G.x)) || (ok[1] !== "correct" && vaut(v1, mediane(Y)) && !egal(mediane(Y), e.G.y))) return [tx("C'est la médiane : le point moyen se calcule avec la moyenne (somme divisée par l'effectif).")];
    const milieu = (v: number[]) => (Math.min(...v) + Math.max(...v)) / 2;
    if ((ok[0] !== "correct" && vaut(v0, milieu(X)) && !egal(milieu(X), e.G.x)) || (ok[1] !== "correct" && vaut(v1, milieu(Y)) && !egal(milieu(Y), e.G.y))) return [tx("Tu as pris le milieu des valeurs extrêmes : la moyenne utilise toutes les valeurs.")];
    return null;
  }
  if (ok[0] === "correct") return null;
  if (p === "somme") {
    const c = e.manquants[0]!.coord;
    if (vaut(v0, sommeConnue(e, c))) return [tx("C'est la somme des valeurs connues ; on demande la somme de toutes les valeurs, la valeur effacée comprise : "), lx(`n\\cdot\\bar{${c}}`), tx(".")];
    if (vaut(v0, e.G[c])) return [tx("C'est la moyenne : la somme de toutes les valeurs vaut l'effectif fois la moyenne.")];
    return null;
  }
  if (p === "valeur" || p === "xManquant" || p === "yManquant") {
    const m = p === "valeur" ? e.manquants[0]! : manquantDe(e, p === "xManquant" ? "x" : "y")!;
    const c = m.coord;
    const connues = e.points.filter((_, i) => i !== m.i).map((q) => q[c]);
    if (vaut(v0, moyenne(connues))) return [tx("Tu as fait la moyenne des valeurs connues : il faut partir de la somme de toutes les valeurs, "), lx(`n\\cdot\\bar{${c}}`), tx(".")];
    if (vaut(v0, net((n(e) - 1) * e.G[c] - somme(connues)))) return [tx(`L'effectif est n = ${n(e)} (la valeur effacée compte aussi).`)];
    if (vaut(v0, sommeTotale(e, c))) return [tx("C'est la somme de toutes les valeurs : retires-en les valeurs connues.")];
    return null;
  }
  if (p === "pente") {
    const inverse = (e.G2!.x - e.G1!.x) / (e.G2!.y - e.G1!.y);
    if (vaut(v0, inverse)) return [tx("Tu as divisé la différence des abscisses par celle des ordonnées : "), lx("a=\\dfrac{\\Delta y}{\\Delta x}"), tx(".")];
    if (vaut(v0, -e.a!)) return [tx("Le signe est faux : soustrais dans le même ordre en haut et en bas ("), lx("y_2-y_1"), tx(" et "), lx("x_2-x_1"), tx(").")];
    return null;
  }
  if (p === "equation") {
    const d = lireDroiteAffine(v0);
    if (!d || d.a === null) return null;
    if (egal(d.a, e.a!) && !egal(d.b!, e.b!)) {
      if (egal(d.b!, e.G1!.y - e.a! * e.G2!.x) || egal(d.b!, e.G2!.y - e.a! * e.G1!.x)) return [tx("Pour calculer b, prends l'abscisse et l'ordonnée du même point ("), lx("G_1"), tx(" ou "), lx("G_2"), tx(").")];
      return [tx("La pente est juste, mais ta droite ne passe pas par "), lx("G_1"), tx(" : recalcule b.")];
    }
    if (egal(d.a, e.b!) && egal(d.b!, e.a!)) return [tx("Pente et ordonnée à l'origine sont échangées : dans "), lx("y=ax+b"), tx(", a multiplie x.")];
    if (!egal(d.a, e.a!)) return [tx("La pente de ta droite n'est pas celle de "), lx("G_1G_2"), tx(" (écran précédent).")];
    return null;
  }
  if (p === "prevY") {
    if (vaut(v0, prevX({ ...e, y0: e.x0 }))) return [tx("Ici x est donné : on calcule "), lx("y=ax+b"), tx(" (sans isoler x).")];
    return null;
  }
  if (vaut(v0, e.a! * e.y0! + e.b!)) return [tx("Tu as remplacé x par l'ordonnée donnée : c'est y qui vaut "), lx(nL(e.y0!)), tx(" ; isole x.")];
  if (vaut(v0, (e.y0! + e.b!) / e.a!)) return [tx("Pour isoler x, on retire b des deux membres (signe de b).")];
  return null;
}
