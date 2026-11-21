import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceReductionVectorielle, TermeReduction } from "../../core/reductionVectorielle.types";
import { formatExpressionLatex } from "../../ui/formatReductionVectorielle";
import { COURS_CHASLES, COURS_OPPOSES, finaliserCorrigeVecteurs, q, sansDoublons, vec, type Fragments } from "../../ui/corrigeVecteurs1";
import { construireFigureReductionHtml, type FlecheFigure } from "./figureHtml";

/**
 * Corrigé détaillé « comme au tableau » de gen27 « Réduction d'une somme de vecteurs (Chasles) »
 * (un écran, lettre « a ») — règle `.claude/rules/feuilles-evaluations.md`. Termes opposés annulés
 * (k\vec{RS} + k\vec{SR} = k\vec{RR} = \vec{0}), vecteurs précédés de « − » retournés, chaîne rangée
 * bout à bout puis relation de Chasles un raccord à la fois ; figure du corrigé : la chaîne et le
 * vecteur réduit. Partagé par l'adaptateur et l'appli (`AppReductionVectorielle.tsx`).
 */

export function formatTermeLatex(terme: TermeReduction, estSuite: boolean): string {
  const { coefficient, origine, arrivee } = terme;
  const signe = coefficient < 0 ? "-" : estSuite ? "+" : "";
  const abs = Math.abs(coefficient);
  return `${signe}${abs === 1 ? "" : String(abs)}\\vec{${origine}${arrivee}}`;
}

export function formatTermesArbitraires(termes: TermeReduction[]): string {
  return termes.map((t, i) => formatTermeLatex(t, i > 0)).join("");
}

/** Paires de termes opposés de même coefficient (k\vec{RS} + k\vec{SR}) et termes restants. */
export function detecterAnnulations(termes: TermeReduction[]): { annulations: [TermeReduction, TermeReduction][]; restants: TermeReduction[] } {
  const utilises = new Set<number>();
  const annulations: [TermeReduction, TermeReduction][] = [];
  for (let i = 0; i < termes.length; i++) {
    if (utilises.has(i)) continue;
    for (let j = i + 1; j < termes.length; j++) {
      if (utilises.has(j)) continue;
      const a = termes[i];
      const b = termes[j];
      if (a.origine === b.arrivee && a.arrivee === b.origine && a.coefficient === b.coefficient) {
        annulations.push([a, b]);
        utilises.add(i);
        utilises.add(j);
        break;
      }
    }
  }
  return { annulations, restants: termes.filter((_, i) => !utilises.has(i)) };
}

/** Termes restants (coefficients ±1) rangés en chaîne de `depart` à `arrivee`, dans le bon sens. */
export function reconstituerChemin(restants: TermeReduction[], depart: string, arrivee: string): TermeReduction[] | null {
  if (restants.length === 0 || restants.some((t) => Math.abs(t.coefficient) !== 1)) return null;
  const aretes = restants.map((t) => (t.coefficient === 1 ? { origine: t.origine, arrivee: t.arrivee } : { origine: t.arrivee, arrivee: t.origine }));
  const disponibles = new Set(aretes.map((_, i) => i));
  const chemin: { origine: string; arrivee: string }[] = [];
  let courant = depart;
  while (courant !== arrivee) {
    const idx = [...disponibles].find((i) => aretes[i].origine === courant);
    if (idx === undefined) return null;
    chemin.push(aretes[idx]);
    disponibles.delete(idx);
    courant = aretes[idx].arrivee;
  }
  if (disponibles.size > 0) return null;
  return chemin.map((e) => ({ origine: e.origine, arrivee: e.arrivee, coefficient: 1 }));
}

function lignesAnnulation([a, b]: [TermeReduction, TermeReduction]): LigneCalcul[] {
  const k = a.coefficient;
  const somme = `${formatTermeLatex(a, false)}${formatTermeLatex(b, true)}`;
  const kTxt = k === 1 ? "" : k === -1 ? "-" : q(k);
  const R = a.origine;
  if (k === 1) return [ligne(`${somme}=${vec(`${R}${R}`)}`, "relation de Chasles"), ligne(`=\\vec{0}`, "vecteur nul")];
  return [ligne(`${somme}=${kTxt}(${vec(`${a.origine}${a.arrivee}`)}+${vec(`${b.origine}${b.arrivee}`)})`, "on met le coefficient en évidence"), ligne(`=${kTxt}${vec(`${R}${R}`)}`, "relation de Chasles"), ligne(`=\\vec{0}`, "vecteur nul")];
}

