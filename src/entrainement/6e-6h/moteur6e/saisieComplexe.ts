import { evaluerValeurComplexe, normaliserSaisieComplexe } from "./expressionComplexe";

/**
 * Contrôles de SAISIE communs aux générateurs du chapitre « Nombres complexes » (6gen34/35/36),
 * appliqués AVANT la vérification — un refus ici ne consomme JAMAIS de tentative (le composant
 * d'écran affiche le message et n'appelle pas `onValider`).
 *
 * - `MESSAGE_SAISIE_ILLISIBLE` remplace, pour ces générateurs, le message générique de
 *   `formatMessageErreur` sur `parse_error` (« "*" entre un nombre et une variable »), faux ici :
 *   `2i`, `3−2i`, `2·3`, `√3` sont tous acceptés.
 * - `controleFormeReduite` refuse un énoncé recopié (ex. « (2+3i)(1−i) », « 5/(1+2i) », « i^7 ») :
 *   la réponse finale doit être sous forme réduite a+bi — au plus UNE partie réelle et UNE partie
 *   imaginaire, sans « / », « ^ », parenthèses, racine ni produit non effectué.
 */

export const MESSAGE_SAISIE_ILLISIBLE =
  "Saisie non reconnue — écris un nombre comme 3-2i ou 0,5+i (virgule décimale acceptée, i pour l'unité imaginaire). Cette saisie ne compte pas comme une tentative.";

const PREFIXE_FORME = "Donne une forme réduite a+bi";
const SUFFIXE_SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";

const NOMBRE = String.raw`\d+(?:[.,]\d+)?`;
const TERME_REEL = new RegExp(`^${NOMBRE}$`);
const TERME_IMAGINAIRE = new RegExp(`^(?:${NOMBRE}\\*?)?i$|^i\\*?${NOMBRE}$`);

/** Message (déjà rédigé pour l'élève) si `texte` n'est PAS une forme réduite a+bi, `null` sinon. À
 * n'appeler que sur une saisie déjà lisible (`evaluerValeurComplexe` non nul). */
export function controleFormeReduite(texte: string): string | null {
  const t = normaliserSaisieComplexe(texte).replace(/\s+/g, "");
  if (t.includes("/")) return `${PREFIXE_FORME} : effectue la division (pas de « / » dans la réponse).${SUFFIXE_SANS_TENTATIVE}`;
  if (t.includes("^")) return `${PREFIXE_FORME} : calcule les puissances (pas de « ^ » dans la réponse).${SUFFIXE_SANS_TENTATIVE}`;
  if (t.includes("(") || t.includes(")")) return `${PREFIXE_FORME} : développe et simplifie (pas de parenthèses dans la réponse).${SUFFIXE_SANS_TENTATIVE}`;
  if (t.includes("sqrt")) return `${PREFIXE_FORME} : calcule la racine (pas de « √ » dans la réponse).${SUFFIXE_SANS_TENTATIVE}`;
  const corps = t.replace(/^[+-]/, "");
  if (corps === "") return null;
  const termes = corps.split(/[+-]/);
  let reels = 0;
  let imaginaires = 0;
  for (const terme of termes) {
    if (TERME_REEL.test(terme)) reels++;
    else if (TERME_IMAGINAIRE.test(terme)) imaginaires++;
    else return `${PREFIXE_FORME} : effectue les produits (un seul nombre devant i).${SUFFIXE_SANS_TENTATIVE}`;
  }
  if (reels > 1 || imaginaires > 1) return `${PREFIXE_FORME} : regroupe les termes (une seule partie réelle, une seule partie imaginaire).${SUFFIXE_SANS_TENTATIVE}`;
  return null;
}

export interface OptionsPrevalidation {
  /** Indices des champs dont la réponse doit être une forme réduite (défaut : tous). */
  formeReduite?: readonly number[] | "tous" | "aucun";
  /** Indices des champs qui ne sont PAS des nombres complexes (ex. un polynôme en z) : ni lus par
   * le parseur complexe, ni contrôlés ici. */
  ignorer?: readonly number[];
}

/** Message de refus SANS tentative (saisie illisible ou forme non réduite), `null` si les saisies
 * peuvent être soumises à la vérification. */
export function prevaliderSaisiesComplexes(valeurs: readonly string[], options: OptionsPrevalidation = {}): string | null {
  const ignorer = new Set(options.ignorer ?? []);
  for (let i = 0; i < valeurs.length; i++) {
    if (ignorer.has(i)) continue;
    if (evaluerValeurComplexe(valeurs[i]) === null) return MESSAGE_SAISIE_ILLISIBLE;
  }
  const forme = options.formeReduite ?? "tous";
  if (forme === "aucun") return null;
  for (let i = 0; i < valeurs.length; i++) {
    if (ignorer.has(i)) continue;
    if (forme !== "tous" && !forme.includes(i)) continue;
    const message = controleFormeReduite(valeurs[i]);
    if (message) return message;
  }
  return null;
}

/** Refus SANS tentative d'un polynôme recopié sous forme de quotient (ex. « P(z)/(z−r₁) »). */
export function controleQuotientEffectue(texte: string): string | null {
  return texte.includes("/") ? `Effectue la division : donne le quotient développé, sans « / ».${SUFFIXE_SANS_TENTATIVE}` : null;
}

// ---------------------------------------------------------------------------------------------
// Mélange déterministe des options d'un choix fermé, à partir d'une graine tirée de l'exercice :
// le même exercice affiche toujours le même ordre (rechargement de l'écran, retour sur une fiche),
// deux exercices différents un ordre a priori différent — la bonne option n'est plus toujours la 1re.
// ---------------------------------------------------------------------------------------------

/** Graine entière (hachage FNV-1a) d'un objet sérialisable + d'un sel (ex. la phase). */
export function graineDepuis(objet: unknown, sel = ""): number {
  const texte = JSON.stringify(objet) + "|" + sel;
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(graine: number): () => number {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Copie mélangée (Fisher-Yates) de `elements`, déterministe pour une graine donnée. */
export function melangerParGraine<T>(elements: readonly T[], graine: number): T[] {
  const alea = mulberry32(graine);
  const copie = [...elements];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}
