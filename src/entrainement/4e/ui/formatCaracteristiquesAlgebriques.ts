import type {
  ConditionExistence,
  ExerciceCaracteristiquesAlgebriques,
  ExerciceCaracteristiquesAlgebriquesNiveau1,
  ExerciceNiveau2RacineCarree,
  ExerciceNiveau2ValeurAbsolue,
  Fraction,
} from "../core/caracteristiquesAlgebriques.types";
import type { Morceau } from "../core/inequation.types";
import type { FamilleReference } from "../core/fonctionsReference.types";
import { evaluerNiveau1, existeOrdonneeNiveau1 } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatFractionIrreductible } from "./formatFraction";
import { formatEnonceLatex, formatSommeTermes } from "./formatEquation";

/**
 * Présentation — "Caractéristiques algébriques d'une fonction de référence" (niveau 1). Aucun
 * graphique (générateur purement algébrique) : la formule `f(x) = [base](ax+b) + k` est rappelée
 * en KaTeX sur chacun des écrans, via `formatEquationNiveau1Latex` ci-dessous.
 */

/** `ax+b`, rendu LaTeX — coefficient 1/-1 jamais explicite, terme `b` omis s'il est nul, signe
 * adapté (jamais `+ -3`). Même convention que le reste du projet pour un polynôme du 1er degré. */
export function formatP1Latex(a: number, b: number): string {
  const terme1 = a === 1 ? "x" : a === -1 ? "-x" : `${a}x`;
  if (b === 0) return terme1;
  return b > 0 ? `${terme1} + ${b}` : `${terme1} - ${-b}`;
}

/** Même rendu que `formatP1Latex`, mais toujours valide comme texte évaluable par
 * `evaluerExpressionGenerale` (`src/moteur/expressionGenerale.ts`) — utilisé pour construire les
 * exemples de champ libre et vérifié dans `session.integration.test.ts`. Identique à
 * `formatP1Latex` (la notation `ax+b` est déjà directement évaluable, la multiplication implicite
 * `ax` étant reconnue nativement) — nommée séparément pour ne jamais coupler les deux usages par
 * accident si l'un venait à diverger (ex. adaptation LaTeX future non évaluable telle quelle).
 */
export function formatBaseArgumentP1Latex(a: number, b: number): string {
  return formatP1Latex(a, b);
}

/** `[base](interieur)` — LaTeX de la fonction de référence appliquée à une expression quelconque.
 * Exportée (au-delà de son usage interne à ce fichier) pour composer les consignes qui doivent
 * citer l'expression réellement affichée à l'écran (jamais une lettre-code de conception, ex. "P1")
 * — voir `EtapeIsolementNiveau1.tsx`, familles `carre`/`cube` niveau 2. */
export function formatBaseLatex(famille: FamilleReference, interieur: string): string {
  switch (famille) {
    case "valeur_absolue":
      return `\\left|${interieur}\\right|`;
    case "carre":
      return `\\left(${interieur}\\right)^2`;
    case "cube":
      return `\\left(${interieur}\\right)^3`;
    case "racine_carree":
      return `\\sqrt{${interieur}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${interieur}}`;
    case "inverse":
      return `\\frac{1}{${interieur}}`;
  }
}

/** Fraction irréductible en LaTeX — entier nu si `den=1`, jamais un `n/1`. Signe porté par le
 * numérateur (`num<0`), jamais par le dénominateur (garanti par la construction du générateur). */
export function formatFractionLatex(fraction: Fraction): string {
  if (fraction.den === 1) return `${fraction.num}`;
  const abs = `\\frac{${Math.abs(fraction.num)}}{${fraction.den}}`;
  return fraction.num < 0 ? `-${abs}` : abs;
}

/**
 * `k(x)=cx+d`, rendu comme la CONTINUATION d'une somme déjà commencée (`f(x) = base + k(x)`),
 * signe toujours DISTRIBUÉ — jamais `+ (-26x+18)`, toujours `- 26x + 18`
 * (`prompt-corrections-niveau2-tests.md`, point 1 : plus aucune parenthèse ni signe non distribué
 * autour de `k`, sur aucun écran). Passe par `formatSommeTermes` (le moteur de formatage
 * centralisé déjà utilisé partout ailleurs dans le projet pour composer une somme de termes
 * signés), jamais une concaténation de signe ad hoc.
 */
function formatKLineaireSuite(c: number, d: number): string {
  return formatSommeTermes([{ valeur: c, suffixe: "x" }, { valeur: d, suffixe: "" }], true);
}

/** `[base](ax+b) + k`, le membre gauche partagé par `formatEquationNiveau1Latex` (préfixé `f(x) =`)
 * et `formatEquationRechercheZerosLatex` (suffixé `= 0`) ci-dessous — jamais dupliqué entre les
 * deux. */
function formatMembreGaucheNiveau1Latex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  const interieur = formatP1Latex(exercice.a, exercice.b);
  const base = formatBaseLatex(exercice.famille, interieur);

  if (exercice.niveau === "niveau2") {
    return `${base} ${formatKLineaireSuite(exercice.c, exercice.d)}`;
  }

  const { k } = exercice;
  const kLatex = formatFractionLatex(k);
  const terme = k.num > 0 ? ` + ${kLatex}` : ` - ${formatFractionLatex({ num: -k.num, den: k.den })}`;
  return `${base}${terme}`;
}

