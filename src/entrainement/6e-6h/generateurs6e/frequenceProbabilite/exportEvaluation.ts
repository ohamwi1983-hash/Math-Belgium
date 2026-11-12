import type { ExerciceFrequenceProbabilite } from "../../core6e/frequenceProbabilite.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  aideNiveau1,
  conclusionTexte,
  decimal,
  ecartsPourcent,
  entierLatex,
  entierTexte,
  fractionLatex,
  reponseAttendueFragments,
  texteRegleDecision,
} from "../../ui6e/formatFrequenceProbabilite";
import { svgDiagrammeFrequences, svgGrilleSommes } from "../../ui6e/figuresFrequenceProbabilite";
import { phasesPourExercice } from "../../moteur6e/typesFrequenceProbabilite";
import type { PhaseFrequenceProbabilite } from "../../moteur6e/typesFrequenceProbabilite";
import { couplesDeSomme, ecartRelatif, effectifAttendu, frequenceObservee, probabiliteModele, seuilRelatif, utiliseModeleEcran4 } from "../../moteur6e/verificationFrequenceProbabilite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFrequenceProbabilite } from "./index";
import type { IdVarianteFrequenceProbabilite } from "./index";
import { profilFrequenceProbabilite } from "../profilsEvaluationFrequenceProbabilite";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFrequenceProbabilite>` de `6gen75` « Fréquence et
 * probabilité » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - `enoncePapier` : données (tableau des effectifs en tableau KaTeX, règle de décision en prose avec
 *   tous ses paliers) + consigne globale ; les VRAIES questions restent distinctes (A : le dé est-il
 *   équilibré ? puis l'effectif attendu ; B : quel modèle ? puis l'effectif attendu ; C : modèle a
 *   priori ? l'affirmation ? l'effectif attendu). Le verdict n'est jamais annoncé : la question de
 *   l'effectif attendu dit « la probabilité du modèle s'il est retenu, sinon la fréquence ».
 * - Corrigé détaillé : « Étape n — consigne » par écran, Méthode / Calcul / Conclusion / Piège ;
 *   figures (`figureHtml`) : grille des 36 couples surlignée (B, étape 1), diagramme des fréquences
 *   face au modèle (étape 3).
 * - Version aménagée : même énoncé (pas de champ dédié, décision de l'utilisateur).
 */

const LETTRES = "abcd";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

function reponse(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  return reponseAttendueFragments(e, phase).map((fr) => (fr.type === "texte" ? t(fr.valeur) : f(fr.valeur)));
}

// ---------------------------------------------------------------------------------------------
// Énoncé papier
// ---------------------------------------------------------------------------------------------

function tableauLatex(entete: string, colonnes: string[], valeurs: number[]): string {
  const cols = "|c".repeat(colonnes.length + 1) + "|";
  return `\\begin{array}{${cols}}\\hline \\text{${entete}} & ${colonnes.join(" & ")} \\\\ \\hline \\text{Effectif} & ${valeurs.map(entierLatex).join(" & ")} \\\\ \\hline\\end{array}`;
}

function regle(): FragmentConsigne[] {
  return [
    t(" Règle de décision : l'écart entre une fréquence "),
    f("f"),
    t(" et une probabilité "),
    f("p"),
    t(" est jugé significatif quand l'écart relatif "),
    f("\\dfrac{|f-p|}{p}"),
    t(` dépasse ${texteRegleDecision()}.`),
  ];
}

function entetePapier(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const n = f(`n=${entierLatex(e.n)}`);
  switch (e.famille) {
    case "A":
      return [
        t("On lance un dé à six faces "),
        n,
        t(" fois et on note la face obtenue. Effectif de chaque face : "),
        f(tableauLatex("Face", ["1", "2", "3", "4", "5", "6"], e.effectifs)),
        t(`. On étudie l'événement E : « ${e.evenement.libelle} ».`),
        ...regle(),
      ];
    case "B":
      return [
        t("On lance deux dés à six faces "),
        n,
        t(" fois et on note à chaque fois la somme des deux faces. Effectif de chaque somme : "),
        f(tableauLatex("Somme", ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], e.effectifs)),
        t(`. On étudie l'événement E : « ${e.evenement.libelle} ».`),
        ...regle(),
      ];
    case "C":
      return [
        t(`On lance ${e.objet.nom} `),
        n,
        t(
          ` fois : ${e.objet.sujet} est retombé${e.objet.sujet.startsWith("la ") ? "e" : ""} ${e.objet.issue} ${entierTexte(e.effectif)} fois, et ${e.objet.autreIssue} ${entierTexte(e.n - e.effectif)} fois. On note E l'événement « ${e.objet.sujet} retombe ${e.objet.issue} ». Un camarade affirme que ${e.objet.sujet} retombe ${e.objet.issue} ${e.affirmation.texte}.`,
        ),
        ...regle(),
      ];
  }
}

