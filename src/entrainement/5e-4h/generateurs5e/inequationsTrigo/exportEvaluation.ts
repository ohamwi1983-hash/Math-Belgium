import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceInequationTrigo } from "../../core5e/inequationsTrigo";
import { consigne, consigneGenerale, ensembleL, phases, reponse } from "../../ui5e/formatInequationsTrigo";
import type { PhaseInequation } from "../../ui5e/formatInequationsTrigo";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceInequationTrigo } from "./index";
import type { IdVarianteInequation } from "./index";
import { correctionDetailleeInequationTrigo } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen55` « Inéquations trigonométriques ». Énoncé papier = l'inéquation et la
 * consigne globale (ensemble des solutions dans [0 ; 2π[ sous forme d'intervalles) ; les étapes
 * d'apprentissage (isoler, arc, retour à x, intervalles) passent dans le corrigé, une lettre par
 * écran, avec la figure du cercle sous l'arc.
 */

type E = ExerciceInequationTrigo;
const t = texte;
const f = latex;
const LETTRES = "abcd";

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: phases(e).map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [f(ensembleL(e))];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [...consigneGenerale(e), t(" Donne l'ensemble des solutions sous forme d'intervalles (justifie à l'aide du cercle trigonométrique).")], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phases(e).map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode imposée (inéquation sinusoïdale du cours) ; piège dans les données : coefficient
  // négatif (le sens change). Valeurs exactes.
  return { ...etapesDuCorrige(correctionDetailleeInequationTrigo(e)), methode: 0, piege: e.inversion ? 1 : 0, nombres: 0 };
}

const POINTS: Record<PhaseInequation, number> = { isoler: 0.75, arc: 1, retour: 1, intervalles: 1.25, conclusion: 2 };
const LIBELLES: Record<PhaseInequation, string> = {
  isoler: "Fonction trigonométrique isolée (sens de l'inégalité)",
  arc: "Arc lu sur le cercle",
  retour: "Retour à x, période divisée par a",
  intervalles: "Intervalles de [0 ; 2π[ avec leurs crochets",
  conclusion: "Conclusion justifiée (m hors de [−1 ; 1])",
};

function bareme(e: E): BaremeExercice {
  const ph = phases(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: ph.map((p, i) => ({ sousQuestion: LETTRES[i], critere: [t(`${LIBELLES[p]} : `), ...reponse(e, p)], points: e.cas && p === "isoler" ? 2 : POINTS[p] })),
    erreursFrequentes: e.cas
      ? [{ description: [t("Recherche d'un arc ou d'un arcsin d'une valeur hors de [−1 ; 1]")], cout: "0 pt sur la conclusion" }]
      : [
          ...(e.inversion ? [{ description: [t("Sens de l'inégalité conservé en divisant par un nombre négatif")], cout: "−0,75, suite notée sans double pénalité" }] : []),
          { description: [t("Arc complémentaire")], cout: "0 pt sur l'arc, suite notée sans double pénalité" },
          { description: [t("Période "), f("2\\pi"), t(" non divisée par "), f(`${e.a}`)], cout: "−0,5" },
          { description: [t("Intervalle manquant, crochet faux, ou "), f("2\\pi"), t(" inclus")], cout: "−0,25 par erreur" },
        ],
    reponsesAcceptees: [[t("Toute écriture équivalente des bornes (à 2π près pour l'arc), intervalles dans n'importe quel ordre")], [t("Résolution graphique sur la courbe, si elle est justifiée")]],
  };
}

/** Cas particulier (décision de l'utilisateur) : inéquation toujours vraie / toujours fausse.
 * `forme` = fonction et sens après isolement inversé ou non (structure reproduite d'une série à
 * l'autre) ; toujours des valeurs exactes. */
export function profilInequationTrigo(e: E): ProfilInstance {
  // Pas de `calcul` (revue des profils, 24/11/2026) : la calculatrice ne donne pas la réponse, tiré
  // que la calculatrice soit interdite ou autorisée.
  return { casParticulier: e.cas ? "toujours" : null, forme: `${e.fonction}|${e.inversion ? "inverse" : "direct"}` };
}

export const adaptateurEvaluationInequationTrigo: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Inéquations trigonométriques — Évaluation",
  nomFichierBase: "inequations-trigonometriques",
  genererInstance: genererExerciceInequationTrigo,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteInequation),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeInequationTrigo,
  bareme,
  enoncePapier,
  profilInstance: profilInequationTrigo,
  libelleCasParticulier: "Inclure un cas particulier (inéquation toujours vraie ou sans solution)",
};
