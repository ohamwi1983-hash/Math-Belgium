/**
 * Couche A — famille S "triangleRectanglePerimetre" (extension `ca355440-specgen55optimisationseconddegre.md`/
 * `f56fd11e-specgen56equationinequationseconddegre.md`, voir CLAUDE.md) : un triangle RECTANGLE a
 * pour cathètes `x`/`y` et pour hypoténuse `h` — la donnée narrative fixe la somme des 2 cathètes
 * `x+y=S` (périmètre moins l'hypoténuse), contrainte NON isolée (écran "isolement", isolement
 * TRIVIAL `y=S-x` mais l'écran reste pédagogiquement requis — même principe que
 * `generateurs/optimisation/familles/objetCasse.ts`, gen55/famille T). Théorème de Pythagore
 * (`x²+y²=h²`, jamais nommé ainsi côté élève avant l'écran "construction", même convention que le
 * reste de la plateforme pour le produit scalaire/Pythagore) substitué : `h²(x) = x²+(S-x)² =
 * 2x²-2Sx+S²` (écran "construction") — même mécanique "somme des carrés" que `objetCasse.ts`
 * (gen55), mais ici le seuil `k` porte sur `h²` (le carré de l'hypoténuse), jamais `h` directement.
 *
 * **`sens="lt"`** — `fonction.a=2>0` (convexe, s'ouvre vers le haut, sommet = MINIMUM réel) : la
 * variante `inequation` demande donc `h²(x)<k`, jamais `>k` (même convention que `distanceFreinage`,
 * seule autre famille convexe de ce générateur).
 *
 * **Propreté entière garantie par construction, "cible d'abord"** : `xS` (le sommet, cas isocèle
 * `x=y=xS`) choisi EN PREMIER, entier ; `S=2·xS` DÉRIVÉ (toujours pair) — `fonction={a:2,b:-2S,c:S²}`
 * a alors des coefficients ENTIERS par construction, donc `genererDeltaEtDomaine` (`racines.ts`,
 * réutilisée telle quelle — même patron que `chuteObjet`/`rectangleDimensions`) garantit `k`
 * (évalué depuis ces coefficients entiers en un point entier) TOUJOURS entier, sans dérivation
 * supplémentaire nécessaire.
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
import { genererDeltaEtDomaine, intervalleIntersecte, racinesDansDomaine } from "../racines";
import { randomInt } from "../aleatoire";

interface SkinTriangleRectanglePerimetre {
  phraseEnonce: (S: number) => string;
}

const SKINS: SkinTriangleRectanglePerimetre[] = [
  { phraseEnonce: (S) => `Une échelle est appuyée contre un mur, formant un triangle rectangle avec le mur et le sol. On sait que la distance au mur et la hauteur atteinte totalisent ${S} m.` },
  { phraseEnonce: (S) => `Un charpentier construit un support triangulaire rectangle pour un toit ; la somme des 2 côtés perpendiculaires du triangle vaut ${S} m.` },
  { phraseEnonce: (S) => `Un cerf-volant est relié au sol par un fil rectiligne, formant un triangle rectangle avec le sol et la verticale sous le cerf-volant ; la somme des 2 côtés perpendiculaires vaut ${S} m.` },
];

const X_S_MIN = 15;
const X_S_MAX = 25;
const X_MIN_POSSIBLE = 1;

export function construireTriangleRectanglePerimetre(variante: "equation"): ExerciceEquationSecondDegre;
export function construireTriangleRectanglePerimetre(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireTriangleRectanglePerimetre(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const S = 2 * xS;

  const fonction = { a: 2, b: -2 * S, c: S * S };
  const sommet = { x: xS, y: 2 * xS * xS };

  const { delta, domaine } = genererDeltaEtDomaine(xS, X_MIN_POSSIBLE);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "triangleRectanglePerimetre",
    sens: "min",
    contexte: {
      phraseEnonce: skin.phraseEnonce(S),
      labelVariable: "x",
      nomVariable: "le premier côté perpendiculaire",
      nomGrandeur: "le carré de l'hypoténuse",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // h² = x²+y² (SOMME DE CARRÉS, jamais un produit) — le gabarit générique de l'aide partagée
    // `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`) suppose un produit "labelVariable ·
    // (isolé)", inapplicable à une somme : fourni explicitement (bug trouvé,
    // `promptrestructurationgenequationinequation.md`, section 3bis).
    formuleSubstitueeTexte: `x² + (${S}-x)²`,
    contrainte: {
      enonceLatex: `x + y = ${S}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: S,
    },
    // h²(x,y) = x²+y² (Pythagore), x ET y encore présents (écran "contrainteEtGrandeur", champ 2).
    formuleGrandeurXYTexte: "x^2+y^2",
    optionsInterpretation: [],
  };

  const k = fonction.a * (xS - delta) * (xS - delta) + fonction.b * (xS - delta) + fonction.c;

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((v) => !racinesValides.includes(v));
    return {
      variante: "equation",
      famille: "triangleRectanglePerimetre",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le carré de l'hypoténuse",
        genreGrandeur: "masculin",
        k,
        uniteGrandeur: "m²",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le carré de l'hypoténuse",
        genreGrandeur: "masculin",
        uniteVariable: "m",
        uniteGrandeur: "m²",
        uniteGrandeurFautive: "m",
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
    famille: "triangleRectanglePerimetre",
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
      nomGrandeur: "le carré de l'hypoténuse",
      genreGrandeur: "masculin",
      k,
      uniteGrandeur: "m²",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "le carré de l'hypoténuse",
      genreGrandeur: "masculin",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      uniteGrandeurFautive: "m",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}
