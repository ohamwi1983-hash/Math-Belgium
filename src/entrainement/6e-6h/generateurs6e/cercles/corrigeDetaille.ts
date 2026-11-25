import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { lettreEtape } from "../../../export/corrigeTableau";
import type { DonneesTriangle, ExerciceCercles, ExerciceCerclesG } from "../../core6e/cercles.types";
import { phasesPourExercice } from "../../moteur6e/typesCercles";
import type { PhaseCercles } from "../../moteur6e/typesCercles";
import { polyEquationK, polySysteme } from "../../moteur6e/verificationCercles";
import { dist2, latexCercle, latexPoly, latexQ, latexRacine, milieu, q, qAdd, qDiv, qMul, qNeg, qNum, qSub } from "../../moteur6e/algebreLieux";
import type { Pt, Q } from "../../moteur6e/algebreLieux";
import { calcul, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_CERCLES, avecFigure, ld, lignesDroiteNormale, lignesIntersection, lignesSysteme, lp, nomPt, parQ, vecteur } from "../../ui6e/corrigeLieux";
import { figure6gen55 } from "../../ui6e/formatCercles";

/**
 * Corrigé détaillé « comme au tableau » de `6gen55` (cercles, 6e ch. 9, § 2 ; audit, lot E), une lettre
 * par écran — même source pour l'écran (corrigé consultable après chaque réponse) et pour le papier.
 * Valeurs EXACTES partout (fractions, racines simplifiées), équation du cercle donnée dans chaque
 * famille (audit E5), FIGURE du ou des cercles sous le dernier résultat (B à zéro cercle : la
 * configuration et le cercle de centre A qui ne coupe pas la médiatrice).
 */

type E = ExerciceCercles;
type P = PhaseCercles;

const lq = latexQ;

function L(e: E, p: P): string {
  return lettreEtape(phasesPourExercice(e).indexOf(p));
}
function figure(e: E): string {
  return figure6gen55(e, phasesPourExercice(e));
}

/** Rayon exact écrit depuis r² (« r = \sqrt{50} = 5\sqrt{2} »). */
function lignesRayon(r2: Q): LigneCalcul[] {
  const simple = latexRacine(r2);
  const brut = `\\sqrt{${lq(r2)}}`;
  return [ligne(simple === brut ? `r=${brut}` : `r=${brut}=${simple}`, "le rayon est la racine carrée de r²")];
}

const eqCercle = (c: Pt, r2: Q) => latexCercle(c, r2);

/** Équation (x − a)² + (y − b)² = r² posée avec le centre et r². */
function ligneEquation(c: Pt, r2: Q): LigneCalcul {
  return ligne(eqCercle(c, r2), "cercle de centre Ω et de rayon r : (x − x_Ω)² + (y − y_Ω)² = r²");
}

