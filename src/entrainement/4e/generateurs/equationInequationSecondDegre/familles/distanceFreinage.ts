/**
 * Couche A — famille "distanceFreinage" (distance d'arrêt en fonction de la vitesse `x`), voie
 * `fonctionDonnee` (`promptrestructurationgenequationinequation.md`) — BUG ACTIF corrigé : cette
 * famille était mal implémentée en voie `modelisation` (contrainte `y + xS = x` jamais expliquée,
 * ET les coefficients `coef`/`dmin` jamais montrés à l'élève nulle part — l'écran "construction"
 * était insoluble par un raisonnement légitime). Ses coefficients (vitesse, formule de freinage)
 * sont des données PHYSIQUES directement communiquées, jamais issues d'une contrainte à 2 variables
 * à éliminer — voir CLAUDE.md, "Restructuration — bug actif, voie fonctionDonnee".
 *
 * **Formule RÉELLE, confirmée par le prompt de restructuration (sol sec, freins normaux)** :
 * `d(x) = x²/10 + x/2` (x = vitesse en km/h, d = distance d'arrêt en m) — FIXE pour toute instance
 * (`fonction = {a: 1/10, b: 1/2, c: 0}`, jamais varié), seuls le seuil `k`/le domaine varient. Le
 * coefficient directeur `1/10` (fraction fixe, jamais entière) est une exception assumée à la
 * convention "propreté entière" — même principe déjà établi pour `materiauCoupe.ts`/
 * `resistancesParallele.ts` (celle-ci ne portant que sur `sommet`/`domaine`/`optimal`/`k`/racines,
 * jamais sur `a`/`b`/`c` eux-mêmes) : ici la fraction est imposée par la formule physique réelle,
 * pas par la génération.
 *
 * `labelVariable` reste `"x"` (même contrainte que `chuteObjet` — voir son en-tête).
 *
 * **Racines de `d(x)=k` — fait STRUCTUREL, pas un effet du domaine** : en choisissant la racine
 * positive `vStar` (MULTIPLE DE 10, garantit `vStar²/10` et `vStar/2` entiers),
 * `k=vStar²/10+vStar/2` est DÉRIVÉ, entier. L'équation multipliée par 10 (`x²+5x-10k=0`) a pour
 * racines `vStar` et `-5-vStar` (somme des racines = -5, fait algébrique de CETTE équation
 * précise) — la seconde racine est donc TOUJOURS strictement négative, quelle que soit l'instance :
 * cette famille produit systématiquement "exactement une racine valide, l'autre rejetée hors
 * domaine" (jamais "les 2 racines valides", contrairement aux autres familles du générateur, qui
 * couvrent déjà ce cas). Documenté explicitement comme un fait mathématique propre à cette
 * famille — pas une régression de la contrainte de génération (section 3 de la spec), satisfaite
 * au niveau du POOL de familles.
 *
 * Le domaine `[0,vmax]` clippe TOUJOURS l'intervalle brut `[-5-vStar,vStar]` au moins du côté
 * négatif (`domaine.inf=0 > -5-vStar`, toujours) — la variante `inequation` satisfait donc elle
 * aussi structurellement "intersection réelle avec le domaine" sur CHAQUE instance, sans tirage
 * supplémentaire nécessaire ; `vmax` est en plus tiré indépendamment de `vStar` pour que le clip
 * côté droit (`vmax<vStar`) apparaisse également sur une partie des instances.
 */
import type {
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../../core/equationInequationSecondDegre.types";
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { formatFonctionNarrativeLatex } from "../../optimisation/formatNarratif";
import { optimumSurDomaine, sommetDansIntervalle } from "../../optimisation/optimum";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "../interpretation";
import { randomInt } from "../aleatoire";

const A = 1 / 10;
const B = 1 / 2;

interface SkinDistanceFreinage {
  phraseEnonce: (a: number, b: number) => string;
}

const SKINS: SkinDistanceFreinage[] = [
  {
    phraseEnonce: (a, b) =>
      `Sur route sèche, avec des freins en bon état, la distance d'arrêt d'une voiture en fonction de sa vitesse x (en km/h) vaut $d(x)=${formatFonctionNarrativeLatex(a, b, 0, "x")}$ (d en m).`,
  },
  {
    phraseEnonce: (a, b) =>
      `Un moniteur d'auto-école explique que, sur route sèche, la distance d'arrêt d'un véhicule suit $d(x)=${formatFonctionNarrativeLatex(a, b, 0, "x")}$, où x est la vitesse (en km/h) et d la distance (en m).`,
  },
];

const V_STAR_MULTIPLE_MIN = 2;
const V_STAR_MULTIPLE_MAX = 12;
const VMAX_MIN = 60;
const VMAX_MAX = 150;

export function construireDistanceFreinage(variante: "equation"): ExerciceEquationSecondDegre;
export function construireDistanceFreinage(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireDistanceFreinage(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const vStar = 10 * randomInt(V_STAR_MULTIPLE_MIN, V_STAR_MULTIPLE_MAX);
  const vmax = randomInt(VMAX_MIN, VMAX_MAX);
  const domaine = { inf: 0, sup: vmax };

  const fonction = { a: A, b: B, c: 0 };
  const sommetX = -B / (2 * A);
  const sommet = { x: sommetX, y: A * sommetX * sommetX + B * sommetX };
  const sommetDansDomaine = sommetDansIntervalle(sommetX, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationFonctionDonnee = {
    variante: "fonctionDonnee",
    famille: "distanceFreinage",
    sens: "min",
    contexte: {
      phraseEnonce: skin.phraseEnonce(A, B),
      labelVariable: "x",
      nomVariable: "la vitesse",
      nomGrandeur: "la distance d'arrêt",
      uniteVariable: "km/h",
      uniteGrandeur: "m",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    optionsInterpretation: [],
  };

  const k = (vStar * vStar) / 10 + vStar / 2;
  const racineNegative = -5 - vStar;

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [racineNegative, vStar];
    const racinesValides = [vStar];
    const racinesRejetees = [racineNegative];
    return {
      variante: "equation",
      famille: "distanceFreinage",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la distance d'arrêt",
        genreGrandeur: "feminin",
        k,
        uniteGrandeur: "m",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la distance d'arrêt",
        genreGrandeur: "feminin",
        uniteVariable: "km/h",
        uniteGrandeur: "m",
        uniteGrandeurFautive: "km/h",
        k,
        racinesValides,
        racinesRejetees,
      }),
    };
  }

  const intervalleBrut = { inf: racineNegative, sup: vStar };
  const intervalleValide = { inf: Math.max(racineNegative, domaine.inf), sup: Math.min(vStar, domaine.sup) };
  return {
    variante: "inequation",
    famille: "distanceFreinage",
    base,
    k,
    voieSysteme: false,
    systeme: null,
    sens: "lt",
    intervalleBrut,
    intervalleValide,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens: "lt",
      labelVariable: "x",
      nomGrandeur: "la distance d'arrêt",
      genreGrandeur: "feminin",
      k,
      uniteGrandeur: "m",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "la distance d'arrêt",
      genreGrandeur: "feminin",
      uniteVariable: "km/h",
      uniteGrandeur: "m",
      uniteGrandeurFautive: "km/h",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}
