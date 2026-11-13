import type { ConfigurationResolution, ElementTriangle, ExerciceResoudreTriangle, PositionObtus } from "../../core/resoudreTriangle.types";
import type { CoteTriangle, SommetTriangle, Triangle } from "../../core/triangle.types";
import type { UniteLongueur } from "../../core/triangleQuelconque.types";
import {
  COTES,
  SOMMETS,
  angleAiguDeLArcsin,
  coteOppose,
  planResolution,
  positionObtus,
  resoudreDepuisDonnees,
  valeurEnRadians,
  angleDuControle,
  type EtapeResolution,
} from "../../moteur/resolutionTriangle";

/**
 * Générateur de « Résoudre complètement un triangle » (gen73). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Chaque configuration choisit d'abord ses DONNÉES (entiers : côtés de 3 à 16, angles en degrés),
 * puis en déduit le triangle exact (`moteur/resolutionTriangle.ts`) — jamais un triangle tiré puis
 * classé. Les lettres des données sont tirées au hasard (pas de rôle fixe).
 *
 * Garanties (vérifiées par tirages massifs) :
 * - environ 40 % des instances ont un angle OBTUS (entre 100° et 140°) — le piège central (arcsin
 *   ne renvoie que l'angle aigu) ; sinon tous les angles valent au plus 85° (jamais presque droit) ;
 * - quand il y a un angle obtus en SAS ou en SSA, il est une fois sur deux parmi les données, une
 *   fois sur deux parmi les inconnues ;
 * - tout angle vaut au moins 20° (figure lisible), tout côté calculé au moins 2 ;
 * - SAS : les deux côtés donnés diffèrent d'au moins 2 (le plus grand des angles restants est net) ;
 *   SSS : trois côtés distincts ; SSA : l'angle donné est opposé au PLUS GRAND des deux côtés
 *   donnés (un seul triangle — le cas ambigu est gen74) ;
 * - aucune erreur classique (calculatrice en radians, angle aigu de l'arcsin à la place de l'angle
 *   obtus) ne tombe par hasard dans la tolérance de vérification (marge ×1,5).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const UNITES: UniteLongueur[] = ["mm", "cm", "dm", "m", "km"];
export const PROBA_OBTUS = 0.4;
const ANGLE_MIN = 20;

function tirerPosition(obtusPossibleDonne: boolean, obtusPossibleCalcule: boolean): PositionObtus {
  if (Math.random() >= PROBA_OBTUS) return "aucun";
  if (obtusPossibleDonne && obtusPossibleCalcule) return Math.random() < 0.5 ? "donne" : "calcule";
  return obtusPossibleDonne ? "donne" : "calcule";
}

function tol(attendu: number): number {
  return 1.5 * Math.max(0.05, Math.abs(attendu) * 0.01);
}

/** Une erreur classique tomberait-elle dans la tolérance ? (étapes du plan + contrôle) */
function erreurToleree(t: Triangle, etapes: EtapeResolution[]): boolean {
  return etapes.some((etape) => {
    const attendu = t[etape.inconnue];
    const fautives = [valeurEnRadians(t, etape), angleAiguDeLArcsin(t, etape.inconnue)];
    return fautives.some((v) => v !== null && Math.abs(v - attendu) <= tol(attendu));
  });
}

function acceptable(t: Triangle, donnees: ElementTriangle[], configuration: ConfigurationResolution, position: PositionObtus): boolean {
  const angles = SOMMETS.map((s) => t[s]);
  if (angles.some((x) => !Number.isFinite(x) || x < ANGLE_MIN)) return false;
  const max = Math.max(...angles);
  if (position === "aucun" ? max > 85 : max < 100 || max > 140) return false;
  if (positionObtus(t, donnees) !== position) return false;
  if (COTES.some((c) => !Number.isFinite(t[c]) || t[c] < 2 || t[c] > 40)) return false;
  const plan = planResolution(configuration, donnees, t);
  return !erreurToleree(t, [...plan, { inconnue: angleDuControle(plan), loi: "kashiAngle" }]);
}

function exercice(configuration: ConfigurationResolution, donnees: ElementTriangle[], valeurs: Partial<Record<ElementTriangle, number>>, position: PositionObtus): ExerciceResoudreTriangle | null {
  const triangle = resoudreDepuisDonnees(donnees, valeurs);
  if (!acceptable(triangle, donnees, configuration, position)) return null;
  return { configuration, triangle, donnees, unite: choisir(UNITES) };
}

