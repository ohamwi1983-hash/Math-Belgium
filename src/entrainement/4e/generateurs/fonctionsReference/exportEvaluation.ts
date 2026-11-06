import type { ExerciceFonctionReference, FamilleReference } from "../../core/fonctionsReference.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { calculerViewBoxFonctionReference, RATIO_GRAPHE } from "../../ui/mafsFonctionsReference";
import { evaluerFonctionReference, pointUnitaire } from "../../moteur/verificationFonctionsReference";
import { formatEquationFonctionReferenceLatex } from "../../ui/formatFonctionsReference";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFonctionReference } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionReference>` pour gen10 (Transformer une
 * fonction de référence — chapitre 3, `AppFonctionsReference.tsx`) — feuille d'évaluation.
 *
 * Analogue direct de gen8 (`generateurs/transformationsGraphiques/exportEvaluation.ts`), généralisé
 * aux 6 familles de référence (`FAMILLES`) : l'écran interactif fait lire TH/TV/CH/EH/EV/CV/SOX/SOY
 * séparément via 6 curseurs + 2 toggles (`EtapeFonctionsReferenceExercice.tsx`), chacun vérifié
 * indépendamment, PUIS une étape "reconnaissance" distincte (retrouver la famille parmi 6, avant
 * même d'afficher les curseurs). Un exercice papier ne peut reproduire ni l'une ni l'autre de ces
 * granularités : condensé en UNE question "lis l'équation sur le graphique" — la famille est
 * donnée implicitement par la forme de la courbe tracée (comme sur l'écran, une fois la famille
 * reconnue), exactement comme gen8 condense p/q/EV/CV/SOX en une lecture d'équation unique.
 *
 * Points marqués — mêmes deux points que `MafsGraphFonctionsReference.tsx` (légende "Point
 * caractéristique" / "Point croix") :
 * - le point caractéristique, à `x=TH` (`pivotX`, indépendant de CH/EH/SOY, voir
 *   `verificationFonctionsReference.ts`) : pour les 5 familles où `g(0)=0` (carré/cube/racine
 *   carrée/racine cubique/valeur absolue), `f(TH) = TV` exactement — et pour "inverse", où ce point
 *   n'est pas défini (pôle), l'écran affiche déjà `(TH ; TV)` comme simple repère (intersection des
 *   deux asymptotes, cercle évidé) ; les deux cas convergent donc vers le MÊME couple `(TH ; TV)`,
 *   sans branche spéciale nécessaire ici ;
 * - le second point ("point croix"), où l'argument de la fonction de base vaut exactement 1
 *   (`pointUnitaire`, calculable exactement pour les 6 familles puisque g(1)=1 pour toutes).
 *
 * Pas de tracé des asymptotes de "inverse" ici (`Line.PointAngle` côté Mafs) : `construireSvgFonction`
 * (export/svgGraph.ts) ne sait tracer qu'une courbe échantillonnée + des points, jamais une droite
 * infinie séparée — hors périmètre de ce fichier (qui ne doit toucher aucun autre fichier). La
 * coupure au pôle reste néanmoins correctement rendue (`evaluerFonctionReference` renvoie NaN au
 * pôle, `construireSvgFonction` coupe le tracé exactement comme Mafs le fait pour `Plot.OfX`).
 */

/** Exporté pour gen11 (forme canonique) : même courbe f, mêmes deux points, même fonction de
 * référence en pointillés dans son corrigé détaillé. */
export function construireGrapheFonctionReference(exercice: ExerciceFonctionReference, estCorrige: boolean, libelleCourbe = "f (courbe donnée)"): string {
  // Corrigé : la fonction de référence g (paramètres neutres) en pointillés gris sous la courbe de
  // f, pour voir les transformations appliquées au point (0 ; 0) et au point (1 ; 1). La fenêtre
  // englobe alors les deux courbes (même calcul que l'écran, qui l'étend à la courbe « live »).
  const reference: ExerciceFonctionReference = { famille: exercice.famille, th: 0, tv: 0, ch: 1, eh: 1, ev: 1, cv: 1, sox: false, soy: false };
  const viewBox = estCorrige ? calculerViewBoxFonctionReference(exercice, reference) : calculerViewBoxFonctionReference(exercice);
  const croix = pointUnitaire(exercice);
  const largeur = 320;
  const points: PointMarqueSvg[] = [
    {
      x: exercice.th,
      y: exercice.tv,
      forme: "point",
      label: estCorrige ? `(${exercice.th} ; ${exercice.tv})` : undefined,
      // Étiquettes de part et d'autre des deux points (sinon elles se chevauchent quand le point
      // croix est sous le point caractéristique).
      labelPosition: croix.y >= exercice.tv ? "dessous" : "dessus",
    },
    {
      x: croix.x,
      y: croix.y,
      forme: "croix",
      label: estCorrige ? `(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})` : undefined,
      labelPosition: croix.y >= exercice.tv ? "dessus" : "dessous",
    },
  ];
  return construireSvgFonction((x) => evaluerFonctionReference(exercice, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur: estCorrige ? 420 : largeur,
    hauteur: (estCorrige ? 420 : largeur) / RATIO_GRAPHE,
    classe: estCorrige ? "figure-corrige" : "graphe-fonction-reference",
    points,
    courbesSecondaires: estCorrige ? [{ evaluer: (x) => evaluerFonctionReference(reference, x) }] : undefined,
    legende: estCorrige
      ? [
          { texte: libelleCourbe, couleur: "#1971c2" },
          { texte: `référence ${BASE_TEXTE[exercice.famille]}`, couleur: "#8a8f98", pointilles: true },
        ]
      : undefined,
  });
}

/** Nom court de la fonction de référence, pour la légende du graphique du corrigé (texte SVG). */
const BASE_TEXTE: Record<FamilleReference, string> = {
  carre: "y = x²",
  cube: "y = x³",
  racine_carree: "y = √x",
  racine_cubique: "y = ∛x",
  inverse: "y = 1/x",
  valeur_absolue: "y = |x|",
};

/** Nombre (entier ou fraction irréductible) rendu en LaTeX — `\dfrac` plutôt que « p/q ». */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : brut;
}

function coordonneesLatex(x: number, y: number): string {
  return `\\left(${nombreLatex(x)}\\,;\\,${nombreLatex(y)}\\right)`;
}

/** Données lues sur le graphique, comme dans la légende de l'écran (`MafsGraphFonctionsReference` :
 * « Point caractéristique » et « Point croix » avec leurs coordonnées exactes — le point croix a
 * souvent des coordonnées fractionnaires, illisibles sur un quadrillage imprimé). */
function donneesGraphique(exercice: ExerciceFonctionReference): FragmentConsigne[] {
  const croix = pointUnitaire(exercice);
  return [
    texte(exercice.famille === "inverse" ? "Point caractéristique (•, centre de la courbe, à l'intersection de ses asymptotes) : " : "Point caractéristique (•) : "),
    latex(coordonneesLatex(exercice.th, exercice.tv)),
    texte(" ; point croix (×) : "),
    latex(coordonneesLatex(croix.x, croix.y)),
    texte("."),
  ];
}

const PHRASE_GRAPHIQUE = "Le graphique ci-dessous représente une fonction f obtenue en transformant l'une des fonctions de référence ";
const FONCTIONS_REFERENCE: FragmentConsigne[] = [latex("x^2"), texte(", "), latex("x^3"), texte(", "), latex("\\sqrt{x}"), texte(", "), latex("\\sqrt[3]{x}"), texte(", "), latex("\\dfrac{1}{x}"), texte(" ou "), latex("|x|"), texte(". ")];

/** Étapes du raisonnement, dans l'ordre des écrans (reconnaissance de la famille, puis lecture des
 * transformations et de l'équation) — sous-questions du générateur, reprises comme étapes du
 * corrigé sur papier (`enoncePapier`). */
function construireEnonceFonctionsReference(exercice: ExerciceFonctionReference): SectionExercice {
  return {
    enteteFragments: [texte(PHRASE_GRAPHIQUE), ...FONCTIONS_REFERENCE, ...donneesGraphique(exercice)],
    enteteHtml: construireGrapheFonctionReference(exercice, false),
    questions: [
      { consigne: [texte("Reconnais la fonction de référence dont la courbe est issue.")] },
      { consigne: [texte("Lis les translations horizontale et verticale à l'aide du point caractéristique.")] },
      { consigne: [texte("Compare le point croix au point caractéristique : déduis-en l'étirement ou la compression, et les symétries.")] },
      { consigne: [texte("Écris l'équation de f, sous sa forme la plus simple.")] },
    ],
  };
}

/** Énoncé PAPIER (feuille d'exercices, évaluation) : l'énoncé et la consigne globale seulement.
 * Les sous-questions de `construireEnonce` sont les étapes d'apprentissage du générateur
 * interactif : sur papier, elles passent dans le corrigé (voir `EnoncePapier`). */
function enoncePapierFonctionsReference(exercice: ExerciceFonctionReference): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte(PHRASE_GRAPHIQUE),
        ...FONCTIONS_REFERENCE,
        ...donneesGraphique(exercice),
        texte(" Détermine l'équation de f, sous sa forme la plus simple."),
      ],
      enteteHtml: construireGrapheFonctionReference(exercice, false),
      questions: [],
    },
  };
}

function construireCorrectionFonctionsReference(exercice: ExerciceFonctionReference): BlocCorrection[] {
  const croix = pointUnitaire(exercice);
  return [
    {
      type: "paragraphe",
      fragments: [
        texte("Point caractéristique lu directement sur le graphique : "),
        latex(`(${exercice.th} ; ${exercice.tv})`),
        texte(", donc TH et TV sont connus."),
      ],
    },
    {
      type: "paragraphe",
      fragments: [
        texte("Second point marqué (là où l'argument de la fonction vaut exactement 1) : "),
        latex(`(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})`),
        texte(" — il permet de retrouver le rapport d'échelle et l'orientation de la courbe."),
      ],
    },
    { type: "html", html: construireGrapheFonctionReference(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(formatEquationFonctionReferenceLatex(exercice)), texte(".")] },
  ];
}

// ============================================================================
// Feuilles enrichies (difficulté, réponse brève, corrigé détaillé, barème). Les
// équations viennent TOUJOURS de `formatEquationFonctionReferenceLatex` (la même fonction que la
// réponse révélée de l'écran) et les points de `pointUnitaire` (le même que le graphe de l'écran).
// Étapes (lettres du corrigé et du barème) : a) famille, b) translations, c) facteur et symétries,
// d) équation — mêmes étapes que `construireEnonce`.
// ============================================================================

const FAMILLES_PAIRES: FamilleReference[] = ["carre", "valeur_absolue"];
const FAMILLES_IMPAIRES: FamilleReference[] = ["cube", "racine_cubique", "inverse"];

/** Mêmes paramètres, écrits sous la forme la plus simple : pour une fonction de référence PAIRE, la
 * symétrie d'axe Oy (appliquée autour du point caractéristique) ne change pas la courbe ; pour une
 * fonction IMPAIRE, elle équivaut à la symétrie d'axe Ox (le « − » sort devant). La vérification de
 * l'écran est holistique et accepte les deux écritures. */
function exerciceSimplifie(exercice: ExerciceFonctionReference): ExerciceFonctionReference {
  if (!exercice.soy) return exercice;
  if (FAMILLES_PAIRES.includes(exercice.famille)) return { ...exercice, soy: false };
  if (FAMILLES_IMPAIRES.includes(exercice.famille)) return { ...exercice, soy: false, sox: !exercice.sox };
  return exercice;
}

function equationLatex(exercice: ExerciceFonctionReference): string {
  return formatEquationFonctionReferenceLatex(exerciceSimplifie(exercice));
}

const BASE_LATEX: Record<FamilleReference, string> = {
  carre: "y = x^2",
  cube: "y = x^3",
  racine_carree: "y = \\sqrt{x}",
  racine_cubique: "y = \\sqrt[3]{x}",
  inverse: "y = \\dfrac{1}{x}",
  valeur_absolue: "y = |x|",
};

const FORME_COURBE: Record<FamilleReference, string> = {
  carre: "une parabole",
  cube: "une courbe en S, qui monte (ou descend) de plus en plus vite",
  racine_carree: "une demi-branche qui part du point caractéristique",
  racine_cubique: "une courbe en S couchée, verticale au point caractéristique",
  inverse: "une hyperbole à deux branches, avec une asymptote verticale et une asymptote horizontale",
  valeur_absolue: "un V, dont la pointe est le point caractéristique",
};

/** Facteur horizontal et vertical lus avec le point croix : écart au point caractéristique. */
function ecarts(exercice: ExerciceFonctionReference): { dx: number; dy: number } {
  const croix = pointUnitaire(exercice);
  return { dx: croix.x - exercice.th, dy: croix.y - exercice.tv };
}

function translationTexte(valeur: number, sens: string, positif: string, negatif: string): string {
  if (valeur === 0) return `pas de translation ${sens}`;
  return `translation ${sens} de ${Math.abs(valeur)} unité${Math.abs(valeur) > 1 ? "s" : ""} vers ${valeur > 0 ? positif : negatif}`;
}

function lectureHorizontale(exercice: ExerciceFonctionReference): FragmentConsigne[] {
  const { ch, eh } = exercice;
  if (ch === 1 && eh === 1) return [latex("|\\Delta x| = 1"), texte(" : ni étirement ni compression horizontale")];
  if (eh > 1) return [latex(`|\\Delta x| = ${eh}`), texte(` : étirement horizontal de facteur ${eh}, l'argument est divisé par ${eh}`)];
  return [latex(`|\\Delta x| = \\dfrac{1}{${ch}}`), texte(` : compression horizontale de facteur ${ch}, l'argument est multiplié par ${ch}`)];
}

