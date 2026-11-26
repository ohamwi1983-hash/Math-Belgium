import type { StatutVerification } from "../../../5e-4h/moteur/statutVerification";
import { lireValeur } from "../../../5e-4h/moteur5e/lectureValeurTrigo";
import { decimalesSaisies, nL, nT } from "../../../5e-4h/ui5e/nombresStatLotH2";

/**
 * Briques communes des générateurs d'algèbre financière de la 5e (6h) (56gen23–56gen28, étapes 11 à 14
 * du chapitre « Nombres réels et suites ») : écriture des montants et des taux, lecture d'une saisie
 * (« 1 307,39 € », « 3,5 % », « 0,035 », « 7/12 »), tolérances (un centime sur un montant, 0,01 point
 * sur un taux en %), dates (jours exacts, année de 365 jours) et ligne du temps (SVG autonome, fond
 * blanc, AUCUN identifiant : la même chaîne à l'écran, sur papier et dans le corrigé).
 *
 * Règle de calcul (brief du chantier F) : tout est calculé en valeurs EXACTES (flottants non
 * arrondis) ; l'arrondi au centime n'intervient qu'à la fin — sauf ce qu'une banque arrondit
 * vraiment (mensualité, lignes d'un tableau d'amortissement), toujours dit dans l'énoncé.
 */

export { nL, nT, nP, nPlus, precisionTexte } from "../../../5e-4h/ui5e/nombresStatLotH2";

const NBSP = " ";

/** Arrondi à `d` décimales (demi vers le haut, flottants corrigés). */
export function arrondi(x: number, d: number): number {
  const f = 10 ** d;
  return Math.round(x * f + (x >= 0 ? 1e-7 : -1e-7)) / f;
}

export const auCentime = (x: number) => arrondi(x, 2);

/** Montant d'une DONNÉE : « 1 200 », « 1 307,50 » (deux décimales dès qu'il y a des centimes). */
export function montantT(x: number): string {
  const c = auCentime(x);
  return Number.isInteger(c) ? nT(c, 0) : nT(c, 2, true);
}
export function montantL(x: number): string {
  const c = auCentime(x);
  return Number.isInteger(c) ? nL(c, 0) : nL(c, 2, true);
}
/** Montant d'un RÉSULTAT au centime : toujours deux décimales (« 1 307,39 », « 21,00 »). */
export const centT = (x: number) => nT(auCentime(x), 2, true);
export const centL = (x: number) => nL(auCentime(x), 2, true);
/** « 1 200 € » (espace insécable). */
export const eurT = (x: number) => `${montantT(x)}${NBSP}€`;
export const eurCentT = (x: number) => `${centT(x)}${NBSP}€`;

/** Taux en pour cent (donnée) : « 3,5 % », « 0,47 % ». */
export const pourcentT = (p: number, d = 4) => `${nT(p, d)}${NBSP}%`;
export const pourcentL = (p: number, d = 4) => `${nL(p, d)}\\,\\%`;
/** Taux en écriture décimale : « 0{,}035 ». */
export const decimalL = (i: number, d = 6) => nL(i, d);
/** Taux en % d'un RÉSULTAT, à `d` décimales fixes. */
export const pourcentFixeT = (p: number, d: number) => `${nT(p, d, true)}${NBSP}%`;
export const pourcentFixeL = (p: number, d: number) => `${nL(p, d, true)}\\,\\%`;

/** « = » si la valeur s'écrit exactement avec `d` décimales, sinon « ≈ » (LaTeX). */
export function egalOuApprox(x: number, d: number): string {
  const f = 10 ** d;
  return Math.abs(x * f - Math.round(x * f)) < 1e-6 ? "=" : "\\approx ";
}

/* ----------------------------------------------------------------------------------------------
 * Lecture d'une saisie (jamais de blocage de frappe : la saisie est lue telle quelle)
 * -------------------------------------------------------------------------------------------- */

const UNITES = /\s*(€|euros?|eur|%|pour\s*cent|années?|ans?|quinzaines?)\s*$/i;

