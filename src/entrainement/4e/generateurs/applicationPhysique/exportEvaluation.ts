import type { ExerciceApplicationPhysique } from "../../core/applicationPhysique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  calculerVecteursSchema,
  formatEnonceApplicationPhysique,
  labelsGrapheApplicationPhysique,
  notationVecteursApplicationPhysique,
  OPTIONS_DIRECTION,
  segmentsConsigneConfiguration,
  segmentsConsigneDeviation,
  segmentsConsigneNorme,
} from "../../ui/formatApplicationPhysique";
import type { LabelGrapheVecteur } from "../../ui/formatApplicationPhysique";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceApplicationPhysique } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceApplicationPhysique>` pour gen29 (Applications
 * physiques — résultante de vecteurs, chapitre "Calcul vectoriel", `AppApplicationPhysique.tsx`) —
 * voir `generateurs/analyseFonction/exportWord.ts` pour le mécanisme générique de référence, et
 * `generateurs/triangleQuelconque/exportEvaluation.ts` pour l'exemple jumeau le plus proche (même
 * infrastructure `resoudreSAS`/`Triangle`, même décision "croquis SVG imprimé nécessaire").
 *
 * **Écran → question** : `moteur/sessionApplicationPhysique.ts` enchaîne 4 phases FIXES, toujours
 * dans le même ordre : "modelisation" (type d'angle entre les vecteurs composants, choix
 * catégoriel) → "norme" (norme de la résultante, Pythagore ou loi des cosinus) → "deviation" (angle
 * de déviation entre le premier vecteur et la résultante) → "interpretation" (direction cardinale
 * de la résultante, QCM à 4 options fixes). Ceci devient ici 4 questions a)/b)/c)/d), dans le même
 * ordre, jamais recombinées — chaque question papier reprend la consigne déjà formatée côté écran
 * (`ui/formatApplicationPhysique.ts::segmentsConsigneConfiguration/segmentsConsigneNorme/
 * segmentsConsigneDeviation`), sauf (d) qui n'a pas de formateur exporté équivalent (l'écran affiche
 * un texte fixe + des boutons `OPTIONS_DIRECTION`, jamais un `FragmentConsigne[]`) : reconstruite
 * ici en listant explicitement les 4 options (pas de bouton possible sur papier).
 *
 * **Graphique papier NÉCESSAIRE** (même décision que gen19/triangleQuelconque, raison inverse de
 * gen14/gen18 — voir leurs commentaires de tête respectifs) : `SchemaApplicationPhysique.tsx` est
 * PERSISTANT sur les 4 écrans (v1 depuis l'origine, v2 attaché bout à bout, la résultante depuis
 * l'origine — relation de Chasles, voir son commentaire de tête), jamais un écran "énoncé" séparé
 * sans figure. Un énoncé purement textuel serait donc une régression par rapport à l'écran. Le
 * croquis est reproduit via `SectionExercice.enteteHtml` (voir sa doc dans
 * `genererFeuilleExercices.ts` — seul le pipeline HTML de l'évaluation le rend, jamais docx/pdf).
 *
 * **Construction du SVG imprimé** : contrairement à `triangleQuelconque` (géométrie SCHÉMATIQUE à
 * coordonnées pixel fixes), ce croquis réutilise directement `calculerVecteursSchema` (même module
 * `ui/formatApplicationPhysique.ts` que l'écran, mêmes coordonnées RÉELLES en unité de l'énoncé,
 * jamais redérivées indépendamment ici) puis les projette dans un repère pixel local (mise à
 * l'échelle + centrage, aucune dépendance à Mafs/React — même principe que `export/svgGraph.ts`,
 * seul autre module du projet à produire un `<svg>` autonome pour ce même pipeline HTML). Les
 * étiquettes vectorielles réutilisent `labelsGrapheApplicationPhysique` (mêmes lettres qu'à l'écran)
 * mais JAMAIS de caractère Unicode combinant/subscript pour les dessiner : `VecteurGraph.tsx`
 * (`LabelVecteurFleche`, lu avant d'écrire ce fichier) documente en détail POURQUOI deux tentatives
 * Unicode successives ont échoué en pratique (glyphe manquant, puis flèche visuellement détachée de
 * la lettre par repli de police) — la flèche est donc redessinée ici aussi en pure géométrie SVG
 * (segment + triangle) et l'indice comme un vrai `<tspan>` décalé (`dy`), jamais un caractère
 * spécial dépendant d'une police précise.
 *
 * PAS `regroupable`, pour 2 raisons indépendantes, chacune déjà suffisante à elle seule (voir la doc
 * de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 4 questions par
 * instance, jamais 1 seule ; (2) `construireEnonceApplicationPhysique` utilise `enteteHtml` (le
 * croquis SVG), explicitement exclu par la doc de `regroupable`. (Les consignes (a)/(b)/(c) sont par
 * ailleurs déjà "génériques" au sens strict — indépendantes des valeurs tirées, seul le contexte
 * narratif/l'unité changent — mais cela ne suffit pas à lui seul : `regroupable` exige aussi une
 * seule question par instance et l'absence d'`enteteHtml`.)
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues et cohérentes de l'instance tirée
 * (`instance.triangle`, un `Triangle` COMPLET déjà résolu par `resoudreSAS` à la génération — voir
 * `generateurs/applicationPhysique/index.ts`), en réutilisant directement les fonctions déjà
 * utilisées côté écran pour le texte de méthode (`ui/formatApplicationPhysique.ts::
 * segmentsAideNormeNiveau1`/`formatAideNormeNiveau2Latex`, l'aide de l'écran "norme" — le SEUL des 4
 * écrans à en avoir une, voir `moteur/typesApplicationPhysique.ts`). L'écran "deviation" n'a lui
 * AUCUNE aide (aucun texte de méthode existant à réutiliser) : la méthode de correction est donc
 * resynthétisée ici, en restant cohérente avec le choix Pythagore/loi des cosinus déjà fait pour la
 * norme — angleDroit : trigonométrie de base dans le triangle rectangle (`tan(déviation) = v2/v1`,
 * la résultante étant l'hypoténuse) ; angleQuelconque : loi des sinus (l'angle intérieur
 * `triangle.A` et le côté opposé `triangle.a` — la résultante — étant déjà connus à ce stade de la
 * résolution, retrouver l'angle opposé au 2e vecteur composant par un rapport de sinus est la suite
 * naturelle, jamais un second appel silencieux à la loi des cosinus). Les deux formules sont
 * mathématiquement exactement équivalentes à `triangle.C` (même triangle déjà résolu), donc n'importe
 * quel chemin de calcul redonne la même valeur affichée.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 4 questions) —
 * même décision documentée par `generateurs/triangleQuelconque/exportEvaluation.ts`/`generateurs/
 * quelAngle/exportEvaluation.ts` (même chapitre) : l'élève répond sur une feuille à part.
 */

// --- Rendu SVG imprimé du schéma vectoriel (voir le commentaire de tête ci-dessus) ---

const COULEUR_TRAIT = "#1f2933";
const COULEUR_RESULTANTE = "#e8590c";

const LARGEUR_SVG = 260;
const HAUTEUR_SVG = 240;
const MARGE_SVG = 44;

interface PointPixel {
  x: number;
  y: number;
}

/** Étiquette vectorielle "flèche géométrique + lettre + indice", en pur SVG statique — même
 * principe que `VecteurGraph.tsx::LabelVecteurFleche`, jamais un caractère Unicode combinant/
 * subscript (voir le commentaire de tête). */
function labelVecteurSvg(x: number, y: number, label: LabelGrapheVecteur, couleur: string): string {
  const tailleBase = 14;
  const tailleIndice = 9;
  const largeurFleche = 11;
  const yFleche = y - tailleBase * 0.85;
  const xDebut = x - largeurFleche / 2;
  const xFin = x + largeurFleche / 2;
  const fleche = `<line x1="${xDebut.toFixed(1)}" y1="${yFleche.toFixed(1)}" x2="${xFin.toFixed(1)}" y2="${yFleche.toFixed(1)}" stroke="${couleur}" stroke-width="1.4"/><polygon points="${(xFin + 3.5).toFixed(1)},${yFleche.toFixed(1)} ${(xFin - 1.5).toFixed(1)},${(yFleche - 3.2).toFixed(1)} ${(xFin - 1.5).toFixed(1)},${(yFleche + 3.2).toFixed(1)}" fill="${couleur}"/>`;
  const indice = label.indice
    ? `<tspan dy="${(tailleBase * 0.32).toFixed(1)}" font-size="${tailleIndice}">${label.indice}</tspan>`
    : "";
  const texteLabel = `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${tailleBase}" text-anchor="middle" dominant-baseline="alphabetic" fill="${couleur}"><tspan>${label.base}</tspan>${indice}</text>`;
  return `${fleche}${texteLabel}`;
}

