import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceTL } from "../../core6e/traduireLieu";
import { droitesLieu, exclus, normeD, pointK, raison } from "../../core6e/traduireLieu";
import type { Poly, Pt } from "../../ui6e/outilsLieuxLotH2";
import { coordL, droiteL, nP, listeL, milieu, nL, normaliserPoly, polyDroite, polyL } from "../../ui6e/outilsLieuxLotH2";
import { equationLisibleL, figureTL, lieuFinal, natureComplete, RAISONS } from "../../ui6e/formatTraduireLieu";

/**
 * Corrigé détaillé « comme au tableau » de `6gen128`, une lettre par écran : a) la condition traduite,
 * une transformation par ligne, jusqu'à l'équation du lieu complet et sa nature ; b) la réciproque
 * (chaque point particulier testé) ; c) les points exclus ; d) la raison et le lieu final, avec la
 * figure (lieu tracé, points exclus en creux). Même source que l'écran.
 */

type E = ExerciceTL;
const ft = texte;
const fr = (x: unknown) => x as FragmentConsigne[];

const sg = (c: number): string => (Math.abs(c) < 1e-12 ? "" : c > 0 ? `+${nL(c)}` : `-${nL(-c)}`);
const carre = (v: string, a: number) => (a === 0 ? `${v}^2` : `(${v}${sg(-a)})^2`);
const egal0 = (p: Poly) => `${polyL(p)}=0`;
const nT = (v: number) => nL(v).replace(/^-/, "−");

/** « 4(x-1)+6(y+2) » : produit scalaire de u et de (x − x_A ; y − y_A), termes nuls omis. */
function produitScalaireL(u: Pt, A: Pt): string {
  const facteur = (v: string, a: number) => (a === 0 ? v : `(${v}${sg(-a)})`);
  const termes: string[] = [];
  for (const [c, v, a] of [
    [u.x, "x", A.x],
    [u.y, "y", A.y],
  ] as const) {
    if (c === 0) continue;
    const coef = Math.abs(c) === 1 ? "" : nL(Math.abs(c));
    termes.push(`${c < 0 ? "-" : termes.length ? "+" : ""}${coef}${facteur(v, a)}`);
  }
  return termes.join("");
}

/** (x − a)² + (y − b)² développé. */
function sommeCarres(pts: Pt[]): Poly {
  const p: Poly = { x2: 0, y2: 0, x: 0, y: 0, "1": 0 };
  for (const q of pts) {
    p.x2! += 1;
    p.y2! += 1;
    p.x! += -2 * q.x;
    p.y! += -2 * q.y;
    p["1"]! += q.x * q.x + q.y * q.y;
  }
  return p;
}
const moins = (a: Poly, b: Poly): Poly => {
  const r: Poly = {};
  for (const k of ["x2", "y2", "xy", "x", "y", "1"] as const) r[k] = (a[k] ?? 0) - (b[k] ?? 0);
  return r;
};
const fois = (a: Poly, k: number): Poly => {
  const r: Poly = {};
  for (const [m, v] of Object.entries(a)) r[m as keyof Poly] = (v ?? 0) * k;
  return r;
};

/** Ligne « on divise par g » si l'équation a un facteur commun. */
function lignesNormaliser(p: Poly): LigneCalcul[] {
  const n = normaliserPoly(p);
  const premier = Object.values(p).find((v) => v) ?? 1;
  const premierN = Object.values(n).find((v) => v) ?? 1;
  const k = premier / premierN;
  if (Math.abs(k - 1) < 1e-12) return [];
  return [ligne(egal0(n), `on divise par ${nL(k).replace(/^-/, "−")}`)];
}

