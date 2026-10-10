/**
 * Présentation — "Calcul de composantes de combinaisons linéaires" (chapitre "Calcul vectoriel").
 * Remplace en place l'ancienne présentation de ce même générateur — voir
 * `core/combinaisonVecteurs.types.ts` pour le contraste complet.
 *
 * `promptcorrectionsgenerateur21notationinterface.md` — 6 corrections apportées après la refonte
 * initiale : notation matricielle en colonne pour toute composante de VECTEUR affichée (jamais pour
 * les coordonnées de points, restées en couple `(x;y)`, ni pour un coefficient scalaire isolé) ;
 * `\vec{t}` partout au lieu de `t` nu ; consigne de l'écran 1 listant dynamiquement les vecteurs
 * réellement présents dans l'expression de l'énoncé (`idsPresentsDansExpression`, jamais
 * `baseCanonique` tout entier — un vecteur proposé peut ne jamais apparaître, ex. le libre inutilisé
 * de `complete`) ; écran 1 revenu à un champ libre unique (voir la Couche B, `verificationCombinaisonVecteurs.ts`,
 * qui délègue désormais à `expressionVectorielle.ts`, déjà éprouvée ailleurs sur la plateforme pour
 * ce type de notation) ; reformulation du texte de l'aide 2 ; labels `x_{\vec t}`/`y_{\vec t}` sur la
 * même ligne que leur champ, écran 2.
 *
 * L'énoncé n'est **jamais pré-simplifié** (même règle transversale que le reste du projet, ex.
 * exercices 4/5 du chapitre 2) : `formatExpressionLatex` rend toujours les groupes tels quels, avec
 * `\vec{AB}`/`\vec{BA}` dans leur orientation LITTÉRALE (jamais convertie), jamais regroupée.
 *
 * **Aides écran 1 (simplification), 3 niveaux, texte uniquement (aucun croquis — pas de risque
 * spatial pour un vecteur libre, voir le contrat)** — chacune une étape de plus vers la forme
 * réduite finale, jamais la réponse elle-même avant le niveau maximal :
 * - Niveau 1 (`formatDistribueLatex`) : distribue chaque coefficient externe sur les termes de son
 *   groupe — plus de parenthèses, mais `\vec{AB}`/`\vec{BA}` encore dans leur orientation littérale
 *   et rien encore regroupé (cible le piège "oublier de distribuer").
 * - Niveau 2 (`idsConcernesRegroupementLatex`) : identification SEULE — quels vecteurs de base sont
 *   concernés par un regroupement (répétés) ou une conversion (`AB`/`BA` mélangés) — jamais le
 *   coefficient final ni la conversion elle-même.
 * - Niveau 3 (`formatConvertiLatex`) : `\vec{BA}` converti en `-\vec{AB}` partout — homogène dans
 *   une seule base, mais encore PAS regroupé (l'addition des coefficients reste à faire).
 *
 * **Aides écran 2 (composantes), 2 niveaux** :
 * - Niveau 1 (`formatSubstitutionLatex`) : substitue chaque coefficient réduit par les composantes
 *   réelles de son vecteur (notation matricielle), pas encore sommé.
 * - Niveau 2 (`formatSommeAxesLatex`) : la somme des composantes x d'un côté, des composantes y de
 *   l'autre, séparément — valeurs scalaires isolées, jamais une paire de composantes affichée
 *   ensemble, donc jamais de notation matricielle ici — et jamais le résultat final combiné.
 *
 * `promptmodificationsgenerateur22.md` — "bloc fitter" (un fragment KaTeX par élément, jamais un
 * unique bloc `\quad`-joined qui ne retourne jamais à la ligne sur mobile étroit — même principe que
 * les générateurs 24/25/27) étendu à tous les blocs de ce générateur : `formatTermesVecteursLibresLatex`/
 * `formatTermesPointsLatex`/`formatTermesDonneesLatex` pour le bloc de données (désormais répété sur
 * les 2 écrans, jamais seulement le premier) ; `formatTermesExpressionLatex` pour l'énoncé de l'écran
 * 1, un fragment par GROUPE plutôt que par terme individuel (l'unité visuelle naturelle de ce
 * générateur, voir sa doc dédiée).
 */
