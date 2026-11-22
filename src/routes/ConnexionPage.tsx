import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { IconeCle, IconeEnveloppe } from '../components/compte/IconesEspace'
import { MessageAcces, PageAcces } from '../components/compte/PageAcces'
import { MessageChargement, MessageIndisponible } from '../components/compte/PageReservee'
import { useCompte } from '../lib/compteContexte'
import { connecter, envoyerLienReinitialisation } from '../lib/compteDonnees'
import { erreurEmail, messageErreur, retourSur } from '../lib/compteValidation'

/** `/connexion` — e-mail + mot de passe ; « Mot de passe oublié ? » (`?oubli=1`) envoie le lien
 * de réinitialisation (flux Supabase, retour sur `/mot-de-passe`). `?retour=` : page demandée
 * avant la redirection (chemin du site seulement). Cadre `PageAcces` (bandeau « ESPACE PROFESSEUR »,
 * carte ; phrase « Tu es élève ? » sur la connexion seulement). */
export function ConnexionPage() {
  const compte = useCompte({ demarrer: true })
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const retour = retourSur(params.get('retour'))
  const oubli = params.get('oubli') === '1'
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurs, setErreurs] = useState<{ email?: string | null; motDePasse?: string | null; general?: string | null }>({})
  const [envoi, setEnvoi] = useState(false)
  const [lienEnvoye, setLienEnvoye] = useState<string | null>(null)

  // Déjà connecté (ou connexion réussie, une fois le profil lu) : page demandée.
  const connecte = compte.etat === 'connecte'
  useEffect(() => {
    if (connecte) navigate(retour, { replace: true })
  }, [connecte, retour, navigate])

  function basculerOubli(actif: boolean) {
    const p = new URLSearchParams(params)
    if (actif) p.set('oubli', '1')
    else p.delete('oubli')
    setParams(p, { replace: true })
    setErreurs({})
    setLienEnvoye(null)
  }

  async function seConnecter(e: FormEvent) {
    e.preventDefault()
    const err = { email: erreurEmail(email), motDePasse: motDePasse ? null : 'Mot de passe manquant.' }
    setErreurs(err)
    if (err.email || err.motDePasse || !compte.client) return
    setEnvoi(true)
    try {
      await connecter(compte.client, email, motDePasse)
      // La redirection se fait quand le compte est lu (effet ci-dessus).
    } catch (ex) {
      setErreurs({ general: messageErreur(ex) })
      setEnvoi(false)
    }
  }

  async function envoyerLien(e: FormEvent) {
    e.preventDefault()
    const err = erreurEmail(email)
    setErreurs({ email: err })
    if (err || !compte.client) return
    setEnvoi(true)
    try {
      await envoyerLienReinitialisation(compte.client, email, `${window.location.origin}/mot-de-passe`)
      setLienEnvoye(email.trim())
    } catch (ex) {
      setErreurs({ general: messageErreur(ex) })
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <PageAcces titre={oubli ? 'Mot de passe oublié' : 'Connexion'} icone={oubli ? <IconeEnveloppe /> : <IconeCle />} eleve={!oubli}>
      {compte.etat === 'indisponible' ? (
        <MessageIndisponible />
      ) : compte.etat === 'inactif' || (compte.etat === 'chargement' && !envoi) ? (
        <MessageChargement />
      ) : oubli ? (
        lienEnvoye ? (
          <MessageAcces ton="succes" titre="E-mail envoyé" role="status">
            <p>
              Si un compte existe pour <strong>{lienEnvoye}</strong>, un e-mail vient d'être envoyé avec un lien pour choisir un nouveau mot de passe. Regarde aussi dans les
              courriers indésirables.
            </p>
            <button type="button" className="compte-bouton-lien" onClick={() => basculerOubli(false)}>
              <span aria-hidden="true">←</span> Retour à la connexion
            </button>
          </MessageAcces>
        ) : (
          <form className="compte-form" onSubmit={envoyerLien} noValidate>
            <p className="compte-intro">Indique l'adresse e-mail de ton compte : tu recevras un lien pour choisir un nouveau mot de passe.</p>
            <Champ label="Adresse e-mail" type="email" valeur={email} onChange={setEmail} erreur={erreurs.email} autoComplete="email" autoCapitalize="none" spellCheck={false} />
            {erreurs.general && (
              <p className="compte-erreur-champ" role="alert">
                {erreurs.general}
              </p>
            )}
            <button type="submit" className="compte-bouton" disabled={envoi}>
              {envoi ? 'Envoi…' : 'Recevoir le lien'}
            </button>
            <p className="compte-liens">
              <button type="button" className="compte-bouton-lien" onClick={() => basculerOubli(false)}>
                <span aria-hidden="true">←</span> Retour à la connexion
              </button>
            </p>
          </form>
        )
      ) : (
        <form className="compte-form" onSubmit={seConnecter} noValidate>
          <Champ label="Adresse e-mail" type="email" valeur={email} onChange={setEmail} erreur={erreurs.email} autoComplete="email" autoCapitalize="none" spellCheck={false} />
          <Champ label="Mot de passe" type="password" valeur={motDePasse} onChange={setMotDePasse} erreur={erreurs.motDePasse} autoComplete="current-password" />
          {erreurs.general && (
            <p className="compte-erreur-champ" role="alert">
              {erreurs.general}
            </p>
          )}
          <button type="submit" className="compte-bouton" disabled={envoi}>
            {envoi ? 'Connexion…' : 'Se connecter'}
          </button>
          <p className="compte-liens">
            <button type="button" className="compte-bouton-lien" onClick={() => basculerOubli(true)}>
              Mot de passe oublié ?
            </button>
            <span>
              Pas encore de compte ? <Link to={`/inscription${params.get('retour') ? `?retour=${encodeURIComponent(retour)}` : ''}`}>S'inscrire avec un code d'invitation</Link>
            </span>
          </p>
        </form>
      )}
    </PageAcces>
  )
}
