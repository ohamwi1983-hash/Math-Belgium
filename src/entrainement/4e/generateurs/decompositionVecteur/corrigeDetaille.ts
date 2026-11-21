import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceComposantes, ExerciceDecompositionVecteur, ExerciceGraphique, Vec2 } from "../../core/decompositionVecteur.types";
import { combinaison, det, lignesSysteme, nettoyer, pointDe } from "../../moteur/modeleDecompositionVecteur";
import { construireFigureDecomposition } from "../../ui/figureDecompositionVecteur";
import { U, V, W, combinaisonLatex, composantesLatex, nombreLatex, planResolution, reponseAttendueFragments, sommeTermes, systemeOptionLatex, termeSansSigneSigne, vecteurPoints } from "../../ui/formatDecompositionVecteur";
import { COURS_COLINEARITE, COURS_DECOMPOSER, COURS_MULTIPLE, COURS_MULTIPLE_REPERE, COURS_SOMME_REPERE, col, finaliserVecteurs } from "../../ui/corrigeVecteurs2";

/**
 * Corrigé détaillé « comme au tableau » de gen82 « Décomposer un vecteur selon deux directions » —
 * règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`moteur/modeleDecompositionVecteur.ts::nombreEcrans`) ;
 * partagé par l'adaptateur papier et l'appli. Figure : point M lu sur la construction (parallèles en
 * pointillés), coefficients lus sur la figure ; composantes : système, résolution une opération par
 * ligne, vérification en composantes.
 */

type E = ExerciceDecompositionVecteur;

/** Nombre entre parenthèses s'il est négatif (substitution). */
function np(x: number): string {
  return nettoyer(x) < 0 ? `(${nombreLatex(x)})` : nombreLatex(x);
}

// ---------------------------------------------------------------------------------------------
// Famille graphique
// ---------------------------------------------------------------------------------------------

function longueurTexte(m: number): string {
  if (m === 1) return "la même longueur que";
  if (m === 0.5) return "la moitié de la longueur de";
  if (m === 2) return "le double de la longueur de";
  if (m === 3) return "le triple de la longueur de";
  return `${String(m).replace(".", ",")} fois la longueur de`;
}

function piegeGraphique(e: ExerciceGraphique): EtapeCorrection {
  if (e.a === 0 || e.b === 0) {
    return piege(e.a === 0 ? "b" : "c", [texte("Un coefficient nul n'est pas une erreur : "), latex(U), texte(" est parallèle à "), latex(e.a === 0 ? W : V), texte(", et "), latex(`${U} = ${combinaisonLatex(e.a, e.b)}`), texte(".")]);
  }
  if (e.a < 0 || e.b < 0) {
    const negA = e.a < 0;
    return piege(negA ? "b" : "c", [
      latex(negA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite)),
      texte(" va à contresens de "),
      latex(negA ? V : W),
      texte(" : son coefficient est négatif. Oublier le signe donnerait "),
      latex(`${U} = ${combinaisonLatex(Math.abs(e.a), Math.abs(e.b))}`),
      texte(", faux."),
    ]);
  }
  if (e.a === e.b) {
    return piege("a", [texte("Mener des parallèles aux deux directions, pas des perpendiculaires : une projection perpendiculaire ne donne pas un parallélogramme, et "), latex(U), texte(" ne serait pas la somme des deux vecteurs obtenus.")]);
  }
  return piege("a", [
    texte("Mener des parallèles, pas des perpendiculaires ; et ne pas échanger les directions : le coefficient de "),
    latex(V),
    texte(" se lit sur le côté parallèle à "),
    latex(V),
    texte(". Écrire "),
    latex(`${U} = ${combinaisonLatex(e.b, e.a)}`),
    texte(" serait faux."),
  ]);
}

