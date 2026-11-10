import type { ExerciceLectureGraphiqueLimites } from "../../core5e/lectureGraphiqueLimites.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import { formatReponseAttendueCompleterLimitesLatex, formatReponseAttendueNommerAsymptotesLatex } from "../../ui5e/formatLectureGraphiqueLimites";
import { BUFFER_VA, calculerBornesXLimites, calculerViewBoxLectureGraphique, construireMarqueursPointIsole, construirePieces, evaluerPieceMelangee } from "../../ui5e/lectureGraphiqueLimitesCourbe";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceLectureGraphiqueLimites } from "./index";
import { profilLectureGraphiqueLimites } from "../profilsEvaluationLimites22-23";

// `listeAsymptotes` (+ les types `IdAsymptote`/`CibleAsymptote`/`SlotAsymptote`) DUPLIQUÉS ici depuis `moteur5e/typesLectureGraphiqueLimites.ts`
// — `generateurs*/` n'importe JAMAIS `moteur*/` (règle non négociable du CLAUDE.md racine), y compris pour
// un import de simples types : TypeScript reste structurellement typé, donc ces définitions locales,
// identiques à celles de `moteur5e`, restent bien assignables aux paramètres de `labelComportementLatex`/
// `labelAsymptoteLatex` (`ui5e/formatLectureGraphiqueLimites.ts`) sans avoir besoin d'importer les symboles
// `moteur5e` eux-mêmes. Copie fidèle des fonctions — à resynchroniser si le tirage géométrique de
// `core5e/lectureGraphiqueLimites.types.ts` change.

type IdAsymptote = { kind: "va"; index: number } | { kind: "horizontale"; cote?: "gauche" | "droit" } | { kind: "oblique" };
type CibleAsymptote = { kind: "verticale"; x: number } | { kind: "horizontale"; y: number } | { kind: "oblique"; pente: number; ordonnee: number };

interface SlotAsymptote {
  id: IdAsymptote;
  cible: CibleAsymptote;
}

