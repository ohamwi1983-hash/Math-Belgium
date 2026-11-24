import { Document, type FileChild, HeadingLevel, PageBreak, Packer, Paragraph, TextRun } from "docx";
import { fragmentsVersRunsDocx } from "./fragmentsDocx";
import { construireTableauRempli, construireTableauVide } from "./tableauxDocx";

/**
 * Contrat texte+LaTeX partagé par tout le pipeline d'export (ce fichier, `fragmentsDocx.ts`,
 * `genererFeuilleExercicesHtml.ts`, `genererFeuilleExercicesPdf.ts`) — défini ICI plutôt
 * qu'importé depuis un `ui/formatEquationDroite.ts` particulier : ce module est partagé par les 3
 * chantiers (4e/5e-4h/6e-6h, voir `src/entrainement/export/`), alors que `ui/formatEquationDroite.ts`
 * est dupliqué un par chantier (structurellement identique partout, jamais un seul fichier commun,
 * convention déjà en place avant ce chantier) — dépendre de l'un d'eux en particulier créerait un
 * couplage arbitraire. Chaque `ui/formatEquationDroite.ts` de chantier garde sa propre déclaration
 * locale, structurellement identique à celle-ci, intentionnellement laissée telle quelle.
 */
export type FragmentConsigne = { type: 'texte'; valeur: string } | { type: 'latex'; valeur: string }

/**
 * Mécanisme générique d'export "feuille d'exercices Word" — pilote sur gen7 (Analyse d'une
 * fonction du second degré), conçu dès le départ pour être réutilisé par n'importe quel autre
 * générateur du projet (voir `promptexportwordpilotegen7.md`). Ce module ne connaît RIEN de
 * gen7 : toute la connaissance spécifique à un générateur passe par un `AdaptateurFeuilleExercices<T>`
 * — deux fonctions pures qui transforment une instance `T` (déjà tirée par le générateur existant
 * du projet, ex. `genererExerciceAnalyseFonction`) en questions vierges et en corrections
 * rédigées, sous forme de `FragmentConsigne[]` (le même contrat texte+LaTeX déjà utilisé côté
 * écran par `RenduFragments.tsx`, `ui/formatEquationDroite.ts`). Brancher un nouveau générateur
 * revient donc à écrire un seul fichier `exportWord.ts` dans son dossier `generateurs/xxx/` (voir
 * `generateurs/analyseFonction/exportWord.ts` pour l'exemple de référence), jamais à toucher ce
 * fichier.
 *
 * Pourquoi produire N instances complètement indépendantes plutôt que rejouer une session élève
 * réelle : le générateur de gen7 (et la plupart des générateurs du projet) est une fonction pure
 * sans état, tirée au hasard (`Math.random()`, jamais de graine) — appeler cette même fonction N
 * fois donne directement N exercices différents, sans avoir besoin de simuler des tentatives/une
 * progression. La correction n'est donc jamais une transcription d'une session interactive : elle
 * est resynthétisée depuis les valeurs déjà connues et correctes de l'instance tirée (voir le
 * commentaire de tête de `generateurs/analyseFonction/exportWord.ts` pour le détail de cette
 * décision — les aides progressives de gen7 sont purement visuelles, sans texte à concaténer).
 */

export type ZoneReponse = { type: "lignes"; nombre?: number } | { type: "tableau"; libellesLignes: string[]; nombreColonnes: number };

export interface QuestionExercice {
  consigne: FragmentConsigne[];
  reponse?: ZoneReponse;
}

export interface SectionExercice {
  /** Affiché une fois en tête de l'exercice, avant les questions a) b) c)… (ex. "f(x) = …"). */
  enteteFragments?: FragmentConsigne[];
  /** Contenu HTML brut affiché après `enteteFragments` — réservé aux contenus non représentables en
   * `FragmentConsigne` (ex. graphiques SVG, `export/svgGraphCyclo.ts`). Seul le pipeline HTML de
   * l'évaluation (`export/assemblerEvaluationHtml.ts`) le rend ; ignoré par les pipelines Word/PDF,
   * qui ne connaissent que `enteteFragments`. */
  enteteHtml?: string;
  questions: QuestionExercice[];
  /** `true` : `questions` sont les LIGNES d'un regroupement a), b), c)
   * (`AdaptateurFeuilleExercices.regroupement`) — rendues en lignes alignées (lettre | données |
   * points dans la colonne de droite) sous la consigne commune (`enteteFragments`). */
  disposeEnTableau?: boolean;
}

