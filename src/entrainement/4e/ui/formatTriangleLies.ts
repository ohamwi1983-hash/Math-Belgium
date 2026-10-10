/**
 * Couche présentation — formatage texte/LaTeX pour "Triangles liés (triangulation, côté ou angle
 * partagé)".
 */
import type { ExerciceTriangleLies } from "../core/triangleLies.types";

function formatNombre(valeur: number): string {
  return Number(valeur.toFixed(2)).toString();
}

/** Bloc de données affiché en tête des écrans "pont"/"angles"/"cible" — un fragment par donnée. */
export function formatDonneesPontTexte(exercice: ExerciceTriangleLies): string[] {
  return exercice.donneesPont.map((d) => `${d.label} = ${formatNombre(d.valeur)} ${d.unite}`);
}

export function formatDonneesCibleEnonceTexte(exercice: ExerciceTriangleLies): string[] {
  return exercice.donneesCibleEnonce.map((d) => `${d.label} = ${formatNombre(d.valeur)} ${d.unite}`);
}

export function formatAnglesBrutsViseeTexte(exercice: ExerciceTriangleLies): string[] {
  return (exercice.anglesBrutsVisee ?? []).map((d) => `${d.label} = ${formatNombre(d.valeur)} ${d.unite}`);
}

/** État actuel — rappelle le côté transféré une fois l'écran "pont" confirmé (dérivé de la vérité
 * terrain de l'exercice, jamais de la saisie brute de l'élève, même convention que le reste de la
 * plateforme). `sommetPartage` a 3 valeurs à rappeler (angle + 2 côtés) plutôt qu'une seule — jamais
 * `labelCoteTransfere`, qui n'a pas de sens pour cette configuration (voir son en-tête de type). */
export function formatEtatActuelPontConfirme(exercice: ExerciceTriangleLies): string {
  if (exercice.variante === "sommetPartage") {
    return `Angle = ${formatNombre(exercice.trianglePont.A)}° — côté 1 = ${formatNombre(exercice.trianglePont.b)} — côté 2 = ${formatNombre(exercice.trianglePont.c)}`;
  }
  return `${exercice.labelCoteTransfere} = ${formatNombre(exercice.trianglePont.a)}`;
}

export function formatEtatActuelAnglesConfirmes(exercice: ExerciceTriangleLies): string {
  return `Angle utile = ${formatNombre(exercice.triangleCible.B)}° — Angle (hypothèse) = ${formatNombre(exercice.triangleCible.C)}°`;
}

/** État actuel — rappelle les 2 côtés du triangle cible une fois l'écran "soustraction" confirmé
 * (`sommetPartage` uniquement, dérivé de `triangleCible.b`/`.c`, jamais de la saisie de l'élève). */
export function formatEtatActuelSoustractionConfirme(exercice: ExerciceTriangleLies): string {
  return `côté 1 = ${formatNombre(exercice.triangleCible.b)} — côté 2 = ${formatNombre(exercice.triangleCible.c)}`;
}

/** État actuel — rappelle la grandeur du triangle cible une fois l'écran "cible" confirmé (dérivé de
 * la vérité terrain `valeurCibleAttendue`, jamais de la saisie brute de l'élève) — affiché sur
 * l'écran "interpretation" (terminal, sans quoi ce dernier écran resterait le seul du générateur
 * sans bloc "état actuel", en violation de la convention transversale). */
export function formatEtatActuelCibleConfirme(exercice: ExerciceTriangleLies): string {
  return `Réponse = ${formatNombre(exercice.valeurCibleAttendue)} ${exercice.uniteGrandeurCible}`;
}

/** Bloc de données — les 2 distances déjà parcourues (`sommetPartage` uniquement). */
export function formatDistancesParcouruesTexte(exercice: ExerciceTriangleLies): string[] {
  return (exercice.distancesParcourues ?? []).map((d) => `${d.label} = ${formatNombre(d.valeur)} ${d.unite}`);
}

// --- Écran "pont" ---

/** Tolérance réellement vérifiée = `max(0.05, |attendu|·0.01)` (`verificationTriangleLies.ts`,
 * relative ~1% — remplace l'ancienne constante absolue 0.5, voir l'audit de traçabilité de
 * précision) — annoncée en enveloppant la question narrative fournie par la Couche A, jamais en
 * l'écrasant. */
export function consignePont(exercice: ExerciceTriangleLies): string {
  return `${exercice.questionPont} (une valeur approchée est acceptée, à environ 1 % près).`;
}

export function texteAidePontNiveau1(exercice: ExerciceTriangleLies): string {
  return exercice.typeTrianglePont === "rectangle"
    ? "Le triangle pont est rectangle : utilise le théorème de Pythagore, ou la trigonométrie du triangle rectangle (SOH-CAH-TOA) si un angle est donné."
    : "Le triangle pont est quelconque : utilise la loi des cosinus (Al-Kashi) si tu connais 2 côtés et l'angle compris, ou la loi des sinus si tu connais 2 angles et un côté.";
}

