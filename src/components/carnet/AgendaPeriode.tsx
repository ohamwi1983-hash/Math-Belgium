import { useId, useMemo, useState } from 'react'
import { nomEvaluation } from '../../lib/evaluationAnnoncee'
import { generatorLink } from '../../lib/generatorLink'
import { dateIso, type Classe, type FormatHoraire, type Seance } from '../../lib/carnet'
import {
  construireAgenda,
  dateValide,
  htmlSmartschoolAgenda,
  LIBELLE_RACCOURCI,
  nomFichierAgenda,
  periodeRaccourci,
  periodeTexte,
  texteSmartschoolAgenda,
  texteSynthese,
  type Raccourci,
} from '../../lib/carnetAgenda'
import { agendaPeriodeHtml } from '../../lib/carnetFiche'
import type { GrilleHoraire } from '../../lib/horaire'
import { copierTexte, ouvrirFiche, telechargerFiche } from './outilsCarnet'
import { classesTouchees, concerne, dateCourteJour, evenementsEntre, resumeSuppressions, titreEvenement } from '../../lib/agendaEvenements'
import { PuceType } from './AgendaUi'
import { useCarnet } from './contexteCarnet'
import { titreChapitre } from './HeuresEffectives'
import { ListeARendre } from './DevoirsARendre'
import { devoirsEntre } from '../../lib/carnetDevoirs'

const RACCOURCIS: Raccourci[] = ['semaine', 'mois', 'rentree', 'dernierConge']
const TOUTES = '*'

/**
 * « Agenda d'une période » : toutes les séances d'une classe (ou de toutes) d'une date à une autre,
 * semaine par semaine, congés FWB signalés, synthèse ; imprimer (onglet ouvert par un lien,
 * impression au chargement), télécharger (HTML A4, nom ASCII) ou copier pour Smartschool. La
 * remarque libre est exclue par défaut (note privée).
 */
