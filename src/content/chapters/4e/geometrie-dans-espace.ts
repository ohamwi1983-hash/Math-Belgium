import type { ChapterContent } from '../../types'

export const geometrieDansEspace: ChapterContent = {
  level: '4e',
  levelSlug: '4e',
  chapterNumber: 8,
  title: "Géométrie dans l'espace",
  slug: 'geometrie-dans-espace',
  lede:
    "Un solide a trois dimensions. Une feuille de papier n'en a que deux. Il faut donc d'abord " +
    "apprendre à **dessiner** un solide, avant de pouvoir raisonner dessus. Ce chapitre commence " +
    "par la perspective cavalière : la convention qui te permet de dessiner un cube ou un prisme " +
    "sur papier, sans fausser sa lecture. Tu apprends ensuite le vocabulaire de base de la " +
    "géométrie dans l'espace : déterminer un plan, situer deux droites ou deux plans l'un par " +
    "rapport à l'autre, reconnaître un parallélisme, construire un point de percée. Tu utilises " +
    "enfin tout ça pour répondre à trois questions concrètes : où se situe une droite par " +
    "rapport à un plan ? quelle forme a la section d'un solide coupé par un plan ? comment " +
    "reconstituer l'ombre d'un objet éclairé de travers ? Contrairement au chapitre sur les " +
    "droites et les cercles du plan, il n'y a ici aucune coordonnée numérique. Tout se lit et se " +
    "justifie directement sur le dessin — jamais par un calcul chiffré.",

  sections: [
    {
      id: 'cavaliere',
      number: 1,
      title: 'Perspective cavalière — dessiner un solide en 3D',
      kicker: 'x à l\'horizontale, z à la verticale, y en profondeur à 45° et réduit de moitié',
      titreCourt: 'Perspective cavalière',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Perspective cavalière : l\'axe x reste horizontal et l\'axe z vertical, en vraie grandeur ; l\'axe y (la profondeur) se trace à 45° et réduit de moitié.',
        'La face avant se dessine en vraie grandeur, les fuyantes sont parallèles et de même longueur ; les faces qui contiennent la profondeur deviennent des parallélogrammes, et les arêtes cachées se tracent en pointillés.',
      ],
      cartes: [
        { question: 'Comment dessine-t-on une profondeur de 4 cm ?', reponse: 'Par une fuyante à 45°, de 2 cm : la moitié de la profondeur réelle.' },
        { question: 'Quelles faces d\'un pavé gardent leur vraie forme sur le dessin ?', reponse: 'Seules les faces avant et arrière.' },
        { question: 'Comment trace-t-on une arête cachée ?', reponse: 'En pointillés.' },
        { question: 'Une longueur en profondeur se lit-elle directement sur le dessin ?', reponse: 'Non : elle paraît deux fois plus courte qu\'en réalité.' },
      ],
      blocks: [
        { kind: 'video', title: 'Perspective cavalière — dessiner un solide en 3D', youtubeId: 'hMaTBZeqAiA' },
        {
          kind: 'para',
          text:
            "Un solide a trois dimensions. Une feuille de papier n'en a que deux. La " +
            '**perspective cavalière** résout ce problème. C\'est une convention simple, utilisée ' +
            "pour tous les dessins de ce chapitre. L'axe x reste horizontal, à l'échelle réelle. " +
            "L'axe z (la hauteur) reste vertical, à l'échelle réelle. L'axe y (la profondeur, ce " +
            'qui « rentre » dans la feuille) part en diagonale à 45°, mais **réduit de moitié**. ' +
            'Sans cette réduction, un cube semblerait étiré vers l\'arrière !',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi une convention, et pas juste dessiner ce qu\'on voit ?',
          text:
            'Une photo ou ton œil font déjà de la perspective tout seuls, sans qu\'on y pense : ' +
            'les objets lointains paraissent plus petits, les lignes parallèles semblent se ' +
            'resserrer au loin. Mais un dessin technique n\'a pas ce luxe — il doit rester ' +
            '**lisible et comparable** d\'un exercice à l\'autre, avec des angles et des longueurs ' +
            'qui suivent toujours la même règle. C\'est tout le rôle de la perspective cavalière : ' +
            'une convention fixée une fois pour toutes, pas un effet visuel qu\'on improvise à ' +
            'chaque dessin.',
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'solidCavaliere',
            size: 'large',
            showAxes: true,
            caption:
              'le sommet arrière-bas-gauche est caché derrière le solide. Ses 3 arêtes se ' +
              'tracent en pointillé — jamais en trait plein',
          },
        },
        {
          kind: 'attention',
          label: 'Une longueur en profondeur ne se lit jamais sur le dessin',
          text:
            "À cause de la réduction de moitié, un segment porté par l'axe y paraît deux fois " +
            'plus court qu\'il ne l\'est réellement ! Une face qui contient la direction y (le ' +
            'dessus, le dessous, les côtés) se dessine même comme un parallélogramme — jamais comme ' +
            "un rectangle. Seules les faces avant et arrière gardent leur vraie forme. C'est pourquoi aucun " +
            "exercice de ce chapitre ne te demande de mesurer une longueur à la règle sur le " +
            'croquis. Tu raisonnes toujours sur les **sommets nommés** et sur leurs relations ' +
            '(appartenance, parallélisme, intersection) — jamais sur une distance lue à l\'œil.',
        },
        {
          kind: 'atelier',
          tag: 'cavaliere-reglage-widget',
          label: 'Manipule toi-même : régler la perspective cavalière',
          caption:
            'Change l\'angle de fuite et le coefficient de réduction des fuyantes : la face ' +
            'avant reste en vraie grandeur, les faces du dessus et des côtés deviennent des ' +
            'parallélogrammes, et l\'arête fuyante [BC] n\'est dessinée qu\'à k fois sa vraie ' +
            'longueur. Avec k = 1, le cube paraît étiré vers l\'arrière ; la convention du ' +
            'cours est 45° et 0,5.',
        },
        {
          kind: 'methode',
          label: 'Méthode — dessiner un solide en perspective cavalière',
          items: [
            'Dessine la **face avant** en vraie grandeur : ses largeurs restent horizontales, ses ' +
              'hauteurs verticales.',
            'Depuis chaque sommet de la face avant, trace une **fuyante** : à 45° de l\'horizontale, ' +
              'vers la droite et vers le haut, de longueur **la moitié** de la profondeur réelle. ' +
              'Une profondeur de 4 cm se dessine donc avec une fuyante de 2 cm.',
            'Mesure cette longueur à la règle, **le long de la fuyante** : le bout d\'une fuyante ne ' +
              'tombe jamais sur un nœud du quadrillage. Compter « un carreau en diagonale » par ' +
              'centimètre ne réduit pas de moitié, car la diagonale d\'un carreau mesure environ 1,4 cm.',
            'Relie les sommets arrière : toutes les fuyantes sont parallèles et de même longueur, et ' +
              'la face arrière est superposable à la face avant.',
            'Pour une pyramide droite, le pied de la hauteur est le centre de la base, au croisement ' +
              'de ses diagonales ; la hauteur est verticale, donc en vraie grandeur.',
            'Trace en **pointillés** les arêtes cachées : celles que ne borde aucune face vue.',
          ],
        },
        {
          kind: 'application',
          titre: 'Comment un jeu vidéo 3D dessine un monde sur ton écran plat',
          illustrations: [
            {
              kind: 'planeSketch',
              width: 320,
              height: 200,
              lines: [
                { points: [{ x: 40, y: 100 }, { x: 280, y: 60 }], tone: 'accent', dashed: true, arrow: true },
                { points: [{ x: 140, y: 40 }, { x: 140, y: 160 }], tone: 'ink' },
              ],
              points: [
                { x: 40, y: 100, label: 'caméra virtuelle', tone: 'ink', labelDy: 18 },
                { x: 280, y: 60, label: 'sommet 3D', tone: 'accent', labelDx: -90, labelDy: -10 },
                { x: 140, y: 83.33, label: 'pixel projeté', tone: 'good', labelDx: -8, labelDy: -10 },
              ],
              freeLabels: [{ x: 140, y: 30, text: 'écran (plan de projection)', tone: 'ink' }],
              caption:
                'Le moteur trace une droite de la caméra vers chaque sommet 3D et calcule le ' +
                "pixel où cette droite traverse le plan de l'écran — une règle fixe, répétée " +
                'pour tous les sommets de tous les objets : c\'est la perspective centrale des ' +
                'sections 10 et 11.',
            },
          ],
          text:
            "Un écran d'ordinateur ou de téléphone est plat, mais les jeux vidéo en 3D " +
            'affichent des mondes qui ont une vraie profondeur — exactement le même problème ' +
            'que cette section. Le moteur du jeu résout ce problème avec une **caméra ' +
            'virtuelle** : il calcule, pour chaque sommet d\'un objet 3D, où cette caméra ' +
            '« voit » ce sommet sur un plan de projection, selon des règles de perspective ' +
            'fixées une fois pour toutes dans le moteur (position de la caméra, angle de vue, ' +
            'distance de projection). Tous les rayons partent d\'un même point, l\'œil de la ' +
            'caméra : c\'est la **perspective centrale** des sections 10 et 11, et non la ' +
            'cavalière, où l\'on projette parallèlement. Dans les deux cas, une règle fixe et ' +
            'systématique, appliquée des millions de fois par seconde à chaque sommet de chaque ' +
            'objet 3D du jeu, transforme un monde en trois dimensions en une image plate.',
          domaines: ['Informatique', 'Jeux vidéo'],
        },
        {
          kind: 'para',
          text:
            'Trois familles de solides reviennent dans ce chapitre. Le **parallélépipède** et le ' +
            '**cube** (un cas particulier du parallélépipède). Le **prisme** : deux faces ' +
            'parallèles et superposables, reliées par des rectangles. Le **tétraèdre** : quatre ' +
            'sommets, quatre faces triangulaires. Chaque solide est toujours dessiné avec les ' +
            'mêmes coordonnées de référence. Seuls les éléments qu\'on choisit dessus (un plan, ' +
            'une droite, des points de section) changent d\'un exercice à l\'autre.',
        },
        { kind: 'subheading', text: 'Une autre convention : la perspective centrale' },
        {
          kind: 'para',
          text:
            "La perspective cavalière n'est pas la seule façon de dessiner l'espace. Les peintres " +
            'de la Renaissance ont inventé la **perspective centrale** : les droites qui ' +
            's\'éloignent de l\'observateur (les **fuyantes**) semblent converger vers un **point de ' +
            'fuite**, comme les rails d\'une voie ferrée. Plus fidèle à l\'œil, elle est aussi plus ' +
            'lourde à construire : tu la découvres aux sections 10 et 11. Tous les autres dessins ' +
            'du chapitre restent en cavalière, qui conserve le parallélisme de **toutes** les ' +
            'droites — la perspective centrale ne le conserve que pour les droites parallèles à ' +
            'la vitre, comme les verticales.',
        },
        {
          kind: 'historique',
          titre: 'Un seul homme a donné son nom à toute cette discipline',
          text:
            'Représenter un solide à trois dimensions sur une feuille plane — exactement ce ' +
            'que fait la perspective cavalière de cette section — est le sujet d\'une ' +
            'discipline mathématique à part entière : la **géométrie descriptive**, fondée en ' +
            '1795 par le Français **Gaspard Monge**. Avant lui, les techniques de ' +
            'représentation (plans d\'architecte, dessins d\'ingénieur, perspectives de ' +
            'peintre) restaient des savoir-faire empiriques, transmis d\'atelier en atelier, ' +
            'sans théorie commune. Monge les unifie en un système rigoureux — reposant sur ' +
            'deux projections perpendiculaires d\'un même objet — si utile aux fortifications ' +
            'que l\'École du génie de Mézières, où Monge l\'enseigne, la tient secrète pendant ' +
            'des années. Elle n\'est enseignée publiquement qu\'en 1795. Monge devient ' +
            'l\'un des fondateurs de l\'École polytechnique, où la géométrie descriptive ' +
            'reste enseignée pendant près de deux siècles.',
          image: {
            src: '/images/historique/monge.jpg',
            alt: 'Portrait de Gaspard Monge',
            caption: 'Gaspard Monge (1746–1818), fondateur de la géométrie descriptive.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Dessiner en perspective cavalière',
          generatorId: 'gen104',
          description: [
            'Termine sur un quadrillage le dessin d\'un pavé, d\'un prisme droit ou d\'une pyramide ' +
              'dont tu connais les dimensions réelles : place les sommets arrière au bout de fuyantes ' +
              'à 45° réduites de moitié (ou le sommet de la pyramide), puis trace les arêtes cachées ' +
              'en pointillés.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 104. Dessiner en perspective cavalière »',
        },
        {
          kind: 'entrainement',
          title: 'Lire un solide en perspective : vocabulaire et positions',
          generatorId: 'gen133',
          description: [
            'Sur un cube, un pavé, un prisme ou un tétraèdre dessiné en perspective cavalière, lis le ' +
              'dessin d\'un coup d\'œil : faces en vraie grandeur ou déformées, arêtes cachées, vraie ' +
              'longueur d\'une fuyante ; points nommés d\'un plan ; paires de droites sécantes, parallèles ' +
              'ou gauches.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 133. Lire un solide en perspective : vocabulaire et positions »',
        },
      ],
    },

    {
      id: 'determiner-plan',
      number: 2,
      title: 'Déterminer un plan',
      kicker: "4 façons équivalentes de fixer un plan, sans jamais en donner l'équation",
      titreCourt: 'Déterminer un plan',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Un plan est déterminé par trois points **non alignés**, une droite et un point **hors** de cette droite, deux droites **sécantes**, ou deux droites **parallèles** distinctes.',
        'Trois points alignés ne fixent aucun plan : une infinité de plans passent par la droite qui les porte. Deux droites gauches n\'ont aucun plan commun.',
      ],
      cartes: [
        { question: 'Quelles sont les 4 façons de déterminer un plan ?', reponse: 'Trois points non alignés ; une droite et un point hors d\'elle ; deux droites sécantes ; deux droites parallèles distinctes.' },
        { question: 'Trois points alignés déterminent-ils un plan ?', reponse: 'Non : une infinité de plans passent par la droite qui les porte.' },
        { question: 'Comment désigne-t-on le plus souvent un plan ?', reponse: 'Par trois de ses points : « le plan (ABC) ».' },
      ],
      blocks: [
        { kind: 'video', title: 'Déterminer un plan et positions de deux droites', youtubeId: 'azPMOAl2FD4' },
        {
          kind: 'para',
          text:
            'Une droite est fixée par un point et une direction. Un plan, lui, est fixé par une ' +
            'donnée minimale : toujours l\'une de ces 4 formes. Jamais une équation à trois ' +
            'inconnues dans ce chapitre !',
        },
        {
          kind: 'intuition',
          label: 'Pourquoi 3 points, et pas 2 ?',
          text:
            'Deux points suffisent à fixer une droite. Mais autour de cette seule droite, une ' +
            'infinité de plans peuvent encore pivoter — comme les pages d\'un livre qui tournent ' +
            'toutes autour de sa reliure. Un troisième point, à condition qu\'il ne soit **pas** ' +
            'sur cette droite, immobilise un seul de ces plans. C\'est exactement pourquoi un ' +
            'tabouret à 3 pieds n\'est jamais bancal, quel que soit le sol, alors qu\'un tabouret à 4 ' +
            'pieds peut se mettre à vaciller si un seul pied est un peu plus court que les autres.',
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
          kind: 'attention',
          label: 'Ce qui ne détermine pas un plan',
          text:
            'Trois points **alignés** ne fixent aucun plan : une infinité de plans passent par la ' +
            'droite qui les porte. Deux droites **gauches** non plus : aucun plan ne les contient ' +
            'toutes les deux (section 3).',
        },
        {
          kind: 'atelier',
          tag: 'livre-plans-widget',
          label: 'Manipule toi-même : le livre de plans',
          caption:
            'Une droite d, la reliure, et un plan qui pivote autour d\'elle comme une page. Ajoute un ' +
            'point hors de d : un seul plan le contient, la page s\'immobilise. Un point sur d n\'arrête ' +
            'rien. En mode « Deux droites », la page s\'arrête sur le plan commun de deux droites ' +
            'sécantes ou parallèles ; avec deux droites gauches, elle ne contient jamais la seconde.',
        },
        {
          kind: 'rappel',
          label: 'À retenir',
          items: [
            "Comme dans le plan, une droite de l'espace reste déterminée par 2 points distincts. " +
              'Un plan se désigne le plus souvent par 3 de ses points : « le plan (ABC) ». Plus ' +
              'rarement, on le désigne par une lettre grecque (α, β, π…). Tout théorème de ' +
              'géométrie plane que tu connais déjà reste vrai à l\'intérieur d\'un plan de ' +
              'l\'espace. Un plan de l\'espace n\'est jamais qu\'une copie du plan habituel, ' +
              'posée quelque part en 3D.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Ces données déterminent-elles un plan ?',
          generatorId: 'gen100',
          description: [
            'Sur un solide en perspective cavalière, décide si trois points, une droite et un point, ou ' +
              'deux droites déterminent un plan — puis nomme ce plan, ou explique pourquoi il n\'existe ' +
              'pas ou n\'est pas unique.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 100. Positions de deux droites et plan déterminé »',
        },
        {
          kind: 'entrainement',
          title: 'Points d\'un plan sur un solide',
          generatorId: 'gen133',
          description: [
            'Variante « Points d\'un plan » : un plan est nommé par trois points d\'un solide en ' +
              'perspective cavalière. Coche tous les autres points nommés qui lui appartiennent — un ' +
              'sommet sur une parallèle, un milieu d\'arête — sans te laisser tromper par le dessin.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 133. Lire un solide en perspective : vocabulaire et positions »',
        },
      ],
    },

    {
      id: 'deux-droites',
      number: 3,
      title: 'Positions de deux droites : sécantes, parallèles ou gauches',
      kicker: 'une troisième possibilité, impossible dans le plan : les droites gauches',
      titreCourt: 'Positions de deux droites',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Deux droites distinctes de l\'espace sont soit **coplanaires** (parallèles ou sécantes), soit **gauches** : aucun plan ne les contient toutes les deux.',
        'Deux droites parallèles sont toujours coplanaires. Deux droites qui se croisent sur le dessin ne sont pas forcément sécantes.',
        'Pour prouver que deux droites sont gauches : montrer qu\'elles ne sont ni sécantes, ni parallèles — souvent, l\'une perce un plan qui contient l\'autre en un point qui n\'est pas sur l\'autre.',
      ],
      cartes: [
        { question: 'Que veut dire « deux droites gauches » ?', reponse: 'Aucun plan ne les contient toutes les deux : elles ne sont ni sécantes, ni parallèles.' },
        { question: 'Deux droites parallèles peuvent-elles ne pas être coplanaires ?', reponse: 'Non : deux droites parallèles sont toujours coplanaires.' },
        { question: 'Dans le cube ABCDEFGH, quelle est la position de (AB) et (CG) ?', reponse: 'Gauches : (CG) perce la base (ABC) au seul point C, qui n\'est pas sur (AB), et elles ne sont pas parallèles.' },
        { question: 'Deux droites se croisent sur le dessin : sont-elles sécantes ?', reponse: 'Pas forcément : en perspective, des droites gauches semblent souvent se couper.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Dans le plan, deux droites distinctes sont toujours soit sécantes, soit parallèles. ' +
            'Dans l\'espace, une troisième situation apparaît — impossible sur une seule feuille : ' +
            'deux droites peuvent n\'avoir **aucun plan commun**. On dit alors qu\'elles sont ' +
            '**gauches**. Elles ne sont ni sécantes ni parallèles : elles ne se croisent jamais, ' +
            'et elles ne sont jamais parallèles non plus.',
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser des droites gauches',
          text:
            'Imagine deux avions qui volent à des altitudes différentes, sur des trajectoires qui, ' +
            'vues d\'en haut sur une carte, semblent se croiser. Dans les airs, ils ne se ' +
            'percutent jamais : ils n\'ont ni point commun, ni la moindre direction commune. ' +
            'C\'est exactement ça, deux droites **gauches** — une situation qui n\'existe tout ' +
            'simplement pas sur une feuille de papier, en géométrie plane.',
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
            'Deux droites distinctes de l\'espace sont soit **coplanaires** (dans ce cas, soit ' +
              'parallèles, soit sécantes), soit **gauches**. Deux droites parallèles sont ' +
              '**toujours** coplanaires ! Même quand elles semblent appartenir à deux faces ' +
              'différentes du solide, comme (AB) et (HG) ci-dessus.',
          ],
        },
        {
          kind: 'rappel',
          label: "Pourquoi ce cas n'existe pas dans le plan",
          items: [
            "Sur une feuille, deux droites tracées appartiennent forcément à cette même feuille " +
              '— donc à un même plan. « Gauches » n\'a de sens qu\'en trois dimensions. Regarde ' +
              '(AB) et (CG) ci-dessus : l\'une est portée par la base, l\'autre grimpe ' +
              'verticalement à l\'arrière du cube. Elles ne partagent ni point, ni direction, ni ' +
              'plan.',
          ],
        },
        {
          kind: 'methode',
          label: 'Prouver que deux droites sont gauches',
          items: [
            'Montre qu\'elles ne sont **ni sécantes, ni parallèles**.',
            'Technique classique : l\'une des droites perce un plan qui contient l\'autre en un ' +
              'seul point — et ce point n\'est pas sur l\'autre droite.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — (AB) et (CG) sont gauches',
          blocks: [
            { kind: 'para', text: 'Dans le cube $ABCDEFGH$, on montre que $(AB)$ et $(CG)$ ne sont **ni sécantes, ni parallèles**.' },
            { kind: 'para', text: '**Pas sécantes.** $(AB)$ est dans le plan de la base $(ABC)$. $(CG)$ n\'y est pas incluse, car $G$ ' +
              'n\'est pas dans la base ; elle a pourtant le point $C$ dans ce plan : elle perce donc $(ABC)$ ' +
              'au seul point $C$. Un point commun à $(AB)$ et $(CG)$ serait dans $(ABC)$ et sur $(CG)$ : ce ' +
              'serait $C$. Or $C$ n\'est pas sur $(AB)$. Les deux droites n\'ont donc aucun point commun.' },
            { kind: 'para', text: '**Pas parallèles.** $ABCD$ est un carré : la parallèle à $(AB)$ menée par $C$ est $(CD)$. Par ' +
              'unicité, c\'est la seule ; or $(CG)$ est une autre droite passant par $C$. Elle n\'est donc pas ' +
              'parallèle à $(AB)$.' },
            { kind: 'para', text: 'Ni sécantes, ni parallèles : $(AB)$ et $(CG)$ sont **gauches**.' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'positions-cube-widget',
          label: 'Manipule toi-même : positions dans le cube',
          caption:
            'Choisis deux droites, ou une droite et un plan (section 4), par leurs points ' +
            'nommés : l\'atelier donne leur position et la justifie, comme dans le cours. Le ' +
            'point de percée peut tomber hors du solide : le plan est infini. Fais tourner ' +
            'le cube pour vérifier — deux droites gauches peuvent sembler se croiser sur le ' +
            'dessin. En mode Défi, réponds d\'après la vue cavalière en un seul essai, puis ' +
            'tourne le cube pour contrôler.',
        },
        {
          kind: 'methode',
          label: 'Méthode — deux droites sur un solide dessiné',
          items: [
            'Cherche un plan qui contient les **quatre** points qui nomment les deux droites. ' +
              'S\'il n\'en existe aucun, les droites sont **gauches**.',
            'S\'il en existe un, regarde dans ce plan : même direction → **parallèles** ; sinon → ' +
              '**sécantes**. Leur point commun peut être un point nommé, un point d\'une face ou ' +
              'même un point situé **hors** du solide : prolonge les droites, le plan est infini.',
            'Deux droites qui se croisent **sur le dessin** ne sont pas forcément sécantes : en ' +
              'perspective, des droites gauches semblent souvent se couper.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Ces données déterminent-elles un plan ?',
          items: [
            'Un seul plan : trois points **non alignés** ; une droite et un point **hors** de cette ' +
              'droite ; deux droites **sécantes** ; deux droites **parallèles** distinctes.',
            'Une infinité de plans : trois points **alignés** ; une droite et un point **situé sur** ' +
              'cette droite — comme les pages d\'un livre autour de sa reliure.',
            'Aucun plan : deux droites **gauches**.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Positions de deux droites et plan déterminé',
          generatorId: 'gen100',
          description: [
            'Sur un solide en perspective cavalière (cube, parallélépipède, prisme, pyramide ou ' +
              'tétraèdre), trouve le plan commun à deux droites, décide si elles sont sécantes, ' +
              'parallèles ou gauches et justifie-le. Ou décide si trois points, une droite et un ' +
              'point, ou deux droites déterminent un plan — puis nomme-le, ou explique pourquoi.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 100. Positions de deux droites et plan déterminé »',
        },
      ],
    },

    {
      id: 'position',
      number: 4,
      title: "Position d'une droite par rapport à un plan",
      kicker: 'incluse, parallèle ou sécante — 3 questions, toujours dans le même ordre',
      titreCourt: 'Droite et plan',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Trois questions, dans cet ordre : les 2 points de la droite sont-ils dans le plan (**incluse**) ? Sinon, la droite est-elle parallèle à une droite du plan (**parallèle**) ? Sinon, elle est **sécante**.',
        'Le plan est toujours infini : le point d\'intersection peut tomber sur un sommet, à l\'intérieur d\'une arête ou en dehors du solide dessiné.',
      ],
      cartes: [
        { question: 'Quelles sont les trois positions possibles d\'une droite par rapport à un plan ?', reponse: 'Incluse, parallèle ou sécante.' },
        { question: 'Dans le cube ABCDEFGH, position de (AB) par rapport au plan (EFGH) ?', reponse: 'Parallèle : (AB) est parallèle à (EF), une droite du plan.' },
        { question: 'Dans le même cube, position de (AG) par rapport au plan (EFGH) ?', reponse: 'Sécante, au sommet G.' },
        { question: 'Le point d\'intersection doit-il tomber sur le solide dessiné ?', reponse: 'Non : le plan est infini, le point peut tomber en dehors du solide.' },
      ],
      blocks: [
        { kind: 'video', title: 'Position d\'une droite par rapport à un plan et positions de deux plans', youtubeId: 'FFn-DPGPEZE' },
        {
          kind: 'para',
          text:
            'Un plan est désigné par **3 points nommés** du solide, le plus souvent des sommets. ' +
            'Une droite est désignée par **2 points nommés** : deux sommets, ou un sommet et un point ' +
            'nommé sur une arête (comme le milieu I d\'une arête). Jamais par une équation. La question posée a toujours exactement une des ' +
            'trois réponses suivantes — jamais une quatrième. La droite est **incluse** dans le ' +
            'plan. Ou elle est **parallèle** au plan, sans y être incluse. Ou elle est ' +
            '**sécante** au plan : elle le coupe en un point unique.',
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
            'Sinon, pose la question suivante : la droite est-elle parallèle à **une droite du ' +
              'plan** (critère de la section 7) ? Si oui → **parallèle**. Elle ne rencontre jamais ' +
              'le plan.',
            'Sinon → **sécante**. Le plan est toujours considéré **infini** — jamais limité aux ' +
              'arêtes dessinées du solide. La droite le coupe donc en un point unique. Ce point ' +
              'peut tomber exactement sur un sommet nommé, à l\'intérieur d\'une arête, ou même ' +
              'en dehors du solide dessiné.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'positions-cube-widget',
          label: 'Manipule toi-même : une droite et un plan dans le cube',
          caption:
            'Choisis le mode « Droite et plan », puis une droite et un plan par leurs points nommés : ' +
            'l\'atelier pose les 3 questions du cours dans l\'ordre et donne la position. Le point de percée ' +
            'peut tomber hors du solide : fais tourner le cube pour le voir. Le mode Défi te fait répondre ' +
            'd\'après la vue cavalière, en un seul essai.',
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
            'Plan (EFGH) — la face supérieure. Droite (AG) — la grande diagonale du cube. Quelle ' +
            'est la position de (AG) par rapport à (EFGH) ?',
          steps: [
            {
              tag: 'question 1 — inclusion',
              text: 'A appartient-il à (EFGH) ? Non : A est un sommet de la base. Donc pas d\'inclusion.',
            },
            {
              tag: 'question 2 — un point commun',
              text:
                'G appartient à la fois à (AG) et à (EFGH). Une droite qui a un point commun avec ' +
                'un plan, sans y être incluse, ne peut pas lui être parallèle.',
            },
          ],
          result: {
            tag: 'conclusion',
            text: '(AG) est donc sécante à (EFGH). L\'intersection tombe exactement sur le sommet G, déjà nommé sur le solide.',
          },
        },
        {
          kind: 'exemple',
          badge: 'une droite parallèle au plan',
          formula: 'Dans le même cube, quelle est la position de (AB) par rapport à (EFGH) ?',
          steps: [
            { tag: 'question 1 — inclusion', text: 'A et B sont sur la base, pas sur (EFGH) : pas d\'inclusion.' },
            { tag: 'question 2 — parallélisme', text: '(AB) est parallèle à (EF) (ABFE est un carré), et (EF) est une droite du plan (EFGH).' },
          ],
          result: { tag: 'conclusion', text: '(AB) est parallèle à (EFGH) : elle ne le rencontre jamais.' },
        },
        {
          kind: 'piege',
          label: 'Le plan dessiné n\'est qu\'un extrait du vrai plan, infini',
          text:
            'Le plan reste toujours infini, même si le dessin ne montre que la face du solide qui ' +
            'le porte ! Une droite peut donc être sécante en un point situé **en dehors** du ' +
            'solide dessiné, ou à l\'intérieur d\'une arête — pas seulement en un sommet.',
        },
        {
          kind: 'entrainement',
          title: "Position d'une droite par rapport à un plan",
          generatorId: 'gen39',
          description: [
            'Classe la position d\'une droite par rapport à un plan, sur un solide en perspective ' +
              'cavalière (parallélépipède, cube ou prisme). Justifie ensuite ton choix selon le cas ' +
              'trouvé : sommets du plan, droite parallèle, ou point d\'intersection — qui peut tomber ' +
              'sur un point nommé d\'une arête.',
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
      kicker: 'parallèles (ou confondus), ou sécants suivant une droite — jamais un point isolé',
      titreCourt: 'Positions de deux plans',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Deux plans distincts sont **parallèles** (aucun point commun) ou **sécants** : leur intersection est alors toujours une droite entière, jamais un point isolé. Deux noms peuvent aussi désigner le même plan : les plans sont alors **confondus**.',
        'Si un plan coupe deux plans parallèles, les deux droites d\'intersection sont parallèles ; et toute droite qui coupe l\'un de deux plans parallèles coupe l\'autre.',
      ],
      cartes: [
        { question: 'Deux plans sécants peuvent-ils n\'avoir qu\'un seul point commun ?', reponse: 'Non : leur intersection est toujours une droite entière.' },
        { question: 'Le plan (ACGE) coupe les faces opposées (ABCD) et (EFGH) du cube : que dire de (AC) et (EG) ?', reponse: 'Elles sont parallèles.' },
        { question: 'I milieu de [AE], J milieu de [BF] : position des plans (ABJ) et (EFI) ?', reponse: 'Confondus : c\'est le plan de la face ABFE.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Deux plans sont soit **parallèles** (aucun point commun), soit **sécants** — ou ' +
            '**confondus** : deux noms pour un même plan. S\'ils sont sécants, leur intersection n\'est jamais un point isolé : ' +
            'c\'est toujours une **droite entière**. Dès que deux plans distincts partagent ' +
            'ne serait-ce qu\'un seul point commun, ils partagent en réalité toute une droite qui ' +
            'passe par ce point.',
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
          kind: 'exempleLibre',
          label: 'Démonstration par l\'absurde — la propriété 1',
          blocks: [
            {
              kind: 'para',
              text:
                'On raisonne **par l\'absurde** : on suppose le contraire de ce qu\'on veut prouver, ' +
                'et on aboutit à une contradiction. La supposition était donc fausse.',
            },
            {
              kind: 'para',
              text:
                'Soit α et α′ deux plans parallèles, et π un plan qui les coupe suivant d et d′. Les ' +
                'droites d et d′ sont toutes les deux dans π : elles sont coplanaires, donc sécantes ' +
                'ou parallèles.',
            },
            {
              kind: 'para',
              text:
                'Supposons-les sécantes en un point M. M est sur d, donc dans α ; M est sur d′, donc ' +
                'dans α′. Les plans α et α′ auraient un point commun — impossible, ils sont ' +
                'parallèles. La supposition est fausse : d et d′ sont **parallèles**.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la propriété 2',
          blocks: [
            { kind: 'para', text: 'Soit $\\alpha$ et $\\alpha\'$ deux plans parallèles (aucun point commun), et $d$ une droite qui ' +
              'coupe $\\alpha$ en un seul point $A$. Le point $A$ n\'est pas dans $\\alpha\'$ : $d$ n\'est donc pas ' +
              'incluse dans $\\alpha\'$. Il reste à montrer qu\'elle rencontre $\\alpha\'$.' },
            { kind: 'para', text: 'Supposons le contraire : $d$ n\'a aucun point commun avec $\\alpha\'$. Prenons un point $B$ de ' +
              '$\\alpha\'$ et le plan $\\pi$ déterminé par $d$ et $B$. Il coupe $\\alpha\'$ (en $B$) sans être ' +
              'confondu avec lui (il contient $A$) : il le coupe suivant une droite $d\'$. De même, il coupe ' +
              '$\\alpha$ suivant une droite $d\'\'$ qui passe par $A$. Par la propriété 1, $d\'\' \\parallel d\'$.' },
            { kind: 'para', text: 'Dans le plan $\\pi$, les droites $d$ et $d\'$ sont coplanaires ; elles n\'ont aucun point commun, ' +
              'puisque $d\'$ est dans $\\alpha\'$ : elles sont parallèles. Les droites $d$ et $d\'\'$ passent ' +
              'donc toutes les deux par $A$ et sont parallèles à $d\'$ : par unicité, $d = d\'\'$, et $d$ serait ' +
              'incluse dans $\\alpha$.' },
            { kind: 'para', text: 'C\'est impossible : $d$ coupe $\\alpha$ en un seul point. La supposition est fausse : $d$ coupe ' +
              'aussi $\\alpha\'$, en un seul point.' },
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux plans parallèles coupés par un troisième',
          formula: 'Dans le cube, le plan (ACGE) coupe la base (ABCD) et la face (EFGH). Que dire de (AC) et de (EG) ?',
          steps: [
            { tag: 'deux plans parallèles', text: '(ABCD) et (EFGH) sont deux faces opposées du cube' },
            { tag: 'les intersections', text: '(ACGE) coupe (ABCD) suivant (AC), et (EFGH) suivant (EG)' },
          ],
          result: { tag: 'résultat', text: '(AC) ∥ (EG), par la propriété 1' },
        },
        {
          kind: 'methode',
          label: 'Méthode — deux plans nommés par leurs points',
          items: [
            'Les trois points qui nomment le second plan sont-ils tous dans le premier ? Si oui, les ' +
              'deux noms désignent le **même plan** : les plans sont **confondus**.',
            'Sinon, cherche **un point commun** : un point nommé qui appartient aux deux plans, ou le ' +
              'point de rencontre d\'une droite de chaque plan **tracées dans une même face**. S\'il en ' +
              'existe un, les plans sont **sécants**. Un second point commun donne leur droite ' +
              'd\'intersection (section 8).',
            'S\'il n\'y en a aucun, vérifie le critère de la section 7 : deux droites **sécantes** du ' +
              'premier plan, parallèles à deux droites du second. Les plans sont alors **parallèles**.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'deux-plans-cube-widget',
          label: 'Manipule toi-même : deux plans dans le cube',
          caption:
            'Nomme deux plans par trois points chacun (sommets, milieux, centres). L\'atelier dit s\'ils ' +
            'sont confondus, parallèles ou sécants ; s\'ils sont sécants, il trace leur droite commune et ' +
            'construit ses points dans une même face, à la rencontre des traces des deux plans. Fais ' +
            'tourner le cube : deux morceaux de plans qui ne se touchent pas peuvent être sécants.',
        },
        {
          kind: 'piege',
          label: 'Deux morceaux de plans qui ne se touchent pas',
          text:
            'Sur le dessin, un plan n\'est représenté que par un morceau : une face, ou le triangle de ' +
            'ses trois points. Deux morceaux qui ne se touchent pas peuvent très bien appartenir à ' +
            'des plans **sécants** : leur droite d\'intersection passe ailleurs, parfois même hors du ' +
            'solide. À l\'inverse, deux noms sans aucune lettre commune peuvent désigner le **même** plan.',
        },
        {
          kind: 'exemple',
          badge: 'deux noms pour un même plan',
          formula: 'Dans le cube ABCDEFGH, I est le milieu de [AE] et J celui de [BF]. Quelle est la position des plans (ABJ) et (EFI) ?',
          steps: [
            { tag: 'les points de (EFI)', text: 'E et F sont des sommets de la face ABFE ; I est sur l\'arête [AE], donc lui aussi dans cette face' },
            { tag: 'les points de (ABJ)', text: 'A et B sont des sommets de la face ABFE, et J est sur l\'arête [BF]' },
          ],
          result: { tag: 'conclusion', text: 'E, F et I, non alignés, sont dans le plan (ABJ) : les plans (ABJ) et (EFI) sont confondus — c\'est la face ABFE' },
        },
        {
          kind: 'entrainement',
          title: 'Positions de deux plans',
          generatorId: 'gen101',
          description: [
            'Sur un solide en perspective cavalière, décide si deux plans nommés par leurs points sont ' +
              'parallèles, confondus ou sécants — trouve alors deux points communs, parfois construits ' +
              'dans une même face —, puis justifie ta réponse.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 101. Positions de deux plans et de trois plans »',
        },
        {
          kind: 'entrainement',
          title: 'Intersection de deux plans par parallélisme',
          generatorId: 'gen134',
          description: [
            'Un plan (PQR) coupe une face d\'un cube ou d\'un pavé suivant [PQ] : construis son ' +
              'intersection avec la face opposée par la parallèle à (PQ), grâce à la propriété 1. ' +
              'Autre variante : deux plans qui contiennent des droites parallèles — un point commun, ' +
              'la direction, puis la droite d\'intersection.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 134. Intersection de deux plans par parallélisme »',
        },
      ],
    },

    {
      id: 'trois-plans',
      number: 6,
      title: 'Positions de trois plans',
      kicker: 'droites d\'intersection sécantes en un point, parallèles, ou confondues',
      titreCourt: 'Trois plans',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Trois plans sécants deux à deux : leurs droites d\'intersection sont **sécantes en un même point**, **parallèles**, ou **confondues** — jamais quelconques.',
        'Méthode : la droite d\'intersection d de deux des plans, puis la position de d par rapport au troisième — elle le perce (un seul point commun), y est incluse (une droite commune) ou lui est parallèle (aucun point commun).',
      ],
      cartes: [
        { question: 'Quels sont les trois cas pour trois plans sécants deux à deux ?', reponse: 'Droites d\'intersection sécantes en un point (le coin d\'une pièce), parallèles (le Toblerone) ou confondues (les pages d\'un livre).' },
        { question: 'Deux des trois plans sont parallèles : combien de points communs aux trois ?', reponse: 'Aucun.' },
        { question: 'Les plans (ABC), (ABF) et (DCF) du cube ont-ils un point commun ?', reponse: 'Non : (AB) est parallèle à (DCF) sans y être incluse.' },
      ],
      blocks: [
        { kind: 'video', title: 'Trois plans, critères de parallélisme et point de percée', youtubeId: 'k6hI1gqH1Eo' },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text:
            'Pense au coin de ta chambre : le sol et deux murs se rencontrent **en un seul ' +
            'point**, l\'angle de la pièce — c\'est le premier cas. Le deuxième, ce sont les ' +
            'trois faces d\'une barre de Toblerone (un prisme triangulaire) : elles se coupent deux ' +
            'à deux suivant trois arêtes **parallèles**. Le troisième, ce sont les pages d\'un ' +
            'livre ouvert : elles passent toutes par **la même droite**, la reliure.',
        },
        {
          kind: 'para',
          text:
            'Si trois plans distincts sont sécants deux à deux, les droites d\'intersection ' +
            'obtenues ne sont jamais quelconques. Elles sont soit toutes les trois **sécantes en ' +
            'un même point**, soit toutes les trois **parallèles entre elles**, soit **confondues** : ' +
            'les trois plans ont alors une droite commune.',
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
              caption: 'parallèles entre elles (prisme)',
            },
            {
              kind: 'planeSketch',
              width: 150,
              height: 110,
              planes: [
                { points: [{ x: 75, y: 15 }, { x: 75, y: 100 }, { x: 18, y: 88 }, { x: 18, y: 27 }], style: 'plan' },
                { points: [{ x: 75, y: 15 }, { x: 75, y: 100 }, { x: 132, y: 92 }, { x: 132, y: 31 }], style: 'plan' },
                { points: [{ x: 75, y: 15 }, { x: 75, y: 100 }, { x: 104, y: 106 }, { x: 104, y: 21 }], style: 'planDashed' },
              ],
              lines: [{ points: [{ x: 75, y: 10 }, { x: 75, y: 105 }], tone: 'accent' }],
              caption: 'une droite commune (livre ouvert)',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'trois-plans-widget',
          label: 'Manipule toi-même : trois plans',
          caption:
            'Trois plans sécants deux à deux se coupent suivant des droites qui ne sont ' +
            'jamais quelconques : elles passent par un même point (le coin d\'une pièce), ou ' +
            'elles sont parallèles (les faces d\'une barre de Toblerone), ou elles sont ' +
            'confondues (les pages d\'un livre ouvert). Fais tourner chaque scène pour bien ' +
            'voir, et compare avec deux plans parallèles coupés par un troisième.',
        },
        {
          kind: 'methode',
          label: 'Méthode — combien de points communs ont trois plans ?',
          items: [
            'Prends deux des trois plans. S\'ils sont **parallèles**, les trois plans n\'ont **aucun ' +
              'point commun**.',
            'Sinon, détermine leur droite d\'intersection d : deux points communs suffisent.',
            'Étudie la position de d par rapport au troisième plan (section 4). Si d le perce : **un ' +
              'seul point commun**. Si d y est incluse : **une droite commune**. Si d lui est parallèle ' +
              'sans y être incluse : **aucun point commun** — c\'est le Toblerone.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les droites d\'intersection de trois plans',
          blocks: [
            { kind: 'para', text: 'Soit $\\alpha$, $\\beta$ et $\\gamma$ trois plans distincts, sécants deux à deux. Appelons $d$ la ' +
              'droite commune à $\\alpha$ et $\\beta$, et étudions sa position par rapport à $\\gamma$ : elle le ' +
              'perce, elle y est incluse, ou elle lui est parallèle.' },
            { kind: 'para', text: '**Premier cas** : $d$ perce $\\gamma$ en un point $M$. Ce point est dans $\\alpha$, $\\beta$ et $\\gamma$ : les droites ' +
              'communes à $\\alpha$ et $\\gamma$, puis à $\\beta$ et $\\gamma$, passent toutes les deux par $M$. ' +
              'Les trois droites d\'intersection sont **concourantes** en $M$.' },
            { kind: 'para', text: '**Deuxième cas** : $d$ est incluse dans $\\gamma$. Elle est alors commune à $\\alpha$ et $\\gamma$ ; or deux plans ' +
              'sécants n\'ont qu\'une droite commune : c\'est $d$. De même pour $\\beta$ et $\\gamma$. Les trois ' +
              'droites sont **confondues**.' },
            { kind: 'para', text: '**Troisième cas** : $d$ est parallèle à $\\gamma$ (aucun point commun). La droite $e$ commune à $\\alpha$ et ' +
              '$\\gamma$ est, comme $d$, dans $\\alpha$ ; elle est dans $\\gamma$, que $d$ ne rencontre pas : ' +
              '$d$ et $e$ sont coplanaires sans point commun, donc parallèles. De même, la droite $f$ commune à ' +
              '$\\beta$ et $\\gamma$ est parallèle à $d$. Enfin $e$ et $f$ sont dans $\\gamma$ ; un point commun ' +
              'à $e$ et $f$ serait dans $\\alpha$ et $\\beta$, donc sur $d$ — impossible. Les trois droites ' +
              'sont **parallèles**.' },
          ],
        },
        {
          kind: 'exemple',
          badge: 'trois plans du cube sans point commun',
          formula: 'Dans le cube ABCDEFGH, les plans (ABC), (ABF) et (DCF) ont-ils un point commun ?',
          steps: [
            { tag: 'deux des plans', text: '(ABC) et (ABF) se coupent suivant (AB)' },
            {
              tag: 'position par rapport au troisième',
              text: '(DCF) est le plan DCFE. (AB) est parallèle à (DC), une droite de ce plan, et A n\'y est pas : (AB) est parallèle à (DCF) sans y être incluse',
            },
          ],
          result: { tag: 'conclusion', text: 'aucun point commun : les trois plans se coupent deux à deux suivant (AB), (DC) et (EF), trois droites parallèles — le Toblerone' },
        },
        {
          kind: 'entrainement',
          title: 'Positions de deux plans et de trois plans',
          generatorId: 'gen101',
          description: [
            'Sur un solide en perspective cavalière, décide si deux plans sont parallèles, confondus ' +
              'ou sécants — trouve alors deux points communs, parfois construits — ou si trois plans ont ' +
              'un seul point commun, une droite commune ou aucun point commun. Justifie ensuite ta réponse.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 101. Positions de deux plans et de trois plans »',
        },
        {
          kind: 'entrainement',
          title: 'Réalité ou illusion ?',
          generatorId: 'gen135',
          description: [
            'Un solide dessiné en perspective cavalière, faces supposées planes : peut-il exister ? ' +
              'Repère les trois plans en jeu, prolonge ses arêtes latérales sur le dessin, puis conclus ' +
              'avec le théorème des trois plans : leurs droites d\'intersection doivent être concourantes ou parallèles.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 135. Réalité ou illusion ? »',
        },
      ],
    },

    {
      id: 'parallelisme',
      number: 7,
      title: "Critères de parallélisme dans l'espace",
      kicker: '3 critères à connaître, chacun ramène à une comparaison de directions',
      titreCourt: 'Critères de parallélisme',
      partie: 'Dessiner l\'espace, positionner droites et plans',
      essentiel: [
        'Une droite parallèle à **une droite d\'un plan** est parallèle à ce plan ou incluse dans celui-ci ; deux plans sont parallèles si deux droites **sécantes** du premier sont parallèles à deux droites du second.',
        'Par un point, il ne passe qu\'une seule parallèle à une droite donnée. Prouver un parallélisme, c\'est toujours le prouver entre deux **droites**, dans une figure plane (parallélogramme, droite des milieux).',
      ],
      cartes: [
        { question: 'Quand une droite est-elle parallèle à un plan ?', reponse: 'Quand elle est parallèle à une droite de ce plan sans être incluse dans le plan.' },
        { question: 'Quand deux plans sont-ils parallèles ?', reponse: 'Quand deux droites sécantes du premier sont parallèles à deux droites du second.' },
        { question: 'Tétraèdre ABCD, I et J milieux de [DA] et [DB] : pourquoi (IJ) est-elle parallèle au plan (ABC) ?', reponse: 'Par la droite des milieux, (IJ) est parallèle à (AB), une droite du plan (ABC).' },
        { question: 'Deux droites sans point commun sont-elles forcément parallèles ?', reponse: 'Non : elles peuvent être gauches.' },
      ],
      blocks: [
        {
          kind: 'methode',
          label: '3 critères',
          items: [
            '**Unicité** — par un point donné de l\'espace, il ne passe qu\'**une seule** droite ' +
              'parallèle à une droite donnée.',
            '**Droite ∥ plan** — si une droite est parallèle à **une droite d\'un plan**, elle est ' +
              'parallèle à ce plan ou incluse dans celui-ci. Si l\'un de ses points n\'est pas dans le ' +
              'plan, elle lui est donc parallèle : c\'est le cas « parallèle » de la section 4.',
            '**Plan ∥ plan** — deux plans sont parallèles si deux droites sécantes du premier ' +
              'sont parallèles à deux droites du second.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Toujours ramener à une comparaison de directions',
          text:
            'Les trois critères partagent la même logique. Prouver un parallélisme dans ' +
            'l\'espace, c\'est toujours prouver un parallélisme entre deux **droites** ! Ce n\'est ' +
            'jamais un parallélisme « au jugé » entre deux plans entiers : un plan ne se compare ' +
            'à un autre qu\'à travers les droites qu\'il contient.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le critère de parallélisme d\'une droite et d\'un plan',
          blocks: [
            { kind: 'para', text: 'Soit $d$ une droite parallèle à une droite $d\'$ du plan $\\alpha$, et non incluse dans ' +
              '$\\alpha$. On montre que $d$ n\'a aucun point commun avec $\\alpha$.' },
            { kind: 'para', text: '$d$ n\'est pas incluse dans $\\alpha$, donc $d \\neq d\'$. Deux droites parallèles distinctes ' +
              'déterminent un plan $\\beta$. Ce plan contient $d\'$, donc il a des points communs avec ' +
              '$\\alpha$ ; il n\'est pas confondu avec $\\alpha$, puisqu\'il contient $d$. Les plans $\\alpha$ et ' +
              '$\\beta$ sont donc sécants, suivant la droite $d\'$.' },
            { kind: 'para', text: 'Supposons que $d$ rencontre $\\alpha$ en un point $M$. $M$ est sur $d$, donc dans $\\beta$ ; il est ' +
              'aussi dans $\\alpha$ : il est sur leur droite commune $d\'$. Les droites $d$ et $d\'$ auraient ' +
              'le point commun $M$ — impossible, elles sont parallèles et distinctes.' },
            { kind: 'para', text: 'La supposition est fausse : $d$ n\'a aucun point commun avec $\\alpha$, elle lui est ' +
              '**parallèle**.' },
          ],
        },
        {
          kind: 'exemple',
          badge: 'deux plans parallèles dans le cube',
          formula: 'Montre que les plans (AFH) et (BDG) sont parallèles.',
          steps: [
            { tag: '1re paire', text: '(FH) ∥ (BD) : BDHF est un rectangle' },
            { tag: '2e paire', text: '(AF) ∥ (DG) : ADGF est un rectangle' },
            { tag: 'deux droites sécantes', text: '(FH) et (AF) se coupent en F, dans le plan (AFH)' },
          ],
          result: { tag: 'résultat', text: 'deux droites sécantes de (AFH) sont parallèles à deux droites de (BDG) : les plans sont parallèles' },
        },
        {
          kind: 'methode',
          label: "Justifier que deux droites de l'espace sont parallèles",
          items: [
            'Cherche une **figure plane** qui contient les deux droites : une face du solide, un plan ' +
              'diagonal, un triangle. Dans ce plan, utilise une propriété de géométrie plane.',
            '**Côtés opposés d\'un parallélogramme** (rectangle, carré) : dans le cube, $ABFE$ est un ' +
              'carré, donc $(AB) \\parallel (EF)$ ; $BDHF$ est un rectangle, donc $(BD) \\parallel (FH)$.',
            '**Droite des milieux** : dans un triangle, la droite qui joint les milieux de deux côtés est ' +
              'parallèle au troisième côté.',
            '**Milieux de deux côtés opposés d\'un parallélogramme** : la droite qui les joint est ' +
              'parallèle aux deux autres côtés.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'une droite parallèle à un plan',
          formula:
            'Dans le tétraèdre $ABCD$, $I$ est le milieu de $[DA]$ et $J$ celui de $[DB]$. Montre que la ' +
            'droite $(IJ)$ est parallèle au plan $(ABC)$.',
          steps: [
            { tag: 'critère', text: 'il suffit de trouver une droite du plan $(ABC)$ parallèle à $(IJ)$' },
            { tag: 'droite témoin', text: '$(AB)$, dont les deux points nomment le plan $(ABC)$' },
            { tag: 'justification', text: 'dans le triangle $DAB$, $I$ et $J$ sont les milieux de $[DA]$ et $[DB]$ : la droite des milieux $(IJ)$ est parallèle à $(AB)$' },
          ],
          result: { tag: 'conclusion', text: '$(IJ)$ est parallèle à $(AB)$, une droite du plan $(ABC)$ : la droite $(IJ)$ est parallèle au plan $(ABC)$' },
        },
        {
          kind: 'attention',
          label: 'La droite témoin doit être DANS le plan',
          text:
            'Une droite parallèle à $(IJ)$ ne prouve rien si elle n\'est pas une droite du plan : elle ' +
            'pourrait le percer. Et « aucun point commun » ou « dans deux faces parallèles » ne prouve ' +
            'jamais que deux droites sont parallèles : elles pourraient être gauches.',
        },
        {
          kind: 'atelier',
          tag: 'droite-temoin-widget',
          label: 'Manipule toi-même : la droite témoin',
          caption:
            'Choisis une droite et un plan : les droites du cube parallèles à la droite s\'allument. En vert, ' +
            'celles qui sont dans le plan, les vraies témoins ; en rouge pointillé, celles qui sont hors ' +
            'du plan et ne prouvent rien. En mode « Deux plans », il faut deux témoins sécantes pour ' +
            'conclure que les plans sont parallèles.',
        },
        {
          kind: 'entrainement',
          title: 'Démontrer un parallélisme',
          generatorId: 'gen103',
          description: [
            'Sur un solide en perspective cavalière, démontre qu\'une droite est parallèle à un plan, ou que ' +
              'deux plans sont parallèles : choisis le critère du cours, la ou les droites témoins, puis ' +
              'justifie chaque parallélisme (rectangle, parallélogramme, droite des milieux).',
            'Variante « Trois points alignés » : sur une pyramide SABC, démontre que trois points I, J, K ' +
              'sont alignés parce qu\'ils sont communs à deux plans sécants, donc sur leur droite ' +
              'd\'intersection ; dans le cas particulier d\'un côté parallèle à la base, conclus par le ' +
              'théorème du toit.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 103. Démontrer un parallélisme »',
        },
      ],
    },

    {
      id: 'percee',
      number: 8,
      title: 'Point de percée et intersection de deux plans',
      kicker: 'un plan auxiliaire pour ramener un problème 3D à une intersection 2D',
      titreCourt: 'Point de percée',
      partie: 'Constructions sur un solide',
      essentiel: [
        'Point de percée de d dans α : un plan auxiliaire π qui contient d et coupe α, la droite b commune à π et α, puis l\'intersection de d et b, coplanaires dans π.',
        'Intersection de deux plans sécants : deux points distincts communs aux deux plans, ou un point commun et la direction de la droite (théorème du toit : parallèle aux deux droites parallèles que contiennent les plans).',
      ],
      cartes: [
        { question: 'Quelles conditions doit remplir le plan auxiliaire π ?', reponse: 'Il contient la droite d et il est sécant au plan α.' },
        { question: 'À quoi le plan auxiliaire ramène-t-il le problème ?', reponse: 'À l\'intersection de deux droites coplanaires : d et la droite b commune à π et α.' },
        { question: 'Que faut-il pour trouver la droite d\'intersection de deux plans ?', reponse: 'Deux points distincts communs aux deux plans.' },
        { question: 'Quelle est l\'intersection des plans (ACGE) et (BDHF) du cube ?', reponse: 'La droite (OO′), qui joint le centre O de ABCD et le centre O′ de EFGH.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Trouver où une droite d traverse un plan α — son **point de percée** — n\'est en ' +
            'général pas direct sur le dessin. La méthode classique construit un **plan ' +
            'auxiliaire** π. On le choisit pour qu\'il contienne d, tout en étant sécant à α. La ' +
            'droite commune à π et à α ramène alors le problème à une simple intersection de deux ' +
            'droites coplanaires.',
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
              // Déplacé sous le point et vers la gauche (était 90,150, puis 122,128 avant ça) :
              // à 90,150 le texte était traversé par la droite d (qui se termine en 118,150) et
              // frôlé par l'extrémité gauche de b (68,140) — constaté à l'écran. En 35,172, le
              // texte passe sous les deux extrémités de droites, dans la marge basse du cadre.
              { x: 35, y: 172, text: 'point de percée', tone: 'ink' },
            ],
            caption:
              'π contient d et coupe α suivant b. Le point de percée cherché est l\'intersection ' +
              'de d et b, coplanaires dans π',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode — point de percée de d dans α',
          items: [
            'Choisis un plan auxiliaire π qui **contient d** et qui est **sécant à α**. Le choix ' +
              'concret dépend des données du problème.',
            'Détermine la droite b, commune aux plans π et α.',
            'Le point cherché, s\'il existe, est l\'intersection des droites d et b. C\'est un ' +
              'problème 2D : d et b sont maintenant coplanaires dans π.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'point de percée hors du solide',
          formula: 'Dans le cube ABCDEFGH, J est le milieu de [BF]. Trouve le point de percée de (AJ) dans le plan (EFGH).',
          steps: [
            { tag: 'plan auxiliaire', text: 'la face avant (ABFE) contient (AJ)' },
            { tag: 'droite commune', text: '(ABFE) coupe (EFGH) suivant (EF)' },
            { tag: 'intersection 2D', text: 'dans le plan (ABFE), (AJ) et (EF) se coupent en un point K' },
            { tag: 'position de K', text: 'les triangles JBA et JFK ont les mêmes angles (opposés par le sommet en J, droits en B et F) et JB = JF : ils sont égaux, donc FK = AB = EF' },
          ],
          result: { tag: 'résultat', text: 'K est sur le prolongement de [EF], au-delà de F, avec F milieu de [EK] — en dehors du cube' },
        },
        {
          kind: 'astuce',
          label: 'Choisir le plan auxiliaire',
          text:
            'Si d est dans une face du solide, cette face est souvent le meilleur choix : sa droite ' +
            'commune avec α se lit sur le dessin. Sinon, prends un plan qui contient d et un sommet bien ' +
            'choisi, souvent un plan diagonal. Pour trouver sa droite commune b avec α, repère deux points ' +
            'communs ; s\'il en manque un, construis-le comme rencontre de deux droites tracées dans une ' +
            'même face, l\'une dans π, l\'autre dans α. Ne prends jamais pour point de percée l\'endroit où ' +
            'd croise une arête sur le dessin : d et cette arête sont souvent gauches.',
        },
        {
          kind: 'atelier',
          tag: 'plan-auxiliaire-widget',
          label: 'Manipule toi-même : le plan auxiliaire',
          caption:
            'Choisis une droite d, un plan α, puis un plan auxiliaire π : un plan du cube, ou le plan qui ' +
            'contient d et un sommet. Un plan qui ne contient pas d est refusé, avec la raison. Sinon, ' +
            'l\'atelier trace la droite b commune à π et α, puis le point de percée, intersection de d et b, ' +
            'qui peut tomber hors du cube. Le réglage de départ reproduit l\'exemple de (AJ).',
        },
        { kind: 'subheading', text: 'Intersection de deux plans' },
        {
          kind: 'para',
          text:
            'Trouver la droite commune à deux plans sécants, c\'est le problème symétrique : il ' +
            'revient à repérer deux points distincts, communs aux deux plans.',
        },
        {
          kind: 'methode',
          label: '2 méthodes',
          items: [
            'Repère **deux points distincts** dont tu peux montrer qu\'ils appartiennent chacun ' +
              'aux deux plans. Ça revient parfois à chercher les points de percée de deux droites ' +
              'd\'un même plan dans l\'autre plan.',
            'Repère **un point commun** aux deux plans. Trouve ensuite la direction de la droite ' +
              'd\'intersection, en t\'appuyant sur les propriétés connues de la figure : le plus ' +
              'souvent, le théorème du toit ci-dessous.',
          ],
        },
        {
          kind: 'methode',
          label: 'Théorème du toit',
          items: [
            'Si deux plans sécants contiennent chacun une droite, et que ces deux droites sont ' +
              '**parallèles**, alors la droite d\'intersection des deux plans est **parallèle** à ces deux ' +
              'droites (ou confondue avec l\'une d\'elles).',
            'Comme le faîtage d\'un toit : les deux pans contiennent les gouttières, parallèles, et le ' +
              'faîtage, leur droite commune, leur est parallèle.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le théorème du toit',
          blocks: [
            { kind: 'para', text: 'Soit $\\alpha$ et $\\beta$ deux plans sécants suivant la droite $\\Delta$, $d$ une droite de ' +
              '$\\alpha$ et $d\'$ une droite de $\\beta$, avec $d \\parallel d\'$. On montre que ' +
              '$\\Delta \\parallel d$.' },
            { kind: 'para', text: 'Si $d$ est aussi dans $\\beta$, elle est commune aux deux plans : $d = \\Delta$. Sinon, $d$ est ' +
              'parallèle à la droite $d\'$ du plan $\\beta$ sans y être incluse : par le critère de la ' +
              'section 7, elle est parallèle à $\\beta$ et n\'a aucun point commun avec lui.' },
            { kind: 'para', text: 'Les droites $d$ et $\\Delta$ sont toutes les deux dans $\\alpha$. Comme $\\Delta$ est dans ' +
              '$\\beta$, que $d$ ne rencontre pas, elles n\'ont aucun point commun : coplanaires sans point ' +
              'commun, elles sont **parallèles**. Le même raisonnement, en échangeant les rôles de ' +
              '$\\alpha$ et $\\beta$, montre que $\\Delta \\parallel d\'$.' },
          ],
        },
        {
          kind: 'exemple',
          badge: 'intersection de deux plans',
          formula: 'Trouve la droite d\'intersection des plans (ACGE) et (BDHF).',
          steps: [
            { tag: '1er point commun', text: 'O, centre de ABCD, est sur (AC) et sur (BD) : il appartient aux deux plans' },
            { tag: '2e point commun', text: 'O′, centre de EFGH, est sur (EG) et sur (FH) : il appartient lui aussi aux deux plans' },
          ],
          result: { tag: 'résultat', text: 'deux points communs distincts suffisent : les plans se coupent suivant la droite verticale (OO′)' },
        },
        {
          kind: 'exemple',
          badge: 'un point commun et une direction',
          formula: 'Dans le cube ABCDEFGH, trouve la droite d\'intersection des plans (ABG) et (DCF).',
          steps: [
            { tag: 'les deux plans', text: '(ABG) est le plan du rectangle ABGH, (DCF) celui du rectangle DCFE' },
            { tag: 'un point commun', text: 'dans la face ADHE, la diagonale [AH] est dans (ABG) et la diagonale [DE] dans (DCF) : elles se coupent en P, centre de cette face, qui appartient aux deux plans' },
            { tag: 'la direction', text: '(AB) est dans (ABG), (DC) dans (DCF), et (AB) ∥ (DC) (ABCD est un carré) : par le théorème du toit, la droite cherchée est parallèle à (AB)' },
          ],
          result: { tag: 'résultat', text: 'les plans se coupent suivant la parallèle à (AB) menée par P ; elle passe aussi par Q, le centre de la face BCGF' },
        },
        {
          kind: 'entrainement',
          title: 'Point de percée par plan auxiliaire',
          generatorId: 'gen102',
          description: [
            'Sur un solide en perspective cavalière, construis pas à pas le point où une droite perce ' +
              'un plan : choisis un plan auxiliaire qui contient la droite, trouve sa droite commune ' +
              'avec le plan — parfois grâce à un point construit — puis désigne le point de percée, ' +
              'qui peut tomber hors du solide.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 102. Point de percée par plan auxiliaire »',
        },
        {
          kind: 'entrainement',
          title: 'Intersection de deux plans : un point et une direction',
          generatorId: 'gen134',
          description: [
            'Variante « Un point commun et une direction » : trouve un point commun à deux plans dans ' +
              'une même face, puis la direction de leur droite d\'intersection — parallèle aux droites ' +
              'parallèles que contient chacun des plans — et trace cette droite.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 134. Intersection de deux plans par parallélisme »',
        },
      ],
    },

    {
      id: 'section',
      number: 9,
      title: "Section plane d'un solide",
      kicker: 'chaque face traversée fournit exactement 2 sommets de la section',
      titreCourt: 'Section plane',
      partie: 'Constructions sur un solide',
      essentiel: [
        'Un plan transversal coupe un solide convexe suivant **un unique polygone fermé** ; chaque face traversée apporte exactement **deux** sommets de la section.',
        'Deux coups, répétés jusqu\'à fermeture : un **segment direct** dès qu\'une face a ses 2 points connus ; sinon un **point auxiliaire**, au croisement de deux droites d\'une même face, l\'une dans le plan de coupe, l\'autre dans le plan de la face visée.',
        'Un seul point connu sur une face ne suffit jamais pour tracer son côté de section.',
      ],
      cartes: [
        { question: 'Combien de sommets de la section chaque face traversée apporte-t-elle ?', reponse: 'Exactement deux.' },
        { question: 'Une face n\'a qu\'un seul point de section connu : peut-on tracer son côté ?', reponse: 'Non : il faut les deux points de la même face avant de les relier.' },
        { question: 'Comment construit-on un point auxiliaire ?', reponse: 'On croise deux droites d\'une même face : l\'une dans le plan de coupe, l\'autre dans le plan de la face visée.' },
        { question: 'Sur un parallélépipède, que dire des côtés de section sur deux faces opposées ?', reponse: 'Ils sont parallèles : un plan coupe deux plans parallèles suivant deux droites parallèles.' },
      ],
      blocks: [
        { kind: 'video', title: 'Section plane d\'un solide', youtubeId: 'Px1zuBUYsw0' },
        {
          kind: 'para',
          text:
            'Coupe un solide convexe par un plan transversal (qui ne touche aucun sommet ' +
            'exactement). Tu obtiens toujours **un unique polygone fermé** — jamais deux morceaux ' +
            'séparés. Chaque face réellement traversée y apporte **exactement deux sommets**. Le ' +
            'plan de coupe traverse toujours une face convexe en exactement deux points — jamais ' +
            'un seul, jamais trois.',
        },
        {
          kind: 'intuition',
          label: 'Comme trancher un pain',
          text:
            'Imagine une baguette de pain qu\'on tranche au couteau. Coupée bien ' +
            'perpendiculairement, la tranche est presque un cercle. Couteau incliné, la tranche ' +
            's\'étire et devient ovale. La forme de la coupe dépend entièrement de l\'**angle du ' +
            'couteau** — jamais de la baguette elle-même. C\'est exactement le même principe pour ' +
            'un solide : la forme du polygone de section dépend entièrement de la façon dont le ' +
            'plan le traverse, jamais du solide seul.',
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
          kind: 'exempleLibre',
          label: 'Démonstration — exactement deux sommets par face traversée',
          blocks: [
            { kind: 'para', text: 'Le plan de coupe $\\pi$ ne passe par aucun sommet et traverse une face convexe, située dans le ' +
              'plan $\\varphi$. Les deux plans sont sécants : ils se coupent suivant une droite $\\ell$, et la ' +
              'partie de la section située sur la face est la partie de $\\ell$ qui est dans la face.' },
            { kind: 'para', text: '**Au moins deux points.** $\\ell$ traverse la face : elle y entre en un point du bord et en ' +
              'ressort en un autre point du bord.' },
            { kind: 'para', text: '**Pas plus de deux.** Supposons trois points $X$, $Y$ et $Z$ du bord sur $\\ell$, $Y$ entre $X$ et ' +
              '$Z$. $Y$ est sur un côté de la face ; comme la face est convexe, elle est tout entière d\'un ' +
              'même côté de la droite qui porte ce côté. $X$ et $Z$ sont donc de ce même côté, ou sur cette ' +
              'droite ; or $Y$, entre eux, est sur la droite : $X$ et $Z$ y sont aussi. Alors $\\ell$ porte ' +
              'ce côté de la face et passe par ses sommets — impossible.' },
            { kind: 'para', text: 'La face apporte donc **exactement deux** sommets à la section, reliés par un côté.' },
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — 2 coups possibles, répétés jusqu\'à fermeture',
          items: [
            '**Segment direct** — dès qu\'une face a ses **2** points de section déjà connus, ' +
              'relie-les. Tu obtiens un côté du polygone de section.',
            '**Point auxiliaire** — quand plus aucune face n\'a ses 2 points connus, vise une face ' +
              'encore à moitié connue (un seul point de section). Choisis **deux droites situées ' +
              'dans une même face** : l\'une dans le **plan de coupe** (le plus souvent un côté de ' +
              'section déjà tracé), l\'autre dans le **plan de la face visée** (une arête de cette ' +
              'face, par exemple). Prolonge-les jusqu\'à leur intersection I. I appartient à la fois ' +
              'au plan de coupe et au plan de la face visée : la droite qui relie I au point déjà ' +
              'connu de cette face porte son côté de section, et coupe son arête au point manquant.',
            'Répète ces deux étapes jusqu\'à ce que **tous les côtés attendus** du polygone soient ' +
              'tracés : c\'est la fermeture complète.',
          ],
        },
        {
          kind: 'attention',
          label: 'Un point auxiliaire doit être un point NOUVEAU',
          text:
            'Croiser un côté déjà tracé avec une arête qui passe par l\'une de ses extrémités ne ' +
            'construit rien : les deux droites se coupent en un point déjà connu ! Le point ' +
            'auxiliaire n\'est utile que s\'il est distinct de tous les points déjà trouvés — le ' +
            'plus souvent, il tombe en dehors du solide, sur le prolongement des droites.',
        },
        {
          kind: 'piege',
          label: 'Piège central — un seul point connu ne suffit jamais',
          text:
            'L\'erreur la plus fréquente de cet exercice : tracer directement le segment de ' +
            'section d\'une face qui n\'a **qu\'un seul** point de section connu ! Il faut ' +
            'toujours les deux points de la même face, avant de pouvoir les relier.',
        },
        {
          kind: 'rappel',
          label: 'Une autre construction classique, par parallèles',
          items: [
            'Sur un **parallélépipède**, il existe une deuxième technique. Elle s\'appuie sur le ' +
              'parallélisme des faces opposées : un plan coupe deux plans parallèles suivant deux ' +
              'droites parallèles. Par le point déjà connu sur une face, mène la parallèle au côté ' +
              'de section déjà tracé sur la face opposée. Elle coupe l\'arête cherchée exactement où ' +
              'il faut. Cette technique exploite spécifiquement les faces parallèles d\'un ' +
              'parallélépipède — le point auxiliaire par intersection, lui, fonctionne aussi sur un ' +
              'tétraèdre.',
          ],
        },
        {
          kind: 'exemple',
          badge: '4 faces traversées',
          formula:
            'Le plan de coupe traverse les 4 arêtes verticales du parallélépipède ABCDEFGH. P sur [AE] ' +
            '(arête avant gauche), Q sur [BF] (arête avant droite) et R sur [CG] (arête arrière droite) ' +
            'sont connus au départ, à trois hauteurs différentes.',
          steps: [
            { tag: '1 — segment direct', text: 'la face avant a ses 2 points connus (P et Q) → on trace [PQ].' },
            { tag: '2 — segment direct', text: 'la face droite a ses 2 points connus (Q et R) → on trace [QR].' },
            {
              tag: '3 — plus de segment direct disponible',
              text: 'la face arrière n\'a qu\'un point connu (R), la face gauche aussi (P).',
            },
            {
              tag: '4 — deux points auxiliaires dans le plan du sol',
              text:
                'croiser [QR] avec (CG) ne donnerait que R, déjà connu : aucun point nouveau. On passe ' +
                'par le plan de la base (ABCD). Dans la face avant, (PQ) et (AB) se coupent en I ; dans la ' +
                'face droite, (QR) et (BC) se coupent en J. I et J sont à la fois dans le plan de coupe ' +
                'et dans le plan de la base : (IJ) est leur droite commune.',
            },
            {
              tag: '5 — point auxiliaire de la face arrière',
              text:
                'dans le plan de la base, (IJ) et (CD) se coupent en K, hors du solide. K est dans le plan ' +
                'de coupe et dans le plan (CDHG) : la droite (KR) porte le côté de section de la face ' +
                'arrière, et coupe l\'arête [DH] au point S.',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              'les 4 côtés [PQ], [QR], [RS] et [SP] ferment le polygone de section. Chaque face ' +
              'traversée y a bien apporté exactement 2 sommets. Contrôle : [RS] est parallèle à [PQ], ' +
              'car les faces avant et arrière sont parallèles.',
          },
        },
        {
          kind: 'exemple',
          badge: 'section d\'un tétraèdre par point auxiliaire',
          formula: 'Tétraèdre ABCD : P sur [AB], Q sur [AC], R sur [BD]. Construis la section par le plan (PQR).',
          steps: [
            { tag: '1 — face ABC, segment direct', text: 'P et Q sont connus → on trace [PQ]' },
            { tag: '2 — face ABD, segment direct', text: 'P et R sont connus → on trace [PR]' },
            { tag: '3 — face BCD : un seul point connu (R)', text: 'point auxiliaire : dans le plan (ABC), (PQ) est dans le plan de coupe et (BC) dans le plan (BCD) ; elles se coupent en I, hors du solide' },
            { tag: '4 — côté de la face BCD', text: 'I est à la fois dans le plan de coupe et dans le plan (BCD) : la droite (IR) porte le côté de section de cette face, et coupe [CD] en S' },
            { tag: '5 — face ACD, segment direct', text: 'Q et S sont connus → on trace [QS]' },
          ],
          result: { tag: 'résultat', text: 'la section est le quadrilatère PQSR : 4 faces traversées, 4 sommets' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 380,
            height: 205,
            planes: [
              { points: [{ x: 85, y: 100 }, { x: 244, y: 148 }, { x: 248.2, y: 166.4 }, { x: 126, y: 150 }], style: 'plan' },
            ],
            lines: [
              { points: [{ x: 140, y: 20 }, { x: 30, y: 180 }, { x: 270, y: 180 }], tone: 'ink', closed: true },
              { points: [{ x: 140, y: 20 }, { x: 190, y: 130 }], tone: 'faint', dashed: true },
              { points: [{ x: 30, y: 180 }, { x: 190, y: 130 }], tone: 'faint', dashed: true },
              { points: [{ x: 270, y: 180 }, { x: 190, y: 130 }], tone: 'faint', dashed: true },
              { points: [{ x: 85, y: 100 }, { x: 244, y: 148 }], tone: 'accent' },
              { points: [{ x: 85, y: 100 }, { x: 126, y: 150 }], tone: 'accent', dashed: true },
              { points: [{ x: 244, y: 148 }, { x: 350, y: 180 }], tone: 'attn', dashed: true },
              { points: [{ x: 270, y: 180 }, { x: 350, y: 180 }], tone: 'faint', dashed: true },
              { points: [{ x: 350, y: 180 }, { x: 126, y: 150 }], tone: 'attn', dashed: true },
              { points: [{ x: 244, y: 148 }, { x: 248.2, y: 166.4 }], tone: 'accent', dashed: true },
            ],
            points: [
              { x: 140, y: 20, label: 'A', tone: 'ink', labelDx: 8, labelDy: -2 },
              { x: 30, y: 180, label: 'B', tone: 'ink', labelDx: -14, labelDy: 14 },
              { x: 270, y: 180, label: 'C', tone: 'ink', labelDx: -4, labelDy: 18 },
              { x: 190, y: 130, label: 'D', tone: 'ink', labelDx: 4, labelDy: -8 },
              { x: 85, y: 100, label: 'P', tone: 'accent', labelDx: -16, labelDy: 0 },
              { x: 244, y: 148, label: 'Q', tone: 'accent', labelDx: 6, labelDy: -6 },
              { x: 126, y: 150, label: 'R', tone: 'accent', labelDx: -6, labelDy: 18 },
              { x: 248.2, y: 166.4, label: 'S', tone: 'accent', labelDx: -16, labelDy: 6 },
              { x: 350, y: 180, label: 'I', tone: 'good', labelDx: 6, labelDy: 16 },
            ],
            caption:
              'point auxiliaire : (PQ) et (BC) se coupent en I, hors du tétraèdre ; (IR) donne S sur ' +
              '[CD]. Les côtés cachés de la section sont en pointillés',
          },
        },
        {
          kind: 'exemple',
          badge: 'section triangulaire',
          formula: 'Dans le cube ABCDEFGH, P est sur [AB], Q sur [BC] et R sur [BF]. Construis la section par le plan (PQR).',
          steps: [
            { tag: 'trois segments directs', text: 'P et Q sont dans la face ABCD, Q et R dans la face BCGF, R et P dans la face ABFE : on trace [PQ], [QR] et [RP]' },
          ],
          result: { tag: 'résultat', text: 'la section est le triangle PQR : 3 faces traversées, 3 sommets, aucun point auxiliaire' },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'solidCavaliere',
            size: 'large',
            sectionPolygon: {
              points: [
                { x: 130, y: 190 },
                { x: 187.68, y: 172.32 },
                { x: 170, y: 132 },
              ],
            },
            freePoints: [
              { x: 130, y: 190, label: 'P', tone: 'accent' },
              { x: 187.68, y: 172.32, label: 'Q', tone: 'accent' },
              { x: 170, y: 132, label: 'R', tone: 'accent' },
            ],
            vertexLabels: [
              { vertex: 'A', tone: 'ink' },
              { vertex: 'B', tone: 'ink' },
              { vertex: 'C', tone: 'ink' },
              { vertex: 'D', tone: 'ink' },
              { vertex: 'E', tone: 'ink' },
              { vertex: 'F', tone: 'ink' },
              { vertex: 'G', tone: 'ink' },
              { vertex: 'H', tone: 'ink' },
            ],
            caption: 'un plan qui coupe le coin B du cube traverse 3 faces : la section est un triangle',
          },
        },
        {
          kind: 'atelier',
          tag: 'section-cube-widget',
          label: 'Manipule toi-même : la section d\'un cube',
          caption:
            'Place trois points P, Q et R sur des arêtes du cube : le plan (PQR) le coupe ' +
            'suivant un polygone, coloré en orange. Chaque face traversée apporte ' +
            'exactement deux sommets de la section, donc on obtient un triangle, un ' +
            'quadrilatère, un pentagone ou un hexagone selon le nombre de faces coupées. ' +
            'Fais tourner le cube pour voir la section sous tous les angles, puis reviens à ' +
            'la vue cavalière du cours. Le réglage de départ reproduit l\'exemple « 4 faces ' +
            'traversées ».',
        },
        {
          kind: 'application',
          titre: 'Comment une imprimante 3D construit un objet, tranche par tranche',
          illustrations: [
            {
              kind: 'planeSketch',
              width: 320,
              height: 220,
              lines: [
                { points: [{ x: 100, y: 200 }, { x: 220, y: 200 }, { x: 180, y: 40 }, { x: 140, y: 40 }], tone: 'ink', closed: true },
                { points: [{ x: 107.5, y: 170 }, { x: 212.5, y: 170 }], tone: 'accent', dashed: true },
                { points: [{ x: 115, y: 140 }, { x: 205, y: 140 }], tone: 'accent', dashed: true },
                { points: [{ x: 122.5, y: 110 }, { x: 197.5, y: 110 }], tone: 'accent', dashed: true },
                { points: [{ x: 130, y: 80 }, { x: 190, y: 80 }], tone: 'accent', dashed: true },
                { points: [{ x: 60, y: 195 }, { x: 60, y: 45 }], tone: 'good', arrow: true },
              ],
              freeLabels: [
                { x: 213, y: 174, text: 'tranche', tone: 'accent' },
                { x: 40, y: 120, text: 'sens d\'impression', tone: 'good' },
              ],
              caption:
                "Le slicer coupe le modèle 3D par des plans horizontaux régulièrement " +
                "espacés — chaque intersection donne le contour d'une tranche, imprimée du " +
                'bas vers le haut, l\'une après l\'autre.',
            },
          ],
          text:
            "Une imprimante 3D ne dépose jamais un objet entier d'un coup : elle le construit " +
            'couche par couche, en empilant des tranches horizontales très fines les unes sur ' +
            'les autres. Avant d\'imprimer, un logiciel (le « slicer », littéralement ' +
            '« trancheur ») calcule la forme de CHAQUE tranche en coupant le modèle 3D par un ' +
            'plan horizontal, à intervalles réguliers — exactement l\'opération que tu viens ' +
            'd\'apprendre dans cette section, répétée parfois plusieurs centaines de fois pour ' +
            'un seul objet. Plus les tranches sont fines, plus l\'objet final est lisse ; plus ' +
            'elles sont épaisses, plus l\'impression est rapide mais visiblement « striée ».',
          domaines: ['Ingénierie', 'Fabrication'],
        },
        {
          kind: 'entrainement',
          title: "Section plane d'un solide",
          generatorId: 'gen40',
          description: [
            'Reconstruis progressivement le polygone de section d\'un solide en perspective ' +
              'cavalière, un point ou un segment à la fois. Segment direct dès que 2 points d\'une ' +
              'face sont connus, sinon construction d\'un point auxiliaire. Le dernier côté se ' +
              'referme tout seul. Variantes : un point donné à l\'intérieur d\'une face, des points ' +
              'donnés sur le prolongement d\'une arête (hors du solide), et la section par un plan ' +
              'parallèle à un plan donné, construite à coups de parallèles. Le corrigé se termine par ' +
              'le tableau d\'appartenance des points aux faces.',
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
      kicker: 'vision monoculaire à travers une vitre quadrillée — un cadre popularisé par Dürer',
      titreCourt: 'La fenêtre de Dürer',
      partie: 'Perspective centrale et ombres',
      essentiel: [
        'La fenêtre de Dürer : le peintre regarde la scène d\'un seul œil (vision **monoculaire**) à travers une vitre quadrillée, puis reporte où les lignes de vision coupent le quadrillage.',
        'Un objet proche et petit et un objet éloigné et grand qui traversent la vitre au même endroit ont la même taille apparente.',
      ],
      cartes: [
        { question: 'Pourquoi le peintre ferme-t-il un œil ?', reponse: 'Pour que toute la scène se projette de façon cohérente sur une seule vitre plane : sa vision est monoculaire.' },
        { question: 'Que veut dire le mot « perspective » ?', reponse: 'Il vient du latin **perspectiva** : « voir au travers ».' },
      ],
      blocks: [
        { kind: 'video', title: 'Perspective centrale (fenêtre de Dürer, point de fuite) et ombre au soleil', youtubeId: '-hIwnCIyjFU' },
        {
          kind: 'para',
          text:
            'Les peintres de la Renaissance ont élaboré les règles de la perspective centrale à ' +
            'l\'aide d\'un **perspectographe**, un dispositif décrit et illustré en 1525 par le ' +
            'peintre allemand Dürer (1471–1528), sur une idée déjà proposée par Alberti (le ' +
            '« voile », 1435). La « fenêtre de Dürer » est composée d\'un cadre en bois et d\'une ' +
            'vitre quadrillée, placée devant la scène à représenter.',
        },
        {
          kind: 'para',
          text:
            'Le peintre regarde la scène à travers un « œilleton », en fermant un œil. Sa vision ' +
            'est donc **monoculaire**. Ce qu\'il peint ne correspond jamais tout à fait à ce que ' +
            'perçoivent normalement ses deux yeux ensemble — la vision binoculaire.',
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
              'vitre exactement au même endroit : ils ont donc la même taille apparente, à ' +
              'travers la fenêtre',
          },
        },
        {
          kind: 'para',
          text:
            'Pourquoi ? L\'œil, l\'image d\'un bâton vertical sur la vitre et le bâton lui-même forment ' +
            'deux triangles de même sommet (l\'œil) dont les bases sont parallèles : par Thalès, vu en 3e, ' +
            'la taille de l\'image vaut **hauteur du bâton × distance œil–vitre ÷ distance œil–bâton**. ' +
            'Un bâton deux fois plus loin doit donc être deux fois plus grand pour avoir la même image.',
        },
        {
          kind: 'atelier',
          tag: 'fenetre-durer-widget',
          label: 'Manipule toi-même : la fenêtre de Dürer',
          caption:
            'Règle la distance et la hauteur de deux bâtons vus à travers la vitre de ' +
            'Dürer, avec un seul œil. Chaque rayon visuel coupe la vitre : l\'image d\'un ' +
            'bâton mesure hauteur × (distance œil–vitre) ÷ (distance œil–bâton). Appuie sur ' +
            '« Même taille apparente » : un bâton deux fois plus loin doit être deux fois ' +
            'plus grand pour avoir la même image.',
        },
        {
          kind: 'para',
          text:
            'Le peintre repère où les lignes de vision, issues de l\'œil, coupent le quadrillage ' +
            'de la vitre. Il reporte ensuite ce qu\'il voit sur une feuille quadrillée identique — ' +
            'c\'est toute la méthode ! Le mot « perspective » vient d\'ailleurs du latin ' +
            '**perspectiva**, qui veut dire « voir au travers ».',
        },
        {
          kind: 'piege',
          label: 'Une vision volontairement appauvrie',
          text:
            'En fermant un œil, le peintre renonce à la vision binoculaire — celle des deux yeux ' +
            'ensemble, qui perçoit un peu de relief. C\'est un choix nécessaire : toute la scène ' +
            'doit se projeter de façon cohérente sur une seule vitre plane.',
        },
        {
          kind: 'para',
          text:
            'L\'image qui se forme à travers l\'objectif d\'un appareil photo suit le même ' +
            'principe que celle qui se forme sur la rétine de l\'œil. Pas tout à fait la même, ' +
            'quand même : le globe oculaire est sphérique, pas plan. Les règles de la perspective ' +
            'centrale s\'observent donc directement sur une photographie.',
        },
        {
          kind: 'historique',
          titre: 'Avant Dürer, une expérience avec un miroir',
          text:
            "Près d'un siècle avant que Dürer ne popularise son dispositif à vitre quadrillée, " +
            'l\'architecte florentin **Filippo Brunelleschi** réalise, vers 1415, la toute ' +
            'première démonstration que la perspective centrale peut se construire avec une ' +
            'précision mathématique exacte. Il peint le baptistère de Florence sur un petit ' +
            'panneau de bois percé d\'un trou en son centre, puis fait regarder le spectateur ' +
            'à travers ce trou, par l\'arrière du panneau, en tenant un miroir devant lui : le ' +
            'reflet de sa peinture se superpose exactement au vrai baptistère, visible ' +
            'par-dessus le miroir. L\'illusion est si parfaite que les témoins n\'arrivent plus ' +
            'à distinguer la peinture de la réalité. Cette expérience, plus qu\'un simple tour ' +
            'de magie, prouve que l\'espace peut être projeté sur un plan selon des règles ' +
            'géométriques fixes et vérifiables.',
          image: {
            src: '/images/historique/brunelleschi.jpg',
            alt: 'Portrait de Filippo Brunelleschi',
            caption:
              'Filippo Brunelleschi (1377–1446), gravure sur cuivre de Nicolas de Larmessin, ' +
              'publiée en 1682 (Académie des Sciences et des Arts d\'Isaac Bullart).',
          },
        },
      ],
    },

    {
      id: 'point-de-fuite',
      number: 11,
      title: 'Point de fuite et construction en perspective centrale',
      kicker: 'les fuyantes parallèles convergent vers un même point de fuite, sur la ligne d\'horizon',
      titreCourt: 'Point de fuite',
      partie: 'Perspective centrale et ombres',
      essentiel: [
        'Des droites horizontales parallèles qui s\'éloignent (les **fuyantes**) semblent se couper en un même **point de fuite**, sur la ligne d\'horizon, à la hauteur de l\'œil ; chaque direction a son propre point de fuite.',
        'Les droites parallèles à la vitre (verticales, horizontales de face) restent parallèles sur le dessin.',
        'Le milieu d\'un segment fuyant se trouve avec les diagonales de la face qui le contient, jamais au milieu de sa longueur dessinée.',
      ],
      cartes: [
        { question: 'Où se trouve la ligne d\'horizon d\'une image ?', reponse: 'À la hauteur de l\'œil du peintre (ou de l\'objectif de l\'appareil photo).' },
        { question: 'Quelles droites gardent leur parallélisme en perspective centrale ?', reponse: 'Celles qui sont parallèles à la vitre : les verticales et les horizontales de face.' },
        { question: 'Comment trouver le vrai milieu d\'un segment fuyant ?', reponse: 'Par l\'intersection des diagonales de la face qui le contient.' },
      ],
      blocks: [
        {
          kind: 'intuition',
          label: 'Tu as déjà vu ça',
          text:
            'Tu as déjà vu cet effet cent fois, sans y penser : les rails d\'une voie ferrée, ou ' +
            'les lignes blanches d\'une route, qui paraissent se resserrer et se rejoindre tout ' +
            'là-bas, à l\'horizon — alors qu\'en réalité, les rails restent strictement parallèles, ' +
            'à la même distance l\'un de l\'autre partout. C\'est précisément ce point de ' +
            'rencontre apparent que la perspective centrale reproduit sur le papier.',
        },
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
              'en perspective centrale, des rails pourtant parallèles dans la réalité semblent ' +
              'converger vers un seul point',
          },
        },
        {
          kind: 'para',
          text:
            'Des droites horizontales parallèles entre elles qui s\'éloignent de l\'observateur ' +
            '(des **fuyantes**) semblent se couper en un même point de cette ligne : leur **point ' +
            'de fuite**. Chaque direction a son propre point de fuite. Les droites parallèles à la ' +
            'vitre, elles (les verticales, les horizontales de face), n\'en ont pas : elles restent ' +
            'parallèles sur le dessin.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — des fuyantes parallèles ont un même point de fuite',
          blocks: [
            { kind: 'para', text: 'L\'œil est en $O$, devant une vitre plane. L\'image d\'une droite $d$ est la droite où le plan ' +
              'qui contient $O$ et $d$ coupe la vitre. Soit $d_1$ et $d_2$ deux droites parallèles, non ' +
              'parallèles à la vitre.' },
            { kind: 'para', text: 'Par $O$, il passe une seule parallèle $\\delta$ à $d_1$ (unicité) ; elle est aussi parallèle à ' +
              '$d_2$. Elle n\'est pas parallèle à la vitre : elle la perce en un point $F$.' },
            { kind: 'para', text: 'Le plan qui contient $O$ et $d_1$ contient aussi $\\delta$ : $\\delta$ et $d_1$ sont deux ' +
              'parallèles, dont l\'une passe par $O$. Ce plan coupe donc la vitre suivant une droite qui ' +
              'passe par $F$ : l\'image de $d_1$ passe par $F$. Le même raisonnement vaut pour $d_2$.' },
            { kind: 'para', text: 'Les images de $d_1$ et de $d_2$ passent par le même point $F$, leur **point de fuite**. Si les ' +
              'droites sont horizontales, $\\delta$ est horizontale et passe par l\'œil : $F$ est à la ' +
              'hauteur de l\'œil, sur la ligne d\'horizon.' },
          ],
        },
        {
          kind: 'para',
          text:
            'Les procédés de construction découlent directement de ce principe. On les combine ' +
            'aux propriétés déjà connues des plans, des droites et des figures planes — en ' +
            'particulier celles du trapèze.',
        },
        {
          kind: 'methode',
          label: 'Exemple de construction — une maison et son toit',
          items: [
            'Dessine la façade en vraie grandeur : elle est parallèle à la vitre, donc ses verticales ' +
              'et ses horizontales restent parallèles.',
            'Depuis chaque coin de la façade, trace la fuyante vers le point de fuite. Choisis la ' +
              'profondeur : les coins de la face arrière sont sur ces fuyantes, et cette face arrière ' +
              'est un rectangle plus petit, lui aussi de face.',
            'Le sommet S du pignon avant est sur la verticale qui passe par le centre de la façade ' +
              '(l\'intersection de ses diagonales), à la hauteur voulue.',
            'Le faîtage est une fuyante : trace-le de S vers le point de fuite. Il coupe la verticale ' +
              'du centre de la face arrière (trouvé par ses diagonales) au sommet S′ du pignon arrière. ' +
              'Relie enfin S′ aux coins supérieurs arrière pour fermer le toit.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 340,
            height: 190,
            lines: [
              { points: [{ x: 0, y: 50 }, { x: 340, y: 50 }], tone: 'faint', dashed: true },
              { points: [{ x: 174, y: 128 }, { x: 200, y: 50 }], tone: 'faint', dashed: true },
              { points: [{ x: 174, y: 89 }, { x: 200, y: 50 }], tone: 'faint', dashed: true },
              { points: [{ x: 141.5, y: 69.5 }, { x: 200, y: 50 }], tone: 'faint', dashed: true },
              { points: [{ x: 60, y: 170 }, { x: 160, y: 110 }], tone: 'faint' },
              { points: [{ x: 160, y: 170 }, { x: 60, y: 110 }], tone: 'faint' },
              { points: [{ x: 60, y: 170 }, { x: 109, y: 128 }], tone: 'faint', dashed: true },
              { points: [{ x: 109, y: 128 }, { x: 174, y: 128 }], tone: 'faint', dashed: true },
              { points: [{ x: 109, y: 128 }, { x: 109, y: 89 }], tone: 'faint', dashed: true },
              { points: [{ x: 60, y: 170 }, { x: 160, y: 170 }, { x: 160, y: 110 }, { x: 60, y: 110 }], tone: 'ink', closed: true },
              { points: [{ x: 160, y: 170 }, { x: 174, y: 128 }, { x: 174, y: 89 }, { x: 160, y: 110 }], tone: 'ink' },
              { points: [{ x: 60, y: 110 }, { x: 110, y: 80 }, { x: 160, y: 110 }], tone: 'accent' },
              { points: [{ x: 110, y: 80 }, { x: 141.5, y: 69.5 }, { x: 174, y: 89 }], tone: 'accent' },
            ],
            points: [
              { x: 200, y: 50, label: 'point de fuite', tone: 'accent', labelDx: -30, labelDy: -10 },
              { x: 110, y: 80, label: 'S', tone: 'accent', labelDx: -14, labelDy: -6 },
              { x: 141.5, y: 69.5, label: 'S′', tone: 'accent', labelDx: -6, labelDy: -10 },
            ],
            freeLabels: [{ x: 8, y: 44, text: "ligne d'horizon", tone: 'ink' }],
            caption:
              'façade en vraie grandeur, fuyantes vers le point de fuite, faîtage SS′ lui aussi ' +
              'fuyant ; les verticales restent parallèles',
          },
        },
        {
          kind: 'astuce',
          label: 'Trouver le milieu d\'une fuyante',
          text:
            'Sur le dessin, le milieu d\'un segment fuyant n\'est **pas** au milieu de sa longueur ' +
            'dessinée : la partie éloignée paraît plus courte. Trace plutôt les diagonales de la ' +
            'face qui le contient (un trapèze sur le dessin) : la parallèle aux côtés de face qui passe ' +
            'par leur intersection (une verticale pour un mur) coupe le segment en son vrai milieu. C\'est la « propriété du trapèze » ' +
            'annoncée plus haut : les diagonales d\'un rectangle se coupent en son centre, et ce ' +
            'point d\'intersection résiste à la perspective.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le milieu d\'une fuyante par les diagonales',
          blocks: [
            { kind: 'para', text: 'Le rectangle $ABCD$ est dessiné en perspective centrale ; ses côtés $[AD]$ et $[BC]$ sont ' +
              'parallèles à la vitre, $[AB]$ et $[DC]$ sont fuyants. Sur le dessin, la face devient un trapèze.' },
            { kind: 'para', text: 'Dans la réalité, les diagonales d\'un rectangle se coupent en son centre $O$, et la parallèle à ' +
              '$(AD)$ menée par $O$ coupe $[AB]$ en son milieu $M$.' },
            { kind: 'para', text: 'Sur le dessin, chaque droite devient une droite, et un point commun à deux droites reste ' +
              'commun à leurs images : l\'image de $O$ est l\'intersection des diagonales du trapèze. La ' +
              'parallèle à $(AD)$ menée par $O$ est parallèle à la vitre : son image reste parallèle aux ' +
              'images de $[AD]$ et $[BC]$.' },
            { kind: 'para', text: 'La parallèle aux côtés de face menée par l\'intersection des diagonales du trapèze est donc ' +
              'l\'image de la droite $(OM)$ : elle coupe le côté fuyant en l\'image du **vrai milieu** $M$ de ' +
              '$[AB]$.' },
          ],
        },
        {
          kind: 'atelier',
          tag: 'point-de-fuite-widget',
          label: 'Manipule toi-même : construire en perspective centrale',
          caption:
            'Déplace la ligne d\'horizon et le point de fuite : la maison se redessine en ' +
            'perspective centrale. Les verticales et les horizontales de la façade restent ' +
            'parallèles ; seules les fuyantes convergent vers le point de fuite. Le faîtage ' +
            'est une fuyante, et le pignon arrière se place grâce aux diagonales de la face ' +
            'arrière. Active « Milieu en perspective » pour voir que le vrai milieu n\'est ' +
            'pas au milieu du dessin, et compare avec la même maison en cavalière.',
        },
        {
          kind: 'attention',
          label: 'Deux perspectives, deux résultats différents',
          text:
            'Un même solide dessiné en perspective cavalière et en perspective à point de fuite ' +
            'ne donne jamais le même dessin ! La perspective cavalière conserve le parallélisme ' +
            'des arêtes : deux arêtes parallèles le restent sur le papier. La perspective à point ' +
            'de fuite ne le conserve que pour les droites parallèles à la vitre ; les fuyantes, ' +
            'elles, convergent vers leur point de fuite.',
        },
        {
          kind: 'historique',
          titre: 'Le premier manuel écrit de la perspective',
          text:
            "L'expérience de Brunelleschi restait une démonstration, pas une méthode " +
            'transmissible. C\'est l\'architecte et théoricien **Leon Battista Alberti** qui, ' +
            'dans son traité Della Pittura (1435), couche enfin par écrit les règles précises ' +
            'de construction de la perspective centrale — y compris le principe du point de ' +
            'fuite que tu viens d\'étudier. Son texte permet à toute une génération de ' +
            'peintres de la Renaissance d\'appliquer ces règles sans avoir à les redécouvrir ' +
            'eux-mêmes par tâtonnement, comme Brunelleschi avait dû le faire. C\'est en grande ' +
            'partie grâce à Alberti que la perspective centrale devient, en quelques ' +
            'décennies, la norme incontournable de la peinture occidentale.',
          image: {
            src: '/images/historique/alberti.jpg',
            alt: 'Statue de Leon Battista Alberti',
            caption:
              'Statue de Leon Battista Alberti par Giovanni Lusini, Florence. Photo : Frieda, ' +
              'CC BY-SA 3.0, via Wikimedia Commons.',
          },
        },
        {
          kind: 'methode',
          label: 'Compléter un carrelage, une rangée de poteaux, placer un objet',
          items: [
            'Un **carrelage** de carreaux carrés : les côtés qui s\'éloignent sont des fuyantes vers le point ' +
              'de fuite F ; les lignes des rangs, parallèles à la vitre, restent horizontales. Les diagonales ' +
              'des carreaux, parallèles entre elles, ont **leur propre point de fuite** sur la ligne d\'horizon. ' +
              'Prolonge la diagonale d\'un carreau du 1er rang : elle coupe les fuyantes aux coins des rangs ' +
              'suivants — on ne reporte jamais une profondeur mesurée sur le dessin.',
            'Une **rangée de poteaux** de même hauteur : les pieds et les sommets sont sur deux fuyantes qui se ' +
              'rejoignent au point de fuite ; chaque poteau reste vertical. Pour garder le même écart, joins le ' +
              'sommet d\'un poteau au **milieu** du suivant (un poteau est parallèle à la vitre : son milieu reste ' +
              'au milieu du dessin) ; cette droite touche le sol au pied du poteau d\'après.',
            'Un **objet de face** placé plus loin (un panneau, une fenêtre) garde sa forme mais rétrécit : ses ' +
              'coins sont sur les fuyantes issues des coins de l\'objet de devant, ses côtés restent horizontaux ' +
              'et verticaux.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'planeSketch',
            width: 340,
            height: 195,
            lines: [
              { points: [{ x: 0, y: 40 }, { x: 340, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 50, y: 180 }, { x: 130.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 130.0, y: 86.7 }, { x: 170, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 110, y: 180 }, { x: 150.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 150.0, y: 86.7 }, { x: 170, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 170, y: 180 }, { x: 170.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 170.0, y: 86.7 }, { x: 170, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 230, y: 180 }, { x: 190.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 190.0, y: 86.7 }, { x: 170, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 290, y: 180 }, { x: 210.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 210.0, y: 86.7 }, { x: 170, y: 40 }], tone: 'faint', dashed: true },
              { points: [{ x: 50, y: 180 }, { x: 290, y: 180 }], tone: 'ink' },
              { points: [{ x: 98.0, y: 124 }, { x: 242.0, y: 124 }], tone: 'ink' },
              { points: [{ x: 118.6, y: 100 }, { x: 221.4, y: 100 }], tone: 'ink' },
              { points: [{ x: 130.0, y: 86.7 }, { x: 210.0, y: 86.7 }], tone: 'ink' },
              { points: [{ x: 50, y: 180 }, { x: 260, y: 40 }], tone: 'accent', dashed: true },
            ],
            points: [
              { x: 170, y: 40, label: 'F', tone: 'accent', labelDx: -4, labelDy: -10 },
              { x: 260, y: 40, label: 'V', tone: 'accent', labelDx: -4, labelDy: -10 },
            ],
            freeLabels: [{ x: 8, y: 32, text: "ligne d'horizon", tone: 'ink' }],
            caption:
              'carrelage en perspective centrale : la diagonale d\'un carreau du 1er rang (pointillé orange), ' +
              'prolongée, passe par les coins des rangs suivants et par V, le point de fuite des diagonales ; ' +
              'les lignes des rangs restent horizontales',
          },
        },
        {
          kind: 'entrainement',
          title: 'Perspective centrale : point de fuite',
          generatorId: 'gen105',
          description: [
            'Construis sur une vitre quadrillée, avec la règle et l\'équerre : le point de fuite d\'une boîte, ' +
              'le 2e rang d\'un carrelage grâce aux diagonales, le poteau suivant d\'une rangée, un panneau ' +
              'placé plus loin sur les mêmes fuyantes — puis repère ce que la perspective centrale conserve, ' +
              'ou non, par rapport à la cavalière.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 105. Perspective centrale : point de fuite »',
        },
      ],
    },

    {
      id: 'ombre',
      number: 12,
      title: 'Ombre au soleil — projection parallèle',
      kicker: 'la direction n\'est jamais donnée en nombres — seulement par un exemple déjà résolu',
      titreCourt: 'Ombre au soleil',
      partie: 'Perspective centrale et ombres',
      essentiel: [
        'Au soleil, les rayons sont parallèles : la direction se lit sur un exemple déjà résolu, puis on mène par chaque point la parallèle à cette direction, jusqu\'au sol ou au premier obstacle.',
        'Le sens compte : une direction de sens opposé projette l\'ombre du mauvais côté, et la verticale n\'est pas la direction du soleil.',
        'Sous une lampe, les rayons partent tous de la lampe (projection centrale) : les droites qui portent les ombres de poteaux verticaux passent toutes par le pied $L_0$ de la lampe (on les prolonge au-delà du pied des poteaux).',
      ],
      cartes: [
        { question: 'Comment connaît-on la direction du soleil ?', reponse: 'Par un exemple déjà résolu : un point et son ombre déjà connue.' },
        { question: 'Au soleil, que dire des ombres de deux piquets verticaux ?', reponse: 'Elles sont parallèles.' },
        { question: 'Sous une lampe, par quel point passent les droites qui portent les ombres de deux poteaux ?', reponse: 'Par le pied $L_0$ de la lampe, juste sous elle : on prolonge les ombres au-delà du pied des poteaux.' },
        { question: 'Un rayon rencontre un obstacle avant le sol : où se forme l\'ombre ?', reponse: 'Sur le premier obstacle rencontré.' },
      ],
      blocks: [
        {
          kind: 'para',
          text:
            'Le soleil éclaire selon une **direction fixe**. Cette direction n\'est jamais donnée ' +
            'numériquement. Tu dois l\'identifier à partir d\'un exemple déjà résolu (un point et ' +
            'son ombre déjà connue), affiché sur le même dessin. Une fois cette direction ' +
            'retrouvée, tu peux projeter n\'importe quel autre point. Le raisonnement suit ' +
            'toujours les 4 mêmes temps.',
        },
        {
          kind: 'methode',
          label: 'Méthode — 4 temps',
          items: [
            'Identifie la direction du soleil, à partir de l\'exemple déjà résolu (le point et ' +
              'son ombre déjà connue).',
            'Pour chaque point à projeter, trace la droite parallèle à cette direction.',
            'Trouve où cette droite rencontre le sol — ou le **premier** solide-obstacle placé ' +
              'avant le sol, sur lequel le rayon s\'arrête.',
            'Relie les points-ombres trouvés entre eux, pour reconstituer l\'ombre complète de ' +
              'l\'objet.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Sur le dessin : passer par la trace au sol',
          text:
            'Sur un dessin en perspective, le point où une droite oblique « rencontre le sol » ne se ' +
            'lit pas tout seul : le sol est lui aussi dessiné en perspective. Pour un bâton vertical, ' +
            'trace d\'abord **au sol**, depuis son pied, la parallèle à l\'ombre du piquet-exemple ' +
            '(la droite qui relie le pied de l\'exemple à son ombre). Mène ensuite, depuis le sommet ' +
            'du bâton, la parallèle à la direction du soleil. Ces deux droites sont coplanaires — ' +
            'elles sont dans le plan vertical qui contient le bâton et la direction du soleil : leur ' +
            'intersection est l\'ombre du sommet.',
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
            'mathématiquement parallèle à elle ! Mais elle projette l\'ombre du mauvais côté du ' +
            'piquet — elle est donc rejetée, exactement comme la confusion avec la verticale. Ce ' +
            'n\'est pas un simple test de parallélisme : ici, la vérification est **sensible au ' +
            'sens**, pas seulement à la direction.',
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
          formula: 'Une barre rigide relie le sommet de deux piquets plantés dans le sol. Reconstitue son ombre complète.',
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
            text: 'le segment qui relie les deux points-ombres est l\'ombre complète de la barre — jamais l\'ombre de chaque piquet pris isolément.',
          },
        },
        {
          kind: 'astuce',
          label: '3 variantes du même raisonnement',
          text: 'Le même raisonnement en 4 temps se décline en 3 variantes, selon ce que donne l\'énoncé.',
          items: [
            '**Un seul piquet, sol plat** — un seul point à projeter, sélection directe.',
            '**Avec obstacles** — la direction n\'est confirmée qu\'une seule fois pour toute la ' +
              'scène. On projette le sommet du bâton : le rayon s\'arrête au **premier** ' +
              'solide-obstacle qu\'il rencontre, et l\'ombre se forme sur lui. Si aucun obstacle ' +
              'n\'est sur son trajet, l\'ombre atteint le sol, comme sans obstacle.',
            '**Direction inconnue** — il faut d\'abord déduire la direction elle-même, à partir ' +
              'd\'un sommet réel du solide et de son ombre déjà connue. Ensuite seulement, tu ' +
              'projettes les autres sommets.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — au soleil, les ombres de deux poteaux verticaux sont parallèles',
          blocks: [
            { kind: 'para', text: 'Deux poteaux verticaux $[AA\']$ et $[BB\']$ sont plantés dans un sol plan, aux pieds $A$ et $B$. ' +
              'Les rayons du soleil sont tous parallèles. L\'ombre du poteau $[AA\']$ est dans le plan ' +
              '$\\pi_A$ qui contient le poteau et le rayon issu de $A\'$ ; de même, celle de $[BB\']$ est dans ' +
              'le plan $\\pi_B$ qui contient le poteau et le rayon issu de $B\'$.' },
            { kind: 'para', text: 'Le poteau $(AA\')$ et le rayon issu de $A\'$ sont deux droites sécantes de $\\pi_A$ ; elles sont ' +
              'parallèles au poteau $(BB\')$ (deux verticales) et au rayon issu de $B\'$, deux droites de ' +
              '$\\pi_B$. Par le critère de la section 7, $\\pi_A$ et $\\pi_B$ sont parallèles (ou confondus).' },
            { kind: 'para', text: 'Le sol coupe ces deux plans parallèles suivant les droites qui portent les ombres. Par la ' +
              'propriété 1 de la section 5, ces droites sont **parallèles** (ou confondues, si les deux ' +
              'poteaux sont dans un même plan de rayons).' },
          ],
        },
        {
          kind: 'rappel',
          label: 'Pour aller plus loin — l\'ombre d\'une lampe',
          items: [
            'Une lampe éclaire depuis un **point** : ses rayons ne sont plus parallèles, ils partent ' +
              'tous de la lampe. C\'est une **projection centrale**, comme la perspective des sections ' +
              '10 et 11, où les rayons partent de l\'œil.',
            'Conséquence visible : au soleil, les ombres de piquets verticaux sont parallèles entre ' +
              'elles ; sous un lampadaire, elles partent dans des directions différentes. Les droites ' +
              'qui les portent passent toutes par le pied du lampadaire (on les prolonge au-delà du ' +
              'pied des piquets) ; les ombres elles-mêmes partent du côté opposé et ne l\'atteignent jamais.',
          ],
        },
        {
          kind: 'atelier',
          tag: 'ombre-soleil-lampe-widget',
          label: 'Manipule toi-même : soleil ou lampe ?',
          caption:
            'Éclaire trois piquets par le soleil, puis par une lampe. Au soleil, les rayons ' +
            'sont parallèles : les ombres le sont aussi, et chacune est proportionnelle à ' +
            'la hauteur de son piquet (c\'est une projection parallèle). Avec une lampe, les ' +
            'rayons partent d\'un même point : les droites qui portent les ombres passent par ' +
            'le pied de la lampe (c\'est une projection centrale). Si la lampe est plus basse qu\'un ' +
            'piquet, l\'ombre de ce piquet ne s\'arrête jamais.',
        },
        {
          kind: 'methode',
          label: 'Méthode — construire une ombre à la lampe',
          items: [
            'Repère la lampe L et son **pied** L₀, le point du sol situé juste en dessous de la lampe.',
            'Pour le sommet S d\'un objet vertical, trace le rayon qui part de L et passe par S.',
            'Trace la **trace au sol** : la droite qui part de L₀ et passe par le pied de l\'objet. Le ' +
              'rayon et la trace sont dans le même plan vertical : leur intersection est l\'ombre de S, ' +
              'du côté opposé à la lampe.',
            'Si l\'ombre rencontre un mur vertical, elle y monte **verticalement**, à partir du point où ' +
              'la trace au sol touche le pied du mur, jusqu\'au rayon issu de L.',
            'Pour **retrouver la lampe** : prolonge deux ombres au-delà du pied de leur poteau, elles se ' +
              'coupent en L₀ ; la lampe L est à la verticale de L₀, sur les rayons qui joignent chaque ombre ' +
              'au sommet de son poteau.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — sous une lampe, les droites des ombres passent par L₀',
          blocks: [
            { kind: 'para', text: 'La lampe $L$ éclaire un sol plan ; $L_0$ est le point du sol situé à la verticale de $L$. Un ' +
              'poteau vertical $[AA\']$ a son pied $A$ sur le sol, ailleurs qu\'en $L_0$.' },
            { kind: 'para', text: 'Les droites $(LL_0)$ et $(AA\')$ sont deux verticales distinctes, donc parallèles : elles ' +
              'déterminent un plan vertical $\\pi$. Ce plan contient $L$ et $A\'$, donc le rayon $(LA\')$ et ' +
              'l\'ombre $S$ du sommet $A\'$, au bout de ce rayon.' },
            { kind: 'para', text: '$\\pi$ coupe le sol suivant une droite, qui contient les points $A$, $L_0$ et $S$, tous dans ' +
              '$\\pi$ et sur le sol. La droite qui porte l\'ombre $[AS]$ passe donc par $L_0$ — pour chaque ' +
              'poteau : les droites des ombres passent toutes par le pied de la lampe.' },
          ],
        },
        {
          kind: 'piege',
          label: 'Ne pas tracer les ombres parallèles',
          text:
            'Sous une lampe, les ombres de deux poteaux ne sont **pas** parallèles, même si elles en ont ' +
            'l\'air sur un petit dessin : leurs droites se coupent au pied L₀ de la lampe. Et la trace au sol ' +
            'part de L₀, pas du point L dessiné en haut du mât.',
        },
        {
          kind: 'application',
          titre: 'Calculer l\'ombre portée d\'un panneau solaire avant de l\'installer',
          text:
            'Avant d\'installer des panneaux solaires sur un toit ou au sol, les ingénieurs ' +
            'doivent vérifier qu\'aucun panneau ne projette d\'ombre sur son voisin aux heures ' +
            'où le soleil est bas — sinon ce voisin perd une partie de sa production ' +
            'd\'électricité. Ce calcul est EXACTEMENT celui de cette section : connaissant la ' +
            'direction du soleil à un instant donné (son azimut et sa hauteur, qui varient ' +
            'selon l\'heure, la date et la latitude) et la hauteur de chaque panneau, on ' +
            'projette son sommet au sol pour connaître la longueur et la position de son ' +
            'ombre. C\'est ce calcul qui fixe l\'espacement minimal entre deux rangées de ' +
            'panneaux sur une grande installation solaire.',
          domaines: ['Énergie', 'Ingénierie'],
          image: {
            src: '/images/application/panneaux-solaires.jpg',
            alt: 'Panneaux solaires installés sur un toit',
            caption: 'Panneaux solaires sur un toit. Photo : Pujanak, domaine public, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'planeSketch',
              width: 400,
              height: 220,
              lines: [
                { points: [{ x: 10, y: 200 }, { x: 390, y: 200 }], tone: 'ink' },
                { points: [{ x: 40, y: 200 }, { x: 126.6, y: 150 }], tone: 'accent' },
                { points: [{ x: 126.6, y: 150 }, { x: 263.95, y: 200 }], tone: 'attn', dashed: true },
                { points: [{ x: 263.95, y: 200 }, { x: 350.55, y: 150 }], tone: 'accent' },
              ],
              points: [{ x: 263.95, y: 200, label: 'espacement minimal', tone: 'good', labelDy: 18 }],
              freeLabels: [
                { x: 60, y: 175, text: 'panneau 1', tone: 'accent' },
                { x: 320, y: 175, text: 'panneau 2', tone: 'accent' },
                { x: 180, y: 195, text: 'ombre portée', tone: 'ink' },
                { x: 100, y: 125, text: 'soleil bas (≈20°)', tone: 'ink' },
              ],
              caption:
                "Avec le soleil bas (hauteur ≈ 20°), l'ombre du sommet du panneau 1 s'étend " +
                "loin au sol : le panneau 2 ne peut commencer qu'à partir de là, sous peine " +
                "d'être lui-même à l'ombre une partie de la journée — exactement la " +
                'projection vue dans cette section, appliquée à fixer un espacement minimal.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Ombre au soleil',
          generatorId: 'gen41',
          description: [
            'Retrouve la direction de la lumière à partir d\'un exemple déjà résolu. Projette ' +
              'ensuite un ou plusieurs points pour reconstituer une ombre — au sol, ou sur le ' +
              'premier solide-obstacle que le rayon rencontre. Construis enfin l\'ombre d\'un ' +
              'solide posé au sol (cube, caisse ou pyramide) à partir de l\'ombre d\'une arête ' +
              'ou d\'un piquet, puis trace son contour.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 41. Ombre au soleil »',
        },
        {
          kind: 'entrainement',
          title: 'Ombre à la lampe : projection centrale',
          generatorId: 'gen106',
          description: [
            'Les rayons partent tous de la lampe. Construis l\'ombre d\'un poteau, d\'un cube ou d\'un pavé, ' +
              'ou d\'un poteau dont l\'ombre monte sur un mur, grâce au rayon issu de la lampe et à la trace ' +
              'au sol qui passe par le pied de la lampe — ou retrouve la lampe à partir de deux ombres.',
          ],
          chantier: '4e',
          whereLabel: '4e → « 106. Ombre à la lampe : projection centrale »',
        },
      ],
    },

    {
      id: 'revision',
      number: 13,
      title: 'Révision — quiz vrai/faux',
      kicker: '245 affirmations en 7 thèmes',
      titreCourt: 'Révision : vrai ou faux',
      partie: 'Perspective centrale et ombres',
      essentiel: [
        'Le quiz vrai/faux reprend tout le chapitre en 7 thèmes, dans l\'ordre des sections ; le détective d\'erreurs traque la ligne fausse d\'une copie.',
      ],
      cartes: [
        { question: 'Une copie conclut que deux droites sont sécantes parce que leurs traits se croisent sur le dessin. Quelle est l\'erreur ?', reponse: 'Un croisement des traits n\'est pas un point commun : des droites gauches semblent souvent se couper en perspective.' },
        { question: 'Une copie dessine une profondeur de 4 cm par une fuyante de 4 cm. Quelle est l\'erreur ?', reponse: 'La fuyante n\'est pas réduite : elle doit mesurer 2 cm, à 45°.' },
      ],
      blocks: [
        { kind: 'video', title: 'Synthèse du chapitre', youtubeId: 'y9OlAV4pqK4' },
        {
          kind: 'para',
          text:
            'Un quiz vrai/faux qui couvre tout le chapitre, en 7 thèmes qui suivent l\'ordre des ' +
            'sections : perspective cavalière, plans et positions de deux droites, position d\'une ' +
            'droite par rapport à un plan, plans/parallélisme/point de percée, section plane, ' +
            'perspective centrale, ombres au soleil et à la lampe. Contrairement au chapitre sur les droites et ' +
            'cercles du plan, aucune affirmation ne porte sur une coordonnée numérique : elles ' +
            'testent les définitions et le raisonnement géométrique — jamais un calcul chiffré. ' +
            'Le quiz se trouve dans l\'onglet Réviser (synthèse).',
        },
        {
          kind: 'entrainement',
          title: "Détective d'erreurs : géométrie dans l'espace",
          generatorId: 'gen107',
          description: [
            'Un élève a travaillé sur un solide dessiné en perspective cavalière — position de ' +
              'trois paires de droites, données qui déterminent un plan, remarques pour construire ' +
              'une section, démonstration que deux plans sont parallèles, ou dessin d\'un pavé —, ' +
              'mais une ligne de sa copie est fausse : croisement des traits pris pour un point ' +
              'commun, trois points alignés, segment tracé sur une face qui ne contient qu\'un des ' +
              'deux points, droite témoin hors du plan, fuyante non réduite ou mal inclinée… ' +
              'Trouve la ligne, nomme l\'erreur et corrige-la.',
          ],
          chantier: '4e',
          whereLabel: "4e → « 107. Détective d'erreurs : géométrie dans l'espace »",
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Perspective cavalière',
        formulas: [
          { text: 'Axes $x$ et $z$ : conservés à l\'échelle réelle' },
          { text: 'Axe $y$ (profondeur) : direction à 45°, longueur $\\times \\dfrac{1}{2}$' },
          {
            text: 'Fuyante : longueur dessinée = profondeur réelle $\\div 2$, mesurée à la règle le long de la fuyante',
            condition: 'jamais « un carreau en diagonale » par centimètre : la diagonale d\'un carreau mesure environ $1{,}4$ cm',
          },
          { text: 'Pyramide droite : pied de la hauteur au croisement des diagonales de la base ; hauteur verticale, en vraie grandeur' },
          { text: 'Arêtes cachées : en pointillés' },
        ],
      },
      {
        title: 'Déterminer un plan',
        formulas: [
          { text: '3 points non alignés' },
          { text: 'une droite + un point extérieur' },
          { text: '2 droites sécantes' },
          { text: '2 droites parallèles distinctes' },
        ],
      },
      {
        title: 'Critères de parallélisme',
        formulas: [
          { text: 'Unicité : par un point donné, une seule parallèle à une droite donnée' },
          {
            text: 'Droite ∥ plan : $d \\parallel \\alpha$',
            condition: 'si $d \\parallel$ une droite de $\\alpha$ et si un point de $d$ n\'est pas dans $\\alpha$ (sinon $d$ est incluse)',
          },
          { text: 'Plan ∥ plan : 2 droites sécantes de l\'un, ∥ à 2 droites de l\'autre' },
          { text: 'Droites gauches : ni sécantes, ni parallèles (aucun plan commun)' },
          { text: 'Trois plans sécants deux à deux : intersections concourantes, parallèles ou confondues' },
        ],
      },
      {
        title: 'Deux plans, point de percée',
        formulas: [
          { text: 'Deux plans distincts : parallèles (aucun point commun) ou sécants suivant une droite' },
          { text: 'Deux noms pour un même plan : les trois points de l\'un sont dans l\'autre → plans confondus' },
          { text: 'Droite d\'intersection de deux plans : deux points communs distincts' },
          {
            text: 'Point commun construit : rencontre de deux droites tracées dans une même face, une de chaque plan',
            condition: 'jamais un simple croisement des traits sur le dessin',
          },
          { text: 'Un plan coupe deux plans parallèles suivant deux droites parallèles' },
          { text: 'Deux plans parallèles : toute droite qui coupe l\'un coupe l\'autre' },
          {
            text: 'Point de percée de $d$ dans $\\alpha$ : plan auxiliaire $\\pi$ qui contient $d$, droite $b$ commune à $\\pi$ et $\\alpha$, puis $d \\cap b$',
            condition: '$\\pi$ contient $d$ et coupe $\\alpha$',
          },
        ],
      },
      {
        title: 'Justifier un parallélisme',
        formulas: [
          { text: 'Côtés opposés d\'un parallélogramme (rectangle, carré) : parallèles' },
          { text: 'Droite des milieux : la droite qui joint les milieux de deux côtés d\'un triangle est parallèle au troisième côté' },
          { text: 'Milieux de deux côtés opposés d\'un parallélogramme : la droite qui les joint est parallèle aux deux autres côtés' },
          { text: 'Droite témoin : une droite **du plan**, parallèle à la droite étudiée' },
        ],
      },
      {
        title: 'Section plane d\'un solide',
        formulas: [
          { text: 'Chaque face traversée → exactement **2** sommets de la section' },
          { text: 'Résultat : toujours un seul polygone fermé' },
          {
            text: 'Point auxiliaire : intersection d\'une droite du plan de coupe et d\'une droite du plan de la face visée',
            condition: 'les deux droites dans une même face, et un point NOUVEAU',
          },
          { text: 'Parallélépipède : deux faces opposées → deux côtés de section parallèles' },
        ],
      },
      {
        title: 'Perspective centrale',
        formulas: [
          { text: 'Ligne d\'horizon : à la hauteur de l\'œil (ou de l\'objectif)' },
          { text: 'Fuyantes horizontales parallèles entre elles → un même point de fuite, sur la ligne d\'horizon' },
          { text: 'Les droites parallèles à la vitre restent parallèles ; seules les fuyantes convergent' },
          { text: 'Milieu d\'une fuyante : par les diagonales de la face qui la contient' },
          { text: 'Carrelage : les diagonales des carreaux, parallèles entre elles, ont leur propre point de fuite sur la ligne d\'horizon' },
          { text: 'Rangée de poteaux : joindre le sommet d\'un poteau au milieu du suivant donne, au sol, le pied du poteau d\'après' },
        ],
      },
      {
        title: 'Ombre au soleil',
        formulas: [
          { text: 'Rayons parallèles : une seule direction pour toute la scène, lue sur un exemple déjà résolu' },
          {
            text: 'Ombre d\'un point : parallèle à la direction du soleil, jusqu\'au sol ou au premier obstacle',
            condition: 'oblique, jamais verticale — et dans le bon sens',
          },
          { text: 'Bâton vertical : trace au sol depuis le pied, parallèle à l\'ombre de l\'exemple' },
        ],
      },
      {
        title: 'Ombre à la lampe',
        formulas: [
          { text: 'Rayons issus de la lampe $L$ : ombre de $S$ sur le rayon $(LS)$' },
          {
            text: 'Trace au sol : la droite qui part du pied $L_0$ de la lampe et passe par le pied de l\'objet',
            condition: 'l\'ombre du sommet est à l\'intersection du rayon et de la trace, du côté opposé à la lampe',
          },
          { text: 'Mur vertical : l\'ombre y monte verticalement, depuis le point où la trace touche le pied du mur' },
          { text: 'Retrouver la lampe : deux ombres prolongées se coupent en $L_0$ ; $L$ est à la verticale de $L_0$' },
        ],
      },
    ],
  },

  recap: {
    items: [
      'Perspective cavalière — $x$ et $z$ restent à l\'échelle réelle. $y$ part en diagonale à ' +
        '$45^\\circ$, réduit de moitié. On ne lit jamais une longueur en profondeur à la règle sur le ' +
        'dessin. La perspective centrale (point de fuite) est plus réaliste, mais elle ne conserve le ' +
        'parallélisme que des droites parallèles à la vitre — plus lourde à main levée.',
      'Dessiner en cavalière — face avant en vraie grandeur ; depuis chaque sommet, une fuyante à ' +
        '$45^\\circ$ dont on mesure à la règle la moitié de la profondeur (jamais « un carreau en ' +
        'diagonale » par centimètre) ; pied de la hauteur d\'une pyramide au croisement des diagonales ' +
        'de sa base ; arêtes cachées en pointillés.',
      'Déterminer un plan — 4 façons équivalentes : 3 points non alignés, ou une droite + un ' +
        'point extérieur, ou 2 droites sécantes, ou 2 droites parallèles distinctes. Jamais une ' +
        'équation.',
      'Deux droites — sécantes ou parallèles (toujours coplanaires), ou **gauches** (aucun plan ' +
        'commun). C\'est un troisième cas, impossible dans le plan. Un croisement des traits sur le ' +
        'dessin n\'est jamais un point commun : il faut le prouver.',
      'Position droite/plan — 3 questions, toujours dans le même ordre : les 2 points sont-ils ' +
        'dans le plan ? La droite est-elle parallèle à une droite du plan ? Sinon, c\'est sécant. Le plan ' +
        'reste toujours infini — jamais limité au solide dessiné.',
      'Deux plans — parallèles, confondus (deux noms pour un même plan), ou sécants suivant une ' +
        'droite entière (jamais un point isolé), trouvée par deux points communs ou par un point ' +
        'commun et sa direction. ' +
        'Trois plans sécants deux à deux donnent des droites d\'intersection sécantes en un même ' +
        'point, parallèles entre elles, ou confondues (une droite commune).',
      'Parallélisme — toujours ramené à une comparaison de directions : droite $\\parallel$ droite ' +
        'd\'un plan, ou 2 droites sécantes d\'un plan $\\parallel$ 2 droites de l\'autre.',
      'Démontrer un parallélisme — la droite témoin doit être **dans** le plan ; on prouve chaque ' +
        'parallélisme de deux droites dans une figure plane : côtés opposés d\'un parallélogramme, ' +
        'droite des milieux, milieux de deux côtés opposés d\'un parallélogramme.',
      'Point de percée — construis un plan auxiliaire qui contient la droite et qui est sécant ' +
        'au plan cible. Le point cherché devient alors une simple intersection 2D, dans ce plan ' +
        'auxiliaire. Jamais le croisement de la droite et d\'une arête sur le dessin : elles sont ' +
        'souvent gauches.',
      'Section plane — un solide convexe coupé donne toujours un unique polygone fermé. Chaque ' +
        'face traversée fournit exactement 2 sommets. Segment direct si les 2 points d\'une face ' +
        'sont déjà connus ; sinon, construis un point auxiliaire par intersection de deux droites ' +
        'coplanaires (ou, sur un parallélépipède, par une parallèle).',
      'Perspective centrale — un dispositif d\'abord (la fenêtre de Dürer, vision monoculaire à ' +
        'travers une vitre quadrillée), puis un principe : des horizontales parallèles qui ' +
        's\'éloignent (les fuyantes) convergent vers un même point de fuite, sur la ligne d\'horizon ; ' +
        'chaque direction a le sien. Les verticales et ' +
        'les droites parallèles à la vitre restent parallèles ; seules les fuyantes convergent.',
      'Ombre au soleil — la direction n\'est jamais donnée en nombres : tu la déduis d\'un ' +
        'exemple déjà résolu. La projection est toujours oblique, jamais verticale. Elle est ' +
        'sensible au sens, pas seulement à la direction. Relie les points-ombres pour ' +
        'reconstituer l\'ombre complète.',
      'Ombre à la lampe — les rayons partent tous de la lampe $L$ (projection centrale). L\'ombre du ' +
        'sommet d\'un poteau est à l\'intersection du rayon issu de $L$ et de la trace au sol issue du ' +
        'pied $L_0$ ; les droites qui portent les ombres passent toutes par $L_0$, et les ombres ne sont ' +
        'pas parallèles.',
    ],
    checklist: {
      label: 'Avant de rendre ta copie',
      items: [
        'Ai-je bien vérifié les 2 points de la droite avant de conclure à une inclusion ?',
        'Avant d\'écrire « gauches », ai-je bien exclu « sécantes » et « parallèles » ?',
        'Deux droites qui ne se croisent pas sur mon dessin sont-elles vraiment parallèles, ou ' +
          'simplement gauches ?',
        'Ai-je confondu la projection verticale avec la vraie direction oblique du soleil ?',
        'Ai-je tenté un segment direct sur une face qui n\'avait qu\'un seul point de section ' +
          'connu ?',
        'Le point d\'intersection que j\'ai trouvé peut-il légitimement tomber en dehors du ' +
          'solide dessiné ?',
        'Ma droite témoin est-elle bien une droite **du** plan, et pas seulement une parallèle ' +
          'quelconque ?',
        'Sous une lampe, ma trace au sol part-elle bien du pied $L_0$, et pas du point $L$ dessiné en ' +
          'haut du mât ?',
      ],
    },
    forward:
      'Un même réflexe traverse tout le chapitre : ramener une question 3D à une comparaison de ' +
      'directions, ou à une intersection 2D dans un plan bien choisi. Identifie toujours la ' +
      'position relative avant de calculer quoi que ce soit. Décompose une construction complexe ' +
      'en étapes vérifiables, une à une. Et ne confonds jamais l\'intuition visuelle avec la vraie ' +
      'propriété géométrique.',
    entrainement: {
      kind: 'entrainement',
      title: "Géométrie dans l'espace — quiz vrai/faux",
      generatorId: 'gen66',
      description: [
        '245 affirmations pré-écrites, réparties en 7 thèmes (35 par thème), qui reprennent tout ' +
          'ce chapitre. Un seul essai par question ; la justification est toujours révélée.',
      ],
      chantier: '4e',
      whereLabel: "4e → « 66. Géométrie dans l'espace — quiz vrai/faux »",
    },
  },
}