function etapePoint(e: ExerciceGraphique): EtapeCorrection[] {
  const P = e.origine;
  const Q = e.extremite;
  const M = e.pointM;
  const lignes: LigneCalcul[] = [ligne(`M=${M}`, `les parallèles à v menée par ${P} et à w menée par ${Q} se coupent en ${M} (pointillés)`)];
  if (M === P) lignes.push(ligne(`${vecteurPoints(P, "M")}=\\vec{0}`, `M = ${P} : u est porté par la seule direction de w`));
  else if (M === Q) lignes.push(ligne(`${vecteurPoints("M", Q)}=\\vec{0}`, `M = ${Q} : u est porté par la seule direction de v`));
  else lignes.push(ligne(`${vecteurPoints(P, Q)}=${vecteurPoints(P, M)}+${vecteurPoints(M, Q)}`, "relation de Chasles"));
  return [
    utilise("a", [
      texte(`Méthode du parallélogramme, en sens inverse ${COURS_DECOMPOSER} : on cherche M tel que `),
      latex(vecteurPoints(P, "M")),
      texte(" ait la direction de "),
      latex(V),
      texte(" et "),
      latex(vecteurPoints("M", Q)),
      texte(" celle de "),
      latex(W),
      texte(` ; M est sur la parallèle à `),
      latex(V),
      texte(` menée par ${P} et sur la parallèle à `),
      latex(W),
      texte(` menée par ${Q}.`),
    ]),
    calcul("a", lignes),
    { ...resultat("a", reponseAttendueFragments(e, 0)), figureHtml: construireFigureDecomposition(e, { theme: "papier", construction: true }) },
  ];
}

function etapeCoefficient(e: ExerciceGraphique, estA: boolean): EtapeCorrection[] {
  const l = estA ? "b" : "c";
  const coef = estA ? e.a : e.b;
  const nomCoef = estA ? "a" : "b";
  const vecNom = estA ? V : W;
  const nomCourt = estA ? "v" : "w";
  const de = estA ? e.origine : e.pointM;
  const vers = estA ? e.pointM : e.extremite;
  const seg = estA ? vecteurPoints(e.origine, "M") : vecteurPoints("M", e.extremite);
  const reel = vecteurPoints(de, vers);
  const direction = estA ? e.v : e.w;
  const lignes: LigneCalcul[] = [];
  if (de !== vers) lignes.push(ligne(`${seg}=${reel}`, `M = ${e.pointM}`));
  if (coef === 0) {
    lignes.push(ligne(`${seg}=\\vec{0}`, `M est confondu avec ${de}`), ligne(`=0${vecNom}`));
  } else if (e.famille === "quadrillage") {
    const p = pointDe(e, de);
    const q = pointDe(e, vers);
    const d: Vec2 = { x: q.i - p.i, y: q.j - p.j };
    lignes.push(
      ligne(`${reel}=${col(nombreLatex(d.x), nombreLatex(d.y))}`, "déplacements lus sur le quadrillage (cases)"),
      ligne(`=${nombreLatex(coef)}${col(nombreLatex(direction.x), nombreLatex(direction.y))}`, [texte("chaque composante de "), latex(vecNom), texte(` lue sur le quadrillage, multipliée par ${String(coef).replace(".", ",").replace("-", "−")}`)]),
      ligne(`=${termeSansSigneSigne(coef, vecNom)}`),
    );
  } else {
    const nb = Math.abs(coef);
    let mesure = `${de}${vers} a ${longueurTexte(nb)} ${nomCourt}`;
    if (e.famille === "reseau") {
      const p = pointDe(e, de);
      const q = pointDe(e, vers);
      const lg = Math.abs(q.i - p.i) + Math.abs(q.j - p.j);
      const lv = Math.abs(direction.x) + Math.abs(direction.y);
      mesure = `${lg} côté${lg > 1 ? "s" : ""} de case contre ${lv} pour ${nomCourt}`;
    }
    lignes.push(
      ligne(`\\|${reel}\\|=${nb === 1 ? "" : nombreLatex(nb)}\\|${vecNom}\\|`, `longueur lue sur la figure : ${mesure}`),
      ligne(`${reel}=${termeSansSigneSigne(coef, vecNom)}`, coef > 0 ? `même direction et même sens que ${nomCourt}` : `même direction que ${nomCourt}, sens contraire : coefficient négatif`),
    );
  }
  return [
    utilise(l, [
      texte("Le vecteur "),
      latex(`k${vecNom}`),
      texte(" a la direction de "),
      latex(vecNom),
      texte(` ; sa longueur vaut |k| fois celle de `),
      latex(vecNom),
      texte(` ; il a le même sens si k > 0, le sens contraire si k < 0 ${COURS_MULTIPLE}. On compare `),
      latex(seg),
      texte(" à "),
      latex(vecNom),
      texte(` : `),
      latex(`${seg}=${nomCoef}${vecNom}`),
      texte("."),
    ]),
    calcul(l, lignes),
    resultat(l, reponseAttendueFragments(e, estA ? 1 : 2)),
  ];
}

