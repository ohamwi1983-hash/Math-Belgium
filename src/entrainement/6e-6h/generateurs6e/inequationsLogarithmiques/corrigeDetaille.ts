import type { AffineLog, BaseLog, Comparateur, ExerciceInequationLogarithmique, ExerciceLogA, ExerciceLogB, ExerciceLogC, ExerciceLogD, ExerciceLogE, ExerciceLogF } from "../../core6e/inequationsLogarithmiques.types";
import type { EnsembleReelGuide } from "../../core6e/ensembleReel.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { phaseApres, phaseInitiale, type PhaseInequationLogarithmique } from "../../moteur6e/typesInequationsLogarithmiques";
import { baseLatex, contenuRecapPhase, formatAffineLatex, formatCarreXMoinsR, formatCombinaisonC, formatEnonceLatex, formatQuadratiqueYLatex, inverserComparateurLatex, logBaseLatex, puissanceBaseLatex, symboleComparateurLatex } from "../../ui6e/formatInequationsLogarithmiques";
import { formatEnsembleReelLatex } from "../../ui6e/formatEnsembleReel";
import { COURS_INEQUATIONS, finaliserCorrige, justif } from "../../ui6e/corrigeLogarithmes1";
import type { Poly, Q } from "../../ui6e/corrigeIntegrales1";
import { lignesTrinome, polyL, polyMul, polySub, q, qDiv, qL, qSub, qVal } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen15` (inéquations logarithmiques) — règle
 * `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen15.tsx`, corrigé d'une étape échouée). Une étape
 * (lettre) = un écran réellement traversé (`phasesInequationLog`, même parcours que la session).
 * Résultats = réponses de l'écran (`contenuRecapPhase`, ensembles de l'instance) ; inéquations du
 * premier degré résolues ligne à ligne (sens changé en divisant par un négatif), trinômes par le
 * discriminant, intersection avec la CE écrite.
 */

export function phasesInequationLog(exercice: ExerciceInequationLogarithmique): PhaseInequationLogarithmique[] {
  const phases: PhaseInequationLogarithmique[] = [];
  let phase: PhaseInequationLogarithmique | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    phases.push(phase);
    phase = phaseApres(phase, exercice);
  }
  return phases;
}

const sym = (c: Comparateur) => `${symboleComparateurLatex(c)} `;
const inv = (c: Comparateur) => inverserComparateurLatex(c);
const aff = (m: number, n: number) => formatAffineLatex({ m, n });

function ens(e: EnsembleReelGuide): string {
  return e.forme === "intervalles" && e.morceaux.length === 0 ? "\\varnothing" : formatEnsembleReelLatex(e);
}

const OUVRE = "\\mathopen{]}";
const FERME = "\\mathclose{[}";

/** Intervalle « x cmp v » (v en LaTeX). */
function demiDroite(cmp: Comparateur, v: string): string {
  if (cmp === ">") return `${OUVRE}${v}\\,;\\,+\\infty${FERME}`;
  if (cmp === ">=") return `[${v}\\,;\\,+\\infty${FERME}`;
  if (cmp === "<") return `${OUVRE}-\\infty\\,;\\,${v}${FERME}`;
  return `${OUVRE}-\\infty\\,;\\,${v}]`;
}

function cmpArguments(ex: { baseSuperieureA1: boolean; comparateur: Comparateur }): Comparateur {
  return ex.baseSuperieureA1 ? ex.comparateur : inv(ex.comparateur);
}

function justifSens(ex: { baseSuperieureA1: boolean; base: BaseLog }): FragmentConsigne[] {
  return ex.baseSuperieureA1 ? justif("base ", { l: `${baseLatex(ex.base)}>1` }, " : sens conservé") : justif("base ", { l: `0<${baseLatex(ex.base)}<1` }, " : sens inversé");
}

function utiliseSens(ex: { baseSuperieureA1: boolean; base: BaseLog }, avant: string): FragmentConsigne[] {
  const b = baseLatex(ex.base);
  return [
    texte(avant),
    ...(ex.baseSuperieureA1 ? [texte("Base "), latex(`${b}>1`), texte(" : le logarithme est croissant, le sens de l'inégalité est conservé")] : [texte("Base "), latex(`0<${b}<1`), texte(" : le logarithme est décroissant, le sens de l'inégalité est inversé")]),
    texte(` ; on ne garde que les x de la CE ${COURS_INEQUATIONS}.`),
  ];
}

/**
 * Inéquation du premier degré m·x + n cmp V (V rationnel) résolue ligne à ligne : « m x cmp V − n »,
 * puis « x cmp' (V − n)/m » (sens changé si m < 0). Renvoie les lignes (la première peut être omise)
 * et la borne finale.
 */
function lignesInequation(m: number, n: number, cmp: Comparateur, V: Q, avecDepart = true): { lignes: LigneCalcul[]; borne: Q; cmpFinal: Comparateur } {
  const lignes: LigneCalcul[] = [];
  if (avecDepart) lignes.push(ligne(`${aff(m, n)}${sym(cmp)}${qL(V)}`));
  const reste = qSub(V, q(n));
  if (n !== 0) lignes.push(ligne(`${aff(m, 0)}${sym(cmp)}${qL(reste)}`, n > 0 ? `on soustrait ${n}` : `on ajoute ${-n}`));
  const borne = qDiv(reste, q(m));
  const cmpFinal = m > 0 ? cmp : inv(cmp);
  if (m !== 1) lignes.push(ligne(`x${sym(cmpFinal)}${qL(borne)}`, m > 0 ? `on divise par ${m}` : `on divise par ${m} : le sens change`));
  return { lignes, borne, cmpFinal };
}

/** Condition « m x + n > 0 » (argument strictement positif) résolue. */
function lignesCondition(m: number, n: number, quoi = "argument strictement positif"): LigneCalcul[] {
  const { lignes } = lignesInequation(m, n, ">", q(0), false);
  return [ligne(`${aff(m, n)}>0`, quoi), ...lignes];
}

function lignesIntersection(brut: string, ce: EnsembleReelGuide, sol: EnsembleReelGuide): LigneCalcul[] {
  return [ligne(`S=${brut}\\cap ${ens(ce)}`, "intersection avec la CE"), ligne(`=${ens(sol)}`)];
}

function resultatCE(sq: string, ce: EnsembleReelGuide): EtapeCorrection {
  return resultat(sq, [latex(`\\text{CE} : x\\in ${ens(ce)}`)]);
}

function utiliseCE(sq: string, deux: boolean): EtapeCorrection {
  return utilise(sq, [texte(`${deux ? "Chacun des deux arguments" : "L'argument du logarithme"} doit être strictement positif ${COURS_INEQUATIONS}${deux ? " ; la CE est l'intersection des conditions" : ""}.`)]);
}

/** Polynôme à coefficients entiers (degré → coefficient). */
function poly(c: [number, number][]): Poly {
  const p: Poly = new Map();
  for (const [d, v] of c) if (v !== 0) p.set(d, q(v));
  return p;
}

/** Ensemble où un trinôme a(x − r₁)(x − r₂), r₁ < r₂, vérifie « cmp 0 ». */
function ensembleTrinome(a: number, r1: Q, r2: Q, cmp: Comparateur): string {
  const positif = cmp === ">" || cmp === ">=";
  const large = cmp === ">=" || cmp === "<=";
  const exterieur = (a > 0) === positif;
  const [g, d] = [qL(r1), qL(r2)];
  if (exterieur) return `${OUVRE}-\\infty\\,;\\,${g}${large ? "]" : FERME} \\cup ${large ? "[" : OUVRE}${d}\\,;\\,+\\infty${FERME}`;
  return `${large ? "[" : OUVRE}${g}\\,;\\,${d}${large ? "]" : FERME}`;
}

function justifSigneTrinome(a: number): FragmentConsigne[] {
  return justif(`signe du trinôme : signe de a (${a > 0 ? "positif" : "négatif"}) à l'extérieur des racines`);
}

