import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceOptimisationDistance } from "../../core5e/optimisationDistance";
import { modele, racineKxL, tempsSauveteur, VITESSES } from "../../core5e/optimisationDistance";
import { exacte, exacteL, extraire, plusL } from "../../ui5e/ecrituresLimitesLotG";
import { nbL, q, qL } from "../../ui5e/nombresTrigo";
import { reponse } from "../../ui5e/formatOptimisationDistance";

/**
 * Corrigé détaillé « comme au tableau » de `5gen71`, une lettre par écran : a) le modèle (Pythagore,
 * durée = distance ÷ vitesse, carré de la distance) ; b) la dérivée (règle de la chaîne, une règle
 * par ligne) ; c) le zéro de la dérivée (une transformation par ligne, solution rejetée si x ≤ 0) ;
 * d) le signe de la dérivée sur le DOMAINE (x₀ dedans ou dehors, valeurs aux bornes) ; e) l'optimum
 * et sa valeur, puis la comparaison aux bornes (vérification). Même source que l'écran (`modele`).
 */

type E = ExerciceOptimisationDistance;
const t = texte;
const f = latex;
const d4 = (x: number) => nbL(x, 4);
function etapeModele(e: E): EtapeCorrection[] {
  const d = e.d;
  const m = modele(e);
  let L: LigneCalcul[];
  let u: ReturnType<typeof t>[];
  switch (e.variante) {
    case "pointRacine":
      u = [t("Distance de deux points (Pythagore) ; on minimise "), f("AM^2"), t(" : même point optimal que AM, sans racine à dériver (cours, § 8).")];
      L = [ligne(`AM^2=(x${plusL(-d.a)})^2+\\left(${racineKxL(d.k)}-0\\right)^2`, [t("coordonnées de M et de A")]), ligne(`D(x)=${m.fL}`, [f(`\\left(${racineKxL(d.k)}\\right)^2=${d.k === 1 ? "" : d.k}x`)])];
      break;
    case "pointHyperbole":
      u = [t("Distance de deux points (Pythagore) ; on minimise "), f("OM^2"), t(" : même point optimal que OM, sans racine à dériver (cours, § 8).")];
      L = [ligne(`OM^2=(x-0)^2+\\left(\\dfrac{${d.k}}{x}-0\\right)^2`, "coordonnées de M et de O"), ligne(`D(x)=${m.fL}`, "on élève la fraction au carré")];
      break;
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      u = [t("Durée = distance ÷ vitesse ; MN par Pythagore dans le triangle MHN rectangle en H (cours, § 8 : une seule variable, x).")];
      L = [
        ligne(`MH=${d.L}-x`, "M est sur [AH]"),
        ligne(`MN=\\sqrt{(${d.L}-x)^2+${d.h}^2}`, "Pythagore dans MHN"),
        ligne(`T(x)=\\dfrac{AM}{${d4(V.v1)}}+\\dfrac{MN}{${d4(V.v2)}}`, "course, puis nage"),
        ligne(`T(x)=${m.fL}`, "on remplace AM et MN"),
      ];
      break;
    }
    case "cable":
      u = [t("Chaque morceau du câble est l'hypoténuse d'un triangle rectangle (Pythagore) ; une seule variable, x (cours, § 8).")];
      L = [ligne(`AM=\\sqrt{x^2+${d.a}^2}`, "Pythagore dans AHM"), ligne(`MB=\\sqrt{(${d.L}-x)^2+${d.b}^2}`, "Pythagore dans MKB, MK = HK − x"), ligne(`\\ell(x)=${m.fL}`, "ℓ(x) = AM + MB")];
      break;
  }
  const pg =
    e.variante === "sauveteur"
      ? [t("Multiplier par la vitesse au lieu de diviser, ou échanger les deux vitesses.")]
      : e.variante === "cable"
        ? [t("Associer x à la mauvaise maison : HM = x est du côté de A.")]
        : [t("Garder la racine (minimiser AM au lieu de AM²) ou oublier d'élever l'ordonnée au carré.")];
  return [utilise("a", u), calcul("a", L), resultat("a", reponse(e, "modele")), piege("a", pg)];
}

