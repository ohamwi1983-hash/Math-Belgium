import type { ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../../core6e/formuleMoivre.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { aideNiveau1, aideNiveau2, consigneEcran, consigneGenerale, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormuleMoivre";
import { phasesPourExercice } from "../../moteur6e/typesFormuleMoivre";
import type { PhaseFormuleMoivre } from "../../moteur6e/typesFormuleMoivre";
import { profilFormuleMoivre } from "../profilsEvaluationComplexes37-39";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFormuleMoivre } from "./index";
import type { IdVarianteFormuleMoivre } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormuleMoivre>` pour `6gen38` (Formule de Moivre :
 * développer cos(nx) et sin(nx)) — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : « Exprime cos(4x) et sin(4x) en fonction de cos(x) et sin(x)… » (ou cos(nx), ou
 *   sin(nx)/sin(x), en fonction de cos(x) seulement), avec la formule de Moivre rappelée ; les trois
 *   écrans (développement, séparation réel/imaginaire, formules finales) deviennent les étapes du
 *   corrigé.
 * - Corrigé : coefficients du triangle de Pascal, puissances de i, puis la substitution
 *   sin²(x) = 1 − cos²(x) écrite terme à terme quand la cible est en cos(x) seul.
 */

const LETTRES = "abcdefghij";
const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);

const nx = (e: ExerciceFormuleMoivre) => `${e.n}x`;

/** Une ligne du récapitulatif de l'écran, sans le libellé `\text{…}` ni la ponctuation finale. */
function sansTexte(s: string): string {
  return s.replace(/^\\text\{[^}]*\}/, "").replace(/\\text\{ ;\}$/, "");
}

/** Somme longue (développement de l'étape 1) coupée en morceaux de trois termes : la formule passe à
 * la ligne entre deux morceaux au lieu de déborder. Les termes de l'étape 1 sont tous positifs
 * (jointure par « + »). */
function sommeCoupee(debut: string, termes: string[]): FragmentConsigne[] {
  const morceaux: FragmentConsigne[] = [];
  for (let i = 0; i < termes.length; i += 3) {
    const bloc = termes.slice(i, i + 3).join("+");
    morceaux.push(f(i === 0 ? `${debut}${bloc}` : `+${bloc}`));
    if (i + 3 < termes.length) morceaux.push(t(" "));
  }
  return morceaux;
}

function reponseFinale(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  const lignes = formatReponseAttenduePhaseLatex(e, "ecran3").map(sansTexte);
  return lignes.flatMap((l, i) => (i === 0 ? [f(l)] : [t(" ; "), f(l)]));
}

function reponse(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  if (phase === "ecran1") return sommeCoupee(`(\\cos(x)+i\\sin(x))^{${e.n}}=`, formatReponseAttenduePhaseLatex(e, "ecran1")[0].split("+"));
  if (phase === "ecran2") {
    const [reels, imaginaires] = formatReponseAttenduePhaseLatex(e, "ecran2").map(sansTexte);
    return [t("termes réels : "), f(reels), t(" ; termes imaginaires : "), f(imaginaires)];
  }
  return reponseFinale(e);
}

// ============================================================================
// Énoncé papier et étapes.
// ============================================================================

function entetePapier(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  const consigne = consigneGenerale(e).map((fr, i) => (i === 0 && fr.type === "texte" ? { ...fr, valeur: fr.valeur.replace(/^Formule de Moivre : exprime /, "Exprime ") } : fr));
  return [...consigne, t(" On rappelle la formule de Moivre : "), f(`(\\cos(x)+i\\sin(x))^{${e.n}}=\\cos(${nx(e)})+i\\sin(${nx(e)})`), t(".")];
}

function titreEtape(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): FragmentConsigne[] {
  if (phase === "ecran1") return consigneEcran(e, phase);
  if (phase === "ecran2") {
    return [
      t("Simplifie chaque puissance de i dans le développement obtenu à l'étape 1 ("),
      f("i^0=1,\\ i^1=i,\\ i^2=-1,\\ i^3=-i"),
      t(", période 4), puis sépare les termes d'indice k pair (réels) des termes d'indice k impair (imaginaires)."),
    ];
  }
  if (e.cible === "cosSeul") return [t("Écris "), f(`\\cos(${nx(e)})`), t(" en fonction de "), f("\\cos(x)"), t(" seulement, grâce à "), f("\\sin^2(x)=1-\\cos^2(x)"), t(".")];
  if (e.cible === "sinSurSin") return [t("Écris "), f(`\\dfrac{\\sin(${nx(e)})}{\\sin(x)}`), t(" en fonction de "), f("\\cos(x)"), t(" seulement, grâce à "), f("\\sin^2(x)=1-\\cos^2(x)"), t(".")];
  return [t("Identifie les parties réelle et imaginaire : écris "), f(`\\cos(${nx(e)})`), t(" et "), f(`\\sin(${nx(e)})`), t(".")];
}

function construireEnonce(e: ExerciceFormuleMoivre): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFormuleMoivre): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponse(e, phase)] }));
}

function reponseBreve(e: ExerciceFormuleMoivre): FragmentConsigne[] {
  return reponseFinale(e);
}

function enoncePapier(e: ExerciceFormuleMoivre): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Substitution sin²(x) = 1 − cos²(x), terme à terme : chaque terme ±C·cosᵖ(x)·sin²ᵐ(x) devient
 * ±C·cosᵖ(x)·(1 − cos²(x))ᵐ. `decalage` = 1 pour sin(nx)/sin(x) (un facteur sin(x) déjà retiré). */
function substitutionLatex(termes: TermeDeveloppementMoivre[], signe: (t: TermeDeveloppementMoivre) => number, decalage: number): string {
  return termes
    .map((terme, i) => {
      const m = (terme.k - decalage) / 2;
      const facteurs = [
        terme.coefBinomial === 1 ? "" : `${terme.coefBinomial}`,
        terme.puissanceCos === 0 ? "" : terme.puissanceCos === 1 ? "\\cos(x)" : `\\cos^{${terme.puissanceCos}}(x)`,
        m === 0 ? "" : m === 1 ? "\\left(1-\\cos^2(x)\\right)" : `\\left(1-\\cos^2(x)\\right)^{${m}}`,
      ].filter((x) => x !== "");
      const corps = facteurs.length === 0 ? "1" : facteurs.join("");
      const s = signe(terme);
      return `${s < 0 ? "-" : i === 0 ? "" : "+"}${corps}`;
    })
    .join("");
}

function piege(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre): string {
  if (phase === "ecran1") return `Oublier les coefficients binomiaux : ce sont ceux de la ligne ${e.n} du triangle de Pascal.`;
  if (phase === "ecran2") return "Mal simplifier les puissances de i : i² = −1 et i³ = −i, donc les signes alternent d'un terme réel (ou imaginaire) au suivant.";
  if (e.cible === "cosSeul") return e.n >= 4 ? "Développer (1 − cos²(x))² comme 1 − cos⁴(x) : c'est 1 − 2cos²(x) + cos⁴(x)." : "Remplacer sin²(x) par 1 + cos²(x) au lieu de 1 − cos²(x).";
  if (e.cible === "sinSurSin") return "Oublier de diviser chaque terme par sin(x), ou laisser des puissances paires de sin(x) sans les remplacer.";
  return `Garder le facteur i dans sin(${e.n}x) : sin(${e.n}x) est le coefficient de i, un nombre réel.`;
}

function lignesEtape(e: ExerciceFormuleMoivre, phase: PhaseFormuleMoivre, sq: string): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  if (phase === "ecran1") {
    const coefs = e.termes.map((x) => x.coefBinomial).join(",\\ ");
    lignes.push({
      label: "Méthode",
      sousQuestion: sq,
      fragments: [t("Binôme de Newton, avec les coefficients de la ligne "), f(`${e.n}`), t(" du triangle de Pascal : "), f(`C_{${e.n}}^{0},\\ \\ldots,\\ C_{${e.n}}^{${e.n}}=${coefs}`), t(".")],
    });
  } else if (phase === "ecran2") {
    const a1 = aideNiveau1(e, phase);
    const a2 = aideNiveau2(e, phase);
    lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Les puissances de i se répètent tous les 4 exposants : "), ...(a1.latex ? [f(a1.latex)] : [])] });
    if (a2.latex) lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [t("Premiers termes : "), f(a2.latex), t(" ; et de même pour les suivants.")] });
  } else if (e.cible === "standard") {
    lignes.push({
      label: "Méthode",
      sousQuestion: sq,
      fragments: [t("Par la formule de Moivre, "), f(`\\cos(${nx(e)})`), t(" est la partie réelle du développement et "), f(`\\sin(${nx(e)})`), t(" le coefficient de i.")],
    });
  } else {
    const reels = e.termes.filter((x) => x.k % 2 === 0);
    const imaginaires = e.termes.filter((x) => x.k % 2 === 1);
    lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("On remplace chaque puissance paire de sin(x) grâce à "), f("\\sin^2(x)=1-\\cos^2(x)"), t(", puis on développe et on regroupe.")] });
    if (e.cible === "cosSeul") {
      lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`\\cos(${nx(e)})=${sansTexte(formatReponseAttenduePhaseLatex(e, "ecran2")[0])}`), t(" ; donc "), f(`\\cos(${nx(e)})=${substitutionLatex(reels, (x) => x.reI, 0)}`)] });
    } else {
      const sinNx = aideNiveau2(e, phase).latex ?? "";
      lignes.push({
        label: "Calcul",
        sousQuestion: sq,
        fragments: [t("Coefficient de i : "), f(sinNx), t(" ; on divise par sin(x) : "), f(`\\dfrac{\\sin(${nx(e)})}{\\sin(x)}=${substitutionLatex(imaginaires, (x) => x.imI, 1)}`)],
      });
    }
  }
  lignes.push({ label: "Conclusion", sousQuestion: sq, fragments: reponse(e, phase) });
  lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t(piege(e, phase))] });
  return lignes;
}

function correctionDetaillee(e: ExerciceFormuleMoivre): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}

function difficulte(e: ExerciceFormuleMoivre): 1 | 2 | 3 {
  return e.n >= 5 || e.cible !== "standard" ? 3 : 2;
}

function bareme(e: ExerciceFormuleMoivre): BaremeExercice {
  const finales = formatReponseAttenduePhaseLatex(e, "ecran3").map(sansTexte);
  const criteresFinaux =
    e.cible === "standard"
      ? [
          { sousQuestion: "c", critere: [f(finales[0])], points: 1 },
          { sousQuestion: "c", critere: [f(finales[1])], points: 1 },
        ]
      : [{ sousQuestion: "c", critere: [f(finales[0])], points: 2 }];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Développement par le binôme de Newton (coefficients et puissances)")], points: 1 },
      { sousQuestion: "b", critere: [t("Puissances de i simplifiées, termes réels et imaginaires séparés")], points: 1 },
      ...criteresFinaux,
    ],
    erreursFrequentes: phasesPourExercice(e).map((phase) => ({ description: [t(piege(e, phase))], cout: "−1" })),
    reponsesAcceptees: [[t("Termes écrits dans un autre ordre"), ...(e.cible === "standard" ? [] : [t(" ; polynôme non ordonné mais réduit")])]],
  };
}

export const adaptateurEvaluationFormuleMoivre: AdaptateurFeuilleExercices<ExerciceFormuleMoivre> = {
  titreDocument: "Formule de Moivre — Évaluation",
  nomFichierBase: "formule-moivre",
  genererInstance: genererExerciceFormuleMoivre,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFormuleMoivre),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 12,
  profilInstance: profilFormuleMoivre,
};
