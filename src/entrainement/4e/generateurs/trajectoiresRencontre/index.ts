import type { ContexteTrajectoires, ExerciceTrajectoires, VerdictTrajectoires } from "../../core/trajectoiresRencontre.types";
import { choisir, entier, nonNul, type P } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen97 « Trajectoires et rencontre ». Tout le hasard passe par `Math.random`
 * (`genererAvecCode` le remplace par une graine : le QR code rouvre le MÊME exercice).
 *
 * Le VERDICT est tiré en premier, à parts égales (collision / croisement sans rencontre /
 * parallèles), avant toute boucle de rejet : les contraintes de rejet ne biaisent pas sa fréquence.
 * Construction à rebours : point de croisement K entier et instants entiers (1 à 6), départs
 * P₁ = K − t₁·v₁, P₂ = K − t₂·v₂ ; collision : t₁ = t₂ ; croisement : |t₁ − t₂| ≥ 1 (le système
 * « même t » n'a alors AUCUNE solution — c'est le piège central) ; parallèles : v₂ = λ·v₁
 * (λ = ±1, ±2), départ du second mobile hors de la trajectoire du premier. Composantes des vecteurs
 * jamais nulles, coordonnées des départs comprises entre −30 et 30.
 */

export const CONTEXTES: ContexteTrajectoires[] = ["bateaux", "drones", "joueurs"];
export const VERDICTS: VerdictTrajectoires[] = ["collision", "croisement", "paralleles"];

function vecteur(max: number): P {
  return { x: nonNul(-max, max), y: nonNul(-max, max) };
}

const dans = (p: P, M: number) => Math.abs(p.x) <= M && Math.abs(p.y) <= M;

export function genererTrajectoires(verdict?: VerdictTrajectoires, contexte?: ContexteTrajectoires): ExerciceTrajectoires {
  const v = verdict ?? choisir(VERDICTS);
  const ctx = contexte ?? choisir(CONTEXTES);
  const max = ctx === "bateaux" ? 6 : 4;
  for (;;) {
    const v1 = vecteur(max);
    if (v === "paralleles") {
      const lambda = choisir([-2, -1, 1, 2]);
      const v2 = { x: lambda * v1.x, y: lambda * v1.y };
      if (!dans(v2, 8)) continue;
      const P1 = { x: entier(-12, 12), y: entier(-12, 12) };
      const ecart = { x: entier(-8, 8), y: entier(-8, 8) };
      // Départ du mobile 2 HORS de la trajectoire 1 (critère de colinéarité de l'écart et de v₁ non nul).
      if (ecart.x * v1.y - ecart.y * v1.x === 0) continue;
      const P2 = { x: P1.x + ecart.x, y: P1.y + ecart.y };
      if (!dans(P2, 30)) continue;
      return { contexte: ctx, verdict: v, P1, v1, P2, v2, K: null, t1: null, t2: null };
    }
    const v2 = vecteur(max);
    if (v1.x * v2.y - v1.y * v2.x === 0) continue;
    const K = { x: entier(-8, 8), y: entier(-8, 8) };
    const t1 = entier(1, 6);
    const t2 = v === "collision" ? t1 : entier(1, 6);
    if (v === "croisement" && t2 === t1) continue;
    const P1 = { x: K.x - t1 * v1.x, y: K.y - t1 * v1.y };
    const P2 = { x: K.x - t2 * v2.x, y: K.y - t2 * v2.y };
    if (!dans(P1, 30) || !dans(P2, 30)) continue;
    if (P1.x === P2.x && P1.y === P2.y) continue;
    return { contexte: ctx, verdict: v, P1, v1, P2, v2, K, t1, t2 };
  }
}

export const CATALOGUE_VARIANTES: { id: ContexteTrajectoires; label: string }[] = [
  { id: "bateaux", label: "Deux bateaux (km, heures)" },
  { id: "drones", label: "Deux drones (m, secondes)" },
  { id: "joueurs", label: "Deux joueurs sur un terrain (m, secondes)" },
];

export function construireAvecVariante(id: string): ExerciceTrajectoires {
  if (CONTEXTES.includes(id as ContexteTrajectoires)) return genererTrajectoires(undefined, id as ContexteTrajectoires);
  return genererExerciceTrajectoires();
}

export function genererExerciceTrajectoires(): ExerciceTrajectoires {
  return genererTrajectoires();
}
