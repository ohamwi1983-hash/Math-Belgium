import { useId, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findChapter } from '../../content/chaptersIndex'
import { dateCourte, libelleNiveau, matiereDepuis, structureChapitre, texteBrut, type Classe, type Seance } from '../../lib/carnet'
import { urlEvaluationMatiere } from '../../lib/carnetMatiere'
import { numeroRepere } from '../../lib/ordreChapitres'

/** Date proposée : première séance du chapitre de la séance la plus récente. */
function dateParDefaut(seances: Seance[]): string {
  const triees = [...seances].sort((a, b) => (a.date_seance < b.date_seance ? 1 : -1))
  const derniere = triees[0]
  if (!derniere) return ''
  const memeChapitre = triees.filter((s) => s.niveau === derniere.niveau && s.chapitre === derniere.chapitre)
  return memeChapitre[memeChapitre.length - 1].date_seance
}

/** « Créer une évaluation sur la matière vue depuis le … » : ouvre `/evaluation` avec les
 * générateurs des sections cochées depuis cette date déjà sélectionnés (`?matiere=`). */
export function EvaluationMatiere({ classe, seances, sansTitre = false }: { classe: Classe; seances: Seance[]; sansTitre?: boolean }) {
  const id = useId()
  const navigate = useNavigate()
  const [depuis, setDepuis] = useState(() => dateParDefaut(seances))
  const resultat = useMemo(() => (depuis ? matiereDepuis(seances, depuis) : null), [seances, depuis])

  const apercu = resultat?.matiere?.chapitres.map((c) => {
    const chapitre = findChapter(resultat.matiere!.levelSlug, c.slug)
    const structure = chapitre ? structureChapitre(chapitre) : []
    return {
      slug: c.slug,
      titre: chapitre ? `Ch. ${numeroRepere(chapitre)} — ${texteBrut(chapitre.title)}` : c.slug,
      sections: c.sections.map((s) => {
        const sec = structure.find((x) => x.id === s)
        return sec ? `${sec.numero}. ${texteBrut(sec.titre)}` : s
      }),
    }
  })

  return (
    <section className="compte-encadre carnet-evaluation" aria-labelledby={sansTitre ? undefined : `${id}-titre`} aria-label={sansTitre ? `Évaluation sur la matière vue en ${classe.nom}` : undefined}>
      {!sansTitre && (
        <h3 id={`${id}-titre`} className="compte-titre-encadre">
          Évaluation sur la matière vue
        </h3>
      )}
      <div className="compte-champ carnet-champ-court">
        <label htmlFor={`${id}-depuis`}>Matière vue depuis le</label>
        <input id={`${id}-depuis`} type="date" value={depuis} onChange={(e) => setDepuis(e.target.value)} />
      </div>
      {!depuis ? (
        <p className="compte-aide">Choisis une date.</p>
      ) : !resultat?.matiere ? (
        <p className="compte-vide">Aucune partie cochée en {classe.nom} depuis le {dateCourte(depuis)}.</p>
      ) : (
        <>
          <p className="compte-aide">
            {resultat.seances} séance{resultat.seances > 1 ? 's' : ''} · {libelleNiveau(resultat.matiere.levelSlug)}
            {resultat.autresNiveaux.length > 0 ? ` (séances d'un autre niveau ignorées : ${resultat.autresNiveaux.map(libelleNiveau).join(', ')})` : ''}
          </p>
          <ul className="carnet-apercu">
            {apercu?.map((c) => (
              <li key={c.slug}>
                <strong>{c.titre}</strong> : {c.sections.join(' ; ')}
              </li>
            ))}
          </ul>
          <button type="button" className="compte-bouton" onClick={() => navigate(urlEvaluationMatiere(resultat.matiere!, depuis, classe.nom, classe.id))}>
            Créer une évaluation sur la matière vue depuis le {dateCourte(depuis)}
          </button>
          <p className="compte-aide">Le panneau s'ouvre avec un exercice par générateur de ces sections ; tu ajustes ensuite.</p>
        </>
      )}
    </section>
  )
}
