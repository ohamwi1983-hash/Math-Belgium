import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLireDomaine, Morceau } from "../../core5e/lireDomaineImage";
import { imageMorceau, valeur } from "../../core5e/lireDomaineImage";
import { ensembleL, intervalle, intervalleL } from "../../moteur5e/ensemblesReels";
import { explication, nb, reponse } from "../../ui5e/formatLireDomaine";
import { figureLireDomaine } from "../../ui5e/figureLireDomaine";

/**
 * Corrigé détaillé « comme au tableau » de `5gen59` (trois écrans de LECTURE, une lettre par écran) :
 * a) le domaine, morceau par morceau (extrémités lues : point plein, point creux, flèche), puis le
 * point retiré ou ajouté ; b) l'image, morceau par morceau (point le plus bas, le plus haut), figure
 * des deux projections ; c) a comparé au domaine, puis f(a) lu s'il existe.
 */

type E = ExerciceLireDomaine;
const t = texte;
const f = latex;
const pt = (x: number, y: number) => `(${nb(x)} ; ${nb(y)})`;
const figurePapier = (svg: string) => `<div style="max-width:8cm;margin:4px auto">${svg.replace(/<svg ([^>]*?)width="([\d.]+)" height="([\d.]+)"/, '<svg $1width="100%" style="height:auto;display:block"')}</div>`;

/** « du point plein (…) » / « d'une flèche… » (départ), « au point creux (…) » / « à une flèche… » (arrivée). */
function extremiteTexte(m: Morceau, cote: "g" | "d"): string {
  const type = cote === "g" ? m.g : m.d;
  const [x, y] = cote === "g" ? m.pts[0]! : m.pts[m.pts.length - 1]!;
  if (type === "fleche") return cote === "g" ? "d'une flèche vers la gauche" : "à une flèche vers la droite";
  return `${cote === "g" ? "du" : "au"} point ${type === "plein" ? "plein" : "creux"} ${pt(x, y)}`;
}

function etapeA(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = e.morceaux.map((m, i) => {
    const g = m.pts[0]![0];
    const d = m.pts.at(-1)![0];
    const iv = intervalle(m.g === "fleche" ? -Infinity : g, m.g === "plein", m.d === "fleche" ? Infinity : d, m.d === "plein");
    const quel = e.morceaux.length > 1 ? (i === 0 ? "morceau de gauche : " : "morceau de droite : ") : "";
    return ligne(`x\\in${intervalleL(iv)}`, `${quel}${extremiteTexte(m, "g")} ${extremiteTexte(m, "d")}`);
  });
  if (e.trou) L.push(ligne(`x\\neq ${e.trou.x}`, `point creux ${pt(e.trou.x, e.trou.y)} à l'intérieur de la courbe${e.deplace ? "" : " : cette abscisse est retirée"}`));
  if (e.deplace) L.push(ligne(`f(${e.deplace.x})=${e.deplace.y}`, `point plein isolé ${pt(e.deplace.x, e.deplace.y)} : l'abscisse ${nb(e.deplace.x)} reste dans le domaine`));
  return [
    utilise("a", [t("Le domaine se lit en projetant la courbe sur l'axe des x (cours, point 1) : un point plein est compris (crochet fermé), un point creux exclu (crochet ouvert), une flèche va jusqu'à l'infini (crochet ouvert).")]),
    calcul("a", L),
    resultat("a", reponse(e, "domaine")),
    piege("a", e.trou && !e.deplace ? [t("Oublier le point creux à l'intérieur de la courbe : son abscisse n'a pas d'image.")] : e.morceaux.length > 1 ? [t("Relier les deux morceaux : la courbe s'interrompt, le domaine est une réunion.")] : [t("Lire le domaine sur l'axe des y, ou mettre un crochet fermé à un point creux.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = e.morceaux.map((m, i) => {
    const ys = m.pts.map((p) => p[1]);
    const bas = Math.min(...ys);
    const haut = Math.max(...ys);
    const pb = m.pts.find((p) => p[1] === bas)!;
    const ph = m.pts.find((p) => p[1] === haut)!;
    const quel = e.morceaux.length > 1 ? (i === 0 ? "morceau de gauche : " : "morceau de droite : ") : "";
    const fl = m.g === "fleche" || m.d === "fleche" ? ", puis les flèches" : "";
    return ligne(`y\\in${ensembleL(imageMorceau(e, m))}`, `${quel}du point le plus bas ${pt(pb[0], pb[1])} au plus haut ${pt(ph[0], ph[1])}${fl}`);
  });
  if (e.deplace) L.push(ligne(`f(${e.deplace.x})=${e.deplace.y}`, `le point plein isolé donne l'ordonnée ${nb(e.deplace.y)}`));
  const res = resultat("b", reponse(e, "image"));
  return [
    utilise("b", [t("L'image se lit en projetant la courbe sur l'axe des y (cours, intro) : toutes les ordonnées atteintes, du point le plus bas au point le plus haut ; mêmes règles pour les crochets.")]),
    calcul("b", L),
    { ...res, figureHtml: figurePapier(figureLireDomaine(e, { projections: true, carreau: 20 })) },
    piege("b", [t("Prendre les ordonnées des extrémités de la courbe : le point le plus bas ou le plus haut peut être un sommet intérieur.")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const v = valeur(e, e.a);
  const L: LigneCalcul[] = [ligne(`${e.a}${e.existe ? "\\in" : "\\notin"}\\operatorname{dom}f`, explication(e))];
  if (v !== null) L.push(ligne(`f(${e.a})=${v}`, `ordonnée du point de la courbe d'abscisse ${nb(e.a)}`));
  return [
    utilise("c", [f("f(a)"), t(" existe si et seulement si "), f("a\\in\\operatorname{dom}f"), t(" : la verticale d'abscisse "), f("a"), t(" rencontre la courbe en un point qui lui appartient.")]),
    calcul("c", L),
    resultat("c", reponse(e, "existence")),
    piege("c", [t("Un point creux n'appartient pas à la courbe ; une valeur hors d'un graphique complet n'a pas d'image.")]),
  ];
}

export function correctionDetailleeLireDomaine(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e)];
}