import type { Composantes } from "../core/vecteur.types";
import type { ExerciceCombinaisonVecteurs, GroupeCombinaison, RefVecteurBase, VarianteCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import { vecteurDepuisPoints } from "../generateurs/vecteur/arithmetique";
import { CATALOGUE_VARIANTES, idCanoniqueRef, signeConversionRef } from "../generateurs/combinaisonVecteurs";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/** Les lettres brutes d'une référence — le nom pour un vecteur libre, la paire de points DANS SON
 * ORIENTATION LITTÉRALE (jamais canonique) pour un point-à-point : `depart="B",arrivee="A"` donne
 * `"BA"`, pas `"AB"`. */
function lettresRef(ref: RefVecteurBase): string {
  return ref.type === "libre" ? ref.nom : `${ref.depart}${ref.arrivee}`;
}

function formatVecteurLatex(lettres: string): string {
  return `\\vec{${lettres}}`;
}

/** `\vec{t}` — jamais `t` nu, sur tous les écrans/aides/récapitulatif (correction 2). Le champ
 * `resultatNom` reste un identifiant brut ("t") côté contrat, cette fonction est l'unique point
 * d'habillage LaTeX, jamais dupliquée ailleurs. */
export function formatResultatLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return formatVecteurLatex(exercice.resultatNom);
}

/** Notation matricielle en colonne (2×1) d'un vecteur — `\begin{pmatrix}x\\y\end{pmatrix}` (correction
 * 1). Concerne UNIQUEMENT des composantes de vecteur ; les coordonnées de points restent en couple,
 * voir `formatPointsLatex`, jamais concernée par cette fonction. */
export function formatVecteurColonneLatex(v: Composantes): string {
  return `\\begin{pmatrix}${formatNombre(v.x)}\\\\${formatNombre(v.y)}\\end{pmatrix}`;
}

/** Rappel des 3 vecteurs libres connus, dans l'ordre déjà fixé par la Couche A — notation
 * matricielle en colonne (correction 1). */
export function formatVecteursLibresLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return exercice.vecteursLibres.map((v) => `\\vec{${v.nom}} = ${formatVecteurColonneLatex(v.composantes)}`).join(" \\quad ");
}

/** `null` pour les variantes sans points (`plate`/`parentheses`/`vecteur-repete`). Coordonnées de
 * points TOUJOURS en couple classique — jamais la notation matricielle (correction 1, exclusion
 * explicite). */
export function formatPointsLatex(exercice: ExerciceCombinaisonVecteurs): string | null {
  if (!exercice.points) return null;
  const { A, B } = exercice.points;
  return `A(${formatNombre(A.x)} ; ${formatNombre(A.y)}) \\quad B(${formatNombre(B.x)} ; ${formatNombre(B.y)})`;
}

/** "Bloc fitter" (`promptmodificationsgenerateur22.md`) — un fragment KaTeX par vecteur libre,
 * jamais un unique `\quad`-joined (`formatVecteursLibresLatex` ci-dessus) qui ne retourne jamais à
 * la ligne sur mobile étroit une fois les 3 vecteurs affichés côte à côte. Même patron que
 * `formatTermesEnoncePointsLatex` (générateur 24) — juste un fragment par vecteur plutôt que par
 * point. */
export function formatTermesVecteursLibresLatex(exercice: ExerciceCombinaisonVecteurs): string[] {
  return exercice.vecteursLibres.map((v) => `\\vec{${v.nom}} = ${formatVecteurColonneLatex(v.composantes)}`);
}

/** "Bloc fitter" — un fragment KaTeX par point (`["A(...)", "B(...)"]`), `null` si la variante n'a
 * pas de points (mêmes 3 variantes que `formatPointsLatex`). */
export function formatTermesPointsLatex(exercice: ExerciceCombinaisonVecteurs): string[] | null {
  if (!exercice.points) return null;
  const { A, B } = exercice.points;
  return [`A(${formatNombre(A.x)} ; ${formatNombre(A.y)})`, `B(${formatNombre(B.x)} ; ${formatNombre(B.y)})`];
}

