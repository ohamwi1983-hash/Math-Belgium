import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice127, Nature127, Phase127 } from "../core6e/natureLieu";
import { elements127, seuil127 } from "../core6e/natureLieu";
import { NOM_NATURE, typeChamp127 } from "../ui6e/formatNatureLieu";
import {
  MESSAGE_APPROCHEE,
  egal,
  estApprochee,
  estDecimalEcrit,
  l,
  lireDroite,
  lireNombreExact,
  lirePoints,
  memeDroite,
  memeEnsemble,
  pointApproche,
  statutDroite,
  statutEnsemblePoints,
  statutNombre,
  statutPoint,
  statutsPaire,
  t,
} from "../ui6e/outilsLieuxLotH1";

/**
 * Vérification de `6gen127`. Nature : choix fermé à une tentative ; message propre à la condition
 * (seuil, somme / différence, k = 1, 4c / 4c²). Éléments : saisie LUE avant tout verdict (illisible →
 * `parse_error`, aucune tentative) ; points en ensemble (ordre libre), droites par proportionnalité
 * (deux droites dans un ordre libre), rayon exact (décimal approché refusé sans tentative). Messages
 * ciblés : sommets du « carré » p ± k, q ± k au lieu du losange, r² pour r, origines sur le mauvais axe.
 */

type E = Exercice127;
type Ph = Phase127;

export function diagnostiquer127(e: E, p: Ph, v: string[]): StatutVerification[] {
  if (p === "nature") return [v[0] === e.nature ? "correct" : "not_equivalent"];
  const el = elements127(e);
  switch (typeChamp127(e.nature)) {
    case "point":
      return [statutPoint(v[0] ?? "", el.point!)];
    case "droite":
      return [statutDroite(v[0] ?? "", el.droites![0]!)];
    case "deuxDroites":
      return statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, el.droites!, memeDroite);
    case "cercle":
      return [statutPoint(v[0] ?? "", el.centre!), statutNombre(v[1] ?? "", Math.sqrt(el.rayon2!))];
    case "points":
      return [statutEnsemblePoints(v[0] ?? "", el.sommets!)];
  }
}

export function approchee127(e: E, p: Ph, v: string[]): string | null {
  if (p !== "elements") return null;
  const el = elements127(e);
  const tc = typeChamp127(e.nature);
  if (tc === "point" && pointApproche(v[0] ?? "", el.point!)) return MESSAGE_APPROCHEE;
  if (tc === "cercle") {
    if (pointApproche(v[0] ?? "", el.centre!)) return MESSAGE_APPROCHEE;
    if (estDecimalEcrit(v[1] ?? "") && estApprochee(lireNombreExact(v[1] ?? ""), Math.sqrt(el.rayon2!))) return MESSAGE_APPROCHEE;
  }
  return null;
}

