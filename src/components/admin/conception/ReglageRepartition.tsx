import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { estConnecteActif, type ValeurCompte } from '../../../lib/compteContexte'
import { enregistrerRepartition, lireRepartition } from '../../../lib/compteDonnees'
import { messageErreur } from '../../../lib/compteValidation'
import {
  CLES_REPARTITION,
  LIBELLE_CLE,
  PAS_REPARTITION,
  PROCESSUS_DE_CLE,
  REPARTITION_DEFAUT,
  ajusterRepartition,
  estRepartitionDefaut,
  memeRepartition,
  pourcentsRepartition,
  texteRepartition,
  type RepartitionPourcents,
} from '../../../lib/repartitionProcessus'

/**
 * Répartition Connaître / Appliquer / Transférer de « Préparer l'évaluation » (page de conception :
 * feuille d'exercices, évaluation, examen), réglable par le professeur (décision de l'utilisateur,
 * 22/11/2026) et mémorisée dans son profil (`profils.repartition`, `0005_repartition.sql`).
 *
 * - Professeur connecté : valeur lue à part du profil (`compteDonnees.ts::lireRepartition`) ; 0005
 *   pas appliquée → le réglage vaut pour la session et la carte le dit (`memo === 'absente'`).
 * - Sans compte (Supabase non configuré, `/admin` historique) : 25 / 50 / 25, réglable pour la session.
 * - L'assistant élève n'utilise JAMAIS ce réglage (`compositionEleve.ts` garde la constante).
 *
 * « Session » = tant que l'onglet reste ouvert : la valeur réglée survit au passage d'une page de
 * conception à l'autre (`/exercice` ↔ `/evaluation`, mémoire du module), pas à un rechargement.
 */

export type EtatMemoRepartition = 'sans-compte' | 'chargement' | 'active' | 'absente' | 'erreur'

let memoireSession: { cle: string; valeur: RepartitionPourcents } | null = null

export interface RepartitionProfesseur {
  valeur: RepartitionPourcents
  changer: (r: RepartitionPourcents) => void
  /** Répartition mémorisée dans le compte (défaut si rien n'est mémorisé ou sans compte). */
  enregistree: RepartitionPourcents
  memo: EtatMemoRepartition
  erreur: string | null
  enCours: boolean
  /** Dernier enregistrement réussi (message « Enregistrée »), remis à zéro au changement suivant. */
  vientDEnregistrer: boolean
  enregistrer: () => Promise<void>
}

export function useRepartitionProfesseur(compte: ValeurCompte): RepartitionProfesseur {
  const connecte = estConnecteActif(compte)
  const client = connecte ? compte.client : null
  const id = connecte ? compte.profil.id : null
  const cle = id ?? 'sans-compte'
  const [valeur, setValeur] = useState<RepartitionPourcents>(() => (memoireSession?.cle === cle ? memoireSession.valeur : REPARTITION_DEFAUT))
  const [enregistree, setEnregistree] = useState<RepartitionPourcents>(REPARTITION_DEFAUT)
  const [memo, setMemo] = useState<EtatMemoRepartition>(connecte ? 'chargement' : 'sans-compte')
  const [erreur, setErreur] = useState<string | null>(null)
  const [enCours, setEnCours] = useState(false)
  const [vientDEnregistrer, setVientDEnregistrer] = useState(false)
  const modifieeDansLaSession = useRef(memoireSession?.cle === cle)

  useEffect(() => {
    // Changement de compte (connexion / déconnexion) : on repart de la mémoire de CE compte.
    modifieeDansLaSession.current = memoireSession?.cle === cle
    setValeur(memoireSession?.cle === cle ? memoireSession.valeur : REPARTITION_DEFAUT)
    setEnregistree(REPARTITION_DEFAUT)
    setErreur(null)
    setVientDEnregistrer(false)
    if (!client || !id) {
      setMemo('sans-compte')
      return
    }
    let annule = false
    setMemo('chargement')
    lireRepartition(client, id)
      .then((lu) => {
        if (annule) return
        if (!lu.actif) {
          setMemo('absente')
          return
        }
        const r = lu.repartition ?? REPARTITION_DEFAUT
        setEnregistree(r)
        if (!modifieeDansLaSession.current) setValeur(r)
        setMemo('active')
      })
      .catch((e: unknown) => {
        if (annule) return
        setErreur(messageErreur(e))
        setMemo('erreur')
      })
    return () => {
      annule = true
    }
  }, [client, id, cle])

  const changer = useCallback(
    (r: RepartitionPourcents) => {
      memoireSession = { cle, valeur: r }
      modifieeDansLaSession.current = true
      setValeur(r)
      setVientDEnregistrer(false)
      setErreur(null)
    },
    [cle],
  )

  const enregistrer = useCallback(async () => {
    if (!client || !id) return
    setEnCours(true)
    setErreur(null)
    try {
      const ok = await enregistrerRepartition(client, id, valeur)
      if (!ok) {
        setMemo('absente')
        return
      }
      setEnregistree(valeur)
      setMemo('active')
      setVientDEnregistrer(true)
    } catch (e) {
      setErreur(messageErreur(e))
    } finally {
      setEnCours(false)
    }
  }, [client, id, valeur])

  return { valeur, changer, enregistree, memo, erreur, enCours, vientDEnregistrer, enregistrer }
}

/** Texte « Modifier » de la carte : état de la mémorisation, une ligne. */
export function noteCarteRepartition(rp: RepartitionProfesseur): string | null {
  if (rp.memo === 'active' && !memeRepartition(rp.valeur, rp.enregistree)) return 'réglée pour cette session'
  if (rp.memo === 'active' && !estRepartitionDefaut(rp.valeur)) return 'ta répartition'
  if ((rp.memo === 'sans-compte' || rp.memo === 'absente' || rp.memo === 'erreur') && !estRepartitionDefaut(rp.valeur)) return 'réglée pour cette session'
  return null
}

