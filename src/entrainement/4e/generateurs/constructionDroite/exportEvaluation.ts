import type { ExerciceConstructionDroite } from "../../core/constructionDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { calculerPasGrille } from "../../ui/mafsTransformation";
import { pasGrilleConstructionDroite } from "../../ui/constructionDroiteGraph";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";
import { formatPointLatex, formatValeurGenereeLatex } from "../../ui/formatEquationDroite";
import { consignePoints, formatEnonceLatex, texteAidePointsNiveau1 } from "../../ui/formatConstructionDroite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceConstructionDroite } from "./index";
import { LIBELLE_CAS_PARALLELE_AXE, profilConstructionDroite } from "../profilsEvaluation4eCh7Droites";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceConstructionDroite>` pour gen44 ("Construction
 * graphique — tracer une droite depuis son équation", `AppConstructionDroite.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/constructionVectorielle/exportEvaluation.ts` pour l'analogue le plus proche déjà
 * porté (même famille de problème : un graphique vierge imprimé, l'élève y trace quelque chose —
 * ici une droite entière plutôt qu'un vecteur borné entre 2 points).
 *
 * Chapitre Math-Belgium "Géométrie analytique plane" (4e), section "Lire et tracer une droite"
 * (`lire-tracer`, `src/content/chapters/4e/geometrie-analytique-plane.ts`). **Cette section est
 * servie par DEUX générateurs** : gen44 (celui-ci, construction = tracer une droite donnée) ET
 * gen43 (`lectureGraphiqueDroite`, lecture = lire l'équation d'une droite déjà tracée), porté par
 * un autre agent en parallèle — seul `generateurs/constructionDroite/` est touché ici.
 *
 * **Écran → question** : `AppConstructionDroite.tsx` a 2 phases séquentielles
 * (`moteur/sessionConstructionDroite.ts`, `PhaseConstructionDroite`) — écran "points" (l'élève
 * donne 2 points entiers de la droite) PUIS écran "trace" (il place ces 2 points sur un graphe
 * interactif, `ConstructionDroiteGraph.tsx`, `MovablePoint` + `Line.ThroughPoints` en temps réel).
 * Cette séquence en 2 temps n'a de sens QUE parce que l'écran vérifie chaque étape indépendamment
 * (droite mal choisie détectée avant même le placement). Sur papier, il n'y a aucune vérification
 * intermédiaire possible : les 2 écrans se réduisent donc à UNE seule question — donner l'équation,
 * demander de tracer directement la droite sur un graphique vierge déjà imprimé — même simplification
 * que `constructionVectorielle/exportEvaluation.ts` (qui fusionne de la même façon son unique écran
 * en une seule question, cf. son commentaire de tête).
 *
 * **Représentation papier** : grille + axes vierges (aucune droite tracée — ce serait donner la
 * réponse) sous l'équation donnée (`construireEnonceConstructionDroite`), une droite ENTIÈRE
 * (prolongée jusqu'aux bords du graphique, pas un simple segment/vecteur borné — `clipLigneAuViewBox`
 * ci-dessous) tracée en bleu (même couleur que `ConstructionDroiteGraph.tsx::COULEUR_DROITE` =
 * `#1971c2`) en correction. Aucun moteur de tracé SVG générique n'existe dans `export/` pour ce cas
 * (grille + droite complète clippée à un rectangle) — même constat que `constructionVectorielle`
 * ("chacun le sien" — `boiteMoustaches`/`triangleLies`/`constructionVectorielle` ont chacun le leur) :
 * ce fichier écrit donc le sien, mais réutilise la géométrie pure déjà partagée par l'écran
 * interactif plutôt que de la dupliquer — `ui/vecteurGraph.ts::calculerViewBoxVecteurs` (même calcul
 * de viewBox — marge fixe + ratio `RATIO_GRAPHE` — que `viewBoxConstructionDroite`, qui l'appelle
 * aussi) et `ui/mafsTransformation.ts::calculerPasGrille` (même pas de grille "nombre rond" que
 * `GrilleAdaptative`). Le viewBox est calculé à partir de `exercice.point` et
 * `exercice.point + exercice.vecteur` — 2 points ENTIERS de la droite, garantis distincts et
 * toujours valides quelle que soit `variante` (voir `core/constructionDroite.types.ts`, champ
 * `point`/`vecteur` — jamais montrés numériquement à l'élève, mais utilisables ici comme n'importe
 * quelle autre valeur déjà connue et correcte de l'instance tirée). Le même viewBox sert à l'énoncé
 * ET à la correction (comme `constructionVectorielle`) : la grille imprimée dans l'énoncé doit déjà
 * montrer assez d'espace pour que l'élève puisse y tracer sa droite sans en sortir.
 *
 * **Deux points, pas un vecteur** : contrairement à `constructionVectorielle` (qui trace un segment
 * borné entre 2 points précis), une droite est en principe infinie — `clipLigneAuViewBox` calcule
 * donc l'intersection de la droite (point, vecteur directeur) avec le rectangle du viewBox
 * (algorithme de clipping paramétrique classique, borne `t` par les 4 côtés du rectangle) et trace
 * le segment résultant, qui occupe tout le graphique plutôt que de s'arrêter à A/B — geste bien plus
 * proche de ce qu'un élève trace réellement à la règle sur un graphique imprimé.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et correctes de l'instance tirée
 * (`exercice.point`, `exercice.vecteur` — jamais recalculées indépendamment) : `texteAidePointsNiveau1`
 * (`ui/formatConstructionDroite.ts`, déjà partagée avec l'écran 1) est RÉUTILISÉE telle quelle pour
 * la méthode ("substitue une valeur, calcule l'autre coordonnée, recommence") — seul le second point
 * d'exemple diffère : l'écran ne montre jamais qu'UN point d'exemple (`formatAidePointsNiveau2Latex`,
 * aide niveau 2 seulement), alors que la correction papier a besoin des 2 points explicitement pour
 * justifier le tracé — `exercice.point` et `exercice.point + exercice.vecteur` sont TOUJOURS deux
 * points distincts et valides de la droite quelle que soit `variante` (vérifié algébriquement pour
 * les 4 formes en lisant `generateurs/droite/geometrieDroite.ts` : chaque forme de sortie est
 * dérivée directement de ce couple point/vecteur, donc les deux lui appartiennent par construction).
 *
 * **PAS `regroupable`** — les 2 conditions disqualifiantes de `AdaptateurFeuilleExercices.regroupable`
 * (`export/genererFeuilleExercices.ts`) sont TOUTES DEUX réunies : (1) la consigne
 * (`consigneTraceExport` ci-dessous) dépend de `variante` (texte différent pour "parametrique" vs les
 * 3 formes cartésiennes) — jamais générique/indépendante de l'instance ; (2) `enteteHtml` (le
 * graphique) est utilisé, ce qui disqualifie `regroupable` à lui seul, quelle que soit la consigne
 * (voir la doc du champ). Même décision que `constructionVectorielle/exportEvaluation.ts`.
 *
 * **Consigne propre à l'export, jamais celle de l'écran** : `consigneGeneraleTrace`
 * (`ui/formatConstructionDroite.ts`) suppose l'équation affichée SOUS la consigne ("... ci-dessous"),
 * cohérent avec l'ordre d'affichage de l'écran (consigne puis équation). Le pipeline HTML évaluation
 * affiche systématiquement `enteteFragments` (ici l'équation) AVANT `enteteHtml`/les questions
 * (`assemblerEvaluationHtml.ts::corpsQuestionHtml`) — l'ordre inverse. Réutiliser tel quel le texte de
 * l'écran produirait donc un contresens spatial ("ci-dessous" pointant vers un graphique, pas vers
 * l'équation déjà affichée au-dessus) ; `consigneTraceExport` ci-dessous est donc une variante de
 * formulation ADAPTÉE à cet ordre d'affichage inversé, pas une réécriture arbitraire.
 *
 * Pas de zone de réponse vierge (`reponse` omis sur l'unique question, comportement par défaut,
 * SANS AUCUN EFFET sur le pipeline HTML évaluation qui n'affiche jamais de zone de réponse — voir le
 * commentaire de tête de `corpsQuestionHtml`) : la réponse attendue est un TRACÉ sur la grille déjà
 * imprimée dans l'énoncé, jamais une ligne de texte à remplir en dessous — même raison que
 * `constructionVectorielle`/`boiteMoustaches`/`triangleLies`.
 */

const LARGEUR_SVG = 280;
const RATIO_SVG = 3 / 2; // même RATIO_GRAPHE que l'écran (ui/mafsTransformation.ts).
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_SVG);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_POINT = "#495057";
const COULEUR_DROITE = "#1971c2"; // même couleur que ConstructionDroiteGraph.tsx::COULEUR_DROITE.

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
}

