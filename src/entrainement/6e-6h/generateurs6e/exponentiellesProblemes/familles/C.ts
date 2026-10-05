import type { ExerciceExpoProbC } from "../../../core6e/exponentiellesProblemes.types";
import { CONTEXTES_C } from "../contextes";
import { arrondir, tirerEntier, tirerParmi } from "../aleatoire";

const R_CROISSANCE = [1.02, 1.05, 1.08, 1.1, 1.15] as const;
const R_DECROISSANCE = [0.85, 0.88, 0.9, 0.92, 0.95, 0.98] as const;

/** Arrondi d'AFFICHAGE seulement (jamais la référence de correction) — 1 décimale pour une petite
 * grandeur (ex. une tension en volts), entier pour une grandeur déjà de l'ordre de la dizaine ou
 * plus (population, activité...) : évite un "12,343 volts" tout comme un "1247 personnes" à une
 * décimale près sans intérêt pédagogique. */
function arrondiAffichage(v: number): number {
  return arrondir(v, Math.abs(v) < 100 ? 1 : 0);
}

/** Tire `compte` (1 à 3) temps DISTINCTS dans `[1, borneMax]`, triés croissant — "génération par
 * construction" : ces temps sont choisis APRÈS `Q0`/`r` (déjà fixés), jamais l'inverse. */
function tirerTempsDemandes(borneMax: number): number[] {
  const compte = tirerEntier(1, 3);
  const temps = new Set<number>();
  while (temps.size < compte) temps.add(tirerEntier(1, borneMax));
  return [...temps].sort((a, b) => a - b);
}

/** Famille C — "génération par construction" (CLAUDE.md/prompt 6gen12) : le sens (croissance/
 * décroissance) est tiré en premier, puis `r` DANS LE POOL CORRESPONDANT, puis un contexte
 * compatible — jamais un `r` tiré indépendamment du contexte narratif. `t1/delta/v1` sont ensuite
 * tirés directement (spec explicite), et TOUT le reste (`v2`, `Q0`, `valeursDemandees`) est DÉRIVÉ
 * de ces choix, jamais généré indépendamment puis ajusté. */
export function construireC(): ExerciceExpoProbC {
  const direction = tirerParmi(["croissance", "decroissance"] as const);
  const r = direction === "croissance" ? tirerParmi(R_CROISSANCE) : tirerParmi(R_DECROISSANCE);
  const contexte = tirerParmi(CONTEXTES_C.filter((c) => c.direction === direction));

  const t1 = tirerEntier(3, 8);
  const delta = tirerEntier(2, 5);
  const t2 = t1 + delta;
  const v1 = tirerEntier(contexte.v1Min, contexte.v1Max);

  const v2 = v1 * Math.pow(r, delta);
  const v2Affiche = arrondiAffichage(v2);
  const Q0 = v1 / Math.pow(r, t1);

  const tempsDemandes = tirerTempsDemandes(t2 + 8);
  const valeursDemandees = tempsDemandes.map((t) => Q0 * Math.pow(r, t));

  return { famille: "C", contexteId: contexte.id, t1, t2, v1, r, v2, v2Affiche, Q0, tempsDemandes, valeursDemandees };
}
