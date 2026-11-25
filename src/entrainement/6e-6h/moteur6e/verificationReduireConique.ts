import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice134, Phase134 } from "../core6e/reduireConique";
import { polyDonne } from "../core6e/reduireConique";
import type { Conique } from "../core6e/coniquesLotH1";
import { asymptotes, centre, directriceD, directrices, foyers, poly, sommets, valP } from "../core6e/coniquesLotH1";
import { bonneOption134 } from "../ui6e/formatReduireConique";
import { egal, l, lireDroite, lireNombreExact, lirePoint, lirePoints, memeDroite, memeEnsemble, memePoint, statutDroite, statutPoint, statutsPaire, t } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, equationProportionnelle, nombreApproche, pointsApproches, statutEquation, statutPoints } from "./saisieConiquesLotH1";

/**
 * Vérification de `6gen134`. Saisie lue avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; points dans un ordre libre, valeurs exactes (décimal approché refusé sans tentative) ;
 * équation réduite comparée par PROPORTIONNALITÉ au polynôme centré (x′, y′, X, Y lus comme x, y) ;
 * droites par proportionnalité. Messages ciblés, jamais sur une réponse juste : centre aux signes
 * inversés ou coefficient du carré oublié, équation encore écrite dans le repère initial, second membre
 * négatif mal divisé (axe focal inversé), 2p donné pour p (ou p/2), foyer et directrice à p du sommet,
 * asymptotes passant par l'origine au lieu du centre, éléments laissés dans le repère translaté.
 */

type E = Exercice134;
type Ph = Phase134;

const enCentre = (C: Conique): Conique => ({ ...C, h: 0, k: 0 });

export function diagnostiquer134(e: E, p: Ph, v: string[]): StatutVerification[] {
  const C = e.C;
  switch (p) {
    case "centre":
      return [statutPoint(v[0] ?? "", valP(centre(C)))];
    case "reduite":
      return [statutEquation(v[0] ?? "", poly(C, 0, 0))];
    case "nature":
      return [v[0] === bonneOption134(e) ? "correct" : "not_equivalent"];
    case "sommets":
      return [statutPoints(v[0] ?? "", sommets(C).map(valP))];
    case "foyers":
    case "foyer":
      return [statutPoints(v[0] ?? "", foyers(C).map(valP))];
    case "directrices":
      return statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, directrices(C).map((d) => directriceD(C, d)), memeDroite);
    case "directrice":
      return [statutDroite(v[0] ?? "", directriceD(C, directrices(C)[0]!))];
    case "asymptotes":
      return statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, asymptotes(C), memeDroite);
    case "parametre": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return ["parse_error"];
      return [egal(x, C.p) ? "correct" : "not_equivalent"];
    }
  }
}

export function approchee134(e: E, p: Ph, v: string[]): string | null {
  const C = e.C;
  if (p === "centre" && pointsApproches(v[0] ?? "", [valP(centre(C))])) return MESSAGE_APPROCHEE;
  if (p === "sommets" && pointsApproches(v[0] ?? "", sommets(C).map(valP))) return MESSAGE_APPROCHEE;
  if ((p === "foyers" || p === "foyer") && pointsApproches(v[0] ?? "", foyers(C).map(valP))) return MESSAGE_APPROCHEE;
  if (p === "parametre" && nombreApproche(v[0] ?? "", C.p)) return MESSAGE_APPROCHEE;
  return null;
}

