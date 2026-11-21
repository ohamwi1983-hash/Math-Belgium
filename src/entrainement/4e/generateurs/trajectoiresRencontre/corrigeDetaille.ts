import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTrajectoires } from "../../core/trajectoiresRencontre.types";
import { mono, q, somme } from "../../ui/corrigeChapitre3";
import { affineL, colonne, l, n, nbp, nombreTexte, plusTerme, t, termeProduit, valeurSubst, type Fr } from "../../ui/outilsAnalytiqueLotG";
import { critere, ctx, figureCorrige, reponseE, reponseInstants, reponseK, reponseNature, reponseVerdict, valeurE } from "../../ui/formatTrajectoires";

/**
 * Corrigé détaillé « comme au tableau » de gen97 (partagé par l'adaptateur et l'appli ; une lettre
 * par ÉCRAN, donc a, b pour des trajectoires parallèles et a–e sinon).
 * a) vecteurs directeurs = coefficients de t, critère de colinéarité ; parallèles : départ du mobile 2
 * hors de la trajectoire 1. b) système à deux inconnues t₁, t₂, élimination de t₂ ligne à ligne,
 * vérification dans l'autre équation. c) K par le mobile 1, vérifié par le mobile 2. d) verdict
 * (t₁ = t₂ ou non) avec la figure des trajectoires. e) instant de la collision ou écart |t₁ − t₂|.
 */

type E = ExerciceTrajectoires;
const COURS_INT = "(cours, § 5)";
const COURS_REL = "(cours, § 4)";

function lignesCritere(e: E): LigneCalcul[] {
  const { v1, v2 } = e;
  return [
    ligne(`\\vec{v_1}=${colonne(v1.x, v1.y)}`, "coefficients de t du mobile 1"),
    ligne(`\\vec{v_2}=${colonne(v2.x, v2.y)}`, "coefficients de t du mobile 2"),
    ligne(`x_{v_1}\\cdot y_{v_2}-y_{v_1}\\cdot x_{v_2}=${n(v1.x)}\\cdot ${nbp(v2.y)}-${nbp(v1.y)}\\cdot ${nbp(v2.x)}`, "critère de colinéarité"),
    ligne(`=${n(critere(e))}`, critere(e) === 0 ? "nul : vecteurs colinéaires" : "non nul : vecteurs non colinéaires"),
  ];
}

function lignesDeparts(e: E): LigneCalcul[] {
  const dx = e.P2.x - e.P1.x;
  const dy = e.P2.y - e.P1.y;
  const val = e.v1.x * dy - e.v1.y * dx;
  return [
    ligne(`\\vec{M_1M_2}=${colonne(dx, dy)}`, "du départ du mobile 1 au départ du mobile 2 (t = 0)"),
    ligne(`x_{v_1}\\cdot ${nbp(dy)}-y_{v_1}\\cdot ${nbp(dx)}=${n(e.v1.x)}\\cdot ${nbp(dy)}-${nbp(e.v1.y)}\\cdot ${nbp(dx)}`, "critère avec le vecteur directeur 1"),
    ligne(`=${n(val)}`, "non nul : le départ du mobile 2 n'est pas sur la trajectoire 1"),
  ];
}