/** Lignes « discriminant → racines » d'un trinôme, puis l'ensemble où il vérifie « cmp 0 ». */
function lignesTrinomeEtSigne(p: Poly, cmp: Comparateur, variable = "x"): { lignes: LigneCalcul[]; ensemble: string } {
  const { lignes, racines } = lignesTrinome(p, variable);
  const a = qVal(p.get(2) ?? q(0));
  if (racines.length < 2) return { lignes, ensemble: "" };
  const ensemble = ensembleTrinome(a, racines[0], racines[1], cmp);
  return { lignes: [...lignes, ligne(`${variable}\\in ${ensemble}`, justifSigneTrinome(a))], ensemble };
}

// ---------------------------------------------------------------------------- Famille A

function correctionA(ex: ExerciceLogA): EtapeCorrection[] {
  const b = baseLatex(ex.base);
  const u = aff(ex.m, ex.n);
  const cmp = cmpArguments(ex);
  const bk = ex.k >= 0 ? q(Math.pow(ex.base.num, ex.k), Math.pow(ex.base.den, ex.k)) : q(Math.pow(ex.base.den, -ex.k), Math.pow(ex.base.num, -ex.k));
  const res = lignesInequation(ex.m, ex.n, cmp, bk, false);
  const lb: LigneCalcul[] = [
    ligne(`${logBaseLatex(b, u)}${sym(ex.comparateur)}${ex.k}`, "inéquation de départ"),
    ligne(`${logBaseLatex(b, u)}${sym(ex.comparateur)}${logBaseLatex(b, puissanceBaseLatex(ex.base, ex.k))}`, justif("", { l: `${ex.k}=${logBaseLatex(b, puissanceBaseLatex(ex.base, ex.k))}` })),
    ligne(`${u}${sym(cmp)}${puissanceBaseLatex(ex.base, ex.k)}`, justifSens(ex)),
    ligne(`${u}${sym(cmp)}${qL(bk)}`, "on calcule la puissance"),
    ...res.lignes,
    ...lignesIntersection(demiDroite(res.cmpFinal, qL(res.borne)), ex.ceEcran1, ex.solutionEcran2),
  ];
  const etapes: EtapeCorrection[] = [utiliseCE("a", false), calcul("a", lignesCondition(ex.m, ex.n)), resultatCE("a", ex.ceEcran1)];
  etapes.push(utilise("b", [texte("On écrit le second membre comme un logarithme de même base, "), latex(`k=${logBaseLatex(b, `${ex.base.den === 1 ? b : `\\left(${b}\\right)`}^{k}`)}`), ...utiliseSens(ex, ". ")]));
  etapes.push(calcul("b", lb), resultat("b", [latex(`S=${ens(ex.solutionEcran2)}`)]));
  etapes.push(
    piege(
      "b",
      !ex.baseSuperieureA1
        ? [texte("Base entre 0 et 1 : on inverse le sens en enlevant le logarithme.")]
        : ex.m < 0
          ? [texte("Diviser par "), latex(String(ex.m)), texte(" (négatif) inverse le sens de l'inégalité.")]
          : [texte("Sans l'intersection avec la CE, on garderait des x pour lesquels le logarithme n'existe pas.")],
    ),
  );
  return etapes;
}

