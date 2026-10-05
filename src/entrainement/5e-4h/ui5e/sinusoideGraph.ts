/**
 * Couche présentation (5e) — géométrie pure du graphe de 5gen9 (`ParametresSinusoideBase`, partagé
 * avec 5gen8). `src/ui5e/` peut importer `src/generateurs5e/` (précédent déjà établi : 5gen4/5gen5
 * — voir `ScenarioAGraph.tsx`/`CourbeGraph.tsx`) — réutilise donc directement l'arithmétique exacte
 * de `rationnelPi.ts` pour les graduations de l'axe X (seul endroit qui a besoin d'une notation
 * EXACTE en π ; les points/le viewBox eux-mêmes ne sont que des nombres flottants, largement assez
 * précis pour un tracé Mafs).
 *
 * Repères tous les QUART DE PÉRIODE (`T/4`) à partir de φ : à x=φ+k·(T/4), l'argument du sinus vaut
 * k·π/2, donc sin ∈ {0,1,0,-1} pour k≡0,1,2,3 (mod 4) — un repère "propre" par construction, sans
 * jamais résoudre d'équation. Le TYPE de chaque repère (max/min/passage ascendant/descendant)
 * dépend du signe de A (voir `typeLandmark`) — la spec 5gen9 définit φ comme "position du premier
 * passage ASCENDANT", ce qui n'est vrai à x=φ QUE si A>0 : si A<0, le passage ascendant le plus
 * proche de φ est en réalité φ+T/2 (voir `xAscendantPrincipal`).
 */
