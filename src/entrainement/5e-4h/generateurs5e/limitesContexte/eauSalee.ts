/**
 * Couche A (5e) — famille "Eau salée" (5gen23). V(t)=v0+rt, Q(t)=c·r·t, C(t)=Q(t)/V(t)→c à l'infini.
 * N'importe jamais rien de `moteur5e/`.
 */
import type { ContexteEauSalee, ExerciceEauSalee, OptionInterpretation } from "../../core5e/limitesContexte.types";
import { CONTEXTES_EAU_SALEE } from "./contextesEauSalee";
import { entierAleatoire, melanger, tirerElement } from "./utils";

/** Une des deux formulations (courte ou longue), au hasard : la longueur d'une option ne trahit
 * jamais la bonne réponse (audit 5c4b, point 15 — la bonne était toujours la plus longue). */
function variante(courte: string, longue: string): string {
  return Math.random() < 0.5 ? courte : longue;
}

/** Les quatre justifications concluent à la MÊME valeur (c g/L) avec la même structure : seule la
 * raison invoquée diffère — la bonne ne se devine ni à sa longueur ni à la valeur citée. */
function optionsInterpretation(c: number, ctx: ContexteEauSalee): OptionInterpretation[] {
  return melanger([
    {
      texte: variante(
        `Pour t grand, le volume initial devient négligeable : le mélange prend les ${c} g/L de l'ajout.`,
        `Pour t grand, le volume initial devient négligeable : le mélange prend la concentration ${c} g/L de l'ajout continu.`,
      ),
      correcte: true,
    },
    {
      texte: variante(
        `Pour t grand, la quantité ${ctx.quantitePhrase} cesse d'augmenter : la concentration se stabilise à ${c} g/L.`,
        `Pour t grand, la quantité ${ctx.quantitePhrase} cesse d'augmenter dans le contenant : la concentration se stabilise alors à ${c} g/L.`,
      ),
      correcte: false,
    },
    {
      texte: variante(
        `Pour t grand, le volume initial finit par s'évaporer : il ne reste que la solution à ${c} g/L.`,
        `Pour t grand, le volume initial finit par s'évaporer entièrement : il ne reste plus que la solution ajoutée à ${c} g/L.`,
      ),
      correcte: false,
    },
    {
      texte: variante(
        `Pour t grand, le débit devient négligeable devant le volume : la concentration reste à ${c} g/L.`,
        `Pour t grand, le débit devient négligeable devant le volume total : la concentration reste alors fixée à ${c} g/L.`,
      ),
      correcte: false,
    },
  ]);
}

export function genererExerciceEauSalee(): ExerciceEauSalee {
  const v0 = entierAleatoire(50, 500);
  const r = entierAleatoire(1, 20);
  const c = entierAleatoire(1, 30);
  const contexte = tirerElement(CONTEXTES_EAU_SALEE);
  return { famille: "eauSalee", v0, r, c, optionsInterpretation: optionsInterpretation(c, contexte), contexte };
}
