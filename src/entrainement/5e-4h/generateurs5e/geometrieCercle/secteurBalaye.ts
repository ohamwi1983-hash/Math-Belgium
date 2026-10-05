/**
 * Couche A (5e) — scénario A1 de 5gen12 ("Secteur balayé", type "essuie-glace"). Réutilise
 * `calculerValeursExactes` (`generateurs5e/arcsSecteurs/index.ts`, 5gen6, import
 * générateur→générateur déjà établi) pour dériver θ_rad ET l'aire (`.A`) de chaque secteur — appelé
 * deux fois (une fois par rayon), même angle θ pour les deux, garantissant `thetaRad` identique.
 */
import type { ExerciceSecteurBalaye } from "../../core5e/geometrieCercle.types";
import { calculerValeursExactes } from "../arcsSecteurs";

const THETA_DEG_MIN = 10;
const THETA_DEG_MAX = 350;
const R_MIN = 3;
const R_MAX = 15;
/** Écart minimal entre r1/r2 — évite un secteur balayé quasi nul (r1≈r2), peu lisible. */
const ECART_R_MIN = 2;

function multipleDe5(min: number, max: number): number {
  const nbMultiples = Math.floor((max - min) / 5) + 1;
  return min + 5 * Math.floor(Math.random() * nbMultiples);
}

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function genererExerciceSecteurBalaye(): ExerciceSecteurBalaye {
  const thetaDeg = multipleDe5(THETA_DEG_MIN, THETA_DEG_MAX);
  const r2 = entierAleatoire(R_MIN, R_MAX - ECART_R_MIN);
  const r1 = entierAleatoire(r2 + ECART_R_MIN, R_MAX);

  const valeurs1 = calculerValeursExactes(r1, thetaDeg);
  const valeurs2 = calculerValeursExactes(r2, thetaDeg);

  return {
    scenario: "secteurBalaye",
    thetaDeg,
    thetaRad: valeurs1.thetaRad,
    r1,
    r2,
    aireGrandSecteur: valeurs1.A,
    airePetitSecteur: valeurs2.A,
    aireBalayee: valeurs1.A - valeurs2.A,
  };
}
