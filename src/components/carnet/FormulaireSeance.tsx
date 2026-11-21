import { useId, useMemo, useState, type FormEvent } from 'react'
import { RichText } from '../Math'
import { findChapter, LEVELS } from '../../content/chaptersIndex'
import {
  NUMERO_HEURE_MAX,
  dateCourte,
  dateIso,
  erreursSeance,
  generateursChapitre,
  heureChamp,
  horaireParDefaut,
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
import { champHeure, creneauPropose, creneauxDuJour, libelleCreneau, type CaseHoraire, type Creneau, type GrilleHoraire } from '../../lib/horaire'

const cleCreneau = (c: Pick<Creneau, 'ecole_id' | 'heureDebut'>) => `${c.ecole_id}|${c.heureDebut}`

/**
 * Saisie d'une séance : classe, date, horaire (plage « 08h50 → 09h40 » ou numéro d'heure, selon le
 * réglage), chapitre puis sections / sous-parties cochées (une case de section coche toutes ses
 * sous-parties), générateurs utilisés, devoir, remarque. Aucun champ numérique libre (règle
 * CLAUDE.md) : date et heures en `type="date"` / `type="time"`, numéro d'heure en liste.
 *
 * Avec un horaire (0003 + grille) : liste « Créneau de l'horaire » des créneaux du jour choisi
 * (« H2 (09h35 → 10h25) · 4Ge ») ; en choisir un règle classe, numéro(s) d'heure et plage ensemble
 * (heure double comprise). « Autre horaire » garde la saisie libre d'avant.
 */
export function FormulaireSeance({
  classes,
  seances,
  reglages,
  initiale,
  prerempli,
  horaire = null,
  occupe,
  onEnregistrer,
  onAnnuler,
}: {
  classes: Classe[]
  seances: Seance[]
  reglages: ReglagesCarnet
  initiale: Seance | null
  prerempli: { classeId: string; chapitre: string; date?: string; creneau?: Creneau | null }
  /** Grilles et cases de l'horaire ; `null` sans horaire (0003 absent ou aucune grille). */
  horaire?: { grilles: GrilleHoraire[]; cases: CaseHoraire[] } | null
  occupe: boolean
  onEnregistrer: (s: SaisieSeance) => void
  onAnnuler: () => void
}) {
  const id = useId()
  const dateDepart = initiale?.date_seance ?? prerempli.creneau?.date ?? prerempli.date ?? dateIso(new Date())
  const creneauxDe = (d: string) => (horaire && /^\d{4}-\d{2}-\d{2}$/.test(d) ? creneauxDuJour(d, horaire.grilles, horaire.cases).creneaux : [])
  // Créneau de départ : celui demandé ; pour une séance existante, celui qui commence à son heure ;
  // sinon le créneau en cours (ou le plus proche) de la classe ce jour-là.
  const creneauDepart = useMemo<Creneau | null>(() => {
    const liste = creneauxDe(dateDepart)
    if (prerempli.creneau && !initiale) return liste.find((c) => cleCreneau(c) === cleCreneau(prerempli.creneau as Creneau)) ?? null
    if (initiale) return liste.find((c) => c.classe_id === initiale.classe_id && c.heureDebut === initiale.numero_heure) ?? null
    const maintenant = new Date()
    const idem = dateDepart === dateIso(maintenant)
    return creneauPropose(
      liste.filter((c) => c.classe_id === prerempli.classeId),
      idem ? maintenant.getHours() * 60 + maintenant.getMinutes() : 0,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valeur de départ seulement
  }, [])
  const [classeId, setClasseId] = useState(initiale?.classe_id ?? creneauDepart?.classe_id ?? prerempli.classeId)
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
  const [numero, setNumero] = useState(horaireInitial.numero_heure ? String(horaireInitial.numero_heure) : '')
  const [numeroFin, setNumeroFin] = useState(horaireInitial.numero_heure_fin ? String(horaireInitial.numero_heure_fin) : '')
  const [creneauCle, setCreneauCle] = useState(creneauDepart ? cleCreneau(creneauDepart) : '')
  const [horaireTouche, setHoraireTouche] = useState(initiale !== null)
  const creneauxDate = useMemo(
    () => creneauxDe(date),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `horaire` change avec les données
    [date, horaire],
  )
  const [chapitreCle, setChapitreCle] = useState(initiale ? `${initiale.niveau}/${initiale.chapitre}` : prerempli.chapitre)
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
    setClasseId(c.classe_id)
    setDebut(champHeure(c.debut))
    setFin(champHeure(c.fin))
    setNumero(String(c.heureDebut))
    setNumeroFin(c.heureFin > c.heureDebut ? String(c.heureFin) : '')
    setHoraireTouche(true)
  }

  function changerDate(nouvelle: string) {
    setDate(nouvelle)
    if (!horaire) return
    const liste = creneauxDe(nouvelle).filter((c) => c.classe_id === classeId)
    const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
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
    if (horaire) {
      const actuel = creneauxDate.find((c) => cleCreneau(c) === creneauCle)
      const liste = creneauxDate.filter((c) => c.classe_id === nouvelle)
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
    const creneauTrouve = horaire !== null && creneauxDate.some((c) => c.classe_id === nouvelle)
    if (!horaireTouche && !initiale && !creneauTrouve) {
      const h = horaireParDefaut(new Date(), reglages.duree_heure, seances.filter((s) => s.classe_id === nouvelle), date)
      setDebut(h.heure_debut ?? '')
      setFin(h.heure_fin ?? '')
      setNumero(h.numero_heure ? String(h.numero_heure) : '')
    }
    const c = classes.find((x) => x.id === nouvelle)
    if (!chapitreCle && c?.niveau) {
      const premier = LEVELS.find((l) => l.slug === c.niveau)?.chapters[0]
      if (premier) changerChapitre(`${c.niveau}/${premier.slug}`)
    }
  }

  function changerChapitre(cle: string) {
    setChapitreCle(cle)
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

  function envoyer(e: FormEvent) {
    e.preventDefault()
    const saisie: SaisieSeance = {
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
    const err = erreursSeance(saisie)
    setErreurs(err)
    if (Object.keys(err).length === 0) onEnregistrer(saisie)
  }

  const niveauxOrdonnes = classe?.niveau ? [...LEVELS.filter((l) => l.slug === classe.niveau), ...LEVELS.filter((l) => l.slug !== classe.niveau)] : LEVELS
  const nbCochees = normaliserParties(coches, structure).length
  const nbGens = gens.size

  return (
    <form className="carnet-form" onSubmit={envoyer} noValidate aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`}>{initiale ? `Modifier la séance du ${dateCourte(initiale.date_seance)}` : 'Nouvelle séance'}</h3>

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
                {libelleCreneau(c)} · {classes.find((k) => k.id === c.classe_id)?.nom ?? 'classe'}
              </option>
            ))}
            <option value="">Autre horaire (saisie libre)</option>
          </select>
          {creneauxDate.length === 0 && <p className="compte-aide">Aucun cours de ton horaire ce jour-là (week-end, congé ou jour sans cours) : horaire libre ci-dessous.</p>}
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
            {Array.from({ length: NUMERO_HEURE_MAX }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {numeroHeureTexte(n)}
              </option>
            ))}
          </select>
          {erreurs.horaire && <p className="compte-erreur-champ">{erreurs.horaire}</p>}
        </div>
      )}

      <div className="compte-champ">
        <label htmlFor={`${id}-chapitre`}>Chapitre</label>
        <select id={`${id}-chapitre`} value={chapitreCle} onChange={(e) => changerChapitre(e.target.value)} aria-invalid={erreurs.chapitre ? true : undefined}>
          <option value="">— choisir —</option>
          {niveauxOrdonnes.map((l) => (
            <optgroup key={l.slug} label={l.label}>
              {l.chapters.map((c) => (
                <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                  {c.chapterNumber}. {c.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {erreurs.chapitre && <p className="compte-erreur-champ">{erreurs.chapitre}</p>}
      </div>

      {chapitre && (
        <fieldset className="carnet-fieldset carnet-parties">
          <legend>
            Vu en classe <span className="compte-compte">({nbCochees} cochée{nbCochees > 1 ? 's' : ''})</span>
          </legend>
          <p className="compte-aide">Coche une section entière, ou seulement les sous-parties vues.</p>
          {structure.map((section) => {
            const unites = unitesSection(section)
            const n = unites.filter((u) => coches.has(u)).length
            const toutes = n === unites.length
            const vuSection = section.sousParties.length === 0 ? dejaVu.get(section.id) : undefined
            return (
              <div className="carnet-section" key={section.id}>
                <label className="carnet-case carnet-case-section">
                  <input
                    type="checkbox"
                    checked={toutes}
                    ref={(el) => {
                      if (el) el.indeterminate = n > 0 && !toutes
                    }}
                    onChange={() => basculer(unites, !toutes)}
                  />
                  <span>
                    {section.numero}. <RichText text={section.titre} />
                    {vuSection && <span className="carnet-deja-vu"> · déjà vu le {dateCourte(vuSection)}</span>}
                  </span>
                </label>
                {section.sousParties.length > 0 && (
                  <div className="carnet-sous-parties">
                    {section.sousParties.map((p) => (
                      <label className="carnet-case" key={p.id}>
                        <input type="checkbox" checked={coches.has(p.id)} onChange={(e) => basculer([p.id], e.target.checked)} />
                        <span>
                          <RichText text={p.titre} />
                          {dejaVu.has(p.id) && <span className="carnet-deja-vu"> · déjà vu le {dateCourte(dejaVu.get(p.id) as string)}</span>}
                        </span>
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
            Exercices et générateurs utilisés <span className="compte-compte">({nbGens})</span>
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
        <label htmlFor={`${id}-devoir`}>Devoir</label>
        <textarea id={`${id}-devoir`} rows={2} value={devoir} onChange={(e) => setDevoir(e.target.value)} aria-invalid={erreurs.devoir ? true : undefined} />
        {erreurs.devoir && <p className="compte-erreur-champ">{erreurs.devoir}</p>}
      </div>
      <div className="compte-champ">
        <label htmlFor={`${id}-remarque`}>Remarque (pour toi seulement)</label>
        <textarea id={`${id}-remarque`} rows={2} value={remarque} onChange={(e) => setRemarque(e.target.value)} aria-invalid={erreurs.remarque ? true : undefined} />
        <p className="compte-aide">Jamais copiée vers Smartschool. Aucune donnée d'élève.</p>
        {erreurs.remarque && <p className="compte-erreur-champ">{erreurs.remarque}</p>}
      </div>

      <div className="compte-actions">
        <button type="submit" className="compte-bouton" disabled={occupe}>
          {initiale ? 'Enregistrer les modifications' : 'Enregistrer la séance'}
        </button>
        <button type="button" className="compte-bouton-secondaire" onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  )
}
