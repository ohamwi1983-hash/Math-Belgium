import type { ExerciceTriangleQuelconque } from "../../core/triangleQuelconque.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, EnoncePapier, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
  consigneAire,
  consigneDonneeManquante,
  formatAire,
  libelleDonneeManquante,
  valeurAffichee,
  libelleConfiguration,
  texteAide2Aire,
  texteAide2DonneeManquante,
  valeurAffichageDonneeManquante,
  valeursTriangleSketchDonneeManquante,
} from "../../ui/formatTriangleQuelconque";
import type { TriangleSketchGeometrie } from "../../ui/triangleSketch";
import { calculerTriangleSketch } from "../../ui/triangleSketch";
import { aireTriangle } from "../triangle/resoudreTriangle";
import { avecVirgulesBelges, nombreFrLatex } from "../../ui/nombreFr";
import { profilCalculatrice } from "../profilsEvaluation4eCh5";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceTriangleQuelconque } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTriangleQuelconque>` pour gen19 (Triangle
 * quelconque — chapitre 3, `AppTriangleQuelconque.tsx`) — voir `generateurs/analyseFonction/
 * exportWord.ts` pour le mécanisme générique de référence, et `generateurs/cercleTrigonometrique/
 * exportEvaluation.ts` (gen14, même chapitre) pour l'exemple jumeau d'une décision "graphique
 * papier ou pas" documentée en tête plutôt que supposée.
 *
 * **Écran → question** : `moteur/sessionTriangleQuelconque.ts` enchaîne 2 phases FIXES, toujours
 * dans le même ordre : "donneeManquante" (retrouver un côté par la loi des sinus, ou un angle par
 * Al-Kashi) → "aire" (calculer l'aire du même triangle, toujours présente quelle que soit la
 * configuration — voir `core/triangleQuelconque.types.ts`). Ceci devient ici 2 questions a)/b), dans
 * le même ordre, jamais recombinées : (a) la donnée manquante de l'écran 1 ; (b) l'aire de l'écran
 * 2. Comme à l'écran, (b) dépend mathématiquement de la valeur retrouvée en (a) pour au moins un des
 * deux générateurs de données de la formule d'aire (`moteur/verificationTriangleQuelconque.ts::
 * donneesFormuleAire` — `loiSinus` : la donnée manquante de (a) EST le côté `b` réutilisé par (b) ;
 * `alKashi` : la donnée manquante de (a) EST l'angle `A` réutilisé par (b)) — comportement séquentiel
 * volontairement conservé tel quel (même principe qu'un exercice papier « a) puis b) » classique),
 * jamais contourné en donnant par avance la réponse de (a) dans l'énoncé de (b).
 *
 * **Graphique papier NÉCESSAIRE, contrairement à gen14/gen18** (voir leur commentaire de tête pour
 * la décision inverse) : l'écran interactif de ce générateur (`EtapeDonneeManquante.tsx`) montre
 * TOUJOURS un croquis du triangle avec ses données connues et la donnée manquante affichée "?"
 * (jamais la vraie valeur — voir `ui/formatTriangleQuelconque.ts::valeursTriangleSketchDonneeManquante`)
 * : contrairement au sélecteur de quadrant de gen14, rien n'est caché ici que le dessin papier
 * révélerait en plus. Un énoncé purement textuel («triangle ABC avec BC=9,4cm, Â=52°, B̂=61°»)
 * serait une régression par rapport à l'écran, qui montre la figure. L'énoncé papier reproduit donc
 * ce même croquis via `SectionExercice.enteteHtml` (voir sa doc dans `genererFeuilleExercices.ts` —
 * seul le pipeline HTML de l'évaluation le rend, jamais le docx/pdf).
 *
 * **Construction du SVG imprimé** : réutilise la géométrie SCHÉMATIQUE partagée (coordonnées pixel
 * FIXES, jamais à l'échelle numérique réelle du triangle tiré — voir la doc de tête de
 * `ui/triangleSketch.ts`) via `calculerTriangleSketch(valeursTriangleSketchDonneeManquante(instance))`
 * — exactement les mêmes coordonnées et le même texte de valeur que `TriangleQuelconqueSketch.tsx`/
 * `EtapeDonneeManquante.tsx` à l'écran (surlignages/connecteurs de paire de
 * `ui/triangleQuelconqueSketch.ts` volontairement omis ici : ce sont des indices d'AIDE progressive,
 * jamais affichés au niveau 0 — un énoncé papier imprimé démarre toujours "aide non activée", comme
 * un exercice fraîchement ouvert à l'écran). Le rendu SVG lui-même est réécrit en attributs SVG
 * inline (`fill`/`stroke` directs), PAS avec les classes CSS de l'app (`.triangle-sketch-forme`
 * etc., `App.css`) : `export/assemblerEvaluationHtml.ts` (lu avant d'écrire ce fichier) n'injecte
 * dans la page HTML exportée que le CSS KaTeX + `STYLE_PAGE`/`STYLE_EVALUATION`, jamais les feuilles
 * de style de l'application React — même approche que `export/svgGraph.ts` (`construireSvgFonction`),
 * seul autre module du projet à produire un `<svg>` autonome pour ce même pipeline HTML.
 *
 * PAS `regroupable`, pour 3 raisons indépendantes, chacune déjà suffisante à elle seule (voir la doc
 * de `AdaptateurFeuilleExercices.regroupable`, `genererFeuilleExercices.ts`) : (1) 2 questions par
 * instance, jamais 1 seule ; (2) la consigne de (a) dépend de l'instance (`consigneDonneeManquante`
 * nomme la lettre réellement manquante — "le côté AC" ou "l'angle A" selon la configuration tirée),
 * jamais une consigne générique constante ; (3) `construireEnonceTriangleQuelconque` utilise
 * `enteteHtml` (le croquis SVG), explicitement exclu par la doc de `regroupable`.
 *
 * **Correction RESYNTHÉTISÉE** depuis les valeurs déjà connues de l'instance tirée
 * (`instance.triangle`, un `Triangle` COMPLET — 3 côtés + 3 angles mutuellement cohérents, déjà
 * résolu par `resoudreAAS`/`resoudreSSS` au moment de la génération, jamais redérivé
 * indépendamment ici), en réutilisant directement les fonctions déjà utilisées côté écran pour le
 * texte de l'aide de niveau 2 (`ui/formatTriangleQuelconque.ts::texteAide2DonneeManquante`/
 * `texteAide2Aire`, qui donnent déjà la formule substituée — loi des sinus ou Al-Kashi résolue en
 * cosinus pour (a), ½·côté·côté·sin(angle) pour (b)) et le texte déjà formaté de la réponse de (a)
 * (`valeurAffichageDonneeManquante`). Seule la valeur numérique finale de l'aire n'a pas de
 * formateur exporté équivalent : recalculée localement via `aireTriangle` (`generateurs/triangle/
 * resoudreTriangle.ts`, déjà importé par `generateurs/triangleQuelconque/index.ts` — import
 * générateur→générateur, jamais `src/moteur/`, qui n'importe **jamais** `src/generateurs/` et
 * vice-versa, règle non négociable de CLAUDE.md) plutôt que d'importer `valeurAire`
 * (`moteur/verificationTriangleQuelconque.ts`) — même décision de PETITE fonction dupliquée plutôt
 * qu'un import inter-couches que `verificationTriangleQuelconque.ts::aireDepuisPaire` a lui-même
 * prise pour la même raison (voir son commentaire de tête). Le couple (côté1, côté2, angle compris)
 * utilisé ici pour ce recalcul est celui de `DONNEES_FORMULE_AIRE` ci-dessous — copie locale, à la
 * lettre, de la table `moteur/verificationTriangleQuelconque.ts::DONNEES_FORMULE_AIRE` (même
 * contrainte de couche) ; le résultat est mathématiquement invariant quel que soit le couple choisi
 * (`½ab·sinC = ½bc·sinA = ½ac·sinB`, voir cette même doc), donc ce choix ne change jamais la valeur
 * affichée, seulement quelle paire de la formule est mise en évidence dans le texte substitué de
 * `texteAide2Aire`.
 *
 * **Aucune zone de réponse vierge** (`reponse: { type: "lignes", nombre: 0 }` sur les 2 questions) —
 * même décision documentée par `generateurs/quelAngle/exportEvaluation.ts`/`generateurs/
 * cercleTrigonometrique/exportEvaluation.ts` (même chapitre) : l'élève répond sur une feuille à
 * part, jamais sur la copie imprimée elle-même (voir aussi le commentaire de tête d'`export/
 * assemblerEvaluationHtml.ts::corpsQuestionHtml`, qui n'affiche jamais de zone de réponse pour le
 * pipeline HTML évaluation quel que soit ce champ — `nombre: 0` ne change donc rien pour CE pipeline
 * précis, mais garde le piperic docx/pdf partagé cohérent avec la même intention si jamais réutilisé).
 */

// --- Rendu SVG imprimé du croquis (voir le commentaire de tête ci-dessus) ---

const COULEUR_TRAIT = "#1f2933";
const COULEUR_VALEUR = "#1971c2";

function echapperAttribut(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function texteSvg(
  x: number,
  y: number,
  contenu: string,
  options: { taille: number; gras?: boolean; couleur: string; ancre?: "start" | "middle" | "end" },
): string {
  const poids = options.gras ? ' font-weight="bold"' : "";
  return `<text x="${x}" y="${y}" font-size="${options.taille}"${poids} text-anchor="${options.ancre ?? "middle"}" dominant-baseline="middle" fill="${options.couleur}">${echapperAttribut(contenu)}</text>`;
}

/** Croquis SCHÉMATIQUE imprimé — mêmes coordonnées pixel fixes et le même texte de valeur que
 * `TriangleQuelconqueSketch.tsx`/`ui/triangleSketch.ts` à l'écran, jamais un dessin à l'échelle
 * numérique réelle. Voir le commentaire de tête du fichier pour pourquoi ceci est réécrit en
 * attributs SVG inline plutôt qu'avec les classes CSS de l'app. */
function construireSvgTriangle(geometrie: TriangleSketchGeometrie): string {
  const { largeur, hauteur, sommets, labelSommet, labelCote, labelAngle, valeurs } = geometrie;

  const polygone = `<polygon points="${sommets.A.x},${sommets.A.y} ${sommets.B.x},${sommets.B.y} ${sommets.C.x},${sommets.C.y}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="2" stroke-linejoin="round"/>`;

  const labelsSommets = (["A", "B", "C"] as const)
    .map((sommet) => texteSvg(labelSommet[sommet].x, labelSommet[sommet].y, sommet, { taille: 13, gras: true, couleur: COULEUR_TRAIT }))
    .join("");

  const labelsValeurs = [
    valeurs.a != null ? texteSvg(labelCote.a.x, labelCote.a.y, valeurs.a, { taille: 12, couleur: COULEUR_VALEUR }) : "",
    // Côtés obliques : texte ancré vers l'extérieur, pour qu'une valeur longue (« 17,94 mm ») ne
    // chevauche pas le côté qu'elle nomme (même ancrage que `TriangleQuelconqueSketch.tsx`).
    valeurs.b != null ? texteSvg(labelCote.b.x, labelCote.b.y, valeurs.b, { taille: 12, couleur: COULEUR_VALEUR, ancre: "start" }) : "",
    valeurs.c != null ? texteSvg(labelCote.c.x, labelCote.c.y, valeurs.c, { taille: 12, couleur: COULEUR_VALEUR, ancre: "end" }) : "",
    valeurs.angA != null ? texteSvg(labelAngle.A.x, labelAngle.A.y, valeurs.angA, { taille: 12, couleur: COULEUR_VALEUR }) : "",
    valeurs.angB != null ? texteSvg(labelAngle.B.x, labelAngle.B.y, valeurs.angB, { taille: 12, couleur: COULEUR_VALEUR }) : "",
    valeurs.angC != null ? texteSvg(labelAngle.C.x, labelAngle.C.y, valeurs.angC, { taille: 12, couleur: COULEUR_VALEUR }) : "",
  ].join("");

  const svg = `<svg width="${largeur}" height="${hauteur + 4}" viewBox="0 -4 ${largeur} ${hauteur + 4}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Croquis du triangle avec les données connues">
<rect x="0" y="-4" width="${largeur}" height="${hauteur + 4}" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
${polygone}
${labelsSommets}
${labelsValeurs}
</svg>`;
  const legende = `<div style="font-size:0.85em;color:#57606a;">Croquis non à l'échelle</div>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages
  // (même préoccupation que `.grille-graphes-cyclo` de `assemblerEvaluationHtml.ts::STYLE_EVALUATION`,
  // repris ici en style inline puisque ce fichier ne peut pas toucher cette feuille de style globale).
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}${legende}</div>`;
}

