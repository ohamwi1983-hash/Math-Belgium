import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  TabStopType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type FileChild,
  type ParagraphChild,
} from "docx";
import { fragmentsVersRunsDocx } from "./fragmentsDocx";
import {
  dateEnToutesLettres,
  droiteBandeau,
  dureeEstimeeMinutes,
  enteteCourantExamen,
  nombreFr,
  partiesDuDocument,
  phraseHoraire,
  pointsCriteres,
  pointsParSousQuestion,
  pointsTexte,
  reponsesDeLaQuestion,
  TEXTE_CONSIGNES,
  titreEvaluation,
  titreExamen,
  titreNettoye,
  totalPartie,
  type EnteteEvaluation,
  type ExamenDocument,
  type ItemEvaluation,
  type LigneGroupe,
  rangsDesFigures,
  SEUIL_DEUX_FIGURES,
} from "./assemblerEvaluationHtml";
import { couleurProcessusDocx } from "./couleursProcessus";
import { etiquetteQuestion, fragmentsConsigne, lignePartie, NOM_PROCESSUS_EXAMEN, type PartieExamen } from "./examen";
import type { BlocCorrection, CritereBareme, EtapeCorrection, FragmentConsigne, LigneCalcul } from "./genererFeuilleExercices";
import { blocsDeColonnes, colonnesReponses, largeurColonneTableau, largeurFragments, largeurLibelleBloc, largeurLibelleTableau, segmentsDuGroupe, type TableauGroupe } from "./grilleCorrection";
import { decouperLigneCalcul, estLignePiege } from "./corrigeTableau";
import { cartoucheEffectif, morceauxSurtitre } from "./cartouche";

/**
 * Export Word (.docx) d'une série d'évaluation, pour que le professeur puisse retoucher les
 * documents dans Word avant impression — même contenu que les documents HTML
 * (`assemblerEvaluationHtml.ts`) :
 * - COPIE (énoncé élève) : en-tête, tableau des résultats par processus, calculatrice, encadré
 *   « Consignes », questions numérotées en continu, points par question et par sous-question, pied
 *   de page « Série · Nom · page n / N » ;
 * - CORRIGÉ : la copie (sans tableau des résultats) avec, sous chaque question, son corrigé détaillé
 *   (« Étape n — consigne », lignes Méthode / Calcul / Conclusion…, encadré « Piège ») ;
 * - GRILLE de correction : réponse finale, critères et leurs points, erreurs fréquentes, réponses
 *   acceptées, code de l'exercice, règle de correction.
 *
 * Formules : images PNG (KaTeX rasterisé, `fragmentsDocx.ts` — `docx` n'écrit pas d'équation Word
 * native), comme la copie l'a toujours fait. Graphiques SVG (`enteteHtml` de l'énoncé, `figureHtml`
 * du corrigé, blocs `html` de l'ancien corrigé) : rasterisés en PNG après avoir recopié en ligne les
 * styles calculés par la page (classes `svg-*` du thème) ; en cas d'échec, une mention « graphique :
 * voir la version HTML » les remplace.
 */

const NOM_PROCESSUS: Record<1 | 2 | 3, string> = { 1: "Connaître", 2: "Appliquer", 3: "Transférer" };
const LETTRES = "abcdefghijklmnopqrstuvwxyz";
/** « École · adresse · Mathématiques 4h/sem · Professeur » : profil et école choisie
 * (`EnteteEvaluation.cartouche`), sinon valeurs historiques (`cartouche.ts`) — texte identique à
 * avant les comptes quand il n'y a pas de cartouche. `docx` échappe lui-même le XML. */
function surtitreDocx(entete: EnteteEvaluation): string {
  const c = cartoucheEffectif(entete.cartouche);
  const ecole = [c.ecoleNom, c.ecoleAdresse].filter((m) => m !== "").join(" · ");
  return morceauxSurtitre({ ...c, ecoleNom: ecole }, `Mathématiques ${entete.heuresSemaine}h/sem`).join(" · ");
}

const PROPRIETES_SVG = ["fill", "stroke", "stroke-width", "stroke-dasharray", "opacity", "fill-opacity", "stroke-opacity", "font-size", "font-family", "font-weight", "text-anchor", "dominant-baseline"];

async function svgVersPng(svg: SVGSVGElement): Promise<{ donnees: Uint8Array; largeur: number; hauteur: number } | null> {
  const rect = svg.getBoundingClientRect();
  const largeur = Math.round(rect.width || Number(svg.getAttribute("width")) || 300);
  const hauteur = Math.round(rect.height || Number(svg.getAttribute("height")) || 200);
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const originaux = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const copies = [clone, ...Array.from(clone.querySelectorAll("*"))];
  originaux.forEach((el, i) => {
    const style = getComputedStyle(el);
    const cible = copies[i] as SVGElement;
    for (const p of PROPRIETES_SVG) {
      const v = style.getPropertyValue(p);
      if (v) cible.style.setProperty(p, v);
    }
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(largeur));
  clone.setAttribute("height", String(hauteur));
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((ok, ko) => {
      img.onload = () => ok();
      img.onerror = () => ko(new Error("svg"));
      img.src = url;
    });
    const echelle = 2;
    const canvas = document.createElement("canvas");
    canvas.width = largeur * echelle;
    canvas.height = hauteur * echelle;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/png"));
    if (!blob) return null;
    return { donnees: new Uint8Array(await blob.arrayBuffer()), largeur, hauteur };
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Graphiques d'un `enteteHtml` → paragraphes image (montés hors écran le temps du calcul des styles). */
async function htmlVersParagraphes(html: string): Promise<FileChild[]> {
  const hote = document.createElement("div");
  hote.style.cssText = "position:fixed;left:-10000px;top:0;width:700px;background:#fff";
  hote.innerHTML = html;
  document.body.appendChild(hote);
  try {
    const svgs = Array.from(hote.querySelectorAll("svg"));
    if (svgs.length === 0) return [];
    const runs: ParagraphChild[] = [];
    for (const svg of svgs) {
      const png = await svgVersPng(svg);
      if (png) {
        // Largeur maximale ≈ 8 cm à 96 dpi pour garder la mise en page compacte.
        const facteur = Math.min(1, 300 / png.largeur);
        runs.push(new ImageRun({ type: "png", data: png.donnees, transformation: { width: Math.round(png.largeur * facteur), height: Math.round(png.hauteur * facteur) } }), new TextRun("  "));
      } else {
        runs.push(new TextRun({ text: "[graphique : voir la version HTML] ", italics: true }));
      }
    }
    return [new Paragraph({ children: runs, alignment: AlignmentType.CENTER, spacing: { before: 80, after: 80 } })];
  } finally {
    hote.remove();
  }
}

function cellule(texteCellule: string, options?: { gras?: boolean; largeur?: number; couleur?: string }): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text: texteCellule, bold: options?.gras, size: 18, color: options?.couleur })], alignment: AlignmentType.CENTER })],
    width: options?.largeur ? { size: options.largeur, type: WidthType.PERCENTAGE } : undefined,
  });
}

