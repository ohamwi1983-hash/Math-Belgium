import type { ComparateurGraphique, ExerciceGraphiqueContexte, QuestionGraphique } from "../../core/graphiqueContexte.types";
import type { Morceau } from "../../core/inequation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { justificationType, LIBELLE_TYPE } from "../../ui/formatGraphiqueContexte";
import { construireSvgGraphiqueContexte } from "../../ui/svgGraphiqueContexte";
import { evaluerCourbe } from "../../moteur/courbeGraphiqueContexte";
import { formatNombreTexte, TEXTES_CONTEXTES } from "./contextes";
import { COURS_LECTURE } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen70 (lire un graphique en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`. Deux étapes = deux écrans par question : identifier la
 * caractéristique demandée (image, antécédent, inéquation…), puis la lire. Le bloc « Calcul » est la
 * lecture faite au tableau, point par point (f désigne la fonction représentée). Valeurs tirées de
 * l'instance (questions générées) et de la courbe de l'écran (`evaluerCourbe`) ; partagé par
 * l'adaptateur papier et l'appli.
 */

type E = ExerciceGraphiqueContexte;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

export function nombreLatex(v: number): string {
  return formatNombreTexte(v).replace(",", "{,}").replace("−", "-");
}

function borneLatex(b: Morceau["borneGauche"]): string {
  return b === "-inf" ? "-\\infty" : b === "+inf" ? "+\\infty" : nombreLatex(b);
}

export function morceauxLatex(morceaux: Morceau[]): string {
  return morceaux.map((m) => `${m.crochetGauche}${borneLatex(m.borneGauche)}\\,;\\,${borneLatex(m.borneDroite)}${m.crochetDroit}`).join(" \\cup ");
}

function svgPapier(e: E, annotation: QuestionGraphique | null = null): string {
  return construireSvgGraphiqueContexte(e, { theme: "papier", annotation });
}

const RELATION: Record<ComparateurGraphique, string> = { ">=": "\\geq", ">": ">", "<": "<", "<=": "\\leq" };

function libelleComparaison(c: ComparateurGraphique): string {
  return c === ">=" ? "au moins" : c === ">" ? "plus de" : c === "<" ? "moins de" : "au plus";
}

export function aDesPaliers(e: E): boolean {
  if (e.courbe.type !== "lineaire") return false;
  const p = e.courbe.points;
  return p.some((pt, i) => i < p.length - 1 && pt.y === p[i + 1]!.y);
}

export function reponseFragments(e: E, q: QuestionGraphique): FragmentConsigne[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [texte(t.valeurY(q.y))];
    case "antecedent":
      return [texte(q.solutions.map(t.valeurX).join(" et "))];
    case "inequation":
      return [latex(morceauxLatex(q.solution)), texte(` (en ${t.uniteX})`)];
    case "extremum":
      return [texte(`${q.nature === "max" ? "maximum" : "minimum"} de ${t.valeurY(q.y)}, atteint ${t.moment(q.x)}`)];
    case "variation":
      return [latex(morceauxLatex(q.intervalles)), texte(` (en ${t.uniteX})`)];
    case "tendance":
      return [texte(t.valeurY(q.L))];
  }
}

function lignesType(e: E, q: QuestionGraphique): LigneCalcul[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [ligne(`x=${nombreLatex(q.x)}`, `valeur connue sur l'axe horizontal (${t.grandeurX})`), ligne(`f(${nombreLatex(q.x)})=\\,?`, `on cherche ${t.grandeurY}, sur l'axe vertical`)];
    case "antecedent":
      return [ligne(`f(x)=${nombreLatex(q.k)}`, `valeur connue sur l'axe vertical (${t.grandeurY})`), ligne("x=\\,?", `on cherche ${t.grandeurX}, sur l'axe horizontal`)];
    case "inequation":
      return [ligne(`f(x)${RELATION[q.comparateur]} ${nombreLatex(q.k)}`, `« ${libelleComparaison(q.comparateur)} ${t.valeurY(q.k)} » : toutes les valeurs de x qui conviennent`)];
    case "extremum":
      return [ligne(`f(x)${q.nature === "max" ? "\\leq" : "\\geq"} f(x_0)\\ \\text{pour tout } x`, `on cherche le point le plus ${q.nature === "max" ? "haut" : "bas"} : sa valeur et le moment x₀`)];
    case "variation":
      return [ligne(`x_1<x_2\\Rightarrow f(x_1)${q.sens === "croissante" ? "<" : ">"} f(x_2)`, `${t.grandeurY} ${q.sens === "croissante" ? "augmente" : "diminue"} : intervalles de ${q.sens === "croissante" ? "croissance" : "décroissance"}`)];
    case "tendance":
      return [ligne("y=\\,?", "valeur dont la courbe se rapproche à long terme (vers la droite)")];
  }
}

function lignesLecture(e: E, q: QuestionGraphique): LigneCalcul[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  const f = (x: number) => evaluerCourbe(e.courbe, x);
  switch (q.type) {
    case "image":
      return [ligne(`x=${nombreLatex(q.x)}`, `on part de ${t.valeurX(q.x)} sur l'axe horizontal`), ligne(`f(${nombreLatex(q.x)})=${nombreLatex(q.y)}`, "on monte jusqu'à la courbe et on lit l'ordonnée du point atteint")];
    case "antecedent":
      return [
        ligne(`y=${nombreLatex(q.k)}`, `on trace l'horizontale à la hauteur ${t.valeurY(q.k)}`),
        ...q.solutions.map((s, i) => ligne(`f(${nombreLatex(s)})=${nombreLatex(q.k)}`, `${q.solutions.length > 1 ? `intersection n° ${i + 1}` : "seule intersection"} : abscisse ${t.valeurX(s)}`)),
      ];
    case "inequation": {
      const dessus = q.comparateur === ">=" || q.comparateur === ">";
      const large = q.comparateur === ">=" || q.comparateur === "<=";
      const bornes = [...new Set(q.solution.flatMap((m) => [m.borneGauche, m.borneDroite]).filter((b): b is number => typeof b === "number"))].filter((b) => Math.abs(f(b) - q.k) < 1e-6);
      return [
        ligne(`y=${nombreLatex(q.k)}`, `horizontale à la hauteur ${t.valeurY(q.k)}`),
        ...bornes.map((b) => ligne(`f(${nombreLatex(b)})=${nombreLatex(q.k)}`, `la courbe rencontre l'horizontale en x = ${formatNombreTexte(b)} : crochet ${large ? "fermé" : "ouvert"}`)),
        ligne(`S=${morceauxLatex(q.solution)}`, `parties de la courbe ${dessus ? "au-dessus" : "au-dessous"} de l'horizontale${q.solution.some((m) => m.borneGauche === e.axeX.min || m.borneDroite === e.axeX.max) ? " ; une extrémité de la période représentée reste incluse" : ""}`),
      ];
    }
    case "extremum":
      return [ligne(`f(${nombreLatex(q.x)})=${nombreLatex(q.y)}`, `point le plus ${q.nature === "max" ? "haut" : "bas"} de la courbe : (${formatNombreTexte(q.x)} ; ${formatNombreTexte(q.y)})`)];
    case "variation":
      return q.intervalles.flatMap((m) => {
        const a = m.borneGauche as number;
        const b = m.borneDroite as number;
        const verbe = q.sens === "croissante" ? "monte" : "descend";
        return [
          ligne(`f(${nombreLatex(a)})=${nombreLatex(f(a))}`, `la courbe ${verbe} à partir de x = ${formatNombreTexte(a)}…`),
          ligne(`f(${nombreLatex(b)})=${nombreLatex(f(b))}`, `… jusqu'à x = ${formatNombreTexte(b)} : intervalle [${formatNombreTexte(a)} ; ${formatNombreTexte(b)}]`),
        ];
      });
    case "tendance":
      return [ligne(`y=${nombreLatex(q.L)}`, "la courbe s'aplatit et se rapproche de cette horizontale (pointillé), sans l'atteindre")];
  }
}

