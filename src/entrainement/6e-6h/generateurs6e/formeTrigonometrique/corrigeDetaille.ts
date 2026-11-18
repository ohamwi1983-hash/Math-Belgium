import type { ValeurExacte } from "../../core6e/cyclometrique.types";
import type { AngleRemarquable, ConditionD, ExerciceFormeTrigonometrique, FacteurComplexe } from "../../core6e/formeTrigonometrique.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { LIBELLE_CONDITION, aideNiveau1, assembleValeurExacteAPlusBI, congruenceLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatFormeTrigonometrique";
import { phasesPourExercice, type PhaseFormeTrigonometrique } from "../../moteur6e/typesFormeTrigonometrique";
import { anglePi, frac, fracLatex, lignesRamenerAngle, parAngle } from "../../ui6e/corrigeComplexes";
import { planComplexeSvg } from "../../ui6e/papierComplexes";
import { POINTS_REMARQUABLES } from "./familleA";

/**
 * Corrigé détaillé « comme au tableau » de `6gen37` (forme trigonométrique, module, argument) —
 * règle `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape
 * par écran ; valeurs et réponses de l'écran (`formatReponseAttenduePhaseLatex`, `aideNiveau1`,
 * valeurs remarquables `POINTS_REMARQUABLES`) ; sommes et produits d'arguments écrits bruts puis
 * ramenés dans ]−π ; π] ligne à ligne. Partagé par l'adaptateur papier et l'écran.
 */

const LETTRES = "abcdefghij";
const COURS = "(cours, § 4)";
const COURS_MOIVRE = "(cours, § 5)";

function point(angle: AngleRemarquable): { cos: ValeurExacte; sin: ValeurExacte } {
  const p = POINTS_REMARQUABLES.find((pt) => pt.angle.p === angle.p && pt.angle.q === angle.q);
  if (!p) throw new Error(`Angle non remarquable : ${angle.latex}`);
  return { cos: p.cos, sin: p.sin };
}

/** Réponse de l'écran en fragments : `\text{, }` et `\text{ ;}` deviennent du texte. */
function reponse(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): FragmentConsigne[] {
  const morceaux = formatReponseAttenduePhaseLatex(e, phase).flatMap((l) => l.replace(/\\text\{ ;\}$/, "").replace(/^n=0\+/, "n=").split("\\text{, }"));
  if (e.famille === "C" && phase === "cEcran3") return [latex(`z^{${e.n}}=${morceaux[0]}`)];
  return morceaux.flatMap((m, i) => (i === 0 ? [latex(m)] : [texte(" ; "), latex(m)]));
}

/** Valeur entre parenthèses si elle n'est pas un entier positif. */
function par(v: string): string {
  return /^\d+$/.test(v) ? v : `\\left(${v}\\right)`;
}

/** Carré exact d'une valeur remarquable (a² avec a = r·cos θ : entier ou quart d'entier). */
function carreLatex(x: number): string {
  return fracLatex(frac(Math.round(4 * x * x), 4), { decimal: false });
}

/** Module r = √(a² + b²), une transformation par ligne. */
function lignesModule(a: string, an: number, b: string, bn: number, r: string, nom = "r"): LigneCalcul[] {
  const n = Math.round(an * an + bn * bn);
  const lignes = [ligne(`${nom}=\\sqrt{${par(a)}^2+${par(b)}^2}`, "|a + bi| = √(a² + b²)"), ligne(`=\\sqrt{${carreLatex(an)}+${carreLatex(bn)}}`, "on calcule les carrés")];
  if (`${n}` !== r && `\\sqrt{${n}}` !== r) lignes.push(ligne(`=\\sqrt{${n}}`));
  lignes.push(ligne(`=${r}`));
  return lignes;
}

function positionPoint(a: number, b: number): string {
  if (b === 0) return a > 0 ? "sur la partie positive de l'axe réel" : "sur la partie négative de l'axe réel";
  if (a === 0) return b > 0 ? "sur la partie positive de l'axe imaginaire" : "sur la partie négative de l'axe imaginaire";
  const q = a > 0 ? (b > 0 ? 1 : 4) : b > 0 ? 2 : 3;
  return `dans le quadrant ${q} (a ${a > 0 ? ">" : "<"} 0 et b ${b > 0 ? ">" : "<"} 0)`;
}