// --- Aire recalculée localement (voir le commentaire de tête — jamais un import de src/moteur/) ---

interface DonneesFormuleAireLocales {
  cote1: "a" | "b" | "c";
  cote2: "a" | "b" | "c";
  angleCompris: "A" | "B" | "C";
}

/** Copie locale, à la lettre, de `moteur/verificationTriangleQuelconque.ts::DONNEES_FORMULE_AIRE` —
 * voir le commentaire de tête pour pourquoi cette petite table est dupliquée plutôt qu'importée. */
const DONNEES_FORMULE_AIRE: Record<ExerciceTriangleQuelconque["configuration"], DonneesFormuleAireLocales> = {
  loiSinus: { cote1: "a", cote2: "b", angleCompris: "C" },
  alKashi: { cote1: "b", cote2: "c", angleCompris: "A" },
  alKashiCote: { cote1: "b", cote2: "c", angleCompris: "A" },
};


/** Valeur numérique de l'aire de l'instance — invariante quel que soit le couple choisi dans
 * `DONNEES_FORMULE_AIRE` (½ab·sinC = ½bc·sinA = ½ac·sinB), voir le commentaire de tête. */
function aireInstance(instance: ExerciceTriangleQuelconque): number {
  const { cote1, cote2, angleCompris } = DONNEES_FORMULE_AIRE[instance.configuration];
  const { triangle } = instance;
  return aireTriangle(triangle[cote1], triangle[cote2], triangle[angleCompris]);
}

