import type { BaremeExercice, BlocCorrection, EtapeCorrection, FragmentConsigne, LigneCalcul, SectionExercice } from "./genererFeuilleExercices";
import { decouperLigneCalcul, estLignePiege } from "./corrigeTableau";
import { LIBELLE_PALIER, type Palier } from "./niveauDifficulte";
import { blocCorrectionHtml, echapperHtml, fragmentsEnteteHtml, fragmentsVersHtml, grillesLisiblesAImpression } from "./genererFeuilleExercicesHtml";
import { obtenirCssKatexAutonome } from "./katexImage";
import { qrCodeSvg } from "./qrSvg";
import { etiquetteQuestion, examenDeSession, fragmentsConsigne, lignePartie, partiesExamen, NOM_PROCESSUS_EXAMEN, type ChapitreExamen, type OrganisationExamen, type PartieExamen, type QuestionOrdonnable } from "./examen";

/**
 * Assembleur HTML des documents imprimables générés depuis Math-Belgium — feuille d'exercices
 * (page publique `/{niveau}/{chapitre}/exercices`, mode `exercice`) et évaluation (`/admin`, mode
 * `evaluation`). Une liste HÉTÉROGÈNE d'items déjà construits (exercice généré, question ouverte,
 * vrai/faux — voir `evaluationLocal.ts`) devient des documents HTML A4 autonomes (CSS KaTeX inliné
 * en `data:` URI, voir `genererFeuilleExercicesHtml.ts`).
 *
 * Refonte (maquette validée par l'utilisateur) :
 * - feuille d'exercices = UN document : énoncé (étoiles de difficulté, notion · processus, QR code
 *   et code pour refaire le même exercice en ligne), page « Je vérifie et je fais le point »
 *   (réponses brèves + auto-évaluation par section du cours), corrigé détaillé ;
 * - évaluation = copie de l'élève (numérotation continue, points par sous-question, tableau des
 *   résultats par processus, pictogramme calculatrice), corrigé, et grille de correction
 *   (document professeur : réponse finale, barème, erreurs fréquentes, réponses acceptées) ;
 * - version aménagée (les deux modes) : même énoncé que la version normale (jamais découpé en
 *   étapes), police très lisible, grand interligne, une question par page.
 * Aucune zone de réponse nulle part : les élèves répondent sur une feuille à part.
 *
 * Tous les champs enrichis des items sont optionnels : un générateur qui ne les fournit pas encore
 * (autres chapitres) est rendu proprement avec son énoncé/corrigé historiques.
 *
 * Les champs Nom / Classe / N° figurent une seule fois, dans le cartouche de la première page.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export interface ItemEvaluation {
  processus: 1 | 2 | 3;
  /** Titre de la section de cours (ex. « 2. Résoudre une équation… »), préfixé du chapitre dans
   * une sélection multi-chapitres. */
  titreSection: string;
  points: number;
  section: SectionExercice;
  correction: BlocCorrection[];
  nature?: "exercice" | "ouverte" | "vraiFaux";
  /** Notion (titre de section sans numéro), pour l'étiquette « NOTION · PROCESSUS ». */
  notion?: string;
  /** Section du cours à relire (page « Je fais le point »). */
  sectionCours?: { numero: number; titre: string };
  /** Niveau de difficulté 1–7 et son palier (grille commune, `niveauDifficulte.ts`), affichés
   * « numéro + palier » en tête de l'exercice (feuille d'exercices et sa version aménagée). */
  niveau?: number;
  palier?: Palier;
  reponseBreve?: FragmentConsigne[];
  correctionDetaillee?: EtapeCorrection[];
  bareme?: BaremeExercice;
  /** Étapes du raisonnement (anciennes sous-questions), quand l'énoncé imprimé n'a que la consigne
   * globale (`AdaptateurFeuilleExercices.enoncePapier`) : le corrigé les affiche en titre de chaque
   * groupe de lignes `EtapeCorrection.etape`. `question` : lettre de la question papier couverte. */
  etapesCorrige?: { consigne: FragmentConsigne[]; question?: string }[];
  /** Durée estimée de l'item = somme des durées par exercice (`niveauDifficulte.ts`). */
  dureeMinutes?: number;
  /** Code reproductible de l'exercice (QR code de la feuille d'exercices, rappel dans la grille). */
  code?: { code: string; url: string };
  /** Chapitre(s) d'origine (slugs) : un seul, sauf la question vrai/faux regroupée — parties et
   * étiquettes de l'examen (`examen.ts`). */
  chapitres?: string[];
}

/** École et professeur : fixes (décision prise avec l'utilisateur — aucun champ dans le formulaire). */
const ECOLE_NOM = "Collège Saint-Pierre";
const ECOLE_ADRESSE = "Rue J.B. Verbeyst 25, 1090 Bruxelles";
const PROFESSEUR = "M. Hamwi";

export interface EnteteEvaluation {
  numero?: string;
  /** Date ISO (AAAA-MM-JJ) saisie dans le formulaire — affichée en toutes lettres. */
  date: string;
  titre: string;
  niveauLabel: string;
  niveauNumero: number;
  heuresSemaine: string;
  calculatrice?: "interdite" | "autorisee";
  serieLettre: string;
  /** `false` (défaut des nouvelles évaluations) : titres de section masqués, seuls les blocs de
   * processus restent. */
  afficherTitresSection?: boolean;
  mode?: "evaluation" | "exercice";
  /** `true` : la durée estimée est imprimée dans le cartouche. Absent/`false` (défaut) : elle ne
   * l'est pas — décision du professeur, case « Afficher la durée estimée » du panneau. */
  afficherDuree?: boolean;
  /** Surtitre « 6e (6h) · Chapitre 3 » (feuille d'exercices). */
  surtitre?: string;
  /** Titre du chapitre (« Fonctions logarithmes ») quand un seul chapitre est concerné. */
  titreChapitre?: string;
  /** Adresse de la page du chapitre (encadré « S'entraîner encore, en ligne »). */
  urlChapitre?: string;
  /** Case « Économie de papier (deux colonnes) » : marges réduites et énoncés en deux colonnes
   * (copie d'évaluation et énoncé de la feuille d'exercices seulement ; jamais l'aménagée, le
   * corrigé, la grille ni la page « Je vérifie »). Absent = non. */
  deuxColonnes?: boolean;
  /** Document « Examen » (maquette X3) : présent seulement pour un examen — l'évaluation est rendue
   * exactement comme avant quand il est absent. Points des items DÉJÀ mis à l'échelle si le total
   * est fixé (`evaluationLocal.ts::itemsDuDocument`). */
  examen?: ExamenDocument;
}

/** Réglages d'un examen, déjà lus et mis en forme (`evaluationLocal.ts::examenDuPlan`). */
export interface ExamenDocument {
  organisation: OrganisationExamen;
  /** Chapitres du plan, dans l'ordre du plan. */
  chapitres: ChapitreExamen[];
  /** « Session de juin 2027 ». */
  session: string;
  /** « 08h50 → 09h50 » (heure de départ et durée lisibles), sinon `null`. */
  horaire: string | null;
  /** « 1 h », « 1 h 30 » (durée lisible), sinon `null`. */
  duree: string | null;
  /** Consignes ajoutées après les consignes par défaut (une par ligne non vide, `$…$` en KaTeX). */
  consignesSupplementaires: string[];
}

/**
 * Annexe imprimée après l'énoncé (copie d'évaluation, version aménagée, feuille d'exercices —
 * jamais le corrigé ni la grille) : une page par annexe, chacune UNE seule fois.
 *
 * Mécanisme générique (liste d'annexes du document, construite par
 * `evaluationLocal.ts::annexesDuDocument`) : aujourd'hui le formulaire du chapitre (case « Joindre le
 * formulaire du chapitre en annexe ») ; demain une table de la loi normale Φ, ajoutée seulement si
 * une question du document en a besoin — il suffira d'ajouter son `AnnexeDocument` à cette liste.
 */
export interface AnnexeDocument {
  /** Identifiant stable (« formulaire:nombres-complexes », plus tard « table-normale »). */
  id: string;
  /** Titre de la page (« Annexe — Formulaire : Nombres complexes »). */
  titre: string;
  /** Mention discrète à droite du titre (« 6e (6h) · chapitre 5 »). */
  meta?: string;
  /** Corps HTML, formules KaTeX déjà rendues. */
  html: string;
}

const NOM_PROCESSUS: Record<1 | 2 | 3, string> = { 1: "Connaître", 2: "Appliquer", 3: "Transférer" };
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function dateEnToutesLettres(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  const mois = MOIS[Number(m[2]) - 1];
  if (!mois) return iso;
  return `${Number(m[3]) === 1 ? "1er" : Number(m[3])} ${mois} ${m[1]}`;
}

export function nombreFr(x: number): string {
  return Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100).replace(".", ",");
}

export function pointsTexte(x: number): string {
  return `${nombreFr(x)} ${x >= 2 ? "pts" : "pt"}`;
}

/** Titre sans le préfixe par défaut du formulaire (« Feuille d'exercices — », « Évaluation — »). */
export function titreNettoye(entete: EnteteEvaluation): string {
  const t = entete.titre.replace(/^\s*(Feuille d'exercices|Évaluation)\s*[—–-]\s*/i, "").trim();
  return t || entete.titreChapitre || entete.titre;
}

/** Ramène des poids à un total en demi-points (méthode des plus forts restes : total exact). */
export function repartirEnDemiPoints(poids: number[], total: number): number[] {
  const somme = poids.reduce((s, p) => s + Math.max(0, p), 0);
  if (poids.length === 0) return [];
  if (somme <= 0) return poids.map((_, i) => (i === 0 ? total : 0));
  const unites = Math.round(total * 2);
  const bruts = poids.map((p) => (Math.max(0, p) / somme) * unites);
  const entiers = bruts.map((b) => Math.floor(b));
  let reste = unites - entiers.reduce((s, e) => s + e, 0);
  const ordre = bruts.map((b, i) => ({ i, f: b - Math.floor(b) })).sort((a, b) => b.f - a.f);
  for (const { i } of ordre) {
    if (reste <= 0) break;
    entiers[i]++;
    reste--;
  }
  return entiers.map((e) => e / 2);
}

/** Points de chaque critère du barème, ramenés au total de la question. Répartition en deux temps :
 * d'abord le total entre les sous-questions (au demi-point), puis chaque sous-question entre ses
 * critères — sinon les arrondis critère par critère déplacent des points d'une sous-question à
 * l'autre (deux fonctions regroupées à 3 pts chacune affichées « 3,5 » et « 2,5 »). */
export function pointsCriteres(item: ItemEvaluation): number[] {
  if (!item.bareme || item.bareme.criteres.length === 0) return [];
  const criteres = item.bareme.criteres;
  const cle = (c: (typeof criteres)[number]) => (c.sousQuestion ?? "").toLowerCase().replace(/\)$/, "");
  const groupes = [...new Set(criteres.map(cle))];
  if (groupes.length < 2) return repartirEnDemiPoints(criteres.map((c) => c.points), item.points);
  const poidsGroupe = groupes.map((g) => criteres.filter((c) => cle(c) === g).reduce((t, c) => t + Math.max(0, c.points), 0));
  const totalGroupe = repartirEnDemiPoints(poidsGroupe, item.points);
  const res = new Array<number>(criteres.length).fill(0);
  groupes.forEach((g, k) => {
    const indices = criteres.map((c, i) => (cle(c) === g ? i : -1)).filter((i) => i >= 0);
    repartirEnDemiPoints(indices.map((i) => criteres[i].points), totalGroupe[k]).forEach((pts, j) => (res[indices[j]] = pts));
  });
  return res;
}

/** Points par sous-question (« a », « b »…), somme des critères correspondants. */
export function pointsParSousQuestion(item: ItemEvaluation): Map<string, number> {
  const res = new Map<string, number>();
  if (!item.bareme) return res;
  const pts = pointsCriteres(item);
  item.bareme.criteres.forEach((c, i) => {
    if (!c.sousQuestion) return;
    const cle = c.sousQuestion.toLowerCase().replace(/\)$/, "");
    res.set(cle, (res.get(cle) ?? 0) + pts[i]);
  });
  return res;
}

