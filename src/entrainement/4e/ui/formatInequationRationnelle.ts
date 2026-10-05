import type { Enonce } from "../core/generateur.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import type {
  ExerciceInequationRationnelle,
  ExerciceInequationRationnelleCubique,
  ExerciceInequationRationnelleDenominateurCarre,
  ExerciceInequationRationnelleFacteurCommun,
  ExerciceInequationRationnelleNiveau2,
  ExerciceInequationRationnelleNiveau3,
  ExerciceInequationRationnelleNiveau4,
  ExerciceInequationRationnelleNumerateurLineaire,
  ExerciceInequationRationnelleSansFacteurCommun,
} from "../core/inequationRationnelle.types";
import { formatLineaireDeveloppe } from "./formatSignesProduit";
import { formatFacteurRacine, formatFacteurSeul, formatFormeFactoriseeDepuisRacines, formatMembreGauche, formatSommeTermes } from "./formatEquation";
import { formatFractionSimplifiee } from "./formatSimplification";
import { SYMBOLE_LATEX } from "./formatInequation";

/**
 * N(x)/D(x) ◇ 0 — les deux polynômes toujours développés (kx-kp), jamais "k(x-p)". `numerateur`
 * porte toujours le sens "post-combinaison" (P1_3 en niveau 2, P1_1 en niveau 1 — voir
 * core/inequationRationnelle.types.ts), donc cette fonction reste correcte pour les deux niveaux
 * sans aucune branche : elle sert d'affichage persistant aux étapes CE/racine du
 * numérateur/grille/intervalle, qui opèrent toutes sur la fraction déjà combinée. Le niveau 3 (où
 * le numérateur combiné est du 2nd degré) a sa propre fonction dédiée.
 */
