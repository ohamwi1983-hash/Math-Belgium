import type { ExerciceReductionVectorielle, TermeReduction } from "../../core/reductionVectorielle.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { calculerGeometrieFigureReduction } from "../../ui/figureReductionSketch";
import { formatExpressionLatex, libelleFigure } from "../../ui/formatReductionVectorielle";
import { FIGURES } from "./figures";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceReductionVectorielle } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceReductionVectorielle>` pour gen27 (Réduction d'une
 * somme de vecteurs — relation de Chasles, `AppReductionVectorielle.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence et
 * `generateurs/triangleLies/exportEvaluation.ts` pour un 2e exemple de croquis SVG autonome
 * (`enteteHtml`) réutilisant un moteur géométrique déjà utilisé côté écran.
 *
 * **Écran unique, reporté tel quel** : `EtapeReductionVectorielle.tsx`/`sessionReductionVectorielle.ts`
 * n'ont qu'une seule phase ("reduction") — une figure fixe (4 variantes, `figures.ts`), une expression
 * à réduire (`termes`, déjà mélangée) affichée terme par terme, et un champ libre où l'élève entre une
 * paire de lettres désignant le vecteur qu'il propose comme réduction (ex. "MA" pour `\vec{MA}`,
 * `moteur/verificationReductionVectorielle.ts` accepte TOUTE paire de points de la figure dont le
 * vecteur réel coïncide avec la cible, pas seulement `(pointDepart, pointArrivee)`). Une seule
 * question papier par instance, donc — pas de découpage a)/b)/c).
 *
 * **Croquis (`enteteHtml`)** : réutilise tel quel le moteur géométrique pur déjà utilisé par le rendu
 * écran (`ui/figureReductionSketch.ts::calculerGeometrieFigureReduction`, partagé par
 * `FigureReductionSketch.tsx` ET `OutilTraceVecteurs.tsx`) — jamais recalculé indépendamment.
 * `FigureReductionSketch.tsx` est un composant React (non instanciable dans ce pipeline texte/HTML,
 * `export/genererFeuilleExercicesHtml.ts`/`assemblerEvaluationHtml.ts`) : les mêmes éléments (arêtes,
 * points, étiquettes) sont donc réémis ici en SVG brut, avec les mêmes couleurs que `App.css`
 * (`--color-border: #e6e6f0`, `--color-text: #1b1c2b`, voir `src/index.css`) recopiées en attributs SVG
 * littéraux plutôt qu'en `var(...)` (sans effet dans le document HTML autonome de l'évaluation) — même
 * patron que `construireSvgBoiteMoustaches`/`construireCroquisHtml` (`generateurs/boiteMoustaches/exportEvaluation.ts`,
 * `generateurs/triangleLies/exportEvaluation.ts`). L'outil de traçage FACULTATIF (`OutilTraceVecteurs.tsx`)
 * n'a pas d'équivalent papier : c'est une aide interactive à la visualisation, jamais consommée par la
 * vérification (voir son commentaire de tête) — rien à reporter sur une feuille imprimée.
 *
 * **Correction RESYNTHÉTISÉE, jamais une transcription** : `sessionReductionVectorielle.ts` n'a pas de
 * texte d'aide à concaténer (vérifié : sa seule étape est `etapeTentatives`, sans `niveauAide` textuel —
 * la vérification est binaire, `verifierReduction`). La correction ci-dessous reconstruit donc le
 * raisonnement de Chasles complet à partir des seules valeurs déjà connues et correctes de l'instance
 * (`termes`, `pointDepart`, `pointArrivee`) :
 * 1. Les paires de termes qui s'annulent exactement (même 2 points, sens opposé, même coefficient —
 *    corollaire de Chasles `k·\vec{RS}+k·\vec{SR}=\vec 0`, voir l'en-tête de
 *    `generateurs/reductionVectorielle/index.ts`) sont repérées algébriquement (`detecterAnnulations`,
 *    ci-dessous) : deux termes s'annulent DÈS QUE la condition ci-dessus est vérifiée, qu'ils aient ou
 *    non été construits comme une "paire annulante" par le générateur — l'identité reste vraie dans tous
 *    les cas, donc cette détection n'a besoin d'aucune information sur la construction interne de
 *    l'instance (jamais exposée par `ExerciceReductionVectorielle`), seulement de `termes` lui-même.
 * 2. Les termes restants sont réordonnés en une chaîne télescopique continue de `pointDepart` à
 *    `pointArrivee` (`reconstituerChemin`, une marche dans le graphe des arêtes restantes) — toujours
 *    possible avec les 4 figures actuelles (chaque terme non annulé a un coefficient ±1, un unique
 *    segment de la chaîne d'origine, jamais partagé entre 2 termes — vérifié par le smoke test sur des
 *    dizaines de tirages des 4 variantes) : garde défensive (`reconstituerChemin` retourne `null`) si un
 *    futur changement de génération invalidait cette hypothèse, avec un repli textuel générique plutôt
 *    qu'une exception.
 * `formatTermeLatex`/`formatTermesArbitraires` ci-dessous reproduisent la convention de
 * `ui/formatReductionVectorielle.ts::formatTerme` (coefficient signé + `\vec{origine arrivee}`), non
 * réexportée (privée) car cette dernière n'opère que sur `instance.termes` tel quel — jamais sur un
 * sous-ensemble réordonné (paires isolées, chaîne reconstituée) comme il en faut ici.
 *
 * **PAS `regroupable`** : `enteteHtml` (croquis) est présent — disqualifie `regroupable` à lui seul,
 * quelle que soit la généricité de la consigne (voir la doc de `AdaptateurFeuilleExercices.regroupable`
 * dans `export/genererFeuilleExercices.ts`).
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }`, même décision documentée
 * que `quelAngle/exportEvaluation.ts`/`comparaisonSeries/exportEvaluation.ts`) : la réponse attendue est
 * une simple paire de lettres, jamais un calcul à dérouler sur plusieurs lignes.
 */

const LARGEUR_SVG = 260;
const COULEUR_ARETE = "#e6e6f0";
const COULEUR_POINT = "#1b1c2b";

/** Reproduit `ui/formatReductionVectorielle.ts::formatTerme` (privée, non réexportée) — voir le
 * commentaire de tête pour pourquoi ce petit doublon est nécessaire ici (sous-ensembles/réordonnancements
 * de termes, jamais `instance.termes` tel quel). */
function formatTermeLatex(terme: TermeReduction, estSuite: boolean): string {
  const { coefficient, origine, arrivee } = terme;
  const signe = coefficient < 0 ? "-" : estSuite ? "+" : "";
  const abs = Math.abs(coefficient);
  const coefTexte = abs === 1 ? "" : String(abs);
  return `${signe}${coefTexte}\\vec{${origine}${arrivee}}`;
}

function formatTermesArbitraires(termes: TermeReduction[]): string {
  return termes.map((t, i) => formatTermeLatex(t, i > 0)).join("");
}

/**
 * Repère les paires de termes qui s'annulent exactement : deux termes de même coefficient `k`, dont
 * les points origine/arrivée sont échangés (`k·\vec{RS}+k·\vec{SR}=\vec 0`, corollaire de Chasles —
 * vrai algébriquement quels que soient `R`/`S`/`k`, voir le commentaire de tête). Glouton : chaque
 * terme n'est apparié qu'une seule fois, dans l'ordre du tableau.
 */
function detecterAnnulations(termes: TermeReduction[]): { annulations: [TermeReduction, TermeReduction][]; restants: TermeReduction[] } {
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

/**
 * Réordonne `restants` en une chaîne continue `depart → … → arrivee`, un terme = une arête (chaque
 * terme restant a nécessairement un coefficient ±1 dans les 4 figures actuelles — voir le commentaire
 * de tête) : le signe -1 signifie une arête réelle inversée par rapport à `origine`/`arrivee` (même
 * convention que `construireChaineTelescopique`, `index.ts`). Retourne `null` (garde défensive, jamais
 * rencontrée par le smoke test) si la reconstruction échoue — coefficient restant ≠ ±1, ou aucune marche
 * continue de `depart` à `arrivee`.
 */
function reconstituerChemin(restants: TermeReduction[], depart: string, arrivee: string): TermeReduction[] | null {
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

  if (disponibles.size > 0) return null; // arêtes en trop, non reliées à la chaîne — ne devrait jamais arriver.

  return chemin.map((e) => ({ origine: e.origine, arrivee: e.arrivee, coefficient: 1 }));
}

/** Croquis SVG autonome (attributs inline, aucune dépendance à `App.css`) — mêmes couleurs que
 * `FigureReductionSketch.tsx`, voir le commentaire de tête pour la justification de cette
 * réimplémentation plutôt qu'un rendu direct du composant React. */
function construireFigureHtml(instance: ExerciceReductionVectorielle): string {
  const geom = calculerGeometrieFigureReduction(instance.points, FIGURES[instance.figure].aretes);
  const [xMin, yMin, largeur, hauteur] = geom.viewBox.split(" ").map(Number);
  const hauteurSvg = Math.round((LARGEUR_SVG / largeur) * hauteur);

  const lignes = geom.aretes
    .map(
      (a) =>
        `<line x1="${a.x1.toFixed(2)}" y1="${a.y1.toFixed(2)}" x2="${a.x2.toFixed(2)}" y2="${a.y2.toFixed(2)}" stroke="${COULEUR_ARETE}" stroke-width="${(geom.rayonPoint * 0.3).toFixed(3)}"/>`,
    )
    .join("");
  const points = geom.points.map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${geom.rayonPoint.toFixed(3)}" fill="${COULEUR_POINT}"/>`).join("");
  const labels = geom.points
    .map(
      (p) =>
        `<text x="${(p.x + geom.rayonPoint * 1.8).toFixed(2)}" y="${(p.y - geom.rayonPoint * 1.8).toFixed(2)}" font-size="${(geom.rayonPoint * 3.2).toFixed(2)}" font-weight="700" fill="${COULEUR_POINT}">${p.nom}</text>`,
    )
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${hauteurSvg}" viewBox="${geom.viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure de référence" style="display:block;margin:8px auto 14px;border:1px solid ${COULEUR_ARETE};border-radius:8px;background:#ffffff;">
<rect x="${xMin}" y="${yMin}" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${lignes}${points}${labels}
</svg>`;
}

function construireEnonceReductionVectorielle(instance: ExerciceReductionVectorielle): SectionExercice {
  return {
    enteteFragments: [texte(`${libelleFigure(instance)}. Réduis l'expression suivante en un seul vecteur : `), latex(formatExpressionLatex(instance)), texte(".")],
    enteteHtml: construireFigureHtml(instance),
    questions: [
      {
        consigne: [
          texte('Donne le vecteur réduit sous la forme d\'une paire de lettres désignant 2 points de la figure (ex. "MA" pour '),
          latex("\\vec{MA}"),
          texte(")."),
        ],
        reponse: { type: "lignes", nombre: 0 },
      },
    ],
  };
}

