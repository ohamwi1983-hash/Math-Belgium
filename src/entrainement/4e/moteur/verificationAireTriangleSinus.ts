import type { ExerciceAireTriangleSinus } from "../core/aireTriangleSinus.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import {
  anglesAttendus,
  cosDeg,
  diagonaleCarree,
  aireABC,
  aireACD,
  sinDeg,
  valeurAttendue,
  type EtapeAireTriangle,
  type OptionFormule,
  type OptionNombre,
} from "./modeleAireTriangleSinus";

/**
 * Vérification de gen75. Champs numériques : valeur décimale (virgule ou point) OU valeur exacte
 * (« 6√3 », « 15√2/2 », « sqrt(3)/2 »…), unité et « ° » tolérés en fin de saisie. Tolérance de
 * gen19 (`verificationTriangle.ts`) : 1 % de la valeur attendue, au moins 0,05 (sinus : au moins
 * 0,002). Une saisie illisible rend `parse_error` (aucune tentative comptée). Chaque erreur
 * classique reconnue reçoit un code (`piege`) pour un message ciblé — sans jamais donner la valeur
 * attendue.
 */

export type StatutChamp = "correct" | "faux" | "parse_error";

export type PiegeNombre =
  | "sansDemi"
  | "cosinus"
  | "radians"
  | "sansSinus"
  | "sansDeux"
  | "produit"
  | "inverse"
  | "carre"
  | "sansCos"
  | "signe"
  | "aireACDseule"
  | "aireABCseule"
  | "perimetre"
  | "sansRacine";

export interface DiagnosticNombre {
  statut: StatutChamp;
  piege?: PiegeNombre;
}

