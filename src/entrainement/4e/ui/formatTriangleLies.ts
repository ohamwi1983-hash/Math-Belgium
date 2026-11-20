/**
 * Couche présentation — formatage texte/LaTeX pour "Triangles liés (triangulation, côté ou angle
 * partagé)".
 */
import type { ExerciceTriangleLies } from "../core/triangleLies.types";
import { nombreFr } from "./nombreFr";

/** Nombre au centième, virgule décimale (« 23,47 »). */
export function formatNombre(valeur: number): string {
  return nombreFr(Math.round(valeur * 100) / 100);
}

/** Valeur suivie de son unité (« 23,47 m », « 40,1° »). */
export function formatValeurUnite(valeur: number, unite: string): string {
  return unite === "°" ? `${formatNombre(valeur)}°` : `${formatNombre(valeur)} ${unite}`;
}

/** Unité de longueur des côtés du triangle pont (« m », « km ») — la première donnée non angulaire
 * de l'énoncé, même règle que l'export (`formatUniteTransferee`). */
export function uniteLongueurPont(exercice: ExerciceTriangleLies): string {
  return exercice.donneesPont.find((d) => d.unite !== "°")?.unite ?? exercice.uniteGrandeurCible.replace("²", "");
}

/** `sommetPartage` : noms réels de l'angle et des côtés, tirés des données de la famille plutôt que
 * « côté 1 / côté 2 » — pont : `labelCoteTransfere` = « angle en O, OA, OB » ; cible : les 2 premiers
 * segments de `segmentsCible` (« OC », « OD »), dans le même ordre que `triangleCible.b`/`.c`. */
export interface LibellesSommetPartage {
  angle: string;
  cote1: string;
  cote2: string;
  coteCible1: string;
  coteCible2: string;
}

export function libellesSommetPartage(exercice: ExerciceTriangleLies): LibellesSommetPartage {
  const [angle = "angle au sommet commun", cote1 = "côté 1", cote2 = "côté 2"] = exercice.labelCoteTransfere.split(",").map((t) => t.trim());
  const [seg1, seg2] = exercice.segmentsCible;
  return {
    angle,
    cote1,
    cote2,
    coteCible1: seg1 ? `${seg1[0]}${seg1[1]}` : "côté 1",
    coteCible2: seg2 ? `${seg2[0]}${seg2[1]}` : "côté 2",
  };
}

/** Bloc de données affiché en tête des écrans "pont"/"angles"/"cible" — un fragment par donnée. */
export function formatDonneesPontTexte(exercice: ExerciceTriangleLies): string[] {
  return exercice.donneesPont.map((d) => `${d.label} = ${formatValeurUnite(d.valeur, d.unite)}`);
}

export function formatDonneesCibleEnonceTexte(exercice: ExerciceTriangleLies): string[] {
  return exercice.donneesCibleEnonce.map((d) => `${d.label} = ${formatValeurUnite(d.valeur, d.unite)}`);
}

export function formatAnglesBrutsViseeTexte(exercice: ExerciceTriangleLies): string[] {
  return (exercice.anglesBrutsVisee ?? []).map((d) => `${d.label} = ${formatValeurUnite(d.valeur, d.unite)}`);
}

/** Valeurs confirmées de chaque écran (vérité terrain, jamais la saisie de l'élève) — utilisées par le
 * récap « Ce qu'on sait déjà » (`recapitulatifTriangleLies.ts`), la réponse attendue après échec et
 * la fiche de consultation. `sommetPartage` : 3 valeurs (angle + 2 côtés), nommées par
 * `libellesSommetPartage`. */
export function formatPontConfirme(exercice: ExerciceTriangleLies): string {
  const unite = uniteLongueurPont(exercice);
  if (exercice.variante === "sommetPartage") {
    const l = libellesSommetPartage(exercice);
    return (
      `${l.angle} ≈ ${formatValeurUnite(exercice.trianglePont.A, "°")} ; ` +
      `${l.cote1} ≈ ${formatValeurUnite(exercice.trianglePont.b, unite)} ; ${l.cote2} ≈ ${formatValeurUnite(exercice.trianglePont.c, unite)}`
    );
  }
  return `${exercice.labelCoteTransfere} ≈ ${formatValeurUnite(exercice.trianglePont.a, unite)}`;
}

export function formatAnglesConfirmes(exercice: ExerciceTriangleLies): string {
  return `angle utile ≈ ${formatValeurUnite(exercice.triangleCible.B, "°")} ; angle (hypothèse) ≈ ${formatValeurUnite(exercice.triangleCible.C, "°")}`;
}

/** `sommetPartage` uniquement — les 2 côtés du triangle cible (`triangleCible.b`/`.c`). */
export function formatSoustractionConfirmee(exercice: ExerciceTriangleLies): string {
  const l = libellesSommetPartage(exercice);
  const unite = uniteLongueurPont(exercice);
  return `${l.coteCible1} ≈ ${formatValeurUnite(exercice.triangleCible.b, unite)} ; ${l.coteCible2} ≈ ${formatValeurUnite(exercice.triangleCible.c, unite)}`;
}

export function formatCibleConfirmee(exercice: ExerciceTriangleLies): string {
  return formatValeurUnite(exercice.valeurCibleAttendue, exercice.uniteGrandeurCible);
}

/** Bloc de données — les 2 distances déjà parcourues (`sommetPartage` uniquement). */
export function formatDistancesParcouruesTexte(exercice: ExerciceTriangleLies): string[] {
  return (exercice.distancesParcourues ?? []).map((d) => `${d.label} = ${formatValeurUnite(d.valeur, d.unite)}`);
}

// --- Écran "pont" ---

/** Tolérance réellement vérifiée = `max(0.05, |attendu|·0.01)` (`verificationTriangleLies.ts`,
 * relative ~1% — remplace l'ancienne constante absolue 0.5, voir l'audit de traçabilité de
 * précision) — annoncée en enveloppant la question narrative fournie par la Couche A, jamais en
 * l'écrasant. */
export function consignePont(exercice: ExerciceTriangleLies): string {
  return `${exercice.questionPont} (une valeur approchée est acceptée, à environ 1 % près).`;
}

// --- Écran "soustraction" (sommetPartage uniquement) ---

export function consigneSoustraction(): string {
  return "Calcule les 2 côtés du triangle cible en soustrayant la distance déjà parcourue au côté correspondant du triangle pont (une valeur approchée est acceptée, à environ 1 % près).";
}

// --- Écran "angles" (anglePartage uniquement) ---

export function consigneAngles(): string {
  return "Détermine les 2 angles qui ferment le triangle cible (une valeur approchée est acceptée, à environ 1 % près).";
}

// --- Écran "cible" ---

export function consigneCible(exercice: ExerciceTriangleLies): string {
  return `${exercice.questionCible} (une valeur approchée est acceptée, à environ 1 % près).`;
}

// --- Écran "interpretation" ---

export function consigneInterpretation(): string {
  return "Quelle est la bonne interprétation du résultat ?";
}

