import type { CritereBareme, FragmentConsigne } from "./genererFeuilleExercices";

/**
 * Grille de correction plus rapide à utiliser (décision de l'utilisateur) — logique PURE partagée
 * par la grille HTML (`assemblerEvaluationHtml.ts`) et la grille Word (`evaluationDocx.ts`), testable
 * seule (esbuild) :
 * - **B. Tableau d'un groupe a), b), c)** (`segmentsDuGroupe`) : quand plusieurs lignes d'une question
 *   regroupée ont les MÊMES critères (mêmes étapes, même libellé générique), leurs critères — qui se
 *   répétaient pour a), b), c)… — deviennent un tableau : une rangée par critère (libellé sans la
 *   valeur propre à l'exercice), une colonne par ligne, dans chaque case la valeur attendue de la
 *   ligne (s'il y en a une) et ses points ; une rangée « Total » par colonne. Des lignes aux critères
 *   différents (variantes différentes) : un tableau par signature ; une ligne seule dans sa signature
 *   garde l'affichage en liste — aucune information n'est perdue (chaque critère du barème est dans
 *   exactement un segment). Un tableau trop large est coupé en blocs de colonnes (`blocsDeColonnes`).
 * - **A. Page « Réponses »** : largeurs estimées (`largeurFragments`) pour choisir 1, 2 ou 3 colonnes.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

/** Libellé générique d'un critère et sa valeur propre à l'exercice : « Factorisation correcte :
 * x(x + 4√3) = 0 » → libellé « Factorisation correcte », valeur « x(x + 4√3) = 0 ». Coupure au PREMIER
 * « : » d'un fragment de TEXTE (jamais dans une formule) suivi d'une valeur non vide ; sans « : », le
 * critère entier est le libellé (pas de valeur). */
export function separerCritere(critere: FragmentConsigne[]): { libelle: FragmentConsigne[]; valeur: FragmentConsigne[] | null } {
  // Critère réduit à une formule (« $\arctan(1)=\frac{\pi}{4}$ ») : libellé générique « Résultat ».
  if (critere.length > 0 && !critere.some((f) => f.type === "texte" && /\p{L}/u.test(f.valeur))) return { libelle: [{ type: "texte", valeur: "Résultat" }], valeur: critere };
  for (let i = 0; i < critere.length; i++) {
    const f = critere[i];
    if (f.type !== "texte") continue;
    const m = /\s*:\s*/.exec(f.valeur);
    if (!m) continue;
    const avant = f.valeur.slice(0, m.index).trim();
    const apres = f.valeur.slice(m.index + m[0].length);
    const libelle: FragmentConsigne[] = [...critere.slice(0, i), ...(avant ? [{ type: "texte" as const, valeur: avant }] : [])];
    const valeur: FragmentConsigne[] = [...(apres.trim() ? [{ type: "texte" as const, valeur: apres.trimStart() }] : []), ...critere.slice(i + 1)];
    // Un libellé doit contenir un mot (au moins deux lettres) et la valeur ne pas être vide.
    const texteLibelle = libelle.map((x) => (x.type === "texte" ? x.valeur : "")).join("");
    if (!/\p{L}{2}/u.test(texteLibelle) || valeur.length === 0) return { libelle: critere, valeur: null };
    return { libelle, valeur };
  }
  return { libelle: critere, valeur: null };
}

export function cleFragments(fr: FragmentConsigne[]): string {
  return JSON.stringify(fr.map((f) => (f.type === "texte" ? ["t", f.valeur.replace(/\s+/g, " ").trim()] : ["l", f.valeur.replace(/\s+/g, "")])));
}

export interface CelluleTableauGroupe {
  /** Valeur attendue propre à la ligne (`null` : critère sans valeur). */
  valeur: FragmentConsigne[] | null;
  points: number;
}

export interface RangeeTableauGroupe {
  etape?: number;
  libelle: FragmentConsigne[];
  cellules: CelluleTableauGroupe[];
}

export interface TableauGroupe {
  /** Indices des lignes du groupe (0 = a), 1 = b)…), une par colonne. */
  colonnes: number[];
  rangees: RangeeTableauGroupe[];
  /** Total de chaque colonne (= points de la ligne). */
  totaux: number[];
}

export type SegmentGroupe = { type: "tableau"; tableau: TableauGroupe } | { type: "liste"; indices: number[] };

function indiceLettre(c: CritereBareme): number {
  const s = (c.sousQuestion ?? "").toLowerCase().replace(/\)$/, "").trim();
  return s.length === 1 ? LETTRES.indexOf(s) : -1;
}

/**
 * Segments de la grille d'une question regroupée (`criteres` = barème du groupe, chaque critère
 * rattaché à la lettre de sa ligne ; `pts` = points de chaque critère, `pointsCriteres`). `null` quand
 * aucun tableau n'est possible (au plus une ligne par signature, critère sans lettre…) : la grille
 * garde alors son affichage en liste.
 */