/** Segment fléché (vecteur) entre deux points pixel déjà projetés — tête de flèche en triangle
 * plein, taille FIXE en pixels (croquis schématique imprimé, jamais dépendant du zoom, même
 * principe que `generateurs/triangleQuelconque/exportEvaluation.ts::construireSvgTriangle`). */
function segmentVecteurSvg(a: PointPixel, b: PointPixel, couleur: string): string {
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const longueurTete = 9;
  const largeurTete = 7;
  const xBase = b.x - longueurTete * Math.cos(angle);
  const yBase = b.y - longueurTete * Math.sin(angle);
  const perpX = -Math.sin(angle) * (largeurTete / 2);
  const perpY = Math.cos(angle) * (largeurTete / 2);
  const ligne = `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${xBase.toFixed(1)}" y2="${yBase.toFixed(1)}" stroke="${couleur}" stroke-width="2.2" stroke-linecap="round"/>`;
  const tete = `<polygon points="${b.x.toFixed(1)},${b.y.toFixed(1)} ${(xBase + perpX).toFixed(1)},${(yBase + perpY).toFixed(1)} ${(xBase - perpX).toFixed(1)},${(yBase - perpY).toFixed(1)}" fill="${couleur}"/>`;
  return `${ligne}${tete}`;
}

/**
 * Croquis vectoriel imprimé — reproduit `SchemaApplicationPhysique.tsx` (v1 depuis l'origine, v2
 * bout à bout à son extrémité, la résultante depuis l'origine) à partir des MÊMES coordonnées
 * réelles (`calculerVecteursSchema`, `ui/formatApplicationPhysique.ts`), projetées dans un repère
 * pixel local propre à ce fichier (mise à l'échelle + centrage, aucune dépendance à Mafs — voir le
 * commentaire de tête). Étiquette de chaque vecteur positionnée au milieu du segment, décalée vers
 * l'EXTÉRIEUR du triangle vectoriel (perpendiculaire au segment, côté opposé au centroïde) pour ne
 * jamais chevaucher les traits.
 */
