import type { ConfigurationFamilleF, ExerciceBayesNumerique } from "../core6e/probabilitesProblemes.types";

/**
 * Figures PAPIER de `6gen33` (feuilles d'exercices et évaluations, audit 6e ch. 6, décision I) —
 * chaînes SVG/HTML AUTONOMES, statiques, en noir et blanc (lisibles à la photocopie) :
 * - schéma d'un montage série / parallèle / mixte (énoncé de la famille F) ;
 * - arbre des chemins des épreuves répétées (corrigé de la famille B) : les chemins à k succès sont
 *   en gras ; au-delà de 4 épreuves (32 chemins), la liste des 32 chemins remplace l'arbre ;
 * - arbre pondéré c₁ / c₂ puis E / Ē (corrigé de la famille E), avec la probabilité de chaque chemin.
 * Largeur 100 % plafonnée, aucune couleur : traits noirs, gris pour le secondaire.
 */

const NOIR = "#000";
const GRIS = "#555";
const POLICE = `font-family="Georgia, 'Times New Roman', serif"`;

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function nb(v: number): string {
  return String(Math.round(v * 100) / 100);
}
/** Nombre en écriture française : exact s'il a au plus `d` décimales, sinon arrondi (préfixé de « ≈ »
 * par l'appelant si besoin). */
function virgule(v: number, d: number): string {
  return String(Number(v.toFixed(d))).replace(".", ",");
}
function estDecimalCourt(v: number, d: number): boolean {
  return Math.abs(Number(v.toFixed(d)) - v) < 1e-10;
}
function ouvrirSvg(w: number, h: number, libelle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px;display:block;margin:0.3em auto" role="img" aria-label="${echapper(libelle)}">`;
}

// ============================================================================
// Famille F — schéma d'un montage.
// ============================================================================

const BOITE_L = 96;
const BOITE_H = 26;

function boite(cx: number, cy: number, label: string): string {
  return (
    `<rect x="${nb(cx - BOITE_L / 2)}" y="${nb(cy - BOITE_H / 2)}" width="${BOITE_L}" height="${BOITE_H}" fill="#fff" stroke="${NOIR}" stroke-width="1.4"/>` +
    `<text x="${nb(cx)}" y="${nb(cy + 4.5)}" text-anchor="middle" font-size="13" ${POLICE} fill="${NOIR}">${echapper(label)}</text>`
  );
}
function trait(x1: number, y1: number, x2: number, y2: number): string {
  return `<line x1="${nb(x1)}" y1="${nb(y1)}" x2="${nb(x2)}" y2="${nb(y2)}" stroke="${NOIR}" stroke-width="1.4"/>`;
}
function borne(x: number, y: number, texte: string, ancre: "start" | "end"): string {
  return `<circle cx="${nb(x)}" cy="${nb(y)}" r="3" fill="${NOIR}"/><text x="${nb(ancre === "end" ? x - 6 : x + 6)}" y="${nb(y - 7)}" text-anchor="${ancre}" font-size="11" ${POLICE} fill="${GRIS}">${texte}</text>`;
}
/** Groupe de deux ou trois composants en parallèle entre `xa` et `xb` (lignes verticales de liaison). */
function groupeParallele(xa: number, xb: number, yc: number, labels: string[]): string {
  const ecart = 36;
  const ys = labels.map((_, i) => yc + (i - (labels.length - 1) / 2) * ecart);
  const cx = (xa + xb) / 2;
  let s = trait(xa, ys[0], xa, ys[ys.length - 1]) + trait(xb, ys[0], xb, ys[ys.length - 1]);
  ys.forEach((y, i) => {
    s += trait(xa, y, cx - BOITE_L / 2, y) + trait(cx + BOITE_L / 2, y, xb, y) + boite(cx, y, labels[i]);
  });
  return s;
}

/** Schéma d'un montage de 3 composants (`labels` dans l'ordre des données). `position` : composant
 * seul en série dans un montage mixte. */
