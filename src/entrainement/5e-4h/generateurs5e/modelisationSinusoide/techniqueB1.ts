/**
 * Couche A (5e) — technique B1 de 5gen13 ("contexte physique direct", ex. grande roue) : A/b/ω
 * calculables depuis rayon/hauteurSol/dureeTour, φ reste SYMBOLIQUE (aucune donnée fournie ne le
 * détermine — piège central de cette technique). ω=2π/dureeTour calculé DIRECTEMENT en rad/s —
 * jamais via une étape intermédiaire en degrés/seconde (écran supprimé, `prompt5gen13B1B2B3.md`).
 */
import type { DonneesB1 } from "../../core5e/modelisationSinusoide.types";

const RAYON_MIN = 5;
const RAYON_MAX = 30;
const HAUTEUR_SOL_MIN = 1;
const HAUTEUR_SOL_MAX = 5;
const DUREE_TOUR_MIN = 20;
const DUREE_TOUR_MAX = 120;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function genererDonneesB1(): DonneesB1 {
  const rayon = entierAleatoire(RAYON_MIN, RAYON_MAX);
  const hauteurSol = entierAleatoire(HAUTEUR_SOL_MIN, HAUTEUR_SOL_MAX);
  const dureeTour = entierAleatoire(DUREE_TOUR_MIN, DUREE_TOUR_MAX);
  const omega = (2 * Math.PI) / dureeTour;

  return {
    technique: "b1",
    rayon,
    hauteurSol,
    dureeTour,
    fonction: { A: rayon, omega, phi: null, b: rayon + hauteurSol },
  };
}
