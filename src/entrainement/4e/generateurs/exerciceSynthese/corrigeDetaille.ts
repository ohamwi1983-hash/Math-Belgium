import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceSynthese } from "../../core/exerciceSynthese.types";
import { SEQUENCES, type PhaseExerciceSynthese } from "../../moteur/typesExerciceSynthese";
import { versBoiteMoustaches, versDispersion, versMedianeClasses, versMedianeDiscrete, versMoyennePonderee, versMoyennePondereeClasses } from "../../moteur/verificationExerciceSynthese";
import { borneInfBTEtatActuel, borneSupBTEtatActuel } from "../../ui/formatExerciceSynthese";
import { COURS_BT, nb, nbt, net, pc, formulesInsecables } from "../../ui/corrigeStatistique1";
import { etapesCentres, etapesQuotient, etapesSommes } from "../moyennePonderee/corrigeDetaille";
import { etapeLecture, etapeMinMaxMode, etapePolygone, etapeSeuilDiscrete, etapeSyntheseClasses } from "../mediane/corrigeDetaille";
import { etapeTableau, etapeVarianceEcartType } from "../dispersion/corrigeDetaille";
import { etapeTracerBoite } from "../boiteMoustaches/corrigeDetaille";

/**
 * Corrigé détaillé « comme au tableau » de gen35 (exercice de synthèse) — règle
 * `.claude/rules/feuilles-evaluations.md`. UNE étape par écran de l'appli (`SEQUENCES`, 11 écrans en
 * « discrète », 13 en « classes ») ; chaque écran repris d'un générateur source réutilise le
 * constructeur d'étape de ce générateur (gen32, gen33, gen34, gen36) sur l'exercice « mappé »
 * (`versMoyennePonderee`, `versMediane…`, `versDispersion`, `versBoiteMoustaches` — les mêmes que
 * l'écran). Les deux écrans Bienaymé-Tchebychev sont propres à cet exercice.
 */

type E = ExerciceSynthese;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function etapesBtIntervalle(e: E, lettre: string): EtapeCorrection[] {
  const k = e.kBT;
  const s = e.ecartTypeAttendu;
  const inf = borneInfBTEtatActuel(e);
  const sup = borneSupBTEtatActuel(e);
  const brutInf = net(e.xBar - k * s);
  const brutSup = net(e.xBar + k * s);
  const u = e.contexte.unite;
  return [
    utilise(lettre, [
      texte("Inégalité de Bienaymé-Tchebychev : au moins "),
      latex("1-\\dfrac{1}{k^2}"),
      texte(" de l'effectif se trouve dans "),
      latex("[\\bar{x}-k\\sigma\\,;\\,\\bar{x}+k\\sigma]"),
      texte(`, ici avec k = ${k} ; bornes arrondies à l'unité vers l'extérieur ${COURS_BT}.`),
    ]),
    calcul(
      lettre,
      [
        ligne(`\\bar{x}-${k}\\sigma=${nb(e.xBar)}-${k}\\cdot ${nb(s)}`, "borne inférieure"),
        ligne(`=${nb(brutInf)}`),
        ligne(`\\bar{x}+${k}\\sigma=${nb(e.xBar)}+${k}\\cdot ${nb(s)}`, "borne supérieure"),
        ligne(`=${nb(brutSup)}`),
        ligne(
          `I=[${nb(inf.valeur)}\\,;\\,${nb(sup.valeur)}]`,
          inf.exact && sup.exact ? "bornes déjà entières" : `${inf.exact ? "" : `${nbt(brutInf)} arrondi vers le bas`}${!inf.exact && !sup.exact ? ", " : ""}${sup.exact ? "" : `${nbt(brutSup)} arrondi vers le haut`}`,
        ),
      ],
      [texte("Avec "), latex(`\\bar{x}=${nb(e.xBar)}`), texte(" et "), latex(`\\sigma=${nb(s)}`), texte(" (étapes précédentes) :")],
    ),
    resultat(lettre, [latex(`I=[${nb(inf.valeur)}\\,;\\,${nb(sup.valeur)}]`), texte(` (en ${u})`)]),
    piege(lettre, [texte("On arrondit vers l'EXTÉRIEUR (borne inférieure vers le bas, borne supérieure vers le haut) : l'intervalle garanti ne doit pas rétrécir.")]),
  ];
}

