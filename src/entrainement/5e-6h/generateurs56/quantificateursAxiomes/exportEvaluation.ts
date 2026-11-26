import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import { axiome } from "./core/banque";
import type { ExerciceQuantif } from "./core/types";
import { calculL, consigne, consigneGenerale, phases, reponse } from "./ui/format";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceQuantif } from "./index";
import type { IdVarianteQuantif } from "./index";
import { correctionDetailleeQuantif } from "./corrigeDetaille";

/**
 * Adaptateur papier de `56gen17`. quantifies : « Dis si chacun des énoncés a) et b) est vrai ou faux,
 * et justifie. Écris la négation de l'énoncé c). » (trois VRAIES questions, sans les options de
 * l'écran) ; axiomes : le calcul numéroté et « Quel axiome… justifie chacune des étapes (1), (2), (3) ? ».
 */

type E = ExerciceQuantif;
const t = texte;
const f = latex;
const LETTRES = "abc";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.variante === "quantifies") return [t(`a) ${e.enonces[0].vrai ? "vrai" : "faux"} · b) ${e.enonces[1].vrai ? "vrai" : "faux"} · c) `), ...reponse(e, "negation")];
  return e.etapes.flatMap((et, i) => [t(`${i > 0 ? " · " : ""}(${i + 1}) ${axiome(et.axiome).nom}`)]);
}

function enoncePapier(e: E): EnoncePapier {
  if (e.variante === "quantifies")
    return {
      section: {
        enteteFragments: [t("Dis si chacun des énoncés a) et b) est vrai ou faux, et justifie. Écris ensuite la négation de l'énoncé c).")],
        questions: [{ consigne: [f(e.enonces[0].latex)] }, { consigne: [f(e.enonces[1].latex)] }, { consigne: [f(e.aNier)] }],
      },
      etapesParQuestion: [["a"], ["b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  const hyp: FragmentConsigne[] = e.hypotheses ? [t("Soit x et y des réels tels que "), f(e.hypotheses), t(". ")] : [t("Soit x, y et z des réels. ")];
  return {
    section: { enteteFragments: [...hyp, t("Quel axiome (ou quelle définition) des nombres réels justifie chacune des étapes (1), (2) et (3) du calcul suivant ? "), f(calculL(e))], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Trois étapes ; quantifies : méthode 1 (trouver un témoin ou un contre-exemple), axiomes : 0 ; aucune
 * donnée piège ; constants quels que soient les verdicts (`sansCharge`). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeQuantif(e)), methode: e.variante === "quantifies" ? 1 : 0, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  const crit =
    e.variante === "quantifies"
      ? [
          { sousQuestion: "a", critere: [t("Verdict justifié (témoin ou contre-exemple) : "), ...reponse(e, "enonce1")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Verdict justifié (témoin ou contre-exemple) : "), ...reponse(e, "enonce2")], points: 1.5 },
          { sousQuestion: "c", critere: [t("Négation : "), ...reponse(e, "negation")], points: 1 },
        ]
      : e.etapes.map((_et, i) => ({ sousQuestion: LETTRES[i], critere: [t(`Étape (${i + 1}) : `), ...reponse(e, (["etape1", "etape2", "etape3"] as const)[i])], points: i === 2 ? 1.5 : 1.25 }));
  return {
    reponseFinale: reponseBreve(e),
    criteres: crit,
    erreursFrequentes:
      e.variante === "quantifies"
        ? [
            { description: [t("Verdict sans justification")], cout: "−1 par énoncé" },
            { description: [t("Négation qui garde un quantificateur, ou qui inverse leur ordre")], cout: "0 pt sur c)" },
          ]
        : [
            { description: [t("Associativité et commutativité confondues")], cout: "0 pt sur l'étape" },
            { description: [t("Neutre et symétrique confondus")], cout: "0 pt sur l'étape" },
          ],
    reponsesAcceptees: [[t(e.variante === "quantifies" ? "Tout témoin ou contre-exemple correct" : "Le nom de l'axiome ou son énoncé")]],
  };
}

/** `forme` = variante ; jamais les verdicts. Pas de `calcul` (aucune calculatrice ne répond). */
export function profilQuantif(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const adaptateurEvaluationQuantif: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Énoncés quantifiés et axiomes — Évaluation",
  nomFichierBase: "enonces-quantifies-axiomes",
  genererInstance: genererExerciceQuantif,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteQuantif),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeQuantif,
  bareme,
  enoncePapier,
  profilInstance: profilQuantif,
};
