import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { nombreLatex, type Poly2 } from "../moteur/algebreTransfertSecondDegre";
import { nombreTexte, q, qp } from "./corrigeChapitre3";

/**
 * Briques des corrigés « comme au tableau » des nouveaux générateurs du chapitre 2 de 4e (gen115,
 * gen116, gen118, gen119, gen120), dans la variable de l'exercice (x, t ou m) : discriminant
 * (formule, substitution, calcul — même présentation que `corrigeSecondDegre2.ts::lignesDiscriminant`)
 * puis racines par la formule. Sans `docx`.
 */

export const COURS_RESOUDRE = "(cours, §\u00a01)";
export const COURS_SIGNE_TRINOME = "(cours, §\u00a02)";
export const COURS_DENOMINATEUR = "(cours, §\u00a05)";
export const COURS_CONTEXTE = "(cours, §\u00a07)";

/** Δ = b² − 4ac, substitution, calcul. */
export function lignesDelta([a, b, c]: Poly2, nom = "\\Delta"): LigneCalcul[] {
  const quatreAC = 4 * a * c;
  const delta = b * b - quatreAC;
  const lignes = [ligne(`${nom}=b^2-4ac`, "discriminant"), ligne(`=${qp(b)}^2-4\\cdot ${qp(a)}\\cdot ${qp(c)}`, "on remplace a, b et c")];
  const milieu = `=${q(b * b)}${quatreAC < 0 ? "+" : "-"}${q(Math.abs(quatreAC))}`;
  if (milieu !== `=${q(delta)}` && quatreAC !== 0 && b !== 0) lignes.push(ligne(milieu));
  lignes.push(ligne(`=${q(delta)}`));
  return lignes;
}

/** Racines par la formule (Δ > 0 : deux ; Δ = 0 : racine double ; Δ < 0 : une ligne « aucune »). */
export function lignesRacines(p: Poly2, v = "x", nomDelta = "\\Delta", symboleDelta = "Δ"): LigneCalcul[] {
  const [a, b, c] = p;
  const delta = b * b - 4 * a * c;
  if (delta < 0) return [ligne(`\\Delta=${q(delta)}<0`, "aucune racine réelle")];
  if (delta === 0) return [ligne(`${v}=\\dfrac{-b}{2a}`, "Δ = 0 : racine double"), ligne(`=\\dfrac{${q(-b)}}{${q(2 * a)}}`, "on remplace"), ligne(`=${nombreLatex(-b / (2 * a))}`)];
  const s = Math.sqrt(delta);
  const entier = Math.abs(s - Math.round(s)) < 1e-9;
  const rac = entier ? q(Math.round(s)) : `\\sqrt{${q(delta)}}`;
  const out: LigneCalcul[] = [];
  const r1 = (-b - s) / (2 * a);
  const r2 = (-b + s) / (2 * a);
  const [petite, grande] = a > 0 ? (["-", "+"] as const) : (["+", "-"] as const);
  for (const [i, sg, val] of [
    [1, petite, a > 0 ? r1 : r2],
    [2, grande, a > 0 ? r2 : r1],
  ] as const) {
    out.push(
      ligne(
        `${v}_${i}=\\dfrac{${q(-b)}${sg}${rac}}{${q(2 * a)}}`,
        i === 1 ? [latex(`${v}=\\dfrac{-b\\pm\\sqrt{${nomDelta}}}{2a}`), texte(entier ? `, avec √${symboleDelta} = ${nombreTexte(Math.round(s))}` : "")] : undefined,
      ),
    );
    out.push(ligne(`=${nombreLatex(val)}`));
  }
  return out;
}

/** Racines triées (deux, une ou aucune) d'un trinôme à racines exactes. */
export function racinesTriees([a, b, c]: Poly2): number[] {
  const d = b * b - 4 * a * c;
  if (d < -1e-9) return [];
  if (Math.abs(d) <= 1e-9) return [-b / (2 * a)];
  const s = Math.sqrt(d);
  const r = [(-b - s) / (2 * a), (-b + s) / (2 * a)];
  return r.sort((x, y) => x - y);
}