export function piegeFragments(e: E, q: QuestionGraphique): FragmentConsigne[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [texte(`Ce n'est pas un antécédent : la valeur connue est sur l'axe horizontal, la réponse se lit sur l'axe vertical et s'écrit avec son unité (${t.uniteY}).`)];
    case "antecedent":
      return q.solutions.length > 1
        ? [texte(`Il y a ${q.solutions.length} antécédents : il faut les donner tous. Ce n'est pas une image : la réponse se lit sur l'axe horizontal (en ${t.uniteX}).`)]
        : [texte(`Ce n'est pas une image : la valeur connue est sur l'axe vertical, la réponse se lit sur l'axe horizontal (en ${t.uniteX}).`)];
    case "inequation": {
      const large = q.comparateur === ">=" || q.comparateur === "<=";
      return [
        texte(
          large
            ? `« ${libelleComparaison(q.comparateur)} » inclut le niveau ${t.valeurY(q.k)} : un crochet ouvert en une borne où la grandeur vaut ${t.valeurY(q.k)} serait faux.`
            : `« ${libelleComparaison(q.comparateur)} » exclut le niveau ${t.valeurY(q.k)} : un crochet fermé en une borne où la grandeur vaut ${t.valeurY(q.k)} serait faux.`,
        ),
      ];
    }
    case "extremum":
      return [texte(`Deux informations sont demandées : la valeur (${t.valeurY(q.y)}) et le moment (${t.valeurX(q.x)})${q.x === e.axeX.min || q.x === e.axeX.max ? " — ici atteint à une extrémité de la période représentée" : ""}.`)];
    case "variation":
      return aDesPaliers(e)
        ? [texte("Un palier (grandeur constante) n'est ni croissant ni décroissant : il ne fait pas partie de la réponse.")]
        : [texte(`Les bornes des intervalles sont des valeurs de l'axe horizontal (en ${t.uniteX}), pas des valeurs de ${t.grandeurY}.`)];
    case "tendance":
      return [texte("La réponse n'est pas la dernière valeur lue sur le graphique, mais la valeur dont la courbe se rapproche (asymptote horizontale).")];
  }
}