export function correctionDetailleeReductionVectorielle(e: ExerciceReductionVectorielle): EtapeCorrection[] {
  const l = "a";
  const { termes, pointDepart: D, pointArrivee: F } = e;
  const { annulations, restants } = detecterAnnulations(termes);
  const chemin = reconstituerChemin(restants, D, F);
  const etapes: EtapeCorrection[] = [
    utilise(l, [
      texte("Relation de Chasles : "),
      latex("\\vec{RS}+\\vec{ST}=\\vec{RT}"),
      texte(` ${COURS_CHASLES} ; un vecteur précédé de « − » se retourne : `),
      latex("-\\vec{SR}=\\vec{RS}"),
      texte(` ${COURS_OPPOSES} ; deux termes opposés de même coefficient s'annulent : `),
      latex("k\\vec{RS}+k\\vec{SR}=\\vec{0}"),
      texte("."),
    ]),
  ];
  annulations.forEach((paire, i) => etapes.push(calcul(l, lignesAnnulation(paire), [], annulations.length > 1 ? `Termes opposés (${i + 1})` : "Termes opposés")));

  const depart = formatExpressionLatex(e);
  // Membres successifs de la chaîne (un seul changement par ligne).
  const membres: { latex: string; justification: Fragments | string }[] = [];
  const pousser = (latexMembre: string, justification: Fragments | string) => {
    const prec = membres.length ? membres[membres.length - 1]!.latex : depart;
    if (prec !== latexMembre) membres.push({ latex: latexMembre, justification });
  };
  if (annulations.length) pousser(formatTermesArbitraires(restants), annulations.length > 1 ? "les paires de termes opposés s'annulent" : "la paire de termes opposés s'annule");
  if (chemin) {
    const retournes = restants.map((t) => (t.coefficient === -1 ? { origine: t.arrivee, arrivee: t.origine, coefficient: 1 } : t));
    pousser(formatTermesArbitraires(retournes), [texte("on retourne chaque vecteur précédé de « − » : "), latex("-\\vec{SR}=\\vec{RS}")]);
    pousser(formatTermesArbitraires(chemin), "on range les vecteurs bout à bout");
    let courant = chemin;
    while (courant.length > 1) {
      const [t1, t2, ...reste] = courant;
      const fusion: TermeReduction = { origine: t1.origine, arrivee: t2.arrivee, coefficient: 1 };
      courant = [fusion, ...reste];
      pousser(formatTermesArbitraires(courant), [texte("Chasles : "), latex(`${vec(`${t1.origine}${t1.arrivee}`)}+${vec(`${t2.origine}${t2.arrivee}`)}=${vec(`${fusion.origine}${fusion.arrivee}`)}`)]);
    }
  } else {
    pousser(vec(`${D}${F}`), "relation de Chasles, raccord après raccord");
  }
  // Somme nommée \\vec{w} : membre de gauche court, la colonne des calculs garde sa largeur.
  // Avec des termes opposés, la somme complète (longue) est écrite en introduction, où elle peut passer
  // à la ligne ; la chaîne part de la somme sans ces termes (sinon une ligne trop large à l'écran).
  const lignes: LigneCalcul[] = annulations.length
    ? membres.map((m, i) => ligne(i === 0 ? `\\vec{w}=${m.latex}` : `=${m.latex}`, m.justification))
    : [ligne(`\\vec{w}=${depart}`, "on nomme la somme à réduire"), ...membres.map((m) => ligne(`=${m.latex}`, m.justification))];
  const intro: Fragments = annulations.length ? [texte("Somme à réduire : "), latex(`\\vec{w}=${depart}`), texte(".")] : [];
  etapes.push(calcul(l, sansDoublons(lignes), intro, annulations.length ? "Expression complète" : "Calcul"));

  const fleches: FlecheFigure[] = [...(chemin ?? []).map((t) => ({ depart: t.origine, arrivee: t.arrivee })), { depart: D, arrivee: F, resultat: true }];
  etapes.push(
    {
      ...resultat(l, [texte("Vecteur réduit : "), latex(`\\vec{w}=${vec(`${D}${F}`)}`), texte(" (ou toute autre paire de points de la figure qui représente ce même vecteur). Sur la figure : la chaîne en pointillés, le vecteur réduit en trait épais.")]),
      figureHtml: `<div style="max-width:7cm;margin:0 auto">${construireFigureReductionHtml(e, fleches)}</div>`,
    },
    piege(
      l,
      annulations.length > 0
        ? [texte("Deux termes ne s'annulent que s'ils sont opposés avec le même coefficient : "), latex("2\\vec{RS}+2\\vec{SR}=\\vec{0}"), texte(", mais "), latex("2\\vec{RS}+\\vec{SR}=\\vec{RS}"), texte(".")]
        : [texte("Un terme précédé d'un « − » se réécrit dans l'autre sens avant d'être enchaîné : "), latex("-\\vec{BA}=\\vec{AB}"), texte(".")],
    ),
  );
  return finaliserCorrigeVecteurs(etapes);
}
