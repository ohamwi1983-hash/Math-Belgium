import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleG } from "../core6e/calculPrimitives.types";
import type { ExerciceQuellePrimitive } from "../core6e/quellePrimitive.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { PhaseQuellePrimitive } from "./typesQuellePrimitive";
import {
  diagnostiquerAEcran1,
  diagnostiquerAEcran2,
  diagnostiquerAEcranDirect,
  diagnostiquerBEcran1,
  diagnostiquerBEcran2,
  diagnostiquerBEcran3,
  diagnostiquerCEcran1,
  diagnostiquerCEcran2,
  diagnostiquerCEcran3,
  diagnostiquerCEcran4,
  diagnostiquerGEcran1,
  diagnostiquerGEcran2,
  diagnostiquerGEcran3,
  diagnostiquerGEcran4,
  messageSpecifiqueEcran,
} from "./verificationCalculPrimitives";
import type { PhaseCalculPrimitives } from "./typesCalculPrimitives";

/**
 * Couche B (6e) — vérification pour `6gen24`. N'importe JAMAIS `src/generateurs6e/` (règle non
 * négociable, CLAUDE.md — voir `session.integration.test.ts` pour le seul fichier autorisé à
 * importer Couche A ET Couche B ensemble). Ne modifie JAMAIS `verificationCalculPrimitives.ts` :
 * les fonctions `diagnostiquerXxxEcranYyy` de 6gen23 pour A/B/C/G sont IMPORTÉES et appelées telles
 * quelles pour les écrans EMPRUNTÉS (`diagnostiquerEcranBase` ci-dessous, dispatcher restreint aux
 * seules 12 phases A/B/C/G empruntées — jamais D/E/F) — jamais réimplémentées.
 *
 * ============================================================================
 * **L'ÉCRAN NOUVEAU — `diagnostiquerEcranFinal`**
 * ============================================================================
 * Contrairement aux écrans empruntés (primitive à une constante ADDITIVE près, `diagnostiquerPrimitive`
 * de 6gen23), l'écran final n'a PLUS de liberté sur la constante : une fois C connu, la réponse F(x)
 * est UNIQUE. Deux champs vérifiés INDÉPENDAMMENT (même patron que `diagnostiquerGEcran3` de
 * 6gen23, combinés via `pireStatut`) :
 * - `valeurs[0]` = C — comparé par VALEUR (`diagnostiquerValeur`, tolérance absolue) à
 *   `b - exerciceBase.primitiveReference(a)`. Ce C peut être IRRATIONNEL (ex. famille C/G, ln/arctan
 *   en jeu) — accepté sans difficulté par construction (spec), la comparaison restant numérique.
 * - `valeurs[1]` = F(x) final — comparé par ÉQUIVALENCE STRICTE POINT À POINT (`diagnostiquerEquivalenceFonction`,
 *   PAS `diagnostiquerPrimitive` : il n'y a plus de constante libre à ce stade) à la référence
 *   `(x) => exerciceBase.primitiveReference(x) + cAttendu` — le C CORRECT est substitué dans la
 *   référence utilisée pour comparer, jamais recalculé depuis la saisie de `valeurs[0]` (un F(x)
 *   juste construit avec un mauvais C resterait `not_equivalent`, jamais accepté par erreur).
 *
 * **Points d'échantillonnage** — technique GÉNÉRIQUE indépendante de la famille (même principe que
 * `generateurs6e/quellePrimitive/point.ts` pour le point (a,b)) : un balayage fin filtré sur la
 * FINITUDE et la MAGNITUDE de `primitiveReference` (jamais les helpers privés non exportés de
 * `verificationCalculPrimitives.ts`, ex. `pointsBEcran3`/`pointsXPourC`/`pointsXPourG` — ce fichier
 * ne modifie ni n'importe leurs internes). Le seuil de magnitude (1e6) écarte le même cas de
 * précision flottante déjà documenté côté 6gen23 (ex. B "typeU=puissance"+"typeG=expU", e^(x³)
 * astronomique à x=4/5) sans avoir besoin de connaître la famille en jeu.
 */

const TOLERANCE = 0.01;

function pointsSursPourPrimitive(reference: (x: number) => number): number[] {
  const surs: number[] = [];
  for (let i = -80; i <= 80 && surs.length < 16; i++) {
    const x = i / 10; // pas 0,1, plage [-8,8]
    const v = reference(x);
    if (Number.isFinite(v) && Math.abs(v) < 1e6) surs.push(x);
  }
  return surs;
}

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

/** Tolérance RELATIVE pour les grands nombres (audit P17) : 0,01 en absolu, ou 1/10 000 de la valeur
 * si elle est plus grande (une valeur arrondie au centième d'un nombre comme 2 981,4 reste juste). */
function toleranceRelative(v: number): number {
  return Math.max(TOLERANCE, 1e-4 * Math.abs(v));
}

/** La saisie contient-elle encore la lettre C (constante non remplacée) ? */
function contientConstanteLitterale(texte: string): boolean {
  return /(^|[^a-z])c($|[^a-z])/i.test(texte);
}

