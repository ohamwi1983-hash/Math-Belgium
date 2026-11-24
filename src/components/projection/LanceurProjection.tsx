import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChapterContent } from '../../content/types'
import type { Aller } from '../chapter/CarteChapitre'
import { lireParcours, titreCourt } from '../../lib/parcoursChapitre'
import type { ChoixProjection, Inclusion } from '../../lib/projection/diapos'
import { INCLUSIONS, INCLUSIONS_DEFAUT, diaposEtape, enregistrerChoix, lireChoix, urlProjection } from '../../lib/projection/diapos'
import { ouvrirFenetreDiapos } from '../../lib/projection/fenetre'
import { GardeProfesseur } from './GardeProfesseur'
import { Pictogramme } from './Pictogrammes'
import './lanceur.css'

/**
 * Vue `#projeter` de la page du chapitre (maquette « Main », téléphone d'abord) : étapes à projeter,
 * contenus à inclure, un ou deux écrans, « Lancer », « Télécharger en PowerPoint ». Réservée au
 * professeur connecté (`GardeProfesseur`). Choix mémorisé dans le navigateur (`projection:{niveau}/{slug}`).
 * Rendue seulement quand le fragment vaut `#projeter` : la page pré-rendue n'en contient rien.
 */
export default function LanceurProjection({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  return (
    <section className="lanceur-projection no-export" aria-labelledby="lanceur-titre">
      <GardeProfesseur retour={`/${chapter.levelSlug}/${chapter.slug}#projeter`}>
        <Lanceur chapter={chapter} aller={aller} />
      </GardeProfesseur>
    </section>
  )
}

function Lanceur({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  const navigate = useNavigate()
  const [choix, setChoix] = useState<ChoixProjection>(() => {
    const derniere = lireParcours(chapter).derniere
    const premiere = chapter.sections.find((s) => s.id === derniere) ?? chapter.sections[0]
    return lireChoix(chapter, { etapes: premiere ? [premiere.id] : [], inclure: INCLUSIONS_DEFAUT, ecran: 'un' })
  })
  const [export_, setExport] = useState<{ etat: 'pret' | 'encours' | 'erreur' | 'fait'; texte?: string }>({ etat: 'pret' })
  const titre = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    enregistrerChoix(chapter, choix)
  }, [chapter, choix])
  useEffect(() => {
    titre.current?.focus({ preventScroll: true })
  }, [])

  const compte = useMemo(() => Object.fromEntries(chapter.sections.map((s) => [s.id, diaposEtape(s, choix.inclure).length])), [chapter, choix.inclure])
  const total = choix.etapes.reduce((n, id) => n + (compte[id] ?? 0), 0)
  const toutes = choix.etapes.length === chapter.sections.length

  const basculerEtape = (id: string) =>
    setChoix((c) => ({ ...c, etapes: c.etapes.includes(id) ? c.etapes.filter((e) => e !== id) : chapter.sections.filter((s) => s.id === id || c.etapes.includes(s.id)).map((s) => s.id) }))
  const basculerInclusion = (i: Inclusion) => setChoix((c) => ({ ...c, inclure: c.inclure.includes(i) ? c.inclure.filter((x) => x !== i) : [...c.inclure, i] }))

  function lancer() {
    if (choix.etapes.length === 0) return
    enregistrerChoix(chapter, choix)
    const pleinEcran = () => {
      const el = document.documentElement
      if (document.fullscreenEnabled && el.requestFullscreen && !document.fullscreenElement) el.requestFullscreen().catch(() => undefined)
    }
    if (choix.ecran === 'deux') {
      // `window.open` DANS le clic (sinon bloquée). Refusée : repli sur un écran, avec message.
      const f = ouvrirFenetreDiapos(urlProjection(chapter, choix, 'diapos'))
      if (!f) {
        pleinEcran()
        navigate(urlProjection(chapter, choix, 'seul', { repli: '1' }))
        return
      }
      navigate(urlProjection(chapter, choix, 'prof'))
      return
    }
    pleinEcran()
    navigate(urlProjection(chapter, choix, 'seul'))
  }

  async function telecharger() {
    if (choix.etapes.length === 0 || export_.etat === 'encours') return
    setExport({ etat: 'encours', texte: 'Préparation des diapos…' })
    try {
      const { telechargerPptx } = await import('../../lib/projection/exportPptx')
      await telechargerPptx(chapter, choix, (fait, n) => setExport({ etat: 'encours', texte: `Diapo ${fait} sur ${n}…` }))
      setExport({ etat: 'fait', texte: 'PowerPoint téléchargé.' })
    } catch (err) {
      console.warn('Export PowerPoint', err)
      setExport({ etat: 'erreur', texte: 'Le PowerPoint n’a pas pu être préparé. Réessaie ; si cela se reproduit, choisis moins d’étapes.' })
    }
  }

  return (
    <div className="lanceur">
      <div className="lanceur-tete">
        <h1 id="lanceur-titre" ref={titre} tabIndex={-1}>
          Projeter en classe
        </h1>
        <button type="button" className="lanceur-fermer" aria-label="Fermer et revenir à la carte du chapitre" onClick={() => aller(null)}>
          <Pictogramme nom="fermer" taille={22} />
        </button>
      </div>
      <p className="lanceur-intro">Les diapos sont tirées du chapitre : titre, L’essentiel, figures, exemples révélés pas à pas, cartes « Teste-toi ». Le texte long du cours n’y est pas.</p>

      <fieldset className="lanceur-groupe">
        <legend className="lanceur-legende">
          Étapes à projeter
          <button type="button" className="lanceur-lien" onClick={() => setChoix((c) => ({ ...c, etapes: toutes ? [] : chapter.sections.map((s) => s.id) }))}>
            {toutes ? 'Aucune' : 'Toutes'}
          </button>
        </legend>
        <ul className="lanceur-etapes">
          {chapter.sections.map((s) => {
            const coche = choix.etapes.includes(s.id)
            return (
              <li key={s.id}>
                <label className="lanceur-etape">
                  <input type="checkbox" checked={coche} onChange={() => basculerEtape(s.id)} />
                  <span className="lanceur-case" aria-hidden="true">
                    {coche && <Pictogramme nom="coche" taille={15} />}
                  </span>
                  <span className="lanceur-num">{s.number}</span>
                  <span className="lanceur-nom">{titreCourt(s)}</span>
                  {coche && <span className="lanceur-compte">{compte[s.id]} diapos</span>}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <fieldset className="lanceur-groupe">
        <legend className="lanceur-legende">Inclure</legend>
        <div className="lanceur-inclure">
          {INCLUSIONS.map((i) => {
            const coche = choix.inclure.includes(i.id)
            return (
              <label key={i.id} className="lanceur-option">
                <input type="checkbox" checked={coche} onChange={() => basculerInclusion(i.id)} />
                <span className="lanceur-case" aria-hidden="true">
                  {coche && <Pictogramme nom="coche" taille={15} />}
                </span>
                <span>{i.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="lanceur-groupe">
        <legend className="lanceur-legende">Écran</legend>
        <div className="lanceur-ecrans">
          {(
            [
              ['un', 'Un écran'],
              ['deux', 'Deux écrans : notes + diapo suivante sur le portable'],
            ] as const
          ).map(([v, l]) => (
            <label key={v} className={`lanceur-puce${choix.ecran === v ? ' actif' : ''}`}>
              <input type="radio" name="lanceur-ecran" value={v} checked={choix.ecran === v} onChange={() => setChoix((c) => ({ ...c, ecran: v }))} />
              {l}
            </label>
          ))}
        </div>
      </fieldset>

      <p className="lanceur-total" aria-live="polite">
        {choix.etapes.length === 0 ? 'Coche au moins une étape.' : `${total} diapos · ${choix.etapes.length} étape${choix.etapes.length > 1 ? 's' : ''}`}
      </p>
      <button type="button" className="lanceur-lancer" onClick={lancer} disabled={choix.etapes.length === 0}>
        <Pictogramme nom="ecran" taille={18} />
        {choix.ecran === 'deux' ? 'Lancer (deux écrans)' : 'Lancer (plein écran)'}
      </button>
      <button type="button" className="lanceur-pptx" onClick={() => void telecharger()} disabled={choix.etapes.length === 0 || export_.etat === 'encours'} aria-describedby="lanceur-pptx-etat">
        <Pictogramme nom="telecharger" taille={18} />
        Télécharger en PowerPoint
      </button>
      <p id="lanceur-pptx-etat" className={`lanceur-etat${export_.etat === 'erreur' ? ' erreur' : ''}`} role="status" aria-live="polite">
        {export_.texte ?? ''}
      </p>
      <p className="lanceur-aide">Pendant la projection : flèches, Page préc. / suiv. (télécommande) ou Espace pour avancer ; B écran blanc ; G ou Échap vue d’ensemble ; S stylo ; F plein écran.</p>
    </div>
  )
}
