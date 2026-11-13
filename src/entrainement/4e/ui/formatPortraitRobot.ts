import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type {
  ComparaisonImages,
  ComparaisonValeur,
  ConditionPortrait,
  EnsemblePortrait,
  ExerciceCourbe,
  ExerciceDeduction,
  ExerciceExpression,
  FonctionTransformee,
  SensVariation,
  TypeCondition,
  VerdictComparaison,
} from "../core/portraitRobotFonction.types";
import type { FamilleReference } from "../core/fonctionsReference.types";
import { sensSymetrique, valeurOpposee } from "../generateurs/portraitRobotFonction";
import { courbesEcartees } from "../moteur/verificationPortraitRobot";

/**
 * Textes de « Le portrait-robot d'une fonction » (gen71) — UNE seule source pour l'écran et pour
 * le papier (`generateurs/portraitRobotFonction/exportEvaluation.ts`) : conditions, consignes
 * d'écran, aides, réponses attendues. Les formules vont toujours dans des fragments LaTeX (jamais de
 * notation clavier), les nombres prennent le « − » typographique de KaTeX.
 */

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export function nombreLatex(n: number): string {
  const arrondi = Math.round(n * 1e9) / 1e9;
  return String(arrondi).replace(".", "{,}");
}

/** « x − 2 », « x + 3 », « x » : l'argument de g. */
function argumentLatex(h: number): string {
  if (h === 0) return "x";
  return h > 0 ? `x - ${nombreLatex(h)}` : `x + ${nombreLatex(-h)}`;
}

function termeConstant(k: number): string {
  if (k === 0) return "";
  return k > 0 ? ` + ${nombreLatex(k)}` : ` - ${nombreLatex(-k)}`;
}

function coefficientDevant(a: number): string {
  if (a === 1) return "";
  if (a === -1) return "-";
  return nombreLatex(a);
}

/** Expression LaTeX de f(x) = a·g(x − h) + k (sans « f(x) = »). */
export function expressionLatex(f: FonctionTransformee): string {
  const arg = argumentLatex(f.h);
  const c = coefficientDevant(f.a);
  const k = termeConstant(f.k);
  switch (f.famille) {
    case "carre":
      return `${c}${f.h === 0 ? "x" : `(${arg})`}^2${k}`;
    case "cube":
      return `${c}${f.h === 0 ? "x" : `(${arg})`}^3${k}`;
    case "racine_carree":
      return `${c}\\sqrt{${arg}}${k}`;
    case "racine_cubique":
      return `${c}\\sqrt[3]{${arg}}${k}`;
    case "valeur_absolue":
      return `${c}|${arg}|${k}`;
    case "inverse":
      return `${f.a < 0 ? "-" : ""}\\dfrac{${nombreLatex(Math.abs(f.a))}}{${arg}}${k}`;
  }
}

/** Fonction de référence g en LaTeX : « x^2 », « \sqrt{x} »… */
export function referenceLatex(famille: FamilleReference, variable = "x"): string {
  switch (famille) {
    case "carre":
      return `${variable}^2`;
    case "cube":
      return `${variable}^3`;
    case "racine_carree":
      return `\\sqrt{${variable}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${variable}}`;
    case "valeur_absolue":
      return `|${variable}|`;
    case "inverse":
      return `\\dfrac{1}{${variable}}`;
  }
}

/** Forme générale a·g(x − TH) + TV, avec TH et TV numériques et « a » littéral. */
export function formeAvecALatex(f: FonctionTransformee): string {
  const arg = argumentLatex(f.h);
  const k = termeConstant(f.k);
  switch (f.famille) {
    case "carre":
      return `a${f.h === 0 ? "x" : `(${arg})`}^2${k}`;
    case "cube":
      return `a${f.h === 0 ? "x" : `(${arg})`}^3${k}`;
    case "racine_carree":
      return `a\\sqrt{${arg}}${k}`;
    case "racine_cubique":
      return `a\\sqrt[3]{${arg}}${k}`;
    case "valeur_absolue":
      return `a|${arg}|${k}`;
    case "inverse":
      return `\\dfrac{a}{${arg}}${k}`;
  }
}

