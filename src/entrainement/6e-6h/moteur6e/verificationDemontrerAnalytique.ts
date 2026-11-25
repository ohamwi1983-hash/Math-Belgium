import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Champ123, Exercice123, Phase123 } from "../core6e/demontrerAnalytique";
import { LETTRES_123 } from "../core6e/demontrerAnalytique";
import { champs123Modele, piegeChoix123 } from "../ui6e/formatDemontrerAnalytique";
import { lireExpressionLettres, lirePointLettres, memesValeurs, t } from "../ui6e/outilsLieuxLotH1";

/**
 * Vérification de `6gen123`. Choix fermés (repère, égalité) à une tentative ; champs en lettres LUS
 * avant tout verdict (illisible ou lettre étrangère → `parse_error`, aucune tentative), comparés en
 * cinq jeux de valeurs non entières (toute écriture équivalente acceptée : « (2a+2b)/3 », « 2(a+b)/3 »…).
 * Messages ciblés : division par 2 oubliée (milieu), milieu au lieu du point aux deux tiers, vecteur
 * calculé à l'envers, carré oublié.
 */

type E = Exercice123;
type Ph = Phase123;

function statutChamp(e: E, c: Champ123, saisie: string): StatutVerification {
  const lettres = LETTRES_123[e.support];
  if (c.type === "point") {
    const p = lirePointLettres(saisie, lettres);
    if (!p) return "parse_error";
    return memesValeurs(p[0], c.x, lettres) && memesValeurs(p[1], c.y, lettres) ? "correct" : "not_equivalent";
  }
  const f = lireExpressionLettres(saisie, lettres);
  if (!f) return "parse_error";
  return memesValeurs(f, c.f, lettres) ? "correct" : "not_equivalent";
}

export function diagnostiquer123(e: E, p: Ph, v: string[]): StatutVerification[] {
  if (p === "repere" || p === "egalite") return [v[0] === "0" ? "correct" : "not_equivalent"];
  return champs123Modele(e, p).map((c, i) => statutChamp(e, c, v[i] ?? ""));
}

export function piege123(e: E, p: Ph, v: string[]): Frag[] | null {
  // Jamais de message ciblé sur une réponse juste (ni sur une saisie illisible).
  const st = diagnostiquer123(e, p, v);
  if (st.every((x) => x === "correct") || st.includes("parse_error") && !st.includes("not_equivalent")) return null;
  if (p === "repere" || p === "egalite") return piegeChoix123(e, p, v[0] ?? "");
  const lettres = LETTRES_123[e.support];
  const cs = champs123Modele(e, p);
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i]!;
    const s = v[i] ?? "";
    if (statutChamp(e, c, s) !== "not_equivalent") continue;
    if (c.type === "point") {
      const q = lirePointLettres(s, lettres);
      if (!q) continue;
      const fois = (k: number) => memesValeurs(q[0], (w) => k * c.x(w), lettres) && memesValeurs(q[1], (w) => k * c.y(w), lettres);
      if (fois(2)) return [t(`${c.label} : tu as additionné les coordonnées sans diviser par 2.`)];
      if (fois(-1)) return [t(`${c.label} : les composantes sont de signe opposé — un vecteur se calcule « extrémité moins origine ».`)];
      if (fois(1.5)) return [t(`${c.label} : c'est le milieu ; le point de concours des médianes est aux deux tiers à partir du sommet.`)];
      if (memesValeurs(q[0], c.y, lettres) && memesValeurs(q[1], c.x, lettres)) return [t(`${c.label} : abscisse et ordonnée sont échangées.`)];
      return [t(`${c.label} : vérifie ce calcul avec les coordonnées du repère choisi.`)];
    }
    const f = lireExpressionLettres(s, lettres);
    if (!f) continue;
    if (memesValeurs(f, (w) => Math.sqrt(Math.abs(c.f(w))), lettres)) return [t(`${c.label} : on demande le carré de la longueur, sans racine.`)];
    return [t(`${c.label} : développe et réduis à nouveau, avec les coordonnées du repère choisi.`)];
  }
  return null;
}
