import type { ExercicePrincipalSuiteGeometrique, ExerciceSuiteGeometrique, FractionQ } from "../../core5e/suitesGeometriques.types";
import type { PhaseSuiteGeometrique } from "../../moteur5e/typesSuiteGeometrique";
import { ordreComplet } from "../../moteur5e/typesSuiteGeometrique";
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
import {
  consigneGenerale,
  consignePhase,
  formatTermesDonneesLatex,
  formatTermesReponseAttendueSuiteGeometrique,
  labelsCalculerTermesAlgebrique,
  noteAideNiveau1,
  texteAideNiveau1,
  texteAideNiveau2,
} from "../../ui5e/formatSuiteGeometrique";
import { diviserFractionQ, entierVersFractionQ, puissanceFractionQ, sommeInfinieExisteQ, sommeInfinieQ } from "./fraction";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteGeometrique } from "./index";
import type { FamilleSuiteGeometriqueId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteGeometrique>` pour 5gen15 (Suites
 * géométriques, formule générale et termes) — feuille d'exercices et évaluation
 * (`.claude/rules/feuilles-evaluations.md`), miroir de 5gen14.
 *
 * - `construireEnonce` : UNE question par écran (`ordreComplet`, y compris la 2e suite quand q a
 *   deux valeurs : seulement u₁ et la formule) — ce sont les étapes du corrigé. Consignes de l'écran
 *   (`consignePhase`), complétées des indices des termes demandés et débarrassées des tournures
 *   d'écran (« utilise "n" comme variable », « trouvée à l'écran précédent (voir ci-dessous) »).
 * - `enoncePapier` : données + UNE consigne globale qui dit tout ce qu'il faut trouver. Quand q peut
 *   avoir deux valeurs (combos u₁/uₚ et uₚ/uₘ), la MÊME phrase sert dans les deux cas (« la ou les
 *   valeurs possibles… s'il y en a deux, celle de raison positive ») : elle ne trahit pas le cas.
 *
 * Valeurs : `formatTermesReponseAttendueSuiteGeometrique`, `formatTermesDonneesLatex`,
 * `texteAideNiveau1/2` (mêmes fonctions que l'écran) et l'arithmétique exacte de `fraction.ts` pour
 * les calculs substitués intermédiaires.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function u(indice: number | string): string {
  return `u_{${indice}}`;
}
function s(indice: number | string): string {
  return `S_{${indice}}`;
}
function fractionLatex(f: FractionQ): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}
/** Valeur négative entre parenthèses dans un calcul substitué. */
function jeton(f: FractionQ): string {
  return f.num < 0 ? `\\left(${fractionLatex(f)}\\right)` : fractionLatex(f);
}
function puissance(q: FractionQ, exposant: number | string): string {
  return `\\left(${fractionLatex(q)}\\right)^{${exposant}}`;
}
function virgules(l: string): string {
  return l.replace(/(\d)\.(\d)/g, "$1{,}$2");
}
function reponse(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string[] {
  return formatTermesReponseAttendueSuiteGeometrique(exercice, phase).map(virgules);
}
function listeFr<T>(elements: T[][], sep: T, dernier: T): T[] {
  return elements.flatMap((e, i) => [...(i === 0 ? [] : [i === elements.length - 1 ? dernier : sep]), ...e]);
}

/** Phase sans le suffixe de branche (« termesProchesB1 » → « termesProches »). */
type PhaseBase = "trouverQ" | "trouverU1" | "formuleGenerale" | "termesProches" | "termeEloigne" | "sommeSn" | "sommeInfinie" | Exclude<PhaseSuiteGeometrique, `${string}B1` | `${string}B2`>;
function base(phase: PhaseSuiteGeometrique): PhaseBase {
  return phase.replace(/B[12]$/, "") as PhaseBase;
}
function branche(exercice: ExercicePrincipalSuiteGeometrique, phase: PhaseSuiteGeometrique) {
  return exercice.branches[phase.endsWith("B2") ? 1 : 0];
}
/** « (1re suite, q > 0) » — même texte que l'écran, signe lu sur la branche. */
function suffixe(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): string {
  if (exercice.famille !== "principal" || (!phase.endsWith("B1") && !phase.endsWith("B2"))) return "";
  return ` (${phase.endsWith("B1") ? "1re" : "2e"} suite, q ${branche(exercice, phase).q.num > 0 ? ">" : "<"} 0)`;
}
function principal(exercice: ExerciceSuiteGeometrique): ExercicePrincipalSuiteGeometrique {
  if (exercice.famille !== "principal") throw new Error("famille hors 'principal'");
  return exercice;
}


// ============================================================================
// Étapes (une par écran) et énoncé papier.
// ============================================================================

function consigneEtape(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): FragmentConsigne[] {
  const suf = suffixe(exercice, phase);
  switch (base(phase)) {
    case "formuleGenerale":
      return [texte(`Exprime la formule générale uₙ, avec u₁ et q substitués${suf}.`)];
    case "termesProches":
      return [texte("Calcule les termes "), latex(principal(exercice).indicesTermesProches.map((n) => u(n)).join(",\\ ")), texte(`${suf}.`)];
    case "termeEloigne":
      return [texte("Calcule le terme "), latex(u(principal(exercice).indiceTermeEloigne)), texte(`${suf}.`)];
    case "sommeSn": {
      const n = principal(exercice).indiceSn;
      return [texte("Calcule la somme "), latex(s(n)), texte(` des ${n} premiers termes${suf}.`)];
    }
    case "sommeInfinie":
      return [texte(`Cette suite admet-elle une somme infinie${suf} ? Si oui, calcule-la.`)];
    case "poserEquationAlgebrique":
      if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "B") {
        return [texte("Pose l'équation qui permet de déterminer x, sachant que "), latex(`${s(exercice.n)}=${fractionLatex(exercice.k)}`), texte(" (valeur obtenue à l'étape précédente).")];
      }
      return [texte(consignePhase(exercice, phase))];
    case "resoudreXAlgebrique":
      return [texte("Résous cette équation : détermine x.")];
    case "calculerTermesAlgebrique": {
      const noms = labelsCalculerTermesAlgebrique(exercice).map((l) => l.replace(/=$/, ""));
      return [texte("Déduis-en la valeur de "), ...listeFr(noms.map((n) => [latex(n)]), texte(", "), texte(" et ")), texte(" en remplaçant x par sa valeur.")];
    }
    case "poserEquationRangN":
      return exercice.famille === "algebriqueRangN"
        ? [texte("Pose l'équation qui traduit que "), latex(`u_n=${exercice.k}`), texte(" (l'inconnue est le rang n).")]
        : [texte(consignePhase(exercice, phase))];
    case "resoudreRangN":
      return [texte("Résous cette équation par réduction à la même base : n est un entier positif.")];
    default:
      return [texte(consignePhase(exercice, phase))];
  }
}

function construireEnonceSuiteGeometrique(exercice: ExerciceSuiteGeometrique): SectionExercice {
  return {
    enteteFragments: [texte(`${consigneGenerale(exercice)} `), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))],
    questions: ordreComplet(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })),
  };
}

function donneesFr(exercice: ExerciceSuiteGeometrique): FragmentConsigne[] {
  return listeFr(formatTermesDonneesLatex(exercice).map((d) => [latex(d)]), texte(", "), texte(" et "));
}

/** Ce qu'il faut trouver (famille « principal ») — une phrase, indices compris. */
function demandePrincipal(exercice: ExercicePrincipalSuiteGeometrique): FragmentConsigne[] {
  const combo = exercice.donnees.combo;
  const calculs: FragmentConsigne[] = [
    texte("les termes "),
    latex(exercice.indicesTermesProches.map((n) => u(n)).join(",\\ ")),
    texte(", le terme "),
    latex(u(exercice.indiceTermeEloigne)),
    texte(", la somme "),
    latex(s(exercice.indiceSn)),
    texte(` de ses ${exercice.indiceSn} premiers termes et, si elle existe, sa somme infinie. Donne les valeurs exactes, ou arrondies au centième.`),
  ];
  if (combo === "u1_up" || combo === "up_um") {
    return [
      texte(`Détermine la ou les valeurs possibles de la raison q, puis ${combo === "up_um" ? "le premier terme u₁ et " : ""}la formule générale uₙ de chaque suite possible. Pour la suite obtenue (s'il y en a deux : celle de raison positive), calcule ensuite `),
      ...calculs,
    ];
  }
  return [texte(`Détermine ${combo === "q_up" ? "son premier terme u₁ et " : ""}sa formule générale uₙ, puis calcule `), ...calculs];
}

