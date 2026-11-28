import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RichText } from '../Math'
import { BlocEvaluation, PastilleCompetence } from '../eleve/BlocEvaluation'
import { dateIso, type Classe, type Seance } from '../../lib/carnet'
import type { Evenement } from '../../lib/agendaEvenements'
import { rappelEvaluation } from '../../lib/espaceProfesseur'
import { urlEvaluationMatiere } from '../../lib/carnetMatiere'
import { contenuEnregistre, dansJours, designation, exercicesDevoir, heureOrdinale, jourLong, messageSuppression, messageSuppressionDevoir, NOM_COMPETENCE, textesBloc, textesDevoir, type ContenuDevoir } from '../../lib/evaluationAnnoncee'
import { interroPubliee } from '../../lib/pageClasseContenu'
import { lienPlanRevision } from '../../lib/pageClasse'
import { useCarnet } from './contexteCarnet'
import type { EtatPageEleves, TextesAnnonce } from './AnnoncerEvaluation'
import './fiche.css'

const majuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

function Tete({ etiquette, titreId, titre, sous, onFermer }: { etiquette: string; titreId: string; titre: ReactNode; sous: ReactNode; onFermer: () => void }) {
  return (
    <div className="carnet-panneau-tete fi-tete">
      <span className="fi-poignee" aria-hidden="true" />
      <div className="carnet-panneau-titres">
        <p className="fi-etiquette">{etiquette}</p>
        <h2 id={titreId}>{titre}</h2>
        <p className="carnet-panneau-resume fi-sous">{sous}</p>
      </div>
      <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer la fiche" onClick={onFermer} data-autofocus>
        <span aria-hidden="true">×</span>
      </button>
    </div>
  )
}

