import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { definirActif, genererCodes, listerInvitations, listerProfesseurs, revoquerCode, type Invitation, type Professeur } from '../lib/compteDonnees'
import { finDeJournee, formaterCode, lireEntier, messageErreur } from '../lib/compteValidation'

function dateCourte(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

function dansJours(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function etatInvitation(i: Invitation): { libelle: string; classe: string } {
  if (i.utilise_le) return { libelle: `utilisé le ${dateCourte(i.utilise_le)} par ${i.utilise_par_nom ?? i.utilise_par_email ?? 'un compte supprimé'}`, classe: 'utilise' }
  if (i.revoque) return { libelle: 'révoqué', classe: 'revoque' }
  if (i.expire_le && new Date(i.expire_le).getTime() <= Date.now()) return { libelle: `expiré le ${dateCourte(i.expire_le)}`, classe: 'expire' }
  return { libelle: i.expire_le ? `valide jusqu'au ${dateCourte(i.expire_le)}` : 'valide (sans expiration)', classe: 'valide' }
}

/**
 * Page `/admin` quand les comptes sont configurés (réservée à `profils.est_admin`, garde
 * `PageReservee admin`) : codes d'invitation (générer, révoquer, voir qui les a utilisés) et
 * professeurs (liste, désactiver / réactiver). Le panneau de conception est sur `/evaluation`.
 */
export function AdminComptes() {
  const compte = useCompte()
  const client = compte.client
  const [invitations, setInvitations] = useState<Invitation[] | null>(null)
  const [professeurs, setProfesseurs] = useState<Professeur[] | null>(null)
  const [nombre, setNombre] = useState('1')
  const [expiration, setExpiration] = useState(() => dansJours(30))
  const [note, setNote] = useState('')
  const [erreurNombre, setErreurNombre] = useState<string | null>(null)
  const [nouveaux, setNouveaux] = useState<Invitation[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)

  const recharger = useCallback(async () => {
    if (!client) return
    try {
      const [i, p] = await Promise.all([listerInvitations(client), listerProfesseurs(client)])
      setInvitations(i)
      setProfesseurs(p)
    } catch (ex) {
      setErreur(messageErreur(ex))
    }
  }, [client])

  useEffect(() => {
    void recharger()
  }, [recharger])

  if (!estConnecteActif(compte) || !client) return null

  async function agir(action: () => Promise<unknown>, succes: string) {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      await action()
      await recharger()
      setMessage(succes)
    } catch (ex) {
      setErreur(messageErreur(ex))
    } finally {
      setOccupe(false)
    }
  }

  async function generer(e: FormEvent) {
    e.preventDefault()
    const n = lireEntier(nombre)
    const err = n === null || n < 1 || n > 50 ? 'Nombre de codes : un nombre entier entre 1 et 50.' : null
    const expireLe = expiration.trim() ? finDeJournee(expiration) : null
    const errDate = expiration.trim() && !expireLe ? "Date d'expiration illisible." : null
    setErreurNombre(err ?? errDate)
    if (err || errDate || n === null || !client) return
    await agir(async () => setNouveaux(await genererCodes(client, n, expireLe, note)), `${n} code${n > 1 ? 's générés' : ' généré'}.`)
  }

  const lienInvitation = (code: string) => `${window.location.origin}/inscription?code=${formaterCode(code)}`

  return (
    <div className="compte-sections">
      <p className="compte-intro">
        Concevoir une évaluation : <Link to="/evaluation">panneau des évaluations et examens</Link> · <Link to="/exercice">feuilles d'exercices</Link>.
      </p>
      {(message || erreur) && (
        <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
          {erreur ?? message}
        </p>
      )}

      <section className="compte-section" aria-labelledby="admin-generer">
        <h2 id="admin-generer">Générer des codes d'invitation</h2>
        <form className="compte-form" onSubmit={generer} noValidate>
          <div className="compte-grille-champs">
            <Champ label="Nombre de codes" valeur={nombre} onChange={setNombre} erreur={erreurNombre} aide="Usage unique, 1 à 50." autoComplete="off" />
            <Champ label="Expire le" type="date" valeur={expiration} onChange={setExpiration} aide="Vide : sans expiration." />
          </div>
          <Champ label="Note (facultative)" valeur={note} onChange={setNote} aide="Pour qui, pourquoi — visible seulement ici." autoComplete="off" />
          <button type="submit" className="compte-bouton" disabled={occupe}>
            Générer
          </button>
        </form>
        {nouveaux.length > 0 && (
          <div className="compte-encadre compte-succes" role="status">
            <p>À transmettre (chaque code ne sert qu'une fois) :</p>
            <ul className="admin-codes-nouveaux">
              {nouveaux.map((i) => (
                <li key={i.id}>
                  <code>{formaterCode(i.code)}</code>{' '}
                  <button type="button" className="compte-bouton-lien" onClick={() => void navigator.clipboard?.writeText(lienInvitation(i.code)).then(() => setMessage('Lien copié.'))}>
                    Copier le lien d'inscription
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="compte-section" aria-labelledby="admin-codes">
        <h2 id="admin-codes">Codes d'invitation {invitations && <span className="compte-compte">({invitations.length})</span>}</h2>
        {invitations === null ? (
          <p className="compte-chargement">Chargement…</p>
        ) : invitations.length === 0 ? (
          <p className="compte-vide">Aucun code.</p>
        ) : (
          <ul className="compte-liste">
            {invitations.map((i) => {
              const etat = etatInvitation(i)
              return (
                <li className="compte-liste-item" key={i.id}>
                  <div className="compte-liste-texte">
                    <code className="admin-code">{formaterCode(i.code)}</code>
                    <span className={`compte-badge admin-etat-${etat.classe}`}>{etat.libelle}</span>
                    <span className="compte-detail">
                      créé le {dateCourte(i.cree_le)}
                      {i.note ? ` · ${i.note}` : ''}
                    </span>
                  </div>
                  {etat.classe === 'valide' && (
                    <div className="compte-actions">
                      <button
                        type="button"
                        className="compte-bouton-secondaire compte-danger"
                        disabled={occupe}
                        onClick={() => {
                          if (window.confirm(`Révoquer le code ${formaterCode(i.code)} ?`)) void agir(() => revoquerCode(client, i.id), 'Code révoqué.')
                        }}
                      >
                        Révoquer
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="compte-section" aria-labelledby="admin-profs">
        <h2 id="admin-profs">Professeurs {professeurs && <span className="compte-compte">({professeurs.length})</span>}</h2>
        {professeurs === null ? (
          <p className="compte-chargement">Chargement…</p>
        ) : (
          <ul className="compte-liste">
            {professeurs.map((p) => (
              <li className="compte-liste-item" key={p.id}>
                <div className="compte-liste-texte">
                  <strong>{p.nom_affiche}</strong>
                  {p.est_admin && <span className="compte-badge">admin</span>}
                  {!p.actif && <span className="compte-badge admin-etat-revoque">désactivé</span>}
                  <span className="compte-detail">{p.email}</span>
                  <span className="compte-detail">
                    inscrit le {dateCourte(p.inscrit_le)} · dernière connexion : {dateCourte(p.derniere_connexion)} · {p.nombre_plans} enregistrement{p.nombre_plans > 1 ? 's' : ''} ·{' '}
                    {p.nombre_ecoles} école{p.nombre_ecoles > 1 ? 's' : ''}
                  </span>
                </div>
                {p.id !== compte.profil.id && (
                  <div className="compte-actions">
                    {p.actif ? (
                      <button
                        type="button"
                        className="compte-bouton-secondaire compte-danger"
                        disabled={occupe}
                        onClick={() => {
                          if (window.confirm(`Désactiver le compte de ${p.nom_affiche} ? Il ne pourra plus rien consulter ni enregistrer (ses données sont conservées).`))
                            void agir(() => definirActif(client, p.id, false), `Compte de ${p.nom_affiche} désactivé.`)
                        }}
                      >
                        Désactiver
                      </button>
                    ) : (
                      <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => void agir(() => definirActif(client, p.id, true), `Compte de ${p.nom_affiche} réactivé.`)}>
                        Réactiver
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
