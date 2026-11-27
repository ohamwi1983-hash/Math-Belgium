import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import type { DonneesEspace } from '../../lib/espaceProfesseur'
import { useOrdreChapitres } from '../../lib/ordreChapitres'
import {
  avancement,
  etapesPremiersPas,
  evaluationAnnoncee,
  EVENEMENT_PREMIERS_PAS,
  masquerPremiersPas,
  ordrePasse,
  passerOrdre,
  premiersPasMasques,
  projectionLancee,
} from '../../lib/premiersPas'
import './premiers-pas.css'

/** Re-rendu quand un repère local change (cet onglet : événement maison ; autres onglets : `storage`). */
function abonner(f: () => void): () => void {
  const surStockage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith('espace:')) f()
  }
  window.addEventListener(EVENEMENT_PREMIERS_PAS, f)
  window.addEventListener('storage', surStockage)
  return () => {
    window.removeEventListener(EVENEMENT_PREMIERS_PAS, f)
    window.removeEventListener('storage', surStockage)
  }
}

function useReperesLocaux(uid: string): { masque: boolean; ordrePasse: boolean; projection: boolean } {
  // Une chaîne (valeur stable pour `useSyncExternalStore`), relue à chaque changement.
  const brut = useSyncExternalStore(
    abonner,
    () => `${premiersPasMasques(uid) ? 1 : 0}${ordrePasse(uid) ? 1 : 0}${projectionLancee() ? 1 : 0}`,
    () => '000',
  )
  return { masque: brut[0] === '1', ordrePasse: brut[1] === '1', projection: brut[2] === '1' }
}

/**
 * Carte « Premiers pas » du tableau de bord (maquette « premiers » du 27/11/2026) : six étapes cochées
 * d'après les données réelles (`lib/premiersPas.ts`), barre « n sur 6 », le bouton principal sur la
 * première étape à faire, un bouton discret sur les autres, « Passer cette étape » pour l'ordre des
 * chapitres (facultatif), « Masquer » (mémorisé, réaffichable depuis Réglages). Rien tant que les données
 * ne sont pas lues (pas de clignotement) ; rien quand tout est fait.
 */
export function CartePremiersPas({ donnees, ecoles, uid }: { donnees: DonneesEspace | null; ecoles: number; uid: string }) {
  const id = useId()
  const ordre = useOrdreChapitres()
  const reperes = useReperesLocaux(uid)
  const [vientDeMasquer, setVientDeMasquer] = useState(false)
  const note = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (vientDeMasquer) note.current?.focus()
  }, [vientDeMasquer])

  if (!donnees || ordre.etat === 'chargement') return null
  if (reperes.masque) {
    return vientDeMasquer ? (
      <p className="pp-masque-note" ref={note} tabIndex={-1} role="status">
        Premiers pas masqués. Tu peux les réafficher dans <Link to="/profil#premiers-pas">Réglages</Link>.
      </p>
    ) : null
  }

  const horaireSaisi = donnees.horaire.actif && donnees.horaire.grilles.some((g) => donnees.horaire.cases.some((c) => c.ecole_id === g.ecole_id))
  const etapes = etapesPremiersPas({
    ecoles,
    classes: donnees.classes,
    horaireSaisi,
    ordreEnregistre: ordre.etat === 'active' && ordre.ordre !== null,
    ordrePasse: reperes.ordrePasse,
    projectionLancee: reperes.projection,
    evaluationAnnoncee: evaluationAnnoncee(donnees.agenda.actif ? donnees.agenda.evenements : [], donnees.seances),
  })
  const { faites, total, courante, fini } = avancement(etapes)
  if (fini) return null

  return (
    <section className="ep-carte pp" aria-labelledby={`${id}-titre`}>
      <div className="pp-tete">
        <h2 id={`${id}-titre`}>Premiers pas</h2>
        <div
          className="pp-barre"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={faites}
          aria-valuetext={`${faites} étape${faites > 1 ? 's' : ''} faite${faites > 1 ? 's' : ''} sur ${total}`}
          aria-labelledby={`${id}-titre`}
        >
          <i style={{ width: `${(faites / total) * 100}%` }} />
        </div>
        <span className="pp-compte">
          {faites} sur {total}
          <span className="pp-compte-detail"> · environ 10&nbsp;minutes en tout</span>
        </span>
        <button
          type="button"
          className="ep-bouton pp-masquer"
          onClick={() => {
            setVientDeMasquer(true)
            masquerPremiersPas(uid, true)
          }}
        >
          Masquer<span className="carnet-sr"> les premiers pas</span>
        </button>
      </div>
      <p className="pp-intro">Six réglages pour que le site travaille pour toi. Chaque étape ouvre le bon écran ; tu reviens ici ensuite.</p>
      <ol className="pp-etapes">
        {etapes.map((e) => {
          const enCours = courante?.cle === e.cle
          return (
            <li key={e.cle} className={`pp-etape${e.fait ? ' fait' : ''}${enCours ? ' courante' : ''}`} aria-current={enCours ? 'step' : undefined}>
              <span className="pp-num" aria-hidden="true">
                {e.fait ? '✓' : e.numero}
              </span>
              <div className="pp-etape-corps">
                <h3 className="pp-etape-titre">
                  <span className="carnet-sr">Étape {e.numero} : </span>
                  {e.titre}
                  {e.fait && <span className="carnet-sr"> — fait</span>}
                </h3>
                <p className="pp-etape-phrase">{e.phrase}</p>
                {!e.fait && (
                  <p className="pp-etape-actions">
                    <Link className={`ep-bouton${enCours ? ' principal' : ' pp-secondaire'}`} to={e.action.to}>
                      {e.action.libelle} <span aria-hidden="true">›</span>
                    </Link>
                    {e.cle === 'ordre' && (
                      <button type="button" className="pp-passer" onClick={() => passerOrdre(uid)}>
                        Passer cette étape
                      </button>
                    )}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="carnet-sr" aria-live="polite">
        {faites} étape{faites > 1 ? 's' : ''} sur {total} faite{faites > 1 ? 's' : ''}.
      </p>
    </section>
  )
}

/** Ligne de Réglages : « Premiers pas masqués — Réafficher sur le tableau de bord » (rien s'ils sont visibles). */
export function ReafficherPremiersPas({ uid }: { uid: string }) {
  const reperes = useReperesLocaux(uid)
  const id = useId()
  const [fait, setFait] = useState(false)
  if (!reperes.masque && !fait) return null
  return (
    <section className="profil-carte ep-ancre" id="premiers-pas" aria-labelledby={`${id}-titre`}>
      <div className="profil-carte-tete">
        <h2 id={`${id}-titre`}>Premiers pas</h2>
      </div>
      <div className="profil-carte-corps">
        {reperes.masque ? (
          <>
            <p className="profil-intro">Tu as masqué la carte « Premiers pas » du tableau de bord (six réglages de départ, cochés tout seuls quand c'est fait).</p>
            <div className="profil-actions">
              <button
                type="button"
                className="carnet-bouton"
                onClick={() => {
                  setFait(true)
                  masquerPremiersPas(uid, false)
                }}
              >
                Réafficher sur le tableau de bord
              </button>
            </div>
          </>
        ) : (
          <p className="profil-intro" role="status">
            C'est fait : la carte « Premiers pas » est de retour sur le <Link to="/espace">tableau de bord</Link> (tant qu'il reste une étape à faire).
          </p>
        )}
      </div>
    </section>
  )
}

