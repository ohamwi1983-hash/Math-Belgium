import type { ExerciceApplicationPhysique } from "../../core/applicationPhysique.types";
import type { AdaptateurFeuilleExercices, BlocCorrection, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import {
  geometrieSchemaApplicationPhysique,
  legendeAngleSchemaApplicationPhysique,
  formatEnonceApplicationPhysique,
  formatValeurApplicationPhysique,
  labelsGrapheApplicationPhysique,
  notationVecteursApplicationPhysique,
  OPTIONS_DIRECTION,
  segmentsConsigneConfiguration,
  segmentsConsigneDeviation,
  segmentsConsigneNorme,
} from "../../ui/formatApplicationPhysique";
import type { LabelGrapheVecteur } from "../../ui/formatApplicationPhysique";
import { nombreFrLatex } from "../../ui/nombreFr";
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
 * PERSISTANT sur les 4 écrans (règle du parallélogramme du cours : v1 et v2 depuis la même origine,
 * arc θ, côtés parallèles en pointillés — voir son commentaire de tête), jamais un écran "énoncé" séparé
 * sans figure. Un énoncé purement textuel serait donc une régression par rapport à l'écran. Le
 * croquis est reproduit via `SectionExercice.enteteHtml` (voir sa doc dans
 * `genererFeuilleExercices.ts` — seul le pipeline HTML de l'évaluation le rend, jamais docx/pdf).
 *
 * **Construction du SVG imprimé** : contrairement à `triangleQuelconque` (géométrie SCHÉMATIQUE à
 * coordonnées pixel fixes), ce croquis réutilise directement `geometrieSchemaApplicationPhysique` (même module
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
const COULEUR_CONSTRUCTION = "#868e96";

const LARGEUR_SVG = 260;
const HAUTEUR_SVG = 240;
/** La géométrie partagée inclut déjà sa propre marge (étiquettes, rose des vents) : marge pixel
 * réduite au simple liseré du cadre. */
const MARGE_SVG = 10;

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
 * Croquis vectoriel imprimé — reproduit `SchemaApplicationPhysique.tsx` tel que l'élève le voit
 * avant d'avoir répondu (règle du parallélogramme : v1 et v2 depuis la même origine, arc θ, côtés
 * parallèles en pointillés, rose des vents ; résultante NON dessinée, décision F3 — elle donnerait
 * la direction demandée en (d)) à partir de la MÊME géométrie
 * (`geometrieSchemaApplicationPhysique`, `ui/formatApplicationPhysique.ts` : mêmes points, mêmes
 * positions d'étiquettes), projetée dans un repère pixel local propre à ce fichier (mise à
 * l'échelle + centrage, aucune dépendance à Mafs — voir le commentaire de tête).
 */
function construireSvgVecteurs(instance: ExerciceApplicationPhysique): string {
  const geometrie = geometrieSchemaApplicationPhysique(instance);
  const { v1, v2, cotesPointilles, arc, etiquettes, rose } = geometrie;
  const labels = labelsGrapheApplicationPhysique(instance.contexte);

  const [coinMin, coinMax] = geometrie.coins;
  const etendueX = Math.max(coinMax.x - coinMin.x, 1e-6);
  const etendueY = Math.max(coinMax.y - coinMin.y, 1e-6);

  const zoneUtile = LARGEUR_SVG - 2 * MARGE_SVG;
  const zoneUtileH = HAUTEUR_SVG - 2 * MARGE_SVG;
  const echelle = Math.min(zoneUtile / etendueX, zoneUtileH / etendueY);
  const decalageX = MARGE_SVG + (zoneUtile - etendueX * echelle) / 2;
  const decalageY = MARGE_SVG + (zoneUtileH - etendueY * echelle) / 2;

  const projeter = (p: { x: number; y: number }): PointPixel => ({
    x: decalageX + (p.x - coinMin.x) * echelle,
    y: HAUTEUR_SVG - decalageY - (p.y - coinMin.y) * echelle,
  });

  const pOrigine = projeter({ x: 0, y: 0 });
  const pV1 = projeter(v1);
  const pV2 = projeter(v2);
  const cotes = cotesPointilles
    .map(([a, b]) => {
      const pa = projeter(a);
      const pb = projeter(b);
      return `<line x1="${pa.x.toFixed(1)}" y1="${pa.y.toFixed(1)}" x2="${pb.x.toFixed(1)}" y2="${pb.y.toFixed(1)}" stroke="${COULEUR_CONSTRUCTION}" stroke-width="1.4" stroke-dasharray="5 4"/>`;
    })
    .join("");
  const pointsArc = arc.points
    .map((p) => {
      const pp = projeter(p);
      return `${pp.x.toFixed(1)},${pp.y.toFixed(1)}`;
    })
    .join(" ");
  const pLabelArc = projeter(arc.label);
  const pCentreRose = projeter(rose.centre);
  const roseSvg = (["N", "E", "S", "O"] as const)
    .map((direction) => {
      const pb = projeter(rose.branches[direction]);
      const pl = projeter(rose.lettres[direction]);
      const epaisseur = direction === "N" ? 1.6 : 1;
      return `<line x1="${pCentreRose.x.toFixed(1)}" y1="${pCentreRose.y.toFixed(1)}" x2="${pb.x.toFixed(1)}" y2="${pb.y.toFixed(1)}" stroke="${COULEUR_CONSTRUCTION}" stroke-width="${epaisseur}"/><text x="${pl.x.toFixed(1)}" y="${pl.y.toFixed(1)}" font-size="11" text-anchor="middle" dominant-baseline="central" fill="${COULEUR_CONSTRUCTION}">${direction}</text>`;
    })
    .join("");
  const labelV1Pos = projeter(etiquettes.v1);
  const labelV2Pos = projeter(etiquettes.v2);

  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Schéma des deux vecteurs composants issus d'une même origine, angle θ = ${instance.angleEntreVecteurs}° entre eux, parallélogramme esquissé en pointillés">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
${cotes}
<polyline points="${pointsArc}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.4"/>
<text x="${pLabelArc.x.toFixed(1)}" y="${pLabelArc.y.toFixed(1)}" font-size="13" text-anchor="middle" dominant-baseline="central" fill="${COULEUR_TRAIT}">θ</text>
${roseSvg}
${segmentVecteurSvg(pOrigine, pV1, COULEUR_TRAIT)}
${segmentVecteurSvg(pOrigine, pV2, COULEUR_TRAIT)}
${labelVecteurSvg(labelV1Pos.x, labelV1Pos.y, labels.v1, COULEUR_TRAIT)}
${labelVecteurSvg(labelV2Pos.x, labelV2Pos.y, labels.v2, COULEUR_TRAIT)}
</svg>
<p style="margin:0.2em 0 0;font-size:0.85em;color:#555;">${legendeAngleSchemaApplicationPhysique(instance)}</p>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même préoccupation que `generateurs/triangleQuelconque/exportEvaluation.ts::construireSvgTriangle`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

// --- Correction resynthétisée (voir le commentaire de tête — pourquoi pas un simple copier-coller
// des aides existantes pour "deviation", qui n'en a aucune côté écran) ---

/** Arrondi 2 décimales, virgule décimale `{,}` (audit chapitre 6, point 14). */
function valeurLatex(valeur: number): string {
  return nombreFrLatex(Math.round(valeur * 100) / 100);
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
 * cf. `ui/formatApplicationPhysique.ts::segmentsAideNormeNiveau1`/`formatAideNormeNiveau2Latex` —
 * formule du cours, θ = angle de l'énoncé entre les deux vecteurs (audit chapitre 6, point 19). */
function correctionNorme(instance: ExerciceApplicationPhysique): BlocCorrection {
  const { v1, v2, resultante, normeResultante } = notationVecteursApplicationPhysique(instance.contexte);
  const estDroit = instance.variante === "angleDroit";
  const fragments: FragmentConsigne[] = estDroit
    ? [
        texte("Théorème de Pythagore : "),
        latex(`\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 = ${instance.v1}^2 + ${instance.v2}^2`),
      ]
    : [
        texte(`Formule de la résultante (loi des cosinus, θ = ${instance.angleEntreVecteurs}° entre les deux vecteurs) : `),
        latex(
          `\\|${resultante}\\|^2 = \\|${v1}\\|^2 + \\|${v2}\\|^2 + 2\\|${v1}\\|\\|${v2}\\|\\cos\\theta = ${instance.v1}^2 + ${instance.v2}^2 + 2\\cdot ${instance.v1}\\cdot ${instance.v2}\\cdot\\cos(${instance.angleEntreVecteurs}°)`,
        ),
      ];
  fragments.push(texte(`, donc `), latex(`${normeResultante} \\approx ${valeurLatex(instance.triangle.a)} \\text{ ${instance.unite}}`), texte("."));
  return paragraphe("b", fragments);
}

/** Correction (c) — angle de déviation : PAS d'aide existante à réutiliser (voir le commentaire de
 * tête) — resynthétisée en restant sur le même choix de méthode que (b) : pour angleDroit, le
 * parallélogramme est un rectangle et la résultante (sa diagonale) l'hypoténuse du triangle formé
 * par v1 et le côté parallèle à v2 (tangente) ; loi des sinus du cours pour angleQuelconque
 * (`sin(déviation)/‖v₂‖ = sin θ/‖v_R‖`, θ = angle de l'énoncé). */
function correctionDeviation(instance: ExerciceApplicationPhysique): BlocCorrection {
  const { v1, v2, resultante } = notationVecteursApplicationPhysique(instance.contexte);
  const estDroit = instance.variante === "angleDroit";
  const fragments: FragmentConsigne[] = estDroit
    ? [
        texte("Le parallélogramme est ici un rectangle : la résultante, sa diagonale, est l'hypoténuse du triangle rectangle formé par "),
        latex(v1),
        texte(" et le côté parallèle à "),
        latex(v2),
        texte(" : "),
        latex(`\\tan(\\text{déviation}) = \\dfrac{\\|${v2}\\|}{\\|${v1}\\|} = \\dfrac{${instance.v2}}{${instance.v1}}`),
      ]
    : [
        texte("Loi des sinus, avec θ et la norme de la résultante déjà connus : "),
        latex(
          `\\dfrac{\\sin(\\text{déviation})}{\\|${v2}\\|} = \\dfrac{\\sin\\theta}{\\|${resultante}\\|} \\;\\Rightarrow\\; \\sin(\\text{déviation}) = \\dfrac{${instance.v2}\\cdot\\sin(${instance.angleEntreVecteurs}°)}{${valeurLatex(instance.triangle.a)}}`,
        ),
      ];
  fragments.push(texte(", donc déviation ≈ "), latex(`${valeurLatex(instance.triangle.C)}°`), texte("."));
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
      `La résultante dévie vers ${coteTexte} par rapport au premier vecteur (donnée de l'énoncé). L'angle de déviation trouvé en (c) vaut ${formatValeurApplicationPhysique(instance.triangle.C)}°, ${instance.triangle.C < 90 ? "inférieur" : "supérieur"} à 90° : la résultante reste donc du côté ${cotePrincipal}. Direction : ${instance.directionCorrecte}.`,
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
