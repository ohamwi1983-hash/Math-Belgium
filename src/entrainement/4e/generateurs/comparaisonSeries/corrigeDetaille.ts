import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceComparaisonSeries, QuestionSeuil, SerieComparaison } from "../../core/comparaisonSeries.types";
import { segmentsCentrageAttendu, segmentsDispersionAttendu, segmentsInterpretationAttendu, texteProfilSerie, type SegmentTexte } from "../../ui/formatComparaisonSeries";
import { construireSvgCourbesCumulees, type MarqueurCourbeCumulee, type SeuilCourbeCumulee } from "../../ui/figureComparaisonSeries";
import { COURS_COMPARER, COURS_DISPERSION, COURS_FREQUENCES, COURS_POSITION, cumulesDe, egalOuEnviron, indiceSeuil, nb, nbp, nbTexte, formulesInsecables } from "../../ui/corrigeStatistique2";

/**
 * Corrigé détaillé « comme au tableau » de gen38 (comparaison de deux séries) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « Lectures graphiques et décisions » (une ligne
 * par chose lue, avec une relation, la justification dit où on lit). Un seul écran (lettre « a ») ;
 * la source des indicateurs dépend de la présentation : tableau récapitulatif (lu), tableaux xᵢ/nᵢ
 * (effectifs cumulés, règle du seuil) ou courbes cumulées (premier point au-dessus du seuil, figure
 * annotée). Partagé par l'adaptateur papier et l'appli (`AppComparaisonSeries.tsx`).
 */

type E = ExerciceComparaisonSeries;
type Fragments = FragmentConsigne[];
type Nom = "A" | "B";
const SQ = "a";

const INDICE = ["", "₁", "₂", "₃"];

function serieDe(e: E, s: Nom): SerieComparaison {
  return s === "A" ? e.serieA : e.serieB;
}

function frequence(e: E): boolean {
  return e.variante === "graphique" && e.cumul === "frequence";
}

function versFragments(segments: SegmentTexte[]) {
  return segments.map((s) => (s.type === "katex" ? latex(s.valeur) : texte(s.valeur)));
}

/** Réponse d'une question « seuil » (« 8 individus », « 35 % »). */
export function texteReponseSeuil(question: QuestionSeuil): string {
  if (question.estFrequence) return `${nbTexte(question.reponseAttendue)} %`;
  return `${nbTexte(question.reponseAttendue)} ${question.reponseAttendue === 1 ? "individu" : "individus"}`;
}

/** Valeur du quartile `k` (1, 2, 3) par la règle du seuil (premier cumulé > k·n/4) : indice de la ligne. */
function indiceQuartile(serie: SerieComparaison, k: 1 | 2 | 3): number {
  return indiceSeuil(cumulesDe(serie.lignes.map((l) => l.effectif)), (k * serie.n) / 4);
}

function valeurQuartile(serie: SerieComparaison, k: 1 | 2 | 3): number {
  return k === 1 ? serie.q1 : k === 2 ? serie.mediane : serie.q3;
}

/** Lecture d'un quartile Qₖ de la série `s` : seuil, puis la valeur (avec où on la lit). */
function lignesQuartile(e: E, s: Nom, k: 1 | 2 | 3): LigneCalcul[] {
  const serie = serieDe(e, s);
  const valeur = valeurQuartile(serie, k);
  const nom = `Q_${k}(${s})`;
  if (e.variante === "recapitulatif") return [ligne(`${nom}=${nb(valeur)}`, `ligne Q${INDICE[k]} du tableau récapitulatif, série ${s}`)];
  const i = indiceQuartile(serie, k);
  const l = serie.lignes[i]!;
  const fraction = k === 2 ? "\\dfrac{n}{2}" : k === 1 ? "\\dfrac{n}{4}" : "\\dfrac{3n}{4}";
  if (frequence(e)) {
    return [ligne(`${nom}=${nb(valeur)}`, `premier point de la courbe ${s} au-dessus de ${k * 25} % : (${nbTexte(l.valeur)} ; ${l.frequenceCumulee} %)`)];
  }
  const seuil = (k * serie.n) / 4;
  const ou = e.variante === "graphique" ? `premier point de la courbe ${s} au-dessus de ${nbTexte(seuil)} : (${nbTexte(l.valeur)} ; ${l.effectifCumule})` : `premier effectif cumulé > ${nbTexte(seuil)} : ${l.effectifCumule}, à la valeur ${nbTexte(l.valeur)}`;
  return [ligne(`${fraction}=${k === 3 ? `\\dfrac{3\\times ${serie.n}}{4}` : `\\dfrac{${serie.n}}{${k === 2 ? 2 : 4}}`}`, `seuil de Q${INDICE[k]}, série ${s} (n = ${serie.n})`), ligne(`=${nb(seuil)}`), ligne(`${nom}=${nb(valeur)}`, ou)];
}

