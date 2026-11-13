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
import type { EcranEquationsTransformer, EquationBase, ExerciceEquationsTransformer } from "../../core/equationsTransformer.types";
import { ecransDe, estSurAxe } from "../../moteur/modeleEquationsTransformer";
import {
  DOMAINE_LATEX,
  angleLatex,
  baseLatex,
  calculSolutionsLatex,
  carreLatex,
  chaineCarreLatex,
  chaineFacteurLatex,
  chaineIsolementLatex,
  consigneEcran,
  enonceLatex,
  ensembleLatex,
  fonctionLatex,
  kAbsLatex,
  kLatex,
  precisionTexte,
  referenceAffichee,
  regleSolutions,
} from "../../ui/formatEquationsTransformer";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationsTransformer } from "./index";
import { LIBELLE_CAS_EQUATIONS_TRANSFORMER, profilEquationsTransformer } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen78 (« Équations trigonométriques à
 * transformer »). Énoncé papier = l'équation, l'intervalle et la consigne globale (« Résous… ») ;
 * les écrans (équations de base, angle de référence et solutions de chaque base, ensemble des
 * solutions) deviennent les étapes a, b, c… du corrigé, dans l'ordre de `ecransDe`. Tous les textes
 * viennent de `ui/formatEquationsTransformer.ts` (mêmes fonctions que l'écran). Séries
 * équilibrées : `profil.ts`.
 */

const LETTRES = "abcdefghij";

function lettreDe(e: ExerciceEquationsTransformer, predicat: (x: EcranEquationsTransformer) => boolean): string {
  return LETTRES[ecransDe(e).findIndex(predicat)] ?? "a";
}

function construireEnonce(e: ExerciceEquationsTransformer): SectionExercice {
  return {
    enteteFragments: [texte("On considère l'équation "), latex(enonceLatex(e)), texte(", avec "), latex(`\\alpha \\in ${DOMAINE_LATEX}`), texte(".")],
    questions: ecransDe(e).map((ecran) => ({ consigne: consigneEcran(e, ecran) })),
  };
}

function enoncePapier(e: ExerciceEquationsTransformer): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte("Résous l'équation "), latex(enonceLatex(e)), texte(" pour "), latex(`\\alpha \\in ${DOMAINE_LATEX}`), texte(`.${precisionTexte(e)}`)],
      questions: [],
    },
  };
}

function lignesBases(e: ExerciceEquationsTransformer): EtapeCorrection[] {
  const f = e.forme;
  if (f.type === "affine") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("On isole "), latex(fonctionLatex(f.membre.fonction)), texte(" : on fait passer le terme constant dans l'autre membre, puis on divise par son coefficient.")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(chaineIsolementLatex(f.membre, e.bases[0]!.k))] },
    ];
  }
  if (f.type === "carre") {
    const nom = fonctionLatex(f.membre.fonction);
    const lignes: EtapeCorrection[] = f.nue ? [] : [{ label: "Calcul", sousQuestion: "a", fragments: [texte("On isole le carré : "), latex(chaineCarreLatex(e))] }];
    if (e.bases.length === 0) {
      lignes.push({ label: "Conclusion", sousQuestion: "a", fragments: [texte("Un carré n'est jamais négatif : "), latex(`${nom.replace("\\alpha", "^2\\alpha")} = ${carreLatex(e)} < 0`), texte(" est impossible. L'équation n'a pas de solution : "), latex("S = \\varnothing"), texte(".")] });
    } else if (e.bases.length === 1) {
      lignes.push({ label: "Conclusion", sousQuestion: "a", fragments: [texte("Un seul nombre a pour carré 0 : "), latex(baseLatex(e.bases[0]!)), texte(".")] });
    } else {
      lignes.push({ label: "Conclusion", sousQuestion: "a", fragments: [texte("Deux nombres opposés ont ce carré : "), latex(`${nom} = \\sqrt{${carreLatex(e)}} = ${kLatex(e.bases[0]!.k)} \\quad\\text{ou}\\quad ${baseLatex(e.bases[1]!)}`), texte(".")] });
    }
    return lignes;
  }
  const iAffine = f.nuEnPremier ? 1 : 0;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Un produit est nul si et seulement si l'un de ses facteurs est nul.")] },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [latex(`${fonctionLatex(f.nu)} = 0`), texte(" ou "), latex(chaineFacteurLatex(f.affine, e.bases[iAffine]!.k))],
    },
  ];
}