export type BlocCorrection =
  | { type: "paragraphe"; fragments: FragmentConsigne[]; bloc?: boolean }
  | { type: "tableau"; libellesLignes: string[]; valeursParLigne: string[][] }
  /** Contenu HTML brut (ex. graphiques SVG, `export/svgGraphCyclo.ts`) — même réserve que
   * `SectionExercice.enteteHtml` : seul le pipeline HTML de l'évaluation le rend, ignoré en docx
   * (`construireBlocCorrection` ci-dessous). */
  | { type: "html"; html: string };

export interface CatalogueVarianteEntree {
  id: string;
  label: string;
  /** Variante RETIRÉE : jamais proposée (panneau, sélecteur), gardée à sa place pour que l'indice
   * des variantes suivantes — donc leurs `?code=` déjà imprimés — ne change pas (6gen6, famille G). */
  retiree?: boolean;
}

/** Groupe de variantes « à verdict » (voir `AdaptateurFeuilleExercices.groupesVerdict`). `id` ne doit
 * être l'id d'aucune variante du catalogue ; `variantes` : ids du catalogue (au moins deux). */
export interface GroupeVerdict {
  id: string;
  label: string;
  variantes: string[];
  /** Les membres partagent la même `forme` de profil (structure visible : 5gen24) : la série B
   * reproduit alors la forme de la série A même quand le verdict tiré change de variante. Absent :
   * la forme, propre à la variante, n'est imposée qu'à la même variante (comportement d'avant). */
  formeCommune?: boolean;
}

/** Une ligne d'une chaîne de calcul « comme au tableau » (`EtapeCorrection.calcul`) : UNE
 * transformation, en LaTeX. Le rendu aligne les lignes sur leur premier signe de relation de niveau 0
 * (« = », « \approx », « < »…) : une ligne qui COMMENCE par « = » continue la ligne précédente (son
 * « = » tombe sous le « = » du dessus). `justification` : la règle utilisée, affichée à droite en
 * petit italique (« on distribue », « car i² = −1 »). Jamais deux égalités séparées par « ; » dans une
 * même ligne. */
export interface LigneCalcul {
  latex: string;
  justification?: string | FragmentConsigne[];
}

/** Rôle d'une ligne du corrigé « comme au tableau » (voir `.claude/rules/feuilles-evaluations.md`,
 * « Corrigé détaillé — comme au tableau ») : ce qu'on utilise → calcul → résultat (encadré) →
 * vérification → piège. Absent = ligne historique (rendue comme avant). */
export type TypeLigneCorrection = "utilise" | "calcul" | "resultat" | "verification" | "piege";

/** Une étape du corrigé détaillé (rédaction modèle) — `label` court affiché dans la marge
 * (« Condition », « Méthode », « Calcul », « Vérification », « Conclusion »…), `sousQuestion` (« a »,
 * « b »…) quand l'étape répond à une sous-question précise de l'énoncé. */
export interface EtapeCorrection {
  label: string;
  fragments: FragmentConsigne[];
  sousQuestion?: string;
  /** Rôle de la ligne (corrigé « comme au tableau ») : `resultat` est encadré, `piege` va dans
   * l'encadré « Piège » de son étape. Optionnel (rétrocompatible). Constructeurs :
   * `export/corrigeTableau.ts`. */
  type?: TypeLigneCorrection;
  /** Chaîne de calcul alignée sur « = », affichée sous `fragments` (texte d'introduction, peut être
   * vide). */
  calcul?: LigneCalcul[];
  /** Figure SVG (chaîne autonome) affichée sous le texte de la ligne — ex. polygone des effectifs
   * cumulés avec la lecture des quartiles. Rendue par le pipeline HTML uniquement. */
  figureHtml?: string;
  /** Numéro (1, 2…) de l'étape du raisonnement à laquelle se rattache cette ligne, quand l'énoncé
   * papier n'a pas de sous-questions (`AdaptateurFeuilleExercices.enoncePapier`) — posé par le
   * pipeline, jamais par l'adaptateur. */
  etape?: number;
}

