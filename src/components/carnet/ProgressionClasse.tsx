import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { chapitresDeLaClasse, dateCourte, progressionClasse, type ChapitreProgression, type Classe, type Seance } from '../../lib/carnet'

/**
 * Progression d'une classe : par chapitre, les sections / sous-parties vues (date de la première
 * fois) et celles qui restent ; pour chaque partie, où en sont les autres classes du même niveau
 * (deux classes parallèles n'avancent pas toujours au même rythme).
 */
export function ProgressionClasse({ classe, seances, autres }: { classe: Classe; seances: Seance[]; autres: { classe: Classe; seances: Seance[] }[] }) {
  const chapitres = useMemo(() => chapitresDeLaClasse(classe, seances), [classe, seances])
  const progression = useMemo(() => progressionClasse(seances, chapitres), [seances, chapitres])
  const autresProgressions = useMemo(
    () => autres.map((a) => ({ nom: a.classe.nom, progression: progressionClasse(a.seances, chapitres) })),
    [autres, chapitres],
  )
  const commences = progression.filter((p) => p.vues > 0)
  const pasCommences = progression.filter((p) => p.vues === 0)

  function autresPour(chapitre: ChapitreProgression, uniteId: string): string[] {
    return autresProgressions.flatMap((a) => {
      const u = a.progression.find((p) => p.slug === chapitre.slug && p.levelSlug === chapitre.levelSlug)?.sections.flatMap((s) => s.unites).find((x) => x.id === uniteId)
      return u?.premiereFois ? [`${a.nom} : ${dateCourte(u.premiereFois)}`] : []
    })
  }

  if (chapitres.length === 0) {
    return <p className="compte-vide">Aucune séance pour l'instant, et pas de niveau choisi pour cette classe : indique son niveau (Gérer mes classes) pour voir tous ses chapitres.</p>
  }

  return (
    <div className="carnet-progression">
      {commences.length === 0 && <p className="compte-vide">Rien de noté pour l'instant dans cette classe.</p>}
      {commences.map((chapitre) => (
        <section className="carnet-prog-chapitre" key={chapitre.levelSlug + chapitre.slug} aria-label={`Chapitre ${chapitre.numero}`}>
          <h4>
            <Link to={`/${chapitre.levelSlug}/${chapitre.slug}`}>
              Ch. {chapitre.numero} — {chapitre.titre}
            </Link>
          </h4>
          <p className="carnet-prog-resume">
            {chapitre.vues} / {chapitre.total} partie{chapitre.total > 1 ? 's' : ''} vue{chapitre.vues > 1 ? 's' : ''}
            {chapitre.derniereSeance ? ` · dernière séance le ${dateCourte(chapitre.derniereSeance)}` : ''}
          </p>
          <div className="carnet-barre" aria-hidden="true">
            <span style={{ width: `${Math.round((100 * chapitre.vues) / Math.max(1, chapitre.total))}%` }} />
          </div>
          <ol className="carnet-prog-sections">
            {chapitre.sections.map((section) => (
              <li key={section.id} className={section.vues === section.total ? 'vue' : section.vues > 0 ? 'partielle' : 'reste'}>
                <p className="carnet-prog-section">
                  <span>
                    {section.numero}. {section.titre}
                  </span>
                  <span className="carnet-prog-etat">{section.vues === section.total ? (section.total > 1 ? 'vue' : `vue le ${dateCourte(section.premiereFois as string)}`) : section.vues > 0 ? `${section.vues} / ${section.total}` : 'reste'}</span>
                </p>
                {section.unites.length > 1 && (
                  <ul className="carnet-prog-unites">
                    {section.unites.map((u) => {
                      const ailleurs = autresPour(chapitre, u.id)
                      return (
                        <li key={u.id} className={u.premiereFois ? 'vue' : 'reste'}>
                          <span className="carnet-prog-marque" aria-hidden="true">
                            {u.premiereFois ? '✓' : '○'}
                          </span>
                          <span className="carnet-prog-titre">{u.titre}</span>
                          <span className="carnet-prog-etat">{u.premiereFois ? `vue le ${dateCourte(u.premiereFois)}` : 'reste'}</span>
                          {ailleurs.length > 0 && <span className="carnet-prog-ailleurs">{ailleurs.join(' · ')}</span>}
                        </li>
                      )
                    })}
                  </ul>
                )}
                {section.unites.length === 1 && autresPour(chapitre, section.unites[0].id).length > 0 && (
                  <p className="carnet-prog-ailleurs">{autresPour(chapitre, section.unites[0].id).join(' · ')}</p>
                )}
              </li>
            ))}
          </ol>
        </section>
      ))}
      {pasCommences.length > 0 && (
        <details className="carnet-details">
          <summary>
            Pas encore commencés <span className="compte-compte">({pasCommences.length})</span>
          </summary>
          <ul className="carnet-prog-pas-commences">
            {pasCommences.map((c) => {
              const ailleurs = autresProgressions.filter((a) => (a.progression.find((p) => p.slug === c.slug)?.vues ?? 0) > 0).map((a) => a.nom)
              return (
                <li key={c.levelSlug + c.slug}>
                  Ch. {c.numero} — {c.titre} <span className="compte-compte">({c.total} parties)</span>
                  {ailleurs.length > 0 && <span className="carnet-prog-ailleurs"> commencé en {ailleurs.join(', ')}</span>}
                </li>
              )
            })}
          </ul>
        </details>
      )}
    </div>
  )
}
