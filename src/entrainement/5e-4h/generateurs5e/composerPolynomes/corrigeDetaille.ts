import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceComposerPolynomes } from "../../core5e/composerPolynomes";
import { carreAffine, developpement, parN, phases, polyL, reponse, substL, substNombreL } from "../../ui5e/formatComposerPolynomes";
import type { PhaseComposerPolynomes } from "../../ui5e/formatComposerPolynomes";

/**
 * Corrigé détaillé « comme au tableau » de `5gen61`, une lettre par écran : a) f(g(x)) écrit ;
 * b) (f∘g)(x) développée, ligne à ligne (carré d'abord, puis distributivité, puis réduction) ;
 * c) (g∘f)(x), de même ; d) vérification en a, étage par étage, recoupée par la forme développée ;
 * e) (deux affines) f∘g et g∘f comparées coefficient par coefficient. Source unique de l'écran
 * (corrigé de l'étape sous la réponse révélée) et du papier.
 */

type E = ExerciceComposerPolynomes;
const t = texte;
const f = latex;
const COURS = "(cours, § 3)";

/** Bloc « Carré » (identité remarquable) quand l'extérieure est du second degré. */
function blocCarre(sq: string, ext: number[], int: number[]): EtapeCorrection[] {
  if (!(ext.length === 3 && int.length === 2)) return [];
  const c = carreAffine(int);
  return [
    calcul(sq, [ligne(`\\left(${polyL(int)}\\right)^{2}=${c.identite}`, [t("avec "), f(`A=${c.A}`), t(" et "), f(`B=${c.B}`)]), ligne(`=${polyL(c.resultat)}`)], [t("Le carré d'abord : "), f("(A+B)^2=A^2+2AB+B^2"), t(".")], "Carré"),
  ];
}

function lignesDev(gauche: string, ext: number[], int: number[]): LigneCalcul[] {
  return [ligne(`${gauche}=${substL(ext, int)}`), ...developpement(ext, int).map((l) => ligne(`=${l.latex}`, l.justification))];
}

function piegeDev(ext: number[]): string {
  if (ext.length === 3) return "Écrire (A + B)² = A² + B² : le double produit 2AB disparaît.";
  return "Ne multiplier que le premier terme de la parenthèse par le facteur.";
}

function etape(e: E, phase: PhaseComposerPolynomes, sq: string): EtapeCorrection[] {
  switch (phase) {
    case "substitution":
      return [
        utilise(sq, [t("Dans "), f("f\\circ g"), t(", g agit d'abord : "), f("(f\\circ g)(x)=f\\big(g(x)\\big)"), t(". On remplace chaque "), f("x"), t(" de f par l'expression de "), f("g(x)"), t(", entre parenthèses "), t(COURS), t(".")]),
        calcul(sq, [ligne(`(f\\circ g)(x)=f\\big(${polyL(e.g)}\\big)`, "définition de f∘g"), ligne(`=${substL(e.f, e.g)}`, "chaque x de f remplacé par g(x)")]),
        resultat(sq, reponse(e, phase)),
        piege(sq, [t("Remplacer "), f("x"), t(" dans g par f(x) : c'est "), f("g\\circ f"), t(", une autre fonction.")]),
      ];
    case "fog":
      return [
        utilise(sq, e.f.length === 3 ? [t("On développe le carré d'une somme, puis on distribue chaque facteur et on regroupe les termes de même degré.")] : [t("On distribue le facteur sur chaque terme de la parenthèse, puis on regroupe les termes de même degré.")]),
        ...blocCarre(sq, e.f, e.g),
        calcul(sq, lignesDev("(f\\circ g)(x)", e.f, e.g)),
        resultat(sq, reponse(e, phase)),
        piege(sq, [t(piegeDev(e.f))]),
      ];
    case "gof":
      return [
        utilise(sq, [t("Cette fois, f agit d'abord : "), f("(g\\circ f)(x)=g\\big(f(x)\\big)"), t(" ; on remplace chaque "), f("x"), t(" de g par "), f("f(x)"), t(", puis on développe et on réduit "), t(COURS), t(".")]),
        ...blocCarre(sq, e.g, e.f),
        calcul(sq, [ligne(`(g\\circ f)(x)=g\\big(${polyL(e.f)}\\big)`, "définition de g∘f"), ...lignesDev("", e.g, e.f).map((l, i) => (i === 0 ? { ...l, latex: l.latex } : l))]),
        resultat(sq, reponse(e, phase)),
        piege(sq, [t("Recopier "), f("(f\\circ g)(x)"), t(" : l'ordre compte, en général "), f("g\\circ f\\neq f\\circ g"), t(".")]),
      ];
    case "point":
      return [
        utilise(sq, [t("Étage par étage : d'abord le nombre "), f(`g(${e.a})`), t(", puis f de ce nombre. La forme développée, évaluée au même point, doit donner la même valeur (astuce du cours, § 3).")]),
        calcul(sq, [
          ligne(`g(${e.a})=${substNombreL(e.g, e.a)}`, "premier étage : g"),
          ligne(`=${e.ga}`),
          ligne(`(f\\circ g)(${e.a})=f(${e.ga})`, "second étage : f"),
          ligne(`=${substNombreL(e.f, e.ga)}`),
          ligne(`=${e.fga}`),
        ]),
        resultat(sq, reponse(e, phase)),
        verification(sq, [t("Par la forme développée de "), f("(f\\circ g)(x)"), t(" :")], [ligne(`(f\\circ g)(${e.a})=${substNombreL(e.fog, e.a)}`), ligne(`=${e.fga}`, "même valeur : le développement est confirmé")]),
        piege(sq, [t("Calculer "), f(`f(${e.a})`), t(" d'abord : dans "), f("f\\circ g"), t(", g agit en premier.")]),
      ];
    case "verdict": {
      const pente = e.f[1] * e.g[1];
      return [
        utilise(sq, [t("Deux expressions développées et réduites sont égales quand leurs coefficients sont égaux. La composée de deux affines est affine, de pente "), f("m\\cdot m'"), t(" dans les deux ordres.")]),
        calcul(sq, [
          ligne(`(f\\circ g)(x)=${polyL(e.fog)}`, `pente ${parN(e.f[1])}·${parN(e.g[1])} = ${pente}`.replace(/-/g, "−")),
          ligne(`(g\\circ f)(x)=${polyL(e.gof)}`, e.commutent ? "même pente, même terme constant" : "même pente, terme constant différent"),
        ]),
        resultat(sq, reponse(e, phase)),
        piege(sq, e.commutent ? [t("Croire que "), f("f\\circ g\\neq g\\circ f"), t(" toujours : ici, les deux ordres donnent la même fonction.")] : [t("Conclure à l'égalité sur la seule pente : le terme constant compte aussi.")]),
      ];
    }
  }
}

export function correctionDetailleeComposerPolynomes(e: E): EtapeCorrection[] {
  return phases(e).flatMap((p, i) => etape(e, p, "abcde"[i]));
}
