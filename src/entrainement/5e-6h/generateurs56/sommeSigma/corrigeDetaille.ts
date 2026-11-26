import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceSigma } from "./index";
import { nombreTermes, partieGeo, sommeDe, termesDe, totalMixte, valeurTerme } from "./index";
import { affineL, COURS_GEO, COURS_SIGMA, geoL, nouveauTermeL, parL, reponse, sigmaL, sommeNL, termeAvecL, termeL, termeSousSigmaL, uL } from "./ui/formatSigma";

/**
 * Corrigé détaillé « comme au tableau » de `56gen21` (cours, étapes 7 et 8), une lettre par écran.
 * Sommes arithmétiques par la double échelle (S = N(premier + dernier)/2), géométriques par
 * S = premier·(1 − q^N)/(1 − q) ; linéarité pour séparer les parties ; changement d'indice j = i − k + 1.
 */

type E = ExerciceSigma;
const t = texte;
const f = latex;

/** Lignes de la somme de N termes d'une suite arithmétique (premier p, dernier d). */
function lignesArith(N: number, p: number, d: number, nom = "S"): LigneCalcul[] {
  return [
    ligne(`${nom}=\\dfrac{${N}\\cdot(${p}+${parL(d)})}{2}`, "nombre de termes × (premier + dernier) ÷ 2"),
    ligne(`=\\dfrac{${N}\\cdot ${parL(p + d)}}{2}`, "on additionne"),
    ligne(`=${(N * (p + d)) / 2}`, "on calcule"),
  ];
}

/** Lignes de la somme de N termes d'une suite géométrique (premier p, raison q). */
function lignesGeo(N: number, p: number, q: number, nom = "S"): LigneCalcul[] {
  const qN = q ** N;
  const S = (p * (1 - qN)) / (1 - q);
  return [
    ligne(`${nom}=${p}\\cdot\\dfrac{1-${parL(q)}^{${N}}}{1-${parL(q)}}`, "somme géométrique : premier terme, raison, nombre de termes"),
    ligne(`=${p}\\cdot\\dfrac{1-${parL(qN)}}{${1 - q}}`, "on calcule la puissance"),
    ligne(`=${p}\\cdot\\dfrac{${1 - qN}}{${1 - q}}`, "on calcule"),
    ligne(`=${S}`, "on simplifie"),
  ];
}

function etapesValeur(e: E, sq: string): EtapeCorrection[] {
  const tt = termesDe(e);
  const N = nombreTermes(e);
  if (e.terme.kind === "arith") {
    return [
      utilise(sq, [t(`Les termes forment une suite arithmétique de raison ${e.terme.a < 0 ? "−" : ""}${Math.abs(e.terme.a)} : on additionne la double échelle ${COURS_SIGMA}, `), f("S=\\dfrac{N(\\text{premier}+\\text{dernier})}{2}"), t(".")]),
      calcul(sq, lignesArith(N, tt[0], tt[tt.length - 1])),
      resultat(sq, reponse(e, "valeur")),
      piege(sq, [t("Se tromper d'une unité sur le nombre de termes, ou oublier de diviser par 2.")]),
    ];
  }
  if (e.terme.kind === "geo") {
    return [
      utilise(sq, [t(`Les termes forment une suite géométrique de raison ${e.terme.q < 0 ? "−" : ""}${Math.abs(e.terme.q)} ${COURS_GEO} : `), f("S=\\text{premier}\\cdot\\dfrac{1-q^{N}}{1-q}"), t(".")]),
      calcul(sq, lignesGeo(N, tt[0], e.terme.q)),
      resultat(sq, reponse(e, "valeur")),
      piege(sq, [t("Mettre en exposant le dernier indice au lieu du nombre de termes, ou partir de "), f("q^0"), t(" quand la somme commence plus loin.")]),
    ];
  }
  // développer : on additionne les termes un à un
  return [
    utilise(sq, [t("Les termes ne forment ni une suite arithmétique ni une suite géométrique : on les additionne un à un.")]),
    calcul(sq, [ligne(`S=${tt.map((x, i) => (i === 0 ? `${x}` : parL(x))).join("+")}`, "les termes de l'étape précédente"), ligne(`=${sommeDe(e)}`, "on additionne")]),
    resultat(sq, reponse(e, "valeur")),
    piege(sq, [t("Oublier un terme ou se tromper de signe sur un terme négatif.")]),
  ];
}