function lignesBase(e: ExerciceEquationsTransformer, i: number): EtapeCorrection[] {
  const b = e.bases[i]!;
  const lRef = lettreDe(e, (x) => x.type === "reference" && x.base === i);
  const lignes: EtapeCorrection[] = [];
  if (b.reference === null) {
    lignes.push({
      label: "Conclusion",
      sousQuestion: lRef,
      fragments: [latex(`\\left|${kLatex(b.k)}\\right| > 1`), texte(` et ${b.fonction} α est toujours compris entre −1 et 1 : `), latex(baseLatex(b)), texte(" n'a pas de solution.")],
    });
    return lignes;
  }
  const abs = kAbsLatex(b.k);
  lignes.push(
    b.k.decimal
      ? { label: "Calcul", sousQuestion: lRef, fragments: [texte("À la calculatrice (mode degrés) : "), latex(`\\alpha_0 = ${b.fonction === "sin" ? "\\sin" : b.fonction === "cos" ? "\\cos" : "\\tan"}^{-1}\\left(${abs}\\right) \\approx ${angleLatex(referenceAffichee(b))}`)] }
      : { label: "Calcul", sousQuestion: lRef, fragments: [texte("Valeur remarquable : "), latex(`${b.fonction === "sin" ? "\\sin" : b.fonction === "cos" ? "\\cos" : "\\tan"}\\,${referenceAffichee(b)}^\\circ = ${abs}`), texte(", donc "), latex(`\\alpha_0 = ${angleLatex(referenceAffichee(b))}`), texte(".")] },
  );
  const lSol = lettreDe(e, (x) => x.type === "solutions" && x.base === i);
  lignes.push({ label: "Méthode", sousQuestion: lSol, fragments: regleSolutions(b) });
  lignes.push({ label: "Calcul", sousQuestion: lSol, fragments: [latex(calculSolutionsLatex(b))] });
  if (b.solutions.length === 1) lignes.push({ label: "Conclusion", sousQuestion: lSol, fragments: [texte("Les deux candidats coïncident (sur un axe) : une seule solution.")] });
  return lignes;
}

function piege(e: ExerciceEquationsTransformer): EtapeCorrection {
  const f = e.forme;
  if (f.type === "carre" && e.bases.length === 1) {
    return { label: "Piège", sousQuestion: "a", fragments: [texte("Ici le carré vaut 0 : une seule équation de base, "), latex(baseLatex(e.bases[0]!)), texte(", dont les solutions sont sur un axe.")] };
  }
  if (f.type === "carre") {
    return e.bases.length === 0
      ? { label: "Piège", sousQuestion: "a", fragments: [texte("Inutile de chercher un angle : aucun carré n'est négatif, l'équation n'a pas de solution.")] }
      : { label: "Piège", sousQuestion: "a", fragments: [texte("Ne pas oublier la racine négative : "), latex(`${fonctionLatex(f.membre.fonction).replace("\\alpha", "^2\\alpha")} = k`), texte(" donne "), latex(`${fonctionLatex(f.membre.fonction)} = \\sqrt{k}`), texte(" ou "), latex(`${fonctionLatex(f.membre.fonction)} = -\\sqrt{k}`), texte(" : deux fois plus de solutions.")] };
  }
  if (f.type === "produit") {
    return { label: "Piège", sousQuestion: "a", fragments: [texte("Ne jamais diviser les deux membres par "), latex(fonctionLatex(f.nu)), texte(" : on perdrait les solutions de "), latex(`${fonctionLatex(f.nu)} = 0`), texte(".")] };
  }
  const b = e.bases[0]!;
  if (b.reference === null) return { label: "Piège", sousQuestion: lettreDe(e, (x) => x.type === "reference"), fragments: [texte("Une fois "), latex(fonctionLatex(b.fonction)), texte(" isolé, vérifier que |k| ≤ 1 avant de chercher un angle.")] };
  if (b.k.decimal) return { label: "Piège", sousQuestion: lettreDe(e, (x) => x.type === "solutions"), fragments: [texte(`La touche ${b.fonction}⁻¹ de la calculatrice ne donne qu'un angle : la seconde solution se trouve par symétrie sur le cercle.`)] };
  return { label: "Piège", sousQuestion: "a", fragments: [texte("Isoler complètement "), latex(fonctionLatex(b.fonction)), texte(" (diviser par son coefficient) avant de chercher l'angle : l'angle de référence se lit sur |k|, pas sur le second membre de départ.")] };
}

function correctionDetaillee(e: ExerciceEquationsTransformer): EtapeCorrection[] {
  const lignes = [...lignesBases(e), ...e.bases.flatMap((_, i) => lignesBase(e, i))];
  if (e.bases.length >= 2) {
    lignes.push({ label: "Conclusion", sousQuestion: lettreDe(e, (x) => x.type === "ensemble"), fragments: [texte("On réunit les solutions des équations de base : "), latex(ensembleLatex(e.solutions)), texte(".")] });
  } else if (e.bases.length === 1) {
    lignes.push({ label: "Conclusion", sousQuestion: LETTRES[ecransDe(e).length - 1]!, fragments: [latex(ensembleLatex(e.solutions))] });
  }
  lignes.push(piege(e));
  return lignes;
}

