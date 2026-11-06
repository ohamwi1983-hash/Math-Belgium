import type { ExerciceCaracteristiquesFonction } from "../../core/caracteristiquesFonction.types";
import type { Morceau } from "../../core/inequation.types";
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
import { calculerViewBoxCaracteristiques } from "../../ui/mafsCaracteristiquesFonction";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
  valeurHyperboleEnB5,
  valeurNaturelleEnB5,
} from "../../moteur/verificationCaracteristiquesFonction";
import { genererExerciceCaracteristiquesFonction } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceCaracteristiquesFonction>` pour gen12 (Lire les
 * caractéristiques sur un graphique) — feuille d'évaluation.
 *
 * Pas de `CATALOGUE_VARIANTES`/`construireAvecVarianteId` ici : `generateurs/caracteristiquesFonction/index.ts`
 * n'exporte qu'un `genererExerciceCaracteristiquesFonction` sans argument — `catalogueVariantes`/
 * `genererInstanceAvecVariante` restent donc omis (contrat optionnel, voir `genererFeuilleExercices.ts`).
 *
 * `regroupable` NON défini : ce générateur a un graphique (`enteteHtml`) ET 8 questions distinctes
 * par instance — les 2 seules conditions qui, indépendamment déjà, désactivent ce mécanisme (voir
 * la doc de `AdaptateurFeuilleExercices.regroupable`).
 *
 * L'écran interactif (`AppCaracteristiquesFonction.tsx`) déroule 8 phases FIXES, toujours dans le
 * même ordre, sur le MÊME graphique affiché en permanence (jamais de variation d'un écran à
 * l'autre, contrairement aux autres générateurs à indices/dévoilement progressif) — reproduit ici
 * par UNE seule image de graphique (`construireGrapheCaracteristiques`, partagée par toutes les
 * questions) suivie de 8 questions, une par phase, dans le même ordre : domaine, zéros, croissance,
 * décroissance, constance, ordonnée à l'origine, valeur en x=v, équations des asymptotes. Les
 * consignes ci-dessous recopient mot pour mot les `<p className="prompt-text">` des 8 composants
 * `Etape*Caracteristiques.tsx` (source de vérité pour la formulation exacte vue par l'élève).
 *
 * Corrigé : chaque réponse est relue directement sur des champs déjà calculés de l'instance via les
 * fonctions du moteur de vérification (`moteur/verificationCaracteristiquesFonction.ts` — SEULE
 * source de vérité, partagée avec l'écran), jamais redérivée indépendamment ici.
 *
 * Graphique (`construireGrapheCaracteristiques`) : la courbe est composite (7 zones + une branche
 * hyperbolique, jamais une seule formule `(x)=>y`), donc pas directement représentable par le
 * pattern `construireSvgFonction((x)=>f(x), viewBox)` utilisé tel quel par
 * `transformationsGraphiques/exportEvaluation.ts`/`export/svgGraphCyclo.ts` (aucun de ces deux
 * appelants n'a de discontinuité/asymptote à gérer). `construireSvgFonction` reste réutilisé pour
 * le tracé (axes, grille, échantillonnage de segments continus) — seul l'évaluateur passé en
 * argument est spécifique à gen12 (voir `evaluerPourSvgCaracteristiques` : force un `null` dans une
 * fenêtre étroite autour de `b5` et de `AV`, pour empêcher `construireSvgFonction` de relier par une
 * fausse ligne droite deux valeurs qui ne sont JAMAIS reliées sur la vraie courbe — même piège que
 * documenté en tête de `ui/mafsCaracteristiquesFonction.ts`, ici sans le luxe d'un moteur de tracé
 * conscient du domaine par segment explicite). Les marqueurs (cercles pleins/vides à la
 * discontinuité, au point creux `c`, aux bornes de gap, + asymptotes en pointillé) n'ont pas
 * d'équivalent dans `PointMarqueSvg` (seulement point plein/croix, jamais de cercle vide) : ajoutés
 * en post-traitement du `<svg>` déjà construit (`construireMarqueursSupplementaires`), avec une
 * transformation x/y→pixel DUPLIQUÉE de celle, interne et non exportée, de `svgGraph.ts` — même
 * principe que `ajusterAuRatio` dans `ui/mafsCaracteristiquesFonction.ts` (« dupliquée plutôt que
 * réexportée depuis mafsTransformation.ts... ne jamais risquer de régression sur les consommateurs
 * existants d'un si petit utilitaire pur »), jamais une modification de `svgGraph.ts` lui-même.
 */

const COULEUR_COURBE = "#d6336c";
/** Même valeur que la constante interne (non exportée) `MARGE` de `export/svgGraph.ts` — nécessaire
 * pour dupliquer localement sa transformation x/y→pixel (voir commentaire de tête de fichier). */
const MARGE_SVG = 10;
const LARGEUR_SVG = 360;
const HAUTEUR_SVG = 240;

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

function formatBorneLatex(borne: number | "-inf" | "+inf"): string {
  if (borne === "-inf") return "-\\infty";
  if (borne === "+inf") return "+\\infty";
  return formatNombre(borne);
}

/** Notation française à crochets inversés, en LaTeX — même convention que `ui/formatSolutionEnsemble.ts`
 * (dupliquée ici en LaTeX plutôt que texte brut, jamais réexportée : cette dernière n'a pas de
 * variante LaTeX déjà écrite). */
function formatMorceauLatex(morceau: Morceau): string {
  return `${morceau.crochetGauche}${formatBorneLatex(morceau.borneGauche)}\\,;\\,${formatBorneLatex(morceau.borneDroite)}${morceau.crochetDroit}`;
}

function formatMorceauxLatex(morceaux: Morceau[]): string {
  return morceaux.map(formatMorceauLatex).join(" \\cup ");
}

/**
 * Évaluateur passé à `construireSvgFonction` — délègue entièrement à `evaluerCourbeCaracteristiques`
 * (seule source de vérité pour f(x), partagée avec l'écran), en forçant `null` (coupure de tracé)
 * dans une fenêtre autour de `b5` et de `AV` :
 * - `AV` : la branche hyperbolique diverge vers ±∞ des deux côtés — sans coupure explicite, deux
 *   échantillons voisins de part et d'autre de l'asymptote (l'un très grand positif, l'autre très
 *   grand négatif) seraient reliés par une ligne quasi verticale traversant tout le cadre, comme si
 *   les deux branches se rejoignaient (elles ne se rejoignent jamais).
 * - `b5` : discontinuité de saut (3 cas possibles, voir `core/caracteristiquesFonction.types.ts`) —
 *   la zone 5 (x<b5) approche `y5Naturel` sans jamais l'atteindre, tandis que la formule pour x>=b5
 *   utilisée par `evaluerCourbeCaracteristiques` bascule sur la branche hyperbolique ; sans coupure,
 *   les deux seraient reliées par une ligne droite qui n'existe pas sur la vraie courbe, quel que
 *   soit le cas tiré (même piège que documenté en tête de `ui/mafsCaracteristiquesFonction.ts`,
 *   fonction `calculerSegmentsCaracteristiquesVisibles`).
 * La fenêtre (`epsilonRupture`) est volontairement large par rapport à l'écart entre deux échantillons
 * consécutifs de `construireSvgFonction` (`NB_POINTS_ECHANTILLON=240` sur toute la largeur visible) :
 * garantit qu'au moins un échantillon tombe dedans quelle que soit la phase du quadrillage régulier,
 * sans distordre visuellement le reste de la courbe (fenêtre <2% de la largeur visible totale).
 */
function evaluerPourSvgCaracteristiques(exercice: ExerciceCaracteristiquesFonction, viewBox: ViewBoxSvg): (x: number) => number | null {
  const epsilonRupture = (viewBox.xMax - viewBox.xMin) / 60;
  return (x: number) => {
    if (Math.abs(x - exercice.b5) < epsilonRupture) return null;
    if (Math.abs(x - exercice.AV) < epsilonRupture) return null;
    const y = evaluerCourbeCaracteristiques(exercice, x);
    return Number.isFinite(y) ? y : null;
  };
}

/** Réplique locale (voir commentaire de tête de fichier) de la transformation x/y→pixel interne de
 * `construireSvgFonction` — nécessaire pour placer les marqueurs supplémentaires (cercles, asymptotes
 * en pointillé) exactement sur la même grille que la courbe tracée par cette fonction. */
function construireTransformSvg(viewBox: ViewBoxSvg, largeur: number, hauteur: number) {
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - viewBox.xMin) / (viewBox.xMax - viewBox.xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((viewBox.yMax - y) / (viewBox.yMax - viewBox.yMin)) * zoneY;
  return { sx, sy };
}

function cercleVide(sx: (x: number) => number, sy: (y: number) => number, x: number, y: number): string {
  return `<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="#ffffff" stroke="${COULEUR_COURBE}" stroke-width="1.5"/>`;
}

function cerclePlein(sx: (x: number) => number, sy: (y: number) => number, x: number, y: number): string {
  return `<circle cx="${sx(x).toFixed(1)}" cy="${sy(y).toFixed(1)}" r="3" fill="${COULEUR_COURBE}"/>`;
}

/**
 * Marqueurs qui n'ont pas d'équivalent dans `PointMarqueSvg` (cercles VIDES, asymptotes en
 * pointillé) — voir commentaire de tête de fichier. Reproduit fidèlement `MafsGraphCaracteristiquesFonction.tsx` :
 * cercle vide au point creux (c, valeurNaturelleC), point plein à chaque borne de gap, cercle vide
 * TOUJOURS côté zone 5 en b5 (y5Naturel), second marqueur en b5 plein pour "pointPlein"/vide sinon,
 * 3e point plein isolé pour "pointRedefini", segment pointillé reliant les deux marqueurs de la
 * discontinuité, asymptotes x=AV et y=L en pointillé.
 */
function construireMarqueursSupplementaires(exercice: ExerciceCaracteristiquesFonction, viewBox: ViewBoxSvg): string {
  const { sx, sy } = construireTransformSvg(viewBox, LARGEUR_SVG, HAUTEUR_SVG);
  const morceaux: string[] = [];

  const xAV = sx(exercice.AV).toFixed(1);
  morceaux.push(`<line x1="${xAV}" y1="${MARGE_SVG}" x2="${xAV}" y2="${HAUTEUR_SVG - MARGE_SVG}" stroke="${COULEUR_COURBE}" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`);
  const yL = sy(exercice.L).toFixed(1);
  morceaux.push(`<line x1="${MARGE_SVG}" y1="${yL}" x2="${LARGEUR_SVG - MARGE_SVG}" y2="${yL}" stroke="${COULEUR_COURBE}" stroke-width="1" stroke-dasharray="4 3" opacity="0.55"/>`);

  const yCreux = valeurNaturelleEnB5(exercice);
  const yHyperboleNaturel = valeurHyperboleEnB5(exercice);
  const xB5 = sx(exercice.b5).toFixed(1);
  morceaux.push(`<line x1="${xB5}" y1="${sy(yCreux).toFixed(1)}" x2="${xB5}" y2="${sy(yHyperboleNaturel).toFixed(1)}" stroke="${COULEUR_COURBE}" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.7"/>`);

  morceaux.push(cercleVide(sx, sy, exercice.c, exercice.valeurNaturelleC));

  for (const gap of exercice.gaps) {
    morceaux.push(cerclePlein(sx, sy, gap.g1, evaluerCourbeCaracteristiques(exercice, gap.g1)));
    morceaux.push(cerclePlein(sx, sy, gap.g2, evaluerCourbeCaracteristiques(exercice, gap.g2)));
  }

  morceaux.push(cercleVide(sx, sy, exercice.b5, yCreux));
  morceaux.push(
    exercice.discontinuite.type === "pointPlein" ? cerclePlein(sx, sy, exercice.b5, yHyperboleNaturel) : cercleVide(sx, sy, exercice.b5, yHyperboleNaturel),
  );
  if (exercice.discontinuite.type === "pointRedefini") {
    morceaux.push(cerclePlein(sx, sy, exercice.b5, exercice.discontinuite.valeur));
  }

  return morceaux.join("");
}

