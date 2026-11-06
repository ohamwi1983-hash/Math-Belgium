import type { ReactElement } from "react";
import type { ExerciceCarresEmboites, ExerciceSuiteClassique, ExerciceTrianglesZigzag } from "../core5e/suitesClassiques.types";
import type { PhaseSuiteClassique } from "../moteur5e/typesSuiteClassique";

/**
 * Figures de l'énoncé de 5gen17 (audit 5e ch. 3, point 25 : énoncés autosuffisants) — zigzag dans
 * le triangle équilatéral, partage du carré (partie a) et carrés emboîtés (partie b). SVG à largeur
 * fluide (max 320 px), couleurs tirées du thème. `null` pour les scénarios sans figure.
 */
export function FigureSuiteClassique({ exercice, phase }: { exercice: ExerciceSuiteClassique; phase: PhaseSuiteClassique }) {
  if (exercice.scenario === "trianglesZigzag") return <FigureZigzag exercice={exercice} />;
  if (exercice.scenario === "carresEmboites") {
    return phase === "airesB" || phase === "sommeInfinieB" ? <FigureCarresMilieux exercice={exercice} /> : <FigurePartageCarre exercice={exercice} />;
  }
  return null;
}

const STYLE_FIGURE = { display: "block", width: "100%", maxWidth: 320, height: "auto", margin: "12px auto 0" } as const;
const ENCRE = "var(--color-text)";
const DOUX = "var(--color-text-muted)";
const ACCENT = "var(--color-primary)";
const FOND_ACCENT = "var(--color-primary-bg)";

type Point = { x: number; y: number };

function texte(p: Point, contenu: string, ancre: "start" | "middle" | "end" = "middle", couleur = ENCRE, taille = 13) {
  return (
    <text x={p.x} y={p.y} fontSize={taille} fill={couleur} textAnchor={ancre} fontStyle="italic">
      {contenu}
    </text>
  );
}

/** Projection orthogonale de P sur la droite (O, direction unitaire u). */
function projeter(p: Point, o: Point, u: Point): Point {
  const t = (p.x - o.x) * u.x + (p.y - o.y) * u.y;
  return { x: o.x + t * u.x, y: o.y + t * u.y };
}

function unitaire(a: Point, b: Point): Point {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
}

function FigureZigzag({ exercice }: { exercice: ExerciceTrianglesZigzag }) {
  const L = 250;
  const C: Point = { x: 30, y: 245 };
  const B: Point = { x: C.x + L, y: C.y };
  const A: Point = { x: C.x + L / 2, y: C.y - (L * Math.sqrt(3)) / 2 };
  const versA = unitaire(C, A);
  const versB = unitaire(C, B);
  const points: Point[] = [B];
  for (let k = 1; k <= 7; k++) points.push(projeter(points[k - 1], C, k % 2 === 1 ? versA : versB));
  const angleDroit = (h: Point, precedent: Point) => {
    const s = 7;
    const d = unitaire(h, C);
    const n = unitaire(h, precedent);
    return `${h.x + s * d.x},${h.y + s * d.y} ${h.x + s * (d.x + n.x)},${h.y + s * (d.y + n.y)} ${h.x + s * n.x},${h.y + s * n.y}`;
  };
  const etiquettes = [
    { p: points[1], t: "H₁", dx: -16, dy: 0 },
    { p: points[2], t: "H₂", dx: 0, dy: 17 },
    { p: points[3], t: "H₃", dx: -16, dy: 2 },
  ];
  return (
    <svg viewBox="0 0 310 275" style={STYLE_FIGURE} role="img" aria-label="Triangle équilatéral ABC et zigzag B, H1, H2, H3…">
      <polygon points={`${C.x},${C.y} ${B.x},${B.y} ${points[1].x},${points[1].y}`} fill={FOND_ACCENT} />
      <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="none" stroke={ENCRE} strokeWidth={1.5} />
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={ACCENT} strokeWidth={2.4} strokeLinejoin="round" />
      <polyline points={angleDroit(points[1], points[0])} fill="none" stroke={DOUX} strokeWidth={1} />
      <polyline points={angleDroit(points[2], points[1])} fill="none" stroke={DOUX} strokeWidth={1} />
      {texte({ x: A.x, y: A.y - 8 }, "A")}
      {texte({ x: B.x + 6, y: B.y + 16 }, "B", "start")}
      {texte({ x: C.x - 6, y: C.y + 16 }, "C", "end")}
      {etiquettes.map((e) => (
        <g key={e.t}>{texte({ x: e.p.x + e.dx, y: e.p.y + e.dy }, e.t)}</g>
      ))}
      {texte({ x: (C.x + B.x) / 2 + 40, y: C.y + 22 }, `${exercice.cote} cm`, "middle", DOUX, 12)}
      {texte({ x: (B.x + points[1].x) / 2 + 8, y: (B.y + points[1].y) / 2 - 6 }, "ℓ₁", "start", ACCENT)}
      {texte({ x: C.x + 70, y: C.y - 30 }, "T₁", "middle", DOUX, 12)}
    </svg>
  );
}

