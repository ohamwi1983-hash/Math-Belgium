import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice136, Phase136 } from "../core6e/rayonsFocaux";
import { aire136, cosMax136, rayonF136, rayonFp136 } from "../core6e/rayonsFocaux";
import { val } from "../core6e/coniquesLotH1";
import { bonneOption136 } from "../ui6e/formatRayonsFocaux";
import { egal, l, lireNombreExact, t } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, nombreApproche } from "./saisieConiquesLotH1";

/**
 * Vérification de `6gen136`. Nombres exacts (fractions, √) ; décimal approché d'une valeur fractionnaire
 * ou irrationnelle refusé sans tentative ; illisible → `parse_error`. Messages ciblés, jamais sur une
 * réponse juste : e = a/c, rayons échangés (a + ex pour F), a − x sans e, cos de l'angle au carré ou
 * b²/a² au lieu de (b² − c²)/a², verdict par la mauvaise comparaison des cosinus, aire b²·tan θ ou
 * ½·b²·sin θ.
 */

type E = Exercice136;
type Ph = Phase136;

/** Nombre exact, préfixe recopié « |PF| = », « |PF′| = » toléré. */
const lire = (s: string) => lireNombreExact(s.replace(/^\s*\|[^|]*\|\s*=\s*/, ""));

function attendu(e: E, p: Ph): number {
  switch (p) {
    case "excentricite":
      return e.c / e.a;
    case "rayonF":
      return rayonF136(e);
    case "rayonFp":
      return rayonFp136(e);
    case "cosMax":
      return cosMax136(e);
    default:
      return val(aire136(e));
  }
}

export function diagnostiquer136(e: E, p: Ph, v: string[]): StatutVerification[] {
  if (p === "existence") return [v[0] === bonneOption136(e) ? "correct" : "not_equivalent"];
  const x = lire(v[0] ?? "");
  if (x === null) return ["parse_error"];
  return [egal(x, attendu(e, p)) ? "correct" : "not_equivalent"];
}

export function approchee136(e: E, p: Ph, v: string[]): string | null {
  if (p === "existence") return null;
  return nombreApproche(v[0] ?? "", attendu(e, p)) ? MESSAGE_APPROCHEE : null;
}

export function piege136(e: E, p: Ph, v: string[]): Frag[] | null {
  const st = diagnostiquer136(e, p, v);
  if (st[0] !== "not_equivalent") return null;
  if (p === "existence") return [t("Plus un angle est grand, plus son cosinus est petit : compare "), l(`\\cos ${e.theta}^\\circ`), t(" à "), l("\\cos\\widehat{FBF'}"), t(" dans le bon sens.")];
  const x = lire(v[0] ?? "")!;
  switch (p) {
    case "excentricite":
      if (egal(x, e.a / e.c)) return [t("C'est "), l("\\dfrac{a}{c}"), t(" : l'excentricité d'une ellipse est "), l("\\dfrac{c}{a}"), t(", plus petite que 1.")];
      return null;
    case "rayonF":
      if (egal(x, rayonFp136(e))) return [t("C'est |PF′| : F est le foyer d'abscisse positive, donc "), l("|PF|=a-e\\,x"), t(".")];
      if (egal(x, e.a - e.xP!)) return [t("N'oublie pas l'excentricité : "), l("|PF|=a-e\\,x"), t(".")];
      return null;
    case "rayonFp":
      if (egal(x, rayonF136(e))) return [t("C'est |PF| : pour F′, "), l("|PF'|=a+e\\,x"), t(".")];
      return null;
    case "cosMax":
      if (egal(x, (e.b * e.b) / (e.a * e.a))) return [t("Le troisième côté du triangle FBF′ mesure 2c : "), l("\\cos\\widehat{FBF'}=\\dfrac{2a^2-4c^2}{2a^2}"), t(".")];
      if (egal(x, (2 * e.a * e.a - e.c * e.c) / (2 * e.a * e.a))) return [t("La distance FF′ vaut 2c : son carré est "), l("4c^2"), t(".")];
      return null;
    case "aire": {
      const b2 = e.b * e.b;
      const th = (e.theta! * Math.PI) / 180;
      if (egal(x, b2 * Math.tan(th))) return [t("La formule utilise la moitié de l'angle : "), l("\\tan\\dfrac{\\theta}{2}"), t(".")];
      if (egal(x, (b2 * Math.sin(th)) / 2)) return [t("Les côtés |PF| et |PF′| ne valent pas b : utilise "), l("\\mathcal{A}=b^2\\tan\\dfrac{\\theta}{2}"), t(".")];
      return null;
    }
  }
  return null;
}
