/**
 * Couche A (6e) — types et calculs purs de `6gen89` « Linéariser des données : du tableau au
 * modèle » (chapitre 3 de 6e, section « problèmes », processus 3 TRANSFÉRER).
 *
 * Un tableau de mesures (x ; y) suit l'un de trois modèles :
 * - `exponentiel` : y = k·aˣ ⟺ ln(y) = ln(a)·x + ln(k) — ln(y) en fonction de x est une droite
 *   (représentation SEMI-LOGARITHMIQUE) ;
 * - `puissance` : y = k·xⁿ ⟺ ln(y) = n·ln(x) + ln(k) — ln(y) en fonction de ln(x) est une droite
 *   (représentation LOG-LOG) ;
 * - `affine` : y = m·x + p — les données brutes sont déjà alignées (aucune transformation ; seule la
 *   variante « choisir » l'utilise, comme troisième issue).
 *
 * Coordonnées transformées : X = x (ou ln x en log-log), Y = ln y (ou y pour le modèle affine).
 * La droite Y = m·X + p passe par DEUX lignes désignées du tableau (`lignes`) ; tout le reste
 * (k = eᵖ, a = eᵐ ou n = m, prévision) en découle. Ces fonctions sont la SOURCE UNIQUE des valeurs :
 * générateur, vérification, textes et corrigé papier les appellent toutes.
 *
 * Tolérances (`chaineLinearisation`) : chaque étape annonce un arrondi (ln au millième, m et p au
 * millième, k à 4 chiffres significatifs, a et n au millième, prévision à la précision du contexte) ;
 * l'intervalle accepté est l'ÉTENDUE obtenue en propageant les arrondis acceptés des étapes
 * précédentes (calcul aux coins, fonctions monotones), élargie d'une demi-unité de la précision
 * demandée. Un élève qui recopie les valeurs arrondies d'une étape à l'autre n'est donc jamais
 * pénalisé, et la valeur exacte est toujours au centre.
 */

export type VarianteLinearisation = "semilog" | "loglog" | "choisir";
export type ModeleDonnees = "affine" | "exponentiel" | "puissance";
export type TypePrevision = "valeur" | "seuil";

export type IdContexteLinearisation =
  | "refroidissement"
  | "moore"
  | "bacteries"
  | "decharge"
  | "desintegration"
  | "kepler"
  | "metabolisme"
  | "chute"
  | "intensite"
  | "capteur"
  | "echantillon"
  | "composant";

export interface ExerciceLinearisation {
  variante: VarianteLinearisation;
  /** Modèle réel des données (issue de l'écran « choix » pour la variante `choisir`). */
  modele: ModeleDonnees;
  contexte: IdContexteLinearisation;
  /** Abscisses du tableau (valeurs exactes affichées). */
  xs: number[];
  /** Ordonnées du tableau (mesures ARRONDIES, telles qu'affichées). */
  ys: number[];
  /** Indices des deux lignes du tableau par lesquelles passe la droite. */
  lignes: [number, number];
  typePrevision: TypePrevision;
  /** `valeur` : abscisse x* où l'on prévoit y ; `seuil` : valeur visée de la grandeur demandée
   * (température pour le refroidissement, y sinon) dont on cherche l'abscisse. */
  cible: number;
  /** Température ambiante (refroidissement seulement ; 0 sinon). */
  ambiante: number;
}

export interface Intervalle {
  min: number;
  max: number;
}

/** Définition d'un contexte : symboles (LaTeX), unités (texte brut), précision de la prévision. */
export interface DefContexteLinearisation {
  id: IdContexteLinearisation;
  modele: ModeleDonnees;
  /** Symbole de l'abscisse (LaTeX) : `t`, `r`, `M`, `d`, `x`. */
  varX: string;
  /** Symbole de l'ordonnée (LaTeX) : `\theta`, `N`, `T`, `P`, `I`, `y`. */
  varY: string;
  /** Même symbole en texte brut (récapitulatif, libellés) : « θ », « N »… */
  varXTexte: string;
  varYTexte: string;
  uniteX: string;
  uniteY: string;
  /** Décimales de la prévision : grandeur y (type `valeur`) et abscisse x (type `seuil`). */
  decimalesPrevisionY: number;
  decimalesPrevisionX: number;
}