function listeAsymptotes(exercice: ExerciceLectureGraphiqueLimites): SlotAsymptote[] {
  const slots: SlotAsymptote[] = exercice.vas.map((va, index) => ({ id: { kind: "va", index }, cible: { kind: "verticale", x: va.position } }));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    if (infini.limitePlusInfini === infini.limiteMoinsInfini) {
      slots.push({ id: { kind: "horizontale" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    } else {
      slots.push({ id: { kind: "horizontale", cote: "gauche" }, cible: { kind: "horizontale", y: infini.limiteMoinsInfini } });
      slots.push({ id: { kind: "horizontale", cote: "droit" }, cible: { kind: "horizontale", y: infini.limitePlusInfini } });
    }
  } else if (infini.type === "oblique") {
    slots.push({ id: { kind: "oblique" }, cible: { kind: "oblique", pente: infini.pente, ordonnee: infini.ordonnee } });
  }
  return slots;
}

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLectureGraphiqueLimites>` pour 5gen22 ("Limites et
 * asymptotes — lecture graphique") — feuille d'évaluation.
 *
 * Écran interactif = 2 phases (`completerLimites` puis `nommerAsymptotes`, la 2e sautée si aucune
 * asymptote n'est présente — voir `moteur5e/typesLectureGraphiqueLimites.ts::ordreComplet`) sur LE
 * MÊME graphique. Condensées ici en UNE seule question papier : le graphique une fois (`enteteHtml`),
 * suivi de tous les blancs à compléter (limites puis équations d'asymptotes) comme une liste
 * lettrée a)/b)/c)… — jamais reconstruit indépendamment : chaque label (`labelComportementLatex`/
 * `labelAsymptoteLatex`) et chaque réponse (`formatReponseAttendue*Latex`) vient de
 * `ui5e/formatLectureGraphiqueLimites.ts`, la même couche présentation que l'écran.
 *
 * Graphique : `enteteHtml`, un unique `<svg>` construit via `construireSvgFonction`
 * (`export/svgGraph.ts`, RÉUTILISÉ tel quel pour la grille/les axes/l'échantillonnage de la courbe)
 * — jamais `enteteFragments` pour le graphique lui-même (aucun équivalent SVG côté Word/PDF, voir
 * doc de `SectionExercice.enteteHtml`). La fonction évaluée est un simple aiguillage par morceau
 * (`construirePieces`/`evaluerPieceMelangee`, bornes FIXES `calculerBornesXLimites` — RÉUTILISÉS tels
 * quels depuis `ui5e/lectureGraphiqueLimitesCourbe.ts`, jamais réévalués indépendamment), qui renvoie
 * `null` dans le buffer `BUFFER_VA` autour de chaque AV : `construireSvgFonction` traite chaque `null`
 * comme une VRAIE coupure (voir son en-tête), donc une branche séparée de part et d'autre — EXACTEMENT
 * le même signal que `Plot.OfX` par morceau côté écran, sans dupliquer son mélange sigmoïde.
 *
 * Asymptotes dessinées en pointillés : `construireSvgFonction` n'a NUL paramètre pour des lignes
 * arbitraires (seulement `points`, pour des marqueurs ponctuels) — les asymptotes (verticales,
 * horizontale(s), oblique) sont donc ajoutées en POST-TRAITEMENT du `<svg>` déjà produit (une poignée
 * de `<line>` réinsérées juste avant `</svg>`), avec la MÊME transformation données→pixels que
 * `construireSvgFonction` (`sx`/`sy`, dupliquées ici car la fonction ni ses constantes internes —
 * `MARGE` — ne sont exportées : voir `MARGE_SVG_LOCALE` ci-dessous, à resynchroniser si cette
 * constante change côté `svgGraph.ts`). Même principe que `Line.PointAngle`/`Line.PointSlope` de
 * `LectureGraphiqueLimitesGraph.tsx` (dashed, opacité réduite) — jamais de texte "x=..."/"y=..." sur
 * le graphique lui-même (l'écran n'en affiche pas non plus, seule la position/direction compte, le
 * nom de chaque asymptote est justement ce qui est demandé en question). Les points isolés de
 * continuité (`construireMarqueursPointIsole`, RÉUTILISÉ tel quel) sont eux rendus nativement via
 * `options.points` de `construireSvgFonction` (pas de post-traitement nécessaire pour ceux-là).
 */

const LARGEUR_GRAPHE = 300;
const HAUTEUR_GRAPHE = 240;
// Dupliqué depuis `MARGE` de `export/svgGraph.ts` (non exportée) — UNIQUEMENT pour repositionner les
// lignes d'asymptote au même repère pixel que la courbe déjà tracée par `construireSvgFonction`.
const MARGE_SVG_LOCALE = 10;
// `COULEUR_AXE` de `export/svgGraph.ts` — dashed, pour rester distinct du bleu de la courbe
// (`COULEUR_COURBE_DEFAUT`) et du gris très clair de la grille (`COULEUR_GRILLE`).
const COULEUR_ASYMPTOTE = "#495057";

/** Aiguillage par morceau — bornes FIXES (`calculerBornesXLimites`), jamais le viewport (voir la doc
 * de `construireSegments` dans `ui5e/lectureGraphiqueLimitesCourbe.ts` sur ce piège, non pertinent
 * ici puisqu'un SVG imprimé n'a ni zoom ni pan, mais la fonction évaluée doit rester cohérente avec
 * le viewBox fixe passé à `construireSvgFonction`). */
function construireEvaluerGrapheLimites(exercice: ExerciceLectureGraphiqueLimites): (x: number) => number | null {
  const [xMin, xMax] = calculerBornesXLimites(exercice);
  const zones = construirePieces(exercice).map((piece) => ({
    piece,
    lo: piece.loVA === null ? xMin : piece.loVA + BUFFER_VA,
    hi: piece.hiVA === null ? xMax : piece.hiVA - BUFFER_VA,
  }));
  return (x: number) => {
    const zone = zones.find((z) => x >= z.lo && x <= z.hi);
    return zone ? evaluerPieceMelangee(zone.piece, zone.lo, zone.hi, x) : null;
  };
}

function construireLigneAsymptoteSvg(x1: number, y1: number, x2: number, y2: number, viewBox: ViewBoxSvg): string {
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return `<line x1="${sx(x1).toFixed(1)}" y1="${sy(y1).toFixed(1)}" x2="${sx(x2).toFixed(1)}" y2="${sy(y2).toFixed(1)}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.6"/>`;
}

/** Une ligne pointillée par asymptote RÉELLEMENT présente — même tirage de comportement à l'infini
 * que `LectureGraphiqueLimitesGraph.tsx` (0, 1 ou 2 horizontales selon égalité en ±∞ ; oblique unique
 * ; aucune ligne pour `infini.type === "aucune"`). */
function construireLignesAsymptotesSvg(exercice: ExerciceLectureGraphiqueLimites, viewBox: ViewBoxSvg): string {
  const lignes: string[] = exercice.vas.map((va) => construireLigneAsymptoteSvg(va.position, viewBox.yMin, va.position, viewBox.yMax, viewBox));
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    const valeurs = infini.limitePlusInfini === infini.limiteMoinsInfini ? [infini.limitePlusInfini] : [infini.limitePlusInfini, infini.limiteMoinsInfini];
    for (const y of valeurs) lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, y, viewBox.xMax, y, viewBox));
  } else if (infini.type === "oblique") {
    lignes.push(construireLigneAsymptoteSvg(viewBox.xMin, infini.pente * viewBox.xMin + infini.ordonnee, viewBox.xMax, infini.pente * viewBox.xMax + infini.ordonnee, viewBox));
  }
  return lignes.join("");
}

function construireSvgLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): string {
  const vb = calculerViewBoxLectureGraphique(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const points = construireMarqueursPointIsole(exercice).map((m) => ({ x: m.x, y: m.y }));
  const svg = construireSvgFonction(construireEvaluerGrapheLimites(exercice), viewBox, {
    largeur: LARGEUR_GRAPHE,
    hauteur: HAUTEUR_GRAPHE,
    classe: "graphe-limites",
    points,
  });
  // Post-traitement : voir l'en-tête du fichier — `construireSvgFonction` n'a pas de paramètre pour
  // des lignes arbitraires, les asymptotes sont réinsérées ici, APRÈS la courbe/les points (donc
  // rendues par-dessus, comme les traits `dashed` de `LectureGraphiqueLimitesGraph.tsx`).
  return svg.replace("</svg>", `${construireLignesAsymptotesSvg(exercice, viewBox)}</svg>`);
}

// ============================================================================
// Feuilles et évaluations (méthode `.claude/rules/feuilles-evaluations.md`).
// Énoncé papier = le graphique + UNE consigne globale (lire les limites, puis nommer les
// asymptotes) : les deux écrans (`completerLimites`, `nommerAsymptotes`) sont les étapes a) et b)
// du corrigé. La consigne ne révèle ni le nombre d'asymptotes verticales ni leur type (l'écran 1
// affiche les positions des AV dans ses libellés — sur papier, l'élève les repère lui-même).
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (droites en pointillés : asymptotes de la courbe ; point plein : point de la courbe).";

const CONSIGNE_PAPIER =
  "Lis sur le graphique les limites de f en −∞ et en +∞ et, de part et d'autre de chaque valeur où f n'est pas définie, ses limites à gauche et à droite. Nomme ensuite chaque asymptote de la courbe (verticale, horizontale ou oblique) avec son équation, ou indique qu'il n'y en a aucune.";

function sectionPapierLectureGraphique(exercice: ExerciceLectureGraphiqueLimites): SectionExercice {
  return {
    enteteFragments: [texte(LEGENDE)],
    enteteHtml: construireSvgLectureGraphiqueLimites(exercice),
    questions: [{ consigne: [texte(CONSIGNE_PAPIER)] }],
  };
}

function construireEnonceLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): SectionExercice {
  return sectionPapierLectureGraphique(exercice);
}

function enoncePapierLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): EnoncePapier {
  return { section: sectionPapierLectureGraphique(exercice), etapesParQuestion: [["a", "b"]] };
}

const COULEUR_LECTURE = "#9a3b12";

function etiquetteSvg(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" font-weight="bold" fill="${COULEUR_LECTURE}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

/** Nombre écrit dans le SVG : virgule décimale et vrai signe moins. */
function nombreSvg(v: number): string {
  return String(v).replace(".", ",").replace("-", "−");
}

function droiteSvg(pente: number, ordonnee: number): string {
  const p = pente === 1 ? "x" : pente === -1 ? "−x" : `${nombreSvg(pente)}x`;
  return ordonnee === 0 ? p : `${p} ${ordonnee < 0 ? "−" : "+"} ${nombreSvg(Math.abs(ordonnee))}`;
}

/** Corrigé : le graphique de l'énoncé, chaque asymptote ÉTIQUETÉE par son équation (même repère pixel
 * que `construireSvgFonction`, voir `construireLigneAsymptoteSvg`). */
function construireSvgCorrige(exercice: ExerciceLectureGraphiqueLimites): string {
  const vb = calculerViewBoxLectureGraphique(exercice);
  const viewBox: ViewBoxSvg = { xMin: vb.x[0], xMax: vb.x[1], yMin: vb.y[0], yMax: vb.y[1] };
  const zoneX = LARGEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const zoneY = HAUTEUR_GRAPHE - 2 * MARGE_SVG_LOCALE;
  const sx = (x: number) => MARGE_SVG_LOCALE + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG_LOCALE + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  const etiquettes: string[] = [];
  exercice.vas.forEach((va, i) => {
    const X = sx(va.position);
    const aGauche = X > LARGEUR_GRAPHE - 50;
    etiquettes.push(etiquetteSvg(aGauche ? X - 4 : X + 4, MARGE_SVG_LOCALE + 12 + 12 * i, `x = ${nombreSvg(va.position)}`, aGauche ? "end" : "start"));
  });
  const { infini } = exercice;
  if (infini.type === "horizontale") {
    const memes = infini.limitePlusInfini === infini.limiteMoinsInfini;
    etiquettes.push(etiquetteSvg(LARGEUR_GRAPHE - MARGE_SVG_LOCALE - 3, sy(infini.limitePlusInfini) - 4, `y = ${nombreSvg(infini.limitePlusInfini)}${memes ? "" : " (en +∞)"}`, "end"));
    if (!memes) etiquettes.push(etiquetteSvg(MARGE_SVG_LOCALE + 3, sy(infini.limiteMoinsInfini) - 4, `y = ${nombreSvg(infini.limiteMoinsInfini)} (en −∞)`, "start"));
  } else if (infini.type === "oblique") {
    const etendueY = viewBox.yMax - viewBox.yMin;
    const xLabel = viewBox.xMin + 0.78 * (viewBox.xMax - viewBox.xMin);
    const yLabel = Math.min(Math.max(infini.pente * xLabel + infini.ordonnee, viewBox.yMin + 0.08 * etendueY), viewBox.yMax - 0.05 * etendueY);
    etiquettes.push(etiquetteSvg(sx(xLabel), sy(yLabel) + (infini.pente > 0 ? 12 : -6), `y = ${droiteSvg(infini.pente, infini.ordonnee)}`, "middle"));
  }
  return construireSvgLectureGraphiqueLimites(exercice)
    .replace('class="graphe-limites"', 'class="figure-corrige"')
    .replace("</svg>", `${etiquettes.join("")}</svg>`);
}

function aPointIsole(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.vas.some((va) => va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined);
}

function ahDistinctes(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.infini.type === "horizontale" && exercice.infini.limitePlusInfini !== exercice.infini.limiteMoinsInfini;
}

function avSignesIdentiques(exercice: ExerciceLectureGraphiqueLimites): boolean {
  return exercice.vas.some((va) => va.pointIsoleGauche === undefined && va.pointIsoleDroit === undefined && va.signeGauche === va.signeDroit);
}

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function reponseBreveLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): FragmentConsigne[] {
  return [...joindre(formatReponseAttendueCompleterLimitesLatex(exercice)), texte(" — "), ...joindre(formatReponseAttendueNommerAsymptotesLatex(exercice))];
}

function correctionDetailleeLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): EtapeCorrection[] {
  const { infini } = exercice;
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [
        texte("En −∞ et en +∞, on lit vers quoi tend f(x) : une valeur finie si la courbe se rapproche d'une droite horizontale, ±∞ sinon. "),
        texte(
          exercice.vas.length > 0
            ? "De part et d'autre d'une valeur où f n'est pas définie, on lit chaque côté séparément : la branche monte (+∞), descend (−∞) ou arrive sur un point plein (limite finie)."
            : "Ici, la courbe est définie partout : il n'y a que les limites en −∞ et en +∞ à lire.",
        ),
      ],
    },
    { label: "Lecture", sousQuestion: "a", fragments: joindre(formatReponseAttendueCompleterLimitesLatex(exercice)), figureHtml: construireSvgCorrige(exercice) },
  ];
  if (aPointIsole(exercice)) {
    etapes.push({ label: "Piège", sousQuestion: "a", fragments: [texte("D'un côté de l'asymptote verticale, la courbe arrive sur un point plein : la limite de ce côté est la valeur de ce point, pas ±∞.")] });
  } else if (avSignesIdentiques(exercice)) {
    etapes.push({ label: "Piège", sousQuestion: "a", fragments: [texte("Les deux branches partent vers le même infini : les limites à gauche et à droite d'une asymptote verticale n'ont pas forcément des signes opposés.")] });
  } else if (infini.type === "oblique") {
    etapes.push({ label: "Piège", sousQuestion: "a", fragments: [texte("En −∞ et en +∞, la courbe suit une droite oblique : la limite est infinie, pas finie.")] });
  } else if (ahDistinctes(exercice)) {
    etapes.push({ label: "Piège", sousQuestion: "a", fragments: [texte("Les limites en −∞ et en +∞ sont différentes : on les lit séparément, chacune à son extrémité du graphique.")] });
  }

  etapes.push({
    label: "Méthode",
    sousQuestion: "b",
    fragments: [
      texte("Asymptote verticale "),
      latex("x=a"),
      texte(" là où la courbe s'envole vers ±∞ ; asymptote horizontale "),
      latex("y=L"),
      texte(" pour une limite finie L en −∞ ou en +∞ ; asymptote oblique "),
      latex("y=ax+b"),
      texte(" si la courbe se rapproche d'une droite oblique."),
    ],
  });
  if (infini.type === "oblique") {
    const { pente, ordonnee } = infini;
    etapes.push({
      label: "Calcul",
      sousQuestion: "b",
      fragments: [
        texte("La droite passe par "),
        latex(`(0\\,;\\,${ordonnee})`),
        texte(" et "),
        latex(`(1\\,;\\,${pente + ordonnee})`),
        texte(" : pente "),
        latex(`a=${pente}`),
        texte(", ordonnée à l'origine "),
        latex(`b=${ordonnee}`),
        texte("."),
      ],
    });
  }
  etapes.push({ label: "Conclusion", sousQuestion: "b", fragments: joindre(formatReponseAttendueNommerAsymptotesLatex(exercice)) });
  if (listeAsymptotes(exercice).length === 0) {
    etapes.push({ label: "Piège", sousQuestion: "b", fragments: [texte("La courbe part vers ±∞ sans se rapprocher d'aucune droite : il n'y a aucune asymptote.")] });
  } else if (ahDistinctes(exercice)) {
    etapes.push({ label: "Piège", sousQuestion: "b", fragments: [texte("Deux limites finies différentes en −∞ et en +∞ donnent DEUX asymptotes horizontales.")] });
  } else if (exercice.vas.length > 0) {
    etapes.push({ label: "Piège", sousQuestion: "b", fragments: [texte("Une asymptote verticale a une équation de la forme « x = … » (et non « y = … »).")] });
  }
  return etapes;
}

function baremeLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): BaremeExercice {
  const avecVA = exercice.vas.length > 0;
  const aucune = listeAsymptotes(exercice).length === 0;
  const critereAsymptotes = aucune ? "Aucune asymptote (conclusion cohérente avec les limites lues)" : "Chaque asymptote nommée avec son équation, et seulement elles";
  const criteres: CritereBareme[] = avecVA
    ? [
        { sousQuestion: "a", critere: [texte("Limites en −∞ et en +∞")], points: 1 },
        { sousQuestion: "a", critere: [texte("Limites à gauche et à droite de chaque asymptote verticale")], points: 1.5 },
        { sousQuestion: "b", critere: [texte(critereAsymptotes)], points: 1.5 },
      ]
    : [
        { sousQuestion: "a", critere: [texte("Limites en −∞ et en +∞")], points: 2 },
        { sousQuestion: "b", critere: [texte(critereAsymptotes)], points: 2 },
      ];
  const erreurs: ErreurFrequente[] = [];
  if (avecVA) erreurs.push({ description: [texte("Asymptote verticale écrite « y = … » au lieu de « x = … »")], cout: "0 pt sur cette asymptote" });
  if (aPointIsole(exercice)) erreurs.push({ description: [texte("±∞ annoncé du côté où la courbe arrive sur un point plein")], cout: "0 pt sur cette limite" });
  if (exercice.infini.type === "oblique") erreurs.push({ description: [texte("Limite finie annoncée en ±∞ alors que la courbe suit une droite oblique")], cout: "0 pt sur ces limites" });
  if (ahDistinctes(exercice)) erreurs.push({ description: [texte("Une seule asymptote horizontale donnée alors que les limites en −∞ et en +∞ diffèrent")], cout: "−0,5 sur b)" });
  if (erreurs.length === 0) erreurs.push({ description: [texte("Asymptote horizontale donnée sous la forme « x = … »")], cout: "0 pt sur cette asymptote" });
  return {
    reponseFinale: reponseBreveLectureGraphiqueLimites(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Asymptotes données dans n'importe quel ordre")], [texte("Équation seule (« x = 2 ») sans le sigle AV, AH ou AO")]],
  };
}

function difficulteLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): 1 | 2 | 3 {
  if (exercice.vas.length >= 2 || aPointIsole(exercice) || (exercice.vas.length > 0 && exercice.infini.type === "oblique")) return 3;
  if (exercice.vas.length === 1 || exercice.infini.type === "oblique" || ahDistinctes(exercice)) return 2;
  return 1;
}

/** RESYNTHÉTISÉE depuis les valeurs déjà connues de l'instance tirée (`formatReponseAttendue*Latex`,
 * `ui5e/formatLectureGraphiqueLimites.ts` — la même couche présentation qui alimente déjà le
 * récapitulatif final interactif, `ResumeSessionLectureGraphiqueLimites`) — jamais recalculée
 * indépendamment ici. */
function construireCorrectionLectureGraphiqueLimites(exercice: ExerciceLectureGraphiqueLimites): BlocCorrection[] {
  const lignesLimites: BlocCorrection[] = formatReponseAttendueCompleterLimitesLatex(exercice).map((expression) => ({
    type: "paragraphe",
    fragments: [latex(expression)],
  }));
  if (listeAsymptotes(exercice).length === 0) return lignesLimites;
  const lignesAsymptotes: BlocCorrection[] = formatReponseAttendueNommerAsymptotesLatex(exercice).map((expression) => ({
    type: "paragraphe",
    fragments: [latex(expression)],
  }));
  return [...lignesLimites, ...lignesAsymptotes];
}

export const adaptateurEvaluationLectureGraphiqueLimites: AdaptateurFeuilleExercices<ExerciceLectureGraphiqueLimites> = {
  titreDocument: "Limites et asymptotes — lecture graphique — Évaluation",
  nomFichierBase: "lecture-graphique-limites",
  genererInstance: genererExerciceLectureGraphiqueLimites,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceLectureGraphiqueLimites,
  construireCorrection: construireCorrectionLectureGraphiqueLimites,
  difficulte: difficulteLectureGraphiqueLimites,
  reponseBreve: reponseBreveLectureGraphiqueLimites,
  correctionDetaillee: correctionDetailleeLectureGraphiqueLimites,
  bareme: baremeLectureGraphiqueLimites,
  enoncePapier: enoncePapierLectureGraphiqueLimites,
  dureeMinutes: 8,
  profilInstance: profilLectureGraphiqueLimites,
  // FAUX : `enteteHtml` (graphique) est utilisé — exclu explicitement par la doc de `regroupable`
  // (`export/genererFeuilleExercices.ts`) — ET la consigne texte varie déjà avec l'instance (nombre de
  // blancs à compléter, 2 à 9 selon le tirage — jamais une consigne générique constante), ET il y a
  // plusieurs questions par instance (une par blanc) : les 3 conditions d'exclusion du mécanisme sont
  // réunies, `regroupable` reste donc à sa valeur par défaut `false`/absent — laissé explicite ici pour
  // documenter la décision plutôt que de l'omettre silencieusement.
  regroupable: false,
};
