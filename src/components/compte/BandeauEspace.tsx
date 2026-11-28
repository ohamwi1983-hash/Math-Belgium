import { Children, type ReactNode } from 'react'
import './bandeau-espace.css'

/**
 * Bandeau sombre des pages « Mon espace » (profil, coffre, carnet, feuilles d'exercices, évaluations
 * et examens) : pastille ronde (initiale ou icône), « ESPACE PROFESSEUR », le `<h1>` de la page,
 * puis des pastilles d'information. Classes `profil-bandeau…` de `bandeau-espace.css` (importé ici ;
 * sorties de `profil.css`) : le rendu du profil et du coffre est celui d'avant, balise pour balise.
 * Sert aussi aux pages de connexion / inscription / mot de passe (`PageAcces`).
 * - `apresTitre` : sous-titre éventuel, dans le bloc du titre (ex. `coffre-bandeau-sous-titre`) ;
 * - `pastilles` : les `<li className="profil-bandeau-ecole">` (liste omise s'il n'y en a aucun) ;
 * - `fin` : contenu ajouté en dernier dans le bandeau (pastilles calculées ailleurs, lien…).
 * L'administration garde son propre bandeau (`admin-bandeau`, jetons `--admin-*`).
 */
export function BandeauEspace({
  titreId,
  titre,
  icone,
  classe,
  classeIcone,
  surtitre = 'ESPACE PROFESSEUR',
  apresTitre,
  pastilles,
  etiquettePastilles,
  fin,
}: {
  titreId: string
  titre: ReactNode
  icone: ReactNode
  classe?: string
  classeIcone?: string
  /** Texte en capitales (CSS) ; un nom de classe s'y met dans `<span className="sans-capitales">` (« 6e B », jamais « 6E B »). */
  surtitre?: ReactNode
  apresTitre?: ReactNode
  pastilles?: ReactNode
  etiquettePastilles?: string
  fin?: ReactNode
}) {
  return (
    <section className={classe ? `profil-bandeau ${classe}` : 'profil-bandeau'} aria-labelledby={titreId}>
      <span className={classeIcone ? `profil-initiale ${classeIcone}` : 'profil-initiale'} aria-hidden="true">
        {icone}
      </span>
      <div className="profil-bandeau-texte">
        <p className="profil-bandeau-surtitre">{surtitre}</p>
        <h1 id={titreId}>{titre}</h1>
        {apresTitre}
      </div>
      {Children.toArray(pastilles).length > 0 && (
        <ul className="profil-bandeau-ecoles" aria-label={etiquettePastilles}>
          {pastilles}
        </ul>
      )}
      {fin}
    </section>
  )
}