function tableauResultats(items: ItemEvaluation[]): Table {
  const totaux = ([1, 2, 3] as const).map((p) => ({ p, t: items.filter((it) => it.processus === p).reduce((s, it) => s + it.points, 0) })).filter((x) => x.t > 0);
  const total = items.reduce((s, it) => s + it.points, 0);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cellule("Processus", { gras: true }), ...totaux.map((x) => cellule(NOM_PROCESSUS[x.p], { gras: true, couleur: couleurProcessusDocx(x.p) })), cellule("Total", { gras: true })] }),
      new TableRow({ children: [cellule("Points"), ...totaux.map((x) => cellule(`…… / ${nombreFr(x.t)}`)), cellule(`…… / ${nombreFr(total)}`, { gras: true })] }),
    ],
  });
}

function ptsRun(points: number): TextRun {
  return new TextRun({ text: `  (${pointsTexte(points)})`, size: 18, color: "4A4F58" });
}


const ACCENT = "1D5B8F";
const GRIS = "4A4F58";
const ALERTE = "9A3B12";
const BON = "2F6B3A";
/** Largeur utile de la page en twips (A4 11 906 − marges 2 × 1 000). */
const LARGEUR_UTILE = 9906;

/** En-tête commun (école, titre, date · série en gras · durée, champs Nom/Classe/N°). */
function enteteDocx(entete: EnteteEvaluation, items: ItemEvaluation[], suffixe?: string): FileChild[] {
  return [
    new Paragraph({ children: [new TextRun({ text: surtitreDocx(entete), size: 16, color: ACCENT })] }),
    new Paragraph({ children: [new TextRun({ text: `${titreEvaluation(entete)}${suffixe ? ` — ${suffixe}` : ""}`, bold: true, size: 32 })], spacing: { before: 60 } }),
    new Paragraph({
      children: [
        new TextRun({ text: `${dateEnToutesLettres(entete.date)} · Série `, size: 18, color: GRIS }),
        // Lettre de série en gras (demande de l'utilisateur), comme dans la copie HTML.
        new TextRun({ text: entete.serieLettre, size: 18, color: "1F2937", bold: true }),
        new TextRun({ text: entete.afficherDuree ? ` · ${dureeEstimeeMinutes(items)} minutes` : "", size: 18, color: GRIS }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({ children: [new TextRun({ text: "Nom : ________________________________    Classe : __________    N° : ____", size: 20 })], spacing: { after: 160 } }),
  ];
}

/** Encadré « Consignes » (même texte que la copie HTML). */
async function consignesDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Paragraph[]> {
  const calculatrice = entete.calculatrice ? ` Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.` : "";
  const duree = entete.afficherDuree ? ` Durée : ${dureeEstimeeMinutes(items)} minutes.` : "";
  const bord = { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } as const;
  const sup = entete.consignesSupplementaires ?? [];
  return [
    new Paragraph({
      children: [new TextRun({ text: "Consignes", bold: true, color: ACCENT, size: 20 }), new TextRun({ text: ` — ${TEXTE_CONSIGNES}${calculatrice}${duree}`, size: 20 })],
      border: { top: bord, bottom: bord, left: bord, right: bord },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" },
      spacing: { before: 160, after: sup.length ? 0 : 120 },
    }),
    ...(await pucesConsignesDocx(sup)),
  ];
}

/** Puces des consignes supplémentaires, dans le même cadre que l'encadré « Consignes » (paragraphes
 * au même cadre : Word les fusionne) — examen ET évaluation. */
async function pucesConsignesDocx(lignes: string[]): Promise<Paragraph[]> {
  const bord = { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } as const;
  const cadre = { border: { top: bord, bottom: bord, left: bord, right: bord }, shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" } } as const;
  const res: Paragraph[] = [];
  for (let i = 0; i < lignes.length; i++) {
    const derniere = i === lignes.length - 1;
    res.push(
      new Paragraph({
        ...cadre,
        children: [new TextRun({ text: "•\t", size: 20 }), ...(await fragmentsVersRunsDocx(fragmentsConsigne(lignes[i])))],
        tabStops: [{ type: TabStopType.LEFT, position: 280 }],
        indent: { left: 280, hanging: 280 },
        spacing: { before: 20, after: derniere ? 120 : 0 },
      }),
    );
  }
  return res;
}

/** Bandeau d'un processus (« Processus 2 — Appliquer (8 pts) »). */
function bandeauProcessus(p: 1 | 2 | 3, total: number): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `Processus ${p} — ${NOM_PROCESSUS[p]}`, bold: true, color: couleurProcessusDocx(p), size: 24 }), ptsRun(total)],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: couleurProcessusDocx(p, "trait"), space: 2 } },
    spacing: { before: 320, after: 120 },
    keepNext: true,
  });
}

/** Énoncé d'une question : titre et points, en-tête, figures, sous-questions avec leurs points. */
async function enonceQuestionDocx(item: ItemEvaluation, numero: number, etiquette?: string, couleurEtiquette?: string): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  // Examen : étiquette du processus (dans sa couleur) / du chapitre (grise) en petites capitales après le numéro.
  const tag = etiquette ? [new TextRun({ text: `   ${etiquette.toLocaleUpperCase("fr")}`, size: 15, bold: true, color: couleurEtiquette ?? GRIS, font: "Arial" })] : [];
  enfants.push(new Paragraph({ children: [new TextRun({ text: `Question ${numero}`, bold: true }), ...tag, ptsRun(item.points)], spacing: { before: 200 }, keepNext: true }));
  // Groupe à graphique : la consigne reste avec la première rangée de figures.
  const figures = !!item.groupe?.some((l) => l.figureHtml);
  if (item.section.enteteFragments) enfants.push(new Paragraph({ children: await fragmentsVersRunsDocx(item.section.enteteFragments), spacing: { after: 60 }, keepNext: figures ? true : undefined }));
  if (item.section.enteteHtml) enfants.push(...(await htmlVersParagraphes(item.section.enteteHtml)));
  const pts = pointsParSousQuestion(item);
  if (figures && item.groupe) {
    enfants.push(...(await rangsFiguresDocx(item.groupe, pts)));
    return enfants;
  }
  const plusieurs = item.section.questions.length > 1;
  for (let q = 0; q < item.section.questions.length; q++) {
    const lettre = LETTRES[q] ?? String(q + 1);
    const runs = await fragmentsVersRunsDocx(item.section.questions[q].consigne);
    const p = pts.get(lettre);
    // Points de la sous-question dans une colonne à droite (taquet aligné à droite), comme la copie HTML.
    enfants.push(
      new Paragraph({
        children: [...(plusieurs ? [new TextRun({ text: `${lettre}) `, bold: true })] : []), ...runs, ...(plusieurs && p !== undefined ? [new TextRun({ text: `\t${pointsTexte(p)}`, size: 18, color: GRIS })] : [])],
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE - (plusieurs ? 240 : 0) }],
        spacing: { before: 60 },
        indent: plusieurs ? { left: 240 } : undefined,
        // Question regroupée : une ligne ne se sépare pas de la consigne quand c'est la première.
        keepNext: item.groupe && q === 0 ? true : undefined,
        keepLines: item.groupe ? true : undefined,
      }),
    );
    const figure = item.groupe?.[q]?.figureHtml;
    if (figure) enfants.push(...(await htmlVersParagraphes(figure)));
  }
  return enfants;
}

