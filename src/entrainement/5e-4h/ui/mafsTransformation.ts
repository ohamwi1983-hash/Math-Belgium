import type { ExerciceTransformationGraphique, ReponseCurseurs } from "../core/transformationsGraphiques.types";
import { calculerA } from "../moteur/verificationTransformationsGraphiques";

/** {p,q,a} générique — la même forme sert à la fois pour la courbe cible (fixe) et pour la courbe
 * manipulable en direct par les curseurs (bouton "Aide"). */
export interface ParametresCourbe {
  p: number;
  q: number;
  a: number;
}

/** y = a(x-p)²+q. */
export function evaluerCourbe(params: ParametresCourbe, x: number): number {
  return params.a * (x - params.p) * (x - params.p) + params.q;
}

export interface PointCourbe {
  x: number;
  y: number;
}

/**
 * Second point marqué sur le graphe, où l'argument de x² vaut exactement 1 — par opposition au
 * sommet (x=p), où il vaut 0 (`prompt-report-fonctionnalites-generateur-x2.md`, reprise du même
 * principe déjà en place pour "Transformations graphiques — fonctions de référence"
 * (`pointUnitaire`, `verificationFonctionsReference.ts`), adaptée aux paramètres de CE générateur
 * plus simple : pas de `EH`/`CH`/`SOY` ici, seulement `{p,q,a}` déjà entièrement générique
 * (`a` encode déjà `SOX·(EV/CV)`, voir `calculerA`) — la formule s'y simplifie donc à
 * `x = p+1`, `y = a·1²+q = a+q`, sans jamais avoir besoin de EV/CV/SOX séparément. `y` calculé via
 * `evaluerCourbe` (jamais une formule fermée dupliquée indépendamment) pour rester dérivé du même
 * évaluateur que la courbe elle-même — garantit que le point marqué tombe exactement sur le pixel
 * de la courbe tracée, même principe de prudence que pour le sommet.
 */
export function pointUnitaire(params: ParametresCourbe): PointCourbe {
  const x = params.p + 1;
  return { x, y: evaluerCourbe(params, x) };
}

export function parametresDepuisExercice(exercice: ExerciceTransformationGraphique): ParametresCourbe {
  return { p: exercice.p, q: exercice.q, a: calculerA(exercice) };
}

export function parametresDepuisCurseurs(curseurs: ReponseCurseurs): ParametresCourbe {
  return { p: curseurs.th, q: curseurs.tv, a: calculerA(curseurs) };
}

/** Demi-largeur du domaine tracé pour chaque courbe — un domaine fixe centré sur son propre
 * sommet, indépendant de la largeur totale du viewBox : sans ça, une courbe très décalée en x
 * forcerait un viewBox si large que l'autre courbe s'écraserait à l'échelle. Sert aussi de valeur
 * de référence (a=1) pour `demiLargeurCadrage` ci-dessous, et de plancher pour le domaine réellement
 * tracé (`Plot.OfX`, voir `MafsGraphTransformation.tsx`). */
export const DEMI_LARGEUR_COURBE = 4;

const EXPOSANT_CADRAGE = 0.6;

/**
 * prompt-zoom-et-cadrage.md : demi-largeur du domaine utilisé pour CADRER (viewBox initial) une
 * courbe donnée — contrairement à `DEMI_LARGEUR_COURBE` (fixe, domaine de TRACÉ réel du
 * `Plot.OfX`, inchangé), cette demi-largeur dépend de `|a|`. Avec une demi-largeur fixe, une
 * parabole "resserrée" (|a| élevé) produit un viewBox démesuré : à |a|=5 sur l'ancien domaine fixe
 * [-4,4], la courbe grimpe déjà à 80 en bord de domaine, et l'ajustement du ratio d'aspect
 * (`ajusterAuRatio`) élargit alors l'axe X en proportion pour compenser cette hauteur immense —
 * jusqu'à un viewBox de ~149 unités de large, où la courbe n'occupe plus qu'un filet quasi
 * invisible. Réduire la demi-largeur de cadrage pour les |a| élevés (et l'élargir pour les |a|
 * faibles, qui ont au contraire besoin de plus de recul horizontal pour que leur courbure reste
 * perceptible) empêche cette hauteur de s'emballer, donc empêche ce réélargissement démesuré en X.
 * `EXPOSANT_CADRAGE` (0,6, empiriquement choisi et confirmé par capture d'écran — voir
 * prompt-zoom-et-cadrage.md) : l'exposant 0,5 (`1/sqrt(|a|)`) fige la hauteur du cadrage à une
 * CONSTANTE quel que soit |a| (la démonstration algébrique est directe : `a·(K/sqrt(a))² = K²`) —
 * une fois le ratio d'aspect réappliqué (`ajusterAuRatio`), le viewBox final se retrouve alors
 * identique pour toute valeur de |a|, ce qui n'a plus rien d'adaptatif ; un exposant strictement
 * supérieur à 0,5 est nécessaire pour que le viewBox final rétrécisse réellement pour les |a|
 * élevés et s'élargisse réellement pour les |a| faibles (confirmé par calcul direct des largeurs
 * finales pour plusieurs exposants). 0,6 donne, sur la plage réellement générée (|a| de 1/5 à 5),
 * un viewBox final variant d'environ 21 à 41 unités de large — resserré pour les paraboles
 * serrées, généreux pour les aplaties, sans jamais l'emballement (~149 unités) de l'ancien domaine
 * fixe. Pour |a|=1, `demiLargeurCadrage` retourne exactement `DEMI_LARGEUR_COURBE` (a^x=1 quel que
 * soit x quand a=1) : aucune régression sur le comportement historique déjà éprouvé autour de
 * |a|=1.
 */
export function demiLargeurCadrage(a: number): number {
  return DEMI_LARGEUR_COURBE / Math.pow(Math.abs(a), EXPOSANT_CADRAGE);
}

/**
 * prompt-zoom-et-cadrage.md, point 1 (élargi une seconde fois par prompt-bug-fonction-attendue-
 * et-zoom.md, point 2) : limites de zoom passées à la prop `zoom` de `<Mafs>`
 * (`MafsGraphTransformation.tsx`) — Mafs, avec `zoom={true}` seul, retient par défaut `min=0,5,
 * max=5` (`zoom.min` borne le zoom-AVANT maximal atteignable — ×2 seulement avec le défaut 0,5 —
 * `zoom.max` borne le zoom-ARRIÈRE — ×5 avec le défaut 5 —, cf. `useCamera` dans
 * `node_modules/mafs/build/index.js` : `maxScale = 1/zoom.min`, `minScale = 1/zoom.max`).
 * `ZOOM_MIN` élargi une seconde fois (0,05 → 0,02, soit un zoom-avant ×50 au lieu de ×20) pour
 * laisser une marge encore plus confortable au-delà du cadrage adaptatif déjà en place ci-dessus
 * (`demiLargeurCadrage`) sur tous les cas générés (`|a|` de 1/5 à 5, translations jusqu'à ±5) —
 * `formatEtiquetteGrille` ci-dessous, pas cette limite, était la cause réelle des sous-graduations
 * illisibles signalées (bruit de virgule flottante sur les étiquettes, pas un plafond de zoom trop
 * bas : verrouillé par test avant correctif, voir mafsTransformation.test.ts).
 *
 * **Élargi une troisième fois** (0,02 → 0,003, `prompt-croix-et-elargissement-plage.md`, point 2)
 * — ces deux constantes sont aussi réexportées et utilisées par le graphe de "Transformations
 * graphiques — fonctions de référence" (`src/ui/mafsFonctionsReference.ts`), dont le cadrage
 * (`calculerViewBoxFonctionReference`) reste linéaire pour la pente horizontale (CH/EH, voir sa
 * section dédiée) mais PAS pour la mise à l'échelle verticale (EV/CV) combinée à une famille non
 * linéaire (`carre`, `cube`) : `g(u)` croît en `u²`/`u³` sur la fenêtre fixe `±U_CIBLE` avant même
 * la mise à l'échelle par EV/CV, donc un EV élevé multiplie directement l'amplitude déjà grande de
 * `g`, gonflant la hauteur du viewBox (et, par l'ajustement du ratio d'aspect, sa largeur aussi) —
 * même classe de problème que l'ancien cadrage à demi-largeur fixe du chapitre 1
 * (`prompt-zoom-et-cadrage.md`), mais jamais corrigée par un exposant de cadrage ici (design
 * délibérément différent, voir la section dédiée du dixième exercice) : c'est le zoom-avant
 * disponible qui doit compenser. `EV`/`CV` passant de `[1,3]` à `[1,5]`
 * (`prompt-croix-et-elargissement-plage.md`, point 2), le cas le plus exigeant (`cube`, `EV=5`)
 * produit un viewBox initial d'environ 1190×794 unités — confirmé empiriquement (méthode "verify
 * before fixing") avant ce correctif : à l'ancien `ZOOM_MIN=0,02`, le zoom-avant maximal
 * n'atteignait qu'un pas de grille de 5 (horizontal) / 2 (vertical), bien trop grossier pour lire
 * la courbe près du point caractéristique. `0,003` (zoom-avant ×333) ramène ce même cas au moins à
 * un pas ≤0,5 sur les deux axes, avec une marge de sécurité (0,004 suffisait tout juste) — voir
 * `mafsFonctionsReference.test.ts` pour le test verrouillant ce cas précis. Aucune régression sur
 * les deux autres graphes (huitième, neuvième exercice) : `ZOOM_MIN` plus petit ne fait qu'ajouter
 * de la marge de zoom-avant, jamais en retirer.
 */
export const ZOOM_MIN = 0.003;
export const ZOOM_MAX = 80;

