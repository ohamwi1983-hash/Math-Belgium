import type { ChapterContent } from '../../types'

export const equationsInequationsSecondDegre: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 2,
  title: 'Équations et inéquations du second degré',
  slug: 'equations-inequations-second-degre',
  lede:
    'Le chapitre 1 a appris à lire une parabole. Celui-ci apprend à résoudre — vite et sans se ' +
    'tromper : reconnaître la bonne technique pour une équation $ax^2+bx+c=0$, en déduire le ' +
    "signe d'un trinôme ou d'un produit de facteurs, puis étendre ces outils aux expressions et " +
    'inéquations rationnelles.',

  intro: {
    title: 'Avant de commencer : équation, racine, solution',
    blocks: [
      {
        kind: 'para',
        text:
          'Résoudre $ax^2+bx+c=0$, c\'est trouver toutes les valeurs de $x$ qui annulent le ' +
          'trinôme — exactement les **zéros** étudiés au chapitre 1, mais cette fois calculés ' +
          'systématiquement plutôt que lus sur un graphique. Une équation ou une inéquation peut ' +
          'en réalité cacher ce trinôme derrière une fraction, un carré déjà développé ou un ' +
          'membre non nul : la compétence centrale de ce chapitre est de reconnaître, sous ' +
          'chaque écriture, la bonne méthode à appliquer — la plus rapide d\'abord, le ' +
          'discriminant en dernier recours.',
      },
      {
        kind: 'rappel',
        label: 'Vocabulaire',
        items: [
          'Une **racine** annule un polynôme intermédiaire apparu en cours de résolution (un ' +
            'facteur, un numérateur) ; une **solution** vérifie l\'équation ou l\'inéquation ' +
            'complète de l\'énoncé. Les deux coïncident pour une équation polynomiale simple ' +
            'comme $ax^2+bx+c=0$ — mais divergent dès qu\'un dénominateur entre en jeu : une ' +
            'racine du numérateur qui annule aussi le dénominateur n\'est **pas** une solution ' +
            '(section « L\'inconnue au dénominateur »).',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'resoudre',
      number: 1,
      title: 'Résoudre une équation du second degré',
      kicker: 'reconnaître la technique la plus rapide, le discriminant en dernier recours',
      blocks: [
        {
          kind: 'para',
          text:
            'Appliquer systématiquement la formule du discriminant fonctionne toujours, mais ' +
            "c'est souvent la méthode la plus lente. Avant de s'y résoudre, quatre situations se " +
            'reconnaissent d\'un coup d\'œil sur $a$, $b$ et $c$ :',
        },
        {
          kind: 'featureTable',
          caption: 'Reconnaître la technique avant de calculer quoi que ce soit',
          headers: ['Condition sur a, b, c', 'Technique'],
          rows: [
            ['c = 0', 'mise en évidence de x'],
            ['b = 0, a et c de signes opposés', 'binôme conjugué'],
            ['b ≠ 0, c = b²/(4a) (Δ = 0)', 'produit remarquable'],
            ['aucune des conditions ci-dessus', 'cas général — discriminant'],
          ],
        },
        {
          kind: 'exemple',
          badge: 'mise en évidence — c = 0',
          formula: '$2x^2 - 6x = 0$',
          steps: [{ tag: 'x apparaît dans les deux termes', text: '$2x(x-3) = 0$' }],
          result: { tag: 'solutions', text: '$x = 0$ ou $x = 3$' },
        },
        {
          kind: 'piege',
          text:
            'Le facteur $x$ doit apparaître **explicitement** : $-2x^2+6x=0$ se factorise ' +
            '$2x(3-x)=0$ ou, de façon équivalente mais souvent source d\'erreur, $-2x(x-3)=0$ — ' +
            'jamais $-x(2x-6)=0$ avec le signe collé devant le $x$ comme s\'il ne comptait pas : ' +
            'absorbe-le toujours dans l\'autre facteur.',
        },
        {
          kind: 'exemple',
          badge: 'binôme conjugué — b = 0',
          formula: '$2x^2 - 18 = 0$',
          steps: [{ tag: 'différence de deux carrés', text: '$2(x^2-9) = 2(x-3)(x+3) = 0$' }],
          result: { tag: 'solutions', text: '$x = -3$ ou $x = 3$' },
        },
        {
          kind: 'exemple',
          badge: 'produit remarquable — Δ = 0',
          formula:
            '$2x^2-12x+18=0$ — ici $b^2=144$ et $4ac=4 \\cdot 2 \\cdot 18=144$, donc $c=b^2/(4a)$ : ' +
            'Δ = 0 annoncé avant tout calcul',
          steps: [{ tag: 'carré parfait', text: '$2(x^2-6x+9) = 2(x-3)^2 = 0$' }],
          result: { tag: 'solution (racine double)', text: '$x = 3$' },
        },
        { kind: 'subheading', text: 'Le cas général — la formule du discriminant' },
        {
          kind: 'para',
          text:
            'Quand aucune des trois situations ci-dessus ne s\'applique, aucune factorisation ' +
            'directe ne saute aux yeux. La formule du discriminant fonctionne alors ' +
            '**toujours** — elle se redémontre en complétant le carré sur la forme générale :',
        },
        {
          kind: 'methode',
          label: 'Démonstration — de la forme générale à la formule',
          items: [
            'Mettre a en évidence sur les deux premiers termes seulement : ' +
              '$ax^2+bx+c = a[x^2 + \\dfrac{b}{a}x] + c$.',
            'Compléter le carré à l\'intérieur des crochets — **attention**, la moitié de b/a ' +
              'est b/(2a), pas b/a : $a(x+\\dfrac{b}{2a})^2 - \\dfrac{\\Delta}{4a}$, avec ' +
              '$\\Delta = b^2-4ac$.',
            'Isoler le carré : $a(x+\\dfrac{b}{2a})^2 = \\dfrac{\\Delta}{4a}$.',
            'Racine carrée des deux côtés (possible seulement si Δ ≥ 0) : ' +
              '$x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'cas général',
          formula: '$2x^2 - 10x + 8 = 0$',
          steps: [
            { tag: 'discriminant', text: '$\\Delta = (-10)^2 - 4 \\cdot 2 \\cdot 8 = 100 - 64 = 36$' },
            { tag: 'racine carrée de Δ', text: '$\\sqrt{36} = 6$' },
          ],
          result: { tag: 'solutions', text: '$x = \\dfrac{10+6}{4} = 4$ ou $x = \\dfrac{10-6}{4} = 1$' },
        },
        {
          kind: 'piege',
          label: 'Erreur de signe classique',
          text:
            'La formule contient $-b$, pas $b$ : écrire $x = \\dfrac{b \\pm \\sqrt{\\Delta}}{2a}$ ' +
            '(sans inverser le signe de b) donne, dans l\'exemple ci-dessus, $x=-4$ ou $x=-1$ : ' +
            'deux valeurs fausses, alors même que le calcul de Δ était correct.',
        },
        { kind: 'subheading', text: 'Le cas caché — mise en évidence généralisée' },
        {
          kind: 'para',
          text:
            'Une cinquième situation ne se reconnaît **pas** sur les coefficients a, b, c une ' +
            'fois l\'équation développée : c\'est la forme de l\'énoncé lui-même, avant tout ' +
            'développement, qui trahit une mise en évidence généralisée.',
        },
        {
          kind: 'exemple',
          badge: 'mise en évidence généralisée',
          formula: '$(x+2)^2 = 3(x+2)$',
          steps: [
            {
              tag: 'jamais développer — (x+2) est un facteur commun',
              text: '$(x+2)^2-3(x+2)=0 \\iff (x+2)[(x+2)-3]=0=(x+2)(x-1)=0$',
            },
          ],
          result: { tag: 'solutions', text: '$x = -2$ ou $x = 1$' },
        },
        {
          kind: 'astuce',
          text:
            'Dès qu\'une même expression entre parenthèses apparaît des deux côtés de l\'égalité ' +
            '— ici $(x+2)$ — ne développe jamais le carré : ramène tout d\'un côté et mets cette ' +
            'expression commune en évidence, exactement comme $x$ dans le tout premier exemple ' +
            'de cette section.',
        },
        { kind: 'video', title: 'Résoudre une équation du second degré, méthode par méthode' },
        {
          kind: 'entrainement',
          title: 'Méthode la plus rapide',
          generatorId: 'gen1',
          description: [
            'Reconnais la technique la plus rapide pour résoudre une équation du second degré ' +
              'donnée (mise en évidence, binôme conjugué, produit remarquable, cas général, mise ' +
              'en évidence généralisée), puis résous-la.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 1. Méthode la plus rapide »',
        },
      ],
    },
    {
      id: 'signe-trinome',
      number: 2,
      title: "Étudier le signe d'un trinôme",
      kicker: 'tableau de signes de ax² + bx + c, en 3 étapes fixes',
      blocks: [
        {
          kind: 'para',
          text:
            'Une inéquation $ax^2+bx+c \\lozenge 0$ (avec ◇ l\'un des symboles $<, >, \\le, \\ge$) ' +
            'se résout toujours dans le même ordre :',
        },
        {
          kind: 'methode',
          items: [
            'Calculer les racines du trinôme (s\'il y en a) — chapitre 1 ou section précédente.',
            'Noter le signe de a : c\'est le signe du trinôme **à l\'extérieur** des racines.',
            'En déduire l\'intervalle-solution demandé par le symbole ◇.',
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Les trois cas possibles, selon le signe de Δ',
          headers: ['Discriminant', 'Signe du trinôme'],
          rows: [
            ['Δ < 0', 'toujours le signe de a, jamais nul'],
            ['Δ = 0 (racine double r)', 'signe de a partout, nul seulement en x = r'],
            ['Δ > 0 (racines r₁ < r₂)', 'signe de a à l\'extérieur de [r₁;r₂], signe opposé entre les deux'],
          ],
        },
        { kind: 'subheading', text: 'La notation à crochets inversés' },
        {
          kind: 'para',
          text:
            'Un ensemble-solution s\'écrit toujours en intervalles, jamais en parenthèses à la ' +
            'française : un crochet **ouvert vers l\'intérieur** de l\'intervalle exclut la ' +
            'borne, un crochet **ouvert vers l\'extérieur** l\'inclut. Les bornes sont séparées ' +
            'par un point-virgule ; la virgule reste réservée à l\'écriture décimale ($2{,}5$). ' +
            '$-\\infty$ et $+\\infty$ verrouillent toujours leur crochet en position ouverte.',
        },
        {
          kind: 'rappel',
          label: 'Exemples de lecture',
          items: [
            ']−2 ; 3[ — intervalle ouvert, les deux bornes exclues.',
            '[−2 ; 3] — intervalle fermé, les deux bornes incluses.',
            ']−∞ ; −2] ∪ [3 ; +∞[ — un « extérieur » fermé, en deux morceaux réunis par ∪.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'Δ > 0, symbole large',
          formula: '$x^2 - x - 6 \\ge 0$',
          steps: [
            { tag: '1 — racines', text: '$\\Delta = 1+24=25$, $x=(1\\pm5)/2 \\to x_1=-2, x_2=3$' },
            { tag: '2 — signe de a', text: '$a = 1 > 0$ : positif à l\'extérieur des racines' },
          ],
          result: { tag: '3 — solution (≥, donc bornes incluses)', text: ']−∞ ; −2] ∪ [3 ; +∞[' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -6,
            max: 7,
            segments: [
              { from: 'min', to: -2 },
              { from: 3, to: 'max' },
            ],
            points: [
              { value: -2, closed: true, label: '−2', tone: 'good' },
              { value: 3, closed: true, label: '3', tone: 'good' },
            ],
            signLabels: [
              { value: -4, sign: '+' },
              { value: 0.5, sign: '−' },
              { value: 5, sign: '+' },
            ],
            axisLabel: '',
            caption: 'trait plein + rond plein = valeurs incluses dans la solution ]−∞;−2] ∪ [3;+∞[',
          },
        },
        {
          kind: 'astuce',
          text:
            'Aucun crochet ne se déduit automatiquement du symbole : une inégalité **large** ' +
            '(≤/≥) inclut la borne *seulement si* cette borne est effectivement une racine — ' +
            'pose toujours la question consciemment plutôt que de réagir par réflexe.',
        },
        {
          kind: 'entrainement',
          title: 'Tableau de signes',
          generatorId: 'gen2',
          description: [
            'Étudie le signe de ax²+bx+c via un tableau de signes guidé (racines, signe de a, ' +
              'ensemble-solution construit pas à pas, notation à crochets inversés).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 2. Tableau de signes »',
        },
      ],
    },
    {
      id: 'signe-produit',
      number: 3,
      title: 'Signe d\'un produit de plusieurs facteurs',
      kicker: 'généraliser le tableau de signes à 2 ou 3 facteurs',
      blocks: [
        {
          kind: 'para',
          text:
            'Le principe reste le même quand le produit compte plusieurs facteurs — linéaires, ' +
            'quadratiques factorisables ou **quadratiques irréductibles** (Δ < 0, donc de signe ' +
            'constant, toujours celui de leur propre coefficient a) : chaque facteur reçoit sa ' +
            'propre ligne de signe, la ligne du produit se lit ensuite en multipliant les signes ' +
            'colonne par colonne.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — 3 facteurs',
          blocks: [
            { kind: 'para', text: '$(x-1) \\cdot x \\cdot (x-3) > 0$' },
            { kind: 'para', text: 'Racines de chaque facteur, triées : 0, 1, 3.' },
            {
              kind: 'signTable',
              caption: 'Signe de (x−1)·x·(x−3)',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '0', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '3', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 1',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 3',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'produit',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            { kind: 'para', text: 'Solution (> 0) : ]0 ; 1[ ∪ ]3 ; +∞[' },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — compter les signes négatifs',
          items: [
            'Sur chaque colonne, le produit est négatif si un **nombre impair** de facteurs y ' +
              'sont négatifs, positif sinon — pas besoin de multiplier littéralement les signes ' +
              'un par un : compte-les. Une colonne où un facteur vaut 0 rend tout le produit nul, ' +
              'quels que soient les autres facteurs.',
          ],
        },
        {
          kind: 'attention',
          label: 'Facteur quadratique irréductible',
          text:
            'Un facteur du type $x^2+2x+5$ (Δ = 4 − 20 = −16 < 0) ne s\'annule **jamais** : sa ' +
            'ligne dans le tableau garde un signe constant sur toute la droite, celui de son ' +
            'propre a — **aucune** colonne supplémentaire à créer pour ce facteur, contrairement ' +
            'à un facteur factorisable qui, lui, ajoute ses propres racines aux colonnes du tableau.',
        },
        {
          kind: 'entrainement',
          title: 'Tableau de signes à plusieurs facteurs',
          generatorId: 'gen5',
          description: [
            'Étudie le signe d\'un produit de 2 à 3 facteurs (linéaire donné, quadratique à ' +
              'factoriser, quadratique irréductible) via une grille de signes interactive.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 5. Tableau de signes à plusieurs facteurs »',
        },
      ],
    },
    {
      id: 'simplifier',
      number: 4,
      title: 'Simplifier une fraction rationnelle',
      kicker: 'factoriser numérateur et dénominateur pour éliminer un facteur commun',
      blocks: [
        {
          kind: 'para',
          text:
            'Une fraction rationnelle ne se simplifie **jamais** en biffant des termes isolés — ' +
            'seulement en factorisant complètement le numérateur et le dénominateur, puis en ' +
            'éliminant tout facteur strictement identique entre les deux. La condition ' +
            'd\'existence (CE), elle, porte toujours sur le dénominateur **avant** ' +
            'simplification : un facteur éliminé reste une valeur interdite.',
        },
        {
          kind: 'exemple',
          badge: 'racine commune, deux polynômes de degré 2',
          formula: '$\\dfrac{2x^2-6x}{x^2-x-6}$',
          steps: [
            { tag: 'numérateur factorisé', text: '$2x^2-6x = 2x(x-3)$' },
            { tag: 'dénominateur factorisé', text: '$x^2-x-6 = (x-3)(x+2)$' },
            { tag: 'CE — posée sur le dénominateur non simplifié', text: '$x \\neq 3$ et $x \\neq -2$' },
          ],
          result: {
            tag: 'fraction simplifiée',
            text: '$\\dfrac{2x(x-3)}{(x-3)(x+2)} = \\dfrac{2x}{x+2}$',
          },
        },
        {
          kind: 'piege',
          label: 'Un carré parfait au dénominateur ne se simplifie jamais complètement',
          text:
            'Si le dénominateur s\'écrit $(x-p)^2$ (racine double), simplifier *une* occurrence ' +
            'de $(x-p)$ avec le numérateur laisse toujours $(x-p)$ au dénominateur restant — la ' +
            'valeur $x=p$ reste donc exclue, et la fraction n\'est **jamais** réductible à une ' +
            'expression polynomiale pure sur ce facteur.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — forme de référence',
          text:
            'Une fois simplifiée, affiche toujours la fraction sous sa forme la plus réduite : ' +
            'coefficients divisés par leur PGCD (jamais $2(x-3)/4$, toujours $\\dfrac{x-3}{2}$), ' +
            'et une racine nulle écrite $x$ tout court, jamais $(x-0)$.',
        },
        {
          kind: 'entrainement',
          title: 'Simplifier des fractions',
          generatorId: 'gen3',
          description: [
            'Simplifie une fraction rationnelle (numérateur et dénominateur de degré 1 ou 2) ' +
              'après factorisation complète des deux, avec ses conditions d\'existence.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 3. Simplifier des fractions »',
        },
      ],
    },
    {
      id: 'inconnue-denominateur',
      number: 5,
      title: 'L\'inconnue au dénominateur',
      kicker: 'résoudre une équation rationnelle, puis écarter les racines étrangères',
      blocks: [
        {
          kind: 'para',
          text:
            'Résoudre une équation où $x$ apparaît au dénominateur suit toujours le même ' +
            'schéma : poser la condition d\'existence, mettre les deux membres au même ' +
            'dénominateur ou les multiplier en croix, résoudre l\'équation polynomiale obtenue, ' +
            'puis confronter **chaque** solution trouvée à la CE posée au départ.',
        },
        {
          kind: 'methode',
          items: [
            'Poser la CE : chaque dénominateur ≠ 0.',
            'Multiplier en croix (ou réduire au même dénominateur), sans jamais perdre de vue la CE.',
            'Résoudre l\'équation polynomiale obtenue (chapitre 2, section 1 si elle est du second degré).',
            'Rejeter toute solution qui viole la CE — une **racine étrangère**.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'racine étrangère systématique',
          formula: '$\\dfrac{5}{x-2} = \\dfrac{3x-3}{x^2-x-2}$',
          steps: [
            {
              tag: 'CE — dénominateur droit factorisé : x² − x − 2 = (x − 2)(x + 1)',
              text: '$x \\neq 2$ et $x \\neq -1$',
            },
            {
              tag: 'mise en croix puis résolution',
              text: '$5(x^2-x-2)=(3x-3)(x-2) \\iff x^2+2x-8=0 \\iff (x-2)(x+4)=0$',
            },
            { tag: 'deux racines candidates', text: '$x = 2$ ou $x = -4$' },
          ],
          result: {
            tag: 'confrontation à la CE',
            text: '$x=2$ viole la CE — **racine étrangère, rejetée**. Seule $x=-4$ est une solution valide.',
          },
        },
        {
          kind: 'piege',
          label: 'Pourquoi une racine étrangère apparaît',
          text:
            'Multiplier en croix revient à multiplier les deux membres par les dénominateurs — ' +
            'y compris, implicitement, par une expression qui peut valoir zéro en $x=2$. ' +
            'L\'équation polynomiale obtenue est donc « plus large » que l\'équation de départ : ' +
            'elle peut accepter des valeurs que l\'équation rationnelle originale, elle, ' +
            'refusait déjà d\'admettre.',
        },
        {
          kind: 'astuce',
          text:
            'Vérifie la CE **après** avoir résolu, jamais seulement en la notant au départ pour ' +
            'l\'oublier ensuite — c\'est l\'étape la plus souvent sautée, alors qu\'elle fait ' +
            'toute la différence entre une solution correcte et une solution fausse.',
        },
        {
          kind: 'entrainement',
          title: 'L\'inconnue au dénominateur',
          generatorId: 'gen4',
          description: [
            'Résous une équation rationnelle (5 constructions possibles), en isolant, ' +
              'simplifiant si besoin, puis en écartant toute racine étrangère.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 4. L\'inconnue au dénominateur »',
        },
      ],
    },
    {
      id: 'inequations-rationnelles',
      number: 6,
      title: 'Inéquations rationnelles',
      kicker: 'une grille de quotient, avec une valeur « non définie » à part entière',
      blocks: [
        {
          kind: 'para',
          text:
            'Une inéquation rationnelle se traite comme un produit de facteurs (section 3), à ' +
            'une différence près : le dénominateur peut annuler le quotient **sans que ' +
            'celui-ci vaille 0** — il devient **non défini**. Cette valeur reçoit sa propre ' +
            'marque dans la grille, prioritaire sur tout le reste.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — quotient simple',
          blocks: [
            { kind: 'para', text: '$\\dfrac{x-2}{x+1} \\ge 0$' },
            { kind: 'para', text: 'CE : $x \\neq -1$.' },
            {
              kind: 'signTable',
              caption: 'Signe de (x−2)/(x+1)',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '2', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 2 (N)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x + 1 (D)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'quotient',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '∄', tone: 'indef' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            { kind: 'para', text: 'Solution (≥ 0, en excluant la colonne ∄) : ]−∞ ; −1[ ∪ [2 ; +∞[' },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -4,
            max: 5,
            segments: [
              { from: 'min', to: -1 },
              { from: 2, to: 'max' },
            ],
            points: [
              { value: -1, closed: false, label: '−1', tone: 'bad', sublabel: 'CE : toujours exclu' },
              { value: 2, closed: true, label: '2', tone: 'good' },
            ],
            axisLabel: '',
            caption: 'rond vide en −1 (toujours exclu, même pour un symbole large) — rond plein en 2 (inclus, car ≥)',
          },
        },
        {
          kind: 'attention',
          label: 'Une valeur de CE reste toujours exclue',
          text:
            'Même avec un symbole large (≤/≥), une valeur qui annule le dénominateur ne peut ' +
            '**jamais** appartenir à la solution — le quotient n\'y est pas défini, ni positif, ' +
            'ni négatif, ni nul. Son crochet reste ouvert quelle que soit l\'inégalité de l\'énoncé.',
        },
        {
          kind: 'para',
          text:
            'Le même principe s\'applique quand le second membre n\'est pas 0 : on l\'isole ' +
            'd\'abord ($... - k \\lozenge 0$), on réduit au même dénominateur, puis on retrouve ' +
            'un quotient de la même forme — parfois avec un numérateur du second degré à ' +
            'factoriser au passage.',
        },
        {
          kind: 'entrainement',
          title: 'Inéquations rationnelles',
          generatorId: 'gen6',
          description: [
            'Résous une inéquation rationnelle selon 8 niveaux/variantes (second membre nul, ' +
              'constant, linéaire ou fraction ; dénominateur au carré ; facteur commun ou non ; ' +
              'numérateur cubique) — le moteur le plus étoffé du chantier 4e.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 6. Inéquations rationnelles »',
        },
      ],
    },
    {
      id: 'revision',
      number: 7,
      title: 'Révision — vrai ou faux',
      kicker: '140 affirmations, 7 thèmes, discriminant et relations de Viète inclus',
      blocks: [
        {
          kind: 'para',
          text:
            '140 affirmations réparties en 7 thèmes qui reprennent tout ce chapitre — ' +
            'vocabulaire et généralités, résolution sans discriminant, le discriminant Δ, ' +
            'démonstration de la formule du discriminant, somme et produit des racines, ' +
            'factorisation par la méthode générale, inéquations et tableau de signes. Un seul ' +
            'essai par question, la justification est toujours révélée.',
        },
        {
          kind: 'astuce',
          label: 'Astuce — nouveau depuis le chapitre 1',
          text:
            'Contrairement au quiz du chapitre 1, celui-ci mobilise pleinement le discriminant ' +
            '$\\Delta = b^2-4ac$, sa formule $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$, et les ' +
            'relations de Viète — somme des racines $S = -b/a$, produit $P = c/a$ — puisque ce ' +
            'chapitre les introduit pour la première fois.',
        },
        {
          kind: 'entrainement',
          title: 'Équations et inéquations du second degré — quiz vrai/faux',
          generatorId: 'gen61',
          description: [
            'Choisis un thème et teste-toi : 140 affirmations pré-écrites, une seule tentative ' +
              'par question, justification toujours révélée.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 61. Équations et inéquations du second degré — quiz vrai/faux »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Résoudre** — reconnaître d\'abord mise en évidence (c=0), binôme conjugué (b=0), ' +
        'produit remarquable (Δ=0) ou mise en évidence généralisée (facteur commun visible ' +
        'avant développement) ; le discriminant sert au cas général, jamais par défaut.',
      '**Discriminant** — $\\Delta = b^2-4ac$, $x = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$ ; ' +
        'Viète : $S = x_1+x_2 = -b/a$, $P = x_1 \\cdot x_2 = c/a$.',
      '**Signe d\'un trinôme** — racines → signe de a → intervalle, avec la notation à ' +
        'crochets inversés (jamais des parenthèses).',
      '**Produit de facteurs** — une ligne par facteur, produit négatif si un nombre impair de ' +
        'facteurs y est négatif ; un facteur irréductible (Δ<0) garde un signe constant, ' +
        'aucune racine à ajouter.',
      '**Fractions rationnelles** — simplifier seulement après factorisation complète ; la CE ' +
        'se pose sur le dénominateur avant simplification, jamais après.',
      '**Équation/inéquation rationnelle** — toute solution doit être confrontée à la CE après ' +
        'résolution ; une valeur de CE reste toujours exclue de la solution d\'une inéquation, ' +
        'même pour un symbole large.',
    ],
    checklist: {
      items: [
        'Ai-je cherché une technique plus rapide que le discriminant avant de me lancer dedans ?',
        'Ai-je bien écrit −b, pas b, au numérateur de la formule du discriminant ?',
        'Ai-je posé la CE sur chaque dénominateur avant toute simplification ou mise en croix ?',
        'Ai-je confronté chaque solution trouvée à la CE — pas seulement notée en début d\'exercice ?',
      ],
    },
    forward:
      'Le discriminant et les racines reviennent au chapitre 3 (cercle trigonométrique) sous ' +
      'une autre forme — la même exigence de méthode, reconnaître avant de calculer, y reste valable.',
  },
}