/** Cases coloriées (indices ligne×colonne depuis le haut-gauche) — jamais la case du coin haut
 * droit, où la construction recommence. */
function casesColoriees(cote: number, colorees: number): [number, number][] {
  const ordre: [number, number][] =
    cote === 2
      ? [
          [1, 0],
          [0, 0],
          [1, 1],
        ]
      : [
          [2, 0],
          [1, 1],
          [0, 0],
          [2, 2],
          [1, 0],
          [2, 1],
          [0, 1],
          [1, 2],
        ];
  return ordre.slice(0, colorees);
}

function FigurePartageCarre({ exercice }: { exercice: ExerciceCarresEmboites }) {
  const cote = Math.round(Math.sqrt(exercice.partsA));
  const elements: ReactElement[] = [];
  let x = 20;
  let y = 20;
  let taille = 240;
  for (let niveau = 0; niveau < 4; niveau++) {
    const pas = taille / cote;
    for (const [ligne, colonne] of casesColoriees(cote, exercice.coloreesA)) {
      elements.push(<rect key={`c${niveau}-${ligne}-${colonne}`} x={x + colonne * pas} y={y + ligne * pas} width={pas} height={pas} fill={ACCENT} fillOpacity={0.75} />);
    }
    for (let i = 1; i < cote; i++) {
      elements.push(<line key={`v${niveau}-${i}`} x1={x + i * pas} y1={y} x2={x + i * pas} y2={y + taille} stroke={ENCRE} strokeWidth={niveau === 0 ? 1.2 : 0.8} />);
      elements.push(<line key={`h${niveau}-${i}`} x1={x} y1={y + i * pas} x2={x + taille} y2={y + i * pas} stroke={ENCRE} strokeWidth={niveau === 0 ? 1.2 : 0.8} />);
    }
    // La construction recommence dans la case du coin haut droit.
    x = x + (cote - 1) * pas;
    taille = pas;
  }
  return (
    <svg viewBox="0 0 280 280" style={STYLE_FIGURE} role="img" aria-label={`Carré partagé en ${exercice.partsA}, ${exercice.coloreesA} case(s) coloriée(s) à chaque étape`}>
      <rect x={20} y={20} width={240} height={240} fill="none" stroke={ENCRE} strokeWidth={1.6} />
      {elements}
      {texte({ x: 140, y: 276 }, "aire du grand carré : 1", "middle", DOUX, 12)}
    </svg>
  );
}

function FigureCarresMilieux({ exercice }: { exercice: ExerciceCarresEmboites }) {
  let sommets: Point[] = [
    { x: 30, y: 20 },
    { x: 250, y: 20 },
    { x: 250, y: 240 },
    { x: 30, y: 240 },
  ];
  const carres: Point[][] = [];
  for (let i = 0; i < 6; i++) {
    carres.push(sommets);
    sommets = sommets.map((p, j) => {
      const q = sommets[(j + 1) % 4];
      return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    });
  }
  return (
    <svg viewBox="0 0 280 270" style={STYLE_FIGURE} role="img" aria-label="Carrés emboîtés obtenus en joignant les milieux des côtés">
      {carres.map((c, i) => (
        <polygon key={i} points={c.map((p) => `${p.x},${p.y}`).join(" ")} fill={i % 2 === 1 ? FOND_ACCENT : "none"} stroke={i === 0 ? ENCRE : ACCENT} strokeWidth={i === 0 ? 1.6 : 1.3} />
      ))}
      {texte({ x: 140, y: 262 }, `côté ${exercice.coteB} cm`, "middle", DOUX, 12)}
    </svg>
  );
}