function etapeDerivee(e: E): EtapeCorrection[] {
  const d = e.d;
  const m = modele(e);
  let L: LigneCalcul[];
  let u: ReturnType<typeof t>[];
  switch (e.variante) {
    case "pointRacine":
      u = [t("Dérivée terme à terme (cours, § 3).")];
      L = [ligne(`D'(x)=2(x${plusL(-d.a)})+${d.k}`, [f("\\left((x-a)^2\\right)'=2(x-a)")]), ligne(`=${m.fpL}`, "on développe et on réduit")];
      break;
    case "pointHyperbole":
      u = [t("Dérivée terme à terme, avec "), f("\\left(\\dfrac{1}{x^2}\\right)'=-\\dfrac{2}{x^3}"), t(" (cours, § 3).")];
      L = [ligne(`D'(x)=2x+${d.k * d.k}\\cdot\\left(-\\dfrac{2}{x^3}\\right)`, "constante en facteur"), ligne(`=${m.fpL}`, "on réduit")];
      break;
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      u = [t("Règle de la chaîne pour la racine : "), f("\\left(\\sqrt{v}\\right)'=\\dfrac{v'}{2\\sqrt{v}}"), t(" (cours, § 3).")];
      L = [
        ligne(`v=(${d.L}-x)^2+${d.h}^2`, "sous la racine"),
        ligne(`v'=-2(${d.L}-x)`, [t("dérivée de "), f(`(${d.L}-x)^2`), t(" : facteur −1")]),
        ligne(`T'(x)=\\dfrac{1}{${d4(V.v1)}}+\\dfrac{1}{${d4(V.v2)}}\\cdot\\dfrac{-2(${d.L}-x)}{2\\sqrt{v}}`, "on dérive chaque terme"),
        ligne(`T'(x)=${m.fpL}`, "on simplifie par 2"),
      ];
      break;
    }
    case "cable":
      u = [t("Règle de la chaîne pour chaque racine : "), f("\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}"), t(" (cours, § 3).")];
      L = [
        ligne(`\\left(\\sqrt{x^2+${d.a}^2}\\right)'=\\dfrac{x}{\\sqrt{x^2+${d.a}^2}}`, [f("u'=2x")]),
        ligne(`\\left(\\sqrt{(${d.L}-x)^2+${d.b}^2}\\right)'=-\\dfrac{${d.L}-x}{\\sqrt{(${d.L}-x)^2+${d.b}^2}}`, [f(`u'=-2(${d.L}-x)`)]),
        ligne(`\\ell'(x)=${m.fpL}`, "somme des deux dérivées"),
      ];
      break;
  }
  const pg = e.variante === "pointRacine" ? [t("Oublier la dérivée du terme en x.")] : e.variante === "pointHyperbole" ? [t("Se tromper de signe ou de puissance : "), f("\\left(x^{-2}\\right)'=-2x^{-3}")] : [t("Oublier le facteur −1 de la dérivée de "), f("(L-x)^2"), t(" (règle de la chaîne).")];
  return [utilise("b", u), calcul("b", L), resultat("b", reponse(e, "derivee")), piege("b", pg)];
}