/**
 * Épaisseurs de trait partagées (`weight`, prop Mafs) — `promptepaisseurtraitgenerale.md`, faisant
 * suite à une investigation ayant infirmé l'hypothèse d'un bug de `stroke-width` fixe vulnérable à
 * l'échelle (l'épaisseur PIXEL réelle des tracés Mafs n'a jamais changé — voir la mémoire/l'historique
 * de cette investigation). La perception de trait "plus fin" venait d'un effet de composition
 * visuelle (viewBox élargi → même trait occupe une portion plus petite du cadre), jamais d'un défaut
 * de rendu — ce correctif reste donc purement esthétique.
 *
 * Avant ce correctif, `weight` était un littéral numérique dupliqué à chaque site d'appel (~40
 * occurrences sur une quinzaine de composants), sans aucune constante partagée — un audit de
 * l'ensemble des usages a fait ressortir 4 paliers sémantiques déjà informellement respectés :
 * - **`EPAISSEUR_TRAIT_DISCRETE`** (`1` à l'origine) — lignes-guides secondaires, quasi toujours
 *   combinées à `style="dashed"`/`opacity≤0.7` (asymptotes, tracé du compas de construction,
 *   cercle de référence) : jamais l'élément principal du regard.
 * - **`EPAISSEUR_TRAIT_STANDARD`** (`2` à l'origine) — le palier le plus répandu, tracés
 *   "normaux" ni secondaires ni mis en avant (segments de boîte à moustaches/polygone des
 *   effectifs, droites de construction, courbes déjà confirmées).
 * - **`EPAISSEUR_TRAIT_ACCENTUE`** (`3` à l'origine) — élément mis en avant : la courbe/le vecteur
 *   principal de l'écran (`Plot.OfX`/`Plot.OfY` de la fonction étudiée, `Vector`, marqueurs
 *   Q1/Q3/médiane).
 * - **`EPAISSEUR_TRAIT_ACCENTUE_FORT`** (`4` à l'origine) — un seul site d'appel sur toute la
 *   plateforme (`MafsGraphCaracteristiquesFonction.tsx`, ligne de surlignage dégénérée à un seul
 *   point), conservé comme palier distinct plutôt que fusionné avec `ACCENTUE` pour ne changer
 *   aucun rapport visuel relatif déjà en place.
 *
 * **Un premier passage (`×1,25`, soit +25%) s'est révélé SANS AUCUN EFFET VISIBLE une fois vérifié
 * empiriquement** — voir `promptdiagnosticepaisseurtraitsanseffet.md` : le mécanisme de rendu était
 * intégralement correct (confirmé par lecture directe de `node_modules/mafs/build/index.js` — chaque
 * primitive consommée par la plateforme, `Line.Segment`/`Line.PointAngle`/`Vector`/`Circle`/`Ellipse`/
 * `Plot.OfX`/`Plot.OfY`, rend son `strokeWidth` en espace PIXEL CSS littéral, soit via des coordonnées
 * pré-transformées en pixels avant assignation aux attributs `x1/y1/x2/y2` (`Line.Segment`/`Vector`,
 * aucune transformation CSS supplémentaire appliquée à l'élément), soit via `vector-effect:
 * non-scaling-stroke` combiné à `transform: var(--mafs-view-transform)` (`Circle`/`Ellipse`/
 * `Plot.*`) — dans les deux cas l'épaisseur affichée est immunisée contre l'échelle du viewBox, exactement
 * comme établi par l'investigation d'origine) et aucun composant ne contournait la constante avec une
 * valeur locale codée en dur (vérifié par grep exhaustif, aucune occurrence résiduelle de
 * `weight={<littéral>}`). Le VRAI problème : `+25%` sur une base de 1 à 4 PIXELS CSS est un delta
 * inférieur au pixel pour les 2 premiers paliers (`1→1,25`, `2→2,5`) — imperceptible à l'œil nu sur un
 * écran normal, noyé dans l'anti-aliasing. Confirmé par un test jetable (jamais committé) poussant
 * temporairement les paliers à `5/10/15/20` (×4) : effet radicalement visible sur les 3 primitives
 * testées (`Line.Segment` — boîte à moustaches ; `Plot.OfX` — courbe de fonction ; `Line.Segment` du
 * polygone des effectifs cumulés) — preuve que le mécanisme fonctionne, et que la seule cause du
 * défaut initial était une amplitude de changement trop subtile, jamais un bug de câblage/rendu/cache.
 * Un second test intermédiaire (`×2`, doublement exact plutôt qu'un `+X%` sur des paliers déjà petits)
 * a confirmé une augmentation clairement perceptible SANS chevaucher de labels ni dégrader la
 * lisibilité (vérifié sur boîte à moustaches, courbe de fonction de référence, et 2 courbes cumulées
 * qui se croisent) — retenu comme valeur finale, préservant intégralement la hiérarchie visuelle
 * relative déjà en place entre les 4 paliers (toujours un pas constant de 2 entre paliers).
 *
 * **Leçon retenue pour un futur ajustement de ce type** : un changement de `weight`/`stroke-width`
 * exprimé en pourcentage relatif sur une base déjà petite en valeur ABSOLUE (quelques pixels) peut
 * rester complètement invisible malgré un pourcentage en apparence significatif — toujours vérifier
 * le delta en pixels absolus, et de préférence confirmer visuellement en navigateur (jamais seulement
 * en lisant le diff) avant de considérer un tel correctif comme terminé.
 *
 * **Revert du doublement (`promptauditepaisseurcourbesmafs.md`)** — le doublement décrit ci-dessus
 * (`×2`, retenu comme valeur finale à l'époque) a ensuite été signalé comme une régression
 * transversale ("courbes devenues plus épaisses que la convention établie") : les 4 paliers sont
 * revenus à leurs valeurs D'ORIGINE (`1/2/3/4`), un seul endroit à corriger grâce au partage complet
 * de ces constantes entre les 3 chantiers (4e/5e/6e — vérifié par grep exhaustif, aucun composant ne
 * définit son propre jeu de paliers ni ne code un `weight={<littéral>}` en dur). Investigation
 * ci-dessus (le mécanisme de rendu, l'immunité à l'échelle du viewBox) reste valide et non remise en
 * cause — seul le choix esthétique final change.
 *
 * Composants SVG indépendants de Mafs (`HistogrammeGraph.tsx`, `CercleTrigBase.tsx`,
 * `TriangleSketch.tsx`, `Solide3DSketch.tsx`, `ParabolaSketch.tsx`, `AllureSketch.tsx`,
 * `SketchAxeSommet.tsx`) explicitement hors périmètre — `viewBox` fixe, nature volontairement
 * schématique, jamais des tracés Mafs.
 */
export const EPAISSEUR_TRAIT_DISCRETE = 1;
export const EPAISSEUR_TRAIT_STANDARD = 2;
export const EPAISSEUR_TRAIT_ACCENTUE = 3;
export const EPAISSEUR_TRAIT_ACCENTUE_FORT = 4;

/**
 * prompt-bug-fonction-attendue-et-zoom.md, point 2 : Mafs n'arrondit jamais la valeur affichée
 * d'une étiquette d'axe (`defaultLabelMaker`, `node_modules/mafs/build/index.js`, affiche `x` tel
 * quel) — à un zoom suffisamment rapproché, l'accumulation d'imprécision flottante sur les
 * positions de graduation (ex. `5 + 0,05×3`) produit des étiquettes illisibles comme
 * "5.1499999999999995" au lieu de "5.15", donnant l'impression que le zoom ne permet pas
 * d'atteindre de sous-graduations lisibles — confirmé empiriquement en navigateur avant correctif
 * (méthode "verify before fixing") : le pas de grille lui-même (`calculerPasGrille`) était déjà
 * suffisamment fin, seul l'affichage de chaque étiquette individuelle était en cause. Passée à la
 * prop `labels` de `Coordinates.Cartesian` (`MafsGraphTransformation.tsx`), à la place du
 * `defaultLabelMaker` implicite.
 */
export function formatEtiquetteGrille(valeur: number): string {
  return String(Number(valeur.toPrecision(10)));
}

/** Ratio largeur/hauteur du conteneur du graphe (voir .mafs-graph, App.css) — fixe et connu à
 * l'avance, indépendant de la taille réelle de l'écran (le conteneur CSS impose ce ratio quelle
 * que soit sa largeur). Nécessaire pour pré-adapter le viewBox ci-dessous : Mafs impose une
 * échelle IDENTIQUE en x et en y (pour ne jamais déformer les figures, cf. son option
 * `preserveAspectRatio="contain"`, activée par défaut) — si la zone de données qu'on lui donne n'a
 * pas déjà ce même ratio, Mafs élargit lui-même l'axe le plus étroit pour compenser, ce qui rend
 * tout calcul de pas de grille fait à partir du seul viewBox demandé incohérent avec ce qui est
 * réellement affiché. En pré-adaptant nous-mêmes la zone à ce ratio avant de la transmettre à
 * Mafs, son propre ajustement devient un no-op et le pas de grille calculé sur le viewBox retourné
 * reste valable pour ce qui est réellement affiché.
 */
export const RATIO_GRAPHE = 3 / 2;

export interface ViewBoxTransformation {
  x: [number, number];
  y: [number, number];
}

const ECHANTILLONS = 40;

function etendreBornes(bornes: { xMin: number; xMax: number; yMin: number; yMax: number }, courbe: ParametresCourbe) {
  const demiLargeur = demiLargeurCadrage(courbe.a);
  const xMin = Math.min(bornes.xMin, courbe.p - demiLargeur);
  const xMax = Math.max(bornes.xMax, courbe.p + demiLargeur);
  let yMin = bornes.yMin;
  let yMax = bornes.yMax;
  for (let i = 0; i <= ECHANTILLONS; i++) {
    const x = courbe.p - demiLargeur + ((2 * demiLargeur) * i) / ECHANTILLONS;
    const y = evaluerCourbe(courbe, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }
  return { xMin, xMax, yMin, yMax };
}

/**
 * Élargit x ou y (jamais les deux, jamais un rétrécissement) pour que (xMax-xMin)/(yMax-yMin)
 * égale exactement `ratio`, en gardant le même centre — réplique fidèlement la formule interne de
 * Mafs (`MafsCanvas`, branche `preserveAspectRatio === "contain"`) pour que son propre ajustement,
 * appliqué ensuite sur une zone qui satisfait déjà ce ratio, ne change plus rien.
 *
 * **Exportée** (`ui5e/sinusoideGraph.ts`, 5gen9) pour un second usage : PRÉDIRE l'étendue Y
 * RÉELLEMENT affichée par Mafs SANS pré-adapter le viewBox transmis (5gen9 ne pré-adapte
 * délibérément PAS son propre viewBox, contrairement à l'usage historique ci-dessus — voir l'en-tête
 * de `etiquetteYVisible` pour la justification complète : pré-adapter aurait pu élargir l'axe X
 * au-delà du domaine `K_MIN..K_MAX` couvert par sa grille dessinée à la main, laissant une marge sans
 * grille ni courbe). Reste néanmoins la MÊME formule, seule la façon dont l'appelant utilise le
 * résultat diffère.
 */
export function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxTransformation {
  const largeurZone = x[1] - x[0];
  const hauteurZone = y[1] - y[0];
  const ratioZone = largeurZone / hauteurZone;

  if (ratioZone > ratio) {
    const centreY = (y[0] + y[1]) / 2;
    const demiHauteur = largeurZone / ratio / 2;
    return { x, y: [centreY - demiHauteur, centreY + demiHauteur] };
  }

  const centreX = (x[0] + x[1]) / 2;
  const demiLargeur = (hauteurZone * ratio) / 2;
  return { x: [centreX - demiLargeur, centreX + demiLargeur], y };
}

/**
 * Généralisation à N courbes (`prompt`/spec "Forme canonique et transformations", trace cumulative
 * — plusieurs courbes déjà confirmées affichées en même temps que la courbe en cours) : chaque
 * courbe contribue son propre domaine, adapté à son propre `|a|` (`demiLargeurCadrage`, centré sur
 * son sommet) à l'union des bornes ; le résultat est ensuite élargi (jamais rétréci) sur l'axe le
 * plus étroit pour respecter exactement RATIO_GRAPHE. `calculerViewBoxTransformation` (2 courbes
 * au plus, cible/live) en est un cas particulier — voir plus bas.
 */
export function calculerViewBoxMultiple(courbes: ParametresCourbe[]): ViewBoxTransformation {
  let bornes = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity };
  for (const courbe of courbes) {
    bornes = etendreBornes(bornes, courbe);
  }

  const paddingY = Math.max(1, (bornes.yMax - bornes.yMin) * 0.12);
  // paddingX suit la même règle proportionnelle que paddingY (avec le même plancher) — un padding
  // fixe à 1 unité dominerait disproportionnellement les cadrages étroits produits par
  // `demiLargeurCadrage` pour les |a| élevés.
  const paddingX = Math.max(1, (bornes.xMax - bornes.xMin) * 0.12);

  return ajusterAuRatio(
    [bornes.xMin - paddingX, bornes.xMax + paddingX],
    [bornes.yMin - paddingY, bornes.yMax + paddingY],
    RATIO_GRAPHE,
  );
}

/**
 * Calcule la zone d'intérêt (viewBox Mafs) pour que la courbe cible — et, si `live` est fourni
 * (bouton "Aide" activé), la courbe manipulable en direct — soient toutes deux visibles
 * confortablement (section 2 de la spec). Cas particulier de `calculerViewBoxMultiple` à 1 ou 2
 * courbes.
 */
export function calculerViewBoxTransformation(cible: ParametresCourbe, live?: ParametresCourbe | null): ViewBoxTransformation {
  return calculerViewBoxMultiple(live ? [cible, live] : [cible]);
}

