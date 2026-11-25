import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { ExerciceAireA, ExerciceAireB, ExerciceAireExcentriciteConique } from "../../core6e/aireExcentriciteConique.types";
import { phasesPourExercice } from "../../moteur6e/typesAireExcentriciteConique";
import type { PhaseAireExcentriciteConique } from "../../moteur6e/typesAireExcentriciteConique";
import { estCarreParfait, latexQ, latexRacine, q, qAdd, qMul, qSub } from "../../moteur6e/algebreLieux";
import { latex, texte } from "../../../export/corrigeTableau";
import type { Q } from "../../moteur6e/algebreLieux";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_AIRE, COURS_EXCENTRICITE, approxRacine, avecFigureConique, carreL, parQ } from "../../ui6e/corrigeConiques";
import { figure6gen60 } from "../../ui6e/formatAireExcentriciteConique";

/**
 * Corrigé détaillé « comme au tableau » de `6gen60` (aire du triangle focal et excentricité, 6e ch. 10,
 * § 2–3, processus 3 TRANSFÉRER ; audit, lot E), une lettre par écran — même source pour l'écran et le
 * papier. Notations du cours : rayons focaux |PF| et |PF′| (|PF| + |PF′| = 2a), θ = angle FPF′, loi des
 * cosinus avec |FF′|² = 4c² (jamais c lui-même, souvent irrationnel), aire ½|PF|·|PF′|·sin θ contrôlée par
 * b²·tan(θ/2) ; famille B : la condition traduite en une relation entre a, b, c, puis e = c/a. Valeurs
 * EXACTES (aire et excentricité en racines simplifiées, valeur approchée annoncée « ≈ »). FIGURE : le
 * triangle focal (A), l'ellipse et la condition (B).
 */

type E = ExerciceAireExcentriciteConique;
type P = PhaseAireExcentriciteConique;

const lq = latexQ;
const L = (e: E, p: P) => lettreEtape(phasesPourExercice(e).indexOf(p));
const figure = (e: E) => figure6gen60(e, phasesPourExercice(e));
const ANGLES: Record<string, string> = { "1/2": "60", "0/1": "90", "-1/2": "120" };
const cle = (r: Q) => `${r.n}/${r.d}`;

/** « \dfrac{12}{k+1} » écrit sans fraction de fraction. */
function quotient(num: number, den: Q): string {
  if (den.d === 1n) return `\\dfrac{${num}}{${den.n}}`;
  return `${num}\\cdot\\dfrac{${den.d}}{${den.n}}`;
}

/** « =\dfrac{n}{d} » intermédiaire, seulement entre entiers et s'il diffère du résultat. */
function intermediaire(num: Q, den: Q, res: Q): string {
  if (num.d !== 1n || den.d !== 1n) return "";
  const s = `\\frac{${num.n}}{${den.n}}`;
  return lq(res) === s ? "" : `=\\dfrac{${num.n}}{${den.n}}`;
}

/** Rationnel non nul au dénominateur d'une fraction affichée : « \dfrac{a}{b} » sans fraction de fraction. */
function fracQ(num: Q, den: Q): string {
  return `\\dfrac{${lq(num)}}{${lq(den)}}`;
}

