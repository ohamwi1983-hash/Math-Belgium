import type { ExerciceLireDomaine } from "../core5e/lireDomaineImage";
import { aDesFleches, domaine, image } from "../core5e/lireDomaineImage";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseLireDomaine } from "../ui5e/formatLireDomaine";
import { explication } from "../ui5e/formatLireDomaine";
import type { Ensemble } from "./ensemblesReels";
import { egaux, lireEnsemble, memesBornes } from "./ensemblesReels";

/**
 * Vérification de `5gen59`. Les ensembles saisis sont LUS avant tout verdict (`lireEnsemble` :
 * crochets, ∪, ±∞, ℝ, ℝ \ {a}, « − – — ») puis comparés borne à borne ET crochet par crochet à
 * l'ensemble lu sur le graphe (toute écriture juste est acceptée : réunion dans le désordre,
 * intervalles accolés, ℝ \ {a}). Un crochet fermé du côté de ∞ est faux (message ciblé).
 */

type E = ExerciceLireDomaine;

function attendu(e: E, p: PhaseLireDomaine): Ensemble {
  return p === "domaine" ? domaine(e) : image(e);
}

export function diagnostiquer(e: E, p: PhaseLireDomaine, valeurs: string[]): StatutVerification[] {
  if (p === "existence") return [(valeurs[0] === "existe") === e.existe ? "correct" : "not_equivalent"];
  const l = lireEnsemble(valeurs[0] ?? "");
  if (!l) return ["parse_error"];
  return [l.defauts.length === 0 && egaux(l.ensemble, attendu(e, p)) ? "correct" : "not_equivalent"];
}

const borne = (ens: Ensemble, cote: "g" | "d") => (cote === "g" ? ens[0]?.g : ens[ens.length - 1]?.d);

export function piege(e: E, p: PhaseLireDomaine, valeurs: string[]): Frag[] | null {
  if (p === "existence") return [tx(explication(e))];
  const l = lireEnsemble(valeurs[0] ?? "");
  if (!l) return null;
  const s = l.ensemble;
  const bon = attendu(e, p);
  const autre = p === "domaine" ? image(e) : domaine(e);
  if (l.defauts.includes("infiniFerme")) return [tx("Du côté de "), lx("\\infty"), tx(", le crochet est toujours ouvert : on n'atteint jamais l'infini.")];
  if (l.defauts.includes("aLEnvers")) return [tx("Écris chaque intervalle de gauche à droite : la plus petite borne d'abord.")];
  if (egaux(s, autre) && !egaux(autre, bon)) return p === "domaine" ? [tx("Tu as lu les ordonnées : le domaine se lit sur l'axe des x (projection verticale de la courbe).")] : [tx("Tu as lu les abscisses : l'image se lit sur l'axe des y (projection horizontale de la courbe).")];
  if (memesBornes(s, bon)) return [tx("Les bornes sont justes ; revois les crochets : un point plein est compris (crochet fermé), un point creux est exclu (crochet ouvert).")];
  const infiniAttendu = !Number.isFinite(borne(bon, "g")!) || !Number.isFinite(borne(bon, "d")!);
  const infiniSaisi = s.length > 0 && (!Number.isFinite(borne(s, "g")!) || !Number.isFinite(borne(s, "d")!));
  if (infiniAttendu && !infiniSaisi) return p === "domaine" ? [tx("Une flèche indique que la courbe continue indéfiniment : de ce côté, la borne est infinie.")] : [tx("Une flèche qui monte (ou descend) sans fin envoie les ordonnées jusqu'à l'infini.")];
  if (!infiniAttendu && infiniSaisi) return aDesFleches(e) ? [tx("Une flèche horizontale garde la même ordonnée : elle n'envoie pas l'image à l'infini.")] : [tx("Le graphique est complet : la courbe s'arrête là où elle s'arrête, aucune borne n'est infinie.")];
  if (p === "domaine" && s.length < bon.length) return e.trou && !e.deplace ? [tx("Un point creux à l'intérieur de la courbe retire cette abscisse du domaine.")] : [tx("La courbe s'interrompt : le domaine est une réunion d'intervalles.")];
  if (p === "image") {
    const bouts = e.morceaux.flatMap((m) => [m.pts[0]![1], m.pts.at(-1)![1]]);
    const ys = e.morceaux.flatMap((m) => m.pts.map((q) => q[1]));
    if (s.length === 1 && Number.isFinite(s[0]!.g) && Number.isFinite(s[0]!.d) && bouts.includes(s[0]!.g) && bouts.includes(s[0]!.d) && (s[0]!.g > Math.min(...ys) || s[0]!.d < Math.max(...ys)))
      return [tx("Les extrémités de la courbe ne sont pas forcément ses points les plus bas et les plus hauts : regarde tous les sommets.")];
  }
  return null;
}
