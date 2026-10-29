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
