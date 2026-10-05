import type { AllureCroquis } from "../ui/allureSketch";

interface Props {
  croquis: AllureCroquis;
}

/**
 * Croquis schématique de l'allure du graphe (étape 2) : seul Oy est visible — pas d'axe Ox,
 * contrairement à ParabolaSketch (exercice "tableau de signes"). Tant que signeA/signeAB n'ont
 * pas encore été choisis, la courbe et le point de contact sont rendus en gris ("neutre") plutôt
 * que de présumer une valeur.
 */
export function AllureSketch({ croquis }: Props) {
  const neutre = croquis.concavite === "neutre" && croquis.position === "neutre";

  return (
    <svg
      className="allure-sketch"
      viewBox={`0 0 ${croquis.largeur} ${croquis.hauteur}`}
      role="img"
      aria-label="Croquis schématique de l'allure du graphe"
    >
      <line x1={croquis.axeOyX} y1={0} x2={croquis.axeOyX} y2={croquis.hauteur - 10} className="allure-axe" />
      <polygon
        points={`${croquis.axeOyX - 6},10 ${croquis.axeOyX + 6},10 ${croquis.axeOyX},0`}
        className="allure-fleche"
      />
      <text x={croquis.axeOyX + 10} y={14} className="allure-label-axe">
        y
      </text>
      <polyline
        points={croquis.points.map((p) => `${p.x},${p.y}`).join(" ")}
        className={neutre ? "allure-courbe is-neutre" : "allure-courbe"}
      />
      <circle cx={croquis.pointContactC.x} cy={croquis.pointContactC.y} r={4} className="allure-point-c" />
      <text x={croquis.pointContactC.x + 8} y={croquis.pointContactC.y + 4} className="allure-label-c">
        c = {croquis.valeurC}
      </text>
    </svg>
  );
}
