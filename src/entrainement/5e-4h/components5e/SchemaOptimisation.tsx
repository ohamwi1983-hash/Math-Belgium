import type { ReactNode } from "react";
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";

/**
 * Schéma SVG simple de la situation de 5gen32 (audit 5e ch. 5, point 52) : gouttière (trapèze),
 * boîte cylindrique, affiche avec marges, fenêtre. Purement illustratif (proportions fixes, jamais
 * les valeurs de l'exercice) ; seules les lettres de l'énoncé y figurent. Traits et textes en
 * `currentColor` : lisible en thème clair comme en thème sombre. Aucun schéma pour la variante
 * « cubique ».
 */
const STYLE_TEXTE = { fontSize: 13, fontStyle: "italic" as const, fill: "currentColor" };
const STYLE_COTE = { stroke: "currentColor", strokeWidth: 1, strokeDasharray: "4 3", fill: "none" };
const STYLE_TRAIT = { stroke: "currentColor", strokeWidth: 2, fill: "none" };

function Gouttiere() {
  // Fond (petite base b) de (100;130) à (160;130) ; bords de longueur 70 inclinés de 60°.
  const ax = 100, bx = 160, y0 = 130, dx = 35, dy = 60.6;
  return (
    <>
      <polyline points={`${ax - dx},${y0 - dy} ${ax},${y0} ${bx},${y0} ${bx + dx},${y0 - dy}`} style={STYLE_TRAIT} />
      <line x1={ax - dx} y1={y0 - dy} x2={bx + dx} y2={y0 - dy} style={STYLE_COTE} />
      <line x1={bx} y1={y0} x2={bx + 55} y2={y0} style={STYLE_COTE} />
      <line x1={bx + dx} y1={y0 - dy} x2={bx + dx} y2={y0} style={STYLE_COTE} />
      <path d={`M ${bx + 20} ${y0} A 20 20 0 0 0 ${bx + 10} ${y0 - 17.3}`} style={{ ...STYLE_TRAIT, strokeWidth: 1.2 }} />
      <text x={bx + 24} y={y0 - 8} style={STYLE_TEXTE}>α</text>
      <text x={(ax + bx) / 2} y={y0 + 18} textAnchor="middle" style={STYLE_TEXTE}>b</text>
      <text x={ax - dx / 2 - 14} y={y0 - dy / 2 + 4} textAnchor="middle" style={STYLE_TEXTE}>l</text>
      <text x={bx + dx / 2 + 12} y={y0 - dy / 2 - 4} textAnchor="middle" style={STYLE_TEXTE}>l</text>
      <text x={bx + dx + 8} y={y0 - dy / 2 + 4} style={STYLE_TEXTE}>h</text>
      <text x={(ax + bx) / 2} y={y0 - dy - 8} textAnchor="middle" style={STYLE_TEXTE}>B</text>
    </>
  );
}

function Cylindre() {
  const cx = 130, rx = 45, ry = 12, haut = 35, bas = 135;
  return (
    <>
      <ellipse cx={cx} cy={haut} rx={rx} ry={ry} style={STYLE_TRAIT} />
      <line x1={cx - rx} y1={haut} x2={cx - rx} y2={bas} style={STYLE_TRAIT} />
      <line x1={cx + rx} y1={haut} x2={cx + rx} y2={bas} style={STYLE_TRAIT} />
      <path d={`M ${cx - rx} ${bas} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bas}`} style={STYLE_TRAIT} />
      <path d={`M ${cx - rx} ${bas} A ${rx} ${ry} 0 0 1 ${cx + rx} ${bas}`} style={STYLE_COTE} />
      <line x1={cx} y1={haut} x2={cx + rx} y2={haut} style={{ ...STYLE_TRAIT, strokeWidth: 1.2 }} />
      <circle cx={cx} cy={haut} r={2} fill="currentColor" />
      <text x={cx + rx / 2} y={haut - 4} textAnchor="middle" style={STYLE_TEXTE}>x</text>
      <line x1={cx + rx + 14} y1={haut} x2={cx + rx + 14} y2={bas} style={STYLE_COTE} />
      <text x={cx + rx + 20} y={(haut + bas) / 2 + 4} style={STYLE_TEXTE}>h</text>
    </>
  );
}