export function piege134(e: E, p: Ph, v: string[]): Frag[] | null {
  const st = diagnostiquer134(e, p, v);
  if (st.every((x) => x === "correct") || (st.includes("parse_error") && !st.includes("not_equivalent"))) return null;
  const C = e.C;
  const P = polyDonne(e);
  switch (p) {
    case "centre": {
      const q = lirePoint(v[0] ?? "");
      if (!q) return null;
      if (memePoint(q, { x: -C.h, y: -C.k }) || memePoint(q, { x: -C.h, y: C.k }) || memePoint(q, { x: C.h, y: -C.k })) return [t("Attention aux signes : "), l("(x-h)^2"), t(" s'annule en x = h ; "), l("(x+2)^2"), t(" donne donc h = −2.")];
      const A = P.x2 ?? 0;
      const B = P.y2 ?? 0;
      const sansCoef = { x: A !== 0 ? -(P.x ?? 0) / 2 : C.h, y: B !== 0 ? -(P.y ?? 0) / 2 : C.k };
      if ((A !== 1 || B !== 1) && memePoint(q, sansCoef)) return [t("Mets d'abord le coefficient du carré en évidence : "), l("Ax^2+Dx=A\\left(x^2+\\dfrac{D}{A}x\\right)"), t(".")];
      return null;
    }
    case "reduite": {
      const s = v[0] ?? "";
      if (equationProportionnelle(s, poly(C))) return [t("C'est l'équation dans le repère initial : dans le repère translaté, on remplace x − h par x′ et y − k par y′.")];
      if (C.nature === "hyperbole" && equationProportionnelle(s, poly(enCentre({ ...C, axe: C.axe === "x" ? "y" : "x", a2: C.b2, b2: C.a2 }))))
        return [t("Le second membre était négatif : en divisant par un nombre négatif, les deux signes s'inversent.")];
      if (C.nature === "parabole" && (equationProportionnelle(s, poly(enCentre({ ...C, p: 2 * C.p }))) || equationProportionnelle(s, poly(enCentre({ ...C, p: C.p / 2 })))))
        return [t("Vérifie le coefficient du terme du premier degré : développe ton équation et compare-la à celle de départ.")];
      return null;
    }
    case "nature":
      if (C.nature === "hyperbole" && v[0] === `hyperbole-${C.axe === "x" ? "y" : "x"}`) return [t("L'axe focal d'une hyperbole est celui du carré précédé du signe + dans l'équation réduite (après la division par le second membre).")];
      if (C.nature === "ellipse" && v[0] === `ellipse-${C.axe === "x" ? "y" : "x"}`) return [t("L'axe focal d'une ellipse est celui du plus grand dénominateur.")];
      if (C.nature === "parabole" && v[0]?.startsWith("parabole")) return [t("La variable au carré donne la direction de l'axe focal : y² → axe horizontal, x² → axe vertical.")];
      return [t("Combien de carrés dans l'équation réduite, et quel signe entre eux ?")];
    case "parametre": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return null;
      if (egal(Math.abs(x), 2 * C.p)) return [t("C'est 2p, le coefficient de l'équation réduite : le paramètre p en est la moitié.")];
      if (egal(Math.abs(x), C.p / 2)) return [t("C'est "), l("\\dfrac{p}{2}"), t(", la distance du sommet au foyer : p est la distance du foyer à la directrice.")];
      if (egal(x, -C.p)) return [t("Le paramètre p est une distance : il est positif (le signe du coefficient donne le sens d'ouverture).")];
      return null;
    }
    case "sommets":
    case "foyers":
    case "foyer": {
      const lus = lirePoints(v[0] ?? "");
      if (!lus) return null;
      const f = p === "sommets" ? sommets : foyers;
      if (memeEnsemble(lus, f(enCentre(C)).map(valP))) return [t("Ces coordonnées sont celles du repère translaté : ajoute h aux abscisses et k aux ordonnées pour revenir au repère initial.")];
      if (C.nature === "parabole" && memeEnsemble(lus, foyers({ ...C, p: 2 * C.p }).map(valP))) return [t("Le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p.")];
      if (C.nature !== "parabole" && memeEnsemble(lus, f({ ...C, axe: C.axe === "x" ? "y" : "x" }).map(valP))) return [t("Les sommets et les foyers sont sur l'axe focal (vérifie l'écran de la nature).")];
      if (p === "foyers" && C.nature === "ellipse" && memeEnsemble(lus, foyers({ ...C, nature: "hyperbole" }).map(valP))) return [t("Pour une ellipse, "), l("c^2=a^2-b^2"), t(".")];
      if (p === "foyers" && C.nature === "hyperbole" && C.a2 > C.b2 && memeEnsemble(lus, foyers({ ...C, nature: "ellipse" }).map(valP))) return [t("Pour une hyperbole, "), l("c^2=a^2+b^2"), t(".")];
      return null;
    }
    case "directrice": {
      const d = lireDroite(v[0] ?? "");
      if (!d) return null;
      if (memeDroite(d, directriceD({ ...C, p: 2 * C.p }, directrices({ ...C, p: 2 * C.p })[0]!))) return [t("La directrice est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p.")];
      const inv: Conique = { ...C, sens: C.sens === 1 ? -1 : 1 };
      if (memeDroite(d, directriceD(inv, directrices(inv)[0]!))) return [t("La directrice est du côté opposé au foyer.")];
      return null;
    }
    case "directrices":
    case "asymptotes": {
      const lus = [v[0] ?? "", v[1] ?? ""].map(lireDroite);
      if (lus.some((d) => !d)) return null;
      const centrees = p === "asymptotes" ? asymptotes(enCentre(C)) : directrices(enCentre(C)).map((d) => directriceD(C, d));
      if (lus.every((d) => centrees.some((c) => memeDroite(d!, c)))) return [t(p === "asymptotes" ? "Ces asymptotes passent par l'origine : elles doivent passer par le centre Ω, dans le repère initial." : "Ces directrices sont celles du repère translaté : reviens au repère initial en ajoutant la coordonnée du centre.")];
      return null;
    }
  }
}
