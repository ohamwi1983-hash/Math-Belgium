import type { ChapterContent } from '../../types'

export const fonctionsComposees: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 1,
  title: 'Fonctions : rappels et compléments',
  slug: 'fonctions-composees',
  lede:
    "Avant d'attaquer les limites, les asymptotes puis les dérivées, on refait le point sur les " +
    'fonctions : où sont-elles définies, comment en composer deux, comment décomposer une écriture ' +
    'compliquée en étapes simples, et comment lire tout ça sur un graphique ou dans un contexte concret.',

  intro: {
    title: "Avant de commencer : une fonction, c'est une machine",
    blocks: [
      {
        kind: 'para',
        text:
          'Une fonction **f** associe, à chaque nombre **x** d’un certain ensemble de départ, ' +
          '**un seul** nombre noté **f(x)**. On peut se la représenter comme une machine : on entre ' +
          '**x**, il se passe des calculs à l’intérieur, il en ressort **f(x)**.',
      },
      { kind: 'illustration', illustration: { kind: 'machine' } },
      {
        kind: 'para',
        text:
          'Deux notions à garder sous la main pour tout ce chapitre : le **domaine de définition** ' +
          '(noté $\\operatorname{dom} f$), c’est-à-dire l’ensemble des **x** que la machine accepte ' +
          'sans planter ; et le **graphe** $C_f$, l’ensemble des points $(x\\,;\\,f(x))$.',
      },
      {
        kind: 'para',
        text:
          'Concrètement, « faire tourner la machine » veut dire remplacer chaque **x** de la formule ' +
          'par la valeur choisie. Avec $f(x) = x^2 - 2x$ : $f(3) = 9-6=3$, $f(0)=0$, $f(-2)=4+4=8$.',
      },
      {
        kind: 'astuce',
        text:
          'Pour évaluer f en un point, mets systématiquement la valeur entre **parenthèses** avant de ' +
          'remplacer — surtout si elle est négative ou déjà une expression. $f(-2) = (-2)^2 - 2(-2)$ ne ' +
          'laisse aucune place au doute ; $f(-2) = -2^2 - 2-2$ (sans parenthèses) est une porte ouverte à ' +
          "l'erreur de signe.",
      },
    ],
  },

  sections: [
    {
      id: 'domaine',
      number: 1,
      title: 'Le domaine de définition',
      kicker: 'dom f — ce que la machine accepte',
      blocks: [
        {
          kind: 'para',
          text:
            '**dom f** est l’ensemble de toutes les valeurs de **x** pour lesquelles **f(x)** peut ' +
            'réellement être calculé. La plupart du temps, une expression est calculable pour *tout* réel ' +
            '— le travail consiste à repérer les quelques opérations qui, elles, imposent une **condition ' +
            "d'existence** (CE).",
        },
        {
          kind: 'rappel',
          label: 'Rappel — les 4 opérations à surveiller',
          items: [
            '**Un dénominateur** : ne doit jamais valoir 0.',
            '**Une racine d’indice pair** (carrée, quatrième…) : le radicande doit être **≥ 0**.',
            '**Une racine d’indice impair** (cubique, cinquième…) : toujours définie, aucune CE.',
            '**Une valeur absolue** : toujours définie, aucune CE.',
          ],
        },
        {
          kind: 'attention',
          label: "Attention — large ou strict, ce n'est pas pareil",
          text:
            'Une racine paire impose $\\text{radicande} \\ge 0$ : c’est une inégalité **large**, le 0 ' +
            'lui-même est accepté. Un dénominateur impose $\\text{dénominateur} \\ne 0$ : ce n’est ' +
            '**pas** une inégalité, mais une seule valeur ponctuelle qu’on retire — pas tout un côté ' +
            'de la droite. Ne recopie jamais « ≠ 0 » là où il fallait « ≥ 0 », ou l’inverse.',
        },
        {
          kind: 'methode',
          items: [
            "Repérer, dans l'expression de f(x), chaque opération à risque (dénominateur, racine paire).",
            'Poser une condition par opération repérée.',
            'Résoudre chaque condition séparément.',
            'Combiner les solutions par **intersection** (toutes les conditions à la fois).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'domaine non borné',
          formula: '$f(x) = \\dfrac{\\sqrt{2x+6}}{x-1}$',
          steps: [
            { tag: 'CE 1 — le radicande de la racine carrée', text: '$2x+6 \\ge 0 \\iff x \\ge -3$' },
            { tag: 'CE 2 — le dénominateur', text: '$x-1 \\ne 0 \\iff x \\ne 1$' },
          ],
          result: {
            tag: 'dom f — intersection des deux conditions',
            text: '$\\operatorname{dom} f = [-3\\,;\\,1[\\ \\cup\\ ]1\\,;\\,+\\infty[$',
          },
          illustration: {
            kind: 'domainLine',
            min: -5,
            max: 3.5,
            segments: [
              { from: -3, to: 1 },
              { from: 1, to: 'max' },
            ],
            points: [
              { value: -3, closed: true, label: '−3', tone: 'good' },
              { value: 1, closed: false, label: '1', tone: 'bad' },
            ],
            axisLabel: 'dom f',
            caption: 'trait plein = valeurs acceptées — rond vide = point exclu (x = 1)',
          },
        },
        { kind: 'subheading', text: "Quand l'exclusion tombe au milieu de l'intervalle" },
        {
          kind: 'para',
          text:
            "Le cas le plus instructif, c'est quand le point exclu par le dénominateur tombe " +
            "**à l'intérieur** d'un intervalle déjà borné par une racine — l'intersection produit " +
            "alors deux morceaux au lieu d'un.",
        },
        {
          kind: 'exemple',
          badge: 'domaine borné, exclusion interne',
          formula: '$f(x) = \\dfrac{\\sqrt{9-x^2}}{x+1}$',
          steps: [
            { tag: 'CE 1 — le radicande de la racine carrée', text: '$9-x^2 \\ge 0 \\iff x^2 \\le 9 \\iff -3 \\le x \\le 3$' },
            { tag: 'CE 2 — le dénominateur', text: '$x+1 \\ne 0 \\iff x \\ne -1$' },
          ],
          result: {
            tag: 'dom f — intersection : on retire x=−1, qui tombe DANS [−3;3]',
            text: '$\\operatorname{dom} f = [-3\\,;\\,-1[\\ \\cup\\ ]-1\\,;\\,3]$',
          },
          illustration: {
            kind: 'domainLine',
            min: -5,
            max: 5,
            segments: [
              { from: -3, to: -1 },
              { from: -1, to: 3 },
            ],
            points: [
              { value: -3, closed: true, label: '−3', tone: 'good' },
              { value: -1, closed: false, label: '−1', tone: 'bad' },
              { value: 3, closed: true, label: '3', tone: 'good' },
            ],
            extraTicks: [{ value: 0, label: '0' }],
            axisLabel: 'dom f',
            caption: "l'exclusion x = −1 coupe l'intervalle [−3;3] en deux morceaux",
          },
        },
        {
          kind: 'piege',
          text:
            'Une racine **impaire** (cubique, par exemple) ne demande **aucune** condition, même si elle ' +
            'a l’air « dangereuse ». Le réflexe « racine ⟹ le radicande doit être ≥ 0 » ne vaut que ' +
            'pour les racines d’indice **pair**.',
        },
        {
          kind: 'astuce',
          text:
            'Traite **toujours** la condition du dénominateur séparément de celle de la racine, même quand ' +
            'la racine est justement AU dénominateur (comme ci-dessus). Beaucoup d’erreurs viennent ' +
            'd’avoir fusionné les deux réflexes en une seule condition « radicande > 0 » — alors ' +
            'qu’il s’agit bien de deux conditions distinctes (une large, une stricte) à combiner ensuite.',
        },
        {
          kind: 'entrainement',
          title: 'Domaine de définition',
          generatorId: '5gen1',
          chantier: '5e-4h',
          description: [
            'Détermine le domaine de définition de fonctions variées : fractions, racines carrées seules ou combinées à une fraction, racines d’indice impair, valeurs absolues.',
            "L'exercice guide la construction du domaine (aucun CE / au moins une CE, puis construction pas à pas), exactement comme dans les exemples ci-dessus.",
          ],
          whereLabel: '5e (4h) → « 1. Domaine de définition »',
        },
      ],
    },

    {
      id: 'decomposer',
      number: 2,
      title: 'Composer deux fonctions — et décomposer une écriture',
      kicker: '(f ∘ g)(x) = f(g(x))',
      blocks: [
        {
          kind: 'para',
          text:
            "Composer deux fonctions, c'est enchaîner deux machines : la sortie de la première devient " +
            "l'entrée de la seconde. On note $(f\\circ g)(x) = f(g(x))$ : on lit « f rond g », et on " +
            'calcule **de droite à gauche** — d’abord g, ensuite f.',
        },
        { kind: 'illustration', illustration: { kind: 'compositionIntro' } },
        {
          kind: 'piege',
          text:
            'En général, $f\\circ g \\ne g\\circ f$ : l’ordre compte. Par exemple avec $f(x) = x+1$ ' +
            'et $g(x) = x^2$ : $(f\\circ g)(2) = f(4) = 5$ alors que $(g\\circ f)(2) = g(3) = 9$.',
        },
        { kind: 'subheading', text: 'Décomposer : remonter d’une écriture composée vers ses étages' },
        {
          kind: 'para',
          text:
            'Dans l’autre sens : on te donne une écriture composée $h(x)$, et tu dois retrouver les ' +
            'fonctions élémentaires qui, enchaînées, la reconstituent. La question à te poser à chaque ' +
            'étage : **« quelle est la toute dernière opération effectuée ? »** — c’est elle, la ' +
            'fonction la plus extérieure.',
        },
        {
          kind: 'methode',
          label: 'Méthode — éplucher de l’extérieur vers l’intérieur',
          items: [
            'Repère la dernière opération appliquée : c’est la fonction la plus extérieure.',
            '« Enlève-la » mentalement : il reste une écriture plus simple.',
            'Recommence sur ce qui reste, jusqu’à arriver à une expression en x toute simple.',
            'Relis ensuite tes étages **de l’intérieur vers l’extérieur** : c’est l’ordre d’application.',
          ],
        },
        {
          kind: 'astuce',
          text:
            'Donne un nom à chaque étage au fur et à mesure ($u$, $v$, $w$…) plutôt que de tout garder ' +
            '« dans ta tête ». Dès qu’il y a 3 ou 4 étages, c’est ce qui t’évite de perdre le ' +
            'fil — et ça te permet de relire ta décomposition étage par étage à la fin pour la vérifier.',
        },
        {
          kind: 'exemple',
          badge: '3 étages',
          formula: '$h(x) = 5 - \\sqrt[3]{|x|}$',
          steps: [
            { tag: 'Dernière opération : « 5 moins (...) »', text: 'étage extérieur : $f(t) = 5 - t$' },
            { tag: 'Ce qui reste à l’intérieur : une racine cubique', text: 'étage du milieu : $u(t) = \\sqrt[3]{t}$' },
            { tag: 'Ce qui reste tout au fond : une valeur absolue', text: 'étage intérieur : $g(x) = |x|$' },
          ],
          result: {
            tag: 'décomposition, de l’intérieur vers l’extérieur',
            text: '$g(x)=|x| \\to u(x)=\\sqrt[3]{x} \\to f(x)=5-x \\quad (h = f\\circ u\\circ g)$',
          },
        },
        {
          kind: 'attention',
          label: 'Attention — un étage doit récupérer TOUT ce qu’il reste',
          text:
            'Une fois la dernière opération épluchée, ce qu’il reste « en dessous » doit être recopié ' +
            '**intégralement**, pas seulement le morceau qui te saute aux yeux.',
        },
        {
          kind: 'wrongRight',
          wrongTag: '✗ décomposition incomplète',
          wrong: 'u(t) = $\\sqrt[3]{t}$ — on a oublié de faire réapparaître le « 5 − » nulle part',
          rightTag: '✓ décomposition correcte',
          right: 'f(t) = 5 − t, appliquée APRÈS u(t) = $\\sqrt[3]{t}$ — le « 5 − » est bien un étage à part entière',
        },
        {
          kind: 'para',
          text: "Avec un étage de plus, la méthode ne change pas — seul le nombre d’allers-retours augmente.",
        },
        {
          kind: 'exemple',
          badge: '4 étages',
          formula: '$h(x) = \\sqrt{|3x-5|+2}$',
          steps: [
            { tag: '1 — dernière opération : la racine carrée', text: 'étage extérieur : $u(t) = \\sqrt{t}$' },
            { tag: '2 — il reste : « ... + 2 »', text: 'étage suivant : $v(t) = t+2$' },
            { tag: '3 — il reste : une valeur absolue', text: 'étage suivant : $w(t) = |t|$' },
            { tag: '4 — il reste : une expression affine en x', text: 'étage intérieur : $g(x) = 3x-5$' },
          ],
          result: {
            tag: 'décomposition, de l’intérieur vers l’extérieur',
            text: '$g(x)=3x-5 \\to w(x)=|x| \\to v(x)=x+2 \\to u(x)=\\sqrt{x} \\quad (h = u\\circ v\\circ w\\circ g)$',
          },
          illustration: {
            kind: 'chain',
            stages: ['g', 'w', 'v', 'u'],
            highlightIndex: 3,
            outputLabel: 'h(x)',
            caption:
              'g agit en premier, puis w, puis v, enfin u (en couleur, la dernière opération effectuée) — h = u∘v∘w∘g',
          },
        },
        {
          kind: 'entrainement',
          title: 'Décomposer une fonction composée',
          generatorId: '5gen2',
          chantier: '5e-4h',
          description: [
            "C'est exactement la fonction du premier exemple ci-dessus qui apparaît dans l'exercice : à toi de retrouver, étage par étage, les fonctions intermédiaires qui la composent.",
            "Le nombre d'étages varie d'un exercice à l'autre (de 2 à 4) — le champ d'ajout de ligne s'adapte, sans jamais te donner le nombre exact à l'avance.",
          ],
          whereLabel: '5e (4h) → « 2. Décomposer une fonction composée »',
        },
      ],
    },

    {
      id: 'composer',
      number: 3,
      title: 'Composer f et g à partir de leurs expressions',
      kicker: 'écrire (f∘g)(x), puis en trouver le domaine',
      blocks: [
        {
          kind: 'para',
          text:
            'Quand f et g sont données par leur formule, composer revient à **substituer** : partout où ' +
            'g apparaît, on remplace le t de f(t) par l’expression complète de g(x).',
        },
        { kind: 'subheading', text: 'Le domaine d’une composée : une double condition' },
        {
          kind: 'methode',
          items: [
            'x doit d’abord appartenir à $\\operatorname{dom} g$ (sinon g(x) n’existe même pas).',
            'Il faut ensuite que la valeur $g(x)$ tombe dans $\\operatorname{dom} f$ (sinon f ne peut pas la recevoir).',
            'dom(f∘g) est l’**intersection** des deux conditions.',
          ],
        },
        {
          kind: 'attention',
          label: 'Attention — le sens d’une inégalité peut se renverser',
          text:
            'Quand la deuxième condition t’oblige à isoler x dans une inégalité qui contient un signe ' +
            'négatif (par exemple en divisant les deux membres par un nombre négatif, ou en passant un ' +
            '« −x » de l’autre côté), vérifie si le sens de l’inégalité doit **s’inverser**. ' +
            'C’est une source d’erreur très fréquente, précisément à l’étape où on croit avoir fini.',
        },
        {
          kind: 'exemple',
          badge: 'domaine non vide',
          formula: '$f(x) = \\sqrt{-3x+6}$ \\qquad $g(x) = \\sqrt{-2x+4}$',
          steps: [
            {
              tag: '(g∘f)(x) = g(f(x)), par substitution',
              text: '$g(f(x)) = \\sqrt{-2\\cdot\\sqrt{-3x+6}+4}$',
            },
            { tag: 'condition 1 — x doit appartenir à dom f', text: '$-3x+6 \\ge 0 \\iff x \\le 2$' },
            {
              tag: 'condition 2 — f(x) doit appartenir à dom g, c.-à-d. être ≤ 2',
              text: '$\\sqrt{-3x+6} \\le 2 \\iff -3x+6 \\le 4 \\iff x \\ge \\tfrac{2}{3}$',
            },
          ],
          result: {
            tag: 'dom(g∘f) — intersection des deux conditions',
            text: '$\\operatorname{dom}(g\\circ f) = \\left[\\tfrac{2}{3}\\,;\\,2\\right]$',
          },
        },
        {
          kind: 'astuce',
          label: 'Astuce — se relire en 30 secondes',
          text:
            'Choisis une valeur de x **dans** le domaine trouvé (ici, x = 1 convient), calcule ' +
            '$g(f(1))$ à la main étage par étage, puis compare avec ta formule composée simplifiée ' +
            'évaluée au même point. Si les deux nombres ne tombent pas d’accord, il y a une erreur ' +
            'quelque part dans la substitution — c’est bien plus rapide qu’une relecture complète.',
        },
        { kind: 'subheading', text: 'Cas particulier : quand les deux conditions ne se rencontrent jamais' },
        {
          kind: 'para',
          text:
            'Rien n’oblige les deux conditions à avoir une intersection non vide. Quand ' +
            '$\\operatorname{dom} g$ et l’ensemble des x envoyant g(x) dans $\\operatorname{dom} f$ ne se ' +
            'recoupent jamais, la composée n’est définie **nulle part**.',
        },
        {
          kind: 'exemple',
          badge: 'domaine vide',
          formula: '$f(x) = \\sqrt{x-10}$ \\qquad $g(x) = -x^2$',
          steps: [
            { tag: '(f∘g)(x) = f(g(x)), par substitution', text: '$f(g(x)) = \\sqrt{-x^2-10}$' },
            { tag: 'condition — le radicande doit être ≥ 0', text: '$-x^2-10 \\ge 0 \\iff x^2 \\le -10$' },
          ],
          result: {
            tag: 'aucun réel au carré n’est négatif — la condition n’a aucune solution',
            text: '$\\operatorname{dom}(f\\circ g) = \\varnothing$',
            isEmpty: true,
          },
        },
        {
          kind: 'para',
          text:
            'Ce n’est pas une erreur de calcul : g(x) = −x² ne prend jamais que des valeurs ' +
            'négatives ou nulles, alors que $\\operatorname{dom} f$ exige une valeur d’au moins 10 — ' +
            'les deux mondes ne se touchent jamais. Une réponse « dom = ∅ » est une réponse tout à fait valable.',
        },
        {
          kind: 'entrainement',
          title: 'Composer f et g',
          generatorId: '5gen3',
          chantier: '5e-4h',
          description: [
            'Deux fonctions f et g sont données. Écris l’expression de f∘g et/ou de g∘f selon ce qui est demandé, puis détermine le domaine de la composée obtenue.',
            'Les paires de fonctions varient (affines, quadratiques, racines, fractions...) — la méthode de la double condition reste toujours la même, et le domaine trouvé n’est pas nécessairement borné ou non vide comme dans les exemples ci-dessus.',
          ],
          whereLabel: '5e (4h) → « 3. Composer f et g — expressions et domaines »',
        },
      ],
    },

    {
      id: 'graphique',
      number: 4,
      title: 'Lire une composée sur un graphique',
      kicker: '(g∘f)(a) sans aucune formule',
      blocks: [
        {
          kind: 'para',
          text:
            'Quand on ne connaît f et g que par leurs graphes $C_f$ et $C_g$, on peut quand même calculer ' +
            '$(g\\circ f)(a)$ — en deux lectures successives, une par graphe.',
        },
        {
          kind: 'methode',
          label: 'Méthode — deux lectures, un report',
          items: [
            'Sur le graphe de **f**, place x = a et lis l’ordonnée du point : c’est f(a).',
            'Reporte cette valeur f(a) comme nouvelle entrée, mais cette fois sur le graphe de **g**.',
            'Sur le graphe de g, lis l’ordonnée en x = f(a) : c’est g(f(a)), la valeur cherchée.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Astuce — le réflexe « rebond »',
          text:
            'Trace mentalement (ou au crayon) une ligne **verticale** depuis x = a jusqu’à la courbe ' +
            'de f, puis une ligne **horizontale** jusqu’à l’axe des y pour lire f(a). Repars ' +
            'ensuite de cette valeur comme un nouveau x, sur l’axe des x du second graphe — verticale, ' +
            'puis horizontale, exactement comme un ballon qui rebondit deux fois.',
        },
        { kind: 'illustration', illustration: { kind: 'compositionSchematic' } },
        {
          kind: 'exemple',
          badge: 'lecture pas à pas',
          formula: 'Calcul de $(g\\circ f)(2)$ à partir des deux graphes ci-dessous, sans aucune formule.',
          steps: [
            { tag: '① sur C_f, en x = 2', text: 'on lit l’ordonnée du point : f(2) = 4' },
            { tag: '② report', text: '4 devient la nouvelle entrée, sur l’axe des x de C_g cette fois' },
            { tag: '③ sur C_g, en x = 4', text: 'on lit l’ordonnée du point : g(4) = 1' },
          ],
          result: {
            tag: 'résultat',
            text: '$(g\\circ f)(2) = g(f(2)) = g(4) = 1$',
          },
          illustration: {
            kind: 'compositionNumeric',
            fLabel: 'f',
            gLabel: 'g',
            a: 2,
            fa: 4,
            gfa: 1,
            xMax: 6,
            topYMax: 4,
            bottomYMax: 2,
            caption: 'graphes gradués — la même valeur (4) sert de sortie sur C_f et d’entrée sur C_g',
          },
        },
        {
          kind: 'piege',
          text:
            'Pour $(g\\circ f)(a)$, on lit **f d’abord**, jamais g en premier — même s’il est ' +
            'tentant de lire les deux graphes « dans l’ordre où ils sont dessinés ». L’ordre de ' +
            'lecture suit l’ordre d’écriture : le rond se lit de droite à gauche.',
        },
        {
          kind: 'attention',
          label: 'Attention — l’image n’existe pas toujours',
          text:
            'Si la valeur reportée $f(a)$ tombe **en dehors** de la portion visible (ou du domaine réel) ' +
            'du second graphe, alors $g(f(a))$ n’existe pas. La bonne réponse est « n’existe pas », ' +
            'jamais une valeur approximative devinée en prolongeant la courbe à l’œil.',
        },
        {
          kind: 'entrainement',
          title: 'Composée de fonctions — lecture graphique',
          generatorId: '5gen4',
          chantier: '5e-4h',
          description: [
            'Deux graphes sont donnés, celui de f et celui de g. À partir d’une valeur de départ, calcule la composée demandée en deux lectures successives — sans aucune formule.',
            'L’exercice précise aussi si l’image demandée existe réellement, exactement le piège vu ci-dessus, quand la valeur intermédiaire sort du domaine visible du second graphe.',
          ],
          whereLabel: '5e (4h) → « 4. Composée de fonctions — lecture graphique »',
        },
      ],
    },

    {
      id: 'contexte',
      number: 5,
      title: 'Fonctions en contexte',
      kicker: 'une grandeur physique devient une fonction d’une autre',
      blocks: [
        {
          kind: 'para',
          text:
            'Dans une situation concrète, une grandeur dépend souvent d’une autre par une relation ' +
            'qu’il faut d’abord **isoler** en fonction — avant, éventuellement, de la réinjecter ' +
            'dans une seconde formule. C’est de la composition, sans le dire.',
        },
        {
          kind: 'astuce',
          text:
            'Écris **d’abord** la relation telle qu’elle est donnée dans l’énoncé (ici, ' +
            '$V = \\pi r^2 h$), et isole **seulement ensuite** la lettre demandée. Essayer de deviner ' +
            'directement la formule finale, sans passer par la relation de départ, est la façon la plus ' +
            'rapide de se tromper de variable isolée.',
        },
        {
          kind: 'exemple',
          badge: 'un bidon cylindrique',
          formula:
            'Un bidon cylindrique de rayon $r$ et de hauteur $h$ a une contenance fixée à $V = 1000$ cm³, avec $V = \\pi r^2 h$.',
          steps: [
            {
              tag: 'isoler h : la hauteur devient une fonction de r',
              text: '$h(r) = \\dfrac{V}{\\pi r^2} = \\dfrac{1000}{\\pi r^2}$',
            },
            { tag: 'pour r = 3 cm', text: '$h(3) = \\dfrac{1000}{9\\pi} \\approx 35{,}4\\text{ cm}$' },
            {
              tag: 'l’aire latérale, elle, dépend de r ET de h(r) : une composition',
              text: '$A_{lat}(r) = 2\\pi r \\cdot h(r) = 2\\pi r \\cdot \\dfrac{1000}{\\pi r^2} = \\dfrac{2000}{r}$',
            },
          ],
          result: {
            tag: 'pour r = 3 cm',
            text: '$A_{lat}(3) = \\dfrac{2000}{3} \\approx 666{,}7\\text{ cm}^2$',
          },
          illustration: {
            kind: 'functionGraph',
            fn: (r: number) => 1000 / (Math.PI * r * r),
            xMin: 2,
            xMax: 11,
            xTicks: [2, 4, 6, 8, 10],
            markX: 3,
            markLabel: 'h≈35,4',
            xAxisLabel: 'r (cm)',
            yAxisLabel: 'h (cm)',
            caption: 'h(r) = 1000/(πr²) : plus le bidon est large, plus il doit être bas pour garder le même volume',
          },
        },
        {
          kind: 'para',
          text:
            'Remarque comme la formule de l’aire latérale se **simplifie** une fois qu’on y ' +
            'injecte h(r) : c’est exactement le mécanisme de la composition — une fonction (l’aire, ' +
            'qui dépend de r et h) dans laquelle on substitue une autre fonction (h, qui ne dépend que de r).',
        },
        {
          kind: 'attention',
          label: 'Attention — le domaine « physique » est presque toujours plus restrictif',
          text:
            'Purement algébriquement, $h(r) = 1000/(\\pi r^2)$ n’exclut que r = 0 (le dénominateur). ' +
            'Mais dans le contexte, un **rayon** ne peut être ni nul ni négatif — le vrai domaine du modèle ' +
            'est donc $r > 0$, une restriction plus forte que la simple condition « ≠ 0 ». Relis toujours ' +
            'l’énoncé pour d’éventuelles bornes supplémentaires (hauteur maximale du bidon, ' +
            'quantité de matière première disponible, etc.) : le domaine mathématique n’est qu’un ' +
            'point de départ.',
        },
        { kind: 'subheading', text: 'Un autre contexte classique : le coût unitaire' },
        {
          kind: 'para',
          text:
            'Même logique pour une entreprise dont le coût total de production $C(x)$ dépend de la ' +
            'quantité $x$ fabriquée : le coût **unitaire** (par objet) s’obtient en composant, cette ' +
            'fois avec une simple division — $c(x) = C(x) / x$. Isoler d’abord la bonne grandeur, ' +
            'composer ou diviser ensuite : la démarche reste identique à celle du bidon.',
        },
        {
          kind: 'entrainement',
          title: 'Problèmes-contexte',
          generatorId: '5gen5',
          chantier: '5e-4h',
          description: [
            'Trois familles de situations concrètes (bidons cylindriques, coût unitaire, coûts d’une entreprise) où il faut isoler une grandeur en fonction d’une autre, puis calculer plusieurs quantités dérivées pour différentes valeurs.',
            'Même bidon, mêmes formules que l’exemple ci-dessus — à toi de compléter le tableau pour chaque rayon proposé.',
          ],
          whereLabel: '5e (4h) → « 5. Problèmes-contexte »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Domaine de définition** — repérer dénominateurs et racines paires, poser une condition par risque, combiner par intersection.',
      '**Composer** — (f∘g)(x) = f(g(x)) : g agit en premier, f en second ; l’ordre compte.',
      '**Décomposer** — repérer la toute dernière opération effectuée, l’éplucher, recommencer.',
      '**Domaine d’une composée** — x ∈ dom g, ET g(x) ∈ dom f ; l’intersection peut être bornée, voire vide.',
      '**Lecture graphique** — deux lectures successives, la sortie de la première devient l’entrée de la seconde ; vérifier que l’image existe.',
      '**En contexte** — isoler une grandeur en fonction d’une autre avant de la réinjecter ailleurs ; le domaine physique restreint souvent le domaine mathématique.',
    ],
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je vérifié les 4 opérations à risque (dénominateur, racine paire, racine impaire, valeur absolue) une par une ?',
        'Ai-je bien combiné mes conditions par **intersection**, jamais par union ?',
        'Pour une composée : ai-je vérifié les **deux** domaines — x ∈ dom g, ET g(x) ∈ dom f ?',
        'Pour une lecture graphique : ai-je confirmé que l’image lue existe bien, avant de répondre une valeur ?',
      ],
    },
    forward:
      'Le domaine de définition revient au premier plan dans le chapitre sur les limites et les ' +
      'asymptotes : c’est lui qui indique, dès le départ, où chercher les comportements à étudier.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen39',
      description: [
        '7 thèmes de 20 affirmations chacun (vocabulaire, domaine rationnel, domaine avec ' +
          'racines, décomposition, composition, lecture graphique, problèmes-contexte) — choisis ' +
          'un thème, réponds vrai ou faux, la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 39. Fonctions : rappels et compléments — quiz vrai/faux »',
    },
  },
}