function corrigeEcrire(e: E): EtapeCorrection[] {
  const tt = termesDe(e);
  const n = e.m;
  const p = tt[0];
  const d = tt[tt.length - 1];
  if (e.terme.kind === "arith") {
    const r = e.terme.a;
    return [
      utilise("a", [t(`Suite arithmétique : `), f("u_i=u_1+(i-1)\\,r"), t(` ${COURS_SIGMA}.`)]),
      calcul("a", [ligne(`r=${tt[1]}-${parL(p)}=${r}`, "différence de deux termes consécutifs"), ligne(`u_i=${p}+(i-1)\\cdot ${parL(r)}`, "on remplace"), ligne(`=${termeL(e.terme)}`, "on distribue et on réduit")]),
      resultat("a", reponse(e, "terme")),
      verification("a", [t("Pour "), f("i=3"), t(" : "), f(`${termeAvecL(e.terme, 3)}=${tt[2]}`), t(", le troisième terme.")]),
      piege("a", [t("Écrire "), f("u_1+i\\,r"), t(" : on compte "), f("i-1"), t(" pas depuis le premier terme.")]),
      utilise("b", [t("Le dernier terme est "), f("u_n"), t(" : on résout "), f(`u_n=${d}`), t(".")]),
      calcul("b", [ligne(`${termeL(e.terme, "n")}=${d}`, "terme de rang n"), ligne(`${r === 1 ? "" : r === -1 ? "-" : r}n=${d - e.terme.b}`, "on isole le terme en n"), ligne(`n=${n}`, [t("on divise par "), f(`${r}`)])]),
      resultat("b", reponse(e, "borne")),
      piege("b", [t("Donner le nombre de pas ("), f(`${n - 1}`), t(") au lieu du nombre de termes.")]),
      ...etapesValeur(e, "c"),
    ];
  }
  const g = e.terme as { kind: "geo"; c: number; q: number };
  const q = g.q;
  return [
    utilise("a", [t("Suite géométrique : "), f("u_i=u_1\\cdot q^{\\,i-1}"), t(` ${COURS_GEO}.`)]),
    calcul("a", [ligne(`q=\\dfrac{${tt[1]}}{${p}}=${q}`, "quotient de deux termes consécutifs"), ligne(`u_i=${termeL(e.terme)}`, "on remplace")]),
    resultat("a", reponse(e, "terme")),
    verification("a", [t("Pour "), f("i=3"), t(" : "), f(`${termeAvecL(e.terme, 3)}=${tt[2]}`), t(".")]),
    piege("a", [t("Mettre "), f("q^{\\,i}"), t(" : au rang 1, on doit retrouver le premier terme ("), f("q^0=1"), t(").")]),
    utilise("b", [t("Le dernier terme est "), f("u_n"), t(" : on résout "), f(`u_n=${d}`), t(".")]),
    calcul("b", [
      ligne(`${termeL(e.terme, "n")}=${d}`, "terme de rang n"),
      ...(p === 1 ? [] : [ligne(`${parL(q)}^{n-1}=${d / p}`, [t("on divise par "), f(`${p}`)])]),
      ligne(`${parL(q)}^{n-1}=${parL(q)}^{${n - 1}}`, [t("car "), f(`${parL(q)}^{${n - 1}}=${d / p}`)]),
      ligne(`n-1=${n - 1}`, "mêmes exposants"),
      ligne(`n=${n}`, "on ajoute 1"),
    ]),
    resultat("b", reponse(e, "borne")),
    piege("b", [t("Donner l'exposant "), f(`${n - 1}`), t(" au lieu du nombre de termes.")]),
    ...etapesValeur(e, "c"),
  ];
}