function construireCorrection(e: ExerciceEquationsTransformer): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((l) => l.label === "Calcul" || l.label === "Conclusion")
    .map((l) => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreve(e: ExerciceEquationsTransformer): FragmentConsigne[] {
  return [latex(ensembleLatex(e.solutions))];
}

const arrondiQuart = (x: number) => Math.round(x * 4) / 4;

function bareme(e: ExerciceEquationsTransformer): BaremeExercice {
  const criteres: BaremeExercice["criteres"] = [];
  if (e.bases.length === 0) {
    criteres.push({ sousQuestion: "a", critere: [texte("Carré isolé : "), latex(chaineCarreLatex(e).split(" \\iff ").pop()!)], points: 2 });
    criteres.push({ sousQuestion: "a", critere: [texte("Conclusion justifiée : un carré n'est jamais négatif, pas de solution")], points: 2 });
  } else {
    criteres.push({ sousQuestion: "a", critere: [texte(e.bases.length > 1 ? "Équations de base : " : "Équation de base : "), latex(e.bases.map(baseLatex).join(" \\quad\\text{ou}\\quad "))], points: 1 });
    const ensemble = e.bases.length >= 2 ? 0.5 : 0;
    const part = (3 - ensemble) / e.bases.length;
    e.bases.forEach((b: EquationBase, i) => {
      const lRef = lettreDe(e, (x) => x.type === "reference" && x.base === i);
      if (b.reference === null) {
        criteres.push({ sousQuestion: lRef, critere: [texte("Pas de solution pour "), latex(baseLatex(b)), texte(" : |k| > 1")], points: arrondiQuart(part) });
        return;
      }
      const lSol = lettreDe(e, (x) => x.type === "solutions" && x.base === i);
      criteres.push({ sousQuestion: lRef, critere: [texte("Angle de référence : "), latex(`\\alpha_0 ${b.k.decimal ? "\\approx" : "="} ${angleLatex(referenceAffichee(b))}`)], points: arrondiQuart(part * 0.4) });
      criteres.push({ sousQuestion: lSol, critere: [texte("Solutions de "), latex(baseLatex(b)), texte(" : "), latex(b.solutions.map(angleLatex).join(" \\,;\\, "))], points: arrondiQuart(part * 0.6) });
    });
    if (ensemble) criteres.push({ sousQuestion: lettreDe(e, (x) => x.type === "ensemble"), critere: [texte("Ensemble des solutions : "), latex(ensembleLatex(e.solutions))], points: ensemble });
  }
  const erreurs: ErreurFrequente[] = [];
  if (e.forme.type === "carre" && e.bases.length === 2) erreurs.push({ description: [texte("Racine négative oubliée (une seule équation de base)")], cout: "moitié des points des étapes suivantes" });
  if (e.forme.type === "produit") erreurs.push({ description: [texte("Division par le facteur nu : les solutions de "), latex(`${fonctionLatex(e.forme.nu)} = 0`), texte(" sont perdues")], cout: "−1,5" });
  if (e.bases.some((b) => b.reference === null)) erreurs.push({ description: [texte("Angle cherché alors que |k| > 1 (ou qu'un carré est négatif)")], cout: "0 pt à l'étape concernée" });
  erreurs.push({ description: [texte("Seconde solution oubliée, ou cherchée avec la mauvaise symétrie")], cout: "−0,5 par solution" });
  if (e.calculatrice) erreurs.push({ description: [texte("Calculatrice en mode radians, ou angles mal arrondis")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Solutions justifiées par un cercle trigonométrique dessiné ; valeurs de k écrites en décimal au centième")]],
  };
}

/** ★ pas de solution du tout ; ★★ une équation de base ; ★★★ deux équations de base avec solutions. */
function difficulte(e: ExerciceEquationsTransformer): 1 | 2 | 3 {
  if (e.solutions.length === 0) return 1;
  const avecSolutions = e.bases.filter((b) => b.solutions.length > 0 && !estSurAxe(b.fonction, b.k)).length;
  return avecSolutions >= 2 ? 3 : 2;
}

export const adaptateurEvaluationEquationsTransformer: AdaptateurFeuilleExercices<ExerciceEquationsTransformer> = {
  profilInstance: profilEquationsTransformer,
  libelleCasParticulier: LIBELLE_CAS_EQUATIONS_TRANSFORMER,
  titreDocument: "Équations trigonométriques à transformer — Évaluation",
  nomFichierBase: "equations-trigonometriques-transformer",
  genererInstance: genererExerciceEquationsTransformer,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 5,
};