function corrigeA(e: Extract<E, { famille: "A" }>): EtapeCorrection[] {
  const a = L(e, "aSysteme");
  const b = L(e, "aCoefficients");
  const c = L(e, "aCentreRayon");
  const eqs = [e.A, e.B, e.C].map((p) => `${latexPoly(polySysteme(p), ["D", "E", "F"])}=0`);
  // (1) − (2) et (1) − (3) : F disparaît.
  const s = (p: Pt) => qAdd(qMul(p.x, p.x), qMul(p.y, p.y));
  const diff = (p1: Pt, p2: Pt): [Q, Q, Q] => [qSub(p1.x, p2.x), qSub(p1.y, p2.y), qSub(s(p1), s(p2))];
  const sys = lignesSysteme(diff(e.A, e.B), diff(e.A, e.C), "D", "E", ["(4)", "(5)"]);
  const F = qSub(qNeg(s(e.A)), qAdd(qMul(e.A.x, q(e.D)), qMul(e.A.y, q(e.E))));
  return [
    utiliseCours(a, fx("Un point est sur le cercle $x^2+y^2+Dx+Ey+F=0$ si et seulement si ses coordonnées vérifient l'équation"), COURS_CERCLES),
    calcul(a, [ligne(eqs[0], "(1) : on remplace x et y par les coordonnées de A"), ligne(eqs[1], "(2) : par celles de B"), ligne(eqs[2], "(3) : par celles de C")]),
    resultat(a, fx(`Le système des trois équations (1), (2), (3) en $D$, $E$, $F$.`)),
    utiliseCours(b, fx("On soustrait les équations deux à deux : $F$ disparaît, il reste un système de deux équations en $D$ et $E$"), COURS_CERCLES),
    calcul(b, [...sys.lignes, ligne(`F=${lq(F)}`, "on remonte dans (1)")], fx("(4) = (1) − (2) et (5) = (1) − (3) :")),
    resultat(b, fx(`$D=${e.D}$, $E=${e.E}$, $F=${e.F}$ : le cercle a pour équation $${latexPoly(polySystemeCercle(e), ["x", "y"])}=0$.`)),
    utiliseCours(c, fx("On complète les carrés : $\\Omega\\left(-\\frac{D}{2}\\,;-\\frac{E}{2}\\right)$ et $r^2=\\frac{D^2}{4}+\\frac{E^2}{4}-F$"), COURS_CERCLES),
    calcul(c, [ligne(`\\Omega=\\left(-\\frac{${parQ(q(e.D))}}{2}\\,;-\\frac{${parQ(q(e.E))}}{2}\\right)=${lp(e.centre)}`), ligne(`r^2=\\frac{${parQ(q(e.D))}^2}{4}+\\frac{${parQ(q(e.E))}^2}{4}-${parQ(q(e.F))}=${lq(e.r2)}`), ...lignesRayon(e.r2)]),
    avecFigure(resultat(c, fx(`Centre $${nomPt("\\Omega", e.centre)}$, rayon $r=${latexRacine(e.r2)}$ ; équation $${eqCercle(e.centre, e.r2)}$.`)), figure(e)),
    verification(c, fx(`$\\Omega A^2=${lq(dist2(e.centre, e.A))}=r^2$ : $A$ est bien sur le cercle.`)),
    piege(c, fx("Le centre a pour coordonnées $-\\frac{D}{2}$ et $-\\frac{E}{2}$ (signes opposés à ceux de $D$ et $E$), et $r^2$ n'est pas le rayon.")),
  ];
}
function polySystemeCercle(e: Extract<E, { famille: "A" }>) {
  // x² + y² + Dx + Ey + F (polynôme en x, y), pour l'écrire avec `latexPoly`.
  const m = new Map<string, Q>();
  m.set("x:2", q(1));
  m.set("y:2", q(1));
  if (e.D) m.set("x:1", q(e.D));
  if (e.E) m.set("y:1", q(e.E));
  if (e.F) m.set("", q(e.F));
  return m;
}

function lignesMediatrice(A: Pt, B: Pt): { lignes: LigneCalcul[]; M: Pt } {
  const M = milieu(A, B);
  const nx = qSub(B.x, A.x);
  const ny = qSub(B.y, A.y);
  const r = lignesDroiteNormale(M, nx, ny, [{ type: "texte", valeur: "passe par M, vecteur normal " }, { type: "latex", valeur: `\\overrightarrow{AB}=${vecteur(nx, ny)}` }]);
  return { lignes: [ligne(`M=${lp(M)}`, "milieu de [AB]"), ...r.lignes], M };
}

