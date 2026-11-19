import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { CinqNombres, ExerciceBoiteMoustaches, ExerciceBoiteMoustachesComparaison, PlageAxe } from "../../core/boiteMoustaches.types";
import { LABEL_Q1, LABEL_Q2, LABEL_Q3, LABEL_X_MAX, LABEL_X_MIN } from "../../ui/formatBoiteMoustaches";
import { COURS_BOITE, nb, nbp, nbt, formulesInsecables } from "../../ui/corrigeStatistique1";
import { construireSvgBoiteMoustaches } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen36 (boîte à moustaches) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « Lectures graphiques et décisions » (une
 * ligne par chose lue ou placée, avec une relation ; la justification dit où). Étapes = écrans :
 * construction (a, figure attendue), lecture (a), comparaison (a médianes, b écarts interquartiles).
 * `etapeTracerBoite` est réutilisée par l'exercice de synthèse (gen35, écran « boxplot »).
 */

const OU_PLACER: Record<keyof CinqNombres, string> = {
  min: "extrémité gauche de la moustache",
  q1: "bord gauche de la boîte",
  mediane: "trait à l'intérieur de la boîte",
  q3: "bord droit de la boîte",
  max: "extrémité droite de la moustache",
};
const SYMBOLE: Record<keyof CinqNombres, string> = { min: LABEL_X_MIN, q1: LABEL_Q1, mediane: LABEL_Q2, q3: LABEL_Q3, max: LABEL_X_MAX };
const ORDRE: (keyof CinqNombres)[] = ["min", "q1", "mediane", "q3", "max"];

function resultatBoite(v: CinqNombres, unite: string) {
  return [
    texte("Boîte de "),
    latex(`${LABEL_Q1}=${nb(v.q1)}`),
    texte(" à "),
    latex(`${LABEL_Q3}=${nb(v.q3)}`),
    texte(", trait de la médiane en "),
    latex(`${LABEL_Q2}=${nb(v.mediane)}`),
    texte(", moustaches de "),
    latex(`${LABEL_X_MIN}=${nb(v.min)}`),
    texte(" à "),
    latex(`${LABEL_X_MAX}=${nb(v.max)}`),
    texte(` (en ${unite}).`),
  ];
}

/** Tracer une boîte à moustaches à partir de ses cinq valeurs (placement : écran de lecture). */
export function etapeTracerBoite(v: CinqNombres, plage: PlageAxe, unite: string, lettre: string): EtapeCorrection[] {
  return [
    utilise(lettre, [
      texte("On gradue régulièrement un axe, puis la boîte va de "),
      latex(LABEL_Q1),
      texte(" à "),
      latex(LABEL_Q3),
      texte(", un trait marque la médiane "),
      latex(LABEL_Q2),
      texte(" à sa valeur, et les moustaches vont jusqu'à "),
      latex(LABEL_X_MIN),
      texte(" et "),
      latex(LABEL_X_MAX),
      texte(` ${COURS_BOITE}.`),
    ]),
    {
      ...calcul(lettre, ORDRE.map((c) => ligne(`${SYMBOLE[c]}=${nb(v[c])}`, OU_PLACER[c])), [texte(`Axe gradué de ${nbt(plage.min)} à ${nbt(plage.max)} (${unite}) :`)]),
      // La réponse est un graphique : la boîte attendue, valeurs écrites.
      figureHtml: construireSvgBoiteMoustaches(plage, [{ valeurs: v }], true),
    },
    resultat(lettre, [texte("Boîte à moustaches ci-dessus. "), ...resultatBoite(v, unite)]),
    piege(lettre, [texte("La médiane se place à SA valeur sur l'axe, pas au milieu de la boîte.")]),
  ];
}

function etapeLireBoite(v: CinqNombres, plage: PlageAxe, unite: string, lettre: string): EtapeCorrection[] {
  return [
    utilise(lettre, [
      texte("Les extrémités des moustaches donnent "),
      latex(LABEL_X_MIN),
      texte(" et "),
      latex(LABEL_X_MAX),
      texte(", les bords de la boîte "),
      latex(LABEL_Q1),
      texte(" et "),
      latex(LABEL_Q3),
      texte(", le trait intérieur la médiane "),
      latex(LABEL_Q2),
      texte(` ${COURS_BOITE}.`),
    ]),
    {
      ...calcul(lettre, ORDRE.map((c) => ligne(`${SYMBOLE[c]}=${nb(v[c])}`, `on lit : ${OU_PLACER[c]}`))),
      figureHtml: construireSvgBoiteMoustaches(plage, [{ valeurs: v }], true),
    },
    resultat(lettre, [
      latex(`${LABEL_X_MIN}=${nb(v.min)}`),
      texte(" ; "),
      latex(`${LABEL_Q1}=${nb(v.q1)}`),
      texte(" ; "),
      latex(`${LABEL_Q2}=${nb(v.mediane)}`),
      texte(" ; "),
      latex(`${LABEL_Q3}=${nb(v.q3)}`),
      texte(" ; "),
      latex(`${LABEL_X_MAX}=${nb(v.max)}`),
      texte(` (en ${unite})`),
    ]),
    piege(lettre, [texte("La médiane est le trait à l'intérieur de la boîte, pas forcément son milieu.")]),
  ];
}

