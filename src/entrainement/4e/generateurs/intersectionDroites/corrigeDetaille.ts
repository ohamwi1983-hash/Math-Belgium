import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceIntersectionDroites, LigneIntersection } from "../../core/intersectionDroites.types";
import type { Point } from "../../core/vecteur.types";
import { plusQ, q, qp, somme } from "../../ui/corrigeChapitre3";
import {
  COURS_INTERSECTION,
  COURS_RELATIONS,
  col,
  dedoublonner,
  eqLatex,
  equation,
  lignesCritereColinearite,
  lignesIsoler,
  lignesPointCartesienne,
  lignesPointSurCartesienne,
  lignesPointSurExpliciteX,
  lignesPointSurExpliciteY,
  lignesSysteme2,
  produit,
  simplifiee,
  type Eq2,
  type Fragments,
} from "../../ui/corrigeAnalytique1";
import { finaliserVecteurs } from "../../ui/corrigeVecteurs2";
import { figureLotG } from "../../ui/figureLotG";
import { formatReponsePointAttendueLatex, texteConclusionAttendue } from "../../ui/formatIntersectionDroites";

/**
 * Corrigé détaillé « comme au tableau » de gen48 « Intersection de deux droites » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`AppIntersectionDroites.tsx`,
 * `sequencePourExercice`) : a = diagnostic (pentes, ou critère de colinéarité des vecteurs
 * directeurs ; directions égales → un point de d₁ testé dans d₂) ; b = point d'intersection (système,
 * substitution des équations paramétriques, ou égalité des deux paramétrages en t et s). Nombres
 * exacts (fractions), jamais de décimale brute. Figure des deux droites sous la conclusion. Partagé par
 * l'adaptateur papier et l'appli.
 */

type E = ExerciceIntersectionDroites;

const LISIBLE: Record<1 | 2, string> = { 1: "d₁", 2: "d₂" };

function param(i: 1 | 2): string {
  return i === 1 ? "t" : "s";
}

/** Pente lue sur l'équation affichée d'une droite cartésienne. */
function lignesPente(l: LigneIntersection, i: 1 | 2): LigneCalcul[] {
  const m = l.vecteur.y / l.vecteur.x;
  switch (l.forme) {
    case "implicite": {
      const { a, b } = l.implicite;
      const sub = `-\\dfrac{${q(a)}}{${q(b)}}`;
      return dedoublonner([ligne(`m_${i}=-\\dfrac{a}{b}=${sub}`, `pente de ax + by + c = 0 (${LISIBLE[i]})`), ...(sub === q(m) ? [] : [ligne(`=${q(m)}`)])]);
    }
    case "explicite_y":
      return [ligne(`m_${i}=${q(l.expliciteYAffichee!.m)}`, `coefficient de x dans y = mx + p (${LISIBLE[i]})`)];
    case "explicite_x": {
      const n = l.expliciteXAffichee!.n;
      if (!Number.isInteger(n)) return [ligne(`m_${i}=\\dfrac{1}{n}=${q(m)}`, [latex("x=ny+q"), texte(" donne "), latex("y=\\dfrac{1}{n}\\,x-\\dfrac{q}{n}"), texte(` ; inverse de `), latex(`n=${q(n)}`), texte(` (${LISIBLE[i]})`)])];
      return dedoublonner([ligne(`m_${i}=\\dfrac{1}{n}=\\dfrac{1}{${q(n)}}`, [latex("x=ny+q"), texte(" donne "), latex("y=\\dfrac{1}{n}\\,x-\\dfrac{q}{n}"), texte(` (${LISIBLE[i]})`)]), ligne(`=${q(m)}`)]);
    }
    case "parametrique":
      return dedoublonner([ligne(`\\dfrac{y_{\\vec{u_${i}}}}{x_{\\vec{u_${i}}}}=\\dfrac{${q(l.vecteur.y)}}{${q(l.vecteur.x)}}`, `pente de ${LISIBLE[i]}, depuis son vecteur directeur`), ligne(`=${q(m)}`)]);
  }
}