/** Aire au centième, virgule décimale — même formateur que l'écran (`formatAire`). */
function formatAireAffichage(instance: ExerciceTriangleQuelconque): string {
  return formatAire(instance, aireInstance(instance));
}

// --- Énoncé / correction ---

/** Consigne d'écran sans la mention de tolérance, qui sert aussi de titre d'étape au corrigé papier. */
function sansTolerance(consigne: string): string {
  return consigne.replace(/ \(une valeur approchée est acceptée, à environ 1 % près\)/, "");
}

function construireEnonceTriangleQuelconque(instance: ExerciceTriangleQuelconque): SectionExercice {
  const geometrie = calculerTriangleSketch(valeursTriangleSketchDonneeManquante(instance));

  return {
    enteteFragments: [texte("On considère le triangle ABC suivant (les côtés minuscules sont opposés aux angles majuscules de même lettre) :")],
    enteteHtml: construireSvgTriangle(geometrie),
    questions: [
      { consigne: [texte(sansTolerance(consigneDonneeManquante(instance)))] },
      { consigne: [texte(sansTolerance(consigneAire()))] },
    ],
  };
}

function paragraphe(lettre: string, fragments: FragmentConsigne[]): BlocCorrection {
  return { type: "paragraphe", fragments: [texte(`${lettre}) `), ...fragments] };
}

