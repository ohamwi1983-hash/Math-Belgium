import type { ConditionRegion, ExerciceRegions, PointEntier } from "../core6e/regionsPlanComplexe.types";
import { evaluerValeurComplexe } from "./expressionComplexe";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { idOptionCorrecte, natureDe, oppose, ouverture, partieInutile, partieUtile, valeurFrontiere } from "./modeleRegionsPlanComplexe";
import { controleFormeReduite, MESSAGE_SAISIE_ILLISIBLE } from "./saisieComplexe";
import type { PhaseRegions } from "./typesRegionsPlanComplexe";

/**
 * Couche B (6e) — vérification de `6gen98` « Régions du plan complexe ». N'importe rien de
 * `generateurs6e/`. Valeurs saisies (`string[]`) :
 * - `nature` : une nature de frontière par condition (choix fermé) ;
 * - `elements` : les champs de chaque condition, dans l'ordre (`champsCondition`) — cercle : centre
 *   (complexe, forme réduite a + bi) et rayon ; demi-plan : k (frontière x = k ou y = k) ;
 *   médiatrice : a puis b (complexes) ; secteur : sommet (complexe) et angle entre les deux
 *   demi-droites (radians, valeur exacte) ;
 * - `bord` : « inclus » ou « exclu » par condition (choix fermé) ;
 * - `region` : l'identifiant de la figure choisie.
 * Une saisie illisible, non réduite, approchée (valeur exacte attendue) ou en degrés ne consomme
 * JAMAIS de tentative.
 */

const MESSAGE_ILLISIBLE_REEL = "Saisie non reconnue — écris par exemple 3, −2, 3π/4 ou 5π/4 (virgule décimale acceptée). Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ANGLE_DEGRES = "Donne l'angle en radians (avec π), pas en degrés. Cette saisie ne compte pas comme une tentative.";
const MESSAGE_ANGLE_APPROCHE = "Donne la valeur exacte de l'angle (avec π), pas une valeur arrondie. Cette saisie ne compte pas comme une tentative.";

const EPS = 1e-9;

export type TypeChamp = "complexe" | "reel" | "angle";

/** Types des champs de l'écran « éléments » pour une condition. */
export function typesChampsCondition(c: ConditionRegion): TypeChamp[] {
  switch (c.type) {
    case "cercle":
      return ["complexe", "reel"];
    case "demiPlan":
      return ["reel"];
    case "mediatrice":
      return ["complexe", "complexe"];
    case "secteur":
      return ["complexe", "angle"];
  }
}

/** Indice du premier champ de chaque condition dans `valeurs`. */
export function decoupage(e: ExerciceRegions): { condition: ConditionRegion; debut: number; types: TypeChamp[] }[] {
  let debut = 0;
  return e.conditions.map((condition) => {
    const types = typesChampsCondition(condition);
    const morceau = { condition, debut, types };
    debut += types.length;
    return morceau;
  });
}

export function nombreChampsElements(e: ExerciceRegions): number {
  return e.conditions.reduce((s, c) => s + typesChampsCondition(c).length, 0);
}

/** Message d'une saisie qui NE consomme PAS de tentative ; `null` si elle peut être vérifiée. */
export function messageSaisieNonDecomptee(e: ExerciceRegions, phase: PhaseRegions, valeurs: string[]): string | null {
  if (phase !== "elements") return null;
  for (const { condition, debut, types } of decoupage(e)) {
    for (let j = 0; j < types.length; j++) {
      const texte = valeurs[debut + j] ?? "";
      if (types[j] === "complexe") {
        if (evaluerValeurComplexe(texte) === null) return MESSAGE_SAISIE_ILLISIBLE;
        const forme = controleFormeReduite(texte);
        if (forme) return forme;
        continue;
      }
      const v = evaluerValeurExponentielle(texte);
      if (v === null || !Number.isFinite(v)) return MESSAGE_ILLISIBLE_REEL;
      if (types[j] === "angle" && condition.type === "secteur") {
        const cible = (ouverture(condition) * Math.PI) / 4;
        if (Math.abs(v - cible) < EPS) continue;
        if (Math.abs(v - (cible * 180) / Math.PI) < 1e-6) return MESSAGE_ANGLE_DEGRES;
        if (Math.abs(v - cible) < 0.02) return MESSAGE_ANGLE_APPROCHE;
      }
    }
  }
  return null;
}

