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
 * Grille dont le pas suit le niveau de zoom en direct (correction 1 du prompt, façon GeoGebra) —
 * doit être rendue à l'intérieur de `<Mafs>` : `useTransformContext` expose `viewTransform`, une
 * matrice d'échelle qui reflète le zoom/pan COURANT (pas seulement le viewBox initial), puisque
 * Mafs la recalcule à chaque geste de l'utilisateur. `viewTransform` est construite via
 * `vec.matrixBuilder().scale(scaleX, scaleY)`, mais `matrixCreate(a,b,c,d,tx,ty)` (mafs/build,
 * `vec` namespace) **repacke** ses paramètres dans l'ordre `[a,c,tx,b,d,ty]` — pas l'ordre naïf
 * `[a,b,c,d,tx,ty]` : `scaleX` (= `a`) est donc bien à l'index 0, mais `scaleY` (= `d`) est à
 * l'INDEX 4, jamais l'index 3 (qui vaut toujours `b`=0 pour une matrice d'échelle pure). Piège
 * rencontré et corrigé : avec l'index 3, `viewTransform[3]` valait 0, donnant un `ySpan` infini et
 * un pas de grille invalide — la grille entière (axes X et Y) disparaissait dès qu'on zoomait,
 * confirmé empiriquement en navigateur avant correction (méthode "verify before fixing"). Partagée
 * entre `MafsGraphTransformation.tsx` ("Transformations graphiques"),
 * `MafsGraphFormeCanoniqueTransformations.tsx` ("Forme canonique et transformations") et
 * `MafsGraphFonctionsReference.tsx` ("Transformations graphiques — fonctions de référence").
 *
 * `onPasChange?` (prop additive optionnelle, `prompt-indicateur-pas-grille.md`) : notifie le pas
 * courant à chaque re-rendu où il a changé — `GrilleAdaptative` étant rendue À L'INTÉRIEUR de
 * `<Mafs>` (seul endroit où `useTransformContext` est disponible), c'est le seul moyen pour un
 * texte HTML affiché SOUS le graphe (donc hors du SVG, dans le composant parent) de connaître le
 * pas actuel sans dupliquer le calcul `xSpan`/`ySpan`/`calculerPasGrille` en dehors de `<Mafs>` (où
 * `viewTransform` — le zoom/pan courant — n'existe pas). `useLayoutEffect` plutôt que `useEffect`
 * pour notifier le parent avant la peinture du navigateur, évitant un flash "texte absent" au
 * premier rendu. L'effet de notification ne dépend que de `[pasX, pasY]` (jamais `onPasChange`
 * lui-même, recréé à chaque rendu du parent) : on ne veut renotifier que lorsque le pas RÉEL
 * change, jamais à chaque rendu — `onPasChangeRef` (toujours à jour via un second effet séparé,
 * sans dépendance) permet d'appeler la version la plus récente du callback sans avoir à la lister
 * comme dépendance du premier effet.
 *
 * `cibleNombreLignes?` (prop additive optionnelle, `promptgen36fixmafsechelle.md`) — répercutée
 * telle quelle sur `calculerPasGrille` (voir sa documentation) : absente/`undefined` pour les 3
 * consommateurs historiques (comportement bit pour bit inchangé), fournie uniquement par
 * `BoiteMoustachesGraph.tsx` pour éviter le chevauchement des étiquettes à grandes valeurs.
 *
 * `cibleNombreLignesY?` (prop additive optionnelle, `promptajustementmargeboitemoustaches.md`) —
 * cible DÉDIÉE à l'axe Y, indépendante de `cibleNombreLignes` (qui reste utilisé pour X) ; absente/
 * `undefined` retombe sur `cibleNombreLignes` (comportement historique bit pour bit inchangé pour
 * tout appelant qui l'omet). Introduite pour `BoiteMoustachesGraph.tsx` : son axe Y n'est jamais
 * qu'un séparateur de ligne (valeurs toujours petites, `-5`..`10` environ, jamais la magnitude
 * potentiellement grande — jusqu'à 6 chiffres — de l'axe X réel), donc jamais besoin de la cible
 * réduite qui protège X contre le chevauchement d'étiquettes larges — une cible Y fine et FIXE
 * (indépendante de la magnitude de X) reste toujours sûre. Doit rester synchronisée avec la MÊME
 * cible passée à `etendreViewBoxPourEtiquettes` (`ui/mafsTransformation.ts`) — sinon le pas
 * RÉELLEMENT rendu ici diverge de celui utilisé pour calculer la clairance, rouvrant le 7ᵉ piège
 * déjà documenté sur cette fonction partagée.
 *
 * `mantissesPersonnalisees?` (prop additive optionnelle, `promptcorrectioninstabiliteratioboite
 * moustaches.md`) — répercutée sur `calculerPasGrille` pour X SEULEMENT (jamais Y, qui garde
 * toujours les mantisses par défaut — même restriction, et même raison, que côté
 * `etendreViewBoxPourEtiquettes`, voir sa documentation) ; absente/`undefined` pour tout appelant
 * qui l'omet (comportement historique bit pour bit inchangé). Doit, comme
 * `cibleNombreLignes`/`cibleNombreLignesY`, rester synchronisée avec la même valeur passée à
 * `etendreViewBoxPourEtiquettes` — même risque de rouvrir le 7ᵉ piège sinon.
 *
 * `masquerEtiquettesY?` (prop additive optionnelle, `promptcorrectioninstabiliteratioboite
 * moustaches.md` suite — 14ᵉ piège, `ui/mafsTransformation.ts`) — masque UNIQUEMENT les étiquettes
 * NUMÉRIQUES de l'axe Y (jamais son quadrillage, qui reste affiché), indépendamment de
 * `masquerAxes` (qui masque les 2 axes ensemble, X compris). Absente/`false` par défaut,
 * comportement historique inchangé pour tout appelant qui l'omet. `true` uniquement pour
 * `BoiteMoustachesGraph.tsx` : son axe Y n'affiche jamais une vraie grandeur (juste un séparateur de
 * ligne, `yLigne`) — ses nombres n'ont donc aucun sens pour l'élève, et masquer cette rangée de
 * chiffres évite un signal visuel trompeur ("il y aurait quelque chose à lire ici"). Condition
 * PRÉALABLE à `etendreLargeurXPourEtiquettes` (`ui/mafsTransformation.ts`) : cette fonction ne
 * garantit plus aucune clairance de grille pour Y (elle verrouille Y par le seul ratio) — ne
 * JAMAIS l'utiliser avec un axe Y dont les étiquettes restent visibles, sous peine de rogner un
 * nombre au bord (piège d'origine, `promptcorrectionmafslabelsgen13.md`).
 */
export function GrilleAdaptative({
  largeur,
  hauteur,
  onPasChange,
  cibleNombreLignes,
  cibleNombreLignesY,
  mantissesPersonnalisees,
  masquerAxes,
  masquerEtiquettesY,
}: {
  largeur: number;
  hauteur: number;
  onPasChange?: (pasX: number, pasY: number) => void;
  cibleNombreLignes?: number;
  cibleNombreLignesY?: number;
  mantissesPersonnalisees?: number[];
  /**
   * Masque UNIQUEMENT les 2 lignes d'axe (x=0/y=0) et leurs étiquettes numériques — jamais le
   * quadrillage lui-même, qui reste toujours affiché (`Coordinates.Cartesian` distingue `lines`
   * — le quadrillage — de `axis`/`labels` — les 2 lignes d'axe centrales et leurs graduations,
   * voir `node_modules/mafs/build/index.js`). Absent/`false` par défaut, comportement historique
   * inchangé pour les 3 consommateurs existants. `true` uniquement pour "Applications physiques"
   * (`promptgen29corrections.md`) : un exercice qui raisonne en norme/angle, jamais en
   * coordonnées cartésiennes — les 2 axes et leurs nombres n'ont aucun sens à y afficher, mais le
   * quadrillage (et sa légende d'échelle, `onPasChange`) reste utile pour percevoir les
   * proportions relatives des longueurs.
   */
  masquerAxes?: boolean;
  masquerEtiquettesY?: boolean;
}) {
  const { viewTransform } = useTransformContext();
  const xSpan = largeur / viewTransform[0];
  const ySpan = hauteur / Math.abs(viewTransform[4]);
  const pasX = calculerPasGrille(xSpan, cibleNombreLignes, mantissesPersonnalisees);
  const pasY = calculerPasGrille(ySpan, cibleNombreLignesY ?? cibleNombreLignes);
  const onPasChangeRef = useRef(onPasChange);
  useLayoutEffect(() => {
    onPasChangeRef.current = onPasChange;
  });
  useLayoutEffect(() => {
    onPasChangeRef.current?.(pasX, pasY);
  }, [pasX, pasY]);
  return (
    <Fragment>
      <Coordinates.Cartesian xAxis={{ lines: pasX, axis: !masquerAxes, labels: undefined }} yAxis={{ lines: pasY, axis: !masquerAxes, labels: undefined }} />
      {!masquerAxes && <GraduationsFlottantes largeur={largeur} hauteur={hauteur} pasX={pasX} pasY={pasY} masquerEtiquettesY={masquerEtiquettesY} />}
    </Fragment>
  );
}

/** Marge (pixels écran) entre une ligne de graduations flottantes et le bord du cadre visible —
 * voir `positionEcranClampee`, `ui/mafsTransformation.ts`. */
const MARGE_GRADUATION_FLOTTANTE = 10;

/**
 * `prompt-audit-graduations-flottantes-mafs.md` : chiffres de graduation "flottants" façon GeoGebra
 * — remplace le placement natif des `labels` de `Coordinates.Cartesian` (désactivés dans
 * `GrilleAdaptative` ci-dessus, `labels: undefined` sur les 2 axes), qui ancrait les nombres
 * exclusivement SUR les 2 lignes d'axe (x=0/y=0) et les faisait donc disparaître dès que ces lignes
 * sortaient du cadre visible au zoom/pan (symptôme signalé : "zoomer loin de l'origine fait
 * disparaître toute valeur numérique"). Ici, la ligne de nombres reste "collée" au bord du cadre
 * visible : tant que l'axe réel reste dans le cadre (à `MARGE_GRADUATION_FLOTTANTE` près de chaque
 * bord), la position calculée coïncide avec lui — comportement historique inchangé, rien n'est
 * clampé — et dès qu'il en sort, elle se fige sur le bord le plus proche (haut/bas pour les nombres
 * X, gauche/droite pour les nombres Y). Voir `positionEcranClampee` (`ui/mafsTransformation.ts`)
 * pour la mécanique exacte de ce clamp.
 *
 * Doit être rendu à l'intérieur de `<Mafs>` (`useTransformContext`, même contrainte que
 * `GrilleAdaptative`) et englobe ses enfants dans un `<g>` (jamais un Fragment) pour poser la `ref`
 * que lit `useOrigineLocaleSVG` (décalage de pan/zoom courant, non exposé par le contexte React
 * public — voir sa doc complète juste en dessous) — même motif que `DomaineTraceX`/`FenetreVisibleXY`.
 *
 * Position pixel LOCALE (avant ajout de l'origine du viewBox courant, cf. `domaineVisibleAxe`) de
 * chaque graduation obtenue via `vec.transform` avec `viewTransform` SEUL (translation toujours
 * nulle — voir sa doc) : exactement la même formule que `XLabels`/`YLabels` (Mafs,
 * `node_modules/mafs/build/index.js`) pour la coordonnée qui varie (x pour une graduation X, y pour
 * une graduation Y), donc bit pour bit identique au placement natif historique sur cet axe-là.
 * Seule la coordonnée FIXE (l'autre) change : natif = une constante pixel locale (5, jamais
 * pan-consciente) ; ici = `positionEcranClampee` sur la position ÉCRAN (pan-consciente, calculée en
 * soustrayant l'origine du viewBox courant) de l'axe traversier, reconvertie en pixel local en
 * ajoutant cette même origine avant de l'assigner à l'attribut SVG.
 *
 * `graduationsDansPlage` (jamais `Coordinates.Cartesian` natif) exclut déjà la valeur 0 sur les
 * 2 axes (même filtre que `XLabels`/`YLabels`) : sans ce filtre, un "0" flottant apparaîtrait en
 * double (une fois par axe) chaque fois que l'origine est visible — jamais le comportement natif
 * historique, qui n'affiche jamais "0" nulle part.
 */
function GraduationsFlottantes({
  largeur,
  hauteur,
  pasX,
  pasY,
  masquerEtiquettesY,
}: {
  largeur: number;
  hauteur: number;
  pasX: number;
  pasY: number;
  /** Masque UNIQUEMENT les graduations flottantes de l'axe Y (jamais celles de l'axe X) — même
   * convention et même appelant que `masquerEtiquettesY` de `GrilleAdaptative` ci-dessus
   * (`BoiteMoustachesGraph.tsx` : axe Y jamais une vraie grandeur, juste un séparateur de ligne).
   * Absente/`false` par défaut, comportement inchangé pour tout autre appelant. */
  masquerEtiquettesY?: boolean;
}) {
  const { viewTransform, userTransform } = useTransformContext();
  const groupRef = useRef<SVGGElement>(null);
  const [origineX, origineY] = useOrigineLocaleSVG(groupRef);
  const matrice = vec.matrixMult(viewTransform, userTransform);

  const visibleX = domaineVisibleX(viewTransform, origineX, largeur);
  const visibleY = domaineVisibleY(viewTransform, origineY, hauteur);

  // Position ÉCRAN (pan-consciente) de l'axe traversier à chaque groupe de graduations — l'axe des y
  // (x=0) pour les nombres X, l'axe des x (y=0) pour les nombres Y.
  const [axeLocalX, axeLocalY] = vec.transform([0, 0], matrice);
  const ecranAxeX = axeLocalX - origineX;
  const ecranAxeY = axeLocalY - origineY;
  const yNombresX = positionEcranClampee(ecranAxeY, hauteur, MARGE_GRADUATION_FLOTTANTE) + origineY;
  const xNombresY = positionEcranClampee(ecranAxeX, largeur, MARGE_GRADUATION_FLOTTANTE) + origineX;
  const ancrageNombresY = ecranAxeX > largeur - MARGE_GRADUATION_FLOTTANTE ? "end" : "start";

  const ticksX = graduationsDansPlage(visibleX[0], visibleX[1], pasX);
  const ticksY = masquerEtiquettesY ? [] : graduationsDansPlage(visibleY[0], visibleY[1], pasY);

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
 * `promptauditcourbesmafszoom.md` : décalage de pan/zoom courant, en unités LOCALES du SVG Mafs —
 * lu depuis le DOM (`svg.viewBox.baseVal.x`/`.y`) plutôt que via `useTransformContext()`, qui
 * n'expose que l'ÉCHELLE (`viewTransform`, toujours de translation nulle — voir la doc de
 * `domaineVisibleX`/`domaineVisibleY`, `ui/mafsTransformation.ts`, pour la justification complète de
 * ce détour par le DOM). `ref` posée sur un `<g>` vide englobant les enfants réels (`DomaineTraceX`/
 * `FenetreVisibleX` ci-dessous) — `ref.current.ownerSVGElement` retrouve le `<svg>` Mafs ancêtre.
 * `useLayoutEffect` SANS tableau de dépendances (s'exécute après CHAQUE rendu, jamais seulement au
 * montage) : l'attribut `viewBox` change à chaque pan/zoom (recalculé par Mafs depuis son état
 * caméra interne), donc relire le DOM une seule fois au montage figerait le décalage au premier
 * rendu — `setOrigine` ne déclenche un re-rendu que si la valeur a RÉELLEMENT changé (comparaison
 * avant écriture), pour ne jamais boucler indéfiniment. Toujours exécuté AVANT la peinture du
 * navigateur (`useLayoutEffect`, jamais `useEffect`) : le tout premier rendu utilise l'origine par
 * défaut `[0,0]` (légèrement incorrecte), mais l'effet la corrige de façon synchrone avant que quoi
 * que ce soit ne s'affiche réellement à l'écran — jamais de flash visible.
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

/**
 * `promptauditcourbesmafszoom.md` : rend `domaine` (une plage `[min,max]`, réactive au zoom/pan
 * courant via `domaineVisibleX`/`borneDomaineVisible`, `ui/mafsTransformation.ts`) accessible à un
 * `Plot.OfX` — doit être rendu à l'intérieur de `<Mafs>`, seul endroit où `useTransformContext` est
 * disponible, même contrainte que `GrilleAdaptative` ci-dessus. Motif "render prop" (`children` en
 * fonction) plutôt qu'un composant `Plot` figé : les appelants passent des props `Plot.OfX`/`Plot.OfY`
 * très hétérogènes selon le générateur (couleur, épaisseur, style pointillé...) — dupliquer chacune
 * de ces variantes en props explicites serait plus rigide que de laisser l'appelant construire son
 * propre `<Plot.OfX>`/`<Plot.OfY>` avec la plage déjà calculée. Enfants rendus dans un `<g>` (jamais
 * un Fragment) — nécessaire pour poser la `ref` que lit `useOrigineLocaleSVG` ci-dessus ; un `<g>`
 * supplémentaire est un no-op visuel/géométrique en SVG (déjà le motif utilisé ailleurs sur la
 * plateforme, ex. `MafsGraphFormeCanoniqueTransformations.tsx`).
 *
 * `borne?` : restriction mathématique RÉELLE (exclusion de domaine, asymptote verticale) déjà connue
 * à la génération — intersectée avec la fenêtre visible plutôt que remplacée, pour qu'une branche
 * interrompue par une telle restriction reste bornée à sa valeur exacte même en dézoomant (pas de
 * régression). Omise pour une portion sans restriction : suit alors intégralement la fenêtre visible.
 */
export function DomaineTraceX({
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

/**
 * `promptauditcourbesmafszoomy.md` : fenêtre visible courante sur LES DEUX axes à la fois (`x` ET
 * `y`, réactifs au zoom/pan) — pour les appelants qui doivent recalculer eux-mêmes plusieurs
 * segments à partir d'elle (familles/branches multiples, ex. `calculerSegmentsVisibles`,
 * `mafsFonctionsReference.ts`) tout en faisant suivre une branche adjacente à une asymptote
 * verticale jusqu'au bord VERTICAL du cadre (via `xBordVisibleY`, `ui/mafsTransformation.ts`, qui a
 * besoin de la fenêtre y visible pour savoir où arrêter la branche) — voir `DomaineTraceX` ci-dessus
 * pour le cas plus simple d'un unique `Plot.OfX`. Une seule lecture DOM (`useOrigineLocaleSVG`)
 * suffit pour les deux axes — l'attribut `viewBox` du SVG encode toujours `x` ET `y` ensemble.
 */
export function FenetreVisibleXY({
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

/** Même principe que `DomaineTraceX` ci-dessus, pour un `Plot.OfY` (courbe exprimée en x=f(y)). */
export function DomaineTraceY({
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

const DEMI_TAILLE_CROIX = 6;

/**
 * Marqueur "croix" (×) — extrait de `MafsGraphFonctionsReference.tsx`
 * (`prompt-report-fonctionnalites-generateur-x2.md`, reprise sur `MafsGraphTransformation.tsx`)
 * pour être partagé entre les deux graphes plutôt que dupliqué, même principe que
 * `GrilleAdaptative` ci-dessus. Pas de composant Mafs natif pour ce style (contrairement à
 * `Point`, cercle uniquement) : réplique directement son mécanisme interne
 * (`useTransformContext`/`vec.transform`/`vec.matrixMult`, tous exportés publiquement par le
 * package `mafs`) pour convertir les coordonnées data en pixels, puis dessine deux segments
 * `<line>` en ESPACE PIXEL (une taille de croix fixe à l'écran, indépendante du zoom — même
 * principe que le rayon fixe du cercle de `Point`).
 */
export function PointCroix({ x, y, color }: { x: number; y: number; color: string }) {
  const { viewTransform: pixelMatrix, userTransform } = useTransformContext();
  const [cx, cy] = vec.transform([x, y], vec.matrixMult(pixelMatrix, userTransform));
  return (
    <g style={{ stroke: color, strokeWidth: 2 }}>
      <line x1={cx - DEMI_TAILLE_CROIX} y1={cy - DEMI_TAILLE_CROIX} x2={cx + DEMI_TAILLE_CROIX} y2={cy + DEMI_TAILLE_CROIX} />
      <line x1={cx - DEMI_TAILLE_CROIX} y1={cy + DEMI_TAILLE_CROIX} x2={cx + DEMI_TAILLE_CROIX} y2={cy - DEMI_TAILLE_CROIX} />
    </g>
  );
}

/**
 * Grille dessinée À LA MAIN, jamais `Coordinates.Cartesian` — introduite pour "Construction
 * graphique de la parabole" (`promptgen53remplacement.md`), premier générateur de la plateforme
 * dont la grille doit être ALIGNÉE À UNE DIRECTION OBLIQUE plutôt qu'horizontale/verticale. Voir
 * l'en-tête de `ui/grilleTourneeGraph.ts` pour la justification technique complète (pourquoi
 * `Coordinates.Cartesian`/`GrilleAdaptative` ne peut PAS être fait pivoter via
 * `<Transform rotate={θ}>`, contrairement au reste des primitives Mafs).
 *
 * Ce composant lui-même ne connaît PAS l'angle de rotation — il dessine simplement des lignes
 * horizontales/verticales à espacement entier dans le repère LOCAL courant (`useTransformContext`),
 * exactement comme `PointCroix` ci-dessus convertit un point local en pixels. Rendu à l'intérieur
 * d'un `<Transform rotate={θ}>`, ces lignes apparaissent obliques à l'écran — Mafs compose la
 * rotation pour nous, aucune trigonométrie ici. Rendu SANS `<Transform>` englobant, ce serait une
 * grille entière ordinaire, tout aussi valable (le composant est agnostique de la rotation).
 *
 * Corollaire gratuit de ne jamais passer par `Coordinates.Cartesian` : AUCUNE graduation ni label
 * numérique n'est jamais dessiné — la contrainte "aucune coordonnée chiffrée visible" de ce
 * générateur est donc satisfaite par construction, pas par la suppression d'une option existante.
 *
 * `pas` fixe (jamais adaptatif comme `GrilleAdaptative`) : sans étiquette numérique à garder
 * "ronde", l'adaptativité au zoom n'a plus d'objet — le pas DOIT rester la même unité que le
 * cranté du glisser-déposer (`constrain`), sans quoi la grille visuelle et la précision de snap
 * divergeraient.
 */
export function GrilleTournee({ demiPortee, pas = 1 }: { demiPortee: number; pas?: number }) {
  const { viewTransform: pixelMatrix, userTransform } = useTransformContext();
  const matrice = vec.matrixMult(pixelMatrix, userTransform);
  const nombreLignes = Math.ceil(demiPortee / pas);
  const lignes = [];
  for (let k = -nombreLignes; k <= nombreLignes; k++) {
    const [x1, y1] = vec.transform([k * pas, -demiPortee], matrice);
    const [x2, y2] = vec.transform([k * pas, demiPortee], matrice);
    lignes.push(<line key={`v${k}`} x1={x1} y1={y1} x2={x2} y2={y2} />);
    const [x3, y3] = vec.transform([-demiPortee, k * pas], matrice);
    const [x4, y4] = vec.transform([demiPortee, k * pas], matrice);
    lignes.push(<line key={`h${k}`} x1={x3} y1={y3} x2={x4} y2={y4} />);
  }
  return <g style={{ stroke: "var(--mafs-line-color)", strokeWidth: 1, opacity: 0.5 }}>{lignes}</g>;
}
