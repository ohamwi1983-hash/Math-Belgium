import type { Affine } from "../core/chantierTerrains.types";
import type { Attendu, Champ } from "../ui/formatChantierTerrains";
import { evaluerExpression } from "./expressionAlgebrique";

/**
 * Vérification de gen88. Champs libres (composantes, critère, coordonnées, équation) : lecture par
 * le parseur partagé (`evaluerExpression`, virgule décimale et fractions acceptées), comparaison en
 * plusieurs points — toute écriture équivalente est acceptée. Une saisie illisible renvoie
 * `parse_error` (aucune tentative comptée, c'est l'appli qui ne l'envoie pas à la session).
 * Choix fermés : simple comparaison d'indice (une tentative).
 */

export type StatutChamp = "correct" | "faux" | "signe" | "parse_error";

const TOLERANCE = 1e-6;
const ECHANTILLON = [0.37, 1.53, -0.82, 2.19, -1.41];

function normaliser(texte: string): string {
  return texte.replace(/[−–—]/g, "-").replace(/\s+/g, " ").trim();
}

/** Remplace la lettre de l'inconnue par « x » (seule variable du parseur) ; l'autre lettre est
 * refusée (illisible ici). `null` : aucune lettre admise. */
function versVariableX(texte: string, lettre: "x" | "y" | null): string | null {
  if (lettre === null) return /[xXyY]/.test(texte) ? null : texte;
  if (lettre === "x") return /[yY]/.test(texte) ? null : texte;
  if (/[xX]/.test(texte)) return null;
  return texte.replace(/[yY]/g, "x");
}

function evaluerEn(texte: string): number[] | null {
  try {
    const valeurs = ECHANTILLON.map((t) => evaluerExpression(texte, t));
    return valeurs.every((v) => Number.isFinite(v)) ? valeurs : null;
  } catch {
    return null;
  }
}

function valeurCible(a: Affine, t: number): number {
  return a.coef * t + a.cst;
}

function diagnostiquerValeur(saisie: string, attendu: Extract<Attendu, { type: "valeur" }>): StatutChamp {
  const brut = normaliser(saisie);
  if (brut === "" || brut.includes("=")) return "parse_error";
  const texte = versVariableX(brut, attendu.lettre);
  if (texte === null) return "parse_error";
  const valeurs = evaluerEn(texte);
  if (!valeurs) return "parse_error";
  if (valeurs.every((v, i) => Math.abs(v - valeurCible(attendu.cible, ECHANTILLON[i]!)) < TOLERANCE)) return "correct";
  if (attendu.signe && attendu.cible.cst !== 0 && valeurs.every((v, i) => Math.abs(v + valeurCible(attendu.cible, ECHANTILLON[i]!)) < TOLERANCE)) return "signe";
  return "faux";
}

function diagnostiquerEquation(saisie: string, attendu: Extract<Attendu, { type: "equation" }>): StatutChamp {
  const brut = normaliser(saisie);
  if (brut === "") return "parse_error";
  const cotes = brut.split("=");
  if (cotes.length > 2 || cotes.some((c) => c.trim() === "")) return "parse_error";
  const gauche = versVariableX(cotes[0]!, attendu.lettre);
  const droite = versVariableX(cotes[1] ?? "0", attendu.lettre);
  if (gauche === null || droite === null) return "parse_error";
  const vg = evaluerEn(gauche);
  const vd = evaluerEn(droite);
  if (!vg || !vd) return "parse_error";
  const difference = vg.map((v, i) => v - vd[i]!);
  // Multiple non nul de la cible : k·(coef·t + cst), k ≠ 0, en chaque point.
  const i0 = ECHANTILLON.findIndex((t) => Math.abs(valeurCible(attendu.cible, t)) > 1e-3);
  const k = difference[i0]! / valeurCible(attendu.cible, ECHANTILLON[i0]!);
  if (Math.abs(k) < 1e-9) return "faux";
  return difference.every((d, i) => Math.abs(d - k * valeurCible(attendu.cible, ECHANTILLON[i]!)) < 1e-6 * Math.max(1, Math.abs(k))) ? "correct" : "faux";
}

export function diagnostiquerChamp(saisie: string, champ: Champ): StatutChamp {
  return champ.attendu.type === "valeur" ? diagnostiquerValeur(saisie, champ.attendu) : diagnostiquerEquation(saisie, champ.attendu);
}

export function diagnostiquerChamps(saisies: string[], champs: Champ[]): StatutChamp[] {
  return champs.map((c, i) => diagnostiquerChamp(saisies[i] ?? "", c));
}