/** Bloc de données complet (vecteurs libres + points le cas échéant) en un seul tableau de
 * fragments — combine `formatTermesVecteursLibresLatex`/`formatTermesPointsLatex`, seul point
 * d'entrée consommé par les 2 écrans (simplification ET composantes, point 2 du prompt) pour ne
 * jamais dupliquer la logique de combinaison des deux. */
export function formatTermesDonneesLatex(exercice: ExerciceCombinaisonVecteurs): string[] {
  const pointsTermes = formatTermesPointsLatex(exercice);
  return [...formatTermesVecteursLibresLatex(exercice), ...(pointsTermes ?? [])];
}

/** Coefficient magnitude 1 omis devant `\vec{...}` (convention vecteur, comme le reste du projet) —
 * jamais pour un terme purement numérique (voir `formatTermeMatriceSigne` plus bas, utilisée par
 * l'aide de substitution, qui garde elle TOUJOURS le coefficient explicite). */
function formatTermeVecteurSigne(coefficient: number, lettres: string, estPremier: boolean): string {
  const signe = coefficient < 0 ? "-" : estPremier ? "" : "+";
  const abs = Math.abs(coefficient);
  const coefTexte = abs === 1 ? "" : formatNombre(abs);
  return `${signe}${coefTexte}${formatVecteurLatex(lettres)}`;
}

function formatSommeVecteursSignee(termes: { coefficient: number; lettres: string }[]): string {
  return termes.map((t, i) => formatTermeVecteurSigne(t.coefficient, t.lettres, i === 0)).join("");
}

/** Un groupe à 1 terme n'a jamais de parenthèses (le terme porte directement sa magnitude) ; un
 * groupe à 2-3 termes affiche toujours ses parenthèses et son coefficient externe distribué (jamais
 * `1(...)`, mais `coefficientExterne` n'est de toute façon jamais 1 pour un groupe multi-termes —
 * voir `generateurs/combinaisonVecteurs/index.ts`). */
function formatGroupeLatex(groupe: GroupeCombinaison): string {
  const interieur = formatSommeVecteursSignee(groupe.termes.map((t) => ({ coefficient: t.coefficient, lettres: lettresRef(t.ref) })));
  if (groupe.termes.length === 1) return interieur;
  const coefExterneTexte = groupe.coefficientExterne === 1 ? "" : formatNombre(groupe.coefficientExterne);
  return `${coefExterneTexte}(${interieur})`;
}

/** L'énoncé — jamais pré-simplifié, orientation littérale de chaque point-à-point conservée
 * (`\vec{AB}`/`\vec{BA}` exactement comme construits par la Couche A). */
export function formatExpressionLatex(exercice: ExerciceCombinaisonVecteurs): string {
  const morceaux = exercice.groupes.map((groupe, i) => {
    const texte = formatGroupeLatex(groupe);
    if (i === 0) return texte;
    return ` ${exercice.operateurs[i - 1]} ${texte}`;
  });
  return `${formatResultatLatex(exercice)} = ${morceaux.join("")}`;
}

/** "Bloc fitter" — un fragment KaTeX par GROUPE (jamais l'expression entière concaténée), le
 * préfixe `\vec{t} =` porté par le premier fragment, l'opérateur `+`/`-` par les suivants — même
 * principe que `formatTermesLatex` (générateur 27, chaîne de Chasles) mais au niveau du groupe
 * plutôt que du terme individuel : un groupe parenthésé (`3(5\vec{u}-3\vec{AB}+2\vec{w})`) est déjà
 * l'unité visuelle naturelle de retour à la ligne pour ce générateur, jamais éclaté plus loin. */
export function formatTermesExpressionLatex(exercice: ExerciceCombinaisonVecteurs): string[] {
  return exercice.groupes.map((groupe, i) => {
    const texte = formatGroupeLatex(groupe);
    const prefixe = i === 0 ? `${formatResultatLatex(exercice)} = ` : `${exercice.operateurs[i - 1]} `;
    return `${prefixe}${texte}`;
  });
}

