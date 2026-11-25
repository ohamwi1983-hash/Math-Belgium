import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice124, Phase124 } from "../core6e/pointsRemarquablesEuler";
import { G124, H124, hauteurC, mediatriceAB } from "../core6e/pointsRemarquablesEuler";
import { estPhasePoint, pointAttendu } from "../ui6e/formatPointsRemarquablesEuler";
import type { D, P } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, droiteNormale, l, lireDroite, lirePoint, memeDroite, memePoint, milieu, pointApproche, statutDroite, statutPoint, t, vec } from "../ui6e/outilsLieuxLotH1";

/**
 * Vérification de `6gen124`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; point comparé exactement, coordonnée décimale approchée d'une fraction refusée sans
 * tentative ; droite : toute équation proportionnelle acceptée (y = mx + p, x = k, ax + by + c = 0).
 * Messages ciblés : somme non divisée par 3, O pris pour la moyenne des sommets, H pris pour G ou O,
 * formule d'Euler mal retenue, médiatrice dirigée par le côté ou ne passant pas par le milieu, hauteur
 * parallèle au côté ou passant par le milieu (médiatrice), N milieu de [OG] ou de [GH].
 */

type E = Exercice124;
type Ph = Phase124;

export function diagnostiquer124(e: E, p: Ph, v: string[]): StatutVerification[] {
  const s = v[0] ?? "";
  if (estPhasePoint(p)) return [statutPoint(s, pointAttendu(e, p))];
  return [statutDroite(s, p === "mediatrice" ? mediatriceAB(e) : hauteurC(e))];
}

export function approchee124(e: E, p: Ph, v: string[]): string | null {
  return estPhasePoint(p) && pointApproche(v[0] ?? "", pointAttendu(e, p)) ? MESSAGE_APPROCHEE : null;
}

export function piege124(e: E, p: Ph, v: string[]): Frag[] | null {
  // Jamais de message ciblé sur une réponse juste (ni sur une saisie illisible).
  const st = diagnostiquer124(e, p, v);
  if (st.every((x) => x === "correct") || st.includes("parse_error") && !st.includes("not_equivalent")) return null;
  const s = v[0] ?? "";
  const G = G124(e);
  const H = H124(e);
  if (estPhasePoint(p)) {
    const x = lirePoint(s);
    if (!x) return null;
    const att = pointAttendu(e, p);
    const somme = { x: e.A.x + e.B.x + e.C.x, y: e.A.y + e.B.y + e.C.y };
    const cand: { P: P; m: Frag[] }[] = [];
    if (p === "G") {
      cand.push({ P: somme, m: [t("Tu as additionné les coordonnées sans diviser par 3 : G est la moyenne des trois sommets.")] });
      cand.push({ P: { x: somme.x / 2, y: somme.y / 2 }, m: [t("Il y a trois sommets : on divise la somme par 3, pas par 2.")] });
    }
    if (p === "O") {
      cand.push({ P: G, m: [t("C'est le centre de gravité (moyenne des sommets) : le centre du cercle circonscrit est l'intersection des médiatrices.")] });
      cand.push({ P: milieu(e.A, e.B), m: [t("C'est le milieu de [AB] : il faut couper la médiatrice de [AB] avec une autre médiatrice.")] });
    }
    if (p === "H") {
      cand.push({ P: G, m: [t("C'est le centre de gravité : l'orthocentre est l'intersection des hauteurs, pas des médianes.")] });
      cand.push({ P: e.O, m: [t("C'est le centre du cercle circonscrit : l'orthocentre est l'intersection des hauteurs, issues des sommets.")] });
      cand.push({ P: { x: somme.x - e.O.x, y: somme.y - e.O.y }, m: [t("Vérifie la relation d'Euler : "), l("\\vec{OH}=3\\,\\vec{OG}"), t(", c'est-à-dire "), l("H=A+B+C-2\\,O"), t(" en coordonnées.")] });
    }
    if (p === "N") {
      cand.push({ P: milieu(e.O, G), m: [t("C'est le milieu de [OG] : le centre du cercle des neuf points est le milieu de [OH].")] });
      cand.push({ P: milieu(G, H), m: [t("C'est le milieu de [GH] : le centre du cercle des neuf points est le milieu de [OH].")] });
      cand.push({ P: G, m: [t("C'est le centre de gravité : N est le milieu de [OH].")] });
    }
    for (const c of cand) if (!memePoint(c.P, att) && memePoint(x, c.P)) return c.m;
    if (memePoint({ x: x.y, y: x.x }, att)) return [t("Tes coordonnées sont inversées : on écrit d'abord l'abscisse, puis l'ordonnée.")];
    return null;
  }
  const d = lireDroite(s);
  if (!d) return null;
  const AB = vec(e.A, e.B);
  if (p === "mediatrice") {
    const M = milieu(e.A, e.B);
    const att = mediatriceAB(e);
    const parallele: D = droiteNormale(M, { x: -AB.y, y: AB.x });
    if (memeDroite(d, parallele)) return [t("Ta droite passe par le milieu de [AB] mais elle est parallèle à (AB) : "), l("\\vec{AB}"), t(" est un vecteur normal de la médiatrice, pas un vecteur directeur.")];
    if (memeDroite(d, droiteNormale(e.A, { x: -AB.y, y: AB.x }))) return [t("C'est la droite (AB) elle-même : la médiatrice lui est perpendiculaire.")];
    if (Math.abs(d.a * att.b - att.a * d.b) < 1e-9) return [t("Ta droite a la bonne direction, mais elle ne passe pas par le milieu M de [AB] : vérifie le terme constant (M doit vérifier l'équation).")];
    return null;
  }
  const att = hauteurC(e);
  if (memeDroite(d, droiteNormale(e.C, { x: -AB.y, y: AB.x }))) return [t("Ta droite passe par C mais elle est parallèle à (AB) : la hauteur est perpendiculaire au côté, "), l("\\vec{AB}"), t(" en est un vecteur normal.")];
  if (memeDroite(d, mediatriceAB(e))) return [t("C'est la médiatrice de [AB] (elle passe par le milieu) : la hauteur issue de C passe par le sommet C.")];
  if (Math.abs(d.a * att.b - att.a * d.b) < 1e-9) return [t("Ta droite a la bonne direction, mais elle ne passe pas par C : vérifie le terme constant.")];
  return null;
}
