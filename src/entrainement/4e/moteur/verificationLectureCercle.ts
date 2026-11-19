import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { ExerciceLectureCercle, ValeurExacteSignee } from "../core/lectureCercle.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { VALEUR_GRANDEUR, angleReference, candidatsCosinus, cosExact, ramener, sinExact, tanExact, valeurNumerique } from "./modeleLectureCercle";

/**
 * Vérification de gen122 « Lire sur le cercle trigonométrique ».
 *
 * Lecture des saisies (jamais de blocage de frappe : la saisie est lue telle quelle) : toute forme
 * exacte juste est acceptée — « √3/2 », « sqrt(3)/2 », « racine(3)/2 », « \frac{\sqrt3}{2} »,
 * « \dfrac{\sqrt{3}}{2} », « 1/√3 », « 0,5 » = « 1/2 », « −1 » (« − », « – » lus), préfixe recopié
 * (« cos θ = … ») et unité (« ° », « rad ») ignorés ; angles en radians avec π (« 2π/3 », « 2pi/3 »,
 * « \frac{2\pi}{3} », « 2/3π »).
 *
 * Statuts qui ne consomment AUCUNE tentative (l'appli ne les transmet pas au moteur) :
 * - `parse_error` : saisie illisible ;
 * - `approchee` : décimal proche d'une valeur remarquable irrationnelle (« 0,87 » pour √3/2, « 2,09 »
 *   pour 2π/3) — la lecture est peut-être juste, seule la forme ne va pas (même décision que gen76) ;
 * - `recopie` : sin, cos ou tan tapé dans le champ.
 * Statuts qui consomment une tentative, avec un identifiant de piège (message ciblé dans
 * `ui/formatLectureCercle.ts`) : `correct`, `faux`, `piege`.
 */

type E = ExerciceLectureCercle;

export type EtatLecture = "correct" | "faux" | "piege" | "parse_error" | "approchee" | "recopie";

export const ETATS_SANS_TENTATIVE: readonly EtatLecture[] = ["parse_error", "approchee", "recopie"];

const TOL = 1e-9;

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOL * Math.max(1, Math.abs(b));
}

