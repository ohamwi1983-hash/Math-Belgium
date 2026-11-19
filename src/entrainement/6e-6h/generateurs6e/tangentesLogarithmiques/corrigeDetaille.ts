import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ContactTangente, ExerciceTangentesLog } from "../../core6e/tangentesLogarithmiques.types";
import { phasesExercice } from "../../moteur6e/typesTangentesLogarithmiques";
import type { PhaseTangentesLog } from "../../moteur6e/typesTangentesLogarithmiques";
import { formatReponseAttendueLatex, penteD, pointP } from "../../ui6e/formatTangentesLogarithmiques";
import { figureTangentesSvg } from "../../ui6e/figureTangentesLogarithmiques";
import { COURS_DERIVEE, par, sansRepetition } from "../../ui6e/corrigeLogarithmes2";
import { latexComb, latexEquation, latexEquationNonDeveloppee, valeur } from "./exact";

/**
 * Corrigé détaillé « comme au tableau » de `6gen87` (tangentes aux courbes logarithmiques) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesExercice`) : dérivée ligne à
 * ligne (`FonctionTangente.lignesDerivee`, écrite par la famille avec ses paramètres), valeurs en x₀
 * (substitution puis valeur exacte, `fDe`/`dfDe` de l'écran), équation de la tangente posée puis
 * développée (`latexEquationNonDeveloppee`, `latexEquation`), équation f′(x) = m éclatée
 * (`chaineEquation`) puis résolue par le discriminant, condition « P sur la tangente » éclatée
 * (`resolution`). Réponses : `formatReponseAttendueLatex` (mêmes fonctions que l'écran).
 */

type E = ExerciceTangentesLog;
const t = texte;
const f = latex;
const LETTRES = "abc";

