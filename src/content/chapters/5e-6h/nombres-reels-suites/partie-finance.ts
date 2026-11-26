import type { ChapterSection, FormulaireGroupe } from '../../../types'

/**
 * 5e (6h) — Nombres réels et suites, partie « Algèbre financière ».
 * Squelette posé par le coordinateur (26/11/2026) : ids, numéros, titres FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Garder le marqueur `// ⟨fin-etape …⟩` en dernière ligne de chaque `blocks`.
 *
 * Contenu rédigé par le chantier C d'après le manuel (pages « Algèbre financière » : introduction, explorations,
 * synthèse, exercices) : situations et progression reprises, nombres recalculés ou nouveaux par un script
 * (dossier de travail du chantier, `calculs.py`). Corrigés par rapport au manuel : 15 000 · 1,025⁴ = 16 557,19 ;
 * suite des valeurs acquises journalières indexée depuis le jour 0 ; scooter (24 × 75 € pour 1 740 €) : le taux
 * mensuel exact est 0,273 % (TAEG ≈ 3,33 %), pas 0,286 % ; coût du crédit 340,04 € avec la mensualité arrondie
 * (340,09 € sans arrondi) ; bon de caisse reformulé sans ambiguïté ; taux d'épargne ramenés à des valeurs
 * plausibles aujourd'hui ; précompte = donnée de l'énoncé. Pas de logarithme : une durée inconnue se trouve par la
 * table de la calculatrice (Casio Graph Math+), jamais par un menu financier.
 */
const R = String.raw

// ── Données des figures ────────────────────────────────────────────────────────────────────────────
/** § 14 : prêt de 10 000 € au TAEG de 6,4 % en 12 mensualités (parts intérêts / capital de chaque mensualité). */
const TAUX_MENSUEL_64 = Math.pow(1.064, 1 / 12) - 1
const MENSUALITE_64 = (10000 * TAUX_MENSUEL_64) / (1 - Math.pow(1 + TAUX_MENSUEL_64, -12))
const PARTS_64: { mois: number; interets: number; capital: number }[] = (() => {
  const lignes: { mois: number; interets: number; capital: number }[] = []
  let reste = 10000
  for (let mois = 1; mois <= 12; mois++) {
    const interets = reste * TAUX_MENSUEL_64
    const capital = MENSUALITE_64 - interets
    reste -= capital
    lignes.push({ mois, interets, capital })
  }
  return lignes
})()

/** § 14 : 12 000 € en 60 mensualités constantes à 0,4 % par mois (≈ 225,36 €). */
const MENSUALITE_CONSTANTE_12000 = (12000 * 0.004) / (1 - Math.pow(1.004, -60))

