/**
 * Couche A (5e) — mathématiques pures pour 5gen30 : courbe construite MORCEAU PAR MORCEAU (voir
 * `core5e/lectureGraphiqueDerivees.types.ts`). Une branche par intervalle entre asymptotes
 * verticales ; chaque branche = gabarit gauche + segments d'Hermite par les points clés + gabarit droit.
 *
 * Contraintes de raccord (pente nulle aux points clés, pente du gabarit aux raccords) choisies pour
 * que, dans chaque branche :
 *   - f' ne s'annule QU'aux points clés (segments d'Hermite monotones, gabarits monotones) ;
 *   - la concavité ne change pas de signe à un raccord (f'' du gabarit et du segment voisin de même
 *     signe) — les points d'inflexion tombent donc à l'intérieur des segments d'Hermite (f'' y est
 *     affine) ou en un palier.
 * Tout est re-contrôlé ANALYTIQUEMENT après construction (`analyserCourbe`) : une tentative qui
 * enfreint une règle est rejetée, jamais affichée.
 *
 * Les gabarits atteignent l'asymptote annoncée à moins de 0,05 au bord de la fenêtre (vérifié dans
 * `analyserCourbe`) : la courbe tend visiblement vers la droite tracée en pointillés.
 */
import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type {
  ExerciceLectureGraphiqueDerivees,
  ExtremumLectureGraphiqueDerivees,
  InflexionLectureGraphiqueDerivees,
  MorceauCourbeDerivees,
  PalierLectureGraphiqueDerivees,
} from "../../core5e/lectureGraphiqueDerivees.types";

/** Fenêtre x fixe (les positions d'AV sont recadrées dans [−4 ; 4], voir `index.ts`). */
export const BORNES_X_DERIVEES: [number, number] = [-8, 8];
/** Zone exclue de part et d'autre d'une AV pour les contrôles (la divergence y domine). */
export const BUFFER_VA_DERIVEES = 0.3;
const K_VA = 3;

// ============================================================================
// Évaluation d'un morceau (formules exactes, valables aussi hors de [x0 ; x1]).
// ============================================================================

export function valeurMorceau(m: MorceauCourbeDerivees, x: number): number {
  switch (m.kind) {
    case "hermite": {
      const h = m.x1 - m.x0;
      const t = (x - m.x0) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * m.y0 + (t3 - 2 * t2 + t) * h * m.s0 + (-2 * t3 + 3 * t2) * m.y1 + (t3 - t2) * h * m.s1;
    }
    case "expo":
      return m.pente * x + m.ordonnee + m.c * Math.exp(m.k * (x - m.xRef));
    case "divergence":
      return m.coef / (x - m.a);
    case "parabole":
      return m.coef * (x - m.sommet) ** 2 + m.ordonnee;
    case "quadratique":
      return m.v + m.m * (x - m.a) + m.b * (x - m.a) ** 2;
  }
}

export function deriveeMorceau(m: MorceauCourbeDerivees, x: number): number {
  switch (m.kind) {
    case "hermite": {
      const h = m.x1 - m.x0;
      const t = (x - m.x0) / h;
      const t2 = t * t;
      return ((6 * t2 - 6 * t) * m.y0) / h + (3 * t2 - 4 * t + 1) * m.s0 + ((-6 * t2 + 6 * t) * m.y1) / h + (3 * t2 - 2 * t) * m.s1;
    }
    case "expo":
      return m.pente + m.c * m.k * Math.exp(m.k * (x - m.xRef));
    case "divergence":
      return -m.coef / (x - m.a) ** 2;
    case "parabole":
      return 2 * m.coef * (x - m.sommet);
    case "quadratique":
      return m.m + 2 * m.b * (x - m.a);
  }
}

export function deriveeSecondeMorceau(m: MorceauCourbeDerivees, x: number): number {
  switch (m.kind) {
    case "hermite": {
      const h = m.x1 - m.x0;
      const t = (x - m.x0) / h;
      return (((12 * t - 6) * m.y0) / h + (6 * t - 4) * m.s0 + ((-12 * t + 6) * m.y1) / h + (6 * t - 2) * m.s1) / h;
    }
    case "expo":
      return m.c * m.k * m.k * Math.exp(m.k * (x - m.xRef));
    case "divergence":
      return (2 * m.coef) / (x - m.a) ** 3;
    case "parabole":
      return 2 * m.coef;
    case "quadratique":
      return 2 * m.b;
  }
}