/** Écran final (nouveau) — voir en-tête de fichier. `valeurs=[C, F(x)]`. F(x) n'est comparé que sur
 * l'intervalle de validité qui contient a (audit décision C : sur une autre branche, la constante
 * peut être différente — ln|x−2| avec a = 0 ne dit rien de F pour x > 2). */
export function diagnostiquerEcranFinal(exercice: ExerciceQuellePrimitive, valeurs: string[]): StatutVerification {
  const { exerciceBase, a, b } = exercice;
  const cAttendu = b - exerciceBase.primitiveReference(a);

  const statutC = diagnostiquerValeur(valeurs[0], cAttendu, toleranceRelative(cAttendu));
  if (contientConstanteLitterale(valeurs[1] ?? "")) return statutC === "parse_error" ? "parse_error" : "not_equivalent";

  const gauche = exercice.intervalleGauche ?? -Infinity;
  const droite = exercice.intervalleDroite ?? Infinity;
  const points = pointsSursPourPrimitive(exerciceBase.primitiveReference).filter((x) => x > gauche + 0.005 && x < droite - 0.005);
  const reference = (x: number) => exerciceBase.primitiveReference(x) + cAttendu;
  let statutF: StatutVerification = "correct";
  let comparables = 0;
  for (const x of points) {
    const attendu = reference(x);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(valeurs[1], { x });
    } catch {
      statutF = "parse_error";
      break;
    }
    if (!Number.isFinite(soumis) || Math.abs(soumis - attendu) > toleranceRelative(attendu)) {
      statutF = "not_equivalent";
      break;
    }
    comparables++;
  }
  if (statutF === "correct" && comparables < Math.min(3, points.length)) statutF = "parse_error";

  return pireStatut(statutC, statutF);
}

/** Message spécifique de l'écran final (la constante C laissée telle quelle dans F(x)), sinon celui
 * des écrans empruntés (valeur absolue oubliée). */
export function messageSpecifiqueQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive, valeurs: string[]): string | null {
  if (phase === "final") {
    return contientConstanteLitterale(valeurs[1] ?? "") ? "Dans F(x), remplace la lettre C par la valeur que tu as trouvée." : null;
  }
  return messageSpecifiqueEcran(exercice.exerciceBase, phase, valeurs);
}

/** Dispatcher restreint aux 12 phases A/B/C/G réellement empruntées à 6gen23 — appelle les
 * fonctions `diagnostiquerXxxEcranYyy` IMPORTÉES telles quelles (jamais réimplémentées). */
function diagnostiquerEcranBase(exerciceBase: ExerciceQuellePrimitive["exerciceBase"], phase: PhaseCalculPrimitives, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcranDirect":
      return diagnostiquerAEcranDirect(exerciceBase as ExerciceFamilleA, valeurs);
    case "aEcran1":
      return diagnostiquerAEcran1(exerciceBase as ExerciceFamilleA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exerciceBase as ExerciceFamilleA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exerciceBase as ExerciceFamilleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exerciceBase as ExerciceFamilleB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exerciceBase as ExerciceFamilleB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exerciceBase as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exerciceBase as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exerciceBase as ExerciceFamilleC, valeurs);
    case "cEcran4":
      return diagnostiquerCEcran4(exerciceBase as ExerciceFamilleC, valeurs);
    case "gEcran1":
      return diagnostiquerGEcran1(exerciceBase as ExerciceFamilleG, valeurs);
    case "gEcran2":
      return diagnostiquerGEcran2(exerciceBase as ExerciceFamilleG, valeurs);
    case "gEcran3":
      return diagnostiquerGEcran3(exerciceBase as ExerciceFamilleG, valeurs);
    case "gEcran4":
      return diagnostiquerGEcran4(exerciceBase as ExerciceFamilleG, valeurs);
    default:
      // D/E/F : jamais atteint en pratique (exerciceBase est toujours A/B/C/G pour ce générateur),
      // mais `phase` reste typé `PhaseCalculPrimitives` (24 valeurs) car RÉUTILISÉ de 6gen23 —
      // garde défensive plutôt qu'un `never` qui obligerait à retyper `PhaseCalculPrimitives`.
      return "parse_error";
  }
}

/** Dispatcher générique — UNE SEULE fonction de vérification par écran, quelle que soit la phase
 * (même principe que `diagnostiquerEcran` de 6gen23). Route vers l'écran final nouveau ou vers les
 * écrans empruntés à 6gen23. */
export function diagnostiquerEcranQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive, valeurs: string[]): StatutVerification {
  if (phase === "final") return diagnostiquerEcranFinal(exercice, valeurs);
  return diagnostiquerEcranBase(exercice.exerciceBase, phase, valeurs);
}

export function verifierEcranQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive, valeurs: string[]): boolean {
  return diagnostiquerEcranQuellePrimitive(exercice, phase, valeurs) === "correct";
}