export function schemaMontageSvg(labels: [string, string, string], configuration: ConfigurationFamilleF, position: 0 | 1 | 2 | undefined, titre: string): string {
  const W = 420;
  if (configuration === "serie") {
    const H = 60;
    const y = 34;
    let s = ouvrirSvg(W, H, titre) + trait(14, y, W - 14, y);
    [80, 210, 340].forEach((cx, i) => (s += boite(cx, y, labels[i])));
    return s + borne(14, y, "entrée", "start") + borne(W - 14, y, "sortie", "end") + "</svg>";
  }
  if (configuration === "parallele") {
    const H = 130;
    const y = 68;
    let s = ouvrirSvg(W, H, titre) + trait(14, y, 130, y) + trait(290, y, W - 14, y) + groupeParallele(130, 290, y, labels);
    return s + borne(14, y, "entrée", "start") + borne(W - 14, y, "sortie", "end") + "</svg>";
  }
  const solo = position ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo).map((i) => labels[i]);
  const H = 100;
  const y = 52;
  let s = ouvrirSvg(W, H, titre) + trait(14, y, 230, y) + trait(370, y, W - 14, y) + boite(110, y, labels[solo]) + groupeParallele(230, 370, y, autres);
  return s + borne(14, y, "entrée", "start") + borne(W - 14, y, "sortie", "end") + "</svg>";
}

/** Deux schémas côte à côte (ou l'un sous l'autre à l'étroit), chacun avec sa légende. */
export function deuxSchemasHtml(gauche: { svg: string; legende: string }, droite: { svg: string; legende: string }): string {
  const carte = (c: { svg: string; legende: string }) =>
    `<figure style="flex:1 1 260px;margin:0;min-width:0">${c.svg}<figcaption style="text-align:center;font-size:0.9em;color:${GRIS}">${echapper(c.legende)}</figcaption></figure>`;
  return `<div style="display:flex;flex-wrap:wrap;gap:0.6em 1.2em;align-items:center;margin:0.4em 0">${carte(gauche)}${carte(droite)}</div>`;
}

// ============================================================================
// Famille B — arbre des chemins des épreuves répétées.
// ============================================================================

function nombreS(mot: string): number {
  return [...mot].filter((c) => c === "S").length;
}

/** Arbre des 2ⁿ chemins (n ≤ 4, HTML : SVG + légende qui peut passer à la ligne), racine à gauche, S en haut et É en bas à chaque nœud ; les
 * chemins à exactement `k` succès sont tracés en trait épais et leur mot est en gras. Pour n = 5,
 * la liste des 32 chemins (mêmes conventions). */
