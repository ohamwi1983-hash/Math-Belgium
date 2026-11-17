import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { PointEntier } from "../core6e/lirePlacerPlanComplexe.types";

/**
 * Plan complexe quadrillé de `6gen95` « Lire et placer dans le plan complexe » — figure de l'énoncé
 * ET surface de placement. Fenêtre FIXE [−5 ; 5] × [−5 ; 5] (jamais recadrée sur la réponse),
 * repère orthonormé, une unité par carreau, graduations écrites sur les axes, aucune coordonnée
 * écrite à côté des points (c'est ce qu'on lit).
 *
 * Placement au doigt (leçon de gen53 : une poignée Mafs a une zone tactile d'environ 60 px, deux
 * poignées voisines se chevauchaient) : UNE seule poignée à la fois, et un simple TOUCHER sur le
 * quadrillage place le point sur l'intersection la plus proche. Le fond garde le défilement natif
 * de la page (`touch-action: manipulation` : un glissement qui fait défiler n'est pas un toucher,
 * il est annulé par le navigateur — `pointercancel` — et ne place rien) ; seule la poignée
 * (`touch-action: none`) se fait glisser, de nœud en nœud. Clavier : flèches quand la figure a le
 * focus.
 *
 * Couleurs : jetons du thème (`var(--…)`), lisibles en clair comme en sombre.
 */

export type RolePoint = "donnee" | "c" | "image" | "attendu";

export interface PointFigurePlan {
  x: number;
  y: number;
  label: string;
  role: RolePoint;
}

export interface FlechePlan {
  de: PointEntier;
  vers: PointEntier;
}

interface Props {
  points: PointFigurePlan[];
  fleches?: FlechePlan[];
  /** Point de l'élève (poignée), `null` tant qu'il n'a rien placé. */
  poignee?: PointEntier | null;
  etiquettePoignee?: string;
  /** Présent : la figure est une surface de placement. */
  onPlacer?: (p: PointEntier) => void;
  legende: string;
}

const BORNE = 5;
const COTE = 340;
const MARGE = 22;
const UNITE = (COTE - 2 * MARGE) / (2 * BORNE);
const SEUIL_TOUCHER_PX = 12;

const COULEUR: Record<RolePoint | "poignee", string> = {
  donnee: "var(--sky, #2f6fb0)",
  c: "var(--plan, #5b4ea3)",
  image: "var(--good, #2f7a4f)",
  attendu: "var(--good, #2f7a4f)",
  poignee: "var(--accent, #b65c1f)",
};

const X = (x: number) => MARGE + (x + BORNE) * UNITE;
const Y = (y: number) => MARGE + (BORNE - y) * UNITE;

function borner(v: number): number {
  return Math.max(-BORNE, Math.min(BORNE, v));
}

/** Position de l'étiquette : à l'opposé de O (diagonale extérieure), dans le cadre. */
function positionEtiquette(p: { x: number; y: number }): {
  tx: number;
  ty: number;
  ancre: "start" | "end" | "middle";
} {
  const dx = p.x === 0 ? 1 : Math.sign(p.x);
  const dy = p.y === 0 ? 1 : Math.sign(p.y);
  let tx = X(p.x) + dx * 8;
  let ancre: "start" | "end" | "middle" = dx > 0 ? "start" : "end";
  if (p.x >= BORNE - 0.5) {
    tx = X(p.x) - 8;
    ancre = "end";
  }
  const ty = Y(p.y) + (dy > 0 ? -8 : 17);
  return { tx, ty, ancre };
}

