/**
 * Couche B — vérification pour "Point à partir d'une relation vectorielle" (version guidée,
 * position 20). Deux notes possibles selon la variante — voir `core/relationVectorielle.types.ts`
 * pour la distinction avec le générateur homonyme déjà en place en position 21 (module totalement
 * indépendant, aucune fonction partagée).
 *
 * **Coordonnées finales** — statut à 3 valeurs sur CHAQUE champ SÉPARÉMENT (`diagnostiquerX`/
 * `diagnostiquerY`), pas seulement sur le couple combiné : objectif pédagogique explicite de la
 * spec, "isoler une éventuelle erreur de signe sur une seule coordonnée plutôt que de la noyer dans
 * un couple faux global" — consommé par le composant d'écran pour marquer en rouge le SEUL champ
 * fautif (même principe "compare en direct, disparaît dès correction" que `celluleEstErronee`,
 * exercice "Tableau de signes à plusieurs facteurs" / `classeCurseur`, "Transformations
 * graphiques"). `diagnostiquerCoordonnees`/`verifierCoordonnees` restent le point d'entrée unique
 * pour `etapeTentatives.ts` (une seule tentative, tout ou rien).
 *
 * **Traduction en équation de coordonnées** (variante `relationGenerale` uniquement, forme
 * `pointAPoint` ou `milieu` — la même vérification structurelle couvre les deux, jamais de cas
 * spécial pour `milieu`, qui n'est qu'une instance de la même forme générale avec `coefficient=0.5`)
 * — vérification SYMBOLIQUE/STRUCTURELLE (`analyserTraduction`, regex ancrée, même famille que
 * `analyserFormeCanoniqueComplete`/`diagnostiquerEquationTriangle`), jamais une évaluation
 * numérique : l'élève doit réécrire `\vec{BF}=k\vec{BE}` (ou `\vec{BM}=\frac12\vec{BE}`) sous forme
 * de différence de points, `F-B=k(E-B)` — les DEUX côtés de l'équation sont vérifiés (lettres ET
 * coefficient), aucune substitution de coordonnées réelles nécessaire (`pas de tolérance numérique
 * nécessaire ici (valeurs exactes)`, spec). Une inversion de sens du vecteur (`B-F` au lieu de
 * `F-B`, `E-B` au lieu de `B-E`) est ainsi rejetée par construction — mêmes lettres attendues à la
 * bonne position, jamais un simple test d'équivalence numérique qui l'aurait ratée (un vecteur
 * inversé donnerait un couple `(x,y)` différent, mais le but ICI est de vérifier la RÉÉCRITURE,
 * indépendamment de toute valeur numérique).
 *
 * **Tolérance à un coefficient déplacé d'un membre à l'autre, y compris par une constante NÉGATIVE**
 * (`promptcorrectionsgenerateur20verificationlabels.md`, correction 1 — round 1 : `2(M-B)=E-B`,
 * une multiplication des DEUX membres de la cible `M-B=1/2(E-B)` par 2, rejetée à tort ; round 2 :
 * `2(B-M)=B-E`, une multiplication par `-2` cette fois — qui inverse en plus l'ORDRE des lettres
 * dans chaque membre (`B-M` au lieu de `M-B`, `B-E` au lieu de `E-B`), également rejetée à tort).
 * L'ancienne version (round 1) exigeait que chaque membre apparaisse
 * dans son orientation littérale canonique (`pointCherche-labelOrigine`, `labelConnu-labelOrigine`)
 * — `identifierTermes` accepte désormais aussi l'orientation INVERSÉE de chaque membre
 * (`labelOrigine-pointCherche`, `labelOrigine-labelConnu`), en négant alors son coefficient avant
 * comparaison (`normaliserTerme` : `k(X-Y) = -k(Y-X)`, une identité algébrique exacte). Le rapport
 * `coefficient(terme "connu") / coefficient(terme "cherche")`, calculé sur ces coefficients déjà
 * normalisés, reste ensuite comparé à `exercice.coefficient` exactement comme au round 1 —
 * mathématiquement exact quelle que soit la constante non nulle (positive OU négative) appliquée
 * aux deux membres à la fois, y compris quand elle inverse quel terme apparaît à gauche/à droite ET
 * quel ordre de lettres apparaît dans chaque membre. Les deux pièges explicites de la spec (`B-F`
 * pour `F-B`, `E-B` réécrit `B-E`, SANS qu'aucune constante cohérente ne relie les deux membres)
 * restent rejetés — `normaliserTerme` ne fait qu'inverser le SIGNE d'un terme réécrit dans l'autre
 * sens, jamais dispenser de vérifier que le RAPPORT résultant égale bien `exercice.coefficient`.
 */
