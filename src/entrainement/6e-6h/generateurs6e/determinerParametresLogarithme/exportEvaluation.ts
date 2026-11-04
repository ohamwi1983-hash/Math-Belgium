import type { ExerciceDeterminerParametresLogarithme } from "../../core6e/determinerParametresLogarithme.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EtapeAmenagee, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { CONSIGNE_GENERALE, consigneEcran, descriptionGraphique, formatEquationBLatex, formatFonctionLatex, ordonneeSecondeMarque } from "../../ui6e/formatDeterminerParametresLogarithme";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDeterminerParametresLogarithme } from "./index";
import { construireSvgParametresLogarithme } from "./svgParametresLogarithme";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme>` pour `6gen18`
 * (f(x) = a + b·ln(x) depuis un graphique) — feuille d'évaluation. Le graphique est joint en SVG
 * (`enteteHtml`, pipeline HTML) ; comme les pipelines Word/PDF ne reçoivent pas la figure,
 * l'en-tête décrit aussi les informations lues (coordonnées des points / de la tangente), pour
 * que la feuille reste faisable dans tous les formats. Trois questions, une par écran (a, équation
 * en b, f(x)) ; le corrigé reprend les mêmes formes que la réponse attendue à l'écran.
 */

function construireEnonce(exercice: ExerciceDeterminerParametresLogarithme): SectionExercice {
  return {
    enteteFragments: [...CONSIGNE_GENERALE, texte(" Sur le graphique : "), ...descriptionGraphique(exercice, true)],
    enteteHtml: construireSvgParametresLogarithme(exercice),
    questions: [
      { consigne: consigneEcran("lireA", exercice), reponse: { type: "lignes", nombre: 2 } },
      { consigne: consigneEcran("equationB", exercice), reponse: { type: "lignes", nombre: 2 } },
      { consigne: consigneEcran("fonction", exercice), reponse: { type: "lignes", nombre: 2 } },
    ],
  };
}

function construireCorrection(exercice: ExerciceDeterminerParametresLogarithme): BlocCorrection[] {
  const raison =
    exercice.variante === "pente"
      ? "la pente de la tangente en x = 1 est f′(1), et f′(x) = b/x : "
      : exercice.variante === "pointE"
        ? `le point ${exercice.lettrePoint2} est sur la courbe et ln(e) = 1 (piège : f(e) = a + b, pas a) : `
        : `le point ${exercice.lettrePoint2} est sur la courbe et ln(e²) = 2 : `;
  return [
    { type: "paragraphe", fragments: [texte("a) Comme ln(1) = 0, "), latex(`f(1) = a + b\\cdot\\ln(1) = a`), texte(` : on lit f(1) = ${exercice.a}, donc a = ${exercice.a}.`)] },
    { type: "paragraphe", fragments: [texte(`b) ${raison[0].toUpperCase()}${raison.slice(1)}`), latex(formatEquationBLatex(exercice)), texte(".")] },
    { type: "paragraphe", fragments: [texte(`c) b = ${exercice.b}, donc `), latex(formatFonctionLatex(exercice)), texte(".")] },
  ];
}

/** Nombre en texte courant, avec le vrai signe moins typographique. */
function nb(n: number): string {
  return String(n).replace("-", "−");
}

/** Abscisse de la seconde marque, en LaTeX (e ou e²) — variantes `pointE`/`pointE2` seulement. */
function abscisseLatex(exercice: ExerciceDeterminerParametresLogarithme): string {
  return exercice.variante === "pointE" ? "e" : "e^2";
}

/** Valeur de ln en la seconde marque (1 pour e, 2 pour e²). */
function lnSecondeMarque(exercice: ExerciceDeterminerParametresLogarithme): number {
  return exercice.variante === "pointE" ? 1 : 2;
}

function difficulte(exercice: ExerciceDeterminerParametresLogarithme): 1 | 2 | 3 {
  // Tangente : une lecture de pente puis f′(1) = b ; point en e : le piège f(e) = a + b ; point
  // en e² : même piège, doublé de ln(e²) = 2.
  return exercice.variante === "pointE2" ? 3 : 2;
}

function reponseBreve(exercice: ExerciceDeterminerParametresLogarithme): FragmentConsigne[] {
  return [latex(`a = ${exercice.a}`), texte(" ; "), latex(`b = ${exercice.b}`), texte(" ; "), latex(formatFonctionLatex(exercice))];
}

function correctionDetaillee(exercice: ExerciceDeterminerParametresLogarithme): EtapeCorrection[] {
  const { a, b } = exercice;
  const etapes: EtapeCorrection[] = [
    {
      label: "Lire a",
      sousQuestion: "a",
      fragments: [
        texte("Comme ln(1) = 0, "),
        latex("f(1) = a + b\\cdot\\ln(1) = a"),
        texte(`. Le point ${exercice.lettrePoint1} a pour coordonnées `),
        latex(`(1\\,;\\,${a})`),
        texte(`, donc a = ${nb(a)}.`),
      ],
    },
  ];
  if (exercice.variante === "pente") {
    etapes.push(
      {
        label: "Méthode",
        sousQuestion: "b",
        fragments: [texte("La pente de la tangente en x = 1 est le nombre dérivé f′(1). Or "), latex("f'(x) = \\dfrac{b}{x}"), texte(", donc "), latex("f'(1) = b"), texte(".")],
      },
      {
        label: "Pente",
        sousQuestion: "b",
        fragments: [
          texte("La tangente passe par "),
          latex(`(1\\,;\\,${a})`),
          texte(" et "),
          latex(`(2\\,;\\,${a + b})`),
          texte(" : sa pente vaut "),
          latex(`\\dfrac{${a + b} - (${a})}{2 - 1} = ${b}`),
          texte("."),
        ],
      },
      { label: "Équation", sousQuestion: "b", fragments: [latex(formatEquationBLatex(exercice)), texte(".")] },
    );
  } else {
    const y = ordonneeSecondeMarque(exercice);
    const n = lnSecondeMarque(exercice);
    etapes.push(
      {
        label: "Méthode",
        sousQuestion: "b",
        fragments: [
          texte(`Le point ${exercice.lettrePoint2} `),
          latex(`(${abscisseLatex(exercice)}\\,;\\,${y})`),
          texte(" est sur la courbe : son ordonnée est l'image de son abscisse, et "),
          latex(`\\ln(${abscisseLatex(exercice)}) = ${n}`),
          texte("."),
        ],
      },
      { label: "Équation", sousQuestion: "b", fragments: [latex(formatEquationBLatex(exercice)), texte(".")] },
      {
        label: "Piège",
        fragments: [
          texte("Au point d'abscisse "),
          latex(abscisseLatex(exercice)),
          texte(" on lit "),
          latex(n === 1 ? "a + b" : "a + 2b"),
          texte(", pas a : seul le point d'abscisse 1 donne a directement."),
        ],
      },
    );
  }
  etapes.push(
    { label: "Calcul", sousQuestion: "c", fragments: [texte("On isole b : "), latex(`b = ${b}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(formatFonctionLatex(exercice)), texte(".")] },
  );
  return etapes;
}

