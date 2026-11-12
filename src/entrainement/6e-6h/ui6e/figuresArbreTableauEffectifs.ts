import { COULEURS } from "./figureRepereIntegrales";
import type { ArbreAffichage, TableauEffectifsAffichage } from "./formatArbreTableauEffectifs";

/**
 * Figures PAPIER de `6gen74` (énoncé : arbre ou tableau partiel ; corrigé : arbre et tableau
 * complets, `EtapeCorrection.figureHtml`). Chaînes autonomes : couleurs `var(--x, #repli)` comme
 * `figureRepereIntegrales.ts` (repli lisible à l'impression), largeur 100 % plafonnée. Même
 * disposition que le composant `WeightedTree` des chapitres (racine à gauche, deux niveaux).
 */

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Étiquette d'un nœud : lettre en italique ; une lettre surlignée (macron combinant U+0304 dans
 * `ArbreAffichage`) reçoit un VRAI trait tracé au-dessus — le macron combinant est décalé dans les
 * polices du site et d'impression (« C⁻ » au lieu de « C̄ »). */
function etiquette(label: string, x: number, y: number, police: string): string {
  const barre = label.endsWith("\u0304");
  const lettre = echapper(barre ? label.slice(0, -1) : label);
  let s = `<text x="${x}" y="${y}" font-size="17" font-style="italic" ${police} fill="${COULEURS.encre}">${lettre}</text>`;
  if (barre) s += `<line x1="${x + 2}" y1="${y - 14}" x2="${x + 13}" y2="${y - 14}" stroke="${COULEURS.encre}" stroke-width="1.3"/>`;
  return s;
}

export function arbreSvg(arbre: ArbreAffichage, libelle: string): string {
  const W = 420;
  const H = 240;
  const x0 = 24;
  const x1 = 175;
  const x2 = 330;
  const y0 = H / 2;
  const y1 = [H * 0.27, H * 0.73];
  const y2 = [H * 0.1, H * 0.38, H * 0.62, H * 0.9];
  const police = `font-family="Georgia, 'Times New Roman', serif"`;
  const proba = (v: string) => (v === "?" ? COULEURS.accent : COULEURS.encre);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0.4em auto" role="img" aria-label="${echapper(libelle)}">`;
  arbre.firstLevel.forEach((b, i) => {
    s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1[i]}" stroke="${COULEURS.doux}" stroke-width="1.4"/>`;
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1[i]) / 2 + (i === 0 ? -8 : 18);
    s += `<text x="${mx}" y="${my}" text-anchor="middle" font-size="16" ${police} fill="${proba(b.prob)}">${echapper(b.prob)}</text>`;
    s += `<circle cx="${x1}" cy="${y1[i]}" r="2.6" fill="${COULEURS.encre}"/>`;
    s += etiquette(b.label, x1 + 8, y1[i] - 8, police);
  });
  arbre.secondLevel.forEach((b, i) => {
    const ya = y1[b.fromFirst];
    s += `<line x1="${x1}" y1="${ya}" x2="${x2}" y2="${y2[i]}" stroke="${COULEURS.doux}" stroke-width="1.4"/>`;
    const mx = x1 + (x2 - x1) * 0.6;
    const my = ya + (y2[i] - ya) * 0.6 + (y2[i] < ya ? -7 : 16);
    s += `<text x="${mx}" y="${my}" text-anchor="middle" font-size="16" ${police} fill="${proba(b.prob)}">${echapper(b.prob)}</text>`;
    s += `<circle cx="${x2}" cy="${y2[i]}" r="2.6" fill="${COULEURS.encre}"/>`;
    s += etiquette(b.label, x2 + 9, y2[i] + 6, police);
  });
  s += `<circle cx="${x0}" cy="${y0}" r="2.6" fill="${COULEURS.encre}"/></svg>`;
  return s;
}

function enTeteHtml(e: TableauEffectifsAffichage["enTetesLignes"][number]): string {
  if ("texte" in e) return echapper(e.texte);
  const m = /^\\bar\{(.+)\}$/.exec(e.latex);
  return m ? `<i><span style="text-decoration:overline">${echapper(m[1])}</span></i>` : `<i>${echapper(e.latex)}</i>`;
}

/** Tableau d'effectifs en HTML : une case inconnue affiche « ? » (discret), jamais une case vide
 * qui passerait pour une place de réponse (règle utilisateur). */
export function tableauHtml(tableau: TableauEffectifsAffichage): string {
  const bord = "border:1px solid #888;padding:0.3em 0.8em;text-align:center;min-width:3.2em";
  let h = `<table style="border-collapse:collapse;margin:0.4em auto;font-variant-numeric:tabular-nums"><tr><th style="${bord}"></th>`;
  for (const c of tableau.enTetesColonnes) h += `<th style="${bord}">${enTeteHtml(c)}</th>`;
  h += "</tr>";
  tableau.cellules.forEach((ligne, i) => {
    h += `<tr><th style="${bord}">${enTeteHtml(tableau.enTetesLignes[i])}</th>`;
    for (const cel of ligne) h += `<td style="${bord}">${cel.valeur === null ? '<span style="color:#8a8f98">?</span>' : echapper(cel.valeur)}</td>`;
    h += "</tr>";
  });
  return `${h}</table>`;
}
