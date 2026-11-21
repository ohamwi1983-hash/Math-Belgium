import { useId, useMemo, useState, type FormEvent } from 'react'
import { heureTexte } from '../../entrainement/export/examen'
import {
  DUREE_HEURE_MAX,
  DUREE_HEURE_MIN,
  DUREE_PAUSE_MAX,
  DUREE_PAUSE_MIN,
  HEURES_MAX,
  LIBELLE_PAUSE,
  PAUSES_MAX,
  champHeure,
  erreursGrille,
  heuresDuMercredi,
  journee,
  minutes,
  plage,
  type ErreursGrille,
  type Pause,
  type SaisieGrille,
  type TypePause,
} from '../../lib/horaire'

const DUREES_HEURE = Array.from({ length: (DUREE_HEURE_MAX - DUREE_HEURE_MIN) / 5 + 1 }, (_, i) => DUREE_HEURE_MIN + 5 * i)
const DUREES_PAUSE = Array.from({ length: (DUREE_PAUSE_MAX - DUREE_PAUSE_MIN) / 5 + 1 }, (_, i) => DUREE_PAUSE_MIN + 5 * i)

function avec(liste: number[], valeur: number): number[] {
  return liste.includes(valeur) ? liste : [...liste, valeur].sort((a, b) => a - b)
}

/**
 * Grille horaire d'UNE école : début des cours, durée d'une heure, nombre d'heures, pauses,
 * mercredi, heures corrigées à la main — avec l'aperçu de la journée calculée en direct. On ne
 * saisit jamais l'heure des pauses ni la fin des cours : elles se déduisent (règle dans
 * `lib/horaire.ts`). Champs : `type="time"` pour une heure, listes déroulantes pour le reste (jamais
 * de champ numérique, règle CLAUDE.md).
 */