/**
 * `promptauditcourbesmafszoom.md` : les bornes de tracé (l'ancien `demiLargeurTrace`, et les
 * nombreux `domain={[xMin,xMax]}`/`domain={segment.domaine}` par ailleurs sur la plateforme) étaient
 * toutes des valeurs FIGÉES au moment de la génération — dès que l'utilisateur dézoome au-delà, la
 * courbe s'arrêtait net avant le bord du cadre au lieu de le couvrir.
 *
 * `domaineVisibleX`/`domaineVisibleY` calculent les 2 bornes DATA correspondant aux 2 bords PIXEL
 * (0 et `largeur`/`hauteur`) de la zone visible — mais, contrairement à `calculerPasGrille`
 * (`GrilleAdaptative`, qui ne dépend que de `viewTransform[0]`/`[4]`, l'ÉCHELLE), retrouver les bornes
 * ABSOLUES exige aussi le décalage de pan/zoom courant, qui n'est PAS dans `viewTransform`
 * (`useTransformContext()`) : lecture de `node_modules/mafs/build/index.js` (`Mafs()`, `viewTransform`
 * ligne ~847) confirme que ce matrice est construite via `matrixBuilder().scale(scaleX,scaleY)`
 * SEULE, sans jamais de `.translate(...)` — sa composante de translation (index 2/5) vaut donc
 * TOUJOURS 0, quel que soit le pan/zoom courant (vérifié empiriquement en navigateur, `getComputedStyle`
 * sur `--mafs-view-transform` avant et après un dézoome : `tx`/`ty` restent 0 dans les deux cas,
 * seule l'échelle change) — piège rencontré et corrigé après un premier correctif SANS EFFET RÉEL
 * (la courbe restait bloquée, un large vide apparaissant entre son extrémité et le bord du cadre,
 * confirmé par capture Playwright avant ce correctif, méthode "verify before fixing"). Le décalage de
 * pan/zoom est en réalité encodé dans l'attribut `viewBox` du SVG rendu lui-même (`mapGesturePoint`,
 * même fichier : `localX = pixelX - rect.left + viewBoxX`, PUIS inversion de `viewTransform`) —
 * jamais exposé par le contexte React public, uniquement lisible depuis le DOM. `origineLocaleX`/
 * `origineLocaleY` (le premier/second nombre de l'attribut `viewBox` du SVG ancêtre, lu depuis le DOM
 * par les composants React de présentation — voir `DomaineTraceX`/`FenetreVisibleX`,
 * `components/mafsGraphPartage.tsx`) doivent donc être fournis par l'appelant plutôt que dérivés d'ici
 * — cette fonction reste pure (aucun accès DOM), mais n'est plus autosuffisante à partir du seul
 * `viewTransform`. Formule : `donnée = (pixel + origineLocale - translation) / échelle` — `translation`
 * (toujours 0 aujourd'hui) conservée dans la formule par prudence plutôt que supprimée, pour rester
 * correcte si Mafs venait à en introduire une un jour. Fonction interne générique
 * (`domaineVisibleAxe`) plutôt que dupliquée X/Y, seuls les index d'échelle/translation diffèrent
 * (0/2 pour X, 4/5 pour Y — même piège d'index déjà documenté sur `GrilleAdaptative`).
 *
 * `borneDomaineVisible` compose ce résultat avec une restriction mathématique RÉELLE éventuelle
 * (exclusion de domaine, asymptote verticale) : l'intersection des deux bornes garantit qu'une
 * branche interrompue par une telle restriction reste bornée à sa valeur exacte (pas de régression,
 * exigence explicite du prompt), tandis qu'une portion sans restriction (paramètre `restriction`
 * omis) suit intégralement la fenêtre visible à tout niveau de zoom/pan.
 */
/**
 * Diagnostic empirique (méthode "verify before fixing", `promptcorrectionjitterasymptotesverification5gen30.md`) :
 * un pan PARFAITEMENT monotone (déplacement souris de +3px à chaque frame, aucun autre changement)
 * produisait un tracé (`Plot.OfX`, attribut `d` du `<path>`) dont la LONGUEUR (donc le nombre de
 * points échantillonnés) oscillait de façon complètement non monotone frame à frame (ex.
 * 54914→38191→44443→43004→47095... caractères, mesuré par un script Playwright dédié comparant le
 * SVG rendu à des frames consécutives) — jamais de gap ni de mauvaise valeur affichée (le `viewBox`
 * du SVG, lui, restait parfaitement lisse et monotone à chaque frame), mais une INSTABILITÉ RÉELLE
 * du tracé produit pour un déplacement caméra pourtant parfaitement régulier.
 *
 * Cause isolée par lecture de `node_modules/mafs/build/index.js` (`sample`/`subdivide`,
 * `src/display/Plot/PlotUtils.tsx`) : l'échantillonnage ADAPTATIF de `Plot.OfX` subdivise son
 * domaine `[min,max]` récursivement, choisissant le point milieu de CHAQUE intervalle via
 * `cheapHash(min,max)` — un hash PSEUDO-ALÉATOIRE des bornes exactes de cet intervalle, RECALCULÉ à
 * chaque niveau de récursion. Le domaine `[min,max]` passé à `Plot.OfX` (ici : `domaineVisibleAxe`
 * ci-dessous, réutilisé tel quel comme borne de tracé côté x — et, pour la borne y proche d'un pôle,
 * comme cible de la bissection `xBordVisibleY`) suivait auparavant en PLEINE PRÉCISION FLOTTANTE le
 * viewport courant, changeant donc à CHAQUE frame de rendu pendant une interaction (chaque pixel de
 * déplacement souris déclenche un nouveau rendu Mafs, donc un nouveau `viewTransform`) : la moindre
 * variation de dernière décimale de `[min,max]` reseed intégralement `cheapHash` à CHAQUE niveau de
 * subdivision, produisant un arbre d'échantillonnage QUALITATIVEMENT différent (nombre de points,
 * profondeur de récursion atteinte) d'une frame à l'autre — plus la fonction est raide (proche d'une
 * asymptote, verticale OU horizontale : `domaineVisibleX`/`domaineVisibleY` alimentent les deux),
 * plus cette chaîne de décisions "subdiviser encore ?" (comparaison `error(...) > threshold`) est
 * sensible à ce bruit, donc plus le tracé RÉSULTANT (pas seulement sa longueur) diffère visuellement
 * d'une frame à l'autre — c'est le jitter observé, jamais une erreur de calcul de `[min,max]`
 * elle-même (qui reste, comme le `viewBox`, mathématiquement correcte à chaque frame).
 *
 * Fix : STABILISER `[min,max]` en l'arrondissant vers l'EXTÉRIEUR (jamais vers l'intérieur — aucun
 * rétrécissement de la couverture visible, même principe que `ajusterAuRatio` ci-dessus) à un pas
 * proportionnel à l'échelle courante et exprimé en PIXELS (`FRACTION_PIXEL_STABILISATION`, jamais
 * une fraction absolue de l'étendue visible — reste valable quel que soit le niveau de zoom). Deux
 * frames consécutives dont le déplacement caméra reste sous ce seuil produisent alors des bornes BIT
 * POUR BIT IDENTIQUES, donc un `cheapHash` identique à chaque niveau, donc un tracé PARFAITEMENT
 * stable (jamais recalculé "pour rien") — et continue de suivre le zoom/pan normalement dès qu'un
 * déplacement dépasse ce seuil (jamais figé/débounce : réactif à chaque frame qui compte réellement,
 * conformément au point 3 du prompt). Le dépassement introduit par l'arrondi extérieur reste
 * TOUJOURS hors du cadre visible (par construction, borné par ce même pas) — invisible à l'écran
 * quelle que soit sa taille, contrairement à ce qu'on pourrait croire : élargir ce pas n'a donc
 * AUCUN coût visuel (pas de gap, pas de retard de couverture, une frame en zoom-arrière recalcule
 * de toute façon la vraie borne AVANT de l'arrondir), seulement moins de recalculs "pour rien".
 *
 * `0,25` (quart de pixel), essayé en premier par analogie avec le seuil de perception visuelle
 * (sous l'échelle de l'anti-aliasing), s'est révélé EMPIRIQUEMENT INSUFFISANT : un pas/frame de test
 * réaliste (~3px) franchit très largement ce seuil à CHAQUE frame, donc ne suffit pas à faire
 * coïncider deux frames consécutives dans le même palier — le jitter mesuré restait presque
 * intégralement inchangé. `16` (pixels), retesté avec le même script, produit au contraire des
 * paliers de PLUSIEURS frames consécutives strictement identiques (`d` bit pour bit identique)
 * séparés de transitions nettes — jitter éliminé, tout en restant largement sous le seuil où un
 * décalage de couverture serait perceptible (~3% de la largeur d'un graphe typique).
 */
const FRACTION_PIXEL_STABILISATION = 16;

function stabiliserBorneVisible(valeur: number, pas: number, versLeHaut: boolean): number {
  if (!Number.isFinite(pas) || pas <= 0) return valeur;
  return (versLeHaut ? Math.ceil(valeur / pas) : Math.floor(valeur / pas)) * pas;
}

function domaineVisibleAxe(
  viewTransform: readonly number[],
  origineLocale: number,
  tailleEnPixels: number,
  indexEchelle: number,
  indexTranslation: number,
): [number, number] {
  const echelle = viewTransform[indexEchelle];
  const translation = viewTransform[indexTranslation];
  const borne1 = (origineLocale - translation) / echelle;
  const borne2 = (tailleEnPixels + origineLocale - translation) / echelle;
  const [lo, hi] = borne1 <= borne2 ? [borne1, borne2] : [borne2, borne1];
  const pas = (1 / Math.abs(echelle)) * FRACTION_PIXEL_STABILISATION;
  return [stabiliserBorneVisible(lo, pas, false), stabiliserBorneVisible(hi, pas, true)];
}

export function domaineVisibleX(viewTransform: readonly number[], origineLocaleX: number, largeur: number): [number, number] {
  return domaineVisibleAxe(viewTransform, origineLocaleX, largeur, 0, 2);
}

export function domaineVisibleY(viewTransform: readonly number[], origineLocaleY: number, hauteur: number): [number, number] {
  return domaineVisibleAxe(viewTransform, origineLocaleY, hauteur, 4, 5);
}

export function borneDomaineVisible(visible: [number, number], restriction?: [number, number]): [number, number] {
  if (!restriction) return visible;
  return [Math.max(visible[0], restriction[0]), Math.min(visible[1], restriction[1])];
}

const ITERATIONS_BISECTION_BORD_Y = 40;

/**
 * `promptauditcourbesmafszoomy.md` (addendum au prolongement en x ci-dessus) : près d'une asymptote
 * verticale (x→pôle), le prolongement en x seul ne suffit pas — la borne du domaine tracé côté pôle
 * restait, avant ce correctif, une distance FIXE (`BUFFER_POLE`/`BUFFER_VA`/`epsilonZone6`, quelques
 * dixièmes d'unité) : à un zoom modéré cette distance produit déjà un y bien au-delà du cadre visible
 * (aucun problème), mais dès qu'on zoome davantage sur la région proche du pôle, cette même distance
 * ABSOLUE représente une part croissante — puis la TOTALITÉ, voire plus — de la fenêtre visible
 * actuelle : la branche s'arrête alors à un y bien en-deçà du bord du cadre (symptôme : "la branche
 * s'arrête à une valeur de y fixe"), et à un zoom encore plus poussé le segment devient vide ou
 * inversé (intersection avec la fenêtre visible ne laissant plus rien à tracer — confirmé
 * empiriquement en navigateur avant ce correctif, méthode "verify before fixing" : cadre totalement
 * vide, y compris la grille, dès qu'on zoome suffisamment près d'une asymptote).
 *
 * `xBordVisibleY` retrouve, par BISSECTION plutôt qu'une formule fermée (générique à toute famille de
 * fonction de la plateforme sans connaître son expression analytique — seule hypothèse : `evaluer` est
 * strictement monotone en valeur absolue entre `xLoin` et le pôle, vraie pour toute branche adjacente
 * à une SEULE asymptote verticale, sans extremum local entre les deux), le point x, entre `xLoin`
 * (déjà dans la fenêtre visible côté loin du pôle — voir `domaineVisibleX`) et le pôle `xPole` (jamais
 * atteint), où `evaluer(x)` croise exactement la borne y visible (`visibleY[0]` ou `[1]`, choisie
 * automatiquement selon le signe de `evaluer` tout près du pôle — la branche approche soit +∞ soit
 * -∞, jamais les deux à la fois d'un seul côté du pôle).
 *
 * Ancre `xPresPole` calculée en fraction RELATIVE de la distance `xLoin`→`xPole` (`EPSILON_RELATIF_POLE`,
 * 1e-6) plutôt qu'une distance absolue fixe — reste valide quelle que soit l'échelle du graphe
 * (translations/coefficients très différents d'un générateur à l'autre) : à cette fraction, `evaluer`
 * a normalement déjà largement dépassé n'importe quelle borne y visible réaliste (la fonction diverge
 * near le pôle), point de départ sûr pour la bissection. Si ce n'est exceptionnellement pas le cas
 * (fonction à croissance inhabituellement lente près du pôle), retombe simplement sur `xPresPole`
 * lui-même (jamais pire que l'ancien comportement figé). Si `xLoin` lui-même dépasse déjà la borne
 * visible (toute la portion visible de cette branche est hors-cadre en y), retombe sur `xLoin` sans
 * bissection inutile.
 */
const EPSILON_RELATIF_POLE = 1e-6;

