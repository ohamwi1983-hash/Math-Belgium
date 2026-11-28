import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { LEVELS } from '../content/chaptersIndex'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { lireEtatsCartes, lireParcours, titreCourt } from '../lib/parcoursChapitre'
import { anneeDeDepart } from '../lib/anneeAccueil'
import { effacerEssais, lireEssais, EVENEMENT_SUIVI, type Essai } from '../lib/suiviEssais'
import { aRetravailler, suiviChapitre, type EssaiDate, type GenerateurSuivi, type SuiviChapitre, type SuiviEtape } from '../lib/suiviChapitres'
import { effacerPlan, lirePlan } from '../lib/planRevisionStockage'
import { estGenerateurMigre, generatorLink } from '../lib/generatorLink'
import { BoucleConfiance, IconeLivre } from '../components/suivi/communs'
import '../components/suivi/suivi.css'

/**
 * « Ma progression » (ex-« Mon suivi », `/suivi`, planche 13) — public, sans compte, non indexé, jamais pré-rendu. Tout est lu
 * dans CE navigateur : progression des pages de chapitre, cartes « Teste-toi », essais des générateurs
 * (`lib/suiviEssais.ts`). Rien n'est envoyé ; le professeur ne voit rien.
 *
 * Par année (`?niveau=`, sinon l'année de l'accueil) et par chapitre (onglets, `?chapitre=`, sinon le
 * dernier chapitre travaillé) : « À retravailler » en tête (avec le pourquoi, « Revoir » l'étape et
 * « M'entraîner » sur le bon générateur), puis chaque étape (comprise, 5 derniers essais en cases
 * ✓ / ✗ — forme ET couleur —, « 9 réussis sur 11 », cartes « Je savais »).
 */

interface Donnees {
  essais: Record<string, Essai[]>
  chapitres: Record<string, SuiviChapitre[]>
}

function lireDonnees(): Donnees {
  const essais = lireEssais()
  const chapitres: Record<string, SuiviChapitre[]> = {}
  for (const l of LEVELS) chapitres[l.slug] = l.chapters.map((c) => suiviChapitre(c, essais, lireParcours(c), lireEtatsCartes(c), titreCourt))
  return { essais, chapitres }
}

/** Année montrée : `?niveau=`, sinon l'année de l'accueil, sinon celle du dernier essai, sinon la première. */
function anneeParDefaut(d: Donnees): string {
  const accueil = anneeDeDepart()
  if (accueil) return accueil
  let meilleure: { slug: string; t: number } | null = null
  for (const [slug, liste] of Object.entries(d.chapitres)) {
    const t = Math.max(0, ...liste.map((c) => c.derniereActivite))
    if (t > 0 && (!meilleure || t > meilleure.t)) meilleure = { slug, t }
  }
  return meilleure?.slug ?? LEVELS[0].slug
}

/** Chapitre montré : le dernier travaillé (essai), sinon le dernier ouvert/commencé, sinon le premier. */
function chapitreParDefaut(liste: SuiviChapitre[]): string | undefined {
  const parEssai = [...liste].sort((a, b) => b.derniereActivite - a.derniereActivite)[0]
  if (parEssai && parEssai.derniereActivite > 0) return parEssai.chapter.slug
  return (liste.find((c) => c.actif) ?? liste[0])?.chapter.slug
}

const LIBELLE_VERDICT: Record<EssaiDate['verdict'], string> = { reussi: 'réussi', aide: 'réussi avec aide', rate: 'raté' }

function Essais({ essais }: { essais: EssaiDate[] }) {
  const derniers = essais.slice(-5)
  const cases = [...derniers, ...Array.from({ length: 5 - derniers.length }, () => null)]
  const libelle = derniers.length ? `${derniers.length} ${derniers.length > 1 ? 'derniers essais' : 'dernier essai'}, du plus ancien au plus récent : ${derniers.map((e) => LIBELLE_VERDICT[e.verdict]).join(', ')}` : 'Aucun essai'
  return (
    <span className="suivi-essais" role="img" aria-label={libelle}>
      {cases.map((e, i) =>
        e ? (
          <i key={i} className={`suivi-case ${e.verdict}`} aria-hidden="true">
            {e.verdict === 'rate' ? '✗' : '✓'}
          </i>
        ) : (
          <i key={i} className="suivi-case vide" aria-hidden="true" />
        ),
      )}
    </span>
  )
}

