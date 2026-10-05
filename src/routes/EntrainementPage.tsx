import { lazy, Suspense, useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { ENTRAINEMENT_REGISTRY, LEVEL_LABELS } from '../entrainement/registry'
import '../entrainement/theme.css'

/** Page générique `/entrainement/:chantier/:generatorId` pour TOUT générateur rapatrié depuis
 * plateforme-maths (voir `ENTRAINEMENT_REGISTRY`) — remplace une page dédiée par générateur :
 * ajouter un générateur migré n'exige qu'une entrée dans le registre, jamais une nouvelle route.
 * Le composant réel est chargé à la demande (`React.lazy`, voir le commentaire de tête d'App.tsx
 * sur pourquoi c'est indispensable dès qu'on dépasse un ou deux générateurs embarqués). Pas de
 * bouton "Accueil" propre au générateur : le fil d'Ariane ci-dessous fait déjà ce rôle, cohérent
 * avec le reste du site. */
export function EntrainementPage() {
  const { chantier, generatorId } = useParams<{ chantier: string; generatorId: string }>()
  const entry = generatorId ? ENTRAINEMENT_REGISTRY[generatorId] : undefined

  const Component = useMemo(() => (entry ? lazy(entry.importComponent) : null), [entry])

  if (!entry || entry.chantier !== chantier) return <Navigate to="/" replace />

  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: LEVEL_LABELS[entry.chantier] ?? entry.chantier, to: '/' },
          { label: entry.chapitreTitle, to: `/${entry.chantier}/${entry.chapitreSlug}` },
          { label: "S'entraîner" },
        ]}
      />
      <div className="entrainement">
        <Suspense fallback={null}>{Component && <Component />}</Suspense>
      </div>
    </>
  )
}