function calculEquation(e: E): { utilise: FragmentConsigne[]; lignes: LigneCalcul[] } {
  const { A, B } = e;
  switch (e.situation) {
    case "pythagore":
    case "thales": {
      const ab2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
      const s = sommeCarres([A, B]);
      const gauche = moins(s, { "1": ab2 });
      const u: FragmentConsigne[] =
        e.situation === "thales"
          ? [ft("Pythagore et sa réciproque : le triangle "), { type: "latex", valeur: "APB" }, ft(" est rectangle en "), { type: "latex", valeur: "P" }, ft(" si et seulement si "), { type: "latex", valeur: "PA^2+PB^2=AB^2" }, ft(" ; distance dans un repère orthonormé (cours, point 4).")]
          : [ft("Distance dans un repère orthonormé : "), { type: "latex", valeur: "PA^2=(x-x_A)^2+(y-y_A)^2" }, ft(" (cours, points 1 et 4).")];
      return {
        utilise: u,
        lignes: [
          ligne("PA^2+PB^2=AB^2", e.situation === "thales" ? "réciproque de Pythagore" : ""),
          ligne(`${carre("x", A.x)}+${carre("y", A.y)}+${carre("x", B.x)}+${carre("y", B.y)}=${nL(ab2)}`, `P(x ; y), AB² = ${nT(B.x - A.x)}² + ${nT(B.y - A.y)}²`.replace(/(−\d+)²/g, "($1)²")),
          ligne(`${polyL(s)}=${nL(ab2)}`, "on développe"),
          ligne(egal0(gauche), "on regroupe"),
          ...lignesNormaliser(gauche),
        ],
      };
    }
    case "mediatrice":
    case "isocele": {
      const m = e.situation === "mediatrice" ? "\\Omega " : "P";
      const g = sommeCarres([A]);
      const d = sommeCarres([B]);
      const diff = moins(g, d);
      return {
        utilise: [ft(e.situation === "mediatrice" ? "Le centre d'un cercle passant par A et B est à la même distance de A et de B ; distance dans un repère orthonormé (cours, point 1)." : "Isocèle en P : PA = PB, donc PA² = PB² ; distance dans un repère orthonormé (cours, point 1).")],
        lignes: [
          ligne(`${m}A^2=${m}B^2`),
          ligne(`${carre("x", A.x)}+${carre("y", A.y)}=${carre("x", B.x)}+${carre("y", B.y)}`, `${m === "P" ? "P" : "Ω"}(x ; y)`),
          ligne(`${polyL(g)}=${polyL(d)}`, "on développe"),
          ligne(egal0(diff), [ft("les termes en "), { type: "latex", valeur: "x^2" }, ft(" et "), { type: "latex", valeur: "y^2" }, ft(" disparaissent")]),
          ...lignesNormaliser(diff),
        ],
      };
    }
    case "rectangleAB": {
      const u = { x: B.x - A.x, y: B.y - A.y };
      const pa: Poly = { x: u.x, y: u.y, "1": -u.x * A.x - u.y * A.y };
      const pb: Poly = { x: -u.x, y: -u.y, "1": u.x * B.x + u.y * B.y };
      return {
        utilise: [ft("Rectangle en "), { type: "latex", valeur: "A" }, ft(" : "), { type: "latex", valeur: "(AB)\\perp(AP)" }, ft(", donc "), { type: "latex", valeur: "\\vec{AB}\\cdot\\vec{AP}=0" }, ft(" ; de même en "), { type: "latex", valeur: "B" }, ft(" (produit scalaire, cours, point 1).")],
        lignes: [
          ligne(`\\vec{AB}\\cdot\\vec{AP}=${produitScalaireL(u, A)}=0`, `vecteur AB (${nT(u.x)} ; ${nT(u.y)})`),
          ligne(egal0(pa), "on développe"),
          ...lignesNormaliser(pa),
          ligne(`\\vec{BA}\\cdot\\vec{BP}=${produitScalaireL({ x: -u.x, y: -u.y }, B)}=0`),
          ligne(egal0(pb), "on développe"),
          ...lignesNormaliser(pb),
        ],
      };
    }
    case "milieuExt":
    case "corde": {
      const a = e.M.x + e.O.x;
      const b = e.M.y + e.O.y;
      const p4: Poly = { x2: 4, y2: 4, x: -4 * a, y: -4 * b, "1": a * a + b * b - e.r * e.r };
      return {
        utilise: [ft("I milieu de "), { type: "latex", valeur: "[MQ]" }, ft(" : "), { type: "latex", valeur: "Q=2I-M" }, ft(" ; Q est sur "), { type: "latex", valeur: "\\Gamma" }, ft(" (équation du cercle, cours, point 2).")],
        lignes: [
          ligne(`x_Q=2x${sg(-e.M.x)}`, "I(x ; y)"),
          ligne(`y_Q=2y${sg(-e.M.y)}`),
          ligne(`(x_Q${sg(-e.O.x)})^2+(y_Q${sg(-e.O.y)})^2=${nL(e.r * e.r)}`.replace("(x_Q)^2", "x_Q^2").replace("(y_Q)^2", "y_Q^2"), "Q ∈ Γ"),
          ligne(`(2x${sg(-a)})^2+(2y${sg(-b)})^2=${nL(e.r * e.r)}`.replace("(2x)^2", "4x^2").replace("(2y)^2", "4y^2"), "on remplace"),
          ligne(egal0(p4), "on développe et on regroupe"),
          ligne(egal0(fois(p4, 1 / 4)), "on divise par 4"),
        ],
      };
    }
    case "distance": {
      const n = normeD(e.d);
      const Ld = polyL(polyDroite(e.d));
      const [d1, d2] = droitesLieu(e);
      return {
        utilise: [ft("Distance d'un point à une droite (cours, point 1) : "), { type: "latex", valeur: "\\text{dist}(P\\,;d)=\\dfrac{|ax_P+by_P+c|}{\\sqrt{a^2+b^2}}" }, ft(".")],
        lignes: [
          ligne(`\\dfrac{|${Ld}|}{\\sqrt{${nP(e.d.a)}^2+${nP(e.d.b)}^2}}=${nL(e.h)}`, "P(x ; y)"),
          ligne(`|${Ld}|=${nL(n * e.h)}`, `√(a² + b²) = ${n}`),
          ligne(`${Ld}=${nL(n * e.h)}\\ \\text{ou}\\ ${Ld}=${nL(-n * e.h)}`, "deux cas"),
          ligne(`${droiteL(d1!)}\\ \\text{ou}\\ ${droiteL(d2!)}`, "on réduit"),
        ],
      };
    }
    case "bissectrices": {
      const L1 = polyL(polyDroite(e.d1));
      const L2 = polyL(polyDroite(e.d2));
      const n2 = e.d1.a ** 2 + e.d1.b ** 2;
      const [b1, b2] = droitesLieu(e);
      return {
        utilise: [ft("Un cercle de centre Ω est tangent à une droite quand la distance de Ω à cette droite vaut le rayon ; distance d'un point à une droite (cours, points 1 et 2).")],
        lignes: [
          ligne(`\\dfrac{|${L1}|}{\\sqrt{${n2}}}=\\dfrac{|${L2}|}{\\sqrt{${n2}}}`, "Ω(x ; y)"),
          ligne(`|${L1}|=|${L2}|`, "même dénominateur"),
          ligne(`${L1}=${L2}\\ \\text{ou}\\ ${L1}=-(${L2})`, "deux cas"),
          ligne(`${droiteL(b1!)}\\ \\text{ou}\\ ${droiteL(b2!)}`, "on réduit"),
        ],
      };
    }
  }
}