/** Cadre PAPIER : le cadre de l'écran (`calculerViewBoxVecteurs`) étendu pour contenir l'origine — sur papier, sans
 * axes ni graduations dans le cadre, les coordonnées des points ne se liraient pas (l'écran, lui,
 * étend sa vue jusqu'aux axes, `etendreViewBoxPourEtiquettes`). Les unités restent carrées : la
 * dimension la moins remplie est élargie symétriquement pour garder le rapport de la zone tracée. */
function cadrePapier(viewBox: ViewBoxTransformation): ViewBoxTransformation {
  let [xMin, xMax] = viewBox.x;
  let [yMin, yMax] = viewBox.y;
  xMin = Math.min(xMin, -1);
  xMax = Math.max(xMax, 1);
  yMin = Math.min(yMin, -1);
  yMax = Math.max(yMax, 1);
  const rapport = (LARGEUR_SVG - 2 * MARGE_PX) / (HAUTEUR_SVG - 2 * MARGE_PX);
  const largeur = xMax - xMin;
  const hauteur = yMax - yMin;
  if (largeur / hauteur < rapport) {
    const ajout = (hauteur * rapport - largeur) / 2;
    xMin -= ajout;
    xMax += ajout;
  } else {
    const ajout = (largeur / rapport - hauteur) / 2;
    yMin -= ajout;
    yMax += ajout;
  }
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

function construireEchelle(viewBox: ViewBoxTransformation): Echelle {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = LARGEUR_SVG - 2 * MARGE_PX;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_PX;
  return {
    sx: (x) => MARGE_PX + ((x - xMin) / (xMax - xMin)) * zoneX,
    sy: (y) => HAUTEUR_SVG - MARGE_PX - ((y - yMin) / (yMax - yMin)) * zoneY,
  };
}

/** Grille "nombre rond" (`calculerPasGrille`, même fonction que l'écran) + axes x=0/y=0 — géométrie
 * en attributs SVG inline, même patron que `constructionVectorielle/exportEvaluation.ts::construireGrilleEtAxesHtml`
 * (document HTML d'évaluation autonome, sans dépendance à `App.css`). */
function construireGrilleEtAxesHtml(viewBox: ViewBoxTransformation, echelle: Echelle): string {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  // Pas de 1 comme à l'écran (`pasGrilleConstructionDroite`), adaptatif seulement pour un cadre très
  // large.
  const pasFixe = pasGrilleConstructionDroite(viewBox);
  const pasX = pasFixe ?? calculerPasGrille(xMax - xMin);
  const pasY = pasFixe ?? calculerPasGrille(yMax - yMin);

  const lignes: string[] = [];
  const labels: string[] = [];

  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = echelle.sx(v);
    lignes.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_PX}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${px.toFixed(1)}" y="${(echelle.sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${formatNombreGraphique(v)}</text>`);
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = echelle.sy(v);
    lignes.push(`<line x1="${MARGE_PX}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${(echelle.sx(0) - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${formatNombreGraphique(v)}</text>`);
    }
  }

  const axeX = `<line x1="${MARGE_PX}" y1="${echelle.sy(0).toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${echelle.sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${echelle.sx(0).toFixed(1)}" y1="${MARGE_PX}" x2="${echelle.sx(0).toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  // Graduations APRÈS la droite (marqueur de coupure) : une droite qui passe sur une graduation ne la masque pas.
  return `${lignes.join("")}${axeX}${axeY}<!--graduations-->${labels.join("")}`;
}

function construirePointHtml(point: Point, label: string, echelle: Echelle): string {
  const px = echelle.sx(point.x);
  const py = echelle.sy(point.y);
  return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${COULEUR_POINT}"/><text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="${COULEUR_POINT}">${label}</text>`;
}

