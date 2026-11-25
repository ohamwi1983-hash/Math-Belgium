import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/corrigeTableau";
import type { ExercicePL } from "../../core6e/poissonInverse";
import { phases } from "../../core6e/poissonInverse";
import { consigne, question, reponse, situation } from "../../ui6e/formatPoissonInverse";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePL } from "./index";
import { correctionDetailleePL } from "./corrigeDetaille";

/**
 * Adaptateur papier de `6gen121` « Poisson : λ inconnu, valeur la plus probable, seuil d'alerte ».
 * Énoncé papier = situation + question (les demandes successives sont celles d'un même problème, dans
 * une seule consigne) ; les écrans deviennent les étapes du corrigé. `calculatriceIndispensable` : e^(−λ),
 * ln et les cumuls de Poisson (comme 6gen53) ; aucun `calcul` au profil (λ à retrouver et à ajuster,
 * seuil à raisonner : tiré en « autorisée »). « mode » : deux valeurs les plus probables quand λ est
 * entier — un verdict, tiré dans chaque série, jamais dans `forme` (= variante) ni dans le niveau
 * (critères identiques). Aucun cas particulier. Regroupement écarté : situation propre à l'instance.
 */

type E = ExercicePL;
const t = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr([...situation(e), { type: "texte", valeur: " " }, ...question(e)]), questions: phases(e).map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  const ph = phases(e);
  const out: FragmentConsigne[] = [];
  ph.forEach((p, i) => {
    if (i > 0) out.push(t(" ; "));
    out.push(...fr(reponse(e, p)));
  });
  return out;
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: fr(situation(e)), questions: [{ consigne: fr(question(e)) }] }, etapesParQuestion: [phases(e).map((_p, i) => "abc"[i]!)], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function criteresDifficulte(e: E): CriteresDifficulte {
  const n = phases(e).length;
  return { etapesTransformation: n, etapesLecture: 0, methode: 1, piege: e.variante === "lambdaZero" || e.variante === "seuil" ? 1 : 0, nombres: 1, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const ph = phases(e);
  const poids = ph.length === 2 ? [2, 2] : [1.5, 1, 1.5];
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: "abc"[i]!, critere: [t(`${["Paramètre", "Étape", "Résultat"][Math.min(i, 2)]} : `), ...fr(reponse(e, p))], points: poids[i]! })),
    erreursFrequentes: [
      ...(e.variante === "lambdaZero" || e.variante === "seuil" ? [{ description: [t("λ non ajusté à l'échelle de la question")], cout: "0 pt sur l'étape d'ajustement, moitié des points de la probabilité" }] : []),
      ...(e.variante === "mode" ? [{ description: [t("Une seule valeur la plus probable donnée alors que λ est entier (deux valeurs)")], cout: "moitié des points de l'étape 1" }] : []),
      ...(e.variante === "seuil" ? [{ description: [t("Seuil décalé d'une unité (P(X ≥ k) confondu avec 1 − P(X ≤ k))")], cout: "moitié des points de l'étape 2" }] : []),
      ...(e.variante === "egalite" ? [{ description: [t("σ(X) = λ au lieu de √λ")], cout: "moitié des points de l'étape 2" }] : []),
    ],
    reponsesAcceptees: [[t("Valeurs de la loi de Poisson de la calculatrice, arrondies au dix-millième ; λ écrit −ln(…) ou arrondi au centième")]],
  };
}

export function profilPL(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationPL: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Poisson : λ inconnu, valeur la plus probable, seuil d'alerte — Évaluation",
  nomFichierBase: "poisson-lambda-seuil",
  genererInstance: genererExercicePL,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePL,
  bareme,
  enoncePapier,
  profilInstance: profilPL,
  calculatriceIndispensable: true,
};
