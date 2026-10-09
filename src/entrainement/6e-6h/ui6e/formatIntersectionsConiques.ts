import type { ExerciceIntersectionsConiques, ExerciceIntersectionsConiquesA, ExerciceIntersectionsConiquesB, Frac } from "../core6e/intersectionsConiques.types";
import type { PhaseIntersectionsConiques, ResultatExerciceIntersectionsConiques } from "../moteur6e/typesIntersectionsConiques";
import { phasesPourExercice } from "../moteur6e/typesIntersectionsConiques";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen61`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatEquationConiqueCaracteristiques.ts` (6gen59) —
 * dispatcher générique piloté par `champs: ChampDef[]`, jamais de JSX par écran (CLAUDE.md).
 */

export type TypeChamp = "texte" | "choix" | "liste";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
  minuscule?: boolean;
  /** `type==="liste"` uniquement — add-as-needed 0..maxLignes lignes. */
  labelAjout?: string;
  labelAucune?: string;
  maxLignes?: number;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

function champTexte(label: string, placeholder: string, minuscule = false): ChampDef {
  return { type: "texte", label, placeholder, minuscule };
}

function champChoix(label: string, options: OptionChoix[]): ChampDef {
  return { type: "choix", label, options };
}

function champListe(label: string, labelAjout: string, labelAucune: string, maxLignes: number): ChampDef {
  return { type: "liste", label, labelAjout, labelAucune, maxLignes };
}

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function afficherFrac(f: Frac): string {
  if (f.d === 1) return `${f.n}`;
  return f.n < 0 ? `-\\frac{${-f.n}}{${f.d}}` : `\\frac{${f.n}}{${f.d}}`;
}

function afficherPoint(p: { x: Frac; y: Frac }): string {
  return `(${afficherFrac(p.x)};${afficherFrac(p.y)})`;
}

function termeSigne(coeff: number, expr: string, premier: boolean): string {
  if (coeff === 0) return "";
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const abs = Math.abs(coeff);
  const coeffTxt = abs === 1 ? "" : `${abs}`;
  return `${signe}${coeffTxt}${expr}`;
}

/** Formate une constante additive (jamais premier terme) : "" si nulle, "+3" ou "-2" sinon. */
function formatConstante(v: number): string {
  if (v === 0) return "";
  return v < 0 ? `${v}` : `+${v}`;
}

function afficherConiqueLatex(p: number, q: number, n: number): string {
  return `${termeSigne(p, "x^2", true)}${termeSigne(q, "y^2", false)}=${n}`;
}

function afficherDroiteLatex(m: Frac, c: Frac): string {
  const termeM = m.n === 0 ? "" : `${afficherFrac(m)}x`;
  let termeC = "";
  if (c.n !== 0) {
    const abs = c.d === 1 ? `${Math.abs(c.n)}` : `\\frac{${Math.abs(c.n)}}{${c.d}}`;
    termeC = termeM === "" ? (c.n < 0 ? `-${abs}` : abs) : `${c.n < 0 ? "-" : "+"}${abs}`;
  }
  const corps = termeM + termeC;
  return `y=${corps === "" ? "0" : corps}`;
}

// ============================================================================
// Famille A.
// ============================================================================

const LIBELLE_NATURE: Record<"ellipse" | "hyperbole" | "cercle", string> = { ellipse: "Ellipse", hyperbole: "Hyperbole", cercle: "Cercle" };

function coniqueLatexA(e: ExerciceIntersectionsConiquesA): string {
  return afficherConiqueLatex(e.conique.p, e.conique.q, e.conique.n);
}

function consigneSousType(sousType: ExerciceIntersectionsConiquesA["sousTypeDroite"]): string {
  if (sousType === "deuxPoints") return "établis l'équation de la droite passant par A et B";
  if (sousType === "mediatrice") return "établis l'équation de la médiatrice du segment [A;B]";
  return "établis l'équation de la hauteur du triangle ABC issue de C, perpendiculaire au côté [A;B]";
}

export function consigneGeneraleA(e: ExerciceIntersectionsConiquesA): string {
  return `On étudie l'intersection d'une droite et d'une conique (${LIBELLE_NATURE[e.natureConique]}). Détermine leurs équations, résous l'équation du second degré obtenue par substitution, puis donne les points d'intersection.`;
}

