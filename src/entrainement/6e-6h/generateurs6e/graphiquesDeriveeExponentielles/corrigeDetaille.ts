import type { ExerciceGraphiqueDeriveeExponentielle } from "../../core6e/graphiquesDeriveeExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { construireGrilleSvgCandidatsDeriveeExpo } from "../../export6e/svgGraphDeriveeExpo";
import { phaseInitiale, phaseApres, type PhaseGraphiqueDeriveeExponentielle } from "../../moteur6e/typesGraphiquesDeriveeExponentielles";
import { basePuissanceLatex, calculerViewBoxGraphique, formatDeriveeCorrecteLatex, lnBaseLatex } from "../../ui6e/formatGraphiquesDeriveeExponentielles";
import { COURS_DERIVEE, COURS_GRAPHIQUE, coefDevant, finaliser, justif, lim } from "../../ui6e/corrigeExponentielles1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen8` (graphique de la fonction dérivée) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : adaptateur papier ET appli
 * (`App6gen8.tsx`). Une lettre par ÉCRAN : familles A et C, un seul écran (« selection » : f′
 * calculée puis ses caractéristiques testées sur les graphiques) ; familles B et D, « derivee »
 * (règle du quotient / de 1/u ligne à ligne, résultat `formatDeriveeCorrecteLatex`) puis
 * « selection » (caractéristiques de f′ lues, figure des candidats avec le bon mis en évidence).
 */

const LETTRES = "ABCD";

export function sequenceGraphiquesDeriveeExponentielles(e: ExerciceGraphiqueDeriveeExponentielle): PhaseGraphiqueDeriveeExponentielle[] {
  const phases: PhaseGraphiqueDeriveeExponentielle[] = [];
  let p: PhaseGraphiqueDeriveeExponentielle | "termine" = phaseInitiale(e);
  while (p !== "termine") {
    phases.push(p);
    p = phaseApres(p);
  }
  return phases;
}

export function lettreCorrecteGraphiqueDeriveeExpo(e: ExerciceGraphiqueDeriveeExponentielle): string {
  return LETTRES[e.indexCorrect] ?? String(e.indexCorrect + 1);
}

function figure(e: ExerciceGraphiqueDeriveeExponentielle): string {
  return construireGrilleSvgCandidatsDeriveeExpo(e, calculerViewBoxGraphique(e), e.indexCorrect);
}

function kxL(k: number): string {
  return `${coefDevant(k)}x`;
}