function lignesEcartInterquartile(e: E, s: Nom): LigneCalcul[] {
  const serie = serieDe(e, s);
  return [ligne(`Q_3(${s})-Q_1(${s})=${nb(serie.q3)}-${nbp(serie.q1)}`, `écart interquartile de la série ${s}`), ligne(`=${nb(serie.ecartInterquartile)}`)];
}

/** σ d'une série : lu (récapitulatif) ou calculé à partir des valeurs lues (courbes). */
function lignesSigma(e: E, s: Nom): LigneCalcul[] {
  const serie = serieDe(e, s);
  if (e.variante === "recapitulatif") return [ligne(`\\sigma(${s})=${nb(serie.sigma)}`, `ligne σ du tableau récapitulatif, série ${s}`)];
  const freq = frequence(e);
  const poids = serie.lignes.map((l, i) => (freq ? l.frequenceCumulee - (serie.lignes[i - 1]?.frequenceCumulee ?? 0) : l.effectif));
  const total = freq ? 100 : serie.n;
  const somme = serie.lignes.reduce((acc, l, i) => acc + l.valeur * poids[i]!, 0);
  const w = freq ? "f_i" : "n_i";
  return [
    ligne(`\\bar{x}(${s})=\\dfrac{\\Sigma x_i ${w}}{${freq ? "100" : "n"}}`, `valeurs et ${freq ? "fréquences lues" : "effectifs lus"} sur la courbe ${s} (saut de la courbe à chaque valeur)`),
    ligne(`=\\dfrac{${nb(somme)}}{${total}}`),
    ligne(egalOuEnviron(somme / total, 2)),
    ligne(`V(${s})=\\dfrac{\\Sigma (x_i-\\bar{x})^2\\, ${w}}{${freq ? "100" : "n"}}\\approx ${nb(serie.variance)}`, "calculatrice (mode statistique), arrondie à 2 décimales"),
    ligne(`\\sigma(${s})=\\sqrt{${nb(serie.variance)}}${egalOuEnviron(Math.sqrt(serie.variance), 2).startsWith("=") ? "=" : "\\approx "}${nb(serie.sigma)}`, "écart-type : racine de la variance arrondie"),
  ];
}

/** Comparaison de deux nombres, relation vraie (« 4 < 7 »). */
function comparaison(a: number, b: number, justification: string): LigneCalcul {
  return ligne(`${nb(a)}${a < b ? "<" : a > b ? ">" : "="}${nb(b)}`, justification);
}

function figure(e: E, quartiles: (1 | 2 | 3)[], marqueursSeuil: MarqueurCourbeCumulee[] = []): string | undefined {
  if (e.variante !== "graphique") return undefined;
  const cumul = e.cumul ?? "effectif";
  const marqueurs: MarqueurCourbeCumulee[] = [...marqueursSeuil];
  const seuils: SeuilCourbeCumulee[] = [];
  for (const k of quartiles) {
    for (const s of ["A", "B"] as Nom[]) {
      const serie = serieDe(e, s);
      marqueurs.push({ serie: s, valeur: valeurQuartile(serie, k), label: `Q${INDICE[k]}` });
      if (cumul === "frequence") {
        if (s === "A") seuils.push({ y: k * 25 });
      } else seuils.push({ y: (k * serie.n) / 4, serie: e.serieA.n === e.serieB.n ? undefined : s });
    }
  }
  const uniques = seuils.filter((s, i) => seuils.findIndex((t) => t.y === s.y && t.serie === s.serie) === i);
  return construireSvgCourbesCumulees(e.serieA, e.serieB, cumul, e.contexte.unite, marqueurs, uniques);
}

const SEUILS_LATEX = "\\dfrac{n}{4},\\ \\dfrac{n}{2},\\ \\dfrac{3n}{4}";

function source(e: E): Fragments {
  if (e.variante === "recapitulatif") return [texte(" On les lit dans le tableau récapitulatif.")];
  if (e.variante === "graphique" && e.cumul === "frequence") return [texte(" Sur une courbe cumulée, "), latex("Q_k"), texte(" est la première valeur dont le point dépasse strictement 25 %, 50 % ou 75 %.")];
  if (e.variante === "graphique") return [texte(" Sur une courbe cumulée, "), latex("Q_k"), texte(" est la première valeur dont le point dépasse strictement le seuil "), latex(SEUILS_LATEX), texte(".")];
  return [texte(" Dans un tableau, "), latex("Q_k"), texte(" est la première valeur dont l'effectif cumulé dépasse strictement le seuil "), latex(SEUILS_LATEX), texte(".")];
}

