import type { PolynomeLineaire } from "../core/simplification.types";
import type { EtatSessionSimplification } from "../moteur/typesSimplification";
import { necessiteMiseEnEvidenceP1 } from "../moteur/verificationSimplification";
import type { EtatAffichagePolynome } from "./formatSimplification";
import { formatFractionProgressive } from "./formatSimplification";

/**
 * Un côté P2 est "factorisé" une fois que sa véritable forme factorisée est confirmée : pour
 * cas_general, ce n'est qu'à l'étape "factorisation" (prompt-corrections-etat-actuel-et-
 * duplication.md, point 1) — les racines seules (champ2) ne donnent pas encore la forme
 * factorisée elle-même, contrairement aux 3 autres techniques où champ1 EST déjà cette forme.
 * Utilisée telle quelle pour le dénominateur, dont l'étape champ2 (CE) a toujours lieu.
 */
function coteFactorise(categorie: string, scoreChamp2: number | null, scoreFactorisation: number | null): boolean {
  return categorie === "cas_general" ? scoreFactorisation !== null : scoreChamp2 !== null;
}

/**
 * Même principe que coteFactorise, pour le numérateur uniquement — depuis
 * prompt-generateurs123vague2.md, générateur 3, point 4, l'étape "numChamp2" (racines du
 * numérateur) est sautée pour les 3 techniques déjà factorisées dès champ1 : scoreNumChamp2 reste
 * alors toujours null pour ces catégories, donc scoreNumChamp1 devient le seul signal réel de
 * factorisation dans ce cas — cas_general, lui, garde exactement le même chemin qu'avant
 * (numChamp2 puis "factorisation", jamais touché par ce correctif).
 */
function coteFactoriseNumerateur(
  categorie: string,
  scoreChamp1: number | null,
  scoreFactorisation: number | null,
): boolean {
  return categorie === "cas_general" ? scoreFactorisation !== null : scoreChamp1 !== null;
}

/**
 * Degré d'affichage courant d'un P1 (`{k,p}`, gen3 image 6/7 du prompt du 27/09) : "factorisee"
 * dès que k=1 (rien à mettre en évidence, déjà sous sa forme minimale) ou une fois sa mise en
 * évidence confirmée (`scoreReductionP1`), sinon "brut" (ax+b développé).
 */
function etatP1(poly: PolynomeLineaire, scoreReductionP1: number | null): EtatAffichagePolynome {
  if (!necessiteMiseEnEvidenceP1(poly)) return "factorisee";
  return scoreReductionP1 !== null ? "factorisee" : "brut";
}

/**
 * Degré d'affichage courant du dénominateur (voir `EtatAffichagePolynome`) : "factorisee" une fois
 * sa forme factorisée confirmée, sinon "miseEnEvidence" dès que "denomReduction" est confirmée
 * (bug utilisateur du 27/09 : régressait vers le polynôme brut tant que la factorisation complète
 * n'était pas encore atteinte, oubliant la mise en évidence déjà validée), sinon "brut".
 */
function etatDenom(exercice: EtatSessionSimplification["exerciceCourant"], etat: EtatSessionSimplification): EtatAffichagePolynome {
  const { denominateur } = exercice;
  if (!("categorie" in denominateur)) return etatP1(denominateur, etat.scoreDenomReductionP1Exercice);
  if (coteFactorise(denominateur.categorie, etat.scoreDenomChamp2Exercice, etat.scoreDenomFactorisationExercice)) return "factorisee";
  if (etat.scoreDenomReductionExercice !== null) return "miseEnEvidence";
  return "brut";
}

/** Même principe qu'etatDenom, côté numérateur. */
function etatNum(exercice: EtatSessionSimplification["exerciceCourant"], etat: EtatSessionSimplification): EtatAffichagePolynome {
  const { numerateur } = exercice;
  if (!("categorie" in numerateur)) return etatP1(numerateur, etat.scoreNumReductionP1Exercice);
  if (coteFactoriseNumerateur(numerateur.categorie, etat.scoreNumChamp1Exercice, etat.scoreNumFactorisationExercice)) return "factorisee";
  if (etat.scoreNumReductionExercice !== null) return "miseEnEvidence";
  return "brut";
}

/**
 * "État actuel de l'expression" (prompt-corrections-moteur-partage.md, point 1) — pour la fraction
 * de l'exercice "Simplifier" : chaque côté progresse indépendamment de "brut" à "mis en évidence"
 * (une fois sa réduction confirmée) puis "factorisé" (une fois sa forme factorisée confirmée). null
 * tant qu'aucun côté P2 n'est encore factorisé (pas seulement mis en évidence — voir captures
 * d'écran utilisateur du 27/09, aucune régression par rapport au moment où ce bloc apparaît) — un
 * côté P1 (jamais de reconnaissance à faire) ne déclenche jamais le bloc à lui seul.
 */
export function calculerEtatActuelSimplification(etat: EtatSessionSimplification): string | null {
  const exercice = etat.exerciceCourant;
  const { denominateur, numerateur } = exercice;
  const denomEstP2 = "categorie" in denominateur;
  const numEstP2 = "categorie" in numerateur;

  const etatDenomActuel = etatDenom(exercice, etat);
  const etatNumActuel = etatNum(exercice, etat);

  const auMoinsUnCoteFactorise = (denomEstP2 && etatDenomActuel === "factorisee") || (numEstP2 && etatNumActuel === "factorisee");

  if (!auMoinsUnCoteFactorise) return null;

  return formatFractionProgressive(exercice, etatDenomActuel, etatNumActuel);
}
