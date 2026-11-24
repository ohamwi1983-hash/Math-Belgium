/**
 * 5gen28 — vérification UNIFIÉE des écrans (lots B et C de l'audit 5e ch. 5) : chaque écran reçoit
 * une `ReponseTangente` (liste de saisies + « aucune solution ») ; une saisie illisible, approchée,
 * répétée ou incomplète est refusée SANS tentative par le moteur (`refusSaisieTangente`, même
 * fonction que l'écran). Couvre les familles ajoutées au lot C : aucune tangente horizontale
 * (Δ < 0), tangente de pente donnée, tangentes issues d'un point extérieur, écran « deriver » (option
 * f′ à calculer). Réplique locale de f et f′ (la Couche B n'importe jamais la Couche A).
 */
import type { ExerciceTangente } from "../core5e/tangentes.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { EcranTangente } from "./typesTangentes";
import { MESSAGES_ILLISIBLE_DERIVEES, expressionLisibleDerivees } from "./saisieDerivees";
import { deriveeFPointDonne, diagnostiquerNombre, estValeurApprochee, retirerPrefixeTangente, valeurFPointDonne } from "./verificationTangentes";

export interface ReponseTangente {
  valeurs: string[];
  /** « Aucune solution » coché (écran « resoudre » : aucune tangente horizontale). */
  aucune?: boolean;
}

const TOL = 1e-6;
const egal = (v: number, c: number) => Math.abs(v - c) <= TOL * Math.max(1, Math.abs(c));
const signes = (t: string) => t.replace(/[−–—]/g, "-");

export function coeffsLocaux(e: ExerciceTangente): number[] | null {
  switch (e.variante) {
    case "pointDonne":
      return e.sousFamille === "polynomiale" ? e.coeffs : null;
    case "horizontale":
      return [e.d, e.c, e.b, e.a];
    case "doubleTangence":
    case "pente":
      return e.coeffs;
    case "pointExterieur":
      return [e.c, e.b, e.a];
  }
}

export function valeurF(e: ExerciceTangente, x: number): number {
  if (e.variante === "pointDonne") return valeurFPointDonne(e, x);
  return (coeffsLocaux(e) as number[]).reduce((s, c, i) => s + c * x ** i, 0);
}

export function deriveeF(e: ExerciceTangente, x: number): number {
  if (e.variante === "pointDonne") return deriveeFPointDonne(e, x);
  const c = coeffsLocaux(e) as number[];
  let s = 0;
  for (let i = 1; i < c.length; i++) s += i * c[i] * x ** (i - 1);
  return s;
}

