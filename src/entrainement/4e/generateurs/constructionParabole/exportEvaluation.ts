import type { ExerciceConstructionParabole } from "../../core/constructionParabole.types";
import type { Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { calculerViewBoxGrilleTournee, demiPorteeGrilleTournee } from "../../ui/grilleTourneeGraph";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { pointsCiblesIteration, rCanonique } from "../../moteur/verificationConstructionParabole";
import { evaluerParaboleLocale } from "../../ui/traceParaboleGraph";
import { genererExerciceConstructionParabole } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConstructionParabole>` pour gen53
 * ("Construction graphique de la parabole", `AppConstructionParabole.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour le patron "grille papier +
 * graphique HTML" suivi ici (même famille de générateurs graphiques que `constructionDroite`).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "parabole"
 * (`src/content/chapters/4e/geometrie-analytique-plane.ts`) — cette section est couverte par 3
 * générateurs distincts (gen51 `equationParabole`, gen52 `equationParaboleDeveloppee`, gen53
 * celui-ci) ; ce fichier ne touche QUE `generateurs/constructionParabole/`.
 *
 * **PAS de `CATALOGUE_VARIANTES`** — confirmé en lisant `generateurs/constructionParabole/index.ts`
 * EN ENTIER : il n'exporte que `genererExerciceConstructionParabole`/`construireExercice`, aucune
 * notion de variante/famille forçable (tirage uniforme de `foyer.y` parmi 2 candidats, de `foyer.x`
 * sur un petit intervalle, et de `theta` par rejet). `catalogueVariantes`/`genererInstanceAvecVariante`
 * sont donc omis ici, même contrat "zéro-argument" que `constructionVectorielle/exportEvaluation.ts`
 * (déjà sans catalogue pour la même raison).
 *
 * **Écran → question — PAS un tracé "depuis une équation"** : contrairement à gen51/gen52 (qui
 * partent d'une équation ou d'un graphe déjà tracé), gen53 ne donne NI équation NI coordonnée
 * numérique — uniquement un foyer F et une directrice d (repère LOCAL où d est TOUJOURS `y=0` et
 * F=(foyer.x,foyer.y), obliquité appliquée seulement à l'affichage via `theta`, voir l'en-tête de
 * `core/constructionParabole.types.ts`/`ui/grilleTourneeGraph.ts`). L'écran interactif a 2 phases
 * bien distinctes (`moteur/sessionConstructionParabole.ts`) : 3 itérations "construction" (choisir un
 * rayon r au compas centré en F, tracer la parallèle à d à distance r du côté de F, ce qui donne 2
 * points de la parabole par itération — `verificationConstructionParabole.ts::pointsCiblesIteration`),
 * puis un écran "trace" terminal (relier les 6 points obtenus, dans l'ordre gauche→droite, pour
 * former la courbe). Sur papier, ces 2 phases deviennent UNE SEULE question qui décrit la méthode
 * complète (répéter la construction cercle/parallèle 3 fois avec des rayons différents, puis relier
 * les 6 points) — jamais 4 questions séparées : contrairement à `simplification`/`analyseFonction`,
 * ici chaque itération n'introduit ni sous-résultat numérique ni nouvelle notion à corriger
 * indépendamment, seulement la répétition du même geste géométrique.
 *
 * **Représentation papier** : grille (vierge en énoncé) + foyer F + directrice d, exactement comme
 * `ConstructionParaboleGraph`/`GrilleTournee` (`components/mafsGraphPartage.tsx`) les affiche à
 * l'écran — AUCUNE graduation ni coordonnée numérique (même contrainte pédagogique que l'écran, voir
 * l'en-tête de `ui/grilleTourneeGraph.ts` : "aucune coordonnée chiffrée visible"), donc aucun
 * fragment LaTeX/texte de ce fichier ne révèle jamais `foyer.x`/`foyer.y`/un rayon en valeur brute.
 * `construireSvgConstructionParabole` ci-dessous écrit son propre petit moteur de tracé `<svg>` (même
 * précédent que `constructionVectorielle`/`triangleLies`/`boiteMoustaches` — chacun le sien, aucun
 * moteur générique partagé dans `export/`), mais RÉUTILISE toute la géométrie déjà partagée par
 * l'écran interactif plutôt que de la dupliquer :
 * - `ui/grilleTourneeGraph.ts::calculerViewBoxGrilleTournee`/`demiPorteeGrilleTournee` — EXACTEMENT
 *   le même calcul de viewBox/étendue de grille tournée que `ConstructionParaboleGraph.tsx`.
 * - `moteur/verificationConstructionParabole.ts::rCanonique`/`pointsCiblesIteration` — le même calcul
 *   de rayon canonique et de points d'intersection cercle/droite que le moteur de vérification.
 * - `ui/traceParaboleGraph.ts::evaluerParaboleLocale` — la même équation analytique locale de la
 *   parabole que l'écran "trace" (jamais montrée à l'élève, réservée au tracé de la courbe).
 * Le seul calcul écrit ici et absent de `ui/grilleTourneeGraph.ts` est la rotation d'un point LOCAL
 * vers le repère extérieur (`tournerPointLocal` ci-dessous) : la fonction équivalente
 * (`tournerPoint`) existe déjà dans `ui/grilleTourneeGraph.ts` mais n'y est PAS exportée (usage
 * interne à `calculerViewBoxGrilleTournee`) — ce fichier ne devant toucher AUCUN autre fichier
 * (consigne explicite de la tâche), la même formule (rotation 2D standard, `cos`/`sin`) est reproduite
 * ici à l'identique plutôt que d'exporter l'originale.
 *
 * **Rayons choisis pour l'illustration — PAS la famille "abscisses entières" du commentaire de tête
 * de `index.ts`** : ce commentaire dérive une famille infinie de rayons `r = h·(1+k²)` (`k=1,2,3,…`,
 * `h = foyer.y/2`) donnant une abscisse d'intersection ENTIÈRE — mais cette famille croît vite
 * (ex. r=2,5,10 pour foyer.y=2 ; r=4,10,20 pour foyer.y=4, cf. son propre commentaire) : afficher les
 * 3 cercles simultanément sur UN SEUL graphique statique (contrairement à l'écran, qui n'affiche
 * jamais qu'UN cercle à la fois, celui de l'itération en cours) rendrait le graphique soit minuscule
 * (le petit cercle r=2 écrasé par le grand r=10/20) soit surdimensionné. Comme aucune graduation n'est
 * de toute façon affichée (voir ci-dessus), la propriété "abscisse entière" n'apporte ici AUCUN
 * bénéfice visuel. Les 3 rayons choisis sont donc simplement `rCanonique(exercice)`,
 * `rCanonique(exercice)+1`, `rCanonique(exercice)+2` — 3 valeurs proches, toujours strictement
 * valides et deux à deux distinctes par construction (`rEstValide` ne rejette qu'un rayon ≤ rMinimal
 * ou déjà utilisé), qui donnent un graphique compact quel que soit `foyer.y`. `rCanonique` est de
 * plus DÉJÀ la valeur utilisée par l'aide niveau 2 de l'écran interactif (cercle de référence) — la
 * cohérence entre "l'exemple montré à l'élève en aide" et "le premier rayon illustré en correction
 * papier" est donc un bonus gratuit de cette réutilisation, pas un choix indépendant.
 *
 * Correction RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée (`exercice.foyer`,
 * `exercice.theta`) : `EtapeConstructionParabole.tsx`/`EtapeTraceParabole.tsx` n'ont pas de texte
 * d'aide progressif à concaténer tel quel (leurs 2 aides, `TEXTE_AIDE_CONSTRUCTION_NIVEAU1/2`, sont
 * déjà génériques et réutilisées presque mot pour mot dans la consigne d'énoncé ci-dessous — aucune
 * n'est spécifique à l'instance) ; le texte de correction explicite directement le principe
 * d'équidistance foyer/directrice qui justifie la construction, jamais recalculé indépendamment de
 * `pointsCiblesIteration`/`evaluerParaboleLocale` déjà importés.
 *
 * **PAS `regroupable`** — les 3 conditions de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont violées : `enteteHtml` (le graphique) est utilisé, ce qui
 * disqualifie `regroupable` à lui seul, quelle que soit la consigne (voir la doc du champ) — de
 * surcroît la consigne ne dépend certes PAS des valeurs tirées (générique par construction, aucune
 * coordonnée numérique n'apparaissant jamais dans le texte), mais peu importe puisque `enteteHtml`
 * suffit déjà à exclure `regroupable`.
 *
 * Pas de zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut de
 * `construireZoneReponse`/`zoneReponseHtml` : 1 ligne en docx, SANS AUCUN EFFET sur le pipeline HTML
 * évaluation qui n'affiche jamais de zone de réponse, voir `export/assemblerEvaluationHtml.ts`) : la
 * réponse attendue est une CONSTRUCTION à main levée sur la grille déjà imprimée dans l'énoncé, jamais
 * une ligne de texte à remplir — même raison que `constructionVectorielle`/`boiteMoustaches`/
 * `triangleLies`, qui laissent également `reponse` implicite pour leurs questions à tracé.
 */

const LARGEUR_SVG = 300;
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_GRAPHE);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_DIRECTRICE = "#495057";
const COULEUR_FOYER = "#f08c00";
const COULEUR_COMPAS = "#1971c2";
const COULEUR_EQUERRE = "#e8590c";
const COULEUR_POINT = "#2f9e44";
const COULEUR_COURBE = "#2f9e44";

