import { useState } from "react";
import { Line, Mafs, MovablePoint } from "mafs";
import "mafs/core.css";
import type { Point } from "../core/vecteur.types";
import { EPAISSEUR_TRAIT_STANDARD, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN, etendreViewBoxPourEtiquettes } from "../ui/mafsTransformation";
import { viewBoxConstructionDroite } from "../ui/constructionDroiteGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

interface Props {
  cible1: Point;
  cible2: Point;
  marqueur1: Point;
  marqueur2: Point;
  onDeplacerMarqueur1: (point: Point) => void;
  onDeplacerMarqueur2: (point: Point) => void;
  /** Marquage en direct (rouge) après une tentative échouée — comparaison contre l'UNE ou l'AUTRE
   * cible, jamais une garantie de correspondance globale (voir `pointCorrespondAUneCible`). */
  marqueur1Errone?: boolean;
  marqueur2Errone?: boolean;
}

const COULEUR_MARQUEUR = "#e8590c";
const COULEUR_ERRONEE = "#e03131";
const COULEUR_DROITE = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

function snapEntier([x, y]: [number, number]): [number, number] {
  return [Math.round(x), Math.round(y)];
}

/**
 * Graphe Mafs de l'écran "trace" — deux `MovablePoint` avec magnétisme grille (même patron que
 * "Construction graphique de vecteurs sur grille", chapitre 4), mais **jamais** de réutilisation
 * directe de `VecteurGraph` : ce composant affiche systématiquement tout point qui lui est passé
 * en prop, ce qui révélerait les 2 cibles avant même que l'élève ne les place. Le viewBox est donc
 * calculé séparément (`viewBoxConstructionDroite`, couvre cibles ET marqueurs) sans jamais rendre
 * les cibles elles-mêmes.
 *
 * `Line.ThroughPoints` relie les 2 marqueurs en temps réel (`promptgen43gen44etcorrectionschapitre6.md`,
 * partie B.2) — la droite suit dynamiquement `marqueur1`/`marqueur2`, déjà des props React, donc
 * aucun état supplémentaire nécessaire ; visible dès l'arrivée sur l'écran (aux positions initiales
 * par défaut des marqueurs), jamais seulement révélée après validation. Couleur neutre fixe,
 * indépendante de `marqueur{1,2}Errone` : le retour visuel d'erreur reste porté par les marqueurs
 * eux-mêmes, jamais dupliqué sur la droite.
 */
export function ConstructionDroiteGraph({
  cible1,
  cible2,
  marqueur1,
  marqueur2,
  onDeplacerMarqueur1,
  onDeplacerMarqueur2,
  marqueur1Errone = false,
  marqueur2Errone = false,
}: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const viewBox = viewBoxConstructionDroite(cible1, cible2, marqueur1, marqueur2);
  const viewBoxEtendu = etendreViewBoxPourEtiquettes(viewBox);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <Line.ThroughPoints point1={[marqueur1.x, marqueur1.y]} point2={[marqueur2.x, marqueur2.y]} color={COULEUR_DROITE} weight={EPAISSEUR_TRAIT_STANDARD} />
        <MovablePoint
          point={[marqueur1.x, marqueur1.y]}
          onMove={(p) => {
            const [x, y] = snapEntier(p);
            onDeplacerMarqueur1({ x, y });
          }}
          constrain={snapEntier}
          color={marqueur1Errone ? COULEUR_ERRONEE : COULEUR_MARQUEUR}
        />
        <MovablePoint
          point={[marqueur2.x, marqueur2.y]}
          onMove={(p) => {
            const [x, y] = snapEntier(p);
            onDeplacerMarqueur2({ x, y });
          }}
          constrain={snapEntier}
          color={marqueur2Errone ? COULEUR_ERRONEE : COULEUR_MARQUEUR}
        />
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
