import type { ExerciceDeuxEnfants, ExerciceMere, ExerciceMontyHall, ExerciceParadoxesProbabilites } from "../../core6e/paradoxesProbabilites.types";
import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import type { PhaseParadoxe } from "../../moteur6e/typesParadoxesProbabilites";
import { valeursAttendues } from "../../moteur6e/verificationParadoxesProbabilites";
import { UNIVERS_DEUX_ENFANTS, conclusionCorrecte, formatReponseAttenduePhaseLatex, informationTexte, issueFavorable, issuesCompatibles, millieme } from "../../ui6e/formatParadoxesProbabilites";
import { figureCorrigeSvg } from "../../ui6e/figureParadoxesProbabilites";
import { COURS_PROBLEMES, calcul, finaliser, frac, latex, ligne, lignesFraction, listeEt, piege, resultat, texte, utiliseCours } from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen76` (Quand l'intuition se trompe) — partagé par
 * l'adaptateur papier et le générateur interactif (étape révélée). L'écran de PRÉDICTION (non noté)
 * n'a pas d'étape ; modéliser, calculer, conclure = a, b, c. Valeurs des MÊMES fonctions que l'écran
 * (`formatReponseAttenduePhaseLatex`, `conclusionCorrecte`), arbre en `figureHtml`.
 */

type Ex = ExerciceParadoxesProbabilites;
type Fragments = FragmentConsigne[];
const COURS = COURS_PROBLEMES;

const LETTRE_PHASE: Record<PhaseParadoxe, string> = { prediction: "", modeliser: "a", calculer: "b", conclure: "c" };

export function lettreEcranParadoxes(phase: PhaseParadoxe): string {
  return LETTRE_PHASE[phase];
}

function reponse(e: Ex, phase: "modeliser" | "calculer"): Fragments {
  return listeEt(formatReponseAttenduePhaseLatex(e, phase));
}

function etapesMere(e: ExerciceMere): EtapeCorrection[] {
  const k = e.kLancersDouble;
  const [c1, c2] = valeursAttendues(e, "modeliser");
  const [p1, p2] = valeursAttendues(e, "calculer");
  const signe = (p: number) => (p > 0.5 ? ">" : "<");
  return [
    utiliseCours("a", [texte("Le contraire de « au moins un 6 en 4 lancers » est « pas de 6 à chacun des 4 lancers » ; les lancers sont indépendants, on multiplie (règle du produit)")], COURS),
    calcul("a", [
      ligne("P(\\overline{A_1})=\\left(\\dfrac{5}{6}\\right)^{4}", "4 lancers indépendants sans 6"),
      ligne("=\\dfrac{625}{1296}"),
      ligne(`\\approx ${millieme(c1)}`, "arrondi au millième"),
      ligne("P(\\text{double six})=\\dfrac{1}{6}\\times\\dfrac{1}{6}", "deux dés indépendants"),
      ligne("=\\dfrac{1}{36}"),
      ligne(`P(\\overline{A_2})=\\left(\\dfrac{35}{36}\\right)^{${k}}`, `${k} lancers sans double six`),
      ligne(`\\approx ${millieme(c2)}`, "calculatrice"),
    ]),
    { ...resultat("a", reponse(e, "modeliser")), ...(figureCorrigeSvg(e) ? { figureHtml: figureCorrigeSvg(e) as string } : {}) },
    piege("a", [texte("Calculer la probabilité de « quatre 6 », "), latex("\\left(\\frac{1}{6}\\right)^{4}"), texte(", au lieu de celle de « aucun 6 » : le contraire de « au moins un » est « aucun », pas « tous ».")]),
    utiliseCours("b", [texte("On revient à l'événement lui-même : "), latex("P(A)=1-P(\\overline{A})")], COURS),
    calcul("b", [
      ligne("P(A_1)=1-P(\\overline{A_1})", "événement contraire"),
      ligne("=1-\\dfrac{625}{1296}"),
      ligne("=\\dfrac{671}{1296}"),
      ligne(`\\approx ${millieme(p1)}`, "arrondi au millième"),
      ligne("P(A_2)=1-P(\\overline{A_2})", "événement contraire"),
      ligne(`=1-\\left(\\dfrac{35}{36}\\right)^{${k}}`),
      ligne(`\\approx ${millieme(p2)}`, "calculatrice"),
    ]),
    resultat("b", reponse(e, "calculer")),
    piege("b", [texte("Donner "), latex("P(\\overline{A})"), texte(" comme probabilité de gain : il manque « 1 − … ».")]),
    utiliseCours("c", [texte("Un pari est favorable au joueur quand sa probabilité de gain dépasse "), latex("\\frac{1}{2}"), texte(" ; le meilleur pari a la plus grande probabilité de gain")], COURS),
    calcul("c", [ligne(`${millieme(p1)}${signe(p1)}0{,}5`, "pari 1"), ligne(`${millieme(p2)}${signe(p2)}0{,}5`, "pari 2"), ligne(`${millieme(p1)}>${millieme(p2)}`, [texte("donc "), latex("P(A_1)>P(A_2)")])]),
    resultat("c", [...conclusionCorrecte(e), texte(".")]),
    piege("c", [texte("Raisonner par proportionnalité, "), latex("4\\times\\frac{1}{6}"), texte(" ou "), latex(`${k}\\times\\frac{1}{36}`), texte(" : on compte plusieurs fois les parties où le 6 sort plusieurs fois (avec 7 lancers, ce calcul dépasserait même 1).")]),
  ];
}

function etapesMonty(e: ExerciceMontyHall): EtapeCorrection[] {
  const n = e.nPortes;
  return [
    utiliseCours("a", [texte(`Au moment du choix, les ${n} portes sont équiprobables, et l'animateur, qui sait où est la voiture, ouvre toujours une porte à chèvre : son geste ne change pas la probabilité de ta porte. Si la voiture n'est pas derrière ta porte (événement `), latex("\\overline{V}"), texte(`), elle est derrière l'une des ${n - 2} porte${n - 2 > 1 ? "s" : ""} que tu peux prendre en changeant`)], COURS),
    calcul("a", [ligne(`P(V)=${frac(1, n)}`, `une porte sur ${n}`), ligne(`P(C\\mid\\overline{V})=${frac(1, n - 2)}`, n === 3 ? "une seule porte possible : elle cache la voiture" : `une porte sur les ${n - 2} restantes`)]),
    { ...resultat("a", reponse(e, "modeliser")), ...(figureCorrigeSvg(e) ? { figureHtml: figureCorrigeSvg(e) as string } : {}) },
    piege("a", [texte("Mettre à jour "), latex("P(V)"), texte(" après l'ouverture d'une porte : l'animateur peut toujours ouvrir une porte à chèvre, son geste n'apprend rien sur ta porte.")]),
    utiliseCours("b", [texte("En gardant, on gagne exactement quand "), latex("V"), texte(" est réalisé. En changeant, on ne peut gagner que sur la branche "), latex("\\overline{V}"), texte(" : règle du produit le long de cette branche")], COURS),
    calcul("b", [
      ligne("P(G)=P(V)", "garder gagne si ta porte cache la voiture"),
      ligne(`=${frac(1, n)}`),
      ligne("P(C)=P(\\overline{V})\\times P(C\\mid\\overline{V})", "règle du produit"),
      ligne(`=${frac(n - 1, n)}\\times ${frac(1, n - 2)}`),
      ...lignesFraction("", n - 1, n * (n - 2)),
    ]),
    resultat("b", reponse(e, "calculer")),
    piege("b", [texte("Oublier le facteur "), latex(`P(C\\mid\\overline{V})=${frac(1, n - 2)}`), texte(" quand plusieurs portes restent fermées.")]),
    utiliseCours("c", [texte("On compare les probabilités de gagner des deux stratégies")], COURS),
    calcul("c", [ligne(`${frac(n - 1, n * (n - 2))}>${frac(1, n)}`, [texte("donc "), latex("P(C)>P(G)")]), ...(n === 3 ? [ligne(`\\dfrac{2}{3}=2\\times\\dfrac{1}{3}`, "changer double la probabilité")] : [ligne(`\\dfrac{P(C)}{P(G)}=${frac(n - 1, n - 2)}`, "rapport des deux probabilités")])]),
    resultat("c", [...conclusionCorrecte(e), texte(".")]),
    piege("c", [texte("Croire que les portes encore fermées sont équiprobables (« ça revient au même ») : l'animateur ne choisit pas au hasard la porte qu'il ouvre ; ta porte garde sa probabilité "), latex(frac(1, n)), texte(".")]),
  ];
}