function construireSvgVecteurs(instance: ExerciceApplicationPhysique): string {
  const { v1, resultante } = calculerVecteursSchema(instance);
  const labels = labelsGrapheApplicationPhysique(instance.contexte);

  const origine = { x: 0, y: 0 };
  const pointeV1 = { x: v1.x, y: v1.y };
  const pointeResultante = { x: resultante.x, y: resultante.y };

  const xs = [origine.x, pointeV1.x, pointeResultante.x];
  const ys = [origine.y, pointeV1.y, pointeResultante.y];
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const etendueX = Math.max(xMax - xMin, 1e-6);
  const etendueY = Math.max(yMax - yMin, 1e-6);

  const zoneUtile = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneUtileH = HAUTEUR_SVG - 2 * MARGE_SVG;
  const echelle = Math.min(zoneUtile / etendueX, zoneUtileH / etendueY);
  const dessinLargeur = etendueX * echelle;
  const dessinHauteur = etendueY * echelle;
  const decalageX = MARGE_SVG + (zoneUtile - dessinLargeur) / 2;
  const decalageY = MARGE_SVG + (zoneUtileH - dessinHauteur) / 2;

  const projeter = (p: { x: number; y: number }): PointPixel => ({
    x: decalageX + (p.x - xMin) * echelle,
    y: HAUTEUR_SVG - decalageY - (p.y - yMin) * echelle,
  });

  const pOrigine = projeter(origine);
  const pV1 = projeter(pointeV1);
  const pResultante = projeter(pointeResultante);
  const centroide: PointPixel = {
    x: (pOrigine.x + pV1.x + pResultante.x) / 3,
    y: (pOrigine.y + pV1.y + pResultante.y) / 3,
  };

  const DECALAGE_LABEL = 15;
  function positionLabel(a: PointPixel, b: PointPixel): PointPixel {
    const milieu = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const dir = { x: b.x - a.x, y: b.y - a.y };
    const longueur = Math.hypot(dir.x, dir.y) || 1;
    const perp = { x: -dir.y / longueur, y: dir.x / longueur };
    const versCentroide = { x: centroide.x - milieu.x, y: centroide.y - milieu.y };
    const signe = perp.x * versCentroide.x + perp.y * versCentroide.y > 0 ? -1 : 1;
    return { x: milieu.x + perp.x * signe * DECALAGE_LABEL, y: milieu.y + perp.y * signe * DECALAGE_LABEL };
  }

  const labelV1Pos = positionLabel(pOrigine, pV1);
  const labelV2Pos = positionLabel(pV1, pResultante);
  const labelResultantePos = positionLabel(pOrigine, pResultante);

  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schéma des deux vecteurs composants et de leur résultante">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
${segmentVecteurSvg(pOrigine, pV1, COULEUR_TRAIT)}
${segmentVecteurSvg(pV1, pResultante, COULEUR_TRAIT)}
${segmentVecteurSvg(pOrigine, pResultante, COULEUR_RESULTANTE)}
${labelVecteurSvg(labelV1Pos.x, labelV1Pos.y, labels.v1, COULEUR_TRAIT)}
${labelVecteurSvg(labelV2Pos.x, labelV2Pos.y, labels.v2, COULEUR_TRAIT)}
${labelVecteurSvg(labelResultantePos.x, labelResultantePos.y, labels.resultante, COULEUR_RESULTANTE)}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même préoccupation que `generateurs/triangleQuelconque/exportEvaluation.ts::construireSvgTriangle`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Correction resynthétisée (voir le commentaire de tête — pourquoi pas un simple copier-coller
// des aides existantes pour "deviation", qui n'en a aucune côté écran) ---

function arrondiDeux(valeur: number): number {
  return Math.round(valeur * 100) / 100;
}

function paragraphe(lettre: string, fragments: FragmentConsigne[]): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) `), ...fragments] };
}

/** Correction (a) — configuration : le type d'angle est directement donné dans l'énoncé (angle
 * entre les deux vecteurs composants), jamais à déduire d'autre chose. */
function correctionConfiguration(instance: ExerciceApplicationPhysique): BlocCorrection {
  const { v1, v2 } = notationVecteursApplicationPhysique(instance.contexte);
  const estDroit = instance.variante === "angleDroit";
  return paragraphe("a", [
    texte(
      `L'énoncé donne un angle de ${instance.angleEntreVecteurs}° entre `,
    ),
    latex(v1),
    texte(" et "),
    latex(v2),
    texte(` : c'est ${estDroit ? "un angle droit" : "un angle quelconque (ni droit, ni nul, ni plat)"} — configuration "${estDroit ? "Angle droit" : "Angle quelconque"}".`),
  ]);
}

