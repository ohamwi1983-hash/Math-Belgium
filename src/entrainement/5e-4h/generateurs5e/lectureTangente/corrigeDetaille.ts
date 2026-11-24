import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLectureTangente } from "../../core5e/lectureTangente";
import { aDe, echellesDifferentes, faDe, fpaQ, NOMS_POINTS, pointB, positionBonGraphique, pQ, yPoint } from "../../core5e/lectureTangente";
import { COURS_LECTURE, COURS_TANGENTES } from "../../ui5e/corrigeDerivees1";
import { q, qL, qMul, qSub } from "../../ui5e/nombresTrigo";
import { affineL, droiteCandidat, equationL, figureBonCandidat, figureComparer, figurePente, parN, reponse } from "../../ui5e/formatLectureTangente";

/**
 * Corrigé détaillé « comme au tableau » de `5gen73`, une lettre par écran : a) f(a) lu (ou calculé
 * avec l'équation de t) ; b) f′(a) = Δy / Δx entre deux nœuds de t (en unités, l'échelle écrite),
 * figure annotée ; c) y = f′(a)(x − a) + f(a) remplie, distribuée, réduite ; d) signe de f′ et pente
 * la plus raide lus point par point, figure des trois tangentes ; inverse : c) graphique choisi en
 * vérifiant le point de tangence puis la pente, les intrus écartés.
 */

type E = ExerciceLectureTangente;
const t = texte;
const f = latex;

