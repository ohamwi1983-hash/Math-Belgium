import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { RichText } from '../Math'
import { findChapter } from '../../content/chaptersIndex'
import type { ChapterContent, ChapterSection } from '../../content/types'
import {
  ECHELLES,
  PREREGLAGES,
  changerReglages,
  prereglageActif,
  revenirAuReglageDuSite,
  useReglagesLecture,
} from '../../lib/reglagesLecture'
import type { CleReglage, ReglagesLecture } from '../../lib/reglagesLecture'
import { fermerPanneauLecture } from './etatPanneauLecture'
import './panneauLecture.css'

type Onglet = 'texte' | 'couleurs' | 'aides'
const ONGLETS: { id: Onglet; nom: string }[] = [
  { id: 'texte', nom: 'Texte' },
  { id: 'couleurs', nom: 'Couleurs' },
  { id: 'aides', nom: 'Aides' },
]

/** Onglet gardé pour la visite (rouvrir le panneau revient où l'on était). */
let ongletMemorise: Onglet = 'texte'

/** Aperçu : « L'essentiel » de l'étape ouverte (ou de la première étape du chapitre), sinon celui de
 * l'étape 1 de « Suites » (5e) — toujours un VRAI paragraphe du cours, avec ses formules. */
function useApercu(): { source: string; phrases: string[] } {
  const { pathname, hash } = useLocation()
  return useMemo(() => {
    const avecEssentiel = (s: ChapterSection) => !!s.essentiel && s.essentiel.length > 0
    const depuis = (c: ChapterContent, s: ChapterSection) => ({ source: `${c.title}, étape ${s.number}`, phrases: s.essentiel ?? [] })
    const m = /^\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
    const chapitre = m ? findChapter(m[1], m[2]) : undefined
    if (chapitre) {
      let id = hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        // fragment illisible : première étape
      }
      const etape = chapitre.sections.find((s) => s.id === id && avecEssentiel(s)) ?? chapitre.sections.find(avecEssentiel)
      if (etape) return depuis(chapitre, etape)
    }
    const suites = findChapter('5e-4h', 'suites')
    const s1 = suites?.sections.find(avecEssentiel)
    return suites && s1 ? depuis(suites, s1) : { source: 'Suites, étape 1', phrases: ['Une suite est arithmétique si l’on passe d’un terme au suivant en ajoutant toujours la même raison r.'] }
  }, [pathname, hash])
}

/** Panneau « Confort de lecture » (planches 01 à 06) : feuille du bas sur téléphone, panneau à droite sur
 * ordinateur (la page reste visible et réagit en direct). `<dialog>` modal : focus piégé, Échap ferme,
 * le focus revient au bouton « Aa » qui l'a ouvert. */
