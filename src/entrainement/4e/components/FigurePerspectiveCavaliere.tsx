import { useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import type { CadreDessin, PointDessin } from "../core/perspectiveCavaliere.types";
import { depuisVue, versVue, vueFigure } from "../ui/figureCavaliere";

/**
 * Figure interactive de gen104 (« Dessiner en perspective cavalière ») : la figure SVG (chaîne de
 * `ui/formatCavaliere.ts`) insérée telle quelle, et deux façons d'agir dessus.
 *
 * - Placement d'un sommet (écrans 1 et 2) : UNE seule poignée à la fois (celle du point actif —
 *   jamais deux poignées voisines). Un simple TOUCHER sur le quadrillage y amène le point actif ; la
 *   poignée se fait ensuite GLISSER, en déplacement relatif : le point suit le mouvement du doigt
 *   sans être caché sous lui, ce qui permet de le poser au millimètre. Position libre (les sommets
 *   arrière ne tombent jamais sur un nœud) ; l'aimant est appliqué par l'appli. Clavier : flèches
 *   (1 mm, 5 mm avec Maj) quand la figure a le focus.
 * - Arêtes (écran 3) : un toucher bascule l'arête la plus proche (à moins de 24 unités du dessin).
 *
 * Gestionnaires sur des éléments HTML, jamais sur le SVG : Chromium et Safari n'appliquent pas
 * `touch-action` aux éléments graphiques SVG (convention des constructions interactives, 6gen95).
 * Le fond garde le défilement natif (`touch-action: manipulation` : un glissement qui fait défiler
 * n'est pas un toucher) ; seule la poignée (44 px, `touch-action: none`) se fait glisser.
 */

export interface AreteCible {
  cle: string;
  a: PointDessin;
  b: PointDessin;
}

interface Props {
  svg: string;
  cadre: CadreDessin;
  /** Placement : position AFFICHÉE du point actif (après aimant), `null` s'il n'est pas posé. */
  positionActive?: PointDessin | null;
  /** Placement : position BRUTE du point actif (départ d'un glissement). */
  positionBrute?: PointDessin | null;
  onDeplacer?: (p: PointDessin) => void;
  aretes?: AreteCible[];
  onBasculer?: (cle: string) => void;
  libelle: string;
}

const SEUIL_TOUCHER_PX = 12;
const RAYON_ARETE = 24;

function distanceSegment(p: PointDessin, a: PointDessin, b: PointDessin): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function FigurePerspectiveCavaliere({ svg, cadre, positionActive = null, positionBrute = null, onDeplacer, aretes = [], onBasculer, libelle }: Props) {
  const conteneur = useRef<HTMLDivElement | null>(null);
  const depart = useRef<{ id: number; x: number; y: number } | null>(null);
  const glisse = useRef<{ id: number; x: number; y: number; origine: PointDessin } | null>(null);
  const [glisseEnCours, setGlisseEnCours] = useState(false);
  const vue = vueFigure(cadre);
  const placement = onDeplacer !== undefined;
  const interactif = placement || (onBasculer !== undefined && aretes.length > 0);

  function rectSvg(): DOMRect | null {
    const r = conteneur.current?.querySelector("svg")?.getBoundingClientRect();
    return r && r.width > 0 && r.height > 0 ? r : null;
  }

  function borner(p: PointDessin): PointDessin {
    return { x: Math.max(cadre.xMin, Math.min(cadre.xMax, p.x)), y: Math.max(cadre.yMin, Math.min(cadre.yMax, p.y)) };
  }

  function versUnites(clientX: number, clientY: number): PointDessin | null {
    const r = rectSvg();
    if (!r) return null;
    return { x: ((clientX - r.left) * vue.largeur) / r.width, y: ((clientY - r.top) * vue.hauteur) / r.height };
  }

  // --- Fond : un TOUCHER (sans glissement) ---------------------------------------------------------
  function fondDown(ev: PointerEvent<HTMLDivElement>) {
    depart.current = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
  }
  function fondUp(ev: PointerEvent<HTMLDivElement>) {
    const d = depart.current;
    depart.current = null;
    if (!d || d.id !== ev.pointerId) return;
    if (Math.hypot(ev.clientX - d.x, ev.clientY - d.y) > SEUIL_TOUCHER_PX) return;
    const q = versUnites(ev.clientX, ev.clientY);
    if (!q) return;
    if (placement) {
      onDeplacer!(borner(depuisVue(vue, q)));
      return;
    }
    if (!onBasculer) return;
    let meilleure: string | null = null;
    let dist = RAYON_ARETE;
    for (const a of aretes) {
      const dd = distanceSegment(q, versVue(vue, a.a), versVue(vue, a.b));
      if (dd < dist) {
        dist = dd;
        meilleure = a.cle;
      }
    }
    if (meilleure) onBasculer(meilleure);
  }

  // --- Poignée : glissement relatif ------------------------------------------------------------------
  function poigneeDown(ev: PointerEvent<HTMLDivElement>) {
    ev.stopPropagation();
    if (!positionBrute) return;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    glisse.current = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, origine: positionBrute };
    setGlisseEnCours(true);
  }
  function poigneeMove(ev: PointerEvent<HTMLDivElement>) {
    const g = glisse.current;
    const r = rectSvg();
    if (!g || g.id !== ev.pointerId || !r || !onDeplacer) return;
    const dx = ((ev.clientX - g.x) / r.width) * ((cadre.xMax - cadre.xMin));
    const dy = -((ev.clientY - g.y) / r.height) * ((cadre.yMax - cadre.yMin));
    onDeplacer(borner({ x: g.origine.x + dx, y: g.origine.y + dy }));
  }
  function poigneeUp(ev: PointerEvent<HTMLDivElement>) {
    ev.stopPropagation();
    if (ev.currentTarget.hasPointerCapture(ev.pointerId)) ev.currentTarget.releasePointerCapture(ev.pointerId);
    glisse.current = null;
    setGlisseEnCours(false);
  }

  function clavier(ev: KeyboardEvent<HTMLDivElement>) {
    if (!placement || !positionBrute) return;
    const pas = ev.shiftKey ? 0.5 : 0.1;
    const d: Record<string, [number, number]> = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, pas], ArrowDown: [0, -pas] };
    const v = d[ev.key];
    if (!v) return;
    ev.preventDefault();
    onDeplacer!(borner({ x: positionBrute.x + v[0], y: positionBrute.y + v[1] }));
  }

  const poignee = placement && positionActive ? versVue(vue, positionActive) : null;

  return (
    <div style={{ position: "relative", maxWidth: 500, margin: "10px auto 4px" }}>
      <div
        ref={conteneur}
        className="figure-perspective-cavaliere"
        role="img"
        aria-label={libelle}
        tabIndex={placement ? 0 : undefined}
        onKeyDown={clavier}
        style={{ touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none", cursor: placement ? "crosshair" : interactif ? "pointer" : "default" }}
        onPointerDown={interactif ? fondDown : undefined}
        onPointerUp={interactif ? fondUp : undefined}
        onPointerCancel={() => (depart.current = null)}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {poignee && (
        <div
          className="cavaliere-poignee"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${(poignee.x / vue.largeur) * 100}%`,
            top: `${(poignee.y / vue.hauteur) * 100}%`,
            width: 44,
            height: 44,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            touchAction: "none",
            cursor: glisseEnCours ? "grabbing" : "grab",
          }}
          onPointerDown={poigneeDown}
          onPointerMove={poigneeMove}
          onPointerUp={poigneeUp}
          onPointerCancel={poigneeUp}
        />
      )}
    </div>
  );
}