const TONS: Record<SuiviEtape['ton'], { texte: string; classe: string }> = {
  bien: { texte: 'Bien', classe: 'bien' },
  retravailler: { texte: 'À retravailler', classe: 'revoir' },
  compris: { texte: 'Compris', classe: 'bien' },
  commence: { texte: 'Commencé', classe: 'neutre' },
  vierge: { texte: 'Pas commencé', classe: 'neutre' },
}

function resumeEssais(e: SuiviEtape): string {
  const n = e.essais.length
  if (n === 0) return e.generateurs.length ? 'aucun essai' : ''
  if (n === 1) return `1 essai, ${e.reussis ? (e.avecAide ? 'réussi avec aide' : 'réussi') : 'raté'}`
  if (e.reussis === 0) return `${n} ratés sur ${n}`
  const aide = e.avecAide ? `, dont ${e.avecAide} avec aide` : ''
  return `${e.reussis} ${e.reussis > 1 ? 'réussis' : 'réussi'} sur ${n}${aide}`
}

function LigneEtape({ e }: { e: SuiviEtape }) {
  const ton = TONS[e.ton]
  return (
    <li className="suivi-etape">
      <span className={`suivi-pastille${e.lue ? ' lue' : ''}${e.numero === null ? ' chapitre' : ''}`} aria-hidden="true">
        {e.lue ? '✓' : (e.numero ?? '∑')}
      </span>
      <span className="suivi-etape-nom">
        <Link to={e.href}>
          {e.numero !== null && <span className="sr-only">Point {e.numero} : </span>}
          {e.titre}
        </Link>
        {e.lue && <span className="sr-only"> (point compris)</span>}
      </span>
      <span className={`suivi-ton ${ton.classe}`}>{ton.texte}</span>
      <span className="suivi-etape-detail">
        {e.generateurs.length > 0 ? (
          <span className="suivi-detail-exos">
            <span>Exercices</span> <Essais essais={e.essais} /> <span className="suivi-resume">{resumeEssais(e)}</span>
          </span>
        ) : (
          <span>Pas d'exercice pour ce point</span>
        )}
        {e.section && (
          <span>
            Cartes&nbsp;:{' '}
            {e.cartesTotal === 0
              ? 'aucune'
              : e.cartesSu + e.cartesRevoir === 0
                ? '— pas encore'
                : `${e.cartesSu} / ${e.cartesTotal} « Je savais »${e.cartesRevoir ? `, ${e.cartesRevoir} « À revoir »` : ''}`}
          </span>
        )}
      </span>
    </li>
  )
}

function LienGenerateur({ g, className }: { g: GenerateurSuivi; className: string }) {
  const href = generatorLink(g.chantier, g.id)
  const contenu = (
    <>
      M'entraîner&nbsp;: {g.id} · {g.titre} <span aria-hidden="true">›</span>
    </>
  )
  return estGenerateurMigre(g.chantier, g.id) ? (
    <Link className={className} to={href}>
      {contenu}
    </Link>
  ) : (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {contenu}
      <span className="sr-only"> (nouvel onglet)</span>
    </a>
  )
}

function BlocRetravailler({ chapitre }: { chapitre: SuiviChapitre }) {
  const liste = aRetravailler(chapitre)
  if (!liste.length) return null
  return (
    <section className="suivi-bloc suivi-retravailler" aria-labelledby="titre-retravailler">
      <h2 id="titre-retravailler">À retravailler</h2>
      {liste.map((e) => (
        <div key={e.href + e.titre} className="suivi-retravail">
          <p className="suivi-retravail-titre">{e.numero !== null ? `Point ${e.numero} · ${e.titre}` : e.titre}</p>
          <p className="suivi-retravail-pourquoi">{e.pourquoi}</p>
          <div className="suivi-liens">
            {e.section ? (
              <Link className="suivi-lien" to={e.href}>
                <IconeLivre /> Revoir&nbsp;: point {e.numero}, « {e.titre} »
              </Link>
            ) : (
              <Link className="suivi-lien" to={e.href}>
                <IconeLivre /> Revoir le chapitre
              </Link>
            )}
            {e.cartesRevoir > 0 && (
              <Link className="suivi-lien" to={`/${chapitre.chapter.levelSlug}/${chapitre.chapter.slug}#reviser`}>
                Revoir les cartes « Teste-toi »
              </Link>
            )}
            {e.generateurConseille && <LienGenerateur g={e.generateurConseille} className="suivi-lien plein" />}
          </div>
        </div>
      ))}
    </section>
  )
}