export function xBordVisibleY(evaluer: (x: number) => number, xPole: number, xLoin: number, visibleY: [number, number]): number {
  const xPresPole = xPole + (xLoin - xPole) * EPSILON_RELATIF_POLE;
  const yPresPole = evaluer(xPresPole);
  if (!Number.isFinite(yPresPole)) return xPresPole;

  const borneY = yPresPole >= 0 ? visibleY[1] : visibleY[0];
  const depasseBorne = (y: number) => Number.isFinite(y) && (yPresPole >= 0 ? y >= borneY : y <= borneY);

  if (depasseBorne(evaluer(xLoin))) return xLoin;
  if (!depasseBorne(yPresPole)) return xPresPole;

  let bas = xLoin;
  let haut = xPresPole;
  for (let i = 0; i < ITERATIONS_BISECTION_BORD_Y; i++) {
    const milieu = (bas + haut) / 2;
    if (depasseBorne(evaluer(milieu))) {
      haut = milieu;
    } else {
      bas = milieu;
    }
  }
  return haut;
}

const MANTISSES_GRILLE = [1, 2, 5];
const CIBLE_NOMBRE_LIGNES = 10;

/**
 * prompt-grille-pas-fractionnaires.md : dans la décade où le pas représente une fraction D'UNE
 * UNITÉ (exposant=-1, base=0,1 — la largeur visible y est dans [1,10)), un candidat supplémentaire
 * `10/3` (donnant `10/3 × 0,1 = 1/3`) s'ajoute aux mantisses rondes habituelles — en cohérence avec
 * la plage `CH`/`CV`/`EH`/`EV` (alors 1 à 3) de "Transformations graphiques — fonctions de
 * référence" : un pas de 1/3 d'unité permet à un point caractéristique décalé d'un tiers d'unité
 * par une compression CH=3/CV=3 de tomber exactement sur une ligne de grille plutôt qu'entre deux
 * lignes. `1/2` n'a besoin d'aucun ajout : déjà atteignable nativement via la mantisse ronde 5
 * (5×0,1=0,5). `prompt-croix-et-elargissement-plage.md`, point 2, élargit la même plage à 1 à 5 —
 * un second candidat `2,5` (donnant `2,5×0,1=1/4`) s'ajoute donc à son tour. `1/5` n'a, comme `1/2`,
 * besoin d'aucun ajout : `1/5=0,2` est déjà exactement la mantisse ronde `2` (2×0,1=0,2) — une
 * coïncidence mathématique (`1/5` est un multiple entier de `10^n`), pas un oubli. Volontairement
 * **scopé à cette seule décade** (jamais généralisé à un pas de `3,33`/`25`/`0,0333`/`0,025` à
 * d'autres échelles, via un multiple de `10/3`/`2,5` à d'autres puissances de 10) : la demande
 * porte sur "un pas de 1/2, 1/3, 1/4 ou 1/5 D'UNITÉ", pas une famille de fractions valable à toute
 * échelle — les mêmes exposants -2, 0, 1... continuent de n'utiliser que les mantisses rondes
 * `MANTISSES_GRILLE`. Les candidats restent triés par ordre croissant (0,1 / 0,2 / 0,25 / 0,333... /
 * 0,5), condition nécessaire à la boucle de sélection ci-dessous (premier candidat qui couvre
 * `brut`).
 */
const MANTISSES_GRILLE_DECADE_UNITAIRE = [1, 2, 2.5, 10 / 3, 5];
const EXPOSANT_DECADE_UNITAIRE = -1;

/**
 * Choisit l'espacement des lignes de grille labellisées (prop `lines` de Coordinates.Cartesian),
 * de façon adaptative au zoom — façon GeoGebra (correction 1 du prompt) : à mesure qu'on zoome
 * (largeur visible qui diminue), le pas suit la séquence "ronde" 1-2-5 en la parcourant vers le
 * bas (10 → 5 → 2 → 1 → 0,5 → 0,2 → ...), et inversement en dézoomant (vers le haut, sans
 * plafond). Générée procéduralement (mantisse ∈ {1,2,5} × 10^n, n quelconque, positif ou négatif)
 * plutôt qu'une table statique bornée : une simple division continue produirait des pas
 * arbitraires (ex. 0,73) illisibles, et une table figée (comme l'ancienne implémentation,
 * plafonnée à 100 et sans valeurs sous 1) casserait dès qu'on zoome suffisamment loin dans un sens
 * ou dans l'autre — Mafs dessine par défaut une ligne PAR unité (lines:1), ce qui sature l'axe dès
 * que le viewBox dépasse une dizaine d'unités. Dans la décade unitaire (exposant=-1), la liste de
 * mantisses est étendue avec `10/3` et `2,5` — voir `MANTISSES_GRILLE_DECADE_UNITAIRE` ci-dessus —
 * pour proposer aussi un pas de 1/3 ou 1/4 d'unité ; toutes les autres décades restent inchangées.
 *
 * `cibleNombreLignes?` (prop additive optionnelle, `promptgen36fixmafsechelle.md`) : par défaut
 * `CIBLE_NOMBRE_LIGNES=10`, comportement historique inchangé pour tout appelant qui l'omet — le
 * seul appelant à la fournir explicitement est "Boîte à moustaches"
 * (`GrilleAdaptative`/`BoiteMoustachesGraph.tsx`), dont les valeurs héritent directement de la
 * magnitude brute du contexte narratif (jusqu'à 6 chiffres, ex. un kilométrage en centaines de
 * milliers) — bien au-delà des domaines habituels des autres graphes Mafs du projet (translations
 * ±5, coordonnées de courbe à 1-2 chiffres). À `largeur_px` fixe, l'espacement PIXEL entre deux
 * lignes labellisées est environ `largeur_px / cibleNombreLignes`, indépendamment de la magnitude
 * des valeurs affichées : viser moins de lignes donne donc plus de place à chaque étiquette,
 * quel que soit son nombre de chiffres — c'est ce levier, pas un changement de la séquence
 * 1-2-5 elle-même, qui résout le chevauchement des labels à grandes valeurs.
 *
 * `mantissesPersonnalisees?` (prop additive optionnelle, `promptcorrectioninstabiliteratioboite
 * moustaches.md`, cause 1) : REMPLACE entièrement la sélection de mantisses par défaut (1-2-5,
 * ainsi que le jeu spécial de la décade unitaire) quand fournie — absente/`undefined` pour tout
 * appelant existant, comportement historique bit pour bit inchangé (toujours 1-2-5, jamais modifié
 * globalement). Introduite pour `BoiteMoustachesGraph.tsx` (seul appelant à la fournir) : ses
 * paliers de mantisses 1-2-5, très espacés (facteurs ×2 puis ×2,5), créent des paliers de largeur
 * FINALE constante sur toute une plage d'étendue — le ratio affiché/réel y varie donc comme
 * `1/étendue` à l'intérieur d'un palier (jusqu'à ×6,3 en bas de palier), avant un saut brutal
 * (+98%) au palier suivant. Un jeu de mantisses plus fin réduit cet écart SANS viser une précision
 * parfaite (juste un ajustement raisonnable, voir `cibleNombreLignesXAdaptative`/
 * `MANTISSES_GRILLE_BOITE`, `ui/boiteMoustachesGraph.ts`, pour le choix retenu et sa justification
 * empirique). **Appliqué à X SEULEMENT dans `etendreViewBoxPourEtiquettes`** — le diagnostic à
 * l'origine de cette correction ne portait que sur `largeurX`/l'étendue réelle des données ; l'axe Y
 * de la boîte à moustaches n'est qu'un séparateur de ligne (jamais une grandeur affichée à
 * l'élève), et `CIBLE_NOMBRE_LIGNES_Y_BOITE` a été calibrée spécifiquement contre les mantisses
 * PAR DÉFAUT (`promptajustementmargeboitemoustaches.md`, vérifié par Playwright) — y appliquer
 * aussi les mantisses fines a produit, constaté à l'écran, un pas Y non entier (ex. 1,5) donnant des
 * étiquettes Y décimales rapprochées/rognées en haut de graphe, une régression visuelle par rapport
 * au réglage déjà validé. `calculerPasGrille` lui-même reste générique (le paramètre s'applique à
 * l'axe qu'on lui passe) — c'est ce SEUL appelant qui restreint son usage à X.
 */
export function calculerPasGrille(largeur: number, cibleNombreLignes: number = CIBLE_NOMBRE_LIGNES, mantissesPersonnalisees?: number[]): number {
  const brut = largeur / cibleNombreLignes;
  const exposant = Math.floor(Math.log10(brut) + 1e-9);
  const base = Math.pow(10, exposant);
  const mantisses = mantissesPersonnalisees ?? (exposant === EXPOSANT_DECADE_UNITAIRE ? MANTISSES_GRILLE_DECADE_UNITAIRE : MANTISSES_GRILLE);
  for (const mantisse of mantisses) {
    const candidat = mantisse * base;
    if (candidat >= brut * (1 - 1e-9)) return arrondirPasGrille(candidat);
  }
  return arrondirPasGrille(10 * base);
}

/** Corrige les imprécisions flottantes inévitables (ex. 0,020000000000000004) sans changer la
 * valeur mathématique — la mantisse est toujours 1, 2 ou 5, seule la puissance de 10 varie. */
function arrondirPasGrille(valeur: number): number {
  return Number(valeur.toPrecision(10));
}

/** Fraction du pas de grille conservée comme clairance entre la dernière graduation RENDUE et le
 * bord du viewBox, dans `etendreViewBoxPourEtiquettes` ci-dessous — 0,5 place le bord exactement
 * à mi-chemin entre cette graduation et la suivante (exclue), la valeur la plus simple qui laisse
 * une marge symétrique généreuse (jusqu'à la moitié de l'espacement entre 2 graduations, largement
 * suffisant pour un nombre court, signe moins inclus) sans jamais risquer d'inclure la graduation
 * suivante par erreur. */
const FRACTION_CLAIRANCE_ETIQUETTE = 0.5;

/** Étend `valeur` (une borne brute de viewBox, `xMin`/`xMax`/`yMin`/`yMax`) jusqu'à la PROCHAINE
 * graduation dans `direction` (-1 = vers les valeurs plus petites, +1 = vers les plus grandes),
 * puis recule de `FRACTION_CLAIRANCE_ETIQUETTE * pas` pour ne jamais inclure la graduation
 * D'ENCORE APRÈS. Voir `etendreViewBoxPourEtiquettes` pour la justification complète : ancrer le
 * calcul sur la grille de graduations elle-même (jamais sur `valeur` directement) est ce qui rend
 * la clairance déterministe. */
function etendreBorneVersGraduation(valeur: number, pas: number, direction: -1 | 1): number {
  const graduationAdjacente = direction < 0 ? Math.floor(valeur / pas) * pas : Math.ceil(valeur / pas) * pas;
  return graduationAdjacente + direction * pas * FRACTION_CLAIRANCE_ETIQUETTE;
}

