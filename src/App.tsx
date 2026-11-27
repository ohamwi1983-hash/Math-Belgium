import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'
import { EntrainementPage } from './routes/EntrainementPage'
import { CompteProvider } from './lib/compteContexte'
import { HotePanneauLecture } from './components/lecture/BoutonLecture'
import { HoteAidesLecture } from './components/lecture/HoteAidesLecture'
import { HoteLecteurVoix } from './components/lecture/BoutonEcouter'
import { HoteBarreEleve } from './components/eleve/BarreEleve'

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
/** Espace professeur réorganisé (27/11/2026) : tableau de bord (page d'arrivée après la connexion) et
 * porte « Préparer un cours ». Réservés, jamais pré-rendus (absents de `scripts/routes.mjs`). */
const EspacePage = lazy(() => import('./routes/EspacePage').then((m) => ({ default: m.EspacePage })))
const PreparerPage = lazy(() => import('./routes/PreparerPage').then((m) => ({ default: m.PreparerPage })))
const CarnetPage = lazy(() => import('./routes/CarnetPage').then((m) => ({ default: m.CarnetPage })))
/** Lien de partage d'un enregistrement du coffre (0009) : professeur connecté seulement. */
const PartagePage = lazy(() => import('./routes/PartagePage').then((m) => ({ default: m.PartagePage })))
/** Page de classe à code (élèves SANS compte, 0010) : publique, `noindex`, jamais pré-rendue. */
const ClassePage = lazy(() => import('./routes/ClassePage').then((m) => ({ default: m.ClassePage })))
/** « Mon suivi » et le plan de révision (élève, sans compte, planche 13) : tout reste dans le navigateur,
 * chargés à la demande, jamais pré-rendus ni indexés — voir `.claude/rules/cote-eleve.md`. */
const SuiviPage = lazy(() => import('./routes/SuiviPage').then((m) => ({ default: m.SuiviPage })))
const PlanRevisionPage = lazy(() => import('./routes/PlanRevisionPage').then((m) => ({ default: m.PlanRevisionPage })))
/** Mode « Projeter en classe » (professeur connecté) : diapos plein écran, chargé à la demande, jamais
 * pré-rendu ni indexé — voir `.claude/rules/chapter-components.md`, « Mode projection ». */
/** « M'entraîner » (élève, chantier E du 27/11/2026) : publique, non indexée, jamais pré-rendue (elle lit les
 * essais gardés dans le navigateur). */
const EntrainerPage = lazy(() => import('./routes/EntrainerPage').then((m) => ({ default: m.EntrainerPage })))
const ProjectionPage = lazy(() => import('./components/projection/ProjectionPage').then((m) => ({ default: m.ProjectionPage })))

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
          <Route path="/espace" element={<EspacePage />} />
          <Route path="/espace/preparer" element={<PreparerPage />} />
          {/* Alias lisibles des portes (les pages gardent leur adresse d'avant). */}
          <Route path="/espace/classes" element={<Navigate to="/carnet" replace />} />
          <Route path="/espace/documents" element={<Navigate to="/coffre" replace />} />
          <Route path="/espace/reglages" element={<Navigate to="/profil" replace />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/coffre" element={<CoffrePage />} />
          <Route path="/partage/:jeton" element={<PartagePage />} />
          <Route path="/classe" element={<ClassePage />} />
          {/* `/carnet/*` : sous-pages du carnet (Aujourd’hui, semaine, classe, agenda…), jamais pré-rendues. */}
          <Route path="/carnet/*" element={<CarnetPage />} />
          <Route path="/suivi" element={<SuiviPage />} />
          <Route path="/suivi/plan" element={<PlanRevisionPage />} />
          <Route path="/entrainer" element={<EntrainerPage />} />
          {/* Un seul générateur rapatrié depuis plateforme-maths = une entrée dans
           * `ENTRAINEMENT_REGISTRY` (voir `src/entrainement/registry.ts`), jamais une nouvelle route
           * ici — `EntrainementPage` charge le bon composant à la demande (`React.lazy`), lu depuis
           * le registre selon `:generatorId`. Indispensable dès qu'on dépasse un ou deux générateurs
           * embarqués : chacun embarque tout son code (core/moteur/générateurs/ui/components), le
           * premier à lui seul avait déjà fait dépasser la limite de précache PWA par défaut sans
           * lazy-loading. */}
          <Route path="/entrainement/:chantier/:generatorId" element={<EntrainementPage />} />
          <Route path="/:levelSlug/:chapterSlug/exercices" element={<ChapterExercicePage />} />
          <Route path="/:levelSlug/:chapterSlug/projeter" element={<ProjectionPage />} />
          <Route path="/:levelSlug/:chapterSlug" element={<ChapterRoute />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
      {/* Panneau « Confort de lecture » (boutons « Aa »), un seul pour tout le site. */}
      <HotePanneauLecture />
      {/* Aides de lecture (règle, un bloc à la fois, loupe), chargées seulement si l'élève en active une. */}
      <HoteAidesLecture />
      {/* Lecture à voix haute : barre de lecture, seulement pendant une lecture lancée par « Écouter ». */}
      <HoteLecteurVoix />
      {/* Barre du bas du côté élève (téléphone) : Accueil · Cours · M'entraîner · Mon interro, selon la page. */}
      <HoteBarreEleve />
      </CompteProvider>
    </BrowserRouter>
  )
}

export default App
