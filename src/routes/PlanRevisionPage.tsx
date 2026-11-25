import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { LEVELS, type LevelEntry } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { lireEtatsCartes, lireParcours, titreCourt } from '../lib/parcoursChapitre'
import { anneeDeDepart } from '../lib/anneeAccueil'
import { lireEssais } from '../lib/suiviEssais'
import { suiviChapitre, type SuiviChapitre } from '../lib/suiviChapitres'
import { ajouterJours, construirePlan, ecartJours, estJour, jourLocal, jourSemaine, type EtapePlan, type Jour, type JourPlan, type Plan, type Tache } from '../lib/planRevision'
import { ecrirePlan, effacerPlan, lirePlan, MINUTES_POSSIBLES, type PlanGarde } from '../lib/planRevisionStockage'
import { estGenerateurMigre, generatorLink } from '../lib/generatorLink'
import { BoucleConfiance } from '../components/suivi/communs'
import '../components/suivi/suivi.css'

/**
 * « Mon plan de révision » (`/suivi/plan`, planche 13, rapport § 4) — public, sans compte, non indexé,
 * jamais pré-rendu. L'élève choisit la date de l'interro, les étapes (préremplies par « À retravailler »),
 * le temps par jour et un jour libre ; le plan (`lib/planRevision.ts`, logique pure) répartit le travail
 * jour par jour, fait revenir les cartes et reporte un jour raté sans rien accumuler. Réglages et cases
 * cochées : `localStorage` seulement (`lib/planRevisionStockage.ts`).
 *
 * Point d'accroche pour la page de classe : `?date=AAAA-MM-JJ` (ou `?interro=`), `&niveau=`, `&chapitre=`,
 * `&etapes=id1,id2` (identifiants de sections du chapitre) ouvrent le formulaire prérempli — voir
 * `lienPlanRevision()`.
 */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const nomJour = (j: Jour) => JOURS[jourSemaine(j)]
function dateLongue(j: Jour, avecJour = true): string {
  const [, m, d] = j.split('-').map(Number)
  const quantieme = d === 1 ? '1er' : String(d)
  return `${avecJour ? `${nomJour(j)} ` : ''}${quantieme} ${MOIS[m - 1]}`
}
const pluriel = (n: number, un: string, plusieurs = `${un}s`) => `${n} ${n > 1 ? plusieurs : un}`
const listeEt = (l: string[]) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}`)

interface InfoEtape extends EtapePlan {
  chapter: ChapterContent
  sectionId: string
  titreCourt: string
}

function suiviAnnee(level: LevelEntry): SuiviChapitre[] {
  const essais = lireEssais()
  return level.chapters.map((c) => suiviChapitre(c, essais, lireParcours(c), lireEtatsCartes(c), titreCourt))
}

/** Étapes du plan à partir des clés gardées (`{chapitre}#{section}`), avec l'état actuel du suivi. */
function etapesDuPlan(cles: string[], suivi: SuiviChapitre[]): InfoEtape[] {
  const plusieursChapitres = new Set(cles.map((k) => k.split('#')[0])).size > 1
  const res: InfoEtape[] = []
  for (const c of suivi) {
    for (const e of c.etapes) {
      if (!e.section) continue
      const cle = `${c.chapter.slug}#${e.section.id}`
      if (!cles.includes(cle)) continue
      const gens = e.generateurs.map((g) => ({ id: g.id, titre: g.titre }))
      if (e.generateurConseille) gens.sort((a, b) => (a.id === e.generateurConseille!.id ? -1 : b.id === e.generateurConseille!.id ? 1 : 0))
      res.push({
        cle,
        numero: e.section.number,
        titre: plusieursChapitres ? `Ch. ${c.chapter.chapterNumber}, étape ${e.section.number}` : `Étape ${e.section.number}`,
        titreCourt: e.titre,
        generateurs: gens,
        cartes: e.cartesTotal,
        cartesARevoir: e.cartesRevoir,
        aRetravailler: e.ton === 'retravailler',
        chapter: c.chapter,
        sectionId: e.section.id,
      })
    }
  }
  return res
}

// --------------------------------------------------------------------------------------------
// Formulaire
// --------------------------------------------------------------------------------------------

