import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceDomaineParImage } from "../../core5e/domaineParImage";
import { ensembleL } from "../../moteur5e/ensembleSaisi";
import { consigne, consigneGenerale, fL, gL, PHASES, reponse } from "../../ui5e/formatDomaineParImage";
import type { PhaseDomaineParImage } from "../../ui5e/formatDomaineParImage";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDomaineParImage } from "./index";
import type { IdVarianteDomaineParImage } from "./index";
import { correctionDetailleeDomaineParImage } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen62` « Domaine d'une composée par l'image ». Énoncé papier = f, g et la
 * consigne globale (domaine de f∘g en passant par l'image de g) ; les étapes Im g, dom f,
 * Im g ∩ dom f, dom(f∘g) passent dans le corrigé « comme au tableau » (partagé avec l'appli).
 */

type E = ExerciceDomaineParImage;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [f(`\\operatorname{dom}(f\\circ g)=${ensembleL(e.domaine)}`)];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: [t("Soit "), f(fL(e)), t(" et "), f(gL(e)), t(". Détermine le domaine de "), f("f\\circ g"), t(" en passant par l'image de g : commence par "), f("\\operatorname{Im} g"), t(" et "), f("\\operatorname{dom} f"), t(".")], questions: [] },
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

/** Piège dans les DONNÉES : une valeur exclue (dénominateur, racine au dénominateur, 0 hors de
 * dom g). Méthode imposée (image puis domaine). */
function criteresDifficulte(e: E): CriteresDifficulte {
  const exclue = e.f.famille === "inverse" || e.f.famille.startsWith("inverseRacine") || e.g.famille === "inverse";
  return { ...etapesDuCorrige(correctionDetailleeDomaineParImage(e)), methode: 0, piege: exclue ? 1 : 0, nombres: 0 };
}

const POINTS: Record<PhaseDomaineParImage, number> = { image: 1, domaine: 0.75, valeurs: 1, composee: 1.25 };
const LIBELLES: Record<PhaseDomaineParImage, string> = {
  image: "Image de g justifiée",
  domaine: "Domaine de f (crochets)",
  valeurs: "Intersection Im g ∩ dom f",
  composee: "Condition g(x) ∈ dom f résolue en x",
};

function bareme(e: E): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: PHASES.map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t(`${LIBELLES[p]} : `), ...reponse(e, p)], points: POINTS[p] })),
    erreursFrequentes: [
      { description: [t("Image confondue avec le domaine de g")], cout: "0 pt sur l'image, suite notée sans double pénalité" },
      { description: [t("Réunion au lieu de l'intersection")], cout: "0 pt sur l'intersection" },
      { description: [t("Valeurs de g(x) données comme domaine (condition non résolue en x)")], cout: "−1" },
      { description: [t("Crochet faux sur une borne, ou infini fermé")], cout: "−0,25 par erreur" },
    ],
    reponsesAcceptees: [[t("Toute écriture du même ensemble (ℝ∖{a} ou réunion d'intervalles) ; la méthode par la double condition directe, si elle est complète")]],
  };
}

/** Cas particulier : domaine vide (décision de l'utilisateur). `forme` = famille de g (structure
 * reproduite d'une série à l'autre) ; tout est exact. */
export function profilDomaineParImage(e: E): ProfilInstance {
  return { casParticulier: e.cas === "vide" ? "domaine-vide" : null, calcul: "exacte", forme: e.g.famille };
}

export const adaptateurEvaluationDomaineParImage: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Domaine d'une composée par l'image — Évaluation",
  nomFichierBase: "domaine-composee-image",
  genererInstance: genererExerciceDomaineParImage,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteDomaineParImage),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDomaineParImage,
  bareme,
  enoncePapier,
  profilInstance: profilDomaineParImage,
  libelleCasParticulier: "Inclure un cas particulier (domaine vide : l'image de g ne rencontre pas dom f)",
};
