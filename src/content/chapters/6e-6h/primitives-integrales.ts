import type { ChapterContent } from '../../types'

export const primitivesIntegrales: ChapterContent = {
  level: '6e (6h)',
  levelSlug: '6e-6h',
  chapterNumber: 4,
  title: 'Intégrales et primitives',
  slug: 'primitives-integrales',
  lede:
    "Dériver, c'est passer d'une fonction à sa pente. **Intégrer**, c'est littéralement " +
    "l'inverse : tu repars de la pente pour retrouver la fonction de départ. Ce chapitre " +
    "construit cette idée pas à pas, à partir d'un seul théorème central — le théorème " +
    "fondamental de l'analyse — puis tu l'utilises partout : aires, volumes de révolution, " +
    "longueurs d'arc, problèmes de cinématique.",

  sections: [
    {
      id: 'primitives',
      number: 1,
      title: 'Calcul de primitives',
      kicker: 'F\'=f ; primitive générale F(x)+C ; substitution ; intégration par parties',
      blocks: [
        { kind: 'video', title: 'Calcul de primitives (1/2) : famille et tableau', youtubeId: '_g-hpY4PFSk' },
        { kind: 'video', title: 'Calcul de primitives (2/2) : substitution et intégration par parties', youtubeId: 'L2k06qFYtc8' },
        {
          kind: 'intuition',
          label: 'Rembobiner la vidéo',
          text:
            "Imagine une vidéo qui filme la pente d'une courbe à chaque instant — sa dérivée, " +
            "en direct. **Trouver une primitive, c'est rembobiner cette vidéo** : tu connais " +
            'la pente à chaque instant, et tu veux retrouver la courbe de départ, celle qui ' +
            "produit exactement cette pente. C'est tout le programme de ce chapitre.",
        },
        {
          kind: 'definition',
          label: 'Définition',
          items: [
            'Soit f une fonction définie sur un intervalle I. F est une **primitive** de f sur ' +
              'I si F est dérivable sur I et si F\'(x) = f(x) pour tout x de I. Intégrer, c\'est ' +
              'donc l\'opération **inverse** de dériver.',
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi toute une famille, et pas une seule primitive ?',
          text:
            'Prends une courbe, puis fais-la glisser verticalement, vers le haut ou vers le ' +
            'bas : sa pente, en chaque point, ne change **jamais** ! Toutes ces courbes ' +
            'parallèles ont donc exactement la même dérivée. Le +C, c\'est juste ce glissement ' +
            'vertical : il ne change jamais la forme de la courbe, seulement sa hauteur.',
        },
        {
          kind: 'methode',
          label: 'Structure de l\'ensemble des primitives',
          items: [
            'Si F est UNE primitive de f sur I, alors TOUTES les primitives de f sur I sont ' +
              'exactement les fonctions $x \\mapsto F(x)+C$, où C décrit ℝ. Une fonction qui ' +
              'admet une primitive en admet donc une **infinité** — jamais une seule !',
            'Toute fonction **continue** sur un intervalle y admet des primitives (admis). C\'est ' +
              'le cas de toutes les fonctions de ce chapitre, sur leur domaine.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
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
          kind: 'atelier',
          tag: 'famille-primitives-widget',
          label: 'Manipule toi-même — fais glisser C',
          caption:
            'Choisis f et fais glisser C : la courbe se déplace verticalement, mais la ' +
            'tangente au point marqué garde toujours la même pente, celle donnée par f. ' +
            'Avec f(x) = 1/x, chaque branche de ln|x| a sa propre constante (C₁ et C₂) : ℝ₀ ' +
            'n\'est pas un intervalle. Coche « Afficher f » pour voir f en pointillés.',
        },
        {
          kind: 'definition',
          label: 'Notation — intégrale indéfinie',
          items: [
            'L\'ensemble de toutes les primitives de f sur I s\'appelle l\'**intégrale ' +
              'indéfinie** de f sur I, notée $\\int f(x)dx$ : $\\int f(x)dx = ' +
              'F(x)+C$ (C ∈ ℝ), où F est une primitive quelconque de f.',
            'Ce symbole, écrit **sans bornes**, désigne donc toute une **famille de fonctions** ' +
              '— à ne pas confondre avec $\\int_a^b f(x)dx$, qui désigne un **nombre** (tu le ' +
              'découvres à la section 3).',
          ],
        },
        {
          kind: 'historique',
          titre: 'La querelle la plus célèbre de l\'histoire des maths',
          text:
            "À la fin du 17e siècle, deux savants inventent indépendamment le même outil : " +
            "l'Anglais **Isaac Newton**, vers 1666, qui l'appelle le calcul des « fluxions » ; " +
            "et l'Allemand **Gottfried Wilhelm Leibniz**, vers 1675, qui invente la notation " +
            'que tu utilises aujourd\'hui — le symbole $\\int$ (un S allongé, pour « somme ») ' +
            'et le $dx$. Les deux hommes ne communiquent presque jamais leurs travaux, et ' +
            'quand chacun publie les siens, une querelle de priorité éclate : qui a vraiment ' +
            "inventé le calcul intégral en premier ? Le débat déchire les mathématiciens " +
            'européens pendant des décennies — les Anglais défendant Newton, les continentaux ' +
            'Leibniz — et retarde même les progrès britanniques en analyse, par fierté ' +
            "nationale, pendant près d'un siècle. Aujourd'hui, les historiens s'accordent : " +
            'les deux l\'ont bien découvert indépendamment, et c\'est la notation de Leibniz, ' +
            'plus pratique, qui a fini par s\'imposer partout.',
          image: {
            src: '/images/historique/leibniz.jpg',
            alt: 'Portrait de Gottfried Wilhelm Leibniz',
            caption:
              'Gottfried Wilhelm Leibniz (1646–1716), portrait attribué à Bernhard Christoph ' +
              'Francke, vers 1700.',
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
            ['1/x²', '−1/x + C', 'x ≠ 0'],
            ['√x', '(2/3)·x√x + C', 'x ≥ 0'],
            ['1/cos²(x)', 'tan(x) + C', 'cos(x) ≠ 0'],
          ],
        },
        {
          kind: 'piege',
          text:
            'La formule $x^n \\to \\dfrac{x^{n+1}}{n+1}$ est **explicitement exclue** pour n = ' +
            '−1 : tu diviserais par 0 ! La primitive de 1/x n\'est jamais une puissance de x, ' +
            'c\'est ln|x|. Piège classique : oublier la valeur absolue — ln(x) seul n\'est ' +
            'défini que pour x > 0, alors que 1/x l\'est aussi pour x < 0. Et comme ℝ₀ n\'est pas ' +
            'un intervalle, la constante peut être différente sur $]-\\infty;0[$ et sur $]0;+\\infty[$ ' +
            '(section 2).',
        },
        { kind: 'subheading', text: 'Règles de calcul : linéarité et f(ax + b)' },
        {
          kind: 'methode',
          label: 'Deux règles à appliquer en premier',
          items: [
            '**Linéarité** : $\\int \\big(k\\,f(x) + g(x)\\big)dx = k\\int f(x)dx + \\int g(x)dx$ — tu ' +
              'primitives terme à terme, les constantes multiplicatives restent en facteur.',
            '**Composée affine** : si F est une primitive de f, une primitive de $f(ax+b)$ ($a \\neq 0$) ' +
              'est $\\dfrac{1}{a}F(ax+b)$ — le facteur $\\dfrac{1}{a}$ compense la dérivée intérieure a.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'linéarité',
          formula: 'Calcule $\\int \\left(3x^2 - \\dfrac{4}{x} + 2\\cos(x)\\right)dx$.',
          steps: [
            { tag: 'terme à terme', text: '$3\\int x^2dx - 4\\int \\dfrac{1}{x}dx + 2\\int \\cos(x)dx$' },
            { tag: 'tableau des primitives usuelles', text: '$3\\cdot\\dfrac{x^3}{3} - 4\\ln|x| + 2\\sin(x)$' },
          ],
          result: { tag: 'résultat', text: '$x^3 - 4\\ln|x| + 2\\sin(x) + C$' },
        },
        {
          kind: 'exemple',
          badge: 'composée affine f(ax + b)',
          formula: 'Calcule $\\int \\cos(3x)dx$, $\\int e^{2x+1}dx$ et $\\int (2x+1)^5dx$.',
          steps: [
            { tag: 'a = 3', text: '$\\int \\cos(3x)dx = \\dfrac{1}{3}\\sin(3x) + C$' },
            { tag: 'a = 2', text: '$\\int e^{2x+1}dx = \\dfrac{1}{2}e^{2x+1} + C$' },
            { tag: 'a = 2, et une primitive de u⁵ est u⁶/6', text: '$\\int (2x+1)^5dx = \\dfrac{1}{2}\\cdot\\dfrac{(2x+1)^6}{6} + C = \\dfrac{(2x+1)^6}{12} + C$' },
          ],
          result: { tag: 'vérifier en dérivant', text: '$\\left(\\dfrac{(2x+1)^6}{12}\\right)\' = \\dfrac{6\\cdot2\\,(2x+1)^5}{12} = (2x+1)^5$' },
        },
        { kind: 'subheading', text: 'Technique de substitution — reconnaître une forme u\'·f(u)' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Regarde si l\'**intégrande** (la fonction écrite sous le signe ∫) a la forme ' +
              'u\'(x)·f(u(x)) — la dérivée d\'une expression composée apparaît EXACTEMENT comme ' +
              'facteur. Si oui, une primitive est F(u(x)) + C, où F est une primitive de f. ' +
              'Trois cas particuliers très utiles :',
            '$\\dfrac{u\'}{u} \\to \\ln|u| + C \\qquad u\'e^u \\to e^u + C \\qquad u\'u^n \\to \\dfrac{u^{n+1}}{n+1} + C$',
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int 2x \\cdot e^{x^2} dx$ : ici $u(x)=x^2$, donc $u\'(x)=2x$ — et ce facteur ' +
                'apparaît EXACTEMENT dans l\'intégrande ! C\'est la forme $u\'e^u$, de primitive $e^u$.',
            },
            { kind: 'para', text: '$\\int 2x \\cdot e^{x^2} dx = e^{x^2} + C$' },
          ],
        },
        {
          kind: 'piege',
          text:
            '$\\int x \\cdot e^{x^2} dx \\neq e^{x^2}+C$ : l\'intégrande ne porte que x, pas ' +
            '$2x=u\'(x)$ — il manque le facteur 1/2 ! La bonne primitive est $\\dfrac{1}{2}e^{x^2}+C$.',
        },
        {
          kind: 'exemple',
          badge: 'forme u′/u',
          formula: 'Calcule $\\int \\dfrac{2x}{x^2+1}dx$ et $\\int \\tan(x)dx$.',
          steps: [
            { tag: 'u = x² + 1, u′ = 2x — et u > 0', text: '$\\int \\dfrac{2x}{x^2+1}dx = \\ln\\left(x^2+1\\right) + C$' },
            { tag: 'u = cos(x), u′ = −sin(x) : faire apparaître u′', text: '$\\int \\tan(x)dx = \\int \\dfrac{\\sin(x)}{\\cos(x)}dx = -\\int \\dfrac{-\\sin(x)}{\\cos(x)}dx$' },
          ],
          result: { tag: 'résultat', text: '$\\int \\tan(x)dx = -\\ln|\\cos(x)| + C$' },
        },
        {
          kind: 'exemple',
          badge: 'forme u′·uⁿ',
          formula: 'Calcule $\\int 3x^2\\left(x^3+1\\right)^4dx$.',
          steps: [
            { tag: 'u = x³ + 1, u′ = 3x² : la forme u′·u⁴', text: '$\\int u\'\\,u^4 = \\dfrac{u^5}{5} + C$' },
          ],
          result: { tag: 'résultat', text: '$\\int 3x^2\\left(x^3+1\\right)^4dx = \\dfrac{\\left(x^3+1\\right)^5}{5} + C$' },
        },
        {
          kind: 'astuce',
          label: 'Toujours vérifier',
          text:
            'Une primitive se vérifie en la **dérivant** : si tu ne retombes pas exactement ' +
            'sur f, ta primitive est fausse ! Prends-en le réflexe systématique — pas ' +
            'seulement un contrôle de fin d\'exercice.',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — intégration par parties' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand l\'intégrande est un **produit** de deux fonctions et qu\'aucune substitution ' +
              'simple ne marche, tu peux « transférer » la dérivation d\'un facteur vers l\'autre :',
            '$\\int f(x) \\cdot g\'(x) \\, dx = f(x) \\cdot g(x) - \\int f\'(x) \\cdot g(x) \\, dx$',
            'Choisir quelle partie dériver (f) et quelle partie primitiver (g\') est l\'étape ' +
              'déterminante : le bon choix simplifie l\'intégrale restante, le mauvais la complique !',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — formule de l\'intégration par parties',
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
                'Or $\\int (f \\cdot g)\'(x)dx = f(x) \\cdot g(x) + C$ directement — une fonction ' +
                'est toujours une primitive de sa propre dérivée. Isole $\\int f(x) \\cdot ' +
                'g\'(x)dx$ dans l\'égalité ci-dessus : tu retrouves exactement la formule.',
            },
          ],
        },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int x \\cdot e^x dx$ : pose $f(x)=x$ (donc $f\'(x)=1$, plus simple) et ' +
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
            'mène à une intégrale **plus compliquée** ($\\int e^x \\cdot x^2/2 \\, dx$), jamais ' +
            'plus simple ! Dériver la partie qui se « simplifie » en dérivant (ici x → 1) est ' +
            'presque toujours le bon réflexe.',
        },
        {
          kind: 'exemple',
          badge: '∫ ln(x) dx : le facteur caché 1',
          formula: 'Calcule $\\int \\ln(x)dx$ sur $]0;+\\infty[$.',
          steps: [
            { tag: 'voir un produit : ln(x) = ln(x) · 1', text: '$f(x) = \\ln(x)$, $f\'(x) = \\dfrac{1}{x}$ ; $g\'(x) = 1$, $g(x) = x$' },
            { tag: 'intégration par parties', text: '$\\int \\ln(x)dx = x\\ln(x) - \\int x\\cdot\\dfrac{1}{x}dx = x\\ln(x) - \\int 1\\,dx$' },
          ],
          result: {
            tag: 'résultat',
            text:
              '$\\int \\ln(x)dx = x\\ln(x) - x + C$ — tu retrouves la fonction $x\\ln(x) - x$ du chapitre 3, ' +
              'dont la dérivée était justement $\\ln(x)$.',
          },
        },
        {
          kind: 'atelier',
          tag: 'ipp-choix-widget',
          label: 'Manipule toi-même — quel facteur dériver ?',
          caption:
            'Dans ∫ f·g′ dx = f·g − ∫ f′·g dx, tout se joue dans le choix du facteur à ' +
            'dériver. Choisis-le : l\'intégrale restante devient plus simple, ou plus ' +
            'compliquée. Tu n\'as qu\'un essai, puis la primitive complète est révélée. ' +
            'Retiens le réflexe : on dérive la partie qui se simplifie (x → 1, ln x → 1/x).',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — deux intégrations par parties successives',
          blocks: [
            {
              kind: 'para',
              text:
                '$\\int x^2 \\cdot \\sin(x) dx$ : une première IPP (f=x², g\'=sin(x)) laisse ' +
                'encore un produit $x \\cdot \\cos(x)$ à intégrer — il faut recommencer une ' +
                'deuxième fois :',
            },
            {
              kind: 'para',
              text:
                '**1re IPP** — $f = x^2$ ($f\' = 2x$), $g\' = \\sin(x)$ ($g = -\\cos(x)$) : ' +
                '$\\int x^2 \\sin(x) dx = -x^2\\cos(x) + \\int 2x\\cos(x) dx$.',
            },
            {
              kind: 'para',
              text:
                '**2e IPP** — $f = 2x$ ($f\' = 2$), $g\' = \\cos(x)$ ($g = \\sin(x)$) : ' +
                '$\\int 2x\\cos(x) dx = 2x\\sin(x) - \\int 2\\sin(x) dx = 2x\\sin(x) + 2\\cos(x)$.',
            },
            {
              kind: 'para',
              text: '$\\int x^2 \\cdot \\sin(x) dx = -x^2\\cos(x) + 2x\\sin(x) + 2\\cos(x) + C$',
            },
          ],
        },
        { kind: 'subheading', text: 'Pour aller plus loin — d\'autres techniques de primitivation' },
        {
          kind: 'methode',
          label: 'Quatre techniques complémentaires',
          items: [
            '**Changement de variable x = φ(u)** : quand une expression gêne (une racine, un binôme), pose ' +
              'u égal à cette expression, exprime x et dx en fonction de u, primitive en u, puis reviens à x.',
            '**Identités trigonométriques** : $\\cos^2(x) = \\dfrac{1+\\cos(2x)}{2}$ et ' +
              '$\\sin^2(x) = \\dfrac{1-\\cos(2x)}{2}$ abaissent une puissance paire ; pour une puissance ' +
              'impaire, isole un facteur $\\sin(x)$ (ou $\\cos(x)$) et remplace le reste avec ' +
              '$\\sin^2(x) + \\cos^2(x) = 1$.',
            '**Décomposition en éléments simples** : une fraction $\\dfrac{p(x)}{(x-r_1)(x-r_2)}$ (degré du ' +
              'numérateur inférieur à 2) s\'écrit $\\dfrac{A}{x-r_1} + \\dfrac{B}{x-r_2}$ ; chaque terme ' +
              'se primitive en un logarithme. Si le degré du numérateur est trop grand, commence par une ' +
              'division euclidienne.',
            '**Intégration par parties « cyclique »** : deux intégrations par parties font réapparaître ' +
              'l\'intégrale de départ ; on la traite alors comme une inconnue d\'équation.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'changement de variable x = φ(u)',
          formula: 'Calcule $\\int x\\sqrt{x+1}\\,dx$.',
          steps: [
            { tag: 'poser u = x + 1', text: '$x = u - 1$ et $dx = du$, donc $\\int x\\sqrt{x+1}\\,dx = \\int (u-1)\\sqrt{u}\\,du = \\int \\left(u^{3/2} - u^{1/2}\\right)du$' },
            { tag: 'primitiver en u', text: '$\\dfrac{2}{5}u^{5/2} - \\dfrac{2}{3}u^{3/2} + C$' },
          ],
          result: { tag: 'revenir à x', text: '$\\int x\\sqrt{x+1}\\,dx = \\dfrac{2}{5}(x+1)^{5/2} - \\dfrac{2}{3}(x+1)^{3/2} + C$' },
        },
        {
          kind: 'exemple',
          badge: 'puissances de sin et cos',
          formula: 'Calcule $\\int \\cos^2(x)\\,dx$ et $\\int \\sin^3(x)\\,dx$.',
          steps: [
            { tag: 'puissance paire : abaisser le degré', text: '$\\int \\cos^2(x)\\,dx = \\int \\dfrac{1+\\cos(2x)}{2}dx = \\dfrac{x}{2} + \\dfrac{\\sin(2x)}{4} + C$' },
            { tag: 'puissance impaire : isoler sin(x)', text: '$\\int \\sin^3(x)\\,dx = \\int \\left(1-\\cos^2(x)\\right)\\sin(x)\\,dx$, de la forme $-u\'(1-u^2)$ avec $u = \\cos(x)$' },
          ],
          result: { tag: 'résultat', text: '$\\int \\sin^3(x)\\,dx = -\\cos(x) + \\dfrac{\\cos^3(x)}{3} + C$' },
        },
        {
          kind: 'exemple',
          badge: 'éléments simples',
          formula: 'Calcule $\\int \\dfrac{1}{x^2-1}dx$ sur $]1;+\\infty[$.',
          steps: [
            { tag: 'factoriser le dénominateur', text: '$x^2 - 1 = (x-1)(x+1)$, donc on cherche $\\dfrac{1}{x^2-1} = \\dfrac{A}{x-1} + \\dfrac{B}{x+1}$' },
            { tag: 'identifier A et B', text: '$1 = A(x+1) + B(x-1)$ : en $x = 1$, $A = \\dfrac{1}{2}$ ; en $x = -1$, $B = -\\dfrac{1}{2}$' },
          ],
          result: { tag: 'résultat', text: '$\\int \\dfrac{1}{x^2-1}dx = \\dfrac{1}{2}\\ln|x-1| - \\dfrac{1}{2}\\ln|x+1| + C = \\dfrac{1}{2}\\ln\\left(\\dfrac{x-1}{x+1}\\right) + C$' },
        },
        {
          kind: 'exemple',
          badge: 'intégration par parties cyclique',
          formula: 'Calcule $I = \\int e^x\\cos(x)\\,dx$.',
          steps: [
            { tag: '1re IPP — f = cos(x), g′ = eˣ', text: '$I = e^x\\cos(x) + \\int e^x\\sin(x)\\,dx$' },
            { tag: '2e IPP — f = sin(x), g′ = eˣ', text: '$\\int e^x\\sin(x)\\,dx = e^x\\sin(x) - \\int e^x\\cos(x)\\,dx = e^x\\sin(x) - I$' },
            { tag: 'I réapparaît : résoudre', text: '$I = e^x\\cos(x) + e^x\\sin(x) - I \\implies 2I = e^x\\big(\\sin(x) + \\cos(x)\\big)$' },
          ],
          result: { tag: 'résultat', text: '$\\int e^x\\cos(x)\\,dx = \\dfrac{e^x\\big(\\sin(x)+\\cos(x)\\big)}{2} + C$' },
        },
        {
          kind: 'entrainement',
          title: 'Calcul de primitives',
          generatorId: '6gen23',
          description: [
            'Calcule des primitives par lecture directe du tableau, par substitution (forme ' +
              'u\'·f(u)) ou par intégration par parties, puis vérifie en dérivant.',
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
        { kind: 'video', title: 'Quelle primitive ? Condition initiale', youtubeId: '8XP9SUOn69c' },
        {
          kind: 'para',
          text:
            'La primitive générale F(x) + C regroupe une **infinité** de fonctions. Pour en ' +
            'isoler UNE seule — la « primitive particulière » —, tu as besoin d\'une ' +
            'information en plus : une **condition initiale** F(x₀) = y₀.',
        },
        {
          kind: 'intuition',
          label: 'Quelle piste choisir, parmi toutes les primitives ?',
          text:
            'Tu te souviens : toutes les primitives de f sont des courbes parallèles, décalées ' +
            'verticalement les unes des autres. Une condition initiale, c\'est juste un point ' +
            'par lequel la courbe doit passer — exactement de quoi repérer, parmi toute cette ' +
            'famille, sur QUELLE piste tu te trouves.',
        },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Calcule la primitive générale F(x) + C (techniques de la section 1) — sans jamais oublier C !',
            'Remplace x par x₀ et pose l\'équation F(x₀) + C = y₀.',
            'Résous cette équation du **premier degré** en C — elle admet toujours exactement une solution.',
            'Écris la primitive particulière obtenue.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
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
          kind: 'exemple',
          badge: 'un polynôme',
          formula: 'Détermine la primitive F de $f(x) = 3x^2 - 4x + 1$ telle que $F(2) = 3$.',
          steps: [
            { tag: 'primitive générale', text: '$F(x) = x^3 - 2x^2 + x + C$' },
            { tag: 'condition initiale', text: '$F(2) = 8 - 8 + 2 + C = 2 + C = 3 \\implies C = 1$' },
          ],
          result: { tag: 'résultat', text: '$F(x) = x^3 - 2x^2 + x + 1$' },
        },
        {
          kind: 'exemple',
          badge: 'une fonction trigonométrique',
          formula: 'Détermine la primitive F de $f(x) = \\cos(x)$ telle que $F(\\pi) = 1$.',
          steps: [
            { tag: 'primitive générale', text: '$F(x) = \\sin(x) + C$' },
            { tag: 'condition initiale — sin(π) = 0', text: '$F(\\pi) = 0 + C = 1 \\implies C = 1$' },
          ],
          result: { tag: 'résultat', text: '$F(x) = \\sin(x) + 1$' },
        },
        {
          kind: 'exemple',
          badge: 'une condition pour x < 0',
          formula: 'Détermine la primitive F de $f(x) = \\dfrac{1}{x}$ sur $]-\\infty;0[$ telle que $F(-1) = 2$.',
          steps: [
            { tag: 'sur ]−∞ ; 0[, |x| = −x', text: '$F(x) = \\ln|x| + C = \\ln(-x) + C$' },
            { tag: 'condition initiale — ln(1) = 0', text: '$F(-1) = \\ln(1) + C = C = 2$' },
          ],
          result: {
            tag: 'résultat',
            text:
              '$F(x) = \\ln(-x) + 2$ sur $]-\\infty;0[$ — cette condition ne dit rien de la branche ' +
              '$x > 0$, qui garde sa propre constante.',
          },
        },
        {
          kind: 'piege',
          label: 'Piège central de cet exercice',
          text:
            'Oublier C dès le premier calcul — le traiter comme s\'il valait déjà 0 — rend ' +
            'l\'équation F(x₀) = y₀ impossible à poser correctement ! C doit rester ' +
            '**symbolique** jusqu\'à ce que la condition initiale l\'évalue, jamais fixé « provisoirement » à 0.',
        },
        {
          kind: 'atelier',
          tag: 'condition-initiale-widget',
          label: 'Manipule toi-même — choisis la bonne piste',
          caption:
            'Choisis f puis place le point (x₀ ; y₀) : la constante se calcule en direct ' +
            'par C = y₀ − F(x₀), et seule la primitive qui passe par ce point s\'allume. ' +
            'Avec 1/x, un point ne fixe que la branche où il se trouve : l\'autre reste ' +
            'libre. Les réglages par défaut (f = 2x, point (1 ; 4)) reproduisent ' +
            'l\'illustration ci-dessus (C = 3).',
        },
        {
          kind: 'astuce',
          label: 'Vérifier deux fois',
          text:
            'Une primitive particulière se contrôle en deux gestes : **dérive-la** (tu dois retomber sur ' +
            'f), puis **remplace x par x₀** (tu dois trouver y₀). Si l\'un des deux échoue, l\'erreur est ' +
            'dans la primitive générale ou dans le calcul de C.',
        },
        {
          kind: 'application',
          titre: 'Retrouver une position à partir d\'une vitesse',
          image: {
            src: '/images/application/speedometre.jpg',
            alt: 'Compteur de vitesse sur le tableau de bord d\'une voiture',
            caption: 'Photo : Michael Sheehan, CC BY 2.0, via Wikimedia Commons.',
          },
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 6 * t, tone: 'accent' }],
              xMin: 0,
              xMax: 3,
              xTicks: [1, 2, 3],
              shadedRegions: [{ from: 0, to: 2, upper: (t) => 6 * t, tone: 'good' }],
              textLabels: [{ x: 0.75, y: 5, text: 'aire = 12 m', tone: 'good', anchor: 'middle' }],
              xAxisLabel: 't (s)',
              yAxisLabel: 'v (m/s)',
              caption: 'v(t)=6t : l\'aire sous la courbe entre t=0 et t=2 vaut 12 — la distance parcourue pendant ces 2 secondes.',
            },
            {
              kind: 'curvePlot',
              curves: [{ fn: (t) => 3 * t * t + 10, tone: 'accent' }],
              xMin: 0,
              xMax: 3,
              xTicks: [1, 2, 3],
              yTicks: [10, 22],
              points: [
                { x: 0, y: 10, label: 'x(0)=10', tone: 'accent', labelPos: 'left' },
                { x: 2, y: 22, label: 'x(2)=22', tone: 'good', labelPos: 'above' },
              ],
              xAxisLabel: 't (s)',
              yAxisLabel: 'x (m)',
              caption: 'x(t)=3t²+10 : entre t=0 et t=2, la position augmente de 22−10=12 m — exactement l\'aire trouvée sous v(t).',
            },
          ],
          text:
            "En physique, la vitesse $v(t)$ d'un mobile est la DÉRIVÉE de sa position $x(t)$ : " +
            "$x'(t)=v(t)$. Autrement dit, retrouver $x(t)$ à partir de $v(t)$ est EXACTEMENT " +
            'le problème de cette section — trouver une primitive, puis fixer la constante C ' +
            'grâce à une position connue à un instant donné (la condition initiale). Par ' +
            'exemple, si une voiture roule à $v(t)=6t$ (en m/s, t en secondes) et se trouve à ' +
            '$x(0)=10$ m au départ, sa primitive générale est $x(t)=3t^2+C$ ; la condition ' +
            '$x(0)=10$ donne $C=10$, donc $x(t)=3t^2+10$ : tu connais désormais sa position à ' +
            "CHAQUE instant, juste à partir de sa vitesse et d'un seul point de départ. La " +
            "même idée relie l'accélération à la vitesse : $v'(t)=a(t)$.",
          domaines: ['Physique', 'Cinématique'],
        },
        {
          kind: 'entrainement',
          title: 'Quelle primitive ? (condition initiale)',
          generatorId: '6gen24',
          description: [
            'Calcule la primitive générale, pose et résous l\'équation en C à partir d\'une ' +
              'condition initiale, puis écris la primitive particulière.',
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
        { kind: 'video', title: 'Intégrales définies (1/2) : de l\'aire à l\'intégrale, théorème fondamental', youtubeId: 'VcBrwzQ86wc' },
        { kind: 'video', title: 'Intégrales définies (2/2) : propriétés, trapèzes, valeur moyenne', youtubeId: 'PTTczZuLjOw' },
        {
          kind: 'intuition',
          label: 'Instantané ou accumulé ?',
          text:
            "Une dérivée mesure un débit à un instant précis — la vitesse à laquelle une " +
            "piscine se remplit, à la seconde où tu regardes. Une **intégrale**, c'est tout " +
            "l'inverse : elle accumule ce débit sur toute une durée, pour te donner le volume " +
            "TOTAL accumulé — pas une valeur instantanée, une vraie somme continue.",
        },
        {
          kind: 'definition',
          label: 'Comment définit-on l\'intégrale, avant même de connaître une primitive ?',
          items: [
            'Prends f continue et positive sur [a;b]. Partage cet intervalle en n ' +
              'sous-intervalles de longueur constante Δx=(b−a)/n. Sur chacun, note mᵢ la plus ' +
              'petite valeur prise par f, et Mᵢ la plus grande.',
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
            'Quand n augmente indéfiniment, ces deux sommes convergent vers une **même ' +
              'limite** (admis) — c\'est cette limite commune qu\'on appelle ' +
              '$\\int_a^b f(x)dx$, l\'**intégrale définie** de f entre a et b. La démarche se ' +
              'généralise à toute fonction f continue, même non positive.',
          ],
        },
        {
          kind: 'historique',
          titre: 'Donner un sens rigoureux à l\'aire sous une courbe',
          text:
            'La définition que tu viens de voir — encadrer l\'aire par des rectangles de plus ' +
            'en plus fins — porte le nom du mathématicien allemand **Bernhard Riemann**, qui ' +
            'la formalise en 1854, dans un texte d\'habilitation (une sorte d\'examen pour ' +
            'devenir professeur) resté célèbre. Avant lui, Newton et Leibniz savaient déjà ' +
            'calculer des intégrales grâce au théorème fondamental — mais personne n\'avait ' +
            "donné de définition PRÉCISE de ce qu'est réellement une intégrale, " +
            'indépendamment du calcul d\'une primitive. Riemann comble ce manque : son ' +
            'découpage en rectangles minorants et majorants, et le passage à la limite quand ' +
            'leur nombre $n$ tend vers l\'infini, est exactement ce que tu viens d\'étudier — ' +
            'c\'est pour cette raison qu\'on parle encore aujourd\'hui de **somme de Riemann** ' +
            'et d\'**intégrale de Riemann**.',
          image: {
            src: '/images/historique/riemann.jpg',
            alt: 'Portrait de Bernhard Riemann',
            caption: 'Bernhard Riemann (1826–1866), photographie d\'époque.',
          },
        },
        {
          kind: 'definition',
          label: 'Théorème fondamental de l\'analyse',
          items: [
            'Pour f continue sur [a;b] et F une primitive quelconque de f : ' +
              '$\\int_a^b f(x)dx = [F(x)]_a^b = F(b) - F(a)$.',
            'Il relie deux mondes : l\'intégrale, définie comme une limite de sommes de rectangles, se ' +
              'calcule avec une primitive. Il est démontré plus bas, avec la fonction aire.',
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
              text: 'Peu importe la primitive que tu choisis pour calculer $\\int_a^b f(x)dx$ : le résultat est toujours le même nombre !',
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
            '**Positivité et croissance** : si $f \\ge 0$ sur $[a;b]$ (avec $a < b$), alors ' +
              '$\\int_a^b f(x)dx \\ge 0$ ; si $f \\le g$ sur $[a;b]$, alors $\\int_a^b f(x)dx \\le \\int_a^b g(x)dx$.',
            'L\'intégrale définie est une somme **signée** : lorsque $a < b$, son signe suit celui de f ' +
              'sur [a;b] (si $a > b$, il s\'inverse). La variable d\'intégration est **muette** — $\\int_a^b ' +
              'f(x)dx$ et $\\int_a^b f(t)dt$ désignent exactement le même nombre. C\'est cette ' +
              'additivité qui justifie le découpage aux racines que tu utiliseras pour les ' +
              'aires (section 4).',
          ],
        },
        {
          kind: 'methode',
          label: 'Lire une intégrale sur un graphique, sans primitive',
          items: [
            'Découpe $[a;b]$ à chaque sommet de la courbe (changement de direction, début ou fin ' +
              'd\'un arc de cercle) et là où elle traverse l\'axe des abscisses : chaque morceau ' +
              'est une figure simple (rectangle, triangle, trapèze, demi-disque, quart de disque) ' +
              'entièrement au-dessus ou entièrement sous l\'axe.',
            'Sur chaque morceau, l\'intégrale vaut l\'aire de la figure, **comptée négativement** ' +
              'sous l\'axe. Un demi-disque de rayon r a pour aire $\\dfrac{\\pi r^2}{2}$, un quart ' +
              'de disque $\\dfrac{\\pi r^2}{4}$.',
            'Additionne ces intégrales signées (additivité) : tu obtiens $\\int_a^b f(x)dx$. Si ' +
              'les bornes sont échangées, change le signe : $\\int_b^a f(x)dx = -\\int_a^b f(x)dx$.',
          ],
        },
        {
          kind: 'attention',
          label: 'Aire ou intégrale ?',
          text:
            'L\'**aire** de la région comprise entre la courbe et l\'axe additionne les aires de ' +
            'tous les morceaux, toujours positivement ; l\'**intégrale** retranche celles des ' +
            'morceaux situés sous l\'axe. Si f vaut 2 sur $[0;3]$ et $-1$ sur $[3;5]$, alors ' +
            '$\\int_0^5 f(x)dx = 6 - 2 = 4$, mais l\'aire de la région vaut $6 + 2 = 8$ u.a. : ' +
            'ce ne sont pas les mêmes nombres.',
        },
        { kind: 'subheading', text: 'La fonction aire : pourquoi une primitive calcule une aire' },
        {
          kind: 'definition',
          label: 'Fonction aire',
          items: [
            'Pour f continue sur un intervalle contenant a, la **fonction aire** ' +
              '$A(x) = \\int_a^x f(t)dt$ mesure l\'aire (signée) accumulée sous la courbe, de a jusqu\'à x. ' +
              'Elle vaut 0 en a : $A(a) = 0$.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la fonction aire est une primitive de f (théorème fondamental)',
          blocks: [
            {
              kind: 'para',
              text:
                '**1.** Prends $h > 0$ petit. Par additivité, $A(x+h) - A(x) = \\int_x^{x+h} f(t)dt$ : ' +
                'l\'aire d\'une mince bande de largeur h.',
            },
            {
              kind: 'para',
              text:
                '**2.** Note $m_h$ et $M_h$ le minimum et le maximum de f sur $[x;x+h]$. Par croissance ' +
                'de l\'intégrale, la bande est encadrée par deux rectangles : ' +
                '$m_h \\cdot h \\le A(x+h) - A(x) \\le M_h \\cdot h$.',
            },
            {
              kind: 'para',
              text:
                '**3.** Divise par $h > 0$ : $m_h \\le \\dfrac{A(x+h) - A(x)}{h} \\le M_h$. Quand $h \\to 0$, ' +
                'f étant continue, $m_h$ et $M_h$ tendent tous deux vers $f(x)$ : le taux ' +
                'd\'accroissement aussi. Même raisonnement pour $h < 0$. Donc $A\'(x) = f(x)$.',
            },
            {
              kind: 'para',
              text:
                '**Conclusion.** A est **une primitive de f**, celle qui s\'annule en a. Si F est une ' +
                'primitive quelconque de f, alors $A(x) = F(x) + C$, et $A(a) = 0$ donne $C = -F(a)$. ' +
                'D\'où $\\int_a^b f(t)dt = A(b) = F(b) - F(a)$ : c\'est le théorème fondamental. ' +
                '$\\qquad \\blacksquare$',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'fonction-aire-widget',
          label: 'Manipule toi-même — la fonction aire',
          caption:
            'Fais glisser x : l\'aire hachurée sous f, de a à x, est la valeur A(x), ' +
            'reportée sur le graphique du bas qui dessine la fonction aire. La pente de A ' +
            'en x vaut exactement f(x) — c\'est le théorème fondamental : A est une ' +
            'primitive de f. Coche le zoom : la mince bande A(x + h) − A(x) ressemble de ' +
            'plus en plus au rectangle f(x)·h.',
        },
        {
          kind: 'methode',
          label: 'Lire la fonction aire sur le graphique de f',
          items: [
            '**Valeurs** : $A(a) = 0$ ; pour $x > a$, $A(x)$ est l\'aire signée de a à x (une aire sous l\'axe ' +
              'compte négativement) ; pour $x < a$, $A(x) = -\\int_x^a f(t)dt$.',
            '**Sens de variation** : $A\' = f$, donc A est croissante là où $f \\ge 0$ et décroissante là où ' +
              '$f \\le 0$. C\'est le **signe** de f qui compte, pas son sens de variation : là où f décroît en ' +
              'restant positive, A croît encore.',
            '**Extremums** : A admet un extremum local là où f **change de signe** — un maximum si f passe ' +
              'de + à −, un minimum si f passe de − à +. Un zéro de f sans changement de signe, ou un ' +
              'sommet de la courbe de f, n\'en donne pas.',
            '**Pente** : la tangente à la courbe de A au point d\'abscisse p a pour pente $A\'(p) = f(p)$, ' +
              'une ordonnée lue sur la courbe de f (et non une aire).',
          ],
        },
        {
          kind: 'entrainement',
          title: 'La fonction aire',
          generatorId: '6gen78',
          description: [
            'À partir du seul graphique de f, étudie la fonction aire A(x) = ∫ₐˣ f(t) dt : valeurs par ' +
              'des aires signées, sens de variation, extremums, pente A′ = f, et reconnaissance du ' +
              'graphique de A.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 78. La fonction aire »',
        },
        {
          kind: 'methode',
          label: 'Substitution dans une intégrale définie : changer aussi les bornes',
          items: [
            'Quand tu poses $u = u(x)$, les bornes portent sur x : remplace-les par $u(a)$ et $u(b)$ — ' +
              'ou reviens à la variable x avant d\'évaluer. Les deux voies donnent le même nombre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'substitution avec changement de bornes',
          formula: 'Calcule $\\int_1^2 \\dfrac{2x}{x^2+1}dx$.',
          steps: [
            { tag: 'poser u = x² + 1 — du = 2x dx', text: 'si $x = 1$, $u = 2$ ; si $x = 2$, $u = 5$' },
            { tag: 'nouvelle intégrale, nouvelles bornes', text: '$\\int_2^5 \\dfrac{1}{u}du = [\\ln(u)]_2^5 = \\ln(5) - \\ln(2)$' },
          ],
          result: { tag: 'résultat', text: '$\\int_1^2 \\dfrac{2x}{x^2+1}dx = \\ln\\left(\\dfrac{5}{2}\\right) \\approx 0{,}916$' },
        },
        {
          kind: 'methode',
          label: 'Parité : intégrer sur un intervalle symétrique',
          items: [
            'Si f est **impaire**, $\\int_{-a}^{a} f(x)dx = 0$ : les deux moitiés se compensent exactement.',
            'Si f est **paire**, $\\int_{-a}^{a} f(x)dx = 2\\int_0^a f(x)dx$ : les deux moitiés sont égales.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'parité',
          formula: 'Calcule $\\int_{-2}^{2}\\left(x^3 - 5x\\right)dx$ et $\\int_{-1}^{1}\\left(x^2 + 1\\right)dx$.',
          steps: [
            { tag: 'x³ − 5x est impaire', text: '$\\int_{-2}^{2}\\left(x^3 - 5x\\right)dx = 0$, sans aucun calcul' },
            { tag: 'x² + 1 est paire', text: '$\\int_{-1}^{1}\\left(x^2 + 1\\right)dx = 2\\int_0^1\\left(x^2+1\\right)dx = 2\\left[\\dfrac{x^3}{3} + x\\right]_0^1 = 2\\cdot\\dfrac{4}{3}$' },
          ],
          result: { tag: 'résultat', text: '$0$ et $\\dfrac{8}{3}$' },
        },
        { kind: 'subheading', text: 'Pour aller plus loin — approcher numériquement une intégrale : la méthode des trapèzes' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Quand tu ne trouves pas de primitive explicite (ou que tu ne disposes que de ' +
              'mesures ponctuelles), tu peux approcher $\\int_a^b f(x)dx$ en remplaçant chaque ' +
              'rectangle de l\'encadrement par un **trapèze** reliant ($x_{i-1}$;$f(x_{i-1})$) ' +
              'à ($x_i$;$f(x_i)$) :',
            '$\\int_a^b f(x)dx \\approx \\dfrac{\\Delta x}{2}[f(x_0) + f(x_n) + 2(f(x_1)+\\ldots+f(x_{n-1}))]$',
            'Plus n (le nombre de sous-intervalles) est grand, plus cette approximation est précise.',
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
              text: 'Approche $\\int_0^4 x^2 dx$ par la méthode des trapèzes, avec 4 sous-intervalles (Δx=1) :',
            },
            { kind: 'para', text: '$\\int_0^4 x^2 dx \\approx \\dfrac{1}{2}[0+16+2(1+4+9)] = \\dfrac{1}{2}(16+28) = 22$' },
            {
              kind: 'para',
              text:
                'La valeur exacte (théorème fondamental, une primitive de x² est x³/3) vaut ' +
                '64/3 ≈ 21,33 : l\'approximation par trapèzes (22) surestime légèrement, car la ' +
                'parabole est **convexe (tournée vers le haut)** — chaque trapèze passe donc au-dessus de la courbe.',
            },
          ],
        },
        {
          kind: 'atelier',
          tag: 'sommes-riemann-widget',
          label: 'Manipule toi-même — plus n grandit, plus c\'est précis',
          caption:
            'Choisis une fonction et une méthode, puis fais grandir n : l\'encadrement ' +
            'minorant ≤ I ≤ majorant se resserre autour de la valeur exacte, et l\'erreur ' +
            'fond. Compare le point milieu et les trapèzes : à n égal, lequel est le plus ' +
            'précis ? x², n = 4, trapèzes reproduit l\'exemple résolu (22 contre 64/3).',
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
                'tel que f(r) vaut exactement cette valeur moyenne — elle est donc toujours atteinte, jamais seulement approchée.',
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
            '(2) — il manque la division par b−a ! Ce sont deux nombres différents, jamais interchangeables.',
        },
        {
          kind: 'exemple',
          badge: 'valeur moyenne de sin sur [0 ; π]',
          formula: 'Calcule la valeur moyenne de $f(x) = \\sin(x)$ sur $[0;\\pi]$, et trouve où f l\'atteint.',
          steps: [
            { tag: 'intégrale', text: '$\\int_0^\\pi \\sin(x)dx = [-\\cos(x)]_0^\\pi = 1 + 1 = 2$' },
            { tag: 'diviser par la longueur π', text: 'valeur moyenne $= \\dfrac{2}{\\pi} \\approx 0{,}637$' },
            { tag: 'où est-elle atteinte ?', text: '$\\sin(r) = \\dfrac{2}{\\pi}$ : $r \\approx 0{,}690$ ou $r = \\pi - 0{,}690 \\approx 2{,}451$' },
          ],
          result: { tag: 'résultat', text: '$\\dfrac{2}{\\pi}$, atteinte en deux points de $[0;\\pi]$' },
        },
        {
          kind: 'atelier',
          tag: 'rectangle-valeur-moyenne-widget',
          label: 'Manipule toi-même — le rectangle de même aire',
          caption:
            'Règle la hauteur m du rectangle jusqu\'à ce que son aire égale celle de la ' +
            'région sous f : m est alors la valeur moyenne de f sur [a ; b]. Le rectangle ' +
            'passe au vert et marque les points où f prend exactement cette valeur — ce que ' +
            'garantit le théorème de la moyenne. Avec sin sur [0 ; π], tu retrouves ' +
            'l\'exemple ci-dessus.',
        },
        { kind: 'subheading', text: 'Retrouver un paramètre depuis une intégrale connue' },
        {
          kind: 'exempleLibre',
          blocks: [
            {
              kind: 'para',
              text: 'Tu cherches m > 0 tel que $\\int_0^m 2x \\, dx = 9$. L\'intégrale vaut [x²]₀ᵐ = m², d\'où l\'équation m² = 9, puis, avec m > 0 :',
            },
            { kind: 'para', text: 'm = 3' },
          ],
        },
        {
          kind: 'entrainement',
          title: 'L\'intégrale lue sur un graphique (aire signée)',
          generatorId: '6gen77',
          description: [
            'Sans primitive : découpe une courbe faite de segments et de portions de disque en ' +
              'figures simples, compte négativement les aires sous l\'axe, utilise l\'additivité ' +
              'et les bornes inversées, et distingue l\'aire de l\'intégrale.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 77. L\'intégrale lue sur un graphique (aire signée) »',
        },
        {
          kind: 'entrainement',
          title: 'Intégrales définies, paramètre et valeur moyenne',
          generatorId: '6gen25',
          description: [
            'Applique le théorème fondamental, ses propriétés (additivité, linéarité), la ' +
              'méthode des trapèzes et la valeur moyenne, ou retrouve un paramètre à partir ' +
              'd\'une intégrale connue.',
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
        { kind: 'video', title: 'Calcul d\'aires par intégrale', youtubeId: '0LDrwlZLcoY' },
        {
          kind: 'para',
          text:
            'Une aire est **toujours** positive ou nulle — jamais négative ! L\'intégrale ' +
            'signée coïncide avec l\'aire seulement quand f garde un signe constant sur ' +
            'l\'intervalle considéré.',
        },
        {
          kind: 'methode',
          label: 'Aire sous une courbe',
          items: [
            'Si f ≥ 0 sur [a;b] : aire = $\\int_a^b f(x)dx$.',
            'Si f ≤ 0 sur [a;b] : aire = $-\\int_a^b f(x)dx$.',
            'Si f change de signe : découpe l\'intervalle aux **racines** de f, puis somme la ' +
              'valeur absolue de chaque intégrale partielle — jamais une seule intégrale ' +
              'globale sur tout l\'intervalle, où les parties positives et négatives se compenseraient !',
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
          kind: 'exemple',
          badge: 'sin sur [0 ; 2π]',
          formula: 'Compare $\\int_0^{2\\pi}\\sin(x)dx$ et l\'aire comprise entre la courbe de sin et l\'axe des abscisses sur $[0;2\\pi]$.',
          steps: [
            { tag: 'intégrale (signée)', text: '$\\int_0^{2\\pi}\\sin(x)dx = [-\\cos(x)]_0^{2\\pi} = -1 + 1 = 0$' },
            { tag: 'découper en π, où sin s\'annule', text: '$\\int_0^\\pi \\sin(x)dx = 2$ et $\\int_\\pi^{2\\pi}\\sin(x)dx = -2$' },
          ],
          result: { tag: 'résultat', text: 'intégrale $= 0$, mais aire $= 2 + 2 = 4$ : les deux arches se compensent dans l\'intégrale.' },
        },
        {
          kind: 'atelier',
          tag: 'aire-signee-widget',
          label: 'Manipule toi-même — intégrale ou aire ?',
          caption:
            'Règle les bornes a et b : l\'intégrale additionne les parties vertes (au-dessus ' +
            'de l\'axe) et retranche les rouges, alors que l\'aire additionne toujours des ' +
            'valeurs positives. Dès que f change de signe entre a et b, les deux nombres ' +
            'diffèrent : découpe aux racines et additionne les valeurs absolues des ' +
            'morceaux.',
        },
        {
          kind: 'application',
          titre: 'Calculer un coût total à partir d\'un coût marginal',
          illustrations: [
            {
              kind: 'curvePlot',
              curves: [{ fn: (x) => 2 * x + 5, tone: 'accent' }],
              xMin: 0,
              xMax: 10,
              xTicks: [3, 8],
              shadedRegions: [{ from: 3, to: 8, upper: (x) => 2 * x + 5, tone: 'good' }],
              textLabels: [{ x: 5.5, y: 4, text: 'aire = 80 €', tone: 'good', anchor: 'middle' }],
              xAxisLabel: 'x (unités)',
              yAxisLabel: 'Cₘ(x) (€)',
              caption: 'Coût marginal Cₘ(x)=2x+5 : l\'aire entre x=3 et x=8 (80 €) est le coût supplémentaire pour passer de 3 à 8 unités produites.',
            },
            {
              kind: 'curvePlot',
              curves: [
                { fn: (x) => 20 - x, tone: 'accent' },
                { fn: () => 12, tone: 'bad' },
              ],
              xMin: 0,
              xMax: 10,
              xTicks: [8],
              fixedYRange: { min: 0, max: 20 },
              shadedRegions: [{ from: 0, to: 8, upper: (x) => 20 - x, lower: () => 12, tone: 'good' }],
              points: [{ x: 8, y: 12, label: '', tone: 'accent' }],
              textLabels: [
                { x: 1, y: 18, text: 'demande', tone: 'accent', anchor: 'start' },
                { x: 1, y: 13.5, text: 'prix payé = 12 €', tone: 'bad', anchor: 'start' },
              ],
              xAxisLabel: 'x (quantité)',
              yAxisLabel: 'prix (€)',
              caption: 'Même principe pour le surplus du consommateur : l\'aire entre la courbe de demande et le prix payé (12 €) vaut 32 € — l\'avantage retiré par les acheteurs.',
            },
          ],
          text:
            'En économie, le **coût marginal** $C_m(x)$ est le coût de production d\'une ' +
            'unité supplémentaire quand $x$ unités sont déjà produites — c\'est la dérivée du ' +
            'coût total $C(x)$. Inverser cette relation, exactement comme tu viens de le ' +
            'faire pour une aire, permet de retrouver le coût total à partir du coût ' +
            'marginal : $C(x) = C(0) + \\int_0^x C_m(t)dt$, où $C(0)$ est le coût fixe (les ' +
            'frais même à production nulle). Graphiquement, le coût variable entre deux ' +
            'niveaux de production $a$ et $b$ est exactement l\'AIRE sous la courbe du coût ' +
            'marginal entre $a$ et $b$ — la même idée sert aussi à calculer le **surplus du ' +
            'consommateur** (l\'aire entre la courbe de demande et le prix réellement payé), ' +
            "une mesure centrale de l'avantage que les acheteurs retirent d'un marché.",
          domaines: ['Économie', 'Gestion'],
        },
        {
          kind: 'methode',
          label: 'Aire entre deux courbes',
          items: [
            'Si f(x) ≥ g(x) sur [a;b] : aire = $\\int_a^b (f(x)-g(x))dx$.',
            'Si les courbes se croisent, les **racines de f−g** (leurs points d\'intersection) ' +
              'deviennent les bornes des sous-intervalles à traiter séparément — exactement ' +
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
          kind: 'exemple',
          badge: 'entre x³ et x',
          formula: 'Calcule l\'aire de la région comprise entre les courbes $f(x) = x^3$ et $g(x) = x$.',
          steps: [
            { tag: 'intersections', text: '$x^3 = x \\iff x\\left(x^2-1\\right) = 0 \\iff x \\in \\{-1;0;1\\}$' },
            { tag: 'qui est au-dessus ?', text: '$x^3 \\ge x$ sur $[-1;0]$, $x \\ge x^3$ sur $[0;1]$' },
            { tag: 'deux intégrales', text: '$\\int_{-1}^{0}\\left(x^3 - x\\right)dx + \\int_0^1\\left(x - x^3\\right)dx = \\dfrac{1}{4} + \\dfrac{1}{4}$' },
          ],
          result: { tag: 'résultat', text: 'aire $= \\dfrac{1}{2}$ — alors que $\\int_{-1}^{1}\\left(x^3 - x\\right)dx = 0$.' },
        },
        {
          kind: 'exemple',
          badge: 'sous ln(x) entre 1 et e',
          formula: 'Calcule l\'aire comprise entre la courbe de $\\ln$, l\'axe des abscisses et les droites $x = 1$ et $x = e$.',
          steps: [
            { tag: 'signe — ln(x) ≥ 0 sur [1 ; e]', text: 'aire $= \\int_1^e \\ln(x)dx$' },
            { tag: 'primitive par parties (section 1)', text: '$[x\\ln(x) - x]_1^e = (e - e) - (0 - 1)$' },
          ],
          result: { tag: 'résultat', text: 'aire $= 1$' },
        },
        {
          kind: 'piege',
          label: 'Piège central du chapitre',
          text:
            'Calculer directement $\\int_a^b f(x)dx$ (ou $\\int(f-g)$) sur l\'intervalle ENTIER ' +
            'quand le signe change (ou que les courbes se croisent) donne une valeur trop ' +
            'petite ! Les parties positives et négatives se compensent au lieu de s\'additionner en valeur absolue.',
        },
        {
          kind: 'astuce',
          label: 'Avant de calculer',
          text:
            'Esquisse rapidement le signe de f (ou de f−g) sur chaque sous-intervalle ' +
            '**avant** de poser l\'intégrale — décide où placer les valeurs absolues avant de calculer, jamais après coup.',
        },
        { kind: 'subheading', text: 'Aire délimitée par plus de deux courbes' },
        {
          kind: 'methode',
          label: 'Méthode',
          items: [
            'Une région peut être bordée par **plus de deux** courbes — ou, ce qui revient au ' +
              'même, la courbe qui joue le rôle de « majorant » peut **changer** au milieu de ' +
              'l\'intervalle. Repère alors les **points de bascule** (où deux des courbes ' +
              'bordantes se croisent), découpe l\'intervalle à cet endroit, puis choisis sur ' +
              'chaque morceau la bonne paire majorant/minorant — exactement comme tu découpais ' +
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
            'Ne découper qu\'aux zéros de f (comme pour une aire signée) ne suffit pas ici ! ' +
            'Il faut **aussi** découper là où la courbe majorante change, même si aucune des ' +
            'deux courbes ne s\'annule à cet endroit.',
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
                'Substitution $x=r\\sin(\\theta)$, $dx=r\\cos(\\theta)d\\theta$, et les bornes changent ' +
                '(section 3) : θ: 0→π/2 — ' +
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
          kind: 'historique',
          titre: 'Calculer une aire... 2000 ans avant l\'intégrale',
          text:
            "Bien avant l'invention du calcul intégral, le savant grec **Archimède** (3e " +
            'siècle avant J.-C.) calcule déjà des aires et des volumes avec une précision ' +
            'redoutable — dont celle du disque que tu viens de retrouver ci-dessus. Sa ' +
            'méthode, dite « d\'exhaustion », consiste à encadrer une figure courbe entre des ' +
            'polygones inscrits et circonscrits dont il augmente peu à peu le nombre de côtés ' +
            '— une idée étonnamment proche du découpage en rectangles que tu utilises ' +
            "aujourd'hui, mais sans les outils de l'analyse moderne (ni limite, ni notation " +
            'symbolique) : chaque calcul demandait des pages entières de raisonnement ' +
            'géométrique pur. Un traité où il applique cette méthode, La Méthode, a été ' +
            'considéré perdu pendant des siècles avant d\'être redécouvert en 1906, effacé ' +
            'sous un texte religieux du 13e siècle (un palimpseste) — une véritable archive ' +
            'du raisonnement mathématique antique, retrouvée presque par hasard.',
          image: {
            src: '/images/historique/archimedes.jpg',
            alt: 'Archimède pensif, peinture de Domenico Fetti',
            caption:
              'Archimède pensif, par Domenico Fetti, 1620 (représentation posthume : aucun ' +
              "portrait contemporain d'Archimède n'existe).",
          },
        },
        {
          kind: 'entrainement',
          title: 'Calcul d\'aires par intégrale',
          generatorId: '6gen26',
          description: [
            'Calcule l\'aire sous une courbe (découpe aux racines si le signe change) ou ' +
              'entre deux courbes (découpe à leurs intersections).',
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
        { kind: 'video', title: 'Volumes de révolution (1/2) : disques et cône', youtubeId: '-zG5OaZNCXQ' },
        { kind: 'video', title: 'Volumes de révolution (2/2) : rondelles et tronc de cône', youtubeId: '6KvZkBicCXQ' },
        {
          kind: 'para',
          text:
            'Fais tourner une région du plan autour de l\'axe des abscisses : tu engendres un ' +
            'solide en trois dimensions ! Deux méthodes, selon que la région est bordée par ' +
            'une seule courbe ou par deux.',
        },
        {
          kind: 'astuce',
          label: 'Le principe général derrière la formule des disques',
          text:
            'Plus généralement, pour un solide compris entre les plans z=a et z=b, si S(t) ' +
            'désigne l\'aire de la section du solide par le plan z=t, son volume vaut ' +
            '$V=\\int_a^b S(t)dt$ — le volume est la « somme » (l\'intégrale) des aires de ' +
            'toutes les tranches infiniment fines qui le composent. Pour un solide de ' +
            'révolution, chaque tranche est un disque d\'aire $S(x)=\\pi[f(x)]^2$ : c\'est ' +
            'exactement la formule ci-dessous.',
        },
        {
          kind: 'definition',
          label: 'Méthode des disques',
          items: [
            'Rotation, autour de l\'axe des abscisses, de la région sous f sur [a;b] (avec f ≥ 0) :',
            '$V = \\pi \\int_a^b [f(x)]^2 dx$',
            'La formule reste valable si f change de signe sur [a;b] : le carré $[f(x)]^2$ rend le signe ' +
              'sans effet — la partie de la région située sous l\'axe engendre le même solide que sa ' +
              'symétrique au-dessus. On parle alors de la région comprise entre la courbe et l\'axe.',
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
          kind: 'astuce',
          label: 'Le cône, retrouvé',
          text:
            'Ce solide est un cône de rayon 3 et de hauteur 3. En général, $f(x) = \\dfrac{r}{h}x$ sur ' +
            '$[0;h]$ donne $V = \\pi\\dfrac{r^2}{h^2}\\cdot\\dfrac{h^3}{3} = \\dfrac{\\pi r^2 h}{3}$ — la formule de ' +
            'géométrie. Ici, $\\dfrac{\\pi\\cdot 9\\cdot 3}{3} = 9\\pi$.',
        },
        {
          kind: 'exemple',
          badge: 'la boule',
          formula: 'Démontre que le volume d\'une boule de rayon r vaut $\\dfrac{4}{3}\\pi r^3$.',
          steps: [
            { tag: 'la boule naît de la rotation d\'un demi-disque', text: '$f(x) = \\sqrt{r^2 - x^2}$ sur $[-r;r]$, donc $[f(x)]^2 = r^2 - x^2$' },
            { tag: 'méthode des disques', text: '$V = \\pi\\int_{-r}^{r}\\left(r^2 - x^2\\right)dx = \\pi\\left[r^2x - \\dfrac{x^3}{3}\\right]_{-r}^{r} = \\pi\\left(2r^3 - \\dfrac{2r^3}{3}\\right)$' },
          ],
          result: { tag: 'résultat', text: '$V = \\dfrac{4}{3}\\pi r^3$' },
        },
        {
          kind: 'exemple',
          badge: 'un paraboloïde',
          formula: 'Calcule le volume engendré par la rotation de $f(x) = \\sqrt{x}$ sur $[0;4]$ autour de l\'axe des abscisses.',
          steps: [
            { tag: 'le carré fait disparaître la racine', text: '$V = \\pi\\int_0^4 x\\,dx = \\pi\\left[\\dfrac{x^2}{2}\\right]_0^4$' },
          ],
          result: { tag: 'résultat', text: '$V = 8\\pi$ — la forme d\'une antenne parabolique ou d\'un phare.' },
        },
        {
          kind: 'atelier',
          tag: 'solide-revolution-widget',
          label: 'Manipule toi-même — fais tourner la région',
          caption:
            'Fais tourner la région autour de l\'axe des abscisses : chaque tranche ' +
            'verticale devient un disque de rayon f(x), ou une rondelle quand la région est ' +
            'bordée par deux courbes. Déplace x pour voir l\'aire de la tranche, π·f(x)² ou ' +
            'π(f² − g²) : le volume est la somme de toutes ces tranches. Les préréglages ' +
            'retrouvent le cône (πr²h/3) et la boule (4/3·πr³).',
        },
        {
          kind: 'historique',
          titre: 'Kepler, son mariage et les tonneaux de vin',
          text:
            'En 1613, **Johannes Kepler** achète du vin pour son mariage. Il s\'étonne que le marchand ' +
            'mesure le volume de chaque tonneau avec une simple baguette plongée en diagonale par la ' +
            'bonde. Intrigué, il publie en 1615 la « Nouvelle stéréométrie des tonneaux de vin », où il ' +
            'calcule des volumes de solides de révolution en les découpant en une infinité de tranches ' +
            'très fines — l\'idée même de la méthode des disques, un demi-siècle avant Newton et Leibniz.',
        },
        {
          kind: 'application',
          titre: 'Calculer le volume d\'une pièce tournée sur un tour',
          image: {
            src: '/images/application/tour-bois.jpg',
            alt: 'Artisan tournant une pièce de bois sur un tour, Gujarat',
            caption: 'Tournage sur bois, Gujarat (Inde), vers 1870. Domaine public (CC0), via Wikimedia Commons / Getty Museum.',
          },
          illustrations: [
            {
              kind: 'solidRevolution',
              variant: 'cone',
              outerRadius: 3,
              startLabel: 'base',
              endLabel: 'sommet',
              midLabel: 'pied de table conique',
              caption: 'Un pied de table tourné sur un profil f(x)=x : le solide plein, obtenu par la méthode des disques.',
            },
            {
              kind: 'solidRevolution',
              variant: 'washer',
              outerRadius: 3,
              startLabel: 'base',
              endLabel: 'bord',
              midLabel: 'vase évidé',
              caption: 'Un vase évidé (paroi intérieure creusée) : profil extérieur f(x) ET intérieur g(x) — la méthode des rondelles.',
            },
          ],
          text:
            'Un tour (la machine, pas l\'unité de rotation) fabrique des pièces en faisant ' +
            'tourner un bloc de matière autour d\'un axe pendant qu\'un outil en retire la ' +
            'matière selon un profil précis — un pied de table, une pièce de moteur, un vase ' +
            'en bois. Ce profil, c\'est exactement une courbe $f(x)$ : la pièce finale est ' +
            'donc littéralement un solide de révolution, et son volume (pour calculer la ' +
            'quantité de matière utilisée, ou son poids) se calcule avec la méthode des ' +
            'disques que tu viens de voir, $V=\\pi\\int_a^b[f(x)]^2dx$. Quand le profil creuse ' +
            'la pièce (un tube, un pot évidé), c\'est la méthode des rondelles — avec un ' +
            'profil extérieur ET un profil intérieur — qui s\'applique directement.',
          domaines: ['Ingénierie', 'Fabrication'],
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
            '$V = \\pi\\int[f(x)-g(x)]^2 dx$ est **faux** ! Il faut soustraire les CARRÉS ' +
            '($[f]^2-[g]^2$), pas élever la DIFFÉRENCE au carré — ces deux expressions ne sont pas égales en général.',
        },
        {
          kind: 'astuce',
          label: 'Avant de poser la formule',
          text:
            'Identifie d\'abord : « disque plein » (une seule courbe, jusqu\'à l\'axe) ou ' +
            '« rondelle » (deux courbes, un trou) ? Le carré (ou la différence de carrés) à ' +
            'utiliser se lit ensuite directement.',
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
                'Après développement et intégration terme à terme (mêmes techniques que la ' +
                'section 1), tu retrouves exactement la formule connue depuis la géométrie de ' +
                'l\'espace : $V = \\dfrac{\\pi h}{3}(a^2+ab+b^2)$.',
            },
          ],
        },
        {
          kind: 'entrainement',
          title: 'Volumes de révolution',
          generatorId: '6gen27',
          description: [
            'Calcule un volume de révolution par la méthode des disques (une courbe) ou des ' +
              'rondelles (deux courbes) — identifie d\'abord le bon modèle.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 27. Volumes de révolution »',
        },
        {
          kind: 'methode',
          label: 'Contenance d\'un objet de révolution (verre, vase, tonneau…)',
          items: [
            '**Modèle** — la contenance est le volume de l\'**intérieur** : méthode des disques avec le ' +
              'profil **intérieur** f (rayon intérieur à la position x). Des rondelles entre le profil ' +
              'extérieur et f donneraient le volume de la paroi, pas la contenance.',
            '**Bornes** — elles se lisent sur les cotes, avec l\'origine choisie pour x : on retire ce qui ' +
              'ne contient pas de liquide (pied, épaisseur du fond, bouchon) ; si x part du milieu de ' +
              'l\'objet, les bornes sont symétriques ($-H$ et $H$). Une cote Ø est un **diamètre** : le ' +
              'rayon en est la moitié.',
            '**Unités** — avec des cm, $V = \\pi\\int_a^b [f(x)]^2 dx$ est en cm³ ; ' +
              '$1$ L $= 1$ dm³ $= 1\\,000$ cm³ et $1$ cL $= 10$ cm³.',
            '**Hauteur de liquide** — pour une quantité $V_0$ versée, on résout ' +
              '$\\pi\\int_a^t [f(x)]^2 dx = V_0$ : l\'inconnue est la borne supérieure t.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Contenance d\'objets de révolution',
          generatorId: '6gen83',
          description: [
            'Calcule la contenance d\'un verre, d\'un vase, d\'un tonneau, d\'un flacon ou d\'un pot ' +
              'à partir de son profil, convertis-la en litres, puis réponds à une question de ' +
              'transfert (hauteur du liquide, nombre de récipients, comparaison).',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 83. Contenance d\'objets de révolution »',
        },
      ],
    },
    {
      id: 'longueurarc',
      number: 6,
      title: 'Longueur d\'un arc de courbe',
      kicker: 'L = ∫√(1+[f\'(x)]²)dx',
      blocks: [
        { kind: 'video', title: 'Longueur d\'un arc de courbe', youtubeId: 'xFPokTBlOU8' },
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
          kind: 'atelier',
          tag: 'longueur-polygonale-widget',
          label: 'Manipule toi-même — mesurer une courbe avec des segments',
          caption:
            'Remplace l\'arc par n segments : chacun mesure √(dx² + dy²), par Pythagore. Une ' +
            'corde est toujours plus courte que l\'arc, donc la somme reste sous L et s\'en ' +
            'rapproche quand n grandit — c\'est l\'idée de la formule L = ∫√(1 + f′²) dx. ' +
            'Pour y = x², aucune primitive au programme ne donne L : on l\'approche ' +
            'numériquement.',
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
            {
              kind: 'para',
              text:
                'C\'est la longueur d\'une chaîne suspendue : la courbe de ch est une chaînette ' +
                '(chapitre 3).',
            },
          ],
        },
        {
          kind: 'piege',
          text:
            'Oublier le « 1+ » ou la racine carrée elle-même sous l\'intégrale — les deux sont ' +
            'TOUJOURS là, quelle que soit la fonction f ! Le signe de f\'(x) n\'a lui aucune ' +
            'incidence : il est élevé au carré.',
        },
        {
          kind: 'exemple',
          badge: 'quand aucune primitive n\'est connue : y = x²',
          formula: 'Approche la longueur de l\'arc de $y = x^2$ sur $[0;1]$.',
          steps: [
            { tag: 'formule', text: '$L = \\int_0^1 \\sqrt{1 + 4x^2}\\,dx$ — aucune primitive de cette racine n\'est au programme' },
            { tag: 'trapèzes, 4 sous-intervalles (section 3)', text: '$L \\approx \\dfrac{0{,}25}{2}\\left[1 + \\sqrt{5} + 2\\left(\\sqrt{1{,}25} + \\sqrt{2} + \\sqrt{3{,}25}\\right)\\right] \\approx 1{,}488$' },
          ],
          result: { tag: 'résultat', text: '$L \\approx 1{,}49$ (valeur précise : 1,4789…) — la plupart des longueurs d\'arc se calculent ainsi.' },
        },
        {
          kind: 'historique',
          titre: 'Mesurer une courbe : « impossible », disait Descartes',
          text:
            'Dans sa Géométrie (1637), **René Descartes** affirme que le rapport entre une ligne courbe et ' +
            'une droite n\'est pas connu, « et même ne le peut être par les hommes ». Vingt ans plus tard, ' +
            'l\'Anglais William Neil (1657) puis le Néerlandais Hendrik van Heuraet (1659) calculent ' +
            'exactement la longueur d\'un arc de la parabole semi-cubique — la courbe ' +
            '$y = \\dfrac{2}{3}x^{3/2}$ de l\'exemple résolu ci-dessus, à un facteur près.',
        },
        {
          kind: 'astuce',
          label: 'Repérer un carré parfait avant d\'intégrer',
          text:
            'Certaines fonctions sont construites (ou apparaissent naturellement, comme ch) ' +
            'pour que $1+[f\'(x)]^2$ soit un carré parfait. Repère-le AVANT d\'intégrer : ça ' +
            't\'évite une intégrale bien plus compliquée sous une racine irréductible.',
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
            'Calcule la longueur d\'un arc de courbe par la formule ∫√(1+[f\'(x)]²)dx — repère ' +
              'si besoin un carré parfait sous la racine.',
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
        { kind: 'video', title: 'Intégrales et primitives : problèmes', youtubeId: 'piBkKOuDwWs' },
        {
          kind: 'para',
          text:
            'Un problème contextualisé (cinématique, économie, géométrie...) réutilise ' +
            '**exactement** les mêmes techniques de primitivation que les exercices « ' +
            'abstraits » — seule l\'interprétation du résultat change !',
        },
        {
          kind: 'intuition',
          label: 'Le pont avec les dérivées',
          text:
            'Au chapitre des dérivées (5e), tu as vu que dériver une position donne une ' +
            "vitesse instantanée : ça « défait » un mouvement pour n'en garder que le rythme, " +
            'à chaque instant. **Intégrer fait exactement le chemin inverse** : à partir de la ' +
            "vitesse, tu « refais » le trajet complet — la position, étape par étape.",
        },
        {
          kind: 'definition',
          label: 'Cinématique — accélération, vitesse, position',
          items: [
            'Si a(t) est l\'accélération d\'un mobile, v(t) (la vitesse) est une primitive ' +
              'de a, fixée par une condition v(t₀). De même, x(t) (la position) est une ' +
              'primitive de v, fixée par une condition x(t₀) — **indépendante** de la précédente.',
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
            'Réutiliser la **même** constante pour v(t) et x(t) ! Chaque intégration introduit ' +
            'sa PROPRE constante, déterminée par SA PROPRE condition initiale — jamais partagée entre les deux étapes.',
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — déplacement ou distance parcourue ?',
          blocks: [
            {
              kind: 'para',
              text:
                'Un mobile se déplace sur une droite avec la vitesse $v(t) = t^2 - 4t + 3 = (t-1)(t-3)$ ' +
                '(en m/s), pour t entre 0 et 3 s. Calcule son déplacement et la distance parcourue.',
            },
            {
              kind: 'para',
              text:
                '**Déplacement** : $\\int_0^3 v(t)dt = \\left[\\dfrac{t^3}{3} - 2t^2 + 3t\\right]_0^3 = 9 - 18 + 9 = 0$ — ' +
                'le mobile revient à son point de départ.',
            },
            {
              kind: 'para',
              text:
                '**Distance** : v est positive sur $[0;1[$ (il avance) et négative sur $]1;3[$ (il recule). ' +
                '$\\int_0^1 v(t)dt = \\dfrac{4}{3}$ et $\\int_1^3 v(t)dt = -\\dfrac{4}{3}$, donc la distance vaut ' +
                '$\\dfrac{4}{3} + \\dfrac{4}{3} = \\dfrac{8}{3} \\approx 2{,}67$ m.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Déplacement ≠ distance',
          text:
            'Le **déplacement** vaut $\\int_a^b v(t)dt$ ; la **distance parcourue** vaut $\\int_a^b |v(t)|dt$. ' +
            'Dès que v change de signe, découpe aux instants où elle s\'annule — exactement comme pour une ' +
            'aire (section 4).',
        },
        {
          kind: 'atelier',
          tag: 'distance-deplacement-widget',
          label: 'Manipule toi-même — déplacement ou distance ?',
          caption:
            'Fais avancer le temps : quand v(t) est positive, la voiture avance ; quand ' +
            'elle est négative, elle recule. Le déplacement ∫v peut diminuer, et même ' +
            'revenir à 0, mais la distance parcourue ∫|v| ne fait qu\'augmenter : les deux ' +
            'compteurs se séparent dès que v change de signe. Le premier préréglage est ' +
            'l\'exemple ci-dessus.',
        },
        {
          kind: 'exemple',
          badge: 'trapèzes sur des relevés',
          formula:
            'La vitesse d\'une voiture est relevée toutes les 10 s : 0 ; 8 ; 13 ; 15 ; 16 m/s (de t = 0 à ' +
            't = 40 s). Estime la distance parcourue.',
          steps: [
            { tag: 'aucune formule de v : méthode des trapèzes, Δt = 10', text: '$d \\approx \\dfrac{10}{2}\\left[0 + 16 + 2(8 + 13 + 15)\\right] = 5\\times 88$' },
          ],
          result: { tag: 'résultat', text: '$d \\approx 440$ m' },
        },
        {
          kind: 'exemple',
          badge: 'débit et volume',
          formula:
            'Une piscine se remplit avec un débit $d(t) = 12 - 0{,}1t$ (en m³/h, t en heures). Quel volume ' +
            'd\'eau entre en 10 heures ?',
          steps: [
            { tag: 'le volume accumule le débit', text: '$V = \\int_0^{10}(12 - 0{,}1t)dt = \\left[12t - 0{,}05t^2\\right]_0^{10} = 120 - 5$' },
          ],
          result: { tag: 'résultat', text: '$V = 115$ m³' },
        },
        {
          kind: 'exemple',
          badge: 'volume par soustraction : un bol',
          formula:
            'Un bol a la forme d\'une demi-boule de rayon extérieur 5 cm, creusée d\'une demi-boule de ' +
            'rayon 4 cm. Quel volume de matière contient-il ?',
          steps: [
            { tag: 'volume d\'une demi-boule (section 5)', text: '$\\dfrac{1}{2}\\cdot\\dfrac{4}{3}\\pi r^3 = \\dfrac{2}{3}\\pi r^3$' },
            { tag: 'volume total moins cavité', text: '$V = \\dfrac{2}{3}\\pi\\left(5^3 - 4^3\\right) = \\dfrac{2}{3}\\pi\\times 61$' },
          ],
          result: { tag: 'résultat', text: '$V = \\dfrac{122\\pi}{3} \\approx 127{,}8$ cm³' },
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
            'Face à un problème contextualisé, identifie d\'abord QUELLE technique du chapitre ' +
            's\'applique (primitive + condition initiale, aire, volume, valeur moyenne...) — le ' +
            'contexte ne change jamais la technique, seulement le sens du résultat final.',
        },
        {
          kind: 'methode',
          label: 'Accumuler une grandeur à partir de son taux',
          items: [
            'La quantité à l\'instant T vaut la quantité initiale plus ce qui s\'est accumulé : ' +
              '$Q(T) = Q(0) + \\int_0^T r(t)\\,dt$, où r est le taux (débit, puissance, intensité de pluie, rythme...).',
            'Quand une grandeur entre ET sort, on intègre le taux **net** : $r(t) = e(t) - s(t)$ (entrée moins sortie).',
            'La quantité est maximale (ou minimale) quand le taux net s\'annule en changeant de signe : ' +
              'elle augmente tant que $r(t) > 0$ et diminue ensuite.',
            'Unités : unité du taux × unité du temps — L/min × min = L ; W × h = W·h ; mm/h × h = mm. ' +
              'Les bornes s\'expriment dans l\'unité de temps du taux.',
            'Conversions utiles : $1\\ \\text{m}^3 = 1000\\ \\text{L}$ ; $1\\ \\text{kW}\\cdot\\text{h} = 1000\\ \\text{W}\\cdot\\text{h}$ ; ' +
              '1 mm de pluie sur 1 m² donne 1 L d\'eau.',
          ],
        },
        {
          kind: 'entrainement',
          title: 'Intégrales et primitives : problèmes',
          generatorId: '6gen29',
          description: [
            'Résous un problème contextualisé (cinématique, économie, volume par ' +
              'soustraction) en identifiant d\'abord la technique du chapitre qui s\'applique.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 29. Intégrales et primitives : problèmes »',
        },
        {
          kind: 'entrainement',
          title: 'Le détective d\'erreurs : intégrales et primitives',
          generatorId: '6gen84',
          description: [
            'Une résolution rédigée par un élève contient une ligne fausse : primitive de f(ax + b), ' +
              'ln|x|, signe de la primitive de sin ou cos, aire sans découpe, volume sans π ou sans carré, ' +
              'bornes inversées, constante C. Trouve la ligne, nomme l\'erreur et corrige la résolution.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 84. Le détective d\'erreurs : intégrales et primitives »',
        },
        { kind: 'subheading', text: 'Pour aller plus loin — inégalités de revenus : courbe de Lorenz et coefficient de Gini' },
        {
          kind: 'para',
          text:
            'Classons les ménages d\'un pays du plus pauvre au plus riche. La **courbe de Lorenz** associe à la ' +
            'part $x$ des ménages les plus pauvres ($0 \\le x \\le 1$) la part $L(x)$ du revenu total qu\'ils se ' +
            'partagent. Par exemple, $L(0{,}5) = 0{,}2$ signifie que **les 50 % les plus pauvres se partagent 20 % ' +
            'du revenu total** — et non l\'inverse.',
        },
        {
          kind: 'definition',
          label: 'Courbe de Lorenz et coefficient de Gini',
          items: [
            'Une courbe de Lorenz vérifie $L(0) = 0$ et $L(1) = 1$ ; elle est croissante, convexe et reste sous ' +
              'la **diagonale** $y = x$, qui représente l\'**égalité parfaite** (chaque part de la population ' +
              'détient la même part des revenus).',
            'Le **coefficient de Gini** mesure l\'écart à l\'égalité : $G = 2\\int_0^1 (x - L(x))\\,dx$. C\'est l\'aire ' +
              'comprise entre la diagonale et la courbe, rapportée à l\'aire $\\dfrac{1}{2}$ du triangle sous la ' +
              'diagonale. Toujours $0 \\le G \\le 1$ : $G = 0$ pour l\'égalité parfaite, $G$ proche de 1 quand presque ' +
              'tout le revenu est concentré entre quelques mains.',
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x, tone: 'faint', xMin: 0, xMax: 1 },
              { fn: (x) => x * x, tone: 'accent', xMin: 0, xMax: 1 },
            ],
            xMin: -0.08,
            xMax: 1.12,
            xTicks: [0.5, 1],
            xTickLabels: { 0.5: '0,5', 1: '1' },
            yTicks: [0.5, 1],
            yTickLabels: { 0.5: '0,5', 1: '1' },
            fixedYRange: { min: -0.08, max: 1.12 },
            shadedRegions: [{ from: 0, to: 1, upper: (x) => x, lower: (x) => x * x, tone: 'accent' }],
            textLabels: [
              { x: 0.62, y: 0.8, text: 'y = x', tone: 'faint', anchor: 'end' },
              { x: 0.86, y: 0.5, text: 'L(x) = x²', tone: 'accent', anchor: 'start' },
              { x: 0.52, y: 0.4, text: 'aire 1/6', tone: 'ink', anchor: 'middle' },
            ],
            xAxisLabel: 'part de la population',
            yAxisLabel: 'part des revenus',
            caption:
              'Pour $L(x) = x^2$ : l\'aire entre la diagonale et la courbe vaut $\\int_0^1 (x - x^2)\\,dx = \\dfrac{1}{6}$, ' +
              'donc $G = 2 \\cdot \\dfrac{1}{6} = \\dfrac{1}{3}$.',
          },
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — coefficient de Gini d\'un pays fictif',
          blocks: [
            {
              kind: 'para',
              text:
                'En Valdorie, la courbe de Lorenz des revenus est modélisée par $L(x) = 0{,}6x^2 + 0{,}4x$. ' +
                'Interprète $L(0{,}5)$, puis calcule le coefficient de Gini.',
            },
            {
              kind: 'para',
              text:
                '**Lecture** : $L(0{,}5) = 0{,}6 \\cdot 0{,}25 + 0{,}4 \\cdot 0{,}5 = 0{,}35$ — les 50 % des ménages ' +
                'les plus pauvres se partagent 35 % du revenu total.',
            },
            {
              kind: 'para',
              text:
                '**Aire** : $x - L(x) = 0{,}6\\left(x - x^2\\right)$, donc $\\int_0^1 (x - L(x))\\,dx = ' +
                '0{,}6\\left[\\dfrac{x^2}{2} - \\dfrac{x^3}{3}\\right]_0^1 = 0{,}6 \\cdot \\dfrac{1}{6} = 0{,}1$',
            },
            { kind: 'para', text: '**Gini** : $G = 2 \\cdot 0{,}1 = 0{,}2$ — une répartition assez peu inégalitaire.' },
          ],
        },
        {
          kind: 'piege',
          text:
            'Trois erreurs classiques : intégrer $L$ au lieu de $x - L(x)$ (on obtient l\'aire **sous** la courbe), ' +
            'oublier le facteur 2, et lire $L(0{,}5)$ à l\'envers ($0{,}5$ est une part de la **population**, ' +
            '$L(0{,}5)$ une part des **revenus**). Un coefficient de Gini négatif ou supérieur à 1 signale toujours une erreur.',
        },
        {
          kind: 'entrainement',
          title: 'Inégalités de revenus : courbe de Lorenz et coefficient de Gini',
          generatorId: '6gen82',
          description: [
            'Lis et interprète une courbe de Lorenz, calcule l\'aire entre la diagonale et la courbe puis le ' +
              'coefficient de Gini ; compare deux pays ou l\'effet d\'une réforme fiscale.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 82. Inégalités de revenus : courbe de Lorenz et coefficient de Gini »',
        },
        {
          kind: 'entrainement',
          title: 'Accumuler une grandeur : débits, puissances, consommations',
          generatorId: '6gen80',
          description: [
            'Cuve qui se remplit et se vide, panneaux solaires, pluie sur un toit, salle qui se ' +
              'remplit, émissions de CO₂ : choisis ce qu\'il faut intégrer, calcule la quantité ' +
              'accumulée, réponds à une question de transfert (instant, comparaison) et donne le ' +
              'résultat dans l\'unité demandée.',
          ],
          chantier: '6e-6h',
          whereLabel: '6e (6h) → « 80. Accumuler une grandeur : débits, puissances, consommations »',
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Primitives usuelles',
        formulas: [
          { text: '$\\int x^n dx = \\dfrac{x^{n+1}}{n+1} + C$', condition: '$n \\neq -1$' },
          { text: '$\\int \\dfrac{1}{x} dx = \\ln|x| + C$', condition: 'constante propre à chaque intervalle de ℝ₀' },
          { text: '$\\int \\ln(x) dx = x\\ln(x) - x + C \\qquad \\int \\dfrac{1}{\\cos^2(x)} dx = \\tan(x) + C$' },
          {
            text: '$\\int e^x dx = e^x + C \\qquad \\int e^{kx} dx = \\dfrac{1}{k}e^{kx} + C$',
            condition: '$k \\neq 0$ pour la seconde',
          },
          { text: '$\\int \\cos(x) dx = \\sin(x) + C \\qquad \\int \\sin(x) dx = -\\cos(x) + C$' },
          {
            text:
              '$\\int \\dfrac{1}{1+x^2} dx = \\arctan(x) + C \\qquad ' +
              '\\int \\dfrac{1}{\\sqrt{1-x^2}} dx = \\arcsin(x) + C$',
          },
        ],
      },
      {
        title: 'Techniques de primitivation',
        formulas: [
          {
            text:
              '$u\'e^u \\to e^u + C \\qquad \\dfrac{u\'}{u} \\to \\ln|u| + C \\qquad ' +
              'u\'u^n \\to \\dfrac{u^{n+1}}{n+1} + C$',
            condition: 'reconnaître la forme u\'·f(u)',
          },
          { text: '$\\int f(x) \\cdot g\'(x) dx = f(x) \\cdot g(x) - \\int f\'(x) \\cdot g(x) dx$', condition: 'intégration par parties' },
          { text: '$\\int \\big(k f(x) + g(x)\\big)dx = k\\int f(x)dx + \\int g(x)dx$', condition: 'linéarité' },
          { text: '$\\int f(ax+b)dx = \\dfrac{1}{a}F(ax+b) + C$', condition: '$a \\neq 0$, F primitive de f' },
        ],
      },
      {
        title: 'Primitive particulière',
        formulas: [
          { text: 'primitive générale : $F(x) + C$', condition: 'C ∈ ℝ — une infinité de primitives' },
          { text: 'condition initiale : résoudre $F(x_0) + C = y_0$ en $C$' },
        ],
      },
      {
        title: 'Intégrale définie',
        formulas: [
          { text: '$\\int_a^b f(x) dx = F(b) - F(a)$', condition: 'théorème fondamental — F primitive quelconque de f' },
          { text: '$\\int_a^a f(x) dx = 0 \\qquad \\int_a^b f(x) dx = -\\int_b^a f(x) dx$' },
          { text: '$\\int_a^b f(x) dx = \\int_a^c f(x) dx + \\int_c^b f(x) dx$', condition: 'additivité' },
          { text: '$A(x) = \\int_a^x f(t)dt \\implies A\'(x) = f(x)$', condition: 'fonction aire — f continue' },
          { text: '$\\int_{-a}^{a} f = 0$ si f impaire $\\qquad \\int_{-a}^{a} f = 2\\int_0^a f$ si f paire' },
          {
            text:
              '$\\int_a^b f(x) dx \\approx \\dfrac{\\Delta x}{2}[f(x_0)+f(x_n)+2(f(x_1)+\\ldots+f(x_{n-1}))]$',
            condition: 'méthode des trapèzes',
          },
          { text: 'valeur moyenne $= \\dfrac{1}{b-a}\\int_a^b f(x) dx$' },
        ],
      },
      {
        title: 'Calcul d\'aires',
        formulas: [
          { text: 'aire $= \\int_a^b f(x) dx$', condition: 'si $f \\ge 0$ sur $[a;b]$' },
          { text: 'aire $= -\\int_a^b f(x) dx$', condition: 'si $f \\le 0$ — sinon, découper aux racines' },
          { text: 'aire entre deux courbes $= \\int_a^b (f(x)-g(x)) dx$', condition: '$f(x) \\ge g(x)$ sur $[a;b]$' },
        ],
      },
      {
        title: 'Volumes et longueur d\'arc',
        formulas: [
          { text: '$V = \\pi \\int_a^b [f(x)]^2 dx$', condition: 'méthode des disques' },
          { text: '$V = \\pi \\int_a^b ([f(x)]^2 - [g(x)]^2) dx$', condition: 'méthode des rondelles — $f \\ge g \\ge 0$' },
          { text: '$V_{\\text{boule}} = \\dfrac{4}{3}\\pi r^3 \\qquad V_{\\text{cône}} = \\dfrac{\\pi r^2 h}{3}$', condition: 'retrouvés par la méthode des disques' },
          { text: '$L = \\int_a^b \\sqrt{1+[f\'(x)]^2} dx$' },
        ],
      },
    ],
  },

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
        ['Déplacement / distance', '∫v(t)dt / ∫|v(t)|dt'],
      ],
    },
    checklist: {
      label: 'Astuce — avant de rendre ta copie',
      items: [
        'Ai-je écrit + C pour une primitive générale, et vérifié ma primitive en la dérivant ?',
        'Pour f(ax + b), ai-je divisé par a ? Pour une substitution dans une intégrale définie, ai-je changé les bornes ?',
        'Pour une aire, ai-je découpé aux racines (ou aux intersections) et sommé des valeurs absolues ?',
        'Pour un volume par rondelles, ai-je soustrait les carrés ([f]² − [g]²) et non élevé la différence au carré ?',
        'En cinématique, ai-je distingué déplacement (∫v) et distance parcourue (∫|v|) ?',
      ],
    },
    forward:
      'Un seul théorème — $\\int_a^b f(x)dx = F(b)-F(a)$, démontré grâce à la fonction aire — porte ' +
      'toutes les applications de ce chapitre : aires, volumes, longueurs, valeur moyenne, ' +
      'cinématique. Tu le retrouveras au chapitre 8 : une probabilité y devient une aire sous une ' +
      'courbe de densité.',
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