function questionEffectif(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const N = f(`N=${entierLatex(e.nouveauxEssais)}`);
  if (e.famille === "C") return [t("En estimant la probabilité de E par la fréquence observée (fraction exacte, sans arrondi), combien de fois peut-on s'attendre à ce que E se réalise sur "), N, t(" nouveaux lancers ?")];
  return [
    t("Combien de fois peut-on s'attendre à ce que E se réalise sur "),
    N,
    t(` nouveaux lancers ? Utilise la probabilité ${e.famille === "A" ? "d'un dé équilibré si ce modèle" : "du modèle de la grille s'il"} est retenu, sinon la fréquence observée (fraction exacte, sans arrondi).`),
  ];
}

function questionsPapier(e: ExerciceFrequenceProbabilite): QuestionExercice[] {
  switch (e.famille) {
    case "A":
      return [
        { consigne: [t("Ce dé peut-il être considéré comme équilibré ? Justifie en comparant la fréquence observée de E à sa probabilité pour un dé équilibré, à l'aide de la règle de décision.")] },
        { consigne: questionEffectif(e) },
      ];
    case "B":
      return [
        {
          consigne: [
            t("Calcule la probabilité de E si les deux dés sont équilibrés, puis, à l'aide de la règle de décision, dis si les résultats confirment ce modèle ou plutôt celui des 11 sommes équiprobables (probabilité "),
            f("\\dfrac{1}{11}"),
            t(" pour chaque somme)."),
          ],
        },
        { consigne: questionEffectif(e) },
      ];
    case "C":
      return [
        { consigne: [t("Peut-on calculer a priori la probabilité de E ? Justifie.")] },
        { consigne: [t("L'affirmation du camarade est-elle compatible avec les résultats ? Justifie à l'aide de la fréquence observée de E et de la règle de décision.")] },
        { consigne: questionEffectif(e) },
      ];
  }
}

function etapesParQuestion(e: ExerciceFrequenceProbabilite): string[][] {
  return e.famille === "C" ? [["a"], ["b", "c"], ["d"]] : [["a", "b", "c"], ["d"]];
}

/** Titre d'étape (corrigé « Étape n — … » et ancien énoncé une-question-par-écran) : consigne
 * d'écran sans tournure d'écran, et sans annoncer le verdict de l'étape 3 à l'étape 4. */
function titreEtape(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  switch (phase) {
    case "ecran1":
      if (e.famille === "A") return [t("Si le dé est équilibré, quelle est la probabilité de E ?")];
      if (e.famille === "B") return [t("Si les deux dés sont équilibrés, quelle est la probabilité de E ?")];
      return [t("Peut-on calculer a priori la probabilité de E ?")];
    case "ecran2":
      return [t("Calcule la fréquence observée "), f("f"), t(" de E.")];
    case "ecran3":
      if (e.famille === "A") return [t("Compare "), f("f"), t(" à la probabilité d'un dé équilibré à l'aide de la règle de décision, puis conclus.")];
      if (e.famille === "B") return [t("Applique la règle de décision au modèle de la grille, puis à celui des 11 sommes équiprobables : que confirment les résultats ?")];
      return [t("Applique la règle de décision à la valeur affirmée : que conclut-on ?")];
    case "ecran4":
      return questionEffectif(e);
  }
}

