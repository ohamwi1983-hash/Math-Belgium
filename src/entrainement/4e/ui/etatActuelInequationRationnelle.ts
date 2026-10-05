import type { EtatSessionInequationRationnelle } from "../moteur/sessionInequationRationnelle";
import type { EtatAffichagePolynome } from "./formatSimplification";
import { formatFractionProgressive, formatFractionSimplifiee } from "./formatSimplification";
import { SYMBOLE_LATEX } from "./formatInequation";
import { formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "./formatEquation";
import {
  formatEnonceCombineDenominateurCarreFactoriseLatex,
  formatEnonceCombineDenominateurCarreLatex,
  formatEnonceCombineNiveau3FactoriseLatex,
  formatEnonceCombineNiveau3Latex,
  formatEnonceCombineNiveau4FactoriseLatex,
  formatEnonceCombineNiveau4Latex,
  formatEnonceCombineSansFacteurCommunFactoriseLatex,
  formatEnonceCubiqueFactoriseLatex,
  formatEnonceCubiqueMiseEnEvidenceLatex,
} from "./formatInequationRationnelle";

/**
 * Un côté P2 est "factorisé" une fois que sa véritable forme factorisée est confirmée : pour
 * cas_general, ce n'est qu'à l'étape "simplifierDenomFactorisation"/"simplifierNumFactorisation"
 * (prompt-corrections-etat-actuel-et-duplication.md, point 3) — les racines seules (champ2) ne
 * donnent pas encore la forme factorisée elle-même, contrairement aux 3 autres techniques où
 * champ1 EST déjà cette forme. Même principe que coteFactorise (etatActuelSimplification.ts).
 */
function coteFactorise(categorie: string, scoreChamp2: number | null, scoreFactorisation: number | null): boolean {
  return categorie === "cas_general" ? scoreFactorisation !== null : scoreChamp2 !== null;
}

/**
 * Degré d'affichage courant d'un côté (voir `EtatAffichagePolynome`, ui/formatSimplification.ts) —
 * "factorisee" une fois sa forme factorisée confirmée, sinon "miseEnEvidence" dès que sa réduction
 * (facteur commun sorti, jamais divisé) est confirmée, sinon "brut". Bug utilisateur du 27/09 :
 * régressait vers le polynôme brut tant que la factorisation complète n'était pas encore atteinte,
 * oubliant la mise en évidence déjà validée — même bug que celui corrigé sur gen3
 * (ui/etatActuelSimplification.ts::etatDenom/etatNum, même principe repris ici).
 */
function etatAffichageCote(categorie: string, scoreReduction: number | null, scoreChamp2: number | null, scoreFactorisation: number | null): EtatAffichagePolynome {
  if (coteFactorise(categorie, scoreChamp2, scoreFactorisation)) return "factorisee";
  if (scoreReduction !== null) return "miseEnEvidence";
  return "brut";
}

/**
 * "État actuel de l'expression" (prompt-corrections-moteur-partage.md, points 1 et 4 ;
 * prompt-corrections-etat-actuel-et-duplication.md, point 2) — niveau facteurCommun : même
 * principe progressif que l'exercice 3, dérivé directement de exercice.fraction
 * (ExerciceSimplification embarqué, voir core/inequationRationnelle.types.ts). Une fois les deux
 * côtés factorisés (juste avant l'écran de grille, tous deux toujours confirmés à ce stade), la
 * fraction entièrement factorisée s'affiche automatiquement — aucune logique supplémentaire
 * nécessaire pour cet écran spécifiquement (point 4).
 *
 * Toujours l'INÉQUATION complète (fraction ◇ 0 — cette variante n'a jamais de second membre non
 * nul, voir core/inequationRationnelle.types.ts), jamais la seule expression rationnelle isolée
 * (point 2) : contrairement à l'exercice "Simplifier" (une fraction seule, pas une inéquation),
 * l'élève doit toujours voir le symbole et le second membre pour garder le contexte de ce qu'il
 * résout.
 *
 * Une fois l'étape "simplifierFraction" elle-même confirmée (facteur commun annulé — le seul écran
 * qui suit encore étant "grille"), l'état actuel bascule sur la fraction réellement RÉDUITE
 * (`formatFractionSimplifiee`, le facteur commun retiré des deux côtés), pas la forme
 * factorisée-mais-pas-encore-simplifiée de `formatFractionProgressive`
 * (prompt-corrections-etat-actuel-et-duplication.md, point 3) : sinon l'écran de grille afficherait
 * encore le facteur commun (x-p) au numérateur et au dénominateur, alors que l'élève vient
 * précisément de confirmer qu'il s'annule.
 *
 * Les niveaux 1-4/denominateurCarre/sansFacteurCommun/cubique (numérateur combiné, pas
 * ExerciceSimplification embarqué) ne sont pas couverts par cette première implémentation et
 * renvoient toujours null — voir calculerEtatActuelNumerateurCombine ci-dessous.
 */
export function calculerEtatActuelInequationRationnelle(etat: EtatSessionInequationRationnelle): string | null {
  if (etat.exerciceCourant.niveau !== "facteurCommun") return null;

  const exercice = etat.exerciceCourant;
  const { fraction } = exercice;
  const D = fraction.denominateur;
  const N = fraction.numerateur;
  if (!("categorie" in D) || !("categorie" in N)) throw new Error("calculerEtatActuelInequationRationnelle : attendu des P2 pour facteurCommun");

  if (etat.scoreSimplifierFractionExercice !== null) {
    return `${formatFractionSimplifiee(fraction)} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
  }

  const etatDenom = etatAffichageCote(
    D.categorie,
    etat.scoreSimplifierDenomReductionExercice,
    etat.scoreSimplifierDenomChamp2Exercice,
    etat.scoreSimplifierDenomFactorisationExercice,
  );
  const etatNum = etatAffichageCote(
    N.categorie,
    etat.scoreSimplifierNumReductionExercice,
    etat.scoreSimplifierNumChamp2Exercice,
    etat.scoreSimplifierNumFactorisationExercice,
  );

  if (etatDenom !== "factorisee" && etatNum !== "factorisee") return null;

  return `${formatFractionProgressive(fraction, etatDenom, etatNum)} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Le numérateur combiné (`exercice.numerateur`, un P2 — le facteur quadratique restant pour
 * `cubique`) est-il déjà entièrement factorisé à cet instant de la session ? Même primitive
 * `coteFactorise` que ci-dessus, exportée pour être réutilisée par le bloc de travail N(x)
 * lui-même (`blocNumerateurQuadratique`, AppInequationRationnelle.tsx) — jamais recalculée
 * différemment entre "État actuel" et le bloc de travail, sous peine de désynchronisation entre
 * les deux (promptcorrectionsgenerateurs76complement.md, point 2.3.3).
 */
export function numerateurCombineEstFactorise(exercice: { numerateur: { categorie: string } }, etat: EtatSessionInequationRationnelle): boolean {
  return coteFactorise(exercice.numerateur.categorie, etat.scoreChamp2Exercice, etat.scoreFactorisationExercice);
}

/**
 * "État actuel de la fraction" pour les écrans reconnaissance/champ1/champ2/[factorisation] du
 * NUMÉRATEUR COMBINÉ (niveaux 3/4/denominateurCarre/sansFacteurCommun/cubique) —
 * promptcorrectionsgenerateurs76complement.md, point 2.3 : même principe accumulatif que
 * calculerEtatActuelInequationRationnelle ci-dessus (toujours l'inéquation complète, jamais la
 * seule expression rationnelle isolée), mais sur l'inéquation combinée déjà persistante plutôt
 * qu'une ExerciceSimplification embarquée :
 * - dénominateur : `sansFacteurCommun` est le SEUL niveau où D est lui-même un P2 à factoriser —
 *   son mécanisme (denomReconnaissance → denomChamp1 → [denomFactorisation]) se déroule
 *   ENTIÈREMENT avant "ce", donc strictement avant reconnaissance/champ1/champ2/[factorisation] du
 *   numérateur (voir sessionInequationRationnelle.ts) : D est donc TOUJOURS déjà entièrement
 *   factorisé dès qu'on atteint ces écrans, jamais reredéveloppé (point 2.3.2). Pour les 4 autres
 *   niveaux/variantes, D n'a pas de mécanisme de factorisation propre (linéaire ou carré d'un
 *   linéaire) — son rendu, inchangé d'un écran à l'autre, ne pose donc aucun risque de régression.
 * - numérateur : développé tant que sa propre factorisation n'est pas confirmée (`coteFactorise`,
 *   même primitive que ci-dessus), factorisé une fois confirmée (point 2.3.3). Pour `cubique`
 *   spécifiquement, `exercice.numerateur` ne représente que le facteur quadratique RESTANT après
 *   mise en évidence de x (déjà confirmée avant d'atteindre ces écrans, voir
 *   core/inequationRationnelle.types.ts) : l'état intermédiaire n'est donc jamais le cube
 *   entièrement développé (ce serait régresser derrière "x" déjà mis en évidence), mais
 *   `formatEnonceCubiqueMiseEnEvidenceLatex` (x(ax²+bx+c), quadratique encore développé).
 *
 * Les niveaux 1-2 (pas de numérateur combiné du 2nd degré, simple étape "racineNumerateur") et
 * facteurCommun (couvert ci-dessus) renvoient toujours null.
 */
export function calculerEtatActuelNumerateurCombine(etat: EtatSessionInequationRationnelle): string | null {
  const exercice = etat.exerciceCourant;
  if (
    exercice.niveau !== "niveau3" &&
    exercice.niveau !== "niveau4" &&
    exercice.niveau !== "denominateurCarre" &&
    exercice.niveau !== "sansFacteurCommun" &&
    exercice.niveau !== "cubique"
  ) {
    return null;
  }

  const numFactorise = numerateurCombineEstFactorise(exercice, etat);

  switch (exercice.niveau) {
    case "niveau3":
      return numFactorise ? formatEnonceCombineNiveau3FactoriseLatex(exercice) : formatEnonceCombineNiveau3Latex(exercice);
    case "niveau4":
      return numFactorise ? formatEnonceCombineNiveau4FactoriseLatex(exercice) : formatEnonceCombineNiveau4Latex(exercice);
    case "denominateurCarre":
      return numFactorise
        ? formatEnonceCombineDenominateurCarreFactoriseLatex(exercice)
        : formatEnonceCombineDenominateurCarreLatex(exercice);
    case "cubique":
      return numFactorise ? formatEnonceCubiqueFactoriseLatex(exercice) : formatEnonceCubiqueMiseEnEvidenceLatex(exercice);
    case "sansFacteurCommun": {
      // D toujours déjà entièrement factorisé à ce stade (son propre mécanisme précède "ce").
      if (numFactorise) return formatEnonceCombineSansFacteurCommunFactoriseLatex(exercice);
      const numerateur = formatMembreGauche(exercice.numerateur.enonce);
      const denominateur = formatFormeFactoriseeDepuisRacines(exercice.denominateur.enonce, exercice.denominateur.solution.racines);
      return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
    }
  }
}