/** Raison de la nature (message d'un choix faux, corrigé) : propre à la condition. */
export function raisonNature(e: E): Frag[] {
  const c = e.condition;
  const s = seuil127(e);
  switch (c.type) {
    case "sommeCarres":
      return [t("Théorème de la médiane : "), l("PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}"), t(", le seuil vaut "), l(`\\dfrac{AB^2}{2}=${s}`), t(` ; ici k = ${c.k}, ${c.k > s! ? "plus grand : un cercle de centre M" : c.k === s ? "égal : le point M seul" : "plus petit : aucun point (lieu vide)"}.`)];
    case "differenceCarres":
      return [t("En développant "), l("PA^2-PB^2"), t(", les termes "), l("x^2"), t(" et "), l("y^2"), t(" disparaissent : il reste une équation du premier degré, une droite perpendiculaire à (AB).")];
    case "rapport":
      return c.kn === c.kd
        ? [t("PA = PB : ce sont les points équidistants de A et B, la médiatrice de [AB] (le cas k = 1 se traite à part).")]
        : [t("Avec k ≠ 1, l'équation "), l("PA^2=k^2PB^2"), t(" garde "), l("x^2+y^2"), t(" avec le coefficient "), l("1-k^2\\neq 0"), t(" : c'est un cercle (cercle d'Apollonius).")];
    case "absSomme":
      return [t("Une somme de deux valeurs absolues égale à k > 0 donne un losange (borné), dont les sommets annulent une valeur absolue à la fois.")];
    case "absDifference":
      return c.k === 0
        ? [l("|x-p|=|y-q|"), t(" équivaut à "), l("y-q=x-p"), t(" ou "), l("y-q=-(x-p)"), t(" : deux droites sécantes.")]
        : [t("Une différence de valeurs absolues égale à k ≠ 0 donne un lieu non borné : quatre demi-droites.")];
    case "absUne":
      return c.inegalite ? [t("Une inégalité "), l("|A|\\leq k"), t(" garde tous les points entre deux droites parallèles : une bande, bords compris.")] : [t("Une égalité "), l("|A|=k"), t(" se sépare en "), l("A=k"), t(" ou "), l("A=-k"), t(" : deux droites parallèles.")];
    case "distanceDroite":
      return c.inegalite ? [t("Les points à une distance au plus k d'une droite forment une bande de part et d'autre de cette droite.")] : [t("Les points à la distance k d'une droite sont sur deux droites parallèles à celle-ci, une de chaque côté.")];
    case "equidistantSecantes":
      return [t("Les points équidistants de deux droites sécantes sont sur leurs deux bissectrices, qui sont perpendiculaires.")];
    case "equidistantParalleles":
      return [t("Les points équidistants de deux droites parallèles sont sur la droite parallèle située au milieu.")];
    case "sommeParalleles":
      return [t(`Entre les deux droites, la somme des distances vaut toujours l'écart e = ${s} ; à l'extérieur, elle est plus grande. Ici k = ${c.k} : ${c.k < s! ? "aucun point" : c.k === s ? "toute la bande" : "deux droites, une de chaque côté"}.`)];
    case "carreSomme":
      return [t(`Dans le carré, la somme des distances aux quatre côtés vaut toujours 4c = ${s} ; dehors, elle est plus grande. Ici k = ${c.k} : ${c.k < s! ? "aucun point" : c.k === s ? "tout le carré, intérieur compris" : "un octogone autour du carré"}.`)];
    case "carreCarres":
      return [t("La somme des carrés vaut "), l("2P\\Omega^2+4c^2"), t(`, de seuil 4c² = ${s} (et non 4c) ; ici k = ${c.k} : ${c.k < s! ? "aucun point" : c.k === s ? "le point Ω seul" : "un cercle de centre Ω"}.`)];
  }
}

export function piege127(e: E, p: Ph, v: string[]): Frag[] | null {
  // Jamais de message ciblé sur une réponse juste (ni sur une saisie illisible).
  const st = diagnostiquer127(e, p, v);
  if (st.every((x) => x === "correct") || st.includes("parse_error") && !st.includes("not_equivalent")) return null;
  if (p === "nature") {
    if (v[0] === e.nature) return null;
    return [t(`Ce n'est pas ${NOM_NATURE[v[0] as Nature127] ?? "cela"}. `), ...raisonNature(e)];
  }
  const el = elements127(e);
  const c = e.condition;
  switch (typeChamp127(e.nature)) {
    case "points": {
      const pts = lirePoints(v[0] ?? "");
      if (!pts) return null;
      if (c.type === "absSomme") {
        const carre = [
          { x: c.p + c.k, y: c.q + c.k },
          { x: c.p - c.k, y: c.q + c.k },
          { x: c.p - c.k, y: c.q - c.k },
          { x: c.p + c.k, y: c.q - c.k },
        ];
        if (memeEnsemble(pts, carre)) return [t("Ces quatre points (toutes les combinaisons de signes) sont les sommets d'un carré qui ne vérifie pas l'équation : un sommet annule une seule valeur absolue.")];
      }
      if (c.type === "absDifference") {
        const autres = c.k > 0 ? [{ x: c.p, y: c.q + c.k }, { x: c.p, y: c.q - c.k }] : [{ x: c.p - c.k, y: c.q }, { x: c.p + c.k, y: c.q }];
        if (memeEnsemble(pts, autres)) return [t("Les origines sont sur l'autre axe de symétrie : c'est la valeur absolue soustraite qui s'annule aux origines.")];
      }
      if (pts.length !== el.sommets!.length) return [t(`Il en faut exactement ${el.sommets!.length}.`)];
      return null;
    }
    case "cercle": {
      const r = lireNombreExact(v[1] ?? "");
      if (r !== null && !egal(r, Math.sqrt(el.rayon2!)) && egal(r, el.rayon2!)) return [t("C'est "), l("r^2"), t(" : le rayon en est la racine carrée.")];
      return null;
    }
    case "deuxDroites": {
      const st = statutsPaire([v[0] ?? "", v[1] ?? ""], lireDroite, el.droites!, memeDroite);
      if (st.filter((x) => x === "correct").length === 1) return [t("Une seule de tes deux droites est juste : relis l'autre cas ("), l("A=k"), t(" ou "), l("A=-k"), t(").")];
      return null;
    }
    default:
      return null;
  }
}