import type { ExerciceRelationGeneraleRV, ExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import type { StatutVerification } from "./statutVerification";
import { parserNombreOuFraction } from "./verificationAnalyseFonction";

const TOLERANCE = 0.01;

export function diagnostiquerX(exercice: ExerciceRelationVectorielle, x: number): StatutVerification {
  if (!Number.isFinite(x)) return "parse_error";
  return Math.abs(x - exercice.reponse.x) <= TOLERANCE ? "correct" : "not_equivalent";
}

export function diagnostiquerY(exercice: ExerciceRelationVectorielle, y: number): StatutVerification {
  if (!Number.isFinite(y)) return "parse_error";
  return Math.abs(y - exercice.reponse.y) <= TOLERANCE ? "correct" : "not_equivalent";
}

/** Point d'entrée unique pour `etapeTentatives.ts` — combine les deux champs en une seule
 * tentative : `parse_error` si l'un des deux champs n'est pas fini, sinon `correct` seulement si
 * les DEUX coordonnées correspondent. */
export function diagnostiquerCoordonnees(exercice: ExerciceRelationVectorielle, x: number, y: number): StatutVerification {
  const statutX = diagnostiquerX(exercice, x);
  const statutY = diagnostiquerY(exercice, y);
  if (statutX === "parse_error" || statutY === "parse_error") return "parse_error";
  return statutX === "correct" && statutY === "correct" ? "correct" : "not_equivalent";
}

export function verifierCoordonnees(exercice: ExerciceRelationVectorielle, x: number, y: number): boolean {
  return diagnostiquerCoordonnees(exercice, x, y) === "correct";
}

interface Terme {
  coefficient: number;
  lettre1: string;
  lettre2: string;
}

interface TraductionParsee {
  termeGauche: Terme;
  termeDroit: Terme;
}

// Un membre parenthésé — "k(E-B)" ou "k*(E-B)" — le coefficient ne contient jamais de parenthèse ni
// de "*". Le coefficient PEUT être vide (`*` suffit à zéro caractère) : voir `analyserCoefficient`
// ci-dessous, qui donne son sens à ce cas (coefficient implicite ±1).
const REGEX_TERME_PARENTHESE = /^([^()*]*)\*?\(([A-Za-z])-([A-Za-z])\)$/;
// Un membre "bare" — "F-B", jamais de coefficient explicite (implicitement 1, voir `analyserTerme`).
const REGEX_TERME_BARE = /^([A-Za-z])-([A-Za-z])$/;

/**
 * Coefficient implicite ±1 — **piège rencontré et corrigé** : l'énoncé KaTeX affiche `-\vec{BE}`
 * (jamais `-1\vec{BE}`) pour `k=-1`, convention mathématique standard déjà en place côté
 * `formatPointVectoriel.ts` ; `formatTraductionAttendueLatex` (`ui/formatRelationVectorielle.ts`)
 * réutilise la même convention pour rester cohérente avec l'énoncé — mais round-trippée telle
 * quelle ("F-B=-(E-B)") à travers `parserNombreOuFraction` seul, `k=-1` échouait systématiquement
 * (`Number("-")` est `NaN`), révélé par le test d'intégration (100 exercices réels, jamais un
 * exemple construit à la main). Corrigé ici plutôt que côté formatage : `""` (coefficient omis) et
 * `"-"` (signe seul) sont désormais des formes reconnues au même titre qu'un nombre/une fraction —
 * l'élève peut donc légitimement écrire `"F-B=-(E-B)"` pour `k=-1`, exactement la notation que
 * l'énoncé lui montre.
 */
function analyserCoefficient(texte: string): number | null {
  if (texte === "") return 1;
  if (texte === "-") return -1;
  return parserNombreOuFraction(texte);
}

/** Un membre isolé de l'équation — "bare" (`F-B`, coefficient implicite 1) ou parenthésé avec
 * coefficient explicite (`k(E-B)`, coefficient éventuellement omis/`"-"` seul, voir
 * `analyserCoefficient`). `null` si le texte ne correspond à aucune des deux formes. */
function analyserTerme(texte: string): Terme | null {
  const parenthese = REGEX_TERME_PARENTHESE.exec(texte);
  if (parenthese) {
    const coefficient = analyserCoefficient(parenthese[1]);
    if (coefficient === null) return null;
    return { coefficient, lettre1: parenthese[2], lettre2: parenthese[3] };
  }

  const bare = REGEX_TERME_BARE.exec(texte);
  if (bare) return { coefficient: 1, lettre1: bare[1], lettre2: bare[2] };

  return null;
}

/** Parseur structurel — jamais une évaluation numérique (voir l'en-tête du fichier). Tolère les
 * espaces (retirés avant analyse) et `*`/multiplication implicite entre le coefficient et la
 * parenthèse, mais exige la structure exacte `membre=membre` (chaque membre `lettre-lettre` ou
 * `coef(lettre-lettre)`, dans n'importe quel ordre) — `null` sur tout texte qui ne s'y conforme pas
 * (parse_error, jamais confondu avec une lettre incorrecte, qui elle reste structurellement
 * valide). */
function analyserTraduction(texteBrut: string): TraductionParsee | null {
  const texte = texteBrut.replace(/\s+/g, "");
  if (texte === "") return null;

  const parties = texte.split("=");
  if (parties.length !== 2) return null;

  const termeGauche = analyserTerme(parties[0]);
  const termeDroit = analyserTerme(parties[1]);
  if (!termeGauche || !termeDroit) return null;

  return { termeGauche, termeDroit };
}

/** Normalise un membre parsé vers une paire de lettres CIBLE (`cible.lettre1 - cible.lettre2`) —
 * accepte l'orientation littérale (`coefficient` inchangé) ET l'orientation inversée
 * (`k(X-Y) = -k(Y-X)`, coefficient négué) : `k(cible.lettre2 - cible.lettre1)` reste une écriture
 * légitime du même terme. `null` si les lettres du membre ne correspondent à la cible dans AUCUN des
 * deux ordres (lettres réellement incorrectes, ex. `B-F` pour une cible `E-B`). */
function normaliserTerme(t: Terme, cible: { lettre1: string; lettre2: string }): number | null {
  if (t.lettre1 === cible.lettre1 && t.lettre2 === cible.lettre2) return t.coefficient;
  if (t.lettre1 === cible.lettre2 && t.lettre2 === cible.lettre1) return -t.coefficient;
  return null;
}

/** Identifie, parmi les deux membres parsés (peu importe leur ordre gauche/droite ni l'orientation
 * des lettres de chacun — voir `normaliserTerme`), le coefficient normalisé du membre qui décrit
 * `pointCherche - labelOrigine` (la cible) et celui du membre qui décrit `labelConnu - labelOrigine`
 * (le vecteur connu) — `null` si aucune des deux affectations n'est possible (lettres réellement
 * incorrectes, ex. les lettres de `pointCherche`/`labelOrigine` n'apparaissent dans aucun membre
 * dans aucun ordre). Jamais un simple test d'égalité de coefficients bruts : c'est cette
 * identification par les LETTRES, pas les valeurs, qui verrouille le sens de chaque vecteur — un
 * couple de lettres qui ne correspond à rien dans aucun ordre reste toujours rejeté. */
function identifierTermes(t1: Terme, t2: Terme, exercice: ExerciceRelationGeneraleRV): { cherche: number; connu: number } | null {
  const cibleCherche = { lettre1: exercice.pointCherche, lettre2: exercice.labelOrigine };
  const cibleConnu = { lettre1: exercice.labelConnu, lettre2: exercice.labelOrigine };

  const chercheDepuisT1 = normaliserTerme(t1, cibleCherche);
  const connuDepuisT2 = normaliserTerme(t2, cibleConnu);
  if (chercheDepuisT1 !== null && connuDepuisT2 !== null) return { cherche: chercheDepuisT1, connu: connuDepuisT2 };

  const chercheDepuisT2 = normaliserTerme(t2, cibleCherche);
  const connuDepuisT1 = normaliserTerme(t1, cibleConnu);
  if (chercheDepuisT2 !== null && connuDepuisT1 !== null) return { cherche: chercheDepuisT2, connu: connuDepuisT1 };

  return null;
}

export function diagnostiquerTraduction(exercice: ExerciceRelationGeneraleRV, texte: string): StatutVerification {
  const parse = analyserTraduction(texte);
  if (!parse) return "parse_error";

  const identifies = identifierTermes(parse.termeGauche, parse.termeDroit, exercice);
  if (!identifies || identifies.cherche === 0) return "not_equivalent";

  const ratio = identifies.connu / identifies.cherche;
  return Math.abs(ratio - exercice.coefficient) < 1e-9 ? "correct" : "not_equivalent";
}

export function verifierTraduction(exercice: ExerciceRelationGeneraleRV, texte: string): boolean {
  return diagnostiquerTraduction(exercice, texte) === "correct";
}