/** Clippe la droite infinie `{point + t·vecteur, t ∈ ℝ}` au rectangle du viewBox — algorithme de
 * clipping paramétrique classique (borne l'intervalle de `t` par les 4 côtés du rectangle, un axe à
 * la fois). `vecteur` n'a jamais de composante nulle ici (`constructionDroite/index.ts::tirerVecteur`,
 * jamais un vecteur horizontal/vertical), donc les deux branches `x!==0`/`y!==0` sont toujours
 * empruntées en pratique — les branches `else` (vecteur horizontal/vertical) restent écrites par
 * robustesse, jamais exercées par ce générateur précis mais sans coût à les couvrir. Retourne
 * toujours un segment non vide : `point` est garanti strictement à l'intérieur du rectangle
 * (`calculerViewBoxVecteurs` marge chaque point d'au moins 1.5 unité), donc `tMin<0<tMax` toujours. */
function clipLigneAuViewBox(point: Point, vecteur: Composantes, viewBox: ViewBoxTransformation): [Point, Point] {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  let tMin = -Infinity;
  let tMax = Infinity;

  if (vecteur.x !== 0) {
    const t1 = (xMin - point.x) / vecteur.x;
    const t2 = (xMax - point.x) / vecteur.x;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (vecteur.y !== 0) {
    const t1 = (yMin - point.y) / vecteur.y;
    const t2 = (yMax - point.y) / vecteur.y;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  return [
    { x: point.x + tMin * vecteur.x, y: point.y + tMin * vecteur.y },
    { x: point.x + tMax * vecteur.x, y: point.y + tMax * vecteur.y },
  ];
}

function construireDroiteHtml(point: Point, vecteur: Composantes, echelle: Echelle, viewBox: ViewBoxTransformation): string {
  const [p1, p2] = clipLigneAuViewBox(point, vecteur, viewBox);
  const x1 = echelle.sx(p1.x);
  const y1 = echelle.sy(p1.y);
  const x2 = echelle.sx(p2.x);
  const y2 = echelle.sy(p2.y);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="2.2"/>`;
}

function secondPoint(point: Point, vecteur: Composantes): Point {
  return { x: point.x + vecteur.x, y: point.y + vecteur.y };
}

/** Construit le graphique complet (grille + axes), avec en plus la droite tracée (bleue, prolongée
 * jusqu'aux bords du graphique) et les 2 points A/B repères quand `avecTrace` — réservé à la
 * correction, jamais l'énoncé (qui ne doit montrer qu'une grille vierge). Le viewBox est TOUJOURS
 * calculé à partir des mêmes 2 points, que la droite soit affichée ou non (voir commentaire de tête :
 * l'énoncé doit déjà montrer assez d'espace pour que l'élève y trace sa droite sans en sortir). */
function construireSvgConstructionDroite(exercice: ExerciceConstructionDroite, avecTrace: boolean): string {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);
  const viewBox = cadrePapier(calculerViewBoxVecteurs([
    { point, label: "" },
    { point: pointB, label: "" },
    ]));
  const echelle = construireEchelle(viewBox);

  const [grilleHtml, graduationsHtml] = construireGrilleEtAxesHtml(viewBox, echelle).split("<!--graduations-->");
  const droiteHtml = avecTrace ? construireDroiteHtml(point, vecteur, echelle, viewBox) : "";
  const pointsHtml = avecTrace ? `${construirePointHtml(point, "A", echelle)}${construirePointHtml(pointB, "B", echelle)}` : "";

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${droiteHtml}
${graduationsHtml}
${pointsHtml}
</svg>`;
}

/** Consigne de l'unique question — voir le commentaire de tête pour pourquoi ce n'est PAS
 * `consigneGeneraleTrace` (`ui/formatConstructionDroite.ts`), écrite pour l'ordre d'affichage inverse
 * de l'écran. Dépend de `variante` (paramétrique vs cartésienne) — disqualifie `regroupable`. */
/** Étapes du corrigé (une par écran) : jamais de repère vierge imprimé — l'élève trace sur sa
 * feuille (même décision que la boîte à moustaches à construire, `boiteMoustaches/exportEvaluation.ts`). */
const CONSIGNE_TRACE_PAPIER = "Place ces deux points dans un repère orthonormé, puis trace la droite qui les relie, prolongée de part et d'autre.";

function construireEnonceConstructionDroite(exercice: ExerciceConstructionDroite): SectionExercice {
  return {
    enteteFragments: [texte("Équation de la droite : "), latex(formatEnonceLatex(exercice))],
    questions: [{ consigne: [texte(consignePoints(exercice))] }, { consigne: [texte(CONSIGNE_TRACE_PAPIER)] }],
  };
}

function construireCorrectionConstructionDroite(exercice: ExerciceConstructionDroite): BlocCorrection[] {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);

  return [
    { type: "html", html: construireSvgConstructionDroite(exercice, true) },
    { type: "paragraphe", fragments: [texte(texteAidePointsNiveau1(exercice))] },
    {
      type: "paragraphe",
      fragments: [
        texte("Deux points de la droite ainsi obtenus : "),
        latex(`A${formatPointLatex(point)}`),
        texte(" et "),
        latex(`B${formatPointLatex(pointB)}`),
        texte(" — il suffit de les relier par une droite complète, prolongée jusqu'aux bords du graphique."),
      ],
    },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les 2 écrans (deux points entiers, puis placement) sont les étapes d'APPRENTISSAGE : sur papier,
// l'énoncé donne l'équation et UNE consigne (tracer la droite sur sa feuille). Le corrigé montre
// les deux points trouvés (étape a) puis la droite attendue (étape b, figure `figureHtml`).

function enoncePapier(exercice: ExerciceConstructionDroite): EnoncePapier {
  const intro =
    exercice.variante === "parametrique"
      ? "Trace, dans un repère orthonormé sur ta feuille, la droite d dont des équations paramétriques sont :"
      : "Trace, dans un repère orthonormé sur ta feuille, la droite d d'équation :";
  return { section: { enteteFragments: [texte(intro), latex(formatEnonceLatex(exercice))], questions: [] } };
}

/** Comment chaque point s'obtient à partir de l'équation (valeur choisie ⇒ coordonnée calculée) —
 * A est le point de l'instance, B = A + vecteur directeur : tous deux réellement sur la droite. */
function calculPointLatex(exercice: ExerciceConstructionDroite, nom: string, p: Point, t: number): string {
  const v = formatValeurGenereeLatex;
  switch (exercice.variante) {
    case "parametrique":
      return `t = ${t} \\Rightarrow ${nom}${formatPointLatex(p)}`;
    case "implicite":
      return exercice.vecteur.x === 0 ? `y = ${v(p.y)} \\Rightarrow x = ${v(p.x)} : ${nom}${formatPointLatex(p)}` : `x = ${v(p.x)} \\Rightarrow y = ${v(p.y)} : ${nom}${formatPointLatex(p)}`;
    case "explicite_y": {
      const { m, p: o } = exercice.expliciteY!;
      if (m === 0) return `x = ${v(p.x)} \\Rightarrow y = ${v(o)} : ${nom}${formatPointLatex(p)}`;
      return `x = ${v(p.x)} \\Rightarrow y = ${v(m)} \\cdot ${p.x < 0 ? `(${v(p.x)})` : v(p.x)} ${o < 0 ? "-" : "+"} ${v(Math.abs(o))} = ${v(p.y)} : ${nom}${formatPointLatex(p)}`;
    }
    case "explicite_x": {
      const { n, q } = exercice.expliciteX!;
      if (n === 0) return `y = ${v(p.y)} \\Rightarrow x = ${v(q)} : ${nom}${formatPointLatex(p)}`;
      return `y = ${v(p.y)} \\Rightarrow x = ${v(n)} \\cdot ${p.y < 0 ? `(${v(p.y)})` : v(p.y)} ${q < 0 ? "-" : "+"} ${v(Math.abs(q))} = ${v(p.x)} : ${nom}${formatPointLatex(p)}`;
    }
  }
}

function piege(exercice: ExerciceConstructionDroite): EtapeCorrection {
  const { vecteur } = exercice;
  if (vecteur.x === 0) return { label: "Piège", sousQuestion: "b", fragments: [texte("Une équation du type "), latex("x = k"), texte(" représente une droite VERTICALE (tous ses points ont la même abscisse), pas un point de l'axe Ox.")] };
  if (vecteur.y === 0) return { label: "Piège", sousQuestion: "b", fragments: [texte("Une équation du type "), latex("y = k"), texte(" représente une droite HORIZONTALE (tous ses points ont la même ordonnée), pas un point de l'axe Oy.")] };
  switch (exercice.variante) {
    case "parametrique":
      return { label: "Piège", sousQuestion: "a", fragments: [texte("Une même valeur de t sert pour x ET pour y : on ne choisit pas une valeur de t différente dans chaque équation.")] };
    case "implicite":
      return { label: "Piège", sousQuestion: "a", fragments: [texte("Les coefficients a et b de l'équation ne sont pas les coordonnées d'un point de la droite : il faut vérifier que chaque point choisi satisfait l'équation.")] };
    default:
      return { label: "Piège", sousQuestion: "a", fragments: [texte("Avec un coefficient fractionnaire, toutes les valeurs ne donnent pas une coordonnée entière : on choisit une valeur multiple du dénominateur, sinon le point est difficile à placer précisément.")] };
  }
}

/** Méthode papier (3e personne) — même contenu que l'aide de l'écran (`texteAidePointsNiveau1`). */
function methodePoints(exercice: ExerciceConstructionDroite): FragmentConsigne[] {
  switch (exercice.variante) {
    case "parametrique":
      return [texte("On donne à t deux valeurs entières distinctes : chacune donne un point (x ; y) de d, avec la MÊME valeur de t dans les deux équations.")];
    case "implicite":
      return [texte("On fixe une valeur entière de x (ou de y si c'est plus simple) et on résout l'équation pour trouver l'autre coordonnée ; on recommence avec une autre valeur.")];
    case "explicite_y":
      return [texte("On remplace x par une valeur entière et on calcule "), latex("y = mx + p"), texte(" ; si m est une fraction, on prend x multiple de son dénominateur pour que y soit entier.")];
    case "explicite_x":
      return [texte("On remplace y par une valeur entière et on calcule "), latex("x = ny + q"), texte(" ; si n est une fraction, on prend y multiple de son dénominateur pour que x soit entier.")];
  }
}

function correctionDetaillee(exercice: ExerciceConstructionDroite): EtapeCorrection[] {
  const { point, vecteur } = exercice;
  const pointB = secondPoint(point, vecteur);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodePoints(exercice) },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(calculPointLatex(exercice, "A", point, 0))] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(calculPointLatex(exercice, "B", pointB, 1))] },
    {
      label: "Conclusion",
      sousQuestion: "b",
      fragments: [texte("On place "), latex(`A${formatPointLatex(point)}`), texte(" et "), latex(`B${formatPointLatex(pointB)}`), texte(", puis on trace la droite (AB), prolongée jusqu'aux bords du repère.")],
      figureHtml: construireSvgConstructionDroite(exercice, true),
    },
    piege(exercice),
  ];
}

