import { AlignmentType, BorderStyle, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";

const BORDURE = { style: BorderStyle.SINGLE, size: 2, color: "999999" } as const;
const BORDURES_CELLULE = { top: BORDURE, bottom: BORDURE, left: BORDURE, right: BORDURE };

/** Largeur de la zone de texte en twips (A4, marges 1 pouce de chaque côté — mêmes marges que
 * celles posées par `docx` par défaut) — sert à calculer un `columnWidths` explicite en twips pour
 * chaque tableau : sans lui, `docx` génère un `tblGrid` de repli à des valeurs arbitraires (~100
 * twips/colonne) totalement décorrélées des largeurs en pourcentage posées sur chaque cellule. Word
 * s'appuie sur ce `tblGrid` pour la mise en page réelle et ignore alors le pourcentage voulu — bug
 * observé en production : tableau réduit à une colonne de quelques pixels, une lettre par ligne.
 */
const LARGEUR_PAGE_TWIPS = 9026;

/** `centre` : toujours vrai pour une colonne de valeurs, jamais pour la colonne d'étiquette
 * (première colonne, ex. "x"/"Signe de f(x)"/"Variation") — cette dernière reste alignée à gauche,
 * comme un intitulé de ligne classique. */
function celluleTexte(texteCellule: string, options?: { gras?: boolean; largeurPourcent?: number; centre?: boolean }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        alignment: options?.centre ? AlignmentType.CENTER : undefined,
        children: [new TextRun({ text: texteCellule, bold: options?.gras })],
      }),
    ],
    borders: BORDURES_CELLULE,
    width: options?.largeurPourcent !== undefined ? { size: options.largeurPourcent, type: WidthType.PERCENTAGE } : undefined,
  });
}

function colonnesEnTwips(largeurEtiquettePourcent: number, nombreColonnes: number): number[] {
  const largeurEtiquette = Math.round((largeurEtiquettePourcent / 100) * LARGEUR_PAGE_TWIPS);
  const largeurColonne = Math.round(((100 - largeurEtiquettePourcent) / 100 / nombreColonnes) * LARGEUR_PAGE_TWIPS);
  return [largeurEtiquette, ...Array.from({ length: nombreColonnes }, () => largeurColonne)];
}

/**
 * Tableau vierge pour la copie de l'élève — une colonne d'étiquettes (ex. "x", "Signe de f(x)",
 * "Variation") suivie de `nombreColonnes` cellules vides à remplir à la main. Ne montre AUCUNE
 * valeur (ni les bornes -∞/+∞, ni les racines/x_S) : sur une feuille imprimée sans validation en
 * direct, l'élève doit reconstruire l'en-tête lui-même à partir de ses réponses aux questions
 * précédentes (racines, sommet) — jamais une fuite partielle de la réponse.
 */
export function construireTableauVide(libellesLignes: string[], nombreColonnes: number): Table {
  const largeurEtiquette = 22;
  const largeurColonne = (100 - largeurEtiquette) / nombreColonnes;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: colonnesEnTwips(largeurEtiquette, nombreColonnes),
    rows: libellesLignes.map(
      (libelle) =>
        new TableRow({
          children: [
            celluleTexte(libelle, { gras: true, largeurPourcent: largeurEtiquette }),
            ...Array.from({ length: nombreColonnes }, () => celluleTexte("", { largeurPourcent: largeurColonne, centre: true })),
          ],
        }),
    ),
  });
}

/**
 * Tableau rempli pour la section correction — mêmes lignes que `construireTableauVide`, mais
 * chaque cellule reçoit la valeur réellement attendue (`valeursParLigne[i][j]`, même ordre que
 * `libellesLignes`). `valeursParLigne[i].length` doit être identique pour toutes les lignes.
 */
export function construireTableauRempli(libellesLignes: string[], valeursParLigne: string[][]): Table {
  const nombreColonnes = valeursParLigne[0]?.length ?? 0;
  const largeurEtiquette = 22;
  const largeurColonne = nombreColonnes > 0 ? (100 - largeurEtiquette) / nombreColonnes : 0;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: nombreColonnes > 0 ? colonnesEnTwips(largeurEtiquette, nombreColonnes) : undefined,
    rows: libellesLignes.map(
      (libelle, i) =>
        new TableRow({
          children: [
            celluleTexte(libelle, { gras: true, largeurPourcent: largeurEtiquette }),
            ...(valeursParLigne[i] ?? []).map((valeur) => celluleTexte(valeur, { largeurPourcent: largeurColonne, centre: true })),
          ],
        }),
    ),
  });
}
