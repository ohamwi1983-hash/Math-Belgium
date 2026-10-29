import type { ExerciceReductionVectorielle, TermeReduction } from "../core/reductionVectorielle.types";
import { LIBELLES_FIGURE } from "../generateurs/reductionVectorielle/figures";

function formatTerme(terme: TermeReduction, estSuite: boolean): string {
  const { coefficient, origine, arrivee } = terme;
  const signe = coefficient < 0 ? "-" : estSuite ? "+" : "";
  const abs = Math.abs(coefficient);
  const coefTexte = abs === 1 ? "" : String(abs);
  return `${signe}${coefTexte}\\vec{${origine}${arrivee}}`;
}

/** L'expression à réduire, affichée dans un bloc mis en évidence — ex.
 * `\vec{FA}+\vec{FM}-\vec{OL}-2\vec{QS}`. */
export function formatExpressionLatex(exercice: ExerciceReductionVectorielle): string {
  return exercice.termes.map((terme, i) => formatTerme(terme, i > 0)).join("");
}

/** Un fragment LaTeX signé par terme (jamais l'expression entière concaténée) — pour un rendu
 * KaTeX terme par terme qui peut s'enrouler ENTRE les termes sur mobile (`.equation-box-termes`,
 * App.css), contournant le `white-space: nowrap` interne de KaTeX qui empêche tout retour à la
 * ligne à l'intérieur d'un bloc unique (jusqu'à 7 termes pour les variantes `hexagone`/
 * `triangleMedianes`, débordement confirmé sur mobile étroit — voir CLAUDE.md, corrections gen27). */
export function formatTermesLatex(exercice: ExerciceReductionVectorielle): string[] {
  return exercice.termes.map((terme, i) => formatTerme(terme, i > 0));
}

export function libelleFigure(exercice: ExerciceReductionVectorielle): string {
  return LIBELLES_FIGURE[exercice.figure];
}

type SegmentAide = { type: "texte"; valeur: string } | { type: "katex"; valeur: string };

const t = (valeur: string): SegmentAide => ({ type: "texte", valeur });
const k = (valeur: string): SegmentAide => ({ type: "katex", valeur });

/** Aide de niveau 1 (audit chapitre 6, F4) — rappel générique de la relation de Chasles, sur des
 * lettres R, S, T qui n'existent sur aucune figure (jamais un vecteur de l'exercice). */
export function aideReductionNiveau1(): SegmentAide[][] {
  return [
    [
      t("Relation de Chasles : "),
      k("\\vec{RS} + \\vec{ST} = \\vec{RT}"),
      t(" — le point d'arrivée d'un vecteur est le point de départ du suivant, et ce point commun disparaît."),
    ],
    [t("Un vecteur écrit « à l'envers » avec un signe − : "), k("-\\vec{TS} = \\vec{ST}"), t(".")],
    [t("Un vecteur suivi de son opposé s'annule : "), k("k\\,\\vec{RS} + k\\,\\vec{SR} = \\vec{0}"), t(".")],
  ];
}

interface TermeOriente {
  origine: string;
  arrivee: string;
}

/** Lecture de l'expression affichée pour l'aide de niveau 2 : paires qui s'annulent (même
 * coefficient, lettres inversées), termes `-\vec{YX}` à réécrire `\vec{XY}`, et un premier
 * enchaînement entre deux vecteurs restants. Toute association trouvée est mathématiquement
 * valable, même si elle diffère de la construction du générateur. */
function egalAuVecteurReduit(exercice: ExerciceReductionVectorielle, terme: TermeOriente): boolean {
  const p = exercice.points[terme.origine];
  const q = exercice.points[terme.arrivee];
  return Math.abs(q.x - p.x - exercice.reponse.x) < 0.01 && Math.abs(q.y - p.y - exercice.reponse.y) < 0.01;
}

