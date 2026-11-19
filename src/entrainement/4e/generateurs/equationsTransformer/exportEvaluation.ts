import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
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
  chaineCarreLatex,
  consigneEcran,
  enonceLatex,
  ensembleLatex,
  fonctionLatex,
  precisionTexte,
  referenceAffichee,
} from "../../ui/formatEquationsTransformer";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceEquationsTransformer } from "./index";
import { LIBELLE_CAS_EQUATIONS_TRANSFORMER, profilEquationsTransformer } from "./profil";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeEquationsTransformer } from "./corrigeDetaille";

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

function construireCorrection(e: ExerciceEquationsTransformer): BlocCorrection[] {
  return correctionDetailleeEquationsTransformer(e)
    .filter((l) => l.type === "resultat")
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

/** Niveau (grille commune) : aucun écran de lecture ; méthode imposée pour la forme affine (isoler),
 * à choisir pour un carré (± racine) ou un produit (produit nul) ; piège dans les données : aucune
 * solution (|k| > 1, carré négatif), valeur sur un axe (solution unique ou sur les axes) ou k
 * négatif (quadrants à changer). Ne comptent pas : la racine négative d'un carré (toujours là : c'est
 * la méthode) et le facteur nu f(α) = 0 d'un produit (toujours sur un axe). Nombres : calculatrice
 * (profil) détectée par le module. */
function criteresDifficulte(e: ExerciceEquationsTransformer): CriteresDifficulte {
  const f = e.forme;
  const piege =
    f.type === "carre"
      ? e.bases.length === 0 || e.bases.some((b) => estSurAxe(b.fonction, b.k))
      : (f.type === "produit" ? [e.bases[f.nuEnPremier ? 1 : 0]!] : e.bases).some((b) => b.reference === null || estSurAxe(b.fonction, b.k) || b.k.signe === -1);
  return {
    ...etapesDuCorrige(correctionDetailleeEquationsTransformer(e)),
    methode: e.forme.type === "affine" ? 0 : 1,
    piege: piege ? 1 : 0,
  };
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
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEquationsTransformer,
  bareme,
  enoncePapier,
};
