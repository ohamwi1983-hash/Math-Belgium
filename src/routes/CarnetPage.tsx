import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageCompte, PageReservee } from '../components/compte/PageReservee'
import { CarteSeance } from '../components/carnet/CarteSeance'
import { EvaluationMatiere } from '../components/carnet/EvaluationMatiere'
import { FormulaireSeance } from '../components/carnet/FormulaireSeance'
import { GestionClasses } from '../components/carnet/GestionClasses'
import { ProgressionClasse } from '../components/carnet/ProgressionClasse'
import { lireClasseMemorisee, memoriserClasse } from '../components/carnet/outilsCarnet'
import { findChapter, LEVELS } from '../content/chaptersIndex'
import { type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from '../lib/carnet'
import {
  ajouterClasse,
  ajouterSeance,
  enregistrerReglages,
  ErreurCarnet,
  lireReglages,
  listerClasses,
  listerSeances,
  modifierClasse,
  modifierSeance,
  supprimerClasse,
  supprimerSeance,
} from '../lib/carnetDonnees'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { messageErreur } from '../lib/compteValidation'

const DUREES = [40, 45, 50, 55, 60, 90, 100, 110]

/** `/carnet` — carnet de matière vue (phase 2 des comptes) : classes, séances, progression,
 * évaluation sur la matière vue. `?chapitre=<niveau>/<chapitre>` (bouton « Noter dans le carnet »
 * d'une page de cours) ouvre une nouvelle séance sur ce chapitre. */
export function CarnetPage() {
  return (
    <PageCompte titre="Carnet de matière vue">
      <PageReservee>
        <Carnet />
      </PageReservee>
    </PageCompte>
  )
}

interface Donnees {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  reglagesExiste: boolean
}

type Formulaire = { mode: 'nouveau'; chapitre: string } | { mode: 'modifier'; seance: Seance }

function MessageCarnetInactif() {
  return (
    <div className="compte-encadre" role="status">
      <p>
        <strong>Carnet pas encore activé.</strong>
      </p>
      <p>
        Colle le fichier <code>supabase/migrations/0002_carnet.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → New query → coller → Run), puis recharge cette page. Le reste du
        site fonctionne normalement en attendant.
      </p>
    </div>
  )
}

