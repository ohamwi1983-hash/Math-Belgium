import { useId, useState } from 'react'
import { findChapter } from '../../content/chaptersIndex'
import { dateCourteJour } from '../../lib/agendaEvenements'
import type { Classe, Seance } from '../../lib/carnet'
import {
  CLES_RUBRIQUES,
  COMPETENCES_MAX,
  COMPETENCES_TRANSVERSALES_DEFAUT,
  erreurCompetence,
  essentielsDesParties,
  htmlAgenda,
  LIBELLE_RUBRIQUE,
  objectifPropose,
  texteAgenda,
  type CleRubrique,
  type Rubriques,
} from '../../lib/carnetDevoirs'
import { OBJECTIF_MAX } from '../../lib/carnet'
import { donneesTexte, useCarnet } from './contexteCarnet'
import { MessageDevoirsInactif } from './FormulaireSeance'
import { copierTexte } from './outilsCarnet'
import { useTableProcessus } from './processusCarnet'

/**
 * Panneau « Texte pour l'agenda scolaire » d'une séance (maquette du 24/11/2026) : le texte à coller
 * dans Smartschool à gauche (aperçu exact du texte brut), « Ce que contient le texte » à droite —
 * rubriques activables (mémorisées dans les réglages du professeur dès qu'on les change, 0007),
 * objectif de la séance PROPOSÉ d'après les titres des parties cochées et modifiable (jamais présenté
 * comme venant du programme), compétences transversales de la séance (puces de la liste du
 * professeur) — puis « Copier pour Smartschool » (texte + HTML ; objectif et compétences enregistrés
 * avec la séance). Sans 0007 : tout marche pour la copie, rien n'est mémorisé.
 */
