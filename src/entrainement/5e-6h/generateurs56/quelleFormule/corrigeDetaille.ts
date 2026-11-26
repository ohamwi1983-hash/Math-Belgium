import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceQuelleFormule } from "./index";
import { famille, reponse } from "./format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen23` : a) la famille et l'indice qui la décide ; b) la
 * grandeur cherchée et les données ; c) la formule (formule du cours, puis transformée) et la même
 * formule avec les données de l'énoncé — sans calcul, comme le demande la consigne.
 */

type E = ExerciceQuelleFormule;
const t = texte;
const f = latex;
const fr = (x: unknown) => x as FragmentConsigne[];

const PIEGES: Record<string, FragmentConsigne[]> = {
  simple: [t("Prendre une formule à exposant : en intérêt simple, l'intérêt ne rapporte rien et "), f("C_t=C_0\\,(1+i\\cdot t)"), t(".")],
  composes: [t("Utiliser "), f("C_0\\,(1+i\\cdot n)"), t(" sur plusieurs années : les intérêts capitalisés rapportent à leur tour.")],
  equivalent: [t("Multiplier ou diviser le taux par le nombre de périodes : les taux équivalents se calculent par une puissance ou une racine.")],
  annuites: [t("Traiter les versements comme un seul capital : chaque versement est capitalisé (ou actualisé) sur une durée différente.")],
};

export function correctionDetailleeQuelleFormule(e: E): EtapeCorrection[] {
  const m = e.modele;
  return [
    utilise("a", [t("Un seul capital placé au plus un an : intérêt simple ; un seul capital sur plusieurs années, intérêts capitalisés : intérêts composés ; changer la période d'un taux : taux équivalents ; plusieurs versements égaux et réguliers : annuités.")]),
    resultat("a", [...fr(reponse(e, "famille")), t(` — ${m.indice}.`)]),
    utilise("b", [t("La question dit ce qu'on cherche ; les autres nombres sont des données.")]),
    calcul("b", m.donnees.map(([l, j]) => ligne(l, j)), [], "Données"),
    resultat("b", fr(reponse(e, "grandeur"))),
    utilise("c", [t(m.depart ? "On part de la formule du cours et on isole la grandeur cherchée." : "La formule du cours donne directement la grandeur cherchée.")]),
    ...(m.depart ? [calcul("c", [ligne(m.depart, "formule du cours"), ligne(m.formule, "grandeur cherchée isolée")])] : []),
    resultat("c", fr(reponse(e, "formule"))),
    verification("c", [t("Avec les données (calcul non demandé) : "), f(m.substitution), t(".")]),
    piege("c", PIEGES[famille(e)]!),
  ];
}
