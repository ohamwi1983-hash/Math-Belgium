import type { StatutVerification } from "../moteur/statutVerification";
import type { EtapeCorrection } from "../../export/genererFeuilleExercices";

/**
 * Contrat commun des générateurs « à écrans » du 5e ch. 2 (lot G de l'audit : 5gen54 φ hors d'un
 * extremum, 5gen55 inéquations, 5gen56 Archimède, 5gen57 relevés réels). Chaque générateur fournit
 * une `DefinitionEcrans` (textes de `ui5e/format….ts`, vérification de `moteur5e/verification….ts`) ;
 * le moteur `moteur5e/sessionEcransTrigo.ts`, l'écran `components5e/EtapeEcransTrigo.tsx` et l'appli
 * `components5e/AppEcransTrigo.tsx` sont partagés. Le papier (`exportEvaluation.ts`) dérive des MÊMES
 * fonctions (consignes, réponses, corrigé).
 */

export type Frag = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export const tx = (valeur: string): Frag => ({ type: "texte", valeur });
export const lx = (valeur: string): Frag => ({ type: "latex", valeur });

export interface ChampEcran {
  /** Texte brut (aria-label, fiche « lecture seule »). */
  label: string;
  /** Étiquette en KaTeX (« A = », « \varphi_1 = »). */
  labelLatex?: string;
  unite?: string;
  placeholder: string;
  /** Aperçu KaTeX en direct au-dessus du champ (saisie d'une expression : 6gen148, 6gen149). */
  apercu?: boolean;
  /** Aperçu KaTeX propre au champ (ensemble, nombre… : 5gen58–5gen60) — `null` : rien d'affiché. */
  apercuLatex?: (texte: string) => string | null;
  /** Boutons qui AJOUTENT un texte en fin de champ (« [ », « ∞ », « ∪ », « ℝ »…) : 5gen58–5gen60.
   * Ils ne restreignent jamais ce qu'on tape. */
  raccourcis?: { libelle: string; texte: string }[];
}

export interface OptionEcran {
  id: string;
  fragments: Frag[];
}

/** Aide d'un niveau : une phrase (fragments, KaTeX en ligne permis) puis, éventuellement, une formule centrée. */
export interface AideEcran {
  texte: Frag[];
  latex?: string;
  /** Figure SVG (chaîne) sous le texte de l'aide (5gen63 : report par la diagonale) ; jamais la
   * réponse de l'écran. */
  figure?: string;
}

/** Une ligne d'intervalle saisie (écran « intervalles ») : crochets + deux bornes. */
export interface LigneIntervalle {
  ouvrant: "[" | "]";
  gauche: string;
  droite: string;
  fermant: "[" | "]";
}

export type ModeEcran =
  | { type: "champs"; champs: ChampEcran[]; symboles?: { label: string; options: { id: string; latex: string }[] } }
  | { type: "choix"; options: OptionEcran[] }
  | {
      type: "intervalles";
      variable: string;
      /** Repères des deux bornes (défaut : angles en π, 5gen55). */
      placeholders?: [string, string];
      /** Bouton « ∅ » (ensemble vide) proposé à côté des intervalles (5gen62 : toujours présent sur
       * ses écrans d'ensemble, pour ne jamais trahir le cas particulier). */
      vide?: boolean;
    };

/** Tableau de données affiché sous l'énoncé (relevés…). */
export interface TableauDonnees {
  entetes: Frag[][];
  lignes: string[][];
  /** Rangées affichées horizontalement (une ligne par grandeur) plutôt qu'en colonnes. */
  horizontal?: boolean;
}

export interface DefinitionEcrans<E, P extends string> {
  phases(e: E): P[];
  estChoix(e: E, phase: P): boolean;
  mode(e: E, phase: P): ModeEcran;
  libelle(e: E, phase: P): string;
  consigneGenerale(e: E): Frag[];
  /** Figure SVG (chaîne) affichée sous l'énoncé, propre à l'écran (jamais la réponse de l'écran). */
  figure?(e: E, phase: P): string | null;
  tableau?(e: E): TableauDonnees | null;
  consigne(e: E, phase: P): Frag[];
  /** Saisie lisible mais APPROCHÉE (ou dans une autre unité) alors que la forme exacte est demandée :
   * message, AUCUNE tentative consommée (`null` sinon) — ajout 6gen156–6gen159, sans effet ailleurs. */
  approchee?(e: E, phase: P, valeurs: string[]): string | null;
  aide1(e: E, phase: P): AideEcran;
  aide2(e: E, phase: P): AideEcran | null;
  /** Statut champ par champ (choix : une seule valeur ; intervalles : une valeur globale). */
  diagnostiquer(e: E, phase: P, valeurs: string[]): StatutVerification[];
  /** Saisie LISIBLE et JUSTE en valeur, mais pas sous la forme demandée (polynôme non développé ou
   * non réduit, crochet fermé sur un infini…) : message, AUCUNE tentative consommée (`null` sinon).
   * Absent : rien (5gen54–5gen57, 6gen148–6gen151 inchangés). */
  aReprendre?(e: E, phase: P, valeurs: string[]): Frag[] | null;
  /** Message ciblé sur une erreur du cours trahie par la réponse fausse (jamais la réponse). */
  piege(e: E, phase: P, valeurs: string[]): Frag[] | null;
  messageIllisible(e: E, phase: P): string;
  reponseAttendue(e: E, phase: P): Frag[];
  /** Valeur confirmée affichée dans « Ce qu'on sait déjà ». */
  recap(e: E, phase: P): Frag[];
  /** Deux niveaux d'aide aussi sur un choix fermé (quand `aide2` n'est pas nul) — 6gen148–6gen151 ;
   * absent : un seul niveau sur un choix fermé (5gen54–5gen57, inchangés). */
  aidesChoixDeuxNiveaux?: boolean;
  /** Choix fermé faux : explication affichée avec la réponse. */
  explicationChoix?(e: E, phase: P): string;
  /** Copie d'un élève fictif (lignes numérotées) et ligne signalée — détective 5gen58 (même rendu
   * que 6gen144). Absent : aucune copie (5gen54–5gen57 inchangés). */
  copie?(e: E, phase: P): { lignes: Frag[][]; signalee: number | null } | null;
  /** Saisie lisible mais APPROCHÉE alors que la forme exacte est demandée : message, AUCUNE tentative
   * consommée (`null` sinon) — 5gen58–5gen60. */
  approchee?(e: E, phase: P, valeurs: string[]): string | null;
  /** Choix fermé faux : le message ciblé de `piege` s'affiche avec la réponse révélée (5gen58–5gen60 ;
   * absent : rien, comme avant). */
  piegeChoixRevele?: boolean;
  correction(e: E): EtapeCorrection[];
}

/** Valeur unique transmise au moteur quand l'élève choisit « ∅ » (écran « intervalles » avec `vide`). */
export const VALEUR_VIDE = "\u0002vide";

/** Encodage d'une ligne d'intervalle dans le tableau `valeurs: string[]` du moteur. */
const SEP = "\u0001";
export function encoderLigne(l: LigneIntervalle): string {
  return [l.ouvrant, l.gauche, l.droite, l.fermant].join(SEP);
}
export function decoderLigne(s: string): LigneIntervalle {
  const [o, g, d, f] = s.split(SEP);
  return { ouvrant: o === "]" ? "]" : "[", gauche: g ?? "", droite: d ?? "", fermant: f === "[" ? "[" : "]" };
}