/** Un critère du barème — `points` est un POIDS : le rendu le ramène au total de points choisi
 * par le professeur pour la question (proportionnellement, arrondi au demi-point). Écrire des poids
 * dont la somme vaut 4 (total par défaut d'un exercice) quand c'est naturel. */
export interface CritereBareme {
  sousQuestion?: string;
  /** Voir `EtapeCorrection.etape`. */
  etape?: number;
  critere: FragmentConsigne[];
  points: number;
}

export interface ErreurFrequente {
  description: FragmentConsigne[];
  /** Coût indicatif, en texte libre (« −2 », « 0 pt sur a) »…). */
  cout?: string;
}

/** Grille de correction d'une instance (document professeur de l'évaluation). */
export interface BaremeExercice {
  /** Réponse finale, affichée en tête de la question pour corriger vite. */
  reponseFinale: FragmentConsigne[];
  criteres: CritereBareme[];
  erreursFrequentes?: ErreurFrequente[];
  /** Autres écritures à accepter (forme non simplifiée, valeur approchée…). */
  reponsesAcceptees?: FragmentConsigne[][];
}

/** Énoncé PAPIER d'un exercice (feuille d'exercices, évaluation) : l'énoncé et la consigne globale
 * seulement. Les sous-questions de `construireEnonce` (une par écran du générateur) sont des étapes
 * d'APPRENTISSAGE, propres au générateur interactif : sur papier, elles passent dans le corrigé
 * (« Étape n — consigne », suivie de sa résolution), pas dans l'énoncé. Un problème peut garder de
 * VRAIES questions distinctes (`section.questions`, a) b) c)…), chacune couvrant une ou plusieurs
 * étapes. La version aménagée imprime ce MÊME énoncé (seule la mise en page change). */
export interface ProfilInstance {
  /** `null` = instance complète ; sinon identifiant court du cas particulier (« sans-dephasage »,
   * « aucune-solution »…), le même pour toutes les séries d'une même question. */
  casParticulier: string | null;
  /** `'exacte'` : se fait sans calculatrice (la calculatrice de l'année donnerait la réponse) ;
   * `'calculatrice'` : la demande ; `'calculatriceDirecte'` : la demande ET elle donne directement la
   * réponse (gen34 « valeurs », σ non entier : « 1-Var Stats » affiche σ, mais à la main il faudrait
   * √ au centième) — tirée ni « calculatrice interdite » ni « autorisée » (revue des profils,
   * 24/11/2026). Absent : sans objet, tirée dans les deux cas. */
  calcul?: "exacte" | "calculatrice" | "calculatriceDirecte";
  /** Type de question quand il est tiré au hasard dans une variante (ex. gen38 : centrage,
   * dispersion, interprétation) : imposé IDENTIQUE d'une série à l'autre, question par question. */
  forme?: string;
  /** Paramètres au choix (`parametresAuChoix`) sans objet pour cette instance (ex. racines
   * irrationnelles en mise en évidence généralisée) : ignorés par la contrainte des cases. */
  parametresNonApplicables?: string[];
}

/** Critères de difficulté d'une instance (grille commune, `export/niveauDifficulte.ts`). Le module
 * commun y ajoute la CHARGE des étapes longues (lignes de calcul du corrigé détaillé) et, si
 * `nombres` est absent, détecte les nombres sur le corrigé. `etapesTransformation` /
 * `etapesLecture` : lus sur le corrigé (`etapesDuCorrige`), pour rester la même source que le papier. */