function corrigeB(e: Extract<E, { famille: "B" }>): EtapeCorrection[] {
  const a = L(e, "bNombre");
  const ab2 = dist2(e.A, e.B);
  const quart = qDiv(ab2, q(4));
  const comp = e.verdict === 2 ? ">" : e.verdict === 1 ? "=" : "<";
  const out: EtapeCorrection[] = [
    utiliseCours(a, fx("Le centre est sur la médiatrice de $[AB]$, à la distance $r$ de $A$ ; il existe s'il y a un point de la médiatrice à cette distance : on compare $r$ à $\\frac{AB}{2}$ (la plus petite distance de $A$ à un point de la médiatrice)"), COURS_CERCLES),
    calcul(a, [
      ligne(`AB^2=${parQ(qSub(e.B.x, e.A.x))}^2+${parQ(qSub(e.B.y, e.A.y))}^2=${lq(ab2)}`, "carré de la distance de deux points"),
      ligne(`\\left(\\frac{AB}{2}\\right)^2=\\frac{${lq(ab2)}}{4}=${lq(quart)}`),
      ligne(`r^2=${lq(e.r2)}${comp}${lq(quart)}`, "on compare les carrés (nombres positifs)"),
    ]),
  ];
  const conclusion = e.verdict === 2 ? "Deux cercles conviennent." : e.verdict === 1 ? "Un seul cercle convient : celui de diamètre $[AB]$." : "Aucun cercle ne convient : aucun point de la médiatrice n'est à la distance $r$ de $A$.";
  if (e.verdict === 0) {
    out.push(avecFigure(resultat(a, fx(`$r${comp}\\frac{AB}{2}$. ${conclusion}`)), figure(e)));
    out.push(piege(a, fx("Conclure trop vite qu'il y a toujours deux cercles : il faut d'abord comparer $r$ à $\\frac{AB}{2}$.")));
    return out;
  }
  out.push(resultat(a, fx(`$r${comp}\\frac{AB}{2}$. ${conclusion}`)));
  const b = L(e, "bMediatrice");
  const c = L(e, "bCentres");
  const med = lignesMediatrice(e.A, e.B);
  const M = med.M;
  // Point de la médiatrice : M + λ·u, u directeur de la médiatrice (perpendiculaire à AB).
  const v = { x: qDiv(qSub(e.B.x, e.A.x), q(2)), y: qDiv(qSub(e.B.y, e.A.y), q(2)) };
  const u = { x: qNeg(qSub(e.B.y, e.A.y)), y: qSub(e.B.x, e.A.x) };
  const g = gcdQ(u.x, u.y);
  const uu = { x: qDiv(u.x, g), y: qDiv(u.y, g) };
  const u2 = qAdd(qMul(uu.x, uu.x), qMul(uu.y, uu.y));
  const v2 = qAdd(qMul(v.x, v.x), qMul(v.y, v.y));
  const l2 = qDiv(qSub(e.r2, v2), u2);
  const lambda = Math.round(Math.sqrt(qNum(l2)));
  out.push(
    utiliseCours(b, fx("La médiatrice de $[AB]$ passe par le milieu $M$ de $[AB]$ et admet $\\overrightarrow{AB}$ comme vecteur normal"), COURS_CERCLES),
    calcul(b, med.lignes),
    resultat(b, fx(`Médiatrice : $${ld(e.mediatrice)}$.`)),
    utiliseCours(c, fx("Un centre $\\Omega$ est un point de la médiatrice tel que $\\Omega A=r$ ; on écrit les points de la médiatrice $M+\\lambda\\vec u$, puis Pythagore dans le triangle $AM\\Omega$, rectangle en $M$"), COURS_CERCLES),
    calcul(c, [
      ligne(`\\vec u=${vecteur(uu.x, uu.y)}`, "vecteur directeur de la médiatrice (perpendiculaire à AB)"),
      ligne(`\\Omega A^2=MA^2+M\\Omega^2=${lq(v2)}+${lq(u2)}\\,\\lambda^2`, "Pythagore : (MA) ⊥ (MΩ)"),
      ligne(`${lq(v2)}+${lq(u2)}\\,\\lambda^2=${lq(e.r2)}`, "ΩA² = r²"),
      ligne(`\\lambda^2=${lq(l2)}`),
      ...(e.verdict === 2
        ? [ligne(`\\lambda=${lambda}\\ \\text{ou}\\ \\lambda=-${lambda}`), ligne(`\\Omega_1=M+${lambda === 1 ? "" : lambda}\\vec u=${lp(e.centres[0])}`), ligne(`\\Omega_2=M-${lambda === 1 ? "" : lambda}\\vec u=${lp(e.centres[1])}`)]
        : [ligne(`\\lambda=0`), ligne(`\\Omega=M=${lp(M)}`)]),
    ]),
  );
  const eqs = e.centres.map((ce) => eqCercle(ce, e.r2));
  out.push(
    avecFigure(
      resultat(
        c,
        e.verdict === 2
          ? fx(`Centres $${nomPt("\\Omega_1", e.centres[0])}$ et $${nomPt("\\Omega_2", e.centres[1])}$ ; cercles $${eqs[0]}$ et $${eqs[1]}$.`)
          : fx(`Centre $${nomPt("\\Omega", M)}$, le milieu de $[AB]$ ; cercle $${eqs[0]}$.`),
      ),
      figure(e),
    ),
  );
  out.push(piege(c, fx(e.verdict === 2 ? "N'en donner qu'un : $\\lambda^2$ a deux racines opposées, les deux centres sont symétriques par rapport à $M$." : "Chercher deux centres : ici $r=\\frac{AB}{2}$, le seul centre possible est le milieu de $[AB]$.")));
  return out;
}

