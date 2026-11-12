/**
 * Figures PAPIER de `6gen32` (feuilles d'exercices / évaluations) : tableau à double entrée et arbre
 * pondéré, en SVG AUTONOME — le pipeline Word ne sait rasteriser que des `<svg>`
 * (`export/evaluationDocx.ts::htmlVersParagraphes`), un `<table>` HTML y disparaîtrait. Noir sur
 * blanc, couleurs en dur (lisible imprimé en niveaux de gris), largeur 100 % plafonnée.
 *
 * Les lettres surlignées (Ā, B̄, Ē) reçoivent un VRAI trait tracé au-dessus : le macron combinant est
 * décalé dans les polices d'impression.
 */

const ENCRE = "#1b1d22";
const DOUX = "#5c6370";
const FOND_ENTETE = "#eef0f2";
const POLICE = `font-family="Georgia, 'Times New Roman', serif"`;

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Étiquette d'en-tête : texte libre, ou symbole (italique, éventuellement surligné, indice). */
export type EtiquetteFigure = { texte: string } | { symbole: string; barre?: boolean; indice?: string };

/** Largeur approximative d'un texte (police serif ~ 0,55 em par caractère). */
function largeurTexte(texte: string, taille: number): number {
  return texte.length * taille * 0.55;
}

function largeurEtiquette(e: EtiquetteFigure, taille: number): number {
  return "texte" in e ? largeurTexte(e.texte, taille) : largeurTexte(e.symbole + (e.indice ?? ""), taille) + 4;
}

/** Étiquette centrée en (x, y) (y = ligne de base). */
function etiquetteSvg(e: EtiquetteFigure, x: number, y: number, taille: number, gras = false): string {
  const poids = gras ? ` font-weight="bold"` : "";
  if ("texte" in e) return `<text x="${x}" y="${y}" text-anchor="middle" font-size="${taille}" ${POLICE}${poids} fill="${ENCRE}">${echapper(e.texte)}</text>`;
  const w = largeurEtiquette(e, taille);
  const x0 = x - w / 2;
  let s = `<text x="${x0}" y="${y}" font-size="${taille}" font-style="italic" ${POLICE} fill="${ENCRE}">${echapper(e.symbole)}`;
  if (e.indice) s += `<tspan font-size="${Math.round(taille * 0.7)}" font-style="normal" dy="4">${echapper(e.indice)}</tspan>`;
  s += "</text>";
  if (e.barre) {
    const lb = largeurTexte(e.symbole, taille) + (e.indice ? largeurTexte(e.indice, taille * 0.7) : 0);
    s += `<line x1="${x0 + 1}" y1="${y - taille * 0.82}" x2="${x0 + lb + 2}" y2="${y - taille * 0.82}" stroke="${ENCRE}" stroke-width="1.2"/>`;
  }
  return s;
}

export interface TableauFigure {
  enTetesLignes: EtiquetteFigure[];
  enTetesColonnes: EtiquetteFigure[];
  /** Valeurs déjà formatées (`""` = case vide). */
  cellules: string[][];
  /** Dernière ligne / dernière colonne = totaux (en gras). */
  avecTotaux?: boolean;
}