export interface CriteresDifficulte {
  /** Étapes (écrans) qui transforment : calcul, raisonnement. */
  etapesTransformation: number;
  /** Écrans de pure lecture (lire une valeur, un point, une caractéristique ; placer un point). */
  etapesLecture: number;
  /** 0 imposée/évidente ; 1 choisir parmi les méthodes du cours ; 2 l'élève construit le modèle
   * (au plus 1 si l'énoncé donne la formule du contexte ou la fonction). */
  methode: 0 | 1 | 2;
  /** 1 seulement si le piège est dans les DONNÉES (signe, valeur exclue, ordre, cas qui n'en est
   * pas un, solution à rejeter) — jamais parce que le corrigé a une ligne « Piège ». */
  piege: 0 | 1;
  /** Calculatrice, valeur approchée, ln/e/π non remarquables → 1. Absent : détecté sur le corrigé. */
  nombres?: 0 | 1;
  /** Détection des nombres : un angle kπ/n non remarquable compte (chapitre des complexes). */
  anglesEnPi?: boolean;
  /** Lettres d'étapes dont la longueur n'ajoute pas de charge (écrans de lecture). */
  lettresSansCharge?: string[];
  /** Aucune charge (étapes déjà comptées autrement, ex. gen72 : une transformation = une étape). */
  sansCharge?: boolean;
  /** Corrigé pas encore « comme au tableau » (une ligne « Calcul » résume plusieurs transformations) :
   * lignes de calcul qu'aurait l'étape au tableau, par lettre. La charge prend le maximum du mesuré
   * et de cette valeur (ex. 6gen21, étude complète découpée en six écrans). */
  lignesMinimales?: Record<string, number>;
}

export interface EnoncePapier {
  section: SectionExercice;
  /** Pour chaque question de `section.questions`, les lettres (« a », « b »…) des étapes de
   * `construireEnonce` qu'elle couvre — les mêmes lettres que `sousQuestion` dans
   * `correctionDetaillee` et `bareme`. Requis dès que `section.questions` n'est pas vide. */
  etapesParQuestion?: string[][];
  /** Réponse brève alignée sur l'énoncé papier, quand celle de `reponseBreve` est découpée par
   * étape (« a) … ; b) … »). */
  reponseBreve?: FragmentConsigne[];
}

/** Précision qui ne vaut que pour certaines instances (« Donne le rayon en valeur exacte. ») : dite UNE
 * fois en tête du groupe (union des précisions des lignes, ordre de première apparition), au pluriel
 * quand il est fourni (« Donne les rayons en valeur exacte. »). */
export interface PrecisionRegroupement {
  id: string;
  fragments: FragmentConsigne[];
  pluriel?: FragmentConsigne[];
}

/** Une instance vue comme une LIGNE d'un regroupement a), b), c) (`AdaptateurFeuilleExercices.regroupement`). */
export interface RegroupementInstance {
  /** Consigne commune, forme « chaque », sans les données ni les précisions fusionnables — clé du
   * groupe (deux consignes différentes → deux groupes). */
  consigne: FragmentConsigne[];
  precisions?: PrecisionRegroupement[];
  /** Les données de l'instance : l'équation, « f(x) = … », « cercle d'équation … »… Vide pour un
   * générateur à graphique dont la donnée tient tout entière dans la figure (gen10 : la courbe). */
  ligne: FragmentConsigne[];
  /** Figure propre à la ligne (générateurs à graphique : l'`enteteHtml` de l'énoncé papier, recopié
   * tel quel) — graphiques côte à côte, deux par rangée quand ils sont assez petits. */
  figureHtml?: string;
  /** Écriture quand TOUTES les lignes du groupe ont la même figure (gen27 : même hexagone) : la
   * figure est alors imprimée une seule fois sous la consigne, et la consigne / la ligne ne
   * décrivent plus la figure à chaque ligne. À défaut, `consigne` et `ligne` servent telles quelles. */
  figureCommune?: { consigne: FragmentConsigne[]; ligne: FragmentConsigne[] };
}

