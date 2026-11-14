import type { ExerciceComparerEncadrerLog, ExerciceComparerLog, TermeLog } from "../../core6e/comparerEncadrerLogarithmes.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { estPhaseChoix, phasesExercice } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import type { PhaseComparerEncadrerLog } from "../../moteur6e/typesComparerEncadrerLogarithmes";
import {
  centiemesLatex,
  cibleChangementBase,
  encadrementEntierLatex,
  encadrementPuissancesLatex,
  entierLatex,
  entierTexte,
  symboleLogBase,
  estBaseInf1,
  formatReponseAttendueLatex,
  logDonneLatex,
  logLatex,
  milliemesLatex,
  nombresRangerLatex,
  optionCorrecteFragments,
  termeLatex,
  valeursDonneesLatex,
} from "../../ui6e/formatComparerEncadrerLogarithmes";
import { profilComparerEncadrerLog } from "./profil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparerEncadrerLog } from "./index";
import type { IdVarianteComparerEncadrerLog } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparerEncadrerLog>` de `6gen86` « Comparer et
 * encadrer des logarithmes sans calculatrice » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le ou les nombres et UNE consigne globale (« sans calculatrice… en justifiant ») ;
 *   les écrans deviennent les étapes du corrigé (« Étape n — … »). Aucune figure.
 * - Corrigé : réponses tirées des MÊMES fonctions que l'écran (`formatReponseAttendueLatex`,
 *   `optionCorrecteFragments`, encadrements par puissances).
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = ["a", "b", "c", "d"];

function lettre(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

const logAN = (a: number, N: number) => logLatex({ num: a, den: 1 }, { num: N, den: 1 });

function termes(e: ExerciceComparerEncadrerLog): TermeLog[] {
  if (e.variante === "comparer") return [e.A, e.B];
  if (e.variante === "ranger") return e.nombres.flatMap((n) => (n.type === "log" ? [n.terme] : []));
  return [];
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function entetePapier(e: ExerciceComparerEncadrerLog): FragmentConsigne[] {
  switch (e.variante) {
    case "encadrer":
      return [t("Sans calculatrice, encadre "), f(logAN(e.a, e.N)), t(` entre deux entiers consécutifs, en justifiant à l'aide des puissances de ${e.a}.`)];
    case "comparer":
      return [t("On considère les nombres "), f(`A=${termeLatex(e.A)}`), t(" et "), f(`B=${termeLatex(e.B)}`), t(". Sans calculatrice, compare "), f("A"), t(" et "), f("B"), t(" en justifiant.")];
    case "ranger": {
      const n = nombresRangerLatex(e);
      return [t("Sans calculatrice, range dans l'ordre croissant les nombres suivants, en justifiant : "), ...n.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)])), t(".")];
    }
    case "changementBase": {
      const s = e.mode === "log" ? "\\log" : "\\ln";
      return [
        t("On donne "),
        f(`${s}(2)\\approx ${milliemesLatex(e.mode === "log" ? 301 : 693)}`),
        t(" et "),
        f(`${s}(3)\\approx ${milliemesLatex(e.mode === "log" ? 477 : 1099)}`),
        t(". Sans calculatrice, calcule une valeur approchée de "),
        f(cibleChangementBase(e)),
        t(", arrondie au centième, à l'aide des propriétés du logarithme et du changement de base. Justifie."),
      ];
    }
  }
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer" ? [t(`Encadre ${entierTexte(e.N)} entre deux puissances consécutives de ${e.a}.`)] : [];
    case "encadrement":
      return e.variante === "encadrer" ? [t("Déduis-en un encadrement de "), f(logAN(e.a, e.N)), t(" entre deux entiers consécutifs.")] : [];
    case "encadrerA":
      return [t("Encadre "), f("A"), t(" entre deux entiers consécutifs.")];
    case "encadrerB":
      return [t("Encadre "), f("B"), t(" entre deux entiers consécutifs.")];
    case "verdict":
      return [t("Compare "), f("A"), t(" et "), f("B"), t(".")];
    case "situer":
      return [t("Encadre chaque logarithme entre deux entiers consécutifs.")];
    case "ordre":
      return [t("Range les quatre nombres dans l'ordre croissant.")];
    case "formule":
      return e.variante === "changementBase" ? [t("Écris "), f(cibleChangementBase(e)), t(" à l'aide du changement de base.")] : [];
    case "valeurs":
      return e.variante === "changementBase" ? [t("Calcule des valeurs approchées de "), f(logDonneLatex(e, e.N)), t(" et de "), f(logDonneLatex(e, e.a)), t(".")] : [];
    case "quotient":
      return e.variante === "changementBase" ? [t("Déduis-en une valeur approchée de "), f(cibleChangementBase(e)), t(", arrondie au centième.")] : [];
  }
}