interface Brouillon {
  niveau: string
  interro: string
  etapes: string[]
  minutes: number
  jourLibre: number | null
}

function FormulairePlan({
  initial,
  aujourdhui,
  depuisClasse,
  existe,
  onValider,
  onAnnuler,
}: {
  initial: Brouillon
  aujourdhui: Jour
  depuisClasse: boolean
  existe: boolean
  onValider: (b: Brouillon) => void
  onAnnuler?: () => void
}) {
  const [b, setB] = useState<Brouillon>(initial)
  const [erreurs, setErreurs] = useState<{ date?: string; etapes?: string }>({})
  const id = useId()
  const level = LEVELS.find((l) => l.slug === b.niveau) ?? LEVELS[0]
  const suivi = useMemo(() => suiviAnnee(level), [level])
  const demain = ajouterJours(aujourdhui, 1)
  const dateRef = useRef<HTMLInputElement>(null)
  const etapesRef = useRef<HTMLFieldSetElement>(null)

  function basculer(cle: string, oui: boolean) {
    setB((x) => ({ ...x, etapes: oui ? [...x.etapes.filter((k) => k !== cle), cle] : x.etapes.filter((k) => k !== cle) }))
  }

  function valider(e: React.FormEvent) {
    e.preventDefault()
    const err: typeof erreurs = {}
    if (!estJour(b.interro)) err.date = 'Choisis la date de ton interro.'
    else if (b.interro <= aujourdhui) err.date = `L'interro doit être au plus tôt demain, ${dateLongue(demain)}.`
    else if (ecartJours(aujourdhui, b.interro) > 60) err.date = 'Choisis une interro dans les deux mois qui viennent.'
    if (!b.etapes.length) err.etapes = 'Coche au moins une étape.'
    setErreurs(err)
    if (err.date) dateRef.current?.focus()
    else if (err.etapes) etapesRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    else {
      // Étapes dans l'ordre du cours, quel que soit l'ordre des clics.
      const ordre = suivi.flatMap((c) => c.chapter.sections.map((s) => `${c.chapter.slug}#${s.id}`))
      onValider({ ...b, etapes: ordre.filter((k) => b.etapes.includes(k)) })
    }
  }

  const ouverts = new Set(b.etapes.map((k) => k.split('#')[0]))

  return (
    <form className="suivi-bloc plan-formulaire" onSubmit={valider} noValidate aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`}>{existe ? 'Modifier mon plan' : 'Préparer mon plan'}</h2>
      {depuisClasse && <p className="suivi-note">Date et étapes reprises de la page de ta classe. Vérifie, puis valide.</p>}

      <div className="plan-champ">
        <label htmlFor={`${id}-date`}>Date de l'interro</label>
        <input
          ref={dateRef}
          id={`${id}-date`}
          type="date"
          min={demain}
          value={b.interro}
          onChange={(e) => setB((x) => ({ ...x, interro: e.target.value }))}
          aria-invalid={!!erreurs.date}
          aria-describedby={erreurs.date ? `${id}-date-err` : undefined}
        />
        {erreurs.date && (
          <p id={`${id}-date-err`} className="plan-erreur">
            {erreurs.date}
          </p>
        )}
      </div>

      <div className="plan-champ">
        <label htmlFor={`${id}-niveau`}>Année</label>
        <select id={`${id}-niveau`} value={b.niveau} onChange={(e) => setB((x) => ({ ...x, niveau: e.target.value, etapes: [] }))}>
          {LEVELS.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset ref={etapesRef} className="plan-champ plan-etapes" aria-describedby={erreurs.etapes ? `${id}-etapes-err` : `${id}-etapes-aide`}>
        <legend>Ce que l'interro couvre</legend>
        <p id={`${id}-etapes-aide`} className="suivi-note">
          Coche les étapes annoncées. Celles «&nbsp;À retravailler&nbsp;» sont déjà cochées.
        </p>
        {erreurs.etapes && (
          <p id={`${id}-etapes-err`} className="plan-erreur">
            {erreurs.etapes}
          </p>
        )}
        {suivi.map((c) => {
          const cles = c.chapter.sections.map((s) => `${c.chapter.slug}#${s.id}`)
          const cochees = cles.filter((k) => b.etapes.includes(k)).length
          return (
            <details key={c.chapter.slug} className="plan-chapitre" open={ouverts.has(c.chapter.slug) || undefined}>
              <summary>
                <span className="plan-chapitre-num">{c.chapter.chapterNumber}</span>
                <span className="plan-chapitre-titre">{c.chapter.title}</span>
                {cochees > 0 && <span className="suivi-ton neutre">{pluriel(cochees, 'étape')}</span>}
              </summary>
              <label className="suivi-case-a-cocher tout">
                <input
                  type="checkbox"
                  checked={cochees === cles.length}
                  ref={(el) => {
                    if (el) el.indeterminate = cochees > 0 && cochees < cles.length
                  }}
                  onChange={(e) => setB((x) => ({ ...x, etapes: e.target.checked ? [...x.etapes.filter((k) => !cles.includes(k)), ...cles] : x.etapes.filter((k) => !cles.includes(k)) }))}
                />
                <span>Tout le chapitre</span>
              </label>
              {c.etapes
                .filter((e) => e.section)
                .map((e) => {
                  const cle = `${c.chapter.slug}#${e.section!.id}`
                  return (
                    <label key={cle} className="suivi-case-a-cocher">
                      <input type="checkbox" checked={b.etapes.includes(cle)} onChange={(ev) => basculer(cle, ev.target.checked)} />
                      <span>
                        Étape {e.numero} · {e.titre}
                        {e.ton === 'retravailler' && <span className="suivi-ton revoir">À retravailler</span>}
                        {e.lue && e.ton !== 'retravailler' && <span className="suivi-sous"> · comprise</span>}
                      </span>
                    </label>
                  )
                })}
            </details>
          )
        })}
      </fieldset>

      <fieldset className="plan-champ">
        <legend>Temps par jour</legend>
        <div className="plan-segments">
          {MINUTES_POSSIBLES.map((m) => (
            <label key={m} className={`plan-segment${b.minutes === m ? ' choisi' : ''}`}>
              <input type="radio" name={`${id}-minutes`} value={m} checked={b.minutes === m} onChange={() => setB((x) => ({ ...x, minutes: m }))} />
              <span>{m}&nbsp;min</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="plan-champ">
        <label htmlFor={`${id}-libre`}>Un jour sans révision</label>
        <select id={`${id}-libre`} value={b.jourLibre ?? ''} onChange={(e) => setB((x) => ({ ...x, jourLibre: e.target.value === '' ? null : Number(e.target.value) }))}>
          <option value="">Aucun</option>
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <option key={d} value={d}>
              {majuscule(JOURS[d])}
            </option>
          ))}
        </select>
      </div>

      <div className="suivi-boutons">
        <button type="submit" className="suivi-btn plein">
          {existe ? 'Refaire mon plan' : 'Faire mon plan'}
        </button>
        {onAnnuler && (
          <button type="button" className="suivi-btn" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>
      {existe && <p className="suivi-note">Refaire le plan repart d'aujourd'hui ; les cases déjà cochées restent cochées.</p>}
    </form>
  )
}