/** Un point de d₁ (lu ou calculé sur l'équation affichée). */
function lignesPointDe(l: LigneIntersection, nom: string, p: Point): LigneCalcul[] {
  switch (l.forme) {
    case "parametrique":
      return [ligne(`x_${nom}=${q(l.parametriqueAffichee!.x0)}`, "t = 0 dans les équations de d₁"), ligne(`y_${nom}=${q(l.parametriqueAffichee!.y0)}`)];
    case "implicite":
      return lignesPointCartesienne(l.implicite, nom, p);
    case "explicite_y": {
      const { m, p: o } = l.expliciteYAffichee!;
      return [ligne(`x_${nom}=${q(p.x)}`, "on choisit l'abscisse"), ligne(m === 0 ? `y_${nom}=${q(o)}` : `y_${nom}=${produit(m, p.x)}${plusQ(o)}=${q(p.y)}`, "on remplace x dans l'équation de d₁")];
    }
    case "explicite_x": {
      const { n, q: o } = l.expliciteXAffichee!;
      return [ligne(`y_${nom}=${q(p.y)}`, "on choisit l'ordonnée"), ligne(n === 0 ? `x_${nom}=${q(o)}` : `x_${nom}=${produit(n, p.y)}${plusQ(o)}=${q(p.x)}`, "on remplace y dans l'équation de d₁")];
    }
  }
}

/** Le point P de d₁ remis dans l'équation de d₂ telle qu'elle est écrite. */
function lignesTest(d2: LigneIntersection, p: Point): { lignes: LigneCalcul[]; appartient: boolean } {
  switch (d2.forme) {
    case "implicite": {
      const v = d2.implicite.a * p.x + d2.implicite.b * p.y + d2.implicite.c;
      return { lignes: lignesPointSurCartesienne(d2.implicite, p, "P"), appartient: Math.abs(v) < 1e-9 };
    }
    case "explicite_y": {
      const { m, p: o } = d2.expliciteYAffichee!;
      return { lignes: lignesPointSurExpliciteY(m, o, p, "P"), appartient: Math.abs(m * p.x + o - p.y) < 1e-9 };
    }
    case "explicite_x": {
      const { n, q: o } = d2.expliciteXAffichee!;
      return { lignes: lignesPointSurExpliciteX(n, o, p, "P"), appartient: Math.abs(n * p.y + o - p.x) < 1e-9 };
    }
    case "parametrique": {
      const d = d2.parametriqueAffichee!;
      const s = (p.x - d.x0) / d.a;
      const y = d.y0 + d.b * s;
      const ok = Math.abs(y - p.y) < 1e-9;
      return {
        lignes: dedoublonner([
          ligne(`${q(p.x)}=${somme([[d.x0, ""], [d.a, "s"]])}`, "abscisse de P dans la première équation de d₂"),
          ...lignesIsoler(d.a, p.x - d.x0, "s", s, undefined, true, d.x0, p.x),
          ligne(`y=${q(d.y0)}${d.b < 0 ? "-" : "+"}${Math.abs(d.b) === 1 ? qp(s) : `${q(Math.abs(d.b))}\\cdot ${qp(s)}`}=${q(y)}${ok ? "" : `\\neq ${q(p.y)}`}`, ok ? "on retrouve l'ordonnée de P" : "ce n'est pas l'ordonnée de P"),
        ]),
        appartient: ok,
      };
    }
  }
}

function figure(e: E): string {
  const r = (l: LigneIntersection) => simplifiee(l.implicite, true).d;
  return figureLotG({
    droites: [
      { d: r(e.d1), couleur: "bleu", nom: "d₁" },
      { d: r(e.d2), couleur: "accent", nom: "d₂", pointilles: e.conclusion === "confondues" },
    ],
    points: e.point ? [{ p: e.point, nom: "I", couleur: "vert" }] : [{ p: e.d1.point, nom: "P", couleur: "encre" }],
  });
}

