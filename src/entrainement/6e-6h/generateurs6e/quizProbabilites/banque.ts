/**
 * Couche A — banque de contenu pour "Probabilités" (quiz vrai/faux), chapitre 8 du chantier 6e
 * (6h), ajout ultérieur (6gen69). 140 affirmations PRÉ-ÉCRITES (35 par thème, 4 thèmes), chacune
 * vérifiée mathématiquement à la rédaction (calculs directs, cohérence avec les générateurs déjà
 * établis du chapitre pour les formules/pièges classiques) — jamais générées procéduralement, voir
 * `core6e/quizProbabilites.types.ts`.
 *
 * Les 20 premières affirmations de chaque thème forment la banque d'origine (10 vraies/10 fausses).
 * Les 15 suivantes sont un enrichissement portant sur des nuances non couvertes par les 20
 * premières (lecture directe d'une conditionnelle dans un tableau à double entrée, effectifs
 * naturels du test médical — 90/270 contre 90/100 —, dépendance de Bayes à la fréquence de la
 * maladie, formule binomiale vs comptage hypergéométrique, dérangements pour n=3, dé truqué,
 * montage série/parallèle, etc.), chacune recalculée à la main et jamais une simple reformulation
 * d'une affirmation déjà présente dans les 20 premières. Répartition vrai/faux proche de 50/50 sur
 * les 35 (18/17 pour les thèmes 1-2, 19/16 pour les thèmes 3-4).
 *
 * Un thème par générateur déjà établi du chapitre 8 (6gen30 à 6gen33). `enonce`/`justification`
 * sont des `FragmentConsigne[]` (texte/LaTeX mêlés, jamais de `string` brute), même convention que
 * 6gen65/66/67/68. Notation reprise telle quelle des générateurs sources : `P(A\cap B)`/
 * `P(A\cup B)`/`\overline{A}` pour le complémentaire, `P(A|B)` pour le conditionnement,
 * `\dfrac{a}{b}` pour les fractions, `{,}` pour la virgule décimale À L'INTÉRIEUR d'un fragment
 * LaTeX uniquement (jamais dans un fragment texte brut — piège documenté dans la section 6gen33 de
 * `docs/historique-6e.md`).
 *
 * Chaque thème s'appuie sur un scénario numérique fixe principal (recalculé et revérifié à la main
 * ci-dessous), pour permettre des affirmations qui se répondent/se contredisent entre elles sans
 * réintroduire les mêmes chiffres à chaque question — même esprit qu'un contrôle papier classique
 * ("dans l'exercice ci-dessus..."). L'enrichissement en ajoute quelques-uns, eux aussi réutilisés
 * sur plusieurs affirmations consécutives et détaillés dans le bloc de commentaires de leur thème.
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizProbabilites } from "../../core6e/quizProbabilites.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const BANQUE_QUIZ_PROBABILITES: Record<VarianteQuizProbabilites, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Probabilités et ensembles, ref 6gen30
  // Scénario fixe : groupe de N=40 personnes, n(A)=18, n(B)=15, n(A∩B)=6.
  // P(A)=18/40=0,45 ; P(B)=15/40=0,375 ; P(A∩B)=6/40=0,15 ; P(A∪B)=27/40=0,675 ;
  // P(A∩B̄)=12/40=0,3 ; P(Ā∩B)=9/40=0,225 ; P(Ā∩B̄)=13/40=0,325 ;
  // P(A|B)=6/15=0,4 ; P(B|A)=6/18=1/3.
  // Puis un exemple cartes (cœur/figure) et un exemple 2 dés à 6 faces.
  // Enrichissement : P(A|B̄)=12/25=0,48 (≠ P(A|B)=0,4) ; P(Ā∪B̄)=1-P(A∩B)=34/40.
  //   École de musique (60 inscrits, 38 filles, guitare 28 dont 15 garçons) :
  //   piano 32, garçons piano 7, filles piano 25, filles guitare 13 ;
  //   P(garçon|guitare)=15/28≈0,54 ; P(guitare|garçon)=15/22≈0,68 ;
  //   P(fille)·P(guitare)=38/60·28/60≈0,296 ≠ P(fille∩guitare)=13/60≈0,217 (non indépendants).
  //   2 dés à 6 faces : P(somme=5)=4/36=1/9 ; P(somme=2)=1/36 ;
  //   « 1er dé=4 » et « 2e dé pair » indépendants (3/36=1/6·1/2) ;
  //   « somme=7 » et « 1er dé=4 » indépendants aussi (1/36=1/6·1/6), bien que compatibles.
  // ==========================================================================
  probabilitesEnsembles: [
    {
      enonce: [
        texte("Dans un groupe de 40 personnes, avec "),
        latex("n(A)=18"),
        texte(", "),
        latex("n(B)=15"),
        texte(" et "),
        latex("n(A\\cap B)=6"),
        texte(", on a "),
        latex("P(A\\cup B)=\\dfrac{27}{40}"),
        texte("."),
      ],
      reponse: true,
      justification: [
        texte("Par inclusion-exclusion : "),
        latex("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)=\\dfrac{18}{40}+\\dfrac{15}{40}-\\dfrac{6}{40}=\\dfrac{27}{40}"),
        texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec les mêmes effectifs, "),
        latex("P(A\\cup B)=P(A)+P(B)=\\dfrac{33}{40}"),
        texte(", en additionnant simplement les deux probabilités."),
      ],
      reponse: false,
      justification: [
        texte("Additionner sans retirer "),
        latex("P(A\\cap B)"),
        texte(" compte deux fois les personnes appartenant aux deux groupes : la vraie valeur est "),
        latex("\\dfrac{27}{40}"),
        texte(", pas "),
        latex("\\dfrac{33}{40}"),
        texte("."),
      ],
    },
    {
      enonce: [texte("Toujours dans ce groupe, "), latex("P(\\overline{A}\\cap\\overline{B})=\\dfrac{13}{40}"), texte(" (ni dans A, ni dans B).")],
      reponse: true,
      justification: [
        texte("On a "),
        latex("P(\\overline{A}\\cap\\overline{B})=1-P(A\\cup B)=1-\\dfrac{27}{40}=\\dfrac{13}{40}"),
        texte("."),
      ],
    },
    {
      enonce: [texte("La case \"ni A ni B\" du tableau à double entrée vaut "), latex("1-P(A)-P(B)=\\dfrac{7}{40}"), texte(".")],
      reponse: false,
      justification: [
        texte("Cette formule oublie que "), latex("A"), texte(" et "), latex("B"), texte(" se chevauchent : "),
        latex("1-P(A)-P(B)=\\dfrac{7}{40}"),
        texte(" n'est pas "),
        latex("P(\\overline{A}\\cap\\overline{B})"),
        texte(", qui vaut réellement "),
        latex("\\dfrac{13}{40}"),
        texte(" (voir affirmation précédente) — la formule correcte est "),
        latex("1-P(A\\cup B)"),
        texte("."),
      ],
    },
    {
      enonce: [latex("P(A\\cap\\overline{B})=\\dfrac{12}{40}=0{,}3"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("P(A\\cap\\overline{B})=P(A)-P(A\\cap B)=\\dfrac{18}{40}-\\dfrac{6}{40}=\\dfrac{12}{40}"), texte(".")],
    },
    {
      enonce: [texte("Dans ce même groupe, "), latex("P(\\overline{A}\\cap B)=P(A\\cap\\overline{B})"), texte(" : ce sont deux écritures du même événement.")],
      reponse: false,
      justification: [
        texte("Ce sont deux événements DIFFÉRENTS : "),
        latex("P(\\overline{A}\\cap B)=\\dfrac{9}{40}"),
        texte(" (dans B mais pas dans A) alors que "),
        latex("P(A\\cap\\overline{B})=\\dfrac{12}{40}"),
        texte(" (dans A mais pas dans B) — rien ne garantit qu'ils soient égaux."),
      ],
    },
    {
      enonce: [texte("Les événements "), latex("A\\cap\\overline{B}"), texte(" et "), latex("\\overline{A}\\cap B"), texte(" sont TOUJOURS incompatibles, quels que soient "), latex("A"), texte(" et "), latex("B"), texte(".")],
      reponse: true,
      justification: [
        texte("Un même élément ne peut pas à la fois appartenir à "), latex("A"), texte(" et ne pas appartenir à "), latex("A"),
        texte(" : les deux événements ne peuvent donc jamais se réaliser en même temps, quelle que soit la situation."),
      ],
    },
    {
      enonce: [texte("Ces deux mêmes événements ("), latex("A\\cap\\overline{B}"), texte(" et "), latex("\\overline{A}\\cap B"), texte(") sont donc aussi toujours INDÉPENDANTS, puisqu'ils sont incompatibles.")],
      reponse: false,
      justification: [
        texte("C'est l'inverse : deux événements incompatibles de probabilités non nulles ne sont JAMAIS indépendants — leur intersection est vide ("),
        latex("P=0"),
        texte("), alors que le produit de leurs probabilités individuelles ne l'est pas (ici "),
        latex("\\dfrac{12}{40}\\times\\dfrac{9}{40}\\neq0"),
        texte(") : incompatibilité et indépendance sont deux notions distinctes, jamais équivalentes."),
      ],
    },
    {
      enonce: [latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{6}{15}=0{,}4"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition de la probabilité conditionnelle : "), latex("\\dfrac{6/40}{15/40}=\\dfrac{6}{15}=0{,}4"), texte(".")],
    },
    {
      enonce: [latex("P(A|B)=P(B|A)"), texte(" car "), latex("P(A\\cap B)"), texte(" est le même dans les deux formules.")],
      reponse: false,
      justification: [
        texte("Le numérateur est le même mais pas le DÉNOMINATEUR : "), latex("P(A|B)=0{,}4"), texte(" divise par "), latex("P(B)"),
        texte(", alors que "), latex("P(B|A)=\\dfrac{6}{18}=\\dfrac{1}{3}"), texte(" divise par "), latex("P(A)"), texte(" — les deux valeurs diffèrent en général."),
      ],
    },
    {
      enonce: [latex("P(B|A)=\\dfrac{1}{3}"), texte(".")],
      reponse: true,
      justification: [texte("On a "), latex("P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}=\\dfrac{6}{18}=\\dfrac{1}{3}"), texte(".")],
    },
    {
      enonce: [texte("Dans ce groupe, "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants car "), latex("P(A\\cap B)=P(A)\\times P(B)"), texte(".")],
      reponse: false,
      justification: [
        texte("Le produit vaut "), latex("P(A)\\times P(B)=0{,}45\\times0{,}375=0{,}16875"), texte(", différent de "), latex("P(A\\cap B)=0{,}15"),
        texte(" : "), latex("A"), texte(" et "), latex("B"), texte(" ne sont donc PAS indépendants ici."),
      ],
    },
    {
      enonce: [
        texte("Pour vérifier si deux événements sont indépendants, il faut comparer NUMÉRIQUEMENT "),
        latex("P(A\\cap B)"),
        texte(" à "),
        latex("P(A)\\times P(B)"),
        texte(", jamais se fier à une simple impression intuitive."),
      ],
      reponse: true,
      justification: [texte("C'est la méthode correcte et systématique : l'indépendance ne se \"devine\" jamais, elle se vérifie par un calcul.")],
    },
    {
      enonce: [texte("Deux événements incompatibles, de probabilités non nulles toutes les deux, peuvent malgré tout être indépendants.")],
      reponse: false,
      justification: [
        texte("Si les événements sont incompatibles, "), latex("P(A\\cap B)=0"), texte(", alors que "), latex("P(A)\\times P(B)>0"),
        texte(" dès que les deux probabilités sont non nulles : l'égalité requise pour l'indépendance échoue toujours dans ce cas."),
      ],
    },
    {
      enonce: [
        texte("Avec un jeu de 52 cartes, "), latex("A"), texte(" = \"tirer un cœur\" et "), latex("B"), texte(" = \"tirer une figure (valet, dame ou roi)\" : "),
        latex("P(A\\cap B)=\\dfrac{3}{52}"), texte("."),
      ],
      reponse: true,
      justification: [texte("Il y a exactement 3 figures de cœur (valet, dame, roi de cœur) sur les 52 cartes.")],
    },
    {
      enonce: [texte("Avec ces mêmes événements, "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants, car "), latex("P(A)\\times P(B)=\\dfrac{13}{52}\\times\\dfrac{12}{52}=\\dfrac{3}{52}=P(A\\cap B)"), texte(".")],
      reponse: true,
      justification: [
        texte("Le calcul est exact : les figures étant réparties également entre les 4 familles (3 par famille), \"être un cœur\" n'influence pas \"être une figure\" — un résultat qui peut sembler surprenant mais que seul le calcul, jamais l'intuition, permet de confirmer."),
      ],
    },
    {
      enonce: [
        texte("Avec un dé à 6 faces lancé deux fois, les événements \"la somme vaut 7\" et \"le premier dé donne 4\" sont incompatibles."),
      ],
      reponse: false,
      justification: [
        texte("Ils sont au contraire compatibles : le couple "), latex("(4;3)"), texte(" réalise les deux événements à la fois (premier dé "),
        latex("=4"), texte(", somme "), latex("=7"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Avec un dé à 6 faces lancé deux fois (36 couples équiprobables), il y a exactement 6 couples dont la somme vaut 7."),
      ],
      reponse: true,
      justification: [
        texte("Ce sont les couples "), latex("(1;6),(2;5),(3;4),(4;3),(5;2),(6;1)"), texte(", soit "), latex("P(\\text{somme}=7)=\\dfrac{6}{36}=\\dfrac{1}{6}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("La probabilité que la somme des deux dés vaille 7 est "), latex("\\dfrac{3}{36}"),
        texte(" si on ne compte que les paires "), latex("\\{1;6\\},\\{2;5\\},\\{3;4\\}"), texte(" sans distinguer l'ordre des deux dés."),
      ],
      reponse: false,
      justification: [
        texte("Les 36 issues équiprobables d'un lancer de 2 dés sont des COUPLES ORDONNÉS (le premier dé, puis le second) — ignorer l'ordre reviendrait à traiter "),
        latex("(1;6)"), texte(" et "), latex("(6;1)"), texte(" comme une seule issue au lieu de deux, ce qui casse l'équiprobabilité. La bonne probabilité est "),
        latex("\\dfrac{6}{36}=\\dfrac{1}{6}"), texte(", pas "), latex("\\dfrac{3}{36}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans le tableau à double entrée du groupe de 40 personnes ("), latex("n(A)=18,\\ n(B)=15,\\ n(A\\cap B)=6"),
        texte("), la case \"ni A ni B\" contient 19 personnes."),
      ],
      reponse: false,
      justification: [
        texte("Les 4 cases valent "), latex("n(A\\cap B)=6"), texte(", "), latex("n(A\\cap\\overline{B})=12"), texte(", "),
        latex("n(\\overline{A}\\cap B)=9"), texte(", "), latex("n(\\overline{A}\\cap\\overline{B})=13"), texte(" (leur somme fait bien "),
        latex("40"), texte(") — la case \"ni A ni B\" vaut donc "), latex("13"), texte(", pas "), latex("19"), texte("."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [texte("Dans le tableau à double entrée de ce même groupe de 40 personnes, le total de la colonne "), latex("\\overline{B}"), texte(" vaut 25.")],
      reponse: true,
      justification: [
        texte("Ce total vaut "), latex("n(\\overline{B})=40-15=25"), texte(", ce que confirment ses deux cases : "),
        latex("n(A\\cap\\overline{B})+n(\\overline{A}\\cap\\overline{B})=12+13=25"), texte("."),
      ],
    },
    {
      enonce: [texte("Toujours dans ce groupe, "), latex("P(A|\\overline{B})=\\dfrac{12}{25}=0{,}48"), texte(".")],
      reponse: true,
      justification: [
        texte("On se restreint aux 25 personnes hors de "), latex("B"), texte(" ; 12 d'entre elles sont dans "), latex("A"), texte(" : "),
        latex("P(A|\\overline{B})=\\dfrac{P(A\\cap\\overline{B})}{P(\\overline{B})}=\\dfrac{12/40}{25/40}=\\dfrac{12}{25}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans ce groupe, "), latex("P(A|B)"), texte(" et "), latex("P(A|\\overline{B})"),
        texte(" sont nécessairement égales, puisque "), latex("A"), texte(" garde la même probabilité globale dans les deux cas."),
      ],
      reponse: false,
      justification: [
        texte("Elles diffèrent ici : "), latex("P(A|B)=\\dfrac{6}{15}=0{,}4"), texte(" contre "), latex("P(A|\\overline{B})=\\dfrac{12}{25}=0{,}48"),
        texte(" — conditionner par "), latex("B"), texte(" ou par "), latex("\\overline{B}"),
        texte(" ne donne pas le même sous-groupe de référence, et la probabilité globale de "), latex("A"), texte(" n'impose rien à ces deux valeurs."),
      ],
    },
    {
      enonce: [
        texte("Dans ce tableau, "), latex("P(A|B)"),
        texte(" se lit directement en se restreignant à la SEULE colonne "), latex("B"),
        texte(" : c'est l'effectif de la case "), latex("A\\cap B"), texte(" divisé par le total de cette colonne, soit "), latex("\\dfrac{6}{15}"),
        texte(", sans repasser par la formule "), latex("\\dfrac{P(A\\cap B)}{P(B)}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Diviser le numérateur et le dénominateur par le même total "), latex("N=40"),
        texte(" ne change pas le quotient : la lecture directe sur la colonne donne exactement la même valeur que la formule."),
      ],
    },
    {
      enonce: [
        texte("Dans ce tableau, "), latex("P(A|B)"), texte(" s'obtient en divisant l'effectif de la case "), latex("A\\cap B"),
        texte(" par le TOTAL GÉNÉRAL du tableau, soit "), latex("\\dfrac{6}{40}=0{,}15"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Diviser par le total général donne la probabilité JOINTE "), latex("P(A\\cap B)=\\dfrac{6}{40}"),
        texte(", pas la conditionnelle : "), latex("P(A|B)"), texte(" divise par le total de la seule colonne "), latex("B"), texte(", soit "),
        latex("\\dfrac{6}{15}=0{,}4"), texte(" — confondre les deux est l'erreur classique du tableau à double entrée."),
      ],
    },
    {
      enonce: [
        texte("Une école de musique compte 60 inscrits, dont 38 filles ; chaque élève suit un seul instrument et le cours de guitare compte 28 élèves, dont 15 garçons. Alors "),
        latex("P(\\text{garçon}|\\text{guitare})=\\dfrac{15}{28}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("On se restreint à la colonne \"guitare\" (28 élèves), dont 15 sont des garçons : "), latex("\\dfrac{15}{28}\\approx0{,}54"), texte("."),
      ],
    },
    {
      enonce: [texte("Dans cette même école, "), latex("P(\\text{guitare}|\\text{garçon})=\\dfrac{15}{28}"), texte(" également.")],
      reponse: false,
      justification: [
        texte("Le sens du conditionnement change le dénominateur : l'école compte "), latex("60-38=22"), texte(" garçons, donc "),
        latex("P(\\text{guitare}|\\text{garçon})=\\dfrac{15}{22}\\approx0{,}68"), texte(", pas "), latex("\\dfrac{15}{28}\\approx0{,}54"), texte("."),
      ],
    },
    {
      enonce: [texte("Dans cette école, le nombre de filles inscrites au piano est 25.")],
      reponse: true,
      justification: [
        texte("Le cours de piano compte "), latex("60-28=32"), texte(" élèves, dont "), latex("22-15=7"),
        texte(" garçons : il reste "), latex("32-7=25"), texte(" filles (vérification par l'autre chemin : "), latex("38-(28-15)=38-13=25"), texte(")."),
      ],
    },
    {
      enonce: [texte("Dans cette école, \"être une fille\" et \"étudier la guitare\" sont deux événements indépendants.")],
      reponse: false,
      justification: [
        texte("Le test numérique échoue : "), latex("P(\\text{fille})\\times P(\\text{guitare})=\\dfrac{38}{60}\\times\\dfrac{28}{60}\\approx0{,}296"),
        texte(", alors que "), latex("P(\\text{fille}\\cap\\text{guitare})=\\dfrac{13}{60}\\approx0{,}217"), texte(" — les deux valeurs diffèrent, il n'y a pas indépendance."),
      ],
    },
    {
      enonce: [
        texte("Avec 2 dés à 6 faces représentés par les 36 points d'un diagramme cartésien, exactement 4 points ont une somme égale à 5, donc "),
        latex("P(\\text{somme}=5)=\\dfrac{4}{36}=\\dfrac{1}{9}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Ces 4 points sont "), latex("(1;4),(2;3),(3;2),(4;1)"), texte(" ; chacun des 36 points de la grille est une issue équiprobable."),
      ],
    },
    {
      enonce: [texte("Avec 2 dés à 6 faces, "), latex("P(\\text{somme}=2)=P(\\text{somme}=7)"), texte(", puisque toutes les issues sont équiprobables.")],
      reponse: false,
      justification: [
        texte("Ce sont les 36 COUPLES qui sont équiprobables, jamais les 11 sommes possibles : "), latex("P(\\text{somme}=2)=\\dfrac{1}{36}"),
        texte(" (le seul couple "), latex("(1;1)"), texte(") contre "), latex("P(\\text{somme}=7)=\\dfrac{6}{36}"), texte("."),
      ],
    },
    {
      enonce: [texte("Avec 2 dés à 6 faces, les événements \"le premier dé donne 4\" et \"le second dé donne un nombre pair\" sont indépendants.")],
      reponse: true,
      justification: [
        latex("P=\\dfrac{6}{36}=\\dfrac{1}{6}"), texte(" pour le premier, "), latex("\\dfrac{18}{36}=\\dfrac{1}{2}"), texte(" pour le second, et leur intersection compte 3 couples : "),
        latex("\\dfrac{3}{36}=\\dfrac{1}{12}=\\dfrac{1}{6}\\times\\dfrac{1}{2}"), texte(" — le critère d'indépendance est exactement vérifié."),
      ],
    },
    {
      enonce: [
        texte("Avec 2 dés à 6 faces, les événements \"la somme vaut 7\" et \"le premier dé donne 4\" ne sont pas indépendants, puisqu'ils sont compatibles."),
      ],
      reponse: false,
      justification: [
        texte("Être compatibles n'empêche jamais d'être indépendants, et le calcul le confirme ici : "),
        latex("P(\\text{somme}=7)\\times P(1^{\\text{er}}=4)=\\dfrac{1}{6}\\times\\dfrac{1}{6}=\\dfrac{1}{36}"),
        texte(", exactement la probabilité de l'unique couple "), latex("(4;3)"), texte(" réalisant les deux — ces deux événements SONT indépendants."),
      ],
    },
    {
      enonce: [texte("Dans le groupe de 40 personnes, "), latex("P(\\overline{A}\\cup\\overline{B})=\\dfrac{34}{40}"), texte(".")],
      reponse: true,
      justification: [
        texte("L'événement \"pas dans "), latex("A"), texte(" ou pas dans "), latex("B"), texte("\" est le contraire de \"dans les deux\" : "),
        latex("P(\\overline{A}\\cup\\overline{B})=1-P(A\\cap B)=1-\\dfrac{6}{40}=\\dfrac{34}{40}"), texte("."),
      ],
    },
    {
      enonce: [texte("L'événement "), latex("\\overline{A}\\cup\\overline{B}"), texte(" est le complémentaire de "), latex("A\\cup B"), texte(".")],
      reponse: false,
      justification: [
        texte("Le complémentaire de "), latex("A\\cup B"), texte(" est "), latex("\\overline{A}\\cap\\overline{B}"), texte(" (une INTERSECTION), qui vaut ici "),
        latex("\\dfrac{13}{40}"), texte(" ; "), latex("\\overline{A}\\cup\\overline{B}"), texte(" est, lui, le complémentaire de "), latex("A\\cap B"), texte(" et vaut "),
        latex("\\dfrac{34}{40}"), texte("."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 2 — Tirages, arbres et dénombrement, ref 6gen31
  // Scénario fixe : urne à 5 boules rouges, 3 boules bleues (8 boules), 2 tirages successifs.
  // Avec remise : P(RR)=25/64 ; P(exactement 1 rouge)=15/32.
  // Sans remise : P(RR)=5/14 ; P(RB)=P(BR)=15/56 ; P(BB)=6/56=3/28 ;
  //   P(exactement 1 rouge)=15/28 ; P(au moins 1 rouge)=25/28.
  // Puis 4 lettres/4 enveloppes : 4!=24, D(4)=9, D(2)=1.
  // Enrichissement, 3 tirages dans la même urne : sans remise P(RRR)=5/8·4/7·3/6=5/28≈0,179 ;
  //   avec remise (5/8)³=125/512≈0,244 ; avec remise P(exactement 1 rouge)=3·(5/8)·(3/8)²=135/512
  //   ≈0,264 ; sans remise P(exactement 1 rouge)=C(5,1)·C(3,2)/C(8,3)=15/56≈0,268 (JAMAIS la
  //   formule binomiale) ; P(4 bleues sur 4 tirages sans remise)=0 (3 bleues seulement).
  //   4 lettres : P(lettre 1 bien placée)=3!/4!=1/4 ; P(lettres 1 et 2 bien placées)=2!/4!=1/12.
  //   3 lettres : D(3)=2, P(aucune)=2/6=1/3, P(exactement une)=3/6=1/2.
  //   Dé truqué « special » : P(6)=1/2 et 5 faces à p → 1/2+5p=1, p=1/10, P(6 ou 1)=3/5.
  //   Dé truqué « parité » : p=2q et 3p+3q=1 → q=1/9, p=2/9, P(pair)=3p=2/3.
  // ==========================================================================
  tiragesArbres: [
    {
      enonce: [
        texte("Une urne contient 5 boules rouges et 3 boules bleues (8 au total). On tire 2 boules successivement, AVEC remise. "),
        latex("P(\\text{2 rouges})=\\dfrac{25}{64}"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Avec remise, les 2 tirages sont indépendants : "), latex("P=\\left(\\dfrac{5}{8}\\right)^2=\\dfrac{25}{64}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour ces mêmes 2 tirages mais SANS remise cette fois, "), latex("P(\\text{2 rouges})=\\dfrac{25}{64}"), texte(" également, car la probabilité ne change pas au second tirage."),
      ],
      reponse: false,
      justification: [
        texte("Sans remise, la composition de l'urne change après le premier tirage : "), latex("P(\\text{2 rouges})=\\dfrac{5}{8}\\times\\dfrac{4}{7}=\\dfrac{5}{14}"),
        texte(", différent de "), latex("\\dfrac{25}{64}"), texte("."),
      ],
    },
    {
      enonce: [texte("Sans remise, "), latex("P(\\text{2 rouges})=\\dfrac{5}{14}"), texte(".")],
      reponse: true,
      justification: [latex("\\dfrac{5}{8}\\times\\dfrac{4}{7}=\\dfrac{20}{56}=\\dfrac{5}{14}"), texte(".")],
    },
    {
      enonce: [
        texte("Sans remise, si la première boule tirée est rouge, la probabilité que la seconde le soit aussi devient "), latex("\\dfrac{4}{7}"),
        texte(" (et non plus "), latex("\\dfrac{5}{8}"), texte(")."),
      ],
      reponse: true,
      justification: [texte("Une boule rouge a été retirée : il reste 7 boules dont 4 rouges, donc "), latex("\\dfrac{4}{7}"), texte(".")],
    },
    {
      enonce: [
        texte("Avec remise, si la première boule tirée est rouge, la probabilité que la seconde le soit aussi reste "), latex("\\dfrac{5}{8}"),
        texte(" seulement si les boules rouges sont majoritaires dans l'urne — sinon elle change."),
      ],
      reponse: false,
      justification: [
        texte("Avec remise, l'urne retrouve TOUJOURS sa composition initiale avant le second tirage, quelle que soit la couleur majoritaire : la probabilité du second tirage reste "),
        latex("\\dfrac{5}{8}"), texte(" dans tous les cas, jamais conditionnée à une quelconque majorité."),
      ],
    },
    {
      enonce: [texte("Avec remise, les 2 tirages sont indépendants, donc "), latex("P(\\text{2 rouges})=P(\\text{rouge})^2"), texte(" directement.")],
      reponse: true,
      justification: [texte("C'est la définition même de l'indépendance appliquée à un tirage avec remise.")],
    },
    {
      enonce: [
        texte("Sans remise, les 2 tirages restent indépendants, puisque l'urne contient toujours au moins une boule de chaque couleur après le premier tirage."),
      ],
      reponse: false,
      justification: [
        texte("Sans remise, les tirages ne sont JAMAIS indépendants : la composition de l'urne change après le premier tirage, ce qui modifie les probabilités du second, que l'urne contienne encore les deux couleurs ou non."),
      ],
    },
    {
      enonce: [texte("Sans remise, "), latex("P(\\text{exactement une rouge sur les 2 tirages})=\\dfrac{15}{28}"), texte(".")],
      reponse: true,
      justification: [
        texte("Deux chemins de l'arbre mènent à ce résultat : "), latex("P(RB)+P(BR)=\\dfrac{5}{8}\\times\\dfrac{3}{7}+\\dfrac{3}{8}\\times\\dfrac{5}{7}=\\dfrac{15}{56}+\\dfrac{15}{56}=\\dfrac{30}{56}=\\dfrac{15}{28}"),
        texte("."),
      ],
    },
    {
      enonce: [texte("Avec remise, "), latex("P(\\text{exactement une rouge sur les 2 tirages})=\\dfrac{15}{28}"), texte(" aussi.")],
      reponse: false,
      justification: [
        texte("Avec remise, "), latex("P(\\text{exactement une rouge})=2\\times\\dfrac{5}{8}\\times\\dfrac{3}{8}=\\dfrac{30}{64}=\\dfrac{15}{32}"),
        texte(", différent de "), latex("\\dfrac{15}{28}"), texte(" (valable seulement sans remise)."),
      ],
    },
    {
      enonce: [texte("Avec remise, "), latex("P(\\text{exactement une rouge sur les 2 tirages})=\\dfrac{15}{32}"), texte(".")],
      reponse: true,
      justification: [latex("2\\times\\dfrac{5}{8}\\times\\dfrac{3}{8}=\\dfrac{30}{64}=\\dfrac{15}{32}"), texte(" (2 chemins de l'arbre : rouge puis bleue, ou bleue puis rouge).")],
    },
    {
      enonce: [
        texte("Sans remise, en additionnant les probabilités des 4 chemins de l'arbre (RR, RB, BR, BB), on retrouve bien une probabilité totale de 1 : "),
        latex("\\dfrac{20}{56}+\\dfrac{15}{56}+\\dfrac{15}{56}+\\dfrac{6}{56}=1"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la loi des probabilités totales : les 4 chemins couvrent tous les cas possibles, disjoints deux à deux, leur somme vaut donc toujours 1.")],
    },
    {
      enonce: [texte("Sans remise, "), latex("P(\\text{au moins une rouge sur les 2 tirages})=\\dfrac{25}{28}"), texte(".")],
      reponse: true,
      justification: [
        texte("Par le complément : "), latex("P(\\text{au moins une rouge})=1-P(BB)=1-\\dfrac{6}{56}=\\dfrac{50}{56}=\\dfrac{25}{28}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Sur un arbre pondéré, la probabilité d'un chemin s'obtient en ADDITIONNANT les probabilités des branches traversées, jamais en les multipliant."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : la probabilité d'un CHEMIN s'obtient en MULTIPLIANT les probabilités des branches traversées ; c'est la probabilité d'un ÉVÉNEMENT (plusieurs chemins) qui s'obtient en additionnant."),
      ],
    },
    {
      enonce: [
        texte("Sur un arbre pondéré, la probabilité d'un événement qui correspond à plusieurs chemins s'obtient en ADDITIONNANT les probabilités de ces chemins (loi des probabilités totales)."),
      ],
      reponse: true,
      justification: [texte("C'est la règle correcte, complémentaire de la multiplication le long d'un même chemin.")],
    },
    {
      enonce: [texte("Avec 4 lettres et 4 enveloppes, il y a "), latex("4!=24"), texte(" façons de répartir les lettres, toutes équiprobables si le tirage est aléatoire.")],
      reponse: true,
      justification: [texte("C'est le nombre de permutations de 4 objets distincts : "), latex("4\\times3\\times2\\times1=24"), texte(".")],
    },
    {
      enonce: [
        texte("Le nombre de façons d'obtenir un rangement TOTALEMENT correct (chaque lettre dans la bonne enveloppe) est 4 (une par lettre), donc "),
        latex("P(\\text{tout correct})=\\dfrac{4}{24}=\\dfrac{1}{6}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Il n'existe qu'UN SEUL rangement totalement correct (l'identité), pas 4 : "), latex("P(\\text{tout correct})=\\dfrac{1}{24}"), texte(", pas "), latex("\\dfrac{1}{6}"), texte("."),
      ],
    },
    {
      enonce: [texte("Le nombre de dérangements de 4 éléments, noté "), latex("D(4)"), texte(", vaut 24.")],
      reponse: false,
      justification: [
        texte("C'est "), latex("4!"), texte(" qui vaut 24, pas "), latex("D(4)"), texte(" : le nombre de dérangements (aucun élément à sa place) de 4 éléments vaut "),
        latex("D(4)=9"), texte("."),
      ],
    },
    {
      enonce: [texte("Avec 4 lettres et 4 enveloppes, "), latex("P(\\text{aucune lettre à la bonne place})=\\dfrac{D(4)}{4!}=\\dfrac{9}{24}=\\dfrac{3}{8}"), texte(".")],
      reponse: true,
      justification: [texte("C'est la définition même : nombre de dérangements sur nombre total de répartitions.")],
    },
    {
      enonce: [texte("Avec 4 lettres et 4 enveloppes, "), latex("P(\\text{exactement 3 lettres sur 4 à la bonne place})"), texte(" est strictement positive.")],
      reponse: false,
      justification: [
        texte("Cette probabilité est nulle : si 3 lettres sont à la bonne place, la 4ᵉ y est forcément aussi (une seule enveloppe restante pour une seule lettre restante) — \"exactement 3 correctes\" est donc structurellement IMPOSSIBLE."),
      ],
    },
    {
      enonce: [
        texte("Avec 4 lettres et 4 enveloppes, "), latex("P(\\text{exactement 2 lettres sur 4 à la bonne place})=\\dfrac{C(4,2)\\times D(2)}{4!}=\\dfrac{6\\times1}{24}=\\dfrac{1}{4}"),
        texte("."),
      ],
      reponse: true,
      justification: [
        texte("On choisit les 2 positions correctes ("), latex("C(4,2)=6"), texte(" façons), puis les 2 lettres restantes doivent former un dérangement complet entre elles ("), latex("D(2)=1"), texte(" façon) : "),
        latex("\\dfrac{6\\times1}{24}=\\dfrac{1}{4}"), texte("."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Dans la même urne (5 rouges, 3 bleues), on tire cette fois 3 boules successivement SANS remise : "),
        latex("P(\\text{3 rouges})=\\dfrac{5}{8}\\times\\dfrac{4}{7}\\times\\dfrac{3}{6}=\\dfrac{5}{28}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("À chaque tirage, une rouge de moins et une boule de moins au total : "),
        latex("\\dfrac{5}{8}\\times\\dfrac{4}{7}\\times\\dfrac{3}{6}=\\dfrac{60}{336}=\\dfrac{5}{28}\\approx0{,}179"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour ces mêmes 3 tirages mais AVEC remise, "), latex("P(\\text{3 rouges})=\\dfrac{5}{28}"), texte(" également.")],
      reponse: false,
      justification: [
        texte("Avec remise, l'urne est chaque fois reconstituée : "), latex("P(\\text{3 rouges})=\\left(\\dfrac{5}{8}\\right)^3=\\dfrac{125}{512}\\approx0{,}244"),
        texte(", nettement au-dessus de "), latex("\\dfrac{5}{28}\\approx0{,}179"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Sur ces 3 tirages AVEC remise, "),
        latex("P(\\text{exactement 1 rouge})=C(3,1)\\times\\dfrac{5}{8}\\times\\left(\\dfrac{3}{8}\\right)^2=\\dfrac{135}{512}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Les 3 tirages étant indépendants, la formule binomiale s'applique : "),
        latex("3\\times\\dfrac{5}{8}\\times\\dfrac{9}{64}=\\dfrac{135}{512}\\approx0{,}264"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Sur 3 tirages SANS remise, "), latex("P(\\text{exactement 1 rouge})"),
        texte(" se calcule avec la même formule binomiale "), latex("C(3,1)\\times\\dfrac{5}{8}\\times\\left(\\dfrac{3}{8}\\right)^2"),
        texte(", seules les valeurs des probabilités changeant d'un tirage à l'autre."),
      ],
      reponse: false,
      justification: [
        texte("Formule binomiale (avec remise, indépendance) et comptage direct (sans remise) ne sont JAMAIS interchangeables : sans remise il faut dénombrer, "),
        latex("P=\\dfrac{C(5,1)\\times C(3,2)}{C(8,3)}=\\dfrac{5\\times3}{56}=\\dfrac{15}{56}\\approx0{,}268"),
        texte(", et non "), latex("\\dfrac{135}{512}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans cette urne de 8 boules dont 3 bleues, en tirant 4 boules SANS remise, "),
        latex("P(\\text{4 bleues})=\\left(\\dfrac{3}{8}\\right)^4\\approx0{,}0198"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Cette probabilité est NULLE : l'urne ne contient que 3 boules bleues, on ne peut donc jamais en tirer 4 sans remise — la puissance "),
        latex("\\left(\\dfrac{3}{8}\\right)^4"), texte(" est la formule du tirage AVEC remise, sans aucun sens ici."),
      ],
    },
    {
      enonce: [texte("Sur un arbre pondéré, la somme des probabilités portées par les branches issues d'un MÊME nœud vaut toujours 1.")],
      reponse: true,
      justification: [
        texte("Ces branches décrivent tous les résultats possibles de l'épreuve suivante, deux à deux incompatibles : leur somme vaut donc 1 à chaque nœud (par exemple "),
        latex("\\dfrac{4}{7}+\\dfrac{3}{7}=1"), texte(" après une première boule rouge, sans remise)."),
      ],
    },
    {
      enonce: [texte("Un arbre représentant 3 tirages successifs à 2 issues chacun comporte "), latex("2\\times3=6"), texte(" chemins complets.")],
      reponse: false,
      justification: [
        texte("Le nombre de chemins se MULTIPLIE d'un étage à l'autre : "), latex("2\\times2\\times2=2^3=8"), texte(" chemins complets, jamais "), latex("2\\times3"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec 4 lettres et 4 enveloppes réparties au hasard, "),
        latex("P(\\text{la lettre n°1 arrive dans la bonne enveloppe})=\\dfrac{3!}{4!}=\\dfrac{1}{4}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("La lettre n°1 étant fixée, les 3 autres se répartissent librement : "), latex("3!=6"), texte(" cas favorables sur "), latex("4!=24"), texte(", soit "),
        latex("\\dfrac{1}{4}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec ces mêmes 4 lettres, "), latex("P(\\text{les lettres n°1 ET n°2 arrivent toutes deux au bon endroit})=\\dfrac{1}{4}\\times\\dfrac{1}{4}=\\dfrac{1}{16}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Les deux placements ne sont pas indépendants (une enveloppe utilisée n'est plus disponible) : il reste "), latex("2!=2"),
        texte(" répartitions favorables sur "), latex("4!=24"), texte(", soit "), latex("\\dfrac{2}{24}=\\dfrac{1}{12}"), texte(", pas "), latex("\\dfrac{1}{16}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec 3 lettres et 3 enveloppes, "), latex("P(\\text{aucune lettre à la bonne place})=\\dfrac{D(3)}{3!}=\\dfrac{3}{6}=\\dfrac{1}{2}"),
        texte(", puisque "), latex("D(3)=3"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le nombre de dérangements de 3 éléments vaut "), latex("D(3)=2"), texte(" (les deux permutations circulaires), jamais 3 : "),
        latex("P=\\dfrac{2}{6}=\\dfrac{1}{3}"), texte("."),
      ],
    },
    {
      enonce: [texte("Avec 3 lettres et 3 enveloppes, "), latex("P(\\text{exactement une lettre à la bonne place})=\\dfrac{1}{2}"), texte(".")],
      reponse: true,
      justification: [
        texte("Sur les "), latex("3!=6"), texte(" répartitions, 3 laissent exactement une lettre en place (les 3 échanges des deux autres), 1 les laisse toutes en place et 2 n'en laissent aucune : "),
        latex("\\dfrac{3}{6}=\\dfrac{1}{2}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Un dé est truqué de sorte que "), latex("P(6)=\\dfrac{1}{2}"),
        texte(", les 5 autres faces restant équiprobables entre elles : chacune de ces 5 faces a donc une probabilité de "), latex("\\dfrac{1}{6}"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("La somme des 6 probabilités doit valoir 1 : si "), latex("p"), texte(" est la probabilité commune aux 5 autres faces, "),
        latex("\\dfrac{1}{2}+5p=1"), texte(" donne "), latex("p=\\dfrac{1}{10}"), texte(", pas "), latex("\\dfrac{1}{6}"), texte(" (qui donnerait un total de "),
        latex("\\dfrac{1}{2}+\\dfrac{5}{6}>1"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Sur ce dé truqué ("), latex("P(6)=\\dfrac{1}{2}"), texte(", les 5 autres faces équiprobables), "),
        latex("P(\\text{obtenir 6 ou 1})=\\dfrac{1}{2}\\times\\dfrac{1}{10}=\\dfrac{1}{20}"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("\"6\" et \"1\" sont deux résultats INCOMPATIBLES d'un même lancer : leurs probabilités s'ADDITIONNENT, elles ne se multiplient jamais — "),
        latex("P=\\dfrac{1}{2}+\\dfrac{1}{10}=\\dfrac{3}{5}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Sur un dé à 6 faces où chaque face PAIRE est deux fois plus probable que chaque face impaire, "), latex("P(\\text{nombre pair})=\\dfrac{2}{3}"),
        texte("."),
      ],
      reponse: true,
      justification: [
        texte("En notant "), latex("p"), texte(" (face paire) et "), latex("q"), texte(" (face impaire) avec "), latex("p=2q"), texte(", la somme "),
        latex("3p+3q=1"), texte(" donne "), latex("9q=1"), texte(", donc "), latex("q=\\dfrac{1}{9}"), texte(", "), latex("p=\\dfrac{2}{9}"), texte(" et "),
        latex("P(\\text{pair})=3p=\\dfrac{2}{3}"), texte("."),
      ],
    },
    {
      enonce: [texte("Sur ce même dé (faces paires deux fois plus probables), "), latex("P(\\text{obtenir un 2})=2\\times\\dfrac{1}{6}=\\dfrac{1}{3}"), texte(".")],
      reponse: false,
      justification: [
        texte("Doubler la probabilité d'un dé équilibré ne respecte pas la contrainte de somme : avec "), latex("\\dfrac{1}{3}"), texte(" par face paire et "),
        latex("\\dfrac{1}{6}"), texte(" par face impaire, le total ferait "), latex("3\\times\\dfrac{1}{3}+3\\times\\dfrac{1}{6}=1{,}5>1"),
        texte(". Le système donne "), latex("P(2)=\\dfrac{2}{9}"), texte("."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 3 — Indépendance, conditionnement et Bayes, ref 6gen32
  // Scénario fixe (test médical) : P(malade)=0,1, P(T+|malade)=0,9, P(T+|non malade)=0,2.
  // P(T+)=0,27 ; P(malade|T+)=1/3 ; P(non malade|T+)=2/3 ; P(non T+)=0,73 ;
  // P(malade|non T+)=1/73.
  // Puis deux exemples d'indépendance : (P(A)=0,4 ; P(B)=0,5 ; P(A∩B)=0,2 → indépendants)
  // et (mêmes P(A)/P(B), P(A∩B)=0,3 → non indépendants).
  // Enrichissement : effectifs naturels du même test sur 1000 personnes — 100 malades dont 90 T+,
  //   900 non malades dont 180 T+, soit 270 T+ dont 90 malades → 90/270=1/3 (à ne pas confondre
  //   avec 90/100=0,9=P(T+|malade)). Même test mais P(malade)=0,5 : P(T+)=0,55 et
  //   P(malade|T+)=0,45/0,55=9/11≈0,82 (Bayes dépend de la fréquence, pas seulement du test).
  //   Couple indépendant P(A)=0,4/P(B)=0,5 : P(A∩B̄)=0,2=P(A)·P(B̄) (l'indépendance se conserve par
  //   complémentation), P(A∪B)=0,7, P(A|B̄)=0,2/0,5=0,4=P(A).
  //   Tableau 200 clients (120 jeunes dont 90 carte, 80 seniors dont 40 carte) : P(carte)=130/200
  //   =0,65 ; P(carte|jeune)=90/120=0,75 ; P(jeune|carte)=90/130=9/13≈0,69 ;
  //   P(jeune)·P(carte)=0,39 ≠ P(jeune∩carte)=0,45 (non indépendants).
  // ==========================================================================
  independanceBayes: [
    {
      enonce: [
        texte("Pour un test médical avec "), latex("P(\\text{malade})=0{,}1"), texte(", "), latex("P(T^+|\\text{malade})=0{,}9"), texte(" et "),
        latex("P(T^+|\\text{non malade})=0{,}2"), texte(", la loi des probabilités totales donne "),
        latex("P(T^+)=0{,}9\\times0{,}1+0{,}2\\times0{,}9=0{,}27"), texte("."),
      ],
      reponse: true,
      justification: [texte("On combine les 2 branches de l'arbre menant à "), latex("T^+"), texte(" : "), latex("0{,}09+0{,}18=0{,}27"), texte(".")],
    },
    {
      enonce: [
        texte("Avec ces mêmes données, "), latex("P(\\text{malade}|T^+)=P(T^+|\\text{malade})=0{,}9"), texte(" : ce sont deux façons d'écrire la même probabilité."),
      ],
      reponse: false,
      justification: [
        texte("Ce sont deux probabilités conditionnelles DIFFÉRENTES, dans des sens opposés : "), latex("P(T^+|\\text{malade})=0{,}9"), texte(" est une donnée de départ, alors que "),
        latex("P(\\text{malade}|T^+)=\\dfrac{1}{3}\\approx0{,}33"), texte(" se calcule par le théorème de Bayes — très éloigné de "), latex("0{,}9"), texte("."),
      ],
    },
    {
      enonce: [latex("P(\\text{malade}|T^+)=\\dfrac{0{,}09}{0{,}27}=\\dfrac{1}{3}"), texte(".")],
      reponse: true,
      justification: [texte("Par le théorème de Bayes : "), latex("P(\\text{malade}|T^+)=\\dfrac{P(T^+|\\text{malade})\\times P(\\text{malade})}{P(T^+)}=\\dfrac{0{,}9\\times0{,}1}{0{,}27}=\\dfrac{1}{3}"), texte(".")],
    },
    {
      enonce: [latex("P(\\text{non malade}|T^+)=\\dfrac{2}{3}"), texte(".")],
      reponse: true,
      justification: [texte("C'est le complément de "), latex("P(\\text{malade}|T^+)=\\dfrac{1}{3}"), texte(" : "), latex("1-\\dfrac{1}{3}=\\dfrac{2}{3}"), texte(".")],
    },
    {
      enonce: [texte("De façon générale, "), latex("P(T^+|\\text{malade})"), texte(" et "), latex("P(\\text{malade}|T^+)"), texte(" sont TOUJOURS égales, quel que soit le contexte.")],
      reponse: false,
      justification: [
        texte("Rien ne le garantit : c'est précisément le piège classique du théorème de Bayes, illustré ci-dessus ("), latex("0{,}9"), texte(" contre "), latex("\\dfrac{1}{3}"), texte(") — les deux sens de conditionnement ne coïncident que dans des cas très particuliers."),
      ],
    },
    {
      enonce: [latex("P(\\text{malade}|T^+)=\\dfrac{P(T^+|\\text{malade})\\times P(\\text{malade})}{P(T^+)}"), texte(" est la formule correcte du théorème de Bayes.")],
      reponse: true,
      justification: [texte("C'est exactement la formule de Bayes, obtenue en divisant l'intersection par la probabilité de l'événement conditionnant.")],
    },
    {
      enonce: [texte("Dans cet exemple, "), latex("P(T^+)=P(T^+|\\text{malade})"), texte(" uniquement, car la loi des probabilités totales n'est utile que si on ignore "), latex("P(\\text{malade})"), texte(".")],
      reponse: false,
      justification: [
        texte("C'est incohérent : "), latex("P(T^+)"), texte(" doit combiner LES DEUX branches (malade et non malade), pondérées par leurs probabilités respectives — se limiter à "),
        latex("P(T^+|\\text{malade})=0{,}9"), texte(" ignore complètement les faux positifs chez les non-malades et donne un résultat faux."),
      ],
    },
    {
      enonce: [latex("P(\\text{non }T^+)=1-0{,}27=0{,}73"), texte(".")],
      reponse: true,
      justification: [texte("C'est l'événement complémentaire de "), latex("T^+"), texte(".")],
    },
    {
      enonce: [latex("P(\\text{malade}|\\text{non }T^+)=\\dfrac{0{,}1\\times0{,}1}{0{,}73}=\\dfrac{1}{73}\\approx0{,}0137"), texte(".")],
      reponse: true,
      justification: [
        texte("Par Bayes : "), latex("P(\\text{non }T^+|\\text{malade})=1-0{,}9=0{,}1"), texte(", donc "), latex("P(\\text{malade}|\\text{non }T^+)=\\dfrac{0{,}1\\times0{,}1}{0{,}73}=\\dfrac{0{,}01}{0{,}73}=\\dfrac{1}{73}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Cette valeur "), latex("P(\\text{malade}|\\text{non }T^+)\\approx0{,}0137"), texte(" est PLUS GRANDE que "), latex("P(\\text{malade}|T^+)=\\dfrac{1}{3}"),
        texte(", ce qui serait absurde pour un test fiable."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse, et c'est cohérent pour un test fiable : sachant un résultat négatif, la probabilité d'être malade ("), latex("\\approx0{,}0137"),
        texte(") est bien plus PETITE que sachant un résultat positif ("), latex("\\dfrac{1}{3}\\approx0{,}33"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Si "), latex("P(A)=0{,}4"), texte(", "), latex("P(B)=0{,}5"), texte(" et "), latex("P(A\\cap B)=0{,}2"), texte(", alors "), latex("A"), texte(" et "), latex("B"),
        texte(" sont indépendants, car "), latex("P(A)\\times P(B)=0{,}2=P(A\\cap B)"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le critère d'indépendance est exactement vérifié : "), latex("0{,}4\\times0{,}5=0{,}2"), texte(", égal à "), latex("P(A\\cap B)"), texte(".")],
    },
    {
      enonce: [texte("Dans ce cas indépendant, "), latex("P(A|B)=P(A)=0{,}4"), texte(".")],
      reponse: true,
      justification: [texte("C'est une propriété directe de l'indépendance : "), latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{0{,}2}{0{,}5}=0{,}4=P(A)"), texte(".")],
    },
    {
      enonce: [
        texte("Si à présent "), latex("P(A)=0{,}4"), texte(", "), latex("P(B)=0{,}5"), texte(" et "), latex("P(A\\cap B)=0{,}3"), texte(" (au lieu de "), latex("0{,}2"),
        texte("), alors "), latex("A"), texte(" et "), latex("B"), texte(" sont encore indépendants."),
      ],
      reponse: false,
      justification: [texte("Ici "), latex("P(A)\\times P(B)=0{,}2"), texte(", différent de "), latex("P(A\\cap B)=0{,}3"), texte(" : le critère d'indépendance échoue, "), latex("A"), texte(" et "), latex("B"), texte(" ne sont PAS indépendants dans ce cas.")],
    },
    {
      enonce: [
        texte("Dans ce second cas ("), latex("P(A\\cap B)=0{,}3"), texte("), "), latex("P(A|B)=0{,}6"), texte(", différent de "), latex("P(A)=0{,}4"),
        texte(" — signe cohérent que "), latex("A"), texte(" et "), latex("B"), texte(" ne sont pas indépendants."),
      ],
      reponse: true,
      justification: [texte("On calcule "), latex("P(A|B)=\\dfrac{0{,}3}{0{,}5}=0{,}6"), texte(", bien différent de "), latex("P(A)=0{,}4"), texte(", ce qui confirme la non-indépendance.")],
    },
    {
      enonce: [
        texte("Pour appliquer la loi des probabilités totales, il suffit que les événements de la partition aient une probabilité non nulle, peu importe qu'ils recouvrent tout l'univers ou non."),
      ],
      reponse: false,
      justification: [
        texte("Une probabilité non nulle ne suffit pas : une partition doit être formée d'événements deux à deux incompatibles ET dont l'union recouvre l'univers ENTIER, sinon des cas sont oubliés dans la somme."),
      ],
    },
    {
      enonce: [
        texte("Une partition de l'univers, utilisée pour la loi des probabilités totales, doit être formée d'événements deux à deux incompatibles et dont l'union est l'univers entier."),
      ],
      reponse: true,
      justification: [texte("C'est exactement la définition d'une partition — les deux conditions (incompatibilité et union totale) sont indispensables.")],
    },
    {
      enonce: [latex("P(\\text{malade}|T^+)+P(\\text{malade}|\\text{non }T^+)=1"), texte(" nécessairement.")],
      reponse: false,
      justification: [
        texte("Ces deux probabilités sont conditionnées par des événements DIFFÉRENTS ("), latex("T^+"), texte(" et \"non "), latex("T^+"), texte("\"), rien n'impose qu'elles soient complémentaires : ici "),
        latex("\\dfrac{1}{3}+\\dfrac{1}{73}\\approx0{,}347"), texte(", très loin de "), latex("1"), texte("."),
      ],
    },
    {
      enonce: [latex("P(\\text{malade}|T^+)+P(\\text{non malade}|T^+)=1"), texte(".")],
      reponse: true,
      justification: [
        texte("Ici les deux événements sont conditionnés par le MÊME événement ("), latex("T^+"), texte("), et sont complémentaires l'un de l'autre : leur somme vaut donc toujours "),
        latex("1"), texte(" ("), latex("\\dfrac{1}{3}+\\dfrac{2}{3}=1"), texte(")."),
      ],
    },
    {
      enonce: [texte("Un événement "), latex("A"), texte(" est indépendant de "), latex("B"), texte(" si et seulement si "), latex("P(A|B)\\neq P(A)"), texte(" (probabilité de "), latex("B"), texte(" non nulle).")],
      reponse: false,
      justification: [
        texte("C'est l'inverse : "), latex("A"), texte(" est indépendant de "), latex("B"), texte(" si et seulement si "), latex("P(A|B)=P(A)"),
        texte(" — une ÉGALITÉ, pas une inégalité. Une inégalité signale au contraire une DÉPENDANCE."),
      ],
    },
    {
      enonce: [texte("Un événement "), latex("A"), texte(" est indépendant de "), latex("B"), texte(" si et seulement si "), latex("P(A|B)=P(A)"), texte(" (probabilité de "), latex("B"), texte(" non nulle).")],
      reponse: true,
      justification: [texte("C'est la caractérisation correcte de l'indépendance en termes de probabilité conditionnelle.")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Le même test médical, raconté en effectifs sur 1000 personnes : 100 malades dont 90 positifs, et 900 non malades dont 180 positifs. Il y a donc 270 positifs au total, et "),
        latex("P(\\text{malade}|T^+)=\\dfrac{90}{270}=\\dfrac{1}{3}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Les effectifs redonnent exactement le résultat de Bayes : "), latex("0{,}9\\times100=90"), texte(" vrais positifs et "),
        latex("0{,}2\\times900=180"), texte(" faux positifs, soit 270 positifs dont 90 réellement malades."),
      ],
    },
    {
      enonce: [
        texte("Dans ce même comptage sur 1000 personnes, "), latex("P(\\text{malade}|T^+)=\\dfrac{90}{100}=0{,}9"),
        texte(", puisque 90 des 100 malades sont bien détectés positifs."),
      ],
      reponse: false,
      justification: [
        texte("\"Sachant positif\" impose de diviser par le nombre de POSITIFS (270), jamais par le nombre de malades (100) : "),
        latex("\\dfrac{90}{270}=\\dfrac{1}{3}"), texte(". La fraction "), latex("\\dfrac{90}{100}"), texte(" est "), latex("P(T^+|\\text{malade})"),
        texte(", l'autre sens de conditionnement."),
      ],
    },
    {
      enonce: [
        texte("Dans ce comptage, les faux positifs (180) sont plus nombreux que les vrais positifs (90), ce qui explique qu'un test \"fiable à 90 %\" laisse "),
        latex("P(\\text{malade}|T^+)"), texte(" en dessous de "), latex("\\dfrac{1}{2}"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Les non-malades sont 9 fois plus nombreux que les malades : même avec un taux de faux positifs faible ("), latex("0{,}2"),
        texte("), ils fournissent la majorité des tests positifs — d'où "), latex("\\dfrac{90}{270}=\\dfrac{1}{3}<\\dfrac{1}{2}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Si la maladie était bien plus fréquente — "), latex("P(\\text{malade})=0{,}5"), texte(" au lieu de "), latex("0{,}1"),
        texte(" — la valeur de "), latex("P(\\text{malade}|T^+)"), texte(" resterait "), latex("\\dfrac{1}{3}"),
        texte(", puisque les caractéristiques du test ("), latex("0{,}9"), texte(" et "), latex("0{,}2"), texte(") n'ont pas changé."),
      ],
      reponse: false,
      justification: [
        texte("Bayes fait intervenir la fréquence de la maladie autant que les qualités du test : avec "), latex("P(\\text{malade})=0{,}5"), texte(", "),
        latex("P(T^+)=0{,}9\\times0{,}5+0{,}2\\times0{,}5=0{,}55"), texte(" et "),
        latex("P(\\text{malade}|T^+)=\\dfrac{0{,}45}{0{,}55}=\\dfrac{9}{11}\\approx0{,}82"), texte(", très loin de "), latex("\\dfrac{1}{3}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec "), latex("P(\\text{malade})=0{,}5"), texte(" et les mêmes taux "), latex("0{,}9"), texte(" et "), latex("0{,}2"), texte(", "),
        latex("P(\\text{malade}|T^+)=\\dfrac{9}{11}\\approx0{,}82"), texte("."),
      ],
      reponse: true,
      justification: [
        latex("P(T^+)=0{,}45+0{,}10=0{,}55"), texte(", donc "), latex("P(\\text{malade}|T^+)=\\dfrac{0{,}45}{0{,}55}=\\dfrac{9}{11}"),
        texte(" — le même test devient bien plus concluant quand la maladie est fréquente."),
      ],
    },
    {
      enonce: [texte("L'égalité "), latex("P(A\\cap B)=P(A)\\times P(B|A)"), texte(" n'est valable que si "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants.")],
      reponse: false,
      justification: [
        texte("C'est la définition même de la probabilité conditionnelle, réécrite : elle vaut pour TOUS les événements (dès que "), latex("P(A)\\neq0"),
        texte("), indépendants ou non. C'est "), latex("P(A\\cap B)=P(A)\\times P(B)"), texte(" — sans conditionnement — qui exige l'indépendance."),
      ],
    },
    {
      enonce: [texte("L'égalité "), latex("P(A\\cap B)=P(B)\\times P(A|B)"), texte(" est valable pour tous événements "), latex("A"), texte(" et "), latex("B"), texte(" tels que "), latex("P(B)\\neq0"), texte(".")],
      reponse: true,
      justification: [
        texte("C'est la formule "), latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}"),
        texte(" multipliée des deux côtés par "), latex("P(B)"), texte(" — aucune hypothèse d'indépendance n'intervient."),
      ],
    },
    {
      enonce: [texte("Si "), latex("A"), texte(" et "), latex("B"), texte(" sont indépendants, alors "), latex("A"), texte(" et "), latex("\\overline{B}"), texte(" ne le sont plus.")],
      reponse: false,
      justification: [
        texte("L'indépendance se conserve par passage au complémentaire : "),
        latex("P(A\\cap\\overline{B})=P(A)-P(A\\cap B)=P(A)-P(A)P(B)=P(A)\\times P(\\overline{B})"),
        texte(" (avec "), latex("P(A)=0{,}4"), texte(" et "), latex("P(B)=0{,}5"), texte(" : "), latex("0{,}2=0{,}4\\times0{,}5"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Si "), latex("P(A)=0{,}4"), texte(" et "), latex("P(B)=0{,}5"), texte(" avec "), latex("A"), texte(" et "), latex("B"), texte(" indépendants, alors "),
        latex("P(A\\cup B)=0{,}4+0{,}5-0{,}2=0{,}7"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("L'indépendance sert seulement à obtenir l'intersection ("), latex("P(A\\cap B)=0{,}4\\times0{,}5=0{,}2"),
        texte(") ; l'union se calcule ensuite par inclusion-exclusion comme toujours."),
      ],
    },
    {
      enonce: [
        texte("Avec ces mêmes "), latex("A"), texte(" et "), latex("B"), texte(" indépendants ("), latex("P(A)=0{,}4"), texte(", "), latex("P(B)=0{,}5"), texte("), "),
        latex("P(A|\\overline{B})=0{,}2"), texte(", puisqu'on retire l'intersection à "), latex("P(A)"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Il faut encore diviser par "), latex("P(\\overline{B})"), texte(" : "),
        latex("P(A|\\overline{B})=\\dfrac{P(A\\cap\\overline{B})}{P(\\overline{B})}=\\dfrac{0{,}2}{0{,}5}=0{,}4=P(A)"),
        texte(" — sachant "), latex("\\overline{B}"), texte(" comme sachant "), latex("B"), texte(", la probabilité de "), latex("A"), texte(" reste inchangée : c'est bien l'indépendance."),
      ],
    },
    {
      enonce: [
        texte("Sur un arbre à deux causes, "), latex("P(\\text{cause}_1|\\text{effet})"),
        texte(" s'obtient en divisant la probabilité du chemin \"cause 1 puis effet\" par la SOMME des probabilités de tous les chemins menant à l'effet."),
      ],
      reponse: true,
      justification: [
        texte("Le numérateur est "), latex("P(\\text{cause}_1\\cap\\text{effet})"), texte(" et le dénominateur "), latex("P(\\text{effet})"),
        texte(" obtenu par la loi des probabilités totales : c'est exactement le théorème de Bayes lu sur l'arbre."),
      ],
    },
    {
      enonce: [
        texte("Sur cet arbre, "), latex("P(\\text{cause}_1|\\text{effet})"), texte(" se lit directement sur la branche allant de \"cause 1\" vers \"effet\"."),
      ],
      reponse: false,
      justification: [
        texte("Cette branche porte "), latex("P(\\text{effet}|\\text{cause}_1)"),
        texte(", le conditionnement dans l'AUTRE sens : la lire telle quelle au lieu de calculer Bayes est le piège central de l'arbre à deux causes."),
      ],
    },
    {
      enonce: [
        texte("Sur 200 clients, 120 sont des jeunes (dont 90 paient par carte) et 80 des seniors (dont 40 paient par carte). Alors "),
        latex("P(\\text{carte}|\\text{jeune})=P(\\text{carte})=0{,}65"),
        texte(", une marginale et une conditionnelle portant sur la même colonne coïncidant toujours."),
      ],
      reponse: false,
      justification: [
        texte("Les deux dénominateurs diffèrent : la marginale "), latex("P(\\text{carte})=\\dfrac{130}{200}=0{,}65"),
        texte(" rapporte au total général, la conditionnelle "), latex("P(\\text{carte}|\\text{jeune})=\\dfrac{90}{120}=0{,}75"),
        texte(" rapporte aux seuls jeunes — elles ne coïncident que par exception (précisément en cas d'indépendance)."),
      ],
    },
    {
      enonce: [texte("Dans ce même tableau de 200 clients, "), latex("P(\\text{jeune}|\\text{carte})=0{,}75"), texte(" aussi.")],
      reponse: false,
      justification: [
        texte("Ici on se restreint aux 130 clients payant par carte, dont 90 sont jeunes : "),
        latex("P(\\text{jeune}|\\text{carte})=\\dfrac{90}{130}=\\dfrac{9}{13}\\approx0{,}69"), texte(", différent de "), latex("0{,}75"), texte("."),
      ],
    },
    {
      enonce: [texte("Dans ce tableau de 200 clients, \"être jeune\" et \"payer par carte\" ne sont pas indépendants.")],
      reponse: true,
      justification: [
        latex("P(\\text{jeune})\\times P(\\text{carte})=0{,}6\\times0{,}65=0{,}39"), texte(", alors que "),
        latex("P(\\text{jeune}\\cap\\text{carte})=\\dfrac{90}{200}=0{,}45"), texte(" : le critère d'indépendance échoue."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 4 — Probabilités : problèmes, ref 6gen33
  // Scénario A (loi binomiale) : tireur touche la cible avec p=0,3, 5 tirs indépendants.
  //   P(X=0)=0,7^5=0,16807 ; P(X=2)=C(5,2)·0,3²·0,7³=0,3087 ; P(X=5)=0,3^5=0,00243 ;
  //   P(au moins 1)=1-0,16807=0,83193.
  // Scénario B (dénombrement) : choisir 3 livres parmi 5 : C(5,3)=10 (non ordonné),
  //   A(5,3)=5×4×3=60 (ordonné).
  // Scénario C (contexte financier, binomiale) : action monte avec p=0,6, 3 jours indépendants.
  //   P(X=0)=0,064 ; P(X=1)=0,288 ; P(X=2)=0,432 ; P(X=3)=0,216 ; P(au moins 1)=0,936.
  // Enrichissement, même tireur p=0,3 : arbre à 3 tirs = 2³=8 chemins, 3 à deux succès (chacun
  //   0,3²·0,7=0,063), P(X=1)=3·0,3·0,7²=0,441 ; sur 5 tirs P(X=1)=5·0,3·0,7⁴=0,36015 (maximum de
  //   la distribution, pas P(X=0)=0,16807), P(X=4)=0,02835, P(X≥4)=0,03078, P(X≤4)=1-0,00243
  //   =0,99757. Fiabilité de 2 composants à 0,9 : série 0,81, parallèle 1-0,1²=0,99.
  //   Dénombrement : C(5,2)=C(5,3)=10, C(5,0)=1, 5!=120 (≠5⁵), 3 livres à 3 élèves = 3!=6 (≠C(3,3)).
  //   Joueur à 1/6 sur 6 parties : P(au moins une victoire)=1-(5/6)⁶=1-15625/46656≈0,665.
  // ==========================================================================
  probabilitesProblemes: [
    {
      enonce: [
        texte("Un tireur touche la cible avec une probabilité "), latex("0{,}3"), texte(" à chaque tir, indépendamment d'un tir à l'autre. Sur 5 tirs, "),
        latex("P(\\text{exactement 2 succès})=C(5,2)\\times0{,}3^2\\times0{,}7^3=10\\times0{,}09\\times0{,}343=0{,}3087"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la formule binomiale complète, coefficient binomial inclus : "), latex("10\\times0{,}09\\times0{,}343=0{,}3087"), texte(".")],
    },
    {
      enonce: [
        texte("Toujours sur ces 5 tirs, "), latex("P(\\text{exactement 2 succès})=0{,}3^2\\times0{,}7^3=0{,}03087"), texte(" (sans le facteur combinatoire "), latex("C(5,2)"), texte(")."),
      ],
      reponse: false,
      justification: [
        texte("Oublier "), latex("C(5,2)=10"), texte(" — le nombre de façons de choisir QUELS 2 tirs réussissent parmi les 5 — donne un résultat 10 fois trop petit : la vraie valeur est "),
        latex("0{,}3087"), texte(", pas "), latex("0{,}03087"), texte("."),
      ],
    },
    {
      enonce: [latex("P(\\text{aucun succès sur les 5 tirs})=0{,}7^5=0{,}16807"), texte(".")],
      reponse: true,
      justification: [texte("Les 5 tirs doivent tous échouer, indépendamment : "), latex("0{,}7\\times0{,}7\\times0{,}7\\times0{,}7\\times0{,}7=0{,}16807"), texte(".")],
    },
    {
      enonce: [latex("P(\\text{au moins un succès sur les 5 tirs})=1-0{,}7^5=0{,}83193"), texte(".")],
      reponse: true,
      justification: [texte("Par le complément : \"au moins un succès\" est le contraire d'\"aucun succès\", donc "), latex("1-0{,}16807=0{,}83193"), texte(".")],
    },
    {
      enonce: [texte("Toujours sur ces 5 tirs, "), latex("P(\\text{au moins un succès})=5\\times0{,}3=1{,}5"), texte(", en additionnant simplement la probabilité de chaque tir.")],
      reponse: false,
      justification: [
        texte("Une probabilité ne peut jamais dépasser "), latex("1"), texte(" : cette méthode (additionner "), latex("5"), texte(" probabilités de "), latex("0{,}3"),
        texte(") est incorrecte — il faut passer par le complément, "), latex("1-P(\\text{aucun succès})=0{,}83193"), texte("."),
      ],
    },
    {
      enonce: [texte("La somme des 6 probabilités "), latex("P(X=0)"), texte(" à "), latex("P(X=5)"), texte(" (nombre de succès sur les 5 tirs) vaut exactement 1.")],
      reponse: true,
      justification: [texte("Ces 6 valeurs couvrent tous les cas possibles (0 à 5 succès), disjoints deux à deux : leur somme vaut donc toujours 1.")],
    },
    {
      enonce: [latex("P(\\text{5 succès sur 5 tirs})=0{,}3\\times5=1{,}5"), texte(".")],
      reponse: false,
      justification: [
        texte("Une probabilité ne peut jamais dépasser "), latex("1"), texte(" : la bonne valeur est "), latex("P(X=5)=0{,}3^5=0{,}00243"),
        texte(" (les 5 tirs réussissent, indépendamment), jamais "), latex("0{,}3\\times5"), texte("."),
      ],
    },
    {
      enonce: [latex("P(\\text{5 succès sur 5 tirs})=0{,}3^5=0{,}00243"), texte(".")],
      reponse: true,
      justification: [latex("0{,}3\\times0{,}3\\times0{,}3\\times0{,}3\\times0{,}3=0{,}00243"), texte(".")],
    },
    {
      enonce: [texte("Pour choisir 3 livres parmi 5 différents, sans tenir compte de l'ordre du choix, il y a "), latex("C(5,3)=10"), texte(" façons.")],
      reponse: true,
      justification: [latex("C(5,3)=\\dfrac{5!}{3!\\times2!}=\\dfrac{120}{6\\times2}=10"), texte(".")],
    },
    {
      enonce: [texte("En tenant compte de l'ORDRE du choix (1er livre choisi, 2e, 3e), il y aurait aussi "), latex("10"), texte(" façons de choisir 3 livres parmi 5.")],
      reponse: false,
      justification: [
        texte("Tenir compte de l'ordre change le dénombrement : il y a "), latex("A(5,3)=5\\times4\\times3=60"), texte(" façons ORDONNÉES, bien plus que les "),
        latex("10"), texte(" façons non ordonnées ("), latex("C(5,3)"), texte(")."),
      ],
    },
    {
      enonce: [texte("Le nombre de façons ordonnées de choisir 3 livres parmi 5 est "), latex("5\\times4\\times3=60"), texte(".")],
      reponse: true,
      justification: [texte("À chaque étape, un livre de moins est disponible : "), latex("5"), texte(" choix pour le premier, "), latex("4"), texte(" pour le second, "), latex("3"), texte(" pour le troisième.")],
    },
    {
      enonce: [
        texte("Ce nombre de façons ordonnées s'obtient en multipliant "), latex("C(5,3)"), texte(" par "), latex("3"), texte(" (le nombre de livres choisis), soit "), latex("10\\times3=30"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est le nombre de PERMUTATIONS des 3 livres choisis qu'il faut utiliser, soit "), latex("3!=6"), texte(", pas "), latex("3"), texte(" : "),
        latex("C(5,3)\\times3!=10\\times6=60"), texte(", pas "), latex("30"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Une action en bourse monte avec une probabilité "), latex("0{,}6"), texte(" chaque jour, indépendamment d'un jour à l'autre. Sur 3 jours, "),
        latex("P(\\text{elle monte exactement 2 fois})=C(3,2)\\times0{,}6^2\\times0{,}4=3\\times0{,}36\\times0{,}4=0{,}432"), texte("."),
      ],
      reponse: true,
      justification: [texte("Formule binomiale complète : "), latex("3\\times0{,}36\\times0{,}4=0{,}432"), texte(".")],
    },
    {
      enonce: [texte("Sur ces mêmes 3 jours, "), latex("P(\\text{elle monte les 3 fois})=0{,}6\\times3=1{,}8"), texte(".")],
      reponse: false,
      justification: [texte("Impossible : une probabilité ne dépasse jamais "), latex("1"), texte(". La bonne valeur est "), latex("0{,}6^3=0{,}216"), texte(", jamais "), latex("0{,}6\\times3"), texte(".")],
    },
    {
      enonce: [latex("P(\\text{elle monte les 3 jours})=0{,}6^3=0{,}216"), texte(".")],
      reponse: true,
      justification: [latex("0{,}6\\times0{,}6\\times0{,}6=0{,}216"), texte(" (3 hausses indépendantes successives).")],
    },
    {
      enonce: [latex("P(\\text{elle ne monte aucun des 3 jours})=0{,}4^3=0{,}064"), texte(".")],
      reponse: true,
      justification: [latex("0{,}4\\times0{,}4\\times0{,}4=0{,}064"), texte(" (3 baisses indépendantes successives).")],
    },
    {
      enonce: [
        texte("Sur ces 3 jours, "), latex("P(\\text{au moins une hausse})=P(X=2)+P(X=3)=0{,}432+0{,}216=0{,}648"), texte(", en additionnant seulement les cas \"exactement 2\" et \"exactement 3\"."),
      ],
      reponse: false,
      justification: [
        texte("Cette somme oublie le cas \"exactement 1 hausse\" ("), latex("P(X=1)=C(3,1)\\times0{,}6\\times0{,}4^2=0{,}288"), texte(") : la bonne méthode est le complément, "),
        latex("1-P(X=0)=1-0{,}064=0{,}936"), texte(", pas "), latex("0{,}648"), texte("."),
      ],
    },
    {
      enonce: [latex("P(\\text{au moins une hausse sur les 3 jours})=1-0{,}4^3=0{,}936"), texte(".")],
      reponse: true,
      justification: [texte("Par le complément : \"au moins une hausse\" est le contraire d'\"aucune hausse\", donc "), latex("1-0{,}064=0{,}936"), texte(".")],
    },
    {
      enonce: [
        texte("La somme des 4 probabilités "), latex("P(X=0),P(X=1),P(X=2),P(X=3)"), texte(" (nombre de hausses sur les 3 jours) vaut 1 : "),
        latex("0{,}064+0{,}288+0{,}432+0{,}216=1"), texte("."),
      ],
      reponse: true,
      justification: [texte("Ces 4 valeurs couvrent tous les cas possibles (0 à 3 hausses), disjoints deux à deux : leur somme vaut toujours 1.")],
    },
    {
      enonce: [texte("Dans une répartition binomiale, la méthode du complément ("), latex("1-P(\\text{aucun succès})"), texte(") ne fonctionne que si "), latex("p=0{,}5"), texte(".")],
      reponse: false,
      justification: [
        texte("La méthode du complément fonctionne pour n'importe quelle valeur de "), latex("p"), texte(" entre "), latex("0"), texte(" et "), latex("1"),
        texte(" : elle repose seulement sur le fait que \"au moins un succès\" et \"aucun succès\" sont des événements complémentaires, jamais sur une valeur particulière de "), latex("p"), texte("."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Pour le même tireur ("), latex("p=0{,}3"), texte(") mais sur 3 tirs seulement, l'arbre complet compte 8 chemins, dont exactement 3 contiennent 2 succès."),
      ],
      reponse: true,
      justification: [
        texte("L'arbre a "), latex("2^3=8"), texte(" chemins ; ceux à 2 succès sont SSÉ, SÉS et ÉSS, soit 3 chemins — autant que "), latex("C(3,2)=3"), texte("."),
      ],
    },
    {
      enonce: [texte("Sur ces 3 tirs à "), latex("p=0{,}3"), texte(", "), latex("P(\\text{exactement 1 succès})=3\\times0{,}3\\times0{,}7^2=0{,}441"), texte(".")],
      reponse: true,
      justification: [
        texte("3 chemins (SÉÉ, ÉSÉ, ÉÉS) de probabilité "), latex("0{,}3\\times0{,}49=0{,}147"), texte(" chacun : "),
        latex("3\\times0{,}147=0{,}441"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Sur ces 3 tirs, deux chemins comportant le MÊME nombre de succès n'ont pas la même probabilité, car l'ordre des succès et des échecs change le produit."),
      ],
      reponse: false,
      justification: [
        texte("Les facteurs sont les mêmes à chaque étage ("), latex("p"), texte(" ou "), latex("1-p"),
        texte("), et un produit ne dépend pas de l'ordre de ses facteurs : SSÉ, SÉS et ÉSS valent tous "), latex("0{,}3^2\\times0{,}7=0{,}063"),
        texte(". C'est précisément ce qui permet de simplement COMPTER les chemins."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" tirs à "), latex("p=0{,}3"), texte(", "), latex("P(X=1)=5\\times0{,}3\\times0{,}7^4=0{,}36015"), texte(".")],
      reponse: true,
      justification: [latex("0{,}7^4=0{,}2401"), texte(", donc "), latex("5\\times0{,}3\\times0{,}2401=0{,}36015"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=5"), texte(" et "), latex("p=0{,}3"), texte(", la valeur la plus probable du nombre de succès est "), latex("X=0"),
        texte(", puisque "), latex("p<0{,}5"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le maximum est atteint en "), latex("X=1"), texte(" : "), latex("P(X=0)=0{,}168"), texte(", "), latex("P(X=1)=0{,}360"), texte(", "),
        latex("P(X=2)=0{,}309"), texte(" — un "), latex("p"), texte(" inférieur à "), latex("0{,}5"), texte(" déplace le maximum vers la gauche, sans le fixer pour autant en 0."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" et "), latex("p=0{,}3"), texte(", "), latex("P(X\\geq4)=P(X=4)+P(X=5)=0{,}02835+0{,}00243=0{,}03078"), texte(".")],
      reponse: true,
      justification: [
        latex("P(X=4)=C(5,4)\\times0{,}3^4\\times0{,}7=5\\times0{,}0081\\times0{,}7=0{,}02835"), texte(" et "), latex("P(X=5)=0{,}00243"),
        texte(" ; ces deux cas sont incompatibles, on additionne."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=5"), texte(" et "), latex("p=0{,}3"), texte(", "), latex("P(X\\leq4)=1-P(X=4)=0{,}97165"), texte(".")],
      reponse: false,
      justification: [
        texte("Le contraire de \""), latex("X\\leq4"), texte("\" est \""), latex("X=5"), texte("\", pas \""), latex("X=4"), texte("\" : "),
        latex("P(X\\leq4)=1-0{,}00243=0{,}99757"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Deux composants indépendants, fiables à "), latex("0{,}9"), texte(" chacun, montés EN SÉRIE (le système fonctionne seulement si les deux fonctionnent) : la fiabilité du système vaut "),
        latex("0{,}9\\times0{,}9=0{,}81"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("En série, les deux composants doivent fonctionner simultanément : l'indépendance permet de multiplier, et la fiabilité obtenue est INFÉRIEURE à celle de chaque composant."),
      ],
    },
    {
      enonce: [
        texte("Monter ces deux mêmes composants EN PARALLÈLE (le système fonctionne dès que l'un des deux fonctionne) ne peut jamais donner une fiabilité supérieure à celle d'un seul composant, soit "),
        latex("0{,}9"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est tout l'intérêt du montage en parallèle : le système ne tombe en panne que si les DEUX composants tombent en panne, d'où "),
        latex("1-(1-0{,}9)^2=1-0{,}01=0{,}99"), texte(", supérieur à "), latex("0{,}9"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Choisir 2 livres à emporter parmi 5 revient à choisir les 3 qu'on laisse : "), latex("C(5,2)=C(5,3)=10"), texte("."),
      ],
      reponse: true,
      justification: [
        latex("C(5,2)=\\dfrac{5!}{2!\\times3!}=10"), texte(" et "), latex("C(5,3)=\\dfrac{5!}{3!\\times2!}=10"),
        texte(" : à chaque choix de 2 livres correspond exactement un choix des 3 restants."),
      ],
    },
    {
      enonce: [texte("Le nombre de façons de n'emporter AUCUN livre parmi les 5 est "), latex("C(5,0)=0"), texte(".")],
      reponse: false,
      justification: [
        latex("C(5,0)=1"), texte(" : il existe exactement UNE façon de ne rien choisir (repartir les mains vides), jamais zéro — un dénombrement nul signifierait que cette situation est impossible."),
      ],
    },
    {
      enonce: [texte("Le nombre de mots distincts obtenus en permutant les 5 lettres, toutes différentes, du mot LIVRE est "), latex("5^5=3125"), texte(".")],
      reponse: false,
      justification: [
        texte("Chaque lettre ne peut servir qu'une fois : c'est une permutation, "), latex("5!=120"), texte(". La puissance "), latex("5^5"),
        texte(" compterait les mots de 5 lettres AVEC répétition, un tout autre dénombrement."),
      ],
    },
    {
      enonce: [texte("Le nombre de façons de distribuer 3 livres DIFFÉRENTS à 3 élèves (un livre chacun) est "), latex("C(3,3)=1"), texte(".")],
      reponse: false,
      justification: [
        texte("Ici l'ordre compte (savoir QUEL livre va à QUEL élève) : il y a "), latex("3!=6"), texte(" distributions. "), latex("C(3,3)=1"),
        texte(" compte seulement les façons de choisir les 3 livres, sans les attribuer."),
      ],
    },
    {
      enonce: [
        texte("Un joueur a 1 chance sur 6 de gagner à chaque partie, indépendamment des autres. Sur 6 parties, il est donc certain de gagner au moins une fois."),
      ],
      reponse: false,
      justification: [
        texte("Additionner 6 fois "), latex("\\dfrac{1}{6}"), texte(" pour obtenir 1 est exactement la méthode fausse du \"au moins un\" : la vraie valeur est "),
        latex("1-\\left(\\dfrac{5}{6}\\right)^6\\approx0{,}665"), texte(", soit environ 2 chances sur 3, jamais la certitude."),
      ],
    },
    {
      enonce: [texte("Pour ce joueur, "), latex("P(\\text{au moins une victoire sur 6 parties})=1-\\left(\\dfrac{5}{6}\\right)^6\\approx0{,}665"), texte(".")],
      reponse: true,
      justification: [
        texte("Par le complément : "), latex("\\left(\\dfrac{5}{6}\\right)^6=\\dfrac{15625}{46656}\\approx0{,}335"), texte(" est la probabilité de tout perdre, d'où "),
        latex("1-0{,}335\\approx0{,}665"), texte("."),
      ],
    },
  ],
};
