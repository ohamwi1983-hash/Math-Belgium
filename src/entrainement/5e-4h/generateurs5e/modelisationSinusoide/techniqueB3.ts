/**
 * Couche A (5e) — technique B3 de 5gen13 ("système à 2 points"). Génération FORWARD (jamais un
 * solveur inverse) : α₁/α₂ (=ω·t₁+φ / ω·t₂+φ) choisis EN PREMIER dans [−π/2;π/2] (branche
 * principale d'arcsin, garantit l'absence d'ambiguïté de branche à l'écran "poser le système"),
 * puis v₁=A·sin(α₁)+b/v₂=A·sin(α₂)+b DÉRIVÉS — jamais l'inverse, et jamais sans le "+b" (bug
 * corrigé, `prompt5gen8913conventionphiPhi.md` — v_i doit être la valeur RÉELLE de f(t_i), pas
 * seulement du terme en sinus). ω/φ sont ensuite RETROUVÉS depuis α₁/α₂ par soustraction PUIS
 * addition membre à membre (la même technique que l'élève devra appliquer) — cross-vérifié
 * indépendamment dans `techniqueB3.test.ts`.
 *
 * `OMEGA_MIN`/`OMEGA_MAX` — ω=(α₁-α₂)/(t₁-t₂) n'était auparavant PAS borné : la seule contrainte
 * (`ECART_ALPHA_MIN` + `T_MAX` large) laissait ω descendre jusqu'à ~0.0133 (période ~472s),
 * incohérent avec la plage "physiquement plausible" déjà retenue par les 3 AUTRES techniques
 * (B1 : dureeTour∈[20;120] ⟹ ω∈[0.052;0.314] ; B2/donnée : periode∈[4;60] ⟹ ω∈[0.105;1.571]).
 * Borné ici sur la MÊME plage que B2/donnée (`prompt-corrections-precision-5e.md`, Partie 1) — un ω
 * aussi petit rendait aussi les écrans "isolerTResoudre"/"isolerTExtremum"/"isolerTInequation"
 * structurellement impossibles à afficher avec une précision raisonnable (division par ω amplifie
 * tout arrondi affiché) ; une fois ω ramené à cette plage, la précision à 5 décimales déjà en place
 * pour B2/donnée (`arrondiFormuleSubstituee`) suffit aussi pour B3, vérifié empiriquement (0 échec
 * sur un large échantillon, y compris aux bornes ω_min/ω_max). */
import type { DonneesB3 } from "../../core5e/modelisationSinusoide.types";

const T_MIN = 0;
const T_MAX = 30;
const ALPHA_BORNE = 1.3; // < pi/2 ~ 1.5708, marge de sécurité
const A_MIN = 2;
const A_MAX = 15;
const B_MIN = -20;
const B_MAX = 20;
const ECART_ALPHA_MIN = 0.4; // évite omega quasi nul (alpha1≈alpha2)
const OMEGA_MIN = (2 * Math.PI) / 60; // aligné sur PERIODE_MAX de B2/donnée
const OMEGA_MAX = (2 * Math.PI) / 4; // aligné sur PERIODE_MIN de B2/donnée

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function reelAleatoire(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function genererDonneesB3(): DonneesB3 {
  const A = entierAleatoire(A_MIN, A_MAX);
  const b = entierAleatoire(B_MIN, B_MAX);

  let t1 = 0;
  let t2 = 0;
  let alpha1 = 0;
  let alpha2 = 0;
  let omega = 0;
  const TENTATIVES_MAX = 200;
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    t1 = entierAleatoire(T_MIN, T_MAX);
    t2 = entierAleatoire(T_MIN, T_MAX);
    if (t1 === t2) continue;
    alpha1 = reelAleatoire(-ALPHA_BORNE, ALPHA_BORNE);
    alpha2 = reelAleatoire(-ALPHA_BORNE, ALPHA_BORNE);
    if (Math.abs(alpha1 - alpha2) < ECART_ALPHA_MIN) continue;
    omega = (alpha1 - alpha2) / (t1 - t2);
    if (omega >= OMEGA_MIN && omega <= OMEGA_MAX) break;
  }

  const phi = alpha1 - omega * t1;
  const v1 = A * Math.sin(alpha1) + b;
  const v2 = A * Math.sin(alpha2) + b;

  return { technique: "b3", A, b, t1, v1, t2, v2, alpha1, alpha2, fonction: { A, omega, phi, b } };
}
