import type { Conique } from "../moteur6e/algebreConiques";
import type { Droite, Pt, Q } from "../moteur6e/algebreLieux";

/**
 * `6gen63` — Propriétés optiques des coniques (6e ch. 10, § 6, processus 3 TRANSFÉRER ; audit, lots B et
 * C). Points à PETITS dénominateurs (paramétrage rationnel, G23), parabole AJOUTÉE (y² = 2px), rayon
 * réfléchi de l'hyperbole décrit comme une DEMI-droite (il s'éloigne de F′ ; son prolongement passe par F′).
 */

export type ProprieteOptique = "passeParFp" | "semblaVenirDeFp" | "paralleleAxe" | "passeParF";

export interface ExerciceProprietesOptiquesConiques {
  famille: "ellipse" | "hyperbole" | "parabole";
  /** Parabole : rayon issu du foyer, ou rayon arrivant parallèlement à l'axe. */
  mode: "depuisFoyer" | "parallele";
  conique: Conique;
  /** Foyer d'où part le rayon (ou foyer de la parabole). */
  F: Pt;
  /** Second foyer (ellipse, hyperbole). */
  Fp: Pt | null;
  /** Rayon incident : pente (0 si parallèle à l'axe) et sens de parcours en x (+1 : vers la droite). */
  m: Q;
  sens: 1 | -1;
  /** Point d'impact. */
  R: Pt;
  /** Autre point commun de la droite du rayon incident et de la conique (derrière la source). */
  autre: Pt | null;
  /** Droite qui porte le rayon réfléchi. */
  reflechi: Droite;
  propriete: ProprieteOptique;
}
