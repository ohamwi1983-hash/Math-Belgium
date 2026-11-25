import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice102, Phase102 } from "../core6e/trianglePascal";
import { valeur102 } from "../core6e/trianglePascal";
import { comb } from "../ui6e/nombresCombinatoireLotH";
import { bonneOption102 } from "../ui6e/formatTrianglePascal";
import { lireCompte, vautEntier } from "./lectureCombinatoireLotH";

/**
 * Vérification de `6gen102`. Choix fermés (propriété, vrai / faux) : une tentative, jugés par
 * `bonneOption102`. Champs : saisie lue avant tout verdict (illisible → `parse_error`, aucune
 * tentative), écriture exacte quelconque (« 15 + 20 », « 2^6 », « C(7 ; 3) »). Messages ciblés :
 * produit au lieu de somme, mauvais voisins, mauvais partenaire de symétrie (Cₙᵏ = Cₙᵏ⁺¹), 2ⁿ de la
 * ligne précédente, 2n au lieu de 2ⁿ, partie vide (ou parties à un élément) oubliée.
 */

type E = Exercice102;
type P = Phase102;
const t = tx;
const l = lx;

export function diagnostiquer102(e: E, p: P, valeurs: string[]): StatutVerification[] {
  const v = valeurs[0] ?? "";
  if (p === "propriete" || p === "verdict") return [v === bonneOption102(e, p) ? "correct" : "not_equivalent"];
  if (lireCompte(v) === null) return ["parse_error"];
  return [vautEntier(v, valeur102(e, p)) ? "correct" : "not_equivalent"];
}

export function piege102(e: E, p: P, valeurs: string[]): Frag[] | null {
  const v = valeurs[0] ?? "";
  const { n, k } = e;
  if (p === "propriete") return v === e.propriete ? null : [t("Regarde la forme du membre de gauche : deux coefficients voisins additionnés (Pascal), un coefficient seul (symétrie) ou toute une ligne additionnée (somme).")];
  if (p === "verdict") {
    if (v === bonneOption102(e, p)) return null;
    return e.vrai
      ? [t("L'égalité est exactement une propriété du cours : elle est vraie.")]
      : e.propriete === "pascal"
        ? [t("La relation de Pascal donne "), l(`C_{${n + 1}}^{${k + 1}}`), t(" : le membre de droite n'est pas celui-là.")]
        : e.propriete === "symetrie"
          ? [t("Le partenaire de symétrie de "), l(`C_{${n}}^{${k}}`), t(" est "), l(`C_{${n}}^{${n - k}}`), t(" (les deux indices font "), l(`${n}`), t(").")]
          : [t("La somme de la ligne "), l(`${n}`), t(" vaut "), l(`2^{${n}}`), t(".")];
  }
  const r = lireCompte(v);
  if (r === null) return null;
  const attendu = valeur102(e, p);
  const cand: { valeur: number; message: Frag[] }[] = [];
  if (p === "pascal") {
    cand.push({ valeur: comb(n, k - 1) * comb(n, k), message: [t("On additionne les deux nombres au-dessus, on ne les multiplie pas.")] });
    cand.push({ valeur: comb(n, k) + comb(n, k + 1), message: [t("Ce ne sont pas les bons voisins : la case d'indice "), l(`${k}`), t(" est sous les cases d'indices "), l(`${k - 1}`), t(" et "), l(`${k}`), t(" (on compte à partir de 0).")] });
  }
  if (p === "symetrique") cand.push({ valeur: comb(n + 1, k + 1), message: [t("Le partenaire de symétrie a pour indice "), l(`${n + 1}-k`), t(" : les deux indices font "), l(`${n + 1}`), t(".")] });
  if (p === "somme") {
    cand.push({ valeur: 2 ** n, message: [t("C'est la somme de la ligne "), l(`${n}`), t(" : on demande la ligne "), l(`${n + 1}`), t(".")] });
    cand.push({ valeur: 2 * (n + 1), message: [t("La somme vaut "), l("2^n"), t(", pas "), l("2n"), t(".")] });
  }
  if (p === "partenaire") cand.push({ valeur: comb(n, k + 1), message: [t("Le partenaire de symétrie de "), l(`C_{${n}}^{${n - k}}`), t(" a pour indice "), l(`${n}-${n - k}`), t(".")] });
  if (p === "suivant") cand.push({ valeur: comb(n, k) * comb(n, k + 1), message: [t("Relation de Pascal : on additionne les deux coefficients, on ne les multiplie pas.")] });
  if (p === "toutes") {
    cand.push({ valeur: 2 * n, message: [t("Le nombre de parties vaut "), l("2^n"), t(", pas "), l("2n"), t(" : chaque élément est pris ou non.")] });
    cand.push({ valeur: 2 ** n - 1, message: [t("Sans contrainte, le choix de « rien » (partie vide) compte aussi.")] });
  }
  if (p === "contrainte") {
    cand.push({ valeur: 2 ** n, message: [t(e.contrainte === "pasTous" ? "Il faut retirer le choix où tous les éléments sont pris." : "Il faut retirer la partie vide (aucun élément).")] });
    if (e.contrainte === "auMoinsDeux") cand.push({ valeur: 2 ** n - 1, message: [t("Il faut aussi retirer les "), l(`${n}`), t(" parties à un seul élément.")] });
  }
  for (const c of cand) if (c.valeur !== attendu && Math.abs(r - c.valeur) < 1e-9) return c.message;
  return null;
}
