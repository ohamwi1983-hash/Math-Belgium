import type { ExerciceComparaisonVecteurs } from "../../core/comparaisonVecteurs.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { profilComparaisonVecteurs } from "../profilsEvaluation4eCh6";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { consigneSelection, vecteursAffichesComparaison } from "../../ui/formatComparaisonVecteurs";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceComparaisonVecteurs } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceComparaisonVecteurs>` pour gen28 (Comparaison
 * visuelle de vecteurs sur figure, `AppComparaisonVecteurs.tsx`) — voir
 * `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/boiteMoustaches/exportEvaluation.ts`/`generateurs/triangleQuelconque/exportEvaluation.ts`
 * pour les 2 précédents les plus proches d'un adaptateur qui doit tracer sa propre figure statique
 * (`enteteHtml`) faute de moteur de rendu SVG déjà existant pour ce type de figure.
 *
 * **Écran → questions** : `moteur/sessionComparaisonVecteurs.ts`/`AppComparaisonVecteurs.tsx`
 * enchaînent 2 phases FIXES, toujours dans le même ordre, sur LA MÊME figure (2-3 vecteurs de base
 * + 3-5 vecteurs dérivés, tous des transformations garanties exactes — translation ou multiple
 * scalaire — d'un des vecteurs de base, voir `generateurs/comparaisonVecteurs/index.ts`) : "sélection"
 * (`EtapeSelectionComparaison.tsx` — sélectionner tous les vecteurs de même longueur/direction/sens
 * que la référence, en rouge) → "égalité" (`EtapeEgaliteComparaison.tsx` — écrire l'égalité reliant
 * un vecteur trouvé, `cibleEgalite`, à la référence, ex. `c = 2h`). Reproduit ici par UNE figure
 * (`enteteHtml`, affichée une seule fois en tête, comme `caracteristiquesFonction/exportEvaluation.ts`)
 * suivie de 2 questions a)/b) dans le même ordre, jamais recombinées.
 *
 * **3 variantes** (`CATALOGUE_VARIANTES`, `longueur`/`direction`/`sens`) : SEULE la consigne de (a)
 * change (`consigneSelection`, `ui/formatComparaisonVecteurs.ts`, déjà réutilisée telle quelle côté
 * écran ET ici — aucune reformulation locale) ; la figure et la question (b) restent structurellement
 * identiques quelle que soit la variante (`ExerciceComparaisonVecteurs` est déjà uniforme sur les 3,
 * voir `core/comparaisonVecteurs.types.ts`), donc pas de branche `if (variante)` nécessaire ici.
 *
 * **Graphique papier NÉCESSAIRE** : l'exercice EST la figure — comparer longueur/direction/sens de
 * vecteurs tracés n'a aucun sens en texte pur (contrairement à `simplification`/`triangleQuelconque`
 * question b, où seule une valeur numérique est demandée). `construireSvgComparaison` (ce fichier)
 * est le premier moteur de tracé SVG statique de VECTEURS du projet (`export/svgGraph.ts` ne trace
 * que des courbes de fonction, `generateurs/xxx/exportEvaluation.ts` d'aucun autre générateur du
 * chapitre "Calcul vectoriel" n'existe encore à ce jour) — mais ne réinvente RIEN de la géométrie :
 * il réutilise tel quel `ui/formatComparaisonVecteurs.ts::vecteursAffichesComparaison` (même fonction
 * PURE que `EtapeSelectionComparaison.tsx`/`EtapeEgaliteComparaison.tsx` à l'écran — couleurs
 * rouge/orange de référence/sélection, ET positions d'étiquettes sans chevauchement déjà résolues
 * par `ui/vecteurGraph.ts::calculerPositionsEtiquettesSansChevauchement`), `ui/vecteurGraph.ts::
 * calculerViewBoxVecteurs` (même viewBox pur que Mafs) et `ui/mafsTransformation.ts::RATIO_GRAPHE`
 * (même ratio d'aspect que tous les autres graphes Mafs du projet) ; pas de grille FIXÉ à 1 sur les
 * deux axes, comme à l'écran (`VecteurGraph pasGrille={1}`, audit chapitre 6). Seule la RASTÉRISATION en primitives `<svg>` (ligne+tête de flèche pour
 * chaque vecteur, `<text>`+petite flèche au-dessus pour chaque étiquette — reproduction fidèle, en
 * géométrie SVG inline, de `VecteurGraph.tsx::LabelVecteurFleche`, jamais un caractère Unicode, même
 * raisonnement que documenté en tête de ce composant) est écrite ici, jamais dans `ui/`. Grille
 * affichée SANS les 2 lignes d'axe ni leurs graduations numériques — même choix que
 * `masquerAxes` côté écran (`EtapeSelectionComparaison.tsx`/`EtapeEgaliteComparaison.tsx` : cet
 * exercice compare longueur/direction/sens, jamais des coordonnées ; le quadrillage reste utile
 * comme repère de proportions relatives, voir la doc de `VecteurGraph.tsx::Props.masquerAxes`).
 *
 * **PAS `regroupable`**, pour 3 raisons indépendantes, chacune déjà suffisante à elle seule (voir la
 * doc de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 2 questions
 * par instance, jamais 1 seule ; (2) la consigne de (a) dépend de l'instance (`consigneSelection`
 * mentionne la propriété testée ET le label de la référence, jamais une consigne générique
 * constante) ; (3) `construireEnonceComparaisonVecteurs` utilise `enteteHtml` (la figure), condition
 * à elle seule déjà exclusive quel que soit le nombre de questions.
 *
 * **Correction RESYNTHÉTISÉE** depuis les champs déjà connus et garantis corrects de l'instance
 * tirée (`labelsCorrects`, `cibleEgalite`, `coefficientEgalite` — tous calculés à la construction
 * par `generateurs/comparaisonVecteurs/index.ts`, jamais redérivés indépendamment ici), en
 * réimprimant la MÊME figure avec la sélection correcte mise en évidence en orange (même principe
 * que `boiteMoustaches/exportEvaluation.ts::avecEtiquettes`/`caracteristiquesFonction/exportEvaluation.ts` :
 * réimprimer le graphique en tête de correction plutôt que décrire la réponse en texte seul, un
 * repère visuel direct pour un exercice dont la question EST visuelle). `formatCoefficientLatex`/
 * `formatVecteursAttendusLatex`/`formatEgaliteAttendueLatex` ci-dessous sont une PETITE copie locale,
 * à la lettre, des formateurs déjà utilisés côté écran par `components/ResultatPanelComparaisonVecteurs.tsx`
 * (elle-même déjà une 2ᵉ copie locale de la même convention "coefficient 1/-1 jamais explicite" que
 * `ui/formatRelationVectorielle.ts::formatCoefficientTraduction`) — jamais importées depuis ce
 * composant `.tsx` : aucun adaptateur `exportEvaluation.ts` du projet n'importe depuis `components/`
 * (seulement `ui/`/`moteur/`/son propre `generateurs/xxx/index.ts`), et ces 3 fonctions n'ont pas
 * d'équivalent exporté côté `ui/formatComparaisonVecteurs.ts` — même décision de petite fonction
 * dupliquée plutôt qu'un import inter-couches, déjà prise 2 fois avant dans ce même projet pour cette
 * même convention d'affichage.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 2 questions) —
 * même décision documentée par `generateurs/triangleQuelconque/exportEvaluation.ts`/`generateurs/
 * cercleTrigonometrique/exportEvaluation.ts` : l'élève répond sur une feuille à part, jamais sur la
 * copie imprimée elle-même.
 */

// --- Rendu SVG imprimé de la figure (voir le commentaire de tête ci-dessus) ---

const LARGEUR_SVG = 340;
const MARGE_SVG = 14;
const COULEUR_GRILLE = "#e9ecef";
const COULEUR_CADRE = "#d0d7de";
const COULEUR_VECTEUR_DEFAUT = "#1971c2";

const TAILLE_POLICE_LABEL = 15;
const LARGEUR_FLECHE_LABEL = 9;
const TETE_FLECHE_LABEL = 3;
const ESPACE_FLECHE_LETTRE = 2;
/** Même ratio empirique que `VecteurGraph.tsx::RATIO_HAUTEUR_MAJUSCULE` — positionne la petite
 * flèche juste au-dessus du sommet de la lettre, jamais une mesure DOM réelle (impossible ici, pas
 * de navigateur). */
const RATIO_HAUTEUR_MAJUSCULE = 0.72;

const TETE_FLECHE_VECTEUR = 6;

function echapperTexteSvg(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Segment + tête de flèche triangulaire pleine pour UN vecteur tracé, de `(x1,y1)` (origine, déjà
 * en coordonnées pixel) à `(x2,y2)` (extrémité) — le trait s'arrête légèrement avant `(x2,y2)` pour
 * que la tête de flèche ne recouvre pas la pointe exacte, même principe visuel qu'un `Vector` Mafs. */
function ligneVecteurSvg(x1: number, y1: number, x2: number, y2: number, couleur: string): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longueur = Math.hypot(dx, dy) || 1;
  const ux = dx / longueur;
  const uy = dy / longueur;
  const perpX = -uy;
  const perpY = ux;
  const baseX = x2 - ux * TETE_FLECHE_VECTEUR * 1.6;
  const baseY = y2 - uy * TETE_FLECHE_VECTEUR * 1.6;
  const p1 = `${(baseX + perpX * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)},${(baseY + perpY * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)}`;
  const p2 = `${(baseX - perpX * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)},${(baseY - perpY * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)}`;
  const p3 = `${x2.toFixed(1)},${y2.toFixed(1)}`;
  return (
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${baseX.toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${couleur}" stroke-width="2.2"/>` +
    `<polygon points="${p1} ${p2} ${p3}" fill="${couleur}"/>`
  );
}

/** Étiquette "flèche au-dessus + lettre" à `(cx,cy)` (position déjà résolue par
 * `calculerPositionsEtiquettesSansChevauchement`, convertie en pixel) — reproduction fidèle, en
 * géométrie SVG inline, de `VecteurGraph.tsx::LabelVecteurFleche` (voir le commentaire de tête pour
 * pourquoi jamais un caractère Unicode). Pas d'indice ici (labels à une seule lettre, comme tous les
 * appels de `vecteursAffichesComparaison`), donc jamais de recentrage de largeur d'indice. */
function labelVecteurFlecheSvg(cx: number, cy: number, lettre: string, couleur: string): string {
  const yFleche = cy - TAILLE_POLICE_LABEL * RATIO_HAUTEUR_MAJUSCULE - ESPACE_FLECHE_LETTRE;
  const xDebut = cx - LARGEUR_FLECHE_LABEL / 2;
  const xFin = cx + LARGEUR_FLECHE_LABEL / 2;
  return (
    `<line x1="${xDebut.toFixed(1)}" y1="${yFleche.toFixed(1)}" x2="${xFin.toFixed(1)}" y2="${yFleche.toFixed(1)}" stroke="${couleur}" stroke-width="1.3"/>` +
    `<polygon points="${(xFin + TETE_FLECHE_LABEL).toFixed(1)},${yFleche.toFixed(1)} ${(xFin - TETE_FLECHE_LABEL * 0.4).toFixed(1)},${(yFleche - TETE_FLECHE_LABEL).toFixed(1)} ${(xFin - TETE_FLECHE_LABEL * 0.4).toFixed(1)},${(yFleche + TETE_FLECHE_LABEL).toFixed(1)}" fill="${couleur}"/>` +
    `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" font-size="${TAILLE_POLICE_LABEL}" text-anchor="middle" dominant-baseline="middle" fill="${couleur}">${echapperTexteSvg(lettre)}</text>`
  );
}

/**
 * `<svg>` autonome de la figure — un vecteur par vecteur de l'exercice, référence en rouge,
 * `labelsSelectionnes` en orange (mêmes couleurs que `vecteursAffichesComparaison`), quadrillage
 * SANS axes ni graduations numériques (voir le commentaire de tête de fichier). `labelsSelectionnes`
 * vaut `[]` pour l'énoncé (aucune sélection encore faite) et `exercice.labelsCorrects` pour la
 * correction (réponse attendue mise en évidence) — même fonction pour les deux, seul l'argument
 * change, jamais deux moteurs de tracé distincts.
 */
function construireSvgComparaison(exercice: ExerciceComparaisonVecteurs, labelsSelectionnes: string[]): string {
  const { vecteurs } = vecteursAffichesComparaison(exercice, labelsSelectionnes);
  const viewBox = calculerViewBoxVecteurs([], vecteurs);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  // Même pas (1) sur les deux axes, comme la figure à l'écran (`VecteurGraph pasGrille={1}`) :
  // un carreau a la même taille dans les deux sens, les longueurs se comparent à l'œil.
  const pasX = 1;
  const pasY = 1;
  const grille: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${(hauteur - MARGE_SVG).toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${MARGE_SVG}" y1="${py.toFixed(1)}" x2="${(largeur - MARGE_SVG).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }

  const traces = vecteurs
    .map((v) => {
      const couleur = v.couleur ?? COULEUR_VECTEUR_DEFAUT;
      const x1 = sx(v.origine.x);
      const y1 = sy(v.origine.y);
      const x2 = sx(v.origine.x + v.vecteur.x);
      const y2 = sy(v.origine.y + v.vecteur.y);
      const centre = v.labelPosition ?? { x: v.origine.x + v.vecteur.x / 2, y: v.origine.y + v.vecteur.y / 2 };
      const labelHtml = v.labelFleche ? labelVecteurFlecheSvg(sx(centre.x), sy(centre.y), v.labelFleche.base, couleur) : "";
      return `${ligneVecteurSvg(x1, y1, x2, y2, couleur)}${labelHtml}`;
    })
    .join("");

  const svg = `<svg width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure de vecteurs à comparer">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff" stroke="${COULEUR_CADRE}" stroke-width="1"/>
${grille.join("")}
${traces}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même préoccupation que `boiteMoustaches/exportEvaluation.ts`/`triangleQuelconque/exportEvaluation.ts`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Formateurs de correction (petite copie locale, voir le commentaire de tête) ---

function formatCoefficientLatex(coefficient: number): string {
  if (coefficient === 1) return "";
  if (coefficient === -1) return "-";
  return String(coefficient);
}

function formatVecteursAttendusLatex(labels: string[]): string {
  return labels.map((label) => `\\vec{${label}}`).join(", ");
}

// --- Énoncé / correction ---

/** Énoncé = énoncé papier (mêmes deux questions, qui sont aussi les deux étapes du corrigé) : la
 * consigne d'écran « Sélectionne… » et l'égalité d'un vecteur NOMMÉ (déjà une réponse de a)) ne
 * conviennent pas au papier — voir la section « Papier » plus bas. */
function construireEnonceComparaisonVecteurs(instance: ExerciceComparaisonVecteurs): SectionExercice {
  return enoncePapier(instance).section;
}

function construireCorrectionComparaisonVecteurs(instance: ExerciceComparaisonVecteurs): BlocCorrection[] {
  return [
    { type: "html", html: construireSvgComparaison(instance, instance.labelsCorrects) },
    { type: "paragraphe", fragments: [texte("a) Vecteurs attendus : "), latex(formatVecteursAttendusLatex(instance.labelsCorrects)), texte(".")] },
    { type: "paragraphe", fragments: [texte("b) "), latex(egalitesLatex(instance)), texte(".")] },
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Deux VRAIES questions distinctes, gardées en a) b) : citer les vecteurs qui ont la propriété,
// puis exprimer chacun de ceux qui sont parallèles à la référence comme un multiple de celle-ci.
// L'écran demandait l'égalité d'UN vecteur nommé, déjà correct : sur papier, nommer ce vecteur
// révélerait une réponse de a) — la question b) porte donc sur tous les vecteurs parallèles trouvés
// (coefficients connus par construction : la référence est un vecteur de base, chaque parallèle en
// est un multiple `coefficientBase`). La figure (donnée) reste dans l'énoncé ; la figure avec les
// vecteurs attendus mis en évidence va dans le corrigé.

/** Vecteurs de `labelsCorrects` parallèles à la référence, avec leur coefficient. */
function egalitesAttendues(exercice: ExerciceComparaisonVecteurs): { label: string; k: number }[] {
  const ref = exercice.vecteurs.find((v) => v.label === exercice.labelReference)!;
  return exercice.vecteurs
    .filter((v) => exercice.labelsCorrects.includes(v.label) && v.indexBase === ref.indexBase)
    .map((v) => ({ label: v.label, k: v.coefficientBase }));
}

function egalitesLatex(exercice: ExerciceComparaisonVecteurs): string {
  return egalitesAttendues(exercice)
    .map((e) => `\\vec{${e.label}} = ${formatCoefficientLatex(e.k)}\\vec{${exercice.labelReference}}`)
    .join(" \\qquad ");
}

function enoncePapier(exercice: ExerciceComparaisonVecteurs): EnoncePapier {
  const consigne = consigneSelection(exercice);
  return {
    section: {
      enteteFragments: [texte("Voici plusieurs vecteurs tracés sur un quadrillage (seuls comptent la longueur, la direction et le sens de chaque vecteur, pas sa position).")],
      enteteHtml: construireSvgComparaison(exercice, []),
      questions: [
        { consigne: [texte(consigne.avant.replace("Sélectionne", "Cite")), latex(consigne.latex), texte(consigne.apres)] },
        {
          consigne: [
            ...(exercice.propriete === "longueur"
              ? [texte("Parmi les vecteurs cités, exprime chacun de ceux qui sont parallèles à "), latex(`\\vec{${exercice.labelReference}}`), texte(" sous la forme ")]
              : [texte("Exprime chacun des vecteurs cités sous la forme ")]),
            latex(`k\\,\\vec{${exercice.labelReference}}`),
            texte("."),
          ],
        },
      ],
    },
    etapesParQuestion: [["a"], ["b"]],
    reponseBreve: reponseBreve(exercice),
  };
}

function reponseBreve(exercice: ExerciceComparaisonVecteurs): FragmentConsigne[] {
  return [texte("a) "), latex(formatVecteursAttendusLatex(exercice.labelsCorrects)), texte(" ; b) "), latex(egalitesLatex(exercice))];
}

const DEFINITION_PROPRIETE: Record<ExerciceComparaisonVecteurs["propriete"], string> = {
  longueur: "Deux vecteurs ont la même longueur quand leurs normes sont égales, quelles que soient leur direction et leur position : on compare les déplacements horizontal et vertical (au signe près, et en tenant compte d'un éventuel échange).",
  direction: "Deux vecteurs ont la même direction quand ils sont parallèles (l'un est un multiple de l'autre), quels que soient leur sens et leur longueur.",
  sens: "Deux vecteurs ont le même sens quand ils sont parallèles ET orientés du même côté : l'un est un multiple POSITIF de l'autre.",
};

function correctionDetaillee(exercice: ExerciceComparaisonVecteurs): EtapeCorrection[] {
  const ref = exercice.labelReference;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(DEFINITION_PROPRIETE[exercice.propriete])] },
    {
      label: "Conclusion",
      sousQuestion: "a",
      fragments: [texte("Vecteurs attendus (en couleur sur la figure) : "), latex(formatVecteursAttendusLatex(exercice.labelsCorrects)), texte(".")],
      figureHtml: construireSvgComparaison(exercice, exercice.labelsCorrects),
    },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Pour un vecteur parallèle, on compare son déplacement à celui de "), latex(`\\vec{${ref}}`), texte(" : le rapport des longueurs donne |k|, le sens donne le signe de k.")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(egalitesLatex(exercice))] },
    {
      label: "Piège",
      sousQuestion: exercice.propriete === "longueur" ? "a" : "b",
      fragments: [
        texte(
          exercice.propriete === "longueur"
            ? "Même longueur ne veut pas dire même direction : un vecteur « tourné » de même norme convient aussi."
            : exercice.propriete === "sens"
              ? "Un vecteur parallèle mais orienté dans l'autre sens (k négatif) n'a PAS le même sens."
              : "Un vecteur parallèle orienté dans l'autre sens a la même direction : son coefficient k est négatif.",
        ),
      ],
    },
  ];
}

function bareme(exercice: ExerciceComparaisonVecteurs): BaremeExercice {
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte("Vecteurs cités, sans oubli ni intrus : "), latex(formatVecteursAttendusLatex(exercice.labelsCorrects))], points: 2 },
      { sousQuestion: "b", critere: [texte("Égalités : "), latex(egalitesLatex(exercice))], points: 2 },
    ],
    erreursFrequentes: [
      { description: [texte("Un vecteur oublié ou un intrus")], cout: "−0,5 chacun" },
      { description: [texte("Signe de k faux (sens opposé non pris en compte)")], cout: "−0,5 par égalité" },
    ],
  };
}

/** ★★ (lecture de figure et coefficients). */
function difficulte(_exercice: ExerciceComparaisonVecteurs): 1 | 2 | 3 {
  return 2;
}

export const adaptateurEvaluationComparaisonVecteurs: AdaptateurFeuilleExercices<ExerciceComparaisonVecteurs> = {
  titreDocument: "Comparaison visuelle de vecteurs sur figure — Évaluation",
  nomFichierBase: "comparaison-vecteurs",
  genererInstance: genererExerciceComparaisonVecteurs,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceComparaisonVecteurs,
  construireCorrection: construireCorrectionComparaisonVecteurs,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 4,
  profilInstance: profilComparaisonVecteurs,
  // 2 questions par instance, consigne de (a) dépendante de l'instance, `enteteHtml` (figure) :
  // 3 raisons indépendantes déjà suffisantes chacune — voir le commentaire de tête de fichier.
};
