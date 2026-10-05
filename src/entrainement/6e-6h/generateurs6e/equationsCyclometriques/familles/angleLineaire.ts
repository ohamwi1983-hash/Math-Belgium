import type { Arcfonction } from "../../../core6e/cyclometrique.types";
import type { ExerciceAngleLineaire } from "../../../core6e/equationsCyclometriques.types";
import { BANQUES_ARC } from "../../cyclometrique/banqueAngles";
import { CE_REEL, domaineArcsinArccosLineaire, versGuide } from "../domaines";

const ARCFONCTIONS: Arcfonction[] = ["arcsin", "arccos", "arctan"];
const CANDIDATS_A = [-3, -2, -1, 1, 2, 3] as const;

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

function tirerEntier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Variante 1 — arcfonction(ax+b) = angle particulier (radian). `angle` toujours pris dans une
 * entrée à valeur ENTIÈRE de la banque (`T∈{-1,0,1}`) — "propreté" : garantit que la solution
 * algébrique `x = (T-b)/a` reste une fraction simple (jamais un décimal irrationnel imprésentable),
 * même principe que l'ancienne famille "argumentQuadratique" (v1). L'angle étant toujours pris dans
 * l'image PRINCIPALE de l'arcfonction (banque `BANQUES_ARC`), l'équation `ax+b=trig(angle)` est une
 * équivalence EXACTE de l'équation cyclométrique de départ ⟹ la solution vérifie TOUJOURS la CE par
 * construction mathématique (`ax+b=T∈[-1;1]` à la solution, exactement la définition de la CE) —
 * aucune solution parasite n'est possible pour cette variante, contrairement à la variante 4.
 */
export function construireAngleLineaire(): ExerciceAngleLineaire {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const entreesEntieres = BANQUES_ARC[arcfonction].filter((e) => Number.isInteger(e.valeur.numerique));
  const entree = tirerParmi(entreesEntieres);
  const T = entree.valeur.numerique;

  const a = tirerParmi(CANDIDATS_A);
  const b = tirerEntier(-4, 4);
  const x0 = (T - b) / a;

  const ce = arcfonction === "arctan" ? CE_REEL : versGuide(domaineArcsinArccosLineaire(a, b));

  return { variante: "angleLineaire", arcfonction, arg: { a, b }, angle: entree.angle, ce, candidats: [{ x: x0, accepteAttendu: true }] };
}
