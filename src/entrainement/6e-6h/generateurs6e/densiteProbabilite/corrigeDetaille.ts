import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice113 } from "../../core6e/densiteProbabilite";
import { aireTotale, aireUnites, bornesQueue, esperance113, integraleXG, morceaux, phases113, primitiveG, probaIntervalle113, probaQueue113, support, valeurK } from "../../core6e/densiteProbabilite";
import { evenementIntervalle113, evenementQueue113, gLatex, primitiveLatex, reponse113, xgLatex } from "../../ui6e/formatDensiteProbabilite";
import { densiteSvg } from "../../ui6e/figuresVariablesAleatoiresLotH1";
import type { Q } from "../../ui6e/outilsVariablesAleatoiresLotH1";
import { dl, fois, fr, moins, q, ql } from "../../ui6e/outilsVariablesAleatoiresLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen113`, une lettre par écran. Tracé : aire de chaque
 * morceau (triangle, rectangle, trapèze — hauteurs lues sur le quadrillage, en multiples de k), somme,
 * équation « aire = 1 », puis les probabilités comme aires (figure du corrigé : zone grisée). Formule :
 * k ∫ g = 1 par une primitive, P(a ≤ X ≤ b) = k [G]ₐᵇ, E(X) = k ∫ x g(x) dx. Même source que l'écran.
 */

type E = Exercice113;
const t = tx;
const l = lx;

/** « k », « 2k », « \dfrac{1}{2}k », « 0 ». */
function enK(c: Q): string {
  if (c.n === 0) return "0";
  if (c.n === 1 && c.d === 1) return "k";
  // Demi-unités en décimal (« 0,5k », « 1,5k ») : pas de fraction dans une fraction.
  return c.d === 2 ? `${dl(c.n / 2)}k` : `${ql(c)}k`;
}

/** Lignes des aires des morceaux entre u et v (unités de k) et leur somme. */
function lignesAires(e: E, u: number, v: number, gauche: string): { lignes: LigneCalcul[]; total: Q } {
  const ms = morceaux(e.segments!, u, v);
  const lignes: LigneCalcul[] = [];
  ms.forEach((m, i) => {
    const len = m.x1 - m.x0;
    const nom = ms.length > 1 ? `\\mathcal{A}_${i + 1}` : gauche;
    const rect = m.h0.n * m.h1.d === m.h1.n * m.h0.d;
    const tri = m.h0.n === 0 || m.h1.n === 0;
    const h = m.h0.n === 0 ? m.h1 : m.h0;
    const expr = rect ? `${len}\\times ${enK(m.h0)}` : tri ? `\\dfrac{${len}\\times ${enK(h)}}{2}` : `\\dfrac{(${enK(m.h0)}+${enK(m.h1)})\\times ${len}}{2}`;
    lignes.push(ligne(`${nom}=${expr}=${enK(m.aire)}`, `${rect ? "rectangle" : tri ? "triangle" : "trapèze"} de ${m.x0} à ${m.x1}`));
  });
  const total = ms.reduce((acc, m) => ({ n: acc.n * m.aire.d + m.aire.n * acc.d, d: acc.d * m.aire.d }), { n: 0, d: 1 });
  const tq = q(total.n, total.d);
  if (ms.length > 1) lignes.push(ligne(`${gauche}=${ms.map((_, i) => `\\mathcal{A}_${i + 1}`).join("+")}=${enK(tq)}`, "somme des morceaux"));
  return { lignes, total: tq };
}

function etapesTrace(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const [u, v] = support(e);
  const k = valeurK(e);
  const kl = ql(k);
  phases113(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    if (ph === "k") {
      const { lignes, total } = lignesAires(e, u, v, "\\mathcal{A}");
      out.push(
        utilise(sq, [t("Densité (cours, § 3) : l'aire totale sous la courbe vaut 1. On découpe l'aire en figures simples ; les hauteurs se lisent sur le quadrillage, en multiples de k.")]),
        calcul(sq, [...lignes, ligne(`${enK(total)}=1`, "l'aire totale vaut 1"), ligne(`k=${kl}`)]),
        resultat(sq, fr(reponse113(e, ph))),
        piege(sq, [t("Prendre pour k l'aire totale elle-même : c'est son inverse qui fait valoir 1 à l'aire.")]),
      );
      return;
    }
    const [x0, x1] = ph === "intervalle" ? [e.a, e.b] : bornesQueue(e);
    const ev = ph === "intervalle" ? evenementIntervalle113(e) : evenementQueue113(e);
    const { lignes, total } = lignesAires(e, x0, x1, "\\mathcal{A}");
    const P = ph === "intervalle" ? probaIntervalle113(e) : probaQueue113(e);
    out.push(
      utilise(sq, [t("Probabilité d'un intervalle (cours, § 3) : c'est l'aire sous la courbe de f entre ses bornes ; au milieu d'une pente, la hauteur est la fraction de k correspondante.")]),
      { ...calcul(sq, [...lignes, ligne(`${ev}=${enK(total)}`, "aire entre les bornes"), ligne(`=${ql(total)}\\times ${kl}`, "on remplace k"), ligne(`=${ql(P)}`)]), figureHtml: densiteSvg(e.segments!, { zone: [x0, x1] }) },
      resultat(sq, fr(reponse113(e, ph))),
      ...(ph === "queue" ? [verification(sq, [t("Avec l'aire restante : "), l(`1-${ql(fois(k, aireUnites(e.segments!, x1 === v ? u : x1, x1 === v ? x0 : v)))}=${ql(P)}`), t(".")])] : []),
      piege(sq, [t("Lire la hauteur "), l("f(x)"), t(" au lieu de calculer une aire : une densité n'est pas une probabilité.")]),
    );
  });
  return out;
}