export interface AdaptateurFeuilleExercices<T> {
  titreDocument: string;
  /** Utilisé pour composer le nom du fichier téléchargé (voir telechargerBlob.ts), sans extension. */
  nomFichierBase: string;
  genererInstance: () => T;
  /** Catalogue des familles/variantes forçables — même convention que `SelecteurVarianteDev` (voir
   * CLAUDE.md, "Catalogue de variantes"), réutilisée ici pour un contrôle fin depuis le panneau
   * /admin de Math-Belgium (ex. « 3 exercices de la famille X, 2 de la famille Y » plutôt qu'un
   * total tiré au hasard). Optionnels : seuls les adaptateurs qui exposent déjà ce catalogue les
   * renseignent, sans jamais casser le contrat zéro-argument de `genererInstance`. */
  catalogueVariantes?: CatalogueVarianteEntree[];
  genererInstanceAvecVariante?: (varianteId: string) => T;
  construireEnonce: (instance: T) => SectionExercice;
  construireCorrection: (instance: T) => BlocCorrection[];
  /** Critères du NIVEAU de difficulté 1–7 et de la durée de l'instance (grille commune,
   * `export/niveauDifficulte.ts::niveauEtDuree` — voir `CriteresDifficulte`). Remplace `difficulte`
   * et `dureeMinutes` pour un chapitre noté. */
  criteresDifficulte?: (instance: T) => CriteresDifficulte;
  /** ANCIENNES étoiles (1 = application directe, 2 = plusieurs étapes, 3 = réflexion) : seulement
   * pour un chapitre pas encore noté — affichées par conversion PROVISOIRE (★ → niveau 2, ★★ → 3,
   * ★★★ → 5). Ignoré dès que `criteresDifficulte` est présent. */
  difficulte?: (instance: T) => 1 | 2 | 3;
  /** Résultat seul, sans démarche (page « Je vérifie » de la feuille d'exercices). */
  reponseBreve?: (instance: T) => FragmentConsigne[];
  /** Corrigé détaillé étape par étape ; à défaut, `construireCorrection` est utilisé. */
  correctionDetaillee?: (instance: T) => EtapeCorrection[];
  /** Barème détaillé (grille de correction de l'évaluation, points par sous-question). */
  bareme?: (instance: T) => BaremeExercice;
  /** Énoncé papier sans les étapes d'apprentissage (voir `EnoncePapier`) ; à défaut, les
   * sous-questions de `construireEnonce` sont imprimées telles quelles. */
  enoncePapier?: (instance: T) => EnoncePapier;
  /** Durée indicative CONSTANTE d'une instance, en minutes — seulement pour un chapitre pas encore
   * noté : avec `criteresDifficulte`, la durée est calculée par exercice. */
  dureeMinutes?: number;
  /** Profil structurel d'une instance, pour le TIRAGE ÉQUILIBRÉ des évaluations (décision de
   * l'utilisateur, `lib/evaluationLocal.ts::graineInedite`) : par défaut seules les instances
   * COMPLÈTES sortent (`casParticulier === null` : tous les paramètres présents, toutes les étapes à
   * faire) ; un cas particulier (sans déphasage, aucune solution, k = 0 ou ±1…) ne sort que si le
   * professeur coche « inclure un cas particulier » pour la ligne. `calcul` : `'exacte'` = valeurs
   * remarquables, faisable sans calculatrice ; `'calculatrice'` = exige la calculatrice ; absent =
   * sans objet. Calculatrice interdite → jamais `'calculatrice'` ; autorisée → jamais `'exacte'`.
   * Les générateurs d'apprentissage (écran) ne sont PAS concernés : ils gardent toute leur variété. */
  profilInstance?: (instance: T) => ProfilInstance;
  /** Libellé de la case du panneau, ex. « Inclure un cas particulier (sans déphasage ou sans
   * décalage vertical) ». Requis dès que `profilInstance` peut renvoyer un cas particulier. */
  libelleCasParticulier?: string;
  /** Paramètres que le PROFESSEUR choisit d'inclure (cases du panneau, toutes cochées par défaut),
   * ex. amplitude ≠ 1, décalage vertical, déphasage, pulsation ≠ 1. `id` = identifiant que
   * `profilInstance` met dans `casParticulier` quand ce paramètre est ABSENT (neutre) ; une case
   * décochée impose son absence dans toutes les instances de la ligne et toutes les séries. Remplace
   * la case « inclure un cas particulier » pour ce générateur. */
  parametresAuChoix?: { id: string; label: string }[];
  /** `true` : TOUTES les instances exigent une calculatrice (aires dans le cercle, modélisation en
   * contexte…) ; liste d'ids de variantes : seulement CES variantes (5gen23 : club, population) — la
   * page de conception avertit le professeur s'il choisit « calculatrice interdite ». */
  calculatriceIndispensable?: boolean | string[];
  /** Variantes « à verdict » regroupées dans le PANNEAU D'ÉVALUATION seulement (décision de
   * l'utilisateur, audit 4e ch. 2) : quand le nom de la variante dit la réponse (« Δ < 0 », « racine
   * étrangère », « mise en évidence »), choisir la variante, c'est donner le verdict. Le panneau
   * d'évaluation montre alors UNE rangée par groupe (clé = `id` du groupe) ; `construirePlan` tire pour
   * chaque question une variante membre en distribuant un paquet mélangé des membres d'une série à
   * l'autre (série A q1…qn, puis B…) : verdicts équilibrés et différents d'une série à l'autre. Le
   * plan, le QR `?code=` et le corrigé portent la variante réelle tirée. La feuille d'exercices et le
   * `SelecteurVarianteDev` du générateur gardent les variantes séparées. Un verdict n'est jamais mis
   * dans `ProfilInstance.forme`. Voir `export/groupesVerdict.ts`. */
  groupesVerdict?: GroupeVerdict[];
  /** Regroupement a), b), c) sur papier (décision de l'utilisateur : « pour des économies de place et
   * une certaine cohérence ») : les instances d'un MÊME générateur, de la même ligne de sélection, qui
   * ont la même consigne générale forment UNE question — « Résous chaque équation par la méthode la
   * plus rapide. a) … b) … c) … » — dans la feuille d'exercices, la remédiation, l'évaluation et
   * l'examen (copie, aménagée, corrigé, grille, Word, « Je vérifie »). Rend la consigne commune (forme
   * « chaque », SANS les données), les précisions qui ne valent que pour certaines instances et la
   * LIGNE propre à l'instance (ses données) ; `null` = instance jamais regroupée (énoncé inattendu).
   * Toujours tiré de l'énoncé PAPIER réel, jamais d'une seconde source : le registre le remplit avec
   * `export/regroupementsPapier.ts::avecRegroupement` (découpe de l'énoncé papier selon la table
   * `REGROUPEMENTS`). Jamais pour un énoncé à vraies questions a) b) c) (le pipeline l'écarte de toute
   * façon). Une seule instance → exercice ordinaire, rendu inchangé. Pipeline :
   * `lib/evaluationLocal.ts::questionsDeSerie` (numérotation) et `itemGroupe` (item regroupé). */
  regroupement?: (instance: T) => RegroupementInstance | null;
  /** Titre PROPRE à l'instance sur papier, à la place de celui de la section du cours où le
   * générateur est rangé (décision de l'utilisateur, 4e ch. 6 : la variante « lecture » de gen83 ne
   * s'imprime plus sous « Additionner deux vecteurs »). `null` / absent = titre de la section, rien
   * ne change. Voir `TitrePapier` ; appliqué par `lib/evaluationLocal.ts::itemExercice`. */
  titrePapier?: (instance: T) => TitrePapier | null;
}

