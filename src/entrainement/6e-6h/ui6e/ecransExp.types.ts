import type { StatutVerification } from "../moteur/statutVerification";
import type { EtapeCorrection } from "../../export/genererFeuilleExercices";

/**
 * Contrat commun des générateurs « à écrans » du 6e ch. 2 (lot G de l'audit : 6gen144 détective
 * d'erreurs, 6gen145 limites de référence, 6gen146 puissances sans calculatrice, 6gen147 modèle lu
 * dans un tableau) — même patron que le socle du 5e ch. 2 (`5e-4h/ui5e/ecransTrigo.types.ts`),
 * dupliqué (aucun contrat partagé entre chantiers). Chaque générateur fournit une
 * `DefinitionEcrans` (textes de `ui6e/format….ts`, vérification de `moteur6e/verification….ts`) ;
 * le moteur `moteur6e/sessionEcransExp.ts`, l'écran `components6e/EtapeEcransExp.tsx` et l'appli
 * `components6e/AppEcransExp.tsx` sont partagés. Le papier (`exportEvaluation.ts`) dérive des MÊMES
 * fonctions (consignes, réponses, corrigé). Ajouts au socle 5e : la copie d'un élève fictif
 * (`copie`, détective), deux niveaux d'aide aussi sur un choix fermé, des repères de saisie propres
 * à l'écran « intervalles », un message « valeur approchée » qui ne coûte aucune tentative.
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
  /** Aperçu KaTeX en direct au-dessus du champ (saisie d'une expression en x : 6gen152, 6gen153). */
  apercu?: boolean;
}

export interface OptionEcran {
  id: string;
  fragments: Frag[];
}

/** Aide d'un niveau : une phrase (fragments, KaTeX en ligne permis) puis, éventuellement, une formule centrée. */
export interface AideEcran {
  texte: Frag[];
  latex?: string;
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
  | { type: "intervalles"; variable: string; placeholders?: [string, string] };

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
  /** Copie d'un élève fictif (lignes numérotées) et ligne signalée (une fois l'écran « ligne » clos). */
  copie?(e: E, phase: P): { lignes: Frag[][]; signalee: number | null } | null;
  /** Saisie lisible mais APPROCHÉE alors que la forme exacte est demandée : message, aucune tentative
   * consommée (`null` sinon). */
  approchee?(e: E, phase: P, valeurs: string[]): string | null;
  consigne(e: E, phase: P): Frag[];
  aide1(e: E, phase: P): AideEcran;
  aide2(e: E, phase: P): AideEcran | null;
  /** Statut champ par champ (choix : une seule valeur ; intervalles : une valeur globale). */
  diagnostiquer(e: E, phase: P, valeurs: string[]): StatutVerification[];
  /** Message ciblé sur une erreur du cours trahie par la réponse fausse (jamais la réponse). */
  piege(e: E, phase: P, valeurs: string[]): Frag[] | null;
  messageIllisible(e: E, phase: P): string;
  reponseAttendue(e: E, phase: P): Frag[];
  /** Valeur confirmée affichée dans « Ce qu'on sait déjà ». */
  recap(e: E, phase: P): Frag[];
  /** Choix fermé faux : explication affichée avec la réponse. */
  explicationChoix?(e: E, phase: P): string;
  correction(e: E): EtapeCorrection[];
}

/** Encodage d'une ligne d'intervalle dans le tableau `valeurs: string[]` du moteur. */
const SEP = "\u0001";
export function encoderLigne(l: LigneIntervalle): string {
  return [l.ouvrant, l.gauche, l.droite, l.fermant].join(SEP);
}
export function decoderLigne(s: string): LigneIntervalle {
  const [o, g, d, f] = s.split(SEP);
  return { ouvrant: o === "]" ? "]" : "[", gauche: g ?? "", droite: d ?? "", fermant: f === "[" ? "[" : "]" };
}