/** `f(x) = [base](ax+b) + k` — le terme `k` toujours affiché (jamais nul par construction),
 * signe adapté. Niveau 2 (`prompt-niveau2caracteristiquesalgebriques.md`, corrigé par
 * `prompt-corrections-niveau2-tests.md`, point 1) : `k` devient `k(x)=cx+d`, un vrai polynôme du
 * 1er degré — désormais distribué (`formatKLineaireSuite`), jamais entre parenthèses. Réservée aux
 * écrans qui portent sur `f` elle-même (ordonnée à l'origine, conditions d'existence, domaine,
 * condition de validité — `prompt-corrections-niveau2-vague2.md`, point 1) ; les écrans de la
 * séquence "zéros" (isolement/regroupe/résultat) utilisent `formatEquationRechercheZerosLatex`
 * ci-dessous à la place. */
export function formatEquationNiveau1Latex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  return `f(x) = ${formatMembreGaucheNiveau1Latex(exercice)}`;
}

/**
 * `[base](ax+b) + k = 0` — l'équation posée pour la recherche des zéros, SANS le préfixe `f(x) =`
 * (`prompt-corrections-niveau2-vague2.md`, point 1 : l'encadré du haut des écrans de la séquence
 * "zéros" — isolement/regroupe, écran de résultat — n'affiche plus `f(x) = ...` mais directement
 * l'équation à résoudre). Réutilise `formatMembreGaucheNiveau1Latex` — jamais une seconde
 * composition indépendante du membre gauche.
 */
export function formatEquationRechercheZerosLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  return `${formatMembreGaucheNiveau1Latex(exercice)} = 0`;
}

/** `-k` (niveau 1, fraction) ou `-cx-d` (niveau 2, linéaire négé et DISTRIBUÉ — jamais
 * `-(cx+d)` non simplifié) — le membre droit attendu de l'étape "isolement"
 * (`[base](P1) = ...`), et le terme réutilisé par `formatEquationIsoleeLatex`/
 * `formatMoinsKDistribueLatex` ci-dessous. */
function formatMoinsKLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  if (exercice.niveau === "niveau2") {
    return formatMoinsKDistribueLatex(exercice.c, exercice.d);
  }
  return formatFractionLatex({ num: -exercice.k.num, den: exercice.k.den });
}

/** `-(cx+d)` distribué — `-cx-d` — jamais un signe non simplifié devant une parenthèse. Exportée
 * pour composer les consignes qui doivent citer cette expression réelle (jamais une notation
 * générique), ex. "validité de l'équation" pour `racine_carree` (le membre de droite de l'équation
 * isolée). */
export function formatMoinsKDistribueLatex(c: number, d: number): string {
  return formatSommeTermes([{ valeur: -c, suffixe: "x" }, { valeur: -d, suffixe: "" }]);
}

/** Texte d'exemple (attribut `placeholder`) pour le champ "isolement" — un exemple par famille,
 * dans la syntaxe reconnue par `evaluerExpressionGenerale`. */
export function placeholderIsolement(famille: FamilleReference): string {
  switch (famille) {
    case "valeur_absolue":
      return "ex : abs(2x+3) = 1/2";
    case "carre":
      return "ex : (2x+3)^2 = 25/16";
    case "cube":
      return "ex : (3x+1)^3 = -8/27";
    case "racine_carree":
      return "ex : sqrt(2x-4) = 1/2";
    case "racine_cubique":
      return "ex : cbrt(3x+1) = -1/4";
    case "inverse":
      return "ex : 1/(2x+4) = -1/3";
  }
}

/**
 * Texte d'exemple (attribut `placeholder`) pour les champs numériques simples "f(0)" et "zéro"
 * (`EtapeOrdonneeAlgebrique.tsx`/`EtapeZerosAlgebrique.tsx`) — un exemple par famille, jamais le
 * même exemple générique `sqrt(...)` réutilisé pour toutes (`prompt-corrections-
 * caracteristiquesalgebriques.md`, point 1 : un placeholder `sqrt(...)` était affiché même pour la
 * famille `racine_cubique`, dont l'exemple pertinent utilise `cbrt(...)`). Seules `racine_carree`/
 * `racine_cubique` peuvent produire une valeur irrationnelle sur ces deux champs (`f(0)` uniquement
 * — `sqrt(b)`/`cbrt(b)` pour un `b` quelconque, pas nécessairement une puissance parfaite ; les
 * zéros, eux, sont toujours rationnels pour les 6 familles par construction, voir `zerosNiveau1`) —
 * les 4 autres familles reçoivent un exemple en fraction simple, jamais un radical hors-sujet.
 */