export function ReglageRepartition({
  rp,
  connecte,
  dureeCible,
  onPreparer,
  onFermer,
}: {
  rp: RepartitionProfesseur
  connecte: boolean
  /** Durée visée de « Préparer l'évaluation » (minutes), pour l'aide « ≈ m min ». */
  dureeCible: number
  onPreparer: () => void
  onFermer: () => void
}) {
  const { valeur } = rp
  const titre = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    titre.current?.focus()
  }, [])
  const surTouche = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onFermer()
    }
  }
  const differenteDuCompte = rp.memo === 'active' && !memeRepartition(valeur, rp.enregistree)
  return (
    <div className="conc-rep" id="conc-rep" role="group" aria-labelledby="conc-rep-titre" onKeyDown={surTouche}>
      <p className="conc-rep-titre" id="conc-rep-titre" ref={titre} tabIndex={-1}>
        Répartition de « Préparer l’évaluation »
      </p>
      <p className="conc-rep-aide">
        Temps (et donc points) donné à chaque compétence. Appliquer compense : le total reste toujours 100 %. Une compétence à 0 % n’est jamais choisie.
      </p>
      <div className="conc-rep-barre" aria-hidden="true">
        {CLES_REPARTITION.map((c) =>
          valeur[c] > 0 ? (
            <span key={c} className={`conc-rep-seg conc-rep-seg-${PROCESSUS_DE_CLE[c]}`} style={{ flexGrow: valeur[c] }}>
              {valeur[c] >= 12 ? `${valeur[c]} %` : ''}
            </span>
          ) : null,
        )}
      </div>
      <ul className="conc-rep-lignes">
        {CLES_REPARTITION.map((c) => {
          const moins = ajusterRepartition(valeur, c, -PAS_REPARTITION)
          const plus = ajusterRepartition(valeur, c, PAS_REPARTITION)
          return (
            <li key={c} className="conc-rep-ligne">
              <span className="conc-rep-nom">
                <span className={`conc-pc conc-pc-${PROCESSUS_DE_CLE[c]}`} aria-hidden="true">
                  {PROCESSUS_DE_CLE[c]}
                </span>
                <span className="conc-rep-libelle">
                  {LIBELLE_CLE[c]}
                  <span className="conc-rep-min">≈ {Math.round((dureeCible * valeur[c]) / 100)} min</span>
                </span>
              </span>
              <span className="conc-rep-reglage">
                <button type="button" className="conc-rep-btn" disabled={!moins} aria-label={`Diminuer ${LIBELLE_CLE[c]} de ${PAS_REPARTITION} %`} onClick={() => moins && rp.changer(moins)}>
                  −
                </button>
                <span className="conc-rep-valeur">{valeur[c]} %</span>
                <button type="button" className="conc-rep-btn" disabled={!plus} aria-label={`Augmenter ${LIBELLE_CLE[c]} de ${PAS_REPARTITION} %`} onClick={() => plus && rp.changer(plus)}>
                  +
                </button>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="conc-rep-total" aria-live="polite">
        Total : <b>100 %</b> ✓ <span className="sr-only">— {texteRepartition(false, valeur)}</span>
      </p>
      <div className="conc-rep-actions">
        <button type="button" className="conc-bouton conc-bouton-principal" onClick={onPreparer}>
          Préparer avec {texteRepartition(true, valeur)}
        </button>
        <button type="button" className="conc-bouton" disabled={estRepartitionDefaut(valeur)} onClick={() => rp.changer({ ...REPARTITION_DEFAUT })}>
          Revenir à {pourcentsRepartition(REPARTITION_DEFAUT).join(' / ')}
        </button>
        {connecte && (
          <button
            type="button"
            className="conc-bouton"
            disabled={rp.enCours || rp.memo === 'chargement' || (rp.memo === 'active' && !differenteDuCompte)}
            onClick={() => void rp.enregistrer()}
          >
            {rp.enCours ? 'Enregistrement…' : 'Enregistrer comme ma répartition'}
          </button>
        )}
        <button type="button" className="conc-bouton conc-bouton-discret" onClick={onFermer}>
          Fermer
        </button>
      </div>
      <div className="conc-rep-etat" role="status">
        {rp.erreur ? (
          <p className="conc-rep-alerte">{rp.erreur}</p>
        ) : !connecte ? (
          <p>Sans compte connecté, ce réglage vaut pour cette session seulement.</p>
        ) : rp.memo === 'chargement' ? (
          <p>Lecture de ta répartition…</p>
        ) : rp.memo === 'absente' ? (
          <p className="conc-rep-alerte">
            Mémorisation pas encore activée : colle le fichier <code>0005_repartition.sql</code> dans l’éditeur SQL de Supabase (SQL Editor → coller tout le fichier → Run). En attendant, ce réglage vaut pour cette session.
          </p>
        ) : rp.vientDEnregistrer ? (
          <p className="conc-rep-ok">✓ Enregistrée : {texteRepartition(false, rp.enregistree)} sera proposée à chaque fois.</p>
        ) : differenteDuCompte ? (
          <p>Pas encore enregistrée : ta répartition mémorisée est {texteRepartition(false, rp.enregistree)}.</p>
        ) : (
          <p>
            ✓ C’est ta répartition{estRepartitionDefaut(rp.enregistree) ? ' (celle par défaut)' : ' enregistrée'}.
          </p>
        )}
      </div>
    </div>
  )
}
