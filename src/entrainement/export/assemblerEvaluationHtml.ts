import type { BaremeExercice, BlocCorrection, EtapeAmenagee, EtapeCorrection, FragmentConsigne, SectionExercice } from "./genererFeuilleExercices";
import { blocCorrectionHtml, echapperHtml, fragmentsEnteteHtml, fragmentsVersHtml } from "./genererFeuilleExercicesHtml";
import { obtenirCssKatexAutonome } from "./katexImage";
import { qrCodeSvg } from "./qrSvg";

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
 * - version aménagée (les deux modes) : police très lisible, une question par page, chaque
 *   question découpée en étapes.
 * Aucune zone de réponse nulle part : les élèves répondent sur une feuille à part.
 *
 * Tous les champs enrichis des items sont optionnels : un générateur qui ne les fournit pas encore
 * (autres chapitres) est rendu proprement avec son énoncé/corrigé historiques.
 *
 * L'en-tête « Nom et prénom … N° » de l'évaluation se répète sur chaque page imprimée via le
 * `<thead>` d'un tableau unique (CSS 2.1, respecté par Chromium à l'impression) plutôt que
 * `position: fixed`, qui ne se répétait pas de façon fiable.
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
  difficulte?: 1 | 2 | 3;
  reponseBreve?: FragmentConsigne[];
  correctionDetaillee?: EtapeCorrection[];
  bareme?: BaremeExercice;
  enonceAmenage?: EtapeAmenagee[];
  dureeMinutes?: number;
  /** Code reproductible de l'exercice (QR code de la feuille d'exercices, rappel dans la grille). */
  code?: { code: string; url: string };
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
  /** Surtitre « 6e (6h) · Chapitre 3 » (feuille d'exercices). */
  surtitre?: string;
  /** Titre du chapitre (« Fonctions logarithmes ») quand un seul chapitre est concerné. */
  titreChapitre?: string;
  /** Adresse de la page du chapitre (encadré « S'entraîner encore, en ligne »). */
  urlChapitre?: string;
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
function titreNettoye(entete: EnteteEvaluation): string {
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

/** Points de chaque critère du barème, ramenés au total de la question. */
export function pointsCriteres(item: ItemEvaluation): number[] {
  if (!item.bareme || item.bareme.criteres.length === 0) return [];
  return repartirEnDemiPoints(item.bareme.criteres.map((c) => c.points), item.points);
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
body { margin: 0 auto; max-width: 21cm; padding: 0.8cm 1cm; color: var(--encre); background: #fff;
  font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.5; }
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
.etapes-libres p { margin: 0.25em 0; }
@media print { body { padding: 0; } }
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
.etoiles { color: var(--accent); }
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
.enonce-am { padding: 10px 14px; background: var(--fond-doux); border-radius: 8px; margin-bottom: 12px; }
.etape-am { margin: 10px 0; }
.etape-am .ligne { display: flex; justify-content: space-between; gap: 12px; }
.etape-am .rappel { font-size: 11.5pt; color: var(--gris); }
.identite-am { display: flex; gap: 24px; font-size: 11pt; color: var(--gris); margin-bottom: 10px; }
.identite-am span.champ { display: inline-block; width: 5cm; border-bottom: 1px solid #8a8f98; }
`;

const SCRIPT_IMPRESSION = `<script>if(location.hash==='#imprimer'){addEventListener('load',function(){setTimeout(function(){window.print()},400)})}</script>`;

function documentHtml(titre: string, corps: string, css: string, cssKatex: string, police: "standard" | "amenagee"): string {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapperHtml(titre)}</title>
${police === "amenagee" ? POLICE_AMENAGEE : POLICES_STANDARD}
<style>${cssKatex}${STYLE_COMMUN}${css}</style>
${SCRIPT_IMPRESSION}
</head>
<body>
${corps}
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
  const ptsSpan = (q: number) => {
    const p = pointsSousQ?.get(lettreCle(q));
    return p !== undefined ? ` <span class="pts">${pointsTexte(p)}</span>` : "";
  };
  if (item.section.disposeEnTableau && item.section.questions.length > 1) {
    html += `<table class="tableau-regroupe"><tbody>`;
    item.section.questions.forEach((question, q) => {
      html += `<tr><td class="lettre-regroupe">${lettreCle(q)})</td><td>${fragmentsVersHtml(question.consigne)}${ptsSpan(q)}</td></tr>`;
    });
    html += `</tbody></table>`;
  } else {
    const plusieurs = item.section.questions.length > 1;
    item.section.questions.forEach((question, q) => {
      const lettre = plusieurs ? `<strong>${lettreCle(q)})</strong> ` : "";
      html += `<p>${lettre}${fragmentsVersHtml(question.consigne)}${plusieurs ? ptsSpan(q) : ""}</p>`;
    });
  }
  return html;
}

function etapesCorrectionHtml(etapes: EtapeCorrection[]): string {
  const normales = etapes.filter((e) => e.label.trim().toLowerCase() !== "piège");
  const pieges = etapes.filter((e) => e.label.trim().toLowerCase() === "piège");
  let html = "";
  if (normales.length > 0 && normales.every((e) => !e.label.trim() && !e.sousQuestion)) {
    // Aucune étiquette (corrigé d'une question ouverte) : simples paragraphes, sans colonne vide.
    html += `<div class="etapes-libres">${normales.map((e) => `<p>${fragmentsVersHtml(e.fragments)}</p>`).join("")}</div>`;
  } else if (normales.length > 0) {
    html += `<div class="etapes">`;
    for (const e of normales) {
      const lbl = `${e.sousQuestion ? `${e.sousQuestion.replace(/\)$/, "")}) ` : ""}${e.label}`;
      html += `<span class="lbl">${echapperHtml(lbl)}</span><span>${fragmentsVersHtml(e.fragments)}</span>`;
    }
    html += `</div>`;
  }
  for (const p of pieges) {
    html += `<div class="piege"><span class="lbl">PIÈGE</span><span>${fragmentsVersHtml(p.fragments)}</span></div>`;
  }
  return html;
}

function correctionHtml(item: ItemEvaluation): string {
  if (item.correctionDetaillee && item.correctionDetaillee.length > 0) return etapesCorrectionHtml(item.correctionDetaillee);
  return `<div class="reponse-ancienne">${item.correction.map(blocCorrectionHtml).join("")}</div>`;
}

function etoiles(n: 1 | 2 | 3 | undefined): string {
  return n ? `<span class="etoiles" aria-label="difficulté ${n} sur 3">${"★".repeat(n)}</span>` : "";
}

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

function exerciceFeuilleHtml(item: ItemEvaluation, numero: number): string {
  const tag = [item.notion, NOM_PROCESSUS[item.processus]].filter(Boolean).join(" · ");
  const qr = item.code
    ? `<div class="qr-bloc">${qrCodeSvg(item.code.url, 66, `QR code : refaire l'exercice ${numero} en ligne`)}<span>Refaire en ligne<br>avec les aides</span><span class="code">code ${echapperHtml(item.code.code)}</span></div>`
    : "";
  return `<section class="ex">
  <div class="ex-tete"><h3>Exercice ${numero}</h3>${etoiles(item.difficulte)}${tag ? `<span class="tag">${echapperHtml(tag)}</span>` : ""}</div>
  <div class="ex-corps"><div class="ex-texte">${corpsQuestionHtml(item)}</div>${qr}</div>
</section>`;
}

function reponseBreveHtml(item: ItemEvaluation): string {
  if (item.reponseBreve && item.reponseBreve.length > 0) return fragmentsVersHtml(item.reponseBreve);
  return `<span class="explication">Voir le corrigé détaillé.</span>`;
}

function pageJeVerifieHtml(entete: EnteteEvaluation, numerotes: { item: ItemEvaluation; numero: number }[]): string {
  const cartes = numerotes
    .map(({ item, numero }) => `<div class="carte"><span class="num">Exercice ${numero}</span>${reponseBreveHtml(item)}</div>`)
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

export async function genererFeuilleExercicesComplete(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const numerotes = itemsNumerotes(items);
  const auMoinsUneDifficulte = items.some((it) => it.difficulte);
  const legende = `<div class="legende">${
    auMoinsUneDifficulte
      ? `<span><span class="etoiles">★</span> application directe</span><span><span class="etoiles">★★</span> plusieurs étapes</span><span><span class="etoiles">★★★</span> réflexion</span>`
      : ""
  }<span class="droite">Réponses brèves et corrigé : en fin de feuille</span></div>`;
  const corps = `${enteteFeuilleHtml(entete, "Feuille d'exercices")}
${legende}
${numerotes.map(({ item, numero }) => exerciceFeuilleHtml(item, numero)).join("")}
<div class="saut-page"></div>
${pageJeVerifieHtml(entete, numerotes)}
<div class="saut-page"></div>
${pageCorrigeFeuilleHtml(numerotes)}`;
  const doc = documentHtml(`${titreNettoye(entete)} — Feuille d'exercices`, corps, STYLE_FEUILLE, cssKatex, "standard");
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
  const duree = dureeEstimeeMinutes(items);
  return `<div class="cartouche">
  <div class="g"><span class="surtitre">${echapperHtml(ECOLE_NOM)} · Mathématiques ${echapperHtml(entete.heuresSemaine)}h/sem · ${echapperHtml(PROFESSEUR)}</span>
    <h1>${echapperHtml(titreEvaluation(entete))}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}</h1>
    <span class="meta">${echapperHtml(dateEnToutesLettres(entete.date))} · Série ${echapperHtml(entete.serieLettre)} · ${duree} minutes · ${echapperHtml(ECOLE_ADRESSE)}</span></div>
  <div class="d"><span>Nom</span><span class="champ"></span><span>Classe</span><span class="champ"></span></div>
</div>`;
}

function resultatsHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const tetes = totaux.map((t) => `<th>${NOM_PROCESSUS[t.processus]}</th>`).join("");
  const cases = totaux.map((t) => `<td class="vide">…… / ${nombreFr(t.total)}</td>`).join("");
  return `<div class="resultats"><table><tr><th style="text-align:left">Processus</th>${tetes}<th class="total">Total</th></tr><tr><td class="lbl">Points</td>${cases}<td class="total vide">…… / ${nombreFr(total)}</td></tr></table>${calculatriceHtml(entete.calculatrice)}</div>`;
}

function enveloppeEvaluation(contenu: string): string {
  return `<table class="page-cadre"><thead><tr><td><div class="entete-repetee"><span>Nom et prénom : ______________________________________</span><span>N° ____</span></div></td></tr></thead><tbody><tr><td>${contenu}</td></tr></tbody></table>`;
}

function questionsEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[], avecCorrection: boolean): string {
  const afficherTitres = entete.afficherTitresSection ?? false;
  let html = "";
  for (const groupe of grouperParProcessus(items)) {
    const totalP = groupe.items.reduce((t, x) => t + x.item.points, 0);
    html += `<div class="bloc-processus"><h2>Processus ${groupe.processus} — ${NOM_PROCESSUS[groupe.processus]}</h2><span class="pts">${pointsTexte(totalP)}</span></div>`;
    let sectionCourante: string | null = null;
    for (const { item, numero } of groupe.items) {
      if (afficherTitres && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        html += `<div class="titre-section">${echapperHtml(item.titreSection)}</div>`;
      }
      const pts = pointsParSousQuestion(item);
      html += `<section class="question"><div class="ligne-titre"><span class="num">Question ${numero}</span><span class="pts">${pointsTexte(item.points)}</span></div>${corpsQuestionHtml(item, pts)}${
        avecCorrection ? `<div class="correction-bloc">${correctionHtml(item)}</div>` : ""
      }</section>`;
    }
  }
  return html;
}

function grilleHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): string {
  const totaux = totauxParProcessus(items);
  const total = items.reduce((t, it) => t + it.points, 0);
  const resume = `${totaux.map((t) => `${NOM_PROCESSUS[t.processus]} ${nombreFr(t.total)}`).join(" · ")} · <b>Total ${nombreFr(total)}</b>`;
  const blocs = itemsNumerotes(items)
    .map(({ item, numero }) => {
      const reponse = item.bareme ? `Réponse : <b>${fragmentsVersHtml(item.bareme.reponseFinale)}</b>` : item.notion ? echapperHtml(item.notion) : "";
      const tete = `<div class="q-tete"><span class="sans">Question ${numero} · ${NOM_PROCESSUS[item.processus]} · ${pointsTexte(item.points)}</span><span>${reponse}</span></div>`;
      if (!item.bareme || item.bareme.criteres.length === 0) {
        return `<section class="q">${tete}<div class="note">Barème global : ${pointsTexte(item.points)}.</div><div style="padding:3px 10px 0">${correctionHtml(item)}</div></section>`;
      }
      const pts = pointsCriteres(item);
      const criteres = item.bareme.criteres
        .map((c, i) => `<span>${c.sousQuestion ? `${echapperHtml(c.sousQuestion.replace(/\)$/, ""))}) ` : ""}${fragmentsVersHtml(c.critere)}</span><b>${nombreFr(pts[i])}</b>`)
        .join("");
      const erreurs = (item.bareme.erreursFrequentes ?? [])
        .map((e) => `${fragmentsVersHtml(e.description)}${e.cout ? ` → ${echapperHtml(e.cout)}` : ""}`)
        .join(" ; ");
      const acceptees = (item.bareme.reponsesAcceptees ?? []).map((r) => fragmentsVersHtml(r)).join(" ; ");
      const code = item.code ? ` <span class="pts">code ${echapperHtml(item.code.code)}</span>` : "";
      return `<section class="q">${tete}<div class="criteres">${criteres}</div>${
        erreurs ? `<div class="note"><span class="err">Erreurs fréquentes :</span> ${erreurs}</div>` : ""
      }${acceptees ? `<div class="note"><span class="ok">Accepter :</span> ${acceptees}</div>` : ""}${code ? `<div class="note">${code}</div>` : ""}</section>`;
    })
    .join("");
  return `<div class="grille"><div class="tete-grille"><div><span class="surtitre">Document professeur · Série ${echapperHtml(entete.serieLettre)}</span><h1>Grille de correction — ${echapperHtml(titreNettoye(entete))}</h1></div><span class="sans" style="font-size:8.5pt;color:#4a4f58">${resume}</span></div>${blocs}
<div class="regle"><span class="sans">RÈGLE</span><span>Une erreur n'est pénalisée qu'une fois : si une valeur fausse est réutilisée correctement dans la suite, la suite rapporte ses points.</span></div>
<div class="pied"><span>${echapperHtml(titreEvaluation(entete))} · ${echapperHtml(dateEnToutesLettres(entete.date))}</span><span>Ne pas distribuer aux élèves</span></div></div>`;
}

