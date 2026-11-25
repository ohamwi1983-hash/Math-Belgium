import type { ExerciceDetectiveStat, VarianteDetectiveStat } from "../../core5e/detectiveStatistique";
import type { Point2 } from "../../core5e/statistiqueLotH2";
import { arrondi, decimalesAuPlus, entier, gauss, mayer, mediane, melanger, moindresCarres, parmi, resume, somme } from "../../core5e/statistiqueLotH2";
import { CONTEXTES_CAUSALITE, CONTEXTES_EXTRAPOLATION, LEURRES } from "../../moteur5e/modeleDetectiveStatistique";
import { categorieR } from "../../ui5e/formatModeliserPrevoir";

/**
 * Couche A — générateur de `5gen81` « Détective d'erreurs : statistique à deux variables ».
 * `Math.random()` seul (le `?code=` rejoue le tirage, ordre des descriptions et position de la ligne
 * fausse compris). Séries petites et « propres » trouvées par recherche : moyennes, points moyens,
 * pentes et ordonnées exactes à deux décimales au plus (Mayer, moindres carrés), n = 5 et moyennes
 * entières pour les calculs de covariance et de r ; l'erreur doit CHANGER le résultat de façon visible
 * (pente de la copie ≠ bonne pente, G de la copie hors de la droite, catégorie de r différente pour
 * Sx…). `av` (0 à 3 lignes justes avant la ligne fausse) est tiré EN DERNIER.
 */

const uniforme = (a: number, b: number) => a + Math.random() * (b - a);
const distincts = (min: number, max: number, n: number) => melanger(Array.from({ length: max - min + 1 }, (_, i) => min + i)).slice(0, n).sort((u, v) => u - v);
const cle = (p: Point2[]) => p.map((q) => `${q.x};${q.y}`).sort().join("|");

function serieMayerSansTri(): Point2[] {
  for (;;) {
    const xs = distincts(1, 15, 6);
    const alpha = uniforme(0.8, 2.5);
    const beta = uniforme(1, 6);
    const tri = xs.map((x) => ({ x, y: Math.round(alpha * x + beta + 1.4 * gauss()) }));
    if (tri.some((q) => q.y <= 0)) continue;
    const table = melanger(tri);
    const g = (t: Point2[]) => [somme(t.slice(0, 3).map((q) => q.x)), somme(t.slice(0, 3).map((q) => q.y)), somme(t.slice(3).map((q) => q.x)), somme(t.slice(3).map((q) => q.y))];
    if ([...g(tri), ...g(table)].some((s) => s % 3 !== 0)) continue;
    if (cle(table.slice(0, 3)) === cle(tri.slice(0, 3)) || cle(table.slice(0, 3)) === cle(tri.slice(3))) continue;
    const bon = mayer(tri).droite;
    const faux = mayer(table, false).droite;
    if (!Number.isFinite(faux.a) || ![bon.a, bon.b, faux.a, faux.b].every((v) => decimalesAuPlus(v, 2))) continue;
    if (Math.abs(bon.a - faux.a) < 0.1 || bon.a <= 0) continue;
    return table;
  }
}

function pente(): Pick<ExerciceDetectiveStat, "g1" | "g2" | "aArrondi"> {
  for (;;) {
    const x1 = entier(4, 30);
    const y1 = entier(10, 150) / 10;
    const dx = parmi([3, 6, 7, 9, 11, 12, 13]);
    const dy = entier(1, 15);
    const a = dy / dx;
    if (decimalesAuPlus(a, 3) || a < 0.15) continue;
    const ar = arrondi(a, 1);
    if (ar === 0 || Math.abs(a - ar) * x1 < 0.15) continue;
    return { g1: { x: x1, y: y1 }, g2: { x: x1 + dx, y: arrondi(y1 + dy, 1) }, aArrondi: ar };
  }
}

function serieMediane(): Point2[] {
  for (;;) {
    const xs = distincts(1, 14, 6);
    const alpha = uniforme(0.6, 2);
    const beta = uniforme(1, 8);
    const pts = xs.map((x) => ({ x, y: Math.round(alpha * x + beta + 1.6 * gauss()) }));
    if (pts.some((q) => q.y <= 0)) continue;
    const s = resume(pts);
    const d = moindresCarres(pts);
    if (![s.mx, s.my, d.a, d.b].every((v) => decimalesAuPlus(v, 2)) || s.r < 0.8) continue;
    const xm = mediane(xs);
    const ym = mediane(pts.map((q) => q.y));
    if (Math.abs(d.a * xm + d.b - ym) < 0.2) continue;
    return pts;
  }
}

