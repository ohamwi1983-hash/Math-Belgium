/**
 * Couche A — construction des 4 options de l'écran "interpretation" (QCM, écran 7), PARTAGÉE par
 * les 4 familles — même principe que `generateurs/optimisation/interpretation.ts`/
 * `generateurs/equationReference/interpretation.ts` (module frère, jamais importé d'un exercice à
 * l'autre). `choisirTexteDistinct` réplique le mécanisme anti-collision déjà éprouvé pour gen57
 * (`generateurs/equationReference/interpretation.ts`), qui a corrigé un bug réel de textes dupliqués
 * trouvé par Playwright — verrouillé ici dès la conception plutôt que découvert après coup.
 */
import type { IntervalleBorne } from "../../core/equationInequationSecondDegre.types";
import type { OptionInterpretation } from "../../core/optimisation.types";
import { melanger } from "./aleatoire";

interface ParametresCommuns {
  labelVariable: string;
  nomGrandeur: string;
  genreGrandeur: "masculin" | "feminin";
  uniteVariable: string;
  uniteGrandeur: string;
  uniteGrandeurFautive: string;
  k: number;
}

interface ParametresEquation extends ParametresCommuns {
  variante: "equation";
  racinesValides: number[];
  racinesRejetees: number[];
}

interface ParametresInequation extends ParametresCommuns {
  variante: "inequation";
  intervalleValide: IntervalleBorne;
  intervalleBrut: IntervalleBorne;
}

export type ParametresInterpretationEquationInequation = ParametresEquation | ParametresInequation;

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

function accordGenre(mot: string, genre: "masculin" | "feminin"): string {
  return genre === "feminin" ? `${mot}e` : mot;
}

function formatValeurs(valeurs: number[], labelVariable: string): string {
  return valeurs.map((v) => `${labelVariable} = ${v}`).join(" ou ");
}

function phraseAtteintValeurs(p: ParametresCommuns, valeurs: number[], uniteGrandeur: string): string {
  return `${capitaliser(p.nomGrandeur)} ${accordGenre("atteint", p.genreGrandeur)} ${p.k} ${uniteGrandeur} pour ${formatValeurs(valeurs, p.labelVariable)} ${p.uniteVariable}.`;
}

function phraseIntervalle(p: ParametresCommuns, sens: string, intervalle: IntervalleBorne, uniteGrandeur: string): string {
  return `${capitaliser(p.nomGrandeur)} ${sens} ${p.k} ${uniteGrandeur} pour ${p.labelVariable} compris entre ${intervalle.inf} et ${intervalle.sup} ${p.uniteVariable}.`;
}

function choisirTexteDistinct(candidats: string[], dejaUtilises: Set<string>, filet: string): string {
  for (const candidat of candidats) {
    if (!dejaUtilises.has(candidat)) {
      dejaUtilises.add(candidat);
      return candidat;
    }
  }
  let texte = filet;
  while (dejaUtilises.has(texte)) texte += " ";
  dejaUtilises.add(texte);
  return texte;
}

function pronom(genre: "masculin" | "feminin"): string {
  return genre === "feminin" ? "elle" : "il";
}

export interface ParametresQuestionFinaleEquationInequation {
  variante: "equation" | "inequation";
  sens?: "gt" | "lt";
  labelVariable: string;
  nomGrandeur: string;
  genreGrandeur: "masculin" | "feminin";
  k: number;
  uniteGrandeur: string;
}

/** Question finale de l'exercice (ex. "Pour quelle valeur de t la hauteur vaut-elle exactement 45
 * m ?"), affichée PERSISTANTE sur les 7 écrans via `ExerciceEquationInequationCommun.questionFinale`
 * (voir CLAUDE.md, "Question finale persistante") — toujours une chaîne réelle (jamais `null`,
 * contrairement à `ContexteOptimisationCommun.questionFinale` pour les 4 familles de CE générateur :
 * ici c'est la vraie question, pas une question empruntée à gen55). */
