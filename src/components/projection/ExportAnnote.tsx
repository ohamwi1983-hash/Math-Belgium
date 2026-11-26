import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { ChoixProjection, Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { resumeAnnotations } from '../../lib/projection/annotations'
import type { MagasinAnnotations } from './magasinAnnotations'
import { donneesAnnotations, useVersionAnnotations } from './magasinAnnotations'
import { Pictogramme } from './Pictogrammes'
import type { EtatProjection } from './useProjection'

export type FormatExport = 'pptx' | 'pdf'

export interface EtatExport {
  encours: FormatExport | null
  texte: string
  erreur: boolean
}

/**
 * Export annoté depuis la projection : les MÊMES diapos (déjà découpées) avec les annotations de chaque diapo
 * en image transparente par-dessus et les pages de l'écran blanc insérées après leur diapo
 * (`lib/projection/exportPptx.tsx`, chargé à la demande avec `pptxgenjs` ou `jspdf`).
 */
export function useExportAnnote(chapter: ChapterContent, choix: Pick<ChoixProjection, 'etapes' | 'inclure'>, diapos: DonneesDiapo[], annotations: MagasinAnnotations, etat: EtatProjection) {
  const [e, setE] = useState<EtatExport>({ encours: null, texte: '', erreur: false })
  const etatRef = useRef(etat)
  etatRef.current = etat
  const enCours = useRef(false)
  const lancer = useCallback(
    async (format: FormatExport): Promise<boolean> => {
      if (enCours.current) return false
      enCours.current = true
      const nom = format === 'pptx' ? 'PowerPoint' : 'PDF'
      setE({ encours: format, texte: `Préparation du ${nom}…`, erreur: false })
      try {
        const { telechargerProjection } = await import('../../lib/projection/exportPptx')
        await telechargerProjection(chapter, choix, {
          format,
          annotations: donneesAnnotations(annotations, etatRef.current),
          diapos,
          progression: (fait, n) => setE({ encours: format, texte: `${nom} : diapo ${fait} sur ${n}…`, erreur: false }),
        })
        setE({ encours: null, texte: `${nom} annoté téléchargé.`, erreur: false })
        return true
      } catch (err) {
        console.warn('Export annoté', err)
        setE({ encours: null, texte: `Le ${nom} n’a pas pu être préparé. Réessaie dans un instant.`, erreur: true })
        return false
      } finally {
        enCours.current = false
      }
    },
    [chapter, choix, diapos, annotations],
  )
  return { etat: e, lancer }
}

export type ExportAnnote = ReturnType<typeof useExportAnnote>

/** Nombre de diapos annotées / pages blanches (pour les intitulés et la boîte « Quitter »). */
export function useResume(annotations: MagasinAnnotations, etat: EtatProjection) {
  useVersionAnnotations(annotations)
  return resumeAnnotations({ pages: annotations.instantane(), blanches: etat.blanches })
}

function texteResume(r: { diapos: number; blanches: number }): string {
  const morceaux: string[] = []
  if (r.diapos) morceaux.push(`${r.diapos} diapo${r.diapos > 1 ? 's' : ''} annotée${r.diapos > 1 ? 's' : ''}`)
  if (r.blanches) morceaux.push(`${r.blanches} page${r.blanches > 1 ? 's' : ''} blanche${r.blanches > 1 ? 's' : ''}`)
  return morceaux.length ? morceaux.join(' · ') : 'Aucune annotation pour l’instant'
}

/**
 * Palette « Télécharger » (barre d'outils ; menu de la vue du professeur) : PowerPoint annoté, PDF annoté,
 * « Nouvelle séance » (efface tout pour ce chapitre, après confirmation DANS la page).
 */
export function PaletteExport({ exp, resume, nouvelleSeance, compacte = false }: { exp: ExportAnnote; resume: { diapos: number; blanches: number }; nouvelleSeance: () => void; compacte?: boolean }) {
  const [confirmer, setConfirmer] = useState(false)
  const occupe = exp.etat.encours !== null
  return (
    <div className={`projection-palette projection-palette--export${compacte ? ' compacte' : ''}`} role="group" aria-label="Télécharger les annotations">
      {confirmer ? (
        <div className="export-confirmer" role="alertdialog" aria-labelledby="export-seance-titre" aria-describedby="export-seance-texte">
          <p id="export-seance-titre" className="export-titre">
            Nouvelle séance ?
          </p>
          <p id="export-seance-texte" className="export-texte">
            Toutes les annotations et les pages blanches de ce chapitre seront effacées, dans ce navigateur. Télécharge-les d’abord si tu veux les garder.
          </p>
          <button
            type="button"
            className="projection-duree projection-duree--stop"
            autoFocus
            onClick={() => {
              setConfirmer(false)
              nouvelleSeance()
            }}
          >
            Tout effacer
          </button>
          <button type="button" className="projection-duree" onClick={() => setConfirmer(false)}>
            Annuler
          </button>
        </div>
      ) : (
        <>
          <span className="projection-palette-nom" aria-hidden="true">
            Télécharger
          </span>
          <button type="button" className="projection-duree export-bouton" disabled={occupe} title="Les diapos et tes annotations (image à part, à supprimer si besoin), pages blanches comprises" onClick={() => void exp.lancer('pptx')}>
            <Pictogramme nom="telecharger" taille={18} /> PowerPoint annoté
          </button>
          <button type="button" className="projection-duree export-bouton" disabled={occupe} title="Une page par diapo, annotations et pages blanches comprises" onClick={() => void exp.lancer('pdf')}>
            <Pictogramme nom="telecharger" taille={18} /> PDF annoté
          </button>
          <span className="export-resume">{exp.etat.texte || texteResume(resume)}</span>
          <span className="projection-separateur" aria-hidden="true" />
          <button type="button" className="projection-duree" disabled={occupe} title="Effacer toutes les annotations de ce chapitre (après confirmation)" onClick={() => setConfirmer(true)}>
            Nouvelle séance
          </button>
        </>
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {exp.etat.texte}
      </span>
    </div>
  )
}

/**
 * « Quitter » avec des annotations : « Télécharger tes annotations ? PowerPoint · PDF · Quitter sans télécharger »
 * (elles restent de toute façon gardées dans ce navigateur). Après un téléchargement réussi, on quitte.
 */
export function DialogueQuitter({ exp, resume, quitter, fermer }: { exp: ExportAnnote; resume: { diapos: number; blanches: number }; quitter: () => void; fermer: () => void }) {
  const occupe = exp.etat.encours !== null
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !occupe) {
        e.preventDefault()
        e.stopPropagation()
        fermer()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [fermer, occupe])
  const telecharger = async (f: FormatExport) => {
    if (await exp.lancer(f)) quitter()
  }
  return (
    <div className="projection-accueil projection-dialogue" role="alertdialog" aria-modal="true" aria-labelledby="quitter-titre" aria-describedby="quitter-texte" onClick={(e) => e.stopPropagation()}>
      <div>
        <h2 id="quitter-titre">Télécharger tes annotations ?</h2>
        <p id="quitter-texte">
          {texteResume(resume)}. Elles restent gardées dans ce navigateur : tu les retrouveras en relançant la projection de ce chapitre.
        </p>
        <div className="projection-accueil-actions">
          <button type="button" className="projection-bouton-plein" autoFocus disabled={occupe} onClick={() => void telecharger('pptx')}>
            <Pictogramme nom="telecharger" /> PowerPoint
          </button>
          <button type="button" className="projection-bouton-plein" disabled={occupe} onClick={() => void telecharger('pdf')}>
            <Pictogramme nom="telecharger" /> PDF
          </button>
          <button type="button" className="projection-bouton" disabled={occupe} onClick={quitter}>
            Quitter sans télécharger
          </button>
          <button type="button" className="projection-bouton" disabled={occupe} onClick={fermer}>
            Rester
          </button>
        </div>
        <p className={`projection-dialogue-etat${exp.etat.erreur ? ' erreur' : ''}`} role="status" aria-live="polite">
          {exp.etat.texte}
        </p>
      </div>
    </div>
  )
}
