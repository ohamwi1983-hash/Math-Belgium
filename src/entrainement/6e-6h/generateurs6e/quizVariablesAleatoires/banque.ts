/**
 * Couche A — banque de contenu pour "Variables aléatoires et lois de probabilités" (quiz
 * vrai/faux), chapitre 8 du chantier 6e (6h) (6gen71). 210 affirmations
 * PRÉ-ÉCRITES (35 par thème, 6 thèmes), chacune vérifiée mathématiquement à la rédaction (calculs
 * directs, cohérence avec les générateurs déjà établis du chapitre pour les formules/pièges
 * classiques) — jamais générées procéduralement, voir `core6e/quizVariablesAleatoires.types.ts`.
 *
 * Un thème par générateur déjà établi du chapitre "Variables aléatoires et lois de probabilités"
 * (6gen49 à 6gen53). `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés,
 * jamais de `string` brute), même convention que 6gen65/66/67/68/69/70. `{,}` pour la virgule
 * décimale À L'INTÉRIEUR d'un fragment LaTeX uniquement (jamais dans un fragment texte brut —
 * piège documenté dans la section 6gen33 de `docs/historique-6e.md`).
 *
 * Chaque thème s'appuie sur un ou plusieurs scénarios numériques fixes (recalculés et revérifiés à
 * la main ci-dessous), pour permettre des affirmations qui se répondent/se contredisent entre elles
 * sans réintroduire les mêmes chiffres à chaque question — même esprit qu'un contrôle papier
 * classique ("dans l'exercice ci-dessus...").
 *
 * ENRICHISSEMENT 20 → 35 questions par thème (même campagne que les 8 quiz du chantier 4e,
 * gen59-66) : les 20 premières questions de chaque thème sont INCHANGÉES (ni retirées, ni
 * réordonnées, ni reformulées), les 15 suivantes ont été ajoutées à la suite. Elles exploitent en
 * particulier des notions du chapitre encore absentes des 20 premières — fonction de répartition
 * en escaliers et hauteur de saut, variance/écart-type (discret et binomial), loi uniforme
 * discrète, distinction variable discrète ↔ variable aléatoire CONTINUE (densité, `P(X=a)=0`,
 * probabilité = aire sous la courbe, `F'=f`, bornes strictes/larges équivalentes), vérification
 * empirique de la normalité (68-95-99,7), approximation binomiale → NORMALE (`n>30`,
 * `0,3<p<0,7`), espérance/variance d'une loi uniforme continue, jeu complet des probabilités a
 * posteriori de Bayes, et propriétés fines de la loi de Poisson (support infini, 2 maximums pour
 * un λ entier, λ décimal, écart-type `√λ`).
 *
 * AUDIT DU 6e CH. 8 (lot D, 25/11/2026) : notations du cours (𝓑(n ; p), 𝒩(μ ; σ), Cₙᵏ, P(Cⱼ | S)),
 * règle empirique 68,27 / 95,45 / 99,73 % (15,87 % d'un côté), cumuls de Poisson recalculés à partir
 * des valeurs non arrondies, correction de continuité (T4 n° 24), conditions d'approximation dites
 * « du cours » (T4 n° 21, 25, 26), « OU » d'événements incompatibles (T4 n° 19–20), plus aucun « grand
 * calcul » (valeur intermédiaire donnée : « sachant que… »), et un 6ᵉ thème « Densité, discrète ou
 * continue, loi uniforme continue » (§ 3 à § 5). 18 vraies / 17 fausses dans chaque thème.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizVariablesAleatoires } from "../../core6e/quizVariablesAleatoires.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const BANQUE_QUIZ_VARIABLES_ALEATOIRES: Record<VarianteQuizVariablesAleatoires, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Variables aléatoires discrètes et espérance, ref 6gen49
  // Scénario A (loi discrète) : X∈{2,3,4,5,6}, P=(0,15 ; 0,25 ; 0,30 ; 0,20 ; 0,10), E(X)=3,85.
  // Événements « X≤3 »(P=0,40)/« X≥4 »(P=0,60) contraires ; « X≥4 »(P=0,60)/« X≤4 »(P=0,70) NON
  // contraires (chevauchent en X=4). Scénario B (jeu « vérifier ») : gains nets -2(0,4)/+3(0,35)/
  // +5(0,25), E=1,5 (favorable). Scénario C (jeu « imposer ») : gains bruts 10(0,2)/4(0,3)/-6(0,5),
  // E brut=0,2, m=0,2 pour E=0. Scénario D (hypergéométrique) : N=10,K=4,n=3, loi
  // k=0..3, P=(1/6,1/2,3/10,1/30), E(X)=1,2=n·K/N.
  // ==========================================================================
  variablesDiscretesEsperance: [
    {
      enonce: [
        texte("Une variable aléatoire discrète X suit la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(". La somme de ces 5 probabilités vaut exactement 1."),
      ],
      reponse: true,
      justification: [latex("0{,}15+0{,}25+0{,}30+0{,}20+0{,}10=1{,}00"), texte(" — c'est bien une loi de probabilité valide.")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", la somme des probabilités vaudrait "),
        latex("1{,}10"),
        texte(", ce qui resterait acceptable car une loi de probabilité peut légèrement dépasser 1."),
      ],
      reponse: false,
      justification: [
        texte("Faux à deux titres : la somme réelle vaut exactement "), latex("1{,}00"),
        texte(" (pas "), latex("1{,}10"), texte("), et une loi de probabilité ne peut JAMAIS dépasser 1, par définition."),
      ],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", l'espérance vaut "),
        latex("E(X)=2\\times0{,}15+3\\times0{,}25+4\\times0{,}30+5\\times0{,}20+6\\times0{,}10=3{,}85"),
        texte("."),
      ],
      reponse: true,
      justification: [latex("0{,}30+0{,}75+1{,}20+1{,}00+0{,}60=3{,}85"), texte(".")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", l'espérance E(X) se calculerait plutôt en additionnant simplement les 5 valeurs possibles puis en divisant par 5 : "),
        latex("\\dfrac{2+3+4+5+6}{5}=4"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Cette moyenne simple ignore les probabilités (elle suppose à tort chaque valeur équiprobable) — l'espérance pondère chaque valeur par sa VRAIE probabilité, ce qui donne "),
        latex("3{,}85"), texte(", pas "), latex("4"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", les événements « "),
        latex("X\\leq3"),
        texte(" » ("),
        latex("P=0{,}40"),
        texte(") et « "),
        latex("X\\geq4"),
        texte(" » ("),
        latex("P=0{,}60"),
        texte(") sont contraires : leur intersection est vide et leur union couvre toutes les valeurs possibles."),
      ],
      reponse: true,
      justification: [texte("Aucune valeur ne vérifie à la fois "), latex("X\\leq3"), texte(" et "), latex("X\\geq4"), texte(", et toute valeur de "), latex("\\{2\\,;\\ldots\\,;6\\}"), texte(" vérifie l'un des deux : c'est bien une partition complète.")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", les événements « "),
        latex("X\\geq4"),
        texte(" » ("),
        latex("P=0{,}60"),
        texte(") et « "),
        latex("X\\leq4"),
        texte(" » ("),
        latex("P=0{,}70"),
        texte(") sont contraires, puisque leurs probabilités somment presque à 1."),
      ],
      reponse: false,
      justification: [
        texte("Ces deux événements partagent la valeur "), latex("X=4"), texte(" (leur intersection n'est PAS vide) : ce ne sont pas des contraires, malgré une somme de probabilités ("), latex("1{,}30"), texte(") qui n'est d'ailleurs même pas égale à 1."),
      ],
    },
    {
      enonce: [
        texte("Deux événements contraires vérifient toujours "), latex("P(A)+P(B)=1"),
        texte(", mais la réciproque est fausse : une somme de probabilités égale à 1 ne suffit pas à garantir que 2 événements sont contraires."),
      ],
      reponse: true,
      justification: [texte("Il faut EN PLUS que les deux événements ne puissent jamais se produire ensemble (intersection vide) — une somme à 1 seule, sans cette condition, ne suffit pas.")],
    },
    {
      enonce: [
        texte("Il suffit que "), latex("P(A)+P(B)=1"), texte(" pour affirmer que "), latex("A"), texte(" et "), latex("B"), texte(" sont des événements contraires, quelle que soit leur intersection."),
      ],
      reponse: false,
      justification: [texte("Faux — il faut aussi que "), latex("A"), texte(" et "), latex("B"), texte(" soient incompatibles (intersection vide). Une somme à 1 avec un chevauchement ne définit jamais des contraires.")],
    },
    {
      enonce: [
        texte("Pour une variable aléatoire "),
        latex("X"),
        texte(" à valeurs entières, le piège classique consiste à croire que « "),
        latex("X\\geq4"),
        texte(" » et « "),
        latex("X\\leq4"),
        texte(" » sont contraires alors qu'ils partagent la valeur "),
        latex("X=4"),
        texte(" en commun."),
      ],
      reponse: true,
      justification: [texte("C'est exactement le piège central des événements « au moins »/« au plus » : ils partagent toujours leur valeur frontière commune, jamais des contraires.")],
    },
    {
      enonce: [
        texte("Pour une variable aléatoire "),
        latex("X"),
        texte(" à valeurs entières, les événements « "),
        latex("X\\geq4"),
        texte(" » et « "),
        latex("X\\leq3"),
        texte(" » partagent une valeur commune, contrairement à ce qu'on pourrait croire."),
      ],
      reponse: false,
      justification: [
        texte("Faux — « "), latex("X\\geq4"), texte(" » (valeurs 4, 5, 6) et « "), latex("X\\leq3"), texte(" » (valeurs 2, 3) ne partagent AUCUNE valeur : ce sont justement les vrais contraires, sans chevauchement."),
      ],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain net vaut "), latex("-2"), texte(" €"), texte(" avec probabilité "), latex("0{,}4"), texte(", "), latex("+3"), texte(" €"), texte(" avec probabilité "), latex("0{,}35"),
        texte(" et "), latex("+5"), texte(" €"), texte(" avec probabilité "), latex("0{,}25"), texte(", l'espérance de gain vaut "), latex("E=1{,}5"), texte(" €"), texte("."),
      ],
      reponse: true,
      justification: [latex("-2\\times0{,}4+3\\times0{,}35+5\\times0{,}25=-0{,}8+1{,}05+1{,}25=1{,}5"), texte(".")],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain net vaut "),
        latex("-2"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}4"),
        texte(", "),
        latex("+3"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}35"),
        texte(" et "),
        latex("+5"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}25"),
        texte(", l'espérance de gain vaudrait plutôt "),
        latex("6"), texte(" €"),
        texte(", en additionnant simplement les 3 gains possibles ("),
        latex("-2+3+5=6"),
        texte(") sans tenir compte des probabilités."),
      ],
      reponse: false,
      justification: [
        texte("Ignorer les probabilités n'a aucun sens pour calculer une espérance — la vraie valeur, pondérée par les probabilités, est "),
        latex("1{,}5"), texte(" €"), texte(", pas "), latex("6"), texte(" €"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain net vaut "),
        latex("-2"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}4"),
        texte(", "),
        latex("+3"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}35"),
        texte(" et "),
        latex("+5"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}25"),
        texte(", d'espérance de gain "),
        latex("E=1{,}5"), texte(" €"),
        texte(", le jeu est favorable au joueur, car l'espérance de gain est strictement positive."),
      ],
      reponse: true,
      justification: [texte("Une espérance strictement positive signifie qu'en moyenne, sur un grand nombre de parties, le joueur gagne — le jeu lui est donc favorable.")],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain net vaut "),
        latex("-2"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}4"),
        texte(", "),
        latex("+3"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}35"),
        texte(" et "),
        latex("+5"), texte(" €"),
        texte(" avec probabilité "),
        latex("0{,}25"),
        texte(", d'espérance de gain "),
        latex("E=1{,}5"), texte(" €"),
        texte(", le jeu serait équitable, car aucune des 3 issues prise séparément n'est extrême."),
      ],
      reponse: false,
      justification: [texte("Un jeu est équitable seulement si "), latex("E(X)=0"), texte(" exactement — ici "), latex("E=1{,}5"), texte(" € "), latex("\\neq0"), texte(", le jeu est favorable au joueur, pas équitable.")],
    },
    {
      enonce: [
        texte("Dans un jeu, le gain brut vaut "),
        latex("10"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}2"),
        texte("), "),
        latex("4"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}3"),
        texte(") et "),
        latex("-6"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}5"),
        texte(") ; l'espérance du gain brut vaut "),
        latex("0{,}2"), texte(" €"),
        texte("."),
      ],
      reponse: true,
      justification: [latex("10\\times0{,}2+4\\times0{,}3+(-6)\\times0{,}5=2+1{,}2-3=0{,}2"), texte(".")],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain brut vaut "),
        latex("10"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}2"),
        texte("), "),
        latex("4"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}3"),
        texte(") et "),
        latex("-6"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}5"),
        texte("), d'espérance du gain brut "),
        latex("0{,}2"), texte(" €"),
        texte(", si l'on impose une mise "),
        latex("m"),
        texte(" telle que le gain net (gain brut moins "),
        latex("m"),
        texte(") rende le jeu équitable, il faut choisir "),
        latex("m=0"), texte(" €"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le jeu équitable exige "), latex("E(\\text{gain net})=E(\\text{gain brut})-m=0"), texte(", donc "), latex("m=0{,}2"), texte(" €"),
        texte(" (l'espérance du gain brut elle-même), pas "), latex("m=0"), texte(" €"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans un jeu où le gain brut vaut "),
        latex("10"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}2"),
        texte("), "),
        latex("4"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}3"),
        texte(") et "),
        latex("-6"), texte(" €"),
        texte(" (probabilité "),
        latex("0{,}5"),
        texte("), d'espérance du gain brut "),
        latex("0{,}2"), texte(" €"),
        texte(", la mise "),
        latex("m=0{,}2"), texte(" €"),
        texte(" rend bien le jeu équitable, car "),
        latex("E(\\text{gain net})=E(\\text{gain brut})-m=0{,}2-0{,}2=0"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la conséquence directe de la linéarité : le gain net (gain brut moins une constante "), latex("m"), texte(") a pour espérance "), latex("E(\\text{gain brut})-m"), texte(", qui s'annule pour "), latex("m=0{,}2"), texte(" €"), texte(".")],
    },
    {
      enonce: [texte("Une urne contient 10 boules dont 4 rouges ; on en tire 3 sans remise et "), latex("X"), texte(" compte les rouges. Les probabilités "), latex("P(X=0)=\\dfrac{20}{120}"), texte(", "), latex("P(X=1)=\\dfrac{60}{120}"), texte(", "), latex("P(X=2)=\\dfrac{36}{120}"), texte(" et "), latex("P(X=3)=\\dfrac{4}{120}"), texte(" forment bien une loi de probabilité.")],
      reponse: true,
      justification: [texte("Les numérateurs somment à "), latex("20+60+36+4=120"), texte(" : la somme des probabilités vaut 1 (ce sont "), latex("\\dfrac{1}{6}"), texte(", "), latex("\\dfrac{1}{2}"), texte(", "), latex("\\dfrac{3}{10}"), texte(" et "), latex("\\dfrac{1}{30}"), texte(").")],
    },
    {
      enonce: [texte("On tire 3 boules sans remise dans une urne de 10 boules dont 4 rouges ; "), latex("X"), texte(" compte les rouges (loi hypergéométrique). Son espérance vaut "), latex("E(X)=\\dfrac{nK}{N}=\\dfrac{3\\times4}{10}=1{,}2"), texte(".")],
      reponse: true,
      justification: [texte("C'est le raccourci propre à la loi hypergéométrique ; le calcul pondéré "), latex("0\\times\\dfrac{1}{6}+1\\times\\dfrac{1}{2}+2\\times\\dfrac{3}{10}+3\\times\\dfrac{1}{30}"), texte(" donne bien "), latex("1{,}2"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une variable hypergéométrique "),
        latex("X"),
        texte(" (population "),
        latex("N=10"),
        texte(" dont "),
        latex("K=4"),
        texte(" succès, tirage sans remise de "),
        latex("n=3"),
        texte(" éléments), l'espérance se calculerait plutôt en prenant la valeur centrale du support "),
        latex("\\{0\\,;1\\,;2\\,;3\\}"),
        texte(", soit "),
        latex("E(X)=1{,}5"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("L'espérance n'est JAMAIS la simple valeur centrale d'un support — elle doit être pondérée par les VRAIES probabilités de chaque valeur, ce qui donne "),
        latex("1{,}2"), texte(", pas "), latex("1{,}5"), texte(" (le support n'est d'ailleurs pas symétrique ici)."),
      ],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", la fonction de répartition "),
        latex("F(x)=P(X\\leq x)"),
        texte(" vaut "),
        latex("F(4)=0{,}15+0{,}25+0{,}30=0{,}70"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("F cumule les probabilités de TOUTES les valeurs inférieures ou égales à "), latex("x"), texte(" — ici les 3 premières.")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", "),
        latex("F(4)"),
        texte(" vaudrait plutôt "),
        latex("0{,}30"),
        texte(", la probabilité de la valeur "),
        latex("X=4"),
        texte(" elle-même."),
      ],
      reponse: false,
      justification: [
        texte("Confusion entre "), latex("F(4)=P(X\\leq4)=0{,}70"), texte(" (probabilité CUMULÉE) et "), latex("P(X=4)=0{,}30"),
        texte(" (probabilité ponctuelle) : "), latex("0{,}30"), texte(" n'est que la HAUTEUR DU SAUT de F en "), latex("x=4"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", la hauteur du saut de "),
        latex("F"),
        texte(" en "),
        latex("x=5"),
        texte(" vaut "),
        latex("F(5)-F(4)=0{,}90-0{,}70=0{,}20"),
        texte(", soit exactement "),
        latex("P(X=5)"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Chaque marche du graphique en escaliers mesure toujours "), latex("P(X=x_i)"), texte(" — lire les sauts de F revient donc à lire toute la loi de probabilité.")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", le graphique de la fonction de répartition "),
        latex("F"),
        texte(" est une courbe continue et croissante."),
      ],
      reponse: false,
      justification: [
        texte("Pour une variable DISCRÈTE, le graphique de "), latex("F"),
        texte(" est toujours un graphique en escaliers : F reste constante entre 2 valeurs consécutives de X et ne saute qu'aux valeurs prises par X. La courbe continue croissante, c'est le cas d'une variable aléatoire CONTINUE."),
      ],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", d'espérance "),
        latex("E(X)=3{,}85"),
        texte(", la variance se calculerait par la moyenne simple des 5 écarts au carré : "),
        latex("\\dfrac{3{,}4225+0{,}7225+0{,}0225+1{,}3225+4{,}6225}{5}\\approx2{,}0225"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Cette moyenne simple ignore que les 5 probabilités ne sont pas égales — exactement le même piège que pour l'espérance. La variance pondère chaque écart au carré par "),
        latex("P(X=x_i)"), texte(", ce qui donne "), latex("V(X)=1{,}4275"), texte(", pas "), latex("2{,}0225"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour la loi "), latex("P(X=2)=0{,}15"), texte(" ; "), latex("P(X=3)=0{,}25"), texte(" ; "), latex("P(X=4)=0{,}30"), texte(" ; "), latex("P(X=5)=0{,}20"), texte(" ; "), latex("P(X=6)=0{,}10"), texte(", d'espérance "), latex("3{,}85"), texte(", la valeur "), latex("4"), texte(" contribue à la variance "), latex("V(X)"), texte(" pour "), latex("0{,}30\\times(4-3{,}85)^2"), texte(".")],
      reponse: true,
      justification: [texte("La variance additionne, pour chaque valeur, le carré de l'écart à l'espérance pondéré par la probabilité de cette valeur : ici "), latex("P(X=4)=0{,}30"), texte(" et l'écart vaut "), latex("0{,}15"), texte(".")],
    },
    {
      enonce: [texte("Si une variable aléatoire a pour variance "), latex("V(X)=1{,}44"), texte(", son écart-type vaut "), latex("\\sigma(X)=1{,}2"), texte(".")],
      reponse: true,
      justification: [texte("L'écart-type est la racine carrée de la variance : "), latex("\\sqrt{1{,}44}=1{,}2"), texte(".")],
    },
    {
      enonce: [
        texte("Pour la loi "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte(", l'écart-type s'obtiendrait en élevant la variance au carré : "),
        latex("\\sigma(X)=1{,}4275^2\\approx2{,}038"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est exactement l'inverse : "), latex("\\sigma(X)=\\sqrt{V(X)}=\\sqrt{1{,}4275}\\approx1{,}195"),
        texte(" — la variance est le carré de l'écart-type, jamais le contraire."),
      ],
    },
    {
      enonce: [texte("Pour une variable aléatoire telle que "), latex("E(X^2)=16{,}25"), texte(" et "), latex("E(X)=3{,}85"), texte(", la formule de König donne "), latex("V(X)=16{,}25-3{,}85^2"), texte(".")],
      reponse: true,
      justification: [latex("V(X)=E(X^2)-[E(X)]^2"), texte(" : on retire le carré de l'espérance de l'espérance du carré (ici, cela donne "), latex("1{,}4275"), texte(", la même valeur que la définition).")],
    },
    {
      enonce: [
        texte("Si "), latex("X"), texte(" est une durée exprimée en minutes, alors "), latex("V(X)"), texte(" et "), latex("\\sigma(X)"),
        texte(" s'expriment tous les deux en minutes."),
      ],
      reponse: false,
      justification: [
        texte("Seul l'écart-type "), latex("\\sigma(X)"), texte(" se mesure dans la même unité que "), latex("X"),
        texte(" (des minutes) — la variance porte cette unité AU CARRÉ (des minutes²), ce qui est précisément la raison d'être de l'écart-type."),
      ],
    },
    {
      enonce: [
        texte("Pour un dé équilibré à 6 faces (loi uniforme discrète sur les valeurs 1 à 6, "), latex("n=6"), texte("), les raccourcis donnent "),
        latex("E(X)=\\dfrac{n+1}{2}=3{,}5"), texte(" et "), latex("V(X)=\\dfrac{n^2-1}{12}=\\dfrac{35}{12}\\approx2{,}917"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Ces 2 raccourcis valent pour une loi uniforme, dont les "), latex("n"), texte(" valeurs ont toutes la même probabilité "),
        latex("\\tfrac{1}{n}"), texte(" — ici "), latex("\\tfrac{1}{6}"), texte(" par face."),
      ],
    },
    {
      enonce: [texte("Les raccourcis "), latex("E(X)=\\dfrac{n+1}{2}"), texte(" et "), latex("V(X)=\\dfrac{n^2-1}{12}"), texte(" s'appliquent à toute variable aléatoire discrète à "), latex("n"), texte(" valeurs équiprobables.")],
      reponse: false,
      justification: [texte("Ils supposent en plus que les valeurs sont "), latex("1, 2, \\ldots, n"), texte(" : sur les valeurs "), latex("2"), texte(", "), latex("4"), texte(", "), latex("6"), texte(" équiprobables, "), latex("E(X)=4"), texte(", alors que "), latex("\\dfrac{n+1}{2}=2"), texte(".")],
    },
    {
      enonce: [
        texte("Comme pour une variable aléatoire continue, "),
        latex("P(X=x)=0"),
        texte(" pour chacune des 5 valeurs de la loi discrète "),
        latex("P(X=2)=0{,}15\\;;\\;P(X=3)=0{,}25\\;;\\;P(X=4)=0{,}30\\;;\\;P(X=5)=0{,}20\\;;\\;P(X=6)=0{,}10"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("En DISCRET, chaque valeur porte une vraie probabilité non nulle — ici "), latex("P(X=4)=0{,}30"),
        texte(". C'est seulement pour une variable CONTINUE que "), latex("P(X=a)=0"), texte(" pour toute valeur isolée "), latex("a"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Une variable aléatoire discrète prend un nombre fini (ou dénombrable) de valeurs, une variable aléatoire continue une infinité de valeurs sur un intervalle — et l'espérance "),
        latex("E(X)=\\sum_{i} x_i\\,P(X=x_i)"), texte(" du cas discret devient "), latex("E(X)=\\int_u^v t\\,f(t)\\,dt"), texte(" dans le cas continu."),
      ],
      reponse: true,
      justification: [texte("Mêmes notions dans les 2 cas, 2 outils différents : une somme pondérée en discret, une intégrale de la densité en continu.")],
    },
    {
      enonce: [texte("L'écart-type s'écrit différemment selon que la variable aléatoire est discrète ou continue.")],
      reponse: false,
      justification: [
        texte("Non — "), latex("\\sigma(X)=\\sqrt{V(X)}"), texte(" s'écrit à l'identique dans les 2 cas ; seules les formules de "),
        latex("E(X)"), texte(" et "), latex("V(X)"), texte(" changent d'outil (somme pondérée en discret, intégrale en continu)."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 2 — Loi binomiale, ref 6gen50
  // Scénario fixe : n=5, p=0,4 (archer, 4 conditions de Bernoulli réunies). Loi complète k=0..5 :
  // P=(0,07776 ; 0,2592 ; 0,3456 ; 0,2304 ; 0,0768 ; 0,01024), somme=1. E(X)=np=2.
  // P(X≤1)=0,33696 ; P(X≥1)=1-P(X=0)=0,92224. Trouver n : p=0,1, seuil=0,9 → n min=22
  // (v=ln(0,1)/ln(0,9)≈21,854 ; (0,9)^21≈0,1096>0,1 insuffisant, (0,9)^22≈0,0985<0,1 suffisant).
  // ==========================================================================
  loiBinomiale: [
    {
      enonce: [texte("Pour qu'une expérience aléatoire suive une loi binomiale, il faut un nombre d'épreuves "), latex("n"), texte(" fixé à l'avance.")],
      reponse: true,
      justification: [texte("C'est la 1ʳᵉ des 4 conditions du schéma de Bernoulli répété.")],
    },
    {
      enonce: [
        texte("Pour qu'une expérience aléatoire suive une loi binomiale, le nombre d'épreuves peut être aléatoire, tant que la probabilité de succès reste constante."),
      ],
      reponse: false,
      justification: [texte("Faux — le nombre d'épreuves "), latex("n"), texte(" doit être FIXÉ À L'AVANCE, c'est une condition non négociable du schéma de Bernoulli répété.")],
    },
    {
      enonce: [
        texte("Les 4 conditions du schéma de Bernoulli répété sont : un nombre d'épreuves fixé à l'avance ; des épreuves indépendantes entre elles ; exactement 2 issues possibles à chaque épreuve (succès/échec) ; une probabilité de succès constante d'une épreuve à l'autre."),
      ],
      reponse: true,
      justification: [texte("Ce sont exactement les 4 conditions à vérifier pour affirmer qu'une variable suit une loi binomiale.")],
    },
    {
      enonce: [texte("Une des 4 conditions du schéma de Bernoulli répété exige que chaque épreuve ait au moins 3 issues possibles différentes.")],
      reponse: false,
      justification: [texte("Faux — au contraire, chaque épreuve doit avoir EXACTEMENT 2 issues possibles (succès ou échec), jamais 3 ou plus.")],
    },
    {
      enonce: [texte("Tirer une carte, la remettre dans le jeu, mélanger, puis répéter l'opération plusieurs fois donne des épreuves indépendantes, compatibles avec une loi binomiale.")],
      reponse: true,
      justification: [texte("Remettre la carte tirée avant de retirer garantit que la probabilité de succès reste identique à chaque tirage — les tirages restent indépendants.")],
    },
    {
      enonce: [texte("Tirer plusieurs cartes SANS les remettre dans le jeu donne aussi des épreuves indépendantes, compatibles avec une loi binomiale.")],
      reponse: false,
      justification: [texte("Faux — sans remise, la composition du jeu change à chaque tirage : la probabilité de succès n'est plus constante, les épreuves ne sont plus indépendantes (c'est une loi hypergéométrique, pas binomiale).")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=5"), texte(" épreuves indépendantes de probabilité de succès "), latex("p=0{,}4"), texte(" chacune, "),
        latex("P(X=2)=C_5^2\\times0{,}4^2\\times0{,}6^3=10\\times0{,}16\\times0{,}216=0{,}3456"), texte("."),
      ],
      reponse: true,
      justification: [texte("Application directe de la formule "), latex("P(X=k)=C_n^k\\,p^k(1-p)^{n-k}"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" épreuves indépendantes de probabilité de succès "), latex("p=0{,}4"), texte(", "), latex("P(X=2)"), texte(" et "), latex("P(X=3)"), texte(" sont égales, puisque "), latex("C_5^2=C_5^3=10"), texte(".")],
      reponse: false,
      justification: [texte("Les coefficients sont égaux, mais pas les puissances : "), latex("P(X=2)=10\\times0{,}4^2\\times0{,}6^3=0{,}3456"), texte(" et "), latex("P(X=3)=10\\times0{,}4^3\\times0{,}6^2=0{,}2304"), texte(". Les deux ne coïncident que si "), latex("p=0{,}5"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X=0)=0{,}6^5=0{,}07776"),
        texte(" (aucun succès)."),
      ],
      reponse: true,
      justification: [latex("P(X=0)=C_5^0\\times0{,}4^0\\times0{,}6^5=1\\times1\\times0{,}07776=0{,}07776"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X=5)"),
        texte(" (tous des succès) vaudrait "),
        latex("0{,}6^5=0{,}07776"),
        texte(", la même valeur que "),
        latex("P(X=0)"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("P(X=5)=0{,}4^5=0{,}01024"), texte(", une valeur différente de "), latex("P(X=0)=0{,}6^5=0{,}07776"),
        texte(" — ces 2 valeurs ne sont symétriques que si "), latex("p=0{,}5"), texte(", jamais pour "), latex("p=0{,}4"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), l'espérance "),
        latex("E(X)=n\\times p=5\\times0{,}4=2"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Formule directe de l'espérance d'une loi binomiale : "), latex("E(X)=np"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), l'espérance "),
        latex("E(X)"),
        texte(" vaudrait plutôt "),
        latex("\\dfrac{n}{p}=\\dfrac{5}{0{,}4}=12{,}5"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("La formule correcte est "), latex("E(X)=n\\times p=2"), texte(", jamais "), latex("\\dfrac{n}{p}"),
        texte(" — cette dernière valeur ("), latex("12{,}5"), texte(") dépasserait même "), latex("n"), texte(", ce qui est impossible pour une variable bornée entre 0 et 5."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" et "), latex("p=0{,}4"), texte(", sachant que "), latex("P(X=0)=0{,}07776"), texte(" et "), latex("P(X=1)=0{,}2592"), texte(", on obtient "), latex("P(X\\leq1)=0{,}33696"), texte(".")],
      reponse: true,
      justification: [texte("« Au plus 1 » est la somme directe des 2 premiers termes : "), latex("0{,}07776+0{,}2592=0{,}33696"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X\\geq1)"),
        texte(" peut se calculer par complément : "),
        latex("P(X\\geq1)=1-P(X=0)=1-0{,}07776=0{,}92224"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("« Au moins 1 succès » est le complément exact de « aucun succès » — stratégie plus rapide qu'une somme de 5 termes.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X\\geq1)"),
        texte(" se calculerait plutôt par complément de "),
        latex("P(X=5)"),
        texte(" : "),
        latex("P(X\\geq1)=1-P(X=5)=1-0{,}01024=0{,}98976"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le complément de « au moins 1 succès » est « aucun succès » ("), latex("X=0"), texte("), jamais « tous des succès » ("), latex("X=5"),
        texte(") — la bonne valeur est "), latex("1-P(X=0)=0{,}92224"), texte(", pas "), latex("0{,}98976"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour des épreuves indépendantes de probabilité de succès "), latex("p=0{,}1"), texte(", sachant que "), latex("\\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)}\\approx21{,}85"), texte(", le nombre minimal d'épreuves pour que "), latex("P(\\text{au moins 1 succès})>0{,}9"), texte(" est "), latex("n=22"), texte(".")],
      reponse: true,
      justification: [latex("1-0{,}9^n>0{,}9\\iff n>\\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)}\\approx21{,}85"), texte(" : le plus petit entier qui convient est "), latex("22"), texte(".")],
    },
    {
      enonce: [
        texte("Pour des épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}1"),
        texte(", avec l'objectif "),
        latex("P(\\text{au moins 1 succès})>0{,}9"),
        texte(", résoudre "),
        latex("(0{,}9)^n<0{,}1"),
        texte(" donnerait "),
        latex("n<\\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)}"),
        texte(", le sens de l'inégalité restant inchangé en divisant par "),
        latex("\\ln(0{,}9)"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Diviser par "), latex("\\ln(0{,}9)"), texte(", qui est NÉGATIF, inverse le sens de l'inégalité — la bonne résolution donne "),
        latex("n>\\dfrac{\\ln(0{,}1)}{\\ln(0{,}9)}"), texte(", pas "), latex("n<\\dots"), texte(", piège central de ce type d'exercice."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("p=0{,}1"), texte(" et l'objectif "), latex("P(\\text{au moins 1 succès})>0{,}9"), texte(", sachant que "), latex("0{,}9^{21}\\approx0{,}109"), texte(", "), latex("n=21"), texte(" épreuves ne suffisent pas.")],
      reponse: true,
      justification: [latex("P(\\text{au moins 1})=1-0{,}9^{21}\\approx0{,}891<0{,}9"), texte(" : il en faut une de plus.")],
    },
    {
      enonce: [texte("La loi binomiale "), latex("\\mathcal{B}(n\\,;p)"), texte(" est entièrement déterminée par 2 paramètres : le nombre d'épreuves "), latex("n"), texte(" et la probabilité de succès "), latex("p"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même de la loi binomiale — une fois "), latex("n"), texte(" et "), latex("p"), texte(" fixés, toutes les probabilités "), latex("P(X=k)"), texte(" sont calculables.")],
    },
    {
      enonce: [texte("La loi binomiale "), latex("\\mathcal{B}(n\\,;p)"), texte(" nécessite un 3ᵉ paramètre, le nombre de succès "), latex("k"), texte(", pour être entièrement déterminée.")],
      reponse: false,
      justification: [texte("k"), texte(" n'est pas un paramètre de la LOI elle-même mais la variable dont on calcule la probabilité — la loi "), latex("\\mathcal{B}(n\\,;p)"), texte(" ne dépend que de "), latex("n"), texte(" et "), latex("p"), texte(", "), latex("k"), texte(" varie librement de 0 à "), latex("n"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), la variance vaut "),
        latex("V(X)=n\\times p\\times(1-p)=5\\times0{,}4\\times0{,}6=1{,}2"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Formule directe de la variance d'une loi binomiale : "), latex("V(X)=np(1-p)"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), la variance vaudrait "),
        latex("2"),
        texte(", comme l'espérance, puisque espérance et variance d'une loi binomiale sont toutes deux égales à "),
        latex("n\\times p"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Seule l'espérance vaut "), latex("np=2"), texte(" ; la variance vaut "), latex("np(1-p)=1{,}2"),
        texte(", strictement plus petite (le facteur "), latex("1-p=0{,}6"), texte(" manque). L'égalité espérance = variance est une propriété de la loi de POISSON, jamais de la loi binomiale (sauf cas dégénéré "),
        latex("p=0"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), l'écart-type vaut "),
        latex("\\sigma(X)=\\sqrt{n\\,p\\,(1-p)}=\\sqrt{1{,}2}\\approx1{,}095"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("L'écart-type est la racine carrée de la variance "), latex("np(1-p)=1{,}2"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X=2)=0{,}4^2\\times0{,}6^3=0{,}03456"),
        texte(" : le coefficient binomial est superflu tant que les 2 exposants sont corrects."),
      ],
      reponse: false,
      justification: [
        texte("Oublier "), latex("C_5^2=10"), texte(" donne une valeur 10 fois trop petite : la bonne réponse est "),
        latex("10\\times0{,}03456=0{,}3456"), texte(". Le coefficient binomial compte les positions possibles des "), latex("k"),
        texte(" succès parmi les "), latex("n"), texte(" épreuves — jamais optionnel dès que "), latex("0<k<n"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X=2)=C_5^2\\times0{,}4^3\\times0{,}6^2=10\\times0{,}064\\times0{,}36=0{,}2304"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Les 2 exposants sont échangés : "), latex("p"), texte(" porte toujours l'exposant "), latex("k=2"), texte(" et "),
        latex("1-p"), texte(" l'exposant "), latex("n-k=3"), texte(", donc "), latex("P(X=2)=0{,}3456"), texte(". La valeur "),
        latex("0{,}2304"), texte(" obtenue ici est en réalité "), latex("P(X=3)"), texte(" — une erreur d'autant plus traître qu'elle donne une probabilité parfaitement plausible."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" épreuves indépendantes de probabilité de succès "), latex("p=0{,}4"), texte(", les 6 probabilités "), latex("P(X=0)=0{,}07776"), texte(" ; "), latex("P(X=1)=0{,}2592"), texte(" ; "), latex("P(X=2)=0{,}3456"), texte(" ; "), latex("P(X=3)=0{,}2304"), texte(" ; "), latex("P(X=4)=0{,}0768"), texte(" ; "), latex("P(X=5)=0{,}01024"), texte(" ont une somme égale à 1.")],
      reponse: true,
      justification: [texte("Les valeurs "), latex("k=0"), texte(" à "), latex("k=5"), texte(" épuisent tous les cas possibles : leur somme vaut nécessairement 1 (c'est le binôme "), latex("(0{,}6+0{,}4)^5=1"), texte(").")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X\\leq2)=0{,}07776+0{,}25920+0{,}34560=0{,}68256"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Somme directe des 3 premiers termes ; le complément demanderait lui aussi 3 termes (k = 3, 4 et 5).")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X\\geq4)=1-P(X\\leq4)=1-0{,}98976=0{,}01024"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le contraire de « au moins 4 » est « au plus 3 », jamais « au plus 4 » (la valeur "), latex("k=4"),
        texte(" appartient aux deux) : "), latex("P(X\\geq4)=1-P(X\\leq3)=1-0{,}91296=0{,}08704"), texte(". La valeur "),
        latex("0{,}01024"), texte(" obtenue ici n'est que "), latex("P(X=5)"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le vrai événement contraire de « au moins "), latex("k"), texte(" » est « au plus "), latex("k-1"),
        texte(" », et celui de « au plus "), latex("k"), texte(" » est « au moins "), latex("k+1"), texte(" »."),
      ],
      reponse: true,
      justification: [texte("Il faut toujours décaler le seuil d'une unité pour exclure la valeur frontière — sans ce décalage, les 2 événements partagent "), latex("X=k"), texte(" et ne sont plus contraires.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X\\geq4)=P(X=4)+P(X=5)=0{,}07680+0{,}01024=0{,}08704"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Somme directe de 2 termes — ici plus courte que le complément "), latex("1-P(X\\leq3)"), texte(" (4 termes), qui donne d'ailleurs la même valeur.")],
    },
    {
      enonce: [
        texte("La distribution "), latex("\\mathcal{B}(5\\,;0{,}4)"), texte(" est symétrique autour de son espérance "), latex("E(X)=2"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Une loi binomiale n'est symétrique que si "), latex("p=0{,}5"), texte(". Ici "), latex("P(X=1)=0{,}25920"),
        texte(" et "), latex("P(X=3)=0{,}23040"), texte(" diffèrent, alors que 1 et 3 sont à égale distance de "), latex("2"),
        texte(" : la distribution penche vers les petites valeurs, car "), latex("p<0{,}5"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=5"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p=0{,}4"),
        texte(" ("),
        latex("X"),
        texte(" : nombre de succès), la probabilité la plus élevée est "),
        latex("P(X=2)=0{,}34560"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Aucune des 5 autres valeurs n'atteint "), latex("0{,}34560"), texte(" — le maximum tombe ici sur "), latex("k=2"), texte(", qui coïncide avec "), latex("E(X)=np=2"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("p=0{,}1"), texte(" et un seuil de "), latex("0{,}9"), texte(", sachant que "), latex("0{,}9^{22}\\approx0{,}0985"), texte(", "), latex("n=22"), texte(" est encore insuffisant.")],
      reponse: false,
      justification: [latex("0{,}0985<0{,}1"), texte(", donc "), latex("P(\\text{au moins 1 succès})\\approx1-0{,}0985=0{,}9015>0{,}9"), texte(" : "), latex("n=22"), texte(" convient — c'est "), latex("n=21"), texte(" qui ne suffit pas.")],
    },
    {
      enonce: [
        texte("Puisque "), latex("X"), texte(" compte un nombre entier de succès, son espérance "), latex("E(X)=np"), texte(" est toujours un entier."),
      ],
      reponse: false,
      justification: [
        texte("L'espérance est une moyenne pondérée, jamais forcément une valeur atteignable : pour "), latex("n=5"), texte(" et "),
        latex("p=0{,}3"), texte(", "), latex("E(X)=1{,}5"), texte(". Que "), latex("E(X)=2"), texte(" tombe sur un entier pour "),
        latex("n=5"), texte(" et "), latex("p=0{,}4"), texte(" est une coïncidence de ces valeurs-là."),
      ],
    },
    {
      enonce: [
        texte("Une question « exactement "), latex("k"), texte(" succès » se calcule par une somme des termes de 0 à "), latex("k"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("« Exactement "), latex("k"), texte(" » (comme « aucun » ou « tous ») ne demande QU'UN SEUL terme, "),
        latex("C_n^kp^k(1-p)^{n-k}"), texte(" — la somme de 0 à "), latex("k"), texte(" calcule « au plus "), latex("k"), texte(" », une question différente."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 3 — Loi normale, ref 6gen51
  // Scénario fixe : X~N(50,10). x=65→z=1,5, Φ(1,5)≈0,9332. x=35→z=-1,5, Φ(-1,5)≈0,0668.
  // Règle empirique k=1→68,3% ; k=2→95,4% ; k=3→99,7%. Intervalle [30;70]=μ±2σ, 95,4% ; hors
  // intervalle 4,6% (2 côtés), 2,3% (1 côté). P(1≤Z≤2)=Φ(2)-Φ(1)≈0,9772-0,8413=0,1359.
  // Φ⁻¹(0,95)≈1,645.
  // ==========================================================================
  loiNormale: [
    {
      enonce: [
        texte("Pour une variable "), latex("X\\sim \\mathcal{N}(\\mu\\,;\\sigma)"), texte(", la standardisation "), latex("Z=\\dfrac{X-\\mu}{\\sigma}"),
        texte(" transforme "), latex("X"), texte(" en une variable centrée réduite "), latex("\\mathcal{N}(0\\,;1)"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la définition même de la standardisation d'une loi normale.")],
    },
    {
      enonce: [
        texte("Pour standardiser "), latex("X\\sim \\mathcal{N}(\\mu\\,;\\sigma)"), texte(", il faut calculer "), latex("Z=\\dfrac{X-\\sigma}{\\mu}"),
        texte(", en échangeant les rôles de "), latex("\\mu"), texte(" et "), latex("\\sigma"), texte("."),
      ],
      reponse: false,
      justification: [texte("La formule correcte est "), latex("Z=\\dfrac{X-\\mu}{\\sigma}"), texte(" — soustraire la moyenne "), latex("\\mu"), texte(", puis diviser par l'écart-type "), latex("\\sigma"), texte(", jamais l'inverse.")],
    },
    {
      enonce: [texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", la valeur "), latex("x=65"), texte(" correspond à "), latex("z=\\dfrac{65-50}{10}=1{,}5"), texte(".")],
      reponse: true,
      justification: [texte("Application directe de la formule de standardisation.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", la valeur "),
        latex("x=65"),
        texte(" correspondrait à "),
        latex("z=\\dfrac{65-10}{50}=1{,}1"),
        texte("."),
      ],
      reponse: false,
      justification: [texte("La formule utilise "), latex("\\dfrac{x-\\mu}{\\sigma}=\\dfrac{65-50}{10}=1{,}5"), texte(", jamais "), latex("\\dfrac{x-\\sigma}{\\mu}"), texte(" — confusion des rôles de "), latex("\\mu"), texte(" et "), latex("\\sigma"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", "), latex("P(X\\leq65)=\\Phi(1{,}5)\\approx0{,}9332"),
        texte(", où "), latex("\\Phi"), texte(" est la fonction de répartition de la loi normale centrée réduite."),
      ],
      reponse: true,
      justification: [texte("On standardise d'abord ("), latex("z=1{,}5"), texte(") puis on lit "), latex("\\Phi(1{,}5)"), texte(" dans la table.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", "),
        latex("P(X\\geq65)=1-\\Phi(1{,}5)\\approx1-0{,}9332=0{,}0668"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("« Au moins » est le complément de « au plus » : "), latex("P(X\\geq65)=1-P(X\\leq65)"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", "),
        latex("P(X\\geq65)"),
        texte(" se calculerait plutôt directement par "),
        latex("\\Phi(1{,}5)\\approx0{,}9332"),
        texte(", sans complément."),
      ],
      reponse: false,
      justification: [texte("Φ(z) donne toujours "), latex("P(Z\\leq z)"), texte(", jamais "), latex("P(Z\\geq z)"), texte(" directement — il faut impérativement passer par le complément "), latex("1-\\Phi(z)"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", "),
        latex("P(X\\leq35)=\\Phi(-1{,}5)=1-\\Phi(1{,}5)\\approx0{,}0668"),
        texte(", par symétrie de la loi normale centrée réduite."),
      ],
      reponse: true,
      justification: [texte("Symétrie exacte de "), latex("\\Phi"), texte(" : "), latex("\\Phi(-z)=1-\\Phi(z)"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", "),
        latex("P(X\\leq35)=\\Phi(-1{,}5)"),
        texte(" vaudrait la même valeur que "),
        latex("\\Phi(1{,}5)\\approx0{,}9332"),
        texte(", la fonction "),
        latex("\\Phi"),
        texte(" étant paire."),
      ],
      reponse: false,
      justification: [
        texte("Φ n'est PAS une fonction paire — elle vérifie "), latex("\\Phi(-z)=1-\\Phi(z)"), texte(" (symétrie par rapport au point "), latex("(0\\,;0{,}5)"),
        texte("), donc "), latex("\\Phi(-1{,}5)\\approx0{,}0668"), texte(", très différent de "), latex("\\Phi(1{,}5)\\approx0{,}9332"), texte("."),
      ],
    },
    {
      enonce: [texte("La règle empirique dit qu'environ "), latex("95{,}4\\,\\%"), texte(" des valeurs d'une loi normale se situent dans l'intervalle "), latex("[\\mu-2\\sigma\\,;\\mu+2\\sigma]"), texte(".")],
      reponse: true,
      justification: [texte("C'est la valeur conventionnelle enseignée pour "), latex("k=2"), texte(" ("), latex("2\\cdot\\Phi(2)-1\\approx0{,}954"), texte(").")],
    },
    {
      enonce: [texte("La règle empirique dit qu'environ "), latex("68{,}3\\,\\%"), texte(" des valeurs d'une loi normale se situent dans l'intervalle "), latex("[\\mu-2\\sigma\\,;\\mu+2\\sigma]"), texte(".")],
      reponse: false,
      justification: [texte("68,3% correspond à "), latex("k=1"), texte(" (intervalle "), latex("[\\mu-\\sigma\\,;\\mu+\\sigma]"), texte("), pas à "), latex("k=2"), texte(" — pour "), latex("k=2"), texte(", c'est "), latex("95{,}4\\,\\%"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", environ "), latex("95{,}4\\,\\%"), texte(" des valeurs se situent dans "), latex("[30\\,;70]"), texte(" (soit "), latex("\\mu\\pm2\\sigma"), texte(").")],
      reponse: true,
      justification: [latex("50-2\\times10=30"), texte(" et "), latex("50+2\\times10=70"), texte(", et le pourcentage associé à "), latex("k=2"), texte(" est bien "), latex("95{,}4\\,\\%"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", dont environ "),
        latex("95{,}4\\,\\%"),
        texte(" des valeurs sont dans "),
        latex("[30\\,;70]"),
        texte(", la probabilité d'être HORS de cet intervalle, TOUS CÔTÉS confondus, vaut "),
        latex("1-0{,}954=0{,}046"),
        texte(" ("),
        latex("4{,}6\\,\\%"),
        texte(")."),
      ],
      reponse: true,
      justification: [texte("Complément direct de "), latex("95{,}4\\,\\%"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", dont environ "),
        latex("95{,}4\\,\\%"),
        texte(" des valeurs sont dans "),
        latex("[30\\,;70]"),
        texte(", la probabilité d'être seulement AU-DESSUS de "),
        latex("70"),
        texte(" (un seul côté) vaut aussi "),
        latex("0{,}046"),
        texte(" ("),
        latex("4{,}6\\,\\%"),
        texte("), comme pour les deux côtés réunis."),
      ],
      reponse: false,
      justification: [
        texte("Piège classique : il faut diviser le complément par 2 pour ne garder qu'UN SEUL côté (la loi normale étant symétrique) : "),
        latex("0{,}046/2=0{,}023"), texte(" ("), latex("2{,}3\\,\\%"), texte("), pas "), latex("0{,}046"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("X\\sim \\mathcal{N}(50\\,;10)"),
        texte(", la probabilité d'être strictement au-dessus de "),
        latex("70"),
        texte(" (un seul côté) vaut "),
        latex("0{,}046/2=0{,}023"),
        texte(" ("),
        latex("2{,}3\\,\\%"),
        texte(")."),
      ],
      reponse: true,
      justification: [texte("Division par 2 du complément total, car les deux côtés (au-dessus de 70 et en-dessous de 30) sont symétriques et se partagent également le "), latex("4{,}6\\,\\%"), texte(" restant.")],
    },
    {
      enonce: [texte("Pour la loi normale centrée réduite, "), latex("P(1\\leq Z\\leq2)=\\Phi(2)-\\Phi(1)\\approx0{,}9772-0{,}8413=0{,}1359"), texte(".")],
      reponse: true,
      justification: [texte("La probabilité d'un intervalle "), latex("[z_1\\,;z_2]"), texte(" est toujours la différence des 2 valeurs de "), latex("\\Phi"), texte(" correspondantes.")],
    },
    {
      enonce: [
        texte("Pour la loi normale centrée réduite, "),
        latex("P(1\\leq Z\\leq2)"),
        texte(" se calculerait plutôt en additionnant "),
        latex("\\Phi(1)"),
        texte(" et "),
        latex("\\Phi(2)"),
        texte(" : "),
        latex("0{,}8413+0{,}9772=1{,}8185"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Il faut SOUSTRAIRE, pas additionner : "), latex("\\Phi(2)-\\Phi(1)\\approx0{,}1359"),
        texte(" — une probabilité ne peut d'ailleurs jamais dépasser 1, ce qui aurait dû alerter ("), latex("1{,}8185>1"), texte(" est impossible)."),
      ],
    },
    {
      enonce: [texte("Retrouver "), latex("x"), texte(" depuis "), latex("z"), texte(" (sens inverse de la standardisation) se fait par "), latex("x=\\mu+z\\times\\sigma"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'opération inverse exacte de "), latex("z=\\dfrac{x-\\mu}{\\sigma}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour trouver le "), latex("z"), texte(" tel que "), latex("\\Phi(z)=0{,}95"), texte(", on utilise la fonction inverse "), latex("\\Phi^{-1}"),
        texte(" (« table inversée ») ; on obtient "), latex("z\\approx1{,}645"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la valeur usuelle du quantile à 95% de la loi normale centrée réduite, largement utilisée (intervalles de confiance, etc.).")],
    },
    {
      enonce: [
        texte("Pour trouver le "),
        latex("z"),
        texte(" tel que "),
        latex("\\Phi(z)=0{,}95"),
        texte(", il suffit de calculer "),
        latex("1-0{,}95=0{,}05"),
        texte(", sans utiliser la fonction inverse "),
        latex("\\Phi^{-1}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("1-0{,}95=0{,}05"), texte(" est une probabilité, pas une valeur de "), latex("z"), texte(" — il faut bien passer par la fonction inverse "),
        latex("\\Phi^{-1}"), texte(" pour convertir une probabilité en valeur de "), latex("z"), texte(" (ici "), latex("z\\approx1{,}645"), texte(", très différent de "), latex("0{,}05"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("La loi normale est une loi CONTINUE : pour "), latex("X\\sim \\mathcal{N}(\\mu\\,;\\sigma)"), texte(", "), latex("P(X=x)=0"),
        texte(" pour toute valeur précise "), latex("x"), texte(", et seule une probabilité sur un intervalle a un sens."),
      ],
      reponse: true,
      justification: [texte("Une variable continue prend une infinité de valeurs : aucune valeur isolée ne peut porter une probabilité non nulle, sans quoi la somme des probabilités dépasserait 1.")],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", "), latex("P(X=50)"), texte(" est la plus grande probabilité de la loi, puisque "),
        latex("50"), texte(" est le sommet de la courbe en cloche."),
      ],
      reponse: false,
      justification: [
        latex("P(X=50)=0"), texte(", comme toute valeur isolée d'une loi continue. Le sommet de la cloche est une valeur de DENSITÉ, jamais une probabilité — la probabilité est une AIRE sous la courbe, donc toujours nulle sur un intervalle réduit à un point."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", "), latex("P(45<X<55)"), texte(" et "), latex("P(45\\leq X\\leq55)"),
        texte(" valent exactement la même chose."),
      ],
      reponse: true,
      justification: [
        texte("Puisque "), latex("P(X=45)=P(X=55)=0"), texte(", ajouter ou retirer une borne ne change jamais la probabilité d'un intervalle en continu — c'est l'inverse exact du cas discret, où la valeur frontière pèse un vrai "),
        latex("P(X=k)"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi continue de densité "), latex("f"), texte(", la valeur "), latex("f(t)"), texte(" lue en un point "), latex("t"),
        texte(" donne directement "), latex("P(X=t)"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("La probabilité est l'AIRE sous la courbe entre 2 bornes ("), latex("P(a\\leq X\\leq b)=\\int_a^b f(t)\\,dt"),
        texte("), jamais une valeur lue en un point : "), latex("P(X=t)=0"), texte(" pour tout "), latex("t"), texte("."),
      ],
    },
    {
      enonce: [
        texte("L'aire totale sous la courbe de densité vaut toujours 1, et "), latex("\\Phi(z)"),
        texte(" est l'aire située à GAUCHE de "), latex("z"), texte(" sous la courbe de "), latex("\\mathcal{N}(0\\,;1)"), texte("."),
      ],
      reponse: true,
      justification: [latex("\\int_u^v f(t)\\,dt=1"), texte(" est la 1ʳᵉ condition d'une densité de probabilité, et "), latex("\\Phi(z)=P(Z\\leq z)"), texte(" est bien l'aire cumulée jusqu'à "), latex("z"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", le graphique de la fonction de répartition "), latex("F(x)=P(X\\leq x)"),
        texte(" est un graphique en escaliers, comme pour une variable discrète."),
      ],
      reponse: false,
      justification: [
        texte("Le graphique en escaliers est propre aux variables DISCRÈTES. Pour une variable continue, "), latex("F"),
        texte(" est une courbe continue et croissante, dérivable, de dérivée la densité ("), latex("F'=f"), texte(")."),
      ],
    },
    {
      enonce: [texte("Selon la règle empirique pour "), latex("k=1"), texte(", environ "), latex("68{,}27\\,\\%"), texte(" des valeurs sont dans "), latex("[\\mu-\\sigma\\,;\\mu+\\sigma]"), texte(", donc environ "), latex("31{,}73\\,\\%"), texte(" en dehors (2 côtés) et "), latex("15{,}87\\,\\%"), texte(" d'un seul côté.")],
      reponse: true,
      justification: [latex("1-0{,}6827=0{,}3173"), texte(" pour les 2 côtés, puis la moitié, "), latex("0{,}1587"), texte(", pour un seul côté : la loi normale est symétrique.")],
    },
    {
      enonce: [texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", environ "), latex("99{,}7\\,\\%"), texte(" des valeurs se situent dans "), latex("[40\\,;60]"), texte(".")],
      reponse: false,
      justification: [
        latex("[40\\,;60]=[\\mu-\\sigma\\,;\\mu+\\sigma]"), texte(" correspond à "), latex("k=1"), texte(", donc à "), latex("68{,}3\\,\\%"),
        texte(". Les "), latex("99{,}7\\,\\%"), texte(" correspondent à "), latex("k=3"), texte(", soit "), latex("[\\mu-3\\sigma\\,;\\mu+3\\sigma]=[20\\,;80]"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", "), latex("P(X\\leq40)=\\Phi(-1)=1-\\Phi(1)\\approx1-0{,}8413=0{,}1587"),
        texte(", cohérent avec les "), latex("15{,}87\\,\\%"), texte(" « d'un seul côté » de la règle empirique pour "), latex("k=1"), texte("."),
      ],
      reponse: true,
      justification: [texte("La lecture de table et la règle empirique donnent bien la même valeur à l'arrondi près — la règle empirique n'est qu'une version mémorisée de la table.")],
    },
    {
      enonce: [
        texte("Pour la loi normale centrée réduite, "), latex("P(-2\\leq Z\\leq2)=2\\times\\Phi(2)\\approx2\\times0{,}9772=1{,}9544"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("La bonne formule pour un intervalle symétrique est "), latex("P(-z\\leq Z\\leq z)=2\\Phi(z)-1"), texte(", soit "),
        latex("2\\times0{,}9772-1=0{,}9544"), texte(" — les "), latex("95{,}4\\,\\%"), texte(" de la règle empirique. Le résultat "),
        latex("1{,}9544>1"), texte(" aurait dû alerter : une probabilité ne dépasse jamais 1."),
      ],
    },
    {
      enonce: [texte("Pour la loi normale centrée réduite, "), latex("\\Phi(0)=0"), texte(", puisque "), latex("z=0"), texte(" est le centre de la loi.")],
      reponse: false,
      justification: [
        latex("\\Phi(0)=P(Z\\leq0)=0{,}5"), texte(" : la moitié de l'aire est à gauche du centre. On le retrouve par la symétrie "),
        latex("\\Phi(-z)=1-\\Phi(z)"), texte(" appliquée à "), latex("z=0"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour s'assurer qu'une distribution statistique suit une loi normale, on vérifie 2 choses : moyenne, mode et médiane approximativement égaux, et une répartition conforme à la règle empirique ("),
        latex("68{,}3\\,\\%"), texte(" / "), latex("95{,}4\\,\\%"), texte(" / "), latex("99{,}7\\,\\%"), texte(") — mais ces vérifications ne DÉMONTRENT jamais la normalité."),
      ],
      reponse: true,
      justification: [texte("Ce sont les 2 vérifications pratiques usuelles ; on accepte alors le modèle normal en pratique, sans l'avoir démontré.")],
    },
    {
      enonce: [
        texte("Si la moyenne, le mode et la médiane d'une série statistique coïncident, alors on a DÉMONTRÉ que cette distribution suit exactement une loi normale."),
      ],
      reponse: false,
      justification: [
        texte("C'est un critère pratique, jamais une preuve — et il est de toute façon incomplet : il faut EN PLUS vérifier la répartition selon la règle empirique ("),
        latex("68{,}3\\,\\%"), texte(" / "), latex("95{,}4\\,\\%"), texte(" / "), latex("99{,}7\\,\\%"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("X\\sim \\mathcal{N}(50\\,;10)"), texte(", "), latex("z=\\dfrac{75-50}{10}=2{,}5"), texte(" et "),
        latex("P(X\\geq75)=1-\\Phi(2{,}5)\\approx1-0{,}9938=0{,}0062"), texte(", soit environ "), latex("6{,}2\\,\\%"), texte(" des valeurs."),
      ],
      reponse: false,
      justification: [
        texte("Le calcul est juste, la conversion en pourcentage ne l'est pas : "), latex("0{,}0062=0{,}62\\,\\%"), texte(", pas "),
        latex("6{,}2\\,\\%"), texte(" — un facteur 10 d'écart. Une probabilité se multiplie par 100 pour devenir un pourcentage, jamais par 1000."),
      ],
    },
    {
      enonce: [
        texte("La densité de probabilité "), latex("f"), texte(" est la primitive de la fonction de répartition "), latex("F"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : "), latex("F'=f"), texte(" — la densité est la DÉRIVÉE de la fonction de répartition, et "),
        latex("F"), texte(" est donc une primitive de "), latex("f"), texte(" ("), latex("F(x)=\\int_u^x f(t)\\,dt"), texte(")."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 4 — Extensions binomiale, normale et Bayes, ref 6gen52
  // Scénario A (composé) : p1=0,5, p2=0,3 → p=0,15 ; n min (seuil 0,8) = 10. Scénario D (Bayes 3
  // catégories) : q1=0,3/q2=0,45/q3=0,25 (somme 1) ; r1=0,1/r2=0,2/r3=0,4 ; pTotal=0,22 ;
  // P(cat3|critère)=0,1/0,22≈0,4545. Scénario E (uniforme) : [0;60], P(10≤X≤25)=15/60=0,25.
  // Scénario F (reconstruire+E appliquée) : %1=20,%2=30→%3=50 ; valeurs 15/35/60€ ; E(X)=43,5€ ;
  // population 500 → 21 750€.
  // ==========================================================================
  extensionsBinomialeNormaleBayes: [
    {
      enonce: [
        texte("Dans un jeu à 2 épreuves indépendantes de probabilités de succès respectives "), latex("p_1=0{,}5"), texte(" et "), latex("p_2=0{,}3"),
        texte(", la probabilité de réussir les DEUX vaut "), latex("p=p_1\\times p_2=0{,}15"), texte("."),
      ],
      reponse: true,
      justification: [texte("Deux épreuves indépendantes réussies TOUTES LES DEUX (« ET » logique) : on multiplie les probabilités.")],
    },
    {
      enonce: [
        texte("Dans un jeu à 2 épreuves indépendantes de probabilités de succès respectives "),
        latex("p_1=0{,}5"),
        texte(" et "),
        latex("p_2=0{,}3"),
        texte(", la probabilité de réussir les DEUX vaudrait plutôt "),
        latex("p=p_1+p_2=0{,}8"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("« ET » logique se traduit par une MULTIPLICATION, jamais une addition — "), latex("0{,}8"),
        texte(" dépasserait même la probabilité de réussir chaque épreuve séparément, ce qui n'a pas de sens pour un ET plus restrictif qu'un OU."),
      ],
    },
    {
      enonce: [texte("Pour des répétitions indépendantes d'une épreuve de probabilité de succès "), latex("p=0{,}15"), texte(", sachant que "), latex("\\dfrac{\\ln(0{,}2)}{\\ln(0{,}85)}\\approx9{,}90"), texte(", le nombre minimal de répétitions pour que "), latex("P(\\text{au moins 1 succès})>0{,}8"), texte(" est "), latex("n=10"), texte(".")],
      reponse: true,
      justification: [latex("1-0{,}85^n>0{,}8\\iff n>\\dfrac{\\ln(0{,}2)}{\\ln(0{,}85)}\\approx9{,}90"), texte(" : le plus petit entier qui convient est "), latex("10"), texte(".")],
    },
    {
      enonce: [texte("Pour des répétitions indépendantes d'une épreuve de probabilité de succès "), latex("p=0{,}15"), texte(", sachant que "), latex("0{,}85^9\\approx0{,}232"), texte(", "), latex("n=9"), texte(" répétitions suffisent déjà pour que "), latex("P(\\text{au moins 1 succès})>0{,}8"), texte(".")],
      reponse: false,
      justification: [latex("1-0{,}232=0{,}768<0{,}8"), texte(" : "), latex("n=9"), texte(" est encore insuffisant, il faut "), latex("n=10"), texte(".")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients : elles forment une partition de la clientèle.")],
      reponse: true,
      justification: [latex("30+45+25=100"), texte(", et chaque client est dans une seule catégorie : c'est bien une partition.")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(" : la probabilité qu'un client déclare un sinistre vaut "), latex("P(S)=0{,}3\\times0{,}1+0{,}45\\times0{,}2+0{,}25\\times0{,}4=0{,}22"), texte(".")],
      reponse: true,
      justification: [texte("Formule des probabilités totales à 3 termes : "), latex("0{,}03+0{,}09+0{,}1=0{,}22"), texte(".")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(". La probabilité qu'un client déclare un sinistre est la moyenne simple "), latex("\\dfrac{0{,}1+0{,}2+0{,}4}{3}\\approx0{,}233"), texte(".")],
      reponse: false,
      justification: [texte("Cette moyenne ignore le poids de chaque catégorie : la formule des probabilités totales pondère chaque "), latex("P(S\\mid C_i)"), texte(" par "), latex("P(C_i)"), texte(" et donne "), latex("0{,}22"), texte(".")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(" ; "), latex("P(S)=0{,}22"), texte(". La probabilité qu'un client sinistré soit dans la catégorie 3 vaut "), latex("P(C_3\\mid S)=\\dfrac{0{,}25\\times0{,}4}{0{,}22}\\approx0{,}4545"), texte(".")],
      reponse: true,
      justification: [texte("Théorème de Bayes : "), latex("P(C_3\\mid S)=\\dfrac{P(C_3)\\,P(S\\mid C_3)}{P(S)}=\\dfrac{0{,}1}{0{,}22}"), texte(".")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(". La probabilité qu'un client sinistré soit dans la catégorie 3 vaut simplement "), latex("P(C_3)=0{,}25"), texte(".")],
      reponse: false,
      justification: [texte("C'est confondre la probabilité a priori "), latex("P(C_3)=0{,}25"), texte(" et la probabilité a posteriori "), latex("P(C_3\\mid S)\\approx0{,}4545"), texte(" : le sinistre observé change la probabilité.")],
    },
    {
      enonce: [
        texte("Pour une variable "), latex("X"), texte(" uniformément répartie sur "), latex("[0\\,;60]"), texte(", la probabilité "), latex("P(10\\leq X\\leq25)"),
        texte(" vaut "), latex("\\dfrac{25-10}{60-0}=\\dfrac{15}{60}=0{,}25"), texte("."),
      ],
      reponse: true,
      justification: [texte("Pour une loi uniforme continue, la probabilité d'un intervalle est le rapport des longueurs, indépendant de sa position dans "), latex("[a\\,;b]"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une variable "),
        latex("X"),
        texte(" uniformément répartie sur "),
        latex("[0\\,;60]"),
        texte(", la probabilité "),
        latex("P(10\\leq X\\leq25)"),
        texte(" dépendrait de la position de l'intervalle : elle serait différente de "),
        latex("P(35\\leq X\\leq50)"),
        texte(", bien que ces 2 intervalles aient la même longueur ("),
        latex("15"),
        texte(")."),
      ],
      reponse: false,
      justification: [
        texte("Faux — pour une loi uniforme, seule la LONGUEUR de l'intervalle compte, jamais sa position : "),
        latex("P(10\\leq X\\leq25)=P(35\\leq X\\leq50)=0{,}25"), texte(", ces 2 probabilités sont IDENTIQUES."),
      ],
    },
    {
      enonce: [texte("Pour une loi uniforme continue sur "), latex("[a\\,;b]"), texte(", la densité de probabilité est constante, égale à "), latex("\\dfrac{1}{b-a}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même de la loi uniforme continue — la même « hauteur » de densité partout sur "), latex("[a\\,;b]"), texte(".")],
    },
    {
      enonce: [texte("Pour une loi uniforme continue sur "), latex("[a\\,;b]"), texte(", la densité de probabilité est plus élevée au centre de l'intervalle qu'aux extrémités.")],
      reponse: false,
      justification: [texte("Faux — la densité d'une loi UNIFORME est justement constante partout sur "), latex("[a\\,;b]"), texte(" (c'est ce qui la distingue d'une loi normale, dont la densité EST plus élevée au centre).")],
    },
    {
      enonce: [
        texte("Une offre tarifaire propose 3 formules, choisies par "), latex("20\\,\\%"), texte(" (formule 1) et "), latex("30\\,\\%"),
        texte(" (formule 2) des clients ; la 3ᵉ formule est donc choisie par "), latex("100-20-30=50\\,\\%"), texte(" des clients."),
      ],
      reponse: true,
      justification: [texte("Les 3 pourcentages, exhaustifs, somment nécessairement à "), latex("100\\,\\%"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une offre tarifaire à 3 formules ("),
        latex("15"), texte(" €"),
        texte(", "),
        latex("35"), texte(" €"),
        texte(" et "),
        latex("60"), texte(" €"),
        texte(", choisies respectivement par "),
        latex("20\\,\\%"),
        texte(", "),
        latex("30\\,\\%"),
        texte(" et "),
        latex("50\\,\\%"),
        texte(" des clients), le prix moyen payé par client vaut "),
        latex("E(X)=0{,}20\\times15+0{,}30\\times35+0{,}50\\times60=43{,}5"), texte(" €"),
        texte("."),
      ],
      reponse: true,
      justification: [latex("3+10{,}5+30=43{,}5"), texte(" : c'est l'espérance de la variable aléatoire « prix payé », pondérée par les 3 probabilités de choix.")],
    },
    {
      enonce: [
        texte("Pour une offre tarifaire à 3 formules ("),
        latex("15"), texte(" €"),
        texte(", "),
        latex("35"), texte(" €"),
        texte(" et "),
        latex("60"), texte(" €"),
        texte(", choisies respectivement par "),
        latex("20\\,\\%"),
        texte(", "),
        latex("30\\,\\%"),
        texte(" et "),
        latex("50\\,\\%"),
        texte(" des clients), le prix moyen payé par client se calculerait plutôt par la moyenne simple des 3 prix : "),
        latex("\\dfrac{15+35+60}{3}\\approx36{,}67"), texte(" €"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Cette moyenne simple ignore les probabilités de choix ("), latex("20\\,\\%/30\\,\\%/50\\,\\%"), texte(", différentes entre elles) — l'espérance pondérée par les VRAIES proportions vaut "),
        latex("43{,}5"), texte(" €"), texte(", pas "), latex("36{,}67"), texte(" €"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour une offre tarifaire à 3 formules ("),
        latex("15"), texte(" €"),
        texte(", "),
        latex("35"), texte(" €"),
        texte(" et "),
        latex("60"), texte(" €"),
        texte(", choisies respectivement par "),
        latex("20\\,\\%"),
        texte(", "),
        latex("30\\,\\%"),
        texte(" et "),
        latex("50\\,\\%"),
        texte(" des clients), appliquée à une population de 500 clients, la recette totale attendue vaut environ "),
        latex("E(X)\\times500=43{,}5\\times500=21\\,750"), texte(" €"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("On applique l'espérance par client à l'ensemble de la population, en la multipliant par l'effectif total.")],
    },
    {
      enonce: [
        texte("Pour une offre tarifaire à 3 formules ("),
        latex("15"), texte(" €"),
        texte(", "),
        latex("35"), texte(" €"),
        texte(" et "),
        latex("60"), texte(" €"),
        texte(", choisies respectivement par "),
        latex("20\\,\\%"),
        texte(", "),
        latex("30\\,\\%"),
        texte(" et "),
        latex("50\\,\\%"),
        texte(" des clients), appliquée à une population de 500 clients, la recette totale attendue vaudrait plutôt "),
        latex("43{,}5+500=543{,}5"), texte(" €"),
        texte(", en additionnant l'espérance et la population."),
      ],
      reponse: false,
      justification: [
        texte("Il faut MULTIPLIER l'espérance par l'effectif ("), latex("43{,}5\\times500=21\\,750"), texte(" €"),
        texte("), jamais les additionner — une addition ne fait d'ailleurs aucun sens dimensionnellement (un prix moyen plus un nombre de clients)."),
      ],
    },
    {
      enonce: [texte("Pour des événements incompatibles (qui ne peuvent pas se produire ensemble), le « OU » se traduit par une addition ; pour des événements indépendants, le « ET » se traduit par une multiplication.")],
      reponse: true,
      justification: [latex("P(A\\cup B)=P(A)+P(B)"), texte(" si "), latex("A\\cap B=\\varnothing"), texte(", et "), latex("P(A\\cap B)=P(A)\\times P(B)"), texte(" si "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants.")],
    },
    {
      enonce: [texte("Pour deux événements indépendants "), latex("A"), texte(" et "), latex("B"), texte(", le « OU » se calcule toujours en additionnant leurs probabilités : "), latex("P(A\\cup B)=P(A)+P(B)"), texte(".")],
      reponse: false,
      justification: [texte("Deux événements indépendants de probabilités non nulles peuvent se produire ensemble (ils ne sont jamais incompatibles) : "), latex("P(A\\cup B)=P(A)+P(B)-P(A)\\,P(B)"), texte(".")],
    },
    {
      enonce: [texte("Avec les conditions retenues dans ce cours, une loi binomiale "), latex("\\mathcal{B}(n\\,;p)"), texte(" s'approche par une loi normale lorsque "), latex("n>30"), texte(" et "), latex("0{,}3<p<0{,}7"), texte(", avec "), latex("\\mu=np"), texte(" et "), latex("\\sigma=\\sqrt{np(1-p)}"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont les 2 conditions du cours (des conventions), et la loi normale associée a la même espérance et le même écart-type que la binomiale.")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=100"), texte(" et "), latex("p=0{,}5"), texte(", les 2 conditions sont réunies et la loi normale associée a pour paramètres "),
        latex("\\mu=100\\times0{,}5=50"), texte(" et "), latex("\\sigma=\\sqrt{100\\times0{,}5\\times0{,}5}=\\sqrt{25}=5"), texte("."),
      ],
      reponse: true,
      justification: [latex("n=100>30"), texte(" et "), latex("p=0{,}5\\in\\;]0{,}3\\,;0{,}7[\\;"), texte(" : les 2 conditions sont vérifiées, puis application directe des formules.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=100"),
        texte(" et "),
        latex("p=0{,}5"),
        texte(", l'écart-type de la loi normale associée vaut "),
        latex("\\sigma=n\\times p\\times(1-p)=25"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("25"), texte(" est la VARIANCE "), latex("np(1-p)"), texte(" ; l'écart-type en est la racine carrée : "),
        latex("\\sigma=\\sqrt{25}=5"), texte(". Avec "), latex("\\sigma=25"), texte(", l'intervalle "), latex("[\\mu-2\\sigma;\\mu+2\\sigma]=[0\\,;100]"),
        texte(" couvrirait tout le support, un signal d'alerte immédiat."),
      ],
    },
    {
      enonce: [texte("Pour approcher "), latex("P(X\\leq55)"), texte(" quand "), latex("X\\sim\\mathcal{B}(100\\,;0{,}5)"), texte(" ("), latex("\\mu=50"), texte(", "), latex("\\sigma=5"), texte("), on standardise la borne corrigée "), latex("55{,}5"), texte(" : "), latex("z=\\dfrac{55{,}5-50}{5}=1{,}1"), texte(", puis on lit "), latex("\\Phi(1{,}1)\\approx0{,}8643"), texte(".")],
      reponse: true,
      justification: [texte("Correction de continuité : la barre de "), latex("k=55"), texte(" couvre "), latex("[54{,}5\\,;55{,}5]"), texte(", donc « "), latex("X\\leq55"), texte(" » devient « "), latex("x\\leq55{,}5"), texte(" ». La valeur exacte vaut "), latex("0{,}8644"), texte(" ; sans correction, "), latex("\\Phi(1)\\approx0{,}8413"), texte(" s'en écarte nettement.")],
    },
    {
      enonce: [texte("Avec les conditions retenues dans ce cours, "), latex("\\mathcal{B}(100\\,;0{,}2)"), texte(" peut s'approcher au choix par une loi normale ou par une loi de Poisson, puisque "), latex("n=100"), texte(" dépasse largement 30.")],
      reponse: false,
      justification: [latex("p=0{,}2"), texte(" ne vérifie ni "), latex("0{,}3<p<0{,}7"), texte(" (normale) ni "), latex("p\\leq0{,}1"), texte(" (Poisson) : selon les conventions du cours, on calcule avec la loi binomiale exacte.")],
    },
    {
      enonce: [texte("Avec les conditions retenues dans ce cours, l'approximation par une loi normale est permise pour "), latex("n=25"), texte(" et "), latex("p=0{,}5"), texte(", puisque "), latex("p=0{,}5"), texte(" est au centre de "), latex("]0{,}3\\,;0{,}7["), texte(".")],
      reponse: false,
      justification: [texte("La condition "), latex("n>30"), texte(" n'est pas vérifiée : les 2 conditions doivent être réunies en même temps.")],
    },
    {
      enonce: [
        texte("Pour "), latex("X"), texte(" uniformément répartie sur "), latex("[0\\,;60]"), texte(", "), latex("E(X)=\\dfrac{0+60}{2}=30"),
        texte(", "), latex("V(X)=\\dfrac{60^2}{12}=300"), texte(" et "), latex("\\sigma(X)=\\sqrt{300}\\approx17{,}32"), texte("."),
      ],
      reponse: true,
      justification: [texte("Formules de la loi uniforme continue sur "), latex("[a\\,;b]"), texte(" : "), latex("E(X)=\\tfrac{a+b}{2}"), texte(" (le milieu, la loi étant symétrique) et "), latex("V(X)=\\tfrac{(b-a)^2}{12}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une variable "),
        latex("X"),
        texte(" uniformément répartie sur "),
        latex("[0\\,;60]"),
        texte(", "),
        latex("V(X)=\\dfrac{b-a}{12}=\\dfrac{60}{12}=5"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est le CARRÉ de l'amplitude qui intervient : "), latex("V(X)=\\dfrac{(b-a)^2}{12}=\\dfrac{3600}{12}=300"),
        texte(". Avec "), latex("V=5"), texte(", l'écart-type vaudrait "), latex("\\sqrt5\\approx2{,}24"),
        texte(", absurdement petit pour une variable étalée sur 60 unités."),
      ],
    },
    {
      enonce: [
        texte("Pour une variable "),
        latex("X"),
        texte(" uniformément répartie sur "),
        latex("[0\\,;60]"),
        texte(", "),
        latex("P(X=30)=\\dfrac{1}{60}"),
        texte(", la valeur de la densité en ce point."),
      ],
      reponse: false,
      justification: [
        texte("La loi uniforme continue est une loi CONTINUE : "), latex("P(X=30)=0"), texte(", comme toute valeur isolée. "),
        latex("\\tfrac{1}{60}"), texte(" est la DENSITÉ, jamais une probabilité ponctuelle — elle ne devient une probabilité qu'une fois multipliée par la longueur d'un intervalle."),
      ],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(" ; "), latex("P(S)=0{,}22"), texte(". Les 3 probabilités a posteriori "), latex("\\dfrac{0{,}03}{0{,}22}"), texte(", "), latex("\\dfrac{0{,}09}{0{,}22}"), texte(" et "), latex("\\dfrac{0{,}10}{0{,}22}"), texte(" ont une somme égale à 1.")],
      reponse: true,
      justification: [texte("Les 3 numérateurs ont pour somme "), latex("P(S)"), texte(" elle-même ("), latex("0{,}03+0{,}09+0{,}10=0{,}22"), texte(") : un client sinistré appartient forcément à l'une des 3 catégories.")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(". La catégorie 2, la plus nombreuse, reste la plus probable une fois le sinistre observé.")],
      reponse: false,
      justification: [latex("P(C_2\\mid S)=\\dfrac{0{,}09}{0{,}22}"), texte(" et "), latex("P(C_3\\mid S)=\\dfrac{0{,}10}{0{,}22}"), texte(" : c'est la catégorie 3 qui devient la plus probable, son taux de sinistre compensant son poids plus faible.")],
    },
    {
      enonce: [texte("Dans une compagnie d'assurance, les catégories "), latex("C_1"), texte(", "), latex("C_2"), texte(", "), latex("C_3"), texte(" représentent "), latex("30\\,\\%"), texte(", "), latex("45\\,\\%"), texte(" et "), latex("25\\,\\%"), texte(" des clients, avec des probabilités de sinistre "), latex("P(S\\mid C_1)=0{,}1"), texte(", "), latex("P(S\\mid C_2)=0{,}2"), texte(" et "), latex("P(S\\mid C_3)=0{,}4"), texte(". Observer le sinistre fait passer la probabilité de la catégorie 3 de "), latex("0{,}25"), texte(" (a priori) à environ "), latex("0{,}4545"), texte(" (a posteriori), parce que son taux de sinistre est le plus élevé.")],
      reponse: true,
      justification: [texte("Un critère plus fréquent dans une catégorie augmente la probabilité de cette catégorie une fois le critère observé : c'est la mise à jour de Bayes.")],
    },
    {
      enonce: [
        texte("Pour 2 épreuves indépendantes de probabilités de succès "),
        latex("p_1=0{,}5"),
        texte(" et "),
        latex("p_2=0{,}3"),
        texte(", la probabilité de réussir AU MOINS une des deux vaut "),
        latex("1-(1-0{,}5)(1-0{,}3)=1-0{,}35=0{,}65"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("« Au moins une réussite » est le complément de « échouer les deux », dont la probabilité est le produit des 2 probabilités d'échec ("), latex("0{,}5\\times0{,}7=0{,}35"), texte(").")],
    },
    {
      enonce: [
        texte("Pour 2 épreuves indépendantes de probabilités de succès "),
        latex("p_1=0{,}5"),
        texte(" et "),
        latex("p_2=0{,}3"),
        texte(", réussir AU MOINS une des deux a pour probabilité "),
        latex("p_1+p_2=0{,}5+0{,}3=0{,}8"),
        texte(", les 2 réussites ne pouvant pas se produire ensemble."),
      ],
      reponse: false,
      justification: [
        texte("Les 2 épreuves étant indépendantes, elles peuvent parfaitement réussir TOUTES LES DEUX (avec probabilité "), latex("0{,}15"),
        texte(") : ce « OU » n'est pas exclusif, l'addition simple compte ce cas 2 fois. La bonne valeur est "),
        latex("0{,}5+0{,}3-0{,}15=0{,}65"), texte(", identique au complément "), latex("1-0{,}5\\times0{,}7"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=10"), texte(" répétitions indépendantes d'une épreuve de probabilité de succès "), latex("p=0{,}15"), texte(", sachant que "), latex("0{,}85^{10}\\approx0{,}197"), texte(", "), latex("P(\\text{au moins 1 succès})\\approx0{,}197"), texte(".")],
      reponse: false,
      justification: [latex("0{,}85^{10}\\approx0{,}197"), texte(" est la probabilité de n'avoir aucun succès ; « au moins 1 » en est le complément : "), latex("1-0{,}197\\approx0{,}803"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 5 — Loi de Poisson, ref 6gen53
  // Formule P(X=k)=e^{-λ}λᵏ/k!, calcul ITÉRATIF stable. 3 conditions d'approximation binomiale→
  // Poisson : n≥30, p≤0,1, np≤15, λ=np. Scénario λ=4 (n=50,p=0,08) : P(0)≈0,018316,
  // P(1)≈0,073263, P(X≤1)≈0,091579, P(X≥2)≈0,908421. « au plus k » toujours somme directe (jamais
  // complément, contrairement au binomial). Piège d'échelle : péage 5 voitures/min → λ=5×15=75 sur
  // 15 min (multiplicatif, temporel) ; 3 défectueux/1000 → λ=3×0,5=1,5 pour un lot de 500
  // (proportionnel, effectif). Propriété : E(X)=V(X)=λ.
  // ==========================================================================
  loiPoisson: [
    {
      enonce: [texte("La loi de Poisson de paramètre "), latex("\\lambda"), texte(" donne "), latex("P(X=k)=e^{-\\lambda}\\times\\dfrac{\\lambda^k}{k!}"), texte(" pour tout entier "), latex("k\\geq0"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même de la loi de Poisson.")],
    },
    {
      enonce: [
        texte("La loi de Poisson de paramètre "), latex("\\lambda"), texte(" donne plutôt "), latex("P(X=k)=\\lambda^k\\times\\dfrac{k!}{e^{-\\lambda}}"),
        texte(", en multipliant par "), latex("k!"), texte(" au lieu de diviser."),
      ],
      reponse: false,
      justification: [texte("La formule correcte divise par "), latex("k!"), texte(" ("), latex("P(X=k)=e^{-\\lambda}\\lambda^k/k!"), texte("), jamais ne multiplie par "), latex("k!"), texte(".")],
    },
    {
      enonce: [texte("Pour calculer "), latex("P(X=k)"), texte(" d'une loi de Poisson, on peut partir de "), latex("P(X=0)=e^{-\\lambda}"), texte(" et multiplier successivement par "), latex("\\dfrac{\\lambda}{1}"), texte(", "), latex("\\dfrac{\\lambda}{2}"), texte(", …, "), latex("\\dfrac{\\lambda}{k}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la relation "), latex("P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}"), texte(" : chaque terme se déduit du précédent, sans calculer "), latex("\\lambda^k"), texte(" ni "), latex("k!"), texte(" séparément.")],
    },
    {
      enonce: [texte("Pour une loi de Poisson, on passe de "), latex("P(X=k-1)"), texte(" à "), latex("P(X=k)"), texte(" en multipliant par "), latex("\\dfrac{k}{\\lambda}"), texte(".")],
      reponse: false,
      justification: [texte("C'est l'inverse : "), latex("\\dfrac{P(X=k)}{P(X=k-1)}=\\dfrac{\\lambda}{k}"), texte(" (le rapport des deux formules).")],
    },
    {
      enonce: [
        texte("Pour approximer une loi binomiale "), latex("\\mathcal{B}(n\\,;p)"), texte(" par une loi de Poisson, 3 conditions doivent être réunies : "),
        latex("n\\geq30"), texte(", "), latex("p\\leq0{,}1"), texte(" et "), latex("n\\times p\\leq15"), texte("."),
      ],
      reponse: true,
      justification: [texte("Ce sont les 3 conditions usuelles qui justifient l'approximation binomiale→Poisson, avec "), latex("\\lambda=n\\times p"), texte(".")],
    },
    {
      enonce: [
        texte("Pour approximer une loi binomiale "),
        latex("\\mathcal{B}(n\\,;p)"),
        texte(" par une loi de Poisson, il suffit d'une seule condition, "),
        latex("n\\times p\\leq15"),
        texte(", les 2 autres ("),
        latex("n\\geq30"),
        texte(" et "),
        latex("p\\leq0{,}1"),
        texte(") étant facultatives."),
      ],
      reponse: false,
      justification: [
        texte("Les 3 conditions doivent être réunies SIMULTANÉMENT — un "), latex("n\\times p"), texte(" faible avec un "), latex("n"),
        texte(" petit (ex. "), latex("n=20"), texte(") ne garantit pas la qualité de l'approximation, même si "), latex("n\\times p\\leq15"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("n=50"), texte(" et "), latex("p=0{,}08"), texte(", les 3 conditions d'approximation sont réunies ("),
        latex("n=50\\geq30"), texte(" ; "), latex("p=0{,}08\\leq0{,}1"), texte(" ; "), latex("np=4\\leq15"), texte("), et le paramètre de la loi de Poisson associée vaut "),
        latex("\\lambda=n\\times p=4"), texte("."),
      ],
      reponse: true,
      justification: [texte("Les 3 conditions sont vérifiées une à une, puis "), latex("\\lambda=np=50\\times0{,}08=4"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=20"), texte(" et "), latex("p=0{,}05"), texte(", les 3 conditions d'approximation sont réunies, car "),
        latex("np=1\\leq15"), texte(" est largement respecté."),
      ],
      reponse: false,
      justification: [
        texte("La condition "), latex("n\\geq30"), texte(" échoue ("), latex("n=20<30"), texte("), même si "), latex("np=1"), texte(" est très inférieur à "), latex("15"),
        texte(" — les 3 conditions doivent TOUTES être vérifiées, pas seulement la 3ᵉ."),
      ],
    },
    {
      enonce: [texte("Pour une loi de Poisson de paramètre "), latex("\\lambda=4"), texte(", "), latex("P(X=0)=e^{-4}\\approx0{,}018316"), texte(".")],
      reponse: true,
      justification: [texte("Application directe de la formule pour "), latex("k=0"), texte(" : "), latex("e^{-4}\\times\\dfrac{4^0}{0!}=e^{-4}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X=1)=e^{-4}\\times4\\approx0{,}073263"),
        texte(", soit exactement 4 fois "),
        latex("P(X=0)"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Le rapport "), latex("P(X=1)/P(X=0)=\\lambda/1=4"), texte(" — c'est exactement la relation itérative utilisée pour le calcul stable ("), latex("\\text{terme}_1=\\text{terme}_0\\times\\lambda/1"), texte(").")],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X=2)"),
        texte(" se calculerait en multipliant "),
        latex("P(X=1)"),
        texte(" par "),
        latex("\\lambda=4"),
        texte(", sans diviser par 2."),
      ],
      reponse: false,
      justification: [
        texte("La relation itérative correcte est "), latex("\\text{terme}_i=\\text{terme}_{i-1}\\times\\dfrac{\\lambda}{i}"),
        texte(" — pour passer de "), latex("P(X=1)"), texte(" à "), latex("P(X=2)"), texte(", il faut multiplier par "), latex("\\lambda/2=2"), texte(", pas par "), latex("\\lambda=4"), texte(" seul."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X\\leq1)=P(X=0)+P(X=1)\\approx0{,}018316+0{,}073263\\approx0{,}091578"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Somme directe des 2 premiers termes.")],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X\\geq2)"),
        texte(" peut se calculer par complément : "),
        latex("P(X\\geq2)=1-P(X\\leq1)\\approx1-0{,}091578=0{,}908422"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("« Au moins 2 » est exactement le complément de « au plus 1 ».")],
    },
    {
      enonce: [
        texte("Pour la loi de Poisson, contrairement à la loi binomiale, une question « au plus "), latex("k"),
        texte(" » se calcule TOUJOURS par une somme directe de 0 à "), latex("k"), texte(", jamais par un complément."),
      ],
      reponse: true,
      justification: [texte("La loi de Poisson a un support infini (pas de borne « "), latex("n"), texte(" » à côté de laquelle un complément court serait naturel), donc « au plus "), latex("k"), texte(" » reste toujours une somme directe, à la différence de la loi binomiale.")],
    },
    {
      enonce: [
        texte("Pour la loi de Poisson comme pour la loi binomiale, une question « au plus "), latex("k"),
        texte(" » se calcule toujours par complément lorsque "), latex("k"), texte(" est un petit nombre."),
      ],
      reponse: false,
      justification: [
        texte("Faux pour la loi de Poisson — son support étant infini, « au plus "), latex("k"),
        texte(" » y est TOUJOURS une somme directe de 0 à "), latex("k"), texte(", jamais un complément (contrairement à la loi binomiale, dont le support fini permet parfois cette stratégie)."),
      ],
    },
    {
      enonce: [
        texte("Un péage voit passer en moyenne 5 voitures par minute. Pour une durée de 15 minutes, le paramètre "), latex("\\lambda"),
        texte(" de la loi de Poisson correspondante vaut "), latex("\\lambda=5\\times15=75"), texte(" (ajustement MULTIPLICATIF pour un contexte temporel)."),
      ],
      reponse: true,
      justification: [texte("Le taux de base (par minute) doit être multiplié par la durée demandée (en minutes) pour obtenir "), latex("\\lambda"), texte(" sur cette durée.")],
    },
    {
      enonce: [
        texte("Pour un péage où passent en moyenne 5 voitures par minute, le paramètre "),
        latex("\\lambda"),
        texte(" pour une durée de 15 minutes resterait égal à "),
        latex("5"),
        texte(", le taux de base ne devant jamais être ajusté à l'échelle de la question posée."),
      ],
      reponse: false,
      justification: [
        texte("Faux — "), latex("\\lambda"), texte(" doit TOUJOURS être ajusté à l'échelle demandée (ici, multiplié par 15 minutes), jamais recopié tel quel comme taux de base : "),
        latex("\\lambda=75"), texte(", pas "), latex("5"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Un taux de 3 pièces défectueuses pour 1000 pièces produites, appliqué à un lot cible de 500 pièces, donne un paramètre "),
        latex("\\lambda=3\\times\\dfrac{500}{1000}=1{,}5"), texte(" (ajustement PROPORTIONNEL pour un contexte « effectif »)."),
      ],
      reponse: true,
      justification: [texte("Le facteur d'échelle est le rapport entre l'effectif cible et l'effectif de référence ("), latex("500/1000=0{,}5"), texte("), multiplié par le taux de base.")],
    },
    {
      enonce: [
        texte("Pour un taux de 3 pièces défectueuses pour 1000 pièces produites, appliqué à un lot cible de 500 pièces, le paramètre "),
        latex("\\lambda"),
        texte(" resterait égal à "),
        latex("3"),
        texte(", sans ajustement proportionnel à la taille du lot."),
      ],
      reponse: false,
      justification: [
        texte("Faux — il faut ajuster proportionnellement à la taille du lot cible par rapport à l'effectif de référence ("),
        latex("\\lambda=3\\times0{,}5=1{,}5"), texte("), jamais recopier le taux de base tel quel."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "), latex("\\lambda"), texte(", l'espérance et la variance sont TOUTES LES DEUX égales à "),
        latex("\\lambda"), texte(" : "), latex("E(X)=V(X)=\\lambda"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est une propriété caractéristique de la loi de Poisson — contrairement à la plupart des lois, son espérance et sa variance coïncident exactement.")],
    },
    {
      enonce: [
        texte("Pour "), latex("\\lambda=4"), texte(", "), latex("P(X=2)=e^{-4}\\times\\dfrac{4^2}{2!}\\approx0{,}146525"),
        texte(", soit "), latex("P(X=1)"), texte(" multiplié par "), latex("\\dfrac{\\lambda}{2}=2"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Le rapport "), latex("P(X=2)/P(X=1)=\\lambda/2=2"), texte(" : la relation itérative "),
        latex("\\text{terme}_i=\\text{terme}_{i-1}\\times\\tfrac{\\lambda}{i}"), texte(" redonne exactement le calcul direct "),
        latex("e^{-4}\\times\\tfrac{16}{2}=8\\,e^{-4}\\approx0{,}146525"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X=3)"),
        texte(" est strictement supérieure à "),
        latex("P(X=4)"),
        texte(", la loi décroissant toujours au-delà de son maximum."),
      ],
      reponse: false,
      justification: [
        latex("P(X=3)=P(X=4)\\approx0{,}195367"), texte(" : pour un "), latex("\\lambda"), texte(" ENTIER, le facteur itératif "),
        latex("\\tfrac{\\lambda}{i}"), texte(" vaut exactement 1 en "), latex("i=\\lambda=4"), texte(", donc les 2 termes sont rigoureusement égaux (la loi admet ici 2 maximums)."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X\\leq2)\\approx0{,}238103"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Somme directe des 3 premiers termes, calculée avec les valeurs non arrondies — « au plus 2 » se calcule toujours ainsi pour une loi de Poisson.")],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", "),
        latex("P(X=10)=0"),
        texte(", la valeur 10 dépassant largement "),
        latex("\\lambda=4"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le support de la loi de Poisson est INFINI : "), latex("P(X=k)>0"), texte(" pour TOUT entier "), latex("k\\geq0"),
        texte(", aussi grand soit-il. Ici "), latex("P(X=10)=e^{-4}\\times\\tfrac{4^{10}}{10!}\\approx0{,}00529"), texte(" — faible, mais jamais nulle."),
      ],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", l'écart-type vaut "),
        latex("\\sigma(X)=\\sqrt{V(X)}=\\sqrt{4}=2"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Puisque "), latex("V(X)=\\lambda=4"), texte(" pour une loi de Poisson, "), latex("\\sigma(X)=\\sqrt{\\lambda}=2"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une loi de Poisson de paramètre "),
        latex("\\lambda=4"),
        texte(", l'écart-type vaut aussi "),
        latex("\\lambda=4"),
        texte(", puisque "),
        latex("E(X)=V(X)=\\lambda"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Seules l'espérance et la VARIANCE valent "), latex("\\lambda=4"), texte(" ; l'écart-type reste la racine carrée de la variance : "),
        latex("\\sigma(X)=\\sqrt{\\lambda}=2"), texte(", jamais "), latex("\\lambda"), texte(" lui-même."),
      ],
    },
    {
      enonce: [
        texte("Pour toute loi de Poisson, "), latex("P(X=0)=e^{-\\lambda}"), texte(" (car "), latex("\\lambda^0=1"), texte(" et "),
        latex("0!=1"), texte("), donc "), latex("P(X\\geq1)=1-e^{-\\lambda}"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le terme "), latex("k=0"), texte(" se réduit à "), latex("e^{-\\lambda}"), texte(", et « au moins 1 » est exactement le complément de « aucun ».")],
    },
    {
      enonce: [
        texte("Pour "), latex("\\lambda=4"), texte(", "), latex("P(X\\geq1)=1-P(X=1)\\approx1-0{,}073263=0{,}926737"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le contraire de « au moins 1 » est « aucun » ("), latex("X=0"), texte("), jamais « exactement 1 » : "),
        latex("P(X\\geq1)=1-e^{-4}\\approx1-0{,}018316=0{,}981684"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=50"), texte(" et "), latex("p=0{,}08"), texte(" ("), latex("\\lambda=4"), texte("), sachant que "), latex("0{,}92^{50}\\approx0{,}0155"), texte(" et "), latex("e^{-4}\\approx0{,}0183"), texte(", la valeur binomiale exacte de "), latex("P(X=0)"), texte(" diffère de sa valeur approchée par la loi de Poisson.")],
      reponse: true,
      justification: [texte("Une approximation reste une approximation : les 3 conditions garantissent seulement que l'écart reste petit, jamais qu'il est nul.")],
    },
    {
      enonce: [
        texte("Pour approximer "),
        latex("\\mathcal{B}(n\\,;p)"),
        texte(" par une loi de Poisson, le paramètre vaut "),
        latex("\\lambda=\\dfrac{n}{p}"),
        texte(" — pour "),
        latex("n=50"),
        texte(" et "),
        latex("p=0{,}08"),
        texte(", "),
        latex("\\dfrac{50}{0{,}08}=625"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le paramètre est "), latex("\\lambda=n\\times p=50\\times0{,}08=4"), texte(", l'espérance de la binomiale de départ. Un "),
        latex("\\lambda=625"), texte(" annoncerait 625 succès moyens sur 50 épreuves seulement, ce qui est absurde."),
      ],
    },
    {
      enonce: [
        texte("Un péage voit passer en moyenne 5 voitures par minute ; sur une durée de 30 secondes, "), latex("\\lambda"),
        texte(" reste égal à 5, un paramètre de Poisson devant toujours être entier."),
      ],
      reponse: false,
      justification: [
        texte("Double erreur : "), latex("\\lambda"), texte(" doit être ajusté à l'échelle demandée ("), latex("\\lambda=5\\times0{,}5=2{,}5"),
        texte(" pour une demi-minute), et rien n'oblige "), latex("\\lambda"), texte(" à être entier — c'est un nombre MOYEN d'événements, parfaitement décimal."),
      ],
    },
    {
      enonce: [
        texte("Un taux de 3 pièces défectueuses pour 1000 pièces produites, appliqué à un lot de 2000 pièces, donne "),
        latex("\\lambda=3\\times\\dfrac{2000}{1000}=6"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le facteur d'échelle est le rapport des effectifs ("), latex("2000/1000=2"), texte("), multiplié par le taux de base — un lot 2 fois plus grand attend en moyenne 2 fois plus de défauts.")],
    },
    {
      enonce: [
        texte("Pour un taux de 3 pièces défectueuses pour 1000 pièces produites, appliqué à un lot de 2000 pièces, "),
        latex("\\lambda=\\dfrac{3}{2}=1{,}5"),
        texte(", en divisant le taux de base par le facteur d'échelle."),
      ],
      reponse: false,
      justification: [
        texte("On MULTIPLIE par le facteur d'échelle ("), latex("\\lambda=3\\times2=6"),
        texte("), jamais on ne divise : diviser reviendrait à annoncer MOINS de défauts sur un lot 2 fois PLUS grand."),
      ],
    },
    {
      enonce: [texte("La loi de Poisson suppose que les événements comptés dépendent les uns des autres.")],
      reponse: false,
      justification: [texte("C'est l'inverse : elle compte des événements indépendants, qui arrivent à un taux moyen constant sur un intervalle de temps ou un effectif (pas forcément rares : 75 voitures en 15 minutes).")],
    },
    {
      enonce: [
        texte("Pour un péage où passent en moyenne 5 voitures par minute, observé sur 15 minutes ("),
        latex("\\lambda=75"),
        texte("), la variance vaut "),
        latex("V(X)=\\sqrt{75}\\approx8{,}66"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("V(X)=\\lambda=75"), texte(" ; c'est l'ÉCART-TYPE qui vaut "), latex("\\sqrt{75}\\approx8{,}66"),
        texte(" — la propriété caractéristique de la loi de Poisson porte sur la variance, jamais sur l'écart-type."),
      ],
    },
  ],
  // ==========================================================================
  // Thème 6 — Densité, discrète ou continue, loi uniforme continue (cours § 3 à § 5)
  // Scénarios : densité f(t) = t/2 sur [0 ; 2] ; X uniforme sur [0 ; 60], sur [10 ; 30] ;
  // bus toutes les 20 minutes (uniforme sur [0 ; 20]) ; E = 8, V = 3 → [5 ; 11].
  // ==========================================================================
  densiteUniformeContinue: [
    {
      enonce: [texte("Une variable aléatoire continue peut prendre toutes les valeurs réelles d'un intervalle.")],
      reponse: true,
      justification: [texte("C'est sa définition : par exemple un temps d'attente, une masse, un angle.")],
    },
    {
      enonce: [texte("Le nombre de clients servis à un guichet en une heure est une variable aléatoire continue.")],
      reponse: false,
      justification: [texte("On compte des clients : les valeurs "), latex("0"), texte(", "), latex("1"), texte(", "), latex("2"), texte(", … se numérotent, la variable est discrète.")],
    },
    {
      enonce: [texte("La masse d'un sachet de sucre pris au hasard est une variable aléatoire continue.")],
      reponse: true,
      justification: [texte("C'est une mesure, qui peut prendre toutes les valeurs d'un intervalle.")],
    },
    {
      enonce: [texte("Une variable qui peut prendre une infinité de valeurs est forcément continue.")],
      reponse: false,
      justification: [texte("Le nombre d'appels reçus en une heure ("), latex("0"), texte(", "), latex("1"), texte(", "), latex("2"), texte(", …, sans maximum) prend une infinité de valeurs, mais on peut les numéroter : il est discret.")],
    },
    {
      enonce: [texte("Pour une variable aléatoire continue "), latex("X"), texte(", "), latex("P(X=a)=0"), texte(" pour tout réel "), latex("a"), texte(".")],
      reponse: true,
      justification: [texte("Une valeur isolée correspond à une aire nulle sous la courbe de densité.")],
    },
    {
      enonce: [texte("Pour une variable aléatoire continue, "), latex("P(2\\leq X\\leq5)"), texte(" est strictement plus grande que "), latex("P(2<X<5)"), texte(".")],
      reponse: false,
      justification: [texte("Les bornes ne pèsent rien ("), latex("P(X=2)=P(X=5)=0"), texte(") : les deux probabilités sont égales.")],
    },
    {
      enonce: [texte("Une densité de probabilité "), latex("f"), texte(" sur "), latex("[u\\,;v]"), texte(" est positive et vérifie "), latex("\\displaystyle\\int_u^v f(t)\\,dt=1"), texte(".")],
      reponse: true,
      justification: [texte("Ce sont les deux conditions d'une densité : aucune valeur négative, et une aire totale égale à 1.")],
    },
    {
      enonce: [texte("Une densité de probabilité ne peut jamais dépasser 1.")],
      reponse: false,
      justification: [texte("Seule son aire totale vaut 1 : la densité de la loi uniforme sur "), latex("[0\\,;0{,}5]"), texte(" vaut "), latex("2"), texte(" partout.")],
    },
    {
      enonce: [texte("Si "), latex("f(t)=kt"), texte(" est une densité sur "), latex("[0\\,;2]"), texte(", alors "), latex("k=\\dfrac{1}{2}"), texte(".")],
      reponse: true,
      justification: [latex("\\displaystyle\\int_0^2 kt\\,dt=2k=1"), texte(", donc "), latex("k=\\dfrac{1}{2}"), texte(".")],
    },
    {
      enonce: [texte("Pour une variable continue de densité "), latex("f"), texte(", la valeur "), latex("f(3)"), texte(" est la probabilité que "), latex("X"), texte(" vaille 3.")],
      reponse: false,
      justification: [latex("P(X=3)=0"), texte(" ; "), latex("f(3)"), texte(" est une valeur de densité, qui ne donne une probabilité qu'en calculant une aire.")],
    },
    {
      enonce: [texte("Pour une variable continue de densité "), latex("f"), texte(" sur "), latex("[u\\,;v]"), texte(", "), latex("P(a\\leq X\\leq b)=\\displaystyle\\int_a^b f(t)\\,dt"), texte(" pour "), latex("[a\\,;b]"), texte(" contenu dans "), latex("[u\\,;v]"), texte(".")],
      reponse: true,
      justification: [texte("La probabilité d'un intervalle est l'aire sous la courbe de densité entre "), latex("a"), texte(" et "), latex("b"), texte(".")],
    },
    {
      enonce: [texte("Pour une variable continue, "), latex("P(a\\leq X\\leq b)=f(b)-f(a)"), texte(".")],
      reponse: false,
      justification: [texte("C'est avec la fonction de répartition : "), latex("P(a\\leq X\\leq b)=F(b)-F(a)"), texte(", jamais avec la densité.")],
    },
    {
      enonce: [texte("La fonction de répartition "), latex("F"), texte(" d'une variable continue est croissante et va de 0 à 1.")],
      reponse: true,
      justification: [latex("F(x)=P(X\\leq x)"), texte(" cumule les probabilités : elle ne peut que croître, de 0 avant "), latex("u"), texte(" à 1 après "), latex("v"), texte(".")],
    },
    {
      enonce: [texte("Pour une variable continue, la densité est la dérivée de la fonction de répartition : "), latex("F'=f"), texte(".")],
      reponse: true,
      justification: [latex("F(x)=\\displaystyle\\int_u^x f(t)\\,dt"), texte(", donc "), latex("F'=f"), texte(" là où "), latex("F"), texte(" est dérivable.")],
    },
    {
      enonce: [texte("La fonction "), latex("G(x)=\\dfrac{x(3-x)}{2}"), texte(" sur "), latex("[0\\,;2]"), texte(" est une fonction de répartition, puisque "), latex("G(0)=0"), texte(" et "), latex("G(2)=1"), texte(".")],
      reponse: false,
      justification: [latex("G"), texte(" décroît après "), latex("1{,}5"), texte(" ("), latex("G'(x)=\\dfrac{3-2x}{2}<0"), texte(") : une fonction de répartition est toujours croissante.")],
    },
    {
      enonce: [texte("Le graphique de la fonction de répartition d'une variable continue est un escalier.")],
      reponse: false,
      justification: [texte("L'escalier est propre aux variables discrètes ; en continu, "), latex("F"), texte(" est une courbe continue.")],
    },
    {
      enonce: [texte("L'espérance d'une variable continue de densité "), latex("f"), texte(" sur "), latex("[u\\,;v]"), texte(" vaut "), latex("E(X)=\\displaystyle\\int_u^v t\\,f(t)\\,dt"), texte(".")],
      reponse: true,
      justification: [texte("C'est la somme pondérée "), latex("\\sum x_iP(X=x_i)"), texte(" du cas discret, où la somme devient une intégrale.")],
    },
    {
      enonce: [texte("Pour une variable continue, "), latex("E(X)=\\displaystyle\\int_u^v f(t)\\,dt"), texte(".")],
      reponse: false,
      justification: [texte("Cette intégrale vaut toujours 1 ; l'espérance pondère chaque valeur : "), latex("E(X)=\\displaystyle\\int_u^v t\\,f(t)\\,dt"), texte(".")],
    },
    {
      enonce: [texte("En discret on calcule les probabilités avec des sommes, en continu avec des intégrales.")],
      reponse: true,
      justification: [texte("Mêmes notions (loi, espérance, variance), deux outils.")],
    },
    {
      enonce: [texte("La variance d'une variable continue se calcule avec une somme pondérée "), latex("\\sum p_i\\,x_i^2-[E(X)]^2"), texte(".")],
      reponse: false,
      justification: [texte("En continu, la somme devient une intégrale : "), latex("V(X)=\\displaystyle\\int_u^v t^2 f(t)\\,dt-[E(X)]^2"), texte(".")],
    },
    {
      enonce: [texte("La densité de la loi uniforme continue sur "), latex("[a\\,;b]"), texte(" est constante, égale à "), latex("\\dfrac{1}{b-a}"), texte(".")],
      reponse: true,
      justification: [texte("Une densité constante d'aire totale 1 sur un intervalle de longueur "), latex("b-a"), texte(" vaut "), latex("\\dfrac{1}{b-a}"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[0\\,;60]"), texte(", "), latex("P(10\\leq X\\leq25)=\\dfrac{15}{60}=0{,}25"), texte(".")],
      reponse: true,
      justification: [texte("Pour une loi uniforme, la probabilité est le rapport des longueurs : "), latex("\\dfrac{25-10}{60}"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[0\\,;60]"), texte(", "), latex("P(10\\leq X\\leq25)"), texte(" est plus petite que "), latex("P(25\\leq X\\leq40)"), texte(", car le second intervalle est plus proche du centre.")],
      reponse: false,
      justification: [texte("Seule la longueur compte : les deux intervalles mesurent 15, les deux probabilités valent "), latex("0{,}25"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[0\\,;60]"), texte(", "), latex("E(X)=30"), texte(".")],
      reponse: true,
      justification: [latex("E(X)=\\dfrac{a+b}{2}=\\dfrac{0+60}{2}=30"), texte(", le milieu de l'intervalle.")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[0\\,;60]"), texte(", "), latex("V(X)=\\dfrac{60}{12}=5"), texte(".")],
      reponse: false,
      justification: [texte("La formule contient le carré : "), latex("V(X)=\\dfrac{(b-a)^2}{12}=\\dfrac{3\\,600}{12}=300"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[10\\,;30]"), texte(", alors "), latex("P(20\\leq X\\leq40)=\\dfrac{20}{20}=1"), texte(".")],
      reponse: false,
      justification: [texte("On coupe d'abord à "), latex("[10\\,;30]"), texte(" : "), latex("P(20\\leq X\\leq40)=P(20\\leq X\\leq30)=\\dfrac{10}{20}=0{,}5"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[10\\,;30]"), texte(", alors "), latex("E(X)=20"), texte(".")],
      reponse: true,
      justification: [latex("E(X)=\\dfrac{10+30}{2}=20"), texte(".")],
    },
    {
      enonce: [texte("Un bus passe toutes les 20 minutes et tu arrives au hasard : la probabilité d'attendre plus de 15 minutes vaut "), latex("0{,}25"), texte(".")],
      reponse: true,
      justification: [texte("Temps d'attente uniforme sur "), latex("[0\\,;20]"), texte(" : "), latex("P(X>15)=\\dfrac{20-15}{20}=0{,}25"), texte(".")],
    },
    {
      enonce: [texte("Un bus passe toutes les 20 minutes et tu arrives au hasard : ton temps d'attente moyen vaut 20 minutes.")],
      reponse: false,
      justification: [latex("E(X)=\\dfrac{0+20}{2}=10"), texte(" minutes : en moyenne, on attend la moitié de l'intervalle.")],
    },
    {
      enonce: [texte("Pour une loi uniforme continue sur "), latex("[a\\,;b]"), texte(", la longueur de l'intervalle vaut "), latex("b-a=12\\,V(X)"), texte(".")],
      reponse: false,
      justification: [latex("V(X)=\\dfrac{(b-a)^2}{12}"), texte(" donne "), latex("(b-a)^2=12\\,V(X)"), texte(", donc "), latex("b-a=\\sqrt{12\\,V(X)}"), texte(" : il manque la racine carrée.")],
    },
    {
      enonce: [texte("Une loi uniforme continue d'espérance 8 et de variance 3 est définie sur "), latex("[5\\,;11]"), texte(".")],
      reponse: true,
      justification: [latex("a+b=16"), texte(" et "), latex("b-a=\\sqrt{12\\times3}=6"), texte(", donc "), latex("a=5"), texte(" et "), latex("b=11"), texte(".")],
    },
    {
      enonce: [texte("Si "), latex("X"), texte(" suit la loi uniforme continue sur "), latex("[0\\,;60]"), texte(", "), latex("P(X=30)=\\dfrac{1}{60}"), texte(".")],
      reponse: false,
      justification: [latex("\\dfrac{1}{60}"), texte(" est la densité ; comme pour toute variable continue, "), latex("P(X=30)=0"), texte(".")],
    },
    {
      enonce: [texte("L'angle où s'arrête une roue de loterie lancée au hasard est souvent modélisé par une loi uniforme continue sur "), latex("[0\\,;360]"), texte(".")],
      reponse: true,
      justification: [texte("Aucun angle n'est privilégié : la densité est constante, égale à "), latex("\\dfrac{1}{360}"), texte(".")],
    },
    {
      enonce: [texte("Une note entière sur 20 est une variable aléatoire continue, puisqu'elle va de 0 à 20.")],
      reponse: false,
      justification: [texte("Elle ne prend que les 21 valeurs entières "), latex("0"), texte(", "), latex("1"), texte(", …, "), latex("20"), texte(" : elle est discrète.")],
    },
    {
      enonce: [texte("L'écart-type d'une variable continue est la racine carrée de sa variance, comme en discret.")],
      reponse: true,
      justification: [latex("\\sigma(X)=\\sqrt{V(X)}"), texte(" s'écrit de la même façon dans les deux cas.")],
    },
  ],
};