// ---------------------------------------------------------------------------- Famille B

function correctionB(ex: ExerciceLogB): EtapeCorrection[] {
  const b = baseLatex(ex.base);
  const cmp = cmpArguments(ex);
  const g = formatAffineLatex(ex.g);
  const etapes: EtapeCorrection[] = [utiliseCE("a", true)];
  if (ex.sousType === "racine") {
    const sous = aff(ex.a, ex.b);
    etapes.push(calcul("a", [...lignesCondition(ex.a, ex.b, "radicande et argument strictement positifs"), ...lignesCondition(ex.g.m, ex.g.n)]), resultatCE("a", ex.ceEcran1));
    const carre = poly([
      [2, ex.g.m * ex.g.m],
      [1, 2 * ex.g.m * ex.g.n],
      [0, ex.g.n * ex.g.n],
    ]);
    const diff = polySub(poly([[1, ex.a], [0, ex.b]]), carre);
    const { lignes, ensemble } = lignesTrinomeEtSigne(diff, cmp);
    etapes.push(
      utilise("b", [
        ...utiliseSens(ex, "Même base des deux côtés : on compare les arguments. "),
        texte(" Sur la CE, les deux membres sont positifs : on peut élever au carré sans changer le sens."),
      ]),
      calcul(
        "b",
        [
          ligne(`${logBaseLatex(b, `\\sqrt{${sous}}`)}${sym(ex.comparateur)}${logBaseLatex(b, g)}`, "inéquation de départ"),
          ligne(`\\sqrt{${sous}}${sym(cmp)}${g}`, justifSens(ex)),
          ligne(`${sous}${sym(cmp)}(${g})^{2}`, "deux membres positifs sur la CE : on élève au carré"),
          ligne(`${sous}${sym(cmp)}${polyL(carre)}`, "on développe le carré"),
          ligne(`${polyL(diff)}${sym(cmp)}0`, "on ramène tout dans le membre de gauche"),
          ...lignes,
          ...lignesIntersection(ensemble || ens(ex.comparaisonBruteEcran2), ex.ceEcran1, ex.solutionEcran2),
        ],
      ),
      resultat("b", [latex(`S=${ens(ex.solutionEcran2)}`)]),
      piege("b", [texte("Élever au carré n'est permis que parce que la CE rend les deux membres positifs.")]),
    );
    return etapes;
  }
  const f = formatAffineLatex(ex.f);
  etapes.push(calcul("a", [...lignesCondition(ex.f.m, ex.f.n), ...lignesCondition(ex.g.m, ex.g.n)]), resultatCE("a", ex.ceEcran1));
  const dm = ex.f.m - ex.g.m;
  const dn = ex.g.n - ex.f.n;
  const res = lignesInequation(dm, 0, cmp, q(dn), true);
  etapes.push(
    utilise("b", utiliseSens(ex, "Même base des deux côtés : on compare les arguments. ")),
    calcul("b", [
      ligne(`${logBaseLatex(b, f)}${sym(ex.comparateur)}${logBaseLatex(b, g)}`, "inéquation de départ"),
      ligne(`${f}${sym(cmp)}${g}`, justifSens(ex)),
      ...res.lignes.map((l, i) => (i === 0 ? { ...l, justification: "termes en x à gauche, constantes à droite" } : l)),
      ...lignesIntersection(demiDroite(res.cmpFinal, qL(res.borne)), ex.ceEcran1, ex.solutionEcran2),
    ]),
    resultat("b", [latex(`S=${ens(ex.solutionEcran2)}`)]),
    piege("b", !ex.baseSuperieureA1 ? [texte("Base entre 0 et 1 : comparer les arguments inverse le sens.")] : [texte("La comparaison des arguments ne vaut que sur la CE : il faut toujours intersecter.")]),
  );
  return etapes;
}

