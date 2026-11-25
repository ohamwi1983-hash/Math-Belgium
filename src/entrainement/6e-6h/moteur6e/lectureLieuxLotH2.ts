import { evaluerExpressionGenerale } from "../../4e/moteur/expressionGenerale";
import { lireNombre, normaliserExpression } from "../../4e/moteur/verificationTransfertSecondDegre";
import { lirePoints } from "../../4e/ui/outilsAnalytiqueLotG";
import type { Pt } from "../ui6e/outilsLieuxLotH2";

/**
 * Lecture commune du lot H2 du 6e ch. 9 (6gen128–6gen131). Rien n'est jamais retiré de la frappe :
 * on lit ce qui est écrit (seul `normaliserSigneMoins`, via `normaliserExpression`), et une saisie qui
 * ne se lit pas renvoie `null` (le générateur répond `parse_error` : AUCUNE tentative consommée).
 *
 * - **Équation** (`lireEquation`) : « gauche = droite » (préfixe « Γ : », « d ≡ » toléré), lettres x, y
 *   (et un paramètre m, a ou t selon l'écran), produits implicites « 2xy », « my » ; plusieurs
 *   équations séparées par « ou » ou « ; » (réunion de droites) = produit des membres. Comparée à
 *   l'équation attendue par PROPORTIONNALITÉ (`proportionnelle` : mêmes rapports en dix points) —
 *   toute écriture équivalente à un facteur près est acceptée (développée, réduite (x − a)² + …,
 *   y = …, divisée, multipliée). Une écriture non polynomiale qui décrit le MÊME ensemble (racine,
 *   carré d'une équation) est reconnue à part (`memeEnsemble`) : message « à reprendre », sans
 *   tentative.
 * - **Expression en fonction d'un paramètre** (`lireExpression`) : comparée en cinq valeurs.
 * - **Points** : `lirePoints` du 4e ch. 7 (« (1 ; 2) ; (−3 ; 0) », « aucun ») ; ensemble comparé sans
 *   tenir compte de l'ordre.
 * - **Nombre** : `lireNombre` du 4e (fractions, virgule, √).
 */

const FONCTIONS = new Set(["sqrt", "racine", "rac", "abs", "cbrt", "pi"]);

/** Expression prête pour `evaluerExpressionGenerale` (« 2xy » → « 2x*y ») ; `null` si une lettre
 * inconnue apparaît. */
export function preparer(saisie: string, lettres: readonly string[]): string | null {
  const s = normaliserExpression(saisie).replace(/\s+/g, " ").trim();
  if (s === "") return null;
  let ok = true;
  const r = s.replace(/[a-zA-Z]+/g, (mot) => {
    const bas = mot.toLowerCase();
    if (FONCTIONS.has(bas)) return bas;
    if ([...bas].every((c) => lettres.includes(c))) return [...bas].join("*");
    ok = false;
    return mot;
  });
  return ok ? r : null;
}

type Valeurs = Record<string, number>;
export type FonctionLue = (v: Valeurs) => number;

function evaluer(expr: string, v: Valeurs): number {
  const { x, ...autres } = v;
  return evaluerExpressionGenerale(expr, x ?? Number.NaN, autres);
}