/**
 * `promptcorrectioninstabiliteratioboitemoustaches.md`, cause 2 : élargit `[min,max]` en ancrant le
 * bord bas comme `etendreBorneVersGraduation` (même garantie de clairance exacte de
 * `FRACTION_CLAIRANCE_ETIQUETTE * pas`), mais calcule la LARGEUR finale (`nombrePas * pas`)
 * indépendamment de la position absolue de `min`/`max` sur la grille — seule l'étendue réelle
 * (`max - min`) et `pas` entrent dans ce calcul, jamais `min % pas`.
 *
 * **12ᵉ piège rencontré et corrigé** : la paire d'appels précédente —
 * `[etendreBorneVersGraduation(min, pas, -1), etendreBorneVersGraduation(max, pas, 1)]` — ancre
 * CHAQUE bord INDÉPENDAMMENT sur SA PROPRE graduation adjacente (`floor(min/pas)`/`ceil(max/pas)`),
 * dont la distance à `min`/`max` dépend du reste `min mod pas`/`max mod pas` — c'est-à-dire de la
 * position ABSOLUE de la donnée sur la grille, jamais seulement de son étendue. Deux étendues
 * IDENTIQUES peuvent ainsi produire des largeurs finales différant de près d'un pas entier selon
 * cette seule position — confirmé numériquement (balayage à étendue fixe = 13, position variable :
 * largeur finale alternant entre 25,2 et 40 avec une périodicité exacte de 5 en `min`, voir
 * `boiteMoustachesGraph.test.ts`) : `BoiteMoustachesGraph.tsx`, avec sa boucle à point fixe (jusqu'à
 * 4 itérations) qui recalcule le pas depuis le résultat déjà gonflé, amplifie cet écart à chaque
 * tour, produisant l'instabilité de ratio observée (jusqu'à ×5,7 sur des tirages réels par ailleurs
 * comparables).
 *
 * Fix : dériver le nombre de pas nécessaires (`nombrePas`) directement de `(max-min)/pas`, majoré du
 * PIRE CAS possible de reste (`min mod pas` → `pas` exclu) plutôt que du reste RÉEL — la borne haute
 * ainsi obtenue est donc parfois légèrement plus généreuse que le strict nécessaire pour un
 * alignement chanceux (c'est le prix de l'indépendance à la position), mais ne dépend plus JAMAIS de
 * `min mod pas`. Preuve : en ancrant le bord bas à `floor(min/pas)*pas - c*pas` (`c` =
 * `FRACTION_CLAIRANCE_ETIQUETTE`) et en écrivant `min = floor(min/pas)*pas + r` (`r ∈ [0,pas)`), la
 * condition « le bord haut couvre `max` » se réécrit `nombrePas ≥ (max-min)/pas + r/pas + c` ; le
 * pire cas `r/pas → 1` (jamais atteint) donne `nombrePas = ⌈(max-min)/pas + c + 1⌉`, valable pour
 * TOUT reste `r` possible. Le bord haut résultant (`bordBas + nombrePas·pas`, `nombrePas` entier)
 * reste, comme le bord bas, exactement à `entier·pas - c·pas` de la grille — la garantie de
 * clairance déterministe (piège 1) reste donc, elle, intacte et EXACTE des deux côtés, seule la
 * largeur totale change de mécanisme de calcul.
 */
export function etendreLargeurVersGraduation(min: number, max: number, pas: number): [number, number] {
  const bordBas = etendreBorneVersGraduation(min, pas, -1);
  const nombrePas = Math.ceil((max - min) / pas + FRACTION_CLAIRANCE_ETIQUETTE + 1 - 1e-9);
  return [bordBas, bordBas + nombrePas * pas];
}

/**
 * Élargit l'axe le plus étroit (au sens du ratio `RATIO_GRAPHE`) tout en préservant la clairance
 * déterministe déjà garantie par `etendreBorneVersGraduation` sur CHAQUE axe — jamais un simple
 * recentrage géométrique comme `ajusterAuRatio` (voir le "4ᵉ piège" documenté sur
 * `etendreViewBoxPourEtiquettes` ci-dessous pour la genèse empirique de ce correctif). Élargit
 * l'axe étroit par MULTIPLES ENTIERS de son propre pas (préserve la forme "graduation ± une
 * demi-pas" déjà posée par `etendreBorneVersGraduation`, seule la distance à 0 change), puis élargit
 * l'axe déjà large par un recentrage simple (jamais grid-anchoré, mais toujours au moins aussi grand
 * qu'avant — sa clairance déjà garantie ne peut donc que s'améliorer) pour que le ratio final soit
 * EXACTEMENT `ratio` — jamais une valeur approchée : c'est ce qui garantit que le `preserveAspectRatio
 * === "contain"` de Mafs (jamais désactivé par ces 6 générateurs) reste un no-op, condition posée par
 * le 2ᵉ piège documenté plus bas.
 */
function elargirAvecClairance(etenduX: [number, number], etenduY: [number, number], pasX: number, pasY: number, ratio: number): ViewBoxTransformation {
  const largeurZone = etenduX[1] - etenduX[0];
  const hauteurZone = etenduY[1] - etenduY[0];
  const ratioZone = largeurZone / hauteurZone;
  if (Math.abs(ratioZone - ratio) < 1e-9) return { x: etenduX, y: etenduY };

  if (ratioZone > ratio) {
    const demiHauteurCible = largeurZone / ratio / 2;
    const demiHauteurActuelle = hauteurZone / 2;
    const nPas = Math.max(0, Math.ceil((demiHauteurCible - demiHauteurActuelle) / pasY - 1e-9));
    const y: [number, number] = [etenduY[0] - nPas * pasY, etenduY[1] + nPas * pasY];
    const centreX = (etenduX[0] + etenduX[1]) / 2;
    const demiLargeurExact = ((y[1] - y[0]) * ratio) / 2;
    const x: [number, number] = [Math.min(etenduX[0], centreX - demiLargeurExact), Math.max(etenduX[1], centreX + demiLargeurExact)];
    return { x, y };
  }

  const demiLargeurCible = (hauteurZone * ratio) / 2;
  const demiLargeurActuelle = largeurZone / 2;
  const nPas = Math.max(0, Math.ceil((demiLargeurCible - demiLargeurActuelle) / pasX - 1e-9));
  const x: [number, number] = [etenduX[0] - nPas * pasX, etenduX[1] + nPas * pasX];
  const centreY = (etenduY[0] + etenduY[1]) / 2;
  const demiHauteurExact = (x[1] - x[0]) / ratio / 2;
  const y: [number, number] = [Math.min(etenduY[0], centreY - demiHauteurExact), Math.max(etenduY[1], centreY + demiHauteurExact)];
  return { x, y };
}

