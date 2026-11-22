import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { IconeCle } from '../components/compte/IconesEspace'
import { MessageAcces, PageAcces } from '../components/compte/PageAcces'
import { MessageChargement, MessageIndisponible } from '../components/compte/PageReservee'
import { useCompte } from '../lib/compteContexte'
import { changerMotDePasse } from '../lib/compteDonnees'
import { erreurConfirmation, erreurMotDePasse, messageErreur, MOT_DE_PASSE_MIN } from '../lib/compteValidation'

/** Message d'erreur porté par un lien reçu par e-mail (`#error_description=…`), lu au montage. */
function erreurDuLien(): string | null {
  const brut = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('error_description') ?? new URLSearchParams(window.location.search).get('error_description')
  if (!brut) return null
  return /expired|invalid/i.test(brut) ? 'Lien expiré ou déjà utilisé : demande un nouveau lien.' : `Lien refusé : ${brut}`
}

/**
 * `/mot-de-passe` — choix d'un nouveau mot de passe : après le lien « mot de passe oublié » (la
 * session de récupération est ouverte par supabase-js à partir des jetons de l'URL), ou depuis le
 * profil d'un professeur connecté. Cadre `PageAcces` (bandeau « ESPACE PROFESSEUR », carte).
 */
export function MotDePassePage() {
  const compte = useCompte({ demarrer: true })
  const [erreurLien] = useState(erreurDuLien)
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreurs, setErreurs] = useState<{ motDePasse?: string | null; confirmation?: string | null; general?: string | null }>({})
  const [envoi, setEnvoi] = useState(false)
  const [fait, setFait] = useState(false)

  async function valider(e: FormEvent) {
    e.preventDefault()
    const err = { motDePasse: erreurMotDePasse(motDePasse), confirmation: erreurConfirmation(motDePasse, confirmation) }
    setErreurs(err)
    if (err.motDePasse || err.confirmation || !compte.client) return
    setEnvoi(true)
    try {
      await changerMotDePasse(compte.client, motDePasse)
      setFait(true)
    } catch (ex) {
      setErreurs({ general: messageErreur(ex) })
    } finally {
      setEnvoi(false)
    }
  }

  let contenu
  if (compte.etat === 'indisponible') contenu = <MessageIndisponible />
  else if (compte.etat === 'inactif' || compte.etat === 'chargement') contenu = <MessageChargement />
  else if (compte.etat === 'anonyme')
    contenu = (
      <MessageAcces ton="erreur" titre="Ce lien ne fonctionne plus" role="alert">
        <p>{erreurLien ?? 'Lien invalide ou expiré : pour choisir un nouveau mot de passe, demande un nouveau lien.'}</p>
        <Link to="/connexion?oubli=1">Recevoir un nouveau lien</Link>
      </MessageAcces>
    )
  else if (fait)
    contenu = (
      <MessageAcces ton="succes" titre="Mot de passe modifié." role="status">
        <Link to="/profil">Aller à mon profil</Link>
      </MessageAcces>
    )
  else
    contenu = (
      <form className="compte-form" onSubmit={valider} noValidate>
        <p className="compte-intro">
          {compte.recuperation ? 'Choisis un nouveau mot de passe pour ' : 'Nouveau mot de passe pour '}
          <strong>{compte.utilisateur?.email}</strong>.
        </p>
        {/* Champ caché pour les gestionnaires de mots de passe (associe le nouveau mot de passe au bon compte). */}
        <input type="email" name="username" autoComplete="username" value={compte.utilisateur?.email ?? ''} readOnly hidden />
        <Champ
          label="Nouveau mot de passe"
          type="password"
          valeur={motDePasse}
          onChange={setMotDePasse}
          erreur={erreurs.motDePasse}
          aide={`${MOT_DE_PASSE_MIN} caractères minimum.`}
          autoComplete="new-password"
        />
        <Champ label="Confirme le mot de passe" type="password" valeur={confirmation} onChange={setConfirmation} erreur={erreurs.confirmation} autoComplete="new-password" />
        {erreurs.general && (
          <p className="compte-erreur-champ" role="alert">
            {erreurs.general}
          </p>
        )}
        <button type="submit" className="compte-bouton" disabled={envoi}>
          {envoi ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    )

  return (
    <PageAcces titre="Nouveau mot de passe" icone={<IconeCle />}>
      {contenu}
    </PageAcces>
  )
}
