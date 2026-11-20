/**
 * Couche A — famille "formeParabolique" (variante `fonctionDonnee`, famille C de la spec), RÉÉCRITE
 * (décision de l'utilisateur, audit 4e ch. 1, G6 : contextes incohérents dans 100 % des tirages —
 * trajectoires suivies « juste après le lancer » à partir de t = 2 à 13 s, smash à 423 m, arches
 * dont le « pied gauche » était en x = 11 et dont les pieds ne touchaient pas le sol). Deux
 * sous-habillages :
 * - `temps` : un objet lancé vers le haut à t = 0 depuis une hauteur h₀ (0 à 10 m), h(t) = −5t² + v·t + h₀
 *   (coefficient physique 5 ≈ g/2, comme l'exemple du cours) ; observation de t = 0 à t = T (objet
 *   encore en l'air). Hauteurs maximales réalistes par objet (6 à 30 m ; fusées et feux d'artifice
 *   jusqu'à 85 m).
 * - `position` : une arche posée au sol, x mesuré depuis son pied gauche : h(x) = a·x·(x − W), pieds en
 *   x = 0 et x = W (h = 0), hauteur |a|·W²/4 de 4 à 18 m et au plus la portée. Un projecteur (une
 *   guirlande, un capteur…) ne peut être fixé qu'entre x = k et le pied droit : domaine [k ; W].
 *
 * **Sommet hors du domaine ≈ 40 %** (décision de l'utilisateur, lot D) : l'observation s'arrête AVANT
 * le sommet (T < t_S) ou la zone de fixation commence APRÈS lui (k > W/2) — jamais un début tardif.
 * Le texte ne le dit jamais (verdict de l'écran « décision »). Toutes les valeurs sont exactes :
 * entières pour `temps`, au plus deux décimales (a = −1/4, −1/2) pour `position`.
 */
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { optimumSurDomaine, sommetDansIntervalle } from "../optimum";
import { construireOptionsInterpretation } from "../interpretation";
import { randomInt } from "../aleatoire";

/** Part des tirages dont le sommet est hors du domaine (lot D). */
export const PART_HORS_DOMAINE_FORME = 0.4;

interface SkinTemps {
  /** Phrase d'introduction, avec la fonction et la fin d'observation. */
  phrase: (fonction: string, h0: number, T: number) => string;
  /** Hauteurs de départ possibles (m). */
  h0: number[];
  /** Instants du sommet possibles (s) : v = 10·t_S. */
  tS: number[];
}

const SKINS_TEMPS: SkinTemps[] = [
  {
    phrase: (f, h0, T) => `Une balle est lancée verticalement vers le haut, d'une hauteur de ${h0} m. Sa hauteur h (en m), t secondes après le lancer, vaut $h(t)=${f}$. Une caméra la filme de t = 0 s (le lancer) à t = ${T} s.`,
    h0: [1, 2],
    tS: [1, 2],
  },
  {
    phrase: (f, _h0, T) => `Une fusée à eau décolle du sol. Sa hauteur h (en m), t secondes après le décollage, vaut $h(t)=${f}$. Un capteur enregistre son altitude de t = 0 s (le décollage) à t = ${T} s.`,
    h0: [0],
    tS: [2, 3],
  },
  {
    phrase: (f, h0, T) => `Une fusée de feu d'artifice est tirée depuis une plateforme de ${h0} m de haut. Sa hauteur h (en m), t secondes après la mise à feu, vaut $h(t)=${f}$. On suit sa montée de t = 0 s (la mise à feu) à t = ${T} s.`,
    h0: [2, 3, 4, 5],
    tS: [3, 4],
  },
  {
    phrase: (f, _h0, T) => `Une balle de golf est frappée en cloche depuis le sol. Sa hauteur h (en m), t secondes après la frappe, vaut $h(t)=${f}$. Un radar la suit de t = 0 s (la frappe) à t = ${T} s.`,
    h0: [0],
    tS: [1, 2],
  },
  {
    phrase: (f, h0, T) => `Depuis un pont situé à ${h0} m au-dessus d'une rivière, on lance un caillou vers le haut. Sa hauteur h (en m) au-dessus de l'eau, t secondes après le lancer, vaut $h(t)=${f}$. On le filme de t = 0 s (le lancer) à t = ${T} s.`,
    h0: [6, 8, 10],
    tS: [1, 2],
  },
  {
    phrase: (f, h0, T) => `Au tennis, une chandelle est frappée à ${h0} m du sol. La hauteur h (en m) de la balle, t secondes après la frappe, vaut $h(t)=${f}$. On l'observe de t = 0 s (la frappe) à t = ${T} s.`,
    h0: [1],
    tS: [1, 2],
  },
];

interface SkinPosition {
  /** Phrase : la structure, sa fonction, puis la zone de fixation [k ; W]. */
  phrase: (fonction: string, W: number, k: number) => string;
  question: string;
  /** Couples (a, W) autorisés : hauteur |a|·W²/4 et rapport hauteur / portée réalistes. */
  formes: { a: number; W: number }[];
}

const FORMES_PETITES = [
  { a: -1, W: 4 },
  { a: -0.5, W: 6 },
  { a: -0.5, W: 8 },
];
const FORMES_GRANDES = [
  { a: -0.25, W: 8 },
  { a: -0.25, W: 12 },
  { a: -0.25, W: 16 },
];

