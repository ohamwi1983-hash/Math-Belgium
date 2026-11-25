import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceMeilleurAjustement } from "../../core5e/meilleurAjustement";
import { droiteSans, previsionSans, resumeSans, resumeTous, sommes } from "../../core5e/meilleurAjustement";
import type { Droite } from "../../core5e/statistiqueLotH2";
import { resume, somme } from "../../core5e/statistiqueLotH2";
import { categorieR } from "../../ui5e/formatModeliserPrevoir";
import { contexteAberrant, ecartAttendu, figure, figureFin, pointEcart, pointL, reponse } from "../../ui5e/formatMeilleurAjustement";
import { nPlus, egalOuEnviron, nL, nP } from "../../ui5e/nombresStatLotH2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen79` (cours, § 4 et § 6), une lettre par écran.
 * deuxDroites : a) l'écart d'un point ; b), c) les sommes S₁, S₂ (un carré par ligne) ; d) le
 * verdict (figure : nuage et deux droites). mayerMoindres : a) G et le contrôle « les deux droites
 * passent par G » ; b), c) S₁, S₂ ; d) le verdict. aberrant : a) le point repéré (figure entourée) ;
 * b) r avec et sans lui ; c) la droite sans lui (figure : les deux droites) ; d) la prévision.
 */

type E = ExerciceMeilleurAjustement;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];
const COURS = "(cours, § 4)";

const valD = (d: Droite, x: number) => `${nL(d.a, 2)}\\cdot ${nP(x, 2)}${nPlus(d.b, 2)}`;

function lignesSomme(e: E, i: 0 | 1): LigneCalcul[] {
  const d = e.droites[i];
  const dec = e.variante === "mayerMoindres" ? 4 : 2;
  const ec = e.points.map((q) => q.y - (d.a * q.x + d.b));
  const l: LigneCalcul[] = e.points.map((q, k) =>
    ligne(`\\bigl(${nL(q.y, 2)}-(${valD(d, q.x)})\\bigr)^2=${nP(ec[k]!, 2)}^2=${nL(ec[k]! ** 2, dec)}`, `point ${k + 1}`),
  );
  const s = somme(ec.map((v) => v * v));
  l.push(ligne(`S_${i + 1}=${ec.map((v) => nL(v * v, dec)).join("+")}${egalOuEnviron(s, dec)}`, "somme des six carrés"));
  return l;
}

function etapesSommes(e: E): EtapeCorrection[] {
  const [s1, s2] = sommes(e);
  const def: FragmentConsigne[] = [t("Écart vertical d'un point : "), f("y_i-(ax_i+b)"), t(" ; on élève chaque écart au carré et on additionne "), t(COURS), t(" :"), f("\\;S=\\sum\\bigl(y_i-(ax_i+b)\\bigr)^2"), t(".")];
  return [
    utilise("b", def),
    calcul("b", lignesSomme(e, 0)),
    resultat("b", [f(`S_1${egalOuEnviron(s1, 2)}`)]),
    piege("b", [t("Additionner les écarts sans les élever au carré : les écarts positifs et négatifs se compensent.")]),
    utilise("c", [t("Même calcul avec la droite "), f("d_2"), t(".")]),
    calcul("c", lignesSomme(e, 1)),
    resultat("c", [f(`S_2${egalOuEnviron(s2, 2)}`)]),
  ];
}

function etapeVerdict(e: E): EtapeCorrection[] {
  const [s1, s2] = sommes(e);
  const lien = s1 < s2 ? "<" : ">";
  return [
    utilise("d", e.variante === "deuxDroites"
      ? [t("Au sens des moindres carrés, la meilleure droite est celle dont la somme des carrés des écarts verticaux est la plus petite "), t(COURS), t(".")]
      : [t("La droite des moindres carrés rend la somme des carrés des écarts verticaux minimale : aucune autre droite, celle de Mayer comprise, ne fait mieux "), t(COURS), t(".")]),
    calcul("d", [ligne(`S_1${egalOuEnviron(s1, 2)}\\;${lien}\\;S_2${egalOuEnviron(s2, 2)}`)]),
    { ...resultat("d", fr(reponse(e, "verdict"))), figureHtml: figureFin(e) },
    ...(e.variante === "mayerMoindres" ? [verification("d", [t("Les deux droites passent par G : cela ne les distingue pas. La droite de Mayer est proche de celle des moindres carrés, mais sa somme est un peu plus grande.")])] : []),
    piege("d", e.variante === "deuxDroites" ? [t("Choisir la droite qui passe exactement par le plus de points : un point « attrapé » ne compense pas de grands écarts ailleurs.")] : [t("Croire que la droite qui passe par G est forcément celle des moindres carrés : la droite de Mayer y passe aussi.")]),
  ];
}

function deuxDroites(e: E): EtapeCorrection[] {
  const q = pointEcart(e);
  const d = e.droites[0];
  const yd = d.a * q.x + d.b;
  return [
    utilise("a", [t("L'écart vertical du point "), f(pointL(q.x, q.y)), t(" à "), f("d_1"), t(" est la différence entre son ordonnée et celle du point de "), f("d_1"), t(" de même abscisse "), t(COURS), t(".")]),
    calcul("a", [ligne(`ax+b=${valD(d, q.x)}=${nL(yd, 2)}`, "ordonnée du point de la droite"), ligne(`y-(ax+b)=${nL(q.y, 2)}-${nP(yd, 2)}=${nL(ecartAttendu(e), 2)}`)]),
    resultat("a", fr(reponse(e, "ecart"))),
    ...etapesSommes(e),
    ...etapeVerdict(e),
  ];
}