// --------------------------------------------------------------------------------------------
// Affichage du plan
// --------------------------------------------------------------------------------------------

function compter(taches: Tache[]): string {
  const ex = taches.filter((t) => t.type === 'exercices').reduce((s, t) => s + t.nombre, 0)
  const exemples = taches.filter((t) => t.type === 'exemple').length
  const cartes = taches.filter((t) => t.type === 'cartes' || t.type === 'cartesRevoir').reduce((s, t) => s + t.nombre, 0)
  const morceaux: string[] = []
  if (ex) morceaux.push(pluriel(ex, 'exercice'))
  if (exemples) morceaux.push(pluriel(exemples, 'exemple'))
  if (cartes) morceaux.push(pluriel(cartes, 'carte'))
  return morceaux.join(' + ')
}

function titreJour(j: JourPlan, infos: Map<string, InfoEtape>): string {
  const noms = j.etapes.map((k) => infos.get(k)).filter((x): x is InfoEtape => !!x)
  const compte = compter(j.taches)
  const suite = compte ? ` · ${compte}` : ''
  switch (j.role) {
    case 'apprendre': {
      if (noms.length === 1) return `${noms[0].titre}\u00a0: ${noms[0].titreCourt}${suite}`
      const memeChapitre = noms.every((n) => n.titre.startsWith('Étape'))
      return `${memeChapitre ? `Étapes ${listeEt(noms.map((n) => String(n.numero)))}` : listeEt(noms.map((n) => n.titre))}${suite}`
    }
    case 'melange': {
      const memeChapitre = noms.every((n) => n.titre.startsWith('Étape'))
      if (noms.length === 1) return `Encore ${noms[0].titre.replace(/^Étape/, "l'étape")}${suite}`
      return `Mélange des étapes${memeChapitre && noms.length <= 5 ? ` ${listeEt(noms.map((n) => String(n.numero)))}` : ''}${suite}`
    }
    case 'blanche':
      return `Évaluation blanche (20 min)${j.taches.some((t) => t.type === 'cartes') ? ' + cartes' : ''}`
    case 'veille':
      return j.taches.some((t) => t.type === 'cartesRevoir') ? `Seulement les cartes « À revoir » · 10 min` : `Un dernier tour, léger · 10 min`
    case 'essentiel':
      return `L'essentiel : les cartes et un exercice par étape`
    case 'libre':
      return 'Libre'
    case 'interro':
      return 'Interro — bonne chance !'
  }
}

