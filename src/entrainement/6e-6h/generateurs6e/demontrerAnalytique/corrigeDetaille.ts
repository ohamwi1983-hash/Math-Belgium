import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice123 } from "../../core6e/demontrerAnalytique";
import { egalites123, figure123, reperes123, reponse123 } from "../../ui6e/formatDemontrerAnalytique";
import { fr, l, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen123`, une lettre par écran, en suivant la méthode en
 * quatre étapes du cours (§ 3) : repère adapté et paramètres génériques, coordonnées des points construits
 * (une transformation par ligne), égalité qui traduit la conclusion, calcul des deux membres et
 * conclusion « pour toutes les valeurs des lettres » (figure de la configuration). Même source que
 * l'écran.
 */

type E = Exercice123;

const m2 = (a: string, b: string) => `\\dfrac{${a}+${b}}{2}`;
const P = (n: string, x: string, y: string) => `${n}\\left(${x}\\,;${y}\\right)`;

function lignesCoordonnees(e: E): LigneCalcul[] {
  const [A, B, C, D] = e.noms;
  switch (e.support) {
    case "parallelogramme":
      return [
        ligne(`\\vec{${A}${B}}=\\vec{${D}${C}}\\iff ${C}=${B}+${D}-${A}`, "définition du parallélogramme"),
        ligne(`x_${C}=2a+2b-0=2a+2b`),
        ligne(`y_${C}=0+2c-0=2c`),
      ];
    case "losange":
      return [ligne(`\\vec{${A}${B}}=\\vec{${D}${C}}\\iff ${C}=${B}+${D}-${A}`, "un losange est un parallélogramme"), ligne(`x_${C}=a+b-0=a+b`), ligne(`y_${C}=0+c-0=c`)];
    case "medianes":
      return [ligne(`${P(`${A}'`, m2("2a", "2b"), m2("0", "2c"))}=${P("", "a+b", "c")}`, `milieu de [${B}${C}]`), ligne(`${P(`${B}'`, m2("0", "2b"), m2("0", "2c"))}=${P("", "b", "c")}`, `milieu de [${A}${C}]`)];
    case "varignon":
      return [
        ligne(`${P("I", m2("0", "2a"), m2("0", "0"))}=${P("", "a", "0")}`),
        ligne(`${P("J", m2("2a", "2b"), m2("0", "2c"))}=${P("", "a+b", "c")}`),
        ligne(`${P("K", m2("2b", "2d"), m2("2c", "2e"))}=${P("", "b+d", "c+e")}`),
        ligne(`${P("L", m2("2d", "0"), m2("2e", "0"))}=${P("", "d", "e")}`),
      ];
    case "rectangleMediane":
      return [ligne(`${P("M", m2("2a", "0"), m2("0", "2b"))}=${P("", "a", "b")}`, `milieu de [${B}${C}]`)];
  }
}

function lignesCalcul(e: E): LigneCalcul[] {
  const [A, B, C, D] = e.noms;
  switch (e.support) {
    case "parallelogramme":
      return [
        ligne(`\\text{milieu de }[${A}${C}]=${P("", m2("0", "2a+2b"), m2("0", "2c"))}=${P("", "a+b", "c")}`),
        ligne(`\\text{milieu de }[${B}${D}]=${P("", m2("2a", "2b"), m2("0", "2c"))}=${P("", "a+b", "c")}`),
      ];
    case "medianes":
      return [
        ligne(`\\vec{${A}${A}'}\\begin{pmatrix}a+b\\\\c\\end{pmatrix}`, `de ${A}(0 ; 0) à ${A}'`),
        ligne(`G_${A}=${A}+\\tfrac{2}{3}\\vec{${A}${A}'}=${P("", "\\dfrac{2a+2b}{3}", "\\dfrac{2c}{3}")}`, "aux deux tiers depuis le sommet"),
        ligne(`\\vec{${B}${B}'}\\begin{pmatrix}b-2a\\\\c\\end{pmatrix}`, `de ${B}(2a ; 0) à ${B}'(b ; c)`),
        ligne(`x_{G_${B}}=2a+\\dfrac{2(b-2a)}{3}=\\dfrac{2a+2b}{3}`),
        ligne(`y_{G_${B}}=0+\\dfrac{2c}{3}=\\dfrac{2c}{3}`),
        ligne(`G_${A}=G_${B}=${P("", "\\dfrac{0+2a+2b}{3}", "\\dfrac{0+0+2c}{3}")}`, `même point ; le calcul depuis ${C} est le même (moyenne des trois sommets)`),
      ];
    case "varignon":
      return [ligne("\\vec{IJ}\\begin{pmatrix}(a+b)-a\\\\c-0\\end{pmatrix}=\\begin{pmatrix}b\\\\c\\end{pmatrix}"), ligne("\\vec{LK}\\begin{pmatrix}(b+d)-d\\\\(c+e)-e\\end{pmatrix}=\\begin{pmatrix}b\\\\c\\end{pmatrix}")];
    case "rectangleMediane":
      return [ligne(`${A}M^2=(a-0)^2+(b-0)^2=a^2+b^2`), ligne(`${B}${C}^2=(0-2a)^2+(2b-0)^2=4a^2+4b^2`), ligne(`${B}${C}^2=4\\,(a^2+b^2)=4\\,${A}M^2`, "on met 4 en évidence")];
    case "losange":
      return [
        ligne(`\\vec{${A}${C}}\\begin{pmatrix}a+b\\\\c\\end{pmatrix},\\ \\vec{${B}${D}}\\begin{pmatrix}b-a\\\\c\\end{pmatrix}`),
        ligne(`(a+b)(b-a)+c\\times c=b^2-a^2+c^2`, "on développe"),
        ligne(`=(b^2+c^2)-a^2=a^2-a^2=0`, [t("hypothèse "), { type: "latex", valeur: "b^2+c^2=a^2" }]),
      ];
  }
}

