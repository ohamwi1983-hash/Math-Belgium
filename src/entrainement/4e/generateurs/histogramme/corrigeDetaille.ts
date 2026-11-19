import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceHistogramme } from "../../core/histogramme.types";
import { valeurHauteur } from "../../ui/histogrammeGraph";
import { COURS_HISTOGRAMME, classeLatex, classeTexte, lignesSomme, ligneFrequence, listeResultat, nb, nbp, nbt, pc, formulesInsecables } from "../../ui/corrigeStatistique1";
import { construireSvgHistogramme } from "./histogrammeSvg";

/**
 * Corrigé détaillé « comme au tableau » de gen31 (regroupement en classes et histogramme) — règle
 * `.claude/rules/feuilles-evaluations.md`. Étapes = écrans : a) effectif de chaque classe,
 * (b) fréquences — variante « fréquence » seulement,) puis le tracé (dernière lettre, figure de
 * l'histogramme attendu). Valeurs de l'instance (classes, données brutes, donnée frontière) et
 * hauteurs de `valeurHauteur` (la même fonction que l'écran du tracé).
 */

type E = ExerciceHistogramme;

/** Lettre de l'écran du tracé (dernier écran). */
export function lettreTraceHistogramme(e: E): string {
  return e.variante === "frequence" ? "c" : "b";
}

const derniere = (e: E, i: number) => i === e.classes.length - 1;
const cl = (e: E, i: number) => classeLatex(e.classes[i].borneInf, e.classes[i].borneSup, derniere(e, i));
const ct = (e: E, i: number) => classeTexte(e.classes[i].borneInf, e.classes[i].borneSup, derniere(e, i));

/** Données brutes de la classe i, triées (borne inférieure incluse, supérieure exclue sauf la dernière). */
function donneesDeLaClasse(e: E, i: number): number[] {
  const c = e.classes[i];
  return e.donneesBrutes.filter((d) => d >= c.borneInf - 1e-9 && (derniere(e, i) ? d <= c.borneSup + 1e-9 : d < c.borneSup - 1e-9)).sort((a, b) => a - b);
}

function donneeSurBorneFinale(e: E): number | null {
  const b = e.classes[e.classes.length - 1].borneSup;
  return e.donneesBrutes.some((d) => Math.abs(d - b) < 1e-9) ? b : null;
}

function etapeClassement(e: E): EtapeCorrection[] {
  const { valeur, classeIndex, surFrontiere } = e.donneeFrontiere;
  const lignes: LigneCalcul[] = [];
  lignes.push(
    ligne(
      `${nb(valeur)}\\in ${cl(e, classeIndex)}`,
      surFrontiere ? "donnée sur la frontière : la borne inférieure est incluse" : `juste sous la frontière ${nbt(e.classes[classeIndex].borneSup)}, exclue de cette classe`,
    ),
  );
  const finale = donneeSurBorneFinale(e);
  if (finale !== null) lignes.push(ligne(`${nb(finale)}\\in ${cl(e, e.classes.length - 1)}`, "dernière classe : fermée à droite"));
  e.classes.forEach((c, i) => {
    const d = donneesDeLaClasse(e, i);
    lignes.push(ligne(`n_{${i + 1}}=${nb(c.effectif)}`, `${ct(e, i)} : ${d.map(nbt).join(" ; ")}`));
  });
  lignes.push(...lignesSomme("\\Sigma n_i", e.classes.map((c) => c.effectif), "on additionne les effectifs"));
  return [
    utilise("a", [
      texte("Chaque donnée va dans la classe "),
      latex("[a\\,;\\,b\\mathclose{[}"),
      texte(" qui la contient : "),
      latex("a\\leq x<b"),
      texte(` — borne inférieure incluse, borne supérieure exclue ; la dernière classe est fermée des deux côtés ${COURS_HISTOGRAMME}.`),
    ]),
    calcul("a", lignes, [texte(`On répartit les ${e.n} données (en ${e.contexte.unite}) :`)]),
    resultat("a", listeResultat(e.classes.map((c, i) => `n_{${i + 1}}=${nb(c.effectif)}`), e.classes.map((_, i) => `${ct(e, i)} : `))),
    verification("a", [texte(`La somme des effectifs vaut n = ${e.n} : chaque donnée est comptée une fois.`)]),
    piege("a", [texte("Une donnée égale à une borne appartient à la classe qui COMMENCE par cette borne ; seule la dernière classe garde sa borne supérieure.")]),
  ];
}