function construireEnonce(e: ExerciceFrequenceProbabilite): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFrequenceProbabilite): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function reponseBreveQuestions(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  const ecarts = ecartsPourcent(e);
  const detail = f(`\\dfrac{|f-p|}{p}\\approx ${ecarts.modele}\\,\\%${ecarts.modele <= ecarts.seuil ? "\\leqslant" : ">"}${ecarts.seuil}\\,\\%`);
  const effectif = f(entierLatex(effectifAttendu(e)));
  if (e.famille === "C") return [t("a) Non (issues non équiprobables) ; b) "), ...reponse(e, "ecran2"), t(", "), detail, t(` : ${conclusionTexte(e)} ; c) `), effectif];
  return [t("a) "), ...reponse(e, "ecran1"), t(", "), ...reponse(e, "ecran2"), t(", "), detail, t(` : ${conclusionTexte(e)} ; b) `), effectif];
}

function enoncePapier(e: ExerciceFrequenceProbabilite): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: questionsPapier(e) }, etapesParQuestion: etapesParQuestion(e), reponseBreve: reponseBreveQuestions(e) };
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function methode(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  return [t(aide.latex ? `${aide.texte} ` : aide.texte), ...(aide.latex ? [f(aide.latex)] : [])];
}

function sommeLatex(valeurs: number[]): string {
  const total = valeurs.reduce((a, b) => a + b, 0);
  return valeurs.length === 1 ? entierLatex(total) : `${valeurs.map(entierLatex).join("+")}=${entierLatex(total)}`;
}

function calcul(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] | null {
  switch (phase) {
    case "ecran1": {
      if (e.famille === "A") return [t(`Faces qui réalisent E : ${e.evenement.faces.join(", ")}, soit ${e.evenement.faces.length} face${e.evenement.faces.length > 1 ? "s" : ""} sur 6.`)];
      if (e.famille === "B") {
        const cases = e.evenement.sommes.map(couplesDeSomme);
        return [t(`Cases de la grille dont la somme réalise E (sommes ${e.evenement.sommes.join(", ")}) : `), f(sommeLatex(cases)), t(" cases sur 36.")];
      }
      return null;
    }
    case "ecran2": {
      if (e.famille === "A") return [t("Effectif de E : "), f(sommeLatex(e.evenement.faces.map((k) => e.effectifs[k - 1]))), t(` sur ${entierTexte(e.n)} lancers.`)];
      if (e.famille === "B") return [t("Effectif de E : "), f(sommeLatex(e.evenement.sommes.map((s) => e.effectifs[s - 2]))), t(` sur ${entierTexte(e.n)} lancers.`)];
      return [t(`Effectif de E : ${entierTexte(e.effectif)} sur ${entierTexte(e.n)} lancers.`)];
    }
    case "ecran3": {
      const fr = frequenceObservee(e);
      const p = probabiliteModele(e);
      const ligne = (pp: number) => f(`\\dfrac{|f-p|}{p}=\\dfrac{|${decimal(fr, 4)}-${decimal(pp, 4)}|}{${decimal(pp, 4)}}\\approx ${decimal(ecartRelatif(fr, pp), 3)}`);
      const seuil = [t(` ; pour ${entierTexte(e.n)} essais, le seuil vaut `), f(`${Math.round(seuilRelatif(e.n) * 100)}\\,\\%`), t(".")];
      if (e.famille === "B") return [t("Grille : "), ligne(p), t(" ; sommes équiprobables : "), ligne(e.evenement.sommes.length / 11), ...seuil];
      return [ligne(p), ...seuil];
    }
    case "ecran4":
      return null;
  }
}

