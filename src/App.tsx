import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'
import { AdminPage } from './routes/AdminPage'
import { ExercicePage } from './routes/ExercicePage'
import { ChapterExercicePage } from './routes/ChapterExercicePage'
import { EntrainementPage } from './routes/EntrainementPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/exercice" element={<ExercicePage />} />
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
    </BrowserRouter>
  )
}

export default App
