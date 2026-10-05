/**
 * Couche A — famille "aireEnclos" (variante `modelisation`, `promptimplementationgen55.md`,
 * spec section 3, famille A) : un enclos rectangulaire de périmètre (partiel ou total) fixé — un
 * côté est la variable x, l'autre y. Contrainte donnée à l'élève SOUS FORME NON ISOLÉE, écran
 * "isolement" ; Aire(x) développée à l'écran "construction".
 *
 * **3 modes de skin, choisis UNIFORMÉMENT parmi les 22 skins réunis** (`promptcorrectionskinsmanquantsAB.md`,
 * corrige l'audit `promptauditskinsmanquantsgen55.md` qui n'avait trouvé que 4 skins sur les 19
 * attendus) :
 * - **`cloture`** (15 skins — 4 d'origine + 11 nouveaux) : un lieu/objet rectangulaire délimité par
 *   un matériau de contour (clôture, ruban, grillage...), coefficient 1 (aire réelle x·y). **3
 *   configurations de contrainte** (spec, tirées uniformément PARMI CELLES AUTORISÉES par le skin —
 *   voir `typesApplicables` ci-dessous), pas un simple enrichissement de skins narratifs : chacune
 *   change la relation de contrainte ET la fonction dérivée, tout en réutilisant EXACTEMENT la même
 *   paramétrisation "cible d'abord" `L=4·quart` déjà en place (les 3 sommets restent entiers pour
 *   tout `quart` entier, vérifié par calcul direct puis par tirage massif dans `aireEnclos.test.ts`) :
 *   - `libre` — les 4 côtés sont clôturés : `2x+2y=L` → `Aire(x)=-x²+(L/2)x`, sommet `x_S=y_S=quart`
 *     (un carré, cas classique).
 *   - `mur` — un côté est adossé à un mur existant (3 côtés clôturés) : `2x+y=L` →
 *     `Aire(x)=-2x²+Lx`, sommet `x_S=quart`, `y_S=2·quart²`.
 *   - `deuxMurs` — deux côtés adjacents sont adossés à un angle de mur existant (2 côtés clôturés) :
 *     `x+y=L` → `Aire(x)=-x²+Lx`, sommet `x_S=2·quart`, `y_S=4·quart²`.
 *   2 skins (ruban cadeau, ourlet de voile) n'ont PAS d'équivalent "adossé à un mur" physiquement
 *   sensé — `typesApplicables: ["libre"]` restreint leur tirage à la seule configuration `libre`.
 * - **`direct`** (4 skins — abstrait, segment coupé, révision de 2 matières, budget publicitaire) :
 *   même mécanique EXACTE que `cloture`/`deuxMurs` (`x+y=S`, coefficient 1), mais SANS aucune
 *   image de clôture — la somme totale `S` est affirmée directement dans l'énoncé. Chaque skin
 *   porte sa propre grandeur/unité (jamais "l'aire"/"m²" générique) puisque la quantité optimisée
 *   n'est pas une aire réelle pour ces 4 skins (produit de 2 nombres, de longueurs, de temps, de
 *   budgets) — règle d'"efficacité" (produit des 2 parts) énoncée EXPLICITEMENT dans le texte pour
 *   révision/budget (jamais supposée connue de l'élève, spec section correction).
 * - **`triangleRectangle`** (3 skins — voile triangulaire, gousset métallique, équerre) : MÊME
 *   contrainte que `direct`/`deuxMurs` (`x+y=L`, les 2 côtés de l'angle droit), mais
 *   **coefficient ½ sur l'aire** (`Aire(x)=x(L-x)/2`, PAS 1 comme les 19 autres skins de cette
 *   famille) — géométrie réelle d'un triangle rectangle, jamais un rectangle. `a=-1/2`
 *   (fractionnaire) est documenté comme SECONDE exception à la propreté entière des coefficients
 *   intermédiaires de tout ce générateur (la première étant `sommeDeuxCarres.ts::construireMateriau`,
 *   `a=5/48`) — ne porte que sur `a`, jamais sur `sommet`/`domaine`/`optimal` eux-mêmes (`b=L/2`
 *   reste entier par construction, `L` toujours un multiple de 4).
 *
 * **Propreté entière garantie par construction** sur les 3 modes : `L` est toujours un multiple de 4
 * (`L=4·quart`), donc chaque sommet ci-dessus reste TOUJOURS entier — toute évaluation `Aire(x)` pour
 * `x` entier (bornes du domaine comprises) est donc automatiquement entière, sauf le coefficient `a`
 * du mode `triangleRectangle` (voir ci-dessus, documenté).
 *
 * **Domaine = la vraie plage de positivité physique, jamais une fenêtre resserrée autour du sommet**
 * (`promptcorrectiondomainereelABTV.md`, corrige `promptcorrectiondomainehardcodeB.md` — un domaine
 * artificiellement étroit avait été confondu avec la vraie contrainte physique `x>0`/`y>0`, rendant
 * fausse toute réponse élève dérivée honnêtement des inéquations de positivité) — voir
 * `domainePositivite` ci-dessous. Le sommet des 3 modes tombe donc TOUJOURS dans le domaine (produit
 * de 2 quantités complémentaires positives : le sommet est mathématiquement TOUJOURS au milieu de la
 * plage complète de positivité, jamais en dehors) — `sommetDansDomaine` est TOUJOURS `true` sur cette
 * famille, jamais un ratio 75/25 (ce ratio reste réservé aux familles `fonctionDonnee` C/E/G, dont le
 * domaine est narratif et indépendant de la fonction — non touchées par ce correctif).
 */
