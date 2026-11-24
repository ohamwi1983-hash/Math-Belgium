import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceFonctionConditions } from "../../core5e/fonctionConditions";
import { fp, fpp, systemes } from "../../core5e/fonctionConditions";
import type { EquationAB } from "../../ui5e/ecrituresApplicationsDerivees";
import { decL, equationABL, pgcd } from "../../ui5e/ecrituresApplicationsDerivees";
import { parL, plusL, polyL } from "../../ui5e/ecrituresLimitesLotG";
import { factoriseeL, fppxL, fpxL, fxL, libelleNature, pointEtudieL, reponse, substitutionsSysteme, tangenteL } from "../../ui5e/formatFonctionConditions";

/**
 * Corrigé détaillé « comme au tableau » de `5gen69`, une lettre par écran : a) f(0) = d et f′(0) = c
 * lus sur les conditions directes ; b) les deux autres conditions substituées puis rangées en
 * équations en a et b ; c) le système résolu (une équation simplifiée, b exprimé et remplacé quand un
 * coefficient vaut ±1, sinon combinaison qui élimine b), vérification dans l'autre équation ;
 * d) f′(x) (f″(x)) avec les coefficients ; e) signe de f′ (f″) de part et d'autre du point, par la
 * forme factorisée et deux valeurs tests.
 */

type E = ExerciceFonctionConditions;
const t = texte;
const f = latex;

/** « 3\cdot(-2) », « (-2) » (coefficient 1), « -(-2) » (coefficient −1). */
function produitL(k: number, v: number): string {
  if (k === 1) return parL(v);
  if (k === -1) return `-${parL(v)}`;
  return `${k}\\cdot ${parL(v)}`;
}

/** « + 4b », « − b », … collé (terme en b d'une équation, après le terme en a). */
function termeBL(be: number): string {
  if (be === 0) return "";
  const abs = Math.abs(be);
  return `${be < 0 ? "-" : "+"}${abs === 1 ? "" : abs}b`;
}

/** Résolution pas à pas du système (E₁), (E₂) ; a et b solutions entières. */
export function lignesSysteme(e1: EquationAB, e2: EquationAB, a: number, b: number): LigneCalcul[] {
  const L: LigneCalcul[] = [];
  const simplifier = (eq: EquationAB, nom: string): EquationAB => {
    const g = pgcd(pgcd(eq.al, eq.be), eq.ga);
    if (g <= 1) return eq;
    const s = { al: eq.al / g, be: eq.be / g, ga: eq.ga / g };
    L.push(ligne(equationABL(s), `${nom} divisée par ${g}`));
    return s;
  };
  const E1 = simplifier(e1, "(E₁)");
  const E2 = simplifier(e2, "(E₂)");
  // Substitution quand un coefficient de b vaut ±1.
  const sub = Math.abs(E1.be) === 1 ? { s: E1, o: E2, ns: "(E₁)", no: "(E₂)" } : Math.abs(E2.be) === 1 ? { s: E2, o: E1, ns: "(E₂)", no: "(E₁)" } : null;
  if (sub) {
    // b = (γ − α a)/β avec β = ±1 : b = β(γ − α a).
    const k0 = sub.s.be * sub.s.ga;
    const ka = -sub.s.be * sub.s.al;
    const exprB = polyL([ka, k0], "a");
    L.push(ligne(`b=${exprB}`, `on isole b dans ${sub.ns}`));
    const al = sub.o.al;
    const be = sub.o.be;
    const avecPar = `(${exprB})`;
    const termeA = al === 0 ? "" : al === 1 ? "a" : al === -1 ? "-a" : `${al}a`;
    const termeB = be === 0 ? "" : `${be > 0 ? (termeA === "" ? "" : "+") : "-"}${Math.abs(be) === 1 ? "" : `${Math.abs(be)}\\cdot `}${avecPar}`;
    L.push(ligne(`${termeA}${termeB}=${sub.o.ga}`, `on remplace b dans ${sub.no}`));
    const ca = al + be * ka;
    const cst = be * k0;
    L.push(ligne(`${polyL([ca, cst], "a")}=${sub.o.ga}`, "on distribue et on réduit"));
    if (cst !== 0) L.push(ligne(`${ca === 1 ? "" : ca === -1 ? "-" : ca}a=${sub.o.ga - cst}`, cst > 0 ? `on retranche ${cst}` : `on ajoute ${-cst}`));
    if (ca !== 1) L.push(ligne(`a=${a}`, ca === -1 ? "on change les signes" : `on divise par ${ca}`));
    if (ka !== 0) {
      L.push(ligne(`b=${produitL(ka, a)}${plusL(k0)}`, "on remplace a"));
      L.push(ligne(`b=${b}`));
    }
    return L;
  }
  // Combinaison : on élimine b.
  const ppcm = (Math.abs(E1.be) * Math.abs(E2.be)) / pgcd(E1.be, E2.be);
  const k1 = ppcm / E1.be;
  const k2 = ppcm / E2.be;
  const S1 = { al: E1.al * k1, be: E1.be * k1, ga: E1.ga * k1 };
  const S2 = { al: E2.al * k2, be: E2.be * k2, ga: E2.ga * k2 };
  if (k1 !== 1) L.push(ligne(equationABL(S1), `(E₁) multipliée par ${k1 < 0 ? `(${k1})` : k1}`));
  if (k2 !== 1) L.push(ligne(equationABL(S2), `(E₂) multipliée par ${k2 < 0 ? `(${k2})` : k2}`));
  const D = S1.al - S2.al;
  const R = S1.ga - S2.ga;
  L.push(ligne(`${D === 1 ? "" : D === -1 ? "-" : D}a=${R}`, "on soustrait : b s'élimine"));
  if (D !== 1) L.push(ligne(`a=${a}`, D === -1 ? "on change les signes" : `on divise par ${D}`));
  // b par (E₁).
  L.push(ligne(`${produitL(E1.al, a)}${termeBL(E1.be)}=${E1.ga}`, "on remplace a dans (E₁)"));
  const reste = E1.ga - E1.al * a;
  if (E1.be !== 1) L.push(ligne(`${E1.be === -1 ? "-" : E1.be}b=${reste}`, E1.al * a >= 0 ? `on retranche ${E1.al * a}` : `on ajoute ${-E1.al * a}`));
  L.push(ligne(`b=${b}`, E1.be === 1 ? (E1.al * a >= 0 ? `on retranche ${E1.al * a}` : `on ajoute ${-E1.al * a}`) : E1.be === -1 ? "on change les signes" : `on divise par ${E1.be}`));
  return L;
}

