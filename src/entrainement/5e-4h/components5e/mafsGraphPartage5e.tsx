import type { ReactNode, RefObject } from "react";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { Coordinates, useTransformContext, vec } from "mafs";
import {
  borneDomaineVisible,
  calculerPasGrille,
  domaineVisibleX,
  domaineVisibleY,
  formatEtiquetteGrille,
  graduationsDansPlage,
  positionEcranClampee,
} from "../ui/mafsTransformation";

/**
 * Grille adaptative, réimplémentée localement pour 5e (5gen22) — jamais un import direct de
 * `components/mafsGraphPartage.tsx` (4e), convention déjà suivie par `SinusoideGraph.tsx` (5gen9) :
 * "4e et 5e gardent des fichiers de présentation indépendants", seuls les utilitaires purs de bas
 * niveau (`ui/mafsTransformation.ts`) sont partagés. Logique identique à la version 4e (mêmes
 * `calculerPasGrille`/`formatEtiquetteGrille`), aucune adaptation nécessaire ici (axes en nombres
 * réels ordinaires, contrairement à `GrilleSinusoideAdaptative` qui graduait en fractions de π).
 *
 * `onPasChange?` (prop additive optionnelle, `prompt5gen25legendeechelleauditzoom.md`) — même
 * mécanisme EXACT que la version 4e (`GrilleAdaptative`, `components/mafsGraphPartage.tsx`) : notifie
 * le pas courant à chaque re-rendu où il a réellement changé (jamais à chaque rendu), via
 * `useLayoutEffect` pour éviter tout flash "légende absente" au premier rendu.
 * `onPasChangeRef` (toujours à jour via un second effet séparé) permet d'appeler la version la plus
 * récente du callback sans le lister comme dépendance du premier effet — qui, lui, ne dépend que de
 * `[pasX, pasY]`.
 */
export function GrilleAdaptative5e({
  largeur,
  hauteur,
  onPasChange,
}: {
  largeur: number;
  hauteur: number;
  onPasChange?: (pasX: number, pasY: number) => void;
}) {
  const { viewTransform } = useTransformContext();
  const xSpan = largeur / viewTransform[0];
  const ySpan = hauteur / Math.abs(viewTransform[4]);
  const pasX = calculerPasGrille(xSpan);
  const pasY = calculerPasGrille(ySpan);
  const onPasChangeRef = useRef(onPasChange);
  useLayoutEffect(() => {
    onPasChangeRef.current = onPasChange;
  });
  useLayoutEffect(() => {
    onPasChangeRef.current?.(pasX, pasY);
  }, [pasX, pasY]);
  return (
    <Fragment>
      <Coordinates.Cartesian xAxis={{ lines: pasX, axis: true, labels: undefined }} yAxis={{ lines: pasY, axis: true, labels: undefined }} />
      <GraduationsFlottantes5e largeur={largeur} hauteur={hauteur} pasX={pasX} pasY={pasY} />
    </Fragment>
  );
}

/** Marge (pixels écran) entre une ligne de graduations flottantes et le bord du cadre visible — même
 * valeur que la version 4e (`components/mafsGraphPartage.tsx`), voir `positionEcranClampee`
 * (`ui/mafsTransformation.ts`). */
const MARGE_GRADUATION_FLOTTANTE = 10;

/**
 * `prompt-audit-graduations-flottantes-mafs.md` — réimplémentée localement pour 5e, même raison/même
 * principe que `GrilleAdaptative5e` ci-dessus (jamais un import direct de
 * `components/mafsGraphPartage.tsx`) : voir la doc complète de `GraduationsFlottantes` (4e,
 * `components/mafsGraphPartage.tsx`) pour la mécanique exacte (pourquoi le clamp coïncide avec le
 * placement natif tant que l'axe reste dans le cadre, pourquoi `graduationsDansPlage` exclut déjà 0
 * sur les 2 axes comme `XLabels`/`YLabels` natifs de Mafs).
 */