export function analyseAideReduction(exercice: ExerciceReductionVectorielle): {
  paires: [TermeReduction, TermeReduction][];
  renverses: TermeReduction[];
  enchainement: [TermeOriente, TermeOriente] | null;
} {
  const utilises = new Set<number>();
  const paires: [TermeReduction, TermeReduction][] = [];
  exercice.termes.forEach((a, i) => {
    if (utilises.has(i)) return;
    const j = exercice.termes.findIndex(
      (b, jj) => jj > i && !utilises.has(jj) && b.coefficient === a.coefficient && b.origine === a.arrivee && b.arrivee === a.origine,
    );
    if (j >= 0) {
      utilises.add(i);
      utilises.add(j);
      paires.push([a, exercice.termes[j]]);
    }
  });
  const restants = exercice.termes.filter((_, i) => !utilises.has(i));
  const renverses = restants.filter((terme) => terme.coefficient === -1);
  const orientes: TermeOriente[] = restants
    .filter((terme) => Math.abs(terme.coefficient) === 1)
    .map((terme) => (terme.coefficient === 1 ? { origine: terme.origine, arrivee: terme.arrivee } : { origine: terme.arrivee, arrivee: terme.origine }));
  // Le correcteur accepte TOUT vecteur de la figure égal au vecteur réduit (comparaison par
  // coordonnées) : un vecteur restant qui lui serait égal (ex. hexagone, \vec{EF} = \vec{DO}) ne
  // doit jamais être ÉCRIT par l'aide sous une forme absente de l'expression.
  const candidats = orientes.filter((o) => !egalAuVecteurReduit(exercice, o));
  let enchainement: [TermeOriente, TermeOriente] | null = null;
  for (const u of candidats) {
    const v = candidats.find((w) => w !== u && w.origine === u.arrivee);
    if (v) {
      enchainement = [u, v];
      break;
    }
  }
  return { paires, renverses, enchainement };
}

/** Aide de niveau 2 — repérage dans l'expression affichée, jamais le vecteur réduit : il reste
 * toujours à enchaîner les vecteurs restants (au moins deux, la chaîne du générateur en compte 2
 * ou 3). */
export function aideReductionNiveau2(exercice: ExerciceReductionVectorielle): SegmentAide[][] {
  const { paires, renverses, enchainement } = analyseAideReduction(exercice);
  const lignes: SegmentAide[][] = [];
  for (const [a, b] of paires) {
    lignes.push([t("Les termes "), k(formatTerme(a, false)), t(" et "), k(formatTerme(b, false)), t(" s'annulent : leur somme est le vecteur nul.")]);
  }
  if (renverses.length > 0) {
    const segments: SegmentAide[] = [t(renverses.length > 1 ? "Réécris à l'endroit les vecteurs précédés d'un « − » : " : "Réécris à l'endroit le vecteur précédé d'un « − » : ")];
    // Réécriture montrée seulement si aucun vecteur remis à l'endroit n'est égal au vecteur réduit
    // (sinon la règle du niveau 1 suffit : on désigne les termes sans écrire leur forme à l'endroit).
    const reecrire = renverses.every((terme) => !egalAuVecteurReduit(exercice, { origine: terme.arrivee, arrivee: terme.origine }));
    renverses.forEach((terme, i) => {
      if (i > 0) segments.push(t(" ; "));
      segments.push(
        k(
          reecrire
            ? `-\\vec{${terme.origine}${terme.arrivee}} = \\vec{${terme.arrivee}${terme.origine}}`
            : `-\\vec{${terme.origine}${terme.arrivee}}`,
        ),
      );
    });
    segments.push(t("."));
    lignes.push(segments);
  }
  if (enchainement) {
    const [u, v] = enchainement;
    lignes.push([
      k(`\\vec{${u.origine}${u.arrivee}}`),
      t(` se termine en ${u.arrivee}, là où commence `),
      k(`\\vec{${v.origine}${v.arrivee}}`),
      t(" : ces deux vecteurs s'enchaînent."),
    ]);
  }
  lignes.push([t("Enchaîne ainsi tous les vecteurs restants pour obtenir le vecteur réduit.")]);
  return lignes;
}
