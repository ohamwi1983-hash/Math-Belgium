import type { ChapterContent, IllustrationSpec } from '../../types'

/**
 * 5e (4h), chapitre 6 — Statistique à deux variables.
 * Squelette posé par le coordinateur (25/11/2026) : ids de sections FIXES (les agents de générateurs et
 * d'ateliers y accrochent leurs blocs). Contenu rédigé par le lot AF d'après la proposition validée par le
 * professeur (toutes les recommandations suivies) et son document (contextes et progression repris, nombres
 * recalculés ou nouveaux ; seules les données publiques de l'espérance de vie en Belgique — Banque mondiale —
 * sont reprises telles quelles). Toutes les valeurs numériques ont été recalculées par un script à part
 * (moyennes, sommes des écarts, a, b, Cov, σ, r) : voir `.claude/rules/content-history.md`.
 *
 * Conventions : σ divise par n (4e) ; droite de Mayer avec n impair : premier groupe de k données, second de
 * k + 1 ; seuils de r du document, « très forte » de 0,98 à 1 (exclu), « parfaite » réservé à |r| = 1 ;
 * calculatrice des élèves : TI-30XB MultiView (« 2-Var Stats »).
 */
const R = String.raw

// ── Données des figures (recalculées, voir l'en-tête) ─────────────────────────────────────────────
const pts = (xs: number[], ys: number[]) => xs.map((x, i) => ({ x, y: ys[i] }))

/** § 4 et § 5 : la petite série « à la main » (G(3 ; 4), y = 0,6x + 2,2, r ≈ 0,77). */
const SERIE_MAIN = pts([1, 2, 3, 4, 5], [2, 4, 5, 4, 5])

/** § 5 : boissons vendues selon la température (r ≈ 0,96). */
const BOISSONS = pts([8, 12, 15, 19, 22, 25, 28, 31], [21, 29, 27, 38, 36, 47, 45, 58])

/** § 5 : cinq nuages, r = 0,70 ; 0,99 ; 0,05 ; −0,93 ; −0,45 (dans cet ordre, nuages 1 à 5). */
const X12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const NUAGES_R: { ys: number[]; r: string }[] = [
  { ys: [2.6, 5.4, 1.3, 5.6, 3.5, 3.9, 8.7, 5.5, 5.5, 7.5, 8.7, 6.7], r: '0,70' },
  { ys: [2.5, 3.1, 3.3, 3.7, 4.2, 5.1, 5.4, 5.9, 7.0, 7.5, 8.3, 8.4], r: '0,99' },
  { ys: [3.0, 6.3, 6.8, 2.5, 1.5, 4.5, 2.9, 8.7, 6.1, 4.5, 3.1, 4.4], r: '0,05' },
  { ys: [8.0, 8.5, 6.0, 7.2, 5.5, 5.0, 6.4, 4.2, 3.5, 3.7, 3.5, 1.9], r: '−0,93' },
  { ys: [6.7, 4.3, 5.0, 5.6, 6.7, 5.0, 3.2, 4.8, 3.1, 5.2, 3.5, 5.2], r: '−0,45' },
]
const nuageR = (ys: number[], numero: number): IllustrationSpec => ({
  kind: 'scatterPlot',
  compact: true,
  points: pts(X12, ys),
  xMin: 0,
  xMax: 13,
  yMin: 0,
  yMax: 10,
  xTicks: [5, 10],
  yTicks: [5, 10],
  xAxisLabel: 'x',
  yAxisLabel: 'y',
  caption: R`Nuage ${numero}`,
})

/** § 6 : quartet d'Anscombe (1973), données originales. */
const ANSCOMBE_X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
const ANSCOMBE: { xs: number[]; ys: number[]; titre: string }[] = [
  { xs: ANSCOMBE_X, ys: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68], titre: 'Série I : un nuage à peu près aligné' },
  { xs: ANSCOMBE_X, ys: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74], titre: 'Série II : une courbe parfaite, en arc' },
  { xs: ANSCOMBE_X, ys: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73], titre: 'Série III : une droite et un point aberrant' },
  { xs: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], ys: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89], titre: 'Série IV : un seul point fait toute la droite' },
]
const nuageAnscombe = (s: { xs: number[]; ys: number[]; titre: string }): IllustrationSpec => ({
  kind: 'scatterPlot',
  compact: true,
  points: pts(s.xs, s.ys),
  xMin: 2,
  xMax: 20,
  yMin: 2,
  yMax: 14,
  xTicks: [5, 10, 15],
  yTicks: [4, 8, 12],
  xAxisLabel: 'x',
  yAxisLabel: 'y',
  lines: [{ a: 0.5, b: 3, tone: 'faint' }],
  caption: s.titre,
})

