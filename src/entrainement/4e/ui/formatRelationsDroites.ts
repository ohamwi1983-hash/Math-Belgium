/**
 * Couche présentation — "Relations entre droites (parallèle/perpendiculaire)"
 * (`src/generateurs/relationsDroites/`, `src/moteur/sessionRelationsDroites.ts`). Rendu LaTeX de
 * l'énoncé, consignes/textes d'aide par écran — dérivés uniquement des champs déjà présents sur le
 * contrat, jamais recalculés différemment côté vérification.
 *
 * `formatPointLatex`/`formatVecteurLatex` sont réutilisées directement depuis
 * `formatEquationDroite.ts` (import + re-export, même style que "Construction graphique — tracer
 * une droite depuis son équation") — ces deux helpers sont purement stateless/présentationnels,
 * jamais dupliqués pour ce générateur. `FragmentConsigne`/`texte`/`latex` (consigne générale, point
 * 1 de `promptgen45modifications.md`) réutilisent le même patron que
 * `segmentsConsigneGeneraleEquationDroite` — type importé, helpers `texte`/`latex` dupliqués (non
 * exportés par le module frère), même principe de duplication assumée qu'ailleurs sur la
 * plateforme.
 */
import type { CritereRelation, ExerciceRelationsDroites, FormeSortieRelation } from "../core/relationsDroites.types";
import type { Composantes } from "../core/vecteur.types";
import { type FragmentConsigne, formatEquationExpliciteXLatex, formatEquationExpliciteYLatex, formatEquationImpliciteLatex, formatPointLatex, formatRepresentationParametriqueLatex, formatVecteurLatex } from "./formatEquationDroite";

export { formatPointLatex, formatVecteurLatex };
export type { FragmentConsigne };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_CRITERE: Record<CritereRelation, string> = {
  parallele: "parallèle",
  perpendiculaire: "perpendiculaire",
};

export const LIBELLE_FORME_SORTIE: Record<FormeSortieRelation, string> = {
  cartesienne: "cartésienne",
  parametrique: "paramétrique",
};

/** Rappel de la droite de référence dans sa forme d'entrée — signes/coefficients toujours
 * simplifiés (correction transversale chapitre 6, point 1). */
export function formatDroiteEntreeLatex(exercice: ExerciceRelationsDroites): string {
  switch (exercice.formeEntree) {
    case "implicite": {
      const d = exercice.impliciteEntree!;
      return formatEquationImpliciteLatex(d.a, d.b, d.c);
    }
    case "explicite_y": {
      const d = exercice.expliciteYEntree!;
      return formatEquationExpliciteYLatex(d.m, d.p);
    }
    case "explicite_x": {
      const d = exercice.expliciteXEntree!;
      return formatEquationExpliciteXLatex(d.n, d.q);
    }
    case "parametrique": {
      const d = exercice.parametriqueEntree!;
      return formatRepresentationParametriqueLatex(d.x0, d.a, d.y0, d.b);
    }
  }
}

/** Bloc énoncé fixe — la droite de référence, toujours affichée telle quelle sur les 3 écrans,
 * précédée de son nom `b` et de `\equiv` (convention transversale chapitre 6, point 2 — jamais
 * l'équation seule sans nom, `promptcorrectionsgen43gen45gen47.md`, B.1). */
export function formatEnonceLatex(exercice: ExerciceRelationsDroites): string {
  return `b \\equiv ${formatDroiteEntreeLatex(exercice)}`;
}

/** "l'équation cartésienne" (singulier) ou "les équations paramétriques" (pluriel, la forme
 * paramétrique s'écrivant toujours comme un système à 2 équations) — même patron que
 * `formatEquationDroite.ts::libelleFormeGenerale`, dupliqué (petite fonction pure). */
function libelleFormeSortieGenerale(formeSortie: FormeSortieRelation): string {
  return formeSortie === "parametrique" ? "les équations paramétriques" : "l'équation cartésienne";
}

/** Consigne générale — rappelle l'objectif complet de l'exercice (forme de sortie cible, droite
 * $d$ cherchée passant par le point $A$, critère parallèle/perpendiculaire, droite $b$ de
 * référence), affichée identique sur les 3 écrans (`promptgen45modifications.md`, point 1). Suivie,
 * côté composant, du bloc de données existant (coordonnées de $A$ et équation de $b$) — jamais
 * dupliquée ici. */
export function segmentsConsigneGeneraleRelationsDroites(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  return [
    texte(`Détermine ${libelleFormeSortieGenerale(exercice.formeSortie)} de la droite `),
    latex("d"),
    texte(" passant par le point "),
    latex("A"),
    texte(` et ${LIBELLE_CRITERE[exercice.critere]} à la droite `),
    latex("b"),
    texte(" qui a pour équation :"),
  ];
}

