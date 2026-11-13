import type { CalculTriangle, ExerciceTexteTriangle } from "../core/texteTriangle.types";

/**
 * Modèle de gen77 (« Du texte au triangle ») : calculs purs, une seule source pour l'écran, les
 * aides, la vérification, le générateur et l'adaptateur de feuilles. Degrés partout ; aucune
 * valeur arrondie en cours de route.
 */

export function rad(degres: number): number {
  return (degres * Math.PI) / 180;
}

export function deg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Valeur de l'inconnue d'un calcul standard (loi des cosinus, des sinus, aire). */
export function valeurCalcul(c: CalculTriangle): number {
  switch (c.loi) {
    case "cosinus":
      return Math.sqrt(carreCosinus(c));
    case "sinus":
      return (c.coteConnu.valeur * Math.sin(rad(c.angleOpposeCherche.valeur))) / Math.sin(rad(c.angleOpposeConnu.valeur));
    case "aire":
      return 0.5 * c.cote1.valeur * c.cote2.valeur * Math.sin(rad(c.angle.valeur));
  }
}

/** Carré du côté cherché (loi des cosinus), avant la racine carrée. */
export function carreCosinus(c: Extract<CalculTriangle, { loi: "cosinus" }>): number {
  const { cote1: b, cote2: d, angle } = c;
  return b.valeur * b.valeur + d.valeur * d.valeur - 2 * b.valeur * d.valeur * Math.cos(rad(angle.valeur));
}

/**
 * Cas ambigu en contexte (« deux positions possibles ») : dans le triangle RPB, on connaît RP (côté
 * opposé à B), RB (côté opposé à P) et l'angle en P, non compris entre eux. Loi des sinus :
 * sin B = RP · sin P / RB ; deux angles candidats B₁ (aigu) et B₂ = 180° − B₁ ; pour chacun, l'angle
 * en R complète la somme à 180°, puis PB = RB · sin R / sin P. Petit calcul local (gen74, moteur pur
 * du cas ambigu, n'est pas sur la branche). Précondition (assurée par le générateur) :
 * RP · sin P < RB < RP, donc deux triangles.
 */
export function resoudreDeuxPositions(RP: number, RB: number, angleP: number) {
  const sinB = (RP * Math.sin(rad(angleP))) / RB;
  const b1 = deg(Math.asin(sinB));
  const b2 = 180 - b1;
  const r1 = 180 - angleP - b1;
  const r2 = 180 - angleP - b2;
  const pb = (r: number) => (RB * Math.sin(rad(r))) / Math.sin(rad(angleP));
  return { sinB, candidats: [b1, b2] as [number, number], anglesR: [r1, r2] as [number, number], distances: [pb(r1), pb(r2)] as [number, number] };
}

/** Arrondi à `decimales` décimales (−1 : à la dizaine). */
export function arrondir(valeur: number, decimales: number): number {
  const f = Math.pow(10, decimales);
  return Math.round(valeur * f) / f;
}

/** Troncature (erreur classique « on coupe au lieu d'arrondir »). */
export function tronquer(valeur: number, decimales: number): number {
  const f = Math.pow(10, decimales);
  return Math.trunc(valeur * f + 1e-9) / f;
}

// ---------------------------------------------------------------------------------------------
// Séquence des écrans
// ---------------------------------------------------------------------------------------------

export type TypeEcran = "identifier" | "convertir" | "loi" | "calculer" | "repondre" | "configuration" | "candidats" | "distances" | "trancher";

export const NOMBRE_ECRANS = 5;

export function sequenceEcrans(e: ExerciceTexteTriangle): TypeEcran[] {
  return e.variante === "deuxPositions" ? ["configuration", "loi", "candidats", "distances", "trancher"] : ["identifier", "convertir", "loi", "calculer", "repondre"];
}

/** Choix fermés : UNE tentative (convention du site) ; champs numériques : 3. */
export function estChoixFerme(type: TypeEcran): boolean {
  return type === "identifier" || type === "loi" || type === "repondre" || type === "configuration" || type === "trancher";
}
