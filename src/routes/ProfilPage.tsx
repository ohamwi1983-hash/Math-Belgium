import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { MenuActions } from '../components/carnet/MenuActions'
import { ApercuCartouche, type SurlignageCartouche } from '../components/compte/ApercuCartouche'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { Champ } from '../components/compte/Champ'
import { MenuEspace } from '../components/compte/MenuEspace'
import { OrdreChapitresCarte } from '../components/compte/OrdreChapitresCarte'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import '../components/compte/profil.css'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { ajouterEcole, definirEcoleParDefaut, majNomAffiche, modifierEcole, supprimerEcole, supprimerMonCompte } from '../lib/compteDonnees'
import { cartoucheDepuisCompte, ecoleParDefaut, erreurEcole, erreurNomAffiche, messageErreur, type Ecole } from '../lib/compteValidation'
import type { CaseHoraire, GrilleHoraire } from '../lib/horaire'

/** `/profil` — refonte du 21/11/2026 (maquettes « A, style du carnet » ordinateur et téléphone) :
 * menu « Mon espace » (`MenuEspace`), bandeau sombre (initiale, écoles), cartes « Sur les copies »
 * (nom affiché), « Mes écoles » (une carte par école : couleur, adresse, par défaut, état de son
 * horaire du carnet, menu « … » Modifier / Supprimer avec confirmation dans la page, « + Ajouter une
 * école » à la demande), « Mon compte » (e-mail, mot de passe, suppression du compte) et le panneau
 * « Ce qui s'imprime » (aperçu du cartouche réel, mis à jour pendant la frappe). */
export function ProfilPage() {
  return (
    <PageCompte titre="Réglages" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Profil />
      </PageReservee>
    </PageCompte>
  )
}

/** Titre habituel tant que la page n'est pas prête (chargement, configuration manquante, compte
 * désactivé…) : le bandeau, qui porte le `<h1>`, n'apparaît qu'avec le profil. */
function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Réglages" />
}

/** Horaire du carnet par école (lecture seule, `carnetDonnees.ts::chargerHoraire`). */
type EtatHoraire = { etat: 'chargement' } | { etat: 'indisponible' } | { etat: 'pret'; grilles: GrilleHoraire[]; cases: CaseHoraire[] }

type Focus = 'nom' | 'ecole' | 'adresse' | null

/** « M. Hamwi » → « H » (civilité retirée). */
function initiale(nom: string): string {
  const sans = nom.trim().replace(/^(m\.|mme\.?|mlle\.?|mr\.?|dr\.?|madame|monsieur|mademoiselle)\s+/i, '')
  return (sans[0] ?? '?').toLocaleUpperCase('fr')
}

/** Couleur d'une école = son rang dans la liste (mêmes couleurs que les classes du carnet). */
const couleur = (i: number) => `carnet-c${i % 6}`

