import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { chaineLinearisation, coordX, coordY, defContexte, inverseY } from "../../core6e/linearisationDonnees";
import type { ExerciceLinearisation, ModeleDonnees } from "../../core6e/linearisationDonnees";
import { phasesPourExercice } from "../../moteur6e/typesLinearisation";
import type { PhaseLinearisation } from "../../moteur6e/typesLinearisation";
import { OPTIONS_CHOIX, unitePrevision } from "../../moteur6e/verificationLinearisation";
import { approxLatex, formatReponseAttenduePhaseLatex, grandeurXLatex, grandeurYLatex, nombreLatex, nomPrevisionLatex, precisionTexte, reponseChoix, uniteLatex, varX, varY } from "../../ui6e/formatLinearisation";
import { figureCorrigeSvg } from "../../ui6e/figureLinearisation";
import { COURS_PROBLEMES, COURS_PROPRIETES, arrondi, dec, par } from "../../ui6e/corrigeLogarithmes2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen89` (linéariser des données) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesPourExercice`) : logarithmes
 * des mesures (un par ligne), test d'alignement (pentes comparées dans les trois représentations),
 * pente et ordonnée à l'origine avec les valeurs NON arrondies de la chaîne de l'écran
 * (`chaineLinearisation` : la même que la vérification), retour au modèle par l'exponentielle,
 * prévision. Réponses : `formatReponseAttenduePhaseLatex` / `reponseChoix`.
 */

type E = ExerciceLinearisation;
const t = texte;
const f = latex;
const LETTRES = "abcdefgh";

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function reponse(e: E, phase: PhaseLinearisation): FragmentConsigne[] {
  return phase === "choix" ? reponseChoix(e) : liste(formatReponseAttenduePhaseLatex(e, phase));
}

/** Coordonnées transformées d'une ligne du tableau, en LaTeX (ln si la coordonnée est transformée). */
function xL(e: E, i: number, m: ModeleDonnees = e.modele): string {
  return m === "puissance" ? `\\ln(${nombreLatex(e.xs[i]!)})` : nombreLatex(e.xs[i]!);
}
function yL(e: E, i: number, m: ModeleDonnees = e.modele): string {
  return m === "affine" ? nombreLatex(e.ys[i]!) : `\\ln(${nombreLatex(e.ys[i]!)})`;
}

function nomRepresentation(m: ModeleDonnees): string {
  return m === "affine" ? "Sans transformation" : m === "exponentiel" ? "Semi-log" : "Log-log";
}

function penteEntre(e: E, modele: ModeleDonnees, a: number, b: number): number {
  return (coordY(modele, e.ys[b]!) - coordY(modele, e.ys[a]!)) / (coordX(modele, e.xs[b]!) - coordX(modele, e.xs[a]!));
}