/** Nombre de segments de la polyline de la courbe finale — dense pour paraître lisse sur un
 * graphique de cette taille (≈300px), même ordre de grandeur que `PAS_ECHANTILLONNAGE_COURBE`
 * (`ui/traceParaboleGraph.ts`, non exportée — valeur reproduite ici, jamais réimportée). */
const PAS_ECHANTILLONNAGE_COURBE = 60;

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
  /** Facteur d'échelle scalaire (moyenne des 2 axes, quasi identiques une fois `viewBox` ajusté au
   * ratio du canevas) — utilisé pour convertir un RAYON réel (isotrope par nature) en pixels, ce que
   * `sx`/`sy` seuls ne permettent pas directement. */
  rayon: (r: number) => number;
}

function construireEchelle(viewBox: ViewBoxTransformation): Echelle {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = LARGEUR_SVG - 2 * MARGE_PX;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_PX;
  const facteurX = zoneX / (xMax - xMin);
  const facteurY = zoneY / (yMax - yMin);
  const facteurMoyen = (facteurX + facteurY) / 2;
  return {
    sx: (x) => MARGE_PX + (x - xMin) * facteurX,
    sy: (y) => HAUTEUR_SVG - MARGE_PX - (y - yMin) * facteurY,
    rayon: (r) => r * facteurMoyen,
  };
}

