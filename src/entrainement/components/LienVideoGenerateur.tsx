import { useState } from "react";
import type { VideoCapsuleGenerateur } from "../videosGenerateurs";
import { VIDEOS_GENERATEURS } from "../videosGenerateurs";

interface Props {
  generatorId: string;
}

function IconePlay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth={1.6} />
      <path d="M10 8.3 16.2 12 10 15.7Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Lien discret "Vidéo explicative" en tête de page générateur — monté UNE SEULE FOIS, dans
 * `EntrainementPage.tsx` (la route générique `/entrainement/:chantier/:generatorId`, déjà commune
 * aux 3 chantiers), plutôt que dans chacun des ~176 `App*.tsx` : contrairement à
 * `CalculatriceScientifique`/`BoutonAide` (de vrais écrans de générateur, qui n'existent qu'à
 * l'intérieur du composant propre à chaque générateur), ce lien n'a besoin d'aucun état ni contenu
 * spécifique à l'exercice en cours — seul `generatorId` (déjà disponible via `useParams` côté
 * `EntrainementPage`) suffit à retrouver ses vidéos. Rend `null` si `generatorId` n'a aucune entrée
 * dans `VIDEOS_GENERATEURS` (aucune capsule publiée pour ce générateur).
 *
 * Conséquence assumée de ce point de montage unique : affiché juste avant l'écran du générateur
 * (au même niveau que le lien "← Retour"), jamais littéralement à l'intérieur du `<header
 * className="app-header">` propre à chaque générateur (qui vit, lui, dans le composant
 * `App*.tsx`) — c'est aussi la toute première chose visible en arrivant sur la page, avant même le
 * titre de l'exercice, donc au moins aussi découvrable.
 *
 * 1 seule vidéo pour ce générateur → clic = lecture directe, aucune liste intermédiaire. Plusieurs
 * vidéos → une liste (titre + miniature) s'affiche d'abord dans le même panneau, cliquer une entrée
 * bascule vers le lecteur ; un lien "← Liste des vidéos" permet d'y revenir.
 */
export function LienVideoGenerateur({ generatorId }: Props) {
  const videos = VIDEOS_GENERATEURS[generatorId];
  const [ouvert, setOuvert] = useState(false);
  const [videoActive, setVideoActive] = useState<VideoCapsuleGenerateur | null>(null);

  if (!videos || videos.length === 0) return null;

  function ouvrir() {
    setOuvert(true);
    setVideoActive(videos.length === 1 ? videos[0] : null);
  }

  return (
    <>
      <button type="button" className="video-generateur-lien" onClick={ouvrir}>
        <IconePlay />
        {videos.length > 1 ? "Vidéos explicatives" : "Vidéo explicative"}
      </button>
      {ouvert && (
        <div className="video-overlay" onClick={() => setOuvert(false)}>
          <div className="video-panneau" onClick={(e) => e.stopPropagation()}>
            <div className="video-entete">
              {videoActive && videos.length > 1 ? (
                <button type="button" className="video-retour-liste" onClick={() => setVideoActive(null)}>
                  ← Liste des vidéos
                </button>
              ) : (
                <span className="video-entete-titre">{videoActive ? videoActive.titre : "Vidéos"}</span>
              )}
              <button type="button" className="video-fermer" onClick={() => setOuvert(false)} aria-label="Fermer">
                ×
              </button>
            </div>
            {videoActive ? (
              <div className="video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${videoActive.youtubeId}`}
                  title={videoActive.titre}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="video-liste">
                {videos.map((video) => (
                  <button type="button" className="video-liste-item" key={video.youtubeId} onClick={() => setVideoActive(video)}>
                    <span className="video-liste-vignette">
                      <IconePlay />
                    </span>
                    <span className="video-liste-titre">{video.titre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