export function dureeEstimeeMinutes(items: ItemEvaluation[]): number {
  const brute = items.reduce((t, it) => t + (it.dureeMinutes ?? it.points * 2.5), 0);
  return Math.max(5, Math.ceil(brute / 5) * 5);
}

/* ----------------------------------------------------------------------------------------------
 * Styles
 * -------------------------------------------------------------------------------------------- */

const POLICES_STANDARD = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Archivo:wght@500;600;700&display=swap" rel="stylesheet">`;
const POLICE_AMENAGEE = `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">`;

const STYLE_COMMUN = `
@page { size: A4; margin: 1.3cm 1.5cm; }
* { box-sizing: border-box; }
:root { --encre: #1b1d22; --gris: #4a4f58; --filet: #b9bec7; --accent: #1d5b8f; --fond-doux: #eef3f8; --alerte: #9a3b12; --bon: #2f6b3a; }
body { margin: 0 auto; width: 21cm; max-width: 21cm; padding: 0.8cm 1cm; color: var(--encre); background: #fff;
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.5; }
/* Document A4 : largeur fixe (une page imprimée), jamais compressé par un écran étroit — le
   viewport « width=820 » fait dézoomer les téléphones au lieu de réagencer la page. Les formules
   restent dans leur bloc : une formule display trop large défile au lieu de déborder, le texte
   coupe les mots trop longs. */
.katex-display { overflow-x: auto; overflow-y: hidden; padding: 2px 0; }
.ex-texte, .entete, .carte, .etapes > *, .cartouche .g, td, th { overflow-wrap: anywhere; min-width: 0; }
img, svg { max-width: 100%; }
.sans { font-family: Archivo, Arial, Helvetica, sans-serif; }
p { margin: 0.35em 0; }
h1, h2, h3, h4 { margin: 0; text-wrap: balance; }
table { border-collapse: collapse; }
.entete { margin: 0.3em 0; }
.entete .katex-display { margin: 0.4em 0; }
.saut-page { break-before: page; page-break-before: always; }
.insecable { break-inside: avoid; page-break-inside: avoid; }
.pts { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 600; color: var(--gris); white-space: nowrap; }
.tableau-regroupe { margin: 0.4em 0; }
.tableau-regroupe td { border: none; padding: 3px 12px 3px 0; vertical-align: top; text-align: left; }
.tableau-regroupe td.lettre-regroupe { font-weight: bold; white-space: nowrap; padding-right: 6px; }
.grille-graphes-cyclo { display: grid; grid-template-columns: repeat(2, auto); gap: 10px; justify-content: center; margin: 0.6em 0; break-inside: avoid; }
.graphe-cyclo { display: block; }
.geometrie-cercle-conteneur { display: block; width: 100%; max-width: 280px; margin: 0.6em auto; border: 1px solid #ccc; border-radius: 6px; break-inside: avoid; }
.geometrie-cercle-conteneur-large { max-width: 320px; }
.geometrie-cercle-label { font-size: 13px; font-weight: 700; fill: #555; }
.paragraphe { margin: 0.3em 0; }
td, th { font-size: inherit; }
.surtitre { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.08em; color: var(--accent); text-transform: uppercase; }
.pied { margin-top: 1.2em; padding-top: 6px; border-top: 1px solid var(--filet); display: flex; justify-content: space-between; font-family: Archivo, Arial, sans-serif; font-size: 8pt; color: var(--gris); }
.etapes { display: grid; grid-template-columns: 3.2cm minmax(0, 1fr); column-gap: 12px; row-gap: 4px; }
.etapes .lbl { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 600; color: var(--accent); padding-top: 2px; }
.piege { display: flex; gap: 10px; margin-top: 6px; padding: 7px 12px; background: #f3f5f8; border-radius: 6px; }
.piege .lbl { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 700; color: var(--alerte); white-space: nowrap; padding-top: 2px; }
.etape-titre { margin: 10px 0 4px; padding-top: 6px; border-top: 1px solid var(--filet); overflow-wrap: anywhere; }
.etape-titre:first-child { margin-top: 0; padding-top: 0; border-top: 0; }
.etape-titre b { font-family: Archivo, Arial, sans-serif; font-size: 9pt; color: var(--accent); }
/* Corrigé « comme au tableau » : chaîne de calcul alignée sur « = » (membre de gauche aligné à
   droite, suite alignée à gauche), justification en petit italique à droite ; résultat encadré. */
.etapes .contenu { min-width: 0; }
.etapes .contenu > .intro { display: block; }
.calcul { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(2.6cm, 4.4cm); align-items: baseline; row-gap: 2px; margin: 2px 0 3px; break-inside: avoid; page-break-inside: avoid; }
.calcul.sans-just { grid-template-columns: auto minmax(0, 1fr); }
.calcul > .g { text-align: right; white-space: nowrap; }
.calcul > .d { min-width: 0; padding-right: 10px; }
.calcul > .s { grid-column: 1 / 3; min-width: 0; padding-right: 10px; }
.calcul > .j { font-family: Archivo, Arial, sans-serif; font-style: italic; font-size: 8.5pt; line-height: 1.3; color: var(--gris); }
.correction-bloc .calcul > .j { color: #4f6f9a; }
.resultat .cadre { display: inline-block; border: 1.5px solid var(--accent); border-radius: 5px; padding: 2px 10px; background: #f2f7fc; max-width: 100%; }
.etape-num { font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 600; color: var(--accent); }
.etapes-libres p { margin: 0 0 0.55em; }
.liste-donnees { margin: 0.4em 0; }
/* Points d'une sous-question / affirmation : colonne alignée à droite (le texte prend la place,
   les points ne passent jamais seuls à la ligne). */
.sq-pts { display: flex; gap: 14px; align-items: baseline; }
.sq-pts > .sq-texte { flex: 1; min-width: 0; }
.sq-pts > .pts, td.pts-col { flex: none; white-space: nowrap; min-width: 3.2em; text-align: right; }
.tableau-regroupe { width: 100%; }
.tableau-regroupe td.pts-col { padding-right: 0; width: 1%; }
/* Encadré « Consignes » en tête de la copie d'évaluation (et de l'aménagée). */
.consignes { border: 1.5px solid var(--accent); border-radius: 6px; padding: 6px 12px; margin: 10px 0 4px; background: #f2f7fc; break-inside: avoid; }
.consignes b.titre { color: var(--accent); }
/* Annexes (formulaire du chapitre…) : une page chacune, en fin de document. */
.annexe h2.annexe-titre { font-size: 15pt; font-weight: 600; padding-bottom: 6px; border-bottom: 2px solid var(--encre); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.annexe h2 .meta { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 500; color: var(--gris); text-align: right; }
.formulaire-papier { column-count: 2; column-gap: 8mm; column-rule: 1px solid var(--filet); }
.formulaire-papier .groupe { break-inside: avoid; page-break-inside: avoid; margin: 0 0 10px; }
.formulaire-papier h3 { font-family: Archivo, Arial, sans-serif; font-size: 9.5pt; font-weight: 700; color: var(--accent); border-bottom: 1px solid var(--accent); padding-bottom: 2px; margin-bottom: 3px; }
.formulaire-papier .formule { padding: 3px 0; border-bottom: 1px dotted var(--filet); break-inside: avoid; overflow-wrap: anywhere; }
.formulaire-papier .formule:last-child { border-bottom: 0; }
.formulaire-papier .f, .formulaire-papier .cond { display: block; }
.formulaire-papier .cond { font-size: 9pt; color: var(--gris); }
@media print { body { padding: 0; width: auto; max-width: none; } }
`;

/** Pied de page de chaque page imprimée (boîtes de marge CSS Paged Media, comme l'export des
 * chapitres — `lib/export/buildHtml.ts`). Copie d'évaluation et aménagée : « Série A · Nom : … » à
 * gauche (la lettre de série en gras : boîte de coin `@bottom-left-corner`, alignée à droite, collée à
 * la boîte `@bottom-left` — une boîte de marge n'a qu'un seul style de police), « page n / N » à
 * droite ; corrigé et grille d'évaluation (documents du professeur, `avecNom: false`) : « Série A »
 * en gras à gauche, sans « Nom », « page n / N » à droite ; feuille d'exercices (énoncé, « Je
 * vérifie » et corrigé détaillé forment UN document) : seulement « page n / N ». Firefox ignore les
 * boîtes de marge : la page s'imprime alors sans pied, jamais bloquant. */