function Affiche() {
  const x0 = 70, y0 = 15, l = 120, h = 140, mh = 22, mv = 18;
  return (
    <>
      <rect x={x0} y={y0} width={l} height={h} style={STYLE_TRAIT} />
      <rect x={x0 + mh} y={y0 + mv} width={l - 2 * mh} height={h - 2 * mv} style={{ ...STYLE_TRAIT, strokeWidth: 1.2 }} fill="currentColor" fillOpacity={0.08} />
      <text x={x0 + l / 2} y={y0 + h - mv - 6} textAnchor="middle" style={STYLE_TEXTE}>x</text>
      <text x={x0 + l - mh - 12} y={y0 + h / 2 + 4} textAnchor="middle" style={STYLE_TEXTE}>y</text>
      <text x={x0 + mh / 2} y={y0 + h / 2 + 4} textAnchor="middle" style={{ ...STYLE_TEXTE, fontSize: 11 }}>m<tspan baselineShift="sub" fontSize={8}>h</tspan></text>
      <text x={x0 + l - mh / 2} y={y0 + h / 2 + 4} textAnchor="middle" style={{ ...STYLE_TEXTE, fontSize: 11 }}>m<tspan baselineShift="sub" fontSize={8}>h</tspan></text>
      <text x={x0 + l / 2} y={y0 + mv / 2 + 4} textAnchor="middle" style={{ ...STYLE_TEXTE, fontSize: 11 }}>m<tspan baselineShift="sub" fontSize={8}>v</tspan></text>
      <text x={x0 + l / 2} y={y0 + h - mv / 2 + 4} textAnchor="middle" style={{ ...STYLE_TEXTE, fontSize: 11 }}>m<tspan baselineShift="sub" fontSize={8}>v</tspan></text>
    </>
  );
}

function Fenetre() {
  const cx = 130, r = 40, yBase = 150, hRect = 70;
  const yHaut = yBase - hRect;
  return (
    <>
      <path d={`M ${cx - r} ${yHaut} L ${cx - r} ${yBase} L ${cx + r} ${yBase} L ${cx + r} ${yHaut} A ${r} ${r} 0 0 0 ${cx - r} ${yHaut}`} style={STYLE_TRAIT} />
      <line x1={cx - r} y1={yHaut} x2={cx + r} y2={yHaut} style={STYLE_COTE} />
      <line x1={cx} y1={yHaut} x2={cx + r * Math.cos(Math.PI / 4)} y2={yHaut - r * Math.sin(Math.PI / 4)} style={{ ...STYLE_TRAIT, strokeWidth: 1.2 }} />
      <circle cx={cx} cy={yHaut} r={2} fill="currentColor" />
      <text x={cx + 8} y={yHaut - 16} style={STYLE_TEXTE}>r</text>
      <text x={cx + r + 8} y={(yHaut + yBase) / 2 + 4} style={STYLE_TEXTE}>h</text>
      <text x={cx} y={yBase + 16} textAnchor="middle" style={STYLE_TEXTE}>2r</text>
    </>
  );
}

export function SchemaOptimisation({ exercice }: { exercice: ExerciceOptimisation }) {
  let contenu: ReactNode = null;
  let description = "";
  switch (exercice.famille) {
    case "trapeze":
      contenu = <Gouttiere />;
      description = "Section de la gouttière : fond b, bords de longueur l inclinés d'un angle α, hauteur h, ouverture B";
      break;
    case "cylindre":
      contenu = <Cylindre />;
      description = "Boîte cylindrique de rayon x et de hauteur h";
      break;
    case "margesA":
    case "margesB":
      contenu = <Affiche />;
      description = "Affiche : zone imprimée x sur y, marges m_h à gauche et à droite, m_v en haut et en bas";
      break;
    case "fenetreA":
    case "fenetreB":
      contenu = <Fenetre />;
      description = "Fenêtre : rectangle de largeur 2r et de hauteur h surmonté d'un demi-cercle de rayon r";
      break;
    case "cubique":
      return null;
  }
  return (
    <svg viewBox="0 0 260 172" width="100%" style={{ maxWidth: 260, display: "block", margin: "8px auto 0", color: "inherit" }} role="img" aria-label={description}>
      {contenu}
    </svg>
  );
}
