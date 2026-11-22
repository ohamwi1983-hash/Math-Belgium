import type { BaremeExercice, BlocCorrection, CritereBareme, EtapeCorrection, FragmentConsigne, LigneCalcul, SectionExercice } from "./genererFeuilleExercices";
import { blocsDeColonnes, colonnesReponses, largeurColonneTableau, largeurFragments, largeurLibelleBloc, largeurLibelleTableau, segmentsDuGroupe, type TableauGroupe } from "./grilleCorrection";
import { decouperLigneCalcul, estLignePiege } from "./corrigeTableau";
import { LIBELLE_CATEGORIE, categorieDuNiveau, morceauxLegende, rangCategorie, type CategorieNiveau } from "./niveauDifficulte";
import { blocCorrectionHtml, echapperHtml, fragmentsEnteteHtml, fragmentsVersHtml, grillesLisiblesAImpression } from "./genererFeuilleExercicesHtml";
import { obtenirCssKatexAutonome } from "./katexImage";
import { qrCodeSvg } from "./qrSvg";
import { cartoucheEffectif, morceauxSurtitre, type CartoucheEcole } from "./cartouche";
import { CSS_VARIABLES_PROCESSUS } from "./couleursProcessus";
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
  /** Niveau de difficulté 1–7 et sa catégorie (grille commune, `niveauDifficulte.ts`), affichés
   * « numéro · catégorie » en tête de l'exercice (feuille d'exercices et sa version aménagée). */
  niveau?: number;
  categorie?: CategorieNiveau;
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
  /** Question REGROUPÉE a), b), c) (`AdaptateurFeuilleExercices.regroupement`) : une ligne par
   * instance, chacune avec son item complet (points, niveau, code `?code=`, réponse brève, corrigé
   * « comme au tableau » avec ses propres étapes, barème). `section` porte alors la consigne commune
   * (`enteteFragments`) et une question par ligne ; `bareme` réunit les critères des lignes, rattachés
   * à la lettre de leur ligne (`pointsParSousQuestion` redonne les points de chaque ligne). */
  groupe?: LigneGroupe[];
}

/** Une ligne d'une question regroupée a), b), c). */
export interface LigneGroupe {
  /** Les données de l'instance (« x² − 40 = 0 », « f(x) = … », « cercle d'équation … »). */
  enonce: FragmentConsigne[];
  /** Figure propre à la ligne (lot des générateurs à graphique). */
  figureHtml?: string;
  /** Item complet de l'instance (énoncé papier, corrigé, barème, niveau, code…). */
  item: ItemEvaluation;
}

/** Points de chaque ligne d'une question regroupée, tels que la copie et la grille les impriment
 * (répartition du barème du groupe, `pointsParSousQuestion`). */
export function pointsDesLignes(item: ItemEvaluation): number[] {
  const parLettre = pointsParSousQuestion(item);
  return (item.groupe ?? []).map((l, i) => parLettre.get(LETTRES[i] ?? String(i + 1)) ?? l.item.points);
}

/** École, adresse et professeur du cartouche : profil du professeur connecté et école choisie dans
 * le panneau (`EnteteEvaluation.cartouche`) ; sans eux, valeurs historiques (`cartouche.ts`,
 * `CARTOUCHE_DEFAUT` : rendu identique à avant les comptes). Textes saisis : toujours échappés. */
function surtitreCartoucheHtml(entete: EnteteEvaluation): string {
  return morceauxSurtitre(cartoucheEffectif(entete.cartouche), `Mathématiques ${entete.heuresSemaine}h/sem`).map(echapperHtml).join(" · ");
}

