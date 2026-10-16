/**
 * Famille "sommeProduit" — architecture D ("système à 2 inconnues réduit par substitution", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête). Classique : la somme de deux nombres
 * entiers naturels vaut S, leur produit vaut P. Les 2 nombres sont TOUJOURS tous les deux valides
 * (jamais de racine à rejeter — voir `systemeSubstitution.ts`).
 */
import { construireAvecParametresSysteme } from "../systemeSubstitution";
import { randomInt } from "../aleatoire";

const SKINS: string[] = [
  "On cherche deux nombres entiers naturels. On connaît leur somme et leur produit.",
  "Un professeur propose à sa classe de retrouver deux nombres entiers naturels, connaissant leur somme et leur produit.",
  "Dans un jeu de devinette, deux nombres entiers naturels ont été choisis ; on connaît leur somme et leur produit.",
];

const R_MIN = 5;
const R_MAX = 25;

export const construireSommeProduit = construireAvecParametresSysteme(() => {
  const r1 = randomInt(R_MIN, R_MAX);
  let r2 = randomInt(R_MIN, R_MAX);
  while (r2 === r1) r2 = randomInt(R_MIN, R_MAX);

  return {
    famille: "sommeProduit",
    r1,
    r2,
    label1: "la somme des deux nombres",
    label2: "leur produit",
    phraseEnonce: SKINS[randomInt(0, SKINS.length - 1)]!,
    labelVariable: "x",
    nomVariable: "l'un des deux nombres",
    nomGrandeur: "le produit des deux nombres",
    genreGrandeur: "masculin",
    uniteVariable: "",
    uniteGrandeur: "",
    uniteGrandeurFautive: "ans",
  };
});
