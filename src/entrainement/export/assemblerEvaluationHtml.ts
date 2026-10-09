import type { BlocCorrection, SectionExercice } from "./genererFeuilleExercices";
import { STYLE_PAGE, blocCorrectionHtml, echapperHtml, fragmentsVersHtml } from "./genererFeuilleExercicesHtml";
import { obtenirCssKatexAutonome } from "./katexImage";

/**
 * Assembleur HTML « évaluation » — pendant HTML de l'ancien assembleur PDF (`assemblerEvaluation.ts`,
 * supprimé : ce format le remplace entièrement, voir la décision prise avec l'utilisateur). Même
 * principe : une liste HÉTÉROGÈNE d'items déjà construits (un par question/exercice choisi dans
 * `/admin` de Math-Belgium, peu importe l'origine une fois réduits à `SectionExercice`/
 * `BlocCorrection[]`), regroupés par « processus » (1 = Connaître, 2 = Appliquer, 3 = Transférer —
 * les 3 processus du référentiel FWB), numérotés au sein de chaque partie. Produit DEUX documents
 * HTML autonomes (énoncé, corrigé) — voir `genererFeuilleExercicesHtml.ts` pour le mécanisme de
 * référence (CSS KaTeX inliné en `data:` URI, page A4 imprimable via `@page`) : ce fichier réutilise
 * ses briques bas niveau (`fragmentsVersHtml`, `zoneReponseHtml`, `blocCorrectionHtml`, `STYLE_PAGE`)
 * sans les dupliquer.
 *
 * Mise en page calquée sur un modèle réel fourni par l'utilisateur (3 fichiers Word, un par
 * niveau) : en-tête Nom/Prénom/N°/Date répété sur chaque page imprimée, et un bloc titre
 * (établissement, date, série, classe, matière+volume horaire, professeur, « Évaluation n°X :
 * titre », calculatrice) une seule fois en tête du document. Répétition de l'en-tête obtenue via
 * `<thead>` d'un tableau unique qui enveloppe toute la page (voir `STYLE_EVALUATION` — CSS 2.1
 * « table header/footer group », répété par le moteur d'impression à chaque saut de page) plutôt
 * que `position: fixed` : testé en pratique, `position: fixed` ne se répète PAS de façon fiable sur
 * chaque page imprimée par Chromium (l'en-tête finissait par apparaître une seule fois, décalé vers
 * le bas d'une page plutôt qu'en haut de chacune) — voir capture PDF fournie par l'utilisateur qui a
 * révélé le problème. Pas de pied de page (retiré à la demande de l'utilisateur — `genererEvaluationHtml`
 * n'ouvre plus de `<tfoot>`).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export interface ItemEvaluation {
  processus: 1 | 2 | 3;
  /** Titre de la section de cours, tel qu'affiché dans les deux documents (ex. "1. Fonction
   * réciproque d'une fonction bijective"). */
  titreSection: string;
  points: number;
  section: SectionExercice;
  correction: BlocCorrection[];
}

/** École et professeur : fixes pour l'instant (décision prise avec l'utilisateur — toujours la
 * même école/le même professeur sur chaque évaluation générée, aucun champ dans le formulaire). */
const ECOLE_NOM = "Collège Saint-Pierre";
const ECOLE_ADRESSE = "Rue J.B. Verbeyst 25, 1090 Bruxelles";
const PROFESSEUR = "M. Hamwi";

