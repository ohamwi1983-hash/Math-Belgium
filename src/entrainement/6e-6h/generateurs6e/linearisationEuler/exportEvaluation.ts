import { enSinus, puissances } from "../../core6e/linearisationEuler";
import type { ExerciceLinearisation } from "../../core6e/linearisationEuler";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLinearisationEuler";
import type { PhaseLinearisation } from "../../moteur6e/typesLinearisationEuler";
import {
  KLatex,
  appariementLatex,
  borneLatex,
  consigneEcran,
  consigneGenerale,
  denominateurLatex,
  denominateurSimplifie,
  differenceBornesLatex,
  eulerLatex,
  identiteLatex,
  produitConjuguesLatex,
  developpementLatex,
  integraleLatex,
  lineaireLatex,
  lineaireTermesLatex,
  nomLatex,
  primitiveLatex,
  produitLatex,
  regroupementLatex,
  reponseFragments,
  valeurIntegraleLatex,
} from "../../ui6e/formatLinearisationEuler";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLinearisation } from "./index";
import type { IdVarianteLinearisation } from "./index";
import { LIBELLE_CAS_LINEARISATION, profilLinearisation } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLinearisation>` de `6gen93` « Linéariser avec les
 * formules d'Euler » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier, degrés 2 à 4 : « Linéarise f(x) = … grâce aux formules d'Euler » (une seule
 *   demande) ; les quatre écrans (K, binôme, regroupement, forme linéarisée) deviennent les étapes
 *   du corrigé.
 * - Énoncé papier, application : trois VRAIES questions — a) linéariser, b) une primitive,
 *   c) l'intégrale exacte.
 * - Corrigé : une étape par écran (lettres a, b, c…), valeurs tirées des MÊMES fonctions que
 *   l'écran (`ui6e/formatLinearisationEuler.ts`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

const REGROUPEMENT = "e^{ikx}+e^{-ikx}=2\\cos(kx)\\qquad e^{ikx}-e^{-ikx}=2i\\sin(kx)";

// ============================================================================
// Énoncés.
// ============================================================================

function construireEnonce(e: ExerciceLinearisation): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: ExerciceLinearisation): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${"abcd"[i]}) `), ...reponseFragments(e, phase)] }));
}

function reponseBreve(e: ExerciceLinearisation): FragmentConsigne[] {
  if (e.variante === "application") {
    return [t("a) "), f(`f(x)=${lineaireLatex(e)}`), t(" ; b) "), f(`F(x)=${primitiveLatex(e)}`), t(" ; c) "), f(`I=${valeurIntegraleLatex(e)}`), t(".")];
  }
  return [f(`${nomLatex(e)}=${lineaireLatex(e)}`)];
}

