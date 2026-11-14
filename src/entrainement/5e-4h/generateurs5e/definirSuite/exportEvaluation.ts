import { divise, ecarts, moins, plus, fois, premiersTermes, rapports, rat, valeursOptions } from "../../core5e/definirSuite";
import type { ExerciceDefinirSuite, ExerciceNature, ExerciceNatureFormule, ExerciceNatureRecurrence, ExerciceNatureTermes, ExerciceNotations, ExerciceRecurrence } from "../../core5e/definirSuite";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur5e/typesDefinirSuite";
import type { PhaseDefinirSuite } from "../../moteur5e/typesDefinirSuite";
import {
  conclusionVerdict,
  consigneEcran,
  consigneGenerale,
  indiceAutre,
  latexDecale,
  latexDifferenceFormule,
  latexDifferenceRecurrence,
  latexFormule,
  latexQuotientFormule,
  latexQuotientRecurrence,
  latexRecurrenceLineaire,
  latexRelation,
  qLatex,
  qParen,
  reponseFragments,
  reponseLatex,
  substitutionLatex,
} from "../../ui5e/formatDefinirSuite";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceDefinirSuite } from "./index";
import type { IdVarianteDefinirSuite } from "./index";
import { profilDefinirSuite } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDefinirSuite>` de `5gen44` « Définir et reconnaître
 * une suite » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la définition de la suite (ou la liste de termes) et la demande globale. Seule la
 *   variante `notations` garde trois VRAIES questions distinctes (a) uₙ₊₁, b) u₂ₙ ou uₙ₋₁, c) uₚ) ;
 *   récurrence : « calcule u₂, u₃ et u₄ » ; nature : « arithmétique, géométrique ou ni l'une ni
 *   l'autre ? Justifie et donne la raison ». La différence et le quotient (écrans a et b des
 *   variantes `nature-*`) sont des étapes d'apprentissage : ils passent dans le corrigé.
 * - Corrigé : une étape par écran (lettres a, b, c dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`reponseLatex`, `conclusionVerdict`), une ligne « Piège » ciblée.
 * - Aucune figure. Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abc";

/** Expression entre parenthèses pour une soustraction (sauf une fraction seule, déjà groupée). */
function paren(expr: string): string {
  return /^\\dfrac\{[^]*\}$/.test(expr) && !expr.includes("}+") && !expr.includes("}-") ? expr : `\\left(${expr}\\right)`;
}

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

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesNotations(e: ExerciceNotations): EtapeCorrection[] {
  const F = latexFormule(e.f);
  const argAutre = e.autre === "double" ? "2n" : "n-1";
  const motAutre = e.autre === "double" ? "2n" : "n − 1";
  const sub = (arg: "n+1" | "n-1" | "2n") => substitutionLatex(e.f, arg);
  const egal = (gauche: string, droite: string) => (gauche === droite ? gauche : `${gauche}=${droite}`);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [f("u_{n+1}"), t(" est le terme de rang n + 1 : on remplace chaque n par (n + 1) dans la formule, puis on simplifie.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`u_{n+1}=${egal(sub("n+1"), latexDecale(e.f, "suivant"))}`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [f(`u_{${indiceAutre(e)}}`), t(` est le terme de rang ${motAutre} : on remplace chaque n par ${e.autre === "double" ? "2n" : "(n − 1)"}.`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`u_{${indiceAutre(e)}}=${egal(sub(argAutre), latexDecale(e.f, e.autre))}`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`u_{${e.p}}=${substitutionLatex(e.f, e.p)}=${qLatex(premiersTermes(e, e.p)[e.p - 1])}`)] },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments:
        e.autre === "double"
          ? [t("Confondre "), f("u_{n+1}"), t(" et "), f(`u_n+1=${F}+1`), t(", ou "), f("u_{2n}"), t(" (terme de rang 2n) et "), f("2u_n"), t(" (double du terme).")]
          : [t("Confondre "), f("u_{n+1}"), t(" et "), f(`u_n+1=${F}+1`), t(", ou "), f("u_{n-1}"), t(" (terme de rang n − 1) et "), f("u_n-1"), t(".")],
    },
  ];
}

function calculTerme(e: ExerciceRecurrence, k: number): string {
  const t2 = premiersTermes(e, k);
  const prec = t2[k - 2];
  const valeur = t2[k - 1];
  const g = e.g;
  let milieu = "";
  if (g.type === "homographique") {
    const num = plus(fois(rat(g.alpha), prec), rat(g.beta));
    const den = plus(fois(rat(g.gamma), prec), rat(g.delta));
    const brut = `\\dfrac{${qLatex(num)}}{${qLatex(den)}}`;
    if (num.den === 1 && den.den === 1 && den.num !== 1 && brut !== qLatex(valeur)) milieu = `=${brut}`;
  } else {
    milieu = `=${qLatex(fois(prec, prec))}${g.c < 0 ? "-" : "+"}${Math.abs(g.c)}`;
  }
  return `u_{${k}}=${latexRelation(g, prec)}${milieu}=${qLatex(valeur)}`;
}

function lignesRecurrence(e: ExerciceRecurrence): EtapeCorrection[] {
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("Une relation de récurrence donne chaque terme à partir du précédent : on remplace "), f("u_n"), t(" par la valeur du terme précédent, en commençant par "), f(`u_1=${qLatex(e.u1)}`), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(calculTerme(e, 2))] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(calculTerme(e, 3))] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(calculTerme(e, 4))] },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [t("Remplacer "), f("u_n"), t(" par le rang n (par exemple calculer "), f(`u_3`), t(" avec 2 au lieu de "), f(`u_2=${qLatex(premiersTermes(e, 2)[1])}`), t(") ; ou donner une valeur arrondie au lieu de la valeur exacte.")],
    },
  ];
}

/** Trois premiers termes : contre-exemple (ni arithmétique ni géométrique). */
function contreExemple(e: ExerciceNature): FragmentConsigne[] {
  const [u1, u2, u3] = premiersTermes(e, 3);
  const d1 = moins(u2, u1);
  const d2 = moins(u3, u2);
  const q1 = divise(u2, u1);
  const q2 = divise(u3, u2);
  return [
    t("Contre-exemple sur les trois premiers termes, "),
    f(`u_1=${qLatex(u1)}`),
    t(", "),
    f(`u_2=${qLatex(u2)}`),
    t(", "),
    f(`u_3=${qLatex(u3)}`),
    t(" : "),
    f(`u_2-u_1=${qLatex(d1)}\\neq u_3-u_2=${qLatex(d2)}`),
    t(" et "),
    f(`\\dfrac{u_2}{u_1}=${qLatex(q1)}\\neq\\dfrac{u_3}{u_2}=${qLatex(q2)}`),
    t("."),
  ];
}

const METHODE_NATURE: FragmentConsigne[] = [
  t("Une suite est arithmétique si "),
  f("u_{n+1}-u_n"),
  t(" est un nombre constant (la raison r), géométrique si "),
  f("\\dfrac{u_{n+1}}{u_n}"),
  t(" est un nombre constant (la raison q)."),
];

function pieceNature(e: ExerciceNature): FragmentConsigne[] {
  const { r, q } = valeursOptions(e);
  return [t("Conclure sur les deux premiers termes seulement : "), f(`u_2-u_1=${qLatex(r)}`), t(" et "), f(`\\dfrac{u_2}{u_1}=${qLatex(q)}`), t(" existent toujours ; seule une différence (ou un quotient) qui ne dépend "), ...(e.variante === "nature-recurrence" ? [t("ni de n ni de "), f("u_n")] : [t("pas de n")]), t(" prouve la nature. Autre piège : prendre le quotient à l'envers, "), f("\\dfrac{u_n}{u_{n+1}}"), t(".")];
}

function lignesNatureFormule(e: ExerciceNatureFormule): EtapeCorrection[] {
  const F = latexFormule(e.f);
  const S = latexDecale(e.f, "suivant");
  const D = latexDifferenceFormule(e.f);
  const Qt = latexQuotientFormule(e.f);
  const brutQ = `\\dfrac{${S}}{${F}}`;
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [t("On remplace n par (n + 1) dans la formule, puis on soustrait "), f("u_n"), t(" tout entier : "), f(`u_{n+1}=${S}`), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`u_{n+1}-u_n=${paren(S)}-${paren(F)}=${D}`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(brutQ === Qt ? `\\dfrac{u_{n+1}}{u_n}=${Qt}` : `\\dfrac{u_{n+1}}{u_n}=${brutQ}=${Qt}`)] },
    { label: "Méthode", sousQuestion: "c", fragments: METHODE_NATURE },
    { label: "Conclusion", sousQuestion: "c", fragments: conclusionVerdict(e) },
  ];
  if (e.verdict === "aucune") lignes.push({ label: "Vérification", sousQuestion: "c", fragments: contreExemple(e) });
  lignes.push({ label: "Piège", sousQuestion: "c", fragments: pieceNature(e) });
  return lignes;
}

function lignesNatureRecurrence(e: ExerciceNatureRecurrence): EtapeCorrection[] {
  const G = latexRecurrenceLineaire(e.g);
  const D = latexDifferenceRecurrence(e.g);
  const Qt = latexQuotientRecurrence(e.g);
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: "a", fragments: [t("On soustrait "), f("u_n"), t(" aux deux membres de la relation, puis on réduit.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`u_{n+1}-u_n=${G}-u_n=${D}`)] },
    { label: "Calcul", sousQuestion: "b", fragments: [f(`\\dfrac{u_{n+1}}{u_n}=\\dfrac{${G}}{u_n}=${Qt}`)] },
    { label: "Méthode", sousQuestion: "c", fragments: METHODE_NATURE },
    { label: "Conclusion", sousQuestion: "c", fragments: conclusionVerdict(e) },
  ];
  if (e.verdict === "aucune") lignes.push({ label: "Vérification", sousQuestion: "c", fragments: contreExemple(e) });
  lignes.push({ label: "Piège", sousQuestion: "c", fragments: pieceNature(e) });
  return lignes;
}

function lignesNatureTermes(e: ExerciceNatureTermes): EtapeCorrection[] {
  const d = ecarts(e.termes);
  const q = rapports(e.termes);
  const piege: FragmentConsigne[] =
    e.piege === "ecart-dernier"
      ? [t("Les premiers écarts sont égaux, pas le dernier : s'arrêter aux premiers fait conclure à tort à une suite arithmétique. Un seul écart différent suffit à l'exclure.")]
      : e.piege === "rapport-dernier"
        ? [t("Les premiers rapports sont égaux, pas le dernier : s'arrêter aux premiers fait conclure à tort à une suite géométrique. Un seul rapport différent suffit à l'exclure.")]
        : [t("Ne regarder que les deux premiers termes, ou calculer les écarts dans le mauvais ordre ("), f("u_k-u_{k+1}"), t(") et les rapports à l'envers.")];
  return [
    { label: "Calcul", sousQuestion: "a", fragments: joindre(d.map((x, i) => `u_{${i + 2}}-u_{${i + 1}}=${qLatex(e.termes[i + 1])}-${qParen(e.termes[i])}=${qLatex(x)}`)) },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: joindre(
        q.map((x, i) => {
          const brut = `\\dfrac{${qLatex(e.termes[i + 1])}}{${qLatex(e.termes[i])}}`;
          return `\\dfrac{u_{${i + 2}}}{u_{${i + 1}}}=${brut === qLatex(x) ? brut : `${brut}=${qLatex(x)}`}`;
        }),
      ),
    },
    { label: "Conclusion", sousQuestion: "c", fragments: conclusionVerdict(e) },
    {
      label: "Remarque",
      sousQuestion: "c",
      fragments: [t("Une liste finie de termes peut RÉFUTER (un seul écart ou rapport différent suffit) mais jamais PROUVER qu'une suite est arithmétique ou géométrique : les termes suivants pourraient ne pas suivre la règle. D'où le mot « compatibles ».")],
    },
    { label: "Piège", sousQuestion: "c", fragments: piege },
  ];
}

function correctionDetaillee(e: ExerciceDefinirSuite): EtapeCorrection[] {
  switch (e.variante) {
    case "notations":
      return lignesNotations(e);
    case "recurrence":
      return lignesRecurrence(e);
    case "nature-formule":
      return lignesNatureFormule(e);
    case "nature-recurrence":
      return lignesNatureRecurrence(e);
    case "nature-termes":
      return lignesNatureTermes(e);
  }
}

/** Jamais fonction du verdict (variantes `nature-*`). */
function difficulte(e: ExerciceDefinirSuite): 1 | 2 | 3 {
  switch (e.variante) {
    case "notations":
      return e.famille === "affine" ? 1 : 2;
    case "recurrence":
    case "nature-termes":
      return 2;
    case "nature-formule":
    case "nature-recurrence":
      return 3;
  }
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
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
  profilInstance: profilDefinirSuite,
};
