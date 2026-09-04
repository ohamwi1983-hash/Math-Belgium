import type { ChapterContent } from '../../types'

export const primitivesIntegrales: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 4,
  title: 'Intégrales et primitives',
  slug: 'primitives-integrales',
  lede:
    "Dériver, c'est passer d'une fonction à sa pente. **Intégrer** fait exactement l'inverse : " +
    "reconstruire une fonction à partir de sa dérivée. Ce chapitre construit cette idée pas à " +
    "pas, d'un seul théorème central — le théorème fondamental de l'analyse — jusqu'à ses " +
    "applications concrètes : aires, volumes de révolution, longueurs d'arc et problèmes de cinématique.",

  sections: [
    {
      id: 'primitives',
      number: 1,
      title: 'Calcul de primitives',
      kicker: 'F\'=f ; primitive générale F(x)+C ; substitution ; intégration par parties',
      blocks: [
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Soit f une fonction définie sur un intervalle I. On dit que F est une ' +
              '**primitive** de f sur I si F est dérivable sur I et si F\'(x) = f(x) pour tout ' +
              'x de I. Intégrer, c\'est donc l\'opération **inverse** de dériver.',
          ],
        },
        {
          kind: 'methode',
          label: 'Structure de l\'ensemble des primitives',
          items: [
            'Si F est UNE primitive de f sur I, alors TOUTES les primitives de f sur I sont ' +
              'exactement les fonctions $x \\mapsto F(x)+C$, où C décrit ℝ. Une fonction admet ' +
              'donc soit aucune primitive sur I (si elle n\'y est pas continue), soit une ' +
              '**infinité** — jamais une seule.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => x * x - 2, tone: 'faint' },
              { fn: (x) => x * x, tone: 'accent' },
              { fn: (x) => x * x + 2, tone: 'good' },
              { fn: (x) => -1 + (3 - -1) / 0.01 * (x - 1), tone: 'faint', xMin: 1, xMax: 1.01 },
            ],
            xMin: -2.4,
            xMax: 2.4,
            xTicks: [],
            fixedYRange: { min: -3.5, max: 8.3 },
            points: [],
            textLabels: [
              { x: 2.3, y: 2.3 * 2.3 + 2, text: 'C=2', tone: 'good', anchor: 'end' },
              { x: 2.3, y: 2.3 * 2.3, text: 'C=0', tone: 'accent', anchor: 'end' },
              { x: 2.3, y: 2.3 * 2.3 - 2, text: 'C=−2', tone: 'faint', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Trois primitives de f(x)=2x : x²−2, x² et x²+2 — elles ne diffèrent que par une translation verticale de C',
          },
        },
        {
          kind: 'featureTable',
          caption: 'Primitives usuelles',
          headers: ['f(x)', 'Primitive F(x)', 'Condition'],
          rows: [
            ['xⁿ', 'xⁿ⁺¹/(n+1) + C', 'n ≠ −1'],
            ['1/x', 'ln|x| + C', 'x ≠ 0'],
            ['eˣ', 'eˣ + C', '—'],
            ['eᵏˣ', '(1/k)eᵏˣ + C', 'k ≠ 0'],
            ['aˣ', 'aˣ/ln(a) + C', 'a > 0, a ≠ 1'],
            ['cos(x)', 'sin(x) + C', '—'],
            ['sin(x)', '−cos(x) + C', '—'],
            ['1/(1+x²)', 'arctan(x) + C', '—'],
            ['1/√(1−x²)', 'arcsin(x) + C', 'x ∈ ]−1;1['],
          ],
        },
        {
          kind: 'piege',
          text:
            'La formule $x^n \\to \\dfrac{x^{n+1}}{n+1}$ est **explicitement exclue** pour n = ' +
            '−1 (division par 0). La primitive de 1/x n\'est jamais une puissance de x : c\'est ' +
            'ln|x|. Oublier la valeur absolue est une erreur fréquente — ln(x) seul n\'est ' +
            'défini que pour x > 0, alors que 1/x l\'est aussi pour x < 0.',
        },
        { kind: 'subheading', text: 'Technique de substitution — reconnaître une forme u\'·f(u)' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Si l\'intégrande se présente comme u\'(x)·f(u(x)) — la dérivée d\'une expression ' +
              'composée apparaît EXACTEMENT comme facteur —, alors une primitive est F(u(x)) + ' +
              'C, où F est une primitive de f. Cas particuliers très utiles :',
            '$\\dfrac{u\'}{u} \\to \\ln|u| + C \\qquad u\'e^u \\to e^u + C \\qquad u\'u^n \\to \\dfrac{u^{n+1}}{n+1} + C$',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int 2x \\cdot e^{x^2} dx$ : ici $u(x)=x^2$, donc $u\'(x)=2x$ — qui apparaît ' +
                'EXACTEMENT dans l\'intégrande. C\'est la forme $u\'e^u$, de primitive $e^u$.',
            },
            { kind: 'para', text: '$\\int 2x \\cdot e^{x^2} dx = e^{x^2} + C$' },
          ],
        },
        {
          kind: 'piege',
          text:
            '$\\int x \\cdot e^{x^2} dx \\neq e^{x^2}+C$ : l\'intégrande ne porte que x, pas ' +
            '$2x=u\'(x)$ — il manque le facteur 1/2. La bonne primitive est $\\dfrac{1}{2}e^{x^2}+C$.',
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier',
          text:
            'Une primitive se vérifie en la **dérivant** : si le résultat obtenu ne redonne pas ' +
            'exactement f, la primitive est fausse. C\'est un réflexe systématique, pas ' +
            'seulement un contrôle de fin d\'exercice.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — intégration par parties' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand l\'intégrande est un **produit** de deux fonctions dont aucune substitution ' +
              'simple ne marche, on peut « transférer » la dérivation d\'un facteur vers l\'autre :',
            '$\\int f(x) \\cdot g\'(x) \\, dx = f(x) \\cdot g(x) - \\int f\'(x) \\cdot g(x) \\, dx$',
            'Choisir judicieusement quelle partie du produit dériver (f) et quelle partie ' +
              'primitiver (g\') est l\'étape déterminante : le bon choix simplifie l\'intégrale ' +
              'restante, le mauvais la complique.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration',
          blocks: [
            { kind: 'para', text: '$(f \\cdot g)\'(x) = f(x) \\cdot g\'(x) + f\'(x) \\cdot g(x)$ — dérivée d\'un produit' },
            {
              kind: 'para',
              text:
                '$\\int (f \\cdot g)\'(x)dx = \\int f(x) \\cdot g\'(x)dx + \\int f\'(x) \\cdot g(x)dx$ ' +
                '— primitive de chaque membre',
            },
            {
              kind: 'para',
              text:
                'Or $\\int (f \\cdot g)\'(x)dx = f(x) \\cdot g(x) + C$ directement (une fonction ' +
                'est une primitive de sa propre dérivée) : isoler $\\int f(x) \\cdot g\'(x)dx$ ' +
                'donne la formule.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int x \\cdot e^x dx$ : on pose $f(x)=x$ (donc $f\'(x)=1$, plus simple) et ' +
                '$g\'(x)=e^x$ (donc $g(x)=e^x$) :',
            },
            {
              kind: 'para',
              text: '$\\int x \\cdot e^x dx = x \\cdot e^x - \\int 1 \\cdot e^x dx = x \\cdot e^x - e^x + C = (x-1)e^x + C$',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Le choix inverse — $f(x)=e^x$, $g\'(x)=x$ — n\'est pas faux mathématiquement, mais ' +
            'mène à une intégrale *plus compliquée* ($\\int e^x \\cdot x^2/2 \\, dx$), pas plus ' +
            'simple : dériver la partie qui se « simplifie » en dérivant (ici x → 1) est ' +
            'presque toujours le bon réflexe.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux intégrations par parties successives',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int x^2 \\cdot \\sin(x) dx$ : une première IPP (f=x², g\'=sin(x)) laisse ' +
                'encore un produit $x \\cdot \\cos(x)$ à intégrer — il faut recommencer :',
            },
            {
              kind: 'para',
              text:
                '$\\int x^2 \\cdot \\sin(x) dx = -x^2 \\cos(x) + 2\\int x \\cdot \\cos(x) dx = ' +
                '-x^2\\cos(x) + 2x\\sin(x) + 2\\cos(x) + C$',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Calcul de primitives',
          generatorId: '6gen23',
          description: [
            'Calcule des primitives par lecture directe du tableau, par substitution (forme ' +
              'u\'·f(u)) ou par intégration par parties, avec vérification par dérivation.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 23. Calcul de primitives »',
        },
      ],
    },
    {
      id: 'conditioninitiale',
      number: 2,
      title: 'Quelle primitive ? (condition initiale)',
      kicker: 'isoler une primitive particulière depuis F(x₀)=y₀',
      blocks: [
        {
          kind: 'para',
          text:
            'La primitive générale F(x) + C regroupe une **infinité** de fonctions. Pour en ' +
            'isoler UNE seule — la « primitive particulière » —, il faut une information ' +
            'supplémentaire : une **condition initiale** F(x₀) = y₀.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Calculer la primitive générale F(x) + C (techniques de la section 1), sans jamais oublier C.',
            'Remplacer x par x₀ et poser l\'équation F(x₀) + C = y₀.',
            'Résoudre cette équation du **premier degré** en C — elle admet toujours exactement une solution.',
            'Écrire la primitive particulière obtenue.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: (x) => x * x + 1, tone: 'faint' },
              { fn: (x) => x * x + 5, tone: 'faint' },
              { fn: (x) => x * x + 3, tone: 'accent' },
              { fn: () => 4, tone: 'faint', xMin: 0, xMax: 1 },
              { fn: (x) => 4 - 4 / 0.01 * (x - 1), tone: 'faint', xMin: 1, xMax: 1.01 },
            ],
            xMin: -2.4,
            xMax: 2.4,
            xTicks: [],
            fixedYRange: { min: -2, max: 9 },
            points: [{ x: 1, y: 4, label: '(1;4)', tone: 'bad' }],
            textLabels: [{ x: 2.3, y: 2.3 * 2.3 + 3, text: 'F(x)=x²+3', tone: 'accent', anchor: 'end' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Famille de primitives x²+C ; celle passant par (1;4) correspond à C=3',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'f(x) = 2x, F(0) = 5. Primitive générale : F(x) = x²+C. La condition donne ' +
                'F(0) = 0+C = 5, donc C = 5.',
            },
            { kind: 'para', text: 'F(x) = x² + 5' },
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'f(x) = 1/x (pour x > 0), F(1) = 2. Primitive générale : F(x) = ln(x)+C. Comme ' +
                'ln(1) = 0, la condition donne directement C = 2.',
            },
            { kind: 'para', text: 'F(x) = ln(x) + 2' },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central de cet exercice',
          text:
            'Oublier C dès le premier calcul (le traiter comme s\'il valait toujours 0) rend ' +
            'l\'équation F(x₀) = y₀ impossible à poser correctement. C doit rester ' +
            '**symbolique** jusqu\'à ce que la condition initiale l\'évalue — jamais fixé « provisoirement » à 0.',
        },
        {
          kind: 'astuce',
          label: 'Deux mots, deux sens',
          text:
            'Une **racine** est un zéro d\'un polynôme intermédiaire ; une **solution** résout ' +
            'l\'énoncé complet. Ici, la « solution » de l\'équation en C donne directement ' +
            'l\'expression finale de F — ces deux mots ne sont jamais interchangeables.',
        },
        {
          kind: 'entrainement',
          title: 'Quelle primitive ? (condition initiale)',
          generatorId: '6gen24',
          description: [
            'Calcule la primitive générale, pose et résous l\'équation en C à partir d\'une ' +
              'condition initiale, puis écris la primitive particulière obtenue.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 24. Quelle primitive ? (condition initiale) »',
        },
      ],
    },
    {
      id: 'integralesdefinies',
      number: 3,
      title: 'Intégrales définies, paramètre et valeur moyenne',
      kicker: 'théorème fondamental, propriétés, méthode des trapèzes, valeur moyenne',
      blocks: [
        {
          kind: 'definition',
          label: 'Comment définit-on l\'intégrale, avant même de connaître une primitive ?',
          items: [
            'Soit f continue et positive sur [a;b]. On partage cet intervalle en n ' +
              'sous-intervalles de longueur constante Δx=(b−a)/n. Sur chacun, on note mᵢ la ' +
              'plus petite valeur prise par f, et Mᵢ la plus grande.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 0.15 * x * x + 0.4, tone: 'accent', xMin: -0.5, xMax: 4.3 }],
            xMin: -0.5,
            xMax: 4.6,
            xTicks: [0, 1, 2, 3, 4],
            fixedYRange: { min: -0.5, max: 3.3 },
            shadedRegions: [
              { from: 0, to: 1, upper: () => 0.15 * 0 * 0 + 0.4, tone: 'accent' },
              { from: 1, to: 2, upper: () => 0.15 * 1 * 1 + 0.4, tone: 'accent' },
              { from: 2, to: 3, upper: () => 0.15 * 2 * 2 + 0.4, tone: 'accent' },
              { from: 3, to: 4, upper: () => 0.15 * 3 * 3 + 0.4, tone: 'accent' },
            ],
            textLabels: [
              { x: 0.5, y: -0.15, text: 'x1', tone: 'faint', anchor: 'middle' },
              { x: 1.5, y: -0.15, text: 'x2', tone: 'faint', anchor: 'middle' },
              { x: 2.5, y: -0.15, text: 'x3', tone: 'faint', anchor: 'middle' },
              { x: 3.5, y: -0.15, text: 'x4', tone: 'faint', anchor: 'middle' },
              { x: 4.4, y: 3.1, text: 'y=f(x)', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Rectangles minorants, de hauteur mᵢ : leur aire totale sous-estime l\'aire réelle',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 0.15 * x * x + 0.4, tone: 'accent', xMin: -0.5, xMax: 4.3 }],
            xMin: -0.5,
            xMax: 4.6,
            xTicks: [0, 1, 2, 3, 4],
            fixedYRange: { min: -0.5, max: 3.3 },
            shadedRegions: [
              { from: 0, to: 1, upper: () => 0.15 * 1 * 1 + 0.4, tone: 'good' },
              { from: 1, to: 2, upper: () => 0.15 * 2 * 2 + 0.4, tone: 'good' },
              { from: 2, to: 3, upper: () => 0.15 * 3 * 3 + 0.4, tone: 'good' },
              { from: 3, to: 4, upper: () => 0.15 * 4 * 4 + 0.4, tone: 'good' },
            ],
            textLabels: [
              { x: 0.5, y: -0.15, text: 'x1', tone: 'faint', anchor: 'middle' },
              { x: 1.5, y: -0.15, text: 'x2', tone: 'faint', anchor: 'middle' },
              { x: 2.5, y: -0.15, text: 'x3', tone: 'faint', anchor: 'middle' },
              { x: 3.5, y: -0.15, text: 'x4', tone: 'faint', anchor: 'middle' },
              { x: 4.4, y: 3.1, text: 'y=f(x)', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Rectangles majorants, de hauteur Mᵢ : leur aire totale surestime l\'aire réelle',
          },
        },
        {
          kind: 'methode',
          label: 'Définition — intégrale définie',
          items: [
            'L\'aire A sous la courbe est encadrée par ces deux sommes de rectangles : ' +
              '$\\Delta x \\sum_{i=1}^{n} m_i \\le A \\le \\Delta x \\sum_{i=1}^{n} M_i$.',
            'Lorsque n augmente indéfiniment, ces deux sommes convergent vers une **même ' +
              'limite** (admis) — c\'est cette limite commune que l\'on appelle ' +
              '$\\int_a^b f(x)dx$, l\'**intégrale définie** de f entre a et b. La démarche se ' +
              'généralise à toute fonction f continue, même non positive.',
          ],
        },
        {
          kind: 'definition',
          label: 'Théorème fondamental de l\'analyse',
          items: [
            'Pour f continue sur [a;b] et F une primitive quelconque de f : ' +
              '$\\int_a^b f(x)dx = [F(x)]_a^b = F(b) - F(a)$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — le résultat ne dépend pas du choix de la primitive',
          blocks: [
            { kind: 'para', text: 'Soit G une autre primitive de f : $G(x) = F(x)+C$ (structure des primitives, section 1)' },
            { kind: 'para', text: '$G(b)-G(a) = (F(b)+C) - (F(a)+C)$ — substitution' },
            { kind: 'para', text: '$= F(b)-F(a)$ — C s\'annule toujours' },
            {
              kind: 'para',
              text: 'Peu importe la primitive choisie pour calculer $\\int_a^b f(x)dx$ : le résultat est toujours le même nombre.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Propriétés',
          items: [
            '$\\int_a^a f(x)dx = 0 \\qquad \\int_a^b f(x)dx = -\\int_b^a f(x)dx$',
            '$\\int_a^b (f(x)+g(x))dx = \\int_a^b f(x)dx + \\int_a^b g(x)dx \\qquad \\int_a^b k \\cdot f(x)dx = k \\int_a^b f(x)dx$',
            '**Additivité** : $\\int_a^b f(x)dx = \\int_a^c f(x)dx + \\int_c^b f(x)dx$ pour tout c',
            'L\'intégrale définie est une somme **signée** : son signe suit celui de f sur ' +
              '[a;b], même si a < b. La variable d\'intégration est **muette** — $\\int_a^b ' +
              'f(x)dx$ et $\\int_a^b f(t)dt$ désignent exactement le même nombre. C\'est cette ' +
              'propriété d\'additivité qui justifie le découpage aux racines utilisé pour les ' +
              'aires (section 4).',
          ],
        },
        { kind: 'subheading', text: 'Pour aller plus loin — approcher numériquement une intégrale : la méthode des trapèzes' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand on ne trouve pas de primitive explicite (ou que l\'on ne dispose que de ' +
              'mesures ponctuelles), on peut approcher $\\int_a^b f(x)dx$ en remplaçant chaque ' +
              'rectangle de l\'encadrement par un **trapèze** reliant ($x_{i-1}$;$f(x_{i-1})$) ' +
              'à ($x_i$;$f(x_i)$) :',
            '$\\int_a^b f(x)dx \\approx \\dfrac{\\Delta x}{2}[f(x_0) + f(x_n) + 2(f(x_1)+\\ldots+f(x_{n-1}))]$',
            'Cette approximation est d\'autant plus précise que n (le nombre de sous-intervalles) est grand.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * x, tone: 'accent', xMin: 0, xMax: 4.3 }],
            xMin: -0.4,
            xMax: 4.6,
            xTicks: [0, 1, 2, 3, 4],
            fixedYRange: { min: -1.6, max: 18 },
            shadedRegions: [
              { from: 0, to: 1, upper: (x) => 0 + (1 - 0) * (x - 0), tone: 'accent' },
              { from: 1, to: 2, upper: (x) => 1 + (4 - 1) * (x - 1), tone: 'accent' },
              { from: 2, to: 3, upper: (x) => 4 + (9 - 4) * (x - 2), tone: 'accent' },
              { from: 3, to: 4, upper: (x) => 9 + (16 - 9) * (x - 3), tone: 'accent' },
            ],
            textLabels: [{ x: 4.4, y: 17.5, text: 'y=x²', tone: 'accent', anchor: 'end' }],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Quatre trapèzes approchant l\'aire sous y=x² sur [0;4] : chaque corde passe au-dessus de la courbe convexe, donc l\'approximation surestime',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'Approcher $\\int_0^4 x^2 dx$ par la méthode des trapèzes, avec 4 sous-intervalles (Δx=1) :',
            },
            { kind: 'para', text: '$\\int_0^4 x^2 dx \\approx \\dfrac{1}{2}[0+16+2(1+4+9)] = \\dfrac{1}{2}(16+28) = 22$' },
            {
              kind: 'para',
              text:
                'La valeur exacte (théorème fondamental, une primitive de x² est x³/3) vaut ' +
                '64/3 ≈ 21,33 : l\'approximation par trapèzes (22) surestime légèrement, car la ' +
                'parabole est **concave vers le haut** — chaque trapèze passe donc au-dessus de la courbe.',
            },
          ],
        },
        { kind: 'subheading', text: 'Valeur moyenne d\'une fonction sur un intervalle' },
        {
          kind: 'definition',
          items: ['valeur moyenne de f sur [a;b] = $\\dfrac{1}{b-a}\\int_a^b f(x)dx$'],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pourquoi cette valeur est bien atteinte par f (théorème de la moyenne)',
          blocks: [
            { kind: 'para', text: 'Soient p le minimum et q le maximum de f sur [a;b] : $p \\le f(x) \\le q$ — f continue sur un fermé borné' },
            { kind: 'para', text: '$p(b-a) \\le \\int_a^b f(x)dx \\le q(b-a)$ — encadrement de l\'aire par 2 rectangles' },
            { kind: 'para', text: 'donc $p \\le \\dfrac{1}{b-a}\\int_a^b f(x)dx \\le q$ — division par b−a > 0' },
            {
              kind: 'para',
              text:
                'La valeur moyenne est donc **comprise** entre le minimum et le maximum de f ' +
                'sur [a;b] : par le théorème des valeurs intermédiaires, il existe r ∈ [a;b] ' +
                'tel que f(r) vaut exactement cette valeur moyenne — elle est donc toujours atteinte, pas seulement approchée.',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'accent', xMin: -0.5, xMax: 4.5 },
              { fn: () => 2, tone: 'faint', xMin: 0, xMax: 4 },
            ],
            xMin: -0.5,
            xMax: 4.6,
            xTicks: [4],
            fixedYRange: { min: -0.6, max: 5.2 },
            shadedRegions: [{ from: 0, to: 4, upper: (x) => x, tone: 'accent' }],
            points: [{ x: 4, y: 4, label: '(4;4)', tone: 'accent' }],
            textLabels: [
              { x: 0.2, y: 2.3, text: 'valeur moyenne = 2', tone: 'faint', anchor: 'start' },
              { x: 4.4, y: 4.4, text: 'y=x', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Aire sous y=x sur [0;4] égale à l\'aire du rectangle de hauteur 2 (valeur moyenne)',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'f(x) = x sur [0;4] : l\'intégrale vaut [x²/2]₀⁴ = 8, donc la valeur moyenne ' +
                'vaut 8/(4−0) = 2.',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Confondre la valeur de l\'**intégrale** (8, ci-dessus) avec la **valeur moyenne** ' +
            '(2) — il manque la division par b−a. Ce sont deux nombres différents, jamais interchangeables.',
        },
        { kind: 'subheading', text: 'Retrouver un paramètre depuis une intégrale connue' },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'On cherche m > 0 tel que $\\int_0^m 2x \\, dx = 9$. L\'intégrale vaut [x²]₀ᵐ = m², d\'où l\'équation m² = 9, puis, avec m > 0 :',
            },
            { kind: 'para', text: 'm = 3' },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Intégrales définies, paramètre et valeur moyenne',
          generatorId: '6gen25',
          description: [
            'Applique le théorème fondamental, ses propriétés (additivité, linéarité), la ' +
              'méthode des trapèzes et la valeur moyenne — ou retrouve un paramètre depuis une intégrale connue.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 25. Intégrales définies, paramètre et valeur moyenne »',
        },
      ],
    },
    {
      id: 'aires',
      number: 4,
      title: 'Calcul d\'aires par intégrale',
      kicker: 'découper aux racines, sommer les valeurs absolues ; aire entre deux courbes',
      blocks: [
        {
          kind: 'para',
          text:
            'Une aire est **toujours** une quantité positive ou nulle. L\'intégrale signée ' +
            'coïncide avec l\'aire seulement quand f garde un signe constant sur l\'intervalle considéré.',
        },
        {
          kind: 'methode',
          label: 'Aire sous une courbe',
          items: [
            'Si f ≥ 0 sur [a;b] : aire = $\\int_a^b f(x)dx$.',
            'Si f ≤ 0 sur [a;b] : aire = $-\\int_a^b f(x)dx$.',
            'Si f change de signe : on découpe l\'intervalle aux **racines** de f, puis on ' +
              'somme la valeur absolue de chaque intégrale partielle — jamais une intégrale ' +
              'globale sur tout l\'intervalle, où les parties positives et négatives se compenseraient.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x, tone: 'accent', xMin: -2.4, xMax: 3.4 }],
            xMin: -2.6,
            xMax: 3.6,
            xTicks: [],
            fixedYRange: { min: -2.6, max: 3.6 },
            shadedRegions: [
              { from: -2, to: 0, upper: () => 0, lower: (x) => x, tone: 'bad' },
              { from: 0, to: 3, upper: (x) => x, tone: 'accent' },
            ],
            points: [
              { x: -2, y: -2, label: '(−2;−2)', tone: 'bad' },
              { x: 3, y: 3, label: '(3;3)', tone: 'accent' },
            ],
            textLabels: [
              { x: -1.33, y: -0.67, text: 'aire=2', tone: 'bad', anchor: 'middle' },
              { x: 2, y: 1, text: 'aire=4,5', tone: 'accent', anchor: 'middle' },
              { x: 3.5, y: 3.2, text: 'y=x', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'y=x sur [−2;3] : aire rouge = 2 (sous l\'axe), aire orange = 4,5 (au-dessus) — total 6,5',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'f(x) = x sur [−2;3]. Sur [−2;0], f ≤ 0 : aire = $-\\int_{-2}^{0} x \\, dx = ' +
                '-(0-2) = 2$. Sur [0;3], f ≥ 0 : aire = $\\int_0^3 x \\, dx = 4{,}5$.',
            },
            { kind: 'para', text: 'Aire totale = 2 + 4,5 = 6,5' },
          ],
        },
        {
          kind: 'methode',
          label: 'Aire entre deux courbes',
          items: [
            'Si f(x) ≥ g(x) sur [a;b] : aire = $\\int_a^b (f(x)-g(x))dx$.',
            'Si les courbes se croisent, les **racines de f−g** (leurs points d\'intersection) ' +
              'deviennent les bornes des sous-intervalles à traiter séparément, exactement ' +
              'comme pour une aire sous une seule courbe.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => x * x, tone: 'accent', xMin: -2.6, xMax: 2.6 }],
            xMin: -2.8,
            xMax: 2.8,
            xTicks: [],
            fixedYRange: { min: -1, max: 5.5 },
            shadedRegions: [{ from: -2, to: 2, upper: () => 4, lower: (x) => x * x, tone: 'accent' }],
            points: [
              { x: -2, y: 4, label: '(−2;4)', tone: 'bad' },
              { x: 2, y: 4, label: '(2;4)', tone: 'bad' },
            ],
            textLabels: [
              { x: -2.7, y: 4.3, text: 'y=4', tone: 'faint', anchor: 'start' },
              { x: -2.7, y: 5, text: 'y=x²', tone: 'accent', anchor: 'start' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Aire entre y=x² et y=4, entre leurs points d\'intersection (−2;4) et (2;4)',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'f(x) = x², g(x) = 4. Intersections : x²=4 ⟹ x = ±2, et g ≥ f entre les deux.',
            },
            { kind: 'para', text: '$\\text{aire} = \\int_{-2}^{2} (4-x^2)dx = [4x-\\dfrac{x^3}{3}]_{-2}^{2} = \\dfrac{32}{3}$' },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            'Calculer directement $\\int_a^b f(x)dx$ (ou $\\int(f-g)$) sur l\'intervalle ENTIER ' +
            'quand le signe change (ou que les courbes se croisent) donne une valeur trop ' +
            'petite : les parties positives et négatives se compensent au lieu de s\'additionner en valeur absolue.',
        },
        {
          kind: 'astuce',
          label: 'Avant de calculer',
          text:
            'Esquisser rapidement le signe de f (ou de f−g) sur chaque sous-intervalle ' +
            '**avant** de poser l\'intégrale — décider où placer les valeurs absolues avant de calculer, jamais après coup.',
        },
        { kind: 'subheading', text: 'Aire délimitée par plus de deux courbes' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Une région peut être bordée par **plus de deux** courbes — ou, ce qui revient au ' +
              'même, la courbe qui joue le rôle de « majorant » peut **changer** au milieu de ' +
              'l\'intervalle. On repère alors les **points de bascule** (où deux des courbes ' +
              'bordantes se croisent), on découpe l\'intervalle à cet endroit, et on choisit sur ' +
              'chaque morceau la bonne paire majorant/minorant — exactement comme on découpait ' +
              'aux racines pour une aire signée.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'accent', xMin: 0, xMax: 3 },
              { fn: (x) => 6 - x, tone: 'good', xMin: 3, xMax: 6 },
            ],
            xMin: -0.6,
            xMax: 6.6,
            xTicks: [],
            fixedYRange: { min: -0.7, max: 4.2 },
            shadedRegions: [{ from: 0, to: 6, upper: (x) => (x <= 3 ? x : 6 - x), tone: 'accent' }],
            axisOfSymmetry: { x: 3, label: 'bascule en x=3' },
            points: [
              { x: 3, y: 3, label: '(3;3)', tone: 'bad' },
              { x: 6, y: 0, label: '(6;0)', tone: 'accent' },
            ],
            textLabels: [
              { x: 1.2, y: 1.9, text: 'y=x', tone: 'accent', anchor: 'middle' },
              { x: 4.8, y: 1.9, text: 'y=6−x', tone: 'good', anchor: 'middle' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Région bornée par y=x, y=6−x et y=0 : la fonction majorante bascule en x=3, il faut deux intégrales',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                'Région bordée par y=x, y=6−x et y=0 (l\'axe des abscisses). Les deux droites se ' +
                'croisent en (3;3) : c\'est le point de bascule. Sur [0;3], le majorant est y=x ; ' +
                'sur [3;6], c\'est y=6−x ; le minorant est y=0 sur tout l\'intervalle.',
            },
            {
              kind: 'para',
              text:
                '$\\text{aire} = \\int_0^3 x \\, dx + \\int_3^6 (6-x)dx = [\\dfrac{x^2}{2}]_0^3 + ' +
                '[6x-\\dfrac{x^2}{2}]_3^6 = 4{,}5 + 4{,}5 = 9$',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège spécifique à ce cas',
          text:
            'Ne découper qu\'aux zéros de f (comme pour une aire signée) ne suffit pas ici : il ' +
            'faut **aussi** découper là où la courbe majorante change, même si aucune des deux ' +
            'courbes ne s\'annule à cet endroit.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — retrouver l\'aire d\'un disque' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — l\'aire d\'un disque de rayon r vaut πr²',
          blocks: [
            {
              kind: 'para',
              text:
                'Le quart de disque (1er quadrant) est l\'aire sous $y=\\sqrt{r^2-x^2}$ sur ' +
                '[0;r] (cercle $x^2+y^2=r^2$, y≥0).',
            },
            { kind: 'para', text: '$A = 4\\int_0^r \\sqrt{r^2-x^2} \\, dx$ — 4 quadrants identiques par symétrie' },
            {
              kind: 'para',
              text:
                'Substitution $x=r\\sin(\\theta)$, $dx=r\\cos(\\theta)d\\theta$, θ: 0→π/2 — ' +
                'élimine la racine : $\\sqrt{r^2-r^2\\sin^2(\\theta)} = r\\cos(\\theta)$',
            },
            {
              kind: 'para',
              text:
                '$A = 4r^2\\int_0^{\\pi/2} \\cos^2(\\theta)d\\theta = 4r^2\\int_0^{\\pi/2} ' +
                '\\dfrac{1+\\cos(2\\theta)}{2}d\\theta$ — identité $\\cos^2\\theta=(1+\\cos2\\theta)/2$',
            },
            {
              kind: 'para',
              text:
                '$A = 4r^2 \\cdot [\\theta/2+\\sin(2\\theta)/4]_0^{\\pi/2} = 4r^2 \\cdot \\pi/4 = ' +
                '\\pi r^2$ — la technique de substitution retrouve ainsi une formule connue ' +
                'depuis longtemps, mais jamais démontrée avant ce chapitre.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Calcul d\'aires par intégrale',
          generatorId: '6gen26',
          description: [
            'Calcule l\'aire sous une courbe (en découpant aux racines si le signe change) ou ' +
              'entre deux courbes (en découpant à leurs intersections).',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 26. Calcul d\'aires par intégrale »',
        },
      ],
    },
    {
      id: 'volumes',
      number: 5,
      title: 'Volumes de révolution',
      kicker: 'méthode des disques (une courbe) et des rondelles (deux courbes)',
      blocks: [
        {
          kind: 'para',
          text:
            'Faire tourner une région du plan autour de l\'axe des abscisses engendre un ' +
            'solide en trois dimensions. Deux méthodes, selon que la région est bordée par une ' +
            'seule courbe ou par deux.',
        },
        {
          kind: 'astuce',
          label: 'Le principe général derrière la formule des disques',
          text:
            'Plus généralement, pour un solide compris entre les plans z=a et z=b, si S(t) ' +
            'désigne l\'aire de la section du solide par le plan z=t, son volume vaut ' +
            '$V=\\int_a^b S(t)dt$ — le volume est la « somme » (l\'intégrale) des aires des ' +
            'tranches infiniment fines qui le composent. Pour un solide de révolution, chaque ' +
            'tranche est un disque d\'aire $S(x)=\\pi[f(x)]^2$ : c\'est exactement la formule ci-dessous.',
        },
        {
          kind: 'definition',
          label: 'Méthode des disques',
          items: [
            'Rotation, autour de l\'axe des abscisses, de la région sous f sur [a;b] (avec f ≥ 0) :',
            '$V = \\pi \\int_a^b [f(x)]^2 dx$',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — d\'où vient le carré',
          blocks: [
            { kind: 'para', text: 'Une tranche verticale d\'épaisseur dx, une fois tournée, forme un disque de rayon f(x) — définition de la rotation' },
            { kind: 'para', text: 'Aire de ce disque = $\\pi[f(x)]^2$ — aire d\'un disque = πr²' },
            { kind: 'para', text: 'Volume de la tranche ≈ $\\pi[f(x)]^2 dx$ — volume = aire de base × épaisseur' },
            { kind: 'para', text: 'Sommer (intégrer) ces tranches sur [a;b] donne $V = \\pi\\int_a^b [f(x)]^2 dx$.' },
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: 'Rotation de f(x) = x sur [0;3] autour de l\'axe des abscisses :' },
            { kind: 'para', text: '$V = \\pi \\int_0^3 x^2 dx = \\pi [\\dfrac{x^3}{3}]_0^3 = 9\\pi$' },
          ],
        },
        {
          kind: 'definition',
          label: 'Méthode des rondelles',
          items: [
            'Rotation de la région comprise entre f (extérieure) et g (intérieure), avec ' +
              'f(x) ≥ g(x) ≥ 0 sur [a;b] :',
            '$V = \\pi \\int_a^b ([f(x)]^2 - [g(x)]^2) dx$',
            'On soustrait l\'aire du disque **intérieur** (creusé par g) de celle du disque **extérieur** (bordé par f).',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'accent', xMin: -0.6, xMax: 3.5 },
              { fn: () => 1.5, tone: 'faint', xMin: 3, xMax: 3.01 },
            ],
            xMin: -0.6,
            xMax: 3.7,
            xTicks: [],
            fixedYRange: { min: -0.8, max: 3.7 },
            shadedRegions: [{ from: 0, to: 3, upper: (x) => x, tone: 'accent' }],
            points: [{ x: 3, y: 3, label: 'rayon=f(3)=3', tone: 'accent' }],
            textLabels: [
              { x: 1.3, y: -0.5, text: 'axe de rotation', tone: 'faint', anchor: 'middle' },
              { x: 3.6, y: 3.5, text: 'y=x', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Région sous y=x sur [0;3] : sa rotation autour de l\'axe des abscisses donne un cône de rayon 3',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'accent', xMin: -0.6, xMax: 3.5 },
              { fn: () => 0, tone: 'faint', xMin: 0, xMax: 0.01 },
            ],
            xMin: -0.6,
            xMax: 3.7,
            xTicks: [],
            fixedYRange: { min: -0.8, max: 4.2 },
            shadedRegions: [{ from: 0, to: 3, upper: () => 3, lower: (x) => x, tone: 'accent' }],
            points: [{ x: 3, y: 3, label: 'épaisseur nulle en x=3', tone: 'bad' }],
            textLabels: [
              { x: 0.15, y: 1.5, text: 'épaisseur max', tone: 'faint', anchor: 'start' },
              { x: -0.5, y: 3.3, text: 'y=3', tone: 'faint', anchor: 'start' },
              { x: 3.6, y: 3.5, text: 'y=x', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Région entre y=3 et y=x sur [0;3] : rotation en rondelle, épaisseur maximale en x=0, nulle en x=3',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            { kind: 'para', text: 'f(x) = 3, g(x) = x sur [0;3] :' },
            { kind: 'para', text: '$V = \\pi \\int_0^3 (9-x^2)dx = \\pi [9x-\\dfrac{x^3}{3}]_0^3 = \\pi(27-9) = 18\\pi$' },
          ],
        },
        { kind: 'subheading', text: 'À quoi ressemble vraiment le solide ?' },
        {
          kind: 'illustrationGroup',
          items: [
            {
              kind: 'solidRevolution',
              variant: 'cone',
              outerRadius: 3,
              startLabel: 'x=0',
              endLabel: 'x=3',
              midLabel: 'disque, rayon f(x)',
              caption:
                'Le solide engendré par la rotation de y=x sur [0;3] (méthode des disques, ci-dessus) : un cône. Chaque tranche verticale devient un disque de rayon f(x).',
            },
            {
              kind: 'solidRevolution',
              variant: 'washer',
              outerRadius: 3,
              startLabel: 'x=0',
              endLabel: 'x=3',
              midLabel: 'rondelle',
              caption:
                'Le solide engendré par la région entre y=3 et y=x sur [0;3] (méthode des rondelles) : plein en x=0, paroi qui s\'amincit jusqu\'à une épaisseur nulle en x=3.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            '$V = \\pi\\int[f(x)-g(x)]^2 dx$ est **faux** : il faut soustraire les CARRÉS ' +
            '($[f]^2-[g]^2$), pas élever la DIFFÉRENCE au carré — ces deux expressions ne sont pas égales en général.',
        },
        {
          kind: 'astuce',
          label: 'Avant de poser la formule',
          text:
            'Identifier d\'abord : « disque plein » (une seule courbe, jusqu\'à l\'axe) ou « ' +
            'rondelle » (deux courbes, un trou) ? Le carré (ou la différence de carrés) qui en résulte se lit ensuite directement.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — retrouver le volume d\'un tronc de cône' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — tronc de cône de hauteur h, petit rayon a, grand rayon b',
          blocks: [
            {
              kind: 'para',
              text:
                'C\'est le solide engendré par la rotation du trapèze de sommets (0;0), (0;a), ' +
                '(h;b), (h;0) — trapèze reliant les 2 rayons.',
            },
            { kind: 'para', text: 'Droite reliant (0;a) à (h;b) : $y = \\dfrac{b-a}{h}x + a$ — pente = Δy/Δx' },
            { kind: 'para', text: '$V = \\pi\\int_0^h (\\dfrac{b-a}{h}x + a)^2 dx$ — méthode des disques (ci-dessus)' },
            {
              kind: 'para',
              text:
                'Après développement et intégration terme à terme (calcul mécanique, mêmes ' +
                'techniques que la section 1), on retrouve exactement la formule connue depuis ' +
                'la géométrie de l\'espace : $V = \\dfrac{\\pi h}{3}(a^2+ab+b^2)$.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Volumes de révolution',
          generatorId: '6gen27',
          description: [
            'Calcule un volume de révolution par la méthode des disques (une courbe) ou des ' +
              'rondelles (deux courbes), en identifiant d\'abord le bon modèle.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 27. Volumes de révolution »',
        },
      ],
    },
    {
      id: 'longueurarc',
      number: 6,
      title: 'Longueur d\'un arc de courbe',
      kicker: 'L = ∫√(1+[f\'(x)]²)dx',
      blocks: [
        {
          kind: 'definition',
          label: 'Formule',
          items: [
            'Longueur de l\'arc de la courbe y=f(x), entre x=a et x=b : $L = \\int_a^b \\sqrt{1+[f\'(x)]^2} \\, dx$.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            compact: true,
            curves: [
              { fn: Math.sqrt, tone: 'accent', xMin: 0.3, xMax: 3.5 },
              { fn: () => Math.sqrt(1.5), tone: 'faint', xMin: 1.5, xMax: 1.9 },
              { fn: (x) => Math.sqrt(1.5) + (Math.sqrt(1.9) - Math.sqrt(1.5)) / 0.01 * (x - 1.9), tone: 'faint', xMin: 1.9, xMax: 1.91 },
              { fn: (x) => Math.sqrt(1.5) + ((Math.sqrt(1.9) - Math.sqrt(1.5)) / (1.9 - 1.5)) * (x - 1.5), tone: 'good', xMin: 1.5, xMax: 1.9 },
            ],
            xMin: -0.3,
            xMax: 4,
            xTicks: [],
            fixedYRange: { min: -0.3, max: 2.3 },
            points: [
              { x: 1.5, y: Math.sqrt(1.5), label: '', tone: 'accent' },
              { x: 1.9, y: Math.sqrt(1.9), label: '', tone: 'accent' },
            ],
            textLabels: [
              { x: 1.7, y: Math.sqrt(1.5) - 0.15, text: 'dx', tone: 'faint', anchor: 'middle' },
              { x: 1.95, y: (Math.sqrt(1.5) + Math.sqrt(1.9)) / 2, text: 'dy', tone: 'faint', anchor: 'start' },
              { x: 1.55, y: (Math.sqrt(1.5) + Math.sqrt(1.9)) / 2 + 0.15, text: 'ds', tone: 'good', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption:
              'Sur un petit intervalle, la courbe se confond avec l\'hypoténuse ds d\'un ' +
              'triangle rectangle de côtés dx et dy',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — d\'où vient la racine',
          blocks: [
            {
              kind: 'para',
              text:
                'Sur un petit intervalle dx, la courbe est presque un segment reliant ' +
                '(x;f(x)) à (x+dx;f(x)+dy) — approximation locale.',
            },
            { kind: 'para', text: '$ds = \\sqrt{dx^2+dy^2}$ — théorème de Pythagore' },
            {
              kind: 'para',
              text: '$= \\sqrt{1+(dy/dx)^2} \\, dx = \\sqrt{1+[f\'(x)]^2} \\, dx$ — mise en évidence de dx',
            },
            { kind: 'para', text: 'Sommer (intégrer) ces longueurs infinitésimales ds sur [a;b] donne la formule de L.' },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — expression affine sous la racine',
          blocks: [
            {
              kind: 'para',
              text:
                '$f(x) = \\dfrac{2}{3}x^{3/2}$ sur [0;3] : $f\'(x) = \\sqrt{x}$, donc ' +
                '$1+[f\'(x)]^2 = 1+x$. Par substitution u=1+x (u : 1 → 4) :',
            },
            {
              kind: 'para',
              text: '$L = \\int_0^3 \\sqrt{1+x} \\, dx = [\\dfrac{2}{3}(1+x)^{3/2}]_0^3 = \\dfrac{2}{3}(8-1) = \\dfrac{14}{3}$',
            },
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (Math.exp(x) + Math.exp(-x)) / 2, tone: 'faint' },
              { fn: (x) => (Math.exp(x) + Math.exp(-x)) / 2, tone: 'accent', xMin: 0, xMax: 1.5 },
            ],
            xMin: -2.5,
            xMax: 2.5,
            xTicks: [],
            fixedYRange: { min: -0.5, max: 4 },
            points: [
              { x: 0, y: 1, label: '(0;1)', tone: 'accent' },
              { x: 1.5, y: (Math.exp(1.5) + Math.exp(-1.5)) / 2, label: '(1,5;2,35)', tone: 'bad' },
            ],
            textLabels: [
              { x: 2.4, y: 3.7, text: 'y=ch(x)', tone: 'accent', anchor: 'end' },
              { x: 0.3, y: 1.9, text: 'L=sh(1,5)≈2,13', tone: 'faint', anchor: 'end' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            caption: 'Arc de y=ch(x) entre x=0 et x=1,5, de longueur sh(1,5)≈2,13',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — un carré parfait sous la racine',
          blocks: [
            {
              kind: 'para',
              text:
                'f(x) = ch(x) sur [0;a] : f\'(x) = sh(x), et l\'identité $\\text{ch}^2-\\text{sh}^2=1$ ' +
                '(chapitre 3) donne $1+\\text{sh}^2(x) = \\text{ch}^2(x)$ — un carré parfait. ' +
                'Comme ch(x) > 0 toujours, la racine se simplifie directement :',
            },
            { kind: 'para', text: '$L = \\int_0^a \\text{ch}(x) dx = [\\text{sh}(x)]_0^a = \\text{sh}(a)$' },
          ],
        },
        {
          kind: 'piege',
          text:
            'Oublier le « 1+ » ou la racine carrée elle-même sous l\'intégrale — les deux sont ' +
            'TOUJOURS présents, quelle que soit la fonction f. Le signe de f\'(x) n\'a lui ' +
            'aucune incidence : il est élevé au carré.',
        },
        {
          kind: 'astuce',
          label: 'Repérer un carré parfait avant d\'intégrer',
          text:
            'Certaines fonctions sont construites (ou apparaissent naturellement, comme ch) ' +
            'pour que $1+[f\'(x)]^2$ soit un carré parfait. Le repérer AVANT d\'intégrer évite ' +
            'une intégrale bien plus compliquée sous une racine irréductible.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — vérifier la formule sur un cas connu' },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la circonférence d\'un cercle de rayon r vaut 2πr',
          blocks: [
            {
              kind: 'para',
              text:
                'Demi-cercle supérieur : $f(x)=\\sqrt{r^2-x^2}$, $f\'(x)=\\dfrac{-x}{\\sqrt{r^2-x^2}}$ — dérivée de la racine.',
            },
            {
              kind: 'para',
              text: '$1+[f\'(x)]^2 = 1+\\dfrac{x^2}{r^2-x^2} = \\dfrac{r^2}{r^2-x^2}$ — mise au même dénominateur',
            },
            {
              kind: 'para',
              text: '$L = \\int_{-r}^{r} \\dfrac{r}{\\sqrt{r^2-x^2}} dx = r \\cdot [\\arcsin(x/r)]_{-r}^{r}$ — primitive usuelle (section 1)',
            },
            {
              kind: 'para',
              text:
                '$L = r \\cdot (\\pi/2-(-\\pi/2)) = \\pi r$ pour le demi-cercle : la ' +
                'circonférence complète vaut donc $2 \\cdot \\pi r = 2\\pi r$ — exactement la ' +
                'formule connue depuis la géométrie plane, retrouvée ici par le calcul intégral.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Longueur d\'un arc de courbe',
          generatorId: '6gen28',
          description: [
            'Calcule la longueur d\'un arc de courbe par la formule ∫√(1+[f\'(x)]²)dx, en ' +
              'repérant si besoin un carré parfait sous la racine.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 28. Longueur d\'un arc de courbe »',
        },
      ],
    },
    {
      id: 'problemes',
      number: 7,
      title: 'Intégrales et primitives : problèmes',
      kicker: 'cinématique (a→v→x), économie, trapèzes, volumes par soustraction',
      blocks: [
        {
          kind: 'para',
          text:
            'Un problème contextualisé (cinématique, économie, géométrie...) réutilise ' +
            '**exactement** les mêmes techniques de primitivation que les exercices « ' +
            'abstraits » — seule l\'interprétation du résultat change.',
        },
        {
          kind: 'definition',
          label: 'Cinématique — accélération, vitesse, position',
          items: [
            'Si a(t) est l\'accélération d\'un mobile, alors v(t) (la vitesse) est une ' +
              'primitive de a, fixée par une condition v(t₀). De même, x(t) (la position) est ' +
              'une primitive de v, fixée par une condition x(t₀) — **indépendante** de la précédente.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => 2 * t + 3, tone: 'accent', xMin: -0.3, xMax: 3.2 }],
            xMin: -0.3,
            xMax: 3.3,
            xTicks: [],
            fixedYRange: { min: -0.5, max: 10 },
            shadedRegions: [{ from: 0, to: 2, upper: (t) => 2 * t + 3, tone: 'accent' }],
            points: [
              { x: 0, y: 3, label: '(0;3)', tone: 'accent' },
              { x: 2, y: 7, label: '(2;7)', tone: 'accent' },
            ],
            textLabels: [
              { x: 1, y: 2.5, text: 'Δx=10', tone: 'faint', anchor: 'middle' },
              { x: 3.2, y: 9.5, text: 'v(t)=2t+3', tone: 'accent', anchor: 'end' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'v(t)',
            caption: 'L\'aire sous v(t), entre deux instants, donne directement la distance parcourue : ∫v(t)dt = Δx = 10',
          },
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'a(t) = 2 (constante), v(0) = 3. Primitive générale : v(t) = 2t+C, donc v(0) = C = 3 :',
            },
            { kind: 'para', text: 'v(t) = 2t + 3' },
            {
              kind: 'para',
              text: 'Avec x(0) = 0 : primitive générale x(t) = t²+3t+C\', donc x(0) = C\' = 0 :',
            },
            { kind: 'para', text: 'x(t) = t² + 3t' },
          ],
        },
        {
          kind: 'piege',
          text:
            'Réutiliser la **même** constante pour v(t) et x(t) : chaque intégration introduit ' +
            'sa PROPRE constante, déterminée par SA PROPRE condition initiale — jamais partagée entre les deux étapes.',
        },
        {
          kind: 'methode',
          label: 'Autres contextes classiques',
          items: [
            '**Économie** — à partir d\'un coût marginal f(q), l\'augmentation de coût total ' +
              'entre q₁ et q₂ vaut $C(q_2)-C(q_1) = \\int_{q_1}^{q_2} f(q)dq$ (théorème ' +
              'fondamental, section 3).',
            '**Méthode des trapèzes** — pour estimer une intégrale à partir de mesures ' +
              'discrètes, quand aucune formule f(x) explicite n\'est disponible.',
            '**Volume « par soustraction »** — volume total moins volume de la cavité retirée, jamais l\'inverse.',
          ],
        },
        {
          kind: 'astuce',
          label: 'Même boîte à outils, contextes différents',
          text:
            'Face à un problème contextualisé, identifier d\'abord QUELLE technique du chapitre ' +
            's\'applique (primitive + condition initiale, aire, volume, valeur moyenne...) — le ' +
            'contexte ne change jamais la technique, seulement le sens du résultat final.',
        },
        {
          kind: 'entrainement',
          title: 'Intégrales et primitives : problèmes',
          generatorId: '6gen29',
          description: [
            'Résous un problème contextualisé (cinématique, économie, volume par ' +
              'soustraction) en identifiant la technique du chapitre qui s\'applique.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 29. Intégrales et primitives : problèmes »',
        },
      ],
    },
  ],

  recap: {
    table: {
      headers: ['Notion', 'Formule / méthode'],
      rows: [
        ['Primitive générale', 'F(x) + C, C ∈ ℝ'],
        ['Condition initiale', 'résoudre F(x₀) + C = y₀ en C'],
        ['Théorème fondamental', '∫ₐᵇf(x)dx = F(b)−F(a)'],
        ['Valeur moyenne', '(1/(b−a))∫ₐᵇf(x)dx'],
        ['Aire (une courbe)', 'découper aux racines, sommer les valeurs absolues'],
        ['Aire (deux courbes)', '∫ₐᵇ(f(x)−g(x))dx, f ≥ g'],
        ['Volume — disques', 'π∫ₐᵇ[f(x)]²dx'],
        ['Volume — rondelles', 'π∫ₐᵇ([f(x)]²−[g(x)]²)dx'],
        ['Longueur d\'arc', '∫ₐᵇ√(1+[f\'(x)]²)dx'],
        ['Cinématique', 'a → v → x, une constante distincte à chaque étape'],
      ],
    },
    forward:
      'Un seul théorème — $\\int_a^b f(x)dx = F(b)-F(a)$ — porte toutes les applications de ce ' +
      'chapitre : aires, volumes, longueurs, valeur moyenne, cinématique. Maîtriser le calcul ' +
      'de primitives (section 1) est donc le socle sur lequel repose tout le reste.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai/faux : réviser tout le chapitre',
      generatorId: '6gen67',
      description: [
        'Choisis un thème et teste-toi sur tout le chapitre — affirmations pré-écrites, une ' +
          'seule tentative par question, justification toujours révélée.',
      ],
      chantier: '6e-6h',
      whereLabel: '6e (6h) → « 67. Quiz vrai/faux — Intégrales et primitives »',
    },
  },
}