function lignesSysteme(e: E): LigneCalcul[] {
  const { P1, v1, P2, v2 } = e;
  const t1 = e.t1!;
  const t2 = e.t2!;
  const dx = P2.x - P1.x;
  const dy = P2.y - P1.y;
  const D = v1.x * v2.y - v1.y * v2.x;
  const R = v2.y * dx - v2.x * dy;
  const lignes: LigneCalcul[] = [
    ligne(`${affineL(P1.x, v1.x, "t_1")}=${affineL(P2.x, v2.x, "t_2")}`, "même abscisse"),
    ligne(`${somme([[v1.x, "t_1"], [-v2.x, "t_2"]])}=${n(dx)}`, "on regroupe : équation (1)"),
    ligne(`${affineL(P1.y, v1.y, "t_1")}=${affineL(P2.y, v2.y, "t_2")}`, "même ordonnée"),
    ligne(`${somme([[v1.y, "t_1"], [-v2.y, "t_2"]])}=${n(dy)}`, "on regroupe : équation (2)"),
  ];
  if (v2.y !== 1) lignes.push(ligne(`${somme([[v1.x * v2.y, "t_1"], [-v2.x * v2.y, "t_2"]])}=${n(v2.y * dx)}`, `(1) multipliée par ${nombreTexte(v2.y)}`));
  if (v2.x !== 1) lignes.push(ligne(`${somme([[v1.y * v2.x, "t_1"], [-v2.y * v2.x, "t_2"]])}=${n(v2.x * dy)}`, `(2) multipliée par ${nombreTexte(v2.x)}`));
  lignes.push(ligne(`${mono(D, "t_1")}=${n(R)}`, [t("on soustrait membre à membre : "), l("t_2"), t(" disparaît")]));
  if (D !== 1) lignes.push(ligne(`t_1=${q(t1)}`, `on divise par ${nombreTexte(D)}`));
  lignes.push(ligne(`${mono(-v2.x, "t_2")}=${n(dx)}${plusTerme(-v1.x * t1)}`, [t("dans (1), avec "), l(`t_1=${n(t1)}`)]));
  lignes.push(ligne(`=${n(dx - v1.x * t1)}`));
  if (v2.x !== -1) lignes.push(ligne(`t_2=${q(t2)}`, `on divise par ${nombreTexte(-v2.x)}`));
  return lignes;
}