function gcdQ(a: Q, b: Q): Q {
  let x = Math.abs(qNum(a));
  let y = Math.abs(qNum(b));
  while (y) [x, y] = [y, x % y];
  return q(x || 1);
}
function corrigeC(e: Extract<E, { famille: "C" }>): EtapeCorrection[] {
  const a = L(e, "cMediatrice");
  const b = L(e, "cCentre");
  const c = L(e, "cEquation");
  const med = lignesMediatrice(e.A, e.B);
  const inter = lignesIntersection(e.mediatrice, e.d);
  return [
    utiliseCours(a, fx("Le centre est à égale distance de $A$ et de $B$ : il est sur la médiatrice de $[AB]$, qui passe par le milieu $M$ et admet $\\overrightarrow{AB}$ comme vecteur normal"), COURS_CERCLES),
    calcul(a, med.lignes),
    resultat(a, fx(`Médiatrice : $${ld(e.mediatrice)}$.`)),
    utiliseCours(b, fx("Le centre est à la fois sur la médiatrice de $[AB]$ et sur $d$ : on résout le système de leurs équations"), COURS_CERCLES),
    calcul(b, inter.lignes),
    resultat(b, fx(`$${nomPt("\\Omega", e.centre)}$.`)),
    utiliseCours(c, fx("Cercle de centre $\\Omega$ et de rayon $r$ : $(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2$, avec $r^2=\\Omega A^2$"), COURS_CERCLES),
    calcul(c, [ligne(`r^2=\\Omega A^2=${parQ(qSub(e.A.x, e.centre.x))}^2+${parQ(qSub(e.A.y, e.centre.y))}^2=${lq(e.r2)}`), ligneEquation(e.centre, e.r2)]),
    avecFigure(resultat(c, fx(`$${eqCercle(e.centre, e.r2)}$ (centre $${nomPt("\\Omega", e.centre)}$, rayon $${latexRacine(e.r2)}$).`)), figure(e)),
    verification(c, fx(`$\\Omega B^2=${lq(dist2(e.centre, e.B))}=r^2$ : $B$ est aussi sur le cercle.`)),
    piege(c, fx("Le second membre est $r^2$, pas $r$.")),
  ];
}