function reponseEtape(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  if (estPhaseChoix(phase)) return optionCorrecteFragments(e, phase);
  return formatReponseAttendueLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function construireEnonce(e: ExerciceComparerEncadrerLog): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceComparerEncadrerLog): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseEtape(e, phase)] }));
}

function reponseBreve(e: ExerciceComparerEncadrerLog): FragmentConsigne[] {
  switch (e.variante) {
    case "encadrer":
      return [f(`${e.k}<${logAN(e.a, e.N)}<${e.k + 1}`)];
    case "comparer":
      return [f(`${termeLatex(e.A)}${e.verdict}${termeLatex(e.B)}`)];
    case "ranger":
      return optionCorrecteFragments(e, "ordre");
    case "changementBase":
      return [f(`${cibleChangementBase(e)}\\approx ${centiemesLatex(e.resultatCentiemes)}`)];
  }
}

function enoncePapier(e: ExerciceComparerEncadrerLog): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** « log₂ est strictement croissante » / « log_{1/2} est strictement décroissante : l'ordre s'inverse ». */
function sensVariation(te: TermeLog): FragmentConsigne[] {
  const nom = te.base.den === 1 && te.base.num === 10 ? "\\log" : `\\log_{${te.base.den === 1 ? te.base.num : `1/${te.base.den}`}}`;
  return estBaseInf1(te)
    ? [f(nom), t(" est strictement décroissante (base inférieure à 1) : en l'appliquant, les inégalités changent de sens ; avec (P3), ")]
    : [f(nom), t(" est strictement croissante (base supérieure à 1) : en l'appliquant aux trois membres et avec (P3), ")];
}

function methodeTerme(te: TermeLog): FragmentConsigne[] {
  return [t("Puissances de la base qui encadrent l'argument : "), f(encadrementPuissancesLatex(te)), t(". "), ...sensVariation(te), f(encadrementEntierLatex(te)), t(".")];
}

