import type { Seance } from '../../lib/carnet'
import { dateCourteJour } from '../../lib/agendaEvenements'
import { resumeDevoir } from '../../lib/carnetDevoirs'
import { useCarnet } from './contexteCarnet'

/** Petite icône « devoir » (crayon), au trait. */
function IconeDevoir({ taille = 13 }: { taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 20l1-5L16 4l4 4L9 19z" />
      <path d="M13 7l4 4" />
    </svg>
  )
}

/**
 * Devoir à rendre (0007), marqué « À rendre » dans l'agenda (Aujourd'hui, Ma semaine, page de la
 * classe, agenda d'une période) : bouton qui ouvre la FICHE du devoir (consigne, exercices, Modifier, Supprimer). `avecClasse` : nom de
 * la classe en tête ; `avecDate` : date de remise (listes sur plusieurs jours).
 */
export function PuceARendre({ seance, avecClasse = true, avecDate = false, compacte = false, avecResume = true }: { seance: Seance; avecClasse?: boolean; avecDate?: boolean; compacte?: boolean; avecResume?: boolean }) {
  const ctx = useCarnet()
  const classe = ctx.classes.find((c) => c.id === seance.classe_id)
  const resume = resumeDevoir(seance, compacte ? 40 : 90)
  return (
    <button type="button" className={`carnet-a-rendre${compacte ? ' compacte' : ''}`} onClick={() => ctx.ouvrirFicheDevoir(seance)} title={avecResume ? undefined : resumeDevoir(seance, 200)}>
      <IconeDevoir />
      <span>
        <strong>À rendre</strong>
        {avecDate && seance.devoir_pour ? ` ${dateCourteJour(seance.devoir_pour)}` : ''}
        {avecClasse && classe ? ` · ${classe.nom}` : ''}
        {resume && avecResume ? ` : ${resume}` : ''}
      </span>
      {!avecResume && resume && <span className="carnet-sr"> : {resume}</span>}
      <span className="carnet-sr"> — donné le {dateCourteJour(seance.date_seance)}, ouvrir la fiche du devoir</span>
    </button>
  )
}

/** Liste de devoirs à rendre (une puce par devoir). */
export function ListeARendre({ seances, titre, avecClasse = true, avecDate = false, idTitre }: { seances: Seance[]; titre?: string; avecClasse?: boolean; avecDate?: boolean; idTitre?: string }) {
  if (seances.length === 0) return null
  return (
    <section className="carnet-liste-a-rendre" aria-labelledby={titre ? idTitre : undefined} aria-label={titre ? undefined : 'Devoirs à rendre'}>
      {titre && <h3 id={idTitre}>{titre}</h3>}
      <ul>
        {seances.map((s) => (
          <li key={s.id}>
            <PuceARendre seance={s} avecClasse={avecClasse} avecDate={avecDate} />
          </li>
        ))}
      </ul>
    </section>
  )
}
