import { useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { HAUTEUR_GRILLE, LARGEUR_GRILLE, type Pt, type SceneFuite } from "../core/pointFuite.types";
import { dansCadre, distance, intersectionDroites, parametre } from "../generateurs/pointFuite/geometrieFuite";
import {
  HAUTEUR_FIGURE,
  LARGEUR_FIGURE,
  figurePointFuiteSvg,
  pixel,
  versModele,
  type LigneFigureFuite,
  type MarqueFigureFuite,
} from "../ui/figurePointFuite";

/**
 * Construction interactive de gen105 (« Perspective centrale : point de fuite ») : la figure (vitre
 * quadrillée) et trois outils de tracé, comme sur papier avec une règle et une équerre —
 * « Droite » (par deux points nommés, prolongée sur toute la figure), « Horizontale » et
 * « Verticale » (par un point nommé : les droites parallèles à la vitre restent horizontales ou
 * verticales sur le dessin) — puis « Placer » le point demandé.
 *
 * Placement au doigt (leçons de gen53 et 6gen95) : UNE seule poignée à la fois ; un TOUCHER sur la
 * figure place le point, la poignée (élément HTML `<div>` de 44 px posé sur la figure, car Chromium
 * et Safari ignorent `touch-action` sur les éléments SVG) se fait glisser. Le point s'aimante aux
 * intersections des droites dessinées (objets, ligne d'horizon, tracés de l'élève), sinon aux nœuds
 * du quadrillage tout proches. Le fond garde le défilement natif (`touch-action: manipulation` : un
 * glissement n'est pas un toucher). Clavier : flèches quand la figure a le focus (outil « Placer »).
 */

export type TraceFuite = { type: "droite"; a: string; b: string } | { type: "horizontale"; p: string } | { type: "verticale"; p: string };

export type OutilFuite = "droite" | "horizontale" | "verticale" | "placer";

interface Props {
  horizon: number;
  scene: SceneFuite;
  sceneEtiquettes: SceneFuite;
  /** Nom du point à placer ; `null` : figure seule (écran de choix, écran clos). */
  cible: string | null;
  poignee: Pt | null;
  onPoignee: (p: Pt) => void;
  traces: TraceFuite[];
  onTraces: (t: TraceFuite[]) => void;
  /** Après validation : droites de la correction et points (élève, attendu). */
  lignesCorrection?: LigneFigureFuite[];
  marques?: MarqueFigureFuite[];
}

const SEUIL_TOUCHER = 10;
const RAYON_POINT_PX = 26;
const AIMANT_INTERSECTION = 0.4;
const AIMANT_NOEUD = 0.18;

/** Droite d'un tracé, en coordonnées du quadrillage. */
export function ligneDuTrace(t: TraceFuite, scene: SceneFuite): { a: Pt; b: Pt } | null {
  const pos = (nom: string) => scene.points.find((p) => p.nom === nom)?.p ?? null;
  if (t.type === "droite") {
    const a = pos(t.a);
    const b = pos(t.b);
    return a && b && distance(a, b) > 1e-6 ? { a, b } : null;
  }
  const p = pos(t.p);
  if (!p) return null;
  return t.type === "horizontale" ? { a: p, b: { x: p.x + 1, y: p.y } } : { a: p, b: { x: p.x, y: p.y + 1 } };
}

function memeTrace(a: TraceFuite, b: TraceFuite): boolean {
  if (a.type !== b.type) return false;
  if (a.type === "droite" && b.type === "droite") return (a.a === b.a && a.b === b.b) || (a.a === b.b && a.b === b.a);
  return (a as { p: string }).p === (b as { p: string }).p;
}

interface LigneAimant {
  a: Pt;
  b: Pt;
  infinie: boolean;
}

function aimanter(p: Pt, lignes: LigneAimant[]): Pt {
  let meilleur: Pt | null = null;
  let d = AIMANT_INTERSECTION;
  for (let i = 0; i < lignes.length; i++) {
    for (let j = i + 1; j < lignes.length; j++) {
      const l1 = lignes[i]!;
      const l2 = lignes[j]!;
      const q = intersectionDroites(l1.a, l1.b, l2.a, l2.b);
      if (!q || !dansCadre(q)) continue;
      if (!l1.infinie) {
        const t = parametre(l1.a, l1.b, q);
        if (t < -0.02 || t > 1.02) continue;
      }
      if (!l2.infinie) {
        const t = parametre(l2.a, l2.b, q);
        if (t < -0.02 || t > 1.02) continue;
      }
      const dq = distance(p, q);
      if (dq < d) {
        d = dq;
        meilleur = q;
      }
    }
  }
  if (meilleur) return meilleur;
  const noeud = { x: Math.round(p.x), y: Math.round(p.y) };
  if (distance(noeud, p) < AIMANT_NOEUD) return noeud;
  return { x: Math.max(0, Math.min(LARGEUR_GRILLE, p.x)), y: Math.max(0, Math.min(HAUTEUR_GRILLE, p.y)) };
}

const AIDES_OUTILS: Record<OutilFuite, string> = {
  droite: "Touche deux points nommés : la droite qui les joint se trace sur toute la figure.",
  horizontale: "Touche un point nommé : l'horizontale qui passe par ce point se trace.",
  verticale: "Touche un point nommé : la verticale qui passe par ce point se trace.",
  placer: "Touche la figure pour placer le point, puis fais glisser la poignée pour l'ajuster : il s'aimante aux intersections des droites tracées.",
};

export function ConstructionPointFuite({ horizon, scene, sceneEtiquettes, cible, poignee, onPoignee, traces, onTraces, lignesCorrection = [], marques = [] }: Props) {
  const actif = cible !== null;
  const [outil, setOutil] = useState<OutilFuite>("droite");
  const [selection, setSelection] = useState<string[]>([]);
  const [glisse, setGlisse] = useState(false);
  const glisseRef = useRef(false);
  const depart = useRef<{ id: number; x: number; y: number } | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);

  const lignesTracees = useMemo(() => traces.map((t) => ligneDuTrace(t, scene)).filter((l): l is { a: Pt; b: Pt } => l !== null), [traces, scene]);
  const lignesAimant = useMemo<LigneAimant[]>(
    () => [
      ...scene.segments.map((s) => ({ a: s.a, b: s.b, infinie: false })),
      { a: { x: 0, y: horizon }, b: { x: 1, y: horizon }, infinie: true },
      ...lignesTracees.map((l) => ({ ...l, infinie: true })),
    ],
    [scene, horizon, lignesTracees],
  );

  const svg = figurePointFuiteSvg({
    mode: "ecran",
    horizon,
    scene,
    sceneEtiquettes,
    lignes: [...lignesTracees.map((l) => ({ ...l, ton: "eleve" as const })), ...lignesCorrection],
    marques: actif && poignee ? [{ p: poignee, nom: cible ?? "", ton: "eleve" }, ...marques] : marques,
    selection: actif ? selection : [],
  });

  function versPoint(clientX: number, clientY: number): Pt | null {
    const el = zoneRef.current?.querySelector("svg");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    return versModele({ x: ((clientX - r.left) * LARGEUR_FIGURE) / r.width, y: ((clientY - r.top) * HAUTEUR_FIGURE) / r.height });
  }

  function pointNommeProche(clientX: number, clientY: number): string | null {
    const el = zoneRef.current?.querySelector("svg");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const x = ((clientX - r.left) * LARGEUR_FIGURE) / r.width;
    const y = ((clientY - r.top) * HAUTEUR_FIGURE) / r.height;
    let meilleur: string | null = null;
    let d = RAYON_POINT_PX;
    for (const p of scene.points) {
      const q = pixel(p.p);
      const dq = Math.hypot(q.x - x, q.y - y);
      if (dq < d) {
        d = dq;
        meilleur = p.nom;
      }
    }
    return meilleur;
  }

  function ajouterTrace(t: TraceFuite) {
    if (traces.some((x) => memeTrace(x, t))) return;
    onTraces([...traces, t]);
  }

  function toucher(clientX: number, clientY: number) {
    if (!actif) return;
    if (outil === "placer") {
      const p = versPoint(clientX, clientY);
      if (p) onPoignee(aimanter(p, lignesAimant));
      return;
    }
    const nom = pointNommeProche(clientX, clientY);
    if (!nom) return;
    if (outil === "droite") {
      if (selection.length === 0) setSelection([nom]);
      else if (selection[0] === nom) setSelection([]);
      else {
        ajouterTrace({ type: "droite", a: selection[0]!, b: nom });
        setSelection([]);
      }
      return;
    }
    ajouterTrace({ type: outil, p: nom });
  }

  function fondDown(e: PointerEvent<HTMLDivElement>) {
    depart.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }
  function fondUp(e: PointerEvent<HTMLDivElement>) {
    const d = depart.current;
    depart.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > SEUIL_TOUCHER) return;
    toucher(e.clientX, e.clientY);
  }

  function poigneeDown(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    glisseRef.current = true;
    setGlisse(true);
  }
  function poigneeMove(e: PointerEvent<HTMLDivElement>) {
    if (!glisseRef.current) return;
    const p = versPoint(e.clientX, e.clientY);
    if (p) onPoignee(aimanter(p, lignesAimant));
  }
  function poigneeUp(e: PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    glisseRef.current = false;
    setGlisse(false);
  }

  function clavier(e: KeyboardEvent<HTMLDivElement>) {
    if (!actif || outil !== "placer") return;
    const pas: Record<string, [number, number]> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] };
    const d = pas[e.key];
    if (!d) return;
    e.preventDefault();
    const base = poignee ?? { x: LARGEUR_GRILLE / 2, y: HAUTEUR_GRILLE / 2 };
    onPoignee({ x: Math.max(0, Math.min(LARGEUR_GRILLE, base.x + d[0])), y: Math.max(0, Math.min(HAUTEUR_GRILLE, base.y + d[1])) });
  }

  function choisirOutil(o: OutilFuite) {
    setOutil(o);
    setSelection([]);
  }

  const outils: { id: OutilFuite; libelle: string }[] = [
    { id: "droite", libelle: "Droite" },
    { id: "horizontale", libelle: "Horizontale" },
    { id: "verticale", libelle: "Verticale" },
    { id: "placer", libelle: `Placer ${cible ?? ""}`.trim() },
  ];
  const posPoignee = poignee ? pixel(poignee) : null;

  return (
    <div>
      <div
        ref={zoneRef}
        className="construction-point-fuite"
        style={{ position: "relative", maxWidth: 460, margin: "8px auto 0", touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none", cursor: actif ? (outil === "placer" ? "crosshair" : "pointer") : "default" }}
        tabIndex={actif ? 0 : undefined}
        aria-label={actif ? `Figure : construis puis place le point ${cible}` : "Figure en perspective centrale"}
        onPointerDown={actif ? fondDown : undefined}
        onPointerUp={actif ? fondUp : undefined}
        onPointerCancel={() => (depart.current = null)}
        onKeyDown={clavier}
      >
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        {actif && posPoignee && (
          <div
            className="poignee-point-fuite"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: `${(posPoignee.x / LARGEUR_FIGURE) * 100}%`,
              top: `${(posPoignee.y / HAUTEUR_FIGURE) * 100}%`,
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
      {actif && (
        <div style={{ maxWidth: 460, margin: "8px auto 0" }}>
          <div role="group" aria-label="Outils de construction" style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {outils.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`btn${outil === o.id ? " toggle-active" : ""}`}
                aria-pressed={outil === o.id}
                style={{ minHeight: 44, padding: "6px 12px" }}
                onClick={() => choisirOutil(o.id)}
              >
                {o.libelle}
              </button>
            ))}
          </div>
          <p style={{ margin: "6px 0 0", fontSize: "0.9em", textAlign: "center" }}>
            {outil === "droite" && selection.length === 1 ? `Point ${selection[0]} choisi : touche le second point.` : AIDES_OUTILS[outil]}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 6 }}>
            <button type="button" className="btn" style={{ minHeight: 44, padding: "6px 12px" }} disabled={traces.length === 0} onClick={() => onTraces(traces.slice(0, -1))}>
              Annuler le dernier tracé
            </button>
            <button type="button" className="btn" style={{ minHeight: 44, padding: "6px 12px" }} disabled={traces.length === 0} onClick={() => onTraces([])}>
              Effacer les tracés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