function stylePied(serieLettre: string | null, police: string, taille = "8.5pt", avecNom = true): string {
  const commun = `font-family: ${police}; font-size: ${taille}; color: #333; vertical-align: middle;`;
  const serie = (serieLettre ?? "").replace(/["\\]/g, "");
  const gauche = !serieLettre
    ? ""
    : avecNom
      ? `@bottom-left-corner { content: "Série ${serie}"; ${commun} font-weight: 700; text-align: right; }
  @bottom-left { content: "\\00a0· Nom : ……………………………………"; ${commun} text-align: left; }`
      : `@bottom-left { content: "Série ${serie}"; ${commun} font-weight: 700; text-align: left; }`;
  return `@page { margin-bottom: 1.5cm;
  ${gauche}
  @bottom-right { content: "page " counter(page) " / " counter(pages); ${commun} text-align: right; } }`;
}

/** Économie de papier (case « deux colonnes ») : marges réduites (page nommée `compacte`, pour que
 * le corrigé, la grille, « Je vérifie » et les annexes gardent leurs marges) et énoncés en deux
 * colonnes. Un exercice ou une question ne se coupe jamais entre deux colonnes ; une figure est
 * réduite à la largeur de la colonne, sauf une figure très large, dont la question occupe toute la
 * largeur (`column-span: all`, voir `classeLargeur`). */
const STYLE_DEUX_COLONNES = `
@page compacte { margin: 0.9cm 1.2cm 1.4cm; }
.page-compacte { page: compacte; }
.deux-colonnes { column-count: 2; column-gap: 8mm; column-rule: 1px solid var(--filet); font-size: 10.5pt; }
/* Chaque exercice / question est un bloc MONOLITHIQUE (inline-block de la largeur de la colonne) :
   avec un simple break-inside: avoid, Chromium coupait quand même une question entre deux colonnes
   quand la rangée de colonnes commençait en milieu de page (sous une question pleine largeur) et que
   la question était plus haute que la place restante — en inline-block, elle passe entière à la page
   suivante. Les questions pleine largeur, et celles à trois figures ou plus (qui doivent pouvoir se
   couper entre leurs figures), restent des blocs sur toute la largeur. */
.deux-colonnes > .ex, .deux-colonnes > .question { display: inline-block; width: 100%; vertical-align: top; margin-top: 0; padding-top: 10px; break-inside: avoid; page-break-inside: avoid; }
.deux-colonnes > .pleine-largeur, .deux-colonnes > .figures-multiples { display: block; column-span: all; }
.deux-colonnes > .figures-multiples { break-inside: auto; page-break-inside: auto; }
/* Les blocs monolithiques sont des LIGNES pour le moteur : sans orphans/widows à 1, deux questions
   restaient ensemble dans la première colonne (veuves/orphelines = 2 lignes) au lieu d'équilibrer. */
.deux-colonnes { orphans: 1; widows: 1; }
/* Une formule affichée plus large que la colonne passe à la ligne entre ses termes au lieu d'être
   coupée (le défilement d'écran n'existe pas sur papier). */
.deux-colonnes .katex-display > .katex, .deux-colonnes .katex-display > .katex > .katex-html { white-space: normal; }
.deux-colonnes svg[viewBox]:not(.katex svg) { max-width: 100%; height: auto; }
.deux-colonnes .ex-corps { gap: 10px; }
/* QR code réduit (≈ 14 mm, encore lisible par un téléphone) : à 66 px, avec ses trois lignes de
   légende, il imposait sa hauteur à chaque exercice court. */
.deux-colonnes .qr-bloc { width: 1.9cm; font-size: 6.5pt; line-height: 1.15; gap: 1px; }
.deux-colonnes .qr-bloc svg { width: 52px; height: 52px; }
`;

const STYLE_FEUILLE = `
.tete { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 10px; border-bottom: 2px solid var(--encre); }
.tete h1 { font-size: 22pt; font-weight: 600; line-height: 1.15; }
.tete .sous { color: var(--gris); }
.identite { display: grid; grid-template-columns: auto 4.4cm; column-gap: 8px; row-gap: 5px; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); padding-top: 3px; }
.identite .champ { border-bottom: 1px solid #8a8f98; }
.identite .valeur { color: var(--encre); }
.legende { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 10px 0 4px; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.legende .droite { margin-left: auto; }
/* Niveau de difficulté « numéro + palier » (maquette E validée) : deux petits cadres, lisibles en
   noir et blanc — aucune couleur indispensable. */
.niveau { display: inline-flex; align-items: center; gap: 4px; font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 700; color: var(--encre); line-height: 1.35; white-space: nowrap; vertical-align: middle; }
.niveau .num { border: 1.4px solid var(--encre); border-radius: 3px; padding: 0 5px; }
.niveau .pal { border: 1.2px solid var(--encre); border-radius: 4px; padding: 0 7px; font-weight: 600; }
.ex { margin: 14px 0 0; break-inside: avoid; page-break-inside: avoid; }
.ex-tete { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.ex-tete h3 { font-family: Archivo, Arial, sans-serif; font-size: 12pt; font-weight: 700; }
.tag { font-family: Archivo, Arial, sans-serif; font-size: 7.5pt; font-weight: 600; letter-spacing: 0.06em; color: var(--gris); border: 1px solid var(--filet); border-radius: 3px; padding: 0 6px; text-transform: uppercase; }
.ex-corps { display: flex; gap: 18px; align-items: flex-start; }
.ex-texte { flex: 1; min-width: 0; }
.qr-bloc { width: 2.5cm; flex: none; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center; font-family: Archivo, Arial, sans-serif; font-size: 7.5pt; color: var(--gris); line-height: 1.25; }
.qr-bloc .code { font-weight: 700; color: var(--encre); letter-spacing: 0.05em; }
h2.page-titre { font-size: 18pt; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid var(--encre); margin-bottom: 12px; }
h3.rubrique { font-family: Archivo, Arial, sans-serif; font-size: 12pt; font-weight: 700; margin: 14px 0 4px; }
.explication { color: var(--gris); margin: 0 0 8px; }
.cartes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.carte { border: 1px solid var(--filet); border-radius: 6px; padding: 8px 10px; break-inside: avoid; }
.carte.large { grid-column: 1 / -1; }
.carte .num { font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 700; color: var(--accent); text-transform: uppercase; display: block; }
table.bilan { width: 100%; font-size: 10.5pt; }
table.bilan th { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 600; color: var(--gris); text-align: left; padding: 6px; border-bottom: 1.5px solid var(--encre); }
table.bilan td { padding: 8px 6px; border-bottom: 1px solid #d5d9df; text-align: left; vertical-align: middle; }
table.bilan .case-col { width: 2cm; text-align: center; }
.case { display: inline-block; width: 13px; height: 13px; border: 1.5px solid var(--gris); border-radius: 2px; }
table.bilan .relire { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); width: 4.2cm; }
.en-ligne { display: flex; gap: 14px; align-items: center; margin-top: 16px; padding: 10px 14px; border: 1.5px solid var(--accent); border-radius: 8px; break-inside: avoid; }
.en-ligne .titre { font-family: Archivo, Arial, sans-serif; font-size: 10pt; font-weight: 700; display: block; }
.en-ligne .url { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.corr { margin: 14px 0 0; break-inside: avoid; }
.corr:has(.etape-titre) { break-inside: auto; }
.corr h3 { font-family: Archivo, Arial, sans-serif; font-size: 12pt; font-weight: 700; margin-bottom: 4px; }
.corr h3 .notion { font-weight: 500; color: var(--gris); }
.reponse-ancienne { color: inherit; }
`;

const STYLE_EVALUATION = `
.page-cadre { width: 100%; border-collapse: collapse; }
.page-cadre > thead > tr > td, .page-cadre > tbody > tr > td { border: none; padding: 0; text-align: left; }
.entete-repetee { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); border-bottom: 1px solid #999; padding-bottom: 4px; margin-bottom: 10px; display: flex; justify-content: space-between; }
.cartouche { display: grid; grid-template-columns: minmax(0, 1fr) 6.6cm; border: 1.5px solid var(--encre); }
.cartouche .g { padding: 8px 12px; border-right: 1px solid var(--encre); display: flex; flex-direction: column; gap: 2px; }
.cartouche h1 { font-size: 16pt; font-weight: 600; line-height: 1.2; }
.cartouche .meta { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.cartouche .d { padding: 8px 12px; display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 8px; row-gap: 8px; align-content: center; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.cartouche .d .champ { border-bottom: 1px solid #8a8f98; }
.resultats { display: flex; gap: 12px; align-items: stretch; margin: 10px 0 4px; }
.resultats table { flex: 1; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; text-align: center; }
.resultats th, .resultats td { border: 1px solid #8a8f98; padding: 4px 6px; }
.resultats th { font-weight: 600; color: var(--gris); }
.resultats .total { border: 1.5px solid var(--encre); font-weight: 700; color: var(--encre); }
.resultats td.lbl { text-align: left; color: var(--gris); }
.resultats td.vide { height: 26px; }
.calc { width: 3cm; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 1px solid #8a8f98; font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 600; text-align: center; }
.calc.interdite { color: var(--alerte); }
.calc.autorisee { color: var(--bon); }
.bloc-processus { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.5px solid var(--accent); padding-bottom: 2px; margin: 14px 0 6px; break-after: avoid; page-break-after: avoid; }
.bloc-processus h2 { font-family: Archivo, Arial, sans-serif; font-size: 11.5pt; font-weight: 700; color: var(--accent); }
.titre-section { font-family: Archivo, Arial, sans-serif; font-size: 9pt; color: var(--gris); margin: 8px 0 2px; }
.question { margin: 8px 0 0; break-inside: avoid; page-break-inside: avoid; }
/* Corrigé : une question corrigée pas à pas peut dépasser une page — elle se coupe ENTRE deux
   étapes (titre d'étape jamais isolé en bas de page) plutôt que de laisser une page blanche. */
.question:has(.correction-bloc) { break-inside: auto; page-break-inside: auto; }
/* Énoncé : une question à figures plus haute que la place restante (6gen20 : cinq graphiques) se
   coupe ENTRE ses éléments — texte, figure, consigne —, jamais au milieu d'une figure, plutôt que
   d'être renvoyée entière à la page suivante en laissant une page presque vide sous l'en-tête.
   Une question à une ou deux figures reste d'un bloc : sinon son texte restait seul en bas de page
   et sa figure partait à la page suivante (gen8, gen39–41). */
.question.figures-multiples, .ex.figures-multiples { break-inside: auto; page-break-inside: auto; }
.question svg, .ex svg { break-inside: avoid; page-break-inside: avoid; }
.ligne-titre, .etape-titre { break-after: avoid; page-break-after: avoid; }
.etapes > *, .piege { break-inside: avoid; page-break-inside: avoid; }
.figure-corrige-bloc { margin: 6px 0 2px; break-inside: avoid; page-break-inside: avoid; }
.figure-corrige-bloc svg { display: block; width: 100%; max-width: 14cm; height: auto; }
.question .ligne-titre { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.question .num { font-weight: 700; }
.correction-bloc { color: #1155cc; margin-top: 4px; }
.grille h1 { font-size: 16pt; font-weight: 600; }
.grille .tete-grille { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; padding-bottom: 8px; border-bottom: 2px solid var(--encre); margin-bottom: 8px; }
.grille .q { margin: 10px 0 0; break-inside: avoid; page-break-inside: avoid; }
.grille .q-tete { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; background: var(--fond-doux); padding: 4px 10px; }
.grille .q-tete .sans { font-size: 9.5pt; font-weight: 700; }
.grille .criteres { display: grid; grid-template-columns: minmax(0, 1fr) 1.4cm; column-gap: 12px; row-gap: 2px; padding: 3px 10px 0; font-size: 10.5pt; }
.grille .criteres b { text-align: right; }
.grille .note { margin: 3px 10px 0; font-size: 10pt; color: var(--gris); }
.grille .note .err { color: var(--alerte); font-weight: 700; }
.grille .note .ok { color: var(--bon); font-weight: 700; }
.grille .regle { display: flex; gap: 10px; margin-top: 14px; padding: 8px 12px; border: 1px solid var(--filet); border-radius: 6px; font-size: 10pt; }
.grille .regle .sans { font-size: 8pt; font-weight: 700; color: var(--accent); }
`;

const STYLE_AMENAGE = `
body { font-family: 'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif; font-size: 13.5pt; line-height: 1.7; letter-spacing: 0.01em; }
.sans, .surtitre, .pts { font-family: 'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif; }
.pts { font-size: 11pt; }
.tete-am { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding-bottom: 10px; border-bottom: 2px solid var(--encre); margin-bottom: 14px; }
.tete-am h1 { font-size: 18pt; line-height: 1.3; }
.tete-am .droite { font-size: 11pt; color: var(--gris); text-align: right; }
.q-am { break-inside: avoid; }
.q-am h2 { font-size: 16pt; display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
.niveau { display: inline-flex; align-items: center; gap: 5px; margin-left: 8px; font-size: 11pt; font-weight: 700; color: var(--encre); line-height: 1.35; white-space: nowrap; vertical-align: middle; }
.niveau .num { border: 1.6px solid var(--encre); border-radius: 3px; padding: 0 6px; }
.niveau .pal { border: 1.4px solid var(--encre); border-radius: 4px; padding: 0 8px; }
.enonce-am { padding: 10px 14px; background: var(--fond-doux); border-radius: 8px; margin-bottom: 12px; }
.enonce-am .entete + p, .enonce-am p { margin: 0.5em 0; }
.identite-am { display: flex; gap: 24px; font-size: 11pt; color: var(--gris); margin-bottom: 10px; }
.identite-am span.champ { display: inline-block; width: 5cm; border-bottom: 1px solid #8a8f98; }
/* Annexes : une seule colonne, comme le formulaire aménagé du site. */
.formulaire-papier { column-count: 1; }
.formulaire-papier .cond { font-size: 11.5pt; }
`;

const SCRIPT_IMPRESSION = `<script>if(location.hash==='#imprimer'){addEventListener('load',function(){setTimeout(function(){window.print()},400)})}</script>`;

function documentHtml(titre: string, corps: string, css: string, cssKatex: string, police: "standard" | "amenagee", cssSupplementaire = ""): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=820">
<title>${echapperHtml(titre)}</title>
${police === "amenagee" ? POLICE_AMENAGEE : POLICES_STANDARD}
<style>${cssKatex}${STYLE_COMMUN}${css}${cssSupplementaire}</style>
${SCRIPT_IMPRESSION}
</head>
<body>
${grillesLisiblesAImpression(corps)}
</body>
</html>`;
}

/* ----------------------------------------------------------------------------------------------
 * Briques
 * -------------------------------------------------------------------------------------------- */

function lettreCle(q: number): string {
  return LETTRES[q] ?? String(q + 1);
}

/** Corps d'une question : en-tête (formules dans la phrase), contenu HTML (graphiques), puis
 * sous-questions a)/b)… avec, en évaluation, leurs points. Jamais de zone de réponse. */
function corpsQuestionHtml(item: ItemEvaluation, pointsSousQ?: Map<string, number>): string {
  let html = "";
  if (item.section.enteteFragments) html += `<div class="entete">${fragmentsEnteteHtml(item.section.enteteFragments)}</div>`;
  if (item.section.enteteHtml) html += item.section.enteteHtml;
  // Points de la sous-question : colonne à droite (A1), jamais en fin de phrase où ils passaient
  // seuls à la ligne.
  const pointsDe = (q: number) => {
    const p = pointsSousQ?.get(lettreCle(q));
    return p !== undefined ? pointsTexte(p) : null;
  };
  if (item.section.disposeEnTableau && item.section.questions.length > 1) {
    const avecPoints = item.section.questions.some((_, q) => pointsDe(q) !== null);
    html += `<table class="tableau-regroupe"><tbody>`;
    item.section.questions.forEach((question, q) => {
      const pts = avecPoints ? `<td class="pts-col"><span class="pts">${pointsDe(q) ?? ""}</span></td>` : "";
      html += `<tr><td class="lettre-regroupe">${lettreCle(q)})</td><td>${fragmentsVersHtml(question.consigne)}</td>${pts}</tr>`;
    });
    html += `</tbody></table>`;
  } else {
    const plusieurs = item.section.questions.length > 1;
    item.section.questions.forEach((question, q) => {
      const lettre = plusieurs ? `<strong>${lettreCle(q)})</strong> ` : "";
      const pts = plusieurs ? pointsDe(q) : null;
      html += pts !== null
        ? `<p class="sq-pts"><span class="sq-texte">${lettre}${fragmentsVersHtml(question.consigne)}</span><span class="pts">${pts}</span></p>`
        : `<p>${lettre}${fragmentsVersHtml(question.consigne)}</p>`;
    });
  }
  return html;
}

/** Largeur (px) de la plus large figure SVG d'un fragment HTML (attribut `width`, sinon `viewBox`). */
/** Balises ouvrantes des FIGURES SVG d'un fragment HTML — sans les SVG internes de KaTeX (racines,
 * flèches, accolades : largeur en `em` ou en `%`), qui ne sont pas des figures (une question à trois
 * racines carrées passait pour une question « à trois figures »). */
function balisesFigures(corpsHtml: string): string[] {
  return [...corpsHtml.matchAll(/<svg\b[^>]*>/g)].map((m) => m[0]).filter((balise) => !/\swidth="[\d.]+(em|%)"/.test(balise));
}

function largeurFigureMax(corpsHtml: string): number {
  let max = 0;
  for (const balise of balisesFigures(corpsHtml)) {
    const w = /\swidth="([\d.]+)(px)?"/.exec(balise);
    const vb = /viewBox="[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)/.exec(balise);
    const largeur = w ? Number(w[1]) : vb ? Number(vb[1]) : 0;
    if (largeur > max) max = largeur;
  }
  return max;
}

/** Deux colonnes : une figure un peu plus large que la place disponible est simplement réduite à la
 * largeur de la colonne (CSS `STYLE_DEUX_COLONNES`) ; au-delà de `seuil` px (largeur d'origine), la
 * réduire rendrait ses étiquettes illisibles : la question occupe alors toute la largeur. Seuils
 * mesurés sur les documents réels (colonne ≈ 8,6 cm ≈ 325 px) : copie d'évaluation 380 px (un
 * triangle de 340 px passe à 95 %, un solide de 400 px prend la largeur) ; feuille d'exercices
 * 260 px (le QR code laisse ≈ 225 px au texte). */
function classeLargeur(corpsHtml: string, deuxColonnes: boolean, seuil: number): string {
  return deuxColonnes && largeurFigureMax(corpsHtml) > seuil ? " pleine-largeur" : "";
}

/** Encadré « Consignes » de la copie d'évaluation (et de l'aménagée) — jamais sur la feuille
 * d'exercices. Calculatrice selon l'en-tête ; durée seulement si le professeur l'affiche. */
function consignesHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const calculatrice = entete.calculatrice ? ` Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.` : "";
  const duree = entete.afficherDuree ? ` Durée : ${dureeEstimeeMinutes(items)} minutes.` : "";
  return `<div class="consignes"><b class="titre">Consignes</b> — ${echapperHtml(TEXTE_CONSIGNES)}${calculatrice}${duree}</div>`;
}

/** Texte de l'encadré « Consignes » (repris tel quel par la copie Word). */
export const TEXTE_CONSIGNES = "Réponds sur une feuille à part, en indiquant le numéro de la question. Justifie chaque réponse : un résultat sans démarche ne rapporte pas tous les points.";

/** Annexes du document, une page chacune. */
function annexesHtml(annexes: AnnexeDocument[] | undefined): string {
  return (annexes ?? [])
    .map((a) => `<div class="saut-page"></div><section class="annexe"><h2 class="annexe-titre"><span>${echapperHtml(a.titre)}</span>${a.meta ? `<span class="meta">${echapperHtml(a.meta)}</span>` : ""}</h2>${a.html}</section>`)
    .join("");
}

/** Classe des questions à trois figures ou plus (6gen20 : cinq graphiques) : elles seules peuvent
 * se couper entre leurs figures (voir la CSS `.figures-multiples`). */
function classeFigures(corpsHtml: string): string {
  return balisesFigures(corpsHtml).length >= 3 ? " figures-multiples" : "";
}

function figureCorrigeHtml(e: EtapeCorrection): string {
  return e.figureHtml ? `<div class="figure-corrige-bloc">${e.figureHtml}</div>` : "";
}

/** Chaîne de calcul « comme au tableau » : grille à trois colonnes — membre de gauche (aligné à
 * droite), relation et suite (alignées à gauche : les « = » tombent les uns sous les autres),
 * justification en petit italique. Jamais coupée entre deux pages (`.calcul` insécable). */
export function calculHtml(lignes: LigneCalcul[] | undefined): string {
  if (!lignes || lignes.length === 0) return "";
  const avecJustif = lignes.some((l) => l.justification !== undefined);
  const k = (t: string) => fragmentsVersHtml([{ type: "latex", valeur: t }]);
  const cellules = lignes
    .map((l) => {
      const { gauche, droite } = decouperLigneCalcul(l.latex);
      const j = l.justification === undefined ? "" : fragmentsVersHtml(typeof l.justification === "string" ? [{ type: "texte", valeur: l.justification }] : l.justification);
      const formule = droite === null ? `<span class="s">${k(gauche)}</span>` : `<span class="g">${gauche ? k(gauche) : ""}</span><span class="d">${k(`{}${droite}`)}</span>`;
      return `${formule}${avecJustif ? `<span class="j">${j}</span>` : ""}`;
    })
    .join("");
  return `<div class="calcul${avecJustif ? "" : " sans-just"}">${cellules}</div>`;
}

function contenuLigneHtml(e: EtapeCorrection): string {
  const texteHtml = fragmentsVersHtml(e.fragments);
  if (e.type === "resultat") return `<span class="resultat"><span class="cadre">${texteHtml}</span>${calculHtml(e.calcul)}</span>${figureCorrigeHtml(e)}`;
  return `${texteHtml ? `<span class="intro">${texteHtml}</span>` : ""}${calculHtml(e.calcul)}${figureCorrigeHtml(e)}`;
}

function etapesCorrectionHtml(etapes: EtapeCorrection[]): string {
  const normales = etapes.filter((e) => !estLignePiege(e));
  const pieges = etapes.filter(estLignePiege);
  let html = "";
  if (normales.length > 0 && normales.every((e) => !e.label.trim() && !e.sousQuestion)) {
    // Aucune étiquette (corrigé d'une question ouverte) : simples paragraphes, sans colonne vide.
    html += `<div class="etapes-libres">${normales.map((e) => `<p>${fragmentsVersHtml(e.fragments)}</p>${calculHtml(e.calcul)}${figureCorrigeHtml(e)}`).join("")}</div>`;
  } else if (normales.length > 0) {
    html += `<div class="etapes">`;
    for (const e of normales) {
      const lbl = `${e.sousQuestion ? `${e.sousQuestion.replace(/\)$/, "")}) ` : ""}${e.label}`;
      html += `<span class="lbl">${echapperHtml(lbl)}</span><span class="contenu">${contenuLigneHtml(e)}</span>`;
    }
    html += `</div>`;
  }
  for (const p of pieges) {
    html += `<div class="piege"><span class="lbl">PIÈGE</span><span>${fragmentsVersHtml(p.fragments)}</span></div>`;
  }
  return html;
}

/** Corrigé d'un énoncé papier sans sous-questions : chaque étape du raisonnement (ancienne
 * sous-question du générateur) en titre, « Étape n — consigne », suivie de ses lignes. Les lignes
 * sans étape (synthèse finale) viennent à la fin. */
function etapesCorrigeParEtapeHtml(item: ItemEvaluation, lignes: EtapeCorrection[]): string {
  const etapes = item.etapesCorrige ?? [];
  let html = "";
  etapes.forEach((etape, i) => {
    const groupe = lignes.filter((e) => e.etape === i + 1);
    if (groupe.length === 0) return;
    const question = etape.question ? `${etape.question}) ` : "";
    html += `<div class="etape-titre"><b>${question}Étape ${i + 1}</b> — ${fragmentsVersHtml(etape.consigne)}</div>`;
    html += etapesCorrectionHtml(groupe.map((e) => ({ ...e, sousQuestion: undefined })));
  });
  const reste = lignes.filter((e) => e.etape === undefined || e.etape > etapes.length);
  if (reste.length > 0) html += etapesCorrectionHtml(reste);
  return html;
}

function correctionHtml(item: ItemEvaluation): string {
  if (item.correctionDetaillee && item.correctionDetaillee.length > 0) {
    return item.etapesCorrige && item.correctionDetaillee.some((e) => e.etape !== undefined)
      ? etapesCorrigeParEtapeHtml(item, item.correctionDetaillee)
      : etapesCorrectionHtml(item.correctionDetaillee);
  }
  return `<div class="reponse-ancienne">${item.correction.map(blocCorrectionHtml).join("")}</div>`;
}

/** Badge « numéro + palier » (« 5 » « Avancé ») — rien si l'exercice n'a pas de niveau. */
function niveauHtml(item: ItemEvaluation): string {
  if (!item.niveau || !item.palier) return "";
  const palier = LIBELLE_PALIER[item.palier];
  return `<span class="niveau" aria-label="niveau ${item.niveau} sur 7, ${palier}"><span class="num">${item.niveau}</span><span class="pal">${palier}</span></span>`;
}

/** Légende de la feuille d'exercices : l'échelle et ce qui fait monter le niveau. */
const LEGENDE_NIVEAUX = `<span>Niveau 1 à 7 : <span class="niveau"><span class="pal">Base</span></span> 1–2 · <span class="niveau"><span class="pal">Intermédiaire</span></span> 3–4 · <span class="niveau"><span class="pal">Avancé</span></span> 5–7. Il monte avec le nombre d'étapes, le choix de la méthode, un piège dans les données et les nombres (calculatrice, valeurs approchées).</span>`;

