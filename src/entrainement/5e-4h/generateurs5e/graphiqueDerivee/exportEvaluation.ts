import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceGraphiqueDerivee } from "../../core5e/graphiqueDerivee";
import { consigne, consigneGenerale, figureEnonce, PHASES, reponse } from "../../ui5e/formatGraphiqueDerivee";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGraphiqueDerivee } from "./index";
import { correctionDetailleeGraphiqueDerivee } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen74` « Du graphique de f′ aux variations de f ». Énoncé papier = la
 * consigne (graphique de f′, pas de f) + la figure, puis deux VRAIES questions : a) variations de f
 * et nature de ses extremums [a, b] ; b) concavité et points d'inflexion [c, d]. Pas de regroupement
 * a), b), c) (deux vraies questions par énoncé).
 */

type E = ExerciceGraphiqueDerivee;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: fr(consigneGenerale(e)), enteteHtml: figureEnonce(e), questions: PHASES.map((p) => ({ consigne: fr(consigne(e, p)) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...fr(reponse(e, "signe")), t(" ; "), ...fr(reponse(e, "extremums")), t(" ; b) "), ...fr(reponse(e, "concavite")), t(" ; "), ...fr(reponse(e, "inflexion"))];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: {
      enteteFragments: fr(consigneGenerale(e)),
      enteteHtml: figureEnonce(e),
      questions: [
        { consigne: [t("Dresse le tableau de signes de "), f("f'"), t(", puis déduis-en les variations de f et la nature de ses extremums locaux.")] },
        { consigne: [t("Détermine les intervalles où f est convexe ou concave, et les abscisses de ses points d'inflexion. Justifie.")] },
      ],
    },
    etapesParQuestion: [["a", "b"], ["c", "d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

/** Signe de f′ = lecture (a) ; extremums, concavité, inflexions = raisonnements (b, c, d) ; méthode
 * imposée (0) ; piège 1 dans TOUTES les variantes (le graphique donné est celui de f′, pas de f :
 * constant dans le groupe à verdict, il ne trahit jamais un zéro double) ; nombres exacts. */
function criteresDifficulte(_e: E): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 1, methode: 0, piege: 1, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Tableau de signes de f′ : "), ...fr(reponse(e, "signe"))], points: 1 },
      { sousQuestion: "b", critere: [t("Variations et extremums (changement de signe de f′) : "), ...fr(reponse(e, "extremums"))], points: 1 },
      { sousQuestion: "c", critere: [t("Concavité (variations de f′) : "), ...fr(reponse(e, "concavite"))], points: 1 },
      { sousQuestion: "d", critere: [t("Points d'inflexion (extremums de f′) : "), ...fr(reponse(e, "inflexion"))], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Graphique de f′ lu comme celui de f (maximum de f′ pris pour un maximum de f)")], cout: "0 pt sur les étapes 2 et 3" },
      { description: [t("Zéro de f′ sans changement de signe compté comme un extremum")], cout: "moitié des points de l'étape 2" },
      { description: [t("Zéros de f′ donnés comme points d'inflexion")], cout: "0 pt sur l'étape 4" },
    ],
    reponsesAcceptees: [[t("Intervalles de concavité ouverts ou fermés aux bornes finies ; tableau de variations de f à la place des phrases")]],
  };
}

/** `forme` constante (« lecture-fp ») : le nombre de zéros / d'extremums est le VERDICT des trois
 * paraboles (groupe à verdict) ; la cubique a sa propre forme (deux points d'inflexion). Tout est
 * exact (pas de `calcul`), aucun cas particulier. */
export function profilGraphiqueDerivee(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante === "cubique" ? "cubique" : "parabole" };
}

export const adaptateurEvaluationGraphiqueDerivee: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Du graphique de f′ aux variations de f — Évaluation",
  nomFichierBase: "graphique-derivee-variations",
  genererInstance: genererExerciceGraphiqueDerivee,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeGraphiqueDerivee,
  bareme,
  enoncePapier,
  profilInstance: profilGraphiqueDerivee,
  groupesVerdict: [{ id: "groupe_zeros_parabole", label: "Parabole : f′ s'annule 2 fois, 1 fois (palier) ou jamais (tiré au hasard)", variantes: ["deuxZeros", "zeroDouble", "sansZero"] }],
};
