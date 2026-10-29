/**
 * Couche présentation — "Caractéristiques d'une droite" (`src/generateurs/caracteristiquesDroite/`,
 * `src/moteur/sessionCaracteristiquesDroite.ts`). Rendu LaTeX de l'énoncé, consignes/textes d'aide
 * par écran — dérivés uniquement des champs déjà présents sur le contrat, jamais recalculés
 * différemment côté vérification (`moteur/verificationCaracteristiquesDroite.ts`).
 *
 * `formatPointLatex`/`formatVecteurLatex` réutilisés directement depuis
 * `formatEquationDroite.ts` (import + re-export, même style que "Relations entre droites"/
 * "Construction graphique — tracer une droite") — purement stateless/présentationnels, jamais
 * dupliqués pour ce générateur. `formatDroiteEntreeLatex` est en revanche DUPLIQUÉE depuis
 * `formatRelationsDroites.ts` (petite fonction pure, même principe de duplication assumée
 * qu'ailleurs dans le projet, ex. `ajusterAuRatio`) — contrats indépendants entre générateurs.
 */
import type { CaracteristiqueDemandee, ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import { formatFractionIrreductible } from "./formatFraction";
import { type FragmentConsigne, formatEquationExpliciteXLatex, formatEquationExpliciteYLatex, formatEquationImpliciteLatex, formatPointLatex, formatRepresentationParametriqueLatex, formatVecteurLatex } from "./formatEquationDroite";

export { formatPointLatex, formatVecteurLatex };
export type { FragmentConsigne };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_CARACTERISTIQUE: Record<CaracteristiqueDemandee, string> = {
  pente: "la pente",
  angleOx: "l'angle avec l'axe Ox",
  angleOy: "l'angle avec l'axe Oy",
};

/** Rappel de la droite de départ dans sa forme d'entrée — signes/coefficients toujours simplifiés
 * (correction transversale chapitre 6, point 1). */
export function formatDroiteEntreeLatex(exercice: ExerciceCaracteristiquesDroite): string {
  switch (exercice.variante) {
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

/** Bloc énoncé fixe — la droite de départ, affichée une seule fois dans le bloc de données de
 * l'en-tête de l'exercice (jamais répétée écran par écran). Ce qui sera demandé n'est plus
 * embarqué dans cette même expression LaTeX (débordement mobile sur la variante paramétrique,
 * `\begin{cases}` déjà large + texte "(à déterminer : ...)" — correction transversale chapitre 6,
 * point 6) : cette information est déjà portée par la consigne dédiée de chaque écran
 * (`segmentsConsigneExtraction`/`segmentsConsigneCaracteristiques`), jamais perdue. */
export function formatEnonceLatex(exercice: ExerciceCaracteristiquesDroite): string {
  return formatDroiteEntreeLatex(exercice);
}

// ============================================================================
// Écran 1 — extraction d'un point et d'un vecteur directeur de la droite de départ.
// ============================================================================

/** Consigne — nomme explicitement le point $A$ et le vecteur directeur $\vec{u}$, cohérent avec le
 * nommage des labels de champs et des aides ci-dessous (`promptgen46modifications.md`, point 1).
 * Distingue toujours la variante paramétrique ("recopie" — rien à extraire, déjà donné) des 3
 * formes cartésiennes ("extrais"), même distinction qu'avant ce correctif. */
export function segmentsConsigneExtraction(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  if (exercice.variante === "parametrique") {
    return [texte("Recopie le point "), latex("A"), texte(" et le vecteur directeur "), latex("\\vec{u}"), texte(" déjà donnés dans la représentation paramétrique.")];
  }
  return [texte("Extrais un point "), latex("A"), texte(" et un vecteur directeur "), latex("\\vec{u}"), texte(" de cette droite.")];
}

/** Nommage $x_A$/$y_A$ (point) et $x_{\vec u}$/$y_{\vec u}$ (vecteur, l'indice porte lui-même la
 * flèche vectorielle) — cohérent avec les labels de champs, jamais une notation générique
 * (`promptgen46modifications.md`/`promptgen46etcorrectionstransversaleschapitre6.md`, points 1/B.1/
 * B.3). Rendu en `FragmentConsigne[]` (texte brut + KaTeX inline réel), jamais en texte brut avec
 * un caractère `_` littéral — abandonne l'ancienne convention "indice littéral" (`x_S`/`y_F`)
 * utilisée jusque-là pour les aides niveau 1, explicitement proscrite par B.1.
 *
 * Cas `implicite` : méthode PAR 2 POINTS PUIS DIFFÉRENCE (choisir 2 valeurs de $x_A$, résoudre pour
 * $y_A$, construire $\vec{u}$ comme la différence des 2 points) — remplace l'ancienne méthode
 * "$x_{\vec u}=-b$, $y_{\vec u}=a$" dérivée du vecteur normal à l'implicite, hors-programme en 4e
 * (lien normale/direction orthogonale jamais enseigné) — `promptgen46etcorrectionstransversaleschapitre6.md`,
 * point A.2. Cas `explicite_y`/`explicite_x` : formule directe conservée (dans le programme,
 * lecture directe des coefficients d'une droite explicite), mais $m$/$n$/$p$/$q$ désormais
 * explicitement présentés comme les coefficients de l'équation avant d'être réutilisés (B.4). */
export function segmentsAideExtractionNiveau1(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  switch (exercice.variante) {
    case "implicite":
      return [
        texte("Choisis 2 valeurs différentes de "),
        latex("x_A"),
        texte(", résous l'équation pour trouver le "),
        latex("y_A"),
        texte(" correspondant à chacune (si l'équation ne peut pas se résoudre pour "),
        latex("y_A"),
        texte(", la droite est verticale : choisis alors 2 valeurs de "),
        latex("y_A"),
        texte(" à la place). Tu obtiens ainsi 2 points distincts de la droite. Le vecteur directeur "),
        latex("\\vec{u}"),
        texte(" est la différence de ces 2 points : "),
        latex("x_{\\vec{u}}"),
        texte(" = différence des "),
        latex("x_A"),
        texte(", "),
        latex("y_{\\vec{u}}"),
        texte(" = différence des "),
        latex("y_A"),
        texte("."),
      ];
    case "explicite_y":
      return [
        texte("Cette équation est de la forme "),
        latex("y=mx+p"),
        texte(", où "),
        latex("m"),
        texte(" et "),
        latex("p"),
        texte(" sont ses coefficients. Le vecteur directeur a pour composantes "),
        latex("x_{\\vec{u}}=1"),
        texte(" et "),
        latex("y_{\\vec{u}}=m"),
        texte(". Le point "),
        latex("(x_A ; y_A)=(0 ; p)"),
        texte(" appartient toujours à la droite."),
      ];
    case "explicite_x":
      return [
        texte("Cette équation est de la forme "),
        latex("x=ny+q"),
        texte(", où "),
        latex("n"),
        texte(" et "),
        latex("q"),
        texte(" sont ses coefficients. Le vecteur directeur a pour composantes "),
        latex("x_{\\vec{u}}=n"),
        texte(" et "),
        latex("y_{\\vec{u}}=1"),
        texte(". Le point "),
        latex("(x_A ; y_A)=(q ; 0)"),
        texte(" appartient toujours à la droite."),
      ];
    case "parametrique":
      return [texte("Le point "), latex("A"), texte(" et le vecteur directeur "), latex("\\vec{u}"), texte(" sont déjà donnés directement dans la représentation paramétrique.")];
  }
}

/** Aide niveau 2, cas `implicite` — révèle 2 POINTS trouvés par la méthode (jamais la soustraction
 * finale qui donnerait $\vec{u}$ directement) : pour une droite non verticale, résout l'équation
 * pour $x_A=0$ et $x_A=1$ ; pour une verticale ($b=0$, $x$ constant), résout pour $y_A=0$ et
 * $y_A=1$ à la place — `formatPointLatex` gère déjà les fractions irréductibles si besoin (aucune
 * dans ce générateur en pratique, composantes toujours entières par construction, mais la primitive
 * partagée reste la source de vérité pour l'affichage). */
function formatAideExtractionNiveau2Implicite(exercice: ExerciceCaracteristiquesDroite): string {
  const { a, b, c } = exercice.impliciteEntree!;
  if (b === 0) {
    const x = -c / a;
    return `y=0 \\Rightarrow ${formatPointLatex({ x, y: 0 })}, \\quad y=1 \\Rightarrow ${formatPointLatex({ x, y: 1 })}`;
  }
  const resoudreYPourX = (x: number): number => -(a * x + c) / b;
  return `x=0 \\Rightarrow ${formatPointLatex({ x: 0, y: resoudreYPourX(0) })}, \\quad x=1 \\Rightarrow ${formatPointLatex({ x: 1, y: resoudreYPourX(1) })}`;
}

/** Aide niveau 2 — cas `implicite` : révèle 2 points (méthode "2 points"), jamais leur différence
 * (voir `formatAideExtractionNiveau2Implicite`). Autres variantes : révèle UN des deux ingrédients
 * déjà donnés (le vecteur directeur), jamais les deux à la fois — le point reste encore à trouver. */
export function formatAideExtractionNiveau2Latex(exercice: ExerciceCaracteristiquesDroite): string {
  if (exercice.variante === "implicite") return formatAideExtractionNiveau2Implicite(exercice);
  return `\\vec{u}${formatVecteurLatex(exercice.vecteur)}`;
}

// ============================================================================
// Écran 2 — pente-ou-angle + ordonnée à l'origine.
// ============================================================================

/** "l'angle $\alpha$ avec l'axe $Ox$"/"l'axe $Oy$" (angle, toujours défini) ou "la pente" (jamais
 * de $\alpha$/axe associé) — fragment central de `segmentsConsigneCaracteristiques` ci-dessous. */
function fragmentsChampPrincipal(caracteristiqueDemandee: CaracteristiqueDemandee): FragmentConsigne[] {
  if (caracteristiqueDemandee === "pente") return [texte("la pente")];
  const axe = caracteristiqueDemandee === "angleOx" ? "Ox" : "Oy";
  return [texte("l'angle "), latex("\\alpha"), texte(" avec l'axe "), latex(axe)];
}

/** Consigne générale de l'écran 2 — adapte "Quel est.../Quelle est..." et le champ principal
 * (angle avec Ox, angle avec Oy, ou pente) selon `exercice.caracteristiqueDemandee`,
 * `promptgen46modifications.md`, point 2. Le détail "indique 'n'existe pas' si..." n'est pas
 * répété ici : les deux blocs Existe/N'existe pas de l'écran (point 3) le rendent déjà explicite.
 * Se termine par "?" (pas par ": [équation]") — l'équation de la droite est affichée une seule
 * fois, dans le bloc de données de l'en-tête de l'exercice, jamais répétée ici. */
export function segmentsConsigneCaracteristiques(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  const prefixe = exercice.caracteristiqueDemandee === "pente" ? "Quelle est " : "Quel est ";
  return [texte(prefixe), ...fragmentsChampPrincipal(exercice.caracteristiqueDemandee), texte(" et l'ordonnée à l'origine de cette droite ?")];
}

/** Question du bloc "pente" (écran 2, point 3) — n'apparaît que quand `caracteristiqueDemandee ===
 * "pente"` : seul cas où la pente elle-même doit encore être choisie Existe/N'existe pas. */
export const QUESTION_PENTE = "Quelle est la pente de cette droite ?";

/** Question du bloc "ordonnée à l'origine" (écran 2, point 3) — toujours affichée, que le champ
 * principal soit la pente ou un angle. */
export const QUESTION_ORDONNEE = "Quelle est l'ordonnée à l'origine ?";

// ----------------------------------------------------------------------------
// Valeurs générées — fraction irréductible, jamais de décimal ni de double signe (« m·−5 »).
// ----------------------------------------------------------------------------

/** Nombre rationnel généré en LaTeX : entier, ou `\frac{p}{q}` signé (jamais « −1/1 »). */
export function formatNombreLatex(valeur: number): string {
  const [numerateur, denominateur] = formatFractionIrreductible(Math.abs(valeur)).split("/");
  const corps = denominateur === undefined ? numerateur! : `\\frac{${numerateur}}{${denominateur}}`;
  return valeur < 0 ? `-${corps}` : corps;
}

/** Même valeur, mais utilisable comme FACTEUR dans un produit : entre parenthèses si négative ou
 * fractionnaire (« m·(−5) », « (−1/3)·2 », jamais « m·−5 »). */
function formatFacteurLatex(valeur: number): string {
  const brut = formatNombreLatex(valeur);
  return valeur < 0 || !Number.isInteger(valeur) ? `\\left(${brut}\\right)` : brut;
}

function estEntier(valeur: number): boolean {
  return Math.abs(valeur - Math.round(valeur)) < 1e-9;
}

/** « = 45^\circ » pour un angle remarquable (entier exact), « \approx 63^\circ » sinon (arrondi à
 * l'unité, comme demandé à l'élève). */
export function formatEgaliteAngleLatex(angleDeg: number): string {
  return estEntier(angleDeg) ? `= ${Math.round(angleDeg)}^\\circ` : `\\approx ${Math.round(angleDeg)}^\\circ`;
}

/** Angle demandé à l'écran 2 (Ox ou Oy) — jamais appelé quand c'est la pente qui est demandée. */
function angleDemande(exercice: ExerciceCaracteristiquesDroite): number {
  return exercice.caracteristiqueDemandee === "angleOy" ? exercice.angleOyDeg : exercice.angleDeg;
}

/** Aide niveau 1 — rappel des formules, JAMAIS appliquées ; insiste explicitement sur la nécessité
 * de vérifier le cas vertical AVANT tout calcul (piège central de cet exercice). Ne parle que de ce
 * qui est demandé : jamais d'angle quand la question porte sur la pente, et jamais « 90° » pour
 * l'angle avec Oy d'une verticale (qui vaut 0° — audit chapitre 7, gen46 point 1). Rappelle la
 * correction « +180° » d'un arctan négatif (point 2 : sinon l'élève tape −45° pour 135°). Nommage
 * $x_{\vec u}$/$y_{\vec u}$ (composantes du vecteur directeur $\vec{u}$ confirmé à l'écran 1) et
 * $x_A$/$y_A$ (point confirmé) — jamais "vx"/"vy"/"x0"/"y0" en texte brut. */
export function segmentsAideCaracteristiquesNiveau1(exercice: ExerciceCaracteristiquesDroite): FragmentConsigne[] {
  const demande = exercice.caracteristiqueDemandee;
  const casVertical =
    demande === "pente"
      ? [texte(") — dans ce cas, la pente et l'ordonnée à l'origine n'existent pas. Sinon : pente ")]
      : [
          texte(") — dans ce cas, l'ordonnée à l'origine n'existe pas et l'angle avec "),
          latex(demande === "angleOx" ? "Ox" : "Oy"),
          texte(demande === "angleOx" ? " vaut 90°. Sinon : pente " : " vaut 0°. Sinon : pente "),
        ];
  const formuleAngle: FragmentConsigne[] =
    demande === "pente"
      ? []
      : demande === "angleOx"
        ? [
            texte(", angle "),
            latex("\\alpha=\\arctan(m)"),
            texte(" — si la calculatrice donne un angle négatif, ajoute 180° (l'angle d'une droite est toujours compris entre 0° et 180°)"),
          ]
        : [texte(", angle "), latex("\\alpha=90^\\circ-\\arctan(m)"), texte(" (toujours compris entre 0° et 180°)")];
  return [
    texte("Vérifie d'abord si la droite est verticale (vecteur directeur "),
    latex("\\vec{u}"),
    texte(" de la forme "),
    latex("(0 ; y_{\\vec{u}})"),
    ...casVertical,
    latex("m=\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"),
    ...formuleAngle,
    texte(", ordonnée à l'origine "),
    latex("p=y_A-m\\cdot x_A"),
    texte(" (avec "),
    latex("A"),
    texte(" le point confirmé à l'écran précédent)."),
  ];
}

/** Conclusion d'une verticale — uniquement ce qui est demandé (jamais « α = 90° » pour Oy). */
function conclusionVerticaleLatex(exercice: ExerciceCaracteristiquesDroite): string {
  if (exercice.caracteristiqueDemandee === "pente") return "\\text{verticale} : \; m \\text{ et } p \\text{ n'existent pas}";
  return `\\text{verticale} : \; \\alpha = ${Math.round(angleDemande(exercice))}^\\circ, \; p \\text{ n'existe pas}`;
}

/** Aide niveau 2 — formule(s) substituée(s) avec le point/vecteur CONFIRMÉS à l'écran 1, jamais
 * le résultat demandé. Pente demandée : le vecteur est rappelé, la division reste à faire. Angle
 * demandé : la pente (simple intermédiaire) est donnée simplifiée, l'angle reste à calculer.
 * Facteurs négatifs/fractionnaires toujours entre parenthèses (« p = 0 − m·(−5) », audit
 * chapitre 7, gen46 point 3). */
export function formatAideCaracteristiquesNiveau2Latex(exercice: ExerciceCaracteristiquesDroite): string {
  const { point: a, vecteur: v } = exercice;
  if (exercice.verticale) {
    return `\\vec{u}${formatVecteurLatex(v)} \\Rightarrow ${conclusionVerticaleLatex(exercice)}`;
  }
  if (exercice.caracteristiqueDemandee === "pente") {
    return `\\vec{u}${formatVecteurLatex(v)} : \; m = \\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}, \\quad p = ${formatNombreLatex(a.y)} - m\\cdot ${formatFacteurLatex(a.x)}`;
  }
  const pente = exercice.pente!;
  const formuleAngle = exercice.caracteristiqueDemandee === "angleOx" ? "\\alpha = \\arctan(m)" : "\\alpha = 90^\\circ - \\arctan(m)";
  return `m = ${formatNombreLatex(pente)}, \\quad ${formuleAngle}, \\quad p = ${formatNombreLatex(a.y)} - ${formatFacteurLatex(pente)}\\cdot ${formatFacteurLatex(a.x)}`;
}

export function formatEtatActuelPointVecteurLatex(exercice: ExerciceCaracteristiquesDroite): string {
  return `A${formatPointLatex(exercice.point)} \\quad \\vec{u}${formatVecteurLatex(exercice.vecteur)}`;
}

/** Révélation complète après épuisement des tentatives — les VALEURS attendues elles-mêmes, jamais
 * seulement la formule substituée (contrairement à l'aide niveau 2, qui ne calcule jamais). Toujours
 * la cible réellement vérifiée (`cibleChampPrincipal`) : jamais « α = 90° » pour l'angle avec Oy
 * d'une verticale (0°, audit chapitre 7, gen46 point 1). */
export function formatCaracteristiquesAttenduesLatex(exercice: ExerciceCaracteristiquesDroite): string {
  if (exercice.verticale) return conclusionVerticaleLatex(exercice);
  const champPrincipal =
    exercice.caracteristiqueDemandee === "pente" ? `m = ${formatNombreLatex(exercice.pente!)}` : `\\alpha ${formatEgaliteAngleLatex(angleDemande(exercice))}`;
  return `${champPrincipal}, \\quad p = ${formatNombreLatex(exercice.ordonneeOrigine!)}`;
}

/** Correction exportée, écran 2 — la chaîne de calcul complète, valeurs substituées ET simplifiées
 * (un correcteur doit voir chaque étape et chaque résultat). */
export function formatCorrectionCaracteristiquesLatex(exercice: ExerciceCaracteristiquesDroite): string {
  const { point: a, vecteur: v } = exercice;
  if (exercice.verticale) return `\\vec{u}${formatVecteurLatex(v)} \\Rightarrow ${conclusionVerticaleLatex(exercice)}`;
  const pente = exercice.pente!;
  const etapes = [`m = \\dfrac{${formatNombreLatex(v.y)}}{${formatNombreLatex(v.x)}} = ${formatNombreLatex(pente)}`];
  if (exercice.caracteristiqueDemandee === "angleOx") {
    const arctan = (Math.atan(pente) * 180) / Math.PI;
    etapes.push(
      arctan < 0
        ? `\\arctan(m) ${formatEgaliteAngleLatex(arctan)} < 0 \\Rightarrow \\alpha = \\arctan(m) + 180^\\circ ${formatEgaliteAngleLatex(exercice.angleDeg)}`
        : `\\alpha = \\arctan(m) ${formatEgaliteAngleLatex(exercice.angleDeg)}`,
    );
  } else if (exercice.caracteristiqueDemandee === "angleOy") {
    etapes.push(`\\alpha = 90^\\circ - \\arctan(m) ${formatEgaliteAngleLatex(exercice.angleOyDeg)}`);
  }
  etapes.push(`p = ${formatNombreLatex(a.y)} - ${formatFacteurLatex(pente)}\\cdot ${formatFacteurLatex(a.x)} = ${formatNombreLatex(exercice.ordonneeOrigine!)}`);
  return etapes.join(", \\quad ");
}

/** Placeholders — toujours HORS de l'espace des tirages (jamais une réponse possible : dénominateurs
 * générés ≤ 4, angles arrondis jamais égaux à 40°), virgule décimale (audit chapitre 7, gen46
 * point 8). Point/vecteur : n'importe quel point/multiple est accepté, l'exemple montre seulement
 * qu'une fraction se tape. */
export const PLACEHOLDER_COORDONNEE = "ex : 7/2";
export const PLACEHOLDER_COMPOSANTE = "ex : -5";
export const PLACEHOLDER_PENTE = "ex : -7/5";
export const PLACEHOLDER_ANGLE = "ex : 40";
export const PLACEHOLDER_ORDONNEE = "ex : 11/7";
