/**
 * Couche A (5e) — Phase 2, Type 2 de 5gen13 ("Extremums de f(t)"). Réutilise le PRINCIPE de la
 * formule FUSIONNÉE de 5gen11 (sin(u)=±1 ⟺ u=π/2+n·π, UNE SEULE branche, période TOUJOURS π) mais
 * filtrée dans [0;fenêtre] au lieu de [0;2π[ — le modèle de 5gen13 est TOUJOURS `A·sin(...)+b`
 * (jamais cos), donc une seule formule fusionnée nécessaire (contrairement à 5gen11, qui gère les 2
 * fonctions).
 */
import type { FonctionModelisationSinusoide, QuestionExtremum } from "../../core5e/modelisationSinusoide.types";
import { construireBrancheT, resoudreDansFenetre } from "./phase2Commun";

const BRANCHE_U_FUSIONNEE = { constante: Math.PI / 2, periode: Math.PI };

export function genererQuestionExtremum(fonction: FonctionModelisationSinusoide, fenetre: number): QuestionExtremum {
  const { omega, phi } = fonction;
  if (phi === null) throw new Error("genererQuestionExtremum : phi doit être numériquement connu (jamais tiré pour la technique 'b1')");

  const brancheT = construireBrancheT(BRANCHE_U_FUSIONNEE, omega, phi);
  const solutions = resoudreDansFenetre([brancheT], fenetre);

  return { type: "extremum", fenetre, brancheU: BRANCHE_U_FUSIONNEE, brancheT, solutions };
}