function reciproque(e: E): { utilise: FragmentConsigne[]; lignes: LigneCalcul[]; conclusion: FragmentConsigne[] } {
  const L = (s: string) => ({ type: "latex" as const, valeur: s });
  const u = [ft("Réciproque : un point de l'ensemble trouvé appartient au lieu seulement si la condition de l'énoncé a un sens pour lui (cours, point 4).")];
  switch (e.situation) {
    case "pythagore":
      return { utilise: u, lignes: [ligne(`AA^2+AB^2=0+AB^2=AB^2`, "P = A convient"), ligne(`BA^2+BB^2=AB^2+0=AB^2`, "P = B convient")], conclusion: [ft("Tout point du cercle vérifie l'égalité, A et B compris : aucun point à exclure.")] };
    case "thales":
      return { utilise: u, lignes: [], conclusion: [ft("A et B sont sur le cercle, mais pour "), L("P=A"), ft(" ou "), L("P=B"), ft(" il n'y a pas de triangle "), L("APB"), ft(" (deux sommets confondus) : deux points à exclure.")] };
    case "milieuExt":
      return { utilise: u, lignes: [], conclusion: [ft("Pour tout point I du cercle trouvé, "), L("Q=2I-M"), ft(" est sur "), L("\\Gamma"), ft(" et le segment "), L("[MQ]"), ft(" existe (M n'est pas sur "), L("\\Gamma"), ft(", donc "), L("Q\\neq M"), ft(") : aucun point à exclure.")] };
    case "corde":
      return { utilise: u, lignes: [ligne(`Q=2M-M=M`, "pour I = M")], conclusion: [ft("Le point M est sur le cercle trouvé, mais il correspondrait à "), L("Q=M"), ft(" : la corde "), L("[MM]"), ft(" n'existe pas. Un point à exclure.")] };
    case "mediatrice":
      return { utilise: u, lignes: [], conclusion: [ft("Tout point Ω de la médiatrice est le centre du cercle de rayon "), L("\\Omega A>0"), ft(", qui passe par A et par B : aucun point à exclure.")] };
    case "distance":
      return { utilise: u, lignes: [], conclusion: [ft("Tout point de ces deux droites est exactement à la distance "), L(nL(e.h)), ft(" de "), L("d"), ft(" : aucun point à exclure.")] };
    case "isocele": {
      const I = milieu(e.A, e.B);
      return { utilise: u, lignes: [], conclusion: [ft("Le milieu "), L(coordL(I)), ft(" de "), L("[AB]"), ft(" est sur la médiatrice, mais pour ce point P, A et B sont alignés : pas de triangle. Un point à exclure.")] };
    }
    case "bissectrices":
      return { utilise: u, lignes: [ligne(`\\text{dist}(K\\,;d_1)=\\text{dist}(K\\,;d_2)=0`, `K(${nT(pointK(e).x)} ; ${nT(pointK(e).y)})`)], conclusion: [ft("Au point commun K des deux droites, le « cercle » aurait un rayon nul : ce n'est pas un cercle. Un point à exclure.")] };
    case "rectangleAB":
      return { utilise: u, lignes: [], conclusion: [ft("A est sur la première droite et B sur la seconde, mais pour "), L("P=A"), ft(" ou "), L("P=B"), ft(" il n'y a pas de triangle : deux points à exclure.")] };
  }
}

