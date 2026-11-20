import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTangenteExpo } from "../../core6e/tangenteExponentielle";
import { aVal, coefPente, image, imageExacte, ordonneeOrigine, pente } from "../../core6e/tangenteExponentielle";
import { nbL, rat, ratL, ratMul } from "../../ui6e/nombresExpoLotG";
import { aL, expressionL, imageL, lnL, penteL, phases, puissanceL, reponse, tangenteApproxL, tangenteL } from "../../ui6e/formatTangenteExponentielle";

/**
 * Corrigé détaillé « comme au tableau » de `6gen149` (tangente et ln a), partagé par l'appli et le
 * papier — une lettre par écran (`en-zero` : a signe, b pente, c tangente ; sinon a image, b pente,
 * c tangente). Valeurs exactes jusqu'au bout (ln a et e^n gardés en lettres), une seule valeur
 * approchée en dernière ligne, calculée depuis la valeur exacte.
 */

type E = ExerciceTangenteExpo;
const t = texte;
const f = latex;
const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
const par = (s: string) => (s.startsWith("-") ? `(${s})` : s);
const approx = (v: number) => nbL(v, 2, true);
const COURS = "(cours, § 2)";
const eL = (p: number) => (p === 1 ? "e" : `e^{${p}}`);

function etapeSigne(e: E): EtapeCorrection[] {
  const sq = "a";
  const sup = aVal(e) > 1;
  return [
    utilise(sq, [t("La pente de la tangente en "), f("(0\\,;1)"), t(" à la courbe de "), f("a^{x}"), t(" est le nombre "), f("\\ln a"), t(` ${COURS} ; il est positif si `), f("a>1"), t(" (la courbe monte), négatif si "), f("0<a<1"), t(" (elle descend).")]),
    calcul(sq, [ligne(`a=${aL(e)}${sup ? ">1" : "<1"}`, "on compare la base à 1"), ligne(`${lnL(e)}${sup ? ">0" : "<0"}`, [f("a^{x}"), t(sup ? " croît" : " décroît")])]),
    resultat(sq, reponse(e, "signe")),
    piege(sq, [t("Croire que la pente est toujours positive parce que "), f("a^{x}>0"), t(" : c'est la valeur qui est positive, pas la pente.")]),
  ];
}

function etapeImage(e: E): EtapeCorrection[] {
  const sq = "a";
  const lignes: LigneCalcul[] = [];
  if (e.base) {
    const pw = imageExacte({ ...e, k: 1 });
    lignes.push(ligne(`f(${n(e.x0)})=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${puissanceL(e, n(e.x0))}`, "on remplace x"));
    if (e.x0 < 0) lignes.push(ligne(`=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${puissanceL({ ...e, base: rat(e.base.den, e.base.num) }, String(-e.x0))}`, [f("a^{-n}=\\left(\\dfrac{1}{a}\\right)^{n}")]));
    if (e.k !== 1) lignes.push(ligne(`=${n(e.k)}\\cdot ${ratL(pw)}`));
    lignes.push(ligne(`=${ratL(imageExacte(e))}`));
  } else {
    const p = e.m * e.x0;
    lignes.push(ligne(`f(${n(e.x0)})=${e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}`}e^{${e.m === 1 ? "" : `${n(e.m)}\\cdot `}${par(n(e.x0))}}`, "on remplace x"));
    lignes.push(ligne(`=${imageL(e)}`, "on calcule l'exposant"));
    lignes.push(ligne(`\\approx ${approx(image(e))}`, [t("touche "), f("e^{x}"), t(" de la calculatrice")]));
    void p;
  }
  return [
    utilise(sq, [t("On remplace "), f("x"), t(" par "), f(`x_0=${n(e.x0)}`), t(" dans "), f(`f(x)=${expressionL(e)}`), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "image")),
    piege(sq, e.base ? [t("Calculer "), f("a\\cdot x_0"), t(" au lieu de "), f("a^{x_0}"), t(".")] : [t("Oublier le coefficient "), f("m"), t(" dans l'exposant.")]),
  ];
}

function etapePente(e: E): EtapeCorrection[] {
  const sq = "b";
  if (e.variante === "en-zero") {
    return [
      utilise(sq, [t("Dérivée d'une exponentielle "), t(COURS), t(" : "), f("(a^{x})'=\\ln a\\cdot a^{x}"), t(" ; en "), f("x=0"), t(", "), f("a^{0}=1"), t(".")]),
      calcul(sq, [
        ligne(`f'(x)=${lnL(e)}\\cdot ${puissanceL(e, "x")}`),
        ligne(`f'(0)=${lnL(e)}\\cdot ${puissanceL(e, "0")}`, "on remplace x par 0"),
        ligne(`=${lnL(e)}`, [f("a^{0}=1")]),
        ligne(`\\approx ${approx(pente(e))}`, "touche ln de la calculatrice"),
      ]),
      resultat(sq, reponse(e, "pente")),
      verification(sq, [t("Le signe est celui trouvé en a).")]),
      piege(sq, [t("Donner "), f("a"), t(" ou 1 comme pente, ou le logarithme décimal (touche log).")]),
    ];
  }
  if (e.base) {
    const coef = coefPente(e);
    const pw = imageExacte({ ...e, k: 1 });
    const lignes: LigneCalcul[] = [
      ligne(`f'(x)=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${lnL(e)}\\cdot ${puissanceL(e, "x")}`, [f("(a^{x})'=\\ln a\\cdot a^{x}")]),
      ligne(`f'(${n(e.x0)})=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${lnL(e)}\\cdot ${puissanceL(e, n(e.x0))}`, "on remplace x"),
      ligne(`=${e.k === 1 ? "" : `${n(e.k)}\\cdot `}${lnL(e)}\\cdot ${ratL(pw)}`),
    ];
    if (!(e.k === 1 && coef.num === pw.num && coef.den === pw.den && pw.den !== 1)) lignes.push(ligne(`=${penteL(e)}`));
    lignes.push(ligne(`\\approx ${approx(pente(e))}`, "touche ln de la calculatrice, sans arrondi intermédiaire"));
    return [
      utilise(sq, [t("La pente de la tangente est "), f("f'(x_0)"), t(" ; dérivée d'une exponentielle "), t(COURS), t(" : "), f("(a^{x})'=\\ln a\\cdot a^{x}"), t(".")]),
      calcul(sq, lignes),
      resultat(sq, reponse(e, "pente")),
      piege(sq, [t("Oublier le facteur "), f("\\ln a"), t(", ou dériver "), f("a^{x}"), t(" comme une puissance de "), f("x"), t(".")]),
    ];
  }
  const p = e.m * e.x0;
  return [
    utilise(sq, [t("Base "), f("e"), t(" : "), f("\\ln e=1"), t(", la règle de la chaîne suffit "), t(COURS), t(" : "), f("(e^{u})'=u'\\cdot e^{u}"), t(".")]),
    calcul(sq, [
      ligne(`f'(x)=${n(e.k)}\\cdot ${par(n(e.m))}\\cdot e^{${e.m === 1 ? "x" : e.m === -1 ? "-x" : `${e.m}x`}}`, [f(`u=${e.m === 1 ? "x" : e.m === -1 ? "-x" : `${e.m}x`}`), t(", "), f(`u'=${e.m}`)]),
      ligne(`f'(${n(e.x0)})=${n(e.k)}\\cdot ${par(n(e.m))}\\cdot ${eL(p)}`, "on remplace x"),
      ligne(`=${penteL(e)}`),
      ligne(`\\approx ${approx(pente(e))}`, [t("touche "), f("e^{x}"), t(" de la calculatrice")]),
    ]),
    resultat(sq, reponse(e, "pente")),
    piege(sq, [t("Oublier le facteur "), f(`u'=${e.m}`), t(" de la règle de la chaîne.")]),
  ];
}