function mayerMoindres(e: E): EtapeCorrection[] {
  const s = resume(e.points);
  return [
    utilise("a", [t("Le point moyen a pour coordonnées les moyennes des x et des y (cours, § 1).")]),
    calcul("a", [
      ligne(`\\bar{x}=\\dfrac{${e.points.map((q) => nL(q.x, 2)).join("+")}}{6}=\\dfrac{${nL(somme(e.points.map((q) => q.x)), 2)}}{6}=${nL(s.mx, 2)}`),
      ligne(`\\bar{y}=\\dfrac{${e.points.map((q) => nL(q.y, 2)).join("+")}}{6}=\\dfrac{${nL(somme(e.points.map((q) => q.y)), 2)}}{6}=${nL(s.my, 2)}`),
    ]),
    resultat("a", fr(reponse(e, "pointMoyen"))),
    verification("a", [t("Les deux droites passent par G :")], e.droites.map((d, i) => ligne(`${valD(d, s.mx)}=${nL(d.a * s.mx + d.b, 2)}=\\bar{y}`, `droite d${i === 0 ? "₁" : "₂"}`))),
    ...etapesSommes(e),
    ...etapeVerdict(e),
  ];
}

function aberrant(e: E): EtapeCorrection[] {
  const ca = contexteAberrant(e);
  const q = e.points[e.indiceAberrant]!;
  const d = droiteSans(e);
  const tous = resumeTous(e);
  const sans = resumeSans(e);
  const yAttendu = d.a * q.x + d.b;
  return [
    utilise("a", [t("Un point aberrant s'écarte nettement de la tendance des autres ; ici, le contexte annonce un événement exceptionnel (cours, § 6).")]),
    calcul("a", [ligne(`y_{\\text{droite des autres}}\\approx ${nL(yAttendu, ca.dp)}\\quad\\text{contre}\\quad y=${nL(q.y, 2)}`, `pour x = ${nL(q.x, 2).replace("{,}", ",")}`)]),
    { ...resultat("a", fr(reponse(e, "repere"))), figureHtml: figure(e, "correlations") },
    utilise("b", [t("La calculatrice affiche r avec « 2-Var Stats » : une fois avec les huit points, une fois sans le point aberrant.")]),
    calcul("b", [ligne(`r_{\\text{tous}}\\approx ${nL(tous.r, 3, true)}`, `corrélation ${categorieR(tous.r)}`), ligne(`r_{\\text{sans}}\\approx ${nL(sans.r, 3, true)}`, `corrélation ${categorieR(sans.r)}`)]),
    resultat("b", fr(reponse(e, "correlations"))),
    verification("b", [t("Un seul point suffit à faire chuter |r| : il faut toujours regarder le nuage avant de calculer.")]),
    utilise("c", [t("Droite des moindres carrés des sept autres points, à la calculatrice : "), f("a=\\dfrac{\\operatorname{Cov}(x,y)}{V(x)}"), t(", "), f("b=\\bar{y}-a\\,\\bar{x}"), t(".")]),
    calcul("c", [
      ligne(`a\\approx ${nL(d.a, ca.da + 2, true)}\\approx ${nL(d.a, ca.da, true)}`),
      ligne(`b\\approx ${nL(d.b, ca.db + 2, true)}\\approx ${nL(d.b, ca.db, true)}`),
      ligne(`y\\approx ${nL(tous.a, ca.da, true)}x${nPlus(tous.b, ca.db, true)}`, "avec les huit points, la droite basculait"),
    ]),
    { ...resultat("c", fr(reponse(e, "droite"))), figureHtml: figure(e, "prevision") },
    piege("c", [t("Garder le point aberrant dans les listes : il fait basculer la droite vers lui.")]),
    utilise("d", [t("On remplace x par "), f(nL(e.x0, 2)), t(" dans l'équation obtenue sans le point aberrant.")]),
    calcul("d", [ligne(`y=${nL(d.a, ca.da, true)}\\cdot ${nP(e.x0, 2)}${nPlus(d.b, ca.db, true)}\\approx ${nL((Math.round(d.a * 10 ** ca.da) / 10 ** ca.da) * e.x0 + Math.round(d.b * 10 ** ca.db) / 10 ** ca.db, ca.dp + 1)}`, "avec a et b arrondis"), ligne(`y\\approx ${nL(previsionSans(e), ca.dp + 1)}`, "avec a et b non arrondis")]),
    { ...resultat("d", fr(reponse(e, "prevision"))), figureHtml: figureFin(e) },
  ];
}

export function correctionDetailleeMeilleurAjustement(e: E): EtapeCorrection[] {
  if (e.variante === "deuxDroites") return deuxDroites(e);
  if (e.variante === "mayerMoindres") return mayerMoindres(e);
  return aberrant(e);
}