function calculatriceHtml(calculatrice: "interdite" | "autorisee" | undefined): string {
  if (!calculatrice) return "";
  const barre = calculatrice === "interdite" ? `<line x1="3" y1="21.5" x2="21" y2="2.5" stroke="#9a3b12" stroke-width="2.2"/>` : "";
  return `<div class="calc ${calculatrice}"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1b1d22" stroke-width="1.6" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2"/><rect x="7.5" y="5" width="9" height="4" rx="0.6"/><circle cx="9" cy="13" r="0.6" fill="#1b1d22"/><circle cx="12" cy="13" r="0.6" fill="#1b1d22"/><circle cx="15" cy="13" r="0.6" fill="#1b1d22"/><circle cx="9" cy="16.5" r="0.6" fill="#1b1d22"/><circle cx="12" cy="16.5" r="0.6" fill="#1b1d22"/><circle cx="15" cy="16.5" r="0.6" fill="#1b1d22"/>${barre}</svg><span>Calculatrice ${calculatrice === "interdite" ? "interdite" : "autorisée"}</span></div>`;
}

function grouperParProcessus(items: ItemEvaluation[]): { processus: 1 | 2 | 3; items: { item: ItemEvaluation; numero: number }[] }[] {
  const groupes: { processus: 1 | 2 | 3; items: { item: ItemEvaluation; numero: number }[] }[] = [];
  let numero = 0;
  for (const p of [1, 2, 3] as const) {
    const liste = items.filter((it) => it.processus === p);
    if (liste.length === 0) continue;
    groupes.push({ processus: p, items: liste.map((item) => ({ item, numero: ++numero })) });
  }
  return groupes;
}