/** Ordonnée à l'origine exacte de la tangente : f(x₀) − f′(x₀)·x₀. */
function ordonneeExacteL(e: E): string {
  if (e.base) {
    const c = ratMul(coefPente(e), rat(-e.x0));
    const lnTerme = c.num === c.den ? `+${lnL(e)}` : c.num === -c.den ? `-${lnL(e)}` : `${c.num > 0 ? "+" : ""}${ratL(c)}${lnL(e)}`;
    return `${imageL(e)}${lnTerme}`;
  }
  const c = rat(e.k * (1 - e.m * e.x0));
  if (c.num === 0) return "0";
  return `${c.num === 1 ? "" : c.num === -1 ? "-" : String(c.num)}${eL(e.m * e.x0)}`;
}

function etapeTangente(e: E): EtapeCorrection[] {
  const sq = "c";
  const lignes: LigneCalcul[] =
    e.variante === "en-zero"
      ? [
          ligne(`y=f'(0)\\,(x-0)+f(0)`, "équation de la tangente en x₀ = 0"),
          ligne(`f(0)=${puissanceL(e, "0")}=1`, [f("a^{0}=1")]),
          ligne(tangenteL(e), "on remplace f′(0) et f(0)"),
          ligne(tangenteApproxL(e), "coefficient arrondi au centième"),
        ]
      : [
          ligne(`y=f'(x_0)\\,(x-x_0)+f(x_0)`, "équation de la tangente"),
          ligne(tangenteL(e), [t("on remplace : "), f(`f(${n(e.x0)})=${imageL(e)}`), t(", "), f(`f'(${n(e.x0)})=${penteL(e)}`)]),
          ligne(`y=${penteL(e) === "" ? "" : penteL(e)}\\,x${ordonneeExacteL(e) === "0" ? "" : ordonneeExacteL(e).startsWith("-") ? ordonneeExacteL(e) : `+${ordonneeExacteL(e)}`}`, "on distribue"),
          ligne(tangenteApproxL(e), "coefficients arrondis au centième"),
        ];
  const verifs: LigneCalcul[] = e.variante === "en-zero" ? [ligne(`y(0)=1`, "la tangente passe par (0 ; 1)")] : [ligne(`y(${n(e.x0)})=${imageL(e)}=f(${n(e.x0)})`, "en x₀, le facteur (x − x₀) s'annule")];
  void ordonneeOrigine;
  return [
    utilise(sq, [t("Tangente au point d'abscisse "), f("x_0"), t(" : "), f("y=f'(x_0)\\,(x-x_0)+f(x_0)"), t(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "tangente")),
    verification(sq, [t("La tangente passe bien par le point de contact :")], verifs),
    piege(sq, e.variante === "en-zero" ? [t("Prendre "), f("a"), t(" comme pente, ou oublier l'ordonnée à l'origine 1.")] : [t("Garder "), f("f(x_0)"), t(" comme ordonnée à l'origine sans développer, ou écrire "), f("x+x_0"), t(".")]),
  ];
}

export function correctionDetailleeTangenteExpo(e: E): EtapeCorrection[] {
  const premiere = phases(e)[0] === "signe" ? etapeSigne(e) : etapeImage(e);
  return [...premiere, ...etapePente(e), ...etapeTangente(e)];
}
