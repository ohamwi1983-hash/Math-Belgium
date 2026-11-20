import type { ExerciceEtudeA, ExerciceEtudeB, ExerciceEtudeC, ExerciceEtudeD, ExerciceEtudeFonctionExponentielle } from "../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../core6e/limitesExponentielles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { PhaseEtudeFonctionExponentielle } from "../../moteur6e/typesEtudeFonctionExponentielle";
import { construireGrilleSvgCandidatsEtudeExpo } from "../../export6e/svgGraphEtudeExpo";
import { calculerViewBox, coefExpLatex, contenuRecapPhase, exposantAffineLatex, formatCoefficientCLatex, formatXMoinsP, mLnBaseLatex, positionLatex } from "../../ui6e/formatEtudeFonctionExponentielle";
import { COURS_DERIVEE, COURS_ETUDE, COURS_LIMITES, coefDevant, finaliserCorrige, justif, lim, tableauVariationLatex } from "../../ui6e/corrigeExponentielles2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen11` (étude complète d'une fonction exponentielle) —
 * règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen11.tsx`). Étapes a à f = les six écrans (domaine,
 * limites, asymptotes, croissance, concavité, graphique — séquence fixe) ; résultats =
 * `contenuRecapPhase` (réponses de l'écran). Limites écrites « x → a » sous « lim », dérivées
 * première et seconde ligne à ligne, signes étudiés intervalle par intervalle, tableau de variation
 * dans le résultat de l'étape « croissance », graphiques candidats (le bon mis en évidence) sous le
 * résultat de l'étape « graphique ».
 */

export const ORDRE_PHASES_ETUDE_EXPO: PhaseEtudeFonctionExponentielle[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];
const LETTRE: Record<PhaseEtudeFonctionExponentielle, string> = { domaine: "a", limites: "b", asymptotes: "c", croissance: "d", concavite: "e", graphique: "f" };
const PI = "x\\to+\\infty";
const MI = "x\\to-\\infty";
const infini = (positif: boolean) => (positif ? "+\\infty" : "-\\infty");

function limL(c: CibleLimite): string {
  if (c.type === "plus_infini") return "+\\infty";
  if (c.type === "moins_infini") return "-\\infty";
  if (c.type === "zero") return "0";
  return String(c.valeur);
}

interface Etude {
  lignes: Record<PhaseEtudeFonctionExponentielle, LigneCalcul[]>;
  utilise: Partial<Record<PhaseEtudeFonctionExponentielle, FragmentConsigne[]>>;
  tableau: string;
  piege: { phase: PhaseEtudeFonctionExponentielle; texte: FragmentConsigne[] };
}

const UTILISE_COMMUN: Record<PhaseEtudeFonctionExponentielle, FragmentConsigne[]> = {
  domaine: [texte("Une exponentielle "), latex("a^{u}"), texte(" (base "), latex("a>0"), texte(") existe pour tout réel u : seules comptent les conditions d'existence de l'exposant lui-même "), texte(`${COURS_ETUDE}.`)],
  limites: [
    texte("Limites de référence "),
    latex("\\lim\\limits_{u\\to+\\infty}e^{u}=+\\infty"),
    texte(" et "),
    latex("\\lim\\limits_{u\\to-\\infty}e^{u}=0"),
    texte(" ; croissance comparée : l'exponentielle l'emporte sur toute puissance de x "),
    texte(`${COURS_LIMITES}.`),
  ],
  asymptotes: [
    texte("Limite infinie quand x tend vers une valeur finie a : asymptote verticale "),
    latex("x=a"),
    texte(". Limite finie L en l'infini : asymptote horizontale "),
    latex("y=L"),
    texte(". Une limite infinie en l'infini ne donne pas d'asymptote horizontale "),
    texte(`${COURS_ETUDE}.`),
  ],
  croissance: [texte("Dérivée d'une exponentielle "), latex("\\left(e^{u}\\right)'=u'e^{u}"), texte(" ; "), latex("f'>0"), texte(" ⇒ f croissante, "), latex("f'<0"), texte(" ⇒ f décroissante, un changement de signe de f′ donne un extremum "), texte(`${COURS_DERIVEE}.`)],
  concavite: [texte("Signe de la dérivée seconde : "), latex("f''>0"), texte(" ⇒ f convexe, "), latex("f''<0"), texte(" ⇒ f concave, un changement de signe de f″ donne un point d'inflexion "), texte(`${COURS_ETUDE}.`)],
  graphique: [texte("On confronte chaque graphique aux conclusions de l'étude : asymptotes, variations et extremum, concavité.")],
};

// ---------------------------------------------------------------------------- Famille A

function etudeA(e: ExerciceEtudeA): Etude {
  const { m } = e;
  const u = exposantAffineLatex(e.m, e.n);
  const eu = `e^{${u}}`;
  const fp = coefExpLatex(m, eu);
  const coteZero = m > 0 ? MI : PI;
  const coteInfini = m > 0 ? PI : MI;
  const plusLim = limL(e.limitePlusInfini);
  const moinsLim = limL(e.limiteMoinsInfini);
  const mPos = m > 0;
  const limU = (dir: string, positifDir: boolean) => lim(dir, `(${u})`, infini(positifDir === mPos), `m = ${m} ${mPos ? ">" : "<"} 0`);
  const limF = (dir: string, positifDir: boolean, val: string) =>
    lim(dir, "f(x)", val, positifDir === mPos ? justif("", { l: "e^{u}\\to+\\infty" }, " quand ", { l: "u\\to+\\infty" }) : justif("", { l: "e^{u}\\to 0" }, " quand ", { l: "u\\to-\\infty" }));
  return {
    lignes: {
      domaine: [ligne("D_f=\\mathbb{R}", justif("l'exposant ", { l: u }, " existe pour tout réel x"))],
      limites: [limU(PI, true), limF(PI, true, plusLim), limU(MI, false), limF(MI, false, moinsLim)],
      asymptotes: [
        lim(coteZero, "f(x)", "0", `limite finie en ${mPos ? "−∞" : "+∞"}`),
        ligne("y=0", `asymptote horizontale en ${mPos ? "−∞" : "+∞"}`),
        lim(coteInfini, "f(x)", "+\\infty", "limite infinie : pas d'asymptote horizontale de ce côté"),
        lim(coteInfini, "\\dfrac{f(x)}{x}", infini(mPos), "l'exponentielle l'emporte sur x : pas d'asymptote oblique"),
      ],
      croissance: [
        ligne(`f'(x)=${eu}\\cdot(${u})'`, justif("", { l: "\\left(e^{u}\\right)'=u'e^{u}" })),
        ligne(`=${fp}`, justif("", { l: `(${u})'=${m}` })),
        ligne(`${eu}>0`, "pour tout x : une exponentielle est strictement positive"),
        ligne(`f'(x)${mPos ? ">" : "<"}0`, justif("pour tout x : signe de ", { l: `m=${m}` })),
      ],
      concavite: [
        ligne(`f''(x)=${fp}\\cdot ${m < 0 ? `(${m})` : m}`, justif("on dérive ", { l: `f'(x)=${fp}` }, " : ", { l: "\\left(e^{u}\\right)'=u'e^{u}" })),
        ligne(`=${coefExpLatex(m * m, eu)}`, "on multiplie"),
        ligne("f''(x)>0", justif("pour tout x : ", { l: `${m * m}>0` }, " et une exponentielle est positive")),
      ],
      graphique: [
        ligne("y=0", `asymptote horizontale en ${mPos ? "−∞" : "+∞"} seulement`),
        ligne(`f'(x)${mPos ? ">" : "<"}0`, mPos ? "courbe toujours montante" : "courbe toujours descendante"),
        ligne("f''(x)>0", "convexe partout : aucun point d'inflexion"),
      ],
    },
    utilise: {},
    tableau: tableauVariationLatex(["-\\infty", "+\\infty"], [mPos ? "+" : "-"], [moinsLim, plusLim]),
    piege: mPos
      ? { phase: "concavite", texte: [texte("La courbe monte de plus en plus vite, mais "), latex("f''>0"), texte(" partout : il n'y a aucun point d'inflexion.")] }
      : { phase: "asymptotes", texte: [texte("Coefficient de x négatif : l'asymptote "), latex("y=0"), texte(" est en +∞, pas en −∞.")] },
  };
}