/** n = 5, moyennes entières, pente des moindres carrés exacte à deux décimales (si `penteExacte`). */
function serieCinq(penteExacte: boolean, filtreR: (r: number) => boolean): Point2[] {
  for (;;) {
    const xs = distincts(1, 12, 5);
    const signe = Math.random() < 0.3 ? -1 : 1;
    const alpha = signe * uniforme(0.6, 2.2);
    const beta = signe > 0 ? uniforme(1, 6) : uniforme(20, 28);
    const pts = xs.map((x) => ({ x, y: Math.round(alpha * x + beta + 2 * gauss()) }));
    if (pts.some((q) => q.y <= 0 || q.y > 30)) continue;
    const s = resume(pts);
    if (!Number.isInteger(s.mx) || !Number.isInteger(s.my) || !filtreR(s.r)) continue;
    if (penteExacte && !decimalesAuPlus(s.a, 2)) continue;
    return pts;
  }
}

function serieExtrapolation(contexte: number): Point2[] {
  const c = CONTEXTES_EXTRAPOLATION[contexte]!;
  for (;;) {
    const pts = c.xs.map((x) => ({ x, y: arrondi(c.alpha * x + c.beta + c.bruit * gauss(), c.decY) }));
    const s = resume(pts);
    if (Math.abs(s.r) < 0.9 || Math.abs(s.r) > 0.995) continue;
    return pts;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveStat; label: string }[] = [
  { id: "mayerSansTri", label: "Mayer — groupes formés sans trier les x" },
  { id: "penteArrondie", label: "Mayer — pente arrondie avant de calculer b" },
  { id: "medianeMoyenne", label: "Point moyen — médianes au lieu des moyennes" },
  { id: "xyEchanges", label: "Moindres carrés — x̄ et ȳ échangés dans b" },
  { id: "sxAuLieuSigma", label: "Corrélation — écarts-types divisés par n − 1 (Sx)" },
  { id: "covSansN", label: "Corrélation — covariance sans diviser par n (r > 1)" },
  { id: "extrapolation", label: "Interprétation — extrapolation abusive" },
  { id: "causalite", label: "Interprétation — « donc x cause y »" },
];

export function construire(variante: VarianteDetectiveStat): ExerciceDetectiveStat {
  const base = { variante, points: [] as Point2[] } as Omit<ExerciceDetectiveStat, "av" | "options" | "ordreCorrection">;
  switch (variante) {
    case "mayerSansTri":
      base.points = serieMayerSansTri();
      break;
    case "penteArrondie":
      Object.assign(base, pente());
      break;
    case "medianeMoyenne":
      base.points = serieMediane();
      break;
    case "xyEchanges":
      for (;;) {
        const pts = serieCinq(true, (r) => Math.abs(r) > 0.7);
        const s = resume(pts);
        if (Math.abs(s.mx - s.a * s.my - s.b) >= 0.5) {
          base.points = pts;
          break;
        }
      }
      break;
    case "sxAuLieuSigma":
      base.points = serieCinq(false, (r) => Math.abs(r) >= 0.82 && Math.abs(r) <= 0.97 && categorieR(r) !== categorieR(0.8 * r));
      break;
    case "covSansN":
      base.points = serieCinq(false, (r) => Math.abs(r) >= 0.6 && Math.abs(r) <= 0.97);
      break;
    case "extrapolation": {
      base.contexte = entier(0, CONTEXTES_EXTRAPOLATION.length - 1);
      base.points = serieExtrapolation(base.contexte);
      base.xLoin = CONTEXTES_EXTRAPOLATION[base.contexte]!.xLoin;
      break;
    }
    case "causalite":
      base.contexte = entier(0, CONTEXTES_CAUSALITE.length - 1);
      break;
  }
  const options = melanger([variante as string, ...LEURRES[variante]]);
  const ordreCorrection = melanger([0, 1, 2, 3]);
  return { ...base, options, ordreCorrection, av: entier(0, 3) };
}

export function construireAvecVariante(id: string): ExerciceDetectiveStat {
  return construire(CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveStat(): ExerciceDetectiveStat {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
