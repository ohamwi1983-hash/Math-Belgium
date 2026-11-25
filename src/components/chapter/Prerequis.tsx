import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ChapterContent, ChapterSection } from '../../content/types'
import { phrasesRappel, resoudreUtilise } from '../../lib/prerequisChapitre'
import type { PrerequisResolu } from '../../lib/prerequisChapitre'
import { RichText } from '../Math'
import { Icone } from './Icones'

/**
 * Chapitres autonomes (décision du professeur du 25/11/2026) : chaque professeur choisit l'ordre de
 * ses chapitres, donc une étape qui se sert d'une autre étape (d'un autre chapitre) le dit, avec un
 * rappel sur place. Données : champ `utilise` des sections (`content/types.ts`).
 * - `CeChapitreUtilise` : carte du chapitre, encadré REPLIÉ listant, par chapitre, les étapes utilisées
 *   (toutes les entrées ; liens dans le même onglet — on est sur la carte, rien à perdre).
 * - `EtapeUtilise` : en tête d'une étape (sous « L'essentiel »), « Cette étape utilise : … » pour les
 *   prérequis INDISPENSABLES seulement ; chaque ligne déplie son rappel sur place, avec « Revoir l'étape »
 *   en NOUVEL onglet (l'élève ne perd pas sa lecture).
 * Les deux sont `no-export` : ni impression, ni export Word / PDF / HTML.
 */

interface LigneCarte {
  cible: PrerequisResolu['cible']
  indispensable: boolean
  /** Étapes de CE chapitre qui s'en servent. */
  pour: ChapterSection[]
}

/** Encadré replié de la carte : « Ce chapitre utilise… », groupé par chapitre cité. */
export function CeChapitreUtilise({ chapter }: { chapter: ChapterContent }) {
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  const groupes = new Map<string, { chapitre: ChapterContent; lignes: Map<string, LigneCarte> }>()
  for (const s of chapter.sections) {
    for (const p of resoudreUtilise(s.utilise)) {
      const cle = `${p.cible.chapitre.levelSlug}/${p.cible.chapitre.slug}`
      const g = groupes.get(cle) ?? { chapitre: p.cible.chapitre, lignes: new Map<string, LigneCarte>() }
      groupes.set(cle, g)
      const l = g.lignes.get(p.cible.href) ?? { cible: p.cible, indispensable: false, pour: [] }
      g.lignes.set(p.cible.href, l)
      if (p.entree.poids === 'indispensable') l.indispensable = true
      if (!l.pour.includes(s)) l.pour.push(s)
    }
  }
  if (groupes.size === 0) return null
  const nombre = [...groupes.values()].reduce((n, g) => n + g.lignes.size, 0)
  const resume = `${nombre} étape${nombre > 1 ? 's' : ''} de ${groupes.size === 1 ? 'un autre chapitre' : `${groupes.size} autres chapitres`}`
  return (
    <section className={`ce-chapitre-utilise no-export${ouvert ? ' ouvert' : ''}`} aria-label="Ce chapitre utilise">
      <button type="button" className="utilise-bascule" aria-expanded={ouvert} aria-controls={id} onClick={() => setOuvert((o) => !o)}>
        <span>
          <span className="utilise-titre">Ce chapitre utilise…</span>
          <span className="utilise-resume">{resume}</span>
        </span>
        <span className="tiroir-signe" aria-hidden="true">
          {ouvert ? '−' : '+'}
        </span>
      </button>
      <div id={id} className="utilise-corps" hidden={!ouvert}>
        <p className="utilise-intro">
          Ces étapes d’autres chapitres servent ici. Si tu ne les as pas encore vues, lis-les d’abord : pour les indispensables, un rappel s’ouvre aussi au début de l’étape qui s’en sert.
        </p>
        {[...groupes.values()].map(({ chapitre, lignes }) => (
          <div key={`${chapitre.levelSlug}/${chapitre.slug}`} className="utilise-groupe">
            <p className="utilise-chapitre">
              <Link to={`/${chapitre.levelSlug}/${chapitre.slug}`}>{chapitre.title}</Link>
              {chapitre.levelSlug !== chapter.levelSlug && <span className="utilise-annee"> ({chapitre.level})</span>}
            </p>
            <ul>
              {[...lignes.values()].map((l) => (
                <li key={l.cible.href}>
                  <Link to={l.cible.href} className="utilise-lien">
                    <span className="utilise-num">{`Étape\u00a0${l.cible.numero}`}</span>
                    <span className="utilise-nom">{l.cible.titreEtape}</span>
                  </Link>
                  <span className="utilise-detail">
                    {l.indispensable ? <strong className="utilise-indispensable">indispensable</strong> : 'utile'}
                    {' · '}pour l’étape {l.pour.map((s) => s.number).join(', ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/** « Cette étape utilise : … » en tête d'une étape (prérequis indispensables seulement). */
export function EtapeUtilise({ section }: { section: ChapterSection }) {
  const prerequis = resoudreUtilise(section.utilise).filter((p) => p.entree.poids === 'indispensable')
  if (prerequis.length === 0) return null
  return (
    <section className="etape-utilise no-export" aria-label="Cette étape utilise">
      <p className="etiquette">
        <Icone nom="livre" taille={16} />
        Cette étape utilise
      </p>
      <ul>
        {prerequis.map((p) => (
          <LigneRappel key={p.entree.cible} p={p} />
        ))}
      </ul>
    </section>
  )
}

function LigneRappel({ p }: { p: PrerequisResolu }) {
  const [ouvert, setOuvert] = useState(false)
  const id = useId()
  return (
    <li className={ouvert ? 'ouvert' : undefined}>
      <button type="button" className="utilise-ligne" aria-expanded={ouvert} aria-controls={id} onClick={() => setOuvert((o) => !o)}>
        <span className="utilise-ligne-texte">
          <span className="utilise-nom">{p.cible.titreEtape}</span>
          <span className="utilise-ou">
            {`«\u00a0${p.cible.chapitre.title}\u00a0», étape\u00a0${p.cible.numero}`}
          </span>
        </span>
        <span className="utilise-action" aria-hidden="true">
          {ouvert ? 'Fermer' : 'Rappel'}
        </span>
      </button>
      <div id={id} className="utilise-rappel" hidden={!ouvert}>
        {phrasesRappel(p).map((t, i) => (
          <p key={i}>
            <RichText text={t} />
          </p>
        ))}
        <a className="utilise-revoir" href={p.cible.href} target="_blank" rel="noopener">
          Revoir l’étape <span className="utilise-onglet">(nouvel onglet)</span>
        </a>
      </div>
    </li>
  )
}