export function blocDonneesA(e: ExerciceIntersectionsConiquesA): string[] {
  const lignes: string[] = [];
  if (e.coniqueDirecte) {
    lignes.push(`\\text{Conique : }${coniqueLatexA(e)}`);
  } else {
    const car = e.caracteristiques!;
    lignes.push(`\\text{Sommet : }S(${car.sommetS.x};${car.sommetS.y})`);
    lignes.push(`\\text{Foyer : }F(${car.foyerF.x};${car.foyerF.y})`);
  }
  if (e.donneesLigne.sousType === "deuxPoints") {
    lignes.push(`A${afficherPoint(e.donneesLigne.A)}\\text{, }B${afficherPoint(e.donneesLigne.B)}`);
  } else if (e.donneesLigne.sousType === "mediatrice") {
    lignes.push(`A${afficherPoint(e.donneesLigne.A)}\\text{, }B${afficherPoint(e.donneesLigne.B)}`);
    lignes.push(`\\text{Droite = médiatrice de }[A;B]`);
  } else {
    lignes.push(`A${afficherPoint(e.donneesLigne.A)}\\text{, }B${afficherPoint(e.donneesLigne.B)}\\text{, }C${afficherPoint(e.donneesLigne.C)}`);
    lignes.push(`\\text{Droite = hauteur issue de }C`);
  }
  return lignes;
}

export function consigneEcranA(e: ExerciceIntersectionsConiquesA, phase: PhaseIntersectionsConiques): string {
  if (phase === "aEcran1") return "Établis l'équation de la conique depuis ses caractéristiques (sommet S, foyer F).";
  if (phase === "aEcran2") return `À partir des données ci-dessus, ${consigneSousType(e.sousTypeDroite)}.`;
  if (phase === "aEcran3") return "Substitue l'équation de la droite CONFIRMÉE dans celle de la conique CONFIRMÉE, développe, et résous l'équation du second degré obtenue en x. Donne le discriminant et le nombre de solutions (0, 1, ou 2).";
  return "À partir de la résolution CONFIRMÉE, donne les coordonnées du (ou des) point(s) d'intersection — aucune ligne si le discriminant est négatif.";
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug déjà corrigé sur `formatIdentificationConiques.ts`, 6gen58) : `aEcran3`/`aEcran4`
 * ne montraient QUE l'info de l'écran immédiatement précédent — `aEcran1` est SAUTÉ si
 * `coniqueDirecte` (voir `typesIntersectionsConiques.ts`), donc la ligne "conique confirmée" n'est
 * accumulée que dans le cas contraire. Plus ancien en premier. */
export function etatActuelA(e: ExerciceIntersectionsConiquesA, phase: PhaseIntersectionsConiques): string[] | null {
  const lignes: string[] = [];
  if (!e.coniqueDirecte && (phase === "aEcran2" || phase === "aEcran3" || phase === "aEcran4")) {
    lignes.push(`\\text{Conique confirmée (étape 1) : }${coniqueLatexA(e)}`);
  }
  if (phase === "aEcran3" || phase === "aEcran4") {
    lignes.push(`\\text{Droite confirmée : }${afficherDroiteLatex(e.droite.m, e.droite.c)}`);
  }
  // 2 fragments COURTS (jamais une seule longue phrase `\text{...}`) — un `\text{...}` KaTeX ne se
  // scinde jamais sur plusieurs lignes ; une phrase trop longue déborde silencieusement du cadre
  // mobile (375px), piège documenté CLAUDE.md/`docs/historique-6e.md` (déjà rencontré et évité pour
  // `blocDonneesC`/`blocDonneesD`, 6gen59 — trouvé ici par inspection visuelle d'une capture 375px).
  if (phase === "aEcran4") lignes.push(`\\Delta=${e.discriminant}\\text{ (confirmé)}`, `${e.nombreSolutions}\\text{ solution(s) (confirmé)}`);
  return lignes.length > 0 ? lignes : null;
}

export function champsEcranA(_e: ExerciceIntersectionsConiquesA, phase: PhaseIntersectionsConiques): ChampDef[] {
  if (phase === "aEcran1") return [champTexte("Équation de la conique =", "ex : x^2/25+y^2/16=1")];
  if (phase === "aEcran2") return [champTexte("Équation de la droite =", "ex : y=2x+1")];
  if (phase === "aEcran3") {
    return [
      champTexte("Discriminant =", "ex : 64", true),
      champChoix("Nombre de solutions =", [
        { valeur: "0", label: "0 (aucune)" },
        { valeur: "1", label: "1 (tangente)" },
        { valeur: "2", label: "2 (sécante)" },
      ]),
    ];
  }
  return [champListe("Points d'intersection", "+ Ajouter un point", "Pas de point d'intersection", 2)];
}

