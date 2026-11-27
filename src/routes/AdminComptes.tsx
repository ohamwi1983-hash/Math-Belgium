import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { MenuActions } from '../components/carnet/MenuActions'
import { PanneauLateral } from '../components/carnet/PanneauLateral'
import { Champ } from '../components/compte/Champ'
import { MenuEspace } from '../components/compte/MenuEspace'
import '../components/compte/profil.css'
import '../components/compte/admin.css'
import {
  accord,
  codeAbrege,
  codeDuProfesseur,
  compterCodes,
  compterProfesseurs,
  connexionDetaillee,
  connexionRelative,
  correspondFiltre,
  correspondRecherche,
  dansJours,
  dateCourte,
  dateLongue,
  etatCode,
  etatProfesseur,
  FILTRES_CODES,
  FILTRES_PROFESSEURS,
  initiale,
  libelleEtatCode,
  phraseAccompagner,
  pluriel,
  type EtatCode,
  type FiltreProfesseurs,
} from '../lib/compteAdmin'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { definirActif, genererCodes, listerInvitations, listerProfesseurs, revoquerCode, type Invitation, type Professeur } from '../lib/compteDonnees'
import { finDeJournee, formaterCode, lireEntier, messageErreur } from '../lib/compteValidation'

/**
 * Page `/admin` quand les comptes sont configurés (réservée à `profils.est_admin`, garde
 * `PageReservee admin`). Refonte du 22/11/2026 (maquette « B, tableaux » + deux ajouts de « C ») :
 * menu « Mon espace », bandeau sombre, onglets Professeurs / Codes d'invitation (`?onglet=codes`),
 * recherche et filtres, tableau + fiche à droite (`?prof=<id>` ; tiroir sur téléphone), « par quel
 * code » chaque professeur est arrivé (jointure côté client), repère « à accompagner », panneau
 * « + Inviter ». Mêmes RPC qu'avant, aucun SQL. L'admin ne voit que des NOMBRES (jamais plans,
 * écoles, carnets).
 */