/** Fait pivoter un point du repère LOCAL vers le repère extérieur (avant rotation) — MÊME formule
 * que la fonction privée `tournerPoint` de `ui/grilleTourneeGraph.ts` (non exportée, voir le
 * commentaire de tête pour pourquoi elle est reproduite ici plutôt que modifiée en export). */
function tournerPointLocal(point: Point, theta: number): Point {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return { x: point.x * cos - point.y * sin, y: point.x * sin + point.y * cos };
}

/** Les 3 rayons illustrés en correction — voir le commentaire de tête pour pourquoi ce ne sont PAS
 * les rayons "abscisse entière" du commentaire de tête de `index.ts` (graphique trop grand). */
function rayonsIllustration(exercice: ExerciceConstructionParabole): [number, number, number] {
  const r1 = rCanonique(exercice);
  return [r1, r1 + 1, r1 + 2];
}

/** Points LOCAUX (pré-rotation) à couvrir par la grille/le viewBox — foyer, point de la directrice
 * sous le foyer, les 4 extrémités cardinales du plus grand des 3 cercles illustrés (pour que ce
 * cercle reste visuellement entier), ET les 6 points cibles eux-mêmes (`pointsCiblesIteration`,
 * déjà importée). Ces derniers sont indispensables : `calculerViewBoxGrilleTournee` calcule le
 * viewBox comme le rectangle englobant des points TOURNÉS qu'on lui donne, jamais l'enveloppe
 * convexe — les 4 extrémités cardinales d'un cercle ne couvrent, une fois tournées, QUE le losange
 * inscrit dans ce cercle (norme L1), pas le disque entier (norme L2) : un point cible qui n'est PAS
 * dans une direction cardinale (le cas général) peut donc rester sur le cercle mais hors de ce
 * losange, et se retrouver hors du viewBox si on ne le fournit pas lui-même explicitement — trouvé
 * par un test de propriété (smoke test, coordonnées SVG hors du canevas sur un échantillon aléatoire)
 * avant d'être corrigé ici, méthode "verify before fixing" du projet. */