function avecFigure(etape: EtapeCorrection, f: string | undefined): EtapeCorrection {
  return f ? { ...etape, figureHtml: f } : etape;
}

function corrigeCentrage(e: E): EtapeCorrection[] {
  const q = e.question;
  if (q.type !== "centrage") return [];
  return [
    utilise(SQ, [
      texte("La médiane "),
      latex("Q_2"),
      texte(" partage une série en deux moitiés de même effectif : c'est la première valeur dont l'effectif cumulé dépasse strictement "),
      latex("\\dfrac{n}{2}"),
      texte(` ${COURS_POSITION}. On compare les médianes des deux séries ${COURS_COMPARER}.`),
      ...source(e),
    ]),
    avecFigure(calcul(SQ, [...lignesQuartile(e, "A", 2), ...lignesQuartile(e, "B", 2), comparaison(e.serieA.mediane, e.serieB.mediane, "on compare Q₂(A) et Q₂(B)")]), figure(e, [2])),
    resultat(SQ, versFragments(segmentsCentrageAttendu(q))),
    piege(SQ, [texte("Comparer les étendues ou les valeurs maximales ne renseigne pas sur la position du milieu de la série.")]),
  ];
}

function corrigeDispersion(e: E): EtapeCorrection[] {
  const q = e.question;
  if (q.type !== "dispersion") return [];
  const blocIqr = calcul(SQ, [...lignesQuartile(e, "A", 1), ...lignesQuartile(e, "A", 3), ...lignesEcartInterquartile(e, "A"), ...lignesQuartile(e, "B", 1), ...lignesQuartile(e, "B", 3), ...lignesEcartInterquartile(e, "B"), comparaison(e.serieA.ecartInterquartile, e.serieB.ecartInterquartile, "écarts interquartiles de A et de B")], [], "Écart interquartile");
  const blocs: EtapeCorrection[] = [avecFigure(blocIqr, figure(e, [1, 3]))];
  if (q.nombreArguments === 2) blocs.push(calcul(SQ, [...lignesSigma(e, "A"), ...lignesSigma(e, "B"), comparaison(e.serieA.sigma, e.serieB.sigma, "écarts-types de A et de B")], [], "Écart-type"));
  return [
    utilise(SQ, [
      texte("Une série est d'autant plus homogène que ses valeurs sont peu dispersées : on compare l'écart interquartile "),
      latex("Q_3-Q_1"),
      texte(` ${COURS_POSITION}`),
      ...(q.nombreArguments === 2 ? [texte(" et l'écart-type "), latex("\\sigma"), texte(` ${COURS_DISPERSION}`)] : []),
      texte(" des deux séries — le plus petit l'emporte."),
      ...source(e),
      ...(q.nombreArguments === 2 && e.variante === "graphique"
        ? [texte(" Les courbes ne donnent pas "), latex("\\sigma"), texte(" : on le calcule à partir des valeurs lues (chaque saut d'une courbe donne une valeur et son " + (frequence(e) ? "pourcentage" : "effectif") + "), calculatrice en mode statistique.")]
        : []),
    ]),
    ...blocs,
    resultat(SQ, [...versFragments(segmentsDispersionAttendu(q)), texte(q.nombreArguments === 2 ? " Les deux mesures vont dans le même sens : ce sont les deux arguments." : " Une seule mesure suffit comme argument.")]),
    piege(SQ, [texte("L'étendue (max − min) ne dépend que des deux valeurs extrêmes : elle n'est pas un argument valable d'homogénéité.")]),
  ];
}