/**
 * Étend un viewBox `{x:[min,max], y:[min,max]}` pour que les étiquettes de graduation aux
 * extrémités des axes restent entièrement visibles (`promptcorrectionmafslabelsgen13.md`, audit
 * d'ergonomie structurelle) — jusqu'ici, les ~17 composants graphe du projet passaient tous
 * `<Mafs viewBox={{..., padding: 0}}>` (viewBox collé exactement au rectangle de données), sans
 * aucune réserve pour le TEXTE de l'étiquette elle-même, qui a une largeur réelle en pixels
 * indépendante du rectangle de données. Rôle différent de la `MARGE` déjà appliquée en amont par
 * chaque calculateur de viewBox (`calculerViewBoxXxx`) : celle-ci garde les données/points tracés
 * loin du bord, mais ne protège pas les étiquettes de `GrilleAdaptative`, positionnées par Mafs à
 * chaque graduation — y compris potentiellement pile sur ce bord.
 *
 * **Piège rencontré et corrigé** : une 1re version ajoutait un simple scalaire (une fraction du pas
 * de grille) au `padding` natif de Mafs (`xMin -= padding; xMax += padding` etc., un seul scalaire
 * commun aux 2 axes — voir `node_modules/mafs/build/index.js`). Testé empiriquement (Playwright) :
 * un résidu de rognage subsistait encore, un caractère partiellement coupé plutôt que le signe/
 * chiffre entier d'avant, mais un vrai résidu. Cause : les graduations sont positionnées par Mafs à
 * des multiples FIXES du pas ANCRÉS SUR 0 (`xAxis={{lines: pasX, ...}}`), pas relativement aux
 * bornes du viewBox — décaler ces bornes d'un multiple entier du pas (`padding` étant additif)
 * NE CHANGE DONC RIEN à la distance entre le bord final et la graduation la plus proche : cette
 * distance dépend uniquement du reste de `xMin / pas` (ou `yMin / pas`), qu'aucun padding additif
 * constant ne peut modifier. Fix : ancrer le calcul sur la grille de graduations ELLE-MÊME
 * (`etendreBorneVersGraduation` ci-dessus, `Math.floor`/`Math.ceil` puis recul d'une fraction fixe
 * du pas) plutôt que sur les bornes brutes — la clairance devient alors constante et déterministe,
 * quelle que soit la position des données par rapport à la grille. Nécessite de calculer `x`/`y`
 * directement (jamais via le `padding` scalaire de Mafs, qui ne peut pas exprimer une marge
 * différente par bord) : appeler avec `padding: 0` sur le viewBox déjà étendu par cette fonction.
 *
 * **2ᵉ piège rencontré et corrigé, sur ce même chantier** : l'extension ci-dessus applique à `x`
 * et `y` des marges généralement DIFFÉRENTES (`pasX`/`pasY` calculés indépendamment), ce qui casse
 * le ratio largeur/hauteur (`RATIO_GRAPHE`) que le viewBox reçu en entrée respecte déjà
 * (`calculerViewBoxXxx` appelle systématiquement `ajusterAuRatio` en bout de chaîne). Or Mafs
 * (`preserveAspectRatio="contain"`, comportement par défaut, jamais désactivé par ces 6
 * générateurs — un repère cartésien x/y homogène doit rester visuellement non déformé) réagit à un
 * viewBox dont le ratio ne correspond plus exactement à celui du conteneur CSS en élargissant
 * LUI-MÊME l'axe le plus étroit pour compenser — un élargissement SILENCIEUX, non pris en compte
 * par le calcul de clairance ci-dessus, qui révélait à nouveau partiellement la graduation
 * supposée exclue (confirmé empiriquement sur gen49, un caractère résiduel encore visible malgré
 * l'ancrage sur la grille). Fix : réappliquer `ajusterAuRatio` en sortie, exactement comme le fait
 * déjà chaque calculateur de viewBox — l'élargissement de Mafs devient alors un no-op, comme prévu
 * pour l'ensemble de ces graphes. `ajusterAuRatio` ne RÉTRÉCIT jamais l'axe déjà le plus large (il
 * ne fait qu'élargir l'autre, centré) : la clairance déterministe calculée ci-dessus pour l'axe qui
 * détermine le ratio final reste donc exactement celle voulue ; l'autre axe peut recevoir un peu
 * PLUS de marge que le minimum requis, jamais moins — sans danger pour la garantie recherchée.
 *
 * **3ᵉ piège rencontré et corrigé, sur ce même chantier** : `calculerPasGrille` est appelé ici sur
 * l'étendue BRUTE (avant extension), mais `GrilleAdaptative` (le composant qui dessine réellement
 * les graduations, à l'intérieur de `<Mafs>`) appelle cette même fonction sur l'étendue RÉELLEMENT
 * VISIBLE une fois le graphe monté — c'est-à-dire l'étendue déjà étendue par cette fonction-ci
 * (potentiellement encore élargie par `ajusterAuRatio` ci-dessus). Comme `calculerPasGrille` choisit
 * parmi une suite discrète de pas (mantisses 1/2/5 × une puissance de 10), l'extension peut parfois
 * faire franchir à l'étendue un seuil d'arrondi et changer le pas RÉELLEMENT utilisé à l'affichage
 * — invalidant la clairance calculée sur l'ancien pas (confirmé empiriquement : un résidu de
 * rognage subsistait encore sur gen49 après les 2 corrections précédentes, alors que la marge
 * calculée sur le pas brut aurait dû être largement suffisante). Fix : point fixe itératif —
 * recalculer le pas sur le résultat, et si celui-ci diffère du pas utilisé pour le produire, refaire
 * l'extension avec le nouveau pas (toujours depuis les bornes BRUTES d'origine, jamais en ré-étendant
 * un résultat déjà étendu, ce qui diverge). Converge en 1-2 itérations dans la quasi-totalité des cas
 * réels (l'extension elle-même est petite face à l'étendue d'origine) ; plafonné à 4 pour garantir
 * une terminaison même dans un cas pathologique en oscillation.
 *
 * **4ᵉ piège rencontré et corrigé, sur ce même chantier** : même après les 3 correctifs ci-dessus,
 * un rognage RÉSIDUEL À CLAIRANCE EXACTEMENT NULLE subsistait encore sur gen49 (confirmé
 * empiriquement, Playwright — l'étiquette de graduation extrême collée pile sur le bord du cadre,
 * `cy` du texte égal au pixel exact du bord du conteneur, sur plusieurs instances aléatoires
 * différentes). Cause : `ajusterAuRatio` (2ᵉ piège) élargit bien l'axe étroit SANS jamais le
 * rétrécir, mais son recentrage est purement géométrique — centré sur le centre COURANT de cet axe,
 * avec une taille dérivée de l'AUTRE axe, SANS AUCUNE RELATION avec la grille de graduations
 * elle-même (ancrée sur 0, indépendamment du centre des données). La clairance résultante au bord
 * de l'axe élargi retombe donc n'importe où entre 0 et un pas entier, selon la coïncidence entre le
 * centre des données et l'ancrage à 0 de la grille — confirmée à ZÉRO sur un cas reproductible
 * (cercle centré en (13,5), rayon 3 : `{x:[6.25,19.75],y:[0.5,9.5]}` → axe X élargi par
 * `ajusterAuRatio` à `[4,22]`, dont la borne `x=4` tombe EXACTEMENT sur une graduation, clairance
 * nulle). L'axe qui reste INCHANGÉ par `ajusterAuRatio` (jamais celui qui est élargi) garde lui sa
 * clairance déterministe intacte — c'est pourquoi le rognage n'affectait jamais les deux axes à la
 * fois, seulement celui que `ajusterAuRatio` avait recentré. Fix : `elargirAvecClairance` ci-dessus,
 * qui remplace l'appel à `ajusterAuRatio` — élargit l'axe étroit par MULTIPLES ENTIERS de son propre
 * pas (préserve la forme "graduation ± une demi-pas" déjà posée par `etendreBorneVersGraduation`),
 * puis élargit l'axe déjà large par un recentrage simple pour retomber EXACTEMENT sur `RATIO_GRAPHE`
 * (ce second élargissement ne peut, par construction, que conserver ou améliorer la clairance déjà
 * garantie sur cet axe — jamais la réduire, preuve algébrique dans l'en-tête de la fonction). Ce
 * second élargissement passe lui aussi par `etendreBorneVersGraduation` (jamais un recentrage
 * continu brut) : la valeur cible (continue, dérivée du ratio) est ancrée à la graduation la plus
 * proche AU-DELÀ, exactement comme pour l'axe étroit — seule différence, on ne prend le résultat que
 * s'il dépasse déjà l'ancienne borne (`Math.min`/`Math.max` avec la borne d'origine), pour ne jamais
 * la rétrécir non plus.
 *
 * **5ᵉ piège rencontré et corrigé, sur ce même chantier** : `elargirAvecClairance` garantit une
 * clairance correcte sur SA PROPRE sortie, mais le point fixe itératif (3ᵉ piège) peut, dans de
 * rares cas, OSCILLER indéfiniment entre 2 couples `(pasX,pasY)` sans jamais converger (confirmé
 * empiriquement, fuzz-testing sur ~2000 instances de cercles aléatoires : un cas où le pas Y oscille
 * entre 2 et 5 selon que le pas X vient de passer à 5 — l'élargissement de Y en réaction au nouveau
 * pas X change l'étendue Y juste assez pour repasser sous le seuil qui avait fait choisir pas=5,
 * refaisant reboucler indéfiniment). Le plafond à 4 itérations garantit une TERMINAISON, mais
 * l'itération sur laquelle il s'arrête n'est pas forcément celle où `resultat` est cohérent avec son
 * propre pas.
 *
 * **Piège rencontré PENDANT la correction de ce 5ᵉ piège** : une 1re version du filet de sécurité
 * réappliquait INCONDITIONNELLEMENT `etendreBorneVersGraduation` aux 4 bornes du `resultat` final,
 * même quand leur clairance était déjà correcte — `etendreBorneVersGraduation` ne "laisse jamais
 * telle quelle" une borne déjà bien placée, elle réancre TOUJOURS depuis `floor`/`ceil`, ce qui peut
 * élargir une borne déjà sûre d'un pas entier supplémentaire SANS RAISON, faisant à nouveau franchir
 * à l'étendue un seuil d'arrondi de `calculerPasGrille` (même mécanisme que le 3ᵉ piège) — confirmé
 * empiriquement : ce filet de sécurité inconditionnel FAISAIT RÉGRESSER des cas déjà corrects
 * (fuzz-testing passé de 24 à 515 cas défectueux sur 2000). Fix : `assurerClairanceBorne` ci-dessous
 * calcule d'abord la clairance RÉELLE de la borne (distance à la graduation visible la plus proche),
 * et ne la déplace QUE si cette clairance est insuffisante (< 0,4 pas, marge sous le 0,5 nominal pour
 * tolérer l'imprécision flottante) — un no-op strict sur toute borne déjà correcte, qui ne répare
 * donc que le cas pathologique réel (oscillation du point fixe) sans jamais perturber un cas déjà
 * convergé proprement.
 *
 * **Dernier détail** : réparer une borne change à son tour l'étendue de cet axe, ce qui peut à
 * nouveau faire franchir à `calculerPasGrille` un seuil d'arrondi (même mécanisme, un niveau plus
 * bas) — confirmé empiriquement (un premier passage UNIQUE de `assurerClairanceBorne` laissait
 * encore 16/2000 cas fuzzés en défaut, la réparation elle-même recalculée avec le nouveau pas
 * révélant qu'elle ne l'était pas assez). Fix : le filet de sécurité se réapplique en boucle
 * (recalcul du pas depuis l'étendue COURANTE à chaque passage), plafonné à 4 itérations pour la
 * même raison de terminaison que la boucle principale — `assurerClairanceBorne` étant un no-op strict
 * dès que la clairance est suffisante, la boucle s'arrête dès que les 2 axes sont stables (observé en
 * 1-2 passages dans l'immense majorité des cas, jamais plus de 3 sur l'ensemble du fuzz-testing).
 * Vérifié empiriquement (Playwright, PC+mobile, sur les 6 générateurs concernés par l'audit ; et
 * fuzz-testing ad hoc sur ~2000 instances aléatoires de gen49 avant/après ce dernier correctif — 0
 * cas défectueux restant).
 *
 * **9ᵉ piège rencontré, PARTIELLEMENT corrigé, sur ce même chantier** : `0,4 pas` est une clairance
 * exprimée en UNITÉS DE DONNÉES — sa traduction en pixels réels dépend de l'échelle
 * (`largeurPixels / xSpan`). Pour les 5 générateurs qui partagent `RATIO_GRAPHE` (1,5) et
 * `CIBLE_NOMBRE_LIGNES` (10), l'échelle observée en pratique reste toujours assez généreuse pour que
 * `0,4 pas` couvre confortablement la demi-hauteur d'une étiquette (~9-12px) — vérifié
 * empiriquement, jamais un seul cas résiduel sur les 5. `BoiteMoustachesGraph.tsx` (gen36), avec son
 * ratio bien plus plat (2,4 à 3,6) et sa cible de lignes réduite (6), montre sur mobile un résidu de
 * quelques pixels (~2-3px) dans une fraction des tirages aléatoires. **Piste explorée et
 * ABANDONNÉE** : convertir le seuil en pixels réels (`largeurPixels` transmis en cascade, seuil
 * `PIXEL_CLAIRANCE_MIN / pixelsParUnite`) semblait la correction naturelle, mais élargir l'ÉTENDUE DE
 * DONNÉES pour gagner de la clairance PIXEL est contre-productif à conteneur pixel FIXE : plus
 * l'étendue de données grandit, plus `pixelsParUnite` (= `largeurPixels / étendue`) RÉTRÉCIT, ce qui
 * ne fait qu'agrandir le besoin en unités de données pour le MÊME nombre de pixels — une boucle de
 * rétroaction positive, confirmée en pratique par une divergence réelle du point fixe ratio/clairance
 * (valeurs explosant jusqu'à 10^41 sur un cas de test dédié, plafond d'itérations bien dépassé) plutôt
 * qu'une simple lenteur de convergence. Le seul point fixe stable pour CE problème est celui déjà en
 * place (fraction constante de `pas`, jamais un budget pixel absolu) — abandonné, code non conservé.
 * Le résidu mobile de gen36 (quelques pixels, une fraction des tirages) reste donc en l'état :
 * documenté ici comme limite connue plutôt que "corrigé", pour qu'un futur correctif parte de cette
 * investigation plutôt que de la refaire (la vraie solution demanderait probablement une cible de
 * lignes ADAPTATIVE à la taille réelle du conteneur, hors du périmètre de cette fonction pure — elle
 * ne connaît la géométrie, jamais les pixels).
 *
 * **10ᵉ piège rencontré et corrigé** (régression réelle en production, diagnostiquée puis corrigée
 * dans deux sessions séparées) : `elargirAvecClairance` (ci-dessous) appelait par erreur
 * `etendreBorneVersGraduation` — l'ancrage grille réservé à l'axe ÉTROIT — sur l'axe déjà large
 * lui aussi, alors que le commentaire de cette fonction décrit explicitement un "recentrage simple,
 * jamais grid-anchoré" pour cet axe-là. `etendreBorneVersGraduation` ne renvoie jamais une valeur
 * proche de son entrée : elle saute systématiquement à la graduation entière suivante puis recule
 * d'un demi-pas. Avec un pas fin (`RATIO_GRAPHE`/`CIBLE_NOMBRE_LIGNES` par défaut, la quasi-totalité
 * des appelants), l'écart entre la correction exacte et la borne déjà grid-ancrée reste minuscule
 * face au pas, donc ce saut de trop passait inaperçu. Avec un pas grossier ET un ratio plat
 * (`BoiteMoustachesGraph.tsx` seul consommateur : `cibleNombreLignes=6`, `ratio` 2,4-3,6), ce même
 * saut ajoute presque un pas ENTIER de trop de chaque côté ; la boucle à point fixe englobante
 * (jusqu'à 4 itérations) recalcule ensuite le pas sur cette largeur déjà gonflée — `calculerPasGrille`
 * choisit alors un pas encore plus grossier — et l'effet se compose à chaque tour, jusqu'à une
 * largeur d'axe 40 à 70 fois trop grande (confirmé numériquement : `x:[11.8,26.2]`, largeur 14,4,
 * devenait `x:[-350,289.5]`, largeur 639,5, écrasant les 5 marqueurs près de l'origine). Fix :
 * remplacer les deux appels à `etendreBorneVersGraduation` sur l'axe large par un recentrage simple
 * (`centre ± demi-mesure-exacte`, sans ancrage grille) — exactement ce que le commentaire de la
 * fonction décrivait déjà. Sûr par construction : cet axe garde le `Math.min`/`Math.max` avec sa
 * borne déjà grid-ancrée (calculée en amont, avant l'appel à `elargirAvecClairance`) — la clairance
 * ne peut donc jamais redescendre sous ce plancher — et toute clairance insuffisante sur le nouveau
 * bord recentré (non grid-ancré) est de toute façon réparée par `assurerClairanceBorne` dans la
 * boucle englobante (6ᵉ piège), qui ne bouge une borne que si sa clairance réelle est insuffisante,
 * jamais inconditionnellement.
 *
 * **11ᵉ piège rencontré et corrigé, découvert en vérifiant le 10ᵉ ci-dessus** : le filet de sécurité
 * qui répare une clairance insuffisante (juste en-dessous, `assurerClairanceBorne`) appelait lui
 * aussi `etendreBorneVersGraduation` pour la réparation — même défaut de fond que le 10ᵉ piège
 * (saut disproportionné pour un pas grossier), mais ici la fonction s'applique aux DEUX axes
 * indifféremment (pas seulement l'axe large), donc le correctif du 10ᵉ piège ne le couvre pas.
 * `etendreBorneVersGraduation(borne, pas, direction)` re-dérive sa propre graduation par
 * `floor`/`ceil` DEPUIS `borne` : pour une borne qui n'a presque plus de clairance (cas déclenchant
 * la réparation), cette graduation redérivée est systématiquement celle D'ENCORE PLUS LOIN que la
 * graduation réellement à risque de rognage (celle que la clairance ci-dessus mesure déjà —
 * `graduationVisible`) — la réparation saute donc par-dessus une graduation entière supplémentaire
 * avant de reculer d'un demi-pas, un surcroît proche d'un pas ENTIER à chaque déclenchement. Avec le
 * pas fin par défaut (`RATIO_GRAPHE`/`CIBLE_NOMBRE_LIGNES`), ce filet ne se déclenche quasiment
 * jamais (clairance déjà suffisante par construction sur ces 5 générateurs, confirmé par le
 * fuzz-testing des 5ᵉ/6ᵉ pièges) donc l'écart passait inaperçu. Avec le pas grossier de
 * `BoiteMoustachesGraph.tsx` (`cibleNombreLignes=6`) ET son ratio plat, le recentrage simple du 10ᵉ
 * piège (précisément parce qu'il n'est plus grid-ancré) atterrit régulièrement à une clairance
 * insuffisante — déclenchant CE filet à chaque tour, dont le surcroît regonfle l'étendue assez pour
 * faire remonter `calculerPasGrille` à un pas encore plus grossier au tour suivant, qui regonfle à
 * son tour l'axe élargi par `ajusterAuRatio` pour rester au ratio cible — la même composition en
 * boucle que le 10ᵉ piège, un niveau plus haut (confirmé numériquement, exemple diagnostic
 * `min=14,Q1=16,Q2=19,Q3=22,max=24`, mode 2 lignes : le 10ᵉ piège seul ramenait déjà la largeur X de
 * 1200 à 165 — bien mieux, mais encore ~10× la largeur brute 16,8 — CE piège-ci la ramène ensuite à
 * 70, un multiple cohérent avec le nombre de graduations cible plutôt qu'un emballement). Fix :
 * réutiliser `graduationVisible` (déjà calculée pour mesurer la clairance, donc DÉJÀ la graduation
 * réellement à risque) comme ancre de la réparation, au lieu de la redériver plus loin — la borne
 * réparée devient `graduationVisible + direction·0,5·pas`, la même forme "graduation ± demi-pas"
 * qu'avant (aucune perte de la garantie de clairance nominale visée), simplement ancrée sur la bonne
 * graduation. Toujours monotone (ne rétrécit jamais) : le déclenchement exige `clairance < 0,4·pas`,
 * donc `borne` est toujours strictement au-delà de `graduationVisible − 0,5·pas` (0,4 < 0,5), la
 * borne réparée reste donc toujours au moins aussi étendue que `borne` — preuve algébrique identique
 * en forme à celle déjà établie pour `elargirAvecClairance`. Neutre pour les 5 autres générateurs
 * dans tous les cas déjà couverts par le fuzz-testing des 5ᵉ/6ᵉ pièges (ce filet ne s'y déclenche
 * quasiment jamais) et strictement moins généreux qu'avant seulement dans le cas rare où il se
 * déclencherait malgré tout — jamais moins que la clairance nominale de 0,5 pas réellement requise.
 *
 * **13ᵉ piège rencontré PENDANT `promptcorrectioninstabiliteratioboitemoustaches.md` (cause 2),
 * PARTIELLEMENT corrigé — cette boucle (`assurerClairanceBorne` alterné avec `ajusterAuRatio`)
 * reste, elle aussi, dépendante de la position** : `assurerClairanceBorne` ne répare QUE si LA borne
 * considérée (une valeur absolue issue du recentrage géométrique de `ajusterAuRatio`, jamais
 * grid-ancré) tombe par hasard trop près d'une graduation — un hasard qui dépend de la position, pas
 * seulement de l'étendue (confirmé numériquement : 2 centres différant de 2 unités, largeur combinée
 * strictement identique en ENTRÉE de cette boucle — déjà garanti par le 12ᵉ piège ci-dessus —, en
 * ressortaient avec des largeurs différentes, 30 puis 36,65, mode 2 lignes).
 *
 * **Piste explorée et ABANDONNÉE** : remplacer l'alternation `ajusterAuRatio` + réparation
 * CONDITIONNELLE par un élargissement grid-safe INCONDITIONNEL de l'axe à rattraper (même
 * construction "largeur indépendante de la position" que `etendreLargeurVersGraduation`) semblait la
 * correction naturelle — mais provoque une DIVERGENCE réelle : l'extension grid-safe dépasse
 * toujours la largeur cible exacte (par construction, piège 12), donc casse le ratio à CHAQUE
 * passage, obligeant l'axe opposé à s'élargir à son tour pour compenser — via la MÊME extension
 * généreuse, qui casse le ratio de nouveau, un peu plus large cette fois. `calculerPasGrille`
 * recalculé sur cette largeur déjà gonflée choisit alors un pas encore plus grossier (même
 * mécanisme que les 3ᵉ/10ᵉ/11ᵉ pièges), qui gonfle l'extension suivante d'autant plus — confirmé
 * empiriquement (fuzz-testing existant du 6ᵉ piège, cas `x:[0,10],y:[0,10]` : le pas double à
 * chaque tour au lieu de se stabiliser, la boîte finale atteint 1200×1000 unités au lieu de ~15×10,
 * plafond de 20 itérations atteint sans converger). Abandonné, code non conservé — la réparation
 * CONDITIONNELLE et minimale de `assurerClairanceBorne` (un nudge borné, jamais une ré-extension
 * généreuse depuis zéro) est ce qui rend cette boucle stable ; la remplacer par quelque chose de plus
 * généreux casse cette stabilité, quelle que soit la construction utilisée pour rester
 * "indépendante de la position".
 *
 * Le résidu de dépendance à la position dans CETTE boucle reste donc en l'état, documenté ici comme
 * limite connue (même posture que le 9ᵉ piège) — substantiellement réduit par le 12ᵉ piège (qui
 * élimine la source DOMINANTE, jusqu'à ×1,6 sur l'exemple de diagnostic d'origine) mais pas éliminé
 * pour le mode 2 lignes, où un résidu plus modeste (~20% observé) subsiste selon la position exacte.
 */