function bareme(exercice: ExerciceDeterminerParametresLogarithme): BaremeExercice {
  const { a, b } = exercice;
  const criteres =
    exercice.variante === "pente"
      ? [
          { sousQuestion: "a", critere: [texte("ln(1) = 0, donc "), latex(`f(1) = a = ${a}`)], points: 1 },
          { sousQuestion: "b", critere: [texte("Pente de la tangente lue sur le graphique : "), latex(`${b}`)], points: 1 },
          { sousQuestion: "b", critere: [latex("f'(1) = b"), texte(", d'où "), latex(`b = ${b}`)], points: 1 },
          { sousQuestion: "c", critere: [latex(formatFonctionLatex(exercice))], points: 1 },
        ]
      : [
          { sousQuestion: "a", critere: [texte("ln(1) = 0, donc "), latex(`f(1) = a = ${a}`)], points: 1 },
          { sousQuestion: "b", critere: [texte("Équation correcte : "), latex(formatEquationBLatex(exercice).split("\\iff")[0])], points: 1 },
          { sousQuestion: "b", critere: [texte("Résolution : "), latex(`b = ${b}`)], points: 1 },
          { sousQuestion: "c", critere: [latex(formatFonctionLatex(exercice))], points: 1 },
        ];
  const erreursFrequentes =
    exercice.variante === "pente"
      ? [
          { description: [texte("Prendre l'ordonnée à l'origine de la tangente pour la valeur de b")], cout: "0 pt sur la pente et l'équation" },
          { description: [texte("Oublier que "), latex("f'(x) = b/x"), texte(" et écrire b = a")], cout: "−1" },
        ]
      : [
          { description: [texte("Lire a au point d'abscisse "), latex(abscisseLatex(exercice)), texte(" (on y lit "), latex(lnSecondeMarque(exercice) === 1 ? "a + b" : "a + 2b"), texte(")")], cout: "0 pt en a), suite notée sans double pénalité" },
          ...(exercice.variante === "pointE2"
            ? [{ description: [texte("Écrire "), latex("\\ln(e^2) = 1"), texte(" au lieu de 2")], cout: "−1" }]
            : [{ description: [texte("Oublier "), latex("\\ln(e) = 1"), texte(" et garder b·ln(e) sans le simplifier")], cout: "−1 si b n'est pas trouvé" }]),
        ];
  const forme2 = b === 1 ? "\\ln(x)" : b === -1 ? "-\\ln(x)" : `${b}\\ln(x)`;
  return {
    reponseFinale: [latex(`a = ${a}`), texte(", "), latex(`b = ${b}`), texte(", "), latex(formatFonctionLatex(exercice))],
    criteres,
    erreursFrequentes,
    reponsesAcceptees: a === 0 ? [[latex(`f(x) = ${forme2}`)]] : [[latex(`f(x) = ${forme2} ${a < 0 ? "-" : "+"} ${Math.abs(a)}`)]],
  };
}

