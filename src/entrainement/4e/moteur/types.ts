import type { Categorie, Exercice, GenerateurExercice } from "../core/generateur.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * "developper" (nouvelle, gen1 "regroupe avant de développer", prompt du 27/09) : uniquement pour
 * cas_general/produit_remarquable quand la forme de surface isolée garde un produit non développé
 * (formeAffichage "produit_egale_constante") — voir moteur/session.ts::necessiteDeveloppement.
 * Sans elle, "isolement" (qui ne fait que regrouper, jamais développer — voir
 * ui/formatEquation.ts::formatEquationIsoleeNonDeveloppee) demanderait directement la forme
 * ax²+bx+c=0 en un seul saut, masquant le carré parfait/Δ dans un produit x(x+b) non développé.
 */
export type Phase = "simplification" | "isolement" | "developper" | "reconnaissance" | "champ1" | "champ2";

/**
 * Réponse guidée de l'étape "zéros" (prompt-generateurs123groupe.md, point 5 — reprend le
 * pattern "Aucun/Au moins un" déjà implémenté par `caracteristiquesAlgebriques`, remplaçant les
 * champs fixes x1/x2). `aucun` n'est jamais la bonne réponse pour ce générateur (les 5 catégories
 * ont toujours des racines réelles, `irreductible` n'étant jamais produite ici — voir
 * `core/generateur.types.ts`), mais l'option reste proposée pour l'uniformité de l'interface.
 */
export interface ReponseZeros {
  aucun: boolean;
  /** ignoré si aucun===true ; 1 valeur acceptée pour une racine double, sinon 2 */
  valeurs: number[];
}

export interface ResultatExercice {
  categorie: Categorie;
  /** score de l'étape de simplification, 0-100, ou null si l'étape n'a pas eu lieu (pgcd(|a|,|b|,|c|)=1) */
  scoreSimplification: number | null;
  /** score de l'étape d'isolement, 0-100, ou null si l'étape n'a pas eu lieu pour cet exercice */
  scoreIsolement: number | null;
  /** score de l'étape "développer" (voir Phase), 0-100, ou null si l'étape n'a pas eu lieu (necessiteDeveloppement) */
  scoreDevelopper: number | null;
  /** score de l'étape de reconnaissance, 0-100, ou null pour une catégorie qui n'en a pas (mise_en_evidence_generalisee) */
  scoreReconnaissance: number | null;
  /** score du champ "Factorise l'équation" ou "Δ =" selon la catégorie, 0-100 */
  scoreChampPrincipal: number;
  /** score de l'étape "Zéros", 0-100 */
  scoreZeros: number;
  /** true si tentativesMax a été atteint sans que l'élève ne trouve la bonne catégorie */
  categorieRevelee: boolean;
}

export interface EtatSession {
  reglages: ReglagesSession;
  generateur: GenerateurExercice;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: Exercice;
  /**
   * Snapshot de l'exercice tel que généré, jamais mutée (contrairement à `exerciceCourant`, qui
   * est remplacée par sa version réduite une fois la simplification confirmée — voir
   * soumettreReponseSimplification) : sert de source pour le bloc "énoncé" fixe (`enonceFixe`
   * des composants Etape*.tsx), qui doit toujours rester l'énoncé de départ, jamais la forme déjà
   * réduite (bug utilisateur du 26/09 — voir historique).
   */
  exerciceOriginal: Exercice;
  phase: Phase;
  /** état de la phase en cours (tentatives/score/révélation), générique quel que soit le contenu vérifié */
  etapeCourante: EtatEtapeTentatives;
  /** score de la phase "simplification" une fois close, ou null si l'étape n'a pas eu lieu (voir necessiteSimplification) */
  scoreSimplificationExercice: number | null;
  /** score de la phase "isolement" une fois close, ou null si l'étape n'a pas eu lieu (voir necessiteIsolement) */
  scoreIsolementExercice: number | null;
  /** true si l'étape d'isolement a dû être révélée — affiché à l'étape de reconnaissance qui suit */
  isolementRevele: boolean;
  /** score de la phase "developper" une fois close, ou null si l'étape n'a pas eu lieu (voir necessiteDeveloppement) */
  scoreDevelopperExercice: number | null;
  /** score de la phase "reconnaissance" une fois close, conservé jusqu'à la clôture de l'exercice */
  scoreReconnaissanceExercice: number | null;
  /** score de la phase "champ1" une fois close, conservé jusqu'à la clôture de l'exercice */
  scoreChampPrincipalExercice: number | null;
  categorieRevelee: boolean;
  /**
   * Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture —
   * conceptionaidescomposantspartageshistorique.md) — chacune remise à false au passage à
   * l'exercice suivant, comme `categorieRevelee`.
   */
  aideSimplificationUtilisee: boolean;
  aideIsolementUtilisee: boolean;
  aideDevelopperUtilisee: boolean;
  aideChamp1Utilisee: boolean;
  aideZerosUtilisee: boolean;
  resultats: ResultatExercice[];
  terminee: boolean;
}