function enoncePapier(e: ExerciceLinearisation): EnoncePapier {
  if (e.variante === "application") {
    return {
      section: {
        enteteFragments: [t("On considère la fonction "), f(`f(x)=${nomLatex(e)}`), t(".")],
        questions: [
          { consigne: [t("Linéarise "), f("f(x)"), t(" à l'aide des formules d'Euler.")] },
          { consigne: [t("Déduis-en une primitive "), f("F"), t(" de "), f("f"), t(".")] },
          { consigne: [t("Calcule la valeur exacte de "), f(integraleLatex(e)), t(".")] },
        ],
      },
      etapesParQuestion: [["a"], ["b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return { section: { enteteFragments: consigneGenerale(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesK(e: ExerciceLinearisation, sq: string): EtapeCorrection[] {
  const { p, q } = puissances(e);
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: sq, fragments: [t("Formules d'Euler : "), f(eulerLatex(e.a)), t(".")] },
    {
      label: "Calcul",
      sousQuestion: sq,
      fragments: [f(`${nomLatex(e)}=\\dfrac{${produitLatex(e)}}{${denominateurLatex(e)}}`), t(", donc "), f(`f(x)=K\\,${produitLatex(e)}`), t(" avec "), ...reponseFragments(e, "euler"), t(".")],
    },
  ];
  if (q >= 2) {
    lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Puissance de "), f("2i"), t(" : "), f(`(2i)^{${q}}=2^{${q}}\\,i^{${q}}=${q === 2 ? "-4" : q === 3 ? "-8i" : "16"}`), t(p > 0 ? ", puis on multiplie par les autres facteurs." : ".")] });
  }
  if (q % 2 === 1) {
    lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Pour faire sortir "), f("i"), t(" du dénominateur, on multiplie haut et bas par "), f("i"), t(" : "), f(`\\dfrac{1}{${denominateurSimplifie(e)}}=\\dfrac{i}{${denominateurSimplifie(e)}\\cdot i}=${KLatex(e)}`), t(".")] });
  }
  return lignes;
}

function methodeBinome(e: ExerciceLinearisation, sq: string): EtapeCorrection {
  const { p, q } = puissances(e);
  if (p > 0 && q > 0) {
    return { label: "Méthode", sousQuestion: sq, fragments: [t("Le produit d'une somme par une différence est une identité remarquable : "), f(identiteLatex(e.a)), t(" ; on multiplie ensuite le reste, les exposants s'additionnent.")] };
  }
  return { label: "Méthode", sousQuestion: sq, fragments: [t("Binôme de Newton (coefficients du triangle de Pascal), avec "), f(produitConjuguesLatex(e.a)), t(q > 0 ? " ; le terme soustrait fait alterner les signes." : ".")] };
}

function lignesLinearisation(e: ExerciceLinearisation): EtapeCorrection[] {
  const { q } = puissances(e);
  const sinus = enSinus(e);
  const piege: EtapeCorrection =
    q === 0
      ? { label: "Piège", sousQuestion: "c", fragments: [t("Oublier le facteur 2 en regroupant : "), f("e^{ikx}+e^{-ikx}=2\\cos(kx)"), t(", pas "), f("\\cos(kx)"), t(" ; tous les coefficients seraient divisés par 2.")] }
      : q % 2 === 1
        ? {
            label: "Piège",
            sousQuestion: "a",
            fragments: [
              ...(q === 1 ? [t("Oublier le "), f("i"), t(" du dénominateur "), f("2i")] : [t("Mal calculer "), f("(2i)^{3}=8i^{3}=-8i")]),
              t(" ; rappel : "),
              f("\\dfrac{1}{i}=-i"),
              t(". Une erreur de signe sur une puissance de i change le signe de toute la réponse."),
            ],
          }
        : q === 2
          ? { label: "Piège", sousQuestion: "a", fragments: [t("Croire que "), f("(2i)^{2}=4"), t(" : "), f("(2i)^{2}=4i^{2}=-4"), t(", donc "), f("K"), t(" est négatif.")] }
          : { label: "Piège", sousQuestion: "a", fragments: [t("Se tromper de signe sur "), f("i^{4}"), t(" : "), f("i^{4}=\\left(i^{2}\\right)^{2}=1"), t(", donc "), f("(2i)^{4}=16"), t(" et "), f("K"), t(" est positif.")] };
  return [
    ...lignesK(e, "a"),
    methodeBinome(e, "b"),
    { label: "Calcul", sousQuestion: "b", fragments: reponseFragments(e, "developper") },
    { label: "Méthode", sousQuestion: "c", fragments: [t("On regroupe les exposants opposés : "), f(REGROUPEMENT), t(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`P=${appariementLatex(e)}=${regroupementLatex(e)}`)] },
    {
      label: "Conclusion",
      sousQuestion: "d",
      fragments: [f(`f(x)=${KLatex(e)}\\left(${regroupementLatex(e)}\\right)=${lineaireTermesLatex(e)}`), ...(sinus ? [t(" (car "), f("i^{2}=-1"), t("), soit ")] : [t(", soit ")]), f(`f(x)=${lineaireLatex(e)}`), t(".")],
    },
    piege,
  ];
}

function lignesApplication(e: ExerciceLinearisation): EtapeCorrection[] {
  const iv = e.intervalle!;
  const sinus = enSinus(e);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("Formules d'Euler : "), f(eulerLatex(e.a)), t(", puis regroupement : "), f(REGROUPEMENT), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`f(x)=${KLatex(e)}\\,${produitLatex(e)}=${KLatex(e)}\\left(${developpementLatex(e)}\\right)`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`f(x)=${KLatex(e)}\\left(${regroupementLatex(e)}\\right)=${lineaireLatex(e)}`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [t("Primitives de référence : "), f("\\cos(kx)\\to\\dfrac{\\sin(kx)}{k}"), t(" et "), f("\\sin(kx)\\to-\\dfrac{\\cos(kx)}{k}"), t(" ; une constante "), f("a"), t(" donne "), f("ax"), t(".")] },
    { label: "Calcul", sousQuestion: "b", fragments: reponseFragments(e, "primitive") },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`I=F\\left(${borneLatex(iv.b)}\\right)-F\\left(${borneLatex(iv.a)}\\right)=${differenceBornesLatex(e)}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [f(`I=${valeurIntegraleLatex(e)}`), t(".")] },
    sinus
      ? { label: "Piège", sousQuestion: "b", fragments: [t("Oublier le signe − : une primitive de "), f("\\sin(kx)"), t(" est "), f("-\\dfrac{\\cos(kx)}{k}"), ...(iv.a.num === 0 ? [t(" ; et en c), "), f("F(0)\\neq 0"), t(" car "), f("\\cos(0)=1"), t(".")] : [t(".")])] }
      : { label: "Piège", sousQuestion: "b", fragments: [t("Oublier de diviser par "), f("k"), t(" : une primitive de "), f("\\cos(kx)"), t(" est "), f("\\dfrac{\\sin(kx)}{k}"), t(", pas "), f("\\sin(kx)"), t(".")] },
  ];
}

function correctionDetaillee(e: ExerciceLinearisation): EtapeCorrection[] {
  return e.variante === "application" ? lignesApplication(e) : lignesLinearisation(e);
}

function difficulte(e: ExerciceLinearisation): 1 | 2 | 3 {
  return e.variante === "degre4" || e.variante === "application" ? 3 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

const ERREUR_I = { description: [t("Puissance de "), f("2i"), t(" ou de "), f("i"), t(" mal calculée (signe de K faux)")], cout: "−1" };
const ERREUR_2 = { description: [t("Facteur 2 oublié en regroupant ("), f("2\\cos(kx)"), t(" ou "), f("2i\\sin(kx)"), t(")")], cout: "−0,5" };
const ACCEPTEES = [[t("Toute écriture équivalente de la forme linéarisée (fractions séparées ou dénominateur commun)")]];

function bareme(e: ExerciceLinearisation): BaremeExercice {
  const r = (phase: PhaseLinearisation) => reponseFragments(e, phase);
  if (e.variante === "application") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Linéarisation par Euler : "), ...r("lineaire")], points: 1.5 },
        { sousQuestion: "b", critere: [t("Primitive : "), f(`F(x)=${primitiveLatex(e)}`)], points: 1 },
        { sousQuestion: "c", critere: [t("Intégrale exacte : "), f(`I=${valeurIntegraleLatex(e)}`)], points: 1.5 },
      ],
      erreursFrequentes: [
        ERREUR_I,
        ERREUR_2,
        { description: [t("Primitive sans le facteur "), f("\\tfrac{1}{k}"), t(" ou sans le signe − devant "), f("\\cos(kx)")], cout: "−0,5" },
        { description: [t("Valeur approchée au lieu de la valeur exacte")], cout: "−0,5" },
      ],
      reponsesAcceptees: [...ACCEPTEES, [t("Primitive à une constante près")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Formules d'Euler et facteur : "), ...r("euler")], points: 1 },
      { sousQuestion: "b", critere: [t("Développement par le binôme : "), ...r("developper")], points: 1 },
      { sousQuestion: "c", critere: [t("Regroupement : "), ...r("regrouper")], points: 1 },
      { sousQuestion: "d", critere: [t("Forme linéarisée : "), ...r("lineaire")], points: 1 },
    ],
    erreursFrequentes: [ERREUR_I, ERREUR_2, { description: [t("Signe oublié dans le développement d'une différence")], cout: "−0,5" }],
    reponsesAcceptees: ACCEPTEES,
  };
}

export const adaptateurEvaluationLinearisationEuler: AdaptateurFeuilleExercices<ExerciceLinearisation> = {
  titreDocument: "Linéariser avec les formules d'Euler — Évaluation",
  nomFichierBase: "linearisation-euler",
  genererInstance: genererExerciceLinearisation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLinearisation),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLinearisation,
  libelleCasParticulier: LIBELLE_CAS_LINEARISATION,
};