function enonceAmenage(exercice: ExerciceDeterminerParametresLogarithme): EtapeAmenagee[] {
  const etape2: EtapeAmenagee =
    exercice.variante === "pente"
      ? {
          consigne: [texte("Lis sur le graphique la pente de la tangente en x = 1.")],
          rappel: [texte("Avance d'une unité vers la droite et compte de combien la tangente monte ou descend.")],
          points: 1,
        }
      : {
          consigne: [texte(`Écris l'équation donnée par le point ${exercice.lettrePoint2}.`)],
          rappel: [texte("Son ordonnée est l'image de son abscisse : "), latex(exercice.variante === "pointE" ? "f(e) = a + b\\cdot\\ln(e)" : "f(e^2) = a + b\\cdot\\ln(e^2)"), texte(".")],
          points: 1,
        };
  const etape3: EtapeAmenagee =
    exercice.variante === "pente"
      ? { consigne: [texte("Déduis-en la valeur de b.")], rappel: [latex("f'(x) = \\dfrac{b}{x}"), texte(", donc la pente en x = 1 vaut b.")], points: 1 }
      : { consigne: [texte("Résous cette équation pour trouver b.")], rappel: [texte("Remplace a par la valeur trouvée à l'étape 1.")], points: 1 };
  return [
    {
      consigne: [texte(`Lis l'ordonnée du point ${exercice.lettrePoint1}, d'abscisse 1 : c'est la valeur de a.`)],
      rappel: [texte("ln(1) = 0, donc "), latex("f(1) = a"), texte(".")],
      points: 1,
    },
    etape2,
    etape3,
    { consigne: [texte("Écris l'expression complète de "), latex("f(x)"), texte(".")], points: 1 },
  ];
}

export const adaptateurEvaluationDeterminerParametresLogarithme: AdaptateurFeuilleExercices<ExerciceDeterminerParametresLogarithme> = {
  titreDocument: "Paramètres depuis des conditions graphiques — Évaluation",
  nomFichierBase: "determiner-parametres-logarithme",
  genererInstance: genererExerciceDeterminerParametresLogarithme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enonceAmenage,
  dureeMinutes: 6,
};