export function placeholderExpressionNumerique(famille: FamilleReference): string {
  switch (famille) {
    case "valeur_absolue":
      return "ex : 5/4";
    case "carre":
      return "ex : -5/4";
    case "cube":
      return "ex : 8/27";
    case "racine_carree":
      return "ex : sqrt(5)-3/5";
    case "racine_cubique":
      return "ex : cbrt(5)-3/5";
    case "inverse":
      return "ex : -3/5";
  }
}

/**
 * Instruction de l'étape "isolement" (`prompt-corrections-ecrans-zeros.md`, point 3) — un texte
 * spécifique à la famille RÉELLEMENT générée ("isole la valeur absolue", "isole la racine
 * carrée"...), jamais le gabarit générique `[base]` affiché littéralement à l'élève. Rappelle
 * explicitement l'objectif `f(x)=0` dans le texte lui-même : l'énoncé (`equation-box`) n'affiche
 * plus jamais `=0` (point 2), ce contexte doit donc être porté par l'instruction.
 */
export function instructionIsolement(famille: FamilleReference): string {
  switch (famille) {
    case "valeur_absolue":
      return "Pour résoudre f(x) = 0, isole la valeur absolue.";
    case "carre":
      return "Pour résoudre f(x) = 0, isole le carré.";
    case "cube":
      return "Pour résoudre f(x) = 0, isole le cube.";
    case "racine_carree":
      return "Pour résoudre f(x) = 0, isole la racine carrée.";
    case "racine_cubique":
      return "Pour résoudre f(x) = 0, isole la racine cubique.";
    case "inverse":
      return "Pour résoudre f(x) = 0, isole l'inverse.";
  }
}

/** Convertit le texte "p/q" (ou l'entier nu) de `formatFractionIrreductible` en LaTeX
 * (`\frac{p}{q}`, ou l'entier tel quel) — réutilise la recherche de dénominateur borné déjà
 * construite pour l'exercice "Analyse d'une fonction" plutôt que de la dupliquer une seconde fois.
 * Le signe est porté DEVANT la fraction (`-\frac{p}{q}`), jamais dans le numérateur
 * (`\frac{-p}{q}`) — même convention que `formatFractionLatex`. */
function versLatex(texteFraction: string): string {
  const [num, den] = texteFraction.split("/");
  if (den === undefined) return texteFraction;
  return num.startsWith("-") ? `-\\frac{${num.slice(1)}}{${den}}` : `\\frac{${num}}{${den}}`;
}

/**
 * Empile deux équations (ou plus) sur des lignes SÉPARÉES plutôt que côte à côte sur une seule
 * ligne (`prompt-corrections-caracteristiquesalgebriques.md`, point 2) — l'ancien rendu
 * `eq1 \quad \text{ou} \quad eq2` dépassait la largeur de l'écran sur mobile dès que les deux
 * équations étaient un peu longues. `\begin{gathered}...\end{gathered}` (même mécanisme déjà
 * utilisé par `calculerEtatActuelCaracteristiquesAlgebriques` pour empiler l'équation isolée et
 * l'équation "débarrassée") : chaque équation sur sa propre ligne, "ou" centré entre les deux.
 * Seul point d'appel de ce motif dans ce moteur pour l'instant (`formatEquationsSepareesLatex`
 * ci-dessous) — exportée pour rester le point de réutilisation unique si un futur écran de cet
 * exercice affiche à son tour plusieurs équations côte à côte.
 */
export function formatDeuxEquationsLatex(equation1: string, equation2: string): string {
  return `\\begin{gathered} ${equation1} \\\\ \\text{ou} \\\\ ${equation2} \\end{gathered}`;
}

/** Coefficients de `(px+q)³+(rx+s)` développé — pour les familles sans équation `Exercice`
 * embarquée (degré 3, hors du contrat de l'exercice "méthode la plus rapide") : `cube` l'appelle
 * avec `(p,q,r,s)=(a,b,c,d)` (élever le côté BASE au cube redonne directement `f(x)`, voir
 * `verifierDeveloppementEgaleZero`) ; `racine_cubique` l'appelle avec `(p,q,r,s)=(c,d,a,b)` — après
 * élévation au cube des deux membres de `∛(ax+b)=-(cx+d)`, c'est le côté `k(x)` qui se retrouve
 * élevé au cube (`ax+b=-(cx+d)³`), jamais le côté base (voir `verifierRegroupe`). */
function coefficientsCubeDeveloppe(p: number, q: number, r: number, s: number): [number, number, number, number] {
  return [p * p * p, 3 * p * p * q, 3 * p * q * q + r, q * q * q + s];
}