export function arbreCheminsSvg(n: number, k: number, p: string, q: string): string {
  const titre = `Arbre des ${n} épreuves : chemins à exactement ${k} succès`;
  const legendeBranches = `Branche S : probabilité ${p} ; branche É : probabilité ${q}. En gras : les chemins à exactement ${k} succès.`;
  if (n >= 5) {
    const mots = Array.from({ length: 2 ** n }, (_, i) => motCheminDepuisRang(i, n));
    const cellules = mots
      .map((m) => {
        const bon = nombreS(m) === k;
        return `<td style="padding:0.15em 0.5em;font-family:Georgia,'Times New Roman',serif;${bon ? "font-weight:700;border:1.5px solid #000" : `color:${GRIS};border:1px solid #bbb`}">${m}</td>`;
      })
      .reduce<string[]>((lignes, td, i) => {
        if (i % 8 === 0) lignes.push("");
        lignes[lignes.length - 1] += td;
        return lignes;
      }, []);
    return `<div style="margin:0.3em auto;max-width:100%;overflow-x:auto"><table style="border-collapse:collapse;margin:0 auto;font-size:0.95em">${cellules.map((l) => `<tr>${l}</tr>`).join("")}</table><p style="text-align:center;font-size:0.88em;color:${GRIS};margin:0.3em 0 0">Les ${2 ** n} chemins de l'arbre. ${echapper(legendeBranches)}</p></div>`;
  }
  const feuilles = 2 ** n;
  const pas = n <= 3 ? 26 : 17;
  const W = 420;
  const H = feuilles * pas + 20;
  const xNiveau = (i: number) => 18 + (i * 250) / n;
  const yFeuille = (j: number) => 14 + j * pas + pas / 2;
  const yNoeud = (niveau: number, indice: number) => {
    const largeur = feuilles / 2 ** niveau;
    return (yFeuille(indice * largeur) + yFeuille(indice * largeur + largeur - 1)) / 2;
  };
  let s = ouvrirSvg(W, H, titre);
  // indice de nœud au niveau `niveau` : bits de tête du chemin (S = 0 → en haut).
  for (let niveau = 0; niveau < n; niveau++) {
    for (let indice = 0; indice < 2 ** niveau; indice++) {
      for (const branche of [0, 1]) {
        const enfant = indice * 2 + branche;
        const largeur = feuilles / 2 ** (niveau + 1);
        // Une branche est en gras si au moins un chemin à k succès passe par elle.
        let utile = false;
        for (let j = enfant * largeur; j < (enfant + 1) * largeur; j++) if (nombreS(motCheminDepuisRang(j, n)) === k) utile = true;
        const x1 = xNiveau(niveau);
        const y1 = yNoeud(niveau, indice);
        const x2 = xNiveau(niveau + 1);
        const y2 = yNoeud(niveau + 1, enfant);
        s += `<line x1="${nb(x1)}" y1="${nb(y1)}" x2="${nb(x2)}" y2="${nb(y2)}" stroke="${utile ? NOIR : "#999"}" stroke-width="${utile ? 2.2 : 1}"/>`;
        // Lettre de la branche près du nœud d'arrivée — sauf au dernier niveau, où le mot de la
        // feuille la donne déjà (et où les feuilles, trop serrées, la feraient chevaucher).
        if (niveau < n - 1) s += `<text x="${nb(x2 - 9)}" y="${nb(y2 + (branche === 0 ? -4 : 13))}" text-anchor="end" font-size="12" ${POLICE} fill="${GRIS}">${branche === 0 ? "S" : "É"}</text>`;
      }
    }
  }
  for (let j = 0; j < feuilles; j++) {
    const mot = motCheminDepuisRang(j, n);
    const bon = nombreS(mot) === k;
    s += `<text x="${nb(xNiveau(n) + 8)}" y="${nb(yFeuille(j) + 4)}" font-size="${n <= 3 ? 13 : 11}" ${POLICE} fill="${bon ? NOIR : GRIS}"${bon ? ' font-weight="700"' : ""}>${mot}${bon ? "  ←" : ""}</text>`;
  }
  return `<div>${s}</svg><p style="text-align:center;font-size:0.88em;color:${GRIS};margin:0.2em 0 0">${echapper(legendeBranches)}</p></div>`;
}
/** Les chemins (mots en S/É) à exactement k succès, dans l'ordre de l'arbre (S en haut). */
export function cheminsAKSucces(n: number, k: number): string[] {
  return Array.from({ length: 2 ** n }, (_, j) => motCheminDepuisRang(j, n)).filter((m) => nombreS(m) === k);
}
/** Mot du j-ième chemin de haut en bas (S en haut à chaque nœud). */
function motCheminDepuisRang(j: number, n: number): string {
  let mot = "";
  for (let i = n - 1; i >= 0; i--) mot += (j >> i) & 1 ? "É" : "S";
  return mot;
}

// ============================================================================
// Famille E — arbre pondéré c₁ / c₂ puis E / Ē.
// ============================================================================

/** Étiquette italique avec indice (c₁) ou barre (Ē) tracée — le macron combinant est mal placé dans
 * les polices d'impression. */