/** Items dans l'ordre d'impression (processus 1, 2, 3), numérotés en continu. */
function itemsNumerotes(items: ItemEvaluation[]): { item: ItemEvaluation; numero: number }[] {
  return grouperParProcessus(items).flatMap((g) => g.items);
}

/* ----------------------------------------------------------------------------------------------
 * Feuille d'exercices
 * -------------------------------------------------------------------------------------------- */

function enteteFeuilleHtml(entete: EnteteEvaluation, sousTitre: string): string {
  const surtitre = entete.surtitre ?? entete.niveauLabel;
  return `<header class="tete">
  <div><span class="surtitre">${echapperHtml(surtitre)}</span><h1>${echapperHtml(titreNettoye(entete))}</h1><span class="sous">${echapperHtml(sousTitre)}</span></div>
  <div class="identite"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>Date</span><span class="valeur">${echapperHtml(dateEnToutesLettres(entete.date))}</span></div>
</header>`;
}

function exerciceFeuilleHtml(item: ItemEvaluation, numero: number, deuxColonnes = false): string {
  const tag = [item.notion, NOM_PROCESSUS[item.processus]].filter(Boolean).join(" · ");
  const qr = item.code
    ? `<div class="qr-bloc">${qrCodeSvg(item.code.url, 66, `QR code : refaire l'exercice ${numero} en ligne`)}<span>Refaire en ligne<br>avec les aides</span><span class="code">code ${echapperHtml(item.code.code)}</span></div>`
    : "";
  const corps = corpsQuestionHtml(item);
  return `<section class="ex${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 260)}">
  <div class="ex-tete"><h3>Exercice ${numero}</h3>${niveauHtml(item)}${tag ? `<span class="tag">${echapperHtml(tag)}</span>` : ""}</div>
  <div class="ex-corps"><div class="ex-texte">${corps}</div>${qr}</div>
</section>`;
}

function reponseBreveHtml(item: ItemEvaluation): string {
  if (item.reponseBreve && item.reponseBreve.length > 0) return fragmentsVersHtml(item.reponseBreve);
  return `<span class="explication">Voir le corrigé détaillé.</span>`;
}

/** Une réponse brève longue (plusieurs résultats enchaînés, limites empilées, tableaux) est
 * illisible dans une carte au tiers de la largeur : elle occupe alors toute la ligne. La longueur
 * est estimée sur le texte « visible » (une commande LaTeX compte pour un caractère, les accolades
 * et `\dfrac` ne comptent pas — une fraction est à peu près aussi large que son numérateur). */
function reponseBreveLongue(item: ItemEvaluation): boolean {
  const fragments = item.reponseBreve ?? [];
  const visible = (f: FragmentConsigne) => (f.type === "texte" ? f.valeur : f.valeur.replace(/\\d?frac/g, "").replace(/\\[a-zA-Z]+/g, "x").replace(/[{}\s]/g, ""));
  const longueur = fragments.reduce((total, f) => total + visible(f).length, 0);
  return longueur > 24 || fragments.some((f) => f.type === "latex" && /\\(begin|displaystyle|substack)/.test(f.valeur));
}

function pageJeVerifieHtml(entete: EnteteEvaluation, numerotes: { item: ItemEvaluation; numero: number }[]): string {
  const cartes = numerotes
    .map(({ item, numero }) => `<div class="carte${reponseBreveLongue(item) ? " large" : ""}"><span class="num">Exercice ${numero}</span>${reponseBreveHtml(item)}</div>`)
    .join("");

  // Une ligne par section du cours présente dans la feuille, dans l'ordre du cours.
  const sections = new Map<string, { numero: number; titre: string; exercices: number[] }>();
  for (const { item, numero } of numerotes) {
    const ref = item.sectionCours ?? { numero: 0, titre: item.notion ?? item.titreSection };
    const cle = `${ref.numero}|${ref.titre}`;
    const s = sections.get(cle) ?? { ...ref, exercices: [] };
    s.exercices.push(numero);
    sections.set(cle, s);
  }
  const lignes = [...sections.values()]
    .sort((a, b) => a.numero - b.numero)
    .map((s) => {
      const relire = s.numero > 0 ? `Section ${s.numero} — ${s.titre}` : s.titre;
      const ex = s.exercices.length > 1 ? `exercices ${s.exercices.join(", ")}` : `exercice ${s.exercices[0]}`;
      return `<tr><td>${echapperHtml(s.titre)} <span class="pts">(${ex})</span></td><td class="case-col"><span class="case"></span></td><td class="case-col"><span class="case"></span></td><td class="case-col"><span class="case"></span></td><td class="relire">${echapperHtml(relire)}</td></tr>`;
    })
    .join("");

  const enLigne = entete.urlChapitre
    ? `<div class="en-ligne">${qrCodeSvg(entete.urlChapitre, 72, "QR code vers les générateurs du chapitre")}<div><span class="titre">S'entraîner encore, en ligne</span><span>Chaque exercice a son propre code (en face de son énoncé). En ligne, tu retrouves <b>le même exercice</b>, avec les aides pas à pas et la vérification automatique, puis d'autres du même type.</span><br><span class="url">${echapperHtml(entete.urlChapitre.replace(/^https?:\/\//, ""))}</span></div></div>`
    : "";

  return `<h2 class="page-titre">Je vérifie et je fais le point</h2>
<h3 class="rubrique">Réponses brèves</h3>
<p class="explication">Le résultat seul, sans la démarche : compare-le au tien avant de regarder le corrigé détaillé.</p>
<div class="cartes">${cartes}</div>
<h3 class="rubrique">Je fais le point</h3>
<p class="explication">Coche une case par ligne. Pour ce qui n'est pas encore acquis, la dernière colonne te dit où relire le cours.</p>
<table class="bilan"><thead><tr><th>Je sais…</th><th class="case-col">Acquis</th><th class="case-col">Presque</th><th class="case-col">Pas encore</th><th>À relire</th></tr></thead><tbody>${lignes}</tbody></table>
${enLigne}`;
}