/** Effacer, avec confirmation DANS la page (jamais `confirm()`) et le choix de ce qui part. */
function Effacer({ onEfface }: { onEfface: () => void }) {
  const [ouvert, setOuvert] = useState(false)
  const [essais, setEssais] = useState(true)
  const [plan, setPlan] = useState(true)
  const [chapitres, setChapitres] = useState(false)
  const [fait, setFait] = useState(false)
  const boutonRef = useRef<HTMLButtonElement>(null)
  const panneauRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ouvert) panneauRef.current?.querySelector<HTMLElement>('input')?.focus()
  }, [ouvert])

  function confirmer() {
    if (essais) effacerEssais()
    if (plan) effacerPlan()
    if (chapitres) {
      try {
        for (const l of LEVELS)
          for (const c of l.chapters) {
            window.localStorage.removeItem(`parcours:${c.levelSlug}/${c.slug}`)
            window.localStorage.removeItem(`cartes:${c.levelSlug}/${c.slug}`)
          }
        window.localStorage.removeItem('parcours:derniere-etape')
      } catch {
        // Stockage indisponible : rien n'était gardé.
      }
    }
    setOuvert(false)
    setFait(true)
    onEfface()
    requestAnimationFrame(() => boutonRef.current?.focus())
  }

  return (
    <div className="suivi-effacer">
      {!ouvert && (
        <button ref={boutonRef} type="button" className="suivi-btn danger" onClick={() => {
            setFait(false)
            setOuvert(true)
          }} aria-expanded={false}>
          Effacer ma progression…
        </button>
      )}
      {fait && !ouvert && (
        <p className="suivi-note" role="status">
          C'est effacé sur cet appareil.
        </p>
      )}
      {ouvert && (
        <div ref={panneauRef} className="suivi-confirmer" role="group" aria-labelledby="titre-effacer">
          <p id="titre-effacer" className="suivi-confirmer-titre">
            Effacer quoi, sur cet appareil&nbsp;?
          </p>
          <label className="suivi-case-a-cocher">
            <input type="checkbox" checked={essais} onChange={(e) => setEssais(e.target.checked)} />
            <span>Mes essais d'exercices</span>
          </label>
          <label className="suivi-case-a-cocher">
            <input type="checkbox" checked={plan} onChange={(e) => setPlan(e.target.checked)} />
            <span>Mon plan de révision</span>
          </label>
          <label className="suivi-case-a-cocher">
            <input type="checkbox" checked={chapitres} onChange={(e) => setChapitres(e.target.checked)} />
            <span>
              Les points compris et les cartes « Teste-toi » <span className="suivi-sous">de toutes les années</span>
            </span>
          </label>
          <p className="suivi-note">On ne peut pas revenir en arrière.</p>
          <div className="suivi-boutons">
            <button type="button" className="suivi-btn danger-plein" onClick={confirmer} disabled={!essais && !plan && !chapitres}>
              Oui, effacer
            </button>
            <button type="button" className="suivi-btn" onClick={() => {
                setOuvert(false)
                requestAnimationFrame(() => boutonRef.current?.focus())
              }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function SuiviPage() {
  usePageNonIndexee('Ma progression')
  const [params, setParams] = useSearchParams()
  const [donnees, setDonnees] = useState<Donnees>(lireDonnees)
  const relire = useCallback(() => setDonnees(lireDonnees()), [])

  useEffect(() => {
    window.addEventListener(EVENEMENT_SUIVI, relire)
    window.addEventListener('storage', relire)
    return () => {
      window.removeEventListener(EVENEMENT_SUIVI, relire)
      window.removeEventListener('storage', relire)
    }
  }, [relire])

  const demandee = params.get('niveau')
  const niveau = LEVELS.some((l) => l.slug === demandee) ? demandee! : anneeParDefaut(donnees)
  const level = LEVELS.find((l) => l.slug === niveau)!
  const liste = donnees.chapitres[niveau] ?? []
  const chapDemande = params.get('chapitre')
  const slug = liste.some((c) => c.chapter.slug === chapDemande) ? chapDemande! : chapitreParDefaut(liste)
  const chapitre = liste.find((c) => c.chapter.slug === slug)
  const anneeActive = liste.some((c) => c.actif)
  const plan = useMemo(() => lirePlan(), [donnees])

  const onglets = useRef<(HTMLButtonElement | null)[]>([])
  function choisir(s: string, focus?: boolean) {
    const q = new URLSearchParams(params)
    q.set('niveau', niveau)
    q.set('chapitre', s)
    setParams(q, { replace: true })
    if (focus) requestAnimationFrame(() => onglets.current[liste.findIndex((c) => c.chapter.slug === s)]?.focus())
  }
  function clavier(e: React.KeyboardEvent, i: number) {
    const n = liste.length
    const cible = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
    if (cible < 0) return
    e.preventDefault()
    choisir(liste[cible].chapter.slug, true)
  }

  // L'onglet choisi reste visible dans la rangée qui défile (téléphone).
  useEffect(() => {
    const i = liste.findIndex((c) => c.chapter.slug === slug)
    onglets.current[i]?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [slug, liste])

  return (
    <>
      <SiteHeader />
      <main className="suivi-page">
        <div className="suivi-tete">
          <div>
            <p className="suivi-eyebrow">{level.label}</p>
            <h1>Ma progression</h1>
          </div>
          <nav className="suivi-annees" aria-label="Année">
            {LEVELS.map((l) => (
              <Link key={l.slug} to={`/suivi?niveau=${encodeURIComponent(l.slug)}`} aria-current={l.slug === niveau ? 'page' : undefined} replace>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <BoucleConfiance>
          <b>Gardé sur cet appareil, jamais envoyé.</b> Ton professeur ne le voit pas.
        </BoucleConfiance>

        {!anneeActive && (
          <section className="suivi-bloc suivi-vide">
            <h2>Rien encore en {level.label}</h2>
            <p>
              Ton suivi se remplit tout seul : quand tu marques un point «&nbsp;J'ai compris&nbsp;», quand tu réponds aux cartes «&nbsp;Teste-toi&nbsp;» et à chaque
              exercice terminé d'un générateur.
            </p>
            <Link className="suivi-btn plein" to="/">
              Voir mes chapitres
            </Link>
          </section>
        )}

        {liste.length > 0 && (
          <div className="suivi-onglets" role="tablist" aria-label={`Chapitres de ${level.label}`}>
            {liste.map((c, i) => (
              <button
                key={c.chapter.slug}
                ref={(el) => {
                  onglets.current[i] = el
                }}
                type="button"
                role="tab"
                id={`onglet-${c.chapter.slug}`}
                aria-selected={c.chapter.slug === slug}
                aria-controls="panneau-chapitre"
                tabIndex={c.chapter.slug === slug ? 0 : -1}
                className={`suivi-onglet${c.actif ? ' actif' : ''}`}
                onClick={() => choisir(c.chapter.slug)}
                onKeyDown={(e) => clavier(e, i)}
              >
                <span className="suivi-onglet-num">{c.chapter.chapterNumber}</span>
                {c.chapter.title}
                {c.actif && <span className="sr-only"> (commencé)</span>}
              </button>
            ))}
          </div>
        )}

        {chapitre && (
          <div id="panneau-chapitre" role="tabpanel" aria-labelledby={`onglet-${chapitre.chapter.slug}`}>
            <BlocRetravailler chapitre={chapitre} />
            <section className="suivi-bloc suivi-chapitre" aria-labelledby="titre-chapitre">
              <div className="suivi-chapitre-tete">
                <h2 id="titre-chapitre">
                  <Link to={`/${chapitre.chapter.levelSlug}/${chapitre.chapter.slug}`}>{chapitre.chapter.title}</Link>
                </h2>
                <span className="suivi-meta">
                  {chapitre.lues} / {chapitre.total} points compris
                </span>
              </div>
              <ol className="suivi-etapes">
                {chapitre.etapes.map((e) => (
                  <LigneEtape key={e.href + e.titre} e={e} />
                ))}
              </ol>
              <p className="suivi-legende" aria-hidden="true">
                <span>
                  <i className="suivi-case reussi">✓</i> réussi
                </span>
                <span>
                  <i className="suivi-case aide">✓</i> réussi avec aide
                </span>
                <span>
                  <i className="suivi-case rate">✗</i> raté (réponse montrée)
                </span>
              </p>
            </section>
          </div>
        )}

        <section className="suivi-bloc suivi-plan-lien" aria-labelledby="titre-plan">
          <h2 id="titre-plan">Plan de révision</h2>
          <p>
            {plan
              ? "Ton plan jour par jour jusqu'à l'interro : trois tâches par jour, et un jour raté se décale tout seul."
              : 'Une interro qui approche ? Trois questions (quand, quel chapitre, combien de minutes par jour) et le plan répartit le travail, un peu chaque jour.'}
          </p>
          <Link className="suivi-btn plein" to={plan ? '/suivi/plan' : `/suivi/plan?niveau=${encodeURIComponent(niveau)}${slug ? `&chapitre=${encodeURIComponent(slug)}` : ''}`}>
            {plan ? 'Voir mon plan de révision' : 'Faire mon plan de révision'} <span aria-hidden="true">›</span>
          </Link>
        </section>

        <Effacer onEfface={relire} />
      </main>
    </>
  )
}