function pointsCouverture(exercice: ExerciceConstructionParabole, rayons: [number, number, number]): Point[] {
  const { foyer } = exercice;
  const rMax = rayons[2];
  const cibles = rayons.flatMap((r) => pointsCiblesIteration(exercice, r));
  return [
    foyer,
    { x: foyer.x, y: 0 },
    { x: foyer.x - rMax, y: foyer.y },
    { x: foyer.x + rMax, y: foyer.y },
    { x: foyer.x, y: foyer.y + rMax },
    { x: foyer.x, y: foyer.y - rMax },
    ...cibles,
  ];
}

function projeter(point: Point, theta: number, echelle: Echelle): { x: number; y: number } {
  const tourne = tournerPointLocal(point, theta);
  return { x: echelle.sx(tourne.x), y: echelle.sy(tourne.y) };
}

/** Grille tournée dessinée "à la main" — même géométrie que `GrilleTournee`
 * (`components/mafsGraphPartage.tsx`) : lignes horizontales/verticales à espacement entier dans le
 * repère LOCAL, sur `±demiPortee`, chacune tournée par `theta` puis projetée en pixels. Aucune
 * graduation ni label numérique (même contrainte que l'écran). */
function construireGrilleHtml(demiPortee: number, theta: number, echelle: Echelle): string {
  const pas = 1;
  const nombreLignes = Math.ceil(demiPortee / pas);
  const lignes: string[] = [];
  for (let k = -nombreLignes; k <= nombreLignes; k++) {
    const v1 = projeter({ x: k * pas, y: -demiPortee }, theta, echelle);
    const v2 = projeter({ x: k * pas, y: demiPortee }, theta, echelle);
    lignes.push(`<line x1="${v1.x.toFixed(1)}" y1="${v1.y.toFixed(1)}" x2="${v2.x.toFixed(1)}" y2="${v2.y.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    const h1 = projeter({ x: -demiPortee, y: k * pas }, theta, echelle);
    const h2 = projeter({ x: demiPortee, y: k * pas }, theta, echelle);
    lignes.push(`<line x1="${h1.x.toFixed(1)}" y1="${h1.y.toFixed(1)}" x2="${h2.x.toFixed(1)}" y2="${h2.y.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }
  return lignes.join("");
}

/** Directrice (droite locale `y=0`, tournée) + foyer F (croix), avec leurs étiquettes "d"/"F" —
 * seuls éléments déjà connus de l'élève, présents aussi bien en énoncé qu'en correction. */
function construireDirectriceEtFoyerHtml(exercice: ExerciceConstructionParabole, demiPortee: number, echelle: Echelle): string {
  const { foyer, theta } = exercice;
  const d1 = projeter({ x: -demiPortee, y: 0 }, theta, echelle);
  const d2 = projeter({ x: demiPortee, y: 0 }, theta, echelle);
  const f = projeter(foyer, theta, echelle);
  const TAILLE_CROIX = 5;

  return (
    `<line x1="${d1.x.toFixed(1)}" y1="${d1.y.toFixed(1)}" x2="${d2.x.toFixed(1)}" y2="${d2.y.toFixed(1)}" stroke="${COULEUR_DIRECTRICE}" stroke-width="2"/>` +
    `<text x="${(d1.x + 6).toFixed(1)}" y="${(d1.y - 5).toFixed(1)}" font-size="11" font-weight="700" fill="${COULEUR_DIRECTRICE}">d</text>` +
    `<g stroke="${COULEUR_FOYER}" stroke-width="2.2">` +
    `<line x1="${(f.x - TAILLE_CROIX).toFixed(1)}" y1="${(f.y - TAILLE_CROIX).toFixed(1)}" x2="${(f.x + TAILLE_CROIX).toFixed(1)}" y2="${(f.y + TAILLE_CROIX).toFixed(1)}"/>` +
    `<line x1="${(f.x - TAILLE_CROIX).toFixed(1)}" y1="${(f.y + TAILLE_CROIX).toFixed(1)}" x2="${(f.x + TAILLE_CROIX).toFixed(1)}" y2="${(f.y - TAILLE_CROIX).toFixed(1)}"/>` +
    `</g>` +
    `<text x="${(f.x + 8).toFixed(1)}" y="${(f.y - 6).toFixed(1)}" font-size="12" font-weight="700" fill="${COULEUR_FOYER}">F</text>`
  );
}

/** Construction complète (correction uniquement) : les 3 cercles (compas, bleu), les 3 parallèles
 * (équerre, orange), les 6 points d'intersection (vert) et la courbe de la parabole reliant ces
 * points (vert, `evaluerParaboleLocale` — jamais recalculée indépendamment). */
function construireConstructionHtml(exercice: ExerciceConstructionParabole, rayons: [number, number, number], demiPortee: number, echelle: Echelle): string {
  const { foyer, theta } = exercice;
  const f = projeter(foyer, theta, echelle);

  const cercles = rayons
    .map((r) => `<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="${echelle.rayon(r).toFixed(1)}" fill="none" stroke="${COULEUR_COMPAS}" stroke-width="1.6"/>`)
    .join("");

  const paralleles = rayons
    .map((r) => {
      const p1 = projeter({ x: -demiPortee, y: r }, theta, echelle);
      const p2 = projeter({ x: demiPortee, y: r }, theta, echelle);
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${COULEUR_EQUERRE}" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    })
    .join("");

  const cibles = rayons.flatMap((r) => pointsCiblesIteration(exercice, r));
  const points = cibles
    .map((p) => {
      const px = projeter(p, theta, echelle);
      return `<circle cx="${px.x.toFixed(1)}" cy="${px.y.toFixed(1)}" r="3.2" fill="${COULEUR_POINT}"/>`;
    })
    .join("");

  const xMinLocal = Math.min(...cibles.map((p) => p.x));
  const xMaxLocal = Math.max(...cibles.map((p) => p.x));
  const courbePoints: string[] = [];
  for (let i = 0; i <= PAS_ECHANTILLONNAGE_COURBE; i++) {
    const x = xMinLocal + (xMaxLocal - xMinLocal) * (i / PAS_ECHANTILLONNAGE_COURBE);
    const y = evaluerParaboleLocale(exercice, x);
    const px = projeter({ x, y }, theta, echelle);
    courbePoints.push(`${px.x.toFixed(1)},${px.y.toFixed(1)}`);
  }
  const courbe = `<polyline points="${courbePoints.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.4"/>`;

  return `${cercles}${paralleles}${courbe}${points}`;
}

/** Graphique complet (grille + directrice + F), avec en plus la construction (cercles, parallèles,
 * points, courbe) quand `avecConstruction` (réservé à la correction — jamais l'énoncé, qui ne doit
 * pas trahir la réponse). Le viewBox est TOUJOURS calculé en tenant compte des 3 cercles (même s'ils
 * ne sont pas affichés) — sur papier, contrairement à l'écran (Mafs pan/zoom), la grille imprimée en
 * énoncé doit déjà montrer assez d'espace pour que l'élève y trace sa construction sans en sortir. */
function construireSvgConstructionParabole(exercice: ExerciceConstructionParabole, avecConstruction: boolean): string {
  const rayons = rayonsIllustration(exercice);
  const couverture = pointsCouverture(exercice, rayons);
  const viewBox = calculerViewBoxGrilleTournee(couverture, exercice.theta);
  const demiPortee = demiPorteeGrilleTournee(couverture);
  const echelle = construireEchelle(viewBox);

  const grilleHtml = construireGrilleHtml(demiPortee, exercice.theta, echelle);
  const directriceFoyerHtml = construireDirectriceEtFoyerHtml(exercice, demiPortee, echelle);
  const constructionHtml = avecConstruction ? construireConstructionHtml(exercice, rayons, demiPortee, echelle) : "";

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${directriceFoyerHtml}
${constructionHtml}
</svg>`;
}

const CONSIGNE_PAPIER =
  "Construis la parabole de foyer F et de directrice d au compas et à l'équerre, sans aucun calcul de coordonnées : " +
  "choisis un premier rayon (strictement supérieur à la moitié de la distance de F à d), trace au compas le cercle de " +
  "centre F et ce rayon, puis à l'équerre la droite parallèle à d, à cette même distance, du côté de F — les 2 points " +
  "d'intersection appartiennent à la parabole. Répète cette construction pour 2 autres rayons, tous différents du " +
  "premier (6 points en tout), puis relie les 6 points par une courbe régulière, de gauche à droite, pour tracer la " +
  "parabole.";

function construireEnonceConstructionParabole(exercice: ExerciceConstructionParabole): SectionExercice {
  return {
    enteteFragments: [texte("On donne le foyer F et la directrice d d'une parabole.")],
    enteteHtml: construireSvgConstructionParabole(exercice, false),
    questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
  };
}

function construireCorrectionConstructionParabole(exercice: ExerciceConstructionParabole): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgConstructionParabole(exercice, true) },
    {
      type: "paragraphe",
      fragments: [
        texte(
          "Principe : un point M appartient à la parabole si et seulement s'il est à la même distance du foyer F et de " +
            "la directrice d. Pour un rayon r choisi (en bleu ci-dessus, cercle de centre F), les points de la parallèle " +
            "à d située à distance r de d, du côté de F (en orange, pointillé), sont à la fois à distance r de F ET à " +
            "distance r de d — ils sont donc exactement sur la parabole. Les 2 points d'intersection cercle/parallèle " +
            "donnent ainsi 2 points de la courbe à chaque rayon choisi (en vert ci-dessus).",
        ),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte(
          "En reliant les points obtenus pour plusieurs rayons, de gauche à droite, on fait apparaître la courbe " +
            "complète (en vert). Le sommet de la parabole est le point de la courbe le plus proche de la directrice — il " +
            "se trouve exactement à mi-chemin entre F et d, sur la perpendiculaire à d passant par F, et la parabole " +
            "s'ouvre du côté du foyer, en s'écartant de la directrice.",
        ),
      ],
    },
  ];
}

export const adaptateurEvaluationConstructionParabole: AdaptateurFeuilleExercices<ExerciceConstructionParabole> = {
  titreDocument: "Construction graphique de la parabole — Évaluation",
  nomFichierBase: "construction-parabole",
  genererInstance: genererExerciceConstructionParabole,
  construireEnonce: construireEnonceConstructionParabole,
  construireCorrection: construireCorrectionConstructionParabole,
  // PAS regroupable — `enteteHtml` (le graphique) est utilisé, ce qui disqualifie `regroupable` à lui
  // seul, quelle que soit la consigne (voir le commentaire de tête).
};
