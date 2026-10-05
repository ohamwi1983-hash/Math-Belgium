import type { ExerciceFonctionReference, FamilleReference } from "../core/fonctionsReference.types";

/** Emplacement pas encore renseigné : tiret LaTeX (\_), même convention que
 * formatTransformationsGraphiques.ts (chapitre 1) / apercuIntervalle.ts. */
const PLACEHOLDER = "\\_";

/** Aperçu en temps réel de l'équation en cours de saisie — reflète tel quel le contenu du champ
 * libre, jamais une saisie figée ni reformatée (même principe que formatTransformationsGraphiques.ts). */
export function formatApercuEquation(equation: string): string {
  const contenu = equation.trim() === "" ? PLACEHOLDER : equation;
  return `f(x) = ${contenu}`;
}

/** Texte d'aide (attribut `placeholder`) du champ équation — un exemple par famille, dans une
 * syntaxe réellement reconnue par `evaluerExpressionGenerale` (src/moteur/expressionGenerale.ts,
 * vérifié empiriquement pour les 6 : `ui/formatFonctionsReference.test.ts`, describe
 * "placeholderEquation — exemples réellement évaluables") — jamais un exemple générique identique
 * pour toutes les familles (prompt-coordonnees-sommet-et-placeholders.md, point 2). Historique :
 * le champ n'affichait à l'origine qu'un exemple `sqrt(...)` (racine carrée) pour tout le monde,
 * puis `prompt-restructuration-formule-th-ch.md`, point 3, a ajouté un exemple `cbrt(...)` pour
 * la seule famille racine_cubique (jusque-là invisible) ; ce correctif étend le principe aux 4
 * familles restantes, chacune avec son propre exemple cohérent avec sa notation. */
export function placeholderEquation(famille: FamilleReference): string {
  switch (famille) {
    case "carre":
      return "ex : (x-3)^2-1";
    case "cube":
      return "ex : (x-3)^3+2";
    case "racine_carree":
      return "ex : sqrt(x-3)+1";
    case "racine_cubique":
      return "ex : cbrt(x-3)-2";
    case "inverse":
      return "ex : 1/(x-3)+2";
    case "valeur_absolue":
      return "ex : abs(x-3)+2";
  }
}

/** x - TH, rendu LaTeX — la translation pure, TOUJOURS la première transformation appliquée à x
 * (prompt-nouvel-ordre-transformations.md), jamais combinée à SOY à ce stade contrairement à
 * l'ancienne formule. TH est un entier SIGNÉ dans [-5,5] (prompt-restructuration-formule-th-ch.md,
 * point 2) : signe adapté comme pour p côté chapitre 1 (jamais de `+ -3`, terme omis si TH=0). */
function formatInterieurLatex(th: number): string {
  if (th === 0) return "x";
  return th > 0 ? `x - ${th}` : `x + ${-th}`;
}

/** CH/EH · (x - TH), rendu LaTeX — met à l'échelle l'expression déjà translatée (jamais le seul
 * terme en x), pour que le point caractéristique de la courbe reste exactement en x=TH quel que
 * soit CH/EH. Coefficient 1 jamais explicite (interieur nu quand CH=EH=1) ; parenthèses ajoutées
 * seulement quand une multiplication explicite les rend nécessaires (`CH(interieur)`) — jamais
 * autour d'un simple numérateur de fraction, où la barre groupe déjà sans ambiguïté. */
function formatMiseEchelleLatex(exercice: ExerciceFonctionReference): string {
  const { ch, eh, th } = exercice;
  const interieur = formatInterieurLatex(th);

  if (ch === 1 && eh === 1) return interieur;
  if (eh === 1) return `${ch}(${interieur})`;
  if (ch === 1) return `\\frac{${interieur}}{${eh}}`;
  return `\\frac{${ch}(${interieur})}{${eh}}`;
}

/** SOY · (CH/EH · (x - TH)), rendu LaTeX (prompt-nouvel-ordre-transformations.md) : SOY réfléchit
 * le résultat déjà translaté-et-mis-à-l'échelle, jamais combiné à x avant la soustraction de TH.
 * Un simple préfixe `-` suffit quand la mise à l'échelle produit déjà une forme groupée (produit
 * explicite `CH(interieur)` ou fraction — `-(a/b) = -a/b`, `-(k(interieur)) = -k(interieur)`,
 * algébriquement sûr sans parenthèses supplémentaires) ; le cas nu (CH=EH=1, interieur affiché sans
 * parenthèses) exige en revanche des parenthèses explicites dès que TH≠0 — sans elles, `-x - 3`
 * lu littéralement ne vaut PAS `-(x-3)` (qui vaut `-x+3`) : une simple concaténation de signe
 * serait donc algébriquement fausse dans ce cas précis. */