function enoncePapierSuiteGeometrique(exercice: ExerciceSuiteGeometrique): EnoncePapier {
  let entete: FragmentConsigne[];
  switch (exercice.famille) {
    case "principal":
      entete = [texte("On considère une suite géométrique telle que "), ...donneesFr(exercice), texte(". "), ...demandePrincipal(exercice)];
      break;
    case "algebriqueRangN":
      entete = [
        texte("Une suite géométrique est telle que "),
        latex(`${u(1)}=${exercice.u1}`),
        texte(" et "),
        latex(`q=${fractionLatex(exercice.q)}`),
        texte(". Détermine le rang n du terme qui vaut "),
        latex(`${exercice.k}`),
        texte("."),
      ];
      break;
    default:
      entete = [texte(`${consigneGenerale(exercice)} On donne `), ...donneesFr(exercice), texte(". Donne les valeurs exactes.")];
  }
  return { section: { enteteFragments: entete, questions: [] } };
}

// ============================================================================
// Difficulté, réponse brève, corrigé détaillé, barème.
// ============================================================================

/** ★ u₁ et q entiers donnés ; ★★ une grandeur à retrouver, fractions ; ★★★ deux valeurs de q,
 * inconnue x, rang n par réduction à la même base. */
function difficulteSuiteGeometrique(exercice: ExerciceSuiteGeometrique): 1 | 2 | 3 {
  if (exercice.famille !== "principal") return 3;
  if (exercice.statutQ === "double") return 3;
  const { combo } = exercice.donnees;
  if (combo === "direct") return exercice.branches[0].u1.den === 1 && exercice.branches[0].q.den === 1 ? 1 : 2;
  return 2;
}

