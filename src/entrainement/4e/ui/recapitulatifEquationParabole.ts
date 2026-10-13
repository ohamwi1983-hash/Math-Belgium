import type { EtatSessionEquationParabole } from "../moteur/typesEquationParabole";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatFoyerLatex, formatSommetLatex } from "./formatEquationParabole";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 2 phases FIXES ("sommetFoyer" puis "equation", voir
 * `moteur/typesEquationParabole.ts`) : seule "sommetFoyer" précède un écran suivant, donc la
 * seule entrée possible est celle de l'écran 1, visible uniquement pendant l'écran 2. Sommet et
 * foyer forment une SEULE phase (un seul score, un seul `sommetFoyerRevele`), donc une seule
 * entrée combinée — réutilise TEL QUEL le texte LaTeX déjà composé pour l'ancien bloc "état
 * actuel" de l'écran 2 (`EtapeEquationEquationParabole`).
 */
export function calculerRecapitulatifEquationParabole(etat: EtatSessionEquationParabole): EntreeRecapitulatif[] {
  if (etat.phase !== "equation") return [];

  const exercice = etat.exerciceCourant;
  return [
    {
      libelle: "Sommet et foyer",
      estLatex: true,
      valeur: `S = ${formatSommetLatex(exercice.sommet)} \\quad F = ${formatFoyerLatex(exercice.foyer)}`,
      revele: etat.sommetFoyerRevele,
    },
  ];
}