function pageCorrigeFeuilleHtml(numerotes: { item: ItemEvaluation; numero: number }[]): string {
  const blocs = numerotes
    .map(({ item, numero }) => `<section class="corr"><h3>Exercice ${numero}${item.notion ? ` <span class="notion">— ${echapperHtml(item.notion)}</span>` : ""}</h3>${correctionHtml(item)}</section>`)
    .join("");
  return `<h2 class="page-titre">Corrigé détaillé</h2>${blocs}`;
}

export async function genererFeuilleExercicesComplete(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const numerotes = itemsNumerotes(items);
  const deuxColonnes = !!entete.deuxColonnes;
  const auMoinsUnNiveau = items.some((it) => it.niveau);
  const legende = `<div class="legende">${auMoinsUnNiveau ? LEGENDE_NIVEAUX : ""}<span class="droite">Réponses brèves et corrigé : en fin de feuille</span></div>`;
  const exercices = numerotes.map(({ item, numero }) => exerciceFeuilleHtml(item, numero, deuxColonnes)).join("");
  const enonce = `${enteteFeuilleHtml(entete, "Feuille d'exercices")}
${legende}
${deuxColonnes ? `<div class="deux-colonnes">${exercices}</div>` : exercices}`;
  // Annexes (formulaire…) : une fois, juste après l'énoncé (décision de l'utilisateur : l'élève les
  // consulte sans feuilleter « Je vérifie » ni le corrigé).
  const corps = `${deuxColonnes ? `<div class="page-compacte">${enonce}</div>` : enonce}${annexesHtml(annexes)}
<div class="saut-page"></div>
${pageJeVerifieHtml(entete, numerotes)}
<div class="saut-page"></div>
${pageCorrigeFeuilleHtml(numerotes)}`;
  const css = `${stylePied(null, "Archivo, Arial, sans-serif")}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}`;
  const doc = documentHtml(`${titreNettoye(entete)} — Feuille d'exercices`, corps, STYLE_FEUILLE, cssKatex, "standard", css);
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}

/* ----------------------------------------------------------------------------------------------
 * Évaluation
 * -------------------------------------------------------------------------------------------- */

function totauxParProcessus(items: ItemEvaluation[]): { processus: 1 | 2 | 3; total: number }[] {
  return ([1, 2, 3] as const)
    .map((p) => ({ processus: p, total: items.filter((it) => it.processus === p).reduce((t, it) => t + it.points, 0) }))
    .filter((x) => x.total > 0);
}

export function titreEvaluation(entete: EnteteEvaluation): string {
  const num = entete.numero?.trim();
  return `Évaluation${num ? ` n° ${num}` : ""} — ${titreNettoye(entete)}`;
}

function cartoucheEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[], suffixe?: string): string {
  const duree = entete.afficherDuree ? ` · ${dureeEstimeeMinutes(items)} minutes` : "";
  return `<div class="cartouche">
  <div class="g"><span class="surtitre">${echapperHtml(ECOLE_NOM)} · Mathématiques ${echapperHtml(entete.heuresSemaine)}h/sem · ${echapperHtml(PROFESSEUR)}</span>
    <h1>${echapperHtml(titreEvaluation(entete))}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}</h1>
    <span class="meta">${echapperHtml(dateEnToutesLettres(entete.date))} · Série <strong>${echapperHtml(entete.serieLettre)}</strong>${duree} · ${echapperHtml(ECOLE_ADRESSE)}</span></div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>N°</span><span class="champ"></span></div>
</div>`;
}

function resultatsHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const tetes = totaux.map((t) => `<th>${NOM_PROCESSUS[t.processus]}</th>`).join("");
  const cases = totaux.map((t) => `<td class="vide">…… / ${nombreFr(t.total)}</td>`).join("");
  return `<div class="resultats"><table><tr><th style="text-align:left">Processus</th>${tetes}<th class="total">Total</th></tr><tr><td class="lbl">Points</td>${cases}<td class="total vide">…… / ${nombreFr(total)}</td></tr></table>${calculatriceHtml(entete.calculatrice)}</div>`;
}

/** Plus de bandeau « Nom et prénom … N° » répété en haut de page : il faisait doublon avec les
 * champs Nom / Classe / N° du cartouche (les élèves répondent de toute façon sur une feuille à part). */
function enveloppeEvaluation(contenu: string): string {
  return contenu;
}

/** `deuxColonnes` (copie seulement, jamais le corrigé) : toutes les questions en deux colonnes qui
 * s'enchaînent d'un processus à l'autre (des colonnes par processus laissaient une demi-colonne
 * vide sous chaque processus à une ou deux questions) ; le bandeau d'un processus est alors placé
 * DANS sa première question (insécable), pour ne jamais rester seul en bas de colonne. */
function questionsEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[], avecCorrection: boolean, deuxColonnes = false): string {
  const afficherTitres = entete.afficherTitresSection ?? false;
  let html = "";
  for (const groupe of grouperParProcessus(items)) {
    const totalP = groupe.items.reduce((t, x) => t + x.item.points, 0);
    const bandeau = `<div class="bloc-processus"><h2>Processus ${groupe.processus} — ${NOM_PROCESSUS[groupe.processus]}</h2><span class="pts">${pointsTexte(totalP)}</span></div>`;
    if (!deuxColonnes) html += bandeau;
    let sectionCourante: string | null = null;
    let questions = "";
    let premiere = true;
    for (const { item, numero } of groupe.items) {
      let titre = "";
      if (afficherTitres && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        titre = `<div class="titre-section">${echapperHtml(item.titreSection)}</div>`;
      }
      if (!deuxColonnes) questions += titre;
      const pts = pointsParSousQuestion(item);
      const corps = corpsQuestionHtml(item, pts);
      questions += `<section class="question${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 380)}">${deuxColonnes ? `${premiere ? bandeau : ""}${titre}` : ""}<div class="ligne-titre"><span class="num">Question ${numero}</span><span class="pts">${pointsTexte(item.points)}</span></div>${corps}${
        avecCorrection ? `<div class="correction-bloc">${correctionHtml(item)}</div>` : ""
      }</section>`;
      premiere = false;
    }
    html += questions;
  }
  return deuxColonnes ? `<div class="deux-colonnes">${html}</div>` : html;
}

/** Bloc d'une question dans la grille de correction (évaluation : `libelle` = processus). */
function blocGrilleHtml(item: ItemEvaluation, numero: number, libelle: string): string {
  const reponse = item.bareme ? `Réponse : <b>${fragmentsVersHtml(item.bareme.reponseFinale)}</b>` : item.notion ? echapperHtml(item.notion) : "";
  const tete = `<div class="q-tete"><span class="sans">Question ${numero} · ${echapperHtml(libelle)} · ${pointsTexte(item.points)}</span><span>${reponse}</span></div>`;
  if (!item.bareme || item.bareme.criteres.length === 0) {
    return `<section class="q">${tete}<div class="note">Barème global : ${pointsTexte(item.points)}.</div><div style="padding:3px 10px 0">${correctionHtml(item)}</div></section>`;
  }
  const pts = pointsCriteres(item);
  const criteres = item.bareme.criteres
    .map((c, i) => `<span>${c.sousQuestion ? `${echapperHtml(c.sousQuestion.replace(/\)$/, ""))}) ` : ""}${c.etape ? `<span class="etape-num">Étape ${c.etape}</span> ` : ""}${fragmentsVersHtml(c.critere)}</span><b>${nombreFr(pts[i])}</b>`)
    .join("");
  const erreurs = (item.bareme.erreursFrequentes ?? [])
    .map((e) => `${fragmentsVersHtml(e.description)}${e.cout ? ` → ${echapperHtml(e.cout)}` : ""}`)
    .join(" ; ");
  const acceptees = (item.bareme.reponsesAcceptees ?? []).map((r) => fragmentsVersHtml(r)).join(" ; ");
  const code = item.code ? ` <span class="pts">code ${echapperHtml(item.code.code)}</span>` : "";
  return `<section class="q">${tete}<div class="criteres">${criteres}</div>${
    erreurs ? `<div class="note"><span class="err">Erreurs fréquentes :</span> ${erreurs}</div>` : ""
  }${acceptees ? `<div class="note"><span class="ok">Accepter :</span> ${acceptees}</div>` : ""}${code ? `<div class="note">${code}</div>` : ""}</section>`;
}

function grilleHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const resume = `${totaux.map((t) => `${NOM_PROCESSUS[t.processus]} ${nombreFr(t.total)}`).join(" · ")} · <b>Total ${nombreFr(total)}</b>`;
  const blocs = itemsNumerotes(items)
    .map(({ item, numero }) => blocGrilleHtml(item, numero, NOM_PROCESSUS[item.processus]))
    .join("");
  return `<div class="grille"><div class="tete-grille"><div><span class="surtitre">Document professeur · Série <strong>${echapperHtml(entete.serieLettre)}</strong></span><h1>Grille de correction — ${echapperHtml(titreNettoye(entete))}</h1></div><span class="sans" style="font-size:8.5pt;color:#4a4f58">${resume}</span></div>${blocs}
<div class="regle"><span class="sans">RÈGLE</span><span>Une erreur n'est pénalisée qu'une fois : si une valeur fausse est réutilisée correctement dans la suite, la suite rapporte ses points.</span></div>
<div class="pied"><span>${echapperHtml(titreEvaluation(entete))} · ${echapperHtml(dateEnToutesLettres(entete.date))}</span><span>Ne pas distribuer aux élèves</span></div></div>`;
}

