import type { ChapterContent } from '../../types'

export const calculVectoriel: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 6,
  title: 'Calcul vectoriel',
  slug: 'calcul-vectoriel',
  lede:
    "Un vecteur, ce n'est pas un segment. C'est une **direction**, un **sens** et une " +
    "**longueur** — rien de plus. Peu importe où tu le dessines sur la feuille ! Dans ce " +
    "chapitre, tu vas apprendre à manipuler les vecteurs, outil après outil : les relier à des " +
    "points, les combiner, tester leurs relations entre eux, mesurer leur longueur. Et enfin, " +
    "les utiliser pour des situations concrètes.",

  intro: {
    title: "Avant de commencer : qu'est-ce qu'un vecteur ?",
    blocks: [
      { kind: 'video', title: 'Introduction : qu\'est-ce qu\'un vecteur ? Notations, norme, vecteurs opposés', youtubeId: 'S-kVKlPyPoc' },
      {
        kind: 'intuition',
        label: 'Un nombre ne suffit pas toujours',
        text:
          "Imagine qu'on te dise : « le trésor est caché à 10 mètres d'ici. » Tu ne sais " +
          "toujours pas où creuser ! Il manque une **direction** — « 10 mètres vers le " +
          "nord-est », par exemple. Un simple nombre décrit une longueur. Un **vecteur** " +
          'décrit un déplacement complet : une longueur et une direction. Voilà exactement ' +
          'ce que ce chapitre va formaliser.',
      },
      {
        kind: 'para',
        text:
          'Un vecteur $\\vec{AB}$ porte trois informations. Rien de plus : une **direction** ' +
          '(la droite (AB)), un **sens** (de A vers B), une **longueur** (la distance AB). ' +
          "Deux vecteurs sont **égaux** dès qu'ils ont ces trois informations en commun. Même " +
          "s'ils ne sont pas dessinés au même endroit du plan !",
      },
      {
        kind: 'rappel',
        label: 'Ce que tu sais déjà (3e) — la translation',
        items: [
          'En 3e, tu as déplacé des figures par une **translation** : chaque point glisse de la ' +
            'même façon — même direction, même sens, même longueur. Ce glissement commun, c\'est ' +
            'exactement un vecteur.',
          'On commence par tout faire **sans repère**, avec des flèches et une règle (sections 1 à ' +
            '7). Les composantes d\'un vecteur dans un repère arrivent ensuite, à la section 8.',
        ],
      },
    ],
  },

  sections: [
    {
      id: 'definition',
      number: 1,
      title: "Qu'est-ce qu'un vecteur ?",
      kicker: 'direction, sens, longueur — les deux façons de noter un vecteur',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Un vecteur porte trois informations : une **direction**, un **sens** et une **longueur** (sa **norme**).',
        'Deux vecteurs sont **égaux** dès qu\'ils ont la même direction, le même sens et la même longueur, où qu\'ils soient dessinés : $\\vec{AB} = \\vec{CD}$ exactement quand **ABDC** est un parallélogramme.',
      ],
      cartes: [
        { question: 'Quelles sont les trois informations portées par un vecteur ?', reponse: 'Sa direction, son sens et sa longueur (sa norme).' },
        { question: 'Dans $\\vec{AB}$, comment s\'appellent A et B ?', reponse: 'A est l\'**origine**, B l\'**extrémité**.' },
        { question: 'Si $\\vec{AB} = \\vec{CD}$, quel quadrilatère est un parallélogramme ?', reponse: '**ABDC** (et non ABCD).' },
        { question: 'Qu\'est-ce que le vecteur nul ?', reponse: '$\\vec{AA}$, noté $\\vec{0}$ : sa longueur vaut 0, il n\'a ni direction ni sens.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Un vecteur se note de deux façons. $\\vec{AB}$ : il est rattaché à deux points, A ' +
            "son **origine** et B son **extrémité**. $\\vec{u}$, $\\vec{v}$… : là, seules " +
            'comptent la direction, le sens et la longueur — sans point particulier associé. ' +
            "Les deux notations désignent le même type d'objet. Tu peux les mélanger librement " +
            'dans un même calcul.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 5, y: 3 }, tone: 'accent' }],
            points: [
              { x: 1, y: 1, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 3, label: 'B', tone: 'ink', labelPos: 'right' },
            ],
            caption: '$\\vec{AB}$ : origine A, extrémité B, direction (AB), sens de A vers B',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — la norme, une longueur',
          items: [
            "La **norme** d'un vecteur, c'est sa longueur. On la note $\\|\\vec{u}\\|$, ou " +
              'simplement AB pour $\\vec{AB}$. Elle est toujours positive ou nulle. Tu peux la ' +
              "mesurer à la règle sur une figure, même avant d'avoir un repère.",
          ],
        },
        {
          kind: 'intuition',
          label: 'Un vecteur ne vit nulle part en particulier',
          text:
            'Pense à une consigne du type « avance de 300 mètres vers le nord-est ». Peu ' +
            'importe l\'endroit où tu te trouves quand tu la reçois : elle décrit toujours le ' +
            'même déplacement. Un vecteur fonctionne pareil — il ne « vit » nulle part en ' +
            'particulier sur la feuille. Deux flèches dessinées à des endroits complètement ' +
            'différents peuvent donc représenter exactement le même vecteur.',
        },
        {
          kind: 'piege',
          label: 'Un vecteur, pas un segment',
          text:
            'Deux représentants $\\vec{AB}$ et $\\vec{CD}$ d\'un même vecteur $\\vec{u}$ ne sont ' +
            'pas forcément superposés sur la figure. Ils sont **égaux** quand même, dès qu\'ils ' +
            'ont la même direction, le même sens et la même longueur. Peu importe où tu choisis ' +
            'de les dessiner !',
        },
        {
          kind: 'definition',
          label: 'Le vecteur nul',
          items: [
            'Le vecteur $\\vec{AA}$, qui part d\'un point et y revient, s\'appelle le **vecteur nul**. ' +
              'On le note $\\vec{0}$. Sa longueur vaut 0, et il n\'a ni direction ni sens.',
          ],
        },
        {
          kind: 'para',
          text:
            'Comment reconnaître deux vecteurs égaux sur une figure ? Par un parallélogramme : ' +
            '$\\vec{AB} = \\vec{CD}$ exactement quand **ABDC** est un parallélogramme ' +
            '(éventuellement aplati, si les quatre points sont alignés).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 5,
            yMin: -0.5,
            yMax: 4.4,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'accent' },
              { from: { x: 1, y: 2.5 }, to: { x: 4, y: 3.5 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 1, y: 2.5 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 3, y: 1 }, to: { x: 4, y: 3.5 }, tone: 'faint', dashed: true, arrow: false },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 3, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 1, y: 2.5, label: 'C', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 3.5, label: 'D', tone: 'ink', labelPos: 'right' },
            ],
            caption: '$\\vec{AB} = \\vec{CD}$ : le quadrilatère ABDC est un parallélogramme',
          },
        },
        {
          kind: 'piege',
          label: 'L\'ordre des lettres',
          text:
            'Si $\\vec{AB} = \\vec{CD}$, le parallélogramme s\'appelle **ABDC** — on le parcourt ' +
            'A → B → D → C — et non ABCD. Pour que ABCD soit un parallélogramme, il faut ' +
            '$\\vec{AB} = \\vec{DC}$.',
        },
        {
          kind: 'atelier',
          tag: 'egalite-parallelogramme-widget',
          label: 'Manipule toi-même : vecteurs égaux et parallélogramme',
          caption:
            'Déplace A, B et C. Si AB = CD, alors ABDC est un parallélogramme : attention à ' +
            'l\'ordre des lettres, le piège ABCD donne un quadrilatère croisé. En mode « ' +
            'quatrième sommet », D = C − AB rend ABCD parallélogramme, et ses diagonales ' +
            'ont le même milieu.',
        },
        {
          kind: 'historique',
          titre: 'La formule gravée sur un pont, un jour d\'octobre 1843',
          text:
            'Le 16 octobre 1843, le mathématicien irlandais **William Rowan Hamilton** se ' +
            'promène le long du canal Royal à Dublin avec sa femme quand une idée lui vient ' +
            'd\'un coup : une nouvelle façon de calculer avec des grandeurs ayant à la fois ' +
            'une direction et une longueur, en trois dimensions. Pris d\'enthousiasme, il ' +
            'grave sur-le-champ la formule centrale de sa découverte — ' +
            '$i^2=j^2=k^2=ijk=-1$ — dans la pierre du pont de Broom Bridge. Ces ' +
            '« quaternions » sont l\'une des premières tentatives de calculer, en trois ' +
            'dimensions, avec des grandeurs à la fois dirigées et mesurables. Dans le plan, ' +
            'd\'autres l\'avaient déjà fait : le Norvégien Caspar Wessel (1799) et le Suisse ' +
            'Jean-Robert Argand (1806) avec les nombres complexes, puis l\'Italien Giusto ' +
            'Bellavitis, dont les « équipollences » (1835) sont déjà des vecteurs du plan. ' +
            'Simplifiée quelques décennies plus tard, l\'idée de Hamilton deviendra le ' +
            'vecteur que tu utilises dans ce chapitre.',
          image: {
            src: '/images/historique/hamilton.jpg',
            alt: 'Portrait de William Rowan Hamilton',
            caption: 'William Rowan Hamilton (1805–1865), peinture d\'époque.',
          },
        },
      ],
    },

    {
      id: 'oppose',
      number: 2,
      title: 'Vecteurs opposés',
      kicker: 'même direction, même longueur, sens contraires',
      titreCourt: 'Vecteurs opposés',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Deux vecteurs **opposés** ont la même direction, la même longueur et des sens contraires. L\'opposé de $\\vec{AB}$ est $-\\vec{AB} = \\vec{BA}$.',
        'Un vecteur suivi de son opposé ramène au point de départ : $\\vec{u} + (-\\vec{u}) = \\vec{0}$.',
      ],
      cartes: [
        { question: 'Que partagent deux vecteurs opposés ?', reponse: 'La direction et la longueur ; leurs sens sont contraires.' },
        { question: 'Écris l\'opposé de $\\vec{AB}$ de deux façons.', reponse: '$-\\vec{AB}$ ou $\\vec{BA}$.' },
        { question: 'Que vaut $\\vec{AB} + \\vec{BA}$ ?', reponse: '$\\vec{AA} = \\vec{0}$.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Deux vecteurs sont **opposés** quand ils ont la **même direction**, la **même ' +
            'longueur**, mais des **sens contraires**. L\'opposé de $\\vec{u}$ se note ' +
            '$-\\vec{u}$. L\'opposé de $\\vec{AB}$ se note $-\\vec{AB}$ — ou, ce qui revient au ' +
            'même, $\\vec{BA}$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [
              { from: { x: 0.5, y: 3 }, to: { x: 4.5, y: 3 }, tone: 'accent' },
              { from: { x: 4.5, y: 1 }, to: { x: 0.5, y: 1 }, tone: 'bad' },
            ],
            points: [
              { x: 2.5, y: 3.3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
              { x: 2.5, y: 0.7, vectorLabel: [{ text: '−' }, { text: 'u', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même longueur, même direction, sens opposé',
          },
        },
        {
          kind: 'para',
          text:
            'Un vecteur suivi de son opposé ramène au point de départ : ' +
            '$\\vec{AB} + \\vec{BA} = \\vec{AA} = \\vec{0}$. De même, $\\vec{u} + (-\\vec{u}) = \\vec{0}$.',
        },
      ],
    },

    {
      id: 'multiplicationGeometrique',
      number: 3,
      title: 'Multiplier un vecteur par un réel : colinéarité et alignement',
      kicker: 'k > 1 allonge, 0 < k < 1 raccourcit, k < 0 inverse le sens — colinéaires : même direction',
      titreCourt: 'Multiplier par un réel',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Multiplier un vecteur par k ne change **jamais** sa direction : seules sa longueur et, si k est négatif, son sens changent.',
        'Deux vecteurs sont **colinéaires** quand ils ont la même direction. A, B et C sont alignés ⟺ $\\vec{AC} = k \\cdot \\vec{AB}$ pour un certain nombre k.',
      ],
      cartes: [
        { question: 'Que devient la direction de $\\vec{u}$ quand on le multiplie par un nombre k ?', reponse: 'Elle ne change jamais.' },
        { question: 'Quel est l\'effet de $k = -1$ sur $\\vec{AB}$ ?', reponse: 'Sens opposé, même longueur : on obtient le vecteur opposé.' },
        { question: 'Quand deux vecteurs sont-ils colinéaires ?', reponse: 'Quand ils ont la même direction : portés par des droites parallèles ou par la même droite.' },
        { question: 'Comment savoir si A, B et C sont alignés ?', reponse: '$\\vec{AB}$ et $\\vec{AC}$ sont colinéaires : $\\vec{AC} = k \\cdot \\vec{AB}$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Multiplier un vecteur par un réel, colinéarité, additionner deux vecteurs', youtubeId: '0Z_OAR2MA1E' },
        {
          kind: 'para',
          text:
            'Multiplier un vecteur par un nombre k ne change **jamais** sa **direction**. ' +
            'Seules sa longueur, et son sens si k est négatif, sont modifiés.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 5,
            yMin: -2,
            yMax: 3,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2, y: 1 }, tone: 'ink' },
              { from: { x: 0, y: 0 }, to: { x: 4, y: 2 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 1, y: 0.5 }, tone: 'tip' },
              { from: { x: 0, y: 0 }, to: { x: -2, y: -1 }, tone: 'bad' },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 2.2, y: 1.1, vectorLabel: [{ text: 'AB', vector: true }], tone: 'ink', node: false },
              { x: 4.2, y: 2.1, vectorLabel: [{ text: '2·' }, { text: 'AB', vector: true }], tone: 'good', node: false },
              { x: 1.1, y: 0.65, vectorLabel: [{ text: '0,5·' }, { text: 'AB', vector: true }], tone: 'tip', node: false, labelPos: 'above' },
              { x: -2.2, y: -1.1, vectorLabel: [{ text: '−' }, { text: 'AB', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même direction pour les 4 vecteurs — seules la longueur et, pour $-\\vec{AB}$, le sens changent',
          },
        },
        {
          kind: 'featureTable',
          headers: ['Valeur de k', 'Effet sur AB'],
          rows: [
            ['k > 1', 'même sens, plus long'],
            ['0 < k < 1', 'même sens, plus court'],
            ['k = 0', 'vecteur nul (pas de direction)'],
            ['−1 < k < 0', 'sens opposé, plus court'],
            ['k = −1', 'sens opposé, même longueur (vecteur opposé)'],
            ['k < −1', 'sens opposé, plus long'],
          ],
        },
        {
          kind: 'atelier',
          tag: 'multiplication-k-widget',
          label: 'Manipule toi-même : multiplier par k',
          caption:
            'Fais varier k de −3 à 3 : k·AB reste sur la droite (AB). Sa longueur est |k| ' +
            'fois celle de AB, et son sens s\'inverse quand k devient négatif. Le tableau ' +
            'surligne le cas en cours, et k = 0 donne le vecteur nul.',
        },
        {
          kind: 'astuce',
          text:
            'Pour construire $k \\cdot \\vec{AB}$ à la règle : reporte la longueur de [AB] |k| ' +
            'fois sur la droite (AB). Dans le même sens que AB si k > 0, dans le sens opposé si ' +
            'k < 0.',
        },
        { kind: 'subheading', text: 'Vecteurs colinéaires et points alignés' },
        {
          kind: 'para',
          text:
            'Deux vecteurs sont **colinéaires** quand ils ont la même direction. Ils sont ' +
            'portés par des droites parallèles, ou par la même droite. Trois points A, B et C ' +
            'sont **alignés** exactement quand $\\vec{AB}$ et $\\vec{AC}$ (deux vecteurs de ' +
            'même origine A) sont colinéaires. Par convention, le vecteur nul est colinéaire ' +
            'à tous les vecteurs.',
        },
        {
          kind: 'intuition',
          label: 'Pour se représenter la colinéarité',
          text:
            'Deux vecteurs colinéaires, c\'est comme deux voitures qui roulent sur la même ' +
            'route (ou sur deux routes parallèles) : peu importe leur vitesse, ou même si ' +
            'l\'une roule en marche arrière — elles vont dans la même direction, ou dans la ' +
            'direction exactement opposée. « Colinéaire » ne veut pas dire « identique », ' +
            'juste « sur la même droite ».',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 0, y: 0.3 }, to: { x: 6.3, y: 3.5 }, tone: 'accent' }],
            points: [
              { x: 0, y: 0.3, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 2, y: 1.3, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6, y: 3.3, label: 'C', tone: 'ink', labelPos: 'above' },
            ],
            caption: 'A, B et C alignés — $\\vec{AB}$ et $\\vec{AC}$ sont colinéaires',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Alignement de 3 points — A, B, C alignés ⟺ $\\vec{AB}$ et $\\vec{AC}$ colinéaires. ' +
              "Autrement dit, $\\vec{AC} = k \\cdot \\vec{AB}$ pour un certain nombre k.",
          ],
        },
        {
          kind: 'entrainement',
          title: 'Construction graphique de vecteurs',
          generatorId: 'gen23',
          description: ['Trace k·AB par glisser-déposer sur une grille magnétique.'],
          chantier: '4e',
          whereLabel: '4e → « 23. Construction graphique de vecteurs »',
        },
      ],
    },

    {
      id: 'additionGeometrique',
      number: 4,
      title: 'Additionner deux vecteurs',
      kicker: 'méthode du triangle (Chasles) ou du parallélogramme',
      titreCourt: 'Additionner deux vecteurs',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        '**Bout à bout** (méthode du triangle) : place $\\vec{v}$ à la suite de $\\vec{u}$ ; la somme va du point de départ au point d\'arrivée.',
        '**Même origine** (méthode du parallélogramme) : $\\vec{u} + \\vec{v}$ est la diagonale du parallélogramme construit sur $\\vec{u}$ et $\\vec{v}$.',
        'L\'ordre ne compte pas : $\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$.',
      ],
      cartes: [
        { question: 'Méthode du triangle : comment les deux vecteurs sont-ils placés ?', reponse: 'Bout à bout : l\'origine de $\\vec{v}$ est l\'extrémité de $\\vec{u}$.' },
        { question: '$\\vec{u}$ et $\\vec{v}$ ont la même origine : que représente $\\vec{u} + \\vec{v}$ ?', reponse: 'La diagonale du parallélogramme construit sur $\\vec{u}$ et $\\vec{v}$, issue de cette origine.' },
        { question: '$\\vec{u} + \\vec{v}$ et $\\vec{v} + \\vec{u}$ sont-ils égaux ?', reponse: 'Oui : l\'ordre ne compte pas.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "Il y a deux façons d'additionner deux vecteurs. Le résultat est le même — tout " +
            "dépend de la façon dont ils sont placés l'un par rapport à l'autre.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'good' },
              { from: { x: 3, y: 1 }, to: { x: 4.5, y: 4 }, tone: 'attn' },
              { from: { x: 0, y: 0 }, to: { x: 4.5, y: 4 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1.5, y: 0.9, vectorLabel: [{ text: 'u', vector: true }], tone: 'good', node: false },
              { x: 4, y: 2.6, vectorLabel: [{ text: 'v', vector: true }], tone: 'attn', node: false },
              { x: 2.5, y: 2.4, vectorLabel: [{ text: 'u', vector: true }, { text: ' + ' }, { text: 'v', vector: true }], tone: 'accent', node: false },
            ],
            caption:
              'méthode du triangle : $\\vec{v}$ placé à la suite de $\\vec{u}$ — le vecteur ' +
              "somme relie directement le point de départ au point d'arrivée",
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            "Méthode du triangle — les vecteurs sont consécutifs : l'origine de $\\vec{v}$ est " +
              "l'extrémité de $\\vec{u}$. C'est la relation de Chasles (section 6).",
            'Méthode du parallélogramme — les vecteurs ont la même origine. Utilisée en ' +
              'physique (section 17). La somme est la diagonale du parallélogramme construit ' +
              'sur $\\vec{u}$ et $\\vec{v}$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 5,
            showAxes: false,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 1 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 1.5, y: 3 }, tone: 'attn' },
              { from: { x: 3, y: 1 }, to: { x: 4.5, y: 4 }, tone: 'faint', dashed: true },
              { from: { x: 1.5, y: 3 }, to: { x: 4.5, y: 4 }, tone: 'faint', dashed: true },
              { from: { x: 0, y: 0 }, to: { x: 4.5, y: 4 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1.7, y: 0.25, vectorLabel: [{ text: 'u', vector: true }], tone: 'good', node: false },
              { x: 0.45, y: 1.8, vectorLabel: [{ text: 'v', vector: true }], tone: 'attn', node: false, labelPos: 'left' },
              { x: 3, y: 2.9, vectorLabel: [{ text: 'u', vector: true }, { text: ' + ' }, { text: 'v', vector: true }], tone: 'accent', node: false, labelPos: 'left' },
            ],
            caption:
              'méthode du parallélogramme : $\\vec{u}$ et $\\vec{v}$ partent du même point ; la somme ' +
              'est la diagonale issue de ce point',
          },
        },
        {
          kind: 'para',
          text:
            'Dans le parallélogramme, deux chemins mènent de O au sommet opposé : $\\vec{u}$ puis ' +
            '$\\vec{v}$, ou $\\vec{v}$ puis $\\vec{u}$. Ils arrivent au même endroit : ' +
            '$\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$. L\'ordre ne compte pas.',
        },
        {
          kind: 'atelier',
          tag: 'somme-vecteurs-widget',
          label: 'Manipule toi-même : additionner et soustraire',
          caption:
            'Fais glisser les extrémités de u et v, puis choisis l\'opération et la méthode. ' +
            'Bout à bout, la somme va du point de départ au point d\'arrivée ; avec une même ' +
            'origine, c\'est la diagonale du parallélogramme. Pour u − v, on ajoute l\'opposé ' +
            '−v. Le calcul se fait composante par composante (section 9), et v + u donne ' +
            'toujours le même vecteur que u + v.',
        },
        {
          kind: 'application',
          titre: 'Calculer la vraie trajectoire d\'un avion dans le vent',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -5,
              xMax: 120,
              yMin: -5,
              yMax: 40,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 100, y: 0 }, tone: 'accent' },
                { from: { x: 100, y: 0 }, to: { x: 110, y: 25 }, tone: 'attn' },
                { from: { x: 0, y: 0 }, to: { x: 110, y: 25 }, tone: 'good' },
              ],
              points: [
                { x: 45, y: 4, vectorLabel: [{ text: 'vitesse-air (100 km/h)', vector: true }], tone: 'accent', node: false },
                { x: 97, y: 15, vectorLabel: [{ text: 'vent', vector: true }], tone: 'attn', node: false },
                { x: 45, y: 18, vectorLabel: [{ text: 'vitesse-sol (résultante)', vector: true }], tone: 'good', node: false },
              ],
              caption:
                "Vecteur vitesse-air (100 km/h plein est) + vecteur vent (méthode du triangle, " +
                "bout à bout) = vecteur vitesse-sol : environ 112,8 km/h, dévié d'environ 13° " +
                "par rapport au cap affiché — c'est la trajectoire réellement suivie.",
            },
          ],
          text:
            'Un avion ne vole jamais exactement où son pilote le dirige : le vent le pousse ' +
            'de côté. Les pilotes représentent la vitesse propre de l\'avion (par rapport à ' +
            'l\'air) par un vecteur, et le vent par un second vecteur — l\'addition de cette ' +
            'section (ici par la méthode du triangle, bout à bout) donne alors directement la **trajectoire ' +
            'réelle au sol** : la somme des deux vecteurs. C\'est exactement ainsi que les ' +
            'plans de vol sont calculés, aujourd\'hui encore assistés par ordinateur : ' +
            'additionner le vecteur vitesse-air et le vecteur vent pour obtenir le vecteur ' +
            'vitesse-sol, avec sa propre direction (la route réellement suivie) et sa propre ' +
            'longueur (la vitesse réelle, qui peut être plus grande ou plus petite que la ' +
            'vitesse affichée au tableau de bord).',
          domaines: ['Aviation', 'Navigation'],
        },
        {
          kind: 'methode',
          label: 'Construire une combinaison ou placer un point',
          items: [
            'Pour $2\\vec{u} - \\vec{v}$ à partir de O : trace $2\\vec{u}$ à partir de O, puis ' +
              "$-\\vec{v}$ bout à bout, à partir de l'extrémité de $2\\vec{u}$. Le résultat va de O " +
              "au point d'arrivée de la chaîne.",
            "Pour placer M tel que $\\vec{AM} = 2\\vec{AB} - \\vec{AC}$ : construis d'abord P tel que " +
              '$\\vec{AP} = 2\\vec{AB}$, puis trace $-\\vec{AC}$ à partir de P. Son extrémité est M ' +
              '(relation de Chasles : $\\vec{AM} = \\vec{AP} + \\vec{PM}$).',
            "Si la relation est donnée avec $\\vec{MA}$, retourne-la d'abord : $\\vec{MA} = -\\vec{AM}$, " +
              'donc chaque terme change de signe.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Construire une somme, une différence, un point',
          generatorId: 'gen83',
          description: [
            "Sur la grille magnétique : construis u + v (bout à bout ou par le parallélogramme), la différence u − v, puis k·u + l·v ; place un point défini par une relation et lis les composantes d'un vecteur tracé.",
          ],
          chantier: '4e',
          whereLabel: '4e → « 83. Construire une somme, une différence, un point »',
        },
      ],
    },

    {
      id: 'soustractionGeometrique',
      number: 5,
      title: 'Soustraire un vecteur',
      kicker: 'retrancher un vecteur, c\'est ajouter son opposé',
      titreCourt: 'Soustraire un vecteur',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Retrancher un vecteur, c\'est ajouter son opposé : $\\vec{u} - \\vec{v} = \\vec{u} + (-\\vec{v})$.',
        'À partir d\'une même origine, $\\vec{u} - \\vec{v}$ va de l\'extrémité de $\\vec{v}$ à l\'extrémité de $\\vec{u}$ — dans ce sens précis.',
      ],
      cartes: [
        { question: 'Écris $\\vec{u} - \\vec{v}$ comme une somme.', reponse: '$\\vec{u} + (-\\vec{v})$.' },
        { question: '$\\vec{u}$ et $\\vec{v}$ partent du même point : d\'où part $\\vec{u} - \\vec{v}$, et où arrive-t-il ?', reponse: 'Il part de l\'extrémité de $\\vec{v}$ et arrive à l\'extrémité de $\\vec{u}$.' },
        { question: 'Comment vérifier que $\\vec{w} = \\vec{u} - \\vec{v}$ ?', reponse: '$\\vec{w} + \\vec{v} = \\vec{u}$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Soustraire un vecteur, relation de Chasles, décomposer un vecteur', youtubeId: '5Bb0aZwuzK4' },
        {
          kind: 'para',
          text:
            "Retrancher un vecteur, c'est ajouter son opposé : $\\vec{u} - \\vec{v} = \\vec{u} + " +
            '(-\\vec{v})$. Place $\\vec{u}$ et $\\vec{v}$ à partir de la même origine. Leur ' +
            "différence $\\vec{w} = \\vec{u} - \\vec{v}$ relie alors l'extrémité de $\\vec{v}$ " +
            "à l'extrémité de $\\vec{u}$ — dans ce sens précis ! Vérifie : " +
            '$\\vec{w} + \\vec{v} = \\vec{u}$.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2.5, y: 4 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 1.3 }, tone: 'attn' },
              { from: { x: 6, y: 1.3 }, to: { x: 2.5, y: 4 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 1.2, y: 2.2, vectorLabel: [{ text: 'u', vector: true }], tone: 'good', node: false, labelPos: 'left' },
              { x: 3.5, y: 1.1, vectorLabel: [{ text: 'v', vector: true }], tone: 'attn', node: false, labelPos: 'below' },
              { x: 4.6, y: 2.9, vectorLabel: [{ text: 'u', vector: true }, { text: ' − ' }, { text: 'v', vector: true }], tone: 'accent', node: false, labelPos: 'right' },
            ],
            caption: '$\\vec{w} = \\vec{u} - \\vec{v}$ part de l\'extrémité de $\\vec{v}$ et arrive à l\'extrémité de $\\vec{u}$',
          },
        },
      ],
    },

    {
      id: 'chasles',
      number: 6,
      title: 'Réduire une somme de vecteurs : la relation de Chasles',
      kicker: 'AB + BC = AC',
      titreCourt: 'Relation de Chasles',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Une chaîne de vecteurs qui se relaient se réduit au vecteur qui va du tout premier point au tout dernier : $\\vec{AB} + \\vec{BC} = \\vec{AC}$.',
        'Une chaîne **fermée** se réduit au vecteur nul. Un vecteur écrit « à l\'envers » ? Remplace-le d\'abord par son opposé.',
      ],
      cartes: [
        { question: 'Que vaut $\\vec{AB} + \\vec{BC} + \\vec{CD}$ ?', reponse: '$\\vec{AD}$.' },
        { question: 'Que vaut la chaîne fermée $\\vec{AB} + \\vec{BC} + \\vec{CA}$ ?', reponse: '$\\vec{0}$.' },
        { question: '$\\vec{AB} - \\vec{AC}$ vaut-il $\\vec{BC}$ ?', reponse: 'Non : $\\vec{AB} - \\vec{AC} = \\vec{CB}$.' },
        { question: 'I est le milieu de [AB] : que vaut $\\vec{IA} + \\vec{IB}$ ?', reponse: '$\\vec{0}$ : ces deux vecteurs sont opposés.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "Une chaîne de vecteurs se relaie point par point : le point d'arrivée de l'un est " +
            "le point de départ du suivant. Elle se réduit alors à un seul vecteur — celui qui " +
            'va directement du tout premier point au tout dernier.',
        },
        {
          kind: 'intuition',
          label: 'Une marche en deux étapes',
          text:
            "Marche de A à B, puis de B à C : où que t'aient fait bifurquer les deux étapes, " +
            'tu es arrivé exactement là où tu serais arrivé en marchant directement de A à C, ' +
            'en ligne droite. C\'est tout ce que dit la relation de Chasles : ' +
            '$\\vec{AB} + \\vec{BC} = \\vec{AC}$. Le point B, simple étape intermédiaire, ' +
            "n'apparaît plus dans le résultat final.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4.5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 3.5 }, tone: 'good' },
              { from: { x: 3, y: 3.5 }, to: { x: 6.5, y: 1.2 }, tone: 'attn' },
              { from: { x: 0, y: 0 }, to: { x: 6.5, y: 1.2 }, tone: 'accent', dashed: true },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 3.5, label: 'B', tone: 'ink', labelPos: 'above' },
              { x: 6.5, y: 1.2, label: 'C', tone: 'ink', labelPos: 'right' },
              { x: 1.3, y: 2, vectorLabel: [{ text: 'AB', vector: true }], tone: 'good', node: false },
              { x: 5, y: 2.7, vectorLabel: [{ text: 'BC', vector: true }], tone: 'attn', node: false },
              { x: 3.3, y: 0.5, vectorLabel: [{ text: 'AB', vector: true }, { text: ' + ' }, { text: 'BC', vector: true }, { text: ' = ' }, { text: 'AC', vector: true }], tone: 'accent', node: false },
            ],
            caption: 'le point B, commun aux deux vecteurs, disparaît dans la somme',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '$\\vec{A_1A_2} + \\vec{A_2A_3} + \\ldots + \\vec{A_{n-1}A_n} = \\vec{A_1A_n}$.',
            'Une chaîne **fermée** (qui revient à son point de départ) se réduit toujours au vecteur nul.',
            'Un vecteur écrit « à l\'envers » ($\\vec{CB}$ au lieu de $\\vec{BC}$) ? ' +
              'Remplace-le d\'abord par son opposé ($-\\vec{BC}$), avant de télescoper.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'réduire une chaîne de 3 vecteurs',
          formula: 'Réduire $\\vec{AB} + \\vec{BC} + \\vec{CD}$.',
          steps: [
            { tag: '1er télescopage', text: '$\\vec{AB} + \\vec{BC} = \\vec{AC}$' },
            { tag: '2e télescopage', text: '$\\vec{AC} + \\vec{CD} = \\vec{AD}$' },
          ],
          result: { tag: 'résultat', text: '$\\vec{AB} + \\vec{BC} + \\vec{CD} = \\vec{AD}$' },
        },
        {
          kind: 'piege',
          label: 'Une différence de vecteurs de même origine',
          text:
            '$\\vec{AB} - \\vec{AC}$ ne vaut **pas** $\\vec{BC}$ ! Retrancher, c\'est ajouter ' +
            'l\'opposé : $\\vec{AB} - \\vec{AC} = \\vec{AB} + \\vec{CA} = \\vec{CA} + \\vec{AB} = ' +
            '\\vec{CB}$. Le résultat va de l\'extrémité du vecteur retranché vers celle de l\'autre.',
        },
        {
          kind: 'exemple',
          badge: 'réordonner et retourner',
          formula: 'Réduire $\\vec{AB} + \\vec{CD} + \\vec{BC} - \\vec{AD}$.',
          steps: [
            { tag: 'réordonner pour que les vecteurs se relaient', text: '$\\vec{AB} + \\vec{BC} + \\vec{CD} - \\vec{AD}$' },
            { tag: 'télescoper', text: '$\\vec{AB} + \\vec{BC} + \\vec{CD} = \\vec{AD}$' },
            { tag: 'retrancher, c\'est ajouter l\'opposé', text: '$\\vec{AD} - \\vec{AD} = \\vec{AD} + \\vec{DA} = \\vec{AA}$' },
          ],
          result: { tag: 'résultat', text: '$\\vec{AB} + \\vec{CD} + \\vec{BC} - \\vec{AD} = \\vec{0}$ (chaîne fermée)' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le milieu par Chasles',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit I le milieu de [AB]. Les vecteurs $\\vec{IA}$ et $\\vec{IB}$ ont la même ' +
                'longueur, la même direction et des sens contraires : ils sont opposés, donc ' +
                '$\\vec{IA} + \\vec{IB} = \\vec{0}$.',
            },
            {
              kind: 'para',
              text:
                'Pour un point M quelconque, insère I par Chasles dans chaque vecteur : ' +
                '$\\vec{MA} + \\vec{MB} = (\\vec{MI} + \\vec{IA}) + (\\vec{MI} + \\vec{IB}) = ' +
                '2\\vec{MI} + (\\vec{IA} + \\vec{IB}) = 2\\vec{MI}$.',
            },
          ],
        },
        {
          kind: 'astuce',
          label: 'Des coefficients ? Regroupe d\'abord',
          text:
            'Quand deux vecteurs qui se relaient ont le même coefficient, mets-le en évidence avant ' +
            'de télescoper : $2\\vec{AB}+2\\vec{BC}-\\vec{AC}=2(\\vec{AB}+\\vec{BC})-\\vec{AC}=' +
            '2\\vec{AC}-\\vec{AC}=\\vec{AC}$.',
        },
        {
          kind: 'exemple',
          badge: 'démontrer une égalité vectorielle',
          formula: 'Démontrer que $\\vec{AB}+\\vec{CD}=\\vec{AD}+\\vec{CB}$, quels que soient les points A, B, C et D.',
          steps: [
            { tag: 'partir d\'un seul membre et insérer D dans AB', text: '$\\vec{AB}+\\vec{CD}=\\vec{AD}+\\vec{DB}+\\vec{CD}$' },
            { tag: 'réordonner pour que deux vecteurs se relaient', text: '$=\\vec{AD}+\\vec{CD}+\\vec{DB}$' },
            { tag: 'télescoper', text: '$=\\vec{AD}+\\vec{CB}$' },
          ],
          result: { tag: 'résultat', text: 'on a transformé le membre de gauche jusqu\'à obtenir celui de droite : l\'égalité est vraie pour tous points (on ne part jamais de l\'égalité à démontrer)' },
        },
        {
          kind: 'exemple',
          badge: 'un point défini par une égalité',
          formula: 'Le point M vérifie $2\\vec{MA}+\\vec{MB}=\\vec{0}$. Exprimer $\\vec{AM}$ en fonction de $\\vec{AB}$.',
          steps: [
            { tag: 'insérer A dans MB', text: '$2\\vec{MA}+\\vec{MA}+\\vec{AB}=\\vec{0}$, donc $3\\vec{MA}+\\vec{AB}=\\vec{0}$' },
            { tag: 'retourner : MA = −AM', text: '$-3\\vec{AM}+\\vec{AB}=\\vec{0}$, donc $\\vec{AB}=3\\vec{AM}$' },
          ],
          result: { tag: 'résultat', text: '$\\vec{AM}=\\dfrac{1}{3}\\vec{AB}$ : M est sur [AB], au tiers en partant de A' },
        },
        {
          kind: 'atelier',
          tag: 'chasles-defi-widget',
          label: 'Manipule toi-même : le défi Chasles',
          caption:
            'Réduis une expression vectorielle sur une figure : il faudra parfois ' +
            'réordonner les vecteurs, en retourner un ou transformer une soustraction. ' +
            'Choisis le bon résultat en un seul essai : la correction détaille le ' +
            'télescopage et dessine la chaîne sur la figure. Attention au piège AB − AC = ' +
            'CB, et non BC !',
        },
        {
          kind: 'entrainement',
          title: 'Réduction d\'une somme de vecteurs (Chasles)',
          generatorId: 'gen27',
          description: ['Réduis une chaîne télescopique de vecteurs sur 4 figures fixes (hexagone, étoile, trapèze, triangle et médianes).'],
          chantier: '4e',
          whereLabel: '4e → « 27. Réduction d\'une somme de vecteurs (Chasles) »',
        },
        {
          kind: 'entrainement',
          title: 'Chasles sans figure : réduire et démontrer une égalité vectorielle',
          generatorId: 'gen130',
          description: [
            'Calcul littéral sur des vecteurs nommés par deux points, sans figure : retourne et réordonne pour réduire, simplifie avec des coefficients, démontre une égalité comme AB + CD = AD + CB, insère un point (milieu, point défini par 2·MA + MB = 0).',
          ],
          chantier: '4e',
          whereLabel: '4e → « 130. Chasles sans figure »',
        },
      ],
    },

    {
      id: 'decompositionGeometrique',
      number: 7,
      title: 'Décomposer un vecteur selon deux directions',
      kicker: 'méthode du parallélogramme, en sens inverse',
      titreCourt: 'Décomposer un vecteur',
      partie: 'Sans repère : des flèches et une règle',
      essentiel: [
        'Décomposer $\\vec{u}$ selon deux directions non colinéaires, c\'est l\'écrire $\\vec{u} = a\\vec{v} + b\\vec{w}$ : la méthode du parallélogramme, en sens inverse.',
        'Trace des **parallèles** aux deux directions, jamais des perpendiculaires ; un coefficient est négatif quand on va à contresens.',
      ],
      cartes: [
        { question: 'Pour décomposer $\\vec{u}$, que trace-t-on par son extrémité ?', reponse: 'Les parallèles aux deux directions imposées.' },
        { question: 'Quand le coefficient a de $\\vec{u} = a\\vec{v} + b\\vec{w}$ est-il négatif ?', reponse: 'Quand on va à contresens de $\\vec{v}$ ($\\vec{PM}$ et $\\vec{v}$ de sens contraires).' },
        { question: 'Peut-on décomposer un vecteur selon $\\vec{v}$ et $\\vec{w}$ colinéaires ?', reponse: 'Non : les deux directions n\'en font qu\'une.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "Tu peux aussi faire l'inverse : décomposer un vecteur en une somme de deux " +
            'vecteurs, chacun avec une direction imposée (deux droites non parallèles). ' +
            "C'est encore la méthode du parallélogramme — utilisée cette fois en sens inverse.",
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 1, y: 0.5 }, to: { x: 6, y: 4.5 }, tone: 'accent' },
              { from: { x: 1, y: 0.5 }, to: { x: 3, y: 2 }, tone: 'good' },
              { from: { x: 1, y: 0.5 }, to: { x: 4, y: 1.3 }, tone: 'attn' },
              { from: { x: 3, y: 2 }, to: { x: 6, y: 4.5 }, tone: 'faint', dashed: true },
              { from: { x: 4, y: 1.3 }, to: { x: 6, y: 4.5 }, tone: 'faint', dashed: true },
            ],
            points: [
              { x: 2.5, y: 1.3, vectorLabel: [{ text: 'v', vector: true }], tone: 'good', node: false },
              { x: 3, y: 0.7, vectorLabel: [{ text: 'w', vector: true }], tone: 'attn', node: false },
              { x: 4.2, y: 3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
            ],
            caption: '$\\vec{u} = \\vec{v} + \\vec{w}$, avec $\\vec{v}$ et $\\vec{w}$ portés par deux directions distinctes',
          },
        },
        {
          kind: 'methode',
          label: 'Construire la décomposition',
          items: [
            'Trace, à partir de l\'origine de $\\vec{u}$, les deux droites qui portent les directions imposées.',
            'Par l\'extrémité de $\\vec{u}$, trace les parallèles à ces deux droites.',
            'Chaque parallèle coupe l\'autre droite en un point : les deux vecteurs obtenus depuis ' +
              'l\'origine sont $\\vec{v}$ et $\\vec{w}$, et $\\vec{u} = \\vec{v} + \\vec{w}$ (méthode du parallélogramme).',
          ],
        },
        {
          kind: 'para',
          text:
            'Souvent, les deux directions sont données par deux vecteurs $\\vec{v}$ et $\\vec{w}$ non ' +
            'colinéaires. Pour décomposer $\\vec{u} = \\vec{PQ}$, trace par P la parallèle à $\\vec{v}$ et ' +
            'par Q la parallèle à $\\vec{w}$ : elles se coupent en un point M. Alors $\\vec{PM}$ est ' +
            'colinéaire à $\\vec{v}$ et $\\vec{MQ}$ à $\\vec{w}$ : $\\vec{PM} = a\\vec{v}$, ' +
            '$\\vec{MQ} = b\\vec{w}$, et $\\vec{u} = a\\vec{v} + b\\vec{w}$. La valeur absolue de a est le ' +
            'nombre de fois que la longueur de $\\vec{v}$ tient dans [PM] (de même pour b).',
        },
        {
          kind: 'attention',
          label: 'Le signe et le rôle des coefficients',
          text:
            'Si $\\vec{PM}$ et $\\vec{v}$ sont de sens contraires (on va « à contresens »), a est ' +
            '**négatif** — de même pour b. Ne mélange pas les deux directions : a se lit sur le côté ' +
            'parallèle à $\\vec{v}$, b sur le côté parallèle à $\\vec{w}$. Trace des parallèles, jamais des ' +
            'perpendiculaires. Enfin, si $\\vec{v}$ et $\\vec{w}$ sont colinéaires, les deux directions ' +
            'n\'en font qu\'une : la décomposition n\'est pas possible.',
        },
        {
          kind: 'atelier',
          tag: 'decomposition-vecteur-widget',
          label: 'Manipule toi-même : décomposer un vecteur',
          caption:
            'Choisis deux directions (les vecteurs v et w) et un vecteur u, puis déplace ' +
            'leurs extrémités. Par l\'extrémité de u, les parallèles aux deux directions ' +
            'construisent le parallélogramme : u = a·v + b·w. Les composantes confirment le ' +
            'résultat en résolvant un système (section 10). Si v et w sont colinéaires, la ' +
            'décomposition est impossible. Le réglage de départ est celui de l\'exemple de ' +
            'la section 10 : u(5 ; 1) = 3·v + 2·w.',
        },
        {
          kind: 'historique',
          titre: 'Une théorie trop en avance sur son temps',
          text:
            'En 1844, l\'Allemand **Hermann Grassmann**, enseignant de lycée sans poste ' +
            'universitaire, publie « Die lineale Ausdehnungslehre » (« Théorie de ' +
            'l\'extension linéaire ») : il y développe, bien avant tout le monde, l\'idée ' +
            'qu\'un vecteur peut se décomposer selon plusieurs directions indépendantes — ' +
            'exactement ce que tu viens de faire dans cette section. Le problème ? Son livre ' +
            'est écrit dans un style si abstrait et philosophique que presque aucun ' +
            'mathématicien de son époque ne le comprend ni ne le lit. Ses idées ne seront ' +
            'pleinement reconnues et reprises que des décennies plus tard, une fois que ' +
            'd\'autres auront redécouvert — en plus simple — ce qu\'il avait déjà démontré.',
          image: {
            src: '/images/historique/grassmann.jpg',
            alt: 'Portrait de Hermann Grassmann',
            caption: 'Hermann Grassmann (1809–1877), photographie d\'époque.',
          },
        },
        {
          kind: 'application',
          titre: 'Décomposer la tension d\'un câble pour dimensionner un pont',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -3,
              xMax: 30,
              yMin: -7,
              yMax: 48,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 25, y: 43.3 }, tone: 'accent' },
                { from: { x: 25, y: 43.3 }, to: { x: 25, y: 0 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 25, y: 43.3 }, to: { x: 0, y: 43.3 }, tone: 'faint', dashed: true, arrow: false },
                { from: { x: 0, y: 0 }, to: { x: 25, y: 0 }, tone: 'good' },
                { from: { x: 0, y: 0 }, to: { x: 0, y: 43.3 }, tone: 'attn' },
              ],
              points: [
                { x: 25, y: 43.3, vectorLabel: [{ text: 'T = 50 kN', vector: true }], tone: 'accent', labelPos: 'above' },
                { x: 12.5, y: 0, label: 'Tx ≈ 25 kN', tone: 'good', labelPos: 'below', node: false },
                { x: 0.5, y: 22, label: 'Ty ≈ 43,3 kN', tone: 'attn', labelPos: 'right', node: false },
              ],
              caption:
                "Le câble tire avec une tension T = 50 kN, inclinée à 60° sur l'horizontale. " +
                "Décomposée selon les deux directions de la poutre, sa composante verticale " +
                "Ty donne le poids réellement supporté, sa composante horizontale Tx la " +
                'compression transmise au tablier.',
            },
          ],
          text:
            'Dans un pont suspendu ou haubané, chaque câble tire sur le tablier selon une ' +
            'direction oblique précise. Pour calculer si une poutre va résister, un ' +
            'ingénieur décompose la force exercée par le câble (un vecteur) selon deux ' +
            'directions utiles — horizontale et verticale, ou selon l\'axe de la poutre et ' +
            'perpendiculairement à lui — exactement la méthode de cette section. La ' +
            'composante verticale indique le poids réellement supporté, la composante ' +
            'horizontale la compression ou la traction exercée sur la structure. Se tromper ' +
            'dans cette décomposition peut littéralement faire s\'effondrer un ouvrage.',
          domaines: ['Ingénierie', 'Construction'],
        },
        {
          kind: 'entrainement',
          title: 'Décomposer un vecteur selon deux directions',
          generatorId: 'gen82',
          description: [
            'Écris un vecteur sous la forme u = a·v + b·w : sur une figure (réseau, parallélogramme, hexagone, quadrillage) ou en composantes, et décide si la décomposition est possible.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 82. Décomposer un vecteur selon deux directions »',
        },
      ],
    },

    {
      id: 'composantes',
      number: 8,
      title: 'Caractériser un vecteur dans un repère : les composantes',
      kicker: 'arrivée moins départ : deux nombres suffisent',
      titreCourt: 'Les composantes',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Dans un repère, deux nombres suffisent à décrire un vecteur : ses **composantes**, « arrivée moins départ » : $\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$.',
        'Deux vecteurs sont égaux exactement quand ils ont les mêmes composantes.',
      ],
      cartes: [
        { question: 'Comment calcule-t-on les composantes de $\\vec{AB}$ ?', reponse: 'Arrivée moins départ : $\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$.' },
        { question: 'A(2 ; −1) et B(5 ; 3) : composantes de $\\vec{AB}$ ?', reponse: '$\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$.' },
        { question: 'Que donne le calcul « départ moins arrivée » (A − B) ?', reponse: 'Les composantes de $\\vec{BA}$, le vecteur opposé.' },
      ],
      blocks: [
        { kind: 'video', title: 'Composantes, addition, multiplication par un réel, norme et distance', youtubeId: '7edwkWKGw0Y' },
        {
          kind: 'para',
          text:
            "Une fois un repère choisi, tu n'as plus besoin de dessiner un vecteur pour le " +
            'décrire. Deux nombres suffisent : ses **composantes**. Ils résument à eux seuls sa ' +
            'direction, son sens et sa longueur.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — composantes de AB',
          items: [
            'Pour $A(x_A ; y_A)$ et $B(x_B ; y_B)$ : $\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ ' +
              'y_B-y_A \\end{pmatrix}$. Deux vecteurs sont égaux exactement quand ils ont les ' +
              'mêmes composantes. Le vecteur nul a pour composantes $\\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix}$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'composantes de AB',
          formula: 'A(2 ; −1), B(5 ; 3).',
          steps: [{ tag: 'composantes', text: '$\\begin{pmatrix} 5-2 \\\\ 3-(-1) \\end{pmatrix}$' }],
          result: { tag: 'résultat', text: '$\\vec{AB}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$' },
        },
        {
          kind: 'atelier',
          tag: 'arrivee-moins-depart-widget',
          label: 'Manipule toi-même : arrivée moins départ',
          caption:
            'Déplace A et B sur le quadrillage : les composantes de AB se comptent en carreaux ' +
            '(horizontalement puis verticalement) et se calculent « arrivée moins départ » : abscisse de B ' +
            'moins abscisse de A, ordonnée de B moins ordonnée de A. Le bouton « Piège » calcule A − B : on obtient BA, le vecteur opposé. Déplace aussi P : ' +
            'le même vecteur, tracé ailleurs, garde les mêmes composantes.',
        },
        {
          kind: 'application',
          titre: 'Déplacer un personnage à l\'écran',
          illustrations: [
            {
              kind: 'vectorPlane',
              xMin: -0.5,
              xMax: 7,
              yMin: -0.5,
              yMax: 5,
              grid: true,
              vectors: [{ from: { x: 2, y: 1 }, to: { x: 5, y: 3 }, tone: 'good' }],
              points: [
                { x: 2, y: 1, label: 'P (image n)', tone: 'ink', labelPos: 'below' },
                { x: 5, y: 3, label: 'P\' (image n+1)', tone: 'good', labelPos: 'above' },
                { x: 3.5, y: 2.6, vectorLabel: [{ text: 'v(3 ; 2)', vector: true }], tone: 'good', node: false },
              ],
              caption:
                "À chaque image, le moteur du jeu calcule P' = P + v : le personnage en " +
                '(2 ; 1) avec une vitesse v(3 ; 2) se retrouve en (5 ; 3) à l\'image suivante — ' +
                'une simple addition de composantes, répétée 60 fois par seconde.',
            },
          ],
          text:
            'Dans un jeu vidéo en 2D, la position d\'un personnage à l\'écran est un point ' +
            '(x ; y), et sa vitesse de déplacement est un vecteur $(v_x ; v_y)$ — exactement ' +
            'les composantes que tu viens de voir. À chaque image affichée (souvent 60 fois ' +
            'par seconde), le moteur du jeu additionne simplement ce vecteur vitesse à la ' +
            'position actuelle pour calculer la nouvelle position. Changer de direction, ' +
            'c\'est changer les composantes du vecteur vitesse ; accélérer, c\'est ' +
            'l\'allonger sans changer sa direction. Toute la physique d\'un jeu — gravité, ' +
            'rebonds, collisions — se programme en manipulant des vecteurs de cette façon, ' +
            'composante par composante.',
          domaines: ['Informatique', 'Jeux vidéo'],
        },
      ],
    },

    {
      id: 'additionReperes',
      number: 9,
      title: 'Additionner deux vecteurs dans un repère',
      kicker: 'on additionne composante par composante',
      titreCourt: 'Additionner dans un repère',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Dans un repère, on additionne ou on soustrait **composante par composante** : $\\vec{u} + \\vec{v} = \\begin{pmatrix} x_u+x_v \\\\ y_u+y_v \\end{pmatrix}$.',
        'Un vecteur nommé et un vecteur point-à-point se combinent librement : calcule d\'abord leurs composantes.',
      ],
      cartes: [
        { question: 'Composantes de $\\vec{u} + \\vec{v}$ ?', reponse: '$\\begin{pmatrix} x_u+x_v \\\\ y_u+y_v \\end{pmatrix}$.' },
        { question: '$\\vec{u}\\begin{pmatrix} 2 \\\\ 3 \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$ : composantes de $\\vec{u} + \\vec{v}$ ?', reponse: '$\\begin{pmatrix} 1 \\\\ 7 \\end{pmatrix}$.' },
        { question: 'Composantes de $\\vec{u} - \\vec{v}$ ?', reponse: '$\\begin{pmatrix} x_u-x_v \\\\ y_u-y_v \\end{pmatrix}$.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "En repère, additionner deux vecteurs, c'est facile : additionne leurs composantes " +
            'une à une. Ça marche aussi entre un vecteur nommé et un vecteur point-à-point.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'En repère — $\\vec{u} + \\vec{v} = \\begin{pmatrix} x_u+x_v \\\\ y_u+y_v \\end{pmatrix}$.',
            'Soustraction — $\\vec{u} - \\vec{v} = \\begin{pmatrix} x_u-x_v \\\\ y_u-y_v \\end{pmatrix}$ : on soustrait composante par composante.',
            'Vecteurs mixtes — un vecteur nommé ($\\vec{u}$) et un vecteur point-à-point ' +
              '($\\vec{AB}$) se combinent librement. Calcule juste leurs composantes séparément d\'abord.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'somme de deux vecteurs',
          formula: '$\\vec{u} = \\begin{pmatrix} 2 \\\\ 3 \\end{pmatrix}$, $\\vec{v} = \\begin{pmatrix} -1 \\\\ 4 \\end{pmatrix}$.',
          steps: [{ tag: 'composante par composante', text: '$\\begin{pmatrix} 2+(-1) \\\\ 3+4 \\end{pmatrix}$' }],
          result: { tag: 'résultat', text: '$\\vec{u} + \\vec{v} = \\begin{pmatrix} 1 \\\\ 7 \\end{pmatrix}$' },
        },
      ],
    },

    {
      id: 'multiplicationReperes',
      number: 10,
      title: 'Multiplier un vecteur par un réel dans un repère',
      kicker: 'on multiplie chaque composante par k',
      titreCourt: 'Multiplier dans un repère',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Multiplier un vecteur par un réel k, c\'est multiplier **chacune** de ses composantes par k : $k \\cdot \\vec{u} = \\begin{pmatrix} k \\cdot x_u \\\\ k \\cdot y_u \\end{pmatrix}$.',
        'L\'opposé est le cas $k = -1$ : chaque composante change de signe.',
      ],
      cartes: [
        { question: 'Composantes de $k \\cdot \\vec{u}$ ?', reponse: '$\\begin{pmatrix} k \\cdot x_u \\\\ k \\cdot y_u \\end{pmatrix}$.' },
        { question: '$\\vec{u}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ : composantes de $-\\vec{u}$ ?', reponse: '$\\begin{pmatrix} -x \\\\ -y \\end{pmatrix}$.' },
        { question: 'Que vaut $3 \\cdot \\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix}$ ?', reponse: '$\\begin{pmatrix} 6 \\\\ -3 \\end{pmatrix}$.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            "Multiplier un vecteur par un réel en repère, c'est simple : multiplie chacune de " +
            'ses composantes par ce nombre. Ça marche aussi pour retrouver l\'opposé — c\'est ' +
            'juste le cas particulier k = −1.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Multiplication par un scalaire — $k \\cdot \\vec{u} = \\begin{pmatrix} k \\cdot x_u \\\\ k \\cdot y_u \\end{pmatrix}$.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — composantes opposées',
          items: [
            'Si $\\vec{u}$ a pour composantes $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$, alors ' +
              '$-\\vec{u}$ a pour composantes $\\begin{pmatrix} -x \\\\ -y \\end{pmatrix}$ : ' +
              '$-\\vec{u} = (-1) \\cdot \\vec{u}$. Chaque composante change juste de signe — rien ' +
              'd\'autre ne bouge.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'vecteur nommé + vecteur point-à-point',
          formula: '$\\vec{u} = \\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix}$, A(3 ; 5), B(6 ; 2). Calculer $3\\vec{u} - \\vec{AB}$.',
          steps: [
            { tag: 'composantes de AB', text: '$\\vec{AB} = \\begin{pmatrix} 6-3 \\\\ 2-5 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ -3 \\end{pmatrix}$' },
            { tag: '3u', text: '$3 \\cdot \\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix} = \\begin{pmatrix} 6 \\\\ -3 \\end{pmatrix}$' },
          ],
          result: { tag: 'résultat', text: '$3\\vec{u} - \\vec{AB} = \\begin{pmatrix} 6-3 \\\\ -3-(-3) \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 0 \\end{pmatrix}$' },
        },
        {
          kind: 'exemple',
          badge: 'décomposer un vecteur en repère',
          formula:
            'Décompose $\\vec{u}\\begin{pmatrix} 5 \\\\ 1 \\end{pmatrix}$ selon ' +
            '$\\vec{v}\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$ et $\\vec{w}\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$ ' +
            '(section 7, mais par le calcul).',
          steps: [
            { tag: 'chercher a et b', text: '$\\vec{u} = a\\vec{v} + b\\vec{w}$ donne $\\begin{pmatrix} 5 \\\\ 1 \\end{pmatrix} = \\begin{pmatrix} a + b \\\\ a - b \\end{pmatrix}$' },
            { tag: 'système', text: '$a + b = 5$ et $a - b = 1$ : en additionnant, $2a = 6$, donc $a = 3$, puis $b = 2$' },
          ],
          result: { tag: 'résultat', text: '$\\vec{u} = 3\\vec{v} + 2\\vec{w}$' },
        },
        {
          kind: 'entrainement',
          title: 'Composantes de combinaisons linéaires',
          generatorId: 'gen22',
          description: ['Réduis une expression vectorielle (vecteurs nommés et points en sens opposé) puis calcule ses composantes.'],
          chantier: '4e',
          whereLabel: '4e → « 22. Calcul de composantes de combinaisons linéaires »',
        },
      ],
    },

    {
      id: 'norme',
      number: 11,
      title: "Norme d'un vecteur et distance entre deux points",
      kicker: '‖u‖ = √(x² + y²) — Pythagore dans le repère',
      titreCourt: 'Norme et distance',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'La **norme** est la longueur d\'un vecteur : $\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}$ (Pythagore dans le repère). Elle est toujours positive ou nulle.',
        'La distance AB est la norme de $\\vec{AB}$. Après des déplacements successifs, on additionne les vecteurs puis on calcule la norme : jamais la somme des longueurs.',
      ],
      cartes: [
        { question: 'Norme de $\\vec{u}\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ ?', reponse: '$\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}$.' },
        { question: 'Norme de $\\vec{u}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ ?', reponse: '$\\sqrt{3^2 + 4^2} = 5$.' },
        { question: 'Que vaut $\\|k \\cdot \\vec{u}\\|$ ?', reponse: '$|k| \\cdot \\|\\vec{u}\\|$.' },
        { question: '3 km vers l\'est puis 4 km vers le nord : à quelle distance du départ, à vol d\'oiseau ?', reponse: '5 km (alors qu\'on a parcouru 7 km).' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'La **norme** d\'un vecteur, c\'est sa longueur. Elle est toujours positive ou ' +
            'nulle. La distance entre deux points, ce n\'est rien d\'autre que la norme du ' +
            'vecteur qui les relie.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 5,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 3, y: 4 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'faint', dashed: true },
              { from: { x: 3, y: 0 }, to: { x: 3, y: 4 }, tone: 'faint', dashed: true },
            ],
            points: [
              { x: 1.5, y: -0.3, label: '3', tone: 'ink', node: false },
              { x: 3.35, y: 2, label: '4', tone: 'ink', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 3, y: 0 }, arm1: { x: 0, y: 0 }, arm2: { x: 3, y: 4 } }],
            caption: '$\\vec{u} = (3 ; 4)$ : $\\|\\vec{u}\\| = \\sqrt{3^2+4^2} = \\sqrt{25} = 5$',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Norme — $\\|\\vec{u}\\| = \\sqrt{x_u^2 + y_u^2}$.',
            'Distance entre deux points — $AB = \\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}$.',
            'Classer un triangle — isocèle : au moins deux côtés ont la même longueur ; ' +
              'équilatéral : les trois ; rectangle : le carré du plus grand côté égale la somme ' +
              'des carrés des deux autres (réciproque de Pythagore) ; scalène : trois longueurs ' +
              'toutes différentes.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le théorème de Pythagore, encore lui',
          blocks: [
            {
              kind: 'para',
              text:
                'Prends $A(x_A ; y_A)$ et $B(x_B ; y_B)$. Le point C de coordonnées ' +
                '$(x_B ; y_A)$ forme avec A et B un triangle rectangle en C. Le côté [AC] est ' +
                'horizontal, de longueur $|x_B-x_A|$. Le côté [CB] est vertical, de longueur ' +
                '$|y_B-y_A|$. Le théorème de Pythagore donne alors : ' +
                '$\\|\\vec{AB}\\|^2 = AC^2 + CB^2 = (x_B-x_A)^2 + (y_B-y_A)^2$',
            },
            {
              kind: 'para',
              text:
                'D\'où $\\|\\vec{AB}\\| = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}$. C\'est exactement ' +
                'la formule de la norme ! Puisque $\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$ ' +
                'sont bien les composantes $\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ de $\\vec{AB}$.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la norme de k·u',
          blocks: [
            {
              kind: 'para',
              text:
                'Prends $\\vec{u}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ et un réel k. Le vecteur ' +
                '$k \\cdot \\vec{u}$ a pour composantes $\\begin{pmatrix} kx \\\\ ky \\end{pmatrix}$ (section 10). ' +
                'Sa norme vaut donc $\\sqrt{(kx)^2 + (ky)^2} = \\sqrt{k^2x^2 + k^2y^2} = \\sqrt{k^2(x^2 + y^2)}$.',
            },
            {
              kind: 'para',
              text:
                'La racine d\'un produit de nombres positifs est le produit des racines : ' +
                '$\\sqrt{k^2(x^2 + y^2)} = \\sqrt{k^2} \\cdot \\sqrt{x^2 + y^2}$. Or $\\sqrt{k^2} = |k|$, et non k : ' +
                'si k = −3, $\\sqrt{(-3)^2} = \\sqrt{9} = 3$. D\'où $\\|k \\cdot \\vec{u}\\| = |k| \\cdot \\|\\vec{u}\\|$ : ' +
                'multiplier par −3 ou par 3 donne la même longueur, seul le sens change.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'distance entre deux points',
          formula: 'A(1 ; 1), B(4 ; 5).',
          steps: [{ tag: 'composantes de AB', text: '$\\begin{pmatrix} 4-1 \\\\ 5-1 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$' }],
          result: { tag: 'distance AB', text: '$\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$' },
        },
        {
          kind: 'exemple',
          badge: 'distance avec un paramètre',
          formula: 'A(1 ; 2) et B(x ; 6). Pour quelles valeurs de x a-t-on AB = 5 ?',
          steps: [
            { tag: 'élever au carré', text: '$AB^2 = (x-1)^2 + (6-2)^2 = 25$' },
            { tag: 'isoler le carré', text: '$(x-1)^2 = 25 - 16 = 9$' },
            { tag: 'deux racines', text: '$x - 1 = 3$ ou $x - 1 = -3$' },
          ],
          result: { tag: 'résultat', text: '$x = 4$ ou $x = -2$ : deux points B conviennent' },
        },
        {
          kind: 'exemple',
          badge: 'nature d\'un triangle',
          formula: 'A(1 ; 1), B(4 ; 2), C(0 ; 4). Quelle est la nature du triangle ABC ?',
          steps: [
            { tag: 'carrés des côtés', text: '$AB^2 = 3^2 + 1^2 = 10$, $AC^2 = (-1)^2 + 3^2 = 10$, $BC^2 = (-4)^2 + 2^2 = 20$' },
            { tag: 'deux côtés égaux', text: '$AB = AC = \\sqrt{10}$ : isocèle en A' },
            { tag: 'réciproque de Pythagore', text: '$AB^2 + AC^2 = 10 + 10 = 20 = BC^2$ : rectangle en A' },
          ],
          result: { tag: 'résultat', text: 'ABC est rectangle isocèle en A ($BC = \\sqrt{20} = 2\\sqrt{5}$)' },
        },
        {
          kind: 'atelier',
          tag: 'distance-triangle-widget',
          label: 'Manipule toi-même : distances et nature d\'un triangle',
          caption:
            'Déplace les sommets du triangle sur le quadrillage. Pour le côté choisi, le ' +
            'triangle rectangle de Pythagore donne la distance exacte, simplifiée si ' +
            'possible (√20 = 2√5). Compare les trois longueurs : le triangle est-il ' +
            'isocèle, rectangle (réciproque de Pythagore), rectangle isocèle ou scalène ? ' +
            'Le réglage de départ est le triangle de l\'exemple, rectangle isocèle en A.',
        },
        {
          kind: 'entrainement',
          title: 'Norme d\'un vecteur et distance entre 2 points',
          generatorId: 'gen26',
          description: ['Calcule une norme ou une distance sous 5 variantes (vecteur donné, distance entre points, triangle isocèle/scalène, paramètre x, Pythagore en méthode alternative).'],
          chantier: '4e',
          whereLabel: '4e → « 26. Norme d\'un vecteur et distance entre 2 points »',
        },
        { kind: 'subheading', text: 'Des déplacements successifs à la distance à vol d\'oiseau' },
        {
          kind: 'para',
          text:
            'Sur une carte, place l\'origine au point de départ, l\'axe x vers l\'est et l\'axe y ' +
            'vers le nord. Chaque instruction de déplacement devient alors un vecteur, et le ' +
            'déplacement total est leur somme (relation de Chasles) : ' +
            '$\\vec{DA} = \\vec{u}_1 + \\vec{u}_2 + \\vec{u}_3$. La distance à vol d\'oiseau ' +
            'entre le départ et l\'arrivée est la norme $\\|\\vec{DA}\\|$, et le chemin du retour ' +
            'est le vecteur opposé $\\vec{AD} = -\\vec{DA}$.',
        },
        {
          kind: 'featureTable',
          headers: ['Instruction (a > 0)', 'Vecteur'],
          rows: [
            ['a vers l\'est', '$\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$'],
            ['a vers l\'ouest', '$\\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}$'],
            ['a vers le nord', '$\\begin{pmatrix} 0 \\\\ a \\end{pmatrix}$'],
            ['a vers le sud', '$\\begin{pmatrix} 0 \\\\ -a \\end{pmatrix}$'],
            ['a pas en diagonale vers le nord-ouest', '$\\begin{pmatrix} -a \\\\ a \\end{pmatrix}$'],
          ],
        },
        {
          kind: 'para',
          text:
            'Sur un quadrillage, un **pas en diagonale** va de case en case : une case vers ' +
            'l\'ouest **et** une case vers le nord pour le nord-ouest. Ses deux composantes ' +
            'changent donc de 1 à chaque pas : a pas vers le nord-est donnent ' +
            '$\\begin{pmatrix} a \\\\ a \\end{pmatrix}$, vers le sud-est ' +
            '$\\begin{pmatrix} a \\\\ -a \\end{pmatrix}$, vers le sud-ouest ' +
            '$\\begin{pmatrix} -a \\\\ -a \\end{pmatrix}$. Attention : un tel pas mesure ' +
            '$\\sqrt{1^2 + 1^2} = \\sqrt{2}$ cases, et non 1.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            // domaine 6 × 5,625 : rapport 320/300, cases carrées (un pas en diagonale à 45°)
            xMin: -4.5,
            xMax: 1.5,
            yMin: -1,
            yMax: 4.625,
            showAxes: false,
            grid: true,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: -1, y: 0 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: -1, y: 0 }, to: { x: -1, y: 1 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: -1, y: 1 }, tone: 'accent' },
              { from: { x: -1, y: 1 }, to: { x: -2, y: 2 }, tone: 'accent' },
              { from: { x: -2, y: 2 }, to: { x: -3, y: 3 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'D', tone: 'ink', labelPos: 'right' },
              { x: -3, y: 3, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: -0.5, y: -0.35, label: '−1', tone: 'ink', node: false },
              { x: -1.35, y: 0.5, label: '+1', tone: 'ink', node: false },
            ],
            caption:
              '3 pas en diagonale vers le nord-ouest : chaque pas change x de −1 et y de +1, donc ' +
              '$\\vec{DA}\\begin{pmatrix} -3 \\\\ 3 \\end{pmatrix}$. Un pas mesure $\\sqrt{2}$ cases.',
          },
        },
        {
          kind: 'attention',
          label: 'Distance parcourue ou distance à vol d\'oiseau ?',
          text:
            'Après 3 km vers l\'est puis 4 km vers le nord, on a **parcouru** 3 + 4 = 7 km, ' +
            'mais on ne se trouve qu\'à $\\sqrt{3^2 + 4^2} = 5$ km du départ **à vol d\'oiseau**. ' +
            'Additionner les longueurs des étapes ne donne jamais la distance en ligne droite : ' +
            'on additionne les vecteurs, puis on calcule la norme du résultat.',
        },
        {
          kind: 'atelier',
          tag: 'carte-tresor-widget',
          label: 'Manipule toi-même : la carte au trésor',
          caption:
            'Empile des pas avec la rose des vents (N, S, E, O et les diagonales). Le déplacement total ' +
            'DA est la somme des pas ; compare la distance parcourue (somme des longueurs, √2 par pas en ' +
            'diagonale) et la distance à vol d\'oiseau, la norme de DA. Le chemin du retour, en pointillés, ' +
            'est AD = −DA. Le réglage de départ reprend l\'encadré : 7 km parcourus, 5 km à vol d\'oiseau.',
        },
        {
          kind: 'entrainement',
          title: 'Carte au trésor et randonnée : déplacements successifs',
          generatorId: 'gen86',
          description: ['Traduis des instructions (est, nord, ouest, sud, diagonale) en vecteurs, additionne-les, calcule une distance à vol d\'oiseau, puis trouve le chemin du retour, le dernier déplacement vers une cible ou le nombre de pas à répéter.'],
          chantier: '4e',
          whereLabel: '4e → « 86. Carte au trésor et randonnée : déplacements successifs »',
        },
      ],
    },

    {
      id: 'relation',
      number: 12,
      title: 'Vecteurs, translation et milieu',
      kicker: 'B = A + u — le milieu est la moyenne des coordonnées',
      titreCourt: 'Translation et milieu',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Translation : B = A + $\\vec{u}$, donc $x_B = x_A + x_u$ et $y_B = y_A + y_u$.',
        'Le milieu de [AB] a pour coordonnées la **moyenne** des coordonnées de A et de B, jamais leur différence. $\\vec{AM} = k \\cdot \\vec{AB}$ place M sur la droite (AB) ; $k = \\frac{1}{2}$ donne le milieu.',
      ],
      cartes: [
        { question: 'Coordonnées du milieu M de [AB] ?', reponse: '$x_M = \\dfrac{x_A+x_B}{2}$ et $y_M = \\dfrac{y_A+y_B}{2}$.' },
        { question: 'B est le translaté de A(1 ; 1) par $\\vec{u}\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ : coordonnées de B ?', reponse: 'B(5 ; 3).' },
        { question: 'Que donne la différence des coordonnées de A et de B ?', reponse: 'Les composantes de $\\vec{AB}$, pas le milieu.' },
        { question: 'ABCD est un parallélogramme : que dire de ses diagonales [AC] et [BD] ?', reponse: 'Elles ont le même milieu.' },
      ],
      blocks: [
        { kind: 'video', title: 'Translation, milieu, colinéarité et alignement par le calcul', youtubeId: '8N9j50tNawQ' },
        {
          kind: 'para',
          text:
            'Deux relations reviennent tout le temps entre un vecteur et des points. La ' +
            '**translation** : retrouver un point à partir d\'un autre et d\'un vecteur. Le ' +
            '**milieu** d\'un segment. Il existe une troisième relation, plus générale, qui ' +
            'contient le milieu comme cas particulier.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 4,
            vectors: [{ from: { x: 1, y: 1 }, to: { x: 5, y: 3 }, tone: 'accent', tick: true }],
            points: [
              { x: 1, y: 1, label: 'A(1 ; 1)', tone: 'ink', labelPos: 'left' },
              { x: 5, y: 3, label: 'B(5 ; 3)', tone: 'ink', labelPos: 'right' },
              { x: 3, y: 2, label: 'M(3 ; 2)', tone: 'good', labelPos: 'above' },
            ],
            caption: 'la marque sur $\\vec{AB}$ signale que M en est le milieu',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Composantes et points — « arrivée moins départ » : $\\vec{AB} = B - A$, composante par ' +
              'composante, soit $\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$. C\'est la même ' +
              'relation, lue dans l\'autre sens, que la translation $B = A + \\vec{AB}$.',
            'Translation — B est le translaté de A par $\\vec{u}$ : B = A + $\\vec{u}$. Donc ' +
              '$x_B=x_A+x_u$ et $y_B=y_A+y_u$.',
            'Milieu — M milieu de [AB] : $x_M=\\dfrac{x_A+x_B}{2}$ et $y_M=\\dfrac{y_A+y_B}{2}$. De façon ' +
              'équivalente : $\\vec{AM} = \\vec{MB} = \\frac{1}{2}\\vec{AB}$.',
            'Relation générale — $\\vec{AM} = k \\cdot \\vec{AB}$ place toujours M sur la droite ' +
              '(AB). $k = \\frac{1}{2}$ redonne le milieu, $k = 1$ redonne B, $k = 0$ redonne A.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'translation puis milieu',
          formula: 'A(1 ; 1), $\\vec{u} = \\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$.',
          steps: [
            { tag: 'translaté B de A par u', text: '$x_B=1+4=5$, $y_B=1+2=3$ → B(5 ; 3)' },
            { tag: 'milieu M de [AB]', text: '$x_M=\\dfrac{1+5}{2}=3$, $y_M=\\dfrac{1+3}{2}=2$ → M(3 ; 2)' },
          ],
          result: { tag: 'résultat', text: 'B(5 ; 3), M(3 ; 2)' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les coordonnées du milieu',
          blocks: [
            {
              kind: 'para',
              text:
                'M est le milieu de [AB] exactement quand $\\vec{AM} = \\dfrac{1}{2}\\vec{AB}$. Écris cette égalité ' +
                'composante par composante, avec « arrivée moins départ » : ' +
                '$x_M - x_A = \\dfrac{1}{2}(x_B - x_A)$.',
            },
            {
              kind: 'para',
              text:
                'Isole $x_M$ : $x_M = x_A + \\dfrac{1}{2}x_B - \\dfrac{1}{2}x_A = \\dfrac{1}{2}x_A + \\dfrac{1}{2}x_B = ' +
                '\\dfrac{x_A + x_B}{2}$. Le même calcul sur la seconde composante donne ' +
                '$y_M = \\dfrac{y_A + y_B}{2}$ : les coordonnées du milieu sont bien les moyennes des coordonnées de A et de B.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Milieu ≠ différence de coordonnées',
          text:
            'Les coordonnées du milieu, c\'est la **moyenne** des coordonnées de A et B. ' +
            'Jamais leur différence ! La différence $\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$ ' +
            'donne les composantes de $\\vec{AB}$ — un objet complètement différent du milieu.',
        },
        {
          kind: 'atelier',
          tag: 'milieu-piege-widget',
          label: 'Manipule toi-même : placer un point grâce à un vecteur',
          caption:
            'Trois façons de placer un point grâce à un vecteur. En mode Milieu, compare le ' +
            'vrai milieu (la moyenne des coordonnées) au piège de la différence. En mode AM ' +
            '= k·AB, fais varier k : M glisse sur la droite (AB) — en A pour k = 0, au ' +
            'milieu pour k = ½, en B pour k = 1, au-delà pour k > 1. En mode Symétrique, ' +
            'B devient le milieu de [AA′]. Le réglage de départ reproduit l\'exemple ' +
            'ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'quatrième sommet d\'un parallélogramme',
          formula: 'A(1 ; 1), B(5 ; 2), C(6 ; 5). Trouve D pour que ABCD soit un parallélogramme.',
          steps: [
            { tag: 'traduire', text: 'ABCD parallélogramme ⟺ $\\vec{AB} = \\vec{DC}$ (section 1)' },
            { tag: 'composantes', text: '$\\vec{AB}\\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix}$ et $\\vec{DC}\\begin{pmatrix} 6-x_D \\\\ 5-y_D \\end{pmatrix}$' },
            { tag: 'égaler', text: '$6 - x_D = 4$ et $5 - y_D = 1$, donc $x_D = 2$ et $y_D = 4$' },
          ],
          result: { tag: 'résultat', text: 'D(2 ; 4). En général, $x_D = x_A + x_C - x_B$ et $y_D = y_A + y_C - y_B$. Contrôle : $\\vec{AD}$ et $\\vec{BC}$ valent tous deux $\\begin{pmatrix} 1 \\\\ 3 \\end{pmatrix}$' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — parallélogramme et diagonales de même milieu',
          blocks: [
            {
              kind: 'para',
              text:
                'ABCD est un parallélogramme ⟺ $\\vec{AB} = \\vec{DC}$ (section 1). En composantes : ' +
                '$x_B - x_A = x_C - x_D$ et $y_B - y_A = y_C - y_D$.',
            },
            {
              kind: 'para',
              text:
                'Fais passer $x_A$ et $x_D$ de l\'autre côté : $x_B + x_D = x_A + x_C$. Divise par 2 : ' +
                '$\\dfrac{x_A + x_C}{2} = \\dfrac{x_B + x_D}{2}$. De même, $\\dfrac{y_A + y_C}{2} = \\dfrac{y_B + y_D}{2}$. ' +
                'Chaque étape se lit dans les deux sens (on ajoute, on retranche, on multiplie ou on divise par 2).',
            },
            {
              kind: 'para',
              text:
                'Ces deux égalités disent exactement que le milieu de [AC] et le milieu de [BD] ont les mêmes ' +
                'coordonnées. Donc ABCD est un parallélogramme ⟺ ses diagonales [AC] et [BD] ont le même milieu.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'egalite-parallelogramme-widget',
          label: 'Manipule toi-même : le quatrième sommet',
          caption:
            'Passe en mode « quatrième sommet » et déplace A, B et C : D = C − AB se ' +
            'recalcule composante par composante, et les diagonales de ABCD gardent ' +
            'toujours le même milieu. Place A(1 ; 1), B(5 ; 2) et C(6 ; 5) pour retrouver ' +
            'l\'exemple ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'symétrique d\'un point',
          formula: 'A(1 ; 2), B(4 ; 3). Trouve A′, le symétrique de A par rapport à B.',
          steps: [
            { tag: 'traduire', text: 'B est le milieu de [AA′] : $x_B = \\dfrac{x_A + x_{A\'}}{2}$, donc $x_{A\'} = 2x_B - x_A$ (de même pour y)' },
            { tag: 'calculer', text: '$x_{A\'} = 2 \\times 4 - 1 = 7$ et $y_{A\'} = 2 \\times 3 - 2 = 4$' },
          ],
          result: { tag: 'résultat', text: 'A′(7 ; 4)' },
        },
        {
          kind: 'exemple',
          badge: 'relation générale AM = ⅔·AB',
          formula: 'A(1 ; 1), B(7 ; 4). Place le point M tel que $\\vec{AM} = \\dfrac{2}{3}\\vec{AB}$.',
          steps: [
            { tag: 'composantes de AB', text: '$\\vec{AB}\\begin{pmatrix} 6 \\\\ 3 \\end{pmatrix}$, donc $\\vec{AM} = \\dfrac{2}{3}\\vec{AB}$ a pour composantes $\\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$' },
            { tag: 'translater A', text: '$x_M = 1 + 4 = 5$ et $y_M = 1 + 2 = 3$' },
          ],
          result: { tag: 'résultat', text: 'M(5 ; 3), sur le segment [AB], aux deux tiers à partir de A' },
        },
        {
          kind: 'entrainement',
          title: 'Relation vectorielle (guidée)',
          generatorId: 'gen21',
          description: ["Traduis d'abord la relation en symboles, avant de calculer les coordonnées du point cherché."],
          chantier: '4e',
          whereLabel: "4e → « 21. Point à partir d'une relation vectorielle »",
        },
        {
          kind: 'entrainement',
          title: 'Relation vectorielle',
          generatorId: 'gen20',
          description: ['Même famille de relations (translation, milieu, relation générale), directement sur un seul écran.'],
          chantier: '4e',
          whereLabel: "4e → « 20. Point à partir d'une relation vectorielle (libre) »",
        },
      ],
    },

    {
      id: 'colinearite',
      number: 13,
      title: 'Colinéarité de vecteurs et alignement de points',
      kicker: 'colinéaires ⟺ produits en croix égaux',
      titreCourt: 'Colinéarité et alignement',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Critère de colinéarité : $\\vec{u}$ et $\\vec{v}$ sont colinéaires ⟺ $x_u \\cdot y_v - y_u \\cdot x_v = 0$ : les produits en croix sont égaux.',
        'A, B et C sont alignés ⟺ $\\vec{AB}$ et $\\vec{AC}$ sont colinéaires. Colinéaires **sans point commun** : droites parallèles, pas d\'alignement.',
      ],
      cartes: [
        { question: 'Énonce le critère de colinéarité de $\\vec{u}$ et $\\vec{v}$.', reponse: '$x_u \\cdot y_v - y_u \\cdot x_v = 0$ (produits en croix égaux).' },
        { question: 'A(0 ; 0), B(2 ; 1) et C(6 ; 3) sont-ils alignés ?', reponse: 'Oui : $2 \\times 3 - 1 \\times 6 = 0$, et $\\vec{AC} = 3\\vec{AB}$.' },
        { question: 'Le critère de colinéarité vaut 1 : les vecteurs sont-ils colinéaires ?', reponse: 'Non : le critère doit être exactement nul.' },
        { question: 'Deux vecteurs colinéaires n\'ont aucun point commun : que peut-on conclure ?', reponse: 'Leurs droites sont parallèles ; on ne peut pas conclure à un alignement.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Une fois les vecteurs décrits par leurs composantes, tu peux tester la ' +
            'colinéarité définie plus haut (section 3) par un simple calcul. Pas besoin de dessin !',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Colinéarité de deux vecteurs — $\\vec{u}\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ ' +
              'et $\\vec{v}\\begin{pmatrix} x_v \\\\ y_v \\end{pmatrix}$ sont colinéaires ⟺ ' +
              '$x_u \\cdot y_v - y_u \\cdot x_v = 0$. Autrement dit, les produits en croix sont égaux : $x_u \\cdot y_v = y_u \\cdot x_v$.',
            'Alignement de 3 points — A, B, C alignés ⟺ $\\vec{AB}$ et $\\vec{AC}$ colinéaires.',
          ],
        },
        {
          kind: 'exemple',
          badge: "tester l'alignement",
          formula: 'A(0 ; 0), B(2 ; 1), C(6 ; 3) — alignés ?',
          steps: [
            { tag: 'AB', text: '$\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$' },
            { tag: 'AC', text: '$\\begin{pmatrix} 6 \\\\ 3 \\end{pmatrix}$' },
            { tag: 'critère de colinéarité', text: '$2 \\times 3 - 1 \\times 6 = 6 - 6 = 0$' },
          ],
          result: { tag: 'résultat', text: 'critère de colinéarité nul → A, B, C sont alignés ($\\vec{AC} = 3\\vec{AB}$)' },
        },
        {
          kind: 'exemple',
          badge: 'trois points non alignés',
          formula: 'A(1 ; 2), B(3 ; 3), C(6 ; 5) — alignés ?',
          steps: [
            { tag: 'AB et AC', text: '$\\vec{AB}\\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$ et $\\vec{AC}\\begin{pmatrix} 5 \\\\ 3 \\end{pmatrix}$' },
            { tag: 'test', text: '$2 \\times 3 - 1 \\times 5 = 6 - 5 = 1 \\neq 0$' },
          ],
          result: { tag: 'résultat', text: 'non nul → A, B, C ne sont pas alignés (même s\'ils en ont l\'air sur un dessin approximatif)' },
        },
        {
          kind: 'exemple',
          badge: 'colinéarité avec un paramètre',
          formula: 'Pour quelles valeurs de x les vecteurs $\\vec{u}\\begin{pmatrix} 2 \\\\ x \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix} x \\\\ 8 \\end{pmatrix}$ sont-ils colinéaires ?',
          steps: [
            { tag: 'écrire la condition', text: '$2 \\times 8 - x \\times x = 0$, soit $x^2 = 16$' },
            { tag: 'résoudre', text: '$x = 4$ ou $x = -4$' },
          ],
          result: { tag: 'résultat', text: '$x = 4$ ($\\vec{v} = 2\\vec{u}$) ou $x = -4$ ($\\vec{v} = -2\\vec{u}$)' },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient ce critère de colinéarité ?",
          blocks: [
            {
              kind: 'para',
              text:
                'Par définition, $\\vec{u}\\begin{pmatrix} x_u \\\\ y_u \\end{pmatrix}$ et ' +
                '$\\vec{v}\\begin{pmatrix} x_v \\\\ y_v \\end{pmatrix}$ sont colinéaires s\'il ' +
                'existe un nombre k tel que $\\vec{v} = k \\cdot \\vec{u}$. Composante par ' +
                'composante, ça donne $x_v = k \\cdot x_u$ et $y_v = k \\cdot y_u$. Donc, tant ' +
                'que $x_u$ et $y_u$ ne sont pas nuls : $k = x_v/x_u$ et $k = y_v/y_u$.',
            },
            {
              kind: 'para',
              text:
                'Ces deux expressions de k sont égales : $x_v/x_u = y_v/y_u$. Multiplie les ' +
                'deux membres par $x_u \\cdot y_u$ : $x_u \\cdot y_v = y_u \\cdot x_v$. ' +
                'Autrement dit, $x_u \\cdot y_v - y_u \\cdot x_v = 0$.',
            },
            {
              kind: 'para',
              text:
                'Cette forme reste valable même quand $x_u$ ou $y_u$ vaut 0. C\'est elle ' +
                'qu\'on utilise en pratique — jamais l\'égalité de deux quotients ! Il faudrait ' +
                'sinon vérifier d\'abord qu\'aucun dénominateur n\'est nul.',
            },
          ],
        },
        {
          kind: 'piege',
          label: "Ne pas confondre avec l'orthogonalité",
          text:
            '$x_u \\cdot y_v - y_u \\cdot x_v = 0$ teste la **colinéarité**. ' +
            '$x_u x_v + y_u y_v = 0$ teste l\'**orthogonalité** (section 14). ' +
            'Ces deux formules se ressemblent, mais attention : elles testent deux relations très différentes !',
        },
        {
          kind: 'atelier',
          tag: 'test-colinearite-widget',
          label: 'Manipule toi-même : colinéarité ou orthogonalité ?',
          caption:
            'A(0 ; 0) et B(2 ; 1) sont fixes : fais glisser C et bascule entre les deux ' +
            'tests. Quand le critère de colinéarité est nul, l\'atelier donne k tel que AC = k·AB ; ' +
            'quand le produit scalaire est nul, l\'angle droit apparaît en A et Pythagore se ' +
            'vérifie. Le réglage de départ (C(6 ; 3)) reproduit le premier exemple de la ' +
            'section.',
        },
        {
          kind: 'entrainement',
          title: 'Colinéarité et alignement de points',
          generatorId: 'gen24',
          description: ['Teste la colinéarité de 2 vecteurs ou l\'alignement de 3 points, y compris avec des composantes dépendant d\'un paramètre x.'],
          chantier: '4e',
          whereLabel: '4e → « 24. Colinéarité et alignement de points »',
        },
        {
          kind: 'attention',
          text:
            'Viser une cible — un objet part de A en ligne droite, dans la direction **et le sens** ' +
            'de $\\vec{u}$. Il atteint le point C si, et seulement si, $\\vec{AC} = k \\cdot \\vec{u}$ ' +
            'avec $k > 0$. Le critère de colinéarité nul dit seulement que C est sur la **droite** ' +
            'du lancer : si $k < 0$, C est derrière A et l\'objet part dans le mauvais sens. Et un ' +
            'critère non nul, même tout petit, signifie que la trajectoire passe à côté de C.',
        },
        {
          kind: 'entrainement',
          title: 'Viser une cible : trajectoires rectilignes',
          generatorId: 'gen89',
          description: [
            'Billard, laser, passe, curling : la trajectoire rectiligne touche-t-elle la cible, la frôle-t-elle, ou part-elle dans le mauvais sens ? Et quelle direction choisir pour viser juste ?',
          ],
          chantier: '4e',
          whereLabel: '4e → « 89. Viser une cible : trajectoires rectilignes »',
        },
        { kind: 'subheading', text: 'Démontrer sans repère, avec des vecteurs' },
        {
          kind: 'para',
          text:
            'La colinéarité sert aussi à **démontrer** une propriété sur une figure sans aucun ' +
            'repère : il suffit de tout exprimer dans une base formée de deux vecteurs non ' +
            'colinéaires de la figure (section 7), puis de comparer les coefficients.',
        },
        {
          kind: 'methode',
          label: 'Démontrer avec des vecteurs',
          items: [
            'Choisir une base adaptée : deux vecteurs non colinéaires de même origine, portés par des côtés de la figure — par exemple $(\\vec{AB}\\,;\\,\\vec{AD})$ dans un parallélogramme ABCD.',
            'Exprimer chaque vecteur utile dans cette base, grâce à la relation de Chasles et aux relations de l\'énoncé.',
            'Comparer les coefficients : s\'ils sont proportionnels, $\\vec{v} = k\\,\\vec{w}$ et les vecteurs sont colinéaires.',
            'Conclure en citant la propriété : colinéaires avec un point commun → points alignés ; colinéaires sans point commun → droites parallèles ; $\\vec{UM} = \\vec{MV}$ → M milieu de [UV] ; $\\vec{PQ} = \\vec{SR}$ → PQRS parallélogramme.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'démontrer sans repère : trois points alignés',
          formula:
            'ABCD est un parallélogramme, I est le milieu de [DC] et E est le point tel que ' +
            '$\\vec{DE} = \\dfrac{1}{3}\\vec{DB}$. Démontrer que A, E et I sont alignés.',
          steps: [
            { tag: 'base', text: '$(\\vec{AB}\\,;\\,\\vec{AD})$ : deux vecteurs non colinéaires de même origine A' },
            {
              tag: 'exprimer AE (Chasles)',
              text: '$\\vec{AE} = \\vec{AD} + \\dfrac{1}{3}\\vec{DB} = \\vec{AD} + \\dfrac{1}{3}(\\vec{AB} - \\vec{AD}) = \\dfrac{1}{3}\\vec{AB} + \\dfrac{2}{3}\\vec{AD}$',
            },
            { tag: 'exprimer AI (Chasles)', text: '$\\vec{AI} = \\vec{AD} + \\dfrac{1}{2}\\vec{DC} = \\dfrac{1}{2}\\vec{AB} + \\vec{AD}$, car $\\vec{DC} = \\vec{AB}$' },
            {
              tag: 'comparer les coefficients',
              text: '$\\dfrac{1}{3} = \\dfrac{2}{3} \\times \\dfrac{1}{2}$ et $\\dfrac{2}{3} = \\dfrac{2}{3} \\times 1$, donc $\\vec{AE} = \\dfrac{2}{3}\\vec{AI}$',
            },
          ],
          result: { tag: 'conclusion', text: 'vecteurs colinéaires avec le point A en commun → A, E et I sont alignés' },
        },
        {
          kind: 'piege',
          label: 'Parallèles ou alignés ?',
          text:
            'Deux vecteurs colinéaires **sans point commun** sont portés par deux droites ' +
            'parallèles : on ne peut pas conclure à un alignement. C\'est le point commun (ici ' +
            'l\'origine A des deux vecteurs) qui donne l\'alignement.',
        },
        {
          kind: 'entrainement',
          title: 'Démontrer avec des vecteurs',
          generatorId: 'gen85',
          description: ['Démontre un alignement, un parallélisme, un milieu ou un parallélogramme sans repère : base adaptée, relation de Chasles, coefficients proportionnels.'],
          chantier: '4e',
          whereLabel: '4e → « 85. Démontrer avec des vecteurs »',
        },
      ],
    },

    {
      id: 'orthogonalite',
      number: 14,
      title: 'Orthogonalité et Pythagore généralisé',
      kicker: 'orthogonaux ⟺ produit scalaire nul',
      titreCourt: 'Orthogonalité',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        '$\\vec{u}$ et $\\vec{v}$ sont **orthogonaux** ⟺ $x_u \\cdot x_v + y_u \\cdot y_v = 0$ : le produit scalaire est nul. ABC est rectangle en A ⟺ $\\vec{AB} \\cdot \\vec{AC} = 0$.',
        'Nature d\'un quadrilatère : le parallélogramme d\'abord ($\\vec{AB} = \\vec{DC}$), puis deux côtés consécutifs égaux (losange) ou un angle droit (rectangle).',
      ],
      cartes: [
        { question: 'Énonce le critère d\'orthogonalité de $\\vec{u}$ et $\\vec{v}$.', reponse: '$x_u \\cdot x_v + y_u \\cdot y_v = 0$ (produit scalaire nul).' },
        { question: '$\\vec{AB}\\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$ et $\\vec{AC}\\begin{pmatrix} -4 \\\\ 3 \\end{pmatrix}$ : le triangle ABC est-il rectangle en A ?', reponse: 'Oui : $3 \\times (-4) + 4 \\times 3 = 0$.' },
        { question: 'Un parallélogramme qui a un angle droit est un…', reponse: 'rectangle.' },
        { question: 'Deux vecteurs non nuls colinéaires peuvent-ils être orthogonaux ?', reponse: 'Non, jamais.' },
      ],
      blocks: [
        { kind: 'video', title: 'Orthogonalité, Pythagore généralisé et vecteur directeur d\'une droite', youtubeId: 'ihkFhTzx3zI' },
        {
          kind: 'para',
          text:
            'Deux vecteurs sont **orthogonaux** quand ils forment un angle droit. Ce test a ' +
            'deux usages : comparer deux vecteurs directement, ou prouver qu\'un triangle est ' +
            'rectangle en l\'un de ses sommets.',
        },
        {
          kind: 'intuition',
          label: 'Tu connais déjà cette idée',
          text:
            'Tu connais déjà Pythagore : dans un triangle rectangle, $BC^2 = AB^2 + AC^2$. Le ' +
            'produit scalaire $\\vec{AB} \\cdot \\vec{AC} = 0$ est juste une autre façon ' +
            "d'écrire exactement la même idée — sous une forme qui se calcule directement à " +
            'partir des composantes, sans même connaître les trois longueurs à l\'avance.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 6,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 4 }, tone: 'good' },
            ],
            points: [
              { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
              { x: 4, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
              { x: 0, y: 4, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 2, y: 0.15, vectorLabel: [{ text: 'AB', vector: true }], tone: 'accent', node: false },
              { x: 0.35, y: 2, vectorLabel: [{ text: 'AC', vector: true }], tone: 'good', node: false, labelPos: 'right' },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 4, y: 0 }, arm2: { x: 0, y: 4 } }],
            caption: '$\\vec{AB} \\cdot \\vec{AC} = 0$ ⟺ le triangle ABC est rectangle en A',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Orthogonalité de deux vecteurs — $\\vec{u} \\perp \\vec{v}$ ⟺ ' +
              '$x_u \\cdot x_v + y_u \\cdot y_v = 0$. On dit que le produit scalaire est nul.',
            'Triangle rectangle en A — ⟺ $\\vec{AB} \\cdot \\vec{AC} = 0$. Autre méthode ' +
              'possible, tout aussi valable : $BC^2 = AB^2 + AC^2$ (Pythagore).',
          ],
        },
        {
          kind: 'historique',
          titre: 'Simplifier une notation trop compliquée',
          text:
            'Après l\'invention des quaternions par Hamilton, les scientifiques héritent ' +
            'd\'un outil puissant mais lourd à manier pour calculer en trois dimensions. ' +
            'Dans les années 1880, l\'Américain **Josiah Willard Gibbs** et le Britannique ' +
            '**Oliver Heaviside**, travaillant indépendamment, débarrassent les quaternions ' +
            'de tout ce qui ne sert pas à la physique et à l\'ingénierie : il ne reste que le ' +
            'vecteur tel que tu le connais, avec sa notation $\\vec{u}\\cdot\\vec{v}$ pour le ' +
            'produit scalaire — exactement le symbole que tu utilises dans cette section. ' +
            'Beaucoup de mathématiciens de l\'époque, fidèles aux quaternions, critiquent ' +
            'cette simplification comme une trahison — mais c\'est cette version allégée qui ' +
            's\'impose définitivement dans les sciences et l\'ingénierie.',
        },
        {
          kind: 'exemple',
          badge: 'tester un angle droit',
          formula:
            'A(0 ; 0), $\\vec{AB} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$, $\\vec{AC} = ' +
            '\\begin{pmatrix} -4 \\\\ 3 \\end{pmatrix}$ — le triangle ABC est-il rectangle en A ?',
          steps: [{ tag: 'produit scalaire', text: '$\\vec{AB} \\cdot \\vec{AC} = 3 \\times (-4) + 4 \\times 3 = -12 + 12 = 0$' }],
          result: { tag: 'résultat', text: 'produit scalaire nul → le triangle est rectangle en A' },
        },
        {
          kind: 'exempleLibre',
          label: "Démonstration — d'où vient cette formule ?",
          blocks: [
            {
              kind: 'para',
              text:
                'Fais pivoter un vecteur $\\vec{OA}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ ' +
                'd\'un quart de tour. Tu obtiens un vecteur $\\vec{OA\'}\\begin{pmatrix} -y \\\\ x ' +
                '\\end{pmatrix}$, perpendiculaire à $\\vec{OA}$ par construction. Tout vecteur ' +
                '$\\vec{v}$ colinéaire à $\\vec{OA\'}$ est donc lui aussi perpendiculaire à ' +
                '$\\vec{OA}$. Il s\'écrit $\\vec{v} = k \\cdot \\begin{pmatrix} -y \\\\ x ' +
                '\\end{pmatrix} = \\begin{pmatrix} -ky \\\\ kx \\end{pmatrix}$ pour un certain k.',
            },
            {
              kind: 'para',
              text:
                'Note $\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix}$ les composantes de ' +
                '$\\vec{v}$. Ça donne $x\'=-ky$ et $y\'=kx$. D\'où $x \\cdot x\' + y \\cdot y\' ' +
                '= x(-ky) + y(kx) = -kxy + kxy = 0$. Le produit scalaire de deux vecteurs ' +
                'perpendiculaires est donc toujours nul.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -3,
            xMax: 3,
            yMin: -0.5,
            yMax: 4,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 2.6, y: 1 }, tone: 'accent' },
              { from: { x: 0, y: 0 }, to: { x: -1, y: 2.6 }, tone: 'good' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'below' },
              { x: 2.8, y: 1.1, vectorLabel: [{ text: 'OA', vector: true }], tone: 'accent', node: false },
              { x: -1.1, y: 2.8, vectorLabel: [{ text: 'OA', vector: true }, { text: '′' }], tone: 'good', node: false },
            ],
            rightAngleMarkers: [{ vertex: { x: 0, y: 0 }, arm1: { x: 2.6, y: 1 }, arm2: { x: -1, y: 2.6 } }],
            caption: "$\\vec{OA}'$ est l'image de $\\vec{OA}$ par une rotation de 90° — toujours perpendiculaire à $\\vec{OA}$",
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — Pythagore généralisé',
          blocks: [
            {
              kind: 'para',
              text:
                'La démonstration précédente ne prouve qu\'un sens : « perpendiculaires ⇒ produit ' +
                'scalaire nul ». Pythagore donne les deux sens d\'un coup. Prends un triangle ABC ' +
                'avec $\\vec{AB}\\begin{pmatrix} x_1 \\\\ y_1 \\end{pmatrix}$ et ' +
                '$\\vec{AC}\\begin{pmatrix} x_2 \\\\ y_2 \\end{pmatrix}$. Par Chasles, ' +
                '$\\vec{BC} = \\vec{AC} - \\vec{AB}$ a pour composantes ' +
                '$\\begin{pmatrix} x_2-x_1 \\\\ y_2-y_1 \\end{pmatrix}$.',
            },
            {
              kind: 'para',
              text:
                'Développe : $BC^2 = (x_2-x_1)^2 + (y_2-y_1)^2 = (x_1^2+y_1^2) + (x_2^2+y_2^2) - ' +
                '2(x_1x_2+y_1y_2)$, c\'est-à-dire $BC^2 = AB^2 + AC^2 - 2(x_1x_2+y_1y_2)$.',
            },
            {
              kind: 'para',
              text:
                'C\'est le **Pythagore généralisé** : on retrouve Pythagore exactement quand le ' +
                'terme correctif est nul. Par Pythagore et sa réciproque, ABC est rectangle en A ' +
                '⟺ $BC^2 = AB^2 + AC^2$ ⟺ $x_1x_2 + y_1y_2 = 0$.',
            },
            {
              kind: 'para',
              text:
                'Pour aller plus loin : compare avec Al-Kashi ([[4e/cercle-trigonometrique-triangles#triangle]]), ' +
                '$BC^2 = AB^2 + AC^2 - 2 \\cdot AB \\cdot AC \\cdot \\cos\\hat{A}$. Le produit scalaire ' +
                'vaut donc $AB \\cdot AC \\cdot \\cos\\hat{A}$ : il est nul exactement quand ' +
                '$\\cos\\hat{A} = 0$, c\'est-à-dire quand $\\hat{A} = 90°$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'triangle donné par ses sommets',
          formula: 'A(1 ; 1), B(4 ; 2), C(0 ; 4). Le triangle ABC est-il rectangle en A ?',
          steps: [
            { tag: 'AB et AC', text: '$\\vec{AB}\\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}$ et $\\vec{AC}\\begin{pmatrix} -1 \\\\ 3 \\end{pmatrix}$' },
            { tag: 'produit scalaire', text: '$3 \\times (-1) + 1 \\times 3 = -3 + 3 = 0$' },
          ],
          result: { tag: 'résultat', text: 'produit scalaire nul → ABC est rectangle en A (et même isocèle, voir la section 11)' },
        },
        {
          kind: 'exemple',
          badge: 'orthogonalité avec un paramètre',
          formula: 'Pour quelle valeur de x les vecteurs $\\vec{u}\\begin{pmatrix} x \\\\ 3 \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix} 4 \\\\ -2 \\end{pmatrix}$ sont-ils orthogonaux ?',
          steps: [
            { tag: 'écrire la condition', text: '$x \\times 4 + 3 \\times (-2) = 0$, soit $4x - 6 = 0$' },
            { tag: 'résoudre', text: '$x = \\dfrac{6}{4} = 1{,}5$' },
          ],
          result: { tag: 'résultat', text: '$x = 1{,}5$' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — jamais colinéaires et orthogonaux à la fois',
          blocks: [
            {
              kind: 'para',
              text:
                'Prends deux vecteurs non nuls $\\vec{u}\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ et $\\vec{v}$, et ' +
                'suppose qu\'ils sont colinéaires : $\\vec{v} = k \\cdot \\vec{u}$, soit ' +
                '$\\vec{v}\\begin{pmatrix} kx \\\\ ky \\end{pmatrix}$. Comme $\\vec{v}$ n\'est pas nul, $k \\neq 0$.',
            },
            {
              kind: 'para',
              text:
                'Calcule leur produit scalaire : $x \\cdot kx + y \\cdot ky = k(x^2 + y^2) = k \\cdot \\|\\vec{u}\\|^2$. ' +
                'Or $k \\neq 0$, et $\\|\\vec{u}\\|^2 > 0$ car $\\vec{u}$ n\'est pas nul : le produit scalaire n\'est ' +
                'donc jamais nul.',
            },
            {
              kind: 'para',
              text:
                'Deux vecteurs non nuls colinéaires ne sont donc jamais orthogonaux : pour eux, les deux tests ' +
                'ne peuvent pas être vérifiés en même temps.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Orthogonalité et Pythagore généralisé',
          generatorId: 'gen25',
          description: ["Teste l'orthogonalité de 2 vecteurs ou si un triangle est rectangle, y compris avec des composantes dépendant d'un paramètre x."],
          chantier: '4e',
          whereLabel: '4e → « 25. Orthogonalité et Pythagore généralisé »',
        },
        { kind: 'subheading', text: "Synthèse : la nature d'un quadrilatère" },
        {
          kind: 'para',
          text:
            'Égalité de vecteurs, norme et orthogonalité suffisent pour reconnaître un parallélogramme, ' +
            'un losange, un rectangle ou un carré à partir des coordonnées de ses sommets. Les trois ' +
            'tests se font **dans cet ordre** : losange et rectangle sont d\'abord des parallélogrammes.',
        },
        {
          kind: 'methode',
          label: "Nature d'un quadrilatère ABCD",
          items: [
            'Parallélogramme ? — ABCD est un parallélogramme ⟺ $\\vec{AB} = \\vec{DC}$ (même sens de ' +
              'parcours : de A vers B, de D vers C — section 1).',
            'Losange ? — un parallélogramme est un losange ⟺ deux côtés **consécutifs** ont la même ' +
              'longueur : $\\|\\vec{AB}\\| = \\|\\vec{BC}\\|$.',
            'Rectangle ? — un parallélogramme est un rectangle ⟺ il a un angle droit : ' +
              '$x_{AB} \\cdot x_{BC} + y_{AB} \\cdot y_{BC} = 0$.',
            'Carré — un parallélogramme à la fois losange et rectangle : les deux tests sont vérifiés.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              xMin: -0.6,
              xMax: 4.6,
              yMin: -0.6,
              yMax: 4.275,
              showAxes: false,
              grid: true,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 3, y: 0 }, tone: 'accent', arrow: false },
                { from: { x: 3, y: 0 }, to: { x: 4, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 2 }, to: { x: 1, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 1, y: 2 }, to: { x: 0, y: 0 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 0, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
                { x: 3, y: 0, label: 'B', tone: 'ink', labelPos: 'right' },
                { x: 4, y: 2, label: 'C', tone: 'ink', labelPos: 'right' },
                { x: 1, y: 2, label: 'D', tone: 'ink', labelPos: 'left' },
              ],
              caption: 'parallélogramme : $\\vec{AB} = \\vec{DC}$',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.6,
              xMax: 4.6,
              yMin: -0.6,
              yMax: 4.275,
              showAxes: false,
              grid: true,
              vectors: [
                { from: { x: 1, y: 0 }, to: { x: 3, y: 1 }, tone: 'accent', arrow: false },
                { from: { x: 3, y: 1 }, to: { x: 4, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 3 }, to: { x: 2, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: 2 }, to: { x: 1, y: 0 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 1, y: 0, label: 'A', tone: 'ink', labelPos: 'left' },
                { x: 3, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
                { x: 4, y: 3, label: 'C', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 2, label: 'D', tone: 'ink', labelPos: 'left' },
              ],
              caption: 'losange : en plus, $AB = BC$',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.6,
              xMax: 4.6,
              yMin: -0.6,
              yMax: 4.275,
              showAxes: false,
              grid: true,
              vectors: [
                { from: { x: 0, y: 1 }, to: { x: 4, y: 1 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 1 }, to: { x: 4, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 4, y: 3 }, to: { x: 0, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 0, y: 3 }, to: { x: 0, y: 1 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 0, y: 1, label: 'A', tone: 'ink', labelPos: 'left' },
                { x: 4, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
                { x: 4, y: 3, label: 'C', tone: 'ink', labelPos: 'right' },
                { x: 0, y: 3, label: 'D', tone: 'ink', labelPos: 'left' },
              ],
              rightAngleMarkers: [{ vertex: { x: 4, y: 1 }, arm1: { x: 0, y: 1 }, arm2: { x: 4, y: 3 } }],
              caption: 'rectangle : en plus, un angle droit',
            },
            {
              kind: 'vectorPlane',
              xMin: -0.6,
              xMax: 4.6,
              yMin: -0.6,
              yMax: 4.275,
              showAxes: false,
              grid: true,
              vectors: [
                { from: { x: 1, y: 0 }, to: { x: 3, y: 1 }, tone: 'accent', arrow: false },
                { from: { x: 3, y: 1 }, to: { x: 2, y: 3 }, tone: 'accent', arrow: false },
                { from: { x: 2, y: 3 }, to: { x: 0, y: 2 }, tone: 'accent', arrow: false },
                { from: { x: 0, y: 2 }, to: { x: 1, y: 0 }, tone: 'accent', arrow: false },
              ],
              points: [
                { x: 1, y: 0, label: 'A', tone: 'ink', labelPos: 'below' },
                { x: 3, y: 1, label: 'B', tone: 'ink', labelPos: 'right' },
                { x: 2, y: 3, label: 'C', tone: 'ink', labelPos: 'above' },
                { x: 0, y: 2, label: 'D', tone: 'ink', labelPos: 'left' },
              ],
              rightAngleMarkers: [{ vertex: { x: 3, y: 1 }, arm1: { x: 1, y: 0 }, arm2: { x: 2, y: 3 } }],
              caption: 'carré : losange et rectangle',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: "nature d'un quadrilatère",
          formula: 'A(1 ; 0), B(5 ; 2), C(4 ; 4), D(0 ; 2). Quelle est la nature du quadrilatère ABCD ?',
          steps: [
            {
              tag: 'parallélogramme ?',
              text:
                '$\\vec{AB} = \\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ et $\\vec{DC} = \\begin{pmatrix} 4 \\\\ 2 \\end{pmatrix}$ : ' +
                '$\\vec{AB} = \\vec{DC}$, ABCD est un parallélogramme',
            },
            {
              tag: 'losange ?',
              text:
                '$\\vec{BC} = \\begin{pmatrix} -1 \\\\ 2 \\end{pmatrix}$, $\\|\\vec{AB}\\| = \\sqrt{20} = 2\\sqrt{5}$ et ' +
                '$\\|\\vec{BC}\\| = \\sqrt{5}$ : pas un losange',
            },
            { tag: 'rectangle ?', text: '$4 \\cdot (-1) + 2 \\cdot 2 = 0$ : angle droit en B, c\'est un rectangle' },
          ],
          result: { tag: 'résultat', text: 'ABCD est un rectangle, mais pas un carré' },
        },
        {
          kind: 'piege',
          label: 'Le parallélogramme d\'abord',
          text:
            'Un angle droit en B ou deux côtés consécutifs égaux ne prouvent **rien** tant que ABCD ' +
            'n\'est pas un parallélogramme : un trapèze peut avoir un angle droit, un cerf-volant deux ' +
            'côtés consécutifs égaux. Et pour le losange, comparer deux côtés **opposés** ($AB$ et ' +
            '$DC$) ne sert à rien : ils sont toujours égaux dans un parallélogramme.',
        },
        {
          kind: 'entrainement',
          title: "Nature d'un quadrilatère",
          generatorId: 'gen84',
          description: [
            'Parallélogramme, losange, rectangle ou carré ? Décide à partir des coordonnées des sommets : égalité de vecteurs, normes de deux côtés consécutifs et critère d\'orthogonalité — ou trouve d\'abord le quatrième sommet.',
          ],
          chantier: '4e',
          whereLabel: "4e → « 84. Nature d'un quadrilatère »",
        },
      ],
    },

    {
      id: 'directeur',
      number: 15,
      title: "Vecteurs directeurs d'une droite",
      kicker: 'tout vecteur défini par deux points distincts de la droite',
      titreCourt: 'Vecteurs directeurs',
      partie: 'Dans un repère : les composantes',
      essentiel: [
        'Un **vecteur directeur** de d est un vecteur défini par deux points distincts de d : une droite en a une infinité, tous colinéaires entre eux.',
        'La droite $y = mx + p$ a pour vecteur directeur $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$ ; une droite horizontale $\\begin{pmatrix} k \\\\ 0 \\end{pmatrix}$, une droite verticale $\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$, avec $k \\neq 0$.',
      ],
      cartes: [
        { question: 'Donne un vecteur directeur de la droite $y = 2x - 1$.', reponse: '$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$, ou tout multiple non nul.' },
        { question: 'Combien une droite a-t-elle de vecteurs directeurs ?', reponse: 'Une infinité, tous colinéaires entre eux.' },
        { question: 'Vecteur directeur d\'une droite verticale ?', reponse: '$\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$, avec $k \\neq 0$.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Un **vecteur directeur** d\'une droite d, c\'est un vecteur défini par deux ' +
            'points distincts de d — n\'importe lesquels ! Deux points quelconques d\'une même ' +
            'droite donnent toujours des vecteurs colinéaires (section 13). Une droite a donc ' +
            'une infinité de vecteurs directeurs. Mais ils sont tous colinéaires entre eux.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 4.5,
            vectors: [
              { from: { x: 0.5, y: 0.4 }, to: { x: 6.5, y: 3.8 }, tone: 'faint' },
              { from: { x: 1, y: 0.7 }, to: { x: 3, y: 1.8 }, tone: 'accent' },
              { from: { x: 3, y: 1.8 }, to: { x: 5, y: 2.9 }, tone: 'good' },
              { from: { x: 1.5, y: 0.3 }, to: { x: 4.5, y: 2 }, tone: 'attn', dashed: true },
            ],
            points: [
              { x: 1, y: 0.7, label: 'A', tone: 'ink', labelPos: 'below' },
              { x: 3, y: 1.8, label: 'B', tone: 'ink', labelPos: 'below' },
              { x: 5, y: 2.9, label: 'C', tone: 'ink', labelPos: 'above' },
              { x: 6.7, y: 4, label: 'd', tone: 'ink', node: false },
              { x: 1.5, y: 0.3, label: 'E', tone: 'ink', labelPos: 'below' },
              { x: 4.5, y: 2, label: 'F', tone: 'ink', labelPos: 'right' },
            ],
            caption: '$\\vec{AB}$, $\\vec{BC}$ et $\\vec{EF}$ sont trois vecteurs directeurs différents de la même droite d (avec $\\vec{EF} \\parallel d$)',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            '$\\vec{AB}$, $\\vec{BC}$, $\\vec{CB}$… sont tous des vecteurs directeurs de d dès que A, B, C ∈ d.',
            'Si une droite EF est parallèle à d, alors $\\vec{EF}$ est aussi un vecteur directeur de d.',
            'Droite parallèle à l\'axe des x (horizontale) — vecteur directeur $\\begin{pmatrix} k \\\\ 0 \\end{pmatrix}$, k ≠ 0.',
            'Droite parallèle à l\'axe des y (verticale) — vecteur directeur $\\begin{pmatrix} 0 \\\\ k \\end{pmatrix}$, k ≠ 0.',
            'Droite d\'équation $y = mx + p$ — vecteur directeur $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$ : quand x augmente de 1, y augmente de m.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'vecteur directeur à partir de l\'équation',
          formula: 'Donne un vecteur directeur de la droite d : y = 2x − 1.',
          steps: [
            { tag: 'deux points de d', text: 'x = 0 donne A(0 ; −1), x = 1 donne B(1 ; 1)' },
            { tag: 'vecteur AB', text: '$\\vec{AB}\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$, c\'est bien $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$ avec m = 2' },
          ],
          result: { tag: 'résultat', text: '$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix}$ — et tout multiple non nul, comme $\\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix}$ ou $\\begin{pmatrix} -1 \\\\ -2 \\end{pmatrix}$' },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi (1 ; m) dirige la droite y = mx + p',
          blocks: [
            {
              kind: 'para',
              text:
                'Les points A(0 ; p) et B(1 ; m + p) sont sur la droite d : en x = 0, $y = m \\cdot 0 + p = p$ ; ' +
                'en x = 1, $y = m \\cdot 1 + p = m + p$. Ils sont distincts, donc $\\vec{AB}$ est un vecteur ' +
                'directeur de d : $\\vec{AB}\\begin{pmatrix} 1 - 0 \\\\ (m + p) - p \\end{pmatrix} = ' +
                '\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$.',
            },
            {
              kind: 'para',
              text:
                'Plus généralement, deux points de d d\'abscisses $x_1 \\neq x_2$ donnent le vecteur ' +
                '$\\begin{pmatrix} x_2 - x_1 \\\\ m(x_2 - x_1) \\end{pmatrix} = (x_2 - x_1) \\cdot \\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$ : ' +
                'tous les vecteurs directeurs de d sont des multiples de $\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'vecteur-directeur-widget',
          label: 'Manipule toi-même : les vecteurs directeurs d\'une droite',
          caption:
            'Déplace A et B : tous les vecteurs AB, BA, 2·AB… sont des vecteurs directeurs ' +
            'de la même droite d, donc colinéaires. Le vecteur (1 ; m) se lit directement ' +
            'sur l\'équation y = mx + p : quand x augmente de 1, y change de m. Essaie aussi ' +
            'une droite horizontale (m = 0) et une droite verticale (pas de pente).',
        },
        {
          kind: 'entrainement',
          title: "Vecteurs directeurs d'une droite",
          generatorId: 'gen129',
          description: [
            "Lis un vecteur directeur d'une droite tracée sur un quadrillage (horizontale, verticale ou parallèle à une droite (EF)), reconnais tous les vecteurs directeurs parmi cinq vecteurs, puis lis-en un sur une équation y = mx + p.",
          ],
          chantier: '4e',
          whereLabel: "4e → « 129. Vecteurs directeurs d'une droite »",
        },
        {
          kind: 'rappel',
          label: 'Pour la suite — la géométrie analytique',
          items: [
            'Le vecteur directeur sert à décrire une droite par une équation paramétrique ou ' +
              'cartésienne. Tu le retrouveras au centre de [[4e/geometrie-analytique-plane#reperer]].',
          ],
        },
      ],
    },

    {
      id: 'comparaison',
      number: 16,
      title: 'Comparer des vecteurs : longueur, direction, sens',
      kicker: '3 propriétés indépendantes — chacune peut coïncider ou non',
      titreCourt: 'Comparer des vecteurs',
      partie: 'Comparer, appliquer, réviser',
      essentiel: [
        'Deux vecteurs peuvent partager leur longueur, leur direction et leur sens — ou seulement une partie. L\'égalité exige les trois à la fois.',
        'Même longueur ne veut **jamais** dire colinéaires.',
      ],
      cartes: [
        { question: 'Qu\'exige l\'égalité de deux vecteurs ?', reponse: 'Même longueur, même direction et même sens.' },
        { question: 'Que partagent $\\vec{u}$ et $2\\vec{u}$ ?', reponse: 'La direction et le sens, pas la longueur.' },
        { question: 'Deux vecteurs de même norme sont-ils forcément colinéaires ?', reponse: 'Non : ils peuvent pointer dans des directions complètement différentes.' },
      ],
      blocks: [
        { kind: 'video', title: 'Comparer des vecteurs et résultante de deux forces', youtubeId: 'x1WjMH6shXc' },
        {
          kind: 'para',
          text:
            'Deux vecteurs ont trois propriétés : leur **longueur**, leur **direction**, leur ' +
            '**sens**. Ils peuvent en partager une seule, deux, ou les trois. Seule l\'égalité ' +
            '($\\vec{u} = \\vec{v}$) exige les trois à la fois.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 3.5 }, to: { x: 2, y: 4 }, tone: 'accent' },
              { from: { x: 0, y: 1 }, to: { x: 2, y: 1.5 }, tone: 'accent' },
              { from: { x: 3.5, y: 3.7 }, to: { x: 6.5, y: 4.4 }, tone: 'good' },
              { from: { x: 6.5, y: 0.3 }, to: { x: 4.5, y: 0.8 }, tone: 'bad' },
            ],
            points: [
              { x: 1, y: 4.3, vectorLabel: [{ text: 'u', vector: true }], tone: 'accent', node: false },
              { x: 1, y: 1.8, vectorLabel: [{ text: '= ' }, { text: 'u', vector: true }, { text: ' (ailleurs)' }], tone: 'accent', node: false },
              { x: 5, y: 4.7, vectorLabel: [{ text: '2·' }, { text: 'u', vector: true }], tone: 'good', node: false },
              { x: 5.5, y: 0.1, vectorLabel: [{ text: '−' }, { text: 'u', vector: true }], tone: 'bad', node: false },
            ],
            caption: 'même vecteur $\\vec{u}$ représenté à 2 endroits (identique), $2\\vec{u}$ (même sens, plus long), $-\\vec{u}$ (sens opposé)',
          },
        },
        {
          kind: 'featureTable',
          headers: ['Relation', 'Longueur', 'Direction', 'Sens'],
          rows: [
            ['Vecteurs égaux', 'identique', 'identique', 'identique'],
            ['Vecteurs opposés (−u)', 'identique', 'identique', 'opposé'],
            ['Colinéaires, même sens (k>0)', 'quelconque', 'identique', 'identique'],
            ['Colinéaires, sens opposé (k<0)', 'quelconque', 'identique', 'opposé'],
            ['Même norme seulement', 'identique', 'différente', 'sans objet'],
          ],
        },
        {
          kind: 'piege',
          text:
            'Même longueur ne veut **jamais** dire colinéaire ! Deux vecteurs peuvent avoir ' +
            'exactement la même norme, tout en pointant dans des directions complètement différentes.',
        },
        {
          kind: 'atelier',
          tag: 'longueur-direction-sens-widget',
          label: 'Manipule toi-même : longueur, direction, sens',
          caption:
            'u est fixe ; déplace l\'origine C et l\'extrémité D de v. Les trois propriétés s\'allument en ' +
            'direct : même longueur (normes comparées), même direction (critère de colinéarité nul), ' +
            'même sens (seulement si les directions sont les mêmes). La ligne correspondante du tableau ' +
            'est surlignée. Essaie les raccourcis u, −u, 2u, −2u et « même norme ».',
        },
        {
          kind: 'entrainement',
          title: 'Comparaison visuelle de vecteurs sur figure',
          generatorId: 'gen28',
          description: ['Parmi plusieurs vecteurs dérivés de deux ou trois vecteurs de base, sélectionne ceux qui partagent une propriété (longueur, direction ou sens) avec une référence.'],
          chantier: '4e',
          whereLabel: '4e → « 28. Comparaison visuelle de vecteurs sur figure »',
        },
      ],
    },

    {
      id: 'applications',
      number: 17,
      title: 'Applications physiques : la résultante',
      kicker: 'R² = F₁² + F₂² + 2·F₁·F₂·cos θ (Al-Kashi, loi des cosinus)',
      titreCourt: 'La résultante (physique)',
      partie: 'Comparer, appliquer, réviser',
      essentiel: [
        'Deux forces ou deux vitesses s\'additionnent comme des vecteurs : leur **résultante** est la diagonale du parallélogramme.',
        'Sa norme : $R^2 = F_1^2 + F_2^2 + 2 \\cdot F_1 \\cdot F_2 \\cdot \\cos\\theta$, avec $\\theta$ l\'angle entre les deux vecteurs (ou par les composantes). À l\'équilibre, $\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$.',
      ],
      cartes: [
        { question: 'Norme de la résultante de deux forces $F_1$ et $F_2$ qui forment un angle $\\theta$ ?', reponse: '$R^2 = F_1^2 + F_2^2 + 2 \\cdot F_1 \\cdot F_2 \\cdot \\cos\\theta$.' },
        { question: 'Pourquoi un « + » dans cette formule, alors qu\'Al-Kashi a un « − » ?', reponse: 'L\'angle du triangle opposé à R vaut $180° - \\theta$, et $\\cos(180° - \\theta) = -\\cos\\theta$.' },
        { question: 'Traversée d\'une rivière : par quoi divise-t-on la largeur pour obtenir la durée ?', reponse: 'Par la composante y de la vitesse réelle.' },
        { question: 'Trois forces en équilibre : que vaut $\\vec{F_3}$ ?', reponse: '$\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$, l\'opposée de la résultante des deux autres.' },
      ],
      blocks: [
        {
          kind: 'intuition',
          label: 'Deux personnes qui tirent un traîneau',
          text:
            'Imagine deux personnes qui tirent un traîneau, chacune dans une direction ' +
            "différente. Le traîneau ne part ni vers l'une, ni vers l'autre : il part dans " +
            'une direction intermédiaire, déterminée par la force et la direction de ' +
            'chacune des deux personnes. Cette force et cette direction combinées, c\'est ' +
            'exactement ce que donne $\\vec{v_R} = \\vec{v_1} + \\vec{v_2}$.',
        },
        {
          kind: 'para',
          text:
            'Deux forces ou deux vitesses s\'additionnent comme des vecteurs. Leur ' +
            '**résultante** se calcule avec Al-Kashi (loi des cosinus), vue dans [[4e/cercle-trigonometrique-triangles#triangle]]. Le ' +
            'triangle formé par les deux vecteurs et leur somme n\'est presque jamais rectangle !',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            xMin: -0.5,
            xMax: 7,
            yMin: -0.5,
            yMax: 5,
            vectors: [
              { from: { x: 0, y: 0 }, to: { x: 4, y: 0 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 2, y: 3.3 }, tone: 'attn' },
              { from: { x: 4, y: 0 }, to: { x: 6, y: 3.3 }, tone: 'faint', dashed: true },
              { from: { x: 2, y: 3.3 }, to: { x: 6, y: 3.3 }, tone: 'faint', dashed: true },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 3.3 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'O', tone: 'ink', labelPos: 'left' },
              { x: 2, y: -0.35, vectorLabel: [{ text: 'v', vector: true }, { text: '₁' }], tone: 'good', node: false },
              { x: 0.6, y: 1.8, vectorLabel: [{ text: 'v', vector: true }, { text: '₂' }], tone: 'attn', node: false, labelPos: 'left' },
              { x: 3.6, y: 1.9, vectorLabel: [{ text: 'v', vector: true }, { text: 'R' }], tone: 'accent', node: false },
            ],
            angleArcs: [{ cx: 0, cy: 0, fromDeg: 0, toDeg: 59, radiusPx: 26, label: 'θ', tone: 'accent' }],
            caption: 'règle du parallélogramme : la résultante $\\vec{v_R}$ est la diagonale issue de O',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Repérer l\'angle θ entre les deux vecteurs, mesuré depuis leur origine commune.',
            'Calculer la norme de la résultante : $R^2 = F_1^2 + F_2^2 + 2 \\cdot F_1 \\cdot F_2 \\cdot \\cos\\theta$.',
            'Si besoin, calcule la **déviation** — l\'écart angulaire entre la résultante et ' +
              'l\'un des deux vecteurs — par la loi des sinus. Traduis-la ensuite en direction ' +
              'cardinale, selon le contexte de la figure.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — d\'où vient le « + » ?',
          blocks: [
            {
              kind: 'para',
              text:
                'Al-Kashi s\'écrit avec un signe **moins**. Pourquoi un **plus** ici ? Dans le ' +
                'parallélogramme, le triangle formé par $\\vec{F_1}$, le côté parallèle à ' +
                '$\\vec{F_2}$ et la résultante a pour côtés F₁, F₂ et R. Mais l\'angle de ce ' +
                'triangle opposé à R n\'est pas θ : c\'est **180° − θ**, car deux angles consécutifs ' +
                'd\'un parallélogramme sont supplémentaires.',
            },
            {
              kind: 'para',
              text:
                'Al-Kashi donne donc $R^2 = F_1^2 + F_2^2 - 2F_1F_2\\cos(180° - \\theta)$. Or ' +
                '$\\cos(180° - \\theta) = -\\cos\\theta$ (angles associés, [[4e/cercle-trigonometrique-triangles#associes]]). D\'où ' +
                '$R^2 = F_1^2 + F_2^2 + 2F_1F_2\\cos\\theta$.',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux forces',
          formula: 'F₁ = 50 N, F₂ = 30 N, angle entre les deux forces θ = 60°.',
          steps: [
            { tag: 'norme de la résultante', text: '$R^2 = 50^2 + 30^2 + 2 \\times 50 \\times 30 \\times \\cos 60° = 2500 + 900 + 1500 = 4900$' },
            { tag: 'racine', text: '$R = \\sqrt{4900} = 70$ N' },
            { tag: 'déviation (loi des sinus)', text: '$\\sin(\\text{déviation})/F_2 = \\sin\\theta/R \\Rightarrow \\sin(\\text{déviation}) = 30 \\times \\sin 60°/70 \\approx 0{,}371$' },
          ],
          result: { tag: 'résultat', text: 'R = 70 N, déviation ≈ 21,8° par rapport à F₁' },
        },
        {
          kind: 'piege',
          label: 'Piège — une déviation de plus de 90°',
          text:
            'La calculatrice (arcsin) renvoie toujours un angle **aigu** α₀, alors que ' +
            '$\\sin(180° - \\alpha_0) = \\sin\\alpha_0$ : c\'est l\'ambiguïté de la loi des sinus ' +
            'vue dans [[4e/cercle-trigonometrique-triangles#associes]] et [[4e/cercle-trigonometrique-triangles#triangle]]. Vérifie donc le signe de ' +
            '$F_1 + F_2 \\cos\\theta$, la composante de la résultante le long de $\\vec{F_1}$ : ' +
            's\'il est **négatif**, la résultante penche vers l\'arrière, la déviation est ' +
            'obtuse et vaut $180° - \\alpha_0$ (et non α₀). ' +
            'Exemple : $F_1 = 20$ N, $F_2 = 40$ N et $\\theta = 135°$ donnent ' +
            '$R \\approx 29{,}47$ N, puis $\\sin(\\text{déviation}) = 40 \\times \\sin 135°/29{,}47$ ' +
            '≈ 0,960. La calculatrice affiche 73,7°, mais $20 + 40 \\cos 135° \\approx -8{,}28$ ' +
            'est négatif : la déviation vaut $180° - 73{,}7°$ = 106,3°.',
        },
        {
          kind: 'exemple',
          badge: 'résultante par les composantes',
          formula: 'Reprends F₁ = 50 N, F₂ = 30 N et θ = 60°, avec $\\vec{F_1}$ le long de l\'axe horizontal.',
          steps: [
            { tag: 'composantes', text: '$\\vec{F_1}\\begin{pmatrix} 50 \\\\ 0 \\end{pmatrix}$ et $\\vec{F_2}\\begin{pmatrix} 30\\cos 60° \\\\ 30\\sin 60° \\end{pmatrix} \\approx \\begin{pmatrix} 15 \\\\ 25{,}98 \\end{pmatrix}$' },
            { tag: 'somme', text: '$\\vec{R} \\approx \\begin{pmatrix} 65 \\\\ 25{,}98 \\end{pmatrix}$' },
            { tag: 'norme', text: '$R \\approx \\sqrt{65^2 + 25{,}98^2} \\approx \\sqrt{4225 + 675} = \\sqrt{4900} = 70$ N' },
            { tag: 'déviation', text: 'l\'angle dont la tangente vaut $25{,}98/65 \\approx 0{,}400$, soit ≈ 21,8°' },
          ],
          result: {
            tag: 'résultat',
            text:
              'mêmes valeurs qu\'avec Al-Kashi. Avantage : si la première composante de R est ' +
              'négative, la résultante penche vers l\'arrière et la déviation est obtuse — le piège ' +
              'ci-dessus se voit d\'un coup d\'œil.',
          },
        },
        {
          kind: 'atelier',
          tag: 'resultante-vecteurs-widget',
          label: 'Manipule toi-même : la règle du parallélogramme',
          caption:
            'Fais varier F₁, F₂ et l\'angle θ : le parallélogramme et la résultante R se ' +
            'recalculent en direct, par Al-Kashi (loi des cosinus) et par les composantes. L\'angle ' +
            '180° − θ, en violet, explique le « + » de la formule. Le bouton « Déviation ' +
            'obtuse » montre le cas où la calculatrice se trompe d\'angle. Le réglage de ' +
            'départ reproduit le premier exemple de la section.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — des notations adaptées au contexte',
          items: [
            'La notation suit toujours le contexte. Des forces se notent $\\vec{F_1}$, ' +
              '$\\vec{F_2}$, $\\vec{F_R}$. Des vitesses (par exemple avion et vent) se notent ' +
              '$\\vec{v_1}$, $\\vec{v_2}$, $\\vec{v_R}$.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Applications physiques (résultante de vecteurs)',
          generatorId: 'gen29',
          description: ['Calcule la norme, la déviation et la direction cardinale de la résultante de deux vecteurs (avion/vent, forces), via Al-Kashi (loi des cosinus).'],
          chantier: '4e',
          whereLabel: '4e → « 29. Applications physiques (résultante de vecteurs) »',
        },
        {
          kind: 'para',
          text:
            'Les composantes sont aussi l\'outil naturel pour **traverser une rivière**. On prend un ' +
            'repère d\'origine au point de départ : l\'axe x le long de la rive, dans le sens du ' +
            'courant, et l\'axe y vers l\'autre rive. Le courant de vitesse c a pour composantes ' +
            '$\\vec{v_c}\\begin{pmatrix} c \\\\ 0 \\end{pmatrix}$, et la vitesse réelle est ' +
            '$\\vec{v_R} = \\vec{v_p} + \\vec{v_c}$, où $\\vec{v_p}$ est la vitesse propre (par ' +
            'rapport à l\'eau).',
        },
        {
          kind: 'exemple',
          badge: 'traverser une rivière',
          formula:
            'Un nageur traverse une rivière de largeur 40 m, où le courant va à 0,6 m/s. Il nage ' +
            'perpendiculairement aux rives à 0,8 m/s. Où accoste-t-il ?',
          steps: [
            { tag: 'vitesse réelle', text: '$\\vec{v_p}\\begin{pmatrix} 0 \\\\ 0{,}8 \\end{pmatrix} + \\vec{v_c}\\begin{pmatrix} 0{,}6 \\\\ 0 \\end{pmatrix}$ donne $\\vec{v_R}\\begin{pmatrix} 0{,}6 \\\\ 0{,}8 \\end{pmatrix}$' },
            { tag: 'durée', text: 'seule la composante y fait traverser : $t = \\dfrac{40}{0{,}8} = 50$ s' },
            { tag: 'point d\'accostage', text: 'la composante x le fait dériver : $x_A = 0{,}6 \\cdot 50 = 30$ m' },
            { tag: 'vitesse réelle', text: '$\\|\\vec{v_R}\\| = \\sqrt{0{,}6^2 + 0{,}8^2} = 1$ m/s, donc il parcourt $1 \\cdot 50 = 50$ m' },
          ],
          result: { tag: 'résultat', text: 'il accoste 30 m en aval du point juste en face, après 50 s.' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'vectorPlane',
            // largeur 40 m ; vitesses dessinées × 10 (0,8 m/s → 8 unités) ; domaine 53 × 50 (rapport 320/300)
            xMin: -8,
            xMax: 45,
            yMin: -5,
            yMax: 45,
            showAxes: false,
            vectors: [
              { from: { x: -8, y: 0 }, to: { x: 45, y: 0 }, tone: 'faint', arrow: false },
              { from: { x: -8, y: 40 }, to: { x: 45, y: 40 }, tone: 'faint', arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 40 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 30, y: 40 }, tone: 'accent', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 0, y: 8 }, tone: 'good' },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 0 }, tone: 'attn' },
              { from: { x: 0, y: 8 }, to: { x: 6, y: 8 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 6, y: 0 }, to: { x: 6, y: 8 }, tone: 'faint', dashed: true, arrow: false },
              { from: { x: 0, y: 0 }, to: { x: 6, y: 8 }, tone: 'accent' },
            ],
            points: [
              { x: 0, y: 0, label: 'départ', tone: 'ink', labelPos: 'below' },
              { x: 0, y: 40, label: 'en face', tone: 'ink', labelPos: 'above' },
              { x: 30, y: 40, label: 'accostage', tone: 'accent', labelPos: 'above' },
              { x: 15, y: 40, label: '30 m', tone: 'accent', node: false, labelPos: 'below' },
              { x: -0.5, y: 5, vectorLabel: [{ text: 'v', vector: true }, { text: 'ₚ' }], tone: 'good', node: false, labelPos: 'left' },
              { x: 9, y: 2, vectorLabel: [{ text: 'v', vector: true }, { text: 'c' }], tone: 'attn', node: false, labelPos: 'right' },
              { x: 7, y: 8.5, vectorLabel: [{ text: 'v', vector: true }, { text: 'R' }], tone: 'accent', node: false, labelPos: 'right' },
              { x: 44, y: 20, label: '40 m', tone: 'ink', node: false, labelPos: 'left' },
            ],
            caption:
              'vitesses dessinées 10 fois plus grandes : $\\vec{v_R} = \\vec{v_p} + \\vec{v_c}$ donne la direction ' +
              'de la trajectoire réelle (en pointillés). Le nageur traverse en 50 s et accoste 30 m en aval.',
          },
        },
        {
          kind: 'piege',
          label: 'Piège — le courant ne change pas la durée',
          text:
            'Pour la durée, on divise la largeur par la **composante y** de la vitesse, jamais par ' +
            'la vitesse réelle : le courant fait glisser le long de la rive sans rapprocher de ' +
            'l\'autre bord. Et pour arriver **juste en face**, il faut que la composante x de la ' +
            'vitesse réelle soit nulle : la vitesse propre doit viser vers l\'amont, avec ' +
            '$x_{\\vec{v_p}} = -c$, et sa composante y vient de Pythagore, ' +
            '$y_{\\vec{v_p}} = \\sqrt{\\|\\vec{v_p}\\|^2 - c^2}$ (possible seulement si la vitesse ' +
            'propre dépasse le courant).',
        },
        {
          kind: 'atelier',
          tag: 'traversee-riviere-widget',
          label: 'Manipule toi-même : traverser la rivière',
          caption:
            'Règle le courant, la vitesse propre et l\'angle de visée : la vitesse réelle est la somme de ' +
            'la vitesse propre et du courant. La durée ne dépend que de la composante y ; le point ' +
            'd\'accostage, de la composante x. Le bouton « Juste en face » vise vers l\'amont (x de la ' +
            'vitesse propre = −c), ce qui n\'est possible que si la vitesse propre dépasse le courant. Le ' +
            'réglage de départ reproduit l\'exemple du nageur.',
        },
        {
          kind: 'entrainement',
          title: 'Traverser une rivière : vitesses en composantes',
          generatorId: 'gen87',
          description: [
            'Où accoste-t-il ? Vitesse réelle en composantes, durée de la traversée, point d\'accostage, puis vitesse réelle ou distance parcourue. Ou : quelle direction prendre pour arriver juste en face ?',
          ],
          chantier: '4e',
          whereLabel: '4e → « 87. Traverser une rivière : vitesses en composantes »',
        },
        {
          kind: 'para',
          text:
            '**Équilibre de forces.** Un objet soumis à plusieurs forces reste immobile quand ces ' +
            'forces se compensent : leur somme est le vecteur nul. Avec trois forces, ' +
            '$\\vec{F_1} + \\vec{F_2} + \\vec{F_3} = \\vec{0}$, donc $\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$ : ' +
            'la troisième force est l\'**opposée** de la résultante des deux autres, pas la résultante ' +
            'elle-même. En composantes, on additionne $\\vec{F_1}$ et $\\vec{F_2}$, puis on change les ' +
            'signes ; l\'intensité de $\\vec{F_3}$ est sa norme, $\\|\\vec{F_3}\\| = \\sqrt{x^2 + y^2}$.',
        },
        {
          kind: 'exemple',
          badge: 'équilibre de trois forces',
          formula:
            'Un lustre immobile est soumis à son poids $\\vec{F_1}\\begin{pmatrix} 0 \\\\ -150 \\end{pmatrix}$, ' +
            'à la tension d\'un premier câble $\\vec{F_2}\\begin{pmatrix} -80 \\\\ 80 \\end{pmatrix}$ et à la ' +
            'tension $\\vec{F_3}$ d\'un second câble (composantes en N, axe x horizontal, axe y vers le haut).',
          steps: [
            { tag: 'résultante', text: '$\\vec{F_1} + \\vec{F_2}\\begin{pmatrix} 0 + (-80) \\\\ -150 + 80 \\end{pmatrix} = \\begin{pmatrix} -80 \\\\ -70 \\end{pmatrix}$' },
            { tag: 'équilibre', text: '$\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$, donc $\\vec{F_3}\\begin{pmatrix} 80 \\\\ 70 \\end{pmatrix}$' },
            { tag: 'intensité', text: '$\\|\\vec{F_3}\\| = \\sqrt{80^2 + 70^2} = \\sqrt{11\\,300} = 10\\sqrt{113} \\approx 106{,}3$ N' },
            { tag: 'direction', text: '$\\tan\\alpha = \\dfrac{70}{80} = 0{,}875$, donc $\\alpha \\approx 41{,}2°$ avec l\'horizontale' },
          ],
          result: {
            tag: 'résultat',
            text: 'le second câble tire vers la droite et vers le haut, avec une force d\'environ 106,3 N, à 41,2° de l\'horizontale.',
          },
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'vectorPlane',
              // forces en N : F₁(0 ; −150), F₂(−80 ; 80), F₃(80 ; 70) ; domaine 300 × 281 (rapport 320/300)
              xMin: -150,
              xMax: 150,
              yMin: -171,
              yMax: 110,
              vectors: [
                { from: { x: 0, y: 0 }, to: { x: 0, y: -150 }, tone: 'bad' },
                { from: { x: 0, y: 0 }, to: { x: -80, y: 80 }, tone: 'good' },
                { from: { x: 0, y: 0 }, to: { x: 80, y: 70 }, tone: 'accent' },
              ],
              points: [
                { x: 0, y: 0, label: 'L', tone: 'ink', labelPos: 'right' },
                { x: 4, y: -110, vectorLabel: [{ text: 'F', vector: true }, { text: '₁' }], tone: 'bad', node: false, labelPos: 'right' },
                { x: -70, y: 60, vectorLabel: [{ text: 'F', vector: true }, { text: '₂' }], tone: 'good', node: false, labelPos: 'left' },
                { x: 70, y: 52, vectorLabel: [{ text: 'F', vector: true }, { text: '₃' }], tone: 'accent', node: false, labelPos: 'right' },
              ],
              caption: 'les trois forces appliquées au lustre L',
            },
            {
              kind: 'vectorPlane',
              // triangle des forces : 0 → F₁ → (0 ; −150) → F₂ → (−80 ; −70) → F₃ → 0 ; domaine 170 × 160
              xMin: -120,
              xMax: 50,
              yMin: -165,
              yMax: -5,
              showAxes: false,
              vectors: [
                { from: { x: 0, y: -10 }, to: { x: 0, y: -160 }, tone: 'bad' },
                { from: { x: 0, y: -160 }, to: { x: -80, y: -80 }, tone: 'good' },
                { from: { x: -80, y: -80 }, to: { x: 0, y: -10 }, tone: 'accent' },
              ],
              points: [
                { x: 4, y: -85, vectorLabel: [{ text: 'F', vector: true }, { text: '₁' }], tone: 'bad', node: false, labelPos: 'right' },
                { x: -44, y: -126, vectorLabel: [{ text: 'F', vector: true }, { text: '₂' }], tone: 'good', node: false, labelPos: 'left' },
                { x: -44, y: -40, vectorLabel: [{ text: 'F', vector: true }, { text: '₃' }], tone: 'accent', node: false, labelPos: 'left' },
              ],
              caption: 'bout à bout, elles forment un triangle fermé : la somme est nulle',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'equilibre-forces-widget',
          label: 'Manipule toi-même : l\'équilibre de trois forces',
          caption:
            'Déplace les extrémités de F₁ et F₂ (un carreau = 10 N) : la force d\'équilibre F₃ = −(F₁ + F₂) ' +
            'se recalcule, avec son intensité et son angle avec l\'horizontale. Bout à bout, les trois forces ' +
            'forment un triangle fermé. Le bouton « Piège » prend F₃ = F₁ + F₂ : le polygone ne se ferme plus.',
        },
        {
          kind: 'entrainement',
          title: 'Équilibre de forces en composantes',
          generatorId: 'gen90',
          description: ['Trouve la troisième force qui équilibre les deux autres (lustre, tir à la corde, barque amarrée, anneau sur quadrillage) : condition d\'équilibre, résultante et force d\'équilibre en composantes, intensité et direction.'],
          chantier: '4e',
          whereLabel: '4e → « 90. Équilibre de forces en composantes »',
        },
        { kind: 'subheading', text: 'Sur un chantier : reconnaître l\'outil caché dans les mots' },
        {
          kind: 'para',
          text:
            'Sur un plan de terrain repéré en mètres, la question ne dit jamais « colinéaire » ou ' +
            '« orthogonal ». Elle parle de piquets **alignés**, de coin **d\'équerre**, de routes ' +
            '**parallèles**, de point **à mi-chemin**… Le premier travail est de traduire ces mots en ' +
            'une relation entre vecteurs ; le calcul vient ensuite.',
        },
        {
          kind: 'featureTable',
          headers: ['Mot du contexte', 'Relation vectorielle', 'Critère'],
          rows: [
            ['A, B, C alignés', '$\\vec{AB}$ et $\\vec{AC}$ colinéaires', 'critère de colinéarité nul'],
            ['(AB) et (CD) parallèles', '$\\vec{AB}$ et $\\vec{CD}$ colinéaires', 'critère de colinéarité nul'],
            ['coin A d\'équerre', '$\\vec{AB}$ et $\\vec{AC}$ orthogonaux', 'produit scalaire nul'],
            ['M à mi-chemin entre A et B', 'M milieu de [AB]', '$\\vec{AM} = \\frac{1}{2}\\,\\vec{AB}$'],
            ['ABCD parallélogramme', 'côtés opposés égaux', '$\\vec{AB} = \\vec{DC}$'],
          ],
        },
        {
          kind: 'attention',
          text:
            'Le critère est une égalité **exacte**. Un critère de colinéarité ou un produit scalaire qui vaut 2 ' +
            'n\'est pas « presque nul » : sur le terrain, un coin à 88° ou trois piquets décalés de ' +
            'quelques centimètres se verraient au bout de quelques mètres. Et un plan qui « a l\'air » ' +
            'aligné ne prouve rien.',
        },
        {
          kind: 'entrainement',
          title: 'Chantier et terrains : alignement, équerre, parallélisme, milieu',
          generatorId: 'gen88',
          description: ['Sur un plan en mètres, reconnais l\'outil caché dans les mots (alignés, d\'équerre, parallèles, à mi-chemin), calcule les vecteurs utiles, applique le critère et réponds dans le contexte.'],
          chantier: '4e',
          whereLabel: '4e → « 88. Chantier et terrains : alignement, équerre, parallélisme, milieu »',
        },
      ],
    },

    {
      id: 'revision',
      number: 18,
      title: 'Révision — quiz vrai/faux',
      kicker: '420 affirmations en 12 thèmes',
      titreCourt: 'Révision : vrai ou faux',
      partie: 'Comparer, appliquer, réviser',
      essentiel: [
        'Le quiz vrai/faux reprend tout le chapitre en 12 thèmes, dans l\'ordre des sections : il est dans l\'onglet **Réviser**, avec la fiche du chapitre et le formulaire.',
      ],
      cartes: [
        { question: 'Une copie calcule les composantes de $\\vec{AB}$ par A − B : quelle est l\'erreur ?', reponse: 'Elle obtient $\\vec{BA}$ : c\'est « arrivée moins départ », B − A.' },
        { question: 'Une copie écrit : ABCD parallélogramme ⟺ $\\vec{AB} = \\vec{CD}$. Quelle est l\'erreur ?', reponse: 'Il faut $\\vec{AB} = \\vec{DC}$.' },
      ],
      blocks: [
        { kind: 'video', title: 'Révision : la synthèse du chapitre', youtubeId: 'raOgCbx0OOI' },
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre tout le chapitre : 12 thèmes de 35 affirmations, un par ' +
            'grande notion, dans l\'ordre des sections — de la multiplication par un réel aux ' +
            'vecteurs en contexte (déplacements, rivière, équilibre, chantier). Le quiz se fait en ' +
            'ligne : sur la page du chapitre, onglet **Réviser**.',
        },
        {
          kind: 'entrainement',
          title: "Le détective d'erreurs vectoriel",
          generatorId: 'gen91',
          description: [
            'Un élève a résolu un exercice de calcul vectoriel (norme, alignement, angle droit, ' +
              'parallélogramme, point défini par une relation), mais une ligne de sa copie est fausse : ' +
              'composantes calculées A − B, Chasles mal enchaîné, racine ou carré oublié dans une norme, ' +
              'mauvais critère de colinéarité, signe faux dans le produit scalaire, AB = CD au lieu de ' +
              'AB = DC. Trouve la ligne, nomme l\'erreur et corrige la résolution.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 91. Le détective d\'erreurs vectoriel »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Vecteur, composantes et norme',
        formulas: [
          { text: '$\\vec{AB}\\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$', condition: 'composantes de $\\vec{AB}$ (« arrivée moins départ »)' },
          { text: '$\\|\\vec{u}\\| = \\sqrt{x_u^2+y_u^2}$' },
          { text: '$AB = \\sqrt{(x_B-x_A)^2+(y_B-y_A)^2}$' },
          { text: '$\\|k \\cdot \\vec{u}\\| = |k| \\cdot \\|\\vec{u}\\|$' },
        ],
      },
      {
        title: 'Combiner des vecteurs',
        formulas: [
          { text: '$\\vec{u}+\\vec{v} = \\begin{pmatrix} x_u+x_v \\\\ y_u+y_v \\end{pmatrix}$' },
          { text: '$k \\cdot \\vec{u} = \\begin{pmatrix} k \\cdot x_u \\\\ k \\cdot y_u \\end{pmatrix}$' },
          { text: '$-\\vec{u} = (-1) \\cdot \\vec{u}$', condition: 'soustraire = ajouter l\'opposé' },
          { text: '$\\vec{u}-\\vec{v} = \\begin{pmatrix} x_u-x_v \\\\ y_u-y_v \\end{pmatrix}$' },
        ],
      },
      {
        title: 'Décomposer un vecteur',
        formulas: [
          {
            text: '$x_u = a \\cdot x_v + b \\cdot x_w \\quad y_u = a \\cdot y_v + b \\cdot y_w$',
            condition: 'système de $\\vec{u} = a\\vec{v} + b\\vec{w}$, avec $\\vec{v}$ et $\\vec{w}$ non colinéaires',
          },
        ],
      },
      {
        title: 'Relation de Chasles',
        formulas: [
          { text: '$\\vec{AB} + \\vec{BC} = \\vec{AC}$', condition: 'relation de Chasles' },
          { text: '$\\vec{AB} + \\vec{BC} + \\vec{CA} = \\vec{0}$', condition: 'chaîne fermée' },
          { text: '$\\vec{AB} - \\vec{AC} = \\vec{CB}$' },
          { text: '$\\vec{AB} = \\vec{CD}$', condition: 'ABDC est un parallélogramme' },
        ],
      },
      {
        title: 'Points liés à un vecteur',
        formulas: [
          { text: '$x_B=x_A+x_u$, $y_B=y_A+y_u$', condition: 'translation : B = A + u' },
          { text: '$x_M=\\dfrac{x_A+x_B}{2}$, $y_M=\\dfrac{y_A+y_B}{2}$', condition: 'milieu M de [AB]' },
          { text: '$\\vec{AM} = k \\cdot \\vec{AB}$', condition: '$k = \\frac{1}{2}$ → milieu, $k = 1$ → B, $k = 0$ → A' },
          { text: '$x_{A\'}=2x_B-x_A$, $y_{A\'}=2y_B-y_A$', condition: 'A′ symétrique de A par rapport à B' },
        ],
      },
      {
        title: 'Nature d\'un quadrilatère ABCD',
        formulas: [
          { text: '$\\vec{AB} = \\vec{DC}$', condition: 'ABCD est un parallélogramme' },
          { text: '$x_D = x_A + x_C - x_B$, $y_D = y_A + y_C - y_B$', condition: 'quatrième sommet D du parallélogramme ABCD' },
          { text: '$\\|\\vec{AB}\\| = \\|\\vec{BC}\\|$', condition: 'le parallélogramme ABCD est un losange, deux côtés consécutifs égaux' },
          { text: '$x_{AB} \\cdot x_{BC} + y_{AB} \\cdot y_{BC} = 0$', condition: 'le parallélogramme ABCD est un rectangle, angle droit en B' },
          { text: 'carré : un parallélogramme à la fois losange et rectangle' },
        ],
      },
      {
        title: 'Colinéarité et orthogonalité',
        formulas: [
          { text: '$x_u \\cdot y_v - y_u \\cdot x_v = 0$', condition: 'colinéaires, critère de colinéarité nul' },
          { text: '$x_u \\cdot x_v + y_u \\cdot y_v = 0$', condition: 'orthogonaux, produit scalaire nul' },
          { text: 'viser C depuis A dans le sens de $\\vec{u}$ : $\\vec{AC} = k \\cdot \\vec{u}$ avec $k > 0$' },
        ],
      },
      {
        title: 'Vecteur directeur',
        formulas: [
          { text: '$\\begin{pmatrix} 1 \\\\ m \\end{pmatrix}$', condition: 'vecteur directeur de la droite d\'équation $y = mx + p$' },
        ],
      },
      {
        title: 'Résultante de deux vecteurs',
        formulas: [
          { text: '$R^2 = F_1^2+F_2^2+2 \\cdot F_1 \\cdot F_2 \\cdot \\cos\\theta$', condition: 'θ entre les deux vecteurs, Al-Kashi' },
          { text: '$\\dfrac{\\sin(\\text{déviation})}{F_2} = \\dfrac{\\sin\\theta}{R}$' },
          {
            text: '$\\vec{R} = \\begin{pmatrix} F_1 + F_2\\cos\\theta \\\\ F_2\\sin\\theta \\end{pmatrix}$',
            condition: '$\\vec{F_1}$ le long de l\'axe horizontal — méthode par les composantes',
          },
          { text: 'déviation obtuse si $F_1 + F_2\\cos\\theta < 0$ : elle vaut $180^\\circ - \\alpha_0$ ($\\alpha_0$ donné par la calculatrice)' },
        ],
      },
      {
        title: 'Vecteurs en contexte',
        formulas: [
          { text: '$\\begin{pmatrix} a \\\\ 0 \\end{pmatrix}$ vers l\'est, $\\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}$ vers l\'ouest, $\\begin{pmatrix} 0 \\\\ a \\end{pmatrix}$ vers le nord, $\\begin{pmatrix} 0 \\\\ -a \\end{pmatrix}$ vers le sud (a pas)' },
          { text: 'a pas en diagonale vers le nord-ouest → $\\begin{pmatrix} -a \\\\ a \\end{pmatrix}$ (chaque pas : une case vers l\'ouest et une vers le nord)' },
          { text: '$\\|\\vec{DA}\\| = \\|\\vec{u}_1 + \\vec{u}_2 + \\vec{u}_3\\|$', condition: 'distance à vol d\'oiseau après des déplacements successifs' },
          { text: '$t = \\dfrac{\\text{largeur}}{y_{\\vec{v_R}}}$', condition: 'durée de la traversée d\'une rivière, composante y de la vitesse réelle' },
          { text: '$x_{\\vec{v_p}} = -c \\quad y_{\\vec{v_p}} = \\sqrt{\\|\\vec{v_p}\\|^2 - c^2}$', condition: 'arriver juste en face, courant de vitesse c' },
          { text: '$\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$', condition: 'équilibre de trois forces' },
          { text: '$\\tan\\alpha = \\dfrac{|y|}{|x|}$', condition: 'angle α entre une force $\\begin{pmatrix} x \\\\ y \\end{pmatrix}$ et l\'horizontale' },
        ],
      },
    ],
  },

  recap: {
    items: [
      'Vecteur — direction, sens, longueur. $\\vec{AB} = \\vec{CD} \\iff ABDC$ est un parallélogramme. ' +
        'Composantes $\\vec{AB} = \\begin{pmatrix} x_B-x_A \\\\ y_B-y_A \\end{pmatrix}$, toujours ' +
        'indépendantes du point où tu le dessines.',
      'Combiner — addition (triangle ou parallélogramme) et multiplication par un scalaire, ' +
        'composante par composante. $k>0$ conserve le sens, $k<0$ l\'inverse. Opposé : $-\\vec{u} = ' +
        '(-1) \\cdot \\vec{u}$. Soustraire, c\'est ajouter l\'opposé.',
      'Décomposer — selon deux directions non colinéaires, $\\vec{u} = a\\vec{v} + b\\vec{w}$ : ' +
        'parallélogramme sur la figure, système en composantes.',
      'Chasles — une chaîne de vecteurs se réduit du premier point au dernier. Une chaîne fermée se réduit au vecteur nul.',
      'Norme — $\\|\\vec{u}\\|=\\sqrt{x_u^2+y_u^2}$, toujours $\\geq 0$. Distance entre deux points = ' +
        'norme du vecteur qui les relie.',
      'Points — translation $B = A + \\vec{u}$. Milieu = moyenne des coordonnées. Relation générale ' +
        '$\\vec{AM} = k \\cdot \\vec{AB}$, toujours sur la droite $(AB)$.',
      'Colinéarité — $x_uy_v-y_ux_v=0$. Orthogonalité — $x_ux_v+y_uy_v=0$. Deux tests à ne jamais confondre !',
      'Démontrer et classer — sans repère, on exprime tout dans une base de deux vecteurs non ' +
        'colinéaires et on compare les coefficients. Nature d\'un quadrilatère : parallélogramme ' +
        'd\'abord ($\\vec{AB} = \\vec{DC}$), puis deux côtés consécutifs égaux (losange) ou un angle ' +
        'droit (rectangle) ; les deux à la fois, c\'est un carré.',
      'Vecteur directeur — tout vecteur défini par 2 points d\'une droite. Pour une même droite, ils sont tous colinéaires entre eux.',
      'Résultante — somme vectorielle de deux forces ou vitesses. Sa norme s\'obtient par Al-Kashi (loi des cosinus), ou par les composantes.',
      'Vecteurs en contexte — déplacements successifs : on additionne les vecteurs, la distance à ' +
        'vol d\'oiseau est la norme de la somme. Rivière : $\\text{durée} = ' +
        '\\dfrac{\\text{largeur}}{\\text{composante } y \\text{ de la vitesse réelle}}$. Équilibre : ' +
        '$\\vec{F_3} = -(\\vec{F_1} + \\vec{F_2})$.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        'Ai-je bien vérifié que les vecteurs se relaient point par point avant d\'appliquer Chasles ?',
        'Ma norme est-elle bien positive ou nulle, jamais négative ?',
        'Ai-je bien calculé le milieu comme une moyenne, jamais comme une différence de coordonnées ?',
        'Ai-je utilisé la bonne formule — critère de colinéarité pour la colinéarité, produit scalaire pour l\'orthogonalité ?',
        'Ai-je bien écrit $\\vec{AB} - \\vec{AC} = \\vec{CB}$, et non $\\vec{BC}$ ?',
        'Dans la formule de la résultante, ai-je bien mis « $+\\,2F_1F_2\\cos\\theta$ » ($\\theta$ = ' +
          'angle entre les deux vecteurs) ?',
      ],
    },
    forward:
      'En géométrie analytique ([[4e/geometrie-analytique-plane]]), le vecteur directeur sert à écrire les ' +
      'équations d\'une droite, et colinéarité et orthogonalité deviennent des tests de ' +
      'parallélisme et de perpendicularité. Composantes, norme et produit scalaire reviendront ' +
      'aussi plus tard.',
    entrainement: {
      kind: 'entrainement',
      title: 'Calcul vectoriel — quiz vrai/faux',
      generatorId: 'gen64',
      description: ['Choisis un thème et teste-toi : 420 affirmations pré-écrites réparties en 12 thèmes (35 par thème), qui reprennent tout le chapitre. Une seule tentative par question, justification toujours révélée.'],
      chantier: '4e',
      whereLabel: '4e → « 64. Calcul vectoriel — quiz vrai/faux »',
    },
  },
}
