import type { ExerciceAnalyseFonction } from "../../core/analyseFonction.types";
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
import { formatFonctionOrdreLatex, consigneAxeSommet } from "../../ui/formatAnalyseFonction";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { libelleCategorie } from "../../ui/categorieLabels";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAnalyseFonction } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAnalyseFonction>` pour gen7 (Analyse d'une fonction
 * du second degré, chapitre 1, `AppAnalyseFonction.tsx`) — feuille d'exercices et évaluation.
 *
 * Les écrans du générateur (coefficients, signes de a et de a·b, axe et sommet, ensemble-image,
 * méthode de factorisation, factorisation, racines, tableau de signe et de variation — sans les
 * deux écrans de factorisation pour une fonction irréductible) sont des étapes d'apprentissage :
 * sur papier, l'énoncé est la fonction et la consigne globale « étudie cette fonction », rendue
 * autosuffisante (ce que l'écran demandait étape par étape), et chaque écran devient une étape du
 * corrigé, dans le même ordre (lettres a, b, c…).
 *
 * Valeurs exactes (fractions irréductibles, `formatFractionIrreductible` — l'écran accepte « p/q »)
 * tirées de l'instance (`xS`, `yS`, `grilleSigneVariation`, `exercice.solution`), comme la réponse
 * révélée de l'écran ; énoncé avec le MÊME ordre des termes que l'écran (`formatFonctionOrdreLatex`).
 */

type EtapeGen7 = "coefficients" | "allure" | "axeSommet" | "image" | "methode" | "factorisation" | "racines" | "tableau";

function etapes(instance: ExerciceAnalyseFonction): EtapeGen7[] {
  return instance.exercice.categorie === "irreductible"
    ? ["coefficients", "allure", "axeSommet", "image", "methode", "tableau"]
    : ["coefficients", "allure", "axeSommet", "image", "methode", "factorisation", "racines", "tableau"];
}

function lettre(instance: ExerciceAnalyseFonction, etape: EtapeGen7): string {
  return "abcdefgh"[etapes(instance).indexOf(etape)];
}

/** Nombre exact (entier ou fraction irréductible) en LaTeX. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : brut;
}

/** Même nombre en texte (tableau HTML) : « − » typographique, fraction « p/q ». */
function nombreTexte(valeur: number): string {
  return formatFractionIrreductible(valeur).replace("-", "−");
}

function fonctionLatex(instance: ExerciceAnalyseFonction): string {
  return formatFonctionOrdreLatex(instance.exercice.enonce, instance.ordreTermes);
}

const CONSIGNE_GLOBALE =
  " Étudie cette fonction du second degré : concavité de la parabole (signe de a), axe de symétrie et coordonnées du sommet, ensemble-image, racines (factorise par la méthode la plus rapide, ou justifie qu'il n'y en a pas) et tableau de signe et de variation.";

function imageLatex(instance: ExerciceAnalyseFonction): string {
  const y = nombreLatex(instance.yS);
  return instance.exercice.enonce.a > 0 ? `\\mathrm{im}\\,f = \\left[${y}\\,;\\,+\\infty\\right[` : `\\mathrm{im}\\,f = \\left]-\\infty\\,;\\,${y}\\right]`;
}

function racinesTriees(instance: ExerciceAnalyseFonction): number[] {
  const [r1, r2] = instance.exercice.solution.racines;
  return r1 === r2 ? [r1] : [Math.min(r1, r2), Math.max(r1, r2)];
}

function racinesLatex(instance: ExerciceAnalyseFonction): string {
  const r = racinesTriees(instance);
  return r.length === 1 ? `x = ${nombreLatex(r[0])} \\text{ (racine double)}` : `x = ${nombreLatex(r[0])} \\text{ ou } x = ${nombreLatex(r[1])}`;
}

/** Tableau de signe et de variation (HTML autonome, styles en ligne) — mêmes colonnes que l'écran
 * (`EtapeTableauSigneVariation`) : −∞ et +∞ dans leurs propres colonnes, puis l'alternance
 * intervalle / valeur de `grilleSigneVariation`. */
function tableauHtml(instance: ExerciceAnalyseFonction): string {
  const { colonnesValeurs, ligneSigne, ligneVariation } = instance.grilleSigneVariation;
  const ligneX = ligneSigne.map((_, i) => (i % 2 === 1 ? nombreTexte(colonnesValeurs[(i - 1) / 2]) : ""));
  const cellule = (contenu: string, entete = false) =>
    `<td style="border:1px solid #444;padding:4px 8px;text-align:center;min-width:28px;${entete ? "font-weight:600;text-align:left;white-space:nowrap;" : ""}">${contenu}</td>`;
  const ligne = (titre: string, valeurs: string[]) => `<tr>${cellule(titre, true)}${valeurs.map((v) => cellule(v.replace("-", "−"))).join("")}</tr>`;
  return (
    `<table style="border-collapse:collapse;margin:6px 0;font-size:14px">` +
    ligne("x", ["−∞", ...ligneX, "+∞"]) +
    ligne("signe de f(x)", ["", ...ligneSigne, ""]) +
    ligne("variation de f", ["", ...ligneVariation, ""]) +
    `</table>`
  );
}

// ---------------------------------------------------------------------------------------------
// Énoncé (étapes = écrans) et énoncé papier
// ---------------------------------------------------------------------------------------------

function consigneEtape(etape: EtapeGen7): FragmentConsigne[] {
  switch (etape) {
    case "coefficients":
      return [texte("Identifie les coefficients a, b et c.")];
    case "allure":
      return [texte("Donne le signe de a, puis celui du produit "), latex("a\\cdot b"), texte(".")];
    case "axeSommet":
      return [texte(consigneAxeSommet().replace(" (arrondi au centième accepté si besoin)", ""))];
    case "image":
      return [texte("Donne l'ensemble-image de f (son domaine est "), latex("\\mathbb{R}"), texte(").")];
    case "methode":
      return [texte("Quelle est la méthode la plus rapide pour trouver les racines de f ?")];
    case "factorisation":
      return [texte("Factorise "), latex("f(x)"), texte(".")];
    case "racines":
      return [texte("Donne les racines de f.")];
    case "tableau":
      return [texte("Complète le tableau de signe et de variation de f.")];
  }
}

function construireEnonceAnalyseFonction(instance: ExerciceAnalyseFonction): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(instance)), texte(".")],
    questions: etapes(instance).map((etape) => ({ consigne: consigneEtape(etape) })),
  };
}

function enoncePapierAnalyseFonction(instance: ExerciceAnalyseFonction): EnoncePapier {
  return {
    section: { enteteFragments: [texte("On considère la fonction "), latex(fonctionLatex(instance)), texte("."), texte(CONSIGNE_GLOBALE)], questions: [] },
  };
}

function construireCorrectionAnalyseFonction(instance: ExerciceAnalyseFonction): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte(`Sommet : S(${nombreTexte(instance.xS)} ; ${nombreTexte(instance.yS)}). `), latex(imageLatex(instance))] },
    { type: "html", html: tableauHtml(instance) },
  ];
}

// ---------------------------------------------------------------------------------------------
// Feuilles enrichies
// ---------------------------------------------------------------------------------------------

function difficulteAnalyseFonction(instance: ExerciceAnalyseFonction): 1 | 2 | 3 {
  // Sommet fractionnaire : calculs de fractions dans y_S et dans le tableau.
  if (!Number.isInteger(instance.xS) || !Number.isInteger(instance.yS)) return 3;
  return 2;
}

function reponseBreveAnalyseFonction(instance: ExerciceAnalyseFonction): FragmentConsigne[] {
  const { a } = instance.exercice.enonce;
  const fragments: FragmentConsigne[] = [
    texte(`${a > 0 ? "Parabole tournée vers le haut" : "Parabole tournée vers le bas"}, axe `),
    latex(`x = ${nombreLatex(instance.xS)}`),
    texte(", sommet "),
    latex(`S\\left(${nombreLatex(instance.xS)}\\,;\\,${nombreLatex(instance.yS)}\\right)`),
    texte(", "),
    latex(imageLatex(instance)),
    texte(" ; "),
  ];
  if (instance.exercice.categorie === "irreductible") fragments.push(texte("aucune racine réelle."));
  else fragments.push(latex(`f(x) = ${instance.exercice.solution.formeFactorisee ?? ""}`), texte(", racines "), latex(racinesLatex(instance)), texte("."));
  return fragments;
}

function correctionDetailleeAnalyseFonction(instance: ExerciceAnalyseFonction): EtapeCorrection[] {
  const L = (etape: EtapeGen7) => lettre(instance, etape);
  const { a, b, c } = instance.exercice.enonce;
  const { xS, yS } = instance;
  const positif = a > 0;
  const ab = a * b;
  const lignes: EtapeCorrection[] = [
    {
      label: "Lecture",
      sousQuestion: L("coefficients"),
      fragments: [texte("On ordonne f(x) selon les puissances décroissantes de x : "), latex(`a = ${a}`), texte(", "), latex(`b = ${b}`), texte(", "), latex(`c = ${c}`), texte(".")],
    },
    {
      label: "Allure",
      sousQuestion: L("allure"),
      fragments: [
        latex(positif ? "a > 0" : "a < 0"),
        texte(` : parabole tournée vers le ${positif ? "haut (minimum)" : "bas (maximum)"}. `),
        latex(`a\\cdot b = ${ab}${ab > 0 ? " > 0" : ab < 0 ? " < 0" : ""}`),
        texte(ab === 0 ? " : l'axe de symétrie est l'axe Oy." : ab > 0 ? " : a et b de même signe, l'axe de symétrie est à gauche de Oy." : " : a et b de signes contraires, l'axe de symétrie est à droite de Oy."),
      ],
    },
    {
      label: "Calcul",
      sousQuestion: L("axeSommet"),
      fragments: [latex(`x_S = -\\dfrac{b}{2a} = -\\dfrac{${b < 0 ? `(${b})` : b}}{2\\cdot ${a < 0 ? `(${a})` : a}} = ${nombreLatex(xS)}`), texte(" ; "), latex(`y_S = f\\left(${nombreLatex(xS)}\\right) = ${nombreLatex(yS)}`), texte(".")],
    },
    { label: "Conclusion", sousQuestion: L("axeSommet"), fragments: [texte("Axe de symétrie "), latex(`x = ${nombreLatex(xS)}`), texte(", sommet "), latex(`S\\left(${nombreLatex(xS)}\\,;\\,${nombreLatex(yS)}\\right)`), texte(".")] },
    {
      label: "Conclusion",
      sousQuestion: L("image"),
      fragments: [texte(`f admet un ${positif ? "minimum" : "maximum"} ${nombreTexte(yS)} en son sommet : `), latex(imageLatex(instance)), texte(".")],
    },
  ];
  if (instance.exercice.categorie === "irreductible") {
    lignes.push({
      label: "Méthode",
      sousQuestion: L("methode"),
      fragments: [
        texte(`Aucune factorisation réelle : le sommet S est ${positif ? "au-dessus" : "en dessous"} de l'axe Ox et la parabole est tournée vers le ${positif ? "haut" : "bas"}, donc f(x) ${positif ? "≥" : "≤"} ${nombreTexte(yS)} : f ne s'annule jamais, aucune racine.`),
      ],
    });
  } else {
    lignes.push(
      { label: "Méthode", sousQuestion: L("methode"), fragments: [texte(`${libelleCategorie(instance.exercice.categorie)} : ${raisonMethode(instance)}`)] },
      { label: "Calcul", sousQuestion: L("factorisation"), fragments: [latex(`f(x) = ${instance.exercice.solution.formeFactorisee ?? ""}`)] },
      { label: "Conclusion", sousQuestion: L("racines"), fragments: [texte("Un produit est nul si l'un de ses facteurs est nul : "), latex(racinesLatex(instance)), texte(".")] },
    );
  }
  lignes.push({
    label: "Tableau",
    sousQuestion: L("tableau"),
    fragments: [
      texte(
        instance.exercice.categorie === "irreductible"
          ? `Signe constant (celui de a), variation qui change au sommet x = ${nombreTexte(xS)} :`
          : racinesTriees(instance).length === 1
            ? `Signe de a partout, sauf en la racine double où f s'annule ; variation qui change au sommet x = ${nombreTexte(xS)} :`
            : `Signe de a à l'extérieur des racines, opposé entre elles ; variation qui change au sommet x = ${nombreTexte(xS)} :`,
      ),
    ],
    figureHtml: tableauHtml(instance),
  });
  lignes.push(piege(instance));
  return lignes;
}