const CONTEXTES: Record<IdContexteLinearisation, DefContexteLinearisation> = {
  refroidissement: { id: "refroidissement", modele: "exponentiel", varX: "t", varY: "\\theta", varXTexte: "t", varYTexte: "θ", uniteX: "min", uniteY: "°C", decimalesPrevisionY: 1, decimalesPrevisionX: 1 },
  moore: { id: "moore", modele: "exponentiel", varX: "t", varY: "N", varXTexte: "t", varYTexte: "N", uniteX: "ans", uniteY: "millions", decimalesPrevisionY: 0, decimalesPrevisionX: 1 },
  bacteries: { id: "bacteries", modele: "exponentiel", varX: "t", varY: "N", varXTexte: "t", varYTexte: "N", uniteX: "h", uniteY: "milliers/mL", decimalesPrevisionY: 1, decimalesPrevisionX: 1 },
  decharge: { id: "decharge", modele: "exponentiel", varX: "t", varY: "U", varXTexte: "t", varYTexte: "U", uniteX: "ms", uniteY: "V", decimalesPrevisionY: 2, decimalesPrevisionX: 1 },
  desintegration: { id: "desintegration", modele: "exponentiel", varX: "t", varY: "A", varXTexte: "t", varYTexte: "A", uniteX: "jours", uniteY: "Bq", decimalesPrevisionY: 0, decimalesPrevisionX: 1 },
  kepler: { id: "kepler", modele: "puissance", varX: "r", varY: "T", varXTexte: "r", varYTexte: "T", uniteX: "10⁵ km", uniteY: "h", decimalesPrevisionY: 1, decimalesPrevisionX: 2 },
  metabolisme: { id: "metabolisme", modele: "puissance", varX: "M", varY: "P", varXTexte: "M", varYTexte: "P", uniteX: "kg", uniteY: "W", decimalesPrevisionY: 0, decimalesPrevisionX: 0 },
  chute: { id: "chute", modele: "puissance", varX: "t", varY: "d", varXTexte: "t", varYTexte: "d", uniteX: "s", uniteY: "m", decimalesPrevisionY: 1, decimalesPrevisionX: 2 },
  intensite: { id: "intensite", modele: "puissance", varX: "d", varY: "E", varXTexte: "d", varYTexte: "E", uniteX: "m", uniteY: "lux", decimalesPrevisionY: 1, decimalesPrevisionX: 2 },
  capteur: { id: "capteur", modele: "affine", varX: "x", varY: "y", varXTexte: "x", varYTexte: "y", uniteX: "cm", uniteY: "mV", decimalesPrevisionY: 1, decimalesPrevisionX: 1 },
  echantillon: { id: "echantillon", modele: "affine", varX: "x", varY: "y", varXTexte: "x", varYTexte: "y", uniteX: "h", uniteY: "g", decimalesPrevisionY: 1, decimalesPrevisionX: 1 },
  composant: { id: "composant", modele: "affine", varX: "x", varY: "y", varXTexte: "x", varYTexte: "y", uniteX: "kHz", uniteY: "V", decimalesPrevisionY: 1, decimalesPrevisionX: 1 },
};

export function defContexte(id: IdContexteLinearisation): DefContexteLinearisation {
  return CONTEXTES[id];
}

/** Contextes de la variante `choisir` : neutres (le contexte ne trahit pas le modèle). */
export const CONTEXTES_NEUTRES: IdContexteLinearisation[] = ["capteur", "echantillon", "composant"];
export const CONTEXTES_SEMILOG: IdContexteLinearisation[] = ["refroidissement", "moore", "bacteries", "decharge", "desintegration"];
export const CONTEXTES_LOGLOG: IdContexteLinearisation[] = ["kepler", "metabolisme", "chute", "intensite"];

// ============================================================================
// Arrondis.
// ============================================================================

