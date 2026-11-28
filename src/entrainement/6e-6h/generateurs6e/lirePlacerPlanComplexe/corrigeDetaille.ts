import type { ExerciceLirePlacer } from "../../core6e/lirePlacerPlanComplexe.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, lignesDepuisChaine, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { PhaseLirePlacer } from "../../moteur6e/typesLirePlacerPlanComplexe";
import { JUSTIFICATION_TRANSFORMATION, PIEGE_OPERATION, affixeLatex, aideNiveau1, calculModuleArgument, calculPlacement, coordonneesLatex, justificationArgument, l, piegeAssocier, reponseFragments } from "../../ui6e/formatLirePlacerPlanComplexe";
import { figureCorrigeLirePlacerSvg } from "../../ui6e/figureLirePlacerPlanComplexe";

/**
 * Corrigé détaillé « comme au tableau » de `6gen95` (lire et placer dans le plan complexe) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Étapes a–e =
 * écrans (lecture, placement de P, placement de Q, transformations, module et argument) ; chaînes
 * de l'écran (`calculPlacement`, `calculModuleArgument`) une transformation par ligne.
 */

const COURS = "(cours, point 7)";
const LETTRES: Record<PhaseLirePlacer, string> = { lire: "a", placer1: "b", placer2: "c", associer: "d", moduleArgument: "e" };

function methode(e: ExerciceLirePlacer, phase: PhaseLirePlacer): FragmentConsigne[] {
  const aide = aideNiveau1(e, phase);
  return aide.latex ? [texte(`${aide.texte} `), l(aide.latex)] : [texte(aide.texte)];
}

export function correctionDetailleeLirePlacer(e: ExerciceLirePlacer): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  const lecture: LigneCalcul[] = [ligne(`z=${affixeLatex(e.z)}`, [texte("A"), l(coordonneesLatex(e.z)), texte(" : abscisse = partie réelle, ordonnée = partie imaginaire")])];
  if (e.w) lecture.push(ligne(`w=${affixeLatex(e.w)}`, [texte("B"), l(coordonneesLatex(e.w))]));
  L.push(
    utilise("a", [...methode(e, "lire"), texte(` ${COURS}`)]),
    calcul("a", lecture),
    resultat("a", reponseFragments(e, "lire")),
    piege("a", [texte("Échanger partie réelle et partie imaginaire : la partie réelle est l'abscisse (axe horizontal).")]),
  );
  ([0, 1] as const).forEach((i) => {
    const phase: PhaseLirePlacer = i === 0 ? "placer1" : "placer2";
    const sq = LETTRES[phase];
    L.push(
      utilise(sq, methode(e, phase)),
      calcul(sq, lignesDepuisChaine(calculPlacement(e, i), ["", "on remplace", "on calcule"])),
      { ...resultat(sq, reponseFragments(e, phase)), ...(i === 1 ? { figureHtml: figureCorrigeLirePlacerSvg(e) } : {}) },
      piege(sq, PIEGE_OPERATION[e.operations[i]]),
    );
  });
  L.push(
    utilise("d", [texte("On traduit chaque opération sur un point quelconque d'affixe "), l("a+bi"), texte(" (ou sur "), l("z"), texte(") et on reconnaît la transformation.")]),
    calcul(
      "d",
      e.operations.flatMap((op) =>
        op === "somme"
          ? [ligne("z'=z+w", "on ajoute la même affixe w à tout point : translation")]
          : op === "difference"
            ? [ligne("z'=z-w=z+(-w)", "translation de vecteur d'affixe −w")]
            : JUSTIFICATION_TRANSFORMATION[op].split(",\\ \\ ").map((m) => ligne(m)),
      ),
    ),
    resultat("d", reponseFragments(e, "associer")),
    piege("d", piegeAssocier(e)),
  );
  const morceaux = calculModuleArgument(e).split(",\\quad ");
  L.push(
    utilise("e", methode(e, "moduleArgument")),
    calcul("e", lignesDepuisChaine(morceaux.slice(0, 2).join(",\\quad ").split(",\\quad ")[1], ["|x + yi| = √(x² + y²)", "on calcule", "on simplifie"]), [l(morceaux[0])], "Module"),
    calcul("e", [ligne(morceaux[2])], justificationArgument(e), "Argument"),
    resultat("e", reponseFragments(e, "moduleArgument")),
    piege("e", [texte("Oublier la racine carrée (donner "), l("|z_C|^2"), texte("), ou se tromper de quadrant pour l'argument.")]),
  );
  return L;
}