function etapeCritique(e: E): EtapeCorrection[] {
  const d = e.d;
  const m = modele(e);
  let L: LigneCalcul[];
  switch (e.variante) {
    case "pointRacine": {
      const num = 2 * d.a - d.k;
      const brut = `\\dfrac{${num}}{2}`;
      L = [ligne(`${m.fpL}=0`, "on annule la dérivée"), ligne(`2x=${num}`, `on isole 2x`), ligne(`x_0=${brut}${brut === m.x0L ? "" : `=${m.x0L}`}`, "on divise par 2")];
      break;
    }
    case "pointHyperbole":
      L = [
        ligne(`2x=\\dfrac{${2 * d.k * d.k}}{x^3}`, "on annule la dérivée"),
        ligne(`2x^4=${2 * d.k * d.k}`, [t("on multiplie par "), f("x^3\\neq 0")]),
        ligne(`x^4=${d.k * d.k}`, "on divise par 2"),
        ligne(`x^2=${d.k}`, [f(`x^2=-${d.k}`), t(" est impossible")]),
        ligne(`x_0=\\sqrt{${d.k}}${`\\sqrt{${d.k}}` === m.x0L ? "" : `=${m.x0L}`}`, [f("x>0"), t(" : on rejette "), f(`-\\sqrt{${d.k}}`)]),
      ];
      break;
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      const z = d.L - m.x0;
      L = [
        ligne(`\\dfrac{${d.L}-x}{${d4(V.v2)}\\sqrt{(${d.L}-x)^2+${d.h}^2}}=\\dfrac{1}{${d4(V.v1)}}`, "on annule la dérivée"),
        ligne(`${d4(V.v1)}\\,z=${d4(V.v2)}\\sqrt{z^2+${d.h}^2}`, [t("produit en croix, avec "), f(`z=${d.L}-x`), t(" (distance MH)")]),
        ligne(`${d4(V.v1 ** 2)}\\,z^2=${d4(V.v2 ** 2)}\\,(z^2+${d.h * d.h})`, "on élève au carré (z > 0)"),
        ligne(`${d4(V.w ** 2)}\\,z^2=${d4(V.v2 ** 2 * d.h * d.h)}`, [t("on regroupe les "), f("z^2")]),
        ligne(`z=\\dfrac{${d4(V.v2)}\\cdot ${d.h}}{${d4(V.w)}}=${z}`, [t("racine carrée, "), f("z>0")]),
        ligne(`x_0=${d.L}-${z}=${m.x0}`, [f(`x=${d.L}-z`)]),
      ];
      break;
    }
    case "cable": {
      const s = d.a + d.b;
      L = [
        ligne(`\\dfrac{x}{\\sqrt{x^2+${d.a}^2}}=\\dfrac{${d.L}-x}{\\sqrt{(${d.L}-x)^2+${d.b}^2}}`, "on annule la dérivée"),
        ligne(`x^2\\left((${d.L}-x)^2+${d.b}^2\\right)=(${d.L}-x)^2\\left(x^2+${d.a}^2\\right)`, "on élève au carré, produit en croix"),
        ligne(`${d.b * d.b}x^2=${d.a * d.a}(${d.L}-x)^2`, [t("les termes "), f(`x^2(${d.L}-x)^2`), t(" s'éliminent")]),
        ligne(`${d.b}x=${d.a}(${d.L}-x)`, [t("racines carrées : "), f("x\\geq 0"), t(" et "), f(`${d.L}-x\\geq 0`)]),
        ligne(`${s}x=${d.a * d.L}`, "on regroupe les x"),
        ligne(`x_0=\\dfrac{${d.a * d.L}}{${s}}=${m.x0}`, `on divise par ${s}`),
      ];
      break;
    }
  }
  const pg =
    e.variante === "pointHyperbole"
      ? [t("Garder la solution négative "), f(`-\\sqrt{${d.k}}`), t(" : elle sort du domaine.")]
      : e.variante === "sauveteur"
        ? [t("Donner z = MH pour la réponse : x = AM = L − z.")]
        : e.variante === "cable"
          ? [t("Échanger a et b : x = HM vérifie "), f("\\dfrac{x}{a}=\\dfrac{L-x}{b}"), t(".")]
          : [t("Se tromper de signe en isolant x.")];
  return [utilise("c", [t("Un extremum à l'intérieur du domaine annule la dérivée : on résout l'équation, une transformation par ligne (cours, § 5).")]), calcul("c", L), resultat("c", reponse(e, "critique")), piege("c", pg)];
}