function raisonMethode(instance: ExerciceAnalyseFonction): string {
  switch (instance.exercice.categorie) {
    case "mise_en_evidence":
      return "pas de terme constant (c = 0), x se met en évidence.";
    case "binome_conjugue":
      return "pas de terme en x (b = 0) : différence de deux carrés.";
    case "produit_remarquable":
      return "trinôme carré parfait (Δ = 0).";
    default:
      return "";
  }
}

function piege(instance: ExerciceAnalyseFonction): EtapeCorrection {
  const L = (etape: EtapeGen7) => lettre(instance, etape);
  if (instance.ordreTermes[0] !== "a") {
    return { label: "Piège", sousQuestion: L("coefficients"), fragments: [texte("Les termes ne sont pas écrits dans l'ordre : a est le coefficient de "), latex("x^2"), texte(", pas le premier nombre écrit.")] };
  }
  if (instance.exercice.categorie === "produit_remarquable") {
    return { label: "Piège", sousQuestion: L("tableau"), fragments: [texte("Racine double : le signe de f(x) ne change pas en traversant la racine, il s'annule seulement en ce point.")] };
  }
  return { label: "Piège", sousQuestion: L("image"), fragments: [texte("L'ensemble-image se lit sur l'ordonnée du sommet (pas sur son abscisse), avec le crochet fermé du côté du sommet.")] };
}

