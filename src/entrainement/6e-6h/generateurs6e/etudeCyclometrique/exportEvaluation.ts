import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceEtudeCyclo, VarianteEtudeCyclo } from "../../core6e/etudeCyclometrique";
import { PHASES_ETUDE, consigne, fL, reponse } from "../../ui6e/formatEtudeCyclometrique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeCyclo } from "./index";
import { correctionDetailleeEtudeCyclo, figureTableauEtude } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen157` « Étude d'une fonction cyclométrique ». Énoncé papier = la fonction et
 * la consigne globale (étudier puis dresser le tableau de variation) ; les cinq écrans (domaine,
 * dérivée, zéros, variations, valeurs) sont les étapes a–e du corrigé, tableau complet en `figureHtml`.
 * Valeurs exactes : aucune calculatrice.
 */

type E = ExerciceEtudeCyclo;
const t = texte;
const f = latex;

function consigneGlobale(e: E): FragmentConsigne[] {
  const fin =
    e.variante === "arctan-inverse"
      ? "les limites en 0 et en ±∞"
      : e.variante === "arc-racine"
        ? "les extremums et les valeurs aux bornes"
        : e.variante === "x-arctan"
          ? "le minimum et les limites en ±∞"
          : "les extremums locaux et les limites en ±∞";
  return [t("Étudie la fonction "), f(fL(e)), t(` : domaine, dérivée, zéros de la dérivée et variations. Dresse ensuite son tableau de variation, avec ${fin} (valeurs exactes).`)];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGlobale(e), questions: PHASES_ETUDE.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return PHASES_ETUDE.flatMap((p, i) => [...(i > 0 ? [t(" ; ")] : []), ...reponse(e, p)]);
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: consigneGlobale(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [...PHASES_ETUDE.map((p): BlocCorrection => ({ type: "paragraphe", fragments: reponse(e, p) })), { type: "html", html: figureTableauEtude(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Domaine ℝ immédiat (arctan et polynômes) : écran de lecture. Méthode 1 (fonction donnée, plan
  // d'étude du cours). Piège dans les données : domaine fermé (f′ non définie aux bornes, extremum à une
  // borne) ou domaine en deux intervalles (monotone sur chacun, pas sur ℝ₀). Valeurs exactes.
  const lecture = e.variante === "arctan-droite" || e.variante === "x-arctan" ? ["a"] : [];
  return { ...etapesDuCorrige(correctionDetailleeEtudeCyclo(e), lecture), methode: 1, piege: e.variante === "arc-racine" || e.variante === "arctan-inverse" ? 1 : 0, nombres: 0 };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Domaine : "), ...reponse(e, "domaine")], points: 0.5 },
      { sousQuestion: "b", critere: [t("Dérivée (formules du cours, règle de la chaîne"), ...(e.variante === "x-arctan" ? [t(", du produit")] : []), t(") : "), ...reponse(e, "derivee")], points: 1 },
      { sousQuestion: "c", critere: [t("Zéros de "), f("f'"), t(" : "), ...reponse(e, "zeros")], points: 0.5 },
      { sousQuestion: "d", critere: [t("Signe de "), f("f'"), t(" justifié et variations : "), ...reponse(e, "variations")], points: 1 },
      { sousQuestion: "e", critere: [t("Tableau de variation complet, valeurs exactes : "), ...reponse(e, "valeurs")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Règle de la chaîne oubliée dans la dérivée")], cout: "0 pt sur la dérivée, suite notée sans double pénalité" },
      { description: [t("Monotonie affirmée sur une réunion d'intervalles (« décroissante sur "), f("\\mathbb{R}_0"), t(" »)")], cout: "−0,5" },
      { description: [t("Valeurs décimales au lieu des valeurs exactes")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente de la dérivée ; tableau sans la ligne de "), f("f'"), t(" si les signes sont justifiés")]],
  };
}

export function profilEtudeCyclo(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationEtudeCyclo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Étude d'une fonction cyclométrique — Évaluation",
  nomFichierBase: "etude-fonction-cyclometrique",
  genererInstance: genererExerciceEtudeCyclo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteEtudeCyclo),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeEtudeCyclo,
  bareme,
  enoncePapier,
  profilInstance: profilEtudeCyclo,
};
