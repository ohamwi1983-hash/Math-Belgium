/**
 * Tableau de signes de f' et de variations de f, en SVG AUTONOME pour le corrigé imprimé
 * (`EtapeCorrection.figureHtml`) — couleurs littérales (impression), aucun DOM React. Même lecture
 * que le tableau de l'écran interactif (`components5e/TableauEtudeLocaleBuilder.tsx`) : une ligne de
 * la variable (bornes et zéros de f'), une ligne du signe de f' (0 sous chaque zéro), une ligne des
 * variations de f (flèches, valeur de f à chaque abscisse, placée en haut à un maximum et en bas à
 * un minimum). Premier usage : 5gen34 (extrema sur un intervalle fermé [0 ; T]).
 */

const ENCRE = "#1b1d22";
const DOUX = "#5c6370";
const POLICE = 'font-family="Archivo, Arial, Helvetica, sans-serif"';

export interface DonneesTableauVariations {
  /** Nom de la variable (« t », « x »). */
  variable: string;
  /** Libellés des lignes, texte Unicode (ex. « f′(t) », « f(t) »). */
  libelleDerivee: string;
  libelleFonction: string;
  /** Abscisses, dans l'ordre : bornes et zéros de f' (texte Unicode, « − » typographique). */
  abscisses: string[];
  /** Pour chaque abscisse : true si f' s'y annule (0 affiché dans la ligne de f'). */
  zeros: boolean[];
  /** Signe de f' sur chacun des `abscisses.length − 1` intervalles. */
  signes: ("+" | "−")[];
  /** Valeur de f à chaque abscisse (texte Unicode). */
  valeurs: string[];
}

function texte(x: number, y: number, contenu: string, options: { italique?: boolean; taille?: number; couleur?: string; ancre?: string } = {}): string {
  const { italique = false, taille = 14, couleur = ENCRE, ancre = "middle" } = options;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${italique ? ' font-style="italic"' : ""} ${POLICE}>${contenu}</text>`;
}

function ligne(x1: number, y1: number, x2: number, y2: number, epaisseur = 1, couleur = ENCRE): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"/>`;
}

function fleche(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const t = 7;
  const a1 = angle + Math.PI - 0.45;
  const a2 = angle + Math.PI + 0.45;
  const pointe = `${x2.toFixed(1)},${y2.toFixed(1)} ${(x2 + t * Math.cos(a1)).toFixed(1)},${(y2 + t * Math.sin(a1)).toFixed(1)} ${(x2 + t * Math.cos(a2)).toFixed(1)},${(y2 + t * Math.sin(a2)).toFixed(1)}`;
  return `${ligne(x1, y1, x2, y2, 1.2)}<polygon points="${pointe}" fill="${ENCRE}"/>`;
}

/** Une valeur est placée en haut si elle dépasse ses voisines (maximum, ou borne d'où f descend /
 * où f arrive en montant), en bas sinon. */
function enHaut(valeursNum: number[], i: number): boolean {
  const v = valeursNum[i];
  const voisins = [valeursNum[i - 1], valeursNum[i + 1]].filter((w) => w !== undefined);
  return voisins.every((w) => v > w);
}

export function construireSvgTableauVariations(d: DonneesTableauVariations, valeursNumeriques: number[]): string {
  const n = d.abscisses.length;
  const colLibelle = 74;
  const pas = n <= 4 ? 120 : 100;
  const largeur = colLibelle + 30 + pas * (n - 1) + 30;
  const hLigne1 = 30;
  const hLigne2 = 30;
  const hLigne3 = 70;
  const hauteur = hLigne1 + hLigne2 + hLigne3;
  const xNoeud = (i: number) => colLibelle + 30 + pas * i;
  const y1 = hLigne1;
  const y2 = hLigne1 + hLigne2;
  let s = "";
  // Cadre et séparateurs.
  s += `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="${ENCRE}" stroke-width="1"/>`;
  s += ligne(0, y1, largeur, y1);
  s += ligne(0, y2, largeur, y2);
  s += ligne(colLibelle, 0, colLibelle, hauteur);
  // Libellés de lignes.
  s += texte(colLibelle / 2, y1 / 2 + 5, d.variable, { italique: true });
  s += texte(colLibelle / 2, y1 + hLigne2 / 2 + 5, d.libelleDerivee, { italique: true });
  s += texte(colLibelle / 2, y2 + hLigne3 / 2 + 5, d.libelleFonction, { italique: true });
  // Ligne de la variable.
  d.abscisses.forEach((a, i) => (s += texte(xNoeud(i), y1 / 2 + 5, a)));
  // Ligne du signe de f' : 0 et trait vertical pointillé sous chaque zéro, signe au milieu des intervalles.
  d.abscisses.forEach((_, i) => {
    if (d.zeros[i]) {
      s += texte(xNoeud(i), y1 + hLigne2 / 2 + 5, "0");
      const yMilieu = y1 + hLigne2 / 2;
      for (const [ya, yb] of [[y1, yMilieu - 8], [yMilieu + 8, y2]]) s += `<line x1="${xNoeud(i)}" y1="${ya}" x2="${xNoeud(i)}" y2="${yb}" stroke="${DOUX}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
    }
  });
  d.signes.forEach((signe, i) => (s += texte((xNoeud(i) + xNoeud(i + 1)) / 2, y1 + hLigne2 / 2 + 5, signe, { taille: 15 })));
  // Ligne des variations.
  const yHaut = y2 + 18;
  const yBas = y2 + hLigne3 - 8;
  const positions = d.valeurs.map((_, i) => (enHaut(valeursNumeriques, i) ? yHaut : yBas));
  d.valeurs.forEach((v, i) => (s += texte(xNoeud(i), positions[i], v, { taille: 13 })));
  for (let i = 0; i < n - 1; i++) {
    const depart = { x: xNoeud(i) + 18, y: positions[i] === yHaut ? yHaut + 5 : yBas - 14 };
    const arrivee = { x: xNoeud(i + 1) - 18, y: positions[i + 1] === yHaut ? yHaut + 5 : yBas - 14 };
    s += fleche(depart.x, depart.y, arrivee.x, arrivee.y);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" role="img" aria-label="Tableau de signes de la dérivée et de variations">${s}</svg>`;
}
