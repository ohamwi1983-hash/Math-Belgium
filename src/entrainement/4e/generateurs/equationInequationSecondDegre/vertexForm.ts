/**
 * Couche A — construction générique "forme sommet" (`f(x) = signe·aAbs·(x-xS)² + yS`), PARTAGÉE
 * par les 7 familles de ce générateur (module frère, même principe que `racines.ts`/
 * `interpretation.ts`). Remplace la logique ad hoc jadis dupliquée dans chaque famille
 * (`chuteObjet.ts`, etc., version précédente) par UN SEUL point d'assemblage : chaque famille ne
 * choisit plus que ses paramètres narratifs (`xS`, `aAbs`, `yS`, bornes du domaine, skins) et
 * délègue ici la construction de `fonction`/`k`/`racines*`/`intervalle*`/`questionFinale`/
 * `optionsInterpretation`.
 *
 * "Cible d'abord" (voir `racines.ts`, en-tête) : `xS` choisi EN PREMIER, `delta` tiré par
 * `genererDeltaEtDomaine`, `k` DÉRIVÉ ensuite — jamais l'inverse. En forme sommet, `f(xS±delta) =
 * signe·aAbs·delta² + yS` (par symétrie), donc `k = signe·aAbs·delta² + yS` : propriété algébrique
 * immédiate de la forme sommet, aucun besoin de reconstituer `a,b,c` pour l'obtenir.
 */
import type {
  BaseEquationInequationSecondDegre,
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  FamilleEquationInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../core/equationInequationSecondDegre.types";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "./interpretation";
import { genererDeltaEtDomaine, intervalleIntersecte, racinesDansDomaine } from "./racines";

export interface ParametresVertexForm {
  famille: FamilleEquationInequationSecondDegre;
  /** Abscisse du sommet de la parabole — choisie en premier, entière. */
  xS: number;
  /** `|a|` — amplitude de la parabole, toujours strictement positive. */
  aAbs: number;
  /** `+1` pour une parabole concave (maximum en `xS`, `sens` d'inéquation `"gt"`), `-1` pour une
   * parabole convexe (minimum en `xS`, `sens` `"lt"`). */
  signe: 1 | -1;
  /** Ordonnée du sommet — choisie librement (aucune contrainte "cible d'abord" sur `yS` lui-même,
   * seul `k` doit être dérivé après `delta`). */
  yS: number;
  /** Borne physique minimale de `x` (souvent `0`) — voir `racines.ts`, invariant à la charge de
   * l'appelant (marge d'au moins `DELTA_MAX+MARGE_LARGE_MAX` par rapport à `xS`). */
  xMinPossible: number;
  /** Reçoit les coefficients développés `a,b,c` UNE FOIS calculés ici (depuis `xS`/`aAbs`/`signe`/
   * `yS`) — évite que chaque famille ne duplique elle-même la conversion forme sommet → forme
   * développée juste pour afficher la fonction dans l'énoncé (`formatFonctionNarrativeLatex`). */
  phraseEnonce: (a: number, b: number, c: number) => string;
  labelVariable: string;
  nomVariable: string;
  nomGrandeur: string;
  genreGrandeur: "masculin" | "feminin";
  uniteVariable: string;
  uniteGrandeur: string;
  uniteGrandeurFautive: string;
}

type Constructeur = {
  (variante: "equation"): ExerciceEquationSecondDegre;
  (variante: "inequation"): ExerciceInequationSecondDegre;
};

export function construireDepuisSommet(p: ParametresVertexForm, variante: "equation"): ExerciceEquationSecondDegre;
export function construireDepuisSommet(p: ParametresVertexForm, variante: "inequation"): ExerciceInequationSecondDegre;
export function construireDepuisSommet(p: ParametresVertexForm, variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const a = p.signe * p.aAbs;
  const b = -2 * a * p.xS;
  const c = a * p.xS * p.xS + p.yS;

  const { delta, domaine } = genererDeltaEtDomaine(p.xS, p.xMinPossible);
  const k = a * delta * delta + p.yS;

  const base: BaseEquationInequationSecondDegre = {
    contexte: {
      phraseEnonce: p.phraseEnonce(a, b, c),
      labelVariable: p.labelVariable,
      nomVariable: p.nomVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteVariable: p.uniteVariable,
      uniteGrandeur: p.uniteGrandeur,
      uniteGrandeurFautive: p.uniteGrandeurFautive,
      questionFinale: null,
    },
    fonction: { a, b, c },
    domaine,
  };

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [p.xS - delta, p.xS + delta];
    const racinesValides = racinesDansDomaine(p.xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: p.famille,
      base,
      k,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: p.labelVariable,
        nomGrandeur: p.nomGrandeur,
        genreGrandeur: p.genreGrandeur,
        k,
        uniteGrandeur: p.uniteGrandeur,
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: p.labelVariable,
        nomGrandeur: p.nomGrandeur,
        genreGrandeur: p.genreGrandeur,
        uniteVariable: p.uniteVariable,
        uniteGrandeur: p.uniteGrandeur,
        uniteGrandeurFautive: p.uniteGrandeurFautive,
        k,
        racinesValides,
        racinesRejetees,
      }),
    };
  }

  /** L'intervalle `[xS-delta,xS+delta]` (entre les 2 racines) est TOUJOURS celui que
   * `intervalleIntersecte` calcule, quel que soit le signe — c'est donc TOUJOURS lui qui fixe le
   * sens réellement vrai : pour une parabole concave (`signe:-1`, maximum en xS), cet intervalle
   * est celui où `f(x)>k` (la bosse dépasse le seuil) ; pour une parabole convexe (`signe:+1`,
   * minimum en xS), c'est celui où `f(x)<k` (le creux est en dessous). Inverser cette
   * correspondance contredirait la phrase d'interprétation correcte (ex. "la hauteur dépasse k"
   * pour une parabole concave) — bug trouvé et corrigé en vérification Playwright. */
  const sens: "gt" | "lt" = p.signe === 1 ? "lt" : "gt";
  const intervalleBrut = { inf: p.xS - delta, sup: p.xS + delta };
  const intervalleValide = intervalleIntersecte(p.xS, delta, domaine);
  return {
    variante: "inequation",
    famille: p.famille,
    base,
    k,
    sens,
    intervalleBrut,
    intervalleValide,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens,
      labelVariable: p.labelVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      k,
      uniteGrandeur: p.uniteGrandeur,
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      sens,
      labelVariable: p.labelVariable,
      nomGrandeur: p.nomGrandeur,
      genreGrandeur: p.genreGrandeur,
      uniteVariable: p.uniteVariable,
      uniteGrandeur: p.uniteGrandeur,
      uniteGrandeurFautive: p.uniteGrandeurFautive,
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}

/** Enveloppe une fonction "tire les paramètres narratifs au hasard" (par famille) en un
 * `Constructeur` à la signature attendue par `generateurs/equationInequationSecondDegre/index.ts`
 * — chaque famille appelle `construireAvecParametres(() => ({...tirage aléatoire...}))`. */
export function construireAvecParametres(tirerParametres: () => ParametresVertexForm): Constructeur {
  return ((variante: VarianteEquationInequationSecondDegre) => construireDepuisSommet(tirerParametres(), variante as "equation")) as Constructeur;
}
