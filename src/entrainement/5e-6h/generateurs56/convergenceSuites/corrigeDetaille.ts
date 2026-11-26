// Copie 5e (6h) de `5e-4h/generateurs5e/convergenceSuites/corrigeDetaille.ts` (56gen6 ← 5gen16, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceConvergenceArithmetique, ExerciceConvergenceGeometrique, ExerciceConvergenceQuelconque, ExerciceConvergenceSuite, PolynomeConvergence } from "../../../5e-4h/core5e/convergenceSuites.types";
import type { PhaseConvergenceSuite } from "./moteur/typesConvergenceSuites";
import { formatExpressionDiviseeLatex, libelleClassificationAttendue } from "./ui/formatConvergenceSuites";
import { COURS_CONVERGENCE, abs, fois, fr, par, puissanceLatex, q } from "../../../5e-4h/ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen16 (convergence et divergence) — règle
 * `.claude/rules/feuilles-evaluations.md`, conventions « lectures et décisions » : chaque étape a
 * un « Calcul » qui montre le raisonnement (raison lue et comparée, terme général, limite de qⁿ⁻¹,
 * premiers termes qui alternent ; suite quelconque : division terme à terme par la plus haute
 * puissance du dénominateur, puis limite du numérateur et du dénominateur). « Résultat » = verdict
 * de l'écran (`libelleClassificationAttendue`) avec la limite. SANS `docx`.
 */

type E = ExerciceConvergenceSuite;
const t = texte;
const f = latex;
const LIM = "\\lim_{n\\to+\\infty}";

function phaseConclusion(exercice: E): PhaseConvergenceSuite {
  return exercice.variante === "arithmetique" ? "classificationArithmetique" : exercice.variante === "geometrique" ? "classificationGeometrique" : "classifierQuelconque";
}

/** Limite écrite (`\lim u_n = …`), `null` si la suite n'a pas de limite (oscillation). */
export function limiteConvergenceLatex(exercice: E): string | null {
  const c = exercice.classification;
  if (c === "divergePlusInfini") return "\\lim u_n=+\\infty";
  if (c === "divergeMoinsInfini") return "\\lim u_n=-\\infty";
  if (exercice.variante === "quelconque") {
    if (exercice.classification === "limiteZero") return "\\lim u_n=0";
    return `\\lim u_n=${fr(q(dominant(exercice.P, exercice.degP), dominant(exercice.Q, exercice.degQ)))}`;
  }
  if (c === "convergeVersU1") return `\\lim u_n=u_1=${exercice.u1}`;
  if (c === "convergeVersZero") return "\\lim u_n=0";
  return null;
}

function resultatConvergence(exercice: E, sq: string): EtapeCorrection {
  const libelle = libelleClassificationAttendue(exercice, phaseConclusion(exercice));
  const lim = limiteConvergenceLatex(exercice);
  return resultat(sq, lim === null ? [t(`${libelle} : la suite n'a pas de limite.`)] : [t(`${libelle} : `), f(lim), t(".")]);
}

// ============================================================================
// Arithmétique.
// ============================================================================

function arithmetique(e: ExerciceConvergenceArithmetique): EtapeCorrection[] {
  const sq = "a";
  const terme = `u_n=${e.u1}+(n-1)\\times ${par(e.r)}`;
  let lignes: LigneCalcul[];
  if (e.r === 0) {
    lignes = [ligne(`r=0`, "raison donnée"), ligne(terme, "terme général"), ligne(`=${e.u1}`, "pour tout n : on n'ajoute rien"), ligne(`${LIM}u_n=${e.u1}`, "suite constante")];
  } else {
    const plus = e.r > 0;
    lignes = [
      ligne(`r=${e.r}`, "raison donnée"),
      ligne(`${e.r}${plus ? ">" : "<"}0`, plus ? "raison positive : on ajoute le même nombre positif à chaque rang" : "raison négative : on retire le même nombre à chaque rang"),
      ligne(terme, "terme général"),
      ligne(`${LIM}u_n=${plus ? "+" : "-"}\\infty`, plus ? "les termes grandissent sans limite" : "les termes décroissent sans limite"),
    ];
  }
  return [
    utilise(sq, [t("Limite d'une suite arithmétique : si "), f("r>0"), t(", elle diverge vers +∞ ; si "), f("r<0"), t(", vers −∞ ; si "), f("r=0"), t(`, elle est constante et converge vers u₁ ${COURS_CONVERGENCE}.`)]),
    calcul(sq, lignes),
    resultatConvergence(e, sq),
    piege(sq, [t(e.r === 0 ? "r = 0 : la suite est constante — elle converge (vers u₁), même si elle « ne bouge pas »." : "Une suite arithmétique de raison non nulle n'a jamais de limite finie : elle ne converge pas, même si sa raison est petite.")]),
  ];
}

