import { useEffect, useId, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { aideDePage } from '../../lib/guideEleve'
import { decoder } from './BarreEleve'
import { IconeEleve } from './IconesEleve'
import { EVENEMENT_RELANCER_VISITE } from './VisiteAccueil'
import './guideEleve.css'

/**
 * Bouton « ? » de l'en-tête (côté élève, maquettes du 27/11/2026) : deux phrases — à quoi sert la page,
 * quoi faire. Texte choisi d'après l'adresse (`aideDePage`) ; rien sur les pages du professeur. Bulle
 * non modale sous le bouton : Échap ou un clic à côté la referment, le focus revient au bouton. Sur
 * l'accueil, « Revoir la visite guidée » relance les trois bulles de `VisiteAccueil`.
 */
export function AidePage() {
  const { pathname, hash } = useLocation()
  const aide = aideDePage(pathname, decoder(hash.slice(1)))
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  const bouton = useRef<HTMLButtonElement>(null)
  const bulle = useRef<HTMLDivElement>(null)

  // Changer de page referme la bulle.
  useEffect(() => setOuvert(false), [pathname, hash])

  useEffect(() => {
    if (!ouvert) return
    bulle.current?.focus()
    const touche = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      setOuvert(false)
      bouton.current?.focus()
    }
    const clic = (e: PointerEvent) => {
      const cible = e.target as Node
      if (!bulle.current?.contains(cible) && !bouton.current?.contains(cible)) setOuvert(false)
    }
    document.addEventListener('keydown', touche)
    document.addEventListener('pointerdown', clic)
    return () => {
      document.removeEventListener('keydown', touche)
      document.removeEventListener('pointerdown', clic)
    }
  }, [ouvert])

  if (!aide) return null
  const accueil = pathname === '/'
  return (
    <div className="ge-aide">
      <button
        ref={bouton}
        type="button"
        className="ge-aide-bouton"
        aria-expanded={ouvert}
        aria-controls={id}
        aria-label={`Aide : ${aide.titre}`}
        title="À quoi sert cette page ?"
        data-visite="aide"
        onClick={() => setOuvert((o) => !o)}
      >
        <IconeEleve nom="aide" taille={22} />
      </button>
      {ouvert && (
        <div ref={bulle} id={id} className="ge-aide-bulle" role="dialog" aria-label={`Aide : ${aide.titre}`} tabIndex={-1}>
          <p className="ge-aide-titre">{aide.titre}</p>
          <p>{aide.phrases[0]}</p>
          <p>{aide.phrases[1]}</p>
          <div className="ge-aide-actions">
            {accueil && (
              <button
                type="button"
                className="ge-lien-bouton"
                onClick={() => {
                  setOuvert(false)
                  window.dispatchEvent(new Event(EVENEMENT_RELANCER_VISITE))
                }}
              >
                Revoir la visite guidée
              </button>
            )}
            <button
              type="button"
              className="ge-bouton-discret"
              onClick={() => {
                setOuvert(false)
                bouton.current?.focus()
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