import type { ExerciceOptimisationModelisation } from "../../../core/optimisation.types";
import { optimumSurDomaine, sommetDansIntervalle } from "../optimum";
import { construireOptionsInterpretation, formatQuestionFinale } from "../interpretation";
import type { GenreGrandeur } from "../interpretation";
import { construireIdentificationXY } from "../identification";
import { randomInt } from "../aleatoire";

type TypeCloture = "libre" | "mur" | "deuxMurs";

const TOUS_TYPES_CLOTURE: TypeCloture[] = ["libre", "mur", "deuxMurs"];

const QUART_MIN = 10;
const QUART_MAX = 30;

/**
 * Domaine = la VRAIE plage de positivité physique (`x>0` ET `y=pente·x+ordonnee>0`), jamais une
 * fenêtre resserrée autour du sommet (`promptcorrectiondomainereelABTV.md`, corrige
 * `promptcorrectiondomainehardcodeB.md`) — `y>0 ⟺ x<-ordonnee/pente` (pente<0 ici), donc
 * `domaine=[0,-ordonnee/pente]`. Le sommet des 3 modes de cette famille (`libre`/`deuxMurs`/
 * `triangleRectangle` : x=y à l'optimum ; `mur` : optimum au 1/4 de -ordonnee/pente selon le même
 * calcul) tombe TOUJOURS strictement à l'intérieur de cette plage complète (produit de 2 quantités
 * complémentaires positives, mathématiquement impossible autrement) — `sommetDansDomaine` est donc
 * TOUJOURS `true` sur cette famille, jamais 75/25 (ce ratio reste réservé à C/E/G, dont le domaine
 * est narratif et indépendant de la fonction — voir `formeParabolique.ts`/`coutProduction.ts`/
 * `grandeurTemps.ts`, non touchés par ce correctif). `-ordonnee/pente` est toujours entier (`pente`/
 * `ordonnee` sont construits à partir de `L=4·quart`, toujours un multiple de 4 — voir
 * `construireContrainte`), donc `domaine.sup` reste entier par construction, sans marge aléatoire.
 */
function domainePositivite(pente: number, ordonnee: number): { inf: number; sup: number } {
  return { inf: 0, sup: -ordonnee / pente };
}