function lectureVerticale(exercice: ExerciceFonctionReference): FragmentConsigne[] {
  const { ev, cv } = exercice;
  if (ev === 1 && cv === 1) return [latex("|\\Delta y| = 1"), texte(" : ni étirement ni compression verticale")];
  if (ev > 1) return [latex(`|\\Delta y| = ${ev}`), texte(` : étirement vertical de facteur ${ev}, la fonction est multipliée par ${ev}`)];
  return [latex(`|\\Delta y| = \\dfrac{1}{${cv}}`), texte(` : compression verticale de facteur ${cv}, la fonction est divisée par ${cv}`)];
}

function difficulteFonctionsReference(exercice: ExerciceFonctionReference): 1 | 2 | 3 {
  // Compression (écart fractionnaire) : la lecture la plus délicate. Étirement ou symétrie : une
  // transformation de plus à lire que les seules translations.
  if (exercice.ch > 1 || exercice.cv > 1) return 3;
  if (exercice.eh > 1 || exercice.ev > 1 || exercice.sox || exercice.soy) return 2;
  return 1;
}

function reponseBreveFonctionsReference(exercice: ExerciceFonctionReference): FragmentConsigne[] {
  return [latex(equationLatex(exercice))];
}

function correctionDetailleeFonctionsReference(exercice: ExerciceFonctionReference): EtapeCorrection[] {
  const { th, tv } = exercice;
  const croix = pointUnitaire(exercice);
  const { dx, dy } = ecarts(exercice);
  const inverse = exercice.famille === "inverse";
  const etapes: EtapeCorrection[] = [
    { label: "Famille", sousQuestion: "a", fragments: [texte(`La courbe est ${FORME_COURBE[exercice.famille]} : elle est issue de `), latex(BASE_LATEX[exercice.famille]), texte(".")] },
    {
      label: "Méthode",
      sousQuestion: "b",
      fragments: inverse
        ? [texte("Pour "), latex("y = \\dfrac{1}{x}"), texte(", le centre est l'origine, intersection des asymptotes "), latex("x = 0"), texte(" et "), latex("y = 0"), texte(" : les translations l'ont amené au point caractéristique.")]
        : [texte("Le point "), latex("(0\\,;\\,0)"), texte(" de "), latex(BASE_LATEX[exercice.famille]), texte(" a été amené au point caractéristique par les translations.")],
    },
    {
      label: "Lecture",
      sousQuestion: "b",
      fragments: [
        texte("Point caractéristique "),
        latex(coordonneesLatex(th, tv)),
        texte(` : ${translationTexte(th, "horizontale", "la droite", "la gauche")}, ${translationTexte(tv, "verticale", "le haut", "le bas")}.`),
      ],
      figureHtml: construireGrapheFonctionReference(exercice, true),
    },
    {
      label: "Méthode",
      sousQuestion: "c",
      fragments: [
        texte("Pour "),
        latex(BASE_LATEX[exercice.famille]),
        texte(", le point croix est "),
        latex("(1\\,;\\,1)"),
        texte(", à 1 unité à droite et 1 unité au-dessus du point caractéristique. On compare donc les écarts."),
      ],
    },
    {
      label: "Calcul",
      sousQuestion: "c",
      fragments: [
        texte("Point croix "),
        latex(coordonneesLatex(croix.x, croix.y)),
        texte(" : "),
        latex(`\\Delta x = ${nombreLatex(dx)}`),
        texte(" et "),
        latex(`\\Delta y = ${nombreLatex(dy)}`),
        texte("."),
      ],
    },
    {
      label: "Lecture",
      sousQuestion: "c",
      fragments: [
        ...lectureHorizontale(exercice),
        texte(dx < 0 ? " ; écart négatif : symétrie d'axe vertical (l'argument change de signe). " : ". "),
        ...lectureVerticale(exercice),
        texte(dy < 0 ? " ; écart négatif : symétrie d'axe horizontal (un signe « − » devant la fonction)." : "."),
      ],
    },
  ];
  if (exercice.soy && FAMILLES_PAIRES.includes(exercice.famille)) {
    etapes.push({ label: "Remarque", sousQuestion: "c", fragments: [texte("La fonction de référence est paire : la symétrie d'axe vertical ne change pas la courbe, on ne l'écrit pas.")] });
  } else if (exercice.soy && FAMILLES_IMPAIRES.includes(exercice.famille)) {
    etapes.push({ label: "Remarque", sousQuestion: "c", fragments: [texte("La fonction de référence est impaire : le signe « − » de l'argument peut sortir devant la fonction.")] });
  }
  etapes.push({ label: "Conclusion", sousQuestion: "d", fragments: [latex(equationLatex(exercice)), texte(".")] });
  etapes.push({
    label: "Piège",
    fragments: inverse
      ? [texte("Le point caractéristique de "), latex("\\dfrac{1}{x}"), texte(" n'est pas sur la courbe : c'est le centre. La translation horizontale se lit sur l'asymptote verticale, la verticale sur l'asymptote horizontale.")]
      : [texte("Une translation de 3 unités vers la droite s'écrit "), latex("x - 3"), texte(" dans l'argument : le signe est l'opposé du sens du déplacement.")],
  });
  return etapes;
}

