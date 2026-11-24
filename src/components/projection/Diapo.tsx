import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChapterContent, InteractiveWidgetTag } from '../../content/types'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { RichText } from '../Math'
import { BlockRenderer } from '../chapter/BlockRenderer'
import { Illustration } from '../illustrations/Illustration'
import { InteractiveWidget } from '../chapter/InteractiveWidget'
import { titreCourt } from '../../lib/parcoursChapitre'
import { Pictogramme } from './Pictogrammes'
import './projection.css'

/**
 * Une diapo 16:9 dessinée à 1 280 × 720 px LOGIQUES (la scène la met à l'échelle de l'écran), fond
 * clair (tableau blanc) dans les deux thèmes (`.theme-clair` redéfinit les jetons du site : figures,
 * encadrés, KaTeX restent clairs). Composants du site réutilisés tels quels : `RichText` (KaTeX),
 * `Illustration`, `BlockRenderer`, `InteractiveWidget` (atelier manipulé en direct).
 *
 * Modes : `direct` (projection, révélation pas à pas), `vignette` (vue d'ensemble, diapo suivante :
 * atelier non monté), `export` (PowerPoint : tout révélé, atelier monté pour être photographié),
 * `mesure` (découpage des exemples trop longs : tout révélé, aucun ajustement).
 */
export type ModeDiapo = 'direct' | 'vignette' | 'export' | 'mesure'

export const DUREE_CARTE = 60

export function Diapo({ diapo, chapter, pas, mode, debut }: { diapo: DonneesDiapo; chapter: ChapterContent; pas: number; mode: ModeDiapo; debut?: number }) {
  const contenu = useRef<HTMLDivElement>(null)
  const racine = useRef<HTMLDivElement>(null)
  const toutVisible = mode === 'export' || mode === 'mesure'
  const p = toutVisible ? diapo.pas : Math.min(pas, diapo.pas)
  useAjustement(racine, contenu, mode !== 'mesure' && diapo.type !== 'atelier', diapo.cle)

  return (
    <div ref={racine} className={`diapo theme-clair diapo--${diapo.type}`} data-mode={mode} data-cle={diapo.cle}>
      <div className="diapo-filet" aria-hidden="true" />
      <div ref={contenu} className="diapo-contenu">
        <div className="diapo-pile">{corps(diapo, chapter, p, mode, toutVisible, debut)}</div>
      </div>
    </div>
  )
}

function sansPrefixe(label: string): string {
  return label.replace(/^(d[ée]monstration|exemple résolu)\s*[—–:-]\s*/i, '').replace(/^(d[ée]monstration|exemple résolu)\s*/i, '') || label
}

/** Longueur « visible » d'un texte RichText (une formule compte pour quelques caractères). */
function longueur(t: string): number {
  return t.replace(/\$[^$]+\$/g, 'xxxxxx').replace(/\*\*/g, '').length
}

