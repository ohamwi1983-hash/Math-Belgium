/**
 * Famille "perimetreAire" — architecture D ("système à 2 inconnues réduit par substitution", voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête). Le périmètre ET l'aire d'un rectangle
 * sont donnés séparément (contrairement à `rectanglePerimetre.ts`, architecture B, où seul le
 * périmètre est donné et la longueur est déjà implicitement substituée dans la narration) — ici
 * l'élève doit se rappeler lui-même les 2 formules (périmètre = 2(l+L), aire = l·L) et les combiner.
 * `label1`/`cible1` restent la forme CANONIQUE `x+y-S` (`S` = demi-périmètre, interne) —
 * `diagnostiquerEquivalenceQuadratiqueXY` accepte la mise à l'échelle, donc un élève écrivant
 * "2x+2y=périmètre réel" est accepté tel quel (voir `systemeSubstitution.ts`, en-tête).
 */
import { construireAvecParametresSysteme } from "../systemeSubstitution";
import { randomInt } from "../aleatoire";

interface SkinPerimetreAire {
  phraseEnonce: (perimetre: number) => string;
}

const SKINS: SkinPerimetreAire[] = [
  {
    phraseEnonce: (perimetre) => `Un rectangle a un périmètre de ${perimetre} m. On connaît aussi son aire.`,
  },
  {
    phraseEnonce: (perimetre) => `Un architecte dessine un terrain rectangulaire dont le périmètre mesure ${perimetre} m. On connaît aussi son aire.`,
  },
  {
    phraseEnonce: (perimetre) => `Un jardinier délimite un massif rectangulaire dont le périmètre mesure ${perimetre} m. On connaît aussi son aire.`,
  },
];

const R_MIN = 5;
const R_MAX = 25;

export const construirePerimetreAire = construireAvecParametresSysteme(() => {
  const r1 = randomInt(R_MIN, R_MAX);
  let r2 = randomInt(R_MIN, R_MAX);
  while (r2 === r1) r2 = randomInt(R_MIN, R_MAX);
  const skin = SKINS[randomInt(0, SKINS.length - 1)]!;

  return {
    famille: "perimetreAire",
    r1,
    r2,
    label1: "le périmètre du rectangle",
    label2: "l'aire du rectangle",
    phraseEnonce: skin.phraseEnonce(2 * (r1 + r2)),
    labelVariable: "x",
    nomVariable: "une des dimensions du rectangle",
    nomGrandeur: "l'aire du rectangle",
    genreGrandeur: "feminin",
    uniteVariable: "m",
    uniteGrandeur: "m²",
    uniteGrandeurFautive: "m",
  };
});
