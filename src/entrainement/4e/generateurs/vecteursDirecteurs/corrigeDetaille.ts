import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceVecteursDirecteurs, OptionVecteur } from "../../core/vecteursDirecteurs.types";
import { q } from "../../ui/corrigeChapitre3";
import { deplacementTexte, directeurG, equationGL, figureCorrige, mG, nomVecteur, reponseB } from "../../ui/formatVecteursDirecteurs";
import { colonne, l, n, nbp, pointL, t, type Fr } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen129 (partagé par l'adaptateur et l'appli, une lettre
 * par écran). a) points lus, composantes « arrivée moins départ », vecteur directeur, vérification
 * par les carreaux, figure annotée ; b) critère de colinéarité avec le vecteur lu, une ligne par
 * vecteur proposé ; c) coefficient m, vecteur (1 ; m), multiple sans fraction, vérification par deux
 * points de g (ou droite horizontale / verticale).
 */

type E = ExerciceVecteursDirecteurs;
const COURS = "(cours, point 15)";

/** « 3\cdot 2-1\cdot 6 » : critère de colinéarité de u (lu) et v. */
function critereL(u: { x: number; y: number }, v: { x: number; y: number }): string {
  return `${nbp(u.x)}\\cdot ${nbp(v.y)}-${nbp(u.y)}\\cdot ${nbp(v.x)}`;
}

function ligneOption(e: E, o: OptionVecteur, i: number): LigneCalcul {
  const valeur = e.u.x * o.v.y - e.u.y * o.v.x;
  const nom = l(`\\vec{u_{${i + 1}}}`);
  if (Math.abs(valeur) < 1e-12) return ligne(`${critereL(e.u, o.v)}=0`, [nom, t(" : colinéaire, vecteur directeur")]);
  return ligne(`${critereL(e.u, o.v)}=${q(valeur)}\\neq 0`, [nom, t(" : pas colinéaire")]);
}

function etapeA(e: E): EtapeCorrection[] {
  const [a, b] = e.noms;
  const nom = nomVecteur(e);
  const u = e.u;
  const sortie: EtapeCorrection[] = [];
  if (e.variante === "parallele") {
    sortie.push(utilise("a", [t("Deux droites parallèles ont les mêmes vecteurs directeurs : un vecteur défini par deux points distincts de (EF) est un vecteur directeur de d "), t(COURS), t(". Ses composantes : arrivée moins départ.")]));
  } else {
    sortie.push(utilise("a", [t("Un vecteur défini par deux points distincts de d est un vecteur directeur de d "), t(COURS), t(". Ses composantes : arrivée moins départ.")]));
  }
  sortie.push(
    calcul(
      "a",
      [
        ligne(`\\vec{${nom}}=${colonne(`x_${b}-x_${a}`, `y_${b}-y_${a}`)}`, "arrivée moins départ"),
        ligne(`=${colonne(`${n(e.P2.x)}-${nbp(e.P1.x)}`, `${n(e.P2.y)}-${nbp(e.P1.y)}`)}`, "coordonnées lues"),
        ligne(`=${colonne(u.x, u.y)}`),
      ],
      [t("On lit sur le quadrillage : "), l(pointL(a, e.P1)), t(" et "), l(pointL(b, e.P2)), t(".")],
    ),
  );
  const multiple = { x: -u.x, y: -u.y };
  sortie.push(
    resultat("a", [l(`\\vec{${nom}}${colonne(u.x, u.y)}`), t(" est un vecteur directeur de d ; tout multiple non nul convient aussi, par exemple "), l(colonne(multiple.x, multiple.y)), t(".")]),
  );
  const figure = figureCorrige(e);
  sortie[sortie.length - 1]!.figureHtml = figure;
  sortie.push(verification("a", [t(`Sur la figure, de ${a} on avance de ${deplacementTexte(u)} : on arrive bien en ${b}.`)]));
  if (e.variante === "horizontale-verticale") {
    sortie.push(piege("a", [t(u.y === 0 ? "Droite horizontale : la seconde composante est nulle, " : "Droite verticale : la première composante est nulle, "), l(colonne(u.y, u.x)), t(" serait perpendiculaire à d.")]));
  } else {
    sortie.push(piege("a", [t("La première composante est l'écart des abscisses : "), l(colonne(u.y, u.x)), t(" (composantes échangées) n'est pas un vecteur directeur de d.")]));
  }
  return sortie;
}

function etapeB(e: E): EtapeCorrection[] {
  const nom = nomVecteur(e);
  const echangees = e.options.findIndex((o) => o.nature === "echangees");
  const autre = e.options.findIndex((o) => !o.juste && o.nature !== "echangees");
  const oppose = e.options.findIndex((o) => o.nature === "oppose");
  const nature = (i: number) => (e.options[i]!.nature === "echangees" ? "composantes échangées" : e.options[i]!.nature === "normal" ? "perpendiculaire à d" : e.options[i]!.nature === "signe" && e.u.x !== 0 && e.u.y !== 0 ? "une composante de signe changé" : "pas colinéaire");
  const piegeFr: Fr = [t("Ni "), l(`\\vec{u_{${echangees + 1}}}`), t(` (${nature(echangees)}) ni `), l(`\\vec{u_{${autre + 1}}}`), t(` (${nature(autre)}) ne sont des vecteurs directeurs. L'opposé `), l(`\\vec{u_{${oppose + 1}}}`), t(" en est un : un vecteur directeur peut changer de sens.")];
  return [
    utilise("b", [t("Un vecteur non nul est un vecteur directeur de d s'il est colinéaire à "), l(`\\vec{${nom}}`), t(" : critère de colinéarité "), l("x_u\\cdot y_v-y_u\\cdot x_v=0"), t(" (cours, points 13 et 15).")]),
    calcul("b", e.options.map((o, i) => ligneOption(e, o, i)), [t("Avec "), l(`\\vec{${nom}}${colonne(e.u.x, e.u.y)}`), t(", pour chaque vecteur proposé :")]),
    resultat("b", [t("Vecteurs directeurs de d : "), ...reponseB(e), t(".")]),
    piege("b", piegeFr),
  ];
}

