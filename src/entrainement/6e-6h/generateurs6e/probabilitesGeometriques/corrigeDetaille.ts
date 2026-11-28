import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceProbaGeo, PhaseProbaGeo } from "../../core6e/probabilitesGeometriques";
import { longueurFavorable, phasesProbaGeo, probaDonnee, probabilite, totale, valeurPi, valPiL } from "../../core6e/probabilitesGeometriques";
import { reponse } from "../../ui6e/formatProbabilitesGeometriques";
import { nbL, piL, q, qL, qSub } from "../../../5e-4h/ui5e/nombresTrigo";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen162` (probabilités géométriques), partagé par l'appli
 * et le papier — une lettre par écran : aire (ou longueur) totale, aire de la zone, probabilité (ou
 * rayon). Chaque valeur est calculée depuis l'instance ; les fractions et π restent exacts jusqu'au
 * bout (cours, § 1 : P = aire favorable / aire totale, longueur sur un segment).
 */

type E = ExerciceProbaGeo;
const t = texte;
const f = latex;
const fr = (x: Frag[]) => x as unknown as FragmentConsigne[];
const COURS = "(cours, point 1, probabilités géométriques)";
const LETTRES = "abc";

/** « = n/d » (justification éventuelle), puis la forme réduite si elle diffère. */
function lignesFraction(n: number, d: number, justif?: string | FragmentConsigne[]): LigneCalcul[] {
  const r = q(n, d);
  const lignes = [ligne(`=\\dfrac{${n}}{${d}}`, justif)];
  if (r.n !== n || r.d !== d) lignes.push(ligne(`=${qL(r)}`, r.d === 1 ? "on simplifie" : `on simplifie par ${n / r.n}`));
  return lignes;
}

function etapeTotale(e: E, sq: string): EtapeCorrection[] {
  switch (e.variante) {
    case "cible":
    case "cibleInverse":
      return [
        utilise(sq, [t("Aire d'un disque de rayon "), f("r"), t(" : "), f("\\mathcal{A}=\\pi r^2"), t(` ${COURS}.`)]),
        calcul(sq, [ligne(`\\mathcal{A}_{\\text{cible}}=\\pi\\cdot ${e.R}^2`, "rayon de la cible"), ligne(`=${e.R * e.R}\\pi`)]),
        resultat(sq, fr(reponse(e, "totale"))),
        piege(sq, [t("Écrire "), f("2\\pi r"), t(" (le périmètre) ou oublier le carré du rayon.")]),
      ];
    case "carreDisque":
      return [utilise(sq, [t("Aire d'un carré de côté "), f("c"), t(" : "), f("\\mathcal{A}=c^2"), t(".")]), calcul(sq, [ligne(`\\mathcal{A}_{\\text{carreau}}=${e.c}^2`), ligne(`=${e.c * e.c}`)]), resultat(sq, fr(reponse(e, "totale")))];
    case "rectangleQuart":
      return [utilise(sq, [t("Aire d'un rectangle : "), f("\\mathcal{A}=L\\times l"), t(".")]), calcul(sq, [ligne(`\\mathcal{A}_{\\text{rectangle}}=${e.L}\\times ${e.l}`), ligne(`=${e.L * e.l}`)]), resultat(sq, fr(reponse(e, "totale")))];
    case "rendezVous":
      return [
        utilise(sq, [t("Le point "), f("(x\\,;y)"), t(" est choisi au hasard dans le carré des arrivées possibles, de côté "), f(`${e.T}`), t(" minutes : chaque point a la même chance.")]),
        calcul(sq, [ligne(`\\mathcal{A}_{\\text{carré}}=${e.T}\\times ${e.T}`), ligne(`=${e.T * e.T}`)]),
        resultat(sq, fr(reponse(e, "totale"))),
      ];
    case "segment":
      return [];
  }
}

function etapeFavorable(e: E, sq: string): EtapeCorrection[] {
  switch (e.variante) {
    case "cible":
      if (e.r1 === 0)
        return [
          utilise(sq, [t("La zone grisée est le disque central : "), f("\\mathcal{A}=\\pi r^2"), t(".")]),
          calcul(sq, [ligne(`\\mathcal{A}_{\\text{zone}}=\\pi\\cdot ${e.r2}^2`, "rayon du disque central"), ligne(`=${e.r2 * e.r2}\\pi`)]),
          resultat(sq, fr(reponse(e, "favorable"))),
        ];
      return [
        utilise(sq, [t("Aire d'une couronne = aire du grand disque moins aire du petit disque.")]),
        calcul(sq, [
          ligne(`\\mathcal{A}_{\\text{zone}}=\\pi\\cdot ${e.r2}^2-\\pi\\cdot ${e.r1}^2`, e.r2 === e.R ? "le grand disque est la cible entière" : "deux disques de même centre"),
          ligne(`=${e.r2 * e.r2}\\pi-${e.r1 * e.r1}\\pi`),
          ligne(`=${e.r2 * e.r2 - e.r1 * e.r1}\\pi`),
        ]),
        resultat(sq, fr(reponse(e, "favorable"))),
        piege(sq, [t("Calculer "), f(`\\pi(${e.r2}-${e.r1})^2`), t(" : on soustrait les aires, pas les rayons.")]),
      ];
    case "cibleInverse":
      return [
        utilise(sq, [t("La probabilité est le quotient des aires : "), f("P=\\dfrac{\\mathcal{A}_{\\text{disque}}}{\\mathcal{A}_{\\text{cible}}}"), t(", donc "), f("\\mathcal{A}_{\\text{disque}}=P\\times\\mathcal{A}_{\\text{cible}}"), t(".")]),
        calcul(sq, [ligne(`\\mathcal{A}_{\\text{disque}}=${qL(probaDonnee(e))}\\times ${e.R * e.R}\\pi`), ligne(`=${e.r * e.r}\\pi`)]),
        resultat(sq, fr(reponse(e, "favorable"))),
      ];
    case "carreDisque": {
      const k = (e.c * e.c) / 4;
      const lignes = [ligne(`r=\\dfrac{${e.c}}{2}=${e.c / 2}`, "le diamètre du disque inscrit est le côté"), ligne(`\\mathcal{A}_{\\text{disque}}=\\pi\\cdot ${e.c / 2}^2`), ligne(`=${k}\\pi`)];
      if (e.hors) lignes.push(ligne(`\\mathcal{A}_{\\text{zone}}=${e.c * e.c}-${k}\\pi`, "le carreau moins le disque"));
      return [
        utilise(sq, e.hors ? [t("La zone grisée est le carreau privé du disque inscrit, dont le rayon est la moitié du côté.")] : [t("Le disque inscrit a pour diamètre le côté du carré ; aire "), f("\\pi r^2"), t(".")]),
        calcul(sq, lignes),
        resultat(sq, fr(reponse(e, "favorable"))),
        ...(e.hors ? [piege(sq, [t("Donner l'aire du disque : la zone grisée est ce qui reste autour.")])] : []),
      ];
    }
    case "rectangleQuart": {
      const quart = q(e.r * e.r, 4);
      const lignes = [ligne(`\\mathcal{A}_{\\text{quart}}=\\dfrac{\\pi\\cdot ${e.r}^2}{4}`, "le quart de l'aire du disque"), ligne(`=${piL(quart)}`)];
      if (e.hors) lignes.push(ligne(`\\mathcal{A}_{\\text{zone}}=${e.L * e.l}-${piL(quart)}`, "le rectangle moins le quart de disque"));
      return [
        utilise(sq, e.hors ? [t("La zone grisée est le rectangle privé du quart de disque (un quart de l'aire d'un disque).")] : [t("Un quart de disque a le quart de l'aire du disque : "), f("\\dfrac{\\pi r^2}{4}"), t(".")]),
        calcul(sq, lignes),
        resultat(sq, fr(reponse(e, "favorable"))),
        piege(sq, e.hors ? [t("Donner l'aire du quart de disque : la zone grisée est ce qui reste du rectangle.")] : [t("Prendre l'aire du disque entier, "), f("\\pi r^2"), t(", au lieu d'un quart.")]),
      ];
    }
    case "segment": {
      const ell = longueurFavorable(e);
      let lignes: LigneCalcul[];
      let pg: FragmentConsigne[] | null = null;
      if (e.type === "entre") lignes = [ligne(`${e.a}\\le AM\\le ${e.b}`, "M entre les points situés à ces distances de A"), ligne(`\\ell=${e.b}-${e.a}`), ligne(`=${ell}`)];
      else if (e.type === "loin") {
        lignes = [ligne(`${e.a}<AM<${e.L}-${e.a}`, [t("car "), f(`MB=${e.L}-AM>${e.a}`)]), ligne(`\\ell=(${e.L}-${e.a})-${e.a}`), ligne(`=${ell}`)];
        pg = [t("Oublier une des deux extrémités : il faut retirer "), f(`${e.a}`), t(" cm du côté de "), f("A"), t(" et du côté de "), f("B"), t(".")];
      } else {
        lignes = [ligne(`AM\\ge ${e.a}\\ \\text{ou}\\ AM\\le ${e.L}-${e.a}`, [t("car "), f(`MB=${e.L}-AM`)]), ligne(`\\ell=(${e.L}-${e.a})+(${e.L}-${e.a})`, "deux parties de même longueur"), ligne(`=${ell}`)];
        pg = [t("Ne compter que le cas où "), f("[AM]"), t(" est le plus long morceau : "), f("[MB]"), t(" peut l'être aussi.")];
      }
      return [
        utilise(sq, [t(`Sur un segment, on compare des longueurs ${COURS} : on repère toutes les positions de `), f("M"), t(" qui conviennent ("), f("AM"), t(" est la distance de "), f("A"), t(" à "), f("M"), t(").")]),
        calcul(sq, lignes),
        resultat(sq, fr(reponse(e, "favorable"))),
        ...(pg ? [piege(sq, pg)] : []),
      ];
    }
    case "rendezVous": {
      const c = e.T - e.t;
      return [
        utilise(sq, [t("Ils ne se rencontrent pas quand "), f(`|x-y|>${e.t}`), t(" : hors de la bande, il reste deux triangles rectangles isocèles ; aire d'un triangle rectangle = moitié du produit des côtés de l'angle droit.")]),
        calcul(sq, [ligne(`${e.T}-${e.t}=${c}`, "côtés de l'angle droit de chaque triangle"), ligne(`\\mathcal{A}=2\\times\\dfrac{${c}\\times ${c}}{2}`, "deux triangles"), ligne(`=${c * c}`)]),
        resultat(sq, fr(reponse(e, "favorable"))),
        piege(sq, [t("Ne compter qu'un seul des deux triangles.")]),
      ];
    }
  }
}

function etapeProba(e: E, sq: string): EtapeCorrection[] {
  const P = probabilite(e);
  const verif = [verification(sq, [t("Une probabilité est comprise entre 0 et 1 : "), f(`0\\le ${valPiL(P)}\\approx ${nbL(valeurPi(P), 3)}\\le 1`), t(".")])];
  const intro = utilise(sq, [t(`Probabilité géométrique ${COURS} : chaque point a la même chance, donc `), f(e.variante === "segment" ? "P=\\dfrac{\\text{longueur favorable}}{\\text{longueur totale}}" : "P=\\dfrac{\\text{aire favorable}}{\\text{aire totale}}"), t(".")]);
  switch (e.variante) {
    case "cible": {
      const fav = e.r2 * e.r2 - e.r1 * e.r1;
      const tot = e.R * e.R;
      return [
        intro,
        calcul(sq, [ligne(`P=\\dfrac{${fav}\\pi}{${tot}\\pi}`), ...lignesFraction(fav, tot, [t("on simplifie par "), f("\\pi")])]),
        resultat(sq, fr(reponse(e, "proba"))),
        ...verif,
        piege(sq, [t("Comparer les rayons, "), f(`\\dfrac{${e.r2}-${e.r1}}{${e.R}}`), t(" : ce sont les aires qu'on compare.")]),
      ];
    }
    case "carreDisque":
    case "rectangleQuart": {
      const tot = totale(e).a.n;
      const nomForme = e.variante === "carreDisque" ? "\\text{disque}" : "\\text{quart}";
      const nomTot = e.variante === "carreDisque" ? "\\text{carreau}" : "\\text{rectangle}";
      const num = e.variante === "carreDisque" ? (e.c * e.c) / 4 : e.r * e.r;
      const den = e.variante === "carreDisque" ? tot : 4 * tot;
      const pf = q(num, den);
      const lignes =
        e.variante === "carreDisque"
          ? [ligne(`P(${nomForme})=\\dfrac{${num}\\pi}{${tot}}`)]
          : [ligne(`P(${nomForme})=\\dfrac{\\pi\\cdot ${e.r}^2}{4\\times ${tot}}`), ligne(`=\\dfrac{${num}\\pi}{${den}}`)];
      if (pf.n !== num) lignes.push(ligne(`=${piL(pf)}`, `on simplifie par ${num / pf.n}`));
      if (e.hors) lignes.push(ligne(`P(\\text{zone})=1-${piL(pf)}`, [t("la zone grisée est le contraire : "), f(`\\mathcal{A}_{\\text{zone}}=\\mathcal{A}_{${nomTot}}-\\mathcal{A}_{${nomForme}}`)]));
      return [intro, calcul(sq, lignes), resultat(sq, fr(reponse(e, "proba"))), ...verif, ...(e.hors ? [piege(sq, [t("Oublier de passer au contraire : "), f(piL(pf)), t(" est la probabilité de tomber dans la forme.")])] : [])];
    }
    case "segment": {
      const ell = longueurFavorable(e);
      return [intro, calcul(sq, [ligne(`P=\\dfrac{\\ell}{AB}`), ...lignesFraction(ell, e.L)]), resultat(sq, fr(reponse(e, "proba"))), ...verif];
    }
    case "rendezVous": {
      const c2 = (e.T - e.t) ** 2;
      const T2 = e.T * e.T;
      const pas = q(c2, T2);
      const lignes = [ligne(`P(\\text{pas de rencontre})=\\dfrac{${c2}}{${T2}}`, "les deux triangles sur le carré"), ...(pas.d !== T2 ? [ligne(`=${qL(pas)}`, "on simplifie")] : [])];
      if (e.rencontre) lignes.push(ligne(`P(\\text{rencontre})=1-${qL(pas)}`, "événement contraire"), ligne(`=${qL(qSub(q(1), pas))}`));
      return [intro, calcul(sq, lignes), resultat(sq, fr(reponse(e, "proba"))), ...verif, ...(e.rencontre ? [piege(sq, [t("Donner "), f(qL(pas)), t(" : c'est la probabilité qu'ils ne se rencontrent pas.")])] : [])];
    }
    case "cibleInverse":
      return [];
  }
}

function etapeRayon(e: E, sq: string): EtapeCorrection[] {
  if (e.variante !== "cibleInverse") return [];
  const r2 = e.r * e.r;
  return [
    utilise(sq, [t("L'aire du disque central est "), f("\\pi r^2"), t(" ; on résout en gardant la solution positive (un rayon).")]),
    calcul(sq, [ligne(`\\pi r^2=${r2}\\pi`), ligne(`r^2=${r2}`, [t("on divise par "), f("\\pi")]), ligne(`r=\\sqrt{${r2}}`, [f("r>0")]), ligne(`=${e.r}`)]),
    resultat(sq, fr(reponse(e, "rayon"))),
    verification(sq, [t("Quotient des aires : "), f(`\\dfrac{\\pi\\cdot ${e.r}^2}{\\pi\\cdot ${e.R}^2}=\\dfrac{${r2}}{${e.R * e.R}}=${qL(probaDonnee(e))}`), t(".")]),
    piege(sq, [t("Écrire "), f(`r=${qL(probaDonnee(e))}\\times ${e.R}`), t(" : ce sont les aires, donc les carrés des rayons, qui sont proportionnelles.")]),
  ];
}

export function correctionDetailleeProbaGeo(e: E): EtapeCorrection[] {
  return phasesProbaGeo(e).flatMap((p: PhaseProbaGeo, i) => {
    const sq = LETTRES[i]!;
    if (p === "totale") return etapeTotale(e, sq);
    if (p === "favorable") return etapeFavorable(e, sq);
    if (p === "rayon") return etapeRayon(e, sq);
    return etapeProba(e, sq);
  });
}

