/**
 * Mise à l'échelle des données tirées par les générateurs du chapitre « Statistique descriptive »
 * (gen30 à gen38) — audit du chapitre 4, point 15. Remplace l'ancien `elargirPlage` (plage forcée
 * à 14-20 unités autour de x̄, plancher 0) et les classes d'amplitude 2 à 5 « tout court », qui
 * produisaient 100 m en 6 s, 0 h de sommeil, des kilométrages de 104 995 à 105 005 km ou des
 * salaires groupés par classes de 5 €.
 *
 * Principe : chaque générateur garde sa construction en UNITÉS ENTIÈRES (valeurs distinctes parmi
 * 0..L, écarts entiers, amplitudes de 2 à 5 unités...) ; une échelle `{ origine, unite }` traduit
 * ensuite l'unité j en `origine + j × unite`. L'unité est un nombre « rond » (1, 2, 5 × 10^k),
 * multiple du pas naturel du contexte, choisi pour que la construction couvre au plus ±2σ autour
 * d'un x̄ réaliste ; l'origine est calée dans la bande réaliste du contexte, jamais sous son plancher.
 */
import type { ContexteBienaymeTchebychev } from "../../core/bienaymeTchebychev.types";

/** Bande où toute donnée individuelle reste plausible : [x̄min − 2σmax ; x̄max + 2σmax], jamais sous
 * le plancher du contexte. */
export function bandeRealiste(contexte: ContexteBienaymeTchebychev): [number, number] {
  const bas = contexte.plageXBar[0] - 2 * contexte.plageSigma[1];
  const haut = contexte.plageXBar[1] + 2 * contexte.plageSigma[1];
  return [Math.max(contexte.plancher, bas), haut];
}

/** Étendue minimale d'une série réaliste : 20 % de 4σmin (en dessous, la série est « collée »
 * autour d'une seule valeur, ex. kilométrages à quelques km près). */
export function etendueMinimale(contexte: ContexteBienaymeTchebychev): number {
  return 0.2 * 4 * contexte.plageSigma[0];
}

/** Critère commun de réalisme d'une série (valeurs individuelles, ou bornes de classes). */
export function valeursRealistes(contexte: ContexteBienaymeTchebychev, valeurs: number[]): boolean {
  const [bas, haut] = bandeRealiste(contexte);
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  return min >= bas - 1e-9 && max <= haut + 1e-9 && max - min >= etendueMinimale(contexte) - 1e-9;
}

/** Une borne d'intervalle (Bienaymé-Tchebychev) n'est jamais sous le plancher du contexte
 * (« âge −3 ans », « hauteur entre −8 et 58 cm », « température annuelle de −22 °C »). */
export function borneRealiste(contexte: ContexteBienaymeTchebychev, borne: number): boolean {
  return borne >= contexte.plancher - 1e-9;
}

/** Nombre de décimales significatives d'un pas (0,1 → 1 ; 0,5 → 1 ; 10 → 0). */
function decimalesDe(pas: number): number {
  let d = 0;
  while (d < 6 && Math.abs(Math.round(pas * 10 ** d) - pas * 10 ** d) > 1e-9) d++;
  return d;
}

/** Arrondi au multiple de `pas` le plus proche, sans bruit flottant (6,199999… → 6,2). */
export function arrondirAuPas(valeur: number, pas: number): number {
  const d = decimalesDe(pas);
  return Number((Math.round(valeur / pas) * pas).toFixed(d));
}

/** Plus grand nombre « rond » (1, 2 ou 5 × 10^k) inférieur ou égal à `x` (x > 0). */
export function pasRond(x: number): number {
  const puissance = 10 ** Math.floor(Math.log10(x) + 1e-12);
  const mantisse = x / puissance;
  const facteur = mantisse >= 5 - 1e-9 ? 5 : mantisse >= 2 - 1e-9 ? 2 : 1;
  return Number((facteur * puissance).toPrecision(12));
}

export interface EchelleContexte {
  origine: number;
  unite: number;
}

/** Valeur réelle de l'unité entière (ou fractionnaire, pour une donnée à l'intérieur d'une classe)
 * `j`, sans bruit flottant. */
export function valeurEchelle(echelle: EchelleContexte, j: number): number {
  const d = Math.max(decimalesDe(echelle.unite), decimalesDe(echelle.origine)) + 2;
  return Number((echelle.origine + j * echelle.unite).toFixed(d));
}

