import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { neg, type Rat } from "../../moteur5e/trigExact";
import { omegaLatex } from "../../moteur5e/sinusoideExacte";
import { Phi, T, pointCle, pointsPeriode, pointsReport, quart, sinusoide, type ExerciceSinusoidePoints } from "../../moteur5e/modeleSinusoidePoints";
import { listePoints, omegaTexte, reponseParametres, souderPonctuation, xLatex } from "../../ui5e/formatSinusoidePoints";
import { figureSinusoidePoints } from "../../ui5e/figureSinusoidePoints";
import { cadre, colonneDe } from "../../moteur5e/modeleSinusoidePoints";

/**
 * Corrigé détaillé « comme au tableau » de 5gen52 (partagé par l'appli et le papier) : a) A, b, T, Φ
 * (substitution puis valeur), b) les cinq points d'une période (une abscisse par ligne, + T/4 ; ordonnée
 * en justification), c) les quatre points reportés (± T). La réponse étant un GRAPHIQUE, les étapes b et
 * c portent la figure (`figureHtml`) : courbe et points clés.
 */

type E = ExerciceSinusoidePoints;
const t = texte;
const f = latex;

/** « \dfrac{\pi}{3} » écrit en ligne (« \pi/3 ») pour un numérateur de fraction. */
function phiEnLigne(c: Rat): string {
  if (c.n === 0) return "0";
  const a = Math.abs(c.n);
  return `${c.n < 0 ? "-" : ""}${a === 1 ? "" : a}\\pi${c.d === 1 ? "" : `/${c.d}`}`;
}

function plus(e: E, x: Rat): string {
  return x.n < 0 ? `- ${xLatex(e, neg(x))}` : `+ ${xLatex(e, x)}`;
}

function ordonnee(e: E, j: number): string {
  const m = ((j % 4) + 4) % 4;
  const y = pointCle(e, j).y;
  if (m === 0 || m === 2) return `ligne moyenne : y = ${y < 0 ? "−" + -y : y}`;
  const max = (m === 1) === e.A > 0;
  return `${max ? "maximum" : "minimum"} : y = ${m === 1 ? "b + A" : "b − A"} = ${y < 0 ? "−" + -y : y}`;
}

export function figureCorrige(e: E, mode: "periode" | "complete"): string {
  const c = cadre(e);
  const pts = (mode === "periode" ? pointsPeriode(e) : [...pointsPeriode(e), ...pointsReport(e)]).map((p) => ({ i: colonneDe(c, p.x), y: p.y, style: "juste" as const }));
  return `<div style="max-width:11cm;margin:6px auto">${figureSinusoidePoints(e, { courbe: mode, points: pts })}</div>`;
}

export function correctionDetailleeSinusoidePoints(e: E): EtapeCorrection[] {
  const s = sinusoide(e);
  const w = omegaTexte(e);
  const Tl = xLatex(e, T(e));
  const Pl = xLatex(e, Phi(e));
  const q = quart(e);
  // a)
  const a: LigneCalcul[] = [
    ligne(`A = ${e.A}`, "coefficient devant le sinus"),
    ligne(`b = ${e.b}`, "terme ajouté au sinus"),
    ...(w === "1"
      ? [ligne(`T = ${Tl}`, [f("T = \\dfrac{2\\pi}{\\omega}"), t(" avec "), f("\\omega = 1")]), ligne(`\\Phi = ${Pl}`, [f("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(" avec "), f("\\omega = 1")])]
      : [
          ligne(`T = \\dfrac{2\\pi}{${w}}`, [f("T = \\dfrac{2\\pi}{\\omega}")]),
          ligne(`= ${Tl}`),
          ligne(`\\Phi = -\\dfrac{${phiEnLigne(e.phi)}}{${w}}`, [f("\\Phi = -\\dfrac{\\varphi}{\\omega}")]),
          ligne(`= ${Pl}`),
        ]),
  ];
  // b)
  const per = pointsPeriode(e);
  const b: LigneCalcul[] = [ligne(`x_0 = ${Pl}`, ordonnee(e, 0))];
  for (let k = 1; k <= 4; k++) b.push(ligne(`x_${k} = ${xLatex(e, per[k - 1]!.x)} ${plus(e, q)} = ${xLatex(e, per[k]!.x)}`, ordonnee(e, k)));
  // c)
  const rep = pointsReport(e);
  const c: LigneCalcul[] = rep.map((p) => {
    const source = p.j < 0 ? pointCle(e, p.j + 4) : pointCle(e, p.j - 4);
    const op = p.j < 0 ? `- ${Tl}` : `+ ${Tl}`;
    return ligne(`x = ${xLatex(e, source.x)} ${op} = ${xLatex(e, p.x)}`, [t("même ordonnée que "), f(`x_${source.j}`), t(` : y = ${p.y < 0 ? "−" + -p.y : p.y}`)]);
  });
  return [
    utilise("a", [t("Dans "), f("f(x) = A\\sin(\\omega x + \\varphi) + b"), t(" (cours, § 4) : "), f("T = \\dfrac{2\\pi}{\\omega}"), t(" et "), f("\\Phi = -\\dfrac{\\varphi}{\\omega}"), t(".")]),
    calcul("a", a),
    resultat("a", souderPonctuation(reponseParametres(e))),
    verification("a", [f(`${omegaLatex(s)} \\times ${Tl} = 2\\pi`), t(" : un tour complet de l'argument.")]),
    piege("a", [t("La période n'est ni "), f("\\omega"), t(" ni "), f("2\\pi\\omega"), t(", et le décalage horizontal n'est pas "), f("\\varphi"), t(".")]),
    utilise("b", [t("Méthode de construction (cours, § 4) : à partir de "), f("\\Phi"), t(", une période partagée en 4 ; ordonnées "), f("b"), t(", "), f("b + A"), t(", "), f("b"), t(", "), f("b - A"), t(", "), f("b"), t(".")]),
    calcul("b", b),
    { ...resultat("b", souderPonctuation(listePoints(e, per))), figureHtml: figureCorrige(e, "periode") },
    piege("b", e.A < 0 ? [t("Avec "), f("A < 0"), t(", la courbe descend d'abord : le minimum vient avant le maximum.")] : [t("La période commence en "), f("x = \\Phi"), t(", pas en 0.")]),
    utilise("c", [t("La courbe se répète tous les "), f(`T = ${Tl}`), t(" (cours, § 4) : on ajoute ou on retire "), f("T"), t(" aux abscisses, les ordonnées ne changent pas.")]),
    calcul("c", c),
    { ...resultat("c", souderPonctuation(listePoints(e, rep))), figureHtml: figureCorrige(e, "complete") },
    piege("c", [t("On décale d'une période entière "), f("T"), t(", pas d'une demi-période.")]),
  ];
}
