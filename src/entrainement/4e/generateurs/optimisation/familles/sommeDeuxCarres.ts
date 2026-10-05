/**
 * Couche A — famille "sommeDeuxCarres" (variante `modelisation`, spec section 3, famille T "Somme
 * fixe répartie en deux, coût/valeur = somme de deux carrés") : FUSION de deux anciennes familles
 * séparées (`objetCasse`/`materiauCoupe`, corrigée par `promptverificationfusionsmanquantesgen55.md`
 * — la spec ne prévoyait qu'UNE seule famille T, "fusion de l'ancienne famille U"). 2 sous-skins à
 * mécanique numérique distincte (contrairement à `formeParabolique.ts`/`grandeurTemps.ts`, dont les
 * sous-types partagent une même formule générique) — chacun garde son propre constructeur interne,
 * jamais forcé dans un gabarit `PARAMETRES` commun qui masquerait des formules réellement
 * différentes :
 * - `pierre` (ex-`objetCasse`) — objet cassé en 2, valeur ∝ carré de chaque masse, coefficient `k`
 *   IDENTIQUE des deux côtés (`Valeur(x)=k·x²+k·(M-x)²`).
 * - `materiau` (ex-`materiauCoupe`) — matériau coupé en carré + triangle rectangle 3-4-5, aire totale
 *   à coefficients FIXES différents de chaque côté (`Aire(x)=x²/16+(L-x)²/24`, `a=5/48` — seule
 *   fraction non entière de tout ce générateur, documentée dans `construireMateriau` ci-dessous).
 *
 * **Étape "identifier x et y"** (`spec-gen55-optimisation-second-degre.md`, section 4, écran 1) —
 * TOUJOURS présente sur les 2 sous-skins : le piège est un exemple LITTÉRAL de la spec elle-même
 * ("confondre 'le côté du carré' avec 'la longueur du morceau de fil plié en carré'") pour `materiau`,
 * et son analogue pour `pierre` (confondre la masse d'un morceau avec sa valeur, une grandeur ∝
 * masse² DÉRIVÉE, jamais la masse elle-même).
 */
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import { construireIdentificationXY } from "../identification";
import { randomInt } from "../aleatoire";

type TypeSommeDeuxCarres = "pierre" | "materiau";

const TYPES: TypeSommeDeuxCarres[] = ["pierre", "materiau"];

const SKINS_PIERRE = ["un diamant brut", "une émeraude", "un rubis"];
const SKINS_MATERIAU = ["un fil de fer", "une tige métallique", "un ruban métallique rigide"];

const DEMI_MASSE_MIN = 10;
const DEMI_MASSE_MAX = 30;
const K_MIN = 2;
const K_MAX = 6;

/**
 * Domaine = la VRAIE plage de positivité physique (`promptcorrectiondomainereelABTV.md`, corrige
 * `promptcorrectiondomainehardcodeB.md`) — `x>0` ET `y=total-x>0` ⟺ `domaine=[0,total]` (masse ou
 * longueur totale de l'objet/matériau coupé en 2). Le sommet des 2 sous-skins tombe TOUJOURS dans
 * cette plage (pierre : exactement au milieu, `demiMasse=M/2` ; matériau : à 24p sur 60p, toujours
 * strictement entre 0 et L par construction) — `sommetDansDomaine` est donc TOUJOURS `true` sur
 * cette famille, jamais un ratio 75/25 (réservé aux familles `fonctionDonnee`, dont le domaine est
 * narratif et indépendant de la fonction).
 */
function domainePositivite(total: number): { inf: number; sup: number } {
  return { inf: 0, sup: total };
}

/**
 * "Pierre précieuse cassée en 2" (spec pb24, ex-`objetCasse.ts`) : masse totale M FIXE, valeur
 * PROPORTIONNELLE au carré de chaque masse — casser en 2 morceaux ÉGAUX (x=M/2) MINIMISE la valeur
 * totale restante (fonction CONVEXE, x=M/2 en est le sommet/minimum réel). Propreté entière garantie
 * par construction, "cible d'abord" : `M=2·demiMasse` (toujours pair) garantit `x_S=demiMasse`
 * entier ; `k` entier choisi indépendamment (proportionnalité) ; `y_S=2k·demiMasse²`, toujours
 * entier.
 */
