import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageCompte, PageReservee } from '../components/compte/PageReservee'
import { Aujourdhui } from '../components/carnet/Aujourdhui'
import { CarteSeance } from '../components/carnet/CarteSeance'
import { EvaluationMatiere } from '../components/carnet/EvaluationMatiere'
import { FormulaireSeance } from '../components/carnet/FormulaireSeance'
import { GestionClasses } from '../components/carnet/GestionClasses'
import { MessageHoraireInactif, MonHoraire } from '../components/carnet/MonHoraire'
import { Planification } from '../components/carnet/Planification'
import { ProgressionClasse } from '../components/carnet/ProgressionClasse'
import { lireClasseMemorisee, memoriserClasse } from '../components/carnet/outilsCarnet'
import { findChapter, LEVELS } from '../content/chaptersIndex'
import { dateIso, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from '../lib/carnet'
import {
  ajouterClasse,
  ajouterSeance,
  chargerHoraire,
  definirCase,
  enregistrerGrille,
  enregistrerReglages,
  ErreurCarnet,
  lireReglages,
  listerClasses,
  listerSeances,
  modifierClasse,
  modifierSeance,
  supprimerClasse,
  supprimerGrille,
  supprimerSeance,
  type DonneesHoraire,
} from '../lib/carnetDonnees'
import { creneauPropose, creneauxDuJour, type Creneau } from '../lib/horaire'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { messageErreur } from '../lib/compteValidation'

const DUREES = [40, 45, 50, 55, 60, 90, 100, 110]

/** `/carnet` — carnet de matière vue (phase 2 des comptes) : classes, séances, progression,
 * évaluation sur la matière vue ; avec 0003, horaire de la semaine (vue « Aujourd'hui », séances
 * oubliées, heures restantes, séance pré-remplie sur le créneau en cours ou le plus proche).
 * `?chapitre=<niveau>/<chapitre>` (bouton « Carnet » d'une page de cours) ouvre une nouvelle séance
 * sur ce chapitre. */
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
  horaire: DonneesHoraire
}