export interface EnteteEvaluation {
  /** Absent en mode `exercice` (pas de numérotation d'évaluation pour une feuille d'exercices
   * auto-générée par l'élève). */
  numero?: string;
  date: string;
  titre: string;
  niveauLabel: string;
  /** 4, 5 ou 6 — sert à « Classe : 4G..... », etc. */
  niveauNumero: number;
  /** Volume horaire hebdomadaire affiché « Mathématiques {heuresSemaine}h/sem » — texte libre
   * distinct du chantier plateforme-maths (ex. réel observé : 4e à 5h/sem alors que le chantier 4e
   * du site ne distingue pas les volumes horaires, les deux notions sont indépendantes). */
  heuresSemaine: string;
  /** Absent en mode `exercice` — la notion de calculatrice autorisée/interdite n'a de sens que pour
   * une évaluation notée, pas pour une feuille d'exercices d'entraînement. */
  calculatrice?: "interdite" | "autorisee";
  /** Lettre de la série anti-triche de cette évaluation précise (« A », « B »... — voir
   * `genererSeries` ci-dessous, qui construit une `EnteteEvaluation` par série). Toujours `"A"` en
   * mode `exercice` (jamais plusieurs séries pour une feuille d'exercices), mais non affichée dans
   * ce mode (voir `blocTitreHtml`). */
  serieLettre: string;
  /** `false` : masque le titre de section (ex. « 1. Fonction réciproque d'une fonction bijective »)
   * au-dessus de chaque groupe de questions — utile pour une évaluation qui ne doit pas révéler à
   * quel point du chapitre appartient chaque question. `true`/absent = comportement historique
   * (titre affiché). N'affecte que l'affichage, jamais le regroupement des questions par section
   * (`partieHtml` continue d'utiliser `titreSection` pour détecter les changements de groupe). */
  afficherTitresSection?: boolean;
  /** `"exercice"` : document « Feuille d'exercices » généré depuis `/exercice` de Math-Belgium
   * (page publique, accessible aux élèves, sans les champs propres à une évaluation notée — numéro,
   * calculatrice, séries anti-triche) plutôt que `/admin` — voir `blocTitreHtml`.
   * `"evaluation"`/absent = comportement historique. */
  mode?: "evaluation" | "exercice";
}

const TITRE_PARTIE: Record<1 | 2 | 3, string> = {
  1: "Processus 1 — Connaître",
  2: "Processus 2 — Appliquer",
  3: "Processus 3 — Transférer",
};

const STYLE_EVALUATION = `
/* Toute la page tient dans UN SEUL tableau (voir genererEvaluationHtml ci-dessous) : thead =
 * en-tête Nom/Prénom/N°/Date, tbody = tout le reste (bloc titre + questions) dans une unique
 * cellule qui se scinde naturellement entre les pages imprimées. Répétition du thead à chaque saut
 * de page = comportement standard des groupes de lignes de tableau en CSS 2.1, respecté par le
 * moteur d'impression de Chromium (contrairement à position:fixed — voir commentaire de tête du
 * fichier). Pas de tfoot — pas de pied de page. */
.page-cadre { width: 100%; border-collapse: collapse; }
.page-cadre > thead > tr > td, .page-cadre > tbody > tr > td {
  border: none; padding: 0; text-align: left; font-size: inherit;
}
.entete-repetee {
  font-size: 9pt; line-height: 1.35; color: #333;
  border-bottom: 1px solid #999; padding-bottom: 4px; margin-bottom: 12px;
}
.entete-repetee .ligne { display: flex; justify-content: space-between; gap: 24px; }
.bloc-titre { border-collapse: collapse; width: 100%; margin: 0 0 1.2em; }
.bloc-titre td { border: 1px solid #999; padding: 8px 10px; font-size: 10.5pt; vertical-align: top; text-align: left; }
.bloc-titre .ecole-nom { font-weight: bold; }
.bloc-titre .calculatrice { font-style: italic; }
/* Feuille d'exercices (mode "exercice") : même contenu que le bloc-titre de l'évaluation, sans
 * l'encadré — trop formel pour une feuille que l'élève imprime lui-même. */
.bloc-titre-sans-cadre td { border: none; padding: 4px 0; }
.sous-titre { color: #444; margin: 0 0 1em; }
.points { color: #2E74B5; font-weight: normal; font-size: 0.85em; }
.titre-section {
  font-size: 12.5pt; color: #444; margin: 1.3em 0 0.5em; padding-bottom: 2px;
  border-bottom: 1px solid #ccc; page-break-after: avoid; break-after: avoid;
}
.question-titre { font-size: 11.5pt; margin: 1em 0 0.4em; }
.grille-graphes-cyclo {
  display: grid; grid-template-columns: repeat(2, auto); gap: 10px; justify-content: center;
  margin: 0.6em 0; page-break-inside: avoid; break-inside: avoid;
}
.graphe-cyclo { display: block; }
/* Croquis de 5gen12 (Problèmes de géométrie du cercle, export/svgGraphGeometrieCercle.ts) — même
 * boîte/couleurs que .geometrie-cercle-conteneur/.geometrie-cercle-label de App.css (écran
 * interactif), adaptées en valeurs littérales : cette feuille a son propre stylesheet autonome, sans
 * les tokens --color-* de l'app React. */
.geometrie-cercle-conteneur {
  display: block; width: 100%; max-width: 280px; margin: 0.6em auto; border: 1px solid #ccc;
  border-radius: 6px; page-break-inside: avoid; break-inside: avoid;
}
.geometrie-cercle-conteneur-large { max-width: 320px; }
.geometrie-cercle-label { font-size: 13px; font-weight: 700; fill: #555; }
.tableau-regroupe { border-collapse: collapse; margin: 0.4em 0; }
.tableau-regroupe td { border: none; padding: 3px 10px 3px 0; vertical-align: top; text-align: left; }
.tableau-regroupe td.lettre-regroupe { font-weight: bold; white-space: nowrap; padding-right: 6px; }
.correction .question-enonce { color: #000; }
.correction .reponse-detaillee { color: #1155CC; margin-top: 0.5em; }

@media print {
  @page { size: A4; margin: 1.5cm 2cm; }
}
`;

