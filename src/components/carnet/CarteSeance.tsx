import { useState } from 'react'
import { Link } from 'react-router-dom'
import { findChapter } from '../../content/chaptersIndex'
import { dateCourte, generateursChapitre, slugTitre, structureChapitre, texteBrut, type Classe, type Seance } from '../../lib/carnet'
import { dateJourLong } from '../../lib/agendaEvenements'
import { heureEvenementTexte } from '../../lib/carnetDevoirs'
import { ficheSeanceHtml } from '../../lib/carnetFiche'
import { couleurClasse, evenementDeSeance, resoudre, textesSeance, useCarnet } from './contexteCarnet'
import { MenuActions } from './MenuActions'
import { capitale, copierTexte, dateAbregee, ouvrirFiche, telechargerFiche } from './outilsCarnet'

/**
 * Actions d'une séance notée : UNE action principale, « Copier pour Smartschool » (texte en rubriques
 * + HTML riche, rubriques mémorisées du professeur, repli texte à copier à la main), et le menu « … »
 * (texte pour l'agenda scolaire — rubriques, objectif, compétences —, fiche à imprimer / PDF,
 * télécharger la fiche, modifier, supprimer). `menuSeul` : la copie passe aussi dans le menu (ligne
 * compacte).
 */
export function ActionsSeance({ seance, menuSeul = false, avecOuvrir = false }: { seance: Seance; menuSeul?: boolean; avecOuvrir?: boolean }) {
  const ctx = useCarnet()
  const [copie, setCopie] = useState<'ok' | 'echec' | null>(null)
  const classe = ctx.classes.find((c) => c.id === seance.classe_id)
  if (!classe) return null
  const r = resoudre(ctx, seance, classe)
  const textes = textesSeance(ctx, seance, classe)
  const texte = textes.texte
  // Nom ASCII : un accent dans l'attribut `download` fait perdre le nom du fichier dans Chromium.
  const nomFiche = `seance-${slugTitre(classe.nom)}-${seance.date_seance}.html`

  async function copier() {
    const ok = await copierTexte(texte, textes.html)
    setCopie(ok ? 'ok' : 'echec')
    if (ok) window.setTimeout(() => setCopie((c) => (c === 'ok' ? null : c)), 4000)
  }

  const actions = [
    ...(menuSeul ? [{ texte: 'Copier pour Smartschool', onChoisir: () => void copier() }] : []),
    ...(avecOuvrir ? [{ texte: 'Ouvrir la séance', onChoisir: () => ctx.voir(seance) }] : []),
    { texte: 'Texte pour l’agenda scolaire (rubriques)…', onChoisir: () => ctx.ouvrirTexte(seance) },
    { texte: 'Fiche (imprimer, PDF)', onChoisir: () => ouvrirFiche(ficheSeanceHtml({ ...r, professeur: ctx.professeur })) },
    { texte: 'Télécharger la fiche', onChoisir: () => telechargerFiche(ficheSeanceHtml({ ...r, professeur: ctx.professeur }), nomFiche) },
    { texte: 'Modifier', onChoisir: () => ctx.modifier(seance), desactive: ctx.occupe },
    { texte: 'Supprimer', onChoisir: () => ctx.supprimer(seance), danger: true, desactive: ctx.occupe },
  ]

  return (
    <div className="carnet-actions-seance">
      <div className="carnet-actions-ligne">
        {!menuSeul && (
          <button type="button" className="carnet-bouton" onClick={() => void copier()}>
            Copier pour Smartschool
          </button>
        )}
        <MenuActions libelle={`Autres actions — séance de ${classe.nom} du ${dateCourte(seance.date_seance)} : fiche, modifier, supprimer`} actions={actions} />
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
    </div>
  )
}

/** Pastille de couleur d'une classe (« 4Ge »). */
export function PastilleClasse({ classe, petite = false }: { classe: Pick<Classe, 'id' | 'nom'> | undefined; petite?: boolean }) {
  const { classes } = useCarnet()
  return <span className={`carnet-pastille carnet-c${classe ? couleurClasse(classes, classe.id) : 5}${petite ? ' petite' : ''}`}>{classe?.nom ?? 'Classe supprimée'}</span>
}

/**
 * Une séance du fil d'une classe (ou ouverte dans le panneau) : date et horaire, chapitre (lien vers
 * le cours), sections vues (liens vers leurs ancres), exercices, devoir, remarque privée, puis les
 * actions. `compacte` : une ligne (semaines plus anciennes), copie dans le menu « … ».
 */
