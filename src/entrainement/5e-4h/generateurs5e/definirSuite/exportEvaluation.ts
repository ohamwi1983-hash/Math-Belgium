import { valeursOptions } from "../../core5e/definirSuite";
import type { ExerciceDefinirSuite, ExerciceNature } from "../../core5e/definirSuite";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur5e/typesDefinirSuite";
import type { PhaseDefinirSuite } from "../../moteur5e/typesDefinirSuite";
import { consigneEcran, consigneGenerale, qLatex, reponseFragments, reponseLatex } from "../../ui5e/formatDefinirSuite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDefinirSuite } from "./index";
import type { IdVarianteDefinirSuite } from "./index";
import { profilDefinirSuite } from "./profilEvaluation";
import { correctionDetailleeDefinirSuite } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDefinirSuite>` de `5gen44` « Définir et reconnaître
 * une suite » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la définition de la suite (ou la liste de termes) et la demande globale. Seule la
 *   variante `notations` garde trois VRAIES questions distinctes (a) uₙ₊₁, b) u₂ₙ ou uₙ₋₁, c) uₚ) ;
 *   récurrence : « calcule u₂, u₃ et u₄ » ; nature : « arithmétique, géométrique ou ni l'une ni
 *   l'autre ? Justifie et donne la raison ». La différence et le quotient (écrans a et b des
 *   variantes `nature-*`) sont des étapes d'apprentissage : ils passent dans le corrigé.
 * - Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts` (partagé avec l'appli), une étape
 *   par écran (lettres a, b, c dans l'ordre des écrans).
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abc";

// ============================================================================
// Énoncés.
// ============================================================================

const JUSTIFIE_RAISON = " Justifie et, si elle existe, donne sa raison.";

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier (sans la syntaxe clavier). */
function titreEtape(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): FragmentConsigne[] {
  if (phase === "verdict") return e.variante === "nature-termes" ? [t("Conclus : compatibles avec une suite arithmétique, géométrique, ou aucune des deux ?")] : [t("Conclus sur la nature de la suite.")];
  if (e.variante === "nature-recurrence" && (phase === "difference" || phase === "quotient")) {
    return phase === "difference"
      ? [t("Exprime "), f("u_{n+1}-u_n"), t(" en fonction de "), f("u_n"), t(" (et de "), f("n"), t(" si besoin).")]
      : [t("Exprime "), f("\\dfrac{u_{n+1}}{u_n}"), t(" en fonction de "), f("u_n"), t(" (et de "), f("n"), t(" si besoin).")];
  }
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceDefinirSuite): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceDefinirSuite): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

function entetePapier(e: ExerciceDefinirSuite): FragmentConsigne[] {
  switch (e.variante) {
    case "notations":
      return consigneGenerale(e);
    case "recurrence":
      return [...consigneGenerale(e), t(" Calcule "), f("u_2"), t(", "), f("u_3"), t(" et "), f("u_4"), t(" (valeurs exactes).")];
    case "nature-formule":
    case "nature-recurrence":
      return [...consigneGenerale(e), t(JUSTIFIE_RAISON)];
    case "nature-termes":
      return [...consigneGenerale(e), t(" Justifie et, s'il y a lieu, donne la raison.")];
  }
}

function verdictCourt(e: ExerciceNature): FragmentConsigne[] {
  const { r, q } = valeursOptions(e);
  const compatibles = e.variante === "nature-termes";
  if (e.verdict === "arithmetique") return [t(compatibles ? "Compatibles avec une suite arithmétique de raison " : "Suite arithmétique de raison "), f(`r=${qLatex(r)}`), t(".")];
  if (e.verdict === "geometrique") return [t(compatibles ? "Compatibles avec une suite géométrique de raison " : "Suite géométrique de raison "), f(`q=${qLatex(q)}`), t(".")];
  return [t(compatibles ? "Compatibles avec aucune des deux." : "Ni arithmétique ni géométrique.")];
}

function joindre(latexListe: string[]): FragmentConsigne[] {
  const out: FragmentConsigne[] = [];
  latexListe.forEach((x, i) => {
    if (i > 0) out.push(t(" ; "));
    out.push(f(x));
  });
  return out;
}

function reponseBreve(e: ExerciceDefinirSuite): FragmentConsigne[] {
  switch (e.variante) {
    case "notations":
      return [t("a) "), ...reponseFragments(e, "suivant"), t(" ; b) "), ...reponseFragments(e, "autre"), t(" ; c) "), ...reponseFragments(e, "terme")];
    case "recurrence":
      return joindre([...reponseLatex(e, "terme2"), ...reponseLatex(e, "terme3"), ...reponseLatex(e, "terme4")]);
    default:
      return verdictCourt(e);
  }
}

function enoncePapier(e: ExerciceDefinirSuite): EnoncePapier {
  if (e.variante === "notations") {
    return {
      section: { enteteFragments: entetePapier(e), questions: (["suivant", "autre", "terme"] as const).map((phase) => ({ consigne: consigneEcran(e, phase) })) },
      etapesParQuestion: [["a"], ["b"], ["c"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

/** Jamais fonction du verdict (variantes `nature-*`). */
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceDefinirSuite): CriteresDifficulte {
  const [methode, piege]: [0 | 1, 0 | 1] = e.variante === "notations" ? [0, 1] : e.variante === "recurrence" ? [0, 0] : [1, 1];
  return { ...etapesDuCorrige(correctionDetailleeDefinirSuite(e)), methode, piege };
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

const CONCLUSION_DEUX_TERMES = { description: [t("Nature déduite des deux premiers termes seulement (sans différence ni quotient constants)")], cout: "0 pt sur la conclusion" };

function bareme(e: ExerciceDefinirSuite): BaremeExercice {
  const r = (phase: PhaseDefinirSuite) => reponseFragments(e, phase);
  switch (e.variante) {
    case "notations":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Chaque n remplacé par (n + 1), expression simplifiée : "), ...r("suivant")], points: 1.5 },
          { sousQuestion: "b", critere: [t(e.autre === "double" ? "Chaque n remplacé par 2n : " : "Chaque n remplacé par (n − 1) : "), ...r("autre")], points: 1.5 },
          { sousQuestion: "c", critere: r("terme"), points: 1 },
        ],
        erreursFrequentes: [
          { description: [f("u_n+1"), t(" écrit à la place de "), f("u_{n+1}")], cout: "0 pt sur a)" },
          { description: e.autre === "double" ? [f("2u_n"), t(" écrit à la place de "), f("u_{2n}")] : [f("u_n-1"), t(" écrit à la place de "), f("u_{n-1}")], cout: "0 pt sur b)" },
          { description: [t("Substitution partielle (un seul n remplacé) ou parenthèses oubliées")], cout: "−0,5" },
        ],
        reponsesAcceptees: [[t("Toute expression équivalente, même non simplifiée (simplification attendue pour la totalité des points)")]],
      };
    case "recurrence":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("terme2"), points: 1 },
          { sousQuestion: "b", critere: r("terme3"), points: 1.5 },
          { sousQuestion: "c", critere: r("terme4"), points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Rang n mis à la place du terme précédent "), f("u_n")], cout: "−1" },
          { description: [t("Valeur arrondie au lieu de la valeur exacte")], cout: "−0,5" },
          { description: [t("Erreur de priorité (fraction ou carré mal calculés)")], cout: "−0,5" },
        ],
        reponsesAcceptees: [[t("Fractions équivalentes, décimal exact ; une erreur sur un terme n'est comptée qu'une fois si les suivants en découlent correctement")]],
      };
    case "nature-formule":
    case "nature-recurrence":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Différence simplifiée : "), ...r("difference")], points: 1.5 },
          { sousQuestion: "b", critere: [t("Quotient (dans le bon ordre) : "), ...r("quotient")], points: 1 },
          { sousQuestion: "c", critere: [t("Conclusion justifiée et raison : "), ...verdictCourt(e)], points: 1.5 },
        ],
        erreursFrequentes: [CONCLUSION_DEUX_TERMES, { description: [t("Quotient pris à l'envers ("), f("\\dfrac{u_n}{u_{n+1}}"), t(")")], cout: "−0,5" }, { description: [t("Raison non donnée alors qu'elle existe")], cout: "−0,5" }],
        reponsesAcceptees: [[t("Pour « ni l'une ni l'autre » : un contre-exemple sur trois termes consécutifs suffit")]],
      };
    case "nature-termes":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Tous les écarts : "), ...r("ecarts")], points: 1 },
          { sousQuestion: "b", critere: [t("Tous les rapports : "), ...r("rapports")], points: 1 },
          { sousQuestion: "c", critere: [t("Conclusion justifiée : "), ...verdictCourt(e)], points: 2 },
        ],
        erreursFrequentes: [
          { description: [t("Conclusion tirée des premiers écarts ou rapports sans vérifier le dernier")], cout: "0 pt sur la conclusion" },
          { description: [t("Écarts dans le mauvais ordre ou rapports à l'envers")], cout: "−0,5" },
        ],
        reponsesAcceptees: [[t("Pour exclure une famille, un seul écart (ou rapport) différent des autres suffit")]],
      };
  }
}

export const adaptateurEvaluationDefinirSuite: AdaptateurFeuilleExercices<ExerciceDefinirSuite> = {
  titreDocument: "Définir et reconnaître une suite — Évaluation",
  nomFichierBase: "definir-reconnaitre-suite",
  genererInstance: genererExerciceDefinirSuite,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteDefinirSuite),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeDefinirSuite,
  bareme,
  enoncePapier,
  profilInstance: profilDefinirSuite,
};