const CONCLUSION: Record<Exercice123["support"], string> = {
  parallelogramme: "Les deux milieux sont égaux pour toutes les valeurs de a, b et c : les diagonales de tout parallélogramme se coupent en leur milieu.",
  medianes: "Le même point est sur les trois médianes, pour toutes les valeurs de a, b et c : les médianes sont concourantes (en G, centre de gravité).",
  varignon: "Pour toutes les valeurs des lettres, IJ = LK en vecteurs : IJKL est un parallélogramme.",
  rectangleMediane: "Pour toutes les valeurs de a et b, la médiane mesure la moitié de l'hypoténuse : AM = BC ÷ 2.",
  losange: "La somme des produits des composantes est nulle pour tout losange : les diagonales sont perpendiculaires.",
};

export function correctionDetaillee123(e: E): EtapeCorrection[] {
  const [a, b, c, d] = [0, 1, 2, 3].map(lettreEtape) as [string, string, string, string];
  const conclusion = CONCLUSION[e.support].replace("AM", `${e.noms[0]}M`).replace("BC", `${e.noms[1]}${e.noms[2]}`);
  return [
    utilise(a, [t("Méthode du cours (§ 3), étapes 1 et 2 : un sommet à l'origine, un côté sur un axe, et des lettres quelconques pour le reste — sinon la preuve ne vaudrait que pour une figure particulière.")]),
    resultat(a, reperes123(e)[0]!),
    piege(a, [t("Prouver sur un exemple numérique, ou choisir un repère qui ajoute une propriété (angle droit, côtés égaux) : la conclusion ne vaudrait que dans ce cas.")]),
    utilise(b, [t("Coordonnées (cours, § 1) : le milieu est la moyenne des extrémités ; dans un parallélogramme, "), l("\\vec{AB}=\\vec{DC}"), t(".")]),
    calcul(b, lignesCoordonnees(e)),
    resultat(b, fr(reponse123(e, "coordonnees"))),
    utilise(c, [t("Méthode du cours (§ 3), étape 3 : on traduit la conclusion en une égalité entre deux expressions calculables.")]),
    resultat(c, egalites123(e)[0]!.fr),
    piege(c, [t("Établir une égalité vraie mais qui ne prouve pas la propriété demandée, ou partir de l'hypothèse au lieu de la conclusion.")]),
    utilise(d, [t("Méthode du cours (§ 3), étape 4 : on calcule les deux membres et on constate qu'ils coïncident quelles que soient les lettres.")]),
    { ...calcul(d, lignesCalcul(e)), figureHtml: figureCorrigeLot(figure123(e)) },
    resultat(d, [t(conclusion)]),
    verification(d, [t("Aucune valeur particulière n'a été donnée aux lettres : le calcul vaut pour toutes les figures du type demandé.")]),
  ];
}