interface TermeSigneAxe {
  coefficient: number;
  ref: RefVecteurBase;
}

/** Distribue chaque coefficient externe (et le signe du groupe porté par `operateurs`) sur les
 * termes de son groupe — un terme par occurrence, jamais regroupé ni converti. */
function termesDistribues(exercice: ExerciceCombinaisonVecteurs): TermeSigneAxe[] {
  const resultat: TermeSigneAxe[] = [];
  exercice.groupes.forEach((groupe, i) => {
    const signeGroupe = i === 0 ? 1 : exercice.operateurs[i - 1] === "-" ? -1 : 1;
    for (const terme of groupe.termes) {
      resultat.push({ coefficient: signeGroupe * groupe.coefficientExterne * terme.coefficient, ref: terme.ref });
    }
  });
  return resultat;
}

/** Aide 1 (écran 1) — distribué, orientation littérale encore conservée, rien regroupé. */
export function formatDistribueLatex(exercice: ExerciceCombinaisonVecteurs): string {
  const termes = termesDistribues(exercice).map((t) => ({ coefficient: t.coefficient, lettres: lettresRef(t.ref) }));
  return `${formatResultatLatex(exercice)} = ${formatSommeVecteursSignee(termes)}`;
}

/** Les ids canoniques (de `baseCanonique`) concernés par un regroupement (vecteur libre répété) ou
 * une conversion (`AB`/`BA` mélangés) — un id apparaît ≥2 fois parmi les termes distribués une fois
 * ramené à son id canonique. Jamais le coefficient final, jamais la conversion elle-même — seule
 * l'IDENTIFICATION. */
function idsConcernesRegroupement(exercice: ExerciceCombinaisonVecteurs): string[] {
  const comptage: Record<string, number> = {};
  for (const terme of termesDistribues(exercice)) {
    const id = idCanoniqueRef(terme.ref);
    comptage[id] = (comptage[id] ?? 0) + 1;
  }
  return exercice.baseCanonique.filter((id) => (comptage[id] ?? 0) >= 2);
}

/** Aide 2 (écran 1) — fragments LaTeX courts (`\vec{u}`, `\vec{AB}`...), un par vecteur concerné,
 * jamais une phrase entière composée en LaTeX (le composant les compose en JSX avec du texte brut
 * entre eux — même précaution que le reste du projet contre le débordement horizontal mobile d'un
 * bloc `\text{...}` monolithique). Vide si aucun regroupement/conversion n'est nécessaire (jamais le
 * cas en pratique pour les variantes qui ont réellement besoin de cette aide, mais reste défini pour
 * toutes). */
export function idsConcernesRegroupementLatex(exercice: ExerciceCombinaisonVecteurs): string[] {
  return idsConcernesRegroupement(exercice).map(formatVecteurLatex);
}

/** Aide 3 (écran 1) — `\vec{BA}` converti en `-\vec{AB}` partout (homogène dans une seule base),
 * mais encore ÉTALÉ terme par terme, jamais regroupé — l'addition des coefficients reste à faire. */
export function formatConvertiLatex(exercice: ExerciceCombinaisonVecteurs): string {
  const termes = termesDistribues(exercice).map((t) => ({
    coefficient: t.coefficient * signeConversionRef(t.ref),
    lettres: idCanoniqueRef(t.ref),
  }));
  return `${formatResultatLatex(exercice)} = ${formatSommeVecteursSignee(termes)}`;
}

/** La réponse attendue à l'écran 1 (réduction finale) — un coefficient réduit nul omet entièrement
 * son terme (jamais `0\vec{...}`), même convention que le reste du projet pour un terme nul. Réutilisée
 * telle quelle pour le récapitulatif ET la révélation après échec — jamais un second calcul. Reste
 * purement symbolique (jamais de composantes numériques affichées ici), donc jamais concernée par la
 * notation matricielle — seule `${formatResultatLatex(exercice)} = ...` (voir
 * `formatEquationReduiteLatex`) l'habille de `\vec{t}`. */