// ---------------------------------------------------------------------------- Famille C

function correctionC(ex: ExerciceLogC): EtapeCorrection[] {
  const b = baseLatex(ex.base);
  const cmp = cmpArguments(ex);
  const f = formatAffineLatex(ex.f);
  const g = formatAffineLatex(ex.g);
  const op = ex.sousType === "produit" ? "+" : "-";
  const combi = contenuRecapPhase(ex, "cCombiner").latex as string;
  // Lignes de calcul : parenthèses simples autour du produit (un groupe « \left…\right » est
  // insécable et sortait de sa cellule à 680 px) ; le résultat garde l'écriture de l'écran.
  const combiLigne = ex.sousType === "produit" ? `\\log_{${b}}((${f})(${g}))` : combi;
  const etapes: EtapeCorrection[] = [
    utiliseCE("a", true),
    calcul("a", [...lignesCondition(ex.f.m, ex.f.n), ...lignesCondition(ex.g.m, ex.g.n)]),
    resultatCE("a", ex.ceEcran1),
    utilise("b", [texte(ex.sousType === "produit" ? "Somme de logarithmes de même base : " : "Différence de logarithmes de même base : "), latex(ex.sousType === "produit" ? "\\log_b(f)+\\log_b(g)=\\log_b(f\\cdot g)" : "\\log_b(f)-\\log_b(g)=\\log_b\\!\\left(\\dfrac{f}{g}\\right)"), texte(` ${COURS_INEQUATIONS}.`)]),
    calcul("b", [
      ligne(`${logBaseLatex(b, f)}${op}${logBaseLatex(b, g)}${sym(ex.comparateur)}${logBaseLatex(b, String(ex.k))}`, "inéquation de départ"),
      ligne(`${combiLigne}${sym(ex.comparateur)}${logBaseLatex(b, String(ex.k))}`, ex.sousType === "produit" ? "propriété du produit" : "propriété du quotient"),
    ]),
    resultat("b", [latex(combi)]),
    utilise("c", utiliseSens(ex, "Même base des deux côtés : on compare les arguments. ")),
  ];
  const lc: LigneCalcul[] = [ligne(`${formatCombinaisonC(ex)}${sym(cmp)}${ex.k}`, justifSens(ex))];
  let brut: string;
  if (ex.sousType === "produit") {
    const pf = poly([[1, ex.f.m], [0, ex.f.n]]);
    const pg = poly([[1, ex.g.m], [0, ex.g.n]]);
    const prod = polyMul(pf, pg);
    const diff = polySub(prod, poly([[0, ex.k]]));
    lc.push(ligne(`${polyL(prod)}${sym(cmp)}${ex.k}`, "on développe"), ligne(`${polyL(diff)}${sym(cmp)}0`, `on soustrait ${ex.k}`));
    const { lignes, ensemble } = lignesTrinomeEtSigne(diff, cmp);
    lc.push(...lignes);
    brut = ensemble;
  } else {
    const kg = aff(ex.k * ex.g.m, ex.k * ex.g.n);
    lc.push(ligne(`${f}${sym(cmp)}${ex.k === 1 ? g : `${ex.k}(${g})`}`, justif("on multiplie par ", { l: g }, ", strictement positif sur la CE")));
    if (ex.k !== 1) lc.push(ligne(`${f}${sym(cmp)}${kg}`, "on distribue"));
    const res = lignesInequation(ex.f.m - ex.k * ex.g.m, 0, cmp, q(ex.k * ex.g.n - ex.f.n), true);
    lc.push(...res.lignes.map((l, i) => (i === 0 ? { ...l, justification: "termes en x à gauche, constantes à droite" } : l)));
    brut = demiDroite(res.cmpFinal, qL(res.borne));
  }
  lc.push(...lignesIntersection(brut, ex.ceEcran1, ex.solutionEcran3));
  etapes.push(calcul("c", lc), resultat("c", [latex(`S=${ens(ex.solutionEcran3)}`)]));
  etapes.push(
    piege(
      ex.sousType === "quotient" ? "c" : "a",
      ex.sousType === "quotient" ? [texte("Multiplier par "), latex(g), texte(" ne change pas le sens seulement parce que ce facteur est positif sur la CE.")] : [texte("La CE se pose sur l'inéquation de départ (chaque argument), pas sur le produit combiné.")],
    ),
  );
  return etapes;
}