/** Groupe à graphique (une figure par ligne) : mêmes rangées que la copie HTML (`rangsDesFigures`,
 * seuil de la copie) — deux cellules côte à côte dans un tableau sans bordure dont la rangée ne se
 * coupe jamais, sinon la ligne (lettre, donnée, points au taquet droit) liée à sa figure. Figures
 * rasterisées comme celles de l'énoncé (`htmlVersParagraphes`). */
async function rangsFiguresDocx(lignes: LigneGroupe[], pts: Map<string, number>): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  const enTete = async (i: number, largeur: number, avecFigure: boolean) => {
    const lettre = LETTRES[i] ?? String(i + 1);
    const p = pts.get(lettre);
    return new Paragraph({
      children: [
        new TextRun({ text: `${lettre}) `, bold: true }),
        ...(await fragmentsVersRunsDocx(lignes[i].enonce)),
        ...(p !== undefined ? [new TextRun({ text: `\t${pointsTexte(p)}`, size: 18, color: GRIS })] : []),
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: largeur }],
      spacing: { before: 60 },
      keepNext: avecFigure ? true : undefined,
      keepLines: true,
    });
  };
  for (const rang of rangsDesFigures(lignes, SEUIL_DEUX_FIGURES)) {
    if (rang.length === 1) {
      const i = rang[0];
      const figure = lignes[i].figureHtml;
      enfants.push(await enTete(i, LARGEUR_UTILE - 240, !!figure));
      if (figure) enfants.push(...(await htmlVersParagraphes(figure)));
      continue;
    }
    const largeurCellule = Math.floor(LARGEUR_UTILE / 2);
    const cellules: TableCell[] = [];
    for (const i of rang) {
      const figure = lignes[i].figureHtml;
      const contenu: FileChild[] = [await enTete(i, largeurCellule - 200, !!figure), ...(figure ? await htmlVersParagraphes(figure) : [])];
      cellules.push(new TableCell({ children: contenu as (Paragraph | Table)[], width: { size: largeurCellule, type: WidthType.DXA }, borders: BORDS_INVISIBLES }));
    }
    enfants.push(new Table({ rows: [new TableRow({ children: cellules, cantSplit: true })], columnWidths: rang.map(() => largeurCellule), borders: BORDS_INVISIBLES }));
  }
  return enfants;
}

/** Questions groupées par processus, numérotées en continu. `corrige` : corrigé détaillé sous chacune. */
async function questionsDocx(entete: EnteteEvaluation, items: ItemEvaluation[], corrige: boolean): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  let numero = 0;
  for (const p of [1, 2, 3] as const) {
    const liste = items.filter((it) => it.processus === p);
    if (liste.length === 0) continue;
    enfants.push(bandeauProcessus(p, liste.reduce((s, it) => s + it.points, 0)));
    let sectionCourante: string | null = null;
    for (const item of liste) {
      numero++;
      if (entete.afficherTitresSection && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        enfants.push(new Paragraph({ children: [new TextRun({ text: item.titreSection, size: 18, color: GRIS })], spacing: { before: 120 } }));
      }
      enfants.push(...(await enonceQuestionDocx(item, numero)));
      if (corrige) enfants.push(...(await correctionDocx(item)));
    }
  }
  return enfants;
}

/* ----------------------------------------------------------------------------------------------
 * Corrigé détaillé (même structure que `correctionHtml`)
 * -------------------------------------------------------------------------------------------- */

const COULEUR_CORRIGE = "1155CC";

const SANS_BORD = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const BORDS_INVISIBLES = { top: SANS_BORD, bottom: SANS_BORD, left: SANS_BORD, right: SANS_BORD, insideHorizontal: SANS_BORD, insideVertical: SANS_BORD };

/** Chaîne de calcul « comme au tableau » : tableau sans bordure à trois colonnes (membre de gauche
 * aligné à droite, relation et suite alignées à gauche — les « = » tombent les uns sous les autres —,
 * justification en petit italique), lignes jamais coupées d'une page à l'autre. */
async function calculDocx(lignes: LigneCalcul[]): Promise<Table> {
  const avecJustif = lignes.some((l) => l.justification !== undefined);
  const largeurs = avecJustif ? [2600, 4300, 2400] : [3000, 6300];
  const rangees: TableRow[] = [];
  for (const l of lignes) {
    const { gauche, droite } = decouperLigneCalcul(l.latex);
    const cell = (enfants: ParagraphChild[], largeur: number, alignement?: (typeof AlignmentType)[keyof typeof AlignmentType], colonnes?: number) =>
      new TableCell({ children: [new Paragraph({ children: enfants, alignment: alignement })], width: { size: largeur, type: WidthType.DXA }, columnSpan: colonnes, borders: BORDS_INVISIBLES });
    const cellules: TableCell[] =
      droite === null
        ? [cell(await fragmentsVersRunsDocx([{ type: "latex", valeur: gauche }]), largeurs[0] + largeurs[1], AlignmentType.LEFT, 2)]
        : [
            cell(gauche ? await fragmentsVersRunsDocx([{ type: "latex", valeur: gauche }]) : [], largeurs[0], AlignmentType.RIGHT),
            cell(await fragmentsVersRunsDocx([{ type: "latex", valeur: `{}${droite}` }]), largeurs[1], AlignmentType.LEFT),
          ];
    if (avecJustif) {
      const j = l.justification === undefined ? [] : typeof l.justification === "string" ? [{ type: "texte" as const, valeur: l.justification }] : l.justification;
      const runs: ParagraphChild[] = [];
      for (const f of j) runs.push(...(f.type === "texte" ? [new TextRun({ text: f.valeur, italics: true, size: 16, color: GRIS })] : await fragmentsVersRunsDocx([f])));
      cellules.push(cell(runs, largeurs[2], AlignmentType.LEFT));
    }
    rangees.push(new TableRow({ children: cellules, cantSplit: true }));
  }
  return new Table({ rows: rangees, columnWidths: largeurs, borders: BORDS_INVISIBLES, indent: { size: 240, type: WidthType.DXA } });
}