/** Même forme avec x remplacé par un nombre (contrôle, équation en a). */
function formeSubstitueeLatex(f: FonctionTransformee, x: number, avecA: boolean): string {
  const xs = x < 0 ? `(${nombreLatex(x)})` : nombreLatex(x);
  const arg = f.h === 0 ? xs : f.h > 0 ? `${xs} - ${nombreLatex(f.h)}` : `${xs} + ${nombreLatex(-f.h)}`;
  const coef = avecA ? "a" : f.a === 1 ? "" : f.a === -1 ? "-" : `${nombreLatex(f.a)} \\cdot `;
  const k = termeConstant(f.k);
  switch (f.famille) {
    case "carre":
      return `${coef}(${arg})^2${k}`;
    case "cube":
      return `${coef}(${arg})^3${k}`;
    case "racine_carree":
      return `${coef}\\sqrt{${arg}}${k}`;
    case "racine_cubique":
      return `${coef}\\sqrt[3]{${arg}}${k}`;
    case "valeur_absolue":
      return `${coef}|${arg}|${k}`;
    case "inverse":
      return avecA ? `\\dfrac{a}{${arg}}${k}` : `${f.a < 0 ? "-" : ""}\\dfrac{${nombreLatex(Math.abs(f.a))}}{${arg}}${k}`;
  }
}

export function pointLatex(x: number, y: number): string {
  return `(${nombreLatex(x)} \\,;\\, ${nombreLatex(y)})`;
}

export function ensembleLatex(e: EnsemblePortrait): string {
  if (e.type === "R") return "\\mathbb{R}";
  if (e.type === "Rprive") return `\\mathbb{R} \\setminus \\{${nombreLatex(e.valeur)}\\}`;
  return e.vers === "plus" ? `[${nombreLatex(e.borne)} \\,;\\, +\\infty[` : `]-\\infty \\,;\\, ${nombreLatex(e.borne)}]`;
}

export function intervalleLatex(u: number, v: number): string {
  return `[${nombreLatex(u)} \\,;\\, ${nombreLatex(v)}]`;
}

export function libelleSens(sens: SensVariation): string {
  return sens === "croissante" ? "strictement croissante" : "strictement décroissante";
}

/** Phrase d'une condition (sans point final), en fragments texte + LaTeX. */
export function conditionFragments(c: ConditionPortrait): FragmentConsigne[] {
  switch (c.type) {
    case "domaine":
      return [l(`\\mathrm{dom}\\,f = ${ensembleLatex(c.ensemble)}`)];
    case "image":
      return [t("l'ensemble image de f est "), l(ensembleLatex(c.ensemble))];
    case "asymptoteH":
      return [t("la droite d'équation "), l(`y = ${nombreLatex(c.k)}`), t(" est asymptote horizontale au graphique de f")];
    case "point":
      return c.forme === "valeur"
        ? [l(`f(${nombreLatex(c.x)}) = ${nombreLatex(c.y)}`)]
        : [t("le graphique de f passe par le point "), l(pointLatex(c.x, c.y))];
    case "extremum":
      return c.en === null
        ? [t(`f admet un ${c.nature} égal à `), l(nombreLatex(c.valeur))]
        : [t(`f admet un ${c.nature} égal à `), l(nombreLatex(c.valeur)), t(", atteint en "), l(`x = ${nombreLatex(c.en)}`)];
    case "centre":
      return [t("le point "), l(pointLatex(c.x, c.y)), t(" est centre de symétrie du graphique de f")];
    case "parite":
      return [t(`f est ${c.parite}`)];
    case "monotonie":
      return [t(`f est ${libelleSens(c.sens)} sur `), l(intervalleLatex(c.u, c.v))];
  }
}

/** Première lettre en majuscule (début de puce). */
export function avecMajuscule(fragments: FragmentConsigne[]): FragmentConsigne[] {
  const [premier, ...reste] = fragments;
  if (!premier || premier.type !== "texte") return fragments;
  // « f » est le nom de la fonction : jamais « F est paire ».
  if (/^f\b/.test(premier.valeur)) return fragments;
  return [t(premier.valeur.charAt(0).toUpperCase() + premier.valeur.slice(1)), ...reste];
}