/** Étape « selection » : lignes de caractéristiques de f′, résumé, piège. */
function etapeSelection(e: ExerciceGraphiqueDeriveeExponentielle, sq: string, avecDerivee: boolean): EtapeCorrection[] {
  const L = lettreCorrecteGraphiqueDeriveeExpo(e);
  const lignes: LigneCalcul[] = [];
  let resume: string;
  let pg: FragmentConsigne[];
  switch (e.famille) {
    case "A": {
      const a = e.a;
      const ca = coefDevant(a);
      lignes.push(
        ligne(`f'(x)=${ca}e^{x}+${a < 0 ? `(${kxL(a)})` : kxL(a)}e^{x}`, justif("règle du produit, ", { l: "(e^{x})'=e^{x}" })),
        ligne(`=${ca}e^{x}(1+x)`, justif("on met ", { l: `${ca}e^{x}` }, " en évidence")),
        ligne("f'(-1)=0", "la courbe de f′ coupe l'axe des x en x = −1"),
        ligne(`f'(0)=${a}`, "ordonnée à l'origine"),
        ligne(`f'(-2)=${a === -1 ? "" : a === 1 ? "-" : -a}e^{-2}`, `extremum de f′ en x = −2 (${a > 0 ? "minimum" : "maximum"})`),
        ligne(`${lim("-\\infty")}f'(x)=0`, "asymptote horizontale y = 0 à gauche"),
      );
      resume = `f′ s'annule en x = −1, ${a > 0 ? "a un minimum" : "a un maximum"} en x = −2 et tend vers 0 à gauche.`;
      pg = [texte("Le facteur "), latex("(1+x)"), texte(" issu du produit crée un zéro et un extremum que l'exponentielle seule n'a pas : une courbe monotone est fausse.")];
      break;
    }
    case "B": {
      const lnB = lnBaseLatex(e.base);
      const sup = e.base > 1;
      lignes.push(
        ligne(`${lnB}${sup ? ">" : "<"}0`, sup ? "base supérieure à 1" : "base comprise entre 0 et 1"),
        ligne(`f'(x)${sup ? ">" : "<"}0`, "signe du numérateur, le dénominateur est un carré positif"),
        ligne(`f'(0)=\\dfrac{${lnB}}{4}`, justif("sommet de la bosse, car ", { l: `${basePuissanceLatex(e.base)}^{0}=1` })),
        ligne(`${lim("+\\infty")}f'(x)=0`, "la courbe revient vers l'axe des x"),
        ligne(`${lim("-\\infty")}f'(x)=0`, "des deux côtés"),
      );
      resume = `f′ garde le signe ${sup ? "+" : "−"} sur ℝ (jamais nulle), bosse centrée en x = 0, tend vers 0 aux deux bouts.`;
      pg = sup ? [texte("La dérivée ne change jamais de signe : une courbe qui traverse l'axe des x est fausse.")] : [texte("Avec une base entre 0 et 1, "), latex(`${lnB}`), texte(" est négatif : la bosse est tournée vers le bas.")];
      break;
    }
    case "C": {
      const k = e.k;
      const kx = kxL(k);
      lignes.push(
        ligne(`f'(x)=\\dfrac{${k === 1 ? "" : k}e^{${kx}}-${k === 1 ? "" : k}e^{-${kx}}}{2}`, justif("car ", { l: `(e^{${kx}})'=${k === 1 ? "" : k}e^{${kx}}` }, " et ", { l: `(e^{-${kx}})'=-${k === 1 ? "" : k}e^{-${kx}}` })),
        ...(k === 1 ? [] : [ligne(`=${k}\\cdot\\dfrac{e^{${kx}}-e^{-${kx}}}{2}`, `on met ${k} en évidence`)]),
        ligne("f'(0)=0", "la courbe de f′ passe par l'origine"),
        ligne("f'(-x)=-f'(x)", "f′ est impaire : symétrique par rapport à l'origine"),
        ligne(`${lim("+\\infty")}f'(x)=+\\infty`, "f′ n'est pas bornée"),
      );
      resume = "f′ impaire, croissante, passe par l'origine et n'est pas bornée.";
      pg = [texte("Le signe − de la dérivée de "), latex(`e^{-${kx}}`), texte(" est souvent oublié : on obtiendrait une courbe paire, au lieu d'une courbe impaire.")];
      break;
    }
    case "D": {
      const k = e.k;
      lignes.push(
        ligne("x\\neq 0", "valeur exclue : asymptote verticale x = 0, deux branches"),
        ligne(`f'(x)${k > 0 ? "<" : ">"}0`, `numérateur ${-k > 0 ? "positif" : "négatif"}, dénominateur carré positif`),
        ligne(`${lim("+\\infty")}f'(x)=0`, "asymptote y = 0 à droite"),
        ligne(`${lim("-\\infty")}f'(x)=0`, "asymptote y = 0 à gauche"),
      );
      resume = `deux branches séparées en x = 0, f′ ${k > 0 ? "négative" : "positive"} partout, qui tend vers 0 aux deux bouts.`;
      pg = [texte("Le point "), latex("x=0"), texte(" est exclu : une courbe continue en "), latex("x=0"), texte(" ne peut pas être la dérivée.")];
      break;
    }
  }
  return [
    utilise(sq, [
      ...(avecDerivee ? [texte("On part de la dérivée obtenue à l'étape précédente, puis ")] : [texte(`On calcule f′ ${COURS_DERIVEE}, puis `)]),
      texte(`on relève ses caractéristiques (zéros, signe, extremum, limites, parité) et on cherche le graphique qui les a toutes ${COURS_GRAPHIQUE}.`),
    ]),
    calcul(sq, lignes),
    { ...resultat(sq, [texte(`Graphique ${L} : ${resume}`)]), figureHtml: figure(e) },
    piege(sq, pg),
  ];
}