function corrigeA(e: ExerciceAireA): EtapeCorrection[] {
  const a = L(e, "aRayons");
  const b = L(e, "aCos");
  const c = L(e, "aAire");
  const k1 = qAdd(e.k, q(1));
  const a2 = e.a * e.a;
  const b2 = e.b * e.b;
  const c4 = 4 * (a2 - b2);
  const num = qSub(qAdd(qMul(e.pf, e.pf), qMul(e.pfp, e.pfp)), q(c4));
  const den = qMul(q(2), qMul(e.pf, e.pfp));
  const sin2 = qSub(q(1), qMul(e.cos, e.cos));
  const sin = latexRacine(sin2);
  const aire = latexRacine(e.aire2);
  const angle = ANGLES[cle(e.cos)];
  const droit = e.cos.n === 0n;
  const tanLigne: LigneCalcul[] = [ligne(`b^2\\cdot\\dfrac{\\sin\\theta}{1+\\cos\\theta}=${b2}\\cdot${droit ? " 1" : `\\dfrac{${sin}}{1${e.cos.n < 0n ? "" : "+"}${lq(e.cos)}}`}=${aire}`, "b² · tan(θ/2), avec tan(θ/2) = sin θ / (1 + cos θ)")];
  return [
    utiliseCours(a, fx("Pour tout point $P$ de l'ellipse, la somme des rayons focaux vaut $2a$ : $|PF|+|PF'|=2a$"), COURS_AIRE),
    calcul(a, [
      ligne(`|PF|+|PF'|=2a=${2 * e.a}`, `a² = ${a2}, donc a = ${e.a}`),
      ligne(`${lq(e.k)}\\,|PF'|+|PF'|=${2 * e.a}`, [texte("on remplace "), latex(`|PF|=${lq(e.k)}\\,|PF'|`)]),
      ligne(`${lq(k1)}\\,|PF'|=${2 * e.a}`),
      ligne(`|PF'|=${quotient(2 * e.a, k1)}=${lq(e.pfp)}`),
      ligne(`|PF|=${lq(e.k)}\\cdot ${parQ(e.pfp)}=${lq(e.pf)}`),
    ]),
    resultat(a, fx(`$|PF|=${lq(e.pf)}$ et $|PF'|=${lq(e.pfp)}$.`)),
    verification(a, fx(`$|PF|+|PF'|=${lq(e.pf)}+${lq(e.pfp)}=${2 * e.a}=2a$.`)),
    utiliseCours(b, fx("Loi des cosinus dans le triangle $FPF'$, dont le troisième côté vaut $|FF'|=2c$ : $\\cos\\theta=\\dfrac{|PF|^2+|PF'|^2-4c^2}{2\\,|PF|\\cdot|PF'|}$, avec $\\theta=\\widehat{FPF'}$ et $c^2=a^2-b^2$"), COURS_AIRE),
    calcul(b, [
      ligne(`4c^2=4(a^2-b^2)=4\\cdot(${a2}-${b2})=${c4}`, "on n'a pas besoin de c lui-même"),
      ...(e.pf.d === 1n && e.pfp.d === 1n
        ? [ligne(`|PF|^2+|PF'|^2-4c^2=${carreL(e.pf)}+${carreL(e.pfp)}-${c4}=${lq(num)}`, "numérateur")]
        : [ligne(`|PF|^2+|PF'|^2=${carreL(e.pf)}+${carreL(e.pfp)}=${lq(qAdd(qMul(e.pf, e.pf), qMul(e.pfp, e.pfp)))}`), ligne(`|PF|^2+|PF'|^2-4c^2=${lq(qAdd(qMul(e.pf, e.pf), qMul(e.pfp, e.pfp)))}-${c4}=${lq(num)}`, "numérateur")]),
      ligne(`2\\,|PF|\\cdot|PF'|=2\\cdot ${parQ(e.pf)}\\cdot ${parQ(e.pfp)}=${lq(den)}`, "dénominateur"),
      ligne(`\\cos\\theta=${fracQ(num, den)}=${lq(e.cos)}`),
    ]),
    resultat(b, fx(`$\\cos\\theta=${lq(e.cos)}$${angle ? ` : $\\theta=${angle}^\\circ$` : ""}.`)),
    utiliseCours(c, fx("Aire d'un triangle à partir de deux côtés et de l'angle compris : $\\mathcal{A}=\\dfrac{1}{2}\\,|PF|\\cdot|PF'|\\sin\\theta$, avec $\\sin\\theta=\\sqrt{1-\\cos^2\\theta}$ (l'angle est entre $0^\\circ$ et $180^\\circ$ : son sinus est positif)"), COURS_AIRE),
    calcul(c, [
      ...(droit ? [ligne("\\sin\\theta=1", "θ = 90°")] : [ligne(`\\sin^2\\theta=1-${carreL(e.cos)}=${lq(sin2)}`), ligne(`\\sin\\theta=\\sqrt{${lq(sin2)}}${sin === `\\sqrt{${lq(sin2)}}` ? "" : `=${sin}`}`)]),
      ligne(`\\mathcal{A}=\\dfrac{1}{2}\\cdot ${parQ(e.pf)}\\cdot ${parQ(e.pfp)}${droit ? "" : `\\cdot ${sin}`}=${aire}`),
    ]),
    avecFigureConique(resultat(c, fx(`L'aire du triangle $FPF'$ vaut $\\mathcal{A}=${aire}${approxRacine(e.aire2)}$.`)), figure(e)),
    verification(c, fx(`Formule du cours $\\mathcal{A}=b^2\\tan\\frac{\\theta}{2}$ :`), tanLigne),
    piege(a, fx("$2a$ est la somme des deux rayons focaux, pas l'un d'eux ; et $|FF'|=2c$, donc $|FF'|^2=4c^2$.")),
  ];
}

/** Phrase de la condition de B (énoncé papier et corrigé). */
export function conditionB(e: ExerciceAireB): string {
  if (e.sousType === "abscisseFoyerParallele") {
    const t = lq(e.parametre);
    return `la droite $(OP)$ est parallèle à la droite $(A'K)$, où $A'(-a\\,;0)$ et $K\\left(0\\,;${t === "1" ? "" : t}\\,b\\right)$`;
  }
  if (e.sousType === "angleSommetNonFocal") {
    const deg = ANGLES[cle(e.parametre)];
    return deg ? `l'angle $\\widehat{FBF'}$ mesure $${deg}^\\circ$` : `$\\cos\\widehat{FBF'}=${lq(e.parametre)}$`;
  }
  return `la distance entre les deux directrices vaut $${lq(e.parametre)}$ fois la distance focale $FF'$`;
}

