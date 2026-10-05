import katex from "katex";
import "katex/dist/katex.min.css";

export interface ImageRasterisee {
  donnees: Uint8Array;
  largeur: number;
  hauteur: number;
}

/**
 * Rasterise une expression LaTeX en PNG pour l'insertion dans un document Word (docx) — `docx` ne
 * sait pas écrire d'équation Word native (OMML), donc chaque fragment "latex" d'un
 * `FragmentConsigne[]` devient une image plutôt qu'un objet mathématique structuré (limite
 * acceptée dès la conception, voir `promptexportwordpilotegen7.md`). Technique : KaTeX rend
 * l'expression en HTML statique (`katex.renderToString`), puis ce HTML est réinjecté dans un SVG
 * construit à la main (`<foreignObject>` + le **vrai** CSS de KaTeX extrait de
 * `document.styleSheets`) chargé dans un `<img>` puis dessiné sur un `<canvas>`
 * (`toDataURL('image/png')`). Cette approche a remplacé une première implémentation basée sur
 * `html-to-image` (dump de style calculé, payload que Chromium échoue à peindre — voir
 * l'historique CLAUDE.md).
 *
 * **Piège n°2 rencontré et évité** : un SVG chargé comme source d'un `<img>` (contexte "image", que
 * ce soit une data: URI ou un blob:) ne charge JAMAIS les ressources externes qu'il référence —
 * en particulier les `@font-face` avec un `src: url(...)` pointant vers un fichier séparé. En
 * production, le CSS de KaTeX référence ses polices via des chemins d'assets Vite hashés
 * (`/assets/KaTeX_Main-Regular-XXXX.woff2`) : ces requêtes sont bloquées dans ce contexte, sans
 * erreur visible. Conséquence observée (feuille générée puis ouverte dans Word) : Chromium replie
 * silencieusement sur une police système de secours — métriques différentes de celles mesurées
 * dans le DOM réel (texte tronqué/débordant, ex. "a", "b", "c" coupés) et glyphes de repli
 * ("tofu", petit rectangle gris) pour les caractères d'espacement internes propres aux polices
 * KaTeX. Fix : les polices `@font-face` KaTeX référencées par le CSS extrait sont téléchargées une
 * fois (`fetch`), converties en `data:` URI (`FileReader.readAsDataURL`) et réinjectées à la place
 * de leur URL d'origine dans le CSS embarqué — le SVG devient alors totalement autonome, sans
 * aucune requête réseau au moment du rendu. Mémoïsé (promesse unique, calculée une seule fois par
 * session) : coûteux la première fois (plusieurs fichiers de police à télécharger, généralement
 * déjà en cache HTTP puisque la page /gen7 les a déjà chargés pour son propre rendu KaTeX
 * à l'écran), gratuit ensuite. `document.fonts.ready` est en plus attendu avant la première mesure
 * pour que le DOM de mesure (hors SVG) utilise lui aussi les vraies polices KaTeX.
 */

/** Taille de police (px, équivalent 96 DPI) utilisée pour rasteriser CHAQUE formule, bloc ou
 * inline indifféremment — doit correspondre à la taille du texte environnant du document Word
 * (`TextRun` sans `size` explicite ⇒ style "Normal" par défaut de Word, 11 pt = 11×96/72 px). Un
 * facteur correctif (0,85) est appliqué en plus de cette conversion : à taille de police nominale
 * identique, la police de KaTeX (style Computer Modern, x-height/cap-height plus généreuse) rend
 * visuellement PLUS GRANDE qu'une police système type Calibri (le style "Normal" par défaut de
 * Word) — sans ce facteur, une formule reste perceptiblement plus grande que le texte qui l'entoure
 * même à `font-size` CSS identique. `displayMode` (le paramètre `bloc`) reste transmis à KaTeX pour
 * son effet structurel propre (barres de fraction, grands symboles Σ/∫ correctement dimensionnés)
 * — seule la taille de police de base ne varie plus entre les deux modes.
 */
const TAILLE_POLICE_PX = ((11 * 96) / 72) * 0.85;

const cache = new Map<string, Promise<ImageRasterisee>>();

let policesPretesPromise: Promise<unknown> | null = null;
function policesPretes(): Promise<unknown> {
  if (!policesPretesPromise) {
    policesPretesPromise = "fonts" in document ? document.fonts.ready : Promise.resolve();
  }
  return policesPretesPromise;
}

/** Règles CSS pertinentes pour KaTeX (sélecteurs `.katex...` et déclarations `@font-face` des
 * polices `KaTeX_*`) — filtrage RÈGLE PAR RÈGLE, jamais feuille de style entière : en production,
 * Vite regroupe tout le CSS de l'app (KaTeX inclus) dans un seul fichier, donc "cette feuille
 * contient une règle .katex" ne suffit pas à identifier les règles pertinentes. */