function Carnet() {
  const compte = useCompte()
  const client = compte.client
  const [params, setParams] = useSearchParams()
  const [donnees, setDonnees] = useState<Donnees | null>(null)
  const [absent, setAbsent] = useState(false)
  const [erreurChargement, setErreurChargement] = useState<string | null>(null)
  const [classeId, setClasseId] = useState<string | null>(null)
  const [vue, setVue] = useState<'seances' | 'progression'>('seances')
  const [formulaire, setFormulaire] = useState<Formulaire | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const zoneFormulaire = useRef<HTMLDivElement>(null)

  const charger = useCallback(async () => {
    if (!client) return
    try {
      const [classes, seances, r] = await Promise.all([listerClasses(client), listerSeances(client), lireReglages(client)])
      setDonnees({ classes, seances, reglages: r.reglages, reglagesExiste: r.existe })
      setAbsent(false)
      setErreurChargement(null)
    } catch (ex) {
      if (ex instanceof ErreurCarnet && ex.tableAbsente) setAbsent(true)
      else setErreurChargement(messageErreur(ex))
    }
  }, [client])

  useEffect(() => {
    void charger()
  }, [charger])

  // Classe active : celle de l'URL d'un chapitre (même niveau), sinon la dernière utilisée, sinon la première.
  const classes = donnees?.classes
  useEffect(() => {
    if (!classes || classes.length === 0) return
    if (classeId && classes.some((c) => c.id === classeId)) return
    const memorisee = lireClasseMemorisee()
    setClasseId(classes.find((c) => c.id === memorisee)?.id ?? classes[0].id)
  }, [classes, classeId])

  // « Noter dans le carnet » depuis une page de cours : `?chapitre=niveau/chapitre`.
  const chapitreDemande = params.get('chapitre')
  useEffect(() => {
    if (!donnees || !chapitreDemande) return
    const [niveau, slug] = chapitreDemande.split('/')
    const suivant = new URLSearchParams(params)
    suivant.delete('chapitre')
    setParams(suivant, { replace: true })
    if (!niveau || !slug || !findChapter(niveau, slug) || donnees.classes.length === 0) return
    const memeNiveau = donnees.classes.filter((c) => c.niveau === niveau)
    if (memeNiveau.length > 0 && !memeNiveau.some((c) => c.id === classeId)) setClasseId(memeNiveau[0].id)
    setFormulaire({ mode: 'nouveau', chapitre: `${niveau}/${slug}` })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, dès que les données sont là
  }, [donnees !== null, chapitreDemande])

  useEffect(() => {
    if (formulaire) requestAnimationFrame(() => zoneFormulaire.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [formulaire])

  const classe = donnees?.classes.find((c) => c.id === classeId) ?? null
  const seancesClasse = useMemo(
    () => (donnees && classe ? donnees.seances.filter((s) => s.classe_id === classe.id).sort((a, b) => (a.date_seance < b.date_seance ? 1 : a.date_seance > b.date_seance ? -1 : a.cree_le < b.cree_le ? 1 : -1)) : []),
    [donnees, classe],
  )
  const autresClasses = useMemo(
    () => (donnees && classe?.niveau ? donnees.classes.filter((c) => c.id !== classe.id && c.niveau === classe.niveau).map((c) => ({ classe: c, seances: donnees.seances.filter((s) => s.classe_id === c.id) })) : []),
    [donnees, classe],
  )

  if (!estConnecteActif(compte) || !client) return null
  if (absent) return <MessageCarnetInactif />
  if (erreurChargement) {
    return (
      <div className="compte-encadre compte-erreur" role="alert">
        <p>{erreurChargement}</p>
        <button type="button" className="compte-bouton-secondaire" onClick={() => void charger()}>
          Réessayer
        </button>
      </div>
    )
  }
  if (!donnees) return <p className="compte-chargement">Chargement du carnet…</p>

  const { profil, ecoles } = compte
  const reglages = donnees.reglages

  async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      await action()
      await charger()
      setMessage(succes)
      return true
    } catch (ex) {
      if (ex instanceof ErreurCarnet && ex.tableAbsente) setAbsent(true)
      setErreur(messageErreur(ex))
      return false
    } finally {
      setOccupe(false)
    }
  }

  function choisirClasse(id: string) {
    setClasseId(id)
    memoriserClasse(id)
    setFormulaire(null)
  }

  async function enregistrerSeance(s: SaisieSeance) {
    const f = formulaire
    if (!f || !client) return
    const ok = await agir(() => (f.mode === 'modifier' ? modifierSeance(client, f.seance.id, s) : ajouterSeance(client, s)), f.mode === 'modifier' ? 'Séance modifiée.' : 'Séance enregistrée.')
    if (ok) {
      setFormulaire(null)
      if (s.classe_id !== classeId) choisirClasse(s.classe_id)
      setVue('seances')
    }
  }

  async function changerReglages(r: ReglagesCarnet) {
    if (!client || !profil || !donnees) return
    const existe = donnees.reglagesExiste
    setDonnees({ ...donnees, reglages: r }) // affiché tout de suite ; relu après l'enregistrement
    await agir(() => enregistrerReglages(client, r, existe, profil.id), 'Réglage enregistré.')
  }

  const prerempli = formulaire?.mode === 'nouveau' ? { classeId: classe?.id ?? '', chapitre: formulaire.chapitre } : { classeId: classe?.id ?? '', chapitre: '' }
  const ecoleClasse = classe ? (ecoles.find((e) => e.id === classe.ecole_id)?.nom ?? '') : ''

  function chapitreParDefaut(): string {
    const derniere = seancesClasse[0]
    if (derniere && findChapter(derniere.niveau, derniere.chapitre)) return `${derniere.niveau}/${derniere.chapitre}`
    const premier = classe?.niveau ? LEVELS.find((l) => l.slug === classe.niveau)?.chapters[0] : undefined
    return premier && classe?.niveau ? `${classe.niveau}/${premier.slug}` : ''
  }

  return (
    <div className="compte-sections carnet">
      <p className="compte-intro">
        Note ce qui a été vu dans chaque classe : sections et sous-parties du cours, exercices, devoir. Copie le résumé pour Smartschool, imprime une fiche, suis la progression et crée une
        évaluation sur la matière vue. Aucune donnée d'élève n'est enregistrée.
      </p>
      {(message || erreur) && (
        <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
          {erreur ?? message}
        </p>
      )}

      {ecoles.length === 0 ? (
        <div className="compte-encadre" role="status">
          <p>
            <strong>Ajoute d'abord ton école.</strong> Chaque classe est rattachée à une de tes écoles : ajoute-la dans <Link to="/profil">ton profil</Link> (nom et adresse), puis
            reviens ici.
          </p>
        </div>
      ) : donnees.classes.length === 0 ? (
        <section className="compte-section" aria-labelledby="carnet-classes">
          <h2 id="carnet-classes">Mes classes</h2>
          <p className="compte-vide">Aucune classe pour l'instant : ajoute la première (par exemple « 5e B »).</p>
          <GestionClasses
            classes={[]}
            ecoles={ecoles}
            nombreSeances={() => 0}
            occupe={occupe}
            onAjouter={(s) => agir(() => ajouterClasse(client, s), `Classe « ${s.nom.trim()} » ajoutée.`)}
            onModifier={async () => false}
            onSupprimer={() => undefined}
          />
        </section>
      ) : (
        <>
          <section className="compte-section" aria-labelledby="carnet-classes">
            <h2 id="carnet-classes">Mes classes</h2>
            <div className="carnet-onglets-classes" role="tablist" aria-label="Classe">
              {donnees.classes.map((c) => (
                <button key={c.id} type="button" role="tab" aria-selected={c.id === classe?.id} className="carnet-puce" onClick={() => choisirClasse(c.id)}>
                  {c.nom}
                  {ecoles.length > 1 && <span className="carnet-puce-ecole">{ecoles.find((e) => e.id === c.ecole_id)?.nom}</span>}
                </button>
              ))}
            </div>
            <details className="carnet-details">
              <summary>Gérer mes classes</summary>
              <GestionClasses
                classes={donnees.classes}
                ecoles={ecoles}
                nombreSeances={(id) => donnees.seances.filter((s) => s.classe_id === id).length}
                occupe={occupe}
                onAjouter={(s) => agir(() => ajouterClasse(client, s), `Classe « ${s.nom.trim()} » ajoutée.`)}
                onModifier={(id, s) => agir(() => modifierClasse(client, id, s), 'Classe modifiée.')}
                onSupprimer={(c) => {
                  const n = donnees.seances.filter((s) => s.classe_id === c.id).length
                  if (window.confirm(`Supprimer la classe « ${c.nom} »${n > 0 ? ` et ses ${n} séance${n > 1 ? 's' : ''}` : ''} ? Cette action est irréversible.`))
                    void agir(() => supprimerClasse(client, c.id), 'Classe supprimée.')
                }}
              />
            </details>
          </section>

          {classe && (
            <section className="compte-section" aria-labelledby="carnet-classe-active">
              <div className="carnet-entete-classe">
                <h2 id="carnet-classe-active">
                  {classe.nom} <span className="compte-compte">({seancesClasse.length} séance{seancesClasse.length > 1 ? 's' : ''})</span>
                </h2>
                {!formulaire && (
                  <button type="button" className="compte-bouton" onClick={() => setFormulaire({ mode: 'nouveau', chapitre: chapitreParDefaut() })}>
                    Nouvelle séance
                  </button>
                )}
              </div>

              <div ref={zoneFormulaire}>
                {formulaire && (
                  <FormulaireSeance
                    key={formulaire.mode === 'modifier' ? formulaire.seance.id : `nouveau-${formulaire.chapitre}-${classe.id}`}
                    classes={donnees.classes}
                    seances={donnees.seances}
                    reglages={reglages}
                    initiale={formulaire.mode === 'modifier' ? formulaire.seance : null}
                    prerempli={prerempli}
                    occupe={occupe}
                    onEnregistrer={(s) => void enregistrerSeance(s)}
                    onAnnuler={() => setFormulaire(null)}
                  />
                )}
              </div>

              <div className="carnet-vues" role="tablist" aria-label="Affichage">
                <button type="button" role="tab" aria-selected={vue === 'seances'} className="carnet-puce" onClick={() => setVue('seances')}>
                  Séances
                </button>
                <button type="button" role="tab" aria-selected={vue === 'progression'} className="carnet-puce" onClick={() => setVue('progression')}>
                  Progression
                </button>
              </div>

              {vue === 'seances' ? (
                seancesClasse.length === 0 ? (
                  <p className="compte-vide">Aucune séance notée pour {classe.nom}.</p>
                ) : (
                  <ul className="carnet-seances">
                    {seancesClasse.map((s) => (
                      <CarteSeance
                        key={s.id}
                        seance={s}
                        classe={classe}
                        format={reglages.format_horaire}
                        ecole={ecoleClasse}
                        professeur={profil.nom_affiche}
                        occupe={occupe}
                        onModifier={() => setFormulaire({ mode: 'modifier', seance: s })}
                        onSupprimer={() => {
                          if (window.confirm('Supprimer cette séance du carnet ?')) void agir(() => supprimerSeance(client, s.id), 'Séance supprimée.')
                        }}
                      />
                    ))}
                  </ul>
                )
              ) : (
                <ProgressionClasse classe={classe} seances={seancesClasse} autres={autresClasses} />
              )}

              {seancesClasse.length > 0 && <EvaluationMatiere key={classe.id} classe={classe} seances={seancesClasse} />}
            </section>
          )}
        </>
      )}

      <section className="compte-section" aria-labelledby="carnet-reglages">
        <h2 id="carnet-reglages">Réglages</h2>
        <fieldset className="carnet-fieldset">
          <legend>Horaire des séances</legend>
          <label className="carnet-case">
            <input type="radio" name="format-horaire" checked={reglages.format_horaire === 'plage'} disabled={occupe} onChange={() => void changerReglages({ ...reglages, format_horaire: 'plage' })} />
            <span>Plage horaire (08h50 → 09h40)</span>
          </label>
          <label className="carnet-case">
            <input type="radio" name="format-horaire" checked={reglages.format_horaire === 'numero'} disabled={occupe} onChange={() => void changerReglages({ ...reglages, format_horaire: 'numero' })} />
            <span>Numéro d'heure (3e heure)</span>
          </label>
          {reglages.format_horaire === 'plage' && (
            <div className="compte-champ carnet-champ-court">
              <label htmlFor="carnet-duree">Durée d'une heure de cours</label>
              <select id="carnet-duree" value={String(reglages.duree_heure)} disabled={occupe} onChange={(e) => void changerReglages({ ...reglages, duree_heure: Number(e.target.value) })}>
                {[...new Set([...DUREES, reglages.duree_heure])].sort((a, b) => a - b).map((d) => (
                  <option key={d} value={String(d)}>
                    {d} min
                  </option>
                ))}
              </select>
            </div>
          )}
          <p className="compte-aide">Mémorisé dans ton compte. Les séances déjà notées gardent leurs deux écritures quand elles les ont.</p>
        </fieldset>
      </section>
    </div>
  )
}