function methodeVerdict(e: ExerciceComparerLog): FragmentConsigne[] {
  if (e.type === "separes") {
    return [
      t("Les encadrements se séparent : "),
      f(encadrementEntierLatex(e.A)),
      t(" et "),
      f(encadrementEntierLatex(e.B)),
      t(". Tout nombre du premier intervalle est "),
      t(e.verdict === "<" ? "plus petit" : "plus grand"),
      t(" que tout nombre du second."),
    ];
  }
  const lien = e.lien!;
  const c = lien.c;
  const decroissant = c.num < c.den;
  const yn = Math.pow(lien.y, lien.n);
  const tC = logLatex(c, { num: lien.y, den: 1 });
  const ordreArg = lien.x === yn ? "=" : lien.x < yn ? "<" : ">";
  const sens = [t(decroissant ? " ; or ce logarithme est strictement décroissant (base inférieure à 1) : l'ordre s'inverse." : " ; or ce logarithme est strictement croissant.")];
  if (lien.n === 1) {
    return [
      t("Les encadrements sont identiques : ils ne suffisent pas. Les deux logarithmes ont la même base ; on compare les arguments : "),
      f(`${lien.x}${ordreArg}${lien.y}`),
      ...sens,
    ];
  }
  const tCn = logLatex({ num: Math.pow(c.num, lien.n), den: Math.pow(c.den, lien.n) }, { num: lien.x, den: 1 });
  return [
    t("Les encadrements sont identiques : ils ne suffisent pas. Changement de base vers la base "),
    f(c.den === 1 ? `${c.num}` : `\\dfrac{1}{${c.den}}`),
    t(" : "),
    f(`${tCn}=\\dfrac{${logLatex(c, { num: lien.x, den: 1 })}}{${lien.n}}`),
    t(" et "),
    f(`${tC}=\\dfrac{${lien.n}\\,${tC}}{${lien.n}}=\\dfrac{${logLatex(c, { num: yn, den: 1 })}}{${lien.n}}`),
    t(". On compare les arguments : "),
    f(`${entierLatex(lien.x)}${ordreArg}${entierLatex(yn)}`),
    ...(ordreArg === "=" ? [t(" : les deux nombres sont égaux.")] : sens),
  ];
}

function methode(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] {
  switch (phase) {
    case "puissances":
      return e.variante === "encadrer" ? [t(`On cherche l'entier k tel que `), f(`${e.a}^{k}<${entierLatex(e.N)}<${e.a}^{k+1}`), t(` en écrivant les puissances successives de ${e.a}.`)] : [];
    case "encadrement":
      return e.variante === "encadrer"
        ? [
            f(symboleLogBase(e.a)),
            t(" est strictement croissante (base supérieure à 1) : on l'applique aux trois membres, "),
            f(`${symboleLogBase(e.a)}\\left(${e.a}^{${e.k}}\\right)<${logAN(e.a, e.N)}<${symboleLogBase(e.a)}\\left(${e.a}^{${e.k + 1}}\\right)`),
            t(", puis (P3) : "),
            f("\\log_a\\left(a^{r}\\right)=r"),
            t("."),
          ]
        : [];
    case "encadrerA":
      return e.variante === "comparer" ? methodeTerme(e.A) : [];
    case "encadrerB":
      return e.variante === "comparer" ? methodeTerme(e.B) : [];
    case "verdict":
      return e.variante === "comparer" ? methodeVerdict(e) : [];
    case "situer":
      return termes(e).flatMap((te, i) => [...(i > 0 ? [t(" ")] : []), f(encadrementPuissancesLatex(te)), t(estBaseInf1(te) ? " (base inférieure à 1 : l'ordre s'inverse) donne " : " donne "), f(encadrementEntierLatex(te)), t(".")]);
    case "ordre":
      return [t("Chaque logarithme est dans son intervalle entre deux entiers consécutifs ; l'entier ou la fraction se place parmi ces intervalles (une fraction s'écrit sous forme décimale).")];
    case "formule":
      return e.variante === "changementBase"
        ? [t(`Changement de base vers la base ${e.mode === "log" ? "10" : "e"} : `), f(e.mode === "log" ? "\\log_a(x)=\\dfrac{\\log(x)}{\\log(a)}" : "\\log_a(x)=\\dfrac{\\ln(x)}{\\ln(a)}"), t(".")]
        : [];
    case "valeurs":
      if (e.variante !== "changementBase") return [];
      return [
        t("On décompose en produits (ou quotients) de puissances de 2 et de 3"),
        t(e.N.r !== 0 || e.a.r !== 0 ? " (et de 5, avec " : ""),
        ...(e.N.r !== 0 || e.a.r !== 0 ? [f("\\log(5)=\\log(10)-\\log(2)\\approx 0{,}699"), t(")")] : []),
        t(", puis on applique les propriétés du produit, du quotient et de la puissance, avec les valeurs données "),
        f(valeursDonneesLatex(e)),
        t("."),
      ];
    case "quotient":
      return [t("On remplace chaque logarithme par sa valeur approchée dans le changement de base, puis on arrondit au centième.")];
  }
}