async function lignesEtapesDocx(etapes: EtapeCorrection[]): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  for (const e of etapes.filter((x) => !estLignePiege(x))) {
    const lbl = `${e.sousQuestion ? `${e.sousQuestion.replace(/\)$/, "")}) ` : ""}${e.label}`.trim();
    const bordResultat = { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 3 } as const;
    const runsLbl = lbl ? [new TextRun({ text: `${lbl}  `, bold: true, color: ACCENT, size: 18 })] : [];
    if (e.type === "resultat") {
      // Résultat encadré : étiquette sur sa ligne, puis le résultat dans un cadre.
      enfants.push(new Paragraph({ children: runsLbl, spacing: { before: 40 }, indent: { left: 240 }, keepNext: true }));
      enfants.push(
        new Paragraph({
          children: await fragmentsVersRunsDocx(e.fragments),
          border: { top: bordResultat, bottom: bordResultat, left: bordResultat, right: bordResultat },
          shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" },
          spacing: { before: 20, after: 40 },
          indent: { left: 480, right: 2400 },
        }),
      );
    } else {
      const texteLigne = await fragmentsVersRunsDocx(e.fragments);
      enfants.push(new Paragraph({ children: [...runsLbl, ...texteLigne], spacing: { before: 40 }, indent: { left: 240 }, keepNext: !!e.calcul?.length }));
    }
    if (e.calcul?.length) enfants.push(await calculDocx(e.calcul));
    if (e.figureHtml) enfants.push(...(await htmlVersParagraphes(e.figureHtml)));
  }
  for (const e of etapes.filter(estLignePiege)) {
    enfants.push(
      new Paragraph({
        children: [new TextRun({ text: "PIÈGE  ", bold: true, color: ALERTE, size: 18 }), ...(await fragmentsVersRunsDocx(e.fragments))],
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "F3F5F8" },
        spacing: { before: 80, after: 40 },
        indent: { left: 240 },
      }),
    );
  }
  return enfants;
}

async function blocCorrectionDocx(bloc: BlocCorrection): Promise<FileChild[]> {
  if (bloc.type === "html") return htmlVersParagraphes(bloc.html);
  if (bloc.type === "tableau") {
    const n = (bloc.valeursParLigne[0]?.length ?? 0) + 1;
    const largeur = Math.floor(LARGEUR_UTILE / n);
    return [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: Array.from({ length: n }, () => largeur),
        rows: bloc.libellesLignes.map((libelle, i) => new TableRow({ children: [cellule(libelle, { gras: true }), ...(bloc.valeursParLigne[i] ?? []).map((v) => cellule(v))] })),
      }),
    ];
  }
  return [new Paragraph({ children: await fragmentsVersRunsDocx(bloc.fragments, { bloc: bloc.bloc }), alignment: bloc.bloc ? AlignmentType.CENTER : undefined, spacing: { before: 40 }, indent: { left: 240 } })];
}

async function correctionDocx(item: ItemEvaluation): Promise<FileChild[]> {
  const enfants: FileChild[] = [new Paragraph({ children: [new TextRun({ text: "Corrigé", bold: true, color: COULEUR_CORRIGE, size: 18 })], spacing: { before: 80 }, keepNext: true })];
  if (item.groupe && item.groupe.length > 0) {
    // Question regroupée : une sous-partie par ligne (« a) » et son énoncé), puis le corrigé de
    // l'instance avec SES étapes — comme le corrigé HTML.
    for (let i = 0; i < item.groupe.length; i++) {
      const ligne = item.groupe[i];
      enfants.push(
        new Paragraph({
          children: [new TextRun({ text: `${LETTRES[i] ?? i + 1}) `, bold: true }), ...(await fragmentsVersRunsDocx(ligne.enonce))],
          spacing: { before: 140 },
          keepNext: true,
        }),
      );
      enfants.push(...(await correctionDocx(ligne.item)).slice(1));
    }
    return enfants;
  }
  const lignes = item.correctionDetaillee ?? [];
  if (lignes.length === 0) {
    for (const bloc of item.correction) enfants.push(...(await blocCorrectionDocx(bloc)));
    return enfants;
  }
  if (item.etapesCorrige && lignes.some((e) => e.etape !== undefined)) {
    for (let i = 0; i < item.etapesCorrige.length; i++) {
      const groupe = lignes.filter((e) => e.etape === i + 1);
      if (groupe.length === 0) continue;
      const etape = item.etapesCorrige[i];
      enfants.push(
        new Paragraph({
          children: [new TextRun({ text: `${etape.question ? `${etape.question}) ` : ""}Étape ${i + 1} — `, bold: true, color: ACCENT, size: 18 }), ...(await fragmentsVersRunsDocx(etape.consigne))],
          spacing: { before: 100 },
          keepNext: true,
        }),
      );
      enfants.push(...(await lignesEtapesDocx(groupe.map((e) => ({ ...e, sousQuestion: undefined })))));
    }
    const reste = lignes.filter((e) => e.etape === undefined || e.etape > item.etapesCorrige!.length);
    if (reste.length > 0) enfants.push(...(await lignesEtapesDocx(reste)));
    return enfants;
  }
  enfants.push(...(await lignesEtapesDocx(lignes)));
  return enfants;
}

/* ----------------------------------------------------------------------------------------------
 * Examen (même contenu que la copie / le corrigé / la grille HTML d'examen)
 * -------------------------------------------------------------------------------------------- */

const accesItem = (it: ItemEvaluation) => ({ processus: it.processus, chapitres: it.chapitres ?? [] });

/** Bandeau plein « EXAMEN · SESSION DE JUIN 2027 · 08h50 → 09h50 » (fond d'accent, texte blanc). */
function bandeauExamenDocx(examen: ExamenDocument): Paragraph {
  const { session, horaire } = droiteBandeau(examen);
  return new Paragraph({
    children: [
      new TextRun({ text: "EXAMEN", bold: true, color: "FFFFFF", size: 18, font: "Arial", characterSpacing: 30 }),
      new TextRun({ text: `\t${session.toLocaleUpperCase("fr")}`, bold: true, color: "FFFFFF", size: 18, font: "Arial", characterSpacing: 30 }),
      // Horaire hors capitales : « 08h50 », jamais « 08H50 ».
      ...(horaire ? [new TextRun({ text: ` · ${horaire}`, bold: true, color: "FFFFFF", size: 18, font: "Arial" })] : []),
    ],
    shading: { type: ShadingType.CLEAR, color: "auto", fill: ACCENT },
    tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE - 120 }],
    indent: { left: 120, right: 120 },
    spacing: { after: 120 },
  });
}

function enteteExamenDocx(entete: EnteteEvaluation, examen: ExamenDocument, suffixe?: string): FileChild[] {
  return [
    bandeauExamenDocx(examen),
    new Paragraph({ children: [new TextRun({ text: surtitreDocx(entete), size: 16, color: ACCENT })] }),
    new Paragraph({ children: [new TextRun({ text: `${titreExamen(entete)}${suffixe ? ` — ${suffixe}` : ""}`, bold: true, size: 32 })], spacing: { before: 60 } }),
    new Paragraph({
      children: [new TextRun({ text: `${dateEnToutesLettres(entete.date)} · Série `, size: 18, color: GRIS }), new TextRun({ text: entete.serieLettre, size: 18, color: "1F2937", bold: true })],
      spacing: { after: 120 },
    }),
  ];
}