/** Une équation « G = D » (ou plusieurs séparées par « ou » / « ; ») → fonction G − D (produit). */
export function lireEquation(saisie: string, lettres: readonly string[] = ["x", "y"]): FonctionLue | null {
  const brut = saisie
    .replace(/^\s*[A-Za-zΓΔ𝒞][A-Za-z0-9_′'₀-₉]*\s*(:|≡)\s*/, "")
    .replace(/≡/g, "=");
  const morceaux = brut.split(/\s+ou\s+|;/i).map((m) => m.trim());
  if (morceaux.some((m) => m === "")) return null;
  const fonctions: FonctionLue[] = [];
  for (const m of morceaux) {
    const cotes = m.split("=");
    if (cotes.length !== 2) return null;
    const g = preparer(cotes[0]!, lettres);
    const d = preparer(cotes[1]!, lettres);
    if (g === null || d === null) return null;
    const essai: Valeurs = {};
    lettres.forEach((c, i) => (essai[c] = 0.731 + 0.417 * i));
    try {
      const a = evaluer(g, essai);
      const b = evaluer(d, essai);
      if (typeof a !== "number" || typeof b !== "number") return null;
    } catch {
      return null;
    }
    fonctions.push((v) => {
      try {
        return evaluer(g, v) - evaluer(d, v);
      } catch {
        return Number.NaN;
      }
    });
  }
  return (v) => fonctions.reduce((p, f) => p * f(v), 1);
}

/** Points de contrôle génériques (évitent les nœuds entiers et les axes). */
export const POINTS_CONTROLE: Pt[] = [
  { x: 0.37, y: 2.91 },
  { x: -1.73, y: 0.58 },
  { x: 2.46, y: -1.19 },
  { x: -3.11, y: -2.47 },
  { x: 4.27, y: 3.63 },
  { x: 1.13, y: -3.82 },
  { x: -0.62, y: 4.71 },
  { x: 3.39, y: 0.21 },
  { x: -4.53, y: 1.87 },
  { x: 0.91, y: 1.37 },
];

/** F et P proportionnelles (rapport constant non nul) aux points donnés. */
export function proportionnelle(F: (p: Pt) => number, P: (p: Pt) => number, points: Pt[] = POINTS_CONTROLE): boolean {
  let rapport: number | null = null;
  let utiles = 0;
  for (const p of points) {
    const vp = P(p);
    const vf = F(p);
    if (!Number.isFinite(vf) || !Number.isFinite(vp)) return false;
    if (Math.abs(vp) < 1e-6) {
      if (Math.abs(vf) > 1e-6 * (1 + Math.abs(vf))) return false;
      continue;
    }
    const r = vf / vp;
    if (rapport === null) {
      if (Math.abs(r) < 1e-9) return false;
      rapport = r;
    } else if (Math.abs(r - rapport) > 1e-7 * Math.max(1, Math.abs(rapport))) return false;
    utiles++;
  }
  return utiles >= 4;
}

/** F s'annule sur les points de la courbe et pas sur les points hors de la courbe. */
export function memeEnsemble(F: (p: Pt) => number, sur: Pt[], hors: Pt[]): boolean {
  const vh = hors.map(F);
  if (vh.some((v) => !Number.isFinite(v))) return false;
  const tri = vh.map(Math.abs).sort((a, b) => a - b);
  const echelle = tri[Math.floor(tri.length / 2)]!;
  if (!(echelle > 0)) return false;
  if (tri[0]! < 1e-7 * echelle) return false;
  for (const p of sur) {
    const v = F(p);
    if (!Number.isFinite(v) || Math.abs(v) > 1e-6 * echelle) return false;
  }
  return true;
}

/** Fonction (x, y) d'une saisie (paramètres fixés) ; `null` si illisible. */
export function equationXY(saisie: string, params: Valeurs = {}): ((p: Pt) => number) | null {
  const f = lireEquation(saisie, ["x", "y", ...Object.keys(params)]);
  if (!f) return null;
  return (p) => f({ x: p.x, y: p.y, ...params });
}

/** Expression d'un paramètre (« √(100−a²)/2 ») ; `null` si illisible. */
export function lireExpression(saisie: string, param: string): ((v: number) => number) | null {
  const s = saisie.replace(/^\s*[a-zA-Z][a-zA-Z0-9_₀-₉]*\s*=\s*/, "");
  const e = preparer(s, [param]);
  if (e === null || /=/.test(e)) return null;
  try {
    const v = evaluer(e, { [param]: 0.613 });
    if (typeof v !== "number") return null;
  } catch {
    return null;
  }
  return (v) => {
    try {
      return evaluer(e, { [param]: v });
    } catch {
      return Number.NaN;
    }
  };
}

export const egalNum = (u: number, v: number, eps = 1e-7): boolean => Number.isFinite(u) && Math.abs(u - v) <= eps * Math.max(1, Math.abs(v));

export { lireNombre, lirePoints };

/** Même ensemble de points (ordre indifférent, doublons refusés). */
export function memesPoints(a: Pt[], b: Pt[], eps = 1e-6): boolean {
  if (a.length !== b.length) return false;
  const reste = [...b];
  for (const p of a) {
    const i = reste.findIndex((q) => Math.abs(q.x - p.x) < eps && Math.abs(q.y - p.y) < eps);
    if (i < 0) return false;
    reste.splice(i, 1);
  }
  return true;
}