function LienTache({ t, infos }: { t: Tache; infos: Map<string, InfoEtape> }) {
  const info = t.etape ? infos.get(t.etape) : undefined
  const premier = [...infos.values()][0]
  if (t.type === 'exercices' && t.generateur && info) {
    const href = generatorLink(info.chapter.levelSlug, t.generateur.id)
    return estGenerateurMigre(info.chapter.levelSlug, t.generateur.id) ? (
      <Link to={href}>Ouvrir {t.generateur.id} ›</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">
        Ouvrir {t.generateur.id} ›<span className="sr-only"> (nouvel onglet)</span>
      </a>
    )
  }
  if ((t.type === 'relire' || t.type === 'exemple') && info) return <Link to={`/${info.chapter.levelSlug}/${info.chapter.slug}#${encodeURIComponent(info.sectionId)}`}>Ouvrir l'étape ›</Link>
  if (t.type === 'cartes' && info) return <Link to={`/${info.chapter.levelSlug}/${info.chapter.slug}#reviser`}>Ouvrir les cartes ›</Link>
  if (t.type === 'cartesRevoir' && premier) return <Link to={`/${premier.chapter.levelSlug}/${premier.chapter.slug}#reviser`}>Ouvrir les cartes ›</Link>
  if (t.type === 'blanche' && premier) return <Link to={`/${premier.chapter.levelSlug}/${premier.chapter.slug}/exercices`}>Préparer l'évaluation blanche ›</Link>
  return null
}

function TexteTache({ t, infos }: { t: Tache; infos: Map<string, InfoEtape> }) {
  const info = t.etape ? infos.get(t.etape) : undefined
  const etape = info ? `${info.titre} · ${info.titreCourt}` : ''
  switch (t.type) {
    case 'relire':
      return { nom: `Relire « L'essentiel » de l'${info ? info.titre.replace(/^Étape/, 'étape') : 'étape'}`, sous: info?.titreCourt ?? '' }
    case 'exercices':
      return { nom: `${pluriel(t.nombre, 'exercice')} : ${t.generateur?.titre ?? ''}`, sous: `${t.generateur?.id ?? ''} · ${etape}` }
    case 'exemple':
      return { nom: 'Refaire un exemple résolu sans regarder, puis comparer', sous: etape }
    case 'cartes':
      return { nom: `${pluriel(t.nombre, 'carte')} « Teste-toi »`, sous: etape }
    case 'cartesRevoir':
      return { nom: `Les cartes « À revoir » (${t.nombre})`, sous: "Toutes les étapes de l'interro" }
    case 'blanche':
      return { nom: 'Évaluation blanche', sous: '20 minutes, comme un vrai contrôle, puis le corrigé' }
  }
}