/** Copie, corrigé et grille de correction d'UNE série. Copie : encadré « Consignes », pied de page
 * « Série · Nom · page n / N », annexes en fin de copie, deux colonnes si demandé ; le corrigé et la
 * grille gardent leur mise en page, avec le pied « Série A · page n / N » (sans « Nom »). */
export async function genererEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<{ enonce: Blob; corrige: Blob; grille: Blob }> {
  if (entete.examen) return genererExamenHtml(entete, entete.examen, items, annexes);
  const cssKatex = await obtenirCssKatexAutonome();
  const css = STYLE_EVALUATION;
  const titre = `${titreEvaluation(entete)} — Série ${entete.serieLettre}`;
  const deuxColonnes = !!entete.deuxColonnes;
  const contenuCopie = `${cartoucheEvaluationHtml(entete, items)}${resultatsHtml(entete, items)}${consignesHtml(entete, items)}${questionsEvaluationHtml(entete, items, false, deuxColonnes)}`;
  const copie = enveloppeEvaluation(`${deuxColonnes ? `<div class="page-compacte">${contenuCopie}</div>` : contenuCopie}${annexesHtml(annexes)}`);
  const corrige = enveloppeEvaluation(`${cartoucheEvaluationHtml(entete, items, "Corrigé")}${questionsEvaluationHtml(entete, items, true)}`);
  const grille = grilleHtml(entete, items);
  const cssCopie = `${stylePied(entete.serieLettre, "Archivo, Arial, sans-serif")}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}`;
  // Corrigé et grille : documents du professeur — « Série A » (sans « Nom ») et « page n / N ».
  const cssProfesseur = stylePied(entete.serieLettre, "Archivo, Arial, sans-serif", "8.5pt", false);
  return {
    enonce: new Blob([documentHtml(titre, copie, css, cssKatex, "standard", cssCopie)], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([documentHtml(`${titre} — Corrigé`, corrige, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
    grille: new Blob([documentHtml(`${titre} — Grille de correction`, grille, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
  };
}

/* ----------------------------------------------------------------------------------------------
 * Examen (maquette X3 « Sans page de garde », décisions de l'utilisateur)
 *
 * Même grammaire que la copie d'évaluation (cartouche, tableau des points, encadré « Consignes ») :
 * bandeau plein « Examen · session · horaire » au-dessus du cartouche, tableau des points par
 * PARTIE, ouverture de chaque partie (filet épais d'accent, « Partie I », titre, points, ligne grise
 * des chapitres / processus couverts et des numéros de questions), étiquette de processus ou de
 * chapitre sur chaque question, numérotation continue, en-tête courant à partir de la page 2 (boîtes
 * de marge `@top-*`, absentes de la première page). Le pied de page est celui de l'évaluation.
 * -------------------------------------------------------------------------------------------- */

const STYLE_EXAMEN = `
.bande { font-family: Archivo, Arial, sans-serif; font-size: 9pt; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #fff; background: var(--accent); padding: 6px 12px; display: flex; justify-content: space-between; gap: 12px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
/* Horaire et durée hors capitales : « 08h50 », jamais « 08H50 ». */
.bande .nc { text-transform: none; letter-spacing: 0.04em; }
.resultats.examen th:first-child, .resultats.examen td.lbl, .resultats.examen td.vide { white-space: nowrap; }
.partie { margin: 16px 0 8px; border-top: 3px solid var(--accent); border-bottom: 1px solid var(--accent); padding: 6px 0 5px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: baseline; column-gap: 12px; row-gap: 1px; break-inside: avoid; page-break-inside: avoid; break-after: avoid; page-break-after: avoid; }
.partie .no { font-family: Archivo, Arial, sans-serif; font-weight: 700; font-size: 9pt; letter-spacing: 0.14em; color: var(--accent); text-transform: uppercase; white-space: nowrap; }
.partie h2 { font-size: 15pt; font-weight: 600; line-height: 1.25; min-width: 0; overflow-wrap: anywhere; }
.partie .chs { grid-column: 1 / -1; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.question .ligne-titre .ch, .q-am .ch, .grille .q-tete .ch { font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 600; color: var(--gris); border: 1px solid var(--filet); border-radius: 3px; padding: 0 6px; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.consignes ul.sup { margin: 3px 0 0; padding-left: 1.3em; }
.consignes ul.sup li { margin: 1px 0; }
.grille .partie { margin: 16px 0 4px; }
.grille .partie h2 { font-size: 12pt; }
/* Deux colonnes : l'ouverture de partie occupe toute la largeur, ses questions suivent en colonnes. */
.partie-colonnes > .partie { margin-bottom: 0; }
`;

/** Polices de la version aménagée pour les éléments propres à l'examen. */
const STYLE_EXAMEN_AMENAGE = `
.bande, .partie .no, .partie .chs, .q-am .ch { font-family: 'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif; }
.bande { font-size: 11pt; margin-bottom: 10px; }
.partie { margin: 0 0 12px; }
.partie .no { font-size: 11pt; }
.partie h2 { font-size: 17pt; }
.partie .chs { font-size: 11pt; }
.q-am .ch { font-size: 10pt; }
`;

/** En-tête courant de l'examen, à partir de la page 2 : « Examen de juin 2027 · Mathématiques 4e »
 * à gauche, « Série A » à droite (lettre en gras : boîte de coin, comme le pied de page). L'espace
 * après `\00a0` TERMINE l'échappement CSS : sans elle, « \00a0A » se lisait U+A0A (glyphe gurmukhi). */
function styleEnteteCourant(gauche: string, serieLettre: string, police: string, taille = "8.5pt"): string {
  const commun = `font-family: ${police}; font-size: ${taille}; color: #4a4f58; vertical-align: middle;`;
  const g = gauche.replace(/["\\]/g, "");
  const serie = serieLettre.replace(/["\\]/g, "");
  return `@page { @top-left { content: "${g}"; ${commun} text-align: left; }
  @top-right { content: "Série"; ${commun} text-align: right; }
  @top-right-corner { content: "\\00a0 ${serie}"; ${commun} font-weight: 700; text-align: left; } }
@page :first { @top-left { content: none; } @top-right { content: none; } @top-right-corner { content: none; } }`;
}

const accesExamen = (it: ItemEvaluation): QuestionOrdonnable => ({ processus: it.processus, chapitres: it.chapitres ?? [] });

/** Parties de l'examen (ordre et numérotation de la copie, partagés avec la remédiation). */
export function partiesDuDocument(examen: ExamenDocument, items: ItemEvaluation[]): PartieExamen<ItemEvaluation>[] {
  return partiesExamen(items, accesExamen, examen.organisation, examen.chapitres);
}

export function totalPartie(partie: PartieExamen<ItemEvaluation>): number {
  return partie.questions.reduce((t, q) => t + q.element.points, 0);
}

/** « Examen de mathématiques — 4e année ». */
export function titreExamen(entete: EnteteEvaluation): string {
  return `Examen de mathématiques — ${entete.niveauNumero}e année`;
}

/** « Examen de juin 2027 · Mathématiques 4e » (en-tête courant). */
export function enteteCourantExamen(entete: EnteteEvaluation, examen: ExamenDocument): string {
  return `${examenDeSession(examen.session)} · Mathématiques ${entete.niveauLabel}`;
}

/** Droite du bandeau : « Session de juin 2027 · 08h50 → 09h50 » (sans heure : la durée seule). */
export function droiteBandeau(examen: ExamenDocument): { session: string; horaire: string | null } {
  return { session: examen.session, horaire: examen.horaire ?? examen.duree };
}

function bandeHtml(examen: ExamenDocument): string {
  const { session, horaire } = droiteBandeau(examen);
  return `<div class="bande"><span>Examen</span><span>${echapperHtml(session)}${horaire ? ` · <span class="nc">${echapperHtml(horaire)}</span>` : ""}</span></div>`;
}

function cartoucheExamenHtml(entete: EnteteEvaluation, examen: ExamenDocument, suffixe?: string): string {
  return `${bandeHtml(examen)}<div class="cartouche examen">
  <div class="g"><span class="surtitre">${echapperHtml(ECOLE_NOM)} · Mathématiques ${echapperHtml(entete.heuresSemaine)}h/sem · ${echapperHtml(PROFESSEUR)}</span>
    <h1>${echapperHtml(titreExamen(entete))}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}</h1>
    <span class="meta">${echapperHtml(dateEnToutesLettres(entete.date))} · Série <strong>${echapperHtml(entete.serieLettre)}</strong> · ${echapperHtml(ECOLE_ADRESSE)}</span></div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>N°</span><span class="champ"></span></div>
</div>`;
}

function resultatsExamenHtml(entete: EnteteEvaluation, parties: PartieExamen<ItemEvaluation>[]): string {
  const total = parties.reduce((t, p) => t + totalPartie(p), 0);
  const tetes = parties.map((p) => `<th>${p.romain} · ${echapperHtml(p.titreCourt)}</th>`).join("");
  const cases = parties.map((p) => `<td class="vide">…… / ${nombreFr(totalPartie(p))}</td>`).join("");
  return `<div class="resultats examen"><table><tr><th style="text-align:left">Partie</th>${tetes}<th class="total">Total</th></tr><tr><td class="lbl">Points</td>${cases}<td class="total vide">…… / ${nombreFr(total)}</td></tr></table>${calculatriceHtml(entete.calculatrice)}</div>`;
}

/** Phrase horaire / durée de l'encadré « Consignes » (copie, aménagée, Word). */
export function phraseHoraire(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): string {
  if (examen.horaire) return ` Horaire : ${examen.horaire}${examen.duree ? ` (${examen.duree})` : ""}.`;
  if (examen.duree) return ` Durée : ${examen.duree}.`;
  return entete.afficherDuree ? ` Durée : ${dureeEstimeeMinutes(items)} minutes.` : "";
}

function consignesExamenHtml(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): string {
  const calculatrice = entete.calculatrice ? ` Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.` : "";
  const sup = examen.consignesSupplementaires.length
    ? `<ul class="sup">${examen.consignesSupplementaires.map((l) => `<li>${fragmentsVersHtml(fragmentsConsigne(l))}</li>`).join("")}</ul>`
    : "";
  return `<div class="consignes"><b class="titre">Consignes</b> — ${echapperHtml(TEXTE_CONSIGNES)}${calculatrice}${echapperHtml(phraseHoraire(entete, examen, items))}${sup}</div>`;
}

function ouverturePartieHtml(examen: ExamenDocument, partie: PartieExamen<ItemEvaluation>): string {
  return `<div class="partie"><span class="no">Partie ${partie.romain}</span><h2>${echapperHtml(partie.titre)}</h2><span class="pts">${pointsTexte(totalPartie(partie))}</span><span class="chs">${echapperHtml(lignePartie(partie, accesExamen, examen.organisation, examen.chapitres))}</span></div>`;
}

function etiquetteHtml(examen: ExamenDocument, item: ItemEvaluation): string {
  const e = etiquetteQuestion(accesExamen(item), examen.organisation, examen.chapitres);
  return e ? `<span class="ch">${echapperHtml(e)}</span>` : "";
}

/** Questions de l'examen, partie par partie. Deux colonnes : chaque partie s'ouvre sur toute la
 * largeur, puis ses questions en deux colonnes (bloc multicolonne propre à la partie). */
function questionsExamenHtml(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[], avecCorrection: boolean, deuxColonnes = false): string {
  const afficherTitres = entete.afficherTitresSection ?? false;
  let html = "";
  for (const partie of partiesDuDocument(examen, items)) {
    let sectionCourante: string | null = null;
    let questions = "";
    for (const { element: item, numero } of partie.questions) {
      let titre = "";
      if (afficherTitres && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        titre = `<div class="titre-section">${echapperHtml(item.titreSection)}</div>`;
      }
      if (!deuxColonnes) questions += titre;
      const corps = corpsQuestionHtml(item, pointsParSousQuestion(item));
      questions += `<section class="question${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 380)}">${deuxColonnes ? titre : ""}<div class="ligne-titre"><span><span class="num">Question ${numero}</span>${etiquetteHtml(examen, item)}</span><span class="pts">${pointsTexte(item.points)}</span></div>${corps}${
        avecCorrection ? `<div class="correction-bloc">${correctionHtml(item)}</div>` : ""
      }</section>`;
    }
    const ouverture = ouverturePartieHtml(examen, partie);
    // Une partie d'UNE seule question reste en pleine largeur (en colonnes, l'autre colonne restait vide).
    html += deuxColonnes && partie.questions.length > 1 ? `<div class="partie-colonnes">${ouverture}<div class="deux-colonnes">${questions}</div></div>` : `${ouverture}${questions}`;
  }
  return html;
}

function grilleExamenHtml(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): string {
  const parties = partiesDuDocument(examen, items);
  const total = parties.reduce((t, p) => t + totalPartie(p), 0);
  const resume = `${parties.map((p) => `${p.romain} ${echapperHtml(p.titreCourt)} : ${nombreFr(totalPartie(p))}`).join(" · ")} · <b>Total ${nombreFr(total)}</b>`;
  const blocs = parties
    .map((partie) => {
      const qs = partie.questions
        .map(({ element: item, numero }) => {
          // Grille (document professeur) : processus ET chapitre de la question.
          const chapitre = examen.chapitres.filter((c) => (item.chapitres ?? []).includes(c.slug)).map((c) => c.titreCourt);
          const libelle = [NOM_PROCESSUS_EXAMEN[item.processus], chapitre.length > 2 ? "Plusieurs chapitres" : chapitre.join(" · ")].filter(Boolean).join(" · ");
          return blocGrilleHtml(item, numero, libelle);
        })
        .join("");
      return `${ouverturePartieHtml(examen, partie)}${qs}`;
    })
    .join("");
  return `<div class="grille"><div class="tete-grille"><div><span class="surtitre">Document professeur · Examen · Série <strong>${echapperHtml(entete.serieLettre)}</strong></span><h1>Grille de correction — ${echapperHtml(titreExamen(entete))}</h1></div><span class="sans" style="font-size:8.5pt;color:#4a4f58">${resume}</span></div>${blocs}
<div class="regle"><span class="sans">RÈGLE</span><span>Une erreur n'est pénalisée qu'une fois : si une valeur fausse est réutilisée correctement dans la suite, la suite rapporte ses points.</span></div>
<div class="pied"><span>${echapperHtml(examenDeSession(examen.session))} · ${echapperHtml(dateEnToutesLettres(entete.date))}</span><span>Ne pas distribuer aux élèves</span></div></div>`;
}

/** Copie, corrigé et grille d'un EXAMEN (même pied de page que l'évaluation, en-tête courant en plus). */
async function genererExamenHtml(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<{ enonce: Blob; corrige: Blob; grille: Blob }> {
  const cssKatex = await obtenirCssKatexAutonome();
  const css = `${STYLE_EVALUATION}${STYLE_EXAMEN}`;
  const titre = `${titreExamen(entete)} — ${examen.session} — Série ${entete.serieLettre}`;
  const deuxColonnes = !!entete.deuxColonnes;
  const parties = partiesDuDocument(examen, items);
  const contenuCopie = `${cartoucheExamenHtml(entete, examen)}${resultatsExamenHtml(entete, parties)}${consignesExamenHtml(entete, examen, items)}${questionsExamenHtml(entete, examen, items, false, deuxColonnes)}`;
  const copie = `${deuxColonnes ? `<div class="page-compacte">${contenuCopie}</div>` : contenuCopie}${annexesHtml(annexes)}`;
  const corrige = `${cartoucheExamenHtml(entete, examen, "Corrigé")}${questionsExamenHtml(entete, examen, items, true)}`;
  const grille = grilleExamenHtml(entete, examen, items);
  const police = "Archivo, Arial, sans-serif";
  const courant = enteteCourantExamen(entete, examen);
  const cssCopie = `${stylePied(entete.serieLettre, police)}${styleEnteteCourant(courant, entete.serieLettre, police)}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}`;
  const cssProfesseur = `${stylePied(entete.serieLettre, police, "8.5pt", false)}${styleEnteteCourant(courant, entete.serieLettre, police)}`;
  return {
    enonce: new Blob([documentHtml(titre, copie, css, cssKatex, "standard", cssCopie)], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([documentHtml(`${titre} — Corrigé`, corrige, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
    grille: new Blob([documentHtml(`${titre} — Grille de correction`, grille, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
  };
}

/** Version aménagée d'un examen : même énoncé, mise en page aménagée (une question par page), avec
 * le bandeau, l'horaire, les consignes et l'ouverture de chaque partie sur la page de sa première
 * question. */
async function genererExamenAmenage(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const titre = titreExamen(entete);
  // Session et horaire : dans le bandeau (pas répétés à droite du titre).
  const tete = `${bandeHtml(examen)}<div class="tete-am"><div><span class="surtitre" style="color:#1d5b8f;font-weight:700">Version aménagée · Examen</span><h1>${echapperHtml(titre)}</h1></div><span class="droite">Série <strong>${echapperHtml(entete.serieLettre)}</strong><br>Mêmes questions, même barème</span></div>
<div class="identite-am"><span>Nom <span class="champ"></span></span><span>Classe <span class="champ" style="width:2.5cm"></span></span><span>N° <span class="champ" style="width:1.2cm"></span></span><span>${echapperHtml(dateEnToutesLettres(entete.date))}</span></div>
${consignesExamenHtml(entete, examen, items)}`;
  let i = 0;
  let pages = "";
  for (const partie of partiesDuDocument(examen, items)) {
    partie.questions.forEach(({ element: item, numero }, k) => {
      const corps = corpsQuestionHtml(item, pointsParSousQuestion(item));
      const question = `<section class="q-am"><h2><span>Question ${numero}${etiquetteHtml(examen, item)}</span><span class="pts">${pointsTexte(item.points)}</span></h2><div class="enonce-am">${corps}</div></section>`;
      pages += `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${k === 0 ? ouverturePartieHtml(examen, partie) : ""}${question}`;
      i++;
    });
  }
  const police = "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif";
  const css = `${stylePied(entete.serieLettre, police, "10pt")}${styleEnteteCourant(enteteCourantExamen(entete, examen), entete.serieLettre, police, "10pt")}`;
  const doc = documentHtml(`${titre} — ${examen.session} — Version aménagée`, `${pages}${annexesHtml(annexes)}`, `${STYLE_AMENAGE}${STYLE_EXAMEN}${STYLE_EXAMEN_AMENAGE}`, cssKatex, "amenagee", css);
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}

/* ----------------------------------------------------------------------------------------------
 * Version aménagée (feuille d'exercices et évaluation)
 * -------------------------------------------------------------------------------------------- */

/** Question de la version aménagée : EXACTEMENT l'énoncé de la version normale (énoncé, consigne
 * globale, vraies questions d'un problème avec leurs points) — jamais découpé en étapes (décision de
 * l'utilisateur : l'aménagement porte sur la mise en page, pas sur le contenu). */
function questionAmenageeHtml(item: ItemEvaluation, numero: number, estExercice: boolean): string {
  const titre = estExercice ? `Exercice ${numero} ${niveauHtml(item)}` : `Question ${numero}`;
  const corps = corpsQuestionHtml(item, estExercice ? undefined : pointsParSousQuestion(item));
  return `<section class="q-am"><h2><span>${titre}</span>${estExercice ? "" : `<span class="pts">${pointsTexte(item.points)}</span>`}</h2><div class="enonce-am">${corps}</div></section>`;
}

/** Version aménagée : JAMAIS en deux colonnes (décision de l'utilisateur), même avec la case
 * « Économie de papier ». Évaluation : même encadré « Consignes » et même pied de page que la copie ;
 * annexes (formulaire…) en fin de document, dans les deux modes. */
export async function genererVersionAmenagee(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  if (entete.examen && entete.mode !== "exercice") return genererExamenAmenage(entete, entete.examen, items, annexes);
  const cssKatex = await obtenirCssKatexAutonome();
  const estExercice = entete.mode === "exercice";
  const titre = estExercice ? titreNettoye(entete) : titreEvaluation(entete);
  const droite = estExercice ? "Mêmes exercices,<br>mise en page adaptée" : `Série <strong>${echapperHtml(entete.serieLettre)}</strong><br>Mêmes questions, même barème`;
  const tete = `<div class="tete-am"><div><span class="surtitre" style="color:#1d5b8f;font-weight:700">Version aménagée${estExercice ? " · Feuille d'exercices" : ""}</span><h1>${echapperHtml(titre)}</h1></div><span class="droite">${droite}</span></div>
<div class="identite-am"><span>Nom <span class="champ"></span></span><span>Classe <span class="champ" style="width:2.5cm"></span></span><span>N° <span class="champ" style="width:1.2cm"></span></span><span>${echapperHtml(dateEnToutesLettres(entete.date))}</span></div>
${estExercice ? "" : consignesHtml(entete, items)}`;
  const pages = itemsNumerotes(items)
    .map(({ item, numero }, i) => `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${questionAmenageeHtml(item, numero, estExercice)}`)
    .join("");
  const police = "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif";
  const doc = documentHtml(`${titre} — Version aménagée`, `${pages}${annexesHtml(annexes)}`, STYLE_AMENAGE, cssKatex, "amenagee", stylePied(estExercice ? null : entete.serieLettre, police, "10pt"));
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}
