import type { ChapterContent } from '../../types'

export const fonctionsComposees: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 1,
  title: 'Fonctions : rappels et compléments',
  slug: 'fonctions-composees',
  lede:
    "Avant les limites, les asymptotes et les dérivées, on refait le point sur les fonctions : " +
    "où elles existent, comment en enchaîner deux, comment décomposer une écriture compliquée " +
    'en étapes simples, et comment lire tout ça sur un graphique ou dans une situation concrète.',

  intro: {
    title: "Avant de commencer : une fonction, c'est une machine",
    blocks: [
      {
        kind: 'intuition',
        label: 'Pour visualiser',
        text:
          "Imagine un distributeur de boissons. Tu appuies sur un bouton précis, une boisson " +
          'précise sort. Toujours la même boisson pour le même bouton. Jamais deux boissons ' +
          "différentes pour le même bouton, au même moment. Une **fonction**, c'est exactement " +
          'ce principe, mais avec des nombres.',
      },
      {
        kind: 'para',
        text:
          'Une fonction f prend un nombre x, et renvoie **un seul** nombre, noté f(x). On peut ' +
          'se la représenter comme une machine : tu entres x, il se passe des calculs à ' +
          "l'intérieur, il en ressort f(x).",
      },
      { kind: 'illustration', illustration: { kind: 'machine' } },
      {
        kind: 'intuition',
        label: 'Tu connais déjà ça',
        text:
          "Tu utilises la notation f(x) depuis la 4e. Ici, on ne réapprend pas ce que c'est : on " +
          "va juste un peu plus loin — où f(x) existe vraiment, comment enchaîner deux " +
          'fonctions, et comment lire tout ça sur un graphique.',
      },
      {
        kind: 'historique',
        titre: "Pourquoi écrit-on f(x) ?",
        text:
          'La notation $f(x)$ que tu utilises à chaque ligne de ce chapitre a été inventée par ' +
          'le mathématicien suisse **Leonhard Euler**, en 1734, dans un article où il cherchait ' +
          'un moyen court et pratique de désigner « la valeur que prend la fonction f au point ' +
          "x ». Avant lui, les mathématiciens décrivaient une relation entre deux grandeurs en " +
          'toutes lettres ou par des constructions géométriques, sans symbole dédié — ce qui ' +
          'rendait les calculs avec plusieurs fonctions enchaînées bien plus lourds à écrire. ' +
          "Euler a produit un nombre record de travaux mathématiques (plus de 800 articles et " +
          'livres) tout en devenant presque complètement aveugle dans les vingt dernières ' +
          "années de sa vie — il continuait à dicter ses démonstrations de tête à des assistants.",
        image: {
          src: '/images/historique/euler.jpg',
          alt: 'Portrait de Leonhard Euler',
          caption: 'Leonhard Euler (1707–1783), portrait attribué à Jakob Emanuel Handmann, vers 1753.',
        },
      },
      {
        kind: 'para',
        text:
          'Trois mots à garder sous la main pour tout le chapitre. Le **domaine de définition** ' +
          '(noté $\\operatorname{dom} f$) : l\'ensemble des x que la machine accepte sans ' +
          'planter. L\'**image** (notée $\\operatorname{Im} f$) : l\'ensemble des valeurs $f(x)$ ' +
          'réellement atteintes — tout ce qui peut sortir de la machine. Le **graphe** $C_f$ : ' +
          'l\'ensemble des points $(x\\,;\\,f(x))$. Sur un graphique, $\\operatorname{dom} f$ se ' +
          'lit en projetant la courbe sur l\'axe des x, et $\\operatorname{Im} f$ en la projetant ' +
          'sur l\'axe des y.',
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [{ fn: (x: number) => x * x - 2 * x, tone: 'accent' }],
          xMin: -2,
          xMax: 4,
          xTicks: [-2, -1, 0, 1, 2, 3, 4],
          yTicks: [-1, 0, 3, 8],
          fixedYRange: { min: -2, max: 9 },
          // Projection de la courbe sur l'axe des y : bande colorée posée SUR l'axe (`imageBand` ne
          // trace qu'un fond grisé pleine largeur, sans couleur).
          shadedRegions: [{ from: -0.07, to: 0.07, upper: () => 9, lower: () => -1, tone: 'good' }],
          points: [{ x: 1, y: -1, label: 'sommet (1 ; −1)', tone: 'accent', labelPos: 'right' }],
          xAxisLabel: 'x',
          yAxisLabel: 'y',
          caption:
            '$f(x) = x^2 - 2x$ : la projection de la courbe sur l\'axe des y (bande verte posée sur l\'axe) donne ' +
            '$\\operatorname{Im} f = [-1\\,;\\,+\\infty[$ — aucune sortie de la machine n\'est plus petite que $-1$.',
        },
      },
      {
        kind: 'para',
        text:
          '« Faire tourner la machine », concrètement, ça veut dire remplacer chaque x de la ' +
          'formule par la valeur choisie. Avec $f(x) = x^2 - 2x$ : $f(3) = 9-6=3$, $f(0)=0$, ' +
          '$f(-2)=4+4=8$.',
      },
      {
        kind: 'astuce',
        text:
          'Pour évaluer f en un point, mets systématiquement la valeur entre **parenthèses** ' +
          'avant de remplacer — surtout si elle est négative ou déjà une expression. ' +
          '$f(-2) = (-2)^2 - 2(-2)$ ne laisse aucune place au doute ; $f(-2) = -2^2 - 2-2$ (sans ' +
          "parenthèses) est une porte ouverte à l'erreur de signe.",
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
        { kind: 'video', title: 'Le domaine de définition', youtubeId: 'hqFK11mLsYE' },
        {
          kind: 'intuition',
          label: "Pourquoi s'en soucier ?",
          text:
            'Si tu oublies une condition, tu peux calculer une réponse pour une valeur de x qui ' +
            "n'a en réalité aucun sens ! Un peu comme trouver « combien de temps pour vider une " +
            'baignoire » et obtenir un temps négatif. dom f, c\'est simplement la liste des ' +
            'valeurs de x pour lesquelles f(x) veut vraiment dire quelque chose.',
        },
        {
          kind: 'para',
          text:
            '**dom f** est l\'ensemble de toutes les valeurs de **x** pour lesquelles **f(x)** ' +
            'peut réellement être calculé. La plupart du temps, une expression est calculable ' +
            'pour **tout** réel — le travail consiste à repérer les quelques opérations qui, ' +
            "elles, imposent une **condition d'existence** (CE).",
        },
        {
          kind: 'rappel',
          label: 'Rappel — 2 opérations à surveiller, 2 sans danger',
          items: [
            '**Un dénominateur** : ne doit jamais valoir 0.',
            '**Une racine d’indice pair** (carrée, quatrième…) : le radicande doit être **≥ 0**.',
            '**Une racine d’indice impair** (cubique, cinquième…) : toujours définie, aucune CE.',
            '**Une valeur absolue** : toujours définie, aucune CE.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi ces deux-là ?',
          text:
            "Un dénominateur à 0 : diviser par 0 n'a pas de sens. Essaie sur ta calculatrice, " +
            'elle refuse ! Une racine carrée d\'un nombre négatif : aucun nombre réel, mis au ' +
            'carré, ne donne un résultat négatif. $(-2)^2 = 4$, jamais $-4$. Donc $\\sqrt{-4}$ ' +
            "n'existe pour aucun réel.",
        },
        {
          kind: 'attention',
          label: "Attention — large ou strict, ce n'est pas pareil",
          text:
            'Une racine paire impose $\\text{radicande} \\ge 0$ : c’est une inégalité **large**, ' +
            'le 0 lui-même est accepté. Un dénominateur impose $\\text{dénominateur} \\ne 0$ : ce ' +
            'n’est **pas** une inégalité, mais une seule valeur ponctuelle qu’on retire — pas ' +
            'tout un côté de la droite. Ne recopie jamais « ≠ 0 » là où il fallait « ≥ 0 », ou ' +
            "l'inverse.",
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
        { kind: 'subheading', text: 'Quand la racine borne le domaine des deux côtés' },
        {
          kind: 'para',
          text:
            "Ci-dessus, la racine ne bornait le domaine que d'un côté. Ici, elle l'enferme dans un " +
            "segment **borné des deux côtés** : si le point exclu par le dénominateur tombe " +
            "**à l'intérieur** de ce segment, il le coupe en deux — vérifie toujours qu'il est bien " +
            "dedans : s'il tombait à l'extérieur, il n'y aurait rien à retirer.",
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
        { kind: 'subheading', text: 'Trois autres formes à reconnaître' },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — une fraction sous une racine : le tableau de signes',
          blocks: [
            {
              kind: 'para',
              text:
                'Pour $f(x) = \\sqrt{\\dfrac{x-1}{x+2}}$, il faut que la fraction soit **positive ou ' +
                'nulle** ET que son dénominateur ne s\'annule pas. On étudie le signe du quotient ' +
                'grâce aux zéros du numérateur ($x = 1$) et du dénominateur ($x = -2$).',
            },
            {
              kind: 'signTable',
              caption: 'Signe de (x−1)/(x+2) — la double barre marque la valeur interdite x = −2',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−2', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'x − 1',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'neg' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'x + 2',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'pos' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: '(x − 1)/(x + 2)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '‖', tone: 'indef' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                'On garde les colonnes « + » et le « 0 » du numérateur, jamais la double barre : ' +
                '$\\operatorname{dom} f = \\mathopen{]}-\\infty\\,;\\,-2\\mathclose{[}\\ \\cup\\ [1\\,;\\,+\\infty[$. ' +
                'La borne $1$ est fermée (le quotient y vaut 0, et $\\sqrt{0}$ existe) ; la borne $-2$ ' +
                'est ouverte (dénominateur nul).',
            },
          ],
        },
        {
          kind: 'exemple',
          badge: 'racine au dénominateur — condition stricte',
          formula: '$f(x) = \\dfrac{x+4}{\\sqrt{6-2x}}$',
          steps: [
            {
              tag: 'une seule opération, deux contraintes',
              text: 'la racine exige $6-2x \\ge 0$, le dénominateur exige $\\sqrt{6-2x} \\ne 0$ : ensemble, $6-2x > 0$',
            },
            {
              tag: 'diviser par −2 : le sens de l’inégalité change',
              text: '$-2x > -6 \\iff x < 3$',
            },
          ],
          result: {
            tag: 'dom f — inégalité stricte, 3 est exclu',
            text: '$\\operatorname{dom} f = \\mathopen{]}-\\infty\\,;\\,3\\mathclose{[}$',
          },
        },
        {
          kind: 'exemple',
          badge: 'dénominateur du second degré',
          formula: '$f(x) = \\dfrac{2x+1}{x^2-5x+6}$',
          steps: [
            { tag: 'CE — le dénominateur ne doit pas s’annuler', text: '$x^2-5x+6 \\ne 0$' },
            { tag: 'discriminant', text: '$\\Delta = (-5)^2 - 4\\cdot1\\cdot6 = 1$' },
            { tag: 'racines à exclure', text: '$x = \\dfrac{5 \\pm 1}{2}$, soit $x = 2$ et $x = 3$' },
          ],
          result: {
            tag: 'dom f — deux valeurs retirées',
            text: '$\\operatorname{dom} f = \\mathbb{R}\\setminus\\{2\\,;\\,3\\}$',
          },
        },
        {
          kind: 'piege',
          text:
            'Pour résoudre $-2x+6 \\ge 0$, on isole x en divisant par $-2$, un nombre **négatif** : ' +
            'le sens de l\'inégalité **change**. $-2x \\ge -6 \\iff x \\le 3$. Écrire $x \\ge 3$ ' +
            'inverserait tout le domaine — c\'est l\'erreur la plus fréquente sur les racines.',
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
          kind: 'historique',
          titre: 'Qui a le droit de diviser par zéro ?',
          text:
            'Le mathématicien indien **Brahmagupta**, au 7e siècle, est l\'un des premiers à ' +
            'donner des règles de calcul explicites pour le nombre 0 — additions, soustractions, ' +
            'multiplications. Mais sur la division par zéro, il se trompe : il affirme que ' +
            '$n/0 = 0$, une règle qui semble raisonnable mais qui est en réalité incohérente ' +
            '(elle impliquerait que $0\\times0=n$, pour n\'importe quel n !). Il faudra attendre ' +
            'des siècles, et les travaux d\'autres mathématiciens indiens comme Bhāskara II au ' +
            '12e siècle, puis la formalisation moderne de l\'analyse, pour comprendre que $n/0$ ' +
            'n\'est tout simplement **pas défini** — exactement la raison pour laquelle un ' +
            'dénominateur ne peut jamais valoir 0 dans le domaine d\'une fonction.',
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
        { kind: 'video', title: 'Composer deux fonctions et décomposer une écriture', youtubeId: '1jMYd8KobY8' },
        {
          kind: 'para',
          text:
            "Composer deux fonctions, c'est enchaîner deux machines : la sortie de la première devient " +
            "l'entrée de la seconde. On note $(f\\circ g)(x) = f(g(x))$ : on lit « f rond g », et on " +
            'calcule **de droite à gauche** — d’abord g, ensuite f.',
        },
        {
          kind: 'intuition',
          label: "Pour retenir l'ordre",
          text:
            'Le matin, tu mets tes chaussettes, **PUIS** tes chaussures. Jamais l\'inverse ! ' +
            '$(f\\circ g)(x)$, c\'est pareil : on fait g d\'abord (les chaussettes), puis f (les ' +
            'chaussures). L\'ordre compte, toujours.',
        },
        { kind: 'illustration', illustration: { kind: 'compositionIntro' } },
        {
          kind: 'piege',
          text:
            'En général, $f\\circ g \\ne g\\circ f$ : l’ordre compte. Par exemple avec $f(x) = x+1$ ' +
            'et $g(x) = x^2$ : $(f\\circ g)(2) = f(4) = 5$ alors que $(g\\circ f)(2) = g(3) = 9$.',
        },
        {
          kind: 'atelier',
          tag: 'composition-machine-widget',
          label: 'Manipule toi-même — la machine à composer',
          caption:
            'Fais glisser a et regarde la valeur « rebondir » d\'un graphe à l\'autre. Choisis ' +
            'l\'ordre (f∘g) ou (g∘f) pour retrouver, par toi-même, les deux résultats différents ' +
            'du piège ci-dessus (5 et 9) — puis essaie le préréglage « domaine restreint » pour ' +
            'voir un cas où la composée « n\'existe pas ».',
        },
        {
          kind: 'exemple',
          badge: 'f∘g et g∘f en expressions',
          formula: '$f(x) = x^2+1$ \\qquad $g(x) = 2x-3$',
          steps: [
            { tag: '(f∘g)(x) : g d’abord, puis f', text: '$f(g(x)) = (2x-3)^2+1 = 4x^2-12x+10$' },
            { tag: '(g∘f)(x) : f d’abord, puis g', text: '$g(f(x)) = 2(x^2+1)-3 = 2x^2-1$' },
            {
              tag: 'vérification en x = 1',
              text: '$f(g(1)) = f(-1) = 2$ et $4-12+10 = 2$ ; $g(f(1)) = g(2) = 1$ et $2-1 = 1$',
            },
          ],
          result: {
            tag: 'deux formules différentes',
            text: '$(f\\circ g)(x) = 4x^2-12x+10 \\ne (g\\circ f)(x) = 2x^2-1$',
          },
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
          kind: 'historique',
          titre: 'Le jour où le mot « fonction » est né',
          text:
            'Le mot **« fonction »**, que tu utilises dans ce chapitre sans y penser, apparaît ' +
            'pour la première fois en mathématiques en 1673, sous la plume du philosophe et ' +
            'mathématicien allemand **Gottfried Wilhelm Leibniz**. À l\'origine, il l\'utilise ' +
            'dans un sens encore assez vague, pour désigner une grandeur géométrique qui dépend ' +
            'd\'une courbe (une tangente, une longueur...) — pas encore la relation précise que ' +
            'tu étudies ici. Le sens moderne, une règle qui associe à chaque x une seule valeur ' +
            'f(x), ne se stabilise que peu à peu, au fil du 18e et du 19e siècle.',
          image: {
            src: '/images/historique/leibniz.jpg',
            alt: 'Portrait de Gottfried Wilhelm Leibniz',
            caption:
              'Gottfried Wilhelm Leibniz (1646–1716), portrait attribué à Bernhard Christoph ' +
              'Francke, vers 1700.',
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
        { kind: 'video', title: 'Composer f et g à partir de leurs expressions', youtubeId: 'j4BmqIT-L3k' },
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
          kind: 'exemple',
          badge: 'substituer, puis simplifier',
          formula: '$f(x) = \\dfrac{3}{x}$ \\qquad $g(x) = \\dfrac{7}{4x+6}$ — calcule $(f\\circ g)(x)$ et son domaine.',
          steps: [
            {
              tag: '(f∘g)(x) = f(g(x)) : on remplace x par g(x) dans f',
              text: '$f(g(x)) = \\dfrac{3}{\\;\\dfrac{7}{4x+6}\\;}$',
            },
            {
              tag: 'diviser par une fraction, c’est multiplier par son inverse',
              text: '$f(g(x)) = 3\\cdot\\dfrac{4x+6}{7} = \\dfrac{12x+18}{7}$',
            },
            { tag: 'condition 1 — x ∈ dom g', text: '$4x+6 \\ne 0 \\iff x \\ne -\\dfrac{3}{2}$' },
            {
              tag: 'condition 2 — g(x) ∈ dom f, c.-à-d. g(x) ≠ 0',
              text: '$\\dfrac{7}{4x+6} \\ne 0$ pour tout $x$ : le numérateur 7 ne s’annule jamais',
            },
          ],
          result: {
            tag: 'formule simplifiée ET domaine',
            text: '$(f\\circ g)(x) = \\dfrac{12x+18}{7}$ sur $\\operatorname{dom}(f\\circ g) = \\mathbb{R}\\setminus\\{-\\tfrac{3}{2}\\}$',
          },
        },
        {
          kind: 'piege',
          text:
            'La formule simplifiée $\\dfrac{12x+18}{7}$ se calcule pour **tout** réel, y compris ' +
            '$x = -\\tfrac{3}{2}$ — et pourtant $(f\\circ g)(-\\tfrac{3}{2})$ n\'existe pas, puisque ' +
            '$g(-\\tfrac{3}{2})$ n\'existe pas. Cette exclusion vient de $\\operatorname{dom} g$ et ' +
            'ne se voit plus dans la formule finale : le domaine se lit toujours sur les **deux ' +
            'conditions**, jamais sur la formule simplifiée.',
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi dom(f∘g) exige x ∈ dom g ET g(x) ∈ dom f',
          blocks: [
            { kind: 'para', text: '**Étape 1 — ce que veut dire x ∈ dom(f∘g).** Par définition, $x \\in \\operatorname{dom}(f\\circ g)$ signifie que le nombre $(f\\circ g)(x) = f(g(x))$ existe : on peut le calculer jusqu\'au bout.' },
            { kind: 'para', text: '**Étape 2 — g d\'abord.** Pour calculer $f(g(x))$, on calcule d\'abord $g(x)$. Ce nombre n\'existe que si $x \\in \\operatorname{dom} g$ : sans lui, il n\'y a rien à donner à f. Donc, si $x \\in \\operatorname{dom}(f\\circ g)$, alors $x \\in \\operatorname{dom} g$.' },
            { kind: 'para', text: '**Étape 3 — puis f.** Le nombre $y = g(x)$ devient l\'entrée de f, et $f(y)$ n\'existe que si $y \\in \\operatorname{dom} f$, c\'est-à-dire $g(x) \\in \\operatorname{dom} f$. Donc, si $x \\in \\operatorname{dom}(f\\circ g)$, alors $g(x) \\in \\operatorname{dom} f$.' },
            { kind: 'para', text: '**Étape 4 — les deux conditions suffisent.** Inversement, si $x \\in \\operatorname{dom} g$ et $g(x) \\in \\operatorname{dom} f$, alors $g(x)$ existe et f peut le recevoir : $f(g(x))$ existe. Les deux conditions sont nécessaires **et** suffisantes : $\\operatorname{dom}(f\\circ g) = \\{x \\in \\operatorname{dom} g : g(x) \\in \\operatorname{dom} f\\}$.' },
            { kind: 'para', text: '**Pourquoi la formule simplifiée ne suffit pas.** Une simplification peut effacer une condition. Pour $f(t) = t^2$ et $g(x) = \\sqrt{x}$, la formule simplifiée $f(g(x)) = x$ semble définie partout, alors que $g(x)$ n\'existe que pour $x \\ge 0$ : $\\operatorname{dom}(f\\circ g) = [0\\,;+\\infty[$. Le domaine se lit sur les DEUX conditions, jamais sur la seule formule finale.' },
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
            { tag: 'condition 1 — x ∈ dom g', text: '$g(x) = -x^2$ existe pour tout réel : $\\operatorname{dom} g = \\mathbb{R}$' },
            {
              tag: 'l’image de g',
              text: '$-x^2 \\le 0$ pour tout $x$, donc $\\operatorname{Im} g = \\mathopen{]}-\\infty\\,;\\,0]$',
            },
            {
              tag: 'condition 2 — g(x) ∈ dom f = [10 ; +∞[',
              text: '$-x^2 \\ge 10 \\iff x^2 \\le -10$ : impossible, un carré n’est jamais négatif',
            },
          ],
          result: {
            tag: 'Im g et dom f ne se rencontrent jamais',
            text: '$\\operatorname{dom}(f\\circ g) = \\varnothing$',
            isEmpty: true,
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x: number) => -x * x, tone: 'bad' }],
            xMin: -4,
            xMax: 4,
            xTicks: [-4, -2, 0, 2, 4],
            yTicks: [-10, 0, 10],
            fixedYRange: { min: -14, max: 14 },
            shadedRegions: [
              { from: -0.1, to: 0.1, upper: () => 0, lower: () => -14, tone: 'bad' },
              { from: -0.1, to: 0.1, upper: () => 14, lower: () => 10, tone: 'good' },
            ],
            textLabels: [
              { x: -0.35, y: 11.5, text: 'dom f', tone: 'good', anchor: 'end' },
              { x: -0.35, y: -7, text: 'Im g', tone: 'bad', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'g(x)',
            caption:
              'Sur l\'axe des y : $\\operatorname{Im} g = \\mathopen{]}-\\infty\\,;\\,0]$ (bande rouge) ne ' +
              'rencontre jamais $\\operatorname{dom} f = [10\\,;\\,+\\infty[$ (bande verte) : aucune valeur ' +
              '$g(x)$ ne peut entrer dans f.',
          },
        },
        {
          kind: 'para',
          text:
            'Ce n’est pas une erreur de calcul : l’**image** de g ne contient que des valeurs ' +
            'négatives ou nulles, alors que $\\operatorname{dom} f$ exige une valeur d’au moins 10 — ' +
            'les deux mondes ne se touchent jamais. Retiens le réflexe : la deuxième condition revient ' +
            'à chercher où l’image de g rencontre $\\operatorname{dom} f$. Une réponse « dom = ∅ » est ' +
            'une réponse tout à fait valable.',
        },
        {
          kind: 'atelier',
          tag: 'domaine-composee-widget',
          label: 'Manipule toi-même — la double condition, visualisée',
          caption:
            'Les 3 droites reprennent les 3 étapes de la méthode : dom de la fonction intérieure, ' +
            'la condition qui la relie à l\'extérieure, puis leur intersection. Fais glisser x et ' +
            'regarde le marqueur passer du vert au gris sur chaque ligne selon la condition ' +
            'vérifiée ou non — reprend les 2 exemples déjà résolus ci-dessus.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin : l’associativité' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la composition est associative : (f∘g)∘h = f∘(g∘h)',
          blocks: [
            { kind: 'para', text: '**Ce qu\'il faut montrer.** Deux fonctions sont égales si elles ont le même domaine et la même image en chaque point. On compare donc $((f\\circ g)\\circ h)(x)$ et $(f\\circ(g\\circ h))(x)$.' },
            { kind: 'para', text: '**Étape 1 — le membre de gauche.** On applique la définition $(u\\circ v)(x) = u(v(x))$ avec $u = f\\circ g$ et $v = h$ : $((f\\circ g)\\circ h)(x) = (f\\circ g)(h(x))$. On l\'applique une seconde fois, avec $u = f$ et $v = g$, au nombre $h(x)$ : $(f\\circ g)(h(x)) = f(g(h(x)))$.' },
            { kind: 'para', text: '**Étape 2 — le membre de droite.** Avec $u = f$ et $v = g\\circ h$ : $(f\\circ(g\\circ h))(x) = f((g\\circ h)(x)) = f(g(h(x)))$.' },
            { kind: 'para', text: '**Étape 3 — même chaîne, même domaine.** Les deux membres donnent la même chaîne de calcul : h d\'abord, puis g, puis f. Ils existent exactement pour les mêmes x (ceux pour lesquels $h(x)$, puis $g(h(x))$, puis $f(g(h(x)))$ existent). Les deux fonctions sont donc égales : $(f\\circ g)\\circ h = f\\circ(g\\circ h)$. On peut écrire $f\\circ g\\circ h$ sans parenthèses — c\'est exactement ce qu\'on fait en décomposant une écriture en plusieurs étages.' },
            { kind: 'para', text: '**Attention — associative ne veut pas dire commutative.** L\'**ordre** des fonctions compte toujours ($f\\circ g \\ne g\\circ f$ en général) ; seule la place des parenthèses est sans importance.' },
          ],
        },
        {
          kind: 'application',
          titre: 'Enchaîner des commandes informatiques comme des fonctions composées',
          illustrations: [
            {
              kind: 'chain',
              stages: ['fichier.txt', 'grep "erreur"', 'wc -l'],
              highlightIndex: 2,
              outputLabel: 'nombre de lignes',
              caption:
                "`fichier.txt | grep \"erreur\" | wc -l` : chaque commande reçoit la sortie de la " +
                'précédente comme entrée — exactement la chaîne de composition $h=u\\circ v\\circ w$ ' +
                "que tu lis de l'intérieur vers l'extérieur.",
            },
          ],
          text:
            'Sur un ordinateur, une commande Unix/Linux peut envoyer directement son résultat ' +
            'comme donnée d\'entrée à la commande suivante, grâce au symbole **|** (appelé ' +
            '« pipe », tuyau en anglais). Écrire `commande1 | commande2` revient exactement à ' +
            'calculer $(g\\circ f)$ : la sortie de la première commande (f) devient l\'entrée de ' +
            'la seconde (g), sans étape intermédiaire visible. Les langages de programmation ' +
            'modernes généralisent cette idée sous le nom de « function chaining » ou « function ' +
            'composition » : au lieu d\'écrire plusieurs lignes avec des variables temporaires, ' +
            'un développeur enchaîne directement les traitements — exactement le même principe ' +
            'que composer f et g par leurs formules.',
          domaines: ['Informatique', 'Programmation'],
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
        { kind: 'video', title: 'Lire une composée sur un graphique', youtubeId: 'OyXADsT7-Oc' },
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
        {
          kind: 'astuce',
          label: 'Astuce — le report par la droite y = x',
          text:
            'Quand $C_f$ et $C_g$ sont tracées **dans le même repère**, trace aussi la droite ' +
            '$y = x$. Depuis le point $(a\\,;\\,f(a))$ de $C_f$, une **horizontale** jusqu’à la droite ' +
            '$y = x$ t’amène au point $(f(a)\\,;\\,f(a))$, donc pile à l’abscisse $f(a)$ ; une ' +
            '**verticale** jusqu’à $C_g$ donne alors $g(f(a))$. La diagonale fait le report à ta place.',
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
          label: 'Attention — hors du domaine ou hors du dessin, ce n’est pas pareil',
          text:
            'Si la valeur reportée $f(a)$ est **hors du domaine** de g (l’énoncé dit que g n’existe ' +
            'pas en cette valeur, ou son graphe complet s’arrête avant), alors $g(f(a))$ **n’existe ' +
            'pas**. Si elle tombe seulement **hors de la portion tracée** alors que g y est définie, ' +
            '$g(f(a))$ existe bien mais **n’est pas lisible sur ce graphique**. Dans les deux cas, ' +
            'jamais de valeur devinée en prolongeant la courbe à l’œil.',
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
        { kind: 'video', title: 'Fonctions en contexte : bidon cylindrique, coût unitaire', youtubeId: 'makuh8EtGt0' },
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
            { tag: 'pour r = 3 cm', text: '$h(3) = \\dfrac{1000}{9\\pi} \\approx 35{,}4$ cm' },
            {
              tag: 'l’aire latérale, elle, dépend de r ET de h(r) : une composition',
              text: '$A_{lat}(r) = 2\\pi r \\cdot h(r) = 2\\pi r \\cdot \\dfrac{1000}{\\pi r^2} = \\dfrac{2000}{r}$',
            },
          ],
          result: {
            tag: 'pour r = 3 cm',
            text: '$A_{lat}(3) = \\dfrac{2000}{3} \\approx 666{,}7$ cm²',
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
            'Mais dans le contexte, un **rayon** ne peut être ni nul ni négatif — le vrai domaine du ' +
            'modèle est donc $r > 0$, une restriction plus forte que la simple condition « ≠ 0 ». Relis toujours ' +
            'l’énoncé pour d’éventuelles bornes supplémentaires (hauteur maximale du bidon, ' +
            'quantité de matière première disponible, etc.) : le domaine mathématique n’est qu’un ' +
            'point de départ.',
        },
        {
          kind: 'application',
          titre: 'Une chaîne de montage, où chaque poste reçoit le travail du précédent',
          image: {
            src: '/images/application/assembly-line.jpg',
            alt: 'Chaîne de montage automobile',
            caption: 'Chaîne de montage Volkswagen à Wolfsbourg, 1960. Photo : Roger Wollstadt, CC BY-SA 2.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'chain',
              stages: ['châssis', 'peinture', 'moteur'],
              highlightIndex: 2,
              outputLabel: 'voiture assemblée',
              caption:
                'Chaque poste transforme ce que le précédent lui a transmis — inverser « peinture » ' +
                'et « moteur » casserait la chaîne (on ne peint pas un moteur déjà monté), ' +
                'exactement comme $f\\circ g \\ne g\\circ f$ en général.',
            },
          ],
          text:
            'Sur une chaîne de montage industrielle (automobile, électronique...), chaque poste ' +
            'de travail reçoit la pièce déjà transformée par le poste précédent, y ajoute sa ' +
            'propre opération, puis la transmet au poste suivant — exactement le principe de la ' +
            'composition de fonctions appliqué à un objet physique plutôt qu\'à un nombre. Les ' +
            'ingénieurs qui conçoivent une chaîne de production réfléchissent précisément en ces ' +
            'termes : la FORME finale de la pièce dépend de l\'ORDRE dans lequel les opérations ' +
            'sont appliquées — changer cet ordre peut rendre une étape ultérieure impossible, ' +
            'exactement comme $f\\circ g \\ne g\\circ f$ en général.',
          domaines: ['Industrie', 'Production'],
        },
        { kind: 'subheading', text: 'Un autre contexte classique : le coût unitaire' },
        {
          kind: 'para',
          text:
            'Pour une entreprise dont le coût total de production $C(x)$ dépend de la quantité $x$ ' +
            'fabriquée, le coût **unitaire** (par objet) vaut $c(x) = \\dfrac{C(x)}{x}$. Attention : ' +
            'c’est un **quotient** de deux fonctions ($C$ et $x \\mapsto x$), pas une composition — on ' +
            'divise une sortie par une entrée, on n’enchaîne pas deux machines.',
        },
        {
          kind: 'para',
          text:
            'Une **vraie** composition, en économie : le nombre d’objets vendus dépend du budget ' +
            'publicitaire $b$ (en centaines d’euros), $q(b) = 50 + 2b$, et la recette dépend du nombre ' +
            'd’objets vendus, $R(q) = 12q$ (en euros). La recette en fonction du budget est la composée ' +
            '$(R\\circ q)(b) = R(50+2b) = 600 + 24b$ : la sortie de la première machine (les ventes) ' +
            'devient l’entrée de la seconde (la recette).',
        },
        {
          kind: 'exemple',
          badge: 'coût unitaire à partir de deux relevés',
          formula:
            'Le coût unitaire d’un objet est modélisé par $c(x) = a + \\dfrac{b}{x}$ (en euros), où $x$ ' +
            'est le nombre d’objets fabriqués. On relève $c(10) = 26$ et $c(40) = 11$. Détermine $a$ et $b$, ' +
            'puis le coût total.',
          steps: [
            { tag: 'traduire chaque relevé en équation', text: '$a + \\dfrac{b}{10} = 26$ et $a + \\dfrac{b}{40} = 11$' },
            {
              tag: 'soustraire les deux équations : a disparaît',
              text: '$\\dfrac{b}{10} - \\dfrac{b}{40} = 15 \\iff \\dfrac{3b}{40} = 15 \\iff b = 200$',
            },
            { tag: 'remplacer b dans la première équation', text: '$a = 26 - \\dfrac{200}{10} = 6$' },
            { tag: 'vérifier avec le second relevé', text: '$c(40) = 6 + \\dfrac{200}{40} = 11$ ✓' },
            {
              tag: 'coût total : un produit par x, pas une composition',
              text: '$C(x) = x\\cdot c(x) = 6x + 200$ : 200 € de coût fixe et 6 € par objet',
            },
          ],
          result: {
            tag: 'modèle',
            text: '$c(x) = 6 + \\dfrac{200}{x}$ et $C(x) = 6x + 200$',
          },
        },
        {
          kind: 'exemple',
          badge: 'bénéfice et seuil de rentabilité',
          formula:
            'Une entreprise vend chaque objet 16 €. Son coût total de production vaut ' +
            '$C(x) = 0{,}1x^2 + 6x + 160$ (en euros, pour $x$ objets). Pour quelles quantités est-elle rentable ?',
          steps: [
            { tag: 'chiffre d’affaires', text: '$CA(x) = 16x$' },
            {
              tag: 'bénéfice = chiffre d’affaires − coût total',
              text: '$B(x) = 16x - (0{,}1x^2 + 6x + 160) = -0{,}1x^2 + 10x - 160$',
            },
            {
              tag: 'seuils : B(x) = 0',
              text:
                '$x^2 - 100x + 1600 = 0$, $\\Delta = 10\\,000 - 6\\,400 = 3\\,600$, donc ' +
                '$x = \\dfrac{100 \\pm 60}{2}$ : $x = 20$ ou $x = 80$',
            },
            {
              tag: 'signe de B : coefficient de x² négatif, B est positif entre ses racines',
              text: '$B(x) > 0 \\iff 20 < x < 80$ ; bénéfice maximal au sommet, $B(50) = 90$ €',
            },
          ],
          result: {
            tag: 'zone de rentabilité',
            text: 'entre $20$ et $80$ objets — le seuil de rentabilité est de $20$ objets',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x: number) => 16 * x, tone: 'good' },
              { fn: (x: number) => 0.1 * x * x + 6 * x + 160, tone: 'bad' },
            ],
            shadedRegions: [
              { from: 20, to: 80, upper: (x: number) => 16 * x, lower: (x: number) => 0.1 * x * x + 6 * x + 160, tone: 'good' },
            ],
            xMin: 0,
            xMax: 100,
            xTicks: [0, 20, 50, 80, 100],
            yTicks: [160, 320, 1280],
            fixedYRange: { min: 0, max: 1800 },
            points: [
              { x: 20, y: 320, label: 'seuil : 20 objets', tone: 'accent', labelPos: 'right' },
              { x: 80, y: 1280, label: '80 objets', tone: 'accent', labelPos: 'below' },
            ],
            textLabels: [
              { x: 97, y: 1690, text: 'C(x)', tone: 'bad', anchor: 'end' },
              { x: 97, y: 1350, text: 'CA(x)', tone: 'good', anchor: 'end' },
            ],
            xAxisLabel: 'x (objets)',
            yAxisLabel: 'euros',
            caption:
              'Entre 20 et 80 objets, la droite du chiffre d’affaires passe au-dessus de la courbe du ' +
              'coût total : la zone verte est le bénéfice. Le seuil de rentabilité se lit à la première intersection.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Problèmes-contexte',
          generatorId: '5gen5',
          chantier: '5e-4h',
          description: [
            'Trois familles de situations concrètes (bidons cylindriques et stocks, coût unitaire, coûts d’une entreprise) où il faut isoler une grandeur en fonction d’une autre, puis la réinjecter ou la comparer.',
            'Mêmes démarches que les exemples ci-dessus : relevés traduits en équations, système pour un coût unitaire, bénéfice et seuil de rentabilité lu sur un graphique.',
          ],
          whereLabel: '5e (4h) → « 5. Problèmes-contexte »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: "Domaine de définition — conditions d'existence",
        formulas: [
          { text: 'dénominateur : $D(x) \\neq 0$', condition: 'une seule valeur retirée, jamais un intervalle' },
          { text: "racine d'indice pair : radicande $\\ge 0$", condition: 'inégalité large, le 0 est accepté' },
          { text: 'racine au dénominateur : radicande $> 0$', condition: 'deux contraintes à la fois (≥ 0 et ≠ 0), donc stricte' },
          { text: 'diviser une inégalité par un négatif : le sens change', condition: '$-2x \\ge -6 \\iff x \\le 3$' },
          { text: "racine d'indice impair, valeur absolue : aucune CE" },
          { text: 'plusieurs CE : intersection de leurs solutions', condition: 'toutes les conditions à la fois, jamais une union' },
        ],
      },
      {
        title: 'Composer deux fonctions',
        formulas: [
          { text: '$(f\\circ g)(x) = f(g(x))$', condition: 'g agit en premier, f en second' },
          { text: 'décomposer : repérer la dernière opération effectuée, l’éplucher, recommencer' },
          { text: '$(f\\circ g)\\circ h = f\\circ(g\\circ h)$', condition: "associativité : seule la place des parenthèses est libre, jamais l'ordre" },
        ],
      },
      {
        title: "Composer f et g — domaine d'une composée",
        formulas: [
          { text: '$\\operatorname{dom}(f\\circ g) = \\{x \\in \\operatorname{dom} g : g(x) \\in \\operatorname{dom} f\\}$', condition: 'les deux conditions à la fois' },
          { text: 'première condition : $x \\in \\operatorname{dom} g$', condition: 'sinon g(x) n’existe même pas' },
          { text: 'deuxième condition : $g(x) \\in \\operatorname{dom} f$', condition: 'la valeur g(x) doit pouvoir être reçue par f' },
          { text: 'image de g sans point commun avec dom f : la composée n’est définie nulle part', condition: '$\\operatorname{dom}(f\\circ g) = \\varnothing$' },
        ],
      },
      {
        title: "Lecture graphique d'une composée",
        formulas: [
          { text: '$(g\\circ f)(a) = g(f(a))$', condition: 'lire f(a) sur $C_f$, puis reporter cette valeur sur l’axe des x de $C_g$' },
          { text: "image hors du domaine : $(g\\circ f)(a)$ n'existe pas", condition: 'quand f(a) sort du domaine de g' },
          { text: 'hors de la portion tracée : pas lisible sur ce graphique', condition: 'g peut y être définie — ce n’est pas « n’existe pas »' },
        ],
      },
      {
        title: 'Fonctions en contexte',
        formulas: [
          { text: '$h(r) = \\dfrac{V}{\\pi r^2}$', condition: 'hauteur d’un cylindre de volume V, en fonction de son rayon r' },
          { text: '$A_{lat}(r) = 2\\pi r \\cdot h(r)$', condition: 'aire latérale : h(r) réinjectée, une composition' },
          { text: 'domaine physique : plus restrictif que le domaine mathématique', condition: 'longueurs, durées, quantités positives' },
          { text: '$c(x) = \\dfrac{C(x)}{x}$', condition: 'coût unitaire : un quotient, pas une composition' },
          { text: '$B(x) = CA(x) - C(x)$', condition: 'bénéfice ; seuil de rentabilité : la plus petite solution de B(x) = 0' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Domaine de définition** — repérer dénominateurs et racines paires, poser une condition par risque (racine au dénominateur : stricte ; diviser par un négatif : le sens change), combiner par intersection.',
      '**Composer** — (f∘g)(x) = f(g(x)) : g agit en premier, f en second (comme les chaussettes avant les chaussures) ; l’ordre compte, mais pas la place des parenthèses : (f∘g)∘h = f∘(g∘h).',
      '**Décomposer** — repérer la toute dernière opération effectuée, l’éplucher, recommencer.',
      '**Domaine d’une composée** — x ∈ dom g, ET g(x) ∈ dom f (là où l’image de g rencontre dom f) ; jamais lu sur la formule simplifiée ; l’intersection peut être bornée, voire vide.',
      '**Lecture graphique** — deux lectures successives, la sortie de la première devient l’entrée de la seconde ; hors du domaine : n’existe pas, hors du dessin : pas lisible.',
      '**En contexte** — isoler une grandeur en fonction d’une autre avant de la réinjecter ailleurs ; un coût unitaire C(x)/x est un quotient, pas une composition ; le domaine physique restreint souvent le domaine mathématique.',
    ],
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je repéré les 2 opérations à surveiller (dénominateur, racine paire) — sans poser de condition pour une racine impaire ou une valeur absolue ?',
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