/** Confirmation de suppression DANS la fiche (jamais `confirm()`) ; Échap = « Garder », sans fermer la fiche. */
function Confirmation({
  titre,
  retire,
  reste,
  message,
  libelleOui,
  libelleNon,
  occupe,
  onOui,
  onNon,
}: {
  titre: string
  retire: string[]
  reste: string[]
  message: string
  libelleOui: string
  libelleNon: string
  occupe: boolean
  onOui: (copier: boolean) => void
  onNon: () => void
}) {
  const [copier, setCopier] = useState(true)
  const non = useRef<HTMLButtonElement>(null)
  useEffect(() => non.current?.focus(), [])
  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onNon()
    }
  }
  return (
    <div className="fi-confirmer" role="alertdialog" aria-labelledby="fi-confirmer-titre" onKeyDown={clavier}>
      <h3 id="fi-confirmer-titre">{titre}</h3>
      <p className="fi-confirmer-sous">Ce qui sera retiré</p>
      <ul>
        {retire.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="fi-confirmer-sous">Ce qui reste</p>
      <ul>
        {reste.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <label className="annonce-case">
        <input type="checkbox" checked={copier} onChange={(e) => setCopier(e.target.checked)} />
        <span>Copier un message pour prévenir les élèves</span>
      </label>
      {copier && <p className="annonce-message">{message}</p>}
      <p className="fi-aide">Pas d’annulation après la suppression : cette confirmation la remplace.</p>
      <div className="fi-boutons">
        <button type="button" className="ep-bouton fi-rouge-plein" disabled={occupe} onClick={() => onOui(copier)}>
          {libelleOui}
        </button>
        <button type="button" className="ep-bouton" ref={non} onClick={onNon}>
          {libelleNon}
        </button>
      </div>
    </div>
  )
}

function Ligne({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="fi-ligne">
      <dt>{titre}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * Fiche d'une évaluation annoncée (maquette « fiche-eval » 2 et 5, 28/11/2026), dans `PanneauLateral` (feuille du bas
 * sur téléphone) : nom et classe, date, heure, « dans n jours », rappel J−n, compétences, chapitres → points →
 * exercices, ce qui est publié, « annoncée le … », « Ce que voient tes élèves » (le bloc publié) ; Modifier,
 * Préparer l'évaluation, Copier le texte, et à part en rouge « Supprimer l'évaluation… » (confirmation dans la fiche).
 */
export function FicheEvaluation({
  evenement,
  seance,
  classe,
  seances,
  pageEleves,
  maintenant,
  titreId,
  occupe,
  onModifier,
  onCopier,
  onSupprimer,
  onFermer,
}: {
  evenement: Evenement
  seance: Seance | undefined
  classe: Classe
  seances: Seance[]
  pageEleves: EtatPageEleves
  maintenant: Date
  titreId: string
  occupe: boolean
  onModifier: () => void
  onCopier: (t: TextesAnnonce) => void
  onSupprimer: (message: string | null) => void
  onFermer: () => void
}) {
  const ctx = useCarnet()
  const [confirmer, setConfirmer] = useState(false)
  const aujourdhui = dateIso(maintenant)
  const contenu = contenuEnregistre(evenement, seance)
  const publiee = interroPubliee(evenement, contenu, { classe, seancesClasse: seances.filter((s) => s.classe_id === classe.id), grilles: ctx.grilles, format: ctx.format, avecHeure: true })
  const plan = lienPlanRevision(publiee)
  const d = designation(contenu.nom)
  const rappel = rappelEvaluation(evenement.du, aujourdhui)
  const heure = evenement.journee_entiere || evenement.heure_debut === null ? '' : heureOrdinale(evenement.heure_debut, evenement.heure_fin)
  const titres = contenu.chapitres.map((c) => c.titre)
  const preparer =
    contenu.chapitres.length > 0
      ? urlEvaluationMatiere(
          { levelSlug: contenu.chapitres[0].niveau, chapitres: contenu.chapitres.filter((c) => c.niveau === contenu.chapitres[0].niveau).map((c) => ({ slug: c.slug, sections: c.points.map((p) => p.id), generateurs: c.points.flatMap((p) => p.exercices.map((x) => x.id)) })) },
          '',
          classe.nom,
          classe.id,
        )
      : null
  const annonceeLe = seance?.date_seance ?? (evenement.cree_le ? evenement.cree_le.slice(0, 10) : null)
  const passee = evenement.du < aujourdhui
  return (
    <>
      <Tete
        etiquette={`${contenu.nom} · ${classe.nom}`}
        titreId={titreId}
        titre={`${contenu.nom}${titres.length > 0 ? ` : ${titres.join(' et ')}` : ''}`}
        sous={
          <>
            {majuscule(jourLong(evenement.du))}
            {heure ? ` · ${heure}` : ''} · {dansJours(evenement.du, aujourdhui)}
            {rappel && <span className="ep-rappel fi-rappel">{rappel}</span>}
          </>
        }
        onFermer={onFermer}
      />
      <div className="carnet-panneau-corps fi-corps">
        {confirmer ? (
          <Confirmation
            titre={`Supprimer ${d.le} du ${jourLong(evenement.du)} (${classe.nom}) ?`}
            retire={[
              `${majuscule(d.le)} de ton agenda, de Ma semaine et ses rappels J−7 / J−2 ;`,
              'l’annonce sur la page des élèves et sur leur carte « Ma classe » ;',
              'les points et les exercices choisis pour cette évaluation.',
            ]}
            reste={['la matière vue notée dans tes séances ;', 'une évaluation déjà préparée et enregistrée dans Mes documents.']}
            message={messageSuppression({ classe: classe.nom, nom: contenu.nom, date: evenement.du })}
            libelleOui={`Supprimer ${d.le.replace(/^l’évaluation .*/, 'l’évaluation')}`}
            libelleNon={`Garder ${d.le.replace(/^l’évaluation .*/, 'l’évaluation')}`}
            occupe={occupe}
            onOui={(copier) => onSupprimer(copier ? messageSuppression({ classe: classe.nom, nom: contenu.nom, date: evenement.du }) : null)}
            onNon={() => setConfirmer(false)}
          />
        ) : (
          <>
            <dl className="fi-lignes">
              <Ligne titre="Nom">{contenu.nom}</Ligne>
              <Ligne titre="Compétences">
                <span className="fi-comps">
                  {contenu.competences.map((c) => (
                    <PastilleCompetence key={c} c={c} />
                  ))}
                </span>
              </Ligne>
              <Ligne titre="Contenu">
                {contenu.chapitres.length === 0 ? (
                  <span className="fi-aide">Aucun point précisé.</span>
                ) : (
                  contenu.chapitres.map((ch) => (
                    <div key={ch.slug} className="fi-chap">
                      <strong>{ch.titre}</strong>
                      {ch.points.length > 0 && (
                        <ul>
                          {ch.points.map((p) => (
                            <li key={p.id}>
                              {p.numero}. <RichText text={p.titre} />
                              {p.exercices.length > 0 && (
                                <span className="fi-codes">
                                  {p.exercices.map((x) => (
                                    <span key={x.id} className="fi-code" title={x.titre}>
                                      <PastilleCompetence c={x.competence} petite /> {x.id}
                                      <span className="carnet-sr"> : {x.titre} ({NOM_COMPETENCE[x.competence]})</span>
                                    </span>
                                  ))}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      {ch.connaitre && <p className="fi-aide">Connaître : questions « formule » et quiz vrai/faux{ch.quiz ? ` (${ch.quiz})` : ''}</p>}
                    </div>
                  ))
                )}
              </Ligne>
              <Ligne titre="Publiée">
                <span className="fi-publie">
                  <span className={pageEleves.etat === 'publiee' && pageEleves.interros ? 'ok' : 'non'}>{pageEleves.etat === 'publiee' && pageEleves.interros ? '✓ page des élèves' : 'pas sur la page des élèves'}</span>
                  {' · '}
                  <span className="ok">✓ agenda (rappels 7 et 2 jours avant)</span>
                </span>
              </Ligne>
              {annonceeLe && <Ligne titre="Annoncée">le {jourLong(annonceeLe)}</Ligne>}
            </dl>
            <details className="fi-eleves">
              <summary>Ce que voient tes élèves</summary>
              <BlocEvaluation interro={passee ? { ...publiee } : publiee} aujourdhui={aujourdhui} plan={plan} nouvelOnglet />
            </details>
            <div className="fi-boutons">
              <button type="button" className="ep-bouton principal" disabled={occupe} onClick={onModifier}>
                Modifier
              </button>
              {preparer && (
                <Link className="ep-bouton" to={preparer}>
                  Préparer l’évaluation <span aria-hidden="true">›</span>
                </Link>
              )}
              <button type="button" className="ep-bouton" onClick={() => onCopier(textesBloc(publiee, { classe: classe.nom, lienPlan: plan }))}>
                Copier le texte
              </button>
            </div>
            <div className="fi-boutons fi-zone-rouge">
              <button type="button" className="ep-bouton fi-rouge" disabled={occupe} onClick={() => setConfirmer(true)}>
                Supprimer l’évaluation…
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

/** Fiche d'un devoir donné : consigne, pour quand, exercices joints (codes), Modifier, Copier le texte, Supprimer. */
export function FicheDevoir({
  seance,
  classe,
  pageEleves,
  maintenant,
  titreId,
  occupe,
  onModifier,
  onCopier,
  onSupprimer,
  onFermer,
}: {
  seance: Seance
  classe: Classe
  pageEleves: EtatPageEleves
  maintenant: Date
  titreId: string
  occupe: boolean
  onModifier: () => void
  onCopier: (t: TextesAnnonce) => void
  onSupprimer: (message: string | null) => void
  onFermer: () => void
}) {
  const [confirmer, setConfirmer] = useState(false)
  const aujourdhui = dateIso(maintenant)
  const d: ContenuDevoir = { consigne: seance.devoir, pour: seance.devoir_pour ?? null, niveau: seance.niveau, chapitre: seance.chapitre, exercices: exercicesDevoir(seance.niveau, seance.chapitre, seance.devoir_generateurs ?? []) }
  const message = messageSuppressionDevoir({ classe: classe.nom, pour: d.pour })
  return (
    <>
      <Tete
        etiquette={`Devoir · ${classe.nom}`}
        titreId={titreId}
        titre={d.pour ? `Devoir pour le ${jourLong(d.pour)}` : 'Devoir (sans date de remise)'}
        sous={d.pour ? `À rendre ${dansJours(d.pour, aujourdhui)} · donné le ${jourLong(seance.date_seance)}` : `Donné le ${jourLong(seance.date_seance)}`}
        onFermer={onFermer}
      />
      <div className="carnet-panneau-corps fi-corps">
        {confirmer ? (
          <Confirmation
            titre={`Supprimer le devoir${d.pour ? ` pour le ${jourLong(d.pour)}` : ''} (${classe.nom}) ?`}
            retire={['le devoir de ton agenda et de Ma semaine (« À rendre ») ;', 'le devoir sur la page des élèves et sur leur carte « Ma classe » ;', 'la consigne et les exercices joints.']}
            reste={['la matière vue notée dans tes séances ;', 'tes documents de Mes documents.']}
            message={message}
            libelleOui="Supprimer le devoir"
            libelleNon="Garder le devoir"
            occupe={occupe}
            onOui={(copier) => onSupprimer(copier ? message : null)}
            onNon={() => setConfirmer(false)}
          />
        ) : (
          <>
            <dl className="fi-lignes">
              <Ligne titre="Consigne">{d.consigne.trim() ? <span className="fi-consigne">{d.consigne.trim()}</span> : <span className="fi-aide">(sans consigne écrite)</span>}</Ligne>
              <Ligne titre="Pour le">{d.pour ? jourLong(d.pour) : 'sans date'}</Ligne>
              <Ligne titre="Exercices">
                {d.exercices.length === 0 ? (
                  <span className="fi-aide">Aucun exercice en ligne joint.</span>
                ) : (
                  <ul>
                    {d.exercices.map((x) => (
                      <li key={x.id}>
                        <strong>{x.id}</strong> {x.titre}
                      </li>
                    ))}
                  </ul>
                )}
              </Ligne>
              <Ligne titre="Publié">
                <span className={pageEleves.etat === 'publiee' && pageEleves.devoirs ? 'ok' : 'non'}>{pageEleves.etat === 'publiee' && pageEleves.devoirs ? '✓ page des élèves' : 'pas sur la page des élèves'}</span> · <span className="ok">✓ agenda (« À rendre »)</span>
              </Ligne>
            </dl>
            <div className="fi-boutons">
              <button type="button" className="ep-bouton principal" disabled={occupe} onClick={onModifier}>
                Modifier
              </button>
              <button type="button" className="ep-bouton" onClick={() => onCopier(textesDevoir(d, { classe: classe.nom }))}>
                Copier le texte
              </button>
            </div>
            <div className="fi-boutons fi-zone-rouge">
              <button type="button" className="ep-bouton fi-rouge" disabled={occupe} onClick={() => setConfirmer(true)}>
                Supprimer le devoir…
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