/** Tableau à double entrée (SVG). */
export function tableauSvg(t: TableauFigure, libelle: string): string {
  const taille = 14;
  const hLigne = 28;
  const pad = 12;
  const largeurPremiere = Math.max(40, ...t.enTetesLignes.map((e) => largeurEtiquette(e, taille) + 2 * pad));
  const largeursColonnes = t.enTetesColonnes.map((e, j) => Math.max(52, largeurEtiquette(e, taille) + 2 * pad, ...t.cellules.map((l) => largeurTexte(l[j] ?? "", taille) + 2 * pad)));
  const W = Math.ceil(largeurPremiere + largeursColonnes.reduce((a, b) => a + b, 0)) + 2;
  const H = hLigne * (t.enTetesLignes.length + 1) + 2;
  const xs = [1, 1 + largeurPremiere];
  for (const w of largeursColonnes) xs.push(xs[xs.length - 1] + w);
  const nl = t.enTetesLignes.length;
  const nc = t.enTetesColonnes.length;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0.4em auto" role="img" aria-label="${echapper(libelle)}">`;
  s += `<rect x="1" y="1" width="${W - 2}" height="${hLigne}" fill="${FOND_ENTETE}"/><rect x="1" y="1" width="${largeurPremiere}" height="${H - 2}" fill="${FOND_ENTETE}"/>`;
  for (let i = 0; i <= nl + 1; i++) s += `<line x1="1" y1="${1 + i * hLigne}" x2="${W - 1}" y2="${1 + i * hLigne}" stroke="${DOUX}" stroke-width="${i === 0 || i === nl + 1 ? 1.2 : 0.8}"/>`;
  xs.forEach((x, j) => (s += `<line x1="${x}" y1="1" x2="${x}" y2="${H - 1}" stroke="${DOUX}" stroke-width="${j === 0 || j === xs.length - 1 ? 1.2 : 0.8}"/>`));
  const base = (i: number) => 1 + i * hLigne + hLigne / 2 + taille * 0.36;
  t.enTetesColonnes.forEach((e, j) => (s += etiquetteSvg(e, (xs[j + 1] + xs[j + 2]) / 2, base(0), taille, t.avecTotaux === true && j === nc - 1)));
  t.enTetesLignes.forEach((e, i) => {
    s += etiquetteSvg(e, (xs[0] + xs[1]) / 2, base(i + 1), taille, t.avecTotaux === true && i === nl - 1);
    t.cellules[i].forEach((v, j) => {
      const total = t.avecTotaux === true && (i === nl - 1 || j === nc - 1);
      s += `<text x="${(xs[j + 1] + xs[j + 2]) / 2}" y="${base(i + 1)}" text-anchor="middle" font-size="${taille}" ${POLICE}${total ? ` font-weight="bold"` : ""} fill="${ENCRE}">${echapper(v)}</text>`;
    });
  });
  return `${s}</svg>`;
}

export interface ArbreFigure {
  /** Étiquettes des deux nœuds du 1er niveau, puis des 4 feuilles (dans l'ordre haut → bas). */
  noeuds1: [EtiquetteFigure, EtiquetteFigure];
  feuilles: [EtiquetteFigure, EtiquetteFigure, EtiquetteFigure, EtiquetteFigure];
  /** Probabilités (texte déjà formaté) : 2 branches du 1er niveau, puis 4 du 2e niveau. */
  branches1: [string, string];
  branches2: [string, string, string, string];
  /** Texte à droite de chaque feuille (probabilité du chemin), facultatif. */
  chemins?: [string, string, string, string];
}

/** Arbre pondéré à deux niveaux (racine à gauche), même disposition que `WeightedTree`. */
export function arbreSvg(a: ArbreFigure, libelle: string): string {
  const W = a.chemins ? 470 : 360;
  const H = 230;
  const x0 = 18;
  const x1 = 150;
  const x2 = 290;
  const y0 = H / 2;
  const y1 = [H * 0.27, H * 0.73];
  const y2 = [H * 0.08, H * 0.37, H * 0.63, H * 0.92];
  const taille = 15;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0.4em auto" role="img" aria-label="${echapper(libelle)}">`;
  const proba = (texte: string, x: number, y: number) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${taille - 1}" ${POLICE} fill="${ENCRE}">${echapper(texte)}</text>`;
  a.noeuds1.forEach((e, i) => {
    s += `<line x1="${x0}" y1="${y0}" x2="${x1 - 6}" y2="${y1[i]}" stroke="${DOUX}" stroke-width="1.3"/>`;
    s += proba(a.branches1[i], (x0 + x1) / 2 - 4, (y0 + y1[i]) / 2 + (i === 0 ? -9 : 19));
    s += etiquetteSvg(e, x1 + 8, y1[i] + 5, taille + 1);
  });
  a.feuilles.forEach((e, k) => {
    const parent = k < 2 ? 0 : 1;
    const ya = y1[parent];
    s += `<line x1="${x1 + 24}" y1="${ya}" x2="${x2 - 6}" y2="${y2[k]}" stroke="${DOUX}" stroke-width="1.3"/>`;
    const mx = x1 + 24 + (x2 - 6 - x1 - 24) * 0.55;
    const my = ya + (y2[k] - ya) * 0.55 + (y2[k] < ya ? -8 : 17);
    s += proba(a.branches2[k], mx, my);
    s += etiquetteSvg(e, x2 + 8, y2[k] + 5, taille + 1);
    if (a.chemins) s += `<text x="${x2 + 28}" y="${y2[k] + 5}" font-size="${taille - 1}" ${POLICE} fill="${ENCRE}">${echapper(a.chemins[k])}</text>`;
  });
  s += `<circle cx="${x0}" cy="${y0}" r="2.6" fill="${ENCRE}"/></svg>`;
  return s;
}