// ---------------------------------------------------------------------------------------------
// Libellés
// ---------------------------------------------------------------------------------------------

export const LETTRES_COURBES = ["A", "B", "C", "D"] as const;

export const NOMS_FAMILLES: Record<FamilleReference, string> = {
  carre: "carré",
  cube: "cube",
  racine_carree: "racine carrée",
  racine_cubique: "racine cubique",
  inverse: "inverse",
  valeur_absolue: "valeur absolue",
};

export function nomFamilleAvecArticle(famille: FamilleReference): string {
  return `la fonction ${NOMS_FAMILLES[famille]}`;
}

export const TITRES_ECRANS = {
  expression: ["Fonction de référence", "Translations", "Expression", "Vérification"],
  deduction: ["Valeur", "Variations", "Comparaison", "Comparaison à une valeur"],
  courbe: ["Choix de la courbe", "Première courbe écartée", "Deuxième courbe écartée", "Troisième courbe écartée"],
} as const;

export const NOMBRE_ECRANS = 4;

export function consigneGenerale(famille: "expression" | "deduction" | "courbe"): string {
  if (famille === "expression") return "Une fonction f est obtenue en transformant une fonction de référence (translations, symétrie, étirement vertical). Elle possède les caractéristiques suivantes.";
  if (famille === "deduction") return "On ne connaît pas l'expression de f, seulement les informations suivantes. Raisonne à partir d'elles.";
  return "Une seule des quatre courbes respecte toutes les conditions suivantes.";
}

// ---------------------------------------------------------------------------------------------
// Famille B — textes
// ---------------------------------------------------------------------------------------------

export function donneesDeductionFragments(e: ExerciceDeduction): FragmentConsigne[][] {
  return [
    [t(`f est définie sur `), l("\\mathbb{R}"), t(` et ${e.parite}`)],
    [t(`f est ${libelleSens(e.sens)} sur `), l(intervalleLatex(0, e.m))],
    [l(`f(${nombreLatex(e.p)}) = ${nombreLatex(e.v)}`)],
  ];
}

export function imageLatex(x: number): string {
  return `f(${nombreLatex(x)})`;
}

/** Les 3 options d'une comparaison, dans l'ordre affiché : <, >, on ne peut pas savoir. */
export function optionsComparaison(gauche: string, droite: string): { valeur: VerdictComparaison; latex: string | null; texte: string }[] {
  return [
    { valeur: "inferieur", latex: `${gauche} < ${droite}`, texte: "" },
    { valeur: "superieur", latex: `${gauche} > ${droite}`, texte: "" },
    { valeur: "indetermine", latex: null, texte: "On ne peut pas savoir" },
  ];
}

export function verdictLatex(verdict: VerdictComparaison, gauche: string, droite: string): FragmentConsigne[] {
  if (verdict === "indetermine") return [t("On ne peut pas comparer "), l(gauche), t(" et "), l(droite), t(".")];
  return [l(`${gauche} ${verdict === "inferieur" ? "<" : ">"} ${droite}`)];
}

export function gaucheDroiteImages(c: ComparaisonImages): [string, string] {
  return [imageLatex(c.x1), imageLatex(c.x2)];
}

export function gaucheDroiteValeur(e: ExerciceDeduction, c: ComparaisonValeur): [string, string] {
  return [imageLatex(c.x), nombreLatex(e.v)];
}