function verificationGraphique(e: ExerciceGraphique): EtapeCorrection | null {
  if (e.famille !== "quadrillage") return null;
  const P = pointDe(e, e.origine);
  const Q = pointDe(e, e.extremite);
  const u = { x: Q.i - P.i, y: Q.j - P.j };
  const av = { x: nettoyer(e.a * e.v.x), y: nettoyer(e.a * e.v.y) };
  const bw = { x: nettoyer(e.b * e.w.x), y: nettoyer(e.b * e.w.y) };
  return verification("c", [texte("En composantes (cases), "), latex(`${combinaisonLatex(e.a, e.b)}`), texte(" redonne bien "), latex(`${U}=${vecteurPoints(e.origine, e.extremite)}`), texte(" : ")], [
    ligne(`${combinaisonLatex(e.a, e.b)}=${col(`${nombreLatex(av.x)}+${np(bw.x)}`, `${nombreLatex(av.y)}+${np(bw.y)}`)}`, [texte("composantes de "), latex(termeSansSigneSigne(e.a, V)), texte(" et de "), latex(termeSansSigneSigne(e.b, W))]),
    ligne(`=${col(nombreLatex(u.x), nombreLatex(u.y))}`, "déplacement de u lu sur le quadrillage"),
  ]);
}

function correctionGraphique(e: ExerciceGraphique): EtapeCorrection[] {
  const etapes = [...etapePoint(e), ...etapeCoefficient(e, true), ...etapeCoefficient(e, false)];
  const v = verificationGraphique(e);
  if (v) etapes.push(v);
  return etapes;
}

// ---------------------------------------------------------------------------------------------
// Familles composantes et « possible ? »
// ---------------------------------------------------------------------------------------------

type Equation = [number, number, number];

function equationLatex(l: Equation): string {
  return `${sommeTermes([
    [l[0], "a"],
    [l[1], "b"],
  ]).replace(/ /g, "")}=${nombreLatex(l[2])}`;
}

/** u = av + bw en composantes, puis les deux équations (1) et (2). */
function lignesSysteme2(e: ExerciceComposantes): LigneCalcul[] {
  const [l1, l2] = lignesSysteme(e, "correct") as [Equation, Equation];
  const membre = (l: Equation) => sommeTermes([
    [l[0], "a"],
    [l[1], "b"],
  ]).replace(/ /g, "");
  return [
    ligne(`${col(nombreLatex(e.u.x), nombreLatex(e.u.y))}=a${col(nombreLatex(e.v.x), nombreLatex(e.v.y))}+b${col(nombreLatex(e.w.x), nombreLatex(e.w.y))}`, "u = av + bw, en composantes"),
    ligne(`=${col(membre(l1), membre(l2))}`, "on multiplie, puis on additionne composante par composante"),
    ligne(equationLatex(l1), "(1) : premières composantes égales"),
    ligne(equationLatex(l2), "(2) : secondes composantes égales"),
  ];
}

