/**
 * Couleurs des compétences (processus) sur PAPIER et en WORD — seul endroit de vérité côté documents.
 *
 * Décision de l'utilisateur (22/11/2026) : 1 Connaître = vert sarcelle (le plus clair), 2 Appliquer =
 * bleu franc (clarté moyenne), 3 Transférer = rouge bordeaux (le plus foncé). Les trois se distinguent
 * par la teinte ET par la clarté (lisibles en noir et blanc, en deutéranopie et en protanopie). Ce sont
 * les valeurs du thème CLAIR du site (`--procN`, `--procN-ink` de `src/index.css`) : à garder en accord.
 *
 * - `trait` : filets, cases teintées (≥ 4,5:1 sur blanc, blanc lisible dessus) ;
 * - `encre` : texte coloré sur blanc (≥ 7:1).
 * Le nom de la compétence est toujours écrit : la couleur n'est qu'un appoint.
 */
export type ProcessusPapier = 1 | 2 | 3;

export const COULEURS_PROCESSUS: Record<ProcessusPapier, { trait: string; encre: string }> = {
  1: { trait: "#0c828a", encre: "#05585e" },
  2: { trait: "#1d52a8", encre: "#133f87" },
  3: { trait: "#67152e", encre: "#60132a" },
};

/** Même couleur sans « # » (attributs `color` / `fill` de la bibliothèque `docx`). */
export function couleurProcessusDocx(p: ProcessusPapier, cle: "trait" | "encre" = "encre"): string {
  return COULEURS_PROCESSUS[p][cle].slice(1).toUpperCase();
}

/** Variables CSS des documents HTML : `--proc1`, `--proc1-encre`… (ajoutées au CSS commun). */
export const CSS_VARIABLES_PROCESSUS = ([1, 2, 3] as const).map((p) => `--proc${p}: ${COULEURS_PROCESSUS[p].trait}; --proc${p}-encre: ${COULEURS_PROCESSUS[p].encre};`).join(" ");
