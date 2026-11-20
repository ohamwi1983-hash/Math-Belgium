import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExercicePhiHorsExtremum } from "../../core5e/phiHorsExtremum";
import { consigne, consigneGenerale, formeImposee, PHASES_PHI, reponse, situation } from "../../ui5e/formatPhiHorsExtremum";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePhiHorsExtremum } from "./index";
import type { IdVariantePhi } from "./index";
import { correctionDetailleePhiHorsExtremum } from "./corrigeDetaille";

/**
 * Adaptateur papier de `5gen54` « Choisir φ quand le départ n'est pas un extremum »
 * (`.claude/rules/feuilles-evaluations.md`). Énoncé papier = la situation, la forme du modèle et UNE
 * consigne globale (A, b, ω, φ justifié, puis le premier maximum comme vérification). Les cinq étapes
 * d'apprentissage passent dans le corrigé (« Étape n — … »), une lettre par écran.
 */

type E = ExercicePhiHorsExtremum;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function demande(e: E): FragmentConsigne[] {
  return [
    t(" Détermine "),
    f("A"),
    t(", "),
    f("b"),
    t(", "),
    f("\\omega"),
    t(" et "),
    f("\\varphi"),
    t(" (justifie le choix de "),
    f("\\varphi"),
    t(`), puis vérifie ton modèle en calculant le premier instant `),
    f("t>0"),
    t(` où ${e.contexte.phraseMaxDecl}.${e.mode === "calcul" ? " Arrondis φ et cet instant au centième." : ""}`),
  ];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), questions: PHASES_PHI.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [...reponse(e, "choix").slice(2), t(" ; premier maximum en "), ...reponse(e, "maximum"), t(".")];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: { enteteFragments: [...situation(e), ...formeImposee(e), ...demande(e)], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES_PHI.map((p, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Méthode 1 : modèle de forme imposée, paramètres tirés du contexte ; piège dans les données :
  // un des deux candidats est à rejeter (sens de variation).
  return { ...etapesDuCorrige(correctionDetailleePhiHorsExtremum(e)), methode: 1, piege: 1, nombres: e.mode === "calcul" ? 1 : 0 };
}

function bareme(e: E): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    { description: [t("Amplitude prise égale à "), f("\\max-\\min"), t(" ou pulsation "), f("\\dfrac{T}{2\\pi}")], cout: "−0,5 par paramètre, suite notée sans double pénalité" },
    { description: [t("Second candidat "), f("-\\arcsin m"), t(" au lieu de "), f("\\pi-\\arcsin m")], cout: "0 pt sur les candidats" },
    { description: [t("Les deux candidats déclarés équivalents, ou choix sans justification par le sens de variation")], cout: "0 pt sur le choix" },
    { description: [t("Instant du maximum négatif (période non ajoutée)")], cout: "−0,5" },
  ];
  const acceptees: FragmentConsigne[][] = [[t("Toute valeur de "), f("\\varphi"), t(" égale à 2π près (par exemple "), f("\\varphi+2\\pi"), t(")")], [t("Justification du choix par un croquis du cercle ou de la courbe, ou par la valeur à un instant proche")]];
  if (e.mode === "calcul") acceptees.push([t("Écart d'une unité sur le dernier chiffre dû aux arrondis intermédiaires")]);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Amplitude, décalage vertical et pulsation : "), ...reponse(e, "parametres")], points: 1 },
      { sousQuestion: "b", critere: [t("Condition initiale, sinus isolé : "), ...reponse(e, "sinus")], points: 0.5 },
      { sousQuestion: "c", critere: [t("Les deux candidats de ]−π ; π] : "), ...reponse(e, "candidats")], points: 1 },
      { sousQuestion: "d", critere: [t("Choix justifié par le sens de variation (signe de cos φ) : "), ...reponse(e, "choix")], points: 0.75 },
      { sousQuestion: "e", critere: [t("Premier maximum : "), ...reponse(e, "maximum")], points: 0.75 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

/** Profil de tirage équilibré : aucun cas particulier (le sens au départ est le verdict du choix
 * fermé, tiré 50/50) ; `calcul` = mode (sin φ remarquable ou touche sin⁻¹). */
export function profilPhiHorsExtremum(e: E): ProfilInstance {
  return { casParticulier: null, calcul: e.mode === "exact" ? "exacte" : "calculatrice" };
}

export const adaptateurEvaluationPhiHorsExtremum: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Choisir φ quand le départ n'est pas un extremum — Évaluation",
  nomFichierBase: "phi-hors-extremum",
  genererInstance: genererExercicePhiHorsExtremum,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVariantePhi),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleePhiHorsExtremum,
  bareme,
  enoncePapier,
  profilInstance: profilPhiHorsExtremum,
};