export function correctionDetailleeTL(e: E): EtapeCorrection[] {
  const a = calculEquation(e);
  const b = reciproque(e);
  const fig = figureTL(e, true, true);
  const etapes: EtapeCorrection[] = [
    utilise("a", a.utilise),
    calcul("a", a.lignes),
    resultat("a", [{ type: "latex", valeur: equationLisibleL(e) }, ft(" : "), ...fr(natureComplete(e)), ft(".")]),
    piege("a", [ft(e.variante === "cercle" ? "Ne pas s'arrêter à l'équation : le lieu complet n'est pas forcément le lieu ; il reste la réciproque." : "Une valeur absolue ou un « ou » de l'énoncé donne deux équations : ne pas en oublier une.")]),
    utilise("b", b.utilise),
    ...(b.lignes.length ? [calcul("b", b.lignes)] : []),
    { ...resultat("b", b.conclusion), ...(e.nbExclus === 0 ? { figureHtml: fig } : {}) },
  ];
  if (e.nbExclus === 0) {
    etapes.push(piege("b", [ft("Exclure des points « par réflexe » : un point n'est exclu que si la condition de l'énoncé perd son sens pour lui.")]));
    return etapes;
  }
  etapes.push(resultat("c", [ft(e.nbExclus === 1 ? "Point à exclure : " : "Points à exclure : "), { type: "latex", valeur: listeL(exclus(e)) }, ft(".")]));
  etapes.push({ ...resultat("d", [ft(RAISONS[raison(e) ?? "hors"]), ft(" "), ...fr(lieuFinal(e))]), figureHtml: fig });
  etapes.push(piege("d", [ft("Donner le lieu complet comme réponse finale : ces points vérifient l'équation, mais pas la condition de l'énoncé.")]));
  return etapes;
}

