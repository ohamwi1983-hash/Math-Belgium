import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDroiteMayer } from "../../core5e/droiteMayer";
import { arrondi, decimales, net, somme } from "../../core5e/stat2vLotH1";
import { nL, nT, parL } from "../../ui5e/ecrituresStat2vLotH1";
import { bAvecPenteArrondie, DECIMALES_G, figureEtat, n, nomPrecision, prevision, reponse } from "../../ui5e/formatDroiteMayer";

/**
 * Corrigé détaillé « comme au tableau » de `5gen36`, une lettre par écran : données rangées et partagées
 * (tableau à deux blocs), G₁ et G₂, pente, b avec la pente en mémoire (et ce que donnerait la pente
 * arrondie), G et vérification a·x̄ + b ≈ ȳ, prévision (interpolation ou extrapolation). Figure : nuage,
 * G₁, G₂, G et la droite de Mayer.
 */

type E = ExerciceDroiteMayer;
const t = texte;
const f = latex;

const sommeL = (v: number[], d: number) => v.map((x, i) => (i === 0 ? nL(x, d) : `+${nL(x, d)}`)).join("");
const egalOuEnviron = (v: number, d: number) => (decimales(v) <= d ? "=" : "\\approx");

function tableauGroupes(e: E): string {
  const { tries, k } = e.m;
  const col = `c|${"c".repeat(k)}|${"c".repeat(tries.length - k)}`;
  return `\\begin{array}{${col}}x_i&${tries.map((q) => nL(q.x, e.dx)).join("&")}\\\\\\hline y_i&${tries.map((q) => nL(q.y, e.dy)).join("&")}\\end{array}`;
}

export function correctionDetailleeDroiteMayer(e: E): EtapeCorrection[] {
  const { m } = e;
  const k = m.k;
  const g1 = m.tries.slice(0, k);
  const g2 = m.tries.slice(k);
  const moy = (nom: string, v: number[], d: number, r: number) => ligne(`${nom}=\\dfrac{${sommeL(v, d)}}{${v.length}}=\\dfrac{${nL(net(somme(v)))}}{${v.length}}=${nL(r)}`);
  const bArr = bAvecPenteArrondie(e);
  const ar = arrondi(m.a, e.da);
  const yG = m.a * e.G.x + m.b;
  const xs = m.tries.map((q) => q.x);
  const piegeB = Math.abs(bArr - m.b) > 0.005;
  const interpolation = e.x0 >= Math.min(...xs) && e.x0 <= Math.max(...xs);
  return [
    utilise("a", [t(`Méthode de Mayer : on range les données par x croissants, puis on les partage en deux groupes d'effectifs égaux (à une unité près${n(e) % 2 ? " ; ici n est impair : le premier groupe a un point de moins" : ""}).`)]),
    calcul("a", [ligne(tableauGroupes(e))], [t(`${e.variante === "desordre" ? "Données rangées" : "Données"} et partage en ${k} + ${n(e) - k} points :`)]),
    resultat("a", reponse(e, "partage")),
    ...(e.variante === "desordre" ? [piege("a", [t("Partager le tableau tel qu'il est donné, sans ranger les abscisses : les deux groupes ne correspondent plus aux deux moitiés du nuage.")])] : []),
    utilise("b", [t("Chaque point moyen a pour coordonnées la moyenne des x et la moyenne des y de son groupe.")]),
    calcul("b", [moy("\\bar{x}_1", g1.map((q) => q.x), e.dx, m.G1.x), moy("\\bar{y}_1", g1.map((q) => q.y), e.dy, m.G1.y), moy("\\bar{x}_2", g2.map((q) => q.x), e.dx, m.G2.x), moy("\\bar{y}_2", g2.map((q) => q.y), e.dy, m.G2.y)]),
    resultat("b", reponse(e, "groupes")),
    calcul("c", [ligne(`a=\\dfrac{\\bar{y}_2-\\bar{y}_1}{\\bar{x}_2-\\bar{x}_1}=\\dfrac{${nL(m.G2.y)}-${parL(m.G1.y)}}{${nL(m.G2.x)}-${parL(m.G1.x)}}=\\dfrac{${nL(net(m.G2.y - m.G1.y))}}{${nL(net(m.G2.x - m.G1.x))}}${egalOuEnviron(m.a, e.da)}${nL(m.a, e.da)}`)], [t("Pente de la droite "), f("G_1G_2"), t(" :")]),
    resultat("c", reponse(e, "pente")),
    utilise("d", [t("La droite passe par "), f("G_1"), t(" : "), f("\\bar{y}_1=a\\,\\bar{x}_1+b"), t(" ; on calcule b avec la pente gardée en mémoire (non arrondie).")]),
    calcul("d", [ligne(`b=\\bar{y}_1-a\\,\\bar{x}_1=${nL(m.G1.y)}-${decimales(m.a) > 6 ? (m.a < 0 ? `(${nL(m.a, 6)}\\ldots)` : `${nL(m.a, 6)}\\ldots`) : parL(m.a)}\\times${parL(m.G1.x)}${egalOuEnviron(m.b, e.db)}${nL(m.b, e.db)}`)]),
    { ...resultat("d", reponse(e, "equation")), figureHtml: figureEtat(e, 4) },
    ...(e.variante !== "desordre" && piegeB ? [piege("d", [t(`Avec la pente arrondie (${nT(ar)}), on trouverait `), f(`b\\approx${nL(bArr, e.db)}`), t(" : l'erreur d'arrondi est multipliée par "), f(`\\bar{x}_1=${nL(m.G1.x)}`), t(".")])] : []),
    calcul("e", [ligne(`\\bar{x}=\\dfrac{${nL(net(somme(xs)))}}{${n(e)}}${egalOuEnviron(e.G.x, DECIMALES_G)}${nL(e.G.x, DECIMALES_G)}`), ligne(`\\bar{y}=\\dfrac{${nL(net(somme(m.tries.map((q) => q.y))))}}{${n(e)}}${egalOuEnviron(e.G.y, DECIMALES_G)}${nL(e.G.y, DECIMALES_G)}`)], [t("Point moyen du nuage :")]),
    resultat("e", reponse(e, "g")),
    { ...verification("e", [t("La droite de Mayer passe par G : "), f(`a\\,\\bar{x}+b\\approx${nL(yG, 3)}`), t(" et "), f(`\\bar{y}${egalOuEnviron(e.G.y, 3)}${nL(e.G.y, 3)}`), t(".")]), figureHtml: figureEtat(e, 6) },
    calcul("f", [ligne(`y=a\\times${parL(e.x0)}+b\\approx${nL(prevision(e), e.dp + 1)}\\approx${nL(prevision(e), e.dp)}`)], [t("On remplace x par "), f(nL(e.x0)), t(" dans l'équation :")]),
    resultat("f", reponse(e, "prevision")),
    verification("f", [t(interpolation ? "x est dans l'intervalle des données : c'est une interpolation, la prévision est raisonnable." : "x est hors de l'intervalle des données : c'est une extrapolation, à prendre avec prudence.")]),
    ...(e.variante !== "desordre" && !piegeB ? [piege("f", [t(`Arrondir trop tôt : on donne le résultat final ${nomPrecision(e.dp)}, sans arrondir les étapes intermédiaires.`)])] : []),
  ];
}
