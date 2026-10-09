/**
 * Isolé de `evaluationPayload.ts` (fichier volumineux — générateurs, catalogues de variantes,
 * banques de questions ouvertes — en croissance à chaque chapitre migré) pour que
 * `ExerciseGeneratorSection.tsx` (rendu sur CHAQUE page de chapitre via `ChapterPage.tsx`, jamais
 * derrière un `React.lazy`) n'embarque dans le chunk principal que ces quelques constantes, pas
 * tout `evaluationPayload.ts` — ce dernier reste correctement derrière le lazy-loading
 * d'`AdminPage`/`ExercicePage`/`ChapterExercicePage` (voir `App.tsx`), mais un import direct
 * depuis un composant non-lazy l'aurait de toute façon tiré dans le chunk principal. `evaluationPayload.ts`
 * réexporte tout ceci tel quel — aucun import existant à changer ailleurs.
 */

export const LEVELSLUG_FONCTIONNEL_6E = '6e-6h'
/** 4e n'a pas de préfixe de chantier dans ses URL (voir `.claude/rules/content-authoring.md`,
 * convention de lien vers un générateur) — sa page `/evaluation` est donc à la racine. */
export const LEVELSLUG_FONCTIONNEL_4E = '4e'
export const LEVELSLUG_FONCTIONNEL_5E = '5e-4h'

/** Numéro de chapitre — utilisé UNIQUEMENT pour départager les banques vrai/faux d'une page
 * d'évaluation qui en sert plusieurs (`AppEvaluation6e.tsx` : 2 chapitres ; `AppEvaluation4e.tsx` :
 * 8 chapitres depuis ce lot) — voir `QuizThemeConfig.quizChapitre` dans `evaluationPayload.ts`. */
export type ChapitreFonctionnel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Conservé pour compat (chapitre par défaut à la sélection du niveau 6e) — préférer
 * `estChapitreFonctionnel` pour tester si UN chapitre donné est câblé. */
export const CHAPITRE_FONCTIONNEL_SLUG = 'fonctions-reciproques-cyclometriques'

/** Chapitres réellement câblés côté plateforme-maths, un (levelSlug, chapitreSlug) par entrée —
 * chaque chapitre a sa propre page d'évaluation chez plateforme-maths (URL différente selon le
 * niveau, voir `EVALUATION_BASE_URL_PAR_LEVELSLUG` dans `evaluationPayload.ts`). */
const CHAPITRES_FONCTIONNELS: { levelSlug: string; chapitreSlug: string }[] = [
  { levelSlug: LEVELSLUG_FONCTIONNEL_6E, chapitreSlug: 'fonctions-reciproques-cyclometriques' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_6E, chapitreSlug: 'fonctions-exponentielles' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_6E, chapitreSlug: 'fonctions-logarithmes' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'fonction-second-degre' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'equations-inequations-second-degre' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'caracteristiques-fonctions-reference' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'statistique-descriptive' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'cercle-trigonometrique-triangles' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'calcul-vectoriel' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'geometrie-analytique-plane' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_4E, chapitreSlug: 'geometrie-dans-espace' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_5E, chapitreSlug: 'fonctions-composees' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_5E, chapitreSlug: 'trigonometrie' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_5E, chapitreSlug: 'suites' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_5E, chapitreSlug: 'limites-asymptotes' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_5E, chapitreSlug: 'derivees-applications' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_6E, chapitreSlug: 'analyse-combinatoire' },
  { levelSlug: LEVELSLUG_FONCTIONNEL_6E, chapitreSlug: 'variables-aleatoires' },
]

export function estChapitreFonctionnel(levelSlug: string | null, chapitreSlug: string): boolean {
  return CHAPITRES_FONCTIONNELS.some((c) => c.levelSlug === levelSlug && c.chapitreSlug === chapitreSlug)
}
