import type { Arcfonction } from "../core6e/cyclometrique.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import { finaliserCorrige } from "./corrigeLogarithmes1";
import { sansRepetition } from "./corrigeLogarithmes2";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Briques communes du corrigé détaillé « comme au tableau » du chapitre 1 de 6e (fonctions
 * réciproques et cyclométriques : 6gen1 à 6gen5) — règle `.claude/rules/feuilles-evaluations.md`
 * (« Corrigé détaillé — comme au tableau »). SANS `docx` : importé par les adaptateurs papier ET par
 * les générateurs interactifs (corrigé de l'étape révélée).
 *
 * Réutilise les briques des chapitres 2 et 3 (nombres exacts, termes signés, `finaliserCorrige`,
 * `sansRepetition`) ; ajoute les renvois `COURS_*` aux sections du chapitre (§ 1 à 5), les noms et
 * dérivées des arcfonctions, les valeurs remarquables et l'écriture des ensembles.
 */

export { affine, finaliserCorrige, frac, justif, listeEt, nb, parE, parN, rationnel, sommeTermes, terme } from "./corrigeLogarithmes1";
export { dec, sansRepetition, vaut } from "./corrigeLogarithmes2";

export const COURS_RECIPROQUE = "(cours, § 1)";
export const COURS_CYCLO = "(cours, § 2)";
export const COURS_EQUATIONS = "(cours, § 3)";
export const COURS_DERIVEES = "(cours, § 4)";
export const COURS_GRAPHES = "(cours, § 5)";

type Fragments = FragmentConsigne[];

export const NOM_ARC: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
export const NOM_TRIG_DE_ARC: Record<Arcfonction, string> = { arcsin: "\\sin", arccos: "\\cos", arctan: "\\tan" };

/** Domaine de définition d'une arcfonction (LaTeX). */
export const DOMAINE_ARC: Record<Arcfonction, string> = { arcsin: "[-1\\,;\\,1]", arccos: "[-1\\,;\\,1]", arctan: "\\mathbb{R}" };

/** Ensemble image (intervalle de restriction de la fonction trigonométrique). */
export const IMAGE_ARC: Record<Arcfonction, string> = {
  arcsin: "\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]",
  arccos: "[0\\,;\\,\\pi]",
  arctan: "\\left]-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right[",
};

/** Formule de la dérivée d'une arcfonction en son argument `u` (lettre générique). */
export const DERIVEE_ARC_U: Record<Arcfonction, string> = {
  arcsin: "\\left(\\arcsin u\\right)'=\\dfrac{u'}{\\sqrt{1-u^{2}}}",
  arccos: "\\left(\\arccos u\\right)'=-\\dfrac{u'}{\\sqrt{1-u^{2}}}",
  arctan: "\\left(\\arctan u\\right)'=\\dfrac{u'}{1+u^{2}}",
};

/** Ensemble en LaTeX (bornes exactes, dénominateur jusqu'à 300). */
export function ensembleL(e: EnsembleReelGuide): string {
  return formatEnsembleReelLatex(e, 300);
}

/** Un nombre `x` appartient-il à l'ensemble ? (bornes à 1e-9 près). */
export function appartientEnsemble(x: number, e: EnsembleReelGuide): boolean {
  const EPS = 1e-9;
  if (e.forme === "reel") return true;
  if (e.forme === "prive_points") return !e.points.some((p) => Math.abs(p - x) < EPS);
  return e.morceaux.some((m) => {
    if (m.inf !== null && (x < m.inf - EPS || (Math.abs(x - m.inf) < EPS && !m.infInclus))) return false;
    if (m.sup !== null && (x > m.sup + EPS || (Math.abs(x - m.sup) < EPS && !m.supInclus))) return false;
    return true;
  });
}

/** Lignes sans répétition (même LaTeX, `\dfrac`/`\frac` près). */
export function lignesPropres(lignes: LigneCalcul[]): LigneCalcul[] {
  return sansRepetition(lignes);
}

/** Ligne de calcul (réexport, pour n'importer qu'un module dans les corrigés du chapitre). */
export { ligne };

/** Finition des corrigés du chapitre : fractions lisibles, justifications insécables. */
export function finaliser(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return finaliserCorrige(etapes);
}

/** Fragments « texte » suivis d'un renvoi au cours. */
export function avecRenvoi(fr: Fragments, renvoi: string): Fragments {
  return [...fr, { type: "texte", valeur: ` ${renvoi}.` }];
}