function reponseBreveSuiteGeometrique(exercice: ExerciceSuiteGeometrique): FragmentConsigne[] {
  const parties = ordreComplet(exercice)
    .filter((phase) => phase !== "poserEquationAlgebrique" && phase !== "poserEquationRangN")
    .map((phase): FragmentConsigne[] => {
      const r = reponse(exercice, phase);
      if (base(phase) === "sommeInfinie" && r[0].startsWith("\\text")) return [texte(`pas de somme infinie${suffixe(exercice, phase)}`)];
      return [latex(r.join(",\\ ")), ...(suffixe(exercice, phase) ? [texte(suffixe(exercice, phase))] : [])];
    });
  return listeFr(parties, texte(" ; "), texte(" ; "));
}

/** Calcul substitué d'une étape (`null` : la conclusion suffit). */
function calculEtape(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): FragmentConsigne[] | null {
  if (exercice.famille === "principal") {
    const { u1, q } = branche(exercice, phase);
    switch (base(phase)) {
      case "trouverQ": {
        const d = exercice.donnees;
        const k = exercice.k as number;
        const quotient = puissanceFractionQ(exercice.branches[0].q, k);
        let rapport: string;
        if (d.combo === "u1_up") rapport = `\\dfrac{${u(d.up.indice)}}{${u(1)}}`;
        else if (d.combo === "up_um") rapport = d.um.indice > d.up.indice ? `\\dfrac{${u(d.um.indice)}}{${u(d.up.indice)}}` : `\\dfrac{${u(d.up.indice)}}{${u(d.um.indice)}}`;
        else return null;
        return [
          latex(`q^{${k}}=${rapport}=${fractionLatex(quotient)}`),
          texte(k % 2 === 0 ? ` : l'exposant ${k} est pair, q a deux valeurs opposées.` : ` : l'exposant ${k} est impair, q a une seule valeur, du signe du quotient.`),
        ];
      }
      case "trouverU1":
      case "termesProches":
      case "sommeSn": {
        const l = texteAideNiveau2(exercice, phase);
        if (!l) return null;
        if (base(phase) === "trouverU1") return [latex(`${l}=${fractionLatex(u1)}`)];
        return [latex(l)];
      }
      case "termeEloigne": {
        const n = exercice.indiceTermeEloigne;
        return [latex(`${u(n)}=${jeton(u1)}\\times ${puissance(q, n - 1)}`)];
      }
      case "sommeInfinie": {
        const qAbs = { num: Math.abs(q.num), den: q.den };
        if (!sommeInfinieExisteQ(q)) return [latex(`|q|=${fractionLatex(qAbs)}\\geqslant 1`), texte(" : la somme infinie n'existe pas.")];
        const sInf = sommeInfinieQ(u1, q) as FractionQ;
        return [latex(`|q|=${fractionLatex(qAbs)}<1`), texte(" : la somme infinie existe, "), latex(`S_\\infty=\\dfrac{${fractionLatex(u1)}}{1-${jeton(q)}}=${fractionLatex(sInf)}`), texte(".")];
      }
      default:
        return null;
    }
  }
  if (exercice.famille === "algebriqueRangN" && phase === "resoudreRangN") {
    const { u1, q, k, m, n } = exercice;
    const quotient = diviserFractionQ(entierVersFractionQ(k), entierVersFractionQ(u1));
    // Quotient écrit réduit seulement s'il diffère de k/u₁ tel quel.
    const reduit = quotient.num === k && quotient.den === u1 ? "" : `=${fractionLatex(quotient)}`;
    return [latex(`${puissance(q, "n-1")}=\\dfrac{${k}}{${u1}}${reduit}=${puissance(q, m)}\\ \\Rightarrow\\ n-1=${m}\\ \\Rightarrow\\ n=${n}`)];
  }
  if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "B" && phase === "calculerSn") {
    const { u1, q, n, k } = exercice;
    return [latex(`${s(n)}=${u1}\\times\\dfrac{1-${puissance(q, n)}}{1-${jeton(q)}}=${fractionLatex(k)}`)];
  }
  return null;
}