function etapeA(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] = [ligne("f'(x)=3ax^2+2bx+c", "on dérive terme à terme"), ligne("f(0)=d"), ligne("f'(0)=c")];
  if (e.variante === "deuxTangentes") L.push(ligne("c=0", "tangente horizontale en 0 : pente nulle"), ligne(`d=${e.d}`, [t("le point "), f(`(0\\,;${e.d})`), t(" est sur la courbe")]));
  else L.push(ligne(`d=${e.d}`, [t("la tangente "), f(tangenteL(e)), t(" passe par "), f("(0\\,;f(0))")]), ligne(`c=${e.c}`, [t("pente de la tangente : "), f("f'(0)")]));
  return [
    utilise("a", [t("La tangente au point d'abscisse a a pour pente "), f("f'(a)"), t(" et passe par "), f("(a\\,;f(a))"), t(" ; en a = 0, tout se lit sur c et d (cours, § 2).")]),
    calcul("a", L),
    resultat("a", reponse(e, "directes")),
    piege("a", [t("Échanger c et d : "), f("d=f(0)"), t(" est l'ordonnée à l'origine de la tangente, "), f("c=f'(0)"), t(" sa pente.")]),
  ];
}

function etapeB(e: E): EtapeCorrection[] {
  const [s1, s2] = substitutionsSysteme(e);
  const [eq1, eq2] = systemes(e)[0]!;
  const L: LigneCalcul[] = [];
  if (e.variante === "inflexion") {
    L.push(ligne("f''(x)=6ax+2b", "on dérive f′"), ligne(`f''(${e.xs})=0`, "point d'inflexion"), ligne(s1, "on remplace x"), ligne(equationABL(eq1), "(E₁)"));
    L.push(ligne(`f(${e.xp})=${e.yp}`, "le point est sur la courbe"), ligne(s2, "on remplace c, d et x"), ligne(equationABL(eq2), "(E₂) : on calcule et on range"));
  } else {
    L.push(ligne(`f'(${e.xs})=0`, "tangente horizontale"), ligne(s1, e.variante === "deuxTangentes" ? "on remplace x (c = 0)" : "on remplace c et x"), ligne(equationABL(eq1), "(E₁)"));
    L.push(ligne(`f(${e.xs})=${e.yp}`, "le point est sur la courbe"), ligne(s2, "on remplace c, d et x"), ligne(equationABL(eq2), "(E₂) : on calcule et on range"));
  }
  return [
    utilise(
      "b",
      e.variante === "inflexion"
        ? [t("Point d'inflexion d'abscisse "), f("x_1"), t(" : "), f("f''(x_1)=0"), t(" (cours, § 4) ; point de la courbe : "), f("f(x)=y"), t(".")]
        : [t("Tangente horizontale en "), f("x_0"), t(" : "), f("f'(x_0)=0"), t(" (cours, § 2) ; point de la courbe : "), f("f(x_0)=y_0"), t(".")],
    ),
    calcul("b", L),
    resultat("b", reponse(e, "systeme")),
    piege("b", e.variante === "inflexion" ? [t("Écrire "), f("f'(x_1)=0"), t(" : un point d'inflexion n'a pas forcément une tangente horizontale.")] : [t("Échanger les rôles : la tangente horizontale porte sur "), f("f'"), t(", le point sur "), f("f"), t(".")]),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const [eq1, eq2] = systemes(e)[0]!;
  const autre = eq2;
  const verif = `${produitL(autre.al, e.a)}${autre.be === 0 ? "" : `${autre.be < 0 ? "-" : "+"}${Math.abs(autre.be) === 1 ? parL(e.b) : `${Math.abs(autre.be)}\\cdot ${parL(e.b)}`}`}=${autre.al * e.a + autre.be * e.b}`;
  return [
    utilise("c", [t("Un système de deux équations du premier degré à deux inconnues : on élimine une inconnue (substitution ou combinaison).")]),
    calcul("c", lignesSysteme(eq1, eq2, e.a, e.b), [f(`(E_1)\\ ${equationABL(eq1)}`), t(" et "), f(`(E_2)\\ ${equationABL(eq2)}`)]),
    resultat("c", reponse(e, "resolution")),
    verification("c", [t("Dans "), f("(E_2)"), t(" :")], [ligne(verif, "c'est bien le second membre")]),
  ];
}

function etapeD(e: E): EtapeCorrection[] {
  const L: LigneCalcul[] =
    e.variante === "inflexion"
      ? [ligne("f''(x)=6ax+2b"), ligne(`=6\\cdot ${parL(e.a)}\\,x+2\\cdot ${parL(e.b)}`, "on remplace a et b"), ligne(`=${fppxL(e)}`)]
      : [ligne("f'(x)=3ax^2+2bx+c"), ligne(`=3\\cdot ${parL(e.a)}\\,x^2+2\\cdot ${parL(e.b)}\\,x${plusL(e.c)}`, "on remplace a, b et c"), ligne(`=${fpxL(e)}`)];
  return [
    utilise("d", [t("On dérive "), f(`f(x)=${fxL(e)}`), t(e.variante === "inflexion" ? " deux fois (cours, § 3 et § 4)." : " terme à terme (cours, § 3).")]),
    calcul("d", L),
    resultat("d", reponse(e, "derivee")),
  ];
}

function etapeE(e: E): EtapeCorrection[] {
  const inf = e.variante === "inflexion";
  const g = inf ? fpp(e) : fp(e);
  const nom = inf ? "f''" : "f'";
  const pas = inf ? 1 : 0.5;
  const xg = e.xs - pas;
  const xd = e.xs + pas;
  const vg = g(xg);
  const vd = g(xd);
  const rel = (v: number) => (v > 0 ? ">0" : "<0");
  const L: LigneCalcul[] = [
    ligne(`${nom}(x)=${inf ? fppxL(e) : fpxL(e)}`),
    ligne(`=${factoriseeL(e)}`, "on factorise"),
    ligne(`${nom}(${decL(xg)})=${decL(vg)}${rel(vg)}`, "juste avant"),
    ligne(`${nom}(${decL(xd)})=${decL(vd)}${rel(vd)}`, "juste après"),
  ];
  const conclusion = inf
    ? [t(`${nom === "f''" ? "f″" : nom} passe de ${vg < 0 ? "−" : "+"} à ${vd < 0 ? "−" : "+"} : la courbe est ${libelleNature(e.nature, e)}, avec un point d'inflexion d'abscisse `), f(`${e.xs}`), t(".")]
    : e.nature === "palier"
      ? [t(`f′ garde le signe ${vg < 0 ? "−" : "+"} de part et d'autre : `), f(pointEtudieL(e)), t(" n'est ni un maximum ni un minimum (palier).")]
      : [t(`f′ passe de ${vg < 0 ? "−" : "+"} à ${vd < 0 ? "−" : "+"} : `), f(pointEtudieL(e)), t(` est ${libelleNature(e.nature, e)}.`)];
  return [
    utilise(
      "e",
      inf
        ? [t("Concave où "), f("f''<0"), t(", convexe où "), f("f''>0"), t(" ; un point d'inflexion exige un changement de signe de "), f("f''"), t(" (cours, § 4).")]
        : [t("Un zéro de "), f("f'"), t(" est un extremum seulement si "), f("f'"), t(" y change de signe : de + à −, maximum ; de − à +, minimum (cours, § 5).")],
    ),
    calcul("e", L),
    resultat("e", conclusion),
    verification("e", [t("La fonction trouvée vérifie toutes les conditions : "), f(`f(x)=${fxL(e)}`), t(".")]),
    piege("e", inf ? [t("Lire la concavité sur le signe de "), f("f'"), t(" au lieu de "), f("f''"), t(".")] : [t("Conclure « extremum » dès que "), f("f'(x_0)=0"), t(" : il faut encore un changement de signe.")]),
  ];
}

export function correctionDetailleeFonctionConditions(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e), ...etapeD(e), ...etapeE(e)];
}
