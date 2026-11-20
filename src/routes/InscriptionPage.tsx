import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { MessageChargement, MessageIndisponible, PageCompte } from '../components/compte/PageReservee'
import { useCompte } from '../lib/compteContexte'
import { inscrire, verifierCodeInvitation } from '../lib/compteDonnees'
import { erreurCodeInvitation, erreurEmail, erreurMotDePasse, erreurNomAffiche, messageErreur, messageStatutCode, MOT_DE_PASSE_MIN } from '../lib/compteValidation'

type Erreurs = Partial<Record<'code' | 'nom' | 'email' | 'motDePasse' | 'general', string | null>>

/**
 * `/inscription` — UNIQUEMENT avec un code d'invitation (décision de l'utilisateur). Le code est
 * d'abord vérifié (`verifier_code_invitation`, message clair), puis `signUp` le transmet dans les
 * métadonnées : le déclencheur SQL le consomme et crée le profil, ou refuse l'inscription.
 * `?code=` pré-remplit le champ (lien envoyé par l'administrateur).
 */
export function InscriptionPage() {
  const compte = useCompte({ demarrer: true })
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [code, setCode] = useState(() => params.get('code') ?? '')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreurs, setErreurs] = useState<Erreurs>({})
  const [envoi, setEnvoi] = useState(false)
  const [confirmationEnvoyee, setConfirmationEnvoyee] = useState<string | null>(null)

  const connecte = compte.etat === 'connecte'
  useEffect(() => {
    if (connecte) navigate('/profil', { replace: true })
  }, [connecte, navigate])

  async function sInscrire(e: FormEvent) {
    e.preventDefault()
    const err: Erreurs = { code: erreurCodeInvitation(code), nom: erreurNomAffiche(nom), email: erreurEmail(email), motDePasse: erreurMotDePasse(motDePasse) }
    setErreurs(err)
    if (err.code || err.nom || err.email || err.motDePasse || !compte.client) return
    setEnvoi(true)
    try {
      const statut = messageStatutCode(await verifierCodeInvitation(compte.client, code))
      if (statut) {
        setErreurs({ code: statut })
        setEnvoi(false)
        return
      }
      const sessionOuverte = await inscrire(compte.client, { code, nom, email, motDePasse, redirection: `${window.location.origin}/profil` })
      if (!sessionOuverte) {
        setConfirmationEnvoyee(email.trim())
        setEnvoi(false)
      }
      // Session ouverte : redirection vers /profil quand le compte est lu (effet ci-dessus).
    } catch (ex) {
      const message = messageErreur(ex)
      setErreurs(message.startsWith("Code d'invitation") ? { code: message } : { general: message })
      setEnvoi(false)
    }
  }

  return (
    <PageCompte titre="Inscription">
      {compte.etat === 'indisponible' ? (
        <MessageIndisponible />
      ) : compte.etat === 'inactif' || (compte.etat === 'chargement' && !envoi) ? (
        <MessageChargement />
      ) : confirmationEnvoyee ? (
        <div className="compte-encadre compte-succes" role="status">
          <p>
            <strong>Presque fini !</strong> Un e-mail de confirmation vient d'être envoyé à <strong>{confirmationEnvoyee}</strong>. Clique sur le lien qu'il contient pour activer ton
            compte (regarde aussi dans les courriers indésirables), puis <Link to="/connexion">connecte-toi</Link>.
          </p>
        </div>
      ) : (
        <form className="compte-form" onSubmit={sInscrire} noValidate>
          <p className="compte-intro">
            L'inscription est réservée aux professeurs : il faut un <strong>code d'invitation</strong> donné par l'administrateur du site. Les cours et les générateurs restent
            accessibles à tous sans compte.
          </p>
          <Champ
            label="Code d'invitation"
            valeur={code}
            onChange={setCode}
            erreur={erreurs.code}
            aide="12 lettres et chiffres ; espaces et tirets ignorés."
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
          />
          <Champ label="Nom affiché sur les copies" valeur={nom} onChange={setNom} erreur={erreurs.nom} aide="Exemple : « M. Dupont » ou « Mme Leroy »." autoComplete="name" />
          <Champ label="Adresse e-mail" type="email" valeur={email} onChange={setEmail} erreur={erreurs.email} autoComplete="email" autoCapitalize="none" spellCheck={false} />
          <Champ
            label="Mot de passe"
            type="password"
            valeur={motDePasse}
            onChange={setMotDePasse}
            erreur={erreurs.motDePasse}
            aide={`${MOT_DE_PASSE_MIN} caractères minimum.`}
            autoComplete="new-password"
          />
          {erreurs.general && (
            <p className="compte-erreur-champ" role="alert">
              {erreurs.general}
            </p>
          )}
          <button type="submit" className="compte-bouton" disabled={envoi}>
            {envoi ? 'Inscription…' : 'Créer mon compte'}
          </button>
          <p className="compte-liens">
            <span>
              Déjà un compte ? <Link to="/connexion">Se connecter</Link>
            </span>
          </p>
        </form>
      )}
    </PageCompte>
  )
}