// ---------------------------------------------------------------------------- Famille D

function correctionD(ex: ExerciceLogD): EtapeCorrection[] {
  const b = baseLatex(ex.base);
  const quad = formatQuadratiqueYLatex(ex);
  const [ya, yb] = [ex.y1, ex.y2].sort((u, v) => u - v);
  const puis = (k: number) => (k >= 0 ? q(Math.pow(ex.base.num, k), Math.pow(ex.base.den, k)) : q(Math.pow(ex.base.den, -k), Math.pow(ex.base.num, -k)));
  const { lignes, ensemble } = lignesTrinomeEtSigne(poly([[2, ex.A], [1, ex.B], [0, ex.C]]), ex.comparateur, "y");
  const ens3 = ens(ex.solutionEcran3);
  return [
    utiliseCE("a", false),
    calcul("a", [ligne("x>0", justif("argument de ", { l: `\\log_{${b}} x` }))]),
    resultatCE("a", ex.ceEcran1),
    utilise("b", [texte("Changement de variable : on pose "), latex(`y=\\log_{${b}}(x)`), texte(`, l'inéquation devient du second degré en y ${COURS_INEQUATIONS}.`)]),
    calcul("b", [ligne(`y=\\log_{${b}}(x)`, "on pose"), ligne(`\\left(\\log_{${b}} x\\right)^2=y^{2}`, "on remplace"), ligne(`${formatEnonceLatex(ex).split(/\\geq|\\leq|<|>/)[0]}=${quad}`, justif("on remplace ", { l: `\\log_{${b}} x` }, " par y"))]),
    resultat("b", [latex(`${quad} ${sym(ex.comparateur)} 0`)]),
    utilise("c", [texte("Inéquation du second degré : racines par le discriminant, puis signe du trinôme (signe de a à l'extérieur des racines).")]),
    calcul("c", ensemble ? lignes : [...lignes, ligne(`y\\in ${ens3}`, justifSigneTrinome(ex.A))]),
    resultat("c", [latex(`y\\in ${ens3}`)]),
    utilise("d", [
      texte("Retour en x : "),
      latex(`\\log_{${b}}(x)=y\\iff x=${puissanceBaseLatex(ex.base, 1).replace(/\^\{1\}$/, "")}^{y}`),
      texte(ex.baseSuperieureA1 ? ", fonction croissante de y : les bornes restent dans le même ordre" : ", fonction décroissante de y : les bornes s'échangent et les inégalités s'inversent"),
      texte(" ; puis on intersecte avec la CE."),
    ]),
    calcul("d", [
      ligne(`y=${ya}\\iff x=${puissanceBaseLatex(ex.base, ya)}`, justif("", { l: `x=${ex.base.den === 1 ? b : `\\left(${b}\\right)`}^{y}` })),
      ligne(`${puissanceBaseLatex(ex.base, ya)}=${qL(puis(ya))}`, "on calcule la puissance"),
      ligne(`y=${yb}\\iff x=${puissanceBaseLatex(ex.base, yb)}`),
      ligne(`${puissanceBaseLatex(ex.base, yb)}=${qL(puis(yb))}`, "on calcule la puissance"),
      ligne(`y\\in ${ens3}`, "ensemble de l'étape 3"),
      ligne(`x\\in ${ens(ex.solutionEcran4)}`, ex.baseSuperieureA1 ? justif("bornes dans le même ordre ; ", { l: "-\\infty" }, " devient 0 (CE x > 0)") : justif("bornes échangées ; ", { l: "+\\infty" }, " devient 0 (CE x > 0)")),
    ]),
    resultat("d", [latex(`S=${ens(ex.solutionEcran4)}`)]),
    piege("d", ex.baseSuperieureA1 ? [texte("L'ensemble trouvé en y n'est pas la réponse : il faut revenir à x avec "), latex(`x=${b}^{y}`), texte(".")] : [texte("Base entre 0 et 1 : "), latex(`x=\\left(${b}\\right)^{y}`), texte(" est décroissante, l'ordre des bornes s'inverse.")]),
  ];
}

