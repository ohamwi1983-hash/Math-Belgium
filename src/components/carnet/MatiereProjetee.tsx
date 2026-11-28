import { useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SupabaseClient } from '@supabase/supabase-js'
import { findChapter } from '../../content/chaptersIndex'
import { erreursSeance, numeroHeureTexte, structureChapitre, texteBrut, dateIso } from '../../lib/carnet'
import { ajouterSeance, chargerSeances, modifierSeance } from '../../lib/carnetDonnees'
import { dateJourLong } from '../../lib/agendaEvenements'
import { dateCourteDevoir, prochainsCours } from '../../lib/carnetDevoirs'
import { creneauxDuJour, libelleCreneau, type Creneau } from '../../lib/horaire'
import { messageErreur } from '../../lib/compteValidation'
import { titreCourtChapitre } from '../../entrainement/export/examen'
import { RichText } from '../Math'
import { enPartie, generateursOuverts, saisieMatiere, seanceACompleter, unitesProposees, type ChoixMatiere, type PropositionMatiere } from '../../lib/projection/matiereProjetee'
import { chargerDonneesMatiere, suppressionDe, type DonneesMatiere } from '../../lib/projection/matiereDonnees'
import { EVENEMENT_PROPOSITIONS, lirePropositionsGardees, retirerProposition } from '../../lib/projection/suiviProjection'
import { PanneauLateral } from './PanneauLateral'
import { heureCourte } from './outilsCarnet'
import './matiere-projetee.css'

/**
 * « Noter la matière vue de la 5e A ? » (maquette « fin-projection », chantier M du 27/11/2026) : étapes
 * projetées et générateurs ouverts pré-cochés, « vu en partie » (sous-parties montrées), devoir facultatif,
 * « Changer de classe ou de date ». « Enregistrer dans Mes classes » crée la séance du carnet ou COMPLÈTE celle
 * déjà notée pour ce créneau (mêmes tables et mêmes fonctions que « Noter la séance » : `ajouterSeance` /
 * `modifierSeance`, `normaliserParties`, `erreursSeance`). Rien n'est écrit sans ce clic.
 * Utilisé à la fin de la projection (vue du professeur) et, pour une proposition gardée (« Plus tard »), dans
 * « Aujourd'hui » de Mes classes et sur le tableau de bord.
 */