/** Surcharge du titre d'une instance : remplace le titre de section imprimé (`titreSection`), la
 * notion (corrigé « Question n — … », étiquette de la feuille, grille, Word) et, si `sectionId` est
 * donné et existe dans le chapitre de l'item, la section du cours à relire (« Je fais le point »).
 * Un titre différent coupe un regroupement a), b), c) (clé de groupe). */
export interface TitrePapier {
  titre: string;
  /** Identifiant d'une section du MÊME chapitre (`ChapterSection.id`, stable même si la numérotation
   * change) ; absent ou introuvable : pas de section numérotée, le titre seul. */
  sectionId?: string;
}

export interface ProgressionGeneration {
  etape: "exercices" | "corrections";
  indexCourant: number;
  total: number;
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Espace de réponse vierge — une ligne de texte vide, jamais une barre horizontale/soulignée : sur
 * une copie manuscrite, l'élève écrit librement dans l'espace laissé plutôt que de contraindre sa
 * réponse à la largeur d'une ligne tracée. */
function ligneReponseVide(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: " " })],
    spacing: { before: 80, after: 80 },
  });
}

async function construireZoneReponse(reponse: ZoneReponse | undefined): Promise<FileChild[]> {
  if (!reponse || reponse.type === "lignes") {
    const nombre = reponse?.nombre ?? 1;
    return Array.from({ length: nombre }, () => ligneReponseVide());
  }
  return [construireTableauVide(reponse.libellesLignes, reponse.nombreColonnes)];
}

