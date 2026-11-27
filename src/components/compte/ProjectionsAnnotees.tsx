import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { LEVELS } from '../../content/chaptersIndex'
import { lireAnnotations, resumeAnnotations } from '../../lib/projection/annotations'

interface Gardee {
  niveau: string
  slug: string
  titre: string
  niveauLabel: string
  diapos: number
  blanches: number
}

const nombre = (n: number, mot: string, accord: string) => `${n} ${mot}${n > 1 ? 's' : ''} ${accord}${n > 1 ? 's' : ''}`

/**
 * « Projections annotées » de Mes documents : les annotations des projections (stylo, surligneur, pages
 * blanches, courbes) restent DANS CE NAVIGATEUR, par chapitre (IndexedDB, repli `localStorage` —
 * `lib/projection/annotations.ts`, rien sur le serveur). Ici : la liste des chapitres qui en ont, avec un
 * lien vers le lanceur de projection du chapitre (`#projeter`), d'où l'on télécharge le PowerPoint ou le PDF
 * annoté. Lecture à l'ouverture de la page, chapitre par chapitre (une vingtaine de petites lectures).
 */
export function ProjectionsAnnotees() {
  const id = useId()
  const [gardees, setGardees] = useState<Gardee[] | null>(null)
  useEffect(() => {
    let vivant = true
    const chapitres = LEVELS.flatMap((l) => l.chapters.map((c) => ({ c, l })))
    void Promise.all(
      chapitres.map(async ({ c, l }) => {
        const d = await lireAnnotations(c).catch(() => null)
        if (!d) return null
        const r = resumeAnnotations(d)
        return r.diapos + r.blanches > 0 ? { niveau: c.levelSlug, slug: c.slug, titre: c.title, niveauLabel: l.label, ...r } : null
      }),
    ).then((liste) => vivant && setGardees(liste.filter((x): x is Gardee => x !== null)))
    return () => {
      vivant = false
    }
  }, [])

  return (
    <section className="profil-carte ep-ancre" id="projections" aria-labelledby={`${id}-titre`}>
      <div className="profil-carte-tete">
        <h2 id={`${id}-titre`}>Projections annotées</h2>
      </div>
      <div className="profil-carte-corps">
        <p className="profil-intro">
          Ce que tu as écrit en projetant un chapitre (stylo, surligneur, pages blanches, courbes) reste gardé <strong>dans ce navigateur</strong>, chapitre par chapitre. Ouvre la
          projection d'un chapitre pour la reprendre ou télécharger le PowerPoint ou le PDF annoté.
        </p>
        {gardees === null ? (
          <p className="compte-chargement" role="status">
            Recherche des projections annotées…
          </p>
        ) : gardees.length === 0 ? (
          <p className="compte-vide">
            Aucune projection annotée dans ce navigateur. <Link to="/espace/preparer#projeter">Projeter un chapitre</Link>
          </p>
        ) : (
          <ul className="ep-projections">
            {gardees.map((g) => (
              <li key={`${g.niveau}/${g.slug}`}>
                <span className="ep-projection-texte">
                  <strong>{g.titre}</strong> <span className="ep-chip">{g.niveauLabel}</span>
                  <span className="ep-projection-detail">{[g.diapos ? nombre(g.diapos, 'diapo', 'annotée') : '', g.blanches ? nombre(g.blanches, 'page', 'blanche') : ''].filter(Boolean).join(' · ')}</span>
                </span>
                <Link className="carnet-bouton" to={`/${g.niveau}/${g.slug}#projeter`}>
                  Ouvrir la projection<span className="carnet-sr"> — {g.titre}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