/** cos θ = a/r et sin θ = b/r (valeurs remarquables). */
function lignesCosSin(a: ValeurExacte, b: ValeurExacte, r: string, angle: AngleRemarquable, suffixe = ""): LigneCalcul[] {
  const { cos, sin } = point(angle);
  const l = (fn: string, v: ValeurExacte, res: ValeurExacte) => (r === "1" ? ligne(`\\${fn}\\theta${suffixe}=${v.latex}`) : ligne(`\\${fn}\\theta${suffixe}=\\dfrac{${v.latex}}{${r}}=${res.latex}`, fn === "cos" ? "cos θ = a / r" : "sin θ = b / r"));
  return [l("cos", a, cos), l("sin", b, sin)];
}

/** Somme / différence / multiple d'arguments écrit brut, puis ramené dans ]−π ; π]. */
function lignesSommeAngles(nom: string, a: AngleRemarquable, b: AngleRemarquable, signe: 1 | -1): LigneCalcul[] {
  const num = a.p * b.q + signe * b.p * a.q;
  const den = a.q * b.q;
  return [ligne(`${nom}=${a.latex}${signe === 1 ? "+" : "-"}${parAngle(b.latex)}`, signe === 1 ? "arg(z₁z₂) = arg z₁ + arg z₂" : "arg(z₁/z₂) = arg z₁ − arg z₂"), ligne(`=${anglePi(num, den)}`), ...lignesRamenerAngle(num, den)];
}

function lignesProduitAngle(nom: string, n: number, a: AngleRemarquable): LigneCalcul[] {
  return [ligne(`${nom}=${n}\\cdot ${parAngle(a.latex)}=${anglePi(n * a.p, a.q)}`, "on multiplie l'argument par n"), ...lignesRamenerAngle(n * a.p, a.q)];
}

const CIBLE_CONDITION: Record<ConditionD, { latex: string; p: number; q: number }> = {
  reelPositif: { latex: "0", p: 0, q: 1 },
  reelNegatif: { latex: "\\pi", p: 1, q: 1 },
  imaginairePurPositif: { latex: "\\frac{\\pi}{2}", p: 1, q: 2 },
  imaginairePurNegatif: { latex: "-\\frac{\\pi}{2}", p: -1, q: 2 },
};

const CS: FragmentConsigne[] = [latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}")];

const PIEGES: Partial<Record<PhaseFormeTrigonometrique, (e: ExerciceFormeTrigonometrique) => FragmentConsigne[] | null>> = {
  aEcran1: () => [texte("Écrire "), latex("r=a+b"), texte(", ou garder un signe moins sous la racine : le module est une longueur, toujours positive.")],
  aEcran2: (e) =>
    e.famille === "A" && e.a.numerique < 0
      ? [texte("Prendre "), latex("\\arctan\\dfrac{b}{a}"), texte(" directement : ici "), latex("a<0"), texte(", l'angle de la calculatrice est faux d'un demi-tour (ajouter ou retirer π).")]
      : [texte("Confondre "), ...CS, texte(", ou oublier de tenir compte du quadrant du point (a ; b).")],
  bEcran2: (e) =>
    e.famille !== "B"
      ? null
      : e.sousType === "produit"
        ? [texte("Multiplier les arguments au lieu de les additionner (ou additionner les modules au lieu de les multiplier).")]
        : e.sousType === "quotient"
          ? [texte("Soustraire dans le mauvais ordre : l'argument de "), latex("\\dfrac{z_1}{z_2}"), texte(" est "), latex("\\arg z_1-\\arg z_2"), texte(".")]
          : [texte("Élever l'argument à la puissance n au lieu de le multiplier par n.")],
  cEcran2: () => [texte("Oublier de ramener "), latex("n\\theta"), texte(" dans "), latex("]-\\pi\\,;\\pi]"), texte(" (retirer ou ajouter le bon multiple de 2π).")],
  cEcran3: () => [texte("Oublier le module "), latex("r^n"), texte(" en revenant à la forme "), latex("a+bi"), texte(".")],
  dEcran3: () => [texte("Oublier le terme "), latex("2p\\pi"), texte(" : on ne trouverait qu'une seule valeur de n au lieu d'une infinité.")],
  eEcran2: () => [texte("Oublier que "), latex("i^2=-1"), texte(" dans le développement : le produit des deux sinus change de signe.")],
};

/** Décomposition r² = c²·s (r = c√s) pour élever un module irrationnel à une puissance. */
function racineSimplifiee(n: number): { c: number; s: number } {
  let c = 1;
  let s = n;
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (n % (k * k) === 0) {
      c = k;
      s = n / (k * k);
      break;
    }
  }
  return { c, s };
}

