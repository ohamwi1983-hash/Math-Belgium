import type { Block, ChapterSection } from '../content/types'

/**
 * Pont vers le « Générateur d'évaluations » de plateforme-maths (`/6e-6h/evaluation`) — /admin
 * construit un payload compact (identifiants seulement pour les exercices générés et le vrai/faux,
 * plateforme-maths ayant déjà ces données ; texte complet pour les questions ouvertes, dérivées ici
 * du contenu déjà écrit dans ce dépôt) et ouvre cette URL. Portée de ce premier lot (pilote) :
 * 6e (6h), Chapitre 1 — Fonctions réciproques & cyclométriques, ses 5 sections. Voir le plan
 * approuvé pour le détail de l'architecture (query string base64, pas de backend).
 */

export const EVALUATION_BASE_URL = 'https://plateforme-maths.vercel.app/6e-6h/evaluation'

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
 * Dérive une question ouverte à partir du premier bloc `exemple`/`exempleLibre` « exploitable » de
 * la section — jamais une banque dédiée à écrire (décision prise avec l'utilisateur). Préfère un
 * exemple concret à une démonstration formelle (label commençant par « Démonstration — ») quand les
 * deux existent, une démonstration restant néanmoins une question ouverte valide (justification
 * rédigée) à défaut d'exemple concret dans la section. `null` si la section n'a ni l'un ni l'autre.
 */
export function deriveQuestionOuverte(section: ChapterSection): QuestionOuverte | null {
  const exemples = section.blocks.filter(
    (b): b is Extract<Block, { kind: 'exemple' } | { kind: 'exempleLibre' }> => b.kind === 'exemple' || b.kind === 'exempleLibre',
  )
  if (exemples.length === 0) return null

  const candidat =
    exemples.find((b) => b.kind === 'exemple') ??
    exemples.find((b) => b.kind === 'exempleLibre' && !(b.label ?? '').startsWith('Démonstration')) ??
    exemples[0]

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
}

export type TypeQuestionEvaluation = 'exercice' | 'vraiFaux' | 'ouverte'

export interface LigneSelection {
  sectionId: string
  type: TypeQuestionEvaluation
  active: boolean
  points: number
  /** Uniquement pour `type === 'vraiFaux'` — nombre de questions piochées dans la banque. */
  nombreVraiFaux?: number
}

interface ItemPayload {
  titreSection: string
  points: number
  exercice?: { generatorId: IdGenerateurPilote }
  vraiFaux?: { theme: string; nombre: number }
  ouverte?: QuestionOuverte
}

/** Encode un objet JS en base64 sûr pour l'UTF-8 (accents français compris) — décodage symétrique
 * côté plateforme-maths (`decodeURIComponent(escape(atob(...)))`, voir `AppEvaluation6e.tsx`). */
function encoderPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

/**
 * Construit l'URL complète vers `/6e-6h/evaluation` à partir de la sélection de l'utilisateur —
 * `null` si aucune ligne active (rien à générer). `sections` doit être les sections RÉELLES du
 * chapitre pilote (pour dériver les questions ouvertes) — voir `chaptersIndex.ts`.
 */
export function buildEvaluationUrl(titre: string, lignes: LigneSelection[], sections: ChapterSection[]): string | null {
  const items: ItemPayload[] = []

  for (const ligne of lignes) {
    if (!ligne.active) continue
    const config = SECTIONS_EVALUATION_PILOTE.find((c) => c.sectionId === ligne.sectionId)
    const section = sections.find((s) => s.id === ligne.sectionId)
    if (!config || !section) continue

    const titreSection = `${section.number}. ${section.title}`

    if (ligne.type === 'exercice') {
      items.push({ titreSection, points: ligne.points, exercice: { generatorId: config.generatorId } })
    } else if (ligne.type === 'vraiFaux') {
      items.push({ titreSection, points: ligne.points, vraiFaux: { theme: config.quizTheme, nombre: ligne.nombreVraiFaux ?? 3 } })
    } else {
      const ouverte = deriveQuestionOuverte(section)
      if (ouverte) items.push({ titreSection, points: ligne.points, ouverte })
    }
  }

  if (items.length === 0) return null

  const base64 = encoderPayload({ titre, items })
  return `${EVALUATION_BASE_URL}?d=${encodeURIComponent(base64)}`
}
