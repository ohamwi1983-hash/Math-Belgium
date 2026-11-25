import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Exercice133, Phase133 } from "../core6e/representerConique";
import { pointsAttendus133 } from "../core6e/representerConique";
import type { Conique } from "../core6e/coniquesLotH1";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { fr, l, memeEnsemble, memePoint, t } from "../ui6e/outilsLieuxLotH1";

/**
 * Vérification de `6gen133` (points placés sur des nœuds du quadrillage, ordre indifférent). Les points
 * sont transmis au moteur d'écrans encodés « x;y » (`encoderPoint`) : un point mal formé n'arrive jamais
 * (l'écran ne valide qu'avec le bon nombre de points). Messages ciblés (jamais sur une réponse juste) :
 * signes du centre, a sur le mauvais axe, foyers aux sommets ou sur l'axe non focal, foyer et directrice à
 * p au lieu de p/2 (ou du mauvais côté), rectangle a × b échangé, points au niveau du foyer à p/2.
 */

type E = Exercice133;
type Ph = Phase133;

export const encoderPoint = (q: P) => `${q.x};${q.y}`;
export function decoderPoint(s: string): P | null {
  const [x, y] = s.split(";").map(Number);
  return Number.isFinite(x) && Number.isFinite(y) ? { x: x!, y: y! } : null;
}
const decoder = (v: string[]) => v.map(decoderPoint).filter((q): q is P => q !== null);

export function diagnostiquer133(e: E, p: Ph, v: string[]): StatutVerification[] {
  const pts = decoder(v);
  if (pts.length !== v.length || pts.length === 0) return ["parse_error"];
  return [memeEnsemble(pts, pointsAttendus133(e, p)) ? "correct" : "not_equivalent"];
}

/** Indices des points faux (ni attendus, ni doublons). */
export function indicesFaux133(e: E, p: Ph, pts: P[]): number[] {
  const att = pointsAttendus133(e, p);
  return pts.map((q, i) => (att.some((a) => memePoint(a, q)) ? -1 : i)).filter((i) => i >= 0);
}

const avec = (e: E, C: Partial<Conique>): E => ({ ...e, C: { ...e.C, ...C } });

export function piege133(e: E, p: Ph, v: string[]): FragmentConsigne[] | null {
  const st = diagnostiquer133(e, p, v);
  if (st[0] !== "not_equivalent") return null;
  const pts = decoder(v);
  const est = (autre: E, q: Ph = p) => memeEnsemble(pts, pointsAttendus133(autre, q));
  const C = e.C;
  const autreAxe = avec(e, { axe: C.axe === "x" ? "y" : "x" });
  switch (p) {
    case "centre":
    case "sommet":
      if (est(avec(e, { h: -C.h, k: -C.k })) || est(avec(e, { h: -C.h })) || est(avec(e, { k: -C.k })))
        return fr([t("Attention aux signes : "), l("(x-h)^2"), t(" donne un centre d'abscisse h ; "), l("(x+3)^2"), t(" donne donc h = −3.")]);
      return null;
    case "sommetsFocaux":
      if (est(autreAxe)) return fr([t("Les sommets sont sur l'axe focal : "), l("a^2"), t(C.nature === "ellipse" ? " est le plus grand dénominateur." : " est sous le carré précédé du signe +.")]);
      if (C.nature === "ellipse" && est(avec(e, { a2: C.b2, b2: C.a2 }))) return fr([t("Tu as reporté b au lieu de a sur l'axe focal.")]);
      return null;
    case "sommetsNonFocaux":
      if (est(avec(e, { a2: C.b2, b2: C.a2 }), "sommetsNonFocaux")) return fr([t("Sur le petit axe, on reporte b, pas a.")]);
      return null;
    case "foyers":
      if (memeEnsemble(pts, pointsAttendus133(e, "sommetsFocaux"))) return fr([t("Ce sont les sommets : les foyers sont à la distance c du centre, avec "), l(C.nature === "ellipse" ? "c^2=a^2-b^2" : "c^2=a^2+b^2"), t(".")]);
      if (est(autreAxe)) return fr([t("Les foyers sont sur l'axe focal.")]);
      return null;
    case "foyer":
      if (est(avec(e, { p: 2 * C.p }))) return fr([t("Le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p : le coefficient de l'équation est 2p.")]);
      if (est(avec(e, { sens: C.sens === 1 ? -1 : 1 }))) return fr([t("Le foyer est du côté de l'ouverture de la parabole : regarde le signe du coefficient 2p.")]);
      return null;
    case "piedDirectrice":
      if (est(avec(e, { p: 2 * C.p }))) return fr([t("La directrice est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p.")]);
      if (est(avec(e, { sens: C.sens === 1 ? -1 : 1 }))) return fr([t("La directrice est du côté opposé au foyer.")]);
      return null;
    case "rectangle":
      if (est(avec(e, { a2: C.b2, b2: C.a2 }))) return fr([t("Le rectangle mesure 2a le long de l'axe focal et 2b le long de l'autre axe : tu les as échangés.")]);
      return null;
    case "cordeFocale":
      {
        const F = pointsAttendus133(e, "foyer")[0]!;
        const dist = pts.map((q) => Math.hypot(q.x - F.x, q.y - F.y));
        if (dist.every((d) => Math.abs(d - C.p / 2) < 1e-9)) return fr([t("Au niveau du foyer, la distance d'un point de la parabole à la directrice vaut p (pas "), l("\\dfrac{p}{2}"), t(") : il est donc à la distance p du foyer.")]);
      }
      return null;
  }
}