const radical = (c: number, s: number) => (s === 1 ? `${c}` : c === 1 ? `\\sqrt{${s}}` : `${c}\\sqrt{${s}}`);

/** (c√s)ⁿ = cⁿ·(√s)ⁿ, une transformation par ligne (maquette validée). */
function lignesPuissanceModule(c: number, s: number, n: number, rn: string): LigneCalcul[] {
  if (s === 1) return [ligne(`r^{${n}}=${c}^{${n}}=${rn}`)];
  const sPuiss = n % 2 === 0 ? `${s ** (n / 2)}` : n === 1 ? `\\sqrt{${s}}` : `${s ** ((n - 1) / 2)}\\sqrt{${s}}`;
  const lignes: LigneCalcul[] = [ligne(`r^{${n}}=\\left(${radical(c, s)}\\right)^{${n}}`)];
  if (c !== 1) lignes.push(ligne(`=${c}^{${n}}\\cdot\\left(\\sqrt{${s}}\\right)^{${n}}`, "(ab)ⁿ = aⁿbⁿ"));
  const facteurC = c === 1 ? "" : `${c ** n}\\cdot `;
  lignes.push(ligne(`=${facteurC}${sPuiss}`, n % 2 === 0 ? `(√${s})² = ${s}` : `(√${s})² = ${s}, il reste un facteur √${s}`));
  if (lignes[lignes.length - 1].latex !== `=${rn}`) lignes.push(ligne(`=${rn}`));
  return lignes;
}

