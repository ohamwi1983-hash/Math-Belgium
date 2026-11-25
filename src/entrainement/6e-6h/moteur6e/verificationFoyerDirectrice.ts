import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice135, Phase135 } from "../core6e/foyerDirectrice";
import { pied135, poly135, polyAutreDirection, sommet135 } from "../core6e/foyerDirectrice";
import { bonneOption135 } from "../ui6e/formatFoyerDirectrice";
import { l, lirePoint, memePoint, statutPoint, t } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, equationProportionnelle, pointsApproches, statutEquation } from "./saisieConiquesLotH1";

/**
 * Vérification de `6gen135`. Équation comparée par PROPORTIONNALITÉ à den²·|PF|² − num²·dist(P ; d)²
 * (toute forme équivalente : développée, non développée, multipliée, membres échangés) ; illisible →
 * `parse_error` (aucune tentative) ; sommet exact (décimal approché refusé sans tentative). Messages
 * ciblés, jamais sur une réponse juste : e² oublié (e au lieu de e²), distance à la directrice prise dans
 * la mauvaise direction (directrice horizontale), sommet au milieu de [FH] (formule de la parabole) ou
 * partagé dans le rapport inverse.
 */

type E = Exercice135;
type Ph = Phase135;

export function diagnostiquer135(e: E, p: Ph, v: string[]): StatutVerification[] {
  if (p === "nature") return [v[0] === bonneOption135(e) ? "correct" : "not_equivalent"];
  if (p === "equation") return [statutEquation(v[0] ?? "", poly135(e))];
  return [statutPoint(v[0] ?? "", sommet135(e))];
}

export function approchee135(e: E, p: Ph, v: string[]): string | null {
  if (p === "sommet" && pointsApproches(v[0] ?? "", [sommet135(e)])) return MESSAGE_APPROCHEE;
  return null;
}

export function piege135(e: E, p: Ph, v: string[]): Frag[] | null {
  const st = diagnostiquer135(e, p, v);
  if (st[0] !== "not_equivalent") return null;
  if (p === "nature") return [t("C'est la valeur de e qui décide : comparée à 1.")];
  if (p === "equation") {
    const s = v[0] ?? "";
    if (e.num !== e.den && equationProportionnelle(s, poly135(e, false))) return [t("Tu as élevé |PF| au carré mais pas e : le second membre est "), l("e^2\\cdot\\text{dist}(P\\,;d)^2"), t(".")];
    if (equationProportionnelle(s, polyAutreDirection(e))) return [t("La directrice est "), t(e.variante === "verticale" ? "verticale (x = k) : la distance de P à d vaut |x − k|." : "horizontale (y = k) : la distance de P à d vaut |y − k|, pas |x − k|.")];
    return null;
  }
  const q = lirePoint(v[0] ?? "");
  if (!q) return null;
  const H = pied135(e);
  const ev = e.num / e.den;
  if (memePoint(q, { x: (e.F.x + H.x) / 2, y: (e.F.y + H.y) / 2 }) && e.num !== e.den) return [t("Le milieu de [FH] ne convient que pour une parabole (e = 1). Ici, "), l("|SF|=e\\cdot|SH|"), t(".")];
  if (memePoint(q, { x: (e.F.x * ev + H.x) / (1 + ev), y: (e.F.y * ev + H.y) / (1 + ev) })) return [t("Tu as partagé [FH] dans le rapport inverse : c'est |SF| qui vaut e fois |SH|.")];
  return null;
}