/** Morceau qui porte x : celui dont [x0 ; x1] contient x, sinon le plus proche (prolongement). Les
 * morceaux d'une même branche sont contigus ; deux branches sont séparées par une AV. */
export function morceauEn(morceaux: MorceauCourbeDerivees[], x: number): MorceauCourbeDerivees {
  let meilleur = morceaux[0];
  let distance = Infinity;
  for (const m of morceaux) {
    if (x >= m.x0 && x <= m.x1) return m;
    const d = x < m.x0 ? m.x0 - x : x - m.x1;
    if (d < distance) {
      distance = d;
      meilleur = m;
    }
  }
  return meilleur;
}

export function valeurCourbe(exercice: Pick<ExerciceLectureGraphiqueDerivees, "morceaux">, x: number): number {
  return valeurMorceau(morceauEn(exercice.morceaux, x), x);
}
export function deriveeCourbe(exercice: Pick<ExerciceLectureGraphiqueDerivees, "morceaux">, x: number): number {
  return deriveeMorceau(morceauEn(exercice.morceaux, x), x);
}
export function deriveeSecondeCourbe(exercice: Pick<ExerciceLectureGraphiqueDerivees, "morceaux">, x: number): number {
  return deriveeSecondeMorceau(morceauEn(exercice.morceaux, x), x);
}

/** Domaine de chaque branche : [bord gauche ; bord droit], où un bord d'AV vaut la position de l'AV
 * (exclue) ; `ferme*` vrai si la branche aboutit à un point isolé (bord compris). */
export interface DomaineBrancheDerivees {
  lo: number;
  hi: number;
  vaGauche: number | null;
  vaDroite: number | null;
  pointIsoleGauche: boolean;
  pointIsoleDroite: boolean;
}

export function domainesBranches(asymptotique: ExerciceLectureGraphiqueLimites, bornesX: [number, number]): DomaineBrancheDerivees[] {
  const { vas } = asymptotique;
  const domaines: DomaineBrancheDerivees[] = [];
  for (let i = 0; i <= vas.length; i++) {
    const vaG = i === 0 ? null : vas[i - 1];
    const vaD = i === vas.length ? null : vas[i];
    domaines.push({
      lo: vaG ? vaG.position : bornesX[0],
      hi: vaD ? vaD.position : bornesX[1],
      vaGauche: vaG ? vaG.position : null,
      vaDroite: vaD ? vaD.position : null,
      pointIsoleGauche: vaG ? vaG.pointIsoleDroit !== undefined : false,
      pointIsoleDroite: vaD ? vaD.pointIsoleGauche !== undefined : false,
    });
  }
  return domaines;
}

// ============================================================================
// Construction d'une branche.
// ============================================================================

type Direction = 1 | -1;
export type NaturePointCle = "max" | "min" | "palier";

/** Extrémité d'une branche (gabarit + direction imposée ou libre). */
type Extremite =
  | { type: "horizontale"; limite: number }
  | { type: "oblique"; pente: number; ordonnee: number }
  | { type: "aucune"; signe: Direction }
  | { type: "divergence"; a: number; signe: Direction }
  | { type: "pointIsole"; a: number; valeur: number };