function construirePierre(): ExerciceOptimisationModelisation {
  const demiMasse = randomInt(DEMI_MASSE_MIN, DEMI_MASSE_MAX);
  const M = 2 * demiMasse;
  const k = randomInt(K_MIN, K_MAX);

  const fonction = { a: 2 * k, b: -2 * k * M, c: k * M * M };
  const sommet = { x: demiMasse, y: 2 * k * demiMasse * demiMasse };

  const domaine = domainePositivite(M);
  const sommetDansDomaine = sommetDansIntervalle(demiMasse, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const nomObjet = SKINS_PIERRE[randomInt(0, SKINS_PIERRE.length - 1)];

  return {
    variante: "modelisation",
    famille: "sommeDeuxCarres",
    sens: "min",
    contexte: {
      phraseEnonce: `${nomObjet} de ${M} g se brise accidentellement en 2 morceaux. La valeur de chaque morceau est proportionnelle au carré de sa masse (coefficient de proportionnalité ${k} €/g²).`,
      labelVariable: "x",
      nomVariable: "la masse du premier morceau",
      nomGrandeur: "la valeur totale restante",
      genreGrandeur: "feminin",
      uniteVariable: "g",
      uniteGrandeur: "€",
      questionFinale: formatQuestionFinale("min", "la valeur totale restante", "feminin"),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Écran "contrainteEtGrandeur", champ 2 (`prompt-restructuration-architecture-modelisation.md`)
    // — Valeur = k·x²+k·y², k déjà substitué numériquement.
    formuleGrandeurXYTexte: `${k}*x^2+${k}*y^2`,
    formuleSubstitueeTexte: `${k}x² + ${k}(${M}-x)²`,
    contrainte: {
      enonceLatex: `x + y = ${M}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: M,
    },
    texteAideContrainteNiveau1: "Rappel : les deux morceaux proviennent du découpage d'un objet de masse totale fixe.",
    texteAideContrainteNiveau2: `La somme des deux masses x et y est constante, égale à la masse totale de ${M} g donnée dans l'énoncé.`,
    // Champ 2 (grandeur) — règle propre au contexte, jamais une formule géométrique universelle :
    // override nécessaire (voir `core/optimisation.types.ts::texteAideGrandeurNiveau1`).
    texteAideGrandeurNiveau1: `Rappel : la valeur de chaque morceau est proportionnelle au carré de sa masse (coefficient ${k} €/g²), pas à la masse elle-même.`,
    texteAideGrandeurNiveau2: `Additionne la valeur du premier morceau (∝ x²) et celle du second (∝ y²).`,
    // "Identifier x et y" (spec section 4, écran 1) — piège : confondre la MASSE (x/y, ce qu'on
    // cherche) avec la VALEUR de chaque morceau, une grandeur DÉRIVÉE (∝ masse²), pas la masse
    // elle-même.
    identificationXY: construireIdentificationXY(
      "la masse du premier morceau",
      "la masse du second morceau",
      "la valeur du premier morceau",
      "la valeur du second morceau",
    ),
    optionsInterpretation: construireOptionsInterpretation({
      sens: "min",
      nomGrandeur: "la valeur totale restante",
      genreGrandeur: "feminin",
      uniteGrandeur: "€",
      uniteGrandeurFautive: "g",
      labelVariable: "x",
      uniteVariable: "g",
      optimal,
    }),
  };
}

const P_MIN = 1;
const P_MAX = 6;

/**
 * "Matériau coupé en 2" (spec pb33/pb39, ex-`materiauCoupe.ts`) : fil de longueur totale `L` coupé
 * en 2 — le premier, de longueur `x`, plié en CARRÉ (aire `x²/16`) ; le second, de longueur `L-x`,
 * plié en TRIANGLE RECTANGLE 3-4-5 (aire `(L-x)²/24`) — **écart documenté par rapport à la
 * proposition initiale de la spec** (triangle équilatéral/cercle, coefficients IRRATIONNELS √3/4 ou
 * π, cassant la propreté entière du sommet) : le triangle rectangle 3-4-5 élimine ce problème.
 * **Coefficient directeur `a=5/48` — SEULE fraction non entière générée par ce générateur** (ne
 * porte que sur les coefficients intermédiaires `a`/`b`/`c`, jamais sur `sommet`/`domaine`/`optimal`
 * eux-mêmes). Propreté entière garantie par construction, "cible d'abord" : `L=60p` (p entier)
 * donne `x_S=24p`, `y_S=90p²` — `b=-5p`/`c=150p²` également entiers.
 */
function construireMateriau(): ExerciceOptimisationModelisation {
  const p = randomInt(P_MIN, P_MAX);
  const L = 60 * p;
  const xS = 24 * p;
  const yS = 90 * p * p;

  const fonction = { a: 5 / 48, b: -5 * p, c: 150 * p * p };
  const sommet = { x: xS, y: yS };

  const domaine = domainePositivite(L);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const nomMateriau = SKINS_MATERIAU[randomInt(0, SKINS_MATERIAU.length - 1)];

  return {
    variante: "modelisation",
    famille: "sommeDeuxCarres",
    sens: "min",
    contexte: {
      phraseEnonce: `${nomMateriau} de ${L} cm de long doit être coupé en 2 morceaux : le premier sera plié pour former un carré, le second pour former un triangle rectangle dont les côtés restent toujours dans le rapport 3-4-5.`,
      labelVariable: "x",
      nomVariable: "la longueur destinée au carré",
      nomGrandeur: "l'aire totale des 2 formes",
      genreGrandeur: "feminin",
      uniteVariable: "cm",
      uniteGrandeur: "cm²",
      questionFinale: formatQuestionFinale("min", "l'aire totale des 2 formes", "feminin"),
      // Croquis SVG (`prompt-implementation-3-diagrammes-svg.md`) — SEULE `materiau` a des formes
      // géométriques définies (carré + triangle RECTANGLE 3-4-5, jamais équilatéral/cercle, voir
      // en-tête de fichier) ; `pierre` (masse/valeur d'un objet cassé) n'en a aucune, jamais de
      // croquis pour ce sous-skin.
      croquis: { type: "sommeDeuxCarresMateriau" },
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Écran "contrainteEtGrandeur", champ 2 — Aire = x²/16+y²/24 (carré de côté x/4, triangle
    // rectangle 3-4-5 de périmètre y), coefficients FIXES déjà connus, jamais substitués depuis y.
    formuleGrandeurXYTexte: "x^2/16+y^2/24",
    formuleSubstitueeTexte: `x²/16 + (${L}-x)²/24`,
    contrainte: {
      enonceLatex: `x + y = ${L}`,
      lettreCherchee: "y",
      pente: -1,
      ordonnee: L,
    },
    texteAideContrainteNiveau1: "Rappel : les deux morceaux proviennent de la coupe d'un matériau de longueur totale fixe.",
    texteAideContrainteNiveau2: `La somme des deux longueurs x et y est constante, égale à la longueur totale de ${L} cm donnée dans l'énoncé.`,
    // Champ 2 (grandeur) — coefficients fixes propres à ce contexte (carré de côté x/4, triangle
    // rectangle 3-4-5 d'aire proportionnelle à y²), jamais une formule géométrique universelle.
    texteAideGrandeurNiveau1: "Rappel : le carré de côté x/4 a pour aire x²/16 ; le triangle rectangle 3-4-5 de périmètre y a pour aire y²/24 (coefficients fixes, donnés par la forme).",
    texteAideGrandeurNiveau2: "Additionne l'aire du carré (x²/16) et celle du triangle (y²/24).",
    // "Identifier x et y" (spec section 4, écran 1, exemple LITTÉRAL de la spec) — piège : confondre
    // la LONGUEUR de fil allouée à chaque forme (x/y) avec un CÔTÉ de la forme obtenue, une grandeur
    // DÉRIVÉE (côté du carré = x/4, PAS x lui-même).
    identificationXY: construireIdentificationXY(
      "la longueur destinée au carré",
      "la longueur destinée au triangle",
      "le côté du carré",
      "un côté du triangle rectangle",
    ),
    optionsInterpretation: construireOptionsInterpretation({
      sens: "min",
      nomGrandeur: "l'aire totale des 2 formes",
      genreGrandeur: "feminin",
      uniteGrandeur: "cm²",
      uniteGrandeurFautive: "cm",
      labelVariable: "x",
      uniteVariable: "cm",
      optimal,
    }),
  };
}

export function construireSommeDeuxCarres(): ExerciceOptimisationModelisation {
  const type: TypeSommeDeuxCarres = TYPES[randomInt(0, TYPES.length - 1)];
  return type === "pierre" ? construirePierre() : construireMateriau();
}
