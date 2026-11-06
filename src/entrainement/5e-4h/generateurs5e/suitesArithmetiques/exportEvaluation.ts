import type {
  ExerciceCoherenceSuiteArithmetique,
  ExercicePrincipalSuiteArithmetique,
  ExerciceSuiteArithmetique,
} from "../../core5e/suitesArithmetiques.types";
import type { PhaseSuiteArithmetique } from "../../moteur5e/typesSuiteArithmetique";
import { ordreComplet } from "../../moteur5e/typesSuiteArithmetique";
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
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  labelsCalculerTermesAlgebrique,
  noteAideNiveau1,
  texteAideNiveau1,
  texteAideNiveau2,
} from "../../ui5e/formatSuiteArithmetique";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceSuiteArithmetique } from "./index";
import type { FamilleSuiteArithmetiqueId } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSuiteArithmetique>` pour 5gen14 (Suites
 * arithmétiques, formule générale et termes) — feuille d'exercices et évaluation
 * (`.claude/rules/feuilles-evaluations.md`).
 *
 * - `construireEnonce` : UNE question par écran de la séquence (`ordreComplet`) — ce sont les étapes
 *   du corrigé (« Étape n — consigne »). Les consignes sont celles de l'écran (`consignePhase`),
 *   complétées de ce que l'écran affichait AILLEURS (indices des termes demandés, valeur de Sₙ) et
 *   débarrassées des tournures d'écran (« utilise "n" comme variable », « trouvé à l'écran
 *   précédent »).
 * - `enoncePapier` : les données et UNE consigne globale qui dit tout ce qu'il faut trouver (indices
 *   compris) — jamais les étapes d'apprentissage (trouver r, puis u₁…).
 * - Famille « cohérence » : sur papier, le jugement puis (si cohérent) u₁ et la formule générale —
 *   la même phrase dans les deux cas, pour ne pas trahir le verdict.
 *
 * Valeurs : `formatReponseAttenduePhaseLatex`, `formatTermesDonneesLatex`, `texteAideNiveau1/2`
 * (mêmes fonctions que l'écran) ; seuls les calculs substitués intermédiaires du corrigé sont écrits
 * ici, à partir des valeurs de l'instance.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function u(indice: number | string): string {
  return `u_{${indice}}`;
}
function s(indice: number | string): string {
  return `S_{${indice}}`;
}
/** Nombre négatif entre parenthèses dans un calcul substitué. */
function par(v: number): string {
  return v < 0 ? `(${nombreLatex(v)})` : nombreLatex(v);
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Valeur exacte : entier, sinon fraction irréductible (les valeurs du générateur sont des multiples
 * exacts de 1/8 — même convention que `formatValeurExacteLatex` de l'écran). */
function nombreLatex(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  const num = Math.round(v * 8);
  const g = pgcd(num, 8);
  const n = Math.abs(num) / g;
  const d = 8 / g;
  if (d === 1) return `${num < 0 ? "-" : ""}${n}`;
  return `${num < 0 ? "-" : ""}\\dfrac{${n}}{${d}}`;
}

/** Garde-fou d'écriture belge : un éventuel point décimal d'un formateur d'écran devient une virgule. */
function virgules(l: string): string {
  return l.replace(/(\d)\.(\d)/g, "$1{,}$2");
}

function reponse(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string[] {
  return formatReponseAttenduePhaseLatex(exercice, phase).map(virgules);
}

function listeFr<T>(elements: T[][], sep: T, dernier: T): T[] {
  return elements.flatMap((e, i) => [...(i === 0 ? [] : [i === elements.length - 1 ? dernier : sep]), ...e]);
}

function avecBase(exercice: ExerciceSuiteArithmetique): ExercicePrincipalSuiteArithmetique | ExerciceCoherenceSuiteArithmetique {
  if (exercice.famille !== "principal" && exercice.famille !== "coherence") throw new Error("famille sans u₁/r");
  return exercice;
}

// ============================================================================
// Étapes (une par écran) et énoncé papier.
// ============================================================================

/** Étapes réellement demandées sur papier : la séquence de l'écran, sauf pour la famille
 * « cohérence » (jugement, puis u₁ et la formule générale si les données sont cohérentes). */
function etapes(exercice: ExerciceSuiteArithmetique): PhaseSuiteArithmetique[] {
  if (exercice.famille === "coherence") return exercice.coherent ? ["coherenceJugement", "trouverU1", "formuleGenerale"] : ["coherenceJugement"];
  return ordreComplet(exercice);
}

/** Consigne d'une étape, en version papier (voir l'en-tête de fichier). */
function consigneEtape(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): FragmentConsigne[] {
  switch (phase) {
    case "formuleGenerale":
      return [texte("Exprime la formule générale uₙ, avec u₁ et r substitués.")];
    case "termesProches": {
      const e = avecBase(exercice);
      const indices = e.indicesTermesProches as number[];
      return [texte("Calcule les termes "), latex(indices.map((n) => u(n)).join(",\\ ")), texte(".")];
    }
    case "termeEloigne":
      return [texte("Calcule le terme "), latex(u(avecBase(exercice).indiceTermeEloigne as number)), texte(".")];
    case "sommeSn": {
      const n = avecBase(exercice).indiceSn as number;
      return [texte("Calcule la somme "), latex(s(n)), texte(` des ${n} premiers termes.`)];
    }
    case "coherenceJugement":
      return [texte("Ces trois données sont-elles cohérentes ? Justifie par un calcul.")];
    case "poserEquationAlgebrique":
      if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "D") {
        return [texte("Pose l'équation qui permet de déterminer x, sachant que "), latex(`${s(exercice.n)}=${nombreLatex(exercice.k)}`), texte(" (valeur obtenue à l'étape précédente).")];
      }
      return [texte(consignePhase(exercice, phase))];
    case "resoudreXAlgebrique":
      return [texte("Résous cette équation : détermine x.")];
    case "calculerTermesAlgebrique": {
      const noms = labelsCalculerTermesAlgebrique(exercice).map((l) => l.replace(/=$/, ""));
      return [texte("Déduis-en la valeur de "), ...listeFr(noms.map((n) => [latex(n)]), texte(", "), texte(" et ")), texte(" en remplaçant x par sa valeur.")];
    }
    case "resoudreRangN":
      return [texte("Résous cette équation : n est un entier positif.")];
    default:
      return [texte(consignePhase(exercice, phase))];
  }
}

function construireEnonceSuiteArithmetique(exercice: ExerciceSuiteArithmetique): SectionExercice {
  return {
    enteteFragments: [texte(`${consigneGenerale(exercice)} `), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))],
    questions: etapes(exercice).map((phase) => ({ consigne: consigneEtape(exercice, phase) })),
  };
}

function donneesFr(exercice: ExerciceSuiteArithmetique): FragmentConsigne[] {
  return listeFr(formatTermesDonneesLatex(exercice).map((d) => [latex(d)]), texte(", "), texte(" et "));
}

/** Ce qu'il faut trouver (famille « principal ») : une phrase, indices compris. */
function demandePrincipal(exercice: ExercicePrincipalSuiteArithmetique): FragmentConsigne[] {
  const phases = ordreComplet(exercice);
  const aTrouver: FragmentConsigne[][] = [];
  for (const p of phases) {
    if (p === "trouverR") aTrouver.push([texte("sa raison r")]);
    if (p === "trouverU1") aTrouver.push([texte("son premier terme u₁")]);
  }
  aTrouver.push([texte("sa formule générale uₙ")]);
  return [
    texte("Détermine "),
    ...listeFr(aTrouver, texte(", "), texte(" et ")),
    texte(", puis calcule les termes "),
    latex(exercice.indicesTermesProches.map((n) => u(n)).join(",\\ ")),
    texte(", le terme "),
    latex(u(exercice.indiceTermeEloigne)),
    texte(" et la somme "),
    latex(s(exercice.indiceSn)),
    texte(` de ses ${exercice.indiceSn} premiers termes.`),
  ];
}

function enoncePapierSuiteArithmetique(exercice: ExerciceSuiteArithmetique): EnoncePapier {
  let entete: FragmentConsigne[];
  switch (exercice.famille) {
    case "principal":
      entete = [texte("On considère une suite arithmétique telle que "), ...donneesFr(exercice), texte(". "), ...demandePrincipal(exercice)];
      break;
    case "coherence":
      entete = [
        texte("Une suite arithmétique a pour raison "),
        latex(`r=${nombreLatex(exercice.r)}`),
        texte(", et deux de ses termes valent "),
        latex(`${u(exercice.p.indice)}=${nombreLatex(exercice.p.valeur)}`),
        texte(" et "),
        latex(`${u(exercice.q.indice)}=${nombreLatex(exercice.q.valeur)}`),
        texte(". Ces trois données sont-elles cohérentes ? Justifie par un calcul. Si elles le sont, détermine le premier terme u₁ et la formule générale uₙ de la suite."),
      ];
      break;
    case "algebriqueRangN":
      entete = [
        texte("Une suite arithmétique est telle que "),
        latex(`${u(1)}=${nombreLatex(exercice.u1)}`),
        texte(" et "),
        latex(`r=${nombreLatex(exercice.r)}`),
        texte(". Détermine le rang n du terme qui vaut "),
        latex(nombreLatex(exercice.k)),
        texte("."),
      ];
      break;
    case "algebriqueTermeGeneral": {
      // Termes réels plutôt que la phrase générique « uₚ et uₙ » de l'écran.
      const [termeP, termeN, raison] = formatTermesDonneesLatex(exercice);
      entete = [
        texte("Dans une suite arithmétique de raison "),
        latex(raison),
        texte(", deux termes sont donnés en fonction de x : "),
        latex(termeP),
        texte(" et "),
        latex(termeN),
        texte(". Détermine x, puis la valeur de ces deux termes."),
      ];
      break;
    }
    default:
      entete = [texte(`${consigneGenerale(exercice)} On donne `), ...donneesFr(exercice), texte(".")];
  }
  return { section: { enteteFragments: entete, questions: [] } };
}

// ============================================================================
// Difficulté, réponse brève, corrigé détaillé, barème.
// ============================================================================

/** ★ données u₁ et r directes ; ★★ une ou deux grandeurs à retrouver d'abord, jugement de
 * cohérence, rang n ; ★★★ inconnue x (équation à poser avec une somme ou une relation entre termes). */
function difficulteSuiteArithmetique(exercice: ExerciceSuiteArithmetique): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "principal":
      return exercice.donnees.combo === "direct" ? 1 : 2;
    case "coherence":
    case "algebriqueRangN":
      return 2;
    default:
      return 3;
  }
}

function conclusionCoherence(exercice: ExerciceCoherenceSuiteArithmetique): FragmentConsigne[] {
  const { p, q, r } = exercice;
  const ecart = q.valeur - p.valeur;
  const attendu = (q.indice - p.indice) * r;
  return [
    latex(`${u(q.indice)}-${u(p.indice)}=${nombreLatex(ecart)}`),
    texte(exercice.coherent ? " et " : " mais "),
    latex(`(${q.indice}-${p.indice})\\times ${par(r)}=${nombreLatex(attendu)}`),
    texte(exercice.coherent ? " : les données sont cohérentes." : " : les données sont incohérentes."),
  ];
}

function reponseBreveSuiteArithmetique(exercice: ExerciceSuiteArithmetique): FragmentConsigne[] {
  // L'équation posée n'est pas un résultat : la réponse brève ne garde que les valeurs.
  const parties = etapes(exercice)
    .filter((phase) => phase !== "poserEquationAlgebrique" && phase !== "poserEquationRangN")
    .map((phase): FragmentConsigne[] =>
      phase === "coherenceJugement" ? [texte(exercice.famille === "coherence" && exercice.coherent ? "données cohérentes" : "données incohérentes")] : [latex(reponse(exercice, phase).join(",\\ "))],
    );
  return listeFr(parties, texte(" ; "), texte(" ; "));
}

/** Calcul substitué d'une étape (`null` : la conclusion suffit). */
function calculEtape(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): string | null {
  if (exercice.famille === "principal" || exercice.famille === "coherence") {
    const { u1, r } = exercice.base;
    switch (phase) {
      case "trouverR": {
        if (exercice.famille !== "principal") return null;
        const d = exercice.donnees;
        if (d.combo === "u1_up") return `r=\\dfrac{${nombreLatex(d.up.valeur)}-${par(u1)}}{${d.up.indice}-1}=${nombreLatex(r)}`;
        if (d.combo === "up_uq") return `r=\\dfrac{${nombreLatex(d.uq.valeur)}-${par(d.up.valeur)}}{${d.uq.indice}-${d.up.indice}}=${nombreLatex(r)}`;
        if (d.combo === "un_sn") return `r=\\dfrac{${nombreLatex(d.un.valeur)}-${par(u1)}}{${d.un.indice}-1}=${nombreLatex(r)}`;
        return null;
      }
      case "trouverU1": {
        if (exercice.famille === "coherence") return `${u(1)}=${nombreLatex(exercice.p.valeur)}-(${exercice.p.indice}-1)\\times ${par(r)}=${nombreLatex(u1)}`;
        const d = exercice.donnees;
        if (d.combo === "un_sn") return `${u(1)}=\\dfrac{2\\times ${par(d.sn)}}{${d.un.indice}}-${par(d.un.valeur)}=${nombreLatex(u1)}`;
        if (d.combo === "r_up" || d.combo === "up_uq") return `${u(1)}=${nombreLatex(d.up.valeur)}-(${d.up.indice}-1)\\times ${par(r)}=${nombreLatex(u1)}`;
        return null;
      }
      case "termesProches": {
        const [a] = exercice.indicesTermesProches as number[];
        return `${u(a)}=${nombreLatex(u1)}+(${a}-1)\\times ${par(r)}=${nombreLatex(u1 + (a - 1) * r)}`;
      }
      case "termeEloigne": {
        const n = exercice.indiceTermeEloigne as number;
        return `${u(n)}=${nombreLatex(u1)}+(${n}-1)\\times ${par(r)}=${nombreLatex(u1 + (n - 1) * r)}`;
      }
      case "sommeSn": {
        const n = exercice.indiceSn as number;
        return `${s(n)}=\\dfrac{${n}}{2}\\left(2\\times ${par(u1)}+(${n}-1)\\times ${par(r)}\\right)=${nombreLatex((n / 2) * (2 * u1 + (n - 1) * r))}`;
      }
      default:
        return null;
    }
  }
  if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "D" && phase === "calculerSn") {
    const { u1, r, n, k } = exercice;
    return `${s(n)}=\\dfrac{${n}}{2}\\left(2\\times ${par(u1)}+(${n}-1)\\times ${par(r)}\\right)=${nombreLatex(k)}`;
  }
  if (exercice.famille === "algebriqueRangN" && phase === "resoudreRangN") {
    const { u1, r, k, n } = exercice;
    return `(n-1)\\times ${par(r)}=${nombreLatex(k)}-${par(u1)}\\ \\Rightarrow\\ n-1=${nombreLatex((k - u1) / r)}\\ \\Rightarrow\\ n=${n}`;
  }
  return null;
}

/** La ligne « Piège » de l'exercice : l'étape où elle se place et son texte. */
function piege(exercice: ExerciceSuiteArithmetique): { phase: PhaseSuiteArithmetique; fragments: FragmentConsigne[] } {
  switch (exercice.famille) {
    case "principal":
      return { phase: "formuleGenerale", fragments: [texte("Le terme de rang n est "), latex("u_1+(n-1)r"), texte(", pas "), latex("u_1+nr"), texte(" : de u₁ à uₙ, on ajoute r seulement (n − 1) fois.")] };
    case "coherence":
      return { phase: "coherenceJugement", fragments: [texte("On compare l'écart des deux termes à "), latex("(q-p)\\times r"), texte(" — l'écart des rangs multiplié par r —, pas à r seul.")] };
    case "algebriqueTermeGeneral":
      return { phase: "poserEquationAlgebrique", fragments: [texte("Entre "), latex(u(exercice.p)), texte(" et "), latex(u(exercice.n)), texte(` on ajoute r (${exercice.n} − ${exercice.p}) fois : `), latex(`u_n=u_p+(n-p)\\times r`), texte(".")] };
    case "algebriqueSommeSn":
      return exercice.sousCas === "B" || exercice.sousCas === "C"
        ? { phase: "poserEquationAlgebrique", fragments: [texte("Les parenthèses autour de r(x) sont indispensables : (n − 1) multiplie aussi son terme constant.")] }
        : exercice.sousCas === "D"
          ? { phase: "poserEquationAlgebrique", fragments: [texte("On égale l'expression en x à la valeur de Sₙ calculée avec u₁ et r — pas à u₁ ni à r.")] }
          : { phase: "poserEquationAlgebrique", fragments: [texte("Dans "), latex("2u_1"), texte(", le facteur 2 multiplie TOUTE l'expression de u₁(x).")] };
    case "algebriqueRangN":
      return { phase: "resoudreRangN", fragments: [texte("On trouve d'abord n − 1 : ne pas oublier d'ajouter 1 pour obtenir le rang n.")] };
  }
}

/** Étapes dont la méthode est une manipulation (pas une formule du cours). */
const METHODE_SANS_FORMULE: Partial<Record<PhaseSuiteArithmetique, string>> = {
  resoudreXAlgebrique: "On développe, on regroupe les termes en x d'un côté et les constantes de l'autre, puis on isole x.",
  calculerTermesAlgebrique: "On remplace x par sa valeur dans chaque expression.",
  resoudreRangN: "On isole (n − 1), puis n.",
};

function correctionDetailleeSuiteArithmetique(exercice: ExerciceSuiteArithmetique): EtapeCorrection[] {
  const p = piege(exercice);
  let formulePrecedente = "";
  return etapes(exercice).flatMap((phase, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const lignes: EtapeCorrection[] = [];
    const methode = METHODE_SANS_FORMULE[phase];
    if (methode) {
      lignes.push({ label: "Méthode", sousQuestion, fragments: [texte(methode)] });
    } else {
      // La formule de l'aide 1 de l'écran ; pas répétée d'une étape à la suivante.
      const note = noteAideNiveau1(exercice, phase);
      const formule = texteAideNiveau1(exercice, phase);
      if (note || formule !== formulePrecedente) lignes.push({ label: "Méthode", sousQuestion, fragments: [...(note ? [texte(`${note} `)] : []), latex(formule)] });
      formulePrecedente = formule;
    }
    if (phase === "coherenceJugement" && exercice.famille === "coherence") {
      lignes.push({ label: "Calcul", sousQuestion, fragments: [latex(texteAideNiveau2(exercice, phase))] });
      lignes.push({ label: "Conclusion", sousQuestion, fragments: conclusionCoherence(exercice) });
    } else {
      const calcul = calculEtape(exercice, phase);
      if (calcul) lignes.push({ label: "Calcul", sousQuestion, fragments: [latex(virgules(calcul)), ...(phase === "termesProches" ? [texte(", puis on ajoute r pour passer d'un terme au suivant.")] : [])] });
      lignes.push({ label: "Conclusion", sousQuestion, fragments: [latex(reponse(exercice, phase).join(",\\quad "))] });
    }
    if (p.phase === phase) lignes.push({ label: "Piège", sousQuestion, fragments: p.fragments });
    return lignes;
  });
}

function critere(sousQuestion: string, fragments: FragmentConsigne[], points: number): CritereBareme {
  return { sousQuestion, critere: fragments, points };
}

function baremeSuiteArithmetique(exercice: ExerciceSuiteArithmetique): BaremeExercice {
  const liste = etapes(exercice);
  const lettre = (phase: PhaseSuiteArithmetique) => LETTRES[liste.indexOf(phase)];
  const criteres: CritereBareme[] = [];
  const erreurs: ErreurFrequente[] = [];
  switch (exercice.famille) {
    case "principal": {
      const premiere = liste[0];
      const trouver = liste.filter((ph) => ph === "trouverR" || ph === "trouverU1");
      if (trouver.length > 0) criteres.push(critere(lettre(premiere), [texte(trouver.length === 2 ? "Raison r et premier terme u₁" : trouver[0] === "trouverR" ? "Raison r" : "Premier terme u₁")], 1));
      criteres.push(critere(lettre("formuleGenerale"), [texte("Formule générale "), latex(reponse(exercice, "formuleGenerale")[0])], trouver.length > 0 ? 1 : 1.5));
      criteres.push(critere(lettre("termesProches"), [texte("Termes consécutifs et terme éloigné")], trouver.length > 0 ? 1 : 1.5));
      criteres.push(critere(lettre("sommeSn"), [texte("Somme "), latex(reponse(exercice, "sommeSn")[0])], 1));
      erreurs.push({ description: [texte("Formule "), latex("u_1+nr"), texte(" au lieu de "), latex("u_1+(n-1)r")], cout: `0 pt sur la formule, suite notée sans double pénalité` });
      erreurs.push({ description: [texte("Somme calculée avec le dernier terme d'un autre rang que n")], cout: "0 pt sur la somme" });
      break;
    }
    case "coherence":
      if (exercice.coherent) {
        criteres.push(critere("a", [texte("Calcul de "), latex(`${u(exercice.q.indice)}-${u(exercice.p.indice)}`), texte(" et de "), latex(`(${exercice.q.indice}-${exercice.p.indice})\\times r`)], 1));
        criteres.push(critere("a", [texte("Conclusion : cohérentes")], 1));
        criteres.push(critere("b", [latex(reponse(exercice, "trouverU1")[0])], 1));
        criteres.push(critere("c", [texte("Formule générale "), latex(reponse(exercice, "formuleGenerale")[0])], 1));
      } else {
        criteres.push(critere("a", [texte("Calcul de "), latex(`${u(exercice.q.indice)}-${u(exercice.p.indice)}`), texte(" et de "), latex(`(${exercice.q.indice}-${exercice.p.indice})\\times r`)], 2));
        criteres.push(critere("a", [texte("Conclusion : incohérentes (donc pas de suite à déterminer)")], 2));
      }
      erreurs.push({ description: [texte("Comparer l'écart des deux termes à r au lieu de "), latex("(q-p)\\times r")], cout: "0 pt sur la conclusion" });
      break;
    case "algebriqueTermeGeneral":
    case "algebriqueSommeSn": {
      const poser = lettre("poserEquationAlgebrique");
      if (liste.includes("calculerSn")) criteres.push(critere(lettre("calculerSn"), [latex(reponse(exercice, "calculerSn")[0])], 1));
      criteres.push(critere(poser, [texte("Équation correcte en x")], liste.includes("calculerSn") ? 1 : 1.5));
      criteres.push(critere(lettre("resoudreXAlgebrique"), [latex(reponse(exercice, "resoudreXAlgebrique")[0])], liste.includes("calculerSn") ? 2 : 1.5));
      if (liste.includes("calculerTermesAlgebrique")) criteres.push(critere(lettre("calculerTermesAlgebrique"), [texte("Valeurs numériques : "), latex(reponse(exercice, "calculerTermesAlgebrique").join(",\\ "))], 1));
      const pg = piege(exercice);
      erreurs.push({ description: pg.fragments, cout: "0 pt sur l'équation, suite notée sans double pénalité" });
      break;
    }
    case "algebriqueRangN":
      criteres.push(critere("a", [texte("Équation "), latex(reponse(exercice, "poserEquationRangN")[0])], 2));
      criteres.push(critere("b", [texte("Rang "), latex(reponse(exercice, "resoudreRangN")[0])], 2));
      erreurs.push({ description: [texte("Donner n − 1 au lieu de n")], cout: "−1" });
      break;
  }
  return {
    reponseFinale: reponseBreveSuiteArithmetique(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Formule générale développée (par exemple "), latex("u_n=rn+(u_1-r)"), texte(") ou non")], [texte("Valeurs exactes, en fraction si besoin")]],
  };
}

function construireCorrectionSuiteArithmetique(exercice: ExerciceSuiteArithmetique): BlocCorrection[] {
  return etapes(exercice).map((phase): BlocCorrection => {
    if (phase === "coherenceJugement" && exercice.famille === "coherence") return { type: "paragraphe", fragments: conclusionCoherence(exercice) };
    return { type: "paragraphe", fragments: [latex(reponse(exercice, phase).join(" \\quad "))] };
  });
}

export const adaptateurEvaluationSuitesArithmetiques: AdaptateurFeuilleExercices<ExerciceSuiteArithmetique> = {
  titreDocument: "Suites arithmétiques, formule générale et termes — Évaluation",
  nomFichierBase: "suites-arithmetiques",
  genererInstance: genererExerciceSuiteArithmetique,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id as FamilleSuiteArithmetiqueId),
  construireEnonce: construireEnonceSuiteArithmetique,
  construireCorrection: construireCorrectionSuiteArithmetique,
  difficulte: difficulteSuiteArithmetique,
  reponseBreve: reponseBreveSuiteArithmetique,
  correctionDetaillee: correctionDetailleeSuiteArithmetique,
  bareme: baremeSuiteArithmetique,
  enoncePapier: enoncePapierSuiteArithmetique,
  dureeMinutes: 10,
};