function hasard(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function signeHasard(): Direction {
  return Math.random() < 0.5 ? 1 : -1;
}

/** Direction de f au voisinage de l'extrémité (null = libre), côté gauche ou droit de la branche. */
function directionImposee(ext: Extremite, cote: "gauche" | "droite"): Direction | null {
  switch (ext.type) {
    case "horizontale":
    case "pointIsole":
      return null;
    case "oblique":
      return ext.pente > 0 ? 1 : -1;
    case "aucune":
      // gauche : f → signe·∞ quand x → −∞, donc f descend (signe +) ; droite : f → signe·∞ en +∞.
      return cote === "gauche" ? ((-ext.signe) as Direction) : ext.signe;
    case "divergence":
      // à droite d'une AV (bord gauche de la branche) : f vient de signe·∞ ; à gauche d'une AV (bord
      // droit) : f part vers signe·∞.
      return cote === "gauche" ? ((-ext.signe) as Direction) : ext.signe;
  }
}

export function extremitesBranche(asymptotique: ExerciceLectureGraphiqueLimites, index: number): { gauche: Extremite; droite: Extremite } {
  const { vas, infini } = asymptotique;
  const n = vas.length;
  let gauche: Extremite;
  if (index === 0) {
    gauche =
      infini.type === "horizontale"
        ? { type: "horizontale", limite: infini.limiteMoinsInfini }
        : infini.type === "oblique"
          ? { type: "oblique", pente: infini.pente, ordonnee: infini.ordonnee }
          : { type: "aucune", signe: infini.signeMoinsInfini };
  } else {
    const va = vas[index - 1];
    gauche = va.pointIsoleDroit !== undefined ? { type: "pointIsole", a: va.position, valeur: va.pointIsoleDroit } : { type: "divergence", a: va.position, signe: va.signeDroit };
  }
  let droite: Extremite;
  if (index === n) {
    droite =
      infini.type === "horizontale"
        ? { type: "horizontale", limite: infini.limitePlusInfini }
        : infini.type === "oblique"
          ? { type: "oblique", pente: infini.pente, ordonnee: infini.ordonnee }
          : { type: "aucune", signe: infini.signePlusInfini };
  } else {
    const va = vas[index];
    droite = va.pointIsoleGauche !== undefined ? { type: "pointIsole", a: va.position, valeur: va.pointIsoleGauche } : { type: "divergence", a: va.position, signe: va.signeGauche };
  }
  return { gauche, droite };
}

/** Directions imposées (ou libres) aux deux bouts d'une branche — sert à choisir une suite de
 * points clés compatible (parité du nombre d'extremums). */
export function directionsBranche(asymptotique: ExerciceLectureGraphiqueLimites, index: number): { gauche: Direction | null; droite: Direction | null } {
  const { gauche, droite } = extremitesBranche(asymptotique, index);
  return { gauche: directionImposee(gauche, "gauche"), droite: directionImposee(droite, "droite") };
}

/** Gabarit construit pour une extrémité : morceau, valeur et pente au raccord, et « ρ » = +1 si la
 * concavité du gabarit a le signe de la direction, −1 sinon. */
interface GabaritConstruit {
  morceau: MorceauCourbeDerivees;
  xRaccord: number;
  y: number;
  pente: number;
  rho: 1 | -1;
}

const DECROISSANCE_BORD = 0.035;
/** Longueur minimale de chaque gabarit (distance bord/AV → raccord). */
export const D_MIN = { infini: 2.0, divergence: 0.8, pointIsole: 0.9 };
/** Écart minimal entre un raccord et le point clé voisin, et entre deux points clés. */
export const ECART_RACCORD_POINT = 1.0;
export const ECART_ENTRE_POINTS = 2.0;

/** Nombre maximal de points clés qu'une branche peut accueillir (gabarits au plus court). */
export function capaciteBranche(asymptotique: ExerciceLectureGraphiqueLimites, index: number, bornesX: [number, number]): number {
  const dom = domainesBranches(asymptotique, bornesX)[index];
  const { gauche, droite } = extremitesBranche(asymptotique, index);
  const dMin = (e: Extremite) => (e.type === "divergence" ? D_MIN.divergence : e.type === "pointIsole" ? D_MIN.pointIsole : D_MIN.infini);
  const utile = dom.hi - dom.lo - dMin(gauche) - dMin(droite) - 2 * ECART_RACCORD_POINT;
  return utile < 0 ? 0 : Math.floor(utile / ECART_ENTRE_POINTS) + 1;
}

function construireGabarit(ext: Extremite, cote: "gauche" | "droite", direction: Direction, bord: number): GabaritConstruit | null {
  const sens = cote === "gauche" ? 1 : -1; // le raccord est à droite du bord (gauche) ou à sa gauche (droite)
  switch (ext.type) {
    case "horizontale":
    case "oblique": {
      const D = hasard(D_MIN.infini, 3.0);
      const xr = bord + sens * D;
      const p = ext.type === "oblique" ? ext.pente : 0;
      const q = ext.type === "oblique" ? ext.ordonnee : ext.limite;
      let c: number;
      let kappa: number;
      if (ext.type === "horizontale") {
        // gauche : f' = c·κ·e (signe c = direction) ; droite : f' = −c·κ·e (signe c = −direction).
        c = (cote === "gauche" ? direction : -direction) * Math.exp(hasard(Math.log(0.08), Math.log(1.4)));
        kappa = Math.max(1.3, Math.log(Math.abs(c) / DECROISSANCE_BORD) / D);
      } else {
        kappa = 1.5;
        c = signeHasard() * hasard(0.25, 0.4) * Math.abs(p);
      }
      const k = cote === "gauche" ? kappa : -kappa;
      const morceau: MorceauCourbeDerivees = { kind: "expo", x0: cote === "gauche" ? bord : xr, x1: cote === "gauche" ? xr : bord, pente: p, ordonnee: q, c, k, xRef: xr };
      const y = valeurMorceau(morceau, xr);
      const pente = deriveeMorceau(morceau, xr);
      const concavite = Math.sign(deriveeSecondeMorceau(morceau, xr));
      return { morceau, xRaccord: xr, y, pente, rho: concavite === direction ? 1 : -1 };
    }
    case "aucune": {
      const D = hasard(D_MIN.infini, 2.8);
      const xr = bord + sens * D;
      const u = hasard(0.8, 1.5);
      const sommet = xr + sens * u;
      const coef = ext.signe * hasard(0.18, 0.3);
      const ordonnee = Math.round(hasard(-3, 3));
      const morceau: MorceauCourbeDerivees = { kind: "parabole", x0: cote === "gauche" ? bord : xr, x1: cote === "gauche" ? xr : bord, coef, sommet, ordonnee };
      return { morceau, xRaccord: xr, y: valeurMorceau(morceau, xr), pente: deriveeMorceau(morceau, xr), rho: Math.sign(coef) === direction ? 1 : -1 };
    }
    case "divergence": {
      const D = hasard(D_MIN.divergence, 1.5);
      const xr = ext.a + sens * D;
      // à droite de l'AV : signe·K/(x − a) ; à gauche : signe·K/(a − x) = −signe·K/(x − a).
      const coef = (cote === "gauche" ? 1 : -1) * ext.signe * K_VA;
      const morceau: MorceauCourbeDerivees = { kind: "divergence", x0: cote === "gauche" ? ext.a : xr, x1: cote === "gauche" ? xr : ext.a, a: ext.a, coef };
      const concavite = Math.sign(deriveeSecondeMorceau(morceau, xr));
      return { morceau, xRaccord: xr, y: valeurMorceau(morceau, xr), pente: deriveeMorceau(morceau, xr), rho: concavite === direction ? 1 : -1 };
    }
    case "pointIsole": {
      const D = hasard(D_MIN.pointIsole, 1.4);
      const xr = ext.a + sens * D;
      const m = direction * hasard(0.6, 1.4);
      const bMax = (0.8 * Math.abs(m)) / (2 * D);
      const b = signeHasard() * hasard(0.3, 1) * Math.min(0.3, bMax);
      const morceau: MorceauCourbeDerivees = { kind: "quadratique", x0: cote === "gauche" ? ext.a : xr, x1: cote === "gauche" ? xr : ext.a, a: ext.a, v: ext.valeur, m, b };
      const concavite = Math.sign(b);
      return { morceau, xRaccord: xr, y: valeurMorceau(morceau, xr), pente: deriveeMorceau(morceau, xr), rho: concavite === direction ? 1 : -1 };
    }
  }
}

/** Intervalle de « hauteur » |y_clé − y_raccord| compatible avec un raccord (pente s, distance Δx) :
 * monotonie du segment d'Hermite ET même concavité de part et d'autre du raccord (voir l'en-tête). */
function intervalleHauteurRaccord(pente: number, dx: number, rho: 1 | -1, cote: "gauche" | "droite"): [number, number] {
  const s = Math.abs(pente) * dx;
  // gauche (raccord puis point clé) : ρ=+1 ⟺ |δ| > 2|s|/3 ; droite (point clé puis raccord) : ρ=+1 ⟺ |δ| < 2|s|/3.
  const grand = (cote === "gauche") === (rho === 1);
  if (grand) return [Math.max(0.74 * s, 1.0), Math.max(0.74 * s, 1.0) + 3.5];
  return [Math.max(0.37 * s, 0.6), 0.6 * s];
}

const Y_MAX_POINTS = 8.5;
const HAUTEUR_ENTRE_POINTS: [number, number] = [1.5, 4];

/** Valeur dans [lo ; hi] (lo ≤ hi), sur la grille 0,5 si possible. */
function tirerDansIntervalle(lo: number, hi: number): number | null {
  if (hi < lo) return null;
  const grille: number[] = [];
  for (let v = Math.ceil(lo * 2) / 2; v <= hi + 1e-9; v += 0.5) grille.push(v);
  if (grille.length > 0) return grille[Math.floor(Math.random() * grille.length)];
  return hasard(lo, hi);
}

/** Intervalle des valeurs y atteintes en partant de y0 dans la direction d, hauteur ∈ [hMin ; hMax]. */
function intervalleDepuis(y0: number, d: Direction, [hMin, hMax]: [number, number]): [number, number] {
  return d === 1 ? [y0 + hMin, y0 + hMax] : [y0 - hMax, y0 - hMin];
}
function intersection(a: [number, number], b: [number, number]): [number, number] {
  return [Math.max(a[0], b[0]), Math.min(a[1], b[1])];
}

export interface BrancheConstruite {
  morceaux: MorceauCourbeDerivees[];
  pointsCles: { x: number; y: number; nature: NaturePointCle }[];
}

/**
 * Une tentative de construction d'une branche avec la suite de points clés `types` (gauche → droite) ;
 * la nature max/min de chaque extremum découle des directions imposées aux extrémités.
 * `null` si les contraintes ne peuvent pas être satisfaites pour ce tirage (l'appelant recommence).
 */
export function tenterBranche(asymptotique: ExerciceLectureGraphiqueLimites, index: number, bornesX: [number, number], types: ("extremum" | "palier")[]): BrancheConstruite | null {
  const { gauche, droite } = extremitesBranche(asymptotique, index);
  const dirs = directionsBranche(asymptotique, index);
  const nbExtremums = types.filter((t) => t === "extremum").length;
  const flip = nbExtremums % 2 === 1 ? -1 : 1;
  let dG: Direction;
  if (dirs.gauche !== null) dG = dirs.gauche;
  else if (dirs.droite !== null) dG = (dirs.droite * flip) as Direction;
  else dG = signeHasard();
  const dD = (dG * flip) as Direction;
  if (dirs.droite !== null && dirs.droite !== dD) return null;
  // La nature de chaque extremum découle des directions : max si la courbe montait.
  const natures: NaturePointCle[] = [];
  let d = dG;
  for (const type of types) {
    if (type === "palier") {
      natures.push("palier");
      continue;
    }
    natures.push(d === 1 ? "max" : "min");
    d = (-d) as Direction;
  }

  const domaines = domainesBranches(asymptotique, bornesX);
  const dom = domaines[index];
  const gG = construireGabarit(gauche, "gauche", dG, dom.lo);
  const gD = construireGabarit(droite, "droite", dD, dom.hi);
  if (!gG || !gD) return null;
  const xa = gG.xRaccord;
  const xb = gD.xRaccord;
  const n = natures.length;
  if (xb - xa < (n === 0 ? 0.8 : ECART_ENTRE_POINTS * (n - 1) + 2 * ECART_RACCORD_POINT)) return null;

  // Abscisses des points clés : grille 0,5, à ≥ 1 des raccords, espacées d'au moins 2.
  const xs: number[] = [];
  const minX = Math.ceil((xa + ECART_RACCORD_POINT) * 2) / 2;
  const maxX = Math.floor((xb - ECART_RACCORD_POINT) * 2) / 2;
  for (let j = 0; j < n; j++) {
    const lo = j === 0 ? minX : xs[j - 1] + ECART_ENTRE_POINTS;
    const hi = maxX - ECART_ENTRE_POINTS * (n - 1 - j);
    if (hi < lo) return null;
    xs.push(lo + Math.floor(Math.random() * (Math.round((hi - lo) * 2) + 1)) / 2);
  }

  const ys: number[] = [];
  if (n > 0) {
    let direction = dG;
    const bande: [number, number] = [-Y_MAX_POINTS, Y_MAX_POINTS];
    for (let j = 0; j < n; j++) {
      let intervalle: [number, number] =
        j === 0 ? intervalleDepuis(gG.y, direction, intervalleHauteurRaccord(gG.pente, xs[0] - xa, gG.rho, "gauche")) : intervalleDepuis(ys[j - 1], direction, HAUTEUR_ENTRE_POINTS);
      intervalle = intersection(intervalle, bande);
      if (natures[j] !== "palier") direction = (-direction) as Direction;
      if (j === n - 1) {
        // Le dernier point clé doit aussi convenir au raccord droit (direction finale = dD).
        const [hMin, hMax] = intervalleHauteurRaccord(gD.pente, xb - xs[j], gD.rho, "droite");
        const depuisDroite: [number, number] = dD === 1 ? [gD.y - hMax, gD.y - hMin] : [gD.y + hMin, gD.y + hMax];
        intervalle = intersection(intervalle, depuisDroite);
      }
      const y = tirerDansIntervalle(intervalle[0], intervalle[1]);
      if (y === null) return null;
      ys.push(y);
    }
  }

  const morceaux: MorceauCourbeDerivees[] = [gG.morceau];
  const noeuds = [{ x: xa, y: gG.y, s: gG.pente }, ...xs.map((x, j) => ({ x, y: ys[j], s: 0 })), { x: xb, y: gD.y, s: gD.pente }];
  for (let j = 0; j < noeuds.length - 1; j++) {
    const a = noeuds[j];
    const b = noeuds[j + 1];
    morceaux.push({ kind: "hermite", x0: a.x, x1: b.x, y0: a.y, y1: b.y, s0: a.s, s1: b.s });
  }
  morceaux.push(gD.morceau);
  return { morceaux, pointsCles: xs.map((x, j) => ({ x, y: ys[j], nature: natures[j] })) };
}

// ============================================================================
// Analyse (contrôle) d'une courbe complète.
// ============================================================================

export interface AnalyseCourbe {
  valide: boolean;
  raison?: string;
  extrema: ExtremumLectureGraphiqueDerivees[];
  paliers: PalierLectureGraphiqueDerivees[];
  inflexions: InflexionLectureGraphiqueDerivees[];
}

const EPS = 1e-7;

/** Racines de a·t² + b·t + c dans ]ε ; 1 − ε[. */
function racinesQuadratiquesInterieures(a: number, b: number, c: number): number[] {
  const res: number[] = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) res.push(-c / b);
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= -1e-12) {
      const r = Math.sqrt(Math.max(0, disc));
      res.push((-b - r) / (2 * a), (-b + r) / (2 * a));
    }
  }
  return res.filter((t) => t > 1e-4 && t < 1 - 1e-4);
}