export default function PanneauLecture() {
  const dialogue = useRef<HTMLDialogElement>(null)
  const fermer = useRef<HTMLButtonElement>(null)
  const r = useReglagesLecture()
  const [onglet, setOnglet] = useState<Onglet>(ongletMemorise)
  const apercu = useApercu()
  const pre = prereglageActif(r)
  const titreId = useId()

  useLayoutEffect(() => {
    const d = dialogue.current
    if (!d) return
    if (!d.open) d.showModal()
    fermer.current?.focus({ preventScroll: true })
    document.documentElement.classList.add('lecture-panneau-ouvert')
    return () => {
      document.documentElement.classList.remove('lecture-panneau-ouvert')
      if (d.open) d.close()
    }
  }, [])

  useEffect(() => {
    ongletMemorise = onglet
  }, [onglet])

  const choisir = <K extends CleReglage>(k: K, v: ReglagesLecture[K]) => changerReglages({ [k]: v } as Partial<ReglagesLecture>)

  const onglets = useRef<(HTMLButtonElement | null)[]>([])
  function clavierOnglets(e: KeyboardEvent<HTMLDivElement>) {
    const i = ONGLETS.findIndex((o) => o.id === onglet)
    const j =
      e.key === 'ArrowRight' ? (i + 1) % ONGLETS.length : e.key === 'ArrowLeft' ? (i + ONGLETS.length - 1) % ONGLETS.length : e.key === 'Home' ? 0 : e.key === 'End' ? ONGLETS.length - 1 : -1
    if (j < 0) return
    e.preventDefault()
    setOnglet(ONGLETS[j].id)
    onglets.current[j]?.focus()
  }

  return (
    <dialog
      ref={dialogue}
      className="confort"
      aria-labelledby={titreId}
      onCancel={(e) => {
        e.preventDefault()
        fermerPanneauLecture()
      }}
      // Fermé par le navigateur malgré tout (Échap répété : Chromium peut ignorer `preventDefault`).
      onClose={fermerPanneauLecture}
      onClick={(e) => {
        // Clic sur le voile (hors de la boîte) : fermer.
        if (e.target === dialogue.current) {
          const b = dialogue.current.getBoundingClientRect()
          if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) fermerPanneauLecture()
        }
      }}
    >
      <div className="confort-poignee" aria-hidden="true" />
      <div className="confort-tete">
        <h2 id={titreId}>Confort de lecture</h2>
        <button ref={fermer} type="button" className="confort-fermer" onClick={fermerPanneauLecture}>
          Fermer
        </button>
      </div>

      <div className="confort-defile">
        <div className="apercu-lecture">
          <p className="apercu-etiquette">
            <span className="apercu-source">Aperçu · {apercu.source}</span>
            <span className="apercu-reglage">{pre ? pre.nom : 'Personnalisé'}</span>
          </p>
          <div className="apercu-cadre" aria-label="Aperçu du texte avec ces réglages">
            {apercu.phrases.map((p, i) => (
              <p key={i}>
                <RichText text={p} />
              </p>
            ))}
          </div>
        </div>

        <div className="confort-onglets" role="tablist" aria-label="Réglages" onKeyDown={clavierOnglets}>
          {ONGLETS.map((o, i) => (
            <button
              key={o.id}
              ref={(el) => {
                onglets.current[i] = el
              }}
              type="button"
              role="tab"
              id={`confort-onglet-${o.id}`}
              aria-controls={`confort-vue-${o.id}`}
              aria-selected={onglet === o.id}
              tabIndex={onglet === o.id ? 0 : -1}
              onClick={() => setOnglet(o.id)}
            >
              {o.nom}
            </button>
          ))}
        </div>

        <div className="confort-vue" role="tabpanel" id="confort-vue-texte" aria-labelledby="confort-onglet-texte" hidden={onglet !== 'texte'}>
          <Bloc titre="En un clic">
            <div className="prereglages">
              {PREREGLAGES.map((p) => (
                <button key={p.id} type="button" className="prereglage" aria-pressed={pre?.id === p.id} onClick={() => changerReglages(p.reglages)}>
                  <span
                    className="pr-ech"
                    aria-hidden="true"
                    style={{ fontFamily: p.reglages.police === 'atkinson' ? '"Atkinson Hyperlegible", sans-serif' : 'Andika, sans-serif', fontSize: `${14 + 6 * ECHELLES[p.reglages.taille]}px` }}
                  >
                    Aa
                  </span>
                  <span className="pr-nom">{p.nom}</span>
                  <span className="pr-desc">{p.desc}</span>
                </button>
              ))}
            </div>
          </Bloc>

          <Bloc titre="Taille du texte" aide="Les formules grandissent avec le texte.">
            <Segments
              valeur={r.taille}
              choisir={(v) => choisir('taille', v)}
              options={(['1', '2', '3', '4', '5'] as const).map((t, i) => ({
                v: t,
                contenu: (
                  <>
                    <span className="seg-a" style={{ fontSize: `${14 + i * 2.5}px` }} aria-hidden="true">
                      A
                    </span>
                    <small>{Math.round(ECHELLES[t] * 100)}&nbsp;%</small>
                  </>
                ),
              }))}
            />
          </Bloc>

          <Bloc titre="Police">
            <div className="polices" role="group" aria-label="Police">
              <BoutonPolice actif={r.police === 'andika'} onClick={() => choisir('police', 'andika')} famille="Andika, sans-serif" nom="Andika" tag="police du site">
                <span className="po-plus">
                  <b>Pour&nbsp;:</b> conçue pour apprendre à lire, lettres bien distinctes (I, l, 1), proche de l’écriture scolaire.
                </span>
                <span className="po-moins">
                  <b>Limite&nbsp;:</b> un peu étroite en petite taille sur téléphone.
                </span>
              </BoutonPolice>
              <BoutonPolice
                actif={r.police === 'atkinson'}
                onClick={() => choisir('police', 'atkinson')}
                famille='"Atkinson Hyperlegible", sans-serif'
                nom="Atkinson Hyperlegible"
                tag="version aménagée"
              >
                <span className="po-plus">
                  <b>Pour&nbsp;:</b> dessinée pour la basse vision&nbsp;; c’est déjà la police des évaluations et du chapitre «&nbsp;version aménagée&nbsp;»&nbsp;: la même à l’écran et sur papier.
                </span>
                <span className="po-moins">
                  <b>Limite&nbsp;:</b> plus large, donc moins de mots par ligne.
                </span>
              </BoutonPolice>
              <BoutonPolice
                actif={r.police === 'opendyslexic'}
                onClick={() => choisir('police', 'opendyslexic')}
                famille="OpenDyslexic, sans-serif"
                nom="OpenDyslexic"
                tag="pensée pour la dyslexie"
              >
                <span className="po-plus">
                  <b>Pour&nbsp;:</b> lettres «&nbsp;lestées&nbsp;» en bas&nbsp;; certains élèves s’y sentent mieux, et c’est une raison suffisante pour la proposer.
                </span>
                <span className="po-moins">
                  <b>Limite&nbsp;:</b> les études ne montrent pas de lecture plus rapide ni plus juste qu’avec une police ordinaire&nbsp;; l’espacement et des lignes courtes aident davantage. Les formules gardent leur police mathématique.
                  {r.police !== 'opendyslexic' && ' Elle n’est téléchargée que si tu la choisis.'}
                </span>
              </BoutonPolice>
            </div>
          </Bloc>

          <Bloc titre="Interligne">
            <Segments
              valeur={r.interligne}
              choisir={(v) => choisir('interligne', v)}
              options={[
                { v: '1', contenu: <>Normal<small>1,6 · site</small></> },
                { v: '2', contenu: <>Aéré<small>1,8</small></> },
                { v: '3', contenu: <>Très aéré<small>2</small></> },
              ]}
            />
          </Bloc>

          <Bloc titre="Espace entre les lettres et les mots">
            <Segments
              valeur={r.espacement}
              choisir={(v) => choisir('espacement', v)}
              options={[
                { v: '1', contenu: <>Normal<small>site</small></> },
                { v: '2', contenu: <>Aéré<small>&nbsp;</small></> },
                { v: '3', contenu: <>Très aéré<small>conseillé dys</small></> },
              ]}
            />
          </Bloc>

          <Bloc titre="Longueur des lignes" aide="Des lignes plus courtes : l’œil retrouve plus facilement le début de la ligne suivante.">
            <Segments
              valeur={r.largeur}
              choisir={(v) => choisir('largeur', v)}
              options={[
                { v: 'large', contenu: <>Longues<small>≈&nbsp;70 signes</small></> },
                { v: 'moyenne', contenu: <>Moyennes<small>≈&nbsp;60</small></> },
                { v: 'etroite', contenu: <>Courtes<small>≈&nbsp;50</small></> },
              ]}
            />
          </Bloc>
        </div>

        <div className="confort-vue" role="tabpanel" id="confort-vue-couleurs" aria-labelledby="confort-onglet-couleurs" hidden={onglet !== 'couleurs'}>
          <Bloc titre="Thème">
            <div className="themes" role="group" aria-label="Thème">
              {(
                [
                  ['auto', 'Auto'],
                  ['clair', 'Clair'],
                  ['sombre', 'Sombre'],
                  ['creme', 'Crème'],
                  ['contraste', 'Contraste élevé'],
                ] as const
              ).map(([v, nom]) => (
                <button key={v} type="button" className="theme" aria-pressed={r.theme === v} onClick={() => choisir('theme', v)}>
                  <span className={`th-pastille th-${v}`} aria-hidden="true">
                    Aa
                  </span>
                  {nom}
                </button>
              ))}
            </div>
            <p className="confort-aide confort-aide-apres">«&nbsp;Auto&nbsp;» suit le réglage clair / sombre du téléphone ou de l’ordinateur, comme aujourd’hui. La projection en classe et l’impression ne changent pas.</p>
          </Bloc>
          <Bloc titre="Mouvement">
            <div className="interrupteur">
              <span className="it-texte">
                <span className="it-nom" id="confort-animations">
                  Réduire les animations
                </span>
                <span className="it-desc">Plus de fondus ni de glissements dans les pages. Déjà automatique si ton appareil le demande.</span>
              </span>
              <button
                type="button"
                role="switch"
                className="it-bouton"
                aria-labelledby="confort-animations"
                aria-checked={r.animations === 'reduites'}
                onClick={() => choisir('animations', r.animations === 'reduites' ? 'auto' : 'reduites')}
              />
            </div>
          </Bloc>
        </div>

        <div className="confort-vue" role="tabpanel" id="confort-vue-aides" aria-labelledby="confort-onglet-aides" hidden={onglet !== 'aides'}>
          <Bloc titre="Bientôt">
            <p className="confort-aide">Ici arriveront des aides pour suivre la lecture&nbsp;: une règle qui suit la ligne, un bloc à la fois, une loupe sur les formules et la lecture à voix haute.</p>
          </Bloc>
        </div>
      </div>

      <div className="confort-pied">
        <button type="button" className="confort-reset" onClick={revenirAuReglageDuSite}>
          Revenir au réglage du site
        </button>
        <p className="mention-appareil">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M11 18h2" />
          </svg>
          Gardé sur cet appareil. Rien n’est envoyé.
        </p>
      </div>
    </dialog>
  )
}

