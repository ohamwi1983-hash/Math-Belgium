import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'
import { AdminPage } from './routes/AdminPage'
import { ExercicePage } from './routes/ExercicePage'
import { ChapterExercicePage } from './routes/ChapterExercicePage'

/** Chargé à la demande (`React.lazy`) plutôt qu'en import statique : un générateur rapatrié depuis
 * plateforme-maths (voir `src/entrainement/`) embarque tout son code (core/moteur/générateurs/ui/
 * components) dans le bundle qui l'importe — à l'échelle de QUELQUES générateurs ce n'est déjà plus
 * négligeable (le premier, à lui seul, a fait grimper le chunk principal au-delà de la limite de
 * précache PWA par défaut), et la fusion vise à terme ~190 générateurs. Charger chaque page
 * `/entrainement/...` à la demande garde le bundle principal (chargé par CHAQUE visiteur, y compris
 * ceux qui ne s'entraînent jamais) proportionnel au site de cours, pas à la somme de tous les
 * générateurs portés — le pattern à répliquer pour chaque futur générateur migré. */
const EntrainementGen1Page = lazy(() => import('./routes/EntrainementGen1Page').then((m) => ({ default: m.EntrainementGen1Page })))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/exercice" element={<ExercicePage />} />
        <Route
          path="/entrainement/4e/gen1"
          element={
            <Suspense fallback={null}>
              <EntrainementGen1Page />
            </Suspense>
          }
        />
        <Route path="/:levelSlug/:chapterSlug/exercices" element={<ChapterExercicePage />} />
        <Route path="/:levelSlug/:chapterSlug" element={<ChapterRoute />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