function calcul(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] | null {
  // Le quotient posé (log N et log a sont la conclusion de l'étape précédente).
  if (e.variante === "changementBase" && phase === "quotient") {
    return [f(`${cibleChangementBase(e)}=\\dfrac{${logDonneLatex(e, e.N)}}{${logDonneLatex(e, e.a)}}\\approx\\dfrac{${milliemesLatex(e.logNMilli)}}{${milliemesLatex(e.logAMilli)}}`)];
  }
  return null;
}

function piege(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): FragmentConsigne[] | null {
  switch (e.variante) {
    case "encadrer":
      return phase === "encadrement"
        ? [t("Donner les puissances au lieu de leurs exposants : "), f(logAN(e.a, e.N)), t(` est compris entre ${e.k} et ${e.k + 1}, pas entre ${entierTexte(Math.pow(e.a, e.k))} et ${entierTexte(Math.pow(e.a, e.k + 1))}.`)]
        : null;
    case "comparer":
      if (phase !== "verdict") return null;
      if (e.baseInf1) return [t("Oublier que le logarithme d'une base inférieure à 1 est décroissant : l'encadrement des puissances change de sens et les logarithmes d'arguments plus grands que 1 sont négatifs.")];
      if (e.type === "lies") return [t("Conclure à partir d'encadrements identiques : ils ne permettent pas de comparer ; il faut ramener les deux logarithmes à une même base.")];
      return [t("Comparer seulement les arguments (ou seulement les bases) : un logarithme dépend des deux à la fois.")];
    case "ranger":
      if (phase !== "situer") return null;
      return termes(e).some((te) => te.plancher < 0)
        ? [t("Pour un nombre négatif, l'entier inférieur est le plus négatif : par exemple "), f("-3<-2{,}4<-2.")]
        : [t("Oublier qu'une base inférieure à 1 rend le logarithme décroissant.")];
    case "changementBase":
      return phase === "quotient" ? [t("Inverser le quotient, ou écrire une différence "), f(`${logDonneLatex(e, e.N)}-${logDonneLatex(e, e.a)}`), t(" : le changement de base donne un QUOTIENT, argument au numérateur.")] : null;
  }
}

function lignesEtape(e: ExerciceComparerEncadrerLog, phase: PhaseComparerEncadrerLog): EtapeCorrection[] {
  const sq = lettre(e, phase);
  const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion: sq, fragments: methode(e, phase) }];
  const c = calcul(e, phase);
  if (c) lignes.push({ label: "Calcul", sousQuestion: sq, fragments: c });
  lignes.push({ label: "Conclusion", sousQuestion: sq, fragments: [...reponseEtape(e, phase), t(".")] });
  const p = piege(e, phase);
  if (p) lignes.push({ label: "Piège", sousQuestion: sq, fragments: p });
  return lignes;
}

function correctionDetaillee(e: ExerciceComparerEncadrerLog): EtapeCorrection[] {
  return phasesExercice(e).flatMap((phase) => lignesEtape(e, phase));
}

/** Étoiles fixées par la variante (jamais par le verdict). */
function difficulte(e: ExerciceComparerEncadrerLog): 1 | 2 | 3 {
  return e.variante === "encadrer" ? 1 : 2;
}

// ============================================================================
// Barème (somme 4).
// ============================================================================