export function formatQuestionFinaleEquationInequation(p: ParametresQuestionFinaleEquationInequation): string {
  const pro = pronom(p.genreGrandeur);
  const v = p.labelVariable;
  if (p.variante === "equation") {
    return `Pour quelle valeur de ${v} ${p.nomGrandeur} vaut-${pro} exactement ${p.k} ${p.uniteGrandeur} ?`;
  }
  const relation = p.sens === "gt" ? `dépasse-t-${pro}` : `est-${pro} en dessous de`;
  return `Pour quelles valeurs de ${v} ${p.nomGrandeur} ${relation} ${p.k} ${p.uniteGrandeur} ?`;
}

function optionsEquation(p: ParametresEquation): OptionInterpretation[] {
  const correcte = phraseAtteintValeurs(p, p.racinesValides, p.uniteGrandeur);
  const dejaUtilises = new Set([correcte]);

  const valeursDistracteurs = p.racinesRejetees.length > 0 ? p.racinesRejetees : p.racinesValides.map((v) => -v);

  const candidatsSensInverse = [phraseAtteintValeurs(p, valeursDistracteurs, p.uniteGrandeur), phraseAtteintValeurs(p, p.racinesValides, p.uniteGrandeurFautive)];
  const sensInverse = choisirTexteDistinct(candidatsSensInverse, dejaUtilises, phraseAtteintValeurs(p, [p.k], p.uniteGrandeur));

  const candidatsUniteFautive = [phraseAtteintValeurs(p, p.racinesValides, p.uniteGrandeurFautive), phraseAtteintValeurs(p, valeursDistracteurs, p.uniteGrandeurFautive)];
  const uniteFautive = choisirTexteDistinct(candidatsUniteFautive, dejaUtilises, phraseAtteintValeurs(p, p.racinesValides, p.uniteGrandeurFautive) + " ");

  const candidatsVariableConfondue = [phraseAtteintValeurs(p, [p.k], p.uniteGrandeur)];
  const variableConfondue = choisirTexteDistinct(candidatsVariableConfondue, dejaUtilises, phraseAtteintValeurs(p, [p.k], p.uniteGrandeur) + " ");

  return melanger([
    { texte: correcte, correcte: true },
    { texte: sensInverse, correcte: false },
    { texte: uniteFautive, correcte: false },
    { texte: variableConfondue, correcte: false },
  ]);
}

function optionsInequation(p: ParametresInequation): OptionInterpretation[] {
  const sensTexte = "dépasse";
  const correcte = phraseIntervalle(p, sensTexte, p.intervalleValide, p.uniteGrandeur);
  const dejaUtilises = new Set([correcte]);

  // "sens inverse" — le piège central de la spec : oublier la validation contextuelle (intersection
  // avec le domaine) et donner l'intervalle BRUT tel quel.
  const candidatsSensInverse = [
    phraseIntervalle(p, sensTexte, p.intervalleBrut, p.uniteGrandeur),
    phraseIntervalle(p, sensTexte, { inf: -p.intervalleValide.sup, sup: -p.intervalleValide.inf }, p.uniteGrandeur),
  ];
  const sensInverse = choisirTexteDistinct(candidatsSensInverse, dejaUtilises, phraseIntervalle(p, sensTexte, p.intervalleBrut, p.uniteGrandeur) + " ");

  const candidatsUniteFautive = [phraseIntervalle(p, sensTexte, p.intervalleValide, p.uniteGrandeurFautive)];
  const uniteFautive = choisirTexteDistinct(candidatsUniteFautive, dejaUtilises, phraseIntervalle(p, sensTexte, p.intervalleValide, p.uniteGrandeurFautive) + " ");

  const candidatsVariableConfondue = [phraseAtteintValeurs(p, [p.k], p.uniteGrandeur)];
  const variableConfondue = choisirTexteDistinct(candidatsVariableConfondue, dejaUtilises, phraseAtteintValeurs(p, [p.k], p.uniteGrandeur) + " ");

  return melanger([
    { texte: correcte, correcte: true },
    { texte: sensInverse, correcte: false },
    { texte: uniteFautive, correcte: false },
    { texte: variableConfondue, correcte: false },
  ]);
}

export function construireOptionsInterpretationEquationInequation(p: ParametresInterpretationEquationInequation): OptionInterpretation[] {
  return p.variante === "equation" ? optionsEquation(p) : optionsInequation(p);
}