/**
 * Équation développée de référence — les 4 familles niveau 2 qui produisent une équation
 * intermédiaire à un moment ou un autre de la séquence "zéros" (`prompt-corrections-niveau2-
 * vague2.md`) :
 * - `carre`/`inverse`/`racine_carree` : le polynôme du 2nd degré déjà embarqué
 *   (`exercice.zeros.enonce`, `formatEnonceLatex` réutilisée telle quelle).
 * - `cube` : le développement direct du cube (côté base élevé au cube, `coefficientsCubeDeveloppe
 *   (a,b,c,d)`), rendu via le même moteur centralisé (`formatSommeTermes`) que le reste de ce
 *   fichier — jamais une chaîne composée à la main.
 * - `racine_cubique` : le développement direct après élévation au cube (côté `k(x)` élevé au cube,
 *   `coefficientsCubeDeveloppe(c,d,a,b)` — arguments PERMUTÉS, voir sa documentation).
 * Utilisée à la fois par le bloc "état actuel"/la révélation des étapes "isolement"/"regroupe" une
 * fois confirmées (voir `formatEquationIsoleeLatex` ci-dessous) et par l'instruction de l'étape
 * "isolement" pour `carre`/`cube` (le développement AVANT regroupement, voir
 * `EtapeIsolementNiveau1.tsx`, qui compose plutôt `formatBaseLatex` directement pour n'afficher QUE
 * le carré/cube non développé). `valeur_absolue` n'atteint jamais cette fonction (son regroupement
 * est implicite dans `resolutionBranches`, voir `formatBranchesAvecConditionsLatex`).
 */
export function formatEquationDeveloppeeLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  if (exercice.niveau !== "niveau2") {
    throw new Error("formatEquationDeveloppeeLatex : uniquement pour le niveau 2");
  }
  if (exercice.famille === "carre" || exercice.famille === "inverse" || exercice.famille === "racine_carree") {
    return formatEnonceLatex(exercice.zeros.enonce);
  }
  if (exercice.famille === "valeur_absolue") {
    throw new Error("formatEquationDeveloppeeLatex : valeur_absolue n'a pas d'équation regroupée (voir formatBranchesAvecConditionsLatex)");
  }
  const [A, B, C, D] =
    exercice.famille === "cube"
      ? coefficientsCubeDeveloppe(exercice.a, exercice.b, exercice.c, exercice.d)
      : coefficientsCubeDeveloppe(exercice.c, exercice.d, exercice.a, exercice.b);
  const gauche = formatSommeTermes([
    { valeur: A, suffixe: "x^3" },
    { valeur: B, suffixe: "x^2" },
    { valeur: C, suffixe: "x" },
    { valeur: D, suffixe: "" },
  ]);
  return `${gauche} = 0`;
}

/** `[base](ax+b) = -k` (niveau 1) ou `[base](ax+b) = -cx-d` (niveau 2) — la forme isolée de
 * référence (jamais la saisie de l'élève, toujours dérivée directement de l'exercice), utilisée
 * par le bloc "état actuel" une fois l'étape "isolement" confirmée
 * (`prompt-corrections-ecrans-zeros.md`, point 2). `carre`/`cube` (niveau 2) délèguent à
 * `formatEquationDeveloppeeLatex` ci-dessus — cette étape n'y demande plus d'isoler
 * `[base](P1)=-k(x)` mais de développer et regrouper (`prompt-corrections-niveau2-tests.md`,
 * point 3). */
export function formatEquationIsoleeLatex(exercice: ExerciceCaracteristiquesAlgebriques): string {
  if (exercice.niveau === "niveau2" && (exercice.famille === "carre" || exercice.famille === "cube")) {
    return formatEquationDeveloppeeLatex(exercice);
  }
  const interieur = formatP1Latex(exercice.a, exercice.b);
  const base = formatBaseLatex(exercice.famille, interieur);
  return `${base} = ${formatMoinsKLatex(exercice)}`;
}

/** Les deux équations séparées de référence (niveau 1, `valeur_absolue`/`carre` uniquement —
 * n'existe pas au niveau 2, voir `ExerciceNiveau2ValeurAbsolue`/`formatBranchesLatex` ci-dessous)
 * — utilisée par le bloc "état actuel" de l'écran "zéros" qui suit la séparation, une fois
 * celle-ci confirmée. */
export function formatEquationsSepareesLatex(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): string {
  const p1 = formatP1Latex(exercice.a, exercice.b);
  const moinsK = formatFractionLatex({ num: -exercice.k.num, den: exercice.k.den });

  if (exercice.famille === "valeur_absolue") {
    const moinsP1 = formatP1Latex(-exercice.a, -exercice.b);
    return formatDeuxEquationsLatex(`${p1} = ${moinsK}`, `${moinsP1} = ${moinsK}`);
  }

  const kValeur = exercice.k.num / exercice.k.den;
  const racineMoinsK = versLatex(formatFractionIrreductible(Math.sqrt(-kValeur)));
  return formatDeuxEquationsLatex(`${p1} = ${racineMoinsK}`, `${p1} = -${racineMoinsK}`);
}

/**
 * Instruction de l'étape "se débarrasser de..." (`prompt-3-ameliorations-finales.md`, point 2) —
 * `inverse`/`racine_carree`/`racine_cubique`/`cube` uniquement (miroir de `instructionIsolement`
 * pour les 2 autres familles) : un texte spécifique à l'opération réellement nécessaire pour
 * chacune de ces 4 familles, jamais un texte générique.
 */