function construireCorrectionTriangleQuelconque(instance: ExerciceTriangleQuelconque): BlocCorrection[] {
  return [
    paragraphe("a", [
      texte(`On utilise ${libelleConfiguration(instance.configuration).toLowerCase()}. `),
      texte(`${texteAide2DonneeManquante(instance)} → ${valeurAffichageDonneeManquante(instance)}.`),
    ]),
    paragraphe("b", [texte(`${texteAide2Aire(instance)} ≈ ${formatAireAffichage(instance)}.`)]),
  ];
}

// --- Papier (refonte `.claude/rules/feuilles-evaluations.md`) ---
// Les deux écrans (donnée manquante, puis aire) sont deux VRAIES questions distinctes d'un même
// problème : elles restent a) et b) sur papier (b) réutilise le résultat de a), comme à l'écran).
// Les consignes papier remplacent la tolérance d'écran (« à environ 1 % près ») par une précision
// d'arrondi. Toutes les valeurs : `instance.triangle` (résolu à la génération) et les arrondis de
// l'écran (`valeurAffichee`, `formatAire`). Calculatrice indispensable (valeurs décimales).

const SEGMENT: Record<"a" | "b" | "c", string> = { a: "BC", b: "AC", c: "AB" };

/** Valeur arrondie comme à l'écran, en LaTeX (virgule décimale), avec son unité. */
function v(instance: ExerciceTriangleQuelconque, lettre: "a" | "b" | "c" | "A" | "B" | "C"): string {
  const n = nombreFrLatex(valeurAffichee(instance, lettre));
  return lettre === lettre.toLowerCase() ? `${n}\\text{ ${instance.unite}}` : `${n}^\\circ`;
}

