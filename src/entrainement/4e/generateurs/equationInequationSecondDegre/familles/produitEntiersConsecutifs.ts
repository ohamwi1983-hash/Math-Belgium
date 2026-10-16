/**
 * Famille "produitEntiersConsecutifs" — architecture C ("problèmes de nombres classiques", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête). `x(x+1)=k` (`b=1`) — le premier des 2
 * entiers naturels consécutifs est x, le second x+1. Toujours exactement 1 racine valide (l'autre,
 * `-(x+1)`, est toujours strictement négative — voir `problemeNombre.ts`).
 */
import { construireAvecParametresNombre } from "../problemeNombre";
import { randomInt } from "../aleatoire";

const SKINS: string[] = [
  "On cherche deux entiers naturels consécutifs, tous deux inférieurs à 100. Le premier des deux entiers est x, le second est x+1.",
  "Un professeur propose à sa classe de retrouver deux entiers naturels consécutifs, tous deux inférieurs à 100, connaissant leur produit. Le premier des deux entiers est x, le second est x+1.",
  "Dans un jeu de devinette, deux entiers naturels consécutifs (tous deux inférieurs à 100) ont été choisis. Le premier des deux entiers est x, le second est x+1.",
];

const R1_MIN = 10;
const R1_MAX = 35;
const DOMAINE_SUP = 100;

export const construireProduitEntiersConsecutifs = construireAvecParametresNombre(() => ({
  famille: "produitEntiersConsecutifs",
  b: 1,
  r1: randomInt(R1_MIN, R1_MAX),
  domaineSup: DOMAINE_SUP,
  phraseEnonce: SKINS[randomInt(0, SKINS.length - 1)]!,
  labelVariable: "x",
  nomVariable: "le premier des deux entiers",
  nomGrandeur: "le produit des deux entiers",
  genreGrandeur: "masculin",
  uniteVariable: "",
  uniteGrandeur: "",
  uniteGrandeurFautive: "ans",
}));
