import type {
  ExerciceEquationsComplexes,
  ExerciceFamilleAAvecBarre,
  ExerciceFamilleASansBarre,
  ExerciceFamilleB,
  ExerciceFamilleC,
  ExerciceFamilleD,
  ExerciceFamilleE,
  ExerciceFamilleF,
} from "../../core6e/equationsComplexes.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { OPTIONS_EQUATION_B, OPTIONS_EQUATION_E, OPTIONS_SYSTEME_A } from "../../ui6e/formatEquationsComplexes";
import { type V, addV, coefV, cv, estNul, lignesCarre, lignesDivisionConjugue, lignesProduit, lignesQuotient, lignesRacineCarree, mono, mulV, nb, negV, plusV, pn, pnb, pv, somme, subV, suite, v } from "../../ui6e/corrigeComplexes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen36` (équations dans ℂ) — règle
 * `.claude/rules/feuilles-evaluations.md` (« Corrigé détaillé — comme au tableau »). Une étape par
 * écran (`phasesPourExercice`), valeurs calculées depuis les paramètres de l'instance ; partagé par
 * l'adaptateur papier et l'écran (étape échouée).
 */

const COURS = "(cours, point 3)";

const ensemble = (vs: V[]) => `S=\\left\\{${vs.map(cv).join(";\\ ")}\\right\\}`;
const egal = (a: V, b: V) => Math.abs(a.re - b.re) < 1e-9 && Math.abs(a.im - b.im) < 1e-9;

/** Quotient numérique (pour choisir le signe ± qui donne la racine attendue). */
function div(a: V, b: V): V {
  const n = b.re * b.re + b.im * b.im;
  return v((a.re * b.re + a.im * b.im) / n, (a.im * b.re - a.re * b.im) / n);
}

/** Substitution d'une solution dans a·z + b (vérification) : produit, puis somme. */
function lignesSubstitution(a: V, b: V, z: V, membre: string): LigneCalcul[] {
  const p = mulV(a, z);
  const lignes = [ligne(`${pv(a)}\\cdot ${pv(z)}${plusV(b)}=${cv(p)}${plusV(b)}`, membre)];
  if (!estNul(b)) lignes.push(ligne(`=${cv(addV(p, b))}`));
  return lignes;
}

function correctionASans(e: ExerciceFamilleASansBarre): EtapeCorrection[] {
  const den = subV(e.a, e.c);
  const num = subV(e.d, e.b);
  const lignes: LigneCalcul[] = [
    ligne(`${coefV(e.a, "z")}-${pv(e.c)}z=${cv(e.d)}-${pv(e.b)}`, "termes en z à gauche, constantes à droite"),
    ligne(`(${cv(den)})\\,z=${cv(num)}`, "on met z en évidence"),
    ...lignesQuotient(num, den),
  ];
  return [
    utilise("a", [
      texte(`Comme pour une équation réelle : les termes en `),
      latex("z"),
      texte(` d'un côté, les constantes de l'autre, puis on divise ${COURS}. Pour diviser par un complexe, on multiplie numérateur et dénominateur par son conjugué.`),
    ]),
    calcul("a", lignes),
    resultat("a", [latex(ensemble([e.z]))]),
    verification("a", [texte("On remplace "), latex("z"), texte(" par "), latex(cv(e.z)), texte(" dans les deux membres :")], [...lignesSubstitution(e.a, e.b, e.z, "membre de gauche"), ...lignesSubstitution(e.c, e.d, e.z, "membre de droite : même valeur ✓")]),
    piege("a", [texte("Diviser par un complexe, c'est multiplier numérateur et dénominateur par son conjugué ; on ne divise pas partie réelle par partie réelle.")]),
  ];
}

