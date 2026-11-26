import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceRang } from "./index";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRang } from "./index";
import type { IdVarianteRang } from "./index";
import { consigne, phasesRang, reponse, situation } from "./ui/formatRang";
import { correctionDetailleeRang } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen22` « Rang à partir duquel |uₙ − ℓ| < ε ». Énoncé papier = la suite, ε et
 * UNE consigne (limite, puis plus petit rang m) ; les écrans (écart, inéquation ou table) passent dans
 * le corrigé. Fibonacci : deux VRAIES questions (v_{n₀} en fraction ; Φ et le rang m).
 * Regroupement a), b), c) : `REGROUPEMENTS["56gen22"]` (rationnelle et géométrique).
 */

type E = ExerciceRang;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: situation(e), questions: phasesRang(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "fibonacci") return [t("a) "), ...reponse(e, "terme"), t(" ; b) "), ...reponse(e, "limite"), t(" ; "), ...reponse(e, "rang")];
  return [...reponse(e, "limite"), t(" ; "), ...reponse(e, "rang")];
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "fibonacci") {
    return {
      section: {
        enteteFragments: situation(e),
        questions: [
          { consigne: consigne(e, "terme") },
          { consigne: [t("Donne la valeur exacte de "), f("\\Phi"), t(", puis détermine le plus petit rang "), f("m"), t(" tel que, pour tout "), f("n>m"), t(", "), f("|v_n-\\Phi|<\\varepsilon"), t(".")] },
        ],
      },
      etapesParQuestion: [["a"], ["b", "c", "d"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: situation(e),
      questions: [{ consigne: [t("Détermine la limite "), f("\\ell"), t(" de cette suite, puis le plus petit rang "), f("m"), t(" tel que, pour tout "), f("n>m"), t(", "), f("|u_n-\\ell|<\\varepsilon"), t(".")] }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phasesRang(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode : inéquation ou table, l'énoncé papier ne le dit pas → 1. Écran d (m = rang juste avant le
  // premier qui convient) : lecture. Aucun piège dans les données (le signe de uₙ − ℓ ne change pas la
  // démarche). Nombres : table de la calculatrice (géométrique, Fibonacci) → 1 ; fractions exactes → 0.
  return { ...etapesDuCorrige(correctionDetailleeRang(e), ["d"]), methode: 1, piege: 0, nombres: e.variante === "rationnelle" ? 0 : 1 };
}

function bareme(e: E): BaremeExercice {
  const crit =
    e.variante === "rationnelle"
      ? [
          { sousQuestion: "a", critere: [t("Limite : "), ...reponse(e, "limite")], points: 0.75 },
          { sousQuestion: "b", critere: [t("Écart sans valeur absolue : "), ...reponse(e, "ecart")], points: 1 },
          { sousQuestion: "c", critere: [t("Inéquation résolue (passage aux inverses) : "), ...reponse(e, "inequation")], points: 1.5 },
          { sousQuestion: "d", critere: [t("Plus petit rang : "), ...reponse(e, "rang")], points: 0.75 },
        ]
      : e.variante === "geometrique"
        ? [
            { sousQuestion: "a", critere: [t("Limite : "), ...reponse(e, "limite")], points: 0.75 },
            { sousQuestion: "b", critere: [t("Écart sans valeur absolue : "), ...reponse(e, "ecart")], points: 1 },
            { sousQuestion: "c", critere: [t("Table : écarts qui encadrent le seuil, premier rang : "), ...reponse(e, "premier")], points: 1.5 },
            { sousQuestion: "d", critere: [t("Plus petit rang : "), ...reponse(e, "rang")], points: 0.75 },
          ]
        : [
            { sousQuestion: "a", critere: [t("Rapport en fraction : "), ...reponse(e, "terme")], points: 0.75 },
            { sousQuestion: "b", critere: [t("Valeur exacte de Φ : "), ...reponse(e, "limite")], points: 1 },
            { sousQuestion: "c", critere: [t("Table : écarts qui encadrent le seuil, premier rang : "), ...reponse(e, "premier")], points: 1.5 },
            { sousQuestion: "d", critere: [t("Plus petit rang : "), ...reponse(e, "rang")], points: 0.75 },
          ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: crit,
    erreursFrequentes: [
      { description: [t("Signe gardé dans la valeur absolue")], cout: "−0,5, suite notée sans double pénalité" },
      { description: [t("Premier rang qui convient donné à la place de m (« n > m »)")], cout: "0 pt sur le rang m" },
      ...(e.variante === "rationnelle" ? [{ description: [t("Sens de l'inégalité gardé en passant aux inverses")], cout: "0 pt sur l'inéquation" }] : []),
    ],
    reponsesAcceptees: [[t("Toute écriture équivalente de l'écart")], [t("Borne B écrite en fraction ou en décimal arrondi au centième")]],
  };
}

export function profilRang(e: E): ProfilInstance {
  // Table de la calculatrice indispensable pour les formes géométrique et Fibonacci ; l'inéquation de la
  // forme rationnelle est évaluée (pas de `calcul`).
  return { casParticulier: null, forme: e.variante === "geometrique" ? `geometrique|${e.forme}` : e.variante, ...(e.variante === "rationnelle" ? {} : { calcul: "calculatrice" as const }) };
}

export const adaptateurEvaluationRang: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Rang à partir duquel |uₙ − ℓ| < ε — Évaluation",
  nomFichierBase: "rang-epsilon",
  genererInstance: genererExerciceRang,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteRang),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRang,
  bareme,
  enoncePapier,
  profilInstance: profilRang,
  calculatriceIndispensable: ["geometrique", "fibonacci"],
};