// ---------------------------------------------------------------------------- Famille E

function correctionE(ex: ExerciceLogE): EtapeCorrection[] {
  const b = baseLatex(ex.base);
  const u = aff(1, -ex.p);
  const v = aff(-1, ex.r);
  const conditions = [...lignesCondition(1, -ex.p), ...lignesCondition(-1, ex.r)];
  const etapes: EtapeCorrection[] = [utilise("a", [texte(`Avant de résoudre : chaque argument doit être strictement positif ; on regarde si les deux conditions peuvent être vraies en même temps ${COURS_INEQUATIONS}.`)])];
  if (!ex.ceCompatible) {
    etapes.push(
      calcul("a", [...conditions, ligne(`${ex.r}\\leq ${ex.p}`, justif("aucun réel n'est à la fois ", { l: `>${ex.p}` }, " et ", { l: `<${ex.r}` }))]),
      resultat("a", [texte("La CE est vide : "), latex("S=\\varnothing"), texte(" (inutile de résoudre).")]),
      piege("a", [texte("Résoudre sans examiner la CE donne un ensemble faux : on doit d'abord vérifier que l'inéquation a un sens.")]),
    );
    return etapes;
  }
  const cmp = cmpArguments(ex);
  const res = lignesInequation(2, 0, cmp, q(ex.p + ex.r), true);
  etapes.push(
    calcul("a", [...conditions, ligne(`x\\in ${ens(ex.ceEcran1)}`, justif("les deux conditions ensemble (", { l: `${ex.p}<${ex.r}` }, ")"))]),
    resultat("a", [texte("La CE admet des solutions : "), latex(`\\text{CE} : x\\in ${ens(ex.ceEcran1)}`)]),
    utilise("b", utiliseSens(ex, "Même base des deux côtés : on compare les arguments. ")),
    calcul("b", [
      ligne(`${logBaseLatex(b, u)}${sym(ex.comparateur)}${logBaseLatex(b, v)}`, "inéquation de départ"),
      ligne(`${u}${sym(cmp)}${v}`, justifSens(ex)),
      ...res.lignes.map((l, i) => (i === 0 ? { ...l, justification: "termes en x à gauche, constantes à droite" } : l)),
      ...lignesIntersection(demiDroite(res.cmpFinal, qL(res.borne)), ex.ceEcran1, ex.solution),
    ]),
    resultat("b", [latex(`S=${ens(ex.solution)}`)]),
    piege("b", [texte("Le résultat de la comparaison des arguments doit rester dans la CE "), latex(ens(ex.ceEcran1)), texte(".")]),
  );
  return etapes;
}