export const statistiqueDeuxVariables: ChapterContent = {
  level: '5e (4h)',
  levelSlug: '5e-4h',
  chapterNumber: 6,
  title: 'Statistique à deux variables',
  slug: 'statistique-deux-variables',
  lede:
    'Deux grandeurs mesurées sur les mêmes individus varient-elles ensemble ? Un **nuage de points** le ' +
    'montre, une **droite d’ajustement** le résume et permet de prévoir, et le **coefficient de corrélation** ' +
    'dit si cette droite mérite confiance.',
  sections: [
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'nuage-point-moyen',
      number: 1,
      title: 'Série à deux variables, nuage de points, point moyen',
      kicker: 'couples (xᵢ ; yᵢ), repère bien choisi, axes étiquetés, point moyen G',
      titreCourt: 'Nuage et point moyen',
      partie: 'Décrire et ajuster un nuage',
      essentiel: [
        R`Une série statistique à deux variables observe deux caractères $x$ et $y$ sur une même population : chaque individu donne un couple $(x_i\,;y_i)$, et l'ensemble de ces points forme le **nuage de points**.`,
        R`Le **point moyen** est $G(\bar{x}\,;\bar{y})$, avec $\bar{x} = \dfrac{1}{n}\sum x_i$ et $\bar{y} = \dfrac{1}{n}\sum y_i$ : des moyennes, jamais des médianes.`,
        R`Un repère bien choisi : la variable qu'on veut prévoir en ordonnée, des graduations régulières, des axes titrés avec leur unité, et une brisure quand un axe ne commence pas à $0$.`,
      ],
      cartes: [
        { question: R`Comment calcule-t-on les coordonnées du point moyen $G$ ?`, reponse: R`$\bar{x}$ est la moyenne des $x_i$ et $\bar{y}$ la moyenne des $y_i$ : $G(\bar{x}\,;\bar{y})$.` },
        { question: R`Points $(1\,;8)$, $(2\,;9)$, $(3\,;11)$, $(4\,;12)$, $(5\,;14)$, $(6\,;15)$ : point moyen ?`, reponse: R`$\bar{x} = \dfrac{21}{6} = 3{,}5$ et $\bar{y} = \dfrac{69}{6} = 11{,}5$, donc $G(3{,}5\,;11{,}5)$.` },
        { question: R`$G(6{,}4\,;15)$, $n = 5$ et la somme des quatre $x_i$ connus vaut $26$ : que vaut le cinquième ?`, reponse: R`$\sum x_i = 5 \times 6{,}4 = 32$, donc la valeur manquante vaut $32 - 26 = 6$.` },
        { question: 'On veut prévoir la note à partir des heures de révision : quelle variable va en ordonnée ?', reponse: 'La note : la variable qu’on veut prévoir va toujours en ordonnée.' },
      ],
      blocks: [
        { kind: 'video', title: 'Série à deux variables : nuage de points et point moyen' },
        {
          kind: 'intuition',
          label: 'Ce que tu sais déjà (4e)',
          text: R`Trois outils de 4e servent dans tout ce chapitre. La **moyenne**, la **variance** et l'**écart-type** d'une série à une variable (4e, chapitre 4) : $\bar{x} = \dfrac{1}{n}\sum x_i$, $V(x) = \dfrac{1}{n}\sum (x_i-\bar{x})^2$ et $\sigma_x = \sqrt{V(x)}$, en divisant par $n$. La **pente** et l'**équation d'une droite** passant par un point (4e, chapitre 7) : $y - y_1 = a(x - x_1)$. Le **sommet d'une parabole** $y = Ax^2 + Bx + C$ avec $A > 0$, atteint en $x = -\dfrac{B}{2A}$ (4e, chapitre 1) : c'est lui qui démontrera, au § 4, les formules de la meilleure droite.`,
        },
        {
          kind: 'para',
          text: R`Jusqu'ici, tu étudiais **un** caractère à la fois : les tailles d'une classe, ou ses notes. On apprend souvent davantage en observant **deux** caractères sur les mêmes individus : la puissance d'une voiture et sa consommation, la température du jour et le nombre de boissons vendues, les heures de révision et la note obtenue. La question devient : ces deux grandeurs varient-elles ensemble ?`,
        },
        {
          kind: 'definition',
          label: 'Définitions — série à deux variables, nuage de points',
          items: [
            R`On appelle **série statistique à deux variables** une série dans laquelle on étudie simultanément deux caractères $x$ et $y$ observés sur une même population de $n$ individus. Le $i$-ième individu donne le couple $(x_i\,;y_i)$.`,
            R`Dans un repère, l'ensemble des points de coordonnées $(x_i\,;y_i)$ s'appelle le **nuage de points** de la série.`,
            R`Deux points du nuage peuvent avoir la même abscisse ou la même ordonnée : dans la série « taille ; poids » d'adolescents du même âge, deux d'entre eux peuvent avoir la même taille et des poids différents. Un nuage n'est donc pas le graphique d'une fonction.`,
          ],
        },
        {
          kind: 'methode',
          label: 'Bien choisir son repère',
          items: [
            R`Mets en **abscisse** la variable qui « explique » ou que l'on choisit ($x$ : les heures, la température, l'année), et en **ordonnée** celle qu'on veut **prévoir** ($y$ : la note, les ventes, l'espérance de vie).`,
            R`Gradue chaque axe **régulièrement**, avec une unité adaptée à l'étendue des données : le nuage doit occuper presque tout le cadre, pas un coin.`,
            R`Un axe ne commence pas forcément à $0$ : si les notes vont de $8$ à $15$, l'axe des ordonnées peut commencer à $6$. On le signale par une **brisure** (un petit zigzag près de l'origine).`,
            R`Donne un **titre** à chaque axe, avec son unité (« heures de révision », « note sur 20 »).`,
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — point moyen',
          items: [
            R`Le **point moyen** du nuage est le point $G(\bar{x}\,;\bar{y})$, avec $\bar{x} = \dfrac{1}{n}\sum_{i=1}^{n} x_i$ et $\bar{y} = \dfrac{1}{n}\sum_{i=1}^{n} y_i$.`,
          ],
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text: R`Le point moyen est le **point d'équilibre** du nuage. Imagine chaque point comme une bille de même masse posée sur une plaque très légère : la plaque tient en équilibre sur une pointe placée exactement en $G$. Un seul point très éloigné suffit donc à déplacer $G$, comme une bille posée tout au bord.`,
        },
        {
          kind: 'exemple',
          badge: 'nuage et point moyen de six élèves',
          formula: R`Six élèves notent leurs heures de révision $x_i$ et leur note sur 20 $y_i$ : $(1\,;8)$, $(2\,;9)$, $(3\,;11)$, $(4\,;12)$, $(5\,;14)$, $(6\,;15)$. Représente le nuage et calcule son point moyen.`,
          steps: [
            { tag: 'choisir le repère', text: R`Les heures en abscisse, la note (qu'on voudrait prévoir) en ordonnée. Les notes vont de $8$ à $15$ : l'axe des notes commence à $6$, avec une brisure ; une graduation pour $1$ h et pour $1$ point.` },
            { tag: 'moyenne des abscisses', text: R`$\bar{x} = \dfrac{1+2+3+4+5+6}{6} = \dfrac{21}{6} = 3{,}5$` },
            { tag: 'moyenne des ordonnées', text: R`$\bar{y} = \dfrac{8+9+11+12+14+15}{6} = \dfrac{69}{6} = 11{,}5$` },
            { tag: 'lire le nuage', text: R`Les points montent de gauche à droite, presque alignés : dans ce groupe, plus on révise, meilleure est la note.` },
          ],
          result: { tag: 'point moyen', text: R`$G(3{,}5\,;11{,}5)$` },
          illustration: {
            kind: 'scatterPlot',
            points: pts([1, 2, 3, 4, 5, 6], [8, 9, 11, 12, 14, 15]),
            xMin: 0,
            xMax: 7,
            yMin: 6,
            yMax: 16,
            xTicks: [1, 2, 3, 4, 5, 6],
            yTicks: [8, 10, 12, 14, 16],
            grid: true,
            xAxisLabel: 'heures',
            yAxisLabel: 'note sur 20',
            marks: [{ x: 3.5, y: 11.5, label: 'G', tone: 'ink', labelPos: 'left' }],
            caption: R`Le nuage des six élèves et son point moyen $G(3{,}5\,;11{,}5)$ ; l'axe des notes commence à $6$ (brisure).`,
          },
        },
        {
          kind: 'application',
          titre: 'Repérer un enfant qui s’écarte de la courbe de croissance',
          text: R`Les courbes de croissance du carnet de santé sont construites à partir de nuages (âge ; taille) et (âge ; poids) de dizaines de milliers d'enfants. Pour chaque âge, on résume le nuage par une valeur centrale et par des courbes qui encadrent la grande majorité des enfants. Le médecin place les mesures de l'enfant sur ce graphique : un point qui s'écarte nettement du nuage, ou une suite de points qui « change de couloir », attire son attention bien avant qu'un problème ne se voie à l'œil nu.`,
          domaines: ['Médecine', 'Santé publique'],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — retrouver deux valeurs effacées connaissant G',
          blocks: [
            { kind: 'para', text: R`Dans la série suivante, deux valeurs ont été effacées. On sait que le point moyen du nuage est $G(6{,}4\,;15)$. Retrouve les valeurs manquantes.` },
            {
              kind: 'featureTable',
              headers: ['Individu', '1', '2', '3', '4', '5'],
              rows: [
                [R`$x_i$`, '$4$', '$8$', '?', '$9$', '$5$'],
                [R`$y_i$`, '$12$', '$15$', '$18$', '?', '$13$'],
              ],
            },
            { kind: 'para', text: R`**Idée.** $\bar{x} = \dfrac{\sum x_i}{n}$, donc $\sum x_i = n\,\bar{x}$ : connaître la moyenne, c'est connaître la somme.` },
            { kind: 'para', text: R`**Abscisse manquante.** $\sum x_i = 5 \times 6{,}4 = 32$. Les quatre abscisses connues font $4+8+9+5 = 26$, donc $x_3 = 32 - 26 = 6$.` },
            { kind: 'para', text: R`**Ordonnée manquante.** $\sum y_i = 5 \times 15 = 75$. Les quatre ordonnées connues font $12+15+18+13 = 58$, donc $y_4 = 75 - 58 = 17$.` },
            { kind: 'para', text: R`**Contrôle.** $\dfrac{4+8+6+9+5}{5} = \dfrac{32}{5} = 6{,}4$ et $\dfrac{12+15+18+17+13}{5} = \dfrac{75}{5} = 15$.` },
          ],
        },
        {
          kind: 'historique',
          titre: 'Adolphe Quetelet, un Gantois qui mesurait tout',
          text: R`Né à Gand en 1796, **Adolphe Quetelet** est l'astronome qui fonde l'Observatoire de Bruxelles. En 1835, dans son livre **Sur l'homme et le développement de ses facultés**, il applique aux êtres humains les outils des astronomes : il mesure des milliers de tailles, de poids, compte les naissances et les décès, et cherche comment ces grandeurs varient ensemble. Il remarque ainsi que, chez les adultes, le poids varie à peu près comme le **carré** de la taille. Son indice, le poids (en kg) divisé par le carré de la taille (en m), s'appelle aujourd'hui l'**indice de masse corporelle** (IMC) : les médecins du monde entier utilisent donc une formule belge.`,
        },
        {
          kind: 'piege',
          label: 'La médiane ou le milieu des extrêmes à la place de la moyenne',
          text: R`Les coordonnées de $G$ sont des **moyennes** de toutes les valeurs. Ni la médiane des $y_i$, ni la demi-somme de la plus petite et de la plus grande valeur ne conviennent : pour les notes $8$, $9$, $11$, $12$, $14$, $15$, le milieu des extrêmes vaut $11{,}5$ par hasard, mais pour $8$, $9$, $10$, $11$, $12$, $20$, il vaudrait $14$ alors que $\bar{y} = 11{,}67$.`,
        },
        {
          kind: 'piege',
          label: 'Axes inversés ou nuage écrasé',
          text: R`Si tu mets la note en abscisse et les heures en ordonnée, la droite que tu traceras ensuite prévoira les heures à partir de la note, ce n'est pas la question. Et un repère gradué de $0$ à $20$ pour des notes qui vont de $8$ à $15$ écrase le nuage dans une bande étroite : on ne voit plus sa forme. Choisis les graduations d'après les données.`,
        },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Point moyen et valeurs manquantes',
          generatorId: '5gen77',
          description: ['Calcule le point moyen G d\'une série, retrouve une ou deux valeurs effacées connaissant G, puis écris la droite de Mayer à partir de G₁ et G₂ et fais des prévisions dans les deux sens.'],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 77. Point moyen et valeurs manquantes »',
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'ajustement',
      number: 2,
      title: 'Ajuster un nuage : affine ou pas ?',
      kicker: 'forme de la relation, sens, intensité à l’œil, interpolation, extrapolation',
      titreCourt: 'Affine ou pas ?',
      partie: 'Décrire et ajuster un nuage',
      essentiel: [
        R`Avant tout calcul, on regarde la **forme** du nuage : à peu près alignés (ajustement affine, par une droite), en arc (second degré), qui « décolle » (exponentielle), ou sans forme (pas d'ajustement).`,
        R`Le nuage donne aussi le **sens** de la relation (croissante ou décroissante) et son **intensité** : plus les points sont serrés autour d'une droite, plus la liaison est forte.`,
        R`Prévoir **dans** l'intervalle des données, c'est **interpoler** ; prévoir **en dehors**, c'est **extrapoler** : plus on s'éloigne des données, moins la prévision est sûre.`,
      ],
      cartes: [
        { question: 'Un nuage monte puis redescend. Quel type d’ajustement envisager ?', reponse: 'Un ajustement du second degré (en arc), pas une droite.' },
        { question: R`Les données vont de $x = -4$ à $x = 14$. Une prévision pour $x = 5$ est-elle une interpolation ou une extrapolation ?`, reponse: R`Une interpolation : $5$ est dans l'intervalle $[-4\,;14]$ des données.` },
        { question: 'Quand dit-on qu’une liaison est forte, à l’œil ?', reponse: 'Quand les points sont très serrés autour d’une droite (ou d’une courbe).' },
      ],
      blocks: [
        { kind: 'video', title: 'Ajuster un nuage : affine ou non, interpoler ou extrapoler' },
        {
          kind: 'para',
          text: R`Quand les points d'un nuage semblent suivre une tendance, on peut **ajuster** le nuage : remplacer les points par une courbe simple qui passe au plus près d'eux. Cette courbe résume la relation et permet de **prévoir** une valeur qu'on n'a pas mesurée. Mais il faut d'abord choisir le bon type de courbe, et cela se décide en **regardant** le nuage.`,
        },
        {
          kind: 'definition',
          label: 'Définition — ajustement, ajustement affine',
          items: [
            R`**Ajuster** un nuage de points, c'est trouver une fonction dont le graphique s'approche des points du nuage.`,
            R`On parle d'**ajustement affine** quand cette courbe est une **droite** $y = ax + b$ : c'est le cas quand les points sont à peu près alignés. Les § 3 et § 4 donnent deux façons de choisir cette droite.`,
            R`D'autres formes existent : un nuage **en arc** (qui monte puis redescend) s'ajuste par une fonction du second degré ; un nuage qui **décolle** de plus en plus vite s'ajuste par une fonction exponentielle (que tu étudieras en 6e). Dans ce chapitre, on se contente de **reconnaître** ces formes, sans calculer leur équation.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — quatre nuages, quel ajustement ?',
          blocks: [
            {
              kind: 'para',
              text: R`Voici quatre séries : la masse de sel dissous dans un litre d'eau selon la température, la recette d'un magasin selon le prix de vente d'un article, le nombre de bactéries (en milliers) d'une culture selon le temps, et la note d'élèves selon la durée de leur trajet vers l'école. Quel ajustement envisager pour chacune ?`,
            },
            {
              kind: 'illustrationGroup',
              items: [
                {
                  kind: 'scatterPlot',
                  compact: true,
                  points: pts([10, 20, 30, 40, 50, 60], [31, 34, 36, 39, 41, 44]),
                  xMin: 0,
                  xMax: 70,
                  yMin: 28,
                  yMax: 46,
                  xTicks: [20, 40, 60],
                  yTicks: [30, 35, 40, 45],
                  xAxisLabel: '°C',
                  yAxisLabel: 'g',
                  caption: 'A. Sel dissous selon la température',
                },
                {
                  kind: 'scatterPlot',
                  compact: true,
                  points: pts([40, 60, 80, 100, 120, 140, 160], [70, 98, 115, 121, 116, 99, 72]),
                  xMin: 20,
                  xMax: 180,
                  yMin: 60,
                  yMax: 130,
                  xTicks: [50, 100, 150],
                  yTicks: [70, 100, 130],
                  xAxisLabel: 'prix',
                  yAxisLabel: 'recette',
                  caption: 'B. Recette selon le prix',
                },
                {
                  kind: 'scatterPlot',
                  compact: true,
                  points: pts([0, 1, 2, 3, 4, 5, 6], [2, 3, 4.5, 6.8, 10.1, 15.2, 22.8]),
                  xMin: 0,
                  xMax: 7,
                  yMin: 0,
                  yMax: 25,
                  xTicks: [2, 4, 6],
                  yTicks: [10, 20],
                  xAxisLabel: 'h',
                  yAxisLabel: 'milliers',
                  caption: 'C. Bactéries selon le temps',
                },
                {
                  kind: 'scatterPlot',
                  compact: true,
                  points: pts([5, 8, 10, 12, 15, 18, 20, 25, 30], [12, 9, 15, 11, 14, 8, 13, 10, 12]),
                  xMin: 0,
                  xMax: 35,
                  yMin: 6,
                  yMax: 17,
                  xTicks: [10, 20, 30],
                  yTicks: [8, 12, 16],
                  xAxisLabel: 'min',
                  yAxisLabel: 'note',
                  caption: 'D. Note selon la durée du trajet',
                },
              ],
            },
            { kind: 'para', text: R`**A — ajustement affine.** Les points sont presque alignés et montent régulièrement : environ $2{,}5$ g de plus tous les $10$ °C. Une droite les résume très bien.` },
            { kind: 'para', text: R`**B — second degré.** La recette monte puis redescend : trop bon marché, l'article rapporte peu ; trop cher, il ne se vend plus. Une droite passerait à côté de presque tous les points ; une parabole tournée vers le bas convient.` },
            { kind: 'para', text: R`**C — exponentielle.** Le nombre de bactéries est multiplié par environ $1{,}5$ chaque heure : le nuage décolle de plus en plus vite. Une droite sous-estimerait les dernières valeurs.` },
            { kind: 'para', text: R`**D — aucun ajustement.** Les points sont éparpillés sans tendance : la durée du trajet ne dit rien de la note. Tracer une droite n'aurait aucun sens.` },
          ],
        },
        {
          kind: 'para',
          text: R`Quand le nuage justifie un ajustement affine, il donne aussi le **sens** de la relation : **croissante** si le nuage monte de gauche à droite (les deux variables varient dans le même sens), **décroissante** s'il descend. Et il donne son **intensité** à l'œil : des points très serrés autour d'une droite indiquent une liaison **forte**, des points éparpillés une liaison **faible**. Le § 5 mesurera cette intensité par un nombre, le coefficient de corrélation $r$.`,
        },
        {
          kind: 'definition',
          label: 'Définition — interpolation et extrapolation',
          items: [
            R`Une fois la droite d'ajustement trouvée, on peut estimer une valeur qu'on n'a pas mesurée. Si la valeur de $x$ est **dans** l'intervalle des données, on parle d'**interpolation** ; si elle est **en dehors**, on parle d'**extrapolation**.`,
            R`Une interpolation est en général raisonnable. Une extrapolation suppose que la relation **continue** de la même façon hors des données, ce que rien ne garantit : on la fait avec prudence, et d'autant plus qu'on s'éloigne des données.`,
          ],
        },
        {
          kind: 'exemple',
          badge: 'interpoler ou extrapoler ? trois prévisions sur une même droite',
          formula: R`En hiver, on relève la température moyenne $x$ (en °C) et la consommation d'électricité $y$ (en GWh) d'une région sur dix jours, pour des températures de $-4$ °C à $14$ °C. Une droite d'ajustement du nuage est $y = -6x + 210$. Estime la consommation pour $5$ °C, pour $-8$ °C et pour $35$ °C, et commente chaque prévision.`,
          steps: [
            { tag: 'à 5 °C : interpolation', text: R`$y = -6 \times 5 + 210 = 180$ GWh. $5$ est dans $[-4\,;14]$ : la prévision est sûre, elle s'appuie sur des points tout proches.` },
            { tag: 'à −8 °C : extrapolation proche', text: R`$y = -6 \times (-8) + 210 = 258$ GWh. $-8$ est un peu en dehors des données : la prévision reste plausible (il fait plus froid, on chauffe plus), mais rien ne prouve que la droite continue ainsi.` },
            { tag: 'à 35 °C : extrapolation lointaine', text: R`$y = -6 \times 35 + 210 = 0$ GWh. Une consommation **nulle** est absurde : en été, on ne chauffe plus, la relation n'est plus la même. La droite ne vaut que pour la saison et les températures où on l'a établie.` },
          ],
          result: { tag: 'conclusion', text: R`seule la prévision à $5$ °C est fiable ; celle à $-8$ °C est à prendre avec prudence ; celle à $35$ °C n'a aucun sens.` },
          illustration: {
            kind: 'scatterPlot',
            points: pts([-4, -2, 0, 2, 4, 6, 8, 10, 12, 14], [240, 219, 213, 194, 180, 171, 168, 148, 139, 128]),
            xMin: -10,
            xMax: 40,
            yMin: 0,
            yMax: 280,
            xTicks: [-10, 0, 10, 20, 30],
            yTicks: [50, 100, 150, 200, 250],
            grid: true,
            xAxisLabel: '°C',
            yAxisLabel: 'GWh',
            bands: [
              { from: -4, to: 14, tone: 'good', label: 'on interpole' },
              { from: 14, to: 40, tone: 'bad', label: 'on extrapole' },
            ],
            lines: [{ a: -6, b: 210, tone: 'accent', label: 'y = −6x + 210', labelX: 22, labelPos: 'below' }],
            marks: [
              { x: 5, y: 180, label: '5 °C', tone: 'good', labelPos: 'above-right' },
              { x: 35, y: 0, label: '35 °C', tone: 'bad', labelPos: 'above' },
            ],
            caption: R`Le nuage (température ; consommation) et la droite $y = -6x + 210$ : dans la zone verte, on interpole ; plus on s'en éloigne, moins la droite décrit la réalité.`,
          },
        },
        {
          kind: 'atelier',
          tag: 'jusqu-ou-prevoir-widget',
          label: 'Manipule toi-même : jusqu’où prévoir ?',
          caption:
            'Fais glisser l’abscisse de la prévision : dans l’intervalle des données (bande verte), on interpole ; au-delà (bande ocre), on extrapole. Avec la mortalité infantile, la droite d’ajustement finit par prévoir un taux négatif ; avec l’espérance de vie en Belgique (2000-2014), elle dépasse le record humain de 122 ans. Un bon ajustement ne permet pas de prévoir n’importe où.',
        },
        {
          kind: 'application',
          titre: 'Prévoir la consommation d’électricité de demain',
          text: R`Le gestionnaire du réseau électrique doit produire, à chaque instant, exactement l'électricité consommée. Pour s'y préparer, il prévoit la consommation du lendemain à partir de la température annoncée : en hiver, plus il fait froid, plus on chauffe, et le nuage (température ; consommation) des jours précédents est presque une droite. La prévision par la droite d'ajustement, corrigée du jour de la semaine (on consomme moins le dimanche), permet de décider la veille quelles centrales démarrer. Hors de la saison de chauffe, la droite d'hiver ne vaut plus : il en faut une autre.`,
          domaines: ['Énergie', 'Économie'],
        },
        {
          kind: 'astuce',
          label: 'Et pour les nuages qui ne sont pas alignés ?',
          text: R`Les tableurs proposent d'autres « courbes de tendance » que la droite : polynomiale (du second degré pour un nuage en arc) ou exponentielle (pour un nuage qui décolle). Le principe est le même que pour la droite : le logiciel choisit la courbe qui passe au plus près des points. Tu n'as pas à calculer leurs équations cette année.`,
        },
        {
          kind: 'piege',
          label: 'Forcer une droite dans un nuage en arc',
          text: R`Un logiciel calcule une droite d'ajustement pour n'importe quel nuage, même en arc. Pour la recette selon le prix (nuage B), la droite obtenue est presque horizontale et prévoit une recette à peu près constante, alors que la recette s'effondre aux prix extrêmes. Regarde **toujours** la forme du nuage avant de choisir une droite.`,
        },
        {
          kind: 'piege',
          label: 'Une prévision lointaine aussi sûre qu’une prévision au milieu',
          text: R`Plus la valeur de $x$ est loin des données, plus la prévision est incertaine : une petite erreur sur la pente se multiplie par la distance, et la relation elle-même peut changer (le chauffage s'arrête en été, une croissance finit par ralentir). Une extrapolation se donne toujours avec une réserve.`,
        },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Lire un nuage de points',
          generatorId: '5gen76',
          description: ['Sur un nuage dessiné : y a-t-il une relation ? De quelle forme (affine, en arc, qui décolle) et dans quel sens ? Juge l\'intensité à l\'œil, puis associe quatre nuages à leur coefficient de corrélation.'],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 76. Lire un nuage de points »',
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'mayer',
      number: 3,
      title: 'Droite de Mayer',
      kicker: 'trier, partager en deux groupes, G₁ et G₂, pente, équation',
      titreCourt: 'Droite de Mayer',
      partie: 'Deux droites d’ajustement',
      essentiel: [
        R`Pour la **droite de Mayer** : on trie les données selon les $x_i$, on les partage en deux groupes d'effectifs égaux (à une unité près si $n$ est impair), on calcule les points moyens $G_1$ et $G_2$ de chaque groupe, puis l'équation de la droite $(G_1G_2)$.`,
        R`La droite de Mayer passe toujours par le point moyen $G(\bar{x}\,;\bar{y})$ du nuage : c'est un contrôle de calcul.`,
        R`On garde la pente en mémoire pour calculer $b$ : arrondir $a$ trop tôt fausse l'ordonnée à l'origine.`,
      ],
      cartes: [
        { question: 'Quelles sont les cinq étapes de la méthode de Mayer ?', reponse: R`Trier selon les $x_i$ ; partager en deux groupes ; calculer $G_1$ et $G_2$ ; la pente $a = \dfrac{y_{G_2}-y_{G_1}}{x_{G_2}-x_{G_1}}$ ; l'équation par un des deux points.` },
        { question: R`$n = 7$ données : comment partager ?`, reponse: R`En un groupe de $3$ et un groupe de $4$ (ici, les $3$ plus petites abscisses d'abord).` },
        { question: R`$G_1(2\,;1{,}1)$ et $G_2(5{,}5\,;2{,}5)$ : équation de la droite de Mayer ?`, reponse: R`$a = \dfrac{2{,}5-1{,}1}{5{,}5-2} = 0{,}4$ et $1{,}1 = 0{,}4 \times 2 + b$, donc $y = 0{,}4x + 0{,}3$.` },
        { question: 'Pourquoi la droite de Mayer passe-t-elle par G ?', reponse: R`Parce que $G$ est la moyenne pondérée de $G_1$ et $G_2$ (poids : les effectifs des groupes) : il est sur le segment $[G_1G_2]$.` },
      ],
      blocks: [
        { kind: 'video', title: 'La droite de Mayer : deux groupes, deux points moyens, une droite' },
        {
          kind: 'para',
          text: R`Si chacun trace « à l'œil » une droite à travers un nuage à peu près aligné, chacun obtient la sienne. Pour que tout le monde trouve **la même** droite, il faut une méthode. La plus simple, celle de Mayer, résume chaque moitié du nuage par son point moyen.`,
        },
        {
          kind: 'definition',
          label: 'Définition — droite de Mayer',
          items: [
            R`On range les données dans l'ordre croissant des $x_i$ et on les partage en deux groupes d'effectifs égaux, à une unité près si $n$ est impair. Les points moyens des deux groupes sont $G_1$ et $G_2$. La **droite de Mayer** est la droite $(G_1G_2)$.`,
          ],
        },
        {
          kind: 'methode',
          label: 'La méthode de Mayer en cinq étapes',
          items: [
            R`**Trier** les données dans l'ordre croissant des $x_i$ (en gardant chaque $y_i$ avec son $x_i$).`,
            R`**Partager** en deux groupes d'effectifs égaux. Si $n = 2k + 1$ est impair, on met ici $k$ données dans le premier groupe et $k + 1$ dans le second.`,
            R`**Calculer** les points moyens $G_1(\bar{x}_1\,;\bar{y}_1)$ et $G_2(\bar{x}_2\,;\bar{y}_2)$ : moyenne des abscisses, moyenne des ordonnées de chaque groupe.`,
            R`**Pente** : $a = \dfrac{\bar{y}_2 - \bar{y}_1}{\bar{x}_2 - \bar{x}_1}$, gardée en mémoire (sans l'arrondir).`,
            R`**Équation** : on remplace $x$ et $y$ par les coordonnées de $G_1$ dans $y = ax + b$ et on calcule $b$. Contrôle : la droite passe par $G(\bar{x}\,;\bar{y})$.`,
          ],
        },
        {
          kind: 'intuition',
          label: 'Pourquoi deux points moyens ?',
          text: R`Une droite est déterminée par deux points. Prendre deux points du nuage au hasard, ou le premier et le dernier, donnerait une droite qui dépend d'une ou deux mesures seulement, avec leurs erreurs. En remplaçant chaque moitié du nuage par son point d'équilibre, on fait travailler **toutes** les mesures : les erreurs des points d'un même groupe se compensent en partie dans la moyenne.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — l’espérance de vie en Belgique (2000–2014)',
          blocks: [
            { kind: 'para', text: R`Le tableau donne l'espérance de vie à la naissance en Belgique, tous les deux ans (données de la Banque mondiale). Pour garder des nombres simples, on compte les années à partir de 2000 : $x = 0$ pour 2000, $x = 2$ pour 2002, et ainsi de suite. Détermine la droite de Mayer, puis estime l'espérance de vie d'un enfant né en 2001 et en 2018, et l'année où elle atteignait 79 ans.` },
            {
              kind: 'featureTable',
              headers: ['Année', 'x', 'Espérance de vie y (ans)'],
              rows: [
                ['2000', '$0$', '$77{,}72$'],
                ['2002', '$2$', '$78{,}08$'],
                ['2004', '$4$', '$78{,}88$'],
                ['2006', '$6$', '$79{,}38$'],
                ['2008', '$8$', '$79{,}68$'],
                ['2010', '$10$', '$80{,}18$'],
                ['2012', '$12$', '$80{,}39$'],
                ['2014', '$14$', '$80{,}59$'],
              ],
            },
            { kind: 'para', text: R`**Trier et partager.** Les données sont déjà triées ; $n = 8$ : deux groupes de $4$ (de 2000 à 2006, puis de 2008 à 2014).` },
            { kind: 'para', text: R`**Points moyens.** $G_1\left(\dfrac{0+2+4+6}{4}\,;\dfrac{77{,}72+78{,}08+78{,}88+79{,}38}{4}\right) = (3\,;78{,}515)$ et $G_2\left(\dfrac{8+10+12+14}{4}\,;\dfrac{79{,}68+80{,}18+80{,}39+80{,}59}{4}\right) = (11\,;80{,}21)$.` },
            { kind: 'para', text: R`**Pente.** $a = \dfrac{80{,}21 - 78{,}515}{11 - 3} = \dfrac{1{,}695}{8} = 0{,}211875$ : l'espérance de vie gagne environ $0{,}21$ an (deux mois et demi) par année.` },
            { kind: 'para', text: R`**Équation.** $78{,}515 = 0{,}211875 \times 3 + b$, donc $b = 77{,}879375$ : $y \approx 0{,}212x + 77{,}88$.` },
            { kind: 'para', text: R`**Contrôle par G.** $\bar{x} = 7$ et $\bar{y} = \dfrac{634{,}9}{8} = 79{,}3625$ ; $0{,}211875 \times 7 + 77{,}879375 = 79{,}3625$ : la droite passe bien par $G$.` },
            { kind: 'para', text: R`**Prévisions.** Né en 2001 ($x = 1$) : $y \approx 78{,}09$ ans (interpolation). Né en 2018 ($x = 18$) : $y \approx 81{,}69$ ans (extrapolation, à prendre avec prudence). Pour $y = 79$ : $x = \dfrac{79 - 77{,}879375}{0{,}211875} \approx 5{,}3$, soit vers 2005.` },
            {
              kind: 'illustration',
              illustration: {
                kind: 'scatterPlot',
                points: pts([0, 2, 4, 6, 8, 10, 12, 14], [77.72, 78.08, 78.88, 79.38, 79.68, 80.18, 80.39, 80.59]),
                xMin: -1,
                xMax: 19,
                yMin: 77,
                yMax: 82,
                xTicks: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18],
                yTicks: [78, 79, 80, 81, 82],
                grid: true,
                xAxisLabel: 'années depuis 2000',
                yAxisLabel: 'ans',
                lines: [{ a: 0.211875, b: 77.879375, tone: 'accent', from: -1, to: 19, label: 'droite de Mayer', labelX: 14, labelPos: 'below' }],
                marks: [
                  { x: 3, y: 78.515, label: 'G_1', tone: 'good', labelPos: 'below-right' },
                  { x: 11, y: 80.21, label: 'G_2', tone: 'good', labelPos: 'below-right' },
                  { x: 7, y: 79.3625, label: 'G', tone: 'ink', labelPos: 'below-right' },
                ],
                caption: R`L'espérance de vie en Belgique de 2000 à 2014, les points moyens $G_1$ et $G_2$ et la droite de Mayer, qui passe par $G(7\,;79{,}3625)$.`,
              },
            },
          ],
        },
        {
          kind: 'historique',
          titre: 'Tobias Mayer et les mouvements de la Lune (1750)',
          text: R`Vers 1750, l'astronome allemand **Tobias Mayer** étudie le léger balancement apparent de la Lune. Ses $27$ observations d'un même cratère ne s'accordent pas parfaitement, et il doit en tirer seulement **trois** nombres inconnus : $27$ équations pour $3$ inconnues, impossible de les satisfaire toutes. Son idée : répartir les $27$ équations en trois groupes de $9$ et additionner chaque groupe, ce qui revient à travailler sur des **moyennes** de groupes. C'est le principe de la droite qui porte son nom. Ses tables de la Lune, très précises, permirent aux marins de trouver leur longitude en mer ; après sa mort, le Parlement britannique versa une récompense à sa veuve.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la droite de Mayer passe par le point moyen G',
          blocks: [
            { kind: 'para', text: R`Soit un nuage de $n$ points, partagé en un premier groupe de $n_1$ points, de point moyen $G_1(\bar{x}_1\,;\bar{y}_1)$, et un second de $n_2$ points, de point moyen $G_2(\bar{x}_2\,;\bar{y}_2)$, avec $n_1 + n_2 = n$.` },
            { kind: 'para', text: R`**Étape 1 — sommes de chaque groupe.** La somme des abscisses du premier groupe vaut $n_1\bar{x}_1$, celle du second $n_2\bar{x}_2$. Donc $\bar{x} = \dfrac{n_1\bar{x}_1 + n_2\bar{x}_2}{n}$ et, de même, $\bar{y} = \dfrac{n_1\bar{y}_1 + n_2\bar{y}_2}{n}$.` },
            { kind: 'para', text: R`**Étape 2 — G est sur le segment.** Pose $t = \dfrac{n_2}{n}$, compris entre $0$ et $1$ ; alors $\dfrac{n_1}{n} = 1 - t$ et $\bar{x} = \bar{x}_1 + t\,(\bar{x}_2 - \bar{x}_1)$, $\bar{y} = \bar{y}_1 + t\,(\bar{y}_2 - \bar{y}_1)$. Autrement dit $\overrightarrow{G_1G} = t\,\overrightarrow{G_1G_2}$ : $G$ est sur le segment $[G_1G_2]$, donc sur la droite de Mayer.` },
            { kind: 'para', text: R`**Étape 3 — le milieu si les groupes sont égaux.** Si $n_1 = n_2$, $t = \dfrac{1}{2}$ : $G$ est le **milieu** de $[G_1G_2]$. Si $n$ est impair, $G$ est un peu plus près du point moyen du groupe le plus nombreux.` },
          ],
        },
        {
          kind: 'atelier',
          tag: 'nuage-mayer-widget',
          label: 'Manipule toi-même : nuage, point moyen et droite de Mayer',
          caption:
            'Ajoute, déplace et retire des points : G, G₁, G₂ et la droite de Mayer suivent en direct, et le panneau refait les cinq étapes de la méthode (trier, partager, points moyens, pente, équation). Avec un nombre impair de points, les deux groupes diffèrent d’une unité : G n’est plus le milieu de [G₁G₂], mais il reste sur la droite.',
        },
        {
          kind: 'exemple',
          badge: 'n impair : des groupes de 3 et de 4',
          formula: R`Une machine se dérègle peu à peu. On relève le pourcentage de pièces défectueuses chaque semaine : $(1\,;0{,}8)$, $(2\,;1{,}1)$, $(3\,;1{,}4)$, $(4\,;2{,}0)$, $(5\,;2{,}3)$, $(6\,;2{,}7)$, $(7\,;3{,}0)$. Détermine la droite de Mayer et vérifie qu'elle passe par $G$. Un entretien s'impose à $5\,\%$ de pièces défectueuses : quand faut-il le prévoir ?`,
          steps: [
            { tag: 'partager', text: R`$n = 7$ est impair : un premier groupe de $3$ données (semaines 1 à 3), un second de $4$ (semaines 4 à 7).` },
            { tag: 'points moyens', text: R`$G_1\left(\dfrac{1+2+3}{3}\,;\dfrac{0{,}8+1{,}1+1{,}4}{3}\right) = (2\,;1{,}1)$ et $G_2\left(\dfrac{4+5+6+7}{4}\,;\dfrac{2{,}0+2{,}3+2{,}7+3{,}0}{4}\right) = (5{,}5\,;2{,}5)$` },
            { tag: 'pente et équation', text: R`$a = \dfrac{2{,}5 - 1{,}1}{5{,}5 - 2} = \dfrac{1{,}4}{3{,}5} = 0{,}4$ ; $1{,}1 = 0{,}4 \times 2 + b$, donc $b = 0{,}3$ : $y = 0{,}4x + 0{,}3$.` },
            { tag: 'contrôle par G', text: R`$G\left(\dfrac{28}{7}\,;\dfrac{13{,}3}{7}\right) = (4\,;1{,}9)$ et $0{,}4 \times 4 + 0{,}3 = 1{,}9$. La droite passe par $G$, même si $G$ n'est pas le milieu de $[G_1G_2]$ (qui est $(3{,}75\,;1{,}8)$) : les groupes n'ont pas le même effectif.` },
            { tag: 'seuil de 5 %', text: R`$0{,}4x + 0{,}3 = 5 \iff x = \dfrac{4{,}7}{0{,}4} = 11{,}75$.` },
          ],
          result: { tag: 'réponse', text: R`$y = 0{,}4x + 0{,}3$ ; le seuil de $5\,\%$ serait atteint pendant la 12e semaine (extrapolation : on surveille la machine d'ici là).` },
        },
        {
          kind: 'exemple',
          badge: 'données en désordre : ce qui change si on oublie de trier',
          formula: R`On relève la distance domicile–école $x$ (en km) et la durée du trajet à vélo $y$ (en min) de six élèves, dans l'ordre des réponses : $(1\,;3)$, $(9\,;17)$, $(3\,;7)$, $(2\,;5)$, $(7\,;14)$, $(5\,;11)$. Détermine la droite de Mayer, puis compare avec ce qu'on obtient sans trier.`,
          steps: [
            { tag: 'trier puis partager', text: R`Ordre croissant des $x_i$ : $(1\,;3)$, $(2\,;5)$, $(3\,;7)$ | $(5\,;11)$, $(7\,;14)$, $(9\,;17)$.` },
            { tag: 'droite de Mayer', text: R`$G_1(2\,;5)$ et $G_2(7\,;14)$ ; $a = \dfrac{14-5}{7-2} = 1{,}8$ ; $5 = 1{,}8 \times 2 + b$, donc $b = 1{,}4$ : $y = 1{,}8x + 1{,}4$.` },
            { tag: 'sans trier (erreur)', text: R`Les trois premières réponses donnent $\left(\dfrac{13}{3}\,;9\right)$, les trois suivantes $\left(\dfrac{14}{3}\,;10\right)$ : la pente vaudrait $\dfrac{1}{1/3} = 3$ et la droite $y = 3x - 4$, beaucoup trop raide (elle prévoit $23$ min pour $9$ km au lieu de $17$).` },
            { tag: 'piège du contrôle', text: R`Les deux droites passent par $G(4{,}5\,;9{,}5)$ : n'importe quel partage donne une droite qui passe par $G$. Le contrôle par $G$ ne détecte donc **pas** l'oubli du tri.` },
          ],
          result: { tag: 'droite de Mayer', text: R`$y = 1{,}8x + 1{,}4$ ; sans tri, la « droite » dépend de l'ordre des réponses, ce qui n'a aucun sens.` },
        },
        {
          kind: 'methode',
          label: 'À la calculatrice : les points moyens G₁ et G₂',
          items: [
            R`La TI-30XB ne trace pas la droite de Mayer, mais elle calcule les moyennes de chaque groupe.`,
            R`Saisis les $x_i$ du **premier groupe** dans la liste L1 et leurs $y_i$ dans L2 (touche **data**), puis lance **2-Var Stats** (touches **2nd** puis **data**) : la calculatrice affiche $\bar{x}$ et $\bar{y}$ du groupe, c'est-à-dire les coordonnées de $G_1$.`,
            R`Recommence avec les données du **second groupe** pour obtenir $G_2$, puis calcule la pente et l'équation comme d'habitude, en gardant la pente en mémoire.`,
          ],
        },
        {
          kind: 'piege',
          label: 'Partager sans avoir trié les abscisses',
          text: R`Le premier groupe doit contenir les **plus petites** abscisses. Si on partage les données dans l'ordre de l'énoncé, la droite obtenue dépend de cet ordre, et le contrôle par $G$ ne le détecte pas (exemple ci-dessus).`,
        },
        {
          kind: 'piege',
          label: 'Arrondir la pente avant de calculer b',
          text: R`Pour l'espérance de vie, la pente exacte est $0{,}211875$. Arrondie à $0{,}2$ avant de calculer $b$, elle donne $b = 78{,}515 - 0{,}2 \times 3 = 77{,}915$, et une prévision pour 2018 de $81{,}5$ ans au lieu de $81{,}7$. On garde la pente en mémoire (ou sous forme de fraction) et on n'arrondit qu'à la fin.`,
        },
        {
          kind: 'piege',
          label: 'Le premier et le dernier point au lieu des points moyens',
          text: R`La droite qui joint le premier et le dernier point du nuage n'est pas la droite de Mayer : elle ne dépend que de deux mesures. La droite de Mayer passe par les **points moyens** $G_1$ et $G_2$, qui ne sont en général pas des points du nuage.`,
        },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Droite de Mayer',
          generatorId: '5gen36',
          description: ['Range les données, partage-les en deux groupes (n pair ou impair), calcule G₁, G₂, la pente et l\'équation, vérifie que la droite passe par G, puis fais une prévision. Le nuage se complète écran après écran.'],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 36. Droite de Mayer »',
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'moindres-carres',
      number: 4,
      title: 'Droite des moindres carrés',
      kicker: 'écarts verticaux, somme des carrés minimale, passe par G, coefficient de régression',
      titreCourt: 'Moindres carrés',
      partie: 'Deux droites d’ajustement',
      essentiel: [
        R`La **droite des moindres carrés** (ou droite de régression de $y$ en $x$) est la droite $y = ax + b$ qui rend **minimale** la somme des carrés des écarts verticaux $\sum \big(y_i - (ax_i + b)\big)^2$.`,
        R`Avec $X_i = x_i - \bar{x}$ et $Y_i = y_i - \bar{y}$ : $a = \dfrac{\sum X_iY_i}{\sum X_i^2}$ (le coefficient de régression), et la droite passe par $G$ : $y - \bar{y} = a(x - \bar{x})$, donc $b = \bar{y} - a\bar{x}$.`,
        R`À la main sur de petites séries (tableau des écarts) ; sinon à la TI-30XB, qui affiche $a$ et $b$ en mode « 2-Var Stats ».`,
      ],
      cartes: [
        { question: 'Quelle quantité la droite des moindres carrés rend-elle minimale ?', reponse: R`La somme des carrés des écarts **verticaux** : $\sum \big(y_i - (ax_i + b)\big)^2$.` },
        { question: R`Donne la formule de la pente $a$ de la droite des moindres carrés.`, reponse: R`$a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}$` },
        { question: R`$G(3\,;4)$, $\sum X_iY_i = 6$, $\sum X_i^2 = 10$ : équation de la droite ?`, reponse: R`$a = 0{,}6$ et $b = 4 - 0{,}6 \times 3 = 2{,}2$ : $y = 0{,}6x + 2{,}2$.` },
        { question: 'Quel écart-type lire sur la TI-30XB : Sx ou σx ?', reponse: R`$\sigma_x$ (division par $n$, comme en 4e) ; $S_x$ divise par $n - 1$.` },
      ],
      blocks: [
        { kind: 'video', title: 'La droite des moindres carrés : écarts verticaux, formules et calculatrice' },
        {
          kind: 'para',
          text: R`La droite de Mayer est simple, mais d'autres partages donneraient d'autres droites. Laquelle est **la meilleure** ? Il faut un critère : on mesure, pour chaque point, de combien la droite se trompe, et on cherche la droite qui se trompe le moins au total.`,
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser',
          text: R`Imagine que chaque point du nuage est relié à la droite par un petit ressort **vertical**, et qu'un ressort tire d'autant plus fort qu'il est étiré. Lâchée au milieu des points, la droite bouge jusqu'à une position d'équilibre, celle où les ressorts sont, au total, le moins tendus. Cette position d'équilibre, c'est la droite des moindres carrés.`,
        },
        {
          kind: 'definition',
          label: 'Définition — droite des moindres carrés (droite de régression de y en x)',
          items: [
            R`Pour une droite $y = ax + b$, l'**écart vertical** du point $(x_i\,;y_i)$ est $e_i = y_i - (ax_i + b)$ : la différence entre la valeur observée et la valeur donnée par la droite pour la même abscisse.`,
            R`La **droite des moindres carrés**, ou **droite de régression** de $y$ en $x$, est la droite pour laquelle la somme des carrés des écarts verticaux $S = \sum_{i=1}^{n} \big(y_i - (ax_i + b)\big)^2$ est la plus petite possible.`,
          ],
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'scatterPlot',
            points: SERIE_MAIN,
            xMin: 0,
            xMax: 6,
            yMin: 0,
            yMax: 6.5,
            xTicks: [1, 2, 3, 4, 5],
            yTicks: [1, 2, 3, 4, 5, 6],
            grid: true,
            xAxisLabel: 'x',
            yAxisLabel: 'y',
            lines: [{ a: 0.6, b: 2.2, tone: 'accent', label: 'y = 0,6x + 2,2', labelX: 5.5 }],
            residuals: { a: 0.6, b: 2.2, squares: true },
            caption: R`Les écarts verticaux (en rouge) entre les points et la droite $y = 0{,}6x + 2{,}2$, et leurs carrés (en vert) : la droite des moindres carrés est celle dont l'aire totale des carrés est la plus petite. Ici, cette aire vaut $2{,}4$.`,
          },
        },
        {
          kind: 'rappel',
          label: 'Les formules de la droite des moindres carrés',
          items: [
            R`On note $X_i = x_i - \bar{x}$ et $Y_i = y_i - \bar{y}$ les écarts à la moyenne.`,
            R`La pente, appelée **coefficient de régression**, vaut $a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2} = \dfrac{\sum X_iY_i}{\sum X_i^2}$.`,
            R`La droite passe par le point moyen $G$ : son équation est $y - \bar{y} = a(x - \bar{x})$, autrement dit $b = \bar{y} - a\bar{x}$.`,
            R`Ces formules sont démontrées plus bas, avec le sommet d'une parabole vu en 4e.`,
          ],
        },
        {
          kind: 'methode',
          label: 'À la main, sur une petite série : le tableau des écarts',
          items: [
            R`Calcule $\bar{x}$ et $\bar{y}$ : $G(\bar{x}\,;\bar{y})$.`,
            R`Dans un tableau, calcule pour chaque point $X_i = x_i - \bar{x}$, $Y_i = y_i - \bar{y}$, le produit $X_iY_i$ et le carré $X_i^2$. Contrôle : $\sum X_i = 0$ et $\sum Y_i = 0$.`,
            R`Additionne : $a = \dfrac{\sum X_iY_i}{\sum X_i^2}$, puis $b = \bar{y} - a\bar{x}$.`,
            R`Réserve cette méthode aux petites séries (5 ou 6 points, moyennes simples) ; au-delà, utilise la calculatrice.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — la droite des moindres carrés à la main',
          blocks: [
            { kind: 'para', text: R`Détermine la droite des moindres carrés du nuage $(1\,;2)$, $(2\,;4)$, $(3\,;5)$, $(4\,;4)$, $(5\,;5)$.` },
            { kind: 'para', text: R`**Point moyen.** $\bar{x} = \dfrac{15}{5} = 3$ et $\bar{y} = \dfrac{20}{5} = 4$ : $G(3\,;4)$.` },
            {
              kind: 'featureTable',
              headers: ['xᵢ', 'yᵢ', 'Xᵢ = xᵢ − x̄', 'Yᵢ = yᵢ − ȳ', 'XᵢYᵢ', 'Xᵢ²'],
              rows: [
                ['$1$', '$2$', '$-2$', '$-2$', '$4$', '$4$'],
                ['$2$', '$4$', '$-1$', '$0$', '$0$', '$1$'],
                ['$3$', '$5$', '$0$', '$1$', '$0$', '$0$'],
                ['$4$', '$4$', '$1$', '$0$', '$0$', '$1$'],
                ['$5$', '$5$', '$2$', '$1$', '$2$', '$4$'],
                [R`$\sum = 15$`, R`$\sum = 20$`, R`$\sum = 0$`, R`$\sum = 0$`, R`$\sum = 6$`, R`$\sum = 10$`],
              ],
            },
            { kind: 'para', text: R`**Pente.** $a = \dfrac{\sum X_iY_i}{\sum X_i^2} = \dfrac{6}{10} = 0{,}6$.` },
            { kind: 'para', text: R`**Ordonnée à l'origine.** $b = \bar{y} - a\bar{x} = 4 - 0{,}6 \times 3 = 2{,}2$.` },
            { kind: 'para', text: R`**Réponse.** La droite des moindres carrés a pour équation $y = 0{,}6x + 2{,}2$. Contrôle à la calculatrice : « 2-Var Stats » affiche $a = 0{,}6$ et $b = 2{,}2$.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — pour une pente fixée, la meilleure droite passe par G',
          blocks: [
            { kind: 'para', text: R`Fixons la pente $a$ et cherchons le meilleur $b$. Pose $u_i = y_i - ax_i$ : l'écart vertical s'écrit $u_i - b$, et la somme à minimiser est $S(b) = \sum (u_i - b)^2$.` },
            { kind: 'para', text: R`**Étape 1 — un trinôme en b.** En développant chaque carré, $(u_i - b)^2 = b^2 - 2u_i\,b + u_i^2$, d'où $S(b) = n\,b^2 - 2\left(\sum u_i\right) b + \sum u_i^2$ : un trinôme du second degré en $b$, de coefficient $n > 0$.` },
            { kind: 'para', text: R`**Étape 2 — le sommet (4e).** Un trinôme $Ab^2 + Bb + C$ avec $A > 0$ est minimal en $b = -\dfrac{B}{2A}$. Ici $b = \dfrac{2\sum u_i}{2n} = \dfrac{\sum u_i}{n} = \dfrac{\sum y_i - a\sum x_i}{n} = \bar{y} - a\bar{x}$.` },
            { kind: 'para', text: R`**Étape 3 — conclure.** Avec $b = \bar{y} - a\bar{x}$, on a $\bar{y} = a\bar{x} + b$ : la droite passe par $G(\bar{x}\,;\bar{y})$. Quelle que soit la pente, la meilleure droite passe donc par le point moyen ; il reste à choisir la pente.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — la formule de la pente a',
          blocks: [
            { kind: 'para', text: R`D'après la démonstration précédente, la droite cherchée passe par $G$ : $y = \bar{y} + a(x - \bar{x})$. L'écart vertical du point $(x_i\,;y_i)$ vaut alors $y_i - \bar{y} - a(x_i - \bar{x}) = Y_i - aX_i$.` },
            { kind: 'para', text: R`**Étape 1 — un trinôme en a.** $S(a) = \sum (Y_i - aX_i)^2 = a^2\sum X_i^2 - 2a\sum X_iY_i + \sum Y_i^2$, un trinôme en $a$ de coefficient $\sum X_i^2 > 0$ (les $x_i$ ne sont pas tous égaux).` },
            { kind: 'para', text: R`**Étape 2 — le sommet.** Il est minimal en $a = -\dfrac{-2\sum X_iY_i}{2\sum X_i^2} = \dfrac{\sum X_iY_i}{\sum X_i^2}$.` },
            { kind: 'para', text: R`**Conclusion.** La droite des moindres carrés a pour pente $a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2}$ et passe par $G$ : $y - \bar{y} = a(x - \bar{x})$. Pour ces deux valeurs de $a$ et $b$ ensemble, aucune autre droite ne fait mieux.` },
          ],
        },
        {
          kind: 'exemple',
          badge: 'comparer Mayer et moindres carrés par la somme des carrés des écarts',
          formula: R`Pour le même nuage $(1\,;2)$, $(2\,;4)$, $(3\,;5)$, $(4\,;4)$, $(5\,;5)$, détermine la droite de Mayer, puis compare les sommes des carrés des écarts verticaux des deux droites.`,
          steps: [
            { tag: 'droite de Mayer', text: R`$n = 5$ : groupes de $2$ et de $3$. $G_1(1{,}5\,;3)$, $G_2\left(4\,;\dfrac{14}{3}\right)$ ; $a = \dfrac{14/3 - 3}{4 - 1{,}5} = \dfrac{5/3}{5/2} = \dfrac{2}{3}$ ; $3 = \dfrac{2}{3} \times 1{,}5 + b$, donc $b = 2$ : $y = \dfrac{2}{3}x + 2$.` },
            { tag: 'écarts de la droite de Mayer', text: R`Valeurs de la droite : $\dfrac{8}{3}$, $\dfrac{10}{3}$, $4$, $\dfrac{14}{3}$, $\dfrac{16}{3}$ ; écarts : $-\dfrac{2}{3}$, $\dfrac{2}{3}$, $1$, $-\dfrac{2}{3}$, $-\dfrac{1}{3}$ ; somme des carrés : $\dfrac{4+4+9+4+1}{9} = \dfrac{22}{9} \approx 2{,}44$.` },
            { tag: 'écarts des moindres carrés', text: R`Valeurs de $y = 0{,}6x + 2{,}2$ : $2{,}8$ ; $3{,}4$ ; $4$ ; $4{,}6$ ; $5{,}2$ ; écarts : $-0{,}8$ ; $0{,}6$ ; $1$ ; $-0{,}6$ ; $-0{,}2$ ; somme des carrés : $0{,}64 + 0{,}36 + 1 + 0{,}36 + 0{,}04 = 2{,}4$.` },
          ],
          result: { tag: 'comparaison', text: R`$2{,}4 < 2{,}44$ : la droite des moindres carrés gagne, de peu. Les deux droites passent par $G(3\,;4)$ et se ressemblent ; aucune droite ne peut descendre sous $2{,}4$.` },
        },
        {
          kind: 'atelier',
          tag: 'moindres-carres-widget',
          label: 'Manipule toi-même : ta droite contre celle des moindres carrés',
          caption:
            'Règle ou fais glisser ta droite. Chaque écart vertical est le côté d’un vrai carré : rends la somme de leurs aires la plus petite possible, puis compare avec la meilleure droite (et avec la droite de Mayer : 2,4 contre environ 2,44 pour la série du cours).',
        },
        {
          kind: 'historique',
          titre: 'Une planète perdue et retrouvée',
          text: R`Le 1er janvier 1801, l'astronome **Giuseppe Piazzi** découvre à Palerme un nouvel astre, Cérès. Il le suit pendant quelques semaines, puis le perd dans l'éclat du Soleil. Où le chercher quand il réapparaîtra ? Le jeune **Carl Friedrich Gauss**, 24 ans, calcule son orbite à partir des quelques observations disponibles, des mesures imparfaites qu'il faut concilier au mieux. Fin 1801, on retrouve Cérès presque exactement à l'endroit annoncé. Gauss affirmera plus tard utiliser depuis 1795 la **méthode des moindres carrés**, mais c'est le Français **Adrien-Marie Legendre** qui la publie le premier, en 1805 ; Gauss ne la publie qu'en 1809, ce qui déclenche une célèbre dispute de priorité.`,
        },
        {
          kind: 'methode',
          label: 'À la TI-30XB MultiView : a, b et r en mode « 2-Var Stats »',
          items: [
            R`Appuie sur **data** : les listes L1, L2, L3 s'affichent. Pour effacer des données anciennes, appuie à nouveau sur **data** et choisis l'effacement des listes.`,
            R`Tape les $x_i$ dans L1 (chaque valeur suivie de **enter**), passe à L2 avec la flèche vers la droite et tape les $y_i$ dans le même ordre.`,
            R`Appuie sur **2nd** puis **data** (menu des statistiques), choisis **2-Var Stats**, indique L1 pour les $x$ et L2 pour les $y$, fréquence ONE, puis CALC.`,
            R`Fais défiler les résultats : $n$, $\bar{x}$, $S_x$, $\sigma_x$, $\bar{y}$, $S_y$, $\sigma_y$, $\sum x$, $\sum x^2$, $\sum y$, $\sum y^2$, $\sum xy$, puis $a$ et $b$ (la droite des moindres carrés $y = ax + b$) et $r$ (§ 5).`,
            R`Les intitulés des menus peuvent varier un peu d'une version à l'autre : vérifie-les une fois avec la petite série de l'exemple à la main, qui doit donner $a = 0{,}6$ et $b = 2{,}2$.`,
          ],
        },
        {
          kind: 'exemple',
          badge: 'à la TI-30XB : consommation selon la puissance',
          formula: R`On a relevé la puissance $x$ (en chevaux) et la consommation $y$ (en litres aux 100 km) de huit voitures neuves : $(75\,;4{,}8)$, $(90\,;5{,}2)$, $(105\,;5{,}6)$, $(120\,;6{,}0)$, $(140\,;6{,}5)$, $(160\,;7{,}1)$, $(180\,;7{,}5)$, $(200\,;8{,}2)$. Détermine la droite des moindres carrés, puis estime la consommation d'une voiture de $110$ chevaux et la puissance d'une voiture qui consomme $6{,}8$ litres aux 100 km.`,
          steps: [
            { tag: 'saisie et 2-Var Stats', text: R`Puissances dans L1, consommations dans L2. La calculatrice affiche $\bar{x} = 133{,}75$, $\bar{y} = 6{,}3625$, $a \approx 0{,}0267003$ et $b \approx 2{,}79134$.` },
            { tag: 'équation', text: R`$y \approx 0{,}0267x + 2{,}79$. Contrôle : $0{,}0267003 \times 133{,}75 + 2{,}79134 \approx 6{,}3625$, la droite passe par $G$.` },
            { tag: 'on cherche y', text: R`Pour $x = 110$ : $y \approx 0{,}0267003 \times 110 + 2{,}79134 \approx 5{,}73$ litres aux 100 km (interpolation).` },
            { tag: 'on cherche x', text: R`Pour $y = 6{,}8$ : on résout $0{,}0267003\,x + 2{,}79134 = 6{,}8$, d'où $x = \dfrac{6{,}8 - 2{,}79134}{0{,}0267003} \approx 150$ chevaux.` },
          ],
          result: { tag: 'réponse', text: R`$y \approx 0{,}0267x + 2{,}79$ ; environ $5{,}73$ L/100 km pour $110$ chevaux ; environ $150$ chevaux pour $6{,}8$ L/100 km.` },
        },
        {
          kind: 'astuce',
          label: 'Avec un tableur ou GeoGebra',
          text: R`Dans un tableur (Excel, LibreOffice Calc), place les $x_i$ en colonne A et les $y_i$ en colonne B, par exemple des lignes 2 à 9. Les fonctions **MOYENNE(A2:A9)**, **PENTE(B2:B9;A2:A9)**, **ORDONNEE.ORIGINE(B2:B9;A2:A9)** et **COEFFICIENT.CORRELATION(A2:A9;B2:B9)** donnent $\bar{x}$, $a$, $b$ et $r$ ; attention, pour la pente et l'ordonnée à l'origine, les $y$ se donnent en premier. Pour le dessin : graphique « nuage de points », clic droit sur un point, « Ajouter une courbe de tendance », type linéaire, avec l'équation et le coefficient $R^2$ affichés. Dans GeoGebra, sélectionne les deux colonnes du tableur et choisis l'outil d'analyse de régression à deux variables, modèle linéaire : le nuage, la droite et son équation apparaissent en deux clics.`,
        },
        {
          kind: 'rappel',
          label: 'Remarque — la droite de régression de x en y',
          items: [
            R`La droite étudiée ici minimise les écarts **verticaux** : elle sert à prévoir $y$ à partir de $x$. On pourrait aussi minimiser les écarts **horizontaux** et obtenir la droite de régression de $x$ en $y$ ; elle est un peu différente, sauf si les points sont parfaitement alignés.`,
            R`Dans ce cours, pour estimer $x$ à partir de $y$, on garde la droite de $y$ en $x$ et on résout son équation, comme dans l'exemple de la consommation.`,
          ],
        },
        {
          kind: 'historique',
          titre: 'Pourquoi « régression » ?',
          text: R`En 1886, le savant anglais **Francis Galton** compare la taille de près de mille adultes à celle de leurs parents. Des parents très grands ont des enfants grands, mais en moyenne un peu **moins** grands qu'eux ; des parents très petits ont des enfants un peu moins petits. La taille des enfants « régresse » vers la moyenne, écrit-il. Le nom est resté : toute droite des moindres carrés s'appelle depuis une droite de **régression**, même quand il n'y a plus rien qui régresse.`,
        },
        {
          kind: 'application',
          titre: 'La droite d’étalonnage du laboratoire de chimie',
          text: R`Pour connaître la concentration d'un colorant dans une boisson, le chimiste prépare d'abord des solutions de concentration **connue** et mesure, pour chacune, l'absorbance : la part de lumière que la solution arrête. Le nuage (concentration ; absorbance) est presque parfaitement aligné, et la droite des moindres carrés de ce nuage s'appelle la **droite d'étalonnage**. Il mesure ensuite l'absorbance de la boisson et lit sur la droite la concentration correspondante : c'est une interpolation, puisqu'on choisit les solutions étalons pour encadrer la valeur cherchée. Un $r$ très proche de $1$ garantit que la mesure est fiable.`,
          domaines: ['Chimie', 'Biologie'],
        },
        {
          kind: 'piege',
          label: 'Des écarts perpendiculaires à la droite',
          text: R`Les écarts de la méthode des moindres carrés sont **verticaux** : on compare $y_i$ à la valeur $ax_i + b$ donnée par la droite pour la **même** abscisse. Ce ne sont pas les distances des points à la droite, mesurées perpendiculairement.`,
        },
        {
          kind: 'piege',
          label: 'Lire Sx au lieu de σx sur la calculatrice',
          text: R`La TI-30XB affiche deux écarts-types : $S_x$, qui divise par $n - 1$, et $\sigma_x$, qui divise par $n$. Le cours, comme en 4e, utilise $\sigma_x$. Pour $a$ et $b$, la question ne se pose pas : la calculatrice les donne directement.`,
        },
        {
          kind: 'piege',
          label: 'Arrondir a trop tôt, ou échanger x̄ et ȳ dans b',
          text: R`$b = \bar{y} - a\bar{x}$, et pas $\bar{x} - a\bar{y}$ : c'est la condition « la droite passe par $G$ », $\bar{y} = a\bar{x} + b$. Et, comme pour Mayer, on calcule $b$ avec la pente non arrondie : avec $\bar{x} = 133{,}75$, arrondir $a$ de $0{,}0267003$ à $0{,}03$ décale $b$ de près de $0{,}44$.`,
        },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Droite des moindres carrés',
          generatorId: '5gen37',
          description: ['À la main sur une petite série (point moyen, tableau des écarts, pente, ordonnée à l\'origine, prévision) ou à la calculatrice sur une série réelle (a et b arrondis, prévisions dans les deux sens).'],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 37. Droite des moindres carrés »',
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'correlation',
      number: 5,
      title: 'Covariance et coefficient de corrélation',
      kicker: 'covariance, sens de la liaison, coefficient r, R², tableau d’interprétation',
      titreCourt: 'Covariance et r',
      partie: 'Mesurer et interpréter la liaison',
      essentiel: [
        R`La **covariance** $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum (x_i-\bar{x})(y_i-\bar{y})$, ou $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$, donne le **sens** de la liaison : positive si $x$ et $y$ varient dans le même sens, négative sinon.`,
        R`Le **coefficient de corrélation** $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$ est compris entre $-1$ et $1$, sans unité : plus $|r|$ est proche de $1$, plus les points sont proches de la droite des moindres carrés ; $|r| = 1$ seulement si les points sont alignés.`,
        R`Intensité selon $|r|$ : nulle sous $0{,}35$, faible jusqu'à $0{,}60$, moyenne jusqu'à $0{,}80$, forte jusqu'à $0{,}98$, très forte au-delà, parfaite pour $|r| = 1$. Les tableurs donnent $R^2$, avec $|r| = \sqrt{R^2}$.`,
      ],
      cartes: [
        { question: R`Donne les deux formules de la covariance.`, reponse: R`$\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum (x_i-\bar{x})(y_i-\bar{y}) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$` },
        { question: R`$\operatorname{Cov} = 1{,}2$, $\sigma_x = \sqrt{2}$, $\sigma_y = \sqrt{1{,}2}$ : que vaut $r$ et comment l'interpréter ?`, reponse: R`$r = \dfrac{1{,}2}{\sqrt{2{,}4}} \approx 0{,}77$ : corrélation positive moyenne.` },
        { question: R`Un tableur affiche $R^2 = 0{,}81$ pour un nuage qui descend. Que vaut $r$ ?`, reponse: R`$|r| = \sqrt{0{,}81} = 0{,}9$ et le nuage descend, donc $r = -0{,}9$.` },
        { question: R`Pourquoi $a$, $\operatorname{Cov}(x,y)$ et $r$ ont-ils toujours le même signe ?`, reponse: R`$a = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$ et $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\sigma_y}$, avec $V(x) > 0$ et $\sigma_x\sigma_y > 0$.` },
      ],
      blocks: [
        { kind: 'video', title: 'Covariance et coefficient de corrélation : sens et intensité de la liaison' },
        {
          kind: 'rappel',
          label: 'Rappel de 4e — variance et écart-type',
          items: [
            R`La **variance** d'une série $x$ est la moyenne des carrés des écarts à la moyenne : $V(x) = \dfrac{1}{n}\sum (x_i-\bar{x})^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$.`,
            R`L'**écart-type** est sa racine carrée : $\sigma_x = \sqrt{V(x)}$. Il mesure la dispersion des données autour de leur moyenne.`,
          ],
        },
        {
          kind: 'para',
          text: R`Pour une série à deux variables, on voudrait mesurer si $x$ et $y$ s'écartent **ensemble** de leurs moyennes : quand $x_i$ est au-dessus de $\bar{x}$, $y_i$ est-il plutôt au-dessus de $\bar{y}$ ? On remplace le carré $(x_i - \bar{x})^2$ de la variance par le produit $(x_i - \bar{x})(y_i - \bar{y})$.`,
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser : les quatre quadrants autour de G',
          text: R`Trace deux axes par le point moyen $G$. Un point en haut à droite ($x_i > \bar{x}$ et $y_i > \bar{y}$) ou en bas à gauche donne un produit $(x_i-\bar{x})(y_i-\bar{y})$ **positif** ; un point des deux autres quadrants donne un produit **négatif**. Chaque produit est l'aire (avec un signe) du rectangle qui joint le point à $G$. La covariance fait la moyenne de ces aires : si les rectangles verts l'emportent, elle est positive et le nuage monte.`,
        },
        {
          kind: 'illustration',
          illustration: {
            kind: 'scatterPlot',
            points: BOISSONS,
            xMin: 4,
            xMax: 34,
            yMin: 15,
            yMax: 62,
            xTicks: [5, 10, 15, 20, 25, 30],
            yTicks: [20, 30, 40, 50, 60],
            xAxisLabel: 'température (°C)',
            yAxisLabel: 'boissons',
            quadrants: { x: 20, y: 37.625, rectangles: true },
            marks: [{ x: 20, y: 37.625, label: 'G', tone: 'ink', labelPos: 'right' }],
            caption: R`Boissons vendues selon la température : presque tous les rectangles qui joignent les points à $G(20\,;37{,}625)$ sont dans les quadrants « $+$ » (verts). Un seul est rouge, et très petit : la covariance est positive.`,
          },
        },
        {
          kind: 'atelier',
          tag: 'quadrants-covariance-widget',
          label: 'Manipule toi-même : les quatre quadrants de la covariance',
          caption:
            'Deux axes passent par G. Chaque point dessine son rectangle jusqu’à G : vert en haut à droite et en bas à gauche (produit positif), rouge ailleurs (produit négatif). La covariance fait le bilan. Le nuage en arc donne une covariance nulle alors que les points sont liés.',
        },
        {
          kind: 'definition',
          label: 'Définition — covariance',
          items: [
            R`La **covariance** de $x$ et $y$ est la moyenne des produits des écarts à la moyenne : $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum_{i=1}^{n} (x_i-\bar{x})(y_i-\bar{y})$.`,
            R`On la calcule aussi par la formule $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$ (démontrée ci-dessous), pratique avec la calculatrice.`,
            R`Son **signe** donne le **sens** de la liaison : une covariance positive indique que $x$ et $y$ varient dans le même sens ; une covariance négative, que l'une diminue quand l'autre augmente.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — les deux formules de la covariance sont égales',
          blocks: [
            { kind: 'para', text: R`On développe chaque produit : $(x_i-\bar{x})(y_i-\bar{y}) = x_iy_i - \bar{x}\,y_i - \bar{y}\,x_i + \bar{x}\,\bar{y}$.` },
            { kind: 'para', text: R`**Étape 1 — sommer.** $\sum (x_i-\bar{x})(y_i-\bar{y}) = \sum x_iy_i - \bar{x}\sum y_i - \bar{y}\sum x_i + n\,\bar{x}\,\bar{y}$.` },
            { kind: 'para', text: R`**Étape 2 — remplacer les sommes.** $\sum y_i = n\bar{y}$ et $\sum x_i = n\bar{x}$ : la somme vaut $\sum x_iy_i - n\bar{x}\bar{y} - n\bar{x}\bar{y} + n\bar{x}\bar{y} = \sum x_iy_i - n\,\bar{x}\,\bar{y}$.` },
            { kind: 'para', text: R`**Étape 3 — diviser par n.** $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$. Avec $y = x$, on retrouve la formule de la variance de 4e : $V(x) = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2$.` },
          ],
        },
        {
          kind: 'definition',
          label: 'Définition — coefficient de corrélation linéaire',
          items: [
            R`Le **coefficient de corrélation linéaire** est $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$. Il mesure à quel point les points du nuage sont concentrés autour de la droite des moindres carrés.`,
            R`$r$ est toujours compris entre $-1$ et $1$ et n'a pas d'unité. Son signe est celui de la covariance. Si $|r|$ est proche de $1$, la droite des moindres carrés est un bon ajustement du nuage ; $|r| = 1$ seulement si les points sont parfaitement alignés.`,
            R`Les calculatrices et les tableurs donnent souvent le **coefficient de détermination** $R^2$. Pour un ajustement affine par les moindres carrés, $R^2 = r^2$, donc $|r| = \sqrt{R^2}$ ; le signe de $r$ se lit sur le nuage (ou sur la pente).`,
          ],
        },
        {
          kind: 'featureTable',
          caption: 'Interprétation du coefficient de corrélation',
          headers: ['Corrélation', 'r positif', 'r négatif'],
          rows: [
            ['parfaite', '$r = 1$', '$r = -1$'],
            ['très forte', R`$0{,}98 \le r < 1$`, R`$-1 < r \le -0{,}98$`],
            ['forte', R`$0{,}80 \le r < 0{,}98$`, R`$-0{,}98 < r \le -0{,}80$`],
            ['moyenne', R`$0{,}60 \le r < 0{,}80$`, R`$-0{,}80 < r \le -0{,}60$`],
            ['faible', R`$0{,}35 \le r < 0{,}60$`, R`$-0{,}60 < r \le -0{,}35$`],
            ['nulle', { text: R`$-0{,}35 < r < 0{,}35$`, tone: 'bad' }, { text: R`$-0{,}35 < r < 0{,}35$`, tone: 'bad' }],
          ],
        },
        {
          kind: 'exemple',
          badge: 'covariance et r à la main, même série qu’au § 4',
          formula: R`Pour le nuage $(1\,;2)$, $(2\,;4)$, $(3\,;5)$, $(4\,;4)$, $(5\,;5)$, calcule la covariance par les deux formules, les écarts-types et $r$, puis interprète.`,
          steps: [
            { tag: 'covariance (écarts)', text: R`Avec le tableau du § 4 : $\sum X_iY_i = 6$, donc $\operatorname{Cov}(x,y) = \dfrac{6}{5} = 1{,}2$.` },
            { tag: 'covariance (produits)', text: R`$\sum x_iy_i = 2 + 8 + 15 + 16 + 25 = 66$, donc $\operatorname{Cov}(x,y) = \dfrac{66}{5} - 3 \times 4 = 13{,}2 - 12 = 1{,}2$.` },
            { tag: 'écarts-types', text: R`$\sum X_i^2 = 10$ et $\sum Y_i^2 = 4 + 0 + 1 + 0 + 1 = 6$ : $\sigma_x = \sqrt{\dfrac{10}{5}} = \sqrt{2}$ et $\sigma_y = \sqrt{\dfrac{6}{5}} = \sqrt{1{,}2}$.` },
            { tag: 'coefficient de corrélation', text: R`$r = \dfrac{1{,}2}{\sqrt{2} \times \sqrt{1{,}2}} = \dfrac{1{,}2}{\sqrt{2{,}4}} \approx 0{,}77$.` },
          ],
          result: { tag: 'interprétation', text: R`$\operatorname{Cov} > 0$ : liaison croissante ; $0{,}60 \le r < 0{,}80$ : corrélation **moyenne**. La droite $y = 0{,}6x + 2{,}2$ résume le nuage, mais les points s'en écartent nettement.` },
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — a, Cov et r ont le même signe',
          blocks: [
            { kind: 'para', text: R`**Étape 1 — la pente avec la covariance.** En divisant le numérateur et le dénominateur de $a$ par $n$ : $a = \dfrac{\frac{1}{n}\sum X_iY_i}{\frac{1}{n}\sum X_i^2} = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$.` },
            { kind: 'para', text: R`**Étape 2 — les dénominateurs sont positifs.** $V(x) > 0$ et $\sigma_x\,\sigma_y > 0$ dès que les $x_i$ ne sont pas tous égaux, ni les $y_i$.` },
            { kind: 'para', text: R`**Conclusion.** $a = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$ et $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$ ont le signe de la covariance : une droite de régression qui monte va avec une covariance et un $r$ positifs. Sur l'exemple, $a = \dfrac{1{,}2}{2} = 0{,}6$.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — r est compris entre −1 et 1',
          blocks: [
            { kind: 'para', text: R`Reprenons la somme des carrés des écarts verticaux de la droite des moindres carrés : $S = a^2\sum X_i^2 - 2a\sum X_iY_i + \sum Y_i^2$, avec $a\sum X_i^2 = \sum X_iY_i$.` },
            { kind: 'para', text: R`**Étape 1 — la plus petite somme.** $a^2\sum X_i^2 = a\sum X_iY_i$, donc la plus petite somme vaut $S_m = \sum Y_i^2 - a\sum X_iY_i$.` },
            { kind: 'para', text: R`**Étape 2 — avec σ et Cov.** $\sum Y_i^2 = n\,\sigma_y^2$, $\sum X_iY_i = n\operatorname{Cov}(x,y)$ et $a = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x^2}$ : $S_m = n\,\sigma_y^2 - n\dfrac{\operatorname{Cov}(x,y)^2}{\sigma_x^2} = n\,\sigma_y^2\left(1 - \dfrac{\operatorname{Cov}(x,y)^2}{\sigma_x^2\,\sigma_y^2}\right) = n\,\sigma_y^2\,(1 - r^2)$.` },
            { kind: 'para', text: R`**Étape 3 — conclure.** Une somme de carrés est positive ou nulle, et $n\,\sigma_y^2 > 0$ : donc $1 - r^2 \ge 0$, c'est-à-dire $-1 \le r \le 1$. De plus $r = \pm 1$ exactement quand $S_m = 0$, c'est-à-dire quand tous les points sont **sur** la droite. Plus $|r|$ est proche de $1$, plus la somme des carrés des écarts est petite : c'est pourquoi $r$ mesure la qualité de l'ajustement affine.` },
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Démonstration — changer d’unité ou d’origine ne change pas r',
          blocks: [
            { kind: 'para', text: R`Remplaçons chaque $x_i$ par $x'_i = kx_i + c$, avec $k > 0$ (changer d'unité, c'est multiplier par $k$ ; changer d'origine, c'est ajouter $c$, comme quand on compte les années à partir de 2000).` },
            { kind: 'para', text: R`**Étape 1 — les écarts sont multipliés par k.** $\bar{x}' = k\bar{x} + c$ (4e), donc $x'_i - \bar{x}' = k\,(x_i - \bar{x})$ : le décalage $c$ disparaît.` },
            { kind: 'para', text: R`**Étape 2 — Cov et σ.** $\operatorname{Cov}(x',y) = \dfrac{1}{n}\sum k\,(x_i-\bar{x})(y_i-\bar{y}) = k\operatorname{Cov}(x,y)$ et $\sigma_{x'} = k\,\sigma_x$ (car $k > 0$).` },
            { kind: 'para', text: R`**Conclusion.** $r' = \dfrac{k\operatorname{Cov}(x,y)}{k\,\sigma_x\,\sigma_y} = r$. Le même raisonnement vaut pour $y$. On peut donc centrer les années ou passer des centimètres aux mètres sans changer $r$ ; seule la pente $a$ change. Si $k < 0$, $r$ change de signe.` },
          ],
        },
        {
          kind: 'atelier',
          tag: 'changer-unites-widget',
          label: 'Manipule toi-même : changer d’unités',
          caption:
            'Passe des centimètres aux mètres, des kilogrammes aux grammes, ou centre les années : le nuage reste le même dessin, la pente change, mais r ne bouge pas (démonstration ci-dessus).',
        },
        {
          kind: 'methode',
          label: 'À la TI-30XB : r se lit, la covariance se calcule',
          items: [
            R`En mode **2-Var Stats** (§ 4), la calculatrice affiche directement $r$, ainsi que $\sigma_x$ et $\sigma_y$.`,
            R`Elle n'affiche pas la covariance : calcule-la avec $\operatorname{Cov}(x,y) = \dfrac{\sum xy}{n} - \bar{x}\,\bar{y}$, en lisant $\sum xy$, $n$, $\bar{x}$ et $\bar{y}$ dans la même liste de résultats. Contrôle : $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$ doit redonner la valeur affichée.`,
          ],
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — boissons et abonnements : covariance positive puis négative',
          blocks: [
            { kind: 'para', text: R`**1. Boissons.** L'économe d'une école relève, sur huit jours, la température moyenne $x$ (en °C) et le nombre de boissons vendues $y$ : $(8\,;21)$, $(12\,;29)$, $(15\,;27)$, $(19\,;38)$, $(22\,;36)$, $(25\,;47)$, $(28\,;45)$, $(31\,;58)$.` },
            { kind: 'para', text: R`À la calculatrice : $n = 8$, $\bar{x} = 20$, $\bar{y} = 37{,}625$, $\sum xy = 6\,668$, $\sigma_x \approx 7{,}483$, $\sigma_y \approx 11{,}313$. Donc $\operatorname{Cov}(x,y) = \dfrac{6\,668}{8} - 20 \times 37{,}625 = 833{,}5 - 752{,}5 = 81$ et $r = \dfrac{81}{7{,}483 \times 11{,}313} \approx 0{,}96$ (la calculatrice affiche aussi $r \approx 0{,}957$).` },
            { kind: 'para', text: R`Covariance positive : plus il fait chaud, plus on vend de boissons. $0{,}80 \le r < 0{,}98$ : corrélation **forte**.` },
            { kind: 'para', text: R`**2. Abonnements.** Une salle de sport demande à des jeunes combien s'abonneraient selon le prix annuel $x$ (en euros) : $(160\,;52)$, $(180\,;47)$, $(200\,;41)$, $(220\,;36)$, $(240\,;29)$, $(260\,;22)$, $(280\,;15)$, $(300\,;9)$.` },
            { kind: 'para', text: R`À la calculatrice : $\bar{x} = 230$, $\bar{y} = 31{,}375$, $\sum xy = 52\,480$, $\sigma_x \approx 45{,}826$, $\sigma_y \approx 14{,}343$. Donc $\operatorname{Cov}(x,y) = \dfrac{52\,480}{8} - 230 \times 31{,}375 = 6\,560 - 7\,216{,}25 = -656{,}25$ et $r \approx -0{,}998$.` },
            { kind: 'para', text: R`Covariance négative : plus le prix monte, moins il y a d'abonnés. $-1 < r \le -0{,}98$ : corrélation négative **très forte** ; la droite $y \approx -0{,}3125x + 103{,}25$ est un excellent modèle sur cette plage de prix.` },
          ],
        },
        {
          kind: 'historique',
          titre: 'Bravais et Pearson, les deux pères de r',
          text: R`En 1846, le physicien français **Auguste Bravais**, qui étudie les erreurs de mesure de la position d'un point, écrit une formule très proche de notre coefficient de corrélation. Le mot « corrélation » est popularisé par Francis Galton à la fin des années 1880, et c'est l'Anglais **Karl Pearson** qui, vers 1896, en fait l'outil de base des statisticiens et des biologistes, avec la formule $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$ que tu utilises. On parle souvent, en l'honneur des deux, du coefficient de **Bravais-Pearson**.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — associer cinq nuages à cinq valeurs de r',
          blocks: [
            { kind: 'para', text: R`Associe chaque nuage à son coefficient de corrélation parmi $-0{,}93$ ; $-0{,}45$ ; $0{,}05$ ; $0{,}70$ ; $0{,}99$.` },
            { kind: 'illustrationGroup', items: NUAGES_R.map((n, i) => nuageR(n.ys, i + 1)) },
            { kind: 'para', text: R`**Le signe d'abord.** Les nuages 4 et 5 descendent : ils reçoivent les deux valeurs négatives. Les nuages 1 et 2 montent nettement. Le nuage 3 ne montre aucune tendance.` },
            { kind: 'para', text: R`**Puis l'intensité.** Le nuage 2 est presque une droite : $r = 0{,}99$ ; le nuage 1 monte mais il est dispersé : $r = 0{,}70$. Le nuage 4 est serré autour d'une droite qui descend : $r = -0{,}93$ ; le nuage 5 descend à peine, très dispersé : $r = -0{,}45$. Le nuage 3 : $r = 0{,}05$, corrélation nulle.` },
          ],
        },
        {
          kind: 'atelier',
          tag: 'devine-r-widget',
          label: 'Manipule toi-même : devine r',
          caption:
            'Estime le coefficient de corrélation d’un nuage tiré au hasard, puis vérifie. Dans l’autre mode, fabrique toi-même un nuage dont r vaut une valeur donnée, à 0,05 près.',
        },
        {
          kind: 'piege',
          label: 'r = 0 ne veut pas dire « aucun lien »',
          text: R`$r$ mesure une liaison **linéaire**. Pour la recette selon le prix (§ 2, nuage B), le lien est très fort mais en arc, et $r \approx 0{,}03$ ! Une parabole parfaite et symétrique peut même donner $r = 0$. Inversement, le nuage des bactéries (§ 2, nuage C) donne $r \approx 0{,}95$ alors que la bonne courbe n'est pas une droite. On regarde le nuage avant de conclure.`,
        },
        {
          kind: 'piege',
          label: 'Confondre R² et r',
          text: R`Un tableur affiche $R^2 = 0{,}64$ : alors $|r| = \sqrt{0{,}64} = 0{,}8$, et pas $0{,}64$. Et la racine ne donne pas le signe : pour un nuage qui descend, $r = -0{,}8$.`,
        },
        {
          kind: 'piege',
          label: 'Un r plus grand que 1',
          text: R`Un coefficient comme $r = 1{,}3$ est impossible (démonstration ci-dessus) : il trahit une erreur de calcul, souvent $S_x$ pris à la place de $\sigma_x$, une covariance mal calculée ou une racine oubliée.`,
        },
        // Lot H1 (générateurs) : carte en FIN de section.
        {
          kind: 'entrainement',
          title: 'Covariance et coefficient de corrélation',
          generatorId: '5gen38',
          description: ['Calcule la covariance par les deux formules, les écarts-types σx et σy (sans les confondre avec Sx et Sy), puis r ; interprète le sens et l\'intensité de la corrélation avec le tableau du cours.'],
          chantier: '5e-4h',
          whereLabel: '5e (4h) → « 38. Covariance et coefficient de corrélation »',
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════════════════════════
    {
      id: 'interpreter',
      number: 6,
      title: 'Interpréter : fiabilité, point aberrant, corrélation et causalité',
      kicker: 'modèle fiable ?, extrapolation abusive, point aberrant, cause commune, coïncidence, décalage dans le temps',
      titreCourt: 'Interpréter',
      partie: 'Mesurer et interpréter la liaison',
      essentiel: [
        R`Une prévision est raisonnable si $|r|$ est proche de $1$, si c'est une interpolation plutôt qu'une extrapolation, et si le contexte reste le même que celui des données.`,
        R`Un seul **point aberrant** peut faire basculer la droite et effondrer $r$ : on regarde toujours le nuage avant de calculer, et on se demande si ce point a une explication.`,
        R`**Corrélation ne signifie pas causalité** : une forte corrélation peut venir d'une cause commune (une troisième variable), d'une coïncidence, d'une causalité dans l'autre sens, ou d'un effet décalé dans le temps.`,
      ],
      cartes: [
        { question: 'Quelles trois questions se poser avant de faire confiance à une prévision ?', reponse: R`$|r|$ est-il proche de $1$ ? Est-ce une interpolation ? Le contexte est-il le même que celui des données ?` },
        { question: 'Les ventes de crèmes glacées et de crème solaire sont fortement corrélées. Pourquoi ?', reponse: 'Cause commune : le soleil et la chaleur font augmenter les deux.' },
        { question: R`Une droite d'ajustement prévoit $-28$ décès pour 1 000 naissances. Qu'en conclure ?`, reponse: 'L’extrapolation est abusive : on est trop loin des données, la relation n’est plus affine.' },
        { question: 'Que montre le quartet d’Anscombe ?', reponse: R`Quatre séries de mêmes moyennes, même $r$ et même droite, aux nuages complètement différents : il faut regarder le nuage.` },
      ],
      blocks: [
        { kind: 'video', title: 'Interpréter une corrélation : fiabilité, point aberrant, causalité' },
        {
          kind: 'methode',
          label: 'Une prévision est-elle raisonnable ? Trois questions',
          items: [
            R`**Le modèle est-il fiable ?** Le nuage est-il à peu près aligné, et $|r|$ proche de $1$ (corrélation forte ou très forte) ?`,
            R`**Interpole-t-on ?** Une valeur de $x$ dans l'intervalle des données donne une prévision sûre ; hors de cet intervalle, la prudence s'impose, d'autant plus qu'on s'en éloigne.`,
            R`**Le contexte est-il le même ?** La droite décrit la situation où les données ont été prises (même saison, même époque, même population). Si cette situation change, la droite ne vaut plus.`,
          ],
        },
        {
          kind: 'exemple',
          badge: 'mortalité infantile : quand l’extrapolation devient absurde',
          formula: R`On donne le taux de mortalité infantile (décès d'enfants de moins d'un an pour 1 000 naissances) d'un pays par périodes de cinq ans, de 1946–1950 ($x = 1$) à 1971–1975 ($x = 6$) : $60$ ; $46$ ; $37$ ; $30$ ; $25$ ; $21$ (valeurs arrondies, pour l'exemple). Détermine la droite des moindres carrés et $r$, puis estime le taux pour 2001–2005. Que penser de ce modèle ?`,
          steps: [
            { tag: 'droite et r', text: R`À la calculatrice : $a \approx -7{,}57$, $b = 63$, $r \approx -0{,}97$. La corrélation est négative et forte.` },
            { tag: 'rang de 2001–2005', text: R`Les périodes de cinq ans se suivent : 1976–1980 est la période 7, … , 2001–2005 la période 12.` },
            { tag: 'prévision', text: R`$y \approx -7{,}57 \times 12 + 63 \approx -27{,}8$ : la droite prévoit environ $-28$ décès pour 1 000 naissances.` },
            { tag: 'interprétation', text: R`Un nombre de décès négatif est impossible. La période 12 est très loin des données ($x$ de $1$ à $6$), et le nuage n'est pas vraiment aligné : la baisse **ralentit** (il est de plus en plus difficile de gagner des vies quand le taux est déjà bas). Malgré $r \approx -0{,}97$, la droite ne vaut que près des données.` },
          ],
          result: { tag: 'conclusion', text: R`l'ajustement affine décrit bien 1946–1975, mais l'extrapolation à 2001–2005 est absurde : un $r$ proche de $-1$ ne rend pas une prévision lointaine fiable.` },
          illustration: {
            kind: 'scatterPlot',
            points: pts([1, 2, 3, 4, 5, 6], [60, 46, 37, 30, 25, 21]),
            xMin: 0,
            xMax: 13,
            yMin: -40,
            yMax: 70,
            xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            yTicks: [-40, -20, 0, 20, 40, 60],
            grid: true,
            xAxisLabel: 'période',
            yAxisLabel: 'décès pour 1 000',
            bands: [{ from: 1, to: 6, tone: 'good', label: 'données' }],
            lines: [
              { a: 0, b: 0, tone: 'faint', dashed: true },
              { a: -53 / 7, b: 63, tone: 'accent', label: 'y = −7,57x + 63', labelX: 10.2, labelPos: 'below' },
            ],
            marks: [{ x: 12, y: -27.86, label: '−28 ?', tone: 'bad', labelPos: 'above-right' }],
            caption: R`Les six périodes de données (zone verte) et la droite des moindres carrés : prolongée jusqu'à 2001–2005, elle passe sous la ligne des $0$ décès (en pointillés).`,
          },
        },
        {
          kind: 'para',
          text: R`Un point très éloigné des autres, ou **point aberrant**, peut à lui seul faire pivoter la droite des moindres carrés : comme ce sont les **carrés** des écarts qui comptent, un grand écart pèse énormément. Il peut venir d'une erreur de mesure ou de saisie, ou d'un événement exceptionnel : dans le commerce extérieur de la Belgique, l'année de crise 2009 donne des importations et des exportations bien plus basses que les années voisines. On ne supprime pas un point parce qu'il dérange : on cherche d'abord son explication, et on dit clairement ce qu'on a fait.`,
        },
        {
          kind: 'exemple',
          badge: 'retirer un point aberrant et recalculer',
          formula: R`Six élèves donnent leur temps de révision $x$ (en heures) et leur note $y$ sur 20 : $(1\,;6)$, $(2\,;8)$, $(3\,;10)$, $(4\,;11)$, $(5\,;14)$, $(6\,;4)$. Le sixième élève était malade le jour de l'interrogation. Calcule la droite des moindres carrés et $r$ avec, puis sans ce point.`,
          steps: [
            { tag: 'avec les six points', text: R`À la calculatrice : $a \approx 0{,}26$, $b \approx 7{,}93$, $r \approx 0{,}13$. Corrélation nulle : la droite est presque horizontale.` },
            { tag: 'sans le point (6 ; 4)', text: R`$G(3\,;9{,}8)$, $\sum X_iY_i = 19$, $\sum X_i^2 = 10$, $\sum Y_i^2 = 36{,}8$ : $a = 1{,}9$, $b = 9{,}8 - 1{,}9 \times 3 = 4{,}1$ et $r = \dfrac{19}{\sqrt{10 \times 36{,}8}} \approx 0{,}99$.` },
            { tag: 'interprétation', text: R`Un seul point a fait passer $r$ de $0{,}99$ (très forte) à $0{,}13$ (nulle). Ici, le point a une explication (la maladie) : on peut l'écarter pour étudier le lien entre révision et note, en le signalant.` },
          ],
          result: { tag: 'réponse', text: R`avec : $y \approx 0{,}26x + 7{,}93$, $r \approx 0{,}13$ ; sans : $y = 1{,}9x + 4{,}1$, $r \approx 0{,}99$.` },
          illustration: {
            kind: 'scatterPlot',
            points: [...pts([1, 2, 3, 4, 5], [6, 8, 10, 11, 14]), { x: 6, y: 4, tone: 'bad', label: 'malade' }],
            xMin: 0,
            xMax: 7,
            yMin: 0,
            yMax: 18,
            xTicks: [1, 2, 3, 4, 5, 6],
            yTicks: [4, 8, 12, 16],
            grid: true,
            xAxisLabel: 'heures',
            yAxisLabel: 'note',
            lines: [
              { a: 1.9, b: 4.1, tone: 'good', label: 'sans : y = 1,9x + 4,1', labelX: 3.2 },
              { a: 0.257143, b: 7.933333, tone: 'bad', dashed: true, label: 'avec : y ≈ 0,26x + 7,93', labelX: 5.2, labelPos: 'below' },
            ],
            caption: R`Le point de l'élève malade (en rouge) fait basculer la droite : sans lui, $r \approx 0{,}99$ ; avec lui, $r \approx 0{,}13$.`,
          },
        },
        {
          kind: 'atelier',
          tag: 'point-aberrant-widget',
          label: 'Manipule toi-même : le point aberrant',
          caption:
            'Fais glisser le point rouge loin du nuage : la droite des moindres carrés bascule et r chute, alors que les huit autres points n’ont pas bougé. Le bouton « Quartet d’Anscombe » montre les quatre séries de 1973 : mêmes moyennes, mêmes écarts-types, même r, même droite… et quatre nuages très différents.',
        },
        {
          kind: 'illustrationGroup',
          items: ANSCOMBE.map(nuageAnscombe),
        },
        {
          kind: 'historique',
          titre: 'Le quartet d’Anscombe (1973)',
          text: R`En 1973, le statisticien anglais **Francis Anscombe** publie quatre petites séries de $11$ points, dessinées ci-dessus. Elles ont les mêmes moyennes ($\bar{x} = 9$, $\bar{y} \approx 7{,}5$), les mêmes variances, le même coefficient de corrélation $r \approx 0{,}82$ et la même droite des moindres carrés $y \approx 0{,}5x + 3$. Pourtant, leurs nuages n'ont rien à voir : une droite bruitée, une courbe parfaite, une droite dérangée par un point aberrant, et un nuage vertical dont un seul point fait toute la droite. Sa leçon, toujours actuelle à l'heure des ordinateurs : **regarde le nuage avant de calculer**.`,
        },
        { kind: 'subheading', text: 'Corrélation ne signifie pas causalité' },
        {
          kind: 'definition',
          label: 'Corrélation et causalité',
          items: [
            R`Deux variables sont **corrélées** quand elles varient ensemble (ici, $|r|$ proche de $1$). Il y a **causalité** quand la variation de l'une **entraîne** celle de l'autre.`,
            R`Une forte corrélation ne prouve pas une causalité. Elle peut venir d'une **cause commune** (une troisième variable fait varier les deux), d'une **coïncidence** (deux évolutions sans rapport qui se ressemblent), d'une **causalité inverse** (c'est $y$ qui agit sur $x$), ou d'un effet **décalé dans le temps** qu'une comparaison au même moment ne voit pas.`,
          ],
        },
        {
          kind: 'intuition',
          label: 'Pour visualiser : la troisième variable cachée',
          text: R`Dans une école primaire, les élèves qui ont les plus grands pieds font moins de fautes d'orthographe : la corrélation négative entre pointure et nombre de fautes est forte. Faut-il étirer les pieds des enfants ? Non : les plus grands pieds sont ceux des élèves les plus **âgés**, qui ont aussi appris l'orthographe plus longtemps. L'âge est la cause commune, cachée derrière les deux variables observées.`,
        },
        {
          kind: 'exempleLibre',
          label: 'Exemple résolu — trois corrélations, trois explications',
          blocks: [
            { kind: 'para', text: R`On constate une forte corrélation dans chacune des situations suivantes. Y a-t-il causalité ?` },
            { kind: 'para', text: R`**1. En été, la vente des crèmes glacées et celle des lunettes de soleil.** Pas de causalité : manger une glace ne donne pas envie de lunettes. **Cause commune** : le soleil et la chaleur font monter les deux ventes.` },
            { kind: 'para', text: R`**2. Sur une décennie, le nombre de lapins dans une région et un indice de la Bourse de New York.** Pas de causalité, pas de cause commune plausible : c'est une **coïncidence**. En comparant assez de séries qui évoluent dans le temps, on finit toujours par en trouver deux qui se ressemblent.` },
            { kind: 'para', text: R`**3. L'alcoolémie des conducteurs et le nombre d'accidents de la route.** Ici, la causalité est **réelle** et établie par d'autres études (expériences de temps de réaction, comparaisons à conditions égales) : l'alcool ralentit les réflexes et altère le jugement. C'est ce qui justifie les limites légales et les contrôles ; la corrélation seule n'aurait pas suffi à le prouver.` },
          ],
        },
        {
          kind: 'para',
          text: R`Le temps peut aussi brouiller les pistes. Une entreprise qui compare, année par année, son budget de publicité et son bénéfice peut trouver une corrélation faible, voire négative, et conclure que la publicité ne sert à rien. Mais une campagne produit souvent ses effets **plus tard** : en comparant le budget d'une année au bénéfice de l'**année suivante**, la corrélation peut devenir forte. Avant de conclure à l'absence de lien, on se demande si l'effet n'est pas décalé.`,
        },
        {
          kind: 'application',
          titre: 'Le chocolat rend-il génial ?',
          text: R`En 2012, une revue médicale réputée publie un graphique amusant : pour une vingtaine de pays, la consommation annuelle de chocolat par habitant et le nombre de prix Nobel par habitant. La corrélation est forte ($r \approx 0{,}79$). Faut-il manger du chocolat pour décrocher un Nobel ? Personne ne le pense sérieusement : les pays riches consomment plus de chocolat **et** financent davantage la recherche et l'enseignement. La richesse du pays est une cause commune. L'exemple sert depuis dans les cours de statistique pour rappeler qu'une corrélation, même forte, ne suffit pas à établir une causalité : il faut une explication et, quand c'est possible, une expérience.`,
          domaines: ['Médecine', 'Économie'],
        },
        {
          kind: 'piege',
          label: '« r est proche de 1, donc x cause y »',
          text: R`Un $|r|$ proche de $1$ dit seulement que les points sont proches d'une droite. Il ne dit ni laquelle des deux variables agit sur l'autre, ni même si l'une agit sur l'autre. La causalité se justifie par le contexte ou par une expérience, jamais par $r$ seul.`,
        },
        {
          kind: 'piege',
          label: 'Prolonger la droite très loin des données',
          text: R`La mortalité infantile négative, la consommation d'électricité nulle à $35$ °C : une droite prolongée trop loin finit toujours par dire des absurdités. Une prévision par extrapolation s'accompagne d'une réserve, et d'autant plus forte qu'on s'éloigne des données.`,
        },
        {
          kind: 'piege',
          label: 'Calculer avant d’avoir regardé le nuage',
          text: R`Le quartet d'Anscombe le montre : les mêmes $a$, $b$ et $r$ peuvent décrire une droite, une courbe ou un nuage gouverné par un seul point. Dessine (ou fais dessiner) le nuage avant tout calcul.`,
        },
      ],
    },
  ],

  formulaire: {
    groups: [
      {
        title: 'Point moyen et droite de Mayer',
        formulas: [
          { text: R`$\bar{x} = \dfrac{1}{n}\sum x_i \qquad \bar{y} = \dfrac{1}{n}\sum y_i$`, condition: R`point moyen $G(\bar{x}\,;\bar{y})$ ; $\sum x_i = n\,\bar{x}$ pour retrouver une valeur manquante` },
          { text: R`$a = \dfrac{\bar{y}_2 - \bar{y}_1}{\bar{x}_2 - \bar{x}_1}$`, condition: R`droite de Mayer $(G_1G_2)$ : données triées selon les $x_i$, deux groupes de $k$ et $k$ (ou $k + 1$) données` },
          { text: R`$y - y_1 = a(x - x_1)$`, condition: 'droite de pente a passant par le point (x₁ ; y₁)' },
        ],
      },
      {
        title: 'Droite des moindres carrés',
        formulas: [
          { text: R`$S = \sum \big(y_i - (ax_i + b)\big)^2$`, condition: 'somme des carrés des écarts verticaux, minimale pour la droite des moindres carrés' },
          { text: R`$a = \dfrac{\sum (x_i-\bar{x})(y_i-\bar{y})}{\sum (x_i-\bar{x})^2} = \dfrac{\operatorname{Cov}(x,y)}{V(x)}$`, condition: 'coefficient de régression' },
          { text: R`$y - \bar{y} = a(x - \bar{x}) \qquad b = \bar{y} - a\bar{x}$`, condition: R`la droite passe par $G$` },
        ],
      },
      {
        title: 'Variance, covariance, corrélation',
        formulas: [
          { text: R`$V(x) = \dfrac{1}{n}\sum (x_i-\bar{x})^2 = \dfrac{1}{n}\sum x_i^2 - \bar{x}^2 \qquad \sigma_x = \sqrt{V(x)}$`, condition: R`division par $n$ : $\sigma_x$ sur la calculatrice, pas $S_x$` },
          { text: R`$\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum (x_i-\bar{x})(y_i-\bar{y}) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$`, condition: 'son signe donne le sens de la liaison' },
          { text: R`$r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y} \qquad -1 \le r \le 1 \qquad |r| = \sqrt{R^2}$`, condition: R`$|r| = 1$ : points alignés ; $r$ a le signe de $a$ et de la covariance` },
        ],
      },
      {
        title: 'Interpréter r',
        formulas: [
          { text: R`$|r| < 0{,}35$ : nulle ; $0{,}35 \le |r| < 0{,}60$ : faible`, condition: 'pas d’ajustement affine fiable' },
          { text: R`$0{,}60 \le |r| < 0{,}80$ : moyenne ; $0{,}80 \le |r| < 0{,}98$ : forte` },
          { text: R`$0{,}98 \le |r| < 1$ : très forte ; $|r| = 1$ : parfaite`, condition: 'une corrélation, même forte, ne prouve pas une causalité' },
        ],
      },
    ],
  },

  recap: {
    items: [
      R`**Nuage et point moyen** — une série à deux variables donne des couples $(x_i\,;y_i)$, représentés par un nuage de points ; le point moyen est $G(\bar{x}\,;\bar{y})$, avec des moyennes (jamais des médianes). La variable à prévoir va en ordonnée.`,
      R`**Ajuster** — on regarde d'abord la forme du nuage : alignée (droite), en arc (second degré), qui décolle (exponentielle) ou sans forme. Prévoir dans l'intervalle des données, c'est interpoler ; en dehors, c'est extrapoler, avec prudence.`,
      R`**Droite de Mayer** — trier selon les $x_i$, partager en deux groupes, calculer $G_1$ et $G_2$, puis la droite $(G_1G_2)$, qui passe par $G$. La pente reste en mémoire pour calculer $b$.`,
      R`**Moindres carrés** — la droite qui minimise $\sum \big(y_i - (ax_i + b)\big)^2$ (écarts verticaux) a pour pente $a = \dfrac{\sum X_iY_i}{\sum X_i^2}$, avec $X_i = x_i - \bar{x}$ et $Y_i = y_i - \bar{y}$, et passe par $G$ : $b = \bar{y} - a\bar{x}$.`,
      R`**Covariance et** $\boldsymbol{r}$ — $\operatorname{Cov}(x,y) = \dfrac{1}{n}\sum x_iy_i - \bar{x}\,\bar{y}$ donne le sens ; $r = \dfrac{\operatorname{Cov}(x,y)}{\sigma_x\,\sigma_y}$, entre $-1$ et $1$, mesure l'intensité de la liaison linéaire ; $|r| = \sqrt{R^2}$.`,
      R`**Interpréter** — un modèle est fiable si $|r|$ est proche de $1$, en interpolation, dans le même contexte ; un point aberrant peut tout changer ; corrélation ne signifie pas causalité (cause commune, coïncidence, causalité inverse, effet décalé).`,
    ],
    table: {
      headers: ['Corrélation (le signe de $r$ donne le sens)', R`$|r|$`],
      rows: [
        ['parfaite', '$|r| = 1$'],
        ['très forte', R`$0{,}98 \le |r| < 1$`],
        ['forte', R`$0{,}80 \le |r| < 0{,}98$`],
        ['moyenne', R`$0{,}60 \le |r| < 0{,}80$`],
        ['faible', R`$0{,}35 \le |r| < 0{,}60$`],
        ['nulle', R`$|r| < 0{,}35$`],
      ],
    },
    checklist: {
      items: [
        R`Ai-je regardé le nuage (forme, point aberrant) avant de calculer une droite ou $r$ ?`,
        R`Pour la droite de Mayer, ai-je trié les données selon les $x_i$ avant de partager ?`,
        R`Ai-je gardé la pente en mémoire pour calculer $b = \bar{y} - a\bar{x}$, sans échanger $\bar{x}$ et $\bar{y}$ ?`,
        R`Sur la calculatrice, ai-je lu $\sigma_x$ (division par $n$), et pas $S_x$ ?`,
        R`Mon $r$ est-il bien entre $-1$ et $1$, et de même signe que la pente ?`,
        R`Ma prévision est-elle une interpolation ou une extrapolation, et l'ai-je dit ?`,
        R`Ai-je évité de conclure à une causalité à partir de $r$ seul ?`,
      ],
    },
    forward:
      R`En 6e, tu étudieras les fonctions exponentielles et logarithmes : tu pourras alors ajuster un nuage qui « décolle » en ajustant par une droite le nuage des points $(x_i\,;\ln y_i)$. Et en 6e encore, les probabilités et les variables aléatoires prolongeront la statistique : moyenne et écart-type deviendront espérance et écart-type d'une loi.`,
    entrainement: {
      kind: 'entrainement',
      title: 'Quiz vrai ou faux — tout le chapitre',
      generatorId: '5gen82',
      description: [
        '6 thèmes d’environ 35 affirmations, un par section : nuage et point moyen, ajustement et prévision, droite de ' +
          'Mayer, moindres carrés, covariance et coefficient de corrélation, interprétation et causalité. Choisis un ' +
          'thème, réponds vrai ou faux — la justification est toujours révélée.',
      ],
      chantier: '5e-4h',
      whereLabel: '5e (4h) → « 82. Statistique à deux variables — quiz vrai/faux »',
    },
  },
}
