import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { FragmentConsigne } from "./genererFeuilleExercices";
import type { AdaptateurFeuilleExercices, BlocCorrection, ProgressionGeneration, SectionExercice, ZoneReponse } from "./genererFeuilleExercices";
import { rasteriserLatex } from "./katexImage";
import { POLICE_MATH, POLICE_TEXTE, enregistrerPolicesPdf, necessitePoliceMath } from "./pdfFonts";

/**
 * Export PDF — troisième format de sortie du mécanisme générique (voir `genererFeuilleExercices.ts`
 * pour l'export Word, référence architecturale) : mêmes `SectionExercice`/`BlocCorrection[]`
 * produits par l'adaptateur, aucun changement requis côté `generateurs/xxx/exportWord.ts`. Contrairement
 * au HTML (KaTeX natif) ou au docx (image dans un flux de texte géré par Word), `jsPDF` n'a pas de
 * moteur de mise en page riche (texte + image mêlés, retour à la ligne automatique) : cette moitié du
 * fichier réimplémente un flux ligne par ligne minimal (`ecrireSegments`), mot par mot pour le texte,
 * chaque fragment "latex" restant une image indivisible. Réutilise directement `rasteriserLatex`
 * (déjà rognée à la ligne de base, voir `katexImage.ts`) — jamais html2canvas/`doc.html()` (le
 * plugin html-vers-PDF intégré de jsPDF), qui repose sur la même famille de piège de chargement de
 * police que `html-to-image` déjà rencontrée et abandonnée pour le docx (voir CLAUDE.md) : en
 * réutilisant la rasterisation déjà fiable au lieu de rasteriser toute la page, ce risque ne se
 * représente jamais ici.
 *
 * Police : jamais les 14 polices standard de `jsPDF` ("helvetica"...) — un test direct (repro
 * isolé, flux de contenu du PDF inspecté octet par octet) a confirmé qu'elles suppriment
 * SILENCIEUSEMENT tout caractère hors `WinAnsiEncoding`, y compris un simple tiret cadratin "—" (le
 * caractère disparaît du flux, aucun glyphe de remplacement) — en plus des symboles évidemment hors
 * WinAnsi (∞, ≥, ≤, ↗, ↘, ⌣, ⌢) utilisés par le tableau signe/variation et la notation d'intervalle.
 * Fix : deux polices Unicode embarquées (`pdfFonts.ts`, licence OFL) — `POLICE_TEXTE` (Noto Sans)
 * partout par défaut, bascule vers `POLICE_MATH` (Noto Sans Math) caractère par caractère dans le
 * texte libre (`decouperEnRunsPolice`) et cellule par cellule dans les tableaux (`tableauPdf`),
 * jamais l'inverse (`POLICE_MATH` n'a pas les accents français).
 */

/** 96 DPI (référence CSS px de `katexImage.ts`) → points PDF (1/72 pouce) — les images rasterisées
 * par `rasteriserLatex` sont mesurées en px CSS à cette résolution, jamais en points directement. */
const PX_VERS_PT = 72 / 96;

const MARGE = 50;
const TAILLE_TEXTE = 11;
const INTERLIGNE = TAILLE_TEXTE * 1.35;
const COULEUR_TITRE: [number, number, number] = [46, 116, 181];

interface Curseur {
  x: number;
  y: number;
  pageLargeur: number;
  pageHauteur: number;
}

interface SegmentTexte {
  texte: string;
  gras?: boolean;
  police: "texte" | "math";
}
interface SegmentImage {
  donnees: Uint8Array;
  largeur: number;
  hauteur: number;
  bloc: boolean;
}
type Segment = SegmentTexte | SegmentImage;

function estImage(segment: Segment): segment is SegmentImage {
  return "donnees" in segment;
}