function etapesDeuxEnfants(e: ExerciceDeuxEnfants): EtapeCorrection[] {
  const compat = issuesCompatibles(e);
  const ss = issueFavorable(e);
  const liste = (issues: readonly string[]) => `\\{${issues.map((i) => `\\mathrm{${i}}`).join("\\,;\\,")}\\}`;
  return [
    utiliseCours("a", [texte("Les quatre issues (sexe de l'aîné, puis du cadet) sont équiprobables, et l'information « " + informationTexte(e) + " » ne garde que les issues compatibles (événement "), latex("A"), texte("). On note "), latex("B"), texte(" : les deux enfants sont du même sexe que celui annoncé")], COURS),
    calcul("a", [ligne(`\\Omega=${liste(UNIVERS_DEUX_ENFANTS)}`, "4 issues équiprobables"), ligne(`A=${liste(compat)}`, "issues compatibles avec l'information"), ligne(`\\#A=${compat.length}`), ligne(`B=\\{\\mathrm{${ss}}\\}`, "seule issue qui réalise B"), ligne("\\#B=1")]),
    { ...resultat("a", reponse(e, "modeliser")), ...(figureCorrigeSvg(e) ? { figureHtml: figureCorrigeSvg(e) as string } : {}) },
    piege(
      "a",
      e.information === "auMoinsUn"
        ? [texte("Traiter les trois compositions « deux garçons », « un garçon et une fille », « deux filles » comme équiprobables : « un garçon et une fille » regroupe deux issues, GF et FG.")]
        : [texte("Confondre cette information avec « au moins un des deux » : elle désigne un enfant précis, seul le sexe de l'autre enfant reste inconnu.")],
    ),
    utiliseCours("b", [texte("Les issues de "), latex("A"), texte(" restent équiprobables et "), latex("B"), texte(" est inclus dans "), latex("A"), texte(" : "), latex("P(B\\mid A)=\\dfrac{\\#B}{\\#A}")], COURS),
    calcul("b", [ligne("P(B\\mid A)=\\dfrac{\\#B}{\\#A}", "équiprobabilité dans A"), ...lignesFraction("", 1, compat.length, "on remplace")]),
    resultat("b", reponse(e, "calculer")),
    piege("b", [texte("Diviser par 4 (toutes les issues) : l'information a réduit l'univers à "), latex("A"), texte(".")]),
    utiliseCours("c", [texte("On compare la probabilité trouvée aux réponses de l'intuition")], COURS),
    calcul("c", [ligne(`P(B\\mid A)=${frac(1, compat.length)}`, `seule ${ss} parmi les ${compat.length} issues de A`)]),
    resultat("c", [...conclusionCorrecte(e), texte(".")]),
    piege("c", [texte(e.information === "auMoinsUn" ? "Répondre une chance sur deux en comptant des compositions au lieu d'issues équiprobables." : "Répondre une chance sur trois comme pour « au moins un » : ici l'enfant est désigné.")]),
  ];
}

export function correctionDetailleeParadoxes(e: Ex): EtapeCorrection[] {
  if (e.famille === "mere") return finaliser(etapesMere(e));
  if (e.famille === "montyHall") return finaliser(etapesMonty(e));
  return finaliser(etapesDeuxEnfants(e));
}