export function TexteAgenda({
  seance,
  classe,
  titreId,
  onFermer,
  onRubriques,
  onEnregistrerSeance,
}: {
  seance: Seance
  classe: Classe
  titreId: string
  onFermer: () => void
  /** Rubriques changées : mémorisées (0007). */
  onRubriques: (r: Rubriques) => void
  /** Objectif ou compétences changés au moment de copier : enregistrés avec la séance (0007). */
  onEnregistrerSeance: (valeurs: { objectif: string; competences: string[] }) => void
}) {
  const id = useId()
  const ctx = useCarnet()
  useTableProcessus()
  const chapitre = findChapter(seance.niveau, seance.chapitre)
  const [rubriques, setRubriques] = useState<Rubriques>(ctx.texte.rubriques)
  const propose = objectifPropose(seance.parties, chapitre)
  const [objectif, setObjectif] = useState(seance.objectif?.trim() ? seance.objectif : propose)
  const liste = ctx.texte.competences
  const [transversales, setTransversales] = useState<string[]>(seance.competences ?? [])
  const [copie, setCopie] = useState<'ok' | 'echec' | null>(null)
  const essentiels = essentielsDesParties(seance.parties, chapitre)
  const d = donneesTexte(ctx, seance, classe, { objectif, transversales: ordonner(transversales, liste) })
  const texte = texteAgenda(d, rubriques)
  const objectifTropLong = objectif.length > OBJECTIF_MAX
  // Compétences cochées qui ne sont plus dans la liste (renommées ou retirées depuis) : gardées, affichées.
  const horsListe = transversales.filter((t) => !liste.includes(t))

  function basculerRubrique(c: CleRubrique) {
    const r = { ...rubriques, [c]: !rubriques[c] }
    setRubriques(r)
    onRubriques(r)
  }

  function basculerCompetence(t: string) {
    setTransversales((avant) => (avant.includes(t) ? avant.filter((x) => x !== t) : [...avant, t]))
  }

  async function copier() {
    const ok = await copierTexte(texte, htmlAgenda(d, rubriques))
    setCopie(ok ? 'ok' : 'echec')
    const objectifPropre = objectif.replace(/\s+/g, ' ').trim()
    const competences = ordonner(transversales, liste)
    if (ctx.devoirs && !objectifTropLong && (objectifPropre !== (seance.objectif ?? '').trim() || competences.join('|') !== (seance.competences ?? []).join('|'))) onEnregistrerSeance({ objectif: objectifPropre, competences })
  }

  return (
    <div className="carnet-texte-agenda">
      <div className="carnet-panneau-tete">
        <div className="carnet-panneau-titres">
          <h2 id={titreId}>
            Texte pour l’agenda scolaire · {classe.nom} · {dateCourteJour(seance.date_seance)}
          </h2>
          <p className="carnet-panneau-resume">À coller dans le journal de classe ou un message Smartschool. Ta remarque privée n’est jamais copiée.</p>
        </div>
        <button type="button" className="carnet-bouton carnet-fermer" aria-label="Fermer" onClick={onFermer}>
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="carnet-panneau-corps carnet-texte-corps">
        <div className="carnet-texte-colonnes">
          <section className="carnet-texte-apercu" aria-label="Texte qui sera copié">
            <pre className="carnet-texte-pre">{texte}</pre>
          </section>
          <section className="carnet-texte-options" aria-labelledby={`${id}-options`}>
            <h3 id={`${id}-options`}>Ce que contient le texte</h3>
            {!ctx.devoirs && <MessageDevoirsInactif quoi="La mémorisation des rubriques, de l’objectif et des compétences" />}
            <div className="carnet-texte-rubriques">
              {CLES_RUBRIQUES.map((c) => (
                <label key={c} className="carnet-texte-rubrique">
                  <input type="checkbox" checked={rubriques[c]} onChange={() => basculerRubrique(c)} />
                  <span>
                    <span className="carnet-texte-rubrique-nom">{LIBELLE_RUBRIQUE[c].titre}</span>
                    {LIBELLE_RUBRIQUE[c].aide && <span className="carnet-texte-rubrique-aide">{LIBELLE_RUBRIQUE[c].aide}</span>}
                  </span>
                </label>
              ))}
            </div>
            {rubriques.processus && d.processus.length === 0 && (
              <p className="compte-aide carnet-texte-note">Processus : aucun exercice de cette séance n’est rangé dans la table des processus (Connaître / Appliquer / Transférer) — la ligne est omise.</p>
            )}

            {rubriques.objectif && (
              <div className="compte-champ carnet-texte-objectif">
                <label htmlFor={`${id}-objectif`}>Objectif de la séance</label>
                <textarea id={`${id}-objectif`} rows={3} value={objectif} onChange={(e) => setObjectif(e.target.value)} aria-invalid={objectifTropLong ? true : undefined} aria-describedby={`${id}-objectif-aide`} />
                <p className="compte-aide" id={`${id}-objectif-aide`}>
                  {propose
                    ? 'Phrase proposée d’après les titres des parties cochées (pas tirée du programme) : reformule-la avant de copier. Vide : la rubrique n’apparaît pas.'
                    : 'Aucune partie cochée : écris l’objectif toi-même, ou laisse vide (la rubrique n’apparaît pas).'}
                </p>
                {objectifTropLong && <p className="compte-erreur-champ">{OBJECTIF_MAX} caractères au maximum : il ne sera pas enregistré tel quel.</p>}
                {propose && objectif !== propose && (
                  <button type="button" className="compte-bouton-lien" onClick={() => setObjectif(propose)}>
                    Reprendre la phrase proposée
                  </button>
                )}
                {essentiels.length > 0 && (
                  <details className="carnet-details-discret">
                    <summary>L’essentiel de l’étape, pour t’aider à reformuler</summary>
                    <ul className="carnet-texte-essentiel">
                      {essentiels.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {rubriques.transversales && (
              <div className="carnet-texte-competences">
                <h4 id={`${id}-comp`}>Compétences transversales de cette séance</h4>
                {liste.length === 0 && horsListe.length === 0 ? (
                  <p className="compte-aide">Ta liste est vide : ajoute tes compétences dans les Réglages du carnet.</p>
                ) : (
                  <ul className="carnet-texte-puces" aria-labelledby={`${id}-comp`}>
                    {[...liste, ...horsListe].map((t) => {
                      const on = transversales.includes(t)
                      return (
                        <li key={t}>
                          <button type="button" className={`carnet-puce-competence${on ? ' on' : ''}`} aria-pressed={on} onClick={() => basculerCompetence(t)}>
                            {on && <span aria-hidden="true">✓</span>}
                            {t}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
                {transversales.length > 3 && <p className="compte-aide">Conseil : 1 à 3 compétences par séance restent lisibles.</p>}
              </div>
            )}

            <button type="button" className="carnet-bouton principal carnet-bouton-large carnet-texte-copier" onClick={() => void copier()} data-autofocus>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              Copier pour Smartschool
            </button>
            {copie === 'ok' && (
              <p className="compte-message carnet-copie" role="status">
                Copié : colle-le dans Smartschool (journal de classe ou message).
              </p>
            )}
            {copie === 'echec' && (
              <div className="carnet-copie" role="status">
                <p className="compte-aide">Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.</p>
                <textarea className="carnet-texte-copie" readOnly rows={8} value={texte} onFocus={(e) => e.currentTarget.select()} aria-label="Texte pour l’agenda scolaire" />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

/** Compétences cochées dans l'ordre de la liste du professeur (celles hors liste à la fin). */
function ordonner(cochees: string[], liste: string[]): string[] {
  return [...liste.filter((t) => cochees.includes(t)), ...cochees.filter((t) => !liste.includes(t))]
}

/**
 * Réglages du carnet → « Texte pour l'agenda scolaire » : rubriques activées par défaut et liste des
 * compétences transversales (renommer, ajouter, retirer, revenir à la liste proposée). La liste
 * proposée n'est PAS une liste officielle : à adapter au programme de l'école (FESeC, WBE…).
 */
export function ReglagesTexteAgenda({ actif, rubriques, competences, occupe, onRubriques, onCompetences }: { actif: boolean; rubriques: Rubriques; competences: string[]; occupe: boolean; onRubriques: (r: Rubriques) => void; onCompetences: (liste: string[]) => void }) {
  const id = useId()
  const [edition, setEdition] = useState<{ index: number; valeur: string; erreur: string | null } | null>(null)
  const [nouvelle, setNouvelle] = useState('')
  const [erreurNouvelle, setErreurNouvelle] = useState<string | null>(null)
  const parDefaut = competences.length === COMPETENCES_TRANSVERSALES_DEFAUT.length && competences.every((c, i) => c === COMPETENCES_TRANSVERSALES_DEFAUT[i])

  function renommer() {
    if (!edition) return
    const autres = competences.filter((_, i) => i !== edition.index)
    const erreur = erreurCompetence(edition.valeur, autres)
    if (erreur) return setEdition({ ...edition, erreur })
    const liste = [...competences]
    liste[edition.index] = edition.valeur.replace(/\s+/g, ' ').trim()
    onCompetences(liste)
    setEdition(null)
  }

  function ajouter() {
    const erreur = competences.length >= COMPETENCES_MAX ? `${COMPETENCES_MAX} compétences au maximum.` : erreurCompetence(nouvelle, competences)
    setErreurNouvelle(erreur)
    if (erreur) return
    onCompetences([...competences, nouvelle.replace(/\s+/g, ' ').trim()])
    setNouvelle('')
  }

  return (
    <fieldset className="carnet-fieldset carnet-reglages-texte">
      <legend>Texte pour l’agenda scolaire</legend>
      {!actif ? (
        <MessageDevoirsInactif quoi="Les rubriques mémorisées et ta liste de compétences transversales" />
      ) : (
        <>
          <p className="compte-aide">Rubriques du texte « Copier pour Smartschool », pour toutes tes séances (modifiables aussi au moment de copier).</p>
          <div className="carnet-texte-rubriques">
            {CLES_RUBRIQUES.map((c) => (
              <label key={c} className="carnet-texte-rubrique">
                <input type="checkbox" checked={rubriques[c]} disabled={occupe} onChange={() => onRubriques({ ...rubriques, [c]: !rubriques[c] })} />
                <span>
                  <span className="carnet-texte-rubrique-nom">{LIBELLE_RUBRIQUE[c].titre}</span>
                  {LIBELLE_RUBRIQUE[c].aide && <span className="carnet-texte-rubrique-aide">{LIBELLE_RUBRIQUE[c].aide}</span>}
                </span>
              </label>
            ))}
          </div>
          <h3 className="carnet-reglages-sous-titre" id={`${id}-liste`}>
            Mes compétences transversales
          </h3>
          <p className="compte-aide">
            Intitulés proposés pour démarrer, <strong>pas une liste officielle</strong> : renomme-les, complète ou retire-les selon le programme de ton école (FESeC, WBE…).
          </p>
          {competences.length === 0 && <p className="compte-vide">Liste vide : la rubrique « Compétences transversales » n’apparaîtra pas.</p>}
          <ul className="carnet-liste-competences" aria-labelledby={`${id}-liste`}>
            {competences.map((c, i) =>
              edition?.index === i ? (
                <li key={`e-${i}`} className="carnet-competence-edition">
                  <div className="compte-champ">
                    <label htmlFor={`${id}-ren-${i}`}>Nouvel intitulé</label>
                    <input
                      id={`${id}-ren-${i}`}
                      value={edition.valeur}
                      autoFocus
                      aria-invalid={edition.erreur ? true : undefined}
                      onChange={(e) => setEdition({ ...edition, valeur: e.target.value, erreur: null })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          renommer()
                        } else if (e.key === 'Escape') {
                          e.preventDefault()
                          e.stopPropagation()
                          setEdition(null)
                        }
                      }}
                    />
                    {edition.erreur && <p className="compte-erreur-champ">{edition.erreur}</p>}
                  </div>
                  <div className="carnet-competence-actions">
                    <button type="button" className="carnet-bouton principal" disabled={occupe} onClick={renommer}>
                      Enregistrer
                    </button>
                    <button type="button" className="carnet-bouton" onClick={() => setEdition(null)}>
                      Annuler
                    </button>
                  </div>
                </li>
              ) : (
                <li key={c}>
                  <span className="carnet-competence-nom">{c}</span>
                  <span className="carnet-competence-actions">
                    <button type="button" className="carnet-bouton" disabled={occupe} onClick={() => setEdition({ index: i, valeur: c, erreur: null })}>
                      Renommer<span className="carnet-sr"> « {c} »</span>
                    </button>
                    <button type="button" className="carnet-bouton" disabled={occupe} onClick={() => onCompetences(competences.filter((_, k) => k !== i))}>
                      Retirer<span className="carnet-sr"> « {c} »</span>
                    </button>
                  </span>
                </li>
              ),
            )}
          </ul>
          <div className="carnet-competence-ajout">
            <div className="compte-champ">
              <label htmlFor={`${id}-nouvelle`}>Ajouter une compétence</label>
              <input
                id={`${id}-nouvelle`}
                value={nouvelle}
                placeholder="Ex. : Modéliser une situation"
                aria-invalid={erreurNouvelle ? true : undefined}
                onChange={(e) => {
                  setNouvelle(e.target.value)
                  setErreurNouvelle(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    ajouter()
                  }
                }}
              />
              {erreurNouvelle && <p className="compte-erreur-champ">{erreurNouvelle}</p>}
            </div>
            <button type="button" className="carnet-bouton" disabled={occupe} onClick={ajouter}>
              Ajouter
            </button>
          </div>
          {!parDefaut && (
            <button type="button" className="compte-bouton-lien" disabled={occupe} onClick={() => onCompetences([...COMPETENCES_TRANSVERSALES_DEFAUT])}>
              Revenir à la liste proposée
            </button>
          )}
        </>
      )}
    </fieldset>
  )
}
