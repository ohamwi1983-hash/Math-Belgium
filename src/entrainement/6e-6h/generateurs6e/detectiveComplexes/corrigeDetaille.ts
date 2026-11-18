import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lignesDepuisChaine, piege as lignePiege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDetectiveComplexes } from "../../core6e/detectiveComplexes.types";
import { correction, descriptionCorrecte, indiceLigneFausse } from "../../moteur6e/modeleDetectiveComplexes";
import { constat, descriptionFragments, piege, reponseFragments, souderPonctuation } from "../../ui6e/formatDetectiveComplexes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen99` (détective d'erreurs : nombres complexes) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Étapes
 * a (ligne fausse : le contrôle de l'écran), b (nom de l'erreur), c (résolution reprise à partir de
 * la ligne fausse : chaque ligne de `correction(e)` devient une ligne de calcul alignée).
 */

/** Une ligne de la résolution corrigée → lignes de calcul (formule seule) ou texte d'introduction. */
function versLignes(lignesCopie: FragmentConsigne[][]): { intro: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const lignes: LigneCalcul[] = [];
  const intro: FragmentConsigne[] = [];
  for (const l of lignesCopie) {
    const formules = l.filter((f) => f.type === "latex");
    const textes = l.filter((f) => f.type === "texte" && f.valeur.trim() !== "" && !/^[\s.,;:]+$/.test(f.valeur));
    if (formules.length === 0) {
      if (lignes.length === 0) intro.push(...l, texte(" "));
      continue;
    }
    const justif = textes.length ? textes.map((f) => f.valeur).join(" ").replace(/\s*[:,]\s*$/, "").trim() : undefined;
    formules.forEach((f, k) => {
      const morceaux = lignesDepuisChaine(f.valeur);
      morceaux.forEach((m, j) => lignes.push(k === 0 && j === 0 && justif ? { ...m, justification: justif } : m));
    });
  }
  return { intro, lignes };
}

export function correctionDetailleeDetective(e: ExerciceDetectiveComplexes): EtapeCorrection[] {
  const i = indiceLigneFausse(e);
  const suite = correction(e).slice(i).map(souderPonctuation);
  const { intro, lignes } = versLignes(suite);
  return [
    utilise("a", [texte("On refait chaque ligne de la copie à partir de la précédente : la ligne fausse est la première qui n'en découle pas (les lignes suivantes n'en sont que les conséquences).")]),
    verification("a", constat(e)),
    resultat("a", [texte(`La ligne ${i + 1} est fausse.`)]),
    utilise("b", [texte("On nomme la règle de calcul qui n'a pas été respectée à cette ligne.")]),
    resultat("b", descriptionFragments(descriptionCorrecte(e), e)),
    lignePiege("b", piege(e)),
    utilise("c", [texte(`On reprend la résolution à partir de la ligne ${i + 1}, avec la règle correcte ; les lignes suivantes sont recalculées.`)]),
    ...(lignes.length ? [calcul("c", lignes, intro)] : []),
    resultat("c", souderPonctuation(reponseFragments(e))),
  ];
}