function piege(exercice: ExerciceSuiteGeometrique): { phase: PhaseSuiteGeometrique; fragments: FragmentConsigne[] } {
  switch (exercice.famille) {
    case "principal": {
      const combo = exercice.donnees.combo;
      if (combo === "u1_up" || combo === "up_um") {
        return (exercice.k as number) % 2 === 0
          ? { phase: "trouverQ", fragments: [texte("Une puissance paire efface le signe : "), latex("q^{k}=a"), texte(" (k pair, a > 0) a DEUX solutions opposées. Oublier la valeur négative fait perdre une suite.")] }
          : { phase: "trouverQ", fragments: [texte("Une puissance impaire garde le signe : q a le signe du quotient, une seule valeur.")] };
      }
      const formule = ordreComplet(exercice).find((p) => base(p) === "formuleGenerale") as PhaseSuiteGeometrique;
      return { phase: formule, fragments: [texte("Le terme de rang n est "), latex("u_1\\times q^{n-1}"), texte(", pas "), latex("u_1\\times q^{n}"), texte(" : de u₁ à uₙ, on multiplie par q seulement (n − 1) fois.")] };
    }
    case "algebriqueTermeGeneral":
      return { phase: "poserEquationAlgebrique", fragments: [texte("La puissance de q multiplie TOUTE l'expression de uₚ(x) : parenthèses indispensables.")] };
    case "algebriqueSommeSn":
      return exercice.sousCas === "B"
        ? { phase: "poserEquationAlgebrique", fragments: [texte("On égale l'expression en x à la valeur de Sₙ calculée avec u₁ et q.")] }
        : { phase: "poserEquationAlgebrique", fragments: [texte("u₁(x) multiplie toute la fraction "), latex("\\dfrac{1-q^n}{1-q}"), texte(" : parenthèses indispensables.")] };
    case "algebriqueRangN":
      return { phase: "resoudreRangN", fragments: [texte("On compare les exposants une fois les deux membres écrits comme puissances de la MÊME base ; l'exposant obtenu est n − 1, pas n.")] };
  }
}