/** Second bloc — le point par lequel la droite cherchée doit passer, sur sa propre ligne (jamais
 * concaténé à l'énoncé via `\quad` : la variante paramétrique de `formatDroiteEntreeLatex` combine
 * déjà un `\begin{cases}` et une annotation de domaine, un ajout supplémentaire sur la même ligne
 * dépasse un viewport mobile de 375px — correction transversale chapitre 6, point 6). Nommage $A$ —
 * cohérent avec la consigne générale ci-dessus et la convention transversale chapitre 6, point 3
 * ("premier point d'une droite = $A$") ; auparavant "P", jamais nommé conformément à cette
 * convention (`promptgen45modifications.md`, point 1). */
export function formatDonneesRechercheeLatex(exercice: ExerciceRelationsDroites): string {
  return `A${formatPointLatex(exercice.pointCherche)}`;
}

// ============================================================================
// Écran 1 — extraction du vecteur directeur de la droite de référence.
// ============================================================================

export function consigneExtraction(exercice: ExerciceRelationsDroites): string {
  return exercice.formeEntree === "parametrique" ? "Recopie le vecteur directeur déjà donné dans la représentation paramétrique." : "Extrais un vecteur directeur de cette droite de référence.";
}

/** Composantes de $\vec{u}$ en LaTeX réel ($x_{\vec u}$/$y_{\vec u}$, jamais "(-b ; a)" en texte
 * brut) — `promptgen46etcorrectionstransversaleschapitre6.md`, points B.1/B.3/B.4 : les lettres
 * génériques (a/b/c, m/p, n/q) sont introduites via le gabarit d'équation affiché dans la même
 * phrase avant d'être réutilisées. */
export function segmentsAideExtractionNiveau1(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  switch (exercice.formeEntree) {
    case "implicite":
      return [texte("Pour une droite "), latex("ax+by+c=0"), texte(", un vecteur directeur a pour composantes "), latex("x_{\\vec{u}} = -b"), texte(" et "), latex("y_{\\vec{u}} = a"), texte(".")];
    case "explicite_y":
      return [texte("Pour une droite "), latex("y=mx+p"), texte(", un vecteur directeur a pour composantes "), latex("x_{\\vec{u}} = 1"), texte(" et "), latex("y_{\\vec{u}} = m"), texte(".")];
    case "explicite_x":
      return [texte("Pour une droite "), latex("x=ny+q"), texte(", un vecteur directeur a pour composantes "), latex("x_{\\vec{u}} = n"), texte(" et "), latex("y_{\\vec{u}} = 1"), texte(".")];
    case "parametrique":
      return [texte("Le vecteur directeur est déjà donné directement dans la représentation paramétrique.")];
  }
}

// ============================================================================
// Écran 2 — construction du vecteur directeur de la droite cherchée.
// ============================================================================

export function consigneConstruction(exercice: ExerciceRelationsDroites): string {
  return `Construis un vecteur directeur de la droite cherchée, ${LIBELLE_CRITERE[exercice.critere]} à la droite de référence.`;
}

/** Nommage des composantes — $x_{\vec u}$/$y_{\vec u}$ pour $\vec{u}$ (référence), $x_{\vec
 * v}$/$y_{\vec v}$ pour $\vec{v}$ (cherché), rendu en LaTeX réel (jamais "x_u"/"y_v" en texte brut)
 * — `promptgen45modifications.md`, point 2 ; `promptgen46etcorrectionstransversaleschapitre6.md`,
 * points B.1/B.3. */
export function segmentsAideConstructionNiveau1(critere: CritereRelation): FragmentConsigne[] {
  return critere === "parallele"
    ? [
        texte("Deux vecteurs sont colinéaires (même direction) lorsque leur critère de colinéarité "),
        latex("x_{\\vec{u}}\\cdot y_{\\vec{v}}-y_{\\vec{u}}\\cdot x_{\\vec{v}}"),
        texte(" vaut 0 — tout multiple non nul du vecteur de référence convient."),
      ]
    : [
        texte("Deux vecteurs sont orthogonaux (perpendiculaires) lorsque leur critère d'orthogonalité "),
        latex("x_{\\vec{u}}\\cdot x_{\\vec{v}}+y_{\\vec{u}}\\cdot y_{\\vec{v}}"),
        texte(" vaut 0."),
      ];
}

/** Aide niveau 2 — rappelle le vecteur de référence déjà connu, transformation non résolue.
 * Nommage : premier vecteur (référence) = \vec{u}, second vecteur (cherché) = \vec{v} — convention
 * transversale chapitre 6, point 3 ; notation matricielle colonne — point 5. Composantes du
 * vecteur perpendiculaire construit via `formatVecteurLatex` (signe/fraction-aware, jamais un
 * gabarit `-(${...})` manuel : double signe non résolu, ex. `-(-3)`, corrigé —
 * `promptgen45modifications.md`, point 3). */
