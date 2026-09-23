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

/** Seul ce chapitre a un « générateur d'évaluations » fonctionnel côté plateforme-maths — les
 * autres apparaissent dans le sélecteur mais restent désactivés. */
export const LEVELSLUG_FONCTIONNEL = '6e-6h'
export const CHAPITRE_FONCTIONNEL_SLUG = 'fonctions-reciproques-cyclometriques'
export const EVALUATION_BASE_URL = EVALUATION_BASE_URL_6E_6H

export type IdGenerateurPilote = '6gen1' | '6gen2' | '6gen3' | '6gen4' | '6gen5'

export interface SectionEvaluationConfig {
  sectionId: string
  generatorId: IdGenerateurPilote
  quizTheme: string
}

/** Correspondance section Math-Belgium ↔ générateur plateforme-maths ↔ thème de la banque vrai/faux
 * — établie à la main pour ce chapitre pilote (alignement 1:1 confirmé dans le code source de
 * plateforme-maths, voir `src/generateurs6e/quizFonctionsReciproquesCyclometriques/banque.ts`).
 * Chaque futur chapitre ajouté demandera sa propre table, construite au cas par cas. */
export const SECTIONS_EVALUATION_PILOTE: SectionEvaluationConfig[] = [
  { sectionId: 'reciproques', generatorId: '6gen1', quizTheme: 'injectiviteSurjectiviteBijectivite' },
  { sectionId: 'cyclometriques', generatorId: '6gen2', quizTheme: 'fonctionsCyclometriques' },
  { sectionId: 'equations', generatorId: '6gen3', quizTheme: 'equationsCyclometriques' },
  { sectionId: 'derivees', generatorId: '6gen4', quizTheme: 'deriveesCyclometriques' },
  { sectionId: 'graphiques', generatorId: '6gen5', quizTheme: 'graphiquesCyclometriques' },
]

export interface QuestionOuverte {
  enonce: string
  corrige: string
}

/** Retire la mini-syntaxe `RichText` (`$latex$`, `**gras**`, voir `.claude/rules/
 * content-authoring.md`) — la page d'évaluation de plateforme-maths affiche ce texte tel quel
 * (`texte(...)`, jamais interprété comme LaTeX/markdown), donc les délimiteurs doivent disparaître
 * avant l'envoi plutôt que s'afficher littéralement sur la copie imprimée. Le contenu LaTeX interne
 * reste visible en texte brut (ex. "f^{-1}") — imparfait mais lisible, amélioration possible d'un
 * lot futur (envoyer de vrais fragments latex/texte séparés plutôt qu'une chaîne aplatie). */
function nettoyerRichText(texte: string): string {
  return texte.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\$([^$]+)\$/g, '$1')
}

function extraireParagraphes(blocks: Block[]): string[] {
  return blocks.filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para').map((b) => nettoyerRichText(b.text))
}

/**
 * Dérive TOUTES les questions ouvertes exploitables d'une section — un bloc `exemple`/
 * `exempleLibre` de premier niveau = une question (jamais une banque dédiée à écrire, décision
 * prise avec l'utilisateur). Une section sans aucun de ces blocs (aucune formule/démonstration)
 * renvoie un tableau vide, conformément à la règle donnée : pas de question théorique là où il n'y
 * a ni formule ni démonstration.
 */
export function deriveQuestionsOuvertes(section: ChapterSection): QuestionOuverte[] {
  const candidats = section.blocks.filter(
    (b): b is Extract<Block, { kind: 'exemple' } | { kind: 'exempleLibre' }> => b.kind === 'exemple' || b.kind === 'exempleLibre',
  )

  return candidats.map((candidat) => {
    if (candidat.kind === 'exemple') {
      const enonceBrut = [candidat.badge, candidat.formula].filter(Boolean).join(' — ')
      const enonce = enonceBrut ? nettoyerRichText(enonceBrut) : "Résous l'exercice suivant."
      const etapes = candidat.steps.map((s) => `${nettoyerRichText(s.tag)} : ${nettoyerRichText(s.text)}`)
      const resultat = candidat.result.text ? [`${nettoyerRichText(candidat.result.tag)} : ${nettoyerRichText(candidat.result.text)}`] : []
      return { enonce, corrige: [...etapes, ...resultat].join('\n') }
    }

    const enonce = candidat.label ? nettoyerRichText(candidat.label) : 'Justifie le raisonnement suivant.'
    const corrige = extraireParagraphes(candidat.blocks).join('\n\n')
    return { enonce, corrige: corrige || 'Voir le cours.' }
  })
}

export type TypeQuestionEvaluation = 'ouverte' | 'vraiFaux' | 'exercice'
export type Processus = 1 | 2 | 3

export interface LigneSelection {
  sectionId: string
  processus: Processus
  type: TypeQuestionEvaluation
  /** 0 = ligne non incluse. */
  nombre: number
  /** Points par question (chaque question générée par cette ligne vaut ce nombre de points). */
  points: number
}

interface ItemPayload {
  processus: Processus
  titreSection: string
  points: number
  exercice?: { generatorId: IdGenerateurPilote; nombre: number }
  vraiFaux?: { theme: string; nombre: number }
  ouvertes?: QuestionOuverte[]
}

/** Encode un objet JS en base64 sûr pour l'UTF-8 (accents français compris) — décodage symétrique
 * côté plateforme-maths (`decodeURIComponent(escape(atob(...)))`, voir `AppEvaluation6e.tsx`). */
function encoderPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

export interface EnTeteEvaluation {
  numero: string
  date: string
  titre: string
  niveauLabel: string
}

/**
 * Construit l'URL complète vers le générateur d'évaluations à partir de la sélection de
 * l'utilisateur — `null` si aucune ligne active (rien à générer). `sections` doit être les sections
 * RÉELLES du chapitre choisi (pour dériver les questions ouvertes) — voir `chaptersIndex.ts`.
 */
export function buildEvaluationUrl(entete: EnTeteEvaluation, lignes: LigneSelection[], sections: ChapterSection[]): string | null {
  const items: ItemPayload[] = []

  for (const ligne of lignes) {
    if (ligne.nombre <= 0) continue
    const config = SECTIONS_EVALUATION_PILOTE.find((c) => c.sectionId === ligne.sectionId)
    const section = sections.find((s) => s.id === ligne.sectionId)
    if (!config || !section) continue

    const titreSection = `${section.number}. ${section.title}`

    if (ligne.type === 'exercice') {
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, exercice: { generatorId: config.generatorId, nombre: ligne.nombre } })
    } else if (ligne.type === 'vraiFaux') {
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, vraiFaux: { theme: config.quizTheme, nombre: ligne.nombre } })
    } else {
      const ouvertes = deriveQuestionsOuvertes(section).slice(0, ligne.nombre)
      if (ouvertes.length > 0) items.push({ processus: ligne.processus, titreSection, points: ligne.points, ouvertes })
    }
  }

  if (items.length === 0) return null

  const base64 = encoderPayload({ numero: entete.numero, date: entete.date, titre: entete.titre, niveauLabel: entete.niveauLabel, items })
  return `${EVALUATION_BASE_URL}?d=${encodeURIComponent(base64)}`
}
