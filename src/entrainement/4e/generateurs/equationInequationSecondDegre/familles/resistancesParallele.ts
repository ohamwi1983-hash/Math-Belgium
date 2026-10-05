/**
 * Couche A — famille F "resistancesParallele" (extension `ca355440-specgen55optimisationseconddegre.md`/
 * `f56fd11e-specgen56equationinequationseconddegre.md`, voir CLAUDE.md) : deux résistances `R1`/`R2`
 * montées en parallèle, dont la SOMME `R1+R2=r` (Ω) est fixée par contrainte de fabrication —
 * `x=R2`, contrainte NON isolée `x+y=r` (`y=R1`, écran "isolement", même mécanique que
 * `chuteObjet`/`remplissageReservoir`) → `y=r-x` ; résistance équivalente
 * `R_total(x) = R1·R2/(R1+R2) = (r-x)·x/r = x - x²/r` (écran "construction").
 *
 * **Premier coefficient directeur FRACTIONNAIRE de ce générateur** (`a=-1/r`, `b=1`, `c=0`) —
 * documenté explicitement comme une exception ASSUMÉE à la convention "propreté entière" (qui ne
 * porte que sur `sommet`/`domaine`/`optimal`, jamais sur les coefficients intermédiaires `a`/`b`/`c`
 * eux-mêmes) — même principe déjà établi par `generateurs/optimisation/familles/materiauCoupe.ts`
 * (gen55, `a=5/48`). `base.sommet`/`.sommetDansDomaine`/`.optimal` ne sont de toute façon JAMAIS
 * surfacés par ce générateur (voir en-tête de `core/equationInequationSecondDegre.types.ts`) — leur
 * propreté n'a donc aucune importance pédagogique, calculés honnêtement mais sans contrainte.
 *
 * **Génération bespoke, PAS `racines.ts::genererDeltaEtDomaine`** — le `delta` choisi aléatoirement
 * par cette primitive partagée (les 4 familles d'origine) est INDÉPENDANT du couple de racines
 * réellement dérivé pour cette famille (`k=x·y/r` n'est clean QUE pour un couple de racines
 * spécifiquement construit, voir ci-dessous), donc `genererDeltaEtDomaine` ne peut pas être réutilisée
 * telle quelle ici — `genererDomaineAvecDeltaImpose` (locale à ce fichier) reproduit EXACTEMENT la
 * même mécanique (ratio large/clip 50/50, marges 1-3) mais accepte `delta` en PARAMÈTRE plutôt que de
 * le tirer lui-même ; `racinesDansDomaine`/`intervalleIntersecte` (`racines.ts`) restent, elles,
 * réutilisées SANS changement (ne dépendent que de `xS`/`delta`/`domaine`, jamais de la façon dont le
 * domaine a été généré).
 *
 * **Propreté entière garantie par construction, "cible d'abord" adaptée** : les 2 racines `x1<x2` de
 * `R_total(x)=k` sont choisies EN PREMIER sous la forme `x1=a1·s·t`/`x2=a2·s·t` (`a1<a2` coprimes,
 * `s=a1+a2`, `t=2u` — TOUJOURS pair, `u` entier libre) — `r=x1+x2=s²·t` et `k=x1·x2/r=t·a1·a2` sont
 * alors GARANTIS entiers (preuve algébrique complète dans `resistancesParallele.test.ts`, vérifiée
 * par tirage massif) ; `xS=r/2=s²·u` et `delta=(x2-x1)/2=(a2-a1)·s·u` sont eux aussi TOUJOURS entiers
 * (le facteur `t` pair l'assure) — jamais l'inverse (tirer `r` au hasard et espérer un `k` propre).
 */
import type {
  ExerciceEquationInequationSecondDegre,
  ExerciceEquationSecondDegre,
  ExerciceInequationSecondDegre,
  VarianteEquationInequationSecondDegre,
} from "../../../core/equationInequationSecondDegre.types";
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../../optimisation/optimum";
import { construireOptionsInterpretationEquationInequation, formatQuestionFinaleEquationInequation } from "../interpretation";
import { intervalleIntersecte, racinesDansDomaine } from "../racines";
import { randomInt } from "../aleatoire";

interface SkinResistancesParallele {
  phraseEnonce: (r: number) => string;
}

const SKINS: SkinResistancesParallele[] = [
  { phraseEnonce: (r) => `Un circuit électronique utilise 2 résistances R1 et R2 montées en parallèle. Une contrainte de fabrication impose R1+R2=${r} Ω.` },
  { phraseEnonce: (r) => `Sur une carte électronique, 2 résistances R1 et R2 en parallèle doivent respecter R1+R2=${r} Ω.` },
  { phraseEnonce: (r) => `Un technicien assemble 2 résistances R1 et R2 en parallèle, dont la somme est fixée à ${r} Ω.` },
];

