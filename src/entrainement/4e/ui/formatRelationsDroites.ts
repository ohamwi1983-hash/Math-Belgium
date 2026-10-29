/**
 * Couche présentation — "Relations entre droites (parallèle/perpendiculaire)"
 * (`src/generateurs/relationsDroites/`, `src/moteur/sessionRelationsDroites.ts`). Rendu LaTeX de
 * l'énoncé, consignes/textes d'aide par écran — dérivés uniquement des champs déjà présents sur le
 * contrat, jamais recalculés différemment côté vérification.
 *
 * `formatPointLatex`/`formatVecteurLatex` sont réutilisées directement depuis
 * `formatEquationDroite.ts` (import + re-export, même style que "Construction graphique — tracer
 * une droite depuis son équation") — ces deux helpers sont purement stateless/présentationnels,
 * jamais dupliqués pour ce générateur. `FragmentConsigne`/`texte`/`latex` réutilisent le même patron
 * que `segmentsConsigneGeneraleEquationDroite` — type importé, helpers `texte`/`latex` dupliqués
 * (non exportés par le module frère).
 *
 * Nommage (aligné sur le cours, audit chapitre 7, gen45 point 21) : famille `construction` — droite
 * donnée `d` (vecteur $\vec u$), droite cherchée `d′` (vecteur $\vec v$), point imposé `A` ;
 * famille `reconnaissance` — droites `d₁` (vecteur $\vec u$) et `d₂` (vecteur $\vec v$). Jamais
 * « b » pour une droite (conflit avec le coefficient b de `ax+by+c=0`).
 */
import type { CritereRelation, DroiteDonneeRelation, ExerciceRelationsDroites, FormeEntreeRelation, FormeSortieRelation, RelationReconnue } from "../core/relationsDroites.types";
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

export const LIBELLE_RELATION: Record<RelationReconnue, string> = {
  paralleles: "Parallèles",
  perpendiculaires: "Perpendiculaires",
  aucune: "Ni parallèles ni perpendiculaires",
};

/** Nom LaTeX de la droite donnée / de la droite cherchée selon la famille. */
function nomDroite1(exercice: ExerciceRelationsDroites): string {
  return exercice.famille === "reconnaissance" ? "d_1" : "d";
}
const NOM_DROITE_CHERCHEE = "d'";
const NOM_DROITE_2 = "d_2";

/** La droite donnée (d, ou d₁ en reconnaissance) comme `DroiteDonneeRelation`. */
export function droiteDonnee1(exercice: ExerciceRelationsDroites): DroiteDonneeRelation {
  return {
    formeEntree: exercice.formeEntree,
    parametriqueEntree: exercice.parametriqueEntree,
    impliciteEntree: exercice.impliciteEntree,
    expliciteYEntree: exercice.expliciteYEntree,
    expliciteXEntree: exercice.expliciteXEntree,
    vecteur: exercice.vecteurReference,
  };
}

/** Une droite donnée dans sa forme d'entrée — signes/coefficients toujours simplifiés. */
export function formatDroiteDonneeLatex(d: DroiteDonneeRelation): string {
  switch (d.formeEntree) {
    case "implicite": {
      const e = d.impliciteEntree!;
      return formatEquationImpliciteLatex(e.a, e.b, e.c);
    }
    case "explicite_y": {
      const e = d.expliciteYEntree!;
      return formatEquationExpliciteYLatex(e.m, e.p);
    }
    case "explicite_x": {
      const e = d.expliciteXEntree!;
      return formatEquationExpliciteXLatex(e.n, e.q);
    }
    case "parametrique": {
      const e = d.parametriqueEntree!;
      return formatRepresentationParametriqueLatex(e.x0, e.a, e.y0, e.b);
    }
  }
}

/** Bloc énoncé fixe — la droite donnée, toujours affichée telle quelle sur les 3 écrans, précédée
 * de son nom et de `\equiv` (jamais l'équation seule sans nom). */
export function formatEnonceLatex(exercice: ExerciceRelationsDroites): string {
  return `${nomDroite1(exercice)} \\equiv ${formatDroiteDonneeLatex(droiteDonnee1(exercice))}`;
}

/** Second bloc de l'énoncé — le point imposé `A` (famille `construction`) ou la droite d₂ (famille
 * `reconnaissance`), sur sa propre ligne (jamais concaténé via `\quad`, débordement mobile). */
export function formatDonneesRechercheeLatex(exercice: ExerciceRelationsDroites): string {
  if (exercice.famille === "reconnaissance") return `${NOM_DROITE_2} \\equiv ${formatDroiteDonneeLatex(exercice.droite2!)}`;
  return `A${formatPointLatex(exercice.pointCherche)}`;
}

