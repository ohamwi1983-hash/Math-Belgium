import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { ExerciceTD, PhaseTD } from "../core6e/tangenteDeriveeDedoublee";
import { branche, pente, tangenteP, tangenteQ } from "../core6e/tangenteDeriveeDedoublee";
import type { D, Pt } from "../ui6e/outilsConiquesLotH2";
import { estApprochee, l, lireMesure, nL, t } from "../ui6e/outilsConiquesLotH2";
import { egalNum, equationXY, proportionnelle } from "./lectureLieuxLotH2";

/**
 * Vérification de `6gen138`. Tout est LU avant tout verdict (illisible → `parse_error`, aucune tentative).
 * Pente : nombre exact (fraction, décimal fini égal) — décimal arrondi refusé SANS tentative. Tangentes :
 * droite comparée par proportionnalité (toute écriture : y = mx + p, implicite, multipliée, forme
 * dédoublée non simplifiée). Messages ciblés : pente de l'autre branche, p contre 2p, x remplacé par
 * x·x_Q, tangente horizontale au sommet.
 */

type E = ExerciceTD;

const valD = (d: D) => (p: Pt) => d.a * p.x + d.b * p.y + d.c;

export function messageIllisible(_e: E, p: PhaseTD): string {
  if (p === "pente") return "Valeur non reconnue : écris un nombre exact, par exemple −3/5 ou 4. Cette saisie ne compte pas comme une tentative.";
  return "Équation non reconnue : écris une égalité en x et y, par exemple 3x + 5y = 25 ou y = −0,6x + 5. Cette saisie ne compte pas comme une tentative.";
}

export function approchee(e: E, p: PhaseTD, valeurs: string[]): string | null {
  if (p !== "pente") return null;
  const v = valeurs[0] ?? "";
  return estApprochee(v, lireMesure(v), pente(e)) ? "C'est une valeur approchée : donne la valeur exacte (une fraction). Cette saisie ne compte pas comme une tentative." : null;
}

function droiteJuste(saisie: string, d: D): StatutVerification {
  const f = equationXY(saisie);
  if (!f) return "parse_error";
  return proportionnelle(f, valD(d)) ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, p: PhaseTD, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "branche") return [v === branche(e) ? "correct" : "not_equivalent"];
  if (p === "pente") {
    const n = lireMesure(v);
    if (n === null) return ["parse_error"];
    return [egalNum(n, pente(e), 1e-9) ? "correct" : "not_equivalent"];
  }
  if (p === "tangente") return [droiteJuste(v, tangenteP(e))];
  return [droiteJuste(v, tangenteQ(e))];
}

export function piege(e: E, p: PhaseTD, valeurs: string[]): Frag[] | null {
  if (diagnostiquer(e, p, valeurs).every((s) => s === "correct")) return null;
  const v = valeurs[0] ?? "";
  const c = e.conique;
  if (p === "branche") {
    if (v === "haut" || v === "bas") return [t("C'est l'autre branche : "), l(`y_P=${nL(e.P.y)}`), t(e.P.y > 0 ? " est positif, P est au-dessus de l'axe des abscisses." : " est négatif, P est sous l'axe des abscisses.")];
    if (c.type === "parabole") return [t("Cette fonction ne vient pas de l'équation de Γ : en isolant y dans "), l("y^2=2px"), t(", le coefficient sous la racine est "), l("2p"), t(".")];
    if (c.type === "ellipse") return [t("Cette fonction ne vient pas de l'équation de Γ : en isolant y, le coefficient devant la racine est "), l("\\dfrac{b}{a}"), t(" et la racine contient "), l("a^2-x^2"), t(".")];
    return [t("Cette fonction ne vient pas de l'équation de Γ : pour une hyperbole, la racine contient "), l("x^2-a^2"), t(", pas "), l("a^2-x^2"), t(".")];
  }
  if (p === "pente") {
    const n = lireMesure(v);
    if (n === null) return null;
    if (egalNum(n, -pente(e), 1e-9)) return [t("C'est la pente de l'autre branche : pour "), l(e.P.y > 0 ? "y_P>0" : "y_P<0"), t(e.P.y > 0 ? ", on dérive y = f(x)." : ", on dérive y = −f(x), d'où le signe opposé.")];
    if (c.type === "parabole" && egalNum(n, 2 * pente(e), 1e-9)) return [t("La dérivée de "), l("\\sqrt{u}"), t(" est "), l("\\dfrac{u'}{2\\sqrt{u}}"), t(" : n'oublie pas le 2 du dénominateur.")];
    if (c.type !== "parabole" && c.a !== c.b && egalNum(n, (pente(e) * c.a ** 4) / c.b ** 4, 1e-9)) return [t("Les rôles de "), l("a^2"), t(" et "), l("b^2"), t(" sont inversés : la pente vaut "), l(c.type === "ellipse" ? "-\\dfrac{b^2x_P}{a^2y_P}" : "\\dfrac{b^2x_P}{a^2y_P}"), t(".")];
    return null;
  }
  const f = equationXY(v);
  if (!f) return null;
  if (p === "tangente") {
    const m = -pente(e);
    if (proportionnelle(f, valD({ a: m, b: -1, c: e.P.y - m * e.P.x }))) return [t("Cette droite a la pente de l'autre branche (le symétrique de la tangente par rapport à l'axe des abscisses).")];
    if (Math.abs(f(e.P)) > 1e-6 * (1 + Math.abs(f({ x: e.P.x + 1, y: e.P.y })))) return [t("Ta droite ne passe pas par "), l("P"), t(" : vérifie en remplaçant "), l("x"), t(" et "), l("y"), t(" par les coordonnées de "), l("P"), t(".")];
    return null;
  }
  // Forme dédoublée en Q.
  if (e.qSommet && proportionnelle(f, (q) => q.y - e.Q.y)) return [t("En un sommet de l'axe focal, la tangente est verticale : la forme dédoublée donne une équation en "), l("x"), t(" seulement.")];
  if (c.type === "parabole") {
    if (proportionnelle(f, (q) => q.y * e.Q.y - 2 * c.p * (q.x + e.Q.x))) return [t("Le coefficient est "), l("p"), t(", pas "), l("2p"), t(" : "), l("2px"), t(" devient "), l("2p\\cdot\\dfrac{x+x_Q}{2}=p\\,(x+x_Q)"), t(".")];
    if (proportionnelle(f, (q) => q.y * e.Q.y - 2 * c.p * q.x * e.Q.x)) return [t("Le terme "), l("x"), t(" n'est pas au carré : il devient "), l("\\dfrac{x+x_Q}{2}"), t(", pas "), l("x\\,x_Q"), t(".")];
  }
  if (Math.abs(f(e.Q)) > 1e-6 * (1 + Math.abs(f({ x: e.Q.x + 1, y: e.Q.y })))) return [t("Ta droite ne passe pas par "), l("Q"), t(".")];
  return null;
}
