import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'
import { AdminPage } from './routes/AdminPage'
import { ExercicePage } from './routes/ExercicePage'
import { ChapterExercicePage } from './routes/ChapterExercicePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/exercice" element={<ExercicePage />} />
        <Route path="/:levelSlug/:chapterSlug/exercices" element={<ChapterExercicePage />} />
        <Route path="/:levelSlug/:chapterSlug" element={<ChapterRoute />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