function corrigeDevelopper(e: E): EtapeCorrection[] {
  const tt = termesDe(e);
  const N = nombreTermes(e);
  return [
    utilise("a", [t("De "), f(`i=${e.k}`), t(" à "), f(`i=${e.m}`), t(", on compte les deux bornes : "), f("m-k+1"), t(` termes ${COURS_SIGMA}.`)]),
    calcul("a", [ligne(`${e.m}-${e.k}+1=${N}`, "bornes comprises")]),
    resultat("a", reponse(e, "nbTermes")),
    piege("a", [t("Calculer "), f(`${e.m}-${e.k}=${e.m - e.k}`), t(" en oubliant une borne.")]),
    utilise("b", [t("On remplace i par la borne inférieure, puis par la borne supérieure.")]),
    calcul("b", [ligne(`${uL(e.k)}=${termeAvecL(e.terme, e.k)}=${tt[0]}`, `i = ${e.k}`), ligne(`${uL(e.m)}=${termeAvecL(e.terme, e.m)}=${tt[tt.length - 1]}`, `i = ${e.m}`)]),
    resultat("b", reponse(e, "extremes")),
    piege("b", [t("Commencer à "), f("i=1"), t(" alors que la somme commence à "), f(`i=${e.k}`), t(".")]),
    utilise("c", [t("On écrit tous les termes (développer la somme), puis on les additionne.")]),
    calcul("c", [
      ligne(`S=${Array.from({ length: N }, (_, j) => `(${termeAvecL(e.terme, e.k + j)})`).join("+")}`, "i prend chaque valeur entière"),
      ligne(`=${tt.map((x, i) => (i === 0 ? `${x}` : parL(x))).join("+")}`, "on calcule chaque terme"),
      ligne(`=${sommeDe(e)}`, "on additionne"),
    ]),
    resultat("c", reponse(e, "valeur")),
    piege("c", [t("Oublier un terme, ou un signe « − » devant un terme négatif.")]),
  ];
}

function corrigeUneSuite(e: E): EtapeCorrection[] {
  const tt = termesDe(e);
  const N = nombreTermes(e);
  const arith = e.terme.kind === "arith";
  const etapeA: EtapeCorrection[] = arith
    ? [
        utilise("a", [t("On compare deux termes consécutifs : une différence constante caractérise une suite arithmétique.")]),
        calcul("a", [ligne(`${uL("i+1")}-${uL("i")}=${termeL(e.terme, "(i+1)")}-\\left(${termeL(e.terme)}\\right)`, "terme suivant moins terme"), ligne(`=${(e.terme as { a: number }).a}`, "on réduit : constante")]),
        resultat("a", reponse(e, "nature")),
        piege("a", [t("Conclure avec seulement deux ou trois termes calculés : il faut une différence constante pour tout i.")]),
      ]
    : [
        utilise("a", [t("On compare deux termes consécutifs : un quotient constant caractérise une suite géométrique.")]),
        calcul("a", [ligne(`\\dfrac{${uL("i+1")}}{${uL("i")}}=\\dfrac{${geoL((e.terme as { c: number }).c, (e.terme as { q: number }).q, "i+1")}}{${geoL((e.terme as { c: number }).c, (e.terme as { q: number }).q, "i")}}`, "terme suivant sur terme"), ligne(`=${(e.terme as { q: number }).q}`, "on simplifie : constante")]),
        resultat("a", reponse(e, "nature")),
        piege("a", [t("Calculer une différence : pour une suite géométrique, c'est le quotient qui est constant.")]),
      ];
  const lignesB: LigneCalcul[] = [ligne(`\\text{premier terme}=${termeAvecL(e.terme, e.k)}=${tt[0]}`, `i = ${e.k}`)];
  if (arith) lignesB.push(ligne(`\\text{dernier terme}=${termeAvecL(e.terme, e.m)}=${tt[tt.length - 1]}`, `i = ${e.m}`));
  lignesB.push(ligne(`\\text{nombre de termes}=${e.m}-${e.k}+1=${N}`, "bornes comprises"));
  const etapeB: EtapeCorrection[] = [
    utilise("b", [t("On remplace i par les bornes ; de "), f(`i=${e.k}`), t(" à "), f(`i=${e.m}`), t(", il y a "), f("m-k+1"), t(" termes.")]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "elements")),
    piege("b", e.k === 1 ? [t("Compter "), f(`${e.m}-${e.k}`), t(" termes en oubliant une borne.")] : [t("Prendre "), f(`${uL(1)}=${valeurTerme(e.terme, 1)}`), t(" comme premier terme alors que la somme commence à "), f(`i=${e.k}`), t(".")]),
  ];
  return [...etapeA, ...etapeB, ...etapesValeur(e, "c")];
}