const COUPLES: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
];
const U_MIN = 1;
const U_MAX = 3;
const MARGE_MIN = 1;
const MARGE_MAX = 3;
const RATIO_CLIP = 0.5;
const X_MIN_POSSIBLE = 0;

/** Réplique EXACTEMENT la mécanique de `racines.ts::genererDeltaEtDomaine` (ratio large/clip 50/50,
 * marges 1-3), mais `delta` est un PARAMÈTRE (déjà dérivé du couple de racines choisi) plutôt qu'un
 * tirage interne — voir en-tête de fichier. */
function genererDomaineAvecDeltaImpose(xS: number, delta: number, xMinPossible: number): { inf: number; sup: number } {
  if (Math.random() >= RATIO_CLIP) {
    const margeGauche = randomInt(MARGE_MIN, MARGE_MAX);
    const margeDroite = randomInt(MARGE_MIN, MARGE_MAX);
    return { inf: Math.max(xMinPossible, xS - delta - margeGauche), sup: xS + delta + margeDroite };
  }
  const decalage = randomInt(1, delta - 1);
  const margeAutreCote = randomInt(MARGE_MIN, MARGE_MAX);
  if (Math.random() < 0.5) {
    return { inf: Math.max(xMinPossible, xS - decalage), sup: xS + delta + margeAutreCote };
  }
  return { inf: Math.max(xMinPossible, xS - delta - margeAutreCote), sup: xS - decalage };
}

export function construireResistancesParallele(variante: "equation"): ExerciceEquationSecondDegre;
export function construireResistancesParallele(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireResistancesParallele(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const [a1, a2] = COUPLES[randomInt(0, COUPLES.length - 1)]!;
  const u = randomInt(U_MIN, U_MAX);
  const t = 2 * u;
  const s = a1 + a2;

  const r = s * s * t;
  const xS = s * s * u;
  const delta = (a2 - a1) * s * u;
  const k = t * a1 * a2;

  const fonction = { a: -1 / r, b: 1, c: 0 };
  const sommet = { x: xS, y: xS - (xS * xS) / r };

  const domaine = genererDomaineAvecDeltaImpose(xS, delta, X_MIN_POSSIBLE);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "resistancesParallele",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(r),
      labelVariable: "x",
      nomVariable: "la résistance R2",
      nomGrandeur: "la résistance équivalente",
      uniteVariable: "Ω",
      uniteGrandeur: "Ω",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // R_total = x·y/r (produit DIVISÉ par r) — le gabarit générique de l'aide partagée
    // `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`) suppose "labelVariable ·
    // (isolé)", sans division : fourni explicitement (bug trouvé,
    // `promptrestructurationgenequationinequation.md`, section 3bis).
    formuleSubstitueeTexte: `x · (${r}-x) / ${r}`,
    contrainte: {
      enonceLatex: `x + y = ${r}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: r,
    },
    // R_total(x,y) = x·y/r, x ET y encore présents (écran "contrainteEtGrandeur", champ 2).
    formuleGrandeurXYTexte: `x*y/${r}`,
    optionsInterpretation: [],
  };

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((v) => !racinesValides.includes(v));
    return {
      variante: "equation",
      famille: "resistancesParallele",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la résistance équivalente",
        genreGrandeur: "feminin",
        k,
        uniteGrandeur: "Ω",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "la résistance équivalente",
        genreGrandeur: "feminin",
        uniteVariable: "Ω",
        uniteGrandeur: "Ω",
        uniteGrandeurFautive: "A",
        k,
        racinesValides,
        racinesRejetees,
      }),
    };
  }

  const intervalleBrut = { inf: xS - delta, sup: xS + delta };
  const intervalleValide = intervalleIntersecte(xS, delta, domaine);
  return {
    variante: "inequation",
    famille: "resistancesParallele",
    base,
    k,
    voieSysteme: false,
    systeme: null,
    sens: "gt",
    intervalleBrut,
    intervalleValide,
    questionFinale: formatQuestionFinaleEquationInequation({
      variante: "inequation",
      sens: "gt",
      labelVariable: "x",
      nomGrandeur: "la résistance équivalente",
      genreGrandeur: "feminin",
      k,
      uniteGrandeur: "Ω",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "la résistance équivalente",
      genreGrandeur: "feminin",
      uniteVariable: "Ω",
      uniteGrandeur: "Ω",
      uniteGrandeurFautive: "A",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}