function correctionAAvec(e: ExerciceFamilleAAvecBarre): EtapeCorrection[] {
  const systeme = OPTIONS_SYSTEME_A(e).find((o) => o.id === "correct")!.latex;
  const z = v(e.x, e.y);
  const gauche = `${mono(e.a, "(x+yi)")}${e.b < 0 ? "" : "+"}${mono(e.b, "(x-yi)")}`;
  const ab = e.a + e.b;
  const amb = e.a - e.b;
  const zb = v(e.x, -e.y);
  return [
    utilise("a", [
      texte("On pose "),
      latex("z=x+yi"),
      texte(" (x et y réels), donc "),
      latex("\\bar z=x-yi"),
      texte(`. Deux complexes sont égaux quand leurs parties réelles et leurs parties imaginaires sont égales ${COURS}.`),
    ]),
    calcul("a", [
      ligne(`${gauche}=${cv(v(e.c, e.d))}`, "on remplace z et z̄"),
      ligne(`${somme([mono(e.a, "x"), mono(e.a, "yi"), mono(e.b, "x"), mono(-e.b, "yi")])}=${cv(v(e.c, e.d))}`, "on distribue"),
      ligne(`${somme([mono(ab, "x"), mono(amb, "yi")])}=${cv(v(e.c, e.d))}`, "on regroupe"),
    ]),
    resultat("a", [texte("On identifie parties réelles et parties imaginaires : "), latex(systeme)]),
    piege("a", [texte("Dans "), latex(`${mono(e.b, "\\bar z")}`), texte(", la partie imaginaire est "), latex(`${mono(-e.b, "y")}\\,i`), texte(" : le conjugué change le signe de y.")]),
    utilise("b", [texte("Chaque équation du système ne contient qu'une inconnue : on divise par son coefficient.")]),
    calcul("b", [ligne(`x=\\dfrac{${e.c}}{${ab}}=${e.x}`), ligne(`y=\\dfrac{${e.d}}{${amb}}=${e.y}`)]),
    resultat("b", [latex(`z=${cv(z)}`), texte(", donc "), latex(ensemble([z]))]),
    verification("b", [texte("On remplace "), latex("z"), texte(" et "), latex("\\bar z"), texte(" dans le membre de gauche :")], [
      ligne(`${mono(e.a, `(${cv(z)})`)}${e.b < 0 ? "" : "+"}${mono(e.b, `(${cv(zb)})`)}=${somme([monoTerme(mulV(v(e.a), z)), monoTerme(mulV(v(e.b), zb))])}`, "on distribue"),
      ligne(`=${cv(v(e.c, e.d))}`, "on regroupe : c'est le membre de droite ✓"),
    ]),
  ];
}

/** Numérateur « −b + δ » écrit en clair (sans « 0 + » si b est nul). */
function numerateurSomme(moinsB: V, d: V): string {
  return estNul(moinsB) ? cv(d) : `${cv(moinsB)}${plusV(d)}`;
}

/** Complexe écrit comme terme d'une somme (entre parenthèses s'il a deux parties). */
function monoTerme(a: V): string {
  const t = cv(a);
  return /.[+-]/.test(t) ? `(${t})` : t;
}