function corrigeMixte(e: E): EtapeCorrection[] {
  const { c, q } = e.geo!;
  const N = e.m;
  const tt = termesDe(e);
  return [
    utilise("a", [t("Linéarité : "), f(`${sigmaL(1, N, "(a_i+b_i)")}=${sigmaL(1, N, "a_i")}+${sigmaL(1, N, "b_i")}`), t(` ; la partie géométrique a pour premier terme ${c * q} (pour i = 1) et pour raison ${q} ${COURS_GEO}.`)]),
    calcul("a", [ligne(`${sigmaL(1, N, geoL(c, q, "i"))}=${geoL(c, q, "1")}+${geoL(c, q, "2")}+\\cdots+${geoL(c, q, `${N}`)}`, "on développe"), ...lignesGeo(N, c * q, q, "")]),
    resultat("a", reponse(e, "partieGeo")),
    piege("a", [t("Prendre "), f(`${c}`), t(" comme premier terme : la somme commence à "), f("i=1"), t(", donc par "), f(`${c * q}`), t(".")]),
    utilise("b", [t(`Partie arithmétique : ${N} termes, de raison ${(e.terme as { a: number }).a} ${COURS_SIGMA}.`)]),
    calcul("b", [ligne(`\\text{premier}=${termeAvecL(e.terme, 1)}=${tt[0]}`, "i = 1"), ligne(`\\text{dernier}=${termeAvecL(e.terme, N)}=${tt[N - 1]}`, `i = ${N}`), ...lignesArith(N, tt[0], tt[N - 1], sigmaL(1, N, termeSousSigmaL(e.terme)))]),
    resultat("b", reponse(e, "partieArith")),
    piege("b", [t("Oublier le terme constant à chaque rang : il compte "), f(`${N}`), t(" fois.")]),
    utilise("c", [t("La somme cherchée est la somme des deux parties.")]),
    calcul("c", [ligne(`S=${partieGeo(e)}+${parL(sommeDe(e))}`, "partie géométrique + partie arithmétique"), ligne(`=${totalMixte(e)}`, "on additionne")]),
    resultat("c", reponse(e, "total")),
    verification("c", [t("Premier terme de S : "), f(`${geoL(c, q, "1")}+${termeAvecL(e.terme, 1)}=${c * q + tt[0]}`), t(", qu'on retrouve en développant S.")]),
    piege("c", [t("Multiplier les deux parties au lieu de les additionner.")]),
  ];
}

function corrigeLitteral(e: E): EtapeCorrection[] {
  const T = e.terme;
  const u1 = valeurTerme(T, 1);
  const etapeA: EtapeCorrection[] = [
    utilise("a", [t("On remplace i par 1, puis par n.")]),
    calcul("a", [ligne(`u_1=${termeAvecL(T, 1)}=${u1}`, "i = 1"), ligne(`u_n=${termeL(T, "n")}`, "i = n")]),
    resultat("a", reponse(e, "extremesN")),
    piege("a", [t("Remplacer i par "), f("n-1"), t(" pour le dernier terme : la somme s'arrête à "), f("i=n"), t(".")]),
  ];
  if (T.kind === "arith") {
    const c = T.a + 2 * T.b;
    return [
      ...etapeA,
      utilise("b", [t(`Suite arithmétique de raison ${T.a < 0 ? "−" : ""}${Math.abs(T.a)}, n termes ${COURS_SIGMA} : `), f("S_n=\\dfrac{n(u_1+u_n)}{2}"), t(".")]),
      calcul("b", [
        ligne(`S_n=\\dfrac{n\\left(${u1}+${termeL(T, "n").startsWith("-") ? `(${termeL(T, "n")})` : termeL(T, "n")}\\right)}{2}`, "on remplace"),
        ligne(`=\\dfrac{n\\left(${affineL(T.a, c, "n")}\\right)}{2}`, "on réduit la parenthèse"),
        ...(sommeNL(T) === `\\dfrac{n\\left(${affineL(T.a, c, "n")}\\right)}{2}` ? [] : [ligne(`=${sommeNL(T)}`, "écriture simplifiée")]),
      ]),
      resultat("b", reponse(e, "sommeN")),
      verification("b", [t("Pour "), f("n=2"), t(" : "), f(`S_2=${u1}+${parL(valeurTerme(T, 2))}=${u1 + valeurTerme(T, 2)}`), t(", comme la formule.")]),
      piege("b", [t("Oublier de diviser par 2, ou compter "), f("n-1"), t(" termes.")]),
    ];
  }
  const g = T as { kind: "geo"; c: number; q: number };
  return [
    ...etapeA,
    utilise("b", [t(`Suite géométrique de raison ${g.q}, n termes ${COURS_GEO} : `), f("S_n=u_1\\cdot\\dfrac{1-q^{n}}{1-q}"), t(".")]),
    calcul("b", [
      ligne(`S_n=${u1}\\cdot\\dfrac{1-${g.q}^{n}}{1-${g.q}}`, "on remplace"),
      ligne(`=${u1}\\cdot\\dfrac{${g.q}^{n}-1}{${g.q - 1}}`, "on multiplie haut et bas par −1"),
      ligne(`=${sommeNL(T)}`, "écriture simplifiée"),
    ]),
    resultat("b", reponse(e, "sommeN")),
    verification("b", [t("Pour "), f("n=1"), t(" : la formule donne "), f(`${u1}`), t(", le premier terme.")]),
    piege("b", [t("Prendre "), f(`${g.c}`), t(" comme premier terme : la somme commence à "), f("i=1"), t(", donc par "), f(`${u1}`), t(".")]),
  ];
}

