import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import { type ExerciceScenarioAReduit, domaineGrapheScenarioAReduit, fDeX, gDeX } from "../ui5e/scenarioAGraphReduit";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

interface Props {
  exercice: ExerciceScenarioAReduit;
}

const COULEUR_F = "#1971c2";
const COULEUR_G = "#f08c00";
const COULEUR_SOMME = "#2f9e44";

const LARGEUR_PAR_DEFAUT = 360;
const LARGEUR_MIN = 260;
const LARGEUR_MAX = 420;

/** Graphe Mafs à 3 courbes (f, g, f+g) — écran "extremumSimple" des combos réduits (2-5) du
 * scénario A, l'élève y estime visuellement l'extremum de f+g. Générique sur les 4 combos via
 * `fDeX`/`gDeX` (`ui5e/scenarioAGraphReduit.ts`), même patron que `ScenarioAGraph.tsx` (combo de
 * référence). `preserveAspectRatio={false}` nécessaire : x et (f+g) sont 2 grandeurs de nature
 * différente (voir `ScenarioAGraph.tsx` pour la justification complète). */
export function ScenarioAGraphReduit({ exercice }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const { xMin, xMax, yMax } = domaineGrapheScenarioAReduit(exercice);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div ref={ref} className="courbe-graph-conteneur mafs-graph">
      <div className="scenario-a-legende">
        <span style={{ color: COULEUR_F }}>■ f(x)</span>
        <span style={{ color: COULEUR_G }}>■ g(x)</span>
        <span style={{ color: COULEUR_SOMME }}>■ (f+g)(x)</span>
      </div>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: [xMin, xMax], y: [0, yMax], padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX largeur={largeur} borne={[0, Infinity]}>
          {(domaine) => (
            <>
              <Plot.OfX y={(x) => fDeX(exercice, x)} domain={domaine} color={COULEUR_F} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Plot.OfX y={(x) => gDeX(exercice, x)} domain={domaine} color={COULEUR_G} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Plot.OfX y={(x) => fDeX(exercice, x) + gDeX(exercice, x)} domain={domaine} color={COULEUR_SOMME} weight={EPAISSEUR_TRAIT_ACCENTUE} />
            </>
          )}
        </DomaineTraceX>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