/** "l'équation cartésienne" (singulier) ou "les équations paramétriques" (pluriel). */
function libelleFormeSortieGenerale(formeSortie: FormeSortieRelation): string {
  return formeSortie === "parametrique" ? "les équations paramétriques" : "l'équation cartésienne";
}

/** Consigne générale — affichée identique sur les 3 écrans, suivie côté composant du bloc de
 * données (droite donnée + point A, ou d₁ + d₂). Famille `reconnaissance` : la relation n'est
 * JAMAIS écrite dans l'énoncé — c'est elle que l'élève doit reconnaître. */
export function segmentsConsigneGeneraleRelationsDroites(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  if (exercice.famille === "reconnaissance") {
    return [
      texte("Les droites "),
      latex("d_1"),
      texte(" et "),
      latex("d_2"),
      texte(" sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ? Elles ont pour équations :"),
    ];
  }
  return [
    texte(`Détermine ${libelleFormeSortieGenerale(exercice.formeSortie)} de la droite `),
    latex(NOM_DROITE_CHERCHEE),
    texte(" passant par le point "),
    latex("A"),
    texte(` et ${LIBELLE_CRITERE[exercice.critere]} à la droite `),
    latex("d"),
    texte(" qui a pour équation :"),
  ];
}

// ============================================================================
// Écrans d'extraction — vecteur directeur d'une droite donnée (d / d₁, puis d₂).
// ============================================================================

function consigneExtractionDroite(forme: FormeEntreeRelation, nomVecteur: string, nomDroite: string): string {
  return forme === "parametrique"
    ? `Recopie le vecteur directeur ${nomVecteur} de ${nomDroite}, déjà donné dans la représentation paramétrique.`
    : `Extrais un vecteur directeur ${nomVecteur} de la droite ${nomDroite}.`;
}

export function consigneExtraction(exercice: ExerciceRelationsDroites): string {
  return consigneExtractionDroite(exercice.formeEntree, "u", exercice.famille === "reconnaissance" ? "d₁" : "d");
}

export function consigneExtraction2(exercice: ExerciceRelationsDroites): string {
  return consigneExtractionDroite(exercice.droite2!.formeEntree, "v", "d₂");
}

/** Composantes du vecteur directeur en LaTeX réel ($x_{\vec u}$/$y_{\vec u}$) — les lettres
 * génériques (a/b/c, m/p, n/q) sont introduites via le gabarit d'équation affiché dans la même
 * phrase avant d'être réutilisées. Cas vertical/horizontal couverts sans branche : `x=q` est la
 * forme `x=ny+q` avec n=0, `y=p` la forme `y=mx+p` avec m=0. */
function segmentsAideExtractionForme(forme: FormeEntreeRelation, nom: "u" | "v"): FragmentConsigne[] {
  const x = `x_{\\vec{${nom}}}`;
  const y = `y_{\\vec{${nom}}}`;
  switch (forme) {
    case "implicite":
      return [texte("Pour une droite "), latex("ax+by+c=0"), texte(", un vecteur directeur a pour composantes "), latex(`${x} = -b`), texte(" et "), latex(`${y} = a`), texte(".")];
    case "explicite_y":
      return [
        texte("Pour une droite "),
        latex("y=mx+p"),
        texte(" (une droite horizontale "),
        latex("y=p"),
        texte(" a "),
        latex("m=0"),
        texte("), un vecteur directeur a pour composantes "),
        latex(`${x} = 1`),
        texte(" et "),
        latex(`${y} = m`),
        texte("."),
      ];
    case "explicite_x":
      return [
        texte("Pour une droite "),
        latex("x=ny+q"),
        texte(" (une droite verticale "),
        latex("x=q"),
        texte(" a "),
        latex("n=0"),
        texte("), un vecteur directeur a pour composantes "),
        latex(`${x} = n`),
        texte(" et "),
        latex(`${y} = 1`),
        texte("."),
      ];
    case "parametrique":
      return [texte("Le vecteur directeur est déjà donné directement dans la représentation paramétrique : ce sont les coefficients de "), latex("t"), texte(".")];
  }
}

export function segmentsAideExtractionNiveau1(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  return segmentsAideExtractionForme(exercice.formeEntree, "u");
}

export function segmentsAideExtraction2Niveau1(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  return segmentsAideExtractionForme(exercice.droite2!.formeEntree, "v");
}

// ============================================================================
// Écran 2 (famille `construction`) — vecteur directeur de la droite cherchée d′.
// ============================================================================