export function texteAidePontNiveau2(exercice: ExerciceTriangleLies): string {
  if (exercice.variante === "sommetPartage") {
    return "Ici, 3 valeurs sont à trouver : l'angle au sommet commun ET les 2 côtés qui en partent — combine les données affichées ci-dessus (Pythagore si le triangle pont est rectangle, loi des sinus/des cosinus sinon).";
  }
  return exercice.typeTrianglePont === "rectangle"
    ? `${exercice.labelCoteTransfere} est l'hypoténuse du triangle rectangle — combine les données affichées ci-dessus (Pythagore si 2 côtés connus, sinus/cosinus/tangente si un côté et un angle).`
    : `${exercice.labelCoteTransfere} est le côté à calculer à partir des données affichées ci-dessus — identifie s'il s'agit d'un cas SAS (2 côtés + angle compris) ou AAS (2 angles + 1 côté).`;
}

// --- Écran "soustraction" (sommetPartage uniquement) ---

export function consigneSoustraction(): string {
  return "Calcule les 2 côtés du triangle cible en soustrayant la distance déjà parcourue au côté correspondant du triangle pont (une valeur approchée est acceptée, à environ 1 % près).";
}

export function texteAideSoustractionNiveau1(): string {
  return "Chaque côté du triangle cible s'obtient en retranchant la distance déjà parcourue au côté correspondant du triangle pont, issu du sommet commun.";
}

export function texteAideSoustractionNiveau2(exercice: ExerciceTriangleLies): string {
  const [d1, d2] = exercice.distancesParcourues ?? [];
  if (!d1 || !d2) return "";
  return `Côté 1 = ${formatNombre(exercice.trianglePont.b)} − ${formatNombre(d1.valeur)} ; Côté 2 = ${formatNombre(exercice.trianglePont.c)} − ${formatNombre(d2.valeur)}`;
}

// --- Écran "angles" (anglePartage uniquement) ---

export function consigneAngles(): string {
  return "Détermine les 2 angles qui ferment le triangle cible (une valeur approchée est acceptée, à environ 1 % près).";
}

export function texteAideAnglesNiveau1(): string {
  return "Les 2 visées ont été prises depuis le MÊME point d'observation, vers 2 cibles différentes : l'angle utile du triangle cible est leur DIFFÉRENCE, jamais l'une des 2 valeurs brutes prise seule.";
}

export function texteAideAnglesNiveau2(exercice: ExerciceTriangleLies): string {
  const [visee1, visee2] = exercice.anglesBrutsVisee ?? [];
  if (!visee1 || !visee2) return "";
  return `Les 2 visées brutes : ${visee1.label} = ${formatNombre(visee1.valeur)}° et ${visee2.label} = ${formatNombre(visee2.valeur)}° — la différence n'est pas encore calculée.`;
}

export function texteAideAnglesNiveau3(exercice: ExerciceTriangleLies): string {
  return `Hypothèse annexe (pour le 2e angle) : ${exercice.hypotheseAnnexe ?? ""}`;
}

// --- Écran "cible" ---

export function consigneCible(exercice: ExerciceTriangleLies): string {
  return `${exercice.questionCible} (une valeur approchée est acceptée, à environ 1 % près).`;
}

export function texteAideCibleNiveau1(exercice: ExerciceTriangleLies): string {
  if (exercice.grandeurDemandee === "aire") {
    return "L'aire d'un triangle se calcule avec la formule trigonométrique : Aire = ½ · (côté 1) · (côté 2) · sin(angle compris) — identifie d'abord les 2 côtés et l'angle qui sont réellement connus ou calculables.";
  }
  return "Reconnais la formule adaptée aux données disponibles : loi des sinus si tu as 2 angles + 1 côté, loi des cosinus (Al-Kashi) si tu as 2 côtés + l'angle compris.";
}

export function texteAideCibleNiveau2(exercice: ExerciceTriangleLies): string {
  if (exercice.variante === "sommetPartage") {
    return `Les 2 côtés déjà obtenus par soustraction valent ${formatNombre(exercice.triangleCible.b)} et ${formatNombre(exercice.triangleCible.c)}, et l'angle au sommet commun reste celui du triangle pont (${formatNombre(exercice.trianglePont.A)}°) — réutilise ces valeurs (jamais celles que tu avais toi-même proposées si elles étaient fausses) pour résoudre le triangle cible.`;
  }
  return `Le côté transféré depuis l'écran précédent vaut ${exercice.labelCoteTransfere} = ${formatNombre(exercice.trianglePont.a)} — réutilise cette valeur (jamais celle que tu avais toi-même proposée si elle était fausse) pour résoudre le triangle cible.`;
}

export function texteAideCibleNiveau3(): string {
  return "Une fois les 2 côtés adjacents à l'angle connu déterminés, substitue-les dans la formule d'aire avec l'angle compris entre eux.";
}

// --- Écran "interpretation" ---

export function consigneInterpretation(): string {
  return "Quelle est la bonne interprétation du résultat ?";
}

export function texteAideInterpretationNiveau1(): string {
  return "Relis attentivement l'unité et la grandeur réellement demandée par l'énoncé.";
}
