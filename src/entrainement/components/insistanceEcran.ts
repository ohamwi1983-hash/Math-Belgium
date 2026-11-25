import { sansMajusculesDInsistance } from "../export/majusculesPapier";

/**
 * Plus de MAJUSCULES d'insistance à l'écran des générateurs (côté élève, planche 11, point 8 « fait
 * d'office ») : « sur TOUTE l'expression » devient « sur **toute** l'expression ». Les capitales
 * ralentissent la lecture ; le gras garde l'insistance.
 *
 * Même règle que le papier, sans la changer : `export/majusculesPapier.ts::sansMajusculesDInsistance`
 * décide QUELS mots sont des insistances (jamais les noms de points ABC, les permutations RBB, les sigles
 * de `SIGLES`, les chiffres romains — corpus d'un million de fragments mesuré). Ici, on repère les
 * lettres qu'elle a mises en minuscules (même longueur de chaîne) et on rend chaque suite de mots
 * transformés (« À LA FOIS ») dans UN `<strong class="insistance">`, en minuscules (majuscule initiale
 * gardée en début de phrase, comme sur papier).
 *
 * Appliqué par les composants de rendu de texte partagés des générateurs (fragments texte/LaTeX,
 * `TexteRiche`, corrigé détaillé, quiz…) : aucune donnée réécrite, le papier garde sa propre règle.
 */

export interface SegmentInsistance {
  texte: string;
  gras: boolean;
}

const LETTRE = /\p{L}/u;

export function segmentsInsistance(texte: string, debutDePhrase = true): SegmentInsistance[] {
  if (!/\p{Lu}{3}/u.test(texte)) return [{ texte, gras: false }];
  const sans = sansMajusculesDInsistance(texte, debutDePhrase);
  if (sans === texte || sans.length !== texte.length) return [{ texte, gras: false }];
  // Mots (suites de lettres) dont au moins une lettre a changé.
  const gras = new Array<boolean>(texte.length).fill(false);
  for (let i = 0; i < texte.length; ) {
    if (!LETTRE.test(texte[i])) {
      i++;
      continue;
    }
    let j = i;
    let change = false;
    while (j < texte.length && LETTRE.test(texte[j])) {
      if (texte[j] !== sans[j]) change = true;
      j++;
    }
    if (change) for (let k = i; k < j; k++) gras[k] = true;
    i = j;
  }
  // Deux mots transformés séparés par une espace, une apostrophe ou un trait d'union : un seul gras.
  for (let i = 1; i < texte.length - 1; i++) {
    if (!gras[i] && /[\s'’-]/.test(texte[i])) {
      let b = i + 1;
      while (b < texte.length && /[\s'’-]/.test(texte[b]) && !gras[b]) b++;
      if (gras[i - 1] && b < texte.length && gras[b]) for (let k = i; k < b; k++) gras[k] = true;
    }
  }
  const segments: SegmentInsistance[] = [];
  for (let i = 0; i < texte.length; ) {
    const g = gras[i];
    let j = i;
    while (j < texte.length && gras[j] === g) j++;
    segments.push({ texte: g ? sans.slice(i, j) : texte.slice(i, j), gras: g });
    i = j;
  }
  return segments;
}