export function consigneConstruction(exercice: ExerciceRelationsDroites): string {
  return `Construis un vecteur directeur v de la droite d′, ${LIBELLE_CRITERE[exercice.critere]} à la droite d.`;
}

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

/** Aide niveau 2 — rappelle le vecteur de référence déjà connu et la transformation. Composantes du
 * vecteur perpendiculaire via `formatVecteurLatex` (signe/fraction-aware, jamais `-(-3)`). */
export function formatAideConstructionNiveau2Latex(exercice: ExerciceRelationsDroites): string {
  const v = exercice.vecteurReference;
  if (exercice.critere === "parallele") {
    return `\\vec{u}${formatVecteurLatex(v)} \\quad \\vec{v} = k\\cdot\\vec{u}, \\; k \\neq 0`;
  }
  const vPerp: Composantes = { x: v.y === 0 ? 0 : -v.y, y: v.x };
  return `\\vec{u} = ${formatVecteurLatex(v)} \\quad \\vec{v} = ${formatVecteurLatex(vPerp)}`;
}

/** Réponse attendue de l'écran 2 — UN vecteur valable (tout multiple non nul l'est aussi). */
export function formatConstructionAttendueLatex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{v}${formatVecteurLatex(exercice.vecteurCherche)} \\; \\text{(ou tout multiple non nul)}`;
}

export function formatEtatActuelVecteurReferenceLatex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{u}${formatVecteurLatex(exercice.vecteurReference)}`;
}

