import type { CoteTriangle, SommetTriangle, Triangle } from "../core/triangle.types";
import type { ConfigurationResolution, ElementTriangle, LoiResolution, PositionObtus } from "../core/resoudreTriangle.types";

/**
 * Cœur de calcul PUR de « Résoudre complètement un triangle » (gen73) — aucune dépendance à
 * l'interface ni au hasard, pour être réutilisé tel quel (gen81, « détective d'erreurs », s'en
 * servira pour fabriquer des résolutions fautives) :
 * - `configurationDesDonnees` : reconnaît AAS / SAS / SSS / SSA à partir des 3 éléments donnés ;
 * - `resoudreDepuisDonnees` : triangle complet (3 côtés, 3 angles) à partir des 3 valeurs données,
 *   quelle que soit la lettre de chaque donnée (pas de rôle fixe) ;
 * - `planResolution` : la méthode ENSEIGNÉE, étape par étape (inconnue, loi, couple de la loi des
 *   sinus) — le plus grand angle par Al-Kashi avant toute loi des sinus (arcsin ne renvoie jamais
 *   un angle obtus) ;
 * - `valeurEnRadians`, `angleAiguDeLArcsin` : les résultats des deux erreurs classiques (calculatrice
 *   en radians, angle obtus cherché par la loi des sinus), pour le diagnostic et le tirage.
 * Toujours en DEGRÉS (convention du chapitre).
 */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export const COTES: CoteTriangle[] = ["a", "b", "c"];
export const SOMMETS: SommetTriangle[] = ["A", "B", "C"];

export function estCoteElement(e: ElementTriangle): e is CoteTriangle {
  return e === "a" || e === "b" || e === "c";
}

/** Côté opposé à un angle (A → a) ou angle opposé à un côté (a → A). */
export function coteOppose(s: SommetTriangle): CoteTriangle {
  return s.toLowerCase() as CoteTriangle;
}

export function angleOppose(c: CoteTriangle): SommetTriangle {
  return c.toUpperCase() as SommetTriangle;
}

/** Angle compris entre deux côtés : celui dont le côté opposé n'est aucun des deux. */
export function angleCompris(p: CoteTriangle, q: CoteTriangle): SommetTriangle {
  return angleOppose(COTES.find((c) => c !== p && c !== q)!);
}

/** Configuration à partir des 3 éléments donnés (2 ou 3 angles comptent comme AAS ; 3 angles ne
 * déterminent pas un triangle et ne sont jamais tirés). */
export function configurationDesDonnees(donnees: ElementTriangle[]): ConfigurationResolution {
  const cotes = donnees.filter(estCoteElement);
  const angles = donnees.filter((e): e is SommetTriangle => !estCoteElement(e));
  if (angles.length >= 2) return "AAS";
  if (cotes.length === 3) return "SSS";
  return angles[0] === angleCompris(cotes[0]!, cotes[1]!) ? "SAS" : "SSA";
}

function arccosDeg(x: number): number {
  return Math.acos(Math.max(-1, Math.min(1, x))) * R2D;
}

/** Al-Kashi résolue en cosinus : angle opposé au côté `oppose`, les deux autres côtés étant `p`, `q`. */
export function angleAlKashi(oppose: number, p: number, q: number): number {
  return arccosDeg((p * p + q * q - oppose * oppose) / (2 * p * q));
}

/** Al-Kashi pour un côté : côté opposé à l'angle `angle` compris entre les côtés `p` et `q`. */
export function coteAlKashi(p: number, q: number, angle: number): number {
  return Math.sqrt(p * p + q * q - 2 * p * q * Math.cos(angle * D2R));
}

type Valeurs = Partial<Record<ElementTriangle, number>>;

/**
 * Triangle complet à partir des 3 données (valeurs exactes). SSA : la solution dont l'angle calculé
 * par arcsin est AIGU (la seule quand l'angle donné est opposé au plus grand des deux côtés — c'est
 * la seule situation tirée par gen73).
 */
