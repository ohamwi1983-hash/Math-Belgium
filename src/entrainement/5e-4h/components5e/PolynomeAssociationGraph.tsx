import { useState } from "react";
import { Mafs, Plot } from "mafs";
import "mafs/core.css";
import type { PolynomeAssociation } from "../core5e/association.types";
import { evaluerPolynome } from "../generateurs5e/domaineDefinition/polynome";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, ZOOM_MAX, ZOOM_MIN } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX5e, GrilleAdaptative5e } from "./mafsGraphPartage5e";

const X_MIN = -4;
const X_MAX = 4;
const LARGEUR = 220;
const HAUTEUR = LARGEUR / RATIO_GRAPHE;
const COULEUR_COURBE = "#1971c2";

/** Cadrage vertical par échantillonnage — même principe que `domaineGrapheScenarioA` (marge fixe,
 * pas de calcul analytique de min/max pour un polynôme quelconque de faible degré). */
function calculerYMinMax(coeffs: PolynomeAssociation): { yMin: number; yMax: number } {
  let yMin = Infinity;
  let yMax = -Infinity;
  for (let i = 0; i <= 80; i++) {
    const x = X_MIN + ((X_MAX - X_MIN) * i) / 80;
    const y = evaluerPolynome(coeffs, x);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  return { yMin: yMin - marge, yMax: yMax + marge };
}

/** Un mini-graphique Mafs pour UN polynôme (f ou f') — réutilisé aussi bien pour les éléments
 * numérotés que pour les candidats lettrés de 5gen25 (familles A/B). Taille fixe, compacte (pensée
 * pour une grille 2 colonnes, y compris sur mobile étroit).
 *
 * Légende d'échelle (`prompt5gen25legendeechelleauditzoom.md`) — absente jusqu'ici, alors que le
 * zoom est activé (`zoom={{min,max}}`) : ajoutée via `onPasChange`/`formatIndicateurPasGrille`, même
 * convention transversale que tous les autres graphes Mafs de la plateforme, réactive en direct au
 * zoom (mécanisme déjà réactif de `GrilleAdaptative5e`, jamais recalculée une seule fois). */
export function PolynomeAssociationGraph({ coeffs }: { coeffs: PolynomeAssociation }) {
  const { yMin, yMax } = calculerYMinMax(coeffs);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className="courbe-graph-conteneur mafs-graph">
      <Mafs width={LARGEUR} height={HAUTEUR} viewBox={{ x: [X_MIN, X_MAX], y: [yMin, yMax], padding: 0 }} preserveAspectRatio={false} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative5e largeur={LARGEUR} hauteur={HAUTEUR} onPasChange={(x, y) => setPas({ x, y })} />
        <DomaineTraceX5e largeur={LARGEUR}>
          {(domaine) => <Plot.OfX y={(x) => evaluerPolynome(coeffs, x)} domain={domaine} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
        </DomaineTraceX5e>
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
