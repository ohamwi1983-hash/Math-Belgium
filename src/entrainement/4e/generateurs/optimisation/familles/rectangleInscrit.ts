/**
 * Couche A — famille "rectangleInscrit" (variante `modelisation`, spec, famille V, confirmée par le
 * manuel Actimath 4 UAA5, pb36) : un rectangle est inscrit dans un triangle isocèle de base `base`
 * et de hauteur `hauteur`, son côté sur la base du triangle. Sa largeur `x` et sa hauteur `y` sont
 * liées par une PROPORTION GÉOMÉTRIQUE (triangles semblables) — PAS un isolement algébrique
 * classique comme les autres familles : à hauteur `y` depuis la base, la largeur disponible du
 * triangle vaut `base·(1-y/hauteur)` ; poser cette largeur égale à `x` donne la relation non isolée
 * `hauteur·x + base·y = hauteur·base` (forme "à l'origine" — `x/base + y/hauteur = 1`), isolée en
 * `y = hauteur - (hauteur/base)·x`. Aire(x) = x·y — MAXIMISÉE au sommet.
 *
 * **Piège pédagogique propre à cette famille (note explicite de la spec)** : l'écran
 * "contrainteEtGrandeur" (champ 1) repose ici sur la RECONNAISSANCE DE LA BONNE PROPORTION
 * (triangles semblables), pas sur une manipulation algébrique d'une équation déjà posée — d'où
 * `texteAideContrainteNiveau1`/`2` fournis explicitement ci-dessous (jamais le repli générique de
 * `ui/formatOptimisation.ts`, pensé pour A/B/T).
 *
 * **Propreté entière garantie par construction, "cible d'abord"** : `hauteur=h0·base` (h0 entier)
 * donne `a=-h0`/`b=h0·base` toujours entiers ; `base=2·demiBase` (demiBase entier) garantit
 * `x_S=demiBase` entier ; `y_S=Aire(demiBase)=h0·demiBase²`, toujours entier.
 *
 * **Domaine = la VRAIE plage de positivité physique** (`promptcorrectiondomainereelABTV.md`, corrige
 * `promptcorrectiondomainehardcodeB.md`) — `x>0` ET `y=hauteur-h0·x>0 ⟺ x<base` → `domaine=[0,base]`.
 * Le sommet `x_S=demiBase=base/2` tombe TOUJOURS exactement au milieu de cette plage (produit de 2
 * quantités complémentaires positives) — `sommetDansDomaine` est donc TOUJOURS `true` sur cette
 * famille, jamais un ratio 75/25 (réservé aux familles `fonctionDonnee`, dont le domaine est
 * narratif et indépendant de la fonction).
 *
 * **Identification x/y — écran à part entière** (`prompt-restructuration-architecture-
 * modelisation.md`, applicable à A/B/T/V désormais uniformément) — `phraseEnonce` ne nomme PLUS x/y
 * littéralement (revient sur un correctif précédent, `prompt-groupe-corrections-gen55.md` point 1,
 * qui nommait x/y directement dans le texte FAUTE d'écran dédié à l'époque — rendu obsolète et
 * contre-productif maintenant qu'un vrai écran d'identification existe : nommer x/y dans le texte
 * rendrait cet écran trivial). Distracteurs : la base/la hauteur DU TRIANGLE (données du problème,
 * jamais ce que x/y désignent — le rectangle a ses PROPRES largeur/hauteur, distinctes de celles du
 * triangle qui le contient). Un seul jeu de rôles x=largeur/y=hauteur pour les 3 skins (`SKINS`
 * ci-dessous ne sont que des habillages narratifs du MÊME triangle isocèle, jamais 2 configurations
 * géométriques distinctes — vérifié dans le code, pas supposé).
 */
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import { construireIdentificationXY } from "../identification";
import { randomInt } from "../aleatoire";

interface SkinRectangleInscrit {
  nomForme: string;
}

const SKINS: SkinRectangleInscrit[] = [
  { nomForme: "un panneau publicitaire triangulaire" },
  { nomForme: "la voile triangulaire d'une planche à voile" },
  { nomForme: "un pignon de toit triangulaire" },
];

