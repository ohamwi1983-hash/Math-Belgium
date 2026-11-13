import type { ExerciceComposerForces, NomTriangle, UniteComposerForces } from "../core/composerForces.types";
import {
  deviation,
  ecranAngleExact,
  ecranIntensite,
  estCap,
  intensiteAvecTheta,
  intensiteRadians,
  triangleUtile,
  valeurAttendue,
} from "./modeleComposerForces";
import { diagnostiquerCalculNumeriqueTriangle } from "./verificationTriangle";

/**
 * Vérification de gen80. Écran 1 : choix fermé du triangle (une tentative). Écrans suivants : une
 * valeur numérique, comparée à la valeur EXACTE du modèle avec la tolérance du chapitre
 * (`diagnostiquerCalculNumeriqueTriangle` : max(0,05 ; 1 %)), sauf l'angle intérieur 180° − θ du
 * sens direct, entier, attendu exactement. Les erreurs typiques reçoivent un statut propre (message
 * ciblé à l'écran) : θ mis à la place de 180° − θ, calculatrice en radians, angle pris avec l'autre
 * vecteur, bonne valeur mais mauvaise unité. Une saisie illisible (`parse_error`) ne consomme
 * jamais de tentative (c'est l'appli qui ne l'envoie pas à la session).
 */

export type StatutComposerForces = "correct" | "faux" | "piege_theta" | "radians" | "autre_vecteur" | "oubli_angle" | "unite" | "parse_error";

/** Nombre saisi : virgule ou point, signe moins typographique, symbole « ° » et espaces tolérés.
 * `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/°$/, "").replace(/[−–—]/g, "-").replace(",", ".");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function proche(valeur: number, attendu: number): boolean {
  return diagnostiquerCalculNumeriqueTriangle(valeur, attendu) === "correct";
}

export function verifierTriangle(e: ExerciceComposerForces, choix: NomTriangle): boolean {
  return choix === triangleUtile(e);
}

/** Diagnostic d'un écran de saisie (index 1, 2 ou 3). `unite` : exigée seulement sur l'écran de
 * l'intensité. */
export function diagnostiquerSaisie(e: ExerciceComposerForces, ecran: number, texte: string, unite: UniteComposerForces | null): StatutComposerForces {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  const attendu = valeurAttendue(e, ecran);

  if (ecranAngleExact(e, ecran)) {
    if (Math.abs(v - attendu) <= 0.05) return "correct";
    if (Math.abs(v - e.angle) <= 0.05) return "piege_theta";
    return "faux";
  }

  if (proche(v, attendu)) {
    if (ecranIntensite(e, ecran) && unite !== e.unite) return "unite";
    return "correct";
  }

  if (ecranIntensite(e, ecran) && !estCap(e)) {
    if (proche(v, intensiteAvecTheta(e))) return "piege_theta";
    if (proche(v, intensiteRadians(e))) return "radians";
  }
  if (!estCap(e) && ecran === 3) {
    if (proche(v, e.angle - deviation(e))) return "autre_vecteur";
    // Déviation calculée avec l'intensité fausse (θ mis dans Al-Kashi à l'écran précédent).
    const faux = (Math.asin(Math.min(1, (e.petit * Math.sin((e.angle * Math.PI) / 180)) / intensiteAvecTheta(e))) * 180) / Math.PI;
    if (proche(v, faux)) return "piege_theta";
  }
  if (estCap(e) && ecran === 1 && proche(v, e.angle)) return "autre_vecteur";
  if (estCap(e) && ecran === 2 && proche(v, 180 - e.angle)) return "oubli_angle";
  return "faux";
}

/** Valeur exacte attendue arrondie comme à l'écran (angles au dixième, intensités au centième) —
 * sert aux tests et au corrigé. */
export function valeurArrondie(e: ExerciceComposerForces, ecran: number): number {
  const v = valeurAttendue(e, ecran);
  return ecranIntensite(e, ecran) ? Math.round(v * 100) / 100 : Math.round(v * 10) / 10;
}