export function CarteSeance({ seance, compacte = false, titreId }: { seance: Seance; compacte?: boolean; titreId?: string }) {
  const ctx = useCarnet()
  const classe = ctx.classes.find((c) => c.id === seance.classe_id)
  if (!classe) return null
  const r = resoudre(ctx, seance, classe)
  const lienSection = (url: string) => `/${seance.niveau}/${seance.chapitre}#${url.split('#')[1]}`
  const chapitre = findChapter(seance.niveau, seance.chapitre)
  const exercicesDevoir = chapitre ? generateursChapitre(chapitre).filter((g) => (seance.devoir_generateurs ?? []).includes(g.id)).map((g) => texteBrut(g.titre)) : (seance.devoir_generateurs ?? [])
  const evenement = evenementDeSeance(ctx, seance)
  const sectionsEval = chapitre ? structureChapitre(chapitre).filter((x) => (seance.evaluation_parties ?? []).includes(x.id)).map((x) => `§ ${x.numero}`) : []
  const texteEvaluation = seance.evaluation_type
    ? [
        seance.evaluation_type === 'faite' ? 'interro faite en classe' : seance.evaluation_type === 'bilan' ? 'contrôle-bilan annoncé' : 'interro annoncée',
        seance.evaluation_type !== 'faite' ? (evenement ? `le ${dateJourLong(evenement.du)}${heureEvenementTexte(evenement) ? ` (${heureEvenementTexte(evenement)})` : ''}` : 'retirée de l’agenda') : '',
        sectionsEval.length > 0 ? `— ${sectionsEval.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  if (compacte) {
    return (
      <article className="carnet-seance compacte" aria-label={`Séance du ${dateCourte(seance.date_seance)}`}>
        <p className="carnet-seance-ligne">
          <span className="carnet-date">{dateAbregee(seance.date_seance)}</span>
          {r.horaire && <span className="carnet-horaire"> · {r.horaire}</span>}
          {' · '}
          {r.chapitre ? r.chapitre.titre : `Chapitre retiré du site (${seance.chapitre})`}
          {r.parties.map((p) => (
            <Link key={p.url + p.texte} className="carnet-sec" to={lienSection(p.url)}>
              {p.texte}
            </Link>
          ))}
        </p>
        <ActionsSeance seance={seance} menuSeul />
      </article>
    )
  }

  return (
    <article className="carnet-seance" aria-labelledby={titreId}>
      <div className="carnet-seance-tete">
        <h3 className="carnet-date" id={titreId}>
          {capitale(dateAbregee(seance.date_seance))}
          {r.horaire && <span className="carnet-horaire"> · {r.horaire}</span>}
        </h3>
      </div>
      {r.chapitre ? (
        <p className="carnet-seance-chapitre">
          <Link to={`/${seance.niveau}/${seance.chapitre}`}>
            Ch. {r.chapitre.numero} — {r.chapitre.titre}
          </Link>
        </p>
      ) : (
        <p className="carnet-seance-chapitre">Chapitre retiré du site ({seance.chapitre})</p>
      )}
      {r.parties.length > 0 ? (
        <ul className="carnet-secs" aria-label="Vu en classe">
          {r.parties.map((p) => (
            <li key={p.url + p.texte}>
              <Link className="carnet-sec" to={lienSection(p.url)}>
                {p.texte}
              </Link>
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
      {(r.devoir || (seance.devoir_generateurs?.length ?? 0) > 0) && (
        <p className="carnet-seance-detail carnet-texte-libre">
          <strong>Devoir{seance.devoir_pour ? ` pour le ${dateJourLong(seance.devoir_pour)}` : ''} :</strong> {r.devoir}
          {exercicesDevoir.length > 0 && <span className="carnet-seance-joints"> Exercices en ligne : {exercicesDevoir.join(' · ')}</span>}
        </p>
      )}
      {seance.evaluation_type && (
        <p className="carnet-seance-detail">
          <strong>Évaluation :</strong> {texteEvaluation}
        </p>
      )}
      {r.remarque && (
        <p className="carnet-seance-detail carnet-texte-libre carnet-remarque">
          <strong>Remarque (pour toi seulement) :</strong> {r.remarque}
        </p>
      )}
      <ActionsSeance seance={seance} />
    </article>
  )
}
