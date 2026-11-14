import type { ExerciceContenanceObjets } from "../core6e/contenanceObjets.types";
import { contenanceUnite, evaluerPolynome, rayonProfil, uniteContenance, volumeCm3 } from "../core6e/contenanceObjetsCalcul";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseContenance } from "./typesContenanceObjets";

/**
 * Couche B (6e) — vérification de `6gen83`. Mêmes briques que 6gen27 (`diagnostiquerValeur`, évaluateur
 * `expressionExponentielle.ts` qui lit `pi`/`π`, √, fractions, virgule décimale) : une valeur exacte
 * (« 64pi », « 4sqrt(2) ») ou arrondie est acceptée. Un statut PAR CHAMP (seuls les champs faux sont
 * marqués). `piegeEcran` reconnaît les erreurs classiques (oubli de π ou du carré, diamètre pris
 * pour le rayon, cote totale prise pour borne, conversion) pour un message ciblé — jamais la réponse.
 */

const POSITIONS = [0.13, 0.31, 0.52, 0.71, 0.89];

function pointsInterieurs(e: ExerciceContenanceObjets): number[] {
  return POSITIONS.map((p) => e.a + p * (e.b - e.a));
}

/** Expression en x comparée à une référence, tolérance relative (coefficients jusqu'à ~1 000). */
function diagnostiquerExpression(texte: string, reference: (x: number) => number, points: number[]): StatutVerification {
  for (const x of points) {
    let v: number;
    try {
      v = evaluerExpressionExponentielle(texte, { x });
    } catch {
      return "parse_error";
    }
    const attendu = reference(x);
    if (!Number.isFinite(v) || Math.abs(v - attendu) > 1e-4 * Math.max(1, Math.abs(attendu))) return "not_equivalent";
  }
  return "correct";
}

function lire(texte: string): number | null {
  return evaluerValeurExponentielle(texte);
}

function proche(v: number | null, cible: number, tol: number): boolean {
  return v !== null && Math.abs(v - cible) <= tol;
}

export function toleranceVolume(v: number): number {
  return Math.max(0.6, 5e-4 * Math.abs(v));
}
export function toleranceContenance(e: ExerciceContenanceObjets): number {
  const c = contenanceUnite(e);
  return Math.max(uniteContenance(e) === "cL" ? 0.06 : 0.006, 5e-4 * c);
}
export const TOLERANCE_HAUTEUR = 0.06;

export function carreReference(e: ExerciceContenanceObjets): (x: number) => number {
  return (x) => evaluerPolynome(e.carre, x);
}

function choix(soumis: string, correct: string): StatutVerification {
  return soumis === correct ? "correct" : "not_equivalent";
}

export function choixComparaisonCorrect(e: ExerciceContenanceObjets): string {
  return e.premierPlusGrand ? "premier" : "second";
}

export function diagnostiquerChamps(e: ExerciceContenanceObjets, phase: PhaseContenance, valeurs: string[]): StatutVerification[] {
  switch (phase) {
    case "modele":
      return [choix(valeurs[0], "0")];
    case "poser": {
      const bornes = (va: string, vb: string) => [diagnostiquerValeur(va, e.a, 0.01), diagnostiquerValeur(vb, e.b, 0.01)];
      if (e.objet === "pot") return [diagnostiquerExpression(valeurs[0], (x) => rayonProfil(e.profil, x), pointsInterieurs(e)), ...bornes(valeurs[1], valeurs[2])];
      return [...bornes(valeurs[0], valeurs[1]), diagnostiquerExpression(valeurs[2], carreReference(e), pointsInterieurs(e))];
    }
    case "calculer": {
      const v = volumeCm3(e);
      return [diagnostiquerValeur(valeurs[0], v, toleranceVolume(v))];
    }
    case "convertir":
      return [diagnostiquerValeur(valeurs[0], contenanceUnite(e), toleranceContenance(e))];
    case "transfert":
      if (e.transfert === "comparer") return [choix(valeurs[0], choixComparaisonCorrect(e))];
      if (e.transfert === "hauteur") return [diagnostiquerValeur(valeurs[0], e.hauteurLiquide, TOLERANCE_HAUTEUR)];
      return [diagnostiquerValeur(valeurs[0], e.nombre, 1e-9)];
  }
}

