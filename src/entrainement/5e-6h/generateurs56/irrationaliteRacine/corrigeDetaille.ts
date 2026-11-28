import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { decompositionL } from "../communReels/outilsReels";
import { lignesDecomposition } from "../communReels/corrigeReels";
import type { ExerciceIrrationalite } from "./core/types";
import { mkL, nkL, racineNL, reponse } from "./ui/format";

/**
 * Corrigé détaillé « comme au tableau » de `56gen15`, une lettre par écran : a) hypothèse ; b) élever
 * puis chasser le dénominateur ; c) décomposition de N, une division par ligne, puis regroupement ;
 * d) exposants de chaque membre ; e) conclusion (contradiction, ou racine calculée et vérifiée).
 */

type E = ExerciceIrrationalite;
const t = texte;
const f = latex;

export function correctionDetailleeIrrationalite(e: E): EtapeCorrection[] {
  const r = racineNL(e);
  const k = e.k;
  const pair = k === 2 ? "pair" : "multiple de 3";
  const cours = "(cours, point 1)";
  const etapes: EtapeCorrection[] = [
    utilise("a", [t(`On suppose que le nombre s'écrit comme une fraction de deux naturels non nuls, et on cherche si cette hypothèse mène à une contradiction ${cours}.`)]),
    calcul("a", [ligne(`${r}=\\dfrac{m}{n}`, "m et n naturels non nuls (hypothèse)")]),
    resultat("a", reponse(e, "hypothese")),
    piege("a", [t("Supposer ce qu'on veut savoir (« ce n'est pas une fraction ») : on part toujours de l'hypothèse contraire.")]),

    utilise("b", [t(`On élève les deux membres à la puissance ${k}, puis on multiplie par `), f(nkL(e)), t(".")]),
    calcul("b", [ligne(`${e.N}=\\dfrac{${mkL(e)}}{${nkL(e)}}`, k === 2 ? "on élève au carré" : "on élève au cube"), ligne(`${mkL(e)}=${e.N}\\cdot ${nkL(e)}`, `on multiplie par n${k === 2 ? "²" : "³"}`)]),
    resultat("b", reponse(e, "elever")),
    piege("b", [t("Élever "), f(r), t(" à la puissance "), f(`${k}`), t(" donne "), f(`${e.N}`), t(", pas "), f(`${e.N}^{${k}}`), t(".")]),

    utilise("c", [t("Divisions successives par les nombres premiers 2, 3, 5, 7… ; la décomposition d'un naturel en facteurs premiers est unique.")]),
    calcul("c", lignesDecomposition(e.N)),
    resultat("c", reponse(e, "facteurs")),
    piege("c", [t("S'arrêter à un facteur qui n'est pas premier (4, 6, 8, 9…).")]),
  ];

  const d: LigneCalcul[] = [ligne(`${mkL(e)}=${e.N}\\cdot ${nkL(e)}=${decompositionL(e.facteurs)}\\cdot ${nkL(e)}`, "décomposition de c)")];
  if (e.verdict === "irrationnel") {
    const p = e.premierTemoin!;
    const ep = e.facteurs.find(([b]) => b === p)![1];
    d.push(ligne(`\\text{exposant de } ${p} \\text{ dans } ${mkL(e)}=${k}\\times(\\text{exposant dans } m)`, `${pair}`));
    d.push(ligne(`\\text{exposant de } ${p} \\text{ dans } ${e.N}\\cdot ${nkL(e)}=${ep}+${k}\\times(\\text{exposant dans } n)`, k === 2 ? "impair" : "pas un multiple de 3"));
  } else {
    d.push(ligne(`${decompositionL(e.facteurs)}=\\left(${decompositionL(e.facteurs.map(([b, x]) => [b, x / k] as [number, number]))}\\right)^{${k}}`, k === 2 ? "tous les exposants sont pairs" : "tous les exposants sont des multiples de 3"));
  }
  etapes.push(
    utilise("d", [t(`Dans ${k === 2 ? "un carré m²" : "un cube m³"}, chaque exposant est ${k === 2 ? "le double" : "le triple"} de celui de m, donc ${pair} ; dans ${e.N}·n${k === 2 ? "²" : "³"}, on ajoute les exposants de ${e.N} à des exposants ${k === 2 ? "pairs" : "multiples de 3"} ${cours}.`)]),
    calcul("d", d),
    resultat("d", reponse(e, "exposants")),
    piege("d", [t("Croire que les exposants dépendent de n : ceux de "), f(nkL(e)), t(k === 2 ? " sont toujours pairs." : " sont toujours des multiples de 3.")]),
  );

  if (e.verdict === "irrationnel") {
    etapes.push(
      utilise("e", [t("Un naturel n'a qu'une seule décomposition en facteurs premiers : le même nombre ne peut pas avoir un exposant de "), f(`${e.premierTemoin}`), t(` à la fois ${pair} et non ${pair}.`)]),
      calcul("e", [ligne(`${mkL(e)}\\neq ${e.N}\\cdot ${nkL(e)}`, "pour tous naturels non nuls m et n"), ligne(`${r}\\notin\\mathbb{Q}`, "l'hypothèse est fausse")]),
      resultat("e", reponse(e, "conclusion")),
      piege("e", [t("Conclure « rationnel non entier » : la racine d'un naturel est soit un naturel, soit un irrationnel.")]),
    );
  } else {
    const rac = e.racine!;
    etapes.push(
      utilise("e", [t(`Aucune contradiction : ${e.N} est ${k === 2 ? "un carré parfait" : "un cube parfait"}, et sa racine se calcule.`)]),
      calcul("e", [ligne(`${r}=\\sqrt${k === 2 ? "" : "[3]"}{${rac}^{${k}}}`, `${e.N} = ${rac}${k === 2 ? "²" : "³"}`), ligne(`=${rac}`)]),
      resultat("e", reponse(e, "conclusion")),
      verification("e", [t("Avec "), f(`m=${rac}`), t(" et "), f("n=1"), t(", l'égalité de b) est vraie :")], [ligne(`${rac}^{${k}}=${e.N}\\cdot 1^{${k}}`)]),
      piege("e", [t("Chercher une contradiction à tout prix : ici les exposants sont tous "), t(k === 2 ? "pairs" : "des multiples de 3"), t(".")]),
    );
  }
  return etapes;
}
