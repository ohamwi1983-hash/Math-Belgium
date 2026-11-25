import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ChapterContent, InteractiveWidgetTag } from '../../content/types'
import type { Diapo as DonneesDiapo } from '../../lib/projection/diapos'
import { ModeLiensChapitre, RichText } from '../Math'
import { texteSansLiens } from '../../lib/lienChapitre'
import { BlockRenderer } from '../chapter/BlockRenderer'
import { Illustration } from '../illustrations/Illustration'
import { InteractiveWidget } from '../chapter/InteractiveWidget'
import { titreCourt } from '../../lib/parcoursChapitre'
import { qrCodeSvg } from '../../entrainement/export/qrSvg'
import { disposerAtelier } from './dispositionAtelier'
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

/** Atelier : plein écran (l'atelier seul sur toute la diapo) et bouton qui le bascule (mode `direct`). */
export interface OptionsAtelier {
  plein?: boolean
  basculerPlein?: () => void
}

export function Diapo({ diapo, chapter, pas, mode, debut, atelier }: { diapo: DonneesDiapo; chapter: ChapterContent; pas: number; mode: ModeDiapo; debut?: number; atelier?: OptionsAtelier }) {
  const contenu = useRef<HTMLDivElement>(null)
  const racine = useRef<HTMLDivElement>(null)
  const toutVisible = mode === 'export' || mode === 'mesure'
  const p = toutVisible ? diapo.pas : Math.min(pas, diapo.pas)
  useAjustement(racine, contenu, mode !== 'mesure' && diapo.type !== 'atelier', diapo.cle)
  const plein = diapo.type === 'atelier' && !!atelier?.plein && mode === 'direct'

  return (
    <div ref={racine} className={`diapo theme-clair diapo--${diapo.type}`} data-mode={mode} data-cle={diapo.cle} data-plein={plein ? '' : undefined}>
      <div className="diapo-filet" aria-hidden="true" />
      <div ref={contenu} className="diapo-contenu">
        {/* Lien nommé vers un autre chapitre : texte seul (un clic sur la diapo = diapo suivante). */}
        <ModeLiensChapitre.Provider value="texte">
          <div className="diapo-pile">{corps(diapo, chapter, p, mode, toutVisible, debut, atelier)}</div>
        </ModeLiensChapitre.Provider>
      </div>
    </div>
  )
}

function sansPrefixe(label: string): string {
  return label.replace(/^(d[ée]monstration|exemple résolu)\s*[—–:-]\s*/i, '').replace(/^(d[ée]monstration|exemple résolu)\s*/i, '') || label
}

/** Longueur « visible » d'un texte RichText (une formule compte pour quelques caractères). */
function longueur(t: string): number {
  return texteSansLiens(t).replace(/\$[^$]+\$/g, 'xxxxxx').replace(/\*\*/g, '').length
}