/** Compétence d'une partie d'examen organisée par processus (`processus:<n>`), sinon `null`. */
function processusDePartie(partie: { cle: string }): 1 | 2 | 3 | null {
  const m = /^processus:([123])$/.exec(partie.cle);
  return m ? (Number(m[1]) as 1 | 2 | 3) : null;
}

function tableauPartiesDocx(parties: PartieExamen<ItemEvaluation>[]): Table {
  const total = parties.reduce((t, p) => t + totalPartie(p), 0);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [cellule("Partie", { gras: true }), ...parties.map((p) => { const proc = processusDePartie(p); return cellule(`${p.romain} · ${p.titreCourt}`, { gras: true, couleur: proc ? couleurProcessusDocx(proc) : undefined }); }), cellule("Total", { gras: true })] }),
      new TableRow({ children: [cellule("Points"), ...parties.map((p) => cellule(`…… / ${nombreFr(totalPartie(p))}`)), cellule(`…… / ${nombreFr(total)}`, { gras: true })] }),
    ],
  });
}

/** Encadré « Consignes » de l'examen : consignes par défaut, calculatrice, horaire, puis une puce
 * par consigne supplémentaire (paragraphes au même cadre : Word les fusionne en un encadré). */
async function consignesExamenDocx(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): Promise<Paragraph[]> {
  const calculatrice = entete.calculatrice ? ` Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}.` : "";
  const bord = { style: BorderStyle.SINGLE, size: 10, color: ACCENT, space: 4 } as const;
  const cadre = { border: { top: bord, bottom: bord, left: bord, right: bord }, shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" } } as const;
  const res: Paragraph[] = [
    new Paragraph({
      ...cadre,
      children: [new TextRun({ text: "Consignes", bold: true, color: ACCENT, size: 20 }), new TextRun({ text: ` — ${TEXTE_CONSIGNES}${calculatrice}${phraseHoraire(entete, examen, items)}`, size: 20 })],
      spacing: { before: 160, after: examen.consignesSupplementaires.length ? 0 : 120 },
    }),
  ];
  res.push(...(await pucesConsignesDocx(examen.consignesSupplementaires)));
  return res;
}

/** Ouverture d'une partie : filet épais d'accent, « PARTIE I  Titre » et ses points, ligne grise. */
function ouverturePartieDocx(examen: ExamenDocument, partie: PartieExamen<ItemEvaluation>): Paragraph[] {
  // Partie d'une compétence (examen par processus) : filets et « PARTIE I » dans sa couleur.
  const proc = processusDePartie(partie);
  const encre = proc ? couleurProcessusDocx(proc) : ACCENT;
  const trait = proc ? couleurProcessusDocx(proc, "trait") : ACCENT;
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `PARTIE ${partie.romain}   `, bold: true, color: encre, size: 18, font: "Arial", characterSpacing: 30 }),
        new TextRun({ text: partie.titre, bold: true, size: 28 }),
        new TextRun({ text: `\t${pointsTexte(totalPartie(partie))}`, size: 18, color: GRIS }),
      ],
      border: { top: { style: BorderStyle.SINGLE, size: 24, color: trait, space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
      spacing: { before: 320, after: 0 },
      keepNext: true,
      keepLines: true,
    }),
    new Paragraph({
      children: [new TextRun({ text: lignePartie(partie, accesItem, examen.organisation, examen.chapitres), size: 17, color: GRIS })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: trait, space: 3 } },
      spacing: { after: 120 },
      keepNext: true,
    }),
  ];
}

async function questionsExamenDocx(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[], corrige: boolean): Promise<FileChild[]> {
  const enfants: FileChild[] = [];
  for (const partie of partiesDuDocument(examen, items)) {
    enfants.push(...ouverturePartieDocx(examen, partie));
    let sectionCourante: string | null = null;
    for (const { element: item, numero } of partie.questions) {
      if (entete.afficherTitresSection && item.titreSection !== sectionCourante) {
        sectionCourante = item.titreSection;
        enfants.push(new Paragraph({ children: [new TextRun({ text: item.titreSection, size: 18, color: GRIS })], spacing: { before: 120 } }));
      }
      enfants.push(...(await enonceQuestionDocx(item, numero, etiquetteQuestion(accesItem(item), examen.organisation, examen.chapitres), examen.organisation === "chapitre" ? couleurProcessusDocx(item.processus) : undefined)));
      if (corrige) enfants.push(...(await correctionDocx(item)));
    }
  }
  return enfants;
}

/** En-tête courant Word (pages 2 et suivantes : première page sans en-tête, `titlePage`). */
function enteteCourantDocx(entete: EnteteEvaluation, examen: ExamenDocument): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: enteteCourantExamen(entete, examen), size: 16, color: GRIS }),
          new TextRun({ text: "\tSérie ", size: 16, color: GRIS }),
          new TextRun({ text: entete.serieLettre, size: 16, bold: true }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999", space: 2 } },
      }),
    ],
  });
}

async function copieExamenDocx(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): Promise<Blob> {
  const enfants: FileChild[] = [...enteteExamenDocx(entete, examen), new Paragraph({ children: [new TextRun({ text: "Nom : ________________________________    Classe : __________    N° : ____", size: 20 })], spacing: { after: 160 } })];
  enfants.push(tableauPartiesDocx(partiesDuDocument(examen, items)));
  if (entete.calculatrice) {
    enfants.push(new Paragraph({ children: [new TextRun({ text: `Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}`, bold: true, color: entete.calculatrice === "interdite" ? ALERTE : BON })], spacing: { before: 120 } }));
  }
  enfants.push(...(await consignesExamenDocx(entete, examen, items)));
  enfants.push(...(await questionsExamenDocx(entete, examen, items, false)));
  return documentDocx(enfants, piedDocx(entete.serieLettre), enteteCourantDocx(entete, examen));
}

async function corrigeExamenDocx(entete: EnteteEvaluation, examen: ExamenDocument, items: ItemEvaluation[]): Promise<Blob> {
  const enfants: FileChild[] = [...enteteExamenDocx(entete, examen, "Corrigé"), ...(await questionsExamenDocx(entete, examen, items, true))];
  return documentDocx(enfants, piedDocx(entete.serieLettre, "Corrigé · document du professeur"), enteteCourantDocx(entete, examen));
}

/* ----------------------------------------------------------------------------------------------
 * Documents
 * -------------------------------------------------------------------------------------------- */

/** Pied de page : copie « Série A · Nom : … » (lettre en gras) à gauche, « page n / N » à droite ;
 * corrigé et grille (documents du professeur, `mention` donnée) : « Série A · mention » sans « Nom »,
 * « page n / N » à droite — comme le pied des documents HTML. */