export function instructionDebarrasser(famille: FamilleReference): string {
  switch (famille) {
    case "inverse":
      return "Débarrasse-toi du dénominateur : réécris l'équation sans fraction.";
    case "racine_carree":
      return "Débarrasse-toi de la racine carrée : élève les deux membres au carré.";
    case "racine_cubique":
      return "Débarrasse-toi de la racine cubique : élève les deux membres au cube.";
    case "cube":
      return "Débarrasse-toi du cube : extrais la racine cubique des deux membres.";
    case "valeur_absolue":
    case "carre":
      return "";
  }
}

/** Coefficient·(ax+b), rendu LaTeX — JAMAIS de parenthèses inutiles autour d'un simple signe :
 * coefficient `±1` distribue directement dans `ax+b` (`formatP1Latex`, jamais un `±(...)` collé,
 * `prompt-corrections-niveau2-tests.md`, point 1) ; sinon `coefficient·(ax+b)` garde ses
 * parenthèses — un vrai produit, pas un signe à distribuer. */
function produitCoefficientLatex(coefficient: Fraction, a: number, b: number): string {
  if (coefficient.num === 1 && coefficient.den === 1) return formatP1Latex(a, b);
  if (coefficient.num === -1 && coefficient.den === 1) return formatP1Latex(-a, -b);
  return `${formatFractionLatex(coefficient)}\\left(${formatP1Latex(a, b)}\\right)`;
}

/** Carré exact d'une fraction déjà irréductible — reste irréductible (le carré de deux entiers
 * coprems reste coprime), aucune réduction supplémentaire nécessaire. */
function carreFraction(f: Fraction): Fraction {
  return { num: f.num * f.num, den: f.den * f.den };
}

/** Cube exact d'une fraction déjà irréductible — même remarque que `carreFraction`. */
function cubeFraction(f: Fraction): Fraction {
  return { num: f.num * f.num * f.num, den: f.den * f.den * f.den };
}

/**
 * L'équation "débarrassée" de référence (`inverse`/`racine_carree`/`racine_cubique`/`cube`
 * uniquement) — utilisée par le bloc "état actuel" de l'écran "zéros" qui suit cette étape, une
 * fois celle-ci confirmée :
 * - `inverse` : `1 = (-k)(ax+b)` (produit en croix, jamais de fraction restante).
 * - `racine_carree` : `ax+b = (-k)²` — toujours exact par arithmétique entière (le carré d'un
 *   rationnel reste rationnel), aucune recherche de dénominateur nécessaire.
 * - `racine_cubique` : `ax+b = (-k)³` — même remarque, exact par arithmétique entière.
 * - `cube` : `ax+b = ∛(-k)` — `-k` est garanti être le cube exact d'un rationnel par construction
 *   (voir le générateur), mais l'EXTRACTION de cette racine cubique n'est pas une opération
 *   d'arithmétique entière directe : réutilise la même recherche de dénominateur borné que
 *   `formatEquationsSepareesLatex` (famille `carre`) plutôt que de la dupliquer une seconde fois.
 * Niveau 1 uniquement — l'étape "se débarrasser de..." n'existe pas au niveau 2 (`k` n'y est plus
 * une constante, voir `core/caracteristiquesAlgebriques.types.ts`).
 */
export function formatEquationDebarrasseeLatex(exercice: ExerciceCaracteristiquesAlgebriquesNiveau1): string {
  const p1 = formatP1Latex(exercice.a, exercice.b);
  const moinsK: Fraction = { num: -exercice.k.num, den: exercice.k.den };

  switch (exercice.famille) {
    case "inverse":
      return `1 = ${produitCoefficientLatex(moinsK, exercice.a, exercice.b)}`;
    case "racine_carree":
      return `${p1} = ${formatFractionLatex(carreFraction(moinsK))}`;
    case "racine_cubique":
      return `${p1} = ${formatFractionLatex(cubeFraction(moinsK))}`;
    case "cube": {
      const kValeur = exercice.k.num / exercice.k.den;
      const racineCubiqueMoinsK = versLatex(formatFractionIrreductible(Math.sign(-kValeur) * Math.pow(Math.abs(-kValeur), 1 / 3)));
      return `${p1} = ${racineCubiqueMoinsK}`;
    }
    case "valeur_absolue":
    case "carre":
      return "";
  }
}

/**
 * Formatage EXACT du panneau de révélation final (`ResultatPanelCaracteristiquesAlgebriques.tsx`,
 * `prompt-corrections-caracteristiquesalgebriques.md`, point 3) — jamais une approximation
 * décimale (`toFixed`) : réutilise le même moteur de recherche de fraction exacte déjà en place
 * partout ailleurs dans le projet (`formatFractionIrreductible`, `ui/formatFraction.ts`, déjà
 * consommée par ce fichier pour l'extraction `∛(-k)` de `formatEquationDebarrasseeLatex`
 * ci-dessus), converti en véritable LaTeX (`versLatex`) plutôt qu'en simple texte "p/q" — pour que
 * le panneau de révélation, comme le reste de l'application, rende ses valeurs via KaTeX.
 */
export function formatValeurExacteLatex(valeur: number): string {
  return versLatex(formatFractionIrreductible(valeur));
}