function corrigeSeuil(e: E): EtapeCorrection[] {
  const q = e.question;
  if (q.type !== "seuil") return [];
  const serie = serieDe(e, q.serie);
  const cumul = (i: number) => (q.estFrequence ? serie.lignes[i]!.frequenceCumulee : serie.lignes[i]!.effectifCumule);
  const pc = q.estFrequence ? "\\,\\%" : "";
  const lettre = q.estFrequence ? "F" : "N";
  const haut = serie.lignes[q.indexHaut]!;
  const ou = (i: number) => {
    const l = serie.lignes[i]!;
    if (e.variante === "graphique") return `ordonnée du point d'abscisse ${nbTexte(l.valeur)} sur la courbe ${q.serie}`;
    return `colonne « effectif cumulé », ligne ${nbTexte(l.valeur)} de la série ${q.serie}`;
  };
  const lignes: LigneCalcul[] = [ligne(`${lettre}_{\\leq ${nb(haut.valeur)}}=${nb(cumul(q.indexHaut))}${pc}`, ou(q.indexHaut))];
  if (q.indexBas !== null) {
    const bas = serie.lignes[q.indexBas]!;
    lignes.push(ligne(`${lettre}_{\\leq ${nb(bas.valeur)}}=${nb(cumul(q.indexBas))}${pc}`, ou(q.indexBas)));
    lignes.push(ligne(`${lettre}_{]${nb(bas.valeur)}\\,;\\,${nb(haut.valeur)}]}=${lettre}_{\\leq ${nb(haut.valeur)}}-${lettre}_{\\leq ${nb(bas.valeur)}}`, `on retire ceux qui ont au plus ${nbTexte(bas.valeur)}`));
    lignes.push(ligne(`=${nb(cumul(q.indexHaut))}${pc}-${nb(cumul(q.indexBas))}${pc}`));
    lignes.push(ligne(`=${nb(q.reponseAttendue)}${pc}`));
  }
  const marqueurs: MarqueurCourbeCumulee[] = [
    ...(q.indexBas !== null ? [{ serie: q.serie, valeur: serie.lignes[q.indexBas]!.valeur, label: `${nbTexte(cumul(q.indexBas))}${q.estFrequence ? " %" : ""}` }] : []),
    { serie: q.serie, valeur: haut.valeur, label: `${nbTexte(cumul(q.indexHaut))}${q.estFrequence ? " %" : ""}` },
  ];
  return [
    utilise(SQ, [
      texte(`${q.estFrequence ? "La fréquence cumulée" : "L'effectif cumulé"} à une valeur compte les individus dont la valeur est inférieure ou égale à elle ${COURS_FREQUENCES}${q.indexBas === null ? "." : " ; pour une tranche ]a ; b], on retire le cumul en a du cumul en b."}${e.variante === "graphique" ? ` On le lit sur la courbe ${q.serie} ${COURS_COMPARER}.` : ""}`),
    ]),
    avecFigure(calcul(SQ, lignes), figure(e, [], marqueurs)),
    resultat(SQ, [texte(`${texteReponseSeuil(q)}.`)]),
    piege(SQ, [texte("C'est l'effectif CUMULÉ qui compte les individus jusqu'à une valeur — pas l'effectif de la seule ligne de cette valeur.")]),
  ];
}

function corrigeInterpretation(e: E): EtapeCorrection[] {
  const q = e.question;
  if (q.type !== "interpretation") return [];
  const recap = e.variante === "recapitulatif";
  const niveau = calcul(SQ, [...lignesQuartile(e, "A", 2), ...lignesQuartile(e, "B", 2), comparaison(e.serieA.mediane, e.serieB.mediane, "niveau : on compare les médianes")], [], "Niveau (médianes)");
  const dispersion = recap
    ? calcul(SQ, [...lignesSigma(e, "A"), ...lignesSigma(e, "B"), comparaison(e.serieA.sigma, e.serieB.sigma, "homogénéité : on compare les écarts-types")], [], "Dispersion")
    : calcul(SQ, [...lignesQuartile(e, "A", 1), ...lignesQuartile(e, "A", 3), ...lignesEcartInterquartile(e, "A"), ...lignesQuartile(e, "B", 1), ...lignesQuartile(e, "B", 3), ...lignesEcartInterquartile(e, "B"), comparaison(e.serieA.ecartInterquartile, e.serieB.ecartInterquartile, "homogénéité : on compare les écarts interquartiles")], [], "Dispersion");
  return [
    utilise(SQ, [
      texte(`Le niveau général se compare avec les médianes ${COURS_POSITION}, l'homogénéité avec une mesure de dispersion (${recap ? "écart-type" : "écart interquartile"}) : la plus petite désigne la série la plus homogène ${COURS_COMPARER}.`),
      ...source(e),
    ]),
    avecFigure(niveau, figure(e, [1, 2, 3])),
    dispersion,
    resultat(SQ, [...versFragments(segmentsInterpretationAttendu(q)), texte(` Série A : ${texteProfilSerie(e, "A")}. Série B : ${texteProfilSerie(e, "B")}.`)]),
    piege(SQ, [texte("Ne pas confondre le niveau (la médiane) et l'homogénéité (la dispersion) : la série la plus homogène n'est pas forcément la plus élevée.")]),
  ];
}

function correctionDetailleeComparaisonSeriesBrut(e: E): EtapeCorrection[] {
  switch (e.question.type) {
    case "centrage":
      return corrigeCentrage(e);
    case "dispersion":
      return corrigeDispersion(e);
    case "seuil":
      return corrigeSeuil(e);
    case "interpretation":
      return corrigeInterpretation(e);
  }
}

export function correctionDetailleeComparaisonSeries(e: E): EtapeCorrection[] {
  return formulesInsecables(correctionDetailleeComparaisonSeriesBrut(e));
}