/** Équation à une inconnue « c·x = r » résolue : « x = r/c », « = valeur ». */
function lignesIsoler(coef: number, inconnue: string, second: number, valeur: number, justification: string): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${sommeTermes([[coef, inconnue]]).replace(/ /g, "")}=${nombreLatex(second)}`, justification)];
  if (coef !== 1) lignes.push(ligne(`${inconnue}=\\dfrac{${nombreLatex(second)}}{${nombreLatex(coef)}}`, `on divise par ${nombreLatex(coef).replace("-", "−")}`), ligne(`=${nombreLatex(valeur)}`));
  return lignes;
}

/** On remplace l'inconnue connue dans l'équation l, puis on résout pour l'autre. */
function lignesRemplacer(l: Equation, numero: number, connue: "a" | "b", valeur: number): LigneCalcul[] {
  const [ca, cb, c] = l;
  const autre = connue === "a" ? "b" : "a";
  const coefConnu = connue === "a" ? ca : cb;
  const coefAutre = connue === "a" ? cb : ca;
  const termeConnu = `${coefConnu === 1 ? "" : coefConnu === -1 ? "-" : `${nombreLatex(coefConnu)}\\cdot `}${np(valeur)}`;
  const termeAutre = coefAutre === 0 ? "" : sommeTermes([[coefAutre, autre]]).replace(/ /g, "");
  const gauche = connue === "a" ? `${termeConnu}${termeAutre === "" ? "" : termeAutre.startsWith("-") ? termeAutre : `+${termeAutre}`}` : `${termeAutre}${termeConnu.startsWith("-") ? termeConnu : `+${termeConnu}`}`;
  if (coefConnu === 0) return lignesIsoler(coefAutre, autre, c, nettoyer(c / coefAutre), `(${numero}) ne contient que ${autre}`);
  const produit = nettoyer(coefConnu * valeur);
  const reste = nettoyer(c - produit);
  const sol = nettoyer(reste / coefAutre);
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${nombreLatex(c)}`, `on remplace ${connue} par ${nombreLatex(valeur).replace("-", "−").replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")} dans (${numero})`)];
  const avecProduit = connue === "a" ? `${nombreLatex(produit)}${termeAutre.startsWith("-") ? termeAutre : `+${termeAutre}`}` : `${termeAutre}${produit < 0 ? nombreLatex(produit) : `+${nombreLatex(produit)}`}`;
  if (Math.abs(coefConnu) !== 1 || valeur < 0) lignes.push(ligne(`${avecProduit}=${nombreLatex(c)}`, "on calcule le produit"));
  lignes.push(...lignesIsoler(coefAutre, autre, reste, sol, produit === 0 ? "le terme connu est nul" : `on ${produit > 0 ? "retire" : "ajoute"} ${nombreLatex(Math.abs(produit)).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2")} aux deux membres`));
  return lignes;
}

function lignesResolution(e: ExerciceComposantes): LigneCalcul[] {
  const L = lignesSysteme(e, "correct") as [Equation, Equation];
  const plan = planResolution(e);
  const a = e.a!;
  const b = e.b!;
  if (plan.type === "directe") {
    const k = plan.equation!;
    const inc = plan.inconnue!;
    const l = L[k]!;
    const coef = inc === "a" ? l[0] : l[1];
    const val = inc === "a" ? a : b;
    return [...lignesIsoler(coef, inc, l[2], val, `(${k + 1}) ne contient que ${inc}`), ...lignesRemplacer(L[1 - k]!, 2 - k, inc, val)];
  }
  const m1 = plan.m1!;
  const m2 = plan.m2!;
  const mult = (l: Equation, m: number): Equation => [l[0] * m, l[1] * m, l[2] * m];
  const L1 = mult(L[0], m1);
  const L2 = mult(L[1], m2);
  const add = plan.operation === "addition";
  const A2 = nettoyer(add ? L1[0] + L2[0] : L1[0] - L2[0]);
  const R2 = nettoyer(add ? L1[2] + L2[2] : L1[2] - L2[2]);
  const lignes: LigneCalcul[] = [];
  if (m1 !== 1) lignes.push(ligne(equationLatex(L1), `(1) multipliée par ${m1}`));
  if (m2 !== 1) lignes.push(ligne(equationLatex(L2), `(2) multipliée par ${m2}`));
  lignes.push(...lignesIsoler(A2, "a", R2, a, add ? "on additionne membre à membre : b disparaît" : "on soustrait membre à membre : b disparaît"));
  lignes.push(...lignesRemplacer(L[0], 1, "a", a));
  return lignes;
}

function verificationSysteme(e: ExerciceComposantes, l: string): EtapeCorrection {
  const [, l2] = lignesSysteme(e, "correct") as [Equation, Equation];
  const a = e.a!;
  const b = e.b!;
  const t = (c: number, x: number) => (c === 0 ? "" : `${c === 1 ? "" : c === -1 ? "-" : `${nombreLatex(c)}\\cdot `}${np(x)}`);
  const ta = t(l2[0], a);
  const tb = t(l2[1], b);
  const g = ta === "" ? tb : tb === "" ? ta : `${ta}${tb.startsWith("-") ? tb : `+${tb}`}`;
  return verification(l, [texte("Le couple trouvé vérifie aussi l'équation (2) : ")], [ligne(`${g}=${nombreLatex(l2[2])}`, "(2) est vérifiée")]);
}

