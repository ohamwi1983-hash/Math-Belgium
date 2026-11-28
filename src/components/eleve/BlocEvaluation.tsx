import { useId, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RichText } from '../Math'
import { generatorLink } from '../../lib/generatorLink'
import { chapitresInterro, dateEleve, joursAvant, nomInterro, type InterroPubliee } from '../../lib/pageClasse'
import './blocEvaluation.css'

const NOMS: Record<1 | 2 | 3, string> = { 1: 'Connaître', 2: 'Appliquer', 3: 'Transférer' }
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const jourLong = (iso: string) => `${JOURS[new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`
const jourCourt = (iso: string) => `${JOURS[new Date(`${iso}T12:00:00Z`).getUTCDay()].slice(0, 3)}. ${Number(iso.slice(8, 10))}/${Number(iso.slice(5, 7))}`

function dans(date: string, aujourdhui: string): string {
  const n = joursAvant(date, aujourdhui)
  return n <= 0 ? 'aujourd’hui' : n === 1 ? 'demain' : `dans ${n} jours`
}

/** Titre du bloc : « Interro vendredi 4/12 · 3e heure ». */
export function titreBlocEvaluation(i: Pick<InterroPubliee, 'nom' | 'type' | 'date' | 'heure'>): string {
  return `${nomInterro(i)} ${jourLong(i.date)}${i.heure ? ` · ${i.heure}` : ''}`
}

/** Pastille d'une compétence (numéro + nom, couleurs `--procN`). */
export function PastilleCompetence({ c, petite = false }: { c: 1 | 2 | 3; petite?: boolean }) {
  return (
    <span className={`be-comp be-comp-${c}${petite ? ' petite' : ''}`}>
      <span className="be-comp-num" aria-hidden="true">
        {c}
      </span>
      {petite ? <span className="be-sr">{NOMS[c]}</span> : NOMS[c]}
    </span>
  )
}