function nettoyer(brut: string): { texte: string; pourcent: boolean } {
  let s = brut.trim();
  let pourcent = false;
  for (let k = 0; k < 3; k++) {
    const m = UNITES.exec(s);
    if (!m) break;
    if (/%|pour/i.test(m[1]!)) pourcent = true;
    s = s.slice(0, m.index).trim();
  }
  // « 1.307,39 » : point des milliers suivi d'une virgule décimale.
  if (/^\-?\d{1,3}(\.\d{3})+,\d+$/.test(s)) s = s.replace(/\./g, "");
  return { texte: s, pourcent };
}

/** Valeur d'une saisie (« 1 307,39 € », « 3,5 % », « 7/12 », « 1000*1,03^5 ») ; `null` si illisible. */
export function lireNombre(brut: string): number | null {
  const { texte } = nettoyer(brut);
  if (texte === "") return null;
  return lireValeur(texte);
}

/** Nombre de décimales d'une saisie décimale simple (unités retirées) ; `null` sinon. */
export function decimales(brut: string): number | null {
  return decimalesSaisies(nettoyer(brut).texte);
}

export const TOL_CENTIME = 0.01 + 1e-9;

/** Montant juste à un centime près de L'UNE des valeurs admises (calcul exact, ou avec la valeur
 * intermédiaire arrondie que l'énoncé autorise). */
export function statutMontant(brut: string, cibles: number[], tol = TOL_CENTIME): StatutVerification {
  const v = lireNombre(brut);
  if (v === null) return "parse_error";
  return cibles.some((c) => Math.abs(v - c) <= tol) ? "correct" : "not_equivalent";
}

export function montantProche(brut: string, cible: number, tol = TOL_CENTIME): boolean {
  const v = lireNombre(brut);
  return v !== null && Math.abs(v - cible) <= tol;
}

/**
 * Taux saisi en % (« 5,71 », « 5,71 % ») ou en écriture décimale (« 0,0571 ») : juste à `tolPoint`
 * point de pourcentage près de l'une des valeurs admises (en %).
 */
export function statutTaux(brut: string, ciblesPourcent: number[], tolPoint: number): StatutVerification {
  const v = lireNombre(brut);
  if (v === null) return "parse_error";
  const { pourcent } = nettoyer(brut);
  const t = tolPoint + 1e-9;
  if (ciblesPourcent.some((c) => Math.abs(v - c) <= t)) return "correct";
  if (!pourcent && ciblesPourcent.some((c) => Math.abs(100 * v - c) <= t && Math.abs(c) >= 0.05)) return "correct";
  return "not_equivalent";
}

/** Valeur d'un taux saisi, ramenée en % (une saisie décimale sans « % » est lue telle quelle). */
export function tauxSaisiPourcent(brut: string): number | null {
  return lireNombre(brut);
}

export function statutEntier(brut: string, n: number): StatutVerification {
  const v = lireNombre(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - n) < 1e-9 ? "correct" : "not_equivalent";
}

/** Saisie décimale LISIBLE mais trop arrondie (moins de `d` décimales, juste à sa propre précision) :
 * message, AUCUNE tentative consommée. */
export function tropArrondi(brut: string, cibles: number[], d: number, tol: number, precision: string): string | null {
  const k = decimales(brut);
  const v = lireNombre(brut);
  if (k === null || v === null || k >= d) return null;
  if (cibles.some((c) => Math.abs(v - c) <= tol + 1e-9)) return null;
  if (!cibles.some((c) => Math.abs(v - c) <= 0.5 * 10 ** -k + tol + 1e-9)) return null;
  return `Valeur trop arrondie : donne-la ${precision}. Cette saisie ne compte pas comme une tentative.`;
}

export const MESSAGE_MONTANT =
  "Montant non reconnu : écris un nombre comme 1 307,39 (virgule ou point, le signe € est facultatif). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_TAUX =
  "Taux non reconnu : écris un nombre comme 3,5 (en %) ou 0,035 (écriture décimale). Cette saisie ne compte pas comme une tentative.";
