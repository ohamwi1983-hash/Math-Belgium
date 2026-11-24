import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceLectureGraphiqueDerivees } from "../../core5e/lectureGraphiqueDerivees.types";
import { ecransParcourus, type EcranLectureGraphiqueDerivees } from "../../moteur5e/typesLectureGraphiqueDerivees";
import { listeAsymptotes } from "../../moteur5e/typesLectureGraphiqueLimites";
import { pointsTangenteHorizontale, tableauFPrimeAttendu, tableauFSecondeAttendu } from "../../moteur5e/verificationLectureGraphiqueDerivees";
import { formatEnteteColonnesTableauFPrime, formatEnteteColonnesTableauFSeconde, formatReponseAttenduePhaseLatex } from "../../ui5e/formatLectureGraphiqueDerivees";
import {
  COURS_LECTURE,
  COURS_SIGNE,
  dixiemeL,
  dixiemeT,
  f,
  finaliser,
  liste,
  phraseSens,
  t,
  tableauSignesEtudeLatex,
  zonesTableau,
  type Fragments,
} from "../../ui5e/corrigeDerivees1";
import { svgLectureGraphiqueDerivees } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de 5gen30 (lecture graphique — dérivées) — règle
 * `.claude/rules/feuilles-evaluations.md`, « Lectures graphiques et décisions » : une relation par chose
 * lue, la justification dit OÙ on la lit sur le graphique. Une lettre par ÉCRAN (`ecransParcourus`) :
 * asymptotes (pente d'une oblique calculée entre deux points de la droite, graphique annoté en figure),
 * tangentes horizontales, signe de f′ zone par zone (sens de la courbe), valeurs des extremums, points
 * d'inflexion, signe de f″ (concavité). Tableaux : MÊME attendu que l'écran. SANS `docx` : importé par
 * l'adaptateur ET par `App5gen30.tsx`.
 */

const LETTRES = "abcdefgh";

export function lettreEcranLectureGraphiqueDerivees(e: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): string {
  return LETTRES[ecransParcourus(e).indexOf(ecran)] ?? "a";
}

const inf = (s: number) => (s > 0 ? "+\\infty" : "-\\infty");
const infT = (s: number) => (s > 0 ? "+∞" : "−∞");

function lignesAsymptotes(e: ExerciceLectureGraphiqueDerivees): LigneCalcul[] {
  const { vas, infini } = e.asymptotique;
  const lignes: LigneCalcul[] = [];
  for (const va of vas) {
    const cotes = [va.pointIsoleGauche === undefined ? `à gauche (vers ${infT(va.signeGauche)})` : null, va.pointIsoleDroit === undefined ? `à droite (vers ${infT(va.signeDroit)})` : null].filter(Boolean);
    lignes.push(ligne(`x=${dixiemeL(va.position)}`, `asymptote verticale : la courbe longe la droite pointillée verticale ${cotes.join(" et ")}`));
  }
  if (infini.type === "horizontale") {
    if (infini.limitePlusInfini === infini.limiteMoinsInfini) lignes.push(ligne(`y=${dixiemeL(infini.limitePlusInfini)}`, "asymptote horizontale : aux deux extrémités, la courbe se rapproche de la droite pointillée horizontale"));
    else {
      lignes.push(ligne(`y=${dixiemeL(infini.limiteMoinsInfini)}`, "asymptote horizontale en −∞ : à l'extrémité gauche, la courbe se rapproche de cette droite"));
      lignes.push(ligne(`y=${dixiemeL(infini.limitePlusInfini)}`, "asymptote horizontale en +∞ : à l'extrémité droite, la courbe se rapproche de cette droite"));
    }
  } else if (infini.type === "oblique") {
    const { pente: a, ordonnee: b } = infini;
    lignes.push(ligne(`b=${dixiemeL(b)}`, `la droite oblique coupe l'axe vertical en (0 ; ${dixiemeT(b)})`));
    lignes.push(ligne(`a=\\dfrac{${dixiemeL(a * 2 + b)}-${b < 0 ? `(${dixiemeL(b)})` : dixiemeL(b)}}{2-0}`, `pente entre les points (0 ; ${dixiemeT(b)}) et (2 ; ${dixiemeT(2 * a + b)}) de la droite`));
    lignes.push(ligne(`=${dixiemeL(a)}`));
    const terme = a === 1 ? "x" : a === -1 ? "-x" : `${dixiemeL(a)}x`;
    lignes.push(ligne(`y=${terme}${b === 0 ? "" : b > 0 ? `+${dixiemeL(b)}` : `-${dixiemeL(-b)}`}`, "asymptote oblique y = ax + b"));
  } else {
    lignes.push(ligne(`\\lim\\limits_{x\\to -\\infty}f(x)=${inf(infini.signeMoinsInfini)}`, "à gauche, la courbe part sans fin sans suivre aucune droite : pas d'asymptote"));
    lignes.push(ligne(`\\lim\\limits_{x\\to +\\infty}f(x)=${inf(infini.signePlusInfini)}`, "à droite, de même : pas d'asymptote"));
  }
  return lignes;
}

function liste2(formules: string[]): Fragments {
  return formules.some((l) => /\\text\{aucun/.test(l)) ? [t(formules[0].replace(/^\\text\{(.*)\}$/, "$1").replace(/^./, (c) => c.toUpperCase()) + ".")] : liste(formules);
}

export function correctionDetailleeLectureGraphiqueDerivees(e: ExerciceLectureGraphiqueDerivees): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  const points = pointsTangenteHorizontale(e);
  for (const ecran of ecransParcourus(e)) {
    const l = lettreEcranLectureGraphiqueDerivees(e, ecran);
    switch (ecran) {
      case "asymptotes": {
        const aucune = listeAsymptotes(e.asymptotique).length === 0;
        etapes.push(
          utilise(l, [
            t("Asymptote verticale "),
            f("x=a"),
            t(" : la courbe longe une droite verticale ; horizontale "),
            f("y=L"),
            t(" : la courbe s'en rapproche à une extrémité ; oblique "),
            f("y=ax+b"),
            t(` : b se lit sur l'axe vertical, a = pente entre deux points de la droite ${COURS_LECTURE}.`),
          ]),
          calcul(l, lignesAsymptotes(e)),
          { ...resultat(l, aucune ? [t("Aucune asymptote.")] : liste(formatReponseAttenduePhaseLatex(e, "asymptotes"))), figureHtml: svgLectureGraphiqueDerivees(e, true) },
        );
        if (aucune) etapes.push(piege(l, [t("Les branches partent vers ±∞ sans se rapprocher d'aucune droite : il n'y a pas d'asymptote.")]));
        else if (e.asymptotique.vas.length > 0) etapes.push(piege(l, [t("Une asymptote verticale a une équation de la forme « x = … », pas « y = … ».")]));
        break;
      }
      case "zerosFPrime": {
        const lignes: LigneCalcul[] =
          points.length === 0
            ? [ligne("f'(x)\\neq 0", "la courbe monte ou descend partout, sans jamais s'aplatir")]
            : points.map((p) =>
                ligne(
                  `x\\approx ${dixiemeL(p.position)}`,
                  p.classification === "max" ? "sommet d'une bosse : tangente horizontale" : p.classification === "min" ? "fond d'un creux : tangente horizontale" : "palier : la courbe s'aplatit sans changer de sens",
                ),
              );
        etapes.push(
          utilise(l, [t("f′(x) est la pente de la tangente : elle est nulle au sommet d'une bosse, au fond d'un creux, et en un palier où la courbe s'aplatit un instant "), t(`${COURS_LECTURE}.`)]),
          calcul(l, lignes),
          resultat(l, liste2(formatReponseAttenduePhaseLatex(e, "zerosFPrime"))),
        );
        break;
      }
      case "tableauFPrime": {
        const attendu = tableauFPrimeAttendu(e);
        const ent = formatEnteteColonnesTableauFPrime(e, attendu.colonnes);
        const zones = zonesTableau(attendu, ent);
        const lignes: LigneCalcul[] = zones.map((z) =>
          ligne(`f'(x)${z.signe === "+" ? ">" : "<"}0\\text{ sur }]${z.gauche}\\,;\\,${z.droite}[`, z.signe === "+" ? "la courbe monte sur cet intervalle" : "la courbe descend sur cet intervalle"),
        );
        for (const p of points) {
          lignes.push(
            ligne(
              `f'(${dixiemeL(p.position)})=0`,
              p.classification === "max" ? "la courbe passe de ↗ à ↘ : maximum" : p.classification === "min" ? "la courbe passe de ↘ à ↗ : minimum" : "la courbe garde le même sens : ni maximum ni minimum",
            ),
          );
        }
        etapes.push(
          utilise(l, [t(`f′ > 0 là où la courbe monte, f′ < 0 là où elle descend ; f′ n'existe pas en une asymptote verticale. Un zéro de f′ est un maximum (↗ puis ↘), un minimum (↘ puis ↗) ou ni l'un ni l'autre ${COURS_SIGNE}.`)]),
          calcul(l, lignes),
          resultat(l, [f(tableauSignesEtudeLatex(attendu, ent, "fprime"))], "Tableau de signes"),
          resultat(l, [...phraseSens(zones, "fprime"), ...(points.length ? [t(" "), ...liste(formatReponseAttenduePhaseLatex(e, "tableauFPrime")), t(".")] : [])]),
          piege(
            l,
            e.paliers.length > 0
              ? [t("En un palier, la tangente est horizontale mais la courbe garde le même sens : ce n'est ni un maximum ni un minimum.")]
              : [t("Le signe de f′ se lit sur le sens de la courbe (elle monte : f′ > 0), pas sur sa position au-dessus ou au-dessous de l'axe des abscisses.")],
          ),
        );
        break;
      }
      case "extremums":
        etapes.push(
          utilise(l, [t(`La valeur d'un extremum est l'ordonnée du sommet (ou du fond) : on la lit sur l'axe vertical, à hauteur du point ${COURS_LECTURE}.`)]),
          calcul(
            l,
            e.extrema.map((x) => ligne(`f(${dixiemeL(x.position)})\\approx ${dixiemeL(x.valeur)}`, `${x.classification === "max" ? "sommet" : "fond"} (${dixiemeT(x.position)} ; ${dixiemeT(x.valeur)}) : ordonnée lue sur l'axe vertical`)),
          ),
          resultat(l, liste(formatReponseAttenduePhaseLatex(e, "extremums"))),
        );
        break;
      case "inflexions": {
        const att = tableauFSecondeAttendu(e);
        const lignes: LigneCalcul[] =
          e.inflexions.length === 0
            ? [ligne("f''(x)\\neq 0", "sur chaque intervalle, la courbe garde la même courbure")]
            : e.inflexions.map((p) => {
                const i = att.colonnes.findIndex((c) => c.type === "racine" && Math.abs(e.inflexions[c.index].position - p.position) < 1e-9);
                const avant = att.signes[i - 1] === "+" ? "∪" : "∩";
                const apres = att.signes[i + 1] === "+" ? "∪" : "∩";
                const palier = e.paliers.some((x) => Math.abs(x.position - p.position) < 1e-6);
                return ligne(`x\\approx ${dixiemeL(p.position)}`, `${palier ? "palier : " : ""}la courbe passe de ${avant} à ${apres}`);
              });
        etapes.push(
          utilise(l, [t(`Un point d'inflexion est un point où la courbe passe de ∪ (tournée vers le haut) à ∩ (tournée vers le bas), ou l'inverse ; entre une bosse et un creux voisins, il y en a toujours un ${COURS_LECTURE}.`)]),
          calcul(l, lignes),
          resultat(l, liste2(formatReponseAttenduePhaseLatex(e, "inflexions"))),
        );
        break;
      }
      case "tableauFSeconde": {
        const attendu = tableauFSecondeAttendu(e);
        const ent = formatEnteteColonnesTableauFSeconde(e, attendu.colonnes);
        const zones = zonesTableau(attendu, ent);
        const lignes: LigneCalcul[] = zones.map((z) =>
          ligne(`f''(x)${z.signe === "+" ? ">" : "<"}0\\text{ sur }]${z.gauche}\\,;\\,${z.droite}[`, z.signe === "+" ? "la courbe est tournée vers le haut (∪)" : "la courbe est tournée vers le bas (∩)"),
        );
        for (const p of e.inflexions) lignes.push(ligne(`f''(${dixiemeL(p.position)})=0`, "f″ change de signe : point d'inflexion"));
        etapes.push(
          utilise(l, [t(`f″ > 0 là où la courbe est tournée vers le haut (∪), f″ < 0 là où elle est tournée vers le bas (∩) ; chaque point d'inflexion sépare deux zones de signes contraires ${COURS_SIGNE}.`)]),
          calcul(l, lignes),
          resultat(l, [f(tableauSignesEtudeLatex(attendu, ent, "fseconde"))], "Tableau de signes"),
          resultat(l, phraseSens(zones, "fseconde")),
        );
        break;
      }
    }
  }
  return finaliser(etapes);
}