export function formatEtatActuelVecteur2Latex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{v}${formatVecteurLatex(exercice.droite2!.vecteur)}`;
}

// ============================================================================
// Écran 3 (famille `construction`) — équation de d′ dans la forme de sortie demandée.
// ============================================================================

export function consigneEquation(exercice: ExerciceRelationsDroites): string {
  return exercice.formeSortie === "cartesienne" ? "Donne une équation cartésienne de la droite d′." : "Donne une représentation paramétrique de la droite d′.";
}

export function segmentsAideEquationNiveau1(exercice: ExerciceRelationsDroites): FragmentConsigne[] {
  if (exercice.formeSortie === "cartesienne") {
    return [
      texte("Pour une droite de vecteur directeur "),
      latex("\\vec{v}(x_{\\vec{v}} ; y_{\\vec{v}})"),
      texte(" passant par le point "),
      latex("A(x_A ; y_A)"),
      texte(", une équation cartésienne s'écrit "),
      latex("y_{\\vec{v}}\\cdot(x-x_A) - x_{\\vec{v}}\\cdot(y-y_A) = 0"),
      texte("."),
    ];
  }
  return [
    texte("Une représentation paramétrique s'écrit "),
    latex("x = x_A + x_{\\vec{v}}\\cdot t"),
    texte(", "),
    latex("y = y_A + y_{\\vec{v}}\\cdot t"),
    texte(", où "),
    latex("A(x_A ; y_A)"),
    texte(" est un point de la droite et "),
    latex("\\vec{v}(x_{\\vec{v}} ; y_{\\vec{v}})"),
    texte(" son vecteur directeur."),
  ];
}

/** Facteur entre parenthèses s'il est négatif (« 2·(x−(−3)) », jamais « 2·(x−−3) »). */
function facteurLatex(valeur: number): string {
  return valeur < 0 ? `(${valeur})` : `${valeur}`;
}

/** Aide niveau 2 — substitue le point A et le vecteur directeur de d′ dans le gabarit de l'aide 1,
 * jamais développé ni simplifié. Valeurs négatives toujours entre parenthèses. */
export function formatAideEquationNiveau2Latex(exercice: ExerciceRelationsDroites): string {
  const { pointCherche: p, vecteurCherche: v } = exercice;
  if (exercice.formeSortie === "cartesienne") {
    return `${facteurLatex(v.y)}\\cdot\\big(x-${facteurLatex(p.x)}\\big) - ${facteurLatex(v.x)}\\cdot\\big(y-${facteurLatex(p.y)}\\big) = 0`;
  }
  return formatRepresentationParametriqueLatex(p.x, v.x, p.y, v.y);
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Équation cartésienne de d′, développée, simplifiée (coefficients divisés par leur PGCD, premier
 * coefficient non nul positif) — réponse attendue, jamais le gabarit de l'aide (audit chapitre 7,
 * gen45 point 19 : « Équation attendue » affichait « a = …, b = …, c = −(a·… + b·…) »). */
export function formatEquationCartesienneAttendueLatex(exercice: ExerciceRelationsDroites): string {
  const { a, b, c } = exercice.referenceImpliciteSortie;
  const g = pgcd(pgcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1;
  const signe = a < 0 || (a === 0 && b < 0) ? -1 : 1;
  const k = signe / g;
  const net = (x: number) => (x * k === 0 ? 0 : x * k);
  return formatEquationImpliciteLatex(net(a), net(b), net(c));
}

/** Réponse attendue de l'écran 3 — l'équation elle-même (cartésienne simplifiée, ou représentation
 * paramétrique). */
export function formatEquationAttendueLatex(exercice: ExerciceRelationsDroites): string {
  return exercice.formeSortie === "cartesienne" ? formatEquationCartesienneAttendueLatex(exercice) : formatAideEquationNiveau2Latex(exercice);
}

/** Récapitulatif — vecteur directeur de d′ (A est déjà dans l'énoncé). */
export function formatEtatActuelVecteurChercheLatex(exercice: ExerciceRelationsDroites): string {
  return `\\vec{v}${formatVecteurLatex(exercice.vecteurCherche)} \\quad A${formatPointLatex(exercice.pointCherche)}`;
}

// ============================================================================
// Écran 3 (famille `reconnaissance`) — relation entre d₁ et d₂.
// ============================================================================

/** Consigne de l'écran — la question elle-même est déjà dans l'énoncé (consigne générale). */
export const CONSIGNE_RELATION = "Choisis la relation entre d₁ et d₂ à l'aide de leurs vecteurs directeurs (une seule tentative).";

/** Aide niveau 1 — la méthode du cours, dans l'ordre : colinéarité d'abord, orthogonalité ensuite. */
export function segmentsAideRelationNiveau1(): FragmentConsigne[] {
  return [
    texte("Calcule d'abord le critère de colinéarité "),
    latex("x_{\\vec{u}}\\cdot y_{\\vec{v}}-y_{\\vec{u}}\\cdot x_{\\vec{v}}"),
    texte(" : s'il vaut 0, les droites sont parallèles. Sinon, calcule le critère d'orthogonalité "),
    latex("x_{\\vec{u}}\\cdot x_{\\vec{v}}+y_{\\vec{u}}\\cdot y_{\\vec{v}}"),
    texte(" : s'il vaut 0, elles sont perpendiculaires. Si aucun des deux ne vaut 0, elles ne sont ni l'un ni l'autre."),
  ];
}

/** Aide niveau 2 — les deux critères substitués avec les vecteurs confirmés, jamais calculés. */
export function formatAideRelationNiveau2Latex(exercice: ExerciceRelationsDroites): string {
  const u = exercice.vecteurReference;
  const v = exercice.droite2!.vecteur;
  return `${facteurLatex(u.x)}\\cdot ${facteurLatex(v.y)} - ${facteurLatex(u.y)}\\cdot ${facteurLatex(v.x)} \\quad \\text{et} \\quad ${facteurLatex(u.x)}\\cdot ${facteurLatex(v.x)} + ${facteurLatex(u.y)}\\cdot ${facteurLatex(v.y)}`;
}

/** Réponse attendue de l'écran "relation" — la relation, justifiée par les deux critères calculés. */
export function formatRelationAttendueLatex(exercice: ExerciceRelationsDroites): string {
  const u = exercice.vecteurReference;
  const v = exercice.droite2!.vecteur;
  const det = u.x * v.y - u.y * v.x;
  const prod = u.x * v.x + u.y * v.y;
  const conclusion =
    exercice.relation === "paralleles" ? "\\text{parallèles}" : exercice.relation === "perpendiculaires" ? "\\text{perpendiculaires}" : "\\text{ni parallèles ni perpendiculaires}";
  if (exercice.relation === "paralleles") return `x_{\\vec{u}}\\cdot y_{\\vec{v}}-y_{\\vec{u}}\\cdot x_{\\vec{v}} = 0 \\Rightarrow ${conclusion}`;
  return `x_{\\vec{u}}\\cdot y_{\\vec{v}}-y_{\\vec{u}}\\cdot x_{\\vec{v}} = ${det}, \\quad x_{\\vec{u}}\\cdot x_{\\vec{v}}+y_{\\vec{u}}\\cdot y_{\\vec{v}} = ${prod} \\Rightarrow ${conclusion}`;
}

/** Placeholders — hors de l'espace des tirages (composantes générées entières ≤ 4 en valeur
 * absolue, donc jamais 5/2 ni une pente −7), et montrant qu'une fraction se tape. */
export const PLACEHOLDER_COMPOSANTE = "ex : 5/2";
export const PLACEHOLDER_COORDONNEE = "ex : 7/2";
export const PLACEHOLDER_EQUATION = "ex : 7x-y+50=0";