function reponse(e: E, phase: PhaseTangentesLog): FragmentConsigne[] {
  return formatReponseAttendueLatex(e, phase).flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

/** Membres d'une chaîne « A \iff B \iff C » (une équation par ligne). */
function equivalences(chaine: string): string[] {
  return chaine.split("\\iff").map((x) => x.trim()).filter((x) => x !== "");
}

function lignesDerivee(e: E): LigneCalcul[] {
  return e.fonction.lignesDerivee.map((l) => ligne(l.latex, l.justification));
}

function lignesValeurs(e: E, c: ContactTangente): LigneCalcul[] {
  const x0 = latexComb(c.x0);
  const fn = e.fonction;
  const lignes: LigneCalcul[] = [ligne(`f\\left(${x0}\\right)=${fn.fDe(x0)}`, `on remplace x par ${/[\\^{]/.test(x0) ? "x₀" : x0.replace("-", "−")} dans f(x)`)];
  if (fn.fDe(x0) !== latexComb(c.fx0)) lignes.push(ligne(`=${latexComb(c.fx0)}`, "on simplifie"));
  lignes.push(ligne(`f'\\left(${x0}\\right)=${fn.dfDe(x0)}`, "même chose dans f′(x)"));
  if (fn.dfDe(x0) !== latexComb(c.dfx0)) lignes.push(ligne(`=${latexComb(c.dfx0)}`, "on simplifie"));
  return lignes;
}

function lignesEquation(c: ContactTangente, premiere = true): LigneCalcul[] {
  const nonDev = latexEquationNonDeveloppee(c);
  const finale = latexEquation(c.m, c.p);
  return sansRepetition([
    ...(premiere ? [ligne("y=f'(x_0)(x-x_0)+f(x_0)", "équation de la tangente")] : []),
    ligne(nonDev, "on remplace x₀, f(x₀) et f′(x₀)"),
    ligne(finale, "on développe"),
  ]);
}

const UTILISE_TANGENTE: FragmentConsigne[] = [t("Tangente au point d'abscisse x₀ : "), f("y=f'(x_0)(x-x_0)+f(x_0)"), t(` ${COURS_DERIVEE}.`)];

function etapesPhase(e: E, phase: PhaseTangentesLog, sq: string): EtapeCorrection[] {
  const fn = e.fonction;
  const c = e.contacts[0]!;
  switch (phase) {
    case "derivee":
      return [
        utilise(sq, [t(`f est définie sur `), f(fn.domaineLatex), t(`. ${fn.regle.texte.replace(/\s*:\s*$/, "")} : `), f(fn.regle.latex ?? ""), t(` ${COURS_DERIVEE}.`)]),
        calcul(sq, lignesDerivee(e)),
        resultat(sq, [t("Dérivée : "), ...reponse(e, phase)]),
      ];
    case "valeurs":
      return [
        utilise(sq, [t("On remplace x par x₀ dans f(x) et dans f′(x) (étape 1), puis on simplifie avec "), f("\\ln(1)=0"), t(", "), f("\\ln\\left(e^{n}\\right)=n"), t(` ${COURS_DERIVEE}.`)]),
        calcul(sq, lignesValeurs(e, c)),
        resultat(sq, [t("Valeurs : "), ...reponse(e, phase)]),
      ];
    case "equation":
      if (e.variante === "origine") {
        const a = latexComb(c.x0);
        return [
          utilise(sq, [t("La pente est f′(a) pour la valeur de a trouvée ; la tangente passe par "), f(pointP(e)), t(` : son ordonnée à l'origine est l'ordonnée de P ${COURS_DERIVEE}.`)]),
          calcul(
            sq,
            sansRepetition([
              ligne(`f'\\left(${a}\\right)=${fn.dfDe(a)}`, "pente au point de contact"),
              ...(fn.dfDe(a) !== latexComb(c.dfx0) ? [ligne(`=${latexComb(c.dfx0)}`, "on simplifie")] : []),
              ligne(`p=${latexComb(e.pP)}`, "ordonnée à l'origine : celle de P"),
              ligne(latexEquation(c.m, c.p), "y = mx + p"),
            ]),
          ),
          { ...resultat(sq, [t("Tangente : "), ...reponse(e, phase)]), figureHtml: figureTangentesSvg(e, true) },
        ];
      }
      return [
        utilise(sq, UTILISE_TANGENTE),
        calcul(sq, lignesEquation(c)),
        { ...resultat(sq, [t("Tangente : "), ...reponse(e, phase)]), figureHtml: figureTangentesSvg(e, true) },
        piege(sq, [t("Prendre "), f("f(x_0)"), t(" pour ordonnée à l'origine : la tangente passe par le point de contact "), f("(x_0\\,;\\,f(x_0))"), t(", pas par "), f("(0\\,;\\,f(x_0))"), t(".")]),
      ];
    case "solutions": {
      if (e.variante !== "parallele") return [];
      const eqs = equivalences(e.chaineEquation);
      const r1 = e.racines[0]!;
      const r2 = e.racines[e.racines.length - 1]!;
      const S = r1 + r2;
      const P = r1 * r2;
      const delta = S * S - 4 * P;
      const rd = Math.round(Math.sqrt(delta));
      const lignes: LigneCalcul[] = [
        ligne(eqs[0]!, "même pente que d"),
        ...(eqs[1] ? [ligne(eqs[1], fn.famille === "lnInverse" ? "on multiplie par x² (x ≠ 0)" : "on multiplie par x (x > 0)")] : []),
        ...(eqs[2] ? [ligne(eqs[2], fn.famille === "lnInverse" ? "on regroupe et on divise par la pente" : "on regroupe")] : []),
        ligne(`\\Delta=${par(String(-S))}^{2}-4\\cdot ${par(String(P))}`, "discriminant"),
        ligne(`=${delta}`),
      ];
      if (delta === 0) lignes.push(ligne(`x=\\dfrac{${S}}{2}`, "racine double"), ligne(`=${r1}`));
      else {
        lignes.push(ligne(`\\sqrt{\\Delta}=${rd}`));
        lignes.push(ligne(`x_1=\\dfrac{${S}-${rd}}{2}`, "formule du second degré"), ligne(`=${r1}`));
        lignes.push(ligne(`x_2=\\dfrac{${S}+${rd}}{2}`), ligne(`=${r2}`));
      }
      for (const r of e.rejetees) lignes.push(ligne(`${r}\\notin ${fn.domaineLatex}`, "hors du domaine : rejetée"));
      return [
        utilise(sq, [t("Deux droites parallèles ont la même pente : on résout "), f(`f'(x)=${penteD(e)}`), t(" dans le domaine "), f(fn.domaineLatex), t(", ce qui donne une équation du second degré " + COURS_DERIVEE + ".")]),
        calcul(sq, lignes),
        resultat(sq, [t(e.contacts.length === 1 ? "Abscisse du point de contact : " : "Abscisses des points de contact : "), ...reponse(e, phase)]),
        verification(sq, [t("On remplace dans "), f("f'(x)"), t(" : "), ...e.contacts.flatMap((k, i) => [...(i ? [t(" et ")] : []), f(`f'\\left(${latexComb(k.x0)}\\right)=${fn.dfDe(latexComb(k.x0))}=${penteD(e)}`)]), t(".")]),
        piege(
          sq,
          e.rejetees.length > 0
            ? [t("Garder la racine négative : elle n'est pas dans le domaine de f, aucune tangente n'y existe.")]
            : e.double
              ? [t("Conclure qu'il n'y a pas de tangente quand le discriminant est nul : une racine double donne une tangente.")]
              : [t("S'arrêter à la première solution : chacune des deux racines donne une tangente.")],
        ),
      ];
    }
    case "equations":
      return [
        utilise(sq, [...UTILISE_TANGENTE.slice(0, -1), t(` ; la pente vaut toujours ${penteD(e).replace("-", "−")}, celle de d ${COURS_DERIVEE}.`)]),
        ...e.contacts.map((k) => {
          const x0 = latexComb(k.x0);
          const lignes = sansRepetition([
            ligne(`f\\left(${x0}\\right)=${fn.fDe(x0)}`, "ordonnée du point de contact"),
            ...(fn.fDe(x0) !== latexComb(k.fx0) ? [ligne(`=${latexComb(k.fx0)}`, "on simplifie")] : []),
            ...lignesEquation(k, false),
          ]);
          return calcul(sq, lignes, [], `Tangente en x = ${x0.replace("-", "−")}`);
        }),
        { ...resultat(sq, [t(e.contacts.length === 1 ? "Tangente : " : "Tangentes : "), ...reponse(e, phase)]), figureHtml: figureTangentesSvg(e, true) },
      ];
    case "tangenteA":
      if (e.variante !== "origine") return [];
      return [
        utilise(sq, [t("f est définie sur "), f(fn.domaineLatex), t(". Tangente au point d'abscisse a : "), f("y=f'(a)(x-a)+f(a)"), t(` ; on calcule d'abord f′(x) ${COURS_DERIVEE}.`)]),
        calcul(
          sq,
          sansRepetition([
            ...lignesDerivee(e),
            ligne(`f(a)=${e.faLatex}`, "on remplace x par a"),
            ligne(`f'(a)=${e.dfaLatex}`),
            ligne("y=f'(a)(x-a)+f(a)", "équation de la tangente"),
            ligne(e.equationEnA, "on remplace f(a) et f′(a)"),
          ]),
        ),
        resultat(sq, [t("Tangente en a : "), ...reponse(e, phase)]),
      ];
    case "valeurA": {
      if (e.variante !== "origine") return [];
      const eqs = equivalences(e.resolution);
      const p = latexComb(e.pP).replace("-", "−");
      return [
        utilise(sq, [f("P"), t(" appartient à la tangente : on remplace "), f("x"), t(" par 0 et "), f("y"), t(` par ${p} dans son équation, puis on résout l'équation d'inconnue a ${COURS_DERIVEE}.`)]),
        calcul(
          sq,
          sansRepetition([
            ligne(e.substitution, `x = 0, y = ${p}`),
            ...eqs.map((x, i) => ligne(x, i === 0 ? "on développe et on simplifie" : i < eqs.length - 1 ? "on isole" : /^\\ln\(a\)=/.test(eqs[i - 1]!) ? "ln(a) = n ⟺ a = eⁿ" : "on change de signe")),
          ]),
        ),
        resultat(sq, [t("Abscisse du point de contact : "), ...reponse(e, phase)]),
        verification(sq, [f(Number.isInteger(valeur(c.x0)) ? `a=${latexComb(c.x0)}` : `a=${latexComb(c.x0)}\\approx ${String(Math.round(valeur(c.x0) * 1000) / 1000).replace(".", "{,}")}`), t(" est strictement positif : il appartient bien au domaine de f.")]),
        piege(sq, [t("Remplacer x par 0 dans f elle-même : P n'est pas un point de la courbe (0 n'est même pas dans le domaine) ; c'est l'équation de la tangente qu'il doit vérifier.")]),
      ];
    }
  }
}

export function correctionDetailleeTangentesLog(e: E): EtapeCorrection[] {
  return phasesExercice(e).flatMap((phase, i) => etapesPhase(e, phase, LETTRES[i]!));
}
