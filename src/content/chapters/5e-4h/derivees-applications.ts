import type { ChapterContent } from '../../types'

export const deriveesApplications: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 5,
  title: 'Dérivées et applications',
  slug: 'derivees-applications',
  lede:
    "La dérivée d'une fonction en un point mesure sa pente instantanée — la vitesse exacte à " +
    "laquelle elle varie à cet endroit précis, prolongement direct des limites du chapitre " +
    "précédent (la dérivée EST une limite). Ce chapitre construit cette notion depuis sa " +
    "définition (taux d'accroissement dont on prend la limite), l'utilise pour tracer une " +
    "tangente, établit ensuite les règles de calcul d'une fonction dérivée, puis étudie " +
    "localement les variations et les extremums d'une fonction, mène une étude complète " +
    "(domaine, dérivée, limites, asymptotes), lit directement un graphique sans calcul, avant " +
    "de l'appliquer à l'optimisation géométrique, à l'économie et à la cinématique.",

  sections: [
    {
      id: 'definition-derivee',
      number: 1,
      title: "Calculer f'(a) par la définition",
      kicker: "taux d'accroissement, limite quand h→0, interprétation géométrique (pente de la tangente)",
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — définition du nombre dérivé',
          items: [
            'Le **taux d\'accroissement** de f entre a et a+h est $\\dfrac{f(a+h)-f(a)}{h}$ — ' +
              'la pente de la **sécante** qui relie les points (a;f(a)) et (a+h;f(a+h)). Le ' +
              '**nombre dérivé** f\'(a) est la **limite** de ce taux quand h se rapproche de 0 ' +
              '(chapitre précédent) : $f\'(a) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(a+h)-f(a)}{h}$.',
          ],
        },
        {
          kind: 'para',
          text:
            'Géométriquement, quand h se rapproche de 0, le point (a+h;f(a+h)) glisse le long de ' +
            'la courbe vers (a;f(a)) : la **sécante** pivote progressivement jusqu\'à devenir la ' +
            '**tangente** en a — sa pente limite est exactement f\'(a).',
        },
        {
          kind: 'exemple',
          badge: 'f\'(a) par la définition, sur une fonction quadratique',
          formula: '$f(x) = x^2-3$, a = 2. Calcule f\'(2) par la définition.',
          steps: [
            { tag: 'f(2)', text: '$f(2) = 4-3 = 1$' },
            { tag: 'développer f(2+h)', text: '$f(2+h) = (2+h)^2-3 = 4+4h+h^2-3 = 1+4h+h^2$' },
            {
              tag: 'taux d\'accroissement, simplifié au maximum',
              text: '$\\dfrac{f(2+h)-f(2)}{h} = \\dfrac{(1+4h+h^2)-1}{h} = \\dfrac{4h+h^2}{h} = 4+h$ (valable pour h≠0)',
            },
          ],
          result: { tag: 'passer à la limite', text: '$f\'(2) = \\displaystyle\\lim_{h \\to 0} (4+h) = 4$' },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x, tone: 'accent' },
              { fn: (x) => 1 + 4 * (x - 1), tone: 'faint', xMin: 1, xMax: 3.3 },
              { fn: (x) => 1 + 2.5 * (x - 1), tone: 'faint', xMin: 1, xMax: 1.9 },
              { fn: (x) => 1 + 2 * (x - 1), tone: 'good', xMin: 0.3, xMax: 3.4 },
            ],
            xMin: -0.3,
            xMax: 3.4,
            xTicks: [1],
            fixedYRange: { min: -0.5, max: 10 },
            points: [{ x: 1, y: 1, label: 'A(1;1)', tone: 'accent', labelPos: 'below' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x² — les sécantes en h=2 puis h=0,5 ont pour pente 4 puis 2,5 : elles se rapprochent de la tangente en A, de pente f\'(1)=2',
          },
        },
        {
          kind: 'methode',
          label: 'Le squelette, valable pour toute fonction',
          items: [
            'Calculer f(a) et développer f(a+h) (en fonction de h).',
            'Former le taux d\'accroissement $\\dfrac{f(a+h)-f(a)}{h}$ et le simplifier au ' +
              'maximum — le facteur h du dénominateur doit toujours pouvoir se simplifier ' +
              '(sinon la limite n\'est pas directement calculable).',
            'Passer à la limite quand h→0 sur l\'expression SIMPLIFIÉE : f\'(a).',
          ],
        },
        {
          kind: 'attention',
          label: 'Ne jamais remplacer h par 0 AVANT d\'avoir simplifié',
          text:
            'Le taux d\'accroissement brut $\\dfrac{f(a+h)-f(a)}{h}$ vaut toujours 0/0 en h=0 ' +
            '(forme indéterminée, comme au chapitre précédent) — c\'est exactement pourquoi il ' +
            'faut d\'abord SIMPLIFIER par h (factorisation, ou technique du conjugué pour une ' +
            'racine) avant de faire tendre h vers 0, jamais l\'inverse.',
        },
        {
          kind: 'astuce',
          label: 'La définition marche pour toute fonction, même sans racine',
          text:
            'Pour $f(x)=\\sqrt{x}$, le taux d\'accroissement se simplifie par l\'expression ' +
            'conjuguée (comme au chapitre précédent, forme ∞−∞ ou 0/0 selon l\'écriture) — la ' +
            'méthode générale ne change jamais, seule la technique de simplification s\'adapte ' +
            'à la forme de f.',
        },
        {
          kind: 'entrainement',
          title: 'Calculer f\'(a) par la définition',
          generatorId: '5gen26',
          description: [
            'Développe f(a+h), simplifie le taux d\'accroissement, puis calcule f\'(a) en ' +
              'passant à la limite — sur des fonctions affines, quadratiques et rationnelles.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 26. Calculer f\'(a) par la définition »',
        },
      ],
    },
    {
      id: 'tangentes',
      number: 2,
      title: 'Tangentes',
      kicker: 'y=f(a)+f\'(a)(x−a) ; tangente horizontale ⟺ f\'(a)=0 ; tangente vs sécante',
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — équation de la tangente en un point',
          items: [
            'La tangente à la courbe de f au point d\'abscisse a est la droite qui passe par ' +
              '(a;f(a)) avec pour pente f\'(a) — sa pente EST le nombre dérivé, par définition ' +
              'même de f\'(a) (section 1) : $y = f(a) + f\'(a)(x-a)$.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'équation de la tangente en un point donné',
          formula: '$f(x) = x^2-2x+1$, a=3. Détermine l\'équation de la tangente en x=3.',
          steps: [
            { tag: 'f(3)', text: 'f(3) = 9−6+1 = 4' },
            { tag: 'f\'(x) puis f\'(3)', text: 'f\'(x) = 2x−2 ⟹ f\'(3) = 6−2 = 4' },
            { tag: 'substituer dans y=f(a)+f\'(a)(x−a)', text: 'y = 4 + 4(x−3) = 4 + 4x − 12' },
          ],
          result: { tag: 'équation simplifiée', text: 'y = 4x − 8' },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) * (x - 1), tone: 'accent' },
              { fn: (x) => 4 + 4 * (x - 3), tone: 'good', xMin: 1.6, xMax: 4.5 },
              { fn: () => 0, tone: 'good', xMin: 0.5, xMax: 1.5 },
            ],
            xMin: -0.5,
            xMax: 4.5,
            xTicks: [3],
            fixedYRange: { min: -1, max: 11 },
            points: [
              { x: 3, y: 4, label: 'a=3 : (3;4)', tone: 'accent', labelPos: 'above' },
              { x: 1, y: 0, label: 'a=1 : tangente horizontale', tone: 'good', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=(x−1)² — tangente oblique au point (3;4) de pente f\'(3)=4, et tangente horizontale au point (1;0) de pente f\'(1)=0',
          },
        },
        {
          kind: 'methode',
          label: 'Tangente horizontale',
          items: [
            'Une tangente est **horizontale** exactement quand sa pente est nulle, c\'est-à-dire ' +
              'f\'(a) = 0. Avec le même f(x)=x²−2x+1 : f\'(x)=2x−2=0 ⟺ x=1, et f(1)=1−2+1=0 — la ' +
              'tangente en x=1 est donc la droite y=0 (l\'axe des abscisses lui-même).',
          ],
        },
        {
          kind: 'attention',
          label: 'Tangente ≠ sécante',
          text:
            'Une **sécante** relie DEUX points distincts de la courbe (a;f(a)) et (b;f(b)), de ' +
            'pente $\\dfrac{f(b)-f(a)}{b-a}$ — c\'est le taux d\'accroissement de la section 1. ' +
            'Une **tangente** ne touche la courbe qu\'EN UN SEUL point (localement), de pente ' +
            'f\'(a) — c\'est la LIMITE de la sécante quand b se rapproche de a, jamais une ' +
            'sécante elle-même.',
        },
        {
          kind: 'astuce',
          label: 'Deux points de contrôle avant de conclure',
          text:
            'Une équation de tangente correcte doit toujours vérifier DEUX choses : passer par ' +
            'le point (a;f(a)) (teste x=a dans ton équation, tu dois retrouver f(a)) et avoir ' +
            'la bonne pente (le coefficient de x doit être exactement f\'(a)) — une erreur sur ' +
            'l\'un des deux se détecte immédiatement par cette double vérification.',
        },
        {
          kind: 'entrainement',
          title: 'Tangentes',
          generatorId: '5gen28',
          description: [
            'Détermine l\'équation de la tangente en un point donné, résous une tangente ' +
              'horizontale, ou confirme qu\'une droite est deux fois tangente à une même courbe.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 28. Tangentes »',
        },
      ],
    },
    {
      id: 'fonction-derivee',
      number: 3,
      title: 'Fonction dérivée',
      kicker:
        'fonction dérivée, domaine de dérivabilité, interprétation du nombre dérivé, dérivées de référence, règles de la somme/produit/quotient/chaîne',
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — domaine de dérivabilité et fonction dérivée',
          items: [
            'f est **dérivable en a** si f\'(a) existe (la limite du taux d\'accroissement en a ' +
              'est un nombre réel — pas ±∞, pas indéfinie). L\'ensemble des réels où f est ' +
              'dérivable s\'appelle le **domaine de dérivabilité** de f, noté $\\text{dom}_d f$ — ' +
              'il peut être plus petit que dom f (ex. √x est définie en 0 mais pas dérivable en 0).',
            'Calculer f\'(a) par la définition (section 1) pour un a QUELCONQUE de ' +
              '$\\text{dom}_d f$, plutôt que pour une seule valeur fixée, donne une nouvelle ' +
              'fonction : la **fonction dérivée** f\', qui associe à chaque x son nombre dérivé f\'(x).',
          ],
        },
        {
          kind: 'exemple',
          badge: 'fonction dérivée obtenue directement par la définition',
          formula: '$f(x) = 2x^2-3x$, dom f = ℝ. Détermine f\'(x) par la définition.',
          steps: [
            {
              tag: 'développer f(x+h) − f(x)',
              text: 'f(x+h) − f(x) = [2(x+h)²−3(x+h)] − [2x²−3x] = (2x²+4xh+2h²−3x−3h) − 2x² + 3x = 4xh+2h²−3h',
            },
            {
              tag: 'taux d\'accroissement, simplifié par h',
              text: '$\\dfrac{f(x+h)-f(x)}{h} = \\dfrac{4xh+2h^2-3h}{h} = 4x+2h-3$',
            },
          ],
          result: {
            tag: 'passer à la limite',
            text: '$f\'(x) = \\displaystyle\\lim_{h \\to 0} (4x+2h-3) = 4x-3$, $\\text{dom}_d f = \\mathbb{R}$',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — interpréter le nombre dérivé (et le comparer au taux de variation)',
          items: [
            'Le taux de variation (moyen, entre deux points) et le nombre dérivé (instantané, ' +
              'en un seul point) se lisent chacun de deux façons — graphique et physique — ' +
              'pour un même type de calcul :',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['', 'Définition', 'Interprétation graphique', 'Interprétation physique'],
          rows: [
            [
              'Taux de variation entre a et a+h',
              '$\\dfrac{f(a+h)-f(a)}{h}$',
              'pente de la sécante (AB), A(a;f(a)) et B(a+h;f(a+h))',
              'vitesse MOYENNE de variation entre les instants a et a+h',
            ],
            [
              'Nombre dérivé f\'(a)',
              '$f\'(a) = \\displaystyle\\lim_{h \\to 0} \\dfrac{f(a+h)-f(a)}{h}$',
              'pente de la tangente en A(a;f(a)) — limite de la sécante (AB) quand B glisse vers A',
              'vitesse INSTANTANÉE de variation à l\'instant a (voir section 11)',
            ],
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — dérivées de référence',
          items: [],
        },
        {
          kind: 'featureTable',
          headers: ['f(x)', 'xⁿ', '√x', '1/x', 'sin x', 'cos x', 'tan x', 'constante k'],
          rows: [['f\'(x)', 'n·xⁿ⁻¹', '1/(2√x)', '−1/x²', 'cos x', '−sin x', '1/cos²x', '0']],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — 1/x et √x, retrouvées à partir de la définition (section 1)',
          blocks: [
            {
              kind: 'para',
              text:
                'Les deux entrées les moins évidentes du tableau ci-dessus ne s\'apprennent pas ' +
                'par cœur sans savoir d\'où elles viennent — elles se retrouvent directement ' +
                'avec la méthode de la section 1.',
            },
            { kind: 'para', text: '**a.** $f(x) = 1/x$ ($x \\in \\mathbb{R}_0$)' },
            {
              kind: 'para',
              text:
                'Taux d\'accroissement — même dénominateur, puis simplifié par h : ' +
                '$\\dfrac{1/(x+h) - 1/x}{h} = \\dfrac{x-(x+h)}{h \\cdot x(x+h)} = \\dfrac{-h}{h \\cdot x(x+h)} = \\dfrac{-1}{x(x+h)}$',
            },
            { kind: 'para', text: 'Passer à la limite : $f\'(x) = \\displaystyle\\lim_{h \\to 0} \\dfrac{-1}{x(x+h)} = -\\dfrac{1}{x^2}$' },
            { kind: 'para', text: '**b.** $f(x) = \\sqrt{x}$ ($x \\in \\mathbb{R}^+$)' },
            {
              kind: 'para',
              text:
                'Forme indéterminée « 0/0 » — on multiplie par l\'expression conjuguée : ' +
                '$\\dfrac{\\sqrt{x+h}-\\sqrt{x}}{h} = \\dfrac{(x+h)-x}{h(\\sqrt{x+h}+\\sqrt{x})} = \\dfrac{1}{\\sqrt{x+h}+\\sqrt{x}}$',
            },
            { kind: 'para', text: 'Passer à la limite : $f\'(x) = \\displaystyle\\lim_{h \\to 0} \\dfrac{1}{\\sqrt{x+h}+\\sqrt{x}} = \\dfrac{1}{2\\sqrt{x}}$' },
            {
              kind: 'para',
              text:
                'Les dérivées de sin x et cos x se démontrent aussi par la définition, mais avec ' +
                'des limites trigonométriques admises à ce niveau — le résultat reste dans le ' +
                'tableau de référence.',
            },
          ],
        },
        {
          kind: 'methode',
          label: 'Les 4 règles de calcul',
          items: [
            '**Somme** — (u+v)\' = u\'+v\' (chaque terme se dérive indépendamment).',
            '**Produit** — (u·v)\' = u\'v + uv\'.',
            '**Quotient** — $(u/v)\' = \\dfrac{u\'v - uv\'}{v^2}$ (ordre du numérateur significatif : u\' EN PREMIER).',
            '**Composée (chaîne)** — si f(x)=g(u(x)), alors f\'(x) = u\'(x)·g\'(u(x)) : on dérive ' +
              '« de l\'extérieur vers l\'intérieur », puis on multiplie par la dérivée de l\'intérieur.',
          ],
        },
        {
          kind: 'rappel',
          label: 'La règle de la chaîne, cas particuliers courants (u = fonction dérivable de x)',
          items: [],
        },
        {
          kind: 'featureTable',
          headers: ['f(x)', 'uⁿ', '1/u', '√u', 'sin u', 'cos u', 'tan u'],
          rows: [['f\'(x)', 'n·uⁿ⁻¹·u\'', '−u\'/u²', 'u\'/(2√u)', 'u\'·cos u', '−u\'·sin u', 'u\'/cos²u']],
        },
        {
          kind: 'para',
          text:
            'Retrouvé à partir de la formule générale : par exemple pour f(x)=uⁿ, on a ' +
            'g(u)=uⁿ donc g\'(u)=n·uⁿ⁻¹, et f\'(x)=u\'(x)·g\'(u(x))=n·uⁿ⁻¹·u\' — chaque colonne ' +
            'du tableau n\'est qu\'une application de cette même règle à une « extérieure » g différente.',
        },
        {
          kind: 'exemple',
          badge: 'règle du produit',
          formula: '$f(x) = (2x+1)(x^2-3)$. Calcule f\'(x).',
          steps: [
            { tag: 'identifier u et v', text: 'u(x)=2x+1, u\'(x)=2 | v(x)=x²−3, v\'(x)=2x' },
            { tag: 'appliquer (uv)\'=u\'v+uv\'', text: 'f\'(x) = 2(x²−3) + (2x+1)(2x) = 2x²−6 + 4x²+2x' },
          ],
          result: { tag: 'résultat, réduit', text: 'f\'(x) = 6x² + 2x − 6' },
        },
        {
          kind: 'para',
          text:
            'Vérification par développement direct : f(x)=(2x+1)(x²−3)=2x³+x²−6x−3, dont la ' +
            'dérivée terme à terme redonne bien 6x²+2x−6.',
        },
        {
          kind: 'wrongRight',
          wrongTag: 'piège — produit des dérivées',
          wrong: 'u\'(x)·v\'(x) = 2·2x = 4x ≠ f\'(x)',
          rightTag: 'correct — règle du produit',
          right: 'u\'v+uv\' = 6x²+2x−6 = f\'(x)',
        },
        {
          kind: 'attention',
          label: '(uv)\' ≠ u\'·v\', et (u/v)\' ≠ u\'/v\'',
          text:
            'L\'erreur la plus fréquente de ce chapitre : dériver un produit ou un quotient en ' +
            'dérivant chaque facteur SÉPARÉMENT puis en les recombinant naïvement. Seules la ' +
            'somme et la composition ont une règle « simple » — le produit et le quotient ' +
            'exigent TOUJOURS la formule complète (u\'v+uv\' ou (u\'v−uv\')/v²), jamais un raccourci.',
        },
        {
          kind: 'exemple',
          badge: 'règle du quotient',
          formula: '$f(x) = \\dfrac{x^2+1}{x-2}$. Calcule f\'(x).',
          steps: [
            { tag: 'identifier u et v', text: 'u(x)=x²+1, u\'(x)=2x | v(x)=x−2, v\'(x)=1' },
            {
              tag: 'appliquer (u/v)\'=(u\'v−uv\')/v², ordre du numérateur respecté',
              text: '$f\'(x) = \\dfrac{2x(x-2) - (x^2+1)(1)}{(x-2)^2} = \\dfrac{2x^2-4x-x^2-1}{(x-2)^2}$',
            },
          ],
          result: { tag: 'résultat, réduit', text: '$f\'(x) = \\dfrac{x^2-4x-1}{(x-2)^2}$' },
        },
        {
          kind: 'exemple',
          badge: 'règle de la chaîne (composée)',
          formula: '$f(x) = (2x-1)^3$. Calcule f\'(x).',
          steps: [
            { tag: 'décomposer — intérieure u(x)=2x−1, extérieure g(u)=u³', text: 'u\'(x)=2 | g\'(u)=3u²' },
            { tag: 'appliquer f\'(x)=u\'(x)·g\'(u(x))', text: 'f\'(x) = 2 · 3(2x−1)² = 6(2x−1)²' },
          ],
          result: { tag: 'résultat', text: 'f\'(x) = 6(2x−1)²' },
          illustration: {
            kind: 'chain',
            stages: ['u=2x−1'],
            highlightIndex: 0,
            outputLabel: '(2x−1)³',
            caption:
              'décomposition de f(x)=(2x−1)³ — intérieure u(x)=2x−1 (encadré), sortie g(u)=u³ ; ' +
              'on dérive l\'extérieure g d\'abord (3u²), puis on multiplie par u\'(x)=2, dans ' +
              'l\'ordre inverse de la construction',
          },
        },
        {
          kind: 'para',
          text:
            'Vérification par développement direct : (2x−1)³=8x³−12x²+6x−1, dérivée = ' +
            '24x²−24x+6 ; 6(2x−1)²=6(4x²−4x+1)=24x²−24x+6 — les deux méthodes coïncident exactement.',
        },
        {
          kind: 'astuce',
          label: 'Repérer d\'abord la STRUCTURE, avant de dériver',
          text:
            'Avant tout calcul, demande-toi : est-ce une SOMME de termes indépendants (règle de ' +
            'base), un PRODUIT de deux facteurs, un QUOTIENT, ou une fonction « dans » une ' +
            'autre (composée) ? Cette reconnaissance préalable évite d\'appliquer la mauvaise ' +
            'règle — un piège fréquent est de traiter une composée (ex. sin(2x)) comme si ' +
            'l\'intérieure était triviale, en oubliant le facteur de la chaîne.',
        },
        {
          kind: 'entrainement',
          title: 'Fonction dérivée',
          generatorId: '5gen27',
          description: [
            'Reconnais la structure de f(x) (règle de base, produit, quotient, composée), ' +
              'décompose-la si besoin, puis calcule f\'(x) — avec ou sans habillage trigonométrique.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 27. Fonction dérivée »',
        },
      ],
    },
    {
      id: 'signe-derivees',
      number: 4,
      title: 'Association graphique/mots ↔ signe de f\'/f\'\'',
      kicker: 'signe de f\' ⟺ sens de variation ; signe de f\'\' ⟺ concavité ; point d\'inflexion',
      blocks: [
        {
          kind: 'para',
          text:
            'Tu sais maintenant définir f\'(a) (section 1), l\'interpréter comme pente d\'une ' +
            'tangente (section 2), et calculer f\'(x) avec les règles de calcul (section 3) — ' +
            'reste à savoir ce que le SIGNE de f\' (et de f\'\') révèle sur f : son sens de ' +
            'variation, sa concavité, et la position de ses extremums.',
        },
        {
          kind: 'rappel',
          label: 'Rappel — signe de f\' ⟺ sens de variation de f',
          items: [
            '$f\'(x) > 0$ sur un intervalle ⟹ f est **croissante** sur cet intervalle (la courbe monte).',
            '$f\'(x) < 0$ sur un intervalle ⟹ f est **décroissante** sur cet intervalle (la courbe descend).',
            '$f\'(a) = 0$ ET f\' **change de signe** en a ⟹ f admet un **extremum local** en a ' +
              '(maximum si f\' passe de + à −, minimum si f\' passe de − à +).',
          ],
        },
        {
          kind: 'rappel',
          label: 'Rappel — signe de f\'\' ⟺ concavité de f',
          items: [
            '$f\'\'(x) > 0$ sur un intervalle ⟹ f est **convexe** (concave vers le haut, la ' +
              'courbe est au-dessus de chacune de ses tangentes, forme de « bol »).',
            '$f\'\'(x) < 0$ sur un intervalle ⟹ f est **concave** (concave vers le bas, forme de « dôme »).',
            'Un **point d\'inflexion** est un point où f\'\' **change de signe** — la courbe ' +
              'traverse sa tangente en ce point, passant d\'un type de concavité à l\'autre.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'signe de f\' et de f\'\' sur une cubique',
          formula: '$f(x) = x^3 - 3x$. Étudie le signe de f\'(x) et de f\'\'(x), et déduis-en variations, extremums et concavité.',
          steps: [
            { tag: 'dériver une première fois', text: '$f\'(x) = 3x^2-3 = 3(x-1)(x+1)$' },
            {
              tag: 'signe de f\' — racines en x=−1 et x=1',
              text: 'x<−1 : f\'(x)>0 (croissante) ; −1<x<1 : f\'(x)<0 (décroissante) ; x>1 : f\'(x)>0 (croissante)',
            },
            { tag: 'extremums — là où f\' change de signe', text: 'max local en x=−1 : f(−1)=−1+3=2 ; min local en x=1 : f(1)=1−3=−2' },
            { tag: 'dériver une seconde fois', text: '$f\'\'(x) = 6x$' },
          ],
          result: {
            tag: 'concavité et point d\'inflexion',
            text: 'f\'\'(x)<0 pour x<0 (concave) ; f\'\'(x)>0 pour x>0 (convexe) ; f\'\'(0)=0 avec changement de signe ⟹ **point d\'inflexion en (0;0)**.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x - 3 * x, tone: 'good', xMax: -1 },
              { fn: (x) => x * x * x - 3 * x, tone: 'bad', xMin: -1, xMax: 1 },
              { fn: (x) => x * x * x - 3 * x, tone: 'good', xMin: 1 },
            ],
            xMin: -2.5,
            xMax: 2.5,
            xTicks: [],
            fixedYRange: { min: -3.5, max: 3.5 },
            points: [
              { x: -1, y: 2, label: 'max local (−1;2)', tone: 'good', labelPos: 'above' },
              { x: 1, y: -2, label: 'min local (1;−2)', tone: 'bad', labelPos: 'below' },
              { x: 0, y: 0, label: 'inflexion (0;0)', tone: 'accent', labelPos: 'right' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x³−3x — vert = f\'>0 (croissante), rouge = f\'<0 (décroissante), point orange = inflexion',
          },
        },
        {
          kind: 'attention',
          label: 'f\'(a)=0 ne garantit PAS un extremum',
          text:
            'La condition f\'(a)=0 est NÉCESSAIRE pour un extremum local, jamais suffisante à ' +
            'elle seule : il faut en plus que f\' **change réellement de signe** autour de a. Un ' +
            'cas classique où ça échoue est développé en détail à la section 5 (point critique ' +
            'sans extremum, f(x)=x³ en x=0).',
        },
        {
          kind: 'astuce',
          label: 'Lire d\'abord f\', puis seulement f\'\'',
          text:
            'Ne mélange jamais les deux lectures : le signe de f\' renseigne sur la ' +
            '**direction** de la courbe (monte/descend), le signe de f\'\' renseigne sur sa ' +
            '**forme** (bol/dôme) — un extremum se lit sur f\', un point d\'inflexion se lit sur ' +
            'f\'\', jamais l\'inverse.',
        },
        {
          kind: 'entrainement',
          title: 'Association graphique/mots ↔ signe de f\'/f\'\'',
          generatorId: '5gen25',
          description: [
            'Associe un graphique de f à son graphique de f\' (ou à une description verbale de ' +
              'f\'/f\'\'), par sélection — reconnaissance directe du lien signe de la dérivée ↔ ' +
              'comportement de la courbe.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 25. Association graphique/mots ↔ signe de f\'/f\'\' »',
        },
      ],
    },
    {
      id: 'etude-locale',
      number: 5,
      title: 'Étude locale (extremums et points critiques)',
      kicker: 'tableau de signes de f\', extremums locaux, point critique sans extremum',
      blocks: [
        {
          kind: 'methode',
          label: 'Tableau de signes de f\' complet',
          items: [
            'Résoudre f\'(x)=0 pour trouver les **zéros** de f\' (candidats extremums).',
            'Étudier le SIGNE de f\' entre et autour de ces zéros (tableau de signes).',
            'En déduire les **variations** de f (flèches ↗/↘) puis **classer** chaque zéro : ' +
              'max local si f\' passe de + à −, min local si f\' passe de − à +.',
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — tableau de signes complet, 2 extremums réels',
          blocks: [
            { kind: 'para', text: 'Reprends $f(x) = x^3-3x$ (section 4) et dresse le tableau de signes complet de f\'.' },
            {
              kind: 'signTable',
              caption: 'Signe de f\'(x) = 3(x−1)(x+1) et variations de f(x)=x³−3x',
              rows: [
                {
                  label: 'x',
                  cells: [
                    { text: '−∞', tone: 'plain' },
                    { text: '', tone: 'plain' },
                    { text: '−1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '1', tone: 'zero' },
                    { text: '', tone: 'plain' },
                    { text: '+∞', tone: 'plain' },
                  ],
                },
                {
                  label: 'Signe de f\'(x)',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '+', tone: 'pos' },
                    { text: '0', tone: 'zero' },
                    { text: '−', tone: 'neg' },
                    { text: '0', tone: 'zero' },
                    { text: '+', tone: 'pos' },
                    { text: '', tone: 'plain' },
                  ],
                },
                {
                  label: 'Variations de f',
                  cells: [
                    { text: '', tone: 'plain' },
                    { text: '↗', tone: 'plain' },
                    { text: 'max (2)', tone: 'zero' },
                    { text: '↘', tone: 'plain' },
                    { text: 'min (−2)', tone: 'zero' },
                    { text: '↗', tone: 'plain' },
                    { text: '', tone: 'plain' },
                  ],
                },
              ],
            },
            {
              kind: 'para',
              text:
                'f\' change de signe aux DEUX zéros : max local en x=−1 (f=2), min local en ' +
                'x=1 (f=−2) — ce sont bien de VRAIS extremums.',
            },
          ],
        },
        {
          kind: 'piege',
          label: 'Un point critique n\'est pas toujours un extremum',
          text:
            'f\'(a)=0 définit un **point critique**, candidat à être un extremum — mais ' +
            'SEULEMENT si f\' change réellement de signe autour de a. Si f\' garde le MÊME ' +
            'signe des deux côtés (par exemple toujours positif), a n\'est PAS un extremum : ' +
            'c\'est un point d\'inflexion à tangente horizontale.',
        },
        {
          kind: 'exemple',
          badge: 'point critique SANS extremum',
          formula: '$f(x) = x^3+2$. Étudie le point critique en x=0.',
          steps: [
            { tag: 'dériver', text: 'f\'(x) = 3x²' },
            { tag: 'signe de f\'', text: 'f\'(x) = 3x² ≥ 0 pour TOUT x — jamais négatif, nul seulement en x=0' },
          ],
          result: {
            tag: 'conclusion',
            text:
              'f\'(0)=0 MAIS f\' ne change pas de signe (+ des deux côtés) ⟹ **pas d\'extremum** ' +
              'en x=0 — x=0 est un point d\'inflexion à tangente horizontale, f restant ' +
              'croissante de part et d\'autre.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x + 2, tone: 'accent' },
              { fn: () => 2, tone: 'good', xMin: -0.65, xMax: 0.65 },
            ],
            xMin: -2,
            xMax: 2,
            xTicks: [],
            fixedYRange: { min: -3, max: 7 },
            points: [{ x: 0, y: 2, label: 'point critique (0;2)', tone: 'accent', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=x³+2 — f\' reste ≥0 partout : la courbe ne fait que croiser sa tangente horizontale, aucun extremum',
          },
        },
        {
          kind: 'astuce',
          label: 'Vérifie TOUJOURS les deux côtés d\'un zéro de f\'',
          text:
            'Trouver f\'(a)=0 n\'est que la moitié du travail : évalue le signe de f\' juste ' +
            'avant ET juste après a (une valeur test suffit de chaque côté). Si le signe est ' +
            'identique des deux côtés, conclus explicitement « pas d\'extremum », ne t\'arrête ' +
            'jamais après le seul calcul de f\'(a)=0.',
        },
        {
          kind: 'entrainement',
          title: 'Étude locale (extremums et points critiques)',
          generatorId: '5gen29',
          description: [
            'Résous f\'(x)=0, dresse le tableau de signes étendu, classe chaque extremum — ' +
              'puis, pour les instances avancées, mène la même étude sur f\'\' (points d\'inflexion).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 29. Étude locale (extremums et points critiques) »',
        },
      ],
    },
    {
      id: 'lecture-graphique-derivees',
      number: 6,
      title: 'Lecture graphique — dérivées et applications',
      kicker: 'lire directement sur un graphique de f : variations, extremums, concavité — sans calcul',
      blocks: [
        {
          kind: 'para',
          text:
            'Toutes les notions des sections 4 et 5 se lisent directement sur un graphique de ' +
            'f, SANS calculer la moindre dérivée : il suffit de savoir reconnaître les formes.',
        },
        {
          kind: 'methode',
          label: 'Ce qu\'il faut repérer sur un graphique de f',
          items: [
            'La courbe MONTE ⟹ f\'>0 sur cet intervalle. La courbe DESCEND ⟹ f\'<0.',
            'Un sommet (pic ou creux) où la courbe change de direction ⟹ extremum local, f\' y vaut 0 et change de signe.',
            'La courbe a la forme d\'un « bol » (au-dessus de ses tangentes) ⟹ convexe, f\'\'>0. ' +
              'La forme d\'un « dôme » (en-dessous de ses tangentes) ⟹ concave, f\'\'<0.',
            'Le point où la courbe passe de « bol » à « dôme » (ou l\'inverse) ⟹ point d\'inflexion.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'lecture directe, aucune formule donnée',
          formula: 'Le graphique ci-dessous représente une fonction f (sa formule n\'est volontairement pas donnée). Décris ses variations, ses extremums et sa concavité, uniquement par lecture.',
          steps: [
            { tag: 'variations — lues directement', text: 'f décroît avant A, croît entre A et B, décroît après B' },
            { tag: 'extremums — aux changements de direction', text: 'A est un minimum local (creux) ; B est un maximum local (pic)' },
          ],
          result: {
            tag: 'concavité — forme de la courbe',
            text:
              '« bol » (convexe, f\'\'>0) à gauche du point orange, « dôme » (concave, f\'\'<0) à ' +
              'droite — ce point orange est donc un point d\'inflexion, aucun calcul requis pour l\'affirmer.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'bad', xMax: -1 },
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'good', xMin: -1, xMax: 1 },
              { fn: (x) => -(x * x * x) + 3 * x, tone: 'bad', xMin: 1 },
            ],
            xMin: -2.5,
            xMax: 2.5,
            xTicks: [],
            fixedYRange: { min: -3.5, max: 3.5 },
            points: [
              { x: -1, y: -2, label: 'A', tone: 'bad', labelPos: 'below' },
              { x: 1, y: 2, label: 'B', tone: 'good', labelPos: 'above' },
              { x: 0, y: 0, label: '', tone: 'accent' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'graphique de f — points A et B à identifier par simple lecture, sans formule ni calcul',
          },
        },
        {
          kind: 'attention',
          label: 'Un simple changement de pente n\'est pas un extremum',
          text:
            'Une courbe peut ralentir sa montée (pente qui diminue mais reste positive) sans ' +
            'jamais s\'arrêter ni redescendre — ce n\'est PAS un extremum, juste une variation ' +
            'de concavité. Un extremum exige un véritable changement de DIRECTION (la courbe ' +
            'monte puis redescend, ou l\'inverse), jamais seulement un changement de vitesse.',
        },
        {
          kind: 'exemple',
          badge: 'un point critique qui n\'est PAS un extremum, à la lecture seule',
          formula: 'Second graphique de f (formule toujours non donnée). Au point C, la tangente est horizontale — est-ce pour autant un extremum ?',
          steps: [
            {
              tag: 'variations — lues directement',
              text: 'f croît AVANT C, et croît ENCORE après C — aucun changement de direction nulle part',
            },
          ],
          result: {
            tag: 'conclusion',
            text:
              'la tangente en C est bien horizontale (f\'(C)=0), mais ce n\'est PAS un extremum : ' +
              'la courbe ralentit un instant puis continue exactement dans le même sens — ' +
              'exactement le piège décrit dans l\'encadré ci-dessus, ici identifié par simple ' +
              'lecture, sans aucun calcul.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => x * x * x, tone: 'accent', xMin: -1.6, xMax: 1.6 },
              { fn: () => 0, tone: 'good', xMin: -0.5, xMax: 0.5 },
            ],
            xMin: -1.8,
            xMax: 1.8,
            xTicks: [],
            fixedYRange: { min: -4.5, max: 4.5 },
            points: [{ x: 0, y: 0, label: 'C : tangente horizontale', tone: 'accent', labelPos: 'above' }],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption:
              'graphique de f — la courbe est TOUJOURS croissante, y compris de part et ' +
              'd\'autre du point C où la tangente est momentanément horizontale',
          },
        },
        {
          kind: 'astuce',
          label: 'Suis le doigt le long de la courbe, de gauche à droite',
          text:
            'Balaie la courbe de gauche à droite en observant si elle monte ou descend : chaque ' +
            'changement de direction est un extremum à noter, chaque changement de courbure ' +
            '(bol ↔ dôme) est un point d\'inflexion à noter — une lecture systématique évite d\'en oublier un.',
        },
        {
          kind: 'entrainement',
          title: 'Lecture graphique — dérivées et applications',
          generatorId: '5gen30',
          description: [
            'Un graphique de f est affiché : lis directement asymptotes, extremums, signe de ' +
              'f\'/f\'\', concavité et points d\'inflexion — aucun calcul, calculatrice absente.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 30. Lecture graphique — dérivées et applications »',
        },
      ],
    },
    {
      id: 'etudier-fonction',
      number: 7,
      title: 'Étudier une fonction',
      kicker: 'domaine → dérivée → signe → variations → extremums → limites/asymptotes → synthèse',
      blocks: [
        {
          kind: 'para',
          text:
            'L\'étude complète d\'une fonction réunit TOUT ce qui précède, dans un ordre fixe — ' +
            'et reconvoque directement les techniques du chapitre précédent pour les limites ' +
            'et les asymptotes.',
        },
        {
          kind: 'methode',
          label: 'La démarche complète, dans l\'ordre',
          items: [
            '**Domaine** — exclure les valeurs interdites (dénominateur nul, etc.).',
            '**Dérivée** f\'(x) — calculée avec les règles de la section 3.',
            '**Signe de f\'** — tableau de signes complet, y compris la colonne d\'exclusion.',
            '**Variations et extremums** — lus directement sur le tableau de signes.',
            '**Limites aux bornes du domaine et asymptotes** — techniques du chapitre précédent.',
            '**Synthèse** — domaine, tableau complet, équations des asymptotes.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'étude complète — fonction rationnelle avec asymptote oblique',
          formula: '$f(x) = (x-1) + \\dfrac{4}{x-1} = \\dfrac{x^2-2x+5}{x-1}$. Mène l\'étude complète de f.',
          steps: [
            { tag: '1. domaine', text: 'x−1=0 ⟺ x=1 → domaine = ℝ\\{1}' },
            { tag: '2. dériver', text: '$f\'(x) = 1 - \\dfrac{4}{(x-1)^2}$' },
            { tag: '3. zéros de f\' — résoudre f\'(x)=0', text: '1 = 4/(x−1)² ⟺ (x−1)² = 4 ⟺ x−1 = ±2 ⟺ x = −1 ou x = 3' },
            {
              tag: 'signe de f\' — test en x=−2, x=0, x=2, x=4',
              text: 'x=−2 : f\'=1−4/9>0 | x=0 : f\'=1−4=−3<0 | x=2 : f\'=1−4=−3<0 | x=4 : f\'=1−4/9>0',
            },
            { tag: '4. extremums', text: 'f(−1)=(−2)+4/(−2)=−2−2=−4 (max local) | f(3)=2+4/2=2+2=4 (min local)' },
            {
              tag: '5. asymptote verticale — x=1 (numérateur en x=1 : 1−2+5=4≠0, vraie asymptote)',
              text: '$\\displaystyle\\lim_{x \\to 1^-} f(x) = -\\infty$ | $\\displaystyle\\lim_{x \\to 1^+} f(x) = +\\infty$',
            },
            { tag: 'asymptote oblique — le terme 4/(x−1) tend vers 0 à l\'infini', text: 'y = x − 1' },
          ],
          result: {
            tag: 'synthèse complète',
            text:
              'Domaine ℝ\\{1}. Max local (−1;−4), min local (3;4). Asymptote verticale x=1 (+∞ ' +
              'à droite, −∞ à gauche). Asymptote oblique y=x−1.',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => (x - 1) + 4 / (x - 1), tone: 'accent', xMin: -4, xMax: 0.85 },
              { fn: (x) => (x - 1) + 4 / (x - 1), tone: 'accent', xMin: 1.15, xMax: 6 },
            ],
            xMin: -4,
            xMax: 6,
            xTicks: [1],
            fixedYRange: { min: -8, max: 10 },
            verticalAsymptotes: [{ x: 1, label: 'x=1' }],
            obliqueAsymptotes: [{ a: 1, b: -1, label: 'y=x−1' }],
            points: [
              { x: -1, y: -4, label: 'max local (−1;−4)', tone: 'good', labelPos: 'below' },
              { x: 3, y: 4, label: 'min local (3;4)', tone: 'bad', labelPos: 'above' },
            ],
            xAxisLabel: 'x',
            yAxisLabel: 'f(x)',
            caption: 'f(x)=(x−1)+4/(x−1) — la courbe se resserre progressivement contre l\'asymptote verticale x=1 (des deux côtés) et contre l\'asymptote oblique y=x−1',
          },
        },
        {
          kind: 'piege',
          label: 'La colonne d\'exclusion (CE) n\'a jamais de cellule « variation »',
          text:
            'En x=1, f n\'est pas définie : la colonne correspondante porte le symbole ∄ ' +
            '(n\'existe pas) sur CHAQUE ligne du tableau — jamais une flèche de variation qui ' +
            '« enjamberait » la valeur exclue, même si les deux morceaux semblent se prolonger ' +
            'visuellement sur le graphique.',
        },
        {
          kind: 'astuce',
          label: 'Réutilise le chapitre précédent sans le refaire',
          text:
            'Le domaine, la nature de l\'asymptote verticale (vraie asymptote ou point vide, ' +
            'test du numérateur) et l\'asymptote oblique (division euclidienne ou méthode des ' +
            'limites) suivent EXACTEMENT les techniques du chapitre 4 — l\'étude complète ' +
            'n\'ajoute que le calcul de f\' et son tableau de signes par-dessus ce qui est déjà su.',
        },
        {
          kind: 'entrainement',
          title: 'Étudier une fonction',
          generatorId: '5gen31',
          description: [
            'Étude complète capstone : domaine, dérivée, signe, variations, extremums, ' +
              'limites et asymptotes, synthèse finale et placement de points clés sur le graphique.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 31. Étudier une fonction »',
        },
      ],
    },
    {
      id: 'optimisation-geometrique',
      number: 8,
      title: 'Optimisation géométrique',
      kicker: 'maximiser/minimiser une aire ou un volume sous contrainte, dérivée nulle au point optimal',
      blocks: [
        {
          kind: 'methode',
          label: 'Optimiser une grandeur géométrique',
          items: [
            'Exprimer la grandeur à optimiser (aire, volume, périmètre) en fonction d\'UNE ' +
              'SEULE variable, en utilisant la contrainte donnée pour éliminer les autres.',
            'Dériver cette fonction, résoudre sa dérivée = 0.',
            'Confirmer qu\'il s\'agit bien d\'un maximum (ou minimum) — par tableau de signes ' +
              'ou par le signe de la dérivée SECONDE — jamais supposé automatiquement.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'rectangle de périmètre fixé, aire maximale',
          formula: 'Un rectangle a un périmètre fixé à 40 m. Quelles dimensions maximisent son aire ?',
          steps: [
            { tag: 'poser la contrainte', text: '2x + 2y = 40 ⟺ y = 20 − x (x = largeur, y = longueur, x∈]0;20[)' },
            { tag: 'exprimer l\'aire en fonction d\'UNE variable', text: 'A(x) = x·(20−x) = 20x − x²' },
            { tag: 'dériver et résoudre A\'(x)=0', text: 'A\'(x) = 20 − 2x = 0 ⟺ x = 10' },
            { tag: 'confirmer le maximum — signe de A\'\'', text: 'A\'\'(x) = −2 < 0 (constant) ⟹ concavité toujours vers le bas ⟹ x=10 est bien un MAXIMUM' },
          ],
          result: { tag: 'conclusion', text: 'x=10 m, y=20−10=10 m (un CARRÉ) ⟹ aire maximale A(10) = 100 m²' },
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (x) => 20 * x - x * x, tone: 'accent', xMin: 0, xMax: 20 }],
            xMin: -1,
            xMax: 21,
            xTicks: [10],
            fixedYRange: { min: -5, max: 115 },
            points: [{ x: 10, y: 100, label: 'x=10 m, A=100 m²', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 'x (largeur, m)',
            yAxisLabel: 'A(x) (aire, m²)',
            caption: 'A(x)=20x−x² — le maximum de l\'aire est atteint au sommet de la parabole, en x=10 (rectangle carré)',
          },
        },
        {
          kind: 'attention',
          label: 'Ne jamais optimiser deux variables à la fois',
          text:
            'Tant que la fonction dépend de DEUX variables (ici x et y), sa dérivée n\'a pas de ' +
            'sens au programme de ce chapitre — utilise TOUJOURS la contrainte pour éliminer ' +
            'une variable AVANT de dériver, jamais après.',
        },
        {
          kind: 'astuce',
          label: 'Vérifier le domaine réaliste de x',
          text:
            'Une largeur x doit rester strictement positive ET strictement inférieure au ' +
            'périmètre disponible (ici x∈]0;20[, sinon y=20−x devient négatif ou nul) — un ' +
            'extremum mathématique situé hors de ce domaine n\'aurait aucun sens géométrique.',
        },
        {
          kind: 'entrainement',
          title: 'Optimisation géométrique',
          generatorId: '5gen32',
          description: [
            'Maximise ou minimise une aire, un volume ou un périmètre sous contrainte — ' +
              'trapèze, cylindre, rectangle avec marges, fenêtre demi-cercle — en dérivant ' +
              'toi-même la fonction à optimiser.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 32. Optimisation géométrique »',
        },
      ],
    },
    {
      id: 'contexte-economique',
      number: 9,
      title: 'Contexte économique',
      kicker: 'coût marginal = dérivée du coût total ; profit maximal ; interprétation économique de f\'',
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — coût marginal',
          items: [
            'Le **coût marginal** est le coût de production d\'une unité SUPPLÉMENTAIRE — en ' +
              'pratique, deux estimations : la version DISCRÈTE C(q+1)−C(q) (coût réel de la ' +
              '(q+1)-ième unité), et la version CONTINUE C\'(q) (la dérivée, pente instantanée) ' +
              '— les deux sont PROCHES mais pas identiques.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'coût marginal — discret vs dérivée',
          formula: '$C(q) = q^2+4q+100$ (coût total en €, pour q unités). Compare le coût marginal discret et la dérivée en q=10.',
          steps: [
            { tag: 'coût marginal discret — C(11)−C(10)', text: 'C(10) = 100+40+100 = 240 € | C(11) = 121+44+100 = 265 € ⟹ C(11)−C(10) = 25 €' },
            { tag: 'dériver', text: 'C\'(q) = 2q + 4' },
          ],
          result: {
            tag: 'coût marginal par la dérivée, en q=10',
            text: 'C\'(10) = 20+4 = 24 € — très proche des 25 € discrets (écart normal : la dérivée donne la pente INSTANTANÉE en q=10, le calcul discret la variation sur toute une unité).',
          },
        },
        {
          kind: 'rappel',
          label: 'Rappel — bénéfice maximal : égalité des marginales',
          items: [
            'Le bénéfice B(x)=R(x)−C(x) (recette moins coût) est maximal quand B\'(x)=0, ' +
              'c\'est-à-dire quand R\'(x) = C\'(x) — la **recette marginale égale le coût ' +
              'marginal**. Produire une unité de plus ne devient plus rentable exactement à cet instant.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'bénéfice maximal, vérification Rm=Cm',
          formula: 'Prix $p(x) = 50-x$ (€, décroissant avec la quantité), coût $C(x) = x^2+10x+20$. Détermine la quantité qui maximise le bénéfice.',
          steps: [
            { tag: 'recette', text: 'R(x) = x·p(x) = x(50−x) = 50x − x²' },
            { tag: 'bénéfice B(x)=R(x)−C(x)', text: 'B(x) = (50x−x²) − (x²+10x+20) = −2x² + 40x − 20' },
            { tag: 'dériver et résoudre B\'(x)=0', text: 'B\'(x) = −4x + 40 = 0 ⟺ x = 10 (B\'\'(x)=−4<0 : bien un maximum)' },
          ],
          result: {
            tag: 'vérification par égalité des marginales',
            text: 'R\'(x)=50−2x ⟹ R\'(10)=30 | C\'(x)=2x+10 ⟹ C\'(10)=30 ⟹ Rm=Cm=30 € ✓ | B(10) = −200+400−20 = 180 €',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (x) => 50 * x - x * x, tone: 'good', xMin: 0, xMax: 20 },
              { fn: (x) => x * x + 10 * x + 20, tone: 'bad', xMin: 0, xMax: 20 },
            ],
            xMin: -1,
            xMax: 21,
            xTicks: [10],
            fixedYRange: { min: -10, max: 650 },
            points: [
              { x: 10, y: 400, label: 'R(10)=400 €', tone: 'good', labelPos: 'above' },
              { x: 10, y: 220, label: 'C(10)=220 € — B(10)=180 € (max)', tone: 'bad', labelPos: 'below' },
            ],
            xAxisLabel: 'x (quantité)',
            yAxisLabel: '€',
            caption:
              'R(x)=50x−x² (recette, vert) et C(x)=x²+10x+20 (coût, rouge) — l\'écart vertical ' +
              'entre les deux est le bénéfice B(x), maximal en x=10 (B=180 €)',
          },
        },
        {
          kind: 'piege',
          label: 'Maximiser la RECETTE n\'est pas maximiser le BÉNÉFICE',
          text:
            'R\'(x)=0 donne la quantité qui maximise la recette seule (ici x=25, R\'(25)=50−50=0) ' +
            '— un piège classique est de confondre ce point avec l\'optimum de bénéfice, qui ' +
            'doit TOUJOURS tenir compte du coût (ici x=10, très différent) : produire davantage ' +
            'augmente parfois la recette tout en réduisant le bénéfice net si le coût marginal ' +
            'dépasse la recette marginale.',
        },
        {
          kind: 'astuce',
          label: 'L\'existence d\'un extremum n\'est pas garantie',
          text:
            'Pour un coût cubique, il arrive que l\'équation du coût marginal (dérivée) n\'ait ' +
            'pas de racine réelle (discriminant négatif) — dans ce cas, conclus explicitement ' +
            '« pas d\'extremum » plutôt que de laisser un champ vide : c\'est une réponse ' +
            'mathématiquement valide, pas un échec.',
        },
        {
          kind: 'entrainement',
          title: 'Contexte économique',
          generatorId: '5gen33',
          description: [
            'Calcule un coût marginal (discret et par dérivée), détermine un bénéfice maximal ' +
              'par égalité des marginales, et confirme la cohérence entre les deux approches.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 33. Contexte économique »',
        },
      ],
    },
    {
      id: 'extrema-bornes',
      number: 10,
      title: 'Extrema en contexte borné',
      kicker: 'sur un intervalle FERMÉ [a;b] : comparer les extremums locaux ET les valeurs aux bornes',
      blocks: [
        {
          kind: 'attention',
          label: 'Sur un intervalle fermé, l\'extremum ABSOLU n\'est pas toujours un extremum LOCAL',
          text:
            'Contrairement à une étude sur ℝ tout entier (section 5, où le domaine « part à ' +
            'l\'infini »), sur un intervalle FERMÉ ET BORNÉ [a;b] la fonction a aussi une ' +
            'valeur EN a et EN b — et l\'extremum absolu peut très bien s\'y trouver, même si ' +
            'aucun extremum local n\'y est présent. Comparer les valeurs aux bornes n\'est ' +
            'JAMAIS optionnel.',
        },
        {
          kind: 'methode',
          label: 'Trouver l\'extremum absolu sur [a;b]',
          items: [
            'Trouver tous les extremums locaux À L\'INTÉRIEUR de ]a;b[ (comme en section 5).',
            'Calculer f(a) et f(b) — les valeurs AUX bornes.',
            'Comparer TOUTES ces valeurs ensemble (extremums locaux + f(a) + f(b)) : le ' +
              'maximum absolu est la plus grande, le minimum absolu la plus petite — QUEL QUE ' +
              'SOIT l\'endroit où elle se trouve.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'le maximum absolu est à une borne, pas à l\'extremum local',
          formula: '$f(t) = t^3-6t^2+9t+2$ sur l\'intervalle FERMÉ [0;5]. Détermine le maximum et le minimum absolus.',
          steps: [
            { tag: 'dériver et résoudre f\'(t)=0', text: 'f\'(t) = 3t²−12t+9 = 3(t−1)(t−3) = 0 ⟺ t=1 ou t=3 (tous deux dans ]0;5[)' },
            { tag: 'classer les extremums locaux', text: 'f(1) = 1−6+9+2 = 6 (max local) | f(3) = 27−54+27+2 = 2 (min local)' },
            { tag: 'valeurs AUX BORNES — jamais oubliées', text: 'f(0) = 2 | f(5) = 125−150+45+2 = 22' },
          ],
          result: {
            tag: 'comparaison de TOUTES les valeurs : 2, 6, 2, 22',
            text: 'Maximum ABSOLU = 22, atteint en t=5 (à la borne !), bien plus grand que le maximum local (6). Minimum ABSOLU = 2, atteint à la fois en t=0 ET en t=3 (égalité entre une borne et un extremum local).',
          },
          illustration: {
            kind: 'curvePlot',
            curves: [
              { fn: (t) => t * t * t - 6 * t * t + 9 * t + 2, tone: 'accent', xMin: 0, xMax: 5 },
              { fn: () => 2, tone: 'faint', xMin: 0, xMax: 3 },
            ],
            xMin: -0.4,
            xMax: 5.4,
            xTicks: [],
            fixedYRange: { min: -1, max: 24 },
            points: [
              { x: 1, y: 6, label: 'max local (1;6)', tone: 'good', labelPos: 'above' },
              { x: 3, y: 2, label: 'min local (3;2)', tone: 'bad', labelPos: 'below' },
              { x: 0, y: 2, label: 'f(0)=2', tone: 'bad', labelPos: 'left' },
              { x: 5, y: 22, label: 'f(5)=22 (MAXIMUM ABSOLU)', tone: 'accent', labelPos: 'left' },
            ],
            xAxisLabel: 't',
            yAxisLabel: 'f(t)',
            caption:
              'f(t)=t³−6t²+9t+2 sur [0;5] — le maximum local (t=1, f=6) n\'est PAS le maximum ' +
              'absolu : celui-ci se trouve à la borne t=5 (f=22) ; le minimum absolu est ' +
              'atteint à la fois en t=0 et t=3 (valeur commune 2)',
          },
        },
        {
          kind: 'featureTable',
          headers: ['t', '0 (borne)', '1', '3', '5 (borne)'],
          rows: [
            ['f(t)', '2', '6 (max local)', '2 (min local)', '22'],
            ['Statut', 'min absolu (ex æquo)', '—', 'min absolu (ex æquo)', 'MAX ABSOLU'],
          ],
        },
        {
          kind: 'piege',
          label: 'S\'arrêter au tableau de signes de f\' sans regarder les bornes',
          text:
            'Le tableau de signes de f\' répond correctement « f(1)=6 est un maximum LOCAL » — ' +
            'mais répondre « donc le maximum de f sur [0;5] est 6 » est FAUX ici : f(5)=22 ' +
            'dépasse largement cette valeur. Sur un intervalle borné, la comparaison finale aux ' +
            'bornes n\'est jamais une formalité, c\'est une étape qui peut renverser la conclusion.',
        },
        {
          kind: 'astuce',
          label: 'Dresse une liste unique de candidats avant de comparer',
          text:
            'Regroupe TOUJOURS dans une seule liste — valeurs aux extremums locaux ET valeurs ' +
            'aux deux bornes — puis compare cette liste d\'un coup d\'œil : le plus grand ' +
            'nombre est le maximum absolu, le plus petit le minimum absolu, sans exception ni ' +
            'cas particulier à retenir.',
        },
        {
          kind: 'entrainement',
          title: 'Extrema en contexte borné',
          generatorId: '5gen34',
          description: [
            'Sur un intervalle fermé [0;T], résous f\'(t)=0, classe les extremums locaux, ' +
              'calcule f aux bornes, puis identifie explicitement le maximum et le minimum ' +
              'absolus parmi TOUTES ces valeurs.',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 34. Extrema en contexte borné »',
        },
      ],
    },
    {
      id: 'vitesse-position',
      number: 11,
      title: 'Vitesse et position',
      kicker: 's(t) position, v(t)=s\'(t) vitesse, a(t)=v\'(t)=s\'\'(t) accélération',
      blocks: [
        {
          kind: 'rappel',
          label: 'Rappel — dériver la position donne la vitesse, dériver la vitesse donne l\'accélération',
          items: [
            'Pour un mouvement en ligne droite décrit par une position s(t) (en mètres, t en ' +
              'secondes) : la **vitesse** est v(t) = s\'(t), et l\'**accélération** est a(t) = ' +
              'v\'(t) = s\'\'(t) — exactement la même logique que le sens de variation (section ' +
              '4), appliquée à la physique : v est la dérivée de la POSITION, a est la dérivée ' +
              'de la VITESSE.',
          ],
        },
        {
          kind: 'exemple',
          badge: 'position, vitesse, accélération sur un mouvement',
          formula: 'Un mobile a pour position $s(t) = -t^2+8t$ (mètres, t∈[0;8] secondes). Étudie son mouvement.',
          steps: [
            { tag: 'vitesse', text: 'v(t) = s\'(t) = −2t + 8' },
            { tag: 'accélération', text: 'a(t) = v\'(t) = −2 (constante — décélération constante)' },
            { tag: 'quand la vitesse s\'annule', text: 'v(t)=0 ⟺ t=4 s ⟹ s(4) = −16+32 = 16 m (position maximale, le mobile rebrousse chemin)' },
            { tag: 'signe de v — sens du mouvement', text: 'v(2) = 4 > 0 (avance) | v(6) = −4 < 0 (recule)' },
          ],
          result: {
            tag: 'interprétation physique',
            text:
              'Le mobile avance (v>0) jusqu\'à t=4 s, atteint sa position maximale (16 m) au ' +
              'moment EXACT où v s\'annule, puis recule (v<0) — l\'accélération négative ' +
              'constante (−2 m/s²) freine le mobile puis le fait repartir en arrière, comme un ' +
              'objet lancé puis freiné.',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => -t * t + 8 * t, tone: 'accent', xMin: 0, xMax: 8 }],
            xMin: -0.5,
            xMax: 8.5,
            xTicks: [4],
            fixedYRange: { min: -1, max: 19 },
            points: [{ x: 4, y: 16, label: 's(4)=16 m (maximum)', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 't (s)',
            yAxisLabel: 's(t) (m)',
            caption: 's(t)=−t²+8t — position maximale en t=4 s',
          },
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'curvePlot',
            curves: [{ fn: (t) => -2 * t + 8, tone: 'good', xMin: 0, xMax: 8 }],
            xMin: -0.5,
            xMax: 8.5,
            xTicks: [4],
            fixedYRange: { min: -9, max: 9 },
            points: [{ x: 4, y: 0, label: 'v(4)=0', tone: 'good', labelPos: 'above' }],
            xAxisLabel: 't (s)',
            yAxisLabel: 'v(t) (m/s)',
            caption: 'v(t)=s\'(t)=−2t+8 — la position est maximale EXACTEMENT quand la vitesse s\'annule (t=4 s), positive avant (avance), négative après (recule)',
          },
        },
        { kind: 'video', title: 'Un mobile filmé, position/vitesse superposées en direct' },
        {
          kind: 'rappel',
          label: 'La vitesse n\'est qu\'UN exemple parmi d\'autres grandeurs reliées par une dérivée',
          items: [
            'La dérivée s\'applique chaque fois qu\'une grandeur est le **taux de variation ' +
              'instantané** d\'une autre — $f\'(x) = \\displaystyle\\lim_{h \\to 0} ' +
              '\\dfrac{f(x+h)-f(x)}{h}$ ne change jamais, seule l\'interprétation physique ' +
              'change de nom.',
          ],
        },
        {
          kind: 'featureTable',
          headers: ['Fonction', 'Variable', 'Dérivée'],
          rows: [
            ['Distance parcourue', 'temps', 'vitesse instantanée'],
            ['Volume', 'temps', 'débit'],
            ['Coût de production', 'quantité produite', 'coût marginal (section 9)'],
            ['Concentration d\'un réactif', 'temps', 'vitesse de réaction'],
            ['Longueur d\'une barre métallique', 'température', 'coefficient de dilatation'],
          ],
        },
        {
          kind: 'para',
          text:
            'La dérivée sert aussi à **optimiser** n\'importe laquelle de ces grandeurs (coût ' +
            'minimal, volume maximal, aire maximale — sections 8 et 9) : la méthode reste ' +
            'toujours la même, dérivée nulle au point optimal, confirmée par un tableau de signes.',
        },
        {
          kind: 'attention',
          label: 'Vitesse négative ne veut pas dire « ralentir »',
          text:
            'v(t)<0 signifie que le mobile se déplace dans le sens NÉGATIF (il recule), pas ' +
            'qu\'il ralentit. Le mobile ralentit quand |v(t)| DIMINUE — ce qui dépend du signe ' +
            'de a(t) par rapport à celui de v(t), jamais du seul signe de v.',
        },
        {
          kind: 'astuce',
          label: 'La position est extrémale exactement quand v=0',
          text:
            'Comme pour tout extremum (section 4) : la position s(t) est maximale ou minimale ' +
            'au moment précis où sa dérivée v(t) s\'annule ET change de signe — repère toujours ' +
            'ce moment en premier, il structure toute l\'interprétation du mouvement.',
        },
        {
          kind: 'entrainement',
          title: 'Vitesse et position',
          generatorId: '5gen35',
          description: [
            'Dérive une position pour obtenir une vitesse, résous une équation de position, ' +
              'convertis une vitesse en km/h — sur un scénario narratif (sprint, natation, cyclisme...).',
          ],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 35. Vitesse et position »',
        },
      ],
    },
  ],

  recap: {
    items: [
      '**Définition de f\'(a)** — limite du taux d\'accroissement [f(a+h)−f(a)]/h quand h→0 ' +
        '(chapitre précédent), interprétée comme la pente de la tangente en a.',
      '**Tangente** — y=f(a)+f\'(a)(x−a) ; horizontale ⟺ f\'(a)=0 ; distincte d\'une sécante ' +
        '(qui relie deux points réels, pas un seul).',
      '**Fonction dérivée** — règles de la somme, du produit (u\'v+uv\'), du quotient ' +
        '((u\'v−uv\')/v²) et de la chaîne (u\'(x)·g\'(u(x))) ; jamais (uv)\'=u\'v\' ni (u/v)\'=u\'/v\'.',
      '**Signe de f\'/f\'\'** — f\'>0 ⟹ croissante, f\'<0 ⟹ décroissante, f\'=0 ET change de ' +
        'signe ⟹ extremum local ; f\'\'>0 ⟹ convexe, f\'\'<0 ⟹ concave, f\'\' change de signe ⟹ point d\'inflexion.',
      '**Étude locale** — tableau de signes de f\' ⟹ variations et extremums ; un point ' +
        'critique (f\'(a)=0) n\'est un extremum QUE si f\' change réellement de signe.',
      '**Étude complète** — domaine → f\' → signe → variations/extremums → limites et ' +
        'asymptotes (techniques du chapitre précédent) → synthèse.',
      '**Applications en contexte** — optimisation géométrique (dérivée nulle au point ' +
        'optimal), coût marginal = C\'(q), bénéfice maximal ⟺ Rm=Cm, extrema BORNÉS (comparer ' +
        'aussi aux bornes de l\'intervalle, pas seulement aux extremums locaux), vitesse v=s\' ' +
        'et accélération a=v\'=s\'\'.',
    ],
    checklist: {
      items: [
        'Ai-je vérifié que f\' change bien de signe avant d\'appeler un point critique un extremum ?',
        'Pour un produit ou un quotient : ai-je utilisé la formule complète, jamais le produit/quotient des dérivées ?',
        'Sur un intervalle FERMÉ : ai-je comparé les extremums locaux AUX valeurs des deux bornes ?',
        'Ma tangente vérifie-t-elle les deux conditions (passe par le point, ET a la bonne pente) ?',
      ],
    },
    forward:
      'La dérivée seconde et l\'étude de concavité posées ici (section 4) annoncent une ' +
      'lecture plus fine des courbes ; les techniques de limites et d\'asymptotes du chapitre ' +
      'précédent restent, elles, mobilisées à chaque étude complète — les deux chapitres se répondent directement.',
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen43',
      description: [
        '7 thèmes de 20 affirmations chacun (reconnaissance graphique, calcul par définition, ' +
          'fonction dérivée, tangentes, étude locale et graphique, étude complète, ' +
          'applications en contexte) — choisis un thème, réponds vrai ou faux, la ' +
          'justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 43. Dérivées et applications — quiz vrai/faux »',
    },
  },
}
