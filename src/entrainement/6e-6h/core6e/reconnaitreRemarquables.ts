/**
 * Couche A — modèle de `6gen125` « Reconnaître droites, points et cercles remarquables » (6e ch. 9,
 * § 1–§ 2, Connaître). Une figure (triangle ABC acutangle, scalène, sans repère) montre en couleur une
 * droite, un point ou un cercle remarquable, avec ses CODAGES (moitiés égales, angle droit, angles
 * égaux, points de contact) : l'élève le nomme (verdict tiré à parts égales AVANT le triangle), puis
 * donne la propriété qui va avec (point de concours, propriété du point, centre du cercle). Deux choix
 * fermés à une tentative.
 */

export type Famille125 = "droite" | "point" | "cercle";
export type Objet125 =
  | "mediane"
  | "hauteur"
  | "mediatrice"
  | "bissectrice"
  | "G"
  | "H"
  | "O"
  | "I"
  | "circonscrit"
  | "inscrit"
  | "exinscrit"
  | "neufPoints";
export type Phase125 = "objet" | "propriete";
export const PHASES_125: Phase125[] = ["objet", "propriete"];

export const OBJETS_125: Record<Famille125, Objet125[]> = {
  droite: ["mediane", "hauteur", "mediatrice", "bissectrice"],
  point: ["G", "H", "O", "I"],
  cercle: ["circonscrit", "inscrit", "exinscrit", "neufPoints"],
};

export interface Pt {
  x: number;
  y: number;
}

export interface Exercice125 {
  famille: Famille125;
  objet: Objet125;
  /** Sommets (coordonnées de figure, axe y vers le haut). */
  A: Pt;
  B: Pt;
  C: Pt;
  /** Sommet de la droite (médiane, hauteur, bissectrice), côté opposé à ce sommet pour la médiatrice,
   * sommet opposé au côté tangent pour le cercle exinscrit : 0 = A, 1 = B, 2 = C. */
  sommet: 0 | 1 | 2;
  /** Noms des sommets (« A, B, C », « M, N, P »…). */
  noms: [string, string, string];
}

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const NOMS: [string, string, string][] = [
  ["A", "B", "C"],
  ["D", "E", "F"],
  ["K", "L", "M"],
  ["R", "S", "T"],
];

/** Triangle acutangle scalène : angles dans [44° ; 80°], deux à deux écartés d'au moins 9°. */
function tirerTriangle(): { A: Pt; B: Pt; C: Pt } {
  for (;;) {
    const a = 44 + Math.random() * 36;
    const b = 44 + Math.random() * 36;
    const c = 180 - a - b;
    if (c < 44 || c > 80) continue;
    if (Math.abs(a - b) < 9 || Math.abs(b - c) < 9 || Math.abs(a - c) < 9) continue;
    const ra = (a * Math.PI) / 180;
    const rb = (b * Math.PI) / 180;
    // Base AB de longueur 10, C au-dessus.
    const AB = 10;
    const AC = (AB * Math.sin(rb)) / Math.sin(ra + rb);
    let A: Pt = { x: 0, y: 0 };
    let B: Pt = { x: AB, y: 0 };
    let C: Pt = { x: AC * Math.cos(ra), y: AC * Math.sin(ra) };
    // Rotation légère et symétrie éventuelle : la base n'est pas toujours horizontale.
    const th = ((Math.random() * 30 - 15) * Math.PI) / 180;
    const rot = (p: Pt): Pt => ({ x: p.x * Math.cos(th) - p.y * Math.sin(th), y: p.x * Math.sin(th) + p.y * Math.cos(th) });
    A = rot(A);
    B = rot(B);
    C = rot(C);
    if (Math.random() < 0.5) {
      A = { x: -A.x, y: A.y };
      B = { x: -B.x, y: B.y };
      C = { x: -C.x, y: C.y };
    }
    return { A, B, C };
  }
}

