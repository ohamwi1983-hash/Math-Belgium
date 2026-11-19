import type { ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { phasesPourExercice } from "../../moteur6e/typesQuellePrimitive";
import type { PhaseCalculPrimitives } from "../../moteur6e/typesCalculPrimitives";
import { formatFractionLatex, primitiveLatex } from "../../ui6e/formatCalculPrimitives";
import { formatReponseAttenduePhaseLatexQuellePrimitive } from "../../ui6e/formatQuellePrimitive";
import { cours, exact, lignesFin, par, substituer } from "../../ui6e/corrigeIntegrales1";
import { decimalLatex } from "../../ui6e/formatMonome";
import { etapesPhasePrimitive } from "../calculPrimitives/corrigeDetaille";

/**
 * Corrigé détaillé « comme au tableau » de `6gen24` (primitive vérifiant une condition initiale) —
 * règle `.claude/rules/feuilles-evaluations.md`. Écrans empruntés à 6gen23 : `etapesPhasePrimitive`
 * (même corrigé) ; écran final : F(a) valeurs substituées, équation en C, C isolé, vérification.
 * Partagé par l'adaptateur papier et `App6gen24.tsx`.
 */

export const PIEGE_FINAL_QUELLE_PRIMITIVE = "Fixer C à 0 dans la primitive générale, ou remplacer x par a dans f au lieu de F.";
const LETTRES = "abcdefghij";

function etapeFinale(e: ExerciceQuellePrimitive, sq: string): EtapeCorrection[] {
  const P = primitiveLatex(e.exerciceBase);
  const aL = formatFractionLatex(e.aNum, e.aDen);
  const val = e.exerciceBase.primitiveReference(e.a);
  const sub = substituer(P, aL);
  const valE = exact(val);
  const Cv = e.b - val;
  const lignes: LigneCalcul[] = [ligne(`F(x)=${P}+C`, "primitive générale (étape précédente)"), ligne(`F(${aL})=${sub}+C`, [texte("on remplace x par "), latex(aL)])];
  let gauche = sub;
  if (valE !== null && valE !== sub) {
    lignes.push(ligne(valE === "0" ? "=C" : `=${valE}+C`, "on calcule"));
    gauche = valE;
  } else if (valE === null) {
    lignes.push(ligne(`\\approx ${decimalLatex(val, 3)}+C`, "valeur approchée"));
  }
  if (gauche === "0") lignes.push(ligne(`C=${e.b}`, [texte("condition "), latex(`F(${aL})=${e.b}`)]));
  else if (valE === null) {
    // F(a) sans forme exacte courte : on isole C directement (une ligne « F(a) + C = b » serait trop longue).
    lignes.push(ligne(`C=${e.b}-${par(gauche)}`, [texte("condition "), latex(`F(${aL})=${e.b}`), texte(" : on isole C")]));
    lignes.push(...lignesFin(Cv, null, "on calcule"));
  } else {
    lignes.push(ligne(`${gauche}+C=${e.b}`, [texte("condition "), latex(`F(${aL})=${e.b}`)]));
    lignes.push(ligne(`C=${e.b}-${par(gauche)}`, "on isole C"));
    lignes.push(...lignesFin(Cv, null, "on calcule"));
  }
  const reponse = formatReponseAttenduePhaseLatexQuellePrimitive(e, "final");
  const etapes: EtapeCorrection[] = [
    utilise(sq, [texte(`La condition initiale fixe la constante ${cours(2)} : on remplace x par `), latex(aL), texte(" dans la primitive générale "), latex("F(x)+C"), texte(", on égale à "), latex(`${e.b}`), texte(" et on isole "), latex("C"), texte(".")]),
    calcul(sq, lignes),
    resultat(sq, [latex(reponse.join(",\\quad "))]),
  ];
  const CE = exact(Cv);
  if (valE !== null && CE !== null) {
    etapes.push(verification(sq, [texte("On remplace x par "), latex(aL), texte(" dans F : "), latex(`F(${aL})=${valE}+${par(CE)}=${e.b}`), texte(" ✓")]));
  }
  etapes.push(piege(sq, [texte(PIEGE_FINAL_QUELLE_PRIMITIVE)]));
  return etapes;
}

export function correctionDetailleeQuellePrimitive(e: ExerciceQuellePrimitive): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, i) =>
    phase === "final" ? etapeFinale(e, LETTRES[i]) : etapesPhasePrimitive(e.exerciceBase, phase as PhaseCalculPrimitives, LETTRES[i], { derniere: i === phases.length - 2, avecPiege: true }),
  );
}
