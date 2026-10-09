/**
 * Couche A — banque de contenu pour "Analyse combinatoire" (quiz vrai/faux), chapitre 9 du
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
  // Scénarios fixes : A(8,3)=336, C(8,3)=56 ; nombres à 4/3 chiffres tous distincts (0-9, premier
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
      enonce: [texte("Pour tout "), latex("n"), texte(" et "), latex("k"), texte(", on a "), latex("A_{n}^{k}=C_{n}^{k}+k!"), texte(".")],
      reponse: false,
      justification: [texte("La relation correcte est une MULTIPLICATION, pas une addition : "), latex("A_{n}^{k}=C_{n}^{k}\\times k!"), texte(".")],
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
        texte("Le nombre de nombres à 4 chiffres TOUS DISTINCTS (choisis parmi 0-9), premier chiffre non nul, est "),
        latex("9\\times9\\times8\\times7=4536"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("9 choix pour le premier chiffre (non nul), puis 9, 8 et 7 choix pour les positions suivantes (0 redevient disponible dès la 2ᵉ position).")],
    },
    {
      enonce: [
        texte("Ce même dénombrement (4 chiffres distincts, premier chiffre non nul) vaudrait aussi "),
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
        texte("Le nombre de nombres à 3 chiffres TOUS DISTINCTS (choisis parmi 0-9), premier chiffre non nul, est "),
        latex("9\\times9\\times8=648"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Même principe : 9 choix pour le premier chiffre (non nul), 9 puis 8 pour les 2 positions suivantes.")],
    },
    {
      enonce: [
        texte("Ce même dénombrement (3 chiffres distincts, premier chiffre non nul) vaudrait "),
        latex("9\\times8\\times7=504"),
        texte(" si l'on excluait aussi le chiffre 0 des 2ᵉ et 3ᵉ positions."),
      ],
      reponse: false,
      justification: [
        texte("Exclure 0 partout est une erreur : seul le PREMIER chiffre doit être non nul, 0 reste autorisé ensuite. La bonne valeur est "),
        latex("648"), texte(", pas "), latex("504"), texte("."),
      ],
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
      enonce: [
        texte("Pour retrouver "), latex("n"), texte(" à partir de "), latex("D"), texte(", on résout "), latex("n^2-3n-2D=0"), texte(" ; pour "), latex("D=27"),
        texte(", on obtient "), latex("n=9"), texte(" (racine positive de l'équation)."),
      ],
      reponse: true,
      justification: [texte("Discriminant "), latex("9+8\\times27=225=15^2"), texte(", donc "), latex("n=\\dfrac{3+15}{2}=9"), texte(".")],
    },
    {
      enonce: [
        texte("Pour ce même "), latex("D=27"), texte(", l'équation "), latex("n^2-3n-54=0"), texte(" admet aussi "), latex("n=-6"),
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
        texte("Pour ces mêmes 7 personnes disposées en COLLIER (rotations ET réflexions équivalentes), il y a aussi "),
        latex("720"),
        texte(" dispositions distinctes, car un collier revient exactement au même dénombrement qu'une table."),
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
        texte("Si l'on impose en plus que les 2 lettres de cette plaque soient DIFFÉRENTES (chiffres toujours libres de se répéter), le nombre total de plaques passe à "),
        latex("25\\times25\\times10^3=625\\,000"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Il faut "), latex("26"), texte(" choix pour la première lettre puis "), latex("25"), texte(" pour la seconde (différente de la première), soit "),
        latex("26\\times25\\times1000=650\\,000"), texte(", pas "), latex("625\\,000"), texte("."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
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
        texte("Pour ces mêmes 6 chiffres, autoriser la répétition ne peut que FAIRE DIMINUER le dénombrement, puisqu'il faut ensuite retirer toutes les écritures contenant deux fois le même chiffre."),
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
      enonce: [
        texte("La permutation simple exige de retenir une formule à part : poser "), latex("n=k=p"), texte(" dans "), latex("A_{n}^{k}"),
        texte(" donnerait "), latex("\\dfrac{p!}{0!}"), texte(", une expression indéfinie."),
      ],
      reponse: false,
      justification: [
        latex("0!=1"), texte(" par convention, donc "), latex("A_{p}^{p}=\\dfrac{p!}{0!}=p!=P_{p}"),
        texte(" — la permutation simple est exactement le cas "), latex("k=n"), texte(" de l'arrangement, aucune formule séparée à mémoriser."),
      ],
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
        texte("Ce même dénombrement (3 lettres parmi 5, répétition autorisée, ordre ignoré) vaut "), latex("C_{5}^{3}=10"),
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
        texte("Le nombre de nombres à 5 chiffres TOUS DISTINCTS (parmi 0-9), premier chiffre non nul, est "),
        latex("9\\times9\\times8\\times7\\times6=27\\,216"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Même principe qu'à 4 chiffres, avec une position de plus : 9 choix pour le premier chiffre, puis 9, 8, 7 et 6 pour les suivantes.")],
    },
    {
      enonce: [
        texte("Le nombre de nombres à 4 chiffres TOUS DISTINCTS et PAIRS (premier chiffre non nul) est "),
        latex("5\\times9\\times8\\times7=2520"),
        texte(" : 5 choix pour le dernier chiffre (0, 2, 4, 6 ou 8), puis 9, 8 et 7 pour les autres positions."),
      ],
      reponse: false,
      justification: [
        texte("Ce raisonnement oublie que le premier chiffre dispose de 9 choix si le dernier chiffre est 0, mais de 8 seulement s'il est non nul : "),
        latex("56\\times(9+4\\times8)=56\\times41=2296"), texte(", pas "), latex("2520"), texte("."),
      ],
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
        texte(", obtenus en retirant du total ceux qui ne le contiennent pas."),
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
        texte("Pour cette même répartition en groupes nommés, il suffirait de calculer "), latex("C_{10}^{5}\\times C_{10}^{3}\\times C_{10}^{2}"),
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
        texte("Ce même dénombrement (président + 2 vice-présidents) pourrait aussi s'écrire "), latex("C_{10}^{3}"),
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
      enonce: [texte("Ce même dénombrement vaudrait aussi "), latex("C_{8}^{2}+C_{6}^{2}=28+15=43"), texte(", puisque les deux choix sont indépendants.")],
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
      enonce: [texte("Ce même dénombrement vaudrait "), latex("C_{10}^{3}\\times C_{15}^{3}=120\\times455=54\\,600"), texte(", car il faut combiner les deux choix.")],
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
        texte("Ce nombre de 21 dominos correspond aussi à "), latex("C_{6}^{2}=15"),
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
        texte("Avec ces mêmes 2 dés mais devenus INDISCERNABLES (impossible de dire lequel est lequel), il y a encore "), latex("36"),
        texte(" résultats distincts possibles, car le nombre de dés ne change pas."),
      ],
      reponse: false,
      justification: [
        texte("Rendre les dés indiscernables fusionne les paires symétriques (ex. \"3 puis 5\" et \"5 puis 3\" deviennent le même résultat) : le vrai compte tombe à "),
        latex("C_{7}^{2}=21"), texte(", pas "), latex("36"), texte("."),
      ],
    },
    {
      enonce: [texte("Le nombre de résultats DISCERNABLES (36) est strictement supérieur au nombre de résultats INDISCERNABLES (21) pour ces mêmes 2 dés, car regrouper les cas symétriques réduit le décompte total.")],
      reponse: true,
      justification: [texte("36 > 21 : fusionner chaque paire symétrique distincte (ex. \"2 puis 5\"/\"5 puis 2\") en un seul résultat indiscernable diminue nécessairement le total.")],
    },
    {
      enonce: [
        texte("Le rapport entre le nombre discernable (36) et le nombre indiscernable (21) est exactement 2, comme si chaque résultat indiscernable correspondait toujours à exactement 2 résultats discernables."),
      ],
      reponse: false,
      justification: [
        latex("\\dfrac{36}{21}=\\dfrac{12}{7}\\approx1{,}71"), texte(", pas "), latex("2"), texte(" : les 6 doubles (1-1, 2-2, ...) correspondent chacun à UN SEUL résultat discernable, alors que les paires de valeurs différentes en correspondent à DEUX — le rapport n'est donc pas uniforme."),
      ],
    },
    {
      enonce: [
        texte("On choisit 6 personnes parmi 20, avec la contrainte que 2 personnes précises, X et Y, ne peuvent JAMAIS être choisies ensemble. Le nombre de choix valides est "),
        latex("C_{20}^{6}-C_{18}^{4}=38\\,760-3060=35\\,700"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("On part du total sans contrainte ("), latex("C_{20}^{6}"), texte(") et on retire les cas où X ET Y sont TOUS DEUX inclus ("), latex("C_{18}^{4}"), texte(", en choisissant les 4 restants parmi les 18 autres).")],
    },
    {
      enonce: [
        texte("Pour cette même contrainte (X et Y jamais ensemble), il suffit d'ADDITIONNER "), latex("C_{18}^{4}"), texte(" à "), latex("C_{20}^{6}"),
        texte(" plutôt que de le soustraire, pour ne pas exclure les cas interdits."),
      ],
      reponse: false,
      justification: [
        texte("Il faut au contraire RETIRER les cas interdits (X et Y ensemble) du total, donc SOUSTRAIRE : "), latex("C_{20}^{6}-C_{18}^{4}"), texte(", jamais additionner."),
      ],
    },
    {
      enonce: [
        texte("Avec les mêmes 20 personnes, si l'on impose au contraire que X et Y soient choisis ENSEMBLE ou pas du tout (jamais séparément), le nombre de choix valides pour une sélection de 6 personnes est "),
        latex("C_{18}^{4}+C_{18}^{6}=3060+18\\,564=21\\,624"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Cas 1 : X et Y inclus tous les deux, il reste 4 places parmi les 18 autres ("), latex("C_{18}^{4}"), texte("). Cas 2 : X et Y exclus tous les deux, il reste 6 places parmi les 18 autres ("), latex("C_{18}^{6}"), texte("). Les 2 cas sont disjoints, on les additionne.")],
    },
    {
      enonce: [
        texte("Ce dénombrement (X et Y ensemble ou absents tous les deux) donne exactement le même résultat, "), latex("35\\,700"),
        texte(", que la contrainte opposée (X et Y jamais ensemble) de l'affirmation précédente."),
      ],
      reponse: false,
      justification: [texte("Les 2 contraintes donnent des résultats DIFFÉRENTS : "), latex("21\\,624"), texte(" pour \"ensemble ou absents\", contre "), latex("35\\,700"), texte(" pour \"jamais ensemble\".")],
    },
    {
      enonce: [texte("Le coefficient binomial "), latex("C_{20}^{6}"), texte(" utilisé ci-dessus vaut aussi "), latex("C_{20}^{14}"), texte(", par symétrie "), latex("C_{n}^{k}=C_{n}^{n-k}"), texte(".")],
      reponse: true,
      justification: [texte("Choisir 6 personnes parmi 20 revient à en LAISSER 14 de côté : les deux dénombrements sont donc rigoureusement égaux.")],
    },
    {
      enonce: [
        latex("C_{20}^{6}=C_{20}^{6}\\times2"), texte(", car on pourrait choisir les 6 personnes OU les 14 personnes restantes, ce qui doublerait le compte."),
      ],
      reponse: false,
      justification: [
        texte("Choisir les 6 ou choisir les 14 restantes désigne LA MÊME sélection (un même groupe de 6 personnes détermine entièrement les 14 laissées de côté) : il n'y a rien à doubler, "),
        latex("C_{20}^{6}=C_{20}^{14}"), texte(", pas le double de lui-même."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Le mot MISSISSIPI compte 10 lettres (1 M, 4 I, 4 S, 1 P) : le nombre de permutations DISTINCTES de ces 10 lettres est "),
        latex("\\dfrac{10!}{4!\\times4!}=\\dfrac{3\\,628\\,800}{576}=6300"),
        texte("."),
      ],
      reponse: true,
      justification: [
        texte("C'est la formule multinomiale réinterprétée : diviser par "), latex("4!"), texte(" (les I) et par "), latex("4!"),
        texte(" (les S) retire les réordonnancements internes des lettres identiques, qui ne produisent aucun mot nouveau."),
      ],
    },
    {
      enonce: [
        texte("Ce même dénombrement s'écrit "), latex("\\dfrac{10!}{4!+4!}=\\dfrac{3\\,628\\,800}{48}=75\\,600"),
        texte(", en additionnant les factorielles des effectifs répétés."),
      ],
      reponse: false,
      justification: [
        texte("La formule multinomiale DIVISE par le PRODUIT des factorielles, jamais par leur somme : "),
        latex("\\dfrac{10!}{4!\\times4!}=6300"), texte(", pas "), latex("75\\,600"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le nombre d'ANAGRAMMES du mot MISSISSIPI est donc lui aussi 6300."),
      ],
      reponse: false,
      justification: [
        texte("Une anagramme est un mot DIFFÉRENT du mot de départ : il faut retirer MISSISSIPI lui-même du compte, soit "),
        latex("6300-1=6299"), texte(" anagrammes."),
      ],
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
      enonce: [
        texte("Si les 10 lettres de MISSISSIPI étaient TOUTES différentes, le nombre de permutations distinctes resterait 6300 : la formule ne dépend que du nombre total de lettres."),
      ],
      reponse: false,
      justification: [
        texte("Sans aucune lettre répétée, tous les dénominateurs valent "), latex("1!"), texte(" et la formule redonne "),
        latex("10!=3\\,628\\,800"), texte(" — une permutation simple, très loin de "), latex("6300"), texte("."),
      ],
    },
    {
      enonce: [
        texte("12 personnes réparties en 3 groupes nommés de tailles 3, 4 et 5 donnent "),
        latex("\\dfrac{12!}{3!\\times4!\\times5!}=27\\,720"),
        texte(" répartitions, valeur que l'on retrouve aussi par étapes successives : "),
        latex("C_{12}^{3}\\times C_{9}^{4}\\times C_{5}^{5}=220\\times126\\times1=27\\,720"),
        texte("."),
      ],
      reponse: true,
      justification: [texte("Chaque facteur puise dans les personnes RESTANTES (12, puis 9, puis 5) : les deux écritures de la multinomiale coïncident toujours.")],
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
        texte("Ce même bureau (1 président + 3 vice-présidents parmi 12) se compte "), latex("12\\times C_{11}^{3}=12\\times165=1980"),
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
        texte("Pour ce même partage 5/7 de 12 personnes, il faut doubler le résultat ("), latex("2\\times792=1584"),
        texte("), les 2 groupes pouvant s'échanger."),
      ],
      reponse: false,
      justification: [
        texte("Les 2 groupes ont des tailles DIFFÉRENTES (5 et 7) : ils ne peuvent jamais s'échanger, aucun partage n'est compté deux fois. La réponse reste "),
        latex("792"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Avec 10 valeurs possibles par face, le nombre de dominos distincts vaut "), latex("C_{10}^{2}+10=45+10=55"),
        texte(", ce qui est aussi "), latex("C_{11}^{2}=55"), texte("."),
      ],
      reponse: true,
      justification: [texte("45 dominos à 2 valeurs différentes plus 10 doubles ; la bijection classique regroupe les deux cas en "), latex("C_{n+1}^{2}"), texte(".")],
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
      enonce: [
        texte("On choisit 5 personnes parmi 15, avec 2 personnes précises X et Y qui ne peuvent jamais être choisies ensemble : "),
        latex("C_{15}^{5}-C_{13}^{3}=3003-286=2717"),
        texte(" sélections valides."),
      ],
      reponse: true,
      justification: [texte("Total sans contrainte moins les cas interdits (X et Y tous deux inclus, les 3 places restantes étant prises parmi les 13 autres).")],
    },
    {
      enonce: [
        texte("Avec les mêmes 15 personnes et 5 places, si X et Y doivent être pris ENSEMBLE ou pas du tout, il y a "),
        latex("C_{13}^{3}+C_{13}^{5}=286+1287=1573"),
        texte(" sélections valides."),
      ],
      reponse: true,
      justification: [texte("Deux cas disjoints à additionner : les 2 inclus (3 places restantes parmi 13) ou les 2 exclus (5 places parmi 13).")],
    },
    {
      enonce: [
        texte("Si l'énoncé précise en plus que les 15 personnes se répartissent en 2 catégories (par exemple 6 juniors et 9 seniors), X et Y étant tous deux juniors, alors le calcul de l'exclusion \"X et Y jamais ensemble\" change et ne vaut plus "),
        latex("C_{15}^{5}-C_{13}^{3}"),
        texte("."),
      ],
      reponse: false,
      justification: [
        texte("Tant que la sélection reste LIBRE sur l'ensemble des 15 personnes, le partage en catégories n'est qu'un habillage narratif : la combinatoire ne le voit pas, le calcul reste "),
        latex("C_{15}^{5}-C_{13}^{3}=2717"), texte("."),
      ],
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
      enonce: [
        texte("Dans ce développement, le terme général s'écrit plutôt "), latex("T_{k+1}=C_{5}^{k}\\times(2x)^k\\times(-1)^{5-k}"),
        texte(", avec "), latex("k"), texte(" représentant la puissance de "), latex("x"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Les exposants sont inversés : c'est "), latex("(2x)"), texte(" qui porte l'exposant "), latex("5-k"), texte(" (décroissant) et "), latex("(-1)"), texte(" l'exposant "), latex("k"), texte(" (croissant), jamais l'inverse."),
      ],
    },
    {
      enonce: [texte("Le premier terme du développement ("), latex("k=0"), texte(") vaut "), latex("C_{5}^{0}\\times2^5\\times(-1)^0=1\\times32\\times1=32"), texte(".")],
      reponse: true,
      justification: [latex("C_{5}^{0}=1"), texte(", "), latex("2^5=32"), texte(", "), latex("(-1)^0=1"), texte(" : produit "), latex("32"), texte(".")],
    },
    {
      enonce: [
        texte("Le premier terme du développement ("), latex("k=0"), texte(") vaut "), latex("C_{5}^{0}\\times2^5\\times(-1)^0=-32"),
        texte(", car "), latex("(-1)^0=-1"), texte("."),
      ],
      reponse: false,
      justification: [latex("(-1)^0=1"), texte(", pas "), latex("-1"), texte(" : tout nombre non nul élevé à la puissance 0 vaut 1. Le premier terme vaut donc "), latex("+32"), texte(".")],
    },
    {
      enonce: [texte("Le terme pour "), latex("k=1"), texte(" vaut "), latex("C_{5}^{1}\\times2^4\\times(-1)^1=5\\times16\\times(-1)=-80"), texte(".")],
      reponse: true,
      justification: [latex("5\\times16=80"), texte(", puis "), latex("\\times(-1)=-80"), texte(".")],
    },
    {
      enonce: [texte("Le terme pour "), latex("k=1"), texte(" vaut "), latex("+80"), texte(", car un exposant impair de "), latex("(-1)"), texte(" donne toujours un résultat positif.")],
      reponse: false,
      justification: [texte("C'est l'inverse : un exposant IMPAIR de "), latex("-1"), texte(" donne toujours un résultat NÉGATIF ("), latex("(-1)^1=-1"), texte("), un exposant pair donne un résultat positif.")],
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
        texte("Cette même somme, évaluée en "), latex("x=1"), texte(", vaut plutôt "), latex("2^5-1^5=31"),
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
      enonce: [texte("Ces mêmes coefficients vérifient plutôt "), latex("C_{5}^{2}=C_{5}^{4}"), texte(", tous deux égaux à "), latex("10"), texte(".")],
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
      enonce: [texte("Cette même somme vaut plutôt "), latex("5^2=25"), texte(", car il y a 5 termes non triviaux dans le développement.")],
      reponse: false,
      justification: [texte("Le développement de "), latex("(a+b)^5"), texte(" comporte en réalité 6 termes ("), latex("k=0"), texte(" à "), latex("k=5"), texte("), pas 5, et leur somme vaut "), latex("2^5=32"), texte(", pas "), latex("25"), texte(".")],
    },
    {
      enonce: [
        texte("Pour "), latex("\\varepsilon=0{,}01"), texte(" petit, "), latex("(1+\\varepsilon)^4\\approx1+4\\varepsilon=1{,}04"),
        texte(", une approximation très proche de la valeur exacte "), latex("1{,}01^4\\approx1{,}0406"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le terme "), latex("C_{4}^{1}\\varepsilon=4\\varepsilon"), texte(" domine largement les termes suivants ("), latex("C_{4}^{2}\\varepsilon^2=0{,}0006"), texte(", etc.) lorsque "), latex("\\varepsilon"), texte(" est petit.")],
    },
    {
      enonce: [
        texte("Cette approximation néglige tous les autres termes du développement (ceux en "), latex("\\varepsilon^2,\\varepsilon^3,\\varepsilon^4"),
        texte("), qui sont TOUS rigoureusement NULS pour "), latex("\\varepsilon=0{,}01"), texte("."),
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
        texte("Dans ce développement, le terme contenant "), latex("x^2"), texte(" correspond plutôt à "), latex("k=2"),
        texte(" (en associant directement "), latex("k"), texte(" à l'exposant cherché), ce qui donnerait "), latex("C_{5}^{2}\\times2^3\\times(-1)^2=10\\times8\\times1=80"), texte(" comme coefficient de "), latex("x^2"), texte("."),
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
      enonce: [texte("Ce développement comporte exactement 5 termes, autant que l'exposant "), latex("n=5"), texte(" lui-même.")],
      reponse: false,
      justification: [texte("Il comporte "), latex("6"), texte(" termes ("), latex("k=0"), texte(" à "), latex("k=5"), texte("), pas "), latex("5"), texte(" — on oublie souvent le terme "), latex("k=0"), texte(".")],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
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
        texte("Dans ce même développement de "), latex("(3x+2)^4"), texte(", le terme CONSTANT (sans "), latex("x"), texte(") vaut "),
        latex("81"), texte(", obtenu pour "), latex("k=0"), texte("."),
      ],
      reponse: false,
      justification: [
        latex("k=0"), texte(" donne au contraire le terme de plus haut degré, "), latex("81x^4"), texte(". Le terme constant s'obtient pour "),
        latex("k=4"), texte(" et vaut "), latex("C_{4}^{4}\\times2^4=16"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Les coefficients du développement de "), latex("(3x+2)^4"), texte(" sont "), latex("81,\\;216,\\;216,\\;96,\\;16"),
        texte(" et leur somme vaut "), latex("(3+2)^4=5^4=625"), texte("."),
      ],
      reponse: true,
      justification: [
        latex("81+216+216+96+16=625"), texte(" : évaluer le développement en "), latex("x=1"), texte(" redonne toujours la base élevée à la puissance "), latex("n"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Ces coefficients "), latex("81,\\;216,\\;216,\\;96,\\;16"),
        texte(" se lisent de la même façon dans les deux sens, car les coefficients binomiaux de la ligne "), latex("n=4"), texte(" sont symétriques."),
      ],
      reponse: false,
      justification: [
        texte("Ce sont les "), latex("C_{4}^{k}"), texte(" ("), latex("1,4,6,4,1"), texte(") qui sont symétriques, jamais les coefficients FINAUX : dès que "),
        latex("a\\neq b"), texte(", les puissances de "), latex("a"), texte(" et "), latex("b"), texte(" brisent la symétrie ("), latex("81\\neq16"), texte(")."),
      ],
    },
    {
      enonce: [
        texte("Le coefficient du terme en "), latex("x^2"), texte(" de "), latex("(3x+2)^4"), texte(" est le coefficient binomial "), latex("C_{4}^{2}=6"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le coefficient binomial n'est qu'UN des trois facteurs : "), latex("C_{4}^{2}\\times3^2\\times2^2=6\\times9\\times4=216"),
        texte(" — les puissances de "), latex("a"), texte(" et de "), latex("b"), texte(" ne s'oublient jamais."),
      ],
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
        texte("Parmi ces 16 mots, ceux comportant exactement 2 lettres "), latex("b"), texte(" sont au nombre de "), latex("4\\times3=12"),
        texte(" (choix de la position du premier "), latex("b"), texte(", puis du second)."),
      ],
      reponse: false,
      justification: [
        latex("4\\times3=12"), texte(" compte les 2 positions dans un ORDRE, alors que les 2 lettres "), latex("b"),
        texte(" sont interchangeables : il faut diviser par "), latex("2!"), texte(", d'où "), latex("C_{4}^{2}=6"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("\\varepsilon=-0{,}02"), texte(", l'approximation "), latex("(1+\\varepsilon)^5\\approx1+5\\varepsilon=0{,}90"),
        texte(" reste très proche de la valeur exacte "), latex("0{,}98^5\\approx0{,}9039"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Le terme suivant, "), latex("C_{5}^{2}\\times(-0{,}02)^2=0{,}004"),
        texte(", est déjà petit devant 1 : l'approximation reste bonne, à moins de 0,004 près."),
      ],
    },
    {
      enonce: [
        texte("Cette approximation "), latex("(1+\\varepsilon)^n\\approx1+n\\varepsilon"), texte(" ne s'applique qu'aux valeurs POSITIVES de "),
        latex("\\varepsilon"), texte(" : pour "), latex("\\varepsilon"), texte(" négatif, les termes négligés changent de signe et ne sont plus négligeables."),
      ],
      reponse: false,
      justification: [
        texte("Seule compte la PETITESSE de "), latex("\\varepsilon"), texte(", pas son signe : pour "), latex("\\varepsilon=-0{,}02"),
        texte(", les termes suivants restent minuscules ("), latex("0{,}004"), texte(" puis moins encore) et l'approximation fonctionne aussi bien."),
      ],
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
        texte("Ce nombre de mains 'carré' (224) est le MÊME que le nombre de mains 'brelan' (3 cartes de même hauteur + 2 cartes d'hauteurs différentes entre elles), qui vaut aussi "),
        latex("224"), texte("."),
      ],
      reponse: false,
      justification: [texte("Le brelan vaut en réalité "), latex("10\\,752"), texte(", bien plus que "), latex("224"), texte(" : moins de contraintes (2 cartes libres au lieu d'1 fixée) laisse plus de possibilités.")],
    },
    {
      enonce: [
        texte("Le nombre de mains 'brelan' ("), latex("3"), texte(" cartes de même hauteur, "), latex("2"), texte(" cartes d'hauteurs différentes entre elles et du brelan) vaut "),
        latex("32\\times336=10\\,752"), texte("."),
      ],
      reponse: true,
      justification: [texte("8 hauteurs × 4 façons de choisir les couleurs du brelan ("), latex("C_{4}^{3}=4"), texte(") = 32, puis "), latex("C_{7}^{2}\\times4\\times4=336"), texte(" pour les 2 cartes restantes.")],
    },
    {
      enonce: [texte("Ce nombre de mains 'brelan' ("), latex("10\\,752"), texte(") est INFÉRIEUR au nombre de mains 'carré' ("), latex("224"), texte("), car un brelan est une combinaison moins contraignante qu'un carré.")],
      reponse: false,
      justification: [
        texte("C'est l'inverse : moins de contraintes donne un décompte PLUS grand, pas plus petit — "), latex("10\\,752>224"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Le nombre de mains 'paire' ("), latex("2"), texte(" cartes de même hauteur + "), latex("3"), texte(" cartes d'hauteurs toutes différentes entre elles et de la paire) vaut "),
        latex("107\\,520"), texte(", le plus grand des 4 dénombrements de cette famille (carré, brelan, paire, deux paires)."),
      ],
      reponse: true,
      justification: [texte("La contrainte la plus légère (une seule paire imposée, 3 cartes libres) laisse le plus de possibilités parmi ces 4 catégories.")],
    },
    {
      enonce: [
        texte("Le nombre de mains 'deux paires' (2 paires d'hauteurs différentes + 1 carte d'une 3ᵉ hauteur), qui vaut "), latex("24\\,192"),
        texte(", est PLUS GRAND que celui des mains 'paire' ("), latex("107\\,520"), texte(")."),
      ],
      reponse: false,
      justification: [latex("24\\,192<107\\,520"), texte(" : imposer une 2ᵉ paire est une contrainte SUPPLÉMENTAIRE, elle réduit le nombre de mains possibles, pas l'inverse.")],
    },
    {
      enonce: [texte("Avec 3 dés à 6 faces, les sommes 9 et 10 admettent chacune exactement 6 décompositions non ordonnées (partitions) en 3 valeurs de 1 à 6.")],
      reponse: true,
      justification: [texte("C'est le point de départ du paradoxe historique du Chevalier de Méré : {1;2;6},{1;3;5},{1;4;4},{2;2;5},{2;3;4},{3;3;3} pour 9, et 6 partitions analogues pour 10.")],
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
      enonce: [
        texte("Le nombre de TRIPLETS ORDONNÉS "), latex("(a,b,c)"), texte(" de dés menant à une somme de 9 est 25, contre 27 pour une somme de 10 — c'est pourquoi obtenir 10 est légèrement plus probable qu'obtenir 9 avec 3 dés."),
      ],
      reponse: true,
      justification: [texte("C'est la résolution historique du paradoxe : bien que le nombre de PARTITIONS soit identique (6 chacune), le nombre de triplets ORDONNÉS diffère (25 contre 27), rendant 10 légèrement plus probable.")],
    },
    {
      enonce: [
        texte("Le nombre de triplets ordonnés menant à une somme de 9 est en réalité 27, soit plus que pour une somme de 10 (25) — obtenir 9 serait donc légèrement plus probable."),
      ],
      reponse: false,
      justification: [texte("Les valeurs sont inversées : 9 correspond à 25 triplets ordonnés, 10 à 27 — c'est 10 qui est (légèrement) plus probable, pas 9.")],
    },
    {
      enonce: [
        texte("Parmi les décompositions de la somme 9, le triplet "), latex("\\{1;2;6\\}"), texte(" (valeurs toutes différentes) admet "), latex("3!=6"),
        texte(" arrangements ordonnés distincts."),
      ],
      reponse: true,
      justification: [texte("3 valeurs toutes différentes peuvent s'ordonner de "), latex("3!=6"), texte(" façons différentes sur les 3 dés.")],
    },
    {
      enonce: [
        texte("Le triplet "), latex("\\{3;3;3\\}"), texte(" (les 3 dés affichent la même valeur), qui donne aussi la somme 9, admet lui aussi 6 arrangements ordonnés distincts, comme n'importe quel triplet."),
      ],
      reponse: false,
      justification: [
        texte("Un triplet aux 3 valeurs IDENTIQUES n'admet qu'UN SEUL arrangement ordonné ("), latex("3!/3!=1"), texte("), car permuter des dés qui affichent tous la même valeur ne change rien à l'issue observée."),
      ],
    },
    {
      enonce: [
        texte("12 objets sont répartis dans 3 boîtes numérotées, de tailles fixées 6, 4 et 2. Le nombre de répartitions possibles est "),
        latex("\\dfrac{12!}{6!\\times4!\\times2!}=13\\,860"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est le même principe multinomial que pour une répartition de personnes en groupes ("), latex("6gen44"), texte("), appliqué ici à des objets et des boîtes.")],
    },
    {
      enonce: [texte("Ce même dénombrement vaudrait aussi "), latex("C_{12}^{6}+C_{12}^{4}+C_{12}^{2}"), texte(", en additionnant les choix pour chaque boîte séparément.")],
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
        texte("Ce même dispositif offrirait plutôt "), latex("3^4=81"),
        texte(" configurations distinctes, en élevant le nombre d'éléments à la puissance du nombre de positions."),
      ],
      reponse: false,
      justification: [
        texte("C'est le nombre de positions qui est la base et le nombre d'éléments l'exposant : "), latex("4^3=64"), texte(", pas "), latex("3^4=81"), texte(" — les deux ont d'ailleurs des valeurs différentes."),
      ],
    },
    {
      enonce: [
        texte("Si les 3 éléments de ce dispositif devaient au contraire occuper 3 positions TOUTES DIFFÉRENTES (parmi les 4 disponibles, sans répétition), le nombre de configurations deviendrait "),
        latex("A_{4}^{3}=4\\times3\\times2=24"), texte(", strictement inférieur aux 64 configurations avec répétition autorisée."),
      ],
      reponse: true,
      justification: [texte("Interdire la répétition réduit toujours les possibilités : "), latex("24<64"), texte(".")],
    },
    {
      enonce: [texte("Ce nombre de configurations sans répétition (24) resterait le même que celui avec répétition (64), car le nombre d'éléments et de positions ne change pas.")],
      reponse: false,
      justification: [texte("Le nombre d'éléments/positions ne change pas, mais la CONTRAINTE (répétition permise ou non) change bien le décompte : "), latex("24\\neq64"), texte(".")],
    },
    {
      enonce: [
        texte("Le nombre total de mains de 5 cartes possibles parmi les 32 cartes du jeu est "), latex("C_{32}^{5}=201\\,376"),
        texte(", un nombre bien plus grand que chacun des 4 dénombrements spécifiques (carré, brelan, paire, deux paires) étudiés ci-dessus."),
      ],
      reponse: true,
      justification: [texte("Le total de toutes les mains possibles inclut aussi les mains sans aucune répétition de hauteur, absentes des 4 catégories étudiées : il est nécessairement plus grand que chacune d'elles.")],
    },
    {
      enonce: [
        texte("Ce nombre total de mains, "), latex("C_{32}^{5}"), texte(", est exactement égal à la somme des 4 dénombrements spécifiques (carré + brelan + paire + deux paires) = "),
        latex("224+10\\,752+107\\,520+24\\,192=142\\,688"), texte("."),
      ],
      reponse: false,
      justification: [
        latex("142\\,688\\neq201\\,376"), texte(" : ces 4 catégories ne couvrent pas TOUTES les mains possibles (il manque par exemple les mains sans aucune paire, toutes hauteurs différentes)."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Pour les mains 'deux paires', les 2 hauteurs des paires se choisissent par "), latex("C_{8}^{2}=28"),
        texte(", puis 2 couleurs pour chaque paire ("), latex("6\\times6=36"), texte("), soit "), latex("1008"),
        texte(" ; la 5ᵉ carte apporte ensuite "), latex("6\\times4=24"), texte(" possibilités, d'où "), latex("1008\\times24=24\\,192"), texte("."),
      ],
      reponse: true,
      justification: [texte("Les 2 hauteurs déjà utilisées par les paires ne sont plus disponibles pour la 5ᵉ carte : il reste 6 hauteurs × 4 couleurs.")],
    },
    {
      enonce: [
        texte("Pour ces mêmes mains 'deux paires', les 2 hauteurs des paires se comptent "), latex("8\\times7=56"),
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
        texte("Pour les mains 'paire', l'étape 1 vaut "), latex("8\\times C_{4}^{2}=48"), texte(" et l'étape 2 "),
        latex("C_{7}^{3}\\times4^3=35\\times64=2240"), texte(", d'où "), latex("48\\times2240=107\\,520"), texte("."),
      ],
      reponse: true,
      justification: [texte("Hauteur de la paire (8) × 2 couleurs parmi 4, puis 3 hauteurs distinctes parmi les 7 restantes, chacune dans l'une de ses 4 couleurs.")],
    },
    {
      enonce: [
        texte("Pour ces mêmes mains 'paire', les 3 cartes restantes peuvent se choisir librement parmi les 30 cartes qui ne sont pas de la hauteur de la paire, soit "),
        latex("C_{30}^{3}=4060"), texte(" possibilités."),
      ],
      reponse: false,
      justification: [
        texte("Un choix libre autoriserait 2 cartes de même hauteur parmi les 3 restantes, ce qui donnerait une main 'deux paires' ou un 'brelan', jamais une simple paire : les 3 hauteurs doivent être TOUTES différentes, d'où "),
        latex("C_{7}^{3}\\times4^3=2240"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour les mains 'brelan', l'étape 2 (les 2 cartes restantes) vaut "), latex("C_{7}^{2}\\times4\\times4=21\\times16=336"), texte("."),
      ],
      reponse: true,
      justification: [texte("2 hauteurs différentes parmi les 7 encore disponibles, puis une couleur libre pour chacune de ces 2 cartes.")],
    },
    {
      enonce: [
        texte("Les 4 catégories 'carré', 'brelan', 'paire' et 'deux paires' sont deux à deux disjointes ET, à elles quatre, elles recouvrent toutes les mains de 5 cartes du jeu de 32."),
      ],
      reponse: false,
      justification: [
        texte("Disjointes, oui — mais jamais exhaustives : une main dont les 5 hauteurs sont toutes différentes n'appartient à aucune des 4 ("),
        latex("224+10\\,752+107\\,520+24\\,192=142\\,688"), texte(" contre "), latex("201\\,376"), texte(" mains au total)."),
      ],
    },
    {
      enonce: [
        texte("Pour la somme 10 avec 3 dés, les 6 décompositions sont "),
        latex("\\{1;3;6\\},\\{1;4;5\\},\\{2;2;6\\},\\{2;3;5\\},\\{2;4;4\\},\\{3;3;4\\}"),
        texte(" ; comme "), latex("\\{2;2;6\\}"), texte(", "), latex("\\{2;4;4\\}"), texte(" et "), latex("\\{3;3;4\\}"),
        texte(" n'admettent que 3 arrangements chacune, le total des triplets ordonnés vaut "), latex("6+6+3+6+3+3=27"), texte("."),
      ],
      reponse: true,
      justification: [texte("Une décomposition à 3 valeurs distinctes donne 6 triplets ordonnés, une décomposition contenant exactement une paire n'en donne que 3.")],
    },
    {
      enonce: [
        texte("Chacune des 6 décompositions de la somme 10 admet "), latex("3!=6"), texte(" triplets ordonnés, d'où "),
        latex("6\\times6=36"), texte(" triplets au total."),
      ],
      reponse: false,
      justification: [
        latex("3!=6"), texte(" ne vaut que pour des décompositions à 3 valeurs TOUTES différentes ; celles qui contiennent une paire n'en donnent que 3. Le vrai total est "),
        latex("27"), texte(", pas "), latex("36"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour la somme 9, le détail des arrangements s'écrit "), latex("6+6+3+3+6+1=25"),
        texte(" : le triplet "), latex("\\{3;3;3\\}"), texte(" n'apporte qu'un seul triplet ordonné."),
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
      enonce: [
        texte("9 objets répartis dans 3 boîtes numérotées de tailles 4, 3 et 2 donnent "),
        latex("\\dfrac{9!}{4!\\times3!\\times2!}=\\dfrac{362\\,880}{288}=1260"), texte(" répartitions."),
      ],
      reponse: true,
      justification: [texte("Formule multinomiale : "), latex("4!\\times3!\\times2!=24\\times6\\times2=288"), texte(", et "), latex("362\\,880\\div288=1260"), texte(".")],
    },
    {
      enonce: [
        texte("Ce même dénombrement s'écrit "), latex("\\dfrac{9!}{4!+3!+2!}=\\dfrac{362\\,880}{32}=11\\,340"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Le dénominateur d'une multinomiale est le PRODUIT des factorielles des tailles, jamais leur somme : "),
        latex("288"), texte(", pas "), latex("32"), texte(" — d'où "), latex("1260"), texte(", pas "), latex("11\\,340"), texte("."),
      ],
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
        texte("Cette même probabilité s'écrit plutôt "), latex("P(k)=\\dfrac{C_{K}^{k}\\times C_{N-K}^{n-k}}{C_{N}^{k}}"), texte(", avec "), latex("C_{N}^{k}"),
        texte(" au dénominateur plutôt que "), latex("C_{N}^{n}"), texte("."),
      ],
      reponse: false,
      justification: [texte("Le dénominateur doit compter TOUS les tirages possibles de "), latex("n"), texte(" éléments, soit "), latex("C_{N}^{n}"), texte(", jamais "), latex("C_{N}^{k}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", la probabilité d'obtenir exactement 2 succès vaut "),
        latex("P(2)=\\dfrac{C_{6}^{2}\\times C_{14}^{3}}{C_{20}^{5}}=\\dfrac{15\\times364}{15\\,504}=\\dfrac{5460}{15\\,504}\\approx0{,}352"), texte("."),
      ],
      reponse: true,
      justification: [texte("Calcul direct de la formule hypergéométrique avec ces valeurs.")],
    },
    {
      enonce: [
        texte("Pour ces mêmes valeurs, "), latex("P(2)"), texte(" se calculerait plutôt "), latex("\\dfrac{C_{6}^{2}\\times C_{14}^{3}}{C_{20}^{3}}"),
        texte(", en utilisant "), latex("n=3"), texte(" par erreur au dénominateur au lieu de "), latex("n=5"), texte("."),
      ],
      reponse: false,
      justification: [texte("Le dénominateur doit toujours utiliser le VRAI "), latex("n"), texte(" (ici 5, le nombre d'éléments réellement tirés), jamais une autre valeur substituée par erreur.")],
    },
    {
      enonce: [
        texte("Pour ces mêmes "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", la probabilité de n'obtenir AUCUN succès ("), latex("k=0"), texte(") vaut "),
        latex("P(0)=\\dfrac{C_{6}^{0}\\times C_{14}^{5}}{C_{20}^{5}}=\\dfrac{2002}{15\\,504}\\approx0{,}129"), texte("."),
      ],
      reponse: true,
      justification: [latex("C_{6}^{0}=1"), texte(", "), latex("C_{14}^{5}=2002"), texte(", d'où "), latex("P(0)=\\dfrac{2002}{15\\,504}\\approx0{,}129"), texte(".")],
    },
    {
      enonce: [
        texte("Pour cette même probabilité \"aucun succès\", on pourrait remplacer "), latex("C_{6}^{0}"), texte(" par "), latex("C_{6}^{5}"),
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
        texte("Cette même probabilité, (rouge, rouge, bleue) dans cet ordre précis, est la même que celle d'obtenir 2 rouges et 1 bleue dans un ordre QUELCONQUE, puisque les deux questions portent sur les mêmes 3 boules tirées."),
      ],
      reponse: false,
      justification: [
        texte("La probabilité d'une SÉQUENCE précise ("), latex("\\dfrac{5}{36}"), texte(") est bien plus petite que celle de la COMPOSITION correspondante ("), latex("\\dfrac{5}{12}"),
        texte(", qui regroupe les 3 ordres possibles) — ce sont deux questions différentes."),
      ],
    },
    {
      enonce: [
        texte("La probabilité d'obtenir 2 boules rouges et 1 boule bleue, DANS UN ORDRE QUELCONQUE, vaut "), latex("3\\times\\dfrac{5}{36}=\\dfrac{5}{12}"),
        texte(", car il existe "), latex("C_{3}^{2}=3"), texte(" façons d'arranger 2 rouges et 1 bleue parmi les 3 tirages."),
      ],
      reponse: true,
      justification: [texte("3 positions possibles pour la boule bleue unique parmi les 3 tirages, chacune de probabilité "), latex("\\dfrac{5}{36}"), texte(" : "), latex("3\\times\\dfrac{5}{36}=\\dfrac{5}{12}"), texte(".")],
    },
    {
      enonce: [
        texte("Cette probabilité de "), latex("\\dfrac{5}{12}"), texte(" pourrait aussi se retrouver directement avec la formule hypergéométrique : "),
        latex("\\dfrac{C_{5}^{2}\\times C_{5}^{1}}{C_{10}^{3}}=\\dfrac{10\\times5}{120}=\\dfrac{50}{120}"), texte(", ce qui se SIMPLIFIE en "), latex("\\dfrac{5}{6}"), texte(", différent de "), latex("\\dfrac{5}{12}"), texte("."),
      ],
      reponse: false,
      justification: [
        latex("\\dfrac{50}{120}"), texte(" se simplifie en réalité en "), latex("\\dfrac{5}{12}"), texte(" (diviser numérateur et dénominateur par 10), exactement la même valeur que trouvée précédemment — pas "), latex("\\dfrac{5}{6}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Au loto, la probabilité de cocher exactement les 2 bons numéros parmi 4 tirés dans une grille principale de 10 numéros (dont 4 sont \"gagnants\") est "),
        latex("\\dfrac{C_{4}^{2}\\times C_{6}^{0}}{C_{10}^{2}}=\\dfrac{6}{45}=\\dfrac{2}{15}"), texte("."),
      ],
      reponse: true,
      justification: [texte("Formule hypergéométrique avec "), latex("N=10"), texte(", "), latex("K=4"), texte(", "), latex("n=2"), texte(", "), latex("k=2"), texte(".")],
    },
    {
      enonce: [
        texte("Cette probabilité de "), latex("\\dfrac{2}{15}"), texte(" concerne à la fois la grille principale ET le numéro bonus tiré séparément parmi 5 numéros (dont 1 gagnant), sans qu'il faille recalculer quoi que ce soit pour le bonus."),
      ],
      reponse: false,
      justification: [texte("Le bonus est un tirage INDÉPENDANT distinct : il a sa PROPRE probabilité à calculer séparément, jamais incluse automatiquement dans le calcul de la grille principale.")],
    },
    {
      enonce: [
        texte("La probabilité de cocher le bon numéro bonus, tiré parmi 5 numéros dont 1 seul est gagnant, vaut "), latex("\\dfrac{C_{1}^{1}\\times C_{4}^{0}}{C_{5}^{1}}=\\dfrac{1}{5}"), texte("."),
      ],
      reponse: true,
      justification: [texte("1 seul numéro gagnant sur 5 tirés au hasard un par un : probabilité "), latex("\\dfrac{1}{5}"), texte(".")],
    },
    {
      enonce: [
        texte("La probabilité de réussir À LA FOIS la grille principale ("), latex("\\dfrac{2}{15}"), texte(") ET le bonus ("), latex("\\dfrac{1}{5}"),
        texte("), ces deux tirages étant indépendants, s'obtient en les ADDITIONNANT : "), latex("\\dfrac{2}{15}+\\dfrac{1}{5}=\\dfrac{2}{15}+\\dfrac{3}{15}=\\dfrac{5}{15}=\\dfrac{1}{3}"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Un ET entre 2 événements INDÉPENDANTS se traduit par une MULTIPLICATION des probabilités, jamais une addition : la bonne valeur combinée est "),
        latex("\\dfrac{2}{15}\\times\\dfrac{1}{5}=\\dfrac{2}{75}"), texte(", pas "), latex("\\dfrac{1}{3}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("La probabilité de réussir à la fois la grille principale ET le bonus, ces 2 tirages étant réellement indépendants, vaut "),
        latex("\\dfrac{2}{15}\\times\\dfrac{1}{5}=\\dfrac{2}{75}\\approx0{,}027"), texte("."),
      ],
      reponse: true,
      justification: [texte("Deux événements indépendants réunis par un ET : on multiplie leurs probabilités respectives.")],
    },
    {
      enonce: [
        texte("Cette probabilité combinée de "), latex("\\dfrac{2}{75}"), texte(" est PLUS GRANDE que la probabilité de réussir la grille principale seule ("), latex("\\dfrac{2}{15}"),
        texte("), car combiner deux événements augmente toujours la probabilité de succès."),
      ],
      reponse: false,
      justification: [texte("C'est l'inverse : ajouter une condition supplémentaire (le bonus) réduit toujours la probabilité de réussir les deux à la fois — "), latex("\\dfrac{2}{75}<\\dfrac{2}{15}"), texte(".")],
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
        texte("Cette même somme ne vaut 1 que si "), latex("K"), texte(" est strictement inférieur à "), latex("N/2"), texte(", sinon elle serait différente de 1."),
      ],
      reponse: false,
      justification: [texte("La somme de toutes les probabilités d'une loi vaut TOUJOURS 1, quelle que soit la relation entre "), latex("K"), texte(" et "), latex("N/2"), texte(" — c'est une propriété générale de toute distribution de probabilité.")],
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

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
    {
      enonce: [
        texte("Toujours pour "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", la valeur la plus probable est "),
        latex("k=1"), texte(", avec "), latex("P(1)=\\dfrac{C_{6}^{1}\\times C_{14}^{4}}{C_{20}^{5}}=\\dfrac{6\\times1001}{15\\,504}\\approx0{,}387"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("La distribution complète vaut environ "), latex("0{,}129"), texte(" ; "), latex("0{,}387"), texte(" ; "), latex("0{,}352"), texte(" ; "),
        latex("0{,}117"), texte(" ; "), latex("0{,}014"), texte(" ; "), latex("0{,}0004"), texte(" pour "), latex("k=0"), texte(" à "), latex("5"),
        texte(" : le maximum est bien atteint en "), latex("k=1"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour ces mêmes "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", la valeur la plus probable est "),
        latex("k=2"), texte(", puisque 2 est la valeur centrale des 6 possibles ("), latex("k=0"), texte(" à "), latex("5"), texte(")."),
      ],
      reponse: false,
      justification: [
        latex("P(2)\\approx0{,}352"), texte(" reste en dessous de "), latex("P(1)\\approx0{,}387"),
        texte(" : la loi hypergéométrique n'est pas symétrique, sa valeur la plus probable se situe autour de "),
        latex("\\dfrac{nK}{N}=1{,}5"), texte(", jamais au milieu des valeurs possibles par principe."),
      ],
    },
    {
      enonce: [
        texte("Pour ces mêmes valeurs, le cas \"tous des succès\" ("), latex("k=n=5"), texte(") vaut "),
        latex("P(5)=\\dfrac{C_{6}^{5}\\times C_{14}^{0}}{C_{20}^{5}}=\\dfrac{6}{15\\,504}\\approx0{,}0004"), texte("."),
      ],
      reponse: true,
      justification: [texte("Il ne reste aucun échec à choisir ("), latex("n-k=0"), texte("), donc "), latex("C_{14}^{0}=1"), texte(" : seuls comptent les 6 choix de 5 succès parmi les 6 disponibles.")],
    },
    {
      enonce: [
        texte("Pour ce même cas "), latex("k=n=5"), texte(", le numérateur s'écrit "), latex("C_{6}^{5}\\times C_{14}^{5}"),
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
        texte("Pour ces mêmes "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=8"), texte(", la probabilité d'obtenir 7 succès est très petite, mais reste strictement positive."),
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
        texte("Pour cette même urne, la composition \"2 rouges et 1 bleue\" (ordre libre) vaut "), latex("3\\times\\dfrac{1}{10}=\\dfrac{3}{10}"),
        texte(", ce que confirme la formule hypergéométrique : "), latex("\\dfrac{C_{4}^{2}\\times C_{6}^{1}}{C_{10}^{3}}=\\dfrac{6\\times6}{120}=\\dfrac{36}{120}=\\dfrac{3}{10}"), texte("."),
      ],
      reponse: true,
      justification: [texte("Les 3 séquences (RRB, RBR, BRR) ont chacune la probabilité "), latex("\\dfrac{1}{10}"), texte(" : leur somme donne la composition, exactement la valeur hypergéométrique.")],
    },
    {
      enonce: [
        texte("Pour cette même urne, les 3 séquences menant à \"2 rouges et 1 bleue\" n'ont PAS la même probabilité : celle où la bleue sort en premier est plus probable, l'urne étant alors encore complète."),
      ],
      reponse: false,
      justification: [
        texte("Les 3 séquences ont rigoureusement la même probabilité ("), latex("\\dfrac{1}{10}"),
        texte(" chacune) : les mêmes facteurs y apparaissent, seulement dans un autre ordre, et un produit ne dépend pas de l'ordre de ses facteurs."),
      ],
    },
    {
      enonce: [
        texte("Dans une grille de "), latex("N=12"), texte(" numéros dont "), latex("K=5"), texte(" sont gagnants, la probabilité que les "),
        latex("n=2"), texte(" numéros tirés soient tous deux gagnants vaut "),
        latex("\\dfrac{C_{5}^{2}\\times C_{7}^{0}}{C_{12}^{2}}=\\dfrac{10}{66}=\\dfrac{5}{33}\\approx0{,}152"), texte("."),
      ],
      reponse: true,
      justification: [texte("Formule hypergéométrique avec "), latex("k=n=2"), texte(" : "), latex("C_{7}^{0}=1"), texte(", "), latex("C_{12}^{2}=66"), texte(".")],
    },
    {
      enonce: [
        texte("Cette même probabilité vaudrait toujours "), latex("\\dfrac{5}{33}"),
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
      enonce: [
        texte("Comme les tirages successifs sans remise ne sont PAS indépendants, les différents sous-ensembles de "), latex("n"),
        texte(" éléments n'ont pas tous la même probabilité d'être obtenus."),
      ],
      reponse: false,
      justification: [
        texte("La dépendance porte sur les tirages SUCCESSIFS, jamais sur le sous-ensemble final : tous les sous-ensembles de "),
        latex("n"), texte(" éléments restent équiprobables, ce qui est précisément ce qui autorise le quotient par "), latex("C_{N}^{n}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("Pour "), latex("N=20"), texte(", "), latex("K=6"), texte(", "), latex("n=5"), texte(", une loi binomiale de paramètres "),
        latex("n=5"), texte(" et "), latex("p=\\dfrac{6}{20}=0{,}3"), texte(" redonne exactement "), latex("P(2)\\approx0{,}352"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("La binomiale donne "), latex("C_{5}^{2}\\times0{,}3^2\\times0{,}7^3\\approx0{,}309"), texte(", pas "), latex("0{,}352"),
        texte(" : avec "), latex("N=20"), texte(" à peine 4 fois plus grand que "), latex("n=5"), texte(", l'approximation binomiale reste nettement en écart."),
      ],
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
        texte("Cette même formule s'écrit plutôt "), latex("P(X=k)=C_{n}^{k}\\times p^{n-k}\\times(1-p)^k"), texte(", en inversant les exposants de "), latex("p"), texte(" et "), latex("(1-p)"), texte("."),
      ],
      reponse: false,
      justification: [texte("Les exposants sont inversés : "), latex("p"), texte(" (succès) porte l'exposant "), latex("k"), texte(" (le nombre de succès), et "), latex("(1-p)"), texte(" (échec) l'exposant "), latex("n-k"), texte(", jamais l'inverse.")],
    },
    {
      enonce: [
        texte("Pour "), latex("n=6"), texte(" tirs indépendants avec "), latex("p=0{,}4"), texte(" de réussite à chaque tir, "),
        latex("P(X=2)=C_{6}^{2}\\times0{,}4^2\\times0{,}6^4=15\\times0{,}16\\times0{,}1296=0{,}31104"), texte("."),
      ],
      reponse: true,
      justification: [texte("Calcul direct de la formule binomiale avec ces valeurs.")],
    },
    {
      enonce: [
        texte("Pour ces mêmes valeurs, "), latex("P(X=2)"), texte(" se calculerait plutôt sans le facteur combinatoire "), latex("C_{6}^{2}"),
        texte(", soit "), latex("0{,}4^2\\times0{,}6^4=0{,}020736"), texte(", en oubliant de compter les différentes positions possibles des 2 succès parmi les 6 tirs."),
      ],
      reponse: false,
      justification: [texte("Oublier "), latex("C_{6}^{2}=15"), texte(" donne un résultat 15 fois trop petit : la bonne valeur est "), latex("0{,}31104"), texte(", pas "), latex("0{,}020736"), texte(".")],
    },
    {
      enonce: [
        latex("P(X=0)=C_{6}^{0}\\times0{,}4^0\\times0{,}6^6=1\\times1\\times0{,}046656=0{,}046656"),
        texte(" — cette question (\"aucun succès\") relève de la stratégie \"un seul terme\", un calcul direct sans somme ni complément."),
      ],
      reponse: true,
      justification: [texte("\"Aucun\", \"tous\" et \"exactement\" se calculent tous par UN SEUL terme de la formule binomiale, sans avoir besoin de sommer ni de passer par un complément.")],
    },
    {
      enonce: [
        latex("P(X=0)"), texte(" relève au contraire de la stratégie \"complément\", car il faudrait calculer 1 moins la probabilité d'avoir au moins un succès."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : "), latex("P(X=0)"), texte(" est le terme DIRECT (stratégie \"un seul terme\") qui sert ENSUITE de base pour calculer, par complément, la probabilité d'\"au moins 1 succès\" — pas le contraire."),
      ],
    },
    {
      enonce: [
        texte("P(au moins 1 succès sur les 6 tirs) "), latex("=1-P(X=0)=1-0{,}046656=0{,}953344"),
        texte(" — c'est la stratégie \"complément\", la plus efficace ici plutôt que de sommer "), latex("P(X=1)"), texte(" à "), latex("P(X=6)"), texte("."),
      ],
      reponse: true,
      justification: [texte("\"Au moins 1\" est le complémentaire exact d'\"aucun succès\" : passer par le complément évite de sommer 6 termes.")],
    },
    {
      enonce: [
        texte("P(au moins 1 succès) se calcule plutôt en additionnant "), latex("P(X=1)"), texte(" seul, car \"au moins 1\" est équivalent à \"exactement 1\" dans ce contexte."),
      ],
      reponse: false,
      justification: [texte("\"Au moins 1\" inclut "), latex("X=1,2,3,4,5"), texte(" ET "), latex("6"), texte(", pas seulement "), latex("X=1"), texte(" : ce n'est PAS équivalent à \"exactement 1\".")],
    },
    {
      enonce: [
        texte("P(au plus 5 succès sur les 6 tirs) "), latex("=1-P(X=6)=1-0{,}004096=0{,}995904"),
        texte(", par la stratégie \"complément\" (le complémentaire de \"au plus n-1\" est \"tous\")."),
      ],
      reponse: true,
      justification: [texte("\"Au plus 5\" (sur 6 possibles) est le complémentaire exact de \"tous réussissent\" ("), latex("X=6"), texte(").")],
    },
    {
      enonce: [texte("P(au plus 5 succès) se calcule plutôt comme "), latex("1-P(X=0)"), texte(", car \"au plus 5\" est le complémentaire d'\"aucun succès\".")],
      reponse: false,
      justification: [texte("Le complémentaire de \"au plus 5\" (sur 6) est \"tous\" ("), latex("X=6"), texte("), pas \"aucun\" ("), latex("X=0"), texte(") — ce sont deux seuils différents.")],
    },
    {
      enonce: [
        texte("P(au moins 4 succès sur les 6 tirs) "), latex("=P(4)+P(5)+P(6)=0{,}13824+0{,}036864+0{,}004096=0{,}1792"),
        texte(" — ici la stratégie \"somme\" est utilisée (peu de termes à additionner), plutôt que le complément."),
      ],
      reponse: true,
      justification: [texte("Avec seulement 3 termes à additionner (k=4,5,6), la somme directe reste plus simple qu'un complément portant sur 4 termes (k=0,1,2,3).")],
    },
    {
      enonce: [
        texte("Cette même probabilité \"au moins 4\" vaudrait aussi "), latex("1-P(X=3)"), texte(", en utilisant la stratégie complément avec "), latex("X=3"), texte(" comme seuil."),
      ],
      reponse: false,
      justification: [
        texte("Le complémentaire correct de \"au moins 4\" est \"au plus 3\" ("), latex("X=0,1,2"), texte(" OU "), latex("3"), texte("), donc "), latex("1-\\big(P(0)+P(1)+P(2)+P(3)\\big)"),
        texte(", jamais "), latex("1-P(X=3)"), texte(" seul (qui ne retire qu'UN terme, pas les 4)."),
      ],
    },
    {
      enonce: [
        texte("La somme de toutes les probabilités "), latex("P(X=0)"), texte(" à "), latex("P(X=6)"), texte(" (les 7 valeurs possibles du nombre de succès) vaut exactement 1, quelle que soit la valeur de "), latex("p"), texte("."),
      ],
      reponse: true,
      justification: [texte("C'est une propriété générale de toute distribution de probabilité : la somme sur tous les cas possibles vaut toujours 1.")],
    },
    {
      enonce: [texte("Cette somme ne vaut 1 que si "), latex("p=0{,}5"), texte(", car c'est la seule valeur qui rend tous les résultats équiprobables.")],
      reponse: false,
      justification: [texte("La somme vaut 1 pour TOUTE valeur de "), latex("p"), texte(" entre 0 et 1, pas seulement "), latex("0{,}5"), texte(" — l'équiprobabilité entre les résultats n'est d'ailleurs jamais requise pour que leur somme fasse 1.")],
    },
    {
      enonce: [
        texte("En tirant successivement, SANS remise, 4 lettres parmi 9 lettres toutes différentes, la probabilité d'obtenir un ordre PRÉCIS donné à l'avance est "),
        latex("\\dfrac{1}{9}\\times\\dfrac{1}{8}\\times\\dfrac{1}{7}\\times\\dfrac{1}{6}=\\dfrac{1}{3024}"), texte("."),
      ],
      reponse: true,
      justification: [texte("À chaque tirage, une seule lettre parmi celles restantes correspond à la position exacte demandée : "), latex("9\\times8\\times7\\times6=3024"), texte(".")],
    },
    {
      enonce: [
        texte("Cette même probabilité se calculerait plutôt "), latex("\\dfrac{1}{9^4}=\\dfrac{1}{6561}"),
        texte(", en supposant que la probabilité reste "), latex("\\dfrac{1}{9}"), texte(" à chaque tirage."),
      ],
      reponse: false,
      justification: [
        texte("Supposer une probabilité constante de "), latex("\\dfrac{1}{9}"), texte(" correspondrait à un tirage AVEC remise, pas sans remise : sans remise, le nombre de lettres restantes DIMINUE à chaque tirage ("), latex("9,8,7,6"), texte("), donnant "), latex("\\dfrac{1}{3024}"), texte(", pas "), latex("\\dfrac{1}{6561}"), texte("."),
      ],
    },
    {
      enonce: [
        texte("La probabilité binomiale "), latex("P(X=k)"), texte(" suppose des épreuves INDÉPENDANTES à probabilité "), latex("p"),
        texte(" CONSTANTE (typiquement avec remise, ou une population très grande), alors que la probabilité de séquence exacte sans remise ("), latex("\\tfrac{1}{n}\\times\\tfrac{1}{n-1}\\times\\dots"),
        texte(") suppose au contraire que chaque tirage modifie les probabilités suivantes."),
      ],
      reponse: true,
      justification: [texte("C'est la distinction pédagogique centrale entre ces deux modèles de ce chapitre : indépendance à probabilité fixe contre dépendance au tirage précédent.")],
    },
    {
      enonce: [
        texte("Ces deux modèles (binomiale et séquence exacte sans remise) donnent toujours exactement le même résultat numérique, quels que soient "), latex("n,k"), texte(" et "), latex("p"),
        texte(", car ce sont deux façons équivalentes d'écrire la même probabilité."),
      ],
      reponse: false,
      justification: [texte("Ce sont deux modèles fondamentalement DIFFÉRENTS (épreuves indépendantes contre tirage sans remise) qui ne coïncident pas en général — rien ne garantit une égalité entre leurs résultats.")],
    },
    {
      enonce: [
        texte("Avec 9 lettres et un ordre exact demandé, augmenter le nombre de lettres tirées "), latex("k"), texte(" (par exemple à "), latex("k=5"), texte(" au lieu de "), latex("k=4"),
        texte(") DIMINUE la probabilité du succès, car il faut deviner un choix exact supplémentaire parmi les lettres restantes."),
      ],
      reponse: true,
      justification: [texte("Pour "), latex("k=5"), texte(", le produit devient "), latex("\\dfrac{1}{9\\times8\\times7\\times6\\times5}=\\dfrac{1}{15\\,120}"), texte(", bien plus petit que "), latex("\\dfrac{1}{3024}"), texte(" pour "), latex("k=4"), texte(".")],
    },
    {
      enonce: [
        texte("Avec 9 lettres, augmenter "), latex("k"), texte(" à 5 AUGMENTE la probabilité de deviner la séquence exacte, car il y a alors plus de tirages qui pourraient \"compenser\" une erreur."),
      ],
      reponse: false,
      justification: [
        texte("C'est l'inverse : chaque tirage supplémentaire à deviner exactement REND la tâche plus difficile, pas plus facile — la probabilité passe de "),
        latex("\\dfrac{1}{3024}"), texte(" à "), latex("\\dfrac{1}{15\\,120}"), texte(", donc DIMINUE."),
      ],
    },

    // --- Enrichissement (15 affirmations supplémentaires, nuances non couvertes ci-dessus) ---
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
        texte("Pour ces mêmes "), latex("n=8"), texte(" et "), latex("p=0{,}5"), texte(", la valeur la plus probable est "),
        latex("k=4"), texte(", avec "), latex("P(X=4)=\\dfrac{70}{256}\\approx0{,}273"), texte("."),
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
        texte("Toujours pour "), latex("n=8"), texte(" et "), latex("p=0{,}5"), texte(", "),
        latex("P(\\text{au moins }1)=1-0{,}5^8=\\dfrac{255}{256}\\approx0{,}996"), texte("."),
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
      enonce: [
        texte("Cette égalité disparaît dès que "), latex("p\\neq0{,}5"), texte(" : pour "), latex("n=8"), texte(" et "), latex("p=0{,}3"),
        texte(", "), latex("P(X=3)\\approx0{,}254"), texte(" alors que "), latex("P(X=5)\\approx0{,}047"), texte("."),
      ],
      reponse: true,
      justification: [
        texte("Le coefficient binomial reste le même ("), latex("56"), texte("), mais "), latex("0{,}3^3\\times0{,}7^5"),
        texte(" est bien plus grand que "), latex("0{,}3^5\\times0{,}7^3"), texte(" : la symétrie n'existe que pour "), latex("p=0{,}5"), texte("."),
      ],
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
        texte("En tirant successivement, SANS remise, 3 jetons parmi 12 tous différents, la probabilité d'obtenir 3 jetons précis dans un ORDRE EXACT donné à l'avance vaut "),
        latex("\\dfrac{1}{12}\\times\\dfrac{1}{11}\\times\\dfrac{1}{10}=\\dfrac{1}{1320}"), texte("."),
      ],
      reponse: true,
      justification: [texte("À chaque tirage, un seul jeton parmi ceux restants convient à la position demandée : "), latex("12\\times11\\times10=1320"), texte(".")],
    },
    {
      enonce: [
        texte("Pour ces mêmes 12 jetons, la probabilité d'obtenir les 3 mêmes jetons dans un ordre QUELCONQUE vaut elle aussi "),
        latex("\\dfrac{1}{1320}"), texte("."),
      ],
      reponse: false,
      justification: [
        texte("Les "), latex("3!=6"), texte(" ordres possibles conviennent alors, chacun de probabilité "), latex("\\dfrac{1}{1320}"),
        texte(" : la probabilité vaut "), latex("\\dfrac{6}{1320}=\\dfrac{1}{220}"), texte(", six fois plus."),
      ],
    },
    {
      enonce: [
        texte("La probabilité d'une séquence exacte de "), latex("k"), texte(" éléments tirés sans remise parmi "), latex("n"), texte(" s'écrit "),
        latex("\\dfrac{1}{A_{n}^{k}}"), texte(" : pour "), latex("n=12"), texte(" et "), latex("k=3"), texte(", "),
        latex("A_{12}^{3}=1320"), texte("."),
      ],
      reponse: true,
      justification: [texte("Le produit "), latex("n(n-1)\\dots(n-k+1)"), texte(" du dénominateur est exactement la définition de "), latex("A_{n}^{k}"), texte(" — les arrangements du début du chapitre.")],
    },
    {
      enonce: [
        texte("Cette même probabilité de séquence exacte s'écrit "), latex("\\dfrac{1}{C_{n}^{k}}"), texte(", soit "),
        latex("\\dfrac{1}{C_{12}^{3}}=\\dfrac{1}{220}"), texte(" pour 12 jetons et "), latex("k=3"), texte("."),
      ],
      reponse: false,
      justification: [
        latex("\\dfrac{1}{C_{12}^{3}}=\\dfrac{1}{220}"), texte(" est la probabilité d'obtenir les 3 jetons voulus dans un ordre QUELCONQUE ; l'ORDRE EXACT exige "),
        latex("\\dfrac{1}{A_{12}^{3}}=\\dfrac{1}{1320}"), texte(", "), latex("3!"), texte(" fois plus petit."),
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
  ],
};
