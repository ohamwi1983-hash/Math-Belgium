import type { MarqueOx, PointSketchAxeSommet, SegmentSurligne, SketchAxeSommetGeom } from "../ui/sketchAxeSommet";
import { decalageLabelSommet } from "../ui/sketchAxeSommet";

/**
 * Rendu d'un indice mathématique ("x_S", "x_1"...) en véritable indice SVG — un `tspan` à taille
 * de police réduite et décalage de ligne de base, jamais un underscore littéral affiché à l'écran
 * (prompt-indices-et-desync-courbe.md, point 1).
 */
function LabelIndiceX({ indice }: { indice: string }) {
  return (
    <>
      x<tspan className="axe-sommet-indice">{indice}</tspan>
    </>
  );
}

interface Props {
  geom: SketchAxeSommetGeom;
  /** Tracé de la courbe (prompt-courbe-et-fusion-labels.md, point 1) — voir calculerCourbeAxeSommet. */
  courbe: PointSketchAxeSommet[];
  /** Signe de a — détermine, entre autres, de quel côté (dessus/dessous) placer l'étiquette "S"
   * pour ne jamais chevaucher la courbe (voir decalageLabelSommet). */
  signeA: "+" | "-";
  /** Surlignage vert sur Oy (point 2 : écrans "domaine et image" et "tableau de signes"). */
  surlignage?: SegmentSurligne;
  /** Marques des racines + x_S sur Ox (point 4 : écran "tableau de signes" uniquement). */
  marquesOx?: MarqueOx[];
}

/**
 * Croquis partagé Ox+Oy des 3 boutons "Aide" (axe et sommet / domaine et image / tableau de
 * signes) — voir src/ui/sketchAxeSommet.ts pour la géométrie. Un seul composant paramétrable,
 * `surlignage`/`marquesOx` additifs et optionnels (absents par défaut, comme les autres props
 * additives du projet) ; `courbe` en revanche est toujours fournie par les 3 écrans appelants
 * (la courbe fait partie du croquis de base, pas une surcouche conditionnelle).
 */
export function SketchAxeSommet({ geom, courbe, signeA, surlignage, marquesOx }: Props) {
  const finOy = 8;
  const finOx = geom.largeur - 8;
  /**
   * Quand une marque Ox fusionne x_S avec une ou deux racines (prompt-courbe-et-fusion-labels.md,
   * point 2), cette même position porte déjà les labels "x_1=x_2=valeur" et "xS=valeur" — le
   * petit label "S" du point sommet, juste à côté, serait redondant et se chevaucherait avec eux
   * (S et la marque fusionnée occupent le même point de l'axe). Il est donc masqué dans ce cas
   * précis uniquement ; le point S lui-même reste toujours affiché.
   */
  const labelSMasque = marquesOx?.some((m) => m.estSommet && m.labelsRacines.length > 0) ?? false;

  return (
    <svg
      className="axe-sommet-sketch"
      viewBox={`0 0 ${geom.largeur} ${geom.hauteur}`}
      role="img"
      aria-label="Croquis schématique avec les axes Ox et Oy"
    >
      <line x1={geom.axeOyX} y1={geom.hauteur - 10} x2={geom.axeOyX} y2={finOy} className="axe-sommet-axe" />
      <polygon
        points={`${geom.axeOyX - 6},${finOy + 10} ${geom.axeOyX + 6},${finOy + 10} ${geom.axeOyX},${finOy}`}
        className="axe-sommet-fleche"
      />
      <text x={geom.axeOyX + 10} y={finOy + 12} className="axe-sommet-label-axe">
        y
      </text>

      <line x1={10} y1={geom.axeOxY} x2={finOx} y2={geom.axeOxY} className="axe-sommet-axe" />
      <polygon
        points={`${finOx - 10},${geom.axeOxY - 6} ${finOx - 10},${geom.axeOxY + 6} ${finOx},${geom.axeOxY}`}
        className="axe-sommet-fleche"
      />
      <text x={finOx - 12} y={geom.axeOxY - 8} className="axe-sommet-label-axe">
        x
      </text>

      <polyline points={courbe.map((p) => `${p.x},${p.y}`).join(" ")} className="axe-sommet-courbe" />

      {surlignage && (
        <line
          x1={surlignage.x}
          y1={surlignage.y1}
          x2={surlignage.x}
          y2={surlignage.y2}
          className="axe-sommet-surlignage"
        />
      )}

      {marquesOx?.map((marque, i) => (
        <g key={i}>
          <line
            x1={marque.x}
            y1={geom.axeOxY - 5}
            x2={marque.x}
            y2={geom.axeOxY + 5}
            className={marque.estSommet ? "axe-sommet-marque-ox is-sommet" : "axe-sommet-marque-ox"}
          />
          {marque.estSommet && marque.labelsRacines.length > 0 ? (
            <>
              <text x={marque.x} y={geom.axeOxY - 9} className="axe-sommet-label-marque" textAnchor="middle">
                {marque.labelsRacines.map((indice, i) => (
                  <tspan key={indice}>
                    {i > 0 && "="}
                    <LabelIndiceX indice={indice} />
                  </tspan>
                ))}
                ={marque.valeur}
              </text>
              <text x={marque.x} y={geom.axeOxY + 18} className="axe-sommet-label-marque" textAnchor="middle">
                <LabelIndiceX indice="S" />={marque.valeur}
              </text>
            </>
          ) : (
            <text x={marque.x} y={geom.axeOxY + 18} className="axe-sommet-label-marque" textAnchor="middle">
              {marque.estSommet ? <LabelIndiceX indice="S" /> : marque.valeur}
            </text>
          )}
        </g>
      ))}

      <circle cx={geom.pointC.x} cy={geom.pointC.y} r={3.5} className="axe-sommet-point-c" />
      <text x={geom.pointC.x + 8} y={geom.pointC.y + 4} className="axe-sommet-label-c">
        c = {geom.valeurC}
      </text>

      <circle cx={geom.pointS.x} cy={geom.pointS.y} r={4.5} className="axe-sommet-point-s" />
      {!labelSMasque && (
        <text x={geom.pointS.x + 8} y={geom.pointS.y + decalageLabelSommet(signeA)} className="axe-sommet-label-s">
          S
        </text>
      )}
    </svg>
  );
}
