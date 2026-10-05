/**
 * Couche A — famille "grandeurTemps" (variante `fonctionDonnee`, spec section 3, famille G) :
 * grandeur en fonction du temps t, sens `"max"` (même mécanique que `trajectoire`/`archePont`) —
 * 2 sous-skins à échelles numériques distinctes, jamais mélangées : `meteo` (température, t = heure
 * de la journée, 0-24h) et `benefice` (bénéfice d'une entreprise, t = mois depuis le lancement) —
 * chacune choisit ses propres plages pour rester réaliste (une marge de quelques heures n'a pas le
 * même ordre de grandeur qu'une marge de quelques mois), même principe que `aireEnclos.ts`
 * (`TypeCloture` choisi en premier, puis numérique/narratif dérivés du type retenu).
 */
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { fonctionDepuisSommet } from "../formeSommet";
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { genererDomaine, optimumSurDomaine } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import { randomInt } from "../aleatoire";
import type { GenreGrandeur } from "../interpretation";

type TypeGrandeurTemps = "meteo" | "benefice";

const TYPES: TypeGrandeurTemps[] = ["meteo", "benefice"];

/**
 * Domaine justifié narrativement (`spec-gen55-optimisation-second-degre.md`, section 2) — `inf`/`sup`
 * nommés comme la plage horaire couverte par le relevé (météo) ou la période couverte par le bilan
 * comptable (bénéfice), jamais affichés comme $t\in[\text{inf};\text{sup}]$ nu.
 */
const METEO_SKINS = [
  (a: number, b: number, c: number, inf: number, sup: number) => `Un relevé météo indique que la température T (en °C) au cours d'une journée, t heures après minuit, vaut $T(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le relevé n'est disponible qu'entre t=${inf} h et t=${sup} h (la plage horaire couverte par la station ce jour-là).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Dans une station météo, la température T (en °C) au cours d'une journée, t heures après minuit, vaut $T(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Le relevé n'est disponible qu'entre t=${inf} h et t=${sup} h (la plage horaire couverte par la station ce jour-là).`,
];

const BENEFICE_SKINS = [
  (a: number, b: number, c: number, inf: number, sup: number) => `Depuis son lancement, le bénéfice B (en €) d'une entreprise après t mois vaut $B(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Les données ne sont disponibles qu'entre le ${inf}e et le ${sup}e mois suivant le lancement (période couverte par le bilan comptable).`,
  (a: number, b: number, c: number, inf: number, sup: number) => `Depuis son lancement, le bénéfice B (en €) d'une jeune entreprise après t mois vaut $B(t)=${formatFonctionNarrativeLatex(a, b, c, "t")}$. Les données ne sont disponibles qu'entre le ${inf}e et le ${sup}e mois suivant le lancement (période couverte par le bilan comptable).`,
];

const METEO_T_S_MIN = 10;
const METEO_T_S_MAX = 16;
const METEO_A_ABS_CHOIX = [1];
const METEO_H_S_MIN = 20;
const METEO_H_S_MAX = 30;
const METEO_MARGE_MIN = 1;
const METEO_MARGE_MAX = 3;

const BENEFICE_T_S_MIN = 15;
const BENEFICE_T_S_MAX = 30;
const BENEFICE_A_ABS_CHOIX = [1, 2, 3];
const BENEFICE_H_S_MIN = 1000;
const BENEFICE_H_S_MAX = 5000;
const BENEFICE_MARGE_MIN = 3;
const BENEFICE_MARGE_MAX = 8;

interface ParametresType {
  tSMin: number;
  tSMax: number;
  aAbsChoix: number[];
  hSMin: number;
  hSMax: number;
  margeMin: number;
  margeMax: number;
  skins: ((a: number, b: number, c: number, inf: number, sup: number) => string)[];
  nomVariable: string;
  uniteVariable: string;
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteGrandeur: string;
}

const PARAMETRES: Record<TypeGrandeurTemps, ParametresType> = {
  meteo: {
    tSMin: METEO_T_S_MIN,
    tSMax: METEO_T_S_MAX,
    aAbsChoix: METEO_A_ABS_CHOIX,
    hSMin: METEO_H_S_MIN,
    hSMax: METEO_H_S_MAX,
    margeMin: METEO_MARGE_MIN,
    margeMax: METEO_MARGE_MAX,
    skins: METEO_SKINS,
    nomVariable: "l'heure de la journée",
    uniteVariable: "h",
    nomGrandeur: "la température",
    genreGrandeur: "feminin",
    uniteGrandeur: "°C",
  },
  benefice: {
    tSMin: BENEFICE_T_S_MIN,
    tSMax: BENEFICE_T_S_MAX,
    aAbsChoix: BENEFICE_A_ABS_CHOIX,
    hSMin: BENEFICE_H_S_MIN,
    hSMax: BENEFICE_H_S_MAX,
    margeMin: BENEFICE_MARGE_MIN,
    margeMax: BENEFICE_MARGE_MAX,
    skins: BENEFICE_SKINS,
    nomVariable: "le temps depuis le lancement",
    uniteVariable: "mois",
    nomGrandeur: "le bénéfice",
    genreGrandeur: "masculin",
    uniteGrandeur: "€",
  },
};

export function construireGrandeurTemps(): ExerciceOptimisationFonctionDonnee {
  const type = TYPES[randomInt(0, TYPES.length - 1)];
  const p = PARAMETRES[type];

  const tS = randomInt(p.tSMin, p.tSMax);
  const aAbs = p.aAbsChoix[randomInt(0, p.aAbsChoix.length - 1)];
  const hS = randomInt(p.hSMin, p.hSMax);

  const fonction = fonctionDepuisSommet("max", tS, hS, aAbs);
  const sommet = { x: tS, y: hS };

  const { domaine, sommetDansDomaine } = genererDomaine(tS, 0, p.margeMin, p.margeMax);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = p.skins[randomInt(0, p.skins.length - 1)];

  return {
    variante: "fonctionDonnee",
    famille: "grandeurTemps",
    sens: "max",
    contexte: {
      phraseEnonce: skin(fonction.a, fonction.b, fonction.c, domaine.inf, domaine.sup),
      labelVariable: "t",
      nomVariable: p.nomVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteVariable: p.uniteVariable,
      uniteGrandeur: p.uniteGrandeur,
      questionFinale: formatQuestionFinale("max", p.nomGrandeur, p.genreGrandeur),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteGrandeur: p.uniteGrandeur,
      uniteGrandeurFautive: p.uniteVariable,
      labelVariable: "t",
      uniteVariable: p.uniteVariable,
      optimal,
    }),
  };
}