function etapesFormule(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const L = e.L!;
  const g = e.g!;
  const k = valeurK(e);
  const kl = ql(k);
  const S = aireTotale(e);
  const gl = gLatex(g, L);
  phases113(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    if (ph === "k") {
      out.push(
        utilise(sq, [t("Densité (cours, § 3) : "), l(`\\int_0^{${L}}f(x)\\,dx=1`), t(" ; k sort de l'intégrale.")]),
        calcul(sq, [
          ligne(`\\int_0^{${L}}k${gl}\\,dx=1`, "l'aire totale vaut 1"),
          ligne(`k\\Big[${primitiveLatex(g, L)}\\Big]_0^{${L}}=1`, "primitive"),
          ligne(`k\\times ${ql(S)}=1`, "valeur en L moins valeur en 0"),
          ligne(`k=${kl}`),
        ]),
        resultat(sq, fr(reponse113(e, ph))),
        verification(sq, [t("f est bien positive sur "), l(`[0\\,;${L}]`), t(" (k > 0 et "), l(`${gl}\\geq 0`), t(") : c'est une densité.")]),
        piege(sq, [t("Prendre "), l(`k=${ql(S)}`), t(" (la valeur de l'intégrale) au lieu de son inverse.")]),
      );
    } else if (ph === "intervalle") {
      const Gb = primitiveG(g, L, e.b);
      const Ga = primitiveG(g, L, e.a);
      const diff = moins(Gb, Ga);
      const paren = (x: Q) => (x.n < 0 ? `\\left(${ql(x)}\\right)` : ql(x));
      out.push(
        utilise(sq, [t("Probabilité d'un intervalle (cours, § 3) : "), l("P(a\\leq X\\leq b)=\\int_a^b f(x)\\,dx"), t(".")]),
        calcul(sq, [
          ligne(`${evenementIntervalle113(e)}=\\int_{${e.a}}^{${e.b}}${kl}${gl}\\,dx`),
          ligne(`=${kl}\\Big[${primitiveLatex(g, L)}\\Big]_{${e.a}}^{${e.b}}`, "primitive"),
          ...(Ga.n === 0
            ? [ligne(`=${kl}\\times ${ql(Gb)}`, "G(b) − G(0), avec G(0) = 0")]
            : [ligne(`=${kl}\\times\\left(${ql(Gb)}-${paren(Ga)}\\right)`, "G(b) − G(a)"), ligne(`=${kl}\\times ${ql(diff)}`)]),
          ligne(`=${ql(probaIntervalle113(e))}`),
        ]),
        resultat(sq, fr(reponse113(e, ph))),
        piege(sq, [t("Calculer "), l(`f(${e.b})`), t(" ou "), l(`f(${e.b})-f(${e.a})`), t(" : la probabilité est l'intégrale (l'aire), pas la valeur de la densité.")]),
      );
    } else {
      const xg = xgLatex(g, L);
      const I = integraleXG(g, L);
      out.push(
        utilise(sq, [t("Espérance d'une variable continue (cours, § 3) : "), l(`E(X)=\\int_0^{${L}}x\\,f(x)\\,dx`), t(".")]),
        calcul(sq, [
          ligne(`E(X)=\\int_0^{${L}}x\\times ${kl}${gl}\\,dx`),
          ligne(`=${kl}\\int_0^{${L}}${xg.integrande.includes("-") ? `\\left(${xg.integrande}\\right)` : xg.integrande}\\,dx`, "on développe"),
          ligne(`=${kl}\\Big[${xg.primitive}\\Big]_0^{${L}}`, "primitive"),
          ligne(`=${kl}\\times ${ql(I)}`),
          ligne(`=${ql(esperance113(e))}`),
        ]),
        resultat(sq, fr(reponse113(e, ph))),
        verification(sq, [t("L'espérance est bien comprise entre 0 et "), l(`${L}`), t(g === "xLmx" ? ", et vaut le milieu : la densité est symétrique." : g === "Lmx" ? ", du côté où la densité est la plus grande (près de 0)." : `, du côté où la densité est la plus grande (près de ${L}).`)]),
        piege(sq, [t("Calculer "), l("\\int f(x)\\,dx"), t(" (qui vaut 1) au lieu de "), l("\\int x\\,f(x)\\,dx"), t(", ou répondre le milieu de l'intervalle sans calcul.")]),
      );
    }
  });
  return out;
}

export function correctionDetaillee113(e: E): EtapeCorrection[] {
  return e.variante === "trace" ? etapesTrace(e) : etapesFormule(e);
}