function etapeSigne(e: E): EtapeCorrection[] {
  const d = e.d;
  const m = modele(e);
  const N = m.nomL;
  let L: LigneCalcul[];
  switch (e.variante) {
    case "pointRacine":
      L = m.dehors
        ? [ligne(`x_0=${m.x0L}<0`, "hors du domaine [0 ; +∞["), ligne(`D'(0)=${d.k - 2 * d.a}>0`, "et D′ croît (affine de pente 2)"), ligne("D'(x)>0", [t("pour tout "), f("x\\geq 0")])]
        : [ligne(`D'(x)=${m.fpL}`, "affine de pente 2 > 0 : croissante"), ligne("D'(x)<0", [t("pour "), f(`0\\leq x<${m.x0L}`)]), ligne("D'(x)>0", [t("pour "), f(`x>${m.x0L}`)])];
      break;
    case "pointHyperbole":
      L = [
        ligne(`D'(x)=\\dfrac{2\\left(x^4-${d.k * d.k}\\right)}{x^3}`, "même dénominateur"),
        ligne("x^3>0", [t("car x > 0 : D′ a le signe de "), f(`x^4-${d.k * d.k}`)]),
        ligne("D'(x)<0", [t("pour "), f(`0<x<${m.x0L}`)]),
        ligne("D'(x)>0", [t("pour "), f(`x>${m.x0L}`)]),
      ];
      break;
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      L = m.dehors
        ? [ligne(`x_0=${m.x0}<0`, `hors du domaine [0 ; ${d.L}]`), ligne(`T'(0)\\approx ${d4(m.fp(0))}>0`, "à la borne gauche"), ligne("T'(x)>0", [t("pour tout "), f(`x\\in[0\\,;${d.L}]`), t(" : T′ ne s'y annule pas")])]
        : [ligne(`T'(0)\\approx ${d4(m.fp(0))}<0`, "à la borne gauche"), ligne(`T'(${d.L})=\\dfrac{1}{${d4(V.v1)}}>0`, "à la borne droite (M = H)"), ligne(`T'(${m.x0})=0`, "seul zéro dans le domaine : signe constant de chaque côté")];
      break;
    }
    case "cable":
      L = [
        ligne(`\\ell'(0)=-\\dfrac{${d.L}}{\\sqrt{${d.L}^2+${d.b}^2}}<0`, "à la borne gauche"),
        ligne(`\\ell'(${d.L})=\\dfrac{${d.L}}{\\sqrt{${d.L}^2+${d.a}^2}}>0`, "à la borne droite"),
        ligne(`\\ell'(${m.x0})=0`, "seul zéro dans le domaine : signe constant de chaque côté"),
      ];
      break;
  }
  return [
    utilise("d", [t("On étudie le signe de "), f(`${N}'`), t(" sur le domaine réaliste "), f(m.domaineL), t(" : un zéro hors du domaine ne compte pas (cours, § 8).")]),
    calcul("d", L),
    resultat("d", reponse(e, "signe")),
    piege("d", [t("Conclure au minimum en "), f("x_0"), t(" sans vérifier que "), f("x_0"), t(" est dans le domaine ni que la dérivée y change de signe.")]),
  ];
}

