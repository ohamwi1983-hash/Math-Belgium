import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { chargerSupabase, jetonStockePresent, jetonsDansUrl, supabaseConfigure } from './supabase'
import { deconnecter, lireEcoles, lireProfil } from './compteDonnees'
import { messageErreur, type Ecole, type Profil } from './compteValidation'

/**
 * État du compte du visiteur, partagé par tout le site (`CompteProvider` autour de l'application).
 *
 * - `indisponible` : Supabase non configuré (aucune variable) — pages publiques inchangées, pages
 *   réservées : « Connexion indisponible (configuration manquante) ».
 * - `inactif` : configuré, mais supabase-js pas encore chargé (page de cours sans session stockée :
 *   rien n'est téléchargé). Une page réservée appelle `demarrer()`.
 * - `chargement` → `anonyme` (pas de session) ou `connecte` (session ; `profil` et `ecoles` lus
 *   ensuite — `profil.actif = false` : compte désactivé par l'administrateur).
 */
export type EtatCompte = 'indisponible' | 'inactif' | 'chargement' | 'anonyme' | 'connecte'

export interface ValeurCompte {
  etat: EtatCompte
  client: SupabaseClient | null
  utilisateur: { id: string; email: string } | null
  profil: Profil | null
  ecoles: Ecole[]
  /** Erreur de lecture du profil (base pas encore installée, serveur en veille…). */
  erreurProfil: string | null
  /** Arrivée par le lien « mot de passe oublié » (événement PASSWORD_RECOVERY). */
  recuperation: boolean
  demarrer: () => void
  rafraichir: () => Promise<void>
  seDeconnecter: () => Promise<void>
}

const ContexteCompte = createContext<ValeurCompte | null>(null)

export function CompteProvider({ children }: { children: ReactNode }) {
  const configure = supabaseConfigure()
  const [etat, setEtat] = useState<EtatCompte>(() => (!configure ? 'indisponible' : jetonStockePresent() || jetonsDansUrl() ? 'chargement' : 'inactif'))
  const [demande, setDemande] = useState(etat === 'chargement')
  const [client, setClient] = useState<SupabaseClient | null>(null)
  const [utilisateur, setUtilisateur] = useState<{ id: string; email: string } | null>(null)
  const [profil, setProfil] = useState<Profil | null>(null)
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [erreurProfil, setErreurProfil] = useState<string | null>(null)
  const [recuperation, setRecuperation] = useState(false)
  const idCharge = useRef<string | null>(null)

  const chargerDonnees = useCallback(async (c: SupabaseClient, id: string) => {
    try {
      const [p, e] = await Promise.all([lireProfil(c, id), lireEcoles(c)])
      if (idCharge.current !== id) return
      setProfil(p)
      setEcoles(e)
      setErreurProfil(p ? null : "Profil introuvable : l'inscription n'a pas abouti. Contacte l'administrateur du site.")
    } catch (err) {
      if (idCharge.current !== id) return
      setErreurProfil(messageErreur(err))
    }
  }, [])

  const appliquerSession = useCallback(
    async (c: SupabaseClient, session: Session | null) => {
      if (!session?.user) {
        idCharge.current = null
        setUtilisateur(null)
        setProfil(null)
        setEcoles([])
        setErreurProfil(null)
        setEtat('anonyme')
        return
      }
      const id = session.user.id
      setUtilisateur({ id, email: session.user.email ?? '' })
      if (idCharge.current !== id) {
        idCharge.current = id
        setEtat('chargement')
        setProfil(null)
        setErreurProfil(null)
        await chargerDonnees(c, id)
      }
      setEtat('connecte')
    },
    [chargerDonnees],
  )

  useEffect(() => {
    if (!demande) return
    let annule = false
    let desabonner: (() => void) | null = null
    void chargerSupabase().then((c) => {
      if (annule) return
      if (!c) {
        setEtat('indisponible')
        return
      }
      setClient(c)
      // INITIAL_SESSION est émis dès l'abonnement (session stockée ou lue dans l'URL).
      // Jamais d'appel Supabase DANS le rappel (verrou interne de supabase-js) : `setTimeout`.
      const { data } = c.auth.onAuthStateChange((evenement, session) => {
        if (evenement === 'PASSWORD_RECOVERY') setRecuperation(true)
        setTimeout(() => {
          if (!annule) void appliquerSession(c, session)
        }, 0)
      })
      desabonner = () => data.subscription.unsubscribe()
    })
    return () => {
      annule = true
      desabonner?.()
    }
  }, [demande, appliquerSession])

  const demarrer = useCallback(() => {
    if (!configure) return
    setDemande(true)
    setEtat((e) => (e === 'inactif' ? 'chargement' : e))
  }, [configure])

  const rafraichir = useCallback(async () => {
    if (client && idCharge.current) await chargerDonnees(client, idCharge.current)
  }, [client, chargerDonnees])

  const seDeconnecter = useCallback(async () => {
    if (!client) return
    try {
      await deconnecter(client)
    } finally {
      await appliquerSession(client, null)
    }
  }, [client, appliquerSession])

  const valeur = useMemo<ValeurCompte>(
    () => ({ etat, client, utilisateur, profil, ecoles, erreurProfil, recuperation, demarrer, rafraichir, seDeconnecter }),
    [etat, client, utilisateur, profil, ecoles, erreurProfil, recuperation, demarrer, rafraichir, seDeconnecter],
  )
  return <ContexteCompte.Provider value={valeur}>{children}</ContexteCompte.Provider>
}

const HORS_FOURNISSEUR: ValeurCompte = {
  etat: 'indisponible',
  client: null,
  utilisateur: null,
  profil: null,
  ecoles: [],
  erreurProfil: null,
  recuperation: false,
  demarrer: () => undefined,
  rafraichir: async () => undefined,
  seDeconnecter: async () => undefined,
}

/** État du compte ; `{ demarrer: true }` charge supabase-js si ce n'est pas déjà fait (pages
 * réservées, formulaires de connexion). Hors `CompteProvider` : « indisponible ». */
export function useCompte(options?: { demarrer?: boolean }): ValeurCompte {
  const valeur = useContext(ContexteCompte) ?? HORS_FOURNISSEUR
  const { demarrer, etat } = valeur
  const doitDemarrer = options?.demarrer === true && etat === 'inactif'
  useEffect(() => {
    if (doitDemarrer) demarrer()
  }, [doitDemarrer, demarrer])
  return valeur
}

/** Professeur connecté avec un compte actif et un profil lu. */
export function estConnecteActif(compte: ValeurCompte): compte is ValeurCompte & { client: SupabaseClient; profil: Profil } {
  return compte.etat === 'connecte' && compte.client !== null && compte.profil !== null && compte.profil.actif
}