function corrigeD(e: Extract<E, { famille: "D" }>): EtapeCorrection[] {
  const a = L(e, "dEquationK");
  const b = L(e, "dCentreRayon");
  const c = L(e, "dEquation");
  const abs = e.axe === "abscisses";
  const centreK = abs ? `\\Omega(${lq(e.T.x)}\\,;k)` : `\\Omega(k\\,;${lq(e.T.y)})`;
  const dxA = abs ? `${parQ(qSub(e.A.x, e.T.x))}^2` : `(${lq(e.A.x)}-k)^2`;
  const dyA = abs ? `(${lq(e.A.y)}-k)^2` : `${parQ(qSub(e.A.y, e.T.y))}^2`;
  const poly = `${latexPoly(polyEquationK(e), ["k"])}=0`;
  const kc = polyEquationK(e).get("k:1") ?? q(0);
  const k0 = polyEquationK(e).get("") ?? q(0);
  const rAbs = q(Math.abs(Number(e.k.n)), e.k.d);
  return [
    utiliseCours(a, fx(`Un cercle tangent à l'axe des ${abs ? "abscisses" : "ordonnées"} en $T$ a son centre sur la perpendiculaire à l'axe en $T$, et son rayon est $\\Omega T=|k|$ ; il passe par $A$ : $\\Omega A^2=k^2$`), COURS_CERCLES),
    calcul(a, [ligne(`${dxA}+${dyA}=k^2`, [{ type: "texte", valeur: "avec " }, { type: "latex", valeur: centreK }]), ligne(poly, "on développe : les k² s'annulent")]),
    resultat(a, fx(`$${poly}$.`)),
    utiliseCours(b, fx("Une équation du premier degré en $k$ ; le rayon est $|k|$"), COURS_CERCLES),
    calcul(b, [ligne(`${lq(kc)}k=${lq(qNeg(k0))}`), ligne(`k=${lq(e.k)}`, `on divise par ${lq(kc).replace("-", "−")}`)]),
    resultat(b, fx(`$${nomPt("\\Omega", e.centre)}$ et $r=|k|=${lq(rAbs)}$.`)),
    utiliseCours(c, fx("Cercle de centre $\\Omega$ et de rayon $r$ : $(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2$"), COURS_CERCLES),
    calcul(c, [ligneEquation(e.centre, e.r2)]),
    avecFigure(resultat(c, fx(`$${eqCercle(e.centre, e.r2)}$.`)), figure(e)),
    verification(c, fx(`$T$ et $A$ vérifient l'équation.`)),
    piege(c, fx("Un rayon est positif : $r=|k|$, même quand $k$ est négatif.")),
  ];
}

function lignesCotes(t: DonneesTriangle): LigneCalcul[] {
  const un = (nom: string, cote: string, P1: Pt, P2: Pt, v: number) => ligne(`${nom}=${cote}=\\sqrt{${parQ(qSub(P2.x, P1.x))}^2+${parQ(qSub(P2.y, P1.y))}^2}=\\sqrt{${v * v}}=${v}`);
  return [un("a", "BC", t.B, t.C, t.a), un("b", "CA", t.C, t.A, t.b), un("c", "AB", t.A, t.B, t.c)];
}

function poids(e: ExerciceCerclesG | null): [number, number, number] {
  if (!e || e.mode === "inscrit") return [1, 1, 1];
  return e.sommet === "A" ? [-1, 1, 1] : e.sommet === "B" ? [1, -1, 1] : [1, 1, -1];
}

function lignesCentrePondere(t: DonneesTriangle, nom: string, w: [number, number, number], centre: Pt): LigneCalcul[] {
  const [wa, wb, wc] = [w[0] * t.a, w[1] * t.b, w[2] * t.c];
  const s = wa + wb + wc;
  const k = (c: "x" | "y") => `${wa}\\cdot ${parQ(t.A[c])}${wb < 0 ? "" : "+"}${wb}\\cdot ${parQ(t.B[c])}${wc < 0 ? "" : "+"}${wc}\\cdot ${parQ(t.C[c])}`;
  return [ligne(`x_{${nom}}=\\dfrac{${k("x")}}{${s}}=${lq(centre.x)}`, "moyenne pondérée des abscisses"), ligne(`y_{${nom}}=\\dfrac{${k("y")}}{${s}}=${lq(centre.y)}`, "moyenne pondérée des ordonnées")];
}

function lignesAire(t: DonneesTriangle): LigneCalcul[] {
  const u = { x: qSub(t.B.x, t.A.x), y: qSub(t.B.y, t.A.y) };
  const v = { x: qSub(t.C.x, t.A.x), y: qSub(t.C.y, t.A.y) };
  return [ligne(`\\text{Aire}=\\frac{1}{2}\\left|${parQ(u.x)}\\cdot ${parQ(v.y)}-${parQ(u.y)}\\cdot ${parQ(v.x)}\\right|=${lq(t.aire)}`, "aire d'un triangle par ses coordonnées")];
}

