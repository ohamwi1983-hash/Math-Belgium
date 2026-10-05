import { useLayoutEffect, useRef, useState } from "react";
import { Coordinates, Line, Mafs, Plot, Text, usePaneContext, useTransformContext, vec } from "mafs";
import "mafs/core.css";
import type { ParametresSinusoideBase } from "../core5e/parametresSinusoide.types";
import type { PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import {
  attachEtiquetteY,
  etiquetteYVisible,
  evaluerY,
  formatRationnelPiTexte,
  pasAxeYRationnelPi,
  pointsAideActive,
  positionsTicksX,
  positionsTicksY,
  quartPeriode,
  segmentsAideActive,
  viewBoxX,
  viewBoxY,
} from "../ui5e/sinusoideGraph";
import { calculerPasAdaptatifRationnelPi } from "../ui5e/grilleSinusoide";
import { valeurNumerique, type RationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";
import { EPAISSEUR_TRAIT_ACCENTUE, RATIO_GRAPHE, formatEtiquetteGrille } from "../ui/mafsTransformation";
import { useLargeurConteneur } from "../components/useLargeurConteneur";

const LARGEUR_PAR_DEFAUT = 340;
const LARGEUR_MIN = 260;
const LARGEUR_MAX = 420;
const COULEUR_COURBE = "#1971c2";
/** Graduations X/Y dessinées à la main (`<Text>` ci-dessous, jamais de grille/axe dessinés à la
 * main — voir l'en-tête du composant) — même teinte que les étiquettes/axes NATIFS de
 * `Coordinates.Cartesian` ailleurs sur la plateforme (`--mafs-origin-color`, App.css, thème
 * clair/sombre) pour rester visuellement identiques aux graphes Mafs 4e. */
const COULEUR_GRADUATION = "var(--mafs-origin-color)";
/** Couleur de mise en évidence des points d'aide niveau 2 — orange `#f08c00`, jamais une couleur
 * neuve : c'est déjà la teinte conventionnelle de "l'aide niveau 2" ailleurs sur la plateforme (ex.
 * `.cercle-trig-point-cible`/`-rayon-cible`, App.css, générateur 17 "Angles associés" — voir son
 * commentaire "aide 2... orange"), et celle de la poignée interactive de "Paramètres de
 * transformation" (App.css, ligne ~1679). Jamais `COULEUR_COURBE` (bleu, déjà la courbe elle-même —
 * un point de la même couleur qu'elle s'y fondrait) ni une couleur de statut (vert/rouge, déjà
 * réservées à la validation d'une réponse par `.is-erronee`/`.recap-final-*`).
 */
const COULEUR_AIDE = "#f08c00";
/** Demi-taille (pixels, indépendante du zoom) des croix mises en évidence — même valeur que
 * `PointCroix` (`components/mafsGraphPartage.tsx`, 4e), convention déjà établie sur la plateforme
 * pour marquer un point clé sans ambiguïté avec un point plein ; jamais importée directement (4e et
 * 5e gardent des fichiers de présentation indépendants, `CLAUDE.md`) — répliquée ici. */
const DEMI_TAILLE_CROIX_AIDE = 6;

/** Croix (jamais un point plein, demande utilisateur) marquant un repère d'aide — dessinée À LA MAIN
 * en pixels via `useTransformContext`/`vec.transform`, même mécanique que `PointCroix`
 * (`components/mafsGraphPartage.tsx`, 4e) : Mafs n'offre pas de marqueur "croix" natif. */
function CroixAide({ x, y }: { x: number; y: number }) {
  const { viewTransform: pixelMatrix, userTransform } = useTransformContext();
  const [cx, cy] = vec.transform([x, y], vec.matrixMult(pixelMatrix, userTransform));
  return (
    <g style={{ stroke: COULEUR_AIDE, strokeWidth: 2 }}>
      <line x1={cx - DEMI_TAILLE_CROIX_AIDE} y1={cy - DEMI_TAILLE_CROIX_AIDE} x2={cx + DEMI_TAILLE_CROIX_AIDE} y2={cy + DEMI_TAILLE_CROIX_AIDE} />
      <line x1={cx - DEMI_TAILLE_CROIX_AIDE} y1={cy + DEMI_TAILLE_CROIX_AIDE} x2={cx + DEMI_TAILLE_CROIX_AIDE} y2={cy - DEMI_TAILLE_CROIX_AIDE} />
    </g>
  );
}

interface Props {
  exercice: ParametresSinusoideBase;
  /** Phase courante et niveau d'aide — optionnels (défaut : aucune mise en évidence) pour ne pas
   * casser d'appelant existant qui ne les fournirait pas. Indications visuelles UNIQUEMENT pour la
   * phase affichée (jamais de persistance entre écrans — décision explicite de l'utilisateur, voir
   * `pointsAideActive`/`segmentsAideActive`, `ui5e/sinusoideGraph.ts`) : sur `decalage`, un effet
   * visuel apparaît dès le niveau 1 ; sur `amplitude`, la droite médiane est TOUJOURS présente (par
   * défaut de cet écran, indépendant du niveau) ; les autres phases restent TEXTE SEUL avant le
   * niveau 2. */
  phase?: PhaseParametresSinusoideGraphique;
  niveauAide?: number;
}

interface EtatGrilleSinusoide {
  pasX: RationnelPi;
  pasY: RationnelPi;
  xPaneRange: [number, number];
  yPaneRange: [number, number];
}

/**
 * Grille/axes adaptatifs au zoom, en arithmétique EXACTE (`RationnelPi`, jamais un flottant) — le
 * pendant 5gen9 de `GrilleAdaptative` (`components/mafsGraphPartage.tsx`, réutilisée par 20+ autres
 * graphes Mafs), mais dont le pas décimal générique ne convient plus ici : voir le "Douzième bug"
 * dans l'en-tête du composant principal pour la justification complète de ce module dédié plutôt
 * qu'une extension supplémentaire de `GrilleAdaptative`. Rendu à l'intérieur de `<Mafs>` (seul
 * endroit où `useTransformContext`/`usePaneContext` sont disponibles) — `onEtatChange` notifie le
 * parent (hors du SVG) à chaque changement RÉEL de pas ou de pane visible, même mécanisme
 * `useLayoutEffect`+ref que `GrilleAdaptative` (voir son en-tête) pour éviter tout flash et toute
 * dépendance instable (les objets `RationnelPi` sont recréés à chaque rendu ; seule leur clé
 * primitive `numerateur/denominateur/degrePi` entre dans le tableau de dépendances).
 */
function GrilleSinusoideAdaptative({
  largeur,
  hauteur,
  uniteX,
  uniteY,
  onEtatChange,
}: {
  largeur: number;
  hauteur: number;
  uniteX: RationnelPi;
  uniteY: RationnelPi;
  onEtatChange: (etat: EtatGrilleSinusoide) => void;
}) {
  const { viewTransform } = useTransformContext();
  const { xPaneRange, yPaneRange } = usePaneContext();
  const xSpan = largeur / viewTransform[0];
  const ySpan = hauteur / Math.abs(viewTransform[4]);
  const pasX = calculerPasAdaptatifRationnelPi(xSpan, uniteX);
  const pasY = calculerPasAdaptatifRationnelPi(ySpan, uniteY);
  const [xPaneMin, xPaneMax] = xPaneRange;
  const [yPaneMin, yPaneMax] = yPaneRange;
  const onEtatChangeRef = useRef(onEtatChange);
  useLayoutEffect(() => {
    onEtatChangeRef.current = onEtatChange;
  });
  useLayoutEffect(() => {
    onEtatChangeRef.current({ pasX, pasY, xPaneRange: [xPaneMin, xPaneMax], yPaneRange: [yPaneMin, yPaneMax] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pasX.numerateur, pasX.denominateur, pasX.degrePi, pasY.numerateur, pasY.denominateur, pasY.degrePi, xPaneMin, xPaneMax, yPaneMin, yPaneMax]);
  return (
    <Coordinates.Cartesian
      xAxis={{ lines: valeurNumerique(pasX), axis: true, labels: undefined }}
      yAxis={{ lines: valeurNumerique(pasY), axis: true, labels: undefined }}
    />
  );
}

/** "1 unité" (singulier, exactement quand le pas vaut 1) ou "{fraction exacte} unités" (pluriel
 * sinon, y compris pour π, 1/3, 0,5... — jamais de décimale approchée, `formatRationnelPiTexte` est
 * exact par construction). Volontairement PAS le même comportement que `formatIndicateurPasGrille`
 * (`ui/indicateurPasGrille.ts`, utilisée par les graphes Mafs 4e) : celle-ci travaille sur un
 * flottant et ne peut donc traiter en exact qu'un seul cas spécial câblé en dur (1/3) — ici, la
 * valeur est déjà un `RationnelPi` exact, TOUTE fraction (π ou non) s'affiche donc correctement
 * sans liste de cas spéciaux. */
function formatUnitePas(pas: RationnelPi): string {
  const estUn = pas.degrePi === 0 && pas.numerateur === pas.denominateur;
  return `${formatRationnelPiTexte(pas)} ${estUn ? "unité" : "unités"}`;
}

/**
 * Graphe Mafs d'une fonction sinusoïdale (5gen9), ≥2 cycles complets, axe X gradué en QUART DE
 * PÉRIODE (`T/4`) avec des étiquettes en fraction de π ou en unités simples selon la forme de T
 * (voir `ui5e/sinusoideGraph.ts`).
 *
 * **Pan/zoom ACTIVÉS** (`pan zoom`) — `GrilleSinusoideAdaptative` (ci-dessus) suit nativement le
 * zoom (pas recalculé à chaque frame via `useTransformContext`, façon GeoGebra), et `Plot.OfX` sans
 * `domain` explicite (voir le "Onzième bug" ci-dessous) se limite nativement à `xPaneRange` — la
 * pane RÉELLEMENT visible, mise à jour à chaque pan/zoom. Grille et courbe restent donc synchronisées
 * à tout niveau de zoom/pan, sans readaptation manuelle nécessaire.
 *
 * AUCUN point plein aux extrémités du tracé — contrairement à `CourbeGraph.tsx` (5gen4, "point plein
 * = défini/continu jusque-là"), une convention qui a sa place quand le domaine réel de la fonction
 * EST borné (composition, restriction) mais qui, sur ce générateur, suggérait à tort qu'une fonction
 * sinusoïdale (définie sur ℝ tout entier) s'arrêtait à `xMin`/`xMax` — signalé par l'utilisateur
 * ("c'est une courbe continue de -inf jusqu'à +inf... retire les points extrémités qui la
 * limitent"), retiré du seul tracé de ce composant (`CourbeGraph.tsx`/5gen4 reste inchangé, son
 * domaine borné justifie toujours la convention). Seuls des points/segments RESTENT sur ce graphe :
 * ceux de mise en évidence des aides (`phase`/`niveauAide` ci-dessous), jamais aux extrémités.
 *
 * Second bug trouvé par vérification Playwright, corrigé : les étiquettes X en `attach="s"` (ancrées
 * à `yMin`) rendaient hors du cadre — en lisant le code de `<Text>` (`node_modules/mafs/build/index.js`),
 * `attach="s"` donne `dominantBaseline:"hanging"` (le texte PEND sous son point d'ancrage, donc SOUS
 * `yMin`, hors du viewBox) alors que `attach="n"` (`dominantBaseline:"baseline"`) le fait pousser
 * VERS LE HAUT depuis l'ancrage — corrigé en `attach="n"`, combiné à une marge du bas nettement plus
 * généreuse (`viewBoxY`, `ui5e/sinusoideGraph.ts`) pour laisser la place aux étiquettes sans jamais
 * chevaucher le creux de la courbe. Ce même `attach` bascule à `"s"` quand l'étiquette est ancrée
 * sur l'axe plutôt que sur le bord — voir le "Douzième bug" ci-dessous.
 *
 * Troisième bug (débordement HORIZONTAL, pas vertical) trouvé par la même vérification, corrigé en
 * DEUX passages : les 11 graduations (K_MIN=-1 à K_MAX=9, `ui5e/sinusoideGraph.ts`), bien
 * qu'équitablement espacées, sont trop rapprochées pour loger un texte de plusieurs caractères
 * ("9π/4"...) sans chevauchement, à la taille par défaut de `<Text>` (30). Un premier correctif
 * (`size={16}`, une étiquette sur deux) a suffi pour un T "large" mais restait encore chevauché
 * pour un T PETIT (peu d'unités de données par graduation, donc peu de pixels même en n'en gardant
 * qu'une sur deux) — corrigé plus largement en une étiquette sur TROIS (`index % 3 === 0`) avec une
 * police encore réduite (`size={14}`) — l'élève interpole depuis les étiquettes voisines pour les
 * graduations non numérotées (dont k=0, la position de φ).
 *
 * Quatrième bug (axe Y, symétrique du troisième), PREMIER correctif (aujourd'hui remplacé, voir le
 * "Cinquième bug" ci-dessous — conservé ici pour l'historique) : la marge du bas proportionnelle à
 * l'amplitude (`viewBoxY`, point précédent) peut étirer l'axe Y au point de rendre le pas le plus
 * fin (1 ou 0,5) illisible — des dizaines de graduations chevauchées pour une grande amplitude. Un
 * premier correctif (`pasAxeYAffiche`, aujourd'hui supprimé) tentait de grossir le pas de LIGNE
 * lui-même par un multiple entier garantissant que b/b+A/b-A restent chacun sur une graduation.
 *
 * **Cinquième bug** (le premier correctif ci-dessus s'est révélé NON FIABLE une fois re-vérifié par
 * un balayage exhaustif de l'espace de tirage réel, pas seulement quelques captures d'écran) :
 * `pasAxeYAffiche` ne trouvait un pas de ligne plus grossier que si un diviseur `k>1` du numérateur
 * de A divisait AUSSI `b` — une coïncidence arithmétique rare pour les amplitudes demi-entières
 * (numérateurs 3/5/7/9, presque tous premiers), mesurée jusqu'à 23,5 graduations empilées dans un
 * tracé d'à peine ~150-200px de haut sur ~34% des combinaisons réellement tirables (confirmé
 * d'abord visuellement par Playwright — plusieurs rechargements du générateur en mobile 390×844 ont
 * suffi à faire apparaître le cas, ex. A=5, b=5 : axe Y illisible, chiffres empilés les uns sur les
 * autres — PUIS quantifié par un script balayant systématiquement tout l'espace de tirage). Corrigé
 * dans `etiquetteYVisible` (`ui5e/sinusoideGraph.ts`, voir son en-tête pour le détail complet) en
 * séparant LIGNES (toujours au pas fin, jamais grossies — b/b+A/b-A y tombent TOUJOURS exactement,
 * sans calcul de diviseur : b est TOUJOURS entier, donc TOUJOURS un multiple de `pasAxeY`∈{1,0,5})
 * et ÉTIQUETTES (éclaircies indépendamment, même motif qu'au point précédent pour l'axe X — b, b+A
 * et b-A TOUJOURS étiquetés, le reste au mieux).
 *
 * **Sixième bug** (l'étendue Y réellement affichée par Mafs dépasse presque toujours `viewBoxY`,
 * `preserveAspectRatio="contain"` élargissant l'axe le plus étroit) et **Septième bug** (les
 * étiquettes Y NATIVES de `Coordinates.Cartesian` peuvent être TOTALEMENT invisibles — hors-cadre —
 * quand `xMin` (donnée) est loin de 0, fréquent sur ce générateur) : détail complet, chiffres et
 * méthode de vérification dans l'en-tête de `etiquetteYVisible`/`positionsTicksY`,
 * `ui5e/sinusoideGraph.ts` — ces fonctions gèrent en interne l'étirement réel (`ajusterAuRatio`),
 * jamais concernées par ce composant. Motif à l'origine de l'abandon complet des étiquettes Y
 * NATIVES au profit d'étiquettes dessinées À LA MAIN (`<Text>`, `size={12}`).
 *
 * **Huitième bug** (une valeur clé forcée, `b`/`b+A`/`b-A`, peut tomber à 1 seule graduation fine
 * d'une graduation périodique ELLE AUSSI étiquetée — les deux textes se chevauchent) et son **résidu**
 * (deux valeurs clés peuvent aussi se chevaucher ENTRE ELLES, la suppression périodique étant
 * impuissante puisqu'aucune des deux n'est un candidat périodique masquable) : détail complet, chiffres
 * et méthode de vérification (balayage exhaustif PUIS `getBoundingClientRect()` en direct) dans l'en-tête
 * de `etiquetteYVisible`/`attachEtiquetteY`, `ui5e/sinusoideGraph.ts`. `attach` n'est donc plus le
 * `"e"` (centré) littéral ci-dessous mais calculé PAR ÉTIQUETTE via `attachEtiquetteY` — `"e"` pour
 * une graduation isolée (comportement inchangé), `"ne"`/`"se"` pour écarter vers le haut/bas une
 * valeur clé dont une autre valeur clé voisine est trop proche ; `attachDistance={4}` (pixels, même
 * mécanisme que l'axe X) ajoute une marge supplémentaire à cet écartement.
 *
 * **Onzième bug** (trois défauts groupés signalés par capture d'écran, l'axe X étant à l'époque
 * dessiné à la main, `Line.Segment` + `Text`) : courbe visiblement tronquée (`Plot.OfX` bornait le
 * tracé à un `domain` NOMINAL au lieu de suivre `xPaneRange`, corrigé en retirant `domain`),
 * quadrillage non adaptatif au zoom (pas fixé à la génération), et axes NATIFS masqués par une
 * ligne de grille dessinée À LA MAIN par-dessus eux (collision d'ordre du DOM) quand un tick
 * φ+k·T/4 coïncidait avec x=0. Ce dernier point est la raison structurelle pour laquelle CE
 * composant ne dessine plus JAMAIS de `<Line.Segment>` de grille/axe à la main, seulement du
 * `<Text>` — voir `GrilleSinusoideAdaptative` ci-dessus, qui délègue l'intégralité du quadrillage/
 * des 2 axes à `Coordinates.Cartesian` natif.
 *
 * **Douzième bug** (5 points groupés, capture d'écran à l'appui, après le tour ayant introduit
 * `GrilleAdaptative`+`uniteX` — voir l'historique git pour ce tour intermédiaire, entièrement
 * remplacé ici) :
 * 1. Étiquettes de graduation PAS sur leur axe (Y à `x=xMin`, X à `y=yMin`, jamais à `x=0`/`y=0`) —
 *    corrigé : chaque étiquette s'ancre désormais sur son axe (`x=0` pour Y, `y=0` pour X) QUAND cet
 *    axe est dans la pane RÉELLEMENT visible (`GrilleSinusoideAdaptative.onEtatChange`, pan/zoom
 *    inclus) ; sinon repli sur le bord visible (`xMin`/`yMin`, comportement historique), pour ne
 *    jamais rendre une étiquette hors-cadre quand son axe est hors champ (Septième bug, toujours
 *    valable).
 * 2. et 3. Pas de grille en unités DÉCIMALES sans rapport avec l'unité naturelle de chaque axe (X en
 *    radians, Y en amplitude) : la tentative précédente (`GrilleAdaptative`+`uniteX`, flottant) ne
 *    pouvait produire qu'un pas approché, jamais une fraction exacte affichable sans bruit
 *    (`0.3333333333`). Remplacée ici par `calculerPasAdaptatifRationnelPi` (`ui5e/grilleSinusoide.ts`)
 *    — même algorithme (mantisses 1/2/5×10ⁿ, adaptatif au zoom), mais en arithmétique EXACTE sur
 *    l'unité atomique propre à CHAQUE axe : `T/4` (`quartPeriode`) pour X, `pasAxeYRationnelPi` pour
 *    Y — le pas reste ainsi TOUJOURS un multiple exact de π (ou de 1, quand T ne contient pas de π)
 *    pour X, et un multiple exact de `pasAxeY` (1 ou 1/2) pour Y, à tout niveau de zoom.
 * 4. Légende remplacée par le format `GrilleAdaptative` des générateurs 4e ("Horizontal : 1 carré =
 *    ... — Vertical : 1 carré = ...", voir `formatUnitePas` ci-dessus) au lieu de l'ancien texte
 *    statique "Pas horizontal : T/4 = ... — pas vertical : ...", mise à jour EN DIRECT à chaque
 *    changement de zoom (`GrilleSinusoideAdaptative.onEtatChange`) — "de nouvelles graduations
 *    apparaissent au zoom" (demande utilisateur) découle directement de l'adaptativité du pas
 *    (point 2/3 ci-dessus), aucun mécanisme séparé nécessaire.
 * 5. Valeurs à décimale infinie affichées en fraction EXACTE, jamais approchée — `formatUnitePas`
 *    passe TOUJOURS par `formatRationnelPiTexte` sur un `RationnelPi` construit exactement (jamais
 *    reconstruit depuis un flottant), contrairement à `formatIndicateurPasGrille`
 *    (`ui/indicateurPasGrille.ts`, 4e) qui ne peut traiter qu'un seul cas décimal spécial câblé en
 *    dur (1/3) faute de disposer de la fraction exacte à la source.
 *
 * **Résidu du point 1 ci-dessus**, trouvé en VÉRIFIANT ce même correctif par capture d'écran (jamais
 * supposé suffisant sans regarder) : ancrer les étiquettes Y sur l'axe (x=0) les amène tout près du
 * texte des étiquettes X (elles aussi ancrées sur y=0) chaque fois qu'une valeur clé Y (b/b±A) est
 * proche de 0 EN PIXELS — pas nécessairement en valeur absolue, le pas adaptatif pouvant être grand
 * (zoom arrière) ; observé avec un pas vertical adaptatif de 5 et une valeur clé à 1,5 (moins d'un
 * tiers de pas), rendue juste sous la ligne des étiquettes X. Corrigé par un seuil `seuilCollisionY`/
 * `seuilCollisionX` (0,4 pas de grille adaptatif) : toute étiquette dont la valeur est plus proche de
 * 0 que ce seuil retombe sur le bord (`xMin`/`yMin`), exactement comme si son axe n'était pas visible
 * — seule cette étiquette est déplacée, les autres restent sur l'axe.
 *
 * **Treizième bug** (`prompt-audit-graduations-flottantes-mafs.md`) : le repli "sur le bord" ci-dessus
 * ancrait sur `xMin`/`yMin` — les bornes NOMINALES du viewBox (fixées à la génération, `Props`/
 * `viewBoxX`/`viewBoxY`) — plutôt que sur le bord RÉELLEMENT visible une fois l'élève pan/zoomé
 * ailleurs. Sitôt l'axe hors cadre ET l'élève pan/zoomé loin de `xMin`/`yMin` (le scénario même de
 * l'audit : "zoomer pour lire un point oblige à s'éloigner de l'origine"), l'étiquette de repli se
 * retrouvait hors du cadre ACTUELLEMENT affiché — flottante sur un bord qui n'existe plus à l'écran,
 * pas sur le bord visible. Corrigé en repliant sur le bord du pane COURANT
 * (`etat.xPaneRange[0]`/`etat.yPaneRange[0]`, déjà lu en direct par `GrilleSinusoideAdaptative` et
 * réactif au pan/zoom) quand disponible, `xMin`/`yMin` restant le repli initial (avant le premier
 * rendu de `GrilleSinusoideAdaptative`, `etat` encore `null`) — simple substitution de la source de
 * vérité utilisée par ce repli déjà existant, jamais un second mécanisme parallèle.
 */
export function SinusoideGraph({ exercice, phase, niveauAide }: Props) {
  const [ref, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;
  const [xMin, xMax] = viewBoxX(exercice);
  const [yMin, yMax] = viewBoxY(exercice);
  const uniteX = quartPeriode(exercice);
  const uniteY = pasAxeYRationnelPi(exercice);
  const [etat, setEtat] = useState<EtatGrilleSinusoide | null>(null);
  const pointsAide = phase && niveauAide !== undefined ? pointsAideActive(exercice, phase, niveauAide) : [];
  const segmentsAide = phase && niveauAide !== undefined ? segmentsAideActive(exercice, phase, niveauAide) : [];

  const zeroXVisible = etat ? etat.xPaneRange[0] <= 0 && 0 <= etat.xPaneRange[1] : xMin <= 0 && 0 <= xMax;
  const zeroYVisible = etat ? etat.yPaneRange[0] <= 0 && 0 <= etat.yPaneRange[1] : yMin <= 0 && 0 <= yMax;
  // Neuvième point du "Douzième bug" (trouvé en vérifiant CE correctif, pas seulement supposé) :
  // ancrer les étiquettes Y sur l'axe (x=0) les rapproche du texte des étiquettes X (elles aussi
  // ancrées sur y=0) chaque fois qu'une valeur clé Y (b/b±A) est proche de 0 EN PIXELS — pas
  // forcément en valeur absolue, puisque le pas adaptatif peut être grand (zoom arrière). Une
  // étiquette Y à moins de 0,4 pas de grille de 0 retombe donc sur le bord (`xMin`) plutôt que sur
  // l'axe, exactement comme si l'axe n'était pas visible — seuil symétrique pour l'axe X (une
  // graduation φ+k·T/4 à moins de 0,4 pas de sa propre grille de x=0).
  const seuilCollisionY = etat ? valeurNumerique(etat.pasY) * 0.4 : 0;
  const seuilCollisionX = etat ? valeurNumerique(etat.pasX) * 0.4 : 0;

  return (
    <div ref={ref} className="mafs-graph">
      <Mafs width={largeur} height={hauteur} viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }} pan zoom>
        <GrilleSinusoideAdaptative largeur={largeur} hauteur={hauteur} uniteX={uniteX} uniteY={uniteY} onEtatChange={setEtat} />
        {positionsTicksX(exercice).map((tick, index) => {
          if (index % 3 !== 0) return null;
          const x = valeurNumerique(tick);
          const surAxe = zeroXVisible && Math.abs(x) >= seuilCollisionX;
          const yRepli = etat ? etat.yPaneRange[0] : yMin;
          return (
            <Text key={index} x={x} y={surAxe ? 0 : yRepli} attach={surAxe ? "s" : "n"} size={14} color={COULEUR_GRADUATION}>
              {formatRationnelPiTexte(tick)}
            </Text>
          );
        })}
        {positionsTicksY(exercice)
          .filter((v) => etiquetteYVisible(exercice, v))
          .map((v, index) => {
            const surAxe = zeroYVisible && Math.abs(v) >= seuilCollisionY;
            const xRepli = etat ? etat.xPaneRange[0] : xMin;
            return (
              <Text
                key={index}
                x={surAxe ? 0 : xRepli}
                y={v}
                attach={attachEtiquetteY(exercice, v)}
                attachDistance={4}
                size={12}
                color={COULEUR_GRADUATION}
              >
                {formatEtiquetteGrille(v)}
              </Text>
            );
          })}
        <Plot.OfX y={(x) => evaluerY(exercice, x)} color={COULEUR_COURBE} weight={EPAISSEUR_TRAIT_ACCENTUE} />
        {segmentsAide.map((s, i) =>
          s.kind === "droite" ? (
            <Line.PointSlope key={i} point={s.point} slope={s.pente} color={COULEUR_AIDE} style={s.style} />
          ) : (
            <Line.Segment key={i} point1={s.point1} point2={s.point2} color={COULEUR_AIDE} style={s.style} />
          ),
        )}
        {pointsAide.map((p, i) => (
          <CroixAide key={i} x={p.x} y={p.y} />
        ))}
      </Mafs>
      {etat && (
        <p className="mafs-graph-pas">
          Horizontal : 1 carré = {formatUnitePas(etat.pasX)} — Vertical : 1 carré = {formatUnitePas(etat.pasY)}
        </p>
      )}
    </div>
  );
}