/** Arrondi à `decimales` décimales, sans `-0`. */
export function arrondir(v: number, decimales: number): number {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/** Arrondi à `chiffres` chiffres significatifs. */
export function arrondiSignificatif(v: number, chiffres = 3): number {
  if (v === 0) return 0;
  const d = chiffres - 1 - Math.floor(Math.log10(Math.abs(v)));
  return arrondir(v, Math.max(d, -12));
}

/** Nombre de décimales d'un nombre affiché (au plus 6). */
export function nombreDecimales(v: number): number {
  for (let d = 0; d <= 6; d++) if (Math.abs(arrondir(v, d) - v) < 1e-9) return d;
  return 6;
}

/** Décimales de k : 4 chiffres significatifs, au plus 4 décimales. */
export function decimalesK(k: number): number {
  return Math.min(4, Math.max(0, 3 - Math.floor(Math.log10(Math.abs(k)))));
}

/** Arrondi d'une étape intermédiaire (ln, m, p, a, n) : au millième. */
export const DECIMALES_ETAPE = 3;
const DEMI_ETAPE = 0.5 * Math.pow(10, -DECIMALES_ETAPE);

// ============================================================================
// Coordonnées transformées et droite.
// ============================================================================

export function xTransforme(modele: ModeleDonnees): boolean {
  return modele === "puissance";
}

export function yTransforme(modele: ModeleDonnees): boolean {
  return modele !== "affine";
}

export function coordX(modele: ModeleDonnees, x: number): number {
  return xTransforme(modele) ? Math.log(x) : x;
}

export function coordY(modele: ModeleDonnees, y: number): number {
  return yTransforme(modele) ? Math.log(y) : y;
}

/** Inverse de `coordY` : ramène une ordonnée transformée à la grandeur y. */
export function inverseY(modele: ModeleDonnees, Y: number): number {
  return yTransforme(modele) ? Math.exp(Y) : Y;
}

export function inverseX(modele: ModeleDonnees, X: number): number {
  return xTransforme(modele) ? Math.exp(X) : X;
}

/** Points transformés (X ; Y) de tout le tableau, dans un modèle donné. */
export function pointsTransformes(e: ExerciceLinearisation, modele: ModeleDonnees = e.modele): { X: number; Y: number }[] {
  return e.xs.map((x, i) => ({ X: coordX(modele, x), Y: coordY(modele, e.ys[i]) }));
}

/** Écart maximal des points transformés à la droite passant par le premier et le dernier, rapporté
 * à l'étendue des ordonnées : ≈ 0 si la représentation aligne les points. */
export function ecartAlignement(e: Pick<ExerciceLinearisation, "xs" | "ys">, modele: ModeleDonnees): number {
  const pts = e.xs.map((x, i) => ({ X: coordX(modele, x), Y: coordY(modele, e.ys[i]) }));
  if (pts.some((q) => !Number.isFinite(q.X) || !Number.isFinite(q.Y))) return Infinity;
  const a = pts[0];
  const b = pts[pts.length - 1];
  const pente = (b.Y - a.Y) / (b.X - a.X);
  const ys = pts.map((q) => q.Y);
  const etendue = Math.max(...ys) - Math.min(...ys);
  if (etendue <= 0) return Infinity;
  return Math.max(...pts.map((q) => Math.abs(q.Y - (a.Y + pente * (q.X - a.X))))) / etendue;
}

// ============================================================================
// Chaîne de calcul et tolérances.
// ============================================================================

/** Minimum et maximum de `f` aux coins du pavé des intervalles (f monotone en chaque variable). */
function etendue(f: (...v: number[]) => number, intervalles: Intervalle[]): Intervalle {
  let min = Infinity;
  let max = -Infinity;
  const n = intervalles.length;
  for (let masque = 0; masque < 1 << n; masque++) {
    const v = intervalles.map((iv, i) => ((masque >> i) & 1 ? iv.max : iv.min));
    const r = f(...v);
    if (!Number.isFinite(r)) continue;
    if (r < min) min = r;
    if (r > max) max = r;
  }
  return { min, max };
}

function autour(v: number, demi: number): Intervalle {
  return { min: v - demi, max: v + demi };
}

function elargir(iv: Intervalle, demi: number): Intervalle {
  return { min: iv.min - demi, max: iv.max + demi };
}

function union(a: Intervalle, b: Intervalle): Intervalle {
  return { min: Math.min(a.min, b.min), max: Math.max(a.max, b.max) };
}

export interface ChaineLinearisation {
  /** Coordonnées transformées EXACTES des deux lignes désignées. */
  X: [number, number];
  Y: [number, number];
  m: number;
  p: number;
  /** k = eᵖ (modèles exponentiel et puissance). */
  k: number;
  /** a = eᵐ (exponentiel) ou n = m (puissance) ; m pour le modèle affine. */
  parametre: number;
  /** Grandeur demandée à la dernière étape (température, y, ou abscisse pour un seuil). */
  prevision: number;
  /** Valeur de y visée (seuil, sans l'ambiante) ou prévue (valeur, sans l'ambiante). */
  yPrevision: number;
  /** Abscisse de la prévision (x* pour une valeur, abscisse cherchée pour un seuil). */
  xPrevision: number;
  decimalesK: number;
  decimalesPrevision: number;
  /** Intervalles acceptés, étape par étape. */
  accepte: {
    m: Intervalle;
    p: Intervalle;
    k: Intervalle;
    parametre: Intervalle;
    prevision: Intervalle;
  };
}

/** Valeur prévue (sans l'ambiante) au point x par le modèle (k ; paramètre). */
export function modeleEn(modele: ModeleDonnees, k: number, parametre: number, x: number): number {
  switch (modele) {
    case "exponentiel":
      return k * Math.pow(parametre, x);
    case "puissance":
      return k * Math.pow(x, parametre);
    case "affine":
      return k + parametre * x;
  }
}

/** Abscisse où le modèle (k ; paramètre) atteint y. */
export function inverseModele(modele: ModeleDonnees, k: number, parametre: number, y: number): number {
  switch (modele) {
    case "exponentiel":
      return Math.log(y / k) / Math.log(parametre);
    case "puissance":
      return Math.pow(y / k, 1 / parametre);
    case "affine":
      return (y - k) / parametre;
  }
}

/** Vrai quand la variante a un écran « modèle » (k et a, ou k et n). */
export function aEcranModele(e: ExerciceLinearisation): boolean {
  return e.variante !== "choisir";
}

export function chaineLinearisation(e: ExerciceLinearisation): ChaineLinearisation {
  const mod = e.modele;
  const def = defContexte(e.contexte);
  const [i, j] = e.lignes;
  const X: [number, number] = [coordX(mod, e.xs[i]), coordX(mod, e.xs[j])];
  const Y: [number, number] = [coordY(mod, e.ys[i]), coordY(mod, e.ys[j])];
  const m = (Y[1] - Y[0]) / (X[1] - X[0]);
  const p = Y[0] - m * X[0];
  const k = mod === "affine" ? p : Math.exp(p);
  const parametre = mod === "exponentiel" ? Math.exp(m) : m;
  const dk = mod === "affine" ? DECIMALES_ETAPE : decimalesK(k);

  // Étendues acceptées.
  const hX = xTransforme(mod) ? DEMI_ETAPE : 0;
  const hY = yTransforme(mod) ? DEMI_ETAPE : 0;
  const ivX = X.map((v) => autour(v, hX));
  const ivY = Y.map((v) => autour(v, hY));
  const accM = elargir(etendue((x0, x1, y0, y1) => (y1 - y0) / (x1 - x0), [ivX[0], ivX[1], ivY[0], ivY[1]]), DEMI_ETAPE);
  const pRang = union(
    etendue((mm, xx, yy) => yy - mm * xx, [accM, ivX[0], ivY[0]]),
    etendue((mm, xx, yy) => yy - mm * xx, [accM, ivX[1], ivY[1]]),
  );
  const accP = elargir(pRang, DEMI_ETAPE);
  const accK = mod === "affine" ? accP : elargir({ min: Math.exp(accP.min), max: Math.exp(accP.max) }, 0.5 * Math.pow(10, -dk));
  const accPar = mod === "exponentiel" ? elargir({ min: Math.exp(accM.min), max: Math.exp(accM.max) }, DEMI_ETAPE) : elargir(accM, DEMI_ETAPE);

  const ambiante = e.ambiante;
  let prevision: number;
  let yPrevision: number;
  let xPrevision: number;
  let decimalesPrevision: number;
  let accPrev: Intervalle;
  // Chaîne directe par la droite : Y = p + m·X.
  if (e.typePrevision === "valeur") {
    xPrevision = e.cible;
    yPrevision = modeleEn(mod, k, parametre, xPrevision);
    prevision = yPrevision + ambiante;
    decimalesPrevision = def.decimalesPrevisionY;
    const Xs = coordX(mod, xPrevision);
    let iv = etendue((pp, mm) => inverseY(mod, pp + mm * Xs) + ambiante, [accP, accM]);
    if (aEcranModele(e)) iv = union(iv, etendue((kk, aa) => modeleEn(mod, kk, aa, xPrevision) + ambiante, [accK, accPar]));
    accPrev = elargir(iv, 0.5 * Math.pow(10, -decimalesPrevision));
  } else {
    yPrevision = e.cible - ambiante;
    xPrevision = inverseModele(mod, k, parametre, yPrevision);
    prevision = xPrevision;
    decimalesPrevision = def.decimalesPrevisionX;
    const Ys = coordY(mod, yPrevision);
    let iv = etendue((pp, mm) => inverseX(mod, (Ys - pp) / mm), [accP, accM]);
    if (aEcranModele(e)) iv = union(iv, etendue((kk, aa) => inverseModele(mod, kk, aa, yPrevision), [accK, accPar]));
    accPrev = elargir(iv, 0.5 * Math.pow(10, -decimalesPrevision));
  }

  return {
    X,
    Y,
    m,
    p,
    k,
    parametre,
    prevision,
    yPrevision,
    xPrevision,
    decimalesK: dk,
    decimalesPrevision,
    accepte: { m: accM, p: accP, k: accK, parametre: accPar, prevision: accPrev },
  };
}

/** Logarithmes attendus à l'écran « logs » : [ln y_i, ln y_j] (semi-log) ou
 * [ln x_i, ln y_i, ln x_j, ln y_j] (log-log). */
export function logsAttendus(e: ExerciceLinearisation): number[] {
  const [i, j] = e.lignes;
  if (e.modele === "puissance") return [Math.log(e.xs[i]), Math.log(e.ys[i]), Math.log(e.xs[j]), Math.log(e.ys[j])];
  return [Math.log(e.ys[i]), Math.log(e.ys[j])];
}

/** Demi-largeur acceptée sur un logarithme arrondi au millième (et marge flottante). */
export const TOLERANCE_LOG = DEMI_ETAPE + 1e-9;