function reponseBreve(exercice: ExerciceConstructionDroite): FragmentConsigne[] {
  const pointB = secondPoint(exercice.point, exercice.vecteur);
  return [texte("Droite passant par "), latex(`A${formatPointLatex(exercice.point)}`), texte(" et "), latex(`B${formatPointLatex(pointB)}`), texte(" (tout autre couple de points de d convient).")];
}

function bareme(exercice: ExerciceConstructionDroite): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Premier point de d correct (coordonnées vérifiant l'équation)")], points: 1 },
      { sousQuestion: "a", critere: [texte("Second point de d correct, distinct du premier")], points: 1 },
      { sousQuestion: "b", critere: [texte("Points placés correctement dans le repère")], points: 1 },
      { sousQuestion: "b", critere: [texte("Droite tracée à la règle et prolongée des deux côtés")], points: 1 },
    ],
    erreursFrequentes: [
      exercice.vecteur.x === 0 || exercice.vecteur.y === 0
        ? { description: [texte("Droite parallèle à l'autre axe (horizontale et verticale confondues)")], cout: "0 pt sur b)" }
        : { description: [texte("Point dont les coordonnées ne vérifient pas l'équation (erreur de calcul)")], cout: "−1 par point" },
      { description: [texte("Segment [AB] tracé au lieu de la droite entière")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Toute construction exacte de la même droite, quels que soient les deux points choisis")]],
  };
}

/** ★ droite parallèle à un axe ; ★★★ coefficient fractionnaire (forme explicite) ; ★★ sinon. */
function difficulte(exercice: ExerciceConstructionDroite): 1 | 2 | 3 {
  if (exercice.vecteur.x === 0 || exercice.vecteur.y === 0) return 1;
  const fractionnaire =
    (exercice.expliciteY !== null && !Number.isInteger(exercice.expliciteY.m)) || (exercice.expliciteX !== null && !Number.isInteger(exercice.expliciteX.n));
  return fractionnaire ? 3 : 2;
}

export const adaptateurEvaluationConstructionDroite: AdaptateurFeuilleExercices<ExerciceConstructionDroite> = {
  titreDocument: "Construction graphique — tracer une droite — Évaluation",
  nomFichierBase: "construction-droite",
  genererInstance: genererExerciceConstructionDroite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceConstructionDroite,
  construireCorrection: construireCorrectionConstructionDroite,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 4,
  profilInstance: profilConstructionDroite,
  libelleCasParticulier: LIBELLE_CAS_PARALLELE_AXE,
  // PAS regroupable — consigne dépendante de `variante` (paramétrique vs cartésienne, jamais
  // générique) ET `enteteHtml` (le graphique) utilisé, qui disqualifie `regroupable` à lui seul :
  // voir le commentaire de tête.
};