function corrigeB(e: ExerciceAireB): EtapeCorrection[] {
  const a = L(e, "bRelation");
  const b = L(e, "bE");
  const t = e.parametre;
  const e2 = e.e2;
  const eL = latexRacine(e2);
  const brut = `\\sqrt{${lq(e2)}}`;
  const lignesE: LigneCalcul[] = [];
  let lignesR: LigneCalcul[];
  let utilise: string;
  let relation: string;
  if (e.sousType === "abscisseFoyerParallele") {
    const tL = lq(t) === "1" ? "" : lq(t);
    utilise = "Le point $P$ a pour abscisse $c$ : on calcule son ordonnée avec l'équation de l'ellipse et $a^2-c^2=b^2$ ; deux droites sont parallèles si elles ont la même pente";
    lignesR = [
      ligne("\\dfrac{c^2}{a^2}+\\dfrac{y_P^2}{b^2}=1", "P est sur l'ellipse et x_P = c"),
      ligne("y_P^2=b^2\\cdot\\dfrac{a^2-c^2}{a^2}=\\dfrac{b^4}{a^2}", "car a² − c² = b²"),
      ligne("y_P=\\dfrac{b^2}{a}", "y_P > 0"),
      ligne(`\\dfrac{y_P}{c}=\\dfrac{${tL}b}{a}`, "pente de (OP) = pente de (A′K)"),
      ligne(`\\dfrac{b^2}{ac}=\\dfrac{${tL}b}{a}`),
      ligne(`b=${tL}c`, "on multiplie par ac et on divise par b"),
    ];
    relation = `b=${tL}c`;
    const t2 = qMul(t, t);
    lignesE.push(ligne(`${lq(t2) === "1" ? "" : lq(t2)}c^2=a^2-c^2`, "b² = a² − c²"), ligne(`${lq(qAdd(t2, q(1)))}\\,c^2=a^2`), ligne(`e^2=\\dfrac{c^2}{a^2}=${lq(e2)}`));
  } else if (e.sousType === "angleSommetNonFocal") {
    const deg = ANGLES[cle(t)];
    const cosL = deg ? `\\cos ${deg}^\\circ` : "\\cos\\widehat{FBF'}";
    utilise = "Le sommet $B(0\\,;b)$ est à la distance $a$ de chaque foyer ($|BF|+|BF'|=2a$ et $|BF|=|BF'|$) ; loi des cosinus en $B$ dans le triangle $FBF'$, avec $|FF'|=2c$";
    lignesR = [
      ligne(`4c^2=a^2+a^2-2a^2\\,${cosL}`, "loi des cosinus en B"),
      ligne(`4c^2=a^2\\left(2-2\\cdot ${parQ(t)}\\right)`),
      ligne(`4c^2=${lq(qSub(q(2), qMul(q(2), t)))}\\,a^2`),
    ];
    relation = `4c^2=${lq(qSub(q(2), qMul(q(2), t)))}\\,a^2`;
    lignesE.push(ligne(`e^2=\\dfrac{c^2}{a^2}${intermediaire(qSub(q(2), qMul(q(2), t)), q(4), e2)}=${lq(e2)}`));
  } else {
    utilise = "Les directrices sont les droites $x=\\pm\\dfrac{a^2}{c}$, distantes de $\\dfrac{2a^2}{c}$ ; la distance focale vaut $|FF'|=2c$";
    lignesR = [ligne(`\\dfrac{2a^2}{c}=${lq(t)}\\cdot 2c`, "traduction de la condition"), ligne(`a^2=${lq(t)}\\,c^2`, "on multiplie par c et on divise par 2")];
    relation = `a^2=${lq(t)}\\,c^2`;
    lignesE.push(ligne(`e^2=\\dfrac{c^2}{a^2}${intermediaire(q(1), t, e2)}=${lq(e2)}`));
  }
  lignesE.push(ligne(brut === eL ? `e=${brut}` : `e=${brut}=${eL}`, "e > 0"));
  return [
    utiliseCours(a, fx(utilise), e.sousType === "distanceDirectrices" ? COURS_EXCENTRICITE : COURS_AIRE),
    calcul(a, lignesR),
    resultat(a, fx(`La condition se traduit par $${relation}$.`)),
    utiliseCours(b, fx("Excentricité de l'ellipse : $e=\\dfrac{c}{a}$, avec $b^2=a^2-c^2$ ; on exprime tout en fonction de $c$ et de $a$"), COURS_EXCENTRICITE),
    calcul(b, lignesE),
    avecFigureConique(resultat(b, fx(`L'excentricité de l'ellipse vaut $e=${eL}${estCarreParfait(e2) ? "" : approxRacine(e2)}$.`)), figure(e)),
    verification(b, fx(`$0<e<1$ : c'est bien une ellipse.`)),
    piege(b, fx("On a d'abord $e^2$ : l'excentricité en est la racine carrée (et $e=\\frac{c}{a}$, pas $\\frac{c}{b}$).")),
  ];
}

export function correctionDetailleeAireExcentriciteConique(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : corrigeB(e));
}