function LigneTache({ t, infos, onCocher }: { t: Tache; infos: Map<string, InfoEtape>; onCocher: (id: string, oui: boolean) => void }) {
  const id = useId()
  const { nom, sous } = TexteTache({ t, infos }) as { nom: string; sous: string }
  return (
    <li className={`plan-tache${t.faite ? ' faite' : ''}`}>
      <label className="plan-coche">
        <input id={id} type="checkbox" checked={!!t.faite} onChange={(e) => onCocher(t.id, e.target.checked)} />
      </label>
      <span className="plan-tache-texte">
        <label htmlFor={id} className="plan-tache-nom">
          {nom}
          {t.revue && t.revue >= 2 && <span className="plan-rappel">revue n° {t.revue}</span>}
          {t.reporteeDe && <span className="plan-rappel reporte">reporté de {nomJour(t.reporteeDe)}</span>}
          {t.faite && <span className="plan-fait"> · fait</span>}
        </label>
        <span className="plan-tache-sous">
          {sous && <span>{sous}</span>} <LienTache t={t} infos={infos} />
        </span>
      </span>
      <span className="plan-duree">{t.minutes}&nbsp;min</span>
    </li>
  )
}

function resumeReports(j: JourPlan): string {
  const parType = (types: Tache['type'][]) => j.reports.filter((r) => types.includes(r.tache.type))
  const morceaux: string[] = []
  const ex = parType(['exercices', 'exemple'])
  if (ex.length) {
    const vers = new Map<string, number>()
    let abandon = 0
    for (const r of ex) {
      if (r.vers) vers.set(r.vers, (vers.get(r.vers) ?? 0) + 1)
      else abandon++
    }
    const ou = [...vers.entries()].map(([d, n]) => `${n} ${nomJour(d)}`)
    morceaux.push(`${pluriel(ex.length, 'exercice')} → ${ou.length ? `reporté${ex.length - abandon > 1 ? 's' : ''} : ${listeEt(ou)}` : ''}${abandon ? `${ou.length ? ', ' : ''}${abandon} laissé${abandon > 1 ? 's' : ''} de côté` : ''}`)
  }
  const cartes = parType(['cartes', 'cartesRevoir'])
  if (cartes.length) {
    const n = cartes.reduce((s, r) => s + r.tache.nombre, 0)
    const ou = [...new Set(cartes.filter((r) => r.vers).map((r) => nomJour(r.vers!)))]
    morceaux.push(`${pluriel(n, 'carte')} → ${ou.length ? listeEt(ou) : 'laissées de côté'}`)
  }
  if (parType(['relire']).some((r) => r.vers)) morceaux.push('la relecture aussi')
  if (parType(['blanche']).length) morceaux.push('évaluation blanche pas faite : tu peux la faire quand tu as 20 minutes')
  return morceaux.length ? `${majuscule(morceaux.join(' ; '))}.` : ''
}

function JourLigne({ j, infos, ouvert, onCocher }: { j: JourPlan; infos: Map<string, InfoEtape>; ouvert: boolean; onCocher: (id: string, oui: boolean) => void }) {
  const passe = j.statut === 'fait' || j.statut === 'partiel' || j.statut === 'rate' || j.statut === 'passe'
  const etat = j.statut === 'fait' ? 'fait' : j.statut === 'partiel' ? 'en partie' : j.statut === 'rate' ? 'pas fait' : ''
  const classes = ['plan-jour', `role-${j.role}`, j.statut === 'aujourdhui' ? 'aujourdhui' : '', j.statut === 'fait' ? 'fait' : '', j.statut === 'rate' || j.statut === 'partiel' ? 'rate' : '', passe ? 'passe' : ''].filter(Boolean).join(' ')
  const point = j.statut === 'fait' ? '✓' : j.statut === 'rate' ? '–' : j.statut === 'partiel' ? '½' : ''
  const date = `${j.statut === 'aujourdhui' ? "Aujourd'hui · " : ''}${j.statut === 'aujourdhui' ? dateLongue(j.jour) : majuscule(dateLongue(j.jour))}${etat ? ` · ${etat}` : ''}`
  const titre = titreJour(j, infos)
  const avecTaches = j.taches.length > 0 && !passe
  const corps = (
    <ul className="plan-carte">
      {j.taches.map((t) => (
        <LigneTache key={t.id} t={t} infos={infos} onCocher={onCocher} />
      ))}
    </ul>
  )
  return (
    <li className={classes} aria-current={j.statut === 'aujourdhui' ? 'date' : undefined}>
      <span className="plan-point" aria-hidden="true">
        {point}
      </span>
      <p className="plan-date">{date}</p>
      {avecTaches && !ouvert ? (
        <details className="plan-details">
          <summary className="plan-titre">
            {titre}
            <span className="plan-voir-sep"> · </span>
            <span className="plan-voir">voir les tâches</span>
          </summary>
          {corps}
        </details>
      ) : (
        <p className="plan-titre">{titre}</p>
      )}
      {avecTaches && ouvert && corps}
      {passe && j.statut === 'fait' && j.taches.length > 0 && <p className="plan-report">Fait&nbsp;: {compter(j.taches) || 'tout'}.</p>}
      {passe && j.reports.length > 0 && <p className="plan-report">{resumeReports(j)}</p>}
    </li>
  )
}