export function AdminComptes() {
  const compte = useCompte()
  const client = compte.client
  const id = useId()
  const [params, setParams] = useSearchParams()
  const onglet: 'professeurs' | 'codes' = params.get('onglet') === 'codes' ? 'codes' : 'professeurs'
  const idChoisi = onglet === 'professeurs' ? params.get('prof') : null
  const etroit = useEtroit()

  const [invitations, setInvitations] = useState<Invitation[] | null>(null)
  const [professeurs, setProfesseurs] = useState<Professeur[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [filtreProfs, setFiltreProfs] = useState<FiltreProfesseurs>('tous')
  const [filtreCodes, setFiltreCodes] = useState<EtatCode | 'tous'>('attente')
  const [inviter, setInviter] = useState(false)
  const [nouveaux, setNouveaux] = useState<Set<string>>(() => new Set())
  const [aDesactiver, setADesactiver] = useState<string | null>(null)
  const [aRevoquer, setARevoquer] = useState<string | null>(null)
  const [copie, setCopie] = useState<Copie | null>(null)

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

  // Focus à rendre après un rendu (bouton qui apparaît une fois l'action faite) : effet sans
  // dépendances, exécuté après chaque rendu validé.
  const focusVoulu = useRef<string | null>(null)
  useEffect(() => {
    if (!focusVoulu.current) return
    const el = document.querySelector<HTMLElement>(focusVoulu.current)
    if (el) {
      el.focus()
      focusVoulu.current = null
    }
  })

  // Une confirmation en cours ne survit pas à un changement de fiche.
  useEffect(() => setADesactiver(null), [idChoisi])

  const idMoi = compte.profil?.id ?? ''
  const maintenant = Date.now()
  const comptesProfs = compterProfesseurs(professeurs ?? [], idMoi, maintenant)
  const comptesCodes = compterCodes(invitations ?? [], maintenant)

  if (!estConnecteActif(compte) || !client) return null

  const lienInvitation = (code: string) => `${window.location.origin}/inscription?code=${formaterCode(code)}`

  async function copierLien(code: string) {
    const lien = lienInvitation(code)
    setCopie({ code, lien, ok: await copierDansPressePapiers(lien) })
  }

  async function agir(action: () => Promise<unknown>, succes: string) {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      await action()
      await recharger()
      setMessage(succes)
      return true
    } catch (ex) {
      setErreur(messageErreur(ex))
      return false
    } finally {
      setOccupe(false)
    }
  }

  function changerOnglet(o: 'professeurs' | 'codes', focus = false) {
    setCopie(null)
    setARevoquer(null)
    setParams(o === 'codes' ? { onglet: 'codes' } : {}, { replace: true })
    if (focus) requestAnimationFrame(() => document.getElementById(`${id}-onglet-${o}`)?.focus())
  }

  function choisir(idProf: string | null) {
    setParams(idProf ? { prof: idProf } : {}, { replace: true })
  }

  const profs = professeurs ?? []
  const choisi = idChoisi ? (profs.find((p) => p.id === idChoisi) ?? null) : null
  const visibles = profs.filter((p) => correspondFiltre(p, filtreProfs, idMoi, maintenant) && correspondRecherche(p, recherche))
  const codesVisibles = (invitations ?? []).filter((i) => filtreCodes === 'tous' || etatCode(i, maintenant) === filtreCodes)
  const viaDe = (p: Professeur) => (invitations ? codeDuProfesseur(invitations, p.id) : null)
  const rang = (p: Professeur) => profs.indexOf(p)

  const boutonInviter = (
    <button type="button" className="carnet-bouton admin-bouton-inviter" aria-haspopup="dialog" onClick={() => setInviter(true)}>
      + Inviter
    </button>
  )

  const fiche = choisi && (
    <FicheProfesseur
      p={choisi}
      rang={rang(choisi)}
      via={viaDe(choisi)}
      invitationsChargees={invitations !== null}
      estMoi={choisi.id === idMoi}
      occupe={occupe}
      confirmer={aDesactiver === choisi.id}
      titreId={`${id}-fiche-titre`}
      onFermer={etroit ? () => choisir(null) : undefined}
      onDesactiver={() => setADesactiver(choisi.id)}
      onAnnuler={() => {
        focusVoulu.current = '.admin-fiche-desactiver'
        setADesactiver(null)
      }}
      onConfirmer={async () => {
        setADesactiver(null)
        if (await agir(() => definirActif(client, choisi.id, false), `Compte de ${choisi.nom_affiche} désactivé.`)) focusVoulu.current = '.admin-fiche-reactiver'
      }}
      onReactiver={async () => {
        if (await agir(() => definirActif(client, choisi.id, true), `Compte de ${choisi.nom_affiche} réactivé.`)) focusVoulu.current = '.admin-fiche-desactiver'
      }}
    />
  )

  const nombreActifs = profs.filter((p) => p.actif).length

  return (
    <div className="admin">
      <MenuEspace>
        <div className="admin-contenu">
          <section className="admin-bandeau" aria-labelledby={`${id}-titre`}>
            <span className="admin-bandeau-icone" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
              </svg>
            </span>
            <div className="admin-bandeau-texte">
              <p className="admin-bandeau-surtitre">ESPACE ADMINISTRATEUR</p>
              <h1 id={`${id}-titre`}>Administration</h1>
              <p className="admin-bandeau-sous-titre">Réservé à l’administrateur · tu ne vois ni les documents, ni les écoles, ni les classes de tes collègues</p>
              <p className="admin-bandeau-liens">
                Concevoir : <Link to="/evaluation">évaluations et examens</Link> · <Link to="/exercice">feuilles d’exercices</Link>
              </p>
            </div>
            {professeurs && invitations && (
              <ul className="admin-bandeau-pastilles" aria-label="En bref">
                <li className="admin-bandeau-pastille">
                  <span className="admin-point bleu" aria-hidden="true" />
                  {pluriel(nombreActifs, 'professeur actif', 'professeurs actifs')}
                </li>
                <li className="admin-bandeau-pastille">
                  <span className="admin-point orange" aria-hidden="true" />
                  {pluriel(comptesCodes.attente, 'code en attente', 'codes en attente')}
                </li>
                {comptesProfs.desactives > 0 && (
                  <li className="admin-bandeau-pastille">
                    <span className="admin-point gris" aria-hidden="true" />
                    {pluriel(comptesProfs.desactives, 'compte désactivé', 'comptes désactivés')}
                  </li>
                )}
                {comptesProfs.accompagner > 0 && (
                  <li className="admin-bandeau-pastille">
                    <span className="admin-point ciel" aria-hidden="true" />
                    {comptesProfs.accompagner} à accompagner
                  </li>
                )}
              </ul>
            )}
          </section>

          {(message || erreur) && (
            <p className={`admin-message ${erreur ? 'compte-erreur-champ' : 'compte-message'}`} role={erreur ? 'alert' : 'status'}>
              {erreur ?? message}
            </p>
          )}

          <div
            role="tablist"
            aria-label="Administration"
            className="admin-onglets"
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              const ordre = ['professeurs', 'codes'] as const
              const i = ordre.indexOf(onglet)
              const cible =
                e.key === 'ArrowRight' ? ordre[(i + 1) % 2] : e.key === 'ArrowLeft' ? ordre[(i + 1) % 2] : e.key === 'Home' ? ordre[0] : e.key === 'End' ? ordre[1] : null
              if (!cible) return
              e.preventDefault()
              changerOnglet(cible, true)
            }}
          >
            {(['professeurs', 'codes'] as const).map((o) => (
              <button
                key={o}
                type="button"
                role="tab"
                id={`${id}-onglet-${o}`}
                aria-selected={onglet === o}
                aria-controls={`${id}-panneau-${o}`}
                tabIndex={onglet === o ? 0 : -1}
                className="admin-onglet"
                onClick={() => onglet !== o && changerOnglet(o)}
              >
                {o === 'professeurs' ? 'Professeurs' : 'Codes d’invitation'}
                {(o === 'professeurs' ? professeurs : invitations) && <span className="admin-onglet-compte">{o === 'professeurs' ? profs.length : comptesCodes.tous}</span>}
              </button>
            ))}
          </div>

          {copie && !inviter && <RetourCopie copie={copie} onFermer={() => setCopie(null)} />}

          {onglet === 'professeurs' ? (
            <div role="tabpanel" id={`${id}-panneau-professeurs`} aria-labelledby={`${id}-onglet-professeurs`} className="admin-panneau-onglet">
              <div className="admin-barre">
                <div className="admin-recherche">
                  <label htmlFor={`${id}-recherche`} className="carnet-sr">
                    Chercher un professeur (nom ou e-mail)
                  </label>
                  <input
                    id={`${id}-recherche`}
                    type="search"
                    className="admin-champ-recherche"
                    placeholder="Chercher un nom, un e-mail…"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                {boutonInviter}
              </div>
              <Puces
                libelle="Filtrer les professeurs"
                puces={FILTRES_PROFESSEURS.filter((f) => f.id === 'tous' || f.id === filtreProfs || comptesProfs[f.id] > 0).map((f) => ({ id: f.id, libelle: f.libelle, nombre: comptesProfs[f.id] }))}
                actif={filtreProfs}
                onChoisir={(f) => setFiltreProfs(f as FiltreProfesseurs)}
                pret={professeurs !== null}
              />

              <div className="admin-grille">
                <section className="admin-liste" aria-label="Liste des professeurs">
                  {professeurs === null ? (
                    <p className="compte-chargement admin-vide" role="status">
                      Chargement…
                    </p>
                  ) : visibles.length === 0 ? (
                    <p className="admin-vide">
                      {recherche.trim() ? (
                        <>
                          Aucun professeur ne correspond à « {recherche.trim()} ».{' '}
                          <button type="button" className="profil-lien-bouton" onClick={() => setRecherche('')}>
                            Effacer la recherche
                          </button>
                        </>
                      ) : (
                        FILTRES_PROFESSEURS.find((f) => f.id === filtreProfs)?.vide
                      )}
                    </p>
                  ) : etroit ? (
                    <ul className="admin-cartes">
                      {visibles.map((p) => (
                        <li key={p.id}>
                          <button type="button" className="admin-carte-prof" aria-haspopup="dialog" onClick={() => choisir(p.id)} data-prof={p.id}>
                            <Avatar p={p} rang={rang(p)} />
                            <span className="admin-carte-texte">
                              <span className="admin-carte-ligne">
                                <strong>{p.nom_affiche}</strong>
                                <PastilleEtat p={p} idMoi={idMoi} />
                              </span>
                              <span className="admin-meta">{p.email}</span>
                              <Via via={viaDe(p)} p={p} charge={invitations !== null} />
                              <span className="admin-meta">
                                vu {connexionRelative(p.derniere_connexion, maintenant)} · {pluriel(Number(p.nombre_plans), 'enreg.', 'enreg.')} · {pluriel(Number(p.nombre_ecoles), 'école')}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="admin-tableau-cadre">
                      <table className="admin-tableau">
                        <thead>
                          <tr>
                            <th scope="col">Professeur</th>
                            <th scope="col">État</th>
                            <th scope="col">Inscrit le</th>
                            <th scope="col">Dernière connexion</th>
                            <th scope="col" className="nombre">
                              <abbr title="Enregistrements">Enreg.</abbr>
                            </th>
                            <th scope="col" className="nombre">
                              Écoles
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibles.map((p) => {
                            const sel = p.id === idChoisi
                            return (
                              <tr key={p.id} className={`${sel ? 'choisi' : ''}${p.actif ? '' : ' inactif'}`} onClick={() => choisir(p.id)} data-prof={p.id}>
                                <td className="prof">
                                  <span className="admin-cellule-prof">
                                    <Avatar p={p} rang={rang(p)} />
                                    <span className="admin-cellule-texte">
                                      <button
                                        type="button"
                                        className="admin-nom-bouton"
                                        aria-current={sel ? 'true' : undefined}
                                        aria-controls={`${id}-fiche`}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          choisir(p.id)
                                        }}
                                      >
                                        {p.nom_affiche}
                                      </button>
                                      <span className="admin-meta" title={p.email}>
                                        {p.email}
                                      </span>
                                      <Via via={viaDe(p)} p={p} charge={invitations !== null} />
                                    </span>
                                  </span>
                                </td>
                                <td>
                                  <PastilleEtat p={p} idMoi={idMoi} />
                                </td>
                                <td className="admin-meta date">{dateCourte(p.inscrit_le)}</td>
                                <td className="admin-meta date">{connexionRelative(p.derniere_connexion, maintenant)}</td>
                                <td className="nombre">{Number(p.nombre_plans)}</td>
                                <td className="nombre">{Number(p.nombre_ecoles)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {!etroit && (
                  <aside className="admin-fiche" id={`${id}-fiche`} aria-labelledby={choisi ? `${id}-fiche-titre` : undefined} aria-label={choisi ? undefined : 'Fiche du professeur'}>
                    {fiche || (
                      <div className="admin-fiche-vide">
                        <p>
                          <strong>Choisis un professeur</strong> dans la liste pour ouvrir sa fiche : par quel code il est arrivé, sa dernière connexion et ce qu’il a enregistré — des nombres,
                          jamais le contenu.
                        </p>
                      </div>
                    )}
                  </aside>
                )}
              </div>
              {etroit && choisi && (
                <PanneauLateral titreId={`${id}-fiche-titre`} onFermer={() => choisir(null)}>
                  <div className="admin-tiroir">{fiche}</div>
                </PanneauLateral>
              )}
            </div>
          ) : (
            <div role="tabpanel" id={`${id}-panneau-codes`} aria-labelledby={`${id}-onglet-codes`} className="admin-panneau-onglet">
              <div className="admin-barre">
                <Puces
                  libelle="Filtrer les codes par état"
                  puces={FILTRES_CODES.map((f) => ({ id: f.id, libelle: f.libelle, nombre: comptesCodes[f.id] }))}
                  actif={filtreCodes}
                  onChoisir={(f) => {
                    setARevoquer(null)
                    setFiltreCodes(f as EtatCode | 'tous')
                  }}
                  pret={invitations !== null}
                />
                {boutonInviter}
              </div>
              <section className="admin-liste" aria-label="Codes d’invitation">
                {invitations === null ? (
                  <p className="compte-chargement admin-vide" role="status">
                    Chargement…
                  </p>
                ) : codesVisibles.length === 0 ? (
                  <p className="admin-vide">
                    {FILTRES_CODES.find((f) => f.id === filtreCodes)?.vide}
                    {(filtreCodes === 'attente' || filtreCodes === 'tous') && (
                      <>
                        {' : '}
                        <button type="button" className="profil-lien-bouton" aria-haspopup="dialog" onClick={() => setInviter(true)}>
                          + Inviter
                        </button>
                      </>
                    )}
                  </p>
                ) : (
                  <TableCodes
                    codes={codesVisibles}
                    etroit={etroit}
                    maintenant={maintenant}
                    nouveaux={nouveaux}
                    profs={profs}
                    aRevoquer={aRevoquer}
                    occupe={occupe}
                    onCopier={(c) => void copierLien(c)}
                    onRevoquer={(i) => setARevoquer(i)}
                    onAnnulerRevocation={(i) => {
                      focusVoulu.current = `[data-code="${i}"] .carnet-bouton-trois-points`
                      setARevoquer(null)
                    }}
                    onConfirmerRevocation={(i) => {
                      setARevoquer(null)
                      void agir(() => revoquerCode(client, i.id), `Code ${formaterCode(i.code)} révoqué.`)
                    }}
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </MenuEspace>

      {inviter && (
        <PanneauInviter
          copie={copie}
          onCopier={(c) => void copierLien(c)}
          onFermer={() => {
            setInviter(false)
            setCopie(null)
          }}
          onGenerer={async (n, expireLe, note) => {
            setErreur(null)
            setMessage(null)
            const codes = await genererCodes(client, n, expireLe, note)
            setNouveaux((s) => new Set([...s, ...codes.map((c) => c.id)]))
            setFiltreCodes('attente')
            await recharger()
            setMessage(`${n} code${n > 1 ? 's générés' : ' généré'}.`)
            return codes
          }}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------- petits morceaux */

interface Copie {
  code: string
  lien: string
  ok: boolean
}

/** Copie dans le presse-papiers ; faux si refusé (l'appelant montre alors le lien à copier à la main). */
async function copierDansPressePapiers(texte: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(texte)
      return true
    }
  } catch {
    // permission refusée, page non sécurisée… : repli ci-dessous
  }
  const zone = document.createElement('textarea')
  zone.value = texte
  zone.setAttribute('readonly', '')
  zone.style.position = 'fixed'
  zone.style.top = '0'
  zone.style.opacity = '0'
  document.body.appendChild(zone)
  zone.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  zone.remove()
  return ok
}

/** Vrai sous 760 px (téléphone) : cartes au lieu du tableau, fiche en tiroir. */
function useEtroit(): boolean {
  const requete = '(max-width: 759px)'
  const [etroit, setEtroit] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(requete).matches)
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const m = window.matchMedia(requete)
    const suivre = () => setEtroit(m.matches)
    suivre()
    m.addEventListener('change', suivre)
    return () => m.removeEventListener('change', suivre)
  }, [])
  return etroit
}

function RetourCopie({ copie, onFermer }: { copie: Copie; onFermer?: () => void }) {
  return copie.ok ? (
    <p className="admin-copie compte-message" role="status">
      ✓ Lien d’inscription du code <code>{formaterCode(copie.code)}</code> copié : colle-le dans ton message.
      {onFermer && (
        <button type="button" className="profil-lien-bouton" onClick={onFermer}>
          OK
        </button>
      )}
    </p>
  ) : (
    <div className="admin-copie admin-copie-repli" role="alert">
      <label htmlFor={`repli-${copie.code}`}>Le navigateur a refusé la copie : sélectionne le lien et copie-le à la main.</label>
      <input id={`repli-${copie.code}`} className="admin-champ-repli" readOnly value={copie.lien} onFocus={(e) => e.currentTarget.select()} autoFocus />
      {onFermer && (
        <button type="button" className="profil-lien-bouton" onClick={onFermer}>
          Fermer
        </button>
      )}
    </div>
  )
}

function Puces({ libelle, puces, actif, onChoisir, pret }: { libelle: string; puces: { id: string; libelle: string; nombre: number }[]; actif: string; onChoisir: (id: string) => void; pret: boolean }) {
  return (
    <div className="admin-puces" role="group" aria-label={libelle}>
      {puces.map((p) => (
        <button key={p.id} type="button" className="admin-puce" aria-pressed={actif === p.id} onClick={() => onChoisir(p.id)}>
          {p.libelle}
          {pret && <b>{p.nombre}</b>}
        </button>
      ))}
    </div>
  )
}

function Avatar({ p, rang, grand = false }: { p: Professeur; rang: number; grand?: boolean }) {
  return (
    <span className={`admin-avatar ${p.actif ? `admin-av-${Math.max(0, rang) % 6}` : 'inactif'}${grand ? ' grand' : ''}`} aria-hidden="true">
      {initiale(p.nom_affiche)}
    </span>
  )
}

function PastilleEtat({ p, idMoi }: { p: Professeur; idMoi: string }) {
  const etat = etatProfesseur(p, idMoi)
  const libelle = etat === 'toi' ? (p.est_admin ? 'admin · toi' : 'toi') : etat === 'desactive' ? 'désactivé' : etat === 'accompagner' ? 'à accompagner' : 'actif'
  return (
    <span className="admin-pastilles">
      <span className={`admin-pastille ${etat}`}>{libelle}</span>
      {p.est_admin && etat !== 'toi' && <span className="admin-pastille admin">admin</span>}
    </span>
  )
}

/** « via K7QM-… » sous le nom (tableau, cartes) ; « premier compte » pour l'admin sans code retrouvé. */
function Via({ via, p, charge }: { via: Invitation | null; p: Professeur; charge: boolean }) {
  if (!charge) return null
  if (via)
    return (
      <span className="admin-via" title={`Inscription avec le code ${formaterCode(via.code)}${via.note ? ` « ${via.note} »` : ''}`}>
        via <span className="admin-mono">{codeAbrege(via.code)}</span>
        {via.note && <> · {via.note}</>}
      </span>
    )
  return p.est_admin ? <span className="admin-via">premier compte</span> : null
}

function FicheProfesseur({
  p,
  rang,
  via,
  invitationsChargees,
  estMoi,
  occupe,
  confirmer,
  titreId,
  onFermer,
  onDesactiver,
  onAnnuler,
  onConfirmer,
  onReactiver,
}: {
  p: Professeur
  rang: number
  via: Invitation | null
  invitationsChargees: boolean
  estMoi: boolean
  occupe: boolean
  confirmer: boolean
  titreId: string
  onFermer?: () => void
  onDesactiver: () => void
  onAnnuler: () => void
  onConfirmer: () => void
  onReactiver: () => void
}) {
  const { e, pronom } = accord(p.nom_affiche)
  const accompagner = p.actif && !estMoi && Number(p.nombre_plans) === 0
  return (
    <div className="admin-fiche-corps">
      <div className="admin-fiche-tete">
        <Avatar p={p} rang={rang} grand />
        <div className="admin-fiche-titres">
          <h2 id={titreId}>{p.nom_affiche}</h2>
          <span className="admin-meta admin-fiche-email">{p.email}</span>
          <PastilleEtat p={p} idMoi={estMoi ? p.id : ''} />
        </div>
        {onFermer && (
          <button type="button" className="carnet-bouton admin-fiche-fermer" onClick={onFermer} data-autofocus>
            Fermer
          </button>
        )}
      </div>
      {accompagner && (
        <p className="admin-accompagner">
          <strong>À accompagner.</strong> {phraseAccompagner(p)}
        </p>
      )}
      <dl className="admin-fiche-details">
        <dt>Inscrit{e}</dt>
        <dd>le {dateLongue(p.inscrit_le)}</dd>
        <dt>Via le code</dt>
        <dd>
          {!invitationsChargees ? (
            '…'
          ) : via ? (
            <>
              <span className="admin-mono">{formaterCode(via.code)}</span>
              {via.note ? <> « {via.note} »</> : <span className="admin-meta"> (sans note)</span>}
            </>
          ) : p.est_admin ? (
            'premier compte (aucun code retrouvé)'
          ) : (
            <span className="admin-meta">aucun code retrouvé</span>
          )}
        </dd>
        <dt>Dernière connexion</dt>
        <dd>{connexionDetaillee(p.derniere_connexion)}</dd>
        <dt>Dans son compte</dt>
        <dd>
          {pluriel(Number(p.nombre_plans), 'enregistrement')} · {pluriel(Number(p.nombre_ecoles), 'école')}
        </dd>
      </dl>
      <p className="admin-meta admin-fiche-note">Tu vois des nombres, jamais le contenu de ses documents, de ses écoles ou de ses classes.</p>
      <div className="admin-fiche-actions">
        {estMoi ? (
          <p className="admin-meta">C’est ton compte : tu ne peux pas le désactiver toi-même.</p>
        ) : !p.actif ? (
          <>
            <p className="admin-meta">Compte désactivé : {pronom.toLocaleLowerCase('fr')} ne peut plus rien consulter ni enregistrer ; ses données sont conservées.</p>
            <button type="button" className="carnet-bouton principal admin-fiche-reactiver" disabled={occupe} onClick={onReactiver}>
              Réactiver le compte
            </button>
          </>
        ) : confirmer ? (
          <Confirmation
            titre={`Désactiver le compte de ${p.nom_affiche} ?`}
            texte={`${pronom} ne pourra plus rien consulter ni enregistrer (ses données sont conservées). Tu peux réactiver le compte à tout moment.`}
            confirmer="Désactiver"
            occupe={occupe}
            onConfirmer={onConfirmer}
            onAnnuler={onAnnuler}
          />
        ) : (
          <button type="button" className="carnet-bouton admin-bouton-danger admin-fiche-desactiver" disabled={occupe} onClick={onDesactiver}>
            Désactiver ce compte
          </button>
        )}
      </div>
    </div>
  )
}

/** Confirmation intégrée à la page (remplace `window.confirm`) : focus sur « Annuler », Échap annule. */
function Confirmation({ titre, texte, confirmer, occupe, onConfirmer, onAnnuler }: { titre: string; texte: string; confirmer: string; occupe: boolean; onConfirmer: () => void; onAnnuler: () => void }) {
  const id = useId()
  const annuler = useRef<HTMLButtonElement>(null)
  useEffect(() => annuler.current?.focus(), [])
  return (
    <div
      className="admin-confirmation"
      role="group"
      aria-labelledby={`${id}-titre`}
      aria-describedby={`${id}-texte`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          onAnnuler()
        }
      }}
    >
      <p id={`${id}-titre`} className="admin-confirmation-titre">
        {titre}
      </p>
      <p id={`${id}-texte`}>{texte}</p>
      <div className="admin-actions">
        <button type="button" className="carnet-bouton" ref={annuler} onClick={onAnnuler}>
          Annuler
        </button>
        <button type="button" className="carnet-bouton admin-bouton-danger plein" disabled={occupe} onClick={onConfirmer}>
          {confirmer}
        </button>
      </div>
    </div>
  )
}

function TableCodes({
  codes,
  etroit,
  maintenant,
  nouveaux,
  profs,
  aRevoquer,
  occupe,
  onCopier,
  onRevoquer,
  onAnnulerRevocation,
  onConfirmerRevocation,
}: {
  codes: Invitation[]
  etroit: boolean
  maintenant: number
  nouveaux: Set<string>
  profs: Professeur[]
  aRevoquer: string | null
  occupe: boolean
  onCopier: (code: string) => void
  onRevoquer: (id: string) => void
  onAnnulerRevocation: (id: string) => void
  onConfirmerRevocation: (i: Invitation) => void
}) {
  const utilisateur = (i: Invitation): ReactNode => {
    if (!i.utilise_le) return <span className="admin-meta">—</span>
    const nom = i.utilise_par_nom ?? i.utilise_par_email ?? 'un compte supprimé'
    const prof = i.utilise_par ? profs.find((p) => p.id === i.utilise_par) : undefined
    return prof ? (
      <Link to={`?prof=${encodeURIComponent(prof.id)}`} className="admin-lien-prof" aria-label={`${nom} : ouvrir sa fiche`}>
        {nom}
      </Link>
    ) : (
      <span>{nom}</span>
    )
  }
  const actions = (i: Invitation) =>
    etatCode(i, maintenant) === 'attente' ? (
      <MenuActions
        libelle={`Actions pour le code ${formaterCode(i.code)} : copier le lien, révoquer`}
        actions={[
          { texte: 'Copier le lien d’inscription', onChoisir: () => onCopier(i.code) },
          { texte: 'Révoquer', danger: true, desactive: occupe, onChoisir: () => onRevoquer(i.id) },
        ]}
      />
    ) : null
  const confirmation = (i: Invitation) => (
    <Confirmation
      titre={`Révoquer le code ${formaterCode(i.code)} ?`}
      texte="Il ne pourra plus servir à s’inscrire. Les comptes déjà créés ne sont pas touchés."
      confirmer="Révoquer"
      occupe={occupe}
      onConfirmer={() => onConfirmerRevocation(i)}
      onAnnuler={() => onAnnulerRevocation(i.id)}
    />
  )
  const etat = (i: Invitation) => {
    const e = libelleEtatCode(i, maintenant)
    return (
      <span className="admin-etat-code">
        <span className={`admin-pastille code-${e.etat}`}>{e.libelle}</span>
        {e.detail && <span className="admin-meta">{e.detail}</span>}
      </span>
    )
  }
  const codeCellule = (i: Invitation) => (
    <span className="admin-code-cellule">
      <code className="admin-code">{formaterCode(i.code)}</code>
      {nouveaux.has(i.id) && <span className="admin-pastille nouveau">nouveau</span>}
    </span>
  )

  if (etroit)
    return (
      <ul className="admin-cartes">
        {codes.map((i) => (
          <li key={i.id} className="admin-carte-code" data-code={i.id}>
            <div className="admin-carte-code-tete">
              {codeCellule(i)}
              {actions(i)}
            </div>
            <span className={i.note ? 'admin-note' : 'admin-meta'}>{i.note ?? '(sans note)'}</span>
            {etat(i)}
            <span className="admin-meta">
              créé le {dateCourte(i.cree_le)}
              {i.utilise_le && <> · par </>}
              {i.utilise_le && utilisateur(i)}
            </span>
            {aRevoquer === i.id && confirmation(i)}
          </li>
        ))}
      </ul>
    )

  return (
    <div className="admin-tableau-cadre">
      <table className="admin-tableau">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Note</th>
            <th scope="col">État</th>
            <th scope="col">Créé le</th>
            <th scope="col">Utilisé par</th>
            <th scope="col">
              <span className="carnet-sr">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {codes.map((i) => [
            <tr key={i.id} data-code={i.id}>
              <td>{codeCellule(i)}</td>
              <td className={i.note ? 'admin-note' : 'admin-meta'}>{i.note ?? '(sans note)'}</td>
              <td>{etat(i)}</td>
              <td className="admin-meta">{dateCourte(i.cree_le)}</td>
              <td>{utilisateur(i)}</td>
              <td className="admin-cellule-actions">{actions(i)}</td>
            </tr>,
            aRevoquer === i.id && (
              <tr key={`${i.id}-confirmation`} className="admin-ligne-confirmation">
                <td colSpan={6}>{confirmation(i)}</td>
              </tr>
            ),
          ])}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------------- panneau « Inviter » */

type ChoixExpiration = '7' | '30' | 'aucune' | 'date'

/** Formulaire de génération (mêmes validations qu'avant : 1 à 50 codes, saisie libre jamais
 * filtrée, expiration en fin de journée, note), puis les codes à transmettre. */
function PanneauInviter({
  copie,
  onCopier,
  onFermer,
  onGenerer,
}: {
  copie: Copie | null
  onCopier: (code: string) => void
  onFermer: () => void
  onGenerer: (n: number, expireLe: string | null, note: string) => Promise<Invitation[]>
}) {
  const id = useId()
  const [nombre, setNombre] = useState('1')
  const [choix, setChoix] = useState<ChoixExpiration>('30')
  const [date, setDate] = useState(() => dansJours(30))
  const [note, setNote] = useState('')
  const [erreurNombre, setErreurNombre] = useState<string | null>(null)
  const [erreurDate, setErreurDate] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [codes, setCodes] = useState<Invitation[] | null>(null)
  const corps = useRef<HTMLDivElement>(null)

  // Après la génération, le bouton « Générer » disparaît : le focus va sur la première copie.
  useEffect(() => {
    if (codes) corps.current?.querySelector<HTMLButtonElement>('.admin-codes-nouveaux button')?.focus()
  }, [codes])

  const dateChoisie = choix === '7' ? dansJours(7) : choix === '30' ? dansJours(30) : choix === 'date' ? date : ''
  const expireLe = dateChoisie.trim() ? finDeJournee(dateChoisie) : null

  async function generer(ev: FormEvent) {
    ev.preventDefault()
    const n = lireEntier(nombre)
    const errN = n === null || n < 1 || n > 50 ? 'Nombre de codes : un nombre entier entre 1 et 50.' : null
    const errD =
      choix === 'date' && !date.trim()
        ? 'Choisis une date d’expiration (ou « Sans limite »).'
        : choix === 'date' && !expireLe
          ? 'Date d’expiration illisible.'
          : expireLe && new Date(expireLe).getTime() <= Date.now()
            ? 'La date d’expiration doit être dans le futur.'
            : null
    setErreurNombre(errN)
    setErreurDate(errD)
    if (errN || errD || n === null) return
    setOccupe(true)
    setErreur(null)
    try {
      setCodes(await onGenerer(n, expireLe, note))
    } catch (ex) {
      setErreur(messageErreur(ex))
    } finally {
      setOccupe(false)
    }
  }

  const raccourcis: { id: ChoixExpiration; libelle: string }[] = [
    { id: '7', libelle: '7 jours' },
    { id: '30', libelle: '30 jours' },
    { id: 'aucune', libelle: 'Sans limite' },
    { id: 'date', libelle: 'Une date…' },
  ]

  return (
    <PanneauLateral titreId={`${id}-titre`} onFermer={onFermer}>
      <div className="carnet-form-panneau admin-inviter">
        <div className="carnet-panneau-tete">
          <div className="carnet-panneau-titres">
            <h2 id={`${id}-titre`}>{codes ? 'Codes à transmettre' : 'Inviter des collègues'}</h2>
            <p className="carnet-panneau-resume">Chaque code ne sert qu’une fois : un code par collègue.</p>
          </div>
          <button type="button" className="carnet-bouton" onClick={onFermer} data-autofocus={codes ? true : undefined}>
            Fermer
          </button>
        </div>
        {codes ? (
          <>
            <div className="carnet-panneau-corps" ref={corps}>
              <div className="compte-encadre compte-succes" role="status">
                <p>
                  {codes.length > 1 ? `${codes.length} codes générés` : 'Code généré'} — à transmettre (chaque code ne sert qu’une fois) :
                </p>
              </div>
              <ul className="admin-codes-nouveaux">
                {codes.map((c) => (
                  <li key={c.id}>
                    <code className="admin-code grand">{formaterCode(c.code)}</code>
                    <button type="button" className="carnet-bouton principal" onClick={() => onCopier(c.code)}>
                      Copier le lien d’inscription<span className="carnet-sr"> du code {formaterCode(c.code)}</span>
                    </button>
                    {copie?.code === c.code && <RetourCopie copie={copie} />}
                  </li>
                ))}
              </ul>
              <p className="admin-meta">
                {codes[0]?.note ? `Note : « ${codes[0].note} » · ` : ''}
                {codes[0]?.expire_le ? `valables jusqu’au ${dateCourte(codes[0].expire_le)}` : 'sans expiration'}. Ils apparaissent dans l’onglet « Codes d’invitation ».
              </p>
            </div>
            <div className="carnet-panneau-pied">
              <button
                type="button"
                className="carnet-bouton"
                onClick={() => {
                  setCodes(null)
                  setNote('')
                }}
              >
                Générer d’autres codes
              </button>
              <button type="button" className="carnet-bouton principal" onClick={onFermer}>
                Terminé
              </button>
            </div>
          </>
        ) : (
          <form className="carnet-form-panneau" onSubmit={generer} noValidate>
            <div className="carnet-panneau-corps">
              {erreur && (
                <p className="compte-erreur-champ" role="alert">
                  {erreur}
                </p>
              )}
              <Champ label="Pour qui ? (note facultative)" valeur={note} onChange={setNote} aide="Pour qui, pourquoi — visible seulement ici." autoComplete="off" data-autofocus />
              <Champ label="Nombre de codes" valeur={nombre} onChange={setNombre} erreur={erreurNombre} aide="Usage unique, 1 à 50." autoComplete="off" />
              <fieldset className="admin-expiration">
                <legend>Expiration</legend>
                <div className="admin-puces" role="group" aria-label="Durée de validité">
                  {raccourcis.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className="admin-puce"
                      aria-pressed={choix === r.id}
                      onClick={() => {
                        setChoix(r.id)
                        setErreurDate(null)
                      }}
                    >
                      {r.libelle}
                    </button>
                  ))}
                </div>
                {choix === 'date' && <Champ label="Expire le" type="date" valeur={date} onChange={setDate} erreur={erreurDate} />}
                {choix !== 'date' && erreurDate && <p className="compte-erreur-champ">{erreurDate}</p>}
                <p className="admin-meta" aria-live="polite">
                  {expireLe
                    ? `Valable jusqu’au ${dateLongue(expireLe)} inclus.`
                    : choix === 'aucune'
                      ? 'Sans expiration : valable jusqu’à ce qu’il serve ou que tu le révoques.'
                      : ''}
                </p>
              </fieldset>
            </div>
            <div className="carnet-panneau-pied">
              <button type="button" className="carnet-bouton" onClick={onFermer}>
                Annuler
              </button>
              <button type="submit" className="carnet-bouton principal" disabled={occupe}>
                {occupe ? 'Génération…' : 'Générer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PanneauLateral>
  )
}