function egalComplexe(texte: string, p: PointEntier): boolean {
  const v = evaluerValeurComplexe(texte);
  return v !== null && Math.abs(v.re - p.x) < EPS && Math.abs(v.im - p.y) < EPS;
}

function egalReel(texte: string, x: number): boolean {
  const v = evaluerValeurExponentielle(texte);
  return v !== null && Math.abs(v - x) < EPS;
}

/** Diagnostic d'un point lu dans la condition (centre, A, B, sommet). */
function diagnosticPoint(nom: string, texte: string, p: PointEntier): string | null {
  if (egalComplexe(texte, p)) return null;
  if (egalComplexe(texte, oppose(p))) return `${nom}:signe`;
  if (egalComplexe(texte, { x: p.x, y: -p.y }) || egalComplexe(texte, { x: -p.x, y: p.y })) return `${nom}:partiel`;
  return `${nom}:autre`;
}

function diagnosticCondition(c: ConditionRegion, v: string[]): string | null {
  switch (c.type) {
    case "cercle": {
      const d = diagnosticPoint("centre", v[0], c.centre);
      if (d) return d;
      if (egalReel(v[1], c.rayon)) return null;
      if (egalReel(v[1], c.rayon * c.rayon)) return "rayon:carre";
      return "rayon:autre";
    }
    case "demiPlan": {
      const k = valeurFrontiere(c);
      if (egalReel(v[0], k)) return null;
      if (partieUtile(c) !== 0 && egalReel(v[0], c.m - partieUtile(c))) return "k:signe";
      if (partieUtile(c) !== 0 && egalReel(v[0], c.m)) return "k:oubli";
      if (partieInutile(c) !== 0 && (egalReel(v[0], c.m + partieInutile(c)) || egalReel(v[0], c.m - partieInutile(c)))) return "k:partie";
      return "k:autre";
    }
    case "mediatrice": {
      if (egalComplexe(v[0], c.b) && egalComplexe(v[1], c.a)) return "ab:echange";
      return diagnosticPoint("A", v[0], c.a) ?? diagnosticPoint("B", v[1], c.b);
    }
    case "secteur": {
      const d = diagnosticPoint("sommet", v[0], c.sommet);
      if (d) return d;
      const ouv = ouverture(c);
      if (egalReel(v[1], (ouv * Math.PI) / 4)) return null;
      if (egalReel(v[1], ((8 - ouv) * Math.PI) / 4)) return "ouverture:complement";
      if (egalReel(v[1], ((c.t1 + c.t2) * Math.PI) / 4)) return "ouverture:somme";
      return "ouverture:autre";
    }
  }
}

export function verifierEcran(e: ExerciceRegions, phase: PhaseRegions, valeurs: string[]): boolean {
  return diagnosticEcran(e, phase, valeurs) === null;
}

/**
 * Diagnostic d'une saisie lisible : `null` si elle est juste, sinon un identifiant de message
 * (traduit par `ui6e/formatRegionsPlanComplexe.ts::messageDiagnostic`), préfixé par le numéro de
 * la condition fautive (« 1|centre:signe », « 2|k:oubli »…) pour les écrans de saisie.
 */
export function diagnosticEcran(e: ExerciceRegions, phase: PhaseRegions, valeurs: string[]): string | null {
  switch (phase) {
    case "nature":
      return e.conditions.every((c, i) => valeurs[i] === natureDe(c)) ? null : "faux";
    case "bord":
      return e.conditions.every((c, i) => valeurs[i] === (c.large ? "inclus" : "exclu")) ? null : "faux";
    case "region":
      return valeurs[0] === idOptionCorrecte(e) ? null : "faux";
    case "elements": {
      for (const [i, { condition, debut, types }] of decoupage(e).entries()) {
        const d = diagnosticCondition(condition, valeurs.slice(debut, debut + types.length).map((x) => x ?? ""));
        if (d) return `${i + 1}|${d}`;
      }
      return null;
    }
  }
}
