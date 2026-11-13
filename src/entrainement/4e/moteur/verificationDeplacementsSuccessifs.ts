import type { Composantes } from "../core/vecteur.types";
import type { ExerciceDeplacementsSuccessifs } from "../core/deplacementsSuccessifs.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import {
  carreNorme,
  distance,
  distanceParcourue,
  oppose,
  pasArrondi,
  total,
  vecteurCible,
  vecteurDistance,
  vecteurRetour,
  vecteursDeplacements,
} from "./modeleDeplacementsSuccessifs";

/**
 * Vérification de gen86. Chaque écran est jugé sur les valeurs CORRECTES du modèle (jamais sur une
 * réponse précédente de l'élève : une erreur ne se propage pas). Les erreurs typiques reçoivent un
 * statut propre, pour un message ciblé : signe oublié (ouest / sud positifs), x et y échangés,
 * somme des longueurs au lieu de la distance à vol d'oiseau, racine oubliée, valeur approchée quand
 * la valeur exacte est demandée, vecteur de retour ou dernier déplacement de mauvais signe.
 * `parse_error` : saisie illisible, aucune tentative consommée.
 */

/** Saisie d'un vecteur : deux champs libres (x en haut, y en bas). */
export interface SaisieVecteur {
  x: string;
  y: string;
}

export const SAISIE_VECTEUR_VIDE: SaisieVecteur = { x: "", y: "" };

export function saisieVecteurComplete(s: SaisieVecteur): boolean {
  return s.x.trim() !== "" && s.y.trim() !== "";
}

/** Nombre saisi (entier ou décimal, virgule ou point, signe moins typographique). `null` si illisible. */
export function lireNombre(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function lireVecteur(s: SaisieVecteur): Composantes | null {
  const x = lireNombre(s.x);
  const y = lireNombre(s.y);
  return x === null || y === null ? null : { x, y };
}

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

function memeVecteur(a: Composantes, b: Composantes): boolean {
  return egal(a.x, b.x) && egal(a.y, b.y);
}

// ---------------------------------------------------------------------------------------------
// Écran « traduire » : un statut par déplacement
// ---------------------------------------------------------------------------------------------

export type StatutComposantes = "correct" | "signe" | "echange" | "faux" | "parse_error";

export function diagnostiquerComposantes(saisie: SaisieVecteur, attendu: Composantes): StatutComposantes {
  const lu = lireVecteur(saisie);
  if (!lu) return "parse_error";
  if (memeVecteur(lu, attendu)) return "correct";
  // Valeurs absolues justes, mais un signe faux (ouest / sud écrits positifs, ou l'inverse).
  if (egal(Math.abs(lu.x), Math.abs(attendu.x)) && egal(Math.abs(lu.y), Math.abs(attendu.y))) return "signe";
  if (memeVecteur(lu, { x: attendu.y, y: attendu.x })) return "echange";
  return "faux";
}

export function diagnostiquerTraduction(e: ExerciceDeplacementsSuccessifs, saisies: SaisieVecteur[]): StatutComposantes[] {
  return vecteursDeplacements(e).map((v, i) => diagnostiquerComposantes(saisies[i] ?? SAISIE_VECTEUR_VIDE, v));
}

// ---------------------------------------------------------------------------------------------
// Écrans à un vecteur : total, retour, cible (PC ou RT)
// ---------------------------------------------------------------------------------------------

export type StatutVecteur = "correct" | "oppose" | "sans_signes" | "cible_directe" | "une_composante" | "faux" | "parse_error";

export function vecteurAttendu(e: ExerciceDeplacementsSuccessifs, ecran: "total" | "retour" | "cible"): Composantes {
  if (ecran === "total") return total(e);
  if (ecran === "retour") return vecteurRetour(e);
  return vecteurCible(e);
}

export function diagnostiquerVecteur(e: ExerciceDeplacementsSuccessifs, ecran: "total" | "retour" | "cible", saisie: SaisieVecteur): StatutVecteur {
  const lu = lireVecteur(saisie);
  if (!lu) return "parse_error";
  const attendu = vecteurAttendu(e, ecran);
  if (memeVecteur(lu, attendu)) return "correct";
  if (ecran !== "total" && memeVecteur(lu, oppose(attendu))) return "oppose";
  if (ecran === "total") {
    const sansSignes = vecteursDeplacements(e).reduce((s, v) => ({ x: s.x + Math.abs(v.x), y: s.y + Math.abs(v.y) }), { x: 0, y: 0 });
    if (memeVecteur(lu, sansSignes)) return "sans_signes";
  }
  if (ecran === "cible" && e.cible && memeVecteur(lu, e.cible)) return "cible_directe";
  if (egal(lu.x, attendu.x) || egal(lu.y, attendu.y)) return "une_composante";
  return "faux";
}

// ---------------------------------------------------------------------------------------------
// Écran « k » (nombre de répétitions du grand pas)
// ---------------------------------------------------------------------------------------------

export type StatutK = "correct" | "faux" | "parse_error";

export function diagnostiquerK(e: ExerciceDeplacementsSuccessifs, texte: string): StatutK {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return egal(v, e.k ?? NaN) ? "correct" : "faux";
}

// ---------------------------------------------------------------------------------------------
// Écran « distance » (norme)
// ---------------------------------------------------------------------------------------------

export type StatutDistance = "correct" | "approchee" | "parcourue" | "racine_oubliee" | "arrondi_faux" | "faux" | "parse_error";

/** « √ » unicode → `sqrt(...)` (même translittération que gen26) ; « rac(…) » est déjà compris
 * par l'évaluateur. */
function remplacerRacineUnicode(texte: string): string {
  return texte
    .replace(/[−–—]/g, "-")
    .replace(/√\(/g, "sqrt(")
    .replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)");
}

/** Valeur d'une saisie de distance : entier, décimal, racine (« 3√5 », « rac(45) »), fraction. */
export function lireDistance(texte: string): number | null {
  if (texte.trim() === "") return null;
  try {
    const v = evaluerExpressionGenerale(remplacerRacineUnicode(texte.trim()), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** La saisie contient-elle une racine (forme exacte) ? */
function contientRacine(texte: string): boolean {
  return /√|rac|sqrt|racine/i.test(texte);
}

export function diagnostiquerDistance(e: ExerciceDeplacementsSuccessifs, texte: string): StatutDistance {
  const v = lireDistance(texte);
  if (v === null) return "parse_error";
  const d = distance(e);
  const p = pasArrondi(e.situation);
  const exacte = Math.abs(v - d) <= 1e-6 * Math.max(1, d);
  if (e.precision === "exacte") {
    if (exacte) return "correct";
    // Valeur décimale proche (arrondie) alors que la valeur exacte est demandée.
    if (!contientRacine(texte) && Math.abs(v - d) <= Math.max(p, 0.01 * d)) return "approchee";
  } else {
    if (exacte || Math.abs(v - d) <= p / 2 + 1e-9) return "correct";
    if (Math.abs(v - d) <= Math.max(2 * p, 0.02 * d)) return "arrondi_faux";
  }
  if (Math.abs(v - distanceParcourue(e)) <= Math.max(p / 2, 1e-6) + 1e-9) return "parcourue";
  if (Math.abs(v - carreNorme(vecteurDistance(e))) < 1e-6) return "racine_oubliee";
  return "faux";
}