export function PlanComplexeInteractif({ points, fleches = [], poignee = null, etiquettePoignee = "", onPlacer, legende }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const depart = useRef<{ id: number; x: number; y: number } | null>(null);
  const [glisse, setGlisse] = useState(false);
  const glisseRef = useRef(false);
  const interactif = onPlacer !== undefined;

  function noeudDepuisEcran(clientX: number, clientY: number): PointEntier | null {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const local = pt.matrixTransform(ctm.inverse());
    const x = borner(Math.round((local.x - MARGE) / UNITE - BORNE));
    const y = borner(Math.round(BORNE - (local.y - MARGE) / UNITE));
    return { x: x === 0 ? 0 : x, y: y === 0 ? 0 : y };
  }

  function placer(p: PointEntier | null) {
    if (!p || !onPlacer) return;
    if (poignee && poignee.x === p.x && poignee.y === p.y) return;
    onPlacer(p);
  }

  // --- Fond : un TOUCHER (sans glissement) place le point ---------------------------------------
  function fondDown(e: PointerEvent<SVGRectElement>) {
    depart.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }
  function fondUp(e: PointerEvent<SVGRectElement>) {
    const d = depart.current;
    depart.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > SEUIL_TOUCHER_PX) return;
    placer(noeudDepuisEcran(e.clientX, e.clientY));
  }

  // --- Poignée : glisser de nœud en nœud -----------------------------------------------------------
  // La poignée est un élément HTML posé SUR la figure : Chromium et Safari n'appliquent pas
  // `touch-action` aux éléments graphiques SVG (le navigateur reprenait le geste pour faire défiler
  // la page — `pointercancel` après deux déplacements, vérifié sur iPhone 13 émulé).
  function poigneeDown(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    glisseRef.current = true;
    setGlisse(true);
  }
  function poigneeMove(e: PointerEvent<HTMLDivElement>) {
    if (!glisseRef.current) return;
    placer(noeudDepuisEcran(e.clientX, e.clientY));
  }
  function poigneeUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    glisseRef.current = false;
    setGlisse(false);
    // La zone tactile de la poignée (44 px) déborde sur les nœuds voisins : un toucher sur un nœud
    // voisin y place donc le point, comme sur le fond.
    if (e.type === "pointerup") placer(noeudDepuisEcran(e.clientX, e.clientY));
  }

  function clavier(e: KeyboardEvent<SVGSVGElement>) {
    if (!interactif) return;
    const pas: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, 1],
      ArrowDown: [0, -1],
    };
    const d = pas[e.key];
    if (!d) return;
    e.preventDefault();
    const base = poignee ?? { x: 0, y: 0 };
    placer({ x: borner(base.x + d[0]), y: borner(base.y + d[1]) });
  }

  const etiquetteP = poignee ? positionEtiquette(poignee) : null;
  const graduations: number[] = [];
  for (let v = -BORNE + 1; v <= BORNE - 1; v++) if (v !== 0) graduations.push(v);
  const doux = "var(--ink-soft, #51626f)";
  const pale = "var(--ink-faint, #8a97a1)";
  const halo = {
    stroke: "var(--surface, #ffffff)",
    strokeWidth: 3,
    paintOrder: "stroke" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <figure className="plan-complexe-interactif" style={{ margin: "10px 0 6px", textAlign: "center" }}>
      <div style={{ position: "relative", maxWidth: COTE, margin: "0 auto" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${COTE} ${COTE}`}
          width="100%"
          style={{
            height: "auto",
            display: "block",
            touchAction: "manipulation",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
          role="img"
          aria-label={legende}
          tabIndex={interactif ? 0 : undefined}
          onKeyDown={clavier}
        >
          <defs>
            <marker id="pci-axe" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: doux }} />
            </marker>
            <marker id="pci-fleche" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" style={{ fill: COULEUR.image }} />
            </marker>
          </defs>
          {/* Fond (surface de toucher) */}
          <rect
            x={0}
            y={0}
            width={COTE}
            height={COTE}
            style={{
              fill: "transparent",
              cursor: interactif ? "crosshair" : "default",
            }}
            onPointerDown={interactif ? fondDown : undefined}
            onPointerUp={interactif ? fondUp : undefined}
            onPointerCancel={() => (depart.current = null)}
          />
          {/* Quadrillage d'une unité */}
          <g style={{ pointerEvents: "none" }}>
            {Array.from({ length: 2 * BORNE + 1 }, (_, i) => i - BORNE).map((v) => (
              <g key={`g${v}`}>
                <line
                  x1={X(v)}
                  y1={Y(-BORNE)}
                  x2={X(v)}
                  y2={Y(BORNE)}
                  style={{
                    stroke: pale,
                    strokeWidth: 0.6,
                    strokeOpacity: 0.55,
                  }}
                />
                <line
                  x1={X(-BORNE)}
                  y1={Y(v)}
                  x2={X(BORNE)}
                  y2={Y(v)}
                  style={{
                    stroke: pale,
                    strokeWidth: 0.6,
                    strokeOpacity: 0.55,
                  }}
                />
              </g>
            ))}
            {/* Axes fléchés */}
            <line x1={X(-BORNE)} y1={Y(0)} x2={X(BORNE) + 10} y2={Y(0)} style={{ stroke: doux, strokeWidth: 1.2 }} markerEnd="url(#pci-axe)" />
            <line x1={X(0)} y1={Y(-BORNE)} x2={X(0)} y2={Y(BORNE) - 10} style={{ stroke: doux, strokeWidth: 1.2 }} markerEnd="url(#pci-axe)" />
            <text x={X(BORNE) + 4} y={Y(0) + 15} style={{ fill: doux, fontSize: 11 }}>
              Re
            </text>
            <text x={X(0) + 6} y={Y(BORNE) - 4} style={{ fill: doux, fontSize: 11 }}>
              Im
            </text>
            {graduations.map((v) => (
              <g key={`t${v}`}>
                <line x1={X(v)} y1={Y(0) - 3} x2={X(v)} y2={Y(0) + 3} style={{ stroke: doux, strokeWidth: 1 }} />
                <text x={X(v)} y={Y(0) + 13} textAnchor="middle" style={{ fill: doux, fontSize: 9.5, ...halo }}>
                  {String(v).replace("-", "−")}
                </text>
                <line x1={X(0) - 3} y1={Y(v)} x2={X(0) + 3} y2={Y(v)} style={{ stroke: doux, strokeWidth: 1 }} />
                <text x={X(0) - 5} y={Y(v) + 3.5} textAnchor="end" style={{ fill: doux, fontSize: 9.5, ...halo }}>
                  {String(v).replace("-", "−")}
                </text>
              </g>
            ))}
            <text x={X(0) - 5} y={Y(0) + 13} textAnchor="end" style={{ fill: doux, fontSize: 10, ...halo }}>
              O
            </text>
            {fleches.map((f, i) => (
              <line
                key={`f${i}`}
                x1={X(f.de.x)}
                y1={Y(f.de.y)}
                x2={X(f.vers.x)}
                y2={Y(f.vers.y)}
                style={{
                  stroke: COULEUR.image,
                  strokeWidth: 1.3,
                  strokeDasharray: "4 3",
                }}
                markerEnd="url(#pci-fleche)"
              />
            ))}
            {points.map((p, i) => {
              const e = positionEtiquette(p);
              const couleur = COULEUR[p.role];
              return (
                <g key={`p${i}`}>
                  {p.role === "attendu" ? (
                    <circle
                      cx={X(p.x)}
                      cy={Y(p.y)}
                      r={7}
                      style={{
                        fill: "none",
                        stroke: couleur,
                        strokeWidth: 2.4,
                      }}
                    />
                  ) : (
                    <circle cx={X(p.x)} cy={Y(p.y)} r={4.5} style={{ fill: couleur }} />
                  )}
                  <text
                    x={e.tx}
                    y={e.ty}
                    textAnchor={e.ancre}
                    style={{
                      fill: couleur,
                      fontSize: 14,
                      fontWeight: 700,
                      fontStyle: "italic",
                      ...halo,
                    }}
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </g>
          {poignee && (
            <g>
              <circle
                cx={X(poignee.x)}
                cy={Y(poignee.y)}
                r={6}
                style={{
                  fill: COULEUR.poignee,
                  stroke: "var(--surface, #ffffff)",
                  strokeWidth: 1.5,
                  pointerEvents: "none",
                }}
              />
              {etiquettePoignee && etiquetteP && (
                <text
                  x={etiquetteP.tx}
                  y={etiquetteP.ty}
                  textAnchor={etiquetteP.ancre}
                  style={{
                    fill: COULEUR.poignee,
                    fontSize: 14,
                    fontWeight: 700,
                    fontStyle: "italic",
                    pointerEvents: "none",
                    ...halo,
                  }}
                >
                  {etiquettePoignee}
                </text>
              )}
              <circle
                cx={X(poignee.x)}
                cy={Y(poignee.y)}
                r={interactif ? 20 : 0}
                style={{
                  fill: COULEUR.poignee,
                  fillOpacity: glisse ? 0.2 : 0.09,
                  pointerEvents: "none",
                }}
              />
            </g>
          )}
        </svg>
        {interactif && poignee && (
          <div
            className="pci-poignee"
            data-x={poignee.x}
            data-y={poignee.y}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${(X(poignee.x) / COTE) * 100}%`,
              top: `${(Y(poignee.y) / COTE) * 100}%`,
              width: 44,
              height: 44,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              touchAction: "none",
              cursor: glisse ? "grabbing" : "grab",
            }}
            onPointerDown={poigneeDown}
            onPointerMove={poigneeMove}
            onPointerUp={poigneeUp}
            onPointerCancel={poigneeUp}
          />
        )}
      </div>
      <figcaption
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {legende}
      </figcaption>
    </figure>
  );
}
