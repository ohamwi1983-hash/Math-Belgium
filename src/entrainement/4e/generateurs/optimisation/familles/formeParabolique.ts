/**
 * Couche A — famille "formeParabolique" (variante `fonctionDonnee`, spec section 3, famille C
 * "Forme/trajectoire parabolique") : FUSION de deux anciennes familles séparées (`trajectoire`
 * `archePont`, corrigée par `promptverificationfusionsmanquantesgen55.md` — la spec ne prévoyait
 * qu'UNE seule famille C, "fusion de l'ancienne famille D"). 2 sous-skins à variable distincte,
 * jamais mélangés (colonne "Variable" de la spec : "Temps ou position horizontale") — même principe
 * que `grandeurTemps.ts` (`TypeGrandeurTemps`, méteo/bénéfice) :
 * - `temps` (ex-`trajectoire`) — un objet lancé, hauteur h(t) en fonction du temps t.
 * - `position` (ex-`archePont`) — une forme statique, hauteur h(x) en fonction de la position
 *   horizontale x.
 * Mécanique IDENTIQUE dans les 2 cas (`formeSommet.ts`, sens toujours "max") — seuls les skins et
 * les plages numériques diffèrent (position : marge resserrée par rapport à temps, structures
 * statiques moins "hautes" proportionnellement que des trajectoires de projectiles).
 *
 * **Skins EXCLUS de la banque proposée par la spec, signalés plutôt que réintroduits silencieusement**
 * (`promptverificationfusionsmanquantesgen55.md` demande "tous les skins des deux réunis" mais la
 * spec d'origine en propose une liste plus large, ~22 items) :
 * - "Chute libre d'un objet lâché" — hauteur MONOTONE décroissante dès t=0 (vitesse initiale nulle),
 *   contredit la forme "monte puis descend" que ce générateur suppose partout (le sommet y serait
 *   toujours en bord de domaine, cas dégénéré cassant la pédagogie sommet-dans/hors-domaine).
 * - "Antenne parabolique"/"miroir ou four solaire parabolique" — un vrai réflecteur parabolique est
 *   concave vers le HAUT (un minimum, au foyer), contredit `sens:"max"` fixé pour toute cette
 *   famille (aucune des 2 anciennes familles fusionnées n'avait de variante `sens:"min"`).
 */
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { fonctionDepuisSommet } from "../formeSommet";
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { genererDomaine, optimumSurDomaine } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import { randomInt } from "../aleatoire";

type TypeFormeParabolique = "temps" | "position";

const TYPES: TypeFormeParabolique[] = ["temps", "position"];

/**
 * Chaque skin reçoit désormais aussi `inf`/`sup` (bornes réelles du domaine, tirées par
 * `genererDomaine`) pour justifier narrativement le domaine (`spec-gen55-optimisation-second-degre.md`,
 * section 2 : "domaine justifié dans le texte narratif, pas seulement affiché comme donnée
 * mathématique nue") — chaque skin nomme l'évènement de l'histoire qui correspond à `inf` et à
 * `sup`, jamais une formulation générique unique plaquée sur les 22 skins.
 */