function correctionB(e: ExerciceFamilleB): EtapeCorrection[] {
  const developpee = OPTIONS_EQUATION_B(e).find((o) => o.id === "correct")!.latex;
  const affine = (c: number, c0: number) => somme([mono(c, "z"), mono(c0)]);
  const pgcd = (x: number, y: number): number => (y === 0 ? Math.abs(x) : pgcd(y, x % y));
  const g = pgcd(e.d, e.c);
  const [ni, di] = e.c < 0 ? [e.d / g, -e.c / g] : [-e.d / g, e.c / g];
  const valeurInterdite = di === 1 ? `${ni}` : `${ni < 0 ? "-" : ""}\\dfrac{${Math.abs(ni)}}{${di}}`;
  const den = subV(v(e.a), e.kc);
  const num = subV(e.kd, v(e.b));
  const k = e.k.re === 0 && e.k.im > 0 ? cv(e.k) : pv(e.k);
  return [
    utilise("a", [
      texte("Condition d'existence : le dénominateur n'est pas nul, "),
      latex(`${affine(e.c, e.d)}\\neq0`),
      texte(", c'est-à-dire "),
      latex(`z\\neq${valeurInterdite}`),
      texte(`. On multiplie les deux membres par le dénominateur ${COURS}.`),
    ]),
    calcul("a", [
      ligne(`${affine(e.a, e.b)}=${k}(${affine(e.c, e.d)})`, "on multiplie les deux membres par le dénominateur"),
      ligne(`${affine(e.a, e.b)}=${somme([coefV(e.kc, "z"), cv(e.kd)])}`, "on distribue"),
    ]),
    resultat("a", [latex(developpee)]),
    piege("a", [texte("Tout le dénominateur est multiplié par "), latex(cv(e.k)), texte(" : "), latex(`${k}(${affine(e.c, e.d)})`), texte(" donne deux termes.")]),
    utilise("b", [texte("Termes en "), latex("z"), texte(" d'un côté, constantes de l'autre, puis on divise (par le conjugué si le diviseur est complexe).")]),
    calcul("b", [
      ligne(`${somme([mono(e.a, "z"), coefV(negV(e.kc), "z")])}=${cv(e.kd)}-${pn(e.b)}`, "termes en z à gauche, constantes à droite"),
      ligne(`(${cv(den)})\\,z=${cv(num)}`, "on met z en évidence"),
      ...lignesQuotient(num, den),
    ]),
    resultat("b", [latex(ensemble([e.z]))]),
    verification("b", [texte("La solution n'est pas réelle : elle est bien différente de la valeur interdite "), latex(valeurInterdite), texte(".")]),
  ];
}

function correctionC(e: ExerciceFamilleC): EtapeCorrection[] {
  const s = Math.round(Math.sqrt(-e.delta));
  const [r1, r2] = e.racines;
  const deuxA = 2 * e.a;
  const avecMoins = v(-e.b / deuxA, -s / deuxA);
  const [zm, zp] = egal(avecMoins, r1) ? ["z_1", "z_2"] : ["z_2", "z_1"];
  const numerateur = (signe: string) => somme([mono(-e.b), mono(signe === "-" ? -s : s, "i")]);
  return [
    utilise("a", [texte(`Pour l'équation `), latex("az^2+bz+c=0"), texte(", le discriminant vaut "), latex("\\Delta=b^2-4ac"), texte(` ${COURS}.`)]),
    calcul("a", [ligne(`\\Delta=${pn(e.b)}^2-4\\cdot ${pn(e.a)}\\cdot ${pn(e.c)}`), ligne(`=${e.b * e.b}${4 * e.a * e.c < 0 ? "+" : "-"}${Math.abs(4 * e.a * e.c)}`, "on calcule b² et 4ac"), ligne(`=${e.delta}`)]),
    resultat("a", [latex(`\\Delta=${e.delta}`)]),
    utilise("b", [
      texte("Le discriminant est négatif : dans ℂ, "),
      latex(`\\Delta=${e.delta}=(${mono(s, "i")})^2`),
      texte(" et les deux solutions sont "),
      latex("z=\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}"),
      texte(` ${COURS}.`),
    ]),
    calcul("b", [
      ligne(`\\sqrt{|\\Delta|}=\\sqrt{${-e.delta}}=${s}`),
      ...[
        { nom: zm, signe: "-", z: egal(avecMoins, r1) ? r1 : r2 },
        { nom: zp, signe: "+", z: egal(avecMoins, r1) ? r2 : r1 },
      ]
        .sort((x, y) => x.nom.localeCompare(y.nom))
        .flatMap((x) => [ligne(`${x.nom}=\\dfrac{${numerateur(x.signe)}}{${deuxA}}`, x.signe === "-" ? "signe −" : "signe +"), ligne(`=${cv(x.z)}`, `on divise chaque partie par ${deuxA}`)]),
    ]),
    resultat("b", [latex(ensemble([r1, r2])), texte(" (deux solutions conjuguées)")]),
    verification("b", [texte("La somme des solutions vaut "), latex("-\\dfrac{b}{a}"), texte(" :")], [
      ligne(`z_1+z_2=(${cv(r1)})+(${cv(r2)})=${nb(r1.re + r2.re)}`),
      ligne(`-\\dfrac{b}{a}=-\\dfrac{${e.b}}{${e.a}}=${nb(-e.b / e.a)}`, "même valeur ✓"),
    ]),
    piege("b", [texte("Un discriminant négatif ne veut plus dire « pas de solution » : dans ℂ, "), latex("\\sqrt{\\Delta}"), texte(" se remplace par "), latex("i\\sqrt{|\\Delta|}"), texte(".")]),
  ];
}