function VuePlan({
  garde,
  plan,
  infos,
  aujourdhui,
  onCocher,
  onModifier,
  onSupprimer,
  stockageOk,
}: {
  garde: PlanGarde
  plan: Plan
  infos: Map<string, InfoEtape>
  aujourdhui: Jour
  onCocher: (id: string, oui: boolean) => void
  onModifier: () => void
  onSupprimer: () => void
  stockageOk: boolean
}) {
  const [confirmer, setConfirmer] = useState(false)
  const listeInfos = [...infos.values()]
  const parChapitre = new Map<string, number[]>()
  for (const i of listeInfos) parChapitre.set(i.chapter.title, [...(parChapitre.get(i.chapter.title) ?? []), i.numero])
  const sujet = [...parChapitre.entries()].map(([t, n]) => `${t}, ${n.length > 1 ? 'étapes' : 'étape'} ${listeEt(n.map(String))}`).join(' · ')
  const restants = Math.max(0, ecartJours(aujourdhui, garde.interro))
  const demain = ajouterJours(aujourdhui, 1)
  const premier = listeInfos[0]

  return (
    <>
      <p className="suivi-eyebrow">
        Interro du {dateLongue(garde.interro)}
        {sujet ? ` · ${sujet}` : ''}
      </p>
      <h1 tabIndex={-1}>Mon plan de révision</h1>
      {plan.termine ? (
        <section className="suivi-bloc">
          <h2>{garde.interro === aujourdhui ? "C'est aujourd'hui : bonne chance\u00a0!" : `L'interro du ${dateLongue(garde.interro)} est passée.`}</h2>
          <p className="suivi-chapeau">Une autre interro en vue&nbsp;? Fais un nouveau plan.</p>
          <div className="suivi-boutons">
            <button type="button" className="suivi-btn plein" onClick={onModifier}>
              Faire un nouveau plan
            </button>
            <Link className="suivi-btn" to="/suivi">
              Mon suivi
            </Link>
          </div>
        </section>
      ) : (
        <>
          <p className="suivi-chapeau">
            Un peu chaque jour plutôt que tout la veille. Les cartes reviennent quand tu commences à les oublier&nbsp;: le lendemain, puis 3 jours après, puis une semaine.
          </p>
          <div className="plan-resume">
            <span className="suivi-ton neutre">{restants === 1 ? 'Interro demain' : `Encore ${pluriel(restants, 'jour')}`}</span>
            <span className="suivi-ton neutre">≈ {plan.minutesMoyennes}&nbsp;min par jour</span>
            {garde.jourLibre !== null && <span className="suivi-ton neutre">{JOURS[garde.jourLibre]} libre</span>}
            <button type="button" className="suivi-ton neutre bouton" onClick={onModifier}>
              Modifier <span aria-hidden="true">›</span>
            </button>
          </div>
          {plan.essentielSeulement && (
            <p className="suivi-note plan-alerte" role="status">
              Il ne reste pas assez de jours pour tout rattraper&nbsp;: le plan garde l'essentiel, les cartes et un exercice par étape. Ce qui est laissé de côté n'est pas grave.
            </p>
          )}
          {!stockageOk && (
            <p className="suivi-note plan-alerte" role="status">
              Ce navigateur ne garde rien en ce moment (navigation privée&nbsp;?)&nbsp;: ton plan vaut pour cette visite seulement.
            </p>
          )}
        </>
      )}

      <ol className="plan-jours" aria-label="Jour par jour">
        {plan.jours.map((j) => (
          <JourLigne key={j.jour} j={j} infos={infos} ouvert={j.jour === aujourdhui || j.jour === demain} onCocher={onCocher} />
        ))}
      </ol>

      {!plan.termine && (
        <section className="suivi-bloc">
          <h2>Et si je rate un jour&nbsp;?</h2>
          <p className="suivi-chapeau">
            Rien ne s'accumule. Ce qui n'a pas été fait est réparti sur les jours suivants, jamais plus de 10&nbsp;minutes en plus par jour. S'il ne reste plus assez de temps, le
            plan garde l'essentiel&nbsp;: les cartes «&nbsp;À revoir&nbsp;» et un exercice par étape.
          </p>
          {premier && (
            <p className="suivi-chapeau">
              L'évaluation blanche est prévue l'avant-veille. Tu peux aussi la faire quand tu veux&nbsp;:{' '}
              <Link to={`/${premier.chapter.levelSlug}/${premier.chapter.slug}/exercices`}>préparer une évaluation blanche</Link>.
            </p>
          )}
        </section>
      )}

      <BoucleConfiance>
        <b>Ton plan reste sur cet appareil.</b> Les cases cochées ne sont envoyées à personne.
      </BoucleConfiance>

      <div className="suivi-boutons">
        <Link className="suivi-btn" to={`/suivi?niveau=${encodeURIComponent(garde.niveau)}`}>
          ‹ Mon suivi
        </Link>
        {!plan.termine && (
          <button type="button" className="suivi-btn" onClick={onModifier}>
            Modifier mon plan
          </button>
        )}
        {!confirmer ? (
          <button type="button" className="suivi-btn danger" onClick={() => setConfirmer(true)}>
            Supprimer ce plan…
          </button>
        ) : (
          <span className="suivi-confirmer en-ligne" role="group" aria-label="Supprimer ce plan">
            <span>Supprimer ce plan et ses cases cochées&nbsp;?</span>
            <button type="button" className="suivi-btn danger-plein" onClick={onSupprimer} autoFocus>
              Oui, supprimer
            </button>
            <button type="button" className="suivi-btn" onClick={() => setConfirmer(false)}>
              Annuler
            </button>
          </span>
        )}
      </div>
    </>
  )
}

