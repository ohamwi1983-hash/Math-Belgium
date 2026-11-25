import { Fragment, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Block } from '../../content/types'
import { RichText } from '../Math'
import { Illustration } from '../illustrations/Illustration'
import { BlockList, BlockRenderer } from './BlockRenderer'
import { Icone } from './Icones'
import type { NomIcone } from './Icones'
import { estGenerateurMigre, generatorLink } from '../../lib/generatorLink'

type BlocDe<K extends Block['kind']> = Extract<Block, { kind: K }>
export type BlocAtelier = BlocDe<'atelier'>
export type BlocVideo = BlocDe<'video'>
export type BlocEntrainement = BlocDe<'entrainement'>

/** Panneau plein écran (téléphone) / grand panneau (ordinateur) : atelier ou vidéo. */
export type Panneau = { type: 'atelier'; bloc: BlocAtelier } | { type: 'video'; bloc: BlocVideo }

/** Kinds qui ne restent PAS dans le fil de lecture à l'écran. Tous sont déjà `no-export` (jamais
 * imprimés ni exportés) — sauf les exemples, rendus aussi à leur place pour l'impression. */
const HORS_FIL = new Set<Block['kind']>(['exemple', 'exempleLibre', 'application', 'historique', 'video', 'atelier', 'entrainement'])