function Bloc({ titre, aide, children }: { titre: string; aide?: string; children: ReactNode }) {
  const id = useId()
  return (
    <section className="confort-bloc" aria-labelledby={id}>
      <h3 id={id}>{titre}</h3>
      {aide && <p className="confort-aide">{aide}</p>}
      {children}
    </section>
  )
}

function Segments<V extends string>({ valeur, choisir, options }: { valeur: V; choisir: (v: V) => void; options: { v: V; contenu: ReactNode }[] }) {
  return (
    <div className="segments" role="group">
      {options.map((o) => (
        <button key={o.v} type="button" aria-pressed={valeur === o.v} onClick={() => choisir(o.v)}>
          {o.contenu}
        </button>
      ))}
    </div>
  )
}

function BoutonPolice({ actif, onClick, famille, nom, tag, children }: { actif: boolean; onClick: () => void; famille: string; nom: string; tag: string; children: ReactNode }) {
  return (
    <button type="button" className="police" aria-pressed={actif} onClick={onClick}>
      <span className="po-nom" style={{ fontFamily: famille }}>
        {nom}
      </span>
      <span className="po-tag">{tag}</span>
      <span className="po-ech" style={{ fontFamily: famille }} aria-hidden="true">
        Il a 1 l, 0 O · b d p q
      </span>
      {children}
    </button>
  )
}