function etapesComparaison(e: ExerciceBoiteMoustachesComparaison): EtapeCorrection[] {
  const { serieA: A, serieB: B } = e;
  const u = e.contexte.unite;
  const gM = e.medianePlusGrande;
  const pM = gM === "A" ? "B" : "A";
  const med = { A: A.mediane, B: B.mediane };
  const ei = { A: A.q3 - A.q1, B: B.q3 - B.q1 };
  const gD = e.ecartInterquartilePlusGrand;
  const pD = gD === "A" ? "B" : "A";
  const etA = A.max - A.min;
  const etB = B.max - B.min;
  const piegeEtendue = etA !== etB && (etA > etB ? "A" : "B") !== gD;
  return [
    utilise("a", [texte(`On lit la médiane de chaque série — le trait à l'intérieur de sa boîte — puis on compare les deux valeurs ${COURS_BOITE}.`)]),
    {
      ...calcul("a", [
        ligne(`${LABEL_Q2}(A)=${nb(A.mediane)}`, "trait intérieur de la boîte A"),
        ligne(`${LABEL_Q2}(B)=${nb(B.mediane)}`, "trait intérieur de la boîte B"),
        ligne(`${nb(med[gM])}>${nb(med[pM])}`, `la médiane de ${gM} dépasse celle de ${pM}`),
      ]),
      figureHtml: construireSvgBoiteMoustaches(e.bornePlage, [
        { valeurs: A, label: "A" },
        { valeurs: B, label: "B" },
      ], true),
    },
    resultat("a", [texte(`La série ${gM} a la plus grande médiane : `), latex(`${LABEL_Q2}=${nb(med[gM])}`), texte(` contre ${nbt(med[pM])} (en ${u}).`)]),
    utilise("b", [texte("La dispersion se compare avec l'écart interquartile "), latex(`${LABEL_Q3}-${LABEL_Q1}`), texte(`, la largeur de la boîte ${COURS_BOITE}.`)]),
    calcul("b", [
      ligne(`${LABEL_Q3}(A)-${LABEL_Q1}(A)=${nb(A.q3)}-${nbp(A.q1)}=${nb(ei.A)}`, "largeur de la boîte A"),
      ligne(`${LABEL_Q3}(B)-${LABEL_Q1}(B)=${nb(B.q3)}-${nbp(B.q1)}=${nb(ei.B)}`, "largeur de la boîte B"),
      ligne(`${nb(ei[gD])}>${nb(ei[pD])}`, `la boîte ${gD} est la plus large`),
    ]),
    resultat("b", [texte(`La série ${gD} est la plus dispersée (écart interquartile ${nbt(ei[gD])} contre ${nbt(ei[pD])}).`)]),
    piege("b", [
      texte(
        piegeEtendue
          ? "Ici, la série aux moustaches les plus longues (la plus étendue) n'est PAS la plus dispersée au sens de l'écart interquartile : on compare la largeur des boîtes."
          : "On compare la largeur des boîtes (écart interquartile), pas la longueur totale des moustaches.",
      ),
    ]),
  ];
}

export function correctionDetailleeBoiteMoustaches(e: ExerciceBoiteMoustaches): EtapeCorrection[] {
  if (e.variante === "construction") return formulesInsecables(etapeTracerBoite(e.valeurs, e.bornePlage, e.contexte.unite, "a"));
  if (e.variante === "lecture") return formulesInsecables(etapeLireBoite(e.valeurs, e.bornePlage, e.contexte.unite, "a"));
  return formulesInsecables(etapesComparaison(e));
}

/** Lettre d'étape d'un écran de gen36. */
export function lettrePhaseBoiteMoustaches(phase: string): string {
  return phase === "comparaisonDispersions" ? "b" : "a";
}