function reglesCssKatex(): string[] {
  const regles: string[] = [];
  for (const feuille of Array.from(document.styleSheets)) {
    let ensembleRegles: CSSRuleList;
    try {
      ensembleRegles = feuille.cssRules;
    } catch {
      continue;
    }
    if (!ensembleRegles) continue;
    for (const regle of Array.from(ensembleRegles)) {
      if (regle.cssText.includes(".katex") || regle.cssText.includes("KaTeX_")) {
        regles.push(regle.cssText);
      }
    }
  }
  return regles;
}

async function urlVersDataUrl(url: string): Promise<string> {
  const reponse = await fetch(url);
  const blob = await reponse.blob();
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader();
    lecteur.onload = () => resolve(lecteur.result as string);
    lecteur.onerror = () => reject(lecteur.error ?? new Error("Échec de lecture de la police."));
    lecteur.readAsDataURL(blob);
  });
}

/** Construit le CSS KaTeX avec toutes ses polices `@font-face` inlinées en `data:` URI (voir
 * commentaire d'en-tête — nécessaire pour que les polices chargent dans le SVG rasterisé). */
async function construireCssKatexAutonome(): Promise<string> {
  let css = reglesCssKatex().join("\n");

  const urls = new Set<string>();
  const motifUrl = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  let correspondance: RegExpExecArray | null = motifUrl.exec(css);
  while (correspondance) {
    const url = correspondance[2];
    if (!url.startsWith("data:")) urls.add(url);
    correspondance = motifUrl.exec(css);
  }

  const dataUrlParUrl = new Map<string, string>();
  await Promise.all(
    Array.from(urls).map(async (url) => {
      try {
        const absolue = new URL(url, document.baseURI).href;
        dataUrlParUrl.set(url, await urlVersDataUrl(absolue));
      } catch {
        // Police non essentielle (ex. format non prioritaire pour ce navigateur, un autre format
        // listé dans le même @font-face prend le relais) — ignorée plutôt que bloquante.
      }
    }),
  );

  for (const [url, dataUrl] of dataUrlParUrl) {
    css = css.split(url).join(dataUrl);
  }
  return css;
}

let cssKatexAutonomePromise: Promise<string> | null = null;
/** Exporté pour réutilisation par l'export HTML (`genererFeuilleExercicesHtml.ts`) — contrairement
 * au SVG rasterisé, une page HTML normale charge ses `@font-face` sans restriction, mais on
 * réutilise quand même ce CSS déjà autonome (polices en `data:` URI) pour produire un fichier `.html`
 * téléchargé totalement autonome (aucune requête réseau à l'ouverture, y compris hors-ligne). */
export function obtenirCssKatexAutonome(): Promise<string> {
  if (!cssKatexAutonomePromise) cssKatexAutonomePromise = construireCssKatexAutonome();
  return cssKatexAutonomePromise;
}

function dataUrlVersUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binaire = atob(base64);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i++) octets[i] = binaire.charCodeAt(i);
  return octets;
}

/**
 * `mesurerBaseline` : uniquement pertinent pour une formule inline (`bloc=false`) — KaTeX réserve
 * toujours, via un "strut" interne, un espace de descente constant (pour aligner correctement les
 * fractions/indices imbriqués), même quand le rendu concret n'a aucune partie sous la ligne de base
 * (ex. "a", "f(x)"). Or Word aligne une image inline en posant son BORD BAS exactement sur la ligne
 * de base du texte environnant (même convention que `vertical-align: baseline` en CSS) — l'espace
 * de descente inutilisé, capturé dans l'image, décale alors visuellement le glyphe au-dessus de la
 * ligne. Pour mesurer où se trouve la vraie ligne de base dans le conteneur : un span de taille
 * nulle ajouté juste après le HTML de KaTeX se positionne, par construction (`vertical-align:
 * baseline` implicite), exactement sur cette ligne — sa position verticale donne l'offset recherché
 * (voir usage dans `rasteriserSansCache`, qui rogne l'image jusqu'à ce point sauf encre réelle
 * en dessous, ex. une fraction). Ne fonctionne QUE si le contenu KaTeX reste inline sur une seule
 * ligne — jamais en mode bloc (`.katex-display` force son propre bloc, le marqueur atterrirait sur
 * une ligne différente sans rapport avec la ligne de base de la formule) : `bloc=true` n'active donc
 * jamais cette mesure (voir `rasteriserSansCache`).
 */
async function mesurerRendu(html: string, mesurerBaseline: boolean): Promise<{ largeur: number; hauteur: number; baselineY: number | null }> {
  const conteneur = document.createElement("div");
  conteneur.style.position = "absolute";
  conteneur.style.top = "0";
  conteneur.style.left = "-99999px";
  conteneur.style.background = "#ffffff";
  conteneur.style.color = "#000000";
  conteneur.style.padding = "2px 4px";
  conteneur.style.fontSize = `${TAILLE_POLICE_PX}px`;
  conteneur.style.display = "inline-block";
  conteneur.innerHTML = html;

  let marqueur: HTMLSpanElement | null = null;
  if (mesurerBaseline) {
    marqueur = document.createElement("span");
    marqueur.style.display = "inline-block";
    marqueur.style.width = "0";
    marqueur.style.height = "0";
    marqueur.style.verticalAlign = "baseline";
    conteneur.appendChild(marqueur);
  }

  document.body.appendChild(conteneur);
  try {
    // Un rendu supplémentaire (rAF) laisse le temps au navigateur de mettre en page le HTML injecté
    // avant de mesurer — taille 0x0 au premier paint synchrone sinon.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const rect = conteneur.getBoundingClientRect();
    const baselineY = marqueur ? Math.round(marqueur.getBoundingClientRect().top - rect.top) : null;
    return { largeur: Math.max(1, Math.ceil(rect.width)), hauteur: Math.max(1, Math.ceil(rect.height)), baselineY };
  } finally {
    document.body.removeChild(conteneur);
  }
}