function piedDocx(serieLettre: string, mention?: string): Footer {
  const gauche: ParagraphChild[] = [
    new TextRun({ text: "Série ", size: 16 }),
    new TextRun({ text: serieLettre, bold: true, size: 16 }),
    mention === undefined ? new TextRun({ text: " · Nom : ……………………………", size: 16 }) : new TextRun({ text: ` · ${mention}`, size: 16, color: GRIS }),
  ];
  return new Footer({
    children: [
      new Paragraph({
        children: [...gauche, new TextRun({ children: ["\tpage ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], size: 16 })],
        tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
      }),
    ],
  });
}

function documentDocx(enfants: FileChild[], pied: Footer, enteteCourant?: Header): Promise<Blob> {
  const document = new Document({
    styles: { default: { document: { run: { font: "Georgia", size: 22 } } } },
    sections: [
      enteteCourant
        ? // Examen : en-tête courant à partir de la page 2 (première page différente), même pied partout.
          { properties: { titlePage: true, page: { margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, headers: { default: enteteCourant, first: new Header({ children: [] }) }, footers: { default: pied, first: pied }, children: enfants }
        : { properties: { page: { margin: { top: 850, bottom: 850, left: 1000, right: 1000 } } }, footers: { default: pied }, children: enfants },
    ],
  });
  return Packer.toBlob(document);
}

export async function genererCopieEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  if (entete.examen) return copieExamenDocx(entete, entete.examen, items);
  const enfants: FileChild[] = [...enteteDocx(entete, items), tableauResultats(items)];
  if (entete.calculatrice) {
    enfants.push(new Paragraph({ children: [new TextRun({ text: `Calculatrice ${entete.calculatrice === "interdite" ? "interdite" : "autorisée"}`, bold: true, color: entete.calculatrice === "interdite" ? ALERTE : BON })], spacing: { before: 120 } }));
  }
  enfants.push(...(await consignesDocx(entete, items)));
  enfants.push(...(await questionsDocx(entete, items, false)));
  return documentDocx(enfants, piedDocx(entete.serieLettre));
}

/** Corrigé Word : même contenu que le corrigé HTML (énoncé de chaque question puis son corrigé détaillé). */
export async function genererCorrigeEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  if (entete.examen) return corrigeExamenDocx(entete, entete.examen, items);
  const enfants: FileChild[] = [...enteteDocx(entete, items, "Corrigé").slice(0, 3), ...(await questionsDocx(entete, items, true))];
  return documentDocx(enfants, piedDocx(entete.serieLettre, "Corrigé · document du professeur"));
}

/* ----------------------------------------------------------------------------------------------
 * Grille Word plus rapide à utiliser (mêmes règles que la grille HTML, `grilleCorrection.ts`) :
 * A. page « Réponses », B. tableau critère × ligne d'un groupe a), b), c), C. listes une par ligne.
 * -------------------------------------------------------------------------------------------- */

/** Largeur imprimable de la grille HTML (px) ↔ largeur utile Word (twips). */
const PX_GRILLE = 660;
const TWIPS_PAR_PX = LARGEUR_UTILE / PX_GRILLE;
const BORDS_VIDES = BORDS_INVISIBLES;
const FILET = { style: BorderStyle.SINGLE, size: 4, color: "B9BEC7" } as const;

async function ligneReponseDocx(lettre: string | null, numero: number | null, fragments: FragmentConsigne[], points: number, largeur: number, gris = false): Promise<Paragraph> {
  const tete: ParagraphChild[] = numero !== null ? [new TextRun({ text: `${numero}`, bold: true, size: 19 })] : lettre ? [new TextRun({ text: `${lettre})`, bold: true, size: 19 })] : [];
  return new Paragraph({
    children: [...tete, new TextRun({ text: "\t", size: 19 }), ...(await fragmentsVersRunsDocx(fragments)), new TextRun({ text: `\t${nombreFr(points)}`, bold: true, size: 17, color: gris ? GRIS : undefined })],
    tabStops: [
      { type: TabStopType.LEFT, position: 400 },
      { type: TabStopType.RIGHT, position: Math.max(800, largeur - 160) },
    ],
    indent: { left: 400, hanging: 400 },
    spacing: { before: 0, after: 20 },
  });
}

/** A : « Réponses — Série A », questions réparties en 1 à 3 colonnes (une cellule de tableau sans
 * bordure par colonne, remplie de haut en bas comme les colonnes de la grille HTML). */
async function pageReponsesDocx(serieLettre: string, sections: { titre?: string; points?: number; questions: { item: ItemEvaluation; numero: number }[] }[]): Promise<FileChild[]> {
  const res: FileChild[] = [
    new Paragraph({
      children: [new TextRun({ text: "Réponses — Série ", bold: true, size: 26 }), new TextRun({ text: serieLettre, bold: true, size: 26 }), new TextRun({ text: "\tpoints à droite", size: 16, color: GRIS })],
      tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 2 } },
      spacing: { before: 120, after: 100 },
    }),
  ];
  for (const s of sections) {
    if (s.questions.length === 0) continue;
    if (s.titre) {
      res.push(
        new Paragraph({
          children: [new TextRun({ text: s.titre, bold: true, color: ACCENT, size: 18 }), ...(s.points !== undefined ? [new TextRun({ text: `\t${pointsTexte(s.points)}`, size: 16, color: GRIS })] : [])],
          tabStops: [{ type: TabStopType.RIGHT, position: LARGEUR_UTILE }],
          spacing: { before: 140, after: 40 },
          keepNext: true,
        }),
      );
    }
    const blocs = s.questions.map(({ item, numero }) => ({ numero, lignes: reponsesDeLaQuestion(item, numero) }));
    const n = colonnesReponses(Math.max(0, ...blocs.flatMap((b) => b.lignes.map((l) => largeurFragments(l.fragments)))));
    const largeur = Math.floor(LARGEUR_UTILE / n);
    // Répartition équilibrée en nombre de lignes, de haut en bas puis colonne suivante.
    const poids = blocs.map((b) => (b.lignes.length === 1 && b.lignes[0].lettre === null ? 1 : b.lignes.length + 1));
    const totalPoids = poids.reduce((t, p) => t + p, 0);
    const colonnes: (typeof blocs)[] = Array.from({ length: n }, () => []);
    let cumul = 0;
    blocs.forEach((b, i) => {
      const k = Math.min(n - 1, Math.floor((cumul / totalPoids) * n + 1e-9));
      colonnes[k].push(b);
      cumul += poids[i];
    });
    const cellules: TableCell[] = [];
    for (const col of colonnes) {
      const paragraphes: Paragraph[] = [];
      for (const b of col) {
        if (b.lignes.length === 1 && b.lignes[0].lettre === null) paragraphes.push(await ligneReponseDocx(null, b.numero, b.lignes[0].fragments, b.lignes[0].points, largeur));
        else {
          paragraphes.push(await ligneReponseDocx(null, b.numero, [], b.lignes.reduce((t, l) => t + l.points, 0), largeur, true));
          for (const l of b.lignes) paragraphes.push(await ligneReponseDocx(l.lettre, null, l.fragments, l.points, largeur));
        }
        paragraphes.push(new Paragraph({ children: [], border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: "B9BEC7", space: 1 } }, spacing: { before: 0, after: 40 } }));
      }
      cellules.push(new TableCell({ children: paragraphes.length ? paragraphes : [new Paragraph({ children: [] })], width: { size: largeur, type: WidthType.DXA }, borders: { top: SANS_BORD, bottom: SANS_BORD, left: SANS_BORD, right: SANS_BORD } }));
    }
    res.push(new Table({ width: { size: LARGEUR_UTILE, type: WidthType.DXA }, columnWidths: colonnes.map(() => largeur), borders: BORDS_VIDES, rows: [new TableRow({ children: cellules })] }));
  }
  return res;
}