/** Racine entière exacte de `n` à l'ordre `ordre` (2 ou 3), ou `null` si `n` n'est pas une
 * puissance parfaite de cet ordre — distingue le cas rationnel (b est un carré/cube parfait, la
 * valeur se réduit alors à une fraction exacte comme les 4 autres familles) du cas irrationnel
 * (voir `formatOrdonneeExacteLatex`). */
function racineParfaite(n: number, ordre: 2 | 3): number | null {
  if (ordre === 2 && n < 0) return null;
  const candidat = Math.round(ordre === 2 ? Math.sqrt(n) : Math.sign(n) * Math.pow(Math.abs(n), 1 / 3));
  return Math.pow(candidat, ordre) === n ? candidat : null;
}

/** `k(0)` sous forme `Fraction` — `k` lui-même au niveau 1 (constant, indépendant de `x`), `d` au
 * niveau 2 (`k(x)=cx+d`, toujours un entier ici — `Fraction{num:d,den:1}`) : réutilisé par
 * `formatOrdonneeExacteLatex` pour rester une seule et même logique aux deux niveaux. */
function kEnZeroCommeFraction(exercice: ExerciceCaracteristiquesAlgebriques): Fraction {
  return exercice.niveau === "niveau1" ? exercice.k : { num: exercice.d, den: 1 };
}

/**
 * Valeur exacte de `f(0)` en LaTeX, pour le panneau de révélation — `null` si l'ordonnée à
 * l'origine n'existe pas (0 hors domaine, `inverse`/`racine_carree`). Fraction irréductible pour
 * les 4 familles toujours rationnelles (`valeur_absolue`/`carre`/`cube`/`inverse`, ainsi que
 * `racine_carree`/`racine_cubique` quand `b` est une puissance parfaite) ; pour `racine_carree`/
 * `racine_cubique` avec un `b` qui n'est PAS une puissance parfaite, `f(0)` est authentiquement
 * irrationnel — jamais approximé en décimal, exprimé sous forme symbolique exacte
 * (`\sqrt{b}+k(0)`/`\sqrt[3]{b}+k(0)`) en réutilisant la même notation radicale que
 * `formatBaseLatex` ci-dessus, jamais une seconde logique de rendu séparée. Fonctionne
 * identiquement aux deux niveaux (`kEnZeroCommeFraction` généralise `k` en `k(0)`).
 */
export function formatOrdonneeExacteLatex(exercice: ExerciceCaracteristiquesAlgebriques): string | null {
  if (!existeOrdonneeNiveau1(exercice)) return null;

  const { famille, b } = exercice;
  if (famille === "racine_carree" || famille === "racine_cubique") {
    const ordre = famille === "racine_carree" ? 2 : 3;
    if (racineParfaite(b, ordre) === null) {
      const base = famille === "racine_carree" ? `\\sqrt{${b}}` : `\\sqrt[3]{${b}}`;
      const k = kEnZeroCommeFraction(exercice);
      const kLatex = formatFractionLatex(k.num > 0 ? k : { num: -k.num, den: k.den });
      return k.num > 0 ? `${base} + ${kLatex}` : `${base} - ${kLatex}`;
    }
  }
  return formatValeurExacteLatex(evaluerNiveau1(exercice, 0));
}

const SYMBOLE_CE_LATEX: Record<ConditionExistence["symbole"], string> = {
  "≠": "\\neq",
  ">": ">",
  "≥": "\\geq",
  "<": "<",
  "≤": "\\leq",
};

/** Conditions d'existence attendues, en LaTeX — `null` s'il n'y en a aucune (le composant affiche
 * alors "aucune" en texte simple, jamais du KaTeX vide). Valeurs toujours rationnelles par
 * construction (`p = -b/a`, deux entiers), formatées via le même moteur exact que le reste du
 * panneau (`formatValeurExacteLatex`). */
export function formatCEAttenduesLatex(conditions: ConditionExistence[]): string | null {
  if (conditions.length === 0) return null;
  return conditions.map((c) => `x ${SYMBOLE_CE_LATEX[c.symbole]} ${formatValeurExacteLatex(c.valeur)}`).join(" \\text{ et } ");
}

/** Zéros attendus, en LaTeX — `null` s'il n'y en a aucun (le composant affiche alors "aucun" en
 * texte simple). Toujours rationnels pour les 6 familles par construction (voir `zerosNiveau1`),
 * jamais un décimal bruité. */
export function formatZerosAttendusLatex(zeros: number[]): string | null {
  if (zeros.length === 0) return null;
  return zeros.map(formatValeurExacteLatex).join(" \\text{ ; } ");
}

/** Version "bloc fitter" de `formatZerosAttendusLatex` (`promptblocfittertousgenerateurs.md`) —
 * un fragment KaTeX par zéro (jusqu'à 3 pour les familles `cube`/`racine_cubique` de niveau 2)
 * plutôt qu'une seule chaîne `\text{ ; }`-jointe. `null` s'il n'y en a aucun, comme la fonction
 * d'origine. */
export function formatTermesZerosAttendusLatex(zeros: number[]): string[] | null {
  if (zeros.length === 0) return null;
  return zeros.map(formatValeurExacteLatex);
}

