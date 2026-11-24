import { COULEURS } from "./figureRepereIntegrales";

/**
 * Figures de `6gen160` : diagramme de Venn des effectifs et tableau à double entrée, en SVG PUR
 * (texte SVG, aucun HTML ni KaTeX dedans) — la même chaîne sert à l'écran (`figure`), à l'énoncé
 * papier (`enteteHtml`) et au Word (rasterisé). Aucun identifiant interne. Les valeurs données
 * sont des effectifs entiers ; une valeur inconnue s'écrirait « ? » (jamais une case vide).
 */

const SERIF = "Georgia, 'Times New Roman', serif";

function lettre(x: number, y: number, l: string, barre: boolean, taille = 17, ancre = "middle"): string {
  const t = `<text x="${x}" y="${y}" font-size="${taille}" font-style="italic" font-family="${SERIF}" text-anchor="${ancre}" fill="${COULEURS.encre}">${l}</text>`;
  if (!barre) return t;
  const dx = ancre === "middle" ? 0 : 5;
  return `${t}<line x1="${x + dx - 6}" y1="${y - taille * 0.82}" x2="${x + dx + 6}" y2="${y - taille * 0.82}" stroke="${COULEURS.encre}" stroke-width="1.3"/>`;
}

function nombre(x: number, y: number, v: string, taille = 17, gras = false): string {
  return `<text x="${x}" y="${y}" font-size="${taille}" font-family="${SERIF}" text-anchor="middle" fill="${COULEURS.encre}"${gras ? ' font-weight="600"' : ""}>${v}</text>`;
}

/** Diagramme de Venn : effectifs « A seulement », « A et B », « B seulement », « ni A ni B ». */
export function vennEffectifs(aSeul: number, ab: number, bSeul: number, dehors: number): string {
  const W = 320;
  const H = 196;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Diagramme de Venn des effectifs : ${aSeul} dans A seulement, ${ab} dans A et B, ${bSeul} dans B seulement, ${dehors} ni dans A ni dans B">`;
  s += `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="6" fill="none" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
  s += `<circle cx="124" cy="100" r="70" fill="${COULEURS.accentDoux}" fill-opacity="0.6" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  s += `<circle cx="196" cy="100" r="70" fill="${COULEURS.bonDoux}" fill-opacity="0.6" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  s += `<circle cx="124" cy="100" r="70" fill="none" stroke="${COULEURS.encre}" stroke-width="1.4"/>`;
  s += lettre(58, 36, "A", false);
  s += lettre(262, 36, "B", false);
  s += `<text x="14" y="23" font-size="15" font-family="${SERIF}" fill="${COULEURS.doux}">Ω</text>`;
  s += nombre(90, 106, String(aSeul));
  s += nombre(160, 106, String(ab));
  s += nombre(230, 106, String(bSeul));
  s += nombre(288, 182, String(dehors));
  return `${s}</svg>`;
}

/** Tableau à double entrée des effectifs (lignes A, Ā, Total ; colonnes B, B̄, Total). */
export function tableauEffectifs(N: number, nA: number, nB: number, nAB: number): string {
  const c0 = 74;
  const cw = 72;
  const rh = 34;
  const W = c0 + 3 * cw + 4;
  const H = 4 * rh + 4;
  const x0 = 2;
  const y0 = 2;
  const cells = [
    [nAB, nA - nAB, nA],
    [nB - nAB, N - nA - nB + nAB, N - nA],
    [nB, N - nB, N],
  ];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Tableau à double entrée des effectifs">`;
  // Fond des en-têtes.
  s += `<rect x="${x0 + c0}" y="${y0}" width="${3 * cw}" height="${rh}" fill="${COULEURS.accentDoux}" fill-opacity="0.5"/>`;
  s += `<rect x="${x0}" y="${y0 + rh}" width="${c0}" height="${3 * rh}" fill="${COULEURS.accentDoux}" fill-opacity="0.5"/>`;
  // Quadrillage.
  for (let i = 0; i <= 4; i++) {
    const y = y0 + i * rh;
    s += `<line x1="${i === 0 ? x0 + c0 : x0}" y1="${y}" x2="${x0 + c0 + 3 * cw}" y2="${y}" stroke="${COULEURS.doux}" stroke-width="${i === 3 ? 1.6 : 1}"/>`;
  }
  for (let j = 0; j <= 4; j++) {
    const x = j === 0 ? x0 : x0 + c0 + (j - 1) * cw;
    s += `<line x1="${x}" y1="${j === 0 ? y0 + rh : y0}" x2="${x}" y2="${y0 + 4 * rh}" stroke="${COULEURS.doux}" stroke-width="${j === 3 ? 1.6 : 1}"/>`;
  }
  const cx = (j: number) => x0 + c0 + j * cw + cw / 2;
  const cy = (i: number) => y0 + i * rh + rh / 2 + 6;
  s += lettre(cx(0), cy(0), "B", false);
  s += lettre(cx(1), cy(0), "B", true);
  s += `<text x="${cx(2)}" y="${cy(0)}" font-size="15" font-family="${SERIF}" text-anchor="middle" fill="${COULEURS.encre}">Total</text>`;
  s += lettre(x0 + c0 / 2, cy(1), "A", false);
  s += lettre(x0 + c0 / 2, cy(2), "A", true);
  s += `<text x="${x0 + c0 / 2}" y="${cy(3)}" font-size="15" font-family="${SERIF}" text-anchor="middle" fill="${COULEURS.encre}">Total</text>`;
  cells.forEach((ligne, i) => ligne.forEach((v, j) => (s += nombre(cx(j), cy(i + 1), String(v), 16, i === 2 || j === 2))));
  return `${s}</svg>`;
}