function enteteRepeteeHtml(): string {
  return `
<div class="entete-repetee">
  <div class="ligne"><span>Nom et prénom : ______________________________________</span><span>N° ____</span></div>
</div>
`;
}

function blocTitreHtml(entete: EnteteEvaluation, suffixe?: string): string {
  const estExercice = entete.mode === "exercice";
  const ligneDate = estExercice
    ? `Date : ${echapperHtml(entete.date)} &nbsp;&nbsp; Classe : ${entete.niveauNumero}G.....`
    : `Date : ${echapperHtml(entete.date)} — Série ${echapperHtml(entete.serieLettre)} &nbsp;&nbsp; Classe : ${entete.niveauNumero}G.....`;
  const titreLigne = estExercice
    ? `Feuille d'exercices : ${echapperHtml(entete.titre)}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}`
    : `Évaluation n°${echapperHtml(entete.numero ?? "")} : ${echapperHtml(entete.titre)}${suffixe ? ` — ${echapperHtml(suffixe)}` : ""}`;
  const calculatriceLigne = estExercice
    ? ""
    : `<br><span class="calculatrice">${entete.calculatrice === "interdite" ? "(Calculatrice interdite !)" : "(Calculatrice autorisée)"}</span>`;
  const classeTable = estExercice ? "bloc-titre bloc-titre-sans-cadre" : "bloc-titre";
  // Feuille d'exercices (mode "exercice") : page publique, générée par n'importe quel élève pour
  // n'importe quelle classe — ni l'établissement/adresse (ECOLE_NOM/ECOLE_ADRESSE), ni le
  // professeur titulaire (PROFESSEUR) n'ont de sens ici, contrairement à l'évaluation imprimée par
  // un professeur précis pour sa classe : la ligne "Mathématiques Xh/sem" remonte donc à la place
  // de l'établissement, sans mention du professeur.
  const ligne1Gauche = estExercice ? `<strong>Mathématiques ${echapperHtml(entete.heuresSemaine)}h/sem</strong>` : `<span class="ecole-nom">${echapperHtml(ECOLE_NOM)}</span><br>${echapperHtml(ECOLE_ADRESSE)}`;
  const ligne2 = estExercice
    ? `
  <tr>
    <td></td>
    <td><strong>${titreLigne}</strong>${calculatriceLigne}</td>
  </tr>`
    : `
  <tr>
    <td><strong>Mathématiques ${echapperHtml(entete.heuresSemaine)}h/sem</strong><br>Professeur : <strong>${echapperHtml(PROFESSEUR)}</strong></td>
    <td><strong>${titreLigne}</strong>${calculatriceLigne}</td>
  </tr>`;
  return `
<table class="${classeTable}">
  <tr>
    <td>${ligne1Gauche}</td>
    <td>${ligneDate}</td>
  </tr>${ligne2}
</table>
`;
}

