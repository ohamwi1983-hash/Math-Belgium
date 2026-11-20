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

/** Numérateur n de φ = nπ/(2T) : argument visé π/2 (maximum) ou −π/2 (minimum), φ = cible − ωt₀
 * ramené dans ]−π ; π] (décision de l'utilisateur, audit 5e ch. 2, P6 : « φ = 139π/98 » n'est plus
 * imprimé). Source unique : générateur, affichage exact, corrigé. */
export function numerateurPhiB2(periode: number, t0: number, estMax: boolean): number {
  const d = 2 * periode;
  let n = (estMax ? periode : -periode) - 4 * t0;
  while (n > d) n -= 2 * d;
  while (n <= -d) n += 2 * d;
  return n;
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
  const argumentCible = estMax ? Math.PI / 2 : -Math.PI / 2;
  const phi = (numerateurPhiB2(periode, t0, estMax) * Math.PI) / (2 * periode);

  return { technique: "b2", max, min, periode, t0, estMax, argumentCible, fonction: { A, omega, phi, b } };
}
