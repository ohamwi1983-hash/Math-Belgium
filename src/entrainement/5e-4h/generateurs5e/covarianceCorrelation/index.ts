import { CONTEXTES_PETITS, CONTEXTES_REELS, tirerAbscisses } from "../../core5e/contextesStat2vLotH1";
import type { ExerciceCorrelation, VarianteCorrelation } from "../../core5e/covarianceCorrelation";
import { serieCorrelation } from "../../core5e/petitesSeriesLotH1";
import type { ClasseR, Pt } from "../../core5e/stat2vLotH1";
import { arrondi, classeR, correlation, covariance, distanceSeuil, entier, moyenneProduits, normale, parmi, pointMoyen, sigma } from "../../core5e/stat2vLotH1";

/**
 * Couche A — générateur de `5gen38` « Covariance et coefficient de corrélation ». `Math.random()` seul.
 * - main : classe de r tirée au cinquième (très forte, forte, moyenne, faible, nulle) et sens à pile ou face
 *   AVANT la série (`serieCorrelation` : |r| à 0,025 au moins d'un seuil) ; contexte compatible avec le sens ;
 * - calculatrice : classe tirée au tiers (très forte, forte, moyenne) AVANT la série ; série d'un contexte
 *   réel (sauf l'espérance de vie, aux données fixes) dont le bruit est multiplié jusqu'à tomber dans la
 *   classe, |r| à 0,01 au moins d'un seuil ; le sens est celui du contexte.
 */

function completer(variante: VarianteCorrelation, contexteId: string, points: Pt[], dx: number, dy: number): ExerciceCorrelation {
  const r = correlation(points);
  return {
    variante,
    contexteId,
    points,
    dx,
    dy,
    G: pointMoyen(points),
    cov: arrondi(covariance(points), 10),
    moyProduits: arrondi(moyenneProduits(points), 10),
    sx: sigma(points.map((p) => p.x)),
    sy: sigma(points.map((p) => p.y)),
    r,
    classe: classeR(r),
    positif: covariance(points) > 0,
    ds: 2,
    dr: variante === "main" ? 2 : 3,
    dc: 2,
  };
}

function construireMain(): ExerciceCorrelation {
  const classe = parmi(["tresForte", "forte", "moyenne", "faible", "nulle"] as ClasseR[]);
  const positif = Math.random() < 0.5;
  const c = parmi(CONTEXTES_PETITS.filter((k) => Math.sign(k.pentes[0]!) === (positif ? 1 : -1) || k.id === "generique"));
  const points = serieCorrelation(c, parmi([5, 6]), classe, positif);
  return completer("main", c.id, points, 0, 0);
}

const FACTEURS: Partial<Record<ClasseR, [number, number]>> = { tresForte: [0.2, 1.2], forte: [1.5, 4], moyenne: [3.5, 9] };

function construireCalculatrice(): ExerciceCorrelation {
  const classe = parmi(["tresForte", "forte", "moyenne"] as ClasseR[]);
  for (;;) {
    const c = parmi(CONTEXTES_REELS.filter((k) => !k.reelles));
    const n = entier(7, 10);
    const [lo, hi] = FACTEURS[classe]!;
    const k = lo + Math.random() * (hi - lo);
    const x = tirerAbscisses(c.abscisses(), n);
    const points = x.map((v) => ({ x: v, y: arrondi(c.modele.a * v + c.modele.b + k * c.modele.bruit * normale(), c.dy) }));
    if (points.some((p) => p.y <= 0)) continue;
    const r = correlation(points);
    if (!Number.isFinite(r) || classeR(r) !== classe || distanceSeuil(r) < 0.01) continue;
    return completer("calculatrice", c.id, points, c.dx, c.dy);
  }
}

export function construire(variante: VarianteCorrelation): ExerciceCorrelation {
  return variante === "main" ? construireMain() : construireCalculatrice();
}

export const CATALOGUE_VARIANTES: { id: VarianteCorrelation; label: string }[] = [
  { id: "main", label: "À la main : petite série, covariance par les deux formules" },
  { id: "calculatrice", label: "À la calculatrice : série réelle" },
];

export function construireAvecVarianteId(id: string): ExerciceCorrelation {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceCorrelation(): ExerciceCorrelation {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