function etapes(e: E, phase: PhaseLinearisation, sq: string): EtapeCorrection[] {
  const c = chaineLinearisation(e);
  const [i, j] = e.lignes;
  const x = varX(e);
  const y = varY(e);
  switch (phase) {
    case "choix": {
      const n = e.xs.length;
      return [
        utilise(sq, [t("Dans la représentation qui aligne les points, la pente entre deux points voisins est la même partout : on la calcule au début et à la fin du tableau, dans les trois représentations " + COURS_PROBLEMES + ".")]),
        ...OPTIONS_CHOIX.map((m) =>
          calcul(
            sq,
            [
              ligne(`\\dfrac{${yL(e, 1, m)}-${yL(e, 0, m)}}{${xL(e, 1, m)}-${xL(e, 0, m)}}${approxLatex(penteEntre(e, m, 0, 1))}`, "deux premières lignes"),
              ligne(`\\dfrac{${yL(e, n - 1, m)}-${yL(e, n - 2, m)}}{${xL(e, n - 1, m)}-${xL(e, n - 2, m)}}${approxLatex(penteEntre(e, m, n - 2, n - 1))}`, m === e.modele ? "deux dernières lignes : même pente, points alignés" : "deux dernières lignes : pente différente"),
            ],
            [f(grandeurYLatex(e, m)), t(" en fonction de "), f(grandeurXLatex(e, m)), t(" :")],
            nomRepresentation(m),
          ),
        ),
        resultat(sq, [t("Représentation : "), ...reponse(e, phase)]),
        piege(sq, [t("Conclure sur l'allure des mesures (« elles augmentent de plus en plus vite ») : une croissance accélérée peut être exponentielle ou puissance ; seul le test d'alignement tranche.")]),
      ];
    }
    case "logs": {
      const v = formatReponseAttenduePhaseLatex(e, "logs");
      return [
        utilise(sq, e.modele === "exponentiel" ? [t("Représentation semi-logarithmique : on garde "), f(x), t(` en abscisse et on remplace chaque mesure par son logarithme népérien ${COURS_PROBLEMES}.`)] : [t(`Représentation log-log : on remplace l'abscisse et la mesure par leur logarithme népérien ${COURS_PROBLEMES}.`)]),
        calcul(sq, v.map((l, k) => ligne(l, k === 0 ? `ligne ${x} = ${nombreLatex(e.xs[i]!).replace("{,}", ",")}` : k === v.length / 2 ? `ligne ${x} = ${nombreLatex(e.xs[j]!).replace("{,}", ",")}` : ""))),
        resultat(sq, [t("Logarithmes arrondis au millième : "), ...reponse(e, phase)]),
        piege(sq, [t("Calculer avec le logarithme décimal log : la droite reste une droite, mais on ne pourrait plus revenir au modèle avec l'exponentielle de base e.")]),
      ];
    }
    case "pente":
      return [
        utilise(sq, [t("Pente de la droite qui passe par les deux points transformés : "), f("m=\\dfrac{Y_2-Y_1}{X_2-X_1}"), t(` ${COURS_PROBLEMES}.`)]),
        calcul(sq, [ligne(`m=\\dfrac{${yL(e, j)}-${yL(e, i)}}{${xL(e, j)}-${xL(e, i)}}`, "points des deux lignes désignées"), ligne(approxLatex(c.m), "calculatrice, logarithmes non arrondis")]),
        resultat(sq, [t("Pente : "), ...reponse(e, phase)]),
        piege(sq, [t("Inverser le quotient (écart des abscisses sur écart des ordonnées) ou calculer la pente sur les mesures brutes au lieu des valeurs transformées.")]),
      ];
    case "ordonnee": {
      const droite = `${grandeurYLatex(e)}\\approx ${nombreLatex(c.m, 3)}\\,${grandeurXLatex(e)}+${par(nombreLatex(c.p, 3))}`;
      const X2 = e.modele === "puissance" ? arrondi(c.X[1], 3) : e.xs[j]!;
      const calc2 = arrondi(arrondi(c.m, 3) * X2 + arrondi(c.p, 3), 6);
      const pile = Math.abs(calc2 - arrondi(c.Y[1], 3)) < 1e-9;
      return [
        utilise(sq, [t("Un point de la droite vérifie son équation : "), f("Y=m\\,X+p\\iff p=Y-m\\,X"), t(` ${COURS_PROBLEMES}.`)]),
        calcul(sq, [ligne("p=Y_1-m\\,X_1", "premier point"), ligne(`=${yL(e, i)}-m\\times ${par(xL(e, i))}`, "m de l'étape précédente"), ligne(approxLatex(c.p), "calculatrice, valeurs non arrondies")]),
        { ...resultat(sq, [t("Droite : "), f(droite)]), figureHtml: figureCorrigeSvg(e) },
        verification(sq, [
          t(pile ? "Le second point est bien sur la droite : " : "Le second point est presque sur la droite (écart dû aux arrondis) : "),
          f(`${nombreLatex(c.m, 3)}\\times ${par(e.modele === "puissance" ? nombreLatex(X2, 3) : nombreLatex(X2))}+${par(nombreLatex(c.p, 3))}=${dec(calc2, 6)}`),
          t(" et "),
          f(`${yL(e, j)}\\approx ${nombreLatex(c.Y[1], 3)}`),
          t("."),
        ]),
      ];
    }
    case "modele": {
      const lignes: LigneCalcul[] =
        e.modele === "exponentiel"
          ? [
              ligne(`\\ln(${y})=m\\,${x}+p`, "droite de l'étape précédente"),
              ligne(`${y}=e^{m\\,${x}+p}`, "on applique exp"),
              ligne(`=e^{p}\\cdot\\left(e^{m}\\right)^{${x}}`, [f("e^{A+B}=e^{A}e^{B}"), t(", "), f("e^{AB}=\\left(e^{A}\\right)^{B}")]),
              ligne(`k=e^{p}`, "par identification avec le modèle"),
              ligne(approxLatex(c.k, c.decimalesK), "p non arrondi"),
              ligne(`a=e^{m}`),
              ligne(approxLatex(c.parametre), "m non arrondi"),
            ]
          : [
              ligne(`\\ln(${y})=m\\ln(${x})+p`, "droite de l'étape précédente"),
              ligne(`${y}=e^{m\\ln(${x})+p}`, "on applique exp"),
              ligne(`=e^{p}\\cdot e^{m\\ln(${x})}`, [f("e^{A+B}=e^{A}e^{B}")]),
              ligne(`=e^{p}\\cdot ${x}^{m}`, [f("e^{m\\ln(x)}=x^{m}")]),
              ligne(`k=e^{p}`, "par identification avec le modèle"),
              ligne(approxLatex(c.k, c.decimalesK), "p non arrondi"),
              ligne(`n=m`),
              ligne(approxLatex(c.parametre)),
            ];
      return [
        utilise(sq, [t("On applique l'exponentielle aux deux membres de l'équation de la droite, puis on identifie avec le modèle cherché " + COURS_PROPRIETES + ".")]),
        calcul(sq, lignes),
        resultat(sq, [t("Modèle : "), ...reponse(e, phase)]),
        piege(sq, e.modele === "exponentiel" ? [t("Prendre "), f("k=p"), t(" ou "), f("a=m"), t(" : ce sont leurs logarithmes qui valent p et m.")] : [t("Prendre "), f("k=p"), t(" (c'est "), f("\\ln(k)"), t(" qui vaut p) ou calculer "), f("n=e^{m}"), t(" : en log-log, l'exposant est la pente elle-même.")]),
      ];
    }
    case "prevision": {
      const def = defContexte(e.contexte);
      const unite = uniteLatex(unitePrevision(e));
      const lignes: LigneCalcul[] = [];
      const prec = c.decimalesPrevision;
      if (e.variante === "choisir") {
        const Xc = e.modele === "puissance" ? `\\ln(${nombreLatex(e.cible)})` : nombreLatex(e.cible);
        const Yv = c.p + c.m * coordX(e.modele, e.cible);
        lignes.push(ligne(`${grandeurYLatex(e)}=p+m\\times ${Xc}`, "ordonnée de la droite au point cherché"));
        lignes.push(ligne(approxLatex(Yv), "m et p non arrondis"));
        if (e.modele !== "affine") lignes.push(ligne(`y=e^{p+m\\times ${Xc}}`, "on revient à la mesure avec exp"), ligne(approxLatex(inverseY(e.modele, Yv), prec)));
      } else if (e.typePrevision === "valeur") {
        const xs = nombreLatex(e.cible);
        lignes.push(ligne(e.modele === "exponentiel" ? `${y}=k\\cdot a^{${xs}}` : `${y}=k\\cdot ${xs}^{n}`, `on remplace ${x} par ${xs.replace("{,}", ",")} dans le modèle`));
        lignes.push(ligne(approxLatex(c.yPrevision, prec + (e.ambiante > 0 ? 1 : 0)), e.modele === "exponentiel" ? "calculatrice, k et a non arrondis" : "calculatrice, k et n non arrondis"));
        if (e.ambiante > 0) lignes.push(ligne(`T=${e.ambiante}+\\theta`, "le modèle donne l'écart à la pièce"), ligne(approxLatex(c.prevision, prec)));
      } else {
        const yv = nombreLatex(c.yPrevision);
        if (e.ambiante > 0) lignes.push(ligne(`\\theta=${nombreLatex(e.cible)}-${e.ambiante}`, "écart à la pièce visé"), ligne(`=${yv}`));
        if (e.modele === "exponentiel") {
          lignes.push(ligne(`k\\cdot a^{${x}}=${yv}`, "le modèle atteint la valeur visée"));
          lignes.push(ligne(`a^{${x}}=\\dfrac{${yv}}{k}`, "on divise par k"));
          lignes.push(ligne(`${x}\\ln(a)=\\ln\\left(\\dfrac{${yv}}{k}\\right)`, "on applique ln : ln(aˣ) = x ln a"));
          lignes.push(ligne(`${x}=\\dfrac{\\ln\\left(\\dfrac{${yv}}{k}\\right)}{\\ln(a)}`, "on divise par ln(a)"));
        } else {
          lignes.push(ligne(`k\\cdot ${x}^{n}=${yv}`, "le modèle atteint la valeur visée"));
          lignes.push(ligne(`${x}^{n}=\\dfrac{${yv}}{k}`, "on divise par k"));
          lignes.push(ligne(`${x}=\\left(\\dfrac{${yv}}{k}\\right)^{\\frac{1}{n}}`, [t("racine n-ième : puissance "), f("\\frac{1}{n}")]));
        }
        lignes.push(ligne(approxLatex(c.prevision, prec), e.modele === "exponentiel" ? "calculatrice, k et a non arrondis" : "calculatrice, k et n non arrondis"));
      }
      return [
        utilise(sq, e.variante === "choisir" ? [t("On calcule l'ordonnée de la droite pour l'abscisse demandée, puis on revient à la mesure (exponentielle si elle a été transformée) " + COURS_PROBLEMES + ".")] : [t("On utilise le modèle obtenu à l'étape précédente, avec les valeurs non arrondies de la calculatrice " + COURS_PROBLEMES + ".")]),
        calcul(sq, lignes),
        resultat(sq, [f(`${nomPrevisionLatex(e)}${approxLatex(c.prevision, prec)}\\,${unite}`), t(` (arrondi ${precisionTexte(prec)}).`)]),
        piege(
          sq,
          e.ambiante > 0
            ? [t("Confondre l'écart "), f(def.varY), t(" et la température : le modèle décrit l'écart à la pièce, il faut ajouter (ou retirer) les " + e.ambiante + " °C.")]
            : [t("Arrondir trop tôt : une extrapolation amplifie les erreurs d'arrondi ; garder " + (e.variante === "choisir" ? "m et p" : e.modele === "exponentiel" ? "k et a" : "k et n") + " avec la précision demandée (ou les valeurs de la calculatrice).")],
        ),
      ];
    }
  }
}

export function correctionDetailleeLinearisation(e: E): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i) => etapes(e, phase, LETTRES[i]!));
}