export function niveauAideMaxEcranA(e: ExerciceIntersectionsConiquesA, phase: PhaseIntersectionsConiques): number {
  return phase === "aEcran2" && e.sousTypeDroite !== "deuxPoints" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Rappel : la médiatrice d'un segment passe par son MILIEU, avec une pente PERPENDICULAIRE à celle du segment ; une hauteur d'un triangle passe par le SOMMET indiqué, avec une pente PERPENDICULAIRE au CÔTÉ OPPOSÉ (jamais un autre côté).", latex: null };
}

export function aideNiveau2A(e: ExerciceIntersectionsConiquesA): AideAvecLatex {
  if (e.donneesLigne.sousType === "mediatrice") {
    const milieu = { x: { n: e.donneesLigne.A.x.n * e.donneesLigne.B.x.d + e.donneesLigne.B.x.n * e.donneesLigne.A.x.d, d: 2 * e.donneesLigne.A.x.d * e.donneesLigne.B.x.d }, y: { n: e.donneesLigne.A.y.n * e.donneesLigne.B.y.d + e.donneesLigne.B.y.n * e.donneesLigne.A.y.d, d: 2 * e.donneesLigne.A.y.d * e.donneesLigne.B.y.d } };
    return { texte: "Point de passage et pente calculés séparément (équation non assemblée) :", latex: `\\text{milieu de }[A;B]=${afficherPoint(milieu)}\\text{, pente}=${afficherFrac(e.droite.m)}` };
  }
  if (e.donneesLigne.sousType === "hauteur") {
    return { texte: "Point de passage et pente calculés séparément (équation non assemblée) :", latex: `C=${afficherPoint(e.donneesLigne.C)}\\text{, pente}=${afficherFrac(e.droite.m)}` };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B.
// ============================================================================

function c1Latex(e: ExerciceIntersectionsConiquesB): string {
  return `y=x^2${termeSigne(e.b1, "x", false)}${formatConstante(e.c1)}`;
}

function c2Latex(e: ExerciceIntersectionsConiquesB): string {
  return `${termeSigne(e.A2, "x^2", true)}${termeSigne(e.B2, "y^2", false)}${termeSigne(e.D2, "x", false)}${termeSigne(e.E2, "y", false)}${formatConstante(e.F2)}=0`;
}

export function consigneGeneraleB(): string {
  return "On donne 2 coniques C1 et C2. Montre que leurs points d'intersection se trouvent sur un CERCLE, sans jamais résoudre le système {C1,C2} directement — cherche une combinaison λC1+μC2=0 qui SOIT un cercle.";
}

export function blocDonneesB(e: ExerciceIntersectionsConiquesB): string[] {
  return [`C_1 : ${c1Latex(e)}`, `C_2 : ${c2Latex(e)}`];
}

export function consigneEcranB(_e: ExerciceIntersectionsConiquesB, phase: PhaseIntersectionsConiques): string {
  if (phase === "bEcran1") return "Forme la combinaison λC1+μC2=0. Pose les conditions sur λ,μ pour que les coefficients de x² et de y² soient ÉGAUX (aucun terme croisé xy n'apparaît jamais ici) — donne une paire (λ,μ) qui convient.";
  if (phase === "bEcran2") return "Avec le couple (λ,μ) CONFIRMÉ, substitue dans λC1+μC2 et donne l'équation BRUTE du cercle obtenu (pas encore sous forme standard).";
  return "Complète le carré sur x et sur y à partir de l'équation CONFIRMÉE de l'étape précédente, pour identifier le centre et le rayon du cercle.";
}

/** ACCUMULE les écrans déjà confirmés — même correctif que `etatActuelA` (voir sa doc-string). */
export function etatActuelB(e: ExerciceIntersectionsConiquesB, phase: PhaseIntersectionsConiques): string[] | null {
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3") {
    lignes.push(`\\text{Couple confirmé (étape 1) : }\\lambda=${e.lambda}\\text{, }\\mu=${e.mu}`);
  }
  if (phase === "bEcran3") {
    lignes.push(`\\text{Équation confirmée (étape 2) : }${termeSigne(e.K, "x^2", true)}${termeSigne(e.K, "y^2", false)}${termeSigne(e.coeffX, "x", false)}${termeSigne(e.coeffY, "y", false)}${formatConstante(e.constanteBrute)}=0`);
  }
  return lignes.length > 0 ? lignes : null;
}

export function champsEcranB(_e: ExerciceIntersectionsConiquesB, phase: PhaseIntersectionsConiques): ChampDef[] {
  if (phase === "bEcran1") return [champTexte("λ =", "ex : 2", true), champTexte("μ =", "ex : 1", true)];
  if (phase === "bEcran2") return [champTexte("Équation brute du cercle =", "ex : 5x^2+5y^2-20x+10y-20=0")];
  return [champTexte("Centre (abscisse) =", "ex : 2", true), champTexte("Centre (ordonnée) =", "ex : -1", true), champTexte("Rayon =", "ex : 3", true)];
}

export function niveauAideMaxEcranB(phase: PhaseIntersectionsConiques): number {
  return phase === "bEcran1" ? 2 : 0;
}

export function aideNiveau1B(): AideAvecLatex {
  return { texte: "Rappel : tout point qui vérifie à la fois C1=0 et C2=0 vérifie AUTOMATIQUEMENT n'importe quelle combinaison λC1+μC2=0 — cherche λ,μ pour que cette combinaison soit un cercle, plutôt que de résoudre le système {C1,C2} directement (un polynôme de degré 4, sans racine simple en général).", latex: null };
}

export function aideNiveau2B(e: ExerciceIntersectionsConiquesB): AideAvecLatex {
  const c1FormeImplicite = `x^2${termeSigne(e.b1, "x", false)}-y${formatConstante(e.c1)}`;
  return { texte: "Combinaison générale posée (λ,μ non déterminés, conditions d'égalité non traduites) :", latex: `\\lambda(${c1FormeImplicite})+\\mu(${c2Latex(e)})` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceIntersectionsConiques): string {
  return exercice.famille === "A" ? consigneGeneraleA(exercice) : consigneGeneraleB();
}

export function blocDonnees(exercice: ExerciceIntersectionsConiques): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): string {
  return exercice.famille === "A" ? consigneEcranA(exercice, phase) : consigneEcranB(exercice, phase);
}

export function etatActuel(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

export function champsEcran(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): ChampDef[] {
  return exercice.famille === "A" ? champsEcranA(exercice, phase) : champsEcranB(exercice, phase);
}

export function niveauAideMaxEcran(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): number {
  return exercice.famille === "A" ? niveauAideMaxEcranA(exercice, phase) : niveauAideMaxEcranB(phase);
}

export function aideNiveau1(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  return exercice.famille === "A" ? aideNiveau1A() : aideNiveau1B();
}

export function aideNiveau2(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  return exercice.famille === "A" ? aideNiveau2A(exercice) : aideNiveau2B(exercice);
}

export const LIBELLE_PHASE: Record<PhaseIntersectionsConiques, string> = {
  aEcran1: "Étape 1 (équation de la conique)",
  aEcran2: "Étape 2 (équation de la droite)",
  aEcran3: "Étape 3 (discriminant et nombre de solutions)",
  aEcran4: "Étape 4 (points d'intersection)",
  bEcran1: "Étape 1 (couple λ,μ)",
  bEcran2: "Étape 2 (équation brute du cercle)",
  bEcran3: "Étape 3 (centre et rayon)",
};

export const LIBELLE_FAMILLE: Record<ExerciceIntersectionsConiques["famille"], string> = {
  A: "A — Intersection droite-conique",
  B: "B — Intersection de 2 coniques (combinaison linéaire)",
};

export function formatReponseAttenduePhaseLatex(exercice: ExerciceIntersectionsConiques, phase: PhaseIntersectionsConiques): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [coniqueLatexA(exercice)];
    if (phase === "aEcran2") return [afficherDroiteLatex(exercice.droite.m, exercice.droite.c)];
    if (phase === "aEcran3") return [`\\Delta=${exercice.discriminant}\\text{, }${exercice.nombreSolutions}\\text{ solution(s)}`];
    if (exercice.points.length === 0) return ["\\text{Aucun point d'intersection}"];
    return exercice.points.map((p) => afficherPoint(p));
  }
  if (phase === "bEcran1") return [`\\lambda=${exercice.lambda}\\text{, }\\mu=${exercice.mu}`];
  if (phase === "bEcran2") return [`${termeSigne(exercice.K, "x^2", true)}${termeSigne(exercice.K, "y^2", false)}${termeSigne(exercice.coeffX, "x", false)}${termeSigne(exercice.coeffY, "y", false)}${formatConstante(exercice.constanteBrute)}=0`];
  return [`\\text{Centre : }(${exercice.centre.x};${exercice.centre.y})\\text{, rayon}=${exercice.rayon}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice, famille A avec conique directe en ayant 1 de moins). */
export function calculerTotalPointsIntersectionsConiques(resultat: ResultatExerciceIntersectionsConiques): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