function construireGrapheCaracteristiques(exercice: ExerciceCaracteristiquesFonction, annote = false): string {
  const viewBoxMafs = calculerViewBoxCaracteristiques(exercice);
  const viewBox: ViewBoxSvg = { xMin: viewBoxMafs.x[0], xMax: viewBoxMafs.x[1], yMin: viewBoxMafs.y[0], yMax: viewBoxMafs.y[1] };
  const svgBase = construireSvgFonction(evaluerPourSvgCaracteristiques(exercice, viewBox), viewBox, {
    largeur: LARGEUR_SVG,
    hauteur: HAUTEUR_SVG,
    couleurCourbe: COULEUR_COURBE,
    classe: annote ? "figure-corrige" : "graphe-caracteristiques",
  });
  const marqueurs = construireMarqueursSupplementaires(exercice, viewBox) + (annote ? construireAnnotationsCorrige(exercice, viewBox) : "");
  return svgBase.replace("</svg>", `${marqueurs}</svg>`);
}

const COULEUR_LECTURE = "#9a3b12";

/** Nombre écrit dans le SVG du corrigé : virgule décimale et vrai signe moins. */
function nombreSvg(valeur: number): string {
  return formatNombre(valeur).replace(".", ",").replace("-", "−");
}

function texteLecture(x: number, y: number, contenu: string, ancre: "start" | "middle" | "end" = "middle"): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" font-weight="bold" fill="${COULEUR_LECTURE}" text-anchor="${ancre}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke" font-family="Archivo, Arial, Helvetica, sans-serif">${contenu}</text>`;
}

