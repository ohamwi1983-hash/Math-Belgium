import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLieuxGeometriques, Lieu, LieuCercle, LieuDroite, LieuParabole } from "../../core/lieuxGeometriques.types";
import { moinsH, mono, plusQ, polynome, q, qp, rationnel, sansDoublons, somme } from "../../ui/corrigeChapitre3";
import { COURS_CERCLE, COURS_LIEU, COURS_LIEUX, COURS_PARABOLE, carreBinome, carreDeveloppe, estFraction, lignesDiscriminant, lignesPointSurCercle, lignesSolutions, moinsGroupe, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { dedoublonner } from "../../ui/corrigeLotG";
import { formatEquationLieuLatex, formatPointLatex, libelleChampEquation, segmentsDescriptionLieu } from "../../ui/formatLieuxGeometriques";

/**
 * Corrigé détaillé « comme au tableau » de gen54 « Intersection de deux lieux géométriques » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (identification → équations
 * → résolution) ; partagé par l'adaptateur papier et l'appli (`AppLieuxGeometriques.tsx`).
 * a) chaque lieu reconnu dans sa phrase, ses paramètres lus (§ 7) ; b) équations : y = mx + p,
 * MC = R élevé au carré (§ 8), MF = distance de M à la directrice élevée au carré (§ 9) ;
 * c) méthode du § 10 : équation de la parabole ramenée à sa forme réduite, substitution de la
 * droite (y, ou x pour une parabole d'axe horizontal), trinôme à coefficients entiers — MÊME
 * trinôme que l'écran (`formatQuadratiqueSubstitutionLatex`) —, Δ, solutions, seconde coordonnée
 * par la droite, vérification d'un point commun dans l'équation de la courbe.
 */

type E = ExerciceLieuxGeometriques;
type Fragments = FragmentConsigne[];

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Parenthèses (\left \right si l'expression contient une fraction). */
function par(expr: string, fraction: boolean): string {
  return fraction ? `\\left(${expr}\\right)` : `(${expr})`;
}

function droiteDe(e: E): LieuDroite {
  return (e.lieu1.type === "droite" ? e.lieu1 : e.lieu2) as LieuDroite;
}

function courbeDe(e: E): LieuCercle | LieuParabole {
  return (e.lieu1.type === "droite" ? e.lieu2 : e.lieu1) as LieuCercle | LieuParabole;
}

function sommetDe(L: LieuParabole): { x: number; y: number } {
  return L.orientation === "vertical" ? { x: L.foyer.x, y: L.foyer.y - L.p / 2 } : { x: L.foyer.x - L.p / 2, y: L.foyer.y };
}

/** Points communs (même ordre que l'écran et l'ancien corrigé : triés selon la variable du trinôme). */
function variableDe(e: E): "x" | "y" {
  const c = courbeDe(e);
  return c.type === "parabole" && c.orientation === "horizontal" ? "y" : "x";
}

export function pointsTries(e: E): { x: number; y: number }[] {
  const v = variableDe(e);
  return [...e.points].sort((a, b) => (v === "x" ? a.x - b.x : a.y - b.y));
}

/** Conclusion (Résultat de l'étape c, réponse brève, réponse finale du barème). */
export function conclusionLieux(e: E): Fragments {
  if (e.nombrePoints === 0) return [texte("Aucun point n'est à la fois sur les deux lieux : l'ensemble cherché est vide.")];
  const pts = pointsTries(e).map((p) => formatPointLatex(p));
  if (e.nombrePoints === 1) return [texte("Un seul point commun (la droite est tangente) : "), latex(pts[0]!), texte(".")];
  return [texte("Deux points communs : "), latex(pts[0]!), texte(" et "), latex(pts[1]!), texte(".")];
}

/* ---------------------------------------------------------------------------------------------
 * a) Identification
 * ------------------------------------------------------------------------------------------- */

function lignesIdentification(L: Lieu): LigneCalcul[] {
  if (L.type === "droite") {
    const jm = L.m === 1 ? "« égale à leur abscisse » : facteur 1" : L.m === -1 ? "« l'opposé de leur abscisse » : facteur −1" : "facteur de l'abscisse dans la phrase";
    const jp = L.p > 0 ? "« augmentée de … » : on ajoute p" : L.p < 0 ? "« diminuée de … » : p est négatif" : "rien n'est ajouté à l'ordonnée";
    return [ligne(`m=${q(L.m)}`, `l'ordonnée est proportionnelle à l'abscisse, ${jm}`), ligne(`p=${q(L.p)}`, jp)];
  }
  if (L.type === "cercle") {
    return [
      ligne(`x_0=${q(L.centre.x)}`, "distance constante à un point : c'est un cercle, le point donné est son centre"),
      ligne(`y_0=${q(L.centre.y)}`),
      ligne(`r=${q(L.rayon)}`, "la distance donnée est le rayon"),
    ];
  }
  const vertical = L.orientation === "vertical";
  const yF = vertical ? L.foyer.y : L.foyer.x;
  return [
    ligne(`x_F=${q(L.foyer.x)}`, "équidistance d'un point et d'une droite : c'est une parabole, le point donné est son foyer"),
    ligne(`y_F=${q(L.foyer.y)}`),
    ligne(`p=${q(yF)}-${qp(L.directrice)}`, [texte(`directrice ${vertical ? "horizontale : axe vertical" : "verticale : axe horizontal"}, `), latex(vertical ? "p=y_F-y_{\\text{directrice}}" : "p=x_F-x_{\\text{directrice}}")]),
    ligne(`=${q(L.p)}`),
  ];
}

/* ---------------------------------------------------------------------------------------------
 * b) Équations
 * ------------------------------------------------------------------------------------------- */

function lignesEquation(L: Lieu): LigneCalcul[] {
  if (L.type === "droite") return [ligne(`y=${somme([[L.m, "x"], [L.p, ""]])}`, [latex("y=mx+p"), texte(" avec m et p lus")])];
  if (L.type === "cercle") {
    const membre = `${carreBinome(L.centre.x, "x")}+${carreBinome(L.centre.y, "y")}`;
    return [
      ligne(`\\sqrt{${membre}}=${q(L.rayon)}`, "MC = r : distance du point M(x ; y) au centre"),
      ligne(`${membre}=${q(L.rayon * L.rayon)}`, "on élève au carré : deux nombres positifs"),
    ];
  }
  const v = L.orientation === "vertical" ? "y" : "x";
  const membre = `${carreBinome(L.foyer.x, "x")}+${carreBinome(L.foyer.y, "y")}`;
  return [
    ligne(`\\sqrt{${membre}}=|${moinsH(L.directrice, v)}|`, [texte("MF = distance de M(x ; y) à la directrice "), latex(`${v}=${q(L.directrice)}`)]),
    ligne(`${membre}=${carreBinome(L.directrice, v)}`, "on élève au carré : deux nombres positifs"),
  ];
}

/* ---------------------------------------------------------------------------------------------
 * c) Résolution
 * ------------------------------------------------------------------------------------------- */

interface Trinome {
  A: number;
  B: number;
  C: number;
}

/** Trinôme à coefficients entiers (même normalisation que l'écran : × dénominateur commun, ÷ pgcd). */
function lignesEntieres(t: Trinome, u: string): { lignes: LigneCalcul[]; a: number; b: number; c: number } {
  const coefs = [t.A, t.B, t.C];
  const ppcm = coefs.map((v) => rationnel(v)?.d ?? 1).reduce((acc, d) => (acc * d) / pgcd(acc, d), 1);
  const entiers = coefs.map((v) => Math.round(v * ppcm));
  const g = entiers.reduce((acc, n) => pgcd(acc, n), 0) || 1;
  const lignes: LigneCalcul[] = [];
  if (ppcm > 1) lignes.push(ligne(`${polynome(entiers, u)}=0`, `on multiplie les deux membres par ${ppcm}`));
  const [a, b, c] = entiers.map((n) => n / g) as [number, number, number];
  if (g > 1) lignes.push(ligne(`${polynome([a, b, c], u)}=0`, `on divise les deux membres par ${g}`));
  return { lignes, a, b, c };
}

/** Seconde coordonnée par la droite : « y_1 = m·x₁ + p ». */
function lignesSeconde(nom: string, coef: number, cst: number, valeur: number, resultatV: number, justif: string): LigneCalcul[] {
  const terme = coef === 1 ? q(valeur) : coef === -1 ? `-${qp(valeur)}` : `${q(coef)}\\cdot ${qp(valeur)}`;
  return sansDoublons([ligne(`${nom}=${terme}${plusQ(cst)}`, justif), ligne(`=${q(resultatV)}`)]);
}

function etapeResolution(e: E): EtapeCorrection[] {
  const D = droiteDe(e);
  const C = courbeDe(e);
  const blocs: EtapeCorrection[] = [];
  let u: "x" | "y" = "x";
  let t: Trinome;
  // seconde coordonnée : w = coef·u + cst
  let coefW = D.m;
  let cstW = D.p;
  const w = (): "x" | "y" => (u === "x" ? "y" : "x");

  if (C.type === "cercle") {
    const { x: x0, y: y0 } = C.centre;
    const k = D.p - y0;
    const frac = estFraction(D.m) || estFraction(D.p);
    const brut = `${somme([[D.m, "x"], [D.p, ""]])}${y0 === 0 ? "" : y0 > 0 ? `-${q(y0)}` : `+${q(-y0)}`}`;
    t = { A: 1 + D.m * D.m, B: -2 * x0 + 2 * D.m * k, C: x0 * x0 + k * k - C.rayon * C.rayon };
    const lignes: LigneCalcul[] = [
      ligne(`${carreBinome(x0, "x")}+${par(brut, frac)}^2=${q(C.rayon * C.rayon)}`, [texte("on remplace y par "), latex(somme([[D.m, "x"], [D.p, ""]])), texte(" dans l'équation du cercle")]),
      ligne(`${carreBinome(x0, "x")}+${par(somme([[D.m, "x"], [k, ""]]), estFraction(D.m) || estFraction(k))}^2=${q(C.rayon * C.rayon)}`, "on réduit dans la parenthèse"),
      ligne(`${carreDeveloppe(1, -x0, "x")}+${carreDeveloppe(D.m, k, "x")}=${q(C.rayon * C.rayon)}`, "on développe les deux carrés"),
      ligne(`${polynome([t.A, t.B, t.C])}=0`, "on réduit, tout dans le premier membre"),
    ];
    blocs.push(calcul("c", dedoublonner(lignes), [], "Substitution"));
  } else {
    const vertical = C.orientation === "vertical";
    u = vertical ? "x" : "y";
    const v = vertical ? "y" : "x";
    const S = sommetDe(C);
    const uF = vertical ? C.foyer.x : C.foyer.y;
    const vF = vertical ? C.foyer.y : C.foyer.x;
    const vS = vertical ? S.y : S.x;
    const d = C.directrice;
    const p = C.p;
    const carreU = carreBinome(uF, u);
    const groupeV = (expr: string, fraction: boolean) => `${q(2 * p)}${par(expr, fraction)}`;
    const reduite = [
      ligne(`${carreU}=${carreBinome(d, v)}-${carreBinome(vF, v)}`, [latex(carreBinome(vF, v)), texte(" passe dans le second membre")]),
      ligne(`${carreU}=${carreDeveloppe(1, -d, v)}${moinsGroupe(carreDeveloppe(1, -vF, v))}`, "on développe les deux carrés"),
      ligne(`${carreU}=${somme([[2 * p, v], [d * d - vF * vF, ""]])}`, [texte("on réduit : les termes en "), latex(`${v}^2`), texte(" s'éliminent")]),
      ligne(`${carreU}=${vS === 0 ? `${q(2 * p)}${v}` : groupeV(moinsH(vS, v), estFraction(vS))}`, [texte("on met "), latex(q(2 * p)), texte(" en évidence : forme réduite")]),
    ];
    blocs.push(calcul("c", dedoublonner(reduite), [], "Équation de la parabole"));

    // v exprimé en u par la droite
    let coef = D.m;
    let cst = D.p;
    if (!vertical) {
      coef = 1 / D.m;
      cst = -D.p / D.m;
      blocs.push(
        calcul(
          "c",
          dedoublonner([
            ligne(`${mono(D.m, "x")}=${somme([[1, "y"], [-D.p, ""]])}`, "on isole le terme en x dans l'équation de la droite"),
            ligne(`x=${somme([[coef, "y"], [cst, ""]])}`, D.m === 1 ? "" : `on divise les deux membres par ${q(D.m).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")}`),
          ]),
          [],
          "x en fonction de y",
        ),
      );
    }
    coefW = coef;
    cstW = cst;
    const k = cst - vS;
    const frac = estFraction(coef) || estFraction(cst);
    const brut = `${somme([[coef, u], [cst, ""]])}${vS === 0 ? "" : vS > 0 ? `-${q(vS)}` : `+${q(-vS)}`}`;
    t = { A: 1, B: -2 * uF - 2 * p * coef, C: uF * uF - 2 * p * k };
    const subst = [
      ligne(`${carreU}=${groupeV(brut, frac)}`, [texte(`on remplace ${v} par `), latex(somme([[coef, u], [cst, ""]]))]),
      ligne(`${carreU}=${groupeV(somme([[coef, u], [k, ""]]), estFraction(coef) || estFraction(k))}`, "on réduit dans la parenthèse"),
      ligne(`${carreDeveloppe(1, -uF, u)}=${somme([[2 * p * coef, u], [2 * p * k, ""]])}`, "on développe les deux membres"),
      ligne(`${polynome([t.A, t.B, t.C], u)}=0`, "tout dans le premier membre"),
    ];
    blocs.push(calcul("c", dedoublonner(subst), [], "Substitution"));
  }

  const ent = lignesEntieres(t, u);
  if (ent.lignes.length) blocs[blocs.length - 1] = { ...blocs[blocs.length - 1]!, calcul: [...blocs[blocs.length - 1]!.calcul!, ...ent.lignes] };
  const { a, b, c } = ent;
  const delta = b * b - 4 * a * c;
  const lignesDelta = lignesDiscriminant(a, b, c);
  if (delta < 0) lignesDelta.push(ligne(`${q(delta)}<0`, "Δ < 0 : l'équation n'a aucune solution réelle"));
  blocs.push(calcul("c", lignesDelta, [], "Discriminant"));

  if (delta >= 0) {
    const sol = lignesSolutions(a, b, c, u);
    blocs.push(calcul("c", sol.lignes, [], "Solutions"));
    const lignesW: LigneCalcul[] = [];
    sol.racines.forEach((r, i) => {
      const nom = sol.racines.length === 1 ? w() : `${w()}_${i + 1}`;
      lignesW.push(...lignesSeconde(nom, coefW, cstW, r, coefW * r + cstW, i === 0 ? `on remplace ${u} dans ${u === "x" ? "l'équation de la droite" : "l'expression de x"}` : ""));
    });
    blocs.push(calcul("c", lignesW, [], u === "x" ? "Ordonnées" : "Abscisses"));
  }
  return blocs;
}

function verificationPoint(e: E): EtapeCorrection | null {
  if (e.nombrePoints === 0) return null;
  const P = pointsTries(e)[0]!;
  const C = courbeDe(e);
  const intro: Fragments = [texte(`Le ${e.nombrePoints === 1 ? "" : "premier "}point `), latex(formatPointLatex(P)), texte(C.type === "cercle" ? " est sur le cercle : " : " est sur la parabole (forme réduite) : ")];
  if (C.type === "cercle") return verification("c", intro, lignesPointSurCercle(C.centre, C.rayon * C.rayon, P, "ce point"));
  const vertical = C.orientation === "vertical";
  const S = sommetDe(C);
  const [pu, pv, uF, vS] = vertical ? [P.x, P.y, C.foyer.x, S.y] : [P.y, P.x, C.foyer.y, S.x];
  const carre = uF === 0 ? `${qp(pu)}^2` : `(${q(pu)}${uF < 0 ? `+${q(-uF)}` : `-${q(uF)}`})^2`;
  const g = vS === 0 ? qp(pv) : `(${q(pv)}${vS < 0 ? `+${q(-vS)}` : `-${q(vS)}`})`;
  return verification("c", intro, [
    ligne(`${carre}=${q((pu - uF) ** 2)}`, "premier membre"),
    ligne(`${q(2 * C.p)}\\cdot ${g}=${q(2 * C.p * (pv - vS))}`, "second membre : les deux membres sont égaux"),
  ]);
}

export function correctionDetailleeLieuxGeometriques(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesLieuxGeometriques(e));
}

function etapesLieuxGeometriques(e: E): EtapeCorrection[] {
  const C = courbeDe(e);
  const v = variableDe(e);
  const autre = v === "x" ? "y" : "x";
  const desc = (L: Lieu): Fragments => {
    const s = segmentsDescriptionLieu(L);
    return s.map((f, i) => (i === 0 && f.type === "texte" ? { ...f, valeur: f.valeur.charAt(0).toLowerCase() + f.valeur.slice(1) } : f));
  };
  const etapeV = verificationPoint(e);
  return [
    utilise("a", [
      texte("Reconnaître un lieu dans sa phrase : l'ordonnée égale à m fois l'abscisse, augmentée de p, donne la droite "),
      latex("y=mx+p"),
      texte(" ; une distance constante à un point, un cercle (centre et rayon) ; l'équidistance d'un point et d'une droite, une parabole (foyer et directrice) "),
      texte(`${COURS_LIEU}.`),
    ]),
    calcul("a", lignesIdentification(e.lieu1), [], "Premier lieu"),
    calcul("a", lignesIdentification(e.lieu2), [], "Second lieu"),
    resultat("a", [texte("Premier lieu : "), ...desc(e.lieu1), texte(". Second lieu : "), ...desc(e.lieu2), texte(".")]),
    piege("a", C.type === "cercle" ? [texte("« À une distance de … unités du point » décrit un cercle : le nombre donné est le rayon r, pas r².")] : [texte("Pour la parabole, p est l'écart signé entre le foyer et la directrice (pas l'écart entre le foyer et le sommet, qui vaut "), latex("\\dfrac{p}{2}"), texte(").")]),

    utilise("b", [
      texte("Droite : "),
      latex("y=mx+p"),
      texte(". Cercle : MC = R, élevé au carré, "),
      latex("(x-x_0)^2+(y-y_0)^2=r^2"),
      texte(` ${COURS_CERCLE}. Parabole : MF = distance de M à la directrice, élevée au carré ${COURS_PARABOLE}.`),
    ]),
    calcul("b", lignesEquation(e.lieu1), [], "Premier lieu"),
    calcul("b", lignesEquation(e.lieu2), [], "Second lieu"),
    resultat("b", [texte(`${libelleChampEquation(e.lieu1)} `), latex(formatEquationLieuLatex(e.lieu1)), texte(`. ${libelleChampEquation(e.lieu2)} `), latex(formatEquationLieuLatex(e.lieu2)), texte(".")]),
    piege("b", C.type === "cercle" ? [texte("Au second membre de l'équation du cercle, c'est "), latex("r^2"), texte(", pas r.")] : [texte("La distance de M à la directrice "), latex(C.orientation === "vertical" ? "y=k" : "x=k"), texte(" est "), latex(C.orientation === "vertical" ? "|y-k|" : "|x-k|"), texte(" : seule la coordonnée perpendiculaire à la directrice y entre.")]),

    utilise("c", [
      texte("Les points communs vérifient les deux équations : on remplace "),
      latex(v === "x" ? "y" : "x"),
      texte(` par son expression tirée de la droite dans l'équation de la ${C.type === "cercle" ? "courbe" : "parabole (ramenée à sa forme réduite)"}, on résout l'équation du second degré obtenue (Δ), puis on calcule ${autre} avec la droite. Δ < 0, aucun point ; Δ = 0, un point (tangente) ; Δ > 0, deux points `),
      texte(`${COURS_LIEUX}.`),
    ]),
    ...etapeResolution(e),
    resultat("c", conclusionLieux(e)),
    ...(etapeV ? [etapeV] : []),
    piege(
      "c",
      e.nombrePoints === 0
        ? [texte("Un discriminant négatif n'est pas une erreur de calcul : il signifie que les deux lieux ne se coupent pas.")]
        : [texte(`Chaque solution ne donne que ${v} : il faut encore calculer ${autre} avec la droite pour obtenir les coordonnées du point.`)],
    ),
  ];
}
