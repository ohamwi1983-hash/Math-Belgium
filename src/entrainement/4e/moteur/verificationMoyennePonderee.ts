/**
 * Couche B — vérification pour "Moyenne pondérée" (chapitre 5, troisième générateur) — voir
 * `promptgen32creation.md`, puis `promptgen32modifications.md` (colonne de produits ligne par
 * ligne + ligne de totaux intégrée à l'écran "sommes", retrait de l'écran "conceptuel").
 *
 * Statut à 3 valeurs (`StatutVerification`) sur tous les champs numériques libres (écrans
 * "centres"/"sommes"/"quotient") — même primitive `parserNombreOuFraction`
 * (`verificationAnalyseFonction.ts`, import moteur→moteur) et même tolérance minime (`1e-9`) que
 * "Tableau de fréquences"/"Regroupement en classes et histogramme" : les valeurs de ce générateur
 * sont toutes des décimales EXACTES par construction (voir `core/moyennePonderee.types.ts`), cette
 * tolérance ne couvre qu'un éventuel bruit résiduel de virgule flottante — jamais une vraie marge
 * d'arrondi (spec : "vérification par égalité exacte, sans tolérance numérique").
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ExerciceMoyennePonderee, ExerciceMoyennePondereeClasses } from "../core/moyennePonderee.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran "centres" — variante "classes" uniquement
// ============================================================================

/** Un champ centre par classe, dans l'ordre fixe de `exercice.classes` — jamais une interface
 * "add-as-needed" (les classes ne sont pas construites par l'élève, mêmes bornes/effectifs imposés
 * que "Regroupement en classes et histogramme"). */
export type ReponseCentres = string[];

export function diagnostiquerCentreClasse(exercice: ExerciceMoyennePondereeClasses, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.classes[index].centre);
}

export function evaluerCentres(exercice: ExerciceMoyennePondereeClasses, reponse: ReponseCentres): StatutVerification[] {
  return exercice.classes.map((_, i) => diagnostiquerCentreClasse(exercice, i, reponse[i] ?? ""));
}

export function verifierCentres(exercice: ExerciceMoyennePondereeClasses, reponse: ReponseCentres): boolean {
  if (reponse.length !== exercice.classes.length) return false;
  return evaluerCentres(exercice, reponse).every((s) => s === "correct");
}

// ============================================================================
// Écran "sommes" — communes aux 2 variantes : un champ produit xᵢ·nᵢ PAR LIGNE (isole une erreur
// de calcul localisée à une seule ligne), plus les deux totaux Σ(xᵢ·nᵢ)/Σnᵢ intégrés à la dernière
// ligne du tableau (`promptgen32modifications.md`, point 3 — remplace les deux anciens champs
// externes, même logique de vérification, désormais combinée aux produits en un seul essai global).
// ============================================================================

export interface ReponseSommes {
  /** Un produit xᵢ·nᵢ par ligne, index-aligné avec `exercice.lignes`/`exercice.classes`. */
  produits: string[];
  sommeN: string;
  sommeXN: string;
}

export interface StatutSommes {
  produits: StatutVerification[];
  sommeXN: StatutVerification;
  sommeN: StatutVerification;
}

/** Ligne à un index donné, sous la forme générique (x, n) — x est la valeur (variante "discrete")
 * ou le centre CONFIRMÉ (variante "classes"), jamais une resaisie. `undefined` hors bornes. */
function ligneAt(exercice: ExerciceMoyennePonderee, index: number): { x: number; n: number } | undefined {
  if (exercice.variante === "discrete") {
    const ligne = exercice.lignes[index];
    return ligne ? { x: ligne.valeur, n: ligne.effectif } : undefined;
  }
  const classe = exercice.classes[index];
  return classe ? { x: classe.centre, n: classe.effectif } : undefined;
}

function nombreLignes(exercice: ExerciceMoyennePonderee): number {
  return exercice.variante === "discrete" ? exercice.lignes.length : exercice.classes.length;
}

export function diagnostiquerProduitLigne(exercice: ExerciceMoyennePonderee, index: number, texte: string): StatutVerification {
  const ligne = ligneAt(exercice, index);
  if (!ligne) return "parse_error";
  return statutValeurExacte(texte, ligne.x * ligne.n);
}

export function evaluerProduits(exercice: ExerciceMoyennePonderee, reponse: ReponseSommes): StatutVerification[] {
  const n = nombreLignes(exercice);
  return Array.from({ length: n }, (_, i) => diagnostiquerProduitLigne(exercice, i, reponse.produits[i] ?? ""));
}

export function diagnostiquerSommes(exercice: ExerciceMoyennePonderee, reponse: ReponseSommes): StatutSommes {
  return {
    produits: evaluerProduits(exercice, reponse),
    sommeXN: statutValeurExacte(reponse.sommeXN, exercice.sommeXN),
    sommeN: statutValeurExacte(reponse.sommeN, exercice.n),
  };
}

export function verifierSommes(exercice: ExerciceMoyennePonderee, reponse: ReponseSommes): boolean {
  if (reponse.produits.length !== nombreLignes(exercice)) return false;
  const statut = diagnostiquerSommes(exercice, reponse);
  return statut.produits.every((s) => s === "correct") && statut.sommeXN === "correct" && statut.sommeN === "correct";
}

// ============================================================================
// Écran "quotient" — 1 champ, calculé à partir des deux sommes déjà validées à l'écran "sommes"
// (jamais resaisies ici, toujours la vraie valeur confirmée).
// ============================================================================

export type ReponseQuotient = string;

export function diagnostiquerQuotient(exercice: ExerciceMoyennePonderee, texte: ReponseQuotient): StatutVerification {
  return statutValeurExacte(texte, exercice.moyenne);
}

export function verifierQuotient(exercice: ExerciceMoyennePonderee, texte: ReponseQuotient): boolean {
  return diagnostiquerQuotient(exercice, texte) === "correct";
}