export function resoudreDepuisDonnees(donnees: ElementTriangle[], valeurs: Valeurs): Triangle {
  const t: Valeurs = {};
  for (const e of donnees) t[e] = valeurs[e]!;
  const config = configurationDesDonnees(donnees);
  if (config === "AAS") {
    const angles = donnees.filter((e): e is SommetTriangle => !estCoteElement(e));
    const manquant = SOMMETS.find((s) => !angles.includes(s));
    if (manquant) t[manquant] = 180 - t[angles[0]!]! - t[angles[1]!]!;
    const cote = donnees.find(estCoteElement)!;
    const rapport = t[cote]! / Math.sin(t[angleOppose(cote)]! * D2R);
    for (const c of COTES) if (t[c] === undefined) t[c] = rapport * Math.sin(t[angleOppose(c)]! * D2R);
  } else if (config === "SAS") {
    const [p, q] = donnees.filter(estCoteElement) as CoteTriangle[];
    const X = angleCompris(p!, q!);
    t[coteOppose(X)] = coteAlKashi(t[p!]!, t[q!]!, t[X]!);
  }
  if (config === "SSA") {
    const X = donnees.find((e): e is SommetTriangle => !estCoteElement(e))!;
    const x = coteOppose(X);
    const y = (donnees.filter(estCoteElement) as CoteTriangle[]).find((c) => c !== x)!;
    const Y = angleOppose(y);
    t[Y] = Math.asin(Math.min(1, (t[y]! * Math.sin(t[X]! * D2R)) / t[x]!)) * R2D;
    const Z = SOMMETS.find((s) => s !== X && s !== Y)!;
    t[Z] = 180 - t[X]! - t[Y]!;
    t[coteOppose(Z)] = (t[x]! * Math.sin(t[Z]! * D2R)) / Math.sin(t[X]! * D2R);
  }
  if (config === "SAS" || config === "SSS") {
    // Trois côtés connus : chaque angle manquant par Al-Kashi (arccos, jamais ambigu), le dernier
    // par la somme ; un angle donné garde sa valeur exacte.
    const manquants = SOMMETS.filter((s) => t[s] === undefined);
    for (const s of manquants.slice(0, -1)) {
      const [p, q] = COTES.filter((c) => c !== coteOppose(s));
      t[s] = angleAlKashi(t[coteOppose(s)]!, t[p!]!, t[q!]!);
    }
    const dernier = manquants[manquants.length - 1]!;
    t[dernier] = 180 - SOMMETS.filter((s) => s !== dernier).reduce((somme, s) => somme + t[s]!, 0);
  }
  return { a: t.a!, b: t.b!, c: t.c!, A: t.A!, B: t.B!, C: t.C! };
}

export interface EtapeResolution {
  inconnue: ElementTriangle;
  loi: LoiResolution;
  /** Loi des sinus : le couple complet (côté, angle opposé) utilisé comme rapport connu. */
  couple?: [CoteTriangle, SommetTriangle];
}

/** Plus grand angle (opposé au plus grand côté). */
export function plusGrandAngle(t: Triangle): SommetTriangle {
  return SOMMETS.reduce((m, s) => (t[s] > t[m] ? s : m), "A" as SommetTriangle);
}

/**
 * La méthode enseignée, dans l'ordre des champs de l'écran 3 :
 * - AAS : le 3e angle (somme des angles), puis chaque côté manquant par la loi des sinus, avec le
 *   couple formé du côté donné et de son angle opposé ;
 * - SAS : le 3e côté (Al-Kashi), puis le PLUS GRAND des deux angles restants par Al-Kashi (opposé
 *   au plus grand des deux côtés donnés — le seul qui puisse être obtus), puis le dernier par la
 *   somme des angles ;
 * - SSS : le PLUS GRAND angle par Al-Kashi, puis un deuxième angle par Al-Kashi (il est aigu : la
 *   loi des sinus serait aussi sans risque), puis le dernier par la somme ;
 * - SSA (un seul triangle) : l'angle opposé à l'autre côté donné par la loi des sinus (il est aigu,
 *   car opposé au plus petit des deux côtés), le 3e angle par la somme, puis le 3e côté par la loi
 *   des sinus.
 */
export function planResolution(configuration: ConfigurationResolution, donnees: ElementTriangle[], t: Triangle): EtapeResolution[] {
  const cotes = donnees.filter(estCoteElement) as CoteTriangle[];
  const angles = donnees.filter((e): e is SommetTriangle => !estCoteElement(e));
  switch (configuration) {
    case "AAS": {
      const X = SOMMETS.find((s) => !angles.includes(s))!;
      const s = cotes[0]!;
      const couple: [CoteTriangle, SommetTriangle] = [s, angleOppose(s)];
      return [{ inconnue: X, loi: "somme" }, ...COTES.filter((c) => c !== s).map((c) => ({ inconnue: c, loi: "sinus" as const, couple }))];
    }
    case "SAS": {
      const [p, q] = cotes as [CoteTriangle, CoteTriangle];
      const X = angleCompris(p, q);
      const grand = t[p] > t[q] ? angleOppose(p) : angleOppose(q);
      const petit = grand === angleOppose(p) ? angleOppose(q) : angleOppose(p);
      return [
        { inconnue: coteOppose(X), loi: "kashiCote" },
        { inconnue: grand, loi: "kashiAngle" },
        { inconnue: petit, loi: "somme" },
      ];
    }
    case "SSS": {
      const L = plusGrandAngle(t);
      const autres = SOMMETS.filter((s) => s !== L);
      return [
        { inconnue: L, loi: "kashiAngle" },
        { inconnue: autres[0]!, loi: "kashiAngle" },
        { inconnue: autres[1]!, loi: "somme" },
      ];
    }
    case "SSA": {
      const X = angles[0]!;
      const x = coteOppose(X);
      const y = cotes.find((c) => c !== x)!;
      const Y = angleOppose(y);
      const Z = SOMMETS.find((s) => s !== X && s !== Y)!;
      const couple: [CoteTriangle, SommetTriangle] = [x, X];
      return [
        { inconnue: Y, loi: "sinus", couple },
        { inconnue: Z, loi: "somme" },
        { inconnue: coteOppose(Z), loi: "sinus", couple },
      ];
    }
  }
}