/** Critères en liste (affichage historique : « a) Étape 1 critère … points »). */
async function listeCriteresDocx(criteres: CritereBareme[], pts: number[], indices: number[]): Promise<Table> {
  const lignes: TableRow[] = [];
  for (const i of indices) {
    const c = criteres[i];
    const prefixe = `${c.sousQuestion ? `${c.sousQuestion.replace(/\)$/, "")}) ` : ""}${c.etape ? `Étape ${c.etape} ` : ""}`;
    lignes.push(
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [...(prefixe ? [new TextRun({ text: prefixe, bold: true, color: ACCENT, size: 18 })] : []), ...(await fragmentsVersRunsDocx(c.critere))] })], width: { size: 85, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: nombreFr(pts[i]), bold: true })], alignment: AlignmentType.RIGHT })], width: { size: 15, type: WidthType.PERCENTAGE } }),
        ],
      }),
    );
  }
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: [Math.round(LARGEUR_UTILE * 0.85), Math.round(LARGEUR_UTILE * 0.15)], rows: lignes });
}

/** B : tableau d'un groupe, coupé en blocs de colonnes comme la grille HTML. */
async function tableauGroupeDocx(t: TableauGroupe): Promise<FileChild[]> {
  const largeurs = t.colonnes.map((_, j) => largeurColonneTableau(t, j));
  const res: FileChild[] = [];
  for (const bloc of blocsDeColonnes(largeurs, PX_GRILLE - largeurLibelleTableau(t))) {
    const libelle = Math.round(largeurLibelleBloc(t, bloc.map((j) => largeurs[j]), PX_GRILLE) * TWIPS_PAR_PX);
    const largeurCol = Math.floor((LARGEUR_UTILE - libelle) / bloc.length);
    const cel = (enfants: ParagraphChild[], largeur: number, options?: { fond?: string; centre?: boolean }) =>
      new TableCell({
        children: [new Paragraph({ children: enfants, alignment: options?.centre ? AlignmentType.CENTER : undefined, tabStops: [{ type: TabStopType.RIGHT, position: Math.max(400, largeur - 200) }] })],
        width: { size: largeur, type: WidthType.DXA },
        shading: options?.fond ? { type: ShadingType.CLEAR, color: "auto", fill: options.fond } : undefined,
      });
    const rangees: TableRow[] = [new TableRow({ tableHeader: true, cantSplit: true, children: [cel([], libelle), ...bloc.map((j) => cel([new TextRun({ text: `${LETTRES[t.colonnes[j]] ?? t.colonnes[j] + 1})`, bold: true, size: 18 })], largeurCol, { fond: "EEF3F8", centre: true }))] })];
    for (const r of t.rangees) {
      const lib: ParagraphChild[] = [...(r.etape ? [new TextRun({ text: `Étape ${r.etape} — `, bold: true, color: ACCENT, size: 17 })] : []), ...(await fragmentsVersRunsDocx(r.libelle))];
      const cellules: TableCell[] = [cel(lib, libelle)];
      for (const j of bloc) {
        const c = r.cellules[j];
        cellules.push(cel([...(c.valeur ? await fragmentsVersRunsDocx(c.valeur) : []), new TextRun({ text: `\t${nombreFr(c.points)}`, bold: true })], largeurCol));
      }
      rangees.push(new TableRow({ cantSplit: true, children: cellules }));
    }
    rangees.push(new TableRow({ cantSplit: true, children: [cel([new TextRun({ text: "Total", bold: true, size: 18 })], libelle, { fond: "EEF3F8" }), ...bloc.map((j) => cel([new TextRun({ text: `\t${nombreFr(t.totaux[j])}`, bold: true })], largeurCol, { fond: "EEF3F8" }))] }));
    res.push(new Table({ width: { size: LARGEUR_UTILE, type: WidthType.DXA }, columnWidths: [libelle, ...bloc.map(() => largeurCol)], borders: { top: FILET, bottom: FILET, left: FILET, right: FILET, insideHorizontal: FILET, insideVertical: FILET }, rows: rangees }));
    res.push(new Paragraph({ children: [], spacing: { before: 0, after: 40 } }));
  }
  return res;
}

/** C : titre (« Erreurs fréquentes », « Accepter ») puis une ligne par entrée, le coût à droite. */
async function listeGrilleDocx(titre: string, couleur: string, entrees: { fragments: FragmentConsigne[]; cout?: string }[]): Promise<FileChild[]> {
  const rangees: TableRow[] = [];
  const avecCout = entrees.some((e) => e.cout);
  for (const e of entrees) {
    const desc = new TableCell({ children: [new Paragraph({ children: await fragmentsVersRunsDocx(e.fragments), indent: { left: 200 } })], width: { size: avecCout ? 68 : 100, type: WidthType.PERCENTAGE }, borders: { top: SANS_BORD, left: SANS_BORD, right: SANS_BORD, bottom: { style: BorderStyle.DOTTED, size: 4, color: "D5D9DF" } } });
    const cout = new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: e.cout ?? "", bold: true, size: 17 })], alignment: AlignmentType.RIGHT })], width: { size: 32, type: WidthType.PERCENTAGE }, borders: { top: SANS_BORD, left: SANS_BORD, right: SANS_BORD, bottom: { style: BorderStyle.DOTTED, size: 4, color: "D5D9DF" } } });
    rangees.push(new TableRow({ cantSplit: true, children: avecCout ? [desc, cout] : [desc] }));
  }
  return [
    new Paragraph({ children: [new TextRun({ text: titre, bold: true, color: couleur, size: 20 })], spacing: { before: 60 }, keepNext: true }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, columnWidths: avecCout ? [Math.round(LARGEUR_UTILE * 0.68), Math.round(LARGEUR_UTILE * 0.32)] : [LARGEUR_UTILE], borders: BORDS_VIDES, rows: rangees }),
  ];
}