const METHODE: Record<QuestionGraphique["type"], string> = {
  image: "L'image de a est l'ordonnée du point de la courbe d'abscisse a : on lit à la verticale de a",
  antecedent: "Les antécédents de k sont les abscisses des points de la courbe à la hauteur k : on lit sur l'horizontale y = k",
  inequation: "Résoudre f(x) ≥ k (ou ≤, >, <), c'est garder les x où la courbe est au-dessus (ou au-dessous) de la droite y = k",
  extremum: "Un maximum (minimum) est l'ordonnée du point le plus haut (bas) de la courbe ; on donne aussi l'abscisse où il est atteint",
  variation: "f est croissante (décroissante) sur les intervalles où la courbe monte (descend) de gauche à droite ; les bornes se lisent sur l'axe horizontal",
  tendance: "À long terme, la grandeur se rapproche de la valeur de l'asymptote horizontale",
};

export function correctionDetailleeGraphiqueContexte(e: E): EtapeCorrection[] {
  return e.questions.flatMap((q, i) => {
    const lType = LETTRES[2 * i]!;
    const lLecture = LETTRES[2 * i + 1]!;
    return [
      utilise(lType, [texte(`On repère quelle grandeur est connue (axe horizontal ou vertical) et laquelle est cherchée ; f désigne la fonction représentée ${COURS_LECTURE}. ${justificationType(e, q)}`)]),
      calcul(lType, lignesType(e, q)),
      resultat(lType, [texte(`${LIBELLE_TYPE[q.type]}.`)]),
      utilise(lLecture, [texte(`${METHODE[q.type]} ${COURS_LECTURE}.`)]),
      { ...calcul(lLecture, lignesLecture(e, q)), figureHtml: svgPapier(e, q) },
      resultat(lLecture, [...reponseFragments(e, q), texte(".")]),
      piege(lLecture, piegeFragments(e, q)),
    ];
  });
}
