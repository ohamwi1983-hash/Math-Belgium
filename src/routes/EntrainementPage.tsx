import { lazy, Suspense, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { findChapter, trouverSectionGenerateur } from '../content/chaptersIndex'
import { ENTRAINEMENT_REGISTRY, LEVEL_LABELS } from '../entrainement/registry'
import '../entrainement/theme.css'

/** Page générique `/entrainement/:chantier/:generatorId` pour TOUT générateur rapatrié depuis
 * plateforme-maths (voir `ENTRAINEMENT_REGISTRY`) — remplace une page dédiée par générateur :
 * ajouter un générateur migré n'exige qu'une entrée dans le registre, jamais une nouvelle route.
 * Le composant réel est chargé à la demande (`React.lazy`, voir le commentaire de tête d'App.tsx
 * sur pourquoi c'est indispensable dès qu'on dépasse un ou deux générateurs embarqués).
 *
 * Le fil d'Ariane renvoie déjà au chapitre, mais pas forcément à LA section qui a amené l'élève
 * ici (un chapitre peut référencer le même générateur depuis plusieurs sections, ou être long) —
 * `trouverSectionGenerateur` retrouve cette section précise via `chaptersIndex.ts`, en lisant les
 * mêmes données que `ChapterPage`/`LectureAids`, jamais une liste entretenue à part. Le lien
 * pointe vers `#sectionId` : voir l'effet de `LectureAids` qui rouvre/scrolle vers cette section
 * à l'arrivée sur la page du chapitre. */
export function EntrainementPage() {
  const { chantier, generatorId } = useParams<{ chantier: string; generatorId: string }>()
  const entry = generatorId ? ENTRAINEMENT_REGISTRY[generatorId] : undefined

  const Component = useMemo(() => (entry ? lazy(entry.importComponent) : null), [entry])

  const section = useMemo(() => {
    if (!entry || !generatorId) return undefined
    const chapter = findChapter(entry.chantier, entry.chapitreSlug)
    return chapter ? trouverSectionGenerateur(chapter, generatorId) : undefined
  }, [entry, generatorId])

  if (!entry || entry.chantier !== chantier) return <Navigate to="/" replace />

  const lienChapitre = `/${entry.chantier}/${entry.chapitreSlug}${section ? `#${section.id}` : ''}`

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: LEVEL_LABELS[entry.chantier] ?? entry.chantier, to: '/' },
          { label: entry.chapitreTitle, to: lienChapitre },
          { label: "S'entraîner" },
        ]}
      />
      <div className="entrainement">
        <Link className="entrainement-retour" to={lienChapitre}>
          <span aria-hidden="true">←</span> Retour {section ? `à « ${section.title} »` : `au chapitre « ${entry.chapitreTitle} »`}
        </Link>
        <Suspense fallback={null}>{Component && <Component />}</Suspense>
      </div>
    </>
  )
}
