import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { decomposer, decompositionL, pgcd } from "../communReels/outilsReels";
import { lignesDecomposition } from "../communReels/corrigeReels";
import type { ExerciceDecimale } from "./core/types";
import { decaleL, difference, fracL, puissanceX, reponse, xL } from "./ui/format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen16`, une lettre par écran. diviser : division posée
 * (une ligne par chiffre : reste × 10 = chiffre × n + nouveau reste), période, borne par les restes ;
 * versFraction : multiples de x écrits en décalant la virgule, différence, fraction simplifiée ;
 * critere : simplification, décomposition du dénominateur, critère des facteurs 2 et 5 (vérifié par
 * la division ou par un dénominateur 10ᵏ).
 */

type E = ExerciceDecimale;
const t = texte;
const f = latex;
const COURS = "(cours, étape 2)";

function corrigeDiviser(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [ligne(`${e.num}=${e.dev.entier}\\cdot ${e.den}+${Math.abs(e.num) - e.dev.entier * e.den}`, `partie entière ${e.dev.entier}`)];
  e.lignesDivision.forEach((l) => L.push(ligne(`${l.dividende}=${l.chiffre}\\cdot ${e.den}+${l.reste}`, `chiffre ${l.chiffre}, reste ${l.reste}`)));
  const k = e.dev.avant.length;
  return [
    utilise("a", [t(`Division posée : on multiplie chaque reste par 10 et on le divise par ${e.den} ; dès qu'un reste revient, les mêmes chiffres recommencent ${COURS}.`)]),
    calcul("a", L, [t("Chaque ligne donne un chiffre après la virgule et le reste suivant :")]),
    resultat("a", reponse(e, "ecriture")),
    piege("a", [t("Arrêter la division et donner une valeur approchée sans repérer la période.")]),

    utilise("b", [t("La période est le bloc de chiffres le plus court qui se répète.")]),
    calcul("b", [ligne(`${fracL(e.num, e.den)}=${xL(e)}`, `le reste ${e.resteRepete} revient après ${k + e.dev.periode.length} chiffre${k + e.dev.periode.length > 1 ? "s" : ""}`), ligne(`\\text{période}=${e.dev.periode}`, `${k} chiffre${k > 1 ? "s" : ""} avant la période`)]),
    resultat("b", reponse(e, "longueur")),
    piege("b", [t("Compter dans la période les chiffres qui la précèdent.")]),

    utilise("c", [t(`Dans une division par ${e.den}, les restes sont des naturels plus petits que ${e.den} ; un reste nul arrêterait la division ${COURS}.`)]),
    calcul("c", [ligne(`\\text{restes possibles}\\in\\{1\\,;2\\,;\\ldots\\,;${e.den - 1}\\}`, "le reste 0 est exclu"), ligne(`${e.dev.periode.length}\\leq ${e.den - 1}`, "la période observée respecte la borne")]),
    resultat("c", reponse(e, "borne")),
    piege("c", [t("Compter le reste 0 : il terminerait l'écriture, qui serait alors limitée.")]),
  ];
}

function corrigeVersFraction(e: E): EtapeCorrection[] {
  const a = e.k + e.p;
  const b = e.k;
  const D = difference(e);
  const denBrut = 10 ** a - 10 ** b;
  const g = pgcd(D, denBrut);
  const lignesC: LigneCalcul[] = [ligne(`x=\\dfrac{${D}}{${denBrut}}`, `on divise par ${denBrut}`)];
  if (g > 1) lignesC.push(ligne(`=${fracL(e.num, e.den)}`, `on simplifie par ${g}`));
  const etapes: EtapeCorrection[] = [
    utilise("a", [t(`Avec k chiffres avant la période et p dans la période, 10ᵏ⁺ᵖx et 10ᵏx ont la même partie après la virgule ${COURS}. Ici k = ${e.k} et p = ${e.p}.`)]),
    calcul("a", [ligne(`${puissanceX(a)}=${decaleL(e, a)}`, `virgule décalée de ${a} rang${a > 1 ? "s" : ""}`), ...(b > 0 ? [ligne(`${puissanceX(b)}=${decaleL(e, b)}`, `virgule décalée de ${b} rang${b > 1 ? "s" : ""}`)] : [ligne(`x=${xL(e)}`, "même partie après la virgule")])]),
    resultat("a", reponse(e, "puissances")),
    piege("a", [t("Décaler d'une période seulement (10ᵖx − x) alors que des chiffres précèdent la période : les parties après la virgule ne sont pas les mêmes.")]),

    utilise("b", [t("Les parties après la virgule sont identiques : elles s'éliminent dans la différence.")]),
    calcul("b", [ligne(`${puissanceX(a)}-${puissanceX(b)}=${decaleL(e, a)}-${b > 0 ? decaleL(e, b) : xL(e)}`), ligne(`=${D}`, "les périodes s'éliminent")]),
    resultat("b", reponse(e, "difference")),
    piege("b", [t("Soustraire en gardant les périodes : elles s'annulent exactement.")]),

    utilise("c", [t(`${puissanceX(a)} − ${puissanceX(b)} = (${10 ** a} − ${10 ** b})x = ${denBrut}x ; on divise, puis on simplifie par le PGCD.`)]),
    calcul("c", [ligne(`${denBrut}x=${D}`, `${10 ** a} − ${10 ** b} = ${denBrut}`), ...lignesC]),
    resultat("c", reponse(e, "fraction")),
  ];
  if (e.neuf) {
    etapes.push(verification("c", [t("Le dénominateur ne contient que des 2 et des 5 : x est un décimal limité, la même valeur que l'écriture périodique.")], [ligne(`${xL(e)}=${valeurL(e)}`, "deux écritures du même nombre")]));
    etapes.push(piege("c", [t("Croire que "), f(xL(e)), t(" est un peu plus petit que "), f(valeurL(e)), t(" : ce sont deux écritures du même nombre.")]));
  } else {
    etapes.push(verification("c", [t("En posant la division :")], [ligne(`${fracL(e.num, e.den)}=${xL(e)}`)]));
    etapes.push(piege("c", [t("Diviser par une puissance de 10 au lieu de "), f(`${10 ** a}-${10 ** b}`), t(".")]));
  }
  return etapes;
}