function majuscule(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Adresse affichée sous un QR code / un lien (sans « https:// » ni « www. »). */
function adresseCourte(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '')
}

function corps(d: DonneesDiapo, chapter: ChapterContent, pas: number, mode: ModeDiapo, toutVisible: boolean, debut?: number, atelier?: OptionsAtelier): ReactNode {
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
      // Titre réduit à une ligne (surtitre) : l'atelier prend toute la surface de la diapo.
      return (
        <>
          <div className="diapo-atelier-tete">
            <p className="diapo-surtitre diapo-surtitre--atelier" data-pptx="">
              Atelier
            </p>
            <h2 className="diapo-atelier-titre" data-pptx="" title={d.label}>
              {d.label}
            </h2>
            {mode === 'direct' && atelier?.basculerPlein && (
              <button
                type="button"
                className="diapo-atelier-plein projection-interactif"
                title="Plein écran : l'atelier seul sur tout l'écran (Échap pour revenir)"
                onClick={(e) => {
                  e.stopPropagation()
                  atelier.basculerPlein?.()
                }}
              >
                <Pictogramme nom="plein-ecran" taille={18} /> Plein écran
              </button>
            )}
          </div>
          <ZoneAtelier tag={d.tag} monte={mode === 'direct' || mode === 'export'} />
        </>
      )
    case 'entrainement':
      return (
        <>
          <p className="diapo-surtitre diapo-surtitre--entrainement" data-pptx="">
            S’entraîner · générateur {d.generatorId}
          </p>
          <h2 className="diapo-titre diapo-titre--moyen" data-pptx="">
            {d.titre}
          </h2>
          <div className="diapo-corps diapo-entrainement">
            <div className="diapo-entrainement-texte">
              {d.description.map((t, i) => (
                <p key={i} data-pptx="">
                  {t}
                </p>
              ))}
              <p className="diapo-entrainement-ou" data-pptx="">
                Plateforme → {d.where}
              </p>
              {mode === 'direct' && (
                <a
                  className="diapo-entrainement-ouvrir projection-interactif"
                  href={d.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvre le générateur dans un nouvel onglet (la projection reste ouverte)"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ouvrir le générateur <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
            <figure className="diapo-qr">
              <span className="diapo-qr-code" dangerouslySetInnerHTML={{ __html: qrCodeSvg(d.lienPublic, 350, `QR code : ${d.titre} (générateur ${d.generatorId})`) }} />
              <figcaption>
                <span className="diapo-qr-aide">Scanne pour t’entraîner</span>
                <span className="diapo-qr-adresse" data-pptx="" data-pptx-lien={d.lienPublic}>
                  {adresseCourte(d.lienPublic)}
                </span>
              </figcaption>
            </figure>
          </div>
        </>
      )
    case 'video':
      return (
        <>
          <p className="diapo-surtitre diapo-surtitre--video" data-pptx="">
            Vidéo
          </p>
          <h2 className="diapo-titre diapo-titre--moyen" data-pptx="">
            {d.titre}
          </h2>
          <LecteurVideo id={d.youtubeId} titre={d.titre} mode={mode} />
        </>
      )
  }
}

/**
 * Vidéo d'une diapo : lecteur YouTube embarqué (youtube-nocookie) chargé AU CLIC seulement (vignette +
 * bouton de lecture avant : aucune requête vers le lecteur tant qu'on ne lance pas la vidéo) ; sans
 * identifiant, le même « vidéo à venir » que le cours. PowerPoint : un iframe ne se capture pas → cadre +
 * lien (zone de texte cliquable).
 */
function LecteurVideo({ id, titre, mode }: { id?: string; titre: string; mode: ModeDiapo }) {
  const [lecture, setLecture] = useState(false)
  if (!id) {
    return (
      <div className="diapo-video diapo-video--avenir">
        <span className="diapo-video-icone" aria-hidden="true">
          🎬
        </span>
        <span>Vidéo à venir — {titre}</span>
      </div>
    )
  }
  const lien = `https://www.youtube.com/watch?v=${id}`
  if (mode === 'export' || mode === 'mesure') {
    return (
      <div className="diapo-video diapo-video--lien">
        <span className="diapo-video-jouer" aria-hidden="true">
          <Pictogramme nom="lecture" taille={44} />
        </span>
        <span className="diapo-video-adresse" data-pptx="" data-pptx-lien={lien}>
          {adresseCourte(lien)}
        </span>
      </div>
    )
  }
  if (lecture) {
    return (
      <div className="diapo-video">
        <iframe
          className="diapo-video-cadre projection-interactif"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }
  const vignette = (
    <>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" />
      <span className="diapo-video-jouer" aria-hidden="true">
        <Pictogramme nom="lecture" taille={52} />
      </span>
    </>
  )
  // Vue d'ensemble, diapo suivante (déjà dans un bouton) : simple image, pas de second bouton imbriqué.
  if (mode !== 'direct') {
    return (
      <div className="diapo-video">
        <div className="diapo-video-facade">{vignette}</div>
      </div>
    )
  }
  return (
    <div className="diapo-video">
      <button
        type="button"
        className="diapo-video-facade projection-interactif"
        aria-label={`Lire la vidéo : ${titre}`}
        title="Lancer la vidéo (sur cet écran)"
        onClick={(e) => {
          e.stopPropagation()
          setLecture(true)
        }}
      >
        {vignette}
      </button>
    </div>
  )
}

/** Atelier monté en direct ; sa disposition (telle quelle ou figure à côté des réglages) et son zoom sont
 * choisis par `disposerAtelier` pour donner la plus grande figure possible dans la zone. */
function ZoneAtelier({ tag, monte }: { tag: InteractiveWidgetTag; monte: boolean }) {
  const zone = useRef<HTMLDivElement>(null)
  const place = useRef<HTMLDivElement>(null)
  const hote = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const z = zone.current
    const p = place.current
    const h = hote.current
    if (!monte || !z || !p || !h) return
    return disposerAtelier(z, p, h)
  }, [monte, tag])
  return (
    <>
      <div ref={zone} className="diapo-atelier">
        {monte ? (
          <div ref={place} className="diapo-atelier-place">
            <div ref={hote} className="diapo-atelier-hote">
              <InteractiveWidget tag={tag} figuresTactiles sansEpingle />
            </div>
          </div>
        ) : (
          <div className="diapo-atelier-vide">
            <Pictogramme nom="main" taille={56} />
            <span>Atelier interactif</span>
          </div>
        )}
      </div>
      {monte && (
        <button
          type="button"
          className="diapo-atelier-suite projection-interactif"
          onClick={(e) => {
            e.stopPropagation()
            zone.current?.scrollBy({ top: (zone.current.clientHeight || 400) * 0.7, behavior: 'smooth' })
          }}
        >
          <span aria-hidden="true">↓</span> La suite de l’atelier
        </button>
      )}
    </>
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
