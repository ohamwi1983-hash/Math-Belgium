import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { RichText } from '../Math'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import {
  NUMERO_HEURE_MAX,
  dateIso,
  dateLongue,
  erreursSeance,
  generateursChapitre,
  heureChamp,
  horaireParDefaut,
  horaireTexte,
  minutesHeure,
  normaliserParties,
  numeroHeureTexte,
  structureChapitre,
  unitesCouvertes,
  unitesSection,
  type Classe,
  type ErreursSeance,
  type ReglagesCarnet,
  type SaisieSeance,
  type Seance,
} from '../../lib/carnet'
import { champHeure, creneauPropose, creneauxDuJour, creneauxPonctuels, libelleCreneau, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'
import { chapitreEnCours, chapitreParDefaut, jourMois } from './outilsCarnet'

const cleCreneau = (c: Pick<Creneau, 'ecole_id' | 'heureDebut' | 'ponctuel'>) => `${c.ecole_id}|${c.heureDebut}${c.ponctuel ? '|ponctuel' : ''}`

/**
 * « Noter une séance » / « Modifier la séance » : contenu du panneau latéral commun (`PanneauLateral`).
 * En tête, le résumé « 5B · vendredi 20 novembre · H2 (09h35 → 10h25) · changer » : classe, date et
 * créneau pré-remplis (depuis le créneau cliqué), modifiables en dépliant « changer ». Puis chapitre
 * (celui en cours de la classe proposé), sections / sous-parties cochées avec « vu le … » (une case de
 * section coche toutes ses sous-parties), exercices faits, devoir, remarque privée, aperçu du texte
 * Smartschool en direct, et Annuler / Enregistrer / Enregistrer et copier pour Smartschool.
 *
 * Aucun champ numérique libre (règle CLAUDE.md) : date et heures en `type="date"` / `type="time"`,
 * numéro d'heure en liste.
 *
 * Avec un horaire (0003 + grille) : liste « Créneau de l'horaire » des créneaux du jour choisi
 * (« H2 (09h35 → 10h25) · 4Ge ») ; en choisir un règle classe, numéro(s) d'heure et plage ensemble
 * (heure double comprise). « Autre horaire » garde la saisie libre d'avant.
 *
 * Heure zéro (0004) : une H0 fixe est un créneau comme les autres (« H0–H1 » compris) ; une H0
 * PONCTUELLE (vide dans l'horaire) est quand même proposée pour la date choisie, « H0 (07h55 →
 * 08h45) · heure zéro ponctuelle », sans classe imposée : la choisir règle numéro 0 et plage, la classe
 * reste celle choisie. Sans grille, la liste des numéros propose « heure zéro » si 0004 est appliqué.
 */
export function FormulaireSeance({
  classes,
  seances,
  reglages,
  initiale,
  prerempli,
  horaire = null,
  heureZero = false,
  occupe,
  titreId,
  apercu,
  avecGrille,
  onEnregistrer,
  onAnnuler,
}: {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  initiale: Seance | null
  /** `chapitreChoisi` : chapitre demandé explicitement (bouton « Carnet » d'un chapitre) — il ne suit
   * pas un changement de classe. */
  prerempli: { classeId: string; chapitre: string; date?: string; creneau?: Creneau | null; chapitreChoisi?: boolean }
  /** Grilles et cases de l'horaire ; `null` sans horaire (0003 absent ou aucune grille). */
  horaire?: { grilles: GrilleHoraire[]; cases: CaseHoraire[] } | null
  /** 0004 appliqué : le numéro 0 (« heure zéro ») est accepté par la base. */
  heureZero?: boolean
  occupe: boolean
  /** Id du titre (`aria-labelledby` du panneau). */
  titreId: string
  /** Texte Smartschool de la saisie (même calcul que la copie d'une séance enregistrée). */
  apercu: (s: SaisieSeance) => string
  /** L'école de cette classe a une grille horaire (format « H2 (09h35 → 10h25) »). */
  avecGrille: (classeId: string) => boolean
  /** `copier` : « Enregistrer et copier pour Smartschool ». */
  onEnregistrer: (s: SaisieSeance, copier: boolean) => void
  onAnnuler: () => void
}) {
  const id = useId()
  const formulaire = useRef<HTMLFormElement>(null)
  const dateDepart = initiale?.date_seance ?? prerempli.creneau?.date ?? prerempli.date ?? dateIso(new Date())
  // Créneaux de l'horaire ce jour-là, plus les heures zéro ponctuelles (sans classe), par heure de début.
  const creneauxDe = (d: string): Creneau[] =>
    horaire && /^\d{4}-\d{2}-\d{2}$/.test(d)
      ? [...creneauxDuJour(d, horaire.grilles, horaire.cases).creneaux, ...creneauxPonctuels(d, horaire.grilles, horaire.cases)].sort((a, b) => a.debut - b.debut || a.heureDebut - b.heureDebut)
      : []
  // Créneau de départ : celui demandé ; pour une séance existante, celui qui commence à son heure ;
  // sinon le créneau en cours (ou le plus proche) de la classe ce jour-là.
  const creneauDepart = useMemo<Creneau | null>(() => {
    const liste = creneauxDe(dateDepart)
    if (prerempli.creneau && !initiale) return liste.find((c) => cleCreneau(c) === cleCreneau(prerempli.creneau as Creneau)) ?? null
    if (initiale) return liste.find((c) => (c.ponctuel || c.classe_id === initiale.classe_id) && c.heureDebut === initiale.numero_heure) ?? null
    const maintenant = new Date()
    const idem = dateDepart === dateIso(maintenant)
    return creneauPropose(
      liste.filter((c) => c.classe_id === prerempli.classeId),
      idem ? maintenant.getHours() * 60 + maintenant.getMinutes() : 0,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valeur de départ seulement
  }, [])
  const [classeId, setClasseId] = useState(initiale?.classe_id ?? (creneauDepart && !creneauDepart.ponctuel ? creneauDepart.classe_id : prerempli.classeId))
  const [date, setDate] = useState(dateDepart)
  const horaireInitial = useMemo(
    () =>
      initiale
        ? { heure_debut: initiale.heure_debut, heure_fin: initiale.heure_fin, numero_heure: initiale.numero_heure, numero_heure_fin: initiale.numero_heure_fin ?? null }
        : creneauDepart
          ? { heure_debut: champHeure(creneauDepart.debut), heure_fin: champHeure(creneauDepart.fin), numero_heure: creneauDepart.heureDebut, numero_heure_fin: creneauDepart.heureFin > creneauDepart.heureDebut ? creneauDepart.heureFin : null }
          : { ...horaireParDefaut(new Date(), reglages.duree_heure, seances.filter((s) => s.classe_id === prerempli.classeId), dateDepart), numero_heure_fin: null },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valeur de départ seulement
    [],
  )
  const [debut, setDebut] = useState(horaireInitial.heure_debut ? heureChamp(minutesHeure(horaireInitial.heure_debut) ?? 0) : '')
  const [fin, setFin] = useState(horaireInitial.heure_fin ? heureChamp(minutesHeure(horaireInitial.heure_fin) ?? 0) : '')
  const [numero, setNumero] = useState(horaireInitial.numero_heure !== null ? String(horaireInitial.numero_heure) : '')
  const [numeroFin, setNumeroFin] = useState(horaireInitial.numero_heure_fin !== null ? String(horaireInitial.numero_heure_fin) : '')
  const [creneauCle, setCreneauCle] = useState(creneauDepart ? cleCreneau(creneauDepart) : '')
  const [horaireTouche, setHoraireTouche] = useState(initiale !== null)
  const creneauxDate = useMemo(
    () => creneauxDe(date),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `horaire` change avec les données
    [date, horaire],
  )
  const [chapitreCle, setChapitreCle] = useState(initiale ? `${initiale.niveau}/${initiale.chapitre}` : prerempli.chapitre)
  const [chapitreTouche, setChapitreTouche] = useState(initiale !== null || prerempli.chapitreChoisi === true)
  // Classe / date / créneau repliés derrière « changer » (dépliés d'office sans classe).
  const [changer, setChanger] = useState(!classeId)
  const [erreursAFocaliser, setErreursAFocaliser] = useState(0)
  const [niveau, chapitreSlug] = chapitreCle.split('/')
  const chapitre = niveau && chapitreSlug ? findChapter(niveau, chapitreSlug) : undefined
  const structure = useMemo(() => (chapitre ? structureChapitre(chapitre) : []), [chapitre])
  const generateurs = useMemo(() => (chapitre ? generateursChapitre(chapitre) : []), [chapitre])
  const [coches, setCoches] = useState<Set<string>>(() => (initiale && chapitre ? unitesCouvertes(initiale.parties, structureChapitre(chapitre)) : new Set()))
  const [gens, setGens] = useState<Set<string>>(() => new Set(initiale?.generateurs ?? []))
  const [devoir, setDevoir] = useState(initiale?.devoir ?? '')
  const [remarque, setRemarque] = useState(initiale?.remarque ?? '')
  const [erreurs, setErreurs] = useState<ErreursSeance>({})

  const classe = classes.find((c) => c.id === classeId)
  const plage = reglages.format_horaire === 'plage'

  /** Première date où chaque unité a été vue par CETTE classe (hors séance modifiée). */
  const dejaVu = useMemo(() => {
    const m = new Map<string, string>()
    if (!chapitre) return m
    for (const s of seances) {
      if (s.classe_id !== classeId || s.id === initiale?.id || s.niveau !== chapitre.levelSlug || s.chapitre !== chapitre.slug) continue
      for (const u of unitesCouvertes(s.parties, structure)) if (!m.has(u) || s.date_seance < (m.get(u) as string)) m.set(u, s.date_seance)
    }
    return m
  }, [seances, classeId, initiale?.id, chapitre, structure])

  function appliquerCreneau(c: Creneau | null) {
    setCreneauCle(c ? cleCreneau(c) : '')
    if (!c) return
    // H0 ponctuelle : pas de classe imposée, la classe choisie reste.
    if (!c.ponctuel) setClasseId(c.classe_id)
    setDebut(champHeure(c.debut))
    setFin(champHeure(c.fin))
    setNumero(String(c.heureDebut))
    setNumeroFin(c.heureFin > c.heureDebut ? String(c.heureFin) : '')
    setHoraireTouche(true)
  }

  function changerDate(nouvelle: string) {
    setDate(nouvelle)
    if (!horaire) return
    const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
    // H0 ponctuelle : la même ce jour-là si elle existe (même école).
    const ponctuelle = actuel?.ponctuel ? creneauxDe(nouvelle).find((c) => c.ponctuel && c.ecole_id === actuel.ecole_id) : undefined
    if (ponctuelle) {
      appliquerCreneau(ponctuelle)
      return
    }
    const liste = creneauxDe(nouvelle).filter((c) => !c.ponctuel && c.classe_id === classeId)
    // Même classe ce jour-là : le créneau qui commence à la même heure, sinon le premier.
    const suivant = liste.find((c) => actuel && c.heureDebut === actuel.heureDebut) ?? liste[0] ?? null
    if (suivant) appliquerCreneau(suivant)
    else if (creneauCle) {
      setCreneauCle('')
      setNumero('')
      setNumeroFin('')
    }
  }

  function changerClasse(nouvelle: string) {
    setClasseId(nouvelle)
    const actuelPonctuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)?.ponctuel === true
    if (horaire && !actuelPonctuel) {
      const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
      const liste = creneauxDate.filter((c) => !c.ponctuel && c.classe_id === nouvelle)
      const suivant = liste.find((c) => actuel && c.heureDebut === actuel.heureDebut) ?? liste[0] ?? null
      if (suivant) appliquerCreneau(suivant)
      else if (creneauCle) {
        // Le numéro d'heure du créneau quitté ne vaut pas pour cette classe.
        setCreneauCle('')
        setNumero('')
        setNumeroFin('')
      }
    }
    // Avec un créneau de l'horaire pour cette classe, ses heures priment sur l'horaire « par défaut ».
    const creneauTrouve = horaire !== null && (actuelPonctuel || creneauxDate.some((c) => !c.ponctuel && c.classe_id === nouvelle))
    if (!horaireTouche && !initiale && !creneauTrouve) {
      const h = horaireParDefaut(new Date(), reglages.duree_heure, seances.filter((s) => s.classe_id === nouvelle), date)
      setDebut(h.heure_debut ?? '')
      setFin(h.heure_fin ?? '')
      setNumero(h.numero_heure !== null ? String(h.numero_heure) : '')
    }
    // Chapitre pas encore choisi à la main et rien de coché : celui en cours de la nouvelle classe.
    if (!chapitreTouche && coches.size === 0 && gens.size === 0) {
      const propose = chapitreParDefaut(nouvelle, classes, seances)
      if (propose && propose !== chapitreCle) changerChapitre(propose, false)
    }
  }

  function changerChapitre(cle: string, touche = true) {
    setChapitreCle(cle)
    setChapitreTouche(touche)
    setCoches(new Set())
    setGens(new Set())
  }

  function basculer(ids: string[], cocher: boolean) {
    setCoches((avant) => {
      const s = new Set(avant)
      ids.forEach((u) => (cocher ? s.add(u) : s.delete(u)))
      return s
    })
  }

  function saisieCourante(): SaisieSeance {
    return {
      classe_id: classeId,
      date_seance: date,
      heure_debut: debut || null,
      heure_fin: debut ? fin || null : null,
      numero_heure: numero ? Number(numero) : null,
      numero_heure_fin: numero && numeroFin ? Number(numeroFin) : null,
      niveau: chapitre?.levelSlug ?? '',
      chapitre: chapitre?.slug ?? '',
      parties: normaliserParties(coches, structure),
      generateurs: generateurs.filter((g) => gens.has(g.id)).map((g) => g.id),
      devoir,
      remarque,
    }
  }

  function envoyer(copier: boolean) {
    const saisie = saisieCourante()
    const err = erreursSeance(saisie)
    setErreurs(err)
    if (Object.keys(err).length === 0) {
      onEnregistrer(saisie, copier)
      return
    }
    // Classe, date ou horaire en erreur : déplier « changer » pour les montrer.
    if (err.classe || err.date || err.horaire) setChanger(true)
    setErreursAFocaliser((n) => n + 1)
  }

  // Après une tentative refusée : focus sur le premier champ en erreur.
  useEffect(() => {
    if (erreursAFocaliser === 0) return
    formulaire.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [erreursAFocaliser])

  const niveauxOrdonnes = classe?.niveau ? [...LEVELS.filter((l) => l.slug === classe.niveau), ...LEVELS.filter((l) => l.slug !== classe.niveau)] : LEVELS
  const nbCochees = normaliserParties(coches, structure).length
  const nbGens = gens.size
  const enCours = classeId ? chapitreEnCours(classeId, seances.filter((s) => s.id !== initiale?.id)) : ''
  const saisie = saisieCourante()
  const horaireResume = horaireTexte(
    { heure_debut: saisie.heure_debut, heure_fin: saisie.heure_fin, numero_heure: saisie.numero_heure, numero_heure_fin: saisie.numero_heure_fin },
    reglages.format_horaire,
    classeId ? avecGrille(classeId) : false,
  )
  const dateValide = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const texteApercu = classe && chapitre && dateValide ? apercu(saisie) : null

  return (
    <form ref={formulaire} className="carnet-form-panneau" onSubmit={(e: FormEvent) => (e.preventDefault(), envoyer(false))} noValidate aria-labelledby={titreId}>
      <div className="carnet-panneau-tete">
        <div className="carnet-panneau-titres">
          <h2 id={titreId}>{initiale ? 'Modifier la séance' : 'Noter une séance'}</h2>
          <p className="carnet-panneau-resume">
            <strong>{classe?.nom ?? 'Classe à choisir'}</strong>
            {dateValide && <> · {dateLongue(date, true).replace(/ \d{4}$/, '')}</>}
            {horaireResume && <> · {horaireResume}</>}
            {' · '}
            <button type="button" className="compte-bouton-lien carnet-lien-changer" aria-expanded={changer} aria-controls={`${id}-quand`} onClick={() => setChanger(!changer)}>
              {changer ? 'masquer' : 'changer'}
              <span className="carnet-sr"> la classe, la date ou l’heure</span>
            </button>
          </p>
        </div>
        <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={onAnnuler}>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="carnet-panneau-corps">
        <div id={`${id}-quand`} className="carnet-panneau-quand" hidden={!changer}>
          <div className="carnet-grille">
            <div className="compte-champ">
              <label htmlFor={`${id}-classe`}>Classe</label>
              <select id={`${id}-classe`} value={classeId} onChange={(e) => changerClasse(e.target.value)} aria-invalid={erreurs.classe ? true : undefined}>
                <option value="">— choisir —</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
              {erreurs.classe && <p className="compte-erreur-champ">{erreurs.classe}</p>}
            </div>
            <div className="compte-champ">
              <label htmlFor={`${id}-date`}>Date</label>
              <input id={`${id}-date`} type="date" value={date} onChange={(e) => changerDate(e.target.value)} aria-invalid={erreurs.date ? true : undefined} />
              {erreurs.date && <p className="compte-erreur-champ">{erreurs.date}</p>}
            </div>
          </div>

          {horaire && (
            <div className="compte-champ">
              <label htmlFor={`${id}-creneau`}>Créneau de l'horaire</label>
              <select id={`${id}-creneau`} value={creneauCle} onChange={(e) => appliquerCreneau(creneauxDate.find((c) => cleCreneau(c) === e.target.value) ?? null)}>
                {creneauxDate.map((c) => (
                  <option key={cleCreneau(c)} value={cleCreneau(c)}>
                    {libelleCreneau(c)} · {c.ponctuel ? 'heure zéro ponctuelle' : (classes.find((k) => k.id === c.classe_id)?.nom ?? 'classe')}
                  </option>
                ))}
                <option value="">Autre horaire (saisie libre)</option>
              </select>
              {creneauxDate.length === 0 && <p className="compte-aide">Aucun cours de ton horaire ce jour-là (week-end, congé ou jour sans cours) : horaire libre ci-dessous.</p>}
              {creneauxDate.some((c) => c.ponctuel && cleCreneau(c) === creneauCle) && <p className="compte-aide">Heure zéro ponctuelle : vide dans ton horaire, pour la classe choisie ci-dessus.</p>}
            </div>
          )}

          {horaire && creneauCle ? null : plage ? (
            <fieldset className="carnet-fieldset">
              <legend>Horaire</legend>
              <div className="carnet-grille carnet-grille-heures">
                <div className="compte-champ">
                  <label htmlFor={`${id}-debut`}>Début</label>
                  <input
                    id={`${id}-debut`}
                    type="time"
                    value={debut}
                    onChange={(e) => {
                      setHoraireTouche(true)
                      if (horaire) {
                        setNumero('')
                        setNumeroFin('')
                      }
                      const ancien = minutesHeure(debut)
                      const nouveau = minutesHeure(e.target.value)
                      const finM = minutesHeure(fin)
                      // La fin suit le début (même durée) tant qu'elle n'a pas été changée à la main.
                      if (nouveau !== null && (finM === null || (ancien !== null && finM - ancien === reglages.duree_heure))) setFin(heureChamp(Math.min(nouveau + reglages.duree_heure, 1439)))
                      setDebut(e.target.value)
                    }}
                    aria-invalid={erreurs.horaire ? true : undefined}
                  />
                </div>
                <span className="carnet-fleche" aria-hidden="true">
                  →
                </span>
                <div className="compte-champ">
                  <label htmlFor={`${id}-fin`}>Fin</label>
                  <input
                    id={`${id}-fin`}
                    type="time"
                    value={fin}
                    onChange={(e) => {
                      setHoraireTouche(true)
                      if (horaire) {
                        setNumero('')
                        setNumeroFin('')
                      }
                      setFin(e.target.value)
                    }}
                    aria-invalid={erreurs.horaire ? true : undefined}
                  />
                </div>
              </div>
              {erreurs.horaire && <p className="compte-erreur-champ">{erreurs.horaire}</p>}
            </fieldset>
          ) : (
            <div className="compte-champ">
              <label htmlFor={`${id}-numero`}>Heure de cours</label>
              <select
                id={`${id}-numero`}
                value={numero}
                onChange={(e) => {
                  setHoraireTouche(true)
                  setNumero(e.target.value)
                  setNumeroFin('')
                  if (horaire) {
                    setDebut('')
                    setFin('')
                  }
                }}
                aria-invalid={erreurs.horaire ? true : undefined}
              >
                <option value="">— non précisée —</option>
                {(heureZero || numero === '0') && <option value="0">{numeroHeureTexte(0)}</option>}
                {Array.from({ length: NUMERO_HEURE_MAX }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={String(n)}>
                    {numeroHeureTexte(n)}
                  </option>
                ))}
              </select>
              {erreurs.horaire && <p className="compte-erreur-champ">{erreurs.horaire}</p>}
            </div>
          )}
        </div>

        <div className="compte-champ">
          <label htmlFor={`${id}-chapitre`} className="carnet-etiquette">
            Chapitre
          </label>
          <select id={`${id}-chapitre`} data-autofocus value={chapitreCle} onChange={(e) => changerChapitre(e.target.value)} aria-invalid={erreurs.chapitre ? true : undefined}>
            <option value="">— choisir —</option>
            {niveauxOrdonnes.map((l) => (
              <optgroup key={l.slug} label={l.label}>
                {l.chapters.map((c) => (
                  <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                    {c.chapterNumber}. {c.title}
                    {enCours === `${l.slug}/${c.slug}` ? ' (en cours)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {erreurs.chapitre && <p className="compte-erreur-champ">{erreurs.chapitre}</p>}
        </div>

        {chapitre && (
          <fieldset className="carnet-fieldset carnet-parties">
            <legend className="carnet-etiquette">
              Ce qui a été vu <span className="compte-compte">({nbCochees} cochée{nbCochees > 1 ? 's' : ''})</span>
            </legend>
            <p className="compte-aide">Coche une section entière, ou seulement les sous-parties vues.</p>
            {structure.map((section) => {
              const unites = unitesSection(section)
              const n = unites.filter((u) => coches.has(u)).length
              const toutes = n === unites.length
              const dates = unites.map((u) => dejaVu.get(u)).filter((d): d is string => d !== undefined).sort()
              const vue = dates.length === unites.length
              const etat = vue ? `vu le ${jourMois(dates[dates.length - 1])}` : dates.length > 0 ? `commencé le ${jourMois(dates[0])}` : null
              return (
                <div className={`carnet-section${vue ? ' vue' : dates.length > 0 ? ' commencee' : ''}`} key={section.id}>
                  <label className="carnet-case carnet-case-section">
                    <input
                      type="checkbox"
                      checked={toutes}
                      ref={(el) => {
                        if (el) el.indeterminate = n > 0 && !toutes
                      }}
                      onChange={() => basculer(unites, !toutes)}
                    />
                    <span className="carnet-case-texte">
                      {section.numero}. <RichText text={section.titre} />
                    </span>
                    {etat && <span className="carnet-vu-le">{etat}</span>}
                  </label>
                  {section.sousParties.length > 0 && (
                    <div className="carnet-sous-parties">
                      {section.sousParties.map((p) => (
                        <label className="carnet-case" key={p.id}>
                          <input type="checkbox" checked={coches.has(p.id)} onChange={(e) => basculer([p.id], e.target.checked)} />
                          <span className="carnet-case-texte">
                            <RichText text={p.titre} />
                          </span>
                          {dejaVu.has(p.id) && <span className="carnet-vu-le">vu le {jourMois(dejaVu.get(p.id) as string)}</span>}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </fieldset>
        )}

        {chapitre && generateurs.length > 0 && (
          <details className="carnet-details" open={nbGens > 0}>
            <summary>
              Exercices faits en classe <span className="compte-compte">({nbGens} coché{nbGens > 1 ? 's' : ''})</span>
            </summary>
            <div className="carnet-sous-parties carnet-generateurs">
              {generateurs.map((g) => {
                const section = structure.find((s) => s.id === g.sectionId)
                return (
                  <label className="carnet-case" key={g.id}>
                    <input
                      type="checkbox"
                      checked={gens.has(g.id)}
                      onChange={(e) =>
                        setGens((avant) => {
                          const s = new Set(avant)
                          if (e.target.checked) s.add(g.id)
                          else s.delete(g.id)
                          return s
                        })
                      }
                    />
                    <span>
                      {section ? `${section.numero}. ` : 'Synthèse · '}
                      <RichText text={g.titre} />
                    </span>
                  </label>
                )
              })}
            </div>
          </details>
        )}

        <div className="compte-champ">
          <label htmlFor={`${id}-devoir`} className="carnet-etiquette">
            Devoir
          </label>
          <textarea id={`${id}-devoir`} rows={2} value={devoir} onChange={(e) => setDevoir(e.target.value)} aria-invalid={erreurs.devoir ? true : undefined} />
          {erreurs.devoir && <p className="compte-erreur-champ">{erreurs.devoir}</p>}
        </div>
        <div className="compte-champ">
          <label htmlFor={`${id}-remarque`} className="carnet-etiquette">
            Remarque (pour toi seulement)
          </label>
          <textarea id={`${id}-remarque`} rows={2} value={remarque} onChange={(e) => setRemarque(e.target.value)} aria-invalid={erreurs.remarque ? true : undefined} placeholder="Ex. : revoir ce point mardi" />
          <p className="compte-aide">Jamais copiée vers Smartschool. Aucune donnée d'élève.</p>
          {erreurs.remarque && <p className="compte-erreur-champ">{erreurs.remarque}</p>}
        </div>

        <section className="carnet-apercu-smartschool" aria-labelledby={`${id}-apercu`}>
          <h3 id={`${id}-apercu`}>Aperçu pour Smartschool</h3>
          {texteApercu ? <p className="carnet-apercu-texte">{texteApercu}</p> : <p className="compte-aide">Choisis la classe, la date et le chapitre pour voir le texte.</p>}
        </section>
      </div>

      <div className="carnet-panneau-pied">
        <button type="button" className="carnet-bouton" onClick={onAnnuler}>
          Annuler
        </button>
        <button type="submit" className="carnet-bouton" disabled={occupe}>
          Enregistrer
        </button>
        <button type="button" className="carnet-bouton principal" disabled={occupe} onClick={() => envoyer(true)}>
          Enregistrer et copier pour Smartschool
        </button>
      </div>
    </form>
  )
}
