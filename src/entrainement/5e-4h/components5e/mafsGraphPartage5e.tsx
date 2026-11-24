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

/** Écart (pixels écran) entre un axe et les nombres qui le graduent : les nombres sont posés À CÔTÉ
 * de l'axe (sous l'axe horizontal, à gauche de l'axe vertical), jamais dessus — l'axe barrait les
 * nombres (« 4—3—2—1 », « |−5 »). */
const ECART_AXE = 4;
/** Marge minimale (pixels) entre un nombre et le bord du cadre : un nombre qui ne tient pas n'est
 * pas écrit (il était rogné : « 4 » pour « −4 »). */
const MARGE_BORD = 1;
/** Espace minimal (pixels) entre deux nombres voisins d'un même axe ; en dessous, on n'en écrit
 * qu'un sur deux (puis un sur quatre…). */
const ESPACE_ENTRE_NOMBRES = 6;

/** « − » typographique (U+2212) pour les nombres négatifs. */
export function etiquetteGraduation5e(valeur: number): string {
  return formatEtiquetteGrille(valeur).replace(/^-/, "−");
}

interface BoiteTexte {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function seChevauchent(a: BoiteTexte, b: BoiteTexte): boolean {
  return a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
}

/** Taille de police réellement appliquée aux nombres (héritée de la page) — 16 px par défaut. */
function useTaillePolice(ref: RefObject<SVGGElement | null>): number {
  const [taille, setTaille] = useState(16);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof getComputedStyle === "undefined") return;
    const t = parseFloat(getComputedStyle(el).fontSize);
    if (Number.isFinite(t) && t > 0) setTaille((precedente) => (Math.abs(t - precedente) > 0.1 ? t : precedente));
  });
  return taille;
}

/** Pas d'écriture (1, 2, 4…) : on n'écrit qu'une graduation sur `k` pour que deux nombres voisins
 * gardent `ESPACE_ENTRE_NOMBRES` entre eux. */
function pasEcriture(ecart: number, encombrement: number): number {
  let k = 1;
  while (ecart > 0 && ecart * k < encombrement + ESPACE_ENTRE_NOMBRES && k < 64) k *= 2;
  return k;
}

/**
 * `prompt-audit-graduations-flottantes-mafs.md` — réimplémentée localement pour 5e, même raison/même
 * principe que `GrilleAdaptative5e` ci-dessus (jamais un import direct de
 * `components/mafsGraphPartage.tsx`) : la ligne de nombres suit l'axe tant qu'il est dans le cadre,
 * puis se fige au bord le plus proche (façon GeoGebra). Finitions (5e ch. 5, audit G17 ; partagé par
 * 5gen22, 5gen25, 5gen30, 5gen31) :
 * - nombres À CÔTÉ de l'axe : sous l'axe horizontal (au-dessus s'il touche le bas du cadre), à gauche
 *   de l'axe vertical (à droite s'il touche le bord gauche) — jamais barrés par lui ;
 * - « − » typographique ;
 * - un nombre sur deux (puis sur quatre…) quand deux voisins se toucheraient, mesuré en pixels avec
 *   la police réelle (chiffres à chasse fixe de Mafs : 0,6 em par caractère) ;
 * - jamais rognés : un nombre qui dépasserait du cadre n'est pas écrit, ni un nombre de l'axe
 *   vertical qui toucherait un nombre de l'axe horizontal près de l'origine ;
 * - 0 n'est jamais écrit (`graduationsDansPlage`), comme les étiquettes natives de Mafs.
 */