/** Correction (b) — norme de la résultante : réutilise exactement les mêmes formules (non
 * substituée puis substituée) que l'aide 2 niveaux de l'écran "norme" (seul écran à en avoir une),
 * cf. `ui/formatApplicationPhysique.ts::segmentsAideNormeNiveau1`/`formatAideNormeNiveau2Latex`. */
function correctionNorme(instance: ExerciceApplicationPhysique): BlocCorrection {
  const { v1, v2, resultante, normeResultante } = notationVecteursApplicationPhysique(instance.contexte);
  const estDroit = instance.variante === "angleDroit";
  const fragments: FragmentConsigne[] = estDroit
    ? [
        texte("Théorème de Pythagore : "),
        latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 = ${instance.v1}^2 + ${instance.v2}^2`),
      ]
    : (() => {
        const alpha = 180 - instance.angleEntreVecteurs;
        return [
          texte("Loi des cosinus (α = angle du triangle vectoriel opposé à la résultante) : "),
          latex(
            `\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 - 2\\|${v1}\\|\\|${v2}\\|\\cos(\\alpha) = ${instance.v1}^2 + ${instance.v2}^2 - 2\\cdot ${instance.v1}\\cdot ${instance.v2}\\cdot\\cos(${alpha}°)`,
          ),
        ];
      })();
  fragments.push(texte(`, donc `), latex(`${normeResultante} \\approx ${arrondiDeux(instance.triangle.a)} \\text{ ${instance.unite}}`), texte("."));
  return paragraphe("b", fragments);
}

/** Correction (c) — angle de déviation : PAS d'aide existante à réutiliser (voir le commentaire de
 * tête) — resynthétisée en restant sur le même choix de méthode que (b) : trigonométrie du triangle
 * rectangle pour angleDroit, loi des sinus pour angleQuelconque (l'angle intérieur et le côté
 * "résultante" opposé étant déjà connus à ce stade). */
function correctionDeviation(instance: ExerciceApplicationPhysique): BlocCorrection {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(instance.contexte);
  const estDroit = instance.variante === "angleDroit";
  const fragments: FragmentConsigne[] = estDroit
    ? [
        texte("Dans le triangle rectangle formé par les vecteurs composants, la résultante est l'hypoténuse : "),
        latex(`\\tan(\\text{déviation}) = \\dfrac{\\|${v2}\\|}{\\|${v1}\\|} = \\dfrac{${instance.v2}}{${instance.v1}}`),
      ]
    : (() => {
        const alpha = 180 - instance.angleEntreVecteurs;
        return [
          texte("Loi des sinus, avec l'angle intérieur α et le côté résultante déjà connus : "),
          latex(
            `\\dfrac{\\sin(\\text{déviation})}{\\|${v2}\\|} = \\dfrac{\\sin(\\alpha)}{\\|${resultante}\\|} \\;\\Rightarrow\\; \\sin(\\text{déviation}) = \\dfrac{${instance.v2}\\cdot\\sin(${alpha}°)}{${arrondiDeux(instance.triangle.a)}}`,
          ),
        ];
      })();
  fragments.push(texte(", donc déviation ≈ "), latex(`${arrondiDeux(instance.triangle.C)}°`), texte("."));
  return paragraphe("c", fragments);
}

/** Correction (d) — direction cardinale : dérivée de la géométrie RÉELLE (`triangle.C` face à 90°,
 * jamais figée à "Nord"), même raisonnement que `directionCorrecte` (voir `generateurs/
 * applicationPhysique/index.ts`), jamais recalculée indépendamment ici. */
function correctionInterpretation(instance: ExerciceApplicationPhysique): BlocCorrection {
  const coteTexte = instance.coteDeviation === "est" ? "l'Est" : "l'Ouest";
  const cotePrincipal = instance.triangle.C < 90 ? "Nord" : "Sud";
  return paragraphe("d", [
    texte(
      `La résultante dévie vers ${coteTexte} par rapport au premier vecteur (donnée de l'énoncé). L'angle de déviation trouvé en (c) vaut ${arrondiDeux(instance.triangle.C)}°, ${instance.triangle.C < 90 ? "inférieur" : "supérieur"} à 90° : la résultante reste donc du côté ${cotePrincipal}. Direction : ${instance.directionCorrecte}.`,
    ),
  ]);
}

// --- Énoncé / correction ---

function texteOptionsDirection(): string {
  return OPTIONS_DIRECTION.join(", ");
}

function construireEnonceApplicationPhysique(instance: ExerciceApplicationPhysique): SectionExercice {
  return {
    enteteFragments: [texte(formatEnonceApplicationPhysique(instance))],
    enteteHtml: construireSvgVecteurs(instance),
    questions: [
      { consigne: segmentsConsigneConfiguration(instance), reponse: { type: "lignes", nombre: 0 } },
      { consigne: segmentsConsigneNorme(instance), reponse: { type: "lignes", nombre: 0 } },
      { consigne: segmentsConsigneDeviation(instance), reponse: { type: "lignes", nombre: 0 } },
      {
        consigne: [texte(`Dans quelle direction cardinale se dirige la résultante ? (${texteOptionsDirection()})`)],
        reponse: { type: "lignes", nombre: 0 },
      },
    ],
  };
}

function construireCorrectionApplicationPhysique(instance: ExerciceApplicationPhysique): BlocCorrection[] {
  return [
    correctionConfiguration(instance),
    correctionNorme(instance),
    correctionDeviation(instance),
    correctionInterpretation(instance),
  ];
}

export const adaptateurEvaluationApplicationPhysique: AdaptateurFeuilleExercices<ExerciceApplicationPhysique> = {
  titreDocument: "Applications physiques (résultante de vecteurs) — Évaluation",
  nomFichierBase: "application-physique-resultante-vecteurs",
  genererInstance: genererExerciceApplicationPhysique,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceApplicationPhysique,
  construireCorrection: construireCorrectionApplicationPhysique,
  // 4 questions par instance, `enteteHtml` (croquis SVG des vecteurs) : 2 raisons indépendantes déjà
  // suffisantes chacune — voir le commentaire de tête.
};