/** Rendu du CORPS d'une question (entête + questions a)/b)/c)…) — partagé par l'énoncé et le
 * corrigé : le corrigé réaffiche désormais l'énoncé complet (voir `questionCorrectionHtml`) au lieu
 * de sauter directement à la correction, pour que l'élève n'ait pas besoin de garder l'énoncé sous
 * les yeux en parallèle. Ni l'un ni l'autre n'affiche de zone de réponse vierge (`zoneReponseHtml`)
 * : l'élève répond sur une feuille à part, pas sur la copie imprimée elle-même. */
function corpsQuestionHtml(item: ItemEvaluation): string {
  let html = "";
  if (item.section.enteteFragments) {
    html += `<div class="entete">${fragmentsVersHtml(item.section.enteteFragments, { bloc: true })}</div>`;
  }
  if (item.section.enteteHtml) {
    html += item.section.enteteHtml;
  }
  if (item.section.disposeEnTableau && item.section.questions.length > 1) {
    html += `<table class="tableau-regroupe"><tbody>`;
    item.section.questions.forEach((question, q) => {
      const lettre = `${LETTRES[q] ?? String(q + 1)})`;
      html += `<tr><td class="lettre-regroupe">${lettre}</td><td>${fragmentsVersHtml(question.consigne)}</td></tr>`;
    });
    html += `</table>`;
  } else {
    item.section.questions.forEach((question, q) => {
      const lettre = item.section.questions.length > 1 ? `${LETTRES[q] ?? String(q + 1)}) ` : "";
      html += `<p>${lettre ? `<strong>${lettre}</strong>` : ""}${fragmentsVersHtml(question.consigne)}</p>`;
    });
  }
  return html;
}

/** `estExercice` : feuille d'exercices (mode `exercice`) — les points n'ont de sens que pour une
 * évaluation notée, jamais affichés ici (voir aussi `genererEvaluationHtml`, qui masque de la même
 * façon le total de points en pied de bloc-titre pour ce mode). */
function questionEnonceHtml(item: ItemEvaluation, numero: number, estExercice: boolean): string {
  const pointsSpan = estExercice ? "" : ` <span class="points">(${item.points} point${item.points > 1 ? "s" : ""})</span>`;
  const html = `<h4 class="question-titre">Question ${numero}${pointsSpan}</h4>${corpsQuestionHtml(item)}`;
  return `<section class="exercice">${html}</section>`;
}

/** Corrigé : la question (noir, identique à l'énoncé) suivie de la réponse détaillée (bleu,
 * `.reponse-detaillee`) — voir `STYLE_EVALUATION`. */
function questionCorrectionHtml(item: ItemEvaluation, numero: number): string {
  const html = `<h4 class="question-titre">Question ${numero}</h4><div class="question-enonce">${corpsQuestionHtml(item)}</div><div class="reponse-detaillee">${item.correction.map(blocCorrectionHtml).join("")}</div>`;
  return `<section class="correction">${html}</section>`;
}

