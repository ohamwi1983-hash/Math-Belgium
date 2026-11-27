import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import type { Diapo as DonneesDiapo, Role } from '../../lib/projection/diapos'
import { useCompte } from '../../lib/compteContexte'
import { chargerDonneesMatiere, propositionDepuisSuivi, type DonneesMatiere } from '../../lib/projection/matiereDonnees'
import type { PropositionMatiere } from '../../lib/projection/matiereProjetee'
import { canalSuivi, ecrireSuivi, garderProposition, lireSuivi, oublierSuivi, retirerProposition, type SuiviProjection } from '../../lib/projection/suiviProjection'
import { FormulaireMatiere } from '../carnet/MatiereProjetee'
import type { ExportAnnote, FormatExport } from './ExportAnnote'
import { Pictogramme } from './Pictogrammes'

/**
 * Suivi de la matière MONTRÉE pendant une projection (chantier M, 27/11/2026) et proposition « Noter la matière
 * vue » à la fin. Seule la fenêtre qui pilote suit (un écran, ou la vue du professeur en deux écrans) : diapos
 * atteintes (`etat.index`), générateurs ouverts par le bouton « Ouvrir le générateur » (`a[data-generateur]` ;
 * dans la fenêtre des diapos, le clic est signalé à la vue du professeur par `BroadcastChannel`). Tout reste dans
 * ce navigateur (`suiviProjection.ts`). Le carnet (classes, horaire, agenda, séances) est lu en arrière-plan peu
 * après l'ouverture, pour que la proposition soit prête au moment de quitter.
 */
export function useMatiereProjection(chapter: ChapterContent, diapos: DonneesDiapo[], index: number, role: Role) {
  const suit = role !== 'diapos'
  const { levelSlug: niveau, slug } = chapter
  const suivi = useRef<SuiviProjection | null>(null)
  if (suivi.current === null) suivi.current = lireSuivi(niveau, slug)
  const decide = useRef(false)
  const compte = useCompte()
  const client = compte.client
  const [donnees, setDonnees] = useState<DonneesMatiere | null>(null)
  const donneesRef = useRef<DonneesMatiere | null>(null)
  donneesRef.current = donnees
  const diaposRef = useRef(diapos)
  diaposRef.current = diapos

  const ajouterGenerateur = useCallback(
    (id: string) => {
      const s = suivi.current!
      if (s.generateurs.includes(id)) return
      s.generateurs = [...s.generateurs, id]
      ecrireSuivi(niveau, slug, s)
    },
    [niveau, slug],
  )

  // Diapos atteintes.
  useEffect(() => {
    if (!suit) return
    const cle = diapos[index]?.cle
    const s = suivi.current!
    if (!cle || s.vues.includes(cle)) return
    s.vues = [...s.vues, cle]
    ecrireSuivi(niveau, slug, s)
  }, [suit, diapos, index, niveau, slug])

  // Générateurs ouverts : clic sur « Ouvrir le générateur » (le QR code scanné n'est pas compté).
  useEffect(() => {
    const canal = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(canalSuivi(niveau, slug))
    if (canal && suit)
      canal.onmessage = (e: MessageEvent<{ type?: string; id?: unknown }>) => {
        if (e.data?.type === 'generateur' && typeof e.data.id === 'string') ajouterGenerateur(e.data.id)
      }
    const surClic = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[data-generateur]')
      const id = a?.getAttribute('data-generateur')
      if (!id) return
      if (suit) ajouterGenerateur(id)
      else canal?.postMessage({ type: 'generateur', id })
    }
    document.addEventListener('click', surClic, true)
    // Clic du milieu / « ouvrir dans un nouvel onglet » au clavier : `auxclick`.
    document.addEventListener('auxclick', surClic, true)
    return () => {
      document.removeEventListener('click', surClic, true)
      document.removeEventListener('auxclick', surClic, true)
      canal?.close()
    }
  }, [suit, niveau, slug, ajouterGenerateur])

  // Carnet lu en arrière-plan (une panne ou un carnet absent : simplement rien à proposer).
  useEffect(() => {
    if (!suit || !client) return
    let vivant = true
    const t = window.setTimeout(() => {
      chargerDonneesMatiere(client).then(
        (d) => vivant && setDonnees(d),
        () => undefined,
      )
    }, 1200)
    return () => {
      vivant = false
      window.clearTimeout(t)
    }
  }, [suit, client])

  const calculer = useCallback((): PropositionMatiere | null => {
    if (!suit) return null
    return propositionDepuisSuivi(chapter, diaposRef.current.map((d) => ({ cle: d.cle, sectionId: d.section.id })), suivi.current!, donneesRef.current, Date.now())
  }, [suit, chapter])

  // Onglet fermé ou page quittée sans répondre (retour arrière…) : la proposition est gardée pour « Aujourd'hui »
  // et le tableau de bord (même id : remplacée, jamais doublée, si la page est seulement rechargée).
  useEffect(() => {
    if (!suit) return
    const garder = () => {
      if (decide.current) return
      const p = calculer()
      if (p) garderProposition(p)
    }
    window.addEventListener('pagehide', garder)
    return () => {
      window.removeEventListener('pagehide', garder)
      garder()
    }
  }, [suit, calculer])

  return {
    client,
    donnees,
    /** Proposition au moment de quitter (`null` : rien à proposer). */
    proposition: calculer,
    /** Matière enregistrée : plus rien à proposer pour cette séance de projection. */
    enregistree: () => {
      suivi.current!.enregistre = true
      ecrireSuivi(niveau, slug, suivi.current!)
      retirerProposition(suivi.current!.id)
    },
    /** « Plus tard » : gardée pour « Aujourd'hui » / le tableau de bord. */
    plusTard: (p: PropositionMatiere) => {
      garderProposition(p)
      decide.current = true
    },
    /** En quittant la projection : le suivi de cette séance est oublié (le prochain lancement repart de zéro). */
    terminer: () => {
      decide.current = true
      oublierSuivi(niveau, slug)
    },
  }
}

