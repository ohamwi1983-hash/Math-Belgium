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
  CroquisEquationInequationSecondDegre,
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  FamilleEquationInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../core/equationInequationSecondDegre.types";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "./interpretation";
import { ECART_MAX_DEPUIS_XS, genererDeltaEtDomaine, intervalleIntersecte, racinesDansDomaine } from "./racines";

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
  /** Voir `core/equationInequationSecondDegre.types.ts::CroquisEquationInequationSecondDegre` —
   * absent pour les familles sans figure géométrique naturelle. */
  croquis?: CroquisEquationInequationSecondDegre;
}

type Constructeur = {
  (variante: "equation"): ExerciceEquationSecondDegre;
  (variante: "inequation"): ExerciceInequationSecondDegre;
};

/**
 * Pour une parabole CONCAVE (`signe:-1`, maximum en `xS`), `f` décroît de part et d'autre du
 * sommet et peut devenir négative loin de `xS` — physiquement absurde pour une grandeur comme une
 * hauteur, une longueur, un rendement ou une population (bug trouvé en vérification manuelle : une
 * hauteur de jet d'eau de -123 m, un rendement ou une distance de saut négatifs). Le pire écart que
 * `genererDeltaEtDomaine` puisse produire entre `xS` et une borne du domaine est `ECART_MAX_DEPUIS_XS`
 * (voir `racines.ts`) — cette fonction DÉRIVE `aAbs` À PARTIR d'un `yS` choisi en premier (réaliste,
 * cf. chaque famille) de sorte que `f` ne descende jamais sous `yS·ratioMinimum` nulle part dans le
 * domaine, garantissant à la fois la positivité ET une grandeur dont l'amplitude de variation reste
 * raisonnable (ni plate, ni absurdement grande). Arrondi par défaut (toujours vers le bas) pour ne
 * jamais affaiblir la garantie après arrondi.
 */
export function deriveAAbsSurDomaine(yS: number, ratioMinimum = 0.5): number {
  const brut = (yS * (1 - ratioMinimum)) / (ECART_MAX_DEPUIS_XS * ECART_MAX_DEPUIS_XS);
  return Math.max(0.01, Math.floor(brut * 100) / 100);
}

/**
 * Symétrique de `deriveAAbsSurDomaine` pour une parabole CONVEXE (`signe:+1`, minimum en `xS`) :
 * `f` ne peut pas devenir négative (elle ne fait que croître de part et d'autre du minimum `yS`),
 * mais elle peut devenir ABSURDEMENT GRANDE loin de `xS` si `aAbs` est trop élevé (bug signalé :
 * une consommation de carburant jusqu'à 249 L/100km, un coût d'entretien jusqu'à 2266 € en bord de
 * domaine). Dérive `aAbs` pour que `f` ne dépasse jamais `plafondRealiste` nulle part dans le
 * domaine. Arrondi vers le bas pour ne jamais affaiblir la garantie après arrondi.
 */
export function deriveAAbsVersPlafond(yS: number, plafondRealiste: number): number {
  const brut = (plafondRealiste - yS) / (ECART_MAX_DEPUIS_XS * ECART_MAX_DEPUIS_XS);
  return Math.max(0.01, Math.floor(brut * 100) / 100);
}

export function construireDepuisSommet(p: ParametresVertexForm, variante: "equation"): ExerciceEquationSecondDegre;
export function construireDepuisSommet(p: ParametresVertexForm, variante: "inequation"): ExerciceInequationSecondDegre;
export function construireDepuisSommet(p: ParametresVertexForm, variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  if (p.signe === -1 && p.yS - p.aAbs * ECART_MAX_DEPUIS_XS * ECART_MAX_DEPUIS_XS <= 0) {
    throw new Error(
      `construireDepuisSommet (${p.famille}) : aAbs trop grand pour yS=${p.yS} — la grandeur deviendrait négative dans le domaine (voir deriveAAbsSurDomaine).`,
    );
  }

  /** `aAbs` peut être décimal (voir `deriveAAbsSurDomaine`) — sans cet arrondi, le bruit de
   * virgule flottante binaire s'affiche tel quel à l'élève (ex. `-11.280000000000001` au lieu de
   * `-11.28`, bug trouvé en vérification manuelle). Arrondi à 1e-6 — assez fin pour ne RIEN changer
   * mathématiquement (`diagnostiquerPoserEquationInequation` tolère `1e-4`, 100× plus large), assez
   * grossier pour effacer le bruit binaire (qui apparaît ~1e-13 à 1e-15). Un arrondi au centième
   * aurait introduit une vraie erreur (jusqu'à ±0.005 par coefficient, cumulée sur `b` ET `c`) qui
   * aurait pu désynchroniser la fonction affichée de `k`/des racines au-delà de la tolérance de
   * vérification — jamais fait cette erreur-là. */
  const arrondir = (n: number) => Math.round(n * 1e6) / 1e6;

  const a = arrondir(p.signe * p.aAbs);
  const b = arrondir(-2 * a * p.xS);
  const c = arrondir(a * p.xS * p.xS + p.yS);

  const { delta, domaine } = genererDeltaEtDomaine(p.xS, p.xMinPossible);
  const k = arrondir(a * delta * delta + p.yS);

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
      croquis: p.croquis,
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
      voieSysteme: false,
      systeme: null,
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
    voieSysteme: false,
    systeme: null,
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