function baremeAnalyseFonction(instance: ExerciceAnalyseFonction): BaremeExercice {
  const L = (etape: EtapeGen7) => lettre(instance, etape);
  const irreductible = instance.exercice.categorie === "irreductible";
  const criteres: CritereBareme[] = [
    { sousQuestion: L("allure"), critere: [texte("Concavité justifiée par le signe de a")], points: 0.5 },
    { sousQuestion: L("axeSommet"), critere: [texte("Axe "), latex(`x = ${nombreLatex(instance.xS)}`), texte(" et sommet "), latex(`S\\left(${nombreLatex(instance.xS)}\\,;\\,${nombreLatex(instance.yS)}\\right)`)], points: 1 },
    { sousQuestion: L("image"), critere: [latex(imageLatex(instance))], points: 0.5 },
    irreductible
      ? { sousQuestion: L("methode"), critere: [texte("Absence de racine justifiée (sommet et concavité)")], points: 1 }
      : { sousQuestion: L("factorisation"), critere: [texte("Factorisation par la méthode la plus rapide : "), latex(`f(x) = ${instance.exercice.solution.formeFactorisee ?? ""}`)], points: 0.5 },
    ...(irreductible ? [] : [{ sousQuestion: L("racines"), critere: [latex(racinesLatex(instance))], points: 0.5 }]),
    { sousQuestion: L("tableau"), critere: [texte("Tableau de signe et de variation complet et cohérent")], points: 1 },
  ];
  const erreurs: ErreurFrequente[] = [
    { description: [texte("Ensemble-image construit avec l'abscisse du sommet au lieu de son ordonnée")], cout: "0 pt sur l'ensemble-image" },
    { description: [texte("Signe de "), latex("x_S"), texte(" faux (oubli du « − » de "), latex("-\\dfrac{b}{2a}"), texte(")")], cout: "−0,5, suite notée sans double pénalité" },
  ];
  if (instance.ordreTermes[0] !== "a") erreurs.push({ description: [texte("Coefficients lus dans l'ordre d'écriture plutôt que par degré")], cout: "suite notée sans double pénalité" });
  if (!irreductible) erreurs.push({ description: [texte("Racines trouvées par le discriminant au lieu de la méthode la plus rapide")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveAnalyseFonction(instance),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs exactes sous forme décimale exacte (2,5 pour 5/2)")], [texte("Sommet obtenu en complétant le carré plutôt qu'avec la formule de l'abscisse du sommet")]],
  };
}

export const adaptateurExportWordAnalyseFonction: AdaptateurFeuilleExercices<ExerciceAnalyseFonction> = {
  titreDocument: "Analyse d'une fonction du second degré — Évaluation",
  nomFichierBase: "analyse-fonction-second-degre",
  genererInstance: genererExerciceAnalyseFonction,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceAnalyseFonction,
  construireCorrection: construireCorrectionAnalyseFonction,
  difficulte: difficulteAnalyseFonction,
  reponseBreve: reponseBreveAnalyseFonction,
  correctionDetaillee: correctionDetailleeAnalyseFonction,
  bareme: baremeAnalyseFonction,
  enoncePapier: enoncePapierAnalyseFonction,
  dureeMinutes: 10,
};