// ============================================================================
// Géométrique.
// ============================================================================

function geometrique(e: ExerciceConvergenceGeometrique): EtapeCorrection[] {
  const sq = "a";
  const qq = e.q;
  const u1 = e.u1;
  const terme = `u_n=${u1}\\times ${puissanceLatex(qq, "n-1")}`;
  const qa = abs(qq);
  let lignes: LigneCalcul[];
  switch (e.classification) {
    case "convergeVersU1":
      lignes = [ligne("q=1", "raison donnée"), ligne(terme, "terme général"), ligne(`=${u1}`, "une puissance de 1 vaut 1"), ligne(`${LIM}u_n=${u1}`, "suite constante")];
      break;
    case "convergeVersZero":
      lignes = [
        ligne(`|q|=${fr(qa)}`, "valeur absolue de la raison"),
        ligne(`${fr(qa)}<1`, "|q| < 1"),
        ligne(terme, "terme général"),
        ligne(`${LIM}${puissanceLatex(qq, "n-1")}=0`, "car |q| < 1 : les puissances de q se rapprochent de 0"),
        ligne(`${LIM}u_n=${u1}\\times 0`, "u₁ fois une quantité qui tend vers 0"),
        ligne("=0"),
      ];
      break;
    case "divergePlusInfini":
    case "divergeMoinsInfini": {
      const pos = u1 > 0;
      lignes = [
        ligne(`q=${fr(qq)}`, "raison donnée"),
        ligne(`${fr(qq)}>1`, "q > 1"),
        ligne(terme, "terme général"),
        ligne(`${LIM}${puissanceLatex(qq, "n-1")}=+\\infty`, "car q > 1 : les puissances de q grandissent sans limite"),
        ligne(`u_1=${u1}`, "premier terme"),
        ligne(`${u1}${pos ? ">" : "<"}0`, pos ? "u₁ positif" : "u₁ négatif : le signe s'inverse"),
        ligne(`${LIM}u_n=${pos ? "+" : "-"}\\infty`, pos ? "un nombre positif fois +∞" : "un nombre négatif fois +∞"),
      ];
      break;
    }
    case "oscilleNeConvergePas":
      lignes = [
        ligne("q=-1", "raison donnée"),
        ligne(`u_2=${u1}\\times(-1)`, "on multiplie u₁ par q"),
        ligne(`=${-u1}`),
        ligne(`u_3=${par(-u1)}\\times(-1)`, "on multiplie u₂ par q"),
        ligne(`=${u1}`),
        ligne("u_{n+2}=u_n\\times(-1)^2", "deux rangs plus loin, on a multiplié deux fois par −1"),
        ligne("=u_n", [t("les termes valent alternativement "), f(`${u1}`), t(" et "), f(`${-u1}`)]),
      ];
      break;
    case "oscilleDivergeSansLimite": {
      const u2 = fois(q(u1), qq);
      const u3 = fois(u2, qq);
      lignes = [
        ligne(`q=${fr(qq)}`, "raison donnée"),
        ligne(`${fr(qq)}<-1`, "q < −1"),
        ligne(`u_2=${u1}\\times ${par(qq)}`, "on multiplie u₁ par q"),
        ligne(`=${fr(u2)}`),
        ligne(`u_3=${par(u2)}\\times ${par(qq)}`, "on multiplie u₂ par q"),
        ligne(`=${fr(u3)}`),
        ligne(`|u_{n+1}|=${fr(qa)}\\times|u_n|`, "les signes alternent et la valeur absolue est multipliée par |q| > 1 à chaque rang"),
      ];
      break;
    }
  }
  const piegeTexte =
    e.classification === "divergeMoinsInfini"
      ? "Avec q > 1, la suite ne diverge pas toujours vers +∞ : c'est le signe de u₁ qui décide (ici u₁ < 0, donc −∞)."
      : e.classification === "oscilleNeConvergePas"
        ? "q = −1 : la suite reste bornée (elle oscille entre u₁ et −u₁) mais ne converge pas."
        : e.classification === "oscilleDivergeSansLimite"
          ? "q < −1 : les termes changent de signe et grandissent en valeur absolue — ni +∞ ni −∞, la suite n'a pas de limite."
          : e.classification === "convergeVersZero"
            ? qq.num < 0
              ? "q est négatif, mais |q| < 1 : les termes alternent de signe et tendent quand même vers 0."
              : "C'est |q| qu'on compare à 1 : ici |q| < 1, les termes se rapprochent de 0."
            : "C'est |q| qu'on compare à 1, puis le signe de q (et celui de u₁ si q > 1).";
  return [
    utilise(sq, [
      t("Limite d'une suite géométrique : "),
      f("q=1"),
      t(" constante ; "),
      f("|q|<1"),
      t(" converge vers 0 ; "),
      f("q>1"),
      t(" diverge vers +∞ ou −∞ selon le signe de u₁ ; "),
      f("q=-1"),
      t(" oscille ; "),
      f("q<-1"),
      t(` oscille avec une amplitude croissante ${COURS_CONVERGENCE}.`),
    ]),
    calcul(sq, lignes),
    resultatConvergence(e, sq),
    piege(sq, [t(piegeTexte)]),
  ];
}

