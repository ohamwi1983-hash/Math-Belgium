import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { IconeCarnet, MenuEspace } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import { AgendaPeriode } from '../components/carnet/AgendaPeriode'
import { Aujourdhui } from '../components/carnet/Aujourdhui'
import { CarteSeance } from '../components/carnet/CarteSeance'
import { CarnetContexte, avecGrille, resoudre, type ContexteCarnet } from '../components/carnet/contexteCarnet'
import { FormulaireSeance } from '../components/carnet/FormulaireSeance'
import { GestionClasses, type SaisieClasse } from '../components/carnet/GestionClasses'
import { MaSemaine } from '../components/carnet/MaSemaine'
import { MessageHoraireInactif, MonHoraire } from '../components/carnet/MonHoraire'
import { PageClasse } from '../components/carnet/PageClasse'
import { PanneauLateral } from '../components/carnet/PanneauLateral'
import { chapitreParDefaut, copierTexte, lireClasseMemorisee, memoriserClasse, texteReperes } from '../components/carnet/outilsCarnet'
import '../components/carnet/carnet.css'
import '../components/compte/profil.css'
import { findChapter } from '../content/chaptersIndex'
import { dateIso, dateLongue, htmlSmartschool, texteSmartschool, type Classe, type ReglagesCarnet, type SaisieSeance, type Seance } from '../lib/carnet'
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
import { creneauPropose, creneauxDuJour, seanceDuCreneau, type Creneau } from '../lib/horaire'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { messageErreur } from '../lib/compteValidation'

const DUREES = [40, 45, 50, 55, 60, 90, 100, 110]

/** `/carnet/*` — carnet de matière vue (phase 2 des comptes), réservé aux professeurs connectés.
 * Bandeau sombre (« ESPACE PROFESSEUR », période et semaine, créneaux à noter, classes) et menu
 * unique « Mon espace » (`MenuEspace`, où « Carnet de matière vue » se déplie ; gauche sur
 * ordinateur, barre du bas sur téléphone), qui mène à : « Aujourd'hui » (accueil,
 * `/carnet`), « Ma semaine » (`/carnet/semaine`), une page par classe (`/carnet/classe/:id`), la
 * gestion des classes (`/carnet/classes`), l'agenda d'une période (`/carnet/agenda`, `?classe=`),
 * « Mon horaire » (`/carnet/horaire`) et les réglages (`/carnet/reglages`). « Noter une séance »
 * s'ouvre partout dans le même panneau latéral, sans quitter la page. `?chapitre=<niveau>/<chapitre>`
 * (bouton « Carnet » d'une page de cours) ouvre ce panneau sur ce chapitre. Aucune de ces adresses
 * n'est pré-rendue (`scripts/routes.mjs` ne liste que l'accueil et les chapitres). */
export function CarnetPage() {
  return (
    <PageCompte titre="Carnet de matière vue" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Carnet />
      </PageReservee>
    </PageCompte>
  )
}

/** Titre habituel tant que la page n'est pas prête (le bandeau porte le `<h1>`). */
function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Carnet de matière vue" />
}

interface Donnees {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  reglagesExiste: boolean
  horaire: DonneesHoraire
}

