import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { PageCompte, PageReservee } from '../components/compte/PageReservee'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { ajouterEcole, definirEcoleParDefaut, majNomAffiche, modifierEcole, supprimerEcole, supprimerMonCompte } from '../lib/compteDonnees'
import { erreurEcole, erreurNomAffiche, messageErreur, type Ecole } from '../lib/compteValidation'

/** `/profil` — nom affiché sur les copies, écoles (ajouter / modifier / supprimer / par défaut),
 * mot de passe, déconnexion, suppression du compte. */
export function ProfilPage() {
  return (
    <PageCompte titre="Mon profil">
      <PageReservee>
        <Profil />
      </PageReservee>
    </PageCompte>
  )
}

function Profil() {
  const compte = useCompte()
  const navigate = useNavigate()
  const [nom, setNom] = useState(compte.profil?.nom_affiche ?? '')
  const [erreurNom, setErreurNom] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [edition, setEdition] = useState<string | null>(null)
  const [nouvelle, setNouvelle] = useState({ nom: '', adresse: '' })
  const [erreurNouvelle, setErreurNouvelle] = useState<string | null>(null)

  const nomProfil = compte.profil?.nom_affiche ?? ''
  useEffect(() => setNom(nomProfil), [nomProfil])

  if (!estConnecteActif(compte)) return null
  const { client, profil } = compte

  async function agir(action: () => Promise<void>, succes: string) {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      await action()
      await compte.rafraichir()
      setMessage(succes)
      return true
    } catch (ex) {
      setErreur(messageErreur(ex))
      return false
    } finally {
      setOccupe(false)
    }
  }

  async function enregistrerNom(e: FormEvent) {
    e.preventDefault()
    const err = erreurNomAffiche(nom)
    setErreurNom(err)
    if (!err) await agir(() => majNomAffiche(client, profil.id, nom), 'Nom affiché enregistré.')
  }

  async function ajouter(e: FormEvent) {
    e.preventDefault()
    const err = erreurEcole(nouvelle.nom, nouvelle.adresse)
    setErreurNouvelle(err)
    if (err) return
    if (await agir(() => ajouterEcole(client, nouvelle, compte.ecoles), `École « ${nouvelle.nom.trim()} » ajoutée.`)) setNouvelle({ nom: '', adresse: '' })
  }

  async function supprimerCompte() {
    const ok = window.confirm(
      'Supprimer définitivement ton compte ?\n\nTes enregistrements (coffre), tes écoles et ton profil seront effacés. Cette action est irréversible.',
    )
    if (!ok) return
    setOccupe(true)
    try {
      await supprimerMonCompte(client)
      await compte.seDeconnecter().catch(() => undefined)
      navigate('/', { replace: true })
    } catch (ex) {
      setErreur(messageErreur(ex))
      setOccupe(false)
    }
  }

  return (
    <div className="compte-sections">
      {(message || erreur) && (
        <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
          {erreur ?? message}
        </p>
      )}

      <section className="compte-section" aria-labelledby="profil-nom">
        <h2 id="profil-nom">Nom affiché sur les copies</h2>
        <form className="compte-form compte-form-ligne" onSubmit={enregistrerNom} noValidate>
          <Champ label="Nom affiché" valeur={nom} onChange={setNom} erreur={erreurNom} aide="Imprimé dans le cartouche des évaluations et des examens." autoComplete="name" />
          <button type="submit" className="compte-bouton" disabled={occupe || nom.trim() === profil.nom_affiche}>
            Enregistrer
          </button>
        </form>
      </section>

      <section className="compte-section" aria-labelledby="profil-ecoles">
        <h2 id="profil-ecoles">Mes écoles</h2>
        <p className="compte-intro">L'école par défaut est pré-remplie dans le panneau de conception ; avec plusieurs écoles, une liste permet d'en choisir une autre pour chaque document.</p>
        {compte.ecoles.length === 0 ? (
          <p className="compte-vide">Aucune école pour l'instant : ajoute la tienne ci-dessous (nom et adresse imprimés sur les copies).</p>
        ) : (
          <ul className="compte-liste">
            {compte.ecoles.map((ecole) =>
              edition === ecole.id ? (
                <EditionEcole key={ecole.id} ecole={ecole} occupe={occupe} onAnnuler={() => setEdition(null)} onEnregistrer={async (s) => (await agir(() => modifierEcole(client, ecole.id, s), 'École modifiée.')) && setEdition(null)} />
              ) : (
                <li key={ecole.id} className="compte-liste-item">
                  <div className="compte-liste-texte">
                    <strong>{ecole.nom}</strong>
                    {ecole.par_defaut && <span className="compte-badge">par défaut</span>}
                    {ecole.adresse && <span className="compte-detail">{ecole.adresse}</span>}
                  </div>
                  <div className="compte-actions">
                    {!ecole.par_defaut && (
                      <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => void agir(() => definirEcoleParDefaut(client, ecole.id), `« ${ecole.nom} » est l'école par défaut.`)}>
                        Par défaut
                      </button>
                    )}
                    <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => setEdition(ecole.id)}>
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="compte-bouton-secondaire compte-danger"
                      disabled={occupe}
                      onClick={() => {
                        if (window.confirm(`Supprimer l'école « ${ecole.nom} » ?`)) void agir(() => supprimerEcole(client, ecole.id, compte.ecoles), 'École supprimée.')
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
        <form className="compte-form compte-sous-form" onSubmit={ajouter} noValidate>
          <h3>Ajouter une école</h3>
          <Champ label="Nom de l'école" valeur={nouvelle.nom} onChange={(v) => setNouvelle((n) => ({ ...n, nom: v }))} erreur={erreurNouvelle} autoComplete="organization" />
          <Champ label="Adresse (facultative)" valeur={nouvelle.adresse} onChange={(v) => setNouvelle((n) => ({ ...n, adresse: v }))} aide="Exemple : Rue de l'École 1, 1000 Bruxelles." autoComplete="street-address" />
          <button type="submit" className="compte-bouton" disabled={occupe}>
            Ajouter l'école
          </button>
        </form>
      </section>

      <section className="compte-section" aria-labelledby="profil-compte">
        <h2 id="profil-compte">Mon compte</h2>
        <p className="compte-intro">
          Adresse e-mail : <strong>{compte.utilisateur?.email}</strong>
        </p>
        <p className="compte-actions">
          <Link className="compte-bouton-secondaire" to="/mot-de-passe">
            Changer de mot de passe
          </Link>
          <Link className="compte-bouton-secondaire" to="/coffre">
            Mon coffre
          </Link>
          <button type="button" className="compte-bouton-secondaire" onClick={() => void compte.seDeconnecter().then(() => navigate('/'))}>
            Se déconnecter
          </button>
        </p>
        <details className="compte-zone-danger">
          <summary>Supprimer mon compte</summary>
          <p>Efface ton profil, tes écoles et tous les enregistrements de ton coffre. Les documents déjà téléchargés restent sur ton appareil. Aucune donnée d'élève n'est stockée.</p>
          <button type="button" className="compte-bouton compte-danger" disabled={occupe} onClick={() => void supprimerCompte()}>
            Supprimer définitivement mon compte
          </button>
        </details>
      </section>
    </div>
  )
}

function EditionEcole({ ecole, occupe, onAnnuler, onEnregistrer }: { ecole: Ecole; occupe: boolean; onAnnuler: () => void; onEnregistrer: (s: { nom: string; adresse: string }) => Promise<unknown> }) {
  const [nom, setNom] = useState(ecole.nom)
  const [adresse, setAdresse] = useState(ecole.adresse)
  const [erreur, setErreur] = useState<string | null>(null)
  return (
    <li className="compte-liste-item compte-liste-edition">
      <form
        className="compte-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          const err = erreurEcole(nom, adresse)
          setErreur(err)
          if (!err) void onEnregistrer({ nom, adresse })
        }}
      >
        <Champ label="Nom de l'école" valeur={nom} onChange={setNom} erreur={erreur} autoFocus />
        <Champ label="Adresse" valeur={adresse} onChange={setAdresse} />
        <div className="compte-actions">
          <button type="submit" className="compte-bouton" disabled={occupe}>
            Enregistrer
          </button>
          <button type="button" className="compte-bouton-secondaire" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </form>
    </li>
  )
}
