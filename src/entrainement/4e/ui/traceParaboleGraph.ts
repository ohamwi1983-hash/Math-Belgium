/**
 * Géométrie présentationnelle pure de l'écran "trace" — "Construction graphique de la parabole"
 * (position 53). Aucun tracé libre : l'élève CLIQUE les 6 points déjà construits, dans l'ordre de
 * son choix — seul cet ordre RÉEL compte, à la fois pour la note finale
 * (`moteur/verificationConstructionParabole.ts::verifierOrdreSelection`) ET pour ce qui est dessiné.
 *
 * **Historique** : la toute première version (interpolation `Plot.OfX`) se révélait visuellement
 * DÉCONNECTÉE des points sélectionnés — `Plot.OfX` borne silencieusement son domaine à
 * `xPaneRange` (l'étendue X du viewBox EXTÉRIEUR, non tourné), incompatible avec ce graphe qui vit
 * dans un repère LOCAL soumis à `<Transform rotate={theta}>`. Corrigée une première fois
 * (`promptgen53corrections.md` B.1/B.2) par un tracé en SEGMENTS entre points cliqués, dans leur
 * ordre réel — mais cette version ne montrait plus jamais la vraie courbe de la parabole.
 * **Seconde correction** (`promptgen53gen54corrections.md` A.1) : la vraie courbe ANALYTIQUE
 * (`evaluerParaboleLocale`) est révélée PROGRESSIVEMENT. Le domaine révélé (`domaineRevele`) ne
 * s'étend que tant que la sélection RÉELLE suit l'ordre correct (gauche→droite) — un clic
 * hors-séquence fige la révélation sans la faire régresser ni la "réparer" : comportement dégradé
 * VOLONTAIRE, cohérent avec la consigne ("un mauvais ordre donnerait une courbe qui ne ressemble
 * pas à une parabole").
 *
 * **Bug trouvé sur la PREMIÈRE tentative de cette seconde correction** (confirmé visuellement par
 * l'utilisateur : la courbe rendue ne passait par AUCUN des points sélectionnés, même 6/6 avec un
 * ordre correct) : le premier essai rendait la courbe via `Plot.Parametric`, en pensant à tort que
 * son immunité au bug de `xPaneRange` (voir ci-dessus) impliquait une compatibilité TOTALE avec
 * `<Transform>`. Faux : `Plot.Parametric` positionne son `<path>` via la variable CSS
 * `--mafs-view-transform`, qui n'est posée QU'UNE FOIS, sur le `<svg>` racine de `<Mafs>`
 * (`viewTransform` seul, `userTransform` figé à l'identité à ce niveau) — un `<Transform>` imbriqué
 * met à jour une variable CSS DIFFÉRENTE, `--mafs-user-transform`, sur son propre `<g>` englobant,
 * jamais consommée par aucun composant `Plot.*` (vérifié en lisant `node_modules/mafs/build/index.js`
 * directement, méthode "verify before fixing" du projet — la leçon : une primitive Mafs qui évite un
 * défaut connu (`xPaneRange`) n'est pas automatiquement compatible avec un `<Transform>` imbriqué,
 * ces deux propriétés sont INDÉPENDANTES et doivent être vérifiées séparément). `Line.Segment`, en
 * revanche, compose CORRECTEMENT `viewTransform×userTransform` en lisant `useTransformContext()`
 * manuellement (déjà la primitive utilisée pour la directrice/le compas/l'équerre de l'écran
 * précédent, jamais mise en défaut) — la courbe est donc reconstruite comme une POLYLINE DENSE
 * (`pointsCourbeRevelee`, un point tous les `PAS_ECHANTILLONNAGE_COURBE`) de `Line.Segment`
 * (`TraceParaboleGraph.tsx`), jamais `Plot.Parametric`/`Plot.OfX`/aucun composant `Plot.*`.
 */
import { calculerViewBoxGrilleTournee, demiPorteeGrilleTournee } from "./grilleTourneeGraph";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";

/** Vraie équation analytique de la parabole dans le repère LOCAL (directrice toujours `y=0`, foyer
 * `exercice.foyer`) — dérivée de `distance(P,F)=distance(P,directrice)` : pour tout point de la
 * parabole, `(x-x_F)²+(y-y_F)²=y²` (l'ordonnée locale d'un point de la parabole est toujours
 * positive, le sommet `y=y_F/2` l'étant déjà strictement), soit `y=[(x-x_F)²+y_F²]/(2y_F)`. Jamais
 * montrée à l'élève (aucune formule ni coordonnée numérique n'est jamais affichée sur cet
 * exercice) — uniquement utilisée pour le tracé de révélation progressive. */