export function verifierEcran(e: ExerciceContenanceObjets, phase: PhaseContenance, valeurs: string[]): boolean {
  return diagnostiquerChamps(e, phase, valeurs).every((s) => s === "correct");
}

/** π∫ₐᵇ f(x) dx (oubli du carré) — Simpson. */
function volumeSansCarre(e: ExerciceContenanceObjets): number {
  const n = 200;
  const h = (e.b - e.a) / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const w = i === 0 || i === n ? 1 : i % 2 === 1 ? 4 : 2;
    s += w * rayonProfil(e.profil, e.a + i * h);
  }
  return (Math.PI * s * h) / 3;
}

const PARASITE: Record<ExerciceContenanceObjets["objet"], string> = {
  verre: "le pied",
  vase: "l'épaisseur du fond",
  tonneau: "",
  flacon: "le bouchon",
  pot: "l'épaisseur du fond",
};

/** Message ciblé sur une erreur classique (saisie déjà jugée fausse), ou `null`. */
export function piegeEcran(e: ExerciceContenanceObjets, phase: PhaseContenance, valeurs: string[]): string | null {
  if (phase === "poser") {
    const decalage = e.objet === "pot" ? 1 : 0;
    const va = lire(valeurs[decalage]);
    const vb = lire(valeurs[decalage + 1]);
    if (e.objet === "pot") {
      const ref = (x: number) => rayonProfil(e.profil, x);
      if (diagnostiquerExpression(valeurs[0], (x) => 2 * ref(x), pointsInterieurs(e)) === "correct") return "Les cotes Ø sont des diamètres : le rayon en est la moitié.";
    } else if (diagnostiquerExpression(valeurs[2], (x) => rayonProfil(e.profil, x), pointsInterieurs(e)) === "correct") {
      return "On demande le carré du rayon, pas le rayon lui-même.";
    }
    if (e.a < 0 && proche(va, 0, 0.01) && proche(vb, e.b - e.a, 0.01)) return "x est mesuré depuis le milieu de l'objet : les bornes sont symétriques par rapport à 0.";
    if (e.horsCavite > 0 && proche(vb, e.a + e.hauteurTotale, 0.01)) return `La hauteur totale contient aussi ${PARASITE[e.objet]} : la borne supérieure correspond à la seule partie qui contient le liquide.`;
    return null;
  }
  if (phase === "calculer") {
    const v = lire(valeurs[0]);
    const V = volumeCm3(e);
    if (proche(v, V / Math.PI, toleranceVolume(V / Math.PI))) return "Il manque le facteur π devant l'intégrale.";
    const sansCarre = volumeSansCarre(e);
    if (proche(v, sansCarre, toleranceVolume(sansCarre))) return "Chaque tranche est un disque d'aire π·[f(x)]² : il faut intégrer le carré du rayon.";
    if (proche(v, 4 * V, toleranceVolume(4 * V))) return "f(x) est déjà un rayon : ne le double pas.";
    return null;
  }
  if (phase === "convertir") {
    const v = lire(valeurs[0]);
    const c = contenanceUnite(e);
    if ([10, 0.1, 100, 0.01, 1000, 0.001].some((k) => proche(v, c * k, toleranceContenance(e) * k))) return "Revois la conversion : 1 L = 1 dm³ = 1 000 cm³ et 1 L = 100 cL.";
    return null;
  }
  if (phase === "transfert" && e.transfert === "nombre") {
    const v = lire(valeurs[0]);
    if (v === null) return null;
    if (e.arrondi === "floor" && v === e.nombre + 1) return "Le dernier récipient ne serait pas rempli complètement : il ne compte pas.";
    if (e.arrondi === "ceil" && v === e.nombre - 1) return "Avec ce nombre de verres, le vase n'est pas encore plein : il en faut un de plus.";
    return null;
  }
  if (phase === "transfert" && e.transfert === "hauteur" && e.fraction) {
    const v = lire(valeurs[0]);
    if (proche(v, (e.b - e.a) * (e.fraction.num / e.fraction.den), TOLERANCE_HAUTEUR)) return "La hauteur n'est pas proportionnelle au volume : la coupe s'élargit vers le haut.";
  }
  return null;
}

