import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { chiffreAffaires, coutProportionnel, coutTotal, coutVariable } from "../generateurs5e/problemesContexte/scenarioC";
import { domaineGrapheScenarioC } from "../ui5e/scenarioCGraph";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_DISCRETE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "../components/mafsGraphPartage";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

interface Props {
  exercice: ExerciceScenarioC;
  /** "toutes" (défaut) affiche les 5 courbes (CF/CV/CP/CT/CA) ; "cvCp" (D.3,
   * `promptcorrectionsround2.md`, écran "reconnaissance") n'affiche QUE CV(x) et CP(x) — l'élève doit
   * en déduire les expressions algébriques d'après l'allure, jamais depuis CF/CT/CA qui ne concernent
   * pas cette compétence et compliqueraient inutilement un graphe déjà dense. */
  courbes?: "toutes" | "cvCp";
}

const COULEUR_CF = "#495057";
const COULEUR_CV = "#1971c2";
const COULEUR_CP = "#f08c00";
const COULEUR_CT = "#2f9e44";
const COULEUR_CA = "#d6336c";

const LARGEUR_PAR_DEFAUT = 360;
const LARGEUR_MIN = 260;
const LARGEUR_MAX = 420;

/** Graphe Mafs à 5 courbes (CF, CV, CP, CT, CA) — attention particulière à la lisibilité (spec
 * explicite, plus de séries que le graphe du scénario A) : CF en trait fin discret (ligne de
 * référence constante, jamais la donnée principale d'aucun écran), les 4 autres en trait accentué,
 * 5 couleurs distinctes + légende textuelle (jamais de simple couleur sans label, `<Text>` de Mafs
 * ne pouvant pas non plus rendre 5 étiquettes lisibles sans chevauchement sur un graphe déjà dense).
 * `preserveAspectRatio={false}` nécessaire ici aussi (même raison que `ScenarioAGraph.tsx`) : x
 * (quantité, jusqu'à ~60) et y (coût, jusqu'à plusieurs centaines) sont deux grandeurs de nature
 * différente. */
export function ScenarioCGraph({ exercice, courbes = "toutes" }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const { xMin, xMax, yMax } = domaineGrapheScenarioC(exercice);
  const { formeCV, formeCA, cf, k, m, p } = exercice;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div ref={ref} className="courbe-graph-conteneur mafs-graph">
      <div className="scenario-c-legende">
        {courbes === "toutes" && <span style={{ color: COULEUR_CF }}>■ CF</span>}
        <span style={{ color: COULEUR_CV }}>■ CV(x)</span>
        <span style={{ color: COULEUR_CP }}>■ CP(x)</span>
        {courbes === "toutes" && <span style={{ color: COULEUR_CT }}>■ CT(x)</span>}
        {courbes === "toutes" && <span style={{ color: COULEUR_CA }}>■ CA(x)</span>}
      </div>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: [xMin, xMax], y: [0, yMax], padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX largeur={largeur} borne={[0, Infinity]}>
          {(domaine) => (
            <>
              {courbes === "toutes" && <Plot.OfX y={() => cf} domain={domaine} color={COULEUR_CF} weight={EPAISSEUR_TRAIT_DISCRETE} />}
              <Plot.OfX y={(x) => coutVariable(formeCV, k, x)} domain={domaine} color={COULEUR_CV} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Plot.OfX y={(x) => coutProportionnel(m, x)} domain={domaine} color={COULEUR_CP} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              {courbes === "toutes" && <Plot.OfX y={(x) => coutTotal(cf, formeCV, k, m, x)} domain={domaine} color={COULEUR_CT} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
              {courbes === "toutes" && <Plot.OfX y={(x) => chiffreAffaires(formeCA, p, x)} domain={domaine} color={COULEUR_CA} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
            </>
          )}
        </DomaineTraceX>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
