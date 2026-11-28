import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExercicePD } from "../../core6e/positionDroiteParametre";
import { abscisses, degreChute } from "../../core6e/positionDroiteParametre";
import { carreSurL, milliersL, nL, nPL, sgL, termeL } from "../../ui6e/outilsConiquesLotH2";
import { coefsEntiers, deltaEntier, deltaEntierEn, deltaL, equationXk0, equationXL, figurePD, LIBELLES_VERDICT, membreDroite, pointsL, valeursTangenceFr, valeursTangenceL } from "../../ui6e/formatPositionDroiteParametre";

/**
 * Corrigé détaillé « comme au tableau » de `6gen139`, une lettre par écran : a) substitution et équation
 * en x ordonnée ; b) coefficient de x², puis Δ(k) et Δ(k) = 0 (contrôle par la condition du cours) ;
 * c) signe de Δ(k₀) (ou équation du premier degré) et position ; d) points communs, avec la figure
 * (conique, d_{k₀}, tangentes de la famille en pointillés, asymptotes).
 */

type E = ExercicePD;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function lignesA(e: E): LigneCalcul[] {
  const c = e.conique;
  const md = membreDroite(e.m, "k");
  const sub = e.m === 0 ? "k" : `\\left(${md}\\right)`;
  if (c.type === "parabole") return [ligne(`${sub}^2=${nL(2 * c.p)}x`, [ft("on remplace "), L("y"), ft(" par "), L(md)]), ligne(equationXL(e), "on développe et on ordonne")];
  const a2 = c.a * c.a;
  const b2 = c.b * c.b;
  const s = c.type === "ellipse" ? "+" : "-";
  return [ligne(`${carreSurL("x", a2)}${s}${b2 === 1 ? `${sub}^2` : `\\dfrac{${sub}^2}{${b2}}`}=1`, [ft("on remplace "), L("y"), ft(" par "), L(md)]), ...(a2 * b2 === 1 ? [] : [ligne(`${b2 === 1 ? "" : b2}x^2${s}${a2 === 1 ? "" : a2}${sub}^2=${a2 * b2}`, `on multiplie par ${a2 * b2}`)]), ligne(equationXL(e), "on développe et on ordonne")];
}

function lignesB(e: E): LigneCalcul[] {
  const [A, B1, B0, C2, C0] = coefsEntiers(e);
  if (degreChute(e)) return [ligne(`\\text{coefficient de }x^2=0`, [ft("pour tout "), L("k")]), ligne(equationXL(e), "équation du premier degré")];
  const b = B0 === 0 ? `${nL(B1)}k` : `${nL(B1)}k${sgL(B0)}`;
  const cc = `${termeL(C2, "k^2", true)}${termeL(C0, "")}`;
  const { D2, D1, D0 } = deltaEntier(e);
  const lignes = [ligne(`\\Delta=\\left(${b}\\right)^2-4\\cdot ${nPL(A)}\\cdot\\left(${cc}\\right)`, [L("\\Delta=b^2-4ac")]), ligne(`\\Delta=${deltaL(e)}`, "on développe")];
  if (Math.abs(D2) < 1e-9) lignes.push(ligne(`\\Delta=0\\iff k=${nL(-D0 / D1)}`, "équation du premier degré en k"));
  else if (Math.abs(D1) < 1e-9) lignes.push(ligne(`\\Delta=0\\iff k^2=${nL(-D0 / D2)}`), ligne(valeursTangenceL(e)));
  else lignes.push(ligne(`\\Delta=0\\iff ${valeursTangenceL(e)}`, "second degré en k"));
  return lignes;
}

function verifB(e: E): FragmentConsigne[] {
  const c = e.conique;
  if (degreChute(e)) return [ft(c.type === "hyperbole" ? "La pente " : "La pente nulle : "), L(nL(e.m)), ft(c.type === "hyperbole" ? " est celle d'une asymptote, " : " les droites sont parallèles à l'axe de la parabole, "), L(c.type === "hyperbole" ? `\\pm\\dfrac{b}{a}=\\pm${nL(c.b / c.a)}` : "y=k"), ft(c.type === "hyperbole" ? " : aucune droite de la famille n'est tangente." : " : aucune n'est tangente.")];
  if (c.type === "parabole") return [ft("Condition du cours "), L("k=\\dfrac{p}{2m}"), ft(" : "), L(`\\dfrac{${nL(c.p)}}{2\\cdot ${nPL(e.m)}}=${nL(c.p / (2 * e.m))}`), ft(".")];
  const s = c.type === "ellipse" ? "+" : "-";
  const K2 = c.a * c.a * e.m * e.m + (c.type === "ellipse" ? 1 : -1) * c.b * c.b;
  return [ft("Condition du cours "), L(`k^2=a^2m^2${s}b^2=${c.a * c.a}\\cdot ${nPL(e.m * e.m)}${s}${c.b * c.b}=${nL(K2)}`), ft(".")];
}