function lignesEtape(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique, sq: string): EtapeCorrection[] {
  const L: EtapeCorrection[] = [];
  switch (e.famille) {
    case "A": {
      if (phase === "aEcran1") {
        L.push(utilise(sq, [texte(`Le module de `), latex("z=a+bi"), texte(` est la distance de l'origine au point (a ; b) ${COURS} : `), latex("r=|z|=\\sqrt{a^2+b^2}"), texte(".")]));
        L.push(calcul(sq, lignesModule(e.a.latex, e.a.numerique, e.b.latex, e.b.numerique, `${e.r}`)));
        L.push(resultat(sq, reponse(e, phase)));
      } else {
        L.push(utilise(sq, [texte("L'argument θ vérifie "), latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}"), texte(` ; le quadrant du point (a ; b) fixe le bon angle ${COURS}. Puis `), latex("z=r(\\cos\\theta+i\\sin\\theta)=re^{i\\theta}"), texte(".")]));
        L.push(calcul(sq, lignesCosSin(e.a, e.b, `${e.r}`, e.angle), [texte(`Le point (a ; b) est ${positionPoint(e.a.numerique, e.b.numerique)}.`)]));
        const figure = planComplexeSvg({ points: [{ x: e.a.numerique, y: e.b.numerique, etiquette: "z" }], moduleArgument: { r: "r", theta: e.angle.numerique }, libelle: "Point z dans le plan, son module r et son argument θ" });
        L.push({ ...resultat(sq, reponse(e, phase)), figureHtml: figure });
        const { cos, sin } = point(e.angle);
        if (e.r !== 1)
          L.push(
            verification(sq, [texte("On retrouve a et b :")], [
              ligne(`r\\cos\\theta=${e.r}\\cdot ${par(cos.latex)}=${e.a.latex}`, "c'est bien a ✓"),
              ligne(`r\\sin\\theta=${e.r}\\cdot ${par(sin.latex)}=${e.b.latex}`, "c'est bien b ✓"),
            ]),
          );
      }
      break;
    }
    case "B": {
      const facteurs: { nom: string; z: FacteurComplexe }[] = e.sousType === "puissance" ? [{ nom: "", z: e.z }] : [{ nom: "_1", z: e.z1 }, { nom: "_2", z: e.z2 }];
      if (phase === "bEcran1") {
        L.push(utilise(sq, [texte("Pour chaque nombre : "), latex("r=\\sqrt{a^2+b^2}"), texte(", puis θ tel que "), latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}"), texte(`, selon le quadrant ${COURS}.`)]));
        for (const { nom, z } of facteurs) {
          L.push(calcul(sq, [...lignesModule(z.a.latex, z.a.numerique, z.b.latex, z.b.numerique, `${z.r}`, `r${nom}`), ...lignesCosSin(z.a, z.b, `${z.r}`, z.angle, nom)], [latex(`z${nom}=${assembleValeurExacteAPlusBI(z.a, z.b)}`), texte(` : point ${positionPoint(z.a.numerique, z.b.numerique)}, d'où `), latex(`\\theta${nom}=${z.angle.latex}`), texte(".")], nom ? `z${nom === "_1" ? "₁" : "₂"}` : "Calcul"));
        }
        L.push(resultat(sq, reponse(e, phase)));
      } else {
        const a1 = aideNiveau1(e, phase);
        L.push(utilise(sq, [texte(`${a1.texte} `), ...(a1.latex ? [latex(a1.latex)] : []), texte(` ${COURS}`)]));
        const rRes = formatReponseAttenduePhaseLatex(e, "bEcran2")[0].split("\\text{, }")[0].replace(/^r=/, "");
        if (e.sousType === "puissance") {
          L.push(calcul(sq, [ligne(`r=${e.z.r}^{${e.n}}=${e.rResultat}`, "|zⁿ| = |z|ⁿ")], [], "Module"));
          L.push(calcul(sq, lignesProduitAngle("\\theta", e.n, e.z.angle).map((l, i) => (i === 0 ? { ...l, justification: "arg(zⁿ) = n · arg z" } : l)), [], "Argument"));
        } else {
          L.push(calcul(sq, [e.sousType === "produit" ? ligne(`r=r_1\\cdot r_2=${e.z1.r}\\cdot ${e.z2.r}=${e.rResultat}`, "|z₁z₂| = |z₁| · |z₂|") : ligne(`r=\\dfrac{r_1}{r_2}=\\dfrac{${e.z1.r}}{${e.z2.r}}${rRes === `\\frac{${e.z1.r}}{${e.z2.r}}` ? "" : `=${rRes}`}`, "|z₁/z₂| = |z₁| / |z₂|")], [], "Module"));
          L.push(calcul(sq, lignesSommeAngles("\\theta", e.z1.angle, e.z2.angle, e.sousType === "produit" ? 1 : -1), [], "Argument"));
        }
        L.push(resultat(sq, reponse(e, phase)));
      }
      break;
    }
    case "C": {
      const rLatex = formatReponseAttenduePhaseLatex(e, "cEcran1")[0].split("\\text{, }")[0].replace(/^r=/, "");
      const rnLatex = formatReponseAttenduePhaseLatex(e, "cEcran2")[0].split("\\text{, }")[0].replace(/^r\^n=/, "");
      const N = e.a * e.a + e.b * e.b;
      const { c, s } = racineSimplifiee(N);
      if (phase === "cEcran1") {
        L.push(utilise(sq, [latex("r=\\sqrt{a^2+b^2}"), texte(", puis θ tel que "), latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}"), texte(`, selon le quadrant du point (a ; b) ${COURS}.`)]));
        const lm = lignesModule(`${e.a}`, e.a, `${e.b}`, e.b, rLatex);
        if (s !== 1 && c !== 1) lm.splice(lm.length - 1, 0, ligne(`=\\sqrt{${c * c}\\cdot ${s}}`, `${N} = ${c * c} × ${s}`));
        L.push(calcul(sq, lm, [], "Module"));
        L.push(calcul(sq, lignesCosSinEntiers(e.a, e.b, rLatex, e.angle), [texte(`Le point (a ; b) est ${positionPoint(e.a, e.b)}.`)], "Argument"));
        L.push(resultat(sq, reponse(e, phase)));
      } else if (phase === "cEcran2") {
        L.push(utilise(sq, [texte(`Formule de Moivre ${COURS_MOIVRE} : `), latex("\\bigl(r(\\cos\\theta+i\\sin\\theta)\\bigr)^n=r^n\\bigl(\\cos(n\\theta)+i\\sin(n\\theta)\\bigr)"), texte(". On élève le module à la puissance n et on multiplie l'argument par n.")]));
        L.push(calcul(sq, lignesPuissanceModule(c, s, e.n, rnLatex), [], "Module"));
        L.push(calcul(sq, lignesProduitAngle(`${e.n}\\theta`, e.n, e.angle), [], "Argument"));
        const pre = rnLatex === "1" ? "" : rnLatex;
        L.push(resultat(sq, [latex(`z^{${e.n}}=${pre}\\left(\\cos ${parAngle(e.angleFinal.latex)}+i\\sin ${parAngle(e.angleFinal.latex)}\\right)`)]));
      } else {
        const { cos, sin } = point(e.angleFinal);
        const pre = rnLatex === "1" ? "" : rnLatex;
        L.push(utilise(sq, [texte("On remplace "), latex(`\\cos ${parAngle(e.angleFinal.latex)}`), texte(" et "), latex(`\\sin ${parAngle(e.angleFinal.latex)}`), texte(" par leurs valeurs remarquables, puis on distribue le module.")]));
        const lignes: LigneCalcul[] = [
          ligne(`z^{${e.n}}=${pre}\\left(\\cos ${parAngle(e.angleFinal.latex)}+i\\sin ${parAngle(e.angleFinal.latex)}\\right)`, "résultat de l'étape 2"),
          ligne(`=${pre}\\left(${assembleValeurExacteAPlusBI(cos, sin)}\\right)`, "valeurs remarquables"),
        ];
        if (pre !== "" && cos.numerique !== 0 && sin.numerique !== 0) {
          lignes.push(ligne(`=${pre}\\cdot ${par(cos.latex)}${sin.numerique < 0 ? "-" : "+"}${pre}\\cdot ${par(sin.latex.replace(/^-/, ""))}\\,i`, "on distribue"));
        }
        lignes.push(ligne(`=${formatReponseAttenduePhaseLatex(e, "cEcran3")[0]}`, s === 1 || !/sqrt/.test(cos.latex + sin.latex) ? "on calcule" : `√${s} · √${s} = ${s}`));
        L.push(calcul(sq, lignes.filter((l, i, t) => i === 0 || l.latex !== t[i - 1].latex)));
        L.push(resultat(sq, reponse(e, phase)));
        L.push(verification(sq, [texte("Le module de "), latex(`z^{${e.n}}`), texte(" doit valoir "), latex(`r^{${e.n}}`), texte(" :")], [ligne(`|z^{${e.n}}|=\\sqrt{${par(`${e.aFinal}`)}^2+${par(`${e.bFinal}`)}^2}=${rnLatex}`, "c'est bien rⁿ ✓")]));
      }
      break;
    }
    case "D": {
      const th = e.z.angle;
      const cible = CIBLE_CONDITION[e.condition];
      if (phase === "dEcran1") {
        L.push(utilise(sq, [texte("On cherche θ tel que "), latex("\\cos\\theta=\\dfrac{a}{r}"), texte(" et "), latex("\\sin\\theta=\\dfrac{b}{r}"), texte(", avec "), latex(`r=${e.z.r}`), texte(` ${COURS}.`)]));
        L.push(calcul(sq, lignesCosSin(e.z.a, e.z.b, `${e.z.r}`, th), [texte(`Le point (a ; b) est ${positionPoint(e.z.a.numerique, e.z.b.numerique)}.`)]));
        L.push(resultat(sq, reponse(e, phase)));
      } else if (phase === "dEcran2") {
        const a1 = aideNiveau1(e, phase);
        L.push(utilise(sq, [texte(`${a1.texte} `), ...(a1.latex ? [latex(a1.latex)] : []), texte(` ${COURS_MOIVRE}`)]));
        L.push(calcul(sq, [ligne(`\\arg(z^n)=n\\theta=n\\cdot ${parAngle(th.latex)}`, "arg(zⁿ) = n · arg z"), ligne(`n\\cdot ${parAngle(th.latex)}=${cible.latex}+2p\\pi`, `zⁿ ${LIBELLE_CONDITION[e.condition]} : argument ${cible.latex === "0" ? "0" : cible.latex.replace("\\frac{\\pi}{2}", "π/2").replace("\\pi", "π")} à 2pπ près`)]));
        L.push(resultat(sq, [latex(congruenceLatex(e.condition)), texte(", "), latex("p\\in\\mathbb{Z}")]));
      } else {
        const Q = th.q * cible.q;
        const A = th.p * cible.q;
        const B = cible.p * th.q;
        const M = 2 * Q;
        const { k, m } = e.congruence;
        const nVerif = k === 0 ? m : k;
        const gauche = `${A === 1 ? "" : A === -1 ? "-" : A}n`;
        L.push(utilise(sq, [texte("On multiplie les deux membres par "), latex(`\\dfrac{${Q}}{\\pi}`), texte(" pour obtenir une équation entre entiers, puis on garde les valeurs entières de n.")]));
        const lignes: LigneCalcul[] = [
          ligne(`n\\cdot ${parAngle(th.latex)}=${cible.p === 0 ? "" : `${cible.latex}+`}2p\\pi`, "équation de l'étape 2"),
          ligne(`${gauche}=${B === 0 ? "" : `${B}+`}${M}p`, `on multiplie par ${Q}/π`),
        ];
        if (A !== 1) lignes.push(ligne(`n=\\dfrac{${B === 0 ? "" : `${B}+`}${M}p}{${A}}`, `on divise par ${A}`.replace("-", "−")));
        L.push(calcul(sq, lignes));
        L.push(resultat(sq, reponse(e, phase)));
        L.push(verification(sq, [texte("Avec "), latex(`n=${nVerif}`), texte(" :")], [ligne(`${nVerif}\\cdot ${parAngle(th.latex)}=${anglePi(nVerif * th.p, th.q)}`, `vaut ${cible.latex === "0" ? "0" : "l'argument visé"} à un multiple de 2π près ✓`)]));
      }
      break;
    }
    case "E": {
      const signe = e.operation === "produit" ? 1 : -1;
      if (phase === "eEcran1") {
        const loi = e.operation === "produit" ? "e^{i\\alpha}\\cdot e^{i\\beta}=e^{i(\\alpha+\\beta)}" : "\\dfrac{e^{i\\alpha}}{e^{i\\beta}}=e^{i(\\alpha-\\beta)}";
        L.push(utilise(sq, [texte(`Propriété des exposants ${COURS} : `), latex(loi), texte(".")]));
        L.push(calcul(sq, lignesSommeAngles("\\theta", e.alpha, e.beta, signe as 1 | -1)));
        L.push(resultat(sq, reponse(e, phase)));
      } else {
        const a1 = aideNiveau1(e, phase);
        const A = point(e.alpha);
        const B = point(e.beta);
        const pv = (v: ValeurExacte) => (v.latex.startsWith("-") ? `\\left(${v.latex}\\right)` : v.latex);
        L.push(utilise(sq, [texte(`${a1.texte} `), ...(a1.latex ? [latex(a1.latex)] : [])]));
        const op = signe === 1 ? "-" : "+";
        const op2 = signe === 1 ? "+" : "-";
        L.push(
          calcul(sq, [
            ligne(`\\cos\\theta=\\cos\\alpha\\cos\\beta${op}\\sin\\alpha\\sin\\beta`, signe === 1 ? "partie réelle du produit développé" : "partie réelle (multiplication par le conjugué)"),
            ligne(`=${A.cos.latex}\\cdot ${pv(B.cos)}${op}${pv(A.sin)}\\cdot ${pv(B.sin)}`, "valeurs remarquables"),
            ligne(`=${e.cosResultat.latex}`),
            ligne(`\\sin\\theta=\\sin\\alpha\\cos\\beta${op2}\\cos\\alpha\\sin\\beta`, "partie imaginaire"),
            ligne(`=${A.sin.latex}\\cdot ${pv(B.cos)}${op2}${pv(A.cos)}\\cdot ${pv(B.sin)}`, "valeurs remarquables"),
            ligne(`=${e.sinResultat.latex}`),
          ]),
        );
        L.push(resultat(sq, reponse(e, phase)));
        L.push(verification(sq, [latex("\\cos^2\\theta+\\sin^2\\theta"), texte(" doit valoir 1 : "), latex(`\\left(${e.cosResultat.latex}\\right)^2+\\left(${e.sinResultat.latex}\\right)^2=1`), texte(" ✓")]));
      }
      break;
    }
  }
  const p = PIEGES[phase]?.(e);
  if (p) L.push(piege(sq, p));
  return L;
}

/** cos θ = a/r et sin θ = b/r pour a, b entiers (module éventuellement irrationnel). */
function lignesCosSinEntiers(a: number, b: number, r: string, angle: AngleRemarquable): LigneCalcul[] {
  const { cos, sin } = point(angle);
  const l = (fn: string, v: number, res: ValeurExacte) => {
    const brut = `\\dfrac{${v}}{${r}}`;
    return r === "1" ? ligne(`\\${fn}\\theta=${v}`) : ligne(`\\${fn}\\theta=${brut}=${res.latex}`, fn === "cos" ? "cos θ = a / r" : "sin θ = b / r");
  };
  return [l("cos", a, cos), l("sin", b, sin)];
}

/** Piège de l'écran (repris dans les erreurs fréquentes du barème). */
export function piegeEtape(e: ExerciceFormeTrigonometrique, phase: PhaseFormeTrigonometrique): FragmentConsigne[] | null {
  return PIEGES[phase]?.(e) ?? null;
}

export function correctionDetailleeFormeTrigonometrique(e: ExerciceFormeTrigonometrique): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => lignesEtape(e, phase, LETTRES[i]));
}