function anglesAAS(position: PositionObtus, sommetObtus: SommetTriangle): Record<SommetTriangle, number> | null {
  if (position === "aucun") {
    const A = entier(25, 85);
    const B = entier(25, 85);
    const C = 180 - A - B;
    return C < 25 || C > 85 ? null : { A, B, C };
  }
  const v = entier(100, 140);
  const reste = 180 - v;
  const p = entier(ANGLE_MIN, reste - ANGLE_MIN);
  const autres = SOMMETS.filter((s) => s !== sommetObtus);
  return { [sommetObtus]: v, [autres[0]!]: p, [autres[1]!]: reste - p } as Record<SommetTriangle, number>;
}

function essaiAAS(position: PositionObtus): ExerciceResoudreTriangle | null {
  const inconnu = choisir(SOMMETS);
  const donnesAngles = SOMMETS.filter((s) => s !== inconnu);
  const sommetObtus = position === "calcule" ? inconnu : choisir(donnesAngles);
  const angles = anglesAAS(position, sommetObtus);
  if (!angles) return null;
  const cote = choisir(COTES);
  const donnees: ElementTriangle[] = [...donnesAngles, cote];
  return exercice("AAS", donnees, { ...angles, [cote]: entier(4, 15) }, position);
}

function essaiSAS(position: PositionObtus): ExerciceResoudreTriangle | null {
  const X = choisir(SOMMETS);
  const [p, q] = COTES.filter((c) => c !== coteOppose(X)) as [CoteTriangle, CoteTriangle];
  const vp = entier(4, 15);
  const vq = entier(4, 15);
  if (Math.abs(vp - vq) < 2) return null;
  const angle = position === "donne" ? entier(100, 140) : entier(25, 85);
  return exercice("SAS", [p, q, X], { [p]: vp, [q]: vq, [X]: angle }, position);
}

function essaiSSS(position: PositionObtus): ExerciceResoudreTriangle | null {
  const [a, b, c] = [entier(4, 16), entier(4, 16), entier(4, 16)];
  if (a === b || b === c || a === c) return null;
  const [m1, m2, m3] = [a, b, c].sort((x, y) => y - x) as [number, number, number];
  if (m1 + 2 > m2 + m3) return null;
  return exercice("SSS", ["a", "b", "c"], { a, b, c }, position);
}

function essaiSSA(position: PositionObtus): ExerciceResoudreTriangle | null {
  const X = choisir(SOMMETS);
  const x = coteOppose(X);
  const y = choisir(COTES.filter((c) => c !== x));
  const vx = entier(5, 16);
  const vy = entier(3, vx - 1);
  const angle = position === "donne" ? entier(100, 140) : entier(25, 85);
  const donnees: ElementTriangle[] = ([x, y, X] as ElementTriangle[]).sort((u, v) => ordre(u) - ordre(v));
  return exercice("SSA", donnees, { [x]: vx, [y]: vy, [X]: angle }, position);
}

/** Ordre d'affichage des données : côtés a, b, c puis angles A, B, C. */
function ordre(e: ElementTriangle): number {
  return ["a", "b", "c", "A", "B", "C"].indexOf(e);
}

export function genererResoudreTriangle(configuration: ConfigurationResolution): ExerciceResoudreTriangle {
  // SSS : l'angle obtus éventuel est toujours calculé ; AAS : donné ou calculé.
  const position = tirerPosition(configuration !== "SSS", true);
  for (;;) {
    const e =
      configuration === "AAS" ? essaiAAS(position) : configuration === "SAS" ? essaiSAS(position) : configuration === "SSS" ? essaiSSS(position) : essaiSSA(position);
    if (e) return { ...e, donnees: [...e.donnees].sort((u, v) => ordre(u) - ordre(v)) };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: ConfigurationResolution; label: string }[] = [
  { id: "AAS", label: "2 angles et 1 côté" },
  { id: "SAS", label: "2 côtés et l'angle compris" },
  { id: "SSS", label: "3 côtés" },
  { id: "SSA", label: "2 côtés et un angle non compris (un seul triangle)" },
];

export function construireAvecVariante(id: string): ExerciceResoudreTriangle {
  const variante = CATALOGUE_VARIANTES.find((v) => v.id === id);
  return variante ? genererResoudreTriangle(variante.id) : genererExerciceResoudreTriangle();
}

/** Tirage libre : une des 4 configurations, au hasard. */
export function genererExerciceResoudreTriangle(): ExerciceResoudreTriangle {
  return genererResoudreTriangle(choisir(CATALOGUE_VARIANTES).id);
}

