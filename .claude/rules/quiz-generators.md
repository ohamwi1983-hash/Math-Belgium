---
paths:
  - "src/entrainement/**/generateurs/quiz*/**"
---

# Générateurs quiz vrai/faux — pas de « grands calculs »

Un quiz vrai/faux (banque d'affirmations pré-écrites, `banque.ts` de chaque dossier
`generateurs/quizXxx/`) teste la **compréhension par vérification rapide** — jamais un calcul à
plusieurs étapes. Un calcul lourd en fait un exercice déguisé, rôle déjà rempli par les autres
générateurs du même chapitre (demande explicite de l'utilisateur, audit du chapitre 1 de 4e,
`quizFonctionSecondDegre`).

**À faire systématiquement lors de l'audit d'un chapitre** (Point 1, audit par chapitre) : relire
toute la banque du quiz du chapitre et repérer les affirmations qui demandent un vrai calcul
plutôt qu'un coup d'œil. Catégories déjà rencontrées et retirées (voir
`generateurs/quizFonctionSecondDegre/banque.ts`, en-tête, pour le précédent complet — 5
affirmations retirées sur 245) :

- **Développer un produit** pour en déduire un coefficient (ex. `(2x-1)(x+3)` → quel est `a` ?).
- **Calculer un sommet PUIS l'évaluer** (`xS=-b/2a` puis `yS=f(xS)`) pour une fonction développée
  donnée sans sa forme canonique — deux étapes de calcul avec plusieurs termes à combiner.
- **Vérifier une chaîne de résolution complète** (distribution, factorisation, lecture des
  racines) compressée en une seule affirmation — revoir toute la démarche d'un exercice, pas un
  seul fait.

**Reste acceptable** (ne pas retirer par excès de prudence) : lire un coefficient/une coordonnée
directement sur une forme déjà écrite (canonique ou factorisée) ; reconnaître un motif déjà
factorisé et vérifier sa racine (`(x-2)(x+5)` → racines 2 et -5) ; évaluer une expression déjà
sous forme factorisée en un point simple (`x(20-x)` en `x=10` → `10×10=100`, une seule
multiplication) ; tout vrai/faux conceptuel sur une propriété générale, sans exemple numérique.
La frontière est le nombre d'ÉTAPES de calcul à enchaîner, pas la présence d'un nombre dans
l'énoncé.

**Si des affirmations sont retirées**, vérifier que `nombreExercices` (dans l'`App*.tsx` du quiz)
n'est **jamais une constante fixe** supposant un compte identique par thème — la banque peut avoir
un nombre d'affirmations différent d'un thème à l'autre (voir le piège rencontré sur
`AppQuizFonctionSecondDegre.tsx` : une constante `35` codée en dur, couplée à
`creerGenerateurSansRepetition`, aurait fait répéter une question dans une session sur un thème
réduit à 33 ou 34). Utiliser la taille réelle de la banque du thème (`banque[themeId].length`,
exposée par un helper `nombreQuestions`/équivalent dans l'`index.ts` du générateur), calculée à
chaque nouvelle session. Mettre à jour en conséquence tout texte d'accueil qui annonce un compte
fixe (« 35 affirmations » → « 33 à 35 affirmations », ou formulation équivalente si le compte
varie). Vérifier en direct (Playwright) qu'une session complète sur le thème le plus réduit ne
répète aucune question et affiche le bon dénominateur.
