import { COULEURS } from "./figureRepereIntegrales";

/**
 * Figures PAPIER de `6gen31` (tirages et arbres) : arbre des tirages à 2 ou 3 niveaux, en SVG
 * statique autonome (pas de Mafs) — énoncé de la famille D (structure de l'arbre, branches
 * désignées par p₁…p₆) et corrigé (branches en fractions, probabilité de chaque chemin au bout).
 * Même disposition que `WeightedTree` des chapitres : racine à gauche, un niveau par tirage.
 * Couleurs `var(--x, #repli)` (repli noir/gris lisible en noir et blanc à l'impression).
 */

/** Étiquette d'une branche : fraction (empilée) ou texte court (« p₃ », en italique). */
export type EtiquetteBranche = { fraction: [number, number] } | { texte: string };

export interface OptionsArbreTirages {
  /** Nombre de tirages (niveaux de l'arbre). */
  profondeur: 2 | 3;
  /** Initiales portées par les nœuds, couleur 0 puis couleur 1. */
  initiales: [string, string];
  /** Étiquette de la branche qui aboutit au chemin `chemin` (longueur 1 à `profondeur`). */
  etiquette: (chemin: number[]) => EtiquetteBranche;
  /** Probabilité du chemin complet, écrite au bout de la feuille (corrigé) ; absent = rien. */
  feuille?: (chemin: number[]) => [number, number] | null;
  libelle: string;
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const POLICE = `font-family="Georgia, 'Times New Roman', serif"`;

/** Fraction empilée centrée en (x, y) — y = hauteur de la barre. */
function fractionSvg(num: number, den: number, x: number, y: number, taille: number): string {
  if (den === 1) return `<text x="${x}" y="${y + taille * 0.35}" text-anchor="middle" font-size="${taille}" ${POLICE} fill="${COULEURS.encre}">${num}</text>`;
  const largeur = Math.max(String(num).length, String(den).length) * taille * 0.58 + 4;
  return (
    `<text x="${x}" y="${y - 3}" text-anchor="middle" font-size="${taille}" ${POLICE} fill="${COULEURS.encre}">${num}</text>` +
    `<line x1="${x - largeur / 2}" y1="${y}" x2="${x + largeur / 2}" y2="${y}" stroke="${COULEURS.encre}" stroke-width="1"/>` +
    `<text x="${x}" y="${y + taille - 1}" text-anchor="middle" font-size="${taille}" ${POLICE} fill="${COULEURS.encre}">${den}</text>`
  );
}

/** Demi-hauteur occupée par une étiquette (pour l'écarter de sa branche). */
function demiHauteur(e: EtiquetteBranche, taille: number): number {
  return "fraction" in e && e.fraction[1] !== 1 ? taille : taille * 0.5;
}

function etiquetteSvg(e: EtiquetteBranche, x: number, y: number, taille: number): string {
  if ("fraction" in e) return fractionSvg(e.fraction[0], e.fraction[1], x, y, taille);
  return `<text x="${x}" y="${y + taille * 0.35}" text-anchor="middle" font-size="${taille + 1}" font-style="italic" ${POLICE} fill="${COULEURS.encre}">${echapper(e.texte)}</text>`;
}

function pgcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a) || 1;
}

export function arbreTiragesSvg(o: OptionsArbreTirages): string {
  const k = o.profondeur;
  const taille = k === 2 ? 15 : 13;
  const ecartFeuilles = k === 2 ? 62 : 50;
  const nbFeuilles = 2 ** k;
  const avecFeuilles = o.feuille !== undefined;
  const pasX = k === 2 ? 150 : 120;
  const x0 = 18;
  const W = x0 + k * pasX + (avecFeuilles ? 110 : 40);
  const H = nbFeuilles * ecartFeuilles + 10;
  const yFeuille = (i: number) => 5 + ecartFeuilles / 2 + i * ecartFeuilles;
  /** Ordonnée d'un nœud = milieu de ses feuilles. */
  const yNoeud = (chemin: number[]) => {
    const indice = chemin.reduce((acc, c) => acc * 2 + c, 0);
    const largeur = 2 ** (k - chemin.length);
    return (yFeuille(indice * largeur) + yFeuille(indice * largeur + largeur - 1)) / 2;
  };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block;margin:0.4em auto" role="img" aria-label="${echapper(o.libelle)}">`;
  const parcourir = (chemin: number[]) => {
    const d = chemin.length;
    if (d === k) return;
    const xa = x0 + d * pasX;
    const ya = yNoeud(chemin);
    for (const c of [0, 1]) {
      const enfant = [...chemin, c];
      const xb = x0 + (d + 1) * pasX;
      const yb = yNoeud(enfant);
      s += `<line x1="${xa + (d === 0 ? 0 : 12)}" y1="${ya}" x2="${xb - 4}" y2="${yb}" stroke="${COULEURS.doux}" stroke-width="1.3"/>`;
      const e = o.etiquette(enfant);
      // Étiquette au milieu de la branche, écartée vers l'extérieur (au-dessus de la branche du haut,
      // en dessous de celle du bas) : deux branches sœurs ne se chevauchent jamais.
      const t = 0.5;
      const mx = xa + (xb - xa) * t;
      const my = ya + (yb - ya) * t;
      const ecart = demiHauteur(e, taille) + 5;
      s += etiquetteSvg(e, mx, c === 0 ? my - ecart : my + ecart, taille);
      s += `<text x="${xb}" y="${yb + 5}" font-size="${taille + 2}" ${POLICE} fill="${COULEURS.encre}">${echapper(o.initiales[c])}</text>`;
      if (enfant.length === k && o.feuille) {
        const f = o.feuille(enfant);
        if (f) {
          const g = pgcd(f[0], f[1]);
          s += fractionSvg(f[0] / g, f[1] / g, xb + 62, yb, taille);
          s += `<line x1="${xb + 18}" y1="${yb}" x2="${xb + 40}" y2="${yb}" stroke="${COULEURS.pale}" stroke-width="1" stroke-dasharray="2 2"/>`;
        }
      }
      parcourir(enfant);
    }
  };
  parcourir([]);
  s += `<circle cx="${x0}" cy="${yNoeud([])}" r="2.6" fill="${COULEURS.encre}"/></svg>`;
  return s;
}
