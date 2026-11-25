import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { latex, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLireNuage } from "../../core5e/lireNuage";
import { arrondi, classeR, NOM_CLASSE } from "../../core5e/stat2vLotH1";
import { avecRenvoiCours, nL } from "../../ui5e/ecrituresStat2vLotH1";
import { figureCorrige, reponse } from "../../ui5e/formatLireNuage";

/**
 * Corrigé détaillé « comme au tableau » de `5gen76`, une lettre par écran : ce qu'on regarde (allure, sens,
 * écart à la droite), la conclusion, la figure du nuage AVEC sa courbe d'ajustement, un piège.
 */

type E = ExerciceLireNuage;
const t = texte;
const f = latex;
const rT = (r: number) => nL(arrondi(r, 2), 2);

const DESCRIPTION_FORME = {
  affine: "les points restent proches d'un même trait droit : on peut tracer une droite au plus près des points",
  arc: "les points montent puis redescendent (ou l'inverse) en suivant une courbe en arc, comme une parabole",
  decolle: "les points restent presque au même niveau au début, puis montent de plus en plus vite",
  aucune: "les points sont dispersés dans tout le cadre, sans aucune allure régulière",
} as const;

function etapesForme(e: E): EtapeCorrection[] {
  const n = e.nuages[0]!;
  return [
    utilise("a", [t("On regarde l'allure générale du nuage : alignée (fonction affine), en arc (second degré), qui décolle (exponentielle), ou sans forme (aucune relation).")]),
    { ...resultat("a", [t(`Ici, ${DESCRIPTION_FORME[e.forme!]}. `), ...reponse(e, "forme")]), ...(e.forme !== "aucune" ? { figureHtml: figureCorrige(e) } : {}) },
    piege("a", [t("Forcer une droite dans un nuage en arc (ou qui décolle) : la droite passerait loin des points du milieu ou des extrémités.")]),
    utilise("b", [t("On parcourt le nuage de gauche à droite (x augmente) et on suit la hauteur des points.")]),
    resultat("b", reponse(e, "sens")),
    ...(e.forme === "affine" ? [resultat("b", [t("Pour information, le coefficient de corrélation de ces points vaut "), f(`r\\approx${rT(n.r)}`), t(".")], "Remarque")] : []),
  ];
}

function etapesIntensite(e: E): EtapeCorrection[] {
  const r = e.nuages[0]!.r;
  return [
    utilise("a", [t("Nuage qui monte de gauche à droite : corrélation positive ; qui descend : négative (même signe que la covariance et que r).")]),
    resultat("a", reponse(e, "sensCorr")),
    utilise("b", [t("Plus les points sont serrés autour de la droite d'ajustement, plus "), f("|r|"), t(" est proche de 1 : nulle sous 0,35, faible jusqu'à 0,60, moyenne jusqu'à 0,80, forte jusqu'à 0,98, très forte au-delà.")]),
    { ...resultat("b", [t("Les points s'écartent " + (e.intensite === "forte" ? "peu" : e.intensite === "moyenne" ? "nettement" : "beaucoup") + " de la droite : "), ...reponse(e, "intensite")]), figureHtml: figureCorrige(e) },
    piege("b", [t("Juger l'intensité sur la pente de la droite : une droite très inclinée n'indique pas une corrélation plus forte, seul compte l'écart des points à la droite (ici "), f(`r\\approx${rT(r)}`), t(").")]),
  ];
}

function etapesAssocier(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [utilise("a", [t("Le signe de r donne le sens du nuage (il monte : "), f("r>0"), t(" ; il descend : "), f("r<0"), t(") ; "), f("|r|"), t(" donne l'intensité : proche de 1, points serrés autour d'une droite ; proche de 0, aucune tendance.")])];
  e.nuages.forEach((_n, i) => {
    const l = "abcd"[i]!;
    const r = e.valeursR![e.bonnes![i]!]!;
    const sens = Math.abs(r) < 0.2 ? "ne monte ni ne descend nettement" : r > 0 ? "monte" : "descend";
    out.push({ ...resultat(l, [t(`Nuage ${i + 1} : il ${sens}, corrélation ${NOM_CLASSE[classeR(r)]} : `), f(`r=${nL(r, 2)}`), t(".")]), figureHtml: figureCorrige(e, i) });
  });
  out.push(piege("d", [t("Associer les coefficients d'après la pente de la droite : seul compte l'écart des points à la droite (et le sens pour le signe).")]));
  return out;
}

export function correctionDetailleeLireNuage(e: E): EtapeCorrection[] {
  if (e.variante === "forme") return avecRenvoiCours(etapesForme(e), 2);
  if (e.variante === "intensite") return avecRenvoiCours(etapesIntensite(e), (l) => (l === "a" ? 2 : 5));
  return avecRenvoiCours(etapesAssocier(e), 5);
}