export function segmentsDuGroupe(criteres: CritereBareme[], pts: number[], nombreLignes: number): SegmentGroupe[] | null {
  if (nombreLignes < 2 || criteres.length === 0) return null;
  const parLigne: number[][] = Array.from({ length: nombreLignes }, () => []);
  for (let i = 0; i < criteres.length; i++) {
    const l = indiceLettre(criteres[i]);
    if (l < 0 || l >= nombreLignes) return null;
    parLigne[l].push(i);
  }
  if (parLigne.some((ix) => ix.length === 0)) return null;
  const separes = criteres.map((c) => separerCritere(c.critere));
  const signature = (l: number) => parLigne[l].map((i) => `${criteres[i].etape ?? ""}|${cleFragments(separes[i].libelle)}`).join("§");
  // Colonnes rangées par signature, dans l'ordre de leur première ligne.
  const parSignature = new Map<string, number[]>();
  for (let l = 0; l < nombreLignes; l++) {
    const s = signature(l);
    parSignature.set(s, [...(parSignature.get(s) ?? []), l]);
  }
  if (![...parSignature.values()].some((ls) => ls.length >= 2)) return null;
  const segments: { premier: number; segment: SegmentGroupe }[] = [];
  for (const colonnes of parSignature.values()) {
    if (colonnes.length < 2) {
      segments.push({ premier: colonnes[0], segment: { type: "liste", indices: parLigne[colonnes[0]] } });
      continue;
    }
    const nbRangees = parLigne[colonnes[0]].length;
    const rangees: RangeeTableauGroupe[] = [];
    for (let k = 0; k < nbRangees; k++) {
      const indices = colonnes.map((l) => parLigne[l][k]);
      const valeurs = indices.map((i) => separes[i].valeur);
      const premiere = criteres[indices[0]];
      // Valeur identique dans toutes les colonnes : elle reste dans le libellé (rien à comparer).
      const identiques = valeurs.every((v) => v !== null) && new Set(valeurs.map((v) => cleFragments(v ?? []))).size === 1;
      rangees.push({
        etape: premiere.etape,
        libelle: identiques ? premiere.critere : separes[indices[0]].libelle,
        cellules: indices.map((i) => ({ valeur: identiques ? null : separes[i].valeur, points: pts[i] ?? 0 })),
      });
    }
    const totaux = colonnes.map((_, j) => rangees.reduce((t, r) => t + r.cellules[j].points, 0));
    segments.push({ premier: colonnes[0], segment: { type: "tableau", tableau: { colonnes, rangees, totaux } } });
  }
  segments.sort((a, b) => a.premier - b.premier);
  // Listes consécutives réunies (une seule liste « a) … c) … » entre deux tableaux).
  const res: SegmentGroupe[] = [];
  for (const { segment } of segments) {
    const dernier = res[res.length - 1];
    if (segment.type === "liste" && dernier?.type === "liste") dernier.indices.push(...segment.indices);
    else res.push(segment.type === "liste" ? { type: "liste", indices: [...segment.indices] } : segment);
  }
  return res;
}

/* ----------------------------------------------------------------------------------------------
 * Largeurs estimées (px à 10,5 pt) — choix du nombre de colonnes, coupe des tableaux
 * -------------------------------------------------------------------------------------------- */

const PX_TEXTE = 6.6;
const PX_FORMULE = 8.2;

/** Nombre de caractères VISIBLES d'une formule LaTeX (approximation : fraction = le plus long de ses
 * deux termes, indices/exposants à 70 %, commandes de mise en forme ignorées). */
export function caracteresVisiblesLatex(s: string): number {
  let i = 0;
  const lire = (): number => {
    let n = 0;
    while (i < s.length) {
      const ch = s[i];
      if (ch === "}") return n;
      if (ch === "{") {
        i++;
        n += lire();
        i++;
        continue;
      }
      if (ch === "^" || ch === "_") {
        i++;
        n += 0.7 * argument();
        continue;
      }
      if (ch === "\\") {
        const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
        const cmd = m ? m[1] : "";
        i += m ? m[0].length : 1;
        if (cmd === "frac" || cmd === "dfrac" || cmd === "tfrac") {
          const a = argument();
          const b = argument();
          n += Math.max(a, b) + 0.4;
        } else if (cmd === "sqrt") {
          if (s[i] === "[") {
            const fin = s.indexOf("]", i);
            i = fin < 0 ? s.length : fin + 1;
          }
          n += 1 + argument();
        } else if (["left", "right", "big", "Big", "bigl", "bigr", "Bigl", "Bigr", "displaystyle", "limits", "mathopen", "mathclose", "text", "mathrm", "operatorname", "mathbb", "mathbf", "boldsymbol", "hat", "vec", "overline", "widehat", "bar"].includes(cmd)) {
          // commande de mise en forme : son argument éventuel est lu normalement
        } else if (cmd === "," || cmd === ";" || cmd === "!" || cmd === " ") {
          n += cmd === "!" ? 0 : 0.3;
        } else if (cmd === "quad") {
          n += 2;
        } else if (cmd === "qquad") {
          n += 4;
        } else {
          n += 1;
        }
        continue;
      }
      i++;
      if (ch !== " " && ch !== "&") n += /[=<>+\-]/.test(ch) ? 1.6 : 1;
    }
    return n;
  };
  const argument = (): number => {
    while (s[i] === " ") i++;
    if (s[i] === "{") {
      i++;
      const n = lire();
      i++;
      return n;
    }
    if (s[i] === "\\") {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
      i += m ? m[0].length : 1;
      return 1;
    }
    i++;
    return 1;
  };
  let total = 0;
  while (i < s.length) {
    total += lire();
    if (s[i] === "}") i++;
  }
  return total;
}