// ============================================================================
// Suite quelconque P(n)/Q(n).
// ============================================================================

function dominant(p: PolynomeConvergence, deg: 1 | 2): number {
  return deg === 2 ? p.a : p.b;
}

function polynomeLatex(p: PolynomeConvergence): string {
  const termes: string[] = [];
  const ajouter = (c: number, partie: string) => {
    if (c === 0) return;
    const corps = partie === "" ? `${Math.abs(c)}` : Math.abs(c) === 1 ? partie : `${Math.abs(c)}${partie}`;
    termes.push(`${c < 0 ? "-" : termes.length ? "+" : ""}${corps}`);
  };
  ajouter(p.a, "n^2");
  ajouter(p.b, "n");
  ajouter(p.c, "");
  return termes.join("") || "0";
}

/** Chaque terme de P divisé par n^d, avant simplification (`\frac{3n^2}{n^2}`). */
function polynomeDiviseBrut(p: PolynomeConvergence, d: 1 | 2): string {
  const puissance = d === 2 ? "n^2" : "n";
  const termes: string[] = [];
  const ajouter = (c: number, partie: string) => {
    if (c === 0) return;
    const corps = partie === "" ? `${Math.abs(c)}` : Math.abs(c) === 1 ? partie : `${Math.abs(c)}${partie}`;
    termes.push(`${c < 0 ? "-" : termes.length ? "+" : ""}\\frac{${corps}}{${puissance}}`);
  };
  ajouter(p.a, "n^2");
  ajouter(p.b, "n");
  ajouter(p.c, "");
  return termes.join("");
}

/** Numérateur et dénominateur de l'expression divisée de l'écran (`formatExpressionDiviseeLatex`). */
function numDen(exercice: ExerciceConvergenceQuelconque): { num: string; den: string } {
  const s = formatExpressionDiviseeLatex(exercice).replace(/^u_n\s*=\s*/, "");
  const groupe = (debut: number): { contenu: string; fin: number } => {
    let prof = 0;
    for (let i = debut; i < s.length; i++) {
      if (s[i] === "{") prof++;
      else if (s[i] === "}") {
        prof--;
        if (prof === 0) return { contenu: s.slice(debut + 1, i), fin: i + 1 };
      }
    }
    return { contenu: "", fin: s.length };
  };
  const g1 = groupe(s.indexOf("{"));
  const g2 = groupe(g1.fin);
  return { num: g1.contenu, den: g2.contenu };
}

