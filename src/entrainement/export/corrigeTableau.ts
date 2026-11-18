import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "./genererFeuilleExercices";

/**
 * Corrigé détaillé « comme au tableau » (décision de l'utilisateur, maquette validée — voir
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau »).
 *
 * Chaque étape d'un corrigé contient, dans cet ordre :
 * 1. « Ce qu'on utilise » (`utilise`) : propriété / formule / méthode, avec le renvoi au cours ;
 * 2. « Calcul » (`calcul`) : UNE transformation par ligne (`ligne(latex, justification)`), lignes
 *    alignées sur « = » (une ligne qui commence par « = » continue la précédente), règle utilisée à
 *    droite en petit italique ;
 * 3. « Résultat » (`resultat`), encadré ;
 * 4. « Vérification » (`verification`) quand elle est simple et parlante ;
 * 5. « Piège » (`piege`).
 *
 * Constructeurs PURS partagés par tous les adaptateurs ; le rendu est commun : HTML
 * (`assemblerEvaluationHtml.ts`), Word (`evaluationDocx.ts`) et écran
 * (`components/CorrigeDetailleEcran.tsx`, même découpage `decouperLigneCalcul`).
 */

export const LABEL_UTILISE = "Ce qu'on utilise";

type Fragments = FragmentConsigne[];

/** Mêmes constructeurs que `fragmentsDocx.ts`, sans dépendance à `docx` : un corrigé détaillé est
 * aussi importé par le générateur interactif (étape échouée), qui ne doit pas embarquer `docx`. */
export function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

export function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

/** Une ligne de calcul : une seule transformation, et la règle utilisée (facultative). */
export function ligne(latex: string, justification?: string | Fragments): LigneCalcul {
  if (justification === undefined || justification === "") return { latex };
  // Justification en texte : « − » typographique devant un nombre (« par −4 », jamais « par -4 »).
  const j = typeof justification === "string" ? justification.replace(/(^|[\s(])-(?=\d)/g, "$1−") : justification;
  return { latex, justification: j };
}

export function utilise(sousQuestion: string | undefined, fragments: Fragments): EtapeCorrection {
  return { label: LABEL_UTILISE, type: "utilise", sousQuestion, fragments };
}

/** Chaîne de calcul (`lignes`), précédée d'un texte d'introduction facultatif (`intro`). `label` :
 * « Calcul » par défaut, ou un intitulé plus parlant (« Module », « Argument », « 1ʳᵉ fraction »). */
export function calcul(sousQuestion: string | undefined, lignes: LigneCalcul[], intro: Fragments = [], label = "Calcul"): EtapeCorrection {
  return { label, type: "calcul", sousQuestion, fragments: intro, calcul: lignes };
}

export function resultat(sousQuestion: string | undefined, fragments: Fragments, label = "Résultat"): EtapeCorrection {
  return { label, type: "resultat", sousQuestion, fragments };
}

export function verification(sousQuestion: string | undefined, fragments: Fragments, calculs?: LigneCalcul[]): EtapeCorrection {
  return { label: "Vérification", type: "verification", sousQuestion, fragments, ...(calculs ? { calcul: calculs } : {}) };
}

export function piege(sousQuestion: string | undefined, fragments: Fragments): EtapeCorrection {
  return { label: "Piège", type: "piege", sousQuestion, fragments };
}

export function estLignePiege(e: EtapeCorrection): boolean {
  return e.type === "piege" || e.label.trim().toLowerCase() === "piège";
}

/** Relations de niveau 0 sur lesquelles une ligne de calcul s'aligne. */
const RELATIONS_COMMANDES = new Set(["approx", "neq", "ne", "le", "leq", "ge", "geq", "equiv", "iff", "Leftrightarrow", "Longleftrightarrow", "Rightarrow", "Longrightarrow", "in", "notin", "simeq"]);

/**
 * Découpe une ligne de calcul à son PREMIER signe de relation de niveau 0 (hors accolades) :
 * `gauche` (membre de gauche, aligné à droite) et `droite` (la relation et la suite, alignées à
 * gauche). Une ligne qui commence par « = » a un membre de gauche vide (elle continue la ligne
 * précédente). Sans relation : `droite === null` (ligne affichée telle quelle sur toute la largeur).
 */
export function decouperLigneCalcul(latex: string): { gauche: string; droite: string | null } {
  let profondeur = 0;
  for (let i = 0; i < latex.length; i++) {
    const c = latex[i];
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(latex.slice(i));
      if (!m) {
        i++; // « \{ », « \, »… : caractère échappé, sans effet sur la profondeur
        continue;
      }
      if (profondeur === 0 && RELATIONS_COMMANDES.has(m[1])) return { gauche: latex.slice(0, i).trim(), droite: latex.slice(i).trim() };
      i += m[0].length - 1;
      continue;
    }
    if (c === "{") profondeur++;
    else if (c === "}") profondeur--;
    else if (profondeur === 0 && (c === "=" || c === "<" || c === ">")) return { gauche: latex.slice(0, i).trim(), droite: latex.slice(i).trim() };
  }
  return { gauche: latex.trim(), droite: null };
}

/**
 * Chaîne d'égalités « A=B=C=D » (déjà produite par une fonction de l'écran) éclatée en lignes de
 * calcul alignées : « A=B », « =C », « =D » — une transformation par ligne. `justifications[k]` :
 * règle de la k-ième égalité (k = 0 pour « A=B »). Les « = » à l'intérieur d'accolades ne coupent pas.
 */
export function lignesDepuisChaine(chaine: string, justifications: (string | Fragments | undefined)[] = []): LigneCalcul[] {
  const membres: string[] = [];
  let profondeur = 0;
  let debut = 0;
  for (let i = 0; i < chaine.length; i++) {
    const c = chaine[i];
    if (c === "\\") {
      i++;
      continue;
    }
    if (c === "{") profondeur++;
    else if (c === "}") profondeur--;
    else if (c === "=" && profondeur === 0) {
      membres.push(chaine.slice(debut, i));
      debut = i + 1;
    }
  }
  membres.push(chaine.slice(debut));
  if (membres.length < 3) return [ligne(chaine, justifications[0])];
  return membres.slice(1).map((m, k) => ligne(k === 0 ? `${membres[0]}=${m}` : `=${m}`, justifications[k]));
}

/** Lignes du corrigé détaillé qui appartiennent à l'étape (écran) de lettre `lettre` — utilisé par
 * les générateurs pour afficher, après une étape échouée, EXACTEMENT les lignes du corrigé papier. */
export function lignesDeLEtape(etapes: EtapeCorrection[], lettre: string): EtapeCorrection[] {
  return etapes.filter((e) => e.sousQuestion === lettre);
}

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Lettre d'étape (« a », « b »…) de l'écran d'indice `index` (ordre des écrans). */
export function lettreEtape(index: number): string {
  return LETTRES[index] ?? String(index + 1);
}