function etapesDiagnostic(e: E): EtapeCorrection[] {
  const { d1, d2 } = e;
  const blocs: EtapeCorrection[] = [];
  let utiliseA: Fragments;
  if (e.variante === "cart_cart") {
    utiliseA = [texte("Deux droites non verticales sont parallèles si et seulement si elles ont la même pente ; directions égales : un point de d₁ sur d₂ → confondues, sinon parallèles distinctes "), texte(`${COURS_RELATIONS}.`)];
    blocs.push(calcul("a", [...lignesPente(d1, 1), ...lignesPente(d2, 2), ligne(e.colineaires ? "m_1=m_2" : "m_1\\neq m_2", e.colineaires ? "pentes égales : directions égales" : "pentes différentes : directions différentes")], [], "Pentes"));
  } else if (e.variante === "param_param") {
    utiliseA = [texte("Les droites sont parallèles si et seulement si leurs vecteurs directeurs sont colinéaires (critère de colinéarité nul) ; directions égales : un point de d₁ sur d₂ → confondues, sinon parallèles distinctes "), texte(`${COURS_RELATIONS}.`)];
    blocs.push(
      calcul(
        "a",
        [
          ligne(`\\vec{u_1}=${col(d1.vecteur)}`, "coefficients de t dans d₁"),
          ligne(`\\vec{u_2}=${col(d2.vecteur)}`, "coefficients de s dans d₂"),
          ...lignesCritereColinearite(d1.vecteur, d2.vecteur, "u_1", "u_2"),
        ],
        [],
        "Directions",
      ),
    );
  } else {
    const iP = d1.forme === "parametrique" ? 1 : 2;
    const iC = (3 - iP) as 1 | 2;
    const lP = iP === 1 ? d1 : d2;
    const lC = iC === 1 ? d1 : d2;
    utiliseA = [texte("On compare la pente de la droite cartésienne au rapport "), latex("\\dfrac{y_{\\vec{u}}}{x_{\\vec{u}}}"), texte(" du vecteur directeur de la droite paramétrique : égaux → directions égales ; puis un point de d₁ sur d₂ → confondues, sinon parallèles distinctes "), texte(`${COURS_RELATIONS}.`)];
    blocs.push(calcul("a", [...lignesPente(lC, iC), ...lignesPente(lP, iP as 1 | 2), ligne(e.colineaires ? `m_${iC}=\\dfrac{y_{\\vec{u_${iP}}}}{x_{\\vec{u_${iP}}}}` : `m_${iC}\\neq\\dfrac{y_{\\vec{u_${iP}}}}{x_{\\vec{u_${iP}}}}`, e.colineaires ? "directions égales" : "directions différentes")], [], "Directions"));
  }
  if (e.colineaires) {
    const p = d1.point;
    const { lignes } = lignesTest(d2, p);
    blocs.push(calcul("a", [...lignesPointDe(d1, "P", p), ...lignes], [texte("Un point P de d₁, remis dans l'équation de d₂ :")], "Point de d₁"));
  }
  const res = resultat("a", [texte(texteConclusionAttendue(e))]);
  return [
    utilise("a", utiliseA),
    ...blocs,
    e.conclusion === "secantes" ? res : { ...res, figureHtml: figure(e) },
    piege(
      "a",
      e.colineaires
        ? [texte("Des directions identiques ne suffisent pas : il faut tester si un point de d₁ est sur d₂ pour distinguer « parallèles distinctes » et « confondues ».")]
        : [texte("Les pentes (ou vecteurs) différent : les droites se coupent en un seul point, il reste à le calculer.")],
    ),
  ];
}

/** « 3(2+t) », « −(1−2t) », « (4t) » : coefficient devant une expression substituée. */
function fois(c: number, expr: string, premier: boolean): string {
  if (c === 0) return "";
  const monome = /^[^+-]+$/.test(expr);
  if (monome && c === 1) return premier ? expr : `+${expr}`;
  const corps = `(${expr})`;
  if (c === 1) return premier ? corps : `+${corps}`;
  if (c === -1) return `-${corps}`;
  return premier || c < 0 ? `${q(c)}${corps}` : `+${q(c)}${corps}`;
}

