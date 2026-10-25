import { useParams, Navigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { ChapterPage } from '../components/chapter/ChapterPage'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import { useDocumentMeta, stripRichText } from '../lib/useDocumentMeta'

const BASE_URL = 'https://math-belgium.vercel.app'

export function ChapterRoute() {
  const { levelSlug, chapterSlug } = useParams<{ levelSlug: string; chapterSlug: string }>()
  const chapter = levelSlug && chapterSlug ? findChapter(levelSlug, chapterSlug) : undefined
  const level = LEVELS.find((l) => l.slug === levelSlug)
  const path = `/${levelSlug}/${chapterSlug}`

  useDocumentMeta({
    title: chapter ? `${chapter.title} — ${level?.label ?? levelSlug} — Chapitres de maths` : 'Chapitres de maths — FWB',
    description: chapter?.lede ?? '',
    path,
    type: 'article',
    // `LearningResource` (plutôt que `Course`, qui implique une inscription/un programme
    // structuré que cette page n'est pas) + `BreadcrumbList` reflétant exactement les 2 niveaux
    // RÉELLEMENT navigables (accueil, puis ce chapitre) — jamais un niveau intermédiaire inventé
    // pour "/4e" ou "/5e-4h", qui n'a pas sa propre page.
    jsonLd: chapter
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: chapter.title,
            description: stripRichText(chapter.lede),
            url: `${BASE_URL}${path}`,
            inLanguage: 'fr-BE',
            learningResourceType: 'Chapitre de cours',
            educationalLevel: level?.label ?? levelSlug,
            isPartOf: { '@type': 'WebSite', name: 'Chapitres de maths — FWB', url: BASE_URL },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${BASE_URL}/` },
              { '@type': 'ListItem', position: 2, name: chapter.title, item: `${BASE_URL}${path}` },
            ],
          },
        ]
      : undefined,
  })

  if (!chapter) return <Navigate to="/" replace />

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: level?.label ?? levelSlug!, to: '/' },
          { label: chapter.title },
        ]}
      />
      <ChapterPage chapter={chapter} />
    </>
  )
}
