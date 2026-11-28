import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import { add, mul, omegaEnLigne, piLatex, rat, ratLatex, type Rat } from "../../moteur5e/trigExact";
import { decalage, periode } from "../../moteur5e/sinusoideExacte";
import { fenetre, type ExerciceAssocierCourbes } from "../../moteur5e/modeleAssocierCourbes";
import { lecture, reponseEcran } from "../../ui5e/formatAssocierCourbes";
import { figureCourbe } from "../../ui5e/figureAssocierCourbes";

/**
 * Corrigé détaillé « comme au tableau » de 5gen53 (partagé par l'appli et le papier) : une lettre par
 * courbe — maximum et minimum lus, b et |A| calculés, période lue puis ω, décalage Φ lu (croisement de
 * la ligne moyenne en montant si A > 0, en descendant si A < 0) puis φ = −ωΦ : l'expression qui a ces
 * paramètres. Figure de la courbe avec les deux repères lus.
 */

type E = ExerciceAssocierCourbes;
const t = texte;
const f = latex;
const LETTRES = "abcd";

const par = (v: number) => (v < 0 ? `\\left(${v}\\right)` : String(v));
const parPi = (c: Rat) => (c.n < 0 ? `\\left(${piLatex(c)}\\right)` : piLatex(c));

/** T en ligne dans un dénominateur (« \pi/2 »). */
function piEnLigne(c: Rat): string {
  const a = Math.abs(c.n);
  return `${c.n < 0 ? "-" : ""}${a === 1 ? "" : a}\\pi${c.d === 1 ? "" : `/${c.d}`}`;
}

export function figureLecture(e: E, k: number): string {
  const s = e.expressions[e.ordre[k]!]!;
  const P = decalage(s);
  const T = periode(s);
  const xMax = add(P, mul(rat(s.A > 0 ? 1 : 3, 4), T));
  return `<div style="max-width:9cm;margin:6px auto">${figureCourbe(s, fenetre(e), `Courbe ${k + 1}`, [
    { x: P, y: s.b },
    { x: xMax, y: s.b + Math.abs(s.A) },
  ])}</div>`;
}

function etape(e: E, k: number): EtapeCorrection[] {
  const sq = LETTRES[k]!;
  const s = e.expressions[e.ordre[k]!]!;
  const { max, min } = lecture(s);
  const T = periode(s);
  const P = decalage(s);
  const lignes: LigneCalcul[] = [
    ligne(`y_{\\max} = ${max}`, "maximum lu"),
    ligne(`y_{\\min} = ${min}`, "minimum lu"),
    ligne(`b = \\dfrac{${max} + ${par(min)}}{2} = ${s.b}`, "ligne moyenne"),
    ligne(`|A| = \\dfrac{${max} - ${par(min)}}{2} = ${Math.abs(s.A)}`, "amplitude"),
    ligne(`T = ${piLatex(T)}`, "distance entre deux maximums consécutifs"),
    ligne(`\\omega = \\dfrac{2\\pi}{${piEnLigne(T)}} = ${ratLatex(s.omega)}`, [f("T = \\dfrac{2\\pi}{\\omega}")]),
    ligne(`\\Phi = ${piLatex(P)}`, s.A > 0 ? "la courbe croise sa ligne moyenne en montant : A > 0" : "la courbe croise sa ligne moyenne en descendant : A < 0"),
    ligne(`\\varphi = -${omegaEnLigne(s.omega).includes("/") ? `\\dfrac{${s.omega.n}}{${s.omega.d}}` : omegaEnLigne(s.omega)} \\times ${parPi(P)} = ${piLatex(s.phi)}`, [f("\\varphi = -\\omega\\,\\Phi")]),
  ];
  return [
    utilise(sq, [t("Lecture d'une sinusoïde (cours, point 5) : "), f("b = \\dfrac{y_{\\max} + y_{\\min}}{2}"), t(", "), f("|A| = \\dfrac{y_{\\max} - y_{\\min}}{2}"), t(", "), f("T = \\dfrac{2\\pi}{\\omega}"), t(", "), f("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" ; le signe de "), f("A"), t(" se lit au sens de la courbe en "), f("x = \\Phi"), t(".")]),
    calcul(sq, lignes),
    { ...resultat(sq, reponseEcran(e, k)), figureHtml: figureLecture(e, k) },
    piege(
      sq,
      e.variante === "dephasage"
        ? [t("Le décalage horizontal n'est pas "), f("\\varphi"), t(" : "), f("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")]
        : e.variante === "amplitude"
          ? [t("Avec "), f("A < 0"), t(", la courbe est retournée : elle descend en "), f("x = \\Phi"), t(".")]
          : e.variante === "pulsation"
            ? [t("La période est "), f("\\dfrac{2\\pi}{\\omega}"), t(", pas "), f("\\omega"), t(" : plus "), f("\\omega"), t(" est grand, plus la courbe oscille vite.")]
            : [t("Une seule différence suffit : vérifie chaque paramètre avant de conclure.")],
    ),
  ];
}

export function correctionDetailleeAssocierCourbes(e: E): EtapeCorrection[] {
  return [0, 1, 2, 3].flatMap((k) => etape(e, k));
}