function etapesPoint(e: E): EtapeCorrection[] {
  const I = e.point!;
  const { d1, d2 } = e;
  let utiliseB: Fragments;
  const blocs: EtapeCorrection[] = [];
  let verif: EtapeCorrection[] = [];
  if (e.variante === "cart_cart") {
    const r1 = simplifiee(d1.implicite, true).d;
    const r2 = simplifiee(d2.implicite, true).d;
    const eq1: Eq2 = { e: r1.a, f: r1.b, k: -r1.c };
    const eq2: Eq2 = { e: r2.a, f: r2.b, k: -r2.c };
    utiliseB = [texte("Le point d'intersection vérifie les deux équations : on résout le système (substitution ou combinaison) "), texte(`${COURS_INTERSECTION}.`)];
    blocs.push(
      calcul("b", [ligne(`\\text{(1)}\\;\\;${eqLatex(eq1, "x", "y")}`, "équation de d₁ sous la forme ax + by = k"), ligne(`\\text{(2)}\\;\\;${eqLatex(eq2, "x", "y")}`, "équation de d₂ sous la forme ax + by = k")], [], "Système"),
      calcul("b", lignesSysteme2(eq1, eq2, "x", "y", { u: I.x, v: I.y }), [], "Résolution"),
    );
    verif = [verification("b", [texte("I vérifie les deux équations : ")], [...lignesPointSurCartesienne(r1, I, "I"), ...lignesPointSurCartesienne(r2, I, "I")])];
  } else if (e.variante === "param_cart") {
    const iP = d1.forme === "parametrique" ? 1 : 2;
    const lP = iP === 1 ? d1 : d2;
    const lC = iP === 1 ? d2 : d1;
    const nomC = iP === 1 ? 2 : 1;
    const t = param(iP as 1 | 2);
    const tv = (iP === 1 ? e.tAttendu : e.sAttendu)!;
    const pa = lP.parametriqueAffichee!;
    const c = simplifiee(lC.implicite, true).d;
    const ex = somme([[pa.x0, ""], [pa.a, t]]);
    const ey = somme([[pa.y0, ""], [pa.b, t]]);
    const coefT = c.a * pa.a + c.b * pa.b;
    const cst = c.a * pa.x0 + c.b * pa.y0 + c.c;
    const sub = `${fois(c.a, ex, true)}${fois(c.b, ey, c.a === 0)}${plusQ(c.c)}`;
    utiliseB = [texte("On remplace x et y de l'équation cartésienne par leurs expressions paramétriques, on trouve le paramètre, puis on le remet dans les équations paramétriques "), texte(`${COURS_INTERSECTION}.`)];
    blocs.push(
      calcul(
        "b",
        dedoublonner([
          ligne(equation(c), `équation de ${LISIBLE[nomC as 1 | 2]}`),
          ligne(`${sub}=0`, [texte("on remplace x par "), latex(`{${ex}}`), texte(" et y par "), latex(`{${ey}}`)]),
          ligne(`${somme([[coefT, t], [cst, ""]])}=0`, "on développe et on réduit"),
          ...lignesIsoler(coefT, -cst, t, tv, undefined, true, cst, 0),
        ]),
        [],
        `Paramètre ${t}`,
      ),
      calcul(
        "b",
        [
          ligne(`x=${q(pa.x0)}${pa.a < 0 ? "-" : "+"}${Math.abs(pa.a) === 1 ? qp(tv) : `${q(Math.abs(pa.a))}\\cdot ${qp(tv)}`}=${q(I.x)}`, `on remplace ${t} dans les équations de ${LISIBLE[iP as 1 | 2]}`),
          ligne(`y=${q(pa.y0)}${pa.b < 0 ? "-" : "+"}${Math.abs(pa.b) === 1 ? qp(tv) : `${q(Math.abs(pa.b))}\\cdot ${qp(tv)}`}=${q(I.y)}`),
        ],
        [],
        "Coordonnées",
      ),
    );
    verif = [verification("b", [texte(`I vérifie l'équation de ${LISIBLE[nomC as 1 | 2]} : `)], lignesPointSurCartesienne(c, I, "I"))];
  } else {
    const p1 = d1.parametriqueAffichee!;
    const p2 = d2.parametriqueAffichee!;
    const tv = e.tAttendu!;
    const sv = e.sAttendu!;
    const eq1: Eq2 = { e: p1.a, f: -p2.a, k: p2.x0 - p1.x0 };
    const eq2: Eq2 = { e: p1.b, f: -p2.b, k: p2.y0 - p1.y0 };
    utiliseB = [texte("Au point d'intersection, les deux paramétrages donnent le même point : on égale les abscisses et les ordonnées (paramètres t et s différents), on résout le système en t et s "), texte(`${COURS_INTERSECTION}.`)];
    blocs.push(
      calcul(
        "b",
        [
          ligne(`${somme([[p1.x0, ""], [p1.a, "t"]])}=${somme([[p2.x0, ""], [p2.a, "s"]])}`, "abscisses égales"),
          ligne(`${somme([[p1.y0, ""], [p1.b, "t"]])}=${somme([[p2.y0, ""], [p2.b, "s"]])}`, "ordonnées égales"),
          ligne(`\\text{(1)}\\;\\;${eqLatex(eq1, "t", "s")}`, "t et s dans le membre de gauche"),
          ligne(`\\text{(2)}\\;\\;${eqLatex(eq2, "t", "s")}`),
        ],
        [],
        "Système",
      ),
      calcul("b", lignesSysteme2(eq1, eq2, "t", "s", { u: tv, v: sv }), [], "Résolution"),
      calcul(
        "b",
        [
          ligne(`x=${q(p1.x0)}${p1.a < 0 ? "-" : "+"}${Math.abs(p1.a) === 1 ? qp(tv) : `${q(Math.abs(p1.a))}\\cdot ${qp(tv)}`}=${q(I.x)}`, "on remplace t dans les équations de d₁"),
          ligne(`y=${q(p1.y0)}${p1.b < 0 ? "-" : "+"}${Math.abs(p1.b) === 1 ? qp(tv) : `${q(Math.abs(p1.b))}\\cdot ${qp(tv)}`}=${q(I.y)}`),
        ],
        [],
        "Coordonnées",
      ),
    );
    verif = [
      verification("b", [texte("Avec "), latex(`s=${q(sv)}`), texte(" dans les équations de d₂, on retrouve le même point : ")], [
        ligne(`x=${q(p2.x0)}${p2.a < 0 ? "-" : "+"}${Math.abs(p2.a) === 1 ? qp(sv) : `${q(Math.abs(p2.a))}\\cdot ${qp(sv)}`}=${q(I.x)}`),
        ligne(`y=${q(p2.y0)}${p2.b < 0 ? "-" : "+"}${Math.abs(p2.b) === 1 ? qp(sv) : `${q(Math.abs(p2.b))}\\cdot ${qp(sv)}`}=${q(I.y)}`),
      ]),
    ];
  }
  return [
    utilise("b", utiliseB),
    ...blocs,
    { ...resultat("b", [latex(formatReponsePointAttendueLatex(e)!)]), figureHtml: figure(e) },
    ...verif,
    piege(
      "b",
      e.variante === "cart_cart"
        ? [texte("Une fois x trouvé, il faut encore calculer y : le point d'intersection a deux coordonnées.")]
        : e.variante === "param_cart"
          ? [texte("La valeur du paramètre n'est pas la réponse : on la remplace dans les équations paramétriques pour obtenir les coordonnées.")]
          : [texte("Les paramètres des deux droites sont différents (t et s) : écrire la même lettre dans les deux représentations rend le système faux.")],
    ),
  ];
}

export function correctionDetailleeIntersectionDroites(e: E): EtapeCorrection[] {
  return finaliserVecteurs([...etapesDiagnostic(e), ...(e.conclusion === "secantes" ? etapesPoint(e) : [])]);
}

