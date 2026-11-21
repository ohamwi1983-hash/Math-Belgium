import { useMemo, useRef, useState } from 'react'
import type { ChapterContent } from '../../content/types'
import { RichText } from '../Math'
import { titreCourt, useEtatCartes } from '../../lib/parcoursChapitre'
import type { EtatCarte } from '../../lib/parcoursChapitre'
import type { Aller } from './CarteChapitre'
import { LienVue } from './CarteChapitre'

interface Carte {
  cle: string
  numero: number
  etape: string
  question: string
  reponse: string
}

/**
 * Onglet « Réviser » (haut de l'onglet) : cartes « Teste-toi » puis la fiche du chapitre (une ligne
 * par section ayant un `essentiel`). « Ce qu'il faut retenir », le formulaire, le quiz vrai / faux
 * (`recap.entrainement`) et « Imprimer ou télécharger » suivent dans la page (`ChapterPage`) : ils
 * sont aussi imprimés/exportés, ils restent donc à leur place dans le DOM.
 */
export function ReviserVue({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  const cartes = useMemo<Carte[]>(
    () =>
      chapter.sections.flatMap((s) =>
        (s.cartes ?? []).map((c, i) => ({ cle: `${s.id}:${i}`, numero: s.number, etape: titreCourt(s), question: c.question, reponse: c.reponse })),
      ),
    [chapter],
  )
  const fiche = chapter.sections.filter((s) => s.essentiel && s.essentiel.length > 0)
  const defiler = (selecteur: string) => document.querySelector(selecteur)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const liens = [
    { label: 'Ce qu’il faut retenir', sel: '.synthese' },
    ...(chapter.formulaire ? [{ label: 'Formulaire', sel: '.formulaire' }] : []),
    ...(chapter.recap.entrainement ? [{ label: 'Quiz vrai ou faux', sel: '.synthese .generator-card' }] : []),
    { label: 'Imprimer ou télécharger', sel: '.page > .export-section' },
  ]

  return (
    <div id="panneau-reviser" className="parcours-reviser no-export" role="tabpanel" aria-label="Réviser">
      {cartes.length > 0 && <TesteToi chapter={chapter} cartes={cartes} />}
      {fiche.length > 0 && (
        <section className="fiche-chapitre" aria-labelledby="fiche-titre">
          <h2 id="fiche-titre">La fiche du chapitre</h2>
          <ol>
            {fiche.map((s) => (
              <li key={s.id}>
                <LienVue cible={s.id} aller={aller} className="fiche-num" aria-label={`Revoir l'étape ${s.number} : ${titreCourt(s)}`}>
                  {s.number}
                </LienVue>
                <div>
                  <p className="fiche-titre">{titreCourt(s)}</p>
                  {s.essentiel!.map((p, i) => (
                    <p key={i} className="fiche-texte">
                      <RichText text={p} />
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
      <nav className="reviser-liens" aria-label="Dans cet onglet">
        {liens.map((l) => (
          <button key={l.sel} type="button" onClick={() => defiler(l.sel)}>
            {l.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

/** Paquet de cartes question → réponse. Les cartes « à revoir » reviennent en fin de paquet ;
 * au chargement, les cartes déjà sues passent après les autres. */
function TesteToi({ chapter, cartes }: { chapter: ChapterContent; cartes: Carte[] }) {
  const { etats, noter, effacer } = useEtatCartes(chapter)
  const paquetInitial = () => {
    const pasSues = cartes.filter((c) => etats[c.cle] !== 'su')
    const sues = cartes.filter((c) => etats[c.cle] === 'su')
    return [...pasSues, ...sues].map((c) => c.cle)
  }
  const [paquet, setPaquet] = useState<string[]>(paquetInitial)
  const [pos, setPos] = useState(0)
  const [retournee, setRetournee] = useState(false)
  const questionRef = useRef<HTMLParagraphElement>(null)
  const parCle = useMemo(() => new Map(cartes.map((c) => [c.cle, c])), [cartes])

  const sues = cartes.filter((c) => etats[c.cle] === 'su').length
  const aRevoir = cartes.filter((c) => etats[c.cle] === 'revoir').length
  const fini = pos >= paquet.length
  const carte = fini ? null : parCle.get(paquet[pos])

  function repondre(etat: EtatCarte) {
    if (!carte) return
    noter(carte.cle, etat)
    if (etat === 'revoir') setPaquet((p) => [...p, carte.cle])
    setPos((n) => n + 1)
    setRetournee(false)
    requestAnimationFrame(() => questionRef.current?.focus())
  }

  function recommencer(seulementARevoir: boolean) {
    const liste = seulementARevoir ? cartes.filter((c) => etats[c.cle] === 'revoir') : cartes
    if (!seulementARevoir) effacer()
    setPaquet(liste.map((c) => c.cle))
    setPos(0)
    setRetournee(false)
  }

  return (
    <section className="teste-toi" aria-labelledby="teste-toi-titre">
      <p className="teste-toi-tete">
        <span id="teste-toi-titre">Teste-toi</span>
        {!fini && (
          <span>
            · carte {pos + 1} / {paquet.length}
          </span>
        )}
      </p>
      {carte ? (
        <>
          <p className="teste-toi-etape">
            Étape {carte.numero} · {carte.etape}
          </p>
          <p className="teste-toi-question" ref={questionRef} tabIndex={-1}>
            <RichText text={carte.question} />
          </p>
          <div aria-live="polite">
            {retournee && (
              <p className="teste-toi-reponse">
                <RichText text={carte.reponse} />
              </p>
            )}
          </div>
          {retournee ? (
            <div className="teste-toi-boutons">
              <button type="button" className="btn-parcours btn-su" onClick={() => repondre('su')}>
                Je savais
              </button>
              <button type="button" className="btn-parcours btn-revoir" onClick={() => repondre('revoir')}>
                À revoir
              </button>
            </div>
          ) : (
            <button type="button" className="btn-parcours btn-plein" onClick={() => setRetournee(true)}>
              Voir la réponse
            </button>
          )}
        </>
      ) : (
        <div className="teste-toi-fin">
          <p className="teste-toi-question">Paquet terminé.</p>
          <p>
            {sues} carte{sues > 1 ? 's' : ''} sue{sues > 1 ? 's' : ''} · {aRevoir} à revoir (sur {cartes.length}).
          </p>
          <div className="teste-toi-boutons">
            {aRevoir > 0 && (
              <button type="button" className="btn-parcours btn-plein" onClick={() => recommencer(true)}>
                Revoir les {aRevoir} cartes à revoir
              </button>
            )}
            <button type="button" className="btn-parcours" onClick={() => recommencer(false)}>
              Tout recommencer
            </button>
          </div>
        </div>
      )}
      <div className="teste-toi-avancement" aria-hidden="true">
        <span style={{ width: `${paquet.length ? (100 * Math.min(pos, paquet.length)) / paquet.length : 0}%` }} />
      </div>
    </section>
  )
}
