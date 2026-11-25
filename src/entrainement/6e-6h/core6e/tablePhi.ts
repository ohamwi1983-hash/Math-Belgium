import { phiExacte, valeurTablePhi, Z_MAX_TABLE } from "../../../lib/tablePhi";

/**
 * Lecture de la table de la loi normale centrée réduite Φ pour les générateurs du lot H2 du 6e ch. 8
 * (6gen116, 6gen118, 6gen119, 6gen120, 6gen122). Les VALEURS viennent de la source unique
 * `lib/tablePhi.ts` (même table que le composant `components/TablePhi.tsx`, 6gen51 et l'annexe
 * papier) ; ce module n'ajoute que des aides de lecture propres à ces générateurs.
 *
 * - Convention de lecture (cours, § 6) : z arrondi au centième ; Φ(−z) = 1 − Φ(z) pour un z négatif ;
 *   sens inverse : la case la plus proche de la probabilité cherchée (`caseLaPlusProche`, unique : les
 *   générateurs évitent une probabilité à mi-chemin de deux cases).
 * - `extraitTablePhiHtml` : un extrait 3 × 3 pour le CORRIGÉ seulement (jamais dans un énoncé).
 */

/** Φ(z) « exact » (série de erf, `lib/tablePhi.ts`). */
export const phiExact = (z: number): number => phiExacte(z);

/** Valeurs de la table, indexées par le nombre de centièmes de z (0 … 349). */
const TABLE: number[] = Array.from({ length: 350 }, (_, i) => valeurTablePhi(i / 100));

export { Z_MAX_TABLE };

/** Centièmes d'un z à deux décimales (« 1,23 » → 123), sans erreur flottante. */
export const centiemes = (z: number): number => Math.round(Math.abs(z) * 100);

/** Valeur LUE dans la table pour un z à deux décimales (|z| ≤ 3,49) ; z négatif : 1 − Φ(|z|). */
export function phiTable(z: number): number {
  const i = centiemes(z);
  const v = i > 349 ? 1 : TABLE[i]!;
  return z < 0 ? Math.round((1 - v) * 1e4) / 1e4 : v;
}

/** z arrondi au centième (convention de lecture de la table). */
export const arrondiZ = (z: number): number => Math.round(z * 100) / 100;

/** Case de la table (z ≥ 0) dont la valeur est la plus proche de p ; `unique` faux si deux cases sont
 * à égale distance (p à mi-chemin : les générateurs l'évitent). */
export function caseLaPlusProche(p: number): { z: number; valeur: number; unique: boolean } {
  let meilleur = 0;
  let distance = Infinity;
  let second = Infinity;
  for (let i = 0; i < 350; i++) {
    const d = Math.abs(TABLE[i]! - p);
    if (d < distance - 1e-12) {
      second = distance;
      distance = d;
      meilleur = i;
    } else if (d < second) second = d;
  }
  return { z: meilleur / 100, valeur: TABLE[meilleur]!, unique: second - distance > 1e-9 };
}

/** Écriture française à `n` décimales FIXES (« 0,8900 », « 1,20 ») — texte brut. */
export function decimalFixe(x: number, n: number): string {
  const s = Math.abs(x).toFixed(n).replace(".", ",");
  return `${x < 0 && Number(Math.abs(x).toFixed(n)) !== 0 ? "−" : ""}${s}`;
}

/** Même chose en LaTeX (virgule `{,}`, signe « - »). */
export function decimalFixeL(x: number, n: number): string {
  return decimalFixe(x, n).replace(",", "{,}").replace("−", "-");
}

/** Extrait de la table (3 lignes × 3 colonnes autour de la case de z ≥ 0, case encadrée) en HTML
 * autonome — pour le CORRIGÉ seulement (jamais d'extrait dans un énoncé : décision du 18/11). */
export function extraitTablePhiHtml(z: number): string {
  const i = Math.min(349, centiemes(z));
  const ligne = Math.floor(i / 10);
  const col = i % 10;
  const lignes = [ligne - 1, ligne, ligne + 1].filter((r) => r >= 0 && r <= 34);
  const cols = [col - 1, col, col + 1].filter((c) => c >= 0 && c <= 9);
  const th = (s: string, fort = false) => `<th style="padding:2px 6px;border:1px solid #adb5bd;background:${fort ? "#ffe8cc" : "#f1f3f5"};font-weight:${fort ? 700 : 600}">${s}</th>`;
  const entete = `<tr>${th("z")}${cols.map((c) => th(decimalFixe(c / 100, 2), c === col)).join("")}</tr>`;
  const corps = lignes
    .map(
      (r) =>
        `<tr>${th(decimalFixe(r / 10, 1), r === ligne)}${cols
          .map((c) => {
            const fort = r === ligne && c === col;
            return `<td style="padding:2px 6px;border:${fort ? "2px solid #e8590c" : "1px solid #adb5bd"};font-weight:${fort ? 700 : 400};text-align:right">${decimalFixe(TABLE[r * 10 + c]!, 4)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;font-variant-numeric:tabular-nums;font-size:13px;margin:4px 0;background:#fff;color:#212529">${entete}${corps}</table>`;
}