/** Scinde un mot en runs consécutifs de même police requise — un mot comme "]−∞" mélange un
 * caractère ASCII ("]", `POLICE_TEXTE`) et l'infini Unicode ("−∞", `POLICE_MATH`), jamais rendus
 * par la même police (voir commentaire d'en-tête). `for...of` itère par point de code Unicode,
 * jamais par unité UTF-16 brute (nécessaire même si aucun de nos caractères cibles n'est astral). */
function decouperEnRunsPolice(mot: string): { texte: string; police: "texte" | "math" }[] {
  const runs: { texte: string; police: "texte" | "math" }[] = [];
  let courant = "";
  let policeCourante: "texte" | "math" | null = null;
  for (const caractere of mot) {
    const police = necessitePoliceMath(caractere) ? "math" : "texte";
    if (policeCourante !== null && police !== policeCourante) {
      runs.push({ texte: courant, police: policeCourante });
      courant = "";
    }
    courant += caractere;
    policeCourante = police;
  }
  if (courant) runs.push({ texte: courant, police: policeCourante ?? "texte" });
  return runs;
}

async function construireSegments(fragments: FragmentConsigne[], options?: { bloc?: boolean; gras?: boolean }): Promise<Segment[]> {
  const segments: Segment[] = [];
  for (const fragment of fragments) {
    if (fragment.type === "texte") {
      // Découpe en mots en conservant l'espace de fin attaché — chaque mot devient sa propre unité
      // insécable pour le flux ligne par ligne (voir `ecrireSegments`), jamais coupé au milieu.
      const mots = fragment.valeur.split(/(?<=\s)/).filter((mot) => mot.length > 0);
      for (const mot of mots) {
        for (const run of decouperEnRunsPolice(mot)) segments.push({ texte: run.texte, gras: options?.gras, police: run.police });
      }
    } else {
      const image = await rasteriserLatex(fragment.valeur, options?.bloc ?? false);
      segments.push({ donnees: image.donnees, largeur: image.largeur * PX_VERS_PT, hauteur: image.hauteur * PX_VERS_PT, bloc: options?.bloc ?? false });
    }
  }
  return segments;
}

function nouvellePage(doc: jsPDF, curseur: Curseur): void {
  doc.addPage();
  curseur.x = MARGE;
  curseur.y = MARGE;
}

function assurerEspace(doc: jsPDF, curseur: Curseur, hauteurNecessaire: number): void {
  if (curseur.y + hauteurNecessaire > curseur.pageHauteur - MARGE) nouvellePage(doc, curseur);
}

function ecrireTitre(doc: jsPDF, curseur: Curseur, texte: string, taille: number, couleur?: [number, number, number]): void {
  doc.setFontSize(taille);
  doc.setFont(POLICE_TEXTE, "bold");
  doc.setTextColor(...(couleur ?? [0, 0, 0]));
  const lignes = doc.splitTextToSize(texte, curseur.pageLargeur - 2 * MARGE) as string[];
  assurerEspace(doc, curseur, taille * lignes.length);
  for (const ligne of lignes) {
    curseur.y += taille;
    doc.text(ligne, MARGE, curseur.y);
  }
  doc.setTextColor(0, 0, 0);
  curseur.y += taille * 0.6;
  curseur.x = MARGE;
}

/**
 * Flux ligne par ligne d'une "consigne"/"paragraphe" : texte (mot par mot, `doc.text`) et formules
 * inline (image alignée sur la ligne de base — bas de l'image = `curseur.y`, même convention que le
 * docx) mêlés sur une même ligne, retour à la ligne automatique dès dépassement de la largeur utile.
 * Une formule **bloc** (`displayMode`, uniquement l'entête "f(x) = …") est toujours plus haute qu'une
 * ligne de texte : jamais mêlée au flux, toujours seule sur sa propre ligne (avant/après re-flottent
 * normalement).
 */
