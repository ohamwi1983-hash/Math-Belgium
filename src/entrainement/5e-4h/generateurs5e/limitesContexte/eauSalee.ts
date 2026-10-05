/**
 * Couche A (5e) — famille "Eau salée" (5gen23). V(t)=v0+rt, Q(t)=c·r·t, C(t)=Q(t)/V(t)→c à l'infini.
 * N'importe jamais rien de `moteur5e/`.
 */
import type { ExerciceEauSalee, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_EAU_SALEE } from "./contextesEauSalee";
import { entierAleatoire, melanger, tirerElement } from "./utils";

function optionsInterpretation(c: number): OptionInterpretation[] {
  return melanger([
    {
      texte: `Car pour t grand, le volume ajouté rt devient très supérieur au volume initial : la concentration tend vers celle de la solution ajoutée en continu, soit ${c} g/L.`,
      correcte: true,
    },
    { texte: `Car le volume initial finit toujours par s'évaporer complètement.`, correcte: false },
    { texte: `Car la quantité de soluté Q(t) devient constante avec le temps.`, correcte: false },
    { texte: `Car le débit devient négligeable devant le volume total à long terme.`, correcte: false },
  ]);
}

export function genererExerciceEauSalee(): ExerciceEauSalee {
  const v0 = entierAleatoire(50, 500);
  const r = entierAleatoire(1, 20);
  const c = entierAleatoire(1, 30);
  const contexte = tirerElement(CONTEXTES_EAU_SALEE);
  return { famille: "eauSalee", v0, r, c, optionsInterpretation: optionsInterpretation(c), contexte };
}