// ---------------------------------------------------------------------------- Famille F

function correctionF(ex: ExerciceLogF): EtapeCorrection[] {
  const g = aff(1, -ex.p);
  const carre = formatCarreXMoinsR(ex.r);
  const vide: EnsembleReelGuide = { forme: "intervalles", points: [], morceaux: [] };
  const casSup = ex.casVideEstSuperieurA1 ? vide : ex.ensembleSansR;
  const casInf = ex.casVideEstSuperieurA1 ? ex.ensembleSansR : vide;
  const cas = (superieur: boolean): LigneCalcul[] => {
    const c: Comparateur = superieur ? ex.comparateur : inv(ex.comparateur);
    const sens = superieur ? "a > 1 : sens conservé" : "0 < a < 1 : sens inversé";
    const l: LigneCalcul[] = [ligne(`${g}${sym(c)}${g}+${carre}`, sens), ligne(`0${sym(c)}${carre}`, justif("on soustrait ", { l: g }))];
    const ensemble = superieur ? casSup : casInf;
    if (c === "<") l.push(ligne(`${carre}>0`, "lu dans l'autre sens"), ligne(`x\\neq ${ex.r}`, justif("un carré est strictement positif sauf en ", { l: `x=${ex.r}` })), ligne(`S=${ens(ex.ceEcran1)}\\setminus\\{${ex.r}\\}`, "on garde la CE"), ligne(`=${ens(ensemble)}`));
    else l.push(ligne(`${carre}<0`, "lu dans l'autre sens"), ligne(`S=\\varnothing`, "un carré n'est jamais strictement négatif"));
    return l;
  };
  return [
    utiliseCE("a", true),
    calcul("a", [...lignesCondition(1, -ex.p), ligne(`${g}+${carre}>0`, justif("vrai dès que ", { l: `${g}>0` }, " (un carré est positif)"))]),
    resultatCE("a", ex.ceEcran1),
    utilise("b", [texte("On compare les deux arguments en calculant leur différence ; on y reconnaît un carré parfait.")]),
    calcul("b", [ligne(`f(x)-g(x)=\\left(${g}+${carre}\\right)-\\left(${g}\\right)`, justif("f : argument de droite, g : argument de gauche")), ligne(`=${carre}`, "les termes en g se simplifient")]),
    resultat("b", [latex(`f(x)-g(x)=${carre}`)]),
    utilise("c", [texte("Base "), latex("a>1"), texte(" : le logarithme est croissant (sens conservé) ; "), latex("0<a<1"), texte(" : décroissant (sens inversé). On traite les deux cas, sur la CE "), texte(COURS_INEQUATIONS), texte(".")]),
    calcul("c", cas(true), [], "Cas a > 1"),
    calcul("c", cas(false), [], "Cas 0 < a < 1"),
    resultat("c", [texte("si "), latex("a>1"), texte(" : "), latex(`S=${ens(casSup)}`), texte(" ; si "), latex("0<a<1"), texte(" : "), latex(`S=${ens(casInf)}`)]),
    piege("c", [texte("Un carré est nul en "), latex(`x=${ex.r}`), texte(" : cette valeur est exclue quand l'inégalité est stricte.")]),
  ];
}

function ordonner(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return [...etapes].sort((a, b) => (a.sousQuestion ?? "").localeCompare(b.sousQuestion ?? ""));
}

export function correctionDetailleeInequationsLog(exercice: ExerciceInequationLogarithmique): EtapeCorrection[] {
  switch (exercice.famille) {
    case "A":
      return finaliserCorrige(ordonner(correctionA(exercice)));
    case "B":
      return finaliserCorrige(ordonner(correctionB(exercice)));
    case "C":
      return finaliserCorrige(ordonner(correctionC(exercice)));
    case "D":
      return finaliserCorrige(ordonner(correctionD(exercice)));
    case "E":
      return finaliserCorrige(ordonner(correctionE(exercice)));
    case "F":
      return finaliserCorrige(ordonner(correctionF(exercice)));
  }
}

export type { AffineLog };
