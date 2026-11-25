import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { LEVELS } from '../../content/chaptersIndex'
import { enregistrerOrdreChapitres, lireOrdreChapitres } from '../../lib/compteDonnees'
import { messageErreur } from '../../lib/compteValidation'
import { chapitresDansMonOrdre, definirEtatOrdreChapitres, estOrdreDuSite, surtitreChapitre, type OrdreChapitres } from '../../lib/ordreChapitres'
import './ordre-chapitres.css'

/**
 * « Mon ordre des chapitres » (page « Mon profil », migration 0011) : un onglet par année, liste
 * réordonnable au clavier et au doigt (« Monter » / « Descendre », 44 px) — et à la souris par
 * glisser-déposer —, numéros mis à jour en direct, « Revenir à l'ordre du site », « Ne pas numéroter
 * mes documents », enregistrement explicite. Lit et écrit `carnet_reglages` (0011) ; met à jour
 * l'ordre du professeur gardé par `lib/ordreChapitres.ts` (documents, carnet, coffre…).
 */

/** Brouillon : par année, la liste rangée, ou `null` = ordre du site. */
type Brouillon = Record<string, string[] | null>

type Lecture = { etat: 'chargement' } | { etat: 'absente' } | { etat: 'erreur'; message: string } | { etat: 'prete'; ligneExiste: boolean }

function brouillonDepuis(ordre: OrdreChapitres | null): Brouillon {
  const b: Brouillon = {}
  for (const l of LEVELS) {
    const liste = ordre?.niveaux[l.slug]
    b[l.slug] = liste && liste.length > 0 ? chapitresDansMonOrdre(l.slug, ordre).map((c) => c.slug) : null
  }
  return b
}

function ordreDepuis(b: Brouillon, numeroter: boolean): OrdreChapitres {
  const niveaux: Record<string, string[]> = {}
  for (const [niveau, liste] of Object.entries(b)) if (liste) niveaux[niveau] = liste
  return { niveaux, numeroter }
}

function memeBrouillon(a: Brouillon, b: Brouillon): boolean {
  return LEVELS.every((l) => JSON.stringify(a[l.slug] ?? null) === JSON.stringify(b[l.slug] ?? null))
}

