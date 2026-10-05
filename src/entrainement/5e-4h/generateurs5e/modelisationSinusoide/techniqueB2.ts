/**
 * Couche A (5e) — technique B2 de 5gen13 ("max/min + un point extremum"). Le point (t₀,valeur)
 * fourni est TOUJOURS un extremum (jamais un point quelconque) — évite l'ambiguïté de périodicité
 * déjà rencontrée sur le déphasage de 5gen9.
 */
import type { DonneesB2 } from "../../core5e/modelisationSinusoide.types";

const MIN_MIN = -20;
const MIN_MAX = 20;
const AMPLITUDE_MIN = 2;
const AMPLITUDE_MAX = 15;
const PERIODE_MIN = 4;
const PERIODE_MAX = 60;
const T0_MIN = 0;
const T0_MAX = 30;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function genererDonneesB2(): DonneesB2 {
  const min = entierAleatoire(MIN_MIN, MIN_MAX);
  const amplitude = entierAleatoire(AMPLITUDE_MIN, AMPLITUDE_MAX);
  const max = min + 2 * amplitude;
  const periode = entierAleatoire(PERIODE_MIN, PERIODE_MAX);
  const t0 = entierAleatoire(T0_MIN, T0_MAX);
  const estMax = Math.random() < 0.5;

  const A = (max - min) / 2;
  const b = (max + min) / 2;
  const omega = (2 * Math.PI) / periode;
  const argumentCible = estMax ? Math.PI / 2 : (3 * Math.PI) / 2;
  const phi = argumentCible - omega * t0;

  return { technique: "b2", max, min, periode, t0, estMax, argumentCible, fonction: { A, omega, phi, b } };
}