/** Justification d'une comparaison (corrigé + aide de niveau 2 sans le verdict). */
export function justificationComparaison(e: ExerciceDeduction, x1: number, x2: number, verdict: VerdictComparaison): FragmentConsigne[] {
  const m = nombreLatex(e.m);
  if (verdict === "indetermine") {
    const dehors = Math.abs(x1) > e.m ? x1 : x2;
    return [
      l(nombreLatex(dehors)),
      t(" n'appartient pas à "),
      l(`[-${m} \\,;\\, ${m}]`),
      t(" : les données ne disent rien de f en dehors de cet intervalle, même avec la parité."),
    ];
  }
  if (e.parite === "paire") {
    const a1 = Math.abs(x1);
    const a2 = Math.abs(x2);
    const egalites: FragmentConsigne[] = [];
    if (x1 < 0) egalites.push(l(`${imageLatex(x1)} = ${imageLatex(a1)}`));
    if (x2 < 0) egalites.push(...(egalites.length > 0 ? [t(" et ")] : []), l(`${imageLatex(x2)} = ${imageLatex(a2)}`));
    const ordre = a1 < a2 ? `${nombreLatex(a1)} < ${nombreLatex(a2)}` : `${nombreLatex(a2)} < ${nombreLatex(a1)}`;
    const conclusion = verdict === "inferieur" ? `${imageLatex(a1)} < ${imageLatex(a2)}` : `${imageLatex(a1)} > ${imageLatex(a2)}`;
    return [
      t("f est paire : "),
      ...egalites,
      t(". Sur "),
      l(intervalleLatex(0, e.m)),
      t(`, f est ${libelleSens(e.sens)} et `),
      l(ordre),
      t(", donc "),
      l(conclusion),
      t("."),
    ];
  }
  const ordre = x1 < x2 ? `${nombreLatex(x1)} < ${nombreLatex(x2)}` : `${nombreLatex(x2)} < ${nombreLatex(x1)}`;
  const conclusion = `${imageLatex(x1)} ${verdict === "inferieur" ? "<" : ">"} ${imageLatex(x2)}`;
  return [
    t(`f est impaire et ${libelleSens(e.sens)} sur `),
    l(intervalleLatex(0, e.m)),
    t(` : elle est donc ${libelleSens(e.sens)} sur `),
    l(`[-${m} \\,;\\, ${m}]`),
    t(" tout entier (la symétrie par rapport à l'origine garde le sens de variation, et "),
    l("f(0) = 0"),
    t("). Or "),
    l(ordre),
    t(", donc "),
    l(conclusion),
    t("."),
  ];
}

export function justificationValeur(e: ExerciceDeduction): FragmentConsigne[] {
  const p = nombreLatex(e.p);
  return e.parite === "paire"
    ? [t("f est paire : "), l(`f(-${p}) = f(${p}) = ${nombreLatex(e.v)}`), t(".")]
    : [t("f est impaire : "), l(`f(-${p}) = -f(${p}) = ${nombreLatex(valeurOpposee(e))}`), t(".")];
}

export function justificationVariations(e: ExerciceDeduction): FragmentConsigne[] {
  const m = nombreLatex(e.m);
  const symetrie = e.parite === "paire" ? "l'axe des ordonnées" : "l'origine";
  const effet = e.parite === "paire" ? "inverse le sens de variation" : "garde le sens de variation";
  return [
    t(`Le graphique d'une fonction ${e.parite} est symétrique par rapport à ${symetrie} : cette symétrie ${effet}. Sur `),
    l(`[-${m} \\,;\\, 0]`),
    t(`, f est donc ${libelleSens(sensSymetrique(e))}.`),
  ];
}

// ---------------------------------------------------------------------------------------------
// Aides (écran) — jamais la réponse
// ---------------------------------------------------------------------------------------------