export function OrdreChapitresCarte({ client, proprietaire }: { client: SupabaseClient; proprietaire: string }) {
  const id = useId()
  const [lecture, setLecture] = useState<Lecture>({ etat: 'chargement' })
  const [enregistre, setEnregistre] = useState<{ brouillon: Brouillon; numeroter: boolean }>({ brouillon: brouillonDepuis(null), numeroter: true })
  const [brouillon, setBrouillon] = useState<Brouillon>(() => brouillonDepuis(null))
  const [numeroter, setNumeroter] = useState(true)
  const [onglet, setOnglet] = useState(LEVELS[0].slug)
  const [annonce, setAnnonce] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [glisse, setGlisse] = useState<string | null>(null)
  const focusApres = useRef<{ slug: string; sens: 'monter' | 'descendre' } | null>(null)
  const liste = useRef<HTMLOListElement>(null)

  useEffect(() => {
    let actif = true
    lireOrdreChapitres(client)
      .then((l) => {
        if (!actif) return
        if (!l.actif) return setLecture({ etat: 'absente' })
        const b = brouillonDepuis(l.ordre)
        const n = l.ordre?.numeroter ?? true
        setEnregistre({ brouillon: b, numeroter: n })
        setBrouillon(b)
        setNumeroter(n)
        setLecture({ etat: 'prete', ligneExiste: l.ligneExiste })
      })
      .catch((e: unknown) => actif && setLecture({ etat: 'erreur', message: messageErreur(e) }))
    return () => {
      actif = false
    }
  }, [client])

  // Lien « Mon ordre des chapitres » du carnet (`/profil#ordre-chapitres`) : la carte est amenée à l'écran.
  const pret = lecture.etat !== 'chargement'
  useEffect(() => {
    if (pret && window.location.hash === '#ordre-chapitres') document.getElementById('ordre-chapitres')?.scrollIntoView({ block: 'start' })
  }, [pret])

  const niveau = LEVELS.find((l) => l.slug === onglet) ?? LEVELS[0]
  const slugs = brouillon[niveau.slug] ?? niveau.chapters.map((c) => c.slug)
  const chapitres = useMemo(() => slugs.map((s) => niveau.chapters.find((c) => c.slug === s)!).filter(Boolean), [slugs, niveau])
  const regle = brouillon[niveau.slug] !== null
  const modifie = !memeBrouillon(brouillon, enregistre.brouillon) || numeroter !== enregistre.numeroter
  const desactive = lecture.etat !== 'prete' || occupe

  // Après « Monter » / « Descendre », le focus suit le chapitre déplacé (l'autre bouton s'il arrive au bord).
  useEffect(() => {
    const f = focusApres.current
    if (!f || !liste.current) return
    focusApres.current = null
    const ligne = liste.current.querySelector<HTMLElement>(`[data-slug="${f.slug}"]`)
    const bouton = ligne?.querySelector<HTMLButtonElement>(`[data-sens="${f.sens}"]:not(:disabled)`) ?? ligne?.querySelector<HTMLButtonElement>('button:not(:disabled)')
    bouton?.focus()
  }, [brouillon])

  function deplacer(slug: string, vers: number, sens?: 'monter' | 'descendre') {
    const de = slugs.indexOf(slug)
    if (de < 0 || vers < 0 || vers >= slugs.length || vers === de) return
    const nouvelle = slugs.slice()
    nouvelle.splice(de, 1)
    nouvelle.splice(vers, 0, slug)
    if (sens) focusApres.current = { slug, sens }
    setBrouillon((b) => ({ ...b, [niveau.slug]: nouvelle }))
    const c = niveau.chapters.find((x) => x.slug === slug)
    setAnnonce(`${c?.title ?? slug} : chapitre ${vers + 1} sur ${slugs.length}.`)
    setMessage(null)
  }

  function revenirAuSite() {
    setBrouillon((b) => ({ ...b, [niveau.slug]: null }))
    setAnnonce(`${niveau.label} : ordre du site rétabli (pas encore enregistré).`)
    setMessage(null)
  }

  async function enregistrer() {
    if (lecture.etat !== 'prete') return
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    // Une année remise exactement dans l'ordre du site par les flèches reste « réglée » : le
    // professeur a choisi cet ordre et ses numéros (seul « Revenir à l'ordre du site » la retire).
    const ordre = ordreDepuis(brouillon, numeroter)
    try {
      const ok = await enregistrerOrdreChapitres(client, proprietaire, ordre, lecture.ligneExiste)
      if (!ok) {
        setLecture({ etat: 'absente' })
        return
      }
      const vide = Object.keys(ordre.niveaux).length === 0 && ordre.numeroter
      definirEtatOrdreChapitres({ etat: 'active', ordre: vide ? null : ordre })
      setEnregistre({ brouillon, numeroter })
      setLecture({ etat: 'prete', ligneExiste: true })
      setMessage('Enregistré. Tes documents, ton carnet et ton coffre suivent maintenant cet ordre.')
    } catch (e) {
      setErreur(messageErreur(e))
    } finally {
      setOccupe(false)
    }
  }

  function annuler() {
    setBrouillon(enregistre.brouillon)
    setNumeroter(enregistre.numeroter)
    setMessage(null)
    setErreur(null)
  }

  function clavierOnglets(e: KeyboardEvent<HTMLDivElement>) {
    const i = LEVELS.findIndex((l) => l.slug === onglet)
    const n = LEVELS.length
    const j = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (j < 0) return
    e.preventDefault()
    setOnglet(LEVELS[j].slug)
    requestAnimationFrame(() => document.getElementById(`${id}-onglet-${LEVELS[j].slug}`)?.focus())
  }

  function deposer(e: DragEvent<HTMLLIElement>, cible: string) {
    e.preventDefault()
    if (glisse && glisse !== cible) deplacer(glisse, slugs.indexOf(cible))
    setGlisse(null)
  }

  const premier = chapitres[0]
  const ordreApercu = ordreDepuis(brouillon, numeroter)

  return (
    <section className="profil-carte ordre-carte" id="ordre-chapitres" aria-labelledby={`${id}-titre`}>
      <div className="profil-carte-tete">
        <h2 id={`${id}-titre`}>Mon ordre des chapitres</h2>
        {lecture.etat === 'prete' && (modifie ? <span className="profil-pastille attention">non enregistré</span> : <span className="profil-pastille ok">✓ enregistré</span>)}
      </div>
      <div className="profil-carte-corps">
        <p className="profil-intro">
          Range les chapitres dans l'ordre où tu les donnes. Tes feuilles, évaluations, examens, ton carnet, ta page de classe et ton coffre suivent cet ordre et impriment <strong>ton</strong> numéro. Sans réglage, les documents des élèves portent le titre seul — jamais le numéro du site.
        </p>

        {lecture.etat === 'chargement' && <p className="compte-vide">Chargement…</p>}
        {lecture.etat === 'erreur' && (
          <p className="compte-erreur-champ" role="alert">
            {lecture.message}
          </p>
        )}
        {lecture.etat === 'absente' && (
          <p className="ordre-absente" role="status">
            Applique la migration 0011 pour ranger tes chapitres : colle le fichier <code>supabase/migrations/0011_ordre_chapitres.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → New query → coller tout le fichier → Run), puis recharge cette page. En attendant, le site garde l'ordre du site et les documents portent le titre seul.
          </p>
        )}

        {(lecture.etat === 'prete' || lecture.etat === 'absente') && (
          <>
            <div role="tablist" aria-label="Année" className="ordre-onglets" onKeyDown={clavierOnglets}>
              {LEVELS.map((l) => (
                <button
                  key={l.slug}
                  type="button"
                  role="tab"
                  id={`${id}-onglet-${l.slug}`}
                  aria-selected={onglet === l.slug}
                  aria-controls={`${id}-panneau`}
                  tabIndex={onglet === l.slug ? 0 : -1}
                  className="ordre-onglet"
                  onClick={() => setOnglet(l.slug)}
                >
                  {l.label}
                  <span className="ordre-onglet-etat">{brouillon[l.slug] ? 'ton ordre' : 'ordre du site'}</span>
                </button>
              ))}
            </div>

            <div role="tabpanel" id={`${id}-panneau`} aria-labelledby={`${id}-onglet-${niveau.slug}`} className="ordre-panneau">
              <p className="ordre-etat">
                {regle
                  ? estOrdreDuSite(niveau.slug, slugs)
                    ? 'Ton ordre (identique à celui du site, mais avec tes numéros sur les documents).'
                    : `Ton ordre pour la ${niveau.label}.`
                  : 'Ordre du site : déplace un chapitre pour régler le tien.'}
              </p>
              <ol className="ordre-liste" ref={liste} aria-label={`Chapitres de ${niveau.label}, dans ${regle ? 'ton ordre' : "l'ordre du site"}`}>
                {chapitres.map((c, i) => (
                  <li
                    key={c.slug}
                    data-slug={c.slug}
                    className={`ordre-ligne${glisse === c.slug ? ' glisse' : ''}`}
                    draggable={!desactive}
                    onDragStart={(e) => {
                      setGlisse(c.slug)
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/plain', c.slug)
                    }}
                    onDragOver={(e) => glisse && e.preventDefault()}
                    onDrop={(e) => deposer(e, c.slug)}
                    onDragEnd={() => setGlisse(null)}
                  >
                    <span className={`ordre-numero${regle ? ' regle' : ''}`} aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="ordre-titre">
                      <span className="sr-only">{regle ? `Chapitre ${i + 1} : ` : `Position ${i + 1} : `}</span>
                      {c.title}
                      {regle && c.chapterNumber !== i + 1 && <span className="ordre-site">n° {c.chapterNumber} sur le site</span>}
                    </span>
                    <span className="ordre-boutons">
                      <button type="button" className="carnet-bouton ordre-fleche" data-sens="monter" disabled={desactive || i === 0} aria-label={`Monter « ${c.title} »`} title="Monter" onClick={() => deplacer(c.slug, i - 1, 'monter')}>
                        <span aria-hidden="true">↑</span>
                        <span className="ordre-fleche-texte">Monter</span>
                      </button>
                      <button type="button" className="carnet-bouton ordre-fleche" data-sens="descendre" disabled={desactive || i === chapitres.length - 1} aria-label={`Descendre « ${c.title} »`} title="Descendre" onClick={() => deplacer(c.slug, i + 1, 'descendre')}>
                        <span aria-hidden="true">↓</span>
                        <span className="ordre-fleche-texte">Descendre</span>
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="sr-only" aria-live="polite">
                {annonce}
              </p>
              <div className="profil-actions">
                <button type="button" className="carnet-bouton" disabled={desactive || !regle} onClick={revenirAuSite}>
                  Revenir à l'ordre du site
                </button>
              </div>
            </div>

            <label className="ordre-case">
              <input type="checkbox" checked={!numeroter} disabled={desactive} onChange={(e) => (setNumeroter(!e.target.checked), setMessage(null))} />
              <span>
                Ne pas numéroter mes documents
                <span className="ordre-case-aide">Titre seul sur les documents des élèves, même avec ton ordre (ton carnet et ton coffre gardent tes numéros).</span>
              </span>
            </label>

            {premier && (
              <p className="ordre-apercu">
                <span className="profil-etiquette">Sur tes documents</span>
                <span className="ordre-apercu-texte">« {surtitreChapitre(niveau.label, premier, ordreApercu)} »</span>
              </p>
            )}

            {lecture.etat === 'prete' && modifie && (
              <div className="profil-actions">
                <button type="button" className="carnet-bouton principal" disabled={occupe} onClick={() => void enregistrer()}>
                  {occupe ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button type="button" className="carnet-bouton" disabled={occupe} onClick={annuler}>
                  Annuler
                </button>
              </div>
            )}
            {message && (
              <p className="compte-message" role="status">
                {message}
              </p>
            )}
            {erreur && (
              <p className="compte-erreur-champ" role="alert">
                {erreur}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
