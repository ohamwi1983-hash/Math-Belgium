import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { aireBasesCylindre, aireLateraleCylindre } from "../generateurs5e/problemesContexte/scenarioA";
import { domaineGrapheScenarioA } from "../ui5e/scenarioAGraph";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

interface Props {
  exercice: ExerciceScenarioAConteneur;
}

const COULEUR_F = "#1971c2";
const COULEUR_G = "#f08c00";
const COULEUR_SOMME = "#2f9e44";

const LARGEUR_PAR_DEFAUT = 360;
const LARGEUR_MIN = 260;
const LARGEUR_MAX = 420;

/** Graphe Mafs à 3 courbes (f=aire latérale, g=aire des bases, f+g) — écran "graphique" du scénario
 * A, l'élève y estime visuellement le rayon qui minimise f+g (voir `domaineGrapheScenarioA` pour le
 * cadrage). Aucune coordonnée précise à lire au-delà de cette estimation (tolérance large côté
 * vérification), donc grille/axes conservés (échelle utile) mais pas de zoom nécessaire au-delà du
 * pan par défaut. `preserveAspectRatio={false}` nécessaire ici : x (rayon, ~10 unités) et y (aire,
 * ~2000 unités) sont deux grandeurs de nature différente — sans ce réglage, Mafs déforme l'axe X
 * pour forcer un même pas pixel/unité sur les deux (piège déjà documenté ailleurs sur la
 * plateforme, ex. `ComparaisonSeriesGraph.tsx`/`PolygoneEffectifsGraph.tsx`), écrasant les 3
 * courbes dans une bande verticale étroite — confirmé par capture Playwright avant correctif. */
export function ScenarioAGraph({ exercice }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const { xMin, xMax, yMax } = domaineGrapheScenarioA(exercice);
  const v = exercice.volumeCm3;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div ref={ref} className="courbe-graph-conteneur mafs-graph">
      <div className="scenario-a-legende">
        <span style={{ color: COULEUR_F }}>■ f(x) — aire latérale</span>
        <span style={{ color: COULEUR_G }}>■ g(x) — aire des bases</span>
        <span style={{ color: COULEUR_SOMME }}>■ (f+g)(x)</span>
      </div>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: [xMin, xMax], y: [0, yMax], padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX largeur={largeur} borne={[0, Infinity]}>
          {(domaine) => (
            <>
              <Plot.OfX y={(x) => aireLateraleCylindre(v, x)} domain={domaine} color={COULEUR_F} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Plot.OfX y={(x) => aireBasesCylindre(x)} domain={domaine} color={COULEUR_G} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Plot.OfX y={(x) => aireLateraleCylindre(v, x) + aireBasesCylindre(x)} domain={domaine} color={COULEUR_SOMME} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            </>
          )}
        </DomaineTraceX>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