function etapeC(e: E): EtapeCorrection[] {
  const g = e.g;
  if (g.type !== "affine") {
    const horizontale = g.type === "horizontale";
    const v = directeurG(g);
    const P = horizontale ? { x: 0, y: g.k } : { x: g.k, y: 0 };
    const Q = horizontale ? { x: 1, y: g.k } : { x: g.k, y: 1 };
    return [
      utilise("c", [
        t(horizontale ? "Une droite d'équation " : "Une droite d'équation "),
        l(horizontale ? "y=k" : "x=k"),
        t(horizontale ? " est horizontale (parallèle à l'axe des x) : vecteur directeur " : " est verticale (parallèle à l'axe des y) : vecteur directeur "),
        l(horizontale ? colonne("k", 0) : colonne(0, "k")),
        t(", avec "),
        l("k\\neq 0"),
        t(` ${COURS}.`),
      ]),
      calcul("c", [ligne(equationGL(g), horizontale ? "pas de x : tous les points ont la même ordonnée" : "pas de y : tous les points ont la même abscisse"), ligne(`\\vec{v}=${colonne(v.x, v.y)}`, horizontale ? "y ne change pas" : "x ne change pas")]),
      resultat("c", [l(`\\vec{v}${colonne(v.x, v.y)}`), t(" est un vecteur directeur de g ; tout multiple non nul convient aussi.")]),
      verification("c", [t("Deux points de g : "), l(`(${n(P.x)}\\,;${n(P.y)})`), t(" et "), l(`(${n(Q.x)}\\,;${n(Q.y)})`), t(" :")], [ligne(`${colonne(`${n(Q.x)}-${nbp(P.x)}`, `${n(Q.y)}-${nbp(P.y)}`)}=${colonne(v.x, v.y)}`, "arrivée moins départ")]),
      piege("c", [t(horizontale ? "Une droite d'équation y = k est horizontale, pas verticale : " : "Une droite d'équation x = k est verticale, pas horizontale : "), l(colonne(v.y, v.x)), t(" lui est perpendiculaire.")]),
    ];
  }
  const m = mG(g);
  const v = directeurG(g);
  const lignes: LigneCalcul[] = [ligne(`m=${q(m)}`, "coefficient de x dans l'équation"), ligne(`\\vec{v}=${colonne(1, m)}`, [t("vecteur "), l(colonne(1, "m"))])];
  if (g.den !== 1) lignes.push(ligne(`${g.den}\\vec{v}=${colonne(g.den, g.num)}`, `on multiplie par ${g.den} : plus de fraction`));
  const x2 = g.den;
  const y2 = g.num + g.p;
  return [
    utilise("c", [t("Une droite d'équation "), l("y=mx+p"), t(" a pour vecteur directeur "), l(colonne(1, "m")), t(` : quand x augmente de 1, y augmente de m ${COURS}. Tout multiple non nul convient aussi.`)]),
    calcul("c", lignes),
    resultat("c", g.den === 1 ? [l(`\\vec{v}${colonne(1, m)}`), t(" est un vecteur directeur de g.")] : [l(`\\vec{v}${colonne(1, m)}`), t(" ou, sans fraction, "), l(colonne(v.x, v.y)), t(" est un vecteur directeur de g.")]),
    verification(
      "c",
      [t("Deux points de g, pour "), l("x=0"), t(" et pour "), l(`x=${x2}`), t(" :")],
      [
        ligne(`${q(m)}\\cdot 0${g.p < 0 ? `-${q(-g.p)}` : `+${q(g.p)}`}=${n(g.p)}`, [t("le point "), l(`(0\\,;${n(g.p)})`)]),
        ligne(`${q(m)}\\cdot ${x2}${g.p < 0 ? `-${q(-g.p)}` : `+${q(g.p)}`}=${n(y2)}`, [t("le point "), l(`(${x2}\\,;${n(y2)})`)]),
        ligne(`${colonne(`${x2}-0`, `${n(y2)}-${nbp(g.p)}`)}=${colonne(v.x, v.y)}`, "le vecteur qui les joint"),
      ],
    ),
    piege("c", [t("Le terme "), l(`p=${n(g.p)}`), t(" place la droite mais ne change pas sa direction ; et m est la seconde composante : "), l(colonne(v.y, v.x)), t(" (composantes échangées) ne convient pas.")]),
  ];
}

export function correctionDetailleeVecteursDirecteurs(e: E): EtapeCorrection[] {
  return [...etapeA(e), ...etapeB(e), ...etapeC(e)];
}
