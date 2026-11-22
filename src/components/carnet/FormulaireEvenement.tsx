import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { LEVELS } from '../../content/chaptersIndex'
import { texteBrut, type Classe } from '../../lib/carnet'
import type { Ecole } from '../../lib/compteValidation'
import {
  avertissementsInterro,
  erreursEvenement,
  INTITULE_MAX,
  LIBELLE_TYPE,
  resumeSuppressions,
  titreEvenement,
  TYPES_EVENEMENT,
  type ContexteAgenda,
  type ErreursEvenement,
  type Evenement,
  type PeriodeBulletin,
  type SaisieEvenement,
  type TypeEvenement,
} from '../../lib/agendaEvenements'
import { creneauxDuJour, libelleCreneau, premiereHeure, type CaseHoraire, type GrilleHoraire } from '../../lib/horaire'
import { AvertissementsInterro, IconeType, MessageAgendaInactif } from './AgendaUi'

const nomHeure = (n: number) => (n === 0 ? 'heure zéro (H0)' : `${n}${n === 1 ? 're' : 'e'} heure`)

/**
 * « Nouvel événement » / « Modifier l'événement » (maquettes « Événement » et « Interrogation et
 * date limite » du 22/11/2026), dans le panneau latéral commun (`PanneauLateral`). Type en puces ;
 * sortie, voyage, journée pédagogique… : intitulé, du / au, « Journée entière » ou « Certaines
 * heures » (de la n-ième à la m-ième heure de l'horaire de l'école), classes « Toutes » / « Certaines »
 * (pastilles), « J'accompagne », résumé « Heures supprimées : … ». Absence du professeur : ni
 * « Toutes » / « Certaines » ni « J'accompagne » (toujours toutes ses classes de l'école), intitulé
 * facultatif (« Formation », « Maladie »). Interrogation : classe, date, heure
 * facultative (créneaux de la classe ce jour-là), chapitre facultatif, avertissements de la date
 * limite du bulletin. Supprimer : confirmation DANS le panneau (jamais `confirm()`).
 *
 * Aucun champ numérique (règle CLAUDE.md) : dates en `type="date"`, heures en listes.
 */