/** Lecture d'une saisie numérique (décimale ou exacte). `null` si illisible. */
export function lireNombre(texte: string): number | null {
  let s = texte
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/[≈=]/g, "")
    .replace(/\s*(mm|cm|dm|km|m)\s*(²|2|\^2)?\s*$/i, "")
    .replace(/°/g, "")
    .replace(/×/g, "*")
    .replace(/:/g, "/")
    .trim();
  if (s === "") return null;
  s = s.replace(/√\s*\(/g, "sqrt(").replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)");
  if (/x/i.test(s.replace(/sqrt|racine|rac/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function tolerance(attendu: number, plancher: number): number {
  return Math.max(plancher, Math.abs(attendu) * 0.01);
}

export function egalTolerance(valeur: number, attendu: number, plancher = 0.05): boolean {
  return Math.abs(valeur - attendu) <= tolerance(attendu, plancher);
}

/** Erreurs classiques d'une étape : valeur fausse que donnerait chaque erreur, dans l'ordre de test. */
function erreursClassiques(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): [PiegeNombre, number][] {
  const sinRad = (a: number) => Math.sin(a);
  if ((etape === "calculAire" && e.famille === "aire") || (etape === "aireABC" && e.famille === "quadrilatere")) {
    const [c1, c2, a] = e.famille === "aire" ? [e.cote1, e.cote2, e.angle] : [e.AB, e.BC, e.angleB];
    return [
      ["sansDemi", c1 * c2 * sinDeg(a)],
      ["cosinus", 0.5 * c1 * c2 * cosDeg(a)],
      ["radians", 0.5 * c1 * c2 * sinRad(a)],
      ["sansSinus", 0.5 * c1 * c2],
    ];
  }
  if (etape === "calculCote" && e.famille === "cote") {
    const S = e.aire.valeur;
    return [
      ["sansDeux", S / (e.cote1 * sinDeg(e.angle))],
      ["radians", (2 * S) / (e.cote1 * sinRad(e.angle))],
      ["sansSinus", (2 * S) / e.cote1],
      ["produit", (2 * S * sinDeg(e.angle)) / e.cote1],
    ];
  }
  if (etape === "sinus" && e.famille === "angle") {
    const S = e.aire.valeur;
    return [
      ["sansDeux", S / (e.cote1 * e.cote2)],
      ["inverse", (e.cote1 * e.cote2) / (2 * S)],
    ];
  }
  if (etape === "diagonale" && e.famille === "quadrilatere") {
    const { AB, BC, angleB } = e;
    return [
      ["carre", diagonaleCarree(e)],
      ["sansCos", Math.sqrt(AB * AB + BC * BC)],
      ["signe", Math.sqrt(Math.max(0, AB * AB + BC * BC + 2 * AB * BC * cosDeg(angleB)))],
      ["radians", Math.sqrt(Math.max(0, AB * AB + BC * BC - 2 * AB * BC * Math.cos(angleB)))],
    ];
  }
  if (etape === "aireTotale" && e.famille === "quadrilatere") {
    return [
      ["aireACDseule", aireACD(e)],
      ["aireABCseule", aireABC(e)],
    ];
  }
  if (etape === "demiPerimetre" && e.famille === "heron") {
    return [["perimetre", e.a + e.b + e.c]];
  }
  if (etape === "aireHeron" && e.famille === "heron") {
    const p = (e.a + e.b + e.c) / 2;
    const P = 2 * p;
    return [
      ["sansRacine", p * (p - e.a) * (p - e.b) * (p - e.c)],
      ["perimetre", Math.sqrt(Math.max(0, P * (P - e.a) * (P - e.b) * (P - e.c)))],
    ];
  }
  return [];
}

export function diagnostiquerNombre(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle, texte: string): DiagnosticNombre {
  const v = lireNombre(texte);
  if (v === null) return { statut: "parse_error" };
  const attendu = valeurAttendue(e, etape)!;
  const plancher = etape === "sinus" ? 0.002 : 0.05;
  if (egalTolerance(v, attendu, plancher)) return { statut: "correct" };
  const piege = erreursClassiques(e, etape).find(([, faux]) => Number.isFinite(faux) && egalTolerance(v, faux, plancher));
  return piege ? { statut: "faux", piege: piege[0] } : { statut: "faux" };
}

// ---------------------------------------------------------------------------------------------
// Écran « angles » (famille `angle`) : une ou deux amplitudes
// ---------------------------------------------------------------------------------------------

export type PiegeAngles = "identiques" | "supplementaire" | "complementaire" | "radians" | "sansDeux";

export interface DiagnosticAngles {
  statuts: StatutChamp[];
  piege?: PiegeAngles;
}

export function diagnostiquerAngles(e: Extract<ExerciceAireTriangleSinus, { famille: "angle" }>, saisies: string[]): DiagnosticAngles {
  const lus = saisies.map(lireNombre);
  if (lus.some((v) => v === null)) return { statuts: lus.map((v) => (v === null ? "parse_error" : "faux")) };
  const valeurs = lus as number[];
  const attendus = anglesAttendus(e);
  const pris = new Set<number>();
  const statuts: StatutChamp[] = valeurs.map((v) => {
    const i = attendus.findIndex((a, j) => !pris.has(j) && egalTolerance(v, a));
    if (i === -1) return "faux";
    pris.add(i);
    return "correct";
  });
  if (statuts.every((s) => s === "correct")) return { statuts };
  const aigu = attendus[0]!;
  const sAngle = (2 * e.aire.valeur) / (e.cote1 * e.cote2);
  let piege: PiegeAngles | undefined;
  if (valeurs.length === 2 && egalTolerance(valeurs[0]!, valeurs[1]!)) piege = "identiques";
  else if (valeurs.some((v) => egalTolerance(v, Math.asin(Math.min(1, sAngle))))) piege = "radians";
  else if (valeurs.some((v) => egalTolerance(v, (Math.asin(sAngle / 2) * 180) / Math.PI))) piege = "sansDeux";
  else if (valeurs.some((v) => egalTolerance(v, 90 - aigu)) && attendus.length === 2) piege = "complementaire";
  else if (statuts.includes("correct") && attendus.length === 2) piege = "supplementaire";
  return { statuts, piege };
}

// ---------------------------------------------------------------------------------------------
// Écrans à choix fermé
// ---------------------------------------------------------------------------------------------

export function verifierFormule(choix: OptionFormule): boolean {
  return choix === "correcte";
}

export function nombreAnglesAttendu(e: Extract<ExerciceAireTriangleSinus, { famille: "angle" }>): OptionNombre {
  return anglesAttendus(e).length === 1 ? "un" : "deux";
}