export const sectionsFinance: ChapterSection[] = [
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'interets',
    number: 11,
    title: 'Intérêt simple, intérêts composés',
    kicker: 'I = C₀·i·t et Cₙ = C₀(1 + i)ⁿ',
    titreCourt: 'Intérêts',
    partie: 'Algèbre financière',
    essentiel: [
      R`À **intérêt simple**, l'intérêt est proportionnel au capital, au taux et à la durée : $I = C_0\cdot i\cdot t$ et $C_t = C_0(1+i\cdot t)$, avec $t$ en années (jours exacts sur $365$, un mois vaut $\frac{1}{12}$ d'année).`,
      R`À **intérêts composés**, les intérêts s'ajoutent au capital à la fin de chaque période : $C_n = C_0(1+i)^n$, une suite géométrique de raison $1+i$. La valeur actuelle vaut $C_0 = C_n(1+i)^{-n}$.`,
      R`Le taux se retrouve par une racine $n$-ième, $i = \sqrt[n]{\frac{C_n}{C_0}} - 1$ ; une durée inconnue, par la table de la calculatrice : le premier $n$ qui convient.`,
    ],
    cartes: [
      { question: R`Intérêt rapporté par $1\,500$ € placés à $2{,}8\,\%$ pendant $68$ jours ?`, reponse: R`$I = 1\,500\cdot 0{,}028\cdot\frac{68}{365} \approx 7{,}82$ €.` },
      { question: 'Pourquoi les valeurs acquises à intérêts composés forment-elles une suite géométrique ?', reponse: R`Chaque période, le capital est multiplié par $1+i$ : $C_{k+1} = C_k + C_k\cdot i = C_k(1+i)$.` },
      { question: R`Après combien d'années un capital placé à $3\,\%$ a-t-il doublé ?`, reponse: R`$1{,}03^{23} \approx 1{,}974 < 2$ et $1{,}03^{24} \approx 2{,}033 \geq 2$ : après $24$ ans.` },
      { question: R`$10\,000$ € à $3\,\%$ pendant six mois : intérêt simple ou composé, lequel rapporte le plus ?`, reponse: R`L'intérêt simple : $10\,150$ € contre $10\,000\cdot 1{,}03^{0{,}5} \approx 10\,148{,}89$ €.` },
    ],
    blocks: [
      { kind: 'video', title: 'Intérêt simple et intérêts composés : valeur acquise, valeur actuelle, taux et durée' },
      {
        kind: 'para',
        text: R`Placer ses économies sur un compte d'épargne, emprunter pour acheter une voiture ou rénover une maison : dans les deux cas, celui qui prête l'argent est rémunéré. Cette rémunération s'appelle l'**intérêt**. Cette dernière partie du chapitre applique les suites arithmétiques ([[5e-6h/nombres-reels-suites#suites-arithmetiques|étape 7]]) et géométriques ([[5e-6h/nombres-reels-suites#suites-geometriques|étape 8]]) aux calculs d'épargne et d'emprunt.`,
      },
      {
        kind: 'historique',
        titre: '« L’argent ne fait pas de petits »',
        text: R`Dans l'Antiquité, le prêt à intérêt est souvent jugé immoral. Le philosophe grec **Aristote** le condamne : la monnaie sert à échanger, elle ne doit pas « engendrer » de la monnaie — en grec, le même mot, **tokos**, désigne le petit d'un animal et l'intérêt d'un prêt. Au Moyen Âge, l'Église condamne à son tour l'« usure ». Au 16e siècle, le réformateur **Jean Calvin** (1509–1564) admet un intérêt modéré, et le prêt à intérêt se répand dans les pays protestants ; en France, il est autorisé pendant la Révolution, en octobre 1789. Aujourd'hui, l'intérêt est vu comme la rémunération de celui qui se prive de son argent pendant un temps et qui prend le risque de ne pas être remboursé.`,
      },
      {
        kind: 'definition',
        label: 'Vocabulaire',
        items: [
          R`Le **capital** $C_0$ est la somme placée ou empruntée au départ.`,
          R`Le **taux d'intérêt** $i$ est l'intérêt rapporté par $1$ € pendant une période (une année, sauf mention contraire). On l'écrit en pour cent ou sous forme décimale : $2{,}5\,\% = 0{,}025$. Dans les formules, on utilise toujours la forme décimale.`,
          R`La **durée** du placement se note $t$ ; l'**intérêt** $I$ est ce que le capital a rapporté ; la **valeur acquise** est le capital augmenté des intérêts.`,
          R`Les mêmes formules servent pour l'épargne (la banque paie l'intérêt) et pour l'emprunt (l'emprunteur le paie).`,
        ],
      },
      { kind: 'subheading', text: 'Intérêt simple : proportionnel à la durée' },
      {
        kind: 'para',
        text: R`L'**intérêt simple** s'applique en général aux placements et aux prêts de courte durée, un an au plus. Les intérêts ne sont pas ajoutés au capital en cours de route : ils ne rapportent donc rien eux-mêmes, et l'intérêt est proportionnel au capital placé et à la durée du placement.`,
      },
      {
        kind: 'definition',
        label: 'Définition — intérêt simple et valeur acquise',
        items: [
          R`Un capital $C_0$ placé à intérêt simple au taux annuel $i$ pendant une durée $t$ (en années) rapporte l'intérêt $I = C_0\cdot i\cdot t$.`,
          R`Sa **valeur acquise** est $C_t = C_0 + C_0\cdot i\cdot t = C_0(1+i\cdot t)$.`,
          R`Conventions pour la durée : l'année compte $365$ jours et, pour une durée en jours, on compte le nombre **exact** de jours ($t = \frac{68}{365}$ pour $68$ jours) ; un mois vaut $\frac{1}{12}$ d'année, une quinzaine $\frac{1}{24}$.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'valeur acquise après un an, puis après sept mois',
        formula: R`Gaspard a revendu son vélo électrique et place les $3\,600$ € obtenus sur un compte d'épargne, à intérêt simple au taux annuel de $2{,}5\,\%$. De quel montant dispose-t-il s'il retire tout après un an ? Et s'il retire tout après sept mois ?`,
        steps: [
          { tag: 'après un an', text: R`$I = 3\,600\cdot 0{,}025\cdot 1 = 90$, donc la valeur acquise vaut $3\,600 + 90 = 3\,690$ €.` },
          { tag: 'sept mois en années', text: R`$t = \frac{7}{12}$ d'année.` },
          { tag: 'après sept mois', text: R`$I = 3\,600\cdot 0{,}025\cdot\frac{7}{12} = 52{,}50$, donc $C_t = 3\,600 + 52{,}50 = 3\,652{,}50$ €.` },
        ],
        result: { tag: 'résultat', text: R`$3\,690$ € après un an, $3\,652{,}50$ € après sept mois.` },
      },
      {
        kind: 'methode',
        label: 'Compter les jours exacts entre deux dates',
        items: [
          R`On compte le jour d'arrivée mais pas le jour de départ (jamais les deux) : du 15 au 16 mai, il y a $1$ jour.`,
          R`Jours restants dans le mois de départ, puis les mois entiers ($30$ ou $31$ jours ; février : $28$, ou $29$ les années bissextiles), puis les jours du mois d'arrivée.`,
          R`On divise le nombre de jours par $365$ pour obtenir $t$ en années.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'placement du 15 mai au 22 juillet',
        formula: R`Un capital de $1\,500$ € est placé à intérêt simple au taux annuel de $2{,}8\,\%$, du 15 mai au 22 juillet. Calcule la valeur acquise.`,
        steps: [
          { tag: 'compter les jours', text: R`Mai : $31 - 15 = 16$ jours ; juin : $30$ jours ; juillet : $22$ jours. Au total, $16 + 30 + 22 = 68$ jours.` },
          { tag: 'intérêt', text: R`$I = 1\,500\cdot 0{,}028\cdot\frac{68}{365} \approx 7{,}82$ €.` },
          { tag: 'valeur acquise', text: R`$C_t = 1\,500 + 7{,}82 = 1\,507{,}82$ €.` },
        ],
        result: { tag: 'résultat', text: R`$68$ jours, valeur acquise $1\,507{,}82$ €.` },
      },
      { kind: 'subheading', text: 'Jour après jour : une suite arithmétique' },
      {
        kind: 'para',
        text: R`Le **taux quotidien** vaut $\frac{i}{365}$ : chaque jour, le capital rapporte le même intérêt $\frac{C_0\cdot i}{365}$. Note $v_n$ la valeur acquise après $n$ jours. Le jour du dépôt, rien n'a encore été rapporté : $v_0 = C_0$. Ensuite, chaque jour ajoute la même quantité : $v_{n+1} = v_n + \frac{C_0\cdot i}{365}$.`,
      },
      {
        kind: 'definition',
        label: 'Suite des valeurs acquises journalières',
        items: [
          R`À intérêt simple, les valeurs acquises jour après jour forment une **suite arithmétique** de premier terme $v_0 = C_0$ et de raison $r = \frac{C_0\cdot i}{365}$ : $v_n = C_0 + n\cdot\frac{C_0\cdot i}{365}$.`,
          R`On numérote ici les termes à partir de $v_0$ (le jour du dépôt) : après $n$ jours, on a ajouté $n$ fois la raison, d'où le facteur $n$ et non $n - 1$ comme dans $u_n = u_1 + (n-1)r$.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — la suite des valeurs acquises jour après jour',
        blocks: [
          { kind: 'para', text: R`Pour le placement précédent ($1\,500$ € à $2{,}8\,\%$), écris la suite des valeurs acquises journalières, puis retrouve la valeur acquise au bout de $68$ jours.` },
          { kind: 'para', text: R`**Raison.** $r = \frac{1\,500\cdot 0{,}028}{365} \approx 0{,}1151$ € par jour : le capital rapporte un peu plus de $11$ centimes chaque jour.` },
          { kind: 'para', text: R`**Terme général.** $v_0 = 1\,500$ et $v_n = 1\,500 + n\cdot\frac{1\,500\cdot 0{,}028}{365}$.` },
          { kind: 'para', text: R`**Au bout de 68 jours.** $v_{68} = 1\,500 + 68\cdot\frac{42}{365} \approx 1\,507{,}82$ € : la même valeur que par la formule $C_t = C_0(1+i\cdot t)$. Pour le calcul, on garde la raison exacte $\frac{42}{365}$ : l'arrondi $0{,}1151$ multiplié par $68$ peut décaler le résultat d'un centime.` },
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — retrouver la durée, le taux ou le capital',
        blocks: [
          { kind: 'para', text: R`Dans chaque cas, le placement ou le prêt est à intérêt simple. **a)** $1\,800$ € placés à $2{,}4\,\%$ ont rapporté $25{,}20$ € : pendant combien de mois ? **b)** Tu empruntes $3\,000$ € et, quatre mois plus tard, tu rembourses $3\,045$ € : quel est le taux annuel ? **c)** Un placement de huit mois à $2{,}1\,\%$ a rapporté $42$ € : quel capital avait été placé ?` },
          { kind: 'para', text: R`**a) La durée.** De $I = C_0\cdot i\cdot t$, on tire $t = \frac{I}{C_0\cdot i} = \frac{25{,}20}{1\,800\cdot 0{,}024} = \frac{25{,}20}{43{,}2} \approx 0{,}5833$ an, soit $0{,}5833\cdot 12 = 7$ mois.` },
          { kind: 'para', text: R`**b) Le taux.** L'intérêt vaut $3\,045 - 3\,000 = 45$ € pour $t = \frac{4}{12}$ d'année : $i = \frac{I}{C_0\cdot t} = \frac{45}{3\,000\cdot\frac{4}{12}} = \frac{45}{1\,000} = 0{,}045$, soit $4{,}5\,\%$.` },
          { kind: 'para', text: R`**c) Le capital.** $C_0 = \frac{I}{i\cdot t} = \frac{42}{0{,}021\cdot\frac{8}{12}} = \frac{42}{0{,}014} = 3\,000$ €.` },
        ],
      },
      {
        kind: 'piege',
        label: 'Le taux en pour cent, la durée en mois',
        text: R`Écrire $1\,800\cdot 2{,}4\cdot 7$ donne $30\,240$ € d'intérêts pour sept mois : absurde. Dans la formule, le taux s'écrit sous forme décimale ($2{,}4\,\% = 0{,}024$) et la durée en années ($7$ mois $= \frac{7}{12}$ d'année), puisque le taux est annuel.`,
      },
      {
        kind: 'entrainement',
        title: 'Intérêt simple',
        generatorId: '56gen24',
        description: ['Calcule une valeur acquise ou un intérêt simple, puis retrouve le capital, le taux ou la durée. Les durées sont données en mois, en quinzaines ou entre deux dates : à toi de compter les jours exacts (année de 365 jours).'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 24. Intérêt simple »',
      },
      { kind: 'subheading', text: 'Intérêts composés : les intérêts produisent des intérêts' },
      {
        kind: 'intuition',
        label: 'Pour visualiser — une boule de neige',
        text: R`À intérêts composés, l'argent fait boule de neige : à la fin de chaque année, les intérêts sont ajoutés au capital (on dit qu'ils sont **capitalisés**), et l'année suivante, ils rapportent eux aussi des intérêts. La boule grossit d'autant plus vite qu'elle est déjà grosse : l'intérêt de chaque année est un peu plus grand que celui de l'année précédente, alors qu'à intérêt simple, il reste toujours le même.`,
      },
      {
        kind: 'para',
        text: R`Un couple dispose de $50\,000$ € et les place pendant cinq ans, à intérêts composés au taux annuel de $3{,}5\,\%$, pour acheter plus tard un logement. Chaque année, l'intérêt vaut $3{,}5\,\%$ du capital du début de l'année, puis il s'y ajoute :`,
      },
      {
        kind: 'featureTable',
        caption: '50 000 € à intérêts composés au taux annuel de 3,5 % (montants arrondis au centime, calculés sans arrondir en cours de route).',
        headers: ['Année', 'Capital au début', 'Intérêts de l’année', 'Valeur acquise à la fin'],
        rows: [
          ['$1$', '$50\\,000{,}00$', '$1\\,750{,}00$', '$51\\,750{,}00$'],
          ['$2$', '$51\\,750{,}00$', '$1\\,811{,}25$', '$53\\,561{,}25$'],
          ['$3$', '$53\\,561{,}25$', '$1\\,874{,}64$', '$55\\,435{,}89$'],
          ['$4$', '$55\\,435{,}89$', '$1\\,940{,}26$', '$57\\,376{,}15$'],
          ['$5$', '$57\\,376{,}15$', '$2\\,008{,}17$', '$59\\,384{,}32$'],
        ],
      },
      {
        kind: 'para',
        text: R`Les capitaux du début de chaque année, $50\,000$ ; $51\,750$ ; $53\,561{,}25$… ne forment pas une suite arithmétique (les intérêts augmentent), mais chacun s'obtient en multipliant le précédent par $1{,}035$ : c'est une suite géométrique de raison $1{,}035$. Au bout de cinq ans : $50\,000\cdot 1{,}035^5 \approx 59\,384{,}32$ €, sans passer par le tableau.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la valeur acquise à intérêts composés vaut Cₙ = C₀(1 + i)ⁿ',
        blocks: [
          { kind: 'para', text: R`Soit $C_0$ le capital initial, $i$ le taux par période et $C_k$ la valeur acquise après $k$ périodes.` },
          { kind: 'para', text: R`**Étape 1 — une période.** Pendant la période $k+1$, le capital $C_k$ rapporte l'intérêt $C_k\cdot i$, qui lui est ajouté : $C_{k+1} = C_k + C_k\cdot i = C_k(1+i)$.` },
          { kind: 'para', text: R`**Étape 2 — une suite géométrique.** Passer d'un terme au suivant revient toujours à multiplier par le même nombre $1+i$ : la suite $C_0$, $C_1$, $C_2$… est géométrique de raison $1+i$.` },
          { kind: 'para', text: R`**Étape 3 — le terme général.** En partant de $C_0$ : $C_1 = C_0(1+i)$, $C_2 = C_1(1+i) = C_0(1+i)^2$, $C_3 = C_0(1+i)^3$… Après $n$ périodes, on a multiplié $n$ fois par $1+i$ : $C_n = C_0(1+i)^n$. (Les termes sont numérotés à partir de $C_0$ : l'exposant est $n$, et non $n-1$ comme dans $u_n = u_1\cdot q^{n-1}$.)` },
        ],
      },
      {
        kind: 'definition',
        label: 'Valeur acquise à intérêts composés',
        items: [
          R`Un capital $C_0$ placé à intérêts composés au taux $i$ par période a, après $n$ périodes, la valeur acquise $C_n = C_0(1+i)^n$.`,
          R`La période est souvent l'année, mais peut être le semestre, le trimestre ou le mois : le taux $i$ et le nombre $n$ de périodes doivent alors se rapporter à la **même** période.`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'valeur acquise au bout de quatre ans',
        formula: R`On place $15\,000$ € à intérêts composés au taux annuel de $2{,}5\,\%$ pendant quatre ans. Calcule la valeur acquise au terme du placement.`,
        steps: [
          { tag: 'formule', text: R`$C_n = C_0(1+i)^n$ avec $C_0 = 15\,000$, $i = 0{,}025$ et $n = 4$.` },
          { tag: 'calcul', text: R`$C_4 = 15\,000\cdot 1{,}025^4 \approx 16\,557{,}19$ €.` },
        ],
        result: { tag: 'résultat', text: R`La valeur acquise vaut $16\,557{,}19$ €, dont $1\,557{,}19$ € d'intérêts.` },
      },
      {
        kind: 'exemple',
        badge: 'capitalisation semestrielle',
        formula: R`Un capital de $25\,000$ € est placé pendant cinq ans au taux semestriel de $1{,}25\,\%$ ; les intérêts sont capitalisés chaque semestre. Calcule la valeur acquise.`,
        steps: [
          { tag: 'même période', text: R`Le taux est semestriel : on compte en semestres. Cinq ans font $n = 10$ semestres.` },
          { tag: 'calcul', text: R`$C_{10} = 25\,000\cdot 1{,}0125^{10} \approx 28\,306{,}77$ €.` },
        ],
        result: { tag: 'résultat', text: R`$28\,306{,}77$ € au bout de cinq ans.` },
      },
      { kind: 'subheading', text: 'Valeur actuelle, taux, durée' },
      {
        kind: 'para',
        text: R`La formule $C_n = C_0(1+i)^n$ relie quatre nombres : on peut chercher n'importe lequel des quatre quand on connaît les trois autres. Chercher $C_0$ s'appelle **actualiser** : $C_0 = \frac{C_n}{(1+i)^n} = C_n(1+i)^{-n}$ est la **valeur actuelle** du montant $C_n$ disponible dans $n$ périodes.`,
      },
      {
        kind: 'exemple',
        badge: 'valeur actuelle d’un capital futur',
        formula: R`Pour les études de ses enfants, un parent veut disposer de $30\,000$ € dans quinze ans. Quel montant doit-il placer aujourd'hui, à intérêts composés au taux annuel de $2{,}5\,\%$ ?`,
        steps: [
          { tag: 'actualiser', text: R`$C_0 = C_n(1+i)^{-n} = 30\,000\cdot 1{,}025^{-15}$.` },
          { tag: 'calcul', text: R`$C_0 \approx 20\,713{,}97$ €.` },
          { tag: 'vérifier', text: R`$20\,713{,}97\cdot 1{,}025^{15} \approx 30\,000$ €.` },
        ],
        result: { tag: 'résultat', text: R`Il doit placer $20\,713{,}97$ € aujourd'hui.` },
      },
      {
        kind: 'exemple',
        badge: 'retrouver le taux',
        formula: R`Il y a trois ans, Léa a placé $4\,000$ € à intérêts composés. Aujourd'hui, la banque lui remet $4\,370$ €. Quel était le taux annuel du placement ?`,
        steps: [
          { tag: 'poser l’équation', text: R`$4\,000\cdot(1+i)^3 = 4\,370$, donc $(1+i)^3 = \frac{4\,370}{4\,000} = 1{,}0925$.` },
          { tag: 'racine cubique', text: R`$1 + i = \sqrt[3]{1{,}0925} \approx 1{,}029929$, donc $i \approx 0{,}0299$.` },
        ],
        result: { tag: 'résultat', text: R`Le taux annuel vaut environ $2{,}99\,\%$.` },
      },
      {
        kind: 'rappel',
        label: 'Retrouver le taux',
        items: [R`De $C_n = C_0(1+i)^n$ : $(1+i)^n = \frac{C_n}{C_0}$, donc $i = \sqrt[n]{\frac{C_n}{C_0}} - 1$. À la calculatrice, la racine $n$-ième s'obtient aussi comme la puissance $\frac{1}{n}$.`],
      },
      {
        kind: 'exemple',
        badge: 'en combien d’années un capital double-t-il ?',
        formula: R`Je place $1\,000$ € à intérêts composés au taux annuel de $3\,\%$. Au bout de combien d'années mon capital aura-t-il doublé ?`,
        steps: [
          { tag: 'poser l’inéquation', text: R`On cherche le plus petit entier $n$ tel que $1\,000\cdot 1{,}03^n \geq 2\,000$, c'est-à-dire $1{,}03^n \geq 2$.` },
          { tag: 'table de la calculatrice', text: R`Dans le menu Table, on entre la fonction $Y_1 = 1{,}03^X$, de $X = 1$ à $X = 30$ par pas de $1$, et on lit : $1{,}03^{22} \approx 1{,}9161$, $1{,}03^{23} \approx 1{,}9736$, $1{,}03^{24} \approx 2{,}0328$.` },
          { tag: 'premier n qui convient', text: R`$1{,}03^{23} < 2$ mais $1{,}03^{24} \geq 2$ : le capital dépasse $2\,000$ € pour la première fois après $24$ ans.` },
        ],
        result: { tag: 'résultat', text: R`Le capital a doublé au bout de $24$ ans.` },
      },
      {
        kind: 'astuce',
        label: 'Une durée inconnue : la table, pas une formule',
        text: R`Quand l'inconnue $n$ est en exposant, on ne sait pas encore l'isoler par un calcul (il faudra pour cela les logarithmes). On essaie des valeurs entières de $n$, le plus vite avec la table de la calculatrice, et on garde le **premier** $n$ qui convient : la réponse est un nombre entier de périodes.`,
      },
      {
        kind: 'historique',
        titre: 'La règle de 72, déjà chez Pacioli (1494)',
        text: R`En 1494, le moine italien **Luca Pacioli** publie à Venise un grand traité d'arithmétique, la **Summa de arithmetica**. Il y donne, sans la justifier, une règle de banquier : pour savoir en combien d'années un capital double, on divise $72$ par le taux annuel en pour cent. À $3\,\%$ : $\frac{72}{3} = 24$ ans, exactement ce que donne la table. À $6\,\%$ : $\frac{72}{6} = 12$ ans, et en effet $1{,}06^{12} \approx 2{,}012$. Ce n'est qu'une approximation, bonne pour des taux de quelques pour cent : à $2{,}5\,\%$, elle annonce $28{,}8$ ans, alors qu'il en faut $29$ ($1{,}025^{28} \approx 1{,}996$).`,
      },
      { kind: 'subheading', text: 'Durée non entière, durée de moins d’un an' },
      {
        kind: 'para',
        text: R`Quand la durée n'est pas un nombre entier d'années, les banques la découpent en deux : les années entières à **intérêts composés**, puis la fraction d'année restante à **intérêt simple**, sur la valeur acquise à la fin des années entières.`,
      },
      {
        kind: 'exemple',
        badge: 'deux ans et un trimestre',
        formula: R`Un capital de $2\,000$ € est placé sur un compte d'épargne au taux annuel de $3\,\%$ pendant deux ans et un trimestre. Calcule l'intérêt produit.`,
        steps: [
          { tag: 'deux années entières', text: R`$2\,000\cdot 1{,}03^2 = 2\,121{,}80$ €, soit $121{,}80$ € d'intérêts.` },
          { tag: 'le trimestre, à intérêt simple', text: R`$2\,121{,}80\cdot 0{,}03\cdot\frac{1}{4} \approx 15{,}91$ €.` },
          { tag: 'total', text: R`$121{,}80 + 15{,}91 = 137{,}71$ €.` },
        ],
        result: { tag: 'résultat', text: R`L'intérêt total vaut $137{,}71$ €.` },
      },
      {
        kind: 'para',
        text: R`Cette convention n'est pas un hasard : sur moins d'un an, l'intérêt simple rapporte un peu **plus** que l'intérêt composé, et le client y gagne. Pour $10\,000$ € à $3\,\%$ :`,
      },
      {
        kind: 'featureTable',
        caption: 'Valeurs acquises par 10 000 € au taux annuel de 3 % : 10 000 · (1 + 0,03 · t) à intérêt simple, 10 000 · 1,03ᵗ à intérêts composés.',
        headers: ['Durée', 'Intérêt simple', 'Intérêts composés', 'Le plus avantageux'],
        rows: [
          ['un mois', '$10\\,025{,}00$', '$10\\,024{,}66$', 'simple'],
          ['six mois', '$10\\,150{,}00$', '$10\\,148{,}89$', 'simple'],
          ['un an', '$10\\,300{,}00$', '$10\\,300{,}00$', 'égalité'],
          ['deux ans', '$10\\,600{,}00$', '$10\\,609{,}00$', 'composés'],
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [
            { fn: (t: number) => 1000 * (1 + t), tone: 'good' },
            { fn: (t: number) => 1000 * Math.pow(2, t), tone: 'accent' },
          ],
          xMin: 0,
          xMax: 2.2,
          xTicks: [0.5, 1, 1.5, 2],
          xTickLabels: { 0.5: '0,5', 1.5: '1,5' },
          yTicks: [1000, 2000, 3000, 4000],
          fixedYRange: { min: 0, max: 4700 },
          points: [{ x: 1, y: 2000, label: 'un an', tone: 'bad', labelPos: 'below' }],
          textLabels: [
            { x: 1.55, y: 3550, text: 'composés', tone: 'accent', anchor: 'end' },
            { x: 1.75, y: 2300, text: 'simple', tone: 'good', anchor: 'start' },
          ],
          xAxisLabel: 't (années)',
          yAxisLabel: 'valeur acquise',
          caption: R`$1\,000$ € à intérêt simple (droite) et à intérêts composés (courbe), avec un taux de $100\,\%$ irréaliste, choisi pour que l'écart se voie : la droite est au-dessus de la courbe avant un an, en dessous après.`,
        },
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — sur une fraction d’année, l’intérêt simple rapporte plus',
        blocks: [
          { kind: 'para', text: R`Soit un taux annuel $i > 0$ et un entier $k \geq 2$. On montre qu'après $\frac{1}{k}$ d'année (six mois pour $k = 2$, un mois pour $k = 12$), la valeur acquise à intérêt simple, $C_0\left(1 + \frac{i}{k}\right)$, dépasse la valeur acquise à intérêts composés, $C_0(1+i)^{\frac{1}{k}}$.` },
          { kind: 'para', text: R`**Étape 1 — une inégalité connue.** Pour $h > 0$ et un entier $k \geq 2$, on a $(1+h)^k > 1 + kh$ : en distribuant le produit de $k$ facteurs $(1+h)$, on obtient $1$, puis $k$ fois $h$, puis d'autres termes tous positifs (voir [[5e-6h/nombres-reels-suites#limite-suite|étape 9]]).` },
          { kind: 'para', text: R`**Étape 2 — avec** $\boldsymbol{h = \frac{i}{k}}$**.** $\left(1 + \frac{i}{k}\right)^k > 1 + k\cdot\frac{i}{k} = 1 + i$.` },
          { kind: 'para', text: R`**Étape 3 — conclure.** Les deux membres sont positifs : en prenant la racine $k$-ième, $1 + \frac{i}{k} > \sqrt[k]{1+i} = (1+i)^{\frac{1}{k}}$. On multiplie par $C_0 > 0$ : l'intérêt simple rapporte plus. Pour $k = 2$ et $i = 0{,}03$ : $1{,}015^2 = 1{,}030225 > 1{,}03$.` },
        ],
      },
      {
        kind: 'entrainement',
        title: 'Intérêts composés',
        generatorId: '56gen25',
        description: ['Calcule une valeur acquise ou une valeur actuelle à intérêts composés, retrouve le taux par une racine n-ième, cherche une durée par la table de la calculatrice (doublement compris) et traite une durée non entière avec la convention des banques.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 25. Intérêts composés »',
      },
      {
        kind: 'atelier',
        tag: 'simple-compose-widget',
        label: 'Manipule toi-même : intérêt simple ou intérêts composés ?',
        caption:
          'Pour 10 000 € placés, la valeur acquise à intérêt simple suit une droite, celle à intérêts composés une courbe. Elles se croisent au bout d’un an : avant, l’intérêt simple rapporte un peu plus ; après, les intérêts composés l’emportent. Augmente le taux pour mieux voir l’écart.',
      },
      // ⟨fin-etape interets⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'taux-equivalents',
    number: 12,
    title: 'Taux équivalents et taux réel',
    kicker: 'même valeur acquise, périodes différentes',
    titreCourt: 'Taux équivalents',
    partie: 'Algèbre financière',
    essentiel: [
      R`Deux taux sont **équivalents** s'ils donnent la même valeur acquise à un même capital placé pendant la même durée : $(1+i_{\text{semestriel}})^2 = 1+i_{\text{annuel}}$, $(1+i_{\text{trimestriel}})^4 = 1+i_{\text{annuel}}$, $(1+i_{\text{mensuel}})^{12} = 1+i_{\text{annuel}}$.`,
      R`Le taux annuel équivalent à un taux périodique s'appelle le **taux réel** : on compare des offres par leurs taux réels.`,
      R`Diviser le taux annuel par $4$ ou par $12$ ne donne pas le taux équivalent : à $2{,}4\,\%$ par an correspond $1{,}024^{\frac{1}{4}} - 1 \approx 0{,}5947\,\%$ par trimestre, pas $0{,}6\,\%$.`,
    ],
    cartes: [
      { question: R`Taux réel d'un placement à $0{,}25\,\%$ par mois ?`, reponse: R`$1{,}0025^{12} - 1 \approx 0{,}030416$, soit $3{,}0416\,\%$.` },
      { question: R`Taux semestriel équivalent au taux annuel de $6\,\%$ ?`, reponse: R`$\sqrt{1{,}06} - 1 \approx 0{,}02956$, soit $2{,}956\,\%$.` },
      { question: R`Une voiture perd $2{,}4\,\%$ de sa valeur chaque mois : quelle part perd-elle en un an ?`, reponse: R`$1 - 0{,}976^{12} \approx 0{,}2529$ : environ $25{,}29\,\%$, pas $28{,}8\,\%$.` },
      { question: R`Taux brut de $3\,\%$, précompte de $30\,\%$ sur les intérêts (donnée de l'énoncé) : taux net ?`, reponse: R`$3\,\%\cdot 0{,}7 = 2{,}1\,\%$.` },
    ],
    blocks: [
      { kind: 'video', title: 'Taux équivalents : comparer un taux mensuel, trimestriel et annuel' },
      {
        kind: 'para',
        text: R`Une banque annonce un taux par trimestre, une autre un taux par mois, une troisième un taux par an. Pour savoir laquelle est la plus intéressante, il faut ramener ces taux à la même période : on cherche des **taux équivalents**.`,
      },
      {
        kind: 'definition',
        label: 'Définition — taux équivalents, taux réel',
        items: [
          R`Deux taux sont **équivalents** si, appliqués (à intérêts composés) à un même capital pendant la même durée, ils donnent la même valeur acquise.`,
          R`Le taux annuel équivalent à un taux semestriel, trimestriel ou mensuel s'appelle le **taux réel** du placement ou du prêt.`,
        ],
      },
      {
        kind: 'para',
        text: R`Une ligne du temps aide à voir la situation. Avec $0{,}6\,\%$ par trimestre, $1\,000$ € sont multipliés quatre fois par $1{,}006$ en un an :`,
      },
      {
        kind: 'operationChain',
        nodes: ['0 mois : $1\\,000$', '3 mois : $1\\,006$', '6 mois : $1\\,012{,}04$', '9 mois : $1\\,018{,}11$', '12 mois : $1\\,024{,}22$'],
        operations: ['× 1,006', '× 1,006', '× 1,006', '× 1,006'],
      },
      {
        kind: 'para',
        text: R`Sur l'année entière, c'est une seule multiplication par $1{,}006^4 \approx 1{,}0242$ : ce placement est équivalent à un taux annuel de $2{,}42\,\%$, et non de $4\cdot 0{,}6 = 2{,}4\,\%$, car les intérêts de chaque trimestre rapportent à leur tour.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — les relations entre taux équivalents',
        blocks: [
          { kind: 'para', text: R`Note $i_{\text{annuel}}$, $i_{\text{semestriel}}$, $i_{\text{trimestriel}}$ et $i_{\text{mensuel}}$ des taux équivalents, et place un capital $C_0$ pendant un an.` },
          { kind: 'para', text: R`**Étape 1 — la valeur acquise de chaque façon.** Une année, c'est $1$ an, $2$ semestres, $4$ trimestres ou $12$ mois. D'après $C_n = C_0(1+i)^n$, la valeur acquise vaut $C_0(1+i_{\text{annuel}})$, ou $C_0(1+i_{\text{semestriel}})^2$, ou $C_0(1+i_{\text{trimestriel}})^4$, ou $C_0(1+i_{\text{mensuel}})^{12}$.` },
          { kind: 'para', text: R`**Étape 2 — égaler.** Les taux sont équivalents : ces quatre valeurs sont égales. On divise par $C_0 \neq 0$ : $(1+i_{\text{semestriel}})^2 = (1+i_{\text{trimestriel}})^4$ $= (1+i_{\text{mensuel}})^{12} = 1+i_{\text{annuel}}$.` },
          { kind: 'para', text: R`**Étape 3 — isoler.** Par une racine (ou une puissance fractionnaire) : $i_{\text{mensuel}} = (1+i_{\text{annuel}})^{\frac{1}{12}} - 1$, $i_{\text{trimestriel}} = (1+i_{\text{annuel}})^{\frac{1}{4}} - 1$, $i_{\text{semestriel}} = \sqrt{1+i_{\text{annuel}}} - 1$.` },
          { kind: 'para', text: R`Sur $n$ années, les deux membres seraient simplement élevés à la puissance $n$ : l'équivalence ne dépend pas de la durée.` },
        ],
      },
      {
        kind: 'rappel',
        label: 'Les relations entre taux équivalents',
        items: [
          R`$(1+i_{\text{semestriel}})^2 = 1+i_{\text{annuel}}$`,
          R`$(1+i_{\text{trimestriel}})^4 = 1+i_{\text{annuel}}$`,
          R`$(1+i_{\text{mensuel}})^{12} = 1+i_{\text{annuel}}$`,
        ],
      },
      {
        kind: 'exemple',
        badge: 'comparer trois offres de placement',
        formula: R`Mireille veut placer $1\,000$ € pendant un an. Trois banques lui proposent, à intérêts composés : A, $0{,}6\,\%$ par trimestre ; B, $0{,}19\,\%$ par mois ; C, $2{,}4\,\%$ par an. Quelle offre est la plus intéressante ?`,
        steps: [
          { tag: 'offre A', text: R`$1{,}006^4 - 1 \approx 0{,}02422$ : taux réel $2{,}422\,\%$.` },
          { tag: 'offre B', text: R`$1{,}0019^{12} - 1 \approx 0{,}02304$ : taux réel $2{,}304\,\%$ (et non $12\cdot 0{,}19 = 2{,}28\,\%$).` },
          { tag: 'offre C', text: R`Le taux est déjà annuel : $2{,}4\,\%$.` },
          { tag: 'comparer', text: R`$2{,}422\,\% > 2{,}4\,\% > 2{,}304\,\%$. Après un an, Mireille aurait $1\,024{,}22$ €, $1\,024{,}00$ € ou $1\,023{,}04$ €.` },
        ],
        result: { tag: 'résultat', text: R`L'offre A, à $0{,}6\,\%$ par trimestre, est la plus intéressante.` },
      },
      {
        kind: 'piege',
        label: 'Diviser le taux annuel par 4 ou par 12',
        text: R`Le taux trimestriel équivalent à $2{,}4\,\%$ par an n'est **pas** $\frac{2{,}4\,\%}{4} = 0{,}6\,\%$ : c'est $1{,}024^{\frac{1}{4}} - 1 \approx 0{,}5947\,\%$. Avec $0{,}6\,\%$ par trimestre, les intérêts capitalisés chaque trimestre donnent un peu plus que $2{,}4\,\%$ sur l'année ($2{,}42\,\%$, voir l'offre A). Le taux équivalent sur une période plus courte est toujours un peu **plus petit** que la simple division.`,
      },
      {
        kind: 'exemple',
        badge: 'taux semestriel équivalent à 6 % par an',
        formula: R`Un prêt est accordé au taux annuel de $6\,\%$, mais remboursé chaque semestre. Calcule le taux semestriel équivalent.`,
        steps: [
          { tag: 'relation', text: R`$(1+i_{\text{semestriel}})^2 = 1{,}06$.` },
          { tag: 'racine carrée', text: R`$i_{\text{semestriel}} = \sqrt{1{,}06} - 1 \approx 0{,}029563$.` },
        ],
        result: { tag: 'résultat', text: R`Le taux semestriel équivalent vaut environ $2{,}956\,\%$ (et non $3\,\%$).` },
      },
      {
        kind: 'exemple',
        badge: 'taux réel d’un taux mensuel',
        formula: R`Quel est le taux réel correspondant à un taux mensuel de $0{,}25\,\%$ ?`,
        steps: [
          { tag: 'relation', text: R`$1 + i_{\text{annuel}} = (1 + 0{,}0025)^{12}$.` },
          { tag: 'calcul', text: R`$i_{\text{annuel}} = 1{,}0025^{12} - 1 \approx 0{,}030416$.` },
        ],
        result: { tag: 'résultat', text: R`Le taux réel vaut $3{,}0416\,\%$.` },
      },
      { kind: 'subheading', text: 'Taux net, dépréciation, baisse sur plusieurs années' },
      {
        kind: 'para',
        text: R`En Belgique, la banque retient sur les intérêts de certains placements un impôt, le **précompte mobilier**, qu'elle verse à l'État. Son taux dépend du produit et a changé au fil des années : dans un exercice, il est toujours **donné par l'énoncé**. Si un précompte de $p$ (en décimal) est retenu chaque année sur les intérêts, le taux **net** vaut $i\cdot(1-p)$ : avec un taux brut de $3\,\%$ et un précompte de $30\,\%$, le taux net vaut $3\,\%\cdot 0{,}7 = 2{,}1\,\%$.`,
      },
      {
        kind: 'exemple',
        badge: 'montant remboursé et taux réel d’un bon de caisse',
        formula: R`Un bon de caisse de $500$ € est placé pendant cinq ans au taux annuel de $2{,}1\,\%$ ; les intérêts sont capitalisés chaque année. Au terme, la banque retient sur le total des intérêts un précompte de $30\,\%$ (donnée de l'énoncé). Calcule le montant remboursé et le taux réel net du placement.`,
        steps: [
          { tag: 'valeur acquise brute', text: R`$500\cdot 1{,}021^5 \approx 554{,}75$ €, soit $54{,}75$ € d'intérêts.` },
          { tag: 'précompte', text: R`$0{,}30\cdot 54{,}7518 \approx 16{,}43$ € ; l'épargnant garde $70\,\%$ des intérêts.` },
          { tag: 'montant remboursé', text: R`$500 + 0{,}7\cdot 54{,}7518 \approx 538{,}33$ € (on garde les intérêts non arrondis en mémoire de la calculatrice).` },
          { tag: 'taux réel net', text: R`On cherche $i$ tel que $500(1+i)^5 = 538{,}33$ : $i = \sqrt[5]{\frac{538{,}33}{500}} - 1 \approx 0{,}01488$.` },
        ],
        result: { tag: 'résultat', text: R`$538{,}33$ € remboursés ; taux réel net $\approx 1{,}49\,\%$ (un peu plus que $2{,}1\,\%\cdot 0{,}7 = 1{,}47\,\%$, car ici le précompte n'est retenu qu'à la fin).` },
      },
      {
        kind: 'exemple',
        badge: 'dépréciation mensuelle, dépréciation annuelle',
        formula: R`Une voiture perd $2{,}4\,\%$ de sa valeur chaque mois. Quel pourcentage de sa valeur perd-elle en un an ?`,
        steps: [
          { tag: 'un mois', text: R`Perdre $2{,}4\,\%$, c'est multiplier la valeur par $1 - 0{,}024 = 0{,}976$.` },
          { tag: 'douze mois', text: R`En un an, la valeur est multipliée par $0{,}976^{12} \approx 0{,}7471$.` },
          { tag: 'perte annuelle', text: R`$1 - 0{,}7471 = 0{,}2529$.` },
        ],
        result: { tag: 'résultat', text: R`La voiture perd environ $25{,}29\,\%$ de sa valeur par an (et non $12\cdot 2{,}4 = 28{,}8\,\%$).` },
      },
      {
        kind: 'exemple',
        badge: 'un glacier qui fond',
        formula: R`**a)** Un glacier perd $3\,\%$ de son volume chaque année. Quel pourcentage de son volume perd-il en dix ans ? **b)** Un autre glacier a perdu $13\,\%$ de son volume en dix ans. Quelle est sa perte annuelle moyenne, si elle est la même chaque année ?`,
        steps: [
          { tag: 'a) dix années', text: R`Le volume est multiplié par $0{,}97^{10} \approx 0{,}7374$ : la perte vaut $1 - 0{,}7374 \approx 26{,}3\,\%$ (et non $30\,\%$).` },
          { tag: 'b) poser l’équation', text: R`Si $t$ est la perte annuelle : $(1-t)^{10} = 1 - 0{,}13 = 0{,}87$.` },
          { tag: 'b) racine dixième', text: R`$1 - t = \sqrt[10]{0{,}87} \approx 0{,}98617$, donc $t \approx 0{,}0138$.` },
        ],
        result: { tag: 'résultat', text: R`**a)** environ $26{,}3\,\%$ en dix ans ; **b)** environ $1{,}38\,\%$ par an.` },
      },
      {
        kind: 'application',
        titre: 'Annoncer une hausse des prix sur un an',
        text: R`Les instituts de statistique mesurent l'évolution des prix chaque mois, mais on parle surtout de l'**inflation sur un an**. Si les prix montent de $0{,}3\,\%$ chaque mois pendant un an, ils ne montent pas de $12\cdot 0{,}3 = 3{,}6\,\%$ : chaque hausse s'applique à des prix déjà augmentés, et sur l'année les prix sont multipliés par $1{,}003^{12} \approx 1{,}0366$, soit $3{,}66\,\%$. C'est exactement le calcul d'un taux réel : passer d'un taux mensuel à un taux annuel équivalent. Le même calcul, à l'envers, sert à comparer un salaire indexé, un loyer ou une pension avec la hausse des prix.`,
        domaines: ['Économie', 'Statistique'],
      },
      {
        kind: 'entrainement',
        title: 'Taux équivalents et taux réel',
        generatorId: '56gen26',
        description: ['Passe d’un taux annuel à un taux semestriel, trimestriel ou mensuel équivalent (et inversement), compare deux offres par leurs taux réels, calcule un taux net de précompte et transforme une dépréciation mensuelle en dépréciation annuelle.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 26. Taux équivalents et taux réel »',
      },
      // ⟨fin-etape taux-equivalents⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'annuites',
    number: 13,
    title: 'Annuités : placer et rembourser',
    kicker: 'valeur acquise Vₙ, valeur actuelle V₀',
    titreCourt: 'Annuités',
    partie: 'Algèbre financière',
    essentiel: [
      R`Des **annuités** sont des versements de même montant $a$ à des dates équidistantes (des **mensualités** s'ils sont mensuels).`,
      R`Valeur acquise au moment du dernier des $n$ versements : $V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$ ; une période plus tard, on multiplie encore par $1+i$.`,
      R`Valeur actuelle, une période avant le premier versement : $V_0 = a\cdot\dfrac{1-(1+i)^{-n}}{i} = V_n(1+i)^{-n}$.`,
    ],
    cartes: [
      { question: R`$1\,200$ € versés chaque année pendant cinq ans à $3\,\%$ : valeur au moment du 5e versement ?`, reponse: R`$V_5 = 1\,200\cdot\dfrac{1{,}03^5 - 1}{0{,}03} \approx 6\,370{,}96$ €.` },
      { question: 'Pourquoi la valeur acquise d’une suite d’annuités est-elle une somme géométrique ?', reponse: R`Les versements capitalisés valent $a$, $a(1+i)$, …, $a(1+i)^{n-1}$ : raison $1+i$.` },
      { question: R`$2\,000$ € remboursés chaque année pendant quatre ans à $4\,\%$ : combien peut-on emprunter ?`, reponse: R`$V_0 = 2\,000\cdot\dfrac{1 - 1{,}04^{-4}}{0{,}04} \approx 7\,259{,}79$ €.` },
      { question: 'Valeur un an après le dernier versement annuel : que change-t-on à Vₙ ?', reponse: R`On le multiplie par $1+i$ : $V_n(1+i)$.` },
    ],
    blocks: [
      { kind: 'video', title: 'Annuités : valeur acquise et valeur actuelle d’une suite de versements' },
      {
        kind: 'definition',
        label: 'Définition — annuités',
        items: [
          R`On appelle **annuités** une suite de paiements dont les échéances sont fixées à des dates **équidistantes** (chaque année, chaque mois…). Quand les échéances sont mensuelles, on parle de **mensualités**.`,
          R`On étudie ici seulement des **annuités constantes** : tous les versements ont le même montant $a$. Le taux $i$ est le taux par période entre deux versements (un taux mensuel pour des mensualités).`,
          R`Deux situations : **constituer un capital** (on verse régulièrement sur un compte d'épargne) et **rembourser un emprunt** (on rembourse régulièrement la banque).`,
        ],
      },
      { kind: 'subheading', text: 'Constituer un capital : la valeur acquise' },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — cinq versements de 1 200 €',
        blocks: [
          { kind: 'para', text: R`Lucas dépose $1\,200$ € sur un compte d'épargne chaque 1er janvier, de 2027 à 2031. Le taux annuel reste fixé à $3\,\%$, les intérêts sont capitalisés chaque année. De quel montant dispose-t-il le 1er janvier 2031, juste après son cinquième versement ?` },
          { kind: 'para', text: R`Chaque versement est capitalisé jusqu'au 1er janvier 2031 : le premier pendant $4$ ans, le dernier pas du tout.` },
          {
            kind: 'featureTable',
            headers: ['Versement', 'Le 1er janvier', 'Valeur le 1er janvier 2031'],
            rows: [
              ['1er', '2027', '$1\\,200\\cdot 1{,}03^4 \\approx 1\\,350{,}61$'],
              ['2e', '2028', '$1\\,200\\cdot 1{,}03^3 \\approx 1\\,311{,}27$'],
              ['3e', '2029', '$1\\,200\\cdot 1{,}03^2 = 1\\,273{,}08$'],
              ['4e', '2030', '$1\\,200\\cdot 1{,}03 = 1\\,236{,}00$'],
              ['5e', '2031', '$1\\,200{,}00$'],
            ],
          },
          { kind: 'para', text: R`**Somme.** $S = 1\,200 + 1\,200\cdot 1{,}03$ $+ 1\,200\cdot 1{,}03^2 + 1\,200\cdot 1{,}03^3$ $+ 1\,200\cdot 1{,}03^4$ $\approx 6\,370{,}96$ €. Lucas a versé $6\,000$ € : les intérêts lui ont rapporté $370{,}96$ €.` },
        ],
      },
      {
        kind: 'para',
        text: R`Avec quinze ou soixante versements, le tableau deviendrait fastidieux. Mais la somme $1\,200\,(1 + 1{,}03 + 1{,}03^2 + 1{,}03^3 + 1{,}03^4)$ est celle des termes consécutifs d'une suite géométrique de raison $1{,}03$ ([[5e-6h/nombres-reels-suites#suites-geometriques|étape 8]]) : une formule la donne d'un coup.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la valeur acquise de n annuités constantes',
        blocks: [
          { kind: 'para', text: R`Soit $n$ versements de montant $a$, à intervalles d'une période, au taux $i$ par période, et $V_n$ la valeur acquise au moment du dernier versement.` },
          { kind: 'para', text: R`**Étape 1 — la valeur de chaque versement.** Le dernier versement n'a rien rapporté : il vaut $a$. L'avant-dernier a été capitalisé pendant une période : $a(1+i)$. … Le premier l'a été pendant $n-1$ périodes : $a(1+i)^{n-1}$.` },
          { kind: 'para', text: R`**Étape 2 — une somme géométrique.** $V_n = a + a(1+i) + a(1+i)^2$ $+ \ldots + a(1+i)^{n-1}$ : ce sont les $n$ premiers termes d'une suite géométrique de premier terme $a$ et de raison $q = 1+i$.` },
          { kind: 'para', text: R`**Étape 3 — appliquer la formule de la somme.** $S_n = u_1\cdot\dfrac{q^n - 1}{q - 1}$ avec $u_1 = a$ et $q - 1 = i$ : $V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$.` },
          { kind: 'para', text: R`Pour Lucas : $V_5 = 1\,200\cdot\dfrac{1{,}03^5 - 1}{0{,}03} \approx 6\,370{,}96$ €, comme avec le tableau.` },
        ],
      },
      {
        kind: 'definition',
        label: 'Valeur acquise d’une suite d’annuités constantes',
        items: [
          R`La valeur acquise par $n$ versements de montant $a$, au taux $i$ par période, **au moment du dernier versement**, vaut $V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$.`,
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [],
          xMin: 0,
          xMax: 5.8,
          xTicks: [1, 2, 3, 4, 5],
          yTicks: [2000, 4000, 6000],
          fixedYRange: { min: 0, max: 7600 },
          points: [
            { x: 1, y: 1200, label: '1 200', tone: 'accent', labelPos: 'above' },
            { x: 2, y: 2436, label: '2 436', tone: 'accent', labelPos: 'above' },
            { x: 3, y: 3709.08, label: '3 709,08', tone: 'accent', labelPos: 'above' },
            { x: 4, y: 5020.35, label: '5 020,35', tone: 'accent', labelPos: 'above' },
            { x: 5, y: 6370.96, label: '6 370,96', tone: 'accent', labelPos: 'above' },
          ],
          xAxisLabel: 'versements',
          yAxisLabel: 'solde (€)',
          caption: R`Le compte de Lucas juste après chaque versement : chaque année, le solde est multiplié par $1{,}03$, puis augmenté de $1\,200$ €. Les écarts entre deux points grandissent légèrement ($1\,236$ ; $1\,273{,}08$ ; $1\,311{,}27$ ; $1\,350{,}61$).`,
        },
      },
      {
        kind: 'exemple',
        badge: 'quinze versements de 900 €',
        formula: R`On verse $900$ € par an pendant quinze ans sur un compte rémunéré à $3{,}2\,\%$ par an (intérêts capitalisés). Quelle est la valeur acquise au moment du dernier versement ?`,
        steps: [
          { tag: 'formule', text: R`$V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$ avec $a = 900$, $i = 0{,}032$, $n = 15$.` },
          { tag: 'calcul', text: R`$V_{15} = 900\cdot\dfrac{1{,}032^{15} - 1}{0{,}032} \approx 16\,986{,}58$ €.` },
          { tag: 'interpréter', text: R`On a versé $15\cdot 900 = 13\,500$ € : les intérêts ont rapporté $3\,486{,}58$ €.` },
        ],
        result: { tag: 'résultat', text: R`$16\,986{,}58$ € au moment du quinzième versement.` },
      },
      { kind: 'subheading', text: 'Un an après le dernier versement, versements en début de période' },
      {
        kind: 'para',
        text: R`Si l'argent reste placé une période de plus après le dernier versement, il rapporte encore des intérêts : la valeur acquise est multipliée par $1+i$. Un an après son dernier versement, Lucas dispose de $6\,370{,}96\cdot 1{,}03 \approx 6\,562{,}09$ €. C'est aussi le cas des versements faits au **début** de chaque période quand on regarde le capital à la **fin** de la dernière période : chaque versement a été capitalisé une période de plus.`,
      },
      {
        kind: 'exemple',
        badge: 'retrouver le montant des versements',
        formula: R`Je veux disposer de $10\,000$ € un an après le dernier de dix versements annuels égaux, au taux annuel de $2{,}5\,\%$. Quel montant dois-je verser chaque année ?`,
        steps: [
          { tag: 'poser l’équation', text: R`Un an après le dernier versement : $a\cdot\dfrac{1{,}025^{10} - 1}{0{,}025}\cdot 1{,}025 = 10\,000$.` },
          { tag: 'isoler a', text: R`$a = \dfrac{10\,000\cdot 0{,}025}{(1{,}025^{10} - 1)\cdot 1{,}025} \approx 870{,}82$ €.` },
          { tag: 'comparer', text: R`Si les $10\,000$ € étaient retirés au moment du dixième versement, il faudrait verser un peu plus : $\dfrac{10\,000\cdot 0{,}025}{1{,}025^{10} - 1} \approx 892{,}59$ € par an.` },
        ],
        result: { tag: 'résultat', text: R`Il faut verser $870{,}82$ € par an.` },
      },
      {
        kind: 'piege',
        label: 'Compter les versements et repérer la date',
        text: R`Dans $V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$, $n$ est le **nombre de versements**, et la valeur est calculée **au moment du dernier**. Cinq versements du 1er janvier 2027 au 1er janvier 2031 : $n = 5$, même si quatre années seulement séparent le premier du dernier. Une période après le dernier versement, il faut encore multiplier par $1+i$.`,
      },
      { kind: 'subheading', text: 'Rembourser un emprunt : la valeur actuelle' },
      {
        kind: 'para',
        text: R`Un emprunteur rembourse la banque par des versements réguliers. Le montant qu'il peut emprunter aujourd'hui est la **valeur actuelle** de tous ses remboursements : chacun est actualisé jusqu'à la date de l'emprunt.`,
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — quel budget pour des travaux ?',
        blocks: [
          { kind: 'para', text: R`Arthur et Emma veulent rénover leur maison. Ils peuvent rembourser $2\,000$ € par an pendant quatre ans, au taux annuel de $4\,\%$. Ils empruntent le 1er janvier 2027, et le premier remboursement a lieu le 31 décembre 2027. Quel montant peuvent-ils emprunter ?` },
          { kind: 'para', text: R`**Actualiser chaque remboursement au 1er janvier 2027.** Le premier a lieu une année plus tard, le dernier quatre années plus tard : $2\,000\cdot 1{,}04^{-1} \approx 1\,923{,}08$ ; $2\,000\cdot 1{,}04^{-2} \approx 1\,849{,}11$ ; $2\,000\cdot 1{,}04^{-3} \approx 1\,777{,}99$ ; $2\,000\cdot 1{,}04^{-4} \approx 1\,709{,}61$.` },
          { kind: 'para', text: R`**Additionner.** $V_0 \approx 1\,923{,}08 + 1\,849{,}11$ $+ 1\,777{,}99 + 1\,709{,}61$ $= 7\,259{,}79$ € (somme calculée sans arrondir en cours de route).` },
          { kind: 'para', text: R`**Autre chemin.** La valeur acquise des quatre remboursements le 31 décembre 2030 vaut $V_4 = 2\,000\cdot\dfrac{1{,}04^4 - 1}{0{,}04} \approx 8\,492{,}93$ €. Actualisée de quatre ans : $8\,492{,}93\cdot 1{,}04^{-4} \approx 7\,259{,}79$ €, le même montant.` },
        ],
      },
      {
        kind: 'definition',
        label: 'Valeur actuelle d’une suite d’annuités constantes',
        items: [
          R`La **valeur actuelle** d'une suite de versements constants et équidistants est sa valeur **une période avant le premier versement** : $V_0 = V_n(1+i)^{-n} = a\cdot\dfrac{1-(1+i)^{-n}}{i}$.`,
          R`Pour un emprunt remboursé par $n$ versements $a$ (le premier une période après l'emprunt), $V_0$ est le montant emprunté.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la valeur actuelle de n annuités constantes',
        blocks: [
          { kind: 'para', text: R`Mêmes notations : $n$ versements $a$, au taux $i$ par période, le premier une période après la date $0$.` },
          { kind: 'para', text: R`**Étape 1 — de** $\boldsymbol{V_n}$ **à** $\boldsymbol{V_0}$**.** Les $n$ versements valent $V_n$ au moment du dernier, c'est-à-dire $n$ périodes après la date $0$. Actualiser de $n$ périodes, c'est multiplier par $(1+i)^{-n}$ : $V_0 = V_n(1+i)^{-n}$.` },
          { kind: 'para', text: R`**Étape 2 — remplacer** $\boldsymbol{V_n}$**.** $V_0 = a\cdot\dfrac{(1+i)^n - 1}{i}\cdot(1+i)^{-n}$.` },
          { kind: 'para', text: R`**Étape 3 — distribuer.** $\left((1+i)^n - 1\right)(1+i)^{-n} = 1 - (1+i)^{-n}$, donc $V_0 = a\cdot\dfrac{1-(1+i)^{-n}}{i}$.` },
        ],
      },
      {
        kind: 'exemple',
        badge: 'versements réguliers ou placement unique ?',
        formula: R`Deux amis veulent disposer du même capital dans dix ans. Le premier verse $90$ € au début de chaque mois sur un compte rémunéré à $2{,}3\,\%$ par an (intérêts composés). Le second place aujourd'hui une seule somme, aux mêmes conditions. Quel montant doit-il placer, et de quel capital disposeront-ils dans dix ans ?`,
        steps: [
          { tag: 'taux mensuel équivalent', text: R`$i = 1{,}023^{\frac{1}{12}} - 1 \approx 0{,}1897\,\%$ par mois.` },
          { tag: 'capital du premier', text: R`$120$ versements en début de mois, regardés à la fin du dernier mois : $V = 90\cdot\dfrac{(1+i)^{120} - 1}{i}\cdot(1+i)$ $\approx 12\,138{,}04$ €.` },
          { tag: 'placement unique', text: R`Dans dix ans, ce montant doit être atteint : $C_0 = 12\,138{,}04\cdot 1{,}023^{-10} \approx 9\,669{,}24$ €.` },
          { tag: 'comparer', text: R`Le premier aura versé $120\cdot 90 = 10\,800$ € en tout, le second $9\,669{,}24$ € d'un coup, mais dès aujourd'hui.` },
        ],
        result: { tag: 'résultat', text: R`Le second place $9\,669{,}24$ € ; dans dix ans, chacun dispose de $12\,138{,}04$ €.` },
      },
      {
        kind: 'application',
        titre: 'Épargner pour sa pension',
        text: R`L'épargne-pension, l'assurance-groupe proposée par un employeur ou un simple plan d'épargne mensuel fonctionnent comme les annuités de Lucas : de petits versements réguliers pendant des dizaines d'années, capitalisés au fil du temps. La formule $V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$ montre pourquoi les conseillers insistent pour commencer tôt : pour $n$ grand, le facteur $(1+i)^n$ grandit vite. Avec $50$ € par mois à $0{,}2\,\%$ par mois, $20$ ans de versements donnent environ $15\,382$ €, et $40$ ans environ $40\,230$ € : plus de deux fois et demie autant, alors qu'on n'a versé que le double.`,
        domaines: ['Économie', 'Finance personnelle'],
      },
      {
        kind: 'entrainement',
        title: 'Annuités : placement et remboursement',
        generatorId: '56gen27',
        description: ['Calcule la valeur acquise d’une suite de versements (au moment du dernier ou une période après), la valeur actuelle d’un remboursement, ou retrouve le montant des versements, avec des versements en début ou en fin de période ; le corrigé dessine la ligne du temps.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 27. Annuités : placement et remboursement »',
      },
      {
        kind: 'atelier',
        tag: 'ligne-temps-annuites-widget',
        label: 'Manipule toi-même : la ligne du temps des annuités',
        caption:
          'Règle le versement, leur nombre et le taux, puis choisis la date d’évaluation : chaque versement est capitalisé (flèche vers la droite, × (1 + i) par période) ou actualisé (vers la gauche, × (1 + i)⁻¹). La somme des valeurs donne Vₙ, V₀ ou Vₙ(1 + i).',
      },
      // ⟨fin-etape annuites⟩
    ],
  },
  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  {
    id: 'credit',
    number: 14,
    title: 'Crédit à la consommation',
    kicker: 'TAEG, mensualité, tableau d’amortissement',
    titreCourt: 'Crédit',
    partie: 'Algèbre financière',
    essentiel: [
      R`Un **crédit à la consommation** finance les besoins privés d'une personne (un bien, un service) ; le **TAEG** exprime sur un an son coût total, intérêts **et** frais compris.`,
      R`Mensualité d'un capital $C$ remboursé en $n$ mois : $m = \dfrac{C\cdot i}{1-(1+i)^{-n}}$, avec le taux mensuel équivalent $i = (1+\text{TAEG})^{\frac{1}{12}} - 1$.`,
      R`**Coût du crédit** = total des mensualités − montant emprunté. Dans le tableau d'amortissement, les intérêts du mois valent capital restant dû $\times\, i$, et l'amortissement vaut mensualité − intérêts.`,
    ],
    cartes: [
      { question: R`$10\,000$ € au TAEG de $6{,}4\,\%$, remboursés en $12$ mois : mensualité ?`, reponse: R`$i = 1{,}064^{\frac{1}{12}} - 1 \approx 0{,}5183\,\%$ et $m \approx 861{,}67$ €.` },
      { question: 'Coût de ce crédit ?', reponse: R`$12\cdot 861{,}67 - 10\,000 = 340{,}04$ € (avec la mensualité arrondie).` },
      { question: 'Une ligne du tableau d’amortissement : comment calcule-t-on les intérêts et l’amortissement ?', reponse: R`Intérêts = capital restant dû $\times$ taux mensuel ; amortissement = mensualité − intérêts.` },
      { question: R`Prêt de $12\,000$ € en $60$ mois, amortissement constant, $0{,}4\,\%$ par mois sur le capital restant : quelle suite forment les intérêts ?`, reponse: R`Une suite arithmétique de premier terme $48$ € et de raison $-0{,}80$ €.` },
    ],
    blocks: [
      { kind: 'video', title: 'Crédit à la consommation : TAEG, mensualité et tableau d’amortissement' },
      {
        kind: 'para',
        text: R`Une voiture, un ordinateur, des travaux : beaucoup d'achats importants sont financés par un crédit. Les annuités de l'étape précédente donnent l'outil de calcul ; il reste à connaître le vocabulaire et les règles propres au crédit.`,
      },
      {
        kind: 'definition',
        label: 'Définition — crédit à la consommation',
        items: [
          R`D'après le SPF Économie, un **crédit à la consommation** est un crédit accordé à une personne qui vit habituellement en Belgique et agit surtout dans un but privé : pour acheter un bien (une voiture, une télévision…), payer un service (l'organisation d'un mariage…) ou, plus généralement, financer des besoins privés.`,
          R`Un **crédit hypothécaire**, destiné à acheter ou construire un bien immobilier, n'est **pas** un crédit à la consommation : il obéit à d'autres règles.`,
        ],
      },
      {
        kind: 'list',
        items: [
          R`le **prêt à tempérament** : une somme prêtée pour une durée fixée, remboursée par des mensualités constantes (des travaux, des frais médicaux…) ;`,
          R`la **vente à tempérament** : l'achat d'un bien ou d'un service payé en plusieurs mensualités, souvent proposé par le vendeur ;`,
          R`le **crédit-bail** (ou **leasing**) : la location d'un bien, avec la possibilité de l'acheter à la fin du contrat ;`,
          R`l'**ouverture de crédit** : une réserve d'argent dans laquelle on puise selon ses besoins, souvent avec une carte.`,
        ],
      },
      {
        kind: 'definition',
        label: 'Définition — le TAEG',
        items: [
          R`Le **taux annuel effectif global** (TAEG) exprime, sous la forme d'un taux annuel, le **coût total** du crédit : il comprend les intérêts **et** tous les frais liés au contrat (frais de dossier, assurances obligatoires…).`,
          R`La loi fixe des TAEG maximums, selon le montant et la durée du crédit ; ils sont révisés périodiquement et publiés par le SPF Économie. Ces règles figurent aujourd'hui dans le livre VII du Code de droit économique.`,
          R`Un crédit à la consommation se rembourse par **mensualités constantes** : chacune comprend une part d'intérêts et une part de capital.`,
        ],
      },
      { kind: 'subheading', text: 'La mensualité' },
      {
        kind: 'exempleLibre',
        label: 'Démonstration — la formule de la mensualité',
        blocks: [
          { kind: 'para', text: R`Un capital $C$ est emprunté au TAEG donné et remboursé par $n$ mensualités égales $m$, la première un mois après l'emprunt.` },
          { kind: 'para', text: R`**Étape 1 — le taux mensuel.** Les versements sont mensuels : il faut le taux mensuel équivalent au TAEG ([[5e-6h/nombres-reels-suites#taux-equivalents|étape 12]]) : $(1+i)^{12} = 1 + \text{TAEG}$, donc $i = (1+\text{TAEG})^{\frac{1}{12}} - 1$.` },
          { kind: 'para', text: R`**Étape 2 — le capital est la valeur actuelle des mensualités.** Le montant emprunté vaut la valeur actuelle des $n$ remboursements ([[5e-6h/nombres-reels-suites#annuites|étape 13]]) : $C = m\cdot\dfrac{1-(1+i)^{-n}}{i}$.` },
          { kind: 'para', text: R`**Étape 3 — isoler** $\boldsymbol{m}$**.** On multiplie par $i$ et on divise par $1-(1+i)^{-n}$ (non nul, car $(1+i)^{-n} < 1$) : $m = \dfrac{C\cdot i}{1-(1+i)^{-n}}$.` },
        ],
      },
      {
        kind: 'rappel',
        label: 'Mensualité d’un crédit',
        items: [R`$m = \dfrac{C\cdot i}{1-(1+i)^{-n}}$, avec $C$ le capital emprunté, $n$ le nombre de mensualités et $i = (1+\text{TAEG})^{\frac{1}{12}} - 1$ le taux mensuel équivalent au TAEG.`],
      },
      {
        kind: 'exemple',
        badge: 'mensualité et coût d’un prêt de 10 000 €',
        formula: R`Un prêt de $10\,000$ €, accordé au TAEG de $6{,}4\,\%$, doit être remboursé en $12$ mensualités. Calcule la mensualité et le coût du crédit.`,
        steps: [
          { tag: 'taux mensuel', text: R`$i = 1{,}064^{\frac{1}{12}} - 1 \approx 0{,}005183$, soit $0{,}5183\,\%$ par mois.` },
          { tag: 'mensualité', text: R`$m = \dfrac{10\,000\cdot i}{1-(1+i)^{-12}} \approx 861{,}67$ € (on garde $i$ en mémoire de la calculatrice, sans l'arrondir).` },
          { tag: 'total remboursé', text: R`$12\cdot 861{,}67 = 10\,340{,}04$ €.` },
          { tag: 'coût du crédit', text: R`$10\,340{,}04 - 10\,000 = 340{,}04$ €.` },
        ],
        result: { tag: 'résultat', text: R`$12$ mensualités de $861{,}67$ € ; le crédit coûte $340{,}04$ €.` },
      },
      {
        kind: 'attention',
        label: 'Un coût calculé avec la mensualité arrondie',
        text: R`Le coût de $340{,}04$ € utilise la mensualité **arrondie** au centime, celle que l'emprunteur paie réellement. Avec la valeur exacte de la mensualité ($861{,}6740$…), on trouverait $12\cdot 861{,}6740 - 10\,000 \approx 340{,}09$ €. Les $5$ centimes d'écart viennent seulement de l'arrondi, multiplié par $12$ ; dans la pratique, le prêteur ajuste souvent la dernière mensualité.`,
      },
      {
        kind: 'piege',
        label: 'Le coût du crédit',
        text: R`Le coût du crédit est la **différence** entre le total des mensualités et le montant emprunté : $340{,}04$ €, et non le total payé ($10\,340{,}04$ €). Ce n'est pas non plus $6{,}4\,\%$ de $10\,000$ €, soit $640$ € : le capital dû diminue de mois en mois, et les intérêts ne portent que sur ce qui reste à rembourser.`,
      },
      {
        kind: 'exemple',
        badge: 'un scooter financé en 24 mensualités',
        formula: R`Karim achète un scooter à $1\,740$ €, sans acompte. Le vendeur lui propose de le financer par $24$ mensualités de $75$ €. Calcule le coût du financement, puis vérifie que le taux mensuel vaut environ $0{,}273\,\%$ et déduis-en le TAEG.`,
        steps: [
          { tag: 'coût', text: R`$24\cdot 75 - 1\,740 = 1\,800 - 1\,740 = 60$ €.` },
          { tag: 'vérifier le taux mensuel', text: R`Avec $i = 0{,}00273$ : $75\cdot\dfrac{1-1{,}00273^{-24}}{0{,}00273} \approx 1\,740{,}00$ € : la valeur actuelle des mensualités est bien le prix du scooter.` },
          { tag: 'TAEG', text: R`$1{,}00273^{12} - 1 \approx 0{,}0333$.` },
        ],
        result: { tag: 'résultat', text: R`Le financement coûte $60$ € ; le TAEG vaut environ $3{,}33\,\%$.` },
      },
      { kind: 'subheading', text: 'Le tableau d’amortissement' },
      {
        kind: 'definition',
        label: 'Tableau d’amortissement',
        items: [
          R`Le **tableau d'amortissement** indique, pour chaque mensualité, sa part d'**intérêts**, sa part de capital remboursé (l'**amortissement**) et le **capital restant dû** après paiement.`,
          R`Pour chaque ligne : intérêts = capital restant dû au mois précédent $\times\, i$ ; amortissement = mensualité − intérêts ; capital restant dû = capital restant dû précédent − amortissement. Un tableur le construit facilement, ligne après ligne.`,
        ],
      },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — les premières lignes du tableau du scooter',
        blocks: [
          { kind: 'para', text: R`Complète les trois premières lignes du tableau d'amortissement du financement du scooter ($1\,740$ €, $24$ mensualités de $75$ €, taux mensuel $i \approx 0{,}273\,\%$).` },
          { kind: 'para', text: R`**Mois 1.** Intérêts : $1\,740\cdot 0{,}00273 \approx 4{,}75$ € ; amortissement : $75 - 4{,}75 = 70{,}25$ € ; reste dû : $1\,740 - 70{,}25 = 1\,669{,}75$ €.` },
          { kind: 'para', text: R`**Mois 2.** Intérêts : $1\,669{,}75\cdot 0{,}00273 \approx 4{,}56$ € ; amortissement : $70{,}44$ € ; reste dû : $1\,599{,}31$ €. **Mois 3.** Intérêts $\approx 4{,}37$ €, amortissement $70{,}63$ €, reste dû $1\,528{,}68$ €.` },
          {
            kind: 'featureTable',
            headers: ['Mois', 'Intérêts', 'Amortissement', 'Reste dû'],
            rows: [
              ['$0$', '', '', '$1\\,740{,}00$'],
              ['$1$', '$4{,}75$', '$70{,}25$', '$1\\,669{,}75$'],
              ['$2$', '$4{,}56$', '$70{,}44$', '$1\\,599{,}31$'],
              ['$3$', '$4{,}37$', '$70{,}63$', '$1\\,528{,}68$'],
            ],
          },
        ],
      },
      {
        kind: 'intuition',
        label: 'Pourquoi la part d’intérêts diminue-t-elle ?',
        text: R`Chaque mois, les intérêts portent sur ce qui reste à rembourser. Comme la mensualité est toujours la même, la part qui sert aux intérêts diminue à mesure que la dette fond, et la part qui rembourse le capital grandit d'autant : au début, on paie surtout des intérêts ; à la fin, presque uniquement du capital.`,
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [],
          xMin: 0.4,
          xMax: 12.6,
          xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
          yTicks: [200, 400, 600, 800],
          fixedYRange: { min: 0, max: 960 },
          horizontalAsymptotes: [{ y: MENSUALITE_64 }],
          points: [
            ...PARTS_64.map((l) => ({ x: l.mois, y: l.capital, label: l.mois === 6 ? 'part capital' : '', tone: 'accent' as const, labelPos: 'below' as const })),
            ...PARTS_64.map((l) => ({ x: l.mois, y: l.interets, label: l.mois === 6 ? 'part intérêts' : '', tone: 'good' as const, labelPos: 'above' as const })),
          ],
          xAxisLabel: 'mois',
          yAxisLabel: '€',
          caption: R`Prêt de $10\,000$ € au TAEG de $6{,}4\,\%$ en $12$ mois : chaque mensualité de $861{,}67$ € (en pointillés) se partage entre les intérêts (de $51{,}83$ € le premier mois à $4{,}44$ € le dernier) et le capital remboursé (de $809{,}84$ € à $857{,}23$ €).`,
        },
      },
      { kind: 'subheading', text: 'Amortissement constant ou mensualité constante' },
      {
        kind: 'exempleLibre',
        label: 'Exemple résolu — un prêt à amortissement constant',
        blocks: [
          { kind: 'para', text: R`Une jeune ébéniste emprunte $12\,000$ € à ses parents pour s'installer. Elle rembourse chaque mois la même part du capital pendant $60$ mois, et paie en plus un intérêt de $0{,}4\,\%$ sur le capital qui reste dû au début du mois. Quelles suites forment les colonnes du tableau ? Combien d'intérêts paiera-t-elle en tout ?` },
          { kind: 'para', text: R`**Amortissement.** $\frac{12\,000}{60} = 200$ € chaque mois : une suite constante.` },
          { kind: 'para', text: R`**Capital restant dû** après $k$ mois : $12\,000 - 200k$ : une suite arithmétique de raison $-200$.` },
          { kind: 'para', text: R`**Intérêts** du mois $k$ : $0{,}004\cdot\left(12\,000 - 200(k-1)\right)$ $= 48 - 0{,}8(k-1)$ : une suite arithmétique de premier terme $48$ € et de raison $-0{,}80$ €. Le dernier mois, ils valent $48 - 0{,}8\cdot 59 = 0{,}80$ €.` },
          { kind: 'para', text: R`**Mensualité** du mois $k$ : $200 + 48 - 0{,}8(k-1) = 248 - 0{,}8(k-1)$ : arithmétique elle aussi, de $248$ € à $200{,}80$ €.` },
          { kind: 'para', text: R`**Total des intérêts** : somme des $60$ termes d'une suite arithmétique, $S_{60} = \frac{60\,(48 + 0{,}80)}{2} = 1\,464$ €.` },
          { kind: 'para', text: R`**Comparaison.** Avec $60$ mensualités constantes au même taux de $0{,}4\,\%$ par mois, $m = \dfrac{12\,000\cdot 0{,}004}{1-1{,}004^{-60}} \approx 225{,}36$ € et les intérêts totalisent $60\cdot 225{,}36 - 12\,000 \approx 1\,521{,}41$ €. L'amortissement constant coûte moins cher, parce que le capital est remboursé plus vite au début ; en échange, les premières mensualités sont plus lourdes ($248$ € au lieu de $225{,}36$ €).` },
        ],
      },
      {
        kind: 'illustration',
        illustration: {
          kind: 'curvePlot',
          curves: [
            { fn: (t: number) => 248 - 0.8 * (t - 1), tone: 'good', xMin: 1, xMax: 60 },
            { fn: () => MENSUALITE_CONSTANTE_12000, tone: 'accent', xMin: 1, xMax: 60 },
          ],
          xMin: 0,
          xMax: 63,
          xTicks: [12, 24, 36, 48, 60],
          yTicks: [50, 100, 150, 200, 250],
          fixedYRange: { min: 0, max: 330 },
          textLabels: [
            { x: 12, y: 268, text: 'amortissement constant', tone: 'good', anchor: 'start' },
            { x: 4, y: 205, text: 'mensualité constante', tone: 'accent', anchor: 'start' },
          ],
          xAxisLabel: 'mois',
          yAxisLabel: 'mensualité (€)',
          caption: R`$12\,000$ € remboursés en $60$ mois à $0{,}4\,\%$ par mois. Avec l'amortissement constant, les mensualités forment une suite arithmétique décroissante, de $248$ € à $200{,}80$ € ; avec des mensualités constantes, on paie $225{,}36$ € chaque mois. Seules les valeurs aux mois entiers ont un sens.`,
        },
      },
      {
        kind: 'application',
        titre: 'Comparer deux offres de crédit',
        text: R`Une offre annonce un taux d'intérêt bas mais des frais de dossier élevés, une autre l'inverse : laquelle choisir ? C'est pour répondre à cette question que la loi impose d'afficher le **TAEG** dans toute publicité chiffrée pour un crédit. Le prêteur calcule le taux annuel pour lequel la valeur actuelle de **tout** ce que l'emprunteur paie (mensualités, frais, assurances obligatoires) est égale au montant réellement reçu : c'est l'équation de l'étape 13, résolue pour le taux. Deux offres de même durée se comparent alors par un seul nombre : le TAEG le plus bas est l'offre la moins chère.`,
        domaines: ['Économie', 'Droit de la consommation'],
      },
      {
        kind: 'entrainement',
        title: 'Crédit et tableau d’amortissement',
        generatorId: '56gen28',
        description: ['Calcule le taux mensuel équivalent au TAEG, la mensualité et le coût d’un crédit, complète deux lignes d’un tableau d’amortissement, puis étudie un prêt à amortissement constant, où intérêts et mensualités forment des suites arithmétiques.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 28. Crédit et tableau d’amortissement »',
      },
      {
        kind: 'entrainement',
        title: 'Quelle formule ? Reconnaître le problème financier',
        generatorId: '56gen23',
        description: ['Lis une situation d’épargne ou d’emprunt, reconnais le type de problème (intérêt simple, intérêts composés, taux équivalent, annuités, mensualité), la grandeur cherchée et la formule à utiliser, sans faire le calcul.'],
        chantier: '5e-6h',
        whereLabel: '5e (6h) → « 23. Quelle formule ? Reconnaître le problème financier »',
      },
      {
        kind: 'atelier',
        tag: 'simulateur-credit-widget',
        label: 'Manipule toi-même : simulateur de crédit',
        caption:
          'Règle le capital emprunté, le TAEG et la durée : le simulateur calcule le taux mensuel équivalent, la mensualité et le coût du crédit. Les barres montrent, mois après mois, la part d’intérêts (qui diminue) et la part de capital remboursé (qui augmente) ; le tableau d’amortissement détaille chaque ligne.',
      },
      // ⟨fin-etape credit⟩
    ],
  },
]

