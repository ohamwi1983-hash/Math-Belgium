import type { ReactNode } from "react";
import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EntreeHistoriqueEtape } from "../../components/FicheReponseEcran";
import { Katex } from "../components/Katex";
import { expressionLibreVersLatex } from "./formatExpressionLatex";

/**
 * Barre de progression + puces cliquables, construites À PARTIR DE L'HISTORIQUE des écrans clos
 * (4e, chapitre 2 — gen1–gen6, gen67). Avant : chaque appli dressait une liste FIXE de phases et
 * ouvrait la fiche `historique[index]` — or plusieurs phases sont conditionnelles (simplification,
 * isolement, CE…) ou répétées (une par facteur), et toutes les étapes n'entraient pas dans
 * l'historique : une puce restait « à venir » pour un écran qui n'existe pas (jamais 100 %), et un
 * clic ouvrait la fiche d'un AUTRE écran. Ici, une puce close = une entrée d'historique, dans
 * l'ordre : le n-ième segment ouvre toujours la n-ième fiche, et la dernière étape est close comme
 * les autres (100 % atteint sur l'écran de validation final).
 */
export type EtatEcranClos = "correcte" | "aide" | "revele";

export interface EcranClos {
  etat: EtatEcranClos;
  entree: EntreeHistoriqueEtape;
}

/** Entrée d'historique d'un écran qui vient de se clore. `reponseAttendue` n'est gardée que si
 * l'écran a été révélé (inutile de la répéter quand l'élève avait juste). */
export function ecranClos(titre: string, votreReponse: ReactNode | undefined, revele: boolean, aideUtilisee: boolean, reponseAttendue?: ReactNode): EcranClos {
  return {
    etat: revele ? "revele" : aideUtilisee ? "aide" : "correcte",
    entree: {
      titre,
      votreReponse: votreReponse ?? "—",
      correcte: !revele,
      reponseAttendue: revele ? reponseAttendue : undefined,
    },
  };
}

/**
 * Segments de `ProgressionPuces` : les écrans clos (dans l'ordre), puis l'écran en cours s'il est
 * encore ouvert (`ecranOuvert` = aucune validation en attente), puis les écrans à venir jusqu'à
 * `nombreEcrans` (nombre RÉEL d'écrans de cet exercice, phases conditionnelles comprises).
 */
export function segmentsDepuisHistorique(clos: EcranClos[], nombreEcrans: number, ecranOuvert: boolean): EtatPuceProgression[] {
  const segments: EtatPuceProgression[] = clos.map((c) => c.etat);
  if (ecranOuvert && segments.length < nombreEcrans) segments.push("courante");
  while (segments.length < nombreEcrans) segments.push("a-venir");
  return segments;
}

/** Saisie libre de l'élève (expression, équation, inéquation) rendue en KaTeX, comme l'aperçu du
 * champ — jamais la notation clavier brute (« x^2 », « sqrt », point décimal). */
export function saisieEnLatex(texte: string): ReactNode {
  try {
    const latex = texte.trim() === "" ? null : expressionLibreVersLatex(texte);
    if (latex) return <Katex expression={latex} />;
  } catch {
    // saisie non analysable : affichée telle quelle, typographie corrigée
  }
  return texte.replace(/-/g, "−").replace(/(\d)\.(\d)/g, "$1,$2");
}

/** Nombre en texte : virgule décimale, « − » typographique. */
export function nombreTexte(valeur: number): string {
  return String(valeur).replace(".", ",").replace("-", "−");
}