export function evaluerParaboleLocale(exercice: ExerciceConstructionParabole, x: number): number {
  const { foyer } = exercice;
  return ((x - foyer.x) ** 2 + foyer.y ** 2) / (2 * foyer.y);
}

/** Ordre correct des INDICES dans `cibles` (gauche→droite selon l'abscisse locale) — même critère
 * que `ordreCorrect`/`verifierOrdreSelection` (`moteur/verificationConstructionParabole.ts`),
 * exprimé ici en indices pour comparaison directe à `selectionnesIndices`
 * (`EtapeTraceParabole.tsx`, qui suit déjà la sélection par index, jamais par valeur). Les 6
 * abscisses locales sont TOUJOURS deux à deux distinctes par construction (2 solutions symétriques
 * `foyer.x±d` par itération, `d` strictement croissant avec `r` — voir `pointsCiblesIteration`),
 * donc ce tri est toujours un ordre total, jamais de cas d'égalité à départager. */
function indicesOrdreCorrect(cibles: Point[]): number[] {
  return cibles.map((_, i) => i).sort((a, b) => cibles[a]!.x - cibles[b]!.x);
}

/** Nombre de points, dans l'ordre RÉEL de sélection (`selectionnesIndices`), qui forment un
 * préfixe EXACT de l'ordre correct (gauche→droite) — détermine jusqu'où la vraie courbe est
 * révélée (`domaineRevele` ci-dessous). Une sélection dans le mauvais ordre casse le préfixe dès le
 * premier index hors-séquence : les clics suivants n'étendent alors plus le domaine révélé, même si
 * l'élève continue de cliquer — comportement dégradé VOLONTAIRE (voir l'en-tête de fichier). */
export function longueurPrefixeCorrect(cibles: Point[], selectionnesIndices: number[]): number {
  const correct = indicesOrdreCorrect(cibles);
  let k = 0;
  while (k < selectionnesIndices.length && k < correct.length && selectionnesIndices[k] === correct[k]) k++;
  return k;
}

/** Domaine (bornes en abscisse LOCALE) de la vraie courbe révélée — `null` tant qu'aucun point n'a
 * encore été sélectionné dans le bon ordre (rien à tracer). */
export function domaineRevele(cibles: Point[], selectionnesIndices: number[]): { xMin: number; xMax: number } | null {
  const k = longueurPrefixeCorrect(cibles, selectionnesIndices);
  if (k === 0) return null;
  const abscisses = indicesOrdreCorrect(cibles)
    .slice(0, k)
    .map((i) => cibles[i]!.x);
  return { xMin: Math.min(...abscisses), xMax: Math.max(...abscisses) };
}

/** Nombre de segments de la polyline — assez dense pour paraître lisse sur un graphe de cette
 * taille (≈420px), sans générer un nombre déraisonnable d'éléments `<Line.Segment>`. */
const PAS_ECHANTILLONNAGE_COURBE = 60;

/** Points échantillonnés RÉGULIÈREMENT sur le domaine révélé, chacun exactement sur la vraie
 * courbe (`evaluerParaboleLocale`) — reliés par `Line.Segment` (jamais `Plot.*`, voir l'en-tête de
 * fichier) pour former une polyline dense qui compose correctement avec `<Transform rotate={theta}>`.
 * `[]` tant qu'aucun point n'a encore été sélectionné dans le bon ordre. */
export function pointsCourbeRevelee(exercice: ExerciceConstructionParabole, cibles: Point[], selectionnesIndices: number[]): Point[] {
  const domaine = domaineRevele(cibles, selectionnesIndices);
  if (domaine === null) return [];
  const points: Point[] = [];
  for (let i = 0; i <= PAS_ECHANTILLONNAGE_COURBE; i++) {
    const x = domaine.xMin + (domaine.xMax - domaine.xMin) * (i / PAS_ECHANTILLONNAGE_COURBE);
    points.push({ x, y: evaluerParaboleLocale(exercice, x) });
  }
  return points;
}

export function viewBoxTraceParabole(exercice: ExerciceConstructionParabole, cibles: Point[]): ReturnType<typeof calculerViewBoxGrilleTournee> {
  return calculerViewBoxGrilleTournee([exercice.foyer, { x: exercice.foyer.x, y: 0 }, ...cibles], exercice.theta);
}

export function demiPorteeTraceParabole(exercice: ExerciceConstructionParabole, cibles: Point[]): number {
  return demiPorteeGrilleTournee([exercice.foyer, { x: exercice.foyer.x, y: 0 }, ...cibles]);
}