function formatArgumentLatex(exercice: ExerciceFonctionReference): string {
  const { ch, eh, th, soy } = exercice;
  const miseEchelle = formatMiseEchelleLatex(exercice);
  if (!soy) return miseEchelle;

  const nu = ch === 1 && eh === 1;
  if (nu && th !== 0) return `-(${miseEchelle})`;
  return `-${miseEchelle}`;
}

/** true SSI `formatArgumentLatex` produit EXACTEMENT le symbole nu "x" (CH=EH=1, TH=0, SOY absent)
 * — seul cas où l'élever au carré/cube ou le mettre au dénominateur n'a jamais besoin de
 * parenthèses (audit transversal, `promptauditparenthesessuperflues.md`). */
function argumentEstAtomique(exercice: ExerciceFonctionReference): boolean {
  return exercice.ch === 1 && exercice.eh === 1 && exercice.th === 0 && !exercice.soy;
}

/** g(u) selon la famille — jamais utilisé pour "inverse", dont la combinaison avec EV/CV suit une
 * structure différente (voir formatCorpsInverse). */
function formatCorpsG(famille: Exclude<FamilleReference, "inverse">, argument: string, argumentAtomique: boolean): string {
  switch (famille) {
    case "carre":
      return argumentAtomique ? `${argument}^2` : `(${argument})^2`;
    case "cube":
      return argumentAtomique ? `${argument}^3` : `(${argument})^3`;
    case "racine_carree":
      return `\\sqrt{${argument}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${argument}}`;
    case "valeur_absolue":
      return `\\left|${argument}\\right|`;
  }
}

/** SOX · (EV/CV) · g(u), rendu LaTeX — même structure que formatEquationTransformationLatex
 * (chapitre 1) : fraction exacte pour CV>1 (jamais un décimal arrondi), EV réinjecté au numérateur
 * quand EV et CV sont tous deux >1 (vrai rapport non trivial), coefficient 1 jamais explicite. */
function formatCorpsGeneral(exercice: ExerciceFonctionReference, argument: string): string {
  const g = formatCorpsG(exercice.famille as Exclude<FamilleReference, "inverse">, argument, argumentEstAtomique(exercice));
  const signe = exercice.sox ? "-" : "";
  const { ev, cv } = exercice;

  if (cv > 1) {
    const numerateur = ev > 1 ? `${ev}${g}` : g;
    return `${signe}\\frac{${numerateur}}{${cv}}`;
  }
  if (ev > 1) return `${signe}${ev}${g}`;
  return `${signe}${g}`;
}

/** SOX · EV/(CV·u) — la formule de la spec pour "inverse" (section 1), rendue directement plutôt
 * que via formatCorpsGeneral : la fraction porte sur EV au numérateur et CV·(argument) au
 * dénominateur, pas sur g(u)=1/u imbriqué dans une seconde fraction. */
function formatCorpsInverse(exercice: ExerciceFonctionReference, argument: string): string {
  const signe = exercice.sox ? "-" : "";
  const { ev, cv } = exercice;
  const numerateur = ev > 1 ? `${ev}` : "1";
  const argumentGroupe = argumentEstAtomique(exercice) ? argument : `\\left(${argument}\\right)`;
  const denominateur = cv > 1 ? `${cv}${argumentGroupe}` : argumentGroupe;
  return `${signe}\\frac{${numerateur}}{${denominateur}}`;
}

/** f(x) = SOX·(EV/CV)·g(SOY·(CH/EH)·(x-TH)) + TV, rendu LaTeX (spec section 1, réorganisée selon
 * l'ordre exact des transformations par prompt-nouvel-ordre-transformations.md). TV est un entier
 * SIGNÉ dans [-5,5] (prompt-restructuration-formule-th-ch.md, point 2) : signe adapté et terme omis
 * s'il est nul — même convention que q côté chapitre 1 (formatEquationTransformationLatex). */
export function formatEquationFonctionReferenceLatex(exercice: ExerciceFonctionReference): string {
  const argument = formatArgumentLatex(exercice);
  const corps = exercice.famille === "inverse" ? formatCorpsInverse(exercice, argument) : formatCorpsGeneral(exercice, argument);
  const { tv } = exercice;
  const termeTv = tv === 0 ? "" : ` ${tv > 0 ? "+" : "-"} ${Math.abs(tv)}`;
  return `f(x) = ${corps}${termeTv}`;
}