/**
 * Regroupe par processus, puis par section au sein d'un même processus — le titre de section
 * (ex. « 1. Fonction réciproque d'une fonction bijective ») n'est imprimé qu'UNE FOIS par groupe
 * (`<h3 class="titre-section">`), jamais répété dans chaque question comme avant (un item
 * `vraiFaux`/`exercice` avec `nombre` > 1 produit plusieurs `ItemEvaluation` partageant la même
 * `titreSection` consécutivement, voir `AppEvaluation6e.tsx`).
 */
function partieHtml(items: ItemEvaluation[], construireQuestion: (item: ItemEvaluation, numero: number) => string, afficherTitresSection: boolean): string {
  const parProcessus = new Map<1 | 2 | 3, ItemEvaluation[]>();
  for (const item of items) {
    const liste = parProcessus.get(item.processus) ?? [];
    liste.push(item);
    parProcessus.set(item.processus, liste);
  }

  const blocs: string[] = [];
  for (const processus of [1, 2, 3] as const) {
    const liste = parProcessus.get(processus);
    if (!liste || liste.length === 0) continue;
    blocs.push(`<h2>${TITRE_PARTIE[processus]}</h2>`);
    let titreSectionCourant: string | null = null;
    liste.forEach((item, i) => {
      if (afficherTitresSection && item.titreSection !== titreSectionCourant) {
        titreSectionCourant = item.titreSection;
        blocs.push(`<h3 class="titre-section">${echapperHtml(titreSectionCourant)}</h3>`);
      }
      blocs.push(construireQuestion(item, i + 1));
    });
  }
  return blocs.join("");
}

/**
 * Produit les deux documents HTML (Blob, autonomes/imprimables) — énoncé et corrigé — pour UNE
 * série d'items déjà construits. Pour plusieurs séries anti-triche, appeler cette fonction une fois
 * par série (voir `AppEvaluation6e.tsx`, qui construit un `ItemEvaluation[]` indépendamment
 * randomisé par série et lui associe la lettre correspondante dans `entete.serieLettre`).
 */
export async function genererEvaluationHtml(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<{ enonce: Blob; corrige: Blob }> {
  const cssKatex = await obtenirCssKatexAutonome();
  const totalPoints = items.reduce((total, item) => total + item.points, 0);
  const afficherTitresSection = entete.afficherTitresSection ?? true;
  const estExercice = entete.mode === "exercice";
  const suffixeTitreOnglet = estExercice ? "" : ` — Série ${echapperHtml(entete.serieLettre)}`;

  const docEnonce = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${echapperHtml(entete.titre)}${suffixeTitreOnglet}</title>
<style>${cssKatex}${STYLE_PAGE}${STYLE_EVALUATION}</style>
</head>
<body>
<table class="page-cadre">
<thead><tr><td>${enteteRepeteeHtml()}</td></tr></thead>
<tbody><tr><td>
${blocTitreHtml(entete)}
${estExercice ? "" : `<p class="sous-titre">${totalPoints} points au total — Note : _____ / ${totalPoints}</p>`}
${partieHtml(items, (item, numero) => questionEnonceHtml(item, numero, estExercice), afficherTitresSection)}
</td></tr></tbody>
</table>
</body>
</html>`;

  const docCorrige = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${echapperHtml(entete.titre)}${suffixeTitreOnglet} — Corrigé</title>
<style>${cssKatex}${STYLE_PAGE}${STYLE_EVALUATION}</style>
</head>
<body>
<table class="page-cadre">
<thead><tr><td>${enteteRepeteeHtml()}</td></tr></thead>
<tbody><tr><td>
${blocTitreHtml(entete, "Corrigé")}
${partieHtml(items, questionCorrectionHtml, afficherTitresSection)}
</td></tr></tbody>
</table>
</body>
</html>`;

  return {
    enonce: new Blob([docEnonce], { type: "text/html;charset=utf-8" }),
    corrige: new Blob([docCorrige], { type: "text/html;charset=utf-8" }),
  };
}
