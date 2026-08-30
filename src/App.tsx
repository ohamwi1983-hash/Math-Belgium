import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { ChapterRoute } from './routes/ChapterRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:levelSlug/:chapterSlug" element={<ChapterRoute />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
