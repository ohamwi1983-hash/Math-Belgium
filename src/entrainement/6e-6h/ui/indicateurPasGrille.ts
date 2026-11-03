import { formatEtiquetteGrille } from "./mafsTransformation";

/** prompt-grille-pas-fractionnaires.md : 1/3 (0,333...) est une décimale périodique — même après
 * `formatEtiquetteGrille`, elle s'afficherait avec du bruit de virgule flottante (ex.
 * "0.3333333333") plutôt que la fraction exacte que représente ce pas. Rendue en fraction "1/3"
 * à la place. 1/2 (0,5), déjà un décimal propre, n'a besoin d'aucun traitement spécial — affiché
 * "0,5 unité", seul 1/3 bénéficie de ce cas particulier. */
const VALEUR_TIERS = 1 / 3;

/** Accord français : « unité » au singulier pour un pas strictement inférieur à 2 (1 unité,
 * 0,5 unité, 1/3 unité), « unités » à partir de 2 — même nettoyage du bruit de virgule flottante
 * (et même virgule décimale) que les étiquettes d'axe (`formatEtiquetteGrille`). */
function formatUnites(pas: number): string {
  const unite = pas < 2 ? "unité" : "unités";
  if (Math.abs(pas - VALEUR_TIERS) < 1e-6) return `1/3 ${unite}`;
  return `${formatEtiquetteGrille(pas)} ${unite}`;
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