export function FormulaireMatiere({
  proposition,
  donnees,
  client,
  titreId,
  surtitre,
  enPlus,
  plusTardLibelle = 'Plus tard',
  onPlusTard,
  onRienNoter,
  onEnregistre,
}: {
  proposition: PropositionMatiere
  donnees: DonneesMatiere
  client: SupabaseClient
  titreId: string
  surtitre: string
  /** Boutons ajoutés dans la rangée d'actions (fin de projection : « Télécharger le PowerPoint annoté »). */
  enPlus?: ReactNode
  plusTardLibelle?: string
  onPlusTard: () => void
  /** « Ne rien noter » (fin de projection) : rien n'est écrit ni gardé pour plus tard. Absent : pas de bouton. */
  onRienNoter?: () => void
  onEnregistre: (r: { message: string; classeId: string }) => void
}) {
  const id = useId()
  const chapitre = findChapter(proposition.niveau, proposition.chapitre)
  const structure = useMemo(() => (chapitre ? structureChapitre(chapitre) : []), [chapitre])
  const gens = useMemo(() => (chapitre ? generateursOuverts(chapitre, proposition.generateurs) : []), [chapitre, proposition.generateurs])
  const [unites, setUnites] = useState<Set<string>>(() => new Set(proposition.etapes.flatMap((e) => unitesProposees(e, structure.find((s) => s.id === e.id)))))
  const [gensCoches, setGensCoches] = useState<Set<string>>(() => new Set(proposition.generateurs))
  const [devoirCoche, setDevoirCoche] = useState(false)
  const [devoir, setDevoir] = useState('')
  const [changer, setChanger] = useState(false)
  const [classeId, setClasseId] = useState(proposition.classeId)
  const [date, setDate] = useState(proposition.date)
  const [creneauCle, setCreneauCle] = useState(`${proposition.creneau.heureDebut}-${proposition.creneau.heureFin}`)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  const supprimee = useMemo(() => suppressionDe(donnees), [donnees])
  const creneauxClasse = useMemo<Creneau[]>(() => {
    if (!donnees.horaire.actif || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
    return creneauxDuJour(date, donnees.horaire.grilles, donnees.horaire.cases, { supprimee }).creneaux.filter((c) => c.classe_id === classeId)
  }, [donnees, date, classeId, supprimee])
  const creneau = creneauCle ? (creneauxClasse.find((c) => `${c.heureDebut}-${c.heureFin}` === creneauCle) ?? (classeId === proposition.classeId && date === proposition.date ? proposition.creneau : null)) : null
  const classe = donnees.classes.find((c) => c.id === classeId)
  const choixTouche = classeId !== proposition.classeId || date !== proposition.date || creneauCle !== `${proposition.creneau.heureDebut}-${proposition.creneau.heureFin}`

  // Changer de classe ou de date : premier créneau de la classe ce jour-là, sinon « sans heure précise ».
  function choisirClasseOuDate(c: string, d: string) {
    setClasseId(c)
    setDate(d)
    if (c === proposition.classeId && d === proposition.date) {
      setCreneauCle(`${proposition.creneau.heureDebut}-${proposition.creneau.heureFin}`)
      return
    }
    const liste = donnees.horaire.actif && /^\d{4}-\d{2}-\d{2}$/.test(d) ? creneauxDuJour(d, donnees.horaire.grilles, donnees.horaire.cases, { supprimee }).creneaux.filter((k) => k.classe_id === c) : []
    setCreneauCle(liste[0] ? `${liste[0].heureDebut}-${liste[0].heureFin}` : '')
  }

  const prochain = useMemo(() => {
    if (!donnees.devoirs || !donnees.horaire.actif || !classeId) return null
    return prochainsCours({ classeId, apres: date, grilles: donnees.horaire.grilles, cases: donnees.horaire.cases, evenements: donnees.agenda.actif ? donnees.agenda.evenements : [], classes: donnees.classes, n: 1 })[0]?.date ?? null
  }, [donnees, classeId, date])

  const choix: ChoixMatiere = {
    classeId,
    date,
    creneau: creneau ? { heureDebut: creneau.heureDebut, heureFin: creneau.heureFin, debut: creneau.debut, fin: creneau.fin } : null,
    unites: [...unites],
    generateurs: gens.filter((g) => gensCoches.has(g.id)).map((g) => g.id),
    devoir: devoirCoche ? devoir : '',
    devoirPour: devoirCoche && devoir.trim() ? prochain : null,
  }
  const deja = chapitre ? seanceACompleter(choix, chapitre, donnees.seances) : { seance: null, autre: null }

  if (!chapitre) return null
  const titreChapitre = (niveau: string, slug: string) => {
    const c = findChapter(niveau, slug)
    return c ? titreCourtChapitre(c.slug, texteBrut(c.title)) : slug
  }

  const quand = `${capitale(dateJourLong(date))}${creneau ? `, ${numeroHeureTexte(creneau.heureDebut, creneau.heureFin)} (${heureCourte(creneau.debut)})` : ', sans heure précise'}`

  async function enregistrer() {
    if (!chapitre) return
    setErreur(null)
    if (choix.unites.length === 0 && choix.generateurs.length === 0 && !choix.devoir.trim()) {
      setErreur('Coche au moins un point ou un exercice (ou « Plus tard » si tu préfères noter la séance autrement).')
      return
    }
    setEnvoi(true)
    try {
      // Séances relues juste avant d'écrire : on complète la séance la plus récente, jamais un doublon.
      const frais = await chargerSeances(client, donnees.horaire.actif)
      const { seance } = seanceACompleter(choix, chapitre, frais.seances)
      const saisie = saisieMatiere(chapitre, choix, seance, frais.devoirs)
      const err = Object.values(erreursSeance(saisie)).filter(Boolean)
      if (err.length > 0) {
        setErreur(err.join(' '))
        return
      }
      if (seance) await modifierSeance(client, seance.id, saisie, donnees.horaire.actif, frais.devoirs, frais.generateursEval)
      else await ajouterSeance(client, saisie, donnees.horaire.actif, frais.devoirs, frais.generateursEval)
      retirerProposition(proposition.id)
      const nom = classe?.nom ?? 'la classe'
      onEnregistre({ classeId, message: `Matière vue ${seance ? 'ajoutée à la séance' : 'enregistrée'} : ${nom}, ${dateJourLong(date)}${creneau ? ` (${numeroHeureTexte(creneau.heureDebut, creneau.heureFin)})` : ''}.` })
    } catch (ex) {
      setErreur(messageErreur(ex))
    } finally {
      setEnvoi(false)
    }
  }

  const classesTriees = [...donnees.classes].sort((a, b) => Number(b.niveau === chapitre.levelSlug) - Number(a.niveau === chapitre.levelSlug))

  return (
    <div className="mv">
      <p className="mv-surtitre">{surtitre}</p>
      <h2 id={titreId} className="mv-titre">
        Noter la matière vue {classe ? `de la ${classe.nom}` : ''} ?
      </h2>
      <p className="mv-quand">
        {quand}
        {choixTouche ? ' — choisi par toi.' : ' — d’après ton horaire.'}{' '}
        <button type="button" className="mv-lien" aria-expanded={changer} aria-controls={`${id}-changer`} onClick={() => setChanger((v) => !v)}>
          Changer de classe ou de date
        </button>
      </p>
      <div id={`${id}-changer`} className="mv-changer" hidden={!changer}>
        <label className="mv-champ">
          <span>Classe</span>
          <select value={classeId} onChange={(e) => choisirClasseOuDate(e.target.value, date)}>
            {classesTriees.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </label>
        <label className="mv-champ">
          <span>Date</span>
          <input type="date" value={date} max={dateIso(new Date())} onChange={(e) => choisirClasseOuDate(classeId, e.target.value)} />
        </label>
        <label className="mv-champ">
          <span>Heure</span>
          <select value={creneau ? creneauCle : ''} onChange={(e) => setCreneauCle(e.target.value)}>
            {creneauxClasse.map((c) => (
              <option key={`${c.heureDebut}-${c.heureFin}`} value={`${c.heureDebut}-${c.heureFin}`}>
                {libelleCreneau(c)}
              </option>
            ))}
            {creneau && !creneauxClasse.some((c) => `${c.heureDebut}-${c.heureFin}` === creneauCle) && <option value={creneauCle}>{libelleCreneau(creneau)}</option>}
            <option value="">Sans heure précise</option>
          </select>
        </label>
      </div>

      <div className="mv-boite">
        {proposition.etapes.length > 0 && (
          <fieldset className="mv-groupe">
            <legend>Points projetés</legend>
            {proposition.etapes.map((e) => {
              const partie = structure.find((s) => s.id === e.id)
              const toutes = partie ? (partie.sousParties.length > 0 ? partie.sousParties.map((p) => p.id) : [partie.id]) : [e.id]
              const cochees = toutes.filter((u) => unites.has(u))
              const partiel = enPartie(e)
              const montrerSous = partiel && partie !== undefined && partie.sousParties.length > 0
              return (
                <div key={e.id} className="mv-etape">
                  <label className="mv-case">
                    <input
                      type="checkbox"
                      checked={cochees.length === toutes.length}
                      ref={(el) => {
                        if (el) el.indeterminate = cochees.length > 0 && cochees.length < toutes.length
                      }}
                      onChange={(ev) => {
                        const cocher = ev.target.checked
                        setUnites((avant) => {
                          const s = new Set(avant)
                          const cible = cocher && partiel ? unitesProposees(e, partie) : toutes
                          toutes.forEach((u) => s.delete(u))
                          if (cocher) cible.forEach((u) => s.add(u))
                          return s
                        })
                      }}
                    />
                    <span className="mv-case-texte">
                      <span>
                        Point {e.numero} — <RichText text={partie?.titre ?? e.titre} />
                      </span>
                      <small>{partiel ? `${e.vues} diapo${e.vues > 1 ? 's' : ''} sur ${e.total} : vu en partie` : `${e.total} diapo${e.total > 1 ? 's' : ''} sur ${e.total} montrée${e.total > 1 ? 's' : ''}`}</small>
                    </span>
                  </label>
                  {montrerSous && (
                    <ul className="mv-sous" aria-label={`Parties du point ${e.numero}`}>
                      {partie!.sousParties.map((p) => (
                        <li key={p.id}>
                          <label className="mv-case mv-case--sous">
                            <input
                              type="checkbox"
                              checked={unites.has(p.id)}
                              onChange={(ev) =>
                                setUnites((avant) => {
                                  const s = new Set(avant)
                                  if (ev.target.checked) s.add(p.id)
                                  else s.delete(p.id)
                                  return s
                                })
                              }
                            />
                            <span className="mv-case-texte">
                              <RichText text={p.titre} />
                              {e.sousParties.includes(p.id) && <small>montrée</small>}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </fieldset>
        )}
        {gens.length > 0 && (
          <fieldset className="mv-groupe">
            <legend>Exercices ouverts pendant le cours</legend>
            {gens.map((g) => (
              <label key={g.id} className="mv-case">
                <input
                  type="checkbox"
                  checked={gensCoches.has(g.id)}
                  onChange={(ev) =>
                    setGensCoches((avant) => {
                      const s = new Set(avant)
                      if (ev.target.checked) s.add(g.id)
                      else s.delete(g.id)
                      return s
                    })
                  }
                />
                <span className="mv-case-texte">
                  <span>
                    {g.id}
                    {g.titre && (
                      <>
                        {' — '}
                        <RichText text={g.titre} />
                      </>
                    )}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <div className="mv-groupe mv-devoir">
          <label className="mv-case">
            <input type="checkbox" checked={devoirCoche} onChange={(e) => setDevoirCoche(e.target.checked)} aria-controls={`${id}-devoir`} />
            <span className="mv-case-texte">
              <span>Devoir pour la prochaine fois</span>
              <small>{prochain ? `facultatif · pour le ${dateCourteDevoir(prochain)} (prochain cours)` : 'facultatif'}</small>
            </span>
          </label>
          <div id={`${id}-devoir`} hidden={!devoirCoche} className="mv-devoir-champ">
            <label htmlFor={`${id}-devoir-texte`}>Consigne du devoir</label>
            <textarea id={`${id}-devoir-texte`} rows={2} value={devoir} onChange={(e) => setDevoir(e.target.value)} aria-describedby={`${id}-devoir-aide`} />
            <small id={`${id}-devoir-aide`}>Par exemple : finir {gens[0]?.id ?? 'l’exercice'} (3 exercices).</small>
          </div>
        </div>
      </div>

      {deja.seance ? (
        <p className="mv-note">Une séance sur ce chapitre est déjà notée pour ce cours : elle sera complétée (rien n’est retiré).</p>
      ) : deja.autre ? (
        <p className="mv-note">Une séance sur « {titreChapitre(deja.autre.niveau, deja.autre.chapitre)} » est déjà notée pour ce cours : celle-ci sera ajoutée à côté.</p>
      ) : null}
      {erreur && (
        <p className="mv-erreur" role="alert">
          {erreur}
        </p>
      )}
      <div className="mv-actions">
        <button type="button" className="mv-bouton principal" disabled={envoi || !classe} onClick={() => void enregistrer()}>
          <span aria-hidden="true">✓</span> {envoi ? 'Enregistrement…' : 'Enregistrer dans Mes classes'}
        </button>
        {enPlus}
        <span className="mv-espace" aria-hidden="true" />
        <button type="button" className="mv-bouton" disabled={envoi} onClick={onPlusTard}>
          {plusTardLibelle}
        </button>
        {onRienNoter && (
          <button type="button" className="mv-bouton" disabled={envoi} onClick={onRienNoter}>
            Ne rien noter
          </button>
        )}
      </div>
      <p className="mv-aide">Rien n’est écrit sans ton clic : décoche ce qui n’a pas été vu.</p>
    </div>
  )
}

function capitale(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Résumé d'une proposition gardée : « Suites, points 7 et 8 · 2 exercices ». */
export function resumeProposition(p: PropositionMatiere): string {
  const c = findChapter(p.niveau, p.chapitre)
  const titre = c ? titreCourtChapitre(c.slug, texteBrut(c.title)) : p.chapitre
  const nums = p.etapes.map((e) => e.numero)
  const etapes = nums.length === 0 ? '' : nums.length === 1 ? `, point ${nums[0]}` : `, points ${nums.slice(0, -1).join(', ')} et ${nums[nums.length - 1]}`
  const ex = p.generateurs.length ? ` · ${p.generateurs.length} exercice${p.generateurs.length > 1 ? 's' : ''}` : ''
  return `${titre}${etapes}${ex}`
}

/** Événement qui ouvre une proposition gardée dans la carte « Matière vue à noter » de la page (`detail` = id). */
const EVENEMENT_OUVRIR = 'mv:ouvrir-proposition'

/** Ouvre le formulaire prérempli d'une proposition gardée (bouton « Noter la matière vue » du tableau de bord). */
export function ouvrirProposition(id: string): void {
  window.dispatchEvent(new CustomEvent(EVENEMENT_OUVRIR, { detail: id }))
}

/** Propositions gardées pour plus tard, tenues à jour (autre onglet, « Plus tard », enregistrement). */
export function usePropositionsGardees(): PropositionMatiere[] {
  const [liste, setListe] = useState<PropositionMatiere[]>(() => lirePropositionsGardees())
  useEffect(() => {
    const maj = () => setListe(lirePropositionsGardees())
    window.addEventListener(EVENEMENT_PROPOSITIONS, maj)
    window.addEventListener('storage', maj)
    return () => {
      window.removeEventListener(EVENEMENT_PROPOSITIONS, maj)
      window.removeEventListener('storage', maj)
    }
  }, [])
  return liste
}

/**
 * Carte « Matière vue à noter » (« Aujourd'hui » de Mes classes, tableau de bord) : propositions gardées après
 * une projection (« Plus tard », ou projection fermée sans répondre). « Noter » ouvre le même formulaire dans
 * le panneau latéral ; « Oublier » la retire de ce navigateur (rien n'était écrit). Rien s'il n'y en a pas.
 */
export function MatiereANoter({ client, classes, onEnregistre }: { client: SupabaseClient | null; classes: { id: string; nom: string }[]; onEnregistre?: () => void }) {
  const liste = usePropositionsGardees()
  const titreId = useId()
  const [ouverte, setOuverte] = useState<PropositionMatiere | null>(null)
  const [donnees, setDonnees] = useState<DonneesMatiere | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Seulement les classes qui existent encore (une classe supprimée depuis : proposition ignorée).
  const visibles = liste.filter((p) => classes.some((c) => c.id === p.classeId) && findChapter(p.niveau, p.chapitre))

  useEffect(() => {
    const surOuvrir = (e: Event) => {
      const p = lirePropositionsGardees().find((x) => x.id === (e as CustomEvent<string>).detail)
      if (p) {
        setMessage(null)
        setOuverte(p)
      }
    }
    window.addEventListener(EVENEMENT_OUVRIR, surOuvrir)
    return () => window.removeEventListener(EVENEMENT_OUVRIR, surOuvrir)
  }, [])

  useEffect(() => {
    if (!ouverte || !client) return
    let vivant = true
    setDonnees(null)
    setErreur(null)
    chargerDonneesMatiere(client).then(
      (d) => vivant && (d ? setDonnees(d) : setErreur('Mes classes ne sont pas encore activées.')),
      (ex: unknown) => vivant && setErreur(messageErreur(ex)),
    )
    return () => {
      vivant = false
    }
  }, [ouverte, client])

  if (visibles.length === 0 && !message) return null
  return (
    <section className="mv-carte" aria-labelledby={`${titreId}-carte`}>
      <h2 id={`${titreId}-carte`}>Matière vue à noter</h2>
      {message && (
        <p className="mv-succes" role="status">
          {message}
        </p>
      )}
      {visibles.length > 0 && (
        <ul className="mv-carte-liste">
          {visibles.map((p) => {
            const nom = classes.find((c) => c.id === p.classeId)?.nom ?? ''
            return (
              <li key={p.id}>
                <div className="mv-carte-texte">
                  <strong>
                    {nom} · {dateJourLong(p.date)}, {numeroHeureTexte(p.creneau.heureDebut, p.creneau.heureFin)}
                  </strong>
                  <span>Projeté : {resumeProposition(p)}</span>
                </div>
                <div className="mv-carte-actions">
                  <button type="button" className="mv-bouton principal" onClick={() => setOuverte(p)} aria-label={`Noter la matière vue de la ${nom}, ${dateJourLong(p.date)}`}>
                    Noter
                  </button>
                  <button type="button" className="mv-bouton" onClick={() => retirerProposition(p.id)} aria-label={`Oublier la proposition de la ${nom}, ${dateJourLong(p.date)}`}>
                    Oublier
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {ouverte && client && (
        <PanneauLateral titreId={titreId} onFermer={() => setOuverte(null)}>
          <div className="mv-panneau">
            <div className="mv-panneau-fermer">
              <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={() => setOuverte(null)}>
                ×
              </button>
            </div>
            {erreur ? (
              <p className="mv-erreur" role="alert" id={titreId}>
                {erreur}
              </p>
            ) : !donnees ? (
              <p className="mv-quand" role="status" id={titreId}>
                Chargement de Mes classes…
              </p>
            ) : (
              <FormulaireMatiere
                proposition={ouverte}
                donnees={donnees}
                client={client}
                titreId={titreId}
                surtitre={`Projection du ${dateJourLong(ouverte.date)}`}
                onPlusTard={() => setOuverte(null)}
                onEnregistre={(r) => {
                  setOuverte(null)
                  setMessage(r.message)
                  onEnregistre?.()
                }}
              />
            )}
          </div>
        </PanneauLateral>
      )}
      {message && visibles.length === 0 && (
        <p className="mv-carte-pied">
          <Link className="mv-lien" to="/carnet">
            Voir Mes classes
          </Link>
        </p>
      )}
    </section>
  )
}