function corrigeEG(e: Extract<E, { famille: "E" | "G" }>): EtapeCorrection[] {
  const t = e.triangle;
  const g = e.famille === "G" ? e : null;
  const ex = g?.mode === "exinscrit";
  const nom = ex ? "J" : "I";
  const out: EtapeCorrection[] = [];
  if (g) {
    const l = L(e, "gSommets");
    const A = lignesIntersection(g.AB, g.CA);
    const B = lignesIntersection(g.AB, g.BC);
    const C = lignesIntersection(g.BC, g.CA);
    out.push(
      utiliseCours(l, fx("Chaque sommet est l'intersection des deux côtés qui y passent : $A=(AB)\\cap(CA)$, $B=(AB)\\cap(BC)$, $C=(BC)\\cap(CA)$"), COURS_CERCLES),
      calcul(l, [A.lignes[0], ligne(`A=${lp(A.point)}`, "on résout"), B.lignes[0], ligne(`B=${lp(B.point)}`, "on résout"), C.lignes[0], ligne(`C=${lp(C.point)}`, "on résout")]),
      resultat(l, fx(`$${nomPt("A", t.A)}$, $${nomPt("B", t.B)}$, $${nomPt("C", t.C)}$.`)),
    );
  }
  const lc = L(e, g ? "gCotes" : "eCotes");
  out.push(utiliseCours(lc, fx("Distance de deux points : $BC=\\sqrt{(x_C-x_B)^2+(y_C-y_B)^2}$"), COURS_CERCLES), calcul(lc, lignesCotes(t)), resultat(lc, fx(`$a=${t.a}$, $b=${t.b}$, $c=${t.c}$.`)));
  const lce = L(e, g ? "gCentre" : "eCentre");
  const w = poids(g);
  const formule = ex ? (g!.sommet === "A" ? "\\dfrac{-a\\,A+b\\,B+c\\,C}{-a+b+c}" : g!.sommet === "B" ? "\\dfrac{a\\,A-b\\,B+c\\,C}{a-b+c}" : "\\dfrac{a\\,A+b\\,B-c\\,C}{a+b-c}") : "\\dfrac{a\\,A+b\\,B+c\\,C}{a+b+c}";
  out.push(
    utiliseCours(lce, ex ? fx(`Le centre d'un cercle exinscrit est le point de concours de la bissectrice intérieure issue du sommet et des deux bissectrices extérieures : moyenne des sommets pondérée par les côtés opposés, celui du sommet compté négativement, $${nom}=${formule}$`) : fx(`Le centre du cercle inscrit est le point de concours des bissectrices : moyenne des sommets pondérée par les longueurs des côtés opposés, $I=${formule}$`), COURS_CERCLES),
    calcul(lce, lignesCentrePondere(t, nom, w, e.centre)),
    resultat(lce, fx(`$${nomPt(nom, e.centre)}$.`)),
  );
  const lr = L(e, g ? "gRayon" : "eRayon");
  const s = q(t.a + t.b + t.c, 2);
  const cote = ex ? (g!.sommet === "A" ? t.a : g!.sommet === "B" ? t.b : t.c) : 0;
  const lettreCote = ex ? (g!.sommet === "A" ? "a" : g!.sommet === "B" ? "b" : "c") : "";
  out.push(
    utiliseCours(lr, ex ? fx(`Aire du triangle $=r\\,(s-${lettreCote})$, avec $s$ le demi-périmètre`) : fx("Aire du triangle $=r\\,s$, avec $s$ le demi-périmètre"), COURS_CERCLES),
    calcul(lr, [...lignesAire(t), ligne(`s=\\frac{${t.a}+${t.b}+${t.c}}{2}=${lq(s)}`, "demi-périmètre"), ligne(ex ? `r=\\dfrac{\\text{Aire}}{s-${lettreCote}}=\\dfrac{${lq(t.aire)}}{${lq(qSub(s, q(cote)))}}=${lq(e.r)}` : `r=\\dfrac{\\text{Aire}}{s}=\\dfrac{${lq(t.aire)}}{${lq(s)}}=${lq(e.r)}`)]),
    avecFigure(resultat(lr, fx(`$r=${lq(e.r)}$ ; le cercle a pour équation $${eqCercle(e.centre, qMul(e.r, e.r))}$.`)), figure(e)),
    piege(lr, ex ? fx("Prendre la formule du cercle inscrit : pour l'exinscrit, le côté opposé au sommet est compté négativement (centre et rayon).") : fx("Prendre le centre de gravité (moyenne simple des sommets) : ici chaque sommet est pondéré par la longueur du côté opposé.")),
  );
  return out;
}