/** Δ = b² − 4ac pour b, c complexes et a réel ou complexe, une transformation par ligne. */
function lignesDiscriminant(a: V, b: V, c: V): { lignes: LigneCalcul[]; delta: V } {
  const b2 = mulV(b, b);
  const ac4 = mulV(v(4 * a.re, 4 * a.im), c);
  const delta = subV(b2, ac4);
  const lignes: LigneCalcul[] = [];
  if (b.im !== 0 && b.re !== 0) lignes.push(...lignesCarre(b.re, b.im, "b^2"));
  else lignes.push(ligne(`b^2=${pv(b)}^2=${cv(b2)}`, b.im !== 0 ? "car i² = −1" : undefined));
  if (a.im === 0 && c.im === 0) lignes.push(ligne(`4ac=4\\cdot ${pn(a.re)}\\cdot ${pn(c.re)}=${cv(ac4)}`));
  else if (a.im === 0) lignes.push(ligne(`4ac=4\\cdot ${pn(a.re)}\\cdot ${pv(c)}=${cv(ac4)}`, "on multiplie chaque partie"));
  else lignes.push(ligne(`4ac=4\\cdot ${pv(a)}\\cdot ${pv(c)}`), ...lignesProduit(4 * a.re, 4 * a.im, c.re, c.im).map((l, i) => (i === 0 ? { ...l, latex: l.latex.slice(l.latex.indexOf("=")) } : l)));
  lignes.push(ligne(`\\Delta=b^2-4ac=${pv(b2)}-${pv(ac4)}`), ligne(`=${cv(delta)}`, "on regroupe"));
  return { lignes, delta };
}

function correctionD(e: ExerciceFamilleD): EtapeCorrection[] {
  const { lignes } = lignesDiscriminant(v(e.a), e.b, e.c);
  const [d1, d2] = e.racinesDelta;
  const [z1, z2] = e.racines;
  const moinsB = negV(e.b);
  const deuxA = 2 * e.a;
  const ligneSol = (nom: string, d: V, z: V): LigneCalcul[] => [
    ligne(`${nom}=\\dfrac{-b+\\delta}{2a}=\\dfrac{${numerateurSomme(moinsB, d)}}{${deuxA}}`, [texte("avec "), latex(`\\delta=${cv(d)}`)]),
    ligne(`=\\dfrac{${cv(addV(moinsB, d))}}{${deuxA}}`, "on regroupe"),
    ...(deuxA === 1 ? [] : [ligne(`=${cv(z)}`, `on divise chaque partie par ${deuxA}`)]),
  ];
  return [
    utilise("a", [texte("Discriminant de "), latex("az^2+bz+c=0"), texte(" : "), latex("\\Delta=b^2-4ac"), texte(`, ici un nombre complexe ${COURS}.`)]),
    calcul("a", lignes),
    resultat("a", [latex(`\\Delta=${cv(e.delta)}`)]),
    piege("a", [latex("b^2"), texte(" se calcule avec "), latex("i^2=-1"), texte(" : "), latex(`${pv(e.b)}^2\\neq${pnb(e.b.re)}^2+${pnb(e.b.im)}^2`), texte(".")]),
    utilise("b", [texte("On cherche "), latex("\\delta=x+yi"), texte(" tel que "), latex("\\delta^2=\\Delta"), texte(" : on identifie parties réelles, parties imaginaires et modules ("), latex("x^2+y^2=|\\Delta|"), texte(").")]),
    calcul("b", lignesRacineCarree(e.delta, d1.re > 0 || (d1.re === 0 && d1.im > 0) ? d1 : d2, "\\delta")),
    resultat("b", [texte("Les racines carrées de "), latex("\\Delta"), texte(" sont "), latex(cv(d1)), texte(" et "), latex(cv(d2)), texte(".")]),
    utilise("c", [texte("Les solutions sont "), latex("z=\\dfrac{-b\\pm\\delta}{2a}"), texte(", où "), latex("\\delta"), texte(" est une racine carrée de "), latex("\\Delta"), texte(".")]),
    calcul("c", [...ligneSol("z_1", d1, z1), ...ligneSol("z_2", d2, z2)]),
    resultat("c", [latex(ensemble([z1, z2]))]),
    verification("c", [texte("La somme des solutions vaut "), latex("-\\dfrac{b}{a}"), texte(" :")], [
      ligne(`z_1+z_2=(${cv(z1)})+(${cv(z2)})=${cv(addV(z1, z2))}`),
      ligne(`-\\dfrac{b}{a}=\\dfrac{${cv(moinsB)}}{${e.a}}=${cv(addV(z1, z2))}`, "même valeur ✓"),
    ]),
    piege("c", [latex("-b"), texte(" change le signe des deux parties de "), latex("b"), texte(" ; et les deux solutions ne sont pas conjuguées (coefficients complexes).")]),
  ];
}

