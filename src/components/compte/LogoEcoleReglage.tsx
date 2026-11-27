import { useId, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Ecole } from '../../lib/compteValidation'
import { enregistrerLogo, majLogoLocal, chargerLogos, type EtatLogos } from '../../lib/logoEcole'
import { ErreurLogo, preparerLogo } from '../../lib/logoImage'

/**
 * Réglages → En-tête des copies : « Ajouter le logo de l'école » (FACULTATIF, une ligne par école).
 * L'image choisie est réduite DANS LE NAVIGATEUR (`lib/logoImage.ts` : 600 px de large au plus, ≈ 150 Ko au
 * plus, PNG transparent gardé) puis enregistrée dans l'école (`lib/logoEcole.ts`, 0012) ; « Retirer le
 * logo » la vide. Sans 0012 : bouton désactivé « Applique la migration 0012… », rien n'est envoyé.
 */
export function LogoEcoleReglage({ client, proprietaire, ecoles, etat }: { client: SupabaseClient; proprietaire: string; ecoles: Ecole[]; etat: EtatLogos }) {
  const id = useId()
  const [occupe, setOccupe] = useState<string | null>(null)
  const [message, setMessage] = useState<{ texte: string; erreur: boolean } | null>(null)
  const entrees = useRef<Record<string, HTMLInputElement | null>>({})

  const absente = etat.etat === 'absente'
  const logos = etat.etat === 'actif' ? etat.logos : {}
  const pret = etat.etat === 'actif'

  async function choisir(ecole: Ecole, fichier: File | undefined) {
    if (!fichier) return
    setOccupe(ecole.id)
    setMessage(null)
    try {
      const prep = await preparerLogo(fichier)
      const ok = await enregistrerLogo(client, ecole.id, prep.dataUrl)
      if (!ok) {
        void chargerLogos(client, proprietaire, true)
        setMessage({ texte: "Applique d'abord la migration 0012 (logo de l'école) dans Supabase : rien n'a été enregistré.", erreur: true })
        return
      }
      majLogoLocal(ecole.id, prep.dataUrl)
      setMessage({ texte: `Logo de « ${ecole.nom} » enregistré (${Math.max(1, Math.round(prep.octets / 1024))} Ko, ${prep.largeur} × ${prep.hauteur} px${prep.transparent ? ', fond transparent gardé' : ''}). Il s'imprime à gauche de l'en-tête de tes documents.`, erreur: false })
    } catch (ex) {
      setMessage({ texte: ex instanceof ErreurLogo || ex instanceof Error ? ex.message : "Le logo n'a pas pu être enregistré.", erreur: true })
    } finally {
      setOccupe(null)
      const entree = entrees.current[ecole.id]
      if (entree) entree.value = ''
    }
  }

  async function retirer(ecole: Ecole) {
    setOccupe(ecole.id)
    setMessage(null)
    try {
      const ok = await enregistrerLogo(client, ecole.id, null)
      if (ok) {
        majLogoLocal(ecole.id, null)
        setMessage({ texte: `Logo de « ${ecole.nom} » retiré : tes documents s'impriment sans logo.`, erreur: false })
      }
    } catch (ex) {
      setMessage({ texte: ex instanceof Error ? ex.message : "Le logo n'a pas pu être retiré.", erreur: true })
    } finally {
      setOccupe(null)
    }
  }

  return (
    <div className="profil-logo" role="group" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`} className="profil-logo-titre">
        Logo de l'école <span className="profil-logo-facultatif">(facultatif)</span>
      </h3>
      {ecoles.length === 0 ? (
        <p className="profil-logo-aide">Ajoute d'abord ton école (Mes écoles) : le logo s'y rattache.</p>
      ) : (
        <ul className="profil-logo-liste">
          {ecoles.map((ecole) => {
            const logo = logos[ecole.id]
            const enCours = occupe === ecole.id
            return (
              <li key={ecole.id} className="profil-logo-ligne">
                <span className={`profil-logo-vignette${logo ? '' : ' vide'}`}>{logo ? <img src={logo} alt={`Logo actuel de ${ecole.nom}`} /> : <span aria-hidden="true">—</span>}</span>
                <span className="profil-logo-texte">
                  {ecoles.length > 1 && <strong>{ecole.nom}</strong>}
                  <span>{absente ? 'Pas encore disponible' : etat.etat === 'chargement' ? 'Lecture…' : logo ? 'Imprimé à gauche de l’en-tête' : 'Pas de logo'}</span>
                </span>
                <span className="profil-logo-actions">
                  <input
                    ref={(el) => {
                      entrees.current[ecole.id] = el
                    }}
                    id={`${id}-${ecole.id}`}
                    className="carnet-sr"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(e) => void choisir(ecole, e.currentTarget.files?.[0])}
                  />
                  <button type="button" className="profil-logo-bouton" disabled={!pret || occupe !== null} onClick={() => entrees.current[ecole.id]?.click()}>
                    {absente ? 'Applique la migration 0012 pour ajouter un logo' : enCours ? 'Préparation…' : logo ? 'Remplacer le logo' : "Ajouter le logo de l'école"}
                    {ecoles.length > 1 && !absente && <span className="carnet-sr"> ({ecole.nom})</span>}
                  </button>
                  {logo && (
                    <button type="button" className="profil-logo-bouton discret" disabled={occupe !== null} onClick={() => void retirer(ecole)}>
                      Retirer le logo{ecoles.length > 1 && <span className="carnet-sr"> ({ecole.nom})</span>}
                    </button>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {absente ? (
        <p className="profil-logo-aide">
          Pour ajouter un logo, colle le fichier <code>supabase/migrations/0012_logo_ecole.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → coller tout le fichier → Run).
          Tout le reste marche sans.
        </p>
      ) : etat.etat === 'erreur' ? (
        <p className="profil-logo-aide">Les logos n'ont pas pu être lus : recharge la page pour réessayer.</p>
      ) : (
        <p className="profil-logo-aide">PNG, JPG ou WEBP. L'image est réduite sur ton appareil (600 px de large, 150 Ko au plus) ; un fond transparent est gardé.</p>
      )}
      <p className={`profil-logo-message${message?.erreur ? ' erreur' : ''}`} role={message?.erreur ? 'alert' : 'status'}>
        {message?.texte ?? ''}
      </p>
    </div>
  )
}
