import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceDeriveeReciproque } from "../../core6e/deriveeReciproquePoint.types";
import { applicable, modele, y0L } from "../../moteur6e/modeleDeriveeReciproquePoint";
import { consigne, consigneGenerale, questionPapier, reponse } from "../../ui6e/formatDeriveeReciproquePoint";
import type { PhaseReciproque } from "../../ui6e/formatDeriveeReciproquePoint";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceReciproque } from "./index";
import { correctionDetailleeReciproque } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de `6gen155` « Dérivée d'une réciproque en un
 * point ». Énoncé papier = f, I, y₀ et une seule question « Calcule (f⁻¹)′(y₀), ou justifie que ce
 * nombre n'existe pas » ; les quatre écrans (x₀, f′(x₀), théorème, résultat) deviennent les étapes
 * a–d du corrigé — l'étape d existe aussi quand f′(x₀) = 0 (conclusion « n'existe pas ») : même
 * structure, niveau et durée constants quel que soit le verdict (tiré 50/50 dans chaque famille,
 * jamais un cas particulier). Tout est exact (e, π, fractions).
 */

type E = ExerciceDeriveeReciproque;
const t = texte;
const f = latex;
const fr = (x: unknown): FragmentConsigne[] => x as FragmentConsigne[];
const PHASES: PhaseReciproque[] = ["x0", "derivee", "theoreme", "resultat"];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const p = modele(e).point;
  const y = y0L(e);
  if (applicable(e)) return [f(`f^{-1}(${y})=${p.x0L}`), t(", "), f(`f'(${p.x0L})=${p.fpL}`), t(", donc "), f(`(f^{-1})'(${y})=${p.invL}`)];
  return [f(`f^{-1}(${y})=${p.x0L}`), t(" et "), f(`f'(${p.x0L})=0`), t(" : "), f(`(f^{-1})'(${y})`), t(" n'existe pas (tangente verticale).")];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: fr(consigneGenerale(e)), questions: [{ consigne: fr(questionPapier(e)) }] },
    etapesParQuestion: [["a", "b", "c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Le théorème est à choisir (méthode 1) ; le verdict f′(x₀) = 0 est la réponse de l'écran 3 :
  // piège 0 constant ; valeurs exactes.
  return { ...etapesDuCorrige(correctionDetailleeReciproque(e), []), methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const oui = applicable(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Valeur évidente trouvée et vérifiée : "), ...fr(reponse(e, "x0"))], points: 1 },
      { sousQuestion: "b", critere: [t("Dérivée calculée en "), f("x_0"), t(" : "), ...fr(reponse(e, "derivee"))], points: 1 },
      { sousQuestion: "c", critere: [t("Hypothèse "), f("f'(x_0)\\neq 0"), t(" contrôlée")], points: 0.5 },
      { sousQuestion: "d", critere: oui ? [t("Théorème appliqué : "), ...fr(reponse(e, "resultat"))] : [t("Conclusion : le nombre dérivé n'existe pas (tangente verticale)")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [t("Calcul de "), f("f(y_0)"), t(" au lieu de "), f("f^{-1}(y_0)")], cout: "0 pt sur les étapes 1, 2 et 4" },
      { description: [f("f'"), t(" évaluée en "), f("y_0"), t(" au lieu de "), f("x_0")], cout: "moitié des points de la dérivée" },
      { description: [t("Résultat "), f("f'(x_0)"), t(" (inverse oublié) ou "), f("-\\dfrac{1}{f'(x_0)}")], cout: "0 pt sur la conclusion" },
    ],
    reponsesAcceptees: [[t("Toute écriture exacte équivalente ("), f("\\dfrac{e}{e-1}=\\dfrac{1}{1-\\frac{1}{e}}"), t(")")]],
  };
}

/** Même famille dans toutes les séries ; le verdict de l'écran 3 reste tiré au hasard. */
export function profilReciproque(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationReciproque: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Dérivée d'une réciproque en un point — Évaluation",
  nomFichierBase: "derivee-reciproque-point",
  genererInstance: genererExerciceReciproque,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeReciproque,
  bareme,
  enoncePapier,
  profilInstance: profilReciproque,
};