/** Pour chaque branche (suite de morceaux contigus) : f' ne s'annule qu'aux points clés, la
 * concavité ne change qu'à l'intérieur d'un segment d'Hermite ou en un palier, les gabarits sont
 * monotones et de concavité constante. Renvoie la vérité terrain. */
export function analyserCourbe(branches: BrancheConstruite[]): AnalyseCourbe {
  const extrema: ExtremumLectureGraphiqueDerivees[] = [];
  const paliers: PalierLectureGraphiqueDerivees[] = [];
  const inflexions: InflexionLectureGraphiqueDerivees[] = [];
  const echec = (raison: string): AnalyseCourbe => ({ valide: false, raison, extrema: [], paliers: [], inflexions: [] });

  for (const branche of branches) {
    const { morceaux, pointsCles } = branche;
    // Gabarits et segments : f' sans zéro intérieur.
    for (const m of morceaux) {
      if (m.kind === "hermite") {
        const h = m.x1 - m.x0;
        const A = (6 * m.y0) / h + 3 * m.s0 - (6 * m.y1) / h + 3 * m.s1;
        const B = (-6 * m.y0) / h - 4 * m.s0 + (6 * m.y1) / h - 2 * m.s1;
        if (racinesQuadratiquesInterieures(A, B, m.s0).length > 0) return echec("f' s'annule dans un segment");
      } else {
        // Gabarit : f' et f'' de signe constant sur le morceau (fonctions monotones de x ici).
        const xs = [m.x0, m.x1, (m.x0 + m.x1) / 2];
        const lo = m.kind === "divergence" ? (m.x0 === m.a ? m.a + BUFFER_VA_DERIVEES : m.x0) : m.x0;
        const hi = m.kind === "divergence" ? (m.x1 === m.a ? m.a - BUFFER_VA_DERIVEES : m.x1) : m.x1;
        xs[0] = lo;
        xs[1] = hi;
        const sp = xs.map((x) => Math.sign(deriveeMorceau(m, x)));
        const ss = xs.map((x) => Math.sign(deriveeSecondeMorceau(m, x)));
        if (sp.some((s) => s === 0 || s !== sp[0])) return echec("gabarit non monotone");
        if (ss.some((s) => s === 0 || s !== ss[0])) return echec("gabarit de concavité variable");
      }
    }
    // Points clés : nature confirmée par le signe de f' de part et d'autre.
    for (const p of pointsCles) {
      const avant = deriveeMorceau(morceauEn(morceaux, p.x - 0.05), p.x - 0.05);
      const apres = deriveeMorceau(morceauEn(morceaux, p.x + 0.05), p.x + 0.05);
      const nature = Math.sign(avant) === Math.sign(apres) ? "palier" : avant > 0 ? "max" : "min";
      if (nature !== p.nature) return echec("nature d'un point clé");
      if (nature === "palier") paliers.push({ position: p.x, valeur: p.y });
      else extrema.push({ position: p.x, valeur: p.y, classification: nature });
    }
    // Points d'inflexion : zéro de f'' (affine) dans un segment, ou changement de signe à un nœud.
    for (let j = 0; j < morceaux.length; j++) {
      const m = morceaux[j];
      if (m.kind === "hermite") {
        const g0 = deriveeSecondeMorceau(m, m.x0 + EPS);
        const g1 = deriveeSecondeMorceau(m, m.x1 - EPS);
        if (Math.sign(g0) !== Math.sign(g1) && g0 !== 0 && g1 !== 0) {
          const x = m.x0 + ((m.x1 - m.x0) * g0) / (g0 - g1);
          inflexions.push({ position: x, valeur: valeurMorceau(m, x), classification: "pi" });
        }
      }
      if (j < morceaux.length - 1) {
        const suivant = morceaux[j + 1];
        const xn = m.x1;
        const gAvant = deriveeSecondeMorceau(m, xn);
        const gApres = deriveeSecondeMorceau(suivant, xn);
        if (Math.sign(gAvant) !== Math.sign(gApres)) {
          const estPalier = pointsCles.some((p) => p.nature === "palier" && Math.abs(p.x - xn) < 1e-9);
          if (!estPalier) return echec("changement de concavité à un raccord");
          inflexions.push({ position: xn, valeur: valeurMorceau(m, xn), classification: "pi" });
        }
      }
    }
  }
  extrema.sort((a, b) => a.position - b.position);
  paliers.sort((a, b) => a.position - b.position);
  inflexions.sort((a, b) => a.position - b.position);
  return { valide: true, extrema, paliers, inflexions };
}

/** Écart maximal toléré entre la courbe et son asymptote horizontale/oblique au bord de la fenêtre. */
export const ECART_BORD_MAX = 0.05;

export function ecartAuBord(asymptotique: ExerciceLectureGraphiqueLimites, morceaux: MorceauCourbeDerivees[], bornesX: [number, number]): number {
  const { infini } = asymptotique;
  if (infini.type === "aucune") return 0;
  const cible = (x: number, cote: "gauche" | "droite") =>
    infini.type === "horizontale" ? (cote === "gauche" ? infini.limiteMoinsInfini : infini.limitePlusInfini) : infini.pente * x + infini.ordonnee;
  const g = Math.abs(valeurMorceau(morceauEn(morceaux, bornesX[0]), bornesX[0]) - cible(bornesX[0], "gauche"));
  const d = Math.abs(valeurMorceau(morceauEn(morceaux, bornesX[1]), bornesX[1]) - cible(bornesX[1], "droite"));
  return Math.max(g, d);
}
