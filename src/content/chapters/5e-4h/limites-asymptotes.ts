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
            "Tu as déjà rencontré le **domaine de définition** au chapitre 1 (fonctions) : les " +
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
          kind: 'atelier',
          tag: 'aussi-pres-que-tu-veux-widget',
          label: 'Manipule toi-même — aussi près que tu veux',
          caption:
            'Choisis une marge autour de L (la bande horizontale, de demi-hauteur ε), aussi petite que tu ' +
            'veux, puis cherche une bande verticale autour de a (demi-largeur δ) dont tous les points de la ' +
            'courbe, sauf x = a lui-même, restent dans la marge : c\'est ce que veut dire « aussi près qu\'on ' +
            'veut ». Essaie ensuite le saut : quand la marge est petite, aucune largeur ne marche.',
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
          kind: 'intuition',
          label: 'Pourquoi seul le terme dominant compte',
          text:
            'Prends $3x^2-5x+1$ et compare la taille de ses trois termes. Pour $x=10$ : $3x^2=300$, ' +
            '$5x=50$ et $1$ — le terme $3x^2$ pèse déjà 85,5 % du total ($300$ sur $351$). Pour ' +
            '$x=1\\,000$ : $3\\,000\\,000$ contre $5\\,000$ et $1$, soit 99,83 %. Pour $x=10^6$ : ' +
            '99,9998 %. Plus x grandit, plus les autres termes deviennent des **miettes** à côté de ' +
            '$3x^2$. C\'est exactement ce que fait la mise en évidence : ' +
            '$3x^2-5x+1 = 3x^2\\left(1-\\frac{5}{3x}+\\frac{1}{3x^2}\\right)$, et la parenthèse tend ' +
            'vers $1$. À l\'infini, un polynôme se comporte comme son terme dominant — et un quotient, ' +
            'comme le quotient des deux termes dominants.',
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
              horizontalAsymptotes: [{ y: 200, label: 'v_{max} = 200 km/h' }],
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
            'terme grandit. Selon les fonctions, la différence peut tendre vers un nombre (parfois ' +
            '0), vers $+\\infty$ ou vers $-\\infty$, ou n\'avoir aucune limite. C\'est pour ça qu\'une ' +
            'forme indéterminée oblige à un vrai calcul : rien n\'est automatique.',
        },
        {
          kind: 'atelier',
          tag: 'infini-moins-infini-widget',
          label: 'Manipule toi-même — ∞ − ∞ ne vaut rien d\'avance',
          caption:
            'Choisis un couple de fonctions qui partent toutes les deux vers +∞, puis fais grandir x : ' +
            'selon le couple, leur différence part vers +∞, se rapproche de 3, de 0, ou part vers −∞. ' +
            'Le tableau donne aussi les valeurs pour x = 100, 1 000 et 1 000 000.',
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
            ['m', '±∞', { text: '±∞ (même signe)', tone: 'good' }],
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
            ['m≠0', '±∞', { text: '±∞ (règle des signes)', tone: 'good' }],
            ['+∞', '+∞', { text: '+∞', tone: 'good' }],
            ['+∞', '−∞', { text: '−∞', tone: 'good' }],
            ['−∞', '−∞', { text: '+∞', tone: 'good' }],
            ['0', '±∞', { text: 'indét. (0×∞)', tone: 'bad' }],
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Quotient f ÷ g',
          headers: ['lim f', 'lim g', 'lim(f/g)'],
          rows: [
            ['m', 'p≠0', { text: '$\\dfrac{m}{p}$', tone: 'good' }],
            ['m', '±∞', { text: '0', tone: 'good' }],
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
          kind: 'atelier',
          tag: 'terme-dominant-widget',
          label: 'Manipule toi-même — le terme dominant écrase les autres',
          caption:
            'Fais grandir x de 1 à 1 000 000 : les barres montrent le poids de chaque terme de ' +
            '3x² − 5x + 1 et de x² + 2. Le terme dominant finit par tout peser, et le quotient se ' +
            'rapproche de 3 ÷ 1 = 3.',
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
            fixedYRange: { min: -0.8, max: 4 },
            horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
            points: [
              { x: 4, y: (3 * 16 - 20 + 1) / (16 + 2), label: 'f(4)≈1,61', tone: 'accent', labelPos: 'right' },
              { x: 20, y: (3 * 400 - 100 + 1) / (400 + 2), label: 'f(20)≈2,74', tone: 'accent', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{3x^2-5x+1}{x^2+2}$ — la courbe se rapproche d\'autant plus de $y=3$ que x augmente. Elle passe un moment sous l\'axe des x (entre 0,23 et 1,43 environ), puis remonte ; elle croise $y=3$ une seule fois, en $x=-1$, hors de la fenêtre.',
          },
        },
        {
          kind: 'exemple',
          badge: 'terme dominant — trois autres cas',
          formula:
            'Calcule $\\displaystyle\\lim_{x \\to -\\infty} \\dfrac{2x^3-x}{x^2+1}$, puis ' +
            '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{5x+1}{x^2-3}$, puis ' +
            '$\\displaystyle\\lim_{x \\to +\\infty} (x^3-5x^2)$.',
          steps: [
            {
              tag: 'premier cas — degré plus grand en haut : x³ et x² en évidence',
              text: '$\\dfrac{2x^3-x}{x^2+1} = \\dfrac{x^3\\left(2-\\frac{1}{x^2}\\right)}{x^2\\left(1+\\frac{1}{x^2}\\right)} = x\\cdot\\dfrac{2-\\frac{1}{x^2}}{1+\\frac{1}{x^2}}$',
            },
            {
              tag: 'passer à la limite — le signe vient de x',
              text: 'Quand $x \\to -\\infty$, la fraction tend vers $\\dfrac{2}{1}=2>0$ et $x \\to -\\infty$ : le produit tend vers $-\\infty$.',
            },
            {
              tag: 'deuxième cas — degré plus grand en bas : x et x² en évidence',
              text: '$\\dfrac{5x+1}{x^2-3} = \\dfrac{x\\left(5+\\frac{1}{x}\\right)}{x^2\\left(1-\\frac{3}{x^2}\\right)} = \\dfrac{1}{x}\\cdot\\dfrac{5+\\frac{1}{x}}{1-\\frac{3}{x^2}}$ : $\\dfrac{1}{x} \\to 0$ pendant que la fraction tend vers $5$, donc le produit tend vers $0\\cdot 5=0$.',
            },
            {
              tag: 'troisième cas — ∞−∞ entre deux termes d\'un polynôme',
              text: '$x^3 \\to +\\infty$ et $-5x^2 \\to -\\infty$ : forme $\\infty-\\infty$. Mets $x^3$ en évidence : $x^3-5x^2 = x^3\\left(1-\\dfrac{5}{x}\\right)$, avec $x^3 \\to +\\infty$ et $1-\\dfrac{5}{x} \\to 1$.',
            },
          ],
          result: {
            tag: 'conclusion — le terme dominant gagne',
            text:
              '$\\displaystyle\\lim_{x \\to -\\infty} \\dfrac{2x^3-x}{x^2+1} = -\\infty$ ; ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{5x+1}{x^2-3} = 0$ ; ' +
              '$\\displaystyle\\lim_{x \\to +\\infty} (x^3-5x^2) = +\\infty$. Le signe de l\'infini se lit ' +
              'sur le terme dominant (et sur le signe de x quand le degré qui reste est impair).',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — degrés égaux : la limite vaut le rapport des coefficients dominants',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $f(x)=\\dfrac{ax^2+bx+c}{a\'x^2+b\'x+c\'}$, avec $a\\neq 0$ et $a\'\\neq 0$ (même ' +
                'degré 2 en haut et en bas). On veut montrer que $\\displaystyle\\lim_{x \\to +\\infty} f(x)' +
                ' = \\lim_{x \\to -\\infty} f(x) = \\dfrac{a}{a\'}$.',
            },
            {
              kind: 'para',
              text:
                '**1.** Pour $x\\neq 0$, mets $x^2$ en évidence au numérateur : ' +
                '$ax^2+bx+c = x^2\\left(a+\\dfrac{b}{x}+\\dfrac{c}{x^2}\\right)$. Vérifie en redistribuant : ' +
                '$x^2\\cdot\\dfrac{b}{x} = bx$ et $x^2\\cdot\\dfrac{c}{x^2} = c$.',
            },
            {
              kind: 'para',
              text:
                '**2.** De même au dénominateur : ' +
                '$a\'x^2+b\'x+c\' = x^2\\left(a\'+\\dfrac{b\'}{x}+\\dfrac{c\'}{x^2}\\right)$.',
            },
            {
              kind: 'para',
              text:
                '**3.** Simplifie par $x^2$, qui n\'est pas nul : ' +
                '$f(x) = \\dfrac{a+\\frac{b}{x}+\\frac{c}{x^2}}{a\'+\\frac{b\'}{x}+\\frac{c\'}{x^2}}$.',
            },
            {
              kind: 'para',
              text:
                '**4.** Passe à la limite, en $+\\infty$ comme en $-\\infty$. Les limites de référence ' +
                'donnent $\\dfrac{1}{x} \\to 0$ et $\\dfrac{1}{x^2} \\to 0$ ; multipliés par une constante, ' +
                '$\\dfrac{b}{x}$, $\\dfrac{c}{x^2}$, $\\dfrac{b\'}{x}$ et $\\dfrac{c\'}{x^2}$ tendent donc ' +
                'tous vers $0$. Le numérateur tend vers $a+0+0=a$, le dénominateur vers $a\'+0+0=a\'$.',
            },
            {
              kind: 'para',
              text:
                '**5.** Quotient de deux limites finies, avec $a\'\\neq 0$ au dénominateur (tableau du ' +
                'quotient, première ligne) : $\\displaystyle\\lim_{x \\to \\pm\\infty} f(x) = \\dfrac{a}{a\'}$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Quand les degrés sont égaux, seuls les coefficients dominants comptent : ' +
                'tous les autres termes, divisés par une puissance de x, s\'éteignent. La même preuve ' +
                'marche pour n\'importe quel degré $n$, en mettant $x^n$ en évidence. Exemple : ' +
                '$\\dfrac{3x^2-5x+1}{x^2+2} \\to \\dfrac{3}{1} = 3$.',
            },
          ],
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
          badge: 'forme 0/0 avec une racine — conjuguée au numérateur',
          formula: '$\\displaystyle\\lim_{x \\to 4} \\dfrac{\\sqrt{x}-2}{x-4}$',
          steps: [
            {
              tag: 'vérifier la forme',
              text: 'En $x=4$ : numérateur $\\sqrt{4}-2=0$ et dénominateur $4-4=0$ → forme $\\dfrac{0}{0}$. Aucun facteur commun visible : la racine le cache.',
            },
            {
              tag: 'multiplier en haut et en bas par la conjuguée √x + 2',
              text: '$\\dfrac{\\sqrt{x}-2}{x-4} = \\dfrac{(\\sqrt{x}-2)(\\sqrt{x}+2)}{(x-4)(\\sqrt{x}+2)} = \\dfrac{x-4}{(x-4)(\\sqrt{x}+2)}$, car $(\\sqrt{x}-2)(\\sqrt{x}+2) = (\\sqrt{x})^2-2^2 = x-4$',
            },
            { tag: 'simplifier, valable pour x≠4', text: '$\\dfrac{x-4}{(x-4)(\\sqrt{x}+2)} = \\dfrac{1}{\\sqrt{x}+2}$' },
          ],
          result: {
            tag: 'conclusion — limite',
            text: '$\\displaystyle\\lim_{x \\to 4} \\dfrac{\\sqrt{x}-2}{x-4} = \\dfrac{1}{\\sqrt{4}+2} = \\dfrac{1}{4}$',
          },
        },
        {
          kind: 'exemple',
          badge: 'forme ∞−∞ avec une limite non nulle — conjuguée, puis terme dominant',
          formula: '$\\displaystyle\\lim_{x \\to +\\infty} \\left[\\sqrt{x^2+4x} - x\\right]$',
          steps: [
            { tag: 'vérifier la forme', text: '$\\sqrt{x^2+4x} \\to +\\infty$ et $x \\to +\\infty$ → forme $\\infty-\\infty$' },
            {
              tag: 'multiplier par l\'expression conjuguée',
              text: '$\\sqrt{x^2+4x}-x = \\dfrac{\\left(\\sqrt{x^2+4x}-x\\right)\\left(\\sqrt{x^2+4x}+x\\right)}{\\sqrt{x^2+4x}+x} = \\dfrac{x^2+4x-x^2}{\\sqrt{x^2+4x}+x} = \\dfrac{4x}{\\sqrt{x^2+4x}+x}$ — une nouvelle forme $\\dfrac{\\infty}{\\infty}$',
            },
            {
              tag: 'mettre x en évidence, sous la racine aussi (x > 0)',
              text: '$\\sqrt{x^2+4x} = \\sqrt{x^2\\left(1+\\frac{4}{x}\\right)} = x\\sqrt{1+\\frac{4}{x}}$, donc $\\dfrac{4x}{x\\sqrt{1+\\frac{4}{x}}+x} = \\dfrac{4}{\\sqrt{1+\\frac{4}{x}}+1}$',
            },
          ],
          result: {
            tag: 'passer à la limite — 4/x tend vers 0',
            text: '$\\displaystyle\\lim_{x \\to +\\infty} \\left[\\sqrt{x^2+4x}-x\\right] = \\dfrac{4}{\\sqrt{1}+1} = 2$ : cette fois, l\'écart ne s\'éteint pas.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => Math.sqrt(x * x + 4 * x) - x, tone: 'accent' }],
            xMin: 0,
            xMax: 40,
            xTicks: [20, 40],
            fixedYRange: { min: 0, max: 2.6 },
            horizontalAsymptotes: [{ y: 2, label: 'y=2' }],
            points: [{ x: 10, y: Math.sqrt(140) - 10, label: 'f(10)≈1,83', tone: 'accent', labelPos: 'below' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\sqrt{x^2+4x}-x$ — l\'écart entre $\\sqrt{x^2+4x}$ et $x$ se rapproche de $2$, ' +
              'pas de $0$ : la conjuguée seule ne dit pas la limite, il faut finir le calcul',
          },
        },
        {
          kind: 'exemple',
          badge: 'quand la limite n\'existe pas — limites différentes à gauche et à droite',
          formula: 'Soit $f(x) = x+3$ si $x \\le 2$, et $f(x) = x-3$ si $x>2$. La limite $\\displaystyle\\lim_{x \\to 2} f(x)$ existe-t-elle ?',
          steps: [
            { tag: 'valeur en x=2 — donnée par la première branche (x≤2)', text: '$f(2) = 2+3 = 5$' },
            { tag: 'limite à gauche — première branche (x<2), quand x→2⁻', text: '$\\displaystyle\\lim_{x \\to 2^-} f(x) = 2+3 = 5$' },
            { tag: 'limite à droite — deuxième branche (x>2), quand x→2⁺', text: '$\\displaystyle\\lim_{x \\to 2^+} f(x) = 2-3 = -1$' },
          ],
          result: {
            tag: 'conclusion — comparer la gauche et la droite',
            text: 'Limite à gauche $5$, limite à droite $-1$ : $5 \\neq -1$, donc $\\displaystyle\\lim_{x \\to 2} f(x)$ n\'existe pas (la courbe fait un saut en x=2) — même si $f(2)=5$ existe.',
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
              { x: 0.5, y: 3.5, label: '', tone: 'good' },
              { x: 1.2, y: 4.2, label: '', tone: 'good' },
              { x: 1.6, y: 4.6, label: '', tone: 'good' },
              { x: 2, y: 5, label: '(2;5)', tone: 'accent', style: 'filled', labelPos: 'right' },
              { x: 3.5, y: 0.5, label: '', tone: 'bad' },
              { x: 2.8, y: -0.2, label: '', tone: 'bad' },
              { x: 2.4, y: -0.6, label: '', tone: 'bad' },
              { x: 2, y: -1, label: '(2;−1)', tone: 'bad', style: 'open', labelPos: 'below' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=x+3$ si $x\\le 2$, $f(x)=x-3$ si $x>2$ — en vert, des points d\'abscisses $0{,}5$ ; $1{,}2$ ; ' +
              '$1{,}6$ qui s\'approchent de 2 par la gauche : leurs ordonnées montent vers 5. En rouge, des points ' +
              'd\'abscisses $3{,}5$ ; $2{,}8$ ; $2{,}4$ qui s\'approchent par la droite : leurs ordonnées descendent ' +
              'vers $-1$ (point vide). Deux cibles différentes : un saut',
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
            xTicks: [-8, 7],
            fixedYRange: { min: -12, max: 14 },
            verticalAsymptotes: [{ x: -3 }],
            horizontalAsymptotes: [{ y: 2 }],
            textLabels: [
              { x: -12.5, y: 0.6, text: 'y=2', tone: 'faint', anchor: 'start' },
              { x: -3.4, y: -10.8, text: 'x=−3', tone: 'faint', anchor: 'end' },
            ],
            points: [
              { x: -8, y: (2 * -8 - 5) / (-8 + 3), label: 'f(−8)=4,2', tone: 'accent', labelPos: 'below' },
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
          badge: 'racine double au dénominateur — même signe des deux côtés',
          formula: '$\\displaystyle\\lim_{x \\to 1} \\dfrac{x+2}{(x-1)^2}$, à gauche puis à droite de 1.',
          steps: [
            {
              tag: 'vérifier la forme — dénominateur nul, numérateur non nul',
              text: 'En $x=1$ : numérateur $1+2=3\\neq 0$ et dénominateur $(1-1)^2=0$ → forme $\\dfrac{3}{0}$, la limite est infinie. Reste son signe.',
            },
            {
              tag: 'signe du dénominateur — un carré',
              text: 'Pour tout $x\\neq 1$, $(x-1)^2>0$ : le dénominateur tend vers $0^+$ à gauche ET à droite de 1. Un carré ne change jamais de signe.',
            },
          ],
          result: {
            tag: 'conclusion — le même infini des deux côtés',
            text:
              '$\\displaystyle\\lim_{x \\to 1^-} \\dfrac{x+2}{(x-1)^2} = \\dfrac{3}{0^+} = +\\infty$ et ' +
              '$\\displaystyle\\lim_{x \\to 1^+} \\dfrac{x+2}{(x-1)^2} = \\dfrac{3}{0^+} = +\\infty$, donc ' +
              '$\\displaystyle\\lim_{x \\to 1} \\dfrac{x+2}{(x-1)^2} = +\\infty$ : asymptote verticale $x=1$, ' +
              'la courbe monte des deux côtés. Avec $\\dfrac{x+2}{x-1}$ (racine simple), le dénominateur change ' +
              'de signe en 1 : $-\\infty$ à gauche, $+\\infty$ à droite.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x + 2) / (x - 1), tone: 'faint', xMin: -4, xMax: 0.7 },
              { fn: (x) => (x + 2) / (x - 1), tone: 'faint', xMin: 1.27, xMax: 6 },
              { fn: (x) => (x + 2) / ((x - 1) * (x - 1)), tone: 'accent', xMin: -4, xMax: 0.55 },
              { fn: (x) => (x + 2) / ((x - 1) * (x - 1)), tone: 'accent', xMin: 1.45, xMax: 6 },
            ],
            xMin: -4,
            xMax: 6,
            xTicks: [1],
            fixedYRange: { min: -8, max: 12 },
            verticalAsymptotes: [{ x: 1 }],
            textLabels: [{ x: 1.3, y: -7, text: 'x=1', tone: 'faint', anchor: 'start' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              'En orange, $\\dfrac{x+2}{(x-1)^2}$ : la courbe part vers $+\\infty$ des deux côtés de $x=1$ ' +
              '(racine double). En gris, $\\dfrac{x+2}{x-1}$ : $-\\infty$ à gauche, $+\\infty$ à droite ' +
              '(racine simple)',
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
            points: [{ x: -3, y: -6, label: '(−3;−6)', tone: 'good', style: 'open', labelPos: 'right' }],
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
        {
          kind: 'exemple',
          badge: 'racine en −∞ — √(x²) = |x| = −x',
          formula: 'Calcule $\\lim\\limits_{x\\to-\\infty}\\dfrac{\\sqrt{x^2+1}}{x}$.',
          steps: [
            { tag: 'forme', text: 'Numérateur $\\to+\\infty$, dénominateur $\\to-\\infty$ : forme $\\dfrac{\\infty}{\\infty}$.' },
            { tag: 'mettre x² en évidence sous la racine', text: '$\\sqrt{x^2+1}=\\sqrt{x^2\\left(1+\\dfrac{1}{x^2}\\right)}=\\sqrt{x^2}\\,\\sqrt{1+\\dfrac{1}{x^2}}$' },
            { tag: 'en −∞, x < 0', text: '$\\sqrt{x^2}=|x|=-x$ (et non $x$, qui est négatif)' },
            { tag: 'simplifier', text: '$\\dfrac{\\sqrt{x^2+1}}{x}=\\dfrac{-x\\sqrt{1+\\frac{1}{x^2}}}{x}=-\\sqrt{1+\\dfrac{1}{x^2}}$' },
          ],
          result: { tag: 'conclusion', text: '$\\lim\\limits_{x\\to-\\infty}\\dfrac{\\sqrt{x^2+1}}{x}=-\\sqrt{1+0}=-1$ (en $+\\infty$, la même limite vaut $1$ : il faut lire $-\\infty$ et $+\\infty$ séparément).' },
        },
        {
          kind: 'entrainement',
          title: 'Limites avec racines carrées : expression conjuguée',
          generatorId: '5gen64',
          chantier: '5e-4h',
          description: [
            'Formes ∞ − ∞ (√(x² + bx + c) − x, différence de deux racines), 0/0 ((√(x + 9) − 3)/x) et ∞/∞ en −∞ : reconnais la forme, multiplie par l’expression conjuguée (produit remarquable (A − B)(A + B) = A² − B²) ou mets x² en évidence sous la racine — en −∞, √(x²) = |x| = −x —, simplifie, puis donne la limite exacte.',
          ],
          whereLabel: '5e (4h) → « 64. Limites avec racines carrées : expression conjuguée »',
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
          kind: 'exempleLibre',
          label: 'Démonstration — les deux méthodes donnent la même droite',
          blocks: [
            {
              kind: 'para',
              text:
                'Suppose que la division euclidienne a donné $f(x) = ax+b+r(x)$, avec $a\\neq 0$ et un ' +
                'reste $r(x)$ (le reste divisé par le dénominateur) qui tend vers $0$ quand $x \\to +\\infty$ ' +
                '— comme $\\dfrac{3}{x-1}$ dans l\'exemple. On veut montrer que la méthode des limites ' +
                'retrouve exactement les mêmes $a$ et $b$.',
            },
            {
              kind: 'para',
              text:
                '**1.** Divise chaque terme par $x$ ($x\\neq 0$) : ' +
                '$\\dfrac{f(x)}{x} = \\dfrac{ax}{x}+\\dfrac{b}{x}+\\dfrac{r(x)}{x} = a+\\dfrac{b}{x}+r(x)\\cdot\\dfrac{1}{x}$.',
            },
            {
              kind: 'para',
              text:
                '**2.** Quand $x \\to +\\infty$ : $\\dfrac{b}{x} \\to 0$ (limite de référence, multipliée ' +
                'par la constante $b$) et $r(x)\\cdot\\dfrac{1}{x} \\to 0\\cdot 0 = 0$ (produit de deux ' +
                'limites finies). Donc $\\displaystyle\\lim_{x \\to +\\infty} \\dfrac{f(x)}{x} = a+0+0 = a$ : ' +
                'la première limite redonne le coefficient $a$ du quotient.',
            },
            {
              kind: 'para',
              text:
                '**3.** Retire $ax$ : $f(x)-ax = b+r(x)$. Quand $x \\to +\\infty$, $r(x) \\to 0$, donc ' +
                '$\\displaystyle\\lim_{x \\to +\\infty} \\big[f(x)-ax\\big] = b+0 = b$ : la seconde limite ' +
                'redonne la constante $b$ du quotient.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Les deux méthodes mènent à la même droite $y=ax+b$, et l\'écart ' +
                '$f(x)-(ax+b) = r(x)$ tend vers $0$ : c\'est exactement la définition d\'une asymptote ' +
                'oblique. Le raisonnement est identique en $-\\infty$.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'zoom-arriere-asymptote-widget',
          label: 'Manipule toi-même — prends du recul',
          caption:
            'Dézoome (×10 à chaque fois) : de loin, la courbe de (x² − 3x + 5)/(x − 1) devient ' +
            'impossible à distinguer de la droite y = x − 2, et l\'écart affiché fond. Essaie les deux ' +
            'autres fonctions : une horizontale, et x³/(x − 1), qu\'aucune droite ne suit.',
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
          kind: 'exemple',
          badge: 'asymptote oblique — dénominateur de degré 2',
          formula:
            '$f(x) = \\dfrac{2x^3+x^2-1}{x^2+1}$. Détermine son domaine, son asymptote oblique et le point ' +
            'où la courbe la recoupe.',
          steps: [
            { tag: 'domaine', text: '$x^2+1 \\geq 1 > 0$ pour tout $x$ : domaine $= \\mathbb{R}$, aucune asymptote verticale' },
            { tag: 'vérifier la condition de degré', text: 'deg(numérateur)=3, deg(dénominateur)=2, soit exactement 1 de plus → asymptote oblique' },
            {
              tag: 'division euclidienne de 2x³+x²−1 par x²+1',
              text: '$2x^3+x^2-1 = (x^2+1)(2x+1) + (-2x-2)$ ; vérification : $(x^2+1)(2x+1) = 2x^3+x^2+2x+1$, et $2x^3+x^2+2x+1-2x-2 = 2x^3+x^2-1$',
            },
            { tag: 'réécrire f(x)', text: '$f(x) = 2x+1+\\dfrac{-2x-2}{x^2+1}$ : le reste a un degré plus petit que $x^2+1$, la fraction tend vers $0$ en $\\pm\\infty$' },
            { tag: 'recoupement — le reste s\'annule', text: '$-2x-2 = 0 \\iff x = -1$, et $f(-1) = \\dfrac{-2+1-1}{2} = -1 = 2\\cdot(-1)+1$' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'Asymptote oblique $y = 2x+1$ (en $-\\infty$ et en $+\\infty$), recoupée au point $(-1\\,;-1)$. ' +
              'La courbe est au-dessus pour $x<-1$ (reste positif), en dessous pour $x>-1$ (reste négatif).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => (2 * x * x * x + x * x - 1) / (x * x + 1), tone: 'accent' }],
            xMin: -6,
            xMax: 6,
            xTicks: [],
            fixedYRange: { min: -12, max: 14 },
            obliqueAsymptotes: [{ a: 2, b: 1, label: 'y=2x+1' }],
            points: [{ x: -1, y: -1, label: '', tone: 'good' }],
            textLabels: [{ x: -0.7, y: -4.6, text: '(−1;−1)', tone: 'good', anchor: 'start' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\dfrac{2x^3+x^2-1}{x^2+1}$ — aucune asymptote verticale ; la courbe traverse son ' +
              'asymptote oblique $y=2x+1$ en $(-1\\,;-1)$ puis s\'en rapproche aux deux extrémités',
          },
        },
        {
          kind: 'atelier',
          tag: 'degre-asymptote-widget',
          label: 'Manipule toi-même — les 4 cas du degré en direct',
          caption:
            'Choisis le dénominateur (x − 1 ou x² + 1), puis le degré du numérateur : le quotient et le ' +
            'reste de la division euclidienne s\'affichent, et tu passes par les 4 cas de la méthode — ' +
            'horizontale y = 0, horizontale par les coefficients dominants, oblique, ou aucune asymptote ' +
            'de cette forme. x − 1 avec le degré 2 reproduit le premier exemple, x² + 1 avec le degré 3 ' +
            'le second.',
        },
        {
          kind: 'methode',
          label: 'Méthode — position de la courbe par rapport à son asymptote',
          items: [
            'Écris l\'écart $f(x)-(ax+b)$ (ou $f(x)-k$ pour une asymptote horizontale $y=k$) sous la forme d\'**une seule fraction** $\\dfrac{R(x)}{D(x)}$ : c\'est le reste de la division euclidienne divisé par le dénominateur.',
            'Étudie le **signe** de cette fraction (tableau de signes). Positif : la courbe est **au-dessus** de l\'asymptote ; négatif : **en dessous** ; nul : la courbe **recoupe** son asymptote.',
            'Les points de recoupement sont les solutions de $R(x)=0$ (le dénominateur ne s\'annule pas) ; leur ordonnée se lit sur l\'asymptote.',
            'Le signe de l\'écart pour $x$ très grand (puis très négatif) dit de quel côté la courbe s\'approche de son asymptote en $+\\infty$ (puis en $-\\infty$).',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — au-dessus, en dessous, recoupement',
          blocks: [
            { kind: 'para', text: 'Soit $f(x)=\\dfrac{x^3+3x^2+9x+1}{x^2+2x+5}$, dont la droite $d : y=x+1$ est l\'asymptote oblique. Étudie la position de la courbe de $f$ par rapport à $d$.' },
            { kind: 'para', text: '**Écart réduit au même dénominateur.** $(x+1)(x^2+2x+5)=x^3+3x^2+7x+5$, donc $f(x)-(x+1)=\\dfrac{x^3+3x^2+9x+1-(x^3+3x^2+7x+5)}{x^2+2x+5}=\\dfrac{2x-4}{x^2+2x+5}$.' },
            { kind: 'para', text: '**Signe.** $\\Delta=2^2-4\\cdot 5=-16<0$ : le dénominateur n\'a pas de racine, il est toujours positif. Le signe de l\'écart est celui de $2x-4$, qui s\'annule en $x=2$.' },
            {
              kind: 'signTable',
              caption: 'Signe de f(x) − (x + 1) et position de la courbe par rapport à d',
              rows: [
                { label: 'x', cells: [{ text: '−∞', tone: 'plain' }, { text: '', tone: 'plain' }, { text: '2', tone: 'zero' }, { text: '', tone: 'plain' }, { text: '+∞', tone: 'plain' }] },
                { label: '2x − 4', cells: [{ text: '', tone: 'plain' }, { text: '−', tone: 'neg' }, { text: '0', tone: 'zero' }, { text: '+', tone: 'pos' }, { text: '', tone: 'plain' }] },
                { label: 'x² + 2x + 5', cells: [{ text: '', tone: 'plain' }, { text: '+', tone: 'pos' }, { text: '', tone: 'plain' }, { text: '+', tone: 'pos' }, { text: '', tone: 'plain' }] },
                { label: 'f(x) − (x + 1)', cells: [{ text: '', tone: 'plain' }, { text: '−', tone: 'neg' }, { text: '0', tone: 'zero' }, { text: '+', tone: 'pos' }, { text: '', tone: 'plain' }] },
                { label: 'courbe / d', cells: [{ text: '', tone: 'plain' }, { text: 'en dessous', tone: 'plain' }, { text: 'point commun', tone: 'zero' }, { text: 'au-dessus', tone: 'plain' }, { text: '', tone: 'plain' }] },
              ],
            },
            { kind: 'para', text: '**Recoupement.** $2x-4=0\\iff x=2$, et $y=2+1=3$ : la courbe recoupe $d$ au point $(2\\,;3)$ (vérification : $f(2)=\\dfrac{39}{13}=3$).' },
            { kind: 'para', text: '**Côtés d\'approche.** Pour $x$ très grand, $2x-4>0$ : en $+\\infty$, la courbe s\'approche de $d$ par au-dessus ; pour $x$ très négatif, $2x-4<0$ : en $-\\infty$, par en dessous.' },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [{ fn: (x) => (x * x * x + 3 * x * x + 9 * x + 1) / (x * x + 2 * x + 5), tone: 'accent' }],
                xMin: -7,
                xMax: 7,
                xTicks: [2],
                fixedYRange: { min: -7, max: 9 },
                obliqueAsymptotes: [{ a: 1, b: 1, label: 'y=x+1' }],
                points: [{ x: 2, y: 3, label: '', tone: 'good' }],
                textLabels: [{ x: 2.3, y: 1.6, text: '(2;3)', tone: 'good', anchor: 'start' }],
                xAxisLabel: 'x',
                yAxisLabel: 'f(x)',
                caption: 'La courbe est en dessous de $y=x+1$ pour $x<2$, la recoupe en $(2\\,;3)$, puis reste au-dessus',
              },
            },
          ],
        },
        {
          kind: 'attention',
          label: 'Reste constant, dénominateur sans racine',
          text: 'Si le reste est une constante non nulle $c$ et que le dénominateur ne s\'annule jamais, l\'écart $\\dfrac{c}{D(x)}$ garde le signe de $c$ : la courbe reste du même côté de son asymptote sur tout $\\mathbb{R}$ (au-dessus si $c>0$, en dessous si $c<0$) et ne la recoupe jamais.',
        },
        {
          kind: 'entrainement',
          title: 'Asymptote oblique',
          generatorId: '5gen21',
          description: [
            'Détermine l\'équation y = ax + b d\'une asymptote oblique, par division euclidienne ou par la ' +
              'méthode des limites (a = lim f(x)/x, b = lim (f(x) − ax)) — pour un dénominateur de degré 1 ou 2 ; ' +
              'ou étudie la position de la courbe par rapport à son asymptote (signe de f(x) − (ax + b), ' +
              'point de recoupement, côté d\'approche en −∞ et en +∞).',
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
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: -6, xMax: -1.03 },
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: -0.97, xMax: 1.97 },
              { fn: (x) => 1 / ((x + 1) * (x - 2)), tone: 'accent', xMin: 2.03, xMax: 7 },
            ],
            xMin: -6,
            xMax: 7,
            xTicks: [-1, 2],
            fixedYRange: { min: -6, max: 6 },
            verticalAsymptotes: [{ x: -1 }, { x: 2, label: 'x=2' }],
            horizontalAsymptotes: [{ y: 0, label: 'y=0' }],
            textLabels: [
              { x: -1.5, y: 4.6, text: '+∞', tone: 'faint', anchor: 'end' },
              { x: -0.5, y: -4.8, text: '−∞', tone: 'faint', anchor: 'start' },
              { x: 1.5, y: -4.8, text: '−∞', tone: 'faint', anchor: 'end' },
              { x: 2.5, y: 4.6, text: '+∞', tone: 'faint', anchor: 'start' },
              { x: -1.3, y: -5.4, text: 'x=−1', tone: 'faint', anchor: 'end' },
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
            caption: 'à gauche de $x=1$, la courbe arrive sur le point plein $(1\\,;2)$ ; à droite, elle part vers $+\\infty$ — la droite $x=1$ (pointillée) reste une asymptote verticale',
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
          kind: 'exempleLibre',
          label: 'Démonstration — une fonction rationnelle a la même limite finie en −∞ et en +∞',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $f(x)=\\dfrac{N(x)}{D(x)}$ une fonction rationnelle telle que ' +
                '$\\displaystyle\\lim_{x \\to +\\infty} f(x) = L$, avec $L$ un nombre réel. On veut montrer ' +
                'que $\\displaystyle\\lim_{x \\to -\\infty} f(x) = L$ aussi.',
            },
            {
              kind: 'para',
              text:
                '**1.** Si le degré de $N$ dépassait celui de $D$, la limite en $+\\infty$ serait infinie ' +
                '(comparaison des degrés, section 1). Comme $L$ est fini, $\\deg N \\leq \\deg D$. Note $n$ ' +
                'le degré de $D$.',
            },
            {
              kind: 'para',
              text:
                '**2.** Écris $D(x) = q_nx^n+q_{n-1}x^{n-1}+\\ldots+q_0$ avec $q_n\\neq 0$, et ' +
                '$N(x) = p_nx^n+p_{n-1}x^{n-1}+\\ldots+p_0$, où $p_n$ vaut $0$ si $\\deg N<n$.',
            },
            {
              kind: 'para',
              text:
                '**3.** Mets $x^n$ en évidence en haut et en bas, puis simplifie par $x^n$ ($x\\neq 0$) : ' +
                '$f(x) = \\dfrac{p_n+\\frac{p_{n-1}}{x}+\\ldots+\\frac{p_0}{x^n}}{q_n+\\frac{q_{n-1}}{x}+\\ldots+\\frac{q_0}{x^n}}$.',
            },
            {
              kind: 'para',
              text:
                '**4.** Chaque terme $\\dfrac{p_k}{x^{n-k}}$ ou $\\dfrac{q_k}{x^{n-k}}$ (avec $k<n$) est une ' +
                'constante multipliée par une puissance de $\\dfrac{1}{x}$. Or $\\dfrac{1}{x} \\to 0$ aussi bien ' +
                'quand $x \\to +\\infty$ que quand $x \\to -\\infty$. Tous ces termes tendent donc vers $0$, des ' +
                'deux côtés : $f(x) \\to \\dfrac{p_n}{q_n}$ en $+\\infty$ ET en $-\\infty$.',
            },
            {
              kind: 'para',
              text:
                '**5.** En $+\\infty$, cette limite vaut $L$ (hypothèse) : donc $L = \\dfrac{p_n}{q_n}$, et ' +
                'la limite en $-\\infty$ est le même nombre $\\dfrac{p_n}{q_n} = L$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Une fonction rationnelle n\'a jamais deux asymptotes horizontales ' +
                'différentes : sa limite finie est la même des deux côtés ($0$ si $\\deg N<\\deg D$, le ' +
                'rapport des coefficients dominants si les degrés sont égaux). La fonction $k$ ci-dessus, ' +
                'avec sa racine carrée, n\'est pas rationnelle : la preuve ne s\'applique pas à elle.',
            },
          ],
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
          kind: 'atelier',
          tag: 'cote-asymptote-widget',
          label: 'Manipule toi-même — de quel côté ça part ?',
          caption:
            'Choisis une racine simple (x − 1) ou double ((x − 1)²) au dénominateur et le signe du ' +
            'numérateur, puis approche-toi de x = 1 par la gauche ou par la droite : les signes du ' +
            'numérateur, du dénominateur et du quotient s\'affichent en direct. Racine simple : les deux ' +
            'côtés partent en sens opposés. Racine double : du même côté.',
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
        {
          kind: 'methode',
          label: 'Méthode — d\'un tableau de limites à une esquisse du graphique',
          items: [
            'Trace d\'abord les **asymptotes** en pointillés : une asymptote verticale $x=a$ pour chaque limite infinie en $a$ ; une asymptote horizontale $y=b$ pour chaque limite finie $b$ en $-\\infty$ ou en $+\\infty$ ; l\'asymptote oblique si le tableau la donne.',
            'Pour chaque ligne du tableau, dessine un **bout de branche** au bon endroit : juste à gauche ($x\\to a^-$) ou juste à droite ($x\\to a^+$) de la verticale, vers le haut ($+\\infty$) ou vers le bas ($-\\infty$) ; tout à gauche ou tout à droite le long de l\'horizontale.',
            'Relie les bouts de branche de chaque intervalle du domaine **sans jamais traverser une asymptote verticale**, puis relis chaque ligne du tableau sur ton dessin.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — esquisser un graphique depuis ses limites',
          blocks: [
            { kind: 'para', text: 'Une fonction $f$ définie sur $\\mathbb{R}\\setminus\\{1\\}$ vérifie : $\\lim\\limits_{x\\to-\\infty}f(x)=2$, $\\lim\\limits_{x\\to 1^-}f(x)=+\\infty$, $\\lim\\limits_{x\\to 1^+}f(x)=-\\infty$ et $\\lim\\limits_{x\\to+\\infty}f(x)=2$. Esquisse son graphique.' },
            { kind: 'para', text: '**Asymptotes.** Les limites infinies en $1$ donnent l\'asymptote verticale $x=1$ ; la limite $2$ en $-\\infty$ et en $+\\infty$ donne UNE asymptote horizontale $y=2$.' },
            { kind: 'para', text: '**Bouts de branche.** À gauche de $x=1$, la courbe monte le long de la verticale ; à droite, elle descend le long de la verticale. Tout à gauche et tout à droite, elle longe $y=2$.' },
            { kind: 'para', text: '**Liaison.** Sur $]-\\infty\\,;1[$, la courbe part de $y=2$ et monte vers $+\\infty$ ; sur $]1\\,;+\\infty[$, elle remonte de $-\\infty$ vers $y=2$. Une fonction qui convient : $f(x)=2+\\dfrac{1}{1-x}$.' },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => 2 + 1 / (1 - x), tone: 'accent', xMax: 0.93 },
                  { fn: (x) => 2 + 1 / (1 - x), tone: 'accent', xMin: 1.07 },
                ],
                xMin: -6,
                xMax: 7,
                xTicks: [1],
                fixedYRange: { min: -6, max: 10 },
                verticalAsymptotes: [{ x: 1, label: 'x=1' }],
                horizontalAsymptotes: [{ y: 2, label: 'y=2' }],
                xAxisLabel: 'x',
                yAxisLabel: 'f(x)',
                caption: 'Esquisse : asymptotes $x=1$ et $y=2$, branche montante à gauche de $x=1$, descendante à droite',
              },
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Du tableau de limites au graphique',
          generatorId: '5gen66',
          chantier: '5e-4h',
          description: [
            'Le chemin inverse de la lecture graphique : un tableau de limites est donné, choisis le seul graphique qui lui correspond parmi quatre — les trois autres portent une erreur classique (côté d’approche d’une asymptote verticale inversé, limites à gauche et à droite échangées, asymptote horizontale confondue avec une valeur atteinte, asymptote oblique mal placée) —, puis écris les équations des asymptotes.',
          ],
          whereLabel: '5e (4h) → « 66. Du tableau de limites au graphique »',
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
              { x: 10, y: 32, label: 'Cᵤ(10)=32 €', tone: 'accent', labelPos: 'right' },
              { x: 100, y: 10.4, label: 'Cᵤ(100)=10,4 €', tone: 'accent', labelPos: 'above' },
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
          kind: 'exempleLibre',
          label: 'Démonstration — le signe de a décide du sens',
          blocks: [
            {
              kind: 'para',
              text:
                'Soit $f(x)=b+\\dfrac{a}{x+p}$, avec $a>0$ et $p>0$. On veut montrer que $f$ est ' +
                'décroissante sur $[0\\,;+\\infty[$ et que sa courbe ne coupe jamais la droite $y=b$.',
            },
            {
              kind: 'para',
              text:
                '**1.** Prends deux nombres $x_1$ et $x_2$ avec $0\\leq x_1<x_2$. Ajoute $p$ partout : ' +
                '$p\\leq x_1+p<x_2+p$. Comme $p>0$, les deux nombres $x_1+p$ et $x_2+p$ sont strictement positifs.',
            },
            {
              kind: 'para',
              text:
                '**2.** La fonction inverse est décroissante sur $]0\\,;+\\infty[$ (4e année) : entre deux ' +
                'nombres positifs, le plus grand a le plus petit inverse. Donc ' +
                '$\\dfrac{1}{x_1+p} > \\dfrac{1}{x_2+p}$.',
            },
            {
              kind: 'para',
              text:
                '**3.** Multiplie par $a>0$ (le sens ne change pas), puis ajoute $b$ : ' +
                '$b+\\dfrac{a}{x_1+p} > b+\\dfrac{a}{x_2+p}$, c\'est-à-dire $f(x_1) > f(x_2)$. ' +
                'Un $x$ plus grand donne une image plus petite : $f$ est décroissante sur $[0\\,;+\\infty[$.',
            },
            {
              kind: 'para',
              text:
                '**4.** Si la courbe coupait $y=b$, on aurait $f(x)=b$, soit $\\dfrac{a}{x+p}=0$. Une ' +
                'fraction n\'est nulle que si son numérateur est nul : il faudrait $a=0$, ce qui est faux. ' +
                'Mieux : $f(x)-b = \\dfrac{a}{x+p} > 0$ pour tout $x\\geq 0$ (quotient de deux positifs), ' +
                'la courbe reste strictement au-dessus de $y=b$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** Avec $a>0$, $f$ descend vers $b$ sans jamais l\'atteindre : $y=b$ est un ' +
                'plancher. Avec $a<0$, l\'étape 3 change de sens (multiplier par un négatif) : $f$ est ' +
                'croissante, toujours en dessous de $y=b$ — un plafond.',
            },
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
          kind: 'atelier',
          tag: 'cuve-eau-salee-widget',
          label: 'Manipule toi-même — la cuve d\'eau salée',
          caption:
            'Change le volume de départ, le débit et la concentration de l\'eau ajoutée : le plafond de ' +
            'la concentration ne dépend que de la concentration ajoutée. Le volume et le débit ne changent ' +
            'que la vitesse à laquelle on s\'en approche (le temps pour atteindre 90 % du plafond).',
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
            'compatible avec la situation réelle. Dans l\'exemple du coût unitaire, x≥1 unité ' +
            'produite : la limite en +∞ garde tout son sens, la fonction n\'a simplement aucun intérêt pour x<1.',
        },
        {
          kind: 'astuce',
          label: 'Une asymptote horizontale en contexte = un plancher ou un plafond',
          text:
            'Que le phénomène descende vers cette valeur (un **plancher**, comme le coût unitaire) ' +
            'ou monte vers elle (un **plafond**, comme la concentration de l\'eau salée), la limite donne ' +
            'la valeur théorique à long terme. Dans ces modèles, elle n\'est pas atteinte pour un ' +
            'x fini, aussi grand soit-il : le terme en $1/x$ (ou en $1/(x+p)$) ne s\'annule jamais.',
        },
        {
          kind: 'atelier',
          tag: 'plancher-plafond-widget',
          label: 'Manipule toi-même — plancher ou plafond, jamais atteint',
          caption:
            'Mode plancher : règle le coût fixe F et le coût variable v (F = 240, v = 8 : l\'exemple du ' +
            'coût unitaire). Mode plafond : b + a/(x + p) avec a < 0 (la population qui monte). Déplace x : ' +
            'l\'écart à l\'asymptote reste toujours strictement positif, aussi grand que x devienne.',
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
          titre: 'Prévoir la vitesse maximale d\'une enzyme',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (S) => (10 * S) / (2 + S), tone: 'accent' }],
              xMin: 0,
              xMax: 30,
              xTicks: [2, 10, 20, 30],
              yTicks: [5, 10],
              fixedYRange: { min: 0, max: 12 },
              horizontalAsymptotes: [{ y: 10, label: 'v=v_{max}=10' }],
              points: [{ x: 2, y: 5, label: 'v(K)=5', tone: 'good', labelPos: 'right' }],
              xAxisLabel: 'S (mmol/L)',
              yAxisLabel: 'v (µmol/min)',
              caption:
                'Modèle de Michaelis–Menten $v(S)=\\dfrac{10S}{2+S}$ ($v_{max}=10$ µmol/min, $K=2$ mmol/L) — ' +
                'la vitesse monte vers $v_{max}$ sans l\'atteindre ; pour $S=K=2$, elle vaut exactement ' +
                'la moitié, $5$ µmol/min.',
            },
          ],
          text:
            'Une **enzyme** accélère une réaction chimique dans une cellule. Plus il y a de substance à ' +
            'transformer (concentration $S$), plus la réaction va vite… mais pas indéfiniment : l\'enzyme ' +
            'sature. En 1913, **Leonor Michaelis** et **Maud Menten** proposent le modèle ' +
            '$v(S)=\\dfrac{v_{max}\\cdot S}{K+S}$ — une vraie fonction rationnelle, dont l\'étude complète ' +
            'suit la démarche de cette section. Domaine : $S\\geq 0$ (une concentration), la valeur exclue ' +
            '$S=-K$ est hors du contexte. Degrés égaux : asymptote horizontale $v=v_{max}$, la vitesse ' +
            'maximale. Division euclidienne : $v(S)=v_{max}-\\dfrac{v_{max}\\cdot K}{K+S}$, de la forme ' +
            '$b+\\dfrac{a}{x+p}$ avec $a<0$ : la vitesse monte et reste toujours sous $v_{max}$. Et le sens ' +
            'concret de $K$ : $v(K)=\\dfrac{v_{max}\\cdot K}{2K}=\\dfrac{v_{max}}{2}$, la concentration qui ' +
            'donne la **demi-vitesse**. Les biochimistes mesurent quelques vitesses, en déduisent ' +
            '$v_{max}$ et $K$, et comparent ainsi l\'efficacité des enzymes ou des médicaments qui les bloquent.',
          domaines: ['Biochimie', 'Chimie'],
        },
        {
          kind: 'exemple',
          badge: 'étude complète d\'une fonction rationnelle',
          formula: '$f(x) = \\dfrac{x^2-2x-3}{x-1}$. Mène l\'étude complète de f.',
          steps: [
            { tag: 'domaine — annuler le dénominateur', text: '$x-1=0 \\iff x=1$, donc domaine $= \\mathbb{R}\\setminus\\{1\\}$' },
            { tag: 'point vide ou vraie asymptote ? — évaluer le numérateur en x=1', text: 'En $x=1$, le numérateur vaut $1^2-2\\cdot 1-3=-4\\neq 0$ → $x=1$ est une VRAIE asymptote verticale (pas un point vide)' },
            { tag: 'comparaison des degrés', text: 'deg(numérateur)=2, deg(dénominateur)=1, soit exactement 1 de plus → asymptote OBLIQUE' },
            {
              tag: 'division euclidienne — x²−2x−3 par x−1',
              text: '$x^2-2x-3 = (x-1)(x-1) - 4 \\implies f(x) = (x-1) - \\dfrac{4}{x-1}$',
            },
            { tag: 'asymptote oblique', text: '$y = x-1$' },
            {
              tag: 'limites en x=1 — signe du dénominateur de chaque côté (tableau de signes ci-dessous)',
              text:
                'Le numérateur tend vers $-4$. Le dénominateur $x-1$ est négatif à gauche de 1 et positif à ' +
                'droite. Donc $\\displaystyle\\lim_{x \\to 1^-} f(x) = \\dfrac{-4}{0^-} = +\\infty$ et ' +
                '$\\displaystyle\\lim_{x \\to 1^+} f(x) = \\dfrac{-4}{0^+} = -\\infty$. Vérification : ' +
                '$f(0{,}9) = \\dfrac{-3{,}99}{-0{,}1} = 39{,}9$ et $f(1{,}1) = \\dfrac{-3{,}99}{0{,}1} = -39{,}9$.',
            },
            {
              tag: 'limites aux bornes infinies — la courbe suit l\'asymptote',
              text: '$\\displaystyle\\lim_{x \\to -\\infty} f(x) = -\\infty$ et $\\displaystyle\\lim_{x \\to +\\infty} f(x) = +\\infty$ (le terme x−1 domine)',
            },
          ],
          result: {
            tag: 'synthèse complète',
            text:
              'Domaine : $\\mathbb{R}\\setminus\\{1\\}$. Asymptote verticale : x=1 (+∞ à gauche, −∞ à droite). ' +
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
              { x: -0.3, y: 8.8, text: '+∞', tone: 'faint', anchor: 'end' },
              { x: 1.45, y: -7, text: '−∞', tone: 'faint', anchor: 'start' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: '$f(x)=\\dfrac{x^2-2x-3}{x-1}$ — asymptote verticale $x=1$ ($+\\infty$ à gauche, $-\\infty$ à droite) et asymptote oblique $y=x-1$',
          },
        },
        {
          kind: 'signTable',
          caption: 'Signe de f(x) = (x² − 2x − 3)/(x − 1) = (x + 1)(x − 3)/(x − 1) — la double barre marque la valeur exclue x = 1',
          rows: [
            {
              label: 'x',
              cells: [
                { text: '−∞', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '−1', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '1', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '3', tone: 'plain' },
                { text: '', tone: 'plain' },
                { text: '+∞', tone: 'plain' },
              ],
            },
            {
              label: 'x² − 2x − 3',
              cells: [
                { text: '', tone: 'plain' },
                { text: '+', tone: 'pos' },
                { text: '0', tone: 'zero' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
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
                { text: '+', tone: 'pos' },
                { text: '+', tone: 'pos' },
                { text: '', tone: 'plain' },
              ],
            },
            {
              label: 'quotient',
              cells: [
                { text: '', tone: 'plain' },
                { text: '−', tone: 'neg' },
                { text: '0', tone: 'zero' },
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
          kind: 'exemple',
          badge: 'étude complète avec un point vide et une asymptote verticale',
          formula: '$f(x) = \\dfrac{x^2-1}{x^2-3x+2}$. Mène l\'étude complète de f.',
          steps: [
            { tag: 'domaine — factoriser le dénominateur', text: '$x^2-3x+2 = (x-1)(x-2)$ s\'annule en $1$ et en $2$ : domaine $= \\mathbb{R}\\setminus\\{1\\,;2\\}$' },
            {
              tag: 'en x=1 — le numérateur s\'annule aussi',
              text: '$1^2-1=0$ : forme $\\dfrac{0}{0}$. $x^2-1=(x-1)(x+1)$, donc pour $x\\neq 1$ : $f(x)=\\dfrac{(x-1)(x+1)}{(x-1)(x-2)}=\\dfrac{x+1}{x-2}$, et $\\displaystyle\\lim_{x \\to 1} f(x) = \\dfrac{2}{-1} = -2$ → **point vide** $(1\\,;-2)$',
            },
            {
              tag: 'en x=2 — le numérateur ne s\'annule pas',
              text: 'Numérateur $2^2-1=3\\neq 0$ : vraie asymptote verticale. Avec $\\dfrac{x+1}{x-2}$ : $\\displaystyle\\lim_{x \\to 2^-} f(x) = \\dfrac{3}{0^-} = -\\infty$ et $\\displaystyle\\lim_{x \\to 2^+} f(x) = \\dfrac{3}{0^+} = +\\infty$',
            },
            { tag: 'comparaison des degrés — degrés égaux', text: 'asymptote horizontale $y=\\dfrac{1}{1}=1$, donc $\\displaystyle\\lim_{x \\to \\pm\\infty} f(x) = 1$' },
            {
              tag: 'la courbe recoupe-t-elle y=1 ?',
              text: '$\\dfrac{x+1}{x-2} = 1+\\dfrac{3}{x-2}$ (division euclidienne) : le reste $3$ ne s\'annule jamais. Autrement dit, $x+1=x-2$ donnerait $1=-2$, impossible : jamais de recoupement',
            },
          ],
          result: {
            tag: 'synthèse complète',
            text:
              'Domaine $\\mathbb{R}\\setminus\\{1\\,;2\\}$. En $x=1$ : point vide $(1\\,;-2)$, pas d\'asymptote. ' +
              'Asymptote verticale $x=2$ ($-\\infty$ à gauche, $+\\infty$ à droite). Asymptote horizontale ' +
              '$y=1$ en $\\pm\\infty$, jamais recoupée : la courbe est au-dessus pour $x>2$ et en dessous pour $x<2$.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x + 1) / (x - 2), tone: 'accent', xMin: -6, xMax: 1.6 },
              { fn: (x) => (x + 1) / (x - 2), tone: 'accent', xMin: 2.4, xMax: 8 },
            ],
            xMin: -6,
            xMax: 8,
            xTicks: [1, 2],
            fixedYRange: { min: -6, max: 8 },
            verticalAsymptotes: [{ x: 2, label: 'x=2' }],
            horizontalAsymptotes: [{ y: 1, label: 'y=1' }],
            points: [{ x: 1, y: -2, label: '', tone: 'good', style: 'open' }],
            textLabels: [{ x: 0.2, y: -4.3, text: '(1;−2)', tone: 'good', anchor: 'end' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              '$f(x)=\\dfrac{x^2-1}{x^2-3x+2}$ — la courbe de $\\dfrac{x+1}{x-2}$ avec un point vide en ' +
              '$(1\\,;-2)$, une asymptote verticale $x=2$ et une asymptote horizontale $y=1$ jamais traversée',
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
              'La courbe recoupe son asymptote $y=1$ au point $(1\\,;1)$. Elle est au-dessus pour $x>1$ ' +
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
            caption: '$f(x)=\\dfrac{x^2+x}{x^2+1}$ — la courbe croise son asymptote $y=1$ en $(1\\,;1)$, puis s\'en rapproche aux deux extrémités',
          },
        },
        {
          kind: 'atelier',
          tag: 'recoupement-widget',
          label: 'Manipule toi-même — où la courbe recoupe-t-elle son asymptote ?',
          caption:
            'Règle p et q dans (x² + px + q)/(x² + 1) : l\'asymptote reste y = 1, et la courbe la recoupe ' +
            'exactement là où le reste (px + q − 1)/(x² + 1) s\'annule. Avec p = 0, plus aucun recoupement ' +
            '(sauf si q = 1 : la fonction vaut alors 1 partout).',
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
        },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 3 + 1 / (x - 2), tone: 'accent', xMin: -6, xMax: 1.9 },
                { fn: (x) => 3 + 1 / (x - 2), tone: 'accent', xMin: 2.1, xMax: 10 },
              ],
              xMin: -6,
              xMax: 10,
              xTicks: [2],
              fixedYRange: { min: -4, max: 10 },
              verticalAsymptotes: [{ x: 2, label: 'x=2' }],
              horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
              xAxisLabel: 'x',
              yAxisLabel: 'f(x)',
              caption: '$f(x)=3+\\dfrac{1}{x-2}$ — asymptotes $x=2$ et $y=3$',
            },
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 2 * x + 1 + 1 / (x + 1), tone: 'accent', xMin: -5, xMax: -1.1 },
                { fn: (x) => 2 * x + 1 + 1 / (x + 1), tone: 'accent', xMin: -0.92, xMax: 4 },
              ],
              xMin: -5,
              xMax: 4,
              xTicks: [-1],
              fixedYRange: { min: -10, max: 10 },
              verticalAsymptotes: [{ x: -1, label: 'x=−1' }],
              obliqueAsymptotes: [{ a: 2, b: 1, label: 'y=2x+1' }],
              xAxisLabel: 'x',
              yAxisLabel: 'g(x)',
              caption: '$g(x)=2x+1+\\dfrac{1}{x+1}$ — asymptotes $x=-1$ et $y=2x+1$',
            },
          ],
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
        {
          kind: 'methode',
          label: 'Méthode — retrouver une fonction à partir de ses asymptotes et d\'un point',
          items: [
            'Pour $f(x)=\\dfrac{ax+b}{x+d}$ : l\'asymptote verticale $x=-d$ donne $d$ (le dénominateur s\'y annule) ; l\'asymptote horizontale $y=a$ donne $a$ (rapport des coefficients dominants).',
            'Pour $f(x)=ax+b+\\dfrac{c}{x-p}$ : l\'asymptote oblique $y=ax+b$ donne $a$ et $b$ ; l\'asymptote verticale $x=p$ donne $p$.',
            'La dernière inconnue se trouve avec le **point** du graphe : remplace $x$ et $f(x)$ par ses coordonnées et résous l\'équation du premier degré obtenue.',
            'Vérifie : la limite en la valeur exclue doit être infinie (numérateur non nul) et la fonction doit passer par le point.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux asymptotes et un point',
          blocks: [
            { kind: 'para', text: 'Une fonction $f(x)=\\dfrac{ax+b}{x+d}$ a pour asymptotes $x=2$ et $y=3$, et sa courbe passe par $A(0\\,;1)$. Retrouve $f(x)$.' },
            { kind: 'para', text: '**Asymptote verticale.** Le dénominateur s\'annule en $x=2$ : $2+d=0$, donc $d=-2$.' },
            { kind: 'para', text: '**Asymptote horizontale.** En $\\pm\\infty$, $f(x)\\to\\dfrac{a}{1}=a$ : donc $a=3$.' },
            { kind: 'para', text: '**Point.** $f(0)=\\dfrac{b}{-2}=1$, donc $b=-2$ et $f(x)=\\dfrac{3x-2}{x-2}$.' },
            { kind: 'para', text: '**Vérification.** En $x=2$, le numérateur vaut $3\\cdot 2-2=4\\neq 0$ : $\\lim\\limits_{x\\to 2^+}f(x)=+\\infty$, l\'asymptote verticale est bien $x=2$ ; et $f(0)=\\dfrac{-2}{-2}=1$.' },
            { kind: 'para', text: '**Avec une asymptote oblique.** Si $f(x)=ax+b+\\dfrac{c}{x-p}$ a pour asymptotes $y=2x-1$ et $x=1$ et passe par $(2\\,;6)$ : $a=2$, $b=-1$, $p=1$, puis $2\\cdot 2-1+\\dfrac{c}{1}=6$, donc $c=3$ et $f(x)=2x-1+\\dfrac{3}{x-1}$.' },
            {
              kind: 'illustration',
              illustration: {
                kind: 'curvePlot',
                curves: [
                  { fn: (x) => (3 * x - 2) / (x - 2), tone: 'accent', xMax: 1.85 },
                  { fn: (x) => (3 * x - 2) / (x - 2), tone: 'accent', xMin: 2.15 },
                ],
                xMin: -6,
                xMax: 8,
                xTicks: [2],
                fixedYRange: { min: -6, max: 12 },
                verticalAsymptotes: [{ x: 2, label: 'x=2' }],
                horizontalAsymptotes: [{ y: 3, label: 'y=3' }],
                points: [{ x: 0, y: 1, label: 'A', tone: 'good' }],
                xAxisLabel: 'x',
                yAxisLabel: 'f(x)',
                caption: '$f(x)=\\dfrac{3x-2}{x-2}$ : asymptotes $x=2$ et $y=3$, courbe passant par $A(0\\,;1)$',
              },
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Retrouver une fonction à partir de ses asymptotes',
          generatorId: '5gen65',
          chantier: '5e-4h',
          description: [
            'La forme est donnée — (ax + b)/(x + d) ou ax + b + c/(x − p) — avec ses asymptotes et un point du graphe, ou un graphique complet à lire : traduis chaque asymptote en condition, utilise le point pour trouver la dernière inconnue, écris f(x), puis vérifie l’asymptote verticale par une limite.',
          ],
          whereLabel: '5e (4h) → « 65. Retrouver une fonction à partir de ses asymptotes »',
        },
        {
          kind: 'entrainement',
          title: 'Détective d’erreurs : limites',
          generatorId: '5gen67',
          chantier: '5e-4h',
          description: [
            'La résolution d’un élève contient une seule ligne fausse : « ∞/∞ = 1 », « ∞ − ∞ = 0 », signe de 0⁺ ou 0⁻ faux, simplification interdite, √(x²) = x en −∞, degrés mal comparés, asymptote oblique prise pour une horizontale ou limite latérale oubliée. Trouve la ligne, nomme l’erreur, puis corrige la résolution.',
          ],
          whereLabel: '5e (4h) → « 67. Détective d’erreurs : limites »',
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
        '9 thèmes de 35 affirmations chacun (reconnaissance et calcul, opérations et formes, ' +
          'gauche, droite et existence, asymptote oblique, lecture graphique, limites en contexte, ' +
          'étude complète, pièges classiques, transversal) — choisis un thème, réponds vrai ou ' +
          'faux, la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 42. Limites et asymptotes — quiz vrai/faux »',
    },
  },
}