export const MESSAGE_ENTIER = "Nombre non reconnu : écris un nombre entier comme 68. Cette saisie ne compte pas comme une tentative.";

/* ----------------------------------------------------------------------------------------------
 * Tirages
 * -------------------------------------------------------------------------------------------- */

export const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
export function melanger<T>(t: readonly T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}
/** Taux en % tiré dans [a ; b] par pas de `pas` (évite les flottants : arrondi à 4 décimales). */
export const tauxEntre = (a: number, b: number, pas: number) => arrondi(a + pas * entier(0, Math.round((b - a) / pas)), 4);

export const PRENOMS = ["Inès", "Lucas", "Amina", "Hugo", "Lina", "Noah", "Chloé", "Yanis", "Sarah", "Mehdi", "Élise", "Arthur", "Zoé", "Karim", "Julie", "Tom"] as const;

/* ----------------------------------------------------------------------------------------------
 * Dates (année de 365 jours : les dates tirées évitent le 29 février)
 * -------------------------------------------------------------------------------------------- */

export const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] as const;
export const JOURS_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

export interface DateSimple {
  jour: number;
  /** 0 = janvier. */
  mois: number;
  annee: number;
}

const estBissextile = (a: number) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;

export function joursEntre(d1: DateSimple, d2: DateSimple): number {
  const t1 = Date.UTC(d1.annee, d1.mois, d1.jour);
  const t2 = Date.UTC(d2.annee, d2.mois, d2.jour);
  return Math.round((t2 - t1) / 86400000);
}

export function dateT(d: DateSimple, avecAnnee = true): string {
  return `${d.jour === 1 ? "1er" : d.jour} ${MOIS[d.mois]}${avecAnnee ? ` ${d.annee}` : ""}`;
}

/** Deux dates d'une période de `minJ` à `maxJ` jours, jamais à cheval sur un 29 février. */
export function deuxDates(minJ: number, maxJ: number): { debut: DateSimple; fin: DateSimple; jours: number } {
  for (let essai = 0; essai < 200; essai++) {
    const annee = parmi([2026, 2027]);
    const mois = entier(0, 11);
    const jour = entier(1, JOURS_MOIS[mois]!);
    const debut = { jour, mois, annee };
    const n = entier(minJ, maxJ);
    const t = new Date(Date.UTC(annee, mois, jour + n));
    const fin = { jour: t.getUTCDate(), mois: t.getUTCMonth(), annee: t.getUTCFullYear() };
    if (estBissextile(fin.annee) || estBissextile(annee)) continue;
    if (fin.annee > 2027) continue;
    return { debut, fin, jours: joursEntre(debut, fin) };
  }
  return { debut: { jour: 15, mois: 4, annee: 2026 }, fin: { jour: 22, mois: 6, annee: 2026 }, jours: 68 };
}

/** Décomposition du compte des jours, mois par mois (« mai : 31 − 15 = 16 ; juin : 30 ; juillet : 22 »). */
export function decompositionJours(d1: DateSimple, d2: DateSimple): { mois: string; jours: number; detail: string }[] {
  const out: { mois: string; jours: number; detail: string }[] = [];
  if (d1.annee === d2.annee && d1.mois === d2.mois) return [{ mois: MOIS[d1.mois]!, jours: d2.jour - d1.jour, detail: `${d2.jour} − ${d1.jour} = ${d2.jour - d1.jour}` }];
  const j1 = JOURS_MOIS[d1.mois]! - d1.jour;
  out.push({ mois: MOIS[d1.mois]!, jours: j1, detail: `${JOURS_MOIS[d1.mois]} − ${d1.jour} = ${j1}` });
  let m = d1.mois + 1;
  let a = d1.annee;
  if (m > 11) {
    m = 0;
    a++;
  }
  while (!(a === d2.annee && m === d2.mois)) {
    out.push({ mois: MOIS[m]!, jours: JOURS_MOIS[m]!, detail: String(JOURS_MOIS[m]) });
    m++;
    if (m > 11) {
      m = 0;
      a++;
    }
  }
  out.push({ mois: MOIS[d2.mois]!, jours: d2.jour, detail: String(d2.jour) });
  return out;
}