export function formatCoefficientsReduitsLatex(exercice: ExerciceCombinaisonVecteurs): string {
  const termes = exercice.baseCanonique
    .filter((id) => exercice.coefficientsReduits[id] !== 0)
    .map((id) => ({ coefficient: exercice.coefficientsReduits[id], lettres: id }));
  return formatSommeVecteursSignee(termes);
}

/** `\vec{t} = ...` — la forme réduite complète, préfixée. Point d'entrée unique partagé par le
 * récapitulatif et la révélation après échec de l'écran 1, jamais deux compositions indépendantes. */
export function formatEquationReduiteLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return `${formatResultatLatex(exercice)} = ${formatCoefficientsReduitsLatex(exercice)}`;
}

/** `\vec{t} = \begin{pmatrix}x\\y\end{pmatrix}` — la réponse numérique finale, notation matricielle
 * (correction 1, "le récapitulatif final"). Révélation de l'écran 2 uniquement. */
export function formatReponseColonneLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return `${formatResultatLatex(exercice)} = ${formatVecteurColonneLatex(exercice.reponse)}`;
}

function composantesDeId(exercice: ExerciceCombinaisonVecteurs, id: string): Composantes {
  if (exercice.points && id === "AB") return vecteurDepuisPoints(exercice.points.A, exercice.points.B);
  const vecteur = exercice.vecteursLibres.find((v) => v.nom === id);
  if (!vecteur) throw new Error(`composantesDeId : id inconnu "${id}"`);
  return vecteur.composantes;
}

/** Écran 2 — les vecteurs de base RÉELLEMENT utilisés (coefficient réduit non nul), dans l'ordre de
 * `baseCanonique` — jamais un vecteur à coefficient nul, qui ne contribue rien à la somme. */
function basesUtilisees(exercice: ExerciceCombinaisonVecteurs): { id: string; coefficient: number; composantes: Composantes }[] {
  return exercice.baseCanonique
    .filter((id) => exercice.coefficientsReduits[id] !== 0)
    .map((id) => ({ id, coefficient: exercice.coefficientsReduits[id], composantes: composantesDeId(exercice, id) }));
}

/** Coefficient TOUJOURS explicite (jamais omis pour une magnitude 1) — convention distincte de
 * `formatTermeVecteurSigne` : ici on affiche une substitution numérique littérale, pas un
 * coefficient devant un symbole vectoriel. Jamais de parenthèses autour de `valeurLatex` — une
 * matrice colonne porte déjà ses propres délimiteurs visuels, des parenthèses supplémentaires
 * seraient redondantes (contrairement à un couple `(x ; y)`, qui en avait besoin). */
function formatTermeMatriceSigne(coefficient: number, valeurLatex: string, estPremier: boolean): string {
  const signe = coefficient < 0 ? "-" : estPremier ? "" : "+";
  return `${signe}${formatNombre(Math.abs(coefficient))}${valeurLatex}`;
}

/** Coefficient TOUJOURS explicite, valeur scalaire entre parenthèses classiques — utilisée par
 * `formatSommeAxesLatex` uniquement (une composante isolée n'est jamais habillée en matrice). */
function formatTermeScalaireSigne(coefficient: number, valeurTexte: string, estPremier: boolean): string {
  const signe = coefficient < 0 ? "-" : estPremier ? "" : "+";
  return `${signe}${formatNombre(Math.abs(coefficient))}(${valeurTexte})`;
}

/** Aide 1 (écran 2) — substitution des composantes réelles (notation matricielle), terme à terme,
 * pas encore sommée. */
export function formatSubstitutionLatex(exercice: ExerciceCombinaisonVecteurs): string {
  const termes = basesUtilisees(exercice).map((b, i) => formatTermeMatriceSigne(b.coefficient, formatVecteurColonneLatex(b.composantes), i === 0));
  return `${formatResultatLatex(exercice)} = ${termes.join("")}`;
}