const METHODE_SANS_FORMULE: Partial<Record<PhaseSuiteGeometrique, string>> = {
  resoudreXAlgebrique: "On développe, on regroupe les termes en x d'un côté et les constantes de l'autre, puis on isole x.",
  calculerTermesAlgebrique: "On remplace x par sa valeur dans chaque expression.",
  resoudreRangN: "On divise par u₁, on écrit le quotient comme une puissance de q, puis on compare les exposants.",
};

function correctionDetailleeSuiteGeometrique(exercice: ExerciceSuiteGeometrique): EtapeCorrection[] {
  const p = piege(exercice);
  let formulePrecedente = "";
  return ordreComplet(exercice).flatMap((phase, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const lignes: EtapeCorrection[] = [];
    const methode = METHODE_SANS_FORMULE[phase];
    if (methode) {
      lignes.push({ label: "Méthode", sousQuestion, fragments: [texte(methode)] });
    } else {
      // Formule de l'aide 1 de l'écran ; pas répétée d'une étape à la suivante.
      // L'aide de l'écran du rang n parle de « k », que l'énoncé papier ne nomme pas.
      const note = phase === "poserEquationRangN" ? "On écrit que uₙ vaut la valeur donnée :" : noteAideNiveau1(exercice, phase);
      const formule = texteAideNiveau1(exercice, phase);
      if (formule !== formulePrecedente) lignes.push({ label: "Méthode", sousQuestion, fragments: [...(note ? [texte(`${note} `)] : []), latex(formule)] });
      formulePrecedente = formule;
    }
    const calcul = calculEtape(exercice, phase);
    if (calcul) lignes.push({ label: "Calcul", sousQuestion, fragments: calcul.map((f) => (f.type === "latex" ? { ...f, valeur: virgules(f.valeur) } : f)) });
    const r = reponse(exercice, phase);
    lignes.push({
      label: "Conclusion",
      sousQuestion,
      fragments: base(phase) === "sommeInfinie" && r[0].startsWith("\\text") ? [texte("Pas de somme infinie.")] : [latex(r.join(",\\quad "))],
    });
    if (p.phase === phase) lignes.push({ label: "Piège", sousQuestion, fragments: p.fragments });
    return lignes;
  });
}

function critere(sousQuestion: string, fragments: FragmentConsigne[], points: number): CritereBareme {
  return { sousQuestion, critere: fragments, points };
}