function LienCode({ href, nouvelOnglet, children, label }: { href: string | null; nouvelOnglet: boolean; children: ReactNode; label: string }) {
  if (!href) return <span className="be-code">{children}</span>
  if (href.startsWith('/') && !nouvelOnglet)
    return (
      <Link className="be-code" to={href} aria-label={label}>
        {children}
      </Link>
    )
  return (
    <a className="be-code" href={href} aria-label={label} {...(nouvelOnglet || !href.startsWith('/') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

/**
 * Bloc d'une évaluation annoncée, TEL QUE LE VOIENT LES ÉLÈVES (maquette 1b du 28/11/2026) : nom, date, heure,
 * « dans n jours », compétences, puis chapitre par chapitre les points à étudier (numéro seul, jamais le mot
 * « étape ») et sous chacun les exercices retenus (code = lien vers le générateur public ; nom à côté quand la
 * place le permet, sinon au toucher de « Voir les noms »), la ligne « Connaître », « Je prépare mon interro ».
 * Le même composant sert à l'aperçu « Ce que verront tes élèves » (écran d'annonce, fiche) et aux élèves (page de
 * classe, carte « Ma classe » dépliée) : ce que le professeur voit est exactement ce qui est publié.
 */
export function BlocEvaluation({
  interro,
  aujourdhui,
  plan,
  nouvelOnglet = false,
  surtitre,
  sansTitre = false,
  titreNiveau = 3,
  apres,
}: {
  interro: InterroPubliee
  aujourdhui: string
  /** Lien « Je prépare mon interro » (plan de révision prérempli) ; `null` : bouton absent. */
  plan: string | null
  nouvelOnglet?: boolean
  surtitre?: string
  sansTitre?: boolean
  titreNiveau?: 2 | 3
  apres?: ReactNode
}) {
  const id = useId()
  const [noms, setNoms] = useState(false)
  const chapitres = chapitresInterro(interro)
  const nouveau = !!interro.chapitres
  const connaitre = chapitres.filter((c) => c.connaitre !== null)
  const codesConnaitre = connaitre.flatMap((c) => (c.connaitre ?? []).map((code) => ({ code, niveau: c.niveau })))
  const auMoinsUnExo = chapitres.some((c) => c.points.some((p) => p.exercices.length > 0)) || codesConnaitre.length > 0
  const Titre = titreNiveau === 2 ? 'h2' : 'h3'
  return (
    <div className={`be${noms ? ' be-noms' : ''}`} aria-labelledby={sansTitre ? undefined : `${id}-t`}>
      {surtitre && <p className="be-surtitre">{surtitre}</p>}
      {!sansTitre && (
        <Titre className="be-titre" id={`${id}-t`}>
          {titreBlocEvaluation(interro)} <span className="be-dans">({dans(interro.date, aujourdhui)})</span>
        </Titre>
      )}
      {interro.avant && (
        <p className="be-change">
          <span className="be-badge">date changée</span> avant : {jourCourt(interro.avant)}
        </p>
      )}
      {interro.competences && interro.competences.length > 0 && (
        <ul className="be-comps" aria-label="Compétences évaluées">
          {interro.competences.map((c) => (
            <li key={c}>
              <PastilleCompetence c={c} />
            </li>
          ))}
        </ul>
      )}
      {chapitres.map((ch, k) => (
        <section key={`${ch.chapitre}-${k}`} className="be-chapitre" aria-label={ch.titre || 'Chapitre'}>
          {ch.titre && <p className="be-chapitre-titre">{ch.titre}</p>}
          {ch.points.length > 0 && (
            <ul className="be-points">
              {ch.points.map((p) => (
                <li key={p.id} className="be-point">
                  <span className="be-point-titre">
                    <span className="be-num">{p.numero}.</span> <RichText text={p.titre} />
                  </span>
                  {p.precision && (
                    <span className="be-precision">
                      <RichText text={p.precision} />
                    </span>
                  )}
                  {p.exercices.length > 0 && (
                    <ul className="be-exos" aria-label={`Exercices du point ${p.numero}`}>
                      {p.exercices.map((x) => (
                        <li key={x.id} className="be-exo">
                          {x.competence && (
                            <span className="be-exo-comp">
                              <PastilleCompetence c={x.competence} petite />
                            </span>
                          )}
                          <LienCode href={ch.niveau ? generatorLink(ch.niveau, x.id) : null} nouvelOnglet={nouvelOnglet} label={`${x.id} : ${x.titre}${x.competence ? ` (${NOMS[x.competence]})` : ''}`}>
                            {x.id}
                          </LienCode>
                          <span className="be-exo-nom">{x.titre}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
      {!nouveau && interro.generateurs.length > 0 && (
        <div className="be-chapitre">
          <p className="be-chapitre-titre">Pour t’entraîner</p>
          <ul className="be-exos">
            {interro.generateurs.map((g) => (
              <li key={g.id} className="be-exo">
                <LienCode href={interro.niveau ? generatorLink(interro.niveau, g.id) : null} nouvelOnglet={nouvelOnglet} label={`${g.id} : ${g.titre}`}>
                  {g.id}
                </LienCode>
                <span className="be-exo-nom">{g.titre}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {connaitre.length > 0 && (
        <p className="be-connaitre">
          <PastilleCompetence c={1} petite /> <span>Connaître : questions « formule » et quiz vrai/faux</span>
          {codesConnaitre.map((x) => (
            <LienCode key={x.code} href={x.niveau ? generatorLink(x.niveau, x.code) : null} nouvelOnglet={nouvelOnglet} label={`${x.code} : quiz vrai/faux`}>
              {x.code}
            </LienCode>
          ))}
        </p>
      )}
      {auMoinsUnExo && (
        <button type="button" className="be-voir-noms" aria-pressed={noms} onClick={() => setNoms((v) => !v)}>
          {noms ? 'Cacher les noms des exercices' : 'Voir les noms des exercices'}
        </button>
      )}
      {(plan || apres) && (
        <div className="be-actions">
          {plan &&
            (nouvelOnglet ? (
              <a className="be-bouton" href={plan} target="_blank" rel="noopener noreferrer">
                Je prépare mon interro <span aria-hidden="true">›</span>
                <span className="be-sr"> (plan de révision des élèves, nouvel onglet)</span>
              </a>
            ) : (
              <Link className="be-bouton" to={plan}>
                Je prépare mon interro <span aria-hidden="true">›</span>
              </Link>
            ))}
          {apres}
        </div>
      )}
    </div>
  )
}

/** Date longue d'une interro pour l'élève (« Vendredi 4 décembre »), réexportée pour la carte repliée. */
export { dateEleve }
