import type { KeyboardEvent } from "react";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "./bloquerSaisieNonNumerique";

/**
 * Saisie numérique propre à "Inégalité de Bienaymé-Tchebychev" (gen37) — enveloppe le filtre
 * partagé (`bloquerSaisieNonNumerique.ts`, utilisé par des dizaines d'écrans, jamais modifié) :
 * un signe moins typographique (« − », « – », fréquent sur clavier mobile) devient un tiret
 * ordinaire au lieu d'être supprimé en silence (une borne négative devenait positive), et la
 * touche « % » n'est plus bloquée (le caractère est ensuite simplement retiré par le filtre).
 */
const MOINS_TYPOGRAPHIQUES = /[−–]/g;

export function filtrerSaisieBienaymeTchebychev(valeur: string): string {
  return filtrerSaisieNumerique(valeur.replace(MOINS_TYPOGRAPHIQUES, "-"));
}

export function gererKeyDownBienaymeTchebychev(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.key === "−" || e.key === "–" || e.key === "%") return;
  gererKeyDownNumerique(e);
}

/** Écran x̄ (V6/V8) : la moyenne est le centre de l'intervalle — l'élève peut aussi taper le calcul
 * du milieu tel quel (« (12+30)/2 »), d'où les parenthèses, « + » et « / » en plus des chiffres. */
const CARACTERE_XBAR_AUTORISE = /^[0-9\-.,+/() ]$/;

export function filtrerSaisieXBarBienaymeTchebychev(valeur: string): string {
  return valeur
    .replace(MOINS_TYPOGRAPHIQUES, "-")
    .split("")
    .filter((caractere) => CARACTERE_XBAR_AUTORISE.test(caractere))
    .join("");
}

export function gererKeyDownXBarBienaymeTchebychev(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key.length > 1 || e.key === "−" || e.key === "–") return;
  if (!CARACTERE_XBAR_AUTORISE.test(e.key)) e.preventDefault();
}