/* ==========================================================================================
 * NIVEAU 2 — condition de validité, validation d'une solution, résolution des branches, zéros de
 * P3 (`prompt-niveau2caracteristiquesalgebriques.md`)
 * ========================================================================================== */

/** `x ≥ v` / `x > v` / `x ≤ v` / `x < v` — rend un `Morceau` DEMI-DROITE (toujours l'un des deux
 * côtés infini) sous forme d'inégalité "en toutes lettres", plutôt que la notation crochets
 * `[v;+∞[` : c'est exactement la formulation demandée pour les questions Oui/Non de l'étape
 * "validation d'une solution" (section UX du prompt, "ex. x ≥ 2") et pour le rappel de condition à
 * côté de chaque branche (`formatBranchesAvecConditionsLatex` ci-dessous). Valeur exacte
 * (`formatValeurExacteLatex`), jamais un décimal.
 */
export function formatConditionLatex(m: Morceau): string {
  if (typeof m.borneGauche === "number") {
    const symbole = m.crochetGauche === "[" ? "\\geq" : ">";
    return `x ${symbole} ${formatValeurExacteLatex(m.borneGauche)}`;
  }
  const symbole = m.crochetDroit === "]" ? "\\leq" : "<";
  return `x ${symbole} ${formatValeurExacteLatex(m.borneDroite as number)}`;
}

/** Négation d'un `Morceau` demi-droite, en toutes lettres — jamais construite comme un second
 * `Morceau` (la négation d'une demi-droite fermée est l'autre demi-droite, ouverte à la même
 * borne), directement dérivée ici pour l'affichage de la branche 2 de `valeur_absolue`
 * (`P1<0`, la négation de la condition `P1≥0` de la branche 1). */
export function formatConditionNegeeLatex(m: Morceau): string {
  if (typeof m.borneGauche === "number") {
    const symbole = m.crochetGauche === "[" ? "<" : "\\leq";
    return `x ${symbole} ${formatValeurExacteLatex(m.borneGauche)}`;
  }
  const symbole = m.crochetDroit === "]" ? ">" : "\\geq";
  return `x ${symbole} ${formatValeurExacteLatex(m.borneDroite as number)}`;
}

/** Version TEXTE BRUT (jamais LaTeX) de `formatConditionLatex`/`formatConditionNegeeLatex` — pour
 * les endroits qui ne peuvent pas rendre du KaTeX (`<label>` de champ ordinaire, `aria-label`) —
 * `prompt-corrections-niveau2-vague3.md`, point 3 : les labels des champs de saisie de
 * `EtapeResolutionBranches.tsx` (famille `valeur_absolue`) affichent désormais la condition réelle
 * de l'exercice plutôt qu'un texte générique "branche 1/2". Symboles unicode (`≥`/`≤`/`>`/`<`),
 * jamais leur équivalent LaTeX (`\geq`/`\leq`) ; valeur exacte (`formatFractionIrreductible`),
 * jamais un décimal bruité. */
export function formatConditionTexte(m: Morceau): string {
  if (typeof m.borneGauche === "number") {
    const symbole = m.crochetGauche === "[" ? "≥" : ">";
    return `x ${symbole} ${formatFractionIrreductible(m.borneGauche)}`;
  }
  const symbole = m.crochetDroit === "]" ? "≤" : "<";
  return `x ${symbole} ${formatFractionIrreductible(m.borneDroite as number)}`;
}

/** Négation, texte brut — même principe que `formatConditionNegeeLatex`. */
export function formatConditionNegeeTexte(m: Morceau): string {
  if (typeof m.borneGauche === "number") {
    const symbole = m.crochetGauche === "[" ? "<" : "≤";
    return `x ${symbole} ${formatFractionIrreductible(m.borneGauche)}`;
  }
  const symbole = m.crochetDroit === "]" ? ">" : "≥";
  return `x ${symbole} ${formatFractionIrreductible(m.borneDroite as number)}`;
}

/**
 * Phrase de transition affichée en tête de l'étape "condition de validité de l'équation" (niveau
 * 2, `racine_carree`/`valeur_absolue`) — reprend le texte suggéré par le prompt, section UX :
 * distingue explicitement cette condition du domaine de `f` (déjà établi à l'étape "domaine",
 * avant `isolement`).
 */
export const TRANSITION_CONDITION_VALIDITE =
  "Attention, il ne s'agit pas ici du domaine de f (déjà déterminé plus haut), mais d'une condition supplémentaire pour que l'équation ci-dessus ait un sens.";

/**
 * Consigne de l'étape "condition de validité" — remplace l'ancien texte à notation générique
 * (`-k(x) ≥ 0` / `P1(x) ≥ 0`, du jargon de conception jamais montré à l'élève) par l'expression
 * RÉELLEMENT concernée, rendue en LaTeX (`prompt-corrections-niveau2-tests.md`, point 2) :
 * `racine_carree` — le membre de droite de l'équation isolée (`-cx-d`, le carré n'étant réversible
 * que dans ce sens) ; `valeur_absolue` — le contenu À L'INTÉRIEUR de la valeur absolue (`ax+b`, la
 * frontière entre les deux branches), jamais le membre de droite comme pour `racine_carree`.
 * Retourne la partie LaTeX seule (composée en JSX par `EtapeConditionValidite.tsx`, jamais
 * enveloppée dans un unique bloc `\text{...}` monolithique — même piège déjà rencontré et corrigé
 * pour `EtapeValidationSolution.tsx`, voir sa section dédiée).
 */
