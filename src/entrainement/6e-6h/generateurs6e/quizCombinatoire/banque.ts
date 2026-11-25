/**
 * Couche A — banque de contenu pour "Analyse combinatoire" (quiz vrai/faux), chapitre 7 du
 * chantier 6e (6h), ajout ultérieur (6gen70). 210 affirmations PRÉ-ÉCRITES (35 par thème, 6
 * thèmes), chacune vérifiée mathématiquement à la rédaction (calculs directs, cohérence avec les
 * générateurs déjà établis du chapitre pour les formules/pièges classiques) — jamais générées
 * procéduralement, voir `core6e/quizCombinatoire.types.ts`.
 *
 * Les 20 premières affirmations de chaque thème forment la banque d'origine (10 vraies/10 fausses).
 * Les 15 suivantes (bloc "Enrichissement") portent sur des notions du chapitre non couvertes par
 * les 20 premières — types de groupement restants de la classification (permutation simple
 * `P_p=p!`, arrangement avec répétition `B_n^p=n^p`, combinaison avec répétition
 * `\Gamma_n^p=C_{n+p-1}^{p}`, permutation avec répétitions/anagrammes), sous-types des générateurs
 * sources encore inexploités (parité et borne du dernier chiffre, complément "contient le chiffre
 * d", blocs/lettres consécutives, cartes imposées, partition complémentaire, contrainte à 2
 * catégories, détail des étapes du poker, symétrie `s ↔ 21-s` des sommes de 3 dés, bornes `k>K` et
 * `n-k>N-K` de l'hypergéométrique, symétrie de la binomiale à `p=0,5`, lien
 * `1/A_n^k` de la séquence exacte) — jamais une simple reformulation d'une affirmation déjà
 * présente dans les 20 premières. Chaque valeur numérique nouvelle a été recalculée exactement
 * (arithmétique entière/BigInt) avant rédaction de sa justification.
 *
 * Un thème par générateur déjà établi du chapitre "Analyse combinatoire" (6gen43 à 6gen48).
 * `enonce`/`justification` sont des `FragmentConsigne[]` (texte/LaTeX mêlés, jamais de `string`
 * brute), même convention que 6gen65/66/67/68/69. Notation combinatoire — convention FWB indice/
 * exposant, jamais parenthèses (corrigé après relecture, notation d'origine des générateurs sources
 * `C(n,k)`/`A(n,k)`) : `n!` pour la factorielle, `C_n^{k}` pour le coefficient binomial (choisir
 * sans ordre), `A_n^{k}` pour les arrangements (choisir ET ordonner), `\dfrac{a}{b}` pour les
 * fractions, `{,}` pour la virgule décimale À L'INTÉRIEUR d'un fragment LaTeX uniquement (jamais
 * dans un fragment texte brut — piège documenté dans la section 6gen33 de `docs/historique-6e.md`).
 *
 * Chaque thème s'appuie sur un ou plusieurs scénarios numériques fixes (recalculés et revérifiés à
 * la main ci-dessous), pour permettre des affirmations qui se répondent/se contredisent entre elles
 * sans réintroduire les mêmes chiffres à chaque question — même esprit qu'un contrôle papier
 * classique ("dans l'exercice ci-dessus...").
 */