function correctionE(e: ExerciceFamilleE): EtapeCorrection[] {
  const equationU = OPTIONS_EQUATION_E(e).find((o) => o.id === "correct")!.latex;
  const { lignes, delta } = lignesDiscriminant(e.a, e.b, e.c);
  const brute = mulV(e.a, subV(e.u1, e.u2));
  const dr = brute.re < 0 || (brute.re === 0 && brute.im < 0) ? negV(brute) : brute;
  const moinsB = negV(e.b);
  const deuxA = v(2 * e.a.re, 2 * e.a.im);
  const plusDonneU1 = egal(div(addV(moinsB, dr), deuxA), e.u1);
  const solU = (nom: string, d: V, u: V): LigneCalcul[] => {
    const n = addV(moinsB, d);
    const l: LigneCalcul[] = [ligne(`${nom}=\\dfrac{${numerateurSomme(moinsB, d)}}{${cv(deuxA)}}`), ligne(`=\\dfrac{${cv(n)}}{${cv(deuxA)}}`, "on regroupe")];
    if (estNul(n)) l.push(ligne("=0"));
    else if (deuxA.im === 0) l.push(ligne(`=${cv(u)}`, `on divise chaque partie par ${deuxA.re}`));
    else l.push(...suite(lignesDivisionConjugue(n.re, n.im, deuxA.re, deuxA.im)));
    return l;
  };
  const racinesDe = (u: V, r: V) => lignesRacineCarree(u, r, "z");
  return [
    utilise("a", [texte("L'équation ne contient que "), latex("z^4"), texte(" et "), latex("z^2"), texte(" (équation bicarrée) : on pose "), latex("u=z^2"), texte(", donc "), latex("z^4=u^2"), texte(` ${COURS}.`)]),
    calcul("a", [ligne("z^4=(z^2)^2=u^2", "puissance d'une puissance"), ligne(equationU, "on remplace z² par u")]),
    resultat("a", [latex(equationU)]),
    piege("a", [latex("z^4"), texte(" devient "), latex("u^2"), texte(" (et non "), latex("u^4"), texte(") : "), latex("z^4=(z^2)^2"), texte(".")]),
    utilise("b", [texte("Équation du second degré en "), latex("u"), texte(" : "), latex("\\Delta=b^2-4ac"), texte(", puis "), latex("u=\\dfrac{-b\\pm\\delta}{2a}"), texte(" avec "), latex("\\delta^2=\\Delta"), texte(".")]),
    calcul("b", [...lignes, ligne(`\\delta=${cv(dr)}`, [texte("car "), latex(`${pv(dr)}^2=${cv(delta)}`)]), ...solU(plusDonneU1 ? "u_1" : "u_2", dr, plusDonneU1 ? e.u1 : e.u2), ...solU(plusDonneU1 ? "u_2" : "u_1", negV(dr), plusDonneU1 ? e.u2 : e.u1)]),
    resultat("b", [latex(`u_1=${cv(e.u1)}`), texte(" et "), latex(`u_2=${cv(e.u2)}`)]),
    utilise("c", [texte("On revient à "), latex("z"), texte(" : "), latex("z^2=u"), texte(" a deux solutions opposées ; un réel négatif "), latex("-k"), texte(" a pour racines "), latex("\\pm i\\sqrt{k}"), texte(".")]),
    calcul("c", racinesDe(e.u1, e.racineU1), [latex(`z^2=u_1=${cv(e.u1)}`)], "Avec u₁"),
    calcul("c", racinesDe(e.u2, e.racineU2), [latex(`z^2=u_2=${cv(e.u2)}`)], "Avec u₂"),
    resultat("c", [latex(ensemble(e.racines)), texte(" (4 solutions)")]),
    verification("c", [texte("On élève une solution au carré : on doit retrouver "), latex("u_1"), texte(".")], lignesCarre(e.racineU1.re, e.racineU1.im)),
    piege("c", [texte("Chaque valeur de u donne deux solutions opposées en z ; et "), latex("z^2=-k"), texte(" (avec "), latex("k>0"), texte(") a pour solutions "), latex("\\pm i\\sqrt{k}"), texte(", jamais « aucune solution ».")]),
  ];
}