export function AgendaPeriode({
  classes,
  seances,
  ecoles,
  grilles,
  format,
  dureeHeure,
  professeur,
  classeActive,
  maintenant,
}: {
  classes: Classe[]
  seances: Seance[]
  ecoles: { id: string; nom: string }[]
  grilles: GrilleHoraire[]
  format: FormatHoraire
  dureeHeure: number
  professeur: string
  classeActive: string | null
  maintenant: Date
}) {
  const id = useId()
  const ctx = useCarnet()
  const aujourdhui = dateIso(maintenant)
  const depart = periodeRaccourci('dernierConge', aujourdhui)
  // `null` : pas encore choisie ici → suit la classe active du carnet.
  const [choixClasse, setChoixClasse] = useState<string | null>(null)
  const [du, setDu] = useState(depart.du)
  const [au, setAu] = useState(depart.au)
  const [remarques, setRemarques] = useState(false)
  const [liens, setLiens] = useState(true)
  const [parClasse, setParClasse] = useState(false)
  const [retour, setRetour] = useState<{ type: 'ok' | 'echec'; texte: string } | null>(null)
  const [texteManuel, setTexteManuel] = useState<string | null>(null)

  const choix = choixClasse ?? classeActive ?? TOUTES
  const classeId = choix === TOUTES || !classes.some((c) => c.id === choix) ? null : choix
  const erreurDates = !dateValide(du) ? 'Date de début manquante ou illisible.' : !dateValide(au) ? 'Date de fin manquante ou illisible.' : du > au ? 'La date de début doit précéder la date de fin.' : null

  const agenda = useMemo(() => {
    if (erreurDates) return null
    const nomsEcoles = new Map(ecoles.map((e) => [e.id, e.nom]))
    const grilleDe = (k: Classe) => grilles.find((g) => g.ecole_id === k.ecole_id)
    return construireAgenda({
      seances,
      classes,
      ecoles: nomsEcoles,
      du,
      au,
      classeId,
      format,
      avecGrille: (k) => grilleDe(k) !== undefined,
      dureeHeure: (k) => grilleDe(k)?.duree_heure ?? dureeHeure,
      lienGenerateur: generatorLink,
      parClasse,
      aujourdhui,
    })
  }, [erreurDates, ecoles, grilles, seances, classes, du, au, classeId, format, dureeHeure, parClasse, aujourdhui])

  const options = { remarques, liens }
  const nomClasse = classeId ? (classes.find((c) => c.id === classeId)?.nom ?? '') : 'toutes tes classes'
  const pret = agenda !== null && !agenda.vide

  function changerDates(d: string, a: string) {
    setDu(d)
    setAu(a)
    setRetour(null)
    setTexteManuel(null)
  }

  function appliquer(r: Raccourci) {
    const p = periodeRaccourci(r, aujourdhui)
    changerDates(p.du, p.au)
  }

  function imprimer() {
    if (!agenda || agenda.vide) return
    ouvrirFiche(agendaPeriodeHtml(agenda, { ...options, professeur }))
    setRetour({ type: 'ok', texte: 'Agenda ouvert dans un nouvel onglet : l’impression se lance (choisis « Enregistrer en PDF » pour un fichier PDF).' })
  }

  function telecharger() {
    if (!agenda || agenda.vide) return
    const nom = nomFichierAgenda(agenda)
    telechargerFiche(agendaPeriodeHtml(agenda, { ...options, professeur }), nom)
    setRetour({ type: 'ok', texte: `Téléchargé : ${nom} (s’ouvre dans le navigateur, imprimable en A4).` })
  }

  async function copier() {
    if (!agenda || agenda.vide) return
    const texte = texteSmartschoolAgenda(agenda, options)
    const ok = await copierTexte(texte, htmlSmartschoolAgenda(agenda, options))
    setTexteManuel(ok ? null : texte)
    setRetour(ok ? { type: 'ok', texte: 'Copié : colle-le dans Smartschool (journal de classe ou message).' } : { type: 'echec', texte: 'Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.' })
  }

  const raccourciActif = RACCOURCIS.find((r) => {
    const p = periodeRaccourci(r, aujourdhui)
    return p.du === du && p.au === au
  })

  return (
    <section className="compte-section carnet-agenda" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`}>Agenda d'une période</h2>
      <p className="compte-aide">Toutes les séances d'une période, semaine par semaine, avec les congés de la Fédération Wallonie-Bruxelles : à imprimer, télécharger ou copier pour Smartschool.</p>

      <div className="carnet-agenda-champs">
        <div className="compte-champ carnet-champ-moyen">
          <label htmlFor={`${id}-classe`}>Classe</label>
          <select
            id={`${id}-classe`}
            value={classeId ?? TOUTES}
            onChange={(e) => {
              setChoixClasse(e.target.value)
              setRetour(null)
              setTexteManuel(null)
            }}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
                {ecoles.length > 1 ? ` — ${ecoles.find((e) => e.id === c.ecole_id)?.nom ?? ''}` : ''}
              </option>
            ))}
            <option value={TOUTES}>Toutes mes classes</option>
          </select>
        </div>
        <div className="carnet-agenda-dates">
          <div className="compte-champ carnet-champ-date">
            <label htmlFor={`${id}-du`}>Du</label>
            <input id={`${id}-du`} type="date" value={du} max={au || undefined} onChange={(e) => changerDates(e.target.value, au)} />
          </div>
          <div className="compte-champ carnet-champ-date">
            <label htmlFor={`${id}-au`}>Au</label>
            <input id={`${id}-au`} type="date" value={au} min={du || undefined} onChange={(e) => changerDates(du, e.target.value)} />
          </div>
        </div>
      </div>

      <div className="carnet-agenda-raccourcis" role="group" aria-label="Raccourcis de période">
        {RACCOURCIS.map((r) => (
          <button key={r} type="button" className="carnet-puce" aria-pressed={raccourciActif === r} onClick={() => appliquer(r)}>
            {LIBELLE_RACCOURCI[r]}
          </button>
        ))}
      </div>

      <fieldset className="carnet-fieldset carnet-agenda-options">
        <legend>Contenu</legend>
        <label className="carnet-case">
          <input type="checkbox" checked={liens} onChange={(e) => setLiens(e.target.checked)} />
          <span>Inclure les liens vers les sections du cours et les exercices</span>
        </label>
        <label className="carnet-case">
          <input type="checkbox" checked={remarques} onChange={(e) => setRemarques(e.target.checked)} />
          <span>
            Inclure mes remarques <span className="carnet-deja-vu">(notes privées : décoché par défaut)</span>
          </span>
        </label>
        {classeId === null && (
          <label className="carnet-case">
            <input type="checkbox" checked={parClasse} onChange={(e) => setParClasse(e.target.checked)} />
            <span>Une section par classe (sinon un seul tableau chronologique avec une colonne « Classe »)</span>
          </label>
        )}
      </fieldset>

      {erreurDates ? (
        <p className="compte-erreur-champ" role="alert">
          {erreurDates}
        </p>
      ) : agenda && agenda.vide ? (
        <p className="compte-vide carnet-agenda-resume" role="status">
          Aucune séance notée pour {nomClasse} {periodeTexte(du, au)} : rien à imprimer. Choisis une autre période ou une autre classe.
        </p>
      ) : agenda ? (
        <p className="carnet-agenda-resume" role="status">
          <strong>{texteSynthese(agenda.synthese)}</strong> pour {nomClasse} {periodeTexte(agenda.du, agenda.au)}.
          {agenda.aConfirmer.length > 0 && <span className="carnet-agenda-note"> Calendrier FWB {agenda.aConfirmer.join(', ')} à confirmer : ses congés ne sont pas indiqués.</span>}
        </p>
      ) : null}

      <div className="compte-actions carnet-agenda-actions">
        <button type="button" className="compte-bouton" disabled={!pret} onClick={imprimer}>
          Imprimer l'agenda
        </button>
        <button type="button" className="compte-bouton-secondaire" disabled={!pret} onClick={telecharger}>
          Télécharger (HTML A4)
        </button>
        <button type="button" className="compte-bouton-secondaire" disabled={!pret} onClick={() => void copier()}>
          Copier pour Smartschool
        </button>
      </div>
      {retour && (
        <p className={retour.type === 'ok' ? 'compte-message carnet-copie' : 'compte-aide carnet-copie'} role="status">
          {retour.texte}
        </p>
      )}
      {texteManuel !== null && (
        <textarea className="carnet-texte-copie" readOnly rows={10} value={texteManuel} onFocus={(e) => e.currentTarget.select()} aria-label="Agenda pour Smartschool" />
      )}

      {ctx.devoirs && !erreurDates && <ListeARendre seances={devoirsEntre(seances, du, au, classeId)} titre="Devoirs à rendre de la période" avecClasse={!classeId} avecDate idTitre={`${id}-devoirs`} />}

      {ctx.agenda.actif && !erreurDates && (
        <section className="agenda-periode-evenements" aria-labelledby={`${id}-evs`}>
          <div className="agenda-periode-evenements-tete">
            <h3 id={`${id}-evs`}>Événements de la période</h3>
            <button
              type="button"
              className="carnet-bouton principal agenda-bouton-evenement"
              onClick={() => {
                const d = du <= aujourdhui && aujourdhui <= au ? aujourdhui : du
                ctx.nouvelEvenement({ du: d, au: d, ...(classeId ? { ecole_id: classes.find((c) => c.id === classeId)?.ecole_id, toutes_classes: false, classes: [classeId] } : {}) })
              }}
            >
              <span aria-hidden="true">+</span> Événement
            </button>
          </div>
          {(() => {
            const classe = classeId ? classes.find((c) => c.id === classeId) : undefined
            const liste = evenementsEntre(ctx.agenda.evenements, du, au).filter((e) => {
              if (!classe) return true
              if (concerne(e, classe)) return true
              // « J'accompagne » qui supprime une heure de cette classe.
              return !!ctx.ctxAgenda && e.accompagne && classesTouchees(e, ctx.ctxAgenda).has(classe.id)
            })
            if (liste.length === 0) return <p className="compte-vide">Aucun événement {classe ? `pour ${classe.nom} ` : ''}sur cette période.</p>
            return (
              <ul className="agenda-liste-periode">
                {liste.map((e) => {
                  const r = ctx.ctxAgenda ? resumeSuppressions(e, ctx.ctxAgenda) : null
                  const quoi = e.type === 'interrogation' ? [nomEvaluation(e.intitule), classes.find((c) => c.id === e.classe_id)?.nom, e.chapitre ? titreChapitre(e.chapitre) : null].filter(Boolean).join(' · ') : titreEvenement(e)
                  return (
                    <li key={e.id}>
                      <button type="button" className="agenda-a-venir-ligne colonne" onClick={() => ctx.ouvrirEvenement(e)}>
                        <PuceType type={e.type} />
                        <span>
                          {e.du === e.au ? dateCourteJour(e.du) : `${dateCourteJour(e.du)} → ${dateCourteJour(e.au)}`} — {quoi}
                        </span>
                      </button>
                      {r && (
                        <p className="agenda-heures-barrees">
                          Pas cours : <s>{r.texte}</s>
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            )
          })()}
        </section>
      )}
    </section>
  )
}