function etapeA(e: E): EtapeCorrection[] {
  const a = aDe(e);
  const fa = faDe(e);
  if (e.variante === "inverse") {
    const m = fpaQ(e);
    const p = pQ(e);
    return [
      utilise("a", [t("A appartient à la courbe ET à la tangente : son ordonnée f(a) se calcule avec l'équation de t "), t(COURS_TANGENTES), t(".")]),
      calcul("a", [ligne(`f(${a})=${qL(m)}\\cdot ${parN(a)}${p.n === 0 ? "" : p.n > 0 ? `+${qL(p)}` : qL(p)}`, "on remplace x par a dans l'équation de t"), ligne(`=${fa}`)]),
      resultat("a", reponse(e, "valeur")),
    ];
  }
  const lignes = echellesDifferentes(e)
    ? [ligne(`A(${a}\\,;\\,f(${a}))`, `A est à ${Math.abs(e.courbe.ja)} carreau${Math.abs(e.courbe.ja) > 1 ? "x" : ""} ${e.courbe.ja >= 0 ? "au-dessus" : "en dessous"} de l'axe des abscisses`), ligne(`f(${a})=${e.courbe.ja}\\cdot ${e.sy}`, `un carreau vaut ${e.sy} en ordonnée`), ligne(`=${fa}`)]
    : [ligne(`A(${a}\\,;\\,f(${a}))`, "point de la courbe d'abscisse a"), ligne(`f(${a})=${fa}`, "ordonnée lue sur l'axe vertical")];
  return [
    utilise("a", [t("f(a) est l'ordonnée du point de la courbe d'abscisse a "), t(COURS_LECTURE), t(".")]),
    calcul("a", lignes),
    resultat("a", reponse(e, "valeur")),
    piege("a", [t("Lire l'abscisse au lieu de l'ordonnée"), t(echellesDifferentes(e) ? ", ou compter les carreaux sans tenir compte de l'échelle." : ".")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const a = aDe(e);
  if (e.variante === "inverse") {
    return [
      utilise("b", [t("f′(a) est la pente de la tangente en A : dans "), f("y=mx+p"), t(", c'est le coefficient m de x "), t(COURS_TANGENTES), t(".")]),
      calcul("b", [ligne(equationL(e), "équation de t"), ligne(`f'(${a})=${qL(fpaQ(e))}`, "coefficient de x")]),
      resultat("b", reponse(e, "pente")),
      piege("b", [t("Confondre la pente f′(a) avec l'ordonnée à l'origine de t ou avec f(a).")]),
    ];
  }
  const A = { x: a, y: faDe(e) };
  const B = pointB(e);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  return [
    utilise("b", [t("f′(a) est la pente de la tangente en A ; avec deux points A et B de t : "), f("f'(a)=\\dfrac{y_B-y_A}{x_B-x_A}"), t(` ${COURS_TANGENTES}.`)]),
    {
      ...calcul("b", [
        ligne(`A(${A.x}\\,;${A.y})\\text{ et }B(${B.x}\\,;${B.y})`, echellesDifferentes(e) ? `nœuds de t, coordonnées en unités (1 carreau = ${e.sx} en x, ${e.sy} en y)` : "deux nœuds du quadrillage sur t"),
        ligne(`f'(${a})=\\dfrac{${B.y}-${parN(A.y)}}{${B.x}-${parN(A.x)}}`, "Δy sur Δx"),
        ligne(dx === 1 ? `=${dy}` : `=\\dfrac{${dy}}{${dx}}`),
        ...(dx === 1 || qL(q(dy, dx)) === `\\dfrac{${Math.abs(dy)}}{${dx}}`.replace(/^/, dy < 0 ? "-" : "") ? [] : [ligne(`=${qL(fpaQ(e))}`)]),
      ]),
      figureHtml: figurePente(e),
    },
    resultat("b", reponse(e, "pente")),
    verification("b", [t("La tangente " + (dy > 0 ? "monte" : "descend") + " de gauche à droite : f′(a) est bien " + (dy > 0 ? "positif" : "négatif") + ".")]),
    piege("b", [t(echellesDifferentes(e) ? "Compter les carreaux (" : "Donner f(a), l'ordonnée de A, au lieu de la pente"), ...(echellesDifferentes(e) ? [f(`\\dfrac{${e.courbe.dp}}{${e.courbe.dq}}`), t(") sans les convertir en unités.")] : [t(".")])]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const a = aDe(e);
  const fa = faDe(e);
  const m = fpaQ(e);
  const ma = qMul(m, q(a));
  const plusFa = fa === 0 ? "" : fa > 0 ? `+${fa}` : `${fa}`;
  const terme = (x: string) => (m.n === 1 && m.d === 1 ? x : m.n === -1 && m.d === 1 ? `-${x}` : `${qL(m)}${x}`);
  const lignes = [ligne(`y=f'(${a})\\,${a === 0 ? "x" : `(x-${parN(a)})`}+f(${a})`, "équation de la tangente en A")];
  if (a === 0) lignes.push(ligne(`y=${affineL(m, q(fa))}`, "on remplace (a = 0)"));
  else {
    lignes.push(ligne(`y=${terme(`(x${a > 0 ? `-${a}` : `+${-a}`})`)}${plusFa}`, "on remplace"));
    if (fa !== 0) lignes.push(ligne(`y=${affineL(m, qSub(q(0), ma))}${plusFa}`, "on distribue"));
    lignes.push(ligne(`y=${affineL(m, pQ(e))}`, fa !== 0 ? "on réduit" : "on distribue"));
  }
  return [
    utilise("c", [t("La tangente en A a pour équation "), f("y=f'(a)\\,(x-a)+f(a)"), t(` ${COURS_TANGENTES}.`)]),
    calcul("c", lignes),
    resultat("c", reponse(e, "equation")),
    verification("c", [t("En "), f(`x=${a}`), t(", on retrouve "), f(`y=${fa}`), t(" : la droite passe bien par A.")]),
    piege("c", [t("Écrire "), f("y=f'(a)\\,x+f(a)"), t(" : cette droite ne passe pas par A (sauf si a = 0).")]),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const [neg, max] = e.options[0]!;
  const lignes = e.points.map((_, k) => {
    const nom = NOMS_POINTS[k]!;
    const x = `x_${nom}`;
    if (k === neg) return ligne(`f'(${x})<0`, `en ${nom}, la courbe descend`);
    return ligne(`f'(${x})>0`, k === max ? `en ${nom}, la courbe monte le plus raide` : `en ${nom}, la courbe monte, moins raide`);
  });
  const autre = [0, 1, 2].find((k) => k !== neg && k !== max)!;
  lignes.push(ligne(`f'(x_${NOMS_POINTS[neg]})<f'(x_${NOMS_POINTS[autre]})<f'(x_${NOMS_POINTS[max]})`, "pentes des tangentes comparées"));
  const hauts = e.points.map((_, k) => yPoint(e, k));
  return [
    utilise("d", [t("Le signe de f′ dit si la courbe monte ("), f("f'>0"), t(") ou descend ("), f("f'<0"), t(") ; plus la tangente est raide en montant, plus f′ est grand "), t(COURS_LECTURE), t(".")]),
    { ...calcul("d", lignes), figureHtml: figureComparer(e) },
    resultat("d", reponse(e, "comparer")),
    piege("d", [t(`Comparer les hauteurs des points : le plus haut est ${NOMS_POINTS[hauts.indexOf(Math.max(...hauts))]}, le plus bas ${NOMS_POINTS[hauts.indexOf(Math.min(...hauts))]}, mais f′ se lit sur la pente, pas sur la hauteur.`)]),
  ];
}

function etapeGraphique(e: E): EtapeCorrection[] {
  const a = aDe(e);
  const fa = faDe(e);
  const n = positionBonGraphique(e) + 1;
  const lignes = e.ordreCandidats.map((k, i) => {
    const c = e.candidats[k]!;
    const d = droiteCandidat(c);
    const type = e.types[k];
    const pente = qL(d.m);
    if (type === "bon") return ligne(`\\text{graphique }${i + 1}`, `tangente en (${a} ; ${fa}), de pente ${pente.replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")} : convient`.replace(/-/g, "−"));
    if (type === "signe") return ligne(`\\text{graphique }${i + 1}`, `pente de signe opposé : exclu`);
    if (type === "decale") return ligne(`\\text{graphique }${i + 1}`, `même droite, mais tangente en x = ${c.ia} : exclu`.replace(/-/g, "−"));
    if (type === "ordonnee") return ligne(`\\text{graphique }${i + 1}`, `bonne pente, mais point de tangence (${c.ia} ; ${c.ja}) : exclu`.replace(/-/g, "−"));
    return ligne(`\\text{graphique }${i + 1}`, "f(a) et f′(a) échangés : exclu");
  });
  return [
    utilise("c", [t("Sur le graphique de f, la tangente en A passe par "), f(`(${a}\\,;${fa})`), t(" et a pour pente "), f(`f'(${a})=${qL(fpaQ(e))}`), t(` ${COURS_TANGENTES}.`)]),
    { ...calcul("c", lignes), figureHtml: figureBonCandidat(e) },
    resultat("c", reponse(e, "graphique")),
    verification("c", [t(`Sur le graphique ${n}, la droite tracée a bien pour équation `), f(equationL(e)), t(".")]),
    piege("c", [t("Vérifier seulement la droite sans regarder OÙ elle touche la courbe, ou confondre f(a) et f′(a).")]),
  ];
}

export function correctionDetailleeLectureTangente(e: E): EtapeCorrection[] {
  if (e.variante === "inverse") return [...etapeA(e), ...etapeB(e), ...etapeGraphique(e)];
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e)];
}
