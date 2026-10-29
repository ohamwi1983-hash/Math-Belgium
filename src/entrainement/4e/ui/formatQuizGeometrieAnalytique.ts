/**
 * Présentation pure — quiz "Géométrie analytique plane" (gen65). Les affirmations de la banque
 * notent les indices en texte brut (`x_S`, `y_F`, `u_x`, `x0`…) : l'élève lisait littéralement un
 * caractère `_` (audit chapitre 7, point 66), alors que le cours écrit un vrai indice. Chaque
 * notation indicée devient ici un fragment KaTeX (`x_S` → x_S, `x0` → x₀), exactement comme
 * `fragmentsTexteVectoriel` pour le quiz du chapitre 6 — la banque reste lisible telle quelle,
 * seule la présentation change.
 */
import type { FragmentConsigne } from "./formatEquationDroite";

/** Variable minuscule suivie d'un indice explicite (`x_S`, `u_x`, `x_d`) ou d'un 0 collé (`x0`). */
const MOTIF_INDICE = /\b([a-z])_([A-Za-z0-9])\b|\b([xy])0\b/g;

export function fragmentsTexteGeometrieAnalytique(texte: string): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [];
  let position = 0;
  let m: RegExpExecArray | null;
  MOTIF_INDICE.lastIndex = 0;
  while ((m = MOTIF_INDICE.exec(texte)) !== null) {
    if (m.index > position) fragments.push({ type: "texte", valeur: texte.slice(position, m.index) });
    const latex = m[1] !== undefined ? `${m[1]}_{${m[2]}}` : `${m[3]}_0`;
    fragments.push({ type: "latex", valeur: latex });
    position = m.index + m[0].length;
  }
  if (position < texte.length) fragments.push({ type: "texte", valeur: texte.slice(position) });
  return fragments;
}
