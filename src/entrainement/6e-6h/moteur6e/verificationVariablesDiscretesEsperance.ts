import type { ExerciceEsperanceA, ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";
import { esperanceB, loiB } from "../generateurs6e/variablesDiscretesEsperance/familleB";
import { esperanceBruteC, esperanceNetteC } from "../generateurs6e/variablesDiscretesEsperance/familleC";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { rationnel, versNombre } from "./saisieCombinatoire";
import type { Rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { valeurExacteOuArrondie } from "./saisieVariablesAleatoires";
import { phasesPourExercice } from "./typesVariablesDiscretesEsperance";
import type { PhaseVariablesDiscretesEsperance } from "./typesVariablesDiscretesEsperance";

/**
 * Vérification de `6gen49` — EXACTE (audit, G5 : la tolérance absolue de 0,01 acceptait « 0 » pour
 * 1/330 dans 22 % des lois hypergéométriques). Probabilités : fraction exacte, ou arrondi correct avec
 * au moins 3 décimales et 2 chiffres significatifs (`probabilite` du socle) ; espérances : exacte, ou
 * arrondie au centième.
 */

export function probabiliteEvenementA(e: ExerciceEsperanceA, indices: number[]): Rationnel {
  return rationnel(indices.reduce((s, i) => s + e.poids[i], 0), 20);
}


export function attentesVariablesDiscretesEsperance(e: ExerciceVariablesDiscretesEsperance, p: PhaseVariablesDiscretesEsperance): Attente[] {
  if (e.famille === "A") {
    if (p === "aP1") return [{ nature: "probabilite", cible: probabiliteEvenementA(e, e.indices1) }];
    if (p === "aP2") return [{ nature: "probabilite", cible: probabiliteEvenementA(e, e.indices2) }];
    return [{ choix: e.contraires ? "oui" : "non" }];
  }
  if (e.famille === "B") {
    if (p === "bLoi") return loiB(e).map((l) => ({ nature: "probabilite", cible: l.p }));
    return [valeurExacteOuArrondie(esperanceB(e), 2)];
  }
  if (p === "cEsperanceNette") return [valeurExacteOuArrondie(versNombre(esperanceNetteC(e)), 2)];
  if (p === "cEsperanceBrute") return [valeurExacteOuArrondie(versNombre(esperanceBruteC(e)), 2)];
  if (p === "cMise") return [valeurExacteOuArrondie(versNombre(esperanceBruteC(e)), 2)];
  return [{ choix: e.statut }];
}

export const DEFINITION_6GEN49: DefinitionSession<ExerciceVariablesDiscretesEsperance, PhaseVariablesDiscretesEsperance> = {
  phases: phasesPourExercice,
  estChoix: (_e, p) => p === "aContraires" || p === "cConclusion" || p === "cJugerMise",
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesVariablesDiscretesEsperance(e, p), valeurs),
};
