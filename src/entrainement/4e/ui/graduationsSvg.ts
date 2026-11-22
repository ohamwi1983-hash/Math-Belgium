/**
 * Graduations lisibles des figures SVG du 4e ch. 7 (audit, lot B : gen43, gen49, gen51 à l'écran et
 * sur papier ; lot C : figures de gen47 et gen132) :
 * - vrai signe « − » (jamais le tiret « - »), virgule décimale ;
 * - un nombre écrit seulement tous les 1, 2, 5 ou 10 carreaux, assez espacés pour ne jamais se
 *   toucher (« 9-−8-−7… » sur un axe serré) ;
 * - un nombre qui toucherait un point marqué, son nom ou une autre étiquette passe de l'autre côté de
 *   l'axe, sinon n'est pas écrit (jamais caché sous un point).
 */

export interface Boite {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Disque (point marqué) → boîte englobante, agrandie d'une marge. */
export function boiteDisque(x: number, y: number, r: number, marge = 1.5): Boite {
  return { x1: x - r - marge, y1: y - r - marge, x2: x + r + marge, y2: y + r + marge };
}

/** « −3 », « 2,5 » : nombre d'une graduation. */
export function texteGraduation(v: number): string {
  const brut = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace(/0+$/, "").replace(".", ",");
  return brut.replace("-", "−");
}

/** Largeur estimée d'un texte SVG (police sans empattement, chiffres ≈ 0,6 em, « − » ≈ 0,7 em). */
export function largeurTexte(texte: string, taille: number): number {
  let l = 0;
  for (const c of texte) l += c === "−" ? 0.7 : c === "," ? 0.3 : 0.6;
  return l * taille;
}

/** Boîte d'un texte SVG (ligne de base `y`, ancre horizontale). */
export function boiteTexte(x: number, y: number, texte: string, taille: number, ancre: "start" | "middle" | "end"): Boite {
  const l = largeurTexte(texte, taille);
  const x1 = ancre === "start" ? x : ancre === "middle" ? x - l / 2 : x - l;
  return { x1, y1: y - 0.75 * taille, x2: x1 + l, y2: y + 0.2 * taille };
}

export function chevauche(a: Boite, b: Boite): boolean {
  return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
}

/** Pas des nombres écrits (1, 2, 5, 10, 20 carreaux) : le plus petit qui laisse au moins 4 px entre
 * deux nombres voisins de l'axe horizontal. */
export function pasGraduations(pixelsParUnite: number, min: number, max: number, taille: number): number {
  const plusLong = Math.max(largeurTexte(texteGraduation(Math.floor(min)), taille), largeurTexte(texteGraduation(Math.ceil(max)), taille));
  for (const pas of [1, 2, 5, 10, 20, 50]) {
    if (pas * pixelsParUnite >= plusLong + 4) return pas;
  }
  return 100;
}

export interface Graduation {
  /** Abscisse (axe des x) ou ordonnée (axe des y) du nombre. */
  valeur: number;
  /** Position principale (sous / à gauche de l'axe) et position de repli (de l'autre côté). */
  x: number;
  y: number;
  xRepli: number;
  yRepli: number;
  ancre: "start" | "middle" | "end";
  ancreRepli: "start" | "middle" | "end";
}

/**
 * Nombres des axes, placés sans toucher aucun obstacle (points, noms, droites étiquetées) ni un
 * autre nombre : position principale, sinon de l'autre côté de l'axe, sinon rien. Les boîtes des
 * nombres écrits sont ajoutées aux obstacles (pour les étiquettes posées ensuite).
 */
export function graduationsSansChevauchement(
  graduations: Graduation[],
  obstacles: Boite[],
  options: { taille: number; couleur: string; halo?: boolean },
): string {
  const sortie: string[] = [];
  const halo = options.halo === false ? "" : ' stroke="#ffffff" stroke-width="3" paint-order="stroke"';
  for (const g of graduations) {
    const texte = texteGraduation(g.valeur);
    const essais: [number, number, "start" | "middle" | "end"][] = [
      [g.x, g.y, g.ancre],
      [g.xRepli, g.yRepli, g.ancreRepli],
    ];
    for (const [x, y, ancre] of essais) {
      const b = boiteTexte(x, y, texte, options.taille, ancre);
      if (obstacles.some((o) => chevauche(o, b))) continue;
      obstacles.push(b);
      sortie.push(`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${options.taille}" text-anchor="${ancre}" fill="${options.couleur}"${halo}>${texte}</text>`);
      break;
    }
  }
  return sortie.join("");
}