function lignesC(e: E): LigneCalcul[] {
  if (degreChute(e)) {
    const { latex } = equationXk0(e);
    return [ligne(latex, [ft("pour "), L(`k=${nL(e.k0)}`)])];
  }
  const d = deltaEntierEn(e, e.k0);
  return [ligne(`\\Delta(${nL(e.k0)})=${milliersL(d)}`, [ft("on remplace "), L("k"), ft(" par "), L(nL(e.k0))]), ligne(`\\Delta${Math.abs(d) < 1e-9 ? "=0" : d > 0 ? ">0" : "<0"}`, Math.abs(d) < 1e-9 ? "racine double" : d > 0 ? "deux racines" : "aucune racine")];
}

function lignesD(e: E): LigneCalcul[] {
  const { A, B, C, latex } = equationXk0(e);
  const xs = abscisses(e, e.k0);
  const lignes: LigneCalcul[] = [ligne(latex, [ft("équation en "), L("x"), ft(" pour "), L(`k=${nL(e.k0)}`)])];
  if (xs.length === 0) return [...lignes, ligne("\\Delta<0", "aucune solution")];
  if (A === 0) lignes.push(ligne(Math.abs(B) === 1 ? `x=${nL(xs[0]!)}` : `x=\\dfrac{${nL(-C)}}{${nL(B)}}=${nL(xs[0]!)}`, "premier degré"));
  else if (xs.length === 1) lignes.push(ligne(`x=\\dfrac{${nL(-B)}}{${nL(2 * A)}}=${nL(xs[0]!)}`, "racine double"));
  else {
    const dd = B * B - 4 * A * C;
    lignes.push(ligne(`x=\\dfrac{${nL(-B)}\\pm\\sqrt{${milliersL(dd)}}}{${nL(2 * A)}}`, [L(`\\Delta=${milliersL(dd)}`)]), ligne(`x=${nL(xs[0]!)}\\ \\text{ou}\\ x=${nL(xs[1]!)}`));
  }
  for (const x of xs) lignes.push(ligne(e.m === 0 ? `y=${nL(e.k0)}` : `y=${nL(e.m)}\\cdot ${nPL(x)}${sgL(e.k0)}=${nL(e.m * x + e.k0)}`, [ft("en "), L(`x=${nL(x)}`)]));
  return lignes;
}

export function correctionDetailleePD(e: E): EtapeCorrection[] {
  const c = e.conique;
  const v = e.verdict;
  return [
    utilise("a", [ft("Points communs d'une droite et d'une conique (cours, point 4) : on remplace "), L("y"), ft(" par "), L(membreDroite(e.m, "k")), ft(" dans l'équation de "), L("\\Gamma"), ft(".")]),
    calcul("a", lignesA(e)),
    resultat("a", [L(equationXL(e)), ft(".")]),
    utilise("b", [ft("Si l'équation est du second degré, "), L("d_k"), ft(" est tangente quand elle a une racine double : "), L("\\Delta=0"), ft(" (cours, points 4 et 5). Si le coefficient de "), L("x^2"), ft(" est nul, elle est du premier degré et n'a jamais de racine double.")]),
    calcul("b", lignesB(e)),
    resultat("b", [...(valeursTangenceFr(e) as FragmentConsigne[]), ft(".")]),
    verification("b", verifB(e)),
    utilise("c", [ft("Nombre de solutions de l'équation pour "), L(`k=${nL(e.k0)}`), ft(" : signe de "), L("\\Delta"), ft(", ou une solution si l'équation est du premier degré.")]),
    calcul("c", lignesC(e)),
    resultat("c", [ft(LIBELLES_VERDICT[v]), ft(".")]),
    utilise("d", [ft("On résout l'équation en "), L("x"), ft(", puis "), L("y"), ft(" se lit sur la droite.")]),
    calcul("d", lignesD(e)),
    { ...resultat("d", abscisses(e, e.k0).length ? [ft("Points communs : "), L(pointsL(e)), ft(".")] : [ft("Aucun point commun.")]), figureHtml: figurePD(e, true) },
    piege(
      "d",
      v === "unPoint"
        ? [ft("Conclure « tangente » parce qu'il y a un seul point : la droite est parallèle à "), ft(c.type === "hyperbole" ? "une asymptote" : "l'axe de la parabole"), ft(" et traverse la conique.")]
        : v === "tangente"
          ? [ft("Lire "), L("\\Delta=0"), ft(" comme « aucun point » : c'est un point double, le point de contact.")]
          : v === "exterieure"
            ? [ft("Oublier que "), L("\\Delta<0"), ft(" ne laisse aucun point : la droite ne rencontre pas "), L("\\Gamma"), ft(".")]
            : [ft("Oublier de calculer les ordonnées : un point commun a deux coordonnées, "), L("y"), ft(" se lit sur la droite.")],
    ),
  ];
}