const DEMI_BASE_MIN = 8;
const DEMI_BASE_MAX = 20;
const H0_MIN = 2;
const H0_MAX = 6;

export function construireRectangleInscrit(): ExerciceOptimisationModelisation {
  const demiBase = randomInt(DEMI_BASE_MIN, DEMI_BASE_MAX);
  const base = 2 * demiBase;
  const h0 = randomInt(H0_MIN, H0_MAX);
  const hauteur = h0 * base;

  const fonction = { a: -h0, b: h0 * base, c: 0 };
  const sommet = { x: demiBase, y: h0 * demiBase * demiBase };

  const domaine = { inf: 0, sup: base };
  const sommetDansDomaine = sommetDansIntervalle(demiBase, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  // "Identifier x et y" — écran 1 (`prompt-restructuration-architecture-modelisation.md`) — piège :
  // confondre la largeur/hauteur DU RECTANGLE cherché (x/y) avec la base/hauteur DU TRIANGLE, des
  // données du problème déjà connues, jamais ce qu'on cherche.
  const identificationXY = construireIdentificationXY(
    "la largeur du rectangle",
    "la hauteur du rectangle",
    "la base du triangle",
    "la hauteur du triangle",
  );

  return {
    variante: "modelisation",
    famille: "rectangleInscrit",
    sens: "max",
    contexte: {
      phraseEnonce: `${skin.nomForme} a la forme d'un triangle isocèle de base ${base} cm et de hauteur ${hauteur} cm. On y inscrit un rectangle dont un côté repose sur la base du triangle.`,
      labelVariable: "x",
      nomVariable: "la largeur du rectangle",
      nomGrandeur: "l'aire du rectangle",
      genreGrandeur: "feminin",
      uniteVariable: "cm",
      uniteGrandeur: "cm²",
      questionFinale: formatQuestionFinale("max", "l'aire du rectangle", "feminin"),
      // Croquis SVG (`prompt-implementation-3-diagrammes-svg.md`) — même géométrie sur les 3 skins
      // (habillages narratifs du MÊME triangle isocèle, voir en-tête de fichier), donc AUCUNE
      // variante selon `skin` : x=largeur/y=hauteur, toujours identique. Rendu sur l'écran
      // "contrainteEtGrandeur" (`EtapeContrainteEtGrandeurOptimisation.tsx`), pas ailleurs.
      croquis: { type: "rectangleInscrit" },
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    identificationXY,
    // Écran "contrainteEtGrandeur", champ 2 — Aire = x·y (formule géométrique universelle,
    // aucun override d'aide nécessaire).
    formuleGrandeurXYTexte: "x*y",
    contrainte: {
      enonceLatex: `${hauteur}x + ${base}y = ${hauteur * base}`,
      lettreCherchee: "y",
      pente: -h0,
      ordonnee: hauteur,
    },
    // Champ 1 (contrainte) — piège propre à cette famille : PROPORTION géométrique (triangles
    // semblables), jamais un simple isolement algébrique. `lettreCherchee` ("y") est la HAUTEUR du
    // rectangle ici, `labelVariable` ("x") sa LARGEUR — la relation `hauteur·x+base·y=hauteur·base`
    // vient de "à hauteur y, la largeur disponible du triangle (x) est proportionnelle à ce qu'il
    // reste de hauteur" (corrige une incohérence antérieure, `prompt-groupe-corrections-gen55.md`
    // point 1, qui affirmait par erreur "à hauteur x").
    texteAideContrainteNiveau1:
      "Rappel : à hauteur y (la hauteur du rectangle), la largeur disponible du triangle (x, la largeur du rectangle) est proportionnelle à ce qu'il reste de hauteur, par rapport à la hauteur totale du triangle — utilise cette proportion (triangles semblables).",
    texteAideContrainteNiveau2: "La proportion s'écrit : (largeur disponible) / (base du triangle) = (hauteur totale − y) / (hauteur totale).",
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "l'aire du rectangle",
      genreGrandeur: "feminin",
      uniteGrandeur: "cm²",
      uniteGrandeurFautive: "cm",
      labelVariable: "x",
      uniteVariable: "cm",
      optimal,
    }),
  };
}