function quelconqueDiviser(e: ExerciceConvergenceQuelconque): EtapeCorrection[] {
  const sq = "a";
  const nd = e.degQ === 2 ? "n^2" : "n";
  const divisee = formatExpressionDiviseeLatex(e).replace(/^u_n\s*=\s*/, "").replace(/\s+/g, "");
  return [
    utilise(sq, [t("On divise le numérateur et le dénominateur par la plus haute puissance de n du dénominateur, ici "), f(nd), t(` : la fraction ne change pas, et chaque terme se simplifie ${COURS_CONVERGENCE}.`)]),
    calcul(sq, [
      ligne(`u_n=\\dfrac{${polynomeLatex(e.P)}}{${polynomeLatex(e.Q)}}`, "suite donnée"),
      ligne(`=\\dfrac{${polynomeDiviseBrut(e.P, e.degQ)}}{${polynomeDiviseBrut(e.Q, e.degQ)}}`, [t("on divise chaque terme par "), f(nd)]),
      ligne(`=${divisee}`, "on simplifie chaque quotient"),
    ]),
    resultat(sq, [f(formatExpressionDiviseeLatex(e))]),
    piege(sq, [t("On divise par la plus haute puissance du dénominateur, pas du numérateur : sinon le dénominateur tend vers 0 et on ne peut pas conclure.")]),
  ];
}

function quelconqueConclure(e: ExerciceConvergenceQuelconque): EtapeCorrection[] {
  const sq = "b";
  const { num, den } = numDen(e);
  const a = dominant(e.P, e.degP);
  const b = dominant(e.Q, e.degQ);
  const limDen = `${b}`;
  const lignes: LigneCalcul[] = [];
  if (e.degP < e.degQ) {
    lignes.push(ligne(`${LIM}(${num})=0`, "chaque terme est un nombre divisé par une puissance de n"));
    lignes.push(ligne(`${LIM}(${den})=${limDen}`, "les termes divisés par une puissance de n tendent vers 0"));
    lignes.push(ligne(`${LIM}u_n=\\dfrac{0}{${limDen}}`, "limite d'un quotient"));
    lignes.push(ligne("=0"));
  } else if (e.degP === e.degQ) {
    const lim = q(a, b);
    lignes.push(ligne(`${LIM}(${num})=${a}`, "les termes divisés par une puissance de n tendent vers 0"));
    lignes.push(ligne(`${LIM}(${den})=${limDen}`, "idem"));
    lignes.push(ligne(`${LIM}u_n=\\dfrac{${a}}{${b}}`, "quotient des coefficients dominants"));
    if (`\\dfrac{${a}}{${b}}` !== fr(lim)) lignes.push(ligne(`=${fr(lim)}`, "on simplifie"));
  } else {
    const plus = a * b > 0;
    lignes.push(ligne(`${LIM}(${num})=${a > 0 ? "+" : "-"}\\infty`, [t("le terme "), f(`${a === 1 ? "" : a === -1 ? "-" : a}n`), t(` tend vers ${a > 0 ? "+" : "−"}∞, les autres vers un nombre`)]));
    lignes.push(ligne(`${LIM}(${den})=${limDen}`, "les termes divisés par n tendent vers 0"));
    lignes.push(ligne(`${LIM}u_n=${plus ? "+" : "-"}\\infty`, `${a > 0 ? "+" : "−"}∞ divisé par un nombre ${b > 0 ? "positif" : "négatif"}`));
  }
  return [
    utilise(sq, [t("Quand n tend vers +∞, "), f("\\dfrac{1}{n}"), t(" et "), f("\\dfrac{1}{n^2}"), t(" tendent vers 0 ; on prend la limite du numérateur et celle du dénominateur, puis celle du quotient " + COURS_CONVERGENCE + ".")]),
    calcul(sq, lignes),
    resultatConvergence(e, sq),
    ...(e.degP > e.degQ ? [piege(sq, [t("Le signe de la limite est celui du quotient des coefficients dominants : "), f(`\\dfrac{${a}}{${b}}`), t(a * b > 0 ? " est positif." : " est négatif.")])] : []),
  ];
}

export function correctionDetailleeConvergenceSuite(exercice: E): EtapeCorrection[] {
  if (exercice.variante === "arithmetique") return arithmetique(exercice);
  if (exercice.variante === "geometrique") return geometrique(exercice);
  return [...quelconqueDiviser(exercice), ...quelconqueConclure(exercice)];
}

