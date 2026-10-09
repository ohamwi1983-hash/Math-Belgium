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
  /** `true` : rend `questions` sous forme de tableau à 2 colonnes (lettre | contenu), bordures
   * invisibles, plutôt que des paragraphes `a) …`/`b) …` empilés — utilisé pour le regroupement de
   * plusieurs instances d'un même générateur sous UNE question (voir `AdaptateurFeuilleExercices.regroupable`
   * et `AppEvaluation6e.tsx::construireItemsExercice`). Ignoré par les pipelines Word/PDF (HTML
   * uniquement, `assemblerEvaluationHtml.ts`). */
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
  /** `true` ssi ce générateur produit TOUJOURS une seule question par instance, avec une consigne
   * GÉNÉRIQUE (indépendante des valeurs tirées, ex. une constante `CONSIGNE_GENERALE`) — permet à
   * `/admin` de Math-Belgium de regrouper plusieurs instances demandées sous UNE question imprimée
   * plutôt qu'une par instance : `construireEnonce(instance).enteteFragments` de chaque instance
   * devient une ligne a)/b)/c) d'un tableau à bordures invisibles (`SectionExercice.disposeEnTableau`),
   * la consigne (`questions[0].consigne`, identique pour toutes les instances par construction)
   * n'étant alors affichée qu'UNE SEULE FOIS — voir `AppEvaluation6e.tsx::construireItemsExercice`.
   * Absent/`false` = comportement historique (une question complète par instance). Ne JAMAIS activer
   * pour un générateur dont la consigne dépend de l'instance (ex. mentionne une valeur tirée) ou qui
   * a plusieurs questions par instance, ou qui utilise `enteteHtml` (graphique) — aucun de ces 3 cas
   * n'est représentable par ce mécanisme. */
  regroupable?: boolean;
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