function etapesSystemeEtResolution(e: ExerciceComposantes, lettreSysteme: string, lettreResolution: string): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  const utiliseSysteme = utilise(lettreSysteme, [
    texte(`Deux vecteurs égaux ont les mêmes composantes ; multiplier un vecteur par un réel multiplie chacune de ses composantes ${COURS_MULTIPLE_REPERE} ; on additionne composante par composante ${COURS_SOMME_REPERE}.`),
  ]);
  if (lettreSysteme !== lettreResolution) {
    etapes.push(utiliseSysteme, calcul(lettreSysteme, lignesSysteme2(e)), resultat(lettreSysteme, [latex(systemeOptionLatex(e, "correct"))]));
    etapes.push(
      piege(lettreSysteme, [
        texte("Chaque équation n'utilise qu'UNE composante de chacun des trois vecteurs, avec a devant celle de "),
        latex(V),
        texte(" et b devant celle de "),
        latex(W),
        texte(". Écrire "),
        latex(systemeOptionLatex(e, e.ordreSystemes.includes("transpose") ? "transpose" : (e.ordreSystemes.find((o) => o !== "correct") ?? "transpose"))),
        texte(" serait faux."),
      ]),
    );
    etapes.push(utilise(lettreResolution, [texte("On résout le système : une inconnue isolée, ou éliminée en combinant les deux équations, puis on remplace dans une équation.")]));
  } else {
    etapes.push(
      utilise(lettreResolution, [
        texte(`On écrit `),
        latex(`${U}=a${V}+b${W}`),
        texte(` composante par composante ${COURS_MULTIPLE_REPERE} (deux vecteurs égaux ont les mêmes composantes), puis on résout le système obtenu.`),
      ]),
      calcul(lettreResolution, lignesSysteme2(e), [], "Système"),
    );
  }
  etapes.push(calcul(lettreResolution, lignesResolution(e), [], lettreSysteme === lettreResolution ? "Résolution" : "Calcul"), resultat(lettreResolution, reponseAttendueFragments(e, 1)), verificationSysteme(e, lettreResolution));
  return etapes;
}

function correctionComposantes(e: ExerciceComposantes): EtapeCorrection[] {
  const { av, bw } = combinaison(e);
  const a = e.a!;
  const b = e.b!;
  const ka = termeSansSigneSigne(a, V);
  const kb = termeSansSigneSigne(b, W);
  return [
    ...etapesSystemeEtResolution(e, "a", "b"),
    utilise("c", [texte(`Multiplier un vecteur par un réel, c'est multiplier chacune de ses composantes ${COURS_MULTIPLE_REPERE} ; la somme de deux vecteurs se calcule composante par composante ${COURS_SOMME_REPERE}.`)]),
    calcul("c", [
      ligne(`${ka}=${col(`${nombreLatex(a)}\\cdot ${np(e.v.x)}`, `${nombreLatex(a)}\\cdot ${np(e.v.y)}`)}`, "on multiplie chaque composante"),
      ligne(`=${composantesLatex(av)}`),
      ligne(`${kb}=${col(`${nombreLatex(b)}\\cdot ${np(e.w.x)}`, `${nombreLatex(b)}\\cdot ${np(e.w.y)}`)}`, "on multiplie chaque composante"),
      ligne(`=${composantesLatex(bw)}`),
      ligne(`${combinaisonLatex(a, b).replace(/ /g, "")}=${col(`${nombreLatex(av.x)}+${np(bw.x)}`, `${nombreLatex(av.y)}+${np(bw.y)}`)}`, "on additionne composante par composante"),
      ligne(`=${composantesLatex(e.u)}`, "ce sont les composantes de u"),
    ]),
    resultat("c", reponseAttendueFragments(e, 2)),
  ];
}