/** Puces de « Ce qu'il faut retenir » de cette partie (KaTeX, voir content-authoring.md « Synthèses en KaTeX »). */
export const recapItemsFinance: string[] = [
  R`**Intérêt simple** : $I = C_0\cdot i\cdot t$ et $C_t = C_0(1+i\cdot t)$, avec $t$ en années (jours exacts sur $365$, un mois $= \frac{1}{12}$) ; jour après jour, les valeurs acquises forment une suite arithmétique de raison $\frac{C_0\cdot i}{365}$.`,
  R`**Intérêts composés** : $C_n = C_0(1+i)^n$, suite géométrique de raison $1+i$ ; valeur actuelle $C_0 = C_n(1+i)^{-n}$ ; taux $i = \sqrt[n]{\frac{C_n}{C_0}} - 1$ ; durée : premier $n$ qui convient, par la table de la calculatrice.`,
  R`**Taux équivalents** : $(1+i_{\text{semestriel}})^2$ $= (1+i_{\text{trimestriel}})^4$ $= (1+i_{\text{mensuel}})^{12}$ $= 1+i_{\text{annuel}}$ ; le taux annuel équivalent est le taux réel.`,
  R`**Annuités** : $V_n = a\cdot\dfrac{(1+i)^n-1}{i}$ au moment du dernier versement, $V_0 = a\cdot\dfrac{1-(1+i)^{-n}}{i} = V_n(1+i)^{-n}$ une période avant le premier.`,
  R`**Crédit** : mensualité $m = \dfrac{C\cdot i}{1-(1+i)^{-n}}$ avec $i = (1+\text{TAEG})^{\frac{1}{12}} - 1$ ; coût du crédit = total des mensualités − montant emprunté.`,
]

