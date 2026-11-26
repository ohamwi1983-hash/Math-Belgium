import { parmi } from "../communReels/outilsReels";
import { tirerCalcul, tirerEnonce, tirerNegation } from "./core/banque";
import type { ExerciceQuantif, VarianteQuantif } from "./core/types";

/**
 * Couche A — générateur de `56gen17`. `Math.random()` seul (le `?code=` rejoue le tirage).
 * quantifies : verdict de chaque énoncé tiré à 50/50 AVANT l'énoncé, indépendamment ; trois prédicats
 * différents (deux énoncés, une négation). axiomes : un gabarit de calcul, nombres tirés.
 */

export type IdVarianteQuantif = VarianteQuantif;

export const CATALOGUE_VARIANTES: { id: IdVarianteQuantif; label: string }[] = [
  { id: "quantifies", label: "Vrai ou faux : énoncés quantifiés, négation" },
  { id: "axiomes", label: "Quel axiome justifie chaque étape ?" },
];

function construire(variante: VarianteQuantif): ExerciceQuantif {
  if (variante === "axiomes") {
    const c = tirerCalcul();
    return { variante, enonces: [], aNier: "", optionsNegation: [], predicat: "", predicatNie: "", gabarit: c.cle, hypotheses: c.hypotheses, depart: c.depart, etapes: c.etapes };
  }
  const pris = new Set<string>();
  const v1 = Math.random() < 0.5;
  const e1 = tirerEnonce(v1, pris);
  pris.add(e1.cle);
  const v2 = Math.random() < 0.5;
  const e2 = tirerEnonce(v2, pris);
  pris.add(e2.cle);
  const n = tirerNegation(pris);
  return { variante, enonces: [e1, e2], aNier: n.aNier, optionsNegation: n.options, predicat: n.p, predicatNie: n.np, gabarit: n.cle, hypotheses: "", depart: "", etapes: [] };
}

export function construireAvecVarianteId(id: IdVarianteQuantif): ExerciceQuantif {
  return construire(id);
}

export function genererExerciceQuantif(): ExerciceQuantif {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