async function construireBlocCorrection(bloc: BlocCorrection): Promise<FileChild[]> {
  if (bloc.type === "tableau") {
    return [construireTableauRempli(bloc.libellesLignes, bloc.valeursParLigne)];
  }
  if (bloc.type === "html") {
    // Non représentable en docx (ex. graphique SVG) — réservé au pipeline HTML de l'évaluation.
    return [];
  }
  const runs = await fragmentsVersRunsDocx(bloc.fragments, { bloc: bloc.bloc });
  return [new Paragraph({ children: runs, spacing: { before: 100, after: 100 } })];
}

export async function genererFeuilleExercicesDocx<T>(
  adaptateur: AdaptateurFeuilleExercices<T>,
  nombreExercices: number,
  onProgression?: (progression: ProgressionGeneration) => void,
): Promise<Blob> {
  const instances: T[] = Array.from({ length: nombreExercices }, () => adaptateur.genererInstance());

  const enfants: FileChild[] = [new Paragraph({ text: adaptateur.titreDocument, heading: HeadingLevel.TITLE })];

  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "exercices", indexCourant: i + 1, total: instances.length });
    const section = adaptateur.construireEnonce(instances[i]);

    enfants.push(new Paragraph({ text: `Exercice ${i + 1}`, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }));

    if (section.enteteFragments) {
      enfants.push(new Paragraph({ children: await fragmentsVersRunsDocx(section.enteteFragments, { bloc: true }), spacing: { after: 200 } }));
    }

    for (let q = 0; q < section.questions.length; q++) {
      const question = section.questions[q];
      const lettre = LETTRES[q] ?? String(q + 1);
      const runsConsigne = await fragmentsVersRunsDocx(question.consigne);
      enfants.push(new Paragraph({ children: [new TextRun({ text: `${lettre}) `, bold: true }), ...runsConsigne], spacing: { before: 160 } }));
      enfants.push(...(await construireZoneReponse(question.reponse)));
    }

    if (i < instances.length - 1) enfants.push(new Paragraph({ children: [new PageBreak()] }));
  }

  enfants.push(new Paragraph({ children: [new PageBreak()] }));
  enfants.push(new Paragraph({ text: "Corrections", heading: HeadingLevel.TITLE }));

  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "corrections", indexCourant: i + 1, total: instances.length });
    enfants.push(new Paragraph({ text: `Correction — Exercice ${i + 1}`, heading: HeadingLevel.HEADING_1, spacing: { before: 300 } }));
    const blocs = adaptateur.construireCorrection(instances[i]);
    for (const bloc of blocs) {
      enfants.push(...(await construireBlocCorrection(bloc)));
    }
    if (i < instances.length - 1) enfants.push(new Paragraph({ children: [new PageBreak()] }));
  }

  const document = new Document({ sections: [{ children: enfants }] });
  return Packer.toBlob(document);
}