/** Grille de correction Word : même contenu que la grille HTML (document professeur). */
export async function genererGrilleEvaluationDocx(entete: EnteteEvaluation, items: ItemEvaluation[]): Promise<Blob> {
  const examen = entete.examen;
  const totaux = ([1, 2, 3] as const).map((p) => ({ p, t: items.filter((it) => it.processus === p).reduce((s, it) => s + it.points, 0) })).filter((x) => x.t > 0);
  const total = items.reduce((s, it) => s + it.points, 0);
  const parties = examen ? partiesDuDocument(examen, items) : [];
  // Résumé : le nom de chaque compétence dans sa couleur (examen par processus : le titre de la partie).
  const resume: TextRun[] = (
    examen
      ? parties.map((p) => ({ nom: `${p.romain} ${p.titreCourt}`, suite: ` : ${nombreFr(totalPartie(p))}`, proc: processusDePartie(p) }))
      : totaux.map((x) => ({ nom: NOM_PROCESSUS[x.p], suite: ` ${nombreFr(x.t)}`, proc: x.p }))
  ).flatMap((m, i) => [
    ...(i > 0 ? [new TextRun({ text: " · ", size: 18, color: GRIS })] : []),
    new TextRun({ text: m.nom, size: 18, color: m.proc ? couleurProcessusDocx(m.proc) : GRIS }),
    new TextRun({ text: m.suite, size: 18, color: GRIS }),
  ]);
  const enfants: FileChild[] = [
    new Paragraph({ children: [new TextRun({ text: `Document professeur · ${examen ? "Examen · " : ""}Série `, size: 16, color: ACCENT }), new TextRun({ text: entete.serieLettre, size: 16, color: ACCENT, bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: `Grille de correction — ${examen ? titreExamen(entete) : titreNettoye(entete)}`, bold: true, size: 32 })], spacing: { before: 60 } }),
    new Paragraph({
      children: [...resume, new TextRun({ text: " · ", size: 18, color: GRIS }), new TextRun({ text: `Total ${nombreFr(total)}`, size: 18, bold: true })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1B1D22", space: 4 } },
      spacing: { after: 160 },
    }),
  ];
  // Évaluation : questions par processus ; examen : partie par partie (ouverture de partie, libellé
  // processus · chapitre de chaque question).
  const groupes: { ouverture: Paragraph[]; questions: { item: ItemEvaluation; numero: number; libelle: string }[] }[] = [];
  // `libelle` = ce qui suit le nom de la compétence (chapitre de l'examen), le nom est écrit dans sa couleur.
  if (examen) {
    for (const partie of parties) {
      groupes.push({
        ouverture: ouverturePartieDocx(examen, partie),
        questions: partie.questions.map(({ element: item, numero }) => {
          const chapitre = examen.chapitres.filter((c) => (item.chapitres ?? []).includes(c.slug)).map((c) => c.titreCourt);
          return { item, numero, libelle: chapitre.length > 2 ? "Plusieurs chapitres" : chapitre.join(" · ") };
        }),
      });
    }
  } else {
    let n = 0;
    for (const p of [1, 2, 3] as const) groupes.push({ ouverture: [], questions: items.filter((it) => it.processus === p).map((item) => ({ item, numero: ++n, libelle: "" })) });
  }
  // A : page « Réponses — Série A » (examen : un bloc par partie), puis le détail sur une page neuve.
  enfants.push(...(await pageReponsesDocx(entete.serieLettre, examen ? parties.map((p, k) => ({ titre: `Partie ${p.romain} · ${p.titre}`, points: totalPartie(p), questions: groupes[k].questions })) : [{ questions: groupes.flatMap((g) => g.questions) }])));
  enfants.push(new Paragraph({ children: [], pageBreakBefore: true, spacing: { before: 0, after: 0 } }));
  for (const groupe of groupes) {
    enfants.push(...groupe.ouverture);
    for (const { item, numero, libelle } of groupe.questions) {
      const tete: ParagraphChild[] = [
        new TextRun({ text: `Question ${numero} · `, bold: true, size: 19 }),
        new TextRun({ text: (examen ? NOM_PROCESSUS_EXAMEN : NOM_PROCESSUS)[item.processus], bold: true, size: 19, color: couleurProcessusDocx(item.processus) }),
        new TextRun({ text: `${libelle ? ` · ${libelle}` : ""} · ${pointsTexte(item.points)}`, bold: true, size: 19 }),
      ];
      if (item.bareme) tete.push(new TextRun({ text: "    Réponse : ", size: 19 }), ...(await fragmentsVersRunsDocx(item.bareme.reponseFinale, { gras: true })));
      else if (item.notion) tete.push(new TextRun({ text: `    ${item.notion}`, size: 19 }));
      enfants.push(new Paragraph({ children: tete, shading: { type: ShadingType.CLEAR, color: "auto", fill: "EEF3F8" }, spacing: { before: 200, after: 60 }, keepNext: true }));
      if (!item.bareme || item.bareme.criteres.length === 0) {
        enfants.push(new Paragraph({ children: [new TextRun({ text: `Barème global : ${pointsTexte(item.points)}.`, size: 20, color: GRIS })] }));
        enfants.push(...(await correctionDocx(item)).slice(1));
        continue;
      }
      const pts = pointsCriteres(item);
      const bareme = item.bareme;
      // B : question regroupée aux critères identiques → tableau critère × ligne (sinon liste).
      const segments = item.groupe && item.groupe.length > 1 ? segmentsDuGroupe(bareme.criteres, pts, item.groupe.length) : null;
      for (const segment of segments ?? [{ type: "liste" as const, indices: bareme.criteres.map((_, i) => i) }]) {
        if (segment.type === "tableau") enfants.push(...(await tableauGroupeDocx(segment.tableau)));
        else enfants.push(await listeCriteresDocx(bareme.criteres, pts, segment.indices));
      }
      // C : erreurs fréquentes et réponses acceptées en liste, une par ligne, coût aligné à droite.
      const erreurs = bareme.erreursFrequentes ?? [];
      if (erreurs.length > 0) enfants.push(...(await listeGrilleDocx("Erreurs fréquentes", ALERTE, erreurs.map((e) => ({ fragments: e.description, cout: e.cout })))));
      const acceptees = bareme.reponsesAcceptees ?? [];
      if (acceptees.length > 0) enfants.push(...(await listeGrilleDocx("Accepter", BON, acceptees.map((r) => ({ fragments: r })))));
      if (item.code) enfants.push(new Paragraph({ children: [new TextRun({ text: `code ${item.code.code}`, size: 16, color: GRIS })], spacing: { before: 40 } }));
      const codesLignes = (item.groupe ?? []).map((l, i) => (l.item.code ? `${LETTRES[i] ?? i + 1}) ${l.item.code.code}` : "")).filter(Boolean);
      if (!item.code && codesLignes.length > 0) enfants.push(new Paragraph({ children: [new TextRun({ text: `codes ${codesLignes.join(" · ")}`, size: 16, color: GRIS })], spacing: { before: 40 } }));
    }
  }
  const bord = { style: BorderStyle.SINGLE, size: 4, color: "B9BEC7", space: 4 } as const;
  enfants.push(
    new Paragraph({
      children: [new TextRun({ text: "RÈGLE  ", bold: true, color: ACCENT, size: 16 }), new TextRun({ text: "Une erreur n'est pénalisée qu'une fois : si une valeur fausse est réutilisée correctement dans la suite, la suite rapporte ses points.", size: 20 })],
      border: { top: bord, bottom: bord, left: bord, right: bord },
      spacing: { before: 280 },
    }),
  );
  return documentDocx(enfants, piedDocx(entete.serieLettre, "Grille de correction · ne pas distribuer aux élèves"), examen ? enteteCourantDocx(entete, examen) : undefined);
}