function baremeFonctionsReference(exercice: ExerciceFonctionReference): BaremeExercice {
  const { th, tv } = exercice;
  const erreurs: ErreurFrequente[] = [];
  if (th !== 0) {
    erreurs.push({
      description: [texte("Signe de la translation horizontale inversé : "), latex(th > 0 ? `x + ${th}` : `x - ${-th}`), texte(" au lieu de "), latex(th > 0 ? `x - ${th}` : `x + ${-th}`)],
      cout: "0 pt sur b), équation notée sans double pénalité",
    });
  }
  if (exercice.ch > 1 || exercice.eh > 1 || exercice.cv > 1 || exercice.ev > 1) {
    erreurs.push({ description: [texte("Confondre étirement et compression (facteur k au lieu de "), latex("\\dfrac{1}{k}"), texte(")")], cout: "0 pt sur c)" });
  }
  if (exercice.famille === "inverse") {
    erreurs.push({ description: [texte("Prendre le centre pour un point de la courbe")], cout: "−1" });
  }
  const acceptees: FragmentConsigne[][] = [[texte("Toute écriture équivalente de l'équation (facteur développé ou mis en évidence, fraction écrite autrement)")]];
  if (exercice.soy && FAMILLES_PAIRES.includes(exercice.famille)) {
    acceptees.push([texte("Le signe « − » laissé dans l'argument (inutile, la fonction de référence est paire) : "), latex(formatEquationFonctionReferenceLatex(exercice))]);
  } else if (exercice.soy && FAMILLES_IMPAIRES.includes(exercice.famille)) {
    acceptees.push([texte("Le signe « − » laissé dans l'argument : "), latex(formatEquationFonctionReferenceLatex(exercice))]);
  }
  return {
    reponseFinale: [latex(equationLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Fonction de référence reconnue : "), latex(BASE_LATEX[exercice.famille])], points: 1 },
      { sousQuestion: "b", critere: [texte("Translations lues au point caractéristique "), latex(coordonneesLatex(th, tv))], points: 1 },
      { sousQuestion: "c", critere: [texte("Facteur et symétries déduits du point croix")], points: 1 },
      { sousQuestion: "d", critere: [texte("Équation complète et correcte")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

export const adaptateurEvaluationFonctionsReference: AdaptateurFeuilleExercices<ExerciceFonctionReference> = {
  titreDocument: "Transformer une fonction de référence — Évaluation",
  nomFichierBase: "fonctions-reference",
  genererInstance: genererExerciceFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFonctionsReference,
  construireCorrection: construireCorrectionFonctionsReference,
  difficulte: difficulteFonctionsReference,
  reponseBreve: reponseBreveFonctionsReference,
  correctionDetaillee: correctionDetailleeFonctionsReference,
  bareme: baremeFonctionsReference,
  enoncePapier: enoncePapierFonctionsReference,
  dureeMinutes: 5,
};