export function PlanRevisionPage() {
  usePageNonIndexee('Mon plan de révision')
  const [params, setParams] = useSearchParams()
  const aujourdhui = jourLocal(new Date())
  const [garde, setGarde] = useState<PlanGarde | null>(lirePlan)
  const [stockageOk, setStockageOk] = useState(true)

  // Préremplissage venu d'ailleurs (page de classe, Mon suivi) : `?date=` / `?interro=`, `?niveau=`,
  // `?chapitre=`, `?etapes=`.
  const dateDemandee = params.get('date') ?? params.get('interro')
  const niveauDemande = params.get('niveau')
  const chapitreDemande = params.get('chapitre')
  const etapesDemandees = params.get('etapes')
  const depuisLien = !!(dateDemandee || etapesDemandees)
  const [edition, setEdition] = useState<boolean>(() => !garde || depuisLien)

  const initial = useMemo<Brouillon>(() => {
    const niveau = LEVELS.some((l) => l.slug === niveauDemande) ? niveauDemande! : (garde?.niveau ?? anneeDeDepart() ?? LEVELS[0].slug)
    const level = LEVELS.find((l) => l.slug === niveau)!
    const suivi = suiviAnnee(level)
    let etapes: string[] = []
    const chap = level.chapters.find((c) => c.slug === chapitreDemande)
    if (chap && etapesDemandees) {
      const ids = etapesDemandees.split(',').map((s) => s.trim())
      etapes = chap.sections.filter((s) => ids.includes(s.id)).map((s) => `${chap.slug}#${s.id}`)
    } else if (garde && garde.niveau === niveau && !chap) etapes = garde.etapes
    if (!etapes.length) {
      // « À retravailler » de l'année (du chapitre demandé s'il y en a un), sinon les étapes travaillées du chapitre.
      const chapitres = chap ? suivi.filter((c) => c.chapter.slug === chap.slug) : suivi
      etapes = chapitres.flatMap((c) => c.etapes.filter((e) => e.section && e.ton === 'retravailler').map((e) => `${c.chapter.slug}#${e.section!.id}`))
      if (!etapes.length) {
        const cible = chap ? suivi.find((c) => c.chapter.slug === chap.slug) : [...suivi].sort((a, b) => b.derniereActivite - a.derniereActivite).find((c) => c.actif)
        if (cible) etapes = cible.etapes.filter((e) => e.section && (e.lue || e.essais.length > 0)).map((e) => `${cible.chapter.slug}#${e.section!.id}`)
      }
    }
    const interro = estJour(dateDemandee) ? dateDemandee : garde && garde.interro > aujourdhui ? garde.interro : ''
    return { niveau, interro, etapes, minutes: garde?.minutes ?? 20, jourLibre: garde?.jourLibre ?? null }
  }, [garde, niveauDemande, chapitreDemande, etapesDemandees, dateDemandee, aujourdhui])

  const level = LEVELS.find((l) => l.slug === garde?.niveau)
  const infosListe = useMemo(() => (garde && level ? etapesDuPlan(garde.etapes, suiviAnnee(level)) : []), [garde, level])
  const infos = useMemo(() => new Map(infosListe.map((i) => [i.cle, i])), [infosListe])
  const plan = useMemo(
    () => (garde ? construirePlan({ debut: garde.debut, interro: garde.interro, minutesParJour: garde.minutes, jourLibre: garde.jourLibre, etapes: infosListe }, aujourdhui, garde.faites) : null),
    [garde, infosListe, aujourdhui],
  )

  function enregistrer(p: PlanGarde) {
    setGarde(p)
    setStockageOk(ecrirePlan(p))
  }

  function valider(b: Brouillon) {
    enregistrer({ debut: aujourdhui, interro: b.interro, minutes: b.minutes, jourLibre: b.jourLibre, niveau: b.niveau, etapes: b.etapes, faites: garde?.faites ?? [] })
    setEdition(false)
    if (depuisLien) setParams(new URLSearchParams(), { replace: true })
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.suivi-page h1')?.focus())
  }

  function cocher(id: string, oui: boolean) {
    if (!garde) return
    const faites = oui ? [...garde.faites.filter((x) => x !== id), id] : garde.faites.filter((x) => x !== id && !x.startsWith(`${id}#`))
    enregistrer({ ...garde, faites })
  }

  // Une page ouverte dans un autre onglet garde le même plan.
  useEffect(() => {
    const relire = () => setGarde(lirePlan())
    window.addEventListener('storage', relire)
    return () => window.removeEventListener('storage', relire)
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="suivi-page plan-page">
        {edition || !garde || !plan ? (
          <>
            <p className="suivi-eyebrow">Plan de révision</p>
            <h1 tabIndex={-1}>Mon plan de révision</h1>
            <p className="suivi-chapeau">
              Un peu chaque jour plutôt que tout la veille&nbsp;: dis quand tombe l'interro et ce qu'elle couvre, le plan répartit le travail jusque-là.
            </p>
            <FormulairePlan
              key={`${initial.niveau}-${initial.interro}-${initial.etapes.join(',')}`}
              initial={initial}
              aujourdhui={aujourdhui}
              depuisClasse={!!dateDemandee}
              existe={!!garde}
              onValider={valider}
              onAnnuler={
                garde
                  ? () => {
                      setEdition(false)
                      if (depuisLien) setParams(new URLSearchParams(), { replace: true })
                    }
                  : undefined
              }
            />
            <BoucleConfiance>
              <b>Ton plan reste sur cet appareil.</b> Rien n'est envoyé, à personne.
            </BoucleConfiance>
            <p>
              <Link className="suivi-btn" to="/suivi">
                ‹ Mon suivi
              </Link>
            </p>
          </>
        ) : (
          <VuePlan
            garde={garde}
            plan={plan}
            infos={infos}
            aujourdhui={aujourdhui}
            onCocher={cocher}
            onModifier={() => setEdition(true)}
            onSupprimer={() => {
              effacerPlan()
              setGarde(null)
              setEdition(true)
            }}
            stockageOk={stockageOk}
          />
        )}
      </main>
    </>
  )
}