/** Largeur estimée (px) d'une suite de fragments imprimée en ligne. */
export function largeurFragments(fr: FragmentConsigne[]): number {
  return fr.reduce((t, f) => t + (f.type === "texte" ? f.valeur.length * PX_TEXTE : caracteresVisiblesLatex(f.valeur) * PX_FORMULE), 0);
}

/** Colonnes d'un tableau réparties en blocs qui tiennent dans `disponible` px (au plus `max` par
 * bloc, au moins une) : au-delà de la colonne imprimable, le tableau est coupé en deux blocs ou plus,
 * jamais débordant. */
export function blocsDeColonnes(largeurs: number[], disponible: number, max = 6): number[][] {
  const blocs: number[][] = [];
  let courant: number[] = [];
  let somme = 0;
  largeurs.forEach((l, j) => {
    if (courant.length > 0 && (somme + l > disponible || courant.length >= max)) {
      blocs.push(courant);
      courant = [];
      somme = 0;
    }
    courant.push(j);
    somme += l;
  });
  if (courant.length > 0) blocs.push(courant);
  // Blocs équilibrés : 5 colonnes coupées en 3 + 2 plutôt qu'en 4 + 1 quand la largeur le permet.
  if (blocs.length === 2 && blocs[1].length < blocs[0].length - 1) {
    const tout = [...blocs[0], ...blocs[1]];
    const moitie = Math.ceil(tout.length / 2);
    const a = tout.slice(0, moitie);
    const b = tout.slice(moitie);
    const tient = (bl: number[]) => bl.reduce((t, j) => t + largeurs[j], 0) <= disponible;
    if (tient(a) && tient(b)) return [a, b];
  }
  return blocs;
}

/** Largeur estimée d'une colonne de tableau de groupe (valeur la plus large + points + marges). */
export function largeurColonneTableau(t: TableauGroupe, j: number): number {
  const valeur = Math.max(0, ...t.rangees.map((r) => (r.cellules[j].valeur ? Math.min(largeurFragments(r.cellules[j].valeur ?? []), 260) : 0)));
  return Math.max(64, valeur + 46);
}

/** Largeur minimale réservée au libellé (colonne de gauche) pour couper le tableau en blocs : selon
 * le plus long libellé (sur deux lignes), entre 150 et 250 px. */
export function largeurLibelleTableau(t: TableauGroupe): number {
  return Math.round(Math.min(250, Math.max(150, largeurLibelleNaturelle(t) / 2 + 20)));
}

/** Largeur du plus long libellé sur une seule ligne (« Étape 2 — » compris), au plus 320 px. */
export function largeurLibelleNaturelle(t: TableauGroupe): number {
  return Math.min(320, Math.max(...t.rangees.map((r) => largeurFragments(r.libelle) + (r.etape ? 60 : 0))) + 16);
}

/** Largeur du libellé d'UN bloc de colonnes : ce qui reste à côté des colonnes, sans dépasser la
 * largeur naturelle du plus long libellé (libellés sur une ligne quand il y a la place). */
export function largeurLibelleBloc(t: TableauGroupe, largeursBloc: number[], disponibleTotal: number): number {
  const reste = disponibleTotal - largeursBloc.reduce((s, l) => s + l, 0);
  return Math.round(Math.max(largeurLibelleTableau(t), Math.min(largeurLibelleNaturelle(t), reste)));
}

/** Nombre de colonnes de la page « Réponses » : 3 si toutes les réponses sont courtes, 2 si elles
 * tiennent dans une demi-colonne, sinon 1 (largeur imprimable 680 px). */
export function colonnesReponses(largeurMax: number): 1 | 2 | 3 {
  if (largeurMax <= 140) return 3;
  if (largeurMax <= 255) return 2;
  return 1;
}