/** Division de Horner (synthétique) de `coefs` par (z − r) : coefficients du quotient puis reste. */
function lignesHorner(coefs: number[], r: number, noms: string[]): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${noms[0]}=${coefs[0]}`, "on recopie le premier coefficient")];
  let h = coefs[0];
  for (let i = 1; i < coefs.length; i++) {
    const suivant = coefs[i] + r * h;
    lignes.push(ligne(`${noms[i]}=${coefs[i]}+${pn(r)}\\cdot ${pn(h)}=${suivant}`, i === 1 ? "coefficient suivant + r × précédent" : undefined));
    h = suivant;
  }
  return lignes;
}

function polynome(coefs: number[]): string {
  const deg = coefs.length - 1;
  return somme(coefs.map((c, i) => mono(c, deg - i === 0 ? "" : deg - i === 1 ? "z" : `z^${deg - i}`)));
}

function valeurPolynome(coefs: number[], r: number, nom: string): LigneCalcul[] {
  const deg = coefs.length - 1;
  const termes = coefs.map((c, i) => {
    if (c === 0) return "";
    if (deg - i === 0) return `${c}`;
    const puissance = `${pn(r)}${deg - i > 1 ? `^${deg - i}` : ""}`;
    return c === 1 ? puissance : c === -1 ? `-${puissance}` : `${c}\\cdot ${puissance}`;
  });
  const valeurs = coefs.map((c, i) => mono(c * r ** (deg - i)));
  return [ligne(`${nom}(${r})=${somme(termes)}`, "on remplace z"), ligne(`=${somme(valeurs)}`, "on calcule chaque terme"), ligne("=0")];
}

function correctionF(e: ExerciceFamilleF): EtapeCorrection[] {
  const P = [e.a, e.b, e.c, e.d, e.e];
  const Q3 = e.quotientCubique;
  const Q2 = e.quotientQuadratique;
  const [A, B, C] = Q2;
  const delta = B * B - 4 * A * C;
  const s = Math.round(Math.sqrt(-delta));
  const zr = (r: number) => (r < 0 ? `z+${-r}` : `z-${r}`);
  const z3 = v(e.p, e.q);
  const z4 = v(e.p, -e.q);
  const avecMoins = v(-B / (2 * A), -s / (2 * A));
  return [
    utilise("a", [texte("Une racine entière d'un polynôme à coefficients entiers divise le terme constant "), latex(`${e.e}`), texte(` : on teste ces diviseurs jusqu'à trouver r tel que `), latex("P(r)=0"), texte(` ${COURS}.`)]),
    calcul("a", valeurPolynome(P, e.r1, "P")),
    resultat("a", [latex(`r_1=${e.r1}`), texte(" est racine")]),
    utilise("b", [texte("Si "), latex("P(r_1)=0"), texte(", alors "), latex("P(z)=(z-r_1)\\,Q(z)"), texte(" : on divise par la méthode de Horner (le dernier calcul, le reste, vaut 0).")]),
    calcul("b", [...lignesHorner(P, e.r1, ["q_3", "q_2", "q_1", "q_0", "R"])]),
    resultat("b", [latex(`P(z)=(${zr(e.r1)})(${polynome(Q3)})`)]),
    piege("b", [texte("On divise par "), latex(`z-r_1=${zr(e.r1)}`), texte(" : dans Horner, on multiplie par "), latex(`r_1=${e.r1}`), texte(" (et non par son opposé).")]),
    utilise("c", [texte("On recommence avec le quotient "), latex(`Q(z)=${polynome(Q3)}`), texte(" : on cherche une racine entière, puis on divise.")]),
    calcul("c", [...valeurPolynome(Q3, e.r2, "Q"), ...lignesHorner(Q3, e.r2, ["s_2", "s_1", "s_0", "R"])]),
    resultat("c", [latex(`r_2=${e.r2}`), texte(" et "), latex(`P(z)=(${zr(e.r1)})(${zr(e.r2)})(${polynome(Q2)})`)]),
    utilise("d", [texte("Il reste le facteur du second degré "), latex(`${polynome(Q2)}`), texte(" : "), latex("\\Delta=b^2-4ac<0"), texte(", solutions "), latex("\\dfrac{-b\\pm i\\sqrt{|\\Delta|}}{2a}"), texte(".")]),
    calcul("d", [
      ligne(`\\Delta=${pn(B)}^2-4\\cdot ${pn(A)}\\cdot ${pn(C)}`),
      ligne(`=${delta}`),
      ligne(`\\sqrt{|\\Delta|}=\\sqrt{${-delta}}=${s}`),
      ligne(`z=\\dfrac{${somme([mono(-B), mono(-s, "i")])}}{${2 * A}}=${cv(avecMoins)}`, "signe −"),
      ligne(`z=\\dfrac{${somme([mono(-B), mono(s, "i")])}}{${2 * A}}=${cv(v(avecMoins.re, -avecMoins.im))}`, "signe +"),
    ]),
    resultat("d", [latex(cv(z3)), texte(" et "), latex(cv(z4)), texte(" (conjuguées : coefficients réels)")]),
    utilise("e", [texte("Les solutions de "), latex("P(z)=0"), texte(" sont les racines de chacun des facteurs.")]),
    calcul("e", [ligne(`P(z)=(${zr(e.r1)})(${zr(e.r2)})(${polynome(Q2)})=0`, "produit nul : un des facteurs est nul")]),
    resultat("e", [latex(ensemble(e.racines))]),
    piege("e", [texte("Après chaque racine trouvée, on divise par "), latex("(z-r)"), texte(" avant de chercher la suivante ; ne pas oublier les deux racines réelles dans l'ensemble final.")]),
  ];
}

export function correctionDetailleeEquationsComplexes(e: ExerciceEquationsComplexes): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return e.sousType === "sansBarre" ? correctionASans(e) : correctionAAvec(e);
    case "B":
      return correctionB(e);
    case "C":
      return correctionC(e);
    case "D":
      return correctionD(e);
    case "E":
      return correctionE(e);
    case "F":
      return correctionF(e);
  }
}
