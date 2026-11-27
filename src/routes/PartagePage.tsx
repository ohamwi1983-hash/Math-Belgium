import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { MenuEspace } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import '../components/compte/profil.css'
import '../components/compte/coffre.css'
import '../components/compte/partage.css'
import { dateLongue, NOMS_PROCESSUS, nombreTexte, pluriel, resumerPlan, TYPES } from '../lib/coffreResume'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { messageErreur, routeDuPlan } from '../lib/compteValidation'
import { ajouterPartage, jetonValide, lirePartage, type LecturePartage, type ModeAjout } from '../lib/partages'

/**
 * `/partage/:jeton` — lien de partage d'un enregistrement du coffre (0009, décision du 25/11/2026).
 * Réservée aux professeurs connectés (`PageReservee` : visiteur → `/connexion?retour=/partage/…`).
 * Montre titre, chapitre(s), nombre de questions, durée estimée et « partagé par … », puis « Ajouter à
 * mon coffre » : une COPIE dans les plans du professeur, avec les mêmes exercices (défaut : épreuve
 * commune entre classes parallèles) ou de nouveaux (même structure, nouveau tirage par le pipeline du
 * panneau, `lib/partageTirage.ts`, chargé à la demande). Lien arrêté / expiré / inconnu : message clair.
 */
export function PartagePage() {
  return (
    <PageCompte titre="Document partagé" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Partage />
      </PageReservee>
    </PageCompte>
  )
}

function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Document partagé" />
}

type EtatAjout = { etape: 'choix' } | { etape: 'en-cours'; mode: ModeAjout } | { etape: 'fait'; id: string; mode: ModeAjout } | { etape: 'erreur'; texte: string }