function GraduationsFlottantes5e({ largeur, hauteur, pasX, pasY }: { largeur: number; hauteur: number; pasX: number; pasY: number }) {
  const { viewTransform, userTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [origineX, origineY] = useOrigineLocaleSVG(groupRef);
  const police = useTaillePolice(groupRef);
  const matrice = vec.matrixMult(viewTransform, userTransform);

  const visibleX = domaineVisibleX(viewTransform, origineX, largeur);
  const visibleY = domaineVisibleY(viewTransform, origineY, hauteur);

  const [axeLocalX, axeLocalY] = vec.transform([0, 0], matrice);
  const ecranAxeX = axeLocalX - origineX;
  const ecranAxeY = axeLocalY - origineY;
  const largeurTexte = (s: string) => s.length * police * 0.6;
  const demiHaut = police * 0.5;

  // --- Axe horizontal : nombres sous l'axe (au-dessus s'il n'y a pas la place en bas du cadre).
  const ticksX = graduationsDansPlage(visibleX[0], visibleX[1], pasX).map((x) => ({ v: x, e: vec.transform([x, 0], matrice)[0] - origineX, s: etiquetteGraduation5e(x) }));
  const baseX = Math.min(Math.max(ecranAxeY, 0), hauteur);
  const dessous = baseX + ECART_AXE + police <= hauteur - MARGE_BORD;
  const yNombresX = dessous ? baseX + ECART_AXE + demiHaut : baseX - ECART_AXE - demiHaut;
  const ecartX = ticksX.length > 1 ? Math.abs(ticksX[1].e - ticksX[0].e) : Infinity;
  const kX = pasEcriture(ecartX, Math.max(0, ...ticksX.map((t) => largeurTexte(t.s))));
  const nombresX = ticksX
    .filter((t) => Math.round(t.v / pasX) % kX === 0)
    .map((t) => ({ ...t, boite: { x0: t.e - largeurTexte(t.s) / 2, x1: t.e + largeurTexte(t.s) / 2, y0: yNombresX - demiHaut, y1: yNombresX + demiHaut } }))
    .filter((t) => t.boite.x0 >= MARGE_BORD && t.boite.x1 <= largeur - MARGE_BORD);

  // --- Axe vertical : nombres à gauche de l'axe (à droite s'il n'y a pas la place à gauche).
  const ticksY = graduationsDansPlage(visibleY[0], visibleY[1], pasY).map((y) => ({ v: y, e: vec.transform([0, y], matrice)[1] - origineY, s: etiquetteGraduation5e(y) }));
  const baseY = Math.min(Math.max(ecranAxeX, 0), largeur);
  const largeurMaxY = Math.max(0, ...ticksY.map((t) => largeurTexte(t.s)));
  const aGauche = baseY - ECART_AXE - largeurMaxY >= MARGE_BORD;
  const xNombresY = aGauche ? baseY - ECART_AXE : baseY + ECART_AXE;
  const ecartY = ticksY.length > 1 ? Math.abs(ticksY[1].e - ticksY[0].e) : Infinity;
  const kY = pasEcriture(ecartY, police);
  const nombresY = ticksY
    .filter((t) => Math.round(t.v / pasY) % kY === 0)
    .map((t) => {
      const w = largeurTexte(t.s);
      const x0 = aGauche ? xNombresY - w : xNombresY;
      return { ...t, boite: { x0, x1: x0 + w, y0: t.e - demiHaut, y1: t.e + demiHaut } };
    })
    .filter((t) => t.boite.y0 >= MARGE_BORD && t.boite.y1 <= hauteur - MARGE_BORD && !nombresX.some((n) => seChevauchent(n.boite, t.boite)));

  return (
    <g ref={groupRef} className="mafs-shadow graduations-5e">
      {nombresX.map((t) => (
        <text key={`x${t.v}`} x={t.e + origineX} y={yNombresX + origineY} textAnchor="middle" dominantBaseline="central" style={{ fill: "var(--mafs-origin-color)" }}>
          {t.s}
        </text>
      ))}
      {nombresY.map((t) => (
        <text key={`y${t.v}`} x={xNombresY + origineX} y={t.e + origineY} textAnchor={aGauche ? "end" : "start"} dominantBaseline="central" style={{ fill: "var(--mafs-origin-color)" }}>
          {t.s}
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