export function tirer125(famille: Famille125, objet?: Objet125): Exercice125 {
  const o = objet ?? parmi(OBJETS_125[famille]);
  const { A, B, C } = tirerTriangle();
  return { famille, objet: o, A, B, C, sommet: parmi([0, 1, 2] as const), noms: parmi(NOMS) };
}

// ---------------------------------------------------------------------------------------------
// Géométrie du triangle (coordonnées de figure)
// ---------------------------------------------------------------------------------------------

export const sommets125 = (e: Exercice125): [Pt, Pt, Pt] => [e.A, e.B, e.C];
const d = (P: Pt, Q: Pt) => Math.hypot(Q.x - P.x, Q.y - P.y);
export const mil = (P: Pt, Q: Pt): Pt => ({ x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 });

/** Pied de la perpendiculaire issue de P sur la droite (QR). */
export function pied(P: Pt, Q: Pt, R: Pt): Pt {
  const ux = R.x - Q.x;
  const uy = R.y - Q.y;
  const k = ((P.x - Q.x) * ux + (P.y - Q.y) * uy) / (ux * ux + uy * uy);
  return { x: Q.x + k * ux, y: Q.y + k * uy };
}

/** Pied de la bissectrice intérieure issue de P sur [QR] (théorème de la bissectrice). */
export function piedBissectrice(P: Pt, Q: Pt, R: Pt): Pt {
  const pq = d(P, Q);
  const pr = d(P, R);
  const k = pq / (pq + pr);
  return { x: Q.x + k * (R.x - Q.x), y: Q.y + k * (R.y - Q.y) };
}

export function centreGravite(A: Pt, B: Pt, C: Pt): Pt {
  return { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
}

export function centreCirconscrit(A: Pt, B: Pt, C: Pt): Pt {
  const D = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  const a2 = A.x ** 2 + A.y ** 2;
  const b2 = B.x ** 2 + B.y ** 2;
  const c2 = C.x ** 2 + C.y ** 2;
  return { x: (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / D, y: (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / D };
}

export function orthocentre(A: Pt, B: Pt, C: Pt): Pt {
  const O = centreCirconscrit(A, B, C);
  return { x: A.x + B.x + C.x - 2 * O.x, y: A.y + B.y + C.y - 2 * O.y };
}

/** Centre et rayon du cercle inscrit. */
export function cercleInscrit(A: Pt, B: Pt, C: Pt): { centre: Pt; r: number } {
  const a = d(B, C);
  const b = d(A, C);
  const c = d(A, B);
  const p = a + b + c;
  const centre = { x: (a * A.x + b * B.x + c * C.x) / p, y: (a * A.y + b * B.y + c * C.y) / p };
  const s = p / 2;
  const aire = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return { centre, r: aire / s };
}

/** Cercle exinscrit tangent au côté opposé au sommet `P` (sommets dans l'ordre P, Q, R). */
export function cercleExinscrit(P: Pt, Q: Pt, R: Pt): { centre: Pt; r: number } {
  const a = d(Q, R);
  const b = d(P, R);
  const c = d(P, Q);
  const den = -a + b + c;
  const centre = { x: (-a * P.x + b * Q.x + c * R.x) / den, y: (-a * P.y + b * Q.y + c * R.y) / den };
  const s = (a + b + c) / 2;
  const aire = Math.sqrt(s * (s - a) * (s - b) * (s - c));
  return { centre, r: aire / (s - a) };
}

/** Sommets dans l'ordre (sommet choisi, puis les deux autres). */
export function ordreDepuis(e: Exercice125): { P: Pt; Q: Pt; R: Pt; nP: string; nQ: string; nR: string } {
  const S = sommets125(e);
  const i = e.sommet;
  const j = ((i + 1) % 3) as 0 | 1 | 2;
  const k = ((i + 2) % 3) as 0 | 1 | 2;
  return { P: S[i], Q: S[j], R: S[k], nP: e.noms[i], nQ: e.noms[j], nR: e.noms[k] };
}

export const bonneOption125 = (e: Exercice125, p: Phase125): string => (p === "objet" ? e.objet : e.objet);