function Partage() {
  const compte = useCompte()
  const client = compte.client
  const { jeton = '' } = useParams()
  const id = useId()
  const [lecture, setLecture] = useState<LecturePartage | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [mode, setMode] = useState<ModeAjout>('memes')
  const [ajout, setAjout] = useState<EtatAjout>({ etape: 'choix' })
  /** Durée estimée et possibilité d'un nouveau tirage : calculées par le pipeline, chargé à la demande. */
  const [analyse, setAnalyse] = useState<{ duree: number | null; retirable: boolean } | null>(null)

  const lire = useCallback(async () => {
    if (!client) return
    setErreur(null)
    try {
      setLecture(jetonValide(jeton) ? await lirePartage(client, jeton) : { statut: 'inconnu' })
    } catch (ex) {
      setErreur(messageErreur(ex))
    }
  }, [client, jeton])

  useEffect(() => {
    void lire()
  }, [lire])

  const contenu = lecture?.statut === 'ok' ? lecture.contenu : null
  useEffect(() => {
    if (!contenu) return
    let annule = false
    import('../lib/partageTirage')
      .then(async (m) => {
        const [duree, retirable] = await Promise.all([m.dureeEstimeePlan(contenu).catch(() => null), Promise.resolve().then(() => m.peutRetirer(contenu)).catch(() => false)])
        if (!annule) setAnalyse({ duree, retirable })
      })
      .catch(() => !annule && setAnalyse({ duree: null, retirable: false }))
    return () => {
      annule = true
    }
  }, [contenu])

  const resume = useMemo(() => (lecture?.statut === 'ok' ? resumerPlan(lecture.contenu, lecture.type) : null), [lecture])

  if (!estConnecteActif(compte) || !client) return null

  async function ajouter() {
    if (lecture?.statut !== 'ok' || !client) return
    const choisi: ModeAjout = mode === 'nouveaux' && analyse?.retirable ? 'nouveaux' : 'memes'
    setAjout({ etape: 'en-cours', mode: choisi })
    try {
      let plan = undefined
      if (choisi === 'nouveaux') {
        const m = await import('../lib/partageTirage')
        plan = await m.nouveauTirage(lecture.contenu)
      }
      const nouvelId = await ajouterPartage(client, jeton, choisi, plan)
      setAjout({ etape: 'fait', id: nouvelId, mode: choisi })
      setLecture({ ...lecture, dejaAjoute: true })
      requestAnimationFrame(() => document.getElementById(`${id}-fait`)?.focus())
    } catch (ex) {
      setAjout({ etape: 'erreur', texte: ex instanceof Error && !('code' in ex) && ex.name === 'Error' ? ex.message : messageErreur(ex) })
    }
  }

  const titre = lecture?.statut === 'ok' ? lecture.titre : 'Lien de partage'

  return (
    <div className="coffre partage" aria-busy={lecture === null && !erreur}>
      <MenuEspace>
        <div className="coffre-contenu">
          <BandeauEspace
            titreId={`${id}-titre`}
            titre={titre}
            classe="coffre-bandeau"
            classeIcone="coffre-icone"
            icone={<IconePartage />}
            surtitre="Mes documents · document partagé"
            apresTitre={
              lecture?.statut === 'ok' ? (
                <p className="coffre-bandeau-sous-titre partage-sous-titre">
                  Partagé par {lecture.partagePar} · lien valable jusqu’au {dateLongue(lecture.expireLe)}
                </p>
              ) : undefined
            }
          />

          {erreur ? (
            <div className="compte-encadre compte-erreur" role="alert">
              <p>{erreur}</p>
              <p>
                <button type="button" className="carnet-bouton" onClick={() => void lire()}>
                  Réessayer
                </button>
              </p>
            </div>
          ) : lecture === null ? (
            <p className="compte-chargement" role="status" aria-live="polite">
              Lecture du lien de partage…
            </p>
          ) : lecture.statut !== 'ok' ? (
            <LienRefuse lecture={lecture} />
          ) : (
            <div className="partage-grille">
              <section className="profil-carte partage-carte partage-contenu" aria-labelledby={`${id}-contenu`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-contenu`}>Ce que contient le document</h2>
                  <span className={`coffre-pastille-type coffre-t-${lecture.type}`}>
                    <span className="coffre-point" aria-hidden="true" />
                    {TYPES[lecture.type].singulier}
                  </span>
                </div>
                <dl className="partage-faits">
                  <div>
                    <dt>Partagé par</dt>
                    <dd>{lecture.partagePar}</dd>
                  </div>
                  <div>
                    <dt>Niveau</dt>
                    <dd>{lecture.resume.niveau ?? resume?.niveau ?? '—'}</dd>
                  </div>
                  <div>
                    <dt>{(resume?.chapitres.length ?? 0) > 1 ? 'Chapitres' : 'Chapitre'}</dt>
                    <dd>{resume && resume.chapitres.length > 0 ? resume.chapitres.map((c) => (c.numero === null ? c.court : `Ch. ${c.numero} — ${c.court}`)).join(' · ') : (lecture.resume.chapitres ?? '—')}</dd>
                  </div>
                  <div>
                    <dt>Contenu</dt>
                    <dd>
                      {pluriel(resume?.questions.length ?? lecture.resume.questions ?? 0, 'question')}
                      {resume && !resume.sansPoints ? ` · ${nombreTexte(resume.totalFixe ?? resume.points)} pts` : resume ? ` · ${pluriel(resume.exercices, 'exercice')}` : ''}
                      {resume && resume.series.length > 1 ? ` · séries ${resume.series.join(', ')}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt>Durée estimée</dt>
                    <dd aria-live="polite">{analyse === null ? 'calcul…' : analyse.duree ? `≈ ${analyse.duree} min` : 'non disponible'}</dd>
                  </div>
                </dl>
                {resume && resume.questions.length > 0 && (
                  <ol className="coffre-questions partage-questions" aria-label="Questions (série A)">
                    {resume.questions.map((q, i) => (
                      <li key={i} className={`coffre-p${q.processus}`}>
                        <span className="coffre-numero" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span className="coffre-q-titre">
                          <span className="carnet-sr">Question {i + 1}, {NOMS_PROCESSUS[q.processus]} : </span>
                          {q.titre}
                          {q.nombre > 1 && <span className="coffre-q-nombre"> · {q.nature === 'vraiFaux' ? pluriel(q.nombre, 'affirmation') : pluriel(q.nombre, 'exercice')}</span>}
                        </span>
                        {!resume.sansPoints && <span className="coffre-mono coffre-q-points">{nombreTexte(q.points)} pts</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="profil-carte partage-carte partage-ajout" aria-labelledby={`${id}-ajout`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-ajout`}>Ajouter à mes documents</h2>
                </div>
                <div className="profil-carte-corps">
                  {ajout.etape === 'fait' ? (
                    <div className="partage-fait">
                      <p id={`${id}-fait`} className="partage-fait-titre" role="status" tabIndex={-1}>
                        <span className="profil-pastille ok">✓ Ajouté</span> Une copie est dans tes documents{ajout.mode === 'nouveaux' ? ', avec de nouveaux exercices' : ', avec les mêmes exercices'}.
                      </p>
                      <p className="coffre-note">Elle s’imprime avec ton école et ton nom. Les changements de {lecture.partagePar} ne lui parviennent pas, et inversement.</p>
                      <div className="profil-actions">
                        <Link className="carnet-bouton principal" to={`${routeDuPlan(lecture.type)}?plan=${encodeURIComponent(ajout.id)}`}>
                          Ouvrir dans le panneau
                        </Link>
                        <Link className="carnet-bouton" to={`/coffre?id=${encodeURIComponent(ajout.id)}`}>
                          Voir dans mon coffre
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      {lecture.estProprietaire && (
                        <p className="coffre-note partage-avis">C’est ton propre partage : l’ajouter en fait une copie dans tes documents. Tu gères le lien (copier, arrêter) depuis « Mes documents ».</p>
                      )}
                      {lecture.dejaAjoute && !lecture.estProprietaire && (
                        <p className="coffre-note partage-avis">Tu as déjà ajouté ce document à ton coffre : un nouvel ajout en fera une seconde copie.</p>
                      )}
                      <fieldset className="partage-modes">
                        <legend>Quels exercices ?</legend>
                        <label className={`partage-mode${mode === 'memes' ? ' choisi' : ''}`}>
                          <input type="radio" name={`${id}-mode`} value="memes" checked={mode === 'memes'} onChange={() => setMode('memes')} />
                          <span>
                            <strong>Mêmes exercices</strong>
                            <span className="partage-mode-aide">Exactement les mêmes énoncés (mêmes graines) : pour une épreuve commune entre classes parallèles.</span>
                          </span>
                        </label>
                        <label className={`partage-mode${mode === 'nouveaux' ? ' choisi' : ''}${analyse && !analyse.retirable ? ' desactive' : ''}`}>
                          <input
                            type="radio"
                            name={`${id}-mode`}
                            value="nouveaux"
                            checked={mode === 'nouveaux'}
                            disabled={!analyse?.retirable}
                            aria-describedby={`${id}-nouveaux-aide`}
                            onChange={() => setMode('nouveaux')}
                          />
                          <span>
                            <strong>Nouveaux exercices</strong>
                            <span id={`${id}-nouveaux-aide`} className="partage-mode-aide">
                              {analyse === null
                                ? 'Même structure (chapitres, variantes, points, options), nouveau tirage. Préparation…'
                                : analyse.retirable
                                  ? 'Même structure (chapitres, variantes, points, options), nouveau tirage : d’autres nombres, même difficulté.'
                                  : lecture.type === 'remediation'
                                    ? 'Indisponible pour une feuille de remédiation : elle reprend les questions d’une évaluation précise.'
                                    : 'Indisponible pour ce document : seuls les mêmes exercices peuvent être ajoutés.'}
                            </span>
                          </span>
                        </label>
                      </fieldset>
                      <p className="coffre-note">
                        Une copie va dans ton coffre : les changements de {lecture.partagePar} ne te parviennent pas, et inversement. Elle s’imprime avec ton école et ton nom.
                      </p>
                      {ajout.etape === 'erreur' && (
                        <p className="profil-message compte-erreur-champ" role="alert">
                          {ajout.texte}
                        </p>
                      )}
                      <div className="profil-actions">
                        <button type="button" className="carnet-bouton principal partage-bouton" disabled={ajout.etape === 'en-cours'} onClick={() => void ajouter()}>
                          {ajout.etape === 'en-cours' ? (ajout.mode === 'nouveaux' ? 'Nouveau tirage…' : 'Ajout…') : 'Ajouter à mes documents'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </MenuEspace>
    </div>
  )
}

/** Lien arrêté, expiré, inconnu, ou partage pas encore activé sur ce site (0009 absente). */
function LienRefuse({ lecture }: { lecture: Exclude<LecturePartage, { statut: 'ok' }> }) {
  const textes: Record<typeof lecture.statut, { titre: string; corps: string }> = {
    revoque: { titre: 'Ce partage a été arrêté', corps: 'Le collègue qui t’a envoyé ce lien a arrêté le partage. Demande-lui un nouveau lien si tu en as encore besoin.' },
    expire: {
      titre: 'Ce lien a expiré',
      corps: `Un lien de partage reste valable 30 jours${lecture.statut === 'expire' && lecture.expireLe ? ` (celui-ci jusqu’au ${dateLongue(lecture.expireLe)})` : ''}. Demande un nouveau lien au collègue qui te l’a envoyé.`,
    },
    inconnu: { titre: 'Lien de partage inconnu', corps: 'Ce lien ne correspond à aucun partage. Vérifie qu’il a été copié en entier (il se termine par 64 lettres et chiffres).' },
    absent: { titre: 'Partage pas encore activé', corps: 'Le partage entre collègues n’est pas encore activé sur ce site (migration 0009 à appliquer par l’administrateur).' },
  }
  const t = textes[lecture.statut]
  return (
    <section className="profil-carte partage-refus" role="alert" aria-labelledby="partage-refus-titre">
      <div className="profil-carte-corps">
        <h2 id="partage-refus-titre">{t.titre}</h2>
        <p>{t.corps}</p>
        <div className="profil-actions">
          <Link className="carnet-bouton principal" to="/coffre">
            Mes documents
          </Link>
          <Link className="carnet-bouton" to="/evaluation">
            Préparer une évaluation
          </Link>
        </div>
      </div>
    </section>
  )
}

function IconePartage() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  )
}
