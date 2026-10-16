/**
 * Famille "carreMoinsNombre" — architecture C ("problèmes de nombres classiques", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête). `x²-x=k` (`b=-1`) — le carré d'un entier
 * naturel x diminué de ce même entier. Toujours exactement 1 racine valide (l'autre, `1-x`, est
 * strictement négative dès que `x≥2` — voir `problemeNombre.ts`, `R1_MIN` garantit cette marge).
 */
import { construireAvecParametresNombre } from "../problemeNombre";
import { randomInt } from "../aleatoire";

const SKINS: string[] = [
  "On cherche un entier naturel x, inférieur à 100, tel que son carré diminué de lui-même soit connu.",
  "Un professeur propose à sa classe de retrouver un entier naturel x, inférieur à 100, connaissant son carré diminué de lui-même.",
  "Dans un jeu de devinette, un entier naturel x (inférieur à 100) a été choisi ; on connaît son carré diminué de lui-même.",
];

const R1_MIN = 12;
const R1_MAX = 35;
const DOMAINE_SUP = 100;

export const construireCarreMoinsNombre = construireAvecParametresNombre(() => ({
  famille: "carreMoinsNombre",
  b: -1,
  r1: randomInt(R1_MIN, R1_MAX),
  domaineSup: DOMAINE_SUP,
  phraseEnonce: SKINS[randomInt(0, SKINS.length - 1)]!,
  labelVariable: "x",
  nomVariable: "l'entier naturel",
  nomGrandeur: "le carré diminué du nombre",
  genreGrandeur: "masculin",
  uniteVariable: "",
  uniteGrandeur: "",
  uniteGrandeurFautive: "ans",
}));
