/**
 * Couche A (5e) — famille "limiteInfiniePoint" de 5gen20. N(x)=kN·x+bN (N(a)≠0), D(x) nul en a —
 * "racineSimple" : D(x)=kD·(x-a)·(x-q), le signe de D change de part et d'autre de a (2 limites
 * unilatérales potentiellement différentes) ; "racineDouble" : D(x)=kD·(x-a)², signe CONSTANT des
 * deux côtés (1 seule limite bilatérale). Tous les signes sont dérivés en arithmétique EXACTE
 * (jamais un flottant), stockés directement sur l'exercice pour réutilisation moteur/présentation.
 */
import type { ExerciceLimiteInfiniePoint } from "../../core5e/limites.types";
import { entierAleatoire, entierNonNul } from "./fraction";

function signeDe(n: number): 1 | -1 {
  return n < 0 ? -1 : 1;
}

/** `sousCasForce` — réservé au panneau dev (`SelecteurVarianteDev`), pour forcer manuellement le
 * sous-cas "racineSimple"/"racineDouble" plutôt que le tirage aléatoire habituel. */
export function genererExerciceLimiteInfiniePoint(sousCasForce?: "racineSimple" | "racineDouble"): ExerciceLimiteInfiniePoint {
  const a = entierAleatoire(-4, 4);
  const sousCas: "racineSimple" | "racineDouble" = sousCasForce ?? (Math.random() < 0.5 ? "racineSimple" : "racineDouble");

  // N(x)=kN·x+bN — N(a) construit EN PREMIER (signe+magnitude choisis directement), bN dérivé.
  const signeNumerateurA: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  const magnitudeNumA = entierAleatoire(1, 8);
  const valeurNumA = signeNumerateurA * magnitudeNumA;
  const kN = entierNonNul(4);
  const bN = valeurNumA - kN * a;

  const kD = entierNonNul(3);

  if (sousCas === "racineDouble") {
    const signe = signeDe(kD);
    return {
      famille: "limiteInfiniePoint",
      a,
      sousCas,
      kN,
      bN,
      kD,
      signeNumerateurA,
      signeDenominateurGauche: signe,
      signeDenominateurDroite: signe,
      signeLimiteGauche: (signeNumerateurA * signe) as 1 | -1,
      signeLimiteDroite: (signeNumerateurA * signe) as 1 | -1,
    };
  }

  // racineSimple — q≠a garanti (offset non nul).
  const offset = entierNonNul(4);
  const q = a + offset;
  const signeAQ = signeDe(a - q);
  // x→a⁻ : (x-a)<0 ; x→a⁺ : (x-a)>0 — (x-q) garde le signe de (a-q) près de a (q≠a).
  const signeDenominateurGauche = (-1 * signeDe(kD) * signeAQ) as 1 | -1;
  const signeDenominateurDroite = (1 * signeDe(kD) * signeAQ) as 1 | -1;

  return {
    famille: "limiteInfiniePoint",
    a,
    sousCas,
    kN,
    bN,
    kD,
    q,
    signeNumerateurA,
    signeDenominateurGauche,
    signeDenominateurDroite,
    signeLimiteGauche: (signeNumerateurA * signeDenominateurGauche) as 1 | -1,
    signeLimiteDroite: (signeNumerateurA * signeDenominateurDroite) as 1 | -1,
  };
}
