import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice132, Phase132 } from "../core6e/lireConique";
import type { Conique } from "../core6e/coniquesLotH1";
import { asymptotes, directriceD, directrices, excentricite, foyers, poly, sommets, val, valP } from "../core6e/coniquesLotH1";
import { bonneOption132 } from "../ui6e/formatLireConique";
import { egal, l, lireDroite, lireNombreExact, lirePoints, memeDroite, memeEnsemble, statutDroite, statutsPaire, t } from "../ui6e/outilsLieuxLotH1";
import { MESSAGE_APPROCHEE, equationProportionnelle, nombreApproche, pointsApproches, statutEquation, statutPoints } from "./saisieConiquesLotH1";

/**
 * Vérification de `6gen132`. Saisie LUE avant tout verdict (illisible → `parse_error`, aucune
 * tentative) ; points dans un ordre libre, valeurs exactes (décimal approché refusé sans tentative) ;
 * droites et équation réduite comparées par proportionnalité. Messages ciblés (jamais sur une réponse
 * juste) : a² pris sous x² au lieu du plus grand dénominateur, sommets du petit axe oubliés ou en trop
 * pour l'hyperbole, c² = a² + b² pour une ellipse (et l'inverse), foyer à p au lieu de p/2, e = a/c,
 * pente a/b au lieu de b/a, équation avec a et b échangés ou 4p au lieu de 2p.
 */

type E = Exercice132;
type Ph = Phase132;

const pts = (C: Conique, f: (C: Conique) => ReturnType<typeof sommets>) => f(C).map(valP);

export function diagnostiquer132(e: E, p: Ph, v: string[]): StatutVerification[] {
  const C = e.C;
  switch (p) {
    case "sommets":
      return [statutPoints(v[0] ?? "", pts(C, sommets))];
    case "foyers":
      return [statutPoints(v[0] ?? "", pts(C, foyers))];
    case "excentricite": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return ["parse_error"];
      return [egal(x, val(excentricite(C))) ? "correct" : "not_equivalent"];
    }
    case "asymptotes":
      return statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, asymptotes(C), memeDroite);
    case "directrice":
      return [statutDroite(v[0] ?? "", directriceD(C, directrices(C)[0]!))];
    case "equation":
      return [statutEquation(v[0] ?? "", poly(C))];
    default:
      return [v[0] === bonneOption132(e, p) ? "correct" : "not_equivalent"];
  }
}

export function approchee132(e: E, p: Ph, v: string[]): string | null {
  if (p === "sommets" && pointsApproches(v[0] ?? "", pts(e.C, sommets))) return MESSAGE_APPROCHEE;
  if (p === "foyers" && pointsApproches(v[0] ?? "", pts(e.C, foyers))) return MESSAGE_APPROCHEE;
  if (p === "excentricite" && nombreApproche(v[0] ?? "", val(excentricite(e.C)))) return MESSAGE_APPROCHEE;
  return null;
}

/** Même conique avec a² et b² échangés (axe focal pris sur la mauvaise variable). */
const echange = (C: Conique): Conique => ({ ...C, axe: C.axe === "x" ? "y" : "x" });