import type { ParametresSinusoideBase } from "../core5e/parametresSinusoide.types";
import type { RationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";
import { additionnerRationnelPi, diviserParEntier, multiplierParEntier, reduireRationnelPi, valeurNumerique } from "../generateurs5e/parametresSinusoide/rationnelPi";
import type { PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import { RATIO_GRAPHE, ajusterAuRatio } from "../ui/mafsTransformation";

export type TypePointCle = "max" | "min" | "ascendant" | "descendant";

export interface PointCleSinusoide {
  x: number;
  y: number;
  type: TypePointCle;
}

/** Couvre 2,5 périodes (`(K_MAX-K_MIN)/4`), toujours ≥ 2 périodes complètes avec une marge de
 * lecture de part et d'autre (spec : "au moins 2 cycles complets... deux maxima consécutifs et au
 * moins un passage ascendant... simultanément"). */
const K_MIN = -1;
const K_MAX = 9;

export function valeurAmplitudeSignee(exercice: ParametresSinusoideBase): number {
  const { A } = exercice;
  const magnitude = A.rationnelle ? A.rationnelle.numerateur / A.rationnelle.denominateur : Math.sqrt(A.radicande!);
  return A.signe * magnitude;
}

export function quartPeriode(exercice: ParametresSinusoideBase): RationnelPi {
  return diviserParEntier(exercice.T, 4);
}

/** Position EXACTE (RationnelPi) du k-ième repère : φ + k·(T/4). */
export function positionLandmark(exercice: ParametresSinusoideBase, k: number): RationnelPi {
  return additionnerRationnelPi(exercice.phi, multiplierParEntier(quartPeriode(exercice), k));
}

function typeLandmark(k: number, A: number): TypePointCle {
  const m = ((k % 4) + 4) % 4;
  if (m === 0) return A > 0 ? "ascendant" : "descendant";
  if (m === 1) return A > 0 ? "max" : "min";
  if (m === 2) return A > 0 ? "descendant" : "ascendant";
  return A > 0 ? "min" : "max";
}

export function pointsCles(exercice: ParametresSinusoideBase): PointCleSinusoide[] {
  const A = valeurAmplitudeSignee(exercice);
  const { b } = exercice;
  const points: PointCleSinusoide[] = [];
  for (let k = K_MIN; k <= K_MAX; k++) {
    const m = ((k % 4) + 4) % 4;
    const y = m === 0 || m === 2 ? b : m === 1 ? b + A : b - A;
    points.push({ x: valeurNumerique(positionLandmark(exercice, k)), y, type: typeLandmark(k, A) });
  }
  return points;
}

/** Toutes les positions X de graduation (exactes, pour l'étiquette de chaque tick), K_MIN à K_MAX. */
export function positionsTicksX(exercice: ParametresSinusoideBase): RationnelPi[] {
  const positions: RationnelPi[] = [];
  for (let k = K_MIN; k <= K_MAX; k++) positions.push(positionLandmark(exercice, k));
  return positions;
}

export function viewBoxX(exercice: ParametresSinusoideBase): [number, number] {
  return [valeurNumerique(positionLandmark(exercice, K_MIN)), valeurNumerique(positionLandmark(exercice, K_MAX))];
}

/** Toujours 1 (amplitude entière) ou 0.5 (amplitude demi-entière) — l'amplitude est TOUJOURS
 * rationnelle sur ce générateur (voir `generateurs5e/parametresSinusoideGraphique/index.ts`). */
export function pasAxeY(exercice: ParametresSinusoideBase): number {
  return 1 / (exercice.A.rationnelle?.denominateur ?? 1);
}

/** `pasAxeY` ci-dessus, sous forme `RationnelPi` EXACTE (`degrePi:0`, l'axe Y n'est jamais en
 * radians) — unité atomique du quadrillage Y adaptatif (`calculerPasAdaptatifRationnelPi`,
 * `ui5e/grilleSinusoide.ts`), qui a besoin de la fraction exacte plutôt que du flottant `pasAxeY`
 * pour ne jamais introduire de bruit de virgule flottante dans la légende affichée. */
export function pasAxeYRationnelPi(exercice: ParametresSinusoideBase): RationnelPi {
  return { numerateur: 1, denominateur: exercice.A.rationnelle?.denominateur ?? 1, degrePi: 0 };
}

/** Marge du BAS nettement plus généreuse que celle du haut : réserve la place pour les étiquettes
 * de graduation X (`attach="n"`, ancrées à `yMin`, croissant vers le haut — voir `SinusoideGraph.tsx`)
 * sans jamais chevaucher le creux de la courbe. PROPORTIONNELLE à l'amplitude (`A*0.5`, jamais un
 * simple multiple fixe de `pasAxeY`) — trouvé par vérification Playwright, en 2 passages : une
 * marge fixe (`pasAxeY*3`) suffisait pour une petite amplitude mais restait bien trop courte dès
 * qu'une grande amplitude étire tout l'axe Y (le texte, de hauteur pixel à peu près CONSTANTE,
 * n'occupe alors plus qu'une fraction minuscule d'une marge en unités de données fixe — la marge
 * doit donc croître avec l'étendue réelle de l'axe, pas avec le seul pas de graduation). Plancher
 * `pasAxeY*2` pour les petites amplitudes, où `A*0.5` seul serait trop juste. */
export function viewBoxY(exercice: ParametresSinusoideBase): [number, number] {
  const A = Math.abs(valeurAmplitudeSignee(exercice));
  const pas = pasAxeY(exercice);
  const margeBas = Math.max(pas * 2, A * 0.5);
  return [exercice.b - A - margeBas, exercice.b + A + pas];
}

/** Nombre max de graduations Y ÉTIQUETÉES (jamais un plafond sur les LIGNES elles-mêmes, toujours
 * dessinées au pas fin `pasAxeY` — voir `etiquetteYVisible` ci-dessous pour la justification
 * complète de cette séparation lignes/étiquettes). */
const NOMBRE_MAX_GRADUATIONS_Y = 8;

/**
 * Cinquième bug axe Y (remplace intégralement l'ancienne `pasAxeYAffiche`, dont l'approche s'est
 * révélée non fiable — voir plus bas) trouvé par vérification Playwright PUIS confirmé par un
 * balayage exhaustif de l'espace de tirage réel (`generateurs5e/parametresSinusoide/parametres.ts` :
 * A entier 1..5 ou demi-entier ∈{1.5,2.5,3.5,4.5}, b entier -6..6) : l'ancienne `pasAxeYAffiche`
 * cherchait un pas de LIGNE plus grossier `pasAxeY*k` tel que `b` reste un multiple entier de ce pas
 * grossier — mais un tel `k>1` n'existe que si `k` divise À LA FOIS le numérateur de `A` ET `b`
 * (relatif à `pasAxeY`), une coïncidence arithmétique rare pour les amplitudes demi-entières
 * (numérateurs 3/5/7/9, presque tous premiers) : le balayage exhaustif a mesuré JUSQU'À 23,5
 * graduations pour ~34% des combinaisons réellement tirables (ex. A=4,5, b=1 : aucun diviseur de 9
 * ne divise aussi `b·2=2`, donc AUCUNE réduction n'avait lieu, malgré le nom "plafonne le nombre de
 * graduations" — le plafond n'était en réalité jamais garanti).
 *
 * Corrigé en séparant deux préoccupations qui n'avaient pas besoin d'être couplées : les LIGNES de
 * grille restent TOUJOURS au pas fin `pasAxeY` (jamais grossies) — `b`, `b+A` et `b-A` y tombent
 * TOUJOURS exactement (b est TOUJOURS entier — voir `parametres.ts` — donc TOUJOURS un multiple de
 * `pasAxeY` ∈ {1, 0,5} ; A l'est par construction), sans le moindre calcul de diviseur, ce qui
 * élimine la source du bug plutôt que de la contourner. Seules les ÉTIQUETTES sont éclaircies —
 * même principe déjà en place sur l'axe X (une étiquette sur trois, toutes les lignes restant
 * dessinées) : `b`, `b+A` et `b-A` (les 3 valeurs pédagogiquement significatives : décalage, sommet
 * haut, sommet bas) sont TOUJOURS étiquetées, quel que soit le nombre total de graduations, complétées
 * par un sous-ensemble RÉGULIER des autres graduations (`index % pasEtiquette === 0`, `index`
 * recalculé depuis `v` faute d'être transmis par Coordinates.Cartesian) pour permettre de lire une
 * valeur intermédiaire par interpolation.
 *
 * **Sixième bug**, trouvé APRÈS le cinquième en re-vérifiant par Playwright (méthode "verify before
 * fixing" — le cinquième correctif, jugé suffisant sur la seule foi du balayage exhaustif ci-dessus,
 * restait en réalité incomplet) : ce balayage raisonnait sur `viewBoxY` SEUL, alors que la plage Y
 * RÉELLEMENT affichée par Mafs est presque toujours plus grande. `<Mafs>` impose par défaut un
 * `preserveAspectRatio="contain"` (voir le commentaire de `RATIO_GRAPHE`, `ui/mafsTransformation.ts`) :
 * si la zone de données `[xMin,xMax]×[yMin,yMax]` qu'on lui transmet n'a pas déjà exactement le
 * ratio pixel du conteneur (`RATIO_GRAPHE=3/2`), Mafs élargit LUI-MÊME l'axe le plus étroit pour
 * compenser — ici, l'axe X couvre TOUJOURS 2,5 périodes (`viewBoxX`, potentiellement très large pour
 * un grand T, jusqu'à 2,5×8π≈63) tandis que l'axe Y ne dépend que de l'amplitude (bornée à 4,5,
 * `parametres.ts`) : leur ratio dépasse quasi-systématiquement `RATIO_GRAPHE`, donc c'est L'AXE Y
 * qui se retrouve élargi par Mafs, parfois de +50% ou plus par rapport à `viewBoxY` — confirmé
 * empiriquement (capture d'écran + `console.log` temporaire de l'exercice réel affiché) sur un cas
 * A=-5,T=4π,b=2 : `viewBoxY` calcule `[-5.5,8]` (13,5 de haut) mais le graphique affiche RÉELLEMENT
 * des étiquettes jusqu'à 12 — bien au-delà de 8. `pasEtiquette` calculé sur la seule `viewBoxY`
 * sous-estimait donc systématiquement le nombre réel de graduations à éclaircir, laissant passer
 * jusqu'à 12 étiquettes au lieu des 8-9 attendues.
 *
 * Corrigé en calculant `pasEtiquette` sur l'étendue Y RÉELLEMENT affichée — `ajusterAuRatio`
 * (exportée de `ui/mafsTransformation.ts` pour cet usage, voir son en-tête) réplique fidèlement la
 * même formule interne que Mafs utilise pour son propre ajustement `contain`, appliquée ICI en pur
 * calcul (jamais transmise à `<Mafs viewBox=...>`, qui continue de recevoir `viewBoxX`/`viewBoxY`
 * INCHANGÉS — pré-adapter le viewBox transmis, comme le fait l'usage historique de cette fonction,
 * élargirait ICI tout aussi souvent l'axe X que l'axe Y, ce qui laisserait une marge sans grille NI
 * courbe au-delà du domaine `K_MIN..K_MAX` couvert par la grille X dessinée à la main — voir l'
 * en-tête de `SinusoideGraph.tsx`). Seul le calcul du NOMBRE de graduations en profite ; les LIGNES
 * elles-mêmes suivent toujours passivement ce que Mafs affiche réellement, sans changement de code
 * nécessaire de ce côté.
 *
 * **Huitième bug**, trouvé par une passe de vérification Playwright INDÉPENDANTE (méthode
 * `getBoundingClientRect()` sur les `<text>` Y réels pour détecter un chevauchement vertical, pas
 * seulement à l'œil) : `b`/`b+A`/`b-A` sont FORCÉS à `true` ci-dessus indépendamment du motif
 * périodique `index % pasEtiquette === 0` — ce forçage court-circuite la garantie d'espacement que
 * ce motif périodique offrirait sinon entre lui-même. Rien n'empêchait donc qu'une valeur clé forcée
 * (index non multiple de `pasEtiquette`, ex. b+A=4 avec `pasEtiquette=3`) tombe à une seule
 * graduation fine (`pasAxeY`) d'une graduation périodique voisine ELLE AUSSI étiquetée (ex. 3, car
 * 3%3=0) : deux étiquettes à 1 seul pas d'écart en unités DONNÉE se chevauchent quasi toujours en
 * PIXELS, quel que soit `pasEtiquette` — confirmé par un balayage exhaustif de l'espace (A,b)
 * réellement tirable (`generateurs5e/parametresSinusoide/parametres.ts`) : dès que `pasEtiquette>1`
 * (un éclaircissement a effectivement lieu), la collision apparaît sur la vaste majorité des
 * combinaisons (cas type A=4, b=0 : b+A=4 forcé, voisin périodique 3 affiché — "43" illisible).
 *
 * Corrigé en supprimant tout candidat PÉRIODIQUE (jamais un candidat FORCÉ, toujours affiché) dont
 * l'index tombe à MOINS de `pasEtiquette` graduations fines d'un index clé (`b`/`b+A`/`b-A`) — la
 * même distance minimale que le motif périodique s'impose déjà à lui-même entre deux de ses propres
 * étiquettes, étendue aux 3 valeurs forcées pour qu'aucune étiquette ne les jouxte. `b`/`b+A`/`b-A`
 * restent, eux, TOUJOURS étiquetés sans exception (`estValeurCle`, testé en premier, avant toute
 * suppression de voisinage).
 *
 * `indexCles`/`pasEtiquette` réutilisés tels quels par `attachEtiquetteY` ci-dessous (même calcul,
 * factorisé dans `calculerEspacementY`) pour le résidu de ce même bug touchant les 3 valeurs clés
 * ENTRE ELLES plutôt qu'une clé et un candidat périodique — voir son en-tête.
 */
function calculerEspacementY(exercice: ParametresSinusoideBase) {
  const pas = pasAxeY(exercice);
  const A = valeurAmplitudeSignee(exercice);
  const { b } = exercice;
  const indexCles = [b, b + A, b - A].map((cible) => Math.round(cible / pas));
  const [yMinReel, yMaxReel] = ajusterAuRatio(viewBoxX(exercice), viewBoxY(exercice), RATIO_GRAPHE).y;
  const nombreTicks = Math.round((yMaxReel - yMinReel) / pas) + 1;
  const pasEtiquette = Math.max(1, Math.ceil(nombreTicks / NOMBRE_MAX_GRADUATIONS_Y));
  return { pas, indexCles, pasEtiquette };
}

export function etiquetteYVisible(exercice: ParametresSinusoideBase, v: number): boolean {
  const { pas, indexCles, pasEtiquette } = calculerEspacementY(exercice);
  const index = Math.round(v / pas);
  if (indexCles.some((i) => i === index)) return true;
  const tropPresDUneValeurCle = indexCles.some((i) => Math.abs(index - i) < pasEtiquette);
  if (tropPresDUneValeurCle) return false;
  return index % pasEtiquette === 0;
}

/**
 * Point d'ancrage (`attach` de `<Text>`, Mafs) d'une étiquette Y — TOUJOURS `"e"` (centrée sur sa
 * graduation, comportement historique) SAUF pour une valeur clé (`b`/`b+A`/`b-A`) dont une AUTRE
 * valeur clé voisine tombe à moins de `pasEtiquette` graduations fines : cas résiduel du huitième
 * bug ci-dessus (voir l'en-tête de `etiquetteYVisible`), qui ne couvre que le chevauchement
 * ÉTIQUETTE-CLÉ vs ÉTIQUETTE-PÉRIODIQUE — rien n'empêchait encore deux valeurs CLÉS de se chevaucher
 * ENTRE ELLES, un cas que la suppression périodique ne peut pas résoudre (les 3 valeurs clés
 * restent, elles, TOUJOURS affichées sans exception). Se produit dès que l'amplitude, exprimée en
 * pas de grille, est petite (souvent A=1 pas, parfois plus) alors que l'axe Y réel est fortement
 * étiré par l'ajustement de ratio (voir le "Sixième bug" plus haut) : confirmé par un balayage
 * exhaustif de l'espace (A,b) réellement tirable PUIS par une vérification Playwright en direct
 * (`getBoundingClientRect()`, ~19% des générations aléatoires sur 80 essais) — cas type A=1, b=0 :
 * b-A=-1, b=0 et b+A=1 sont 3 graduations CONSÉCUTIVES, toutes trois forcées, aucune ne pouvant être
 * masquée.
 *
 * Corrigé en ÉCARTANT verticalement, jamais en masquant, les valeurs clés en conflit mutuel : la
 * plus BASSE d'une paire clé-clé trop proche pousse son étiquette vers le BAS (`"se"` — hanging,
 * l'étiquette descend depuis son ancrage, même mécanique que l'axe X en `attach="s"`, voir l'en-tête
 * de `SinusoideGraph.tsx`), la plus HAUTE pousse la sienne vers le HAUT (`"ne"` — baseline, symétrique
 * de l'axe X en `attach="n"`) ; une clé prise EN SANDWICH entre deux autres clés proches des DEUX
 * côtés (cas des 3 valeurs consécutives ci-dessus, ex. `b=0`) reste centrée (`"e"`) — ses deux
 * voisines s'écartent chacune de leur côté, ce qui suffit à lui dégager de la place sans la déplacer
 * elle-même. Une valeur clé ISOLÉE (aucune autre clé à moins de `pasEtiquette`, le cas courant)
 * garde `"e"`, comportement inchangé — cette fonction ne modifie jamais le rendu des cas déjà sains.
 */
export function attachEtiquetteY(exercice: ParametresSinusoideBase, v: number): "e" | "ne" | "se" {
  const { pas, indexCles, pasEtiquette } = calculerEspacementY(exercice);
  const index = Math.round(v / pas);
  if (!indexCles.some((i) => i === index)) return "e"; // jamais une valeur clé -> jamais concernée
  const procheEnBas = indexCles.some((i) => i < index && index - i < pasEtiquette);
  const procheEnHaut = indexCles.some((i) => i > index && i - index < pasEtiquette);
  // Une voisine clé proche pousse l'étiquette À L'OPPOSÉ d'ELLE (jamais vers elle, qui aggraverait le
  // chevauchement) : voisine EN DESSOUS -> je m'écarte vers le HAUT ("ne") ; voisine AU-DESSUS -> je
  // m'écarte vers le BAS ("se").
  if (procheEnBas && !procheEnHaut) return "ne";
  if (procheEnHaut && !procheEnBas) return "se";
  return "e"; // isolée, ou en sandwich entre deux voisines (déjà écartées chacune de son côté)
}

/**
 * Toutes les positions Y de graduation (pas fin `pasAxeY`, sur l'étendue RÉELLEMENT affichée par
 * Mafs — même calcul que `etiquetteYVisible` ci-dessus) — pour un usage identique à
 * `positionsTicksX` : dessiner les étiquettes Y À LA MAIN plutôt que de les confier à
 * `Coordinates.Cartesian`.
 *
 * **Septième bug**, trouvé APRÈS le sixième en re-vérifiant PAR PLAYWRIGHT une nouvelle fois (et non
 * en se contentant du calcul du sixième correctif seul — même leçon "verify before fixing" que
 * précédemment) : `Coordinates.Cartesian`, en lisant `node_modules/mafs/build/index.js`, positionne
 * le TEXTE de chaque étiquette Y (`YLabels`) à un DÉCALAGE PIXEL LITTÉRAL fixe (`x: 5`, jamais
 * transformé par `vec.transform`) — une hypothèse implicite que le bord visible gauche du graphique
 * correspond toujours à `x=5` dans l'espace-pixel INTERNE de Mafs. Cette hypothèse est vraie
 * seulement quand `xMin` (donnée) est proche de 0, car cet espace-pixel interne de Mafs a pour
 * origine `x=0` DONNÉE (`viewBoxX = xMin/(xMax-xMin)*width` dans le code source de `<Mafs>` — la
 * fenêtre SVG externe se décale pour suivre `xMin`, MAIS le texte hand-off de `YLabels` continue de
 * supposer un décalage nul). Ce générateur viole systématiquement cette hypothèse : le domaine X
 * (`viewBoxX`, 2,5 périodes à partir de φ) est FRÉQUEMMENT loin de 0 (φ peut valoir plusieurs
 * multiples de π) — confirmé empiriquement (`getBoundingClientRect()` sur les `<text>` Y réels,
 * cas φ=5π, T=4π : étiquettes Y toutes hors-cadre, `bboxX` négatif) : les étiquettes Y natives de
 * `Coordinates.Cartesian` peuvent ainsi être TOTALEMENT INVISIBLES (pas seulement chevauchées) sur
 * ce générateur, un défaut plus grave que le sixième bug et présent depuis la toute première version
 * de ce fichier (jamais introduit par les correctifs précédents — `x:5` n'a jamais dépendu du calcul
 * de pas).
 *
 * Corrigé en abandonnant ENTIÈREMENT `yAxis.labels` (mis à `undefined`, `SinusoideGraph.tsx`) au
 * profit d'un dessin À LA MAIN avec `<Text>` de Mafs, ancré à `x=xMin` (bord gauche du domaine
 * visible, TOUJOURS dans le cadre par construction) — `<Text>`, contrairement à `YLabels`, calcule sa
 * position via `vec.transform` (le même mécanisme que `Line.Segment`/`Point`/`Plot.OfX`), donc
 * immunisé contre ce bug par construction. `yAxis.lines` (les LIGNES de grille, jamais concernées :
 * dessinées via un `<pattern>` SVG positionné par `vec.transform`, jamais par un décalage pixel
 * littéral) reste, lui, porté par `Coordinates.Cartesian` sans changement.
 */
export function positionsTicksY(exercice: ParametresSinusoideBase): number[] {
  const pas = pasAxeY(exercice);
  const [yMinReel, yMaxReel] = ajusterAuRatio(viewBoxX(exercice), viewBoxY(exercice), RATIO_GRAPHE).y;
  const debut = Math.ceil(yMinReel / pas);
  const fin = Math.floor(yMaxReel / pas);
  const valeurs: number[] = [];
  for (let i = debut; i <= fin; i++) valeurs.push(i * pas);
  return valeurs;
}

export function evaluerY(exercice: ParametresSinusoideBase, x: number): number {
  const A = valeurAmplitudeSignee(exercice);
  const T = valeurNumerique(exercice.T);
  const phi = valeurNumerique(exercice.phi);
  return A * Math.sin(((2 * Math.PI) / T) * (x - phi)) + exercice.b;
}

/** Position du passage ascendant le plus proche de φ (φ lui-même si A>0, φ+T/2 si A<0 — voir
 * l'en-tête du fichier) — sert d'ancrage à la vérification modulo T de l'écran φ (n'importe quel
 * ancrage sur la famille des passages ascendants convient, la vérification accepte tout φ_cible+kT). */
export function xAscendantPrincipal(exercice: ParametresSinusoideBase): number {
  const A = valeurAmplitudeSignee(exercice);
  const phi = valeurNumerique(exercice.phi);
  const T = valeurNumerique(exercice.T);
  return A > 0 ? phi : phi + T / 2;
}

function pointLePlusProche(points: PointCleSinusoide[], xCible: number): PointCleSinusoide {
  return points.reduce((meilleur, p) => (Math.abs(p.x - xCible) < Math.abs(meilleur.x - xCible) ? p : meilleur));
}

/**
 * Points à mettre en évidence sur le graphique pour la phase AFFICHÉE (jamais les autres phases —
 * aucune persistance entre écrans, décision explicite de l'utilisateur : chaque écran suit
 * uniquement ce qui a été demandé pour LUI, voir `EtapeParametreSinusoideGraphique.tsx`) à SON
 * niveau d'aide courant — réutilise TOUJOURS `pointsCles` (jamais recalculé indépendamment) pour
 * garantir que le point mis en évidence tombe exactement sur la courbe tracée. Ne révèle jamais RIEN
 * de plus que ce que le texte de l'aide correspondante (`ui5e/formatParametresSinusoideGraphique.ts`)
 * décrit déjà en toutes lettres — détail par phase (`prompt5gen9aidesvisuelles.md`) :
 * - **decalage** — dès l'aide NIVEAU 1 ("les 2 points... utilisés pour le calcul de b") → 1 `max` +
 *   1 `min` ; SEULE phase dont l'indication visuelle démarre au niveau 1 (toutes les autres restent
 *   texte seul avant le niveau 2).
 * - **amplitude** — aide niveau 2 ("le point sommet") → 1 sommet (max ou min, le plus proche du
 *   centre visible) SEUL — la droite médiane, elle, n'est PAS un point (voir `segmentsAideActive`,
 *   affichée par défaut sur cet écran indépendamment du niveau d'aide).
 * - **periode** et **frequence** — aide niveau 2 ("deux sommets consécutifs de MÊME NATURE") → 2
 *   `max` consécutifs (séparés exactement de T, jamais un max et un min) ; **frequence** réutilise le
 *   même repère que **periode** (son propre texte d'aide 2 renvoie explicitement à "la période T déjà
 *   trouvée", jamais une donnée nouvelle — inutile d'inventer un repère distinct).
 * - **phi** — aide niveau 2 ("le point où la courbe traverse la ligne médiane EN MONTANT") → LE point
 *   `ascendant` unique en `xAscendantPrincipal` (même ancrage que la vérification de cette phase,
 *   `moteur5e/verificationParametresSinusoideGraphique.ts`) SEUL — le minimum précédent et le segment
 *   horizontal vers ce point, un temps ajoutés, ont été explicitement retirés par l'utilisateur.
 *
 * `xCentre` (centre du domaine visible, `viewBoxX`) sert d'ancrage de proximité pour les 4 premières
 * phases — choisi plutôt que `xAscendantPrincipal` (utilisé lui pour **phi** uniquement) car φ n'est
 * pas centré dans le domaine affiché (2,5 périodes à partir de φ, jamais symétrique autour de lui) :
 * ancrer sur le centre visible garantit un point mis en évidence proche du milieu du graphique,
 * jamais coupé en bord de cadre.
 */
export function pointsAideActive(exercice: ParametresSinusoideBase, phase: PhaseParametresSinusoideGraphique, niveauAide: number): PointCleSinusoide[] {
  const points = pointsCles(exercice);
  const [xMin, xMax] = viewBoxX(exercice);
  const xCentre = (xMin + xMax) / 2;
  const maxPoints = points.filter((p) => p.type === "max");
  const minPoints = points.filter((p) => p.type === "min");

  switch (phase) {
    case "decalage":
      if (niveauAide < 1) return [];
      return [pointLePlusProche(maxPoints, xCentre), pointLePlusProche(minPoints, xCentre)];
    case "amplitude": {
      if (niveauAide < 2) return [];
      return [pointLePlusProche([...maxPoints, ...minPoints], xCentre)];
    }
    case "periode":
    case "frequence": {
      if (niveauAide < 2) return [];
      const parX = [...maxPoints].sort((a, b) => a.x - b.x);
      const pivot = pointLePlusProche(maxPoints, xCentre);
      const idx = parX.indexOf(pivot);
      const voisin = idx < parX.length - 1 ? parX[idx + 1] : parX[idx - 1];
      return [pivot, voisin];
    }
    case "phi": {
      if (niveauAide < 2) return [];
      const xCible = xAscendantPrincipal(exercice);
      const point = points.find((p) => p.type === "ascendant" && Math.abs(p.x - xCible) < 1e-6);
      return point ? [point] : [];
    }
  }
}

/** Segment BORNÉ entre 2 points précis (`Line.Segment`, Mafs) — la quasi-totalité des indications
 * d'aide de ce générateur. */
export interface SegmentBorneAideSinusoide {
  kind: "segment";
  point1: [number, number];
  point2: [number, number];
  style: "solid" | "dashed";
}

/** Droite VRAIMENT infinie (`Line.PointSlope`, Mafs — calcule ses 2 points d'intersection avec le
 * pane visible via `usePaneContext`, RÉACTIF au pan/zoom, contrairement à `Line.Segment` dont les 2
 * points sont fixes) — "la droite médiane est de longueur infinie" (demande utilisateur, corrigeant
 * un premier essai borné à `viewBoxX`, visuellement bien plus courte que le pane réellement affiché
 * dès que l'élève dézoome ou pan). SEULE la droite médiane utilise cette variante ; tous les autres
 * segments d'aide du générateur restent des `SegmentBorneAideSinusoide`. */
export interface SegmentDroiteAideSinusoide {
  kind: "droite";
  point: [number, number];
  pente: number;
  style: "solid" | "dashed";
}

export type SegmentAideSinusoide = SegmentBorneAideSinusoide | SegmentDroiteAideSinusoide;

/** Droite médiane — horizontale à `y=b`, infinie (voir `SegmentDroiteAideSinusoide`). Partagée entre
 * `decalage` (apparaît à l'aide niveau 2) et `amplitude` (affichée par défaut, voir
 * `segmentsAideActive` ci-dessous) — jamais 2 géométries différentes pour la même droite. */
function segmentMediane(exercice: ParametresSinusoideBase): SegmentDroiteAideSinusoide {
  return { kind: "droite", point: [0, exercice.b], pente: 0, style: "solid" };
}

/**
 * Segment à mettre en évidence pour la phase AFFICHÉE (jamais les autres — aucune persistance entre
 * écrans) à son niveau d'aide courant, en plus des points de `pointsAideActive`
 * (`prompt5gen9aidesvisuelles.md`) — réutilise TOUJOURS les points déjà calculés par
 * `pointsAideActive` (jamais une seconde géométrie recalculée indépendamment), pour garantir que
 * chaque segment relie exactement les points affichés.
 * - **decalage** niveau 2 — "la droite horizontale médiane" → `segmentMediane`, SOLIDE (jamais
 *   qualifiée "en pointillé" dans le prompt, contrairement au segment suivant), INFINIE (voir
 *   `SegmentDroiteAideSinusoide`).
 * - **amplitude** — la médiane ("introduite à l'aide 2 de l'écran 1... déjà affichée par défaut sur
 *   cet écran, sans qu'il faille réactiver une aide") est TOUJOURS présente sur cet écran, quel que
 *   soit `niveauAide` (0, 1 ou 2 : comportement par défaut de CET écran, jamais dérivé d'un historique
 *   d'aide — voir la décision "aucune persistance" ci-dessus) ; niveau 2 ajoute EN PLUS "segment
 *   vertical en pointillé reliant [le sommet] à la droite médiane" → POINTILLÉ, BORNÉ, du sommet
 *   jusqu'à `y=b` à la même abscisse.
 * - **periode** niveau 2 — "segment de droite en pointillé reliant ces 2 points sommet" → POINTILLÉ,
 *   BORNÉ, entre les 2 maxima consécutifs (déjà à la même hauteur `y=b+A`, donc horizontal).
 * - **frequence** — "Rien à changer" (spec explicite) → jamais de segment, quel que soit le niveau.
 * - **phi** — jamais de segment (le minimum précédent et son segment horizontal, un temps ajoutés,
 *   ont été explicitement retirés par l'utilisateur — voir `pointsAideActive`).
 */
export function segmentsAideActive(exercice: ParametresSinusoideBase, phase: PhaseParametresSinusoideGraphique, niveauAide: number): SegmentAideSinusoide[] {
  switch (phase) {
    case "decalage":
      return niveauAide < 2 ? [] : [segmentMediane(exercice)];
    case "amplitude": {
      const segments: SegmentAideSinusoide[] = [segmentMediane(exercice)];
      if (niveauAide >= 2) {
        const [sommet] = pointsAideActive(exercice, "amplitude", 2);
        segments.push({ kind: "segment", point1: [sommet.x, sommet.y], point2: [sommet.x, exercice.b], style: "dashed" });
      }
      return segments;
    }
    case "periode": {
      if (niveauAide < 2) return [];
      const [pivot, voisin] = pointsAideActive(exercice, "periode", 2);
      return [{ kind: "segment", point1: [pivot.x, pivot.y], point2: [voisin.x, voisin.y], style: "dashed" }];
    }
    case "frequence":
    case "phi":
      return [];
  }
}

/** Rendu PLAIN TEXT (jamais LaTeX — `<Text>` de Mafs ne peut pas rendre KaTeX) d'un `RationnelPi`,
 * pour les étiquettes de graduation de l'axe X — caractère unicode "π" direct, même principe que
 * les labels hors-KaTeX déjà utilisés ailleurs sur la plateforme (ex. 5gen7, sommets de polygone). */
export function formatRationnelPiTexte(valeur: RationnelPi): string {
  const v = reduireRationnelPi(valeur);
  if (v.numerateur === 0) return "0";
  const signe = v.numerateur < 0 ? "-" : "";
  const n = Math.abs(v.numerateur);
  const d = v.denominateur;
  if (v.degrePi === 0) return d === 1 ? `${signe}${n}` : `${signe}${n}/${d}`;
  const piPart = n === 1 ? "π" : `${n}π`;
  return d === 1 ? `${signe}${piPart}` : `${signe}${piPart}/${d}`;
}
