import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { findChapter, trouverSectionGenerateur } from '../content/chaptersIndex'
import { ENTRAINEMENT_REGISTRY, LEVEL_LABELS } from '../entrainement/registry'
import { LienVideoGenerateur } from '../entrainement/components/LienVideoGenerateur'
import { BarreGenerateur } from '../entrainement/components/BarreGenerateur'
import { CadreActions } from '../entrainement/components/CadreActions'
import { JeBloque } from '../entrainement/components/JeBloque'
import { CadreGenerateurContext, creerStoreCadre } from '../entrainement/components/cadreGenerateur'
import { noterEssai, ecransDepuisPuces, observerProgression } from '../lib/suiviEssais'
import { SuiviEssaiContext, SuiviVerdictContext, type NoterEssai } from '../lib/suiviContexte'
import '../entrainement/theme.css'
import '../entrainement/cadre.css'
import '../entrainement/confortLecture.css'

/** Page générique `/entrainement/:chantier/:generatorId` pour TOUT générateur rapatrié depuis
 * plateforme-maths (voir `ENTRAINEMENT_REGISTRY`) — remplace une page dédiée par générateur :
 * ajouter un générateur migré n'exige qu'une entrée dans le registre, jamais une nouvelle route.
 * Le composant réel est chargé à la demande (`React.lazy`, voir le commentaire de tête d'App.tsx
 * sur pourquoi c'est indispensable dès qu'on dépasse un ou deux générateurs embarqués).
 *
 * Le lien de retour renvoie au chapitre, et plus précisément à LA section qui a amené l'élève ici
 * (un chapitre peut référencer le même générateur depuis plusieurs sections, ou être long) —
 * `trouverSectionGenerateur` retrouve cette section précise via `chaptersIndex.ts`, en lisant les
 * mêmes données que `ChapterPage`, jamais une liste entretenue à part. Le lien pointe vers
 * `#sectionId` : `ChapterPage` ouvre directement cette étape du parcours à l'arrivée.
 *
 * Refonte du 22/11/2026 (maquettes A–E, téléphone d'abord) : une barre d'une ligne (`BarreGenerateur` :
 * retour, chapitre, progression « Étape n / N ») remplace l'en-tête du site, le fil d'Ariane et le lien
 * de retour ; `CadreActions` forme la barre fixe du bas [Aide][Valider] à partir des boutons que chaque
 * générateur rend déjà ; le magasin `cadreGenerateur` relie les deux aux composants partagés
 * (`ProgressionPuces`, « Ce qu'on sait déjà », `EnTeteExercice`). Aucun générateur n'est réécrit. */
export function EntrainementPage() {
  const { chantier, generatorId } = useParams<{ chantier: string; generatorId: string }>()
  const entry = generatorId ? ENTRAINEMENT_REGISTRY[generatorId] : undefined
  const racineRef = useRef<HTMLDivElement>(null)
  // Magasin du cadre (segments publiés par `ProgressionPuces`, retirés quand elle se démonte).
  const [store] = useState(creerStoreCadre)

  const Component = useMemo(() => (entry ? lazy(entry.importComponent) : null), [entry])

  // « Mon suivi » (`lib/suiviEssais.ts`) : chaque exercice terminé (tous les écrans clos dans les puces
  // publiées) est noté dans CE navigateur seulement. Les générateurs sans puces notent eux-mêmes via
  // `SuiviEssaiContext`. Aucun effet visible sur le générateur.
  const observateur = useMemo(() => (generatorId && entry ? observerProgression((ecrans) => noterEssai(generatorId, ecrans)) : null), [generatorId, entry])
  useEffect(() => {
    if (!observateur) return
    observateur.segments(store.lire().segments)
    return store.abonner(() => observateur.segments(store.lire().segments))
  }, [store, observateur])
  // « Aide » touchée pendant l'écran en cours (bouton du générateur ou tiroir du cadre, qui clique le même).
  useEffect(() => {
    const racine = racineRef.current
    if (!racine || !observateur) return
    const surClic = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('.btn-aide, [data-bouton-aide]')) observateur.aide()
    }
    racine.addEventListener('click', surClic, true)
    return () => racine.removeEventListener('click', surClic, true)
  }, [observateur])
  const signalerVerdict = useCallback((revele: boolean) => observateur?.verdict(revele), [observateur])
  const noterSansPuces = useCallback<NoterEssai>(
    (ecrans, variante) => {
      if (generatorId && entry) noterEssai(generatorId, ecransDepuisPuces(ecrans), variante)
    },
    [generatorId, entry],
  )

  // Confort de lecture (lot G) : un réglage changé (attributs `data-*` de <html> : taille, police…), une
  // police chargée, ou le panneau « Aa » ouvert sur ordinateur (classe `lecture-panneau-ouvert` : page
  // décalée de 420 px) change la géométrie sans toucher au DOM du générateur — le cadre (énoncé épinglé
  // à gauche, aperçu replié, barre du bas) se recalcule sur `resize` : on le lui envoie.
  useEffect(() => {
    let raf = 0
    const html = document.documentElement
    const etat = () => ['taille', 'police', 'interligne', 'espacement'].map((c) => html.getAttribute(`data-${c}`)).join('|') + html.classList.contains('lecture-panneau-ouvert')
    let avant = etat()
    const signaler = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    }
    // Seulement quand un réglage ou l'ouverture du panneau change (jamais en boucle sur une autre classe).
    const observateur = new MutationObserver(() => {
      const maintenant = etat()
      if (maintenant === avant) return
      avant = maintenant
      signaler()
    })
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-taille', 'data-police', 'data-interligne', 'data-espacement'] })
    document.fonts?.addEventListener?.('loadingdone', signaler)
    return () => {
      observateur.disconnect()
      document.fonts?.removeEventListener?.('loadingdone', signaler)
      cancelAnimationFrame(raf)
    }
  }, [])

  const section = useMemo(() => {
    if (!entry || !generatorId) return undefined
    const chapter = findChapter(entry.chantier, entry.chapitreSlug)
    return chapter ? trouverSectionGenerateur(chapter, generatorId) : undefined
  }, [entry, generatorId])

  if (!entry || entry.chantier !== chantier) return <Navigate to="/" replace />

  const lienChapitre = `/${entry.chantier}/${entry.chapitreSlug}${section ? `#${section.id}` : ''}`
  const libelleRetour = `Retour ${section ? `à « ${section.title} »` : `au chapitre « ${entry.chapitreTitle} »`}`

  return (
    <CadreGenerateurContext.Provider value={store}>
      <SuiviEssaiContext.Provider value={noterSansPuces}>
      <SuiviVerdictContext.Provider value={signalerVerdict}>
      <div className="entrainement" ref={racineRef}>
        <BarreGenerateur
          lienChapitre={lienChapitre}
          libelleRetour={libelleRetour}
          contexte={`${LEVEL_LABELS[entry.chantier] ?? entry.chantier} · ${entry.chapitreTitle}`}
        />
        {generatorId && <LienVideoGenerateur generatorId={generatorId} />}
        <Suspense fallback={null}>{Component && <Component />}</Suspense>
        <CadreActions racineRef={racineRef} />
        {generatorId && <JeBloque racineRef={racineRef} generatorId={generatorId} chantier={entry.chantier} chapitreSlug={entry.chapitreSlug} />}
      </div>
      </SuiviVerdictContext.Provider>
      </SuiviEssaiContext.Provider>
    </CadreGenerateurContext.Provider>
  )
}
