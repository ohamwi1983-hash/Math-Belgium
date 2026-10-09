import type { DonneesTriangleInscrit, DroiteAffine, ExerciceCercles, Point } from "../core6e/cercles.types";
import type { PhaseCercles, ResultatExerciceCercles } from "../moteur6e/typesCercles";
import { phasesPourExercice } from "../moteur6e/typesCercles";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen55`. Dispatch sur
 * `exercice.famille` PUIS `phase` (pas de sous-type ici, contrairement à `6gen43`) — mirroir
 * `formatDenombrementFondamental.ts`, jamais importé par un autre générateur.
 *
 * **Aucun écran de choix** dans ce générateur (contrairement à `6gen43`, familles C/E) — tous les
 * écrans sont des champs texte libre (équation, coordonnée, valeur numérique, ou réponse littérale
 * "r") : `ChampDef` n'a donc PAS de variante `"choix"` ici, volontairement plus simple que le
 * patron `denombrementFondamental` (documenté dans `docs/historique-6e.md`).
 *
 * **PIÈGE TRANSVERSAL explicitement demandé par la mission (familles B et C)** : les 2 familles
 * partagent la MÊME première étape (médiatrice de [AB]) mais divergent ensuite — leurs textes
 * d'aide, ci-dessous, ne mentionnent JAMAIS l'autre famille ni sa méthode (jamais "contrairement à
 * la famille B/C", jamais "on ne procède pas comme pour un rayon donné/une droite donnée") : chaque
 * aide reste formulée de façon 100% autonome, uniquement en termes de la propriété géométrique de
 * la médiatrice elle-même (équidistance à A et B). Vérifié une dernière fois dans
 * `formatCercles.test.ts` (recherche textuelle explicite des mots "famille"/"écran C"/"famille B"
 * dans les 2 textes concernés).
 */

// ============================================================================
// Formatage numérique/géométrique partagé.
// ============================================================================

const TOLERANCE_ENTIER = 1e-6;
const TOLERANCE_FRACTION = 1e-7;
const DENOMINATEUR_MAX = 12;

function estEntierProche(v: number): boolean {
  return Math.abs(v - Math.round(v)) < TOLERANCE_ENTIER;
}

function meilleureFraction(valeur: number): { p: number; q: number } | null {
  for (let q = 1; q <= DENOMINATEUR_MAX; q++) {
    const p = Math.round(valeur * q);
    if (Math.abs(valeur - p / q) < TOLERANCE_FRACTION) return { p, q };
  }
  return null;
}

/** Fraction irréductible, jamais de décimal, pour toute valeur RATIONNELLE affichée par la
 * plateforme (CLAUDE.md) — bascule sur `\sqrt{n}` pour une valeur irrationnelle "ronde" (ex. un
 * rayon √50), puis sur un arrondi à 2 décimales en dernier recours (valeur non ronde du tout, ne
 * devrait normalement pas se produire pour les quantités de ce générateur). */
export function formatValeurAffichage(valeur: number): string {
  if (estEntierProche(valeur)) return String(Math.round(valeur));
  const frac = meilleureFraction(valeur);
  if (frac) {
    const signe = frac.p < 0 ? "-" : "";
    return `${signe}\\frac{${Math.abs(frac.p)}}{${frac.q}}`;
  }
  if (valeur > 0) {
    const carre = valeur * valeur;
    if (estEntierProche(carre)) return `\\sqrt{${Math.round(carre)}}`;
  }
  return valeur.toFixed(2);
}

export function formatPoint(P: Point): string {
  return `(${formatValeurAffichage(P.x)};${formatValeurAffichage(P.y)})`;
}

function labelPoint(nom: string, P: Point): string {
  return `\\text{${nom}}${formatPoint(P)}`;
}

function coeffFois(valeur: number, variable: string): string {
  if (valeur === 0) return "";
  const abs = Math.abs(valeur);
  const corps = abs === 1 ? variable : `${formatValeurAffichage(abs)}${variable}`;
  return valeur < 0 ? `-${corps}` : `+${corps}`;
}

function constanteSignee(valeur: number): string {
  if (valeur === 0) return "";
  return valeur < 0 ? `-${formatValeurAffichage(Math.abs(valeur))}` : `+${formatValeurAffichage(valeur)}`;
}

/** `a - b`, jamais un signe orphelin `--` quand `b` est négatif (ex. `2-(-1)`, jamais `2--1`) —
 * piège de régression documenté par CLAUDE.md. */
function formatMoins(aTexte: string, bValeur: number): string {
  const bTexte = formatValeurAffichage(bValeur);
  return bValeur < 0 ? `${aTexte}-(${bTexte})` : `${aTexte}-${bTexte}`;
}

function joindreTermes(termes: string[]): string {
  const filtres = termes.filter((t) => t !== "");
  if (filtres.length === 0) return "0";
  const [premier, ...reste] = filtres;
  const premierNettoye = premier.startsWith("+") ? premier.slice(1) : premier;
  return premierNettoye + reste.join("");
}

/** Droite `y=mx+p` — forme d'affichage uniquement (jamais utilisée pour la vérification, qui
 * compare toujours des valeurs numériques réelles). */
export function formatDroiteLatex(d: DroiteAffine): string {
  return `y=${joindreTermes([coeffFois(d.m, "x"), constanteSignee(d.p)])}`;
}

/** Équation "Px·D+Py·E+F+(Px²+Py²)=0" — famille A, obtenue en substituant le point P dans la forme
 * générale x²+y²+Dx+Ey+F=0 (D,E,F restent SYMBOLIQUES ici, seul P est numérique). */
export function formatEquationCerclePourPoint(P: Point): string {
  const gauche = joindreTermes([coeffFois(P.x, "D"), coeffFois(P.y, "E"), coeffFois(1, "F"), constanteSignee(P.x * P.x + P.y * P.y)]);
  return `${gauche}=0`;
}

// ============================================================================
// Champs de saisie — pas de variante "choix" dans ce générateur (voir en-tête de fichier).
// ============================================================================

export interface ChampDef {
  label: string;
  placeholder: string;
}

function champ(label: string, placeholder: string): ChampDef {
  return { label, placeholder };
}

// ============================================================================
// Famille A — Cercle par 3 points.
// ============================================================================

function consigneGeneraleA(): string {
  return "On cherche l'équation d'un cercle passant par 3 points A, B et C non alignés, sous la forme générale x²+y²+Dx+Ey+F=0, puis son centre et son rayon.";
}
function blocDonneesA(e: Extract<ExerciceCercles, { famille: "A" }>): string[] {
  return [labelPoint("A", e.A), labelPoint("B", e.B), labelPoint("C", e.C)];
}
function consigneEcranA(phase: PhaseCercles): string {
  if (phase === "aEcran1") return "Substitue A, B puis C dans x²+y²+Dx+Ey+F=0 : écris les 3 équations en D, E, F ainsi obtenues (une par point).";
  if (phase === "aEcran2") return "Résous ce système de 3 équations à 3 inconnues (D, E, F).";
  return "À partir de D, E, F CONFIRMÉS, donne les coordonnées du centre (−D/2;−E/2) et le rayon √(D²/4+E²/4−F).";
}
// Accumulation (correctif transversal — le bloc "état actuel" doit lister TOUTES les réponses
// validées des écrans précédents, du plus ancien au plus récent, jamais seulement celle de l'écran
// immédiatement précédent, voir CLAUDE.md/`docs/historique-6e.md`) : `aEcran3` ne montrait
// auparavant QUE D, E, F confirmés à `aEcran2`, sans le système en D, E, F confirmé à `aEcran1`.
function etatActuelA(e: Extract<ExerciceCercles, { famille: "A" }>, phase: PhaseCercles): string[] | null {
  if (phase === "aEcran3") {
    const systeme = `\\text{Système confirmé : }${formatEquationCerclePourPoint(e.A)}\\text{, }${formatEquationCerclePourPoint(e.B)}\\text{, }${formatEquationCerclePourPoint(e.C)}`;
    const def = `D=${formatValeurAffichage(e.D)},\\;E=${formatValeurAffichage(e.E)},\\;F=${formatValeurAffichage(e.F)}\\text{ (confirmés)}`;
    return [systeme, def];
  }
  return null;
}
function champsA(phase: PhaseCercles): ChampDef[] {
  if (phase === "aEcran1") return [champ("Équation pour A =", "ex : 2D+3E+F+13=0"), champ("Équation pour B =", "ex : -D+4E+F+17=0"), champ("Équation pour C =", "ex : D-2E+F+5=0")];
  if (phase === "aEcran2") return [champ("D =", "ex : -4"), champ("E =", "ex : 2"), champ("F =", "ex : -20")];
  return [champ("Abscisse du centre =", "ex : 2"), champ("Ordonnée du centre =", "ex : -1"), champ("Rayon =", "ex : 5")];
}
function niveauAideMaxA(phase: PhaseCercles): number {
  return phase === "aEcran1" ? 2 : 0;
}
function aideNiveau1A(): AideAvecLatex {
  return { texte: "Remplace, dans x²+y²+Dx+Ey+F=0, x et y par les coordonnées de chaque point tour à tour : tu obtiens une équation en D, E, F par point.", latex: "x^2+y^2+Dx+Ey+F=0" };
}
function aideNiveau2A(e: Extract<ExerciceCercles, { famille: "A" }>): AideAvecLatex {
  return { texte: "Équation obtenue pour le point A (les 2 autres équations, pour B et C, restent à poser) :", latex: formatEquationCerclePourPoint(e.A) };
}

// ============================================================================
// Familles B et C — médiatrice partagée. AIDES ÉCRITES INDÉPENDAMMENT (voir en-tête de fichier —
// piège transversal explicitement demandé par la mission).
// ============================================================================

function blocDonneesAB(A: Point, B: Point): string[] {
  return [labelPoint("A", A), labelPoint("B", B)];
}

// ============================================================================
// Famille B — Cercle par 2 points, rayon donné.
// ============================================================================

function consigneGeneraleB(): string {
  return "On cherche les cercles de rayon r donné passant par 2 points A et B distincts.";
}
function blocDonneesB(e: Extract<ExerciceCercles, { famille: "B" }>): string[] {
  return [...blocDonneesAB(e.A, e.B), `r=${formatValeurAffichage(e.r)}`];
}
function consigneEcranB(phase: PhaseCercles): string {
  if (phase === "bEcran1") return "Le centre d'un cercle passant par A et B est nécessairement équidistant des deux points. Écris l'équation de la médiatrice de [AB], le lieu de tous les points équidistants de A et B.";
  if (phase === "bEcran2") return "Le centre appartient à la médiatrice CONFIRMÉE : en le paramétrant par son abscisse x, écris l'équation traduisant distance(centre,A)=r.";
  return "Résous l'équation CONFIRMÉE : elle admet en général 2 solutions pour x, donc 2 centres possibles. Donne les 2 centres (ajoute une ligne par centre trouvé) ainsi que le rayon commun.";
}
// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : `bEcran3` ne montrait
// auparavant QUE l'équation en x confirmée à `bEcran2`, sans la médiatrice confirmée à `bEcran1`.
function etatActuelB(e: Extract<ExerciceCercles, { famille: "B" }>, phase: PhaseCercles): string[] | null {
  const mediatriceConfirmee = `${formatDroiteLatex(e.mediatrice)}\\text{ (médiatrice confirmée)}`;
  if (phase === "bEcran2") return [mediatriceConfirmee];
  if (phase === "bEcran3") {
    const { m, p } = e.mediatrice;
    const a = 1 + m * m;
    const b = -2 * e.A.x + 2 * m * (p - e.A.y);
    const c = e.A.x * e.A.x + (p - e.A.y) * (p - e.A.y) - e.r * e.r;
    const equation = joindreTermes([coeffFois(a, "x^2"), coeffFois(b, "x"), constanteSignee(c)]);
    return [mediatriceConfirmee, `${equation}=0\\text{ (confirmée)}`];
  }
  return null;
}
function champsB(): ChampDef[] {
  return [champ("Équation de la médiatrice de [AB] =", "ex : y=-2x+5")];
}
function champsB2(): ChampDef[] {
  return [champ("Équation en x =", "ex : 5x^2-20x+9=0")];
}
function niveauAideMaxB(phase: PhaseCercles): number {
  return phase === "bEcran1" ? 2 : 0;
}
function aideNiveau1B(): AideAvecLatex {
  return { texte: "Le centre d'un cercle passant par 2 points est équidistant de ces 2 points — il appartient donc à leur médiatrice.", latex: null };
}
function aideNiveau2B(e: Extract<ExerciceCercles, { famille: "B" }>): AideAvecLatex {
  const M = { x: (e.A.x + e.B.x) / 2, y: (e.A.y + e.B.y) / 2 };
  const penteAB = (e.B.y - e.A.y) / (e.B.x - e.A.x);
  return { texte: "Milieu de [AB] et pente de (AB) (l'équation de la médiatrice n'est pas encore assemblée) :", latex: `M=${formatPoint(M)},\\;\\text{pente}(AB)=${formatValeurAffichage(penteAB)}` };
}

// ============================================================================
// Famille C — Cercle par 2 points, centre sur une droite donnée.
// ============================================================================

function consigneGeneraleC(): string {
  return "On cherche le cercle passant par 2 points A et B, dont le centre appartient de plus à une droite d donnée.";
}
function blocDonneesC(e: Extract<ExerciceCercles, { famille: "C" }>): string[] {
  return [...blocDonneesAB(e.A, e.B), `d:\\;${formatDroiteLatex(e.d)}`];
}
function consigneEcranC(phase: PhaseCercles): string {
  if (phase === "cEcran1") return "Le centre d'un cercle passant par A et B est nécessairement équidistant des deux points. Écris l'équation de la médiatrice de [AB], le lieu de tous les points équidistants de A et B.";
  if (phase === "cEcran2") return "Le centre doit appartenir À LA FOIS à la médiatrice CONFIRMÉE et à la droite d donnée. Résous le système formé par ces 2 équations pour trouver ses coordonnées.";
  return "Calcule le rayon, distance du centre CONFIRMÉ au point A.";
}
// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : `cEcran3` ne montrait
// auparavant QUE le centre confirmé à `cEcran2`, sans la médiatrice confirmée à `cEcran1`.
function etatActuelC(e: Extract<ExerciceCercles, { famille: "C" }>, phase: PhaseCercles): string[] | null {
  const mediatriceConfirmee = `${formatDroiteLatex(e.mediatrice)}\\text{ (médiatrice confirmée)}`;
  if (phase === "cEcran2") return [mediatriceConfirmee];
  if (phase === "cEcran3") return [mediatriceConfirmee, `\\text{Centre}${formatPoint(e.centre)}\\text{ (confirmé)}`];
  return null;
}
function champsC1(): ChampDef[] {
  return [champ("Équation de la médiatrice de [AB] =", "ex : y=-2x+5")];
}
function champsC2(): ChampDef[] {
  return [champ("Abscisse du centre =", "ex : 3"), champ("Ordonnée du centre =", "ex : -1")];
}
function champsC3(): ChampDef[] {
  return [champ("Rayon =", "ex : 5")];
}
function niveauAideMaxC(phase: PhaseCercles): number {
  return phase === "cEcran2" ? 2 : 0;
}
function aideNiveau1C(): AideAvecLatex {
  return { texte: "Le centre doit satisfaire simultanément 2 conditions : être sur la médiatrice ET sur d. Pose le système formé par les 2 équations, puis résous-le (par substitution ou combinaison).", latex: null };
}
function aideNiveau2C(e: Extract<ExerciceCercles, { famille: "C" }>): AideAvecLatex {
  return { texte: "Les 2 équations à résoudre simultanément (la résolution reste à faire) :", latex: `\\begin{cases}${formatDroiteLatex(e.mediatrice)}\\\\${formatDroiteLatex(e.d)}\\end{cases}` };
}

// ============================================================================
// Famille D — Cercle tangent à un axe en un point donné.
// ============================================================================

function consigneGeneraleD(): string {
  return "On cherche le cercle passant par un point A, tangent à l'axe des abscisses au point B donné sur cet axe.";
}
function blocDonneesD(e: Extract<ExerciceCercles, { famille: "D" }>): string[] {
  return [labelPoint("A", e.A), `\\text{B}(${formatValeurAffichage(e.Bx)};0)\\text{ (point de tangence)}`];
}
function consigneEcranD(phase: PhaseCercles): string {
  if (phase === "dEcran1") return "Le centre est sur la perpendiculaire à l'axe des abscisses passant par B (la droite verticale x=Bx), à une distance r (le rayon) du point de tangence. Pose le centre sous la forme (Bx;r).";
  if (phase === "dEcran2") return "En partant du centre (Bx;r) CONFIRMÉ, écris l'équation traduisant distance(centre,A)=r.";
  return "Développe l'équation CONFIRMÉE : le terme r² s'annule des deux côtés, l'équation résultante est LINÉAIRE en r — résous-la, puis donne le centre et l'équation complète du cercle.";
}
// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : `dEcran3` ne montrait
// auparavant QUE l'équation confirmée à `dEcran2`, sans le centre (Bx;r) confirmé à `dEcran1`.
function etatActuelD(e: Extract<ExerciceCercles, { famille: "D" }>, phase: PhaseCercles): string[] | null {
  const centreConfirme = `\\text{Centre}(${formatValeurAffichage(e.Bx)};r)\\text{ (confirmé)}`;
  if (phase === "dEcran2") return [centreConfirme];
  if (phase === "dEcran3") return [centreConfirme, `(${formatMoins(formatValeurAffichage(e.Bx), e.A.x)})^2+(${formatMoins("r", e.A.y)})^2=r^2\\text{ (confirmée)}`];
  return null;
}
function champsD1(): ChampDef[] {
  // Libellé volontairement COURT ("Ordonnée (=r) =", jamais "... en fonction de r ...") — bug
  // rencontré : un libellé long combiné à `.field-inline` (`white-space:nowrap` sur le label,
  // `App.css`) déborde à 375px (mobile), détecté par `document.body.scrollWidth > innerWidth`
  // (vérification Playwright). La consigne de l'écran explique déjà "(Bx;r)" en toutes lettres —
  // le libellé du champ n'a pas besoin de le répéter en entier.
  return [champ("Abscisse du centre =", "ex : 3"), champ("Ordonnée (=r) =", "ex : r")];
}
function champsD2(): ChampDef[] {
  return [champ("Équation en r =", "ex : -8r+20=0")];
}
function champsD3(): ChampDef[] {
  return [champ("r =", "ex : 2.5"), champ("Abscisse du centre =", "ex : 3"), champ("Ordonnée du centre =", "ex : 2.5"), champ("Équation du cercle =", "ex : (x-3)^2+(y-2.5)^2=6.25")];
}
function niveauAideMaxD(phase: PhaseCercles): number {
  return phase === "dEcran3" ? 2 : 0;
}
function aideNiveau1D(): AideAvecLatex {
  return { texte: "En développant l'équation confirmée, un terme r² apparaît des deux côtés du signe = : il s'annule. L'équation qui reste est LINÉAIRE en r, pas quadratique — pas besoin de formule du second degré.", latex: null };
}
function aideNiveau2D(e: Extract<ExerciceCercles, { famille: "D" }>): AideAvecLatex {
  return { texte: "Développement effectué (la simplification finale, où r² disparaît des 2 côtés, reste à faire) :", latex: `(${formatMoins(formatValeurAffichage(e.Bx), e.A.x)})^2+r^2-${formatValeurAffichage(2 * e.A.y)}r+${formatValeurAffichage(e.A.y * e.A.y)}=r^2` };
}

// ============================================================================
// Famille E — Cercle inscrit à un triangle. RÉUTILISÉE par la famille G (voir plus bas).
// ============================================================================

function consigneGeneraleE(): string {
  return "On cherche le cercle inscrit à un triangle ABC (tangent intérieurement aux 3 côtés).";
}
function blocDonneesTriangle(t: DonneesTriangleInscrit): string[] {
  return [labelPoint("A", t.A), labelPoint("B", t.B), labelPoint("C", t.C)];
}
function consigneEcranTriangle(phase: "cotes" | "incentre" | "rayon"): string {
  if (phase === "cotes") return "Calcule les longueurs des 3 côtés a=BC, b=CA et c=AB.";
  if (phase === "incentre") return "Le centre I du cercle inscrit est la moyenne des sommets pondérée par le côté OPPOSÉ à chacun : I=(a·A+b·B+c·C)/(a+b+c). Calcule ses coordonnées à partir de a, b, c CONFIRMÉS.";
  return "Calcule le rayon du cercle inscrit (distance de I CONFIRMÉ à l'un des côtés, ou via aire/demi-périmètre).";
}
// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : l'écran "rayon" ne montrait
// auparavant QUE I confirmé à l'écran "incentre", sans a, b, c confirmés à l'écran "cotes" — ajouté
// via le paramètre optionnel `prefixe`, qui permet en plus à la famille G (`etatActuelG` ci-dessous)
// de reprendre les 3 sommets confirmés à `gEcran1`, en amont même des côtés.
function etatActuelTriangle(t: DonneesTriangleInscrit, phase: "incentre" | "rayon", prefixe: string[] = []): string[] {
  const cotesConfirmes = `a=${formatValeurAffichage(t.a)},\\;b=${formatValeurAffichage(t.b)},\\;c=${formatValeurAffichage(t.c)}\\text{ (confirmés)}`;
  if (phase === "incentre") return [...prefixe, cotesConfirmes];
  const incentreConfirme = `\\text{I}${formatPoint({ x: t.incentreX, y: t.incentreY })}\\text{ (confirmé)}`;
  return [...prefixe, cotesConfirmes, incentreConfirme];
}
function champsCotes(): ChampDef[] {
  return [champ("a = BC =", "ex : 10"), champ("b = CA =", "ex : 8"), champ("c = AB =", "ex : 6")];
}
function champsIncentre(): ChampDef[] {
  return [champ("Abscisse de I =", "ex : 2"), champ("Ordonnée de I =", "ex : 2")];
}
function champsRayonTriangle(): ChampDef[] {
  return [champ("Rayon =", "ex : 2")];
}
function aideNiveau1Incentre(): AideAvecLatex {
  return { texte: "Chaque sommet est pondéré par la longueur du côté OPPOSÉ (pas le côté adjacent !) : a (côté BC) pour le sommet A, b (côté CA) pour B, c (côté AB) pour C.", latex: null };
}
function aideNiveau2Incentre(): AideAvecLatex {
  return { texte: "Pondérations à utiliser (la combinaison finale reste à faire) :", latex: "a\\leftrightarrow A,\\;b\\leftrightarrow B,\\;c\\leftrightarrow C" };
}

// ============================================================================
// Famille F — Cercle avec corde de longueur donnée.
// ============================================================================

function consigneGeneraleF(): string {
  return "On connaît le centre C d'un cercle et une droite d qui le coupe selon une corde de longueur L donnée — on cherche le rayon puis l'équation du cercle.";
}
function blocDonneesF(e: Extract<ExerciceCercles, { famille: "F" }>): string[] {
  return [labelPoint("C", e.centre), `d:\\;${formatDroiteLatex(e.d)}`, `L=${formatValeurAffichage(e.L)}`];
}
function consigneEcranF(phase: PhaseCercles): string {
  if (phase === "fEcran1") return "Calcule la distance du centre C à la droite d.";
  if (phase === "fEcran2") return "Le rayon, la distance CONFIRMÉE et la demi-longueur de la corde forment un triangle rectangle : applique la relation de Pythagore r²=distance²+(L/2)². Donne r² puis r.";
  return "Donne le rayon (déjà trouvé) et l'équation complète du cercle, à partir du rayon CONFIRMÉ.";
}
// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : `fEcran3` ne montrait
// auparavant QUE r² et r confirmés à `fEcran2`, sans la distance confirmée à `fEcran1`.
function etatActuelF(e: Extract<ExerciceCercles, { famille: "F" }>, phase: PhaseCercles): string[] | null {
  const distanceConfirmee = `\\text{distance}=${formatValeurAffichage(e.distanceCentreDroite)}\\text{ (confirmée)}`;
  if (phase === "fEcran2") return [distanceConfirmee];
  if (phase === "fEcran3") return [distanceConfirmee, `r^2=${formatValeurAffichage(e.rCarre)},\\;r=${formatValeurAffichage(e.rayon)}\\text{ (confirmés)}`];
  return null;
}
function champsF1(): ChampDef[] {
  return [champ("Distance du centre à d =", "ex : 5")];
}
function champsF2(): ChampDef[] {
  return [champ("r² =", "ex : 34"), champ("r =", "ex : sqrt(34)")];
}
function champsF3(): ChampDef[] {
  return [champ("Rayon =", "ex : sqrt(34)"), champ("Équation du cercle =", "ex : x^2+y^2=34")];
}
function niveauAideMaxF(phase: PhaseCercles): number {
  return phase === "fEcran2" ? 2 : 0;
}
function aideNiveau1F(): AideAvecLatex {
  return { texte: "Le rayon, la distance du centre à la corde, et la demi-longueur de la corde forment un triangle rectangle (le rayon est l'hypoténuse).", latex: null };
}
function aideNiveau2F(e: Extract<ExerciceCercles, { famille: "F" }>): AideAvecLatex {
  return { texte: "Relation posée avec les valeurs déjà connues (le calcul final de r² reste à faire) :", latex: `r^2=${formatValeurAffichage(e.distanceCentreDroite)}^2+${formatValeurAffichage(e.L / 2)}^2` };
}

// ============================================================================
// Famille G — Cercles tangents à 3 droites. RÉUTILISE la famille E (écrans 2-4).
// ============================================================================

function consigneGeneraleG(): string {
  return "3 droites d1, d2 et d3, sécantes deux à deux et non concourantes, forment un triangle. On cherche le cercle tangent aux 3 droites — le cercle INSCRIT à ce triangle.";
}
function blocDonneesG(e: Extract<ExerciceCercles, { famille: "G" }>): string[] {
  return [`d_1:\\;${formatDroiteLatex(e.d1)}`, `d_2:\\;${formatDroiteLatex(e.d2)}`, `d_3:\\;${formatDroiteLatex(e.d3)}`];
}
function consigneEcranG1(): string {
  return "Chaque sommet du triangle formé est l'intersection de 2 des 3 droites, prises deux à deux. Trouve les 3 sommets : d1∩d2, d2∩d3 et d3∩d1.";
}
function champsG1(): ChampDef[] {
  return [
    champ("Abscisse de d1∩d2 =", "ex : 0"),
    champ("Ordonnée de d1∩d2 =", "ex : 0"),
    champ("Abscisse de d2∩d3 =", "ex : 4"),
    champ("Ordonnée de d2∩d3 =", "ex : 4"),
    champ("Abscisse de d3∩d1 =", "ex : 8"),
    champ("Ordonnée de d3∩d1 =", "ex : 0"),
  ];
}
function aideNiveau1G(): AideAvecLatex {
  return { texte: "Chaque sommet du triangle est l'intersection de 2 des 3 droites, prises deux à deux — résous le système formé par leurs 2 équations.", latex: null };
}
function aideNiveau2G(e: Extract<ExerciceCercles, { famille: "G" }>): AideAvecLatex {
  return { texte: "Un des 3 sommets déjà trouvé (les 2 autres restent à déterminer) :", latex: `d_1\\cap d_2=${formatPoint(e.sommet12)}` };
}
function fmtSommetsConfirmesG(e: Extract<ExerciceCercles, { famille: "G" }>): string {
  return `d_1\\cap d_2=${formatPoint(e.sommet12)},\\;d_2\\cap d_3=${formatPoint(e.sommet23)},\\;d_3\\cap d_1=${formatPoint(e.sommet31)}\\text{ (confirmés)}`;
}

// Accumulation (correctif transversal, voir `etatActuelA` ci-dessus) : `gEcran3` ne montrait
// auparavant QUE a, b, c confirmés à `gEcran2` (via `etatActuelTriangle`), sans les 3 sommets
// confirmés à `gEcran1` ; `gEcran4` ne montrait QUE I confirmé à `gEcran3`, sans les sommets
// (`gEcran1`) NI a, b, c (`gEcran2`) — les 2 corrigés en passant les sommets en `prefixe` à
// `etatActuelTriangle`, qui accumule déjà a, b, c puis I en interne (voir ci-dessus).
function etatActuelG(e: Extract<ExerciceCercles, { famille: "G" }>, phase: PhaseCercles): string[] | null {
  if (phase === "gEcran2") return [fmtSommetsConfirmesG(e)];
  if (phase === "gEcran3") return etatActuelTriangle(e.triangle, "incentre", [fmtSommetsConfirmesG(e)]);
  if (phase === "gEcran4") return etatActuelTriangle(e.triangle, "rayon", [fmtSommetsConfirmesG(e)]);
  return null;
}

// ============================================================================
// Aide — type partagé.
// ============================================================================

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}
const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceCercles): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
    case "D":
      return consigneGeneraleD();
    case "E":
      return consigneGeneraleE();
    case "F":
      return consigneGeneraleF();
    case "G":
      return consigneGeneraleG();
  }
}

export function blocDonnees(exercice: ExerciceCercles): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesTriangle(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

export function consigneEcran(exercice: ExerciceCercles, phase: PhaseCercles): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
    case "D":
      return consigneEcranD(phase);
    case "E":
      if (phase === "eEcran1") return consigneEcranTriangle("cotes");
      if (phase === "eEcran2") return consigneEcranTriangle("incentre");
      return consigneEcranTriangle("rayon");
    case "F":
      return consigneEcranF(phase);
    case "G":
      if (phase === "gEcran1") return consigneEcranG1();
      if (phase === "gEcran2") return consigneEcranTriangle("cotes");
      if (phase === "gEcran3") return consigneEcranTriangle("incentre");
      return consigneEcranTriangle("rayon");
  }
}

export function etatActuel(exercice: ExerciceCercles, phase: PhaseCercles): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      if (phase === "eEcran2") return etatActuelTriangle(exercice, "incentre");
      if (phase === "eEcran3") return etatActuelTriangle(exercice, "rayon");
      return null;
    case "F":
      return etatActuelF(exercice, phase);
    case "G":
      return etatActuelG(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceCercles, phase: PhaseCercles): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return phase === "bEcran1" ? champsB() : champsB2();
    case "C":
      if (phase === "cEcran1") return champsC1();
      if (phase === "cEcran2") return champsC2();
      return champsC3();
    case "D":
      if (phase === "dEcran1") return champsD1();
      if (phase === "dEcran2") return champsD2();
      return champsD3();
    case "E":
      if (phase === "eEcran1") return champsCotes();
      if (phase === "eEcran2") return champsIncentre();
      return champsRayonTriangle();
    case "F":
      if (phase === "fEcran1") return champsF1();
      if (phase === "fEcran2") return champsF2();
      return champsF3();
    case "G":
      if (phase === "gEcran1") return champsG1();
      if (phase === "gEcran2") return champsCotes();
      if (phase === "gEcran3") return champsIncentre();
      return champsRayonTriangle();
  }
}

export function niveauAideMaxEcran(exercice: ExerciceCercles, phase: PhaseCercles): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD(phase);
    case "E":
      return phase === "eEcran2" ? 2 : 0;
    case "F":
      return niveauAideMaxF(phase);
    case "G":
      return phase === "gEcran1" ? 2 : 0;
  }
}

export function aideNiveau1(exercice: ExerciceCercles, phase: PhaseCercles): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C();
    case "D":
      return aideNiveau1D();
    case "E":
      return aideNiveau1Incentre();
    case "F":
      return aideNiveau1F();
    case "G":
      return aideNiveau1G();
  }
}

export function aideNiveau2(exercice: ExerciceCercles, phase: PhaseCercles): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B(exercice);
    case "C":
      return aideNiveau2C(exercice);
    case "D":
      return aideNiveau2D(exercice);
    case "E":
      return aideNiveau2Incentre();
    case "F":
      return aideNiveau2F(exercice);
    case "G":
      return aideNiveau2G(exercice);
  }
}

// ============================================================================
// Famille B écran 3 — labels du composant dédié "add-as-needed" (2 centres).
// ============================================================================

export function labelListeCentresB(): string {
  return "Centres possibles (ajoute une ligne par centre trouvé) :";
}
export function labelAjoutCentreB(): string {
  return "+ Ajouter un centre";
}
export function placeholderCentreB(): string {
  return "ex : (1;3)";
}
export function labelRayonB(): string {
  return "Rayon =";
}

// ============================================================================
// Libellés.
// ============================================================================

export const LIBELLE_PHASE: Record<PhaseCercles, string> = {
  aEcran1: "Étape 1 (système en D, E, F)",
  aEcran2: "Étape 2 (résolution du système)",
  aEcran3: "Étape 3 (centre et rayon)",
  bEcran1: "Étape 1 (médiatrice de [AB])",
  bEcran2: "Étape 2 (équation en x)",
  bEcran3: "Étape 3 (les 2 centres + rayon)",
  cEcran1: "Étape 1 (médiatrice de [AB])",
  cEcran2: "Étape 2 (centre par intersection)",
  cEcran3: "Étape 3 (rayon)",
  dEcran1: "Étape 1 (centre paramétré (Bx;r))",
  dEcran2: "Étape 2 (équation en r)",
  dEcran3: "Étape 3 (r, centre, équation)",
  eEcran1: "Étape 1 (côtés a, b, c)",
  eEcran2: "Étape 2 (centre inscrit I)",
  eEcran3: "Étape 3 (rayon inscrit)",
  fEcran1: "Étape 1 (distance centre-droite)",
  fEcran2: "Étape 2 (r² puis r)",
  fEcran3: "Étape 3 (rayon et équation)",
  gEcran1: "Étape 1 (3 sommets)",
  gEcran2: "Étape 2 (côtés a, b, c)",
  gEcran3: "Étape 3 (centre inscrit I)",
  gEcran4: "Étape 4 (rayon inscrit)",
};

export const LIBELLE_FAMILLE: Record<ExerciceCercles["famille"], string> = {
  A: "A — Cercle par 3 points",
  B: "B — Cercle par 2 points, rayon donné",
  C: "C — Cercle par 2 points, centre sur une droite",
  D: "D — Cercle tangent à un axe",
  E: "E — Cercle inscrit à un triangle",
  F: "F — Cercle avec corde de longueur donnée",
  G: "G — Cercles tangents à 3 droites",
};

// ============================================================================
// Récapitulatif final.
// ============================================================================

function formatTriangleReponse(t: DonneesTriangleInscrit, phase: "cotes" | "incentre" | "rayon"): string[] {
  if (phase === "cotes") return [`a=${formatValeurAffichage(t.a)},\\;b=${formatValeurAffichage(t.b)},\\;c=${formatValeurAffichage(t.c)}`];
  if (phase === "incentre") return [formatPoint({ x: t.incentreX, y: t.incentreY })];
  return [`${formatValeurAffichage(t.rayon)}`];
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceCercles, phase: PhaseCercles): string[] {
  switch (exercice.famille) {
    case "A":
      if (phase === "aEcran1") return [formatEquationCerclePourPoint(exercice.A), formatEquationCerclePourPoint(exercice.B), formatEquationCerclePourPoint(exercice.C)];
      if (phase === "aEcran2") return [`D=${formatValeurAffichage(exercice.D)},\\;E=${formatValeurAffichage(exercice.E)},\\;F=${formatValeurAffichage(exercice.F)}`];
      return [`\\text{centre}${formatPoint({ x: exercice.centreX, y: exercice.centreY })},\\;r=${formatValeurAffichage(exercice.rayon)}`];
    case "B":
      if (phase === "bEcran1") return [formatDroiteLatex(exercice.mediatrice)];
      if (phase === "bEcran2") return ["\\text{(voir aide/développement)}"];
      return [`${formatPoint(exercice.centre1)}\\text{ et }${formatPoint(exercice.centre2)},\\;r=${formatValeurAffichage(exercice.r)}`];
    case "C":
      if (phase === "cEcran1") return [formatDroiteLatex(exercice.mediatrice)];
      if (phase === "cEcran2") return [formatPoint(exercice.centre)];
      return [`${formatValeurAffichage(exercice.rayon)}`];
    case "D":
      if (phase === "dEcran1") return [`(${formatValeurAffichage(exercice.Bx)};r)`];
      if (phase === "dEcran2") return ["\\text{(voir aide/développement)}"];
      return [`r=${formatValeurAffichage(exercice.r)},\\;\\text{centre}(${formatValeurAffichage(exercice.Bx)};${formatValeurAffichage(exercice.r)})`];
    case "E":
      if (phase === "eEcran1") return formatTriangleReponse(exercice, "cotes");
      if (phase === "eEcran2") return formatTriangleReponse(exercice, "incentre");
      return formatTriangleReponse(exercice, "rayon");
    case "F":
      if (phase === "fEcran1") return [`${formatValeurAffichage(exercice.distanceCentreDroite)}`];
      if (phase === "fEcran2") return [`r^2=${formatValeurAffichage(exercice.rCarre)},\\;r=${formatValeurAffichage(exercice.rayon)}`];
      return [`r=${formatValeurAffichage(exercice.rayon)}`];
    case "G":
      if (phase === "gEcran1") return [formatPoint(exercice.sommet12), formatPoint(exercice.sommet23), formatPoint(exercice.sommet31)];
      if (phase === "gEcran2") return formatTriangleReponse(exercice.triangle, "cotes");
      if (phase === "gEcran3") return formatTriangleReponse(exercice.triangle, "incentre");
      return formatTriangleReponse(exercice.triangle, "rayon");
  }
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 3 pour A-F, 4 pour G). */
export function calculerTotalPointsCercles(resultat: ResultatExerciceCercles): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