/** Groupes du formulaire de fin de chapitre pour cette partie (formules utiles aux générateurs). */
export const formulaireGroupesFinance: FormulaireGroupe[] = [
  {
    title: 'Intérêt simple',
    formulas: [
      { text: R`$I = C_0\cdot i\cdot t$`, condition: R`$t$ en années : jours exacts sur $365$, mois sur $12$, quinzaines sur $24$.` },
      { text: R`$C_t = C_0(1+i\cdot t)$`, condition: 'Valeur acquise.' },
    ],
  },
  {
    title: 'Intérêts composés',
    formulas: [
      { text: R`$C_n = C_0(1+i)^n$`, condition: R`$i$ et $n$ se rapportent à la même période.` },
      { text: R`$C_0 = C_n(1+i)^{-n}$`, condition: 'Valeur actuelle.' },
      { text: R`$i = \sqrt[n]{\frac{C_n}{C_0}} - 1$`, condition: R`Durée inconnue : premier $n$ qui convient, par la table.` },
      { text: R`Durée non entière : années entières à intérêts composés, puis fraction d'année à intérêt simple.` },
    ],
  },
  {
    title: 'Taux équivalents',
    formulas: [
      { text: R`$(1+i_{\text{semestriel}})^2 = 1+i_{\text{annuel}}$` },
      { text: R`$(1+i_{\text{trimestriel}})^4 = 1+i_{\text{annuel}}$` },
      { text: R`$(1+i_{\text{mensuel}})^{12} = 1+i_{\text{annuel}}$` },
      { text: R`Taux net : $i\cdot(1-p)$`, condition: R`$p$ : précompte (donnée de l'énoncé).` },
    ],
  },
  {
    title: 'Annuités',
    formulas: [
      { text: R`$V_n = a\cdot\dfrac{(1+i)^n - 1}{i}$`, condition: 'Au moment du dernier versement ; une période plus tard : × (1 + i).' },
      { text: R`$V_0 = a\cdot\dfrac{1-(1+i)^{-n}}{i} = V_n(1+i)^{-n}$`, condition: 'Une période avant le premier versement.' },
    ],
  },
  {
    title: 'Crédit',
    formulas: [
      { text: R`$i = (1+\text{TAEG})^{\frac{1}{12}} - 1$`, condition: 'Taux mensuel équivalent au TAEG.' },
      { text: R`$m = \dfrac{C\cdot i}{1-(1+i)^{-n}}$`, condition: R`Mensualité d'un capital $C$ remboursé en $n$ mois.` },
      { text: 'Coût du crédit = total des mensualités − montant emprunté.' },
      { text: 'Intérêts = capital restant dû × i ; amortissement = mensualité − intérêts.' },
    ],
  },
]
