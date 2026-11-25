import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice137, Phase137 } from "../core6e/hyperboleEquilatere";
import { c137, foyers137, sommets137, sommetsXY137 } from "../core6e/hyperboleEquilatere";
import { val, valP } from "../core6e/coniquesLotH1";
import { egal, l, lireNombreExact, lirePoints, memeEnsemble, t } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, nombreApproche, pointsApproches, statutPoints } from "./saisieConiquesLotH1";

/**
 * Vérification de `6gen137`. Nombres et points exacts (√ accepté ; décimal approché refusé sans
 * tentative ; illisible → `parse_error`) ; points dans un ordre libre. Messages ciblés, jamais sur une
 * réponse juste : k = a² (piège du cours), a² = k, c = a ou c² = a², sommets (a ; 0) recopiés du
 * repère de départ, sommets (k ; k) ou (√k ; 0), foyers aux sommets ou à la distance a√2 sur un axe.
 */

type E = Exercice137;
type Ph = Phase137;

const nombre = (e: E, p: Ph) => (p === "c" ? val(c137(e)) : p === "k" ? e.k : e.a2);
const points = (e: E, p: Ph) => (p === "sommetsXY" ? sommetsXY137(e) : p === "sommets" ? sommets137(e) : foyers137(e)).map(valP);

export function diagnostiquer137(e: E, p: Ph, v: string[]): StatutVerification[] {
  if (p === "c" || p === "k" || p === "a2") {
    const x = lireNombreExact(v[0] ?? "");
    if (x === null) return ["parse_error"];
    return [egal(x, nombre(e, p)) ? "correct" : "not_equivalent"];
  }
  return [statutPoints(v[0] ?? "", points(e, p))];
}

export function approchee137(e: E, p: Ph, v: string[]): string | null {
  if (p === "c" || p === "k" || p === "a2") return nombreApproche(v[0] ?? "", nombre(e, p)) ? MESSAGE_APPROCHEE : null;
  return pointsApproches(v[0] ?? "", points(e, p)) ? MESSAGE_APPROCHEE : null;
}

export function piege137(e: E, p: Ph, v: string[]): Frag[] | null {
  const st = diagnostiquer137(e, p, v);
  if (st[0] !== "not_equivalent") return null;
  if (p === "c" || p === "k" || p === "a2") {
    const x = lireNombreExact(v[0] ?? "")!;
    if (p === "k" && egal(x, e.a2)) return [t("Piège classique : k n'est pas a². En tournant le repère de 45°, "), l("x^2-y^2=a^2"), t(" devient "), l("XY=\\dfrac{a^2}{2}"), t(".")];
    if (p === "a2" && egal(x, e.k)) return [t("Piège classique : "), l("a^2"), t(" n'est pas k, mais son double ("), l("k=\\dfrac{a^2}{2}"), t(").")];
    if (p === "c" && egal(x, Math.sqrt(e.a2))) return [t("C'est a : pour une hyperbole, "), l("c^2=a^2+b^2"), t(", et ici b = a.")];
    if (p === "c" && egal(x, 2 * e.a2)) return [t("C'est "), l("c^2"), t(" : il reste à prendre la racine carrée.")];
    return null;
  }
  const lus = lirePoints(v[0] ?? "");
  if (!lus) return null;
  const a = Math.sqrt(e.a2);
  if (p === "sommetsXY" && memeEnsemble(lus, [{ x: a, y: 0 }, { x: -a, y: 0 }])) return [t("Ce sont les sommets dans le repère de départ : dans le repère des asymptotes, les deux coordonnées d'un sommet sont égales.")];
  if (p === "sommets" && memeEnsemble(lus, [{ x: e.k, y: e.k }, { x: -e.k, y: -e.k }])) return [t("Le point (k ; k) ne vérifie pas xy = k : son produit vaut k². Résous "), l("x^2=k"), t(".")];
  if (p === "foyers" && memeEnsemble(lus, sommets137(e).map(valP))) return [t("Ce sont les sommets : les foyers sont plus loin de O, à la distance "), l("c=a\\sqrt{2}"), t(".")];
  if (p === "foyers" && memeEnsemble(lus, [{ x: Math.sqrt(2 * e.a2), y: 0 }, { x: -Math.sqrt(2 * e.a2), y: 0 }])) return [t("Les foyers sont sur l'axe de symétrie y = x, pas sur l'axe des abscisses.")];
  return null;
}