function corrigeF(e: Extract<E, { famille: "F" }>): EtapeCorrection[] {
  const a = L(e, "fDistance");
  const b = L(e, "fRayon2");
  const c = L(e, "fEquation");
  const d = e.d;
  const num = qAdd(qAdd(qMul(q(d.a), e.centre.x), qMul(q(d.b), e.centre.y)), q(d.c));
  const n2 = q(d.a * d.a + d.b * d.b);
  const sgn = (v: bigint) => (v < 0n ? "-" : "+");
  const abs = (v: bigint) => (v < 0n ? -v : v);
  return [
    utiliseCours(a, fx("Distance d'un point à la droite $ax+by+c=0$ : $\\mathrm{dist}(\\Omega\\,;d)=\\dfrac{|a\\,x_\\Omega+b\\,y_\\Omega+c|}{\\sqrt{a^2+b^2}}$"), COURS_CERCLES),
    calcul(a, [
      ligne(`\\mathrm{dist}(\\Omega\\,;d)=\\dfrac{|${d.a}\\cdot ${parQ(e.centre.x)}${sgn(d.b)}${abs(d.b)}\\cdot ${parQ(e.centre.y)}${sgn(d.c)}${abs(d.c)}|}{\\sqrt{${d.a * d.a}+${d.b * d.b}}}=\\dfrac{${lq(q(Math.abs(qNum(num))))}}{\\sqrt{${lq(n2)}}}`),
      ligne(`\\mathrm{dist}(\\Omega\\,;d)^2=${lq(e.dist2)}`, "on élève au carré"),
    ]),
    resultat(a, fx(`$\\mathrm{dist}(\\Omega\\,;d)=${latexRacine(e.dist2)}$.`)),
    utiliseCours(b, fx("Le pied $H$ de la perpendiculaire menée de $\\Omega$ à $d$ est le milieu de la corde ; Pythagore dans le triangle $\\Omega HM$ ($M$ extrémité de la corde) : $r^2=\\Omega H^2+\\left(\\frac{L}{2}\\right)^2$"), COURS_CERCLES),
    calcul(b, [ligne(`r^2=${lq(e.dist2)}+\\left(\\frac{${e.L}}{2}\\right)^2=${lq(e.dist2)}+${(e.L / 2) ** 2}=${lq(e.r2)}`)]),
    resultat(b, fx(`$r^2=${lq(e.r2)}$.`)),
    utiliseCours(c, fx("Cercle de centre $\\Omega$ et de rayon $r$ : $(x-x_\\Omega)^2+(y-y_\\Omega)^2=r^2$"), COURS_CERCLES),
    calcul(c, [ligneEquation(e.centre, e.r2)]),
    avecFigure(resultat(c, fx(`$${eqCercle(e.centre, e.r2)}$.`)), figure(e)),
    piege(c, fx("Dans Pythagore, c'est la moitié de la corde, $\\frac{L}{2}$, qui intervient, pas $L$.")),
  ];
}

export function correctionDetailleeCercles(e: E): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return finaliserCombinatoire(corrigeA(e));
    case "B":
      return finaliserCombinatoire(corrigeB(e));
    case "C":
      return finaliserCombinatoire(corrigeC(e));
    case "D":
      return finaliserCombinatoire(corrigeD(e));
    case "E":
    case "G":
      return finaliserCombinatoire(corrigeEG(e));
    case "F":
      return finaliserCombinatoire(corrigeF(e));
  }
}
