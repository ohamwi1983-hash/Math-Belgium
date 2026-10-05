import { formatEtiquetteGrille } from "./mafsTransformation";

/** prompt-grille-pas-fractionnaires.md : 1/3 (0,333...) est une décimale périodique — même après
 * `formatEtiquetteGrille`, elle s'afficherait avec du bruit de virgule flottante (ex.
 * "0.3333333333") plutôt que la fraction exacte que représente ce pas. Rendue en fraction "1/3"
 * à la place. 1/2 (0,5), déjà un décimal propre, n'a besoin d'aucun traitement spécial — reste
 * affiché "0,5 unités" comme avant, seul 1/3 bénéficie de ce cas particulier. */
const VALEUR_TIERS = 1 / 3;

/** "1 unité" (singulier, exactement quand pas=1), "1/3 unité" (le seul autre cas singulier —
 * fraction, jamais "unités") ou "{pas} unités" (pluriel sinon, y compris pour un pas < 1 comme
 * 0,5) — même nettoyage du bruit de virgule flottante que les étiquettes d'axe
 * (`formatEtiquetteGrille`) pour le cas général, jamais une valeur reformatée indépendamment. */
function formatUnites(pas: number): string {
  if (pas === 1) return "1 unité";
  if (Math.abs(pas - VALEUR_TIERS) < 1e-6) return "1/3 unité";
  return `${formatEtiquetteGrille(pas)} unités`;
}

/**
 * Texte indiquant le pas actuel de la grille adaptative (`GrilleAdaptative`,
 * `src/components/mafsGraphPartage.tsx`), en complément des graduations numériques déjà présentes
 * sur les axes — affiché sous ou à côté du graphe, mis à jour en temps réel à chaque changement de
 * zoom (voir `onPasChange` de `GrilleAdaptative`). Les pas horizontal et vertical sont indiqués
 * **toujours séparément**, jamais unifiés en une seule mention même quand ils sont égaux : ils
 * peuvent différer (chaque axe choisit sa propre valeur "ronde" 1-2-5 indépendamment via
 * `calculerPasGrille`, à partir de spans qui diffèrent structurellement d'un facteur
 * `RATIO_GRAPHE` — le viewBox n'est jamais carré), donc le texte ne bascule jamais entre une forme
 * à une mention et une forme à deux mentions selon la valeur du zoom.
 */
export function formatIndicateurPasGrille(pasX: number, pasY: number): string {
  return `Horizontal : 1 carré = ${formatUnites(pasX)} — Vertical : 1 carré = ${formatUnites(pasY)}`;
}