function lire(texte: string): number | null {
  try {
    const v = evaluerExpressionGenerale(signes(texte).replace(/^[^=]*=/, ""), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function enX(texte: string, x: number, variable = "x"): number | null {
  try {
    let s = retirerPrefixeTangente(texte).replace(/^f'\(x\)\s*=\s*/i, "");
    if (variable !== "x") s = s.replace(new RegExp(`(?<![a-zA-Z])${variable}(?![a-zA-Z])`, "g"), "x");
    const v = evaluerExpressionGenerale(s, x);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Abscisses où f′ est évaluée (radicale : dans le domaine). */
function pointsF(e: ExerciceTangente): number[] {
  const pts = [0.5, 1.7, -2.3, 3.1, -0.9, 2.6, -1.4];
  if (e.variante === "pointDonne" && e.sousFamille === "radicale") return pts.filter((x) => e.m * x + e.p > 0.05).concat([e.a + 0.3, e.a - 0.2].filter((x) => e.m * x + e.p > 0.05));
  return pts;
}

/** Une droite y = mx + p. */
export interface Droite {
  m: number;
  p: number;
}

function tangenteEn(e: ExerciceTangente, a: number): Droite {
  const m = deriveeF(e, a);
  return { m, p: valeurF(e, a) - m * a };
}

/** Droites attendues à l'écran (tangente(s)). */
export function droitesAttendues(e: ExerciceTangente, ecran: EcranTangente): Droite[] {
  switch (ecran) {
    case "tangente":
      return e.variante === "pointDonne" ? [tangenteEn(e, e.a)] : [];
    case "tangentesPente":
      return e.variante === "pente" ? e.racines.map((r) => tangenteEn(e, r)) : [];
    case "tangentesContact":
      return e.variante === "pointExterieur" ? e.contacts.map((t) => tangenteEn(e, t)) : [];
    default:
      return [];
  }
}

/** Nombres attendus (valeurs exactes), dans l'ordre des champs. */
export function nombresAttendus(e: ExerciceTangente, ecran: EcranTangente): number[] {
  switch (ecran) {
    case "substituer":
      return e.variante === "pointDonne" ? [valeurF(e, e.a), deriveeF(e, e.a)] : [];
    case "resoudre":
      return e.variante === "horizontale" ? e.racines : [];
    case "resoudrePente":
      return e.variante === "pente" ? e.racines : [];
    case "abscissesContact":
      return e.variante === "pointExterieur" ? e.contacts : [];
    case "trouverQ":
      return e.variante === "doubleTangence" ? [e.q] : [];
    case "verifierPente":
      return e.variante === "doubleTangence" ? [deriveeF(e, e.q)] : [];
    default:
      return [];
  }
}

/** Points de tangence attendus (écran « coordonnées »). */
export function pointsAttendus(e: ExerciceTangente): { x: number; y: number }[] {
  const xs = e.variante === "horizontale" || e.variante === "pente" ? e.racines : [];
  return xs.map((x) => ({ x, y: valeurF(e, x) }));
}

/** Condition sur l'abscisse t du point de contact (point extérieur) : yP = f(t) + f′(t)(xP − t),
 * soit C(t) = f(t) + f′(t)(xP − t) − yP = 0. */
export function conditionContact(e: ExerciceTangente, t: number): number {
  if (e.variante !== "pointExterieur") return NaN;
  return valeurF(e, t) + deriveeF(e, t) * (e.xP - t) - e.yP;
}

/** Équation en t saisie : « membre = membre » (ou une expression, sous-entendu « = 0 »), égale à
 * k·C(t) pour un k ≠ 0. La lettre de l'inconnue peut être t, a ou x. */
export function diagnostiquerCondition(texte: string, e: ExerciceTangente): StatutVerification {
  const s = signes(texte).trim();
  if (s === "") return "parse_error";
  const membres = s.split("=");
  if (membres.length > 2) return "parse_error";
  const variable = /(?<![a-zA-Z])t(?![a-zA-Z])/.test(s) ? "t" : /(?<![a-zA-Z])a(?![a-zA-Z])/.test(s) ? "a" : "x";
  const valeur = (u: number): number | null => {
    const g = enX(membres[0], u, variable);
    const d = membres.length === 2 ? enX(membres[1], u, variable) : 0;
    return g === null || d === null ? null : g - d;
  };
  let k: number | null = null;
  for (const u of [0.37, 1.61, -0.83, 2.29, -1.47]) {
    const v = valeur(u);
    const c = conditionContact(e, u);
    if (v === null) return "parse_error";
    if (Math.abs(c) < 1e-9) continue;
    const r = v / c;
    if (k === null) k = r;
    else if (!egal(r, k)) return "not_equivalent";
  }
  return k !== null && Math.abs(k) > 1e-9 ? "correct" : "not_equivalent";
}

/** Valeur de la saisie de l'écran « deriver » égale à f′ ? */
export function diagnostiquerDeriveeTangente(texte: string, e: ExerciceTangente): StatutVerification {
  let n = 0;
  for (const x of pointsF(e)) {
    const v = enX(texte, x);
    const c = deriveeF(e, x);
    if (v === null) continue;
    if (!egal(v, c)) return "not_equivalent";
    n++;
  }
  return n >= 3 ? "correct" : "not_equivalent";
}

function droiteEgale(texte: string, d: Droite): boolean {
  for (const x of [0, 1, 2, -1, 3]) {
    const v = enX(texte, x);
    if (v === null || !egal(v, d.m * x + d.p)) return false;
  }
  return true;
}

function droiteApprochee(texte: string, d: Droite): boolean {
  let exacte = true;
  for (const x of [0, 1, 2, -1, 3]) {
    const v = enX(texte, x);
    const c = d.m * x + d.p;
    if (v === null) return false;
    if (!egal(v, c)) exacte = false;
    if (Math.abs(v - c) > Math.max(0.05, 0.01 * Math.abs(c))) return false;
  }
  return !exacte;
}

/** Appariement exact (ordre libre) de n saisies à n cibles. */
function apparier<C>(saisies: string[], cibles: C[], correspond: (s: string, c: C) => boolean): boolean {
  if (saisies.length !== cibles.length) return false;
  const pris = new Set<number>();
  for (const s of saisies) {
    const i = cibles.findIndex((c, j) => !pris.has(j) && correspond(s, c));
    if (i < 0) return false;
    pris.add(i);
  }
  return true;
}

const nombreJuste = (s: string, c: number) => diagnostiquerNombre(s, c) === "correct";

/** Écrans à LISTE de valeurs (ordre libre, « aucune » possible). */
const ECRANS_LISTE: EcranTangente[] = ["resoudre", "resoudrePente", "abscissesContact"];

/** Écran juste ? (vérification du moteur — une saisie refusée n'arrive jamais ici). */
export function verifierEcranTangente(e: ExerciceTangente, ecran: EcranTangente, r: ReponseTangente): boolean {
  const v = r.valeurs;
  switch (ecran) {
    case "deriver":
      return diagnostiquerDeriveeTangente(v[0] ?? "", e) === "correct";
    case "substituer":
    case "trouverQ":
    case "verifierPente": {
      const c = nombresAttendus(e, ecran);
      return c.length === v.length && c.every((x, i) => nombreJuste(v[i], x));
    }
    case "resoudre":
    case "resoudrePente":
    case "abscissesContact": {
      const c = nombresAttendus(e, ecran);
      if (c.length === 0) return !!r.aucune;
      return !r.aucune && apparier(v, c, nombreJuste);
    }
    case "coordonnees": {
      const pts = pointsAttendus(e);
      const saisis = Array.from({ length: Math.floor(v.length / 2) }, (_, i) => `${v[2 * i]}|${v[2 * i + 1]}`);
      return apparier(saisis, pts, (s, c) => {
        const [x, y] = s.split("|");
        return nombreJuste(x, c.x) && nombreJuste(y, c.y);
      });
    }
    case "tangente":
    case "tangentesPente":
    case "tangentesContact":
      return apparier(v, droitesAttendues(e, ecran), droiteEgale);
    case "tangenteEnP": {
      if (e.variante !== "doubleTangence") return false;
      const d = tangenteEn(e, e.p);
      return nombreJuste(v[0], d.m) && droiteEgale(v[1], d);
    }
    case "condition":
      return diagnostiquerCondition(v[0] ?? "", e) === "correct";
  }
}

const FIN = " Cette saisie ne compte pas comme une tentative.";
const DOUBLON = "Valeur répétée : chaque solution ne s'écrit qu'une fois, même une racine double." + FIN;
const INCOMPLET = "Tes valeurs sont justes, mais il en manque." + FIN;
const ARRONDI = "Valeur arrondie : donne la valeur exacte (racines carrées et fractions acceptées)." + FIN;

/** Saisie refusée SANS tentative (moteur et écran) — rend le message, ou null. */
export function refusSaisieTangente(e: ExerciceTangente, ecran: EcranTangente, r: ReponseTangente): string | null {
  const v = r.valeurs;
  if (r.aucune && ECRANS_LISTE.includes(ecran)) return null;
  switch (ecran) {
    case "deriver":
      return expressionLisibleDerivees(retirerPrefixeTangente(v[0] ?? "").replace(/^f'\(x\)\s*=\s*/i, "")) ? null : MESSAGES_ILLISIBLE_DERIVEES.expressionX;
    case "condition": {
      const s = signes(v[0] ?? "").replace(/(?<![a-zA-Z])[ta](?![a-zA-Z])/g, "x");
      return s.split("=").length <= 2 && s.split("=").every((m) => expressionLisibleDerivees(m)) ? null : "Équation non reconnue : écris l'équation vérifiée par l'abscisse t du point de contact, par exemple t² − 4t + 3 = 0." + FIN;
    }
    case "tangente":
    case "tangentesPente":
    case "tangentesContact": {
      if (v.some((s) => !expressionLisibleDerivees(retirerPrefixeTangente(s)))) return MESSAGES_ILLISIBLE_DERIVEES.equation;
      const ds = droitesAttendues(e, ecran);
      if (v.some((s) => !ds.some((d) => droiteEgale(s, d)) && ds.some((d) => droiteApprochee(s, d)))) return ARRONDI;
      if (v.length > 1 && v.some((s, i) => v.some((t, j) => j > i && ds.some((d) => droiteEgale(s, d) && droiteEgale(t, d))))) return "Même droite écrite deux fois : il y a une tangente par point de contact." + FIN;
      return null;
    }
    case "tangenteEnP": {
      if (lire(v[0] ?? "") === null) return MESSAGES_ILLISIBLE_DERIVEES.nombreExact;
      if (!expressionLisibleDerivees(retirerPrefixeTangente(v[1] ?? ""))) return MESSAGES_ILLISIBLE_DERIVEES.equation;
      return null;
    }
    case "coordonnees": {
      if (v.some((s) => lire(s) === null)) return MESSAGES_ILLISIBLE_DERIVEES.coordonnees;
      const pts = pointsAttendus(e);
      const xs = v.filter((_, i) => i % 2 === 0).map((s) => lire(s) as number);
      const ys = v.filter((_, i) => i % 2 === 1).map((s) => lire(s) as number);
      for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) if (egal(xs[i], xs[j]) && egal(ys[i], ys[j])) return DOUBLON.replace("chaque solution", "chaque point");
      const justes = xs.every((x, i) => pts.some((p) => egal(x, p.x) && egal(ys[i], p.y)));
      if (justes && xs.length < pts.length) return INCOMPLET;
      if (v.some((s, i) => pts.some((p) => estValeurApprochee(s, i % 2 === 0 ? p.x : p.y)))) return ARRONDI;
      return null;
    }
    default: {
      if (v.some((s) => lire(s) === null)) return ECRANS_LISTE.includes(ecran) ? MESSAGES_ILLISIBLE_DERIVEES.liste : MESSAGES_ILLISIBLE_DERIVEES.nombreExact;
      const c = nombresAttendus(e, ecran);
      if (ECRANS_LISTE.includes(ecran)) {
        const nums = v.map((s) => lire(s) as number);
        for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) if (egal(nums[i], nums[j])) return DOUBLON;
        if (c.length > 0 && nums.every((x) => c.some((y) => egal(x, y))) && nums.length < c.length) return INCOMPLET;
      }
      if (v.some((s) => c.some((x) => !nombreJuste(s, x) && estValeurApprochee(s, x)))) return ARRONDI;
      return null;
    }
  }
}