function etiquette(lettre: string, indice: string | null, barre: boolean, x: number, y: number): string {
  let s = `<text x="${nb(x)}" y="${nb(y)}" font-size="16" font-style="italic" ${POLICE} fill="${NOIR}">${lettre}${indice ? `<tspan font-size="11" dy="4" font-style="normal">${indice}</tspan>` : ""}</text>`;
  if (barre) s += `<line x1="${nb(x + 1)}" y1="${nb(y - 14)}" x2="${nb(x + 11)}" y2="${nb(y - 14)}" stroke="${NOIR}" stroke-width="1.2"/>`;
  return s;
}
function probaTexte(v: number): string {
  return estDecimalCourt(v, 4) ? virgule(v, 4) : `≈ ${virgule(v, 4)}`;
}

/** Arbre pondéré du problème de Bayes (corrigé) : probabilités des 6 branches et des 4 chemins ; le
 * chemin utile à la question (c₁ ∩ E ou c₁ ∩ Ē) est en trait épais. */
export function arbreBayesSvg(base: ExerciceBayesNumerique): string {
  const W = 430;
  const H = 230;
  const x0 = 20;
  const x1 = 160;
  const x2 = 300;
  const y0 = H / 2;
  const y1 = [H * 0.27, H * 0.73];
  const y2 = [H * 0.09, H * 0.39, H * 0.61, H * 0.91];
  const effet = base.demandeEcran3 === "cause1SachantEffet";
  const branches1 = [base.p, 1 - base.p];
  const branches2 = [base.q1, 1 - base.q1, base.q2, 1 - base.q2];
  const chemins = [base.p * base.q1, base.p * (1 - base.q1), (1 - base.p) * base.q2, (1 - base.p) * (1 - base.q2)];
  const utile = effet ? 0 : 1;
  let s = ouvrirSvg(W, H, "Arbre pondéré : cause, puis effet");
  branches1.forEach((v, i) => {
    const gras = i === 0;
    s += `<line x1="${x0}" y1="${nb(y0)}" x2="${x1}" y2="${nb(y1[i])}" stroke="${NOIR}" stroke-width="${gras ? 2.2 : 1.2}"/>`;
    s += `<text x="${nb((x0 + x1) / 2)}" y="${nb((y0 + y1[i]) / 2 + (i === 0 ? -8 : 17))}" text-anchor="middle" font-size="13" ${POLICE} fill="${NOIR}">${virgule(v, 4)}</text>`;
    s += `<circle cx="${x1}" cy="${nb(y1[i])}" r="2.6" fill="${NOIR}"/>` + etiquette("c", i === 0 ? "1" : "2", false, x1 + 7, y1[i] - 7);
  });
  branches2.forEach((v, i) => {
    const parent = i < 2 ? 0 : 1;
    const gras = i === utile;
    const ya = y1[parent];
    s += `<line x1="${x1}" y1="${nb(ya)}" x2="${x2}" y2="${nb(y2[i])}" stroke="${NOIR}" stroke-width="${gras ? 2.2 : 1.2}"/>`;
    s += `<text x="${nb(x1 + (x2 - x1) * 0.55)}" y="${nb(ya + (y2[i] - ya) * 0.55 + (y2[i] < ya ? -6 : 15))}" text-anchor="middle" font-size="13" ${POLICE} fill="${NOIR}">${virgule(v, 4)}</text>`;
    s += `<circle cx="${x2}" cy="${nb(y2[i])}" r="2.6" fill="${NOIR}"/>` + etiquette("E", null, i % 2 === 1, x2 + 7, y2[i] + 5);
    s += `<text x="${x2 + 30}" y="${nb(y2[i] + 5)}" font-size="12" ${POLICE} fill="${gras ? NOIR : GRIS}"${gras ? ' font-weight="700"' : ""}>${probaTexte(chemins[i])}</text>`;
  });
  return s + `<circle cx="${x0}" cy="${nb(y0)}" r="2.6" fill="${NOIR}"/></svg>`;
}
