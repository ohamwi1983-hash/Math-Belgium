import type { Droite, Poly, Pt, Q } from "../moteur6e/algebreLieux";
import type { AideCombi } from "../ui6e/fragmentsCombinatoire";
import type { ObjetsLieux } from "../ui6e/figureLieux";

/**
 * `6gen56` — Lieux géométriques et élimination de paramètre (6e ch. 9, § 4 et § 6 ; audit du
 * chapitre, lots B et C). Une instance DÉCRIT ce qu'elle attend (écrans, réponses exactes, textes
 * propres au sous-type, figure) : le format et la vérification sont génériques. Verdicts (nature du
 * lieu, régime cercle / point / vide, partie décrite) tirés AVANT les paramètres, à parts égales.
 */

export type FamilleLieuxGeometriquesParametres = "A" | "B" | "C" | "D" | "E";

export type SousTypeLieux =
  | "A_paralleles"
  | "A_nonBorne"
  | "A_losange"
  | "B_bissectrices"
  | "B_droite"
  | "B_cerclePerp"
  | "B_seuil2Points"
  | "B_apollonius"
  | "B_seuilCarre"
  | "C"
  | "D_substitution"
  | "D_fractions"
  | "D_ratio"
  | "E_paralleles"
  | "E_perpendiculaires"
  | "E_secantes"
  | "E_carre";

export type PhaseLieuxGeometriquesParametres = "nature" | "droites" | "sommets" | "equation" | "centreR" | "restriction";

export interface OptionLieu {
  valeur: string;
  label: string;
}

export interface ExerciceLieuxGeometriquesParametres {
  famille: FamilleLieuxGeometriquesParametres;
  sousType: SousTypeLieux;
  /** Verdict de l'instance (nature, régime ou partie décrite), pour les profils et les contrôles. */
  verdict: string;
  phases: PhaseLieuxGeometriquesParametres[];
  /** Données (RichText, `$…$`). */
  donnees: string[];
  consigne: string;
  consignes: Partial<Record<PhaseLieuxGeometriquesParametres, string>>;
  aides: Partial<Record<PhaseLieuxGeometriquesParametres, AideCombi[]>>;
  explications: Partial<Record<PhaseLieuxGeometriquesParametres, string[]>>;
  /** Choix fermés : options (même liste pour toutes les instances de la famille) et bonne réponse. */
  natures?: OptionLieu[];
  nature?: string;
  restrictions?: OptionLieu[];
  restriction?: string;
  /** Champs. */
  droites?: Droite[];
  sommets?: Pt[];
  equation?: Poly;
  equationLatex?: string;
  centre?: Pt;
  R?: Q;
  /** Figure : configuration (avant) et lieu (après la dernière réponse). */
  configuration: ObjetsLieux;
  lieu: ObjetsLieux;
}