function etapesBtPourcent(e: E, lettre: string): EtapeCorrection[] {
  const k = e.kBT;
  return [
    utilise(lettre, [texte("La proportion minimale garantie dans l'intervalle est "), latex("1-\\dfrac{1}{k^2}"), texte(` ${COURS_BT}.`)]),
    calcul(lettre, [
      ligne(`1-\\dfrac{1}{k^2}=1-\\dfrac{1}{${k}^2}`, `k = ${k}`),
      ligne(`=1-\\dfrac{1}{${k * k}}`),
      ligne(`=\\dfrac{${k * k - 1}}{${k * k}}`),
      ligne(`=${pc(e.pourcentAttenduBT)}`, "en pourcentage"),
    ]),
    resultat(lettre, [texte("Au moins "), latex(pc(e.pourcentAttenduBT)), texte(" de l'effectif se trouve dans l'intervalle I.")]),
    piege(lettre, [texte("C'est "), latex("1-\\dfrac{1}{k^2}"), texte(", avec k au carré — pas "), latex("1-\\dfrac{1}{k}"), texte(".")]),
  ];
}

function etapesPhase(e: E, phase: PhaseExerciceSynthese, lettre: string): EtapeCorrection[] {
  const u = e.contexte.unite;
  switch (phase) {
    case "centres":
      return e.variante === "classes" ? etapesCentres(versMoyennePondereeClasses(e), lettre) : [];
    case "sommes":
      return etapesSommes(versMoyennePonderee(e), lettre);
    case "quotient":
      return etapesQuotient(versMoyennePonderee(e), lettre);
    case "mediane":
      return e.variante === "discrete" ? etapeSeuilDiscrete(versMedianeDiscrete(e), lettre, "mediane") : [];
    case "q1":
      return e.variante === "discrete" ? etapeSeuilDiscrete(versMedianeDiscrete(e), lettre, "q1") : [];
    case "q3":
      return e.variante === "discrete" ? etapeSeuilDiscrete(versMedianeDiscrete(e), lettre, "q3") : [];
    case "minMaxMode":
      return e.variante === "discrete" ? etapeMinMaxMode(versMedianeDiscrete(e), lettre) : [];
    case "polygone":
      return e.variante === "classes" ? etapePolygone(versMedianeClasses(e), lettre) : [];
    case "lectureMediane":
      return e.variante === "classes" ? etapeLecture(versMedianeClasses(e), lettre, "mediane") : [];
    case "lectureQ1":
      return e.variante === "classes" ? etapeLecture(versMedianeClasses(e), lettre, "q1") : [];
    case "lectureQ3":
      return e.variante === "classes" ? etapeLecture(versMedianeClasses(e), lettre, "q3") : [];
    case "synthese":
      return e.variante === "classes" ? etapeSyntheseClasses(versMedianeClasses(e), lettre) : [];
    case "boxplot": {
      const b = versBoiteMoustaches(e);
      return etapeTracerBoite(b.valeurs, b.bornePlage, u, lettre);
    }
    case "tableau":
      return etapeTableau(versDispersion(e), lettre);
    case "varianceEcartType":
      return etapeVarianceEcartType(versDispersion(e), lettre);
    case "btIntervalle":
      return etapesBtIntervalle(e, lettre);
    case "btPourcent":
      return etapesBtPourcent(e, lettre);
  }
}

export function correctionDetailleeExerciceSynthese(e: E): EtapeCorrection[] {
  return formulesInsecables(SEQUENCES[e.variante].flatMap((phase, i) => etapesPhase(e, phase, LETTRES[i])));
}

/** Lettre d'étape d'un écran de gen35 (ordre `SEQUENCES`). */
export function lettrePhaseExerciceSynthese(e: E, phase: PhaseExerciceSynthese): string {
  return LETTRES[Math.max(0, SEQUENCES[e.variante].indexOf(phase))];
}
