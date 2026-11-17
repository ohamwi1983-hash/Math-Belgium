import type { ExercicePolygones } from "../../core6e/polygonesReguliers.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { anglePasLatex, sommetsAutres } from "../../moteur6e/modelePolygonesReguliers";
import { phasesDe } from "../../moteur6e/typesPolygonesReguliers";
import type { PhasePolygones } from "../../moteur6e/typesPolygonesReguliers";
import {
  calculEtape,
  consigneEcran,
  consigneGenerale,
  controleSommets,
  formatReponseAttenduePhaseLatex,
  l,
  methodeFragments,
  piegeEtape,
  reponseFragments,
  sommeZLatex,
  t,
} from "../../ui6e/formatPolygonesReguliers";
import { figureCorrigeSommetsSvg, figureEnoncePolygonesSvg } from "../../ui6e/figurePolygonesReguliers";
import { LIBELLE_CAS_POLYGONES, profilPolygones } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExercicePolygones } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExercicePolygones>` de `6gen97` « Polygones réguliers et
 * racines n-ièmes » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `construireEnonce` : une question par écran (étapes a à d), titres « Étape n — … » du corrigé ;
 *   les choix fermés de l'écran deviennent des questions ouvertes (« Écris la relation… »,
 *   « Justifie que S = 0 »).
 * - `enoncePapier` : la figure (sans les sommets demandés pour `sommets`) et la consigne globale,
 *   puis les VRAIES questions : `sommets` → une seule (affixes de Z₁, Z₂ (, Z₃)) ; `mesures` →
 *   rayon, côté (démonstration de 2r·sin(π/n) puis valeur), périmètre et aire ; `somme-nulle` →
 *   démontrer S = 0, puis les deux sommes.
 * - Corrigé : par étape, Méthode (aide de l'écran), Calcul, Piège ciblé, Conclusion (réponse de
 *   l'écran) ; pour `sommets`, contrôle géométrique et figure du polygone complet (`figureHtml`).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const LETTRES = ["a", "b", "c", "d"];

function lettre(e: ExercicePolygones, phase: PhasePolygones): string {
  return LETTRES[phasesDe(e).indexOf(phase)];
}

/** Consigne d'une étape, version papier : les choix fermés deviennent des questions ouvertes. */
function consigneEtape(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  if (phase === "formule") return [t("Écris la relation qui donne l'affixe "), l("z_k"), t(" du sommet "), l("Z_k"), t(" en fonction de "), l("a"), t(", "), l("c"), t(" et "), l("k"), t(".")];
  if (phase === "identite") return [t("Exprime "), l("(\\omega-1)\\,S"), t(" à l'aide d'une puissance de "), l("\\omega"), t(".")];
  if (phase === "conclusion") return [t("Justifie que "), l("S=0"), t(".")];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExercicePolygones): SectionExercice {
  return {
    enteteFragments: consigneGenerale(e),
    enteteHtml: figureEnoncePolygonesSvg(e),
    questions: phasesDe(e).map((phase) => ({ consigne: consigneEtape(e, phase) })),
  };
}

function construireCorrection(e: ExercicePolygones): BlocCorrection[] {
  return phasesDe(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseFragments(e, phase)] }));
}

function questionsPapier(e: ExercicePolygones): { consignes: FragmentConsigne[][]; etapes: string[][] } {
  if (e.variante === "sommets") {
    const ks = [1, ...sommetsAutres(e)];
    const noms = ks.map((k) => l(`Z_${k}`));
    const liste: FragmentConsigne[] = noms.length === 2 ? [noms[0], t(" et "), noms[1]] : [noms[0], t(", "), noms[1], t(" et "), noms[2]];
    return { consignes: [[t("Détermine les affixes exactes des sommets "), ...liste, t(" (forme algébrique).")]], etapes: [["a", "b", "c", "d"]] };
  }
  if (e.variante === "mesures") {
    return {
      consignes: [
        [t("Calcule le rayon "), l("r"), t(" du cercle (valeur exacte).")],
        [t("Montre que la longueur d'un côté vaut "), l(`\\ell=|z_1-z_0|=2r\\sin\\frac{\\pi}{${e.n}}`), t(", puis calcule-la (valeur exacte).")],
        [t("Calcule le périmètre et l'aire du polygone (valeurs exactes).")],
      ],
      etapes: [["a"], ["b"], ["c", "d"]],
    };
  }
  return {
    consignes: [
      [t("Démontre que "), l("S=0"), t(".")],
      [t("Calcule la somme "), l(sommeZLatex(e.n, 0)), t(" des affixes des sommets, puis la somme "), l(sommeZLatex(e.n, 1)), t(" des affixes des sommets autres que A.")],
    ],
    etapes: [
      ["a", "b"],
      ["c", "d"],
    ],
  };
}

/** Réponse courte d'une étape (la justification de S = 0 réduite à sa formule). */
function reponseCourte(e: ExercicePolygones, phase: PhasePolygones): FragmentConsigne[] {
  if (phase === "conclusion") return [l(formatReponseAttenduePhaseLatex(e, phase)[0])];
  return reponseFragments(e, phase);
}

function joindre(e: ExercicePolygones, phases: PhasePolygones[]): FragmentConsigne[] {
  return phases.flatMap((phase, i) => [...(i > 0 ? [t(" ; ")] : []), ...reponseCourte(e, phase)]);
}

/** Réponse brève par étape (« a) … ; b) … »). */
function reponseBreve(e: ExercicePolygones): FragmentConsigne[] {
  return phasesDe(e).flatMap((phase, i) => [t(`${i > 0 ? " ; " : ""}${LETTRES[i]}) `), ...reponseCourte(e, phase)]);
}

/** Réponse brève alignée sur les questions papier. */
function reponseBrevePapier(e: ExercicePolygones): FragmentConsigne[] {
  const phases = phasesDe(e);
  if (e.variante === "sommets") return joindre(e, ["sommet1", "autresSommets"]);
  const { etapes } = questionsPapier(e);
  return etapes.flatMap((lettres, i) => [t(`${i > 0 ? " ; " : ""}${LETTRES[i]}) `), ...joindre(e, lettres.map((x) => phases[LETTRES.indexOf(x)]))]);
}

function enoncePapier(e: ExercicePolygones): EnoncePapier {
  const { consignes, etapes } = questionsPapier(e);
  return {
    section: {
      enteteFragments: consigneGenerale(e),
      enteteHtml: figureEnoncePolygonesSvg(e),
      questions: consignes.map((consigne) => ({ consigne })),
    },
    etapesParQuestion: etapes,
    reponseBreve: reponseBrevePapier(e),
  };
}

function correctionDetaillee(e: ExercicePolygones): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  const phases = phasesDe(e);
  phases.forEach((phase, i) => {
    const sousQuestion = LETTRES[i];
    lignes.push({ label: "Méthode", sousQuestion, fragments: methodeFragments(e, phase) });
    calculEtape(e, phase).forEach((c, j) => lignes.push({ label: phase === "cote" && j === 0 ? "Démonstration" : "Calcul", sousQuestion, fragments: [l(c)] }));
    if (phase === "autresSommets" && e.variante === "sommets") {
      const controle = controleSommets(e);
      if (controle) lignes.push({ label: "Contrôle", sousQuestion, fragments: controle });
    }
    lignes.push({ label: "Piège", sousQuestion, fragments: piegeEtape(e, phase) });
    lignes.push({
      label: "Conclusion",
      sousQuestion,
      fragments: reponseFragments(e, phase),
      ...(phase === "autresSommets" && e.variante === "sommets" ? { figureHtml: figureCorrigeSommetsSvg(e) } : {}),
    });
  });
  return lignes;
}

function difficulte(e: ExercicePolygones): 1 | 2 | 3 {
  if (e.variante === "mesures") return 2;
  if (e.variante === "sommets" && e.n === 4) return 2;
  return 3;
}

const POIDS: Record<PhasePolygones, number> = {
  formule: 0.5,
  donnees: 0.5,
  sommet1: 1.5,
  autresSommets: 1.5,
  rayon: 0.5,
  cote: 1.5,
  perimetre: 0.5,
  aire: 1.5,
  identite: 1,
  conclusion: 1,
  somme: 1,
  sansA: 1,
};

const CRITERE: Record<PhasePolygones, string> = {
  formule: "Relation des sommets (rotation de centre C) : ",
  donnees: "Affixe du vecteur CA et angle de la rotation : ",
  sommet1: "Affixe exacte de Z₁ (rotation de a − c, puis translation de c) : ",
  autresSommets: "Affixes exactes des autres sommets demandés : ",
  rayon: "Rayon exact (module de z₀) : ",
  cote: "Démonstration de ℓ = 2r·sin(π/n) (1 pt) et valeur exacte (0,5 pt) : ",
  perimetre: "Périmètre exact : ",
  aire: "Découpage en n triangles (0,5 pt) et aire exacte (1 pt) : ",
  identite: "Égalité de la somme géométrique : ",
  conclusion: "Justification : ωⁿ = 1 et ω ≠ 1 (0,5 pt chacune) : ",
  somme: "Somme des affixes des sommets (n·c, avec S = 0) : ",
  sansA: "Somme des sommets autres que A : ",
};

function bareme(e: ExercicePolygones): BaremeExercice {
  const phases = phasesDe(e);
  const erreurs: Record<ExercicePolygones["variante"], BaremeExercice["erreursFrequentes"]> = {
    sommets: [
      { description: [t("Rotation autour de O au lieu de C, ou translation de "), l("c"), t(" oubliée")], cout: "−1" },
      { description: [t("Angle "), l("2\\pi"), t(" ou "), l("\\frac{\\pi}{n}"), t(" au lieu de "), l(`\\frac{2\\pi}{n}=${anglePasLatex(e.n)}`)], cout: "−0,5" },
      { description: [t("Erreur de signe en développant (oubli de "), l("i^2=-1"), t(")")], cout: "−0,5" },
      { description: [t("Valeurs décimales approchées au lieu de valeurs exactes")], cout: "−0,5" },
    ],
    mesures: [
      { description: [t("Racine carrée oubliée (rayon donné au carré)")], cout: "−0,5" },
      { description: [l("\\sin\\frac{2\\pi}{n}"), t(" au lieu de "), l("\\sin\\frac{\\pi}{n}"), t(", ou facteur 2 oublié dans le côté")], cout: "−0,5" },
      { description: [t("Facteur "), l("\\frac{1}{2}"), t(" oublié dans l'aire des triangles")], cout: "−0,5" },
      { description: [t("Valeurs décimales approchées au lieu de valeurs exactes")], cout: "−0,5" },
    ],
    "somme-nulle": [
      { description: [t("Division par "), l("\\omega-1"), t(" sans justifier "), l("\\omega\\neq1")], cout: "−0,5" },
      { description: [t("Somme des affixes des sommets donnée nulle (oubli des n termes "), l("c"), t(")")], cout: "−1" },
      { description: [t("Retrait de "), l("c"), t(" au lieu de "), l("z_0=a"), t(" pour la somme des autres sommets")], cout: "−0,5" },
    ],
  };
  const acceptees: Record<ExercicePolygones["variante"], FragmentConsigne[][]> = {
    sommets: [[t("Toute écriture exacte équivalente des parties réelle et imaginaire (fractions, radicaux) ; démarche par rotation de centre C ou par symétrie de centre C pour un sommet opposé à A")]],
    mesures: [[t("Toute écriture exacte équivalente ; côté obtenu par le triangle isocèle "), l("OZ_0Z_1"), t(" (Al-Kashi ou hauteur) au lieu du calcul de "), l("|z_1-z_0|")]],
    "somme-nulle": [[t("Justification par symétrie (n pair : racines deux à deux opposées) acceptée seulement si n est pair ; la somme géométrique vaut pour tout n ≥ 2")]],
  };
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase) => ({ sousQuestion: lettre(e, phase), critere: [t(CRITERE[phase]), ...reponseCourte(e, phase)], points: POIDS[phase] })),
    erreursFrequentes: erreurs[e.variante],
    reponsesAcceptees: acceptees[e.variante],
  };
}

export const adaptateurEvaluationPolygonesReguliers: AdaptateurFeuilleExercices<ExercicePolygones> = {
  titreDocument: "Polygones réguliers et racines n-ièmes — Évaluation",
  nomFichierBase: "polygones-reguliers-racines",
  genererInstance: genererExercicePolygones,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilPolygones,
  libelleCasParticulier: LIBELLE_CAS_POLYGONES,
};
