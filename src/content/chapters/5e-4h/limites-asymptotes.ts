import type { ChapterContent } from '../../types'

export const limitesAsymptotes: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 4,
  title: 'Limites et asymptotes',
  slug: 'limites-asymptotes',
  lede:
    "Une **limite** décrit ce que fait une fonction quand $x$ se rapproche d'une valeur précise " +
    "— ou part très loin, vers $+\\infty$ ou $-\\infty$. Dans ce chapitre, tu vas apprendre à " +
    "**calculer** une limite (même une forme indéterminée), à **reconnaître** une asymptote " +
    "oblique juste en comparant deux degrés, à **lire** limites et asymptotes directement sur " +
    "un graphique, à **traduire** un phénomène concret (saturation, seuil) en limite, et enfin " +
    "à mener une **étude complète** d'une fonction rationnelle : domaine, asymptotes, limites à " +
    'chaque borne.',

  sections: [
    {
      id: 'limites-calcul',
      number: 1,
      title: 'Limites, reconnaissance et calcul',
      kicker:
        'bornes du domaine, définition intuitive, limite à gauche/à droite, limites de référence, ' +
        'formes indéterminées et techniques de levée',
      blocks: [
        { kind: 'video', title: 'Introduction : que devient f(x) ?', youtubeId: 'Ox4FLOO-Fus' },
        { kind: 'video', title: 'Notion de limite : bornes du domaine, limite à gauche/à droite, limites de référence', youtubeId: 'GXuoF1-6fLU' },
        { kind: 'video', title: 'Formes indéterminées et opérations sur les limites : 0/0, ∞/∞, ∞−∞', youtubeId: 'BdqbQlLk19I' },
        { kind: 'video', title: 'Calculer des limites : ∞/∞, ∞−∞ et limite qui n\'existe pas', youtubeId: 'n3lIgfR4_GQ' },
        { kind: 'video', title: 'Point vide ou asymptote verticale ? Tester le numérateur avant de conclure', youtubeId: 'h6Ft2QTFVk4' },
        {
          kind: 'intuition',
          label: 'Tu connais déjà ça',
          text:
            "Tu as déjà rencontré le **domaine de définition** dans le chapitre précédent : les " +
            "valeurs de x qu'une fonction refuse. Ce chapitre part de là. Que devient f(x) quand " +
            "x s'approche d'une valeur interdite, sans jamais l'atteindre ? Et que devient f(x) " +
            "quand x part très loin, vers $+\\infty$ ou $-\\infty$ ? C'est exactement ce que " +
            'décrit une **limite**.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — bornes du domaine',
          items: [
            'Les **bornes du domaine**, ce sont les extrémités des intervalles où une fonction ' +
              'est définie. Pour une fonction rationnelle : les valeurs qui annulent le ' +
              "dénominateur, plus $-\\infty$ et $+\\infty$ si le domaine part à l'infini. " +
              'Exemple : $f(x) = \\dfrac{x-1}{x^2-x-6}$ a pour domaine $\\mathbb{R} \\setminus ' +
              '\\{-2\\,;3\\}$ — ses bornes sont −2, 3, −∞ et +∞. Pour calculer une limite ' +
              "quelque part, il faut que f soit définie tout près de cet endroit. Autrement dit " +
              ': la cible doit être une borne du domaine, ou en faire partie.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'domainLine',
            min: -6,
            max: 7,
            segments: [
              { from: 'min', to: -2 },
              { from: -2, to: 3 },
              { from: 3, to: 'max' },
            ],
            points: [
              { value: -2, closed: false, label: '−2', tone: 'bad' },
              { value: 3, closed: false, label: '3', tone: 'bad' },
            ],
            extraTicks: [{ value: 0, label: '0' }],
            axisLabel: 'dom f',
            caption:
              'domaine de $f(x)=\\dfrac{x-1}{x^2-x-6}$ : la droite réelle, sauf les deux points −2 et 3, ' +
              'qui annulent le dénominateur',
          },
        },
        {
          kind: 'intuition',
          label: 'Se rapprocher sans jamais toucher',
          text:
            'Imagine une voiture qui roule vers un mur, en freinant de plus en plus fort. Elle ' +
            "se rapproche d'autant plus du mur qu'elle avance — mais sans jamais vraiment le " +
            "toucher. Une **limite**, c'est ce principe, avec des nombres : f(x) se rapproche " +
            "d'autant plus près d'une valeur L que x se rapproche d'une cible a, sans forcément " +
            "l'atteindre.",
        },
        {
          kind: 'rappel',
          label: 'Rappel — définition intuitive d\'une limite',
          items: [
            '$\\displaystyle\\lim_{x \\to a} f(x) = L$ se lit : f(x) se rapproche d\'autant plus ' +
              'de L que x se rapproche de a — sans forcément l\'atteindre. La cible a peut être ' +
              'un nombre réel ou $\\pm\\infty$. La limite L aussi. Les 4 combinaisons existent : ' +
              'limite finie en un point, limite infinie en un point, limite finie à l\'infini, ' +
              'limite infinie à l\'infini.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Rendre rigoureuse une idée qui semblait couler de source',
          text:
            "La définition que tu viens de lire — « f(x) se rapproche d'autant plus de L que x " +
            "se rapproche de a » — ressemble à du bon sens, mais elle est restée VAGUE pendant " +
            "plus d'un siècle après l'invention du calcul différentiel par Newton et Leibniz. " +
            'Mathématiciens et physiciens parlaient d\'« infiniment petit » sans jamais le ' +
            "définir précisément, ce qui provoquait de vrais désaccords. C'est le mathématicien " +
            'français **Augustin-Louis Cauchy** qui, dans son Cours d\'Analyse (1821), pose les ' +
            "premières bases vraiment rigoureuses de la notion de limite — en insistant pour la " +
            'première fois sur l\'idée de « se rapprocher d\'aussi près qu\'on veut », exactement ' +
            "la formulation intuitive que tu utilises aujourd'hui.",
          image: {
            src: '/images/historique/cauchy.jpg',
            alt: 'Portrait d\'Augustin-Louis Cauchy',
            caption: 'Augustin-Louis Cauchy (1789–1857), portrait du 19e siècle.',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — limite à gauche, limite à droite',
          items: [
            'La **limite à gauche** de f en a (notée $\\displaystyle\\lim_{x \\to a^-} f(x)$) ne ' +
              'regarde que les valeurs de x proches de a et strictement INFÉRIEURES à a. La ' +
              '**limite à droite** ($\\displaystyle\\lim_{x \\to a^+} f(x)$) ne regarde que les ' +
              'valeurs strictement SUPÉRIEURES à a. Si les deux diffèrent, ' +
              '$\\displaystyle\\lim_{x \\to a} f(x)$ n\'existe pas. Tu peux quand même donner la ' +
              'limite à gauche et la limite à droite séparément — regarde l\'exemple ci-dessous, ' +
              'et les deux exemples d\'asymptote verticale plus loin.',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — limites de référence à connaître',
          items: [
            '$\\displaystyle\\lim_{x \\to +\\infty} x^n = +\\infty$ (n≥1) ; en −∞, +∞ si n est pair, −∞ si n est impair.',
            '$\\displaystyle\\lim_{x \\to \\pm\\infty} 1/x = 0$ ; $\\displaystyle\\lim_{x \\to 0^+} 1/x = +\\infty$ ; $\\displaystyle\\lim_{x \\to 0^-} 1/x = -\\infty$.',
            '$\\displaystyle\\lim_{x \\to +\\infty} \\sqrt{x} = +\\infty$.',
            'La limite d\'un **polynôme** en ±∞, c\'est la limite de son terme de plus haut ' +
              'degré. Tous les autres termes deviennent négligeables face à lui.',
            'La limite d\'une **fonction rationnelle** $\\dfrac{N(x)}{D(x)}$ en ±∞ se lit en comparant les ' +
              'degrés. $\\deg N<\\deg D \\Rightarrow 0$. $\\deg N=\\deg D \\Rightarrow$ rapport des coefficients dominants. ' +
              '$\\deg N>\\deg D \\Rightarrow$ limite infinie.',
          ],
        },
        {
          kind: 'application',
          titre: 'Pourquoi un parachutiste cesse d\'accélérer',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 200 * (1 - Math.exp(-0.2 * t)), tone: 'accent' }],
              xMin: 0,
              xMax: 30,
              xTicks: [10, 20, 30],
              yTicks: [100, 200],
              horizontalAsymptotes: [{ y: 200, label: 'v_max = 200 km/h' }],
              xAxisLabel: 'temps de chute (s)',
              yAxisLabel: 'vitesse (km/h)',
              caption:
                'La vitesse grimpe vite dans les premières secondes, puis se rapproche de plus ' +
                'en plus lentement de 200 km/h sans jamais vraiment l\'atteindre — une asymptote ' +
                'horizontale, exactement comme les courbes de cette section.',
            },
          ],
          text:
            "Quand un parachutiste saute, la gravité l'accélère... mais pas indéfiniment : " +
            "l'air exerce une résistance qui augmente avec la vitesse. Sa vitesse $v(t)$ suit " +
            'une courbe qui ressemble exactement à celles que tu étudies ici — elle grimpe vite ' +
            'au début, puis se rapproche de plus en plus lentement d\'une valeur limite, sans ' +
            'jamais vraiment l\'atteindre : $\\displaystyle\\lim_{t \\to +\\infty} v(t) = ' +
            'v_{max}$, la **vitesse terminale** (environ 200 km/h en chute libre). Cette ' +
            'asymptote horizontale n\'est pas qu\'une curiosité mathématique : c\'est elle qui ' +
            "garantit qu'un parachutiste n'accélère pas indéfiniment jusqu'au sol.",
          domaines: ['Physique', 'Aérodynamique'],
          image: {
            src: '/images/application/parachutiste.jpg',
            alt: 'Parachutiste en chute libre',
            caption: 'Un parachutiste en chute libre, proche de sa vitesse terminale. Photo : Rstpch, CC BY-SA 4.0, via Wikimedia Commons.',
          },
        },
        {
          kind: 'intuition',
          label: 'Pourquoi ne peut-on pas juste calculer ?',
          text:
            'Face à $\\infty - \\infty$, tu pourrais croire que ça vaut toujours 0 : « l\'infini ' +
            'moins l\'infini, ça s\'annule ». Faux ! Tout dépend de la VITESSE à laquelle chaque ' +
            'terme grandit. Selon les fonctions, la différence peut tendre vers un nombre fini, ' +
            'vers l\'infini, ou vers 0 — les trois sont possibles. C\'est pour ça qu\'une forme ' +
            'indéterminée oblige à un vrai calcul : rien n\'est automatique.',
        },
        {
          kind: 'methode',
          label: 'Méthode — 3 formes indéterminées, 3 techniques',
          items: [
            '**0/0** — factorise numérateur et dénominateur par leur facteur commun, puis simplifie.',
            '**∞/∞** — mets en évidence (factorise) le terme de plus haut degré, au numérateur ET au dénominateur.',
            '**∞−∞** — mets en évidence le terme dominant pour des polynômes, ou multiplie par ' +
              'l\'expression conjuguée s\'il y a des racines.',
          ],
        },
        {
          kind: 'para',
          text:
            'Quand $\\lim f(x)$ et $\\lim g(x)$ existent, pour la même cible, tu lis directement ' +
            'la limite de la somme, du produit ou du quotient dans les tableaux ci-dessous. SAUF ' +
            'les cas en rouge : ils sont indéterminés, et demandent une des 3 techniques ci-dessus.',
        },
        {
          kind: 'featureTable',
          caption: 'Somme f+g',
          headers: ['lim f', 'lim g', 'lim(f+g)'],
          rows: [
            ['m', 'p', { text: 'm+p', tone: 'good' }],
            ['+∞', '+∞', { text: '+∞', tone: 'good' }],
            ['−∞', '−∞', { text: '−∞', tone: 'good' }],
            ['+∞', '−∞', { text: 'indét. (∞−∞)', tone: 'bad' }],
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Produit f×g',
          headers: ['lim f', 'lim g', 'lim(f×g)'],
          rows: [
            ['m≠0', '±∞', { text: '±∞ (signe de m)', tone: 'good' }],
            ['+∞', '+∞', { text: '+∞', tone: 'good' }],
            ['+∞', '−∞', { text: '−∞', tone: 'good' }],
            ['0', '±∞', { text: 'indét. (0×∞)', tone: 'bad' }],
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Quotient f ÷ g',
          headers: ['lim f', 'lim g', 'lim(f/g)'],
          rows: [
            ['m', 'p≠0', { text: '$\\dfrac{m}{p}$', tone: 'good' }],
            ['m≠0', '0', { text: '±∞ (signe à étudier)', tone: 'good' }],
            ['±∞', 'p≠0', { text: '±∞', tone: 'good' }],
            ['0', '0', { text: 'indét. (0/0)', tone: 'bad' }],
            ['±∞', '±∞', { text: 'indét. (∞/∞)', tone: 'bad' }],
          ],
        },
        {
          kind: 'exemple',
          badge: 'forme 0/0 — factorisation',
          formula: '$\\displaystyle\\lim_{x \\to 2} \\dfrac{x^2-5x+6}{x-2}$',
          steps: [
            { tag: 'vérifier la forme', text: 'En $x=2$ : numérateur $2^2-5\\cdot 2+6=0$ et dénominateur $2-2=0$ → forme $\\dfrac{0}{0}$, il faut factoriser' },
            { tag: 'factoriser le numérateur — trouver une racine commune avec le dénominateur', text: '$x^2-5x+6 = (x-2)(x-3)$' },
            { tag: 'simplifier, valable pour x≠2', text: '$\\dfrac{(x-2)(x-3)}{x-2} = x-3$' },
          ],
          result: { tag: 'conclusion — limite', text: '$\\displaystyle\\lim_{x \\to 2} \\dfrac{x^2-5x+6}{x-2} = 2-3 = -1$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x - 3, tone: 'accent' }],
            xMin: -2,
            xMax: 6,
            xTicks: [2],
            fixedYRange: { min: -6, max: 3 },
            points: [{ x: 2, y: -1, label: '(2;−1)', tone: 'good', style: 'open', labelPos: 'right' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\dfrac{x^2-5x+6}{x-2}$ — une droite $y=x-3$ avec un point vide en $(2\\,;-1)$, même ' +
              'mécanisme que le point vide vu plus loin',
          },
        },
        {
          kind: 'exemple',
          badge: 'forme ∞/∞ — mise en évidence du terme dominant',
          formula: '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{3x^2-5x+1}{x^2+2}$',
          steps: [
            { tag: 'vérifier la forme', text: 'numérateur→+∞ et dénominateur→+∞ : les deux partent vers l\'infini → forme ∞/∞' },
            {
              tag: 'mettre x² en évidence au numérateur ET au dénominateur',
              text: '$\\dfrac{3x^2-5x+1}{x^2+2} = \\dfrac{x^2(3-5/x+1/x^2)}{x^2(1+2/x^2)} = \\dfrac{3-5/x+1/x^2}{1+2/x^2}$',
            },
          ],
          result: { tag: 'passer à la limite — chaque terme en 1/x, 1/x² tend vers 0', text: '$\\displaystyle\\lim_{x \\to +\\infty} = \\dfrac{3}{1} = 3$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => (3 * x * x - 5 * x + 1) / (x * x + 2), tone: 'accent' }],
            xMin: 0,
            xMax: 22,
            xTicks: [4, 20],
            fixedYRange: { min: 0, max: 4 },
            horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
            points: [
              { x: 4, y: (3 * 16 - 20 + 1) / (16 + 2), label: 'f(4)≈1,61', tone: 'accent', labelPos: 'below' },
              { x: 20, y: (3 * 400 - 100 + 1) / (400 + 2), label: 'f(20)≈2,74', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{3x^2-5x+1}{x^2+2}$ — la courbe se rapproche d\'autant plus de $y=3$ que x augmente. Elle ne la touche plus pour x>−1 : elle la croise une seule fois, en x=−1, hors de la fenêtre.',
          },
        },
        {
          kind: 'exemple',
          badge: 'forme ∞−∞ — expression conjuguée',
          formula: '$\\displaystyle\\lim_{x \\to +\\infty} [\\sqrt{x^2+1} - x]$',
          steps: [
            { tag: 'vérifier la forme', text: 'les deux termes $\\sqrt{x^2+1}$ et x tendent vers +∞ → forme ∞−∞, impossible de conclure directement' },
            {
              tag: 'multiplier par l\'expression conjuguée',
              text: '$\\sqrt{x^2+1} - x = \\dfrac{(\\sqrt{x^2+1}-x)(\\sqrt{x^2+1}+x)}{\\sqrt{x^2+1}+x} = \\dfrac{x^2+1-x^2}{\\sqrt{x^2+1}+x} = \\dfrac{1}{\\sqrt{x^2+1}+x}$',
            },
          ],
          result: { tag: 'passer à la limite — le dénominateur tend vers +∞', text: '$\\displaystyle\\lim_{x \\to +\\infty} = 0$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.sqrt(x * x + 1) - x, tone: 'accent' }],
            xMin: 0,
            xMax: 20,
            // Pas de graduation en x=10 : coïncide avec le point f(10) juste en dessous, qui
            // affiche déjà cette valeur — chevauchement constaté à l'écran.
            xTicks: [],
            fixedYRange: { min: 0, max: 1.1 },
            horizontalAsymptotes: [{ y: 0, label: 'y=0' }],
            points: [
              // 'right' plutôt que 'above' par défaut : x=0 coïncide avec l'axe des y, "f(0)=1"
              // en 'above' chevauchait l'étiquette "f(x)" de l'axe — chevauchement constaté.
              { x: 0, y: 1, label: 'f(0)=1', tone: 'accent', labelPos: 'right' },
              { x: 10, y: Math.sqrt(101) - 10, label: 'f(10)≈0,05', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\sqrt{x^2+1}-x$ — la courbe décroît et se rapproche d\'autant plus de 0 (l\'axe des ' +
              'x lui-même) que x augmente',
          },
        },
        {
          kind: 'exemple',
          badge: 'quand la limite n\'existe pas — limites différentes à gauche et à droite',
          formula: 'Soit $f(x) = x+3$ si $x \\le 2$, et $f(x) = x-3$ si $x>2$. La limite $\\displaystyle\\lim_{x \\to 2} f(x)$ existe-t-elle ?',
          steps: [
            { tag: 'valeur en x=2 — donnée par la première branche (x≤2)', text: '$f(2) = 2+3 = 5$' },
            { tag: 'limite à droite — deuxième branche (x>2), quand x→2⁺', text: '$\\displaystyle\\lim_{x \\to 2^+} f(x) = 2-3 = -1$' },
          ],
          result: {
            tag: 'conclusion',
            text: '$f(2)=5$ mais $\\displaystyle\\lim_{x \\to 2^+} f(x)=-1$ : les deux valeurs ne coïncident pas, donc $\\displaystyle\\lim_{x \\to 2} f(x)$ n\'existe pas (la courbe fait un saut en x=2).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x + 3, tone: 'accent', xMin: -2, xMax: 2 },
              { fn: (x) => x - 3, tone: 'accent', xMin: 2, xMax: 7 },
            ],
            xMin: -2,
            xMax: 7,
            xTicks: [2],
            points: [
              { x: 2, y: 5, label: '(2;5)', tone: 'accent', style: 'filled', labelPos: 'above' },
              { x: 2, y: -1, label: '(2;−1)', tone: 'bad', style: 'open', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=x+3$ si $x\\le 2$, $f(x)=x-3$ si $x>2$ — un saut en x=2 : la limite à droite (point ' +
              'vide en −1) ne rejoint pas f(2)=5',
          },
        },
        {
          kind: 'attention',
          label: 'Une fonction définie EN a n\'a pas forcément une limite EN a',
          text:
            'Que f(a) existe ne garantit rien sur $\\displaystyle\\lim_{x \\to a} f(x)$ ! Ce sont ' +
            'deux questions différentes. Une fonction peut être définie partout, sans aucun trou ' +
            'dans son domaine, et pourtant ne pas avoir de limite en un point précis. Ça arrive ' +
            'dès que la limite à gauche et la limite à droite de ce point diffèrent : c\'est un ' +
            '**saut** dans la courbe.',
        },
        {
          kind: 'intuition',
          label: 'Pour ne plus confondre les deux',
          text:
            'Deux situations se ressemblent, mais ne sont pas pareilles. Un **point vide** : le ' +
            'numérateur ET le dénominateur s\'annulent au même endroit, tu simplifies, et il ne ' +
            'reste qu\'un petit trou invisible dans la courbe — comme un nid-de-poule rebouché. ' +
            'Une **vraie asymptote verticale** : seul le dénominateur s\'annule, et la courbe ' +
            's\'envole réellement vers $+\\infty$ ou $-\\infty$ — comme un gouffre, impossible à ' +
            'combler. Le réflexe à avoir : teste toujours le numérateur AVANT de conclure.',
        },
        {
          kind: 'exemple',
          badge: 'vraie asymptote verticale — le numérateur ne s\'annule PAS',
          formula: '$\\displaystyle\\lim_{x \\to -3} \\dfrac{2x-5}{x+3}$, à gauche puis à droite de −3.',
          steps: [
            {
              tag: 'vérifier la forme — dénominateur nul, numérateur non nul',
              text:
                'En $x=-3$ : numérateur $2(-3)-5=-11\\neq 0$ et dénominateur $-3+3=0$ → forme $\\dfrac{-11}{0}$. Ce ' +
                'n\'est PAS une forme indéterminée : la limite est infinie, il reste à trouver son signe.',
            },
            {
              tag: 'signe du dénominateur de chaque côté de −3',
              text:
                '$x \\to -3^-$ (ex. $x=-3{,}1$) : $x+3=-0{,}1$ (négatif) — $x \\to -3^+$ (ex. $x=-2{,}9$) : $x+3=0{,}1$ (positif)',
            },
          ],
          result: {
            tag: 'conclusion — limites à gauche et à droite, de signes opposés',
            text:
              '$\\displaystyle\\lim_{x \\to -3^-} \\dfrac{2x-5}{x+3} = \\dfrac{-11}{0^-} = +\\infty$ ; ' +
              '$\\displaystyle\\lim_{x \\to -3^+} \\dfrac{2x-5}{x+3} = \\dfrac{-11}{0^+} = -\\infty$ — ' +
              'la droite x=−3 est bien une **asymptote verticale**.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (2 * x - 5) / (x + 3), tone: 'accent', xMin: -13, xMax: -3.2 },
              { fn: (x) => (2 * x - 5) / (x + 3), tone: 'accent', xMin: -2.8, xMax: 20 },
            ],
            xMin: -13,
            xMax: 20,
            xTicks: [-5, 7],
            fixedYRange: { min: -12, max: 14 },
            verticalAsymptotes: [{ x: -3, label: 'x=−3' }],
            horizontalAsymptotes: [{ y: 2, label: 'y=2' }],
            points: [
              { x: -5, y: (2 * -5 - 5) / (-5 + 3), label: 'f(−5)=7,5', tone: 'accent', labelPos: 'above' },
              { x: 7, y: (2 * 7 - 5) / (7 + 3), label: 'f(7)=0,9', tone: 'accent', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\dfrac{2x-5}{x+3}$ : asymptote verticale $x=-3$ ($+\\infty$ à gauche, $-\\infty$ à droite) et ' +
              'asymptote horizontale y=2, car deg(N)=deg(D)',
          },
        },
        {
          kind: 'exemple',
          badge: 'point vide — un trou invisible sur le graphique',
          formula: '$\\displaystyle\\lim_{x \\to -3} \\dfrac{x^2-9}{x+3}$, puis décris le graphique de cette fonction.',
          steps: [
            { tag: 'vérifier la forme', text: 'En $x=-3$ : numérateur $(-3)^2-9=0$ et dénominateur $-3+3=0$ → forme $\\dfrac{0}{0}$' },
            { tag: 'factoriser le numérateur — différence de carrés', text: '$x^2-9 = (x-3)(x+3)$' },
            { tag: 'simplifier, valable pour x≠−3', text: '$\\dfrac{(x-3)(x+3)}{x+3} = x-3$' },
          ],
          result: { tag: 'conclusion — limite', text: '$\\displaystyle\\lim_{x \\to -3} \\dfrac{x^2-9}{x+3} = -3-3 = -6$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x - 3, tone: 'accent' }],
            xMin: -8,
            xMax: 5,
            xTicks: [-3],
            fixedYRange: { min: -11, max: 2 },
            points: [{ x: -3, y: -6, label: '(−3;−6)', tone: 'good', style: 'open', labelPos: 'left' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{x^2-9}{x+3}$ : une droite $y=x-3$, avec un point vide en $(-3\\,;-6)$ — invisible à l\'échelle normale, mais bien réel',
          },
        },
        {
          kind: 'piege',
          label: 'Diviser par (x−a) n\'est valable que pour x≠a',
          text:
            'Dans le premier exemple, la simplification $(x-2)(x-3)/(x-2)=x-3$ n\'est vraie QUE ' +
            'pour $x \\neq 2$. C\'est exactement pour ça qu\'on peut s\'en servir pour calculer ' +
            'une **limite** : on ne demande jamais la valeur EN x=2, seulement ce qui se passe ' +
            'AUTOUR de x=2. Mais jamais pour affirmer que f(2)=−1 ! f n\'est même pas définie en x=2.',
        },
        {
          kind: 'atelier',
          tag: 'point-vide-ou-asymptote-widget',
          label: 'Manipule toi-même — nid-de-poule ou gouffre ?',
          caption:
            'Règle les deux racines du numérateur : dès que l\'une d\'elles vaut −3 (la racine du ' +
            'dénominateur), un rond creux vert apparaît — le point vide, comblé. Sinon, une ligne ' +
            'violette pointillée matérialise la vraie asymptote — le gouffre, infranchissable.',
        },
        {
          kind: 'astuce',
          label: 'Repérer la forme AVANT de se lancer dans le calcul',
          text:
            'Remplace d\'abord x par la valeur cible — ou observe la tendance, si la cible est ' +
            '±∞. Tu sais tout de suite si tu es dans une forme **déterminée** (calcul direct ' +
            'possible) ou **indéterminée** (0/0, ∞/∞, ∞−∞, qui demandent une transformation). ' +
            'Sauter ce diagnostic fait perdre du temps sur des formes qui n\'en avaient pas besoin.',
        },
        {
          kind: 'historique',
          titre: 'Chasser le flou avec des epsilon et des delta',
          text:
            'Même la définition de Cauchy restait encore un peu floue : que veut vraiment dire ' +
            '« aussi proche qu\'on veut » ? C\'est le mathématicien allemand **Karl ' +
            'Weierstrass**, dans les années 1850-1860, qui transforme cette idée intuitive en ' +
            'une définition totalement rigoureuse, purement basée sur des nombres : pour TOUT ' +
            '$\\varepsilon>0$ (une marge d\'erreur aussi petite que tu veux), il existe un ' +
            '$\\delta>0$ tel que $|x-a|<\\delta$ entraîne $|f(x)-L|<\\varepsilon$. Cette ' +
            'définition, dite « epsilon-delta », met fin à deux siècles de débats sur ce ' +
            "qu'est réellement une limite — et c'est encore exactement elle qui est enseignée " +
            'partout aujourd\'hui, même si ce chapitre reste volontairement à la version ' +
            'intuitive que tu viens d\'apprendre.',
          image: {
            src: '/images/historique/weierstrass.jpg',
            alt: 'Portrait de Karl Weierstrass',
            caption: 'Karl Weierstrass (1815–1897), photographie d\'époque.',
          },
        },
        {
          kind: 'entrainement',
          title: 'Limites, reconnaissance et calcul',
          generatorId: '5gen20',
          description: [
            'Reconnais la nature d\'une limite (finie, forme k/0 donc infinie, ou forme ' +
              'indéterminée 0/0 ou ∞/∞), puis calcule-la : factorisation, terme dominant mis en ' +
              'évidence, ou étude de signe, selon le cas.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 20. Limites, reconnaissance et calcul »',
        },
      ],
    },
    {
      id: 'asymptote-oblique',
      number: 2,
      title: 'Asymptote oblique',
      kicker:
        'définir une asymptote (AV/AH/AO, cas général) ; y = ax + b, avec a = lim f(x)/x et ' +
        'b = lim (f(x) − ax) — lien avec le degré de N et D',
      blocks: [
        { kind: 'video', title: 'Définir une asymptote : verticale, horizontale, oblique', youtubeId: 'Fa8J6v_n4Pw' },
        { kind: 'video', title: 'Asymptote oblique : comparer les degrés, deux méthodes, piège du reste', youtubeId: 'sVluREzWUF0' },
        {
          kind: 'intuition',
          label: 'Pour visualiser une asymptote horizontale',
          text:
            'Imagine une boisson bien chaude, posée dans une pièce à 20°C. Sa température baisse ' +
            'vite au début, puis de moins en moins vite : elle se rapproche d\'autant plus de ' +
            '20°C que le temps passe, sans jamais descendre en dessous. Une **asymptote ' +
            'horizontale**, c\'est ce genre de plancher (ou de plafond) : une valeur que la ' +
            'courbe approche d\'aussi près que tu veux, en général sans l\'atteindre. « En ' +
            'général » seulement : une courbe peut croiser son asymptote, parfois plusieurs fois. ' +
            'Ce qui compte, c\'est qu\'elle s\'en rapproche indéfiniment aux extrémités (voir ' +
            'l\'étude complète, section 5).',
        },
        {
          kind: 'definition',
          label: 'Rappel — définir une asymptote, le cas général',
          items: [
            'Une droite est **asymptote** au graphique de f quand ce graphique s\'approche de ' +
              'plus en plus de cette droite, à mesure que x (ou f(x)) part vers l\'infini. Cette ' +
              'définition vaut pour TOUTE fonction f. La comparaison des degrés, plus bas, n\'est ' +
              'qu\'une méthode pratique — elle ne marche que pour les fonctions rationnelles.',
            'Une **asymptote verticale (AV)** d\'équation x=a existe si ' +
              '$\\displaystyle\\lim_{x \\to a^+} f(x) = \\pm\\infty$ ou ' +
              '$\\displaystyle\\lim_{x \\to a^-} f(x) = \\pm\\infty$.',
            'Une **asymptote horizontale (AH)** d\'équation y=b existe si ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} f(x) = b$ ou ' +
              '$\\displaystyle\\lim_{x \\to -\\infty} f(x) = b$.',
            'Une **asymptote oblique (AO)** d\'équation $y=ax+b$ ($a \\neq 0$) existe si ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} [f(x)-(ax+b)] = 0$ ou ' +
              '$\\displaystyle\\lim_{x \\to -\\infty} [f(x)-(ax+b)] = 0$.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Un mot grec pour « qui ne tombe jamais ensemble »',
          text:
            'Le mot « asymptote » vient du grec ancien asymptōtos, littéralement « qui ne ' +
            'tombe pas ensemble » — a- (sans), syn- (ensemble), ptotos (qui tombe). Il est ' +
            'utilisé pour la première fois par le mathématicien grec **Apollonios de Perge**, ' +
            'vers 200 avant J.-C., dans son grand traité sur les coniques, pour décrire les ' +
            'droites dont s\'approche indéfiniment une hyperbole sans jamais les toucher — ' +
            'exactement l\'idée que tu étudies dans cette section, plus de deux mille ans plus ' +
            'tard. Le mot a ensuite été repris pour n\'importe quelle courbe, pas seulement ' +
            'l\'hyperbole d\'Apollonios — mais pour d\'autres courbes, « ne jamais toucher » ne ' +
            'tient plus : seul compte le rapprochement indéfini.',
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 1 / (x - 1), tone: 'accent', xMin: -2, xMax: 0.8 },
                { fn: (x) => 1 / (x - 1), tone: 'accent', xMin: 1.2, xMax: 4 },
              ],
              xMin: -2,
              xMax: 4,
              xTicks: [],
              fixedYRange: { min: -6, max: 6 },
              verticalAsymptotes: [{ x: 1 }],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'asymptote verticale',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 2 - 1 / (x + 2), tone: 'accent' }],
              xMin: -1,
              xMax: 8,
              xTicks: [],
              horizontalAsymptotes: [{ y: 2 }],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'asymptote horizontale',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => x + 1 / (x + 2), tone: 'accent' }],
              xMin: 0,
              xMax: 8,
              xTicks: [],
              obliqueAsymptotes: [{ a: 1, b: 0 }],
              showYAxis: false,
              xAxisLabel: '',
              yAxisLabel: '',
              caption: 'asymptote oblique',
            },
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — condition d\'existence d\'une asymptote oblique',
          items: [
            'La droite d\'équation y=ax+b (a≠0) est asymptote oblique à la courbe de f en +∞ ' +
              '(ou en −∞) si $\\displaystyle\\lim_{x \\to +\\infty} [f(x)-(ax+b)] = 0$ (ou en −∞). En pratique, ' +
              'tu trouves a et b par deux limites successives : $a = \\displaystyle\\lim_{x \\to \\pm\\infty} ' +
              '\\dfrac{f(x)}{x}$ puis $b = \\displaystyle\\lim_{x \\to \\pm\\infty} [f(x) - ax]$.',
          ],
        },
        {
          kind: 'methode',
          label: 'Méthode — lien avec le degré, pour une fonction rationnelle N(x) ÷ D(x)',
          items: [
            '**deg(N) < deg(D)** ⟹ asymptote HORIZONTALE particulière : **y=0**. a=0 et b=0, la ' +
              'fraction tend directement vers 0.',
            '**deg(N) = deg(D)** ⟹ asymptote HORIZONTALE. a=0, b=rapport des coefficients ' +
              'dominants : c\'est un cas particulier du modèle oblique.',
            '**deg(N) = deg(D)+1** ⟹ asymptote OBLIQUE (a fini non nul).',
            '**deg(N) ≥ deg(D)+2** ⟹ PAS d\'asymptote de cette forme : a est infini, ou ' +
              'n\'existe pas. La courbe diverge plus vite qu\'une droite.',
            'En résumé : une asymptote HORIZONTALE existe dès que deg(N) ≤ deg(D). Une ' +
              'asymptote OBLIQUE (non horizontale) existe seulement si deg(N) = deg(D)+1, exactement.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'asymptote oblique — deux méthodes, même résultat',
          formula: '$f(x) = \\dfrac{x^2-3x+5}{x-1}$. Détermine l\'équation de son asymptote oblique.',
          steps: [
            { tag: 'vérifier la condition de degré', text: 'deg(numérateur)=2, deg(dénominateur)=1, soit exactement 1 de plus → asymptote oblique garantie' },
            { tag: 'méthode 1 — division euclidienne de x²−3x+5 par x−1', text: '$x^2-3x+5 = (x-1)(x-2) + 3$' },
            { tag: 'réécrire f(x)', text: '$f(x) = x-2 + \\dfrac{3}{x-1}$' },
            { tag: 'méthode 2 — vérification par les limites : a = lim f(x)/x', text: '$a = \\displaystyle\\lim_{x \\to +\\infty} \\dfrac{x^2-3x+5}{x^2-x} = 1$ (rapport des coefficients dominants $x^2/x^2$)' },
            { tag: 'b = lim (f(x) − x)', text: '$b = \\displaystyle\\lim_{x \\to +\\infty} \\dfrac{-2x+5}{x-1} = -2$ (rapport des coefficients dominants $-2x/x$)' },
          ],
          result: { tag: 'asymptote oblique — le quotient SEUL, jamais le reste', text: '$y = x-2$' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => (x * x - 3 * x + 5) / (x - 1), tone: 'accent' }],
            xMin: 3,
            xMax: 15,
            xTicks: [7, 13],
            fixedYRange: { min: 0, max: 13 },
            points: [
              { x: 7, y: 5.5, label: 'f(7)=5,5', tone: 'accent', labelPos: 'below' },
              { x: 13, y: 11.25, label: 'f(13)=11,25', tone: 'accent', labelPos: 'right' },
            ],
            obliqueAsymptotes: [{ a: 1, b: -2, label: 'y=x−2' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{x^2-3x+5}{x-1}$ pour $x\\ge 3$ — l\'écart avec la droite $y=x-2$ (il vaut $\\dfrac{3}{x-1}$) se réduit à mesure que x grandit',
          },
        },
        {
          kind: 'piege',
          label: 'Le reste n\'appartient jamais à l\'équation de l\'asymptote',
          text:
            'Avec $f(x) = x-2 + \\dfrac{3}{x-1}$, l\'erreur classique : écrire l\'asymptote ' +
            '« $y = x-2+\\dfrac{3}{x-1}$ ». Mais c\'est f(x) elle-même, pas une droite ! L\'asymptote, c\'est ' +
            'UNIQUEMENT le quotient $x-2$. Le reste, $3/(x-1)$, est justement le terme qui tend ' +
            'vers 0 — celui qui rapproche la courbe de la droite.',
        },
        {
          kind: 'astuce',
          label: 'Vérifier le degré avant de se lancer',
          text:
            'Si deg(N)=deg(D), inutile de chercher une oblique : c\'est une horizontale, avec ' +
            'a=0. Si deg(N)≥deg(D)+2, inutile aussi : aucune droite ne peut suivre une ' +
            'divergence aussi rapide.',
        },
        {
          kind: 'atelier',
          tag: 'degre-asymptote-widget',
          label: 'Manipule toi-même — les 4 cas du degré en direct',
          caption:
            'Dénominateur x−1 fixe, choisis le degré du numérateur : bascule entre les 4 cas de ' +
            'la méthode ci-dessus — horizontale y=0, horizontale par les coefficients dominants, ' +
            'oblique (le degré 2, réglage par défaut, reproduit exactement l\'exemple résolu), ou ' +
            'aucune asymptote de cette forme.',
        },
        {
          kind: 'entrainement',
          title: 'Asymptote oblique',
          generatorId: '5gen21',
          description: [
            'Détermine l\'équation y = ax + b d\'une asymptote oblique, par division euclidienne ou par la ' +
              'méthode des limites (a = lim f(x)/x, b = lim (f(x) − ax)) — pour un dénominateur de degré 1 ou 2.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 21. Asymptote oblique »',
        },
      ],
    },
    {
      id: 'lecture-graphique',
      number: 3,
      title: 'Limites et asymptotes — lecture graphique',
      kicker: 'lire limites et asymptotes directement sur un graphique, sans calcul',
      blocks: [
        { kind: 'video', title: 'Limites et asymptotes : lecture graphique', youtubeId: '6dFdWB1wZug' },
        {
          kind: 'para',
          text:
            'Sur un graphique, limites et asymptotes se lisent directement, sans le moindre ' +
            'calcul. Il suffit de savoir où regarder.',
        },
        {
          kind: 'methode',
          label: 'Méthode — ce qu\'il faut repérer sur un graphique',
          items: [
            'Une droite **VERTICALE** $x=a$ le long de laquelle la courbe part vers +∞ ou −∞ = ' +
              'asymptote verticale. Il suffit qu\'elle le fasse d\'UN côté. Le plus souvent, elle ' +
              'le fait des deux côtés, pas forcément avec le même signe ; mais d\'un côté, la ' +
              'courbe peut aussi arriver sur une valeur finie (un point isolé, voir plus bas).',
            'Une droite **HORIZONTALE** que la courbe rejoint aux extrémités ($x \\to -\\infty$ et/ou $x \\to +\\infty$) ' +
              '= asymptote horizontale. La courbe s\'aplatit : sa hauteur ne varie presque plus. ' +
              'Ce n\'est pas toujours la même droite des deux côtés : lis −∞ et +∞ séparément.',
            'Une droite **OBLIQUE** (ni horizontale ni verticale) que la courbe rejoint aux ' +
              'extrémités = asymptote oblique. La courbe continue de monter ou de descendre, ' +
              'mais épouse de plus en plus la pente de la droite.',
          ],
        },
        {
          kind: 'application',
          titre: 'Lire sur un graphique combien de temps un médicament reste actif',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 100 * Math.pow(0.5, t / 4), tone: 'accent' }],
              xMin: -1.5,
              xMax: 20,
              xTicks: [4, 8, 12, 16, 20],
              yTicks: [25, 50, 100],
              horizontalAsymptotes: [{ y: 0, label: '0 (jamais atteint)' }],
              points: [
                { x: 0, y: 100, label: '100 %', tone: 'accent', labelPos: 'above' },
                { x: 4, y: 50, label: '50 % — 1 demi-vie', tone: 'good', labelPos: 'above' },
                { x: 8, y: 25, label: '25 % — 2 demi-vies', tone: 'good', labelPos: 'right' },
              ],
              xAxisLabel: 'temps (h)',
              yAxisLabel: 'concentration (%)',
              caption:
                'Une demi-vie de 4 h : la concentration est divisée par deux toutes les 4 ' +
                "heures, en se rapprochant de 0 sans jamais l'atteindre — on lit la demi-vie en " +
                'cherchant où la courbe franchit la moitié de sa valeur précédente.',
            },
          ],
          text:
            "Après une injection, la concentration d'un médicament dans le sang suit une " +
            'courbe décroissante qui se rapproche d\'autant plus de 0 que le temps passe, sans ' +
            'jamais littéralement l\'atteindre — exactement la lecture graphique que tu ' +
            'pratiques dans cette section. Les médecins lisent directement sur ce type de ' +
            'graphique la **demi-vie** du médicament (le temps nécessaire pour que la ' +
            'concentration soit divisée par deux), information essentielle pour décider de la ' +
            'fréquence des prises : un médicament à demi-vie courte doit être repris plus ' +
            'souvent qu\'un médicament qui reste actif longtemps.',
          domaines: ['Médecine', 'Pharmacologie'],
        },
        {
          kind: 'exemple',
          badge: 'lecture directe sur un graphique',
          formula: 'Le graphique ci-dessous représente une fonction f. Lis les limites et les asymptotes visibles.',
          steps: [
            {
              tag: 'asymptote verticale — x=2, un signe différent de chaque côté',
              text: '$\\displaystyle\\lim_{x \\to 2^-} f(x) = -\\infty$ (la courbe plonge vers le bas juste à gauche de x=2) ; $\\displaystyle\\lim_{x \\to 2^+} f(x) = +\\infty$ (la courbe s\'envole vers le haut juste à droite de x=2)',
            },
            {
              tag: 'asymptote horizontale — y=1, aux deux extrémités',
              text: '$\\displaystyle\\lim_{x \\to -\\infty} f(x) = 1$ et $\\displaystyle\\lim_{x \\to +\\infty} f(x) = 1$',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              '2 asymptotes lues directement — la verticale x=2 et l\'horizontale y=1 — aucun ' +
              'calcul n\'était nécessaire, seulement une lecture attentive du graphique.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 1 + 1 / (x - 2), tone: 'accent', xMin: -3, xMax: 1.85 },
              { fn: (x) => 1 + 1 / (x - 2), tone: 'accent', xMin: 2.15, xMax: 7 },
            ],
            xMin: -3,
            xMax: 7,
            xTicks: [2],
            fixedYRange: { min: -4, max: 6 },
            verticalAsymptotes: [{ x: 2, label: 'x=2' }],
            horizontalAsymptotes: [{ y: 1, label: 'y=1' }],
            textLabels: [
              { x: 1.7, y: -3.6, text: '−∞', tone: 'faint', anchor: 'middle' },
              { x: 3.2, y: 5.6, text: '+∞', tone: 'faint', anchor: 'middle' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'asymptote verticale x=2 (signes opposés de chaque côté) et asymptote horizontale y=1 (aux deux extrémités)',
          },
        },
        {
          kind: 'exemple',
          badge: 'lecture directe — plusieurs asymptotes verticales',
          formula: 'Le graphique ci-dessous représente une fonction g. Lis toutes les limites et toutes les asymptotes visibles.',
          steps: [
            {
              tag: 'asymptote verticale x=−1',
              text: '$\\displaystyle\\lim_{x \\to -1^-} g(x) = +\\infty$ ; $\\displaystyle\\lim_{x \\to -1^+} g(x) = -\\infty$',
            },
            {
              tag: 'asymptote verticale x=2',
              text: '$\\displaystyle\\lim_{x \\to 2^-} g(x) = -\\infty$ ; $\\displaystyle\\lim_{x \\to 2^+} g(x) = +\\infty$',
            },
            {
              tag: 'asymptote horizontale y=0 — aux deux extrémités',
              text: '$\\displaystyle\\lim_{x \\to -\\infty} g(x) = 0$ et $\\displaystyle\\lim_{x \\to +\\infty} g(x) = 0$',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              '3 asymptotes lues directement — deux verticales (x=−1 et x=2, chacune avec un ' +
              'signe différent de chaque côté) et une horizontale (y=0, la même des deux côtés) ' +
              '— un graphique peut porter plusieurs asymptotes verticales à la fois, chacune ' +
              's\'étudiant séparément.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: -6, xMax: -1.15 },
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: -0.85, xMax: 1.85 },
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: 2.15, xMax: 7 },
            ],
            xMin: -6,
            xMax: 7,
            xTicks: [-1, 2],
            fixedYRange: { min: -6, max: 6 },
            verticalAsymptotes: [{ x: -1, label: 'x=−1' }, { x: 2, label: 'x=2' }],
            horizontalAsymptotes: [{ y: 0, label: 'y=0' }],
            textLabels: [
              { x: -1.05, y: 5.6, text: '+∞', tone: 'faint', anchor: 'middle' },
              { x: -0.95, y: -5.6, text: '−∞', tone: 'faint', anchor: 'middle' },
              { x: 1.9, y: -5.6, text: '−∞', tone: 'faint', anchor: 'middle' },
              { x: 2.1, y: 5.6, text: '+∞', tone: 'faint', anchor: 'middle' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'g(x)',
            caption: 'deux asymptotes verticales x=−1 et x=2, et une asymptote horizontale y=0 aux deux extrémités',
          },
        },
        {
          kind: 'exemple',
          badge: 'lecture — une limite finie d\'un seul côté (point isolé)',
          formula: 'Le graphique ci-dessous représente une fonction $h$. Lis les limites en $x=1$, en $-\\infty$ et en $+\\infty$, puis les asymptotes.',
          steps: [
            {
              tag: 'à gauche de x=1 — la courbe arrive sur le point plein (1;2)',
              text: '$\\displaystyle\\lim_{x \\to 1^-} h(x) = 2$ : une limite FINIE, et même $h(1)=2$ (point plein) — la courbe ne part pas vers l\'infini de ce côté.',
            },
            {
              tag: 'à droite de x=1 — la courbe s\'envole',
              text: '$\\displaystyle\\lim_{x \\to 1^+} h(x) = +\\infty$ : c\'est ce côté qui fait de $x=1$ une asymptote verticale.',
            },
            {
              tag: 'aux extrémités — une seule horizontale',
              text: '$\\displaystyle\\lim_{x \\to +\\infty} h(x) = 3$ (asymptote horizontale $y=3$ à droite) ; $\\displaystyle\\lim_{x \\to -\\infty} h(x) = -\\infty$ (aucune asymptote horizontale à gauche).',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              '$x=1$ est une asymptote verticale, même si un seul côté diverge : un côté suffit. ' +
              '$y=3$ est une asymptote horizontale, mais seulement en $+\\infty$.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x + 1, tone: 'accent', xMin: -4, xMax: 1 },
              { fn: (x) => 3 + 1 / (x - 1), tone: 'accent', xMin: 1.12, xMax: 9 },
            ],
            xMin: -4,
            xMax: 9,
            xTicks: [1],
            fixedYRange: { min: -3, max: 9 },
            verticalAsymptotes: [{ x: 1 }],
            horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
            points: [{ x: 1, y: 2, label: '(1;2)', tone: 'accent', style: 'filled', labelPos: 'right' }],
            textLabels: [{ x: 2.6, y: 8, text: '+∞', tone: 'faint', anchor: 'middle' }],
            xAxisLabel: 'x',
            yAxisLabel: 'h(x)',
            caption: 'à gauche de $x=1$, la courbe arrive sur le point plein $(1\,;2)$ ; à droite, elle part vers $+\\infty$ — la droite $x=1$ (pointillée) reste une asymptote verticale',
          },
        },
        {
          kind: 'exemple',
          badge: 'lecture — deux asymptotes horizontales différentes',
          formula: 'Le graphique ci-dessous représente une fonction $k$ (qui n\'est pas une fonction rationnelle). Lis ses limites en $-\\infty$ et en $+\\infty$.',
          steps: [
            { tag: 'à gauche — la courbe s\'aplatit sur y=−1', text: '$\\displaystyle\\lim_{x \\to -\\infty} k(x) = -1$' },
            { tag: 'à droite — la courbe s\'aplatit sur y=3', text: '$\\displaystyle\\lim_{x \\to +\\infty} k(x) = 3$' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'Deux asymptotes horizontales DIFFÉRENTES : $y=-1$ en $-\\infty$ et $y=3$ en $+\\infty$. ' +
              'Une fonction rationnelle ne fait jamais ça (ses limites finies en $-\\infty$ et en ' +
              '$+\\infty$ sont égales), mais d\'autres fonctions, oui : lis toujours les deux côtés séparément.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 1 + (2 * x) / Math.sqrt(x * x + 1), tone: 'accent' }],
            xMin: -10,
            xMax: 10,
            xTicks: [],
            fixedYRange: { min: -2, max: 4 },
            horizontalAsymptotes: [
              { y: -1, label: 'y=−1 (en −∞)' },
              { y: 3, label: 'y=3 (en +∞)' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'k(x)',
            caption: 'la courbe rejoint $y=-1$ à gauche et $y=3$ à droite : deux asymptotes horizontales distinctes',
          },
        },
        {
          kind: 'piege',
          label: 'Les deux côtés d\'une même asymptote verticale n\'ont pas forcément le même signe',
          text:
            'Regarde si la courbe est AU-DESSUS (⟹ +∞) ou AU-DESSOUS (⟹ −∞) de l\'asymptote ' +
            'verticale — séparément à gauche et à droite ! Supposer que les deux côtés partagent ' +
            'automatiquement le même signe est une erreur fréquente. Il arrive qu\'ils soient ' +
            'identiques (cas d\'une racine double au dénominateur), mais ça ne se devine jamais : ça se LIT.',
        },
        {
          kind: 'astuce',
          label: 'Distinguer horizontale et oblique au premier coup d\'œil',
          text:
            'Une asymptote horizontale reste PARFAITEMENT PLATE : même hauteur partout. Une ' +
            'asymptote oblique continue de monter ou de descendre régulièrement. Si la droite ' +
            'que la courbe semble suivre garde une pente non nulle, ce n\'est jamais une horizontale.',
        },
        {
          kind: 'entrainement',
          title: 'Limites et asymptotes — lecture graphique',
          generatorId: '5gen22',
          description: [
            'Lis directement sur un graphique les limites en chaque asymptote verticale (des ' +
              'deux côtés, y compris une éventuelle limite finie) et en −∞ et +∞, puis nomme le ' +
              'type et l\'équation de chaque asymptote présente. Aucun calcul.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 22. Limites et asymptotes — lecture graphique »',
        },
      ],
    },
    {
      id: 'limites-contexte',
      number: 4,
      title: 'Limites et asymptotes en contexte',
      kicker: 'traduire saturation, seuil et long terme en limite ; interpréter une asymptote horizontale',
      blocks: [
        { kind: 'video', title: 'Limites et asymptotes en contexte : le coût unitaire', youtubeId: 'A58J7zT6au0' },
        {
          kind: 'para',
          text:
            'Beaucoup de situations concrètes — coût de production, concentration d\'une ' +
            'solution, évolution d\'une population — se modélisent par une fonction rationnelle. ' +
            'Leur comportement à long terme se lit comme une limite en +∞.',
        },
        {
          kind: 'exemple',
          badge: 'coût unitaire — une asymptote horizontale comme valeur plancher',
          formula:
            'Une entreprise a un coût fixe de 240 € (matériel, location), à répartir sur x ' +
            'unités produites, plus un coût variable de 8 € par unité. Le coût unitaire (en €) ' +
            's\'écrit $C_u(x) = 8 + \\dfrac{240}{x}$, pour x≥1. Que devient ce coût unitaire ' +
            'quand la production augmente fortement ?',
          steps: [
            {
              tag: 'quelques valeurs, pour observer la tendance',
              text: '$C_u(100) = 8+2{,}4 = 10{,}4$ € ; $C_u(1000) = 8+0{,}24 = 8{,}24$ € ; $C_u(10\\,000) = 8+0{,}024 = 8{,}024$ €',
            },
            { tag: 'limite en +∞ — le terme 240/x tend vers 0', text: '$\\displaystyle\\lim_{x \\to +\\infty} C_u(x) = 8 + 0 = 8$' },
          ],
          result: {
            tag: 'interprétation',
            text:
              'Le coût unitaire se rapproche d\'autant plus de 8 € que la production augmente. ' +
              'MAIS il ne descend jamais en dessous : $240/x$ reste strictement positif pour tout ' +
              'x≥1. L\'asymptote horizontale y=8 est donc un plancher, jamais atteint.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 8 + 240 / x, tone: 'accent' }],
            xMin: 5,
            xMax: 120,
            xTicks: [10, 100],
            fixedYRange: { min: 6, max: 56 },
            horizontalAsymptotes: [{ y: 8, label: 'y=8' }],
            points: [
              { x: 10, y: 32, label: 'Cᵤ(10)≈32€', tone: 'accent', labelPos: 'above' },
              { x: 100, y: 10.4, label: 'Cᵤ(100)≈10,4€', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x (unités)',
            yAxisLabel: 'Cᵤ(x) (€)',
            caption:
              '$C_u(x)=8+\\dfrac{240}{x}$ — le coût unitaire décroît et se rapproche d\'autant plus de 8 € ' +
              'que la production augmente, sans jamais l\'atteindre',
          },
        },
        {
          kind: 'methode',
          label: 'Méthode — écrire f(x) = b + a/(x+p) par division euclidienne',
          items: [
            'Une fonction de la forme $f(x)=\\dfrac{bx+q}{x+p}$ se réécrit en divisant $bx+q$ par ' +
              '$x+p$ : le quotient est $b$, le reste est $a=q-bp$. Donc $f(x)=b+\\dfrac{a}{x+p}$.',
            'La **limite à long terme** se lit tout de suite : $\\dfrac{a}{x+p} \\to 0$, donc ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} f(x)=b$ — l\'asymptote horizontale $y=b$.',
            'Le **sens** aussi (avec $p>0$) : $f(0)-b=\\dfrac{a}{p}$ a le signe de $a$. Si $a>0$, ' +
              '$f$ part au-dessus de $b$ et descend vers $b$ (régression) ; si $a<0$, $f$ part en dessous ' +
              'et monte vers $b$ (croissance). C\'est le signe de $a$, pas une intuition, qui tranche.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'population — régression vers une valeur à long terme',
          formula:
            'Une ville compte $P(x)=\\dfrac{5x+13}{x+2}$ milliers d\'habitants, $x$ années après ' +
            'un recensement. Que devient sa population à long terme ? Augmente-t-elle ou diminue-t-elle ?',
          steps: [
            { tag: 'division euclidienne de 5x+13 par x+2', text: '$5x+13 = 5(x+2)+3 \\implies P(x) = 5+\\dfrac{3}{x+2}$' },
            { tag: 'limite à long terme', text: '$\\displaystyle\\lim_{x \\to +\\infty} P(x) = 5+0 = 5$' },
            { tag: 'sens — a=3 > 0 (et p=2 > 0)', text: '$P(0) = 5+\\dfrac{3}{2} = 6{,}5 > 5$ : la population part au-dessus de 5 et descend vers 5.' },
          ],
          result: {
            tag: 'interprétation',
            text: 'Régression : la population passe de 6 500 habitants et se rapproche de 5 000 habitants (asymptote horizontale $y=5$).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 5 + 3 / (x + 2), tone: 'accent' }],
            xMin: 0,
            xMax: 30,
            xTicks: [10, 20, 30],
            fixedYRange: { min: 4, max: 7 },
            horizontalAsymptotes: [{ y: 5, label: 'y=5' }],
            points: [{ x: 0, y: 6.5, label: 'P(0)=6,5', tone: 'accent', labelPos: 'right' }],
            xAxisLabel: 'x (années)',
            yAxisLabel: 'P(x) (milliers)',
            caption: '$P(x)=5+\\dfrac{3}{x+2}$ — la population descend vers 5 000 habitants',
          },
        },
        {
          kind: 'exemple',
          badge: 'eau salée — la concentration tend vers celle de la solution ajoutée',
          formula:
            'Une cuve contient 100 L d\'eau pure. On y verse 5 L d\'eau salée par minute, à ' +
            '30 g de sel par litre. Après t minutes, le volume vaut $V(t)=100+5t$ litres et la ' +
            'masse de sel $Q(t)=30\\cdot 5t=150t$ grammes. Vers quelle concentration tend le mélange ?',
          steps: [
            { tag: 'concentration = masse ÷ volume', text: '$C(t) = \\dfrac{Q(t)}{V(t)} = \\dfrac{150t}{100+5t}$ (en g/L)' },
            { tag: 'limite — degrés égaux, rapport des coefficients dominants', text: '$\\displaystyle\\lim_{t \\to +\\infty} C(t) = \\dfrac{150}{5} = 30$' },
            { tag: 'division euclidienne — le sens', text: '$150t = 30(5t+100) - 3000 \\implies C(t) = 30 - \\dfrac{3000}{100+5t}$ : toujours en dessous de 30, et de plus en plus proche' },
          ],
          result: {
            tag: 'interprétation',
            text:
              'La concentration monte vers 30 g/L, celle de l\'eau salée ajoutée : à long terme, ' +
              'le volume versé ($5t$) devient très grand devant les 100 L de départ. Un plafond ($y=30$).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => (150 * t) / (100 + 5 * t), tone: 'accent' }],
            xMin: 0,
            xMax: 200,
            xTicks: [50, 100, 150, 200],
            fixedYRange: { min: 0, max: 34 },
            horizontalAsymptotes: [{ y: 30, label: 'y=30' }],
            xAxisLabel: 't (min)',
            yAxisLabel: 'C(t) (g/L)',
            caption: '$C(t)=\\dfrac{150t}{100+5t}$ — la concentration monte vers 30 g/L',
          },
        },
        {
          kind: 'exemple',
          badge: 'club — une asymptote oblique en contexte',
          formula:
            'Un club compte $N(x)=2x+15-\\dfrac{8}{x+2}$ centaines d\'abonnés, $x$ mois après son ' +
            'ouverture. Comment évolue le nombre d\'abonnés à long terme ?',
          steps: [
            { tag: 'le terme en 8/(x+2) tend vers 0', text: '$\\displaystyle\\lim_{x \\to +\\infty} \\left[N(x)-(2x+15)\\right] = \\lim_{x \\to +\\infty} -\\dfrac{8}{x+2} = 0$' },
            { tag: 'asymptote oblique', text: '$y = 2x+15$ — la courbe reste juste en dessous, car $-\\dfrac{8}{x+2} < 0$' },
            { tag: 'une valeur — après 12 mois', text: '$N(12) = 24+15-\\dfrac{8}{14} \\approx 38{,}43$, soit environ 3 843 abonnés' },
          ],
          result: {
            tag: 'interprétation',
            text: 'À long terme, le club gagne environ 2 centaines d\'abonnés par mois : la pente de l\'asymptote oblique.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 2 * x + 15 - 8 / (x + 2), tone: 'accent' }],
            xMin: 0,
            xMax: 20,
            xTicks: [5, 10, 15, 20],
            fixedYRange: { min: 0, max: 60 },
            obliqueAsymptotes: [{ a: 2, b: 15, label: 'y=2x+15' }],
            xAxisLabel: 'x (mois)',
            yAxisLabel: 'N(x) (centaines)',
            caption: '$N(x)=2x+15-\\dfrac{8}{x+2}$ — la courbe longe la droite $y=2x+15$ par en dessous',
          },
        },
        {
          kind: 'attention',
          label: 'Vérifier que l\'asymptote a un sens dans le contexte',
          text:
            'Une limite calculée mathématiquement peut tomber en dehors du domaine réaliste du ' +
            'problème — une production négative, un temps négatif… Avant d\'interpréter une ' +
            'asymptote en contexte, vérifie toujours qu\'elle correspond à une valeur de x ' +
            'compatible avec la situation réelle. Ici, x≥1 unité produite : la limite en +∞ ' +
            'garde tout son sens, la fonction n\'a simplement aucun intérêt pour x<1.',
        },
        {
          kind: 'astuce',
          label: 'Une asymptote horizontale en contexte = un plancher ou un plafond',
          text:
            'Que le phénomène descende vers cette valeur (un **plancher**, comme ici) ou monte ' +
            'vers elle (un **plafond**, ex. une concentration qui se stabilise), la limite donne ' +
            'la valeur théorique à long terme. Dans ces modèles, elle n\'est pas atteinte pour un ' +
            'x fini, aussi grand soit-il : le terme en $1/x$ (ou en $1/(x+p)$) ne s\'annule jamais.',
        },
        {
          kind: 'atelier',
          tag: 'plancher-plafond-widget',
          label: 'Manipule toi-même — le plancher, jamais atteint',
          caption:
            'Règle le coût fixe F et le coût variable v, puis déplace x : l\'écart au plancher ' +
            'reste toujours strictement positif, aussi grand que x devienne. Réglages par défaut ' +
            '(F=240, v=8) reproduisent exactement l\'exemple résolu.',
        },
        {
          kind: 'entrainement',
          title: 'Limites et asymptotes en contexte',
          generatorId: '5gen23',
          description: [
            'Traduis une situation concrète — coût de production, concentration d\'eau salée, ' +
              'club à abonnement, population — en limite ou en asymptote (horizontale ou oblique), ' +
              'écris la fonction sous la forme b + a/(x + p) par division euclidienne, puis ' +
              'interprète le résultat dans le contexte.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 23. Limites et asymptotes en contexte »',
        },
      ],
    },
    {
      id: 'etude-complete',
      number: 5,
      title: 'Étude complète',
      kicker: 'domaine → asymptotes verticales → asymptote horizontale/oblique → limites aux bornes → recoupement ; construire une fonction à partir de ses asymptotes',
      blocks: [
        { kind: 'video', title: 'Étude complète d\'une fonction rationnelle : domaine, asymptotes, limites', youtubeId: 'j413TOzZQVM' },
        {
          kind: 'para',
          text:
            'Étudier complètement une fonction rationnelle, c\'est mener, dans l\'ordre, TOUTES ' +
            'les étapes précédentes sur une même fonction.',
        },
        {
          kind: 'methode',
          label: 'Méthode — la démarche complète, dans l\'ordre',
          items: [
            '**Domaine** — exclure les valeurs qui annulent le dénominateur.',
            'Pour chaque valeur exclue : vérifie si le numérateur s\'annule AUSSI à ce point. Si ' +
              'oui, c\'est un « point vide », pas une vraie asymptote verticale. Si non, c\'est ' +
              'une vraie asymptote verticale.',
            'Compare les degrés du numérateur et du dénominateur pour classer le comportement à ' +
              'l\'infini : horizontale, oblique, ou aucune.',
            'Calcule les limites à CHAQUE borne du domaine : chaque asymptote verticale, des ' +
              'deux côtés, et en ±∞.',
            'Le cas échéant, cherche si la courbe **recoupe** son asymptote : résous ' +
              '$f(x)=ax+b$, c\'est-à-dire « le reste de la division euclidienne vaut 0 ».',
            '**Synthétiser** : domaine, équations de toutes les asymptotes, tableau des limites.',
          ],
        },
        {
          kind: 'application',
          titre: 'Prévoir la concentration finale d\'une réaction chimique',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 0.2 + 0.8 * Math.exp(-0.2 * t), tone: 'accent' }],
              xMin: 0,
              xMax: 30,
              xTicks: [10, 20, 30],
              yTicks: [0.2, 0.5, 1],
              horizontalAsymptotes: [{ y: 0.2, label: 'C_eq = 0,2 mol/L' }],
              xAxisLabel: 'temps (min)',
              yAxisLabel: 'concentration (mol/L)',
              caption:
                "La concentration d'un réactif, partie de 1 mol/L, décroît et se stabilise vers " +
                "0,2 mol/L — PAS vers 0 : contrairement à une simple disparition, la réaction " +
                "atteint ici un équilibre où réactif et produit coexistent. L'asymptote " +
                'horizontale donne directement cette concentration théorique.',
            },
          ],
          text:
            "Dans de nombreuses réactions chimiques, la concentration d'un réactif ou d'un " +
            'produit évolue selon une fonction du temps qui admet une asymptote horizontale : ' +
            'la réaction ralentit progressivement et la concentration se stabilise vers une ' +
            'valeur d\'équilibre, sans jamais la dépasser ni l\'atteindre exactement en temps ' +
            'fini. Faire l\'étude complète d\'une telle fonction — domaine (le temps ne peut ' +
            'pas être négatif), limites, asymptotes — donne directement aux chimistes la ' +
            "concentration théorique à l'équilibre, sans devoir attendre un temps infini pour " +
            "l'observer expérimentalement.",
          domaines: ['Chimie', 'Cinétique chimique'],
        },
        {
          kind: 'exemple',
          badge: 'étude complète d\'une fonction rationnelle',
          formula: '$f(x) = \\dfrac{x^2-2x-3}{x-1}$. Mène l\'étude complète de f.',
          steps: [
            { tag: 'domaine — annuler le dénominateur', text: '$x-1=0 \\iff x=1 \\to$ domaine = ℝ\\{1}' },
            { tag: 'point vide ou vraie asymptote ? — évaluer le numérateur en x=1', text: 'numérateur(1) = 1−2−3 = −4 ≠ 0 → x=1 est une VRAIE asymptote verticale (pas un point vide)' },
            { tag: 'comparaison des degrés', text: 'deg(numérateur)=2, deg(dénominateur)=1, soit exactement 1 de plus → asymptote OBLIQUE' },
            {
              tag: 'division euclidienne — x²−2x−3 par x−1',
              text: '$x^2-2x-3 = (x-1)(x-1) - 4 \\implies f(x) = (x-1) - \\dfrac{4}{x-1}$',
            },
            { tag: 'asymptote oblique', text: '$y = x-1$' },
            {
              tag: 'limites en x=1 — signe de chaque côté (x=0,9 puis x=1,1 comme sondes)',
              text: 'à x=0,9 : numérateur=−3,99, dénominateur=−0,1, f≈39,9 (grand positif) ⟹ $\\displaystyle\\lim_{x \\to 1^-} f(x) = +\\infty$ ; à x=1,1 : numérateur=−3,99, dénominateur=0,1, f≈−39,9 (grand négatif) ⟹ $\\displaystyle\\lim_{x \\to 1^+} f(x) = -\\infty$',
            },
            {
              tag: 'limites aux bornes infinies — la courbe suit l\'asymptote',
              text: '$\\displaystyle\\lim_{x \\to -\\infty} f(x) = -\\infty$ et $\\displaystyle\\lim_{x \\to +\\infty} f(x) = +\\infty$ (le terme x−1 domine)',
            },
          ],
          result: {
            tag: 'synthèse complète',
            text:
              'Domaine : ℝ\\{1}. Asymptote verticale : x=1 (+∞ à gauche, −∞ à droite). ' +
              'Asymptote oblique : y=x−1. Limites aux bornes infinies : −∞ en −∞, +∞ en +∞.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x * x - 2 * x - 3) / (x - 1), tone: 'accent', xMin: -4, xMax: 0.85 },
              { fn: (x) => (x * x - 2 * x - 3) / (x - 1), tone: 'accent', xMin: 1.15, xMax: 8 },
            ],
            xMin: -4,
            xMax: 8,
            xTicks: [1],
            fixedYRange: { min: -8, max: 10 },
            verticalAsymptotes: [{ x: 1, label: 'x=1' }],
            obliqueAsymptotes: [{ a: 1, b: -1, label: 'y=x−1' }],
            textLabels: [
              { x: -2, y: 9, text: '+∞', tone: 'faint', anchor: 'middle' },
              { x: 1.5, y: -7, text: '−∞', tone: 'faint', anchor: 'middle' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{x^2-2x-3}{x-1}$ — asymptote verticale $x=1$ ($+\\infty$ à gauche, $-\\infty$ à droite) et asymptote oblique $y=x-1$',
          },
        },
        {
          kind: 'attention',
          label: 'Une courbe peut croiser son asymptote horizontale ou oblique',
          text:
            'Une asymptote décrit ce qui se passe aux EXTRÉMITÉS ($x \\to \\pm\\infty$) : rien ' +
            'n\'interdit à la courbe de la traverser ailleurs, une ou plusieurs fois. Seule une ' +
            'asymptote verticale $x=a$ n\'est jamais traversée par une fonction rationnelle, puisque ' +
            '$a$ est exclu du domaine.',
        },
        {
          kind: 'exemple',
          badge: 'recoupement — la courbe croise son asymptote horizontale',
          formula: '$f(x) = \\dfrac{x^2+x}{x^2+1}$. Détermine son asymptote horizontale, puis le point où la courbe la recoupe.',
          steps: [
            { tag: 'domaine', text: '$x^2+1 > 0$ pour tout $x$ : domaine $= \\mathbb{R}$, aucune asymptote verticale' },
            { tag: 'degrés égaux — rapport des coefficients dominants', text: 'asymptote horizontale $y = \\dfrac{1}{1} = 1$' },
            { tag: 'division euclidienne — isoler le reste', text: '$x^2+x = 1\\cdot(x^2+1) + (x-1) \\implies f(x) = 1 + \\dfrac{x-1}{x^2+1}$' },
            { tag: 'recoupement — le reste s\'annule', text: '$f(x) = 1 \\iff \\dfrac{x-1}{x^2+1} = 0 \\iff x = 1$, et $f(1) = 1$' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'La courbe recoupe son asymptote $y=1$ au point $(1\,;1)$. Elle est au-dessus pour $x>1$ ' +
              '(reste positif), en dessous pour $x<1$ (reste négatif), et s\'en rapproche quand même ' +
              'en $-\\infty$ comme en $+\\infty$.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => (x * x + x) / (x * x + 1), tone: 'accent' }],
            xMin: -8,
            xMax: 8,
            xTicks: [1],
            fixedYRange: { min: -0.6, max: 1.6 },
            horizontalAsymptotes: [{ y: 1, label: 'y=1' }],
            points: [{ x: 1, y: 1, label: '(1;1)', tone: 'good', style: 'filled', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{x^2+x}{x^2+1}$ — la courbe croise son asymptote $y=1$ en $(1\,;1)$, puis s\'en rapproche aux deux extrémités',
          },
        },
        {
          kind: 'exemple',
          badge: 'construction inverse — une fonction à partir de ses asymptotes',
          formula:
            'Trouve une fonction rationnelle dont le graphique admet l\'asymptote verticale $x=2$ et ' +
            'l\'asymptote horizontale $y=3$. Puis une autre, avec l\'asymptote verticale $x=-1$ et ' +
            'l\'asymptote oblique $y=2x+1$.',
          steps: [
            {
              tag: 'l\'idée — asymptote + un terme qui diverge en r et s\'éteint à l\'infini',
              text: 'Le terme $\\dfrac{1}{x-r}$ part vers $\\pm\\infty$ en $x=r$ et tend vers $0$ en $\\pm\\infty$ : on l\'ajoute à l\'équation de l\'asymptote voulue.',
            },
            { tag: 'premier cas — AV x=2, AH y=3', text: '$f(x) = 3+\\dfrac{1}{x-2} = \\dfrac{3x-5}{x-2}$' },
            { tag: 'vérification', text: 'numérateur en $2$ : $3\\cdot 2-5 = 1 \\neq 0$ → vraie asymptote $x=2$ ; degrés égaux, rapport $\\dfrac{3}{1}$ → $y=3$' },
            { tag: 'second cas — AV x=−1, AO y=2x+1', text: '$g(x) = 2x+1+\\dfrac{1}{x+1} = \\dfrac{2x^2+3x+2}{x+1}$ (numérateur en $-1$ : $2-3+2 = 1 \\neq 0$)' },
          ],
          result: {
            tag: 'à retenir',
            text:
              '$f(x) = ax+b+\\dfrac{1}{x-r}$ a pour asymptotes $x=r$ et $y=ax+b$ (horizontale si ' +
              '$a=0$). La réponse n\'est pas unique : $3+\\dfrac{5}{x-2}$ convient aussi.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 3 + 1 / (x - 2), tone: 'accent', xMin: -6, xMax: 1.85 },
              { fn: (x) => 3 + 1 / (x - 2), tone: 'accent', xMin: 2.15, xMax: 10 },
            ],
            xMin: -6,
            xMax: 10,
            xTicks: [2],
            fixedYRange: { min: -4, max: 10 },
            verticalAsymptotes: [{ x: 2, label: 'x=2' }],
            horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=3+\\dfrac{1}{x-2}$ — exactement les deux asymptotes demandées, $x=2$ et $y=3$',
          },
        },
        {
          kind: 'piege',
          label: 'Un point vide n\'est PAS une asymptote verticale',
          text:
            'Si le numérateur s\'annule AUSSI à la valeur exclue, le facteur se simplifie et la ' +
            'limite est FINIE : un simple trou dans la courbe, invisible sur un graphique à ' +
            'l\'échelle normale — jamais une vraie divergence. Vérifier le numérateur AVANT de ' +
            'conclure à une asymptote verticale est une étape à ne jamais sauter.',
        },
        {
          kind: 'astuce',
          label: 'Recouper le résultat par 2 méthodes indépendantes',
          text:
            'Comme pour l\'asymptote oblique de la section 2 : la division euclidienne ' +
            'ET la méthode des limites ($a=\\lim f(x)/x$, $b=\\lim\\,[f(x)-ax]$) doivent toujours retomber ' +
            'sur EXACTEMENT la même droite. C\'est un bon moyen de repérer une erreur de calcul avant de conclure.',
        },
        {
          kind: 'entrainement',
          title: 'Étude complète',
          generatorId: '5gen24',
          description: [
            'Mène l\'étude complète d\'une fonction rationnelle : domaine, point vide ou vraie ' +
              'asymptote verticale, limites de chaque côté, asymptote horizontale ou oblique ' +
              '(coefficients a et b) et, le cas échéant, le point où la courbe recoupe son ' +
              'asymptote. Variante bonus : construire une fonction à partir de ses asymptotes.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 24. Étude complète »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Limites de référence',
        formulas: [
          { text: '$\\lim_{x\\to+\\infty} x^n = +\\infty$', condition: 'en −∞ : +∞ si n pair, −∞ si n impair' },
          { text: '$\\lim_{x\\to\\pm\\infty} 1/x = 0$' },
          { text: '$\\lim_{x\\to 0^+} 1/x = +\\infty \\quad \\lim_{x\\to 0^-} 1/x = -\\infty$' },
        ],
      },
      {
        title: 'Formes indéterminées',
        formulas: [
          { text: '0/0 — factoriser le facteur commun, puis simplifier' },
          { text: '∞/∞ — mettre en évidence le terme de plus haut degré, au numérateur et au dénominateur' },
          { text: '∞−∞ — terme dominant (polynômes) ou expression conjuguée (racines)' },
        ],
      },
      {
        title: 'Définir une asymptote',
        formulas: [
          { text: 'AV : $x=a$', condition: '$\\lim_{x\\to a^-} f(x)=\\pm\\infty$ ou $\\lim_{x\\to a^+} f(x)=\\pm\\infty$' },
          { text: 'AH : $y=b$', condition: '$\\lim_{x\\to\\pm\\infty} f(x)=b$' },
          { text: 'AO : $y=ax+b$', condition: '$\\lim_{x\\to\\pm\\infty} [f(x)-(ax+b)]=0$' },
        ],
      },
      {
        title: 'Asymptote oblique — calcul de a et b',
        formulas: [
          { text: '$a = \\lim_{x\\to\\pm\\infty} \\dfrac{f(x)}{x}$' },
          { text: '$b = \\lim_{x\\to\\pm\\infty} [f(x)-ax]$' },
          { text: "le reste de la division euclidienne ne fait jamais partie de l'asymptote" },
        ],
      },
      {
        title: 'Contexte, recoupement, construction',
        formulas: [
          { text: '$f(x)=\\dfrac{bx+q}{x+p} = b+\\dfrac{a}{x+p}$', condition: 'division euclidienne : AH y=b ; avec p>0, régression si a>0, croissance si a<0' },
          { text: 'recoupement : $f(x)=ax+b$', condition: 'là où le reste de la division euclidienne s\'annule' },
          { text: '$f(x)=ax+b+\\dfrac{1}{x-r}$', condition: 'asymptotes x=r et y=ax+b' },
        ],
      },
      {
        title: 'Degré ↔ asymptote (N/D rationnelle)',
        formulas: [
          { text: 'deg(N) < deg(D)', condition: '$y=0$' },
          { text: 'deg(N) = deg(D)', condition: 'AH, $b$ = rapport des coefficients dominants' },
          { text: 'deg(N) = deg(D)+1', condition: 'asymptote oblique' },
          { text: 'deg(N) ≥ deg(D)+2', condition: 'aucune asymptote de cette forme' },
        ],
      },
    ],
  },

  recap: {
    items: [
      '**Limites et formes indéterminées** — 0/0 se lève par factorisation et simplification ' +
        '(peut révéler un point vide, invisible sur le graphique). ∞/∞ et ∞−∞ avec des ' +
        'polynômes : mets en évidence le terme de plus haut degré. ∞−∞ avec des racines : ' +
        'multiplie par l\'expression conjuguée. Diagnostique toujours la forme AVANT de choisir ' +
        'la technique — le tableau des opérations (somme/produit/quotient) donne le résultat ' +
        'direct dans les cas déterminés. f(a) définie ne garantit pas que ' +
        '$\\displaystyle\\lim_{x \\to a} f(x)$ existe : c\'est le cas d\'un saut.',
      '**Asymptote oblique** — $y=ax+b$, avec $a=\\lim f(x)/x$ puis $b=\\lim\\,[f(x)-ax]$. C\'est équivalent ' +
        'à la division euclidienne N=D×(ax+b)+reste : le reste ne fait JAMAIS partie de ' +
        'l\'équation de l\'asymptote. Horizontale dès que deg(N)≤deg(D) (y=0 si strictement ' +
        'inférieur) ; oblique non horizontale seulement si deg(N)=deg(D)+1, exactement.',
      '**Lecture graphique** — asymptote verticale : la courbe part vers ±∞ d\'au moins un côté ' +
        '(les signes peuvent différer ; de l\'autre côté, une limite finie est possible). ' +
        'Asymptote horizontale : droite plate rejointe aux extrémités, parfois différente en −∞ ' +
        'et en +∞. Asymptote oblique : droite penchée rejointe aux extrémités.',
      '**Limites en contexte** — le comportement à long terme d\'un phénomène réel se traduit ' +
        'par une limite en +∞. Une asymptote horizontale, c\'est un plafond ou un plancher ' +
        'théorique. Écrire $f(x)=b+\\dfrac{a}{x+p}$ (avec $p>0$) par division euclidienne donne à ' +
        'la fois la valeur à long terme b et le sens : croissance si $a<0$, régression si $a>0$.',
      '**Étude complète** — domaine → point vide ou vraie asymptote verticale (test du ' +
        'numérateur) → comparaison des degrés pour l\'horizontale/l\'oblique → limites à chaque ' +
        'borne → synthèse. Vérifie toujours le numérateur avant de conclure à une vraie ' +
        'asymptote verticale. Une courbe peut croiser son asymptote horizontale ou oblique, là ' +
        'où le reste de la division euclidienne s\'annule. Et à l\'inverse, on sait construire ' +
        'une fonction à partir de ses asymptotes : $f(x)=ax+b+\\dfrac{1}{x-r}$.',
    ],
    checklist: {
      items: [
        'Ai-je bien identifié la forme (déterminée ou indéterminée, et laquelle) avant de me lancer dans le calcul ?',
        'Pour une asymptote oblique : ai-je bien vérifié deg(N)=deg(D)+1, et exclu le reste de l\'équation finale ?',
        'Pour une lecture graphique : ai-je vérifié séparément le signe de CHAQUE côté d\'une asymptote verticale ?',
        'Pour une asymptote verticale : ai-je bien vérifié que le numérateur ne s\'annule PAS au même point (sinon c\'est un point vide, pas une asymptote) ?',
      ],
    },
    forward:
      'Ces mêmes techniques de limite — factorisation, terme dominant, comparaison de degrés ' +
      '— reviennent comme fondement du chapitre suivant. Tu y étudieras cette fois le taux de ' +
      'variation instantané d\'une fonction : la dérivée.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen42',
      description: [
        '7 thèmes de 20 affirmations chacun (reconnaissance et calcul, asymptote oblique, ' +
          'lecture graphique, limites en contexte, étude complète, pièges classiques, ' +
          'transversal) — choisis un thème, réponds vrai ou faux, la justification est ' +
          'toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 42. Limites et asymptotes — quiz vrai/faux »',
    },
  },
}
