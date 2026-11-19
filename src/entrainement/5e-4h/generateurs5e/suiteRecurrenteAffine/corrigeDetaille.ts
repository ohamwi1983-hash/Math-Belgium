import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceSuiteRecurrenteAffine } from "../../core5e/suiteRecurrenteAffine.types";
import type { FractionQ } from "../../core5e/suitesGeometriques.types";
import { aLatex, formatRegimeConfirmeLatex, formatReponseAttenduePhaseLatex } from "../../ui5e/formatSuiteRecurrenteAffine";
import { COURS_RECURRENTE, dec, decimalExact, fois, fr, fragmentsListe, jf, nt, signe, valeur } from "../../ui5e/corrigeSuites1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen19 (suite récurrente affine et régime permanent) —
 * règle `.claude/rules/feuilles-evaluations.md`. a) le coefficient a (1 ∓ p/100) et b, puis la
 * relation ; b) le critère |a| < 1, puis L = aL + b résolue ligne à ligne (ou, si |a| ≥ 1, l'écart
 * entre deux valeurs qui grandit) ; c) les trois termes, chacun substitué puis calculé (V₃ exact,
 * V₄ à partir de V₃ arrondi, comme l'écran l'autorise). Mêmes écritures que l'écran (`aLatex`,
 * `formatReponseAttenduePhaseLatex`, `formatRegimeConfirmeLatex`). SANS `docx`.
 */

type E = ExerciceSuiteRecurrenteAffine;
const t = texte;
const f = latex;

function pourcentage(e: E): number {
  return Math.round(Math.abs(valeur(e.a) - 1) * 100);
}

function reponse(e: E, phase: "poserRecurrence" | "regimePermanent" | "termesSuccessifs"): FragmentConsigne[] {
  return fragmentsListe(formatReponseAttenduePhaseLatex(e, phase));
}

/** Valeur décimale écrite avec « = » si exacte (au plus `d` décimales), sinon « ≈ ». */
function egalDec(v: number, d = 2): string {
  return `${decimalExact(v, d) ? "=" : "\\approx "}${dec(v, d)}`;
}

function etapePoser(e: E): EtapeCorrection[] {
  const sq = "a";
  const V = e.variableGrandeur;
  const p = pourcentage(e);
  const convergent = e.regime === "convergent";
  const A = aLatex(e);
  return [
    utilise(sq, [
      t(convergent ? "Retirer p % revient à garder le reste, donc à multiplier par " : "Augmenter de p % revient à multiplier par "),
      f(convergent ? "1-\\dfrac{p}{100}" : "1+\\dfrac{p}{100}"),
      t(" ; la quantité fixe ajoutée ou retirée à chaque étape est b. Suite récurrente affine : "),
      f(`${V}_{n+1}=a\\times ${V}_n+b`),
      t(` ${COURS_RECURRENTE}.`),
    ]),
    calcul(sq, [
      ligne(`a=1${convergent ? "-" : "+"}\\dfrac{${p}}{100}`, convergent ? `on retire ${p} %` : `on ajoute ${p} %`),
      ligne(`=1${convergent ? "-" : "+"}${dec(p / 100)}`),
      ligne(`=${A}`),
      ligne(`b=${e.b}`, e.b < 0 ? "quantité retirée à chaque étape" : "quantité ajoutée à chaque étape"),
      ligne(`${V}_{n+1}=a\\times ${V}_n+b`, "forme d'une suite récurrente affine"),
      ligne(`=${A}\\times ${V}_n${signe(e.b)}`, "on remplace a et b"),
    ]),
    resultat(sq, reponse(e, "poserRecurrence")),
    piege(
      sq,
      convergent
        ? [t(`Multiplier par ${nt(p / 100, 2)} (la part retirée) au lieu de ${nt(valeur(e.a), 2)} (la part qui reste).`)]
        : [t(`Multiplier par ${nt(p / 100, 2)} au lieu de ${nt(valeur(e.a), 2)} : une hausse de ${p} % multiplie par 1 + ${p} ÷ 100.`)],
    ),
  ];
}

