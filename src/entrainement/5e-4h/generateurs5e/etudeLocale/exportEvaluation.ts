import type { ExerciceEtudeLocale, ValeurLigne2Tableau, ValeurSigneTableau } from "../../core5e/etudeLocale.types";
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
  consigneEcranEtudeLocale,
  formatEnteteColonnesTableau,
  formatReponseAttenduePhaseLatex,
  formatTermesDonneesLatex,
  texteAideNiveau1EtudeLocale,
} from "../../ui5e/formatEtudeLocale";
import { ordreEcransEtudeLocale, type EcranEtudeLocale } from "../../moteur5e/typesEtudeLocale";
import { tableauFPrimeAttendu, tableauFSecondeAttendu, type TableauEtudeLocaleAttendu } from "../../moteur5e/verificationEtudeLocale";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceEtudeLocale } from "./index";
import { profilEtudeLocale } from "../profilsEvaluationDerivees28-30";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceEtudeLocale>` pour 5gen29 (Étude locale) — feuille
 * d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = f, f' (et f'' au niveau avancé) DONNÉES, comme à l'écran, et UNE consigne
 * globale : domaine (fonction rationnelle), zéros de f', signe de f' et variations, extremums
 * (abscisse, nature, valeur) ; au niveau avancé, la même chose pour f'' (concavité, points
 * d'inflexion). Aucun rappel de méthode dans l'énoncé (le piège « zéro sans changement de signe »
 * est dans le corrigé). Les écrans du générateur (`ordreEcransEtudeLocale`) sont les étapes du
 * corrigé ; les tableaux de signes y sont dessinés (`tableauSignesEtudeLatex`, à partir de
 * `tableauFPrimeAttendu`/`tableauFSecondeAttendu`, la MÊME source que la vérification de l'écran).
 */

const LETTRES = "abcdefgh";

// ============================================================================
// Tableau de signes en LaTeX (réutilisé par 5gen30, `lectureGraphiqueDerivees/exportEvaluation.ts`).
// ============================================================================

function signeLatex(v: ValeurSigneTableau): string {
  return v === "∄" ? "\\|" : v;
}

function ligne2Latex(v: ValeurLigne2Tableau | null): string {
  switch (v) {
    case null:
      return "\\|";
    case "↗":
      return "\\nearrow";
    case "↘":
      return "\\searrow";
    case "∪":
      return "\\cup";
    case "∩":
      return "\\cap";
    case "max":
      return "\\text{max}";
    case "min":
      return "\\text{min}";
    case "ni_lun_ni_lautre":
      return "\\text{ni max ni min}";
    case "pi":
      return "\\text{PI}";
    case "pas_de_pi":
      return "\\text{pas de PI}";
  }
}

/** Tableau (environnement `array`) : ligne x (−∞, en-têtes des colonnes, +∞), ligne du signe de la
 * dérivée, ligne des variations (f') ou de la concavité (f'') de f. `entetes` : une entrée par
 * colonne de `attendu` (« » pour une zone). */
export function tableauSignesEtudeLatex(attendu: TableauEtudeLocaleAttendu, entetes: string[], mode: "fprime" | "fseconde"): string {
  const n = attendu.colonnes.length;
  const ligne = (libelle: string, cellules: string[]) => [libelle, "", ...cellules, ""].join(" & ");
  return [
    `\\begin{array}{c|${"c".repeat(n + 2)}}`,
    `${ligne("x", entetes).replace(/^x &  &/, "x & -\\infty &").replace(/ & $/, " & +\\infty")} \\\\ \\hline`,
    `${ligne(mode === "fprime" ? "f'(x)" : "f''(x)", attendu.signes.map(signeLatex))} \\\\ \\hline`,
    `${ligne("f(x)", attendu.ligne2.map(ligne2Latex))}`,
    "\\end{array}",
  ].join(" ");
}

// ============================================================================
// Énoncé.
// ============================================================================

function entete(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const avance = exercice.niveau === "avance";
  return [texte(avance ? "On considère la fonction f ; ses dérivées f' et f'' sont données : " : "On considère la fonction f ; sa dérivée f' est donnée : "), latex(formatTermesDonneesLatex(exercice).join(" \\quad "))];
}

function consigneEtape(ecran: EcranEtudeLocale): FragmentConsigne[] {
  return [texte(consigneEcranEtudeLocale(ecran).replace("Complète le tableau", "Dresse le tableau"))];
}

function construireEnonceEtudeLocale(exercice: ExerciceEtudeLocale): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcransEtudeLocale(exercice).map((ecran) => ({ consigne: consigneEtape(ecran) })) };
}

function irrationnelle(exercice: ExerciceEtudeLocale): boolean {
  return exercice.type === "polynomiale" && exercice.natureRacines === "irrationnelle";
}

function consignePapier(exercice: ExerciceEtudeLocale): string {
  const domaine = exercice.type !== "polynomiale" ? "Détermine le domaine de définition de f. " : "";
  const fPrime = "Recherche les zéros de f', étudie le signe de f' et les variations de f, puis détermine les éventuels extremums de f (abscisse, nature et valeur).";
  const fSeconde = exercice.niveau === "avance" ? " Étudie de même le signe de f'' et la concavité de f, puis détermine ses éventuels points d'inflexion (abscisse et valeur)." : "";
  const precision = irrationnelle(exercice) ? " Donne les abscisses en valeur exacte ; les valeurs de f peuvent être arrondies au centième." : " Donne des valeurs exactes.";
  return `${domaine}${fPrime}${fSeconde}${precision}`;
}

function enoncePapierEtudeLocale(exercice: ExerciceEtudeLocale): EnoncePapier {
  return {
    section: { enteteFragments: entete(exercice), questions: [{ consigne: [texte(consignePapier(exercice))] }] },
    etapesParQuestion: [ordreEcransEtudeLocale(exercice).map((_, i) => LETTRES[i])],
  };
}

// ============================================================================
// Réponse brève, corrigé, barème.
// ============================================================================

function joindre(latexs: string[], separateur = " ; "): FragmentConsigne[] {
  return latexs.flatMap((l, i) => [...(i === 0 ? [] : [texte(separateur)]), latex(l)]);
}

function aExtremums(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFPrime.some((c) => c !== "ni_lun_ni_lautre");
}

function aInflexions(exercice: ExerciceEtudeLocale): boolean {
  return exercice.classificationFSeconde.some((c) => c === "pi");
}

function reponseBreveEtudeLocale(exercice: ExerciceEtudeLocale): FragmentConsigne[] {
  const fragments: FragmentConsigne[] = aExtremums(exercice) ? joindre(formatReponseAttenduePhaseLatex(exercice, "extremums")) : [texte("aucun extremum")];
  const natures = formatReponseAttenduePhaseLatex(exercice, "tableauFPrime");
  fragments.push(texte(" ("), ...joindre(natures), texte(")"));
  if (exercice.niveau === "avance") {
    fragments.push(texte(" — "), ...(aInflexions(exercice) ? joindre(formatReponseAttenduePhaseLatex(exercice, "inflexions")) : [texte("aucun point d'inflexion")]));
  }
  return fragments;
}

function methode(exercice: ExerciceEtudeLocale, ecran: EcranEtudeLocale, sousQuestion: string): EtapeCorrection {
  const aide = texteAideNiveau1EtudeLocale(ecran, exercice);
  return { label: "Méthode", sousQuestion, fragments: [texte(aide.texte), ...(aide.latex ? [texte(" "), latex(aide.latex)] : [])] };
}

function tableau(exercice: ExerciceEtudeLocale, mode: "fprime" | "fseconde"): string {
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(exercice) : tableauFSecondeAttendu(exercice);
  return tableauSignesEtudeLatex(attendu, formatEnteteColonnesTableau(exercice, attendu.colonnes, mode), mode);
}

function correctionDetailleeEtudeLocale(exercice: ExerciceEtudeLocale): EtapeCorrection[] {
  const ordre = ordreEcransEtudeLocale(exercice);
  const L = (e: EcranEtudeLocale) => LETTRES[ordre.indexOf(e)];
  const lignes: EtapeCorrection[] = [];
  for (const ecran of ordre) {
    const l = L(ecran);
    switch (ecran) {
      case "domaine":
        lignes.push(methode(exercice, ecran, l), { label: "Conclusion", sousQuestion: l, fragments: [latex(formatReponseAttenduePhaseLatex(exercice, "domaine")[0])] });
        break;
      case "resoudreFPrime":
      case "resoudreFSeconde":
        lignes.push(methode(exercice, ecran, l), { label: "Calcul", sousQuestion: l, fragments: [latex(formatReponseAttenduePhaseLatex(exercice, ecran)[0])] });
        break;
      case "tableauFPrime":
        lignes.push({ label: "Tableau", sousQuestion: l, fragments: [latex(tableau(exercice, "fprime"))] });
        lignes.push({ label: "Conclusion", sousQuestion: l, fragments: [...joindre(formatReponseAttenduePhaseLatex(exercice, "tableauFPrime")), ...(aExtremums(exercice) ? [] : [texte(" : f n'a aucun extremum.")])] });
        lignes.push({
          label: "Piège",
          sousQuestion: l,
          fragments: exercice.classificationFPrime.includes("ni_lun_ni_lautre")
            ? [texte("f' s'annule sans changer de signe (racine double) : ce point n'est ni un maximum ni un minimum.")]
            : [texte("Un zéro de f' n'est un extremum que si f' change de signe de part et d'autre : on le vérifie dans le tableau, jamais par principe.")],
        });
        break;
      case "extremums":
      case "inflexions":
        lignes.push(methode(exercice, ecran, l), { label: "Calcul", sousQuestion: l, fragments: joindre(formatReponseAttenduePhaseLatex(exercice, ecran)) });
        break;
      case "tableauFSeconde":
        lignes.push({ label: "Tableau", sousQuestion: l, fragments: [latex(tableau(exercice, "fseconde"))] });
        lignes.push({ label: "Conclusion", sousQuestion: l, fragments: [...joindre(formatReponseAttenduePhaseLatex(exercice, "tableauFSeconde")), ...(aInflexions(exercice) ? [] : [texte(" : f n'a aucun point d'inflexion.")])] });
        if (exercice.classificationFSeconde.includes("pas_de_pi")) {
          lignes.push({ label: "Piège", sousQuestion: l, fragments: [texte("f'' s'annule sans changer de signe : la concavité ne change pas, ce n'est pas un point d'inflexion.")] });
        }
        break;
    }
  }
  return lignes;
}

const POIDS_ECRAN: Record<EcranEtudeLocale, number> = { domaine: 0.5, resoudreFPrime: 2, tableauFPrime: 2, extremums: 1.5, resoudreFSeconde: 2, tableauFSeconde: 2, inflexions: 1.5 };

const CRITERE_ECRAN: Record<EcranEtudeLocale, string> = {
  domaine: "Domaine de définition",
  resoudreFPrime: "Zéros de f' (toutes les solutions)",
  tableauFPrime: "Tableau de signes de f', variations et nature de chaque zéro",
  extremums: "Valeur de f en chaque extremum",
  resoudreFSeconde: "Zéros de f''",
  tableauFSeconde: "Tableau de signes de f'', concavité et points d'inflexion",
  inflexions: "Valeur de f en chaque point d'inflexion",
};

/** Poids ramenés à un total de 4, au demi-point, aucun critère sous 0,5 (plus forts restes). */
export function repartirSurQuatre(poids: number[]): number[] {
  const total = poids.reduce((t, p) => t + p, 0);
  const brut = poids.map((p) => (p / total) * 8); // en demi-points
  const unites = brut.map((b) => Math.max(1, Math.floor(b)));
  let reste = 8 - unites.reduce((t, u) => t + u, 0);
  const ordre = brut.map((b, i) => ({ i, r: b - Math.floor(b) })).sort((a, b) => b.r - a.r || poids[b.i] - poids[a.i]);
  for (let k = 0; reste > 0; k = (k + 1) % ordre.length, reste--) unites[ordre[k].i]++;
  for (let k = ordre.length - 1; reste < 0; k = (k - 1 + ordre.length) % ordre.length) {
    if (unites[ordre[k].i] > 1) {
      unites[ordre[k].i]--;
      reste++;
    }
  }
  return unites.map((u) => u / 2);
}

function baremeEtudeLocale(exercice: ExerciceEtudeLocale): BaremeExercice {
  const ordre = ordreEcransEtudeLocale(exercice);
  const points = repartirSurQuatre(ordre.map((e) => POIDS_ECRAN[e]));
  const criteres: CritereBareme[] = ordre.map((e, i) => ({ sousQuestion: LETTRES[i], critere: [texte(CRITERE_ECRAN[e])], points: points[i] }));
  const erreurs: ErreurFrequente[] = [{ description: [texte("Un zéro de f' déclaré extremum sans vérifier le changement de signe")], cout: "0 pt sur la nature de ce point" }];
  erreurs.push({ description: [texte("Valeur de l'extremum calculée avec f' au lieu de f")], cout: "0 pt sur cette valeur" });
  if (exercice.type === "rationnelleAvecCE") erreurs.push({ description: [texte("Valeurs interdites oubliées dans le tableau de signes")], cout: "−0,5" });
  return {
    reponseFinale: reponseBreveEtudeLocale(exercice),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: irrationnelle(exercice) ? [[texte("Valeurs de f arrondies au centième")]] : [[texte("Fractions non simplifiées ou décimaux exacts équivalents")]],
  };
}

function difficulteEtudeLocale(exercice: ExerciceEtudeLocale): 1 | 2 | 3 {
  if (exercice.type === "polynomiale" && exercice.natureRacines !== "irrationnelle" && exercice.niveau === "base") return 2;
  return 3;
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionEtudeLocale(exercice: ExerciceEtudeLocale): BlocCorrection[] {
  return correctionDetailleeEtudeLocale(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationEtudeLocale: AdaptateurFeuilleExercices<ExerciceEtudeLocale> = {
  titreDocument: "Étude locale (extremums et points critiques) — Évaluation",
  nomFichierBase: "etude-locale-extremums",
  genererInstance: genererExerciceEtudeLocale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceEtudeLocale,
  construireCorrection: construireCorrectionEtudeLocale,
  difficulte: difficulteEtudeLocale,
  reponseBreve: reponseBreveEtudeLocale,
  correctionDetaillee: correctionDetailleeEtudeLocale,
  bareme: baremeEtudeLocale,
  enoncePapier: enoncePapierEtudeLocale,
  dureeMinutes: 12,
  profilInstance: profilEtudeLocale,
  calculatriceIndispensable: ["polynomiale-irrationnelle-base", "polynomiale-irrationnelle-avance"],
  regroupable: false,
};