function construireCorrectionReductionVectorielle(instance: ExerciceReductionVectorielle): BlocCorrection[] {
  const { termes, pointDepart, pointArrivee } = instance;
  const { annulations, restants } = detecterAnnulations(termes);
  const chemin = reconstituerChemin(restants, pointDepart, pointArrivee);

  const blocs: BlocCorrection[] = [];

  blocs.push({
    type: "paragraphe",
    fragments: [texte("Expression de départ : "), latex(formatExpressionLatex(instance)), texte(".")],
  });

  if (annulations.length > 0) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(
          annulations.length > 1
            ? "On repère d'abord les paires de termes qui s'annulent exactement (relation de Chasles : "
            : "On repère d'abord la paire de termes qui s'annule exactement (relation de Chasles : ",
        ),
        latex("k\\vec{RS}+k\\vec{SR}=\\vec 0"),
        texte(") :"),
      ],
    });
    for (const [a, b] of annulations) {
      blocs.push({ type: "paragraphe", fragments: [latex(`${formatTermeLatex(a, false)} ${formatTermeLatex(b, true)} = \\vec 0`)] });
    }
  }

  if (chemin) {
    blocs.push({
      type: "paragraphe",
      fragments: [
        texte(annulations.length > 0 ? "Il reste : " : "Tous les termes forment déjà une chaîne continue : "),
        latex(formatTermesArbitraires(chemin)),
        texte(", que l'on relie point par point (relation de Chasles) :"),
      ],
    });
    blocs.push({
      type: "paragraphe",
      fragments: [latex(`${formatTermesArbitraires(chemin)} = \\vec{${pointDepart}${pointArrivee}}`)],
    });
  } else {
    // Garde défensive — jamais rencontrée avec les 4 figures actuelles (voir le commentaire de tête) :
    // conclusion directe sans détail du télescopage.
    blocs.push({
      type: "paragraphe",
      fragments: [texte("Les termes restants se relient bout à bout (relation de Chasles) jusqu'à former un unique vecteur.")],
    });
  }

  const fragmentsConclusion: FragmentConsigne[] = [
    texte("Vecteur réduit : "),
    latex(`\\vec{${pointDepart}${pointArrivee}}`),
    texte(" (toute autre paire de points de la figure représentant ce même vecteur est également une réponse correcte)."),
  ];
  blocs.push({ type: "paragraphe", fragments: fragmentsConclusion });

  return blocs;
}

export const adaptateurEvaluationReductionVectorielle: AdaptateurFeuilleExercices<ExerciceReductionVectorielle> = {
  titreDocument: "Réduction d'une somme de vecteurs (Chasles) — Évaluation",
  nomFichierBase: "reduction-vectorielle-chasles",
  genererInstance: genererExerciceReductionVectorielle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceReductionVectorielle,
  construireCorrection: construireCorrectionReductionVectorielle,
  // PAS regroupable — `enteteHtml` (croquis) présent, disqualifie à lui seul : voir le commentaire de
  // tête.
};