export type MatiereProjection = ReturnType<typeof useMatiereProjection>

/**
 * Boîte de fin de projection avec la proposition (maquette « fin-projection ») : la boîte « Télécharger tes
 * annotations ? » d'avant gagne la proposition — s'il y a des annotations, « Télécharger le PowerPoint annoté »
 * (et le PDF) restent dans la rangée d'actions. « Enregistrer dans Mes classes » → confirmation, puis
 * « Quitter la projection » ; « Plus tard » garde la proposition et quitte ; « Ne rien noter » quitte sans rien garder (`quitter` →
 * `terminer`) ; « Rester » (Échap) referme.
 */
export function DialogueFinProjection({
  proposition,
  matiere,
  exp,
  resume,
  annotations,
  quitter,
  fermer,
}: {
  proposition: PropositionMatiere
  matiere: MatiereProjection
  exp: ExportAnnote
  resume: { diapos: number; blanches: number }
  annotations: boolean
  quitter: () => void
  fermer: () => void
}) {
  const titreId = useId()
  const [fait, setFait] = useState<string | null>(null)
  const occupe = exp.etat.encours !== null
  const boite = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !occupe) {
        e.preventDefault()
        e.stopImmediatePropagation()
        fermer()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [fermer, occupe])
  useEffect(() => {
    boite.current?.querySelector<HTMLElement>('[data-autofocus], .mv-bouton.principal')?.focus({ preventScroll: true })
  }, [fait])

  const telecharger = (f: FormatExport) => void exp.lancer(f)
  const boutonsAnnotations = annotations ? (
    <>
      <button type="button" className="mv-bouton" disabled={occupe} onClick={() => telecharger('pptx')}>
        <Pictogramme nom="telecharger" taille={18} /> Télécharger le PowerPoint annoté
      </button>
      <button type="button" className="mv-bouton" disabled={occupe} onClick={() => telecharger('pdf')}>
        PDF annoté
      </button>
    </>
  ) : null
  const texteAnnotations = annotations ? `${[resume.diapos ? `${resume.diapos} diapo${resume.diapos > 1 ? 's' : ''} annotée${resume.diapos > 1 ? 's' : ''}` : '', resume.blanches ? `${resume.blanches} page${resume.blanches > 1 ? 's' : ''} blanche${resume.blanches > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ')} : elles restent gardées dans ce navigateur.` : null

  return (
    <div className="mv-voile" role="dialog" aria-modal="true" aria-labelledby={titreId} onClick={(e) => e.stopPropagation()}>
      <div className="mv-dialogue theme-clair" ref={boite}>
        {fait ? (
          <div className="mv">
            <p className="mv-surtitre">Fin de la projection</p>
            <h2 id={titreId} className="mv-titre">
              Matière vue enregistrée
            </h2>
            <p className="mv-succes" role="status">
              ✓ {fait} Tu la retrouves dans Mes classes.
            </p>
            {texteAnnotations && <p className="mv-annotations">{texteAnnotations}</p>}
            <div className="mv-actions">
              <button type="button" className="mv-bouton principal" data-autofocus disabled={occupe} onClick={quitter}>
                Quitter la projection
              </button>
              {boutonsAnnotations}
              <span className="mv-espace" aria-hidden="true" />
              <button type="button" className="mv-bouton" disabled={occupe} onClick={fermer}>
                Rester
              </button>
            </div>
          </div>
        ) : matiere.client && matiere.donnees ? (
          <>
            <FormulaireMatiere
              proposition={proposition}
              donnees={matiere.donnees}
              client={matiere.client}
              titreId={titreId}
              surtitre="Fin de la projection"
              enPlus={boutonsAnnotations}
              onPlusTard={() => {
                matiere.plusTard(proposition)
                quitter()
              }}
              onRienNoter={quitter}
              onEnregistre={(r) => {
                matiere.enregistree()
                setFait(r.message)
              }}
            />
            {texteAnnotations && <p className="mv-annotations">{texteAnnotations}</p>}
            <button type="button" className="mv-lien mv-rester" disabled={occupe} onClick={fermer}>
              Rester dans la projection
            </button>
          </>
        ) : null}
        <p className={`mv-etat${exp.etat.erreur ? ' erreur' : ''}`} role="status" aria-live="polite">
          {exp.etat.texte}
        </p>
      </div>
    </div>
  )
}