type Panneau =
  | { type: 'noter'; classeId: string; chapitre: string; creneau: Creneau | null; date?: string; chapitreChoisi?: boolean }
  | { type: 'modifier'; seance: Seance }
  | { type: 'voir'; seanceId: string }

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
  const [panneau, setPanneau] = useState<Panneau | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [texteACopier, setTexteACopier] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [classeActive, setClasseActive] = useState<string | null>(() => lireClasseMemorisee())
  // Heure courante (créneau en cours, oubliées, heures restantes), rafraîchie chaque minute.
  const [maintenant, setMaintenant] = useState(() => new Date())
  const titrePanneau = useId()
  const idBandeau = useId()
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
    const memeNiveau = donnees.classes.filter((c) => c.niveau === niveau)
    const classeId = creneau?.classe_id ?? (memeNiveau.some((c) => c.id === classeActive) ? classeActive : (memeNiveau[0]?.id ?? classeActive ?? donnees.classes[0].id))
    setPanneau({ type: 'noter', classeId: classeId ?? '', chapitre: `${niveau}/${slug}`, creneau: creneau ?? null, chapitreChoisi: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- une fois, dès que les données sont là
  }, [donnees !== null, chapitreDemande])

  const ecoles = compte.ecoles
  const profil = compte.profil
  const seances = donnees?.seances
  const contexte = useMemo<ContexteCarnet | null>(() => {
    if (!donnees || !profil) return null
    return {
      classes: donnees.classes,
      ecoles,
      grilles: donnees.horaire.actif ? donnees.horaire.grilles : [],
      format: donnees.reglages.format_horaire,
      professeur: profil.nom_affiche,
      occupe,
      voir: (s) => setPanneau({ type: 'voir', seanceId: s.id }),
      modifier: (s) => setPanneau({ type: 'modifier', seance: s }),
      supprimer: (s) => {
        if (window.confirm('Supprimer cette séance du carnet ?')) void agir(() => supprimerSeance(client!, s.id), 'Séance supprimée.').then((ok) => ok && setPanneau(null))
      },
    }
  }, [donnees, ecoles, profil, occupe, client])

  // Nombre de créneaux d'aujourd'hui passés ou en cours sans séance (« 2 à noter » du menu).
  const aNoter = useMemo(() => {
    if (!donnees || !donnees.horaire.actif || !seances) return 0
    const d = dateIso(maintenant)
    const m = maintenant.getHours() * 60 + maintenant.getMinutes()
    return creneauxDuJour(d, donnees.horaire.grilles, donnees.horaire.cases).creneaux.filter((c) => c.debut <= m && !seanceDuCreneau(c, seances)).length
  }, [donnees, seances, maintenant])

  /** Menu « Mon espace » (carnet déplié) + bandeau sombre autour de chaque état de la page. */
  function cadre(contenu: ReactNode) {
    const classes = donnees?.classes
    const reperes = texteReperes(dateIso(maintenant))
    return (
      <div className="carnet">
        <MenuEspace carnet={donnees ? { classes: donnees.classes, nombreSeances: (k) => donnees.seances.filter((s) => s.classe_id === k).length, aNoter } : undefined}>
          <BandeauEspace
            titreId={`${idBandeau}-titre`}
            titre="Carnet de matière vue"
            classe="espace-bandeau-carnet"
            classeIcone="espace-bandeau-icone"
            icone={<IconeCarnet mode="bandeau" />}
            etiquettePastilles="En bref"
            pastilles={[
              reperes ? (
                <li key="reperes" className="profil-bandeau-ecole">
                  {reperes}
                </li>
              ) : null,
              aNoter > 0 ? (
                <li key="a-noter" className="profil-bandeau-ecole espace-bandeau-pastille-forte">
                  {aNoter} à noter<span className="carnet-sr"> aujourd'hui</span>
                </li>
              ) : null,
              classes && classes.length > 0 ? (
                <li key="classes" className="profil-bandeau-ecole">
                  {classes.length} classe{classes.length > 1 ? 's' : ''}
                </li>
              ) : null,
            ]}
          />
          {contenu}
        </MenuEspace>
      </div>
    )
  }

  async function agir(action: () => Promise<unknown>, succes: string): Promise<boolean> {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    setTexteACopier(null)
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

  if (!estConnecteActif(compte) || !client || !profil) return null
  if (absent) return cadre(<MessageCarnetInactif />)
  if (erreurChargement) {
    return cadre(
      <div className="compte-encadre compte-erreur" role="alert">
        <p>{erreurChargement}</p>
        <button type="button" className="compte-bouton-secondaire" onClick={() => void charger()}>
          Réessayer
        </button>
      </div>,
    )
  }
  if (!donnees || !contexte) return cadre(<p className="compte-chargement">Chargement du carnet…</p>)

  const reglages = donnees.reglages
  const horaire = donnees.horaire
  // Horaire utilisable par le formulaire : 0003 appliqué et au moins une grille.
  const horaireFormulaire = horaire.actif && horaire.grilles.length > 0 ? { grilles: horaire.grilles, cases: horaire.cases } : null
  const horaireRempli = horaire.actif && horaire.grilles.some((g) => horaire.cases.some((c) => c.ecole_id === g.ecole_id))
  const grilles = horaire.actif ? horaire.grilles : []
  const classeMemo = donnees.classes.find((c) => c.id === classeActive)?.id ?? donnees.classes[0]?.id ?? null

  function choisirClasse(id: string) {
    setClasseActive(id)
    memoriserClasse(id)
  }

  /** « Noter la séance » d'un créneau (Aujourd'hui, Ma semaine, à rattraper). */
  function noterCreneau(c: Creneau) {
    choisirClasse(c.classe_id)
    setPanneau({ type: 'noter', classeId: c.classe_id, chapitre: chapitreParDefaut(c.classe_id, donnees!.classes, donnees!.seances), creneau: c })
  }

  /** « Noter une séance » sans créneau (page d'une classe, autre séance du jour). */
  function noterLibre(classeId?: string, date?: string) {
    const id = classeId ?? classeMemo ?? ''
    setPanneau({ type: 'noter', classeId: id, chapitre: chapitreParDefaut(id, donnees!.classes, donnees!.seances), creneau: null, date })
  }

  function apercu(s: SaisieSeance): string {
    const classe = donnees!.classes.find((c) => c.id === s.classe_id)
    if (!classe) return ''
    return texteSmartschool(resoudre(contexte!, { ...s, id: '', cree_le: '', modifie_le: '' }, classe))
  }

  async function enregistrerSeance(s: SaisieSeance, copier: boolean) {
    const p = panneau
    if (!p || p.type === 'voir' || !client) return
    const actif = horaire.actif
    // Copie lancée AVANT l'enregistrement (geste de l'utilisateur encore valable pour le
    // presse-papiers) ; même texte que la copie d'une séance enregistrée.
    const classe = donnees!.classes.find((c) => c.id === s.classe_id)
    const r = classe ? resoudre(contexte!, { ...s, id: '', cree_le: '', modifie_le: '' }, classe) : null
    const copie = copier && r ? copierTexte(texteSmartschool(r), htmlSmartschool(r)) : null
    const ok = await agir(
      () => (p.type === 'modifier' ? modifierSeance(client, p.seance.id, s, actif) : ajouterSeance(client, s, actif)),
      p.type === 'modifier' ? 'Séance modifiée.' : 'Séance enregistrée.',
    )
    if (!ok) return
    setPanneau(null)
    choisirClasse(s.classe_id)
    if (copie && r) {
      if (await copie) setMessage(`${p.type === 'modifier' ? 'Séance modifiée' : 'Séance enregistrée'} et copiée : colle-la dans Smartschool (journal de classe ou message).`)
      else {
        setMessage(`${p.type === 'modifier' ? 'Séance modifiée' : 'Séance enregistrée'}. Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.`)
        setTexteACopier(texteSmartschool(r))
      }
    }
  }

  async function changerReglages(r: ReglagesCarnet) {
    if (!client || !profil || !donnees) return
    const existe = donnees.reglagesExiste
    setDonnees({ ...donnees, reglages: r }) // affiché tout de suite ; relu après l'enregistrement
    await agir(() => enregistrerReglages(client, r, existe, profil.id), 'Réglage enregistré.')
  }

  const gestionClasses = (
    <GestionClasses
      classes={donnees.classes}
      ecoles={ecoles}
      nombreSeances={(id) => donnees.seances.filter((s) => s.classe_id === id).length}
      occupe={occupe}
      onAjouter={(s) => agir(() => ajouterClasse(client, s), `Classe « ${s.nom.trim()} » ajoutée.`)}
      onModifier={(id, s) => agir(() => modifierClasse(client, id, s), 'Classe modifiée.')}
      onSupprimer={supprimerUneClasse}
    />
  )

  function supprimerUneClasse(c: Classe) {
    const n = donnees!.seances.filter((s) => s.classe_id === c.id).length
    if (window.confirm(`Supprimer la classe « ${c.nom} »${n > 0 ? ` et ses ${n} séance${n > 1 ? 's' : ''}` : ''} ? Cette action est irréversible.`)) void agir(() => supprimerClasse(client!, c.id), 'Classe supprimée.')
  }

  const reglagesSection = (
    <section className="compte-section carnet-page-simple" aria-labelledby="carnet-reglages">
      <h2 id="carnet-reglages" className="carnet-titre-vue">
        Réglages
      </h2>
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
  )

  const messages = (message || erreur) && (
    <div className="carnet-messages">
      <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
        {erreur ?? message}
      </p>
      {texteACopier !== null && <textarea className="carnet-texte-copie" readOnly rows={8} value={texteACopier} onFocus={(e) => e.currentTarget.select()} aria-label="Texte pour Smartschool" />}
    </div>
  )

  // Sans école : rien n'est possible avant d'en ajouter une dans le profil.
  if (ecoles.length === 0) {
    return cadre(
      <div className="compte-sections">
        {messages}
        <div className="compte-encadre" role="status">
          <p>
            <strong>Ajoute d'abord ton école.</strong> Chaque classe est rattachée à une de tes écoles : ajoute-la dans <Link to="/profil">ton profil</Link> (nom et adresse), puis
            reviens ici.
          </p>
        </div>
        {reglagesSection}
      </div>,
    )
  }

  const sansClasse = (
    <section className="compte-section carnet-page-simple" aria-labelledby="carnet-premiere-classe">
      <h2 id="carnet-premiere-classe" className="carnet-titre-vue">
        Mes classes
      </h2>
      <p className="compte-intro">
        Note ce qui a été vu dans chaque classe : sections et sous-parties du cours, exercices, devoir. Copie le résumé pour Smartschool, imprime une fiche ou l'agenda complet d'une
        période, suis la progression et crée une évaluation sur la matière vue. Aucune donnée d'élève n'est enregistrée.
      </p>
      <p className="compte-vide">Aucune classe pour l'instant : ajoute la première (par exemple « 5e B »).</p>
      {gestionClasses}
    </section>
  )
  const avecClasses = (vue: ReactNode) => (donnees.classes.length === 0 ? sansClasse : vue)

  const seanceVue = panneau?.type === 'voir' ? donnees.seances.find((s) => s.id === panneau.seanceId) : undefined

  return (
    <CarnetContexte.Provider value={contexte}>
      {cadre(
        <>
          {messages}
          <Routes>
            <Route
              index
              element={avecClasses(
                <Aujourdhui
                  grilles={grilles}
                  cases={horaire.actif ? horaire.cases : []}
                  seances={donnees.seances}
                  horaireActif={horaire.actif}
                  classeActive={classeMemo}
                  maintenant={maintenant}
                  onNoter={noterCreneau}
                  onNoterLibre={noterLibre}
                />,
              )}
            />
            <Route
              path="semaine"
              element={avecClasses(
                <MaSemaine
                  grilles={grilles}
                  cases={horaire.actif ? horaire.cases : []}
                  seances={donnees.seances}
                  horaireActif={horaire.actif}
                  maintenant={maintenant}
                  dureeHeure={reglages.duree_heure}
                  onNoter={noterCreneau}
                />,
              )}
            />
            <Route
              path="classe/:id"
              element={
                <RouteClasse
                  classes={donnees.classes}
                  rendu={(classe) => (
                    <PageClasse
                      classe={classe}
                      seances={donnees.seances}
                      cases={horaire.actif ? horaire.cases : []}
                      maintenant={maintenant}
                      onNoter={(id) => noterLibre(id)}
                      onModifierClasse={(id, s: SaisieClasse) => agir(() => modifierClasse(client, id, s), 'Classe modifiée.')}
                      onSupprimerClasse={supprimerUneClasse}
                    />
                  )}
                  onVue={choisirClasse}
                />
              }
            />
            <Route
              path="classes"
              element={
                donnees.classes.length === 0 ? (
                  sansClasse
                ) : (
                  <section className="compte-section carnet-page-simple" aria-labelledby="carnet-classes">
                    <h2 id="carnet-classes" className="carnet-titre-vue">
                      Mes classes
                    </h2>
                    {gestionClasses}
                  </section>
                )
              }
            />
            <Route
              path="agenda"
              element={avecClasses(
                <RouteAgenda>
                  {(classeParam) => (
                    <AgendaPeriode
                      key={classeParam ?? ''}
                      classes={donnees.classes}
                      seances={donnees.seances}
                      ecoles={ecoles}
                      grilles={grilles}
                      format={reglages.format_horaire}
                      dureeHeure={reglages.duree_heure}
                      professeur={profil.nom_affiche}
                      classeActive={classeParam ?? classeMemo}
                      maintenant={maintenant}
                    />
                  )}
                </RouteAgenda>,
              )}
            />
            <Route
              path="horaire"
              element={
                <section className="compte-section carnet-page-simple" aria-labelledby="carnet-horaire">
                  <h2 id="carnet-horaire" className="carnet-titre-vue">
                    Mon horaire
                  </h2>
                  {donnees.classes.length === 0 ? (
                    <p className="compte-encadre" role="status">
                      Ajoute d'abord une classe (<Link to="/carnet/classes">Mes classes</Link>) pour remplir ton horaire de la semaine.
                    </p>
                  ) : !horaire.actif ? (
                    <MessageHoraireInactif />
                  ) : (
                    <>
                      {!horaireRempli && (
                        <p className="compte-intro">
                          Remplis ton horaire de la semaine : le carnet te proposera alors la séance du créneau en cours, te rappellera les séances oubliées et comptera les heures
                          restantes avec chaque classe (congés de la Fédération Wallonie-Bruxelles exclus).
                        </p>
                      )}
                      <MonHoraire
                        horaire={horaire}
                        ecoles={ecoles}
                        classes={donnees.classes}
                        occupe={occupe}
                        onEnregistrerGrille={(ecoleId, g, existe, hors) => agir(() => enregistrerGrille(client, ecoleId, g, existe, hors, horaire.heureZero), 'Grille horaire enregistrée.')}
                        onSupprimerGrille={(ecoleId) => void agir(() => supprimerGrille(client, ecoleId), 'Grille et horaire de cette école retirés.')}
                        onDefinirCase={(existante, saisie) => agir(() => definirCase(client, existante, saisie), 'Horaire enregistré.')}
                      />
                    </>
                  )}
                </section>
              }
            />
            <Route path="reglages" element={reglagesSection} />
            <Route path="*" element={<Navigate to="/carnet" replace />} />
          </Routes>
        </>,
      )}

      {panneau && (panneau.type === 'noter' || panneau.type === 'modifier') && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)}>
          <FormulaireSeance
            key={
              panneau.type === 'modifier'
                ? panneau.seance.id
                : `nouveau-${panneau.chapitre}-${panneau.classeId}-${panneau.creneau ? `${panneau.creneau.date}-${panneau.creneau.ecole_id}-${panneau.creneau.heureDebut}` : (panneau.date ?? '')}`
            }
            classes={donnees.classes}
            seances={donnees.seances}
            reglages={reglages}
            initiale={panneau.type === 'modifier' ? panneau.seance : null}
            prerempli={panneau.type === 'noter' ? { classeId: panneau.classeId, chapitre: panneau.chapitre, creneau: panneau.creneau, date: panneau.date, chapitreChoisi: panneau.chapitreChoisi } : { classeId: '', chapitre: '' }}
            horaire={horaireFormulaire}
            heureZero={horaire.heureZero}
            occupe={occupe}
            titreId={titrePanneau}
            apercu={apercu}
            avecGrille={(id) => {
              const k = donnees.classes.find((c) => c.id === id)
              return k ? avecGrille(contexte, k) : false
            }}
            onEnregistrer={(s, copier) => void enregistrerSeance(s, copier)}
            onAnnuler={() => setPanneau(null)}
          />
        </PanneauLateral>
      )}
      {seanceVue && (
        <PanneauLateral titreId={titrePanneau} onFermer={() => setPanneau(null)}>
          <div className="carnet-panneau-tete">
            <div className="carnet-panneau-titres">
              <h2 id={titrePanneau}>Séance du {dateLongue(seanceVue.date_seance).replace(/ \d{4}$/, '')}</h2>
              <p className="carnet-panneau-resume">{donnees.classes.find((c) => c.id === seanceVue.classe_id)?.nom}</p>
            </div>
            <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={() => setPanneau(null)} data-autofocus>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="carnet-panneau-corps">
            <CarteSeance seance={seanceVue} />
            <p>
              <button type="button" className="carnet-bouton" disabled={occupe} onClick={() => setPanneau({ type: 'modifier', seance: seanceVue })}>
                Modifier la séance
              </button>
            </p>
          </div>
        </PanneauLateral>
      )}
    </CarnetContexte.Provider>
  )
}

/** `/carnet/classe/:id` : la classe demandée (mémorisée comme classe active), ou un message. */
function RouteClasse({ classes, rendu, onVue }: { classes: Classe[]; rendu: (c: Classe) => ReactNode; onVue: (id: string) => void }) {
  const { id } = useParams()
  const classe = classes.find((c) => c.id === id)
  useEffect(() => {
    if (classe) onVue(classe.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement quand la classe change
  }, [classe?.id])
  if (!classe) {
    return (
      <div className="compte-encadre" role="status">
        <p>
          Cette classe n'existe pas (ou plus). <Link to="/carnet/classes">Voir mes classes</Link>
        </p>
      </div>
    )
  }
  return <>{rendu(classe)}</>
}

/** `/carnet/agenda?classe=<id>` (bouton « Agenda de la classe ») : classe choisie d'avance. */
function RouteAgenda({ children }: { children: (classe: string | null) => ReactNode }) {
  const [params] = useSearchParams()
  return <>{children(params.get('classe'))}</>
}