function assurerClairanceBorne(borne: number, pas: number, direction: -1 | 1): number {
  const graduationVisible = direction < 0 ? Math.ceil(borne / pas) * pas : Math.floor(borne / pas) * pas;
  const clairance = direction < 0 ? graduationVisible - borne : borne - graduationVisible;
  if (clairance >= pas * 0.4) return borne;
  return graduationVisible + direction * pas * FRACTION_CLAIRANCE_ETIQUETTE;
}

/**
 * `cibleNombreLignes?` (prop additive optionnelle, `promptcorrectionmafslabelsgen13.md`, suite du
 * chantier) — répercutée telle quelle sur `calculerPasGrille` à chaque appel interne, exactement
 * comme `GrilleAdaptative` (`components/mafsGraphPartage.tsx`) la répercute sur SES propres appels.
 *
 * **7ᵉ piège rencontré et corrigé, sur ce même chantier** : absente, cette fonction calculait
 * TOUJOURS son pas de clairance avec la cible PAR DÉFAUT (`CIBLE_NOMBRE_LIGNES=10`) — alors que
 * `BoiteMoustachesGraph.tsx` (gen36) appelle `GrilleAdaptative` avec `cibleNombreLignes={
 * CIBLE_NOMBRE_LIGNES_BOITE}` (6, `ui/boiteMoustachesGraph.ts` — moins de lignes pour laisser plus de
 * place aux étiquettes à grandes valeurs, ex. un kilométrage). Un pas RÉELLEMENT plus grand à
 * l'affichage (moins de lignes ⇒ pas plus large) que celui utilisé pour calculer la clairance de
 * cette fonction invalide la marge prévue — confirmé empiriquement (Playwright, gen36 uniquement
 * parmi les 6 générateurs : seul consommateur à passer un `cibleNombreLignes` non standard à
 * `GrilleAdaptative`, voir grep exhaustif des 6 appels dans les composants). Absente/`undefined`
 * pour les 5 autres générateurs (comportement historique bit pour bit inchangé, seul appelant à la
 * fournir : `BoiteMoustachesGraph.tsx`).
 *
 * `ratio?` (prop additive optionnelle, même chantier) — répercuté sur les 2 appels `ajusterAuRatio`
 * internes (directement et via `elargirAvecClairance`), par défaut `RATIO_GRAPHE`. **8ᵉ piège
 * rencontré et corrigé, sur ce même chantier** : `BoiteMoustachesGraph.tsx` (gen36) n'utilise PAS
 * `RATIO_GRAPHE` — sa propre géométrie (`calculerViewBoxBoiteMoustaches`, `ui/boiteMoustachesGraph.ts`)
 * est ratio-ajustée via `ratioGraphe(nombreLignes)` (3,6 ou 2,4, délibérément "plus large/plat" qu'une
 * boîte à moustaches ne serait avec `RATIO_GRAPHE`, voir la doc de `ratioGraphe`), et `<Mafs
 * width/height>` de ce même composant utilise CE ratio (jamais `RATIO_GRAPHE`) pour dériver `hauteur`
 * de `largeur`. Avant ce correctif, cette fonction verrouillait TOUJOURS le ratio final sur
 * `RATIO_GRAPHE` en dur (piège 6) — une valeur DIFFÉRENTE de celle qu'attend réellement le conteneur
 * CSS/Mafs de gen36, rouvrant exactement le 2ᵉ piège pour ce seul générateur (le `preserveAspectRatio
 * === "contain"` de Mafs, constatant un vrai désaccord de ratio cette fois, réélargit lui-même sans
 * notre garde de clairance). Absent/`undefined` pour les 5 autres générateurs (`RATIO_GRAPHE` par
 * défaut, comportement historique bit pour bit inchangé).
 */
export function etendreViewBoxPourEtiquettes(
  viewBox: { x: [number, number]; y: [number, number] },
  cibleNombreLignes?: number,
  ratio: number = RATIO_GRAPHE,
  cibleNombreLignesY?: number,
  mantissesPersonnalisees?: number[],
): {
  x: [number, number];
  y: [number, number];
} {
  const cibleY = cibleNombreLignesY ?? cibleNombreLignes;
  let pasX = calculerPasGrille(viewBox.x[1] - viewBox.x[0], cibleNombreLignes, mantissesPersonnalisees);
  let pasY = calculerPasGrille(viewBox.y[1] - viewBox.y[0], cibleY);
  let resultat: { x: [number, number]; y: [number, number] } = { x: viewBox.x, y: viewBox.y };
  for (let iteration = 0; iteration < 4; iteration++) {
    const etendu = {
      x: etendreLargeurVersGraduation(viewBox.x[0], viewBox.x[1], pasX),
      y: etendreLargeurVersGraduation(viewBox.y[0], viewBox.y[1], pasY),
    };
    resultat = elargirAvecClairance(etendu.x, etendu.y, pasX, pasY, ratio);
    const pasXSuivant = calculerPasGrille(resultat.x[1] - resultat.x[0], cibleNombreLignes, mantissesPersonnalisees);
    const pasYSuivant = calculerPasGrille(resultat.y[1] - resultat.y[0], cibleY);
    if (pasXSuivant === pasX && pasYSuivant === pasY) break;
    pasX = pasXSuivant;
    pasY = pasYSuivant;
  }
  // `elargirAvecClairance` élargit l'axe étroit par PAS ENTIERS (grid-safe) puis l'axe déjà large
  // par un recentrage snappé lui aussi (voir sa doc) — le ratio final n'est donc plus forcément
  // EXACTEMENT `RATIO_GRAPHE` (contrairement à l'ancien `ajusterAuRatio` seul, piège 4).
  //
  // **6ᵉ piège rencontré et corrigé, sur ce même chantier** : un ratio final non EXACTEMENT égal à
  // `RATIO_GRAPHE`, même très proche, laisse le `preserveAspectRatio === "contain"` de Mafs se
  // déclencher réellement à l'affichage (jamais désactivé sur ces 6 générateurs) — et son propre
  // élargissement, en aval, n'est PAS soumis à notre garde de clairance : confirmé par un
  // fuzz-testing dédié qui SIMULE ce dernier élargissement (`ajusterAuRatio` réappliqué sur notre
  // propre sortie, reproduisant fidèlement `MafsCanvas`) — jusqu'à 5533/20000 cas défectueux si le
  // ratio qu'on lui transmet n'est qu'approximatif.
  //
  // `ajusterAuRatio` (exact, mais peut re-abîmer la clairance d'un bord, piège 4) et
  // `assurerClairanceBorne` (grid-safe, mais peut re-casser le ratio exact) sont deux opérateurs qui
  // se contredisent en une seule passe chacun — mais TOUS LES DEUX sont strictement MONOTONES
  // (n'élargissent jamais, ne rétrécissent jamais — preuves algébriques dans leurs en-têtes
  // respectifs) : la suite de boîtes produite en les ALTERNANT ne peut donc que CROÎTRE (ou rester
  // stable), jamais osciller entre 2 tailles distinctes comme au 5ᵉ piège (qui alternait, lui, entre
  // 2 valeurs de PAS sans jamais élargir la boîte elle-même). Boucle jusqu'au point fixe RÉEL — ratio
  // EXACT *et* clairance suffisante *simultanément*, vérifiées ensemble à chaque tour (jamais l'une
  // sans l'autre, piège rencontré dans une version intermédiaire où un unique passage `ajusterAuRatio`
  // final, non suivi d'une réparation, laissait passer un cas à clairance quasi nulle — confirmé par
  // fuzz-testing sur de vraies instances de gen49). Plafonnée à 20 itérations par prudence (jamais
  // atteint en pratique sur l'ensemble du fuzz-testing, ~2-4 tours dans l'immense majorité des cas) ;
  // si la boîte devait malgré tout continuer de croître sans jamais se stabiliser, la dernière itération
  // reste tout de même garantie grid-safe (elle vient de passer par `assurerClairanceBorne`), seul le
  // ratio pourrait alors ne pas être parfaitement exact — un compromis sûr par construction (jamais
  // l'inverse : la clairance ne serait exposée sans garantie).
  //
  // Résidu de dépendance à la position dans cette boucle, exploré et documenté (13ᵉ piège
  // ci-dessus) — la réparation conditionnelle de `assurerClairanceBorne` reste la version stable
  // (une alternative inconditionnelle/grid-safe diverge, voir ce même piège).
  for (let iteration = 0; iteration < 20; iteration++) {
    const avecRatioExact = ajusterAuRatio(resultat.x, resultat.y, ratio);
    const pasXFinal = calculerPasGrille(avecRatioExact.x[1] - avecRatioExact.x[0], cibleNombreLignes, mantissesPersonnalisees);
    const pasYFinal = calculerPasGrille(avecRatioExact.y[1] - avecRatioExact.y[0], cibleY);
    const repare: { x: [number, number]; y: [number, number] } = {
      x: [assurerClairanceBorne(avecRatioExact.x[0], pasXFinal, -1), assurerClairanceBorne(avecRatioExact.x[1], pasXFinal, 1)],
      y: [assurerClairanceBorne(avecRatioExact.y[0], pasYFinal, -1), assurerClairanceBorne(avecRatioExact.y[1], pasYFinal, 1)],
    };
    const stable =
      repare.x[0] === avecRatioExact.x[0] &&
      repare.x[1] === avecRatioExact.x[1] &&
      repare.y[0] === avecRatioExact.y[0] &&
      repare.y[1] === avecRatioExact.y[1];
    resultat = repare;
    if (stable) return avecRatioExact;
  }
  return resultat;
}