import type { FragmentConsigne, QuestionVraiFaux, VarianteQuizCombinatoire } from "../../core6e/quizCombinatoire.types";

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const BANQUE_QUIZ_COMBINATOIRE: Record<VarianteQuizCombinatoire, QuestionVraiFaux[]> = {
  // ==========================================================================
  // Thème 1 — Dénombrement fondamental et arrangements, ref 6gen43
  // Scénarios fixes : A(8,3)=336, C(8,3)=56 ; nombres à 4/3 chiffres tous distincts (chiffres de 0 à 9, premier
  // chiffre non nul) : 4536 et 648 ; diagonales d'un polygone D(n)=n(n-3)/2, D(9)=27 ; permutations
  // circulaires n=7 (table 720, collier 360) ; plaques d'immatriculation 26²×10³=676000.
  // ==========================================================================
  denombrementFondamental: [
    {
      enonce: [
        texte("Le nombre de façons de CHOISIR ET ORDONNER 3 éléments parmi 8, noté "),
        latex("A_{8}^{3}"),
        texte(", vaut "),
        latex("8\\times7\\times6=336"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la définition d'un arrangement : à chaque étape, un élément de moins est disponible.")],
    },
    {
      enonce: [
        texte("Le nombre de façons de CHOISIR 3 éléments parmi 8 SANS tenir compte de l'ordre, "),
        latex("C_{8}^{3}"),
        texte(", vaut aussi 336, comme "),
        latex("A_{8}^{3}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Ignorer l'ordre réduit le compte : "), latex("C_{8}^{3}=56"), texte(", bien moins que "), latex("A_{8}^{3}=336"), texte(" — les deux notions sont différentes."),
      ],
    },
    {
      enonce: [latex("C_{8}^{3}=\\dfrac{A_{8}^{3}}{3!}=\\dfrac{336}{6}=56"), texte(".")],
      reponse: true,
      justification: [texte("Diviser par "), latex("3!"), texte(" retire les réordonnancements internes des 3 éléments choisis, qui ne comptent plus une fois l'ordre ignoré.")],
    },
    {
      enonce: [texte("Pour tous entiers "), latex("0\\leq p\\leq n"), texte(", on a "), latex("A_{n}^{p}=C_{n}^{p}+p!"), texte(".")],
      reponse: false,
      justification: [texte("La relation correcte est une multiplication, pas une addition : "), latex("A_{n}^{p}=C_{n}^{p}\\times p!"), texte(" (chaque groupe de "), latex("p"), texte(" éléments s'ordonne de "), latex("p!"), texte(" façons).")],
    },
    {
      enonce: [latex("0!=1"), texte(" par convention.")],
      reponse: true,
      justification: [texte("C'est la convention standard, cohérente avec "), latex("n!=n\\times(n-1)!"), texte(" prolongée jusqu'à "), latex("n=0"), texte(".")],
    },
    {
      enonce: [texte("Par convention, "), latex("0!=0"), texte(".")],
      reponse: false,
      justification: [texte("C'est faux : "), latex("0!=1"), texte(", jamais "), latex("0"), texte(".")],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 4 chiffres TOUS DISTINCTS (chiffres de 0 à 9), premier chiffre non nul, est "),
        latex("9\\times9\\times8\\times7=4536"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("9 choix pour le premier chiffre (non nul), puis 9, 8 et 7 choix pour les positions suivantes (0 redevient disponible dès la 2ᵉ position).")],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 4 chiffres tous distincts (chiffres de 0 à 9), premier chiffre non nul, vaudrait "),
        latex("10\\times9\\times8\\times7=5040"),
        texte(" si l'on tenait correctement compte de la contrainte."),
      ],
      reponse: false,
      justification: [
        texte("5040 ignore la contrainte du premier chiffre non nul (10 choix au lieu de 9) : la bonne valeur reste "),
        latex("4536"), texte(", pas "), latex("5040"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 3 chiffres TOUS DISTINCTS (chiffres de 0 à 9), premier chiffre non nul, est "),
        latex("9\\times9\\times8=648"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Même principe : 9 choix pour le premier chiffre (non nul), 9 puis 8 pour les 2 positions suivantes.")],
    },
    {
      enonce: [texte("Le nombre de nombres à 3 chiffres tous distincts (chiffres de 0 à 9, premier chiffre non nul) vaut "), latex("9\\times8\\times7=504"), texte(", car le chiffre 0 ne peut figurer à aucune position.")],
      reponse: false,
      justification: [texte("Seul le premier chiffre doit être non nul : 0 reste permis aux 2ᵉ et 3ᵉ positions. La bonne valeur est "), latex("9\\times9\\times8=648"), texte(" ; "), latex("504"), texte(" compte les nombres de 3 chiffres distincts SANS aucun 0.")],
    },
    {
      enonce: [
        latex("D(n)=\\dfrac{n(n-3)}{2}"),
        texte(" donne le nombre de diagonales d'un polygone convexe à "), latex("n"), texte(" côtés ; pour "), latex("n=9"), texte(", "), latex("D(9)=27"), texte("."),
      ],
      reponse: true,
      justification: [latex("D(9)=\\dfrac{9\\times6}{2}=\\dfrac{54}{2}=27"), texte(".")],
    },
    {
      enonce: [
        texte("Le nombre de diagonales d'un polygone à "), latex("n"), texte(" côtés est donné par "), latex("\\dfrac{n(n-1)}{2}"),
        texte(", exactement comme le nombre total de segments reliant 2 sommets quelconques (côtés ET diagonales confondus)."),
      ],
      reponse: false,
      justification: [
        texte("Cette formule ("), latex("\\dfrac{n(n-1)}{2}=C_{n}^{2}"), texte(") compte TOUS les segments, côtés compris — pour n'avoir QUE les diagonales, il faut retirer les "),
        latex("n"), texte(" côtés : "), latex("\\dfrac{n(n-1)}{2}-n=\\dfrac{n(n-3)}{2}"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour retrouver le nombre "), latex("n"), texte(" de côtés d'un polygone à 27 diagonales, on résout "), latex("\\dfrac{n(n-3)}{2}=27"), texte(", c'est-à-dire "), latex("n^2-3n-54=0"), texte(", dont les racines sont "), latex("9"), texte(" et "), latex("-6"), texte(" : le polygone a 9 côtés.")],
      reponse: true,
      justification: [texte("On multiplie par 2 l'égalité "), latex("\\dfrac{n(n-3)}{2}=27"), texte(" ; des deux racines, seule "), latex("n=9"), texte(" est un nombre de côtés (vérification : "), latex("D(9)=\\dfrac{9\\times6}{2}=27"), texte(").")],
    },
    {
      enonce: [
        texte("Pour retrouver le nombre "),
        latex("n"),
        texte(" de côtés d'un polygone convexe à "),
        latex("D=27"),
        texte(" diagonales, l'équation "),
        latex("n^2-3n-54=0"),
        texte(" admet aussi "),
        latex("n=-6"),
        texte(" comme solution valable pour le nombre de côtés du polygone."),
      ],
      reponse: false,
      justification: [
        texte("Algébriquement, "), latex("n=-6"), texte(" est bien une racine de l'équation, mais un nombre de côtés ne peut jamais être négatif : seule la racine positive "),
        latex("n=9"), texte(" a un sens géométrique."),
      ],
    },
    {
      enonce: [
        texte("Pour 7 personnes disposées autour d'une table circulaire (seules les rotations sont considérées équivalentes), il y a "),
        latex("(7-1)!=720"),
        texte(" dispositions distinctes."),
      ],
      reponse: true,
      justification: [texte("Fixer une personne comme référence élimine les rotations équivalentes : il reste "), latex("6!=720"), texte(" façons de placer les 6 autres.")],
    },
    {
      enonce: [
        texte("Pour 7 personnes disposées en COLLIER (rotations ET réflexions équivalentes), il y a "),
        latex("720"),
        texte(" dispositions distinctes, comme autour d'une table circulaire, car un collier revient exactement au même dénombrement qu'une table."),
      ],
      reponse: false,
      justification: [
        texte("Un collier identifie en plus les réflexions (sens de lecture) : il faut diviser par 2, soit "), latex("\\dfrac{720}{2}=360"), texte(", pas "), latex("720"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour un collier de 7 perles distinctes, il y a "), latex("\\dfrac{(7-1)!}{2}=360"),
        texte(" dispositions distinctes, car chaque disposition est comptée deux fois (une fois pour chaque sens de lecture du collier)."),
      ],
      reponse: true,
      justification: [texte("C'est exactement la justification de la division par 2 : rotation ET réflexion sont toutes deux considérées équivalentes pour un collier.")],
    },
    {
      enonce: [texte("Pour un collier de 8 perles distinctes, il y a "), latex("(8-1)!=5040"), texte(" dispositions distinctes (comme pour une table).")],
      reponse: false,
      justification: [
        texte("5040 est la valeur pour une TABLE (rotations seules). Pour un collier, il faut diviser par 2 : "), latex("\\dfrac{5040}{2}=2520"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour une plaque d'immatriculation à 2 lettres (parmi 26, répétitions autorisées) suivies de 3 chiffres (parmi 10, répétitions autorisées), il y a "),
        latex("26^2\\times10^3=676\\,000"),
        texte(" plaques possibles."),
      ],
      reponse: true,
      justification: [texte("Principe multiplicatif : "), latex("26\\times26=676"), texte(" combinaisons de lettres, "), latex("10\\times10\\times10=1000"), texte(" de chiffres, soit "), latex("676\\times1000=676\\,000"), texte(".")],
    },
    {
      enonce: [
        texte("Pour une plaque d'immatriculation à 2 lettres (parmi 26) suivies de 3 chiffres (parmi 10), si l'on impose que les 2 lettres soient DIFFÉRENTES (chiffres toujours libres de se répéter), le nombre total de plaques passe à "),
        latex("25\\times25\\times10^3=625\\,000"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Il faut "), latex("26"), texte(" choix pour la première lettre puis "), latex("25"), texte(" pour la seconde (différente de la première), soit "),
        latex("26\\times25\\times1000=650\\,000"), texte(", pas "), latex("625\\,000"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec les 6 chiffres 1, 2, 5, 7, 8 et 9, on peut écrire "),
        latex("6^4=1296"),
        texte(" nombres à 4 chiffres si la répétition d'un même chiffre est AUTORISÉE, contre seulement "),
        latex("A_{6}^{4}=6\\times5\\times4\\times3=360"),
        texte(" si elle est interdite."),
      ],
      reponse: true,
      justification: [
        texte("Avec répétition, chaque position dispose toujours des 6 chiffres ("), latex("6^4"),
        texte(") ; sans répétition, le pool perd un chiffre à chaque position ("), latex("6\\times5\\times4\\times3"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Pour écrire des nombres à 4 chiffres avec les 6 chiffres 1, 2, 5, 7, 8 et 9, autoriser la répétition ne peut que FAIRE DIMINUER le dénombrement, puisqu'il faut ensuite retirer toutes les écritures contenant deux fois le même chiffre."),
      ],
      reponse: false,
      justification: [
        texte("Autoriser la répétition ne retire rien du tout : chaque position dispose d'au moins autant de choix qu'avant, et strictement plus dès la 2ᵉ — d'où "),
        latex("1296>360"), texte(", jamais l'inverse."),
      ],
    },
    {
      enonce: [
        texte("Avec les 4 lettres A, E, M et R, toutes distinctes et TOUTES utilisées, on peut former "),
        latex("P_{4}=4!=24"),
        texte(" \"mots\" différents (sans exiger qu'ils aient un sens)."),
      ],
      reponse: true,
      justification: [texte("Une permutation simple de "), latex("p"), texte(" éléments distincts vaut "), latex("p!"), texte(" : ici "), latex("4\\times3\\times2\\times1=24"), texte(".")],
    },
    {
      enonce: [texte("La permutation simple exige une formule à part : poser "), latex("p=n"), texte(" dans "), latex("A_{n}^{p}=\\dfrac{n!}{(n-p)!}"), texte(" donnerait "), latex("\\dfrac{n!}{0!}"), texte(", une expression qui n'a pas de sens.")],
      reponse: false,
      justification: [latex("0!=1"), texte(" par convention, donc "), latex("A_{n}^{n}=\\dfrac{n!}{0!}=n!=P_{n}"), texte(" : la permutation simple est exactement le cas "), latex("p=n"), texte(" de l'arrangement.")],
    },
    {
      enonce: [
        texte("Le nombre de groupes de 3 lettres choisies parmi 5, répétition AUTORISÉE et ordre IGNORÉ, vaut "),
        latex("\\Gamma_{5}^{3}=C_{5+3-1}^{3}=C_{7}^{3}=35"),
        texte("."),
      ],
      reponse: true,
      justification: [
        texte("Vérification par décomposition selon le nombre de lettres distinctes : "),
        latex("C_{5}^{3}+2\\times C_{5}^{2}+C_{5}^{1}=10+20+5=35"), texte(", même valeur."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de groupes de 3 lettres choisies parmi 5, répétition autorisée et ordre ignoré, vaut "),
        latex("C_{5}^{3}=10"),
        texte(", la répétition ne changeant rien tant que l'ordre est ignoré."),
      ],
      reponse: false,
      justification: [
        latex("C_{5}^{3}=10"), texte(" est le compte SANS répétition ; avec répétition il faut "), latex("\\Gamma_{5}^{3}=C_{7}^{3}=35"),
        texte(" — bien plus grand, jamais interchangeable avec "), latex("C_{5}^{3}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 5 chiffres TOUS DISTINCTS (chiffres de 0 à 9), premier chiffre non nul, est "),
        latex("9\\times9\\times8\\times7\\times6=27\\,216"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Même principe qu'à 4 chiffres, avec une position de plus : 9 choix pour le premier chiffre, puis 9, 8, 7 et 6 pour les suivantes.")],
    },
    {
      enonce: [texte("Pour compter les nombres de 4 chiffres tous distincts et pairs, il est inutile de séparer des cas : 5 choix pour le dernier chiffre (0, 2, 4, 6 ou 8), puis 9, 8 et 7 choix pour les autres positions.")],
      reponse: false,
      justification: [texte("Le nombre de choix du premier chiffre dépend du dernier : 9 si le dernier chiffre est 0, mais 8 seulement s'il est 2, 4, 6 ou 8 (le premier ne peut être ni 0 ni le dernier). Il faut séparer les deux cas, puis additionner.")],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 4 chiffres TOUS DISTINCTS se terminant par 0 est "), latex("9\\times8\\times7=504"),
        texte(" (le dernier chiffre est imposé, le premier a 9 choix, puis 8 et 7)."),
      ],
      reponse: true,
      justification: [texte("Le 0 étant consommé par la dernière position, le premier chiffre peut prendre n'importe lequel des 9 chiffres non nuls restants, puis 8 et 7 pour les 2 positions du milieu.")],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 4 chiffres TOUS DISTINCTS ne contenant PAS le chiffre 0 vaut "), latex("8\\times8\\times7\\times6=2688"),
        texte(", exactement comme pour n'importe quel autre chiffre exclu."),
      ],
      reponse: false,
      justification: [
        texte("Exclure 0 est le seul cas où le premier chiffre ne perd rien (il excluait déjà 0) : "), latex("9\\times8\\times7\\times6=3024"),
        texte(". La valeur "), latex("2688"), texte(" vaut pour tout chiffre exclu NON NUL, jamais pour 0."),
      ],
    },
    {
      enonce: [
        texte("Parmi les 4536 nombres à 4 chiffres tous distincts, ceux qui CONTIENNENT le chiffre 7 sont au nombre de "),
        latex("4536-2688=1848"),
        texte(", obtenus en retirant du total les 2688 qui ne le contiennent pas."),
      ],
      reponse: true,
      justification: [
        texte("Passer par le complément est la technique attendue : "), latex("8\\times8\\times7\\times6=2688"),
        texte(" nombres sans aucun 7, d'où "), latex("4536-2688=1848"), texte(" nombres en contenant au moins un."),
      ],
    },
    {
      enonce: [
        texte("Pour ranger sur une étagère 3 groupes de livres (2, 3 et 4 livres) en gardant chaque groupe RASSEMBLÉ, il y a "),
        latex("3!\\times2!\\times3!\\times4!=6\\times2\\times6\\times24=1728"),
        texte(" rangements possibles."),
      ],
      reponse: true,
      justification: [
        texte("Chaque groupe compte pour UNE unité : "), latex("3!"), texte(" façons d'ordonner les 3 blocs, multipliées par les ordres internes de chaque groupe ("),
        latex("2!"), texte(", "), latex("3!"), texte(" et "), latex("4!"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Dans un mot de 7 lettres toutes différentes, imposer que 3 lettres précises restent consécutives DANS UN ORDRE IMPOSÉ laisse "),
        latex("5!\\times3!=720"),
        texte(" mots possibles."),
      ],
      reponse: false,
      justification: [
        texte("Un ordre IMPOSÉ à l'intérieur du bloc ne laisse qu'UN seul arrangement interne : "), latex("5!\\times1=120"),
        texte(". La valeur "), latex("5!\\times3!=720"), texte(" correspond au cas où l'ordre interne des 3 lettres est LIBRE."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de mains de 5 cartes, dans un jeu de 52, contenant OBLIGATOIREMENT 2 cartes précises fixées à l'avance est "),
        latex("C_{50}^{3}=19\\,600"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Les 2 cartes imposées occupent 2 places d'office ; il reste à choisir 3 cartes parmi les 50 autres, sans ordre.")],
    },
    {
      enonce: [
        texte("Pour 8 personnes disposées autour d'une table circulaire (rotations équivalentes), il y a "), latex("8!=40\\,320"),
        texte(" dispositions distinctes."),
      ],
      reponse: false,
      justification: [
        texte("Fixer une personne de référence élimine les rotations équivalentes : "), latex("(8-1)!=7!=5040"), texte(" dispositions, pas "), latex("40\\,320"), texte("."),
      ],
    },
  ],

  // ==========================================================================
  // Thème 2 — Dénombrement combiné et sélections contraintes, ref 6gen44
  // Scénarios fixes : multinomiale 10 personnes en groupes 5-3-2 (2520) ; président + 2 vice-
  // présidents parmi 10 (360) ; 2 groupes indépendants 8/6 choisir 2 chacun (420) ; choix exclusif
  // dans un groupe de 10 OU de 15, k=3 (575) ; dominos à 6 valeurs (21) ; 2 dés à 6 faces
  // discernables/indiscernables (36 / 21) ; 20 personnes, X et Y exclus ensemble ou indissociables
  // (35700 / 21624).
  // ==========================================================================
  denombrementCombine: [
    {
      enonce: [
        texte("10 personnes sont réparties en 3 groupes nommés de tailles 5, 3 et 2. Le nombre de répartitions possibles est "),
        latex("\\dfrac{10!}{5!\\times3!\\times2!}=2520"),
        texte("."),
      ],
      reponse: true,
      justification: [latex("\\dfrac{3\\,628\\,800}{120\\times6\\times2}=\\dfrac{3\\,628\\,800}{1440}=2520"), texte(".")],
    },
    {
      enonce: [
        texte("Pour répartir 10 personnes en 3 groupes nommés de tailles 5, 3 et 2, il suffirait de calculer "),
        latex("C_{10}^{5}\\times C_{10}^{3}\\times C_{10}^{2}"),
        texte(" plutôt que d'utiliser les tailles restantes à chaque étape."),
      ],
      reponse: false,
      justification: [
        texte("Chaque étape doit puiser dans le nombre de personnes RESTANTES (10, puis 5, puis 2), soit "), latex("C_{10}^{5}\\times C_{5}^{3}\\times C_{2}^{2}"),
        texte(" — répéter "), latex("10"), texte(" à chaque fois compterait plusieurs fois les mêmes personnes."),
      ],
    },
    {
      enonce: [
        texte("Pour élire un président et 2 vice-présidents (les 2 vice-présidents étant interchangeables entre eux) parmi 10 candidats, il y a "),
        latex("10\\times C_{9}^{2}=360"),
        texte(" façons."),
      ],
      reponse: true,
      justification: [texte("10 choix pour le président, puis "), latex("C_{9}^{2}=36"), texte(" façons de choisir les 2 vice-présidents (sans ordre) parmi les 9 restants : "), latex("10\\times36=360"), texte(".")],
    },
    {
      enonce: [
        texte("Le nombre de façons d'élire un président et 2 vice-présidents (interchangeables entre eux) parmi 10 candidats pourrait s'écrire "),
        latex("C_{10}^{3}"),
        texte(", puisqu'on choisit 3 personnes au total parmi 10."),
      ],
      reponse: false,
      justification: [
        latex("C_{10}^{3}=120"), texte(", très différent de "), latex("360"), texte(" : le président a un RÔLE DISTINCT des vice-présidents, "), latex("C_{10}^{3}"),
        texte(" ignore complètement cette distinction de rôle."),
      ],
    },
    {
      enonce: [
        texte("Un comité est formé de 2 personnes choisies parmi 8 hommes ET, indépendamment, 2 personnes choisies parmi 6 femmes : "),
        latex("C_{8}^{2}\\times C_{6}^{2}=28\\times15=420"),
        texte(" façons."),
      ],
      reponse: true,
      justification: [texte("Les deux choix étant indépendants, on MULTIPLIE le nombre de façons pour chacun : "), latex("28\\times15=420"), texte(".")],
    },
    {
      enonce: [
        texte("Un comité de 2 personnes choisies parmi 8 hommes et, indépendamment, de 2 personnes choisies parmi 6 femmes peut se former de "),
        latex("C_{8}^{2}+C_{6}^{2}=28+15=43"),
        texte(" façons, puisque les deux choix sont indépendants."),
      ],
      reponse: false,
      justification: [
        texte("Un ET entre deux choix INDÉPENDANTS se traduit par une MULTIPLICATION, jamais une addition : la bonne valeur est "), latex("420"), texte(", pas "), latex("43"), texte("."),
      ],
    },
    {
      enonce: [
        texte("On choisit 3 personnes, TOUTES parmi le même groupe (soit les 3 parmi un groupe de 10, soit les 3 parmi un groupe de 15, jamais un mélange des deux) : "),
        latex("C_{10}^{3}+C_{15}^{3}=120+455=575"),
        texte(" façons."),
      ],
      reponse: true,
      justification: [texte("Un OU exclusif entre 2 cas qui ne se recouvrent jamais s'additionne : "), latex("120+455=575"), texte(".")],
    },
    {
      enonce: [
        texte("Pour choisir 3 personnes toutes dans le même groupe (soit les 3 parmi un groupe de 10, soit les 3 parmi un groupe de 15), il y a "),
        latex("C_{10}^{3}\\times C_{15}^{3}=120\\times455=54\\,600"),
        texte(" façons, car il faut combiner les deux choix."),
      ],
      reponse: false,
      justification: [
        texte("Il s'agit d'un OU exclusif (jamais les deux groupes en même temps), donc une ADDITION, pas une multiplication : la bonne valeur reste "),
        latex("575"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec 6 valeurs possibles (comme les faces d'un domino), le nombre de dominos distincts (2 valeurs choisies avec répétition possible, sans tenir compte de l'ordre) est "),
        latex("C_{6}^{2}+6=15+6=21"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("15 dominos à 2 valeurs différentes ("), latex("C_{6}^{2}"), texte(") plus 6 dominos \"doubles\" (0-0, 1-1, ..., 5-5) : "), latex("15+6=21"), texte(".")],
    },
    {
      enonce: [
        texte("Avec 6 valeurs possibles par face, le nombre de dominos distincts (2 valeurs, répétition possible, ordre ignoré) se réduit aux "),
        latex("C_{6}^{2}=15"),
        texte(" façons de choisir 2 valeurs différentes, sans qu'il faille ajouter les dominos \"doubles\" (0-0, 1-1, etc.) séparément."),
      ],
      reponse: false,
      justification: [
        latex("C_{6}^{2}=15"), texte(" oublie les 6 dominos doubles (mêmes valeurs des 2 côtés) : il FAUT les ajouter séparément pour obtenir le total "),
        latex("21"), texte("."),
      ],
    },
    {
      enonce: [
        texte("En lançant 2 dés à 6 faces DISCERNABLES (par exemple de couleurs différentes), il y a "), latex("6^2=36"),
        texte(" résultats ordonnés possibles."),
      ],
      reponse: true,
      justification: [texte("Chaque dé a 6 issues possibles, indépendamment l'un de l'autre, avec les dés distinguables l'ordre (rouge, bleu) compte : "), latex("6\\times6=36"), texte(".")],
    },
    {
      enonce: [
        texte("En lançant 2 dés à 6 faces INDISCERNABLES (impossible de dire lequel est lequel), il y a "),
        latex("36"),
        texte(" résultats distincts possibles, comme avec des dés discernables, car le nombre de dés ne change pas."),
      ],
      reponse: false,
      justification: [
        texte("Rendre les dés indiscernables fusionne les paires symétriques (ex. \"3 puis 5\" et \"5 puis 3\" deviennent le même résultat) : le vrai compte tombe à "),
        latex("C_{7}^{2}=21"), texte(", pas "), latex("36"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de résultats DISCERNABLES (36) est strictement supérieur au nombre de résultats INDISCERNABLES (21) pour 2 dés à 6 faces, car regrouper les cas symétriques réduit le décompte total."),
      ],
      reponse: true,
      justification: [texte("36 > 21 : fusionner chaque paire symétrique distincte (ex. \"2 puis 5\"/\"5 puis 2\") en un seul résultat indiscernable diminue nécessairement le total.")],
    },
    {
      enonce: [
        texte("Pour 2 dés à 6 faces, le rapport entre le nombre de résultats discernables (36) et le nombre de résultats indiscernables (21) est exactement 2, comme si chaque résultat indiscernable correspondait toujours à exactement 2 résultats discernables."),
      ],
      reponse: false,
      justification: [
        latex("\\dfrac{36}{21}=\\dfrac{12}{7}\\approx1{,}71"), texte(", pas "), latex("2"), texte(" : les 6 doubles (1-1, 2-2, ...) correspondent chacun à UN SEUL résultat discernable, alors que les paires de valeurs différentes en correspondent à DEUX — le rapport n'est donc pas uniforme."),
      ],
    },
    {
      enonce: [texte("On choisit 6 personnes parmi 20, dont X et Y qui ne peuvent jamais être choisis ensemble. Le nombre de choix valides s'écrit "), latex("C_{20}^{6}-C_{18}^{4}"), texte(".")],
      reponse: true,
      justification: [texte("Du total sans contrainte ("), latex("C_{20}^{6}"), texte("), on retire les choix où X et Y sont tous les deux présents : il reste alors 4 places parmi les 18 autres personnes ("), latex("C_{18}^{4}"), texte(").")],
    },
    {
      enonce: [
        texte("Pour choisir 6 personnes parmi 20 sans que 2 personnes précises X et Y soient jamais choisies ensemble, il suffit d'ADDITIONNER "),
        latex("C_{18}^{4}"),
        texte(" à "),
        latex("C_{20}^{6}"),
        texte(" plutôt que de le soustraire, pour ne pas exclure les cas interdits."),
      ],
      reponse: false,
      justification: [
        texte("Il faut au contraire RETIRER les cas interdits (X et Y ensemble) du total, donc SOUSTRAIRE : "), latex("C_{20}^{6}-C_{18}^{4}"), texte(", jamais additionner."),
      ],
    },
    {
      enonce: [texte("On choisit 6 personnes parmi 20, dont X et Y qui doivent être choisis ensemble ou pas du tout. Le nombre de choix valides s'écrit "), latex("C_{18}^{4}+C_{18}^{6}"), texte(".")],
      reponse: true,
      justification: [texte("Deux cas disjoints : X et Y présents (4 places parmi les 18 autres, "), latex("C_{18}^{4}"), texte(") ou X et Y absents (6 places parmi les 18 autres, "), latex("C_{18}^{6}"), texte(") ; on additionne.")],
    },
    {
      enonce: [texte("Pour choisir 6 personnes parmi 20, la contrainte « X et Y ensemble ou absents tous les deux » donne le même nombre de choix que la contrainte opposée « X et Y jamais ensemble ».")],
      reponse: false,
      justification: [texte("Ce sont deux contraintes différentes qui donnent deux nombres différents : "), latex("C_{18}^{4}+C_{18}^{6}"), texte(" d'un côté, "), latex("C_{20}^{6}-C_{18}^{4}"), texte(" de l'autre (21 624 contre 35 700).")],
    },
    {
      enonce: [texte("Le coefficient "), latex("C_{20}^{6}"), texte(" vaut aussi "), latex("C_{20}^{14}"), texte(", par la symétrie "), latex("C_{n}^{p}=C_{n}^{n-p}"), texte(".")],
      reponse: true,
      justification: [texte("Choisir 6 personnes parmi 20 revient à en laisser 14 de côté : les deux dénombrements sont égaux.")],
    },
    {
      enonce: [
        texte("Pour choisir 6 personnes parmi 20, "),
        latex("C_{20}^{6}=C_{20}^{6}\\times2"),
        texte(", car on pourrait choisir les 6 personnes OU les 14 personnes restantes, ce qui doublerait le compte."),
      ],
      reponse: false,
      justification: [
        texte("Choisir les 6 ou choisir les 14 restantes désigne LA MÊME sélection (un même groupe de 6 personnes détermine entièrement les 14 laissées de côté) : il n'y a rien à doubler, "),
        latex("C_{20}^{6}=C_{20}^{14}"), texte(", pas le double de lui-même."),
      ],
    },
    {
      enonce: [texte("Le mot MISSISSIPPI compte 11 lettres (1 M, 4 I, 4 S, 2 P) : le nombre de permutations distinctes de ces lettres s'écrit "), latex("\\dfrac{11!}{4!\\times4!\\times2!}"), texte(".")],
      reponse: true,
      justification: [texte("On divise "), latex("11!"), texte(" par les factorielles des effectifs répétés ("), latex("4!"), texte(" pour les I, "), latex("4!"), texte(" pour les S, "), latex("2!"), texte(" pour les P) : les réordonnancements de lettres identiques ne produisent aucun mot nouveau.")],
    },
    {
      enonce: [texte("Le nombre de permutations distinctes des 11 lettres de MISSISSIPPI (1 M, 4 I, 4 S, 2 P) s'écrit "), latex("\\dfrac{11!}{4!+4!+2!}"), texte(", en additionnant les factorielles des effectifs répétés.")],
      reponse: false,
      justification: [texte("On divise par le PRODUIT des factorielles, jamais par leur somme : "), latex("\\dfrac{11!}{4!\\times4!\\times2!}"), texte(".")],
    },
    {
      enonce: [texte("Le mot MISSISSIPPI admet 34 650 permutations distinctes de ses lettres ; il a donc 34 650 anagrammes, c'est-à-dire 34 650 mots différents du mot de départ.")],
      reponse: false,
      justification: [texte("Parmi les 34 650 permutations figure le mot MISSISSIPPI lui-même : les mots différents du mot de départ sont "), latex("34\\,650-1=34\\,649"), texte(".")],
    },
    {
      enonce: [
        texte("Le mot BALLON (6 lettres, dont 2 L identiques) admet "), latex("\\dfrac{6!}{2!}=360"),
        texte(" permutations distinctes de ses lettres."),
      ],
      reponse: true,
      justification: [
        latex("\\dfrac{720}{2}=360"), texte(" : seules les 2 lettres L sont interchangeables entre elles, d'où une unique division par "), latex("2!"), texte("."),
      ],
    },
    {
      enonce: [texte("Si les 11 lettres de MISSISSIPPI étaient toutes différentes, le nombre de permutations distinctes resterait le même : la formule ne dépend que du nombre total de lettres.")],
      reponse: false,
      justification: [texte("Sans lettre répétée, tous les dénominateurs valent "), latex("1!"), texte(" et la formule redonne "), latex("11!"), texte(", bien plus grand : diviser par "), latex("4!\\times4!\\times2!"), texte(" vient justement des lettres répétées.")],
    },
    {
      enonce: [texte("12 personnes réparties en 3 groupes nommés de tailles 3, 4 et 5 : le nombre de répartitions "), latex("\\dfrac{12!}{3!\\times4!\\times5!}"), texte(" s'écrit aussi "), latex("C_{12}^{3}\\times C_{9}^{4}\\times C_{5}^{5}"), texte(".")],
      reponse: true,
      justification: [texte("Chaque facteur puise dans les personnes restantes (12, puis 9, puis 5) : les deux écritures de la multinomiale coïncident toujours.")],
    },
    {
      enonce: [
        texte("Pour élire un président et 3 vice-présidents (interchangeables entre eux) parmi 12 candidats, il y a "),
        latex("C_{12}^{4}=495"),
        texte(" façons."),
      ],
      reponse: false,
      justification: [
        latex("C_{12}^{4}"), texte(" ignore le rôle DISTINCT du président. Il faut le choisir à part : "),
        latex("12\\times C_{11}^{3}=12\\times165=1980"), texte(", soit 4 fois plus."),
      ],
    },
    {
      enonce: [
        texte("Un bureau de 1 président et 3 vice-présidents (interchangeables entre eux) choisis parmi 12 candidats se compte "),
        latex("12\\times C_{11}^{3}=12\\times165=1980"),
        texte(" : le président d'abord, puis les 3 vice-présidents parmi les 11 restants."),
      ],
      reponse: true,
      justification: [texte("Le rôle particulier se choisit toujours À PART, le reste par une combinaison ordinaire sur les candidats restants.")],
    },
    {
      enonce: [
        texte("Pour partager 12 personnes en 2 groupes complémentaires, l'un de 5 personnes et l'autre de 7, il suffit de calculer "),
        latex("C_{12}^{5}=792"),
        texte(" : le second groupe est entièrement déterminé par le premier."),
      ],
      reponse: true,
      justification: [texte("Choisir les 5 revient à laisser les 7 autres de côté ; il n'y a aucun second choix à faire, le complémentaire étant imposé.")],
    },
    {
      enonce: [
        texte("Pour partager 12 personnes en 2 groupes complémentaires, l'un de 5 et l'autre de 7, il faut doubler le résultat ("),
        latex("2\\times792=1584"),
        texte("), les 2 groupes pouvant s'échanger."),
      ],
      reponse: false,
      justification: [
        texte("Les 2 groupes ont des tailles DIFFÉRENTES (5 et 7) : ils ne peuvent jamais s'échanger, aucun partage n'est compté deux fois. La réponse reste "),
        latex("792"), texte("."),
      ],
    },
    {
      enonce: [texte("Avec 10 valeurs possibles par moitié, le nombre de dominos distincts vaut "), latex("C_{10}^{2}+10"), texte(", ce qui est aussi "), latex("C_{11}^{2}"), texte(".")],
      reponse: true,
      justification: [texte("Les dominos à 2 valeurs différentes ("), latex("C_{10}^{2}"), texte(") plus les 10 doubles ; et "), latex("C_{n}^{2}+n=C_{n+1}^{2}"), texte(" (c'est "), latex("\\Gamma_{10}^{2}"), texte(").")],
    },
    {
      enonce: [
        texte("En lançant 2 dés à 4 faces INDISCERNABLES, il y a "), latex("C_{4}^{2}=6"), texte(" résultats distincts possibles."),
      ],
      reponse: false,
      justification: [
        latex("C_{4}^{2}=6"), texte(" oublie les 4 doubles (1-1, 2-2, 3-3, 4-4) : le compte correct est "),
        latex("C_{4}^{2}+4=C_{5}^{2}=10"), texte(" résultats."),
      ],
    },
    {
      enonce: [texte("On choisit 5 personnes parmi 15, dont X et Y qui ne peuvent jamais être choisis ensemble : le nombre de sélections valides s'écrit "), latex("C_{15}^{5}-C_{13}^{3}"), texte(".")],
      reponse: true,
      justification: [texte("Total sans contrainte moins les sélections interdites, où X et Y sont tous deux présents (les 3 places restantes sont prises parmi les 13 autres).")],
    },
    {
      enonce: [texte("On choisit 5 personnes parmi 15, dont X et Y qui doivent être pris ensemble ou pas du tout : le nombre de sélections valides s'écrit "), latex("C_{13}^{3}+C_{13}^{5}"), texte(".")],
      reponse: true,
      justification: [texte("Deux cas disjoints à additionner : les 2 présents (3 places parmi les 13 autres) ou les 2 absents (5 places parmi les 13 autres).")],
    },
    {
      enonce: [texte("On choisit 5 personnes parmi 15, dont X et Y qui ne peuvent jamais être choisis ensemble. Si l'on précise que les 15 personnes sont 6 juniors et 9 seniors, X et Y étant juniors, le calcul « "), latex("C_{15}^{5}-C_{13}^{3}"), texte(" » ne convient plus.")],
      reponse: false,
      justification: [texte("Tant que la sélection reste libre parmi les 15 personnes, la répartition en catégories ne change rien au comptage : c'est toujours "), latex("C_{15}^{5}-C_{13}^{3}"), texte(".")],
    },
  ],

  // ==========================================================================
  // Thème 3 — Binôme de Newton, ref 6gen45
  // Scénario fixe : développement de (2x-1)^5 (a=2, b=-1, n=5). Termes k=0..5 :
  // 32, -80, 80, -40, 10, -1 (somme = 1 = (2-1)^5). Plus : Pascal C(5,2)=C(4,1)+C(4,2)=10,
  // symétrie C(5,2)=C(5,3)=10, somme de ligne 2^5=32, approximation (1+0,01)^4≈1,04.
  // ==========================================================================
  binomeNewton: [
    {
      enonce: [
        texte("Dans le développement de "), latex("(2x-1)^5"), texte(", le terme général s'écrit "), latex("T_{k+1}=C_{5}^{k}\\times(2x)^{5-k}\\times(-1)^k"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la formule du binôme de Newton appliquée à "), latex("a=2x"), texte(" et "), latex("b=-1"), texte(" : "), latex("(a+b)^n=\\sum C_{n}^{k}a^{n-k}b^k"), texte(".")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(2x-1)^5"), texte(", en notant comme le cours "), latex("T_{k+1}"), texte(" le terme de rang "), latex("k+1"), texte(", on a "), latex("T_{k+1}=C_{5}^{k}\\times(2x)^k\\times(-1)^{5-k}"), texte(".")],
      reponse: false,
      justification: [texte("Avec la convention du cours, "), latex("T_{k+1}=C_{n}^{k}a^{n-k}b^k"), texte(" : c'est "), latex("(2x)"), texte(" qui porte l'exposant "), latex("5-k"), texte(" et "), latex("(-1)"), texte(" l'exposant "), latex("k"), texte(". L'écriture proposée correspond à une autre numérotation des termes.")],
    },
    {
      enonce: [texte("Le coefficient du premier terme du développement de "), latex("(2x-1)^5"), texte(" ("), latex("k=0"), texte(") vaut "), latex("C_{5}^{0}\\times2^5\\times(-1)^0=32"), texte(".")],
      reponse: true,
      justification: [latex("C_{5}^{0}=1"), texte(", "), latex("2^5=32"), texte(", "), latex("(-1)^0=1"), texte(" : le premier terme est "), latex("32x^5"), texte(", de coefficient 32.")],
    },
    {
      enonce: [texte("Le coefficient du premier terme du développement de "), latex("(2x-1)^5"), texte(" ("), latex("k=0"), texte(") vaut "), latex("-32"), texte(", car "), latex("(-1)^0=-1"), texte(".")],
      reponse: false,
      justification: [latex("(-1)^0=1"), texte(", pas "), latex("-1"), texte(" : tout nombre non nul élevé à la puissance 0 vaut 1. Le coefficient vaut donc "), latex("+32"), texte(".")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(2x-1)^5"), texte(", le coefficient du terme pour "), latex("k=1"), texte(" vaut "), latex("C_{5}^{1}\\times2^4\\times(-1)^1=-80"), texte(".")],
      reponse: true,
      justification: [latex("5\\times16=80"), texte(", puis "), latex("\\times(-1)"), texte(" : le terme est "), latex("-80x^4"), texte(".")],
    },
    {
      enonce: [texte("Dans le développement de "), latex("(2x-1)^5"), texte(", le coefficient du terme pour "), latex("k=1"), texte(" vaut "), latex("+80"), texte(", car un exposant impair de "), latex("(-1)"), texte(" donne un résultat positif.")],
      reponse: false,
      justification: [texte("C'est l'inverse : un exposant impair de "), latex("-1"), texte(" donne "), latex("-1"), texte(" ("), latex("(-1)^1=-1"), texte("), un exposant pair donne "), latex("+1"), texte(". Le coefficient vaut "), latex("-80"), texte(".")],
    },
    {
      enonce: [
        texte("La somme de tous les termes du développement de "), latex("(2x-1)^5"), texte(", évaluée en "), latex("x=1"), texte(", vaut "),
        latex("(2\\times1-1)^5=1^5=1"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le développement redonne exactement l'expression d'origine : évaluer en "), latex("x=1"), texte(" équivaut à calculer "), latex("(2-1)^5=1"), texte(" directement.")],
    },
    {
      enonce: [
        texte("La somme de tous les termes du développement de "),
        latex("(2x-1)^5"),
        texte(", évaluée en "),
        latex("x=1"),
        texte(", vaut plutôt "),
        latex("2^5-1^5=31"),
        texte(", car il faudrait soustraire les deux puissances séparément avant de les combiner."),
      ],
      reponse: false,
      justification: [
        texte("On ne peut jamais séparer "), latex("(a-b)^n"), texte(" en "), latex("a^n-b^n"), texte(" — c'est un piège classique. La bonne valeur, "), latex("(2-1)^5=1"), texte(", vient du calcul direct de la base."),
      ],
    },
    {
      enonce: [texte("Les coefficients binomiaux de la ligne "), latex("n=5"), texte(" sont symétriques : "), latex("C_{5}^{2}=C_{5}^{3}=10"), texte(".")],
      reponse: true,
      justification: [texte("Par symétrie "), latex("C_{n}^{k}=C_{n}^{n-k}"), texte(" : "), latex("C_{5}^{2}=C_{5}^{3}=10"), texte(" (ligne "), latex("1,5,10,10,5,1"), texte(").")],
    },
    {
      enonce: [
        texte("Les coefficients binomiaux de la ligne "),
        latex("n=5"),
        texte(" vérifient "),
        latex("C_{5}^{2}=C_{5}^{4}"),
        texte(", tous deux égaux à "),
        latex("10"),
        texte("."),
      ],
      reponse: false,
      justification: [latex("C_{5}^{4}=5"), texte(", pas "), latex("10"), texte(" : la symétrie correcte est "), latex("C_{5}^{2}=C_{5}^{3}"), texte(" (car "), latex("5-2=3"), texte(", pas "), latex("4"), texte(").")],
    },
    {
      enonce: [texte("Le triangle de Pascal vérifie "), latex("C_{5}^{2}=C_{4}^{1}+C_{4}^{2}=4+6=10"), texte(".")],
      reponse: true,
      justification: [texte("C'est la relation de Pascal, la ligne "), latex("n=5"), texte(" se construit en additionnant deux termes consécutifs de la ligne "), latex("n=4"), texte(".")],
    },
    {
      enonce: [texte("Le triangle de Pascal vérifie plutôt "), latex("C_{5}^{2}=C_{4}^{1}\\times C_{4}^{2}=4\\times6=24"), texte(".")],
      reponse: false,
      justification: [texte("La relation de Pascal utilise une ADDITION, pas un produit : "), latex("4+6=10"), texte(", jamais "), latex("4\\times6=24"), texte(", qui d'ailleurs ne vaut même pas "), latex("10"), texte(".")],
    },
    {
      enonce: [
        texte("La somme de tous les coefficients binomiaux de la ligne "), latex("n=5"), texte(" ("), latex("C_{5}^{0}+C_{5}^{1}+\\dots+C_{5}^{5}"), texte(") vaut "),
        latex("2^5=32"), texte("."),
      ],
      reponse: true,
      justification: [
        latex("1+5+10+10+5+1=32"), texte(", qui correspond à "), latex("(1+1)^5=2^5"), texte(" par le binôme de Newton (avec "), latex("a=b=1"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("La somme des coefficients binomiaux de la ligne "),
        latex("n=5"),
        texte(" vaut "),
        latex("5^2=25"),
        texte(", car il y a 5 termes non triviaux dans le développement."),
      ],
      reponse: false,
      justification: [texte("Le développement de "), latex("(a+b)^5"), texte(" comporte en réalité 6 termes ("), latex("k=0"), texte(" à "), latex("k=5"), texte("), pas 5, et leur somme vaut "), latex("2^5=32"), texte(", pas "), latex("25"), texte(".")],
    },
    {
      enonce: [texte("Pour "), latex("\\varepsilon=0{,}01"), texte(", l'approximation "), latex("(1+\\varepsilon)^4\\approx1+4\\varepsilon"), texte(" donne "), latex("1{,}04"), texte(".")],
      reponse: true,
      justification: [latex("1+4\\times0{,}01=1{,}04"), texte(" ; le terme suivant, "), latex("C_{4}^{2}\\varepsilon^2=0{,}0006"), texte(", est négligeable car "), latex("4\\varepsilon"), texte(" est petit.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("\\varepsilon=0{,}01"),
        texte(", l'approximation "),
        latex("(1+\\varepsilon)^4\\approx1+4\\varepsilon"),
        texte(" néglige tous les autres termes du développement (ceux en "),
        latex("\\varepsilon^2,\\varepsilon^3,\\varepsilon^4"),
        texte("), qui sont TOUS rigoureusement NULS pour "),
        latex("\\varepsilon=0{,}01"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Ces termes sont PETITS mais pas NULS : "), latex("C_{4}^{2}\\times0{,}01^2=0{,}0006"), texte(" par exemple, différent de 0 — c'est justement pourquoi l'approximation n'est pas EXACTE, seulement très proche."),
      ],
    },
    {
      enonce: [
        texte("Dans le développement de "), latex("(2x-1)^5"), texte(", le terme contenant "), latex("x^2"), texte(" correspond à "), latex("k=3"),
        texte(" (puisque l'exposant de "), latex("x"), texte(" est "), latex("5-k=2"), texte("), et vaut "), latex("C_{5}^{3}\\times2^2\\times(-1)^3=10\\times4\\times(-1)=-40"), texte("."),
      ],
      reponse: true,
      justification: [texte("Pour obtenir "), latex("x^2"), texte(", il faut "), latex("5-k=2"), texte(", soit "), latex("k=3"), texte(", d'où le coefficient "), latex("-40"), texte(".")],
    },
    {
      enonce: [
        texte("Dans le développement de "),
        latex("(2x-1)^5"),
        texte(", le terme contenant "),
        latex("x^2"),
        texte(" correspond plutôt à "),
        latex("k=2"),
        texte(" (en associant directement "),
        latex("k"),
        texte(" à l'exposant cherché), ce qui donnerait "),
        latex("C_{5}^{2}\\times2^3\\times(-1)^2=10\\times8\\times1=80"),
        texte(" comme coefficient de "),
        latex("x^2"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'erreur classique de confondre "), latex("k"), texte(" avec l'exposant de "), latex("x"), texte(" : l'exposant de "), latex("x"), texte(" est "), latex("5-k"), texte(", pas "), latex("k"), texte(". Le terme "), latex("k=2"), texte(" donne en réalité "), latex("x^3"), texte(" (coefficient "), latex("80"), texte("), pas "), latex("x^2"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le développement de "), latex("(2x-1)^5"), texte(" comporte exactement 6 termes (de "), latex("k=0"), texte(" à "), latex("k=5"), texte("), soit "), latex("n+1"), texte(" termes pour une puissance "), latex("n"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le rang "), latex("k"), texte(" parcourt "), latex("0,1,\\dots,n"), texte(", soit "), latex("n+1"), texte(" valeurs distinctes.")],
    },
    {
      enonce: [
        texte("Le développement de "),
        latex("(2x-1)^5"),
        texte(" comporte exactement 5 termes, autant que l'exposant "),
        latex("n=5"),
        texte(" lui-même."),
      ],
      reponse: false,
      justification: [texte("Il comporte "), latex("6"), texte(" termes ("), latex("k=0"), texte(" à "), latex("k=5"), texte("), pas "), latex("5"), texte(" — on oublie souvent le terme "), latex("k=0"), texte(".")],
    },
    {
      enonce: [
        texte("Dans le développement de "), latex("(3x+2)^4"), texte(", le terme en "), latex("x^3"), texte(" correspond à "), latex("k=1"),
        texte(" et vaut "), latex("C_{4}^{1}\\times(3x)^3\\times2^1=4\\times27x^3\\times2=216x^3"), texte("."),
      ],
      reponse: true,
      justification: [texte("L'exposant de "), latex("3x"), texte(" est "), latex("4-k"), texte(" : "), latex("4-k=3"), texte(" donne "), latex("k=1"), texte(", puis "), latex("4\\times27\\times2=216"), texte(".")],
    },
    {
      enonce: [
        texte("Dans le développement de "),
        latex("(3x+2)^4"),
        texte(", le terme CONSTANT (sans "),
        latex("x"),
        texte(") vaut "),
        latex("81"),
        texte(", obtenu pour "),
        latex("k=0"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("k=0"), texte(" donne au contraire le terme de plus haut degré, "), latex("81x^4"), texte(". Le terme constant s'obtient pour "),
        latex("k=4"), texte(" et vaut "), latex("C_{4}^{4}\\times2^4=16"), texte("."),
      ],
    },
    {
      enonce: [texte("La somme des coefficients du développement de "), latex("(3x+2)^4"), texte(" vaut "), latex("(3+2)^4=625"), texte(".")],
      reponse: true,
      justification: [texte("Évaluer le développement en "), latex("x=1"), texte(" additionne tous les coefficients, et redonne "), latex("(3\\times1+2)^4=5^4"), texte(".")],
    },
    {
      enonce: [texte("Les coefficients du développement de "), latex("(3x+2)^4"), texte(" se lisent de la même façon dans les deux sens, comme les coefficients binomiaux "), latex("C_{4}^{k}"), texte(" de la ligne 4.")],
      reponse: false,
      justification: [texte("Seuls les "), latex("C_{4}^{k}"), texte(" ("), latex("1,4,6,4,1"), texte(") sont symétriques : le premier coefficient vaut "), latex("3^4=81"), texte(" et le dernier "), latex("2^4=16"), texte(", différents dès que "), latex("a\\neq b"), texte(".")],
    },
    {
      enonce: [texte("Le coefficient du terme en "), latex("x^2"), texte(" de "), latex("(3x+2)^4"), texte(" est "), latex("C_{4}^{2}\\times3^2\\times2^2"), texte(", et non le seul coefficient binomial "), latex("C_{4}^{2}"), texte(".")],
      reponse: true,
      justification: [texte("Le terme est "), latex("C_{4}^{2}\\times(3x)^2\\times2^2"), texte(" : les puissances de "), latex("3"), texte(" et de "), latex("2"), texte(" font partie du coefficient ("), latex("6\\times9\\times4=216"), texte(").")],
    },
    {
      enonce: [
        texte("Pour obtenir le seul terme en "), latex("x^2"), texte(" de "), latex("(3x+2)^4"), texte(", inutile de développer les 5 termes : il suffit de résoudre "),
        latex("4-k=2"), texte(", soit "), latex("k=2"), texte(", puis de calculer "), latex("C_{4}^{2}\\times3^2\\times2^2=216"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le terme général se calcule pour un seul "), latex("k"), texte(", indépendamment des autres termes du développement.")],
    },
    {
      enonce: [
        texte("Le terme de RANG 3 du développement de "), latex("(3x+2)^4"), texte(" correspond à "), latex("k=3"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le terme de rang "), latex("k+1"), texte(" correspond à "), latex("k"), texte(" : le rang 3 correspond donc à "),
        latex("k=2"), texte(", jamais à "), latex("k=3"), texte(" (qui donne le rang 4)."),
      ],
    },
    {
      enonce: [texte("La relation de Pascal donne "), latex("C_{6}^{3}=C_{5}^{2}+C_{5}^{3}=10+10=20"), texte(".")],
      reponse: true,
      justification: [texte("Chaque coefficient est la somme des deux coefficients situés juste au-dessus de lui dans le triangle de Pascal.")],
    },
    {
      enonce: [
        texte("Sur la ligne "), latex("n=6"), texte(", le partenaire de symétrie de "), latex("C_{6}^{2}"), texte(" est "), latex("C_{6}^{3}"),
        texte(", les deux valant 15."),
      ],
      reponse: false,
      justification: [
        texte("Le bon partenaire est "), latex("C_{6}^{6-2}=C_{6}^{4}=15"), texte(" ; "), latex("C_{6}^{3}=20"),
        texte(", une valeur différente — changer l'indice au hasard est le piège classique de la symétrie."),
      ],
    },
    {
      enonce: [
        texte("La somme des coefficients binomiaux de la ligne "), latex("n=6"), texte(" vaut "),
        latex("1+6+15+20+15+6+1=64=2^6"), texte("."),
      ],
      reponse: true,
      justification: [texte("Poser "), latex("a=b=1"), texte(" dans le binôme donne "), latex("(1+1)^n=2^n"), texte(" : la somme d'une ligne double à chaque ligne suivante.")],
    },
    {
      enonce: [texte("La somme des coefficients de la ligne "), latex("n=6"), texte(" vaut "), latex("6!=720"), texte(".")],
      reponse: false,
      justification: [texte("La somme d'une ligne vaut "), latex("2^n"), texte(", soit "), latex("2^6=64"), texte(" ici — jamais "), latex("n!"), texte(", qui croît bien plus vite.")],
    },
    {
      enonce: [
        texte("En développant "), latex("(a+b)^4=(a+b)(a+b)(a+b)(a+b)"), texte(" SANS rien réduire, on obtient "), latex("2^4=16"),
        texte(" \"mots\" de 4 lettres, dont "), latex("C_{4}^{2}=6"), texte(" comportent exactement 2 lettres "), latex("b"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("C'est la preuve par dénombrement du binôme : le coefficient de "), latex("a^2b^2"), texte(" compte les façons de CHOISIR les 2 facteurs qui fournissent le "),
        latex("b"), texte(", soit "), latex("C_{4}^{2}=6"), texte("."),
      ],
    },
    {
      enonce: [
        texte("En développant "),
        latex("(a+b)^4=(a+b)(a+b)(a+b)(a+b)"),
        texte(" sans rien réduire, on obtient 16 « mots » de 4 lettres ; parmi eux, ceux comportant exactement 2 lettres "),
        latex("b"),
        texte(" sont au nombre de "),
        latex("4\\times3=12"),
        texte(" (choix de la position du premier "),
        latex("b"),
        texte(", puis du second)."),
      ],
      reponse: false,
      justification: [
        latex("4\\times3=12"), texte(" compte les 2 positions dans un ORDRE, alors que les 2 lettres "), latex("b"),
        texte(" sont interchangeables : il faut diviser par "), latex("2!"), texte(", d'où "), latex("C_{4}^{2}=6"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("\\varepsilon=-0{,}02"), texte(", l'approximation "), latex("(1+\\varepsilon)^5\\approx1+5\\varepsilon"), texte(" donne "), latex("0{,}90"), texte(".")],
      reponse: true,
      justification: [latex("1+5\\times(-0{,}02)=0{,}90"), texte(" : l'approximation vaut aussi pour "), latex("\\varepsilon"), texte(" négatif, pourvu que "), latex("n\\varepsilon"), texte(" soit petit.")],
    },
    {
      enonce: [texte("L'approximation "), latex("(1+\\varepsilon)^n\\approx1+n\\varepsilon"), texte(" reste bonne pour tout "), latex("n"), texte(", dès que "), latex("\\varepsilon"), texte(" est petit : par exemple "), latex("1{,}01^{100}\\approx1+100\\times0{,}01=2"), texte(".")],
      reponse: false,
      justification: [texte("Il faut que "), latex("n\\varepsilon"), texte(" soit petit, pas seulement "), latex("\\varepsilon"), texte(" : ici "), latex("n\\varepsilon=1"), texte(", et "), latex("1{,}01^{100}\\approx2{,}705"), texte(", loin de 2.")],
    },
  ],

  // ==========================================================================
  // Thème 4 — Dénombrement combinatoire pur : problèmes, ref 6gen46
  // Scénarios fixes : poker à 32 cartes (8 hauteurs × 4 couleurs) — carré 224, brelan 10752,
  // paire 107520, deux paires 24192, total mains C(32,5)=201376 ; Chevalier de Méré (3 dés,
  // sommes 9 et 10, 6 partitions chacune mais 25 et 27 triplets ordonnés) ; multinomiale 12 objets
  // en boîtes 6-4-2 (13860) ; dispositif à répétition 4^3=64 vs sans répétition A(4,3)=24.
  // ==========================================================================
  denombrementProblemes: [
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes formant un CARRÉ (4 cartes de même hauteur + 1 autre carte) est "),
        latex("8\\times28=224"),
        texte(" (8 hauteurs pour le carré, puis 28 cartes restantes parmi les 7 autres hauteurs × 4 couleurs)."),
      ],
      reponse: true,
      justification: [texte("Le carré utilise automatiquement les 4 couleurs d'une hauteur ("), latex("C_{4}^{4}=1"), texte("), la carte restante vient d'une des 7 hauteurs restantes ("), latex("7\\times4=28"), texte(") : "), latex("8\\times28=224"), texte(".")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes 'carré' (224) est le MÊME que le nombre de mains 'brelan' (3 cartes de même hauteur + 2 cartes de hauteurs différentes entre elles), qui vaut aussi "),
        latex("224"),
        texte("."),
      ],
      reponse: false,
      justification: [texte("Le brelan vaut en réalité "), latex("10\\,752"), texte(", bien plus que "), latex("224"), texte(" : moins de contraintes (2 cartes libres au lieu d'1 fixée) laisse plus de possibilités.")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes 'brelan' ("),
        latex("3"),
        texte(" cartes de même hauteur, "),
        latex("2"),
        texte(" cartes de hauteurs différentes entre elles et du brelan) vaut "),
        latex("32\\times336=10\\,752"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("8 hauteurs × 4 façons de choisir les couleurs du brelan ("), latex("C_{4}^{3}=4"), texte(") = 32, puis "), latex("C_{7}^{2}\\times4\\times4=336"), texte(" pour les 2 cartes restantes.")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes 'brelan' ("),
        latex("10\\,752"),
        texte(") est INFÉRIEUR au nombre de mains 'carré' ("),
        latex("224"),
        texte("), car un brelan est une combinaison moins contraignante qu'un carré."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : moins de contraintes donne un décompte PLUS grand, pas plus petit — "), latex("10\\,752>224"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes 'paire' ("),
        latex("2"),
        texte(" cartes de même hauteur + "),
        latex("3"),
        texte(" cartes de hauteurs toutes différentes entre elles et de la paire) vaut "),
        latex("107\\,520"),
        texte(", le plus grand des 4 dénombrements de cette famille (carré, brelan, paire, deux paires)."),
      ],
      reponse: true,
      justification: [texte("La contrainte la plus légère (une seule paire imposée, 3 cartes libres) laisse le plus de possibilités parmi ces 4 catégories.")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), le nombre de mains de 5 cartes 'deux paires' (2 paires de hauteurs différentes + 1 carte d'une 3ᵉ hauteur), qui vaut "),
        latex("24\\,192"),
        texte(", est PLUS GRAND que celui des mains 'paire' ("),
        latex("107\\,520"),
        texte(")."),
      ],
      reponse: false,
      justification: [latex("24\\,192<107\\,520"), texte(" : imposer une 2ᵉ paire est une contrainte SUPPLÉMENTAIRE, elle réduit le nombre de mains possibles, pas l'inverse.")],
    },
    {
      enonce: [texte("Avec 3 dés à 6 faces, les sommes 9 et 10 admettent chacune exactement 6 décompositions non ordonnées en 3 valeurs de 1 à 6.")],
      reponse: true,
      justification: [texte("C'est le point de départ du problème posé à Galilée vers 1620 : {1;2;6}, {1;3;5}, {1;4;4}, {2;2;5}, {2;3;4}, {3;3;3} pour 9, et 6 décompositions analogues pour 10.")],
    },
    {
      enonce: [
        texte("Puisque les sommes 9 et 10 ont le même nombre de décompositions non ordonnées (6 chacune), elles sont donc exactement AUSSI PROBABLES l'une que l'autre en lançant 3 dés."),
      ],
      reponse: false,
      justification: [
        texte("C'est précisément le piège historique : les décompositions ne sont pas toutes équiprobables (certaines correspondent à plus de triplets ORDONNÉS que d'autres). Il faut compter les triplets ordonnés, pas les partitions, pour comparer des probabilités."),
      ],
    },
    {
      enonce: [texte("Pour comparer les chances des sommes 9 et 10 avec 3 dés, il faut compter les triplets ordonnés (1er, 2e, 3e dé), qui sont équiprobables, et non les décompositions.")],
      reponse: true,
      justification: [texte("Les 216 triplets ordonnés ont tous la même probabilité ; une décomposition, elle, correspond à 6, 3 ou 1 triplet selon les valeurs répétées (Galilée trouve 25 triplets pour 9 et 27 pour 10).")],
    },
    {
      enonce: [texte("Pour comparer les chances des sommes 9 et 10 avec 3 dés, compter les décompositions suffit, car chaque décomposition a la même probabilité.")],
      reponse: false,
      justification: [texte("Les décompositions ne sont pas équiprobables : {1;2;6} correspond à 6 triplets ordonnés, {3;3;3} à un seul. Il faut compter les triplets ordonnés.")],
    },
    {
      enonce: [
        texte("Avec 3 dés, parmi les décompositions de la somme 9, le triplet "),
        latex("\\{1;2;6\\}"),
        texte(" (valeurs toutes différentes) admet "),
        latex("3!=6"),
        texte(" arrangements ordonnés distincts."),
      ],
      reponse: true,
      justification: [texte("3 valeurs toutes différentes peuvent s'ordonner de "), latex("3!=6"), texte(" façons différentes sur les 3 dés.")],
    },
    {
      enonce: [
        texte("Avec 3 dés, le triplet "),
        latex("\\{3;3;3\\}"),
        texte(" (les 3 dés affichent la même valeur), qui donne aussi la somme 9, admet lui aussi 6 arrangements ordonnés distincts, comme n'importe quel triplet."),
      ],
      reponse: false,
      justification: [
        texte("Un triplet aux 3 valeurs IDENTIQUES n'admet qu'UN SEUL arrangement ordonné ("), latex("3!/3!=1"), texte("), car permuter des dés qui affichent tous la même valeur ne change rien à l'issue observée."),
      ],
    },
    {
      enonce: [texte("12 objets sont répartis dans 3 boîtes numérotées, de tailles fixées 6, 4 et 2. Le nombre de répartitions possibles est "), latex("\\dfrac{12!}{6!\\times4!\\times2!}"), texte(".")],
      reponse: true,
      justification: [texte("C'est le même principe multinomial que pour une répartition de personnes en groupes nommés, appliqué à des objets et des boîtes.")],
    },
    {
      enonce: [
        texte("Le nombre de répartitions de 12 objets dans 3 boîtes numérotées de tailles fixées 6, 4 et 2 vaudrait "),
        latex("C_{12}^{6}+C_{12}^{4}+C_{12}^{2}"),
        texte(", en additionnant les choix pour chaque boîte séparément."),
      ],
      reponse: false,
      justification: [
        texte("Il faut MULTIPLIER des choix successifs dans le pool RESTANT à chaque étape ("), latex("C_{12}^{6}\\times C_{6}^{4}\\times C_{2}^{2}"),
        texte("), jamais additionner des combinaisons calculées séparément sur les 12 objets d'origine."),
      ],
    },
    {
      enonce: [
        texte("Un dispositif à 3 éléments indépendants, chacun réglable sur 4 positions, offre "), latex("4^3=64"),
        texte(" configurations distinctes possibles (répétition des positions autorisée entre éléments)."),
      ],
      reponse: true,
      justification: [texte("Principe multiplicatif : chacun des 3 éléments a 4 réglages possibles, indépendamment des autres, soit "), latex("4\\times4\\times4=64"), texte(".")],
    },
    {
      enonce: [
        texte("Un dispositif à 3 éléments indépendants, chacun réglable sur 4 positions, offrirait "),
        latex("3^4=81"),
        texte(" configurations distinctes, en élevant le nombre d'éléments à la puissance du nombre de positions."),
      ],
      reponse: false,
      justification: [
        texte("C'est le nombre de positions qui est la base et le nombre d'éléments l'exposant : "), latex("4^3=64"), texte(", pas "), latex("3^4=81"), texte(" — les deux ont d'ailleurs des valeurs différentes."),
      ],
    },
    {
      enonce: [
        texte("Pour un dispositif à 3 éléments, chacun réglable sur 4 positions, si les 3 éléments devaient occuper 3 positions TOUTES DIFFÉRENTES (parmi les 4 disponibles, sans répétition), le nombre de configurations deviendrait "),
        latex("A_{4}^{3}=4\\times3\\times2=24"),
        texte(", strictement inférieur aux 64 configurations avec répétition autorisée."),
      ],
      reponse: true,
      justification: [texte("Interdire la répétition réduit toujours les possibilités : "), latex("24<64"), texte(".")],
    },
    {
      enonce: [
        texte("Pour un dispositif à 3 éléments réglables chacun sur 4 positions, le nombre de configurations sans répétition (24) resterait le même que celui avec répétition (64), car le nombre d'éléments et de positions ne change pas."),
      ],
      reponse: false,
      justification: [texte("Le nombre d'éléments/positions ne change pas, mais la CONTRAINTE (répétition permise ou non) change bien le décompte : "), latex("24\\neq64"), texte(".")],
    },
    {
      enonce: [texte("Le nombre total de mains de 5 cartes parmi les 32 cartes du jeu, "), latex("C_{32}^{5}=201\\,376"), texte(", est plus grand que chacune des catégories carré, brelan, deux paires et une paire.")],
      reponse: true,
      justification: [texte("Ces catégories ne sont qu'une partie des mains : il y a aussi les fulls (1 344) et les mains sans hauteur répétée (57 344).")],
    },
    {
      enonce: [texte("Les 6 catégories de mains du cours (carré, full, brelan, deux paires, une paire, aucune hauteur répétée) totalisent moins que "), latex("C_{32}^{5}"), texte(" : certaines mains n'entrent dans aucune catégorie.")],
      reponse: false,
      justification: [texte("Chaque main a une et une seule de ces structures : les 6 catégories forment une partition, et leurs effectifs totalisent exactement "), latex("C_{32}^{5}=201\\,376"), texte(".")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), pour les mains de 5 cartes 'deux paires', les 2 hauteurs des paires se choisissent par "),
        latex("C_{8}^{2}=28"),
        texte(", puis 2 couleurs pour chaque paire ("),
        latex("6\\times6=36"),
        texte("), soit "),
        latex("1008"),
        texte(" ; la 5ᵉ carte apporte ensuite "),
        latex("6\\times4=24"),
        texte(" possibilités, d'où "),
        latex("1008\\times24=24\\,192"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Les 2 hauteurs déjà utilisées par les paires ne sont plus disponibles pour la 5ᵉ carte : il reste 6 hauteurs × 4 couleurs.")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), pour les mains de 5 cartes 'deux paires', les 2 hauteurs des paires se comptent "),
        latex("8\\times7=56"),
        texte(" : une hauteur pour la première paire, puis une autre pour la seconde."),
      ],
      reponse: false,
      justification: [
        texte("Les 2 paires ne sont pas ordonnées entre elles : "), latex("8\\times7=56"), texte(" compterait chaque main DEUX fois. Le bon compte est "),
        latex("C_{8}^{2}=28"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), pour les mains de 5 cartes 'paire', l'étape 1 vaut "),
        latex("8\\times C_{4}^{2}=48"),
        texte(" et l'étape 2 "),
        latex("C_{7}^{3}\\times4^3=35\\times64=2240"),
        texte(", d'où "),
        latex("48\\times2240=107\\,520"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Hauteur de la paire (8) × 2 couleurs parmi 4, puis 3 hauteurs distinctes parmi les 7 restantes, chacune dans l'une de ses 4 couleurs.")],
    },
    {
      enonce: [texte("Dans un jeu de 32 cartes, pour les mains « une paire », les 3 cartes restantes peuvent se choisir librement parmi les 28 cartes qui ne sont pas de la hauteur de la paire, soit "), latex("C_{28}^{3}"), texte(" possibilités.")],
      reponse: false,
      justification: [texte("Un choix libre pourrait donner 2 cartes de même hauteur (une 2ᵉ paire) : les 3 cartes doivent être de hauteurs toutes différentes, d'où "), latex("C_{7}^{3}\\times4^3"), texte(".")],
    },
    {
      enonce: [
        texte("Dans un jeu de 32 cartes (8 hauteurs × 4 couleurs), pour les mains de 5 cartes 'brelan', l'étape 2 (les 2 cartes restantes) vaut "),
        latex("C_{7}^{2}\\times4\\times4=21\\times16=336"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("2 hauteurs différentes parmi les 7 encore disponibles, puis une couleur libre pour chacune de ces 2 cartes.")],
    },
    {
      enonce: [texte("Les 4 catégories « carré », « brelan », « paire » et « deux paires » sont deux à deux disjointes ET, à elles quatre, recouvrent toutes les mains de 5 cartes du jeu de 32.")],
      reponse: false,
      justification: [texte("Disjointes, oui, mais pas exhaustives : il manque les fulls et les mains dont les 5 hauteurs sont toutes différentes.")],
    },
    {
      enonce: [
        texte("Pour la somme 10 avec 3 dés, les 6 décompositions sont "),
        latex("\\{1;3;6\\}"), texte(", "), latex("\\{1;4;5\\}"), texte(", "), latex("\\{2;2;6\\}"), texte(", "), latex("\\{2;3;5\\}"), texte(", "), latex("\\{2;4;4\\}"), texte(", "), latex("\\{3;3;4\\}"),
        texte(" ; comme "), latex("\\{2;2;6\\}"), texte(", "), latex("\\{2;4;4\\}"), texte(" et "), latex("\\{3;3;4\\}"),
        texte(" n'admettent que 3 arrangements chacune, le total des triplets ordonnés vaut "), latex("6+6+3+6+3+3=27"), texte("."),
      ],
      reponse: true,
      justification: [texte("Une décomposition à 3 valeurs distinctes donne 6 triplets ordonnés, une décomposition contenant exactement une paire n'en donne que 3.")],
    },
    {
      enonce: [
        texte("Avec 3 dés, chacune des 6 décompositions de la somme 10 admet "),
        latex("3!=6"),
        texte(" triplets ordonnés, d'où "),
        latex("6\\times6=36"),
        texte(" triplets au total."),
      ],
      reponse: false,
      justification: [
        latex("3!=6"), texte(" ne vaut que pour des décompositions à 3 valeurs TOUTES différentes ; celles qui contiennent une paire n'en donnent que 3. Le vrai total est "),
        latex("27"), texte(", pas "), latex("36"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec 3 dés, pour la somme 9, le détail des arrangements ordonnés s'écrit "),
        latex("6+6+3+3+6+1=25"),
        texte(" : le triplet "),
        latex("\\{3;3;3\\}"),
        texte(" n'apporte qu'un seul triplet ordonné."),
      ],
      reponse: true,
      justification: [
        texte("Les décompositions "), latex("\\{1;2;6\\}"), texte(", "), latex("\\{1;3;5\\}"), texte(" et "), latex("\\{2;3;4\\}"),
        texte(" en apportent 6 chacune, "), latex("\\{1;4;4\\}"), texte(" et "), latex("\\{2;2;5\\}"), texte(" en apportent 3, et "),
        latex("\\{3;3;3\\}"), texte(" une seule."),
      ],
    },
    {
      enonce: [
        texte("Avec 3 dés, la somme 11 admet strictement PLUS de triplets ordonnés que la somme 10, puisqu'une somme plus grande laisse plus de combinaisons possibles."),
      ],
      reponse: false,
      justification: [
        texte("Les sommes 10 et 11 admettent exactement le même nombre de triplets ordonnés : 27 chacune — et au-delà de 10-11, le nombre de triplets se met à DÉCROÎTRE."),
      ],
    },
    {
      enonce: [
        texte("Avec 3 dés à 6 faces, rien ne garantit qu'une somme "), latex("s"), texte(" et la somme "), latex("21-s"),
        texte(" aient le même nombre de triplets ordonnés : ce sont deux dénombrements indépendants l'un de l'autre."),
      ],
      reponse: false,
      justification: [
        texte("Remplacer chaque dé "), latex("v"), texte(" par "), latex("7-v"), texte(" transforme un triplet de somme "), latex("s"),
        texte(" en un triplet de somme "), latex("21-s"), texte(", et cette correspondance est bijective : les 2 sommes ont TOUJOURS le même compte (ex. 10 et 11, 27 chacune)."),
      ],
    },
    {
      enonce: [texte("9 objets répartis dans 3 boîtes numérotées de tailles 4, 3 et 2 donnent "), latex("\\dfrac{9!}{4!\\times3!\\times2!}"), texte(" répartitions.")],
      reponse: true,
      justification: [texte("Formule multinomiale : "), latex("9!"), texte(" divisé par le produit des factorielles des tailles des boîtes.")],
    },
    {
      enonce: [texte("Le nombre de répartitions de 9 objets dans 3 boîtes numérotées de tailles 4, 3 et 2 s'écrit "), latex("\\dfrac{9!}{4!+3!+2!}"), texte(".")],
      reponse: false,
      justification: [texte("Le dénominateur d'une multinomiale est le PRODUIT des factorielles des tailles, jamais leur somme : "), latex("\\dfrac{9!}{4!\\times3!\\times2!}"), texte(".")],
    },
    {
      enonce: [
        texte("Un dispositif à 4 éléments indépendants, chacun réglable sur 5 positions, offre "), latex("5^4=625"),
        texte(" configurations ; si les 4 positions doivent être TOUTES DIFFÉRENTES, il n'en reste que "),
        latex("A_{5}^{4}=5\\times4\\times3\\times2=120"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le passage de 625 à 120 mesure exactement le coût de l'interdiction de répéter une position d'un élément à l'autre.")],
    },
    {
      enonce: [
        texte("Une main comptée dans la catégorie 'paire' ne peut jamais contenir un brelan, ni une seconde paire."),
      ],
      reponse: true,
      justification: [texte("La catégorie 'paire' impose que les 3 cartes restantes soient de hauteurs toutes différentes entre elles et de la paire — ni brelan ni seconde paire n'y sont possibles.")],
    },
  ],

  // ==========================================================================
  // Thème 5 — Probabilité hypergéométrique, ref 6gen47
  // Scénario A fixe : N=20, K=6, n=5 (tirage sans remise). P(2)=455/1292≈0,352,
  // P(0)=1001/7752≈0,129. Scénario B (contraste séquence/composition) : urne 5 rouges/5 bleues,
  // 3 tirages sans remise, séquence RRB=5/36, composition (2R,1B)=5/12. Scénario C (loto+bonus,
  // 2 tirages indépendants) : principal 2/15, bonus 1/5, combiné 2/75.
  // ==========================================================================
  probabiliteHypergeometrique: [
    {
      enonce: [
        texte("Pour un tirage hypergéométrique de "), latex("n"), texte(" éléments sans remise dans une population de "), latex("N"), texte(" éléments dont "), latex("K"),
        texte(" sont des \"succès\", la probabilité d'obtenir exactement "), latex("k"), texte(" succès est "), latex("P(k)=\\dfrac{C_{K}^{k}\\times C_{N-K}^{n-k}}{C_{N}^{n}}"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la définition de la loi hypergéométrique : succès parmi les succès, échecs parmi les échecs, sur le total des tirages possibles.")],
    },
    {
      enonce: [
        texte("Pour un tirage de "),
        latex("n"),
        texte(" éléments sans remise dans une population de "),
        latex("N"),
        texte(" éléments dont "),
        latex("K"),
        texte(" « succès », la probabilité d'obtenir exactement "),
        latex("k"),
        texte(" succès s'écrit "),
        latex("P(k)=\\dfrac{C_{K}^{k}\\times C_{N-K}^{n-k}}{C_{N}^{k}}"),
        texte(", avec "),
        latex("C_{N}^{k}"),
        texte(" au dénominateur plutôt que "),
        latex("C_{N}^{n}"),
        texte("."),
      ],
      reponse: false,
      justification: [texte("Le dénominateur doit compter TOUS les tirages possibles de "), latex("n"), texte(" éléments, soit "), latex("C_{N}^{n}"), texte(", jamais "), latex("C_{N}^{k}"), texte("."),
      ],
    },
    {
      enonce: [texte("Pour un tirage hypergéométrique avec "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", on a aussi "), latex("P(2)=\\dfrac{C_{6}^{2}\\times C_{14}^{3}}{C_{20}^{3}}"), texte(".")],
      reponse: false,
      justification: [texte("Le dénominateur compte tous les tirages de "), latex("n=5"), texte(" éléments : c'est "), latex("C_{20}^{5}"), texte(", jamais "), latex("C_{20}^{3}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour un tirage hypergéométrique avec "),
        latex("N=20"),
        texte(", "),
        latex("K=6"),
        texte(", "),
        latex("n=5"),
        texte(", dans "),
        latex("P(0)=\\dfrac{C_{6}^{0}\\times C_{14}^{5}}{C_{20}^{5}}"),
        texte(", on pourrait remplacer "),
        latex("C_{6}^{0}"),
        texte(" par "),
        latex("C_{6}^{5}"),
        texte(" sans changer le résultat, puisque les deux valent la même chose par symétrie du triangle de Pascal."),
      ],
      reponse: false,
      justification: [latex("C_{6}^{0}=1"), texte(" mais "), latex("C_{6}^{5}=6"), texte(" : ce ne sont PAS les mêmes valeurs. La bonne symétrie serait "), latex("C_{6}^{0}=C_{6}^{6}=1"), texte(", pas "), latex("C_{6}^{5}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Une urne contient 5 boules rouges et 5 boules bleues. On tire 3 boules successivement SANS remise. La probabilité d'obtenir exactement la séquence (rouge, rouge, bleue), DANS CET ORDRE PRÉCIS, vaut "),
        latex("\\dfrac{5}{10}\\times\\dfrac{4}{9}\\times\\dfrac{5}{8}=\\dfrac{5}{36}"), texte("."),
      ],
      reponse: true,
      justification: [latex("\\dfrac{1}{2}\\times\\dfrac{4}{9}\\times\\dfrac{5}{8}=\\dfrac{10}{72}=\\dfrac{5}{36}"), texte(".")],
    },
    {
      enonce: [
        texte("Une urne contient 5 boules rouges et 5 boules bleues ; on tire 3 boules successivement sans remise. La probabilité de la séquence (rouge, rouge, bleue), dans cet ordre précis, est la même que celle d'obtenir 2 rouges et 1 bleue dans un ordre QUELCONQUE, puisque les deux questions portent sur les mêmes 3 boules tirées."),
      ],
      reponse: false,
      justification: [
        texte("La probabilité d'une SÉQUENCE précise ("), latex("\\dfrac{5}{36}"), texte(") est bien plus petite que celle de la COMPOSITION correspondante ("), latex("\\dfrac{5}{12}"),
        texte(", qui regroupe les 3 ordres possibles) — ce sont deux questions différentes."),
      ],
    },
    {
      enonce: [
        texte("Une urne contient 5 boules rouges et 5 boules bleues ; on tire 3 boules successivement sans remise. La probabilité d'obtenir 2 boules rouges et 1 boule bleue, DANS UN ORDRE QUELCONQUE, vaut "),
        latex("3\\times\\dfrac{5}{36}=\\dfrac{5}{12}"),
        texte(", car il existe "),
        latex("C_{3}^{2}=3"),
        texte(" façons d'arranger 2 rouges et 1 bleue parmi les 3 tirages."),
      ],
      reponse: true,
      justification: [texte("3 positions possibles pour la boule bleue unique parmi les 3 tirages, chacune de probabilité "), latex("\\dfrac{5}{36}"), texte(" : "), latex("3\\times\\dfrac{5}{36}=\\dfrac{5}{12}"), texte(".")],
    },
    {
      enonce: [
        texte("Une urne contient 5 boules rouges et 5 boules bleues ; on tire 3 boules successivement sans remise. La probabilité d'obtenir 2 rouges et 1 bleue dans un ordre quelconque, "),
        latex("\\dfrac{5}{12}"),
        texte(", pourrait aussi se retrouver directement avec la formule hypergéométrique : "),
        latex("\\dfrac{C_{5}^{2}\\times C_{5}^{1}}{C_{10}^{3}}=\\dfrac{10\\times5}{120}=\\dfrac{50}{120}"),
        texte(", ce qui se SIMPLIFIE en "),
        latex("\\dfrac{5}{6}"),
        texte(", différent de "),
        latex("\\dfrac{5}{12}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        latex("\\dfrac{50}{120}"), texte(" se simplifie en réalité en "), latex("\\dfrac{5}{12}"), texte(" (diviser numérateur et dénominateur par 10), exactement la même valeur que trouvée précédemment — pas "), latex("\\dfrac{5}{6}"), texte("."),
      ],
    },
    {
      enonce: [texte("Dans un petit loto, 4 numéros gagnants sont tirés parmi 10 et l'on coche 2 numéros : la probabilité que les 2 numéros cochés soient gagnants vaut "), latex("\\dfrac{C_{4}^{2}\\times C_{6}^{0}}{C_{10}^{2}}=\\dfrac{6}{45}=\\dfrac{2}{15}"), texte(".")],
      reponse: true,
      justification: [texte("Formule hypergéométrique avec "), latex("N=10"), texte(" numéros, "), latex("K=4"), texte(" gagnants, "), latex("n=2"), texte(" cochés et "), latex("k=2"), texte(".")],
    },
    {
      enonce: [
        texte("À un loto, la probabilité de réussir À LA FOIS la grille principale ("),
        latex("\\dfrac{2}{15}"),
        texte(") ET le bonus ("),
        latex("\\dfrac{1}{5}"),
        texte("), ces deux tirages étant indépendants, s'obtient en les ADDITIONNANT : "),
        latex("\\dfrac{2}{15}+\\dfrac{1}{5}=\\dfrac{2}{15}+\\dfrac{3}{15}=\\dfrac{5}{15}=\\dfrac{1}{3}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Un ET entre 2 événements INDÉPENDANTS se traduit par une MULTIPLICATION des probabilités, jamais une addition : la bonne valeur combinée est "),
        latex("\\dfrac{2}{15}\\times\\dfrac{1}{5}=\\dfrac{2}{75}"), texte(", pas "), latex("\\dfrac{1}{3}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("À un loto où l'on réussit la grille principale avec une probabilité "),
        latex("\\dfrac{2}{15}"),
        texte(" et le bonus avec une probabilité "),
        latex("\\dfrac{1}{5}"),
        texte(", la probabilité de réussir les deux, ces 2 tirages étant réellement indépendants, vaut "),
        latex("\\dfrac{2}{15}\\times\\dfrac{1}{5}=\\dfrac{2}{75}\\approx0{,}027"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Deux événements indépendants réunis par un ET : on multiplie leurs probabilités respectives.")],
    },
    {
      enonce: [
        texte("Pour le tirage hypergéométrique "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", la somme des probabilités "),
        latex("P(0)+P(1)+P(2)+P(3)+P(4)+P(5)"), texte(" (tous les nombres de succès possibles) vaut exactement 1."),
      ],
      reponse: true,
      justification: [texte("Ces 6 valeurs couvrent tous les cas possibles pour le nombre de succès, disjoints deux à deux : leur somme vaut donc toujours 1.")],
    },
    {
      enonce: [
        texte("La loi hypergéométrique modélise un tirage SANS remise (la composition de la population change à chaque tirage), contrairement à la loi binomiale qui suppose des épreuves indépendantes, typiquement AVEC remise ou dans une population très grande."),
      ],
      reponse: true,
      justification: [texte("C'est la distinction fondamentale entre les deux lois : dépendance des tirages successifs (hypergéométrique) contre indépendance (binomiale).")],
    },
    {
      enonce: [
        texte("La loi hypergéométrique et la loi binomiale donnent TOUJOURS exactement la même probabilité pour un même "), latex("N,K,n"),
        texte(", quelle que soit la taille de la population, car le tirage sans remise n'a en réalité aucune influence sur le résultat."),
      ],
      reponse: false,
      justification: [
        texte("Elles ne coïncident qu'APPROXIMATIVEMENT lorsque "), latex("N"), texte(" est très grand devant "), latex("n"), texte(" (l'effet du tirage sans remise devient négligeable) — jamais exactement en général, et le tirage sans remise a bien une influence réelle sur des populations modestes."),
      ],
    },
    {
      enonce: [
        texte("Pour un tirage hypergéométrique avec "),
        latex("N=20"),
        texte(", "),
        latex("K=6"),
        texte(", "),
        latex("n=5"),
        texte(", le cas \"tous des succès\" ("),
        latex("k=n=5"),
        texte(") vaut "),
        latex("P(5)=\\dfrac{C_{6}^{5}\\times C_{14}^{0}}{C_{20}^{5}}=\\dfrac{6}{15\\,504}\\approx0{,}0004"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Il ne reste aucun échec à choisir ("), latex("n-k=0"), texte("), donc "), latex("C_{14}^{0}=1"), texte(" : seuls comptent les 6 choix de 5 succès parmi les 6 disponibles.")],
    },
    {
      enonce: [
        texte("Pour un tirage hypergéométrique avec "),
        latex("N=20"),
        texte(", "),
        latex("K=6"),
        texte(", "),
        latex("n=5"),
        texte(", dans le cas "),
        latex("k=n=5"),
        texte(", le numérateur s'écrit "),
        latex("C_{6}^{5}\\times C_{14}^{5}"),
        texte(", le second facteur portant toujours sur les 5 éléments tirés."),
      ],
      reponse: false,
      justification: [
        texte("Le second facteur porte sur les ÉCHECS tirés, en nombre "), latex("n-k=0"), texte(" : c'est "), latex("C_{14}^{0}=1"),
        texte(", jamais "), latex("C_{14}^{5}"), texte(" — sinon la main compterait 10 éléments au lieu de 5."),
      ],
    },
    {
      enonce: [
        texte("Si l'on tire "), latex("n=8"), texte(" éléments dans une population de "), latex("N=20"), texte(" contenant "), latex("K=6"),
        texte(" succès, alors "), latex("P(7)=0"), texte(" : il est impossible d'obtenir plus de succès qu'il n'en existe."),
      ],
      reponse: true,
      justification: [latex("C_{6}^{7}=0"), texte(" (on ne peut pas choisir 7 éléments parmi 6) : le numérateur s'annule, donc la probabilité aussi.")],
    },
    {
      enonce: [
        texte("Pour un tirage hypergéométrique avec "),
        latex("N=20"),
        texte(", "),
        latex("K=6"),
        texte(", "),
        latex("n=8"),
        texte(", la probabilité d'obtenir 7 succès est très petite, mais reste strictement positive."),
      ],
      reponse: false,
      justification: [texte("Elle est rigoureusement NULLE, pas seulement petite : il n'existe que 6 succès dans toute la population, 7 succès sont matériellement impossibles.")],
    },
    {
      enonce: [
        texte("Pour "), latex("N=10"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", on a "), latex("P(0)=0"),
        texte(" : il est impossible de ne tirer aucun succès."),
      ],
      reponse: true,
      justification: [
        texte("La population ne contient que "), latex("N-K=4"), texte(" échecs, insuffisants pour remplir les 5 tirages : "),
        latex("C_{4}^{5}=0"), texte(", donc au moins un succès est certain."),
      ],
    },
    {
      enonce: [
        texte("Une urne contient 4 boules rouges et 6 boules bleues. En tirant 3 boules SANS remise, la probabilité de la séquence exacte (rouge, bleue, rouge) vaut "),
        latex("\\dfrac{4}{10}\\times\\dfrac{6}{9}\\times\\dfrac{3}{8}=\\dfrac{72}{720}=\\dfrac{1}{10}"), texte("."),
      ],
      reponse: true,
      justification: [texte("Produit de fractions position par position : 4 rouges sur 10, puis 6 bleues sur 9, puis 3 rouges restantes sur 8.")],
    },
    {
      enonce: [
        texte("Une urne contient 4 boules rouges et 6 boules bleues ; on tire 3 boules successivement sans remise. Chaque séquence de 2 rouges et 1 bleue ayant pour probabilité "),
        latex("\\dfrac{1}{10}"),
        texte(", la composition \"2 rouges et 1 bleue\" (ordre libre) vaut "),
        latex("3\\times\\dfrac{1}{10}=\\dfrac{3}{10}"),
        texte(", ce que confirme la formule hypergéométrique : "),
        latex("\\dfrac{C_{4}^{2}\\times C_{6}^{1}}{C_{10}^{3}}=\\dfrac{6\\times6}{120}=\\dfrac{36}{120}=\\dfrac{3}{10}"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Les 3 séquences (RRB, RBR, BRR) ont chacune la probabilité "), latex("\\dfrac{1}{10}"), texte(" : leur somme donne la composition, exactement la valeur hypergéométrique.")],
    },
    {
      enonce: [
        texte("Une urne contient 4 boules rouges et 6 boules bleues ; on tire 3 boules successivement sans remise. Les 3 séquences menant à \"2 rouges et 1 bleue\" n'ont PAS la même probabilité : celle où la bleue sort en premier est plus probable, l'urne étant alors encore complète."),
      ],
      reponse: false,
      justification: [
        texte("Les 3 séquences ont rigoureusement la même probabilité ("), latex("\\dfrac{1}{10}"),
        texte(" chacune) : les mêmes facteurs y apparaissent, seulement dans un autre ordre, et un produit ne dépend pas de l'ordre de ses facteurs."),
      ],
    },
    {
      enonce: [
        texte("Dans une grille de "),
        latex("N=12"),
        texte(" numéros dont "),
        latex("K=5"),
        texte(" sont gagnants, la probabilité que 2 numéros tirés sans remise soient tous deux gagnants vaut "),
        latex("\\dfrac{5}{33}"),
        texte(" ; elle vaudrait toujours "),
        latex("\\dfrac{5}{33}"),
        texte(" si les 2 numéros étaient tirés AVEC remise, le second tirage pouvant répéter le premier."),
      ],
      reponse: false,
      justification: [
        texte("Avec remise, les 2 tirages redeviennent indépendants à probabilité constante : "),
        latex("\\left(\\dfrac{5}{12}\\right)^2=\\dfrac{25}{144}\\approx0{,}174"), texte(", différent de "), latex("\\dfrac{5}{33}\\approx0{,}152"), texte("."),
      ],
    },
    {
      enonce: [
        texte("La formule hypergéométrique est une probabilité par ÉQUIPROBABILITÉ : chaque sous-ensemble de "), latex("n"),
        texte(" éléments a exactement la même chance d'être tiré, d'où un numérateur qui compte les tirages favorables et un dénominateur "),
        latex("C_{N}^{n}"), texte(" qui les compte tous."),
      ],
      reponse: true,
      justification: [texte("C'est bien un quotient \"cas favorables / cas possibles\", les cas possibles étant tous les sous-ensembles de "), latex("n"), texte(" éléments de la population.")],
    },
    {
      enonce: [texte("Comme les tirages successifs sans remise ne sont pas indépendants, les différents sous-ensembles de "), latex("n"), texte(" éléments n'ont pas tous la même probabilité d'être obtenus.")],
      reponse: false,
      justification: [texte("La dépendance porte sur les tirages successifs, pas sur le sous-ensemble final : tous les sous-ensembles de "), latex("n"), texte(" éléments restent équiprobables, ce qui autorise le quotient par "), latex("C_{N}^{n}"), texte(".")],
    },
    {
      enonce: [texte("En tirant successivement, sans remise, 4 lettres parmi 9 lettres toutes différentes, la probabilité d'obtenir un ordre précis donné à l'avance est "), latex("\\dfrac{1}{9}\\times\\dfrac{1}{8}\\times\\dfrac{1}{7}\\times\\dfrac{1}{6}=\\dfrac{1}{3024}"), texte(".")],
      reponse: true,
      justification: [texte("À chaque tirage, une seule lettre parmi celles qui restent convient : "), latex("9\\times8\\times7\\times6=3024=A_{9}^{4}"), texte(".")],
    },
    {
      enonce: [texte("En tirant successivement, sans remise, 4 lettres parmi 9 lettres toutes différentes, la probabilité d'obtenir un ordre précis donné à l'avance vaut "), latex("\\dfrac{1}{9^4}"), texte(", la probabilité restant "), latex("\\dfrac{1}{9}"), texte(" à chaque tirage.")],
      reponse: false,
      justification: [texte("Une probabilité constante de "), latex("\\dfrac{1}{9}"), texte(" correspondrait à un tirage avec remise : sans remise, il reste 9, puis 8, 7, 6 lettres, d'où "), latex("\\dfrac{1}{3024}"), texte(".")],
    },
    {
      enonce: [texte("La loi binomiale suppose des épreuves indépendantes de probabilité constante, alors qu'un tirage sans remise modifie les probabilités des tirages suivants.")],
      reponse: true,
      justification: [texte("C'est la distinction centrale entre les deux modèles du chapitre : la binomiale (avec remise ou population immense) et le tirage sans remise (hypergéométrique, séquence exacte).")],
    },
    {
      enonce: [texte("La probabilité binomiale et la probabilité d'une séquence exacte sans remise donnent toujours le même résultat numérique : ce sont deux façons d'écrire la même probabilité.")],
      reponse: false,
      justification: [texte("Ce sont deux modèles différents (épreuves indépendantes contre tirages sans remise) : leurs résultats ne coïncident pas en général.")],
    },
    {
      enonce: [texte("Avec 9 lettres toutes différentes tirées sans remise, devoir deviner l'ordre exact de 5 lettres au lieu de 4 diminue la probabilité de succès.")],
      reponse: true,
      justification: [texte("Il faut deviner un choix exact de plus : la probabilité est encore multipliée par "), latex("\\dfrac{1}{5}"), texte(" ("), latex("\\dfrac{1}{15\\,120}"), texte(" au lieu de "), latex("\\dfrac{1}{3024}"), texte(").")],
    },
    {
      enonce: [texte("En tirant sans remise des lettres parmi 9 lettres toutes différentes, passer de 4 à 5 lettres à deviner dans l'ordre augmente la probabilité de succès, car un tirage de plus peut « compenser » une erreur.")],
      reponse: false,
      justification: [texte("Chaque lettre supplémentaire à deviner multiplie la probabilité par une fraction inférieure à 1 : elle diminue.")],
    },
    {
      enonce: [texte("En tirant successivement, sans remise, 3 jetons parmi 12 tous différents, la probabilité d'obtenir 3 jetons précis dans un ordre exact donné à l'avance vaut "), latex("\\dfrac{1}{12}\\times\\dfrac{1}{11}\\times\\dfrac{1}{10}=\\dfrac{1}{1320}"), texte(".")],
      reponse: true,
      justification: [texte("À chaque tirage, un seul jeton parmi ceux qui restent convient : "), latex("12\\times11\\times10=1320"), texte(".")],
    },
    {
      enonce: [texte("En tirant successivement, sans remise, 3 jetons parmi 12 tous différents, la probabilité d'obtenir 3 jetons précis dans un ordre quelconque vaut "), latex("\\dfrac{1}{1320}"), texte(", comme pour un ordre exact donné à l'avance.")],
      reponse: false,
      justification: [texte("Les "), latex("3!=6"), texte(" ordres conviennent alors, chacun de probabilité "), latex("\\dfrac{1}{1320}"), texte(" : on obtient "), latex("\\dfrac{6}{1320}=\\dfrac{1}{220}"), texte(", six fois plus.")],
    },
    {
      enonce: [texte("La probabilité d'obtenir une séquence exacte de "), latex("p"), texte(" éléments tirés sans remise parmi "), latex("n"), texte(" éléments distincts s'écrit "), latex("\\dfrac{1}{A_{n}^{p}}"), texte(".")],
      reponse: true,
      justification: [texte("Le dénominateur "), latex("n(n-1)\\ldots(n-p+1)"), texte(" est exactement "), latex("A_{n}^{p}"), texte(" : parmi les "), latex("A_{n}^{p}"), texte(" séquences ordonnées équiprobables, une seule convient.")],
    },
    {
      enonce: [texte("La probabilité d'obtenir une séquence exacte de "), latex("p"), texte(" éléments tirés sans remise parmi "), latex("n"), texte(" éléments distincts s'écrit "), latex("\\dfrac{1}{C_{n}^{p}}"), texte(".")],
      reponse: false,
      justification: [latex("\\dfrac{1}{C_{n}^{p}}"), texte(" est la probabilité d'obtenir les "), latex("p"), texte(" éléments voulus dans un ordre quelconque ; l'ordre exact donne "), latex("\\dfrac{1}{A_{n}^{p}}"), texte(", "), latex("p!"), texte(" fois plus petit.")],
    },
  ],

  // ==========================================================================
  // Thème 6 — Probabilité binomiale et séquence exacte sans remise, ref 6gen48
  // Scénario A fixe : n=6 tirs, p=0,4. P(0)=0,046656, P(1)=0,186624, P(2)=0,31104, P(4)=0,13824,
  // P(5)=0,036864, P(6)=0,004096. P(au moins 1)=0,953344 ; P(au plus 5)=0,995904 ;
  // P(au moins 4)=0,1792. Scénario B fixe : n=9 lettres distinctes, tirage sans remise, k=4 :
  // produit=1/3024 ; k=5 : produit=1/15120.
  // ==========================================================================
  binomialeSequence: [
    {
      enonce: [
        texte("Pour "), latex("n"), texte(" épreuves indépendantes de probabilité de succès "), latex("p"), texte(" constante, "),
        latex("P(X=k)=C_{n}^{k}\\times p^k\\times(1-p)^{n-k}"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est la formule de la loi binomiale : choisir quelles épreuves réussissent, puis multiplier les probabilités de succès et d'échec correspondantes.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n"),
        texte(" épreuves indépendantes de probabilité de succès "),
        latex("p"),
        texte(" constante, la probabilité de "),
        latex("k"),
        texte(" succès s'écrit "),
        latex("P(X=k)=C_{n}^{k}\\times p^{n-k}\\times(1-p)^k"),
        texte(", en inversant les exposants de "),
        latex("p"),
        texte(" et "),
        latex("(1-p)"),
        texte("."),
      ],
      reponse: false,
      justification: [texte("Les exposants sont inversés : "), latex("p"), texte(" (succès) porte l'exposant "), latex("k"), texte(" (le nombre de succès), et "), latex("(1-p)"), texte(" (échec) l'exposant "), latex("n-k"), texte(", jamais l'inverse.")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec une probabilité de réussite "), latex("p=0{,}4"), texte(", on a "), latex("P(X=2)=C_{6}^{2}\\times0{,}4^2\\times0{,}6^4"), texte(".")],
      reponse: true,
      justification: [texte("Formule binomiale : "), latex("C_{6}^{2}"), texte(" positions pour les 2 succès, "), latex("0{,}4^2"), texte(" pour les succès, "), latex("0{,}6^4"), texte(" pour les 4 échecs.")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(" ("), latex("X"), texte(" : nombre de succès), on a "), latex("P(X=2)=0{,}4^2\\times0{,}6^4"), texte(", sans facteur combinatoire.")],
      reponse: false,
      justification: [texte("Il manque "), latex("C_{6}^{2}=15"), texte(", le nombre de positions possibles des 2 succès parmi les 6 tirs : le résultat serait 15 fois trop petit.")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(", "), latex("P(X=0)=0{,}6^6"), texte(" se calcule par un seul terme, sans somme ni complément.")],
      reponse: true,
      justification: [texte("« Aucun », « tous » et « exactement » se calculent par un seul terme de la formule : "), latex("P(X=0)=C_{6}^{0}\\times0{,}4^0\\times0{,}6^6=0{,}6^6"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=6"),
        texte(" tirs indépendants avec "),
        latex("p=0{,}4"),
        texte(" de réussite à chaque tir ("),
        latex("X"),
        texte(" : nombre de succès), "),
        latex("P(X=0)"),
        texte(" relève de la stratégie \"complément\", car il faudrait calculer 1 moins la probabilité d'avoir au moins un succès."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : "), latex("P(X=0)"), texte(" est le terme DIRECT (stratégie \"un seul terme\") qui sert ENSUITE de base pour calculer, par complément, la probabilité d'\"au moins 1 succès\" — pas le contraire."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(", "), latex("P(\\text{au moins 1 succès})=1-P(X=0)=1-0{,}6^6"), texte(".")],
      reponse: true,
      justification: [texte("« Au moins 1 » est le contraire de « aucun » : le complément évite de sommer 6 termes.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=6"),
        texte(" tirs indépendants avec "),
        latex("p=0{,}4"),
        texte(" de réussite à chaque tir ("),
        latex("X"),
        texte(" : nombre de succès), P(au moins 1 succès) se calcule plutôt en additionnant "),
        latex("P(X=1)"),
        texte(" seul, car \"au moins 1\" est équivalent à \"exactement 1\" dans ce contexte."),
      ],
      reponse: false,
      justification: [texte("\"Au moins 1\" inclut "), latex("X=1,2,3,4,5"), texte(" ET "), latex("6"), texte(", pas seulement "), latex("X=1"), texte(" : ce n'est PAS équivalent à \"exactement 1\".")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(", "), latex("P(\\text{au plus 5 succès})=1-P(X=6)=1-0{,}4^6"), texte(".")],
      reponse: true,
      justification: [texte("« Au plus 5 » (sur 6) est le contraire de « tous réussissent » ("), latex("X=6"), texte(").")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=6"),
        texte(" tirs indépendants avec "),
        latex("p=0{,}4"),
        texte(" de réussite à chaque tir ("),
        latex("X"),
        texte(" : nombre de succès), P(au plus 5 succès) se calcule plutôt comme "),
        latex("1-P(X=0)"),
        texte(", car \"au plus 5\" est le complémentaire d'\"aucun succès\"."),
      ],
      reponse: false,
      justification: [texte("Le complémentaire de \"au plus 5\" (sur 6) est \"tous\" ("), latex("X=6"), texte("), pas \"aucun\" ("), latex("X=0"), texte(") — ce sont deux seuils différents.")],
    },
    {
      enonce: [texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(", "), latex("P(\\text{au moins 4 succès})=P(X=4)+P(X=5)+P(X=6)"), texte(" : la somme de 3 termes est plus courte que le complément.")],
      reponse: true,
      justification: [texte("Le complément porterait sur 4 termes ("), latex("X=0"), texte(", 1, 2, 3) : la somme directe de 3 termes est plus rapide.")],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=6"),
        texte(" tirs indépendants avec "),
        latex("p=0{,}4"),
        texte(" de réussite à chaque tir ("),
        latex("X"),
        texte(" : nombre de succès), la probabilité \"au moins 4 succès\" vaudrait "),
        latex("1-P(X=3)"),
        texte(", en utilisant la stratégie complément avec "),
        latex("X=3"),
        texte(" comme seuil."),
      ],
      reponse: false,
      justification: [
        texte("Le complémentaire correct de \"au moins 4\" est \"au plus 3\" ("), latex("X=0,1,2"), texte(" OU "), latex("3"), texte("), donc "), latex("1-\\big(P(0)+P(1)+P(2)+P(3)\\big)"),
        texte(", jamais "), latex("1-P(X=3)"), texte(" seul (qui ne retire qu'UN terme, pas les 4)."),
      ],
    },
    {
      enonce: [
        texte("Pour 6 épreuves indépendantes de même probabilité de succès "),
        latex("p"),
        texte(", la somme de toutes les probabilités "),
        latex("P(X=0)"),
        texte(" à "),
        latex("P(X=6)"),
        texte(" (les 7 valeurs possibles du nombre de succès) vaut exactement 1, quelle que soit la valeur de "),
        latex("p"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("C'est une propriété générale de toute distribution de probabilité : la somme sur tous les cas possibles vaut toujours 1.")],
    },
    {
      enonce: [
        texte("Pour 6 épreuves indépendantes de même probabilité de succès "),
        latex("p"),
        texte(", la somme des probabilités "),
        latex("P(X=0)"),
        texte(" à "),
        latex("P(X=6)"),
        texte(" ne vaut 1 que si "),
        latex("p=0{,}5"),
        texte(", car c'est la seule valeur qui rend tous les résultats équiprobables."),
      ],
      reponse: false,
      justification: [texte("La somme vaut 1 pour TOUTE valeur de "), latex("p"), texte(" entre 0 et 1, pas seulement "), latex("0{,}5"), texte(" — l'équiprobabilité entre les résultats n'est d'ailleurs jamais requise pour que leur somme fasse 1.")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=8"), texte(" lancers d'une pièce équilibrée ("), latex("p=0{,}5"), texte("), on a "),
        latex("P(X=k)=C_{8}^{k}\\times0{,}5^8=\\dfrac{C_{8}^{k}}{256}"),
        texte(" : la distribution reproduit, à un facteur près, la ligne "), latex("n=8"), texte(" du triangle de Pascal."),
      ],
      reponse: true,
      justification: [
        latex("p^k(1-p)^{n-k}=0{,}5^k\\times0{,}5^{8-k}=0{,}5^8"), texte(" quel que soit "), latex("k"),
        texte(" : seul le coefficient binomial fait alors varier "), latex("P(X=k)"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=8"),
        texte(" lancers d'une pièce équilibrée ("),
        latex("p=0{,}5"),
        texte("), la valeur la plus probable est "),
        latex("k=4"),
        texte(", avec "),
        latex("P(X=4)=\\dfrac{70}{256}\\approx0{,}273"),
        texte("."),
      ],
      reponse: true,
      justification: [latex("C_{8}^{4}=70"), texte(" est le plus grand coefficient de la ligne "), latex("n=8"), texte(", donc "), latex("k=4"), texte(" est bien le cas le plus probable.")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=8"), texte(" et "), latex("p=0{,}5"), texte(", "), latex("P(X=4)=\\dfrac{1}{2}"),
        texte(", puisque 4 est la moitié de 8 et que la pièce est équilibrée."),
      ],
      reponse: false,
      justification: [
        latex("P(X=4)=\\dfrac{70}{256}\\approx0{,}273"), texte(", loin de "), latex("0{,}5"),
        texte(" : \"exactement 4 piles\" reste un cas parmi 9 possibles, même s'il est le plus probable."),
      ],
    },
    {
      enonce: [
        texte("Pour "),
        latex("n=8"),
        texte(" lancers d'une pièce équilibrée ("),
        latex("p=0{,}5"),
        texte("), "),
        latex("P(\\text{au moins }1)=1-0{,}5^8=\\dfrac{255}{256}\\approx0{,}996"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("\"Au moins 1\" est le complémentaire exact d'\"aucun\", dont la probabilité vaut "), latex("\\dfrac{1}{256}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=8"), texte(" et "), latex("p=0{,}5"), texte(", "), latex("P(X=3)"), texte(" et "), latex("P(X=5)"),
        texte(" sont nécessairement différentes, 3 succès n'étant pas la même chose que 5 succès."),
      ],
      reponse: false,
      justification: [
        latex("C_{8}^{3}=C_{8}^{5}=56"), texte(" et, pour "), latex("p=0{,}5"), texte(", le facteur "), latex("0{,}5^8"),
        texte(" est le même : les 2 probabilités sont rigoureusement ÉGALES ("), latex("\\dfrac{56}{256}"), texte(")."),
      ],
    },
    {
      enonce: [texte("Pour "), latex("n=8"), texte(" épreuves et "), latex("p=0{,}3"), texte(", on a "), latex("P(X=3)\\neq P(X=5)"), texte(", alors que ces deux probabilités sont égales pour "), latex("p=0{,}5"), texte(".")],
      reponse: true,
      justification: [texte("Le coefficient "), latex("C_{8}^{3}=C_{8}^{5}=56"), texte(" est le même, mais "), latex("0{,}3^3\\times0{,}7^5\\neq0{,}3^5\\times0{,}7^3"), texte(" : la symétrie n'existe que pour "), latex("p=0{,}5"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=8"), texte(", la probabilité d'obtenir \"au moins 2 succès\" se calcule par le complément "), latex("1-P(X=2)"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le complémentaire de \"au moins 2\" est \"au plus 1\", soit "), latex("P(0)+P(1)"),
        texte(" : il faut retirer DEUX termes, pas seulement "), latex("P(X=2)"), texte(" — qui fait d'ailleurs partie des cas favorables."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("n=8"), texte(" et "), latex("p=0{,}5"), texte(", "),
        latex("P(\\text{au moins }2)=1-\\dfrac{1+8}{256}=\\dfrac{247}{256}\\approx0{,}965"), texte("."),
      ],
      reponse: true,
      justification: [latex("P(0)=\\dfrac{1}{256}"), texte(" et "), latex("P(1)=\\dfrac{8}{256}"), texte(" : leur complément vaut bien "), latex("\\dfrac{247}{256}"), texte(".")],
    },
    {
      enonce: [
        texte("Pour \"au moins 7 succès sur 8\", la stratégie la plus courte est le complément, qui ne demande de calculer que la somme des probabilités restantes."),
      ],
      reponse: false,
      justification: [
        texte("Le complément demanderait ici 7 termes ("), latex("k=0"), texte(" à "), latex("6"), texte(") contre 2 seulement pour la somme directe ("),
        latex("P(7)+P(8)"), texte(") : c'est la SOMME qui est la plus courte. Toujours compter les termes des deux côtés avant de choisir."),
      ],
    },
    {
      enonce: [
        texte("Une question \"au plus "), latex("k"), texte(" succès\" se traite toujours par un complément, quelle que soit la valeur de "), latex("k"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le complément n'est réellement rentable que si le cas contraire tient en peu de termes (typiquement "), latex("k=n-1"),
        texte(", dont le complément est le seul terme "), latex("P(n)"), texte(") ; sinon la somme directe est plus courte."),
      ],
    },
    {
      enonce: [
        texte("Dans la loi binomiale, toutes les séquences comportant exactement "), latex("k"), texte(" succès et "), latex("n-k"),
        texte(" échecs ont la MÊME probabilité "), latex("p^k(1-p)^{n-k}"), texte(" ; le coefficient "), latex("C_{n}^{k}"),
        texte(" ne fait que compter combien il y en a."),
      ],
      reponse: true,
      justification: [texte("Les épreuves étant indépendantes, seul le NOMBRE de succès et d'échecs compte dans le produit, jamais leur position — d'où un simple facteur multiplicatif.")],
    },
    {
      enonce: [texte("Dans l'arbre de "), latex("n"), texte(" épreuves répétées, le nombre "), latex("N_k"), texte(" de chemins qui comptent exactement "), latex("k"), texte(" succès vaut "), latex("C_{n}^{k}"), texte(".")],
      reponse: true,
      justification: [texte("Un chemin à "), latex("k"), texte(" succès est déterminé par les "), latex("k"), texte(" rangs des succès parmi les "), latex("n"), texte(" épreuves : on choisit "), latex("k"), texte(" rangs parmi "), latex("n"), texte(", sans ordre.")],
    },
    {
      enonce: [texte("Le nombre de chemins de l'arbre qui comptent exactement "), latex("k"), texte(" succès en "), latex("n"), texte(" épreuves vaut "), latex("A_{n}^{k}"), texte(", car les succès arrivent dans un certain ordre.")],
      reponse: false,
      justification: [texte("Un chemin est déterminé par l'ensemble des rangs de ses succès ; l'ordre dans lequel on énumère ces rangs ne change pas le chemin : il y en a "), latex("C_{n}^{k}"), texte(".")],
    },
    {
      enonce: [texte("Pour toute valeur de "), latex("p"), texte(", "), latex("\\displaystyle\\sum_{k=0}^{n}C_{n}^{k}\\,p^k(1-p)^{n-k}=\\big(p+(1-p)\\big)^n=1"), texte(".")],
      reponse: true,
      justification: [texte("C'est le binôme de Newton avec "), latex("a=1-p"), texte(" et "), latex("b=p"), texte(" : la somme des probabilités de la loi binomiale vaut 1.")],
    },
    {
      enonce: [texte("La somme "), latex("\\displaystyle\\sum_{k=0}^{n}C_{n}^{k}\\,p^k(1-p)^{n-k}"), texte(" vaut "), latex("2^n"), texte(", comme la somme des coefficients d'une ligne du triangle de Pascal.")],
      reponse: false,
      justification: [texte("La somme d'une ligne vaut "), latex("2^n"), texte(" quand "), latex("a=b=1"), texte(" ; ici "), latex("a+b=(1-p)+p=1"), texte(", donc la somme vaut "), latex("1^n=1"), texte(".")],
    },
    {
      enonce: [texte("On tire 5 cartes avec remise dans un jeu de 32 et on compte les as obtenus : ce nombre suit une loi binomiale de paramètres "), latex("n=5"), texte(" et "), latex("p=\\dfrac{4}{32}"), texte(".")],
      reponse: true,
      justification: [texte("Avec remise, les 5 tirages sont indépendants et la probabilité de tirer un as reste "), latex("\\dfrac{4}{32}"), texte(" à chaque tirage.")],
    },
    {
      enonce: [texte("On tire 5 cartes sans remise dans un jeu de 32 et on compte les as obtenus : ce nombre suit une loi binomiale de paramètres "), latex("n=5"), texte(" et "), latex("p=\\dfrac{4}{32}"), texte(".")],
      reponse: false,
      justification: [texte("Sans remise, la composition du jeu change à chaque tirage : c'est la loi hypergéométrique ("), latex("N=32"), texte(", "), latex("K=4"), texte(", "), latex("n=5"), texte("), pas la binomiale.")],
    },
    {
      enonce: [texte("Pour "), latex("p=0{,}5"), texte(", on a "), latex("P(X=k)=P(X=n-k)"), texte(" pour tout "), latex("k"), texte(" de 0 à "), latex("n"), texte(".")],
      reponse: true,
      justification: [latex("P(X=k)=C_{n}^{k}\\times0{,}5^n"), texte(" et "), latex("C_{n}^{k}=C_{n}^{n-k}"), texte(" : la distribution est symétrique.")],
    },
    {
      enonce: [texte("La loi binomiale ne s'applique que si la probabilité de succès vaut "), latex("0{,}5"), texte(".")],
      reponse: false,
      justification: [texte("Il faut des épreuves indépendantes et une probabilité de succès constante, quelle que soit sa valeur entre 0 et 1.")],
    },
    {
      enonce: [texte("On lance 10 fois un dé équilibré et on compte les 6 obtenus : ce nombre suit une loi binomiale de paramètres "), latex("n=10"), texte(" et "), latex("p=\\dfrac{1}{6}"), texte(".")],
      reponse: true,
      justification: [texte("Les lancers sont indépendants et la probabilité d'obtenir 6 vaut "), latex("\\dfrac{1}{6}"), texte(" à chaque lancer.")],
    },
    {
      enonce: [texte("Dans la loi binomiale, "), latex("P(X=n)=C_{n}^{n}\\times p^n\\times(1-p)^0=0"), texte(", car "), latex("(1-p)^0=0"), texte(".")],
      reponse: false,
      justification: [latex("(1-p)^0=1"), texte(" (pour "), latex("p\\neq1"), texte(") : "), latex("P(X=n)=p^n"), texte(", la probabilité que toutes les épreuves réussissent.")],
    },
  ],
};
