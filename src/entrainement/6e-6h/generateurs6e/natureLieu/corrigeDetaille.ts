import { figureCorrigeLot } from "../../ui6e/corrigeLieuxLotH1";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Exercice127 } from "../../core6e/natureLieu";
import { apollonius, elements127, seuil127 } from "../../core6e/natureLieu";
import { figureCorrige127, reponse127, reponseElements, typeChamp127 } from "../../ui6e/formatNatureLieu";
import { raisonNature } from "../../moteur6e/verificationNatureLieu";
import { equationCours, fr, l, membreL, milieu, nb, nbp, somme, t } from "../../ui6e/outilsLieuxLotH1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen127` : étape a — la condition traduite en équation(s),
 * une transformation par ligne, jusqu'à la nature (comparaison au seuil s'il y en a un), avec la figure
 * du lieu ; étape b (sauf lieu vide) — les éléments caractéristiques lus sur la dernière forme. Même
 * source que l'écran (`elements127`, `reponse127`).
 */

type E = Exercice127;

const carreL = (v: string, c: number) => (c === 0 ? `${v}^2` : `(${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))})^2`);
const lin = (v: string, c: number) => (c === 0 ? v : `${v}${c > 0 ? "-" : "+"}${nb(Math.abs(c))}`);

function lignesTraduction(e: E): LigneCalcul[] {
  const c = e.condition;
  const s = seuil127(e);
  switch (c.type) {
    case "sommeCarres": {
      const M = milieu(c.A, c.B);
      const ab2 = 2 * s!;
      return [
        ligne(`M=${`\\left(${nb(M.x)}\\,;${nb(M.y)}\\right)`}`, "milieu de [AB]"),
        ligne(`AB^2=${nbp(c.B.x - c.A.x)}^2+${nbp(c.B.y - c.A.y)}^2=${nb(ab2)}`),
        ligne(`PA^2+PB^2=2PM^2+\\dfrac{AB^2}{2}=2PM^2+${nb(s!)}`, "théorème de la médiane"),
        ligne(`2PM^2+${nb(s!)}=${nb(c.k)}`, "condition"),
        ligne(`PM^2=\\dfrac{${nb(c.k)}-${nb(s!)}}{2}=${nb((c.k - s!) / 2)}`),
      ];
    }
    case "differenceCarres":
    case "rapport": {
      if (c.type === "rapport" && c.kn !== c.kd) {
        const k2 = (c.kn * c.kn) / (c.kd * c.kd);
        const { centre, rayon2 } = apollonius(c.A, c.B, c.kn, c.kd);
        const a = 1 - k2;
        const D = -2 * (c.A.x - k2 * c.B.x);
        const Ee = -2 * (c.A.y - k2 * c.B.y);
        const F = c.A.x ** 2 + c.A.y ** 2 - k2 * (c.B.x ** 2 + c.B.y ** 2);
        return [
          ligne(`PA^2=${nb(k2)}\\,PB^2`, "on élève au carré (longueurs positives)"),
          ligne(`${carreL("x", c.A.x)}+${carreL("y", c.A.y)}=${nb(k2)}\\left[${carreL("x", c.B.x)}+${carreL("y", c.B.y)}\\right]`),
          ligne(`${somme([[a, "x^2"], [a, "y^2"], [D, "x"], [Ee, "y"], [F, ""]])}=0`, "on développe et on regroupe"),
          ligne(`${somme([[1, "x^2"], [1, "y^2"], [D / a, "x"], [Ee / a, "y"], [F / a, ""]])}=0`, [{ type: "texte", valeur: "on divise par " }, { type: "latex", valeur: `1-k^2=${nb(a)}` }]),
          ligne(`${carreL("x", centre.x)}+${carreL("y", centre.y)}=${nb(rayon2)}`, "on complète les carrés"),
        ];
      }
      const k = c.type === "differenceCarres" ? c.k : 0;
      const u = { x: c.B.x - c.A.x, y: c.B.y - c.A.y };
      const cst = c.A.x ** 2 + c.A.y ** 2 - c.B.x ** 2 - c.B.y ** 2;
      const brut = { a: 2 * u.x, b: 2 * u.y, c: cst - k };
      return [
        ...(c.type === "rapport" ? [ligne("PA=PB\\iff PA^2=PB^2", "longueurs positives")] : []),
        ligne(`${carreL("x", c.A.x)}+${carreL("y", c.A.y)}-${carreL("x", c.B.x)}-${carreL("y", c.B.y)}=${nb(k)}`, "on remplace PA² et PB²"),
        ligne(`${somme([[2 * u.x, "x"], [2 * u.y, "y"], [cst, ""]])}=${nb(k)}`, "les termes x² et y² disparaissent"),
        ligne(`${membreL(brut)}=0`),
        ligne(equationCours(brut), "on simplifie"),
      ];
    }
    case "absSomme":
      return [
        ligne(`x=${nb(c.p)}\\ :\\ |${lin("y", c.q)}|=${nb(c.k)}\\iff y=${nb(c.q - c.k)}\\text{ ou }y=${nb(c.q + c.k)}`, "première valeur absolue nulle"),
        ligne(`y=${nb(c.q)}\\ :\\ |${lin("x", c.p)}|=${nb(c.k)}\\iff x=${nb(c.p - c.k)}\\text{ ou }x=${nb(c.p + c.k)}`, "seconde valeur absolue nulle"),
        ligne(`x\\geq ${nb(c.p)},\\ y\\geq ${nb(c.q)}\\ :\\ ${lin("x", c.p)}+${lin("y", c.q)}=${nb(c.k)}`, "un côté, entre deux sommets"),
      ];
    case "absDifference":
      if (c.k === 0)
        return [
          ligne(`|${lin("x", c.p)}|=|${lin("y", c.q)}|`),
          ligne(`${lin("y", c.q)}=${lin("x", c.p)}\\text{ ou }${lin("y", c.q)}=-(${lin("x", c.p)})`, "deux nombres de même valeur absolue : égaux ou opposés"),
        ];
      return c.k > 0
        ? [
            ligne(`|${lin("x", c.p)}|=${nb(c.k)}+|${lin("y", c.q)}|\\geq ${nb(c.k)}`, "on isole"),
            ligne(`y=${nb(c.q)}\\ :\\ x=${nb(c.p - c.k)}\\text{ ou }x=${nb(c.p + c.k)}`, "les origines"),
            ligne(`x\\geq ${nb(c.p + c.k)},\\ y\\geq ${nb(c.q)}\\ :\\ ${lin("y", c.q)}=${lin("x", c.p + c.k)}`, "une demi-droite (et ses symétriques)"),
          ]
        : [
            ligne(`|${lin("y", c.q)}|=${nb(-c.k)}+|${lin("x", c.p)}|\\geq ${nb(-c.k)}`, "on isole"),
            ligne(`x=${nb(c.p)}\\ :\\ y=${nb(c.q + c.k)}\\text{ ou }y=${nb(c.q - c.k)}`, "les origines"),
            ligne(`y\\geq ${nb(c.q - c.k)},\\ x\\geq ${nb(c.p)}\\ :\\ ${lin("y", c.q - c.k)}=${lin("x", c.p)}`, "une demi-droite (et ses symétriques)"),
          ];
    case "absUne": {
      const v = c.variable;
      const ax = `${c.a === 1 ? "" : nb(c.a)}${v}`;
      const axb = c.b === 0 ? ax : `${ax}${c.b > 0 ? "-" : "+"}${nb(Math.abs(c.b))}`;
      const x1 = (c.b - c.k) / c.a;
      const x2 = (c.b + c.k) / c.a;
      return c.inegalite
        ? [ligne(`-${nb(c.k)}\\leq ${axb}\\leq ${nb(c.k)}`, "une valeur absolue au plus égale à k"), ligne(`${nb(x1)}\\leq ${v}\\leq ${nb(x2)}`)]
        : [ligne(`${axb}=${nb(c.k)}\\text{ ou }${axb}=${nb(-c.k)}`, "égaux ou opposés"), ligne(`${v}=${nb(x2)}\\text{ ou }${v}=${nb(x1)}`)];
    }
    case "distanceDroite":
      return [
        ligne(`\\dfrac{|${membreL(c.d)}|}{${nb(c.norme)}}${c.inegalite ? "\\leq" : "="}${nb(c.k)}`, "distance de P(x ; y) à d"),
        c.inegalite ? ligne(`-${nb(c.k * c.norme)}\\leq ${membreL(c.d)}\\leq ${nb(c.k * c.norme)}`) : ligne(`${membreL(c.d)}=${nb(c.k * c.norme)}\\text{ ou }${membreL(c.d)}=${nb(-c.k * c.norme)}`),
      ];
    case "equidistantSecantes":
      return [
        ligne(`|${membreL(c.d1)}|=|${membreL(c.d2)}|`, "mêmes normes : les dénominateurs se simplifient"),
        ligne(`${membreL(c.d1)}=${membreL(c.d2)}\\text{ ou }${membreL(c.d1)}=-(${membreL(c.d2)})`, "égaux ou opposés"),
      ];
    case "equidistantParalleles":
      return [
        ligne(`|${membreL(c.d1)}|=|${membreL(c.d2)}|`, "même vecteur normal"),
        ligne(`${membreL(c.d1)}=-(${membreL(c.d2)})`, "l'égalité sans le signe − est impossible"),
      ];
    case "sommeParalleles": {
      const v = c.variable;
      const e0 = c.v - c.u;
      return [
        ligne(`|${lin(v, c.u)}|+|${lin(v, c.v)}|=${nb(c.k)}`),
        ligne(`${nb(c.u)}\\leq ${v}\\leq ${nb(c.v)}\\ :\\ (${lin(v, c.u)})+(${nb(c.v)}-${v})=${nb(e0)}`, "entre les droites, la somme vaut l'écart"),
        ligne(`${v}>${nb(c.v)}\\ :\\ 2${v}${somme([[-(c.u + c.v), ""]]).replace(/^(?!-)/, "+")}>${nb(e0)}`, "à l'extérieur, elle est plus grande"),
        ...(c.k > e0 ? [ligne(`2${v}${somme([[-(c.u + c.v), ""]]).replace(/^(?!-)/, "+")}=${nb(c.k)}\\iff ${v}=${nb((c.u + c.v + c.k) / 2)}`, "et de même de l'autre côté")] : []),
      ];
    }
    case "carreSomme":
      return [
        ligne(`X=${lin("x", c.O.x)}`, "coordonnées depuis le centre"),
        ligne(`Y=${lin("y", c.O.y)}`),
        ligne(`|X|\\leq ${c.c},\\ |Y|\\leq ${c.c}\\ :\\ (${c.c}-X)+(${c.c}+X)+(${c.c}-Y)+(${c.c}+Y)=${4 * c.c}`, "dans le carré : 4c"),
        ligne(`X>${c.c},\\ |Y|\\leq ${c.c}\\ :\\ 2X+${2 * c.c}>${4 * c.c}`, "dehors : plus que 4c"),
        ...(c.k > 4 * c.c ? [ligne(`2X+${2 * c.c}=${c.k}\\iff X=${nb((c.k - 2 * c.c) / 2)}`, "côté vertical de l'octogone")] : []),
      ];
    case "carreCarres":
      return [
        ligne(`X=${lin("x", c.O.x)}`, "coordonnées depuis le centre"),
        ligne(`Y=${lin("y", c.O.y)}`),
        ligne(`(X-${c.c})^2+(X+${c.c})^2+(Y-${c.c})^2+(Y+${c.c})^2=${c.k}`),
        ligne(`2X^2+2Y^2+${4 * c.c * c.c}=${c.k}`, "on développe"),
        ligne(`X^2+Y^2=${nb((c.k - 4 * c.c * c.c) / 2)}`),
      ];
  }
}