function ecrireSegments(doc: jsPDF, curseur: Curseur, segments: Segment[]): void {
  const largeurUtile = curseur.pageLargeur - MARGE;
  assurerEspace(doc, curseur, INTERLIGNE);

  for (const segment of segments) {
    if (estImage(segment) && segment.bloc) {
      if (curseur.x > MARGE) {
        curseur.x = MARGE;
        curseur.y += INTERLIGNE;
      }
      assurerEspace(doc, curseur, segment.hauteur + 6);
      doc.addImage(segment.donnees, "PNG", curseur.x, curseur.y, segment.largeur, segment.hauteur);
      curseur.y += segment.hauteur + 6;
      continue;
    }

    doc.setFontSize(TAILLE_TEXTE);
    if (estImage(segment)) {
      doc.setFont(POLICE_TEXTE, "normal");
    } else if (segment.police === "math") {
      // POLICE_MATH n'a qu'une graisse "normal" (jamais utilisée en gras dans ce contenu — infini,
      // flèches, notation d'intervalle) : jamais "bold" ici, même si `segment.gras` était vrai.
      doc.setFont(POLICE_MATH, "normal");
    } else {
      doc.setFont(POLICE_TEXTE, segment.gras ? "bold" : "normal");
    }
    const largeur = estImage(segment) ? segment.largeur : doc.getTextWidth(segment.texte);

    if (curseur.x + largeur > largeurUtile) {
      curseur.x = MARGE;
      curseur.y += INTERLIGNE;
      assurerEspace(doc, curseur, INTERLIGNE);
    }

    if (estImage(segment)) {
      doc.addImage(segment.donnees, "PNG", curseur.x, curseur.y - segment.hauteur, segment.largeur, segment.hauteur);
    } else {
      doc.text(segment.texte, curseur.x, curseur.y);
    }
    curseur.x += largeur;
  }

  curseur.x = MARGE;
  curseur.y += INTERLIGNE;
}

function zoneReponseLignes(curseur: Curseur, nombre: number): void {
  curseur.y += nombre * INTERLIGNE;
  curseur.x = MARGE;
}