/* ----------------------------------------------------------------------------------------------
 * Ligne du temps (SVG autonome)
 * -------------------------------------------------------------------------------------------- */

export interface FlecheTemps {
  de: number;
  a: number;
  /** Texte sous la flèche (Unicode : « × 1,03⁴ », « × (1 + i)⁻ⁿ »). */
  texte: string;
  couleur?: string;
}

export interface SpecLigneTemps {
  /** Dernière graduation (0 … n). */
  n: number;
  /** Étiquette de chaque graduation (défaut : son numéro). */
  etiquette?: (k: number) => string;
  /** Versements : graduation et texte au-dessus (« 1 200 »). */
  versements?: { k: number; texte: string }[];
  /** Point marqué sous l'axe (« V₅ = ? »). */
  marques?: { k: number; texte: string; couleur?: string }[];
  fleches?: FlecheTemps[];
  /** Titre de l'axe à droite (« années », « mois »). */
  unite?: string;
  largeur?: number;
}

const COUL_AXE = "#343a40";
const COUL_VERS = "#1971c2";
export const COUL_FLECHE = "#c2410c";
export const COUL_FLECHE2 = "#2f9e44";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Graduations visibles : toutes si n ≤ 6, sinon 0, 1, 2, 3, …, n − 1, n (et celles qu'on cite). */
function graduationsVisibles(spec: SpecLigneTemps): number[] {
  const n = spec.n;
  if (n <= 6) return Array.from({ length: n + 1 }, (_, k) => k);
  const s = new Set<number>([0, 1, 2, 3, n - 1, n]);
  for (const f of spec.fleches ?? []) {
    s.add(f.de);
    s.add(f.a);
  }
  for (const m of spec.marques ?? []) s.add(m.k);
  return [...s].filter((k) => k >= 0 && k <= n).sort((a, b) => a - b);
}

export function ligneTempsSvg(spec: SpecLigneTemps): string {
  const visibles = graduationsVisibles(spec);
  // Emplacements : une case par graduation visible, une case « … » pour chaque trou.
  const slots: (number | null)[] = [];
  visibles.forEach((k, i) => {
    if (i > 0 && k - visibles[i - 1]! > 1) slots.push(null);
    slots.push(k);
  });
  const L = spec.largeur ?? 380;
  const g = 24;
  const d = 40;
  const pas = (L - g - d) / Math.max(1, slots.length - 1);
  const X = (k: number) => g + pas * slots.indexOf(k);
  const yAxe = 46;
  const nbFleches = spec.fleches?.length ?? 0;
  const H = yAxe + 40 + (spec.marques?.length ? 18 : 0) + nbFleches * 30 + 6;
  const o: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  o.push(`<line x1="${g - 12}" y1="${yAxe}" x2="${L - 14}" y2="${yAxe}" stroke="${COUL_AXE}" stroke-width="1.5"/>`);
  o.push(`<polygon points="${L - 6},${yAxe} ${L - 15},${yAxe - 4.5} ${L - 15},${yAxe + 4.5}" fill="${COUL_AXE}"/>`);
  slots.forEach((k, i) => {
    const x = g + pas * i;
    if (k === null) {
      o.push(`<text x="${x.toFixed(1)}" y="${yAxe + 18}" text-anchor="middle" font-size="12" ${POLICE} fill="${COUL_AXE}">…</text>`);
      return;
    }
    o.push(`<line x1="${x.toFixed(1)}" y1="${yAxe - 5}" x2="${x.toFixed(1)}" y2="${yAxe + 5}" stroke="${COUL_AXE}" stroke-width="1.5"/>`);
    const et = spec.etiquette ? spec.etiquette(k) : String(k);
    o.push(`<text x="${x.toFixed(1)}" y="${yAxe + 19}" text-anchor="middle" font-size="11.5" ${POLICE} fill="${COUL_AXE}">${esc(et)}</text>`);
  });
  if (spec.unite) o.push(`<text x="${L - 6}" y="${yAxe - 9}" text-anchor="end" font-size="10.5" ${POLICE} fill="${COUL_AXE}">${esc(spec.unite)}</text>`);
  for (const v of spec.versements ?? []) {
    if (!slots.includes(v.k)) continue;
    const x = X(v.k);
    o.push(`<line x1="${x.toFixed(1)}" y1="${yAxe - 24}" x2="${x.toFixed(1)}" y2="${yAxe - 9}" stroke="${COUL_VERS}" stroke-width="1.6"/>`);
    o.push(`<polygon points="${x.toFixed(1)},${yAxe - 6} ${(x - 3.5).toFixed(1)},${yAxe - 12} ${(x + 3.5).toFixed(1)},${yAxe - 12}" fill="${COUL_VERS}"/>`);
    o.push(`<text x="${x.toFixed(1)}" y="${yAxe - 28}" text-anchor="middle" font-size="11" ${POLICE} fill="${COUL_VERS}" font-weight="600">${esc(v.texte)}</text>`);
  }
  let y = yAxe + 34;
  for (const m of spec.marques ?? []) {
    if (!slots.includes(m.k)) continue;
    const x = X(m.k);
    o.push(`<circle cx="${x.toFixed(1)}" cy="${yAxe}" r="4" fill="${m.couleur ?? COUL_FLECHE}"/>`);
    const ancre = x < g + 30 ? "start" : x > L - d - 10 ? "end" : "middle";
    o.push(`<text x="${x.toFixed(1)}" y="${y}" text-anchor="${ancre}" font-size="11.5" ${POLICE} fill="${m.couleur ?? COUL_FLECHE}" font-weight="600">${esc(m.texte)}</text>`);
  }
  if (spec.marques?.length) y += 18;
  for (const f of spec.fleches ?? []) {
    if (!slots.includes(f.de) || !slots.includes(f.a)) continue;
    const x1 = X(f.de);
    const x2 = X(f.a);
    const c = f.couleur ?? COUL_FLECHE;
    const yb = y - 4;
    o.push(`<path d="M ${x1.toFixed(1)} ${yAxe + 7} Q ${x1.toFixed(1)} ${yb} ${((x1 + x2) / 2).toFixed(1)} ${yb} Q ${x2.toFixed(1)} ${yb} ${x2.toFixed(1)} ${yAxe + 9}" fill="none" stroke="${c}" stroke-width="1.4"/>`);
    o.push(`<polygon points="${x2.toFixed(1)},${yAxe + 6} ${(x2 - 3.5).toFixed(1)},${yAxe + 13} ${(x2 + 3.5).toFixed(1)},${yAxe + 13}" fill="${c}"/>`);
    o.push(`<text x="${((x1 + x2) / 2).toFixed(1)}" y="${yb + 14}" text-anchor="middle" font-size="11" ${POLICE} fill="${c}">${esc(f.texte)}</text>`);
    y += 30;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" role="img" aria-label="Ligne du temps">${o.join("")}</svg>`;
}

/** Répartit `total` points (≈ 4) au quart de point selon des poids, somme exacte garantie. */
export function repartir(poids: number[], total = 4): number[] {
  const s = poids.reduce((a, b) => a + b, 0);
  const pts = poids.map((p) => Math.max(0.25, Math.round(((total * p) / s) * 4) / 4));
  const ecart = total - pts.reduce((a, b) => a + b, 0);
  const k = pts.indexOf(Math.max(...pts));
  pts[k] = Math.round((pts[k]! + ecart) * 4) / 4;
  return pts;
}

/** Exposant en chiffres Unicode (« ⁴ », « ⁻¹² », « ⁿ⁻¹ »). */
export function exposant(s: string | number): string {
  const t: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "−": "⁻", n: "ⁿ", "+": "⁺" };
  return String(s)
    .split("")
    .map((c) => t[c] ?? c)
    .join("");
}