const PIEGE_FAMILLE: Record<Exercice127["famille"], string> = {
  deuxPoints: "Comparer k à AB² au lieu de AB²/2, ou appliquer la formule d'Apollonius pour k = 1 (on diviserait par 0).",
  valeursAbsolues: "Confondre somme et différence : la somme donne un losange borné, la différence des demi-droites.",
  distancesDroites: "Oublier l'un des deux cas (expressions égales ou opposées), ou ignorer que la somme des distances vaut l'écart dans toute la bande.",
  carre: "Confondre les seuils : 4c pour la somme des distances, 4c² pour la somme de leurs carrés.",
};

export function correctionDetaillee127(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const a = lettreEtape(0);
  out.push(
    utilise(a, [t("Lieux (cours, § 4) : on traduit la condition par une équation en x et y, puis on reconnaît la nature (en comparant au seuil quand il y en a un).")]),
    { ...calcul(a, lignesTraduction(e)), figureHtml: figureCorrigeLot(figureCorrige127(e)) },
    resultat(a, [...fr(reponse127(e, "nature")), t(" "), ...raisonNature(e)]),
    piege(a, [t(PIEGE_FAMILLE[e.famille])]),
  );
  if (e.nature !== "vide") {
    const b = lettreEtape(1);
    const el = elements127(e);
    out.push(
      utilise(b, [t("On lit les éléments caractéristiques sur la dernière équation obtenue.")]),
      resultat(b, reponseElements(e)),
      ...(typeChamp127(e.nature) === "cercle" ? [verification(b, [t("Rayon : "), l(`r=\\sqrt{${nb(el.rayon2!)}}=${nb(Math.sqrt(el.rayon2!))}`), t(".")])] : []),
    );
  }
  return out;
}