function corrigeChangement(e: E): EtapeCorrection[] {
  const N = nombreTermes(e);
  const d = e.k - 1; // i = j + d
  const iDeJ = d === 0 ? "j" : d > 0 ? `j+${d}` : `j-${-d}`;
  const jDeI = d === 0 ? "i" : d > 0 ? `i-${d}` : `i+${-d}`;
  const lignesB: LigneCalcul[] = [ligne(`i=${iDeJ}`, [t("car "), f(`j=${jDeI}`)])];
  if (e.terme.kind === "arith") {
    lignesB.push(ligne(`${termeL(e.terme, "i")}=${termeL(e.terme, `(${iDeJ})`)}`, "on remplace i"));
    lignesB.push(ligne(`=${nouveauTermeL(e)}`, "on distribue et on réduit"));
  } else {
    lignesB.push(ligne(`${termeL(e.terme, "i")}=${nouveauTermeL(e)}`, "on remplace i dans l'exposant"));
  }
  return [
    utilise("a", [t("On pose "), f(`j=${jDeI}`), t(" : quand "), f(`i=${e.k}`), t(", "), f("j=1"), t(" ; le nombre de termes ne change pas.")]),
    calcul("a", [ligne(`i=${e.m}\\ \\Rightarrow\\ j=${e.m}${d > 0 ? `-${d}` : d < 0 ? `+${-d}` : ""}=${N}`, "borne supérieure")]),
    resultat("a", reponse(e, "nouvelleBorne")),
    piege("a", [t("Garder la borne "), f(`${e.m}`), t(" : la nouvelle somme aurait trop de termes.")]),
    utilise("b", [t("On exprime i en fonction de j et on remplace dans le terme général.")]),
    calcul("b", lignesB),
    resultat("b", reponse(e, "nouveauTerme")),
    verification("b", [t("Pour "), f("j=1"), t(", le nouveau terme vaut "), f(`${valeurTerme(e.terme, e.k)}`), t(", le premier terme de la somme de départ ("), f(`i=${e.k}`), t(").")]),
    piege("b", [t("Remplacer i par "), f(jDeI.replace("i", "j")), t(" (à l'envers).")]),
    ...etapesValeur(e, "c"),
  ];
}

export function correctionDetailleeSigma(e: E): EtapeCorrection[] {
  switch (e.variante) {
    case "ecrire":
      return corrigeEcrire(e);
    case "developper":
      return corrigeDevelopper(e);
    case "uneSuite":
      return corrigeUneSuite(e);
    case "mixte":
      return corrigeMixte(e);
    case "litteral":
      return corrigeLitteral(e);
    case "changementIndice":
      return corrigeChangement(e);
  }
}