function majuscule(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function corps(d: DonneesDiapo, chapter: ChapterContent, pas: number, mode: ModeDiapo, toutVisible: boolean, debut?: number): ReactNode {
  switch (d.type) {
    case 'titre':
      return (
        <>
          <p className="diapo-surtitre" data-pptx="">
            {chapter.level} · Chapitre {chapter.chapterNumber} · {chapter.title}
          </p>
          <p className="diapo-etape" data-pptx="">
            Étape {d.section.number}
            {d.section.partie ? ` · ${d.section.partie}` : ''}
          </p>
          <h1 className="diapo-grand-titre" data-pptx="">
            <RichText text={d.section.title} />
          </h1>
          {d.section.kicker && (
            <p className="diapo-sous-titre" data-pptx="">
              {majuscule(d.section.kicker)}
            </p>
          )}
          {d.intertitres.length > 0 && (
            <ul className="diapo-puces">
              {d.intertitres.slice(0, 5).map((t, i) => (
                <li key={i}>
                  <RichText text={t} />
                </li>
              ))}
            </ul>
          )}
        </>
      )
    case 'essentiel':
      return (
        <>
          <p className="diapo-surtitre" data-pptx="">
            L’essentiel
          </p>
          <h2 className="diapo-titre" data-pptx="">
            {titreCourt(d.section)}
          </h2>
          <div className={`diapo-corps${d.figure ? ' avec-figure' : ''}`}>
            <ul className="diapo-phrases">
              {d.phrases.map((ph, i) => (
                <li key={i} data-pptx="">
                  <RichText text={ph} />
                </li>
              ))}
            </ul>
            {d.figure && (
              <div className="diapo-figure">
                <BlockRenderer block={d.figure} />
              </div>
            )}
          </div>
        </>
      )
    case 'figure':
      return (
        <>
          <p className="diapo-surtitre" data-pptx="">
            Figure · {titreCourt(d.section)}
          </p>
          <h2 className="diapo-titre diapo-titre--moyen" data-pptx="">
            <RichText text={d.titre} />
          </h2>
          <div className="diapo-corps">
            <div className="diapo-figure diapo-figure--seule">
              <BlockRenderer block={d.figure} />
            </div>
          </div>
        </>
      )
    case 'exemple': {
      const revelees = pas
      const etape = d.debut + revelees
      return (
        <>
          <p className="diapo-surtitre" data-pptx="">
            Exemple résolu
            {toutVisible || revelees === 0 ? (d.total > 1 ? ` · ${d.total} étapes` : '') : ` · étape ${etape} sur ${d.total}`}
            {d.debut > 0 ? ' · suite' : ''}
          </p>
          <h2 className={`diapo-titre diapo-titre--enonce${d.enonce && longueur(d.enonce) > 80 ? ' est-long' : ''}`} data-pptx="">
            {d.enonce ? <RichText text={d.enonce} /> : d.badge ? majuscule(d.badge) : 'Exemple résolu'}
          </h2>
          {d.enonce && d.badge && <p className="diapo-badge">{d.badge}</p>}
          <div className={`diapo-corps${d.illustration ? ' avec-figure' : ''}`}>
            <ol className="diapo-lignes" data-zone-mesure="">
              {d.lignes.map((l, i) => {
                const etat = toutVisible ? 'revelee' : i < revelees - 1 ? 'faite' : i === revelees - 1 ? 'courante' : 'future'
                return (
                  <li key={i} className={`diapo-ligne etat-${etat}${l.resultat ? ' diapo-resultat' : ''}${l.vide ? ' est-vide' : ''}${l.tag.length > 16 ? ' tag-long' : ''}`} data-mesure="">
                    <span className="diapo-ligne-tag">
                      <span className="diapo-rond" aria-hidden="true">
                        {l.resultat ? '✓' : d.debut + i + 1}
                      </span>
                      {l.tag && <span className="diapo-ligne-nom">{l.tag}</span>}
                    </span>
                    <span className="diapo-ligne-texte">
                      <span className="diapo-ligne-contenu">
                        <RichText text={l.text} />
                      </span>
                      {etat === 'future' && <span className="diapo-cache" aria-hidden="true" />}
                      {etat === 'future' && i === revelees && mode === 'direct' && <span className="diapo-indice">→ clic ou espace pour révéler</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
            {d.illustration && (
              <div className="diapo-figure">
                <Illustration spec={d.illustration} />
              </div>
            )}
          </div>
        </>
      )
    }
    case 'libre': {
      const visibles = pas
      const reste = d.blocs.length - 1 - visibles
      return (
        <>
          <p className="diapo-surtitre" data-pptx="">
            {d.demo ? 'Démonstration' : 'Exemple résolu'}
            {d.debut > 0 ? ' · suite' : ''}
          </p>
          <h2 className="diapo-titre diapo-titre--moyen" data-pptx="">
            {majuscule(sansPrefixe(d.label))}
          </h2>
          <div className="diapo-corps">
            <div className="diapo-blocs" data-zone-mesure="">
              {d.blocs.map((b, i) => {
                const etat = toutVisible ? 'revelee' : i < visibles ? 'faite' : i === visibles ? (visibles > 0 ? 'courante' : 'faite') : 'future'
                return (
                  <div key={i} className={`diapo-bloc etat-${etat}`} data-mesure="">
                    <BlockRenderer block={b} />
                  </div>
                )
              })}
            </div>
          </div>
          {!toutVisible && mode === 'direct' && reste > 0 && <p className="diapo-indice diapo-indice--bas">→ clic ou espace : la suite ({reste})</p>}
        </>
      )
    }
    case 'teste':
      return (
        <>
          <p className="diapo-surtitre diapo-surtitre--teste" data-pptx="">
            Teste-toi · 1 minute{d.nombre > 1 ? ` · carte ${d.numero} sur ${d.nombre}` : ''}
          </p>
          <h2 className={`diapo-titre diapo-titre--question${longueur(d.question) > 90 ? ' est-long' : ''}`} data-pptx="">
            <RichText text={d.question} />
          </h2>
          {!toutVisible && (
            <div className="diapo-chrono-ligne">
              {pas < 1 ? (
                <>
                  <Chrono debut={debut} duree={DUREE_CARTE} fige={mode !== 'direct'} />
                  <span className="diapo-chrono-aide">Espace : afficher la réponse</span>
                </>
              ) : (
                <span className="diapo-chrono-aide">Réponse</span>
              )}
            </div>
          )}
          <div className={`diapo-reponse${pas >= 1 ? '' : ' est-cachee'}`}>
            {toutVisible && <span className="diapo-reponse-tag">Réponse</span>}
            <span className="diapo-reponse-texte" data-pptx="">
              <RichText text={d.reponse} />
            </span>
          </div>
        </>
      )
    case 'atelier':
      return (
        <>
          <p className="diapo-surtitre diapo-surtitre--atelier" data-pptx="">
            Atelier · à manipuler en direct
          </p>
          <h2 className="diapo-titre diapo-titre--moyen" data-pptx="">
            {d.label}
          </h2>
          <ZoneAtelier tag={d.tag} monte={mode === 'direct' || mode === 'export'} />
        </>
      )
  }
}

/** Atelier monté en direct, mis à l'échelle (`zoom`) pour tenir dans sa zone de la diapo. */
function ZoneAtelier({ tag, monte }: { tag: InteractiveWidgetTag; monte: boolean }) {
  const zone = useRef<HTMLDivElement>(null)
  const hote = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const z = zone.current
    const h = hote.current
    if (!monte || !z || !h) return
    const ajuster = () => {
      h.style.zoom = '1'
      const largeur = h.offsetWidth
      const hauteur = h.scrollHeight
      if (!largeur || !hauteur) return
      // Tient dans la zone si possible ; jamais sous 0,8 (l'atelier doit rester manipulable : au-delà,
      // la zone défile verticalement), jamais au-delà de la largeur disponible.
      const largeurMax = (z.clientWidth - 8) / largeur
      const f = Math.min(1.5, largeurMax, Math.max(0.8, (z.clientHeight - 8) / hauteur))
      h.style.zoom = String(Math.round(f * 100) / 100)
    }
    ajuster()
    const ro = new ResizeObserver(() => ajuster())
    ro.observe(h)
    const mo = new MutationObserver(() => ajuster())
    mo.observe(h, { childList: true, subtree: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [monte, tag])
  return (
    <div ref={zone} className="diapo-atelier">
      {monte ? (
        <div ref={hote} className="diapo-atelier-hote">
          <InteractiveWidget tag={tag} figuresTactiles sansEpingle />
        </div>
      ) : (
        <div className="diapo-atelier-vide">
          <Pictogramme nom="main" taille={56} />
          <span>Atelier interactif</span>
        </div>
      )}
    </div>
  )
}

/** Minuteur d'une carte « Teste-toi » : part de l'arrivée sur la diapo (`debut`, partagé entre les
 * deux fenêtres), s'arrête à 0. */
export function Chrono({ debut, duree, fige }: { debut?: number; duree: number; fige?: boolean }) {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    if (fige) return
    const t = window.setInterval(() => setMaintenant(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [fige])
  const reste = fige || debut === undefined ? duree : Math.max(0, Math.ceil(duree - (maintenant - debut) / 1000))
  return (
    <span className={`diapo-chrono${reste === 0 ? ' fini' : ''}`} role="timer" aria-live="off">
      <Pictogramme nom="minuteur" taille={20} />
      {reste === 0 ? 'Temps écoulé' : `${Math.floor(reste / 60)}:${String(reste % 60).padStart(2, '0')}`}
    </span>
  )
}

/** Réduit les caractères de la diapo (`--echelle`) si son contenu déborde (dernier recours : le
 * découpage des exemples a déjà réparti les lignes sur plusieurs diapos). */
function useAjustement(racine: React.RefObject<HTMLDivElement | null>, contenu: React.RefObject<HTMLDivElement | null>, actif: boolean, cle: string) {
  useLayoutEffect(() => {
    const r = racine.current
    const c = contenu.current
    if (!r || !c) return
    if (!actif) {
      r.style.setProperty('--echelle', '1')
      return
    }
    let vivant = true
    const ajuster = () => {
      const exces = () => Math.max(0, c.scrollHeight - c.clientHeight - 1) + Math.max(0, c.scrollWidth - c.clientWidth - 1)
      let e = 1
      r.style.setProperty('--echelle', '1')
      let avant = exces()
      // Réduire tant que ça déborde ET que ça aide (un débordement dû à une figure ou à une formule
      // trop large ne se règle pas en rapetissant le texte : on garde alors la taille normale).
      while (avant > 0 && e > 0.5) {
        const essai = Math.round((e - 0.04) * 100) / 100
        r.style.setProperty('--echelle', String(essai))
        const apres = exces()
        if (apres >= avant) {
          r.style.setProperty('--echelle', String(e))
          break
        }
        e = essai
        avant = apres
      }
      r.dataset.echelle = String(e)
    }
    ajuster()
    document.fonts?.ready.then(() => vivant && ajuster())
    const t = window.setTimeout(() => vivant && ajuster(), 400)
    return () => {
      vivant = false
      window.clearTimeout(t)
    }
  }, [racine, contenu, actif, cle])
}