export function GrilleEcole({
  ecoleNom,
  initiale,
  existe,
  occupe,
  casesHorsGrille,
  onEnregistrer,
  onAnnuler,
}: {
  ecoleNom: string
  initiale: SaisieGrille
  existe: boolean
  occupe: boolean
  /** Nombre de cases de l'horaire qui sortiraient de la grille saisie (calculé par le parent). */
  casesHorsGrille: (g: SaisieGrille) => number
  onEnregistrer: (g: SaisieGrille) => void
  onAnnuler?: () => void
}) {
  const id = useId()
  const [g, setG] = useState<SaisieGrille>(initiale)
  const [erreurs, setErreurs] = useState<ErreursGrille>({})
  const [correction, setCorrection] = useState<number | null>(null)

  // Les corrections d'heures se vérifient en direct (l'aperçu change sous les yeux).
  const enDirect = useMemo(() => erreursGrille(g), [g])
  const j = useMemo(() => journee(g), [g])
  const nMercredi = heuresDuMercredi(g)
  const jMercredi = useMemo(() => journee(g, 3), [g])
  const midi = g.pauses.find((p) => p.type === 'midi')

  function changer(partiel: Partial<SaisieGrille>) {
    setG((avant) => {
      const suivant = { ...avant, ...partiel }
      // Raccourcir la journée retire les pauses et corrections devenues impossibles.
      suivant.pauses = suivant.pauses.filter((p) => p.apres < suivant.nombre_heures)
      suivant.exceptions = suivant.exceptions.filter((x) => x.heure <= suivant.nombre_heures)
      if (suivant.heures_mercredi !== null && suivant.heures_mercredi > suivant.nombre_heures) suivant.heures_mercredi = suivant.nombre_heures
      return suivant
    })
  }

  function changerPause(i: number, p: Partial<Pause>) {
    changer({ pauses: g.pauses.map((x, k) => (k === i ? { ...x, ...p } : x)).sort((a, b) => a.apres - b.apres) })
  }

  function ajouterPause() {
    const libres = Array.from({ length: g.nombre_heures - 1 }, (_, i) => i + 1).filter((n) => !g.pauses.some((p) => p.apres === n))
    if (libres.length === 0) return
    changer({ pauses: [...g.pauses, { apres: libres[0], duree: 10, type: 'autre' as TypePause }].sort((a, b) => a.apres - b.apres) })
  }

  function corriger(heure: number, debut: string, fin: string) {
    const autres = g.exceptions.filter((x) => x.heure !== heure)
    changer({ exceptions: [...autres, { heure, debut, fin }].sort((a, b) => a.heure - b.heure) })
  }

  function envoyer(e: FormEvent) {
    e.preventDefault()
    const err = erreursGrille(g)
    setErreurs(err)
    if (Object.keys(err).length > 0) return
    const hors = casesHorsGrille(g)
    if (hors > 0 && !window.confirm(`${hors} case${hors > 1 ? 's' : ''} de ton horaire sortent de cette grille (heures supprimées) : elles seront retirées. Continuer ?`)) return
    onEnregistrer(g)
  }

  return (
    <form className="carnet-form carnet-grille-ecole" onSubmit={envoyer} noValidate aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`}>Grille horaire — {ecoleNom}</h3>
      {!existe && <p className="compte-aide">Pré-remplie avec une grille d'exemple (heures de 50 min, récréation après H2, midi après H4) : adapte-la à ton école.</p>}

      <div className="carnet-grille">
        <div className="compte-champ">
          <label htmlFor={`${id}-debut`}>Début des cours</label>
          <input id={`${id}-debut`} type="time" value={g.debut} onChange={(e) => changer({ debut: e.target.value })} aria-invalid={erreurs.debut ? true : undefined} />
          {erreurs.debut && <p className="compte-erreur-champ">{erreurs.debut}</p>}
        </div>
        <div className="compte-champ">
          <label htmlFor={`${id}-duree`}>Durée d'une heure</label>
          <select id={`${id}-duree`} value={String(g.duree_heure)} onChange={(e) => changer({ duree_heure: Number(e.target.value) })} aria-invalid={erreurs.duree ? true : undefined}>
            {avec(DUREES_HEURE, g.duree_heure).map((d) => (
              <option key={d} value={String(d)}>
                {d} min
              </option>
            ))}
          </select>
          {erreurs.duree && <p className="compte-erreur-champ">{erreurs.duree}</p>}
        </div>
        <div className="compte-champ">
          <label htmlFor={`${id}-nombre`}>Heures par jour</label>
          <select id={`${id}-nombre`} value={String(g.nombre_heures)} onChange={(e) => changer({ nombre_heures: Number(e.target.value) })} aria-invalid={erreurs.nombre ? true : undefined}>
            {Array.from({ length: HEURES_MAX }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} heure{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          {erreurs.nombre && <p className="compte-erreur-champ">{erreurs.nombre}</p>}
        </div>
      </div>

      <fieldset className="carnet-fieldset">
        <legend>Pauses</legend>
        {g.pauses.length === 0 && <p className="compte-vide">Aucune pause.</p>}
        <ul className="carnet-pauses">
          {g.pauses.map((p, i) => (
            <li key={`${p.apres}-${i}`} className="carnet-pause">
              <div className="compte-champ">
                <label htmlFor={`${id}-pause-${i}-apres`}>Après</label>
                <select id={`${id}-pause-${i}-apres`} value={String(p.apres)} onChange={(e) => changerPause(i, { apres: Number(e.target.value) })}>
                  {Array.from({ length: Math.max(1, g.nombre_heures - 1) }, (_, k) => k + 1).map((n) => (
                    <option key={n} value={String(n)} disabled={n !== p.apres && g.pauses.some((x) => x.apres === n)}>
                      H{n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="compte-champ">
                <label htmlFor={`${id}-pause-${i}-type`}>Pause</label>
                <select id={`${id}-pause-${i}-type`} value={p.type} onChange={(e) => changerPause(i, { type: e.target.value as TypePause })}>
                  {(Object.keys(LIBELLE_PAUSE) as TypePause[]).map((t) => (
                    <option key={t} value={t} disabled={t === 'midi' && p.type !== 'midi' && g.pauses.some((x) => x.type === 'midi')}>
                      {LIBELLE_PAUSE[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="compte-champ">
                <label htmlFor={`${id}-pause-${i}-duree`}>Durée</label>
                <select id={`${id}-pause-${i}-duree`} value={String(p.duree)} onChange={(e) => changerPause(i, { duree: Number(e.target.value) })}>
                  {avec(DUREES_PAUSE, p.duree).map((d) => (
                    <option key={d} value={String(d)}>
                      {d} min
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="compte-bouton-secondaire compte-danger carnet-pause-retirer" onClick={() => changer({ pauses: g.pauses.filter((_, k) => k !== i) })} aria-label={`Retirer la pause après H${p.apres}`}>
                Retirer
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="compte-bouton-secondaire" onClick={ajouterPause} disabled={g.pauses.length >= PAUSES_MAX || g.pauses.length >= g.nombre_heures - 1}>
          Ajouter une pause
        </button>
        {erreurs.pauses && <p className="compte-erreur-champ">{erreurs.pauses}</p>}
      </fieldset>

      <div className="compte-champ carnet-champ-moyen">
        <label htmlFor={`${id}-mercredi`}>Mercredi</label>
        <select
          id={`${id}-mercredi`}
          value={g.heures_mercredi === null ? '' : String(g.heures_mercredi)}
          onChange={(e) => changer({ heures_mercredi: e.target.value === '' ? null : Number(e.target.value) })}
          aria-invalid={erreurs.mercredi ? true : undefined}
        >
          <option value="">
            {midi ? `Le matin seulement (H1 → H${Math.min(midi.apres, g.nombre_heures)})` : `Comme les autres jours (${g.nombre_heures} heures)`}
          </option>
          <option value="0">Pas de cours</option>
          {Array.from({ length: g.nombre_heures }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              {n} heure{n > 1 ? 's' : ''} (H1 → H{n})
            </option>
          ))}
        </select>
        {erreurs.mercredi && <p className="compte-erreur-champ">{erreurs.mercredi}</p>}
      </div>

      <section className="carnet-apercu-journee" aria-labelledby={`${id}-apercu`}>
        <h4 id={`${id}-apercu`}>Journée calculée</h4>
        <ol className="carnet-journee">
          {j.heures.map((h) => {
            const pause = j.pauses.find((p) => p.apres === h.numero)
            return (
              <li key={h.numero} className="carnet-journee-ligne-groupe">
                <div className={`carnet-journee-ligne${h.corrigee ? ' corrigee' : ''}`}>
                  <span className="carnet-journee-num">H{h.numero}</span>
                  <span className="carnet-journee-plage">{plage(h.debut, h.fin)}</span>
                  {h.corrigee && <span className="compte-badge">corrigée</span>}
                  <button type="button" className="compte-bouton-lien carnet-journee-corriger" onClick={() => setCorrection(correction === h.numero ? null : h.numero)} aria-expanded={correction === h.numero} aria-label={`${correction === h.numero ? 'Fermer' : 'Corriger'} H${h.numero}`}>
                    {correction === h.numero ? 'Fermer' : 'Corriger'}
                  </button>
                </div>
                {correction === h.numero && (
                  <CorrectionHeure
                    idBase={`${id}-corr-${h.numero}`}
                    heure={h.numero}
                    debut={champHeure(h.debut)}
                    fin={champHeure(h.fin)}
                    corrigee={h.corrigee}
                    onAppliquer={(d, f) => {
                      corriger(h.numero, d, f)
                      setCorrection(null)
                    }}
                    onRetirer={() => changer({ exceptions: g.exceptions.filter((x) => x.heure !== h.numero) })}
                  />
                )}
                {pause && (
                  <div className="carnet-journee-ligne carnet-journee-pause">
                    <span className="carnet-journee-num">{LIBELLE_PAUSE[pause.type]}</span>
                    <span className="carnet-journee-plage">
                      {plage(pause.debut, pause.fin)} <span className="compte-compte">({pause.fin - pause.debut} min)</span>
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
        <p className="carnet-journee-fin">
          Fin des cours : <strong>{heureTexte(j.fin)}</strong>
          {' · '}Mercredi : {nMercredi === 0 ? 'pas de cours' : `H1 → H${nMercredi}, fin ${heureTexte(jMercredi.fin)}`}
        </p>
        {(enDirect.exceptions ?? erreurs.exceptions) && <p className="compte-erreur-champ">{enDirect.exceptions ?? erreurs.exceptions}</p>}
      </section>

      <div className="compte-actions">
        <button type="submit" className="compte-bouton" disabled={occupe}>
          {existe ? 'Enregistrer la grille' : 'Enregistrer cette grille'}
        </button>
        {onAnnuler && (
          <button type="button" className="compte-bouton-secondaire" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

function CorrectionHeure({
  idBase,
  heure,
  debut,
  fin,
  corrigee,
  onAppliquer,
  onRetirer,
}: {
  idBase: string
  heure: number
  debut: string
  fin: string
  corrigee: boolean
  onAppliquer: (debut: string, fin: string) => void
  onRetirer: () => void
}) {
  const [d, setD] = useState(debut)
  const [f, setF] = useState(fin)
  const dm = minutes(d)
  const fm = minutes(f)
  const erreur = dm === null || fm === null ? 'Heures illisibles.' : fm <= dm ? 'La fin doit suivre le début.' : null
  return (
    <div className="carnet-correction" role="group" aria-label={`Corriger H${heure}`}>
      <p className="compte-aide">Pour une école atypique : les heures suivantes repartiront de la fin de H{heure}.</p>
      <div className="carnet-grille carnet-grille-heures">
        <div className="compte-champ">
          <label htmlFor={`${idBase}-d`}>Début de H{heure}</label>
          <input id={`${idBase}-d`} type="time" value={d} onChange={(e) => setD(e.target.value)} />
        </div>
        <span className="carnet-fleche" aria-hidden="true">
          →
        </span>
        <div className="compte-champ">
          <label htmlFor={`${idBase}-f`}>Fin de H{heure}</label>
          <input id={`${idBase}-f`} type="time" value={f} onChange={(e) => setF(e.target.value)} />
        </div>
      </div>
      {erreur && <p className="compte-erreur-champ">{erreur}</p>}
      <div className="compte-actions">
        <button type="button" className="compte-bouton-secondaire" disabled={erreur !== null} onClick={() => onAppliquer(d, f)}>
          Appliquer
        </button>
        {corrigee && (
          <button type="button" className="compte-bouton-secondaire" onClick={onRetirer}>
            Revenir au calcul
          </button>
        )}
      </div>
    </div>
  )
}