/** Aide 2 (écran 2) — somme des composantes x d'un côté, y de l'autre, séparément (valeurs
 * scalaires isolées, jamais de notation matricielle ici), jamais combinées en un résultat final.
 * Préfixe `x_{\vec t} =`/`y_{\vec t} =` (`promptcorrectionnotationaidecomposantesgen21.md`) — même
 * habillage que les labels des champs de saisie de cet écran (`formatLabelXLatex`/`formatLabelYLatex`),
 * jamais un `x =`/`y =` nu. */
export function formatSommeAxesLatex(exercice: ExerciceCombinaisonVecteurs): { x: string; y: string } {
  const bases = basesUtilisees(exercice);
  const ligne = (axe: "x" | "y") => bases.map((b, i) => formatTermeScalaireSigne(b.coefficient, formatNombre(b.composantes[axe]), i === 0)).join("");
  return { x: `${formatLabelXLatex(exercice)} ${ligne("x")}`, y: `${formatLabelYLatex(exercice)} ${ligne("y")}` };
}

/** Labels de l'écran 2 (correction 6) — `x_{\vec t} =`/`y_{\vec t} =`, un seul fragment LaTeX,
 * consommé sur la même ligne que son champ (`field-inline`, voir le composant). */
export function formatLabelXLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return `x_{${formatResultatLatex(exercice)}} =`;
}

export function formatLabelYLatex(exercice: ExerciceCombinaisonVecteurs): string {
  return `y_{${formatResultatLatex(exercice)}} =`;
}

/** Les ids de `baseCanonique` qui apparaissent RÉELLEMENT dans l'expression brute de l'énoncé
 * (groupes/termes) — jamais `baseCanonique` tout entier, qui liste les CANDIDATS de l'ancienne
 * interface add-as-needed, pas nécessairement tous présents dans l'expression (ex. le vecteur libre
 * jamais utilisé de la variante `complete`, ou le 3e libre non tiré des variantes `plate`/
 * `parentheses`). Sert uniquement à la consigne de l'écran 1 (correction 3) — jamais l'ensemble des
 * vecteurs à coefficient réduit non nul, qui révélerait la réponse ; ceux-ci peuvent différer
 * (un vecteur peut apparaître dans l'expression brute et s'annuler exactement à la réduction). */
export function idsPresentsDansExpression(exercice: ExerciceCombinaisonVecteurs): string[] {
  const presents = new Set<string>();
  for (const groupe of exercice.groupes) {
    for (const terme of groupe.termes) presents.add(idCanoniqueRef(terme.ref));
  }
  return exercice.baseCanonique.filter((id) => presents.has(id));
}

/** Fragments LaTeX courts (`\vec{u}`, `\vec{AB}`...) des vecteurs réellement présents dans
 * l'expression — même patron que `idsConcernesRegroupementLatex` (le composant les compose en JSX
 * avec du texte brut entre eux, jamais une phrase entière passée à KaTeX). */
export function vecteursPresentsLatex(exercice: ExerciceCombinaisonVecteurs): string[] {
  return idsPresentsDansExpression(exercice).map(formatVecteurLatex);
}

const COEFFICIENTS_PLACEHOLDER = [-3, 3, 12, -5];

/** Exemple de syntaxe attendue au champ libre de l'écran 1 (correction 4) — coefficients purement
 * illustratifs (jamais liés à `coefficientsReduits`, ne révèlent jamais la réponse), adaptés
 * dynamiquement au nombre de vecteurs de `baseCanonique` de cet exercice précis. */
export function placeholderReduction(exercice: ExerciceCombinaisonVecteurs): string {
  const termes = exercice.baseCanonique.map((id, i) => {
    const coef = COEFFICIENTS_PLACEHOLDER[i % COEFFICIENTS_PLACEHOLDER.length];
    const signe = coef < 0 ? "-" : i === 0 ? "" : "+";
    return `${signe}${Math.abs(coef)}${id}`;
  });
  return `ex : ${termes.join("")}`;
}

/** Réutilise directement les libellés du catalogue de la Couche A — jamais une seconde table qui
 * pourrait diverger. */
export function libelleVarianteCombinaisonVecteurs(variante: VarianteCombinaisonVecteurs): string {
  return CATALOGUE_VARIANTES.find((v) => v.id === variante)?.label ?? variante;
}