function baremeSuiteGeometrique(exercice: ExerciceSuiteGeometrique): BaremeExercice {
  const liste = ordreComplet(exercice);
  const lettre = (pred: (p: PhaseSuiteGeometrique) => boolean) => LETTRES[liste.findIndex(pred)];
  const criteres: CritereBareme[] = [];
  const erreurs: ErreurFrequente[] = [];
  if (exercice.famille === "principal") {
    const trouver = liste.filter((ph) => ph === "trouverQ" || base(ph) === "trouverU1");
    const double = exercice.statutQ === "double";
    if (trouver.length > 0) {
      const libelle = liste.includes("trouverQ") ? (double ? "Les deux valeurs de q" : "Raison q") + (trouver.some((t) => base(t) === "trouverU1") ? " et premier terme u₁" : "") : "Premier terme u₁";
      criteres.push(critere(LETTRES[liste.indexOf(trouver[0])], [texte(libelle)], 1));
    }
    criteres.push(critere(lettre((ph) => base(ph) === "formuleGenerale"), [texte(double ? "Formule générale de chaque suite" : "Formule générale uₙ")], 1));
    criteres.push(critere(lettre((ph) => base(ph) === "termesProches"), [texte("Termes consécutifs et terme éloigné")], trouver.length > 0 ? 1 : 1.5));
    criteres.push(critere(lettre((ph) => base(ph) === "sommeSn"), [texte("Somme "), latex(s(exercice.indiceSn)), texte(" et somme infinie (existence justifiée par |q|)")], trouver.length > 0 ? 1 : 1.5));
    erreurs.push({ description: [texte("Formule "), latex("u_1\\times q^{n}"), texte(" au lieu de "), latex("u_1\\times q^{n-1}")], cout: "0 pt sur la formule, suite notée sans double pénalité" });
    if (double) erreurs.push({ description: [texte("Oublier la valeur négative de q")], cout: "−1" });
    const qPrincipal = exercice.branches[0].q;
    erreurs.push(
      sommeInfinieExisteQ(qPrincipal)
        ? { description: [texte("Somme infinie calculée sans vérifier que |q| < 1")], cout: "−0,5" }
        : { description: [texte("Donner une somme infinie alors que |q| ≥ 1")], cout: "0 pt sur la somme infinie" },
    );
  } else if (exercice.famille === "algebriqueRangN") {
    criteres.push(critere("a", [texte("Équation "), latex(reponse(exercice, "poserEquationRangN")[0])], 1.5));
    criteres.push(critere("b", [texte("Réduction à la même base et rang "), latex(reponse(exercice, "resoudreRangN")[0])], 2.5));
    erreurs.push({ description: [texte("Donner n − 1 au lieu de n")], cout: "−1" });
  } else {
    const avecSn = liste.includes("calculerSn");
    if (avecSn) criteres.push(critere(lettre((ph) => ph === "calculerSn"), [latex(reponse(exercice, "calculerSn")[0])], 1));
    criteres.push(critere(lettre((ph) => ph === "poserEquationAlgebrique"), [texte("Équation correcte en x")], avecSn ? 1 : 1.5));
    criteres.push(critere(lettre((ph) => ph === "resoudreXAlgebrique"), [latex(reponse(exercice, "resoudreXAlgebrique")[0])], avecSn ? 2 : 1.5));
    if (liste.includes("calculerTermesAlgebrique")) criteres.push(critere(lettre((ph) => ph === "calculerTermesAlgebrique"), [texte("Valeurs numériques : "), latex(reponse(exercice, "calculerTermesAlgebrique").join(",\\ "))], 1));
    erreurs.push({ description: piege(exercice).fragments, cout: "0 pt sur l'équation, suite notée sans double pénalité" });
  }
  return {
    reponseFinale: reponseBreveSuiteGeometrique(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Valeurs exactes (fractions) ou arrondies au centième")], [texte("Un résultat obtenu à partir d'une valeur déjà arrondie, s'il ne s'écarte que de l'arrondi propagé")]],
  };
}

function construireCorrectionSuiteGeometrique(exercice: ExerciceSuiteGeometrique): BlocCorrection[] {
  return ordreComplet(exercice).map((phase): BlocCorrection => ({ type: "paragraphe", fragments: [latex(reponse(exercice, phase).join(" \\quad "))] }));
}

export const adaptateurEvaluationSuitesGeometriques: AdaptateurFeuilleExercices<ExerciceSuiteGeometrique> = {
  titreDocument: "Suites géométriques, formule générale et termes — Évaluation",
  nomFichierBase: "suites-geometriques",
  genererInstance: genererExerciceSuiteGeometrique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleSuiteGeometriqueId),
  construireEnonce: construireEnonceSuiteGeometrique,
  construireCorrection: construireCorrectionSuiteGeometrique,
  difficulte: difficulteSuiteGeometrique,
  reponseBreve: reponseBreveSuiteGeometrique,
  correctionDetaillee: correctionDetailleeSuiteGeometrique,
  bareme: baremeSuiteGeometrique,
  enoncePapier: enoncePapierSuiteGeometrique,
  dureeMinutes: 12,
};