function consignesPapier(instance: ExerciceTriangleQuelconque): FragmentConsigne[][] {
  const premiere =
    instance.donneeManquante === "A" ? "Calcule l'amplitude de l'angle A (au dixième de degré près)." : `Calcule la longueur du ${libelleDonneeManquante(instance).replace(/^le /, "")} (au centième près).`;
  return [[texte(premiere)], [texte("Calcule l'aire du triangle ABC (au centième près).")]];
}

function enoncePapier(instance: ExerciceTriangleQuelconque): EnoncePapier {
  const base = construireEnonceTriangleQuelconque(instance);
  return {
    section: { ...base, questions: consignesPapier(instance).map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a"], ["b"]],
  };
}

function lignesDonneeManquante(instance: ExerciceTriangleQuelconque): EtapeCorrection[] {
  const t = instance.triangle;
  if (instance.configuration === "loiSinus") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("Deux angles et le côté opposé à l'un d'eux : loi des sinus, "), latex("\\dfrac{BC}{\\sin A} = \\dfrac{AC}{\\sin B}"), texte(".")] },
      { label: "Calcul", sousQuestion: "a", fragments: [latex(`AC = \\dfrac{BC \\cdot \\sin B}{\\sin A} = \\dfrac{${v(instance, "a")} \\cdot \\sin ${v(instance, "B")}}{\\sin ${v(instance, "A")}} \\approx ${v(instance, "b")}`)] },
    ];
  }
  if (instance.configuration === "alKashi") {
    const cosA = (t.b * t.b + t.c * t.c - t.a * t.a) / (2 * t.b * t.c);
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte("Trois côtés connus : loi des cosinus (Al-Kashi) résolue en cos A, "), latex("\\cos A = \\dfrac{AC^2 + AB^2 - BC^2}{2 \\cdot AC \\cdot AB}"), texte(".")] },
      {
        label: "Calcul",
        sousQuestion: "a",
        fragments: [latex(`\\cos A = \\dfrac{${nombreFrLatex(t.b)}^2 + ${nombreFrLatex(t.c)}^2 - ${nombreFrLatex(t.a)}^2}{2 \\cdot ${nombreFrLatex(t.b)} \\cdot ${nombreFrLatex(t.c)}} \\approx ${nombreFrLatex(Math.round(cosA * 10000) / 10000)} \\quad\\Rightarrow\\quad A \\approx ${v(instance, "A")}`)],
      },
    ];
  }
  const a2 = t.b * t.b + t.c * t.c - 2 * t.b * t.c * Math.cos((t.A * Math.PI) / 180);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Deux côtés et l'angle compris : loi des cosinus (Al-Kashi), "), latex("BC^2 = AC^2 + AB^2 - 2 \\cdot AC \\cdot AB \\cdot \\cos A"), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [latex(`BC^2 = ${nombreFrLatex(t.b)}^2 + ${nombreFrLatex(t.c)}^2 - 2 \\cdot ${nombreFrLatex(t.b)} \\cdot ${nombreFrLatex(t.c)} \\cdot \\cos ${v(instance, "A")} \\approx ${nombreFrLatex(Math.round(a2 * 100) / 100)} \\quad\\Rightarrow\\quad BC \\approx ${v(instance, "a")}`)],
    },
  ];
}

function lignesAire(instance: ExerciceTriangleQuelconque): EtapeCorrection[] {
  const { cote1, cote2, angleCompris } = DONNEES_FORMULE_AIRE[instance.configuration];
  const lignes: EtapeCorrection[] = [];
  if (instance.configuration === "loiSinus") {
    lignes.push({ label: "Calcul", sousQuestion: "b", fragments: [texte("Angle compris entre BC et AC : "), latex(`C = 180^\\circ - ${v(instance, "A")} - ${v(instance, "B")} = ${v(instance, "C")}`)] });
  }
  lignes.push(
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Aire = demi-produit de deux côtés par le sinus de l'angle compris : "), latex(`\\mathcal{A} = \\dfrac{1}{2} \\cdot ${SEGMENT[cote1]} \\cdot ${SEGMENT[cote2]} \\cdot \\sin ${angleCompris}`)] },
    {
      label: "Calcul",
      sousQuestion: "b",
      fragments: [latex(`\\mathcal{A} = \\dfrac{1}{2} \\cdot ${v(instance, cote1)} \\cdot ${v(instance, cote2)} \\cdot \\sin ${v(instance, angleCompris)} \\approx ${nombreFrLatex(Math.round(aireInstance(instance) * 100) / 100)}\\text{ ${instance.unite}}^2`)],
    },
  );
  return lignes;
}

