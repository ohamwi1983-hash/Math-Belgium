import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generatorLink } from '../../lib/generatorLink'
import { dateLongue, htmlSmartschool, resoudreSeance, slugTitre, texteSmartschool, type Classe, type FormatHoraire, type Seance } from '../../lib/carnet'
import { ficheSeanceHtml } from '../../lib/carnetFiche'
import { copierTexte, ouvrirFiche, telechargerFiche } from './outilsCarnet'

function capitale(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** Une séance de la liste : résumé, puis « Copier pour Smartschool », fiche imprimable,
 * modifier, supprimer. */
export function CarteSeance({
  seance,
  classe,
  format,
  ecole,
  professeur,
  occupe,
  onModifier,
  onSupprimer,
}: {
  seance: Seance
  classe: Classe
  format: FormatHoraire
  ecole: string
  professeur: string
  occupe: boolean
  onModifier: () => void
  onSupprimer: () => void
}) {
  const [copie, setCopie] = useState<'ok' | 'echec' | null>(null)
  const r = resoudreSeance(seance, classe, { format, ecole, lienGenerateur: generatorLink })
  const texte = texteSmartschool(r)
  // Nom ASCII : un accent dans l'attribut `download` fait perdre le nom du fichier dans Chromium.
  const nomFiche = `seance-${slugTitre(classe.nom)}-${seance.date_seance}.html`

  async function copier() {
    const ok = await copierTexte(texte, htmlSmartschool(r))
    setCopie(ok ? 'ok' : 'echec')
    if (ok) window.setTimeout(() => setCopie((c) => (c === 'ok' ? null : c)), 4000)
  }

  return (
    <li className="carnet-seance">
      <div className="carnet-seance-tete">
        <h4>
          {capitale(dateLongue(seance.date_seance))}
          {r.horaire && <span className="carnet-horaire"> · {r.horaire}</span>}
        </h4>
        {r.chapitre ? (
          <p className="carnet-seance-chapitre">
            <Link to={`/${seance.niveau}/${seance.chapitre}`}>
              Ch. {r.chapitre.numero} — {r.chapitre.titre}
            </Link>
          </p>
        ) : (
          <p className="carnet-seance-chapitre">Chapitre retiré du site ({seance.chapitre})</p>
        )}
      </div>
      {r.parties.length > 0 ? (
        <ul className="carnet-seance-parties">
          {r.parties.map((p) => (
            <li key={p.url + p.texte}>
              <Link to={`/${seance.niveau}/${seance.chapitre}#${p.url.split('#')[1]}`}>{p.texte}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="compte-vide">Aucune partie cochée.</p>
      )}
      {r.generateurs.length > 0 && (
        <p className="carnet-seance-detail">
          <strong>Exercices :</strong> {r.generateurs.map((g) => g.titre).join(' · ')}
        </p>
      )}
      {r.devoir && (
        <p className="carnet-seance-detail carnet-texte-libre">
          <strong>Devoir :</strong> {r.devoir}
        </p>
      )}
      {r.remarque && (
        <p className="carnet-seance-detail carnet-texte-libre carnet-remarque">
          <strong>Remarque :</strong> {r.remarque}
        </p>
      )}
      <div className="compte-actions carnet-seance-actions">
        <button type="button" className="compte-bouton" onClick={() => void copier()}>
          Copier pour Smartschool
        </button>
        <button type="button" className="compte-bouton-secondaire" onClick={() => ouvrirFiche(ficheSeanceHtml({ ...r, professeur }))}>
          Fiche (imprimer, PDF)
        </button>
        <button type="button" className="compte-bouton-secondaire" onClick={() => telechargerFiche(ficheSeanceHtml({ ...r, professeur }), nomFiche)}>
          Télécharger la fiche
        </button>
        <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={onModifier}>
          Modifier
        </button>
        <button type="button" className="compte-bouton-secondaire compte-danger" disabled={occupe} onClick={onSupprimer}>
          Supprimer
        </button>
      </div>
      {copie === 'ok' && (
        <p className="compte-message carnet-copie" role="status">
          Copié : colle-le dans Smartschool (journal de classe ou message).
        </p>
      )}
      {copie === 'echec' && (
        <div className="carnet-copie" role="status">
          <p className="compte-aide">Copie automatique impossible sur cet appareil : sélectionne le texte ci-dessous et copie-le.</p>
          <textarea className="carnet-texte-copie" readOnly rows={8} value={texte} onFocus={(e) => e.currentTarget.select()} aria-label="Texte pour Smartschool" />
        </div>
      )}
    </li>
  )
}