function etapeOptimum(e: E): EtapeCorrection[] {
  const d = e.d;
  const m = modele(e);
  let L: LigneCalcul[];
  let verif: LigneCalcul[];
  switch (e.variante) {
    case "pointRacine": {
      if (m.dehors) {
        L = [ligne(`D(0)=(0${plusL(-d.a)})^2+0=${d.a * d.a}`, "borne x = 0 : M = O"), ligne(`AM=\\sqrt{${d.a * d.a}}=${m.valOptL}`, "la distance est la racine de D")];
        verif = [ligne(`D(x)>D(0)`, [t("pour tout "), f("x>0"), t(" : D est croissante sur le domaine")])];
      } else {
        const Dq = q(d.k * (4 * d.a - d.k), 4);
        const yM = extraire(2 * d.k * (2 * d.a - d.k));
        L = [
          ligne(`D\\left(${m.x0L}\\right)=\\left(${m.x0L}${plusL(-d.a)}\\right)^2+${d.k}\\cdot ${m.x0L}=${qL(Dq)}`, "on remplace x par x₀"),
          ligne(`AM=\\sqrt{${qL(Dq)}}=${m.valOptL}`, "la distance est la racine de D"),
          ligne(`y_M=\\sqrt{${d.k}\\cdot ${m.x0L}}=${exacteL(exacte(yM.c, 2, yM.r))}`, "ordonnée de M"),
        ];
        verif = [ligne(`D(0)=${d.a * d.a}>${qL(Dq)}`, "à la borne x = 0 : plus grand"), ligne("\\lim\\limits_{x\\to +\\infty}D(x)=+\\infty", "D décroît puis croît : minimum en x₀")];
      }
      break;
    }
    case "pointHyperbole":
      L = [ligne(`D\\left(${m.x0L}\\right)=${d.k}+${d.k}=${2 * d.k}`, [f(`x_0^2=${d.k}`), t(" et "), f(`\\dfrac{${d.k * d.k}}{x_0^2}=${d.k}`)]), ligne(`OM=\\sqrt{${2 * d.k}}${`\\sqrt{${2 * d.k}}` === m.valOptL ? "" : `=${m.valOptL}`}`, "la distance est la racine de D"), (d.k === 1 ? ligne("y_M=1", "ordonnée de M (1 ÷ 1)") : ligne(`y_M=\\dfrac{${d.k}}{${m.x0L}}=${m.x0L}`, "ordonnée de M"))];
      verif = [ligne("\\lim\\limits_{x\\to 0^{+}}D(x)=+\\infty", "près de 0"), ligne("\\lim\\limits_{x\\to +\\infty}D(x)=+\\infty", "en +∞ : le minimum est bien en x₀")];
      break;
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      if (m.dehors) {
        L = [ligne(`T(0)=\\dfrac{\\sqrt{${d.L}^2+${d.h}^2}}{${d4(V.v2)}}\\approx ${d4(tempsSauveteur(d, 0))}`, "il nage directement de A à N"), ligne(`T_{\\min}\\approx ${m.valOptL}`, "au dixième")];
        verif = [ligne(`T(${d.L})\\approx ${d4(tempsSauveteur(d, d.L))}`, "à l'autre borne : plus long (T croissante)")];
      } else {
        const MN = Math.round(Math.sqrt((d.L - m.x0) ** 2 + d.h ** 2));
        L = [
          ligne(`MN=\\sqrt{${d.L - m.x0}^2+${d.h}^2}=${MN}`, "Pythagore"),
          ligne(`T(${m.x0})=\\dfrac{${m.x0}}{${d4(V.v1)}}+\\dfrac{${MN}}{${d4(V.v2)}}\\approx ${d4(tempsSauveteur(d, m.x0))}`, "calculatrice"),
          ligne(`T_{\\min}\\approx ${m.valOptL}`, "au dixième"),
        ];
        verif = [ligne(`T(0)\\approx ${d4(tempsSauveteur(d, 0))}`, "nager tout de suite : plus long"), ligne(`T(${d.L})\\approx ${d4(tempsSauveteur(d, d.L))}`, "courir jusqu'en H : plus long")];
      }
      break;
    }
    case "cable": {
      const AM = Math.round(Math.sqrt(m.x0 ** 2 + d.a ** 2));
      const MB = Math.round(Math.sqrt((d.L - m.x0) ** 2 + d.b ** 2));
      L = [ligne(`AM=\\sqrt{${m.x0}^2+${d.a}^2}=${AM}`, "Pythagore"), ligne(`MB=\\sqrt{${d.L - m.x0}^2+${d.b}^2}=${MB}`, "Pythagore"), ligne(`\\ell(${m.x0})=${AM}+${MB}=${m.valOptL}`, "longueur du câble")];
      const l0 = Math.sqrt(d.L ** 2 + d.b ** 2) + d.a;
      const lL = Math.sqrt(d.L ** 2 + d.a ** 2) + d.b;
      verif = [ligne(`\\ell(0)=${d.a}+\\sqrt{${d.L}^2+${d.b}^2}\\approx ${d4(l0)}`, "M en H : plus long"), ligne(`\\ell(${d.L})=\\sqrt{${d.L}^2+${d.a}^2}+${d.b}\\approx ${d4(lL)}`, "M en K : plus long")];
      break;
    }
  }
  const pg =
    e.variante === "sauveteur"
      ? [t("Arrondir trop tôt (x₀ ou MN) : on garde les valeurs exactes, on arrondit le temps à la fin.")]
      : e.variante === "cable"
        ? [t("Oublier de comparer aux bornes : ici ℓ(0) et ℓ(L) sont plus grands.")]
        : [t("Donner la valeur de D (le carré de la distance) pour la distance.")];
  return [
    utilise("e", [t("Le minimum est atteint là où la dérivée passe de − à + dans le domaine, sinon à une borne ; on calcule la valeur minimale puis on la compare aux bornes (cours, § 8).")]),
    calcul("e", L),
    resultat("e", reponse(e, "optimum")),
    verification("e", [t("Comparaison avec les bornes du domaine :")], verif),
    piege("e", pg),
  ];
}

export function correctionDetailleeOptimisationDistance(e: E): EtapeCorrection[] {
  return [...etapeModele(e), ...etapeDerivee(e), ...etapeCritique(e), ...etapeSigne(e), ...etapeOptimum(e)];
}