function correctionDetaillee(instance: ExerciceTriangleQuelconque): EtapeCorrection[] {
  const piege: EtapeCorrection =
    instance.configuration === "loiSinus"
      ? { label: "Piège", sousQuestion: "a", fragments: [texte("Chaque côté va avec l'angle qui lui fait FACE : BC avec A, AC avec B.")] }
      : instance.configuration === "alKashi"
        ? { label: "Piège", sousQuestion: "a", fragments: [texte("Le côté opposé à A (BC) est celui qu'on retranche ; ne pas oublier l'arc cosinus pour passer de cos A à A.")] }
        : { label: "Piège", sousQuestion: "a", fragments: [texte("Ne pas oublier le terme "), latex("-2 \\cdot AC \\cdot AB \\cdot \\cos A"), texte(", ni la racine carrée à la fin ; calculatrice en degrés.")] };
  return [...lignesDonneeManquante(instance), piege, ...lignesAire(instance)];
}

function reponseBreve(instance: ExerciceTriangleQuelconque): FragmentConsigne[] {
  const lettre = instance.donneeManquante;
  const nom = lettre === "A" ? "A" : SEGMENT[lettre as "a" | "b" | "c"];
  return [texte("a) "), latex(`${nom} \\approx ${v(instance, lettre)}`), texte(" ; b) "), latex(`\\mathcal{A} \\approx ${nombreFrLatex(Math.round(aireInstance(instance) * 100) / 100)}\\text{ ${instance.unite}}^2`)];
}

function bareme(instance: ExerciceTriangleQuelconque): BaremeExercice {
  const loi = instance.configuration === "loiSinus" ? "Loi des sinus" : "Loi des cosinus (Al-Kashi)";
  return {
    reponseFinale: reponseBreve(instance),
    criteres: [
      { sousQuestion: "a", critere: [texte(`${loi} correctement appliquée (bons couples côté–angle)`)], points: 1 },
      { sousQuestion: "a", critere: [texte(`Résultat : ${valeurAffichageDonneeManquante(instance)}`)], points: 1 },
      { sousQuestion: "b", critere: [texte("Formule de l'aire avec deux côtés et l'angle compris")], points: 1 },
      { sousQuestion: "b", critere: [texte(`Résultat : ${formatAireAffichage(instance)}`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Calculatrice en radians")], cout: "−1 par résultat" },
      { description: [texte(instance.configuration === "loiSinus" ? "Côté associé au mauvais angle" : "Côté opposé mal identifié dans Al-Kashi")], cout: "0 pt sur le résultat de a)" },
      { description: [texte("Angle non compris entre les deux côtés dans la formule de l'aire")], cout: "0 pt sur le résultat de b)" },
      { description: [texte("Unité absente ou aire en unité de longueur")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("b) juste calculée à partir d'une valeur fausse de a) : points de méthode et de résultat de b) accordés (pas de double sanction)")]],
  };
}

/** ★★ loi des sinus ou Al-Kashi pour un côté ; ★★★ Al-Kashi pour un angle (arc cosinus). */
function difficulte(instance: ExerciceTriangleQuelconque): 1 | 2 | 3 {
  return instance.configuration === "alKashi" ? 3 : 2;
}

export const adaptateurEvaluationTriangleQuelconque: AdaptateurFeuilleExercices<ExerciceTriangleQuelconque> = avecVirgulesBelges({
  titreDocument: "Triangle quelconque — Évaluation",
  nomFichierBase: "triangle-quelconque",
  genererInstance: genererExerciceTriangleQuelconque,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as Parameters<typeof construireAvecVarianteId>[0]),
  construireEnonce: construireEnonceTriangleQuelconque,
  construireCorrection: construireCorrectionTriangleQuelconque,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
  profilInstance: profilCalculatrice,
  calculatriceIndispensable: true,
  // 2 questions par instance, consigne de (a) dépendante de l'instance, `enteteHtml` (croquis SVG) :
  // 3 raisons indépendantes déjà suffisantes chacune — voir le commentaire de tête.
});