// ---------------------------------------------------------------------------- Famille B

function etudeB(e: ExerciceEtudeB): Etude {
  const { k, p } = e;
  const xp = formatXMoinsP(p);
  const xp2 = p === 0 ? "x^{2}" : `(${xp})^{2}`;
  const xp4 = p === 0 ? "x^{4}" : `(${xp})^{4}`;
  const deuxXP = p === 0 ? "2x" : `2(${xp})`;
  const eU = `e^{\\frac{${k}}{${xp}}}`;
  const frac = `\\dfrac{${k}}{${xp}}`;
  const droite = k > 0;
  const limPlus = limL(e.limitePointPlus);
  const limMoins = limL(e.limitePointMoins);
  const xi = p - k / 2;
  const xiL = positionLatex(xi);
  const decr = -k < 0;
  const cst = k - 2 * p;
  const coefFp = coefDevant(-k, `\\dfrac{${eU}}{${xp2}}`);
  const zeroL: LigneCalcul[] = [ligne(`${k}+${deuxXP}=0`, "seul ce facteur peut annuler f″")];
  if (p !== 0) zeroL.push(ligne(`2x${cst === 0 ? "" : cst > 0 ? `+${cst}` : `${cst}`}=0`, "on distribue"));
  if (cst !== 0) zeroL.push(ligne(`2x=${-cst}`, cst > 0 ? `on soustrait ${cst}` : `on ajoute ${-cst}`));
  zeroL.push(ligne(`x=${xiL}`, "on divise par 2"));
  return {
    lignes: {
      domaine: [ligne(`${xp}\\neq 0`, "dénominateur de l'exposant non nul"), ...(p === 0 ? [] : [ligne(`x\\neq ${p}`, p > 0 ? `on ajoute ${p}` : `on soustrait ${-p}`)])],
      limites: [
        lim(`x\\to ${p}^{+}`, frac, infini(droite), justif("", { l: String(k) }, " divisé par un nombre positif qui tend vers 0")),
        lim(`x\\to ${p}^{+}`, "f(x)", limPlus, droite ? justif("", { l: "e^{u}\\to+\\infty" }, " quand ", { l: "u\\to+\\infty" }) : justif("", { l: "e^{u}\\to 0" }, " quand ", { l: "u\\to-\\infty" })),
        lim(`x\\to ${p}^{-}`, frac, infini(!droite), justif("", { l: String(k) }, " divisé par un nombre négatif qui tend vers 0")),
        lim(`x\\to ${p}^{-}`, "f(x)", limMoins, !droite ? justif("", { l: "e^{u}\\to+\\infty" }, " quand ", { l: "u\\to+\\infty" }) : justif("", { l: "e^{u}\\to 0" }, " quand ", { l: "u\\to-\\infty" })),
        lim(PI, frac, "0", "constante divisée par un infini"),
        lim(PI, "f(x)", "e^{0}", "l'exponentielle est continue"),
        ligne("=1", justif("", { l: "e^{0}=1" })),
        lim(MI, "f(x)", "1", "même calcul en −∞"),
      ],
      asymptotes: [
        lim(`x\\to ${p}^{${droite ? "+" : "-"}}`, "f(x)", "+\\infty", `limite infinie à ${droite ? "droite" : "gauche"} de ${p}`.replace("-", "−")),
        ligne(`x=${p}`, `asymptote verticale, du côté ${droite ? "droit" : "gauche"} seulement`),
        lim(`x\\to ${p}^{${droite ? "-" : "+"}}`, "f(x)", "0", "limite finie de l'autre côté : pas d'asymptote de ce côté"),
        lim(PI, "f(x)", "1", "et de même en −∞"),
        ligne("y=1", "asymptote horizontale des deux côtés"),
      ],
      croissance: [
        ligne(`f'(x)=${eU}\\cdot\\left(${frac}\\right)'`, justif("", { l: "\\left(e^{u}\\right)'=u'e^{u}" })),
        ligne(`=${eU}\\cdot\\dfrac{${-k}}{${xp2}}`, justif("", { l: "\\left(\\dfrac{k}{v}\\right)'=-\\dfrac{k\\,v'}{v^{2}}" })),
        ligne(`${eU}>0`, justif("pour tout ", { l: `x\\neq ${p}` })),
        ligne(`${xp2}>0`, justif("pour tout ", { l: `x\\neq ${p}` })),
        ligne(`f'(x)${decr ? "<" : ">"}0`, justif("signe de ", { l: `-k=${-k}` }, ", sur chaque intervalle du domaine")),
      ],
      concavite: [
        ligne(`f'(x)=${coefFp}`, "dérivée calculée pour la croissance"),
        ligne(`f''(x)=${coefDevant(-k, `\\dfrac{\\left(${eU}\\right)'\\cdot ${xp2}-${eU}\\cdot ${deuxXP}}{${xp4}}`)}`, justif("règle du quotient, ", { l: `\\left(${xp2}\\right)'=${deuxXP}` })),
        ligne(`=${coefDevant(-k, `\\dfrac{${coefDevant(-k, eU)}-${deuxXP}\\,${eU}}{${xp4}}`)}`, justif("car ", { l: `\\left(${eU}\\right)'\\cdot ${xp2}=${coefDevant(-k, eU)}` })),
        ligne(`=${coefDevant(-k, `\\dfrac{-${eU}\\,(${k}+${deuxXP})}{${xp4}}`)}`, justif("on met ", { l: `-${eU}` }, " en évidence")),
        ligne(`=\\dfrac{${coefDevant(k, eU)}\\,(${k}+${deuxXP})}{${xp4}}`, justif("", { l: `${-k < 0 ? `(${-k})` : -k}\\cdot(-1)=${k}` })),
        ...zeroL,
        ligne(`f''(x)${droite ? "<" : ">"}0`, justif("pour ", { l: `x<${xiL}` }, ", ", { l: `x\\neq ${p}` }, " : signe de ", { l: `k=${k}` }, " fois un facteur négatif")),
        ligne(`f''(x)${droite ? ">" : "<"}0`, justif("pour ", { l: `x>${xiL}` }, ", ", { l: `x\\neq ${p}` }, " : f″ change de signe")),
      ],
      graphique: [
        ligne(`x=${p}`, `asymptote verticale du côté ${droite ? "droit" : "gauche"} seulement`),
        ligne("y=1", "asymptote horizontale des deux côtés"),
        ligne(`f'(x)${decr ? "<" : ">"}0`, decr ? "décroissante sur chaque intervalle" : "croissante sur chaque intervalle"),
        ligne(`x=${xiL}`, "abscisse du point d'inflexion"),
      ],
    },
    utilise: { concavite: [texte("On dérive "), latex("f'"), texte(" avec la règle du quotient "), latex("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^{2}}"), texte(", puis on étudie le signe de f″ "), texte(`${COURS_ETUDE}.`)] },
    tableau: tableauVariationLatex(["-\\infty", String(p), "+\\infty"], decr ? ["-", "-"] : ["+", "+"], ["1", `${limMoins}\\,\\|\\,${limPlus}`, "1"], { interdite: [false, true, false] }),
    piege: { phase: "asymptotes", texte: [texte("L'asymptote verticale "), latex(`x=${p}`), texte(` n'existe que d'un côté : de l'autre, f tend vers 0.`)] },
  };
}

// ---------------------------------------------------------------------------- Famille C

function etudeC(e: ExerciceEtudeC): Etude {
  const { base: b, m, n, p } = e;
  const u = exposantAffineLatex(m, n);
  const bu = `${b}^{${u}}`;
  const cL = formatCoefficientCLatex(m, b, p);
  const mln = mLnBaseLatex(m, b);
  const x0 = (p - n) / m;
  const x0L = positionLatex(x0);
  const resol: LigneCalcul[] = [ligne(`\\iff ${u}=${p}`, "même base : exposants égaux")];
  if (!(m === 1 && n === 0)) {
    if (n !== 0) resol.push(ligne(`\\iff ${m === 1 ? "x" : `${m}x`}=${p - n}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
    if (m !== 1) resol.push(ligne(`\\iff x=${x0L}`, `on divise par ${m}`));
  }
  return {
    lignes: {
      domaine: [ligne("D_f=\\mathbb{R}", justif("une puissance de base ", { l: `${b}>0` }, " existe pour tout exposant ; le terme en x aussi"))],
      limites: [
        lim(MI, bu, "0", justif("base ", { l: `${b}>1` }, " et exposant qui tend vers ", { l: "-\\infty" })),
        lim(MI, `\\left(-${cL}\\,x\\right)`, "+\\infty", "un nombre négatif fois −∞"),
        lim(MI, "f(x)", "+\\infty", "somme des limites"),
        ligne(`f(x)=x\\left(\\dfrac{${bu}}{x}-${cL}\\right)`, "en +∞, forme ∞ − ∞ : on met x en évidence"),
        lim(PI, `\\dfrac{${bu}}{x}`, "+\\infty", "croissance comparée : l'exponentielle l'emporte"),
        lim(PI, "f(x)", "+\\infty", "produit de deux limites +∞"),
      ],
      asymptotes: [
        ligne(`f(x)-\\left(-${cL}\\,x\\right)=${bu}`, "écart entre f et la droite candidate"),
        lim(MI, bu, "0", "étape 2"),
        ligne(`y=-${cL}\\,x`, "asymptote oblique en −∞"),
        lim(PI, "\\dfrac{f(x)}{x}", "+\\infty", "pas d'asymptote en +∞ (l'exponentielle l'emporte)"),
      ],
      croissance: [
        ligne(`f'(x)=${mln}\\cdot ${bu}-${cL}`, justif("", { l: "\\left(a^{u}\\right)'=u'\\ln(a)\\,a^{u}" }, " et ", { l: "(cx)'=c" })),
        ligne(`=${mln}\\left(${bu}-${b}^{${p}}\\right)`, justif("on met ", { l: mln }, " en évidence : ", { l: `${cL}=${mln}\\cdot ${b}^{${p}}` })),
        ligne(`f'(x)=0\\iff ${bu}=${b}^{${p}}`, justif("", { l: `${mln}>0` })),
        ...resol,
        ligne("f'(x)<0", justif("pour ", { l: `x<${x0L}` }, " : la puissance est plus petite que ", { l: `${b}^{${p}}` })),
        ligne("f'(x)>0", justif("pour ", { l: `x>${x0L}` }, " : la puissance est plus grande que ", { l: `${b}^{${p}}` })),
      ],
      concavite: [
        ligne(`f''(x)=${mln}\\cdot\\left(${mln}\\cdot ${bu}\\right)`, justif("on dérive ", { l: `${bu}` }, " ; la constante disparaît")),
        ligne(`=\\left(${mln}\\right)^{2}\\cdot ${bu}`, "on regroupe"),
        ligne("f''(x)>0", "pour tout x : un carré non nul fois une puissance positive"),
      ],
      graphique: [
        ligne(`y=-${cL}\\,x`, "la courbe se rapproche de cette droite en −∞"),
        ligne(`x=${x0L}`, "abscisse du minimum, le seul extremum"),
        ligne("f''(x)>0", "convexe partout : aucun point d'inflexion"),
      ],
    },
    utilise: {
      asymptotes: [texte("Asymptote oblique : la droite "), latex("y=ax+b"), texte(" est asymptote en −∞ si "), latex("\\lim\\limits_{x\\to-\\infty}\\left[f(x)-(ax+b)\\right]=0"), texte(" ; on cherche la partie de f(x) qui tend vers 0 "), texte(`${COURS_ETUDE}.`)],
      croissance: [texte("Dérivée d'une puissance de base a : "), latex("\\left(a^{u}\\right)'=u'\\ln(a)\\,a^{u}"), texte(" ; puis signe de f′ "), texte(`${COURS_DERIVEE}.`)],
    },
    tableau: tableauVariationLatex(["-\\infty", x0L, "+\\infty"], ["-", "+"], ["+\\infty", `f\\!\\left(${x0L}\\right)`, "+\\infty"], { zero: [false, true, false] }),
    piege: { phase: "limites", texte: [texte("En +∞, la forme ∞ − ∞ n'est pas une réponse : on met x en évidence, et l'exponentielle l'emporte (croissance comparée).")] },
  };
}

// ---------------------------------------------------------------------------- Famille D

function etudeD(e: ExerciceEtudeD): Etude {
  const { a } = e;
  const pos = a > 0;
  const ax = coefDevant(a, "x");
  const aex = coefExpLatex(a, "e^{x}");
  const fm1 = a > 0 ? `-\\dfrac{${a}}{e}` : `\\dfrac{${-a}}{e}`;
  const aFois = a < 0 ? `(${a})` : String(a);
  return {
    lignes: {
      domaine: [ligne("D_f=\\mathbb{R}", justif("", { l: "x" }, " et ", { l: "e^{x}" }, " existent pour tout réel x"))],
      limites: [
        lim(PI, "x\\,e^{x}", "+\\infty", "produit de deux limites +∞"),
        lim(PI, "f(x)", infini(pos), justif("multiplié par ", { l: `a=${a}` })),
        lim(MI, "x\\,e^{x}", "0", "croissance comparée : l'exponentielle l'emporte"),
        lim(MI, "f(x)", "0", justif("multiplié par ", { l: `a=${a}` })),
      ],
      asymptotes: [
        lim(MI, "f(x)", "0", "limite finie en −∞"),
        ligne("y=0", "asymptote horizontale en −∞"),
        ligne(`\\dfrac{f(x)}{x}=${aex}`, "on simplifie par x"),
        lim(PI, a < 0 ? `\\left(${aex}\\right)` : aex, infini(pos), "ni asymptote horizontale ni asymptote oblique en +∞"),
      ],
      croissance: [
        ligne(`f'(x)=${coefDevant(a, "\\left(1\\cdot e^{x}+x\\,e^{x}\\right)")}`, justif("règle du produit ", { l: "(uv)'=u'v+uv'" })),
        ligne(`=${aex}(1+x)`, justif("on met ", { l: "e^{x}" }, " en évidence")),
        ligne("f'(x)=0\\iff 1+x=0", justif("", { l: "e^{x}>0" })),
        ligne("\\iff x=-1", "on soustrait 1"),
        ligne(`f'(x)${pos ? "<" : ">"}0`, justif("pour ", { l: "x<-1" }, " : signe de ", { l: `a=${a}` }, " fois un facteur négatif")),
        ligne(`f'(x)${pos ? ">" : "<"}0`, justif("pour ", { l: "x>-1" })),
        ligne(`f(-1)=${aFois}\\cdot(-1)\\cdot e^{-1}`, `valeur du ${pos ? "minimum" : "maximum"}`),
        ligne(`=${fm1}`, justif("", { l: "e^{-1}=\\dfrac{1}{e}" })),
      ],
      concavite: [
        ligne(`f''(x)=${coefDevant(a, "\\left(e^{x}(1+x)+e^{x}\\cdot 1\\right)")}`, "règle du produit sur f′"),
        ligne(`=${aex}(2+x)`, justif("on met ", { l: "e^{x}" }, " en évidence")),
        ligne("f''(x)=0\\iff 2+x=0", justif("", { l: "e^{x}>0" })),
        ligne("\\iff x=-2", "on soustrait 2"),
        ligne(`f''(x)${pos ? "<" : ">"}0`, justif("pour ", { l: "x<-2" })),
        ligne(`f''(x)${pos ? ">" : "<"}0`, justif("pour ", { l: "x>-2" }, " : f″ change de signe")),
      ],
      graphique: [
        ligne("y=0", "asymptote horizontale en −∞ seulement"),
        ligne("x=-1", `abscisse du ${pos ? "minimum" : "maximum"}`),
        ligne("x=-2", "abscisse du point d'inflexion, à gauche de l'extremum"),
      ],
    },
    utilise: {
      croissance: [texte("Règle du produit "), latex("(uv)'=u'v+uv'"), texte(" avec "), latex("u=" + ax), texte(" et "), latex("v=e^{x}"), texte(", puis signe de f′ "), texte(`${COURS_DERIVEE}.`)],
    },
    tableau: tableauVariationLatex(["-\\infty", "-1", "+\\infty"], pos ? ["-", "+"] : ["+", "-"], ["0", fm1, infini(pos)], { zero: [false, true, false] }),
    piege: { phase: "limites", texte: [texte("En −∞, "), latex("x\\,e^{x}\\to 0"), texte(" (croissance comparée) : pas "), latex("-\\infty"), texte(".")] },
  };
}

function etude(e: ExerciceEtudeFonctionExponentielle): Etude {
  switch (e.famille) {
    case "A":
      return etudeA(e);
    case "B":
      return etudeB(e);
    case "C":
      return etudeC(e);
    case "D":
      return etudeD(e);
  }
}

function fragmentsRecap(e: ExerciceEtudeFonctionExponentielle, phase: PhaseEtudeFonctionExponentielle): FragmentConsigne[] {
  const { texte: t, latex: l } = contenuRecapPhase(e, phase);
  return l !== null ? [latex(l)] : [texte(t ?? "")];
}

export function correctionDetailleeEtudeFonctionExpo(e: ExerciceEtudeFonctionExponentielle): EtapeCorrection[] {
  const et = etude(e);
  const lettre = "ABCD"[e.indexCorrect] ?? String(e.indexCorrect + 1);
  et.lignes.graphique.push(ligne(`\\text{graphique}=${lettre}`, "le seul qui vérifie toutes ces conditions"));
  const etapes: EtapeCorrection[] = [];
  for (const phase of ORDRE_PHASES_ETUDE_EXPO) {
    const sq = LETTRE[phase];
    etapes.push(utilise(sq, et.utilise[phase] ?? UTILISE_COMMUN[phase]));
    etapes.push(calcul(sq, et.lignes[phase]));
    if (phase === "domaine") etapes.push(resultat(sq, [latex(`D_f=${contenuRecapPhase(e, "domaine").latex as string}`)]));
    else if (phase === "croissance") etapes.push(resultat(sq, [...fragmentsRecap(e, phase), texte(" : "), latex(et.tableau)]));
    else if (phase === "graphique") etapes.push({ ...resultat(sq, fragmentsRecap(e, phase)), figureHtml: construireGrilleSvgCandidatsEtudeExpo(e, calculerViewBox(e), e.indexCorrect) });
    else etapes.push(resultat(sq, fragmentsRecap(e, phase)));
    if (et.piege.phase === phase) etapes.push(piege(sq, et.piege.texte));
  }
  return finaliserCorrige(etapes);
}

export function lettrePhaseEtudeExpo(phase: PhaseEtudeFonctionExponentielle): string {
  return LETTRE[phase];
}