function tableauPdf(doc: jsPDF, curseur: Curseur, libellesLignes: string[], valeursParLigne: (string[] | null)[], nombreColonnes: number): void {
  const largeurUtile = curseur.pageLargeur - 2 * MARGE;
  const largeurEtiquette = largeurUtile * 0.22;
  const largeurColonne = (largeurUtile - largeurEtiquette) / nombreColonnes;

  const columnStyles: Record<string, { halign: "left" | "center"; fontStyle?: "bold"; cellWidth: number }> = {
    0: { halign: "left", fontStyle: "bold", cellWidth: largeurEtiquette },
  };
  for (let c = 1; c <= nombreColonnes; c++) columnStyles[c] = { halign: "center", cellWidth: largeurColonne };

  const body = libellesLignes.map((libelle, i) => [libelle, ...(valeursParLigne[i] ?? Array.from({ length: nombreColonnes }, () => ""))]);

  assurerEspace(doc, curseur, 30 * (libellesLignes.length + 1));
  autoTable(doc, {
    startY: curseur.y,
    body,
    theme: "grid",
    styles: { fontSize: TAILLE_TEXTE, cellPadding: 4, textColor: [0, 0, 0], lineColor: [153, 153, 153], font: POLICE_TEXTE },
    columnStyles,
    margin: { left: MARGE, right: MARGE },
    // Une cellule entière (jamais mélangée à du texte français) bascule sur POLICE_MATH dès qu'elle
    // contient un caractère absent de POLICE_TEXTE ("−∞"/"+∞"/"↗"/"↘"/"⌣"/"⌢") — voir en-tête de
    // fichier et `pdfFonts.ts`.
    didParseCell: (data) => {
      const texte = data.cell.text.join("");
      if (Array.from(texte).some(necessitePoliceMath)) {
        data.cell.styles.font = POLICE_MATH;
        data.cell.styles.fontStyle = "normal";
      }
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  curseur.y = finalY + INTERLIGNE;
  curseur.x = MARGE;
}

async function ecrireZoneReponse(doc: jsPDF, curseur: Curseur, reponse: ZoneReponse | undefined): Promise<void> {
  if (!reponse || reponse.type === "lignes") {
    zoneReponseLignes(curseur, reponse?.nombre ?? 1);
    return;
  }
  tableauPdf(doc, curseur, reponse.libellesLignes, [], reponse.nombreColonnes);
}

async function ecrireSectionExercice(doc: jsPDF, curseur: Curseur, section: SectionExercice, indexExercice: number): Promise<void> {
  ecrireTitre(doc, curseur, `Exercice ${indexExercice + 1}`, 14, COULEUR_TITRE);

  if (section.enteteFragments) {
    ecrireSegments(doc, curseur, await construireSegments(section.enteteFragments, { bloc: true }));
  }

  const LETTRES = "abcdefghijklmnopqrstuvwxyz";
  for (let q = 0; q < section.questions.length; q++) {
    const question = section.questions[q];
    const lettre = LETTRES[q] ?? String(q + 1);
    const segments: Segment[] = [{ texte: `${lettre}) `, gras: true, police: "texte" }, ...(await construireSegments(question.consigne))];
    ecrireSegments(doc, curseur, segments);
    await ecrireZoneReponse(doc, curseur, question.reponse);
  }
}

async function ecrireBlocCorrection(doc: jsPDF, curseur: Curseur, bloc: BlocCorrection): Promise<void> {
  if (bloc.type === "tableau") {
    tableauPdf(doc, curseur, bloc.libellesLignes, bloc.valeursParLigne, bloc.valeursParLigne[0]?.length ?? 0);
    return;
  }
  if (bloc.type === "html") {
    // Non représentable via ce moteur ligne par ligne (ex. graphique SVG) — réservé au pipeline
    // HTML de l'évaluation.
    return;
  }
  ecrireSegments(doc, curseur, await construireSegments(bloc.fragments, { bloc: bloc.bloc }));
}

/**
 * Génère le fichier PDF complet (`Blob`) — même structure que l'export Word/HTML (titre, N exercices
 * avec saut de page entre chacun, puis section corrections) : voir `genererFeuilleExercicesDocx` pour
 * la référence. `onProgression` suit le même contrat.
 */
export async function genererFeuilleExercicesPdf<T>(
  adaptateur: AdaptateurFeuilleExercices<T>,
  nombreExercices: number,
  onProgression?: (progression: ProgressionGeneration) => void,
): Promise<Blob> {
  const instances: T[] = Array.from({ length: nombreExercices }, () => adaptateur.genererInstance());

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  await enregistrerPolicesPdf(doc);
  const curseur: Curseur = { x: MARGE, y: MARGE, pageLargeur: doc.internal.pageSize.getWidth(), pageHauteur: doc.internal.pageSize.getHeight() };

  ecrireTitre(doc, curseur, adaptateur.titreDocument, 20);

  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "exercices", indexCourant: i + 1, total: instances.length });
    if (i > 0) nouvellePage(doc, curseur);
    await ecrireSectionExercice(doc, curseur, adaptateur.construireEnonce(instances[i]), i);
  }

  nouvellePage(doc, curseur);
  ecrireTitre(doc, curseur, "Corrections", 20);

  for (let i = 0; i < instances.length; i++) {
    onProgression?.({ etape: "corrections", indexCourant: i + 1, total: instances.length });
    if (i > 0) nouvellePage(doc, curseur);
    ecrireTitre(doc, curseur, `Correction — Exercice ${i + 1}`, 14, COULEUR_TITRE);
    for (const bloc of adaptateur.construireCorrection(instances[i])) {
      await ecrireBlocCorrection(doc, curseur, bloc);
    }
  }

  return doc.output("blob");
}