function piege(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): FragmentConsigne[] | null {
  switch (phase) {
    case "ecran1":
      if (e.famille === "A") return null;
      if (e.famille === "B") return [t("Croire les 11 sommes équiprobables et répondre "), f(fractionLatex(e.evenement.sommes.length, 11)), t(" : ce sont les 36 couples qui sont équiprobables.")];
      return [t("Répondre « une chance sur deux » parce qu'il y a deux issues : rien ne garantit qu'elles sont équiprobables.")];
    case "ecran2":
      return [t("Diviser l'effectif par le nombre d'issues au lieu du nombre total d'essais"), ...(e.famille !== "C" && (e.famille === "A" ? e.evenement.faces.length : e.evenement.sommes.length) > 1 ? [t(", ou oublier une des valeurs qui réalisent E")] : []), t(".")];
    case "ecran3":
      if (e.famille === "B") return [t("Conclure sans calculer l'écart à chacun des deux modèles, ou rejeter un modèle parce que la fréquence n'est pas exactement égale à sa probabilité.")];
      return [t(`Conclure « ${e.famille === "A" ? "truqué" : "faux"} » dès que f est différente de p : une fréquence fluctue toujours, seule la taille de l'écart relatif compte.`)];
    case "ecran4":
      if (e.famille === "C") return [t("Utiliser la valeur affirmée au lieu de la fréquence observée, ou une fréquence arrondie.")];
      return utiliseModeleEcran4(e) ? [t("Utiliser la fréquence observée (ou une probabilité arrondie) alors que le modèle est confirmé.")] : [t("Utiliser la probabilité du modèle alors qu'il est rejeté, ou une fréquence arrondie.")];
  }
}

function figure(e: ExerciceFrequenceProbabilite, phase: PhaseFrequenceProbabilite): string | null {
  if (phase === "ecran1" && e.famille === "B") return svgGrilleSommes(e.evenement.sommes);
  if (phase === "ecran3") return svgDiagrammeFrequences(e);
  return null;
}

function correctionDetaillee(e: ExerciceFrequenceProbabilite): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: methode(e, phase) }];
    const c = calcul(e, phase);
    if (c) lignes.push({ label: "Calcul", sousQuestion, fragments: c });
    const fig = figure(e, phase);
    lignes.push({ label: "Conclusion", sousQuestion, fragments: reponse(e, phase), ...(fig ? { figureHtml: fig } : {}) });
    const p = piege(e, phase);
    if (p) lignes.push({ label: "Piège", sousQuestion, fragments: p });
    return lignes;
  });
}

function difficulte(e: ExerciceFrequenceProbabilite): 1 | 2 | 3 {
  return e.famille === "B" ? 3 : 2;
}

function reponseBreve(e: ExerciceFrequenceProbabilite): FragmentConsigne[] {
  return reponseBreveQuestions(e);
}

/** Poids par étape (somme 4, aucun critère sous 0,5). */
function poids(e: ExerciceFrequenceProbabilite): number[] {
  return e.famille === "A" ? [0.5, 1, 1.5, 1] : [1, 0.5, 1.5, 1];
}

function bareme(e: ExerciceFrequenceProbabilite): BaremeExercice {
  const phases = phasesPourExercice(e);
  const p = poids(e);
  const erreurs = phases.map((phase) => piege(e, phase)).filter((x): x is FragmentConsigne[] => !!x);
  return {
    reponseFinale: reponseBreve(e),
    criteres: phases.map((phase, i) => ({ sousQuestion: LETTRES[i], critere: reponse(e, phase), points: p[i] })),
    erreursFrequentes: erreurs.map((description) => ({ description, cout: "−1" })),
    reponsesAcceptees: [
      [t("Probabilité et fréquence : fraction, décimal correctement arrondi avec au moins deux chiffres significatifs, ou pourcentage")],
      [t("Effectif attendu : à une unité près")],
      [t("Conclusion de l'étape 3 : seulement si elle s'appuie sur l'écart relatif comparé au seuil")],
    ],
  };
}

export const adaptateurEvaluationFrequenceProbabilite: AdaptateurFeuilleExercices<ExerciceFrequenceProbabilite> = {
  titreDocument: "Fréquence et probabilité — Évaluation",
  nomFichierBase: "frequence-probabilite",
  genererInstance: genererExerciceFrequenceProbabilite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFrequenceProbabilite),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilFrequenceProbabilite,
  calculatriceIndispensable: true,
};