function GraduationsFlottantes5e({ largeur, hauteur, pasX, pasY }: { largeur: number; hauteur: number; pasX: number; pasY: number }) {
  const { viewTransform, userTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [origineX, origineY] = useOrigineLocaleSVG(groupRef);
  const matrice = vec.matrixMult(viewTransform, userTransform);

  const visibleX = domaineVisibleX(viewTransform, origineX, largeur);
  const visibleY = domaineVisibleY(viewTransform, origineY, hauteur);

  const [axeLocalX, axeLocalY] = vec.transform([0, 0], matrice);
  const ecranAxeX = axeLocalX - origineX;
  const ecranAxeY = axeLocalY - origineY;
  const yNombresX = positionEcranClampee(ecranAxeY, hauteur, MARGE_GRADUATION_FLOTTANTE) + origineY;
  const xNombresY = positionEcranClampee(ecranAxeX, largeur, MARGE_GRADUATION_FLOTTANTE) + origineX;
  const ancrageNombresY = ecranAxeX > largeur - MARGE_GRADUATION_FLOTTANTE ? "end" : "start";

  const ticksX = graduationsDansPlage(visibleX[0], visibleX[1], pasX);
  const ticksY = graduationsDansPlage(visibleY[0], visibleY[1], pasY);

  return (
    <g ref={groupRef} className="mafs-shadow">
      {ticksX.map((x) => (
        <text key={`x${x}`} x={vec.transform([x, 0], matrice)[0]} y={yNombresX} textAnchor="middle" dominantBaseline="central" style={{ fill: "var(--mafs-origin-color)" }}>
          {formatEtiquetteGrille(x)}
        </text>
      ))}
      {ticksY.map((y) => (
        <text key={`y${y}`} x={xNombresY} y={vec.transform([0, y], matrice)[1]} textAnchor={ancrageNombresY} dominantBaseline="central" style={{ fill: "var(--mafs-origin-color)" }}>
          {formatEtiquetteGrille(y)}
        </text>
      ))}
    </g>
  );
}

/**
 * `promptauditcourbesmafszoom.md` — réimplémentée localement pour 5e, même raison/même principe que
 * `GrilleAdaptative5e` ci-dessus (jamais un import direct de `components/mafsGraphPartage.tsx`) :
 * voir `useOrigineLocaleSVG`/`DomaineTraceX`/`FenetreVisibleXY` (4e, `components/mafsGraphPartage.tsx`)
 * pour la documentation complète du mécanisme — pourquoi `useTransformContext().viewTransform` seul
 * ne suffit pas (translation toujours nulle chez Mafs, le décalage de pan/zoom réel n'est lisible que
 * depuis l'attribut `viewBox` du SVG rendu, jamais exposé par le contexte React public).
 */
function useOrigineLocaleSVG(ref: RefObject<SVGGElement | null>): [number, number] {
  const [origine, setOrigine] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const svg = ref.current?.ownerSVGElement;
    if (!svg) return;
    const vb = svg.viewBox.baseVal;
    setOrigine((precedente) => (precedente[0] === vb.x && precedente[1] === vb.y ? precedente : [vb.x, vb.y]));
  });
  return origine;
}

/** Voir `DomaineTraceX` (4e) pour la documentation complète (render prop, `borne?` optionnelle
 * intersectée avec la fenêtre visible pour préserver les branches interrompues par une asymptote/
 * exclusion de domaine, `<g>` nécessaire pour poser la `ref` lue par `useOrigineLocaleSVG`). */
export function DomaineTraceX5e({
  largeur,
  borne,
  children,
}: {
  largeur: number;
  borne?: [number, number];
  children: (domaine: [number, number]) => ReactNode;
}) {
  const { viewTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [origineX] = useOrigineLocaleSVG(groupRef);
  return <g ref={groupRef}>{children(borneDomaineVisible(domaineVisibleX(viewTransform, origineX, largeur), borne))}</g>;
}

/** Voir `FenetreVisibleXY` (4e, `components/mafsGraphPartage.tsx`) pour la documentation complète —
 * fenêtre visible sur les DEUX axes à la fois (pour les appelants 5e qui recalculent eux-mêmes
 * plusieurs segments à partir d'elle, ex. `construireSegments`/`construireSegmentsDerivees`),
 * nécessaire au prolongement en y des branches adjacentes à une asymptote verticale
 * (`xBordVisibleY`, `ui/mafsTransformation.ts`). */
export function FenetreVisibleXY5e({
  largeur,
  hauteur,
  children,
}: {
  largeur: number;
  hauteur: number;
  children: (visibleX: [number, number], visibleY: [number, number]) => ReactNode;
}) {
  const { viewTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [origineX, origineY] = useOrigineLocaleSVG(groupRef);
  return (
    <g ref={groupRef}>
      {children(domaineVisibleX(viewTransform, origineX, largeur), domaineVisibleY(viewTransform, origineY, hauteur))}
    </g>
  );
}

export function DomaineTraceY5e({
  hauteur,
  borne,
  children,
}: {
  hauteur: number;
  borne?: [number, number];
  children: (domaine: [number, number]) => ReactNode;
}) {
  const { viewTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [, origineY] = useOrigineLocaleSVG(groupRef);
  return <g ref={groupRef}>{children(borneDomaineVisible(domaineVisibleY(viewTransform, origineY, hauteur), borne))}</g>;
}