function etapeDerivee(e: ExerciceGraphiqueDeriveeExponentielle): EtapeCorrection[] {
  const rep = formatDeriveeCorrecteLatex(e) as string;
  if (e.famille === "B") {
    const lnB = lnBaseLatex(e.base);
    const bp = basePuissanceLatex(e.base);
    const ux = `${bp}^{x}`;
    return [
      utilise("a", [texte("Règle du quotient "), latex("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}"), texte(" avec "), latex(`u=${ux}`), texte(", "), latex(`v=${ux}+1`), texte(" et "), latex("(a^{x})'=\\ln(a)\\,a^{x}"), texte(` ${COURS_DERIVEE}.`)]),
      calcul("a", [
        ligne(`u'(x)=${lnB}\\,${ux}`),
        ligne(`v'(x)=${lnB}\\,${ux}`, "la constante 1 a une dérivée nulle"),
        ligne(`f'(x)=\\dfrac{${lnB}\\,${ux}\\left(${ux}+1\\right)-${ux}\\cdot${lnB}\\,${ux}}{\\left(${ux}+1\\right)^2}`, "règle du quotient"),
        ligne(`=\\dfrac{${lnB}\\,${ux}}{\\left(${ux}+1\\right)^2}`, justif("on développe : les termes en ", { l: `${bp}^{2x}` }, " s'annulent")),
      ]),
      resultat("a", [latex(rep)]),
      piege("a", [texte("u et v ont la même dérivée : après développement, il ne reste qu'un terme au numérateur.")]),
    ];
  }
  const k = (e as Extract<ExerciceGraphiqueDeriveeExponentielle, { famille: "D" }>).k;
  const kx = kxL(k);
  const up = `${coefDevant(k)}e^{${kx}}`;
  return [
    utilise("a", [latex("\\left(\\dfrac{1}{u}\\right)'=-\\dfrac{u'}{u^2}"), texte(" avec "), latex(`u=e^{${kx}}-1`), texte(" et "), latex("(e^{kx})'=k\\,e^{kx}"), texte(` ${COURS_DERIVEE}.`)]),
    calcul("a", [
      ligne(`u(x)=e^{${kx}}-1`),
      ligne(`u'(x)=${up}`, "la constante −1 a une dérivée nulle"),
      ligne("f'(x)=-\\dfrac{u'(x)}{u(x)^2}", "dérivée de 1/u"),
      ligne(`=-\\dfrac{${up}}{\\left(e^{${kx}}-1\\right)^2}`, "on remplace u et u′"),
      ligne(`=${rep.replace(/^f'\(x\) = /, "")}`, "le signe − passe au numérateur"),
    ]),
    resultat("a", [latex(rep)]),
    piege("a", [texte("Le −1 du dénominateur ne disparaît pas : il reste dans le carré "), latex(`\\left(e^{${kx}}-1\\right)^2`), texte(" (et donne l'asymptote en x = 0).")]),
  ];
}

export function correctionDetailleeGraphiquesDeriveeExponentielles(e: ExerciceGraphiqueDeriveeExponentielle): EtapeCorrection[] {
  if (e.famille === "A" || e.famille === "C") return finaliser(etapeSelection(e, "a", false));
  return finaliser([...etapeDerivee(e), ...etapeSelection(e, "b", true)]);
}