function capitaliser(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

function construireContrainte(type: TypeCloture, quart: number, L: number): {
  enonceLatex: string;
  pente: number;
  ordonnee: number;
  sommetX: number;
  sommetY: number;
} {
  switch (type) {
    case "libre":
      return { enonceLatex: `2x + 2y = ${L}`, pente: -1, ordonnee: L / 2, sommetX: quart, sommetY: quart * quart };
    case "mur":
      return { enonceLatex: `2x + y = ${L}`, pente: -2, ordonnee: L, sommetX: quart, sommetY: 2 * quart * quart };
    case "deuxMurs":
      return { enonceLatex: `x + y = ${L}`, pente: -1, ordonnee: L, sommetX: 2 * quart, sommetY: 4 * quart * quart };
  }
}

/**
 * Textes d'aide de l'écran "contrainte" pour le mode `cloture` (`promptreconstructiongen55.md`) —
 * le piège change de nature selon la configuration (facteur 2 du périmètre oublié pour `libre`,
 * côté du mur compté à tort pour `mur`/`deuxMurs`, voir la spec section 4) : jamais un seul texte
 * générique valable pour les 3 cas, mais toujours le MÊME quel que soit le skin narratif (le piège
 * ne dépend que de la géométrie, jamais du matériau/lieu).
 */
function construireTextesAideContrainteCloture(type: TypeCloture): { niveau1: string; niveau2: string } {
  switch (type) {
    case "libre":
      return {
        niveau1: "Rappel : le périmètre d'un rectangle vaut 2 × (longueur + largeur).",
        niveau2: "Il y a 2 longueurs et 2 largeurs à délimiter (4 côtés au total).",
      };
    case "mur":
      return {
        niveau1: "Rappel : seuls les côtés qui ne touchent pas le mur ont besoin de matériau.",
        niveau2: "Un seul côté de longueur (le mur remplace l'autre) et les 2 largeurs sont à délimiter (3 côtés au total).",
      };
    case "deuxMurs":
      return {
        niveau1: "Rappel : seuls les côtés qui ne touchent aucun des 2 murs ont besoin de matériau.",
        niveau2: "Une seule longueur et une seule largeur sont à délimiter (2 côtés au total, les murs remplacent les 2 autres).",
      };
  }
}

// ============================================================================
// Mode "cloture" — 15 skins (4 d'origine + 11 nouveaux), coefficient 1.
// ============================================================================

interface SkinCloture {
  nomLieu: string;
  nomVariable: string;
  nomMateriau: string;
  genreLieu: GenreGrandeur;
  typesApplicables: TypeCloture[];
}

const SKINS_CLOTURE: SkinCloture[] = [
  { nomLieu: "un poulailler", nomVariable: "la largeur du poulailler", nomMateriau: "clôture", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un jardin potager", nomVariable: "la largeur du jardin", nomMateriau: "clôture", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un enclos à chien", nomVariable: "la largeur de l'enclos", nomMateriau: "clôture", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un parc à moutons", nomVariable: "la largeur du parc", nomMateriau: "clôture", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un tableau", nomVariable: "la largeur du cadre", nomMateriau: "baguette de bois", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "une piscine", nomVariable: "la largeur du bassin", nomMateriau: "margelle carrelée", genreLieu: "feminin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "une baie vitrée", nomVariable: "la largeur de la baie vitrée", nomMateriau: "profilé métallique", genreLieu: "feminin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "une boucle d'antenne", nomVariable: "la largeur de la boucle", nomMateriau: "fil métallique", genreLieu: "feminin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un cadeau", nomVariable: "la largeur de l'emballage", nomMateriau: "ruban", genreLieu: "masculin", typesApplicables: ["libre"] },
  { nomLieu: "une voile", nomVariable: "la largeur de la voile", nomMateriau: "ourlet renforcé", genreLieu: "feminin", typesApplicables: ["libre"] },
  { nomLieu: "un parterre de fleurs", nomVariable: "la largeur du parterre", nomMateriau: "bordurette", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un court de tennis", nomVariable: "la largeur du court", nomMateriau: "grillage", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un tapis", nomVariable: "la largeur du tapis", nomMateriau: "bordure cousue", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un vitrail", nomVariable: "la largeur du vitrail", nomMateriau: "profilé de plomb", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
  { nomLieu: "un chantier", nomVariable: "la largeur du chantier", nomMateriau: "clôture de sécurité", genreLieu: "masculin", typesApplicables: TOUS_TYPES_CLOTURE },
];

function construirePhraseEnonceCloture(type: TypeCloture, skin: SkinCloture, L: number): string {
  const adosse = skin.genreLieu === "feminin" ? "adossée" : "adossé";
  switch (type) {
    case "libre":
      return `On dispose de ${L} m de ${skin.nomMateriau} pour délimiter ${skin.nomLieu} rectangulaire.`;
    case "mur":
      return `${capitaliser(skin.nomLieu)} rectangulaire est ${adosse} à un mur, et on dispose de ${L} m de ${skin.nomMateriau} pour les 3 autres côtés.`;
    case "deuxMurs":
      return `${capitaliser(skin.nomLieu)} rectangulaire est ${adosse} à 2 murs formant un angle droit, et on dispose de ${L} m de ${skin.nomMateriau} pour les 2 côtés restants.`;
  }
}

function construireDepuisSkinCloture(skin: SkinCloture): ExerciceOptimisationModelisation {
  const quart = randomInt(QUART_MIN, QUART_MAX);
  const L = 4 * quart;
  const type = skin.typesApplicables[randomInt(0, skin.typesApplicables.length - 1)];
  const { enonceLatex, pente, ordonnee, sommetX, sommetY } = construireContrainte(type, quart, L);
  const { niveau1: texteAideContrainteNiveau1, niveau2: texteAideContrainteNiveau2 } = construireTextesAideContrainteCloture(type);

  const fonction = { a: pente, b: ordonnee, c: 0 };
  const sommet = { x: sommetX, y: sommetY };

  const domaine = domainePositivite(pente, ordonnee);
  const sommetDansDomaine = sommetDansIntervalle(sommetX, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  // "Identifier x et y" (spec section 4, écran 1) — x/y ne sont JAMAIS nommés littéralement dans la
  // phrase d'énoncé du mode `cloture` (contrairement à `direct`/`triangleRectangle`, qui les citent
  // tels quels) : l'élève doit déduire quelle dimension du rectangle chacun désigne. `correctY` dérivé
  // de `nomVariable` (toujours "la largeur ..." pour ce mode, voir SKINS_CLOTURE) plutôt que stocké en
  // dur par skin — la relation largeur/longueur est structurellement identique sur les 15 skins.
  // Distracteurs : le périmètre total (donnée du problème, pas une dimension) et l'aire totale (la
  // grandeur FINALE à optimiser, jamais x ou y eux-mêmes) — les 2 pièges génériques de confusion
  // "dimension vs grandeur dérivée" valables sur tout ce mode.
  const identificationXY = construireIdentificationXY(
    skin.nomVariable,
    skin.nomVariable.replace("la largeur", "la longueur"),
    "le périmètre total disponible",
    "l'aire totale de la surface délimitée",
  );

  return {
    variante: "modelisation",
    famille: "aireEnclos",
    sens: "max",
    contexte: {
      phraseEnonce: construirePhraseEnonceCloture(type, skin, L),
      labelVariable: "x",
      nomVariable: skin.nomVariable,
      nomGrandeur: "l'aire",
      genreGrandeur: "feminin",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      questionFinale: formatQuestionFinale("max", "l'aire", "feminin"),
      // Croquis SVG (`prompt-implementation-3-diagrammes-svg.md`) — `type` porte déjà la vraie
      // configuration tirée (libre/mur/deuxMurs), mathématiquement indiscernable de `contrainte`/
      // `domaine` seuls pour libre vs deuxMurs (voir `core/optimisation.types.ts::ConfigurationCloture`).
      // Absent sur `direct`/`triangleRectangle` (pas de narration clôture/mur, voir leurs fonctions
      // dédiées ci-dessous).
      croquis: { type: "aireEnclosCloture", configuration: type },
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Écran "contrainteEtGrandeur", champ 2 (`prompt-restructuration-architecture-modelisation.md`)
    // — Aire = x·y, coefficient 1 sur les 15 skins de ce mode (voir en-tête de fichier).
    formuleGrandeurXYTexte: "x*y",
    contrainte: { enonceLatex, lettreCherchee: "y", pente, ordonnee },
    texteAideContrainteNiveau1,
    texteAideContrainteNiveau2,
    identificationXY,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "l'aire",
      genreGrandeur: "feminin",
      uniteGrandeur: "m²",
      uniteGrandeurFautive: "m",
      labelVariable: "x",
      uniteVariable: "m",
      optimal,
      // Piège supplémentaire propre à la famille A (spec section 4, écran 8) : les 3 configurations
      // de clôture partagent un cas d'égalité à l'optimum (x=y, "libre"/"deuxMurs" — un carré au
      // sens strict ; "mur" n'y donne PAS x=y par construction, mais le distracteur reste valide
      // comme piège de RAISONNEMENT causal, indépendant de la géométrie réelle de CETTE instance) —
      // attribue le résultat à une coïncidence de FORME plutôt qu'à sa vraie cause mathématique
      // (conséquence de la contrainte de somme fixée, jamais une propriété du carré en tant que tel).
      distracteursSupplementaires: ["L'aire est maximale parce que la forme obtenue est un carré."],
    }),
  };
}

// ============================================================================
// Mode "direct" — 4 skins (abstrait, segment coupé, révision, budget), coefficient 1, SANS image
// de clôture — la somme totale S est affirmée directement (même mécanique que "deuxMurs").
// ============================================================================

interface SkinDirect {
  phraseEnonce: (S: number) => string;
  nomVariable: string;
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteGrandeur: string;
  uniteVariable: string;
  uniteGrandeurFautive: string;
  texteAideContrainteNiveau1: string;
  texteAideContrainteNiveau2: string;
}

const SKINS_DIRECT: SkinDirect[] = [
  {
    phraseEnonce: (S) => `On cherche deux nombres réels positifs x et y dont la somme vaut ${S}. Détermine les valeurs de x et y qui rendent leur produit maximal.`,
    nomVariable: "le premier nombre",
    nomGrandeur: "le produit",
    genreGrandeur: "masculin",
    uniteGrandeur: "unités²",
    uniteVariable: "unités",
    uniteGrandeurFautive: "unités",
    texteAideContrainteNiveau1: "Rappel : si tu connais x, l'autre nombre y se déduit directement de leur somme totale.",
    texteAideContrainteNiveau2: "La somme de x et y vaut la constante donnée dans l'énoncé — pose l'équation correspondante.",
  },
  {
    phraseEnonce: (S) => `Un segment de longueur ${S} m est coupé en 2 parties, de longueurs x et y. Détermine les longueurs x et y qui rendent leur produit maximal.`,
    nomVariable: "la longueur de la première partie",
    nomGrandeur: "le produit des deux longueurs",
    genreGrandeur: "masculin",
    uniteGrandeur: "m²",
    uniteVariable: "m",
    uniteGrandeurFautive: "m",
    texteAideContrainteNiveau1: "Rappel : les deux parties proviennent de la coupe d'un même segment de longueur fixe.",
    texteAideContrainteNiveau2: "La somme des deux longueurs x et y est constante, égale à la longueur totale du segment.",
  },
  {
    phraseEnonce: (S) => `Un élève dispose de ${S} minutes pour réviser 2 matières, en consacrant x minutes à la première et y minutes à la seconde. L'efficacité totale de la révision est définie comme le produit du temps consacré à chaque matière. Détermine x et y qui rendent cette efficacité maximale.`,
    nomVariable: "le temps consacré à la première matière",
    nomGrandeur: "l'efficacité totale de la révision",
    genreGrandeur: "feminin",
    uniteGrandeur: "min²",
    uniteVariable: "min",
    uniteGrandeurFautive: "min",
    texteAideContrainteNiveau1: "Rappel : le temps total disponible est fixe — plus x augmente, plus y diminue d'autant.",
    texteAideContrainteNiveau2: "La somme des deux temps x et y est constante, égale au temps total disponible.",
  },
  {
    phraseEnonce: (S) => `Une entreprise répartit un budget publicitaire de ${S} € entre 2 canaux, x € pour le premier et y € pour le second. L'efficacité totale de la campagne est définie comme le produit des budgets alloués aux deux canaux. Détermine x et y qui rendent cette efficacité maximale.`,
    nomVariable: "le budget alloué au premier canal",
    nomGrandeur: "l'efficacité totale de la campagne",
    genreGrandeur: "feminin",
    uniteGrandeur: "€²",
    uniteVariable: "€",
    uniteGrandeurFautive: "€",
    texteAideContrainteNiveau1: "Rappel : le budget total disponible est fixe — plus x augmente, plus y diminue d'autant.",
    texteAideContrainteNiveau2: "La somme des deux budgets x et y est constante, égale au budget total disponible.",
  },
];

function construireDepuisSkinDirect(skin: SkinDirect): ExerciceOptimisationModelisation {
  const quart = randomInt(QUART_MIN, QUART_MAX);
  const S = 4 * quart;
  const { enonceLatex, pente, ordonnee, sommetX, sommetY } = construireContrainte("deuxMurs", quart, S);

  const fonction = { a: pente, b: ordonnee, c: 0 };
  const sommet = { x: sommetX, y: sommetY };

  const domaine = domainePositivite(pente, ordonnee);
  const sommetDansDomaine = sommetDansIntervalle(sommetX, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  return {
    variante: "modelisation",
    famille: "aireEnclos",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(S),
      labelVariable: "x",
      nomVariable: skin.nomVariable,
      nomGrandeur: skin.nomGrandeur,
      genreGrandeur: skin.genreGrandeur,
      uniteVariable: skin.uniteVariable,
      uniteGrandeur: skin.uniteGrandeur,
      questionFinale: formatQuestionFinale("max", skin.nomGrandeur, skin.genreGrandeur),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Écran "contrainteEtGrandeur", champ 2 — même mécanique que "cloture" (coefficient 1), la
    // grandeur cible reste x·y quel que soit le nom narratif (produit, aire, efficacité...).
    formuleGrandeurXYTexte: "x*y",
    contrainte: { enonceLatex, lettreCherchee: "y", pente, ordonnee },
    texteAideContrainteNiveau1: skin.texteAideContrainteNiveau1,
    texteAideContrainteNiveau2: skin.texteAideContrainteNiveau2,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: skin.nomGrandeur,
      genreGrandeur: skin.genreGrandeur,
      uniteGrandeur: skin.uniteGrandeur,
      uniteGrandeurFautive: skin.uniteGrandeurFautive,
      labelVariable: "x",
      uniteVariable: skin.uniteVariable,
      optimal,
    }),
  };
}

// ============================================================================
// Mode "triangleRectangle" — 3 skins (voile triangulaire, gousset métallique, équerre), MÊME
// contrainte x+y=L que "direct"/"deuxMurs", mais coefficient ½ sur l'aire (Aire(x)=x(L-x)/2) —
// SECONDE exception documentée à la propreté entière des coefficients intermédiaires de tout ce
// générateur (la première : `sommeDeuxCarres.ts::construireMateriau`, a=5/48).
// ============================================================================

interface SkinTriangleRectangle {
  phraseEnonce: (L: number) => string;
  nomVariable: string;
}

const SKINS_TRIANGLE_RECTANGLE: SkinTriangleRectangle[] = [
  {
    phraseEnonce: (L) => `La grand-voile triangulaire d'une planche à voile a la forme d'un triangle rectangle : ses 2 côtés de l'angle droit, x et y, ont une somme fixée à ${L} m (longueur totale de mât et de bôme disponible).`,
    nomVariable: "la longueur du premier côté de l'angle droit",
  },
  {
    phraseEnonce: (L) => `Un gousset métallique triangulaire, en forme de triangle rectangle, renforce un assemblage : ses 2 côtés de l'angle droit, x et y, ont une somme fixée à ${L} m (longueur totale de matériau disponible).`,
    nomVariable: "la longueur du premier côté de l'angle droit",
  },
  {
    phraseEnonce: (L) => `Une équerre de menuisier a la forme d'un triangle rectangle : ses 2 côtés de l'angle droit, x et y, ont une somme fixée à ${L} m (barre de métal utilisée pour la fabriquer).`,
    nomVariable: "la longueur du premier côté de l'angle droit",
  },
];

const TEXTE_AIDE_CONTRAINTE_TRIANGLE_RECTANGLE_NIVEAU1 = "Rappel : la somme des 2 côtés de l'angle droit est fixe — plus l'un est long, plus l'autre est court.";
const TEXTE_AIDE_CONTRAINTE_TRIANGLE_RECTANGLE_NIVEAU2 = "La somme des deux côtés x et y est constante, égale à la longueur totale disponible.";

function construireDepuisSkinTriangleRectangle(skin: SkinTriangleRectangle): ExerciceOptimisationModelisation {
  const quart = randomInt(QUART_MIN, QUART_MAX);
  const L = 4 * quart;
  const { enonceLatex, pente, ordonnee, sommetX } = construireContrainte("deuxMurs", quart, L);

  // Aire(x) = x·(L-x)/2 = -x²/2 + (L/2)x — coefficient ½, PAS le coefficient 1 des 19 autres skins
  // de cette famille (voir en-tête de fichier).
  const fonction = { a: pente / 2, b: ordonnee / 2, c: 0 };
  const sommetY = (sommetX * (L - sommetX)) / 2;
  const sommet = { x: sommetX, y: sommetY };

  const domaine = domainePositivite(pente, ordonnee);
  const sommetDansDomaine = sommetDansIntervalle(sommetX, domaine);
  const optimal = optimumSurDomaine(fonction, domaine, sommet, sommetDansDomaine);

  return {
    variante: "modelisation",
    famille: "aireEnclos",
    sens: "max",
    contexte: {
      phraseEnonce: skin.phraseEnonce(L),
      labelVariable: "x",
      nomVariable: skin.nomVariable,
      nomGrandeur: "l'aire du triangle rectangle",
      genreGrandeur: "feminin",
      uniteVariable: "m",
      uniteGrandeur: "m²",
      questionFinale: formatQuestionFinale("max", "l'aire du triangle rectangle", "feminin"),
    },
    fonction,
    domaine,
    sommet,
    sommetDansDomaine,
    optimal,
    // Aire = x·(isolé)/2 — le gabarit générique de l'aide partagée `texteAideConstructionNiveau2`
    // (`ui/formatOptimisation.ts`) suppose "labelVariable · (isolé)" SANS le facteur ½, faux ici :
    // fourni explicitement.
    formuleSubstitueeTexte: `(x · (${L}-x)) / 2`,
    // Écran "contrainteEtGrandeur", champ 2 — coefficient ½ (géométrie réelle d'un triangle
    // rectangle, PAS 1 comme les 19 autres skins de cette famille — voir en-tête de fichier).
    formuleGrandeurXYTexte: "x*y/2",
    contrainte: { enonceLatex, lettreCherchee: "y", pente, ordonnee },
    texteAideContrainteNiveau1: TEXTE_AIDE_CONTRAINTE_TRIANGLE_RECTANGLE_NIVEAU1,
    texteAideContrainteNiveau2: TEXTE_AIDE_CONTRAINTE_TRIANGLE_RECTANGLE_NIVEAU2,
    optionsInterpretation: construireOptionsInterpretation({
      sens: "max",
      nomGrandeur: "l'aire du triangle rectangle",
      genreGrandeur: "feminin",
      uniteGrandeur: "m²",
      uniteGrandeurFautive: "m",
      labelVariable: "x",
      uniteVariable: "m",
      optimal,
    }),
  };
}

// ============================================================================
// Sélection — uniforme parmi les 22 skins réunis (15+4+3), jamais uniforme par MODE (sinon les 15
// skins "cloture" seraient sur-représentés/sous-représentés par rapport aux 2 autres modes selon
// leur nombre relatif — voir `generateurs/optimisation/index.ts`, même principe documenté pour le
// choix variante/famille au niveau du générateur "brut").
// ============================================================================

const TOUS_SKINS: (() => ExerciceOptimisationModelisation)[] = [
  ...SKINS_CLOTURE.map((skin) => () => construireDepuisSkinCloture(skin)),
  ...SKINS_DIRECT.map((skin) => () => construireDepuisSkinDirect(skin)),
  ...SKINS_TRIANGLE_RECTANGLE.map((skin) => () => construireDepuisSkinTriangleRectangle(skin)),
];

export function construireAireEnclos(): ExerciceOptimisationModelisation {
  return TOUS_SKINS[randomInt(0, TOUS_SKINS.length - 1)]();
}