function etapeRegime(e: E): EtapeCorrection[] {
  const sq = "b";
  const V = e.variableGrandeur;
  const A = aLatex(e);
  const a = valeur(e.a);
  const unMoinsA = dec(1 - a);
  const ut = utilise(sq, [t("Un régime permanent existe seulement si "), f("|a|<1"), t(" ; à l'équilibre, la valeur ne change plus d'une étape à l'autre : "), f(`${V}_{n+1}=${V}_n=L`), t(", donc "), f("L=a\\times L+b"), t(` ${COURS_RECURRENTE}.`)]);
  if (e.regime === "convergent") {
    const L = e.L as FractionQ;
    const Lv = valeur(L);
    const lignes: LigneCalcul[] = [
      ligne(`|a|=${A}`, "valeur absolue de a"),
      ligne(`${A}<1`, "le régime permanent existe"),
      ligne(`L=${A}\\times L${signe(e.b)}`, "à l'équilibre, L = aL + b"),
      ligne(`L-${A}L=${e.b}`, jf("on retire ", { l: `${A}L` }, " des deux membres")),
      ligne(`${unMoinsA}L=${e.b}`, "on réduit"),
      ligne(`L=\\dfrac{${e.b}}{${unMoinsA}}`, jf("on divise par ", { l: unMoinsA })),
    ];
    if (decimalExact(Lv)) lignes.push(ligne(`=${dec(Lv)}`));
    else if (L.den <= 20) lignes.push(ligne(`=${fr(L)}`, "on simplifie"), ligne(`\\approx ${dec(Lv)}`, "arrondi au centième"));
    else lignes.push(ligne(`\\approx ${dec(Lv)}`, "arrondi au centième"));
    return [
      ut,
      calcul(sq, lignes),
      resultat(sq, reponse(e, "regimePermanent")),
      verification(sq, [t("À l'équilibre, une étape de plus ne change rien :")], [ligne(`${A}\\times ${decimalExact(Lv) ? dec(Lv) : fr(L)}${signe(e.b)}=${decimalExact(Lv) ? dec(a * Lv, 4) : fr(fois(e.a, L))}${signe(e.b)}`), ligne(`=${decimalExact(Lv) ? dec(Lv) : fr(L)}`, "c'est bien L ✓")]),
    ];
  }
  const ecart = (a - 1) * e.u1 + e.b;
  return [
    ut,
    calcul(sq, [
      ligne(`|a|=${A}`, "valeur absolue de a"),
      ligne(`${A}\\geq 1`, "le critère n'est pas vérifié : pas de régime permanent"),
      ligne(`${V}_2-${V}_1=${dec(a - 1)}\\times ${e.u1}${signe(e.b)}`, jf("car ", { l: `${V}_2=a\\times ${V}_1+b` })),
      ligne(`${egalDec(ecart)}`),
      ligne(`${dec(ecart)}>0`, "la grandeur augmente déjà à la première étape"),
      ligne(`${V}_{n+2}-${V}_{n+1}=${A}\\times(${V}_{n+1}-${V}_n)`, "chaque écart vaut a fois le précédent : il grandit sans limite"),
    ]),
    resultat(sq, [t("Pas de régime permanent : "), f(formatRegimeConfirmeLatex(e)), t(". La suite croît sans limite.")]),
    piege(sq, [t("La formule donne pourtant un nombre, "), f(`\\dfrac{b}{1-a}\\approx ${dec(e.b / (1 - a))}`), t(" : ce n'est pas un régime permanent, puisque "), f("|a|\\geq 1"), t(".")]),
  ];
}

function etapeTermes(e: E): EtapeCorrection[] {
  const sq = "c";
  const V = e.variableGrandeur;
  const A = aLatex(e);
  const a = valeur(e.a);
  const u2 = valeur(e.u2);
  const u3 = valeur(e.u3);
  const u4 = valeur(e.u4);
  const u3r = Math.round(u3 * 100) / 100;
  const lignes: LigneCalcul[] = [
    ligne(`${V}_2=${A}\\times ${e.u1}${signe(e.b)}`, `relation avec ${V}₁ = ${e.u1}`),
    ligne(`=${dec(a * e.u1, 4)}${signe(e.b)}`, "on multiplie"),
    ligne(`${egalDec(u2, 4)}`),
    ligne(`${V}_3=${A}\\times ${dec(u2, 4)}${signe(e.b)}`, "relation avec V₂".replace("V", V)),
    ligne(`=${dec(a * u2, 4)}${signe(e.b)}`, "on multiplie"),
    ligne(`${egalDec(u3, 4)}`),
  ];
  if (!decimalExact(u3, 2)) lignes.push(ligne(`\\approx ${dec(u3)}`, "arrondi au centième"));
  lignes.push(ligne(`${V}_4=${A}\\times ${V}_3${signe(e.b)}`, "relation avec V₃".replace("V", V)));
  if (decimalExact(u3, 2)) {
    lignes.push(ligne(`=${A}\\times ${dec(u3)}${signe(e.b)}`, "on remplace"));
    lignes.push(ligne(`${egalDec(a * u3, 4)}${signe(e.b)}`, "on multiplie"));
    lignes.push(ligne(`${egalDec(u4, 4)}`));
  } else {
    lignes.push(ligne(`\\approx ${A}\\times ${dec(u3r)}${signe(e.b)}`, "valeur arrondie de V₃".replace("V", V)));
    lignes.push(ligne(`\\approx ${dec(a * u3r, 4)}${signe(e.b)}`, "on multiplie"));
    lignes.push(ligne(`\\approx ${dec(a * u3r + e.b, 4)}`));
  }
  if (!decimalExact(u4, 2)) lignes.push(ligne(`\\approx ${dec(u4)}`, "arrondi au centième"));
  return [
    utilise(sq, [t("On applique la relation de l'étape a, en partant de la valeur initiale : "), f(`${V}_{n+1}=${A}\\times ${V}_n${signe(e.b)}`), t(" ; on peut réutiliser une valeur arrondie au centième.")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "termesSuccessifs")),
    piege(sq, [f(`${V}_2=a\\times ${V}_1+b`), t(", et non "), f(`a\\times(${V}_1+b)`), t(" : on multiplie d'abord, puis on ajoute b.")]),
  ];
}

export function correctionDetailleeSuiteRecurrenteAffine(exercice: E): EtapeCorrection[] {
  return [...etapePoser(exercice), ...etapeRegime(exercice), ...etapeTermes(exercice)];
}