export function formatEnonceInequationRationnelleLatex(exercice: ExerciceInequationRationnelleNumerateurLineaire): string {
  const numerateur = formatLineaireDeveloppe(exercice.numerateur.k, exercice.numerateur.p);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** N1(x)/D(x) ◇ k — énoncé de DÉPART (niveau 2 uniquement), avant isolement/combinaison. */
export function formatEnonceOriginalNiveau2Latex(exercice: ExerciceInequationRationnelleNiveau2): string {
  const numerateur = formatLineaireDeveloppe(exercice.numerateurAvantCombinaison.k, exercice.numerateurAvantCombinaison.p);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} ${exercice.k}`;
}

/**
 * N1(x)/D(x) - k ◇ 0 — forme cible de l'étape "isoler" (niveau 2), avant combinaison en une seule
 * fraction. Sert aussi de rappel affiché sur l'étape "combiner" (ce qu'il faut réduire) et de texte
 * de révélation après échec de "isoler" (c'est exactement la réponse attendue).
 */
export function formatExpressionIsoleeLatex(exercice: ExerciceInequationRationnelleNiveau2): string {
  const numerateur = formatLineaireDeveloppe(exercice.numerateurAvantCombinaison.k, exercice.numerateurAvantCombinaison.p);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  const kAffiche = exercice.k > 0 ? `- ${exercice.k}` : `+ ${Math.abs(exercice.k)}`;
  return `\\frac{${numerateur}}{${denominateur}} ${kAffiche} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** Libellé de la ligne "N" du tableau (section 3 de la spec) : "N : [expression de P1_1]". */
export function formatLigneNumerateurLabel(numerateur: PolynomeLineaire): string {
  return `\\text{N : } ${formatLineaireDeveloppe(numerateur.k, numerateur.p)}`;
}

/** Libellé de la ligne "D" du tableau : "D : [expression de P1_2]". */
export function formatLigneDenominateurLabel(denominateur: PolynomeLineaire): string {
  return `\\text{D : } ${formatLineaireDeveloppe(denominateur.k, denominateur.p)}`;
}

/**
 * Libellé d'une des 2 lignes "N" du tableau (niveau 3 uniquement) : une par racine de P2_1,
 * toujours moniques (a=1 imposé — voir construireNiveau3.ts) donc `formatLineaireDeveloppe(1, r)`
 * suffit, jamais besoin du coefficient dominant réel de P2_1.
 */
export function formatLigneNumerateurNiveau3Label(racine: number): string {
  return `\\text{N : } ${formatLineaireDeveloppe(1, racine)}`;
}

/** N1(x)/D(x) ◇ P1_3(x) — énoncé de DÉPART (niveau 3 uniquement), avant isolement/combinaison. */
export function formatEnonceOriginalNiveau3Latex(exercice: ExerciceInequationRationnelleNiveau3): string {
  const numerateur = formatLineaireDeveloppe(exercice.numerateurAvantCombinaison.k, exercice.numerateurAvantCombinaison.p);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  const p1_3 = formatLineaireDeveloppe(exercice.p1_3.k, exercice.p1_3.p);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} ${p1_3}`;
}

/**
 * N1(x)/D(x) - P1_3(x) ◇ 0 — forme cible de l'étape "isoler" (niveau 3), avant combinaison en une
 * seule fraction. Sert aussi de rappel affiché sur "combiner" et de texte de révélation après
 * échec de "isoler".
 */
export function formatExpressionIsoleeNiveau3Latex(exercice: ExerciceInequationRationnelleNiveau3): string {
  const numerateur = formatLineaireDeveloppe(exercice.numerateurAvantCombinaison.k, exercice.numerateurAvantCombinaison.p);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  // -(P1_3(x)) développé — jamais "- -3x" ou une double négation (même principe que le reste du projet).
  const oppose = formatLineaireDeveloppe(-exercice.p1_3.k, exercice.p1_3.p);
  const jonction = oppose.startsWith("-") ? oppose : `+ ${oppose}`;
  return `\\frac{${numerateur}}{${denominateur}} ${jonction} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** P2_1(x)/D(x) ◇ 0 — énoncé COMBINÉ (niveau 3), affiché en persistant aux étapes CE/reconnaissance/factorisation/racines/grille/intervalle. */
export function formatEnonceCombineNiveau3Latex(exercice: ExerciceInequationRationnelleNiveau3): string {
  const numerateur = formatMembreGauche(exercice.numerateur.enonce);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** N1(x)/D2(x) ◇ N3(x)/D4(x) — énoncé de DÉPART (niveau 4 uniquement), avant isolement/combinaison : deux fractions, quatre polynômes du 1er degré. */
export function formatEnonceOriginalNiveau4Latex(exercice: ExerciceInequationRationnelleNiveau4): string {
  const n1 = formatLineaireDeveloppe(exercice.numerateurGaucheAvantCombinaison.k, exercice.numerateurGaucheAvantCombinaison.p);
  const d2 = formatLineaireDeveloppe(exercice.denominateurGauche.k, exercice.denominateurGauche.p);
  const n3 = formatLineaireDeveloppe(exercice.numerateurDroitAvantCombinaison.k, exercice.numerateurDroitAvantCombinaison.p);
  const d4 = formatLineaireDeveloppe(exercice.denominateurDroit.k, exercice.denominateurDroit.p);
  return `\\frac{${n1}}{${d2}} ${SYMBOLE_LATEX[exercice.symbole]} \\frac{${n3}}{${d4}}`;
}

/**
 * N1(x)/D2(x) - N3(x)/D4(x) ◇ 0 — forme cible de l'étape "isoler" (niveau 4), avant combinaison en
 * une seule fraction. Sert aussi de rappel affiché sur "combiner" et de texte de révélation après
 * échec de "isoler".
 */
export function formatExpressionIsoleeNiveau4Latex(exercice: ExerciceInequationRationnelleNiveau4): string {
  const n1 = formatLineaireDeveloppe(exercice.numerateurGaucheAvantCombinaison.k, exercice.numerateurGaucheAvantCombinaison.p);
  const d2 = formatLineaireDeveloppe(exercice.denominateurGauche.k, exercice.denominateurGauche.p);
  const n3 = formatLineaireDeveloppe(exercice.numerateurDroitAvantCombinaison.k, exercice.numerateurDroitAvantCombinaison.p);
  const d4 = formatLineaireDeveloppe(exercice.denominateurDroit.k, exercice.denominateurDroit.p);
  return `\\frac{${n1}}{${d2}} - \\frac{${n3}}{${d4}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * P2_1(x)/(D2(x)·D4(x)) ◇ 0 — énoncé COMBINÉ (niveau 4), affiché en persistant aux étapes
 * CE/reconnaissance/factorisation/racines/grille/intervalle. Dénominateur affiché comme le PRODUIT
 * des deux dénominateurs d'origine, chacun individuellement développé et parenthésé (jamais
 * multiplié en un seul grand polynôme) — même convention que l'énoncé de "tableau de signes à
 * plusieurs facteurs" (les parenthèses délimitent des facteurs déjà connus, pas une factorisation à
 * décacheter ; voir CLAUDE.md, section exercice 5).
 */
/** Parenthèse un facteur linéaire développé UNIQUEMENT s'il est composé (k≠1 ou p≠0), jamais
 * autour de la variable nue "x", qui donnerait "(x)(...)" superflu (audit transversal,
 * `promptauditparenthesessuperflues.md`). */
function formatFacteurLineaireGroupeLatex(k: number, p: number): string {
  const lineaire = formatLineaireDeveloppe(k, p);
  return k === 1 && p === 0 ? lineaire : `(${lineaire})`;
}

export function formatEnonceCombineNiveau4Latex(exercice: ExerciceInequationRationnelleNiveau4): string {
  const numerateur = formatMembreGauche(exercice.numerateur.enonce);
  const d2 = formatFacteurLineaireGroupeLatex(exercice.denominateurGauche.k, exercice.denominateurGauche.p);
  const d4 = formatFacteurLineaireGroupeLatex(exercice.denominateurDroit.k, exercice.denominateurDroit.p);
  return `\\frac{${numerateur}}{${d2}${d4}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * "(x-p)^2" — dénominateur toujours au carré, JAMAIS développé (seule exception à la règle
 * générale "toujours développé" du reste du projet, voir spec-denominateurcarre.md section 2 :
 * la forme carrée ne cache aucune étape de factorisation, une seule CE immédiatement lisible).
 * `denominateur` est toujours monique (k=1, voir core/inequationRationnelle.types.ts) donc
 * formatLineaireDeveloppe(1, p) suffit ; racine nulle affichée "x^2" nu, jamais "(x-0)^2" (même
 * convention que formatLigneNumerateurNiveau3Label).
 */
function formatDenominateurCarre(denominateur: PolynomeLineaire): string {
  const lineaire = formatLineaireDeveloppe(denominateur.k, denominateur.p);
  return denominateur.p === 0 ? `${lineaire}^2` : `(${lineaire})^2`;
}

/** A/(P1_2)² ◇ k — énoncé de DÉPART (variante dénominateur au carré), avant isolement/combinaison. */
export function formatEnonceOriginalDenominateurCarreLatex(exercice: ExerciceInequationRationnelleDenominateurCarre): string {
  const denominateur = formatDenominateurCarre(exercice.denominateur);
  return `\\frac{${exercice.A}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} ${exercice.k}`;
}

/**
 * A/(P1_2)² - k ◇ 0 — forme cible de l'étape "isoler" (variante dénominateur au carré). Sert aussi
 * de rappel affiché sur "combiner" et de texte de révélation après échec de "isoler".
 */
export function formatExpressionIsoleeDenominateurCarreLatex(exercice: ExerciceInequationRationnelleDenominateurCarre): string {
  const denominateur = formatDenominateurCarre(exercice.denominateur);
  const kAffiche = exercice.k > 0 ? `- ${exercice.k}` : `+ ${Math.abs(exercice.k)}`;
  return `\\frac{${exercice.A}}{${denominateur}} ${kAffiche} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Numérateur combiné(x)/(P1_2)² ◇ 0 — énoncé COMBINÉ (variante dénominateur au carré), affiché en
 * persistant aux étapes CE/reconnaissance/factorisation/racines/grille/intervalle. Numérateur
 * toujours développé (2nd degré, même convention que formatEnonceCombineNiveau3/4Latex) ;
 * dénominateur toujours au carré, jamais développé (voir formatDenominateurCarre).
 */
export function formatEnonceCombineDenominateurCarreLatex(exercice: ExerciceInequationRationnelleDenominateurCarre): string {
  const numerateur = formatMembreGauche(exercice.numerateur.enonce);
  const denominateur = formatDenominateurCarre(exercice.denominateur);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** Libellé de la ligne "D" du tableau (variante dénominateur au carré) : "D : (x-p)^2", jamais développé. */
export function formatLigneDenominateurCarreLabel(denominateur: PolynomeLineaire): string {
  return `\\text{D : } ${formatDenominateurCarre(denominateur)}`;
}

/**
 * N(x)/D(x) ◇ 0 — énoncé de DÉPART (variante facteur commun), N et D tous deux développés (2nd
 * degré, jamais pré-factorisés — même règle générale que le reste du projet, l'élève doit
 * factoriser lui-même pour découvrir la racine commune). `fraction.numerateur`/`.denominateur`
 * sont toujours des P2 pour le type "P2/P2" (seul type utilisé par cette variante).
 */
export function formatEnonceFacteurCommunLatex(exercice: ExerciceInequationRationnelleFacteurCommun): string {
  const { numerateur, denominateur } = exercice.fraction;
  if (!("enonce" in numerateur) || !("enonce" in denominateur)) {
    throw new Error('formatEnonceFacteurCommunLatex : attendu des P2 (fraction.type doit être "P2/P2")');
  }
  const n = formatMembreGauche(numerateur.enonce);
  const d = formatMembreGauche(denominateur.enonce);
  return `\\frac{${n}}{${d}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Fraction déjà simplifiée (réutilise formatFractionSimplifiee, exercice "Simplifier" — même
 * réduction par PGCD) ◇ 0 — énoncé persistant aux étapes grille/intervalle : la grille est
 * construite à partir de la fraction simplifiée (spec-facteurcommuninequation.md section 4), donc
 * cet écran doit refléter cette même fraction réduite, pas l'énoncé de départ N(x)/D(x).
 */
export function formatEnonceFacteurCommunSimplifieLatex(exercice: ExerciceInequationRationnelleFacteurCommun): string {
  return `${formatFractionSimplifiee(exercice.fraction)} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * N(x)/D(x) ◇ k — énoncé de DÉPART (variante "sans facteur commun", item f), avant isolement/
 * combinaison. N et D tous deux développés (2nd degré, jamais pré-factorisés — même règle générale
 * que le reste du projet). `numerateurAvantCombinaison` est un simple `Enonce` (pas encore un
 * `Exercice`, l'élève ne l'a pas encore factorisé — voir core/inequationRationnelle.types.ts).
 */
export function formatEnonceOriginalSansFacteurCommunLatex(exercice: ExerciceInequationRationnelleSansFacteurCommun): string {
  const numerateur = formatMembreGauche(exercice.numerateurAvantCombinaison);
  const denominateur = formatMembreGauche(exercice.denominateur.enonce);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} ${exercice.k}`;
}

/**
 * N(x)/D(x) - k ◇ 0 — forme cible de l'étape "isoler" (sans facteur commun), avant combinaison en
 * une seule fraction. Sert aussi de rappel affiché sur "combiner" et de texte de révélation après
 * échec de "isoler".
 */
export function formatExpressionIsoleeSansFacteurCommunLatex(exercice: ExerciceInequationRationnelleSansFacteurCommun): string {
  const numerateur = formatMembreGauche(exercice.numerateurAvantCombinaison);
  const denominateur = formatMembreGauche(exercice.denominateur.enonce);
  const kAffiche = exercice.k > 0 ? `- ${exercice.k}` : `+ ${Math.abs(exercice.k)}`;
  return `\\frac{${numerateur}}{${denominateur}} ${kAffiche} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Numérateur combiné(x)/D(x) ◇ 0 — énoncé COMBINÉ (sans facteur commun), affiché en persistant aux
 * étapes denomReconnaissance/denomChamp1/ce/reconnaissance/factorisation/racines/grille/intervalle.
 * Numérateur ET dénominateur tous deux développés (2nd degré) — contrairement aux niveaux 3-4/
 * denominateurCarre, D n'est jamais linéaire ici (voir formatEnonceCombineNiveau3/4Latex).
 */
export function formatEnonceCombineSansFacteurCommunLatex(exercice: ExerciceInequationRationnelleSansFacteurCommun): string {
  const numerateur = formatMembreGauche(exercice.numerateur.enonce);
  const denominateur = formatMembreGauche(exercice.denominateur.enonce);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Libellé d'une des 2 lignes "D" du tableau (variante sans facteur commun uniquement) : une par
 * racine de D, toujours moniques — D est construit avec un coefficient dominant toujours positif
 * (voir construireGrilleQuotientSansFacteurCommun.ts, même convention que le numérateur), donc
 * représenter chaque racine comme un facteur monique (x-r) suffit à l'analyse de signe, même
 * principe que formatLigneNumerateurNiveau3Label.
 */
export function formatLigneDenominateurSansFacteurCommunLabel(racine: number): string {
  return `\\text{D : } ${formatLineaireDeveloppe(1, racine)}`;
}

/**
 * ax³+bx²+cx — membre gauche de N(x) (variante cubique, item b), toujours développé, jamais de
 * terme constant (N(x)=x·(ax²+bx+c) n'en a structurellement jamais). Réutilise formatSommeTermes
 * (exercice 1, formatEquation.ts) avec 3 termes seulement — pas de terme constant à filtrer comme
 * pour un polynôme ordinaire, il n'existe simplement pas ici.
 */
export function formatMembreGaucheCubique({ a, b, c }: Enonce): string {
  return formatSommeTermes([
    { valeur: a, suffixe: "x^3" },
    { valeur: b, suffixe: "x^2" },
    { valeur: c, suffixe: "x" },
  ]);
}

/**
 * N(x)/P1_D(x) ◇ 0 — unique forme de l'énoncé (variante cubique, item b, comme niveau1/facteurCommun
 * : pas d'isoler/combiner), affichée en persistant à toutes les étapes (ce/miseEnEvidence/
 * reconnaissance/factorisation/racines/grille/intervalle). N toujours développé (ax³+bx²+cx),
 * jamais x(ax²+bx+c) — l'élève doit lui-même mettre x en évidence (même règle générale que le
 * reste du projet, voir CLAUDE.md).
 */
export function formatEnonceCubiqueLatex(exercice: ExerciceInequationRationnelleCubique): string {
  const numerateur = formatMembreGaucheCubique(exercice.numerateur.enonce);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Écran "tableau de signes" (promptgenerateur6inequationRationnelle.md, point 7) : un second bloc,
 * en plus de la forme combinée non factorisée déjà affichée, montrant l'inéquation ENTIÈREMENT
 * factorisée (numérateur et dénominateur tous deux, jamais un seul des deux) — jamais utilisée
 * ailleurs dans la séquence (la règle générale du reste du projet reste "jamais de forme produit
 * dans l'énoncé initial", voir CLAUDE.md ; cette exception est scopée à ce seul écran).
 */

/** "k(x-p)" — un polynôme du 1er degré sous forme factorisée : k omis si 1, absorbé en simple signe si -1, "x" nu si p=0. */
function formatPolynomeLineaireFactorise(poly: PolynomeLineaire): string {
  const { k, p } = poly;
  if (p === 0) return k === 1 ? "x" : k === -1 ? "-x" : `${k}x`;
  const facteur = formatFacteurRacine(p);
  if (k === 1) return facteur;
  return k === -1 ? `-(${facteur})` : `${k}(${facteur})`;
}

/** N(x)/D(x) ◇ 0, entièrement factorisé (niveaux 1-2) — chaque polynôme du 1er degré dans sa forme k(x-p), jamais développé. */
export function formatEnonceInequationRationnelleFactoriseLatex(exercice: ExerciceInequationRationnelleNumerateurLineaire): string {
  const numerateur = formatPolynomeLineaireFactorise(exercice.numerateur);
  const denominateur = formatPolynomeLineaireFactorise(exercice.denominateur);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** P2_1(x)/D(x) ◇ 0, entièrement factorisé (niveau 3) — numérateur factorisé depuis ses racines, dénominateur k(x-p). */
export function formatEnonceCombineNiveau3FactoriseLatex(exercice: ExerciceInequationRationnelleNiveau3): string {
  const numerateur = formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines);
  const denominateur = formatPolynomeLineaireFactorise(exercice.denominateur);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** P2_1(x)/(D2(x)D4(x)) ◇ 0, entièrement factorisé (niveau 4) — chaque facteur du dénominateur individuellement parenthésé. */
export function formatEnonceCombineNiveau4FactoriseLatex(exercice: ExerciceInequationRationnelleNiveau4): string {
  const numerateur = formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines);
  const d2 = `(${formatPolynomeLineaireFactorise(exercice.denominateurGauche)})`;
  const d4 = `(${formatPolynomeLineaireFactorise(exercice.denominateurDroit)})`;
  return `\\frac{${numerateur}}{${d2}${d4}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * Numérateur combiné(x)/(P1_2(x))² ◇ 0, entièrement factorisé (variante dénominateur au carré) — le
 * dénominateur est déjà affiché au carré, jamais développé (voir formatDenominateurCarre) : c'est
 * déjà sa forme factorisée, rien à changer là. Seul niveau du générateur où le coefficient constant
 * du numérateur peut être négatif (voir construireDenominateurCarre.ts, `a = randomNonZeroInt(-4,4)`)
 * — géré ici comme ailleurs par formatFormeFactoriseeDepuisRacines (absorbe le signe, jamais "-1").
 */
export function formatEnonceCombineDenominateurCarreFactoriseLatex(exercice: ExerciceInequationRationnelleDenominateurCarre): string {
  const numerateur = formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines);
  const denominateur = formatDenominateurCarre(exercice.denominateur);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** Numérateur combiné(x)/D(x) ◇ 0, entièrement factorisé (variante sans facteur commun) — numérateur ET dénominateur tous deux quadratiques, chacun factorisé depuis ses propres racines. */
export function formatEnonceCombineSansFacteurCommunFactoriseLatex(exercice: ExerciceInequationRationnelleSansFacteurCommun): string {
  const numerateur = formatFormeFactoriseeDepuisRacines(exercice.numerateur.enonce, exercice.numerateur.solution.racines);
  const denominateur = formatFormeFactoriseeDepuisRacines(exercice.denominateur.enonce, exercice.denominateur.solution.racines);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * N(x)/P1_D(x) ◇ 0, entièrement factorisé (variante cubique) — N(x) = x·(ax²+bx+c) : le coefficient
 * constant du facteur quadratique (toujours positif par construction, voir construireCubique.ts)
 * est placé AVANT "x" (jamais entre "x" et le premier binôme, qui lirait "x2(x-3)" de façon
 * ambiguë) — même convention que mise_en_evidence (secondDegre/categories/miseEnEvidence.ts).
 */
export function formatEnonceCubiqueFactoriseLatex(exercice: ExerciceInequationRationnelleCubique): string {
  const { a } = exercice.numerateur.enonce;
  const [r1, r2] = [...exercice.numerateur.solution.racines].sort((x, y) => y - x);
  const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);
  const numerateur = `${prefixe}x${formatFacteurSeul(r1)}${formatFacteurSeul(r2)}`;
  const denominateur = formatPolynomeLineaireFactorise(exercice.denominateur);
  return `\\frac{${numerateur}}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/**
 * x·(ax²+bx+c)/P1_D(x) ◇ 0 — état intermédiaire (variante cubique) : x déjà mis en évidence (étape
 * "miseEnEvidence" confirmée, avant reconnaissance/champ1/champ2 du facteur quadratique restant)
 * mais ce facteur pas encore lui-même factorisé — jamais utilisée pour l'énoncé fixe (toujours
 * formatEnonceCubiqueLatex, développé, voir formatEnonceOriginalComplet), seulement pour l'"état
 * actuel" persistant des écrans qui suivent la mise en évidence
 * (promptcorrectionsgenerateurs76complement.md, point 2.3 : ne jamais régresser vers "x" non encore
 * mis en évidence une fois cette étape confirmée).
 */
export function formatEnonceCubiqueMiseEnEvidenceLatex(exercice: ExerciceInequationRationnelleCubique): string {
  const quadratique = formatMembreGauche(exercice.numerateur.enonce);
  const denominateur = formatLineaireDeveloppe(exercice.denominateur.k, exercice.denominateur.p);
  return `\\frac{x(${quadratique})}{${denominateur}} ${SYMBOLE_LATEX[exercice.symbole]} 0`;
}

/** "6" — libellé de la ligne dédiée au facteur constant du numérateur (variante dénominateur au carré, uniquement quand ce facteur est négatif — voir GrilleQuotientNiveau3.ligneCoefficient). */
export function formatLigneCoefficientLabel(a: number): string {
  return String(a);
}

/**
 * Énoncé de départ complet, quel que soit le niveau/la variante — dispatch générique sur
 * `exercice.niveau`, jamais recalculé différemment entre le récapitulatif et le bloc "Énoncé" fixe
 * de l'écran d'exercice (promptcorrectionsgenerateurs764transversal.md, générateur 6, point 2.1) :
 * source unique, extraite de `calculerRecapitulatifInequationRationnelle` pour être réutilisable
 * par les deux appelants.
 */
export function formatEnonceOriginalComplet(exercice: ExerciceInequationRationnelle): string {
  switch (exercice.niveau) {
    case "niveau2":
      return formatEnonceOriginalNiveau2Latex(exercice);
    case "niveau3":
      return formatEnonceOriginalNiveau3Latex(exercice);
    case "niveau4":
      return formatEnonceOriginalNiveau4Latex(exercice);
    case "denominateurCarre":
      return formatEnonceOriginalDenominateurCarreLatex(exercice);
    case "facteurCommun":
      return formatEnonceFacteurCommunLatex(exercice);
    case "sansFacteurCommun":
      return formatEnonceOriginalSansFacteurCommunLatex(exercice);
    case "cubique":
      return formatEnonceCubiqueLatex(exercice);
    case "niveau1":
      return formatEnonceInequationRationnelleLatex(exercice);
  }
}
