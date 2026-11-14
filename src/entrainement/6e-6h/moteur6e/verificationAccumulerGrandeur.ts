import type { ExerciceAccumulerGrandeur, InstallationSolaire } from "../core6e/accumulerGrandeur.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerPrimitive } from "./verificationCalculPrimitives";
import type { PhaseAccumulerGrandeur } from "./typesAccumulerGrandeur";

/**
 * Couche B (6e) — vérification de `6gen80`. N'importe rien de `generateurs6e/`. Toutes les valeurs
 * attendues viennent de `modeleNumerique` (source UNIQUE : écran, récapitulatif, corrigé et barème
 * en dérivent). Réutilise les briques du chapitre : `diagnostiquerPrimitive` (6gen23, comparaison à
 * une constante près, « + C » accepté) et `diagnostiquerValeur` (saisie exacte : fractions, ln, e,
 * π, √, virgule décimale).
 *
 * Tolérances : 0,01 pour les valeurs exactes (entiers, décimaux finis, ou forme exacte saisie) ;
 * pour les valeurs « arrondies à l'unité » (W·h, kt, litres) une tolérance de 1 ; pour un instant
 * « au centième » 0,015 (le centième annoncé plus une marge d'arrondi) ; pour les conversions
 * exactes en m³/kW·h (jusqu'à trois décimales) 0,0005. La primitive est comparée avec une
 * tolérance relative (2‰ de sa taille) : une constante comme 3000·14/π saisie 13 369 reste juste.
 */

export interface ModeleNumerique {
  /** Taux net (celui que l'on intègre) — sert à la figure et aux points de la primitive. */
  taux: (t: number) => number;
  primitive: (t: number) => number;
  /** Points d'échantillonnage de la primitive, dans le domaine du modèle. */
  points: number[];
  quantite: number;
  transfert: number;
  unite: number;
  tolerances: { quantite: number; transfert: number; unite: number };
}

function polyInstallation(i: InstallationSolaire) {
  return {
    P: (t: number) => i.k * (t - i.debut) * (i.fin - t),
    F: (t: number) => i.k * (-(t ** 3) / 3 + ((i.debut + i.fin) * t * t) / 2 - i.debut * i.fin * t),
    E: (i.k * (i.fin - i.debut) ** 3) / 6,
  };
}

export function energieInstallation(i: InstallationSolaire): number {
  return polyInstallation(i).E;
}