/** Première loi à appliquer (écran 2) : celle de la première étape du plan. */
export function premiereLoi(configuration: ConfigurationResolution): LoiResolution {
  return ({ AAS: "somme", SAS: "kashiCote", SSS: "kashiAngle", SSA: "sinus" } as const)[configuration];
}

/** Angle obtenu par la somme des angles dans le plan : c'est lui que le contrôle recalcule par
 * Al-Kashi, avec les trois côtés. */
export function angleDuControle(plan: EtapeResolution[]): SommetTriangle {
  return plan.find((e) => e.loi === "somme")!.inconnue as SommetTriangle;
}

export function positionObtus(t: Triangle, donnees: ElementTriangle[]): PositionObtus {
  const obtus = SOMMETS.find((s) => t[s] > 90);
  if (!obtus) return "aucun";
  return donnees.includes(obtus) ? "donne" : "calcule";
}

/** Les deux autres éléments que la loi utilise (hors inconnue), pour les aides et le corrigé. */
export function autresCotes(angle: SommetTriangle): [CoteTriangle, CoteTriangle] {
  return COTES.filter((c) => c !== coteOppose(angle)) as [CoteTriangle, CoteTriangle];
}

/** Valeur EXACTE attendue d'une étape (toujours celle du triangle exact, jamais une saisie). */
export function valeurEtape(t: Triangle, etape: EtapeResolution): number {
  return t[etape.inconnue];
}

/**
 * Résultat obtenu avec la calculatrice en RADIANS en appliquant la loi de l'étape (valeurs exactes) :
 * angles en entrée lus comme des radians, arcsin/arccos rendus en radians. `null` pour la somme des
 * angles (aucune fonction trigonométrique) ou si le calcul fautif n'a pas de sens.
 */
export function valeurEnRadians(t: Triangle, etape: EtapeResolution): number | null {
  const e = etape.inconnue;
  let v: number;
  switch (etape.loi) {
    case "somme":
      return null;
    case "kashiAngle": {
      const [p, q] = autresCotes(e as SommetTriangle);
      const cos = (t[p] ** 2 + t[q] ** 2 - t[coteOppose(e as SommetTriangle)] ** 2) / (2 * t[p] * t[q]);
      v = Math.acos(cos);
      break;
    }
    case "kashiCote": {
      const [p, q] = COTES.filter((c) => c !== e) as [CoteTriangle, CoteTriangle];
      v = Math.sqrt(t[p] ** 2 + t[q] ** 2 - 2 * t[p] * t[q] * Math.cos(t[angleOppose(e as CoteTriangle)]));
      break;
    }
    case "sinus": {
      const [x, X] = etape.couple!;
      if (estCoteElement(e)) v = (t[x] * Math.sin(t[angleOppose(e)])) / Math.sin(t[X]);
      else v = Math.asin((t[coteOppose(e)] * Math.sin(t[X])) / t[x]);
      break;
    }
  }
  return Number.isFinite(v) ? v : null;
}

/** Ce que renvoie arcsin pour un angle OBTUS (son supplément, aigu) — `null` pour un angle aigu. */
export function angleAiguDeLArcsin(t: Triangle, e: ElementTriangle): number | null {
  if (estCoteElement(e) || t[e] <= 90) return null;
  return 180 - t[e];
}

/** Angle obtenu en appliquant Al-Kashi avec le MAUVAIS côté isolé (un côté adjacent au lieu du côté
 * opposé) — erreur « côté et angle non opposés ». Le premier des deux côtés adjacents. */
export function angleCoteNonOppose(t: Triangle, e: SommetTriangle): number {
  const [p, q] = autresCotes(e);
  return angleAlKashi(t[p], t[coteOppose(e)], t[q]);
}