/** Écriture décimale limitée de num/den (dénominateur 2ᵃ5ᵇ). */
function valeurL(e: E): string {
  let d = 1;
  while ((10 ** d) % e.den !== 0) d++;
  const n = (e.num * 10 ** d) / e.den;
  const s = `${n}`.padStart(d + 1, "0");
  return `${s.slice(0, -d)}{,}${s.slice(-d)}`.replace(/\{,\}(\d*?)0+$/, "{,}$1").replace(/\{,\}$/, "");
}

function corrigeCritere(e: E): EtapeCorrection[] {
  const g = e.g;
  const etapes: EtapeCorrection[] = [
    utilise("a", [t(`Le critère porte sur le dénominateur d'une fraction irréductible : on simplifie d'abord ${COURS}.`)]),
    calcul("a", [ligne(`${fracL(e.numDonne, e.denDonne)}=\\dfrac{${e.num}\\cdot ${g}}{${e.den}\\cdot ${g}}`, `facteur commun ${g}`), ligne(`=${fracL(e.num, e.den)}`, `on simplifie par ${g}`)]),
    resultat("a", reponse(e, "simplifier")),
    piege("a", [t("Juger sur le dénominateur "), f(`${e.denDonne}`), t(" de la fraction donnée, qui n'est pas irréductible.")]),

    utilise("b", [t("Divisions successives par 2, 3, 5, 7…")]),
    calcul("b", e.den > 1 && decomposer(e.den).reduce((s, [, x]) => s + x, 0) > 1 ? lignesDecomposition(e.den) : [ligne(`${e.den}=${e.den}`, `${e.den} est premier`)]),
    resultat("b", reponse(e, "denominateur")),
    piege("b", [t("Oublier un facteur premier dans la décomposition.")]),
  ];
  const decomp = decompositionL(decomposer(e.den));
  if (e.verdict === "limitee") {
    let d = 1;
    while ((10 ** d) % e.den !== 0) d++;
    const m = 10 ** d / e.den;
    etapes.push(
      utilise("c", [t(`Une fraction irréductible a une écriture limitée si et seulement si son dénominateur ne contient que les facteurs premiers 2 et 5 ${COURS}.`)]),
      calcul("c", [ligne(`${e.den}=${decomp}`, "seulement des 2 et des 5"), ligne(`${fracL(e.num, e.den)}=\\dfrac{${e.num}\\cdot ${m}}{${e.den}\\cdot ${m}}`, `on complète le dénominateur en ${10 ** d}`), ligne(`=\\dfrac{${e.num * m}}{${10 ** d}}`), ligne(`=${valeurL(e)}`)]),
      resultat("c", reponse(e, "verdict")),
      piege("c", [t("Conclure « périodique » à cause d'un facteur du dénominateur donné qui disparaît en simplifiant.")]),
    );
  } else {
    const autre = decomposer(e.den).find(([p]) => p !== 2 && p !== 5)![0];
    etapes.push(
      utilise("c", [t(`Une fraction irréductible dont le dénominateur contient un facteur premier autre que 2 et 5 a une écriture illimitée périodique ${COURS}.`)]),
      calcul("c", [ligne(`${e.den}=${decomp}`, `le facteur ${autre} n'est ni 2 ni 5`), ligne(`${fracL(e.num, e.den)}=${xL(e)}`, "vérification par la division")]),
      resultat("c", reponse(e, "verdict")),
      piege("c", [t("Répondre « illimitée non périodique » : c'est l'écriture des irrationnels, jamais celle d'une fraction.")]),
    );
  }
  return etapes;
}

export function correctionDetailleeDecimale(e: E): EtapeCorrection[] {
  if (e.variante === "diviser") return corrigeDiviser(e);
  if (e.variante === "versFraction") return corrigeVersFraction(e);
  return corrigeCritere(e);
}
