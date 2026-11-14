import { donneesSomme, estFraction } from "../../core5e/sommesTermes.types";
import type { ExerciceSommesTermes } from "../../core5e/sommesTermes.types";
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
import { phasesPourExercice } from "../../moteur5e/typesSommesTermes";
import type { PhaseSommesTermes } from "../../moteur5e/typesSommesTermes";
import { aideNiveau1, consigneEcran, consigneGenerale, libellePhase, nb, reponseFragments, reponseRecap } from "../../ui5e/formatSommesTermes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommesTermes } from "./index";
import type { IdVarianteSommesTermes } from "./index";
import { profilSommesTermes } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSommesTermes>` de `5gen45` « Sommes de termes
 * consécutifs » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : les données (consigne générale de l'écran) et UNE demande globale (« calcule S
 *   en justifiant le nombre de termes ») ; les trois étapes d'apprentissage (nombre de termes,
 *   premier terme/raison, somme) passent dans le corrigé.
 * - Corrigé : une étape par écran (lettres a, b, c dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`aideNiveau1`, `reponseFragments`, `reponseRecap`), une ligne
 *   « Piège » ciblée.
 * - Aucune figure, toutes les valeurs exactes. Version aménagée : même énoncé.
 */

const t = (valeur: string): FragmentConsigne => texte(valeur);
const f = (valeur: string): FragmentConsigne => latex(valeur);
const LETTRES = "abcdefgh";

// ============================================================================
// Énoncés.
// ============================================================================

const DEMANDE: FragmentConsigne[] = [t(" Calcule "), f("S"), t(" en justifiant le nombre de termes.")];

function construireEnonce(e: ExerciceSommesTermes): SectionExercice {
  return { enteteFragments: [...consigneGenerale(e), ...DEMANDE], questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function reponseBreve(e: ExerciceSommesTermes): FragmentConsigne[] {
  const d = donneesSomme(e);
  return [f(`S=${nb(d.somme)}`), t(` (${d.nombre} termes).`)];
}

function enoncePapier(e: ExerciceSommesTermes): EnoncePapier {
  return { section: { enteteFragments: [...consigneGenerale(e), ...DEMANDE], questions: [] }, reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: ExerciceSommesTermes): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseFragments(e, phase)] }));
}

/** ★★ application des formules ; ★★★ multiples (bornes à trouver), raison fractionnaire, formule
 * géométrique en qⁿ (rang à substituer sans décalage), raison négative en extension. */
function difficulte(e: ExerciceSommesTermes): 1 | 2 | 3 {
  switch (e.variante) {
    case "arith-indices":
      return 2;
    case "arith-extension":
      return e.sousCas === "multiples" ? 3 : 2;
    case "geom-indices":
      return estFraction(e.q) || e.exposant === "n" ? 3 : 2;
    case "geom-extension":
      return estFraction(e.q) || e.q.num < 0 ? 3 : 2;
  }
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** La ligne « Piège », sur l'étape où l'erreur classique se commet. */
function piege(e: ExerciceSommesTermes): { phase: PhaseSommesTermes; fragments: FragmentConsigne[] } {
  switch (e.variante) {
    case "arith-indices":
      return { phase: "nombreTermes", fragments: [t("De "), f("u_p"), t(" à "), f("u_n"), t(", il y a "), f("n-p+1"), t(" termes, pas "), f("n-p"), t(" : un terme de plus que d'écarts entre les rangs.")] };
    case "geom-indices":
      return {
        phase: "somme",
        fragments: [t("La formule "), f("u_1\\times\\dfrac{1-q^n}{1-q}"), t(" vaut pour une somme qui commence à "), f("u_1"), t(" ; ici, le facteur devant la fraction est le premier terme de la somme, "), f(`u_{${e.p}}`), t(", et l'exposant est le nombre de termes.")],
      };
    case "arith-extension":
      if (e.sousCas === "naturels") return { phase: "nombreTermes", fragments: [t("Le dernier terme n'est pas le nombre de termes : on cherche son RANG, en résolvant "), f("u_N=\\ldots"), t(".")] };
      if (e.sousCas === "multiples") return { phase: "bornesMultiples", fragments: [t("Les bornes ne sont pas des multiples : le premier multiple est juste APRÈS la borne inférieure, le dernier juste AVANT la borne supérieure ; puis on compte "), f("k_2-k_1+1"), t(" termes.")] };
      return { phase: "nombreTermes", fragments: [t("L'écart entre le dernier et le premier terme, divisé par la raison, donne le nombre d'ÉCARTS "), f("N-1"), t(" : il faut encore ajouter 1.")] };
    case "geom-extension":
      return { phase: "nombreTermes", fragments: [t("Le quotient du dernier terme par le premier vaut "), f("q^{N-1}"), t(" : l'exposant trouvé est "), f("N-1"), t(", le nombre de termes est un de plus.")] };
  }
}

function correctionDetaillee(e: ExerciceSommesTermes): EtapeCorrection[] {
  const p = piege(e);
  const d = donneesSomme(e);
  return phasesPourExercice(e).flatMap((phase, i): EtapeCorrection[] => {
    const sousQuestion = LETTRES[i];
    const aide = aideNiveau1(e, phase);
    const lignes: EtapeCorrection[] = [
      { label: "Méthode", sousQuestion, fragments: [t(aide.texte), ...(aide.latex ? [t(" "), f(aide.latex)] : [])] },
      { label: "Calcul", sousQuestion, fragments: reponseFragments(e, phase) },
    ];
    if (phase === "somme") {
      const impairs = e.variante === "arith-extension" && e.parite === "impairs";
      lignes.push({
        label: "Conclusion",
        sousQuestion,
        fragments: [
          t(`La somme de ces ${d.nombre} termes vaut `),
          f(`S=${nb(d.somme)}`),
          t("."),
          ...(impairs ? [t(" On retrouve "), f(`${d.nombre}^2`), t(" : la somme des "), f("N"), t(" premiers nombres impairs vaut toujours "), f("N^2"), t(".")] : []),
        ],
      });
    }
    if (p.phase === phase) lignes.push({ label: "Piège", sousQuestion, fragments: p.fragments });
    return lignes;
  });
}

// ============================================================================
// Barème.
// ============================================================================

function critere(sousQuestion: string, fragments: FragmentConsigne[], points: number): CritereBareme {
  return { sousQuestion, critere: fragments, points };
}

function valeursFr(valeurs: string[]): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => [...(i === 0 ? [] : [t(" et ")]), f(v)]);
}

function bareme(e: ExerciceSommesTermes): BaremeExercice {
  const phases = phasesPourExercice(e);
  const criteres = phases.map((phase, i) => {
    const libelle = phase === "nombreTermes" ? "Nombre de termes justifié" : phase === "somme" ? "Formule de la somme appliquée avec le bon premier terme" : libellePhase(phase);
    return critere(LETTRES[i], [t(`${libelle} : `), ...valeursFr(reponseRecap(e, phase))], phase === "somme" ? 2 : 1);
  });
  const geom = e.variante === "geom-indices" || e.variante === "geom-extension";
  const erreurs: ErreurFrequente[] = [{ description: [t("Nombre de termes sans le « + 1 » (écarts comptés au lieu des termes)")], cout: "−1, suite notée sans double pénalité" }];
  if (geom) {
    erreurs.push({ description: [t("Formule appliquée avec "), f("u_1"), t(" au lieu du premier terme de la somme")], cout: "−1" });
    erreurs.push({ description: [t("Exposant de q différent du nombre de termes")], cout: "−1" });
  } else {
    erreurs.push({ description: [t("Division par 2 oubliée")], cout: "−1" });
  }
  if (e.variante === "arith-indices" || e.variante === "geom-indices") {
    erreurs.push({ description: [t("Somme calculée depuis "), f("u_1"), t(" (jusqu'à "), f(`u_{${e.n}}`), t(")")], cout: "0 pt sur la somme" });
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [t("Somme obtenue en additionnant tous les termes un à un, si le nombre de termes est justifié")],
      ...(geom ? [[t("Formule écrite avec "), f("\\dfrac{q^N-1}{q-1}")]] : []),
    ],
  };
}

export const adaptateurEvaluationSommesTermes: AdaptateurFeuilleExercices<ExerciceSommesTermes> = {
  titreDocument: "Sommes de termes consécutifs — Évaluation",
  nomFichierBase: "sommes-termes-consecutifs",
  genererInstance: genererExerciceSommesTermes,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteSommesTermes),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
  profilInstance: profilSommesTermes,
};