const SKINS_TEMPS = [
  (a: number, b: number, c: number, inf: number, sup: number) => `Un ballon est lancé en l'air ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On filme sa trajectoire entre t=${inf} s (juste après qu'il ait quitté la main) et t=${sup} s (avant qu'il ne retombe au sol).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une fusée à eau est propulsée verticalement ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On l'observe entre t=${inf} s (juste après le décollage) et t=${sup} s (avant la fin de la phase de propulsion visible).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Lors d'un saut, la hauteur h (en m) du sauteur après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le saut est étudié entre t=${inf} s (juste après l'impulsion) et t=${sup} s (juste avant la réception).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un joueur tire au panier ; la hauteur h (en m) du ballon après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On suit le ballon entre t=${inf} s (juste après le tir) et t=${sup} s (avant qu'il n'atteigne le panier ou ne retombe).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un athlète effectue un lancer de poids ; la hauteur h (en m) du poids après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le lancer est suivi entre t=${inf} s (juste après le lâcher) et t=${sup} s (avant que le poids ne touche le sol).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une balle de golf est frappée ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On la suit entre t=${inf} s (juste après l'impact du club) et t=${sup} s (avant qu'elle ne retombe sur le green).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une balle de tennis est frappée en cloche ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On la suit entre t=${inf} s (juste après la frappe) et t=${sup} s (avant qu'elle ne retombe côté adverse).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un plongeur s'élance depuis un plongeoir ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le plongeon est étudié entre t=${inf} s (juste après l'impulsion) et t=${sup} s (juste avant l'entrée dans l'eau).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un frisbee est lancé en l'air ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On le suit entre t=${inf} s (juste après le lancer) et t=${sup} s (avant qu'il ne soit rattrapé ou touche le sol).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Lors d'un smash au volleyball, la hauteur h (en m) du ballon après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On le suit entre t=${inf} s (juste après la frappe) et t=${sup} s (avant qu'il ne touche le sol adverse).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une flèche est tirée à l'arc ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On la suit entre t=${inf} s (juste après le décochage) et t=${sup} s (avant qu'elle n'atteigne la cible).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une fusée de feu d'artifice est tirée ; sa hauteur h (en m) après t secondes, avant l'explosion, vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. On la suit entre t=${inf} s (juste après la mise à feu) et t=${sup} s (juste avant l'explosion).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `L'eau d'une fontaine jaillit dynamiquement ; sa hauteur h (en m) après t secondes vaut $h(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le jet est observé entre t=${inf} s (juste après la mise en route) et t=${sup} s (avant que l'eau ne retombe dans le bassin).`,
];

const SKINS_POSITION = [
  (a: number, b: number, c: number, inf: number, sup: number) => `Un javelot est lancé ; sa hauteur h (en m) à une distance x (en m) du lanceur vaut $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$. Sa trajectoire est étudiée entre x=${inf} m (juste après le lancer) et x=${sup} m (avant qu'il ne touche le sol).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un pont en arc a pour équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) au-dessus de l'eau et x la position horizontale (en m) depuis la rive gauche. Le pont s'étend de x=${inf} m (la rive gauche, premier point d'ancrage) à x=${sup} m (la rive droite, second point d'ancrage).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Une arche décorative a pour équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis son pied gauche. L'arche s'étend de x=${inf} m (son pied gauche) à x=${sup} m (son pied droit).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `L'entrée d'un tunnel parabolique a pour équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis son bord gauche. L'entrée s'étend de x=${inf} m (son bord gauche visible) à x=${sup} m (son bord droit visible).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Le câble d'un pont suspendu a pour équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) au-dessus du tablier et x la position horizontale (en m) depuis le premier pylône. Le câble est tendu entre x=${inf} m (le premier pylône) et x=${sup} m (le second pylône).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un toboggan a la forme d'une glissière incurvée d'équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis son point de départ. Le toboggan s'étend de x=${inf} m (son point de départ, en haut) à x=${sup} m (son point d'arrivée, en bas).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `La voûte d'une grotte artificielle a pour équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis son entrée. La voûte s'étend de x=${inf} m (son entrée) à x=${sup} m (le fond visible de la voûte).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Un dos d'âne (ou un tremplin de ski) a pour profil $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis son bord gauche. On étudie le relief entre son pied, à x=${inf} m, et son autre extrémité visible, à x=${sup} m.`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Le jet d'une fontaine dessine une courbe figée d'équation $h(x)=${formatFonctionNarrativeLatex(a, b, c, "x")}$, où h est la hauteur (en m) et x la position horizontale (en m) depuis la buse. Le jet est visible de x=${inf} m (la buse d'où jaillit l'eau) à x=${sup} m (le point où il retombe dans le bassin).`,
];

interface ParametresType {
  tSMin: number;
  tSMax: number;
  aAbsChoix: number[];
  extraMin: number;
  extraMax: number;
  margeMin: number;
  margeMax: number;
  skins: ((a: number, b: number, c: number, inf: number, sup: number) => string)[];
  labelVariable: string;
  nomVariable: string;
  uniteVariable: string;
  uniteGrandeurFautive: string;
}

const PARAMETRES: Record<TypeFormeParabolique, ParametresType> = {
  temps: {
    tSMin: 4,
    tSMax: 10,
    aAbsChoix: [1, 2, 4, 5],
    extraMin: 5,
    extraMax: 30,
    margeMin: 1,
    margeMax: 3,
    skins: SKINS_TEMPS,
    labelVariable: "t",
    nomVariable: "le temps",
    uniteVariable: "s",
    uniteGrandeurFautive: "s",
  },
  position: {
    tSMin: 4,
    tSMax: 12,
    aAbsChoix: [1, 2],
    extraMin: 3,
    extraMax: 15,
    margeMin: 1,
    margeMax: 3,
    skins: SKINS_POSITION,
    labelVariable: "x",
    nomVariable: "la position horizontale",
    uniteVariable: "m",
    uniteGrandeurFautive: "m²",
  },
};

export function construireFormeParabolique(): ExerciceOptimisationFonctionDonnee {
  const type = TYPES[randomInt(0, TYPES.length - 1)];
  const p = PARAMETRES[type];

  const xS = randomInt(p.tSMin, p.tSMax);
  const aAbs = p.aAbsChoix[randomInt(0, p.aAbsChoix.length - 1)];
  const extra = randomInt(p.extraMin, p.extraMax);
  const hS = aAbs * xS * xS + extra;

  const fonction = fonctionDepuisSommet("max", xS, hS, aAbs);
  const sommet = { x: xS, y: hS };

  const { domaine, sommetDansDomaine } = genererDomaine(xS, 0, p.margeMin, p.margeMax);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = p.skins[randomInt(0, p.skins.length - 1)];

  return {
    variante: "fonctionDonnee",
    famille: "formeParabolique",
    sens: "max",
    contexte: {
      phraseEnonce: skin(fonction.a, fonction.b, fonction.c, domaine.inf, domaine.sup),
      labelVariable: p.labelVariable,
      nomVariable: p.nomVariable,
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteVariable: p.uniteVariable,
      uniteGrandeur: "m",
      questionFinale: formatQuestionFinale("max", "la hauteur", "feminin"),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteGrandeur: "m",
      uniteGrandeurFautive: p.uniteGrandeurFautive,
      labelVariable: p.labelVariable,
      uniteVariable: p.uniteVariable,
      optimal,
    }),
  };
}