function bareme(e: ExerciceComparerEncadrerLog): BaremeExercice {
  const r = (phase: PhaseComparerEncadrerLog) => reponseEtape(e, phase);
  let criteres: CritereBareme[] = [];
  let erreursFrequentes: ErreurFrequente[] = [];
  let reponsesAcceptees: FragmentConsigne[][] = [];
  switch (e.variante) {
    case "encadrer":
      criteres = [
        { sousQuestion: "a", critere: [t("Puissances consécutives qui encadrent le nombre : "), ...r("puissances")], points: 2 },
        { sousQuestion: "b", critere: [t("Encadrement du logarithme, justifié par la croissance : "), ...r("encadrement")], points: 2 },
      ];
      erreursFrequentes = [
        { description: [t("Puissances recopiées comme bornes du logarithme (au lieu des exposants)")], cout: "0 pt sur b)" },
        { description: [t("Croissance du logarithme non citée")], cout: "−0,5" },
      ];
      reponsesAcceptees = [[t("Puissances écrites sous forme de puissances ou de valeurs")]];
      break;
    case "comparer":
      criteres = [
        { sousQuestion: "a", critere: [t("Encadrement de A : "), ...r("encadrerA")], points: 1 },
        { sousQuestion: "b", critere: [t("Encadrement de B : "), ...r("encadrerB")], points: 1 },
        { sousQuestion: "c", critere: [t("Comparaison justifiée : "), ...r("verdict")], points: 2 },
      ];
      erreursFrequentes = [
        ...(e.baseInf1 ? [{ description: [t("Sens de l'encadrement non inversé pour une base inférieure à 1")], cout: "0 pt sur a) et b)" }] : []),
        { description: [t("Conclusion tirée d'encadrements identiques, sans changement de base")], cout: "0 pt sur c)" },
        { description: [t("Conclusion sans justification (valeurs « lues » à la calculatrice)")], cout: "0 pt sur c)" },
      ];
      reponsesAcceptees = [[t("Tout encadrement plus fin correctement justifié, ou un changement de base direct")]];
      break;
    case "ranger":
      criteres = [
        { sousQuestion: "a", critere: [t("Encadrement de chaque logarithme : "), ...r("situer")], points: 2.5 },
        { sousQuestion: "b", critere: [t("Ordre croissant : "), ...r("ordre")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Erreur de signe sur l'encadrement d'un logarithme négatif")], cout: "−0,5 par logarithme" },
        { description: [t("Ordre donné sans aucun encadrement")], cout: "0 pt sur a)" },
      ];
      reponsesAcceptees = [[t("Ordre écrit avec des inégalités ou en liste numérotée")]];
      break;
    case "changementBase":
      criteres = [
        { sousQuestion: "a", critere: [t("Changement de base : "), ...r("formule")], points: 1 },
        { sousQuestion: "b", critere: [t("Valeurs approchées par les propriétés : "), ...r("valeurs")], points: 1.5 },
        { sousQuestion: "c", critere: [t("Quotient arrondi au centième : "), ...r("quotient")], points: 1.5 },
      ];
      erreursFrequentes = [
        { description: [t("Quotient inversé ou remplacé par une différence")], cout: "0 pt sur a) et c)" },
        ...(e.N.p < 0 || e.N.q < 0
          ? [{ description: [t("Logarithmes d'un quotient additionnés au lieu d'être soustraits")], cout: "−1" }]
          : [{ description: [t("Logarithme d'un produit confondu avec le produit des logarithmes")], cout: "−1" }]),
        { description: [t("Arrondi incorrect ou précision non respectée")], cout: "−0,5" },
      ];
      reponsesAcceptees = [[t("Résultat à "), f("\\pm 0{,}01"), t(" près si la démarche est correcte")]];
      break;
  }
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes, reponsesAcceptees };
}

export const adaptateurEvaluationComparerEncadrerLog: AdaptateurFeuilleExercices<ExerciceComparerEncadrerLog> = {
  titreDocument: "Comparer et encadrer des logarithmes sans calculatrice — Évaluation",
  nomFichierBase: "comparer-encadrer-logarithmes",
  genererInstance: genererExerciceComparerEncadrerLog,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteComparerEncadrerLog),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
  profilInstance: profilComparerEncadrerLog,
};