function tirerDansPlage([min, max]: [number, number]): number {
  return min + Math.random() * (max - min);
}

export interface OptionsEchelle {
  /** Unité minimale imposée (ex. 1 pour des classes, dont le polygone se construit sur une grille
   * entière) — en plus du pas naturel du contexte. */
  uniteMin?: number;
  /** Unité maximale tolérée (ex. 100 pour un calcul de variance à la main) : au-delà, `null`. */
  uniteMax?: number;
}

/**
 * Échelle pour une construction de `largeurUnites` unités entières : unité ≈ 4σ / largeurUnites
 * (arrondie vers le bas à un nombre rond, jamais sous le pas du contexte), origine calée autour d'un
 * x̄ réaliste puis ramenée dans la bande réaliste. `null` si le contexte est trop étroit pour cette
 * construction (la bande ne peut pas contenir `largeurUnites` unités) ou si l'unité dépasse
 * `uniteMax` — le générateur tire alors un autre contexte.
 */
export function tirerEchelle(
  contexte: ContexteBienaymeTchebychev,
  largeurUnites: number,
  options: OptionsEchelle = {},
): EchelleContexte | null {
  const sigma = tirerDansPlage(contexte.plageSigma);
  const xBar = tirerDansPlage(contexte.plageXBar);
  const unite = Math.max(contexte.pas, options.uniteMin ?? 0, pasRond((4 * sigma) / largeurUnites));
  if (options.uniteMax !== undefined && unite > options.uniteMax) return null;
  const largeur = largeurUnites * unite;
  const [bas, haut] = bandeRealiste(contexte);
  const origineMin = Math.ceil(bas / unite - 1e-9) * unite;
  const origineMax = Math.floor((haut - largeur) / unite + 1e-9) * unite;
  if (origineMax < origineMin - 1e-9) return null;
  const origineVisee = arrondirAuPas(xBar - largeur / 2, unite);
  const origine = arrondirAuPas(Math.min(origineMax, Math.max(origineMin, origineVisee)), unite);
  return { origine, unite };
}

/**
 * Échelle « centrée » pour les constructions par écarts autour de x̄ (dispersion, synthèse) : x̄
 * multiple de l'unité, écarts entiers de ±`ecartMaxUnites` au plus, soit au plus ±2σ. `null` si
 * l'unité dépasse `uniteMax` ou si aucun x̄ ne garde toute la série dans la bande réaliste.
 */
export function tirerEchelleCentree(
  contexte: ContexteBienaymeTchebychev,
  ecartMaxUnites: number,
  options: OptionsEchelle = {},
): { xBar: number; unite: number } | null {
  const sigma = tirerDansPlage(contexte.plageSigma);
  const unite = Math.max(contexte.pas, options.uniteMin ?? 0, pasRond((2 * sigma) / ecartMaxUnites));
  if (options.uniteMax !== undefined && unite > options.uniteMax) return null;
  const [bas, haut] = bandeRealiste(contexte);
  const xBarMin = Math.max(contexte.plageXBar[0], bas + ecartMaxUnites * unite);
  const xBarMax = Math.min(contexte.plageXBar[1], haut - ecartMaxUnites * unite);
  if (xBarMax < xBarMin) return null;
  const xBar = arrondirAuPas(tirerDansPlage([xBarMin, xBarMax]), unite);
  if (xBar - ecartMaxUnites * unite < bas - 1e-9 || xBar + ecartMaxUnites * unite > haut + 1e-9) return null;
  return { xBar, unite };
}

/** Pas commun (« cran ») d'une liste de valeurs : plus grand diviseur commun, décimales comprises
 * (0,5 ; 1,5 → 0,5). Sert à cranter un glissement (polygone, boîte à moustaches) sur la grille où
 * vivent réellement les valeurs attendues. */
export function pasCommun(valeurs: number[]): number {
  const d = Math.max(0, ...valeurs.map(decimalesDe));
  const facteur = 10 ** d;
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b));
  const entiers = valeurs.map((v) => Math.abs(Math.round(v * facteur))).filter((v) => v !== 0);
  if (entiers.length === 0) return 1;
  return entiers.reduce((acc, v) => pgcd(acc, v)) / facteur;
}