export function aidesExpression(e: ExerciceExpression, ecran: number): FragmentConsigne[][] {
  const c = e.cible;
  if (ecran === 0) {
    return [
      [t("Repère la caractéristique la plus parlante : un domaine différent de "), l("\\mathbb{R}"), t(", une asymptote, un extremum, un centre de symétrie.")],
      e.groupe === "asymptotes"
        ? [t("Une seule fonction de référence a un domaine privé d'un nombre et une asymptote horizontale.")]
        : e.groupe === "racine"
          ? [t("Une seule fonction de référence a un domaine de la forme "), l("[\\ldots \\,;\\, +\\infty["), t(".")]
          : e.groupe === "extremum"
            ? [t("Deux fonctions de référence ont un extremum : compare comment f augmente en s'éloignant de son extremum (1 unité, puis 2 ou 3 unités).")]
            : [t("Deux fonctions de référence ont un centre de symétrie et l'ensemble image "), l("\\mathbb{R}"), t(" : compare les écarts des ordonnées aux points donnés (1 unité, puis 2 ou 8 unités).")],
    ];
  }
  if (ecran === 1) {
    const origine = l("(0 \\,;\\, 0)");
    const arrivee = l("(\\text{TH} \\,;\\, \\text{TV})");
    const reperes: FragmentConsigne[] =
      e.groupe === "asymptotes"
        ? [t("Pour l'inverse, les asymptotes "), l("x = 0"), t(" et "), l("y = 0"), t(" sont déplacées en "), l("x = \\text{TH}"), t(" et "), l("y = \\text{TV}"), t(".")]
        : e.groupe === "racine"
          ? [t("Pour la racine carrée, le point de départ "), origine, t(" est déplacé en "), arrivee, t(".")]
          : e.groupe === "extremum"
            ? [t("Le sommet "), origine, t(" de la courbe de référence est déplacé au point où f atteint son extremum : "), arrivee, t(".")]
            : [t("Le centre de symétrie "), origine, t(" de la courbe de référence est déplacé en "), arrivee, t(".")];
    return [reperes, [t("Avec la forme "), l("f(x) = a \\cdot g(x - \\text{TH}) + \\text{TV}"), t(", le point "), origine, t(" de la courbe de g devient "), arrivee, t(".")]];
  }
  if (ecran === 2) {
    const point = e.conditions.find((cd) => cd.type === "point" && !(cd.x === c.h && cd.y === c.k));
    const px = point && point.type === "point" ? point.x : c.h + 1;
    const py = point && point.type === "point" ? point.y : c.k;
    return [
      [t("Avec la fonction de référence et les translations trouvées, f s'écrit : "), l(`f(x) = ${formeAvecALatex(c)}`), t(". Il reste à trouver a.")],
      [t("Le point "), l(pointLatex(px, py)), t(" appartient au graphique : remplace x et f(x) par ses coordonnées, puis résous l'équation en a : "), l(`${nombreLatex(py)} = ${formeSubstitueeLatex(c, px, true)}`)],
    ];
  }
  return [
    [t("Remplace x par "), l(nombreLatex(e.controle.x)), t(" dans l'expression de f que tu as trouvée.")],
    [t("Calcule : "), l(`f(${nombreLatex(e.controle.x)}) = ${formeSubstitueeLatex(c, e.controle.x, false)}`)],
  ];
}

export function aidesDeduction(e: ExerciceDeduction, ecran: number): FragmentConsigne[][] {
  const m = nombreLatex(e.m);
  const definition = e.parite === "paire" ? "f(-x) = f(x)" : "f(-x) = -f(x)";
  if (ecran === 0) {
    return [
      [t(`Une fonction ${e.parite} vérifie, pour tout réel x du domaine : `), l(definition)],
      [t("Applique cette égalité avec "), l(`x = ${nombreLatex(e.p)}`), t(", puis utilise la valeur donnée.")],
    ];
  }
  if (ecran === 1) {
    return [
      [t(`Le graphique d'une fonction ${e.parite} est symétrique par rapport à ${e.parite === "paire" ? "l'axe des ordonnées" : "l'origine"}.`)],
      [
        t("Prends deux nombres de "),
        l(`[-${m} \\,;\\, 0]`),
        t(", par exemple "),
        l(`-${m} < -1`),
        t(", et compare leurs images en passant par celles de "),
        l(m),
        t(" et "),
        l("1"),
        t(" grâce à : "),
        l(definition),
      ],
    ];
  }
  const premier = [t("Les nombres comparés sont-ils tous dans "), l(`[-${m} \\,;\\, ${m}]`), t(", le seul intervalle où l'on connaît les variations de f (par parité) ?")];
  if (ecran === 2) {
    return [premier, [t("Si oui, ramène-toi à "), l(intervalleLatex(0, e.m)), t(" grâce à "), l(definition), t(", puis utilise le sens de variation.")]];
  }
  return [
    premier,
    [t("Utilise "), l(`f(${nombreLatex(e.p)}) = ${nombreLatex(e.v)}`), t(" : comparer à "), l(nombreLatex(e.v)), t(" revient à comparer à "), l(`f(${nombreLatex(e.p)})`), t(".")],
  ];
}

