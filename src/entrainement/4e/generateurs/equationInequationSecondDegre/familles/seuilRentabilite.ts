/**
 * Couche A — famille "seuilRentabilite" (bénéfice en fonction du nombre d'unités produites
 * au-delà d'un seuil `x`) : même technique que `revenuPrix` (gen55) — produit DÉCALÉ (pas
 * symétrique autour de 0) plutôt que le produit symétrique de `chuteObjet`/`remplissageReservoir`.
 * La marge unitaire décroît avec `x` (rendements décroissants) : `margeUnitaire(x) = -m·x+Q0`
 * (contrainte NON isolée `margeUnitaire + m·x = Q0`, écran "isolement") ; `Bénéfice(x) =
 * (C0+x)·margeUnitaire(x)` (écran "construction").
 *
 * **Propreté entière garantie par construction, même technique que `revenuPrix`** : `xS` choisi EN
 * PREMIER (entier), `m`/`C0` libres, `Q0=m·(C0+2·xS)` DÉRIVÉ pour que `xS=(Q0-m·C0)/(2m)` tombe
 * exactement dessus. Racines de `Bénéfice(x)=k` — "cible d'abord" : `delta` choisi EN PREMIER,
 * `k=m·(C0+xS)²-m·delta²` DÉRIVÉ.
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

interface SkinSeuilRentabilite {
  phraseEnonce: (C0: number, Q0: number) => string;
}

const SKINS: SkinSeuilRentabilite[] = [
  {
    phraseEnonce: (C0, Q0) =>
      `Une entreprise produit ${Q0} unités par mois avec une marge de ${C0} € par unité. Chaque unité supplémentaire produite au-delà de ce seuil fait diminuer la marge unitaire.`,
  },
  {
    phraseEnonce: (C0, Q0) =>
      `Un atelier fabrique ${Q0} pièces par semaine avec une marge de ${C0} € par pièce. Chaque pièce supplémentaire fabriquée au-delà de ce seuil fait diminuer la marge unitaire.`,
  },
];

const X_S_MIN = 15;
const X_S_MAX = 25;
const M_MIN = 2;
const M_MAX = 6;
const C0_MIN = 10;
const C0_MAX = 60;

export function construireSeuilRentabilite(variante: "equation"): ExerciceEquationSecondDegre;
export function construireSeuilRentabilite(variante: "inequation"): ExerciceInequationSecondDegre;
export function construireSeuilRentabilite(variante: VarianteEquationInequationSecondDegre): ExerciceEquationInequationSecondDegre {
  const xS = randomInt(X_S_MIN, X_S_MAX);
  const m = randomInt(M_MIN, M_MAX);
  const C0 = randomInt(C0_MIN, C0_MAX);
  const Q0 = m * (C0 + 2 * xS);

  const pente = -m;
  const ordonnee = Q0;
  const fonction = { a: pente, b: Q0 - m * C0, c: C0 * Q0 };
  const sommet = { x: xS, y: m * (C0 + xS) * (C0 + xS) };

  const { delta, domaine } = genererDeltaEtDomaine(xS, 0);
  const sommetDansDomaine = sommetDansIntervalle(xS, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  const base: ExerciceOptimisationModelisation = {
    variante: "modelisation",
    famille: "seuilRentabilite",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(C0, Q0),
      labelVariable: "x",
      nomVariable: "le nombre d'unités supplémentaires",
      nomGrandeur: "le bénéfice",
      uniteVariable: "unités",
      uniteGrandeur: "€",
      questionFinale: null,
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Bénéfice = (C0+x)·margeUnitaire(x) (produit DÉCALÉ, premier facteur ≠ x nu) — le gabarit
    // générique de l'aide partagée `texteAideConstructionNiveau2` (`ui/formatOptimisation.ts`)
    // suppose "labelVariable · (isolé)", faux ici (bug trouvé, `promptrestructurationgenequationinequation.md`,
    // section 3bis — jumeau du même défaut sur `revenuPrix.ts`, gen55) : fourni explicitement.
    formuleSubstitueeTexte: `(${C0}+x) · (${pente}x + ${ordonnee})`,
    contrainte: {
      enonceLatex: `y + ${m}x = ${Q0}`,
      lettreCherchee: "y",
      pente,
      ordonnee,
    },
    // Bénéfice(x,y) = (C0+x)·y, x ET y encore présents (écran "contrainteEtGrandeur", champ 2 —
    // `promptimplementationgen57.md`, réutilisation de l'architecture à 4 écrans de gen55).
    formuleGrandeurXYTexte: `(${C0}+x)*y`,
    optionsInterpretation: [],
  };

  const k = sommet.y - m * delta * delta;

  if (variante === "equation") {
    const racinesCandidates: [number, number] = [xS - delta, xS + delta];
    const racinesValides = racinesDansDomaine(xS, delta, domaine);
    const racinesRejetees = racinesCandidates.filter((r) => !racinesValides.includes(r));
    return {
      variante: "equation",
      famille: "seuilRentabilite",
      base,
      k,
      voieSysteme: false,
      systeme: null,
      racinesCandidates,
      racinesValides,
      questionFinale: formatQuestionFinaleEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le bénéfice",
        genreGrandeur: "masculin",
        k,
        uniteGrandeur: "€",
      }),
      optionsInterpretation: construireOptionsInterpretationEquationInequation({
        variante: "equation",
        labelVariable: "x",
        nomGrandeur: "le bénéfice",
        genreGrandeur: "masculin",
        uniteVariable: "unités",
        uniteGrandeur: "€",
        uniteGrandeurFautive: "unités",
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
    famille: "seuilRentabilite",
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
      nomGrandeur: "le bénéfice",
      genreGrandeur: "masculin",
      k,
      uniteGrandeur: "€",
    }),
    optionsInterpretation: construireOptionsInterpretationEquationInequation({
      variante: "inequation",
      labelVariable: "x",
      nomGrandeur: "le bénéfice",
      genreGrandeur: "masculin",
      uniteVariable: "unités",
      uniteGrandeur: "€",
      uniteGrandeurFautive: "unités",
      k,
      intervalleValide,
      intervalleBrut,
    }),
  };
}