export function formatAideConstructionNiveau2Latex(exercice: ExerciceRelationsDroites): string {
  const v = exercice.vecteurReference;
  if (exercice.critere === "parallele") {
    return `\\vec{u}${formatVecteurLatex(v)} \\quad \\vec{v} = k\\cdot\\vec{u}, \\; k \\neq 0`;
  }
  const vPerp: Composantes = { x: -v.y, y: v.x };
  return `\\vec{u} = ${formatVecteurLatex(v)} \\quad \\vec{v} = ${formatVecteurLatex(vPerp)}`;
}

export function formatEtatActuelVecteurReferenceLatex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{u}${formatVecteurLatex(exercice.vecteurReference)}`;
}

// ============================================================================
// Écran 3 — équation de la droite cherchée dans la forme de sortie demandée.
// ============================================================================

export function consigneEquation(exercice: ExerciceRelationsDroites): string {
  return exercice.formeSortie === "cartesienne" ? "Donne l'équation cartésienne de la droite cherchée." : "Donne une représentation paramétrique de la droite cherchée.";
}

/** Nommage des composantes du vecteur directeur cherché ($\vec{v}$) — $x_{\vec v}$/$y_{\vec v}$ en
 * LaTeX réel, cohérent avec `segmentsAideConstructionNiveau1` — `promptgen45modifications.md`,
 * point 2 ; `promptgen46etcorrectionstransversaleschapitre6.md`, points B.1/B.3. */
export function segmentsAideEquationNiveau1(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  if (exercice.formeSortie === "cartesienne") {
    return [
      texte("Pour une droite de vecteur directeur "),
      latex("(x_{\\vec{v}} ; y_{\\vec{v}})"),
      texte(" passant par un point "),
      latex("(x_0 ; y_0)"),
      texte(", l'équation implicite s'écrit "),
      latex("y_{\\vec{v}}\\cdot(x-x_0) - x_{\\vec{v}}\\cdot(y-y_0) = 0"),
      texte("."),
    ];
  }
  return [
    texte("Une représentation paramétrique s'écrit "),
    latex("x = x_0 + x_{\\vec{v}}\\cdot t"),
    texte(", "),
    latex("y = y_0 + y_{\\vec{v}}\\cdot t"),
    texte(", où "),
    latex("(x_0 ; y_0)"),
    texte(" est un point de la droite et "),
    latex("(x_{\\vec{v}} ; y_{\\vec{v}})"),
    texte(" son vecteur directeur."),
  ];
}

/** Signe résolu, jamais un double signe littéral (ex. `-(-3)`) — `promptgen45modifications.md`,
 * point 3. Composantes de ce générateur toujours entières par construction (`tirerVecteur`,
 * `generateurs/relationsDroites/index.ts`), un simple signe suffit, pas de fraction à gérer. */
function formatValeurSigneeLatex(valeur: number): string {
  return valeur < 0 ? `-${-valeur}` : `${valeur}`;
}

/** Aide niveau 2 — substitue le point et le vecteur directeur CONFIRMÉS (écran 2), jamais calculée. */
export function formatAideEquationNiveau2Latex(exercice: ExerciceRelationsDroites): string {
  const { pointCherche: p, vecteurCherche: v } = exercice;
  if (exercice.formeSortie === "cartesienne") {
    return `a = ${v.y}, \\quad b = ${formatValeurSigneeLatex(-v.x)}, \\quad c = -\\big(a\\cdot ${p.x} + b\\cdot ${p.y}\\big)`;
  }
  return formatRepresentationParametriqueLatex(p.x, v.x, p.y, v.y);
}

/** Nommage : vecteur cherché = \vec{v} (second vecteur, la référence étant \vec{u}), point = $A$ —
 * convention transversale chapitre 6, point 3. */
export function formatEtatActuelVecteurChercheLatex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{v}${formatVecteurLatex(exercice.vecteurCherche)} \\quad A${formatPointLatex(exercice.pointCherche)}`;
}

export const LATEX_GABARIT_SORTIE: Record<FormeSortieRelation, string> = {
  cartesienne: "ax + by + c = 0",
  parametrique: "\\begin{cases} x = x_0 + a\\,t \\\\ y = y_0 + b\\,t \\end{cases} \\quad t \\in \\mathbb{R}",
};

export const PLACEHOLDER_COMPOSANTE = "ex : -2";
export const PLACEHOLDER_COORDONNEE = "ex : 3";
export const PLACEHOLDER_EQUATION = "ex : y=2x-1";