export function FormulaireEvenement({
  initiale,
  prerempli,
  classes,
  ecoles,
  grilles,
  cases,
  periodes,
  evenements,
  seuil,
  aujourdhui,
  actif,
  occupe,
  titreId,
  onEnregistrer,
  onSupprimer,
  onAnnuler,
}: {
  initiale: Evenement | null
  prerempli: Partial<SaisieEvenement>
  classes: Classe[]
  ecoles: Ecole[]
  grilles: GrilleHoraire[]
  cases: CaseHoraire[]
  periodes: PeriodeBulletin[]
  evenements: Evenement[]
  seuil: number
  aujourdhui: string
  /** Faux : 0006 pas appliqué (message à la place du formulaire). */
  actif: boolean
  occupe: boolean
  titreId: string
  onEnregistrer: (s: SaisieEvenement) => void
  onSupprimer: () => void
  onAnnuler: () => void
}) {
  const id = useId()
  const ecoleDefaut = ecoles.find((e) => e.par_defaut)?.id ?? ecoles[0]?.id ?? ''
  const [s, setS] = useState<SaisieEvenement>(() => {
    if (initiale) {
      const { id: _id, cree_le: _c, ...reste } = initiale
      return reste
    }
    const classeDemandee = prerempli.classe_id ?? prerempli.classes?.[0]
    const ecole = prerempli.ecole_id ?? classes.find((c) => c.id === classeDemandee)?.ecole_id ?? ecoleDefaut
    return {
      ecole_id: ecole,
      type: 'sortie',
      intitule: '',
      du: aujourdhui,
      au: prerempli.du ?? aujourdhui,
      journee_entiere: true,
      heure_debut: null,
      heure_fin: null,
      toutes_classes: true,
      accompagne: false,
      classe_id: null,
      chapitre: null,
      classes: [],
      ...prerempli,
    }
  })
  const [erreurs, setErreurs] = useState<ErreursEvenement>({})
  const [confirmer, setConfirmer] = useState(false)
  const annulerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (confirmer) annulerRef.current?.focus()
  }, [confirmer])

  const interro = s.type === 'interrogation'
  const absence = s.type === 'absence_professeur'
  const maj = (p: Partial<SaisieEvenement>) => {
    setS((x) => ({ ...x, ...p }))
    setErreurs({})
  }
  const classesEcole = classes.filter((c) => c.ecole_id === s.ecole_id)
  const grille = grilles.find((g) => g.ecole_id === s.ecole_id)
  const numeros = grille ? Array.from({ length: grille.nombre_heures - premiereHeure(grille) + 1 }, (_, i) => i + premiereHeure(grille)) : Array.from({ length: 10 }, (_, i) => i + 1)

  // Interrogation : sa classe (une seule) ; par défaut, la première des classes choisies.
  const classeInterro = classes.find((c) => c.id === s.classe_id) ?? null
  function choisirType(t: TypeEvenement) {
    if (t === 'interrogation') {
      const cid = s.classe_id ?? s.classes[0] ?? classesEcole[0]?.id ?? classes[0]?.id ?? null
      const k = classes.find((c) => c.id === cid)
      maj({ type: t, classe_id: cid, ecole_id: k?.ecole_id ?? s.ecole_id, au: s.du, journee_entiere: true, heure_debut: null, heure_fin: null })
    } else if (t === 'absence_professeur') {
      // Toujours toutes les classes de l'école, jamais « J'accompagne » (choix masqués).
      maj({ type: t, toutes_classes: true, accompagne: false, classes: [], ...(s.type === 'interrogation' ? { journee_entiere: true, heure_debut: null, heure_fin: null } : {}) })
    } else maj({ type: t, ...(s.type === 'interrogation' ? { toutes_classes: s.classe_id === null, classes: s.classe_id ? [s.classe_id] : [], journee_entiere: true, heure_debut: null, heure_fin: null } : {}) })
  }

  // Créneaux de la classe de l'interro ce jour-là (heure facultative prise dans l'horaire).
  const creneauxInterro = useMemo(() => {
    if (!interro || !s.classe_id || !/^\d{4}-\d{2}-\d{2}$/.test(s.du)) return []
    return creneauxDuJour(s.du, grilles, cases.filter((c) => c.classe_id === s.classe_id)).creneaux
  }, [interro, s.classe_id, s.du, grilles, cases])
  const cleHeure = s.journee_entiere || s.heure_debut === null ? '' : `${s.heure_debut}-${s.heure_fin}`

  // Chapitres proposés : ceux du niveau de la classe, sinon tous (par niveau).
  const niveaux = classeInterro?.niveau ? LEVELS.filter((l) => l.slug === classeInterro.niveau) : LEVELS

  const brouillon: Evenement = { ...s, id: initiale?.id ?? '__brouillon__', cree_le: initiale?.cree_le ?? '9999' }
  const ctxSeul: ContexteAgenda = { grilles, cases, evenements: [brouillon], classes }
  const resume = !interro && grilles.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(s.du) && /^\d{4}-\d{2}-\d{2}$/.test(s.au) && s.au >= s.du ? resumeSuppressions(brouillon, ctxSeul) : null
  const avertissements =
    interro && classeInterro ? avertissementsInterro({ date: s.du, ecoleId: classeInterro.ecole_id, periodes, evenements: evenements.filter((e) => e.id !== initiale?.id), seuil, aujourdhui }) : []

  function envoyer(ev: FormEvent) {
    ev.preventDefault()
    const e = erreursEvenement(s)
    setErreurs(e)
    if (Object.keys(e).length > 0) return
    onEnregistrer(s)
  }

  function clavierConfirmation(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setConfirmer(false)
    }
  }

  const titre = initiale ? (interro ? 'Modifier l’interrogation' : 'Modifier l’événement') : 'Nouvel événement'

  return (
    <form className="carnet-form-panneau agenda-form" onSubmit={envoyer} noValidate>
      <div className="carnet-panneau-tete">
        <div className="carnet-panneau-titres">
          <h2 id={titreId}>{titre}</h2>
        </div>
        <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={onAnnuler} data-autofocus>
          <span aria-hidden="true">×</span>
        </button>
      </div>

      {!actif ? (
        <div className="carnet-panneau-corps">
          <MessageAgendaInactif />
        </div>
      ) : (
        <>
          <div className="carnet-panneau-corps">
            <fieldset className="agenda-groupe">
              <legend className="agenda-etiquette">Type</legend>
              <div className="agenda-choix-types">
                {TYPES_EVENEMENT.map((t) => (
                  <label key={t} className={`agenda-choix${s.type === t ? ' actif' : ''}`}>
                    <input type="radio" name={`${id}-type`} className="carnet-sr" checked={s.type === t} onChange={() => choisirType(t)} />
                    {t !== 'autre' && <IconeType type={t} taille={15} />}
                    {LIBELLE_TYPE[t]}
                  </label>
                ))}
              </div>
            </fieldset>

            {interro ? (
              <>
                <div className="agenda-deux">
                  <div className="compte-champ">
                    <label htmlFor={`${id}-classe`}>Classe</label>
                    <select
                      id={`${id}-classe`}
                      value={s.classe_id ?? ''}
                      aria-invalid={erreurs.classes ? true : undefined}
                      onChange={(e) => {
                        const k = classes.find((c) => c.id === e.target.value)
                        maj({ classe_id: k?.id ?? null, ecole_id: k?.ecole_id ?? s.ecole_id, journee_entiere: true, heure_debut: null, heure_fin: null, chapitre: k?.niveau && s.chapitre && !s.chapitre.startsWith(`${k.niveau}/`) ? null : s.chapitre })
                      }}
                    >
                      {s.classe_id === null && <option value="">— choisir —</option>}
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                          {ecoles.length > 1 ? ` — ${ecoles.find((e) => e.id === c.ecole_id)?.nom ?? ''}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="compte-champ">
                    <label htmlFor={`${id}-date`}>Date</label>
                    <input id={`${id}-date`} type="date" value={s.du} aria-invalid={erreurs.dates ? true : undefined} onChange={(e) => maj({ du: e.target.value, au: e.target.value, journee_entiere: true, heure_debut: null, heure_fin: null })} />
                  </div>
                </div>
                {erreurs.classes && <p className="compte-erreur-champ">{erreurs.classes}</p>}
                {erreurs.dates && <p className="compte-erreur-champ">{erreurs.dates}</p>}
                <div className="compte-champ">
                  <label htmlFor={`${id}-heure`}>Heure (facultatif)</label>
                  <select
                    id={`${id}-heure`}
                    value={cleHeure}
                    onChange={(e) => {
                      const [a, b] = e.target.value.split('-').map(Number)
                      if (!e.target.value) maj({ journee_entiere: true, heure_debut: null, heure_fin: null })
                      else maj({ journee_entiere: false, heure_debut: a, heure_fin: b })
                    }}
                  >
                    <option value="">— sans heure précise —</option>
                    {creneauxInterro.map((c) => (
                      <option key={c.heureDebut} value={`${c.heureDebut}-${c.heureFin}`}>
                        {libelleCreneau(c)}
                      </option>
                    ))}
                    {cleHeure && !creneauxInterro.some((c) => `${c.heureDebut}-${c.heureFin}` === cleHeure) && (
                      <option value={cleHeure}>{s.heure_debut === s.heure_fin ? `H${s.heure_debut}` : `H${s.heure_debut}–H${s.heure_fin}`} (enregistrée)</option>
                    )}
                  </select>
                  {creneauxInterro.length === 0 && <p className="compte-aide">Pas de cours de cette classe ce jour-là dans ton horaire : l’interro est notée pour la journée.</p>}
                </div>
                <div className="compte-champ">
                  <label htmlFor={`${id}-chapitre`}>Chapitre (facultatif)</label>
                  <select id={`${id}-chapitre`} value={s.chapitre ?? ''} onChange={(e) => maj({ chapitre: e.target.value || null })}>
                    <option value="">—</option>
                    {niveaux.map((l) =>
                      niveaux.length === 1 ? (
                        l.chapters.map((c) => (
                          <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                            {texteBrut(c.title)}
                          </option>
                        ))
                      ) : (
                        <optgroup key={l.slug} label={l.label}>
                          {l.chapters.map((c) => (
                            <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                              {texteBrut(c.title)}
                            </option>
                          ))}
                        </optgroup>
                      ),
                    )}
                  </select>
                </div>
                <AvertissementsInterro avertissements={avertissements} date={s.du} />
                {avertissements.length === 0 && classeInterro && !periodes.some((p) => p.ecole_id === classeInterro.ecole_id) && (
                  <p className="compte-aide">Ajoute les dates de remise des points (Réglages) pour être averti quand une interro tombe trop près ou après la date limite.</p>
                )}
              </>
            ) : (
              <>
                <div className="compte-champ">
                  <label htmlFor={`${id}-intitule`}>{absence ? 'Intitulé (facultatif)' : 'Intitulé'}</label>
                  <input
                    id={`${id}-intitule`}
                    type="text"
                    value={s.intitule}
                    placeholder={absence ? 'Ex. : Formation, Maladie' : LIBELLE_TYPE[s.type]}
                    aria-invalid={erreurs.intitule ? true : undefined}
                    aria-describedby={erreurs.intitule ? `${id}-intitule-e` : undefined}
                    onChange={(e) => maj({ intitule: e.target.value })}
                  />
                  {erreurs.intitule && (
                    <p id={`${id}-intitule-e`} className="compte-erreur-champ">
                      {erreurs.intitule}
                    </p>
                  )}
                  {s.intitule.length > INTITULE_MAX - 20 && <p className="compte-aide">{INTITULE_MAX - s.intitule.length} caractères restants.</p>}
                </div>
                {ecoles.length > 1 && (
                  <div className="compte-champ">
                    <label htmlFor={`${id}-ecole`}>École</label>
                    <select id={`${id}-ecole`} value={s.ecole_id} onChange={(e) => maj({ ecole_id: e.target.value, classes: [], heure_debut: null, heure_fin: null, journee_entiere: true })}>
                      {ecoles.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="agenda-deux">
                  <div className="compte-champ">
                    <label htmlFor={`${id}-du`}>Du</label>
                    <input id={`${id}-du`} type="date" value={s.du} aria-invalid={erreurs.dates ? true : undefined} onChange={(e) => maj({ du: e.target.value, au: s.au < e.target.value || s.au === s.du ? e.target.value : s.au })} />
                  </div>
                  <div className="compte-champ">
                    <label htmlFor={`${id}-au`}>Au</label>
                    <input id={`${id}-au`} type="date" value={s.au} min={s.du || undefined} aria-invalid={erreurs.dates ? true : undefined} onChange={(e) => maj({ au: e.target.value })} />
                  </div>
                </div>
                {erreurs.dates && <p className="compte-erreur-champ">{erreurs.dates}</p>}

                <fieldset className="agenda-groupe">
                  <legend className="agenda-etiquette">Durée</legend>
                  <div className="agenda-segments">
                    <label className={`agenda-segment${s.journee_entiere ? ' actif' : ''}`}>
                      <input type="radio" name={`${id}-duree`} className="carnet-sr" checked={s.journee_entiere} onChange={() => maj({ journee_entiere: true, heure_debut: null, heure_fin: null })} />
                      Journée entière
                    </label>
                    <label className={`agenda-segment${!s.journee_entiere ? ' actif' : ''}`}>
                      <input
                        type="radio"
                        name={`${id}-duree`}
                        className="carnet-sr"
                        checked={!s.journee_entiere}
                        onChange={() => maj({ journee_entiere: false, heure_debut: s.heure_debut ?? numeros[0] ?? 1, heure_fin: s.heure_fin ?? s.heure_debut ?? numeros[0] ?? 1 })}
                      />
                      Certaines heures
                    </label>
                  </div>
                </fieldset>
                {!s.journee_entiere && (
                  <div className="agenda-deux">
                    <div className="compte-champ">
                      <label htmlFor={`${id}-de`}>De la</label>
                      <select
                        id={`${id}-de`}
                        value={String(s.heure_debut ?? '')}
                        onChange={(e) => {
                          const v = Number(e.target.value)
                          maj({ heure_debut: v, heure_fin: s.heure_fin === null || s.heure_fin < v ? v : s.heure_fin })
                        }}
                      >
                        {numeros.map((n) => (
                          <option key={n} value={String(n)}>
                            {nomHeure(n)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="compte-champ">
                      <label htmlFor={`${id}-a`}>À la</label>
                      <select id={`${id}-a`} value={String(s.heure_fin ?? '')} aria-invalid={erreurs.heures ? true : undefined} onChange={(e) => maj({ heure_fin: Number(e.target.value) })}>
                        {numeros
                          .filter((n) => s.heure_debut === null || n >= s.heure_debut)
                          .map((n) => (
                            <option key={n} value={String(n)}>
                              {nomHeure(n)}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}
                {erreurs.heures && <p className="compte-erreur-champ">{erreurs.heures}</p>}

                {absence ? (
                  <p className="compte-aide agenda-absence-note">
                    <strong>Toutes tes classes{ecoles.length > 1 ? ' de cette école' : ''}</strong> : tes heures de cours pendant {s.journee_entiere ? 'ces journées' : 'ces heures'} sont supprimées.
                  </p>
                ) : (
                <>
                <fieldset className="agenda-groupe">
                  <legend className="agenda-etiquette">Classes concernées</legend>
                  <div className="agenda-segments">
                    <label className={`agenda-segment${s.toutes_classes ? ' actif' : ''}`}>
                      <input type="radio" name={`${id}-classes`} className="carnet-sr" checked={s.toutes_classes} onChange={() => maj({ toutes_classes: true })} />
                      Toutes
                    </label>
                    <label className={`agenda-segment${!s.toutes_classes ? ' actif' : ''}`}>
                      <input type="radio" name={`${id}-classes`} className="carnet-sr" checked={!s.toutes_classes} onChange={() => maj({ toutes_classes: false })} />
                      Certaines
                    </label>
                  </div>
                  {!s.toutes_classes && (
                    <div className="agenda-pastilles" role="group" aria-label="Classes">
                      {classesEcole.map((c) => {
                        const coche = s.classes.includes(c.id)
                        return (
                          <label key={c.id} className={`agenda-pastille${coche ? ' actif' : ''}`}>
                            <input
                              type="checkbox"
                              className="carnet-sr"
                              checked={coche}
                              onChange={() => maj({ classes: coche ? s.classes.filter((x) => x !== c.id) : [...s.classes, c.id] })}
                            />
                            {coche && <span aria-hidden="true">✓ </span>}
                            {c.nom}
                          </label>
                        )
                      })}
                      {classesEcole.length === 0 && <p className="compte-aide">Aucune classe dans cette école.</p>}
                    </div>
                  )}
                  {erreurs.classes && <p className="compte-erreur-champ">{erreurs.classes}</p>}
                </fieldset>

                <label className="agenda-accompagne">
                  <input type="checkbox" checked={s.accompagne} onChange={(e) => maj({ accompagne: e.target.checked })} />
                  <span>
                    <strong>J’accompagne</strong>
                    <span className="compte-aide">Tes cours avec les autres classes pendant {s.journee_entiere ? 'ces journées' : 'ces heures'} sont aussi supprimés.</span>
                  </span>
                </label>
                </>
                )}

                {grilles.length > 0 && (
                  <p className="agenda-resume" role="status">
                    <strong>Heures supprimées :</strong>{' '}
                    {resume ? (
                      <>
                        {resume.texte}. Rien n’est noté dans le carnet pour ces heures.
                      </>
                    ) : (
                      'aucune heure de ton horaire.'
                    )}
                  </p>
                )}
              </>
            )}
            {erreurs.ecole && <p className="compte-erreur-champ">{erreurs.ecole}</p>}

            {confirmer && initiale && (
              <div className="agenda-confirmation" role="alertdialog" aria-labelledby={`${id}-conf`} onKeyDown={clavierConfirmation}>
                <p id={`${id}-conf`}>
                  <strong>Supprimer « {titreEvenement(initiale)} » ?</strong>{' '}
                  {initiale.type === 'interrogation' ? 'L’interro disparaît de l’agenda.' : 'Les heures supprimées reviennent dans ton horaire.'}
                </p>
                <div className="agenda-confirmation-actions">
                  <button type="button" className="carnet-bouton" ref={annulerRef} onClick={() => setConfirmer(false)}>
                    Annuler
                  </button>
                  <button type="button" className="carnet-bouton agenda-danger-plein" disabled={occupe} onClick={onSupprimer}>
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="carnet-panneau-pied agenda-pied">
            <button type="submit" className="carnet-bouton principal agenda-enregistrer" disabled={occupe}>
              {interro ? 'Enregistrer l’interrogation' : 'Enregistrer'}
            </button>
            {initiale && !confirmer && (
              <button type="button" className="compte-bouton-lien agenda-supprimer" disabled={occupe} onClick={() => setConfirmer(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </svg>
                {interro ? 'Supprimer l’interrogation' : 'Supprimer l’événement'}
              </button>
            )}
          </div>
        </>
      )}
    </form>
  )
}