/** Méthode de vérification d'une condition sur une courbe (aide C, corrigé). */
export function methodeCondition(type: TypeCondition): string {
  switch (type) {
    case "domaine":
      return "domaine : regarde au-dessus de quelles abscisses la courbe existe";
    case "image":
      return "ensemble image : projette la courbe sur l'axe des ordonnées";
    case "asymptoteH":
      return "asymptote horizontale : regarde de quelle droite horizontale la courbe se rapproche aux extrémités";
    case "point":
      return "point : place-le sur la grille et regarde si la courbe y passe";
    case "monotonie":
      return "variations : suis la courbe de gauche à droite sur l'intervalle donné";
    case "parite":
      return "parité : cherche la symétrie (axe des ordonnées pour paire, origine pour impaire)";
    case "extremum":
      return "extremum : repère le point le plus haut ou le plus bas";
    case "centre":
      return "centre de symétrie : la courbe doit être symétrique par rapport à ce point";
  }
}

export function aidesCourbe(e: ExerciceCourbe, ecran: number, lettre: string): FragmentConsigne[][] {
  const methodes = e.conditions.map((c) => methodeCondition(c.type));
  const niveau2 = [t("Méthode, condition par condition — " + methodes.join(" ; ") + ".")];
  if (ecran === 0) return [[t("Prends les conditions une à une et écarte chaque courbe qui ne respecte pas l'une d'elles : il doit en rester une seule.")], niveau2];
  return [[t(`Vérifie les trois conditions sur la courbe ${lettre} : une seule n'est pas respectée.`)], niveau2];
}

// ---------------------------------------------------------------------------------------------
// Réponses attendues
// ---------------------------------------------------------------------------------------------

export function libelleVerdictComparaison(verdict: VerdictComparaison, gauche: string, droite: string): FragmentConsigne[] {
  return verdict === "indetermine" ? [t("On ne peut pas savoir")] : [l(`${gauche} ${verdict === "inferieur" ? "<" : ">"} ${droite}`)];
}

// ---------------------------------------------------------------------------------------------
// Consignes des 4 écrans (écran ET titres « Étape n — … » du corrigé papier)
// ---------------------------------------------------------------------------------------------

/** Courbes écartées (indices dans `courbes`), dans l'ordre A → D — même fonction que la vérification. */
export const indicesCourbesEcartees = courbesEcartees;

export function consignesEcrans(e: ExerciceExpression | ExerciceDeduction | ExerciceCourbe): FragmentConsigne[][] {
  if (e.famille === "expression") {
    return [
      [t("De quelle fonction de référence f est-elle obtenue ?")],
      [
        t("Le graphique de f s'obtient à partir de celui de "),
        l(`x \\mapsto ${referenceLatex(e.cible.famille)}`),
        t(" par un éventuel étirement vertical ou une symétrie, puis par des translations. Donne la translation horizontale (TH) et la translation verticale (TV)."),
      ],
      [t("Écris une expression de f qui respecte toutes les caractéristiques.")],
      [t("Vérifie ton expression sur un nouveau point : calcule l'ordonnée du point du graphique de f d'abscisse "), l(nombreLatex(e.controle.x)), t(".")],
    ];
  }
  if (e.famille === "deduction") {
    const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
    const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
    return [
      [t("Que vaut "), l(imageLatex(-e.p)), t(" ?")],
      [t("Sur "), l(`[-${nombreLatex(e.m)} \\,;\\, 0]`), t(", la fonction f est-elle strictement croissante, strictement décroissante, ou ne peut-on pas savoir ?")],
      [t("Compare "), l(g1), t(" et "), l(d1), t(", ou indique qu'on ne peut pas savoir.")],
      [t("Compare "), l(g2), t(" et "), l(d2), t(", ou indique qu'on ne peut pas savoir.")],
    ];
  }
  return [
    [t("Quelle courbe respecte toutes les conditions ?")],
    ...indicesCourbesEcartees(e).map((i) => [t(`La courbe ${LETTRES_COURBES[i]} est écartée : quelle condition ne respecte-t-elle pas ?`)]),
  ];
}