/** « Manipule toi-même — Somme de deux vecteurs » → « Somme de deux vecteurs ». */
export function titreAtelier(b: BlocAtelier): string {
  const t = b.label.replace(/^Manipule toi-même\s*[:—–-]\s*/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * Contenu d'une étape (une section, ou l'intro « Avant de commencer ») tel que l'affiche le parcours.
 *
 * Les blocs du cours restent dans l'ordre écrit. Les exemples sont rendus à leur place (classe
 * `en-tiroir` : visibles à l'impression, dans l'export et le pré-rendu, masqués à l'écran) ; à
 * l'écran, chaque partie de l'étape (le texte jusqu'au prochain sous-titre `subheading`) se termine
 * par ses cartes « Manipuler » puis ses tiroirs repliés (exemples résolus pas à pas, « Dans la vraie
 * vie », « Le sais-tu ? ») ; l'étape se termine par ses vidéos et ses cartes « À toi ». Sur grand
 * écran (`colonneDroite`), ateliers, vidéos et « À toi » vont dans la colonne de droite.
 *
 * Tout ce qui est propre à l'écran porte `no-export` (retiré de l'export, masqué à l'impression) :
 * le chapitre imprimé reste exactement celui d'avant.
 */
export function ContenuEtape({
  blocks,
  actif,
  colonneDroite,
  ouvrirPanneau,
}: {
  blocks: Block[]
  /** Étape affichée : les tiroirs d'exemples (doublons à l'écran) ne sont construits que pour elle. */
  actif: boolean
  colonneDroite: boolean
  ouvrirPanneau: (p: Panneau) => void
}) {
  // Parties : un nouveau segment à chaque sous-titre.
  const segments: Block[][] = [[]]
  for (const b of blocks) {
    if (b.kind === 'subheading' && segments[segments.length - 1].length > 0) segments.push([])
    segments[segments.length - 1].push(b)
  }
  const videos = blocks.filter((b): b is BlocVideo => b.kind === 'video')
  const entrainements = blocks.filter((b): b is BlocEntrainement => b.kind === 'entrainement')

  return (
    <>
      {segments.map((seg, i) => {
        const ateliers = colonneDroite ? [] : seg.filter((b): b is BlocAtelier => b.kind === 'atelier')
        const tiroirs = seg.filter((b) => b.kind === 'exemple' || b.kind === 'exempleLibre' || b.kind === 'application' || b.kind === 'historique')
        // Ordre des tiroirs : exemples, puis vraie vie, puis « Le sais-tu ? ».
        const rang = (b: Block) => (b.kind === 'application' ? 1 : b.kind === 'historique' ? 2 : 0)
        tiroirs.sort((a, b) => rang(a) - rang(b))
        const tiroirsVisibles = actif ? tiroirs : tiroirs.filter((b) => b.kind === 'application' || b.kind === 'historique')
        return (
          <Fragment key={i}>
            {seg.map((b, j) =>
              HORS_FIL.has(b.kind) ? (
                b.kind === 'exemple' || b.kind === 'exempleLibre' ? <BlockRenderer key={j} block={b} enTiroir /> : null
              ) : (
                <BlockRenderer key={j} block={b} />
              ),
            )}
            {(ateliers.length > 0 || tiroirsVisibles.length > 0) && (
              <div className="etape-annexes no-export">
                {ateliers.map((b, j) => (
                  <CarteManipuler key={j} bloc={b} ouvrir={() => ouvrirPanneau({ type: 'atelier', bloc: b })} />
                ))}
                {tiroirsVisibles.length > 0 && (
                  <div className="tiroirs">
                    {tiroirsVisibles.map((b, j) => (
                      <TiroirBloc key={j} bloc={b} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Fragment>
        )
      })}
      {!colonneDroite && (videos.length > 0 || entrainements.length > 0) && (
        <div className="etape-annexes no-export">
          {videos.length > 0 && (
            <div className="tiroirs">
              {videos.map((b, j) => (
                <TiroirVideo key={j} bloc={b} />
              ))}
            </div>
          )}
          {entrainements.map((b, j) => (
            <CarteAToi key={j} bloc={b} />
          ))}
        </div>
      )}
    </>
  )
}

/** Colonne de droite (ordinateur large) : ateliers, vidéos et « À toi » de l'étape affichée. */
export function ColonneDroite({ blocks, ouvrirPanneau }: { blocks: Block[]; ouvrirPanneau: (p: Panneau) => void }) {
  const ateliers = blocks.filter((b): b is BlocAtelier => b.kind === 'atelier')
  const videos = blocks.filter((b): b is BlocVideo => b.kind === 'video')
  const entrainements = blocks.filter((b): b is BlocEntrainement => b.kind === 'entrainement')
  if (!ateliers.length && !videos.length && !entrainements.length) return null
  return (
    <>
      {ateliers.map((b, i) => (
        <CarteManipuler key={`a${i}`} bloc={b} ouvrir={() => ouvrirPanneau({ type: 'atelier', bloc: b })} />
      ))}
      {videos.map((b, i) => (
        <CarteVideo key={`v${i}`} bloc={b} ouvrir={() => ouvrirPanneau({ type: 'video', bloc: b })} />
      ))}
      {entrainements.map((b, i) => (
        <CarteAToi key={`e${i}`} bloc={b} compacte />
      ))}
    </>
  )
}

/** « L'essentiel » d'une étape (champ `essentiel` de la section), encadré orange. */
export function Essentiel({ phrases }: { phrases: string[] }) {
  return (
    <section className="essentiel no-export" aria-label="L'essentiel">
      <p className="etiquette">
        <Icone nom="cible" taille={16} />
        L’essentiel
      </p>
      {phrases.map((p, i) => (
        <p key={i}>
          <RichText text={p} />
        </p>
      ))}
    </section>
  )
}

// ---------- tiroirs ----------

function Tiroir({
  icone,
  titre,
  ton,
  paresseux,
  children,
}: {
  icone: NomIcone
  titre: ReactNode
  ton: 'exemple' | 'vraie-vie' | 'histoire' | 'video'
  /** Contenu construit seulement à l'ouverture (lecteur vidéo). */
  paresseux?: boolean
  children: ReactNode
}) {
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  return (
    <div className={`tiroir tiroir-${ton}${ouvert ? ' ouvert' : ''}`}>
      <button type="button" className="tiroir-bouton" aria-expanded={ouvert} aria-controls={id} onClick={() => setOuvert((o) => !o)}>
        <span className="tiroir-icone">
          <Icone nom={icone} />
        </span>
        <span className="tiroir-titre">{titre}</span>
        <span className="tiroir-signe" aria-hidden="true">
          {ouvert ? '−' : '+'}
        </span>
      </button>
      <div id={id} className="tiroir-corps" hidden={!ouvert}>
        {(!paresseux || ouvert) && children}
      </div>
    </div>
  )
}

function TiroirBloc({ bloc }: { bloc: Block }) {
  switch (bloc.kind) {
    case 'exemple': {
      const n = bloc.steps.length
      return (
        <Tiroir icone="livre" ton="exemple" titre={<>Exemple résolu{bloc.badge ? ` : ${bloc.badge}` : ''}{n > 1 ? <span className="tiroir-sous"> · {n} étapes</span> : null}</>}>
          <ExemplePasAPas bloc={bloc} />
        </Tiroir>
      )
    }
    case 'exempleLibre': {
      const titre = bloc.label ?? 'Exemple résolu'
      return (
        <Tiroir icone="livre" ton="exemple" titre={titre}>
          <ExempleLibrePasAPas bloc={bloc} />
        </Tiroir>
      )
    }
    case 'application':
      return (
        <Tiroir icone="avion" ton="vraie-vie" titre={<>Dans la vraie vie : {bloc.titre}</>}>
          {bloc.image && <img className="tiroir-vignette" src={bloc.image.src} alt={bloc.image.alt} loading="lazy" />}
          <p>
            <RichText text={bloc.text} />
          </p>
          {bloc.domaines.length > 0 && <p className="tiroir-domaines">{bloc.domaines.join(' · ')}</p>}
          {bloc.illustrations?.map((spec, i) => (
            <Illustration key={i} spec={spec} />
          ))}
        </Tiroir>
      )
    case 'historique':
      return (
        <Tiroir icone="parchemin" ton="histoire" titre={<>Le sais-tu ? {bloc.titre}</>}>
          {bloc.image && <img className="tiroir-vignette" src={bloc.image.src} alt={bloc.image.alt} title={bloc.image.caption} loading="lazy" />}
          <p>
            <RichText text={bloc.text} />
          </p>
        </Tiroir>
      )
    default:
      return null
  }
}

function TiroirVideo({ bloc }: { bloc: BlocVideo }) {
  if (!bloc.youtubeId) {
    return (
      <p className="tiroir-inactif">
        <span className="tiroir-icone">
          <Icone nom="lecture" />
        </span>
        Vidéo à venir : {bloc.title}
      </p>
    )
  }
  return (
    <Tiroir icone="lecture" ton="video" titre={<>Vidéo : {bloc.title}</>} paresseux>
      <LecteurVideo bloc={bloc} />
    </Tiroir>
  )
}

export function LecteurVideo({ bloc }: { bloc: BlocVideo }) {
  return (
    <div className="video-embed">
      <iframe
        src={`https://www.youtube.com/embed/${bloc.youtubeId}`}
        title={bloc.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

/** Exemple résolu révélé pas à pas : l'énoncé, puis une étape à la fois (« Montrer l'étape
 * suivante », « Tout montrer »), enfin le résultat encadré. */
export function ExemplePasAPas({ bloc }: { bloc: BlocDe<'exemple'> }) {
  const aUnResultat = bloc.result.tag.trim() !== '' || bloc.result.text.trim() !== ''
  const total = bloc.steps.length + (aUnResultat ? 1 : 0)
  const [vus, setVus] = useState(Math.min(1, total))
  const tout = vus >= total
  return (
    <div className="pas-a-pas">
      {bloc.formula && (
        <p className="pas-enonce">
          <RichText text={bloc.formula} />
        </p>
      )}
      <ol className="pas-liste" aria-live="polite">
        {bloc.steps.slice(0, vus).map((s, i) => (
          <li key={i}>
            <span className="pas-num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              {s.tag && <span className="pas-tag">{s.tag}</span>}
              <RichText text={s.text} />
            </div>
          </li>
        ))}
      </ol>
      {tout && aUnResultat && (
        <div className={`exemple-result${bloc.result.isEmpty ? ' is-empty' : ''}`}>
          <span className="tag">{bloc.result.tag}</span>
          <RichText text={bloc.result.text} />
        </div>
      )}
      {tout && bloc.illustration && <Illustration spec={bloc.illustration} />}
      <BoutonsPas vus={vus} total={total} setVus={setVus} />
    </div>
  )
}

/** Exemple en forme libre : chaque bloc (paragraphe, tableau, figure…) est une étape. */
export function ExempleLibrePasAPas({ bloc }: { bloc: BlocDe<'exempleLibre'> }) {
  const total = bloc.blocks.length
  const [vus, setVus] = useState(Math.min(1, total))
  return (
    <div className="pas-a-pas pas-libre">
      <div aria-live="polite">
        <BlockList blocks={bloc.blocks.slice(0, vus)} />
      </div>
      <BoutonsPas vus={vus} total={total} setVus={setVus} />
    </div>
  )
}

function BoutonsPas({ vus, total, setVus }: { vus: number; total: number; setVus: (n: number) => void }) {
  if (vus >= total) return null
  return (
    <div className="pas-boutons">
      <button type="button" className="btn-parcours" onClick={() => setVus(vus + 1)}>
        Montrer l’étape suivante
      </button>
      <button type="button" className="btn-parcours btn-discret" onClick={() => setVus(total)}>
        Tout montrer
      </button>
    </div>
  )
}

// ---------- cartes ----------

function CarteManipuler({ bloc, ouvrir }: { bloc: BlocAtelier; ouvrir: () => void }) {
  return (
    <div className="carte-manipuler">
      <p className="etiquette">
        <Icone nom="main" taille={16} />
        Manipuler
      </p>
      <p className="carte-titre">{titreAtelier(bloc)}</p>
      {bloc.caption && (
        <p className="carte-legende">
          <RichText text={bloc.caption} />
        </p>
      )}
      <button type="button" className="btn-parcours btn-plein" onClick={ouvrir} aria-haspopup="dialog">
        Ouvrir l’atelier
      </button>
    </div>
  )
}

function CarteVideo({ bloc, ouvrir }: { bloc: BlocVideo; ouvrir: () => void }) {
  return (
    <div className="carte-video">
      <p className="etiquette">
        <Icone nom="lecture" taille={16} />
        Vidéo
      </p>
      {bloc.youtubeId ? (
        <button type="button" className="carte-video-bouton" onClick={ouvrir} aria-haspopup="dialog">
          {bloc.title}
        </button>
      ) : (
        <p className="carte-video-attente">À venir : {bloc.title}</p>
      )}
    </div>
  )
}

/** Carte « À toi » : renvoie vers le générateur d'exercices de l'étape. */
export function CarteAToi({ bloc, compacte }: { bloc: BlocEntrainement; compacte?: boolean }) {
  const href = generatorLink(bloc.chantier, bloc.generatorId)
  const migre = estGenerateurMigre(bloc.chantier, bloc.generatorId)
  const libelle = (
    <>
      S’entraîner <span aria-hidden="true">›</span>
    </>
  )
  return (
    <div className="carte-atoi">
      <p className="etiquette">
        <Icone nom="cible" taille={16} />
        À toi
        <span className="carte-atoi-id">{bloc.generatorId}</span>
      </p>
      <p className="carte-titre">{bloc.title}</p>
      {!compacte && bloc.description.map((d, i) => <p key={i} className="carte-desc">{d}</p>)}
      {migre ? (
        <Link className="btn-parcours btn-atoi" to={href} aria-label={`S'entraîner : ${bloc.title}`}>
          {libelle}
        </Link>
      ) : (
        <a className="btn-parcours btn-atoi" href={href} target="_blank" rel="noopener noreferrer" aria-label={`S'entraîner : ${bloc.title} (nouvel onglet)`}>
          {libelle} <span aria-hidden="true">↗</span>
        </a>
      )}
    </div>
  )
}