const SKINS_POSITION: SkinPosition[] = [
  {
    phrase: (f, W, k) => `Une arche de jardin, posée sur le sol, a pour profil $h(x)=${f}$, où h est la hauteur (en m) et x la distance horizontale (en m) à son pied gauche ; son pied droit est en x = ${W}. On veut y suspendre une lanterne, sur la partie de l'arche comprise entre x = ${k} m et x = ${W} m.`,
    question: "À quelle hauteur maximale peut-on suspendre la lanterne ?",
    formes: FORMES_PETITES,
  },
  {
    phrase: (f, W, k) => `L'entrée d'un tunnel a la forme d'une parabole posée sur la route : $h(x)=${f}$, où h est la hauteur (en m) et x la distance horizontale (en m) au bord gauche de l'entrée ; le bord droit est en x = ${W}. Un panneau lumineux ne peut être fixé que sur la partie de la voûte comprise entre x = ${k} m et x = ${W} m.`,
    question: "À quelle hauteur maximale peut-on fixer le panneau lumineux ?",
    formes: FORMES_GRANDES,
  },
  {
    phrase: (f, W, k) => `L'arc d'un pont repose sur les deux rives : $h(x)=${f}$, où h est la hauteur (en m) au-dessus de l'eau et x la distance horizontale (en m) à la rive gauche ; la rive droite est en x = ${W}. Un capteur ne peut être installé que sur la portion de l'arc comprise entre x = ${k} m et x = ${W} m.`,
    question: "À quelle hauteur maximale peut-on installer le capteur ?",
    formes: FORMES_GRANDES,
  },
  {
    phrase: (f, W, k) => `Le portail d'une grange a une ouverture en forme de parabole posée au sol : $h(x)=${f}$, où h est la hauteur (en m) et x la distance horizontale (en m) au montant gauche ; le montant droit est en x = ${W}. Une poulie ne peut être accrochée que sur la partie de l'arc comprise entre x = ${k} m et x = ${W} m.`,
    question: "À quelle hauteur maximale peut-on accrocher la poulie ?",
    formes: FORMES_PETITES,
  },
];

function choisir<T>(liste: T[]): T {
  return liste[randomInt(0, liste.length - 1)]!;
}

function construireTemps(hors: boolean): ExerciceOptimisationFonctionDonnee {
  // Hors du domaine : il faut un sommet à t_S ≥ 2 (observation arrêtée à T entre 1 et t_S − 1).
  const candidats = SKINS_TEMPS.filter((s) => !hors || s.tS.some((t) => t >= 2));
  const skin = choisir(candidats);
  const tS = choisir(hors ? skin.tS.filter((t) => t >= 2) : skin.tS);
  const h0 = choisir(skin.h0);
  const fonction = { a: -5, b: 10 * tS, c: h0 };
  const hS = 5 * tS * tS + h0;
  // Dernier instant entier où l'objet est encore en l'air (h ≥ 0).
  let tFin = tS;
  while (-5 * (tFin + 1) ** 2 + 10 * tS * (tFin + 1) + h0 >= 0) tFin++;
  const T = hors ? randomInt(1, tS - 1) : randomInt(tS, Math.max(tS, tFin));
  const domaine = { inf: 0, sup: T };
  const sommet = { x: tS, y: hS };
  const dans = sommetDansIntervalle(tS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, dans);
  return {
    variante: "fonctionDonnee",
    famille: "formeParabolique",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phrase(formatFonctionNarrativeLatex(fonction.a, fonction.b, fonction.c, "t"), h0, T),
      labelVariable: "t",
      nomVariable: "le temps",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteVariable: "s",
      uniteGrandeur: "m",
      questionFinale: "Quelle est la hauteur maximale atteinte pendant l'observation ?",
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine: dans,
    optimal,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteGrandeur: "m",
      uniteGrandeurFautive: "s",
      labelVariable: "t",
      uniteVariable: "s",
      optimal,
    }),
  };
}

function construirePosition(hors: boolean): ExerciceOptimisationFonctionDonnee {
  const skin = choisir(SKINS_POSITION);
  const { a, W } = choisir(skin.formes);
  const demi = W / 2;
  // Zone de fixation [k ; W] : k ≤ W/2 (sommet dedans) ou k > W/2 (sommet avant la zone).
  const k = hors ? randomInt(demi + 1, W - 1) : randomInt(0, demi);
  const fonction = { a, b: -a * W, c: 0 };
  const sommet = { x: demi, y: -a * demi * demi };
  const domaine = { inf: k, sup: W };
  const dans = sommetDansIntervalle(demi, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, dans);
  return {
    variante: "fonctionDonnee",
    famille: "formeParabolique",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phrase(formatFonctionNarrativeLatex(fonction.a, fonction.b, fonction.c, "x"), W, k),
      labelVariable: "x",
      nomVariable: "la position horizontale",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteVariable: "m",
      uniteGrandeur: "m",
      questionFinale: skin.question,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine: dans,
    optimal,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "la hauteur",
      genreGrandeur: "feminin",
      uniteGrandeur: "m",
      uniteGrandeurFautive: "m²",
      labelVariable: "x",
      uniteVariable: "m",
      optimal,
    }),
  };
}

export function construireFormeParabolique(): ExerciceOptimisationFonctionDonnee {
  const hors = Math.random() < PART_HORS_DOMAINE_FORME;
  return Math.random() < 0.5 ? construireTemps(hors) : construirePosition(hors);
}