export function piege132(e: E, p: Ph, v: string[]): Frag[] | null {
  const st = diagnostiquer132(e, p, v);
  if (st.every((x) => x === "correct") || (st.includes("parse_error") && !st.includes("not_equivalent"))) return null;
  const C = e.C;
  switch (p) {
    case "nature":
      if (v[0] === "cercle") return [t("Un cercle a une équation "), l("x^2+y^2=r^2"), t(" : ici, ce n'est pas le cas.")];
      if (C.nature === "hyperbole" && v[0] === "ellipse") return [t(e.variante === "figure" ? "Une ellipse est une courbe fermée : ici, la courbe a deux branches." : "Les deux carrés sont soustraits : ce n'est pas une ellipse.")];
      if (C.nature === "ellipse" && v[0] === "hyperbole") return [t(e.variante === "figure" ? "Une hyperbole a deux branches qui ne se referment pas : ici, la courbe est fermée." : "Les deux carrés sont additionnés : ce n'est pas une hyperbole.")];
      if (C.nature === "parabole") return [t("Une seule variable est au carré : c'est la signature d'une parabole.")];
      return [t("Deux variables au carré : ce n'est pas une parabole.")];
    case "axe":
      if (C.nature === "ellipse") return [t("C'est le plus grand dénominateur qui porte "), l("a^2"), t(" et désigne l'axe focal — pas la place de x ou de y.")];
      if (C.nature === "hyperbole") return [t("L'axe focal d'une hyperbole est celui de la variable dont le carré est précédé du signe + : les branches coupent cet axe.")];
      return [t("La variable au carré donne l'axe focal ; le signe de 2p donne le sens d'ouverture.")];
    case "naturePropriete":
      if (v[0] === "ellipse" && C.nature === "parabole") return [t("Seul le miroir parabolique concentre des rayons parallèles en un point : l'ellipse relie un foyer à l'autre.")];
      return [t("Demande-toi si les rayons utiles sont parallèles (parabole) ou relient deux points (ellipse, hyperbole).")];
    case "propriete":
      if (v[0] === "faux") return [t("Piège du cours : aucun miroir elliptique ou hyperbolique ne concentre des rayons parallèles — seul le miroir parabolique le fait, en son unique foyer.")];
      if (v[0] === "parabole") return [t("Cette propriété est celle du miroir parabolique (rayons parallèles à l'axe et foyer) ; ici, la conique a deux foyers.")];
      if (v[0] === "ellipse") return [t("Cette propriété est celle du miroir elliptique : le rayon réfléchi passe vraiment par l'autre foyer.")];
      return [t("Cette propriété est celle du miroir hyperbolique : c'est le prolongement du rayon réfléchi qui passe par l'autre foyer.")];
    case "sommets": {
      const lus = lirePoints(v[0] ?? "");
      if (!lus) return null;
      if (C.nature !== "parabole" && memeEnsemble(lus, pts(echange(C), sommets))) return [t("Tu as placé a sur le mauvais axe : "), l("a^2"), t(" est sous la variable de l'axe focal.")];
      if (C.nature === "ellipse" && lus.length === 2) return [t("Une ellipse a quatre sommets : deux sur chacun de ses axes de symétrie.")];
      if (C.nature === "hyperbole" && lus.length === 4) return [t("Une hyperbole n'a que deux sommets, sur l'axe focal : elle ne coupe pas son axe non focal.")];
      return null;
    }
    case "foyers": {
      const lus = lirePoints(v[0] ?? "");
      if (!lus) return null;
      if (C.nature === "parabole") {
        const loin: Conique = { ...C, p: 2 * C.p };
        if (memeEnsemble(lus, pts(loin, foyers))) return [t("Le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p : 2p est le coefficient de l'équation, p la distance du foyer à la directrice.")];
        const oppose: Conique = { ...C, sens: C.sens === 1 ? -1 : 1 };
        if (memeEnsemble(lus, pts(oppose, foyers))) return [t("Le foyer est du côté de l'ouverture de la parabole.")];
        return null;
      }
      const autre: Conique = C.nature === "ellipse" ? { ...C, nature: "hyperbole" } : { ...C, nature: "ellipse" };
      if ((C.nature === "ellipse" || C.a2 > C.b2) && memeEnsemble(lus, pts(autre, foyers)))
        return C.nature === "ellipse" ? [t("Pour une ellipse, "), l("c^2=a^2-b^2"), t(" (c < a : les foyers sont à l'intérieur).")] : [t("Pour une hyperbole, "), l("c^2=a^2+b^2"), t(" (c > a : les foyers sont au-delà des sommets).")];
      if (memeEnsemble(lus, pts(echange(C), foyers))) return [t("Les foyers sont sur l'axe focal.")];
      return null;
    }
    case "excentricite": {
      const x = lireNombreExact(v[0] ?? "");
      if (x === null) return null;
      const e0 = val(excentricite(C));
      if (egal(x, 1 / e0)) return [t("C'est "), l("\\dfrac{a}{c}"), t(" : l'excentricité est "), l("\\dfrac{c}{a}"), t(", toujours plus petite que 1 pour une ellipse.")];
      if (egal(x, e0 * e0)) return [t("C'est "), l("e^2"), t(" : prends la racine carrée.")];
      return null;
    }
    case "asymptotes": {
      const d = lireDroite(v[0] ?? "");
      if (!d || Math.abs(d.b) < 1e-9) return null;
      const m = Math.abs(d.a / d.b);
      const att = C.axe === "x" ? Math.sqrt(C.b2 / C.a2) : Math.sqrt(C.a2 / C.b2);
      if (!egal(m, att) && egal(m, 1 / att)) return [t("Tu as pris l'inverse de la pente : écris les asymptotes en tenant compte de l'axe focal (rectangle de côtés 2a et 2b).")];
      return null;
    }
    case "directrice": {
      const d = lireDroite(v[0] ?? "");
      if (!d) return null;
      const loin = directriceD({ ...C, p: 2 * C.p }, directrices({ ...C, p: 2 * C.p })[0]!);
      if (memeDroite(d, loin)) return [t("La directrice est à "), l("\\dfrac{p}{2}"), t(" du sommet, pas à p.")];
      const memeCote = directriceD({ ...C, sens: C.sens === 1 ? -1 : 1 }, directrices({ ...C, sens: C.sens === 1 ? -1 : 1 })[0]!);
      if (memeDroite(d, memeCote)) return [t("La directrice est du côté opposé au foyer (la parabole ne la traverse pas).")];
      return null;
    }
    case "equation": {
      const s = v[0] ?? "";
      if (C.nature === "ellipse" && equationProportionnelle(s, poly(echange(C)))) return [t("Les nombres sous "), l("x^2"), t(" et "), l("y^2"), t(" sont échangés : a se lit sur l'axe focal, le plus long.")];
      if (C.nature === "hyperbole" && equationProportionnelle(s, poly(echange(C)))) return [t("Le carré précédé du signe + doit être celui de la variable de l'axe focal (l'axe que coupent les branches).")];
      if (C.nature === "parabole" && equationProportionnelle(s, poly({ ...C, p: 2 * C.p }))) return [t("Le foyer est à "), l("\\dfrac{p}{2}"), t(" du sommet : l'équation s'écrit avec 2p, pas 4p.")];
      if (C.nature === "parabole" && equationProportionnelle(s, poly({ ...C, p: C.p / 2 }))) return [t("La distance du sommet au foyer vaut "), l("\\dfrac{p}{2}"), t(" : p est le double de cette distance.")];
      return null;
    }
  }
}