type Formulaire = { mode: 'nouveau'; chapitre: string; creneau?: Creneau | null } | { mode: 'modifier'; seance: Seance }

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
  // Heure courante (créneau en cours, oubliées, heures restantes), rafraîchie chaque minute.
  const [maintenant, setMaintenant] = useState(() => new Date())
  // « Mon horaire » ouvert d'office tant que l'horaire n'est pas rempli (fixé au premier chargement).
  const [horaireOuvert, setHoraireOuvert] = useState(false)
  const horaireOuvertFixe = useRef(false)
  useEffect(() => {
    const t = window.setInterval(() => setMaintenant(new Date()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const charger = useCallback(async () => {
    if (!client) return
    try {
      // L'horaire (0003) d'abord : il dit si `seances.numero_heure_fin` existe.
      const [classes, r, horaire] = await Promise.all([listerClasses(client), lireReglages(client), chargerHoraire(client)])
      const seances = await listerSeances(client, horaire.actif)
      setDonnees({ classes, seances, reglages: r.reglages, reglagesExiste: r.existe, horaire })
      if (!horaireOuvertFixe.current) {
        horaireOuvertFixe.current = true
        setHoraireOuvert(horaire.actif && !horaire.grilles.some((g) => horaire.cases.some((c) => c.ecole_id === g.ecole_id)))
      }
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
    // Avec un horaire : le créneau en cours (ou le plus proche) d'aujourd'hui, de préférence d'une
    // classe du niveau du chapitre.
    const h = donnees.horaire
    const maintenantCourant = new Date()
    const creneaux = h.actif ? creneauxDuJour(dateIso(maintenantCourant), h.grilles, h.cases).creneaux : []
    const niveauDe = (classeIdCreneau: string) => donnees.classes.find((c) => c.id === classeIdCreneau)?.niveau
    const creneau = creneauPropose(creneaux, maintenantCourant.getHours() * 60 + maintenantCourant.getMinutes(), (c) => niveauDe(c.classe_id) === niveau)
    if (creneau) {
      setClasseId(creneau.classe_id)
      setFormulaire({ mode: 'nouveau', chapitre: `${niveau}/${slug}`, creneau })
      return
    }
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
  const horaire = donnees.horaire
  // Horaire utilisable par le formulaire : 0003 appliqué et au moins une grille.
  const horaireFormulaire = horaire.actif && horaire.grilles.length > 0 ? { grilles: horaire.grilles, cases: horaire.cases } : null
  const horaireRempli = horaire.actif && horaire.grilles.some((g) => horaire.cases.some((c) => c.ecole_id === g.ecole_id))

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
    const actif = donnees?.horaire.actif ?? false
    const ok = await agir(
      () => (f.mode === 'modifier' ? modifierSeance(client, f.seance.id, s, actif) : ajouterSeance(client, s, actif)),
      f.mode === 'modifier' ? 'Séance modifiée.' : 'Séance enregistrée.',
    )
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

  const prerempli =
    formulaire?.mode === 'nouveau'
      ? { classeId: formulaire.creneau?.classe_id ?? classe?.id ?? '', chapitre: formulaire.chapitre, creneau: formulaire.creneau ?? null }
      : { classeId: classe?.id ?? '', chapitre: '' }
  const ecoleClasse = classe ? (ecoles.find((e) => e.id === classe.ecole_id)?.nom ?? '') : ''
  const classeAvecGrille = classe ? horaire.grilles.some((g) => g.ecole_id === classe.ecole_id) : false

  /** Chapitre proposé pour une nouvelle séance d'une classe : celui de sa dernière séance, sinon le
   * premier de son niveau. */
  function chapitreParDefaut(id: string | undefined = classe?.id): string {
    const k = donnees?.classes.find((c) => c.id === id)
    const derniere = donnees?.seances.filter((s) => s.classe_id === id).sort((a, b) => (a.date_seance < b.date_seance ? 1 : a.date_seance > b.date_seance ? -1 : a.cree_le < b.cree_le ? 1 : -1))[0]
    if (derniere && findChapter(derniere.niveau, derniere.chapitre)) return `${derniere.niveau}/${derniere.chapitre}`
    const premier = k?.niveau ? LEVELS.find((l) => l.slug === k.niveau)?.chapters[0] : undefined
    return premier && k?.niveau ? `${k.niveau}/${premier.slug}` : ''
  }

  /** « Noter la séance » d'un créneau (vue Aujourd'hui, oubliées). */
  function noterCreneau(c: Creneau) {
    setClasseId(c.classe_id)
    memoriserClasse(c.classe_id)
    setVue('seances')
    setFormulaire({ mode: 'nouveau', chapitre: chapitreParDefaut(c.classe_id), creneau: c })
  }

  function voirSeance(s: Seance) {
    setClasseId(s.classe_id)
    memoriserClasse(s.classe_id)
    setVue('seances')
    setFormulaire({ mode: 'modifier', seance: s })
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
          {horaireRempli && (
            <Aujourdhui
              grilles={horaire.grilles}
              cases={horaire.cases}
              seances={donnees.seances}
              classes={donnees.classes}
              ecoles={ecoles}
              maintenant={maintenant}
              onNoter={noterCreneau}
              onVoir={voirSeance}
            />
          )}
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
                    key={
                      formulaire.mode === 'modifier'
                        ? formulaire.seance.id
                        : `nouveau-${formulaire.chapitre}-${classe.id}-${formulaire.creneau ? `${formulaire.creneau.date}-${formulaire.creneau.ecole_id}-${formulaire.creneau.heureDebut}` : ''}`
                    }
                    classes={donnees.classes}
                    seances={donnees.seances}
                    reglages={reglages}
                    initiale={formulaire.mode === 'modifier' ? formulaire.seance : null}
                    prerempli={prerempli}
                    horaire={horaireFormulaire}
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
                        avecGrille={classeAvecGrille}
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

      {ecoles.length > 0 && donnees.classes.length > 0 && (
        <section className="compte-section" aria-labelledby="carnet-horaire">
          <h2 id="carnet-horaire">Mon horaire</h2>
          {!horaire.actif ? (
            <MessageHoraireInactif />
          ) : (
            <details className="carnet-details carnet-horaire-details" open={horaireOuvert} onToggle={(e) => setHoraireOuvert(e.currentTarget.open)}>
              <summary>{horaireRempli ? "Grille de l'école et horaire de la semaine" : 'Remplir mon horaire'}</summary>
              {!horaireRempli && (
                <p className="compte-intro">
                  Remplis ton horaire de la semaine : le carnet te proposera alors la séance du créneau en cours, te rappellera les séances oubliées et comptera les heures restantes
                  avec chaque classe (congés de la Fédération Wallonie-Bruxelles exclus).
                </p>
              )}
              {client && (
                <MonHoraire
                  horaire={horaire}
                  ecoles={ecoles}
                  classes={donnees.classes}
                  occupe={occupe}
                  onEnregistrerGrille={(ecoleId, g, existe, hors) => agir(() => enregistrerGrille(client, ecoleId, g, existe, hors), 'Grille horaire enregistrée.')}
                  onSupprimerGrille={(ecoleId) => void agir(() => supprimerGrille(client, ecoleId), 'Grille et horaire de cette école retirés.')}
                  onDefinirCase={(existante, saisie) => agir(() => definirCase(client, existante, saisie), 'Horaire enregistré.')}
                />
              )}
            </details>
          )}
        </section>
      )}

      {horaireRempli && <Planification grilles={horaire.grilles} cases={horaire.cases} classes={donnees.classes} maintenant={maintenant} />}

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
          <p className="compte-aide">
            Mémorisé dans ton compte. Les séances déjà notées gardent leurs deux écritures quand elles les ont. Avec une grille horaire, les séances notées depuis l'horaire
            affichent le numéro et la plage ensemble : « H2 (09h35 → 10h25) ».
          </p>
        </fieldset>
      </section>
    </div>
  )
}