function correctionPossible(e: ExerciceComposantes): EtapeCorrection[] {
  const c = det(e.v, e.w);
  const p1 = nettoyer(e.v.x * e.w.y);
  const p2 = nettoyer(e.v.y * e.w.x);
  const etapes: EtapeCorrection[] = [
    utilise("a", [
      texte("La décomposition selon "),
      latex(V),
      texte(" et "),
      latex(W),
      texte(" est possible exactement quand ces deux vecteurs ne sont pas colinéaires ; critère de colinéarité "),
      latex("x_v\\cdot y_w-y_v\\cdot x_w"),
      texte(`, nul exactement pour des vecteurs colinéaires ${COURS_COLINEARITE}.`),
    ]),
    calcul("a", [
      ligne(`x_v\\cdot y_w-y_v\\cdot x_w=${np(e.v.x)}\\cdot ${np(e.w.y)}-${np(e.v.y)}\\cdot ${np(e.w.x)}`, "critère de colinéarité"),
      ligne(`=${nombreLatex(p1)}-${np(p2)}`, "on calcule les produits"),
      ligne(`=${nombreLatex(c)}`, c === 0 ? "nul : v et w sont colinéaires" : "non nul : v et w ne sont pas colinéaires"),
    ]),
    resultat("a", [...reponseAttendueFragments(e, 0), texte(e.possible ? " Les vecteurs " : " Les vecteurs "), latex(V), texte(" et "), latex(W), texte(e.possible ? " ne sont pas colinéaires." : " sont colinéaires.")]),
    piege("a", [
      texte("Vérifier d'abord que "),
      latex(V),
      texte(" et "),
      latex(W),
      texte(" ne sont pas colinéaires : s'ils le sont, les deux directions n'en font qu'une, et le système n'a pas une solution unique."),
    ]),
  ];
  if (e.possible) return [...etapes, ...etapesSystemeEtResolution(e, "b", "b")];
  const k = e.k!;
  const surX = e.v.x !== 0;
  const [cw, cv, autreW, autreV, axe, autreAxe] = surX ? [e.w.x, e.v.x, e.w.y, e.v.y, "x", "y"] : [e.w.y, e.v.y, e.w.x, e.v.x, "y", "x"];
  const cu = det(e.u, e.v);
  etapes.push(
    utilise("b", [
      latex(`${W}=k${V}`),
      texte(` : chaque composante de `),
      latex(W),
      texte(" vaut k fois la composante correspondante de "),
      latex(V),
      texte(` ${COURS_MULTIPLE_REPERE}. Toute combinaison `),
      latex(`a${V}+b${W}`),
      texte(" est alors colinéaire à "),
      latex(V),
      texte("."),
    ]),
    calcul("b", [
      ligne(`${nombreLatex(cw)}=k\\cdot ${np(cv)}`, [texte(`composantes en ${axe} : `), latex(`${axe}_w=k\\cdot ${axe}_v`)]),
      ligne(`k=\\dfrac{${nombreLatex(cw)}}{${nombreLatex(cv)}}`, `on divise par ${nombreLatex(cv).replace("-", "−")}`),
      ligne(`=${nombreLatex(k)}`),
      ligne(`k\\cdot ${autreAxe}_v=${nombreLatex(k)}\\cdot ${np(autreV)}`, `contrôle sur les composantes en ${autreAxe}`),
      ligne(`=${nombreLatex(nettoyer(k * autreV))}`, `c'est bien ${autreAxe}_w`),
    ], [], "Coefficient k"),
    calcul("b", [
      ligne(`x_u\\cdot y_v-y_u\\cdot x_v=${np(e.u.x)}\\cdot ${np(e.v.y)}-${np(e.u.y)}\\cdot ${np(e.v.x)}`, "critère de colinéarité de u et v"),
      ligne(`=${nombreLatex(nettoyer(e.u.x * e.v.y))}-${np(nettoyer(e.u.y * e.v.x))}`, "on calcule les produits"),
      ligne(`=${nombreLatex(cu)}`, "non nul : u n'est pas colinéaire à v"),
    ], [], "u et v"),
    resultat("b", [...reponseAttendueFragments(e, 1), texte(". Toute combinaison de "), latex(V), texte(" et "), latex(W), texte(" est colinéaire à "), latex(V), texte(", or "), latex(U), texte(" ne l'est pas : la décomposition est impossible.")]),
  );
  void autreW;
  return etapes;
}

function corrigeBrutDecompositionVecteur(e: E): EtapeCorrection[] {
  if (e.type === "graphique") {
    const etapes = correctionGraphique(e);
    const p = piegeGraphique(e);
    const fin = etapes.map((x) => x.sousQuestion).lastIndexOf(p.sousQuestion);
    etapes.splice(fin + 1, 0, p);
    return etapes;
  }
  return e.famille === "composantes" ? correctionComposantes(e) : correctionPossible(e);
}

export function correctionDetailleeDecompositionVecteur(e: E): EtapeCorrection[] {
  return finaliserVecteurs(corrigeBrutDecompositionVecteur(e));
}
