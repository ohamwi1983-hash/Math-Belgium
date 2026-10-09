import type { jsPDF } from "jspdf";
import notoSansRegularUrl from "../assets/fonts/NotoSans-Regular.ttf?url";
import notoSansBoldUrl from "../assets/fonts/NotoSans-Bold.ttf?url";
import notoSansMathUrl from "../assets/fonts/NotoSansMath-Regular.ttf?url";

/**
 * Polices Unicode embarquées pour l'export PDF — `jsPDF` sans police custom retombe sur ses 14
 * polices standard (Helvetica...), encodées `WinAnsiEncoding` : un test direct (repro isolé, PDF
 * généré puis son flux de contenu inspecté octet par octet) a confirmé que même un simple tiret
 * cadratin "—" est SILENCIEUSEMENT supprimé du texte dessiné (pas un glyphe de remplacement, le
 * caractère disparaît purement du flux), en plus des symboles évidemment absents d'un jeu WinAnsi
 * (∞, ≥, ≤, ↗, ↘, ⌣, ⌢) — tous utilisés par le contenu réel de gen7 (tableau signe/variation,
 * notation d'intervalle "]-∞ ; ...]"). Fix : deux polices Noto (Google Fonts, licence OFL,
 * embarquées telles quelles comme assets Vite) couvrant chacune un besoin disjoint, jamais un seul
 * fichier ne couvrant tout (vérifié caractère par caractère via lecture directe de la table `cmap`
 * avant de choisir) :
 * - **Noto Sans** (regulier + gras) — texte courant (prose française accentuée, tiret cadratin,
 *   signe moins Unicode "−") : police par défaut de tout le document, remplace "helvetica" partout.
 * - **Noto Sans Math** (regulier seul, jamais utilisé en gras dans ce contenu) — exactement les
 *   caractères que Noto Sans n'a pas (`CARACTERES_POLICE_MATH` ci-dessous) : bascule ciblée
 *   caractère par caractère dans le flux de texte libre (`construireSegments`,
 *   `genererFeuilleExercicesPdf.ts`) et cellule par cellule dans les tableaux (`tableauPdf`).
 */

export const POLICE_TEXTE = "NotoSans";
export const POLICE_MATH = "NotoSansMath";

/** Codepoints absents de Noto Sans mais présents dans Noto Sans Math (vérifié via la table `cmap`
 * des deux polices) — tout caractère du contenu réel de gen7 en dehors de ce petit ensemble reste
 * sur `POLICE_TEXTE`. */
const CODEPOINTS_POLICE_MATH = new Set([0x221e, 0x2265, 0x2264, 0x2197, 0x2198, 0x2323, 0x2322]);

export function necessitePoliceMath(caractere: string): boolean {
  const cp = caractere.codePointAt(0);
  return cp !== undefined && CODEPOINTS_POLICE_MATH.has(cp);
}

async function urlVersBase64(url: string): Promise<string> {
  const reponse = await fetch(url);
  const buffer = await reponse.arrayBuffer();
  let binaire = "";
  const octets = new Uint8Array(buffer);
  const tailleBloc = 0x8000;
  for (let i = 0; i < octets.length; i += tailleBloc) {
    binaire += String.fromCharCode(...octets.subarray(i, i + tailleBloc));
  }
  return btoa(binaire);
}

let policesBase64Promise: Promise<{ regular: string; bold: string; math: string }> | null = null;
function chargerPolicesBase64(): Promise<{ regular: string; bold: string; math: string }> {
  if (!policesBase64Promise) {
    policesBase64Promise = Promise.all([
      urlVersBase64(notoSansRegularUrl),
      urlVersBase64(notoSansBoldUrl),
      urlVersBase64(notoSansMathUrl),
    ]).then(([regular, bold, math]) => ({ regular, bold, math }));
  }
  return policesBase64Promise;
}

/** Enregistre les 3 polices sur un document `jsPDF` donné — les polices `jsPDF` sont propres à
 * chaque instance de `doc` (contrairement au CSS KaTeX partagé entre exports, mémoïsé une seule
 * fois par `katexImage.ts`), donc appelée une fois par génération de PDF ; le téléchargement +
 * encodage base64 des fichiers `.ttf`, seule partie coûteuse, reste mémoïsé au niveau du module. */
export async function enregistrerPolicesPdf(doc: jsPDF): Promise<void> {
  const { regular, bold, math } = await chargerPolicesBase64();

  doc.addFileToVFS("NotoSans-Regular.ttf", regular);
  doc.addFont("NotoSans-Regular.ttf", POLICE_TEXTE, "normal");
  doc.addFileToVFS("NotoSans-Bold.ttf", bold);
  doc.addFont("NotoSans-Bold.ttf", POLICE_TEXTE, "bold");
  doc.addFileToVFS("NotoSansMath-Regular.ttf", math);
  doc.addFont("NotoSansMath-Regular.ttf", POLICE_MATH, "normal");
}