function Profil() {
  const compte = useCompte()
  const navigate = useNavigate()
  const id = useId()
  const [nom, setNom] = useState(compte.profil?.nom_affiche ?? '')
  const [erreurNom, setErreurNom] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [edition, setEdition] = useState<string | null>(null)
  const [valeursEdition, setValeursEdition] = useState<{ nom: string; adresse: string } | null>(null)
  const [ajoutOuvert, setAjoutOuvert] = useState(compte.ecoles.length === 0)
  const [nouvelle, setNouvelle] = useState({ nom: '', adresse: '' })
  const [erreurNouvelle, setErreurNouvelle] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<string | null>(null)
  const [focus, setFocus] = useState<Focus>(null)
  const [horaire, setHoraire] = useState<EtatHoraire>({ etat: 'chargement' })
  const [confirmerCompte, setConfirmerCompte] = useState(false)

  const nomProfil = compte.profil?.nom_affiche ?? ''
  useEffect(() => setNom(nomProfil), [nomProfil])

  // État de l'horaire de chaque école (carnet, 0003). Chargé à part (`import()` : le code du carnet
  // n'est pas dans le morceau de la page) ; tables absentes ou erreur → rien d'affiché.
  const client = compte.client
  useEffect(() => {
    if (!client) return
    let actif = true
    import('../lib/carnetDonnees')
      .then(({ chargerHoraire }) => chargerHoraire(client))
      .then((h) => actif && setHoraire(h.actif ? { etat: 'pret', grilles: h.grilles, cases: h.cases } : { etat: 'indisponible' }))
      .catch(() => actif && setHoraire({ etat: 'indisponible' }))
    return () => {
      actif = false
    }
  }, [client])

  if (!estConnecteActif(compte)) return null
  const { profil } = compte
  const ecoles = compte.ecoles
  const defaut = ecoleParDefaut(ecoles)

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
    if (!err) await agir(() => majNomAffiche(compte.client!, profil.id, nom), 'Nom affiché enregistré.')
  }

  async function ajouter(e: FormEvent) {
    e.preventDefault()
    const err = erreurEcole(nouvelle.nom, nouvelle.adresse)
    setErreurNouvelle(err)
    if (err) return
    if (await agir(() => ajouterEcole(compte.client!, nouvelle, ecoles), `École « ${nouvelle.nom.trim()} » ajoutée.`)) {
      setFocus(null)
      setNouvelle({ nom: '', adresse: '' })
      setAjoutOuvert(false)
    }
  }

  async function supprimerCompte() {
    setOccupe(true)
    try {
      await supprimerMonCompte(compte.client!)
      await compte.seDeconnecter().catch(() => undefined)
      navigate('/', { replace: true })
    } catch (ex) {
      setErreur(messageErreur(ex))
      setOccupe(false)
    }
  }

  function rendreFocusMenu(ecoleId: string) {
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-ecole="${ecoleId}"] .carnet-bouton-trois-points`)?.focus())
  }

  // Aperçu : nom saisi (même non enregistré) + école par défaut — ou ses valeurs en cours de
  // modification, ou la future première école (elle deviendra l'école par défaut).
  const editionDefaut = defaut !== null && edition === defaut.id && valeursEdition !== null
  const ajoutPremiere = defaut === null && ajoutOuvert && (nouvelle.nom.trim() !== '' || nouvelle.adresse.trim() !== '')
  const ecoleApercu = editionDefaut ? valeursEdition : ajoutPremiere ? nouvelle : defaut
  const apercu = cartoucheDepuisCompte({ nom_affiche: nom }, ecoleApercu)
  const enregistre = cartoucheDepuisCompte(profil, defaut)
  const ecoleSuivie = editionDefaut || ajoutPremiere
  const surligne: SurlignageCartouche = {
    professeur: apercu.professeur !== enregistre.professeur || focus === 'nom',
    ecole: apercu.ecoleNom !== enregistre.ecoleNom || (ecoleSuivie && focus === 'ecole'),
    adresse: apercu.ecoleAdresse !== enregistre.ecoleAdresse || (ecoleSuivie && focus === 'adresse'),
  }
  const nomEnregistre = nom.trim() === profil.nom_affiche

  const etatHoraire = (ecole: Ecole) => {
    if (horaire.etat !== 'pret') return null
    const g = horaire.grilles.find((x) => x.ecole_id === ecole.id)
    const lien = `/carnet/horaire?ecole=${encodeURIComponent(ecole.id)}`
    if (!g)
      return (
        <span className="profil-ecole-horaire">
          <span className="profil-pastille attention">Horaire à remplir</span>
          <Link to={lien} aria-label={`Remplir l'horaire de ${ecole.nom} dans Mes classes`}>
            le remplir
          </Link>
        </span>
      )
    const heures = `H${g.heure_zero ? 0 : 1}–H${g.nombre_heures}`
    const remplie = horaire.cases.some((c) => c.ecole_id === ecole.id)
    return (
      <span className="profil-ecole-horaire">
        {remplie ? <span className="profil-pastille ok">✓ Horaire {heures}</span> : <span className="profil-pastille attention">Grille {heures} · semaine à remplir</span>}
        <Link to={lien} aria-label={`${remplie ? 'Ouvrir' : 'Remplir'} l'horaire de ${ecole.nom} dans Mes classes`}>
          {remplie ? 'ouvrir dans Mes classes' : 'la remplir'}
        </Link>
      </span>
    )
  }

  return (
    <div className="profil">
      <MenuEspace>
        <div className="profil-contenu">
          <BandeauEspace
            titreId={`${id}-titre`}
            surtitre="Réglages"
            titre="Réglages"
            icone={initiale(profil.nom_affiche)}
            apresTitre={<p className="ep-phrase">À régler une fois, en début d'année : ton profil et tes écoles, l'en-tête des copies, l'ordre de tes chapitres, l'agenda et ton compte.</p>}
            etiquettePastilles="Mes écoles"
            pastilles={ecoles.map((e, i) => (
              <li key={e.id} className={`profil-bandeau-ecole ${couleur(i)}`}>
                <span className="carnet-point" aria-hidden="true" />
                {e.nom}
                {e.par_defaut && <span className="carnet-sr"> (par défaut)</span>}
              </li>
            ))}
          />

          {(message || erreur) && (
            <p className={`profil-message ${erreur ? 'compte-erreur-champ' : 'compte-message'}`} role={erreur ? 'alert' : 'status'}>
              {erreur ?? message}
            </p>
          )}

          <div className="profil-grille">
            <div className="profil-colonne">
              <section className="profil-carte ep-ancre" id="profil" aria-labelledby={`${id}-copies`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-copies`}>Mon profil : nom sur les copies</h2>
                  {nomEnregistre ? <span className="profil-pastille ok">✓ enregistré</span> : <span className="profil-pastille attention">non enregistré</span>}
                </div>
                <form className="profil-carte-corps profil-form-nom" onSubmit={enregistrerNom} noValidate>
                  <Champ
                    label="Nom affiché"
                    valeur={nom}
                    onChange={setNom}
                    erreur={erreurNom}
                    aide="Imprimé dans le cartouche des évaluations et des examens, et au pied de page des feuilles d'exercices."
                    autoComplete="name"
                    onFocus={() => setFocus('nom')}
                    onBlur={() => setFocus(null)}
                  />
                  {!nomEnregistre && (
                    <div className="profil-actions">
                      <button type="submit" className="carnet-bouton principal" disabled={occupe}>
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        className="carnet-bouton"
                        onClick={() => {
                          setNom(profil.nom_affiche)
                          setErreurNom(null)
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </form>
              </section>

              <section className="profil-carte ep-ancre" id="ecoles" aria-labelledby={`${id}-ecoles`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-ecoles`}>Mes écoles</h2>
                  <button type="button" className="carnet-bouton" aria-expanded={ajoutOuvert} aria-controls={`${id}-ajout`} onClick={() => setAjoutOuvert((o) => !o)}>
                    + Ajouter une école
                  </button>
                </div>
                <div className="profil-carte-corps">
                  <p className="profil-intro">L'école par défaut est pré-remplie dans le panneau de conception ; avec plusieurs écoles, une liste permet d'en choisir une autre pour chaque document.</p>
                  {ecoles.length === 0 ? (
                    <p className="compte-vide">Aucune école pour l'instant : ajoute la tienne ci-dessous (nom et adresse imprimés sur les copies).</p>
                  ) : (
                    <ul className="profil-ecoles">
                      {ecoles.map((ecole, i) =>
                        edition === ecole.id ? (
                          <EditionEcole
                            key={ecole.id}
                            ecole={ecole}
                            classe={couleur(i)}
                            occupe={occupe}
                            onValeurs={setValeursEdition}
                            onFocus={setFocus}
                            onAnnuler={() => {
                              setFocus(null)
                              setEdition(null)
                              setValeursEdition(null)
                              rendreFocusMenu(ecole.id)
                            }}
                            onEnregistrer={async (s) => {
                              if (await agir(() => modifierEcole(compte.client!, ecole.id, s), 'École modifiée.')) {
                                setFocus(null)
                                setEdition(null)
                                setValeursEdition(null)
                                rendreFocusMenu(ecole.id)
                              }
                            }}
                          />
                        ) : (
                          <li key={ecole.id} className={`profil-ecole ${couleur(i)}${ecole.par_defaut ? ' par-defaut' : ''}`} data-ecole={ecole.id}>
                            <span className="profil-ecole-point" aria-hidden="true" />
                            <div className="profil-ecole-corps">
                              <span className="profil-ecole-ligne">
                                <strong className="profil-ecole-nom">{ecole.nom}</strong>
                                {ecole.par_defaut ? (
                                  <span className="profil-pastille ecole">par défaut</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="profil-lien-bouton"
                                    disabled={occupe}
                                    onClick={() => void agir(() => definirEcoleParDefaut(compte.client!, ecole.id), `« ${ecole.nom} » est l'école par défaut.`)}
                                  >
                                    Mettre par défaut<span className="carnet-sr"> : {ecole.nom}</span>
                                  </button>
                                )}
                              </span>
                              {ecole.adresse ? <span className="profil-ecole-adresse">{ecole.adresse}</span> : <span className="profil-ecole-adresse vide">Pas d'adresse (rien n'est imprimé à sa place)</span>}
                              {etatHoraire(ecole)}
                              {aSupprimer === ecole.id && (
                                <ConfirmationSuppression
                                  titre={`Supprimer l'école « ${ecole.nom} » ?`}
                                  texte="Ses classes, ses séances et son horaire dans Mes classes seront aussi effacés. Cette action est irréversible."
                                  confirmer="Supprimer l'école"
                                  occupe={occupe}
                                  onConfirmer={() => {
                                    setASupprimer(null)
                                    void agir(() => supprimerEcole(compte.client!, ecole.id, ecoles), 'École supprimée.')
                                  }}
                                  onAnnuler={() => {
                                    setASupprimer(null)
                                    rendreFocusMenu(ecole.id)
                                  }}
                                />
                              )}
                            </div>
                            <MenuActions
                              libelle={`Autres actions pour ${ecole.nom} : modifier, supprimer`}
                              actions={[
                                {
                                  texte: 'Modifier',
                                  desactive: occupe,
                                  onChoisir: () => {
                                    setASupprimer(null)
                                    setEdition(ecole.id)
                                    setValeursEdition({ nom: ecole.nom, adresse: ecole.adresse })
                                  },
                                },
                                { texte: 'Supprimer', danger: true, desactive: occupe, onChoisir: () => setASupprimer(ecole.id) },
                              ]}
                            />
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                  {ajoutOuvert && (
                    <form className="profil-sous-form" id={`${id}-ajout`} onSubmit={ajouter} noValidate aria-labelledby={`${id}-ajout-titre`}>
                      <h3 id={`${id}-ajout-titre`}>Ajouter une école</h3>
                      <Champ
                        label="Nom de l'école"
                        autoFocus={ecoles.length > 0}
                        valeur={nouvelle.nom}
                        onChange={(v) => setNouvelle((n) => ({ ...n, nom: v }))}
                        erreur={erreurNouvelle}
                        autoComplete="organization"
                        onFocus={() => setFocus('ecole')}
                        onBlur={() => setFocus(null)}
                      />
                      <Champ
                        label="Adresse (facultative)"
                        valeur={nouvelle.adresse}
                        onChange={(v) => setNouvelle((n) => ({ ...n, adresse: v }))}
                        aide="Exemple : Rue de l'École 1, 1000 Bruxelles."
                        autoComplete="street-address"
                        onFocus={() => setFocus('adresse')}
                        onBlur={() => setFocus(null)}
                      />
                      <div className="profil-actions">
                        <button type="submit" className="carnet-bouton principal" disabled={occupe}>
                          Ajouter l'école
                        </button>
                        {ecoles.length > 0 && (
                          <button
                            type="button"
                            className="carnet-bouton"
                            onClick={() => {
                              setAjoutOuvert(false)
                              setNouvelle({ nom: '', adresse: '' })
                              setErreurNouvelle(null)
                            }}
                          >
                            Annuler
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </section>

              <OrdreChapitresCarte client={compte.client} proprietaire={profil.id} />

              <section className="profil-carte ep-ancre" id="agenda" aria-labelledby={`${id}-agenda`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-agenda`}>Réglages de l'agenda</h2>
                </div>
                <div className="profil-carte-corps">
                  <p className="profil-intro">
                    Périodes du bulletin (dates de remise des points) et seuil d'avertissement, texte copié pour l'agenda scolaire (rubriques, compétences transversales),
                    écriture de l'horaire des séances.
                  </p>
                  <div className="profil-actions">
                    <Link className="carnet-bouton" to="/carnet/reglages">
                      Ouvrir les réglages de l'agenda
                    </Link>
                    <Link className="carnet-bouton" to="/carnet/horaire">
                      Mon horaire
                    </Link>
                  </div>
                </div>
              </section>

              <section className="profil-carte ep-ancre" id="compte" aria-labelledby={`${id}-compte`}>
                <div className="profil-carte-tete">
                  <h2 id={`${id}-compte`}>Mon compte</h2>
                </div>
                <div className="profil-carte-corps profil-compte">
                  <div className="profil-compte-ligne">
                    <span>
                      <span className="profil-etiquette">E-mail</span>
                      <span className="profil-valeur">{compte.utilisateur?.email}</span>
                    </span>
                  </div>
                  <div className="profil-compte-ligne">
                    <span>
                      <span className="profil-etiquette">Mot de passe</span>
                      <span className="profil-valeur" aria-label="masqué">
                        ••••••••••
                      </span>
                    </span>
                    <Link className="carnet-bouton" to="/mot-de-passe" aria-label="Changer de mot de passe">
                      Changer
                    </Link>
                  </div>
                  <details className="profil-zone-danger" onToggle={(e) => !(e.currentTarget as HTMLDetailsElement).open && setConfirmerCompte(false)}>
                    <summary>Supprimer mon compte</summary>
                    <p>Efface ton profil, tes écoles, tes classes (matière vue, horaire, agenda) et tous tes documents enregistrés. Les documents déjà téléchargés restent sur ton appareil. Aucune donnée d'élève n'est stockée.</p>
                    {confirmerCompte ? (
                      <ConfirmationSuppression
                        titre="Supprimer définitivement ton compte ?"
                        texte="Tes documents enregistrés, tes classes, tes écoles et ton profil seront effacés. Cette action est irréversible."
                        confirmer="Oui, supprimer mon compte"
                        occupe={occupe}
                        onConfirmer={() => void supprimerCompte()}
                        onAnnuler={() => setConfirmerCompte(false)}
                      />
                    ) : (
                      <button type="button" className="compte-bouton compte-danger" disabled={occupe} onClick={() => setConfirmerCompte(true)}>
                        Supprimer définitivement mon compte
                      </button>
                    )}
                  </details>
                </div>
              </section>
            </div>

            <ApercuCartouche cartouche={apercu} surligne={surligne} ecoleParDefaut={ecoleApercu ? ecoleApercu.nom.trim() || null : null} idTitre={`${id}-apercu`} />
          </div>
        </div>
      </MenuEspace>
    </div>
  )
}

/** Confirmation intégrée à la page (remplace `window.confirm`) : le focus va sur « Annuler ». */
function ConfirmationSuppression({ titre, texte, confirmer, occupe, onConfirmer, onAnnuler }: { titre: string; texte: string; confirmer: string; occupe: boolean; onConfirmer: () => void; onAnnuler: () => void }) {
  const id = useId()
  const annuler = useRef<HTMLButtonElement>(null)
  useEffect(() => annuler.current?.focus(), [])
  return (
    <div
      className="profil-confirmation"
      role="group"
      aria-labelledby={`${id}-titre`}
      aria-describedby={`${id}-texte`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onAnnuler()
        }
      }}
    >
      <p id={`${id}-titre`} className="profil-confirmation-titre">
        {titre}
      </p>
      <p id={`${id}-texte`}>{texte}</p>
      <div className="profil-actions">
        <button type="button" className="compte-bouton compte-danger" disabled={occupe} onClick={onConfirmer}>
          {confirmer}
        </button>
        <button type="button" className="carnet-bouton" ref={annuler} onClick={onAnnuler}>
          Annuler
        </button>
      </div>
    </div>
  )
}

function EditionEcole({
  ecole,
  classe,
  occupe,
  onValeurs,
  onFocus,
  onAnnuler,
  onEnregistrer,
}: {
  ecole: Ecole
  classe: string
  occupe: boolean
  onValeurs: (v: { nom: string; adresse: string }) => void
  onFocus: (f: Focus) => void
  onAnnuler: () => void
  onEnregistrer: (s: { nom: string; adresse: string }) => Promise<unknown>
}) {
  const [nom, setNom] = useState(ecole.nom)
  const [adresse, setAdresse] = useState(ecole.adresse)
  const [erreur, setErreur] = useState<string | null>(null)
  return (
    <li className={`profil-ecole profil-ecole-edition ${classe}${ecole.par_defaut ? ' par-defaut' : ''}`} data-ecole={ecole.id}>
      <form
        className="profil-sous-form"
        noValidate
        aria-label={`Modifier l'école ${ecole.nom}`}
        onSubmit={(e) => {
          e.preventDefault()
          const err = erreurEcole(nom, adresse)
          setErreur(err)
          if (!err) void onEnregistrer({ nom, adresse })
        }}
      >
        <Champ
          label="Nom de l'école"
          valeur={nom}
          onChange={(v) => {
            setNom(v)
            onValeurs({ nom: v, adresse })
          }}
          erreur={erreur}
          autoFocus
          onFocus={() => onFocus('ecole')}
          onBlur={() => onFocus(null)}
        />
        <Champ
          label="Adresse"
          valeur={adresse}
          onChange={(v) => {
            setAdresse(v)
            onValeurs({ nom, adresse: v })
          }}
          onFocus={() => onFocus('adresse')}
          onBlur={() => onFocus(null)}
        />
        <div className="profil-actions">
          <button type="submit" className="carnet-bouton principal" disabled={occupe}>
            Enregistrer
          </button>
          <button type="button" className="carnet-bouton" onClick={onAnnuler}>
            Annuler
          </button>
        </div>
      </form>
    </li>
  )
}
