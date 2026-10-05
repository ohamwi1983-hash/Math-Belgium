/**
 * Couche A — famille "coutProduction" (variante `fonctionDonnee`, spec section 3, famille E) :
 * coût de production Coût(q) en fonction de la quantité produite q — SEULE famille à sens `"min"`
 * (concave vers le haut, économies puis déséconomies d'échelle). Même mécanique que
 * `trajectoire.ts`/`archePont.ts` (`formeSommet.ts`), échelle de quantités plus grande (dizaines
 * d'unités plutôt que secondes/mètres).
 */
import type { ExerciceOptimisationFonctionDonnee } from "../../../core/optimisation.types";
import { fonctionDepuisSommet } from "../formeSommet";
import { formatFonctionNarrativeLatex } from "../formatNarratif";
import { genererDomaine, optimumSurDomaine } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import { randomInt } from "../aleatoire";

/**
 * Domaine justifié narrativement (`spec-gen55-optimisation-second-degre.md`, section 2) — `inf`/`sup`
 * nommés comme le seuil minimal de fonctionnement et la capacité maximale, jamais affichés comme
 * $q\in[\text{inf};\text{sup}]$ nu ; une justification distincte par skin (atelier/usine/exploitation
 * n'ont pas le même type de contrainte de capacité).
 */
const SKINS = [
  { phraseEnonce: (a: number, b: number, c: number, inf: number, sup: number) => `Le coût total C (en €) de production de q unités dans un atelier vaut $C(q)=${formatFonctionNarrativeLatex(a, b, c, "q")}$. L'atelier ne peut fonctionner qu'entre q=${inf} unités (le minimum pour justifier son ouverture) et q=${sup} unités (sa capacité de production maximale).` },
  { phraseEnonce: (a: number, b: number, c: number, inf: number, sup: number) => `Le coût total C (en €) de production de q unités dans une usine vaut $C(q)=${formatFonctionNarrativeLatex(a, b, c, "q")}$. L'usine ne peut produire qu'entre q=${inf} unités (son seuil minimal de fonctionnement) et q=${sup} unités (sa capacité de production maximale).` },
  { phraseEnonce: (a: number, b: number, c: number, inf: number, sup: number) => `Le coût total C (en €) de production de q unités dans une exploitation vaut $C(q)=${formatFonctionNarrativeLatex(a, b, c, "q")}$. L'exploitation ne peut produire qu'entre q=${inf} unités (le minimum pour rester active) et q=${sup} unités (sa capacité de production maximale).` },
];

const Q_S_MIN = 20;
const Q_S_MAX = 80;
const A_ABS_CHOIX = [1, 2, 3];
const H_S_MIN = 50;
const H_S_MAX = 300;
const MARGE_MIN = 2;
const MARGE_MAX = 6;

export function construireCoutProduction(): ExerciceOptimisationFonctionDonnee {
  const qS = randomInt(Q_S_MIN, Q_S_MAX);
  const aAbs = A_ABS_CHOIX[randomInt(0, A_ABS_CHOIX.length - 1)];
  const hS = randomInt(H_S_MIN, H_S_MAX);

  const fonction = fonctionDepuisSommet("min", qS, hS, aAbs);
  const sommet = { x: qS, y: hS };

  const { domaine, sommetDansDomaine } = genererDomaine(qS, 0, MARGE_MIN, MARGE_MAX);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  const skin = SKINS[randomInt(0, SKINS.length - 1)];

  return {
    variante: "fonctionDonnee",
    famille: "coutProduction",
    sens: "min",
    contexte: {
      phraseEnonce: skin.phraseEnonce(fonction.a, fonction.b, fonction.c, domaine.inf, domaine.sup),
      labelVariable: "q",
      nomVariable: "la quantité produite",
      nomGrandeur: "le coût",
      genreGrandeur: "masculin",
      uniteVariable: "unités",
      uniteGrandeur: "€",
      questionFinale: formatQuestionFinale("min", "le coût", "masculin"),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "min",
      nomGrandeur: "le coût",
      genreGrandeur: "masculin",
      uniteGrandeur: "€",
      uniteGrandeurFautive: "unités",
      labelVariable: "q",
      uniteVariable: "unités",
      optimal,
    }),
  };
}
