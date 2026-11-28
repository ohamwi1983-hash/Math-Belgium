import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { RichText } from '../components/Math'
import { LEVELS, type LevelEntry } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { lireEtatsCartes, lireParcours, titreCourt } from '../lib/parcoursChapitre'
import { anneeDeDepart } from '../lib/anneeAccueil'
import { EVENEMENT_SUIVI, lireEssais, verdict } from '../lib/suiviEssais'
import { suiviChapitre, type SuiviChapitre } from '../lib/suiviChapitres'
import {
  ajouterJours,
  cochesAutomatiques,
  construirePlan,
  ecartJours,
  estJour,
  grouperTaches,
  jourLocal,
  jourSemaine,
  type EtapePlan,
  type Jour,
  type JourPlan,
  type Plan,
  type TacheGroupee,
} from '../lib/planRevision'
import { ecrirePlan, effacerPlan, lirePlan, MINUTES_DEFAUT, MINUTES_POSSIBLES, type PlanGarde } from '../lib/planRevisionStockage'
import { estGenerateurMigre, generatorLink } from '../lib/generatorLink'
import { urlEntrainementEleve } from '../lib/carnetMatiere'
import { BoucleConfiance } from '../components/suivi/communs'
import { chargerSupabase, supabaseConfigure } from '../lib/supabase'
import { clesInterro, garderPage, lireCodeGarde, lirePageGardee, nomInterro, signatureAnnonce, signatureInterro, type InterroPubliee } from '../lib/pageClasse'
import '../components/suivi/suivi.css'

/**
 * « Mon plan de révision » (`/suivi/plan`) — public, sans compte, non indexé, jamais pré-rendu. Refait
 * le 27/11/2026 (maquette « plan-eleve ») :
 * - prérempli depuis une interro annoncée par le professeur (« Je prépare mon interro » de la page de
 *   classe ou de l'accueil) : `?date=AAAA-MM-JJ&niveau=…&chapitre=…&etapes=id1,id2&gen=g1,g2&type=bilan`
 *   (`?interro=` vaut `?date=`) — l'élève ne choisit plus que ses minutes par jour ;
 * - sinon trois questions : quand, quel chapitre (étapes ajustables), combien de minutes par jour ;
 * - le plan : rangée des jours jusqu'à l'interro, « Aujourd'hui · n min » avec au plus trois tâches
 *   concrètes et leur bouton « Go » (relire « L'essentiel », k exercices d'un générateur — ceux à
 *   retravailler d'abord —, cartes « Teste-toi », évaluation blanche l'avant-veille), puis « Demain » et
 *   les jours suivants en une ligne. Un jour raté se décale tout seul (`planRevision.ts`), sans jargon.
 * Les exercices terminés (« Ma progression », `suiviEssais.ts`) cochent d'office les tâches d'exercices
 * du jour. Tout reste dans le navigateur (`planRevisionStockage.ts`).
 */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const JOURS_COURTS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const nomJour = (j: Jour) => JOURS[jourSemaine(j)]
const numeroJour = (j: Jour) => Number(j.slice(8, 10))
/** « mardi 2/12 ». */
const dateCourte = (j: Jour) => `${nomJour(j)} ${numeroJour(j)}/${Number(j.slice(5, 7))}`
/** « mardi 2 décembre ». */
function dateLongue(j: Jour): string {
  const d = numeroJour(j)
  return `${nomJour(j)} ${d === 1 ? '1er' : d} ${MOIS[Number(j.slice(5, 7)) - 1]}`
}
const pluriel = (n: number, un: string, plusieurs = `${un}s`) => `${n} ${n > 1 ? plusieurs : un}`
const listeEt = (l: string[]) => (l.length <= 1 ? l.join('') : `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}`)

/** « point 2 », « points 1 à 3 », « points 1, 2 et 4 ». */
function texteEtapes(numeros: number[]): string {
  const n = [...new Set(numeros)].sort((a, b) => a - b)
  if (n.length === 0) return ''
  if (n.length === 1) return `point ${n[0]}`
  const suite = n.every((x, i) => i === 0 || x === n[i - 1] + 1)
  return suite && n.length >= 3 ? `points ${n[0]} à ${n[n.length - 1]}` : `points ${listeEt(n.map(String))}`
}

/** « du point 2 », « des points 1 à 3 » (« Relire « L'essentiel » du point 1 »). */
function dePoints(numeros: number[]): string {
  const t = texteEtapes(numeros)
  return t ? `${t.startsWith('points') ? 'des' : 'du'} ${t}` : ''
}

/** « Aujourd'hui », « Demain », « Lundi » (dans la semaine), « Lundi 7/12 » (plus loin). */
function libelleJour(j: Jour, aujourdhui: Jour): string {
  const ecart = ecartJours(aujourdhui, j)
  if (ecart === 0) return "Aujourd'hui"
  if (ecart === 1) return 'Demain'
  if (ecart > 1 && ecart < 7) return majuscule(nomJour(j))
  return majuscule(dateCourte(j))
}

/** Quand, en mots d'élève : « aujourd'hui », « hier », « mercredi », « le 12/11 ». */
function quandRelatif(j: Jour, aujourdhui: Jour): string {
  const ecart = ecartJours(j, aujourdhui)
  if (ecart <= 0) return 'aujourd’hui'
  if (ecart === 1) return 'hier'
  if (ecart < 7) return nomJour(j)
  return `le ${numeroJour(j)}/${Number(j.slice(5, 7))}`
}

interface InfoEtape extends EtapePlan {
  chapter: ChapterContent
  sectionId: string
  titreCourt: string
}

function suiviAnnee(level: LevelEntry): SuiviChapitre[] {
  const essais = lireEssais()
  return level.chapters.map((c) => suiviChapitre(c, essais, lireParcours(c), lireEtatsCartes(c), titreCourt))
}

/** Étapes du plan (clés `{chapitre}#{section}`) avec l'état actuel de « Ma progression ». Générateurs :
 * celui à retravailler d'abord ; si le professeur en a retenu pour l'interro (`gens`), seulement ceux-là
 * dans les étapes qui en ont. */