/**
 * Corrigé détaillé : les lectures attendues repérées SUR le graphique de l'énoncé — zéros (losanges
 * sur l'axe des abscisses), ordonnée à l'origine, valeur en x = v (si elle existe) et équations des
 * deux asymptotes. Mêmes valeurs que les conclusions du corrigé (`exercice.zeros`,
 * `evaluerCourbeCaracteristiques`).
 */
function construireAnnotationsCorrige(exercice: ExerciceCaracteristiquesFonction, viewBox: ViewBoxSvg): string {
  const { sx, sy } = construireTransformSvg(viewBox, LARGEUR_SVG, HAUTEUR_SVG);
  const m: string[] = [];
  const dansX = (x: number) => x >= viewBox.xMin && x <= viewBox.xMax;
  const dansY = (y: number) => y >= viewBox.yMin && y <= viewBox.yMax;
  const yAxe = Math.min(Math.max(sy(0), MARGE_SVG + 10), HAUTEUR_SVG - MARGE_SVG - 4);

  for (const z of exercice.zeros) {
    if (!dansX(z)) continue;
    const X = sx(z);
    m.push(`<path d="M ${X.toFixed(1)},${(yAxe - 4.5).toFixed(1)} l 4.5,4.5 l -4.5,4.5 l -4.5,-4.5 z" fill="${COULEUR_LECTURE}"/>`);
    m.push(texteLecture(X, yAxe + 15, nombreSvg(z)));
  }

  if (existeOrdonneeCaracteristiques(exercice)) {
    const y0 = evaluerCourbeCaracteristiques(exercice, 0);
    if (dansY(y0)) {
      m.push(`<circle cx="${sx(0).toFixed(1)}" cy="${sy(y0).toFixed(1)}" r="4.5" fill="none" stroke="${COULEUR_LECTURE}" stroke-width="1.6"/>`);
      m.push(texteLecture(sx(0) + 7, sy(y0) - 6, `f(0) = ${nombreSvg(y0)}`, "start"));
    }
  }

  if (existeValeurEnVCaracteristiques(exercice)) {
    const yv = evaluerCourbeCaracteristiques(exercice, exercice.v);
    if (dansX(exercice.v) && dansY(yv)) {
      const X = sx(exercice.v);
      const Y = sy(yv);
      m.push(`<rect x="${(X - 5).toFixed(1)}" y="${(Y - 5).toFixed(1)}" width="10" height="10" fill="none" stroke="${COULEUR_LECTURE}" stroke-width="1.4"/>`);
      const aGauche = X > LARGEUR_SVG - 80;
      m.push(texteLecture(aGauche ? X - 8 : X + 8, Y + 14, `f(${nombreSvg(exercice.v)}) = ${nombreSvg(yv)}`, aGauche ? "end" : "start"));
    }
  }

  if (dansX(exercice.AV)) {
    const X = sx(exercice.AV);
    const aGauche = X > LARGEUR_SVG - 60;
    m.push(texteLecture(aGauche ? X - 4 : X + 4, MARGE_SVG + 10, `x = ${nombreSvg(exercice.AV)}`, aGauche ? "end" : "start"));
  }
  if (dansY(exercice.L)) {
    m.push(texteLecture(LARGEUR_SVG - MARGE_SVG - 4, sy(exercice.L) - 4, `y = ${nombreSvg(exercice.L)}`, "end"));
  }
  return m.join("");
}

function construireEnonceCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): SectionExercice {
  return {
    enteteFragments: [
      texte(
        "Le graphique ci-dessous représente une fonction f (trait plein : la courbe ; pointillé : asymptotes et discontinuité ; cercle plein : point appartenant à la courbe ; cercle vide : point exclu). Réponds aux questions suivantes en te basant uniquement sur la lecture du graphique.",
      ),
    ],
    enteteHtml: construireGrapheCaracteristiques(exercice),
    questions: [
      { consigne: [texte("Quel est le domaine de définition de cette fonction ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Quels sont les zéros de cette fonction ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quels intervalles cette fonction est-elle strictement croissante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quels intervalles cette fonction est-elle strictement décroissante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Sur quel(s) intervalle(s) cette fonction est-elle constante ?")], reponse: { type: "lignes", nombre: 2 } },
      { consigne: [texte("Quelle est l'ordonnée à l'origine de cette fonction ?")], reponse: { type: "lignes", nombre: 1 } },
      {
        consigne: [texte("La fonction est-elle définie en "), latex(`x = ${formatNombre(exercice.v)}`), texte(" ? Si oui, quelle est sa valeur ?")],
        reponse: { type: "lignes", nombre: 1 },
      },
      { consigne: [texte("Donne les équations des deux asymptotes.")], reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrectionCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): BlocCorrection[] {
  const blocs: BlocCorrection[] = [{ type: "html", html: construireGrapheCaracteristiques(exercice) }];

  blocs.push({
    type: "paragraphe",
    fragments: [texte("a) "), latex(`\\mathrm{dom}\\,f = ${formatMorceauxLatex(domaineCaracteristiques(exercice))}`), texte(".")],
  });

  const zerosTries = [...exercice.zeros].sort((a, b) => a - b);
  blocs.push({
    type: "paragraphe",
    fragments:
      zerosTries.length === 0
        ? [texte("b) Aucun zéro : la courbe ne recoupe jamais l'axe des abscisses.")]
        : [texte("b) "), latex(zerosTries.map((z) => `x = ${formatNombre(z)}`).join(" \\text{ ; } ")), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("c) Croissante sur "), latex(formatMorceauxLatex(croissanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("d) Décroissante sur "), latex(formatMorceauxLatex(decroissanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [texte("e) Constante sur "), latex(formatMorceauxLatex(constanceAttendueCaracteristiques(exercice))), texte(".")],
  });

  const ordonneeExiste = existeOrdonneeCaracteristiques(exercice);
  blocs.push({
    type: "paragraphe",
    fragments: ordonneeExiste
      ? [texte("f) "), latex(`f(0) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, 0))}`), texte(".")]
      : [texte("f) 0 n'appartient pas au domaine de définition : cette fonction n'a pas d'ordonnée à l'origine.")],
  });

  const valeurEnVExiste = existeValeurEnVCaracteristiques(exercice);
  blocs.push({
    type: "paragraphe",
    fragments: valeurEnVExiste
      ? [texte("g) "), latex(`f(${formatNombre(exercice.v)}) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))}`), texte(".")]
      : [texte("g) "), latex(`x = ${formatNombre(exercice.v)}`), texte(" n'appartient pas au domaine de définition : cette valeur n'existe pas.")],
  });

  blocs.push({
    type: "paragraphe",
    fragments: [
      texte("h) "),
      latex(`AH \\equiv y = ${formatNombre(exercice.L)}`),
      texte(" et "),
      latex(`AV \\equiv x = ${formatNombre(exercice.AV)}`),
      texte("."),
    ],
  });

  return blocs;
}

// ============================================================================
// Feuilles enrichies (énoncé papier, réponse brève, corrigé détaillé, barème).
// Les 8 lectures (une par écran, toujours dans le même ordre) sont les ÉTAPES a)…h) : sur papier,
// l'énoncé est le graphique + une consigne globale qui les énumère ; elles passent dans le corrigé.
// Toutes les valeurs viennent du moteur de vérification partagé avec l'écran
// (`moteur/verificationCaracteristiquesFonction.ts`), jamais recalculées ici.
// ============================================================================

const LEGENDE =
  "Le graphique ci-dessous représente une fonction f (trait plein : la courbe ; pointillé : asymptotes et discontinuité ; cercle plein : point appartenant à la courbe ; cercle vide : point exclu).";

/** Ensemble d'intervalles, ou ∅ s'il n'y en a aucun. */
function ensembleLatex(morceaux: Morceau[]): string {
  return morceaux.length === 0 ? "\\varnothing" : formatMorceauxLatex(morceaux);
}

function zerosLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  const zeros = [...exercice.zeros].sort((a, b) => a - b);
  return zeros.length === 0 ? null : zeros.map((z) => `x = ${formatNombre(z)}`).join(" \\text{ ; } ");
}

function ordonneeLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  return existeOrdonneeCaracteristiques(exercice) ? `f(0) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, 0))}` : null;
}

function valeurLatex(exercice: ExerciceCaracteristiquesFonction): string | null {
  return existeValeurEnVCaracteristiques(exercice) ? `f(${formatNombre(exercice.v)}) = ${formatNombre(evaluerCourbeCaracteristiques(exercice, exercice.v))}` : null;
}

function asymptotesLatex(exercice: ExerciceCaracteristiquesFonction): string {
  return `AV \\equiv x = ${formatNombre(exercice.AV)} \\quad\\text{et}\\quad AH \\equiv y = ${formatNombre(exercice.L)}`;
}

/** Abscisses exclues du domaine, dans l'ordre croissant, avec leur raison (lecture du graphique). */
function exclusions(exercice: ExerciceCaracteristiquesFonction): { x: number; fragments: FragmentConsigne[] }[] {
  const liste: { x: number; fragments: FragmentConsigne[] }[] = [
    { x: exercice.AV, fragments: [latex(`x = ${formatNombre(exercice.AV)}`), texte(" (asymptote verticale)")] },
    { x: exercice.c, fragments: [latex(`x = ${formatNombre(exercice.c)}`), texte(" (cercle vide seul)")] },
    ...exercice.gaps.map((g) => ({ x: g.g1, fragments: [latex(`]${formatNombre(g.g1)}\\,;\\,${formatNombre(g.g2)}[`), texte(" (aucun tracé ; les bornes, points pleins, restent)")] })),
  ];
  if (exercice.discontinuite.type === "trou") liste.push({ x: exercice.b5, fragments: [latex(`x = ${formatNombre(exercice.b5)}`), texte(" (deux cercles vides, aucun point plein)")] });
  return liste.sort((a, b) => a.x - b.x);
}

function lectureValeur(exercice: ExerciceCaracteristiquesFonction): FragmentConsigne[] {
  const v = formatNombre(exercice.v);
  if (exercice.v === exercice.c) return [texte("En "), latex(`x = ${v}`), texte(", la courbe n'a qu'un cercle vide : cette abscisse n'appartient pas au domaine.")];
  switch (exercice.discontinuite.type) {
    case "pointPlein":
      return [texte("En "), latex(`x = ${v}`), texte(", un cercle vide (fin du morceau de gauche) et un point plein : la valeur est l'ordonnée du point plein.")];
    case "trou":
      return [texte("En "), latex(`x = ${v}`), texte(", les deux marqueurs sont des cercles vides : aucun point de la courbe, la valeur n'existe pas.")];
    case "pointRedefini":
      return [texte("En "), latex(`x = ${v}`), texte(", deux cercles vides et un point plein isolé à une autre hauteur : la valeur est l'ordonnée du point plein isolé.")];
  }
}

function enoncePapierCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(LEGENDE)],
      enteteHtml: construireGrapheCaracteristiques(exercice),
      questions: [
        {
          consigne: [
            texte(
              "Lis sur le graphique les caractéristiques de f : son domaine de définition, ses zéros, les intervalles sur lesquels f est strictement croissante, strictement décroissante et constante, son ordonnée à l'origine, sa valeur en ",
            ),
            latex(`x = ${formatNombre(exercice.v)}`),
            texte(" (si elle existe) et les équations de ses deux asymptotes."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a", "b", "c", "d", "e", "f", "g", "h"]],
  };
}

function reponseBreveCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): FragmentConsigne[] {
  const zeros = zerosLatex(exercice);
  const ordonnee = ordonneeLatex(exercice);
  const valeur = valeurLatex(exercice);
  return [
    texte("Domaine : "),
    latex(ensembleLatex(domaineCaracteristiques(exercice))),
    texte(" ; zéros : "),
    ...(zeros ? [latex(zeros)] : [texte("aucun")]),
    texte(" ; croissante sur "),
    latex(ensembleLatex(croissanceAttendueCaracteristiques(exercice))),
    texte(" ; décroissante sur "),
    latex(ensembleLatex(decroissanceAttendueCaracteristiques(exercice))),
    texte(" ; constante sur "),
    latex(ensembleLatex(constanceAttendueCaracteristiques(exercice))),
    texte(" ; "),
    ...(ordonnee ? [latex(ordonnee)] : [texte("pas d'ordonnée à l'origine")]),
    texte(" ; "),
    ...(valeur ? [latex(valeur)] : [latex(`f(${formatNombre(exercice.v)})`), texte(" n'existe pas")]),
    texte(" ; "),
    latex(asymptotesLatex(exercice)),
  ];
}

function correctionDetailleeCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): EtapeCorrection[] {
  const zeros = zerosLatex(exercice);
  const ordonnee = ordonneeLatex(exercice);
  const valeur = valeurLatex(exercice);
  const b5 = formatNombre(exercice.b5);
  const etapes: EtapeCorrection[] = [
    {
      label: "Graphique",
      sousQuestion: "a",
      fragments: [texte("Les lectures attendues, repérées sur le graphique : zéros (losanges), ordonnée à l'origine (cercle), valeur demandée (carré) et équations des asymptotes.")],
      figureHtml: construireGrapheCaracteristiques(exercice, true),
    },
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On repère les abscisses sans point de la courbe : asymptote verticale, cercle vide sans point plein à la même abscisse, intervalle sans tracé.")] },
    { label: "Lecture", sousQuestion: "a", fragments: [texte("Exclus : "), ...exclusions(exercice).flatMap((e, i) => [...(i === 0 ? [] : [texte(" ; ")]), ...e.fragments]), texte(".")] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`\\mathrm{dom}\\,f = ${ensembleLatex(domaineCaracteristiques(exercice))}`)] },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments:
        exercice.discontinuite.type === "trou"
          ? [texte("En "), latex(`x = ${b5}`), texte(", les deux marqueurs sont vides : cette abscisse est exclue, même sans asymptote.")]
          : [texte("En "), latex(`x = ${b5}`), texte(", le cercle vide ne suffit pas à exclure l'abscisse : un point plein existe à la même abscisse, donc elle appartient au domaine.")],
    },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Les zéros sont les abscisses des points de la courbe situés sur l'axe des abscisses.")] },
    { label: "Conclusion", sousQuestion: "b", fragments: zeros ? [latex(zeros)] : [texte("Aucun zéro : la courbe ne rencontre jamais l'axe des abscisses.")] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("La courbe monte de gauche à droite ; deux morceaux séparés par une asymptote, un trou ou un intervalle sans tracé restent deux intervalles distincts.")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte("Strictement croissante sur "), latex(ensembleLatex(croissanceAttendueCaracteristiques(exercice))), texte(".")] },
    { label: "Méthode", sousQuestion: "d", fragments: [texte("La courbe descend de gauche à droite.")] },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte("Strictement décroissante sur "), latex(ensembleLatex(decroissanceAttendueCaracteristiques(exercice))), texte(".")] },
    { label: "Méthode", sousQuestion: "e", fragments: [texte("La courbe est un palier horizontal ; les intervalles sans tracé le coupent en plusieurs morceaux.")] },
    { label: "Conclusion", sousQuestion: "e", fragments: [texte("Constante sur "), latex(ensembleLatex(constanceAttendueCaracteristiques(exercice))), texte(".")] },
    { label: "Méthode", sousQuestion: "f", fragments: [texte("L'ordonnée à l'origine est l'ordonnée du point de la courbe d'abscisse 0, s'il existe.")] },
    { label: "Conclusion", sousQuestion: "f", fragments: ordonnee ? [latex(ordonnee)] : [texte("0 n'appartient pas au domaine : f n'a pas d'ordonnée à l'origine.")] },
    { label: "Lecture", sousQuestion: "g", fragments: lectureValeur(exercice) },
    { label: "Conclusion", sousQuestion: "g", fragments: valeur ? [latex(valeur)] : [latex(`f(${formatNombre(exercice.v)})`), texte(" n'existe pas.")] },
    { label: "Méthode", sousQuestion: "h", fragments: [texte("Une asymptote verticale a une équation de la forme « x = constante », une asymptote horizontale de la forme « y = constante ».")] },
    { label: "Conclusion", sousQuestion: "h", fragments: [latex(asymptotesLatex(exercice))] },
  ];
  return etapes;
}

function baremeCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): BaremeExercice {
  const criteres: CritereBareme[] = [
    { sousQuestion: "a", critere: [texte("Domaine : toutes les exclusions, et seulement elles")], points: 0.5 },
    { sousQuestion: "b", critere: [texte("Zéros : tous, sans valeur en trop")], points: 0.5 },
    { sousQuestion: "c", critere: [texte("Intervalles de croissance (bornes et crochets)")], points: 0.5 },
    { sousQuestion: "d", critere: [texte("Intervalles de décroissance (bornes et crochets)")], points: 0.5 },
    { sousQuestion: "e", critere: [texte("Intervalle(s) de constance")], points: 0.5 },
    { sousQuestion: "f", critere: existeOrdonneeCaracteristiques(exercice) ? [texte("Ordonnée à l'origine")] : [texte("Absence d'ordonnée à l'origine (0 exclu du domaine)")], points: 0.5 },
    { sousQuestion: "g", critere: existeValeurEnVCaracteristiques(exercice) ? [texte("Valeur lue sur le point plein")] : [texte("Valeur inexistante (abscisse exclue)")], points: 0.5 },
    { sousQuestion: "h", critere: [texte("Les deux équations d'asymptotes, sous la forme « x = … » et « y = … »")], points: 0.5 },
  ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Oublier d'exclure le point creux "), latex(`x = ${formatNombre(exercice.c)}`), texte(" (cercle vide seul)")], cout: "0 pt sur a)" },
  ];
  if (exercice.gaps.length > 0) erreurs.push({ description: [texte("Exclure aussi les bornes des intervalles sans tracé (ce sont des points pleins)")], cout: "0 pt sur a)" });
  if (exercice.discontinuite.type !== "trou") erreurs.push({ description: [texte("Exclure "), latex(`x = ${formatNombre(exercice.b5)}`), texte(" à cause du cercle vide, alors qu'un point plein existe à la même abscisse")], cout: "0 pt sur a)" });
  erreurs.push({ description: [texte("Réunir en un seul intervalle deux morceaux séparés par une asymptote, un trou ou un intervalle sans tracé")], cout: "0 pt sur l'intervalle concerné" });
  erreurs.push({
    description:
      exercice.v === exercice.c || exercice.discontinuite.type === "trou"
        ? [texte("Donner pour "), latex(`f(${formatNombre(exercice.v)})`), texte(" l'ordonnée d'un cercle vide")]
        : [texte("Lire "), latex(`f(${formatNombre(exercice.v)})`), texte(" sur le cercle vide au lieu du point plein")],
    cout: "0 pt sur g)",
  });
  erreurs.push({ description: [texte("Équations d'asymptotes inversées ("), latex("y = "), texte(" pour la verticale, "), latex("x = "), texte(" pour l'horizontale)")], cout: "0 pt sur h)" });
  return {
    reponseFinale: reponseBreveCaracteristiquesFonction(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Domaine écrit sous la forme "), latex("\\mathbb{R} \\setminus \\{\\ldots\\}"), texte(" (avec les intervalles retirés)")],
      [texte("Zéros donnés comme un ensemble de valeurs")],
    ],
  };
}