function etapeFrequences(e: E): EtapeCorrection[] {
  return [
    utilise("b", [texte("Fréquence d'une classe, en % : "), latex("f_i=\\dfrac{n_i}{n}\\times 100\\,\\%"), texte(`, avec n = ${e.n} ${COURS_HISTOGRAMME}.`)]),
    calcul("b", e.classes.map((c, i) => ligneFrequence(`f_{${i + 1}}`, c.effectif, e.n, c.frequencePourcent, [latex(cl(e, i))]))),
    resultat("b", listeResultat(e.classes.map((c, i) => `f_{${i + 1}}=${nb(c.frequencePourcent)}\\,\\%`), e.classes.map((_, i) => `${ct(e, i)} : `))),
    verification("b", [texte("La somme des fréquences vaut 100 % :")], lignesSomme("\\Sigma f_i", e.classes.map((c) => c.frequencePourcent), undefined, "\\,\\%")),
    piege("b", [texte(`On divise par n = ${e.n}, le nombre de données — pas par le nombre de classes (${e.classes.length}).`)]),
  ];
}

function etapeTrace(e: E): EtapeCorrection[] {
  const t = lettreTraceHistogramme(e);
  const frequence = e.variante === "frequence";
  const premier = e.classes[0];
  const symbole = frequence ? "f" : "n";
  return [
    utilise(t, [
      texte(
        `Histogramme : une barre par classe, accolée à ses voisines, de largeur égale à l'amplitude de la classe et de hauteur égale à ${frequence ? "sa fréquence (en %)" : "son effectif"} ${COURS_HISTOGRAMME}.`,
      ),
    ]),
    {
      ...calcul(
        t,
        [
          ligne(`\\text{amplitude}=${nb(premier.borneSup)}-${nbp(premier.borneInf)}=${nb(e.amplitude)}`, "largeur commune des barres"),
          ...e.classes.map((c, i) => ligne(`h_{${i + 1}}=${symbole}_{${i + 1}}=${frequence ? pc(valeurHauteur(e, i)) : nb(valeurHauteur(e, i))}`, `barre de ${nbt(c.borneInf)} à ${nbt(c.borneSup)}`)),
        ],
        [texte(`Axe horizontal gradué de ${nbt(premier.borneInf)} à ${nbt(e.classes[e.classes.length - 1].borneSup)} (${e.contexte.unite}), axe vertical : ${frequence ? "fréquence (%)" : "effectif"}.`)],
      ),
      // La réponse est un graphique : l'histogramme attendu.
      figureHtml: construireSvgHistogramme(e),
    },
    resultat(t, [
      texte(`Histogramme ci-dessus : barres accolées de largeur ${nbt(e.amplitude)}, de hauteurs `),
      ...listeResultat(e.classes.map((_, i) => `h_{${i + 1}}=${frequence ? pc(valeurHauteur(e, i)) : nb(valeurHauteur(e, i))}`)),
      texte(frequence ? " (fréquences)." : " (effectifs)."),
    ]),
    piege(t, [texte(frequence ? "La hauteur d'une barre est la fréquence de sa classe, pas son effectif." : "Les barres d'un histogramme se touchent : les classes se suivent sans trou.")]),
  ];
}

export function correctionDetailleeHistogramme(e: E): EtapeCorrection[] {
  return formulesInsecables([...etapeClassement(e), ...(e.variante === "frequence" ? etapeFrequences(e) : []), ...etapeTrace(e)]);
}