/** Dernière ligne (depuis le bas) contenant un pixel non blanc — utilisée pour ne jamais rogner
 * une vraie descente (fraction, indice) même quand elle dépasse la ligne de base mesurée. Renvoie
 * -1 si l'image est entièrement blanche (jamais attendu pour une formule valide). */
function derniereLigneAvecEncre(contexte: CanvasRenderingContext2D, largeur: number, hauteur: number): number {
  const donnees = contexte.getImageData(0, 0, largeur, hauteur).data;
  for (let y = hauteur - 1; y >= 0; y--) {
    for (let x = 0; x < largeur; x++) {
      const i = (y * largeur + x) * 4;
      if (!(donnees[i] > 250 && donnees[i + 1] > 250 && donnees[i + 2] > 250)) return y;
    }
  }
  return -1;
}

async function rasteriserSansCache(expression: string, bloc: boolean): Promise<ImageRasterisee> {
  await policesPretes();

  const html = katex.renderToString(expression, { throwOnError: false, displayMode: bloc });
  const [{ largeur, hauteur, baselineY }, cssKatex] = await Promise.all([mesurerRendu(html, !bloc), obtenirCssKatexAutonome()]);

  const pixelRatio = 3;
  const svgMarkup = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}">`,
    `<foreignObject width="100%" height="100%">`,
    `<div xmlns="http://www.w3.org/1999/xhtml">`,
    `<style><![CDATA[${cssKatex}]]></style>`,
    `<div style="display:inline-block;background:#ffffff;color:#000000;padding:2px 4px;font-size:${TAILLE_POLICE_PX}px;">${html}</div>`,
    `</div>`,
    `</foreignObject>`,
    `</svg>`,
  ].join("");

  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Échec du chargement du SVG rasterisé (formule KaTeX)."));
    image.src = svgDataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = largeur * pixelRatio;
  canvas.height = hauteur * pixelRatio;
  const contexte = canvas.getContext("2d");
  if (!contexte) throw new Error("Impossible d'obtenir un contexte 2D pour rasteriser une formule KaTeX.");
  contexte.fillStyle = "#ffffff";
  contexte.fillRect(0, 0, canvas.width, canvas.height);
  contexte.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Rogne jusqu'à la ligne de base mesurée (jamais au-delà d'une vraie encre en dessous — voir
  // `derniereLigneAvecEncre`) : Word pose le bord bas d'une image inline exactement sur la ligne de
  // base du texte, donc tout pixel capturé sous cette ligne (le "strut" de descente de KaTeX, non
  // utilisé par une formule sans partie descendante) décale visuellement le glyphe au-dessus du
  // texte environnant (voir commentaire de `mesurerRendu`).
  let canvasFinal = canvas;
  let hauteurFinale = hauteur;
  if (baselineY !== null) {
    const baselineYMiseAEchelle = Math.round(baselineY * pixelRatio);
    const derniereEncre = derniereLigneAvecEncre(contexte, canvas.width, canvas.height);
    const hauteurRognee = Math.min(canvas.height, Math.max(baselineYMiseAEchelle, derniereEncre + 1));
    if (hauteurRognee > 0 && hauteurRognee < canvas.height) {
      const rogne = document.createElement("canvas");
      rogne.width = canvas.width;
      rogne.height = hauteurRognee;
      const contexteRogne = rogne.getContext("2d");
      if (contexteRogne) {
        contexteRogne.drawImage(canvas, 0, 0);
        canvasFinal = rogne;
        hauteurFinale = hauteurRognee / pixelRatio;
      }
    }
  }

  const dataUrl = canvasFinal.toDataURL("image/png");
  return { donnees: dataUrlVersUint8Array(dataUrl), largeur, hauteur: hauteurFinale };
}

export function rasteriserLatex(expression: string, bloc: boolean): Promise<ImageRasterisee> {
  const cle = `${bloc ? "bloc" : "inline"}::${expression}`;
  let entree = cache.get(cle);
  if (!entree) {
    entree = rasteriserSansCache(expression, bloc);
    cache.set(cle, entree);
  }
  return entree;
}

/** Réservé aux tests / à un rafraîchissement explicite — la mémoïsation reste valide tant que la
 * page n'est pas rechargée, aucun besoin de la vider entre deux feuilles générées normalement. */
export function viderCacheRasterisation(): void {
  cache.clear();
}