/** Plus il y a d'exclusions particulières (intervalles sans tracé, discontinuité « trou » ou point
 * redéfini), plus la lecture du domaine et de f(v) demande de réflexion. */
function difficulteCaracteristiquesFonction(exercice: ExerciceCaracteristiquesFonction): 1 | 2 | 3 {
  const pieges = exercice.gaps.length + (exercice.discontinuite.type === "pointPlein" ? 0 : 1);
  return pieges >= 2 ? 3 : 2;
}

export const adaptateurEvaluationCaracteristiquesFonction: AdaptateurFeuilleExercices<ExerciceCaracteristiquesFonction> = {
  titreDocument: "Caractéristiques d'une fonction (lecture graphique) — Évaluation",
  nomFichierBase: "caracteristiques-fonction",
  genererInstance: genererExerciceCaracteristiquesFonction,
  construireEnonce: construireEnonceCaracteristiquesFonction,
  construireCorrection: construireCorrectionCaracteristiquesFonction,
  difficulte: difficulteCaracteristiquesFonction,
  reponseBreve: reponseBreveCaracteristiquesFonction,
  correctionDetaillee: correctionDetailleeCaracteristiquesFonction,
  bareme: baremeCaracteristiquesFonction,
  enoncePapier: enoncePapierCaracteristiquesFonction,
  dureeMinutes: 8,
};
