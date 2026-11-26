import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * `56gen17` — « Énoncés quantifiés et axiomes » (5e (6h), « Nombres réels et suites », étape 3
 * « axiomes », processus 1 CONNAÎTRE). Deux variantes :
 * - quantifies : deux énoncés à dire vrais ou faux (verdict de CHACUN tiré à 50/50 AVANT l'énoncé,
 *   indépendamment), puis la négation d'un troisième énoncé (choix fermé, options mélangées une fois) ;
 * - axiomes : un calcul de trois égalités ; pour chacune, l'axiome (ou la définition) qui la justifie.
 */

export type VarianteQuantif = "quantifies" | "axiomes";

export interface LigneJustif {
  latex: string;
  justification?: string;
}

export interface EnonceQuantifie {
  /** Identifiant du prédicat (anti-doublon). */
  cle: string;
  latex: string;
  vrai: boolean;
  /** Raisonnement du corrigé (témoin ou contre-exemple), une relation par ligne. */
  lignes: LigneJustif[];
  /** Conclusion rédigée (résultat du corrigé). */
  raison: Frag[];
  /** Aide de niveau 2 posée pour l'énoncé (jamais le verdict). */
  aide2: Frag[];
}

export interface OptionNegation {
  id: string;
  latex: string;
  /** « juste », « predicat » (seul le prédicat est nié), « quantificateurs » (seuls ∀ / ∃ échangés),
   * « ordre » (ordre des quantificateurs inversé). */
  sorte: "juste" | "predicat" | "quantificateurs" | "ordre";
}

export type IdAxiome =
  | "addAssoc"
  | "addNeutre"
  | "addSym"
  | "addComm"
  | "mulAssoc"
  | "mulNeutre"
  | "mulSym"
  | "mulComm"
  | "distrib"
  | "ordTrans"
  | "ordAdd"
  | "ordMul"
  | "defSous"
  | "defDiv";

export interface EtapeCalcul {
  /** Égalité (ou inégalité) justifiée, en KaTeX. */
  latex: string;
  axiome: IdAxiome;
  /** Options proposées (bonne comprise), ordre canonique des axiomes. */
  options: IdAxiome[];
}

export interface ExerciceQuantif {
  variante: VarianteQuantif;
  enonces: EnonceQuantifie[];
  /** Énoncé à nier et options (déjà mélangées). */
  aNier: string;
  optionsNegation: OptionNegation[];
  /** Condition P(x ; y) de l'énoncé à nier, et sa négation. */
  predicat: string;
  predicatNie: string;
  /** axiomes : hypothèses éventuelles, expression de départ, étapes. */
  gabarit: string;
  hypotheses: string;
  depart: string;
  etapes: EtapeCalcul[];
}

export type PhaseQuantif = "enonce1" | "enonce2" | "negation" | "etape1" | "etape2" | "etape3";