export function modeleNumerique(e: ExerciceAccumulerGrandeur): ModeleNumerique {
  switch (e.variante) {
    case "cuve-max":
    case "cuve-vide": {
      const a = e.E - e.s0;
      const R = (t: number) => a * t - (e.c * t * t) / 2;
      const tMax = a / e.c;
      return {
        taux: (t) => a - e.c * t,
        primitive: R,
        points: [0, 5, 10, 20, 30, 45, 60],
        quantite: e.V0 + R(e.T),
        transfert: e.variante === "cuve-max" ? tMax : e.tVide,
        unite: e.variante === "cuve-max" ? (e.V0 + R(tMax)) / 1000 : e.tVide / 60,
        tolerances: { quantite: 0.01, transfert: 0.01, unite: e.variante === "cuve-max" ? 0.0005 : 0.01 },
      };
    }
    case "salle-pleine": {
      const R = (t: number) => e.a * t + (e.b * t * t) / 2;
      return {
        taux: (t) => e.a + e.b * t,
        primitive: R,
        points: [0, 5, 10, 20, 30, 45, 60],
        quantite: e.N0 + R(e.T),
        transfert: e.tPlein,
        unite: e.tPlein / 60,
        tolerances: { quantite: 0.01, transfert: 0.01, unite: 0.01 },
      };
    }
    case "solaire-seuil": {
      const w = Math.PI / e.D;
      const amplitude = (e.Pm * e.D) / Math.PI;
      const F = (t: number) => -amplitude * Math.cos(w * (t - e.lever));
      return {
        taux: (t) => (t < e.lever || t > e.lever + e.D ? 0 : e.Pm * Math.sin(w * (t - e.lever))),
        primitive: F,
        points: [0, 2, 4, 6, 8, 10, 12].map((x) => e.lever + (x * e.D) / 12),
        quantite: F(e.t2) - F(e.t1),
        transfert: e.lever + Math.acos(1 - e.Ebatterie / amplitude) / w,
        unite: (2 * amplitude) / 1000,
        tolerances: { quantite: 1, transfert: 0.015, unite: 0.01 },
      };
    }
    case "solaire-comparer": {
      const A = polyInstallation(e.A);
      const B = polyInstallation(e.B);
      return {
        taux: A.P,
        primitive: A.F,
        points: [e.A.debut, e.A.debut + 2, e.A.debut + 4, e.A.debut + 7, e.A.fin - 2, e.A.fin],
        quantite: A.E,
        transfert: A.E - B.E,
        unite: (A.E - B.E) / 1000,
        tolerances: { quantite: 0.01, transfert: 0.01, unite: 0.0005 },
      };
    }
    case "pluie-seuil": {
      const F = (t: number) => -(e.I0 / e.k) * Math.exp(-e.k * t);
      const H = F(e.D) - F(0);
      return {
        taux: (t) => e.I0 * Math.exp(-e.k * t),
        primitive: F,
        points: [0, 0.5, 1, 1.5, 2, 3, 4],
        quantite: H,
        transfert: -Math.log(1 - (e.k * e.Hcible) / e.I0) / e.k,
        unite: H * e.aireToit,
        tolerances: { quantite: 0.01, transfert: 0.015, unite: 1 },
      };
    }
    case "pluie-comparer": {
      const F = (t: number) => e.c * ((e.D * t * t) / 2 - t ** 3 / 3);
      const H1 = (e.c * e.D ** 3) / 6;
      return {
        taux: (t) => e.c * t * (e.D - t),
        primitive: F,
        points: [0, 0.5, 1, 1.5, 2, 3, 4],
        quantite: H1,
        transfert: H1 - e.m * e.D2,
        unite: H1 * e.aireToit,
        tolerances: { quantite: 0.01, transfert: 0.01, unite: 0.01 },
      };
    }
    case "co2-seuil": {
      const F = (t: number) => (e.r0 / e.k) * Math.exp(e.k * t);
      const Q = e.Q0 + F(e.T) - F(0);
      return {
        taux: (t) => e.r0 * Math.exp(e.k * t),
        primitive: F,
        points: [0, 1, 2, 4, 6, 10],
        quantite: Q,
        transfert: Math.log(1 + (e.k * (e.budget - e.Q0)) / e.r0) / e.k,
        unite: Q / 1000,
        tolerances: { quantite: 1, transfert: 0.015, unite: 0.01 },
      };
    }
  }
}

/** Identifiant de l'option correcte de l'écran « modèle » : toujours l'option canonique 0 (affichée
 * à la place `ordreOptions.indexOf(0)`). */
export const ID_MODELE_CORRECT = "0";

function diagnostiquerPrimitiveEcran(e: ExerciceAccumulerGrandeur, texte: string): StatutVerification {
  const m = modeleNumerique(e);
  const echelle = Math.max(1, ...m.points.map((t) => Math.abs(m.primitive(t))));
  return diagnostiquerPrimitive(texte, m.primitive, m.points, Math.max(0.01, 2e-3 * echelle), "t");
}

export function diagnostiquerEcran(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur, valeurs: string[]): StatutVerification {
  const texte = valeurs[0] ?? "";
  if (phase === "modele") return texte === ID_MODELE_CORRECT ? "correct" : "not_equivalent";
  if (phase === "primitive") return diagnostiquerPrimitiveEcran(e, texte);
  const m = modeleNumerique(e);
  // « 12 045 » (espace des milliers) se lit 12045, jamais 12 × 45.
  const sansMilliers = texte.replace(/(\d)[\s\u00a0\u202f]+(?=\d{3}(?!\d))/g, "$1");
  return diagnostiquerValeur(sansMilliers, m[phase], m.tolerances[phase]);
}

export function verifierEcran(e: ExerciceAccumulerGrandeur, phase: PhaseAccumulerGrandeur, valeurs: string[]): boolean {
  return diagnostiquerEcran(e, phase, valeurs) === "correct";
}
