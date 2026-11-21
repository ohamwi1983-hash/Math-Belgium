import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'
import { EntrainementPage } from './routes/EntrainementPage'
import { CompteProvider } from './lib/compteContexte'

/** `AdminPage`/`ExercicePage`/`ChapterExercicePage` rendent toutes trois `EvaluationGeneratorPanel`,
 * qui embarque désormais `EVALUATION_ADAPTER_REGISTRY_4E` (55 adaptateurs + tout le pipeline
 * d'export — KaTeX, jsPDF, docx, polices Noto) — en import statique, ce code se serait retrouvé
 * dans le chunk principal chargé par CHAQUE page du site, même la page d'accueil, et dépassait déjà
 * la limite de précache PWA par défaut (2 Mio). Même raison/même remède que `EntrainementPage` pour
 * les générateurs d'entraînement (voir son commentaire) : chargement à la demande. */
const AdminPage = lazy(() => import('./routes/AdminPage').then((m) => ({ default: m.AdminPage })))
const ExercicePage = lazy(() => import('./routes/ExercicePage').then((m) => ({ default: m.ExercicePage })))
const ChapterExercicePage = lazy(() => import('./routes/ChapterExercicePage').then((m) => ({ default: m.ChapterExercicePage })))
const EvaluationPage = lazy(() => import('./routes/EvaluationPage').then((m) => ({ default: m.EvaluationPage })))
/** Pages de compte (Supabase, `.claude/rules/comptes.md`) : chargées à la demande, jamais pré-rendues
 * (absentes de `scripts/routes.mjs`), non indexées (`usePageNonIndexee`). */
const ConnexionPage = lazy(() => import('./routes/ConnexionPage').then((m) => ({ default: m.ConnexionPage })))
const InscriptionPage = lazy(() => import('./routes/InscriptionPage').then((m) => ({ default: m.InscriptionPage })))
const MotDePassePage = lazy(() => import('./routes/MotDePassePage').then((m) => ({ default: m.MotDePassePage })))
const ProfilPage = lazy(() => import('./routes/ProfilPage').then((m) => ({ default: m.ProfilPage })))
const CoffrePage = lazy(() => import('./routes/CoffrePage').then((m) => ({ default: m.CoffrePage })))
const CarnetPage = lazy(() => import('./routes/CarnetPage').then((m) => ({ default: m.CarnetPage })))

function App() {
  return (
    <BrowserRouter>
      <CompteProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/exercice" element={<ExercicePage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/connexion" element={<ConnexionPage />} />
          <Route path="/inscription" element={<InscriptionPage />} />
          <Route path="/mot-de-passe" element={<MotDePassePage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/coffre" element={<CoffrePage />} />
          {/* `/carnet/*` : sous-pages du carnet (Aujourd’hui, semaine, classe, agenda…), jamais pré-rendues. */}
          <Route path="/carnet/*" element={<CarnetPage />} />
          {/* Un seul générateur rapatrié depuis plateforme-maths = une entrée dans
           * `ENTRAINEMENT_REGISTRY` (voir `src/entrainement/registry.ts`), jamais une nouvelle route
           * ici — `EntrainementPage` charge le bon composant à la demande (`React.lazy`), lu depuis
           * le registre selon `:generatorId`. Indispensable dès qu'on dépasse un ou deux générateurs
           * embarqués : chacun embarque tout son code (core/moteur/générateurs/ui/components), le
           * premier à lui seul avait déjà fait dépasser la limite de précache PWA par défaut sans
           * lazy-loading. */}
          <Route path="/entrainement/:chantier/:generatorId" element={<EntrainementPage />} />
          <Route path="/:levelSlug/:chapterSlug/exercices" element={<ChapterExercicePage />} />
          <Route path="/:levelSlug/:chapterSlug" element={<ChapterRoute />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
      </CompteProvider>
    </BrowserRouter>
  )
}

export default App