function etapesDuPlan(cles: string[], suivi: SuiviChapitre[], gens: string[] = []): InfoEtape[] {
  const plusieursChapitres = new Set(cles.map((k) => k.split('#')[0])).size > 1
  const res: InfoEtape[] = []
  for (const c of suivi) {
    for (const e of c.etapes) {
      if (!e.section) continue
      const cle = `${c.chapter.slug}#${e.section.id}`
      if (!cles.includes(cle)) continue
      let liste = e.generateurs.map((g) => ({ id: g.id, titre: g.titre }))
      const retenus = liste.filter((g) => gens.includes(g.id))
      if (retenus.length > 0) liste = retenus
      const conseille = e.ton === 'retravailler' ? e.generateurConseille?.id : undefined
      if (conseille) liste.sort((a, b) => (a.id === conseille ? -1 : b.id === conseille ? 1 : 0))
      res.push({
        cle,
        numero: e.section.number,
        titre: plusieursChapitres ? `Ch. ${c.chapter.chapterNumber}, point ${e.section.number}` : `Point ${e.section.number}`,
        titreCourt: e.titre,
        generateurs: liste,
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

/** Nombre d'exercices de ce générateur terminés ce jour-là (« Ma progression »). */
function compteurEssais(): (jour: Jour, generateur: string) => number {
  const stock = lireEssais()
  const cache = new Map<string, Map<Jour, number>>()
  return (jour, g) => {
    let parJour = cache.get(g)
    if (!parJour) {
      parJour = new Map()
      for (const e of stock[g] ?? []) {
        const j = jourLocal(new Date(e.t))
        parJour.set(j, (parJour.get(j) ?? 0) + 1)
      }
      cache.set(g, parJour)
    }
    return parJour.get(jour) ?? 0
  }
}

/** Dernier jour (14 derniers jours) où un essai de ce générateur a été raté, sinon `null`. */
function derniereDifficulte(generateur: string, aujourdhui: Jour): Jour | null {
  const essais = lireEssais()[generateur] ?? []
  for (let i = essais.length - 1; i >= 0; i--) {
    const j = jourLocal(new Date(essais[i].t))
    if (ecartJours(j, aujourdhui) > 14) break
    if (verdict(essais[i].e) === 'rate') return j
  }
  return null
}

// --------------------------------------------------------------------------------------------
// Ce que dit une tâche, et où mène « Go »
// --------------------------------------------------------------------------------------------

interface Contexte {
  infos: Map<string, InfoEtape>
  aujourdhui: Jour
  gensProf: string[]
}

function numerosDe(etapes: string[], ctx: Contexte): number[] {
  return etapes.map((k) => ctx.infos.get(k)?.numero).filter((n): n is number => n !== undefined)
}

/** Libellé principal (avec le code du générateur en gras) et sous-titre. */
function texteTache(g: TacheGroupee, ctx: Contexte): { nom: ReactNode; texte: string; sous: ReactNode } {
  switch (g.type) {
    case 'relire': {
      const e = dePoints(numerosDe(g.etapes, ctx))
      const seule = g.etapes.length === 1 ? ctx.infos.get(g.etapes[0]) : undefined
      const t = `Relire « L'essentiel » ${e}`
      return { nom: t, texte: t, sous: seule ? <RichText text={seule.titreCourt} /> : '' }
    }
    case 'blanche':
      return { nom: 'Évaluation blanche (20 min) puis corrigé', texte: 'Évaluation blanche (20 min) puis corrigé', sous: 'Comme un vrai contrôle, sans regarder le cours.' }
    case 'cartes': {
      if (g.aRevoir) {
        const t = `Teste-toi : tes ${pluriel(g.cartes, 'carte')} « À revoir »`
        return { nom: t, texte: t, sous: 'Tous les points de l’interro.' }
      }
      const t = `Teste-toi : ${pluriel(g.cartes, 'carte')} ${dePoints(numerosDe(g.etapes, ctx))}`
      return { nom: t, texte: t, sous: '' }
    }
    case 'exercices': {
      if (g.exercices.length === 1) {
        const x = g.exercices[0]
        if (!x.generateur) {
          const info = x.etape ? ctx.infos.get(x.etape) : undefined
          const t = `Refaire un exemple résolu du ${info ? `point ${info.numero}` : 'point'} sans regarder`
          return { nom: t, texte: t, sous: 'Puis compare avec le cours.' }
        }
        const gen = x.generateur
        const difficile = derniereDifficulte(gen.id, ctx.aujourdhui)
        const quoi = x.nombre > 1 ? `Faire ${x.nombre} exercices de` : 'Faire 1 exercice de'
        return {
          nom: (
            <>
              {quoi} <b>{gen.id}</b>
            </>
          ),
          texte: `${quoi} ${gen.id}`,
          sous: difficile ? `tu y as eu des difficultés ${quandRelatif(difficile, ctx.aujourdhui)}` : ctx.gensProf.includes(gen.id) ? 'proposé par ton professeur' : <RichText text={gen.titre} />,
        }
      }
      const morceaux = g.exercices.map((x) => (x.generateur ? `${x.nombre} de ${x.generateur.id}` : 'un exemple résolu'))
      const t = `Faire des exercices : ${listeEt(morceaux)}`
      return { nom: t, texte: t, sous: '' }
    }
  }
}

/** Adresse du bouton « Go » (lien interne, ou générateur pas encore migré : nouvel onglet). */
function cibleGo(g: TacheGroupee, ctx: Contexte, garde: PlanGarde): { href: string; externe: boolean } | null {
  const infos = [...ctx.infos.values()]
  const premier = infos[0]
  const info = g.etapes.length > 0 ? ctx.infos.get(g.etapes[0]) : premier
  if (!info) return null
  const base = `/${info.chapter.levelSlug}/${info.chapter.slug}`
  if (g.type === 'relire') return { href: `${base}#${encodeURIComponent(info.sectionId)}`, externe: false }
  if (g.type === 'cartes') return { href: `${base}#reviser`, externe: false }
  if (g.type === 'blanche') {
    const memeChapitre = infos.filter((i) => i.chapter.slug === premier.chapter.slug)
    return { href: urlEntrainementEleve(premier.chapter.levelSlug, premier.chapter.slug, memeChapitre.map((i) => i.sectionId), garde.gens ?? []), externe: false }
  }
  // Exercices : le premier générateur pas encore fait (sinon le premier).
  const x = g.exercices.find((e) => e.generateur && !g.taches.every((t) => t.faite || t.generateur?.id !== e.generateur?.id)) ?? g.exercices[0]
  if (!x?.generateur) {
    const e = x?.etape ? ctx.infos.get(x.etape) : info
    return e ? { href: `/${e.chapter.levelSlug}/${e.chapter.slug}#${encodeURIComponent(e.sectionId)}`, externe: false } : null
  }
  const e = (x.etape && ctx.infos.get(x.etape)) || info
  const href = generatorLink(e.chapter.levelSlug, x.generateur.id)
  return { href, externe: !estGenerateurMigre(e.chapter.levelSlug, x.generateur.id) }
}

/** « Point 3 : relire + 3 exercices de 6gen59 » — un jour à venir en une ligne. */
function resumeJour(j: JourPlan, ctx: Contexte): string {
  if (j.role === 'libre') return 'Repos : pas de révision ce jour-là.'
  const groupes = grouperTaches(j.taches)
  if (groupes.length === 0) return 'Rien de prévu.'
  const etapes = [...new Set(groupes.flatMap((g) => (g.type === 'blanche' || g.aRevoir ? [] : g.etapes)))]
  const uneSeule = etapes.length >= 1 && groupes.every((g) => g.type === 'blanche' || g.aRevoir || (g.etapes.length > 0 && g.etapes.every((e) => etapes.includes(e))))
  const morceaux = groupes.map((g) => {
    switch (g.type) {
      case 'blanche':
        return 'évaluation blanche (20 min) puis corrigé'
      case 'relire':
        return 'relire'
      case 'cartes':
        return g.aRevoir ? `tes cartes « À revoir »` : pluriel(g.cartes, 'carte')
      case 'exercices':
        return listeEt(g.exercices.map((x) => (x.generateur ? `${pluriel(x.nombre, 'exercice')} de ${x.generateur.id}` : 'un exemple à refaire')))
    }
  })
  const prefixe = uneSeule && etapes.length > 0 && !groupes.some((g) => g.type === 'blanche') ? `${majuscule(texteEtapes(numerosDe(etapes, ctx)))} : ` : ''
  const phrase = morceaux.join(' + ')
  return prefixe ? `${prefixe}${phrase}` : majuscule(phrase)
}

// --------------------------------------------------------------------------------------------
// Vue du plan
// --------------------------------------------------------------------------------------------

function LigneTache({ g, ctx, garde, principal, onCocher }: { g: TacheGroupee; ctx: Contexte; garde: PlanGarde; principal: boolean; onCocher: (ids: string[], oui: boolean) => void }) {
  const id = useId()
  const { nom, texte, sous } = texteTache(g, ctx)
  const cible = cibleGo(g, ctx, garde)
  const etiquette = `Go — ${texte.charAt(0).toLowerCase()}${texte.slice(1)}`
  return (
    <li className={`plan-t${g.faite ? ' faite' : ''}`}>
      <label className="plan-t-coche" htmlFor={id}>
        <input id={id} type="checkbox" checked={g.faite} onChange={(e) => onCocher(g.ids, e.target.checked)} />
        <span className="sr-only">{g.faite ? 'Fait : ' : ''}</span>
      </label>
      <div className="plan-t-texte">
        <label htmlFor={id} className="plan-t-nom">
          {nom}
        </label>
        {sous && !g.faite && <span className="plan-t-sous">{sous}</span>}
      </div>
      {cible &&
        !g.faite &&
        (cible.externe ? (
          <a className={`plan-go${principal ? ' plein' : ''}`} href={cible.href} target="_blank" rel="noopener noreferrer" aria-label={`${etiquette} (nouvel onglet)`}>
            Go
          </a>
        ) : (
          <Link className={`plan-go${principal ? ' plein' : ''}`} to={cible.href} aria-label={etiquette}>
            Go
          </Link>
        ))}
    </li>
  )
}

function RangeeJours({ plan, aujourdhui, debut }: { plan: Plan; aujourdhui: Jour; debut: Jour }) {
  const depart = debut < ajouterJours(aujourdhui, -2) ? ajouterJours(aujourdhui, -2) : debut
  const jours = plan.jours.filter((j) => j.jour >= depart)
  return (
    <ol className="plan-rangee" aria-label="Les jours jusqu’à l’interro">
      {jours.map((j) => {
        const etat = j.role === 'interro' ? 'interro' : j.jour === aujourdhui ? 'aujourdhui' : j.jour < aujourdhui ? (j.statut === 'fait' ? 'fait' : 'passe') : j.role === 'libre' ? 'libre' : 'avenir'
        const lu = `${majuscule(dateLongue(j.jour))}${etat === 'interro' ? ' : interro' : etat === 'aujourdhui' ? " : aujourd'hui" : etat === 'fait' ? ' : fait' : etat === 'libre' ? ' : repos' : ''}`
        return (
          <li key={j.jour} className={`plan-puce ${etat}`} aria-label={lu} aria-current={etat === 'aujourdhui' ? 'date' : undefined}>
            <span aria-hidden="true">{JOURS_COURTS[jourSemaine(j.jour)]}</span>
            <b aria-hidden="true">{numeroJour(j.jour)}</b>
            {etat === 'fait' && (
              <i className="plan-puce-ok" aria-hidden="true">
                ✓
              </i>
            )}
          </li>
        )
      })}
    </ol>
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
  onRemplacer,
  stockageOk,
}: {
  garde: PlanGarde
  plan: Plan
  infos: Map<string, InfoEtape>
  aujourdhui: Jour
  onCocher: (ids: string[], oui: boolean) => void
  onModifier: () => void
  onSupprimer: () => void
  onRemplacer: (p: PlanGarde) => void
  stockageOk: boolean
}) {
  const [confirmer, setConfirmer] = useState(false)
  const ctx: Contexte = { infos, aujourdhui, gensProf: garde.gens ?? [] }
  const listeInfos = [...infos.values()]
  const aujourdhuiPlan = plan.jours.find((j) => j.jour === aujourdhui)
  const groupes = aujourdhuiPlan ? grouperTaches(aujourdhuiPlan.taches) : []
  const faites = groupes.filter((g) => g.faite).length
  const indexPrincipal = groupes.findIndex((g) => !g.faite)
  const suivants = plan.jours.filter((j) => j.jour > aujourdhui && j.role !== 'interro')
  const nature = garde.nom ?? (garde.bilan ? 'Contrôle-bilan' : 'Interro')

  return (
    <>
      <EnTetePlan garde={garde} infos={listeInfos} />
      <AvisAnnonce garde={garde} aujourdhui={aujourdhui} onRemplacer={onRemplacer} onEffacer={onSupprimer} />
      {plan.termine ? (
        <section className="suivi-bloc">
          <h2>{garde.interro === aujourdhui ? "C'est aujourd'hui : bonne chance !" : `L'interro du ${dateLongue(garde.interro)} est passée.`}</h2>
          <p className="suivi-chapeau">Une autre interro en vue&nbsp;? Fais un nouveau plan.</p>
          <div className="suivi-boutons">
            <button type="button" className="suivi-btn plein" onClick={onModifier}>
              Faire un nouveau plan
            </button>
            <Link className="suivi-btn" to="/suivi">
              Ma progression
            </Link>
          </div>
        </section>
      ) : (
        <>
          <RangeeJours plan={plan} aujourdhui={aujourdhui} debut={garde.debut} />
          <section className="plan-jour-carte aujourdhui" aria-labelledby="plan-aujourdhui">
            <div className="plan-jour-tete">
              <h2 id="plan-aujourdhui">
                Aujourd'hui{aujourdhuiPlan && aujourdhuiPlan.role !== 'libre' && groupes.length > 0 ? ` · ${aujourdhuiPlan.minutes} min` : ''}
              </h2>
              {groupes.length > 0 && (
                <span className="plan-compte" aria-label={`${faites} tâche${faites > 1 ? 's' : ''} faite${faites > 1 ? 's' : ''} sur ${groupes.length}`}>
                  {faites} sur {groupes.length}
                </span>
              )}
            </div>
            {!aujourdhuiPlan || aujourdhuiPlan.role === 'libre' || groupes.length === 0 ? (
              <p className="plan-jour-ligne">{aujourdhuiPlan?.role === 'libre' ? 'C’est ton jour de repos : pas de révision aujourd’hui.' : 'Rien de prévu aujourd’hui.'}</p>
            ) : (
              <>
                <ul className="plan-taches">
                  {groupes.map((g, i) => (
                    <LigneTache key={g.cle} g={g} ctx={ctx} garde={garde} principal={i === indexPrincipal} onCocher={onCocher} />
                  ))}
                </ul>
                {faites === groupes.length && (
                  <p className="plan-bravo" role="status">
                    Bravo, c'est fait pour aujourd'hui&nbsp;!
                  </p>
                )}
              </>
            )}
          </section>

          {suivants.length > 0 && (
            <ol className="plan-suite" aria-label="Les jours suivants">
              {suivants.map((j) => (
                <li key={j.jour} className={`plan-jour-carte${j.role === 'libre' ? ' libre' : ''}`}>
                  <p className="plan-jour-titre">
                    {libelleJour(j.jour, aujourdhui)}
                    {j.role !== 'libre' && j.minutes > 0 ? ` · ${j.minutes} min` : ''}
                  </p>
                  <p className="plan-jour-ligne">{resumeJour(j, ctx)}</p>
                </li>
              ))}
              <li className="plan-jour-carte interro">
                <p className="plan-jour-titre">
                  {majuscule(dateCourte(garde.interro))} · {nature.toLowerCase()}
                </p>
                <p className="plan-jour-ligne">Bonne chance, tu as tout préparé&nbsp;!</p>
              </li>
            </ol>
          )}

          <p className="plan-decale">Un jour raté&nbsp;? Le plan se décale tout seul, rien n'est perdu.</p>
          {plan.essentielSeulement && (
            <p className="suivi-note plan-alerte" role="status">
              Il reste peu de jours&nbsp;: le plan garde l'essentiel (les cartes et un exercice par point).
            </p>
          )}
          {!stockageOk && (
            <p className="suivi-note plan-alerte" role="status">
              Ce navigateur ne garde rien en ce moment (navigation privée&nbsp;?)&nbsp;: ton plan vaut pour cette visite seulement.
            </p>
          )}
        </>
      )}

      <BoucleConfiance>
        <b>Ton plan reste sur cet appareil.</b> Les cases cochées ne sont envoyées à personne.
      </BoucleConfiance>

      <div className="suivi-boutons">
        {!plan.termine && (
          <button type="button" className="suivi-btn" onClick={onModifier}>
            Modifier mon plan
          </button>
        )}
        <Link className="suivi-btn" to={`/suivi?niveau=${encodeURIComponent(garde.niveau)}`}>
          Ma progression
        </Link>
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

/** « MON PLAN DE RÉVISION » / « Interro mardi 2/12 » / « Les coniques · étapes 1 à 3 · annoncée par ton professeur ». */
function EnTetePlan({ garde, infos }: { garde: Pick<PlanGarde, 'interro' | 'bilan' | 'annonce' | 'nom'>; infos: Pick<InfoEtape, 'chapter' | 'numero'>[] }) {
  const parChapitre = new Map<string, { titre: string; numeros: number[] }>()
  for (const i of infos) {
    const x = parChapitre.get(i.chapter.slug) ?? { titre: i.chapter.title, numeros: [] }
    x.numeros.push(i.numero)
    parChapitre.set(i.chapter.slug, x)
  }
  const sujets = [...parChapitre.values()]
  return (
    <div className="plan-entete">
      <p className="plan-surtitre">Mon plan de révision</p>
      <h1 tabIndex={-1}>
        {garde.nom ?? (garde.bilan ? 'Contrôle-bilan' : 'Interro')} {dateCourte(garde.interro)}
      </h1>
      {(sujets.length > 0 || garde.annonce) && (
        <p className="plan-sujet">
          {sujets.map((s, k) => (
            <span key={s.titre}>
              {k > 0 ? ' · ' : ''}
              <RichText text={s.titre} />
              {` · ${texteEtapes(s.numeros)}`}
            </span>
          ))}
          {garde.annonce ? `${sujets.length > 0 ? ' · ' : ''}annoncée par ton professeur` : ''}
        </p>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------------------------
// Préparer le plan : prérempli (interro annoncée) ou trois questions
// --------------------------------------------------------------------------------------------

interface Brouillon {
  niveau: string
  chapitre: string
  interro: string
  /** Clés `{chapitre}#{section}`. */
  etapes: string[]
  minutes: number
  jourLibre: number | null
}

function ChoixMinutes({ valeur, onChange, legende, numero }: { valeur: number; onChange: (m: number) => void; legende: string; numero?: number }) {
  const id = useId()
  return (
    <fieldset className="plan-champ">
      <legend>
        {numero !== undefined && (
          <span className="plan-num" aria-hidden="true">
            {numero}
          </span>
        )}
        {legende}
      </legend>
      <div className="plan-segments">
        {MINUTES_POSSIBLES.map((m) => (
          <label key={m} className={`plan-segment${valeur === m ? ' choisi' : ''}`}>
            <input type="radio" name={`${id}-minutes`} value={m} checked={valeur === m} onChange={() => onChange(m)} />
            <span>{m}&nbsp;min</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Interro annoncée par le professeur : tout est prêt, l'élève choisit ses minutes par jour. */
function PlanAnnonce({
  brouillon,
  bilan,
  nom,
  infos,
  ancien,
  aujourdhui,
  onValider,
  onChanger,
}: {
  brouillon: Brouillon
  bilan: boolean
  nom?: string
  infos: InfoEtape[]
  ancien: PlanGarde | null
  aujourdhui: Jour
  onValider: (minutes: number) => void
  onChanger: () => void
}) {
  const [minutes, setMinutes] = useState(brouillon.minutes)
  const passee = brouillon.interro <= aujourdhui
  return (
    <>
      <EnTetePlan garde={{ interro: brouillon.interro, bilan, annonce: true, ...(nom ? { nom } : {}) }} infos={infos} />
      <section className="suivi-bloc plan-formulaire" aria-labelledby="plan-annonce-titre">
        <h2 id="plan-annonce-titre">{passee ? 'Cette interro est déjà là' : 'Ton plan est presque prêt'}</h2>
        {passee ? (
          <p className="suivi-note">L'interro annoncée tombe aujourd'hui ou est passée&nbsp;: il n'y a plus de jours à préparer. Bonne chance&nbsp;!</p>
        ) : (
          <>
            <p className="suivi-note">
              Date, points et exercices viennent de ton professeur. Il te reste {pluriel(Math.max(1, ecartJours(aujourdhui, brouillon.interro)), 'jour')}&nbsp;: un peu chaque jour plutôt que tout la veille.
            </p>
            <ChoixMinutes legende="Combien de minutes par jour ?" valeur={minutes} onChange={setMinutes} />
            {ancien && ancien.interro !== brouillon.interro && ancien.interro > aujourdhui && (
              <p className="suivi-note">Ton plan actuel (interro du {dateLongue(ancien.interro)}) sera remplacé.</p>
            )}
            <div className="suivi-boutons">
              <button type="button" className="suivi-btn plein" onClick={() => onValider(minutes)} disabled={infos.length === 0}>
                Faire mon plan
              </button>
              <button type="button" className="suivi-btn" onClick={onChanger}>
                Changer la date ou les points
              </button>
            </div>
          </>
        )}
      </section>
    </>
  )
}

function FormulaireQuestions({
  initial,
  aujourdhui,
  existe,
  onValider,
  onAnnuler,
}: {
  initial: Brouillon
  aujourdhui: Jour
  existe: boolean
  onValider: (b: Brouillon) => void
  onAnnuler?: () => void
}) {
  const [b, setB] = useState<Brouillon>(initial)
  const [erreurs, setErreurs] = useState<{ date?: string; etapes?: string }>({})
  const id = useId()
  const level = LEVELS.find((l) => l.slug === b.niveau) ?? LEVELS[0]
  const suivi = useMemo(() => suiviAnnee(level), [level])
  const chapitre = suivi.find((c) => c.chapter.slug === b.chapitre) ?? suivi[0]
  const cles = chapitre ? chapitre.chapter.sections.map((s) => `${chapitre.chapter.slug}#${s.id}`) : []
  const cochees = cles.filter((k) => b.etapes.includes(k))
  const demain = ajouterJours(aujourdhui, 1)
  const dateRef = useRef<HTMLInputElement>(null)
  const etapesRef = useRef<HTMLDetailsElement>(null)

  function choisirChapitre(slug: string, niveau = b.niveau) {
    const lv = LEVELS.find((l) => l.slug === niveau) ?? LEVELS[0]
    const c = lv.chapters.find((x) => x.slug === slug) ?? lv.chapters[0]
    setB((x) => ({ ...x, niveau: lv.slug, chapitre: c?.slug ?? '', etapes: c ? c.sections.map((s) => `${c.slug}#${s.id}`) : [] }))
  }

  function valider(e: FormEvent) {
    e.preventDefault()
    const err: typeof erreurs = {}
    if (!estJour(b.interro)) err.date = 'Choisis la date de ton interro.'
    else if (b.interro <= aujourdhui) err.date = `L'interro doit être au plus tôt demain, ${dateLongue(demain)}.`
    else if (ecartJours(aujourdhui, b.interro) > 60) err.date = 'Choisis une interro dans les deux mois qui viennent.'
    if (cochees.length === 0) err.etapes = 'Garde au moins un point.'
    setErreurs(err)
    if (err.date) dateRef.current?.focus()
    else if (err.etapes) {
      if (etapesRef.current) etapesRef.current.open = true
      etapesRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    } else onValider({ ...b, etapes: cles.filter((k) => b.etapes.includes(k)) })
  }

  return (
    <form className="suivi-bloc plan-formulaire" onSubmit={valider} noValidate aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`}>{existe ? 'Modifier mon plan' : 'Trois questions, et ton plan est prêt'}</h2>

      <div className="plan-champ">
        <label htmlFor={`${id}-date`}>
          <span className="plan-num" aria-hidden="true">
            1
          </span>
          Quand est ton interro&nbsp;?
        </label>
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

      <fieldset className="plan-champ">
        <legend>
          <span className="plan-num" aria-hidden="true">
            2
          </span>
          Sur quel chapitre&nbsp;?
        </legend>
        <div className="plan-ligne-choix">
          <label className="sr-only" htmlFor={`${id}-niveau`}>
            Année
          </label>
          <select id={`${id}-niveau`} value={b.niveau} onChange={(e) => choisirChapitre('', e.target.value)}>
            {LEVELS.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.label}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor={`${id}-chapitre`}>
            Chapitre
          </label>
          <select id={`${id}-chapitre`} value={chapitre?.chapter.slug ?? ''} onChange={(e) => choisirChapitre(e.target.value)}>
            {level.chapters.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.chapterNumber}. {c.title.replace(/\$/g, '')}
              </option>
            ))}
          </select>
        </div>
        {chapitre && (
          <details ref={etapesRef} className="plan-chapitre" open={cochees.length < cles.length || !!erreurs.etapes || undefined}>
            <summary>
              <span className="plan-chapitre-titre">{cochees.length === cles.length ? 'Tous les points' : `${pluriel(cochees.length, 'point')} sur ${cles.length}`}</span>
              <span className="suivi-sous">· choisir</span>
            </summary>
            {erreurs.etapes && <p className="plan-erreur">{erreurs.etapes}</p>}
            {chapitre.etapes
              .filter((e) => e.section)
              .map((e) => {
                const cle = `${chapitre.chapter.slug}#${e.section!.id}`
                return (
                  <label key={cle} className="suivi-case-a-cocher">
                    <input
                      type="checkbox"
                      checked={b.etapes.includes(cle)}
                      onChange={(ev) => setB((x) => ({ ...x, etapes: ev.target.checked ? [...x.etapes.filter((k) => k !== cle), cle] : x.etapes.filter((k) => k !== cle) }))}
                    />
                    <span>
                      Point {e.numero} · <RichText text={e.titre} />
                      {e.ton === 'retravailler' && <span className="suivi-ton revoir">À retravailler</span>}
                    </span>
                  </label>
                )
              })}
          </details>
        )}
      </fieldset>

      <ChoixMinutes
        numero={3}
        legende="Combien de minutes par jour ?"
        valeur={b.minutes}
        onChange={(m) => setB((x) => ({ ...x, minutes: m }))}
      />

      <details className="plan-option">
        <summary>Un jour sans révision&nbsp;?</summary>
        <div className="plan-champ">
          <label htmlFor={`${id}-libre`}>Jour de repos</label>
          <select id={`${id}-libre`} value={b.jourLibre ?? ''} onChange={(e) => setB((x) => ({ ...x, jourLibre: e.target.value === '' ? null : Number(e.target.value) }))}>
            <option value="">Aucun</option>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => (
              <option key={d} value={d}>
                {majuscule(JOURS[d])}
              </option>
            ))}
          </select>
        </div>
      </details>

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
      {existe && <p className="suivi-note">Refaire le plan repart d'aujourd'hui.</p>}
    </form>
  )
}

// --------------------------------------------------------------------------------------------
// Page
// --------------------------------------------------------------------------------------------

const ID_LIEN = /^[A-Za-z0-9_-]{1,80}$/
const listeLien = (v: string | null) => (v ?? '').split(',').map((s) => s.trim()).filter((s) => ID_LIEN.test(s))
/** Étapes du lien : `section` (chapitre de `chapitre=`) ou `slug#section` (plusieurs chapitres, depuis le 28/11/2026). */
const listeEtapesLien = (v: string | null) => (v ?? '').split(',').map((s) => s.trim()).filter((s) => /^(?:[a-z0-9-]{1,80}#)?[A-Za-z0-9_-]{1,80}$/.test(s))

type Mode = 'plan' | 'annonce' | 'questions'

/**
 * Plan fait depuis une interro annoncée (`annonceId`) : son appareil relit la dernière version de la page de classe
 * (`classe:derniere`, relue aussi en tâche de fond par son code — seule requête, rien n'est envoyé). Interro modifiée
 * → « Ton interro a changé : mettre mon plan à jour » (rien ne change sans le bouton) ; retirée → « Cette interro a été
 * retirée par ton professeur » + garder / effacer le plan.
 */
function AvisAnnonce({ garde, aujourdhui, onRemplacer, onEffacer }: { garde: PlanGarde; aujourdhui: string; onRemplacer: (p: PlanGarde) => void; onEffacer: () => void }) {
  const code = garde.annonceId ? lireCodeGarde() : null
  const [interros, setInterros] = useState<InterroPubliee[] | null>(() => (code ? (lirePageGardee(code)?.page.interros ?? null) : null))
  useEffect(() => {
    if (!code || !supabaseConfigure() || (window as Window & { __prerendu?: boolean }).__prerendu) return
    let actif = true
    const t = window.setTimeout(async () => {
      try {
        const { lirePageClasse } = await import('../lib/pageClasseDonnees')
        const client = await chargerSupabase()
        if (!client || !actif) return
        const r = await lirePageClasse(client, code)
        if (actif && r.statut === 'ok') setInterros(garderPage(code, r.page, new Date()).interros)
      } catch {
        /* hors ligne : la version gardée suffit */
      }
    }, 600)
    return () => {
      actif = false
      window.clearTimeout(t)
    }
  }, [code])
  if (!garde.annonceId || !interros) return null
  const i = interros.find((x) => x.id === garde.annonceId)
  if (i) {
    if (!garde.signature || signatureInterro(i) === garde.signature) return null
    const k = clesInterro(i)
    return (
      <section className="suivi-bloc plan-avis" role="status">
        <h2>Ton {nomInterro(i).toLowerCase()} a changé</h2>
        <p className="suivi-note">
          {i.date !== garde.interro ? `Ton professeur l’a déplacée au ${dateLongue(i.date)}. ` : ''}Rien ne change dans ton plan tant que tu ne le mets pas à jour.
        </p>
        <div className="suivi-boutons">
          <button
            type="button"
            className="suivi-btn plein"
            onClick={() =>
              onRemplacer({ ...garde, interro: i.date, etapes: k.etapes.length > 0 ? k.etapes : garde.etapes, gens: k.gens, nom: nomInterro(i), ...(i.type === 'bilan' ? { bilan: true } : { bilan: undefined }), signature: signatureInterro(i) })
            }
          >
            Mettre mon plan à jour
          </button>
        </div>
      </section>
    )
  }
  // Absente : retirée, sauf si elle est passée, ou plus loin que les 3 interros publiées.
  const derniere = interros.length >= 3 ? interros[interros.length - 1].date : null
  if (garde.interro < aujourdhui || (derniere && garde.interro > derniere)) return null
  return (
    <section className="suivi-bloc plan-avis" role="status">
      <h2>Cette interro a été retirée par ton professeur</h2>
      <p className="suivi-note">Ton plan reste sur cet appareil : tu peux le garder pour réviser quand même, ou l’effacer.</p>
      <div className="suivi-boutons">
        <button type="button" className="suivi-btn plein" onClick={() => onRemplacer({ ...garde, annonceId: undefined, signature: undefined })}>
          Garder mon plan
        </button>
        <button type="button" className="suivi-btn" onClick={onEffacer}>
          Effacer mon plan
        </button>
      </div>
    </section>
  )
}

export function PlanRevisionPage() {
  usePageNonIndexee('Mon plan de révision')
  const [params, setParams] = useSearchParams()
  const aujourdhui = jourLocal(new Date())
  const [garde, setGarde] = useState<PlanGarde | null>(lirePlan)
  const [stockageOk, setStockageOk] = useState(true)

  // Interro annoncée (page de classe, accueil) ou lien de « Ma progression » : lus une fois.
  const lien = useMemo(() => {
    const date = params.get('date') ?? params.get('interro')
    const niveau = params.get('niveau')
    const chapitre = params.get('chapitre')
    const level = LEVELS.find((l) => l.slug === niveau)
    const chap = level?.chapters.find((c) => c.slug === chapitre)
    const brutes = listeEtapesLien(params.get('etapes'))
    const multi = brutes.some((b) => b.includes('#'))
    const etapes: string[] = []
    if (level && chap) {
      if (!multi) etapes.push(...chap.sections.filter((s) => brutes.includes(s.id)).map((s) => `${chap.slug}#${s.id}`))
      else
        for (const b of brutes) {
          const [slug, sec] = b.includes('#') ? b.split('#') : [chap.slug, b]
          const c = level.chapters.find((x) => x.slug === slug)
          if (c && c.sections.some((s) => s.id === sec) && !etapes.includes(`${c.slug}#${sec}`)) etapes.push(`${c.slug}#${sec}`)
        }
    }
    const nomLu = (params.get('nom') ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
    const idLu = params.get('id') ?? ''
    return {
      date: estJour(date) ? date : null,
      level,
      chap,
      etapes,
      gens: listeLien(params.get('gen')),
      bilan: params.get('type') === 'bilan',
      nom: nomLu || null,
      id: /^[A-Za-z0-9_-]{1,80}$/.test(idLu) ? idLu : null,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adresse d'arrivée seulement
  }, [])
  const annonceComplete = !!(lien.date && lien.chap)
  // Le même plan existe déjà (même date, mêmes étapes) : on l'ouvre, sans rien redemander.
  const dejaFait = annonceComplete && garde !== null && garde.interro === lien.date && (lien.etapes.length === 0 || lien.etapes.every((k) => garde.etapes.includes(k)))
  const [mode, setMode] = useState<Mode>(() => (annonceComplete && !dejaFait ? 'annonce' : garde ? 'plan' : 'questions'))

  // L'adresse est nettoyée une fois lue (un rechargement ne repropose pas l'annonce déjà traitée).
  useEffect(() => {
    if ([...params.keys()].length > 0 && (dejaFait || !annonceComplete)) setParams(new URLSearchParams(), { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois
  }, [])

  const brouillonInitial = useMemo<Brouillon>(() => {
    const niveau = lien.level?.slug ?? garde?.niveau ?? anneeDeDepart() ?? LEVELS[0].slug
    const level = LEVELS.find((l) => l.slug === niveau) ?? LEVELS[0]
    let chapitre = lien.chap?.slug ?? (garde && garde.niveau === level.slug ? garde.etapes[0]?.split('#')[0] : undefined)
    if (!chapitre || !level.chapters.some((c) => c.slug === chapitre)) {
      const suivi = suiviAnnee(level)
      chapitre = ([...suivi].sort((a, b) => b.derniereActivite - a.derniereActivite).find((c) => c.actif) ?? suivi[0])?.chapter.slug ?? ''
    }
    const c = level.chapters.find((x) => x.slug === chapitre)
    const toutes = c ? c.sections.map((s) => `${c.slug}#${s.id}`) : []
    const etapes = lien.etapes.length > 0 ? lien.etapes : garde && garde.etapes.every((k) => k.startsWith(`${chapitre}#`)) && garde.etapes.length > 0 && !lien.chap ? garde.etapes : toutes
    const interro = lien.date ?? (garde && garde.interro > aujourdhui ? garde.interro : '')
    return { niveau: level.slug, chapitre: chapitre ?? '', interro, etapes, minutes: garde?.minutes ?? MINUTES_DEFAUT, jourLibre: garde?.jourLibre ?? null }
  }, [garde, lien, aujourdhui])

  const levelGarde = LEVELS.find((l) => l.slug === garde?.niveau)
  const infosListe = useMemo(() => (garde && levelGarde ? etapesDuPlan(garde.etapes, suiviAnnee(levelGarde), garde.gens) : []), [garde, levelGarde])
  const infos = useMemo(() => new Map(infosListe.map((i) => [i.cle, i])), [infosListe])
  const plan = useMemo(
    () => (garde ? construirePlan({ debut: garde.debut, interro: garde.interro, minutesParJour: garde.minutes, jourLibre: garde.jourLibre, etapes: infosListe }, aujourdhui, garde.faites) : null),
    [garde, infosListe, aujourdhui],
  )
  const infosAnnonce = useMemo(() => (lien.level && annonceComplete ? etapesDuPlan(lien.etapes.length > 0 ? lien.etapes : brouillonInitial.etapes, suiviAnnee(lien.level), lien.gens) : []), [lien, annonceComplete, brouillonInitial])

  const enregistrer = useCallback((p: PlanGarde) => {
    setGarde(p)
    setStockageOk(ecrirePlan(p))
  }, [])

  function creer(b: Brouillon, annonce: { gens: string[]; bilan: boolean; nom?: string | null; id?: string | null } | null) {
    const memeInterro = garde && garde.interro === b.interro
    const nomAnnonce = annonce?.nom ?? (annonce?.bilan ? 'Contrôle-bilan' : 'Interro')
    enregistrer({
      debut: aujourdhui,
      interro: b.interro,
      minutes: b.minutes,
      jourLibre: b.jourLibre,
      niveau: b.niveau,
      etapes: b.etapes,
      faites: memeInterro ? garde.faites : [],
      ...(annonce ? { annonce: true, ...(annonce.bilan ? { bilan: true } : {}), ...(annonce.gens.length > 0 ? { gens: annonce.gens } : {}), ...(annonce.nom ? { nom: annonce.nom } : {}) } : {}),
      ...(annonce?.id ? { annonceId: annonce.id, signature: signatureAnnonce({ date: b.interro, etapes: b.etapes, gens: annonce.gens, nom: nomAnnonce }) } : {}),
    })
    setMode('plan')
    if ([...params.keys()].length > 0) setParams(new URLSearchParams(), { replace: true })
    requestAnimationFrame(() => document.querySelector<HTMLElement>('.suivi-page h1')?.focus())
  }

  function cocher(ids: string[], oui: boolean) {
    if (!garde) return
    const enlever = (x: string) => ids.some((id) => x === id || x.startsWith(`${id}#`))
    const faites = oui ? [...garde.faites.filter((x) => !ids.includes(x)), ...ids] : garde.faites.filter((x) => !enlever(x))
    enregistrer({ ...garde, faites })
  }

  // Exercices terminés (« Ma progression ») : cases d'exercices du jour cochées d'office.
  const [tic, setTic] = useState(0)
  useEffect(() => {
    if (!garde || !plan || plan.termine) return
    const ajout = cochesAutomatiques(plan, aujourdhui, garde.faites, compteurEssais())
    if (ajout.length > 0) enregistrer({ ...garde, faites: [...garde.faites, ...ajout] })
  }, [garde, plan, aujourdhui, enregistrer, tic])

  // Un autre onglet (générateur ouvert par « Go »), un retour sur la page : plan et essais relus.
  useEffect(() => {
    const relire = () => {
      setGarde(lirePlan())
      setTic((n) => n + 1)
    }
    const visible = () => document.visibilityState === 'visible' && relire()
    window.addEventListener('storage', relire)
    window.addEventListener(EVENEMENT_SUIVI, relire)
    document.addEventListener('visibilitychange', visible)
    return () => {
      window.removeEventListener('storage', relire)
      window.removeEventListener(EVENEMENT_SUIVI, relire)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="suivi-page plan-page">
        {mode === 'annonce' && annonceComplete ? (
          <PlanAnnonce
            brouillon={brouillonInitial}
            bilan={lien.bilan}
            nom={lien.nom ?? undefined}
            infos={infosAnnonce}
            ancien={garde}
            aujourdhui={aujourdhui}
            onValider={(minutes) => creer({ ...brouillonInitial, minutes, etapes: infosAnnonce.map((i) => i.cle) }, { gens: lien.gens, bilan: lien.bilan, nom: lien.nom, id: lien.id })}
            onChanger={() => setMode('questions')}
          />
        ) : mode === 'questions' || !garde || !plan ? (
          <>
            <div className="plan-entete">
              <p className="plan-surtitre">Mon plan de révision</p>
              <h1 tabIndex={-1}>Préparer mon interro</h1>
              <p className="plan-sujet">Un peu chaque jour plutôt que tout la veille&nbsp;: le plan répartit le travail jusqu'à l'interro.</p>
            </div>
            <FormulaireQuestions
              key={`${brouillonInitial.niveau}-${brouillonInitial.chapitre}-${brouillonInitial.interro}`}
              initial={brouillonInitial}
              aujourdhui={aujourdhui}
              existe={!!garde}
              onValider={(b) => creer(b, annonceComplete && b.interro === lien.date && b.chapitre === lien.chap?.slug ? { gens: lien.gens, bilan: lien.bilan, nom: lien.nom } : garde?.annonce && b.interro === garde.interro ? { gens: garde.gens ?? [], bilan: !!garde.bilan, nom: garde.nom ?? null } : null)}
              onAnnuler={garde ? () => setMode('plan') : undefined}
            />
            <BoucleConfiance>
              <b>Ton plan reste sur cet appareil.</b> Rien n'est envoyé, à personne.
            </BoucleConfiance>
            <p>
              <Link className="suivi-btn" to="/suivi">
                Ma progression
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
            onModifier={() => setMode('questions')}
            onSupprimer={() => {
              effacerPlan()
              setGarde(null)
              setMode('questions')
            }}
            onRemplacer={enregistrer}
            stockageOk={stockageOk}
          />
        )}
      </main>
    </>
  )
}
