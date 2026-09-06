import type { ChapterContent } from '../../types'

export const geometrieDansEspace: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 8,
  title: "Géométrie dans l'espace",
  slug: 'geometrie-dans-espace',
  lede:
    "Un solide ne tient pas sur une feuille plane — il faut d'abord apprendre à le **dessiner** " +
    'avant de pouvoir raisonner dessus. Ce chapitre commence par la perspective cavalière, la ' +
    "convention qui permet de représenter un cube ou un prisme sur papier sans en fausser la " +
    "lecture, pose ensuite le vocabulaire commun à toute la géométrie dans l'espace — déterminer " +
    'un plan, situer deux droites ou deux plans l\'un par rapport à l\'autre, reconnaître un ' +
    "parallélisme, construire un point de percée — puis l'applique à trois questions concrètes : " +
    "où se situe une droite par rapport à un plan, quelle forme prend la section d'un solide " +
    "coupé par un plan, et comment reconstituer l'ombre d'un objet éclairé obliquement. " +
    'Contrairement au chapitre sur les droites et les cercles du plan, aucune coordonnée ' +
    "numérique n'intervient dans ces trois derniers exercices : tout s'y lit et se justifie " +
    "directement sur le dessin, jamais par un calcul chiffré.",

  sections: [
    {
      id: 'cavaliere',
      number: 1,
      title: 'Perspective cavalière — dessiner un solide en 3D',
      kicker: 'x à l\'horizontale, z à la verticale, y en profondeur à 45° et réduit de moitié',
      blocks: [
        {
          kind: 'para',
          text:
            "Un solide a trois dimensions ; une feuille n'en a que deux. La **perspective " +
            "cavalière** résout ce problème par une convention simple, utilisée pour tous les " +
            "dessins de ce chapitre : l'axe x reste horizontal à l'échelle réelle, l'axe z (la " +
            "hauteur) reste vertical à l'échelle réelle, et l'axe y (la profondeur, ce qui « " +
            'rentre » dans la feuille) part en diagonale à 45°, mais **réduit de moitié** — sans ' +
            'cette réduction, un cube semblerait étiré vers l\'arrière.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'solidCavaliere',
            size: 'large',
            showAxes: true,
            caption:
              'le sommet arrière-bas-gauche est caché derrière le solide : ses 3 arêtes se ' +
              'tracent en pointillé, jamais en trait plein',
          },
        },
        {
          kind: 'attention',
          label: 'Une longueur en profondeur ne se lit jamais sur le dessin',
          text:
            "À cause de la réduction de moitié, un segment porté par l'axe y paraît deux fois " +
            'plus court qu\'il ne l\'est réellement — une face perpendiculaire à y se dessine ' +
            "même comme un parallélogramme, jamais comme un rectangle. C'est pourquoi aucun " +
            'exercice de ce chapitre ne demande jamais de mesurer une longueur à la règle sur le ' +
            'croquis : tout se raisonne sur les **sommets nommés** et les relations qu\'ils ' +
            'entretiennent (appartenance, parallélisme, intersection), jamais sur une distance ' +
            'lue à l\'œil.',
        },
        {
          kind: 'para',
          text:
            'Trois familles de solides reviennent dans ce chapitre : le **parallélépipède** et le ' +
            '**cube** (un cas particulier du premier), le **prisme** (deux faces parallèles ' +
            'superposables reliées par des rectangles) et le **tétraèdre** (quatre sommets, ' +
            'quatre faces triangulaires). Chacun est toujours dessiné avec les mêmes coordonnées ' +
            'de référence — seuls les éléments choisis dessus (un plan, une droite, des points de ' +
            'section) varient d\'un exercice à l\'autre.',
        },
        { kind: 'subheading', text: 'Une autre convention : la perspective centrale' },
        {
          kind: 'para',
          text:
            "La perspective cavalière n'est pas la seule façon de représenter l'espace sur une " +
            'feuille. Les peintres de la Renaissance ont mis au point la **perspective centrale** ' +
            '(ou « perspective à point de fuite ») : toutes les droites parallèles situées dans un ' +
            'même plan horizontal semblent alors converger vers un unique point, le **point de ' +
            'fuite**, posé sur une ligne d\'horizon à hauteur d\'œil — exactement l\'effet que ' +
            'produit une route ou une voie ferrée qui semble se refermer au loin. Le dispositif et ' +
            'le principe de cette convention sont détaillés dans les sections 10 et 11 de ce ' +
            'chapitre.',
        },
        {
          kind: 'para',
          text:
            'Cette convention est plus fidèle à la vision humaine (elle imite ce qu\'un objectif ' +
            'photo ou un œil capture réellement), mais bien plus lourde à construire à la main — ' +
            'elle exige de placer un ou plusieurs points de fuite avant de tracer la moindre ' +
            "arête. C'est pourquoi tous les dessins de ce chapitre restent en perspective " +
            'cavalière : plus simple à tracer, elle conserve le parallélisme des droites (deux ' +
            'arêtes parallèles du solide le restent sur le dessin), ce que la perspective ' +
            'centrale ne fait jamais.',
        },
      ],
    },

    {
      id: 'determiner-plan',
      number: 2,
      title: 'Déterminer un plan',
      kicker: "4 façons équivalentes de fixer un plan, sans jamais en donner l'équation",
      blocks: [
        {
          kind: 'para',
          text:
            'Comme une droite est fixée par un point et une direction, un plan est fixé par une ' +
            'donnée minimale — toujours l\'une de ces 4 formes, jamais une équation à trois ' +
            'inconnues dans ce chapitre.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              planes: [{ points: [{ x: 15, y: 95 }, { x: 115, y: 95 }, { x: 135, y: 25 }, { x: 35, y: 25 }], style: 'plan' }],
              lines: [{ points: [{ x: 45, y: 80 }, { x: 92, y: 86 }, { x: 68, y: 42 }], tone: 'accent', closed: true }],
              points: [
                { x: 45, y: 80, label: 'A', tone: 'ink', labelDx: -13, labelDy: 14 },
                { x: 92, y: 86, label: 'B', tone: 'ink', labelDx: 5, labelDy: 2 },
                { x: 68, y: 42, label: 'C', tone: 'ink', labelDx: 4, labelDy: -6 },
              ],
              caption: '3 points non alignés → plan (ABC)',
            },
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              planes: [{ points: [{ x: 15, y: 95 }, { x: 115, y: 95 }, { x: 135, y: 25 }, { x: 35, y: 25 }], style: 'plan' }],
              lines: [{ points: [{ x: 25, y: 55 }, { x: 128, y: 65 }], tone: 'accent' }],
              points: [{ x: 75, y: 32, label: 'A', tone: 'ink', labelDx: 7, labelDy: -4 }],
              freeLabels: [{ x: 30, y: 49, text: 'd', tone: 'accent' }],
              caption: 'une droite + un point extérieur → plan (A, d)',
            },
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              planes: [{ points: [{ x: 15, y: 95 }, { x: 115, y: 95 }, { x: 135, y: 25 }, { x: 35, y: 25 }], style: 'plan' }],
              lines: [
                { points: [{ x: 25, y: 82 }, { x: 128, y: 42 }], tone: 'accent' },
                { points: [{ x: 35, y: 42 }, { x: 118, y: 82 }], tone: 'good' },
              ],
              points: [{ x: 76, y: 62, tone: 'ink' }],
              caption: '2 droites sécantes → un plan unique',
            },
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              planes: [{ points: [{ x: 15, y: 95 }, { x: 115, y: 95 }, { x: 135, y: 25 }, { x: 35, y: 25 }], style: 'plan' }],
              lines: [
                { points: [{ x: 25, y: 80 }, { x: 128, y: 58 }], tone: 'accent' },
                { points: [{ x: 32, y: 52 }, { x: 132, y: 30 }], tone: 'good' },
              ],
              caption: '2 droites parallèles distinctes → un plan unique',
            },
          ],
        },
        {
          kind: 'rappel',
          label: 'Repère',
          items: [
            "Comme dans le plan, une droite de l'espace reste déterminée par 2 points distincts. " +
              'Un plan se désigne le plus souvent par 3 de ses points (« le plan (ABC) ») ou, plus ' +
              'rarement, par une lettre grecque (α, β, π…). Tout théorème de géométrie plane déjà ' +
              "connu reste vrai à l'intérieur d'un plan de l'espace — un plan de l'espace n'est " +
              'jamais qu\'une copie du plan habituel, posée quelque part en 3D.',
          ],
        },
      ],
    },

    {
      id: 'deux-droites',
      number: 3,
      title: 'Positions de deux droites : sécantes, parallèles ou gauches',
      kicker: 'une troisième possibilité, impossible dans le plan : les droites gauches',
      blocks: [
        {
          kind: 'para',
          text:
            'Dans le plan, deux droites distinctes sont toujours soit sécantes, soit parallèles. ' +
            'Dans l\'espace, une troisième situation apparaît, impossible à obtenir sur une seule ' +
            'feuille : deux droites peuvent n\'avoir **aucun plan commun**. On dit alors qu\'elles ' +
            'sont **gauches** — ni sécantes, ni parallèles, elles ne se croisent jamais et ne sont ' +
            'jamais parallèles non plus.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedLines: [
                { from: 'A', to: 'F', tone: 'accent' },
                { from: 'B', to: 'E', tone: 'good' },
              ],
              freePoints: [{ x: 60, y: 75, tone: 'ink' }],
              caption: 'sécantes — un point commun, coplanaires',
            },
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedLines: [
                { from: 'A', to: 'B', tone: 'accent' },
                { from: 'H', to: 'G', tone: 'good' },
              ],
              caption: 'parallèles — même direction, coplanaires',
            },
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedLines: [
                { from: 'A', to: 'B', tone: 'accent' },
                { from: 'C', to: 'G', tone: 'good' },
              ],
              caption: 'gauches — aucun point commun, aucun plan commun',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Propriété',
          items: [
            'Deux droites distinctes de l\'espace sont soit **coplanaires** (et alors soit ' +
              'parallèles, soit sécantes), soit **gauches**. Deux droites parallèles sont ' +
              '**toujours** coplanaires — même quand elles semblent appartenir à deux faces ' +
              'différentes du solide, comme (AB) et (HG) ci-dessus.',
          ],
        },
        {
          kind: 'rappel',
          label: "Pourquoi ce cas n'existe pas dans le plan",
          items: [
            "Sur une feuille, deux droites tracées appartiennent forcément à cette même feuille " +
              '— donc à un même plan. « Gauches » n\'a de sens qu\'en trois dimensions, exactement ' +
              'comme le montre (AB)/(CG) ci-dessus : l\'une est portée par la base, l\'autre grimpe ' +
              'verticalement à l\'arrière du cube, sans jamais partager ni point, ni direction, ni ' +
              'plan.',
          ],
        },
      ],
    },

    {
      id: 'position',
      number: 4,
      title: "Position d'une droite par rapport à un plan",
      kicker: 'incluse, parallèle ou sécante — 3 questions, toujours dans le même ordre',
      blocks: [
        {
          kind: 'para',
          text:
            'Un plan est désigné par **3 sommets** du solide, une droite par **2 sommets** — ' +
            'jamais par une équation. La question posée admet toujours exactement une des trois ' +
            'réponses suivantes, jamais une quatrième : la droite est **incluse** dans le plan, ' +
            '**parallèle** au plan (sans y être incluse), ou **sécante** au plan (elle le coupe en ' +
            'un point unique).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'solidCavaliere',
            size: 'large',
            vertexLabels: [
              { vertex: 'A', tone: 'ink' },
              { vertex: 'B', tone: 'ink' },
              { vertex: 'C', tone: 'ink' },
              { vertex: 'D', tone: 'ink' },
              { vertex: 'E', tone: 'plan' },
              { vertex: 'F', tone: 'plan' },
              { vertex: 'G', tone: 'plan', dotTone: 'accent' },
              { vertex: 'H', tone: 'plan' },
            ],
            highlightedPlane: { vertices: ['E', 'F', 'G', 'H'] },
            highlightedLines: [{ from: 'A', to: 'G', tone: 'accent' }],
            caption:
              'cube ABCDEFGH — plan (EFGH) en violet, droite (AG) en orange : sécante, elle ' +
              'coupe le plan exactement au sommet G',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode — 3 questions, toujours dans cet ordre',
          items: [
            'Les 2 points de la droite appartiennent-ils tous les deux au plan ? Si oui → **incluse**.',
            'Sinon : la direction de la droite est-elle parallèle au plan ? (portée par une ' +
              'combinaison des directions de deux droites non parallèles du plan) Si oui → ' +
              '**parallèle** — elle ne rencontre jamais le plan.',
            'Sinon → **sécante**. Le plan étant considéré **infini** (jamais borné aux arêtes ' +
              'dessinées du solide), elle le coupe en un point unique, qui peut tomber exactement ' +
              'sur un sommet nommé, strictement à l\'intérieur d\'une arête, ou même en dehors du ' +
              'solide représenté.',
          ],
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedPlane: { vertices: ['E', 'F', 'G', 'H'] },
              highlightedLines: [{ from: 'E', to: 'G', tone: 'accent' }],
              caption: 'incluse — les 2 points sont dans le plan',
            },
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedPlane: { vertices: ['E', 'F', 'G', 'H'] },
              highlightedLines: [{ from: 'A', to: 'B', tone: 'accent' }],
              caption: 'parallèle — même direction, jamais au contact',
            },
            {
              kind: 'solidCavaliere',
              size: 'small',
              highlightedPlane: { vertices: ['E', 'F', 'G', 'H'] },
              highlightedLines: [{ from: 'A', to: 'G', tone: 'accent' }],
              freePoints: [{ x: 119.75, y: 15.25, tone: 'accent' }],
              caption: 'sécante — coupe le plan en un point unique',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'cube ABCDEFGH',
          formula:
            'Plan (EFGH), la face supérieure. Droite (AG), la grande diagonale du cube. Position ' +
            'de (AG) par rapport à (EFGH) ?',
          steps: [
            {
              tag: 'question 1 — inclusion',
              text: 'A appartient-il à (EFGH) ? Non, A est un sommet de la base. Donc pas d\'inclusion.',
            },
            {
              tag: 'question 2 — parallélisme',
              text:
                'la direction (AG) traverse-t-elle toute la hauteur du cube, de la base au sommet ? ' +
                'Oui : elle n\'est portée par aucune direction du plan supérieur. Donc pas de ' +
                'parallélisme.',
            },
          ],
          result: {
            tag: 'conclusion',
            text: '(AG) est sécante à (EFGH) — l\'intersection tombe exactement sur le sommet G, déjà nommé sur le solide.',
          },
        },
        {
          kind: 'piege',
          label: 'Le plan dessiné n\'est qu\'un extrait du vrai plan, infini',
          text:
            'Le plan reste toujours considéré infini, même si le dessin ne montre que la face du ' +
            'solide qui le porte : une droite peut donc être sécante en un point situé **en ' +
            'dehors** du solide représenté. Vocabulaire à connaître mais jamais employé dans les ' +
            'questions posées : « déterminant », « produit scalaire » restent des outils de calcul ' +
            'internes, jamais des mots que l\'énoncé utilise.',
        },
        {
          kind: 'entrainement',
          title: "Position d'une droite par rapport à un plan",
          generatorId: 'gen39',
          description: [
            'Classe la position d\'une droite par rapport à un plan sur un solide en perspective ' +
              'cavalière (parallélépipède, cube ou prisme), puis justifie ce choix par une ' +
              'sélection structurée adaptée au cas trouvé.',
          ],
          chantier: '4e',
          whereLabel: "4e → « 39. Position d'une droite par rapport à un plan »",
        },
      ],
    },

    {
      id: 'deux-plans',
      number: 5,
      title: 'Positions de deux plans',
      kicker: 'parallèles, ou sécants suivant une droite — jamais un point isolé',
      blocks: [
        {
          kind: 'para',
          text:
            'Deux plans distincts sont soit **parallèles** (aucun point commun), soit **sécants** ' +
            '— et dans ce cas, leur intersection n\'est jamais un point isolé mais toujours une ' +
            '**droite entière**. Dès que deux plans distincts partagent ne serait-ce qu\'un seul ' +
            'point commun, ils partagent en réalité toute une droite passant par ce point.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'planeSketch',
              width: 220,
              height: 150,
              planes: [
                { points: [{ x: 40, y: 55 }, { x: 170, y: 45 }, { x: 190, y: 15 }, { x: 60, y: 25 }], style: 'plan' },
                { points: [{ x: 30, y: 110 }, { x: 160, y: 100 }, { x: 180, y: 70 }, { x: 50, y: 80 }], style: 'plan' },
              ],
              caption: 'parallèles — aucun point commun',
            },
            {
              kind: 'planeSketch',
              width: 220,
              height: 150,
              planes: [
                { points: [{ x: 20, y: 115 }, { x: 150, y: 95 }, { x: 170, y: 35 }, { x: 40, y: 55 }], style: 'plan' },
                { points: [{ x: 35, y: 130 }, { x: 165, y: 65 }, { x: 145, y: 10 }, { x: 15, y: 75 }], style: 'planDashed' },
              ],
              lines: [{ points: [{ x: 58, y: 95 }, { x: 135, y: 50 }], tone: 'accent' }],
              freeLabels: [{ x: 140, y: 46, text: 'd', tone: 'accent' }],
              caption: 'sécants — intersection = une droite entière',
            },
          ],
        },
        {
          kind: 'methode',
          label: '2 propriétés utiles',
          items: [
            'Si un plan π coupe un plan α suivant une droite d, alors il coupe **tout plan ' +
              'parallèle** à α suivant une droite d′ **parallèle** à d.',
            'Si deux plans sont parallèles, **toute droite qui coupe l\'un coupe l\'autre** aussi.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Pour les curieux — la démonstration par l\'absurde',
          items: [
            'Ces deux propriétés se démontrent classiquement **par l\'absurde** : on suppose le ' +
              'contraire de ce qu\'on veut prouver, puis on montre que cette supposition contredit ' +
              'une hypothèse déjà connue — ce qui est impossible, donc la supposition de départ ' +
              'était fausse, donc la propriété annoncée est vraie. Une technique de raisonnement à ' +
              'retenir, au-delà de la seule géométrie de l\'espace.',
          ],
        },
      ],
    },

    {
      id: 'trois-plans',
      number: 6,
      title: 'Positions de trois plans',
      kicker: '3 droites d\'intersection, jamais indépendantes les unes des autres',
      blocks: [
        {
          kind: 'para',
          text:
            'Si trois plans sont sécants deux à deux, les trois droites d\'intersection qui en ' +
            'résultent ne sont jamais quelconques : elles sont soit toutes les trois **sécantes en ' +
            'un même point**, soit toutes les trois **parallèles entre elles**.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              lines: [
                { points: [{ x: 20, y: 25 }, { x: 75, y: 55 }], tone: 'accent' },
                { points: [{ x: 130, y: 20 }, { x: 75, y: 55 }], tone: 'good' },
                { points: [{ x: 75, y: 100 }, { x: 75, y: 55 }], tone: 'attn' },
              ],
              points: [{ x: 75, y: 55, tone: 'ink' }],
              caption: 'sécantes en un point commun',
            },
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              lines: [
                { points: [{ x: 20, y: 90 }, { x: 45, y: 15 }], tone: 'accent' },
                { points: [{ x: 65, y: 95 }, { x: 90, y: 20 }], tone: 'good' },
                { points: [{ x: 110, y: 100 }, { x: 135, y: 25 }], tone: 'attn' },
              ],
              caption: 'parallèles entre elles',
            },
          ],
        },
      ],
    },

    {
      id: 'parallelisme',
      number: 7,
      title: "Critères de parallélisme dans l'espace",
      kicker: '3 critères à connaître, chacun ramène à une comparaison de directions',
      blocks: [
        {
          kind: 'methode',
          label: '3 critères',
          items: [
            '**Unicité** — par un point donné de l\'espace, il ne passe qu\'**une seule** droite ' +
              'parallèle à une droite donnée.',
            '**Droite ∥ plan** — une droite est parallèle à un plan si et seulement si elle est ' +
              'parallèle à **une droite de ce plan** (déjà illustré au cas « parallèle » de la ' +
              'section 4).',
            '**Plan ∥ plan** — deux plans sont parallèles si et seulement si deux droites sécantes ' +
              'de l\'un sont respectivement parallèles à deux droites sécantes de l\'autre.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours ramener à une comparaison de directions',
          text:
            'Les trois critères partagent la même logique : prouver un parallélisme dans ' +
            'l\'espace, c\'est toujours prouver un parallélisme entre deux **droites** — jamais un ' +
            'parallélisme « au jugé » entre deux plans entiers, qui ne se compare qu\'à travers les ' +
            'droites qu\'ils contiennent.',
        },
      ],
    },

    {
      id: 'percee',
      number: 8,
      title: 'Point de percée et intersection de deux plans',
      kicker: 'un plan auxiliaire pour ramener un problème 3D à une intersection 2D',
      blocks: [
        {
          kind: 'para',
          text:
            'Trouver où une droite d traverse un plan α — son **point de percée** — n\'est en ' +
            'général pas direct sur le dessin. La méthode classique construit un **plan ' +
            'auxiliaire** π, choisi pour contenir d tout en étant sécant à α ; la droite commune à ' +
            'π et à α ramène alors le problème à une simple intersection de deux droites ' +
            'coplanaires.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 260,
            height: 180,
            planes: [
              { points: [{ x: 20, y: 155 }, { x: 190, y: 145 }, { x: 215, y: 95 }, { x: 45, y: 105 }], style: 'plan' },
              { points: [{ x: 55, y: 28 }, { x: 175, y: 18 }, { x: 158, y: 142 }, { x: 38, y: 152 }], style: 'planDashed' },
            ],
            lines: [
              { points: [{ x: 95, y: 22 }, { x: 118, y: 150 }], tone: 'accent' },
              { points: [{ x: 68, y: 140 }, { x: 148, y: 126 }], tone: 'good' },
            ],
            points: [{ x: 115, y: 132, tone: 'ink' }],
            freeLabels: [
              { x: 99, y: 16, text: 'd', tone: 'accent' },
              { x: 152, y: 122, text: 'b', tone: 'good' },
              { x: 200, y: 90, text: 'π', tone: 'plan' },
              { x: 26, y: 150, text: 'α', tone: 'plan' },
              { x: 122, y: 128, text: 'point de percée', tone: 'ink' },
            ],
            caption:
              'π contient d et coupe α suivant b ; le point de percée cherché est l\'intersection ' +
              'de d et b, coplanaires dans π',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode — point de percée de d dans α',
          items: [
            'Choisir un plan auxiliaire π qui **contient d** et qui soit **sécant à α** — le choix ' +
              'concret dépend des données du problème.',
            'Déterminer la droite b, commune aux plans π et α.',
            'Le point cherché, s\'il existe, est l\'intersection des droites d et b — un problème ' +
              '2D, puisque d et b sont désormais coplanaires dans π.',
          ],
        },
        { kind: 'subheading', text: 'Intersection de deux plans' },
        {
          kind: 'para',
          text:
            'Trouver la droite commune à deux plans sécants revient, symétriquement, à repérer ' +
            'deux points distincts communs aux deux plans.',
        },
        {
          kind: 'methode',
          label: '2 méthodes',
          items: [
            'Repérer **deux points distincts** dont on peut montrer qu\'ils appartiennent chacun ' +
              'aux deux plans — ce qui revient parfois à chercher les points de percée de deux ' +
              'droites d\'un même plan dans l\'autre plan.',
            'Repérer **un point commun** aux deux plans, puis la direction de la droite ' +
              'd\'intersection en s\'appuyant sur les propriétés connues de la figure ' +
              '(parallélisme, symétrie…).',
          ],
        },
      ],
    },

    {
      id: 'section',
      number: 9,
      title: "Section plane d'un solide",
      kicker: 'chaque face traversée fournit exactement 2 sommets de la section',
      blocks: [
        {
          kind: 'para',
          text:
            'Couper un solide convexe par un plan transversal (qui ne touche aucun sommet ' +
            'exactement) donne toujours **un unique polygone fermé** — jamais deux morceaux ' +
            'séparés. Chaque face réellement traversée y contribue **exactement deux sommets** : ' +
            'le tracé du plan de coupe sur une face convexe la traverse en exactement deux points, ' +
            'jamais un ni trois.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'solidCavaliere',
            size: 'large',
            sectionPolygon: {
              points: [
                { x: 70, y: 140 },
                { x: 170, y: 105 },
                { x: 205.36, y: 104.64 },
                { x: 105.36, y: 139.64 },
              ],
            },
            freePoints: [
              { x: 70, y: 140, label: 'P', tone: 'accent' },
              { x: 170, y: 105, label: 'Q', tone: 'accent' },
              { x: 205.36, y: 104.64, label: 'R', tone: 'accent' },
              { x: 105.36, y: 139.64, label: 'S', tone: 'accent' },
            ],
            caption: '4 arêtes verticales traversées → 4 points de section P, Q, R, S → un unique polygone fermé',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode — 2 coups possibles, répétés jusqu\'à fermeture',
          items: [
            '**Segment direct** — dès qu\'une face a ses **2** points de section déjà connus, on ' +
              'peut relier ces deux points : c\'est un côté du polygone de section.',
            '**Point auxiliaire** — quand plus aucune face n\'a ses 2 points connus, on prolonge ' +
              'deux droites coplanaires du solide (arêtes, diagonales, ou segments déjà tracés de ' +
              'la section) jusqu\'à leur intersection ; ce nouveau point auxiliaire permet de ' +
              'débloquer une face encore à moitié connue.',
            'On répète jusqu\'à ce que **tous les côtés attendus** du polygone soient tracés — la ' +
              'fermeture complète.',
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central — un seul point connu ne suffit jamais',
          text:
            'Tenter de tracer directement le segment de section d\'une face qui n\'a **qu\'un ' +
            'seul** point de section connu est l\'erreur la plus fréquente de cet exercice : il ' +
            'faut toujours les deux points de la même face avant de pouvoir relier.',
        },
        {
          kind: 'exemple',
          badge: '4 faces traversées',
          formula:
            'P (face avant) et Q (face avant) sont déjà connus au départ, ainsi que R (face ' +
            'droite). La face arrière et la face gauche n\'ont encore qu\'un seul point connu ' +
            'chacune (R et P respectivement).',
          steps: [
            { tag: '1 — segment direct', text: 'la face avant a ses 2 points connus (P et Q) → on trace [PQ].' },
            {
              tag: '2 — plus de segment direct disponible',
              text: 'aucune autre face n\'a encore 2 points connus (la face droite n\'a que R, l\'arrière n\'a que R, la gauche n\'a que P).',
            },
            {
              tag: '3 — point auxiliaire',
              text:
                'on prolonge deux droites du solide jusqu\'à leur intersection : le point obtenu, ' +
                'une fois relié à R, tombe exactement sur le point de section manquant de la face ' +
                'arrière — le nouveau point S est trouvé.',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              'les 4 côtés [PQ], [QR], [RS] et [SP] ferment le polygone de section — chaque face ' +
              'traversée y a bien contribué exactement 2 sommets.',
          },
        },
        {
          kind: 'rappel',
          label: 'Une autre construction classique, par parallèles',
          items: [
            'Sur un **parallélépipède**, une deuxième technique construit le même point auxiliaire ' +
              'autrement, en s\'appuyant sur le parallélisme des faces opposées : par le point déjà ' +
              'connu sur la face opposée, on mène la parallèle au premier côté déjà tracé de la ' +
              'section — elle coupe l\'arête cherchée exactement où il faut. Les deux méthodes ' +
              '(point auxiliaire par intersection, ou construction par parallèle) mènent toujours ' +
              'au même point ; seule la seconde exploite spécifiquement les faces parallèles d\'un ' +
              'parallélépipède, quand la première fonctionne aussi sur un tétraèdre.',
          ],
        },
        {
          kind: 'entrainement',
          title: "Section plane d'un solide",
          generatorId: 'gen40',
          description: [
            'Reconstruis progressivement le polygone de section d\'un solide en perspective ' +
              'cavalière, un point ou un segment à la fois — segment direct dès que 2 points ' +
              'd\'une face sont connus, sinon construction d\'un point auxiliaire.',
          ],
          chantier: '4e',
          whereLabel: "4e → « 40. Section plane d'un solide »",
        },
      ],
    },

    {
      id: 'fenetre-durer',
      number: 10,
      title: 'La fenêtre de Dürer : le dispositif de la perspective centrale',
      kicker: 'vision monoculaire à travers une vitre quadrillée — un cadre inventé par Dürer',
      blocks: [
        {
          kind: 'para',
          text:
            'Les règles de la perspective centrale ont été élaborées par des peintres de la ' +
            'Renaissance à l\'aide d\'un **perspectographe**, un dispositif inventé par le peintre ' +
            'allemand Dürer. Sa « fenêtre de Dürer » (1471-1528) est composée d\'un cadre en bois ' +
            'et d\'une vitre quadrillée, placée devant la scène à représenter.',
        },
        {
          kind: 'para',
          text:
            'Le peintre regarde la scène à travers un « œilleton », en fermant un œil : sa vision ' +
            'est donc **monoculaire** — ce qu\'il peint ne correspond jamais tout à fait à ce que ' +
            'perçoivent normalement ses deux yeux ensemble (la vision binoculaire).',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 340,
            height: 200,
            lines: [
              { points: [{ x: 20, y: 100 }, { x: 280, y: 48 }], tone: 'accent' },
              { points: [{ x: 20, y: 100 }, { x: 280, y: 152 }], tone: 'accent' },
              { points: [{ x: 140, y: 60 }, { x: 140, y: 140 }], tone: 'ink' },
              { points: [{ x: 200, y: 64 }, { x: 200, y: 136 }], tone: 'good' },
              { points: [{ x: 280, y: 48 }, { x: 280, y: 152 }], tone: 'bad' },
            ],
            points: [{ x: 20, y: 100, tone: 'ink' }],
            freeLabels: [
              { x: 8, y: 116, text: 'œil', tone: 'ink' },
              { x: 128, y: 50, text: 'vitre', tone: 'ink' },
              { x: 172, y: 150, text: 'objet proche', tone: 'good' },
              { x: 255, y: 168, text: 'objet éloigné', tone: 'bad' },
            ],
            caption:
              'un objet proche et petit (vert) et un objet éloigné et grand (rouge) traversent la ' +
              'vitre exactement au même endroit — d\'où la même taille apparente à travers la fenêtre',
          },
        },
        {
          kind: 'para',
          text:
            'Après avoir repéré où les lignes de vision, issues de l\'œil, coupent le quadrillage ' +
            'de la vitre, le peintre reporte ce qu\'il voit sur une feuille quadrillée identique — ' +
            'c\'est là toute la méthode. Le mot « perspective » vient d\'ailleurs du latin ' +
            '**perspectiva**, qui signifie « voir au travers ».',
        },
        {
          kind: 'piege',
          label: 'Une vision volontairement appauvrie',
          text:
            'En fermant un œil, le peintre renonce à la vision binoculaire (celle des deux yeux ' +
            'ensemble, qui perçoit un peu de relief) — un choix nécessaire pour que toute la ' +
            'scène se projette de façon cohérente sur une seule vitre plane.',
        },
        {
          kind: 'para',
          text:
            'L\'image qui se forme à travers l\'objectif d\'un appareil photo suit le même ' +
            'principe que celle qui se forme sur la rétine de l\'œil — pas tout à fait la même, ' +
            'puisque le globe oculaire est sphérique et non plan. Les règles de la perspective ' +
            'centrale s\'observent donc directement sur une photographie.',
        },
      ],
    },

    {
      id: 'point-de-fuite',
      number: 11,
      title: 'Point de fuite et construction en perspective centrale',
      kicker: 'toutes les parallèles d\'un plan horizontal convergent vers un point, sur la ligne d\'horizon',
      blocks: [
        {
          kind: 'para',
          text:
            'La **ligne d\'horizon** d\'une image (peinture ou photo) se situe à la hauteur de ' +
            'l\'œil du peintre, ou de l\'objectif de l\'appareil photo.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 340,
            height: 180,
            lines: [
              { points: [{ x: 10, y: 160 }, { x: 170, y: 70 }], tone: 'ink' },
              { points: [{ x: 330, y: 160 }, { x: 170, y: 70 }], tone: 'ink' },
              { points: [{ x: 50, y: 160 }, { x: 170, y: 70 }], tone: 'faint', dashed: true },
              { points: [{ x: 290, y: 160 }, { x: 170, y: 70 }], tone: 'faint', dashed: true },
              { points: [{ x: 0, y: 70 }, { x: 340, y: 70 }], tone: 'faint', dashed: true },
            ],
            points: [{ x: 170, y: 70, tone: 'accent' }],
            freeLabels: [
              { x: 130, y: 50, text: 'point de fuite', tone: 'accent' },
              { x: 128, y: 88, text: "ligne d'horizon", tone: 'ink' },
            ],
            caption:
              'en perspective centrale, des rails pourtant parallèles dans la réalité convergent ' +
              'visuellement vers un seul point',
          },
        },
        {
          kind: 'para',
          text:
            'Toutes les droites parallèles situées dans un même plan horizontal se coupent en un ' +
            'même point de cette ligne, appelé **point de fuite** — un point qu\'on peut imaginer ' +
            '« à l\'infini », comme le point de concours commun à toute une famille de parallèles.',
        },
        {
          kind: 'para',
          text:
            'Les procédés de construction découlent directement de ce principe, combiné aux ' +
            'propriétés déjà connues des plans, des droites et des figures planes — en particulier ' +
            'celles du trapèze.',
        },
        {
          kind: 'methode',
          label: 'Exemple de construction — le toit d\'une maison',
          items: [
            'Tracer d\'abord le parallélépipède de la maison en perspective à point de fuite, ' +
              'comme n\'importe quel solide.',
            'Sur la face avant (le pignon), tracer les deux diagonales du rectangle : leur ' +
              'intersection donne l\'axe vertical sur lequel se trouve le sommet du toit.',
            'Placer le sommet du toit sur cette verticale, à la hauteur voulue — les deux pans ' +
              'du toit rejoignent alors ce sommet depuis les arêtes du faîtage.',
          ],
        },
        {
          kind: 'attention',
          label: 'Deux perspectives, deux résultats différents',
          text:
            'Un même solide dessiné en perspective cavalière et en perspective à point de fuite ' +
            'ne donne jamais le même dessin : la première conserve le parallélisme des arêtes ' +
            '(deux arêtes parallèles le restent sur le papier), la seconde ne le fait jamais — ' +
            'les arêtes parallèles convergent vers leur point de fuite commun.',
        },
      ],
    },

    {
      id: 'ombre',
      number: 12,
      title: 'Ombre au soleil — projection parallèle',
      kicker: 'la direction n\'est jamais donnée en nombres — seulement par un exemple déjà résolu',
      blocks: [
        {
          kind: 'para',
          text:
            'Le soleil éclaire selon une **direction fixe**, jamais montrée numériquement : elle ' +
            'doit être identifiée depuis un exemple déjà résolu (un point et son ombre déjà ' +
            'connue), affiché sur le même dessin. Une fois cette direction retrouvée, projeter ' +
            'n\'importe quel autre point suit toujours le même raisonnement en 4 temps.',
        },
        {
          kind: 'methode',
          label: 'Méthode — 4 temps',
          items: [
            'Identifier la direction du soleil depuis l\'exemple déjà résolu (le point et son ' +
              'ombre connue).',
            'Pour chaque point à projeter, tracer la droite parallèle à cette direction.',
            'Trouver où cette droite rencontre le sol — ou un solide-obstacle placé avant le sol.',
            'Relier les points-ombres trouvés entre eux pour reconstituer l\'ombre complète de ' +
              'l\'objet.',
          ],
        },
        { kind: 'subheading', text: 'Le piège central — confondre la verticale et la vraie direction oblique' },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'planeSketch',
              width: 120,
              height: 110,
              lines: [{ points: [{ x: 22, y: 22 }, { x: 92, y: 88 }], tone: 'good', arrow: true }],
              freeLabels: [{ x: 72, y: 30, text: '✓', tone: 'good' }],
              caption: 'direction correcte — oblique, vers le bas',
            },
            {
              kind: 'planeSketch',
              width: 120,
              height: 110,
              lines: [{ points: [{ x: 57, y: 18 }, { x: 57, y: 90 }], tone: 'bad', arrow: true }],
              freeLabels: [{ x: 72, y: 30, text: '✗', tone: 'bad' }],
              caption: 'piège — verticale (projection orthogonale)',
            },
            {
              kind: 'planeSketch',
              width: 120,
              height: 110,
              lines: [{ points: [{ x: 92, y: 88 }, { x: 22, y: 22 }], tone: 'bad', arrow: true }],
              freeLabels: [{ x: 72, y: 30, text: '✗', tone: 'bad' }],
              caption: 'piège — même droite, sens opposé',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Le sens compte, pas seulement la direction',
          text:
            'Une direction de sens **opposé** à la vraie direction du soleil reste ' +
            'mathématiquement parallèle à elle — mais projette l\'ombre du mauvais côté du piquet ' +
            ': elle est rejetée exactement comme la confusion verticale. Contrairement à un simple ' +
            'test de parallélisme, la vérification ici est **sensible au sens**, jamais seulement à ' +
            'la direction.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 400,
            height: 220,
            planes: [
              { points: [{ x: 50, y: 190 }, { x: 270, y: 190 }, { x: 347.78, y: 112.22 }, { x: 127.78, y: 112.22 }], style: 'ground' },
            ],
            lines: [
              { points: [{ x: 141.21, y: 168.79 }, { x: 224.14, y: 175.86 }], tone: 'ink' },
              { points: [{ x: 141.21, y: 168.79 }, { x: 141.21, y: 78.79 }], tone: 'ink' },
              { points: [{ x: 224.14, y: 175.86 }, { x: 224.14, y: 120.86 }], tone: 'ink' },
              { points: [{ x: 141.21, y: 78.79 }, { x: 232.43, y: 147.57 }], tone: 'accent', arrow: true },
              { points: [{ x: 224.14, y: 120.86 }, { x: 279.89, y: 162.89 }], tone: 'accent', arrow: true },
              { points: [{ x: 232.43, y: 147.57 }, { x: 279.89, y: 162.89 }], tone: 'good', dashed: true },
            ],
            points: [
              { x: 141.21, y: 168.79, tone: 'ink' },
              { x: 224.14, y: 175.86, tone: 'ink' },
              { x: 141.21, y: 78.79, tone: 'ink' },
              { x: 224.14, y: 120.86, tone: 'ink' },
              { x: 232.43, y: 147.57, tone: 'good' },
              { x: 279.89, y: 162.89, tone: 'good' },
            ],
            freeLabels: [
              { x: 105, y: 68, text: 'piquet 1', tone: 'ink' },
              { x: 196, y: 112, text: 'piquet 2', tone: 'ink' },
              { x: 216, y: 185, text: 'ombre reconstituée', tone: 'good' },
            ],
            caption:
              'même direction pour les deux piquets → deux points-ombres → reliés (vert), ils ' +
              'reconstituent l\'ombre complète de la barre',
          },
        },
        {
          kind: 'exemple',
          badge: 'objet à 2 points',
          formula: 'Une barre rigide relie le sommet de deux piquets plantés dans le sol. Reconstituer son ombre complète.',
          steps: [
            { tag: '1 — direction', text: 'identifiée depuis l\'exemple déjà résolu affiché sur le même dessin.' },
            {
              tag: '2 — piquet 1',
              text: 'droite parallèle à la direction du soleil depuis le sommet du piquet 1 → rencontre le sol au premier point-ombre.',
            },
            { tag: '3 — piquet 2', text: 'même construction, même direction, depuis le sommet du piquet 2 → second point-ombre.' },
          ],
          result: {
            tag: '4 — reconstitution',
            text: 'le segment reliant les deux points-ombres est l\'ombre complète de la barre — jamais l\'ombre de chaque piquet prise isolément.',
          },
        },
        {
          kind: 'astuce',
          label: '3 variantes du même raisonnement',
          text: 'Le même raisonnement en 4 temps se décline en 3 variantes, selon les données de l\'énoncé.',
          items: [
            '**Un seul piquet, sol plat** — un seul point à projeter, sélection directe.',
            '**Avec obstacles** — la direction n\'est confirmée qu\'une seule fois pour toute la ' +
              'scène ; l\'ombre peut ensuite « casser » sur un à trois solides-obstacles avant ' +
              'd\'atteindre le sol.',
            '**Direction inconnue** — la direction elle-même doit d\'abord être déduite d\'un ' +
              'sommet réel du solide et de son ombre déjà connue, avant de projeter les autres ' +
              'sommets.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Ombre au soleil',
          generatorId: 'gen41',
          description: [
            'Retrouve la direction de la lumière depuis un exemple déjà résolu, puis projette un ' +
              'ou plusieurs points pour reconstituer une ombre — au sol, ou en la faisant casser ' +
              'sur des solides-obstacles.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 41. Ombre au soleil »',
        },
      ],
    },

    {
      id: 'revision',
      number: 13,
      title: 'Révision — quiz vrai/faux',
      kicker: '60 affirmations en 3 thèmes',
      blocks: [
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre transversalement les trois générateurs de ce chapitre — ' +
            'un thème par générateur, sans fusion. Contrairement au chapitre sur les droites et ' +
            'cercles du plan, aucune affirmation ne porte sur une coordonnée numérique précise : ' +
            'les trois générateurs d\'origine ne montrent eux-mêmes jamais de coordonnées 3D à ' +
            'l\'élève, donc les affirmations testent les définitions et le raisonnement ' +
            'géométrique, jamais un calcul chiffré.',
        },
      ],
    },
  ],

  recap: {
    items: [
      'Perspective cavalière — x et z à l\'échelle réelle, y en diagonale à 45° réduit de moitié ; ' +
        'jamais de longueur en profondeur lue à la règle sur le dessin. La perspective centrale ' +
        '(point de fuite) est plus réaliste mais ne conserve pas le parallélisme — inutilisable à ' +
        'main levée.',
      'Déterminer un plan — 3 points non alignés, ou une droite + un point extérieur, ou 2 ' +
        'droites sécantes, ou 2 droites parallèles distinctes : 4 façons équivalentes, jamais une ' +
        'équation.',
      'Deux droites — sécantes ou parallèles (toujours coplanaires), ou **gauches** (aucun plan ' +
        'commun) — un troisième cas impossible dans le plan.',
      'Position droite/plan — 3 questions dans l\'ordre (les 2 points dans le plan ? direction ' +
        'parallèle au plan ? sinon sécante) ; le plan reste toujours infini, jamais borné au ' +
        'solide dessiné.',
      'Deux plans — parallèles, ou sécants suivant une droite entière (jamais un point isolé) ; ' +
        'trois plans sécants deux à deux donnent 3 droites sécantes en un point ou parallèles ' +
        'entre elles.',
      'Parallélisme — toujours ramené à une comparaison de directions (droite ∥ droite d\'un ' +
        'plan ; 2 droites sécantes d\'un plan ∥ 2 droites sécantes de l\'autre).',
      'Point de percée — construire un plan auxiliaire contenant la droite, sécant au plan cible ' +
        '; le point cherché devient une intersection 2D dans ce plan auxiliaire.',
      'Section plane — un solide convexe coupé donne toujours un unique polygone fermé ; chaque ' +
        'face traversée fournit exactement 2 sommets ; segment direct si 2 points connus sur une ' +
        'face, sinon construction d\'un point auxiliaire par intersection de deux droites ' +
        'coplanaires (ou, sur un parallélépipède, par une parallèle).',
      'Perspective centrale — un dispositif (la fenêtre de Dürer, vision monoculaire à travers ' +
        'une vitre quadrillée) puis un principe (toutes les parallèles d\'un même plan horizontal ' +
        'convergent vers un point de fuite, sur la ligne d\'horizon) ; contrairement à la ' +
        'cavalière, ne conserve jamais le parallélisme des arêtes.',
      'Ombre au soleil — direction jamais donnée en nombres, déduite d\'un exemple déjà résolu ; ' +
        'projection oblique, jamais verticale ; sensible au sens, pas seulement à la direction ; ' +
        'relier les points-ombres pour reconstituer l\'ombre complète.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        'Ai-je bien vérifié les 2 points de la droite avant de conclure à une inclusion ?',
        'Deux droites qui ne se croisent pas sur mon dessin sont-elles vraiment parallèles, ou ' +
          'simplement gauches ?',
        'Ai-je confondu la projection verticale avec la vraie direction oblique du soleil ?',
        'Ai-je tenté un segment direct sur une face qui n\'avait qu\'un seul point de section ' +
          'connu ?',
        'Le point d\'intersection que j\'ai trouvé peut-il légitimement tomber en dehors du ' +
          'solide dessiné ?',
      ],
    },
    forward:
      'Un même réflexe traverse tout le chapitre : ramener une question 3D à une comparaison de ' +
      'directions ou à une intersection 2D dans un plan bien choisi — identifier la position ' +
      'relative avant tout calcul, décomposer une construction complexe en étapes vérifiables une ' +
      'à une, et ne jamais confondre l\'intuition visuelle avec la vraie propriété géométrique.',
    entrainement: {
      kind: 'entrainement',
      title: "Géométrie dans l'espace — quiz vrai/faux",
      generatorId: 'gen66',
      description: [
        '60 affirmations pré-écrites réparties en 3 thèmes (20 par thème) qui reprennent ce ' +
          'chapitre. Un seul essai par question, la justification est toujours révélée.',
      ],
      chantier: '4e',
      whereLabel: "4e → « 66. Géométrie dans l'espace — quiz vrai/faux »",
    },
  },
}