/** Copie, corrigé et grille de correction d'UNE série. */
export async function genererEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<{ enonce: Blob; corrige: Blob; grille: Blob }> {
  const cssKatex = await obtenirCssKatexAutonome();
  const css = STYLE_EVALUATION;
  const titre = `${titreEvaluation(entete)} — Série ${entete.serieLettre}`;
  const copie = enveloppeEvaluation(`${cartoucheEvaluationHtml(entete, items)}${resultatsHtml(entete, items)}${questionsEvaluationHtml(entete, items, false)}`);
  const corrige = enveloppeEvaluation(`${cartoucheEvaluationHtml(entete, items, "Corrigé")}${questionsEvaluationHtml(entete, items, true)}`);
  const grille = grilleHtml(entete, items);
  return {
    enonce: new Blob([documentHtml(titre, copie, css, cssKatex, "standard")], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([documentHtml(`${titre} — Corrigé`, corrige, css, cssKatex, "standard")], { type: "text/html;charset=utf-8" }),
    grille: new Blob([documentHtml(`${titre} — Grille de correction`, grille, css, cssKatex, "standard")], { type: "text/html;charset=utf-8" }),
  };
}

/* ----------------------------------------------------------------------------------------------
 * Version aménagée (feuille d'exercices et évaluation)
 * -------------------------------------------------------------------------------------------- */

function etapesAmenageesDe(item: ItemEvaluation): EtapeAmenagee[] {
  if (item.enonceAmenage && item.enonceAmenage.length > 0) return item.enonceAmenage;
  const pts = pointsParSousQuestion(item);
  return item.section.questions.map((q, i) => ({ consigne: q.consigne, points: pts.get(lettreCle(i)) }));
}

function questionAmenageeHtml(item: ItemEvaluation, numero: number, estExercice: boolean): string {
  const etapes = etapesAmenageesDe(item);
  // Points par étape : ceux fournis par `enonceAmenage` sont des poids, ramenés au total ; à défaut,
  // ceux des sous-questions (déjà en points).
  const poids = etapes.map((e) => e.points ?? 0);
  const pts = !estExercice && item.enonceAmenage && poids.some((p) => p > 0) ? repartirEnDemiPoints(poids, item.points) : etapes.map((e) => e.points);
  const enonce = `${item.section.enteteFragments ? `<div>${fragmentsEnteteHtml(item.section.enteteFragments)}</div>` : ""}${item.section.enteteHtml ?? ""}`;
  const unique = etapes.length === 1 && !item.enonceAmenage;
  const etapesHtml = unique
    ? `<div class="etape-am"><div class="ligne"><span>${fragmentsVersHtml(etapes[0].consigne)}</span></div></div>`
    : etapes
        .map((e, i) => {
          const p = pts[i];
          return `<div class="etape-am"><div class="ligne"><span><b>Étape ${i + 1}.</b> ${fragmentsVersHtml(e.consigne)}</span>${!estExercice && p !== undefined && p > 0 ? `<span class="pts">${pointsTexte(p)}</span>` : ""}</div>${
            e.rappel ? `<div class="rappel">${fragmentsVersHtml(e.rappel)}</div>` : ""
          }</div>`;
        })
        .join("");
  const titre = estExercice ? `Exercice ${numero} ${etoiles(item.difficulte)}` : `Question ${numero}`;
  return `<section class="q-am"><h2><span>${titre}</span>${estExercice ? "" : `<span class="pts">${pointsTexte(item.points)}</span>`}</h2>${enonce ? `<div class="enonce-am">${enonce}</div>` : ""}${etapesHtml}</section>`;
}

export async function genererVersionAmenagee(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const cssKatex = await obtenirCssKatexAutonome();
  const estExercice = entete.mode === "exercice";
  const titre = estExercice ? titreNettoye(entete) : titreEvaluation(entete);
  const droite = estExercice ? "Mêmes exercices,<br>présentés pas à pas" : `Série ${echapperHtml(entete.serieLettre)}<br>Mêmes questions, même barème`;
  const tete = `<div class="tete-am"><div><span class="surtitre" style="color:#1d5b8f;font-weight:700">Version aménagée${estExercice ? " · Feuille d'exercices" : ""}</span><h1>${echapperHtml(titre)}</h1></div><span class="droite">${droite}</span></div>
<div class="identite-am"><span>Nom <span class="champ"></span></span><span>Classe <span class="champ" style="width:2.5cm"></span></span><span>${echapperHtml(dateEnToutesLettres(entete.date))}</span></div>
${!estExercice && entete.calculatrice ? `<p><b>Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.</b></p>` : ""}`;
  const pages = itemsNumerotes(items)
    .map(({ item, numero }, i) => `${i > 0 ? '<div class="saut-page"></div>' : ""}${i === 0 ? tete : ""}${questionAmenageeHtml(item, numero, estExercice)}`)
    .join("");
  const doc = documentHtml(`${titre} — Version aménagée`, pages, STYLE_AMENAGE, cssKatex, "amenagee");
  return new Blob([doc], { type: "text/html;charset=utf-8" });
}
