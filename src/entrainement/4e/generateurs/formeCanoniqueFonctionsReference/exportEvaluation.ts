import type { ExerciceFormeCanoniqueFonctionReference, FamilleReference } from "../../core/formeCanoniqueFonctionsReference.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { cibleFinale } from "../../moteur/verificationFormeCanoniqueFonctionsReference";
import {
  fonctionReferenceLatex,
  formatCibleLatex,
  formatCoefficientLatex,
  formatFormeDepartLatex,
  formatGabaritLatex,
  formatLineaire,
} from "../../ui/formatFormeCanoniqueFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecFamille, genererExerciceFormeCanoniqueFonctionReference } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference>` pour gen11
 * (Transformer une fonction de référence — forme canonique et transformations, chapitre 3,
 * `AppFormeCanoniqueFonctionsReference.tsx`) — feuille d'exercices et évaluation.
 *
 * Énoncé papier = l'énoncé (la forme de départ) et la consigne globale de l'appli (« détermine la
 * forme canonique ») — voir `.claude/rules/feuilles-evaluations.md`. Les 6 écrans du générateur
 * (reconnaissance de la famille → forme canonique → EH/CH/SOY → TH → EV/CV/SOX → TV) sont des
 * étapes d'apprentissage : la reconnaissance et la simplification passent dans le corrigé, et les
 * transformations (curseurs) y sont données comme UNE décomposition possible — sur papier elles
 * ne sont pas demandées, parce qu'elles ne sont pas uniques (pour le carré ou la valeur absolue, un
 * étirement vertical et une compression horizontale donnent la même courbe).
 *
 * Une seule question par instance et consigne GÉNÉRIQUE (aucune valeur tirée), sans `enteteHtml` :
 * `regroupable: true` (plusieurs fonctions sous une même question a) b) c) en évaluation).
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `cibleFinale`/`formatCibleLatex`
 * (réponse attendue), `formatFormeDepartLatex` (énoncé), `formatGabaritLatex` (décomposition en
 * transformations) ; seuls les calculs intermédiaires du corrigé (p, quotient/reste) sont
 * recalculés depuis `formeDepart`, par les mêmes formules que `cibleEtape1`.
 */

const CONSIGNE_GENERALE = "Détermine la forme canonique de la fonction (fonction de référence transformée).";

const NOM_FAMILLE: Record<FamilleReference, string> = {
  carre: "fonction carré",
  cube: "fonction cube",
  racine_carree: "fonction racine carrée",
  racine_cubique: "fonction racine cubique",
  inverse: "fonction inverse",
  valeur_absolue: "fonction valeur absolue",
};

/** Formule en `\\displaystyle` : sur papier, une fraction en ligne (`\\frac` en style texte) est
 * illisible, surtout imbriquée (forme de départ de l'inverse). */
function formule(expression: string): FragmentConsigne {
  return latex(`\\displaystyle ${expression}`);
}

// ---------------------------------------------------------------------------------------------
// Briques LaTeX du corrigé
// ---------------------------------------------------------------------------------------------

/** Coefficient placé devant un facteur : 1 → rien, −1 → « − », sinon le nombre (fraction exacte). */
function prefixe(valeur: number): string {
  if (valeur === 1) return "";
  if (valeur === -1) return "-";
  return formatCoefficientLatex(valeur);
}

