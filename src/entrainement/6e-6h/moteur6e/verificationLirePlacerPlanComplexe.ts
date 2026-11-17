import type { ExerciceLirePlacer, PointEntier } from "../core6e/lirePlacerPlanComplexe.types";
import { diagnostiquerAngle, ecartAngulaire } from "./equivalenceExponentielle";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { TRANSFORMATION_DE, argumentC, cSurAxe, diagnostiquerPlacement, moduleC } from "./modeleLirePlacerPlanComplexe";
import { prevaliderSaisiesComplexes } from "./saisieComplexe";
import type { PhaseLirePlacer } from "./typesLirePlacerPlanComplexe";

/**
 * Couche B (6e) — vérification de `6gen95` « Lire et placer dans le plan complexe ». N'importe rien
 * de `generateurs6e/`. Valeurs saisies (`string[]`) :
 * - `lire` : [z] ou [z, w] — nombres complexes, forme réduite a + bi exigée (énoncé recopié refusé
 *   sans tentative, comme partout dans le chapitre) ;
 * - `placer1`/`placer2` : ["x;y"] — le nœud du quadrillage choisi ;
 * - `associer` : [transformation 1, transformation 2] — identifiants (choix fermé) ;
 * - `moduleArgument` : [|z_C|, arg z_C] — module EXACT (une valeur décimale approchée de k√2 est
 *   refusée SANS tentative), argument en radians à 2kπ près (une valeur en degrés ou approchée est
 *   refusée sans tentative).
 */

const MESSAGE_ILLISIBLE_REEL = "Saisie non reconnue — écris par exemple 3, 2√5, π/3 ou −3π/4 (virgule décimale acceptée). Cette saisie ne compte pas comme une tentative.";
const MESSAGE_MODULE_APPROCHE = "Donne la valeur exacte du module (avec √ si besoin), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ARGUMENT_DEGRES = "Donne l'argument en radians (avec π), pas en degrés. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ARGUMENT_APPROCHE = "Donne la valeur exacte de l'argument (avec π), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";

const EPS = 1e-9;

export function lirePoint(texte: string): PointEntier | null {
  const m = /^\s*(-?\d+)\s*;\s*(-?\d+)\s*$/.exec(texte);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
}

export function encoderPoint(p: PointEntier): string {
  return `${p.x};${p.y}`;
}

/** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être vérifiée. */
export function messageSaisieNonDecomptee(e: ExerciceLirePlacer, phase: PhaseLirePlacer, valeurs: string[]): string | null {
  if (phase === "lire") return prevaliderSaisiesComplexes(valeurs);
  if (phase !== "moduleArgument") return null;
  const module = evaluerValeurExponentielle(valeurs[0] ?? "");
  const argument = evaluerValeurExponentielle(valeurs[1] ?? "");
  if (module === null || argument === null || !Number.isFinite(module) || !Number.isFinite(argument)) return MESSAGE_ILLISIBLE_REEL;
  const r = moduleC(e.c);
  if (Math.abs(module - r) > EPS && Math.abs(module - r) < 0.05) return MESSAGE_MODULE_APPROCHE;
  const theta = argumentC(e.c);
  const diag = diagnostiquerAngle(valeurs[1], theta, 1e-7);
  if (diag.degres) return MESSAGE_ARGUMENT_DEGRES;
  const ecart = Math.abs(ecartAngulaire(argument, theta));
  if (ecart > 1e-7 && ecart < 0.05) return MESSAGE_ARGUMENT_APPROCHE;
  return null;
}

function egalComplexe(texte: string, p: PointEntier): boolean {
  const v = evaluerValeurComplexe(texte);
  return v !== null && Math.abs(v.re - p.x) < EPS && Math.abs(v.im - p.y) < EPS;
}

export function verifierEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer, valeurs: string[]): boolean {
  return diagnosticEcran(e, phase, valeurs) === null;
}

/**
 * Diagnostic d'une saisie lisible : `null` si elle est juste, sinon un identifiant de message
 * (traduit par `ui6e/formatLirePlacerPlanComplexe.ts::messageDiagnostic`).
 * - `lire` : « A:inversion », « B:conjugue », « A:signes », « A:autre »… (premier point faux) ;
 * - placement : identifiant du piège (`modeleLirePlacerPlanComplexe.ts::piegesPlacement`) ;
 * - `associer` : « faux » ;
 * - `moduleArgument` : « module:carre », « module:somme », « module:autre », « argument:signe »,
 *   « argument:oppose », « argument:symetrique », « argument:autre ».
 */
export function diagnosticEcran(e: ExerciceLirePlacer, phase: PhaseLirePlacer, valeurs: string[]): string | null {
  switch (phase) {
    case "lire": {
      const points: [string, PointEntier][] = [["A", e.z]];
      if (e.w) points.push(["B", e.w]);
      for (let i = 0; i < points.length; i++) {
        const [nom, p] = points[i];
        const texte = valeurs[i] ?? "";
        if (egalComplexe(texte, p)) continue;
        if (egalComplexe(texte, { x: p.y, y: p.x })) return `${nom}:inversion`;
        if (egalComplexe(texte, { x: p.x, y: -p.y })) return `${nom}:imaginaire`;
        if (egalComplexe(texte, { x: -p.x, y: p.y })) return `${nom}:reelle`;
        if (egalComplexe(texte, { x: -p.x, y: -p.y })) return `${nom}:signes`;
        return `${nom}:autre`;
      }
      return null;
    }
    case "placer1":
    case "placer2": {
      const place = lirePoint(valeurs[0] ?? "");
      if (!place) return "autre";
      const i = phase === "placer1" ? 0 : 1;
      return diagnostiquerPlacement(e.operations[i], e.z, e.w, place);
    }
    case "associer":
      return e.operations.every((op, i) => valeurs[i] === TRANSFORMATION_DE[op]) ? null : "faux";
    case "moduleArgument": {
      const module = evaluerValeurExponentielle(valeurs[0] ?? "");
      const argument = evaluerValeurExponentielle(valeurs[1] ?? "");
      if (module === null || argument === null) return "module:autre";
      const r = moduleC(e.c);
      if (Math.abs(module - r) > EPS) {
        const carre = e.c.x * e.c.x + e.c.y * e.c.y;
        if (Math.abs(module - carre) < EPS) return "module:carre";
        if (!cSurAxe(e.c) && Math.abs(module - (Math.abs(e.c.x) + Math.abs(e.c.y))) < EPS) return "module:somme";
        return "module:autre";
      }
      const theta = argumentC(e.c);
      if (Math.abs(ecartAngulaire(argument, theta)) <= 1e-7) return null;
      if (Math.abs(ecartAngulaire(argument, -theta)) <= 1e-7) return "argument:signe";
      if (Math.abs(ecartAngulaire(argument, theta + Math.PI)) <= 1e-7) return "argument:oppose";
      if (Math.abs(ecartAngulaire(argument, Math.PI - theta)) <= 1e-7) return "argument:symetrique";
      return "argument:autre";
    }
  }
}