export function expressionConditionValiditeLatex(exercice: ExerciceNiveau2RacineCarree | ExerciceNiveau2ValeurAbsolue): string {
  return exercice.famille === "racine_carree"
    ? formatMoinsKDistribueLatex(exercice.c, exercice.d)
    : formatP1Latex(exercice.a, exercice.b);
}

/**
 * Les deux équations de branche de `valeur_absolue` (niveau 2), chacune avec sa condition de
 * signe positionnée EN DESSOUS d'elle (`prompt-corrections-niveau2-vague2.md`, point 4a — jamais
 * sur la même ligne à droite comme avant, un bloc vertical à 5 lignes : équation/condition/"ou"/
 * équation/condition) : `P1 = -k(x)` (signe DISTRIBUÉ, `-cx-d`, jamais `-(cx+d)` —
 * `prompt-corrections-niveau2-tests.md`, point 1) puis la condition `P1≥0` (`conditionValidite`
 * telle quelle) ; `P1 = k(x)` puis la condition `P1<0` (la NÉGATION de `conditionValidite`,
 * `formatConditionNegeeLatex`).
 */
export function formatBranchesAvecConditionsLatex(a: number, b: number, c: number, d: number, conditionValidite: Morceau): string {
  const p1 = formatP1Latex(a, b);
  const moinsK = formatMoinsKDistribueLatex(c, d);
  const kLatex = formatP1Latex(c, d);
  const cond1 = formatConditionLatex(conditionValidite);
  const cond2 = formatConditionNegeeLatex(conditionValidite);
  return `\\begin{gathered} ${p1} = ${moinsK} \\\\ (${cond1}) \\\\ \\text{ou} \\\\ ${p1} = ${kLatex} \\\\ (${cond2}) \\end{gathered}`;
}

/**
 * Consigne de l'étape "zéros" — texte générique unique pour toutes les familles/niveaux depuis
 * `prompt-corrections-niveau2-vague2.md` : le travail d'élévation/regroupement a désormais TOUJOURS
 * lieu à une étape antérieure ("isolement" pour `carre`/`cube`, "regroupe" pour `inverse`/
 * `racine_carree`/`racine_cubique`, voir `instructionRegroupe` ci-dessous) — cette étape ne demande
 * plus jamais de refaire ce travail, seulement de donner le résultat final (les zéros).
 */
export const INSTRUCTION_ZEROS = "Quels sont les zéros de cette fonction ?";

/**
 * Consigne de l'étape "regroupe" (niveau 2, `inverse`/`racine_carree`/`racine_cubique` uniquement —
 * `prompt-corrections-niveau2-vague2.md`, point 2) : langage mathématique standard, jamais de
 * notation de conception (P1/k/P3). Insérée après `isolement` (`inverse`/`racine_cubique`) ou après
 * `validite` (`racine_carree`) — voir `necessiteRegroupe`, `sessionCaracteristiquesAlgebriques.ts`.
 */
export function instructionRegroupe(famille: "inverse" | "racine_carree" | "racine_cubique"): string {
  switch (famille) {
    case "inverse":
      return "Multiplie les deux membres par le dénominateur et regroupe tous les termes du même côté pour obtenir une équation du second degré.";
    case "racine_carree":
      return "Élève chaque membre au carré et regroupe les termes dans un membre pour obtenir une équation du second degré.";
    case "racine_cubique":
      return "Élève les deux membres au cube et regroupe tous les termes du même côté pour obtenir une équation du troisième degré.";
  }
}

/**
 * Texte d'exemple (attribut `placeholder`) pour le champ libre de l'étape "regroupe" —
 * `inverse`/`racine_carree` : une équation du 2nd degré développée ; `racine_cubique` : une
 * équation du 3e degré développée, même exemple que `cube` (`prompt-corrections-niveau2-vague2.md`,
 * points 2-3 — un exemple d'équation RÉELLEMENT regroupée, jamais une forme isolée). Réutilisée
 * aussi par `EtapeIsolementNiveau1.tsx` pour `carre`/`cube`, dont l'étape "isolement" EST l'étape
 * "regroupe" — jamais le placeholder `placeholderIsolement` (hérité de l'ancienne consigne "isole
 * ..."), qui resterait incohérent avec la nouvelle consigne "développe puis regroupe".
 */
export function placeholderRegroupe(famille: FamilleReference): string {
  switch (famille) {
    case "carre":
    case "racine_carree":
      return "ex : x^2-5x+6=0";
    case "cube":
    case "racine_cubique":
      return "ex : -x^3+9x^2-3x+7=0";
    case "inverse":
      return "ex : 3x^2-5x+2=0";
    case "valeur_absolue":
      return "";
  }
}