export function correctionDetailleeTrajectoires(e: E): EtapeCorrection[] {
  const c = ctx(e);
  const sortie: EtapeCorrection[] = [
    utilise("a", [t("Chaque trajectoire est une droite dont un vecteur directeur est formé par les coefficients de "), l("t"), t(". Deux droites sont sécantes si leurs vecteurs directeurs ne sont pas colinéaires : "), l("x_1\\cdot y_2-y_1\\cdot x_2\\neq 0"), t(" "), t(COURS_INT), t(".")]),
    calcul("a", e.verdict === "paralleles" ? [...lignesCritere(e), ...lignesDeparts(e)] : lignesCritere(e)),
    resultat("a", reponseNature(e)),
    piege("a", e.verdict === "paralleles" ? [t("Des vecteurs colinéaires ne suffisent pas pour conclure « confondues » : on vérifie si un point de l'une est sur l'autre.")] : [t("Les coefficients de "), l("t"), t(" forment le vecteur directeur ; les termes constants donnent le point de départ (à "), l("t=0"), t(").")]),
  ];
  if (e.verdict === "paralleles") {
    sortie.push(
      utilise("b", [t("Deux trajectoires parallèles distinctes n'ont aucun point commun : les mobiles ne peuvent jamais être au même endroit "), t(COURS_INT), t(".")]),
      calcul("b", [ligne(`x_{v_1}\\cdot y_{v_2}-y_{v_1}\\cdot x_{v_2}=0`, "trajectoires parallèles (étape 1)"), ligne(`x_{v_1}\\cdot ${nbp(e.P2.y - e.P1.y)}-y_{v_1}\\cdot ${nbp(e.P2.x - e.P1.x)}\\neq 0`, "départ 2 hors de la trajectoire 1")]),
      { ...resultat("b", reponseVerdict(e)), figureHtml: figureCorrige(e) },
      piege("b", [t(`Inutile de chercher un instant de rencontre : avec des trajectoires parallèles distinctes, le système n'a aucune solution.`)]),
    );
    return sortie;
  }
  const t1 = e.t1!;
  const t2 = e.t2!;
  const K = e.K!;
  const u = c.temps;
  sortie.push(
    utilise("b", [t("Au point commun K, les deux mobiles ont les mêmes coordonnées, mais chacun à son propre instant : "), l("t_1"), t(" pour le mobile 1, "), l("t_2"), t(" pour le mobile 2. On résout le système par combinaison "), t(COURS_INT), t(".")]),
    calcul("b", lignesSysteme(e)),
    resultat("b", reponseInstants(e)),
    verification("b", [t("Dans l'équation (2) :")], [ligne(`${termeProduit(e.v1.y, t1, true)}${termeProduit(-e.v2.y, t2)}=${n(e.P2.y - e.P1.y)}`, "(2) est vérifiée")]),
    piege("b", [t("Un seul paramètre t pour les deux mobiles revient à chercher directement une collision : on ne trouverait pas le croisement des trajectoires quand les mobiles y passent à des instants différents.")]),
    utilise("c", [l("K"), t(" est la position du mobile 1 à l'instant "), l("t_1"), t(" : on remplace "), l("t"), t(" par "), l("t_1"), t(" dans ses équations "), t(COURS_REL), t(".")]),
    calcul("c", [
      ligne(`x_K=${valeurSubst(e.P1.x, e.v1.x, t1)}`, [t("mobile 1, "), l(`t=${n(t1)}`)]),
      ligne(`=${n(K.x)}`),
      ligne(`y_K=${valeurSubst(e.P1.y, e.v1.y, t1)}`),
      ligne(`=${n(K.y)}`),
    ]),
    resultat("c", reponseK(e)),
    verification("c", [t("Le mobile 2 passe bien en K à l'instant "), l("t_2"), t(" :")], [
      ligne(`x=${valeurSubst(e.P2.x, e.v2.x, t2)}=${n(K.x)}`),
      ligne(`y=${valeurSubst(e.P2.y, e.v2.y, t2)}=${n(K.y)}`),
    ]),
    piege("c", [t("Chaque mobile avec son propre instant : "), l("t_1"), t(" dans les équations du mobile 1, "), l("t_2"), t(" dans celles du mobile 2.")]),
    utilise("d", [t("Il y a collision seulement si les deux mobiles sont au même point au même instant : il faut un point commun et "), l("t_1=t_2"), t(".")]),
    calcul("d", [
      ligne(`t_1=${n(t1)}`, `instant du ${c.mobile} 1 en K`),
      ligne(`t_2=${n(t2)}`, `instant du ${c.mobile} 2 en K`),
      ligne(e.verdict === "collision" ? `t_1=t_2` : `t_1\\neq t_2`, e.verdict === "collision" ? "même instant" : "instants différents"),
    ]),
    { ...resultat("d", reponseVerdict(e)), figureHtml: figureCorrige(e) },
    piege("d", [t("Un point commun aux deux trajectoires ne suffit pas pour une collision : il faut que les deux mobiles y soient en même temps.")]),
  );
  if (e.verdict === "collision") {
    sortie.push(
      utilise("e", [t("La collision a lieu au point K, à l'instant commun "), l("t_1=t_2"), t(".")]),
      calcul("e", [ligne(`t=t_1`, "instant commun"), ligne(`=${n(t1)}`, `en ${c.tempsLong}`)]),
      resultat("e", [...reponseE(e), t(", au point "), ...reponseK(e)]),
      piege("e", [t("Donne l'unité du contexte : t est en "), t(`${c.tempsLong}.`)]),
    );
  } else {
    const premier = t1 < t2 ? 1 : 2;
    sortie.push(
      utilise("e", [t("L'écart de temps entre les deux passages en K est la différence des deux instants, prise positive.")]),
      calcul("e", [ligne(`|t_1-t_2|=|${n(t1)}-${n(t2)}|`, "valeur absolue de la différence"), ligne(`=${n(valeurE(e))}`, `en ${c.tempsLong}`)]),
      resultat("e", reponseE(e)),
      verification("e", [t(`Le ${c.mobile} ${premier} passe en K le premier, `), l(`${n(valeurE(e))}\\ \\text{${u}}`), t(` avant le ${c.mobile} ${3 - premier}.`)]),
      piege("e", [t("Un écart de temps est positif : on retire le plus petit instant du plus grand.")]),
    );
  }
  return sortie;
}

export type { Fr };
