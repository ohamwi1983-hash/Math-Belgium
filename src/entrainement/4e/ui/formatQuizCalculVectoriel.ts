/**
 * Présentation pure — quiz "Calcul vectoriel" (gen64). Les affirmations de la banque notent un
 * vecteur `vec(AB)` en texte brut (audit chapitre 6, point 27 : l'élève lisait littéralement
 * « vec(AB) », alors que le cours écrit une flèche) : chaque `vec(…)` devient ici un fragment KaTeX
 * `\vec{…}`, indices compris (`vec(A1An)` → A₁Aₙ, `vec(vR)` → v_R), et `||` devient `‖`. La banque
 * reste lisible telle quelle, seule la présentation change.
 */
import type { FragmentConsigne } from "./formatEquationDroite";

/** Contenu d'un `vec(…)` → LaTeX : `v1`/`vR`/`FR` → indice ; points indicés `A1`, `An`, `An−1`. */
function nomVecteurLatex(nom: string): string {
  const vecteurIndice = /^([a-zF])(\d|R)$/.exec(nom);
  if (vecteurIndice) return `${vecteurIndice[1]}_${vecteurIndice[2]}`;
  return nom.replace(/([A-Z])(n−1|n|\d)/g, (_m, lettre: string, indice: string) => `${lettre}_{${indice.replace("−", "-")}}`);
}

export function fragmentsTexteVectoriel(texte: string): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = [];
  const motif = /vec\(([^()]*)\)/g;
  let position = 0;
  let m: RegExpExecArray | null;
  while ((m = motif.exec(texte)) !== null) {
    if (m.index > position) fragments.push({ type: "texte", valeur: texte.slice(position, m.index).replace(/\|\|/g, "‖") });
    fragments.push({ type: "latex", valeur: `\\vec{${nomVecteurLatex(m[1])}}` });
    position = m.index + m[0].length;
  }
  if (position < texte.length) fragments.push({ type: "texte", valeur: texte.slice(position).replace(/\|\|/g, "‖") });
  return fragments;
}