/** « · adresse » en fin de ligne méta (rien si l'école n'a pas d'adresse). */
function adresseCartoucheHtml(entete: EnteteEvaluation): string {
  const adresse = cartoucheEffectif(entete.cartouche).ecoleAdresse;
  return adresse ? ` · ${echapperHtml(adresse)}` : "";
}

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
  /** École, adresse et nom du professeur (comptes professeurs). Absent : valeurs historiques. */
  cartouche?: CartoucheEcole;
  /** Document « Examen » (maquette X3) : présent seulement pour un examen — l'évaluation est rendue
   * exactement comme avant quand il est absent. Points des items DÉJÀ mis à l'échelle si le total
   * est fixé (`evaluationLocal.ts::itemsDuDocument`). */
  examen?: ExamenDocument;
  /** Consignes supplémentaires d'une ÉVALUATION (une par ligne non vide, `$…$` en KaTeX), en puces
   * dans l'encadré « Consignes » de la copie et de l'aménagée. Absent ou vide : copie identique à
   * avant. L'examen garde les siennes dans `examen.consignesSupplementaires`. */
  consignesSupplementaires?: string[];
  /** ÉVALUATION BLANCHE (parcours élève, `lib/compositionEleve.ts`) : présentation d'une évaluation
   * (durée et points INDICATIFS, « sans valeur de note »), QR code par question, corrigé détaillé À LA
   * FIN du même document ; ni corrigé séparé, ni grille, ni série. Absent : évaluation rendue
   * exactement comme avant. `dureeConseillee` : durée imprimée (min) ; `repartition` : parts entre
   * les compétences (texte prêt, `compositionEleve.ts::texteRepartitionBlanche`), sous la durée. */
  blanche?: { dureeConseillee: number; repartition?: string };
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
/** Nom d'une compétence écrit dans SA couleur (encre de `couleursProcessus.ts` : sarcelle, bleu, bordeaux). */
function nomProcessusHtml(p: 1 | 2 | 3, nom: string = NOM_PROCESSUS[p]): string {
  return `<span class="np${p}">${echapperHtml(nom)}</span>`;
}
/** Compétence d'une partie d'examen organisée par processus (`processus:<n>`), sinon `null`. */
function processusDePartie(partie: { cle: string }): 1 | 2 | 3 | null {
  const m = /^processus:([123])$/.exec(partie.cle);
  return m ? (Number(m[1]) as 1 | 2 | 3) : null;
}
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
:root { --encre: #1b1d22; --gris: #4a4f58; --filet: #b9bec7; --accent: #1d5b8f; --fond-doux: #eef3f8; --alerte: #9a3b12; --bon: #2f6b3a; ${CSS_VARIABLES_PROCESSUS} }
/* Compétences : 1 Connaître vert sarcelle, 2 Appliquer bleu franc, 3 Transférer rouge bordeaux (couleursProcessus.ts). */
.np1 { color: var(--proc1-encre); } .np2 { color: var(--proc2-encre); } .np3 { color: var(--proc3-encre); }
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
 * vérifie » et corrigé détaillé forment UN document) et son aménagée : le nom du professeur à
 * gauche (`professeur`, décision de l'utilisateur ; « M. Hamwi » par défaut pour un visiteur), « page
 * n / N » à droite. Firefox ignore les boîtes de marge : la page s'imprime alors sans pied, jamais
 * bloquant. */
function stylePied(serieLettre: string | null, police: string, taille = "8.5pt", avecNom = true, professeur = ""): string {
  const commun = `font-family: ${police}; font-size: ${taille}; color: #333; vertical-align: middle;`;
  const serie = (serieLettre ?? "").replace(/["\\]/g, "");
  const prof = professeur.replace(/["\\]/g, "");
  const gauche = !serieLettre
    ? prof
      ? `@bottom-left { content: "${prof}"; ${commun} text-align: left; }`
      : ""
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
/* Ligne d'un groupe a), b), c) en colonne étroite : le numéro seul (case teintée, mot dans l'aria-label
   et dans la plage « niv. 1–2 · très facile à facile » en tête) — « · très facile » mangeait la place
   des données et les faisait passer sur trois lignes. */
.deux-colonnes .ligne-niveau .mot { display: none; }
`;

/** Questions regroupées a), b), c) — ajouté au document SEULEMENT s'il en contient (un document sans
 * groupe reste identique, octet pour octet, à ce qu'il était avant le regroupement). Une ligne par
 * exercice : lettre, données, puis à droite ses points (copie) ou son niveau et son QR code
 * (feuille). Une ligne ne se coupe jamais ; le groupe peut se couper entre deux lignes, la consigne
 * reste avec la première. */
const STYLE_GROUPES = `
.groupe .entete, .groupe .ex-tete { break-after: avoid; page-break-after: avoid; }
.lignes-groupe { margin: 3px 0 0; }
.ligne-g { display: flex; align-items: baseline; gap: 10px; padding: 3px 0; break-inside: avoid; page-break-inside: avoid; }
.ligne-g > .lettre-g { flex: none; font-weight: 700; min-width: 1.3em; }
.ligne-g > .ligne-texte { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.ligne-g > .pts { flex: none; white-space: nowrap; min-width: 3.2em; text-align: right; }
.ligne-g > .ligne-niveau, .ligne-g > .qr-ligne { flex: none; align-self: center; }
.ligne-g > .qr-ligne { display: flex; flex-direction: column; align-items: center; gap: 1px; width: 1.9cm; font-family: Archivo, Arial, Helvetica, sans-serif; font-size: 7pt; font-weight: 700; letter-spacing: 0.04em; line-height: 1.1; color: var(--encre); }
.ligne-g > .qr-ligne svg { width: 56px; height: 56px; }
.ex.groupe .ligne-g { align-items: center; padding: 4px 0; }
.ex.groupe .ligne-g + .ligne-g { border-top: 1px dotted var(--filet); }
.legende-qr { text-align: right; font-family: Archivo, Arial, Helvetica, sans-serif; font-size: 7pt; color: var(--gris); line-height: 1.2; margin: -2px 0 1px; break-after: avoid; page-break-after: avoid; }
.figure-ligne { margin-top: 4px; }
.figure-commune { margin: 4px 0 6px; break-inside: avoid; page-break-inside: avoid; }
.ligne-corr { margin: 10px 0 3px; font-weight: 600; break-after: avoid; page-break-after: avoid; }
.corr-ligne .etape-titre { break-after: avoid; page-break-after: avoid; }
.corr-ligne:first-child .ligne-corr { margin-top: 2px; }
.corr:has(.corr-ligne) { break-inside: auto; }
.carte .lettre-carte { text-transform: none; }
/* Deux colonnes : un bloc qui peut se couper ENTRE deux lignes quand il est plus haut que la colonne
   (un inline-block ne se coupe jamais). */
.deux-colonnes > .groupe { display: block; }
.deux-colonnes .ligne-g > .qr-ligne { width: 1.6cm; font-size: 6.5pt; }
.deux-colonnes .ligne-g > .qr-ligne svg { width: 52px; height: 52px; }
/* Version aménagée : lignes bien espacées. */
.q-am .ligne-g { padding: 9px 0; }
.q-am .ligne-g + .ligne-g { border-top: 1px dotted var(--filet); }
`;

/** Groupes à GRAPHIQUE (une figure par ligne) — ajouté SEULEMENT si le document en contient un (les
 * documents du premier lot de regroupements restent identiques). Rangées insécables (aucune figure
 * coupée), deux cellules par rangée (`.paire`) ou une ; la figure se réduit au besoin à sa cellule
 * (réduction uniforme : les valeurs à lire restent sur les lignes du quadrillage). Deux colonnes :
 * une cellule par rangée dans la colonne (la figure trop large passe en pleine largeur avec tout le
 * groupe, `classeLargeur`). */
const STYLE_GROUPES_FIGURES = `
.ex.groupe:has(.lignes-fig), .question.groupe:has(.lignes-fig) { break-inside: auto; page-break-inside: auto; }
.debut-groupe, .debut-groupe > .entete { break-inside: avoid; page-break-inside: avoid; }
.lignes-fig { margin: 4px 0 0; }
.lignes-fig.suite { margin: 0; }
.lignes-fig.suite > .rang-fig:first-child { border-top: 1px dotted var(--filet); }
.rang-fig { display: flex; gap: 16px; align-items: flex-start; padding: 5px 0; break-inside: avoid; page-break-inside: avoid; }
.rang-fig + .rang-fig { border-top: 1px dotted var(--filet); }
.rang-fig > .cell-fig { flex: 1 1 0; min-width: 0; }
.rang-fig.paire > .cell-fig { flex: 0 0 calc(50% - 8px); }
.cell-fig { break-inside: avoid; page-break-inside: avoid; }
.cell-tete { display: flex; align-items: baseline; gap: 8px; }
.cell-tete > .lettre-g { flex: none; font-weight: 700; min-width: 1.3em; }
.cell-tete > .ligne-texte { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.cell-tete > .pts, .cell-tete > .ligne-niveau { flex: none; margin-left: auto; white-space: nowrap; }
.cell-corps { display: flex; align-items: flex-start; gap: 8px; margin-top: 3px; }
.cell-corps > .figure-ligne { flex: 0 1 auto; min-width: 0; margin: 0; }
.cell-corps svg[viewBox]:not(.katex svg):not(.qr) { max-width: 100%; height: auto; }
.cell-corps > .qr-ligne { flex: none; margin-left: auto; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 58px; font-family: Archivo, Arial, Helvetica, sans-serif; font-size: 7pt; font-weight: 700; letter-spacing: 0.04em; line-height: 1.1; color: var(--encre); }
.cell-corps > .qr-ligne svg { width: 56px; height: 56px; }
.deux-colonnes > .groupe.figures-multiples:not(.pleine-largeur):has(.lignes-fig.une-par-ligne) { column-span: none; }
.deux-colonnes > .groupe:not(.pleine-largeur) .rang-fig.paire { display: block; }
.deux-colonnes > .groupe:not(.pleine-largeur) .rang-fig.paire > .cell-fig + .cell-fig { border-top: 1px dotted var(--filet); margin-top: 5px; padding-top: 5px; }
.deux-colonnes .cell-corps > .qr-ligne svg { width: 52px; height: 52px; }
.q-am .rang-fig { padding: 9px 0; }
`;

/** CSS des groupes, seulement si le document en a un (et celle des groupes à graphique, seulement
 * s'il en a un). */
function styleGroupes(items: ItemEvaluation[]): string {
  const groupes = items.filter((it) => it.groupe && it.groupe.length > 0);
  if (groupes.length === 0) return "";
  return groupes.some((it) => it.groupe!.some((l) => l.figureHtml)) ? `${STYLE_GROUPES}${STYLE_GROUPES_FIGURES}` : STYLE_GROUPES;
}

const STYLE_FEUILLE = `
.tete { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding-bottom: 10px; border-bottom: 2px solid var(--encre); }
.tete h1 { font-size: 22pt; font-weight: 600; line-height: 1.15; }
.tete .sous { color: var(--gris); }
.identite { display: grid; grid-template-columns: auto 4.4cm; column-gap: 8px; row-gap: 5px; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); padding-top: 3px; }
.identite .champ { border-bottom: 1px solid #8a8f98; }
.identite .valeur { color: var(--encre); }
.legende { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 10px 0 4px; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.legende .droite { margin-left: auto; }
/* Niveau de difficulté « numéro · mot » (« 4 · difficile ») : le MOT porte l'information (lisible en
   noir et blanc) ; la case du numéro est teintée sur une échelle graduée à 5 pas (très facile → très
   difficile), du plus clair au plus foncé — un simple appoint, qui reste ordonné en niveaux de gris. */
.niveau { display: inline-flex; align-items: center; gap: 1px; font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 700; color: var(--encre); line-height: 1.35; white-space: nowrap; vertical-align: middle; }
.niveau .num { border: 1.4px solid var(--encre); border-radius: 3px; padding: 0 5px; }
.niveau .mot { font-weight: 600; }
.niveau .num { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.niveau.niv-c1 .num { background: #e7f3ea; color: #1b1d22; }
.niveau.niv-c2 .num { background: #efe0a0; color: #1b1d22; }
.niveau.niv-c3 .num { background: #eab06a; color: #1b1d22; }
.niveau.niv-c4 .num { background: #b55a2e; color: #fff; border-color: #b55a2e; }
.niveau.niv-c5 .num { background: #8f2d2b; color: #fff; border-color: #8f2d2b; }
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
.bloc-processus.p1 { border-bottom-color: var(--proc1); } .bloc-processus.p1 h2 { color: var(--proc1-encre); }
.bloc-processus.p2 { border-bottom-color: var(--proc2); } .bloc-processus.p2 h2 { color: var(--proc2-encre); }
.bloc-processus.p3 { border-bottom-color: var(--proc3); } .bloc-processus.p3 h2 { color: var(--proc3-encre); }
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
.niveau { display: inline-flex; align-items: center; gap: 2px; margin-left: 8px; font-size: 11pt; font-weight: 700; color: var(--encre); line-height: 1.35; white-space: nowrap; vertical-align: middle; }
.niveau .num { border: 1.6px solid var(--encre); border-radius: 3px; padding: 0 6px; }
.niveau .mot { font-weight: 600; }
.niveau .num { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.niveau.niv-c1 .num { background: #e7f3ea; color: #1b1d22; }
.niveau.niv-c2 .num { background: #efe0a0; color: #1b1d22; }
.niveau.niv-c3 .num { background: #eab06a; color: #1b1d22; }
.niveau.niv-c4 .num { background: #b55a2e; color: #fff; border-color: #b55a2e; }
.niveau.niv-c5 .num { background: #8f2d2b; color: #fff; border-color: #8f2d2b; }
.enonce-am { padding: 10px 14px; background: var(--fond-doux); border-radius: 8px; margin-bottom: 12px; }
.enonce-am .entete + p, .enonce-am p { margin: 0.5em 0; }
.identite-am { display: flex; flex-wrap: wrap; gap: 6px 24px; font-size: 11pt; color: var(--gris); margin-bottom: 10px; }
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
function corpsQuestionHtml(item: ItemEvaluation, pointsSousQ?: Map<string, number>, feuille?: OptionsLignes): string {
  if (item.groupe && item.groupe.length > 0) return corpsGroupeHtml(item, item.groupe, !!pointsSousQ, feuille);
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

/** Options des lignes d'une question regroupée : `numero` (libellé du QR code), QR code par ligne,
 * niveau par ligne (absent = affiché, comme dans la feuille d'exercices ; l'évaluation blanche le
 * masque). */
interface OptionsLignes {
  numero: number;
  qr: boolean;
  niveau?: boolean;
}

/** Plage de niveaux d'une question regroupée (« 2–4 ») et ses catégories extrêmes. */
function plageNiveaux(lignes: LigneGroupe[]): { min: number; max: number } | null {
  const avec = lignes.filter((l) => l.item.niveau !== undefined);
  if (avec.length === 0) return null;
  const n = avec.map((l) => l.item.niveau!);
  return { min: Math.min(...n), max: Math.max(...n) };
}

/** Badge « numéro · mot » d'un niveau 1–7 (« 4 · difficile ») : case du numéro teintée par catégorie
 * (`niv-c1` … `niv-c5`), mot en clair. `seul` : sans le mot (jamais utilisé sur papier aujourd'hui). */
function badgeNiveau(niveau: number, classe = ""): string {
  const c = categorieDuNiveau(niveau);
  const mot = LIBELLE_CATEGORIE[c];
  return `<span class="niveau niv-c${rangCategorie(c)}${classe ? ` ${classe}` : ""}" aria-label="niveau ${niveau} sur 7 : ${mot}"><span class="num">${niveau}</span><span class="mot">&nbsp;· ${mot}</span></span>`;
}

/** Corps d'une question REGROUPÉE a), b), c) : la consigne commune une fois, puis une ligne par
 * instance — lettre, données (et figure), et à droite : ses points (évaluation) ou, dans la feuille
 * d'exercices, son niveau et son QR code « Refaire en ligne » (chaque ligne rouvre SON exercice, code
 * écrit dessous). Une ligne ne se coupe jamais ; le groupe peut se couper ENTRE deux lignes (la
 * consigne reste avec la première). */
function corpsGroupeHtml(item: ItemEvaluation, lignes: LigneGroupe[], avecPoints: boolean, feuille?: OptionsLignes): string {
  if (lignes.some((l) => l.figureHtml)) return corpsGroupeFiguresHtml(item, lignes, avecPoints, feuille);
  const points = avecPoints ? pointsDesLignes(item) : [];
  const rangs = lignes
    .map((l, i) => {
      const lettre = lettreCle(i);
      const figure = l.figureHtml ? `<div class="figure-ligne">${l.figureHtml}</div>` : "";
      const pts = avecPoints ? `<span class="pts">${pointsTexte(points[i])}</span>` : "";
      const niveau = feuille && feuille.niveau !== false && l.item.niveau ? badgeNiveau(l.item.niveau, "ligne-niveau") : "";
      const qr =
        feuille?.qr && l.item.code
          ? `<span class="qr-ligne">${qrCodeSvg(l.item.code.url, 56, `QR code : refaire l'exercice ${feuille.numero} ${lettre}) en ligne`)}<span class="code">${echapperHtml(l.item.code.code)}</span></span>`
          : "";
      return `<div class="ligne-g"><span class="lettre-g">${lettre})</span><div class="ligne-texte">${fragmentsVersHtml(l.enonce)}${figure}</div>${pts}${niveau}${qr}</div>`;
    })
    .join("");
  const entete = item.section.enteteFragments ? `<div class="entete">${fragmentsEnteteHtml(item.section.enteteFragments)}</div>` : "";
  // Figure commune à toutes les lignes (gen27 : le même hexagone) : une seule fois, sous la consigne.
  const figureCommune = item.section.enteteHtml ? `<div class="figure-commune">${item.section.enteteHtml}</div>` : "";
  const legende = feuille?.qr && lignes.some((l) => l.item.code) ? `<div class="legende-qr">QR code de chaque ligne : refaire en ligne, avec les aides</div>` : "";
  return `${entete}${figureCommune}<div class="lignes-groupe">${legende}${rangs}</div>`;
}

/* ----------------------------------------------------------------------------------------------
 * Groupes à GRAPHIQUE (une figure par ligne, décision de l'utilisateur : « graphiques côte à côte »)
 * -------------------------------------------------------------------------------------------- */

/** Largeur au-delà de laquelle deux figures ne tiennent plus côte à côte (px, largeur d'origine,
 * même mesure que `largeurFigureMax`). Largeur imprimable A4 : 680 px, deux cellules de 332 px
 * (écart 16 px). Copie, corrigé, aménagée (cadre de 14 px de marge : 318 px par cellule) : la figure
 * occupe toute sa cellule → 316 px. Feuille d'exercices : le QR code de la ligne (58 px + 8 px)
 * prend place à droite de la figure → 266 px. Au-delà, une figure par rangée. */
export const SEUIL_DEUX_FIGURES = 316;
export const SEUIL_DEUX_FIGURES_QR = 266;

/** Figures d'une ligne de groupe : nombre et plus grande largeur d'origine (px). Comme
 * `largeurFigureMax` (attribut `width`, sinon `viewBox`), mais une figure à largeur relative
 * (`width="100%"`, croquis de 5gen12, graphes de 5gen4) est mesurée à sa `viewBox` ; les SVG
 * internes de KaTeX (largeur en `em`, `preserveAspectRatio="… slice"`) et les QR codes ne comptent pas. */
export function mesureFiguresLigne(html: string | undefined): { nombre: number; largeur: number } {
  if (!html) return { nombre: 0, largeur: 0 };
  let nombre = 0;
  let largeur = 0;
  for (const m of html.matchAll(/<svg\b[^>]*>/g)) {
    const balise = m[0];
    if (/\swidth="[\d.]+em"/.test(balise) || /preserveAspectRatio="[^"]*slice/.test(balise) || /\sclass="qr"/.test(balise)) continue;
    nombre++;
    const w = /\swidth="([\d.]+)(px)?"/.exec(balise);
    const vb = /viewBox="[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)/.exec(balise);
    const l = w ? Number(w[1]) : vb ? Number(vb[1]) : 0;
    if (l > largeur) largeur = l;
  }
  return { nombre, largeur };
}

/** Rangées d'un groupe à graphique (indices des lignes) : DEUX figures par rangée quand chaque ligne
 * a au plus une figure, toutes assez petites (`seuil`) ; sinon une ligne par rangée. Une ligne dont
 * la « figure » n'est qu'un bloc de texte (liste de conditions de gen71, transformations de gen72 :
 * aucune figure SVG) a une largeur inconnue : une par rangée. Partagé par le HTML et le Word. */
export function rangsDesFigures(lignes: LigneGroupe[], seuil: number): number[][] {
  const mesures = lignes.map((l) => ({ html: !!l.figureHtml, ...mesureFiguresLigne(l.figureHtml) }));
  const paires = lignes.length > 1 && mesures.every((m) => !m.html || (m.nombre === 1 && m.largeur > 0 && m.largeur <= seuil));
  const rangs: number[][] = [];
  lignes.forEach((_, i) => {
    if (paires && i % 2 === 1) rangs[rangs.length - 1].push(i);
    else rangs.push([i]);
  });
  return rangs;
}

/** Suffixe d'identifiants SVG propre à une ligne de groupe : le code `?code=` de l'instance (unique
 * dans un document), sinon une empreinte de la figure, puis la lettre de la ligne. */
function suffixeLigne(l: LigneGroupe, i: number, sorte: "e" | "c"): string {
  const base = l.item.code ? l.item.code.code.replace(/[^A-Za-z0-9_-]/g, "") : empreinte(l.figureHtml ?? "");
  return `-${sorte}${base}${lettreCle(i)}`;
}

function empreinte(texte: string): string {
  let h = 2166136261;
  for (let i = 0; i < texte.length; i++) h = Math.imul(h ^ texte.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

/** Identifiants SVG (`id`, `url(#…)`, `href="#…"`) rendus uniques par un suffixe : deux figures du
 * même générateur dans un groupe (identifiant dérivé du contenu, compteur, constante) ne se
 * marchent jamais dessus, ni l'énoncé et le corrigé de la même ligne. Seuls les identifiants
 * DÉFINIS dans le fragment sont renommés. */
export function identifiantsUniques(html: string, suffixe: string): string {
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  if (ids.size === 0) return html;
  return html
    .replace(/(\sid=")([^"]+)(")/g, (_t, a: string, id: string, b: string) => `${a}${id}${suffixe}${b}`)
    .replace(/url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g, (t, q: string, id: string) => (ids.has(id) ? `url(${q}#${id}${suffixe}${q})` : t))
    .replace(/((?:xlink:)?href=")#([^"]+)"/g, (t, a: string, id: string) => (ids.has(id) ? `${a}#${id}${suffixe}"` : t));
}

/** Corps d'un groupe à GRAPHIQUE : la consigne commune une fois, puis une cellule par ligne — en tête
 * la lettre, la courte donnée éventuelle et, à droite, ses points (copie) ou son niveau (feuille) ;
 * dessous la figure (identifiants rendus uniques) et, dans la feuille, le QR code de la ligne à droite
 * de la figure. Deux cellules par rangée quand les figures sont assez petites (`rangsDesFigures`).
 * Une rangée ne se coupe jamais (aucune figure coupée entre deux pages) ; la consigne reste avec la
 * première rangée. */
function corpsGroupeFiguresHtml(item: ItemEvaluation, lignes: LigneGroupe[], avecPoints: boolean, feuille?: OptionsLignes): string {
  const points = avecPoints ? pointsDesLignes(item) : [];
  const cellule = (i: number) => {
    const l = lignes[i];
    const lettre = lettreCle(i);
    const texte = l.enonce.length > 0 ? `<span class="ligne-texte">${fragmentsVersHtml(l.enonce)}</span>` : "";
    const pts = avecPoints ? `<span class="pts">${pointsTexte(points[i])}</span>` : "";
    const niveau = feuille && feuille.niveau !== false && l.item.niveau ? badgeNiveau(l.item.niveau, "ligne-niveau") : "";
    const qr =
      feuille?.qr && l.item.code
        ? `<span class="qr-ligne">${qrCodeSvg(l.item.code.url, 56, `QR code : refaire l'exercice ${feuille.numero} ${lettre}) en ligne`)}<span class="code">${echapperHtml(l.item.code.code)}</span></span>`
        : "";
    const figure = l.figureHtml ? `<div class="figure-ligne">${identifiantsUniques(l.figureHtml, suffixeLigne(l, i, "e"))}</div>` : "";
    return `<div class="cell-fig"><div class="cell-tete"><span class="lettre-g">${lettre})</span>${texte}${pts}${niveau}</div>${figure || qr ? `<div class="cell-corps">${figure}${qr}</div>` : ""}</div>`;
  };
  const disposition = rangsDesFigures(lignes, feuille?.qr ? SEUIL_DEUX_FIGURES_QR : SEUIL_DEUX_FIGURES);
  // Deux par rangée : une dernière ligne seule garde la largeur d'une demi-rangée (classe `.paire`).
  const paires = disposition.some((r) => r.length > 1);
  const rangs = disposition.map((r) => `<div class="rang-fig${paires ? " paire" : ""}">${r.map(cellule).join("")}</div>`);
  const entete = item.section.enteteFragments ? `<div class="entete">${fragmentsEnteteHtml(item.section.enteteFragments)}</div>` : "";
  const legende = feuille?.qr && lignes.some((l) => l.item.code) ? `<div class="legende-qr">QR code de chaque ligne : refaire en ligne, avec les aides</div>` : "";
  // Au plus une figure par ligne : en deux colonnes, le groupe reste DANS la colonne (une cellule par
  // rangée) même à trois figures ou plus — seule une ligne à plusieurs graphiques (6gen5) prend la largeur.
  const uneParLigne = lignes.every((l) => mesureFiguresLigne(l.figureHtml).nombre <= 1);
  const classe = `lignes-groupe lignes-fig${uneParLigne ? " une-par-ligne" : ""}`;
  // Début insécable : (titre, inséré par `avecTete`) + consigne + première rangée — jamais un titre ni
  // une consigne seuls en bas de page ou de colonne (l'équilibrage des colonnes ignorait `break-after`).
  const suite = rangs.length > 1 ? `<div class="${classe} suite">${rangs.slice(1).join("")}</div>` : "";
  return `<div class="debut-groupe">${entete}<div class="${classe}">${legende}${rangs[0] ?? ""}</div></div>${suite}`;
}

const DEBUT_GROUPE = `<div class="debut-groupe">`;

/** Titre d'une question (« Exercice 3 », « Question 3 » et ses points, bandeau de processus…) suivi de
 * son corps : pour un groupe à graphique, le titre entre dans le début insécable du groupe ; sinon,
 * simple concaténation (rendu inchangé). */
function avecTete(tete: string, corps: string): string {
  const i = corps.indexOf(DEBUT_GROUPE);
  if (i < 0) return `${tete}${corps}`;
  const j = i + DEBUT_GROUPE.length;
  return `${corps.slice(0, j)}${tete}${corps.slice(j)}`;
}

/** Largeur (px) de la plus large figure SVG d'un fragment HTML (attribut `width`, sinon `viewBox`). */
/** Balises ouvrantes des FIGURES SVG d'un fragment HTML — sans les SVG internes de KaTeX (racines,
 * flèches, accolades : largeur en `em` ou en `%`), qui ne sont pas des figures (une question à trois
 * racines carrées passait pour une question « à trois figures »). */
function balisesFigures(corpsHtml: string): string[] {
  // Les QR codes « Refaire en ligne » des lignes d'un groupe (`class="qr"`) ne sont pas des figures.
  return [...corpsHtml.matchAll(/<svg\b[^>]*>/g)].map((m) => m[0]).filter((balise) => !/\swidth="[\d.]+(em|%)"/.test(balise) && !/\sclass="qr"/.test(balise));
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
  return `<div class="consignes"><b class="titre">Consignes</b> — ${echapperHtml(TEXTE_CONSIGNES)}${calculatrice}${duree}${consignesSupplementairesHtml(entete.consignesSupplementaires ?? [])}</div>`;
}

/** Une puce par consigne supplémentaire (texte échappé, `$…$` en KaTeX) — examen ET évaluation. */
function consignesSupplementairesHtml(lignes: string[]): string {
  return lignes.length ? `<ul class="sup">${lignes.map((l) => `<li>${fragmentsVersHtml(fragmentsConsigne(l))}</li>`).join("")}</ul>` : "";
}

/** CSS des puces de consignes supplémentaires d'une ÉVALUATION (l'examen les a dans `STYLE_EXAMEN`),
 * ajoutée SEULEMENT quand il y en a : une copie sans consigne supplémentaire reste identique. */
const STYLE_CONSIGNES_SUP = `
.consignes ul.sup { margin: 3px 0 0; padding-left: 1.3em; }
.consignes ul.sup li { margin: 1px 0; }
`;

function styleConsignesSup(entete: EnteteEvaluation): string {
  return !entete.examen && entete.consignesSupplementaires?.length ? STYLE_CONSIGNES_SUP : "";
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
  if (item.groupe && item.groupe.length > 0) {
    // Question regroupée : une sous-partie par ligne (« a) » et son énoncé rappelé), puis le corrigé
    // « comme au tableau » de l'instance avec SES étapes (« Étape 1 — … »).
    // Groupe à graphique : identifiants SVG du corrigé de chaque ligne (figure annotée) rendus uniques.
    const figures = item.groupe.some((l) => l.figureHtml) || !!item.section.enteteHtml;
    return item.groupe
      .map((l, i) => {
        const corrige = figures ? identifiantsUniques(correctionHtml(l.item), suffixeLigne(l, i, "c")) : correctionHtml(l.item);
        return `<div class="corr-ligne"><div class="ligne-corr"><span class="lettre-g">${lettreCle(i)})</span> ${fragmentsVersHtml(l.enonce)}</div>${corrige}</div>`;
      })
      .join("");
  }
  if (item.correctionDetaillee && item.correctionDetaillee.length > 0) {
    return item.etapesCorrige && item.correctionDetaillee.some((e) => e.etape !== undefined)
      ? etapesCorrigeParEtapeHtml(item, item.correctionDetaillee)
      : etapesCorrectionHtml(item.correctionDetaillee);
  }
  return `<div class="reponse-ancienne">${item.correction.map(blocCorrectionHtml).join("")}</div>`;
}

/** Badge « numéro · mot » (« 4 · difficile ») — rien si l'exercice n'a pas de niveau. Groupe : plage
 * « niv. 2–4 · facile à difficile » (une seule catégorie : « niv. 5–6 · très difficile » ; un seul
 * niveau : le badge ordinaire), case teintée par la catégorie du plus haut niveau. */
function niveauHtml(item: ItemEvaluation): string {
  if (item.groupe && item.groupe.length > 0) {
    const plage = plageNiveaux(item.groupe);
    if (!plage) return "";
    if (plage.min === plage.max) return badgeNiveau(plage.min);
    const a = LIBELLE_CATEGORIE[categorieDuNiveau(plage.min)];
    const b = LIBELLE_CATEGORIE[categorieDuNiveau(plage.max)];
    const mots = a === b ? a : `${a} à ${b}`;
    return `<span class="niveau niv-c${rangCategorie(categorieDuNiveau(plage.max))}" aria-label="niveaux ${plage.min} à ${plage.max} sur 7 : ${mots}"><span class="num">niv. ${plage.min}–${plage.max}</span><span class="mot">&nbsp;· ${mots}</span></span>`;
  }
  if (!item.niveau) return "";
  return badgeNiveau(item.niveau);
}

/** Légende de la feuille d'exercices : l'échelle (« Niveau : 1 très facile · 2 facile · 3 moyen ·
 * 4 difficile · 5 à 7 très difficile », numéros dans leur case teintée) et ce qui fait monter le niveau. */
const LEGENDE_NIVEAUX = `<span class="legende-niveaux">Niveau : ${morceauxLegende()
  .map((m) => `<span class="niveau niv-c${rangCategorie(m.categorie)}"><span class="num">${m.niveaux}</span><span class="mot">&nbsp;${m.mot}</span></span>`)
  .join(" · ")}. Il monte avec le nombre d'étapes, le choix de la méthode, un piège dans les données et les nombres (calculatrice, valeurs approchées).</span>`;

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

/** Nom du professeur imprimé sur la feuille d'exercices (en-tête et pied de page) : celui du profil
 * connecté, sinon « M. Hamwi » (`CARTOUCHE_DEFAUT`) — décision de l'utilisateur, la feuille est
 * publique et ses élèves s'en servent. */
function professeurFeuille(entete: EnteteEvaluation): string {
  return cartoucheEffectif(entete.cartouche).professeur;
}

function enteteFeuilleHtml(entete: EnteteEvaluation, sousTitre: string): string {
  const surtitre = entete.surtitre ?? entete.niveauLabel;
  const prof = professeurFeuille(entete);
  return `<header class="tete">
  <div><span class="surtitre">${echapperHtml(surtitre)}</span><h1>${echapperHtml(titreNettoye(entete))}</h1><span class="sous">${echapperHtml(sousTitre)}</span></div>
  <div class="identite"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>Date</span><span class="valeur">${echapperHtml(dateEnToutesLettres(entete.date))}</span>${prof ? `<span>Professeur</span><span class="valeur">${echapperHtml(prof)}</span>` : ""}</div>
</header>`;
}

function exerciceFeuilleHtml(item: ItemEvaluation, numero: number, deuxColonnes = false): string {
  // Étiquette « notion · compétence » : la compétence dans sa couleur (texte déjà échappé).
  const tag = [item.notion ? echapperHtml(item.notion) : "", nomProcessusHtml(item.processus)].filter(Boolean).join(" · ");
  if (item.groupe && item.groupe.length > 0) {
    // Question regroupée : plage de niveaux en tête, niveau et QR code PAR LIGNE (pas de QR global).
    const corps = corpsQuestionHtml(item, undefined, { numero, qr: true });
    const sansQr = corpsQuestionHtml(item);
    const tete = `<div class="ex-tete"><h3>Exercice ${numero}</h3>${niveauHtml(item)}${tag ? `<span class="tag">${tag}</span>` : ""}</div>`;
    // Groupe à graphique : le titre entre dans le début insécable du groupe (`avecTete`).
    if (corps.includes(DEBUT_GROUPE)) return `<section class="ex groupe${classeFigures(sansQr)}${classeLargeur(sansQr, deuxColonnes, 260)}">\n  <div class="ex-texte">${avecTete(tete, corps)}</div>\n</section>`;
    return `<section class="ex groupe${classeFigures(sansQr)}${classeLargeur(sansQr, deuxColonnes, 260)}">
  ${tete}
  <div class="ex-texte">${corps}</div>
</section>`;
  }
  const qr = item.code
    ? `<div class="qr-bloc">${qrCodeSvg(item.code.url, 66, `QR code : refaire l'exercice ${numero} en ligne`)}<span>Refaire en ligne<br>avec les aides</span><span class="code">code ${echapperHtml(item.code.code)}</span></div>`
    : "";
  const corps = corpsQuestionHtml(item);
  return `<section class="ex${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 260)}">
  <div class="ex-tete"><h3>Exercice ${numero}</h3>${niveauHtml(item)}${tag ? `<span class="tag">${tag}</span>` : ""}</div>
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
  // Une carte par exercice ; une question regroupée : une carte par LIGNE (« Exercice 3 a) »).
  const carte = (item: ItemEvaluation, titre: string) => `<div class="carte${reponseBreveLongue(item) ? " large" : ""}"><span class="num">${titre}</span>${reponseBreveHtml(item)}</div>`;
  const cartes = numerotes
    .map(({ item, numero }) => (item.groupe && item.groupe.length > 0 ? item.groupe.map((l, i) => carte(l.item, `Exercice ${numero} <span class="lettre-carte">${lettreCle(i)})</span>`)).join("") : carte(item, `Exercice ${numero}`)))
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

function pageCorrigeFeuilleHtml(numerotes: { item: ItemEvaluation; numero: number }[], libelle = "Exercice"): string {
  const blocs = numerotes
    .map(({ item, numero }) => `<section class="corr"><h3>${libelle} ${numero}${item.notion ? ` <span class="notion">— ${echapperHtml(item.notion)}</span>` : ""}</h3>${correctionHtml(item)}</section>`)
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
  const css = `${stylePied(null, "Archivo, Arial, sans-serif", "8.5pt", true, professeurFeuille(entete))}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}${styleGroupes(items)}`;
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
  <div class="g"><span class="surtitre">${surtitreCartoucheHtml(entete)}</span>
    <h1>${echapperHtml(titreEvaluation(entete))}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}</h1>
    <span class="meta">${echapperHtml(dateEnToutesLettres(entete.date))} · Série <strong>${echapperHtml(entete.serieLettre)}</strong>${duree}${adresseCartoucheHtml(entete)}</span></div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>N°</span><span class="champ"></span></div>
</div>`;
}

function resultatsHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const tetes = totaux.map((t) => `<th>${nomProcessusHtml(t.processus)}</th>`).join("");
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
    const bandeau = `<div class="bloc-processus p${groupe.processus}"><h2>Processus ${groupe.processus} — ${NOM_PROCESSUS[groupe.processus]}</h2><span class="pts">${pointsTexte(totalP)}</span></div>`;
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
      questions += `<section class="question${item.groupe ? " groupe" : ""}${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 380)}">${avecTete(`${deuxColonnes ? `${premiere ? bandeau : ""}${titre}` : ""}<div class="ligne-titre"><span class="num">Question ${numero}</span><span class="pts">${pointsTexte(item.points)}</span></div>`, corps)}${
        avecCorrection ? `<div class="correction-bloc">${correctionHtml(item)}</div>` : ""
      }</section>`;
      premiere = false;
    }
    html += questions;
  }
  return deuxColonnes ? `<div class="deux-colonnes">${html}</div>` : html;
}

/* ----------------------------------------------------------------------------------------------
 * Grille de correction (document professeur). Décision de l'utilisateur, plus rapide à utiliser :
 * A. page « Réponses » en tête (toutes les réponses finales, numérotées comme la copie, avec leurs
 *    points) ; B. question regroupée a), b), c) aux critères identiques → tableau critère × ligne
 *    (`grilleCorrection.ts::segmentsDuGroupe`) ; C. erreurs fréquentes et réponses acceptées en liste,
 *    une par ligne, le coût aligné à droite. CSS `STYLE_GRILLE` ajoutée à la SEULE grille : copie,
 *    corrigé, aménagée et feuille restent identiques.
 * -------------------------------------------------------------------------------------------- */

/** Largeur utile d'une question de la grille à l'impression (680 px moins les marges du bloc). */
const LARGEUR_GRILLE = 660;

const STYLE_GRILLE = `
.grille .rep-page { break-after: page; page-break-after: always; }
.grille .rep-titre { font-size: 13pt; font-weight: 600; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 6px 0 6px; padding-bottom: 3px; border-bottom: 1.5px solid var(--accent); }
.grille .rep-partie { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; font-family: Archivo, Arial, sans-serif; font-size: 9pt; font-weight: 700; color: var(--accent); margin: 10px 0 2px; break-after: avoid; page-break-after: avoid; }
.grille .rep-bloc { column-gap: 8mm; column-rule: 1px solid var(--filet); font-size: 10.5pt; }
.grille .rep-c2 { column-count: 2; }
.grille .rep-c3 { column-count: 3; }
.grille .rep-q { break-inside: avoid; page-break-inside: avoid; padding: 3px 0; border-bottom: 1px dotted var(--filet); }
.grille .rep-l { display: grid; grid-template-columns: 1.7em minmax(0, 1fr) auto; column-gap: 6px; align-items: baseline; }
.grille .rep-n { font-family: Archivo, Arial, sans-serif; font-size: 9.5pt; }
.grille .rep-lettre { text-align: right; font-weight: 600; }
.grille .rep-v { min-width: 0; overflow-wrap: anywhere; }
.grille .rep-p { font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 700; white-space: nowrap; }
.grille .rep-tete .rep-p { color: var(--gris); }
.grille .tab-g { width: 100%; table-layout: fixed; margin: 4px 0 0; font-size: 10pt; break-inside: avoid; page-break-inside: avoid; }
.grille .tab-g + .tab-g { margin-top: 6px; }
.grille .tab-g th, .grille .tab-g td { border: 1px solid var(--filet); padding: 2px 6px; vertical-align: top; text-align: left; }
.grille .tab-g th { font-family: Archivo, Arial, sans-serif; font-size: 9pt; font-weight: 700; text-align: center; background: var(--fond-doux); }
.grille .tab-g th.lib { background: none; border-top-color: transparent; border-left-color: transparent; }
.grille .tab-g .cel { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
.grille .tab-g .cel .v { min-width: 0; overflow-wrap: anywhere; }
.grille .tab-g .cel b { flex: none; white-space: nowrap; }
.grille .tab-g tr.tot td { font-family: Archivo, Arial, sans-serif; font-size: 9pt; font-weight: 700; background: var(--fond-doux); }
.grille .lst { margin: 4px 10px 0; font-size: 10pt; color: var(--gris); }
.grille .lst-t { font-weight: 700; }
.grille .lst-t.err { color: var(--alerte); }
.grille .lst-t.ok { color: var(--bon); }
.grille .lst-l { display: flex; align-items: baseline; gap: 14px; padding: 1px 0 1px 10px; border-bottom: 1px dotted #d5d9df; }
.grille .lst-l:last-child { border-bottom: 0; }
.grille .lst-d { flex: 1; min-width: 0; }
.grille .lst-c { flex: 0 1 auto; max-width: 42%; text-align: right; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; font-weight: 600; color: var(--encre); }
`;

/** Ligne de la page « Réponses » : lettre (a), b)… ou rien), réponse finale, points. */
export interface LigneReponse {
  lettre: string | null;
  fragments: FragmentConsigne[];
  points: number;
}

/** Réponses finales d'une question, ligne par ligne — même source que l'en-tête de la question dans
 * la grille (`bareme.reponseFinale`, sinon la réponse brève) : vrai/faux une ligne par affirmation,
 * question regroupée une ligne par a), b), c). Question ouverte (formule, démonstration) : le corrigé
 * s'il est court, sinon un renvoi au détail de la question. */
export function reponsesDeLaQuestion(item: ItemEvaluation, numero: number): LigneReponse[] {
  if (item.groupe && item.groupe.length > 0) {
    const pts = pointsDesLignes(item);
    return item.groupe.map((l, i) => ({ lettre: lettreCle(i), fragments: l.item.bareme?.reponseFinale ?? l.item.reponseBreve ?? [], points: pts[i] }));
  }
  if (item.nature === "vraiFaux" && item.correctionDetaillee && item.correctionDetaillee.length > 1) {
    const pts = pointsParSousQuestion(item);
    return item.correctionDetaillee.map((e, i) => {
      const lettre = e.sousQuestion ?? lettreCle(i);
      return { lettre, fragments: [{ type: "texte", valeur: e.label }], points: pts.get(lettre) ?? 0 };
    });
  }
  const finale = item.bareme?.reponseFinale ?? item.reponseBreve;
  if (finale && finale.length > 0) return [{ lettre: null, fragments: finale, points: item.points }];
  const paragraphes = item.correction.flatMap((b) => (b.type === "paragraphe" ? [b.fragments] : []));
  const joints = paragraphes.flatMap((p, i) => (i === 0 ? p : [{ type: "texte" as const, valeur: " — " }, ...p]));
  const court = paragraphes.length > 0 && paragraphes.length === item.correction.length && largeurFragments(joints) <= 560;
  return [{ lettre: null, fragments: court ? joints : [{ type: "texte", valeur: `Voir le détail de la question ${numero}.` }], points: item.points }];
}

function reponsesQuestionHtml(item: ItemEvaluation, numero: number): string {
  const lignes = reponsesDeLaQuestion(item, numero);
  if (lignes.length === 1 && lignes[0].lettre === null) {
    return `<div class="rep-q"><div class="rep-l"><b class="rep-n">${numero}</b><span class="rep-v">${fragmentsVersHtml(lignes[0].fragments)}</span><span class="rep-p">${nombreFr(lignes[0].points)}</span></div></div>`;
  }
  const total = lignes.reduce((t, l) => t + l.points, 0);
  return `<div class="rep-q"><div class="rep-l rep-tete"><b class="rep-n">${numero}</b><span class="rep-v"></span><span class="rep-p">${nombreFr(total)}</span></div>${lignes
    .map((l) => `<div class="rep-l"><span class="rep-lettre">${l.lettre ? `${echapperHtml(l.lettre)})` : ""}</span><span class="rep-v">${fragmentsVersHtml(l.fragments)}</span><span class="rep-p">${nombreFr(l.points)}</span></div>`)
    .join("")}</div>`;
}

/** Bloc de réponses (une partie d'examen, ou toute l'évaluation) en 1, 2 ou 3 colonnes selon la
 * plus longue réponse. */
function blocReponsesHtml(questions: { item: ItemEvaluation; numero: number }[]): string {
  const largeur = Math.max(0, ...questions.flatMap(({ item, numero }) => reponsesDeLaQuestion(item, numero).map((l) => largeurFragments(l.fragments))));
  const n = colonnesReponses(largeur);
  return `<div class="rep-bloc rep-c${n}">${questions.map(({ item, numero }) => reponsesQuestionHtml(item, numero)).join("")}</div>`;
}

/** Page « Réponses — Série A » en tête de la grille ; examen : un bloc par partie. */
function pageReponsesHtml(serieLettre: string, sections: { titre?: string; points?: number; questions: { item: ItemEvaluation; numero: number }[] }[]): string {
  const corps = sections
    .map((s) => `${s.titre ? `<div class="rep-partie"><span>${echapperHtml(s.titre)}</span>${s.points !== undefined ? `<span class="pts">${pointsTexte(s.points)}</span>` : ""}</div>` : ""}${blocReponsesHtml(s.questions)}`)
    .join("");
  return `<section class="rep-page"><h2 class="rep-titre"><span>Réponses — Série <strong>${echapperHtml(serieLettre)}</strong></span><span class="pts">points à droite</span></h2>${corps}</section>`;
}

function critereGrilleHtml(c: CritereBareme, points: number): string {
  return `<span>${c.sousQuestion ? `${echapperHtml(c.sousQuestion.replace(/\)$/, ""))}) ` : ""}${c.etape ? `<span class="etape-num">Étape ${c.etape}</span> ` : ""}${fragmentsVersHtml(c.critere)}</span><b>${nombreFr(points)}</b>`;
}

/** Tableau d'un groupe (B) : une rangée par critère commun, une colonne par ligne a), b), c)…, coupé
 * en blocs de colonnes au-delà de la largeur imprimable (680 px). */
function tableauGroupeHtml(t: TableauGroupe): string {
  const libelle = largeurLibelleTableau(t);
  const largeurs = t.colonnes.map((_, j) => largeurColonneTableau(t, j));
  return blocsDeColonnes(largeurs, LARGEUR_GRILLE - libelle)
    .map((bloc) => {
      const libelleBloc = largeurLibelleBloc(t, bloc.map((j) => largeurs[j]), LARGEUR_GRILLE);
      const tete = `<tr><th class="lib"></th>${bloc.map((j) => `<th>${lettreCle(t.colonnes[j])})</th>`).join("")}</tr>`;
      const rangees = t.rangees
        .map(
          (r) =>
            `<tr><td class="lib">${r.etape ? `<span class="etape-num">Étape ${r.etape}</span> — ` : ""}${fragmentsVersHtml(r.libelle)}</td>${bloc
              .map((j) => {
                const c = r.cellules[j];
                return `<td><div class="cel">${c.valeur ? `<span class="v">${fragmentsVersHtml(c.valeur)}</span>` : "<span></span>"}<b>${nombreFr(c.points)}</b></div></td>`;
              })
              .join("")}</tr>`,
        )
        .join("");
      const totaux = `<tr class="tot"><td class="lib">Total</td>${bloc.map((j) => `<td><div class="cel"><span></span><b>${nombreFr(t.totaux[j])}</b></div></td>`).join("")}</tr>`;
      return `<table class="tab-g"><colgroup><col style="width:${libelleBloc}px">${bloc.map(() => "<col>").join("")}</colgroup><thead>${tete}</thead><tbody>${rangees}${totaux}</tbody></table>`;
    })
    .join("");
}

/** Liste (C) : une entrée par ligne, le coût éventuel aligné à droite. */
function listeGrilleHtml(classe: "err" | "ok", titre: string, entrees: { texte: string; cout?: string }[]): string {
  if (entrees.length === 0) return "";
  return `<div class="lst"><div class="lst-t ${classe}">${titre}</div>${entrees
    .map((e) => `<div class="lst-l"><span class="lst-d">${e.texte}</span>${e.cout ? `<span class="lst-c">${echapperHtml(e.cout)}</span>` : ""}</div>`)
    .join("")}</div>`;
}

/** Bloc d'une question dans la grille de correction (évaluation : libellé = processus). `libelleHtml` : déjà
 * échappé (le nom de la compétence y est dans sa couleur). */
function blocGrilleHtml(item: ItemEvaluation, numero: number, libelleHtml: string): string {
  const reponse = item.bareme ? `Réponse : <b>${fragmentsVersHtml(item.bareme.reponseFinale)}</b>` : item.notion ? echapperHtml(item.notion) : "";
  const tete = `<div class="q-tete"><span class="sans">Question ${numero} · ${libelleHtml} · ${pointsTexte(item.points)}</span><span>${reponse}</span></div>`;
  if (!item.bareme || item.bareme.criteres.length === 0) {
    return `<section class="q">${tete}<div class="note">Barème global : ${pointsTexte(item.points)}.</div><div style="padding:3px 10px 0">${correctionHtml(item)}</div></section>`;
  }
  const bareme = item.bareme;
  const pts = pointsCriteres(item);
  const liste = (indices: number[]) => `<div class="criteres">${indices.map((i) => critereGrilleHtml(bareme.criteres[i], pts[i])).join("")}</div>`;
  const segments = item.groupe && item.groupe.length > 1 ? segmentsDuGroupe(bareme.criteres, pts, item.groupe.length) : null;
  const criteres = segments ? segments.map((s) => (s.type === "tableau" ? tableauGroupeHtml(s.tableau) : liste(s.indices))).join("") : liste(bareme.criteres.map((_, i) => i));
  const erreurs = listeGrilleHtml("err", "Erreurs fréquentes", (bareme.erreursFrequentes ?? []).map((e) => ({ texte: fragmentsVersHtml(e.description), cout: e.cout })));
  const acceptees = listeGrilleHtml("ok", "Accepter", (bareme.reponsesAcceptees ?? []).map((r) => ({ texte: fragmentsVersHtml(r) })));
  const codesLignes = (item.groupe ?? []).map((l, i) => (l.item.code ? `${lettreCle(i)}) ${echapperHtml(l.item.code.code)}` : "")).filter(Boolean);
  const code = item.code ? ` <span class="pts">code ${echapperHtml(item.code.code)}</span>` : codesLignes.length > 0 ? ` <span class="pts">codes ${codesLignes.join(" · ")}</span>` : "";
  return `<section class="q">${tete}${criteres}${erreurs}${acceptees}${code ? `<div class="note">${code}</div>` : ""}</section>`;
}

function grilleHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const resume = `${totaux.map((t) => `${nomProcessusHtml(t.processus)} ${nombreFr(t.total)}`).join(" · ")} · <b>Total ${nombreFr(total)}</b>`;
  const numerotes = itemsNumerotes(items);
  const blocs = numerotes.map(({ item, numero }) => blocGrilleHtml(item, numero, nomProcessusHtml(item.processus))).join("");
  const reponses = pageReponsesHtml(entete.serieLettre, [{ questions: numerotes }]);
  return `<div class="grille"><div class="tete-grille"><div><span class="surtitre">Document professeur · Série <strong>${echapperHtml(entete.serieLettre)}</strong></span><h1>Grille de correction — ${echapperHtml(titreNettoye(entete))}</h1></div><span class="sans" style="font-size:8.5pt;color:#4a4f58">${resume}</span></div>${reponses}${blocs}
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
  const cssCopie = `${stylePied(entete.serieLettre, "Archivo, Arial, sans-serif")}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}${styleGroupes(items)}${styleConsignesSup(entete)}`;
  // Corrigé et grille : documents du professeur — « Série A » (sans « Nom ») et « page n / N ».
  const cssProfesseur = `${stylePied(entete.serieLettre, "Archivo, Arial, sans-serif", "8.5pt", false)}${styleGroupes(items)}`;
  return {
    enonce: new Blob([documentHtml(titre, copie, css, cssKatex, "standard", cssCopie)], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([documentHtml(`${titre} — Corrigé`, corrige, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
    grille: new Blob([documentHtml(`${titre} — Grille de correction`, grille, css, cssKatex, "standard", `${cssProfesseur}${STYLE_GRILLE}`)], { type: "text/html;charset=utf-8" }),
  };
}

/* ----------------------------------------------------------------------------------------------
 * Évaluation blanche (parcours élève, maquette « EvaluationBlanche » validée le 21/11/2026)
 *
 * Présentation d'une évaluation — cartouche, tableau « Mon score » par processus, encadré
 * calculatrice, consignes, bandeaux de processus, questions numérotées avec leurs points — mais pour
 * l'élève seul : durée et points INDICATIFS, « sans valeur de note », QR code « refaire en ligne »
 * par question (par LIGNE dans une question regroupée), et le corrigé détaillé « comme au tableau »
 * À LA FIN du même document (rendu de la feuille d'exercices). Une seule série ; ni corrigé séparé, ni
 * grille, ni école, ni professeur, ni consignes du professeur. Les autres documents ne changent pas.
 * -------------------------------------------------------------------------------------------- */

const PIED_BLANCHE = "Évaluation blanche — corrigé détaillé en fin de document";
const CONSIGNES_BLANCHE = "Fais-la sans ton cours, chronomètre lancé. Le <b>corrigé détaillé</b> est à la fin du document : ne le regarde qu'après.";
const CONSIGNE_QR_BLANCHE = " Le QR code de chaque question te permet de la refaire en ligne, avec les aides.";

const STYLE_BLANCHE = `
.surtitre .nc { text-transform: none; letter-spacing: 0.04em; }
.meta.parts, .meta-am.parts { color: var(--encre); }
.question .q-corps { display: flex; gap: 16px; align-items: flex-start; }
.question .q-texte { flex: 1; min-width: 0; overflow-wrap: anywhere; }
.qr-bloc { width: 2.3cm; flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; font-family: Archivo, Arial, sans-serif; font-size: 7pt; color: var(--gris); line-height: 1.2; }
.qr-bloc .code { font-weight: 700; color: var(--encre); letter-spacing: 0.05em; }
h2.page-titre { font-size: 18pt; font-weight: 600; padding-bottom: 8px; border-bottom: 2px solid var(--encre); margin-bottom: 12px; }
.corr { margin: 14px 0 0; break-inside: avoid; page-break-inside: avoid; }
.corr:has(.etape-titre) { break-inside: auto; page-break-inside: auto; }
.corr h3 { font-family: Archivo, Arial, sans-serif; font-size: 12pt; font-weight: 700; margin-bottom: 4px; break-after: avoid; page-break-after: avoid; }
.corr h3 .notion { font-weight: 500; color: var(--gris); }
.reponse-ancienne { color: inherit; }
.figure-corrige-bloc { margin: 6px 0 2px; break-inside: avoid; page-break-inside: avoid; }
.figure-corrige-bloc svg { display: block; width: 100%; max-width: 14cm; height: auto; }
.etapes > *, .piege, .etape-titre { break-inside: avoid; page-break-inside: avoid; }
.etape-titre { break-after: avoid; page-break-after: avoid; }
`;

/** Version aménagée : corrigé de fin de document et ligne « Durée conseillée ». */
const STYLE_BLANCHE_AMENAGE = `
.corr h3 { font-family: 'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif; font-size: 14pt; }
.meta-am { font-size: 11pt; color: var(--gris); margin: -6px 0 10px; }
`;

function totalPoints(items: ItemEvaluation[]): number {
  return items.reduce((t, it) => t + it.points, 0);
}

/** « Durée conseillée : 30 min · 20 points indicatifs · sans valeur de note ». */
function metaBlanche(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const total = totalPoints(items);
  const duree = entete.blanche?.dureeConseillee ?? dureeEstimeeMinutes(items);
  return `Durée conseillée : ${duree} min · ${nombreFr(total)} ${total >= 2 ? "points" : "point"} indicatifs · sans valeur de note`;
}

/** « Parts : Connaître 20 % · Appliquer 65 % · Transférer 15 % — tirées au hasard : … » (absent :
 * rien, document identique à avant). */
function repartitionBlancheHtml(entete: EnteteEvaluation, classe: string, balise: "span" | "p" = "span"): string {
  const r = entete.blanche?.repartition;
  return r ? `<${balise} class="${classe}">Parts : ${echapperHtml(r)}.</${balise}>` : "";
}

function titreBlanche(entete: EnteteEvaluation): string {
  return entete.titreChapitre || entete.titre.replace(/^\s*Évaluation blanche\s*[—–-]\s*/i, "").trim() || entete.titre;
}

function cartoucheBlancheHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  return `<div class="cartouche blanche">
  <div class="g"><span class="surtitre">Évaluation blanche · <span class="nc">${echapperHtml(entete.niveauLabel)}</span> · Entraînement personnel</span>
    <h1>${echapperHtml(titreBlanche(entete))}</h1>
    <span class="meta">${echapperHtml(metaBlanche(entete, items))}</span>${repartitionBlancheHtml(entete, "meta parts")}</div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Début</span><span class="champ"></span><span>Fin</span><span class="champ"></span></div>
</div>`;
}

function resultatsBlancheHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const tetes = totaux.map((t) => `<th>${nomProcessusHtml(t.processus)}</th>`).join("");
  const cases = totaux.map((t) => `<td class="vide">…… / ${nombreFr(t.total)}</td>`).join("");
  return `<div class="resultats"><table><tr><th style="text-align:left">Processus</th>${tetes}<th class="total">Total</th></tr><tr><td class="lbl">Mon score</td>${cases}<td class="total vide">…… / ${nombreFr(totalPoints(items))}</td></tr></table>${calculatriceHtml(entete.calculatrice)}</div>`;
}

function aDesQrCodes(items: ItemEvaluation[]): boolean {
  return items.some((it) => it.code || it.groupe?.some((l) => l.item.code));
}

function consignesBlancheHtml(items: ItemEvaluation[], avecQr: boolean): string {
  return `<div class="consignes"><b class="titre">Consignes</b> — ${CONSIGNES_BLANCHE}${avecQr && aDesQrCodes(items) ? CONSIGNE_QR_BLANCHE : ""}</div>`;
}

/** Questions de l'évaluation blanche : comme la copie (bandeaux de processus, « Question n », points
 * à droite), avec le QR code « refaire en ligne » de la question (à droite de l'énoncé) ou de chaque
 * ligne d'une question regroupée (niveaux non affichés : présentation d'une évaluation). */
function questionsBlancheHtml(items: ItemEvaluation[]): string {
  let html = "";
  for (const groupe of grouperParProcessus(items)) {
    const totalP = groupe.items.reduce((t, x) => t + x.item.points, 0);
    html += `<div class="bloc-processus p${groupe.processus}"><h2>Processus ${groupe.processus} — ${NOM_PROCESSUS[groupe.processus]}</h2><span class="pts">${pointsTexte(totalP)}</span></div>`;
    for (const { item, numero } of groupe.items) {
      const pts = pointsParSousQuestion(item);
      const tete = `<div class="ligne-titre"><span class="num">Question ${numero}</span><span class="pts">${pointsTexte(item.points)}</span></div>`;
      const sansQr = corpsQuestionHtml(item, pts);
      if (item.groupe && item.groupe.length > 0) {
        const corps = corpsQuestionHtml(item, pts, { numero, qr: true, niveau: false });
        html += `<section class="question groupe${classeFigures(sansQr)}">${avecTete(tete, corps)}</section>`;
        continue;
      }
      const qr = item.code
        ? `<div class="qr-bloc">${qrCodeSvg(item.code.url, 62, `QR code : refaire la question ${numero} en ligne`)}<span>Refaire en ligne<br>avec les aides</span><span class="code">code ${echapperHtml(item.code.code)}</span></div>`
        : "";
      html += `<section class="question${classeFigures(sansQr)}">${tete}${qr ? `<div class="q-corps"><div class="q-texte">${sansQr}</div>${qr}</div>` : sansQr}</section>`;
    }
  }
  return html;
}

/** Évaluation blanche : UN document (copie, annexes éventuelles, puis corrigé détaillé en fin de
 * document). */
export async function genererEvaluationBlanche(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const numerotes = itemsNumerotes(items);
  const corps = `${cartoucheBlancheHtml(entete, items)}${resultatsBlancheHtml(entete, items)}${consignesBlancheHtml(items, true)}${questionsBlancheHtml(items)}${annexesHtml(annexes)}
<div class="saut-page"></div>
${pageCorrigeFeuilleHtml(numerotes, "Question")}`;
  const css = `${stylePied(null, "Archivo, Arial, sans-serif", "8.5pt", true, PIED_BLANCHE)}${styleGroupes(items)}`;
  const doc = documentHtml(`Évaluation blanche — ${titreBlanche(entete)}`, corps, `${STYLE_EVALUATION}${STYLE_BLANCHE}`, cssKatex, "standard", css);
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}

/** Version aménagée de l'évaluation blanche : même énoncé, mêmes points, une question par page (pas
 * de QR code, comme la feuille aménagée), puis le corrigé détaillé à la fin. */
async function genererBlancheAmenagee(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const titre = titreBlanche(entete);
  const tete = `<div class="tete-am"><div><span class="surtitre" style="color:#1d5b8f;font-weight:700">Version aménagée · Évaluation blanche · <span class="nc">${echapperHtml(entete.niveauLabel)}</span></span><h1>${echapperHtml(titre)}</h1></div><span class="droite">Mêmes questions,<br>mêmes points indicatifs</span></div>
<p class="meta-am">${echapperHtml(metaBlanche(entete, items))}</p>${repartitionBlancheHtml(entete, "meta-am parts", "p")}
<div class="identite-am"><span>Nom <span class="champ"></span></span><span>Début <span class="champ" style="width:2.5cm"></span></span><span>Fin <span class="champ" style="width:2.5cm"></span></span></div>
${consignesBlancheHtml(items, false)}`;
  const numerotes = itemsNumerotes(items);
  const pages = numerotes.map(({ item, numero }, i) => `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${questionAmenageeHtml(item, numero, false)}`).join("");
  const corps = `${pages}${annexesHtml(annexes)}
<div class="saut-page"></div>
${pageCorrigeFeuilleHtml(numerotes, "Question")}`;
  const police = "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif";
  const css = `${stylePied(null, police, "10pt", true, PIED_BLANCHE)}${styleGroupes(items)}`;
  const doc = documentHtml(`Évaluation blanche — ${titre} — Version aménagée`, corps, `${STYLE_AMENAGE}${STYLE_BLANCHE}${STYLE_BLANCHE_AMENAGE}`, cssKatex, "amenagee", css);
  return new Blob([doc], { type: "text/html;charset=utf-8" });
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
.partie.p1 { border-color: var(--proc1); } .partie.p1 .no { color: var(--proc1-encre); }
.partie.p2 { border-color: var(--proc2); } .partie.p2 .no { color: var(--proc2-encre); }
.partie.p3 { border-color: var(--proc3); } .partie.p3 .no { color: var(--proc3-encre); }
.partie .chs { grid-column: 1 / -1; font-family: Archivo, Arial, sans-serif; font-size: 8.5pt; color: var(--gris); }
.question .ligne-titre .ch, .q-am .ch, .grille .q-tete .ch { font-family: Archivo, Arial, sans-serif; font-size: 8pt; font-weight: 600; color: var(--gris); border: 1px solid var(--filet); border-radius: 3px; padding: 0 6px; margin-left: 8px; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
.question .ligne-titre .ch.np1, .q-am .ch.np1, .grille .q-tete .ch.np1 { border-color: var(--proc1); color: var(--proc1-encre); }
.question .ligne-titre .ch.np2, .q-am .ch.np2, .grille .q-tete .ch.np2 { border-color: var(--proc2); color: var(--proc2-encre); }
.question .ligne-titre .ch.np3, .q-am .ch.np3, .grille .q-tete .ch.np3 { border-color: var(--proc3); color: var(--proc3-encre); }
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
  <div class="g"><span class="surtitre">${surtitreCartoucheHtml(entete)}</span>
    <h1>${echapperHtml(titreExamen(entete))}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}</h1>
    <span class="meta">${echapperHtml(dateEnToutesLettres(entete.date))} · Série <strong>${echapperHtml(entete.serieLettre)}</strong>${adresseCartoucheHtml(entete)}</span></div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span><span>N°</span><span class="champ"></span></div>
</div>`;
}

function resultatsExamenHtml(entete: EnteteEvaluation, parties: PartieExamen<ItemEvaluation>[]): string {
  const total = parties.reduce((t, p) => t + totalPartie(p), 0);
  const tetes = parties.map((p) => { const proc = processusDePartie(p); return `<th>${p.romain} · ${proc ? nomProcessusHtml(proc, p.titreCourt) : echapperHtml(p.titreCourt)}</th>`; }).join("");
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
  const sup = consignesSupplementairesHtml(examen.consignesSupplementaires);
  return `<div class="consignes"><b class="titre">Consignes</b> — ${echapperHtml(TEXTE_CONSIGNES)}${calculatrice}${echapperHtml(phraseHoraire(entete, examen, items))}${sup}</div>`;
}

function ouverturePartieHtml(examen: ExamenDocument, partie: PartieExamen<ItemEvaluation>): string {
  const proc = processusDePartie(partie);
  return `<div class="partie${proc ? ` p${proc}` : ""}"><span class="no">Partie ${partie.romain}</span><h2>${echapperHtml(partie.titre)}</h2><span class="pts">${pointsTexte(totalPartie(partie))}</span><span class="chs">${echapperHtml(lignePartie(partie, accesExamen, examen.organisation, examen.chapitres))}</span></div>`;
}

function etiquetteHtml(examen: ExamenDocument, item: ItemEvaluation): string {
  const e = etiquetteQuestion(accesExamen(item), examen.organisation, examen.chapitres);
  // Parties par chapitre : l'étiquette est la compétence, dans sa couleur.
  const proc = examen.organisation === "chapitre" ? item.processus : null;
  return e ? `<span class="ch${proc ? ` np${proc}` : ""}">${echapperHtml(e)}</span>` : "";
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
      questions += `<section class="question${item.groupe ? " groupe" : ""}${classeFigures(corps)}${classeLargeur(corps, deuxColonnes, 380)}">${avecTete(`${deuxColonnes ? titre : ""}<div class="ligne-titre"><span><span class="num">Question ${numero}</span>${etiquetteHtml(examen, item)}</span><span class="pts">${pointsTexte(item.points)}</span></div>`, corps)}${
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
          const libelle = [nomProcessusHtml(item.processus, NOM_PROCESSUS_EXAMEN[item.processus]), echapperHtml(chapitre.length > 2 ? "Plusieurs chapitres" : chapitre.join(" · "))].filter(Boolean).join(" · ");
          return blocGrilleHtml(item, numero, libelle);
        })
        .join("");
      return `${ouverturePartieHtml(examen, partie)}${qs}`;
    })
    .join("");
  const reponses = pageReponsesHtml(
    entete.serieLettre,
    parties.map((p) => ({ titre: `Partie ${p.romain} · ${p.titre}`, points: totalPartie(p), questions: p.questions.map(({ element, numero }) => ({ item: element, numero })) })),
  );
  return `<div class="grille"><div class="tete-grille"><div><span class="surtitre">Document professeur · Examen · Série <strong>${echapperHtml(entete.serieLettre)}</strong></span><h1>Grille de correction — ${echapperHtml(titreExamen(entete))}</h1></div><span class="sans" style="font-size:8.5pt;color:#4a4f58">${resume}</span></div>${reponses}${blocs}
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
  const cssCopie = `${stylePied(entete.serieLettre, police)}${styleEnteteCourant(courant, entete.serieLettre, police)}${deuxColonnes ? STYLE_DEUX_COLONNES : ""}${styleGroupes(items)}`;
  const cssProfesseur = `${stylePied(entete.serieLettre, police, "8.5pt", false)}${styleEnteteCourant(courant, entete.serieLettre, police)}${styleGroupes(items)}`;
  return {
    enonce: new Blob([documentHtml(titre, copie, css, cssKatex, "standard", cssCopie)], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([documentHtml(`${titre} — Corrigé`, corrige, css, cssKatex, "standard", cssProfesseur)], { type: "text/html;charset=utf-8" }),
    grille: new Blob([documentHtml(`${titre} — Grille de correction`, grille, css, cssKatex, "standard", `${cssProfesseur}${STYLE_GRILLE}`)], { type: "text/html;charset=utf-8" }),
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
      const question = `<section class="q-am${item.groupe ? " groupe" : ""}"><h2><span>Question ${numero}${etiquetteHtml(examen, item)}</span><span class="pts">${pointsTexte(item.points)}</span></h2><div class="enonce-am">${corps}</div></section>`;
      pages += `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${k === 0 ? ouverturePartieHtml(examen, partie) : ""}${question}`;
      i++;
    });
  }
  const police = "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif";
  const css = `${stylePied(entete.serieLettre, police, "10pt")}${styleEnteteCourant(enteteCourantExamen(entete, examen), entete.serieLettre, police, "10pt")}${styleGroupes(items)}`;
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
  // Feuille aménagée, question regroupée : niveau de chaque ligne (pas de QR code dans l'aménagée).
  const corps = corpsQuestionHtml(item, estExercice ? undefined : pointsParSousQuestion(item), estExercice ? { numero, qr: false } : undefined);
  return `<section class="q-am${item.groupe ? " groupe" : ""}"><h2><span>${titre}</span>${estExercice ? "" : `<span class="pts">${pointsTexte(item.points)}</span>`}</h2><div class="enonce-am">${corps}</div></section>`;
}

/** Version aménagée : JAMAIS en deux colonnes (décision de l'utilisateur), même avec la case
 * « Économie de papier ». Évaluation : même encadré « Consignes » et même pied de page que la copie ;
 * annexes (formulaire…) en fin de document, dans les deux modes. */
export async function genererVersionAmenagee(entete: EnteteEvaluation, items: ItemEvaluation[], annexes?: AnnexeDocument[]): Promise<Blob> {
  if (entete.examen && entete.mode !== "exercice") return genererExamenAmenage(entete, entete.examen, items, annexes);
  if (entete.blanche && entete.mode !== "exercice") return genererBlancheAmenagee(entete, items, annexes);
  const cssKatex = await obtenirCssKatexAutonome();
  const estExercice = entete.mode === "exercice";
  const titre = estExercice ? titreNettoye(entete) : titreEvaluation(entete);
  const droite = estExercice ? "Mêmes exercices,<br>mise en page adaptée" : `Série <strong>${echapperHtml(entete.serieLettre)}</strong><br>Mêmes questions, même barème`;
  const tete = `<div class="tete-am"><div><span class="surtitre" style="color:#1d5b8f;font-weight:700">Version aménagée${estExercice ? " · Feuille d'exercices" : ""}</span><h1>${echapperHtml(titre)}</h1></div><span class="droite">${droite}</span></div>
<div class="identite-am"><span>Nom <span class="champ"></span></span><span>Classe <span class="champ" style="width:2.5cm"></span></span><span>N° <span class="champ" style="width:1.2cm"></span></span><span>${echapperHtml(dateEnToutesLettres(entete.date))}</span>${estExercice && professeurFeuille(entete) ? `<span>Professeur : ${echapperHtml(professeurFeuille(entete))}</span>` : ""}</div>
${estExercice ? "" : consignesHtml(entete, items)}`;
  const pages = itemsNumerotes(items)
    .map(({ item, numero }, i) => `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${questionAmenageeHtml(item, numero, estExercice)}`)
    .join("");
  const police = "'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif";
  const doc = documentHtml(`${titre} — Version aménagée`, `${pages}${annexesHtml(annexes)}`, STYLE_AMENAGE, cssKatex, "amenagee", stylePied(estExercice ? null : entete.serieLettre, police, "10pt", true, estExercice ? professeurFeuille(entete) : "") + styleGroupes(items) + (estExercice ? "" : styleConsignesSup(entete)));
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}
