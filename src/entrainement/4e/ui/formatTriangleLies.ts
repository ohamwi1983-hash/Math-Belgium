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
  const l = libellesSommetPartage(exercice);
  const unite = uniteLongueurPont(exercice);
  return (
    `${l.coteCible1} = ${l.cote1} − ${formatValeurUnite(d1.valeur, unite)} = ${formatValeurUnite(exercice.trianglePont.b, unite)} − ${formatValeurUnite(d1.valeur, unite)} ; ` +
    `${l.coteCible2} = ${l.cote2} − ${formatValeurUnite(d2.valeur, unite)} = ${formatValeurUnite(exercice.trianglePont.c, unite)} − ${formatValeurUnite(d2.valeur, unite)}`
  );
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
    const l = libellesSommetPartage(exercice);
    const unite = uniteLongueurPont(exercice);
    return `Les 2 côtés déjà obtenus par soustraction valent ${l.coteCible1} ≈ ${formatValeurUnite(exercice.triangleCible.b, unite)} et ${l.coteCible2} ≈ ${formatValeurUnite(exercice.triangleCible.c, unite)}, et l'angle au sommet commun reste celui du triangle pont (${formatValeurUnite(exercice.trianglePont.A, "°")}) — réutilise ces valeurs (jamais celles que tu avais toi-même proposées si elles étaient fausses) pour résoudre le triangle cible.`;
  }
  return `Le côté transféré depuis l'écran précédent vaut ${exercice.labelCoteTransfere} ≈ ${formatValeurUnite(exercice.trianglePont.a, uniteLongueurPont(exercice))} — réutilise cette valeur (jamais celle que tu avais toi-même proposée si elle était fausse) pour résoudre le triangle cible.`;
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
