import { donneesSomme } from "../../core5e/sommesTermes.types";
import type { ExerciceSommesTermes } from "../../core5e/sommesTermes.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import type { CriteresDifficulte } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur5e/typesSommesTermes";
import { consigneEcran, consigneGenerale, libellePhase, nb, reponseFragments, reponseRecap } from "../../ui5e/formatSommesTermes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceSommesTermes } from "./index";
import type { IdVarianteSommesTermes } from "./index";
import { profilSommesTermes } from "./profilEvaluation";
import { correctionDetailleeSommesTermes } from "./corrigeDetaille";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceSommesTermes>` de `5gen45` « Sommes de termes
 * consécutifs » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : les données (consigne générale de l'écran) et UNE demande globale (« calcule S
 *   en justifiant le nombre de termes ») ; les trois étapes d'apprentissage (nombre de termes,
 *   premier terme/raison, somme) passent dans le corrigé.
 * - Corrigé détaillé « comme au tableau » : `corrigeDetaille.ts` (partagé avec l'appli), une étape
 *   par écran (lettres a, b, c dans l'ordre des écrans).
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
/** Critères du niveau de difficulté (grille commune, `export/niveauDifficulte.ts`) : méthode et
 * piège jugés par variante (analyse des cinq chapitres), étapes lues sur le corrigé détaillé. */
function criteresDifficulte(e: ExerciceSommesTermes): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeSommesTermes(e)), methode: e.variante === "arith-extension" || e.variante === "geom-extension" ? 1 : 0, piege: 1 };
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
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSommesTermes,
  bareme,
  enoncePapier,
  profilInstance: profilSommesTermes,
};