/** `x − p` (ou `x + |p|`, ou `x` si p = 0). */
function binome(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x - ${formatCoefficientLatex(p)}` : `x + ${formatCoefficientLatex(-p)}`;
}

/** `coef(x − p)`, ou `coef·x` sans parenthèses si p = 0. */
function produitBinome(coef: number, p: number): string {
  return p === 0 ? `${prefixe(coef)}x` : `${prefixe(coef)}(${binome(p)})`;
}

/** ` + v` / ` - |v|` / rien si v = 0. */
function termeConstant(v: number): string {
  if (Math.abs(v) < 1e-9) return "";
  return v > 0 ? ` + ${formatCoefficientLatex(v)}` : ` - ${formatCoefficientLatex(-v)}`;
}

function egal(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}

/** Méthode de simplification de la famille (corrigé). */
function methode(exercice: ExerciceFormeCanoniqueFonctionReference): FragmentConsigne[] {
  switch (exercice.formeDepart.type) {
    case "carre":
      return [texte("Compléter le carré : mettre le coefficient de x² en évidence dans les termes en x, puis utiliser "), latex("x^2 + 2kx = (x + k)^2 - k^2"), texte(".")];
    case "inverse":
      return [texte("Diviser : écrire le numérateur à l'aide du dénominateur, séparer la fraction en deux termes, puis mettre le coefficient de x en évidence au dénominateur.")];
    case "cube":
      return [texte("Mettre le coefficient de x en évidence à l'intérieur du cube, puis le faire sortir au cube : "), latex("(b\\cdot u)^3 = b^3\\cdot u^3"), texte(".")];
    case "racine_carree":
    case "racine_cubique":
      return [texte("Mettre le coefficient de x en évidence sous la racine pour faire apparaître x − p ; ce coefficient reste sous la racine.")];
    case "valeur_absolue":
      return [texte("Mettre le coefficient de x en évidence dans la valeur absolue, puis le faire sortir en valeur absolue : "), latex("|a\\cdot u| = |a|\\cdot|u|"), texte(".")];
  }
}

/** Calcul intermédiaire (corrigé), recalculé depuis `formeDepart` par les formules de `cibleEtape1`. */
function calculIntermediaire(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  const forme = exercice.formeDepart;
  switch (forme.type) {
    case "carre": {
      const p = -forme.b / (2 * forme.a);
      if (egal(p, 0)) return `f(x) = ${prefixe(forme.a)}x^2${termeConstant(forme.c)} \\quad (\\text{pas de terme en } x)`;
      const lineaire = `x^2 ${-2 * p > 0 ? "+" : "-"} ${prefixe(Math.abs(2 * p))}x`;
      const avecA = (contenu: string) => (forme.a === 1 ? contenu : `${prefixe(forme.a)}\\left[${contenu}\\right]`);
      const premier = forme.a === 1 ? lineaire : `${prefixe(forme.a)}\\left(${lineaire}\\right)`;
      return `f(x) = ${premier}${termeConstant(forme.c)} = ${avecA(`(${binome(p)})^2 - ${formatCoefficientLatex(p * p)}`)}${termeConstant(forme.c)}`;
    }
    case "inverse": {
      const quotient = forme.a / forme.c;
      const reste = forme.b - (forme.a * forme.d) / forme.c;
      const p = -forme.d / forme.c;
      const denominateur = formatLineaire(forme.c, forme.d);
      const fraction = (numerateur: number, den: string) => `${numerateur < 0 ? "-" : ""}\\frac{${formatCoefficientLatex(Math.abs(numerateur))}}{${den}}`;
      const finale = `${fraction(reste / forme.c, binome(p))}${termeConstant(quotient)}`;
      if (quotient === 0) {
        // Numérateur constant : rien à diviser, seulement le coefficient de x à sortir du dénominateur.
        return forme.c === 1 ? `f(x) = ${finale} \\quad (\\text{déjà de la forme } \\tfrac{a}{x - p})` : `f(x) = ${fraction(reste, denominateur)} = ${finale}`;
      }
      const numerateur = quotient === 1 ? `${denominateur}${termeConstant(reste)}` : `${prefixe(quotient)}\\left(${denominateur}\\right)${termeConstant(reste)}`;
      const separee = `${fraction(reste, denominateur)}${termeConstant(quotient)}`;
      return `f(x) = \\frac{${numerateur}}{${denominateur}} = ${separee}${forme.c === 1 ? "" : ` = ${finale}`}`;
    }
    case "cube": {
      const p = -forme.a / forme.b;
      const puissance = p === 0 ? `${prefixe(forme.b ** 3)}x^3` : `${prefixe(forme.b ** 3)}(${binome(p)})^3`;
      return `(${formatLineaire(forme.b, forme.a)})^3 = \\left(${produitBinome(forme.b, p)}\\right)^3 = ${puissance}`;
    }
    case "racine_carree":
    case "racine_cubique": {
      const p = -forme.b / forme.a;
      const racine = (contenu: string) => (forme.type === "racine_carree" ? `\\sqrt{${contenu}}` : `\\sqrt[3]{${contenu}}`);
      if (p === 0) return `${racine(formatLineaire(forme.a, forme.b))} \\quad (\\text{pas de terme constant : rien à mettre en évidence})`;
      return `${racine(formatLineaire(forme.a, forme.b))} = ${racine(produitBinome(forme.a, p))}`;
    }
    case "valeur_absolue": {
      const p = -forme.b / forme.a;
      return `\\left|${formatLineaire(forme.a, forme.b)}\\right| = \\left|${formatCoefficientLatex(forme.a)}\\right|\\cdot\\left|${binome(p)}\\right| = ${prefixe(Math.abs(forme.a))}\\left|${binome(p)}\\right|`;
    }
  }
}

/** Rapport `n/d` en LaTeX, jamais réduit à un décimal. */
function rapport(n: number, d: number): string {
  return d === 1 ? `${n}` : `\\tfrac{${n}}{${d}}`;
}

/** Les transformations d'UNE décomposition possible (celle de l'exercice tiré), dans l'ordre de la
 * formule unifiée du cours. */
function listeTransformations(exercice: ExerciceFormeCanoniqueFonctionReference): FragmentConsigne[][] {
  const items: FragmentConsigne[][] = [];
  const horizontal = exercice.ch / exercice.eh;
  if (horizontal > 1) items.push([texte("compression horizontale "), latex(`\\tfrac{CH}{EH} = ${rapport(exercice.ch, exercice.eh)}`)]);
  if (horizontal < 1) items.push([texte("étirement horizontal "), latex(`\\tfrac{CH}{EH} = ${rapport(exercice.ch, exercice.eh)}`)]);
  if (exercice.soy) items.push([texte("symétrie d'axe Oy")]);
  if (exercice.th !== 0) items.push([texte("translation horizontale "), latex(`TH = ${exercice.th}`)]);
  const vertical = exercice.ev / exercice.cv;
  if (vertical > 1) items.push([texte("étirement vertical "), latex(`\\tfrac{EV}{CV} = ${rapport(exercice.ev, exercice.cv)}`)]);
  if (vertical < 1) items.push([texte("compression verticale "), latex(`\\tfrac{EV}{CV} = ${rapport(exercice.ev, exercice.cv)}`)]);
  if (exercice.sox) items.push([texte("symétrie d'axe Ox")]);
  if (exercice.tv !== 0) items.push([texte("translation verticale "), latex(`TV = ${exercice.tv}`)]);
  return items;
}

function piege(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  switch (exercice.formeDepart.type) {
    case "carre":
      return "En complétant le carré, le terme soustrait p² est lui aussi multiplié par le coefficient mis en évidence.";
    case "inverse":
      return "Le reste de la division doit encore être divisé par le coefficient de x du dénominateur, pour faire apparaître x − p.";
    case "cube":
      return "Le coefficient mis en évidence dans le cube sort AU CUBE, pas tel quel.";
    case "racine_carree":
    case "racine_cubique":
      return "Le coefficient mis en évidence reste SOUS la racine : on ne le fait pas sortir.";
    case "valeur_absolue":
      return "Le coefficient sort de la valeur absolue en valeur absolue : un coefficient négatif devient positif.";
  }
}

const PIEGE_SIGNE = "Piège du signe : x + 3 = x − (−3), donc le point caractéristique est en x = −3, pas en x = 3.";

function formeCanoniqueLatex(exercice: ExerciceFormeCanoniqueFonctionReference): string {
  return formatCibleLatex(exercice.famille, cibleFinale(exercice));
}

// ---------------------------------------------------------------------------------------------
// Champs de l'adaptateur
// ---------------------------------------------------------------------------------------------

function construireEnonceFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): SectionExercice {
  return {
    enteteFragments: [texte("On considère la fonction "), formule(formatFormeDepartLatex(exercice)), texte(".")],
    questions: [{ consigne: [texte(CONSIGNE_GENERALE)] }],
  };
}

/** Énoncé papier : déjà l'énoncé et la consigne globale (une seule question, sans étape). */
function enoncePapierFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): EnoncePapier {
  return { section: construireEnonceFormeCanoniqueFonctionsReference(exercice), etapesParQuestion: [["a"]] };
}

function construireCorrectionFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): BlocCorrection[] {
  const libelleFamille = CATALOGUE_VARIANTES.find((variante) => variante.id === exercice.famille)?.label ?? exercice.famille;
  return [
    { type: "paragraphe", fragments: [texte(`Fonction de référence reconnue : ${libelleFamille}.`)] },
    { type: "paragraphe", fragments: [texte("Forme canonique : "), formule(formeCanoniqueLatex(exercice))] },
  ];
}

function difficulteFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): 1 | 2 | 3 {
  const forme = exercice.formeDepart;
  if (forme.type === "inverse") return 3;
  if (forme.type === "carre") return forme.a === 1 && Number.isInteger(forme.b / 2) ? 2 : 3;
  return [forme.a, forme.b].every(Number.isInteger) ? 2 : 3;
}

function reponseBreveFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): FragmentConsigne[] {
  return [formule(formeCanoniqueLatex(exercice))];
}

function correctionDetailleeFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): EtapeCorrection[] {
  const transformations = listeTransformations(exercice).flatMap((item, i) => (i === 0 ? item : [texte(", "), ...item]));
  return [
    { label: "Famille", fragments: [texte(`La forme de départ enveloppe x dans la ${NOM_FAMILLE[exercice.famille]} : `), latex(fonctionReferenceLatex(exercice.famille)), texte(".")] },
    { label: "Méthode", fragments: methode(exercice) },
    { label: "Calcul", fragments: [formule(calculIntermediaire(exercice))] },
    { label: "Conclusion", fragments: [formule(formeCanoniqueLatex(exercice))] },
    {
      label: "Transformations",
      fragments: [
        texte("Une décomposition possible à partir de g : "),
        formule(formatGabaritLatex(exercice)),
        ...(transformations.length > 0 ? [texte(" — "), ...transformations, texte(".")] : [texte(".")]),
      ],
    },
    { label: "Piège", fragments: [texte(exercice.th !== 0 && exercice.formeDepart.type !== "carre" && exercice.formeDepart.type !== "inverse" ? `${piege(exercice)} ${PIEGE_SIGNE}` : piege(exercice))] },
  ];
}

function erreursFrequentes(exercice: ExerciceFormeCanoniqueFonctionReference): ErreurFrequente[] {
  const erreurs: ErreurFrequente[] = [{ description: [texte("Signe de p inversé (x + p au lieu de x − p)")], cout: "−1" }];
  switch (exercice.formeDepart.type) {
    case "carre":
      erreurs.push({ description: [texte("Terme −p² non multiplié par le coefficient mis en évidence")], cout: "−1" });
      break;
    case "inverse":
      erreurs.push({ description: [texte("Quotient et reste de la division confondus")], cout: "−2" });
      break;
    case "cube":
      erreurs.push({ description: [texte("Coefficient sorti du cube sans être élevé au cube")], cout: "−1" });
      break;
    case "racine_carree":
    case "racine_cubique":
      erreurs.push({ description: [texte("Coefficient sorti de la racine")], cout: "−1" });
      break;
    case "valeur_absolue":
      erreurs.push({ description: [texte("Coefficient négatif sorti de la valeur absolue avec son signe")], cout: "−1" });
      break;
  }
  return erreurs;
}

function baremeFormeCanoniqueFonctionsReference(exercice: ExerciceFormeCanoniqueFonctionReference): BaremeExercice {
  return {
    reponseFinale: [formule(formeCanoniqueLatex(exercice))],
    criteres: [
      { critere: [texte("Reconnaît la fonction de référence")], points: 0.5 },
      { critere: methode(exercice), points: 1 },
      { critere: [texte("Valeur de p correcte, signe compris (point caractéristique en x = p)")], points: 1 },
      { critere: [texte("Coefficient et terme constant corrects")], points: 1 },
      { critere: [texte("Forme canonique finale correctement écrite")], points: 0.5 },
    ],
    erreursFrequentes: erreursFrequentes(exercice),
    reponsesAcceptees: [[texte("Coefficient écrit sous une autre forme exacte (fraction non réduite, décimal exact)")], [texte("Transformations correctes décrites en plus (non exigées)")]],
  };
}

export const adaptateurEvaluationFormeCanoniqueFonctionsReference: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueFonctionReference> = {
  titreDocument: "Transformer une fonction de référence — forme canonique — Évaluation",
  nomFichierBase: "forme-canonique-fonctions-reference",
  genererInstance: genererExerciceFormeCanoniqueFonctionReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecFamille(id as FamilleReference),
  construireEnonce: construireEnonceFormeCanoniqueFonctionsReference,
  construireCorrection: construireCorrectionFormeCanoniqueFonctionsReference,
  difficulte: difficulteFormeCanoniqueFonctionsReference,
  reponseBreve: reponseBreveFormeCanoniqueFonctionsReference,
  correctionDetaillee: correctionDetailleeFormeCanoniqueFonctionsReference,
  bareme: baremeFormeCanoniqueFonctionsReference,
  enoncePapier: enoncePapierFormeCanoniqueFonctionsReference,
  dureeMinutes: 5,
  regroupable: true,
};