/** Retire « … = » recopié, unités, et traduit LaTeX / Unicode vers la syntaxe de l'évaluateur. */
export function normaliserSaisieLecture(texte: string): string {
  let s = normaliserSigneMoins(texte).trim();
  // Préfixe recopié (« cos θ = », « tan(θ)= », « θ = ») : on garde ce qui suit le dernier « = ».
  if (s.includes("=")) s = s.slice(s.lastIndexOf("=") + 1);
  s = s
    .replace(/\\left|\\right|\\displaystyle/g, "")
    .replace(/\\[,;!: ]/g, " ")
    .replace(/\\(cdot|times)/g, "*")
    .replace(/[×·]/g, "*")
    .replace(/÷/g, "/")
    .replace(/\\pi\b|π/g, "pi")
    .replace(/½/g, "(1/2)");
  // \sqrt{3}, \sqrt3 d'abord (leurs accolades gêneraient la lecture des fractions)
  s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, "sqrt($1)").replace(/\\sqrt\s*([0-9]+)/g, "sqrt($1)");
  // \frac{a}{b}, \dfrac{a}{b}, \tfrac{a}{b} (imbrications simples comprises, de l'intérieur vers l'extérieur)
  for (let i = 0; i < 4; i++) s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, "(($1)/($2))");
  // \frac12, \frac{1}2… (arguments d'un seul caractère)
  s = s.replace(/\\[dt]?frac\s*(\{[^{}]*\}|[0-9a-z])\s*(\{[^{}]*\}|[0-9a-z])/g, (_m, a: string, b: string) => `((${a.replace(/[{}]/g, "")})/(${b.replace(/[{}]/g, "")}))`);
  // √(…), √3, sqrt3, rac3, racine 3
  s = s.replace(/√\s*\(/g, "sqrt(").replace(/√\s*([0-9]+)/g, "sqrt($1)");
  s = s.replace(/\b(sqrt|racine|rac)\s*([0-9]+)/gi, "sqrt($2)").replace(/\b(racine|rac)\s*\(/gi, "sqrt(");
  s = s.replace(/[{}]/g, (c) => (c === "{" ? "(" : ")"));
  // Unités
  s = s.replace(/°|degrés?|degres?|\brad(ians?)?\b/gi, "");
  // Virgule décimale
  s = s.replace(/(\d)\s*,\s*(\d)/g, "$1.$2");
  return s.trim();
}

export interface LectureNombre {
  etat: "ok" | "parse_error" | "recopie";
  valeur: number;
  /** Écrit avec un décimal (« 0,87 », « 2.09 »). */
  decimal: boolean;
  /** Contient π. */
  avecPi: boolean;
  /** Unité « ° » ou « degré » écrite par l'élève. */
  avecDegre: boolean;
}

export function lireNombreLecture(texte: string): LectureNombre {
  const avecDegre = /°|degr/i.test(texte);
  const s = normaliserSaisieLecture(texte);
  const vide: LectureNombre = { etat: "parse_error", valeur: Number.NaN, decimal: false, avecPi: false, avecDegre };
  if (s === "") return vide;
  if (/sin|cos|tan/i.test(s)) return { ...vide, etat: "recopie" };
  if (/[a-z]/i.test(s.replace(/sqrt|pi/gi, ""))) return vide;
  if (/[^0-9a-z+\-*/^(). ]/i.test(s)) return vide;
  let v: number;
  try {
    v = evaluerExpressionGenerale(s, 0);
  } catch {
    return vide;
  }
  if (!Number.isFinite(v)) return vide;
  return { etat: "ok", valeur: v, decimal: /\d\.\d|(^|[^\d])\.\d/.test(s), avecPi: /pi/i.test(s), avecDegre };
}

/** Décimal proche (mais différent) d'une valeur remarquable irrationnelle, au signe près. */
function procheIrrationnel(v: number, valeurs: number[]): boolean {
  return valeurs.some((g) => !egal(Math.abs(v), g) && Math.abs(Math.abs(v) - g) <= Math.max(0.02, 0.02 * g));
}

const IRRATIONNELS = [VALEUR_GRANDEUR["r2/2"], VALEUR_GRANDEUR["r3/2"], VALEUR_GRANDEUR["r3/3"], VALEUR_GRANDEUR.r3];

// ---------------------------------------------------------------------------------------------
// Écran 1 — cos θ et sin θ
// ---------------------------------------------------------------------------------------------

/** Pièges de l'écran 1 (un par champ faux, plus l'échange des deux champs). */
export type PiegeCoordonnees = "echange" | "signe" | "graduation" | "coordonnee-nulle";

export interface DiagnosticCoordonnees {
  /** `parse_error` / `approchee` / `recopie` : rien n'est transmis au moteur. */
  etat: EtatLecture;
  champs: [boolean, boolean];
  piege?: PiegeCoordonnees;
  /** Champ visé par le piège (0 : cos, 1 : sin). */
  champPiege?: 0 | 1;
}

function lectureSansTentative(l: LectureNombre, cible: number): EtatLecture | null {
  if (l.etat !== "ok") return l.etat;
  if (l.decimal && !egal(l.valeur, cible) && procheIrrationnel(l.valeur, IRRATIONNELS)) return "approchee";
  return null;
}

export function diagnostiquerCoordonnees(e: E, saisieCos: string, saisieSin: string): DiagnosticCoordonnees {
  const c = valeurNumerique(cosExact(e));
  const s = valeurNumerique(sinExact(e));
  const lc = lireNombreLecture(saisieCos);
  const ls = lireNombreLecture(saisieSin);
  for (const [l, cible] of [[lc, c], [ls, s]] as const) {
    const sans = lectureSansTentative(l, cible);
    if (sans === "parse_error" || sans === "recopie") return { etat: sans, champs: [false, false] };
  }
  for (const [l, cible] of [[lc, c], [ls, s]] as const) {
    if (lectureSansTentative(l, cible) === "approchee") return { etat: "approchee", champs: [false, false] };
  }
  const okC = egal(lc.valeur, c);
  const okS = egal(ls.valeur, s);
  if (okC && okS) return { etat: "correct", champs: [true, true] };
  if (!egal(c, s) && egal(lc.valeur, s) && egal(ls.valeur, c)) return { etat: "piege", champs: [false, false], piege: "echange" };
  const champs: [boolean, boolean] = [okC, okS];
  const index: 0 | 1 = okC ? 1 : 0;
  const v = index === 0 ? lc.valeur : ls.valeur;
  const cible = index === 0 ? c : s;
  if (cible !== 0 && egal(v, -cible)) return { etat: "piege", champs, piege: "signe", champPiege: index };
  if (cible === 0 || egal(v, 0)) return { etat: "piege", champs, piege: "coordonnee-nulle", champPiege: index };
  if (Math.sign(v) === Math.sign(cible)) return { etat: "piege", champs, piege: "graduation", champPiege: index };
  return { etat: "faux", champs };
}

// ---------------------------------------------------------------------------------------------
// Écran 2 — l'angle θ
// ---------------------------------------------------------------------------------------------

export type PiegeAngle = "unite" | "hors-intervalle" | "reference" | "candidat-cos" | "candidat-sin" | "oppose";

export interface DiagnosticAngle {
  etat: EtatLecture;
  piege?: PiegeAngle;
}

function estEntier(x: number): boolean {
  return Math.abs(x - Math.round(x)) < 1e-7;
}

export function diagnostiquerAngle(e: E, saisie: string): DiagnosticAngle {
  const l = lireNombreLecture(saisie);
  if (l.etat !== "ok") return { etat: l.etat };
  let degres: number;
  if (e.variante === "degres") {
    if (l.avecPi) return { etat: "piege", piege: "unite" };
    degres = l.valeur;
  } else {
    if (l.avecDegre) return { etat: "piege", piege: "unite" };
    if (!l.avecPi) {
      if (egal(l.valeur, 0) && e.angle === 0) return { etat: "correct" };
      if (l.decimal && procheAngleRadian(l.valeur)) return { etat: "approchee" };
      // Un entier plus grand qu'un tour en radians : c'est une mesure en degrés.
      if (estEntier(l.valeur) && l.valeur >= 7) return { etat: "piege", piege: "unite" };
      return { etat: "faux" };
    }
    degres = (l.valeur * 180) / Math.PI;
  }
  if (Math.abs(degres - e.angle) < 1e-7) return { etat: "correct" };
  if (!estEntier(degres)) return { etat: "faux" };
  const d = Math.round(degres);
  if (ramener(d) === e.angle) return { etat: "piege", piege: "hors-intervalle" };
  if (d < 0 || d >= 360) return { etat: "faux" };
  const ref = angleReference(e);
  if (d === ref && ref !== e.angle) return { etat: "piege", piege: "reference" };
  if (candidatsCosinus(e).includes(d)) return { etat: "piege", piege: "candidat-cos" };
  if (d === ramener(180 - e.angle)) return { etat: "piege", piege: "candidat-sin" };
  if (d === ramener(e.angle + 180)) return { etat: "piege", piege: "oppose" };
  return { etat: "faux" };
}

/** Décimal proche d'un angle remarquable en radians (kπ/6 ou kπ/4), mais pas égal. */
function procheAngleRadian(v: number): boolean {
  for (let d = 0; d < 360; d += 15) {
    if (d % 30 !== 0 && d % 45 !== 0) continue;
    const r = (d * Math.PI) / 180;
    if (!egal(v, r) && Math.abs(v - r) <= 0.02) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Écran 3 — tan θ sur la tangente
// ---------------------------------------------------------------------------------------------

/** Texte soumis par le bouton « tan θ n'est pas définie ». */
export const SAISIE_NON_DEFINIE = "§non-definie";

export type PiegeTangente = "non-definie-a-tort" | "definie-a-tort" | "sinus" | "signe" | "inverse" | "cosinus";

export interface DiagnosticTangente {
  etat: EtatLecture;
  piege?: PiegeTangente;
}

export function diagnostiquerTangente(e: E, saisie: string): DiagnosticTangente {
  const t: ValeurExacteSignee | null = tanExact(e);
  if (saisie === SAISIE_NON_DEFINIE) return t === null ? { etat: "correct" } : { etat: "piege", piege: "non-definie-a-tort" };
  const l = lireNombreLecture(saisie);
  if (l.etat !== "ok") return { etat: l.etat };
  const cible = t === null ? Number.NaN : valeurNumerique(t);
  if (l.decimal && !egal(l.valeur, cible) && procheIrrationnel(l.valeur, IRRATIONNELS)) return { etat: "approchee" };
  const v = l.valeur;
  const sin = valeurNumerique(sinExact(e));
  const cos = valeurNumerique(cosExact(e));
  if (t === null) return { etat: "piege", piege: egal(v, sin) ? "sinus" : "definie-a-tort" };
  if (egal(v, cible)) return { etat: "correct" };
  if (egal(v, sin)) return { etat: "piege", piege: "sinus" };
  if (cible !== 0 && egal(v, -cible)) return { etat: "piege", piege: "signe" };
  if (cible !== 0 && !egal(Math.abs(cible), 1) && egal(Math.abs(v), 1 / Math.abs(cible))) return { etat: "piege", piege: "inverse" };
  if (egal(v, cos)) return { etat: "piege", piege: "cosinus" };
  return { etat: "faux" };
}
