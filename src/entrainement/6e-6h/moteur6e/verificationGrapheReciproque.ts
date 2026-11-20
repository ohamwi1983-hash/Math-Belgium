import type { ExerciceGrapheReciproque } from "../core6e/grapheReciproque.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import type { PhaseGrapheReciproque } from "../ui6e/formatGrapheReciproque";
import { domaineF, domaineReciproque, imageF, imageReciproque, lettreReciproque, pointA } from "./modeleGrapheReciproque";
import type { Intervalle } from "./modeleGrapheReciproque";
import { egal, lireNombre } from "./lectureValeurExp";

/**
 * Vérification de `6gen154` : coordonnées et pentes comparées NUMÉRIQUEMENT (fractions, « − »,
 * virgule) ; intervalles lus borne à borne ET crochet par crochet (« [−2 ; 3[ », « ]1;4] », « (1 ; 4] »
 * pour un crochet ouvert) ; champ par champ. Messages ciblés : coordonnées non échangées ou
 * symétrie par l'autre diagonale, domaine et image de f recopiés, crochet retourné, pente de f
 * recopiée, −1/m.
 */

type E = ExerciceGrapheReciproque;
const t = tx;
const l = lx;

/** Intervalle saisi en texte ; `null` = illisible. */
export function lireIntervalle(s: string): Intervalle | null {
  const brut = s.replace(/^[^[\]()]*=/, "").replace(/[−–—]/g, "-").trim();
  const m = /^([[\](])\s*(.+?)\s*([;,])\s*(.+?)\s*([[\])])$/.exec(brut);
  if (!m) return null;
  if (m[3] === "," && (m[2].includes(",") || m[4].includes(","))) return null;
  const g = lireNombre(m[2]);
  const d = lireNombre(m[4]);
  if (g === null || d === null) return null;
  return { g, d, gFerme: m[1] === "[", dFerme: m[5] === "]" };
}

const memeIntervalle = (a: Intervalle, b: Intervalle): boolean => egal(a.g, b.g) && egal(a.d, b.d) && a.gFerme === b.gFerme && a.dFerme === b.dFerme;
const memesBornes = (a: Intervalle, b: Intervalle): boolean => egal(a.g, b.g) && egal(a.d, b.d);

function statutNombre(s: string, attendu: number): StatutVerification {
  const v = lireNombre(s);
  if (v === null) return "parse_error";
  return egal(v, attendu) ? "correct" : "not_equivalent";
}

export function diagnostiquer(e: E, phase: PhaseGrapheReciproque, valeurs: string[]): StatutVerification[] {
  const [a, b] = pointA(e);
  if (phase === "graphe") return [valeurs[0] === lettreReciproque(e) ? "correct" : "not_equivalent"];
  if (phase === "point") return [statutNombre(valeurs[0] ?? "", b), statutNombre(valeurs[1] ?? "", a)];
  if (phase === "pente") return [statutNombre(valeurs[0] ?? "", e.p / e.q), statutNombre(valeurs[1] ?? "", e.q / e.p)];
  return [domaineReciproque(e), imageReciproque(e)].map((iv, i) => {
    const x = lireIntervalle(valeurs[i] ?? "");
    if (!x) return "parse_error";
    return memeIntervalle(x, iv) ? "correct" : "not_equivalent";
  });
}

export function approchee(): string | null {
  return null;
}

export function piege(e: E, phase: PhaseGrapheReciproque, valeurs: string[]): Frag[] | null {
  const [a, b] = pointA(e);
  if (phase === "graphe") return [t("Contrôle le point "), l("A'"), t(" (coordonnées de "), l("A"), t(" échangées) : il doit être sur le graphe de "), l("f^{-1}"), t(".")];
  if (phase === "point") {
    const x = lireNombre(valeurs[0] ?? "");
    const y = lireNombre(valeurs[1] ?? "");
    if (x === null || y === null) return null;
    if (egal(x, a) && egal(y, b)) return [t("Ce sont les coordonnées de "), l("A"), t(" : pour "), l("f^{-1}"), t(", abscisse et ordonnée s'échangent.")];
    if (egal(x, -b) && egal(y, -a)) return [t("Tu as pris le symétrique par rapport à "), l("y=-x"), t(" : c'est la droite "), l("y=x"), t(" qui sert d'axe.")];
    if (egal(x, -a) && egal(y, -b)) return [t("Ni signe à changer : on échange seulement abscisse et ordonnée.")];
    return null;
  }
  if (phase === "pente") {
    const m = lireNombre(valeurs[0] ?? "");
    const r = lireNombre(valeurs[1] ?? "");
    const mf = e.p / e.q;
    if (m !== null && egal(m, e.q / e.p)) return [t("La pente de "), l("f"), t(" se lit "), l("\\dfrac{\\Delta y}{\\Delta x}"), t(" (vertical sur horizontal), pas l'inverse.")];
    if (m !== null && egal(m, -mf)) return [t("Attention au sens : la tangente "), t(mf > 0 ? "monte" : "descend"), t(" de gauche à droite.")];
    if (r !== null && egal(r, mf)) return [t("La symétrie par rapport à "), l("y=x"), t(" échange "), l("\\Delta x"), t(" et "), l("\\Delta y"), t(" : la pente de "), l("f^{-1}"), t(" est l'inverse de celle de "), l("f"), t(".")];
    if (r !== null && egal(r, -1 / mf)) return [t("Pas de signe « − » : ce n'est pas une perpendiculaire, les pentes sont inverses.")];
    return null;
  }
  const dom = lireIntervalle(valeurs[0] ?? "");
  const im = lireIntervalle(valeurs[1] ?? "");
  if (dom && im && memesBornes(dom, domaineF(e)) && memesBornes(im, imageF(e))) return [t("Tu as recopié le domaine et l'image de "), l("f"), t(" : pour "), l("f^{-1}"), t(", ils s'échangent.")];
  if ((dom && memesBornes(dom, domaineReciproque(e)) && !memeIntervalle(dom, domaineReciproque(e))) || (im && memesBornes(im, imageReciproque(e)) && !memeIntervalle(im, imageReciproque(e))))
    return [t("Bonnes bornes, mais un crochet ne va pas : une extrémité exclue (rond vide) le reste après l'échange des axes.")];
  if ((dom && dom.g > dom.d) || (im && im.g > im.d)) return [t("Écris chaque intervalle de la plus petite borne à la plus grande.")];
  return null;
}
