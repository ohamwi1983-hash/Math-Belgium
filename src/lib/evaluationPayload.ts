import type { Block, ChapterSection } from '../content/types'

/**
 * Pont vers le « Générateur d'évaluations » de plateforme-maths — /admin construit un payload
 * compact (identifiants seulement pour les exercices générés et le vrai/faux, plateforme-maths
 * ayant déjà ces données ; texte complet pour les questions ouvertes, dérivées ici du contenu déjà
 * écrit dans ce dépôt) et ouvre cette URL. Portée actuelle : seul 6e (6h), Chapitre 1 — Fonctions
 * réciproques & cyclométriques, est réellement câblé côté plateforme-maths (les autres
 * niveaux/chapitres restent sélectionnables dans le formulaire mais désactivés « bientôt »,
 * l'armature niveau/heures/chapitre étant pensée pour être générique dès ce lot).
 */

export const EVALUATION_BASE_URL_6E_6H = 'https://plateforme-maths.vercel.app/6e-6h/evaluation'
/** 4e n'a pas de préfixe de chantier dans ses URL (voir `.claude/rules/content-authoring.md`,
 * convention de lien vers un générateur) — sa page `/evaluation` est donc à la racine. */
export const EVALUATION_BASE_URL_4E = 'https://plateforme-maths.vercel.app/evaluation'
export const EVALUATION_BASE_URL_5E_4H = 'https://plateforme-maths.vercel.app/5e-4h/evaluation'

/** Niveau + nombre d'heures ne se combinent pas librement : seules ces 3 combinaisons existent
 * réellement dans les deux dépôts à ce jour (voir `LEVELS` dans `chaptersIndex.ts`). `null` = pas
 * encore de chantier plateforme-maths pour cette combinaison. */
export type NiveauCode = '4e' | '5e' | '6e'

export const HEURES_PAR_NIVEAU: Record<NiveauCode, string[]> = {
  '4e': [],
  '5e': ['4H', '5H', '6H'],
  '6e': ['4H', '5H', '6H'],
}

const NIVEAU_HEURES_VERS_LEVELSLUG: Record<string, string> = {
  '4e|': '4e',
  '5e|4H': '5e-4h',
  '6e|6H': '6e-6h',
}

export function resoudreLevelSlug(niveau: NiveauCode, heures: string): string | null {
  return NIVEAU_HEURES_VERS_LEVELSLUG[`${niveau}|${heures}`] ?? null
}

/** Inverse de `resoudreLevelSlug` — utilisé par `EvaluationGeneratorPanel` en mode verrouillé
 * (page `/{levelSlug}/{chapterSlug}/exercices`, voir `ChapterExercicePage.tsx`) pour retrouver le
 * `niveau`/`heures` à partir du seul `levelSlug` déjà connu de l'URL de la page de chapitre. */
export function resoudreNiveauHeures(levelSlug: string): { niveau: NiveauCode; heures: string } | null {
  for (const [cle, valeur] of Object.entries(NIVEAU_HEURES_VERS_LEVELSLUG)) {
    if (valeur === levelSlug) {
      const [niveau, heures] = cle.split('|')
      return { niveau: niveau as NiveauCode, heures }
    }
  }
  return null
}

/** Sert au bloc titre imprimé (« Classe : 4G..... », « 4ème » du pied de page) — jamais le
 * « nombre d'heures » du chantier plateforme-maths ci-dessus (notion indépendante, voir
 * `HEURES_SEMAINE_DEFAUT`). */
export const NIVEAU_NUMERO: Record<NiveauCode, number> = { '4e': 4, '5e': 5, '6e': 6 }

/** Volume horaire hebdomadaire par défaut affiché « Mathématiques {X}h/sem » — valeur observée sur
 * un modèle réel par niveau, modifiable dans le formulaire (une classe précise peut différer). Sans
 * rapport avec `HEURES_PAR_NIVEAU` ci-dessus : celui-ci détermine quel chantier plateforme-maths
 * (donc quels générateurs) est utilisé, celui-là n'est qu'un texte affiché sur la copie. */
export const HEURES_SEMAINE_DEFAUT: Record<NiveauCode, string> = { '4e': '5', '5e': '4', '6e': '6' }

/** Chapitres ayant un « générateur d'évaluations » fonctionnel côté plateforme-maths — les autres
 * apparaissent dans le sélecteur mais restent désactivés. */
export const LEVELSLUG_FONCTIONNEL_6E = '6e-6h'
export const LEVELSLUG_FONCTIONNEL_4E = '4e'
export const LEVELSLUG_FONCTIONNEL_5E = '5e-4h'

/** Numéro de chapitre — utilisé UNIQUEMENT pour départager les banques vrai/faux d'une page
 * d'évaluation qui en sert plusieurs (`AppEvaluation6e.tsx` : 2 chapitres ; `AppEvaluation4e.tsx` :
 * 8 chapitres depuis ce lot) — voir `QuizThemeConfig.quizChapitre`. */
export type ChapitreFonctionnel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

/** Conservé pour compat (chapitre par défaut à la sélection du niveau 6e) — préférer
 * `estChapitreFonctionnel` pour tester si UN chapitre donné est câblé. */
export const CHAPITRE_FONCTIONNEL_SLUG = 'fonctions-reciproques-cyclometriques'

/** Chapitres réellement câblés côté plateforme-maths, un (levelSlug, chapitreSlug) par entrée —
 * chaque chapitre a sa propre page d'évaluation chez plateforme-maths (URL différente selon le
 * niveau, voir `EVALUATION_BASE_URL_PAR_LEVELSLUG`). */
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
]

export function estChapitreFonctionnel(levelSlug: string | null, chapitreSlug: string): boolean {
  return CHAPITRES_FONCTIONNELS.some((c) => c.levelSlug === levelSlug && c.chapitreSlug === chapitreSlug)
}

const EVALUATION_BASE_URL_PAR_LEVELSLUG: Record<string, string> = {
  [LEVELSLUG_FONCTIONNEL_6E]: EVALUATION_BASE_URL_6E_6H,
  [LEVELSLUG_FONCTIONNEL_4E]: EVALUATION_BASE_URL_4E,
  [LEVELSLUG_FONCTIONNEL_5E]: EVALUATION_BASE_URL_5E_4H,
}

export type IdGenerateurPilote =
  | '6gen1' | '6gen2' | '6gen3' | '6gen4' | '6gen5' | '6gen6' | '6gen7' | '6gen8' | '6gen9' | '6gen10' | '6gen11' | '6gen12'
  | '6gen13' | '6gen14' | '6gen15' | '6gen16' | '6gen17' | '6gen18' | '6gen19' | '6gen20' | '6gen21' | '6gen22'
  | 'gen1' | 'gen2' | 'gen3' | 'gen4' | 'gen5' | 'gen6' | 'gen7' | 'gen8' | 'gen9' | 'gen10' | 'gen11' | 'gen12' | 'gen13'
  | 'gen30' | 'gen31' | 'gen32' | 'gen33' | 'gen34' | 'gen35' | 'gen36' | 'gen37' | 'gen38'
  | 'gen14' | 'gen15' | 'gen16' | 'gen17' | 'gen18' | 'gen19' | 'gen58'
  | 'gen20' | 'gen21' | 'gen22' | 'gen23' | 'gen24' | 'gen25' | 'gen26' | 'gen27' | 'gen28' | 'gen29'
  | 'gen42' | 'gen43' | 'gen44' | 'gen45' | 'gen46' | 'gen47' | 'gen48' | 'gen49' | 'gen50' | 'gen51' | 'gen52' | 'gen53' | 'gen54'
  | 'gen39' | 'gen40' | 'gen41'
  | '5gen1' | '5gen2' | '5gen3' | '5gen4' | '5gen5'
  | '5gen6' | '5gen7' | '5gen8' | '5gen9' | '5gen10' | '5gen11' | '5gen12' | '5gen13'
  | '5gen14' | '5gen15' | '5gen16' | '5gen17' | '5gen18' | '5gen19'
  | '5gen20' | '5gen21' | '5gen22' | '5gen23' | '5gen24'
  | '5gen25' | '5gen26' | '5gen27' | '5gen28' | '5gen29' | '5gen30' | '5gen31' | '5gen32' | '5gen33' | '5gen34' | '5gen35'

export interface GeneratorConfig {
  chapitreSlug: string
  sectionId: string
  generatorId: IdGenerateurPilote
  /** Affiché au-dessus du catalogue de variantes quand une section a PLUSIEURS générateurs (ex.
   * chapitre 1 de 4e, section « Transformer » : gen8 ET gen9) — ignoré (un seul générateur, pas
   * besoin de le nommer) sinon. */
  label: string
  /** Processus par défaut de la ligne créée pour ce générateur (voir `lignesInitiales`,
   * `EvaluationGeneratorPanel.tsx`) — `2` (Appliquer) si absent, la valeur historique de tous les
   * générateurs avant l'introduction de ce champ. Un générateur peut relever du processus 3
   * (Transférer) plutôt que 2 quand l'exercice mobilise plusieurs notions combinées au lieu
   * d'appliquer une procédure isolée (ex. 6gen5, chapitre 1 de 6e 6h). */
  processus?: Processus
}

export interface QuizThemeConfig {
  chapitreSlug: string
  sectionId: string
  quizTheme: string
  label: string
  /** Réservé aux chapitres servis par `AppEvaluation6e.tsx` (2 banques sur la même page) — voir
   * `CHAPITRE_NUMERO`. Absent pour 4e (une seule banque sur sa propre page). */
  quizChapitre?: ChapitreFonctionnel
}

/** Correspondance section Math-Belgium ↔ générateur(s) plateforme-maths — établie à la main,
 * chapitre par chapitre. Une section peut avoir PLUSIEURS générateurs (ex. chapitre 1 de 4e,
 * section « Transformer » : gen8 ET gen9) — chaque ligne devient sa propre ligne d'exercice dans
 * le formulaire /admin, jamais fusionnée. Scopée par `chapitreSlug` : le chapitre 2 de 6e a lui
 * aussi une section `sectionId: 'equations'` (équations exponentielles, 6gen9) qui entrerait
 * sinon en collision avec celle du chapitre 1 (équations cyclométriques, 6gen3) — toute recherche
 * dans cette table DOIT filtrer sur les deux clés, jamais `sectionId` seul. */
export const GENERATEURS_EVALUATION_PILOTE: GeneratorConfig[] = [
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'reciproques', generatorId: '6gen1', label: '' },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'cyclometriques', generatorId: '6gen2', label: '' },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'equations', generatorId: '6gen3', label: '' },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'derivees', generatorId: '6gen4', label: '' },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'graphiques', generatorId: '6gen5', label: '', processus: 3 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'limites', generatorId: '6gen6', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'derivee', generatorId: '6gen7', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'graphique', generatorId: '6gen8', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'equations', generatorId: '6gen9', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'inequations', generatorId: '6gen10', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'etude', generatorId: '6gen11', label: '' },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'problemes', generatorId: '6gen12', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'proprietes', generatorId: '6gen13', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'equations', generatorId: '6gen14', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'inequations', generatorId: '6gen15', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'derivee', generatorId: '6gen16', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'limites', generatorId: '6gen17', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'parametres', generatorId: '6gen18', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'hyperboliques', generatorId: '6gen19', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'graphique', generatorId: '6gen20', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'etude', generatorId: '6gen21', label: '' },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'problemes', generatorId: '6gen22', label: '' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'etudier', generatorId: 'gen7', label: "Analyse d'une fonction (gen7)" },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'transformer', generatorId: 'gen8', label: 'Transformations graphiques (gen8)' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'transformer', generatorId: 'gen9', label: 'Forme canonique et transformations (gen9)' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', generatorId: 'gen1', label: '' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'signe-trinome', generatorId: 'gen2', label: '' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'simplifier', generatorId: 'gen3', label: '' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'inconnue-denominateur', generatorId: 'gen4', label: '' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'signe-produit', generatorId: 'gen5', label: '' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'inequations-rationnelles', generatorId: 'gen6', label: '' },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'lire', generatorId: 'gen12', label: '' },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', generatorId: 'gen13', label: '' },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'transformer', generatorId: 'gen10', label: 'Transformations graphiques (gen10)' },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'transformer', generatorId: 'gen11', label: 'Forme canonique et transformations (gen11)' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'frequences', generatorId: 'gen30', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'histogramme', generatorId: 'gen31', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'moyenne', generatorId: 'gen32', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'position', generatorId: 'gen33', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'dispersion', generatorId: 'gen34', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'boite', generatorId: 'gen36', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'tchebychev', generatorId: 'gen37', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'comparaison', generatorId: 'gen38', label: '' },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'revision', generatorId: 'gen35', label: '', processus: 3 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'cercle', generatorId: 'gen14', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'remarquables', generatorId: 'gen15', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'identite', generatorId: 'gen16', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'associes', generatorId: 'gen17', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'equations', generatorId: 'gen18', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'triangle', generatorId: 'gen19', label: '' },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'triangulation', generatorId: 'gen58', label: '', processus: 3 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'relation', generatorId: 'gen20', label: "Point via translation/milieu (gen20)" },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'relation', generatorId: 'gen21', label: 'Relation vectorielle générale (gen21)' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'multiplicationReperes', generatorId: 'gen22', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'multiplicationGeometrique', generatorId: 'gen23', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'colinearite', generatorId: 'gen24', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'orthogonalite', generatorId: 'gen25', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'norme', generatorId: 'gen26', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'chasles', generatorId: 'gen27', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'comparaison', generatorId: 'gen28', label: '' },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'applications', generatorId: 'gen29', label: '', processus: 3 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'reperer', generatorId: 'gen42', label: '' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lire-tracer', generatorId: 'gen43', label: 'Lecture graphique (gen43)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lire-tracer', generatorId: 'gen44', label: 'Construction graphique (gen44)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'caracteristiques', generatorId: 'gen46', label: '' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'relations', generatorId: 'gen45', label: '' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'intersection', generatorId: 'gen48', label: '' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'distance', generatorId: 'gen47', label: '' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'cercle', generatorId: 'gen49', label: 'Forme graphique (gen49)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'cercle', generatorId: 'gen50', label: 'Forme développée (gen50)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', generatorId: 'gen51', label: 'Forme graphique (gen51)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', generatorId: 'gen52', label: 'Forme développée (gen52)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', generatorId: 'gen53', label: 'Construction (gen53)' },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lieux', generatorId: 'gen54', label: '', processus: 3 },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'position', generatorId: 'gen39', label: '' },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'section', generatorId: 'gen40', label: '' },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'ombre', generatorId: 'gen41', label: '' },
  { chapitreSlug: 'fonctions-composees', sectionId: 'domaine', generatorId: '5gen1', label: '' },
  { chapitreSlug: 'fonctions-composees', sectionId: 'decomposer', generatorId: '5gen2', label: '' },
  { chapitreSlug: 'fonctions-composees', sectionId: 'composer', generatorId: '5gen3', label: '' },
  { chapitreSlug: 'fonctions-composees', sectionId: 'graphique', generatorId: '5gen4', label: '' },
  { chapitreSlug: 'fonctions-composees', sectionId: 'contexte', generatorId: '5gen5', label: '', processus: 3 },
  { chapitreSlug: 'trigonometrie', sectionId: 'arcs-secteurs', generatorId: '5gen6', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'polygones', generatorId: '5gen7', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'geometrie-cercle', generatorId: '5gen12', label: '', processus: 3 },
  { chapitreSlug: 'trigonometrie', sectionId: 'parametres', generatorId: '5gen8', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'lecture-graphique', generatorId: '5gen9', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'extremums', generatorId: '5gen11', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'modeliser', generatorId: '5gen13', label: '' },
  { chapitreSlug: 'trigonometrie', sectionId: 'equations', generatorId: '5gen10', label: '' },
  { chapitreSlug: 'suites', sectionId: 'suites-arithmetiques', generatorId: '5gen14', label: '' },
  { chapitreSlug: 'suites', sectionId: 'suites-geometriques', generatorId: '5gen15', label: '' },
  { chapitreSlug: 'suites', sectionId: 'convergence', generatorId: '5gen16', label: '' },
  { chapitreSlug: 'suites', sectionId: 'problemes-classiques', generatorId: '5gen17', label: '' },
  { chapitreSlug: 'suites', sectionId: 'comparaison-suites', generatorId: '5gen18', label: '' },
  { chapitreSlug: 'suites', sectionId: 'recurrente-affine', generatorId: '5gen19', label: '' },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'limites-calcul', generatorId: '5gen20', label: '' },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'asymptote-oblique', generatorId: '5gen21', label: '' },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'lecture-graphique', generatorId: '5gen22', label: '' },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'limites-contexte', generatorId: '5gen23', label: '' },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'etude-complete', generatorId: '5gen24', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'signe-derivees', generatorId: '5gen25', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'definition-derivee', generatorId: '5gen26', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'fonction-derivee', generatorId: '5gen27', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'tangentes', generatorId: '5gen28', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'etude-locale', generatorId: '5gen29', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'lecture-graphique-derivees', generatorId: '5gen30', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'etudier-fonction', generatorId: '5gen31', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'optimisation-geometrique', generatorId: '5gen32', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'contexte-economique', generatorId: '5gen33', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'extrema-bornes', generatorId: '5gen34', label: '' },
  { chapitreSlug: 'derivees-applications', sectionId: 'vitesse-position', generatorId: '5gen35', label: '' },
]

/** Correspondance section Math-Belgium ↔ thème(s) de la banque vrai/faux plateforme-maths — même
 * principe que `GENERATEURS_EVALUATION_PILOTE` (une section peut avoir plusieurs thèmes, ex.
 * chapitre 1 de 4e : 3 thèmes pour « Étudier », 2 pour « Transformer »), scopée par `chapitreSlug`
 * pour la même raison. */
export const QUIZ_THEMES_EVALUATION_PILOTE: QuizThemeConfig[] = [
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'reciproques', quizTheme: 'injectiviteSurjectiviteBijectivite', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'cyclometriques', quizTheme: 'fonctionsCyclometriques', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'equations', quizTheme: 'equationsCyclometriques', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'derivees', quizTheme: 'deriveesCyclometriques', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-reciproques-cyclometriques', sectionId: 'graphiques', quizTheme: 'graphiquesCyclometriques', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'limites', quizTheme: 'limitesExponentielles', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'derivee', quizTheme: 'domaineDeriveeExponentielles', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'graphique', quizTheme: 'graphiquesDeriveeExponentielles', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'equations', quizTheme: 'equationsExponentielles', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'inequations', quizTheme: 'inequationsExponentielles', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'etude', quizTheme: 'etudeFonctionExponentielle', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-exponentielles', sectionId: 'problemes', quizTheme: 'exponentiellesProblemes', label: '', quizChapitre: 2 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'proprietes', quizTheme: 'proprietesLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'equations', quizTheme: 'equationsExpLog', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'inequations', quizTheme: 'inequationsLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'derivee', quizTheme: 'domaineDeriveeLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'limites', quizTheme: 'limitesLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'parametres', quizTheme: 'parametresGraphiques', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'hyperboliques', quizTheme: 'sinusCosinusHyperboliques', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'graphique', quizTheme: 'graphiqueDeriveeLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'etude', quizTheme: 'etudeFonctionLogarithme', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonctions-logarithmes', sectionId: 'problemes', quizTheme: 'logarithmesProblemes', label: '', quizChapitre: 3 },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'etudier', quizTheme: 'coefficientsAllure', label: 'Coefficients, concavité et allure' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'etudier', quizTheme: 'racinesFactorisation', label: 'Racines par factorisation' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'etudier', quizTheme: 'domaineImageTableaux', label: 'Domaine, image et tableaux' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'transformer', quizTheme: 'formeCanoniqueSommet', label: 'Forme canonique, sommet et axe' },
  { chapitreSlug: 'fonction-second-degre', sectionId: 'transformer', quizTheme: 'transformationsGraphiques', label: 'Transformations graphiques' },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'vocabulaire', label: 'Vocabulaire', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'sansDiscriminant', label: 'Sans discriminant', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'discriminant', label: 'Discriminant', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'demonstration', label: 'Démonstration', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'sommeProduitRacines', label: 'Somme et produit des racines', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'resoudre', quizTheme: 'factorisationGenerale', label: 'Factorisation générale', quizChapitre: 2 },
  { chapitreSlug: 'equations-inequations-second-degre', sectionId: 'signe-trinome', quizTheme: 'inequations', label: '', quizChapitre: 2 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'lire', quizTheme: 'vocabulaire', label: 'Vocabulaire', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', quizTheme: 'sixFonctions', label: 'Les 6 fonctions de référence', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', quizTheme: 'carreCube', label: 'Carré et cube', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', quizTheme: 'racines', label: 'Racines carrée et cubique', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', quizTheme: 'inverse', label: 'Inverse', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'algebrique', quizTheme: 'valeurAbsolue', label: 'Valeur absolue', quizChapitre: 3 },
  { chapitreSlug: 'caracteristiques-fonctions-reference', sectionId: 'transformer', quizTheme: 'transformations', label: '', quizChapitre: 3 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'frequences', quizTheme: 'effectifsFrequences', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'histogramme', quizTheme: 'graphiques', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'moyenne', quizTheme: 'moyenne', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'position', quizTheme: 'medianeQuartiles', label: 'Médiane et quartiles', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'position', quizTheme: 'mode', label: 'Mode', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'boite', quizTheme: 'boiteMoustaches', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'dispersion', quizTheme: 'dispersion', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'tchebychev', quizTheme: 'bienaymeTchebychev', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'comparaison', quizTheme: 'comparaisonSeries', label: '', quizChapitre: 4 },
  { chapitreSlug: 'statistique-descriptive', sectionId: 'revision', quizTheme: 'vocabulaire', label: 'Vocabulaire', quizChapitre: 4 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'cercle', quizTheme: 'placementCercle', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'remarquables', quizTheme: 'valeursRemarquables', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'identite', quizTheme: 'identiteFondamentale', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'associes', quizTheme: 'anglesAssocies', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'equations', quizTheme: 'resoudreAngle', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'triangle', quizTheme: 'triangleQuelconque', label: '', quizChapitre: 5 },
  { chapitreSlug: 'cercle-trigonometrique-triangles', sectionId: 'triangulation', quizTheme: 'trianglesLies', label: '', quizChapitre: 5 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'relation', quizTheme: 'relationVectorielle', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'multiplicationReperes', quizTheme: 'combinaisonLineaire', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'multiplicationGeometrique', quizTheme: 'constructionGraphique', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'colinearite', quizTheme: 'colinearite', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'orthogonalite', quizTheme: 'orthogonalite', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'norme', quizTheme: 'normeDistance', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'chasles', quizTheme: 'chasles', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'comparaison', quizTheme: 'comparaisonVisuelle', label: '', quizChapitre: 6 },
  { chapitreSlug: 'calcul-vectoriel', sectionId: 'applications', quizTheme: 'applicationsPhysiques', label: '', quizChapitre: 6 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'reperer', quizTheme: 'equationDroite', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lire-tracer', quizTheme: 'lectureGraphiqueDroite', label: 'Lecture graphique', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lire-tracer', quizTheme: 'constructionDroite', label: 'Construction graphique', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'caracteristiques', quizTheme: 'caracteristiquesDroite', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'relations', quizTheme: 'relationsDroites', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'intersection', quizTheme: 'intersectionDroites', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'distance', quizTheme: 'distancePointDroite', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'cercle', quizTheme: 'equationCercleGraphe', label: 'Forme graphique', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'cercle', quizTheme: 'centreRayonCercle', label: 'Centre et rayon', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', quizTheme: 'equationParaboleGraphe', label: 'Forme graphique', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', quizTheme: 'sommetFoyerParabole', label: 'Sommet et foyer', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'parabole', quizTheme: 'constructionParabole', label: 'Construction', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-analytique-plane', sectionId: 'lieux', quizTheme: 'lieuxGeometriques', label: '', quizChapitre: 7 },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'position', quizTheme: 'positionDroitePlan', label: '', quizChapitre: 8 },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'section', quizTheme: 'sectionPlaneSolide', label: '', quizChapitre: 8 },
  { chapitreSlug: 'geometrie-dans-espace', sectionId: 'ombre', quizTheme: 'ombreSoleil', label: '', quizChapitre: 8 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'domaine', quizTheme: 'vocabulaire', label: 'Vocabulaire', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'domaine', quizTheme: 'domaineRationnel', label: 'Domaine — fonctions rationnelles', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'domaine', quizTheme: 'domaineRacines', label: 'Domaine — racines', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'decomposer', quizTheme: 'decomposition', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'composer', quizTheme: 'composition', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'graphique', quizTheme: 'lectureGraphique', label: '', quizChapitre: 1 },
  { chapitreSlug: 'fonctions-composees', sectionId: 'contexte', quizTheme: 'problemesContexte', label: '', quizChapitre: 1 },
  { chapitreSlug: 'trigonometrie', sectionId: 'arcs-secteurs', quizTheme: 'arcsEtSecteurs', label: '', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'parametres', quizTheme: 'parametresSinusoide', label: '', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'lecture-graphique', quizTheme: 'graphesSinusoides', label: '', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'equations', quizTheme: 'equationsTrigonometriques', label: 'Équations trigonométriques', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'equations', quizTheme: 'identitesEtFactorisation', label: 'Identités et factorisation', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'extremums', quizTheme: 'extremumsSinusoide', label: '', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'geometrie-cercle', quizTheme: 'geometrieEtModelisation', label: '', quizChapitre: 2 },
  { chapitreSlug: 'trigonometrie', sectionId: 'modeliser', quizTheme: 'geometrieEtModelisation', label: '', quizChapitre: 2 },
  { chapitreSlug: 'suites', sectionId: 'suites-arithmetiques', quizTheme: 'suitesArithmetiques', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'suites-geometriques', quizTheme: 'suitesGeometriques', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'convergence', quizTheme: 'convergenceDivergence', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'problemes-classiques', quizTheme: 'problemesClassiques', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'comparaison-suites', quizTheme: 'comparaisonNumerique', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'recurrente-affine', quizTheme: 'suiteRecurrenteAffine', label: '', quizChapitre: 3 },
  { chapitreSlug: 'suites', sectionId: 'recurrente-affine', quizTheme: 'transversal', label: 'Transversal (tout le chapitre)', quizChapitre: 3 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'limites-calcul', quizTheme: 'reconnaissanceEtCalcul', label: '', quizChapitre: 4 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'asymptote-oblique', quizTheme: 'asymptoteOblique', label: '', quizChapitre: 4 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'lecture-graphique', quizTheme: 'lectureGraphique', label: '', quizChapitre: 4 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'limites-contexte', quizTheme: 'limitesEnContexte', label: '', quizChapitre: 4 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'etude-complete', quizTheme: 'etudeComplete', label: '', quizChapitre: 4 },
  { chapitreSlug: 'limites-asymptotes', sectionId: 'etude-complete', quizTheme: 'piegesClassiques', label: 'Pièges classiques', quizChapitre: 4 },
  { chapitreSlug: 'derivees-applications', sectionId: 'signe-derivees', quizTheme: 'reconnaissanceGraphique', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'definition-derivee', quizTheme: 'calculParDefinition', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'fonction-derivee', quizTheme: 'fonctionDerivee', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'tangentes', quizTheme: 'tangentes', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'etude-locale', quizTheme: 'etudeLocaleEtGraphique', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'lecture-graphique-derivees', quizTheme: 'etudeLocaleEtGraphique', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'etudier-fonction', quizTheme: 'etudeComplete', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'optimisation-geometrique', quizTheme: 'applicationsEnContexte', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'contexte-economique', quizTheme: 'applicationsEnContexte', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'extrema-bornes', quizTheme: 'applicationsEnContexte', label: '', quizChapitre: 5 },
  { chapitreSlug: 'derivees-applications', sectionId: 'vitesse-position', quizTheme: 'applicationsEnContexte', label: '', quizChapitre: 5 },
]

export function generateursPourSection(chapitreSlug: string, sectionId: string): GeneratorConfig[] {
  return GENERATEURS_EVALUATION_PILOTE.filter((g) => g.chapitreSlug === chapitreSlug && g.sectionId === sectionId)
}

export function themesPourSection(chapitreSlug: string, sectionId: string): QuizThemeConfig[] {
  return QUIZ_THEMES_EVALUATION_PILOTE.filter((t) => t.chapitreSlug === chapitreSlug && t.sectionId === sectionId)
}

export interface CatalogueVarianteEntree {
  id: string
  label: string
}

/** Catalogues des familles/variantes forçables par générateur — MIROIR MANUEL des
 * `CATALOGUE_FAMILLES`/`CATALOGUE_VARIANTES` définis côté plateforme-maths
 * (`generateurs6e/{nom}/index.ts`, convention "Catalogue de variantes" documentée dans son
 * CLAUDE.md) : les `id` doivent rester EXACTEMENT synchronisés avec ceux-là (aucun code partagé
 * entre les deux dépôts) — un id qui ne correspond à aucune variante connue côté plateforme-maths
 * ferait simplement échouer silencieusement la génération de cette ligne. Permet au formulaire
 * /admin de choisir un nombre d'exercices PAR FAMILLE plutôt qu'un total tiré au hasard parmi
 * toutes les familles. */
export const CATALOGUES_VARIANTES_EXERCICE: Record<IdGenerateurPilote, CatalogueVarianteEntree[]> = {
  '6gen1': [
    { id: 'puissanceAffine', label: '(ax+b)^n' },
    { id: 'racineNieme', label: '(ax+b)^(1/n)' },
    { id: 'puissanceMonome', label: 'a·xⁿ+b' },
    { id: 'racinePlusConstante', label: '√(ax+b)+c' },
    { id: 'homographique', label: '(ax+b)/(cx+d)' },
    { id: 'quadratique', label: 'ax²+bx+c' },
  ],
  '6gen2': [
    { id: 'directe', label: 'Lecture directe' },
    { id: 'arcTrig_existe', label: 'arcfonction(trig(θ)) — existe' },
    { id: 'arcTrig_inexistant', label: "arcfonction(trig(θ)) — n'existe pas" },
    { id: 'trigArc_existe', label: 'trig(arcfonction(n)) — existe' },
    { id: 'trigArc_causeDomaine', label: 'trig(arcfonction(n)) — cause hors domaine' },
    { id: 'trigArc_causePiSur2', label: 'trig(arcfonction(n)) — cause angle π/2' },
  ],
  '6gen3': [
    { id: 'angleLineaire', label: 'arcfonction(ax+b) = angle' },
    { id: 'memeArcfonction', label: 'arcfonction(ax+b) = arcfonction(cx+d)' },
    { id: 'angleQuadratique', label: 'arcfonction(ax²+bx+c) = angle' },
    { id: 'arcfonctionsDifferentes_asin_acos', label: 'arcsin(ax+b) = arccos(cx+d)' },
    { id: 'arcfonctionsDifferentes_asin_atan', label: 'arcsin(ax+b) = arctan(cx+d)' },
    { id: 'arcfonctionsDifferentes_acos_atan', label: 'arccos(ax+b) = arctan(cx+d)' },
  ],
  '6gen4': [
    { id: 'A', label: 'Application directe' },
    { id: 'B', label: 'Règle du produit' },
    { id: 'C', label: 'Règle du quotient, sans identité' },
    { id: 'D', label: 'Quotient avec identité arcsin+arccos=π/2' },
    { id: 'E', label: 'Composition imbriquée, sans identité' },
    { id: 'F', label: 'Composition imbriquée + identité trigonométrique' },
    { id: 'G', label: 'Réciproque vs argument-fraction' },
  ],
  '6gen5': [
    { id: 'A', label: 'A. arcsin/arccos, argument linéaire' },
    { id: 'B', label: 'B. arctan, argument linéaire' },
    { id: 'C', label: 'C. Argument en x² (fonction paire)' },
    { id: 'D', label: 'D. arctan(k/(x-p)), point exclu isolé' },
    { id: 'E', label: "E. Racine d'une expression affine en arcfonction(x)" },
    { id: 'F', label: 'F. Carré d\'une arcfonction affine, décalé' },
  ],
  '6gen6': [
    { id: 'A', label: 'A — Limite directe' },
    { id: 'B', label: 'B — Somme, terme exponentiel dominant' },
    { id: 'C', label: 'C — Produit, FI ∞·0' },
    { id: 'G', label: 'G — ∞−∞ avancée (instance unique)' },
    { id: 'H', label: "H — L'Hôpital, 0/0 pur exponentiel" },
    { id: 'I', label: "I — L'Hôpital, 0/0 mixte trigonométrique" },
    { id: 'J', label: "J — L'Hôpital, 0/0 mixte arcfonction" },
    { id: 'K', label: "K — L'Hôpital, deux applications" },
    { id: 'L', label: 'L — FI 1^∞ via pivot e' },
    { id: 'N', label: 'N — FI ∞^0/0^0 via loi des puissances' },
  ],
  '6gen7': [
    { id: 'A', label: 'A — Application directe' },
    { id: 'B', label: 'B — Exposant à domaine restreint' },
    { id: 'C', label: 'C — Produit avec terme exponentiel' },
    { id: 'D', label: 'D — Quotient avec terme exponentiel' },
    { id: 'E', label: 'E — Simplifier avant de dériver' },
    { id: 'F', label: 'F — Composition triple (trig/cyclométrique)' },
  ],
  '6gen8': [
    { id: 'A', label: "A. Dérivée d'un produit simple" },
    { id: 'B', label: "B. Dérivée d'un quotient logistique" },
    { id: 'C', label: "C. Dérivée d'une somme symétrique" },
    { id: 'D', label: "D. Dérivée d'une réciproque, point exclu" },
  ],
  '6gen9': [
    { id: 'A1', label: 'A1 — Même base, direct' },
    { id: 'A2', label: 'A2 — Même base, avec racine' },
    { id: 'A3', label: 'A3 — Même base, second degré en x' },
    { id: 'B', label: 'B — √(baseᵘ)=baseᵛ (∅ possible)' },
    { id: 'C-direct', label: 'C — Changement de variable (présentation directe)' },
    { id: 'C-carreDeguise', label: 'C — Changement de variable (base² déguisée)' },
    { id: 'C-regroupement', label: 'C — Changement de variable (regroupement de coefficient)' },
    { id: 'D1', label: 'D1 — c·baseᶠ⁽ˣ⁾=0, toujours ∅' },
    { id: 'D2', label: 'D2 — somme de puissances +k=0, toujours ∅' },
  ],
  '6gen10': [
    { id: 'A', label: 'A — Même base, sens préservé/inversé' },
    { id: 'B', label: 'B — Toujours ∅' },
    { id: 'C-f', label: 'C — Toujours ℝ (produit de signes coïncidents)' },
    { id: 'C-k', label: 'C — Toujours ℝ (regroupement, discriminant négatif)' },
    { id: 'D-constant', label: 'D — Produit, 1 facteur à signe constant' },
    { id: 'D-variable', label: 'D — Produit, 2 facteurs variables (tableau de signes)' },
    { id: 'E', label: 'E — Bases différentes, même exposant' },
  ],
  '6gen11': [
    { id: 'A', label: 'A. Exponentielle simple, e^(mx+n)' },
    { id: 'B', label: 'B. Point exclu, asymptote asymétrique' },
    { id: 'C', label: 'C. Asymptote oblique' },
    { id: 'D', label: 'D. Produit a·x·eˣ (réutilise 6gen8)' },
  ],
  '6gen12': [
    { id: 'A', label: 'A — Évaluer/résoudre Q(t)=Q0·r^t' },
    { id: 'B', label: 'B — Modèle complémentaire (asymptote-objectif)' },
    { id: 'C', label: 'C — 2 points, taux inconnu' },
    { id: 'D', label: 'D — Asymptote non nulle, 3 points' },
    { id: 'E', label: 'E — Optimisation puissance×exponentielle' },
    { id: 'F', label: 'F — Saturation donnée, coûts/revenus' },
    { id: 'G', label: 'G — Seuil critique, décision' },
  ],
  '6gen13': [
    { id: 'produit', label: 'Produit — log_a(M·N)' },
    { id: 'quotient', label: 'Quotient — log_a(M/N)' },
    { id: 'puissance', label: 'Puissance — log_a(M^p)' },
    { id: 'racine', label: 'Racine — log_a(ᵏ√N)' },
    { id: 'compose', label: 'Composé — 2 propriétés' },
  ],
  '6gen14': [
    { id: 'A', label: 'A — base^(mx+n)=C, log direct ou superflu' },
    { id: 'B', label: 'B — bases différentes, ln des deux membres' },
    { id: 'C', label: 'C — t-substitution, second degré' },
    { id: 'D', label: 'D — log_x(N)=k / log_a(x)=k' },
    { id: 'E', label: 'E — combiner des logs, rejet CE' },
    { id: 'F', label: 'F — changement de base' },
    { id: 'G', label: 'G — toujours vrai / toujours faux' },
  ],
  '6gen15': [
    { id: 'A-sup1', label: 'A — log_base(u) R k (base>1)' },
    { id: 'A-inf1', label: 'A — log_base(u) R k (base<1)' },
    { id: 'B-direct-sup1', label: 'B — comparaison directe, affine (base>1)' },
    { id: 'B-direct-inf1', label: 'B — comparaison directe, affine (base<1)' },
    { id: 'B-racine-sup1', label: 'B — comparaison directe, avec racine (base>1)' },
    { id: 'B-racine-inf1', label: 'B — comparaison directe, avec racine (base<1)' },
    { id: 'C-produit-sup1', label: 'C — combiner en produit (base>1)' },
    { id: 'C-produit-inf1', label: 'C — combiner en produit (base<1)' },
    { id: 'C-quotient-sup1', label: 'C — combiner en quotient (base>1)' },
    { id: 'C-quotient-inf1', label: 'C — combiner en quotient (base<1)' },
    { id: 'D-sup1', label: 'D — quadratique en y=log_base(x) (base>1)' },
    { id: 'D-inf1', label: 'D — quadratique en y=log_base(x) (base<1)' },
    { id: 'E', label: 'E — domaine vide par construction' },
    { id: 'F', label: 'F — base paramétrique a, split a>1/0<a<1' },
  ],
  '6gen16': [
    { id: 'A', label: 'A — Application directe' },
    { id: 'B', label: 'B — Domaine via racine/quadratique' },
    { id: 'C', label: 'C — Produit avec terme logarithmique' },
    { id: 'D', label: 'D — Quotient avec terme logarithmique' },
    { id: 'E', label: 'E — Simplifier avant de dériver' },
    { id: 'F', label: 'F — Synthèse transversale' },
    { id: 'G', label: 'G — Dérivation logarithmique implicite' },
  ],
  '6gen17': [
    { id: 'A-sous1', label: 'A1 — k·ln(x)/P(x) → 0' },
    { id: 'A-sous2', label: 'A2 — baseˣ/P(x), x→±∞' },
    { id: 'A-sous3', label: 'A3 — quotient de logs (bases différentes)' },
    { id: 'A-sous4', label: 'A4 — même polynôme dominant → 1' },
    { id: 'A-sous5', label: 'A5 — mélange poly/exponentielle → 0' },
    { id: 'B-quotient', label: 'B1 — quotient de logs (base→1)' },
    { id: 'B-produit', label: 'B2 — produit (x−x0)·log(k)' },
    { id: 'C-c1', label: 'C1 — log_x(x+c), x→1±' },
    { id: 'C-c2', label: 'C2 — x·baseˣ(c/x), ∞×constante' },
    { id: 'C-c3', label: 'C3 — numérateur ne s\'annule pas' },
    { id: 'D', label: 'D — forme 1^∞ (e^(g·ln f))' },
    { id: 'E', label: 'E — cas avancé (instance unique)' },
  ],
  '6gen18': [
    { id: 'A_ordonnee', label: "A — Asymptote + ordonnée à l'origine" },
    { id: 'A_point', label: 'A — Asymptote + point de passage' },
    { id: 'B', label: 'B — 2 racines + point de passage' },
    { id: 'C', label: 'C — Conditions pour un extremum' },
  ],
  '6gen19': [
    { id: 'A_shKx', label: 'A — sh(kx) [impaire]' },
    { id: 'A_chKx', label: 'A — ch(kx) [paire]' },
    { id: 'A_shChProduit', label: 'A — sh(x)·ch(x) [impaire]' },
    { id: 'A_shCarre', label: 'A — sh(x)² [PAIRE — piège]' },
    { id: 'A_chCarre', label: 'A — ch(x)² [paire]' },
    { id: 'A_shPlusCh', label: "A — sh(x)+ch(x) [ni l'une ni l'autre]" },
    { id: 'A_shMoinsCh', label: "A — sh(x)−ch(x) [ni l'une ni l'autre]" },
    { id: 'B_trouverCh', label: 'B — donné sh, trouver ch (1 valeur)' },
    { id: 'B_trouverShSansSigne', label: 'B — donné ch, trouver sh (signe non précisé, 2 valeurs)' },
    { id: 'B_trouverShSignePlus', label: 'B — donné ch, trouver sh (x0>0, 1 valeur)' },
    { id: 'B_trouverShSigneMoins', label: 'B — donné ch, trouver sh (x0<0, 1 valeur)' },
    { id: 'C', label: 'C — Dérivée et dérivée seconde de a·sh(kx)+b·ch(kx)' },
    { id: 'D', label: 'D — Limites en ±∞ de a·sh(x)+b·ch(x)' },
  ],
  '6gen20': [
    { id: 'A', label: 'A. Dérivée de k·log_base(x)/x' },
    { id: 'B', label: 'B. Dérivée de k·eˣ·ln(x)' },
    { id: 'C', label: 'C. Dérivée de k·x·ln(x)' },
  ],
  '6gen21': [
    { id: 'A', label: 'A. x^(ax), dérivation logarithmique' },
    { id: 'B', label: 'B. x^(k/x), dérivation logarithmique' },
    { id: 'C', label: 'C. ln|k²-x²|, domaine élargi par |.|' },
    { id: 'D', label: 'D. x+c·e^(-x), asymptote oblique' },
    { id: 'E', label: 'E. Oscillation amortie/amplifiée (2 écrans)' },
  ],
  '6gen22': [
    { id: 'A-resoudreT-simple', label: 'A1 — Résoudre pour t (seuil simple)' },
    { id: 'A-resoudreT-fenetre', label: 'A1 — Résoudre pour t (fenêtre, 2 seuils)' },
    { id: 'A-resoudreTaux', label: 'A2 — Résoudre pour le taux (racine n-ième)' },
    { id: 'A-tauxDecroissance', label: 'A3 — Taux depuis un point de décroissance' },
    { id: 'B', label: 'B — Modèle à 2 points, extrapolation' },
    { id: 'C-versT', label: 'C — Demi-vie (λ donné, trouver T)' },
    { id: 'C-versLambda', label: 'C — Demi-vie (T donné, trouver λ)' },
    { id: 'D', label: 'D — Asymptote non nulle' },
    { id: 'E-pH-deduire', label: 'E — pH (avec déduction de a, b)' },
    { id: 'E-pH-direct', label: 'E — pH (a, b donnés)' },
    { id: 'E-decibels-deduire', label: 'E — Décibels (avec déduction de a, b)' },
    { id: 'E-decibels-direct', label: 'E — Décibels (a, b donnés)' },
    { id: 'E-magnitude-deduire', label: 'E — Magnitude sismique (avec déduction de a, b)' },
    { id: 'E-magnitude-direct', label: 'E — Magnitude sismique (a, b donnés)' },
    { id: 'F', label: 'F — Courbe logistique généralisée' },
    { id: 'G', label: 'G — Équilibre offre/demande' },
  ],
  gen7: [
    { id: 'mise_en_evidence', label: 'Mise en évidence (c=0)' },
    { id: 'binome_conjugue', label: 'Binôme conjugué (b=0)' },
    { id: 'produit_remarquable', label: 'Produit remarquable (Δ=0)' },
    { id: 'irreductible', label: 'Irréductible (Δ<0, aucune racine réelle)' },
  ],
  /** gen8/gen9 n'ont PAS de catalogue de familles côté plateforme-maths (un seul type d'exercice
   * chacun, pas de `CATALOGUE_FAMILLES`/`CATALOGUE_VARIANTES`) — entrée unique factice : le
   * formulaire affiche quand même un seul champ « Nombre » (comme pour tout générateur), et
   * `genererInstanceAvecVariante` est absent côté adaptateur plateforme-maths, qui retombe donc
   * sur `genererInstance()` en ignorant cet id (voir `AppEvaluation4e.tsx::construireItemsExercice`). */
  gen8: [{ id: 'defaut', label: 'Lecture graphique' }],
  gen9: [{ id: 'defaut', label: 'Développée → canonique' }],
  gen1: [
    { id: 'mise_en_evidence', label: 'Mise en évidence (c=0)' },
    { id: 'binome_conjugue', label: 'Binôme conjugué (b=0, différence de deux carrés)' },
    { id: 'produit_remarquable', label: 'Produit remarquable (Δ=0, carré parfait)' },
    { id: 'cas_general', label: 'Cas général (formule du discriminant)' },
    { id: 'mise_en_evidence_generalisee', label: 'Mise en évidence généralisée ((x+p)²=m(x+p))' },
  ],
  gen2: [
    { id: 'deltaNegatif', label: 'Δ < 0 (aucune racine réelle)' },
    { id: 'deltaNul', label: 'Δ = 0 (racine double)' },
    { id: 'deltaPositif', label: 'Δ > 0 (deux racines distinctes)' },
  ],
  gen3: [
    { id: 'P2/P2', label: 'Numérateur et dénominateur du 2nd degré' },
    { id: 'P1/P2', label: 'Numérateur du 1er degré, dénominateur du 2nd degré' },
    { id: 'P2/P1', label: 'Numérateur du 2nd degré, dénominateur du 1er degré' },
  ],
  gen4: [
    { id: 'un_denominateur', label: 'Un seul dénominateur (A/(x-p) = x-q)' },
    { id: 'deux_denominateurs', label: 'Deux dénominateurs avec un facteur commun' },
    { id: 'deux_fractions_lineaires', label: 'Deux fractions du 1er degré (P1/P1 = P1/P1)' },
    { id: 'p2_sur_p1', label: 'P2/P1 = P0/P1 (numérateur gauche du 2nd degré)' },
    { id: 'p1_sur_p2', label: 'P1/P2 = P1/P0 (dénominateur gauche du 2nd degré)' },
  ],
  gen5: [
    { id: 'deux_lineaires', label: '2 facteurs linéaires (2L)' },
    { id: 'lineaire_irreductible', label: '1 facteur linéaire + 1 facteur irréductible (1L-1QI)' },
    { id: 'lineaire_factorisable', label: '1 facteur linéaire + 1 facteur factorisable (1L-1QF)' },
    { id: 'irreductible_factorisable', label: '1 facteur irréductible + 1 facteur factorisable (1QI-1QF)' },
    { id: 'trois_lineaires', label: '3 facteurs linéaires (3L)' },
    { id: 'deux_lineaires_irreductible', label: '2 facteurs linéaires + 1 facteur irréductible (2L-1QI)' },
    { id: 'lineaire_deux_irreductibles', label: '1 facteur linéaire + 2 facteurs irréductibles (1L-2QI)' },
    { id: 'lineaire_irreductible_factorisable', label: '1 facteur linéaire + 1 facteur irréductible + 1 facteur factorisable (1L-1QI-1QF)' },
    { id: 'deux_irreductibles_factorisable', label: '2 facteurs irréductibles + 1 facteur factorisable (2QI-1QF)' },
  ],
  gen6: [
    { id: 'niveau1', label: 'Niveau 1 — quotient de deux polynômes du 1er degré' },
    { id: 'niveau2', label: 'Niveau 2 — quotient égal à une constante' },
    { id: 'niveau3', label: 'Niveau 3 — quotient égal à un polynôme du 1er degré' },
    { id: 'niveau4', label: 'Niveau 4 — quotient de deux fractions du 1er degré' },
    { id: 'denominateurCarre', label: 'Dénominateur au carré' },
    { id: 'facteurCommun', label: 'Facteur commun à simplifier' },
    { id: 'sansFacteurCommun', label: 'Numérateur et dénominateur du 2nd degré, sans facteur commun' },
    { id: 'cubique', label: 'Numérateur du 3e degré (mise en évidence de x)' },
  ],
  gen10: [
    { id: 'carre', label: 'Carré (x²)' },
    { id: 'cube', label: 'Cube (x³)' },
    { id: 'racine_carree', label: 'Racine carrée (√x)' },
    { id: 'racine_cubique', label: 'Racine cubique (∛x)' },
    { id: 'inverse', label: 'Inverse (1/x)' },
    { id: 'valeur_absolue', label: 'Valeur absolue (|x|)' },
  ],
  gen11: [
    { id: 'carre', label: 'Carré (x²)' },
    { id: 'cube', label: 'Cube (x³)' },
    { id: 'racine_carree', label: 'Racine carrée (√x)' },
    { id: 'racine_cubique', label: 'Racine cubique (∛x)' },
    { id: 'inverse', label: 'Inverse (1/x)' },
    { id: 'valeur_absolue', label: 'Valeur absolue (|x|)' },
  ],
  /** gen12 n'a PAS de catalogue de familles côté plateforme-maths (même raison que gen8/gen9
   * ci-dessus — un seul type d'exercice, pas de `CATALOGUE_VARIANTES`). */
  gen12: [{ id: 'defaut', label: 'Lecture graphique' }],
  gen13: [
    { id: 'carre', label: 'Carré (x²)' },
    { id: 'cube', label: 'Cube (x³)' },
    { id: 'racine_carree', label: 'Racine carrée (√x)' },
    { id: 'racine_cubique', label: 'Racine cubique (∛x)' },
    { id: 'inverse', label: 'Inverse (1/x)' },
    { id: 'valeur_absolue', label: 'Valeur absolue (|x|)' },
  ],
  /** gen30 n'a PAS de catalogue de familles côté plateforme-maths (même raison que gen8/gen9/gen12
   * ci-dessus — un seul type d'exercice, pas de `CATALOGUE_VARIANTES`). */
  gen30: [{ id: 'defaut', label: 'Tableau de fréquences' }],
  gen31: [
    { id: 'effectif', label: 'Hauteur = effectif' },
    { id: 'frequence', label: 'Hauteur = fréquence (%)' },
  ],
  gen32: [
    { id: 'discrete', label: 'Données discrètes (x_i / n_i)' },
    { id: 'classes', label: 'Données groupées en classes' },
  ],
  gen33: [
    { id: 'discrete', label: 'Données discrètes (x_i / n_i)' },
    { id: 'classes', label: 'Données groupées en classes (interpolation)' },
  ],
  /** gen34 n'a PAS de catalogue de familles côté plateforme-maths (même raison que gen30
   * ci-dessus). */
  gen34: [{ id: 'defaut', label: 'Variance et écart-type' }],
  gen35: [
    { id: 'discrete', label: 'Données discrètes (x_i / n_i)' },
    { id: 'classes', label: 'Données groupées en classes' },
  ],
  gen36: [
    { id: 'construction', label: 'Construction (glisser les 5 marqueurs)' },
    { id: 'lecture', label: 'Lecture (relever les 5 valeurs)' },
    { id: 'comparaison', label: 'Comparaison de deux séries' },
  ],
  gen37: [
    { id: 'intervalleVersPourcent', label: 'Intervalle donné → pourcentage minimal' },
    { id: 'pourcentVersIntervalle', label: 'Pourcentage minimal donné → intervalle' },
    { id: 'intervalleVersNombre', label: 'Intervalle donné → nombre minimal d\'individus' },
    { id: 'nombreVersIntervalle', label: 'Nombre minimal donné → intervalle' },
    { id: 'intervalleVersSigma', label: 'Intervalle + % minimal donnés → trouver σ' },
    { id: 'intervalleVersXBar', label: 'Intervalle + % minimal donnés → trouver x̄' },
    { id: 'nombreVersSigma', label: 'Intervalle + n + nombre minimal donnés → trouver σ' },
    { id: 'nombreVersXBar', label: 'Intervalle + n + nombre minimal donnés → trouver x̄' },
  ],
  gen38: [
    { id: 'tableaux', label: 'Tableaux x_i / n_i' },
    { id: 'recapitulatif', label: 'Tableau récapitulatif déjà calculé' },
    { id: 'graphique', label: 'Courbes cumulées (graphique)' },
  ],
  gen14: [
    { id: 'angle_negatif', label: 'Angle négatif à réduire' },
    { id: 'angle_superieur_360', label: 'Angle ≥ 360° à réduire' },
    { id: 'multiple_90', label: 'Angle multiple de 90° (sur un axe)' },
  ],
  gen15: [
    { id: '0', label: '0°' },
    { id: '30', label: '30°' },
    { id: '45', label: '45°' },
    { id: '60', label: '60°' },
    { id: '90', label: '90°' },
  ],
  gen16: [
    { id: 'cos', label: 'cos θ donné (retrouver sin θ)' },
    { id: 'sin', label: 'sin θ donné (retrouver cos θ)' },
  ],
  gen17: [
    { id: 'sinCos-complementaireDirecte', label: 'Sin/Cos — Complémentaire directe (Q1)' },
    { id: 'sinCos-supplementaire', label: 'Sin/Cos — Supplémentaire (Q2)' },
    { id: 'sinCos-antiSupplementaire', label: 'Sin/Cos — Anti-supplémentaire (Q3)' },
    { id: 'sinCos-oppose', label: 'Sin/Cos — Opposé (Q4)' },
    { id: 'tangente-supplementaire', label: 'Tangente — Supplémentaire (Q2)' },
    { id: 'tangente-antiSupplementaire', label: 'Tangente — Anti-supplémentaire (Q3)' },
    { id: 'tangente-oppose', label: 'Tangente — Opposé (Q4)' },
  ],
  gen18: [
    { id: 'sin', label: 'sin α = k' },
    { id: 'cos', label: 'cos α = k' },
    { id: 'tan', label: 'tan α = k' },
  ],
  gen19: [
    { id: 'loiSinus', label: 'Côté manquant (loi des sinus)' },
    { id: 'alKashi', label: 'Angle manquant (Al-Kashi)' },
  ],
  gen58: [
    { id: 'terrainRectangle', label: 'Terrain quadrilatère (triangle pont rectangle, aire demandée)' },
    { id: 'terrainQuelconque', label: 'Terrain quadrilatère (triangle pont quelconque, côté demandé)' },
    { id: 'hauteurInaccessible', label: "Hauteur d'un objet inaccessible" },
    { id: 'distanceInaccessible', label: 'Distance entre deux points inaccessibles' },
    { id: 'terrainSportif', label: 'Terrain sportif (triangle pont quelconque, aire demandée)' },
    { id: 'inclinaisonCable', label: "Inclinaison d'un câble de grue (angle demandé)" },
    { id: 'hauteurArbre', label: "Hauteur d'un arbre inaccessible (triangulation via un repère)" },
    { id: 'sectionFalaise', label: "Aire d'une section de paroi rocheuse (triangulation via un repère)" },
    { id: 'naviresConvergents', label: 'Distance entre 2 navires (sommet partagé)' },
    { id: 'randonneursSommet', label: 'Distance entre 2 randonneurs vers un sommet commun (sommet partagé)' },
    { id: 'avionsConvergents', label: 'Aire entre 2 avions convergeant vers un aéroport (sommet partagé)' },
  ],
  gen20: [
    { id: 'translation', label: 'Image par une translation' },
    { id: 'milieu', label: "Milieu d'un segment" },
    { id: 'relationGenerale', label: 'Relation vectorielle générale' },
  ],
  gen21: [
    { id: 'translation', label: 'Translation par un vecteur (a,b)' },
    { id: 'relationGenerale', label: 'Relation vectorielle générale (avec milieu)' },
  ],
  gen22: [
    { id: 'plate', label: 'Sans parenthèses' },
    { id: 'parentheses', label: 'Parenthèses avec coefficient distribué' },
    { id: 'vecteur-repete', label: 'Vecteur répété entre plusieurs termes' },
    { id: 'paire-opposee', label: 'Paire de points en sens opposé (AB/BA)' },
    { id: 'complete', label: 'Complexité maximale' },
  ],
  /** gen23 n'a PAS de catalogue de familles côté plateforme-maths (même raison que gen30/gen34
   * ci-dessus). */
  gen23: [{ id: 'defaut', label: 'Construction graphique (k·u)' }],
  gen24: [
    { id: 'vecteurs', label: 'Colinéarité de deux vecteurs' },
    { id: 'parametre', label: 'Déterminer x pour la colinéarité' },
    { id: 'points', label: 'Alignement de trois points' },
    { id: 'pointsParametre', label: 'Alignement avec x' },
  ],
  gen25: [
    { id: 'test', label: "Tester l'orthogonalité de deux vecteurs" },
    { id: 'parametre', label: "Déterminer x pour l'orthogonalité" },
    { id: 'triangle', label: 'Triangle rectangle via ses vecteurs' },
    { id: 'triangleParametre', label: 'Triangle rectangle avec x' },
  ],
  gen26: [
    { id: 'vecteur', label: "Norme d'un vecteur donné" },
    { id: 'distance', label: 'Distance entre deux points' },
    { id: 'isocele', label: 'Triangle isocèle/scalène' },
    { id: 'parametre', label: 'Déterminer x pour une norme cible' },
    { id: 'pythagore', label: 'Pythagore, méthode alternative' },
  ],
  gen27: [
    { id: 'hexagone', label: 'Hexagone régulier + centre' },
    { id: 'etoile', label: 'Étoile à 6 branches' },
    { id: 'trapeze', label: 'Trapèze + diagonales' },
    { id: 'triangleMedianes', label: 'Triangle + médianes' },
  ],
  gen28: [
    { id: 'longueur', label: 'Longueur' },
    { id: 'direction', label: 'Direction' },
    { id: 'sens', label: 'Sens' },
  ],
  gen29: [
    { id: 'angleDroit', label: 'Angle droit entre les vecteurs composants' },
    { id: 'angleQuelconque', label: 'Angle quelconque entre les vecteurs composants' },
  ],
  gen42: [
    { id: 'deux_points', label: '2 points' },
    { id: 'point_vecteur', label: 'Point + vecteur directeur' },
    { id: 'angle_ox', label: 'Angle avec Ox + point' },
    { id: 'angle_oy', label: 'Angle avec Oy + point' },
    { id: 'pente', label: 'Pente + point' },
  ],
  gen43: [
    { id: 'cartesienne', label: 'Équation cartésienne (forme libre)' },
    { id: 'parametrique', label: 'Équations paramétriques' },
  ],
  gen44: [
    { id: 'parametrique', label: 'Représentation paramétrique' },
    { id: 'implicite', label: 'Équation cartésienne (implicite)' },
    { id: 'explicite_y', label: 'Équation réduite y = mx + p' },
    { id: 'explicite_x', label: 'Équation réduite x = ny + q' },
  ],
  gen45: [
    { id: 'cart_vers_cart_parallele', label: 'Cartésienne → cartésienne, parallèle' },
    { id: 'cart_vers_cart_perpendiculaire', label: 'Cartésienne → cartésienne, perpendiculaire' },
    { id: 'cart_vers_param_parallele', label: 'Cartésienne → paramétrique, parallèle' },
    { id: 'cart_vers_param_perpendiculaire', label: 'Cartésienne → paramétrique, perpendiculaire' },
    { id: 'param_vers_cart_parallele', label: 'Paramétrique → cartésienne, parallèle' },
    { id: 'param_vers_cart_perpendiculaire', label: 'Paramétrique → cartésienne, perpendiculaire' },
  ],
  gen46: [
    { id: 'implicite', label: 'Implicite (ax+by+c=0)' },
    { id: 'explicite_y', label: 'Explicite (y=mx+p)' },
    { id: 'explicite_x', label: 'Explicite (x=ny+q)' },
    { id: 'parametrique', label: 'Paramétrique' },
  ],
  gen47: [
    { id: 'point', label: "Distance d'un point à une droite" },
    { id: 'paralleles', label: 'Distance entre deux droites parallèles' },
  ],
  gen48: [
    { id: 'cart_cart', label: 'Cartésienne × cartésienne' },
    { id: 'param_cart', label: 'Paramétrique × cartésienne' },
    { id: 'param_param', label: 'Paramétrique × paramétrique' },
  ],
  gen49: [
    { id: 'rayon_direct', label: 'Rayon lu directement sur la grille' },
    { id: 'rayon_indirect', label: 'Rayon retrouvé par la distance (triplet pythagoricien)' },
  ],
  gen50: [
    { id: 'rationnel', label: 'Rayon rationnel' },
    { id: 'irrationnel', label: 'Rayon irrationnel' },
  ],
  gen51: [
    { id: 'vertical', label: 'Axe vertical' },
    { id: 'horizontal', label: 'Axe horizontal' },
  ],
  gen52: [
    { id: 'vertical', label: 'Axe vertical' },
    { id: 'horizontal', label: 'Axe horizontal' },
  ],
  /** gen53 n'a PAS de catalogue de familles côté plateforme-maths (même raison que gen23
   * ci-dessus). */
  gen53: [{ id: 'defaut', label: 'Construction au compas (foyer + directrice)' }],
  gen54: [
    { id: 'cercleDroite_0', label: 'Cercle-droite — aucune intersection' },
    { id: 'cercleDroite_1', label: 'Cercle-droite — 1 point (tangente)' },
    { id: 'cercleDroite_2', label: 'Cercle-droite — 2 points' },
    { id: 'cercleCercle_0', label: 'Cercle-cercle — aucune intersection' },
    { id: 'cercleCercle_1', label: 'Cercle-cercle — 1 point (tangente)' },
    { id: 'cercleCercle_2', label: 'Cercle-cercle — 2 points' },
    { id: 'droiteParabole_0', label: 'Droite-parabole — aucune intersection' },
    { id: 'droiteParabole_1', label: 'Droite-parabole — 1 point (tangente)' },
    { id: 'droiteParabole_2', label: 'Droite-parabole — 2 points' },
  ],
  gen39: [
    { id: 'incluse', label: 'Droite incluse dans le plan' },
    { id: 'parallele', label: 'Droite parallèle au plan' },
    { id: 'secante', label: 'Droite sécante au plan' },
  ],
  gen40: [
    { id: 'parallelepipede', label: 'Parallélépipède rectangle ABCD-EFGH' },
    { id: 'cube', label: 'Cube ABCD-EFGH' },
    { id: 'prisme', label: 'Prisme droit à base triangulaire ABC-DEF' },
    { id: 'tetraedre', label: 'Tétraèdre ABCD' },
  ],
  gen41: [
    { id: 'simple', label: 'Ombre simple sur sol plat' },
    { id: 'obstacle', label: 'Ombre avec obstacle' },
    { id: 'directionInconnue', label: 'Direction inconnue à déduire' },
  ],
  '5gen20': [
    { id: 'limiteReelle', label: 'Nombre réel' },
    { id: 'formeIndeterminee', label: 'Forme 0/0' },
    { id: 'limiteInfiniePoint-racineSimple', label: 'Limite infinie en un point — racine simple' },
    { id: 'limiteInfiniePoint-racineDouble', label: 'Limite infinie en un point — racine double' },
    { id: 'limiteInfini-degresEgaux', label: "Limite à l'infini — degrés égaux" },
    { id: 'limiteInfini-numerateurPlusGrand', label: "Limite à l'infini — numérateur plus grand" },
    { id: 'limiteInfini-numerateurPlusPetit', label: "Limite à l'infini — numérateur plus petit" },
  ],
  '5gen21': [
    { id: 'divisionEuclidienne-degre1', label: 'Via division euclidienne — P2/P1' },
    { id: 'divisionEuclidienne-degre2', label: 'Via division euclidienne — P3/P2' },
    { id: 'viaLimites-degre1', label: 'Via les limites — P2/P1' },
    { id: 'viaLimites-degre2', label: 'Via les limites — P3/P2' },
  ],
  '5gen22': [
    { id: '0va-horizontale', label: '0 AV — horizontale (identique)' },
    { id: '0va-horizontale-distincte', label: '0 AV — horizontale (différente en ±∞)' },
    { id: '0va-oblique', label: '0 AV — oblique' },
    { id: '0va-aucune', label: '0 AV — aucune (diverge)' },
    { id: '1va-opposes-horizontale', label: '1 AV, signes opposés — horizontale' },
    { id: '1va-identiques-horizontale', label: '1 AV, signes identiques — horizontale' },
    { id: '1va-opposes-oblique', label: '1 AV, signes opposés — oblique' },
    { id: '1va-aucune', label: '1 AV — aucune (diverge)' },
    { id: '1va-pointIsole', label: '1 AV — point isolé (continuité)' },
    { id: '2va-opposes-horizontale', label: '2 AV, opposés/opposés — horizontale' },
    { id: '2va-mixte-oblique', label: '2 AV, opposés/identiques — oblique' },
    { id: '2va-pointIsole', label: '2 AV — point isolé sur une AV' },
  ],
  '5gen23': [
    { id: 'prixRevient', label: 'A — Prix de revient' },
    { id: 'eauSalee', label: 'B — Eau salée' },
    { id: 'clubLoisirs', label: 'C — Club de loisirs' },
    { id: 'population', label: 'D — Population' },
  ],
  '5gen24': [
    { id: '1-vaSimple-ahZero', label: '1 exclusion, AV simple — AH=0' },
    { id: '1-vaSimple-ahNonNul', label: '1 exclusion, AV simple — AH≠0' },
    { id: '1-vaSimple-ao', label: '1 exclusion, AV simple — AO' },
    { id: '1-vaSimple-aucune', label: '1 exclusion, AV simple — aucune asymptote' },
    { id: '1-vaDouble-ahNonNul', label: '1 exclusion, AV double — AH≠0' },
    { id: '1-vaDouble-ao-special', label: '1 exclusion, AV double — AO + recoupement' },
    { id: '2-vaSimple-vaSimple-ah', label: '2 exclusions, simple+simple — AH' },
    { id: '2-vaSimple-vaSimple-ao', label: '2 exclusions, simple+simple — AO' },
    { id: '2-vaSimple-vaDouble-ahNonNul-special', label: '2 exclusions, simple+double — AH + recoupement' },
    { id: '2-vaDouble-vaDouble-ao', label: '2 exclusions, double+double — AO (D degré 4, affichage P2·P2)' },
    { id: '2-pointVide-vaSimple-ahNonNul', label: '2 exclusions, point vide + simple — AH≠0' },
    { id: '2-pointVide-vaDouble-ao', label: '2 exclusions, point vide + double — AO' },
    { id: '2-pointVide-vaSimple-aucune', label: '2 exclusions, point vide + simple — aucune' },
    { id: 'bonus', label: 'Bonus — construction inverse' },
  ],
  '5gen1': [
    { id: 'rationnelle', label: 'Rationnelle' },
    { id: 'irrationnelleSimple', label: 'Irrationnelle simple' },
    { id: 'racineSurFraction', label: 'Racine sur fraction' },
    { id: 'fractionSousRacine', label: 'Fraction sous racine (bonus)' },
    { id: 'pasDeCE', label: 'Pas de CE' },
    { id: 'racineImpaireDenominateur', label: 'Racine impaire au dénominateur' },
  ],
  '5gen2': [
    { id: '2', label: '2 couches' },
    { id: '3', label: '3 couches' },
    { id: '4', label: '4 couches' },
  ],
  '5gen3': [
    { id: 'rationnelle+rationnelle', label: 'rationnelle + rationnelle' },
    { id: 'irrationnelleSimple+irrationnelleSimple', label: 'racine simple + racine simple' },
    { id: 'racineSurFraction+racineSurFraction', label: 'racine sur fraction + racine sur fraction' },
    { id: 'fractionSousRacine+fractionSousRacine', label: 'fraction sous racine + fraction sous racine' },
    { id: 'rationnelle+irrationnelleSimple', label: 'rationnelle + racine simple' },
    { id: 'rationnelle+racineSurFraction', label: 'rationnelle + racine sur fraction' },
    { id: 'rationnelle+fractionSousRacine', label: 'rationnelle + fraction sous racine' },
    { id: 'irrationnelleSimple+racineSurFraction', label: 'racine simple + racine sur fraction' },
    { id: 'irrationnelleSimple+fractionSousRacine', label: 'racine simple + fraction sous racine' },
    { id: 'racineSurFraction+fractionSousRacine', label: 'racine sur fraction + fraction sous racine' },
  ],
  '5gen4': [
    { id: 'f', label: 'f restreinte' },
    { id: 'g', label: 'g restreinte' },
  ],
  '5gen5': [
    { id: 'B1', label: 'Modèle B1' },
    { id: 'B2', label: 'Modèle B2' },
    { id: 'B3', label: 'Modèle B3' },
    { id: 'B4', label: 'Modèle B4' },
    { id: 'B5', label: 'Modèle B5' },
  ],
  '5gen6': [
    { id: 'deuxVersTrois', label: '2 données → 3 inconnues' },
    { id: 'conversion', label: 'Conversion degrés ↔ radians' },
  ],
  '5gen7': [
    { id: 'aucun', label: 'Sans écran bonus' },
    { id: 'arc', label: '+ arc multi-pas' },
    { id: 'secteur', label: '+ secteur multi-pas' },
    { id: 'les-deux', label: '+ arc et secteur multi-pas' },
  ],
  '5gen8': [
    { id: 'developpee', label: 'Forme développée (A·sin(Bx+C)+b)' },
    { id: 'prefactorisee', label: 'Forme pré-factorisée (A·sin((2π/T)(x-φ))+b)' },
  ],
  '5gen9': [{ id: 'defaut', label: 'Lecture graphique' }],
  '5gen10': [{ id: 'defaut', label: 'Équation trig(ax+b)=k' }],
  '5gen11': [
    { id: 'sin', label: 'sin' },
    { id: 'cos', label: 'cos' },
  ],
  '5gen12': [
    { id: 'secteurBalaye', label: 'Secteur balayé (essuie-glace)' },
    { id: 'segmentCirculaire', label: 'Segment circulaire' },
    { id: 'lentille', label: 'Lentille (deux cercles sécants)' },
  ],
  '5gen13': [{ id: 'defaut', label: 'Système à 2 points (technique B3)' }],
  '5gen14': [
    { id: 'principal', label: 'Pipeline u1/r (2 données → le reste)' },
    { id: 'coherence', label: 'Vérification de cohérence (r, up, uq sur-spécifiés)' },
    { id: 'algebriqueTermeGeneral', label: 'Isoler x — via up et un (relation générale)' },
    { id: 'algebriqueSommeSn-A', label: 'Isoler x — Sn, sous-cas A (u1(x) algébrique)' },
    { id: 'algebriqueSommeSn-B', label: 'Isoler x — Sn, sous-cas B (r(x) algébrique)' },
    { id: 'algebriqueSommeSn-C', label: 'Isoler x — Sn, sous-cas C (u1(x) et r(x) algébriques)' },
    { id: 'algebriqueSommeSn-D', label: 'Isoler x — Sn, sous-cas D (Sn(x) algébrique)' },
    { id: 'algebriqueRangN', label: 'Isoler le rang n' },
  ],
  '5gen15': [
    { id: 'principal', label: 'Pipeline u1/q (2 données → le reste)' },
    { id: 'algebriqueTermeGeneral', label: 'Isoler x — via up et un (relation générale)' },
    { id: 'algebriqueSommeSn-A', label: 'Isoler x — Sn, sous-cas A (u1(x) algébrique)' },
    { id: 'algebriqueSommeSn-B', label: 'Isoler x — Sn, sous-cas B (Sn(x) algébrique)' },
    { id: 'algebriqueRangN', label: 'Isoler le rang n (réduction à la même base)' },
  ],
  '5gen16': [
    { id: 'arithmetique', label: 'Suite arithmétique' },
    { id: 'geometrique', label: 'Suite géométrique' },
    { id: 'quelconque', label: 'Suite rationnelle un=P(n)/Q(n)' },
  ],
  '5gen17': [
    { id: 'echiquier', label: "L'échiquier et les grains de blé" },
    { id: 'papyrusRhind', label: 'Le papyrus de Rhind' },
    { id: 'suitesCombinees', label: 'Suite arithmétique et géométrique combinées' },
    { id: 'vitesse', label: 'À toute allure' },
    { id: 'fibonacci', label: 'La suite de Fibonacci' },
    { id: 'trianglesZigzag', label: 'Triangles emboîtés et zigzag' },
    { id: 'carresEmboites', label: 'Des carrés emboîtés' },
  ],
  '5gen18': [
    { id: 'villesCroissance', label: 'Suite arithmétique vs suite géométrique' },
    { id: 'stockDemande', label: 'Suite arithmétique vs arithmétique' },
    { id: 'epargneCroissance', label: 'Suite géométrique vs géométrique' },
  ],
  /** gen19 n'a PAS de catalogue de contextes câblé côté plateforme-maths — même raison que
   * gen8/gen9/gen12 ci-dessus (`genererInstanceAvecVariante` absent, retombe sur `genererInstance()`
   * qui tire un des 60 contextes narratifs au hasard), MAIS pour une raison différente cette fois :
   * un catalogue de 60 entrées ferait exploser la taille de l'URL du payload dès qu'on force
   * plusieurs instances (constaté : 431 "Request Header Fields Too Large" côté plateforme-maths) et
   * produirait 60 lignes dans le formulaire pour un seul générateur — voir le commentaire de tête de
   * `suiteRecurrenteAffine/exportEvaluation.ts` côté plateforme-maths. */
  '5gen19': [{ id: 'defaut', label: 'Contexte aléatoire (60 scénarios)' }],
  '5gen25': [
    { id: 'grapheDerivee-3', label: 'A — Graphe f ↔ graphe f\' (3 éléments)' },
    { id: 'grapheDerivee-5', label: 'A — Graphe f ↔ graphe f\' (5 éléments)' },
    { id: 'grapheVerbal-3', label: 'B — Graphe f ↔ énoncé verbal (3 éléments)' },
    { id: 'grapheVerbal-5', label: 'B — Graphe f ↔ énoncé verbal (5 éléments)' },
    { id: 'symbolique-3', label: 'C — f ↔ f\' symbolique (3 éléments)' },
    { id: 'symbolique-5', label: 'C — f ↔ f\' symbolique (5 éléments)' },
  ],
  '5gen26': [
    { id: 'affine', label: '1. Affine — f(x)=mx+p' },
    { id: 'quadratique', label: '2. Quadratique — f(x)=mx²+p' },
    { id: 'rationnelleSimple', label: '3. Rationnelle simple — f(x)=k/x ou k/x²' },
    { id: 'rationnelleLineaire', label: '4. Rationnelle linéaire — f(x)=(mx+p)/(x-q)' },
  ],
  '5gen27': [
    { id: 'reglebase-sans-trig', label: '1a. Règle de base — sans trig' },
    { id: 'reglebase-avec-trig', label: '1b. Règle de base — avec trig' },
    { id: 'produit-sans-trig', label: '2a. Produit u·v — sans trig' },
    { id: 'produit-avec-trig', label: '2b. Produit u·v — avec trig' },
    { id: 'quotient-sans-trig', label: '3a. Quotient u/v — sans trig' },
    { id: 'quotient-avec-trig', label: '3b. Quotient u/v — avec trig' },
    { id: 'quotient-ambigu', label: '3c. Quotient ambigu — 1/trig(ax+b)²' },
    { id: 'composee-sans-trig', label: '4a. Composée (chaîne) — sans trig' },
    { id: 'composee-avec-trig', label: '4b. Composée (chaîne) — avec trig' },
  ],
  '5gen28': [
    { id: 'pointDonne-polynomiale', label: 'A. Point donné — polynomiale' },
    { id: 'pointDonne-radicale', label: 'A. Point donné — radicale' },
    { id: 'horizontale-double', label: 'B. Horizontale — racine double' },
    { id: 'horizontale-distinct', label: 'B. Horizontale — 2 racines distinctes' },
    { id: 'doubleTangence', label: 'C. Double tangence (bonus)' },
  ],
  '5gen29': [
    { id: 'polynomiale-simple-base', label: 'Polynomiale — racines simples (base)' },
    { id: 'polynomiale-simple-avance', label: 'Polynomiale — racines simples (avancé)' },
    { id: 'polynomiale-double-base', label: 'Polynomiale — racine double (base)' },
    { id: 'polynomiale-double-avance', label: 'Polynomiale — racine double (avancé)' },
    { id: 'polynomiale-irrationnelle-base', label: 'Polynomiale — racines irrationnelles (base)' },
    { id: 'polynomiale-irrationnelle-avance', label: 'Polynomiale — racines irrationnelles (avancé)' },
    { id: 'rationnelleSansCE-base', label: 'Rationnelle sans CE (base)' },
    { id: 'rationnelleSansCE-avance', label: 'Rationnelle sans CE (avancé)' },
    { id: 'rationnelleAvecCE-base', label: 'Rationnelle avec CE (base)' },
  ],
  '5gen30': [
    { id: '0va-horizontale-0ext-0pi', label: '0 AV — horizontale, 0 extremum, 0 PI' },
    { id: '0va-horizontale-1ext-0pi', label: '0 AV — horizontale, 1 extremum' },
    { id: '0va-horizontale-2ext-1pi', label: '0 AV — horizontale, 2 extrema, 1 PI' },
    { id: '0va-horizontale-3ext-2pi', label: '0 AV — horizontale, 3 extrema, 2 PI' },
    { id: '0va-oblique-2ext-0pi', label: '0 AV — oblique, 2 extrema' },
    { id: '1va-horizontale-1ext-1pi', label: '1 AV — horizontale, 1 extremum, 1 PI' },
    { id: '1va-oblique-2ext-1pi', label: '1 AV — oblique, 2 extrema, 1 PI' },
    { id: '1va-aucune-0ext-0pi', label: '1 AV — aucune, 0 extremum, 0 PI' },
    { id: '2va-opposes-horizontale-2ext-2pi', label: '2 AV — horizontale, 2 extrema, 2 PI' },
    { id: '2va-mixte-oblique-3ext-2pi', label: '2 AV — oblique, 3 extrema, 2 PI' },
    { id: '2va-pointIsole-1ext-1pi', label: '2 AV (point isolé) — 1 extremum, 1 PI' },
  ],
  '5gen31': [
    { id: 'polynomiale-simple', label: 'Polynomiale — racines simples (aucune asymptote)' },
    { id: 'polynomiale-double', label: 'Polynomiale — racine double (aucune asymptote)' },
    { id: 'polynomiale-irrationnelle', label: 'Polynomiale — racines irrationnelles (aucune asymptote)' },
    { id: 'rationnelleSansCE', label: 'Rationnelle sans CE (AH y=0)' },
    { id: 'rationnelleAvecCE', label: 'Rationnelle avec CE (AH y=0 + 2×AV)' },
    { id: 'rationnelleAO-exacte', label: 'Rationnelle — asymptote oblique (racines exactes)' },
    { id: 'rationnelleAO-irrationnelle', label: 'Rationnelle — asymptote oblique (racines irrationnelles)' },
    { id: 'rationnelleAO-sansExtremum', label: 'Rationnelle — asymptote oblique (aucun extremum)' },
  ],
  '5gen32': [
    { id: 'trapeze', label: 'A. Trapèze isocèle (angle α, signe de A\'\')' },
    { id: 'cylindre', label: 'B. Cylindre à volume fixé' },
    { id: 'cylindre-application', label: 'B. Cylindre — bonus application numérique' },
    { id: 'margesA', label: 'C(a). Marges — aire totale fixée, maximiser l\'aire imprimée' },
    { id: 'margesB', label: 'C(b). Marges — aire imprimée fixée, minimiser l\'aire totale' },
    { id: 'fenetreA', label: 'D(a). Fenêtre — périmètre fixé, maximiser l\'aire' },
    { id: 'fenetreB', label: 'D(b). Fenêtre — aire fixée, minimiser le périmètre' },
    { id: 'cubique', label: 'Bonus 2. Reconstruction d\'un polynôme cubique' },
  ],
  '5gen33': [
    { id: 'A-degre2', label: 'Famille A — coût degré 2' },
    { id: 'A-degre3-extremum', label: 'Famille A — coût degré 3, extremum existe' },
    { id: 'A-degre3-sans-extremum', label: 'Famille A — coût degré 3, pas d\'extremum' },
    { id: 'B', label: 'Famille B — bénéfice maximum' },
    { id: 'bonus', label: 'Bonus — dichotomie (coût moyen)' },
  ],
  '5gen34': [
    { id: 'max-local-min-local', label: 'Max local — min local (2 racines)' },
    { id: 'max-local-min-borne', label: 'Max local — min à une borne (3 racines)' },
    { id: 'max-borne-min-local', label: 'Max à une borne — min local (3 racines)' },
    { id: 'max-borne-min-borne', label: 'Max à une borne — min à une borne (2 racines)' },
  ],
  '5gen35': [
    { id: 'A', label: 'A. Course simple' },
    { id: 'B', label: 'B. Course en segments' },
  ],
}

/** `[]` pour un générateur sans catalogue connu. */
export function catalogueVariantesExercice(generatorId: IdGenerateurPilote): CatalogueVarianteEntree[] {
  return CATALOGUES_VARIANTES_EXERCICE[generatorId] ?? []
}

/** Fragment texte/latex — même forme que `FragmentConsigne` côté plateforme-maths
 * (`src/ui/formatEquationDroite.ts`), pour que les questions ouvertes envoyées dans le payload s'y
 * rendent en vrai KaTeX plutôt qu'en texte brut. */
export interface FragmentTexte {
  type: 'texte' | 'latex'
  valeur: string
}

export interface QuestionOuverte {
  enonce: FragmentTexte[]
  corrige: FragmentTexte[][]
}

/** Découpe la mini-syntaxe `RichText` (`$latex$`, `**gras**`, voir `.claude/rules/
 * content-authoring.md`) en fragments texte/latex distincts — chaque segment `$...$` devient un
 * fragment `latex` (rendu KaTeX côté plateforme-maths), au lieu de laisser les signes `$` et le code
 * LaTeX brut s'afficher littéralement sur la copie imprimée. Le gras n'a pas d'équivalent dans
 * `FragmentTexte` et est donc aplati (délimiteurs retirés, texte conservé). */
function parseRichText(texte: string): FragmentTexte[] {
  const sansGras = texte.replace(/\*\*(.*?)\*\*/g, '$1')
  const morceaux = sansGras.split(/\$([^$]+)\$/g)
  const fragments: FragmentTexte[] = []
  morceaux.forEach((valeur, i) => {
    if (valeur === '') return
    fragments.push({ type: i % 2 === 1 ? 'latex' : 'texte', valeur })
  })
  return fragments.length > 0 ? fragments : [{ type: 'texte', valeur: '' }]
}

function extraireParagraphes(blocks: Block[]): FragmentTexte[][] {
  return blocks.filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para').map((b) => parseRichText(b.text))
}

/**
 * Phrasé soigné des questions « formules/démonstrations » du chapitre pilote — un simple label de
 * bloc recopié tel quel (ex. « Exemple résolu — décomposition de f ») n'est pas une consigne, juste
 * un titre. Chaque section a ici un énoncé écrit à la main par position (0-indexée, dans l'ordre
 * des blocs `exemple`/`exempleLibre` de la section), à la forme impérative attendue d'un énoncé
 * d'évaluation (« Démontre que… », « Démontre la relation suivante : … », etc.). Chaque futur
 * chapitre ajouté demandera sa propre liste, construite au cas par cas — une section absente de
 * cette table (ou un index sans entrée) retombe sur le label brut, voir `deriveQuestionsOuvertes`.
 */
const ENONCES_DEMONSTRATION: Record<string, Record<string, (string | undefined)[]>> = {
  'fonctions-reciproques-cyclometriques': {
  reciproques: [
    "Démontre que si $f$ est injective, sa relation réciproque est une fonction.",
    "Démontre que, pour $f$ injective, $(f^{-1})^{-1} = f$, et que $g = f^{-1} \\iff f = g^{-1}$.",
    "Détermine l'expression de $f^{-1}$ pour $f(x) = \\dfrac{5}{x-1}$, en décomposant $f$ en une chaîne d'opérations élémentaires puis en la défaisant dans l'ordre inverse.",
    "Retrouve $f^{-1}$ pour $f(x) = \\dfrac{5}{x-1}$ par la méthode de la permutation (échanger $x$ et $y$, puis isoler $y$).",
    "Explique pourquoi $f : \\mathbb{R} \\to \\mathbb{R} : x \\mapsto x^2$ n'a pas de relation réciproque fonctionnelle, et détermine la réciproque de sa restriction à $\\mathbb{R}^+$.",
    "Pour $f(x) = x^3$, calcule $(\\sqrt[3]{x})'$ à l'aide du théorème de la dérivée d'une réciproque.",
    "Pour $f(x) = \\dfrac{5}{x-1}$ et $f^{-1}(x) = 1 + \\dfrac{5}{x}$, calcule $(f^{-1})'(-5)$ de deux façons différentes, et vérifie que les deux méthodes concordent.",
  ],
  cyclometriques: [
    'Démontre que arcsin est une fonction impaire.',
    "Démontre la relation suivante : $\\arccos(x) + \\arccos(-x) = \\pi$.",
    'Démontre que arctan est une fonction impaire.',
  ],
  equations: [
    "Démontre la relation suivante : $\\arcsin(x) + \\arccos(x) = \\pi/2$.",
    "Résous l'équation $\\arcsin(2x-1) = \\arcsin(x)$, en posant la condition d'existence.",
    "Résous l'équation $\\arccos(x^2-1) = \\arccos(1-x)$, en vérifiant si les solutions trouvées respectent la condition d'existence.",
  ],
  derivees: [
    "Démontre que $\\arcsin'(x) = \\dfrac{1}{\\sqrt{1-x^2}}$.",
    "Démontre que $\\arccos'(x) = -\\dfrac{1}{\\sqrt{1-x^2}}$, en utilisant l'identité $\\arccos(x) = \\pi/2 - \\arcsin(x)$.",
    "Démontre, sans utiliser l'identité complémentaire, que $\\arccos'(x) = -\\dfrac{1}{\\sqrt{1-x^2}}$.",
    "Démontre que $\\arctan'(x) = \\dfrac{1}{1+x^2}$.",
    'Démontre que arcsin n\'est dérivable ni en $1$, ni en $-1$.',
    "Calcule la dérivée de $\\arcsin(2x-1)$.",
  ],
  graphiques: [],
  },
  'fonctions-exponentielles': {
  limites: [
    "Démontre que, pour une surface dont l'aire double chaque semaine, la formule $S(t) = S_0 \\cdot 2^t$ reste valable pour tout $t$ **rationnel** (pas seulement entier), en détaillant le raisonnement pour une durée exprimée en jours (facteur multiplicatif quotidien $k$ tel que $k^7=2$).",
  ],
  derivee: [
    "Calcule la dérivée de chacune des fonctions suivantes, en justifiant à chaque fois la présence ou l'absence d'un facteur $\\ln$ : $f(x)=5^x$, $g(x)=e^{3x-1}$, $k(x)=3^{x^4-x}$, $m(x)=e^{\\sin(x)}$.",
    "Détermine le domaine de définition de $h(x) = e^{\\sqrt{x-2}}$, en justifiant la contrainte imposée par chacune des deux fonctions composées.",
    "Démontre, à partir de la définition du nombre dérivé comme limite du taux d'accroissement, que pour $a \\in \\mathbb{R}_0^+$ et $f(x)=a^x$, on a $f'(x) = f'(0) \\cdot a^x$ — c'est-à-dire que la dérivée d'une exponentielle est un multiple d'elle-même.",
    "En utilisant la formule $(a^x)' = \\ln(a) \\cdot a^x$ et le résultat $\\ln(e)=1$, démontre que $(e^x)' = e^x$.",
  ],
  graphique: [
    "Pour $f(x) = \\dfrac{e^x+e^{-x}}{2}$, démontre que $f$ est paire et que sa dérivée $f'(x) = \\dfrac{e^x-e^{-x}}{2}$ est impaire.",
  ],
  equations: [
    "Démontre que, pour $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$, $a^x = a^y \\iff x = y$ — en justifiant pourquoi la condition $a \\neq 1$ est indispensable.",
  ],
  inequations: [
    undefined,
    undefined,
    "Démontre que, pour $0 < a < 1$, $a^x < a^y \\iff x > y$ (en détaillant les deux sens de l'équivalence, dont un par l'absurde), puis déduis-en les trois autres cas ($\\le$, $>$, $\\ge$).",
    "Démontre que, pour $a > 1$, $a^x < a^y \\iff x < y$ (en détaillant les deux sens de l'équivalence, dont un par l'absurde), puis déduis-en les trois autres cas ($\\le$, $>$, $\\ge$).",
  ],
  etude: [
    "Étudie complètement la fonction $f(x) = x \\cdot e^x$ : domaine, dérivée et son signe (extremum), dérivée seconde et son signe (point d'inflexion), limites en $-\\infty$ et $+\\infty$.",
    "Étudie complètement la fonction $f(x) = e^{-x^2}$ : domaine, signe, dérivée première (extremum), dérivée seconde (points d'inflexion), limites en $-\\infty$ et $+\\infty$.",
  ],
  problemes: [
    "Démontre que, pour $a \\in \\mathbb{R}_0^+ \\setminus \\{1\\}$ et $f(x) = k \\cdot a^x$ ($k \\neq 0$), le rapport $\\dfrac{f(s)}{f(r)}$ ne dépend que de l'écart $s-r$ — jamais des valeurs de $r$ et $s$ elles-mêmes.",
    'Une population de 1000 individus croît de 5 % par an. Détermine une expression de $Q(t)$, puis calcule la population après 10 ans.',
    "Pour le modèle de saturation $p(t) = 1 - e^{-0{,}1t}$, explique pourquoi $p(t)$ se rapproche de 100 % sans jamais l'atteindre, puis calcule $p(10)$.",
  ],
  },
  'fonction-second-degre': {
  etudier: [
    "Détermine si la fonction donnée par le tableau de valeurs $x=0,1,2,3,4$ et $f(x)=1,2,5,10,17$ est du premier ou du second degré, en calculant ses accroissements successifs puis les accroissements de ces accroissements.",
    undefined,
    undefined,
    undefined,
  ],
  },
  'equations-inequations-second-degre': {
  resoudre: [
    undefined,
    undefined,
    undefined,
    "Démontre, en complétant le carré, que les solutions de $ax^2+bx+c=0$ (avec $a \\neq 0$) sont $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$ lorsque $\\Delta = b^2-4ac \\geq 0$, et qu'il n'y a aucune solution réelle si $\\Delta < 0$.",
    undefined,
    undefined,
    "Démontre, à partir des racines $x_1 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ (avec $\\Delta \\geq 0$), que $x_1+x_2 = -\\dfrac{b}{a}$ et que $x_1 \\cdot x_2 = \\dfrac{c}{a}$.",
    "Démontre que, si $\\Delta \\geq 0$ et $x_1,x_2$ sont les racines de $ax^2+bx+c=0$, alors $a(x-x_1)(x-x_2) = ax^2+bx+c$, en distribuant le produit puis en substituant les relations de Viète $x_1+x_2=-\\dfrac{b}{a}$ et $x_1 \\cdot x_2=\\dfrac{c}{a}$.",
    undefined,
  ],
  'signe-produit': [
    "Étudie le signe du produit $(x-1) \\cdot x \\cdot (x-3)$ à l'aide d'un tableau de signes à 3 facteurs, puis résous l'inéquation $(x-1) \\cdot x \\cdot (x-3) > 0$.",
  ],
  'inequations-rationnelles': [
    "Résous l'inéquation $\\dfrac{x-2}{x+1} \\geq 0$, en posant la condition d'existence et en construisant un tableau de signes faisant apparaître la valeur non définie.",
  ],
  },
  'statistique-descriptive': {
  moyenne: [
    "Calcule la moyenne pondérée $\\bar{x}$ de la série de valeurs $x_i=2,6,9,12$ et d'effectifs respectifs $n_i=5,8,4,3$.",
  ],
  position: [
    "Détermine la médiane, le premier quartile $Q_1$ et le troisième quartile $Q_3$ de la série de valeurs $x_i=2,6,9,12$ et d'effectifs respectifs $n_i=5,8,4,3$ (effectif total $n=20$), à l'aide de la règle du seuil strictement dépassé sur les effectifs cumulés.",
    undefined,
  ],
  dispersion: [
    "Calcule la variance puis l'écart-type de la série de valeurs $x_i=6,8,12,14$ et d'effectifs respectifs $n_i=5,8,4,7$ (effectif total $n=24$), sachant que $\\bar{x}=10$.",
  ],
  },
  'cercle-trigonometrique-triangles': {
    identite: [
      "Énonce l'identité fondamentale $\\cos^2\\theta + \\sin^2\\theta = 1$, valable pour tout angle $\\theta$, et explique comment elle permet de retrouver $\\cos\\theta$ à partir de $\\sin\\theta$ (ou l'inverse).",
      undefined,
    ],
    triangle: [
      "Démontre la loi des sinus $\\dfrac{a}{\\sin\\hat{A}} = \\dfrac{b}{\\sin\\hat{B}}$ en abaissant, dans le triangle $ABC$, la hauteur issue de $C$ jusqu'en $H$ sur $[AB]$.",
      "Démontre la loi des cosinus $a^2 = b^2+c^2-2bc\\cos\\hat{A}$ en plaçant $A$ à l'origine d'un repère, $B$ sur l'axe horizontal à distance $c$, et $C$ au point $(b\\cos\\hat{A}\\,;\\,b\\sin\\hat{A})$, puis en appliquant le théorème de Pythagore au côté $BC=a$.",
      "Démontre que l'aire du triangle $ABC$ vaut $\\dfrac{1}{2}bc\\sin\\hat{A}$, en exprimant la hauteur issue de $C$ au-dessus de $[AB]$ sous la forme $b\\sin\\hat{A}$.",
      undefined,
    ],
  },
  'calcul-vectoriel': {
    norme: [
      "Démontre, à l'aide du théorème de Pythagore, que pour deux points $A(x_A\\,;\\,y_A)$ et $B(x_B\\,;\\,y_B)$, $\\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$.",
      undefined,
    ],
    colinearite: [
      undefined,
      "Démontre que deux vecteurs $\\vec{u}\\begin{pmatrix}x_u\\\\y_u\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_v\\\\y_v\\end{pmatrix}$ sont colinéaires si et seulement si $x_u\\cdot y_v - y_u\\cdot x_v = 0$.",
    ],
    orthogonalite: [
      undefined,
      "Démontre que si $\\vec{u}\\begin{pmatrix}x_u\\\\y_u\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_v\\\\y_v\\end{pmatrix}$ sont orthogonaux, alors $x_u\\cdot x_v+y_u\\cdot y_v=0$, en construisant $\\vec{v}$ comme l'image de $\\vec{u}$ par une rotation de 90°.",
    ],
  },
  'trigonometrie': {
  modeliser: [
    "Une grande roue a un rayon de 15 m ; le centre de la roue est situé à 17 m du sol. Elle effectue un tour complet en 8 minutes. À l'instant $t=0$ (l'embarquement), une nacelle se trouve à son point le plus bas. Détermine le modèle complet $hauteur(t) = A\\sin(\\omega t + \\varphi) + b$ (avec $t$ en minutes), en justifiant chaque paramètre, puis vérifie ton résultat en calculant $hauteur(4)$.",
  ],
  },
  'suites': {
  'suites-arithmetiques': [
    undefined,
    "Démontre, à l'aide de la méthode de la « double échelle » — écrire $S_n$ une seconde fois à l'envers, puis additionner les deux lignes colonne par colonne — que la somme des n premiers termes d'une suite arithmétique vaut $S_n = \\dfrac{n(u_1+u_n)}{2}$.",
    undefined,
  ],
  'suites-geometriques': [
    undefined,
    "Démontre, en multipliant $S_n$ par $q$ puis en soustrayant terme à terme les deux égalités obtenues, que la somme des n premiers termes d'une suite géométrique de raison $q \\neq 1$ vaut $S_n = u_1 \\times \\dfrac{1-q^n}{1-q}$.",
    undefined,
  ],
  'comparaison-suites': [
    "En 2020, la ville A compte 50 000 habitants et croît de 2 000 habitants par an (croissance arithmétique). La même année, la ville B compte 30 000 habitants et croît de 8 % par an (croissance géométrique). Détermine, par balayage numérique, le premier rang — puis l'année correspondante — à partir duquel la population de B dépasse celle de A, en vérifiant explicitement que ce n'est pas encore le cas au rang précédent.",
  ],
  'recurrente-affine': [
    "Démontre que, si la suite récurrente $u_{n+1} = a \\times u_n + b$ (avec $a \\neq 1$) converge, sa limite $L$ vaut nécessairement $L = \\dfrac{b}{1-a}$.",
    undefined,
  ],
  },
  'derivees-applications': {
  'fonction-derivee': [
    undefined,
    "Démontre, à partir de la définition du nombre dérivé comme limite du taux d'accroissement, que pour $f(x) = \\dfrac{1}{x}$ (avec $x \\neq 0$), $f'(x) = -\\dfrac{1}{x^2}$, et que pour $f(x) = \\sqrt{x}$ (avec $x \\geq 0$), $f'(x) = \\dfrac{1}{2\\sqrt{x}}$ — en multipliant, pour ce second cas, par l'expression conjuguée.",
    undefined,
    undefined,
    undefined,
  ],
  'etude-locale': [
    "Pour $f(x) = x^3-3x$, dresse le tableau de signes complet de $f'$, déduis-en les variations de $f$, puis classe chaque zéro de $f'$ (maximum local ou minimum local).",
    undefined,
  ],
  },
  'fonctions-logarithmes': {
  proprietes: [
    "Démontre que, pour $a>0$, $a \\neq 1$ et $x,y>0$, $\\log_a(xy) = \\log_a(x) + \\log_a(y)$, en réécrivant $x$ et $y$ comme des puissances de $a$ grâce à (P4), puis en utilisant la propriété des puissances $a^p \\cdot a^q = a^{p+q}$.",
    "Démontre que, pour $a>0$, $a \\neq 1$, $x>0$ et $r \\in \\mathbb{R}$, $\\log_a(x^r) = r \\cdot \\log_a(x)$, en réécrivant $x$ comme une puissance de $a$ grâce à (P4), puis en utilisant la propriété $(a^p)^r = a^{p \\cdot r}$.",
    "Démontre que, pour $a>0$, $a \\neq 1$ et $x,y>0$, $\\log_a(x/y) = \\log_a(x) - \\log_a(y)$, en réécrivant $x$ et $y$ comme des puissances de $a$ grâce à (P4), puis en utilisant la propriété $a^p/a^q = a^{p-q}$.",
    "Calcule $\\log_2(8) - \\log_2(2)$ en te ramenant à un seul logarithme grâce aux propriétés algébriques du logarithme.",
    "Démontre que, pour $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et tout $x \\in \\mathbb{R}$, $a^x = b^{\\,x \\cdot \\log_b(a)}$ (changement de base pour les exponentielles), en réécrivant $a$ comme une puissance de $b$ grâce à (P4) appliquée en base $b$.",
    "Démontre que, pour $a,b>0$ avec $a \\neq 1$ et $b \\neq 1$, et tout $x>0$, $\\log_a(x) = \\dfrac{\\log_b(x)}{\\log_b(a)}$ (changement de base pour les logarithmes), en posant $y=\\log_a(x)$ et en appliquant le changement de base pour les exponentielles à l'égalité $a^y=x$.",
    "Démontre que $\\ln(a) = \\log_e(a)$ pour tout $a>0$, en calculant la dérivée de $a^x$ de deux façons différentes — une fois via le changement de base vers $e$, une fois via la formule $(a^x)' = a^x \\cdot \\ln(a)$ déjà connue — puis en identifiant les deux résultats.",
    "Montre que toute fonction $f(x) = r \\cdot a^{sx+t}$ ($a>0$, $a \\neq 1$, $r,s,t$ réels) peut s'écrire $f(x) = C \\cdot b^{kx}$ dans n'importe quelle autre base $b>0$, $b \\neq 1$, en explicitant $C$ et $k$ en fonction de $r,s,t,a,b$. Applique ensuite ce résultat à $f(x) = 4 \\cdot 3^{5x+2}$, réécrite en base $e$.",
  ],
  equations: [
    "Résous l'équation $3^x = 20$ en appliquant $\\log_3$ aux deux membres, et donne la solution exacte ainsi qu'une valeur approchée au millième.",
    "Résous l'équation $\\ln(2x-1) = 3$ : détermine le domaine, applique $\\exp$ aux deux membres, puis vérifie que la solution respecte la condition d'existence.",
    "Résous l'équation $\\log_3(2w^2-1) = 4$ : détermine d'abord la condition d'existence sur $w$, résous ensuite l'équation, et vérifie que les solutions obtenues la respectent.",
    "Démontre que, pour $a>0$, $a \\neq 1$ et $x,y>0$, $\\log_a(x) = \\log_a(y) \\iff x = y$, en démontrant séparément les deux sens de l'équivalence.",
    "Résous l'équation $\\log_3(6w-1) = \\log_3(-4w^2+3)$ : détermine la condition d'existence, résous l'équation du second degré qui en résulte, puis rejette toute solution qui ne respecte pas la condition d'existence.",
    "Résous l'équation $(\\ln(x))^2 - \\ln(x) - 2 = 0$ à l'aide de la substitution $t = \\ln(x)$.",
  ],
  inequations: [
    "Démontre que, pour $0<a<1$ et $u,v>0$, $\\log_a(u) < \\log_a(v) \\iff u > v$, en démontrant séparément les deux sens de l'équivalence (l'un via $\\exp_a$, l'autre via la monotonie de $\\log_a$).",
    "Démontre que, pour $a>1$ et $u,v>0$, $\\log_a(u) < \\log_a(v) \\iff u < v$, en démontrant séparément les deux sens de l'équivalence (l'un via $\\exp_a$, l'autre via la monotonie de $\\log_a$).",
    "Démontre que, pour $0<a<1$, $u>0$ et $y \\in \\mathbb{R}$, $\\log_a(u) < y \\iff u > a^y$, en te ramenant à la comparaison de deux logarithmes de même base déjà démontrée.",
    "Résous l'inéquation $\\ln(x) \\le 2$ : détermine le domaine, puis l'ensemble-solution en appliquant $\\exp$ aux deux membres.",
    "Résous l'inéquation $\\ln(x-1) > 0$ : détermine le domaine, résous l'inéquation, et vérifie que l'ensemble-solution obtenu est bien inclus dans le domaine.",
    "Résous l'inéquation $\\log_{0,5}(6w-1) \\ge \\log_{0,5}(-4w^2+3)$, puis résous la même comparaison en base $e$, $\\ln(6w-1) \\ge \\ln(-4w^2+3)$ : détermine chaque fois le domaine et compare les deux ensembles-solutions obtenus.",
  ],
  derivee: [
    "Démontre que $\\ln'(x) = \\dfrac{1}{x}$ pour $x>0$, en utilisant la formule de dérivation d'une fonction réciproque appliquée à $\\exp$ et $\\ln$, sachant que $\\exp' = \\exp$.",
    "Détermine le domaine puis calcule la dérivée de chacune des fonctions suivantes : $f(x) = \\ln(x^2+1)$ et $g(x) = \\ln(x-3)$.",
    "Calcule la dérivée de $f(x) = x^2 \\cdot \\sqrt{x+1}$ (pour $x>0$) en utilisant la dérivation logarithmique.",
    "Démontre que, pour $g$ dérivable et strictement positive et $h$ dérivable, $\\left((g(x))^{h(x)}\\right)' = \\left(h'(x) \\cdot \\ln(g(x)) + \\dfrac{h(x) \\cdot g'(x)}{g(x)}\\right) \\cdot (g(x))^{h(x)}$, en réécrivant $(g(x))^{h(x)}$ sous la forme $e^{h(x) \\cdot \\ln(g(x))}$.",
    "Calcule la dérivée de $f(x) = (1+\\sqrt{x})^{2x}$ pour $x>0$, en passant par l'écriture $f(x) = e^{2x \\cdot \\ln(1+\\sqrt{x})}$.",
    "Démontre que $(\\log_a(x))' = \\dfrac{1}{x \\cdot \\ln(a)}$ pour $a>0$, $a \\neq 1$ et $x>0$, en exprimant $\\log_a$ à l'aide de $\\ln$ par changement de base.",
  ],
  limites: [
    "Calcule $\\displaystyle\\lim_{x \\to 0^+} x \\cdot \\ln(x)$, en identifiant la forme indéterminée et en citant le résultat de croissance comparée qui permet de la lever.",
    "Calcule $\\displaystyle\\lim_{x \\to 1} \\dfrac{\\ln(x)}{x-1}$, en posant $u=x-1$ et en te ramenant à la limite fondamentale $\\displaystyle\\lim_{u \\to 0} \\dfrac{\\ln(1+u)}{u} = 1$.",
  ],
  parametres: [
    "Détermine $a$ et $b$ sachant que le graphique de $f(x) = a + b \\cdot \\ln(x)$ passe par le point $(1;4)$ et que sa tangente en $x=1$ a pour pente $3$.",
    "Sachant que $a=2$ et que le graphique de $f(x) = a + b \\cdot \\ln(x)$ passe par le point $(e;5)$, détermine $b$.",
  ],
  hyperboliques: [
    "Vérifie numériquement l'identité $\\text{ch}^2(x) - \\text{sh}^2(x) = 1$ en $x=1$, à partir des valeurs approchées $\\text{ch}(1) \\approx 1{,}5431$ et $\\text{sh}(1) \\approx 1{,}1752$.",
  ],
  graphique: [
    "Étudie le signe de la dérivée de $f(x) = x - \\ln(x)$ sur son domaine $]0;+\\infty[$, et déduis-en la nature et la valeur de son extremum.",
  ],
  etude: [
    "Étudie complètement la fonction $f(x) = \\dfrac{\\ln(x)}{x}$ : domaine, dérivée et extremum, limites aux bornes du domaine et asymptotes.",
  ],
  problemes: [
    "Le pH d'une solution vaut $pH = -\\log_{10}([H^+])$. Démontre que si la concentration $[H^+]$ est multipliée par $10$, le pH diminue exactement de $1$.",
    "Un modèle de décroissance radioactive s'écrit $N(t) = N_0 \\cdot e^{-\\lambda t}$. Démontre que la demi-vie $T$ (l'instant où $N(T) = N_0/2$) vaut $T = \\dfrac{\\ln(2)}{\\lambda}$.",
    "Pour le modèle de croissance logistique $y(t) = \\dfrac{k}{1+a \\cdot e^{-rt}}$, démontre que le point d'inflexion (croissance la plus rapide) a lieu en $y=k/2$, à l'instant $t = \\dfrac{\\ln(a)}{r}$, puis calcule cet instant et cette valeur pour $k=10$, $a=9$, $r=1$.",
  ],
  },
  'primitives-integrales': {
  primitives: [
    "Calcule $\\int 2x \\cdot e^{x^2} \\, dx$ en identifiant la forme $u'e^u$ (avec $u(x)=x^2$).",
    "Démontre la formule d'intégration par parties $\\int f(x) \\cdot g'(x) \\, dx = f(x) \\cdot g(x) - \\int f'(x) \\cdot g(x) \\, dx$ à partir de la dérivée d'un produit.",
    "Calcule $\\int x \\cdot e^x \\, dx$ par intégration par parties.",
    "Calcule $\\int x^2 \\cdot \\sin(x) \\, dx$ en effectuant deux intégrations par parties successives.",
  ],
  conditioninitiale: [
    "Détermine la primitive particulière F de $f(x) = 2x$ telle que $F(0) = 5$.",
    "Détermine la primitive particulière F de $f(x) = \\dfrac{1}{x}$ (pour $x>0$) telle que $F(1) = 2$.",
  ],
  integralesdefinies: [
    "Démontre que la valeur de $\\int_a^b f(x)dx$ ne dépend pas du choix de la primitive utilisée pour la calculer.",
    "Approche $\\int_0^4 x^2 \\, dx$ par la méthode des trapèzes avec 4 sous-intervalles ($\\Delta x=1$), puis compare le résultat à la valeur exacte.",
    "Démontre que la valeur moyenne d'une fonction f continue sur $[a;b]$ est effectivement atteinte par f en un point de $[a;b]$ (théorème de la moyenne).",
    "Calcule la valeur moyenne de $f(x) = x$ sur $[0;4]$.",
    "Détermine $m > 0$ tel que $\\int_0^m 2x \\, dx = 9$.",
  ],
  aires: [
    "Calcule l'aire comprise entre la courbe de $f(x) = x$ et l'axe des abscisses, sur $[-2;3]$.",
    "Calcule l'aire de la région comprise entre les courbes $f(x) = x^2$ et $g(x) = 4$.",
    "Calcule l'aire de la région bordée par $y=x$, $y=6-x$ et l'axe des abscisses.",
    "Démontre, à l'aide d'une intégrale, que l'aire d'un disque de rayon r vaut $\\pi r^2$.",
  ],
  volumes: [
    "Démontre que le volume engendré par la rotation, autour de l'axe des abscisses, de la région sous une courbe $f\\ge0$ sur $[a;b]$, vaut $V = \\pi\\int_a^b [f(x)]^2 dx$.",
    "Calcule le volume engendré par la rotation de $f(x) = x$ sur $[0;3]$ autour de l'axe des abscisses.",
    "Calcule le volume engendré par la rotation, autour de l'axe des abscisses, de la région comprise entre $f(x) = 3$ et $g(x) = x$ sur $[0;3]$.",
    "Démontre, à l'aide de la méthode des disques, que le volume d'un tronc de cône de hauteur h, de petit rayon a et de grand rayon b vaut $V = \\dfrac{\\pi h}{3}(a^2+ab+b^2)$.",
  ],
  longueurarc: [
    "Démontre que la longueur d'un arc de courbe $y=f(x)$ entre $x=a$ et $x=b$ vaut $L = \\int_a^b \\sqrt{1+[f'(x)]^2} \\, dx$.",
    "Calcule la longueur de l'arc de $f(x) = \\dfrac{2}{3}x^{3/2}$ sur $[0;3]$.",
    "Calcule la longueur de l'arc de $f(x) = \\text{ch}(x)$ sur $[0;a]$, en repérant le carré parfait sous la racine.",
    "Démontre, à l'aide de la formule de longueur d'arc, que la circonférence d'un cercle de rayon r vaut $2\\pi r$.",
  ],
  problemes: [
    "Un mobile a une accélération $a(t) = 2$. Sachant que $v(0) = 3$ et $x(0) = 0$, détermine $v(t)$ puis $x(t)$.",
  ],
  },
  'nombres-complexes': {
    affixesracines: [
      undefined,
      "Démontre que, pour résoudre $(x+iy)^2=a+bi$ grâce au système $x^2-y^2=a$ et $2xy=b$, élever ces deux équations au carré puis les additionner membre à membre donne la 3e équation $x^2+y^2=\\sqrt{a^2+b^2}$, qui permet de résoudre entièrement le système.",
      undefined,
      "Détermine, en détail, les deux racines carrées complexes de $5-12i$.",
    ],
    equationscomplexes: [
      "Démontre que, pour $az^2+bz+c=0$ (avec $a,b,c$ réels, $a \\neq 0$ et $\\Delta<0$), la mise sous forme canonique $a(z+\\dfrac{b}{2a})^2=\\dfrac{\\Delta}{4a^2}$ — valable aussi bien dans $\\mathbb{R}$ que dans $\\mathbb{C}$ — conduit, poursuivie dans $\\mathbb{C}$, aux deux solutions conjuguées $z=\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}$.",
      undefined,
      "Résous, dans $\\mathbb{C}$, les deux équations bicarrées $z^4-5z^2+4=0$ et $z^4+5z^2+4=0$, en posant $u=z^2$ dans chacune.",
    ],
    formetrigonometrique: [
      "Démontre que, pour $z_1=r_1(\\cos\\theta_1+i\\sin\\theta_1)$ et $z_2=r_2(\\cos\\theta_2+i\\sin\\theta_2)$, le produit $z_1z_2$ additionne les arguments ($z_1z_2=r_1r_2[\\cos(\\theta_1+\\theta_2)+i\\sin(\\theta_1+\\theta_2)]$) et le quotient $z_1/z_2$ les soustrait ($z_1/z_2=\\dfrac{r_1}{r_2}[\\cos(\\theta_1-\\theta_2)+i\\sin(\\theta_1-\\theta_2)]$) — en développant le produit des deux formes trigonométriques et en reconnaissant les formules d'addition.",
      undefined,
    ],
    formulemoivre: [
      "Démontre la formule de Moivre, $(\\cos\\theta+i\\sin\\theta)^n=\\cos(n\\theta)+i\\sin(n\\theta)$ pour tout entier $n$, en passant par la forme exponentielle $e^{i\\theta}$.",
      "Démontre la formule de Moivre, $(\\cos\\theta+i\\sin\\theta)^n=\\cos(n\\theta)+i\\sin(n\\theta)$, par récurrence sur $n$, sans utiliser la forme exponentielle $e^{i\\theta}$.",
      "En développant $(\\cos x+i\\sin x)^2$ grâce à la formule de Moivre, retrouve les formules de duplication $\\cos(2x)=\\cos^2x-\\sin^2x$ et $\\sin(2x)=2\\sin x\\cos x$.",
      "En développant $(\\cos x+i\\sin x)^3$ grâce à la formule de Moivre et au binôme de Newton, exprime $\\cos(3x)$ et $\\sin(3x)$ en fonction de $\\cos x$ et $\\sin x$.",
    ],
    racinesniemes: [
      "Détermine les 4 racines quatrièmes de l'unité, puis les 3 racines cubiques de l'unité.",
      "Démontre que, pour tout entier $n\\ge2$, la somme des $n$ racines n-ièmes de l'unité, $\\displaystyle\\sum_{k=0}^{n-1} e^{2ik\\pi/n}$, est nulle.",
    ],
    transformationsplan: [
      "Démontre que, pour tout point $M$ d'affixe $z$ et $A$ le point d'affixe $c$, l'application $z \\mapsto z+c$ est la translation de vecteur $\\vec{OA}$.",
      "Démontre que, pour $c$ complexe non nul de module $r$ et d'argument $\\alpha$, l'application $z \\mapsto c(z-z_0)+z_0$ (de centre $\\Omega$ d'affixe $z_0$) combine une rotation de centre $\\Omega$ et d'angle $\\alpha$ avec une homothétie de centre $\\Omega$ et de rapport $r$.",
    ],
    trianglescomplexes: [
      "Démontre que, pour tout point $B\\neq O$ et $F$ l'image de $B$ par la rotation de centre $O$ et d'angle $\\pi/3$ (c'est-à-dire $F=B\\cdot e^{i\\pi/3}$), le triangle $OBF$ est équilatéral.",
    ],
    problemesavances: [
      undefined,
      "Démontre que, pour $a$ complexe tel que $|a|\\neq1$, si $|z|=1$ alors $|z'|=1$, où $z'=\\dfrac{z-a}{1-\\bar{a}z}$.",
    ],
  },
  'probabilites': {
    probabilitesensembles: [
      "Démontre que, pour deux événements $A$ et $B$ quelconques, $P(A \\cup B)=P(A)+P(B)-P(A \\cap B)$, en décomposant $A$, $B$ et $A \\cup B$ en unions disjointes.",
      undefined,
      undefined,
    ],
    independancebayes: [
      undefined,
      "Démontre le théorème de Bayes, $P(A|B)=\\dfrac{P(B|A) \\times P(A)}{P(B)}$, à partir de la définition de la probabilité conditionnelle appliquée dans les deux sens de conditionnement.",
      undefined,
      undefined,
      "Démontre que les trois écritures de l'indépendance de $A$ et $B$ — $P(A|B)=P(A)$, $P(A \\cap B)=P(A) \\times P(B)$ et $P(B|A)=P(B)$ — sont rigoureusement équivalentes.",
    ],
    probabilitesproblemes: [
      "Pour une répétition de 3 épreuves indépendantes de probabilité de succès $p=0,3$, détermine, en énumérant les 8 chemins complets de l'arbre et en les regroupant par nombre de succès, la distribution complète de $P(X=k)$ pour $k=0,1,2,3$, puis vérifie que leur somme vaut 1.",
      undefined,
      undefined,
    ],
  },
  'analyse-combinatoire': {
    denombrementfondamental: [
      undefined,
      "Démontre, à partir de la définition d'une combinaison, que $A_n^k = C_n^k \\times k!$.",
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      "Démontre, en appliquant la relation de Pascal, que $C_5^3+2\\times C_5^2+C_5^1 = C_7^3$, retrouvant ainsi la formule $\\Gamma_5^3 = C_{5+3-1}^3$ sans passer par le calcul direct des factorielles.",
    ],
    binomenewton: [
      "En développant $(a+b)^4$ comme un produit de 4 facteurs identiques et en comptant les mots de 4 lettres $a$/$b$ obtenus, démontre que le coefficient du terme en $a^{4-i}b^i$ est $C_4^i$, puis généralise ce raisonnement à $(a+b)^n$.",
      "Développe complètement $(2x-1)^5$ à l'aide de la formule du binôme de Newton, puis vérifie ton résultat en $x=1$.",
      "Démontre algébriquement, à partir de la définition factorielle des combinaisons, que $C_{n-1}^{k-1}+C_{n-1}^k = C_n^k$.",
      undefined,
      "En substituant $a=b=1$ dans la formule du binôme de Newton, démontre que $C_n^0+C_n^1+\\ldots+C_n^n = 2^n$.",
      undefined,
      undefined,
    ],
    probabilitehypergeometrique: [
      undefined,
      undefined,
      "Pour une urne de 5 boules rouges et 5 boules bleues (3 tirages sans remise), démontre que la probabilité de la composition « 2 rouges et 1 bleue » est égale à $C_3^2$ fois la probabilité d'une séquence précise, et retrouve ainsi $\\dfrac{5}{12}$.",
      undefined,
    ],
  },
  'lieux-geometriques': {
    'methode-generale-demonstration': [
      "Démontre, en choisissant un repère avec $A(0;0)$, $B(2a;0)$ et $D(2b;2c)$ ($a,b,c$ quelconques), que les diagonales $[AC]$ et $[BD]$ d'un parallélogramme $ABCD$ se coupent toujours en leur milieu commun.",
    ],
    'methode-generatrices': [
      "Pour le rectangle $A(0;0)$, $B(4;0)$, $C(4;6)$, $D(0;6)$, les points $Z(0;\\alpha)\\in[AD]$ et $Y(4;\\alpha)\\in[BC]$ définissent les droites $(AY)$ et $(BZ)$. En éliminant le paramètre $\\alpha$, détermine le lieu géométrique du point d'intersection $(AY)\\cap(BZ)$ lorsque $\\alpha$ parcourt $]0;6[$, en précisant la restriction.",
      "Pour le triangle $A(0;4)$, $B(0;0)$, $C(6;0)$, on trace, pour chaque hauteur $\\alpha$, la droite parallèle à $(BC)$ qui coupe $[AB]$ en D et $[AC]$ en E. Détermine, en éliminant $\\alpha$, le lieu géométrique du point d'intersection $(BE)\\cap(CD)$, et identifie la droite remarquable qu'il représente.",
      "Pour $A(3;0)$, $B(-2;0)$ et $C(0;\\alpha)$ variable sur l'axe des ordonnées, on trace la perpendiculaire à $(AC)$ passant par A et la perpendiculaire à $(BC)$ passant par B. Détermine, en éliminant $\\alpha$, le lieu géométrique de leur point d'intersection, et précise si ce lieu contient réellement le point $(1;0)$.",
    ],
  },
  coniques: {
    excentricite: [
      undefined,
      "Démontre, à l'aide du théorème de Dandelin-Quételet, que la section d'un cône de révolution par un plan, lorsqu'elle est une ellipse, admet pour foyers les points de contact F et F′ des deux sphères inscrites avec ce plan — c'est-à-dire que $|PF|+|PF'|$ est constante pour tout point P de la section.",
      "Réduis l'équation $16x^2-36y^2+80x+252y-197=0$ par translation d'axes, puis identifie la conique obtenue (nature, centre, sommets, foyers, directrices, asymptotes).",
    ],
    airefocale: [
      "Pour l'ellipse $\\dfrac{x^2}{25}+\\dfrac{y^2}{16}=1$ et un point P tel que $|PF|=2\\cdot|PF'|$, calcule les rayons focaux $|PF|$ et $|PF'|$, l'angle $\\widehat{FPF'}$, puis l'aire du triangle $FPF'$.",
      "Détermine l'excentricité d'une ellipse sachant que l'angle $\\widehat{FBF'}$ est droit, où B est le sommet de l'axe non focal.",
      "Détermine l'excentricité d'une ellipse telle que $b=c$.",
      "Exprime l'excentricité $e$ d'une ellipse en fonction de $k$, sachant que la distance entre les deux directrices vaut $k$ fois la distance entre les deux foyers.",
    ],
    intersection: [
      "Détermine les points d'intersection entre la droite passant par $A(-4;0)$ et $B(0;-3)$ et la conique de foyer $F(3;-2)$, de directrice $d' \\equiv x=-1/5$ et d'excentricité $e=5/3$.",
    ],
    tangentes: [
      undefined,
      "Détermine l'équation de la tangente à l'ellipse $\\dfrac{x^2}{25}+\\dfrac{y^2}{16}=1$ au point $P(3\\,;\\,16/5)$, par dérivation, puis vérifie ton résultat à l'aide de la forme dédoublée et du discriminant.",
    ],
  },
  'variables-aleatoires': {
  variablesdiscretes: [
    'Une variable aléatoire $X$ prend les valeurs $\\{2,3,4,5,6\\}$ avec les probabilités $P=(0,15\\,;\\,0,25\\,;\\,0,30\\,;\\,0,20\\,;\\,0,10)$. Vérifie que cette loi est valide, puis calcule $E(X)$, $V(X)$ et $\\sigma(X)$.',
    "Un jeu propose un gain net de $-2$ € avec une probabilité $0,4$, de $+3$ € avec une probabilité $0,35$, et de $+5$ € avec une probabilité $0,25$. Calcule l'espérance de ce jeu et précise s'il est favorable, défavorable ou équitable au joueur.",
    "Un jeu offre un gain brut de $10$ € (probabilité $0,2$), $4$ € (probabilité $0,3$) ou $-6$ € (probabilité $0,5$). On impose une mise $m$ au joueur, si bien que son gain net devient le gain brut diminué de $m$. Détermine la valeur de $m$ qui rend ce jeu équitable.",
    "On tire sans remise $3$ éléments dans une population de $10$ éléments dont $4$ sont des succès ($N=10$, $K=4$, $n=3$). Détermine la loi de probabilité de $X$, le nombre de succès obtenus, puis calcule $E(X)$.",
    "Un dé équilibré à $6$ faces est lancé une fois ; $X$ désigne le résultat obtenu. Calcule $E(X)$ et $V(X)$.",
  ],
  loibinomiale: [
    "Une variable aléatoire $X$ suit la loi binomiale $B(5\\,;\\,0,4)$. Détermine la loi de probabilité complète de $X$ (pour $k=0$ à $5$), puis calcule $V(X)$ et $\\sigma(X)$.",
    "On répète une épreuve de Bernoulli de probabilité de succès $p=0,1$. Détermine le plus petit nombre d'épreuves $n$ tel que la probabilité d'obtenir au moins un succès dépasse $0,9$.",
  ],
  loiuniformecontinue: [
    'Une variable aléatoire $X$ suit la loi uniforme continue sur $[0\\,;\\,60]$. Calcule $E(X)$, $V(X)$ et $\\sigma(X)$.',
  ],
  loinormale: [
    "Soit $X$ une variable aléatoire suivant la loi normale $N(50\\,;\\,10)$. En utilisant la règle empirique, calcule la probabilité que $X$ soit hors de l'intervalle $[30\\,;\\,70]$.",
    'Soit $X$ une variable aléatoire suivant la loi normale $N(50\\,;\\,10)$. Calcule $P(X\\leq65)$, $P(X\\geq65)$ et $P(X\\leq35)$.',
    'Détermine la valeur de $z$ telle que $\\Phi(z)=0,95$.',
  ],
  extensionsbayes: [
    "Deux épreuves indépendantes ont respectivement une probabilité de succès $p_1=0,5$ et $p_2=0,3$. Calcule la probabilité de réussir les deux épreuves, puis détermine le nombre minimal de répétitions $n$ de cette expérience composée pour que la probabilité d'obtenir au moins un succès dépasse $0,8$.",
    "Une compagnie d'assurance classe ses clients en 3 catégories de risque : $30\\%$ de risque faible (probabilité de sinistre $0,10$), $45\\%$ de risque moyen (probabilité de sinistre $0,20$) et $25\\%$ de risque élevé (probabilité de sinistre $0,40$). Calcule la probabilité totale qu'un client ait un sinistre, puis la probabilité qu'un client ayant eu un sinistre appartienne à la catégorie à haut risque.",
    "Une variable aléatoire $X$ suit la loi binomiale $B(100\\,;\\,0,5)$. Vérifie que l'on peut approximer $X$ par une loi normale, détermine les paramètres $\\mu$ et $\\sigma$ de cette approximation, puis estime $P(X\\leq55)$.",
    "Une entreprise propose 3 formules d'abonnement : Basique à $15$ € ($20\\%$ des clients), Standard à $35$ € ($30\\%$ des clients) et Premium à $60$ € (le reste des clients). Calcule l'espérance du prix payé par un client, puis la recette totale attendue sur une population de $500$ clients.",
  ],
  loipoisson: [
    "Une variable aléatoire $X$ suit la loi binomiale $B(50\\,;\\,0,08)$. Vérifie que l'on peut approximer $X$ par une loi de Poisson, et détermine le paramètre $\\lambda$ de cette approximation.",
    'Pour une variable aléatoire $X$ suivant la loi de Poisson de paramètre $\\lambda=4$, calcule $P(X\\leq1)$, puis $P(X\\geq2)$.',
    "Un péage voit passer en moyenne $5$ voitures par minute. Détermine le paramètre $\\lambda$ du nombre de voitures passant en $15$ minutes. Une usine compte en moyenne $3$ pièces défectueuses pour $1000$ pièces produites : détermine le paramètre $\\lambda$ du nombre de pièces défectueuses dans un lot de $500$ pièces.",
  ],
  },
}

/**
 * Dérive TOUTES les questions ouvertes « formules/démonstrations » exploitables d'une section — un
 * bloc `exemple`/`exempleLibre` de premier niveau = une question. Une section sans aucun de ces
 * blocs (aucune formule/démonstration) renvoie un tableau vide, conformément à la règle donnée :
 * pas de question de ce type là où il n'y a ni formule ni démonstration. Le corrigé reste dérivé
 * mécaniquement du contenu du bloc (fiable) ; l'énoncé préfère le phrasé soigné de
 * `ENONCES_DEMONSTRATION` quand il existe, sinon retombe sur le label brut du bloc.
 */
export function deriveQuestionsOuvertes(chapitreSlug: string, section: ChapterSection): QuestionOuverte[] {
  const candidats = section.blocks.filter(
    (b): b is Extract<Block, { kind: 'exemple' } | { kind: 'exempleLibre' }> => b.kind === 'exemple' || b.kind === 'exempleLibre',
  )
  const enoncesSoignes = ENONCES_DEMONSTRATION[chapitreSlug]?.[section.id]

  return candidats.map((candidat, index) => {
    const enonceSoigneTexte = enoncesSoignes?.[index]

    if (candidat.kind === 'exemple') {
      const enonceBrut = [candidat.badge, candidat.formula].filter(Boolean).join(' — ')
      const enonceTexte = enonceSoigneTexte ?? (enonceBrut || "Résous l'exercice suivant.")
      const etapes = candidat.steps.map((s) => parseRichText(`${s.tag} : ${s.text}`))
      const resultat = candidat.result.text ? [parseRichText(`${candidat.result.tag} : ${candidat.result.text}`)] : []
      return { enonce: parseRichText(enonceTexte), corrige: [...etapes, ...resultat] }
    }

    const enonceTexte = enonceSoigneTexte ?? (candidat.label || 'Justifie le raisonnement suivant.')
    const corrigeParagraphes = extraireParagraphes(candidat.blocks)
    const corrige = corrigeParagraphes.length > 0 ? corrigeParagraphes : [parseRichText('Voir le cours.')]
    return { enonce: parseRichText(enonceTexte), corrige }
  })
}

/**
 * Banque de questions ouvertes de « compréhension » — distinctes des questions
 * formules/démonstrations ci-dessus (décision explicite de l'utilisateur : les deux catégories
 * coexistent, la compréhension s'ajoute plutôt que remplace). Entièrement écrites à la main, pas
 * dérivées d'un bloc de contenu : elles testent le POURQUOI et les liens entre notions d'un point
 * du chapitre, jamais la restitution d'une preuve ou d'un calcul déjà résolu dans le cours. Chaque
 * futur chapitre ajouté demandera sa propre liste (peut rester vide pour une section qui n'en a pas
 * encore).
 */
interface QuestionOuverteBrute {
  enonce: string
  corrige: string
}

const QUESTIONS_COMPREHENSION: Record<string, Record<string, QuestionOuverteBrute[]>> = {
  'fonctions-reciproques-cyclometriques': {
  reciproques: [
    {
      enonce: "Pourquoi une fonction non injective ne peut-elle pas avoir de relation réciproque qui soit elle-même une fonction ?",
      corrige:
        "Un même x de Image(f) serait alors associé à plusieurs y distincts (tous ceux qui ont cette image par f) — ce qui contredit la définition d'une fonction, où chaque entrée n'a qu'une seule sortie. C'est exactement ce qui arrive pour f(x)=x² sur ℝ : x=1 a pour image 1, mais -1 aussi ; la relation réciproque associerait donc à la fois -1 et 1 à l'entrée 1.",
    },
    {
      enonce: 'Que représente géométriquement le graphe de f⁻¹ par rapport à celui de f, et pourquoi ?',
      corrige:
        "Le graphe de f⁻¹ est le symétrique du graphe de f par rapport à la droite y=x. Cela vient directement de la construction de la relation réciproque : chaque point (a;b) de f devient (b;a) sur f⁻¹ — abscisse et ordonnée échangées, exactement l'effet d'une symétrie par rapport à y=x.",
    },
    {
      enonce: "Pourquoi la restriction d'une fonction non injective à un intervalle plus petit peut-elle redevenir injective, et donc avoir une réciproque ?",
      corrige:
        "L'injectivité dépend du domaine considéré : réduire le domaine peut supprimer les paires de valeurs qui donnaient la même image. f(x)=x² n'est pas injective sur ℝ (1 et -1 ont la même image), mais sa restriction à ℝ⁺ l'est (deux réels positifs distincts ont toujours des carrés distincts) — c'est cette restriction qui a une réciproque, √x.",
    },
    {
      enonce: 'f⁻¹(x) et 1/f(x) désignent-ils la même chose ? Justifie.',
      corrige:
        "Non — ce sont deux objets sans aucun rapport, malgré la notation qui se ressemble. f⁻¹(x) est la valeur qui, par f, redonne x (la fonction réciproque) ; 1/f(x) est simplement l'inverse numérique de f(x). Pour f(x)=5/(x-1), f⁻¹(x)=1+5/x, alors que 1/f(x)=(x-1)/5 — deux expressions bien distinctes.",
    },
  ],
  cyclometriques: [
    {
      enonce: "Pourquoi sin, cos et tan n'ont-elles pas de réciproque sur ℝ tout entier ?",
      corrige:
        "Parce qu'elles sont périodiques : une infinité de valeurs de x donnent la même image (sin(0)=sin(π)=sin(2π)=0, par exemple). Elles ne sont donc jamais injectives sur ℝ tout entier, et sans injectivité, pas de relation réciproque qui soit une fonction.",
    },
    {
      enonce: "Sur quel critère choisit-on l'intervalle de restriction de sin, cos et tan pour construire arcsin, arccos et arctan ?",
      corrige:
        "Le plus court intervalle possible contenant 0 sur lequel la fonction redevient bijective — [−π/2;π/2] pour sin, [0;π] pour cos, ]−π/2;π/2[ pour tan. Un intervalle plus long recontiendrait plusieurs fois la même valeur (perte d'injectivité) ; mal centré, il ne contiendrait pas toute l'image.",
    },
    {
      enonce: 'Pourquoi peut-on dire que arcsin(1/2) est déjà connu depuis le cercle trigonométrique, sans calcul supplémentaire ?',
      corrige:
        "Une arcfonction pose la même question à l'envers : sin(π/6)=1/2 était déjà su, donc directement arcsin(1/2)=π/6 — chercher l'arc dont le sinus vaut x, c'est juste relire le cercle trigonométrique dans l'autre sens.",
    },
    {
      enonce: 'arccos(−x) est-il égal à −arccos(x) ? Justifie à partir de la parité de arccos.',
      corrige:
        "Non — contrairement à arcsin et arctan, arccos n'est pas impaire. La relation correcte est arccos(−x) = π − arccos(x), pas arccos(−x) = −arccos(x).",
    },
  ],
  equations: [
    {
      enonce: "Pourquoi la condition d'existence est-elle indispensable avant de résoudre une équation avec arcsin ou arccos, alors qu'elle ne l'est jamais pour arctan ?",
      corrige:
        "arcsin(u) et arccos(u) n'existent que si u∈[−1;1] — un domaine borné — alors qu'arctan(u) existe pour tout réel u. Poser la CE pour arcsin/arccos revient à vérifier que l'argument reste dans ce domaine restreint, une vérification qui n'a simplement pas lieu d'être pour arctan.",
    },
    {
      enonce: 'Pourquoi arcsin(A) = arcsin(B) ⟺ A = B, alors que ce n\'est PAS vrai pour sin (sin(A)=sin(B) n\'entraîne pas A=B en général) ?',
      corrige:
        "Parce que arcsin est injective sur son domaine [−1;1] — contrairement à sin sur ℝ tout entier, qui est périodique et prend chaque valeur une infinité de fois. C'est la restriction du domaine qui rend l'implication valide pour arcsin, là où sin ne la vérifie pas.",
    },
    {
      enonce: "Dans la méthode en 3 temps pour résoudre une équation avec des arcfonctions, pourquoi l'étape 3 (vérifier la CE) ne peut-elle jamais être sautée ?",
      corrige:
        "Résoudre l'équation simplifiée (étape 2) peut faire apparaître des solutions qui ne respectent pas la CE posée en étape 1 — arccos(x²−1)=arccos(1−x) le montre : x=−2 est une racine correcte de l'équation simplifiée, mais elle est hors CE et doit être rejetée, car arccos(3) n'existe tout simplement pas.",
    },
  ],
  derivees: [
    {
      enonce: 'Pourquoi la dérivée de arccos comporte-t-elle un signe moins, alors que celle de arcsin n\'en a pas ?',
      corrige:
        "Ce signe vient de la dérivée de cos, qui vaut −sin (alors que (sin)'=cos) — ce n'est pas un choix arbitraire du signe de la racine (positif dans les deux démonstrations). Il traduit un fait visible sur le graphe : arccos est décroissante, alors que arcsin est croissante.",
    },
    {
      enonce: 'Pourquoi arctan est-elle dérivable sur ℝ tout entier, alors que arcsin et arccos ne le sont que sur ]−1;1[ ?',
      corrige:
        "La dérivée de arctan, 1/(1+x²), a un dénominateur qui ne s'annule jamais. Celles de arcsin et arccos ont un dénominateur √(1−x²), qui s'annule en x=±1 — et on démontre par l'absurde qu'elles n'y sont effectivement pas dérivables, contrairement à arctan.",
    },
    {
      enonce: 'Le fait que la formule 1/√(1−x²) ne soit pas définie en x=±1 suffit-il à prouver que arcsin n\'y est pas dérivable ? Justifie.',
      corrige:
        "Non — une formule non définie en un point ne prouve rien à elle seule : elle vient d'un théorème dont les hypothèses ne sont pas vérifiées en ce point, et des hypothèses non vérifiées n'établissent jamais la non-dérivabilité. Seul un raisonnement par l'absurde direct établit réellement que arcsin n'est pas dérivable en ±1.",
    },
  ],
  graphiques: [
    {
      enonce: "Un graphe a un domaine non borné (ℝ tout entier) et deux asymptotes horizontales. De quelle arcfonction peut-il s'agir, et pourquoi ces deux critères suffisent-ils à trancher ?",
      corrige:
        "Il s'agit d'arctan — la seule des trois dont le domaine est ℝ tout entier (arcsin et arccos sont bornées à [−1;1]), et la seule à posséder des asymptotes horizontales (y=±π/2). Ces deux critères l'identifient sans ambiguïté, sans même observer le sens de variation.",
    },
    {
      enonce: 'Comment distinguer le graphe d\'arcsin de celui d\'arccos à partir du seul sens de variation ?',
      corrige:
        "arcsin est strictement croissante, arccos est strictement décroissante — le critère le plus rapide pour les distinguer, puisque les deux ont le même domaine borné [−1;1] (un domaine borné seul ne suffit donc pas à les différencier).",
    },
    {
      enonce: "Pourquoi un graphe au domaine borné à [−1;1] ne peut-il jamais correspondre à arctan ?",
      corrige:
        "Parce qu'arctan a pour domaine ℝ tout entier — jamais restreinte à [−1;1]. Un domaine borné à [−1;1] élimine donc automatiquement arctan et ne laisse que arcsin ou arccos, à départager ensuite par le sens de variation.",
    },
  ],
  },
  'fonction-second-degre': {
    etudier: [
      {
        enonce:
          "Pourquoi le domaine d'une fonction du second degré est-il toujours ℝ, alors que son image dépend du signe de a ?",
        corrige:
          "Le domaine est toujours ℝ parce que $ax^2+bx+c$ ne contient ni dénominateur ni racine carrée : rien n'empêche jamais le calcul, quelle que soit la valeur de x. L'image, elle, dépend du sommet : comme la parabole a un minimum (si $a>0$) ou un maximum (si $a<0$), elle n'atteint jamais les valeurs situées de l'autre côté de $y_S$ — un seul côté de l'axe des y est donc occupé, contrairement au domaine qui occupe tout l'axe des x.",
      },
      {
        enonce:
          "Une parabole a deux racines distinctes x₁ et x₂. Pourquoi peut-on affirmer, sans aucun autre calcul, que l'axe de symétrie passe par leur milieu ?",
        corrige:
          "Parce que $f(x_1)=f(x_2)=0$ : ce sont deux points de la courbe à la même hauteur (0). Une parabole étant toujours symétrique par rapport à une droite verticale passant par son sommet, deux points de même hauteur sont nécessairement à la même distance de cet axe, de part et d'autre. Leur milieu tombe donc forcément sur l'axe de symétrie — c'est une conséquence directe de la symétrie, pas un nouveau calcul.",
      },
      {
        enonce:
          "Pourquoi le signe de a seul suffit-il à savoir si une parabole a un maximum ou un minimum, sans connaître b ni c ?",
        corrige:
          "Parce que b et c ne font que décaler la courbe (horizontalement, verticalement) : ils changent la position du sommet, jamais le sens dans lequel la parabole s'ouvre. Seul a détermine cette ouverture — comme une balle lancée en l'air (toujours un point culminant, jamais un creux) contre une bille dans un bol (toujours un creux, jamais un sommet) : c'est une propriété de forme, entièrement fixée par a, indépendante de où la courbe se trouve.",
      },
    ],
    transformer: [
      {
        enonce:
          "Pourquoi $y=(x-3)^2$ déplace-t-elle la courbe vers la droite, alors que le signe dans la parenthèse est un moins ?",
        corrige:
          "Le sommet de $y=x^2$ est en $x=0$, là où l'intérieur de la parenthèse s'annule. Pour $y=(x-3)^2$, l'intérieur s'annule en $x=3$ : c'est donc là que se trouve désormais le sommet. Le signe écrit dans la parenthèse n'indique pas le sens du déplacement — il indique la valeur de x qui annule la parenthèse, qui est l'opposée de ce signe.",
      },
      {
        enonce:
          "Qu'est-ce qui distingue, dans leurs effets sur le graphique, le coefficient a (devant le carré) des paramètres de translation (p et q) ?",
        corrige:
          "a change la **forme** de la courbe : il la resserre, l'aplatit, ou la retourne (symétrie d'axe Ox) si son signe change — la courbe change d'allure. Les translations p et q, elles, ne changent jamais la forme : elles déplacent la courbe tout entière, horizontalement ou verticalement, sans la déformer. Une translation copie-colle la courbe ailleurs ; a la remodèle sur place.",
      },
      {
        enonce: "Pourquoi doit-on mettre a en évidence avant de compléter le carré, quand a ≠ 1 ?",
        corrige:
          "Compléter le carré repose sur l'identité $(x+k)^2=x^2+2kx+k^2$, qui ne fonctionne que si le coefficient devant $x^2$ vaut exactement 1. Si $a\\neq1$, le coefficient de $x^2$ dans l'expression de départ n'est pas 1 : il faut donc d'abord le sortir en facteur commun sur les deux premiers termes pour se ramener à une parenthèse où ce coefficient vaut 1, et pouvoir y appliquer l'identité correctement.",
      },
    ],
    utiliser: [
      {
        enonce:
          "Pourquoi faut-il toujours vérifier si l'abscisse du sommet appartient au domaine de validité avant de conclure à un optimum ?",
        corrige:
          "Le sommet est l'optimum **mathématique** de la fonction entière, mais le problème réel restreint souvent x à un domaine de validité plus petit. Si ce sommet théorique tombe hors de ce domaine, la fonction n'y est jamais atteinte : elle reste monotone sur tout le domaine restreint, un peu comme un sentier qui s'arrête avant d'atteindre le vrai sommet d'une montagne — son point culminant réel est alors à l'endroit où il s'arrête, c'est-à-dire à une borne.",
      },
      {
        enonce:
          "Une solution mathématique d'une équation posée en contexte peut être rejetée. Pourquoi, et à quoi correspond ce rejet concrètement ?",
        corrige:
          "Résoudre $f(x)=k$ donne des solutions purement mathématiques, sans tenir compte du sens physique de x. Une fois trouvées, chaque solution doit être confrontée au domaine de validité réel de la situation (un temps, une longueur, un prix...). Une racine mathématiquement correcte peut très bien représenter une valeur impossible dans la réalité — un temps négatif, par exemple — et doit alors être rejetée, même si le calcul qui l'a produite était juste.",
      },
      {
        enonce:
          "Quelle différence y a-t-il entre le domaine (mathématique) d'une fonction du second degré et le domaine de validité d'un problème concret qu'elle modélise ?",
        corrige:
          "Le domaine mathématique d'une fonction du second degré est toujours ℝ tout entier, sans exception. Le domaine de validité, lui, ne retient que les valeurs de x qui ont un sens dans la situation réelle modélisée — jamais une longueur négative, par exemple. Les deux ne coïncident donc presque jamais : le domaine de validité est une restriction du domaine mathématique, imposée par le contexte, pas par le calcul.",
      },
    ],
  },
  'equations-inequations-second-degre': {
    resoudre: [
      {
        enonce:
          "Pourquoi essaie-t-on toujours une des 4 méthodes rapides avant de se lancer dans le calcul du discriminant ?",
        corrige:
          "Le discriminant fonctionne toujours, dans tous les cas — mais c'est aussi la méthode qui demande le plus de calculs. Face à une équation, c'est comme face à une porte fermée : on essaie d'abord la poignée (les 4 cas rapides : mise en évidence, différence de carrés, carré parfait, mise en évidence généralisée) avant d'attaquer le mur au marteau. Le discriminant reste le dernier recours, pas le premier réflexe.",
      },
      {
        enonce:
          "Deux équations du second degré ont le même discriminant Δ. Qu'est-ce que cela garantit, et qu'est-ce que cela ne garantit pas ?",
        corrige:
          "Un même Δ garantit le même **type** de situation : deux solutions distinctes si $\\Delta>0$, une racine double si $\\Delta=0$, aucune solution réelle si $\\Delta<0$ — c'est uniquement le signe de Δ qui détermine ce nombre. Mais cela ne garantit absolument pas que les solutions elles-mêmes soient identiques : la formule $x=\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}$ dépend aussi de a et de b séparément, pas seulement de Δ.",
      },
      {
        enonce:
          "À quoi servent les relations de Viète si on connaît déjà la formule du discriminant pour trouver les racines ?",
        corrige:
          "Elles évitent de refaire tout le calcul du discriminant. Connaissant les deux racines, on peut vérifier rapidement qu'elles sont correctes en comparant leur somme à $-b/a$ et leur produit à $c/a$ — sans recalculer Δ ni la racine carrée. De même, si on connaît déjà une racine, Viète permet de retrouver l'autre directement par une simple soustraction ou division, bien plus vite qu'un calcul complet.",
      },
    ],
    'signe-trinome': [
      {
        enonce:
          "Pourquoi la solution d'une inéquation du second degré s'écrit-elle toujours avec des crochets inversés, jamais avec des parenthèses comme en français courant ?",
        corrige:
          "La notation à crochets inversés indique précisément si chaque borne est incluse ou exclue : un crochet ouvert vers l'intérieur de l'intervalle exclut la borne, un crochet ouvert vers l'extérieur l'inclut. Des parenthèses, comme en français, ne porteraient aucune information de ce type. C'est cette précision — essentielle pour une inégalité large ou stricte — qui impose cette notation en mathématiques.",
      },
      {
        enonce: "Une inégalité large (≤ ou ≥) inclut-elle automatiquement les racines dans la solution ? Justifie.",
        corrige:
          "Non, pas automatiquement. Une inégalité large n'inclut une borne que si cette borne est **réellement une racine** du trinôme — c'est-à-dire un endroit où le trinôme vaut exactement 0, valeur acceptée par ≤ ou ≥. Si la borne provient d'une autre contrainte (une valeur interdite, par exemple), elle reste exclue même avec un symbole large. Il faut donc toujours se poser la question, jamais répondre par automatisme.",
      },
      {
        enonce:
          "Pourquoi le trinôme a-t-il le signe opposé à a entre ses deux racines, et le signe de a à l'extérieur ?",
        corrige:
          "Entre les deux racines, la courbe est du côté opposé à son sommet par rapport à l'axe des x : si $a>0$ (parabole ouverte vers le haut, minimum), elle plonge sous l'axe entre les racines, donc négative — signe opposé à a. À l'extérieur des racines, elle remonte du même côté que son ouverture, donc du signe de a. C'est la forme même de la parabole, et la position de ses racines par rapport à son sommet, qui impose cette alternance.",
      },
    ],
    'signe-produit': [
      {
        enonce:
          "Pourquoi un facteur quadratique irréductible (Δ < 0) n'ajoute-t-il aucune racine ni aucune colonne supplémentaire dans le tableau de signes d'un produit ?",
        corrige:
          "Un facteur irréductible ne s'annule jamais pour aucun x réel — il n'a pas de racine. Il garde donc le même signe (celui de son propre a) sur toute la droite, sans jamais changer. Comme un tableau de signes ne sert qu'à repérer les changements de signe d'un facteur à l'autre, un facteur qui ne change jamais de signe n'a besoin d'aucune nouvelle colonne : sa ligne reste identique partout.",
      },
      {
        enonce:
          "Pourquoi suffit-il de compter le nombre de facteurs négatifs (plutôt que de multiplier tous les signes un par un) pour connaître le signe d'un produit ?",
        corrige:
          "Chaque facteur négatif inverse une fois le signe du produit, comme un interrupteur qui bascule de + à − ou l'inverse. Un nombre pair de facteurs négatifs revient donc exactement au signe de départ (les inversions s'annulent deux par deux), un nombre impair termine sur le signe inversé. Compter la parité du nombre de négatifs donne donc directement le résultat, sans avoir à multiplier chaque signe un par un.",
      },
      {
        enonce:
          "Un facteur s'annule en une valeur donnée. Que vaut le produit entier à cet endroit, même si les autres facteurs n'y sont pas nuls ? Pourquoi ?",
        corrige:
          "Le produit entier vaut 0 à cet endroit, quelles que soient les valeurs des autres facteurs. C'est une propriété de la multiplication : dès qu'un seul facteur d'un produit vaut 0, le produit tout entier vaut 0 — peu importe que les autres facteurs soient très grands ou très petits, positifs ou négatifs.",
      },
    ],
    simplifier: [
      {
        enonce:
          "Pourquoi faut-il poser la condition d'existence sur le dénominateur avant de simplifier la fraction, et pas après ?",
        corrige:
          "Un facteur qu'on enlève par simplification reste malgré tout interdit : il annulait le dénominateur avant simplification, et cette interdiction ne disparaît pas parce qu'on a réécrit la fraction autrement — c'est la même fraction, juste exprimée différemment. Si on pose la CE après avoir simplifié, on risque de l'oublier complètement, puisque le facteur dangereux n'apparaît plus dans l'écriture simplifiée.",
      },
      {
        enonce:
          "Le dénominateur d'une fraction est un carré parfait $(x-p)^2$. Pourquoi la fraction ne devient-elle jamais un simple polynôme, même après simplification ?",
        corrige:
          "Simplifier une seule fois le facteur $(x-p)$ avec le numérateur n'enlève qu'**une** des deux occurrences de ce facteur au carré : il en reste encore un au dénominateur après simplification. La fraction garde donc toujours un vrai dénominateur, et $x=p$ reste interdit — elle ne se transforme jamais en un polynôme sans dénominateur sur ce facteur précis.",
      },
    ],
    'inconnue-denominateur': [
      {
        enonce:
          "Pourquoi multiplier en croix peut-il faire apparaître une solution qui n'existait pas dans l'équation de départ ?",
        corrige:
          "Multiplier en croix revient à multiplier les deux membres de l'équation par les dénominateurs. Mais une de ces expressions peut valoir 0 pour certaines valeurs de x — exactement celles que la CE interdisait déjà. L'équation obtenue après multiplication est donc moins stricte que l'originale : elle accepte des valeurs que l'équation de départ refusait. Ces valeurs en trop sont les racines étrangères.",
      },
      {
        enonce:
          "Quelle différence fais-tu entre une « racine » et une « solution » dans ce chapitre ? Donne un exemple où elles diffèrent.",
        corrige:
          "Une racine annule une expression rencontrée en cours de calcul (un facteur, un numérateur…), alors qu'une solution vérifie vraiment l'équation ou l'inéquation de l'énoncé de départ. Le plus souvent, c'est la même chose. Mais une racine qui annule aussi un dénominateur devient une racine étrangère : elle reste une racine du numérateur mis en équation, mais elle n'est plus une vraie solution, puisqu'elle rend l'équation d'origine non définie.",
      },
    ],
    'inequations-rationnelles': [
      {
        enonce:
          "Pourquoi une valeur qui annule le dénominateur est-elle toujours exclue de la solution, même avec un symbole large (≤ ou ≥) ?",
        corrige:
          "Diviser par 0 n'a tout simplement pas de sens : le quotient n'existe pas à cet endroit, il n'est ni positif, ni négatif, ni nul. Que le symbole soit strict ou large ne change rien à ce problème — une valeur où le quotient n'existe pas ne peut jamais être une solution, puisqu'elle ne vérifie ni une inégalité stricte ni une égalité à 0.",
      },
      {
        enonce: "Quelle différence y a-t-il entre une case « 0 » et une case « ∄ » dans le tableau de signes d'un quotient ?",
        corrige:
          "Une case « 0 » signifie que le **numérateur** s'annule à cet endroit : le quotient vaut réellement 0, et cette valeur peut être incluse dans la solution si le symbole est large. Une case « ∄ » signifie que c'est le **dénominateur** qui s'annule : le quotient n'est pas défini du tout à cet endroit, et cette valeur reste toujours exclue, quel que soit le symbole. Les deux cases se ressemblent mais ont un statut opposé.",
      },
      {
        enonce:
          "Pour une inéquation comme $\\dfrac{x-2}{x+1}\\ge 3$, pourquoi doit-on tout ramener à un seul membre et un seul dénominateur, plutôt que de raisonner directement sur l'inégalité telle qu'elle est donnée ?",
        corrige:
          "Le signe du dénominateur $(x+1)$ n'est pas connu à l'avance : multiplier directement les deux membres par lui inverserait ou non le sens de l'inégalité selon que x soit plus grand ou plus petit que $-1$, ce qu'on ne sait pas encore. En ramenant tout à un seul quotient comparé à 0, on retrouve une situation où un simple tableau de signes donne la réponse sans jamais avoir à deviner le signe d'une expression inconnue.",
      },
    ],
  },
  'caracteristiques-fonctions-reference': {
    lire: [
      {
        enonce:
          "Pourquoi un maximum (ou un minimum) d'une fonction n'est-il jamais une propriété absolue, mais toujours relative à un intervalle ?",
        corrige:
          "Un maximum sur $[c\\,;\\,d]$ est défini comme la plus grande valeur atteinte par f **sur cet intervalle précis**, pas sur tout son domaine. Si on restreint la fenêtre d'observation, le point qui réalisait ce maximum peut se retrouver hors du nouvel intervalle : une même courbe peut donc avoir un maximum de 3 sur $[-9\\,;\\,2]$, puis un maximum tout différent sur $[-8\\,;\\,0]$, simplement parce que le point le plus haut de la première fenêtre n'appartient pas à la seconde.",
      },
      {
        enonce:
          "Un même symbole en cercle sur un graphique peut signifier trois choses différentes. Explique la différence entre un « trou » et un « point redéfini ».",
        corrige:
          "Un trou (deux cercles vides, des deux côtés) signifie que cette valeur est réellement **exclue du domaine** : la fonction n'y est pas définie du tout. Un point redéfini a l'air pareil à première vue (deux cercles vides, apparence de coupure), mais un point plein isolé apparaît ailleurs sur la même verticale : la valeur appartient bien au domaine, elle a juste une image qui ne suit pas la continuité apparente de la courbe autour d'elle.",
      },
      {
        enonce:
          "Pourquoi dit-on qu'une fonction paire a Oy comme axe de symétrie, alors qu'une fonction impaire a l'origine comme centre de symétrie ? Quelle est la différence géométrique entre ces deux symétries ?",
        corrige:
          "Pour une fonction paire, $f(-a)=f(a)$ : les points d'abscisses opposées ont la même hauteur, exactement comme un reflet dans un miroir posé sur l'axe Oy — une symétrie axiale. Pour une fonction impaire, $f(-a)=-f(a)$ : les points d'abscisses opposées ont des hauteurs opposées, ce qui correspond à une rotation d'un demi-tour (180°) autour de l'origine — une symétrie centrale, pas un reflet dans un miroir.",
      },
    ],
    algebrique: [
      {
        enonce:
          "Pour la racine carrée $f(x)=\\sqrt{ax+b}+k$, pourquoi le sens de l'inégalité de la condition d'existence dépend-il du signe de a ?",
        corrige:
          "Isoler x dans $ax+b\\ge0$ demande de diviser les deux membres par a. Or diviser par un nombre **négatif** inverse toujours le sens d'une inégalité — une règle valable partout, pas seulement ici. C'est pourquoi le domaine est $[p\\,;\\,{+\\infty}[$ si $a>0$ (le sens ne change pas), mais $]{-\\infty}\\,;\\,p]$ si $a<0$ (le sens s'inverse).",
      },
      {
        enonce:
          "Pourquoi l'isolement de la famille carrée ou valeur absolue mène-t-il toujours à deux équations distinctes, alors que l'isolement de l'inverse, du cube ou de la racine cubique n'en donne qu'une seule ?",
        corrige:
          "Le carré et la valeur absolue ne sont pas injectifs : deux entrées opposées donnent toujours la même sortie ($(-u)^2=u^2$ et $|-u|=|u|$). Isoler $P(x)^2=K$ ou $|P(x)|=K$ (K>0) doit donc tenir compte des deux possibilités, $P(x)=\\sqrt{K}$ et $P(x)=-\\sqrt{K}$ (ou $P(x)=K$ et $P(x)=-K$). L'inverse, le cube et la racine cubique sont, eux, injectifs : une seule entrée correspond à chaque sortie, donc une seule équation suffit.",
      },
      {
        enonce:
          "Le tableau donne 0 zéro pour K < 0 avec la famille carrée, mais toujours exactement 1 zéro pour K < 0 avec la famille inverse. Pourquoi cette différence ?",
        corrige:
          "L'image de la famille carrée est $[0\\,;\\,{+\\infty}[$ : elle ne prend jamais de valeur négative, donc $P(x)^2=K$ n'a aucune solution si $K<0$. L'image de la famille inverse est $\\mathbb{R}\\setminus\\{0\\}$ : elle prend aussi bien des valeurs positives que négatives (en s'approchant de 0 sans jamais l'atteindre), donc $1/P(x)=K$ reste toujours résoluble, quel que soit le signe de K — d'où exactement 1 zéro dans tous les cas.",
      },
    ],
    transformer: [
      {
        enonce:
          "Pourquoi le point caractéristique d'une courbe transformée reste-t-il toujours exactement en x = TH, quels que soient les réglages de CH, EH, EV, CV, SOX ou SOY ?",
        corrige:
          "Le point caractéristique de g correspond toujours à l'endroit où l'argument qu'on lui donne vaut 0. Dans la formule unifiée, cet argument est $SOY\\cdot\\dfrac{CH}{EH}\\cdot(x-TH)$ : quel que soit le facteur multiplicatif devant $(x-TH)$, ce produit s'annule exactement quand $x=TH$, et seulement là. CH, EH et SOY changent donc comment la courbe se déforme ou se retourne **autour** de ce point, mais aucun d'eux ne peut déplacer l'endroit où l'argument vaut 0. EV, CV et SOX, eux, n'agissent que sur le résultat de g (donc verticalement), jamais sur son argument.",
      },
      {
        enonce:
          "Pour une fonction impaire (comme le cube ou l'inverse), activer seulement SOY donne exactement la même courbe qu'activer seulement SOX. Pourquoi, alors que ce n'est pas vrai pour une fonction paire ?",
        corrige:
          "Pour une fonction impaire, $g(-u)=-g(u)$ : inverser le signe de l'entrée produit exactement le même effet que inverser le signe de la sortie. Activer SOY seul (qui inverse l'entrée) ou SOX seul (qui inverse la sortie) donne donc la même courbe. Pour une fonction paire, $g(-u)=g(u)$ : inverser l'entrée ne change strictement rien à la sortie, alors que SOX (qui inverse la sortie) change bel et bien la courbe — les deux symétries ne peuvent donc jamais coïncider dans ce cas.",
      },
      {
        enonce:
          "Pourquoi le signe à l'intérieur de la parenthèse (x − TH) est-il toujours l'opposé du sens réel du déplacement horizontal ?",
        corrige:
          "Le point caractéristique se trouve là où l'argument de g s'annule, c'est-à-dire là où $x-TH=0$, soit $x=TH$. Si l'expression affichée est $(x+3)$, on l'identifie à $x-TH$ en écrivant $x-TH=x+3$, ce qui donne $TH=-3$ : la translation est donc de 3 unités vers la **gauche**, alors que le signe écrit dans la parenthèse est un plus. Le signe apparent est toujours l'opposé de TH, parce que TH est par construction **soustrait** dans la formule — jamais ajouté.",
      },
    ],
  },
  'statistique-descriptive': {
    frequences: [
      {
        enonce:
          "Pourquoi calcule-t-on toujours la fréquence cumulée à partir de l'effectif cumulé (fᵢ cumulé = nᵢ cumulé / n), plutôt que de l'additionner séparément ligne par ligne ?",
        corrige:
          "Parce que les deux colonnes doivent rester cohérentes entre elles par construction : la fréquence cumulée n'est qu'une autre façon d'exprimer le même décompte que l'effectif cumulé, en proportion plutôt qu'en nombre brut. Les additionner séparément créerait deux sources de vérité qui pourraient diverger (à cause d'arrondis différents à chaque ligne), alors qu'il n'existe qu'un seul vrai décompte cumulé — celui des effectifs.",
      },
      {
        enonce:
          "Une série brute et le tableau de fréquences qu'on en tire contiennent-ils la même information ? Qu'est-ce que le tableau apporte que la liste brute ne montre pas directement ?",
        corrige:
          "Oui, aucune donnée n'est perdue en passant de l'un à l'autre : les deux décrivent exactement la même série. Ce que le tableau apporte, c'est l'organisation — les valeurs distinctes triées par ordre croissant, avec leur comptage explicite. Dans la liste brute, mélangée et non triée, repérer qu'une valeur revient 7 fois demande de la parcourir entièrement ; dans le tableau, cette information saute aux yeux sur une seule ligne.",
      },
    ],
    histogramme: [
      {
        enonce:
          "Pourquoi utilise-t-on la convention [borne inf ; borne sup[ (fermée à gauche, ouverte à droite) pour les classes, plutôt que des intervalles fermés des deux côtés ?",
        corrige:
          "Avec des intervalles fermés des deux côtés, une donnée tombant exactement sur une frontière commune à deux classes appartiendrait aux deux à la fois — elle serait comptée deux fois, et le découpage deviendrait ambigu. La convention [inf ; sup[ garantit que chaque donnée appartient à une seule classe, exactement : elle entre dans la classe dont c'est la borne inférieure, jamais dans celle dont c'est la borne supérieure. Seule la toute dernière classe du tableau fait exception et se ferme des deux côtés, pour ne perdre aucune donnée à l'extrémité de la série.",
      },
      {
        enonce:
          "Si deux classes avaient des amplitudes différentes, pourquoi la hauteur de leur rectangle ne suffirait-elle plus à représenter fidèlement leur effectif ?",
        corrige:
          "Parce qu'un rectangle plus large, même à effectif égal, paraît visuellement plus peuplé qu'un rectangle étroit — l'œil compare des aires, pas seulement des hauteurs. Si la hauteur restait égale à l'effectif quelle que soit l'amplitude, une classe large à effectif moyen semblerait occuper beaucoup plus de place qu'une classe étroite au même effectif. C'est pour ça que la règle générale (hors de cette plateforme, où les amplitudes sont toujours égales) impose que l'**aire** du rectangle, pas sa hauteur, reste proportionnelle à l'effectif.",
      },
    ],
    moyenne: [
      {
        enonce:
          "Pourquoi la moyenne des valeurs distinctes seules (en ignorant les effectifs) donne-t-elle, en général, un résultat faux ?",
        corrige:
          "Parce qu'elle traite chaque valeur distincte comme si elle comptait une seule fois, alors que certaines valeurs apparaissent beaucoup plus souvent que d'autres dans la série réelle. Une valeur qui revient 8 fois doit peser 8 fois plus dans le calcul qu'une valeur isolée — c'est exactement le rôle des effectifs nᵢ dans la formule pondérée. Les ignorer revient à prétendre que la série est parfaitement équilibrée entre ses valeurs distinctes, ce qui n'est presque jamais le cas.",
      },
      {
        enonce:
          "Pour des données regroupées en classes, pourquoi utilise-t-on le centre de chaque classe comme représentant de toutes les valeurs qu'elle contient ?",
        corrige:
          "Parce qu'une fois les données regroupées en classes, on ne connaît plus les valeurs individuelles à l'intérieur de chacune — seulement leur nombre. Le centre est la meilleure estimation ponctuelle possible de ces valeurs inconnues : à défaut d'information supplémentaire, on suppose qu'elles se répartissent à peu près uniformément de part et d'autre du milieu de la classe, ce qui rend le centre la valeur la moins biaisée pour représenter le groupe entier dans le calcul de la moyenne.",
      },
    ],
    position: [
      {
        enonce:
          "Pourquoi faut-il prendre la première valeur dont l'effectif cumulé dépasse strictement le seuil (n/2, n/4 ou 3n/4), et jamais celle qui l'atteint tout juste ?",
        corrige:
          "Le seuil compte un nombre d'individus, pas une valeur particulière. Si l'effectif cumulé atteint exactement ce seuil à une certaine valeur, cela signifie que cette valeur regroupe pile les derniers individus comptés jusque-là — mais rien ne garantit encore qu'elle se trouve du bon côté de la coupure recherchée. Il faut passer à la valeur suivante, celle dont le cumulé dépasse réellement le seuil, pour être certain d'avoir dépassé la bonne proportion de la série. S'arrêter dès que le cumulé « approche » ou « atteint » le seuil revient à inclure une valeur qui appartient encore à la portion basse.",
      },
      {
        enonce:
          "Pourquoi la médiane est-elle beaucoup moins sensible qu'une moyenne à une valeur extrême, comme le château à 10 000 000 € au milieu de neuf maisons à 200 000 € ?",
        corrige:
          "Parce que la médiane ne regarde que le **rang** d'un individu dans la série triée, jamais sa valeur numérique. Que le château coûte 10 millions ou 50 millions d'euros ne change rien à son rang : il reste la dixième et dernière maison de la liste triée, et la médiane continue de désigner le prix d'une maison « normale » du milieu. La moyenne, elle, additionne toutes les valeurs : un seul nombre énorme suffit à faire grimper tout le résultat, même si une seule maison sur dix est concernée.",
      },
    ],
    boite: [
      {
        enonce:
          "Pourquoi l'écart interquartile (la largeur de la boîte) est-il un meilleur indicateur de dispersion que l'étendue (max − min), pour juger si une série est homogène ?",
        corrige:
          "L'étendue ne dépend que des deux valeurs extrêmes de la série — un seul individu exceptionnel (très petit ou très grand) suffit à la faire exploser, sans que le reste de la série en soit affecté. L'écart interquartile, lui, mesure la largeur du groupe central (la moitié des individus qui ne sont ni parmi les plus petits ni parmi les plus grands) : il reste stable même si un individu isolé est extrême, et reflète donc mieux la dispersion réelle des valeurs « typiques » de la série.",
      },
      {
        enonce:
          "Deux séries ont la même médiane, mais des boîtes à moustaches de largeurs très différentes. Que peut-on en conclure sur chacune des deux séries ?",
        corrige:
          "La série à la boîte la plus étroite a ses valeurs centrales resserrées autour de la médiane : celle-ci résume donc bien toute la série, puisque la plupart des individus lui ressemblent. La série à la boîte la plus large a une médiane tout aussi valide comme centre, mais beaucoup moins représentative : les valeurs s'en écartent davantage, donc connaître la seule médiane donne une image moins fidèle de l'ensemble des données de cette série.",
      },
    ],
    dispersion: [
      {
        enonce:
          "Deux classes peuvent avoir exactement la même moyenne sans se ressembler du tout. Qu'apportent la variance et l'écart-type que la moyenne seule ne peut pas montrer ?",
        corrige:
          "La moyenne résume uniquement le centre d'une série — elle ne dit rien sur la façon dont les valeurs se répartissent autour de ce centre. Deux classes de moyenne 12/20 peuvent être radicalement différentes : l'une resserrée entre 10 et 14, l'autre partagée entre des 4/20 et des 20/20. La variance et l'écart-type mesurent justement cet étalement — à quel point les valeurs s'écartent, en moyenne, du centre — une information que la moyenne seule ne peut jamais distinguer.",
      },
      {
        enonce:
          "Pourquoi met-on les écarts (xᵢ − x̄) **au carré** dans la formule de la variance, plutôt que de les additionner directement tels quels ?",
        corrige:
          "Parce que la somme des écarts bruts à la moyenne vaut **toujours** exactement zéro — les écarts positifs (valeurs au-dessus de x̄) et négatifs (valeurs en-dessous) s'annulent exactement, par définition même de la moyenne. Mettre chaque écart au carré rend tous les termes positifs, pour qu'ils ne puissent plus s'annuler entre eux : la somme obtenue mesure alors vraiment l'ampleur de la dispersion. L'écart-type, racine carrée de cette variance, ramène ensuite le résultat dans l'unité d'origine des données.",
      },
    ],
    tchebychev: [
      {
        enonce:
          "Pourquoi l'inégalité de Bienaymé-Tchebychev n'a-t-elle de sens que pour k strictement supérieur à 1 ?",
        corrige:
          "La formule donne une proportion minimale $1 - 1/k^2$. Pour $k=1$, cette proportion vaut $0$ : la garantie devient totalement vide, puisqu'« au moins 0 % des valeurs » est toujours vrai sans rien apporter. Pour $k<1$, $1/k^2$ dépasse 1, et la proportion garantie devient **négative** — ce qui n'a aucun sens pour un pourcentage. Il faut donc $k>1$ pour obtenir une garantie à la fois positive et réellement informative.",
      },
      {
        enonce:
          "Cette inégalité s'applique-t-elle seulement à des séries de forme particulière (symétrique, en cloche...), ou à n'importe quelle série de données ? En quoi est-ce sa vraie force ?",
        corrige:
          "C'est justement sa force : l'inégalité est valable pour **n'importe quelle série**, quelle que soit sa forme — symétrique, très étalée, avec des pics multiples, peu importe. Elle ne demande de connaître que la moyenne et l'écart-type de la série, sans aucune hypothèse sur sa distribution. En contrepartie, elle ne donne jamais une valeur exacte, seulement une proportion **minimale garantie** — contrairement à des règles qui ne marchent que pour une forme de distribution précise.",
      },
    ],
    comparaison: [
      {
        enonce:
          "Pour comparer la dispersion de deux séries, pourquoi compare-t-on leurs écarts-types plutôt que leurs étendues ?",
        corrige:
          "L'étendue ne dépend que des deux valeurs extrêmes de chaque série — un seul individu exceptionnel suffit à la fausser, sans refléter la dispersion de l'ensemble. L'écart-type, lui, tient compte de **toutes** les données à la fois : c'est une mesure bien plus robuste et représentative de l'homogénéité réelle d'une série, utile précisément quand on veut savoir laquelle de deux séries est la plus resserrée autour de son centre.",
      },
      {
        enonce:
          "Pour répondre à « quel pourcentage se situe entre a et b ? » sur une courbe des effectifs cumulés, pourquoi doit-on lire séparément le cumulé en a et en b, puis les soustraire, plutôt que de lire directement l'intervalle sur la courbe ?",
        corrige:
          "Parce qu'une courbe d'effectifs cumulés donne, en chaque point, le total accumulé **depuis le début** de la série jusqu'à cette valeur — jamais le nombre d'individus dans une tranche isolée. Il n'existe donc rien à « lire directement » entre a et b : il faut lire la valeur cumulée en b (tout ce qui est en-dessous de b), lire celle en a (tout ce qui est en-dessous de a), puis soustraire pour isoler exactement ce qui se trouve entre les deux.",
      },
    ],
  },

  'cercle-trigonometrique-triangles': {
    cercle: [
      {
        enonce:
          "Pourquoi les angles 0°, 90°, 180° et 270° n'appartiennent-ils à aucun quadrant ?",
        corrige:
          "Les quadrants sont définis comme des intervalles **ouverts** (]0°;90°[, ]90°;180°[, etc.), délimités par ces quatre angles précisément parce qu'ils tombent exactement **sur** les axes du repère — à la frontière entre deux quadrants, jamais à l'intérieur de l'un d'eux. Demander leur signe n'a donc pas de sens : il faut donner leur valeur exacte directement (par exemple sin 90° = 1), plutôt que de chercher à les classer dans un quadrant qui n'existe pas pour eux.",
      },
      {
        enonce:
          "Pourquoi le cercle trigonométrique permet-il de définir sinus et cosinus pour n'importe quel angle, alors que dans un triangle rectangle ils n'ont de sens que pour des angles entre 0° et 90° ?",
        corrige:
          "Dans un triangle rectangle, sinus et cosinus sont définis comme des rapports de côtés (opposé/hypoténuse, adjacent/hypoténuse) — une construction qui n'existe que pour un angle aigu du triangle, donc entre 0° et 90°. Le cercle trigonométrique abandonne cette définition par rapport de côtés : il redéfinit sin θ et cos θ comme de simples **coordonnées** du point M(θ), qui peut se placer n'importe où en tournant autour du cercle entier. Cette nouvelle définition n'a plus besoin d'un triangle rectangle pour exister, donc elle fonctionne pour n'importe quel angle, même au-delà de 360° ou en négatif.",
      },
    ],
    identite: [
      {
        enonce:
          "Pourquoi obtient-on toujours deux valeurs candidates (un signe +, un signe −) en isolant cos θ ou sin θ à partir de l'identité fondamentale ? Comment choisit-on la bonne ?",
        corrige:
          "Isoler cos θ (ou sin θ) demande de prendre une racine carrée, et une racine carrée a toujours deux solutions opposées — c'est une propriété algébrique générale, pas une particularité de cette identité. L'identité seule ne peut donc jamais trancher entre les deux : il faut une information supplémentaire, le **quadrant** dans lequel se trouve θ (donné dans l'énoncé), pour lire dans le tableau des signes lequel des deux candidats est réellement correct.",
      },
      {
        enonce:
          "cos²θ + sin²θ = 1 et le théorème de Pythagore désignent-ils, au fond, la même idée ? Justifie.",
        corrige:
          "Oui, ce sont la même idée sous deux formes. M(θ) est par définition un point du cercle de rayon 1, donc à distance 1 de l'origine O. Le triangle formé par O, M et le pied de la projection de M sur l'axe horizontal est un triangle rectangle dont les deux côtés valent cos θ et sin θ, et dont l'hypoténuse vaut 1 (le rayon). Appliquer Pythagore à ce triangle précis donne exactement cos²θ + sin²θ = 1² — l'identité n'est rien d'autre que Pythagore appliqué à ce triangle rectangle particulier, et elle reste vraie pour n'importe quel θ puisque ce triangle existe toujours, quel que soit le quadrant.",
      },
    ],
    remarquables: [
      {
        enonce:
          "Pourquoi les 5 valeurs de cos θ (de 0° à 90°) sont-elles exactement les 5 valeurs de sin θ, lues dans l'ordre inverse ?",
        corrige:
          "Parce que 0°, 30°, 45°, 60° et 90° sont symétriques deux à deux par rapport à 45° (0° et 90° sont complémentaires, 30° et 60° aussi, 45° est son propre complémentaire). Pour deux angles complémentaires θ et 90°−θ, sin et cos échangent systématiquement leurs valeurs (sin(90°−θ) = cos θ). Lire la ligne des sinus de gauche à droite revient donc exactement à lire la ligne des cosinus de droite à gauche : ce n'est pas une coïncidence numérique, c'est une conséquence directe de cette relation de complémentarité.",
      },
      {
        enonce:
          "Pourquoi suffit-il de connaître les 5 valeurs remarquables du premier quadrant pour retrouver sin, cos ou tan de n'importe quel angle remarquable, dans n'importe quel quadrant ?",
        corrige:
          "Parce que tout angle, où qu'il soit, se ramène à un **angle du premier quadrant** — un angle aigu entre 0° et 90° qui porte la même valeur en grandeur. Une fois cet angle de référence trouvé, sa valeur se lit directement dans le tableau des 5 valeurs remarquables : il ne reste alors qu'à déterminer le **signe** correct grâce au quadrant de départ. Deux étapes simples et toujours les mêmes suffisent donc à couvrir absolument tous les cas, sans avoir besoin d'apprendre une valeur par quadrant.",
      },
    ],
    associes: [
      {
        enonce:
          "Pourquoi la famille « 90°−θ » est-elle la seule, parmi les 4 familles d'angles associés, où sinus et cosinus s'échangent au lieu de simplement changer de signe ?",
        corrige:
          "Parce que la symétrie associée à 90°−θ est un reflet de M(θ) par rapport à la diagonale qui échange les deux axes du repère — contrairement aux trois autres familles, qui reflètent par rapport à l'axe vertical, à l'axe horizontal, ou à travers le centre O. Échanger les deux axes échange nécessairement le rôle de leurs deux coordonnées : celle qui était « cos » devient « sin » et inversement. C'est cette symétrie particulière, et aucune autre, qui fait que les deux fonctions échangent leurs valeurs plutôt que de simplement changer de signe.",
      },
      {
        enonce:
          "sin(180°+θ) et sin(−θ) donnent-ils, au bout du compte, le même résultat ? Si oui, est-ce un hasard ?",
        corrige:
          "Oui, les deux valent −sin θ. Mais ce n'est pas la même opération géométrique qui produit ce résultat : 180°+θ est le reflet de M(θ) par symétrie **centrale** (à travers l'origine O), alors que −θ est son reflet par symétrie **axiale** (miroir le long de l'axe horizontal). Ce sont deux points différents du cercle, obtenus par deux transformations différentes — qui se trouvent simplement avoir la même ordonnée, donc le même sinus, sans que ce soit la même construction.",
      },
    ],
    equations: [
      {
        enonce:
          "Pourquoi sin α = k a-t-elle en général deux solutions sur [0°;360°[, alors que tan α = k en a toujours exactement deux, quelle que soit la valeur de k ?",
        corrige:
          "Une droite horizontale coupe en général un cercle en deux points distincts : ce sont les deux solutions de sin α = k. Ces deux points ne fusionnent en un seul que dans le cas limite où la droite touche le cercle tout en haut ou tout en bas (k = ±1). La tangente, elle, n'a pas cette construction par droite horizontale : elle a une **période de 180°**, et l'intervalle [0°;360°[ couvre exactement deux fois cette période — il y a donc toujours deux solutions distinctes pour tan α = k, sans jamais de cas limite où elles se confondraient, quelle que soit la valeur de k.",
      },
      {
        enonce:
          "Pourquoi les deux solutions de sin α = k (k>0) se déduisent-elles du couple (α₀, 180°−α₀), alors que celles de cos α = k (k>0) se déduisent du couple (α₀, 360°−α₀) ?",
        corrige:
          "Parce que chaque fonction trigonométrique est préservée par une famille différente d'angles associés (section précédente). Le sinus garde la même valeur par la symétrie « supplémentaire » 180°−θ (miroir le long de l'axe vertical, celui des sinus) : les deux solutions de sin α = k sont donc α₀ et son image par cette symétrie. Le cosinus, lui, garde la même valeur par la symétrie « opposé » −θ (≡ 360°−θ), un miroir le long de l'axe horizontal, celui des cosinus. Chaque équation se résout donc via la symétrie qui laisse justement cette coordonnée-là inchangée.",
      },
    ],
    triangle: [
      {
        enonce:
          "Pourquoi la loi des sinus est-elle inutilisable quand on connaît deux côtés et l'angle compris entre eux (cas SAS), alors qu'elle convient très bien au cas AAS (deux angles et un côté) ?",
        corrige:
          "La loi des sinus relie toujours un côté au sinus de l'angle qui lui est **opposé**. Dans le cas SAS, on connaît deux côtés et l'angle entre eux, mais aucun angle opposé à un côté connu — impossible de former le moindre rapport côté/sinus utilisable. Dans le cas AAS, en revanche, on dispose déjà d'un couple complet côté-angle-opposé : ce rapport, une fois formé, donne directement accès à tout le reste du triangle via la loi des sinus.",
      },
      {
        enonce:
          "Après avoir trouvé un côté manquant par la loi des cosinus (cas SAS), pourquoi ne faut-il surtout pas basculer vers la loi des sinus pour calculer l'angle restant ?",
        corrige:
          "Parce que retrouver un angle à partir de son sinus (par arcsin) donne toujours **deux** angles possibles sur ]0°;180°[ — un aigu et un obtus — et rien dans la loi des sinus ne permet de trancher lequel des deux est le bon. La loi des cosinus, résolue en cosinus, échappe entièrement à cette ambiguïté : le cosinus est, lui, parfaitement univoque sur tout l'intervalle ]0°;180°[, donc réutiliser Al-Kashi une seconde fois donne directement le bon angle, sans risque de confusion.",
      },
    ],
    triangulation: [
      {
        enonce:
          "Face à un problème de triangulation, comment reconnaît-on lequel des deux triangles est le « pont » et lequel est la « cible » ?",
        corrige:
          "La grandeur finale que l'énoncé demande — une hauteur, une distance entre deux points inaccessibles — appartient presque toujours au triangle **cible** : c'est justement celui qu'on ne peut pas mesurer directement sur le terrain. Partir de cette grandeur et remonter vers les données réellement disponibles permet d'identifier le triangle **pont** : celui qui, lui, se résout entièrement avec les seules informations données par l'énoncé, et dont le résultat sera ensuite réinjecté dans le triangle cible.",
      },
      {
        enonce:
          "Quelle est la différence entre les deux façons de relier le triangle pont au triangle cible, le « côté partagé » et l'« angle partagé » ?",
        corrige:
          "Dans le cas du côté partagé, les deux triangles ont réellement un côté physique en commun (une diagonale, par exemple) : on calcule sa longueur dans le triangle pont, puis on la réutilise comme un côté connu du triangle cible. Dans le cas de l'angle partagé, les deux triangles n'ont aucun côté commun, mais deux visées prises depuis un même point donnent, par leur différence, un angle du triangle cible — une hypothèse supplémentaire (souvent un angle droit) étant nécessaire pour refermer ce triangle. L'un transfère une longueur d'un triangle à l'autre, l'autre transfère un angle.",
      },
    ],
  },
  'calcul-vectoriel': {
    definition: [
      {
        enonce: "Pourquoi un vecteur n'a-t-il pas de position fixe dans le plan, contrairement à un point ?",
        corrige:
          "Un vecteur est défini uniquement par sa direction, son sens et sa longueur — pas par un emplacement. Deux représentants dessinés à des endroits différents de la feuille, pourvu qu'ils partagent ces trois caractéristiques, désignent le même vecteur. Un point, au contraire, est fixé par ses coordonnées : bouger son dessin change le point lui-même.",
      },
      {
        enonce: 'Vec{AB} et Vec{u} désignent-ils des objets de nature différente ?',
        corrige:
          "Non, les deux notations désignent le même type d'objet (direction, sens, longueur). AB rattache en plus le vecteur à une origine A et une extrémité B précises, utile pour le repérer sur une figure, tandis que u s'en passe. On peut toujours remplacer l'une par l'autre dans un même calcul.",
      },
    ],
    oppose: [
      {
        enonce:
          'En quoi deux vecteurs opposés diffèrent-ils de deux vecteurs égaux, alors que les deux partagent la même longueur et la même direction ?',
        corrige:
          "Seul le sens change. Deux vecteurs opposés pointent dans des directions strictement opposées sur la même droite porteuse, alors que deux vecteurs égaux pointent exactement dans le même sens — la longueur et la direction, elles, sont identiques dans les deux cas. C'est justement ce qui rend ces deux relations faciles à confondre si on ne vérifie pas le sens.",
      },
      {
        enonce: "Pourquoi -AB et BA désignent-ils le même vecteur ?",
        corrige:
          "Les deux ont pour origine B et extrémité A — même direction (portée par (AB)), même sens (de B vers A). L'opposé de AB a par définition la même direction et la même longueur, mais le sens contraire ; c'est exactement ce que donne l'inversion origine/extrémité. Les deux écritures décrivent donc la même situation, sous deux formes différentes.",
      },
    ],
    multiplicationGeometrique: [
      {
        enonce:
          'Pourquoi multiplier un vecteur par un réel k ne change-t-il jamais sa direction, même quand k est négatif ?',
        corrige:
          "Multiplier par k revient à reporter |k| fois la même longueur sur la MÊME droite porteuse — seuls le nombre de fois (la longueur) et, si k<0, le sens de parcours changent. La droite sur laquelle on reporte ne change jamais : la direction reste donc strictement identique, k négatif ne fait qu'inverser le sens sur cette droite.",
      },
      {
        enonce: 'Pourquoi deux vecteurs colinéaires peuvent-ils pointer dans des sens opposés ?',
        corrige:
          "« Colinéaires » ne demande que la même direction (la même droite, ou des droites parallèles), pas le même sens. u et -3u sont colinéaires (même direction) mais de sens opposés — colinéaire est une condition plus faible qu'égal ou que « même sens », elle n'exige rien sur le signe de k, seulement qu'il soit non nul.",
      },
      {
        enonce: "Pourquoi le cas k = 0 est-il à part dans l'effet de k sur un vecteur AB ?",
        corrige:
          "0·AB donne le vecteur nul, qui n'a pas de longueur et donc pas de direction définie — il n'est donc comparable à aucun autre vecteur par colinéarité. Tous les autres cas (k>0, k<0) donnent un vrai vecteur, avec une direction bien précise ; seul k=0 casse cette continuité.",
      },
    ],
    additionGeometrique: [
      {
        enonce: 'Pourquoi les méthodes du triangle et du parallélogramme donnent-elles toujours le même vecteur somme ?',
        corrige:
          "Le parallélogramme n'est qu'une autre façon de représenter la méthode du triangle : en plaçant v à l'origine commune, le côté opposé du parallélogramme reproduit exactement v translaté à l'extrémité de u. La diagonale et la somme obtenue par la méthode du triangle coïncident donc — ce ne sont que deux façons de dessiner la même addition.",
      },
      {
        enonce:
          "Pourquoi faut-il que l'origine de v coïncide avec l'extrémité de u dans la méthode du triangle, plutôt que n'importe quel autre arrangement ?",
        corrige:
          "C'est cette condition précise qui permet d'appliquer la relation de Chasles et de télescoper les deux vecteurs en un seul, du premier point de départ au dernier point d'arrivée. Si les vecteurs ne se relaient pas ainsi, la figure ne donne plus directement la somme : il faudrait d'abord translater l'un des deux pour recréer cette chaîne.",
      },
    ],
    soustractionGeometrique: [
      {
        enonce: "Pourquoi u - v part-il de l'extrémité de v et arrive-t-il à l'extrémité de u, et pas l'inverse ?",
        corrige:
          "Parce que w = u - v doit vérifier w + v = u. En plaçant v à la suite de w, on doit retomber sur u : c'est exactement ce que donne le vecteur allant de l'extrémité de v à celle de u, puisque lui ajouter v (de l'origine à l'extrémité de v) ramène bien à u par Chasles. L'ordre inverse donnerait v - u, l'opposé.",
      },
      {
        enonce: "En quoi « soustraire un vecteur » se ramène-t-il exactement à une addition déjà connue ?",
        corrige:
          "u - v = u + (-v) : soustraire, c'est additionner l'opposé. Il suffit de construire -v (même longueur, même direction, sens inversé) puis d'appliquer la méthode du triangle ou du parallélogramme déjà vue pour l'addition — aucune nouvelle construction géométrique n'est nécessaire.",
      },
    ],
    chasles: [
      {
        enonce: 'Pourquoi la relation de Chasles fonctionne-t-elle même quand A, B et C ne sont pas alignés ?',
        corrige:
          "Chasles ne dit rien sur l'alignement des points : elle dit seulement que le point intermédiaire B, commun à l'extrémité du premier vecteur et à l'origine du second, disparaît dans la somme. On part de A, on fait un détour par B, on finit en C, et le résultat est le vecteur direct de A à C — quel que soit le chemin suivi pour y arriver, en ligne droite ou pas.",
      },
      {
        enonce: 'Pourquoi une chaîne de vecteurs qui revient à son point de départ se réduit-elle toujours au vecteur nul ?',
        corrige:
          "Chasles télescope toute la chaîne en un seul vecteur allant du tout premier point au tout dernier. Si la chaîne est fermée, ces deux points sont le même, et un vecteur dont l'origine et l'extrémité coïncident a une longueur nulle (donc pas de direction) : c'est le vecteur nul, quel que soit le nombre d'étapes intermédiaires.",
      },
      {
        enonce: 'Pourquoi faut-il remplacer CB par -BC avant de télescoper une chaîne qui le contient ?',
        corrige:
          "Chasles ne s'applique que dans un sens précis : l'extrémité d'un vecteur doit être l'origine du suivant. CB « à l'envers » casse cet enchaînement ; en le remplaçant par son opposé -BC (le même vecteur, écrit dans le bon sens), la chaîne redevient régulière et peut être télescopée normalement.",
      },
    ],
    decompositionGeometrique: [
      {
        enonce:
          'Pourquoi faut-il que les deux directions de décomposition ne soient pas parallèles pour que la décomposition soit possible et unique ?',
        corrige:
          "Si les deux directions étaient parallèles, elles ne formeraient plus un vrai parallélogramme : un vecteur hors de cette direction commune ne pourrait jamais s'écrire comme somme de deux vecteurs portés par elle, et un vecteur situé sur cette direction s'écrirait d'une infinité de façons (perte d'unicité). Deux directions distinctes garantissent exactement un sommet du parallélogramme, donc une seule décomposition.",
      },
      {
        enonce: "En quoi décomposer un vecteur est-il l'opération inverse d'additionner deux vecteurs ?",
        corrige:
          "Additionner part de deux vecteurs connus v et w et construit leur somme u par la méthode du parallélogramme. Décomposer part du vecteur u déjà connu et cherche v et w dans deux directions imposées, en utilisant la MÊME figure mais en la lisant dans l'autre sens — du résultat vers les deux termes plutôt que des deux termes vers le résultat.",
      },
    ],
    composantes: [
      {
        enonce:
          "Pourquoi deux nombres suffisent-ils à décrire un vecteur une fois un repère choisi, alors qu'il faut trois informations (direction, sens, longueur) pour le décrire géométriquement ?",
        corrige:
          "Les deux composantes encodent déjà, ensemble, ces trois informations : leur signe donne le sens le long de chaque axe, leur rapport donne la direction, et leur combinaison (via Pythagore) donne la longueur. Un repère fournit un cadre commun — les axes — dans lequel direction et sens se lisent directement sur les signes et les valeurs, sans dessin nécessaire.",
      },
      {
        enonce: "Pourquoi les composantes de AB ne dépendent-elles que de la différence des coordonnées de A et B, jamais de leurs coordonnées elles-mêmes ?",
        corrige:
          "Parce qu'un vecteur ne vit nulle part en particulier — deux vecteurs égaux ont les mêmes composantes même dessinés à des endroits différents du repère. Si les composantes dépendaient des coordonnées absolues de A et B, translater toute la figure changerait le vecteur, ce qui contredirait cette propriété fondamentale.",
      },
    ],
    additionReperes: [
      {
        enonce:
          "Pourquoi additionner deux vecteurs composante par composante en repère donne-t-il le même résultat que la méthode géométrique du triangle ou du parallélogramme ?",
        corrige:
          "Les deux méthodes décrivent le même déplacement global, vu de deux façons différentes. Avancer de x_u puis de x_v horizontalement revient à avancer de x_u+x_v d'un coup, et pareil pour les ordonnées — c'est exactement ce que fait Chasles, traduit en coordonnées plutôt que suivi sur un dessin.",
      },
      {
        enonce: 'Pourquoi peut-on combiner librement un vecteur nommé comme u et un vecteur point-à-point comme AB dans une même somme ?',
        corrige:
          "Parce que les deux notations désignent le même type d'objet. Une fois les composantes de AB calculées (à partir des coordonnées de A et B), il ne reste que deux couples de nombres à additionner, exactement comme pour deux vecteurs nommés — la notation d'origine n'a plus d'importance une fois qu'on travaille en composantes.",
      },
    ],
    multiplicationReperes: [
      {
        enonce: "Pourquoi retrouver l'opposé d'un vecteur en repère n'est-il qu'un cas particulier de la multiplication par un scalaire ?",
        corrige:
          "-u est exactement (-1)·u : multiplier chaque composante par -1 change son signe sans changer sa valeur absolue, ce qui inverse le sens sans toucher à la longueur ni à la direction — exactement la définition de l'opposé. Aucune règle nouvelle n'est nécessaire, k=-1 suffit.",
      },
      {
        enonce: 'Pourquoi faut-il calculer les composantes de AB avant de pouvoir faire 3u - AB, alors que 3u se calcule directement ?',
        corrige:
          "u est déjà donné par ses composantes, donc 3u se calcule directement, composante par composante. AB, lui, n'est connu que par les coordonnées des points A et B — il faut d'abord en extraire les composantes (différence des coordonnées) avant de pouvoir le traiter comme n'importe quel autre vecteur et le combiner avec 3u.",
      },
    ],
    norme: [
      {
        enonce: 'Pourquoi norme et distance sont-elles exactement la même formule, appliquée à des objets différents ?',
        corrige:
          "La distance AB est, par définition, la longueur du vecteur AB qui relie A à B — c'est donc la norme de ce vecteur précis. La formule racine de (x_B-x_A)²+(y_B-y_A)² est la formule de la norme appliquée aux composantes de AB ; il ne s'agit pas de deux formules qui coïncident par hasard, mais d'une seule formule vue sous deux angles — le vecteur, ou les deux points qu'il relie.",
      },
      {
        enonce: 'Pourquoi la démonstration de la formule de la norme repose-t-elle sur le théorème de Pythagore ?',
        corrige:
          "En construisant le point C(x_B;y_A), le triangle ABC est rectangle en C, avec des côtés horizontal et vertical de longueurs |x_B-x_A| et |y_B-y_A| — exactement les composantes de AB en valeur absolue. Pythagore donne alors AB² comme somme des carrés de ces deux longueurs, ce qui est précisément la formule de la norme, une fois la racine carrée prise.",
      },
      {
        enonce: 'Pourquoi la norme ne peut-elle jamais être négative, même si les composantes du vecteur le sont ?',
        corrige:
          "La norme est une racine carrée d'une somme de deux carrés — un carré est toujours positif ou nul, leur somme aussi, et la racine carrée d'un nombre positif ou nul reste positive ou nulle. Le signe des composantes, qui encode le sens, disparaît dès qu'on les élève au carré : c'est justement ce qui fait que la norme ne porte plus aucune information de sens, seulement une longueur.",
      },
    ],
    relation: [
      {
        enonce: 'Pourquoi le milieu se calcule-t-il comme une moyenne des coordonnées, et jamais comme une différence ?',
        corrige:
          "Le milieu est le point « à mi-chemin » entre A et B : AM = MB = (1/2)AB, donc M est obtenu en avançant de la moitié du déplacement depuis A, ce qui correspond à la moyenne des coordonnées. La différence des coordonnées donne au contraire les composantes du vecteur AB lui-même — un objet complètement différent, un déplacement et pas une position.",
      },
      {
        enonce: 'Pourquoi la translation (B = A + u) et le milieu sont-ils deux cas particuliers d\'une seule relation plus générale ?',
        corrige:
          "La relation AM = k·AB place toujours M sur la droite (AB), quel que soit k. Pour k=1, M coïncide avec B (la translation, en posant u=AB) ; pour k=1/2, M est le milieu. Les deux relations ne sont donc que deux réglages différents du même paramètre k dans une seule formule.",
      },
      {
        enonce: 'Pourquoi AM = k·AB place-t-il TOUJOURS M sur la droite (AB), quelle que soit la valeur de k ?',
        corrige:
          "Multiplier un vecteur par un réel ne change jamais sa direction, seulement sa longueur et, si k est négatif, son sens — AM reste donc colinéaire à AB pour tout k, ce qui place M sur cette même droite, quelle que soit la distance ou le sens parcouru depuis A.",
      },
    ],
    colinearite: [
      {
        enonce:
          "Pourquoi le déterminant x_u·y_v - y_u·x_v reste-t-il valable même quand une composante de u vaut 0, alors que l'égalité des quotients x_v/x_u = y_v/y_u ne l'est pas ?",
        corrige:
          "L'égalité de deux quotients suppose implicitement que les dénominateurs ne sont pas nuls — elle n'a simplement pas de sens si x_u=0. Le déterminant, obtenu en multipliant en croix avant toute division, ne contient plus aucune fraction : il reste défini et correct quelle que soit la valeur des composantes, y compris nulle.",
      },
      {
        enonce: 'Pourquoi A, B, C alignés équivaut-il exactement à AB et AC colinéaires ?',
        corrige:
          "Trois points alignés sont, par définition, sur une même droite — les deux vecteurs formés à partir d'eux (avec A comme origine commune) sont donc portés par cette même droite, donc colinéaires. Réciproquement, si AB et AC sont colinéaires, ils partagent la même direction passant par A, donc B et C sont tous deux sur cette droite unique.",
      },
    ],
    orthogonalite: [
      {
        enonce:
          'Pourquoi AB·AC = 0 et le théorème de Pythagore (BC² = AB² + AC²) sont-ils deux façons d\'exprimer la même propriété d\'un triangle rectangle en A ?',
        corrige:
          "Les deux affirment que l'angle en A est droit, sous des formes différentes. L'une se calcule directement à partir des composantes des deux côtés, sans connaître les trois longueurs à l'avance ; l'autre compare les carrés des trois longueurs elles-mêmes. Ce sont deux tests équivalents du même fait géométrique, pas deux conditions indépendantes.",
      },
      {
        enonce: 'Comment la rotation d\'un quart de tour permet-elle de justifier la formule x_u·x_v + y_u·y_v = 0 pour l\'orthogonalité ?',
        corrige:
          "Faire pivoter OA(x;y) d'un quart de tour donne un vecteur (-y;x), perpendiculaire à OA par construction. Tout vecteur perpendiculaire à OA est colinéaire à ce vecteur tourné, donc de la forme (-ky;kx) — en substituant dans x·x'+y·y', les deux termes s'annulent exactement (-kxy+kxy=0), ce qui montre que le produit scalaire de deux vecteurs perpendiculaires est toujours nul, quels que soient x, y et k.",
      },
      {
        enonce:
          "Pourquoi ne faut-il jamais confondre le test de colinéarité et celui d'orthogonalité, malgré leur ressemblance ?",
        corrige:
          "Ils testent deux relations géométriques opposées : colinéaire veut dire « même direction » (angle nul ou 180°), orthogonal veut dire « angle droit ». Les deux formules utilisent les mêmes composantes mais une opération différente — un déterminant avec soustraction, un produit scalaire avec addition — confondre les deux donnerait un verdict sur la mauvaise relation.",
      },
    ],
    directeur: [
      {
        enonce: 'Pourquoi une droite a-t-elle une infinité de vecteurs directeurs, mais tous colinéaires entre eux ?',
        corrige:
          "N'importe quelle paire de points distincts de la droite définit un vecteur directeur valide — comme il y a une infinité de telles paires, il y a une infinité de vecteurs directeurs. Mais tous ces points étant sur la même droite, les vecteurs qu'ils forment ont tous la même direction, donc sont tous colinéaires entre eux, même s'ils diffèrent en longueur ou en sens.",
      },
      {
        enonce: 'Pourquoi un vecteur directeur de la forme (k;0) caractérise-t-il une droite horizontale, et (0;k) une droite verticale ?',
        corrige:
          "(k;0) n'a pas de composante verticale : se déplacer le long de la droite ne change jamais l'ordonnée, ce qui est exactement la définition d'une droite horizontale. De façon symétrique, (0;k) n'a pas de composante horizontale — l'abscisse reste constante le long de la droite, qui est donc verticale.",
      },
    ],
    comparaison: [
      {
        enonce:
          "Pourquoi l'égalité de deux vecteurs est-elle la seule relation, parmi longueur/direction/sens, qui exige les trois propriétés à la fois ?",
        corrige:
          "Les trois propriétés sont indépendantes — deux vecteurs peuvent partager n'importe quel sous-ensemble d'entre elles (même longueur sans être colinéaires, ou colinéaires sans même longueur). Seule l'égalité, qui demande que les deux vecteurs soient véritablement interchangeables dans n'importe quel calcul, nécessite qu'aucune des trois ne diffère ; relâcher une seule condition donne une relation plus faible (opposés, colinéaires...).",
      },
      {
        enonce: 'Pourquoi deux vecteurs de même longueur ne sont-ils pas nécessairement colinéaires ?',
        corrige:
          "La longueur (la norme) ne dit rien sur la direction — deux vecteurs peuvent avoir exactement la même norme tout en pointant dans des directions complètement différentes, par exemple deux côtés d'un triangle équilatéral. La colinéarité est une condition sur la direction, totalement indépendante de la longueur.",
      },
    ],
    applications: [
      {
        enonce: 'Pourquoi le triangle formé par deux forces et leur résultante n\'est-il presque jamais rectangle ?',
        corrige:
          "Le triangle serait rectangle seulement si l'angle entre les deux vecteurs (ou son complémentaire dans le triangle) valait exactement 90°, un cas particulier parmi tous les angles θ possibles. Pour un angle θ quelconque, la loi des cosinus doit intervenir précisément parce que Pythagore — valable seulement dans un triangle rectangle — ne suffit pas à calculer la norme de la résultante.",
      },
      {
        enonce: "Pourquoi faut-il la loi des sinus, en plus de la loi des cosinus, pour caractériser complètement la résultante de deux vecteurs ?",
        corrige:
          "La loi des cosinus donne seulement la norme R de la résultante — elle ne dit rien sur sa direction. La loi des sinus permet ensuite de calculer la déviation, l'angle entre la résultante et l'un des deux vecteurs d'origine, ce qui complète la description du vecteur résultante (longueur ET direction), pas seulement sa longueur.",
      },
    ],
  },
  'geometrie-analytique-plane': {
    reperer: [
      {
        enonce: "Pourquoi une droite verticale n'a-t-elle pas de forme explicite en y ?",
        corrige:
          "La forme explicite en y associe à chaque x une seule valeur de y — c'est exactement ce qu'une fonction fait. Sur une verticale, un seul x correspond à une infinité de y différents : aucune formule y=mx+p ne peut capturer ça. C'est aussi visible dans le vecteur directeur : il est de la forme (0 ; β), donc Δx=0, et la pente m=Δy/Δx n'existe pas.",
      },
      {
        enonce: "Deux couples (point, vecteur directeur) très différents peuvent-ils décrire exactement la même droite ? Justifie.",
        corrige:
          "Oui, et c'est même la règle plutôt que l'exception. N'importe quel point de la droite peut servir de point de départ, et n'importe quel multiple non nul du vecteur directeur porte encore la même direction. Une droite n'a donc jamais UN seul couple (point, vecteur) qui la décrit, mais une infinité, tous équivalents.",
      },
    ],
    'lire-tracer': [
      {
        enonce: "Pourquoi réduit-on le vecteur directeur lu sur un graphe à sa forme primitive (divisée par le PGCD), alors que le vecteur brut décrit déjà correctement la droite ?",
        corrige:
          "Les deux vecteurs sont colinéaires, donc ils portent rigoureusement la même direction et décrivent la même droite — la réduction n'est pas une nécessité mathématique, seulement une simplification pour éviter de manipuler des nombres inutilement grands.",
      },
      {
        enonce: "En quoi lire une droite sur un graphe et la tracer depuis son équation sont-elles deux compétences réciproques l'une de l'autre ?",
        corrige:
          "Les deux s'appuient sur la même idée : deux points à coordonnées entières suffisent à fixer complètement une droite. Dans un sens, on part du dessin pour les repérer et en déduire l'équation ; dans l'autre, on part de l'équation pour en calculer deux, et les placer. C'est le même pont entre dessin et équation, parcouru dans les deux directions.",
      },
    ],
    caracteristiques: [
      {
        enonce: "Pourquoi une pente négative correspond-elle à un angle obtus avec Ox, et jamais à un angle négatif ?",
        corrige:
          "L'angle θ avec Ox est toujours mesuré dans [0°;180°[, dans le sens trigonométrique depuis le demi-axe positif de Ox — jamais en dehors de cet intervalle. Une droite qui descend vers la droite fait un angle obtus (entre 90° et 180°) avec Ox, et la tangente d'un angle obtus est justement négative : les deux conventions (pente négative, angle obtus) se correspondent exactement, sans qu'on ait jamais besoin d'un angle négatif.",
      },
      {
        enonce: "Pourquoi l'angle avec Oy est-il toujours le complémentaire de l'angle avec Ox (90° moins l'angle avec Ox), plutôt que deux mesures indépendantes ?",
        corrige:
          "Parce que Ox et Oy sont perpendiculaires. Une même droite inclinée fait, avec deux axes perpendiculaires entre eux, deux angles qui se complètent nécessairement à 90° — ce n'est pas une coïncidence propre à telle ou telle droite, mais une conséquence directe de la perpendicularité des deux axes du repère.",
      },
    ],
    relations: [
      {
        enonce: "Pourquoi deux droites de même pente sont-elles nécessairement parallèles, sans jamais se croiser (sauf si elles sont confondues) ?",
        corrige:
          "Une même pente signifie des vecteurs directeurs colinéaires, donc une même direction. Deux droites qui pointent exactement dans la même direction ne peuvent jamais converger l'une vers l'autre : soit elles ne partagent aucun point (parallèles distinctes), soit elles en partagent un, et alors elles en partagent tous (confondues) — il n'y a pas de cas intermédiaire où elles se croiseraient une seule fois.",
      },
      {
        enonce: "Deux vecteurs directeurs non nuls peuvent-ils être à la fois colinéaires et orthogonaux ? Justifie à partir des deux critères.",
        corrige:
          "Non. Colinéaires signifie même direction (angle 0° ou 180° entre eux) ; orthogonaux signifie un angle de 90° entre eux. Ces deux conditions sont géométriquement incompatibles pour des vecteurs non nuls — un déterminant nul et un produit scalaire nul ne peuvent être vérifiés simultanément, sauf par un vecteur nul, exclu ici.",
      },
    ],
    intersection: [
      {
        enonce: "Pourquoi faut-il comparer les vecteurs directeurs avant de résoudre le système des deux équations, plutôt que de se lancer directement dans la résolution ?",
        corrige:
          "Si les vecteurs sont colinéaires, résoudre le système mène soit à une égalité toujours fausse (parallèles distinctes, 0 solution), soit à une égalité toujours vraie (confondues, une infinité de solutions) — jamais à UN point précis. Comparer d'abord les directions permet de savoir à l'avance quel type de résultat attendre, et d'éviter un calcul qui ne mènera jamais à des coordonnées uniques.",
      },
      {
        enonce: "Deux droites dont les vecteurs directeurs sont colinéaires partagent-elles automatiquement un point commun ? Justifie.",
        corrige:
          "Non. La colinéarité des directions dit seulement qu'elles sont parallèles au sens large (parallèles distinctes OU confondues) — il faut vérifier séparément si un point de l'une appartient à l'autre pour trancher entre ces deux cas, qui ont des issues complètement opposées (aucun point commun, ou une infinité).",
      },
    ],
    distance: [
      {
        enonce: "Pourquoi la distance d'un point à une droite se construit-elle en 3 étapes (perpendiculaire, intersection, norme) plutôt que par une formule directe ?",
        corrige:
          "Parce que chaque étape réutilise une compétence déjà vue dans ce chapitre : construire une droite perpendiculaire, calculer une intersection, mesurer une norme de vecteur. La distance cherchée n'est rien d'autre que la longueur du segment perpendiculaire entre le point et son pied sur la droite — la construire revient donc exactement à enchaîner ces trois notions, sans qu'aucune formule supplémentaire ne soit nécessaire.",
      },
      {
        enonce: "Pourquoi la distance d'un point à une droite verticale x=k se réduit-elle à un simple écart d'abscisses, sans aucune construction ?",
        corrige:
          "La perpendiculaire à une droite verticale est horizontale. Le pied de cette perpendiculaire a donc la même ordonnée que le point de départ, et son abscisse vaut exactement k — le segment reliant les deux est déjà horizontal, sa longueur se lit directement comme un écart d'abscisses, sans qu'il soit besoin de construire quoi que ce soit.",
      },
    ],
    'notion-lieu': [
      {
        enonce: "Pourquoi le lieu des points situés à une distance donnée d'une droite est-il la réunion de DEUX droites parallèles, et jamais une seule des deux ?",
        corrige:
          "Un point peut se trouver à cette distance d'un côté de la droite, ou de l'autre — les deux cas vérifient également la condition donnée. Un lieu géométrique doit contenir TOUS les points qui partagent la propriété : ne garder qu'une seule des deux droites laisserait de côté la moitié des points qui vérifient pourtant exactement la même condition.",
      },
      {
        enonce: "En quoi un lieu géométrique diffère-t-il d'une droite ou d'une courbe directement donnée par son équation ?",
        corrige:
          "Un lieu est d'abord défini par une phrase, une condition — pas par une équation déjà écrite. Reconnaître de quelle figure il s'agit (droite, cercle, parabole) et en extraire les paramètres est donc lui-même une étape du travail, alors qu'une courbe donnée directement par son équation n'exige pas cette étape d'identification préalable.",
      },
    ],
    cercle: [
      {
        enonce: "Pourquoi une équation du type kx²+ky²+bₓx+bᵥy=c ne décrit-elle un cercle que si le coefficient de x² est identique à celui de y² ?",
        corrige:
          "L'équation d'un cercle vient de Pythagore appliqué de façon symétrique : (x-x₀)² et (y-y₀)² portent exactement le même poids, parce que le rayon est le même dans toutes les directions. Si les deux coefficients diffèrent, la courbe s'étire différemment en x et en y — elle devient une ellipse, une figure qui n'a plus un rayon unique dans toutes les directions.",
      },
      {
        enonce: "Pourquoi compléter le carré permet-il de retrouver le centre et le rayon d'un cercle à partir de son équation développée, alors que celle-ci ne ressemble en rien à (x-x₀)²+(y-y₀)²=r² ?",
        corrige:
          "Compléter le carré est exactement l'opération inverse du développement de (x-x₀)². Elle reconstruit, à l'intérieur de l'expression développée, le carré parfait qui y était caché depuis le début — les valeurs soustraites redonnent directement x₀ et y₀, et ce qui reste au second membre donne r².",
      },
    ],
    parabole: [
      {
        enonce: "En quoi la définition du cercle et celle de la parabole suivent-elles le même principe de « lieu de points équidistants », tout en donnant deux figures très différentes ?",
        corrige:
          "Les deux sont définies comme l'ensemble des points équidistants de références fixes. Le cercle : équidistant d'un seul point, le centre. La parabole : équidistant simultanément d'un point (le foyer) ET d'une droite (la directrice). Ce passage d'« un point » à « un point et une droite » transforme une figure fermée et bornée (le cercle) en une figure ouverte qui s'étend indéfiniment (la parabole).",
      },
      {
        enonce: "Pourquoi le paramètre p d'une parabole est-il signé, alors que le rayon r d'un cercle est toujours positif ?",
        corrige:
          "r est une distance pure, toujours positive par nature. p, lui, ne décrit pas seulement une grandeur mais aussi une orientation : de quel côté du sommet se trouve le foyer. Un p négatif inverse cette orientation (la parabole s'ouvre de l'autre côté) — une information qu'une simple distance positive ne pourrait jamais coder.",
      },
    ],
    lieux: [
      {
        enonce: "Pourquoi l'intersection entre une droite et un cercle (ou une parabole) mène-t-elle toujours à une équation du second degré, jamais du premier ?",
        corrige:
          "Substituer l'équation de la droite (du premier degré) dans celle du cercle ou de la parabole (qui contient un terme au carré) fait toujours apparaître ce terme au carré, qu'aucune substitution linéaire ne peut faire disparaître. L'équation obtenue est donc toujours quadratique, avec au plus deux solutions — cohérent avec le fait qu'une droite ne peut couper une telle courbe qu'en 0, 1 ou 2 points.",
      },
      {
        enonce: "Que signifie géométriquement le cas où le système n'a qu'une seule solution (discriminant nul) ?",
        corrige:
          "Une seule solution double signifie que la droite est tangente au cercle ou à la parabole : elle touche la courbe en un unique point, sans jamais la traverser — un cas intermédiaire entre ne pas la rencontrer du tout (0 point) et la couper franchement (2 points distincts).",
      },
    ],
  },

  'geometrie-dans-espace': {
    cavaliere: [
      {
        enonce: "Pourquoi la perspective cavalière déforme-t-elle les distances mais jamais le parallélisme ?",
        corrige:
          "La convention traite chaque axe de façon fixe : x et z restent à l'échelle réelle, y part toujours dans la même direction à 45°, réduit de moitié. Deux arêtes parallèles en 3D suivent donc le même traitement et restent parallèles sur le papier. Mais parce que y est systématiquement raccourci alors que x et z ne le sont pas, une longueur portée par y ne correspond plus à sa vraie valeur — les distances sont faussées, sans que le parallélisme en souffre.",
      },
      {
        enonce: "Pourquoi la perspective à point de fuite, plus fidèle à la vision humaine, n'est-elle pas utilisée pour tous les dessins de ce chapitre ?",
        corrige:
          "Elle est beaucoup plus lourde à construire à la main (il faut placer un ou plusieurs points de fuite avant même de tracer une arête) et surtout, elle ne conserve jamais le parallélisme : deux arêtes parallèles du solide convergent vers un même point de fuite sur le dessin. La perspective cavalière, plus simple et qui conserve toujours ce parallélisme, est donc plus adaptée pour raisonner sur des solides.",
      },
    ],
    'determiner-plan': [
      {
        enonce: "Pourquoi deux points ne suffisent-ils pas à déterminer un plan, alors qu'ils suffisent à déterminer une droite ?",
        corrige:
          "Deux points fixent déjà une droite, mais autour de cette seule droite, une infinité de plans peuvent encore pivoter — comme les pages d'un livre qui tournent toutes autour de sa reliure. Il faut un troisième point, à condition qu'il ne soit pas sur cette droite, pour immobiliser un seul de ces plans.",
      },
      {
        enonce: "Pourquoi deux droites parallèles distinctes déterminent-elles, elles aussi, un plan unique — alors qu'elles n'ont, par définition, aucun point commun ?",
        corrige:
          "Être parallèles garantit déjà qu'elles sont coplanaires, même sans point commun : contrairement à deux droites gauches, deux droites parallèles partagent toujours un même plan, par définition même du parallélisme dans l'espace.",
      },
    ],
    'deux-droites': [
      {
        enonce: "Qu'est-ce qui distingue une droite sécante d'une droite gauche, alors que dans le plan, deux droites non parallèles sont toujours sécantes ?",
        corrige:
          "Dans le plan, deux droites tracées appartiennent forcément à la même feuille, donc au même plan — non parallèles, elles sont donc obligées de se croiser. Dans l'espace, rien ne garantit qu'un plan commun existe : deux droites peuvent avoir des directions différentes sans jamais partager de plan du tout. Elles ne se croisent alors jamais (ni point commun, ni plan commun) : c'est le cas « gauches », impossible sur une seule feuille.",
      },
      {
        enonce: "Pourquoi deux droites parallèles sont-elles toujours coplanaires, même si elles semblent appartenir à deux faces différentes d'un solide ?",
        corrige:
          "Le parallélisme se définit justement par le partage d'une même direction, et deux droites qui partagent une direction peuvent toujours être posées ensemble dans un même plan (celui formé par l'une des droites et un point quelconque de l'autre) — contrairement à deux droites gauches, qui n'ont même pas cette direction commune pour s'y accrocher.",
      },
    ],
    position: [
      {
        enonce: "Pourquoi faut-il vérifier l'inclusion avant le parallélisme, et le parallélisme avant de conclure à une sécante ?",
        corrige:
          "Les trois issues sont les seules possibles, mais l'inclusion est la plus restrictive (les deux points de la droite sont déjà dans le plan) : la vérifier d'abord évite de conclure par erreur à un parallélisme pour une droite en réalité déjà incluse. Le parallélisme est vérifié ensuite car c'est la seule autre façon d'éviter toute rencontre avec le plan ; ce qui reste est nécessairement sécant.",
      },
      {
        enonce: "Pourquoi le point de percée d'une droite sécante à un plan peut-il tomber en dehors du solide dessiné ?",
        corrige:
          "Un plan est toujours considéré infini, jamais limité à la seule face visible sur le dessin du solide. Une droite sécante à ce plan peut donc le couper en un point situé bien au-delà des arêtes réellement tracées, même si seule une portion finie du plan est représentée.",
      },
    ],
    'deux-plans': [
      {
        enonce: "Pourquoi l'intersection de deux plans distincts ne peut-elle jamais être un point isolé ?",
        corrige:
          "Dès que deux plans distincts partagent un seul point commun, le raisonnement par l'absurde montre qu'ils partagent en réalité toute la droite qui passe par ce point : un plan est « plat » dans toutes les directions autour de chacun de ses points, donc partager un point sans partager toute la droite qui le traverse contredirait cette platitude.",
      },
      {
        enonce: "Pourquoi une droite qui coupe un plan coupe-t-elle automatiquement tout plan parallèle à celui-ci ?",
        corrige:
          "Deux plans parallèles gardent un écart constant partout entre eux. Si une droite traverse l'un des deux, elle n'est elle-même pas parallèle à cet écart : elle ne peut donc pas rester indéfiniment coincée entre les deux plans et finit nécessairement par atteindre le second.",
      },
    ],
    'trois-plans': [
      {
        enonce: "Pourquoi les trois droites d'intersection de trois plans sécants deux à deux ne peuvent-elles jamais être quelconques (par exemple deux parallèles et la troisième sécante aux deux) ?",
        corrige:
          "Chaque droite d'intersection appartient à deux des trois plans à la fois — ces contraintes partagées lient les trois droites entre elles, elles ne sont pas libres d'adopter trois configurations indépendantes : soit elles convergent toutes vers un même point commun aux trois plans, soit elles héritent toutes de la même direction, mais jamais un mélange des deux.",
      },
      {
        enonce: "Pourquoi l'image du coin d'une chambre (le sol et deux murs) illustre-t-elle le cas « sécantes en un même point », mais pas le cas « parallèles entre elles » ?",
        corrige:
          "Les trois surfaces d'un coin de chambre se rencontrent réellement en un seul point commun, l'angle de la pièce — exactement le premier cas. Pour illustrer le second, il faudrait imaginer trois surfaces mutuellement parallèles qui ne se touchent jamais, comme les pages d'un même classeur — une configuration géométriquement différente, que ce coin ne peut pas représenter.",
      },
    ],
    parallelisme: [
      {
        enonce: "Pourquoi les trois critères de parallélisme dans l'espace se ramènent-ils toujours à une comparaison entre deux droites, jamais entre deux plans directement ?",
        corrige:
          "Un plan n'est caractérisé, pour une comparaison de parallélisme, qu'à travers les droites qu'il contient : « deux plans parallèles » se vérifie en comparant des droites sécantes de l'un à des droites sécantes de l'autre, « droite parallèle à un plan » en la comparant à une droite du plan. Il n'existe aucun moyen de comparer deux plans « au jugé », sans passer par leurs droites.",
      },
      {
        enonce: "Pourquoi une seule direction commune aux deux plans ne suffit-elle pas à conclure qu'ils sont parallèles ?",
        corrige:
          "Une seule direction partagée ne force les deux plans qu'à partager CETTE direction précise ; chacun garde encore toute une famille d'autres directions qui pourraient différer. Un vrai parallélisme entre deux plans exige deux directions sécantes (non parallèles entre elles) appariées dans chaque plan — exactement ce qu'il faut pour fixer complètement l'orientation d'un plan, comme deux droites sécantes suffisent à le déterminer.",
      },
    ],
    percee: [
      {
        enonce: "Pourquoi construit-on un plan auxiliaire π plutôt que de chercher directement le point de percée de d dans α ?",
        corrige:
          "Trouver où une droite traverse un plan n'est en général pas lisible directement sur un dessin en 3D. Mais une fois qu'un plan auxiliaire π contient d et coupe α suivant une droite b, d et b se retrouvent dans le MÊME plan π : leur intersection devient une simple intersection 2D entre deux droites coplanaires — le plan auxiliaire transforme un problème 3D illisible en un problème 2D lisible.",
      },
      {
        enonce: "En quoi trouver le point de percée d'une droite dans un plan, et trouver la droite d'intersection de deux plans, sont-ils des problèmes symétriques ?",
        corrige:
          "La percée cherche UN point à partir d'une droite et d'un plan. L'intersection de deux plans cherche une DROITE ENTIÈRE (déterminée par deux points) à partir de deux plans — et résoudre ce second problème revient souvent à chercher deux points de percée de deux droites de l'un des plans dans l'autre, c'est-à-dire à appliquer deux fois la première méthode.",
      },
    ],
    section: [
      {
        enonce: "Pourquoi chaque face réellement traversée par le plan de coupe fournit-elle exactement deux sommets du polygone de section, jamais un seul ni trois ?",
        corrige:
          "Une face convexe a un contour convexe : un plan qui la traverse réellement en coupe donc le contour exactement deux fois (une entrée, une sortie), jamais plus — la convexité interdit de re-couper le même contour une troisième fois sans ressortir entre-temps. Un seul point signifierait un simple contact avec un sommet ou une arête, pas une vraie traversée de la face.",
      },
      {
        enonce: "Pourquoi est-il impossible de tracer un segment direct dès qu'une face n'a qu'un seul point de section déjà connu ?",
        corrige:
          "Un côté du polygone de section ne peut relier que deux points déjà confirmés sur la MÊME face. Un seul point connu ne dit pas encore où le plan ressort de cette face : le relier à autre chose reviendrait à deviner, pas à construire — c'est exactement pourquoi la méthode passe alors par un point auxiliaire plutôt que par un segment direct.",
      },
    ],
    'fenetre-durer': [
      {
        enonce: "Pourquoi le peintre ferme-t-il volontairement un œil pour utiliser la fenêtre de Dürer ?",
        corrige:
          "La perspective centrale projette toute la scène sur une seule vitre plane, un principe qui n'a de sens que pour un seul point de vue (vision monoculaire). Avec les deux yeux ouverts, chacun verrait la scène sous un angle légèrement différent (vision binoculaire, qui perçoit le relief) — rendant impossible une projection unique et cohérente sur cette même vitre.",
      },
      {
        enonce: "Pourquoi un objet proche et petit peut-il paraître exactement de la même taille qu'un objet éloigné et grand, à travers la fenêtre de Dürer ?",
        corrige:
          "Ce qui compte, c'est l'endroit où la ligne de vision depuis l'œil traverse la vitre — pas la taille réelle de l'objet. Deux objets de tailles très différentes mais situés sur la même ligne de vision traversent la vitre exactement au même endroit, et occupent donc la même taille apparente sur le dessin final.",
      },
    ],
    'point-de-fuite': [
      {
        enonce: "Pourquoi des rails de chemin de fer, strictement parallèles dans la réalité, semblent-ils se rejoindre à l'horizon sur un dessin en perspective centrale ?",
        corrige:
          "C'est exactement le principe de cette perspective : toutes les droites parallèles d'un même plan horizontal se rencontrent, dans le DESSIN, en un seul point de fuite situé sur la ligne d'horizon. C'est un effet de la projection choisie, pas une vraie rencontre des rails, qui restent à distance constante partout dans la réalité.",
      },
      {
        enonce: "Pourquoi un même solide, dessiné en perspective cavalière puis en perspective à point de fuite, donne-t-il deux dessins vraiment différents ?",
        corrige:
          "La cavalière conserve toujours le parallélisme des arêtes (deux arêtes parallèles le restent sur le papier), alors que la perspective à point de fuite ne le fait jamais (des arêtes parallèles convergent vers leur point de fuite commun) — les deux conventions traitent le parallélisme de façons opposées, ce qui change fondamentalement l'allure du dessin final.",
      },
    ],
    ombre: [
      {
        enonce: "Pourquoi une direction de sens opposé à la vraie direction du soleil reste-t-elle mathématiquement parallèle à elle, tout en donnant une ombre fausse ?",
        corrige:
          "Le parallélisme ne dépend que de la direction (la droite support), jamais du sens dans lequel on la parcourt — deux droites de même direction mais de sens opposés restent parallèles. Mais projeter un point dans le mauvais sens le place du côté opposé du piquet, une ombre géométriquement impossible puisque le soleil n'éclaire que dans un seul sens à la fois : la vérification de l'ombre est donc sensible au sens, pas seulement à la direction.",
      },
      {
        enonce: "Pourquoi la direction de la lumière n'est-elle jamais donnée numériquement, mais déduite d'un exemple déjà résolu affiché sur le même dessin ?",
        corrige:
          "Les rayons du soleil partagent une seule direction fixe à un instant donné, mais ce chapitre ne donne aucune coordonnée numérique pour l'exprimer. Un point et son ombre déjà connue servent alors de référence déjà résolue : ils fixent la direction, qui peut ensuite être reproduite par simple construction de parallèles pour projeter n'importe quel autre point.",
      },
    ],
  },
  'fonctions-composees': {
    domaine: [
      {
        enonce:
          "Pourquoi une racine d'indice impair n'impose-t-elle aucune condition d'existence, alors qu'une racine d'indice pair en impose une ?",
        corrige:
          "Un nombre négatif a toujours une racine impaire réelle (par exemple $\\sqrt[3]{-8}=-2$), alors qu'aucun réel élevé au carré (ou à une puissance paire) ne peut donner un résultat négatif. La racine paire d'un négatif n'existe donc pour aucun réel, ce qui oblige à exiger un radicande ≥ 0 — contrainte qui n'a simplement pas de raison d'être pour une racine impaire.",
      },
      {
        enonce:
          "Une condition « radicande ≥ 0 » et une condition « dénominateur ≠ 0 » sont-elles le même type de restriction ? Pourquoi ne faut-il jamais les confondre ?",
        corrige:
          "Non : « ≥ 0 » est une inégalité large qui exclut tout un côté de la droite réelle (un intervalle entier), alors que « ≠ 0 » n'exclut qu'un seul point isolé, sans toucher au reste. Confondre les deux revient par exemple à retirer un intervalle entier là où une seule valeur devait disparaître — une erreur qui change complètement la forme du domaine trouvé.",
      },
      {
        enonce:
          "Pourquoi combine-t-on toujours plusieurs conditions d'existence par intersection, et jamais par union ?",
        corrige:
          "Chaque condition d'existence (dénominateur, racine paire...) doit être vérifiée EN MÊME TEMPS que les autres pour que f(x) ait un sens : x doit satisfaire toutes les contraintes à la fois, pas seulement une d'entre elles. L'intersection garde exactement les valeurs communes à toutes les conditions ; une union, elle, accepterait une valeur qui ne vérifie qu'une seule condition sur plusieurs — ce qui ne garantit pas que f(x) soit calculable.",
      },
    ],
    decomposer: [
      {
        enonce:
          "Pourquoi calcule-t-on (f∘g)(x) en appliquant g d'abord, puis f, alors que f est écrite en premier dans la notation ?",
        corrige:
          "La notation $(f\\circ g)(x) = f(g(x))$ se lit de l'intérieur vers l'extérieur : g(x) doit être calculé avant qu'on puisse en prendre l'image par f, exactement comme on ne peut pas mettre ses chaussures avant ses chaussettes. L'ordre d'écriture (f avant g) reflète l'ordre des parenthèses, pas l'ordre de calcul.",
      },
      {
        enonce:
          "Pour décomposer une écriture composée, pourquoi part-on de la DERNIÈRE opération effectuée plutôt que de la première qu'on lit en regardant x ?",
        corrige:
          "La toute dernière opération appliquée est, par définition, celle qui agit sur tout ce qui précède — c'est donc la fonction la plus extérieure de la composée. Partir de l'intérieur (la première opération lue) ne dit rien sur l'ordre des étages tant qu'on n'a pas identifié ce qui enveloppe le reste ; éplucher depuis l'extérieur permet au contraire de retirer un étage à la fois, sans ambiguïté.",
      },
    ],
    composer: [
      {
        enonce:
          "Pourquoi le domaine de (f∘g) dépend-il à la fois de dom g ET de dom f, et pas seulement de dom f puisque c'est f qui est appliquée en dernier ?",
        corrige:
          "x doit d'abord appartenir à dom g pour que g(x) existe — sinon il n'y a même pas de valeur à transmettre à f. Mais il faut ensuite que cette valeur g(x) tombe dans dom f, sinon f ne peut pas la recevoir à son tour. Les deux conditions sont nécessaires : se limiter à dom f ignorerait le fait que g(x) doit déjà exister avant que la question de son appartenance à dom f ait un sens.",
      },
      {
        enonce:
          "Que signifie concrètement trouver dom(f∘g) = ∅ ? Est-ce une erreur de calcul ?",
        corrige:
          "Ce n'est pas une erreur : cela signifie que les valeurs prises par g ne rencontrent jamais le domaine de f, même si g et f sont chacune parfaitement définies séparément. Les deux « mondes » — l'ensemble des images de g, et l'ensemble des entrées acceptées par f — ne se touchent à aucun moment, donc la composée n'a de sens pour aucun x.",
      },
    ],
    graphique: [
      {
        enonce:
          "Pour lire (g∘f)(a) sur deux graphiques, pourquoi commence-t-on par lire le graphe de f et non celui de g, même si g est cité en premier à l'oral (« g rond f ») ?",
        corrige:
          "La notation $(g\\circ f)(a) = g(f(a))$ impose de calculer f(a) avant de pouvoir en prendre l'image par g — la lecture suit l'ordre des parenthèses, pas l'ordre dans lequel les lettres sont prononcées. Lire g en premier donnerait une valeur qui n'a aucun rapport avec la composée demandée.",
      },
      {
        enonce:
          "Pourquoi une image lue graphiquement peut-elle « ne pas exister », alors qu'on a bien deux courbes tracées sous les yeux ?",
        corrige:
          "La valeur intermédiaire f(a), une fois reportée comme nouvelle entrée sur le second graphe, peut tomber en dehors de la portion visible — ou du domaine réel — de ce second graphe. Dans ce cas, g ne peut tout simplement pas recevoir cette entrée : prolonger la courbe à l'œil pour deviner une valeur serait inventer un résultat qui n'existe pas réellement.",
      },
    ],
    contexte: [
      {
        enonce:
          "Pourquoi le domaine « physique » d'un modèle (comme un rayon qui doit être positif) est-il souvent plus restrictif que le domaine purement mathématique de la formule ?",
        corrige:
          "Une formule comme $h(r) = 1000/(\\pi r^2)$ n'exclut, algébriquement, que la valeur qui annule le dénominateur. Mais dans la situation réelle, une grandeur comme un rayon ne peut être ni nulle ni négative : le contexte ajoute des restrictions que l'algèbre seule ne voit pas, car une formule ne « sait » pas ce qu'elle représente physiquement.",
      },
      {
        enonce:
          "En quoi le calcul de l'aire latérale $A_{lat}(r) = 2\\pi r \\cdot h(r)$ est-il un exemple de composition de fonctions, même si l'énoncé ne parle jamais de « fonction composée » ?",
        corrige:
          "L'aire latérale dépend de r ET de h, mais h lui-même ne dépend que de r — en substituant l'expression de h(r) dans la formule de l'aire, on injecte une fonction à l'intérieur d'une autre, exactement le mécanisme d'une composée, simplement sans le nom technique. Le contexte cache souvent une composition derrière une suite d'étapes qui paraissent juste « naturelles ».",
      },
    ],
  },

  'limites-asymptotes': {
    'limites-calcul': [
      {
        enonce:
          "Pourquoi une forme comme ∞−∞ n'a-t-elle pas de résultat automatique, alors qu'une forme comme ∞+∞ en a un (toujours +∞) ?",
        corrige:
          "Dans ∞+∞, les deux termes « poussent dans le même sens » : leur somme ne peut que partir vers +∞, quelle que soit la vitesse de chacun. Dans ∞−∞, les deux termes s'opposent, et le résultat dépend entièrement de LEQUEL des deux grandit le plus vite : selon les fonctions, la différence peut tendre vers un nombre fini, vers l'infini, ou vers 0 — rien n'est automatique, un vrai calcul est nécessaire.",
      },
      {
        enonce:
          "Quelle est la différence entre un « point vide » et une « vraie asymptote verticale », pour une même fraction dont le dénominateur s'annule au même endroit ?",
        corrige:
          "Tout dépend du numérateur à ce point précis. S'il s'annule AUSSI, le facteur commun se simplifie et il ne reste qu'un petit trou invisible dans la courbe (la limite est finie) — un point vide. S'il ne s'annule PAS, rien ne peut compenser le dénominateur qui tend vers 0, et la courbe diverge réellement vers $+\\infty$ ou $-\\infty$ — une vraie asymptote verticale. Le réflexe à avoir est donc de toujours tester le numérateur avant de conclure.",
      },
      {
        enonce:
          "Une fonction peut être définie en un point a sans pourtant avoir de limite en a : pourquoi ces deux notions sont-elles indépendantes ?",
        corrige:
          "f(a) ne regarde que ce qui se passe EXACTEMENT en a, alors que $\\lim_{x \\to a} f(x)$ regarde ce qui se passe TOUT AUTOUR de a, sans jamais regarder a lui-même. Si la limite à gauche et la limite à droite de a diffèrent (un saut dans la courbe), la limite globale n'existe pas, même si f(a) est parfaitement défini — les deux questions portent sur des informations différentes.",
      },
    ],
    'asymptote-oblique': [
      {
        enonce:
          "Pourquoi une asymptote oblique n'existe-t-elle que lorsque le degré du numérateur dépasse celui du dénominateur d'exactement 1, ni plus ni moins ?",
        corrige:
          "Si les degrés sont égaux, le quotient tend vers un nombre fini (le rapport des coefficients dominants) : c'est une horizontale, pas une oblique. Si le numérateur dépasse le dénominateur de 2 degrés ou plus, la fonction diverge plus vite qu'aucune droite ne peut la suivre. Un écart d'exactement 1 degré est la seule situation où le quotient de la division euclidienne est lui-même une expression du premier degré — une vraie droite, ni plate ni trop rapide.",
      },
      {
        enonce:
          "Dans $f(x) = x-2 + \\dfrac{3}{x-1}$, pourquoi l'asymptote est-elle $y=x-2$ et non toute l'expression f(x) elle-même ?",
        corrige:
          "Une asymptote doit être une DROITE, et $f(x) = x-2 + 3/(x-1)$ n'en est pas une — c'est la fonction complète. Le terme $3/(x-1)$ est justement celui qui tend vers 0 quand x part à l'infini : c'est lui qui rapproche progressivement la courbe de la droite $y=x-2$, qui est le seul morceau rectiligne de l'écriture.",
      },
    ],
    'lecture-graphique': [
      {
        enonce:
          "Sur un graphique, qu'est-ce qui distingue visuellement une asymptote horizontale d'une asymptote oblique ?",
        corrige:
          "Une asymptote horizontale reste parfaitement plate : la courbe s'aplatit, sa hauteur ne varie presque plus aux extrémités. Une asymptote oblique continue, elle, de monter ou de descendre régulièrement — la courbe épouse de plus en plus la pente d'une droite inclinée, sans jamais s'aplatir.",
      },
      {
        enonce:
          "Pourquoi les deux côtés d'une même asymptote verticale n'ont-ils pas forcément le même signe de limite ?",
        corrige:
          "Le signe de chaque côté dépend du signe réel du dénominateur juste avant et juste après la valeur exclue, et rien n'impose que ce signe soit le même des deux côtés. Il arrive que les deux côtés partagent le même signe (cas d'une racine double au dénominateur), mais ça ne se devine jamais à l'avance : il faut toujours regarder chaque côté séparément, jamais supposer une symétrie automatique.",
      },
    ],
    'limites-contexte': [
      {
        enonce:
          "Pourquoi une asymptote horizontale en contexte (comme un coût unitaire) représente-t-elle un plancher ou un plafond jamais atteint, plutôt qu'une valeur que le phénomène finit par prendre réellement ?",
        corrige:
          "Une limite décrit ce dont la fonction se rapproche d'aussi près qu'on veut, sans jamais l'atteindre pour une valeur finie de x, aussi grande soit-elle. Le terme qui s'annule à l'infini (comme $240/x$) reste strictement positif pour tout x fini : la valeur limite n'est donc qu'un idéal théorique vers lequel le phénomène tend, jamais une valeur vraiment prise.",
      },
      {
        enonce:
          "Pourquoi faut-il vérifier que le domaine mathématique d'une limite a un sens dans le contexte réel avant d'interpréter le résultat ?",
        corrige:
          "Une limite calculée algébriquement peut porter sur des valeurs de x qui n'ont aucun sens dans la situation concrète — une production négative, un temps négatif. Interpréter le résultat sans vérifier cette compatibilité risquerait de donner un sens physique à un comportement purement mathématique, qui ne correspond à rien de réel dans le problème posé.",
      },
    ],
    'etude-complete': [
      {
        enonce:
          "Pourquoi faut-il tester le numérateur en plus du dénominateur avant de conclure qu'une valeur exclue du domaine correspond à une vraie asymptote verticale ?",
        corrige:
          "Le dénominateur qui s'annule ne garantit, à lui seul, qu'une forme du type « un nombre divisé par 0 ». Si le numérateur s'annule AUSSI au même point, le facteur commun se simplifie et la limite devient finie — un simple point vide, pas une divergence. Sans ce test, on risquerait d'annoncer une asymptote verticale là où la courbe n'a en réalité qu'un trou invisible.",
      },
      {
        enonce:
          "En quoi la division euclidienne et la méthode des limites ($a=\\lim f(x)/x$, $b=\\lim[f(x)-ax]$) sont-elles deux chemins vers le même résultat ? Pourquoi est-ce utile de les comparer ?",
        corrige:
          "La division euclidienne écrit directement $f(x) = (ax+b) + \\text{reste}$, où le reste tend vers 0 — c'est donc immédiatement l'équation de l'asymptote. La méthode des limites retrouve a et b indépendamment, sans passer par une division. Les deux méthodes doivent obligatoirement retomber sur exactement la même droite : si elles divergent, c'est le signal qu'une erreur de calcul s'est glissée dans l'une des deux.",
      },
    ],
  },
  trigonometrie: {
    'arcs-secteurs': [
      {
        enonce: "Pourquoi un radian est-il considéré comme « sans unité » alors qu'un degré est bien une unité ?",
        corrige:
          "Le radian est défini comme le rapport entre la longueur d'un arc et le rayon — un rapport de deux grandeurs de même nature (deux longueurs), donc un nombre pur, sans dimension. Le degré, lui, est une fraction arbitraire du tour complet, un découpage choisi par convention et non un rapport géométrique — c'est pourquoi un angle en radians est un simple nombre réel (la formule $s=r\\theta$ n'a besoin d'aucun facteur de conversion), alors qu'un angle en degrés a besoin de son symbole ° pour être compris.",
      },
      {
        enonce: "Pourquoi doubler le nombre de côtés des polygones d'Archimède resserre-t-il l'encadrement de π, plutôt que de le laisser inchangé ?",
        corrige:
          "Les deux polygones (inscrit et circonscrit) se rapprochent chacun du cercle à mesure que n augmente — leurs côtés deviennent des segments de plus en plus courts, presque confondus avec l'arc de cercle qu'ils approchent. L'écart entre leurs deux périmètres diminue donc avec n, ce qui resserre l'intervalle dans lequel π est encadré.",
      },
    ],
    polygones: [
      {
        enonce: "Pourquoi calcule-t-on l'aire d'une figure composée en additionnant ou soustrayant des aires élémentaires, plutôt que par une formule directe ?",
        corrige:
          "Il n'existe pas de formule unique pour une forme hybride (un secteur accolé à un triangle, par exemple). On la décompose donc en morceaux simples — triangles, secteurs — dont l'aire est déjà connue, puis on additionne les parties qui s'ajoutent et on soustrait celles qui se chevauchent, selon la configuration exacte de la figure.",
      },
      {
        enonce: "Pourquoi l'angle au centre couvert par un secteur n'est-il pas toujours $2\\pi/n$, l'angle élémentaire d'un seul côté du polygone ?",
        corrige:
          "$2\\pi/n$ correspond à l'angle d'un seul côté du polygone régulier. Mais le secteur dont on demande l'aire peut s'étendre sur plusieurs côtés consécutifs — son angle vaut alors un multiple de $2\\pi/n$, selon le nombre exact de côtés qu'il couvre sur la figure, jamais supposé égal à l'angle élémentaire sans vérification.",
      },
    ],
    'geometrie-cercle': [
      {
        enonce: "Pourquoi obtient-on l'aire d'un segment circulaire en soustrayant l'aire du triangle de celle du secteur, et non l'inverse ?",
        corrige:
          "Le secteur contient à la fois le triangle (formé par les deux rayons et la corde) et le segment (la région entre la corde et l'arc) — retirer le triangle du secteur isole exactement ce qui reste, le segment. Soustraire dans l'autre sens donnerait une valeur négative, qui ne correspond à aucune aire réelle.",
      },
      {
        enonce: "Pourquoi utilise-t-on la loi des cosinus, et non le théorème de Pythagore, pour calculer la longueur d'une corde à partir de l'angle au centre ?",
        corrige:
          "Pythagore ne s'applique qu'à un triangle rectangle. Le triangle formé par les deux rayons et la corde est isocèle, mais son angle au sommet (l'angle au centre θ) n'est en général pas de 90°. La loi des cosinus généralise Pythagore à un angle quelconque, ce qui est indispensable ici.",
      },
    ],
    parametres: [
      {
        enonce: "Pourquoi parle-t-on de « pulsation » ω plutôt que directement de la période T dans l'écriture $A\\sin(\\omega x+\\varphi)+b$ ?",
        corrige:
          "ω est le nombre qui multiplie directement x dans l'argument — c'est donc lui qui apparaît naturellement dans la formule. La période T, elle, est une distance en x entre deux répétitions de la courbe : une notion géométrique qui se déduit de ω par $T=2\\pi/\\omega$, mais qui n'apparaît jamais directement dans l'expression algébrique.",
      },
      {
        enonce: "φ et Φ (le décalage horizontal) désignent-ils la même chose ? Justifie.",
        corrige:
          "Non. φ est la constante ajoutée dans l'argument, $\\omega x+\\varphi$. Φ est la valeur soustraite à x dans la forme $\\omega(x-\\Phi)$, reliée à φ par $\\Phi=-\\varphi/\\omega$. Un exercice qui demande « le déphasage » veut φ ; un exercice qui demande « le décalage horizontal » ou « de combien la courbe est translatée » veut Φ.",
      },
      {
        enonce: "Pourquoi tan a-t-elle une période de π, alors que sin et cos ont une période de 2π ?",
        corrige:
          "$\\tan(x+\\pi)=\\sin(x+\\pi)/\\cos(x+\\pi)$. Or $\\sin(x+\\pi)=-\\sin x$ et $\\cos(x+\\pi)=-\\cos x$ — les deux signes changent en même temps, donc leur rapport (tan) retrouve exactement sa valeur de départ après seulement un demi-tour, alors que sin et cos, eux, changent réellement de valeur après un demi-tour et ont besoin du tour complet pour revenir à l'identique.",
      },
    ],
    'lecture-graphique': [
      {
        enonce: "Pourquoi mesure-t-on la période entre deux maximums consécutifs plutôt qu'entre deux traversées de la ligne moyenne ?",
        corrige:
          "Un maximum est un point isolé et net, facile à repérer précisément sur un graphique. Une traversée de la ligne moyenne est un point de passage, plus difficile à pointer exactement au pixel près — la mesure entre deux maximums est donc en général plus fiable.",
      },
      {
        enonce: "Pourquoi la méthode « lire φ à la traversée montante de la ligne moyenne » suppose-t-elle implicitement que A>0 ?",
        corrige:
          "Si A est négatif, la courbe est inversée : elle décroît là où le sinus de référence croît. La traversée qui serait « montante » pour A>0 devient alors « descendante ». Lire φ sur une traversée montante sans vérifier le sens de variation réel donnerait, dans ce cas, une phase fausse d'un demi-tour.",
      },
    ],
    extremums: [
      {
        enonce: "Pourquoi la période « effective » des extremums réunis (maximums et minimums) est-elle la moitié de celle des maximums seuls ?",
        corrige:
          "Une oscillation atteint un maximum ET un minimum à chaque tour complet (période $2\\pi$ en u pour chacun séparément). En acceptant l'un OU l'autre, on en croise donc deux fois plus souvent dans le même intervalle — la période entre deux extremums quelconques, maximum ou minimum, est divisée par deux.",
      },
      {
        enonce: "Pourquoi « donne les maximums » et « donne tous les extremums » ne correspondent-ils jamais à la même formule ?",
        corrige:
          "Les maximums seuls viennent de la condition $\\sin(u)=1$ (une seule famille, période $2\\pi$). Tous les extremums réunis viennent de $|\\sin(u)|=1$, c'est-à-dire $\\sin(u)=\\pm1$ (les deux familles ensemble, période effective $\\pi$) — deux conditions mathématiquement différentes, qui donnent donc deux formules différentes.",
      },
    ],
    modeliser: [
      {
        enonce: "Pourquoi calcule-t-on toujours φ en dernier dans la construction d'un modèle sinusoïdal, jamais en premier ?",
        corrige:
          "A, b et ω (via T) se déduisent uniquement des valeurs extrêmes et de la durée d'un cycle — des informations globales, valables pour toute la fonction. φ, lui, dépend d'une condition à un instant précis, qu'on ne peut injecter que dans l'équation déjà complète avec les trois autres paramètres — il faut donc les connaître avant de pouvoir isoler φ.",
      },
      {
        enonce: "Pourquoi une équation comme $\\sin(\\varphi)=-1$ a-t-elle une infinité de solutions, et comment choisit-on celle à garder ?",
        corrige:
          "Parce que le sinus est périodique de période $2\\pi$ — une infinité de valeurs de φ, toutes distantes d'un multiple de $2\\pi$, vérifient la même équation et donnent exactement la même fonction. On choisit par convention la plus simple, en général celle de l'intervalle $]-\\pi;\\pi]$.",
      },
    ],
    equations: [
      {
        enonce: "Pourquoi $\\cos(x)=t$ et $\\sin(x)=t$ ont-elles en général deux familles de solutions, alors que $\\tan(x)=t$ n'en a qu'une seule ?",
        corrige:
          "Le cercle trigonométrique est symétrique : pour une même ordonnée (sinus), il y a en général deux points distincts, symétriques par rapport à l'axe vertical ; pour une même abscisse (cosinus), deux points symétriques par rapport à l'axe horizontal. tan, définie comme le quotient sin/cos, prend la même valeur en deux points diamétralement opposés du cercle, qui ne forment qu'une seule famille, de période π.",
      },
      {
        enonce: "Pourquoi faut-il diviser par a aussi bien le terme constant que le terme de période ($2k\\pi$) en revenant de u à x ?",
        corrige:
          "L'équation en u comprend une infinité de solutions, toutes espacées de $2\\pi$ (le « $+2k\\pi$ »). En remplaçant u par ax+b et en isolant x, cet espacement doit lui aussi être divisé par a — sinon, les solutions trouvées en x auraient la mauvaise période ($2\\pi$ au lieu de $2\\pi/a$), une erreur fréquente qui ne touche que la constante sans corriger l'espacement.",
      },
    ],
  },
  suites: {
    'suites-arithmetiques': [
      {
        enonce: "Pourquoi une suite définie par récurrence a-t-elle besoin d'un terme de départ donné explicitement, alors qu'une suite définie explicitement n'en a pas besoin ?",
        corrige:
          "Une définition par récurrence n'exprime un terme qu'en fonction du ou des termes précédents — sans un premier terme connu, il n'existe aucun point de départ à partir duquel calculer les suivants. Une définition explicite donne directement $u_n$ en fonction de $n$ seul, sans jamais faire référence à un terme antérieur.",
      },
      {
        enonce: "Pourquoi un terme d'une suite arithmétique est-il toujours la moyenne arithmétique de ses deux voisins ?",
        corrige:
          "Par définition, $u_{n-1}$ et $u_{n+1}$ s'écrivent $u_n-r$ et $u_n+r$. Leur somme vaut $2u_n$ (les $\\pm r$ s'annulent), donc leur moyenne vaut exactement $u_n$ — une conséquence directe du fait que la raison ajoutée est constante, pas une coïncidence propre à un exemple particulier.",
      },
    ],
    'suites-geometriques': [
      {
        enonce: "Pourquoi une suite géométrique de raison négative oscille-t-elle, alors qu'une raison positive la laisse toujours croissante ou décroissante ?",
        corrige:
          "Multiplier par un nombre négatif inverse le signe du terme à chaque étape — la suite alterne donc entre positif et négatif, ce qui empêche toute évolution constamment dans le même sens. Multiplier par un nombre positif conserve le signe : la suite évolue alors toujours dans la même direction, selon que la raison est plus grande ou plus petite que 1.",
      },
      {
        enonce: "Pourquoi $q^k=a$ peut-il avoir deux solutions, une seule, ou aucune, selon que k est pair ou impair ?",
        corrige:
          "Si k est pair, $(-q)^k=q^k$ — toute solution positive a donc un jumeau négatif, d'où deux solutions opposées si $a>0$, et aucune si $a<0$ (une puissance paire d'un réel n'est jamais négative). Si k est impair, chaque réel possède exactement une racine k-ième, quel que soit le signe de a — une seule solution, toujours.",
      },
      {
        enonce: "Pourquoi un terme d'une suite géométrique est-il la moyenne géométrique, et non arithmétique, de ses deux voisins ?",
        corrige:
          "$u_{n-1}$ et $u_{n+1}$ s'écrivent $u_n/q$ et $u_n\\times q$. Leur produit vaut $u_n^2$ (les facteurs q s'annulent par multiplication), donc leur moyenne géométrique $\\sqrt{u_{n-1}\\times u_{n+1}}$ vaut exactement $u_n$ — le pendant multiplicatif exact de la propriété analogue pour une suite arithmétique.",
      },
    ],
    convergence: [
      {
        enonce: "Pourquoi une suite arithmétique ne peut-elle jamais converger, sauf si sa raison est nulle ?",
        corrige:
          "Chaque terme s'éloigne du précédent d'exactement r, une quantité fixe qui ne diminue jamais. Si $r\\neq0$, les termes s'accumulent donc sans borne vers $+\\infty$ ou $-\\infty$ — ils ne peuvent jamais se rapprocher indéfiniment d'une valeur finie. Seul $r=0$ (suite constante) a une limite, triviale.",
      },
      {
        enonce: "Pourquoi une suite géométrique peut-elle converger, alors qu'une suite arithmétique de raison non nulle ne le peut jamais ?",
        corrige:
          "Une suite géométrique multiplie par q à chaque étape — si $|q|<1$, chaque terme est plus proche de 0 que le précédent, l'écart entre deux termes consécutifs rétrécit sans cesse. Une suite arithmétique, elle, ajoute toujours le même écart r, qui ne rétrécit jamais : c'est cette possibilité de rétrécissement progressif qui permet la convergence géométrique.",
      },
      {
        enonce: "Pourquoi une suite géométrique de raison $q=-1$ ne diverge-t-elle pas vers l'infini, bien qu'elle ne converge pas non plus ?",
        corrige:
          "Les termes alternent entre $u_1$ et $-u_1$ sans jamais dépasser ces deux valeurs en valeur absolue — la suite reste bornée, elle ne peut donc tendre ni vers $+\\infty$ ni vers $-\\infty$. Mais elle ne se stabilise non plus sur aucune valeur unique : sa limite n'existe tout simplement pas, un troisième cas distinct de la convergence et de la divergence infinie.",
      },
    ],
    'problemes-classiques': [
      {
        enonce: "Pourquoi une suite géométrique de raison supérieure à 1 finit-elle toujours par dépasser n'importe quelle suite arithmétique, même avec une raison additive énorme ?",
        corrige:
          "Une suite arithmétique grandit à vitesse constante (toujours +r). Une suite géométrique grandit sur elle-même : chaque nouveau terme est multiplié par le terme déjà atteint, donc son accroissement augmente sans cesse, alors que celui de la suite arithmétique reste fixe. C'est une différence de nature, pas seulement de vitesse de départ — elle garantit que la géométrique rattrape et dépasse toujours, tôt ou tard.",
      },
      {
        enonce: "Face à un problème habillé par un contexte concret, comment reconnaît-on s'il faut une suite arithmétique ou géométrique avant même de choisir une formule ?",
        corrige:
          "On repère ce qui varie d'une étape à l'autre dans l'énoncé. Une quantité AJOUTÉE, toujours la même, à chaque étape signale une suite arithmétique ; une quantité MULTIPLIÉE, toujours par le même facteur, signale une suite géométrique. Ce repérage précède toujours le choix de la formule, qui ne vient qu'une fois la nature de la suite identifiée.",
      },
    ],
    'comparaison-suites': [
      {
        enonce: "Pourquoi faut-il vérifier que la condition est fausse au rang n−1, et pas seulement vraie au rang n trouvé ?",
        corrige:
          "Trouver un rang qui vérifie la condition ne garantit pas que c'est le premier — un rang antérieur pourrait déjà la vérifier sans qu'on l'ait remarqué. Vérifier explicitement qu'elle est fausse au rang précédent confirme qu'on a bien identifié le vrai point de bascule, et non un rang qui la vérifie par hasard plus loin dans le tableau.",
      },
      {
        enonce: "Pourquoi n'existe-t-il pas de formule directe pour trouver le rang où une suite géométrique dépasse une suite arithmétique, obligeant à un balayage numérique ?",
        corrige:
          "Comparer une expression linéaire en n (arithmétique) à une expression exponentielle en n (géométrique) revient à résoudre une inégalité qui mélange ces deux natures — ce type d'inégalité n'a en général aucune solution algébrique explicite en n, contrairement à la comparaison de deux expressions de même nature. Le balayage terme après terme reste donc la méthode la plus fiable.",
      },
    ],
    'recurrente-affine': [
      {
        enonce: "Pourquoi le régime permanent $L=b/(1-a)$ n'est-il une vraie limite que si $|a|<1$ ?",
        corrige:
          "L est seulement la seule valeur candidate pour une limite — le point fixe de la récurrence. Rien dans son calcul ne garantit que la suite s'en approche réellement. C'est la condition $|a|<1$ qui garantit que l'écart entre un terme et L se réduit à chaque étape ; si $|a|\\geq1$, la formule produit quand même un nombre, mais la suite s'en éloigne ou oscille sans jamais s'en rapprocher — L n'est alors pas une limite.",
      },
      {
        enonce: "Pourquoi une suite récurrente affine converge-t-elle vers un point fixe de sa propre récurrence, plutôt que vers une valeur quelconque ?",
        corrige:
          "Si la suite converge vers une limite L, alors $u_{n+1}$ et $u_n$ tendent tous deux vers cette même limite (ce n'est que la même suite décalée d'un rang). En passant à la limite dans $u_{n+1}=a\\times u_n+b$, on obtient $L=a\\times L+b$ — exactement la condition qui fait de L un point fixe de la récurrence. La limite ne peut donc être qu'une valeur que la récurrence laisse inchangée.",
      },
    ],
  },
  'derivees-applications': {
    'definition-derivee': [
      {
        enonce:
          "Le taux d'accroissement [f(a+h)-f(a)]/h donne toujours 0/0 si on y remplace directement h=0. Pourquoi cela n'empêche-t-il pas f'(a) d'exister ?",
        corrige:
          "Le numérateur f(a+h)−f(a) tend vers 0 EN MÊME TEMPS que le dénominateur h, puisque f(a+h) se rapproche de f(a) quand h→0 — c'est donc une forme indéterminée, pas une preuve que la limite n'existe pas. Simplifier algébriquement AVANT de passer à la limite fait disparaître ce h commun et révèle la vraie valeur limite, qui n'a elle rien d'indéterminé.",
      },
      {
        enonce:
          "Deux sécantes construites avec des valeurs de h différentes (par exemple h=2 et h=0,5) ont des pentes différentes. Pourquoi ces deux pentes se rapprochent-elles forcément de la même valeur quand h se rapproche de 0 ?",
        corrige:
          "Parce que f'(a) est précisément définie comme LA limite du taux d'accroissement quand h→0 : si cette limite existe, toute suite de valeurs de h tendant vers 0 doit donner des taux d'accroissement qui convergent vers ce même nombre, quel que soit le chemin suivi. Deux choix de h différents ne sont que deux instantanés de cette même convergence, jamais deux processus indépendants.",
      },
    ],
    tangentes: [
      {
        enonce:
          "Pourquoi la pente d'une tangente en un point ne peut-elle jamais être obtenue en prenant simplement deux points DISTINCTS de la courbe, même très proches l'un de l'autre ?",
        corrige:
          "Deux points distincts, quelle que soit leur proximité, ne donnent que la pente d'une sécante — une approximation, pas la valeur exacte. La tangente n'est définie que comme la LIMITE de ces sécantes quand le second point vient se confondre avec le premier (h→0) ; tant que les deux points restent séparés, même très proches, on calcule encore un taux d'accroissement, jamais f'(a) lui-même.",
      },
      {
        enonce:
          "Si la tangente en un point a une pente nulle, cela veut-il dire que f est constante autour de ce point ? Justifie à l'aide de l'exemple de la section.",
        corrige:
          "Non — une tangente horizontale en un seul point n'affirme rien sur le comportement de f ailleurs. f(x)=x²−2x+1 a une tangente horizontale uniquement en x=1, mais elle est strictement décroissante avant ce point et strictement croissante après : elle n'est constante nulle part. Une pente nulle ne décrit que l'instant précis en ce point, jamais un voisinage entier.",
      },
    ],
    'fonction-derivee': [
      {
        enonce:
          "Pourquoi le domaine de dérivabilité d'une fonction peut-il être strictement plus petit que son domaine de définition ? Illustre avec √x.",
        corrige:
          "Une fonction peut être définie en un point sans que sa courbe y ait de tangente bien déterminée — être défini ne garantit pas que la limite du taux d'accroissement existe. √x est bien définie en x=0, mais le taux d'accroissement y tend vers +∞ (la tangente y est verticale) : 0 appartient donc à dom f sans appartenir à dom_d f.",
      },
      {
        enonce:
          "Pourquoi (u·v)' n'est-elle pas égale à u'·v' — qu'est-ce que cette erreur ignore dans la façon dont un produit varie ?",
        corrige:
          "La dérivée d'un produit reçoit une contribution de la variation de u, pondérée par la valeur de v, ET une contribution de la variation de v, pondérée par la valeur de u — exactement ce que traduit u'v+uv'. Multiplier simplement u' et v' ignore ces deux pondérations croisées et ne correspond à aucune décomposition réelle de la variation du produit.",
      },
    ],
    'signe-derivees': [
      {
        enonce:
          "Pourquoi la condition f'(a)=0 est-elle nécessaire mais pas suffisante pour affirmer que f admet un extremum en a ?",
        corrige:
          "Elle est nécessaire car un sommet ou un creux a toujours une tangente horizontale — sinon la courbe continuerait encore à monter ou à descendre, donc ne serait pas encore à un extremum. Mais elle n'est pas suffisante : une tangente horizontale peut aussi correspondre à un simple replat où f' s'annule sans changer de signe, la courbe continuant alors dans le même sens. f'(a)=0 seule ne distingue jamais ces deux cas — seul un vrai changement de signe de f' le fait.",
      },
      {
        enonce:
          "En quoi un point d'inflexion diffère-t-il fondamentalement d'un extremum local, même si les deux sont des points particuliers de la courbe ?",
        corrige:
          "Un extremum correspond à un changement de DIRECTION (f' change de signe) : la courbe monte puis redescend, ou l'inverse. Un point d'inflexion correspond à un changement de CONCAVITÉ (f'' change de signe) : la courbe garde le même sens de variation, mais passe d'une forme de bol à une forme de dôme — sa tangente peut même y être oblique, pas forcément horizontale. Les deux notions reposent sur deux dérivées différentes et ne se recouvrent que par coïncidence.",
      },
    ],
    'etude-locale': [
      {
        enonce:
          "Pourquoi un point critique qui n'est PAS un extremum correspond-il toujours à un point d'inflexion à tangente horizontale, jamais à un autre type de point ?",
        corrige:
          "Si f' ne change pas de signe en a, f continue de croître (ou de décroître) de part et d'autre — ce n'est donc pas un extremum. Mais la tangente y est horizontale ET le sens de variation ne change pas : la courbe traverse cette tangente au lieu de rebondir sur elle, ce qui est exactement la définition d'une inflexion, ici simplement à pente nulle plutôt qu'oblique.",
      },
      {
        enonce:
          "Si f'(a)=0, suffit-il de regarder le signe de f' d'UN SEUL côté de a pour conclure qu'il y a (ou non) un extremum en a ? Justifie.",
        corrige:
          "Non — il faut comparer les DEUX côtés. Connaître le signe d'un seul côté ne renseigne que sur le sens de variation local de ce côté-là ; cela ne dit rien de ce qui se passe de l'autre côté, qui peut aussi bien changer de signe (extremum) que le garder (pas d'extremum). Seule la comparaison des deux côtés permet de trancher.",
      },
    ],
    'lecture-graphique-derivees': [
      {
        enonce:
          "Sur un graphique de f, sans aucune formule, comment distingues-tu visuellement un simple ralentissement de la croissance d'un véritable extremum ?",
        corrige:
          "Un ralentissement se voit par une pente qui diminue mais reste du MÊME signe — la courbe continue à monter, juste moins vite, sans jamais changer de sens. Un extremum, lui, exige que la courbe change réellement de direction : elle doit arrêter de monter pour redescendre, ou l'inverse. Le critère décisif n'est donc jamais « la pente a changé », mais « la courbe a changé de sens ».",
      },
      {
        enonce:
          "En lisant uniquement un graphique de f, peux-tu distinguer un point d'inflexion à tangente horizontale d'un véritable minimum local ? Comment ?",
        corrige:
          "Oui, en observant le comportement de la courbe de part et d'autre du point à tangente horizontale. Si elle descend avant et remonte après, c'est un minimum. Si elle monte (ou descend) sans interruption des deux côtés, malgré le replat horizontal, c'est un point d'inflexion. Le replat lui-même ne permet jamais de trancher — seul le sens de la courbe autour de lui le permet.",
      },
    ],
    'etudier-fonction': [
      {
        enonce:
          "Pourquoi faut-il déterminer le domaine de f AVANT de calculer et d'étudier le signe de f', plutôt qu'à la fin pour simplement vérifier ?",
        corrige:
          "Parce que les valeurs exclues du domaine de f sont aussi exclues du domaine de f' — un tableau de signes construit sans cette information risquerait de traiter une valeur interdite comme n'importe quel autre réel, et d'y laisser une flèche de variation enjamber un point où f n'est même pas définie.",
      },
      {
        enonce:
          "Deux morceaux de courbe séparés par une asymptote verticale semblent parfois se prolonger visuellement l'un dans l'autre. Pourquoi le tableau de variations ne doit-il jamais les relier par une seule flèche ?",
        corrige:
          "Parce que f n'est tout simplement pas définie au point d'exclusion : il n'existe aucune valeur f(a) à cet endroit, donc aucune continuité réelle entre les deux morceaux, même si leur allure graphique le suggère. Une flèche affirme implicitement que f est définie et monotone sur tout l'intervalle qu'elle couvre — l'étendre par-dessus une valeur exclue affirmerait quelque chose de faux.",
      },
    ],
    'optimisation-geometrique': [
      {
        enonce:
          "Pourquoi faut-il toujours utiliser la contrainte pour exprimer la grandeur à optimiser en fonction d'une SEULE variable, avant de pouvoir la dériver ?",
        corrige:
          "La dérivée, telle qu'étudiée dans ce chapitre, ne se définit que pour une fonction d'une seule variable — dériver une expression qui dépend encore de deux variables indépendantes n'a pas de sens ici. La contrainte donnée dans l'énoncé est justement la relation qui permet d'éliminer une variable au profit de l'autre, ramenant le problème à une fonction d'une seule variable.",
      },
      {
        enonce:
          "Trouver x tel que A'(x)=0 suffit-il à garantir que cette valeur donne un MAXIMUM de l'aire plutôt qu'un minimum ? Qu'est-ce qui permet de le confirmer ?",
        corrige:
          "Non — A'(x)=0 ne donne qu'un point critique, un simple candidat. Il faut ensuite confirmer sa nature, par un tableau de signes de A' autour de ce point ou par le signe de A'' en ce point. Sans cette étape, rien ne distingue mathématiquement un maximum d'un minimum, ou même d'un point critique sans extremum.",
      },
    ],
    'contexte-economique': [
      {
        enonce:
          "Pourquoi la quantité qui maximise la recette R(x) n'est-elle, en général, pas la même que celle qui maximise le bénéfice B(x) ?",
        corrige:
          "Maximiser R(x) seule ignore totalement le coût de production, alors que le bénéfice est B(x)=R(x)−C(x). Une quantité peut augmenter la recette tout en augmentant le coût encore plus vite, ce qui diminue le bénéfice net : R'(x)=0 et B'(x)=0 sont deux conditions portant sur deux fonctions différentes, qui n'ont aucune raison de se résoudre pour la même valeur de x.",
      },
      {
        enonce:
          "Que représente, en termes économiques, l'écart entre le coût marginal discret C(q+1)−C(q) et la dérivée C'(q) ?",
        corrige:
          "C'(q) est une vitesse instantanée de variation du coût exactement au niveau de production q, alors que C(q+1)−C(q) est la variation réelle provoquée par une unité ENTIÈRE supplémentaire — un taux de variation moyen sur tout un intervalle de longueur 1, pas en un seul point. Les deux coïncident seulement dans la limite où l'unité ajoutée serait infinitésimale, ce qu'elle n'est jamais en pratique.",
      },
    ],
    'extrema-bornes': [
      {
        enonce:
          "Pourquoi un maximum absolu sur un intervalle fermé [a;b] peut-il se trouver à une borne, sans que f' s'y annule ?",
        corrige:
          "La condition f'(x)=0 ne s'applique qu'aux extremums LOCAUX, atteints à l'intérieur de l'intervalle, où la courbe doit changer de sens des deux côtés. Une borne n'a qu'un seul côté à l'intérieur de l'intervalle : f peut y être encore strictement croissante (ou décroissante) juste avant, sans jamais redescendre après puisqu'il n'y a pas d'« après ». Rien n'exige alors que f' s'y annule pour que ce soit tout de même la plus grande (ou la plus petite) valeur atteinte.",
      },
      {
        enonce:
          "Le maximum local trouvé par le tableau de signes de f' est-il nécessairement le maximum absolu de f sur [a;b] ? Justifie.",
        corrige:
          "Non — rien ne le garantit. Le tableau de signes ne renseigne que sur les variations à l'intérieur de l'intervalle ; il ne compare jamais ces valeurs à celles prises aux bornes. Le maximum absolu est le plus grand nombre parmi TOUTES les valeurs candidates réunies — extremums locaux ET valeurs aux deux bornes — un maximum local peut très bien être dépassé par la valeur à une borne.",
      },
    ],
    'vitesse-position': [
      {
        enonce:
          "En quoi la vitesse et l'accélération sont-elles toutes deux des dérivées, mais de nature différente l'une par rapport à l'autre ?",
        corrige:
          "La vitesse v(t)=s'(t) est la dérivée PREMIÈRE de la position : elle mesure le taux de variation instantané de la position. L'accélération a(t)=v'(t)=s''(t) est la dérivée de la vitesse, donc la dérivée SECONDE de la position : elle mesure le taux de variation de la vitesse elle-même, pas de la position directement. Chacune est une dérivée par rapport au temps, mais appliquée à une grandeur différente.",
      },
      {
        enonce:
          "Une vitesse négative signifie-t-elle que le mobile ralentit ? Justifie en reliant ta réponse au signe de l'accélération.",
        corrige:
          "Non — v(t)<0 signifie seulement que le mobile se déplace dans le sens négatif, pas qu'il ralentit. Ralentir signifie que la valeur ABSOLUE de la vitesse diminue, ce qui dépend de la comparaison des signes de v(t) et de a(t) : si les deux sont du même signe, le mobile accélère (même en reculant plus vite) ; s'ils sont de signes opposés, il ralentit. Le signe de v seul ne permet jamais cette conclusion.",
      },
    ],
  },
  'fonctions-exponentielles': {
    limites: [
      {
        enonce: "Pourquoi une croissance exponentielle finit-elle toujours par dépasser n'importe quelle croissance polynomiale, même si le polynôme semble beaucoup plus grand au départ ?",
        corrige:
          "Un polynôme progresse par un pas qui ralentit relativement : chaque unité ajoutée pèse de moins en moins par rapport à la valeur déjà atteinte. Une exponentielle progresse au contraire par un facteur multiplicatif constant, qui démultiplie sans cesse l'écart avec ce qu'elle valait avant. Même avec un retard initial énorme (un exposant 1000, par exemple), ce facteur continue de s'amplifier indéfiniment alors que le polynôme stagne relativement — tôt ou tard, l'exponentielle rattrape et dépasse n'importe quel polynôme.",
      },
      {
        enonce: "Qu'est-ce qui distingue vraiment une croissance linéaire d'une croissance exponentielle, au-delà de la simple forme de la courbe ?",
        corrige:
          "Dans un modèle linéaire, à chaque pas de temps égal, c'est une quantité fixe qui s'ajoute (toujours le même nombre). Dans un modèle exponentiel, c'est un facteur constant qui multiplie la quantité déjà atteinte — donc plus la quantité est grande, plus l'ajout réel l'est aussi. C'est cette différence entre additionner et multiplier qui explique pourquoi la croissance exponentielle finit toujours par l'emporter, même si elle démarre plus bas.",
      },
    ],
    derivee: [
      {
        enonce: "Pourquoi e est-elle la seule base pour laquelle (aˣ)' vaut exactement aˣ, sans aucun facteur devant ?",
        corrige:
          "La dérivée générale est (aˣ)' = ln(a)·aˣ, et ce facteur ln(a) est par définition la pente de la tangente à la courbe en (0;1). Chaque base a sa propre pente en ce point, et e est exactement, par construction, la base dont cette pente vaut 1 — ce n'est pas une coïncidence, c'est la raison même pour laquelle e est désignée comme particulière parmi toutes les bases possibles.",
      },
      {
        enonce: "Pourquoi le seul signe de ln(a) suffit-il à savoir si aˣ est croissante ou décroissante, sans tracer aucun graphique ?",
        corrige:
          "La dérivée (aˣ)' = ln(a)·aˣ est un produit où aˣ est toujours strictement positif, quel que soit x. Le signe de la dérivée est donc exactement celui de ln(a). Comme ln(a) est négatif pour 0<a<1 et positif pour a>1, le calcul de dérivée redémontre algébriquement la monotonie déjà observée graphiquement, sans avoir besoin de visualiser quoi que ce soit.",
      },
    ],
    graphique: [
      {
        enonce: "Pourquoi la dérivée d'une fonction paire est-elle toujours impaire, et réciproquement ?",
        corrige:
          "Une fonction paire est symétrique par rapport à l'axe y : sa courbe à droite de 0 est le reflet exact de sa courbe à gauche. Or réfléchir une courbe par rapport à un axe vertical inverse le signe de sa pente en chaque point symétrique — une pente positive à droite correspond à une pente négative au point miroir à gauche. C'est exactement ce que signifie f'(−x) = −f'(x), soit une dérivée impaire.",
      },
      {
        enonce: "En observant seulement le graphique de f' (sans connaître f), comment repérer un extremum de f, et pourquoi cette méthode fonctionne-t-elle ?",
        corrige:
          "Un extremum de f correspond à une tangente horizontale, donc à un endroit où f' s'annule ET change de signe (passe de positif à négatif, ou l'inverse). C'est ce changement de signe, et non la seule annulation, qui garantit un vrai maximum ou minimum : si f' touche 0 sans changer de signe, ce n'est pas un extremum.",
      },
    ],
    equations: [
      {
        enonce: "Pourquoi l'équivalence aˣ=aʸ ⟺ x=y est-elle fausse pour a=1, alors qu'elle est vraie pour toute autre base strictement positive ?",
        corrige:
          "Pour a=1, 1ˣ=1 pour tout x : la fonction est constante, donc la même image (toujours 1) est atteinte par une infinité d'antécédents — ce n'est plus du tout injectif. L'exclusion a≠1 dans la définition d'une exponentielle n'est donc pas arbitraire : c'est exactement la condition qui rend cette équivalence vraie.",
      },
      {
        enonce: "Pourquoi faut-il systématiquement rejeter une racine t≤0 lorsqu'on résout une équation exponentielle par la substitution t=aˣ ?",
        corrige:
          "t=aˣ représente une quantité toujours strictement positive, quelle que soit la base a>0 et quel que soit x réel (une exponentielle ne s'annule et ne devient jamais négative). Une racine t≤0 trouvée dans l'équation auxiliaire du second degré ne correspond donc à aucun x réel : c'est une solution de l'équation en t, mais qui ne redonne jamais une vraie solution de l'équation de départ.",
      },
    ],
    inequations: [
      {
        enonce: "Pourquoi le sens d'une inéquation exponentielle doit-il être inversé quand la base est comprise entre 0 et 1, alors qu'il reste inchangé pour une base supérieure à 1 ?",
        corrige:
          "Comparer deux images par une fonction, c'est appliquer cette fonction aux deux membres d'une inégalité — et seul le sens de variation de la fonction compte. Pour a>1, l'exponentielle est strictement croissante, donc elle conserve l'ordre ; pour 0<a<1, elle est strictement décroissante, donc elle l'inverse. Ce n'est pas une règle propre aux exponentielles : c'est le même réflexe qu'avec n'importe quelle fonction strictement monotone.",
      },
      {
        enonce: "Deux exponentielles de bases différentes comparées à la même constante avec le même symbole ≥ peuvent-elles donner des ensembles-solutions complètement opposés ? Pourquoi ?",
        corrige:
          "Oui, et ce n'est pas contradictoire. Le symbole ≥ reste identique dans les deux énoncés, mais comme les deux fonctions varient en sens opposé (l'une croissante, l'autre décroissante), l'endroit où chacune dépasse effectivement la constante se trouve d'un côté différent — l'ensemble-solution part du côté où la fonction est réellement supérieure à la constante, qui change selon le sens de variation.",
      },
    ],
    etude: [
      {
        enonce: "Pourquoi ne faut-il jamais confondre un extremum (repéré par un changement de signe de f') avec un point d'inflexion (repéré par un changement de signe de f'') ?",
        corrige:
          "Les deux notions répondent à des questions différentes. Un extremum, c'est l'endroit où f passe de croissante à décroissante ou l'inverse — une question sur la variation. Un point d'inflexion, c'est l'endroit où la courbure change — f passe de concave à convexe ou l'inverse — sans que f cesse forcément de croître ou décroître. Confondre les deux conduit à annoncer un extremum qui n'existe pas, ou à manquer un vrai point d'inflexion.",
      },
      {
        enonce: "Une fonction peut-elle avoir ses deux limites, en −∞ et en +∞, qui valent toutes les deux +∞ ? Pourquoi est-il important de vérifier chaque côté séparément ?",
        corrige:
          "Oui, rien ne l'empêche : chaque limite se calcule de façon totalement indépendante, en étudiant le comportement de la fonction tout à gauche puis tout à droite, souvent pour des raisons complètement différentes de chaque côté. Supposer qu'un résultat « se devine » par symétrie, sans refaire le raisonnement complet des deux côtés, est une erreur classique.",
      },
    ],
    problemes: [
      {
        enonce: "Pourquoi faut-il calculer un rapport entre deux valeurs consécutives (et non une différence) pour vérifier qu'un tableau de données correspond à un modèle exponentiel ?",
        corrige:
          "Un modèle exponentiel Q(t)=Q₀·aᵗ est caractérisé par le fait que chaque pas de temps égal multiplie la quantité par un même facteur — donc c'est le rapport entre deux valeurs consécutives qui reste constant, pas leur différence. Une différence constante caractérise au contraire un modèle linéaire, où une quantité fixe s'ajoute à chaque pas. Confondre les deux conduit à choisir le mauvais modèle dès le diagnostic.",
      },
      {
        enonce: "Dans un modèle de saturation comme p(t)=1−e⁻ᵏᵗ, pourquoi la quantité s'approche-t-elle de son plafond sans jamais l'atteindre exactement ?",
        corrige:
          "Le terme e⁻ᵏᵗ ne s'annule jamais, quel que soit t — une exponentielle reste toujours strictement positive. Il se rapproche seulement de 0 d'aussi près que l'on veut à mesure que t grandit. Comme p(t)=1−e⁻ᵏᵗ, cela signifie que p(t) se rapproche de 1 sans jamais y arriver pile : le plafond est une asymptote, jamais une valeur atteinte.",
      },
    ],
  },
  'fonctions-logarithmes': {
    proprietes: [
      {
        enonce: "Pourquoi logₐ(x) n'existe-t-il que pour x>0, quelle que soit la base a ?",
        corrige:
          "logₐ(x) demande : à quelle puissance faut-il élever a pour obtenir x ? Or une puissance d'un nombre a>0 ne peut jamais valoir 0 ni un nombre négatif, quel que soit l'exposant essayé — positif, négatif ou nul, le résultat reste toujours strictement positif. Il n'existe donc aucune réponse à donner si x≤0 : ce n'est pas une restriction arbitraire, c'est une conséquence directe de la question posée.",
      },
      {
        enonce: "En quoi expₐ et logₐ sont-elles vraiment réciproques l'une de l'autre, et qu'est-ce que cela implique sur leurs deux graphiques ?",
        corrige:
          "Être réciproques signifie que chacune défait exactement ce que l'autre fait : logₐ répond à la question inverse de celle que pose expₐ. Concrètement, si (r;s) est un point du graphique de expₐ, alors (s;r) — les deux coordonnées échangées — est un point du graphique de logₐ. Cela se traduit géométriquement par une symétrie des deux courbes par rapport à la droite y=x, quelle que soit la base.",
      },
      {
        enonce: "Pourquoi toutes les fonctions logarithmes, quelle que soit leur base, sont-elles des multiples les unes des autres ?",
        corrige:
          "Le changement de base montre que logₐ(x) vaut toujours ln(x) multiplié par la constante 1/ln(a) — un résultat qui se généralise à deux bases quelconques, pas seulement avec e. Cette constante ne dépend pas de x : passer d'une base à une autre revient donc simplement à multiplier toutes les sorties par ce même nombre fixe, ce qui donne des courbes de même forme générale, seulement étirées verticalement les unes par rapport aux autres.",
      },
    ],
    equations: [
      {
        enonce: "Pourquoi faut-il, après avoir résolu une équation logarithmique, revérifier que la solution respecte la condition d'existence posée au départ ?",
        corrige:
          "Résoudre une équation logarithmique revient à « supprimer » les logarithmes en appliquant l'exponentielle de même base, une opération qui ne peut que redonner des valeurs compatibles avec la contrainte posée au moment où on l'applique. Mais le calcul algébrique qui suit (isoler l'inconnue dans une expression polynomiale, par exemple) peut faire apparaître des solutions qui ne respectent plus cette contrainte, parce qu'elle portait sur l'argument du logarithme, pas directement sur l'inconnue — le lien entre les deux peut se perdre en cours de résolution. La vérification finale rattache le résultat algébrique à la contrainte réelle du problème.",
      },
      {
        enonce: "Pourquoi, contrairement à la substitution t=eˣ, la substitution t=ln(x) ne demande-t-elle jamais de rejeter une racine t ?",
        corrige:
          "eˣ est contraint à rester strictement positif — une exponentielle ne peut jamais être négative ou nulle — donc une racine t≤0 trouvée dans l'équation auxiliaire doit être rejetée. ln(x), à l'inverse, peut prendre n'importe quelle valeur réelle : son image est ℝ tout entier. Toute valeur de t correspond donc bien à un x=eᵗ réel, lui-même toujours strictement positif. Les deux substitutions, miroirs l'une de l'autre, ont des contraintes opposées, exactement à cause de la réciprocité entre les deux fonctions.",
      },
    ],
    inequations: [
      {
        enonce: "Pourquoi la condition d'existence (le domaine) et l'ensemble-solution d'une inéquation logarithmique sont-ils deux choses différentes, qu'il ne faut jamais confondre ?",
        corrige:
          "Le domaine, c'est l'ensemble des valeurs où chaque logarithme de l'inéquation est défini — une condition purement technique, nécessaire avant même de poser la question. L'ensemble-solution, c'est l'ensemble des valeurs, parmi celles du domaine, où l'inégalité elle-même est vraie. Le domaine peut donc être strictement plus large que l'ensemble-solution. Déterminer le domaine en premier, puis résoudre l'inégalité à l'intérieur de ce domaine, est la seule façon de ne jamais mélanger les deux étapes.",
      },
      {
        enonce: "Comment expliquer que la même inégalité du second degré, obtenue à partir d'une même inéquation logarithmique mais écrite dans deux bases différentes, donne deux ensembles-solutions complètement différents ?",
        corrige:
          "Le sens dans lequel on peut « supprimer » les logarithmes dépend du sens de variation de la base : une base inférieure à 1 inverse le sens de l'inégalité, une base supérieure à 1 le conserve. On obtient donc, à partir de la même situation de départ, deux inégalités du second degré de sens opposés — ce qui ne donne évidemment pas la même partie du plan comme solution, même si c'est « la même » équation qui engendre les deux.",
      },
    ],
    derivee: [
      {
        enonce: "Pourquoi la formule (ln(x))'=1/x ne fait-elle apparaître aucune constante multiplicative, alors que (logₐ(x))' en fait apparaître une pour toute autre base ?",
        corrige:
          "La formule générale fait intervenir le facteur 1/ln(a), qui vaut exactement 1 lorsque ln(a)=1 — ce qui n'arrive que pour a=e, par définition même du logarithme népérien. C'est le miroir exact du résultat du chapitre précédent, où (aˣ)'=ln(a)·aˣ devient (eˣ)'=eˣ sans facteur : dans les deux cas, e est la seule base pour laquelle le facteur multiplicatif disparaît, parce que ln et exp sont construites comme réciproques l'une de l'autre.",
      },
      {
        enonce: "Pourquoi le domaine de x↦ln(u(x)) n'est-il jamais simplement le domaine de u, mais toujours restreint à la condition u(x)>0 ?",
        corrige:
          "ln elle-même n'est définie que sur les réels strictement positifs. Composer ln avec u ne peut donc fonctionner que là où la sortie de u tombe dans le domaine de ln, c'est-à-dire là où u(x)>0 — pas seulement là où u(x) est elle-même définie. Un x peut très bien appartenir au domaine de u sans appartenir à celui de ln(u(x)), si cette valeur de u(x) est négative ou nulle.",
      },
      {
        enonce: "Pourquoi la dérivation logarithmique simplifie-t-elle souvent le calcul pour un produit compliqué ou un exposant variable, plutôt que de le complexifier ?",
        corrige:
          "Le logarithme transforme un produit en somme et une puissance en produit simple — donc une expression faite de produits, quotients et puissances devient, une fois passée par ln, une simple somme de termes, chacun bien plus facile à dériver séparément. Revenir ensuite à f'=f·(ln f)' ne coûte qu'une multiplication finale : le gain vient de cette transformation d'une structure-produit en structure-somme, pas d'un tour de calcul magique.",
      },
    ],
    limites: [
      {
        enonce: "Pourquoi dit-on que logₐ(x) diverge vers +∞ « extrêmement lentement », plutôt que simplement « vers l'infini » comme n'importe quelle autre fonction qui diverge ?",
        corrige:
          "La croissance comparée montre que logₐ(x) est dominé par n'importe quelle puissance xᵏ avec k>0, même un exposant minuscule comme 0,01 : le rapport logₐ(x)/xᵏ tend vers 0. Même la plus modeste des fonctions puissances finit donc par laisser le logarithme loin derrière elle, bien qu'il continue effectivement à diverger : il grandit sans fin, mais à un rythme incomparablement plus lent que toute autre fonction usuelle qui diverge aussi.",
      },
      {
        enonce: "Pourquoi l'expression « limite de ln(x) quand x tend vers −∞ » n'a-t-elle absolument aucun sens — ni +∞, ni −∞, ni 0 ?",
        corrige:
          "Une limite décrit le comportement d'une fonction à l'approche d'une valeur — mais ln n'est tout simplement pas définie pour les réels négatifs : il n'y a donc aucune valeur de la fonction à observer à l'approche de −∞. Ce n'est pas une limite « qui n'existe pas » au sens habituel (comme une oscillation sans convergence), c'est une question posée hors du domaine même de la fonction.",
      },
      {
        enonce: "En quoi le classement exponentielle > puissance > logarithme révèle-t-il une hiérarchie plus profonde entre ces trois familles de fonctions, au-delà d'un simple ordre à retenir ?",
        corrige:
          "Ce classement montre que la vitesse de croissance d'une fonction ne dépend pas de sa valeur à un instant donné (qui peut favoriser n'importe laquelle au départ), mais de la nature même de sa construction : une exponentielle s'amplifie par un facteur multiplicatif qui agit sur toute la valeur déjà atteinte, une puissance s'amplifie par un exposant fixe appliqué à x, et un logarithme compresse x en quelque chose de bien plus petit. C'est cette différence structurelle, et non les valeurs de départ, qui détermine qui domine qui en fin de course, peu importe à quel point la base ou le degré semblaient, a priori, favoriser l'un des deux camps.",
      },
    ],
    parametres: [
      {
        enonce: "Pourquoi un point lu en x=1 sur le graphique de f(x)=a+b·ln(x) donne-t-il directement a, sans qu'aucune information sur b n'intervienne ?",
        corrige:
          "ln(1)=0 pour toute base, donc le terme b·ln(x) s'annule exactement en x=1, quelle que soit la valeur de b. Le point (1;a) est donc un point « aveugle » à b : c'est précisément parce que ln(1)=0 supprime toute trace du second paramètre que ce point isole a aussi proprement.",
      },
      {
        enonce: "Pourquoi un point lu en x=e révèle-t-il, contrairement à un point en x=1, à la fois a et b ?",
        corrige:
          "ln(e)=1, et non 0 : le terme b·ln(e) ne s'annule donc plus, et f(e)=a+b·1=a+b. Les deux paramètres contribuent à cette valeur, alors qu'en x=1 seul a apparaissait. Confondre les deux points conduit à l'erreur classique de croire que f(e) vaut a tout seul, au lieu de la somme des deux.",
      },
    ],
    hyperboliques: [
      {
        enonce: "Pourquoi l'identité ch²(x)−sh²(x)=1 porte-t-elle un signe moins, alors que son analogue trigonométrique cos²+sin²=1 porte un signe plus ?",
        corrige:
          "ch et sh sont construites directement à partir de eˣ et e⁻ˣ. En les élevant au carré puis en les combinant, les termes croisés (qui valent toujours 1, puisque eˣ·e⁻ˣ=1) se recombinent de façon à ce que ce soit la différence des carrés, et non leur somme, qui donne une constante. Le nom « hyperbolique » vient de là : le point (ch(x);sh(x)) parcourt une branche d'hyperbole, alors que (cos θ;sin θ) parcourt un cercle — même structure de nom, mais une géométrie différente derrière.",
      },
      {
        enonce: "Pourquoi ch et sh échangent-elles leurs rôles par dérivation (sh'=ch, ch'=sh), sans qu'aucune des deux ne redevienne jamais elle-même, contrairement à eˣ ?",
        corrige:
          "ch et sh sont chacune une combinaison de eˣ et e⁻ˣ, et dériver e⁻ˣ fait apparaître un signe moins supplémentaire. Ce signe moins suffit à transformer une somme en différence (et réciproquement) au passage à la dérivée : dériver ch échange son signe interne et redonne sh, et inversement — un cycle de période 2, alors que eˣ seule, qui n'a pas ce signe à gérer, revient directement sur elle-même dès la première dérivation.",
      },
    ],
    graphique: [
      {
        enonce: "Pourquoi est-il incorrect de déduire la concavité d'une fonction logarithmique directement à partir du signe de f', sans calculer f'' ?",
        corrige:
          "Le signe de f' renseigne uniquement sur le sens de variation — la concavité dépend de la façon dont f' elle-même évolue (si f' est croissante, f est convexe ; si f' est décroissante, f est concave), une information que seul f'' capture. Une fonction peut très bien être croissante tout en étant concave, sa croissance ralentissant sans cesse — exactement le cas de ln elle-même — donc le signe de f' seul ne dit rien sur la courbure.",
      },
      {
        enonce: "Pourquoi une asymptote verticale de f en x→0⁺ s'accompagne-t-elle typiquement d'une dérivée f' qui, elle aussi, diverge au voisinage de ce même point ?",
        corrige:
          "Si f plonge ou grimpe de plus en plus vite à mesure que x se rapproche de 0, c'est que la pente de sa courbe devient elle-même de plus en plus grande en valeur absolue au même endroit : une divergence verticale de la fonction et une pente qui s'accentue sans limite sont les deux faces d'une même réalité géométrique.",
      },
    ],
    etude: [
      {
        enonce: "Pour une fonction comme f(x)=ln(x)/x, pourquoi faut-il vérifier séparément la restriction imposée par le logarithme et celle imposée par le dénominateur, même si elles coïncident ici par chance ?",
        corrige:
          "Chaque opération impose sa propre condition d'existence, indépendamment des autres : le logarithme exige x>0, le dénominateur exige x≠0. Le domaine final est l'intersection de toutes ces conditions, et ici elles se recouvrent par chance (x>0 implique déjà x≠0) — mais ce n'est pas systématique : une autre fonction pourrait avoir des restrictions qui s'excluent sur des zones distinctes, et ne vérifier qu'une seule condition mènerait alors à un domaine faux.",
      },
      {
        enonce: "Pourquoi l'ordre domaine, puis limites et asymptotes, puis dérivée, puis concavité n'est-il pas arbitraire, mais correspond à un enchaînement logique ?",
        corrige:
          "Chaque étape s'appuie sur celle qui la précède : impossible de calculer une limite sans savoir d'abord où la fonction est définie, la dérivée ne peut se calculer que sur ce même domaine, et la concavité suppose déjà d'avoir obtenu la dérivée. Suivre cet ordre n'est pas une convention de présentation, c'est la seule séquence où chaque calcul dispose déjà de tout ce dont il a besoin.",
      },
    ],
    problemes: [
      {
        enonce: "Pourquoi les échelles logarithmiques (pH, magnitude de Richter, décibels) transforment-elles un facteur multiplicatif en un simple écart additif ?",
        corrige:
          "Une échelle logarithmique s'écrit L=a·log₁₀(X)+b, et la propriété qui transforme un produit en somme dit exactement que multiplier X par un facteur k ajoute à L une quantité fixe, qui ne dépend pas de la valeur de départ. C'est cette propriété qui permet de représenter des écarts physiques énormes — des facteurs de 10, de 1000, d'un million — par de petits nombres bien lisibles.",
      },
      {
        enonce: "Dans le modèle de croissance logistique, pourquoi le point d'inflexion se situe-t-il exactement à la moitié de la capacité limite, et pas ailleurs ?",
        corrige:
          "La courbe logistique est symétrique par rapport à son point d'inflexion : avant ce point, la croissance accélère, la population étant encore petite par rapport à la place disponible ; après ce point, elle ralentit, la capacité limite commençant à freiner la progression. Ce basculement entre accélération et ralentissement se produit nécessairement à mi-chemin entre le départ et le plafond — c'est-à-dire exactement à la moitié de ce plafond.",
      },
    ],
  },
  'primitives-integrales': {
    primitives: [
      {
        enonce:
          "Pourquoi une fonction qui admet une primitive sur un intervalle en admet-elle alors une infinité, et jamais exactement une seule ?",
        corrige:
          "Si F est une primitive de f, alors pour tout C∈ℝ, F+C en est aussi une : la dérivée de F+C vaut toujours F'=f, quelle que soit la constante ajoutée. Dès qu'une primitive existe, on peut donc en construire une infinité en faisant varier C — il ne peut jamais y en avoir exactement une seule.",
      },
      {
        enonce:
          "Pourquoi la primitive de 1/x s'écrit-elle ln|x| (avec une valeur absolue), alors que ce n'est jamais nécessaire pour la primitive de xⁿ ?",
        corrige:
          "1/x est définie aussi bien sur ]0;+∞[ que sur ]−∞;0[, deux domaines séparés par le point interdit x=0. Or ln(x) seul n'est défini que pour x>0 : il ne pourrait jamais servir de primitive sur la partie négative. La valeur absolue permet d'étendre la primitive aux deux domaines à la fois, un problème qui ne se pose pas pour la plupart des puissances xⁿ.",
      },
      {
        enonce:
          "Dans l'intégration par parties, pourquoi le choix de la partie à dériver (f) et de la partie à primitiver (g') change-t-il la difficulté du calcul, alors que la formule reste valable quel que soit ce choix ?",
        corrige:
          "La formule $\\int f \\cdot g' \\, dx = f \\cdot g - \\int f' \\cdot g \\, dx$ est une identité toujours vraie — mais elle ne fait qu'échanger le calcul de départ contre un autre, celui de $\\int f' \\cdot g$. Si f' est plus simple que f (par exemple x→1), la nouvelle intégrale devient plus simple ; si on dérive au contraire la partie qui se complique en dérivant, l'intégrale restante est pire qu'au départ, pas mieux.",
      },
    ],
    conditioninitiale: [
      {
        enonce:
          "Pourquoi une condition initiale F(x₀)=y₀ permet-elle d'isoler une primitive unique, alors que sans elle il en existe une infinité ?",
        corrige:
          "Les primitives d'une même fonction f sont des courbes empilées verticalement, toutes translatées les unes des autres par une constante C. Imposer que la courbe passe par le point précis (x₀;y₀) fixe exactement sa hauteur — donc une seule valeur de C — parmi toute cette famille de courbes parallèles.",
      },
      {
        enonce:
          "Pourquoi faut-il garder C symbolique dans la primitive générale avant d'utiliser la condition initiale, plutôt que de le fixer provisoirement à 0 ?",
        corrige:
          "Fixer C=0 reviendrait à choisir déjà, arbitrairement, une primitive particulière avant même de connaître la condition. L'équation F(x₀)+C=y₀ n'aurait alors plus de sens : C serait déjà « utilisé », et on ne pourrait plus résoudre pour trouver la vraie valeur de C qui fait réellement passer la courbe par (x₀;y₀).",
      },
    ],
    integralesdefinies: [
      {
        enonce:
          "Pourquoi le résultat de $\\int_a^b f(x)dx$ ne dépend-il jamais du choix de la primitive F utilisée pour le calculer ?",
        corrige:
          "Deux primitives quelconques de f ne différent que d'une constante C. En calculant G(b)-G(a) avec G=F+C au lieu de F(b)-F(a), le C s'ajoute aux deux termes puis s'annule exactement par la soustraction. Le choix de primitive n'a donc jamais d'incidence sur le nombre final obtenu.",
      },
      {
        enonce:
          "Pourquoi une intégrale définie peut-elle être négative, alors qu'une aire géométrique ne l'est jamais ?",
        corrige:
          "L'intégrale définie est une somme SIGNÉE : son signe suit celui de f sur l'intervalle, elle mesure une accumulation orientée, pas une grandeur physique. Une aire, elle, est toujours positive ou nulle par construction géométrique. Les deux ne coïncident que lorsque f garde un signe constant sur tout l'intervalle.",
      },
      {
        enonce:
          "Pourquoi la méthode des trapèzes surestime-t-elle systématiquement $\\int_0^4 x^2 dx$, et qu'est-ce qui changerait sur une courbe de concavité opposée ?",
        corrige:
          "Chaque trapèze relie deux points de la courbe par une corde. Sur une fonction convexe (comme x², dont la concavité est tournée vers le haut), toute corde passe AU-DESSUS de la courbe, donc l'aire de chaque trapèze surestime l'aire réelle. Sur une courbe concave (tournée vers le bas), la corde passerait en dessous de la courbe, et l'approximation sous-estimerait au contraire la valeur exacte.",
      },
    ],
    aires: [
      {
        enonce:
          "Pourquoi calculer directement $\\int_a^b f(x)dx$ sur tout l'intervalle donne-t-il une valeur trop petite dès que f change de signe, plutôt que la vraie aire ?",
        corrige:
          "Les parties où f est négative contribuent NÉGATIVEMENT à l'intégrale globale : elles se soustraient des parties positives au lieu de s'additionner en valeur absolue, comme l'exige une aire géométrique. Découper aux racines puis sommer la valeur absolue de chaque intégrale partielle est nécessaire pour retrouver la vraie aire, jamais une seule intégrale sur tout l'intervalle.",
      },
      {
        enonce:
          "Pour une région bordée par plus de deux courbes, pourquoi ne suffit-il pas de découper seulement aux racines de f, comme pour une aire signée classique ?",
        corrige:
          "Il faut repérer en plus les points où la courbe « majorante » change — là où deux des courbes bordantes se croisent — même si aucune des deux ne s'annule à cet endroit. Sans ce découpage supplémentaire, on utiliserait la mauvaise différence (f−g au lieu de g−f, ou l'inverse) sur une partie de l'intervalle, et le résultat serait faux.",
      },
    ],
    volumes: [
      {
        enonce:
          "Pourquoi la formule du volume par rondelles soustrait-elle les CARRÉS des deux rayons ($[f(x)]^2-[g(x)]^2$), et jamais le carré de leur différence ?",
        corrige:
          "Le volume de la rondelle est le volume du disque extérieur moins celui du disque intérieur creusé par g : chaque disque a pour aire π×(rayon)², donc on soustrait les deux aires πf² et πg². Un disque de rayon f−g, lui, ne correspond à aucune figure réelle de ce solide — élever la différence des rayons au carré n'a pas de sens géométrique ici.",
      },
      {
        enonce:
          "En quoi la formule $V=\\pi\\int_a^b [f(x)]^2 dx$ n'est-elle qu'un cas particulier du principe général $V=\\int_a^b S(t)dt$ ?",
        corrige:
          "Le principe général dit que le volume est la somme des aires de toutes les tranches fines qui composent le solide. Pour un solide de révolution, chaque tranche est précisément un disque, dont l'aire de section vaut $\\pi \\times (\\text{rayon})^2 = \\pi[f(x)]^2$ — appliquer le principe général à cette forme de tranche donne directement la formule des disques, qui n'est donc pas une règle indépendante.",
      },
    ],
    longueurarc: [
      {
        enonce:
          "Pourquoi la formule de longueur d'arc contient-elle toujours un « 1+ » sous la racine, même aux endroits où f'(x) est très petit ou nul ?",
        corrige:
          "Le « 1 » provient de dx lui-même, le côté horizontal du petit triangle rectangle utilisé pour approcher la courbe ; $[f'(x)]^2$ provient de dy, le côté vertical. Même si la courbe est localement horizontale (f'(x)=0 à cet endroit), il reste toujours au moins la longueur dx parcourue horizontalement — ce que le « 1 » garantit systématiquement.",
      },
      {
        enonce:
          "Pourquoi est-il utile de repérer si $1+[f'(x)]^2$ forme un carré parfait avant d'intégrer, plutôt que d'intégrer directement la racine telle quelle ?",
        corrige:
          "Quand l'expression sous la racine se simplifie en un carré parfait (comme pour ch(x), où $1+\\text{sh}^2(x)=\\text{ch}^2(x)$), la racine disparaît immédiatement et l'intégrale redevient simple à calculer. Sans cette vérification préalable, on risque de se lancer dans une intégrale sous une racine bien plus compliquée qu'elle ne devrait l'être.",
      },
    ],
    problemes: [
      {
        enonce:
          "Pourquoi faut-il utiliser une constante distincte à chaque étape d'intégration (accélération → vitesse, puis vitesse → position), plutôt qu'une seule constante commune aux deux ?",
        corrige:
          "Chaque primitive — v à partir de a, puis x à partir de v — est déterminée par sa PROPRE condition initiale, indépendante de l'autre (v(t₀) d'un côté, x(t₀) de l'autre). Réutiliser la même constante imposerait artificiellement un lien entre deux informations qui, en général, n'ont rien à voir l'une avec l'autre.",
      },
      {
        enonce:
          "En quoi un problème contextualisé (cinématique, économie...) diffère-t-il réellement, mathématiquement, d'un exercice « abstrait » de primitivation ou d'intégration ?",
        corrige:
          "Les techniques utilisées sont exactement les mêmes — calcul de primitive, condition initiale, théorème fondamental... Seule l'interprétation du résultat final change (une distance, un coût, un volume), jamais la méthode de calcul elle-même : identifier la bonne technique reste toujours la première étape, quel que soit l'habillage du problème.",
      },
    ],
  },
  'nombres-complexes': {
    operationsbase: [
      {
        enonce:
          "Pourquoi $i^2=1$ serait-il absurde, au vu de la raison même pour laquelle $i$ a été introduit ?",
        corrige:
          "$i$ a été inventé précisément pour donner un sens à une racine carrée d'un nombre négatif, c'est-à-dire pour qu'il existe un nombre dont le carré soit négatif. Si $i^2$ valait 1, $i$ ne serait qu'une autre façon d'écrire 1 ou −1 (les racines carrées réelles de 1), et n'apporterait rien de nouveau — $i$ perdrait entièrement sa raison d'être.",
      },
      {
        enonce:
          "Pourquoi n'existe-t-il aucune relation d'ordre ($<$, $>$) cohérente entre deux nombres complexes quelconques, alors que ℝ en possède une ?",
        corrige:
          "ℂ contient ℝ comme sous-ensemble, mais y ajoute une direction supplémentaire — la partie imaginaire — sans équivalent « plus grand / plus petit » naturel. Comparer $i$ et 0, par exemple, n'a aucun sens compatible avec les opérations de ℂ, contrairement aux réels, où chaque nombre occupe une position bien définie sur une même droite.",
      },
      {
        enonce:
          "Pourquoi le conjugué de z n'est-il jamais la même chose que son opposé, malgré une apparente symétrie entre les deux notions ?",
        corrige:
          "Le conjugué ($a-bi$) ne change que le signe de la partie IMAGINAIRE, en laissant la partie réelle intacte ; l'opposé ($-a-bi$) change les DEUX signes à la fois. Les deux ne coïncident que dans le cas particulier où $a=0$, c'est-à-dire pour un nombre imaginaire pur.",
      },
    ],
    affixesracines: [
      {
        enonce:
          "Pourquoi la distance AB entre deux points d'affixes zA et zB s'obtient-elle avec $|z_B-z_A|$, et jamais avec $|z_A+z_B|$ ?",
        corrige:
          "Le vecteur reliant A à B a pour affixe la différence $z_B-z_A$ (même principe qu'avec des coordonnées cartésiennes), et la distance AB est la longueur de ce vecteur, donc le module de cette différence. $|z_A+z_B|$ correspondrait à la longueur d'un tout autre vecteur, sans aucun lien avec le segment [AB].",
      },
      {
        enonce:
          "Pourquoi un nombre complexe non nul a-t-il toujours exactement deux racines carrées, jamais une seule ni trois ?",
        corrige:
          "Si $z_0$ est une racine carrée de z (c'est-à-dire $z_0^2=z$), alors $(-z_0)^2=z_0^2=z$ aussi : $-z_0$ est automatiquement une racine carrée elle aussi, distincte de $z_0$ dès que $z\\ne0$. Le système à résoudre fixe par ailleurs $x^2$ et $y^2$ de façon unique, ce qui ne peut jamais produire plus de ces deux couples (x,y) opposés.",
      },
      {
        enonce:
          "Pourquoi la 3e équation du système de la racine carrée doit-elle s'écrire $x^2+y^2=\\sqrt{a^2+b^2}$ (avec la racine), et non $x^2+y^2=a^2+b^2$ ?",
        corrige:
          "Élever les deux premières équations au carré puis les additionner donne directement $(x^2+y^2)^2=a^2+b^2$ — c'est le CARRÉ de $x^2+y^2$ qui vaut $a^2+b^2$, pas $x^2+y^2$ lui-même. Il faut donc repasser par une racine carrée (réelle, car $x^2+y^2\\ge0$) pour isoler la bonne quantité.",
      },
    ],
    equationscomplexes: [
      {
        enonce:
          "Pourquoi une équation du second degré à coefficients réels et à discriminant négatif a-t-elle exactement deux solutions complexes, toujours conjuguées l'une de l'autre ?",
        corrige:
          "La mise sous forme canonique aboutit à une égalité du type $(z+b/2a)^2=\\Delta/4a^2$ avec $\\Delta<0$. En écrivant $\\Delta=i^2|\\Delta|$, le membre de droite devient un carré complexe parfait, dont les deux racines carrées sont opposées — ce qui donne deux solutions partageant la même partie réelle mais des parties imaginaires opposées, donc conjuguées.",
      },
      {
        enonce:
          "Pourquoi le changement de variable $u=z^2$ (et non $u=z$) permet-il de résoudre une équation bicarrée, et pourquoi une valeur négative de u n'est-elle jamais à rejeter dans ℂ ?",
        corrige:
          "Poser $u=z$ laisserait l'équation de degré 4 en u, sans aucune simplification ; poser $u=z^2$ la transforme en une équation du second degré, bien plus simple. Une fois u trouvé — même négatif — ses racines carrées existent toujours dans ℂ, rien à rejeter, contrairement à ℝ où la racine carrée d'un négatif n'existerait pas.",
      },
      {
        enonce:
          "Pourquoi la propriété « le conjugué d'une racine est aussi une racine » ne s'applique-t-elle jamais à un polynôme dont un coefficient est un complexe vraiment non réel ?",
        corrige:
          "La propriété découle du fait que conjuguer toute l'égalité polynomiale revient à conjuguer seulement la variable, puisque les coefficients RÉELS sont égaux à leur propre conjugué. Si un coefficient est vraiment complexe, cette étape échoue : rien ne garantit alors que le conjugué d'une racine soit aussi une racine.",
      },
    ],
    formetrigonometrique: [
      {
        enonce:
          "Pourquoi le module r dans $z=r(\\cos\\theta+i\\sin\\theta)$ est-il toujours positif ou nul, alors que l'argument θ peut prendre n'importe quelle valeur ?",
        corrige:
          "r=|z| est défini comme une distance à l'origine, et une distance n'est jamais négative. C'est l'angle θ, et lui seul, qui code dans quel quadrant se trouve le point — jamais besoin d'un r négatif pour représenter une position.",
      },
      {
        enonce:
          "Pourquoi multiplier deux nombres complexes MULTIPLIE leurs modules mais ADDITIONNE leurs arguments, plutôt que l'inverse ?",
        corrige:
          "En développant le produit de deux formes trigonométriques, le module global sort naturellement en facteur multiplicatif ($r_1r_2$) devant l'expression trigonométrique obtenue, tandis que les formules d'addition de cosinus/sinus font apparaître la SOMME des deux angles à l'intérieur du cosinus et du sinus — deux rôles mathématiquement différents dans le développement, pas un choix arbitraire.",
      },
      {
        enonce:
          "Pourquoi le conjugué d'un nombre complexe a-t-il le même module que lui, mais un argument opposé ?",
        corrige:
          "$\\bar{z}$ correspond à une réflexion du point par rapport à l'axe réel : la distance à l'origine (le module) ne change pas, mais la réflexion inverse le sens de rotation, donc l'angle mesuré change de signe — exactement ce que confirme $\\cos(-\\theta)=\\cos\\theta$ et $\\sin(-\\theta)=-\\sin\\theta$.",
      },
    ],
    formulemoivre: [
      {
        enonce:
          "Pourquoi la formule de Moivre découle-t-elle directement de la formule d'Euler, sans qu'une démonstration par récurrence soit strictement nécessaire ?",
        corrige:
          "La formule d'Euler identifie $\\cos\\theta+i\\sin\\theta$ à $e^{i\\theta}$ ; élever cette égalité à la puissance n donne $e^{in\\theta}$ par une propriété usuelle des puissances (les exposants s'additionnent n fois), qu'on retraduit ensuite en forme trigonométrique via Euler appliquée à l'angle nθ. Toute la démonstration n'utilise alors que des propriétés déjà connues des puissances.",
      },
      {
        enonce:
          "En développant $(\\cos x+i\\sin x)^n$ par le binôme de Newton, pourquoi les termes à k PAIR donnent-ils systématiquement du cos(nx), et ceux à k IMPAIR du sin(nx) ?",
        corrige:
          "Chaque terme du développement contient un facteur $i^k$ ; par le cycle de période 4, $i^k$ est réel (±1) quand k est pair, et imaginaire pur (±i) quand k est impair. Comme $\\cos(nx)+i\\sin(nx)$ sépare déjà le résultat final en partie réelle et partie imaginaire, les termes réels (k pair) ne peuvent contribuer qu'à la partie cos(nx), et les termes imaginaires (k impair) qu'à la partie i·sin(nx).",
      },
    ],
    racinesniemes: [
      {
        enonce:
          "Pourquoi toutes les racines n-ièmes d'un même nombre complexe ont-elles le même module, et seulement des arguments différents ?",
        corrige:
          "La formule $z_k=r^{1/n}e^{i(\\theta+2k\\pi)/n}$ montre que le module $r^{1/n}$ ne dépend pas de k — seul le terme $(\\theta+2k\\pi)/n$, qui pilote l'argument, change avec k. Géométriquement, cela place toutes les racines sur un même cercle, régulièrement espacées.",
      },
      {
        enonce:
          "Pourquoi la somme des n racines n-ièmes de l'unité vaut-elle toujours 0, et pourquoi cette identité exige-t-elle $n\\ge2$ ?",
        corrige:
          "Géométriquement, l'isobarycentre de points régulièrement répartis sur un cercle est le centre de ce cercle, c'est-à-dire l'origine — leur somme, qui vaut n fois cet isobarycentre, est donc nulle. Pour n=1, il n'y a qu'une seule racine (1 elle-même), dont la somme vaut 1 et non 0 : la symétrie circulaire qui produit l'annulation suppose au moins deux points distincts sur le cercle.",
      },
      {
        enonce:
          "Pourquoi $i$ et $-i$ sont-ils des racines quatrièmes de l'unité, mais jamais des racines cubiques ?",
        corrige:
          "$i^4=1$ (cycle de période 4), donc i est bien une racine quatrième de 1 ; mais $i^3=-i\\ne1$, donc i n'est pas une racine cubique. Chaque racine n-ième de l'unité est spécifique à son exposant n — rien ne garantit qu'une racine valable pour un n donné le soit aussi pour un autre.",
      },
    ],
    transformationsplan: [
      {
        enonce:
          "Pourquoi multiplier par un nombre complexe de module 1 correspond-il géométriquement à une rotation, et jamais à un agrandissement ou une réduction ?",
        corrige:
          "Multiplier deux complexes multiplie leurs modules et additionne leurs arguments. Multiplier par un facteur de module exactement 1 laisse donc le module du nombre multiplié totalement inchangé (×1) : seul son argument est modifié par addition — exactement l'effet d'une rotation, qui conserve les distances au centre.",
      },
      {
        enonce:
          "Dans la formule de rotation $z'=e^{i\\theta}(z-z_0)+z_0$, pourquoi faut-il absolument utiliser $(z-z_0)$ et jamais $(z_0-z)$ ?",
        corrige:
          "$(z-z_0)$ est l'affixe du vecteur allant du centre Ω vers le point M — c'est ce vecteur précis qu'il faut faire tourner avant de le replacer depuis Ω. Utiliser $(z_0-z)$, le vecteur opposé, ajouterait en réalité π à l'angle de rotation effectivement appliqué, donnant un résultat différent de celui voulu.",
      },
      {
        enonce:
          "Pourquoi le centre d'une transformation $z'=az+b$ (avec $a\\ne1$) est-il l'unique point fixe de cette transformation, et que se passe-t-il quand $a=1$ ?",
        corrige:
          "Le centre est par définition le seul point que la transformation envoie sur lui-même : il doit donc vérifier $z_0=az_0+b$, équation résoluble en $z_0=b/(1-a)$ puisque $a\\ne1$. Si $a=1$, cette équation devient $0=b$ : une translation non nulle n'a alors jamais de point fixe, ce qui correspond bien à l'intuition géométrique d'un glissement sans centre.",
      },
    ],
    trianglescomplexes: [
      {
        enonce:
          "Pourquoi un rapport d'affixes RÉEL signale-t-il un alignement ou une colinéarité, tandis qu'un rapport IMAGINAIRE PUR signale une orthogonalité ?",
        corrige:
          "Un rapport réel entre deux affixes de vecteurs correspond à un argument de 0 ou π entre eux : ils pointent dans la même direction ou la direction opposée, donc ils sont parallèles. Un rapport imaginaire pur correspond à un argument de ±π/2 : les deux vecteurs sont alors perpendiculaires.",
      },
      {
        enonce:
          "Pourquoi la condition d'isocèle en A s'écrit-elle avec l'égalité des MODULES $|z_B-z_A|=|z_C-z_A|$, plutôt que l'égalité directe des complexes $z_B-z_A=z_C-z_A$ ?",
        corrige:
          "L'égalité directe des complexes forcerait $z_B=z_C$, c'est-à-dire que B et C seraient le même point — ce qui n'a rien à voir avec un triangle isocèle. Seules les LONGUEURS (les modules) doivent être égales, pas les vecteurs eux-mêmes, qui peuvent avoir des directions complètement différentes.",
      },
    ],
    problemesavances: [
      {
        enonce:
          "Pourquoi la condition pour que $z^n$ soit réel (mod π) est-elle moins restrictive que celle pour que $z^n$ soit réel POSITIF (mod 2π) ?",
        corrige:
          "Un nombre réel peut être positif OU négatif, ce qui correspond respectivement à un argument multiple de 2π ou égal à π modulo 2π — deux cas regroupés en une seule condition modulo π, deux fois plus large. Exiger « réel positif » élimine le cas négatif et resserre donc la condition à modulo 2π seulement.",
      },
      {
        enonce:
          "Pourquoi la condition $arg(z-a)\\equiv\\theta_0 \\pmod{2\\pi}$ décrit-elle seulement une demi-droite, alors que la même condition mod π décrit une droite complète ?",
        corrige:
          "Modulo 2π ne retient qu'une seule direction précise, un seul des deux rayons opposés partant de A. Modulo π regroupe cette direction ET son opposée — $\\theta_0$ et $\\theta_0+\\pi$ désignent le même résidu modulo π — ce qui réunit les deux demi-droites en une droite entière.",
      },
      {
        enonce:
          "Pourquoi la transformation $z'=(z-a)/(1-\\bar{a}z)$ envoie-t-elle le cercle unité sur lui-même, et pas sur un cercle différent ?",
        corrige:
          "Pour tout point z du cercle unité ($|z|=1$), on peut montrer que $|1-\\bar{a}z|$ est exactement égal à $|z-a|$. Le dénominateur du module de z' est donc toujours identique à son numérateur, ce qui donne systématiquement $|z'|=1$, quel que soit le point de départ choisi sur le cercle.",
      },
    ],
  },
  'probabilites': {
    probabilitesensembles: [
      {
        enonce: "Pourquoi la formule « nombre de cas favorables / nombre de cas possibles » exige-t-elle de vérifier d'abord que les résultats sont équiprobables ?",
        corrige:
          "Cette formule compte des cas, pas des probabilités : elle ne donne la bonne proportion que si chaque résultat possible a exactement la même chance de se produire. Au lancer de 2 dés, $\\Omega=\\{2,3,\\ldots,12\\}$ compte 11 sommes possibles, mais elles ne sont pas équiprobables — un total de 2 ne s'obtient que par (1;1), un total de 9 par 4 couples différents. Appliquer « favorables/possibles » sans vérifier donnerait 1/11 dans les deux cas, alors que $P$(total=9) est en réalité bien plus grande que $P$(total=2).",
      },
      {
        enonce: "Deux événements incompatibles (qui ne peuvent jamais se produire ensemble) sont-ils automatiquement indépendants ? Justifie.",
        corrige:
          "Non — ce sont deux notions totalement distinctes. Si $A$ et $B$ sont incompatibles, $P(A\\cap B)=0$ ; mais s'ils ont chacun une probabilité non nulle, $P(A)\\times P(B)>0$. L'égalité $P(A\\cap B)=P(A)\\times P(B)$, qui définit l'indépendance, échoue donc toujours dans ce cas : deux événements incompatibles de probabilités non nulles ne sont jamais indépendants.",
      },
    ],
    tiragesarbres: [
      {
        enonce: "Pourquoi le fait de tirer avec ou sans remise change-t-il la probabilité du second tirage, alors que la formule du premier tirage reste identique dans les deux cas ?",
        corrige:
          "Avec remise, l'urne retrouve sa composition initiale avant le second tirage : les deux tirages sont indépendants, la probabilité ne change jamais d'un tirage à l'autre. Sans remise, la boule tirée en premier disparaît réellement de l'urne : le nombre total de boules ET la composition changent, donc la probabilité au second tirage se lit sur une urne différente. C'est pourquoi, dans une urne à 5 rouges et 3 bleues, $P$(rouge au 2e tirage sachant rouge au 1er) vaut $4/7$ sans remise, mais resterait $5/8$ avec remise.",
      },
      {
        enonce: "Pourquoi calcule-t-on la probabilité d'un chemin de l'arbre par un produit, mais celle d'un événement (plusieurs chemins) par une somme ?",
        corrige:
          "Un chemin décrit une succession d'étapes qui doivent TOUTES se produire l'une après l'autre : c'est un « et », qui se traduit par une multiplication des probabilités des branches traversées. Un événement, lui, est souvent réalisé par plusieurs chemins distincts et incompatibles entre eux (un seul se produit à la fois) : c'est un « ou » entre cas qui ne se recouvrent jamais, qui se traduit par une addition. C'est pourquoi « exactement une rouge » s'obtient en additionnant $P(RB)$ et $P(BR)$, deux chemins chacun calculés par un produit.",
      },
    ],
    independancebayes: [
      {
        enonce: "Pourquoi le théorème de Bayes est-il nécessaire dès qu'on connaît $P(B|A)$ mais qu'on cherche $P(A|B)$, plutôt que d'utiliser directement $P(B|A)$ comme approximation ?",
        corrige:
          "$P(A|B)$ et $P(B|A)$ sont deux probabilités conditionnelles différentes, calculées avec des dénominateurs différents — rien ne garantit qu'elles soient proches. Dans l'exemple du test médical, $P(T^+|malade)=0,9$ (un test fiable) alors que $P(malade|T^+)=1/3$ seulement : la rareté de la maladie ($P(malade)=0,1$) fait qu'un résultat positif reste le plus souvent un faux positif. Bayes est le seul moyen de « retourner » rigoureusement le conditionnement, en passant par $P(A\\cap B)$ commun aux deux écritures.",
      },
      {
        enonce: "Pourquoi une partition de l'univers doit-elle couvrir $\\Omega$ tout entier pour que la loi des probabilités totales s'applique correctement ?",
        corrige:
          "La loi des probabilités totales reconstitue $P(A)$ en additionnant la part de $A$ dans chaque morceau de la partition — si un morceau de l'univers est oublié, la part de $A$ qui s'y trouve n'est comptée nulle part, et la somme obtenue est trop petite, sans aucun signal d'erreur visible (le résultat reste un nombre parfaitement plausible entre 0 et 1). C'est pourquoi la définition exige les deux conditions à la fois : les morceaux doivent être deux à deux incompatibles ET leur union doit recouvrir tout $\\Omega$, pas seulement avoir une probabilité non nulle chacun.",
      },
    ],
    probabilitesproblemes: [
      {
        enonce: "Pourquoi ne peut-on pas calculer $P(X=k)$ en multipliant simplement $p^k(1-p)^{n-k}$, sans rien d'autre ?",
        corrige:
          "$p^k(1-p)^{n-k}$ n'est que la probabilité d'UN seul chemin de l'arbre, celui où les $k$ succès occupent des positions précises. Comme toutes les positions possibles des $k$ succès parmi les $n$ épreuves ont cette même probabilité, il faut les compter toutes et multiplier par ce nombre pour obtenir la probabilité de l'événement « exactement $k$ succès ». Avec $n=5$, $p=0,3$, $k=2$, oublier les 10 positions possibles et n'en garder qu'une donne $0,03087$ au lieu de $0,3087$ — un résultat 10 fois trop petit.",
      },
      {
        enonce: "Pourquoi $P$(au moins un succès) se calcule-t-il toujours par le complémentaire, et jamais en additionnant les probabilités de chaque tir ?",
        corrige:
          "Additionner les probabilités de succès de chaque tir ($n\\times p$) compte en réalité plusieurs fois les cas où plusieurs succès se produisent à la fois, et peut même dépasser 1 — une probabilité ne peut jamais dépasser 1, donc cette méthode est nécessairement fausse. Le complémentaire évite ce problème : « au moins un succès » et « aucun succès » sont deux événements contraires qui se partagent exactement toute la probabilité, donc $P(\\text{au moins 1})=1-P(X=0)=1-(1-p)^n$, une formule valable pour toute valeur de $p$ entre 0 et 1.",
      },
    ],
  },
  'analyse-combinatoire': {
    denombrementfondamental: [
      {
        enonce: "Qu'est-ce qui distingue un arrangement d'une combinaison ? Quelle question faut-il toujours se poser en premier ?",
        corrige:
          "La question à se poser est : permuter les éléments choisis change-t-il le résultat ? Si oui (un podium, un mot de passe), c'est un arrangement $A_n^k$ : l'ordre fait partie du résultat. Si non (un comité, une main de cartes), c'est une combinaison $C_n^k$ : seul l'ensemble choisi compte, peu importe l'ordre dans lequel on l'a composé. « Choisir 3 parmi 8 » peut ainsi donner 336 résultats différents (arrangement) ou seulement 56 (combinaison), selon cette seule question.",
      },
      {
        enonce: "Pourquoi $C_n^k$ s'obtient-il en divisant $A_n^k$ par $k!$, et pas par un autre nombre ?",
        corrige:
          "Choisir $k$ éléments puis les ordonner revient exactement à les arranger directement : chaque groupe non ordonné de $k$ éléments se décline en $k!$ ordres différents, tous comptés séparément par $A_n^k$. Diviser par $k!$ retire précisément ces réordonnancements internes d'un même groupe, qui ne produisent plus de résultat distinct une fois l'ordre ignoré — d'où $C_n^k=A_n^k/k!$, une division et non une soustraction.",
      },
    ],
    denombrementcombine: [
      {
        enonce: "Pourquoi un « ET » entre deux choix indépendants se traduit-il par une multiplication, et un « OU » exclusif par une addition ?",
        corrige:
          "Un « ET » signifie que les deux choix doivent se réaliser ensemble, en se combinant librement l'un avec l'autre : chaque option du premier choix rencontre chaque option du second, exactement le principe multiplicatif — 2 personnes parmi 8 hommes ET 2 parmi 6 femmes donne $C_8^2 \\times C_6^2$. Un « OU » exclusif signifie au contraire que les deux cas ne se recouvrent jamais (jamais un mélange) : ils forment deux groupes disjoints de possibilités qui s'ajoutent simplement l'une à l'autre, sans qu'aucune possibilité ne soit comptée dans les deux à la fois.",
      },
      {
        enonce: "Dans une répartition multinomiale, pourquoi chaque étape doit-elle puiser dans le nombre de personnes RESTANTES, et jamais répéter le total de départ ?",
        corrige:
          "Si chaque étape choisissait à nouveau parmi les $n$ personnes d'origine, une même personne pourrait être comptée dans plusieurs groupes différents à la fois — ce qui n'a aucun sens pour une répartition où chacun appartient à un seul groupe. En puisant dans le nombre restant après les choix précédents ($C_n^{n_1}\\times C_{n-n_1}^{n_2}\\times\\ldots$), chaque personne n'est affectée qu'une seule fois. Avec 10 personnes en groupes de 5, 3 et 2, $C_{10}^5\\times C_{10}^3\\times C_{10}^2$ compterait ainsi beaucoup trop de répartitions, contrairement à $C_{10}^5\\times C_5^3\\times C_2^2=2520$.",
      },
    ],
    binomenewton: [
      {
        enonce: "Pourquoi $(a-b)^n \\neq a^n - b^n$ en général ?",
        corrige:
          "Élever une somme ou une différence à la puissance $n$ ne se distribue jamais terme à terme sur chaque élément pris isolément — il faut développer le produit complet des $n$ facteurs $(a+b)$, ce qui fait apparaître TOUS les produits croisés $a^{n-k}b^k$, pas seulement les deux termes extrêmes $a^n$ et $b^n$. Le binôme de Newton donne la somme exacte de ces $n+1$ termes ; en isoler seulement deux revient à ignorer tous les termes intermédiaires, qui ne sont nuls que dans des cas très particuliers.",
      },
      {
        enonce: "Pourquoi la somme de tous les coefficients d'une ligne du triangle de Pascal vaut-elle toujours $2^n$ ?",
        corrige:
          "En posant $a=b=1$ dans la formule du binôme, chaque terme $C_n^k\\times a^{n-k}\\times b^k$ devient simplement $C_n^k$ (puisque 1 à toute puissance vaut 1), donc $(1+1)^n=\\sum_{k=0}^n C_n^k$. Le membre de gauche vaut $2^n$, ce qui montre que la somme des coefficients d'une ligne — c'est-à-dire des nombres du triangle de Pascal — est exactement $2^n$, sans qu'il s'agisse d'une coïncidence numérique observée sur le triangle.",
      },
    ],
    denombrementproblemes: [
      {
        enonce: "Pourquoi, parmi les mains de poker, une catégorie qui impose plus de contraintes précises (comme un carré) contient-elle toujours moins de mains qu'une catégorie moins contrainte (comme une paire) ?",
        corrige:
          "Chaque contrainte supplémentaire (fixer 4 cartes de même hauteur pour un carré, par exemple) réduit la liberté laissée pour composer le reste de la main : moins de cartes restent à choisir librement, donc moins de mains différentes peuvent en résulter. C'est pourquoi 224 mains « carré » (très contraintes) sont bien moins nombreuses que les 107 520 mains « paire » (contrainte plus légère) — le nombre de mains total $C_{32}^5=201\\,376$ reste la seule limite commune aux deux.",
      },
      {
        enonce: "Pourquoi le paradoxe du Chevalier de Méré se résout-il en comptant les triplets ORDONNÉS plutôt que les partitions non ordonnées de chaque somme ?",
        corrige:
          "Les 6 partitions de la somme 9 et les 6 partitions de la somme 10 donnent une fausse impression d'égalité, car elles ne représentent pas le même nombre de façons RÉELLES d'obtenir chaque somme avec 3 dés distincts : une partition aux 3 valeurs différentes correspond à $3!=6$ lancers ordonnés possibles, une partition avec une paire de valeurs identiques n'en correspond qu'à 3, et une partition aux 3 valeurs identiques qu'à 1 seul. En comptant ces arrangements ordonnés, la somme 9 totalise 25 triplets contre 27 pour la somme 10 — un écart invisible tant qu'on ne compte que les partitions.",
      },
    ],
    probabilitehypergeometrique: [
      {
        enonce: "Pourquoi le dénominateur de la formule hypergéométrique est-il toujours $C_N^n$, et jamais $C_N^k$ ?",
        corrige:
          "Le dénominateur d'une probabilité doit toujours représenter le nombre TOTAL de résultats possibles de l'expérience — ici, tous les tirages possibles de $n$ éléments parmi les $N$ de la population, quelle que soit leur composition en succès/échecs. $C_N^k$ ne compterait qu'une sous-partie arbitraire liée à $k$, sans rapport avec le nombre réel de tirages de taille $n$ : c'est précisément pourquoi remplacer $C_N^n$ par $C_N^k$ au dénominateur est le piège le plus fréquent de cette formule.",
      },
      {
        enonce: "Quelle différence y a-t-il entre la probabilité d'une séquence précise et celle de la composition correspondante, dans un tirage sans remise ?",
        corrige:
          "Une séquence précise fixe l'ORDRE exact d'apparition (par exemple rouge puis rouge puis bleue) : sa probabilité est un simple produit de fractions décroissantes, position par position. Une composition (par exemple « 2 rouges et 1 bleue », ordre libre) regroupe TOUTES les séquences qui y mènent — ici 3 séquences équiprobables — et sa probabilité est donc la somme de leurs probabilités individuelles, toujours plus grande que celle d'une seule séquence. C'est cette seconde probabilité, celle de la composition, que calcule directement la formule hypergéométrique.",
      },
    ],
    binomialesequence: [
      {
        enonce: "Pourquoi le coefficient binomial $C_n^k$ n'est-il jamais optionnel dans la formule $P(X=k)=C_n^kp^k(1-p)^{n-k}$ dès que $0<k<n$ ?",
        corrige:
          "$p^k(1-p)^{n-k}$ ne donne que la probabilité d'UNE seule façon précise d'obtenir ces $k$ succès parmi les $n$ épreuves ; mais ces $k$ succès peuvent occuper $C_n^k$ positions différentes parmi les $n$ épreuves, toutes aussi probables les unes que les autres. Oublier ce facteur revient à ne compter qu'une seule de ces positions : avec $n=6$, $p=0,4$, $k=2$, cela donnerait un résultat 15 fois trop petit, exactement $C_6^2=15$.",
      },
      {
        enonce: "Pourquoi la probabilité d'une séquence exacte sans remise se calcule-t-elle par un produit de fractions qui diminuent à chaque étape, et non par $1/n^k$ comme pour un tirage avec remise ?",
        corrige:
          "Sans remise, chaque élément tiré disparaît réellement du reste : il y a un élément de moins disponible à chaque étape suivante (n, puis n-1, puis n-2...), donc la probabilité de deviner exactement le bon élément augmente d'étape en étape — alors qu'avec remise, le nombre d'éléments disponibles reste constamment $n$, d'où la probabilité constante $1/n$ à chaque tirage et le produit $1/n^k$. Utiliser $1/n^k$ sans remise ignorerait que le nombre de concurrents restants diminue réellement à chaque tirage.",
      },
    ],
  },
  'variables-aleatoires': {
    variablesdiscretes: [
      {
        enonce:
          "Pourquoi l'espérance $E(X)$ ne tombe-t-elle presque jamais sur une des valeurs que $X$ peut réellement prendre ?",
        corrige:
          "$E(X)$ est une moyenne **pondérée** par les probabilités, pas une des valeurs observables de $X$ : rien ne garantit qu'elle coïncide avec l'une d'elles. Un dé équilibré donne $E(X)=3,5$, qu'aucune face ne porte ; une loi plus penchée vers certaines valeurs donne une espérance qui se rapproche de celles-ci sans forcément tomber pile dessus — exactement comme un centre de gravité, qui n'a pas besoin de coïncider avec un point matériel précis du système.",
      },
      {
        enonce:
          "Deux jeux peuvent avoir exactement la même espérance sans être aussi risqués l'un que l'autre. Qu'est-ce qui les distingue alors, et quelle grandeur le mesure ?",
        corrige:
          "L'espérance ne renseigne que sur le résultat moyen à long terme, jamais sur la dispersion des résultats individuels autour de cette moyenne. Deux jeux équitables (espérance nulle) peuvent avoir des gains très différents en valeur absolue — ±1€ pour l'un, ±100€ pour l'autre — sans que l'espérance s'en aperçoive. C'est l'écart-type $\\sigma(X)$ qui mesure cette dispersion : plus il est grand, plus les résultats individuels s'éloignent typiquement de la moyenne, donc plus le jeu est risqué.",
      },
      {
        enonce:
          "« Au moins $k$ » et « au plus $k$ » ne sont presque jamais des événements contraires. Pourquoi, et quel est le véritable contraire de « au moins $k$ » ?",
        corrige:
          "Deux événements sont contraires seulement s'ils ne partagent aucune valeur ET couvrent ensemble toutes les valeurs possibles. « Au moins $k$ » et « au plus $k$ » partagent toujours la valeur $X=k$ elle-même — ils ne sont donc jamais disjoints, même si leurs probabilités semblent parfois s'additionner à 1. Le vrai contraire de « au moins $k$ » est « au plus $k-1$ », qui exclut cette fois complètement la valeur frontière.",
      },
    ],
    loibinomiale: [
      {
        enonce:
          "Pourquoi le coefficient $C(n,k)$ est-il indispensable dans la formule de la loi binomiale, alors que $p^k(1-p)^{n-k}$ donne déjà une probabilité ?",
        corrige:
          "$p^k(1-p)^{n-k}$ ne calcule la probabilité que d'UN seul ordre précis d'apparition des $k$ succès parmi les $n$ épreuves. Mais l'événement « $k$ succès » regroupe toutes les façons de répartir ces $k$ succès parmi les $n$ épreuves, et chacune de ces répartitions a exactement la même probabilité $p^k(1-p)^{n-k}$. $C(n,k)$ compte précisément ce nombre de répartitions possibles ; l'oublier revient à ne compter qu'un seul chemin parmi les $C(n,k)$ qui mènent au même résultat.",
      },
      {
        enonce:
          "Le contraire de « au moins 1 succès » est « aucun succès », jamais « tous des succès ». Pourquoi cette dernière réponse, qui semble plausible, est-elle fausse ?",
        corrige:
          "Le contraire d'un événement doit couvrir, avec lui, absolument tous les cas possibles, sans rien oublier. « Au moins 1 succès » couvre $X=1,2,\\ldots,n$ ; son seul complément possible est donc $X=0$, qui couvre tout le reste. « Tous des succès » ($X=n$) n'est qu'UN cas parmi les $X\\geq1$ déjà couverts par l'événement de départ — ce n'est donc pas son contraire, mais un cas particulier qui lui appartient déjà.",
      },
    ],
    variablecontinue: [
      {
        enonce:
          "Pourquoi la probabilité qu'une variable continue prenne EXACTEMENT une valeur donnée est-elle toujours nulle, alors que ce n'est pas le cas pour une variable discrète ?",
        corrige:
          "Une variable continue peut prendre une infinité de valeurs sur un intervalle. Si chacune avait une probabilité strictement positive, même infime, la somme de ces probabilités sur tout l'intervalle serait infinie — ce qui contredirait le fait que la probabilité totale vaut 1. La probabilité ne peut donc être attribuée qu'à des intervalles (une aire sous la courbe de densité), jamais à un point isolé ; une variable discrète, elle, n'a qu'un nombre fini ou dénombrable de valeurs, donc chacune peut recevoir une part finie de probabilité sans ce problème.",
      },
      {
        enonce:
          "Pourquoi peut-on écrire indifféremment $P(a<X<b)$ ou $P(a\\leq X\\leq b)$ pour une variable continue, alors que la distinction strict/large compte en discret ?",
        corrige:
          "Puisque $P(X=a)=0$ et $P(X=b)=0$ pour une variable continue, ajouter ou retirer les bornes $a$ et $b$ de l'intervalle ne change rien à l'aire sous la courbe de densité — ces deux valeurs isolées ne pèsent rien. En discret, au contraire, $X=k$ a une vraie probabilité non nulle : inclure ou exclure une borne change réellement le résultat, c'est précisément pourquoi « au moins $k$ » et « au plus $k$ » se recouvrent en $X=k$.",
      },
    ],
    discreteoucontinue: [
      {
        enonce:
          "Quel est le véritable critère pour décider si une variable aléatoire est discrète ou continue ?",
        corrige:
          "Le critère est le nombre de valeurs que la variable peut prendre, pas la nature de l'expérience elle-même : une variable discrète prend un nombre fini ou dénombrable de valeurs (on peut en principe les lister une par une), tandis qu'une variable continue peut prendre n'importe quelle valeur réelle d'un intervalle, donc une infinité non dénombrable de valeurs. C'est ce qui force à remplacer la loi de probabilité « valeur par valeur » par une densité définie sur tout un intervalle.",
      },
      {
        enonce:
          "Les variables discrètes et continues partagent exactement les mêmes notions (loi, espérance, variance...). Pourquoi faut-il pourtant deux outils de calcul différents ?",
        corrige:
          "Une somme $\\sum p_ix_i$ suppose un nombre fini ou dénombrable de termes à additionner un par un ; or une variable continue a une infinité non dénombrable de valeurs, qu'on ne peut pas énumérer terme à terme. L'intégrale généralise la somme à ce cas : elle agrège une infinité de contributions infinitésimales $t\\,f(t)\\,dt$ exactement comme la somme agrège les contributions ponctuelles $x_iP(X=x_i)$ — même idée de moyenne pondérée, un outil différent parce que le nombre de valeurs à pondérer change de nature.",
      },
    ],
    loiuniformecontinue: [
      {
        enonce:
          "Pourquoi la probabilité d'un intervalle $[c;d]$ contenu dans $[a;b]$ ne dépend-elle que de sa longueur $d-c$, et jamais de sa position dans $[a;b]$, pour une loi uniforme continue ?",
        corrige:
          "La densité d'une loi uniforme continue est **constante** sur tout $[a;b]$ : aucune zone n'est privilégiée par rapport à une autre. La probabilité d'un intervalle est l'aire sous cette densité constante, c'est-à-dire un rectangle de hauteur fixe $1/(b-a)$ : son aire ne dépend donc que de sa largeur $d-c$, jamais de l'endroit où ce rectangle est placé le long de l'axe.",
      },
      {
        enonce:
          "Pourquoi l'espérance d'une loi uniforme continue sur $[a;b]$ vaut-elle toujours exactement le milieu de l'intervalle, $(a+b)/2$ ?",
        corrige:
          "Comme la densité est constante, aucune valeur n'est plus probable qu'une autre : la distribution est parfaitement symétrique par rapport au centre de $[a;b]$. L'espérance, étant une moyenne pondérée, coïncide alors nécessairement avec ce centre de symétrie — exactement comme la moyenne d'une série de points également espacés et équiprobables tombe toujours en leur milieu.",
      },
    ],
    loinormale: [
      {
        enonce:
          "La règle empirique dit que 95,4% des valeurs sont dans $[\\mu-2\\sigma;\\mu+2\\sigma]$, donc 4,6% en dehors. Pourquoi la probabilité d'être seulement au-dessus de $\\mu+2\\sigma$ (un seul côté) vaut-elle la moitié de ce complément, et pas le complément entier ?",
        corrige:
          "La courbe de la loi normale est symétrique par rapport à $\\mu$ : la zone « en dehors de l'intervalle » se compose de deux queues, une au-dessus de $\\mu+2\\sigma$ et une au-dessous de $\\mu-2\\sigma$, parfaitement identiques par symétrie. Le complément total (4,6%) se partage donc également entre les deux ; isoler un seul côté revient à ne garder que l'une des deux moitiés, soit 2,3%.",
      },
      {
        enonce:
          "Pourquoi est-il nécessaire de standardiser $X$ (calculer $Z=(X-\\mu)/\\sigma$) avant de pouvoir utiliser la table de $\\Phi$ ?",
        corrige:
          "La table de $\\Phi$ n'a été construite que pour LA loi normale centrée réduite $N(0,1)$ — une seule table ne peut pas couvrir toutes les combinaisons possibles de $\\mu$ et $\\sigma$. La standardisation transforme n'importe quelle variable $X\\sim N(\\mu,\\sigma)$ en une variable $Z$ qui suit toujours exactement $N(0,1)$, quels que soient $\\mu$ et $\\sigma$ de départ — c'est ce changement de variable qui permet de réutiliser la même table pour tous les cas.",
      },
      {
        enonce:
          "$\\Phi(-z)$ n'est pas égal à $\\Phi(z)$, alors que la courbe de densité de $N(0,1)$ est elle-même parfaitement symétrique par rapport à 0. Comment ces deux faits sont-ils compatibles ?",
        corrige:
          "$\\Phi(z)$ n'est pas la densité elle-même, mais l'aire **cumulée à gauche** de $z$ — et cette aire cumulée n'a aucune raison d'être symétrique même si la courbe qu'elle mesure l'est. $\\Phi(-z)$ est la petite aire de la queue gauche, $\\Phi(z)$ (pour $z>0$) est la grande aire qui inclut toute la partie gauche plus la moitié droite jusqu'à $z$ : la vraie relation issue de cette symétrie est $\\Phi(-z)=1-\\Phi(z)$, une symétrie par rapport à 0,5, pas par rapport à l'axe des ordonnées.",
      },
    ],
    extensionsbayes: [
      {
        enonce:
          "Pourquoi la probabilité que deux épreuves indépendantes réussissent TOUTES LES DEUX se calcule-t-elle en multipliant leurs probabilités, et jamais en les additionnant ?",
        corrige:
          "Un « ET » entre deux événements indépendants est toujours plus restrictif qu'un seul des deux événements pris isolément — réussir les deux épreuves est plus difficile que réussir une seule d'entre elles. Une addition donnerait un nombre plus grand que chacune des deux probabilités séparées, ce qui est incompatible avec cette restriction. La multiplication, elle, donne toujours un résultat plus petit que chaque facteur (puisque chaque probabilité est $\\leq1$), cohérent avec le fait que l'exigence « ET » réduit les chances par rapport à chaque condition prise seule.",
      },
      {
        enonce:
          "Quelle est la différence entre une probabilité a priori et une probabilité a posteriori dans le théorème de Bayes, et pourquoi les confondre est une erreur ?",
        corrige:
          "La probabilité a priori ($q_j$) décrit la proportion de la catégorie $j$ avant toute observation — ce qu'on sait sur la population en général. La probabilité a posteriori ($P(\\text{cat.}j \\mid \\text{critère})$) intègre l'information apportée par un critère effectivement observé, et peut donc être très différente de $q_j$ si ce critère est plus ou moins fréquent selon la catégorie. Répondre $q_j$ à une question posée après observation du critère revient à ignorer complètement cette information nouvelle, alors que c'est justement elle que le théorème de Bayes permet d'exploiter.",
      },
      {
        enonce:
          "Les approximations binomiale→normale ($n>30$, $0,3<p<0,7$) et binomiale→Poisson ($n\\geq30$, $p\\leq0,1$) ne se chevauchent jamais. Pourquoi, et que faire pour un $p$ intermédiaire comme $p=0,2$ ?",
        corrige:
          "Chaque approximation remplace la binomiale par une loi dont la forme colle bien à un régime particulier : la loi normale, symétrique, convient quand $p$ est proche de $0,5$ (la binomiale elle-même devient alors presque symétrique) ; la loi de Poisson, elle, modélise des événements rares et convient quand $p$ est proche de 0. Un $p$ intermédiaire ne ressemble franchement à aucun des deux régimes : ni assez symétrique pour la normale, ni assez rare pour Poisson. La seule option rigoureusement correcte reste alors la formule binomiale exacte.",
      },
    ],
    loipoisson: [
      {
        enonce:
          "Pour la loi binomiale, « au moins 1 succès » se calcule souvent par complément. Pourquoi cette astuce ne s'applique-t-elle pas aussi simplement à « au plus $k$ » pour une loi de Poisson ?",
        corrige:
          "La loi binomiale a un support **fini**, borné par $n$ : un complément par rapport à « tous des succès » ou « aucun succès » a donc toujours un sens naturel. La loi de Poisson, elle, a un support **infini** ($k$ peut être n'importe quel entier $\\geq0$, sans borne supérieure) : il n'existe aucune valeur maximale à côté de laquelle un complément court serait pertinent. « Au plus $k$ » doit donc toujours se calculer comme une somme directe des termes de 0 à $k$.",
      },
      {
        enonce:
          "Pour la loi de Poisson, l'espérance et la variance sont toutes les deux égales à $\\lambda$. Pourquoi est-ce remarquable, comparé aux autres lois du chapitre ?",
        corrige:
          "Dans toutes les autres lois vues dans ce chapitre, l'espérance et la variance sont deux grandeurs structurellement différentes — $np$ et $np(1-p)$ pour la binomiale, $(a+b)/2$ et $(b-a)^2/12$ pour la loi uniforme — qui dépendent chacune différemment des paramètres de la loi. Que ces deux grandeurs coïncident exactement, et pour un seul et même paramètre $\\lambda$, est une propriété **spécifique** à la loi de Poisson, pas une coïncidence qu'on retrouverait ailleurs ; elle vient directement de la façon dont $\\lambda$ contrôle à la fois le centrage et la dispersion de cette loi particulière.",
      },
      {
        enonce:
          "Pourquoi ne peut-on jamais recopier directement le taux de base d'un énoncé comme valeur de $\\lambda$, sans l'ajuster ?",
        corrige:
          "$\\lambda$ représente le nombre moyen d'événements sur l'unité exacte visée par la question — pas forcément celle donnée dans l'énoncé. Si le taux de base porte sur une minute et que la question porte sur 15 minutes, il faut le multiplier par 15 ; s'il porte sur un effectif de référence et que la question vise un effectif différent, il faut le mettre à l'échelle proportionnellement. Recopier le taux de base tel quel revient à répondre à une question sur une autre durée ou un autre effectif que celui réellement demandé.",
      },
    ],
  },
  'lieux-geometriques': {
    'points-droites-remarquables': [
      {
        enonce:
          "Pourquoi un repère seulement affine ne permet-il pas de calculer une distance ou une équation de cercle, alors qu'il permet encore de vérifier un alignement ou un milieu ?",
        corrige:
          "Distance, angle et équation de cercle reposent sur une notion de longueur identique dans toutes les directions (Pythagore, produit scalaire), ce qui suppose deux axes perpendiculaires et une même unité sur les deux. Alignement, parallélisme, milieu et barycentre sont des notions affines, qui restent vraies même si le repère n'est pas orthonormé — c'est pour ça qu'elles survivent au changement de repère, pas les autres.",
      },
      {
        enonce:
          "Pourquoi la bissectrice issue d'un sommet ne coupe-t-elle le côté opposé en son milieu que si le triangle est isocèle en ce sommet ?",
        corrige:
          "Le théorème de la bissectrice donne AI/IC=AB/BC. Ce rapport ne vaut 1 (le milieu) que si AB=BC, c'est-à-dire si le triangle est isocèle en B. Sinon, I est décalé du côté du plus petit des deux côtés adjacents à B — confondre bissectrice et médiane revient à oublier cette pondération inégale entre AB et BC.",
      },
      {
        enonce:
          "Pourquoi une condition d'aire sur un triangle dont un sommet parcourt une droite donne-t-elle presque toujours deux solutions plutôt qu'une seule ?",
        corrige:
          "L'aire s'exprime via une valeur absolue $|K+Mt|=2k$, car la hauteur réelle (une distance) ne peut jamais être négative, alors que l'expression algébrique $K+Mt$ peut l'être. Résoudre cette égalité revient à résoudre deux équations ($K+Mt=2k$ et $K+Mt=-2k$), correspondant aux deux positions symétriques par rapport à (AB) où l'aire cible est atteinte.",
      },
    ],
    cercles: [
      {
        enonce:
          "Pourquoi un cercle passant par deux points donnés et de rayon fixé a-t-il, en général, deux solutions plutôt qu'une seule ?",
        corrige:
          "Le centre doit être équidistant des deux points (donc sur la médiatrice de [AB]) ET à distance r de chacun. Ces deux conditions donnent, sur la médiatrice, une équation du second degré qui admet deux racines symétriques par rapport à (AB) dès que $2r>AB$ — d'où deux centres possibles, sauf au cas limite $2r=AB$ (un seul) ou $2r<AB$ (aucun).",
      },
      {
        enonce:
          "Pourquoi l'incentre d'un triangle n'est-il pas simplement la moyenne des trois sommets, contrairement au centre de gravité ?",
        corrige:
          "Le centre de gravité pondère les trois sommets de façon égale (moyenne simple), car il traduit un équilibre de masses identiques. L'incentre, lui, doit être équidistant des TROIS côtés — une contrainte qui dépend de la longueur de chaque côté opposé, donc chaque sommet doit être pondéré par le côté qui lui est opposé (a, b, c), une moyenne pondérée et non simple. Les deux points ne coïncident que pour un triangle équilatéral.",
      },
      {
        enonce:
          "Pourquoi existe-t-il toujours exactement deux tangentes à un cercle depuis un point extérieur, et aucune depuis un point intérieur ?",
        corrige:
          "Une droite par P est tangente si sa distance au centre O vaut exactement r ; cette condition se traduit par une équation du second degré (en la pente ou en a/b), qui a deux solutions distinctes symétriques par rapport à (OP) dès que $OP>r$. Si P est intérieur ($OP<r$), toute droite par P coupe déjà le cercle en deux points distincts : aucune tangente n'est possible.",
      },
    ],
    'methode-generale-demonstration': [
      {
        enonce:
          "Pourquoi une propriété démontrée avec des coordonnées numériques fixées (par exemple B(4;0), D(2;3)) ne prouve-t-elle rien pour un parallélogramme quelconque ?",
        corrige:
          "Un exemple numérique ne vérifie la propriété que pour CE parallélogramme précis — rien ne garantit qu'elle reste vraie pour un autre. Des paramètres génériques (des lettres a, b, c quelconques) couvrent tous les cas possibles à la fois : si l'égalité tient pour des lettres arbitraires, elle tient nécessairement pour n'importe quelle valeur particulière qu'on pourrait leur donner.",
      },
      {
        enonce:
          "Pourquoi choisit-on un repère « adapté » à la figure (un sommet à l'origine, un côté sur un axe) avant de démontrer une propriété, plutôt que de garder un repère quelconque ?",
        corrige:
          "Le choix du repère ne change jamais la validité d'une propriété géométrique — elle reste vraie dans n'importe quel repère. Mais un repère bien choisi annule plusieurs coordonnées dès le départ, ce qui simplifie fortement les calculs, sans jamais restreindre la généralité : tout repère orthonormé peut être amené à cette position par translation et rotation.",
      },
    ],
    'lieux-elimination': [
      {
        enonce:
          "Pourquoi $|x-p|+|y-q|=k$ donne-t-il un lieu borné (un losange), alors que $|x-p|-|y-q|=k$ donne un lieu non borné (des demi-droites) ?",
        corrige:
          "Dans la somme, les deux termes sont positifs et doivent totaliser exactement k : chacun est donc plafonné, ce qui enferme le lieu dans une région finie. Dans la différence, un terme peut croître indéfiniment pourvu que l'autre croisse tout autant, en gardant leur écart constant — rien ne borne alors leur valeur commune, et le lieu part à l'infini.",
      },
      {
        enonce:
          "Pourquoi le lieu $PA^2+PB^2=k$ présente-t-il trois régimes (cercle, un seul point, lieu vide) selon la valeur de k, alors qu'un simple cercle $PA=k$ n'en a que deux ?",
        corrige:
          "Le théorème de la médiane donne $PA^2+PB^2 = 2\\cdot PM^2+AB^2/2$, où le second terme est un minimum incompressible, atteint pile en $P=M$. Pour k égal à ce minimum, un seul point convient ; au-dessus, un cercle de rayon croissant ; en dessous, aucun point ne peut satisfaire l'équation. Une distance simple $PA=k$ n'a, elle, pas ce seuil incompressible à franchir.",
      },
    ],
    'methode-generatrices': [
      {
        enonce:
          "Pourquoi une équation de lieu obtenue par élimination de paramètre peut-elle contenir un morceau qu'aucune valeur du paramètre n'atteint jamais (un « parasite ») ?",
        corrige:
          "L'élimination du paramètre transforme le système en une équation purement algébrique, qui peut admettre des solutions supplémentaires introduites par la manipulation elle-même — des solutions qui ne correspondent à aucune position réelle des génératrices. Repérer un parasite demande donc de revenir vérifier, pour chaque morceau trouvé, qu'une valeur du paramètre y mène vraiment.",
      },
      {
        enonce:
          "Pourquoi est-il incomplet de donner seulement l'équation d'un lieu obtenu par la méthode des génératrices, sans préciser sa restriction ?",
        corrige:
          "L'équation décrit tous les points qui pourraient appartenir au lieu si le paramètre parcourait tous les réels, mais celui-ci a en réalité un domaine limité. La restriction précise la portion réellement balayée par le point d'intersection quand le paramètre reste dans ce domaine — sans elle, on décrit toute une droite ou une courbe là où seule une partie est effectivement atteinte.",
      },
      {
        enonce:
          "Pourquoi un morceau « singulier » apparaît-il dans la factorisation d'une équation de lieu obtenue par génératrices ?",
        corrige:
          "Un morceau singulier correspond à une valeur précise du paramètre pour laquelle les deux génératrices, au lieu de se couper en un point isolé, coïncident entièrement. Cette coïncidence instantanée laisse une trace algébrique dans l'équation éliminée, sans représenter un vrai morceau du lieu balayé pour les autres valeurs du paramètre.",
      },
    ],
    'lieu-parametrique': [
      {
        enonce:
          "Pourquoi une représentation paramétrique $x=f(t)$, $y=g(t)$ ne donne-t-elle pas directement la nature du lieu, et pourquoi faut-il en général une identité pour l'obtenir ?",
        corrige:
          "Les deux équations décrivent séparément comment x et y évoluent avec t, mais ne disent rien sur la relation DIRECTE entre x et y tant que t reste présent dans les deux. Une identité qui relie f(t) et g(t) indépendamment de t (comme $\\cos^2+\\sin^2=1$) permet d'éliminer t et de faire apparaître une équation purement en x et y — c'est elle qui révèle la vraie nature géométrique du lieu.",
      },
    ],
  },
  coniques: {
    identifier: [
      {
        enonce:
          "Pourquoi une parabole n'a-t-elle qu'un seul foyer et une seule directrice, alors que l'ellipse et l'hyperbole en ont chacune deux ?",
        corrige:
          "La parabole est définie par une égalité de distance à UN point et UNE droite — rien dans sa définition n'impose de second élément. L'ellipse et l'hyperbole sont définies à partir de DEUX points fixes (les foyers) ; chacun des deux foyers possède sa propre directrice, par la même caractérisation focale appliquée à F puis à F′. La différence vient directement du nombre d'éléments fixes présents dans chaque définition.",
      },
      {
        enonce:
          "Comment distinguer une ellipse d'une hyperbole à partir de leur équation réduite, sans tracer la courbe ?",
        corrige:
          "Dans la forme réduite, l'ellipse additionne deux carrés égalés à 1 ($x^2/a^2+y^2/b^2=1$), l'hyperbole les soustrait ($x^2/a^2-y^2/b^2=1$). Ce changement de signe vient directement de la définition — somme de distances constante pour l'ellipse, valeur absolue de leur différence pour l'hyperbole — et c'est lui qui produit une courbe bornée dans un cas, à deux branches non bornées dans l'autre.",
      },
      {
        enonce:
          "Pourquoi une équation $xy=k$ décrit-elle une hyperbole, alors qu'elle ne ressemble en rien à $x^2/a^2-y^2/b^2=1$ ?",
        corrige:
          "Les deux équations décrivent la MÊME courbe, vue dans deux repères différents : la seconde utilise les axes de symétrie de l'hyperbole équilatère, la première utilise ses deux asymptotes comme axes. Un terme en xy signale justement que les axes de coordonnées choisis ne sont pas les axes de symétrie de la conique — ici, ce sont les asymptotes elles-mêmes.",
      },
    ],
    excentricite: [
      {
        enonce:
          "Pourquoi un seul nombre, l'excentricité, suffit-il à décider si une conique est une ellipse, une parabole ou une hyperbole ?",
        corrige:
          "La caractérisation focale $dist(P;F)/dist(P;d)=e$ décrit les trois coniques avec la MÊME structure d'équation — seule la valeur de e change. Comme ce rapport $e=c/a$ fixe complètement la façon dont la distance au foyer croît par rapport à la distance à la directrice, les trois régimes ($e<1$, $e=1$, $e>1$) correspondent exactement aux trois formes de courbe possibles, sans aucune autre information nécessaire.",
      },
      {
        enonce: "Pourquoi le cercle est-il exclu de la caractérisation focale commune aux trois coniques ?",
        corrige:
          "La caractérisation focale suppose une directrice à distance finie du foyer. Pour le cercle, les deux foyers de l'ellipse d'origine sont confondus ($c=0$), donc $e=0$ — et la directrice associée, $x=a^2/c$, impliquerait une division par zéro : elle part à l'infini et n'existe plus. Le cercle garde une excentricité (nulle) mais perd toute notion de directrice.",
      },
      {
        enonce:
          "Pourquoi un terme en xy dans l'équation générale d'une conique empêche-t-il de la réduire par simple translation ?",
        corrige:
          "Une équation sans terme en xy a ses axes de symétrie parallèles aux axes de coordonnées — une translation (qui déplace l'origine sans tourner les axes) suffit alors à centrer la figure. Un terme en xy signale que les axes de symétrie réels de la conique sont inclinés par rapport aux axes de coordonnées : aligner les deux demanderait en plus une rotation, que la translation seule ne peut jamais réaliser.",
      },
    ],
    airefocale: [
      {
        enonce:
          "Pourquoi la relation $|PF|+|PF'|=2a$ est-elle le point de départ obligatoire pour calculer les deux rayons focaux d'un point, plutôt que de les calculer indépendamment l'un de l'autre ?",
        corrige:
          "Un point P pris isolément ne fixe pas directement ses deux distances aux foyers par une seule formule, sauf aux deux sommets de l'axe non focal, où elles sont égales par symétrie. Mais la somme $|PF|+|PF'|$ vaut TOUJOURS 2a, quel que soit P sur l'ellipse : couplée à une autre donnée (un rapport entre les deux distances), elle forme un système que l'on peut résoudre pour trouver chaque rayon focal séparément.",
      },
      {
        enonce:
          "Pourquoi un rapport $k=|PF|/|PF'|$ trop grand peut-il rendre un point P inexistant sur une ellipse donnée, même si le système {somme=2a ; rapport=k} semble se résoudre normalement ?",
        corrige:
          "Le système donne toujours une solution algébrique, mais $|PF|$ ne peut en réalité prendre que des valeurs dans l'intervalle $[a-c;a+c]$ pour un vrai point de l'ellipse (minimum et maximum atteints aux deux sommets de l'axe focal). Si le rapport k imposé force $|PF|$ hors de cet intervalle, aucun point réel de l'ellipse ne correspond : le triangle $FPF'$ ne peut même pas se fermer géométriquement.",
      },
    ],
    intersection: [
      {
        enonce: "Pourquoi une droite ne peut-elle jamais couper une conique en plus de deux points ?",
        corrige:
          "Substituer l'équation (du premier degré) de la droite dans celle (du second degré) de la conique produit toujours une équation du second degré à une seule inconnue, qui admet au maximum deux solutions réelles — quel que soit le nombre de termes dans l'équation de départ. C'est le degré de l'équation finale, pas la complexité apparente de la conique, qui fixe le nombre maximal de points communs.",
      },
      {
        enonce:
          "Pourquoi un discriminant nul ($\\Delta=0$) signifie-t-il que la droite est tangente, et non qu'elle n'a aucun point commun avec la conique ?",
        corrige:
          "$\\Delta=0$ donne une racine DOUBLE à l'équation du second degré — c'est-à-dire exactement un point d'intersection, compté deux fois (la droite touche la courbe sans la traverser). C'est $\\Delta<0$, l'absence de racine réelle, qui correspond à aucun point commun. Confondre les deux revient à déclarer extérieure une droite qui touche pourtant la courbe en un point précis.",
      },
    ],
    tangentes: [
      {
        enonce:
          "Pourquoi doit-on choisir la bonne branche ($y=f(x)$ ou $y=-f(x)$) avant de dériver pour trouver la tangente en un point d'une conique ?",
        corrige:
          "Une conique n'est pas le graphe d'une seule fonction : c'est l'union de deux graphes symétriques par rapport à l'axe des abscisses. Dériver la branche qui ne contient pas réellement le point P donnerait une pente de signe opposé à la vraie tangente, puisque les deux branches sont symétriques l'une de l'autre — le résultat serait une droite symétrique de la bonne, pas la bonne tangente elle-même.",
      },
      {
        enonce:
          "Pourquoi la pente de la tangente à une ellipse n'est-elle pas définie aux deux sommets de l'axe focal, alors que la forme dédoublée y donne quand même une équation correcte ?",
        corrige:
          "La formule de la pente contient $y_P$ au dénominateur ; or aux sommets $(\\pm a;0)$, $y_P=0$, ce qui rend la division impossible — cela traduit le fait réel que la fonction n'y est pas dérivable (la tangente y est verticale). La forme dédoublée ne repose sur aucune division par $y_P$ : elle reste valable sans exception et donne directement $x=\\pm a$, l'équation d'une droite verticale.",
      },
    ],
    optique: [
      {
        enonce:
          "Pourquoi la propriété optique de la parabole (concentrer des rayons parallèles en un seul point) ne s'applique-t-elle pas à l'ellipse ?",
        corrige:
          "La propriété de l'ellipse relie les deux FOYERS entre eux (un rayon issu d'un foyer passe par l'autre) — elle ne dit rien sur des rayons parallèles à une direction donnée. La parabole, elle, n'a qu'un foyer, et sa propriété relie ce foyer à une DIRECTION plutôt qu'à un second point. Un faisceau de rayons parallèles envoyé sur un miroir elliptique ne rencontre donc aucun des deux foyers de façon systématique : il ne converge en aucun point.",
      },
      {
        enonce: "En quel sens la propriété optique de la parabole est-elle un cas limite de celle de l'ellipse ?",
        corrige:
          "Si l'on éloigne indéfiniment le second foyer F′ d'une ellipse, les droites joignant un point P de la courbe à F′ deviennent de plus en plus proches d'être toutes parallèles entre elles (parallèles à l'axe). La propriété de l'ellipse (PF et PF′ font des angles égaux avec la tangente) devient alors « PF et la direction parallèle à l'axe font des angles égaux avec la tangente » — exactement la propriété de la parabole.",
      },
      {
        enonce:
          "Pourquoi les propriétés optiques des trois coniques dépendent-elles directement de leur définition par distance (foyer/directrice ou foyers) ?",
        corrige:
          "La loi de la réflexion compare l'angle d'incidence et l'angle de réflexion par rapport à la tangente. Les démonstrations de ces propriétés optiques s'appuient précisément sur l'égalité de distances qui DÉFINIT chaque conique (égale distance à un foyer et une directrice pour la parabole, somme ou différence de distances à deux foyers pour l'ellipse et l'hyperbole) — c'est cette structure métrique qui produit, via la tangente, l'égalité d'angles caractéristique de chaque miroir.",
      },
    ],
  },
}

/** `[]` pour une section absente de la table — même convention que `deriveQuestionsOuvertes`. */
export function deriveQuestionsComprehension(chapitreSlug: string, sectionId: string): QuestionOuverte[] {
  const questions = QUESTIONS_COMPREHENSION[chapitreSlug]?.[sectionId] ?? []
  return questions.map((q) => ({ enonce: parseRichText(q.enonce), corrige: [parseRichText(q.corrige)] }))
}

export type TypeQuestionEvaluation = 'demonstration' | 'comprehension' | 'vraiFaux' | 'exercice'
export type Processus = 1 | 2 | 3

export interface LigneSelection {
  /** Chapitre d'origine de la ligne (voir `ChapitreAvecSections`, `buildEvaluationUrl`) — nécessaire
   * dès qu'une sélection couvre plusieurs chapitres : `sectionId` seul n'est PAS unique entre deux
   * chapitres (ex. chapitre 1 et chapitre 2 de 6e ont chacun une section `equations`), donc toute
   * correspondance ligne↔section DOIT filtrer sur les deux clés. */
  chapitreSlug: string
  sectionId: string
  processus: Processus
  type: TypeQuestionEvaluation
  /** Discriminateur secondaire, requis dès qu'une section a PLUSIEURS générateurs
   * (`type==='exercice'`, valeur = `generatorId`) ou PLUSIEURS thèmes vrai/faux
   * (`type==='vraiFaux'`, valeur = `quizTheme`) — voir `generateursPourSection`/
   * `themesPourSection`. Une section n'a jamais plus d'une ligne `demonstration`/`comprehension`,
   * `cle` y reste donc absent. */
  cle?: string
  /** 0 = ligne non incluse. Pour `type==='exercice'`, DÉRIVÉ automatiquement de la somme de
   * `parVariante` (jamais éditable directement dans ce cas) — voir `sommeParVariante`. */
  nombre: number
  /** Réservé à `type==='exercice'` — nombre d'exercices PAR FAMILLE/VARIANTE forcée (clé = `id` du
   * catalogue, voir `catalogueVariantesExercice`), pour un contrôle fin plutôt qu'un total tiré au
   * hasard parmi toutes les familles. Absent (ou vide) pour les autres types. */
  parVariante?: Record<string, number>
  /** Points par question. Pour `type==='exercice'`, sert de SEUL repli quand une variante n'a pas
   * encore d'entrée dans `pointsParVariante` (ex. juste après avoir forcé un nombre sur une
   * nouvelle variante) — l'édition réelle du barème passe alors par `pointsParVariante`, jamais
   * cette valeur directement. Pour les autres types (sans notion de variante), c'est le seul champ
   * de barème et reste directement éditable. */
  points: number
  /** Réservé à `type==='exercice'` — barème PAR FAMILLE/VARIANTE (clé = `id` du catalogue, même
   * clé que `parVariante`), pour que deux variantes d'un même générateur puissent valoir un nombre
   * de points différent sur la feuille d'évaluation. Absent (ou vide) pour les autres types. */
  pointsParVariante?: Record<string, number>
}

export function sommeParVariante(parVariante: Record<string, number> | undefined): number {
  return Object.values(parVariante ?? {}).reduce((total, n) => total + n, 0)
}

interface ItemPayload {
  processus: Processus
  titreSection: string
  points: number
  exercice?: { generatorId: IdGenerateurPilote; parVariante: { varianteId: string; nombre: number; points: number }[] }
  /** `chapitre` lève l'ambiguïté sur la banque vrai/faux à interroger côté plateforme-maths quand
   * une même page en sert plusieurs (`AppEvaluation6e.tsx`, voir `QuizThemeConfig.quizChapitre`) —
   * absent pour les chapitres à banque unique (4e). */
  vraiFaux?: { chapitre?: ChapitreFonctionnel; theme: string; nombre: number }
  /** Une entrée par série anti-triche — voir `construireOuvertesParSerie`. */
  ouvertesParSerie?: QuestionOuverte[][]
}

/** Encode un objet JS en base64 sûr pour l'UTF-8 (accents français compris) — décodage symétrique
 * côté plateforme-maths (`decodeURIComponent(escape(atob(...)))`, voir `AppEvaluation6e.tsx`). */
function encoderPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

/** Choisit `nombre` éléments distincts au hasard (Fisher-Yates partiel) — même algorithme que
 * `piocherQuestions` côté plateforme-maths (`AppEvaluation6e.tsx`), dupliqué ici volontairement :
 * deux dépôts séparés, pas de code partagé entre eux. */
function piocherAleatoire<T>(banque: T[], nombre: number): T[] {
  const copie = [...banque]
  const n = Math.min(nombre, copie.length)
  for (let i = copie.length - 1; i > copie.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie.slice(copie.length - n)
}

/** Construit une sélection de `nombre` questions ouvertes PAR SÉRIE — indépendamment randomisée
 * quand le vivier le permet (`banque.length > nombre`), pour que les séries anti-triche diffèrent
 * aussi sur les questions ouvertes, pas seulement sur les exercices générés/le vrai-faux (déjà
 * randomisés à la génération côté plateforme-maths). Vivier insuffisant : toutes les séries
 * reçoivent la même sélection (rien d'autre à distribuer). */
function construireOuvertesParSerie(banque: QuestionOuverte[], nombre: number, nombreSeries: number): QuestionOuverte[][] {
  if (banque.length <= nombre) {
    const selection = banque.slice(0, nombre)
    return Array.from({ length: nombreSeries }, () => selection)
  }
  return Array.from({ length: nombreSeries }, () => piocherAleatoire(banque, nombre))
}

export interface EnTeteEvaluation {
  /** Absent en mode `exercice` — voir `mode` ci-dessous. */
  numero?: string
  date: string
  titre: string
  niveauLabel: string
  /** 4, 5 ou 6 — voir `NIVEAU_NUMERO`. */
  niveauNumero: number
  /** Texte affiché « Mathématiques {X}h/sem » — voir `HEURES_SEMAINE_DEFAUT`. */
  heuresSemaine: string
  /** Absent en mode `exercice` — voir `mode` ci-dessous. */
  calculatrice?: 'interdite' | 'autorisee'
  /** Nombre de versions anti-triche à générer (>= 1, lettrées A, B, C...) — chacune indépendamment
   * randomisée (générateurs, vrai/faux, et questions ouvertes quand le vivier le permet). Toujours
   * `1` en mode `exercice` (jamais de séries anti-triche pour une feuille d'exercices). */
  nombreSeries: number
  /** `false` : masque, dans les 2 documents générés, le titre du point du chapitre auquel
   * appartient chaque question (ex. « 1. Fonction réciproque d'une fonction bijective ») — utile
   * pour une évaluation qui ne doit pas révéler à quel point de matière appartient chaque question.
   * `true` par défaut (titres affichés, comportement historique). */
  afficherTitresSection: boolean
  /** `'exercice'` : feuille d'exercices générée depuis `/exercice` (page publique, accessible aux
   * élèves) — le document imprimé n'a alors ni numéro d'évaluation, ni mention de calculatrice, ni
   * série anti-triche (voir `EnteteEvaluation.mode` côté plateforme-maths,
   * `assemblerEvaluationHtml.ts`). `'evaluation'`/absent = comportement historique (`/admin`). */
  mode?: 'evaluation' | 'exercice'
}

/**
 * Construit l'URL complète vers le générateur d'évaluations à partir de la sélection de
 * l'utilisateur — `null` si aucune ligne active (rien à générer), ou si `levelSlug` n'a pas de
 * page d'évaluation connue (voir `EVALUATION_BASE_URL_PAR_LEVELSLUG`). `sections` doit être les
 * sections RÉELLES du chapitre choisi (pour dériver les questions ouvertes) — voir
 * `chaptersIndex.ts`. `chapitreSlug` scope toutes les recherches dans
 * `GENERATEURS_EVALUATION_PILOTE`/`QUIZ_THEMES_EVALUATION_PILOTE` (voir leur note sur la collision
 * `'equations'` entre les deux chapitres de 6e) — une ligne `exercice`/`vraiFaux` cherche sa
 * config via `ligne.cle` (`generatorId`/`quizTheme`) quand la section a plusieurs générateurs/thèmes.
 */
export interface ChapitreAvecSections {
  chapitreSlug: string
  chapterNumber: number
  title: string
  sections: ChapterSection[]
}

/** `chapitres` : UN ou PLUSIEURS chapitres du même niveau/heures (voir `EvaluationGeneratorPanel`,
 * sélection multi-chapitres) — `ItemPayload` ne porte déjà aucune notion de chapitre (seulement
 * `titreSection`), donc mélanger plusieurs chapitres dans un même envoi ne demande RIEN côté
 * plateforme-maths, seulement de retrouver ici la bonne section de chaque ligne via son
 * `ligne.chapitreSlug` plutôt qu'un chapitre unique implicite. `titreSection` gagne un préfixe
 * `N. Titre du chapitre — ` dès que `lignes` couvre RÉELLEMENT plus d'un chapitre (au moins une
 * ligne retenue, `nombre>0`, dans chacun) — jamais quand un seul est effectivement représenté,
 * pour ne rien changer au rendu d'une feuille mono-chapitre existante. */
export function buildEvaluationUrl(levelSlug: string, entete: EnTeteEvaluation, lignes: LigneSelection[], chapitres: ChapitreAvecSections[]): string | null {
  const baseUrl = EVALUATION_BASE_URL_PAR_LEVELSLUG[levelSlug]
  if (!baseUrl) return null

  const items: ItemPayload[] = []
  const nombreSeries = Math.max(1, entete.nombreSeries)
  const multiChapitres = new Set(lignes.filter((l) => l.nombre > 0).map((l) => l.chapitreSlug)).size > 1

  for (const ligne of lignes) {
    if (ligne.nombre <= 0) continue
    const chapitre = chapitres.find((c) => c.chapitreSlug === ligne.chapitreSlug)
    const section = chapitre?.sections.find((s) => s.id === ligne.sectionId)
    if (!chapitre || !section) continue

    const titreSection = multiChapitres ? `${chapitre.chapterNumber}. ${chapitre.title} — ${section.number}. ${section.title}` : `${section.number}. ${section.title}`

    if (ligne.type === 'exercice') {
      const config = generateursPourSection(ligne.chapitreSlug, ligne.sectionId).find((g) => g.generatorId === ligne.cle)
      if (!config) continue
      const parVariante = Object.entries(ligne.parVariante ?? {})
        .filter(([, nombre]) => nombre > 0)
        .map(([varianteId, nombre]) => ({ varianteId, nombre, points: ligne.pointsParVariante?.[varianteId] ?? ligne.points }))
      if (parVariante.length === 0) continue
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, exercice: { generatorId: config.generatorId, parVariante } })
    } else if (ligne.type === 'vraiFaux') {
      const config = themesPourSection(ligne.chapitreSlug, ligne.sectionId).find((t) => t.quizTheme === ligne.cle)
      if (!config) continue
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, vraiFaux: { chapitre: config.quizChapitre, theme: config.quizTheme, nombre: ligne.nombre } })
    } else {
      const banque = ligne.type === 'demonstration' ? deriveQuestionsOuvertes(ligne.chapitreSlug, section) : deriveQuestionsComprehension(ligne.chapitreSlug, section.id)
      const ouvertesParSerie = construireOuvertesParSerie(banque, ligne.nombre, nombreSeries)
      if (ouvertesParSerie[0].length > 0) items.push({ processus: ligne.processus, titreSection, points: ligne.points, ouvertesParSerie })
    }
  }

  if (items.length === 0) return null

  const base64 = encoderPayload({
    numero: entete.numero,
    date: entete.date,
    titre: entete.titre,
    niveauLabel: entete.niveauLabel,
    niveauNumero: entete.niveauNumero,
    heuresSemaine: entete.heuresSemaine,
    calculatrice: entete.calculatrice,
    nombreSeries,
    afficherTitresSection: entete.afficherTitresSection,
    mode: entete.mode,
    items,
  })
  return `${baseUrl}?d=${encodeURIComponent(base64)}`
}