/**
 * **14ᵉ piège rencontré et corrigé, sur ce même chantier** (`promptcorrectioninstabiliteratioboite
 * moustaches.md`, suite — retour utilisateur : la boîte à moustaches de gen36 restait visuellement
 * minuscule malgré 2 correctifs successifs de `ratioGraphe`/`DEMI_HAUTEUR_BOITE`) : étend UNIQUEMENT
 * X pour la clairance d'étiquette (même mécanisme, même garantie de position-indépendance, que le
 * 1ᵉʳ palier de `etendreViewBoxPourEtiquettes` ci-dessus — `etendreLargeurVersGraduation`), puis
 * verrouille Y **PUREMENT par le ratio** (`largeurX / ratio`, centré sur le centre Y d'origine) —
 * jamais grid-ancré, jamais passé par `elargirAvecClairance`/`assurerClairanceBorne`/`ajusterAuRatio`
 * en boucle comme le fait `etendreViewBoxPourEtiquettes`.
 *
 * Pourquoi c'est sûr ICI mais pas pour les 5 autres consommateurs : `etendreViewBoxPourEtiquettes`
 * grid-ancre les DEUX axes parce que les DEUX peuvent afficher une étiquette numérique qu'il ne faut
 * jamais rogner (piège d'origine, `promptcorrectionmafslabelsgen13.md`). Sur `BoiteMoustachesGraph.tsx`
 * (seul appelant de cette fonction), l'axe Y n'est JAMAIS qu'un séparateur de ligne — ses étiquettes
 * numériques sont désormais masquées (`GrilleAdaptative`, prop `masquerEtiquettesY`, voir sa doc) : il
 * n'y a plus aucune étiquette Y à protéger d'un rognage, donc plus aucune raison de faire subir à Y le
 * même luxe (coûteux) de grid-ancrage que X. Bénéfice direct, mesuré : la boîte elle-même
 * (`DEMI_HAUTEUR_BOITE`, `ui/boiteMoustachesGraph.ts`) peut désormais occuper une fraction bien plus
 * grande de la hauteur Y finale (celle-ci n'étant plus gonflée par la clairance de grille Y, qui
 * dominait largement — voir l'historique de `DEMI_HAUTEUR_BOITE` pour les mesures avant/après) — et,
 * bénéfice collatéral, le résidu de dépendance à la position resté connu et borné pour le mode 2
 * lignes/comparaison (13ᵉ piège, ~20%) disparaît lui aussi entièrement : plus aucun couplage X↔Y dans
 * cette fonction, donc plus aucun mécanisme par lequel la position de Y pourrait influencer la largeur
 * finale de X (ou réciproquement).
 *
 * Risque écarté : un ratio final non EXACTEMENT égal à `ratio` rouvrirait le 6ᵉ piège
 * (`preserveAspectRatio === "contain"` de Mafs réélargissant sans notre garde) — ici exclu par
 * construction, `hauteurY` étant calculée directement comme `largeurX / ratio`, jamais approximée.
 */
export function etendreLargeurXPourEtiquettes(
  viewBox: { x: [number, number]; y: [number, number] },
  cibleNombreLignes: number | undefined,
  ratio: number = RATIO_GRAPHE,
  mantissesPersonnalisees?: number[],
): {
  x: [number, number];
  y: [number, number];
} {
  let pasX = calculerPasGrille(viewBox.x[1] - viewBox.x[0], cibleNombreLignes, mantissesPersonnalisees);
  let etenduX: [number, number] = viewBox.x;
  for (let iteration = 0; iteration < 4; iteration++) {
    etenduX = etendreLargeurVersGraduation(viewBox.x[0], viewBox.x[1], pasX);
    const pasXSuivant = calculerPasGrille(etenduX[1] - etenduX[0], cibleNombreLignes, mantissesPersonnalisees);
    if (pasXSuivant === pasX) break;
    pasX = pasXSuivant;
  }
  const centreY = (viewBox.y[0] + viewBox.y[1]) / 2;
  const demiHauteurY = (etenduX[1] - etenduX[0]) / ratio / 2;
  return { x: etenduX, y: [centreY - demiHauteurY, centreY + demiHauteurY] };
}

/** Fraction de l'étendue d'un axe ajoutée comme marge, lorsque cet axe ne contient pas déjà 0, pour
 * amener 0 dans le cadre visible tout en le gardant à bonne distance du bord (jamais collé dessus,
 * ce qui masquerait l'axe/son étiquette derrière le bord du viewBox). */
const MARGE_FRACTION_ORIGINE = 0.15;
/** Plancher absolu de cette marge (unités de données) — sans lui, un axe déjà très resserré (ex.
 * `xMax-xMin` proche de 0) produirait une marge quasi nulle, donc un axe/étiquette collé au bord. */
const MARGE_PLANCHER_ORIGINE = 0.3;

/** Étend `[min,max]` pour que 0 y soit inclus — no-op si c'est déjà le cas. Utilisée pour garantir
 * qu'un axe cartésien (x=0 ou y=0, dessiné par `GrilleAdaptative`/`Coordinates.Cartesian` via son
 * option `axis`) reste TOUJOURS visible même quand la fenêtre de données ne l'inclut pas
 * naturellement — Mafs ne dessine la ligne d'axe QUE dans l'intervalle de données réellement
 * couvert par le viewBox (`node_modules/mafs/build/index.js`, `xAxisEnabled && xAxis.axis`), donc
 * une fenêtre entièrement `>0` (ex. domaine `x>0` d'une fonction logarithme) ou entièrement décalée
 * (ex. fenêtre centrée loin de 0) ne montre tout simplement AUCUNE ligne d'axe sur cet axe-là, quel
 * que soit le réglage de `GrilleAdaptative` — jamais un problème de couleur/épaisseur, un problème
 * de PRÉSENCE dans le viewBox. N'élargit jamais le bord déjà du bon côté de 0 (seul le bord le plus
 * proche de 0 bouge), pour perturber le moins possible le cadrage déjà soigneusement calculé par
 * l'appelant (bornes par famille, plafonds de magnitude, etc.). */
function etendreVersOrigine(min: number, max: number): [number, number] {
  if (min <= 0 && max >= 0) return [min, max];
  const marge = Math.max(MARGE_PLANCHER_ORIGINE, (max - min) * MARGE_FRACTION_ORIGINE);
  if (min > 0) return [-marge, max];
  return [min, marge];
}

/**
 * `promptaugmentedensitegraphesqcm.md` : garantit que les DEUX axes (x=0 et y=0) tombent dans le
 * viewBox retourné — appliquée en bout de chaîne par les 5 `calculerViewBoxXxx`/`calculerViewBox`
 * des graphes "QCM à options graphiques" du chantier 6e (`ui6e/formatGraphiquesCyclometriques.ts`
 * et les 4 fichiers `ui6e/format*.ts` frères), dont plusieurs familles cadrent une fenêtre entière-
 * ment `x>0` (domaine d'une fonction logarithme) ou décalée loin de l'origine (fenêtre centrée sur
 * un paramètre `p` de l'exercice, sans lien garanti avec 0) — dans ces cas, l'axe correspondant
 * n'apparaissait tout simplement PAS sur les 4 candidats empilés, retour utilisateur "mets les axes
 * X et Y". Additive et générique (aucune dépendance à un générateur précis) : un no-op strict sur
 * tout viewBox qui contient déjà 0 sur les deux axes (le cas de la plupart des graphes 4e/5e, jamais
 * affectés par cet appel s'ils l'utilisaient). N'affecte jamais l'équité entre les 4/6 candidats
 * d'une instance QCM : la fenêtre est déjà calculée IDENTIQUE pour tous avant cet appel (jamais
 * dérivée du seul candidat réel), cette fonction ne fait que l'élargir d'un côté, toujours de la
 * même façon pour tous.
 */
export function assurerAxesVisibles(viewBox: ViewBoxTransformation): ViewBoxTransformation {
  const [xMin, xMax] = etendreVersOrigine(viewBox.x[0], viewBox.x[1]);
  const [yMin, yMax] = etendreVersOrigine(viewBox.y[0], viewBox.y[1]);
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

/**
 * `prompt-audit-graduations-flottantes-mafs.md` : valeurs de graduation (multiples de `pas`) dans
 * `[min,max]`, en excluant 0 — même filtre EXACT que Mafs lui-même (`XLabels`/`YLabels`,
 * `node_modules/mafs/build/index.js` : `snappedRange(...).filter(v => Math.abs(v) > separation/1e6)`)
 * pour que le remplacement "flottant" (`GraduationsFlottantes`, `components/mafsGraphPartage.tsx` +
 * son pendant 5e) reste un remplacement fidèle, jamais un doublon de "0" à l'intersection des 2 axes
 * quand l'origine est visible. Générée par INDEX ENTIER (`k*pas`) plutôt que par accumulation
 * (`v += pas`) : élimine toute dérive flottante sur une plage large (même piège que documenté sur
 * `snappedRange`/`arrondirPasGrille` ailleurs dans ce fichier).
 */
export function graduationsDansPlage(min: number, max: number, pas: number): number[] {
  if (!Number.isFinite(pas) || pas <= 0 || !Number.isFinite(min) || !Number.isFinite(max)) return [];
  const kMin = Math.ceil(min / pas - 1e-9);
  const kMax = Math.floor(max / pas + 1e-9);
  const valeurs: number[] = [];
  for (let k = kMin; k <= kMax; k++) {
    if (k === 0) continue;
    valeurs.push(k * pas);
  }
  return valeurs;
}

/**
 * `prompt-audit-graduations-flottantes-mafs.md` : position ÉCRAN (pixel LOCAL, avant ajout de
 * l'origine du viewBox courant — voir `domaineVisibleAxe` ci-dessus pour cette même convention
 * "pixel écran" vs "pixel local") où placer la ligne de graduations chiffrées d'un axe — `position`
 * est le pixel écran de l'axe RÉEL (peut être hors de `[0,taille]` si l'axe est actuellement hors
 * cadre). Comportement façon GeoGebra : tant que l'axe reste dans le cadre (à `marge` près de
 * chaque bord), la ligne de nombres RESTE sur l'axe réel (résultat = `position`, comportement natif
 * historique inchangé) ; dès qu'il en sort, elle se fige sur le bord le plus proche (`marge` en
 * pixels depuis ce bord, jamais collée littéralement au bord du cadre). `taille <= 2*marge`
 * (graphe minuscule) : retombe sur le centre plutôt que 2 bornes qui se chevaucheraient.
 */
export function positionEcranClampee(position: number, taille: number, marge: number): number {
  if (taille <= 2 * marge) return taille / 2;
  if (position < marge) return marge;
  if (position > taille - marge) return taille - marge;
  return position;
}
