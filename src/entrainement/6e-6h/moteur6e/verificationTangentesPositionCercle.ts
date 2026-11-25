import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice126, Phase126 } from "../core6e/tangentesPositionCercle";
import { developpee, distance126, r126, tangenteEnT, tangentesExterieur } from "../core6e/tangentesPositionCercle";
import { bonneOption126 } from "../ui6e/formatTangentesPositionCercle";
import {
  MESSAGE_APPROCHEE,
  egal,
  estApprochee,
  estDecimalEcrit,
  l,
  lireDroite,
  lireNombreExact,
  lirePoint,
  memeDroite,
  memePoint,
  nb,
  pointApproche,
  statutDroite,
  statutNombre,
  statutPoint,
  statutsPaire,
  t,
} from "../ui6e/outilsLieuxLotH1";

/**
 * Vérification de `6gen126`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; nombres exacts (√ accepté), décimal approché d'une valeur irrationnelle ou d'une
 * fraction refusé sans tentative ; droites comparées par proportionnalité (y = mx + p, x = k
 * acceptés) ; deux tangentes dans un ordre libre. Messages ciblés : signe du centre, r² pour r, signe
 * de F, valeur absolue ou racine oubliées, rayon (ΩT) pris pour la tangente, ΩP au lieu de PT, une
 * seule tangente juste (la verticale peut manquer — message identique dans tous les cas).
 */

type E = Exercice126;
type Ph = Phase126;

function attenduNombre(e: E, p: Ph): number {
  return p === "distance" ? distance126(e).d : p === "longueur" ? e.pt! : r126(e);
}

export function diagnostiquer126(e: E, p: Ph, v: string[]): StatutVerification[] {
  switch (p) {
    case "centreRayon":
      return [statutPoint(v[0] ?? "", e.O), statutNombre(v[1] ?? "", r126(e))];
    case "centre":
      return [statutPoint(v[0] ?? "", e.O)];
    case "distance":
    case "longueur":
      return [statutNombre(v[0] ?? "", attenduNombre(e, p))];
    case "tangente":
      return [statutDroite(v[0] ?? "", tangenteEnT(e))];
    case "tangentes":
      return statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, tangentesExterieur(e), memeDroite);
    case "position":
      return [v[0] === bonneOption126(e) ? "correct" : "not_equivalent"];
  }
}

export function approchee126(e: E, p: Ph, v: string[]): string | null {
  if (p === "centreRayon") {
    if (pointApproche(v[0] ?? "", e.O)) return MESSAGE_APPROCHEE;
    return estDecimalEcrit(v[1] ?? "") && estApprochee(lireNombreExact(v[1] ?? ""), r126(e)) ? MESSAGE_APPROCHEE : null;
  }
  if (p === "distance" || p === "longueur") return estDecimalEcrit(v[0] ?? "") && estApprochee(lireNombreExact(v[0] ?? ""), attenduNombre(e, p)) ? MESSAGE_APPROCHEE : null;
  return null;
}

export function piege126(e: E, p: Ph, v: string[]): Frag[] | null {
  // Jamais de message ciblé sur une réponse juste (ni sur une saisie illisible).
  const st = diagnostiquer126(e, p, v);
  if (st.every((x) => x === "correct") || st.includes("parse_error") && !st.includes("not_equivalent")) return null;
  switch (p) {
    case "centreRayon":
    case "centre": {
      const c = lirePoint(v[0] ?? "");
      if (c && !memePoint(c, e.O)) {
        if (memePoint(c, { x: -e.O.x, y: -e.O.y }) || memePoint(c, { x: -e.O.x, y: e.O.y }) || memePoint(c, { x: e.O.x, y: -e.O.y }))
          return [t("Attention au signe : "), l("x^2-2px=(x-p)^2-p^2"), t(", le centre a pour abscisse la moitié de l'opposé du coefficient de x.")];
        const { D, E: Ee } = developpee(e);
        if (memePoint(c, { x: -D, y: -Ee }) || memePoint(c, { x: D, y: Ee })) return [t("Le centre est "), l("\\left(-\\dfrac{D}{2}\\,;-\\dfrac{E}{2}\\right)"), t(" : n'oublie pas de diviser par 2.")];
      }
      if (p === "centreRayon") {
        const r = lireNombreExact(v[1] ?? "");
        if (r !== null && !egal(r, r126(e))) {
          if (egal(r, e.r2)) return [t("Le second membre de la forme centre-rayon est "), l("r^2"), t(" : il faut en prendre la racine carrée.")];
          const { F } = developpee(e);
          const faux = e.O.x ** 2 + e.O.y ** 2 + F;
          if (faux > 0 && egal(r, Math.sqrt(faux))) return [t("Attention au signe de la constante : "), l("r^2=p^2+q^2-F"), t(", on soustrait F.")];
        }
      }
      return null;
    }
    case "distance": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return null;
      const { num, norme, d } = distance126(e);
      if (egal(x, -d)) return [t("Une distance est positive : n'oublie pas la valeur absolue au numérateur.")];
      if (norme !== 1 && egal(x, num)) return [t("Tu as oublié de diviser par "), l("\\sqrt{a^2+b^2}"), t(", la norme du vecteur normal.")];
      if (norme !== 1 && egal(x, num / (norme * norme))) return [t("On divise par "), l("\\sqrt{a^2+b^2}"), t(", pas par "), l("a^2+b^2"), t(".")];
      return null;
    }
    case "position":
      if (v[0] === bonneOption126(e)) return null;
      return [t("Compare la distance du centre à la droite et le rayon : "), l(`d(\\Omega\\,;d)=${nb(distance126(e).d)}`), t(" et "), l(`r=${nb(r126(e))}`), t(".")];
    case "tangente": {
      const d = lireDroite(v[0] ?? "");
      if (!d) return null;
      const T = e.T!;
      const n = { x: T.x - e.O.x, y: T.y - e.O.y };
      if (memeDroite(d, { a: -n.y, b: n.x, c: n.y * T.x - n.x * T.y })) return [t("C'est la droite (ΩT), qui porte le rayon : la tangente lui est perpendiculaire en T.")];
      const att = tangenteEnT(e);
      if (Math.abs(d.a * att.b - att.a * d.b) < 1e-9) return [t("Ta droite a la bonne direction, mais elle ne passe pas par T : vérifie le terme constant.")];
      return null;
    }
    case "longueur": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return null;
      const OP2 = (e.P!.x - e.O.x) ** 2 + (e.P!.y - e.O.y) ** 2;
      if (egal(x, Math.sqrt(OP2))) return [t("C'est la distance ΩP : dans le triangle ΩTP rectangle en T, "), l("PT^2=\\Omega P^2-r^2"), t(".")];
      if (egal(x, OP2 - e.r2)) return [t("C'est "), l("PT^2"), t(" : il reste à prendre la racine carrée.")];
      if (egal(x, Math.sqrt(OP2 + e.r2))) return [t("L'hypoténuse du triangle ΩTP rectangle en T est [ΩP] : "), l("PT^2=\\Omega P^2-r^2"), t(", on soustrait.")];
      return null;
    }
    case "tangentes": {
      const st = statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, tangentesExterieur(e), memeDroite);
      if (st.filter((s) => s === "correct").length === 1)
        return [t("Une seule de tes deux droites est tangente. Pour l'autre, la distance du centre à la droite doit valoir r — et une tangente peut être verticale ("), l("x=k"), t(", sans pente).")];
      return null;
    }
  }
}

