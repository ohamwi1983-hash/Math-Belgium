/**
 * Couche A (5e) — banque de questions vrai/faux pour "Fonctions : rappels et compléments"
 * (chapitre 1, 5gen39). 280 affirmations pré-écrites (jamais générées procéduralement), 8 thèmes de
 * 35 questions chacun — 18 vraies / 17 fausses par thème (17 / 18 pour « domaine d'une composée ») —
 * calqués sur ce que couvrent 5gen1 à 5gen5 et le cours `content/chapters/5e-4h/fonctions-composees.ts`.
 *
 * Lot E (audit complet du chapitre 1 de 5e) : +15 affirmations par thème existant, thème nouveau
 * « domaine d'une composée » (double condition, image de la fonction intérieure, domaine vide) ;
 * corrigées : « N/D ≥ 0 garantit D ≠ 0 » (logiquement vraie, remplacée par « sans exclure les zéros
 * de D »), « +10 € par objet » (vraie seulement pour un coût affine, désormais dit), nombres ≥ 1 000
 * avec espace fine. Les affirmations chiffrées (domaines, images, composées en un point) ont été
 * contrôlées par échantillonnage numérique.
 *
 * Révision (audit du chapitre 1 de 5e, décision J) :
 * - énoncés et justifications écrits avec `$…$` (LaTeX, même convention que `RichText` du site),
 *   rendus par `components5e/TexteQuizFonctions5e.tsx` à l'écran et découpés en fragments par
 *   `lib/banquesVraiFaux.ts` pour les feuilles ;
 * - plus aucun jargon de plateforme testé comme une notion mathématique (« CE réservé au
 *   dénominateur », « polynôme intermédiaire », « racine contre solution ») : le cours appelle CE
 *   aussi la condition sur un radicande ;
 * - « hors de la portion tracée » n'est plus confondu avec « n'existe pas » ; une valeur lue entre
 *   deux graduations s'estime ;
 * - doublons retirés (dont la dizaine de variantes de « on lit g d'abord »), remplacés par des
 *   lectures chiffrées courtes ;
 * - aucun « grand calcul » (`.claude/rules/quiz-generators.md`) : chaque affirmation se vérifie par
 *   un fait du cours ou un calcul d'une seule étape.
 */
import type { QuestionVraiFaux5e, VarianteQuizFonctions5e } from "../../core5e/quizFonctions5e.types";

function q(reponse: boolean, enonce: string, justification: string): QuestionVraiFaux5e {
  return { enonce, reponse, justification };
}

export const BANQUE_QUIZ_FONCTIONS_5E: Record<VarianteQuizFonctions5e, QuestionVraiFaux5e[]> = {
  // ==========================================================================
  // Vocabulaire et généralités
  // ==========================================================================
  vocabulaire: [
    q(true, "Le domaine de définition d'une fonction $f$ est l'ensemble des réels $x$ pour lesquels $f(x)$ peut être calculé.", "C'est la définition même du domaine de définition."),
    q(true, "Si $a$ n'appartient pas au domaine de définition de $f$, on peut répondre « $f(a)$ n'existe pas ».", "C'est la réponse correcte, pas un aveu d'échec, dès que $a$ est hors du domaine."),
    q(false, "Si deux fonctions ont la même expression une fois simplifiée, elles ont forcément le même domaine de définition.", "Faux : $\\dfrac{x^2}{x}$ se simplifie en $x$, mais elle n'est pas définie en $0$, alors que $x$ l'est. Le domaine se lit sur l'expression d'origine."),
    q(false, "Une fonction peut associer deux images différentes à un même réel $x$ de son domaine.", "Faux : une fonction associe à chaque $x$ de son domaine une seule image."),
    q(false, "Le domaine de définition d'une fonction est toujours $\\mathbb{R}$, quelle que soit son expression.", "Faux : un dénominateur ou une racine d'indice pair peut exclure des valeurs ; par exemple $\\dfrac{1}{x}$ n'est pas définie en $0$."),
    q(true, "Une valeur qui annule le dénominateur d'une fraction est exclue du domaine de définition.", "Diviser par $0$ est impossible : cette valeur ne peut pas appartenir au domaine."),
    q(true, "L'image d'une fonction est l'ensemble des valeurs prises par $f(x)$ lorsque $x$ parcourt le domaine de définition.", "C'est la définition de l'image (ou ensemble image)."),
    q(true, "Si $f(2)$ n'existe pas, alors $2$ n'appartient pas au domaine de définition de $f$.", "C'est la définition du domaine, lue dans l'autre sens."),
    q(false, "Le domaine de définition de $f(x)=\\sqrt{x}$ est $\\mathopen{]}0\\,;+\\infty\\mathclose{[}$.", "Faux : $\\sqrt{0}=0$ existe, donc $0$ appartient au domaine ; le domaine est $[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Deux fonctions d'expressions différentes peuvent avoir le même domaine de définition.", "Par exemple $\\dfrac{1}{x}$ et $\\dfrac{x+1}{x}$ ont toutes deux pour domaine $\\mathbb{R}\\setminus\\{0\\}$."),
    q(false, "Si la condition d'existence d'une fraction est $D(x)\\neq 0$, alors une valeur qui annule $D(x)$ fait partie du domaine.", "Faux : une valeur qui annule $D(x)$ rend la fraction impossible à calculer ; elle est exclue."),
    q(false, "L'image d'une fonction et son domaine de définition désignent la même notion.", "Faux : le domaine est l'ensemble des $x$ autorisés, l'image l'ensemble des valeurs $f(x)$ atteintes."),
    q(true, "Un domaine de définition peut exclure plusieurs valeurs isolées à la fois.", "Par exemple $f(x)=\\dfrac{1}{x(x-1)}$ exclut à la fois $0$ et $1$."),
    q(false, "Le domaine de définition d'une fonction contient toujours $0$.", "Faux : $f(x)=\\sqrt{x-2}$ a pour domaine $[2\\,;+\\infty\\mathclose{[}$, qui ne contient pas $0$."),
    q(true, "Chercher les valeurs interdites d'un dénominateur revient à résoudre l'équation « dénominateur $=0$ ».", "Les valeurs interdites sont exactement celles qui annulent le dénominateur."),
    q(false, "Le symbole $\\varnothing$ utilisé pour un domaine de définition signifie que toutes les valeurs de $x$ conviennent.", "Faux : $\\varnothing$ est l'ensemble vide, aucune valeur ne convient ; c'est $\\mathbb{R}$ qui signifierait « toutes »."),
    q(true, "Une expression qui ne contient ni dénominateur ni racine d'indice pair est définie pour tout réel.", "Polynômes, valeurs absolues et racines d'indice impair sont toujours définis : rien n'exclut de valeur."),
    q(false, "Une racine cubique impose la condition « radicande $\\ge 0$ ».", "Faux : une racine d'indice impair est définie pour tout radicande, par exemple $\\sqrt[3]{-8}=-2$."),
    q(false, "Si $f(a)$ et $f(b)$ existent, alors tout réel compris entre $a$ et $b$ appartient au domaine de $f$.", "Faux : pour $f(x)=\\dfrac{1}{x}$, $f(-1)$ et $f(1)$ existent, mais $0$, compris entre les deux, est exclu."),
    q(true, "Le domaine de $f(x)=\\dfrac{1}{x}$ peut s'écrire $\\mathbb{R}\\setminus\\{0\\}$ ou $\\mathopen{]}{-\\infty}\\,;0\\mathclose{[}\\,\\cup\\,\\mathopen{]}0\\,;+\\infty\\mathclose{[}$.", "Ce sont deux écritures du même ensemble : tous les réels sauf $0$."),
    q(true, "L'image de $f(x)=x^2$ est $[0\\,;+\\infty\\mathclose{[}$.", "Un carré n'est jamais négatif, et tout réel positif $y$ est atteint : $f(\\sqrt{y})=y$."),
    q(false, "L'image de $f(x)=x^2$ est $\\mathbb{R}$.", "Faux : un carré n'est jamais négatif ; aucune valeur négative n'est atteinte, l'image est $[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Sur un graphique, le domaine de $f$ se lit en projetant la courbe sur l'axe des abscisses.", "Les abscisses des points de la courbe sont exactement les $x$ pour lesquels $f(x)$ existe."),
    q(false, "Sur un graphique, l'image de $f$ se lit en projetant la courbe sur l'axe des abscisses.", "Faux : l'image rassemble les valeurs $f(x)$, lues sur l'axe des ordonnées ; l'axe des abscisses donne le domaine."),
    q(true, "L'image de $f(x)=\\sqrt{x}$ est $[0\\,;+\\infty\\mathclose{[}$.", "Une racine carrée n'est jamais négative, et tout $y\\ge 0$ est atteint : $\\sqrt{y^2}=y$."),
    q(false, "L'image de $f(x)=\\dfrac{1}{x}$ contient $0$.", "Faux : une fraction de numérateur $1$ ne vaut jamais $0$."),
    q(true, "Si $f(3)=5$, alors $5$ appartient à l'image de $f$.", "$5$ est une valeur prise par $f$, atteinte en $x=3$."),
    q(false, "Si $5$ appartient à l'image de $f$, alors $f(5)$ existe.", "Faux : pour $f(x)=\\dfrac{1}{x-5}$, la valeur $5$ est atteinte ($f(5{,}2)=5$), mais $f(5)$ n'existe pas."),
    q(true, "Une droite verticale coupe la courbe d'une fonction en un point au plus.", "Un même $x$ n'a qu'une image : la courbe a au plus un point d'abscisse $x$."),
    q(false, "Un cercle est la courbe d'une fonction de $x$.", "Faux : une droite verticale qui traverse le cercle le coupe en deux points, donc deux images pour un même $x$."),
    q(true, "Si la courbe complète de $f$ va de $x=-2$ à $x=5$, extrémités pleines comprises, alors $\\mathrm{dom}\\,f=[-2\\,;5]$.", "On projette la courbe sur l'axe des abscisses ; les extrémités pleines sont incluses."),
    q(false, "Un rond vide à l'extrémité d'une courbe signifie que ce point appartient à la courbe.", "Faux : un rond vide marque un point exclu ; c'est un point plein qui appartient à la courbe."),
    q(true, "Le point $(2\\,;7)$ appartient à la courbe de $f$ si et seulement si $f(2)=7$.", "La courbe est l'ensemble des points $(x\\,;f(x))$."),
    q(true, "L'image de $f(x)=4-x^2$ est $\\mathopen{]}{-\\infty}\\,;4]$.", "$-x^2\\le 0$, donc $f(x)\\le 4$, avec $f(0)=4$ ; toutes les valeurs inférieures à $4$ sont atteintes."),
    q(false, "L'image de $f(x)=|x|$ est $\\mathbb{R}$.", "Faux : une valeur absolue n'est jamais négative ; l'image est $[0\\,;+\\infty\\mathclose{[}$."),
  ],

  // ==========================================================================
  // Domaine de définition — fractions rationnelles
  // ==========================================================================
  domaineRationnel: [
    q(true, "Pour $f(x)=\\dfrac{2x+1}{x-3}$, la condition d'existence est $x-3\\neq 0$, soit $x\\neq 3$.", "Le dénominateur $x-3$ s'annule en $x=3$, seule valeur à exclure."),
    q(false, "Pour une fraction $\\dfrac{N(x)}{D(x)}$, la condition d'existence est $D(x)\\ge 0$.", "Faux : c'est $D(x)\\neq 0$ ; un dénominateur négatif ne pose aucun problème, seul un dénominateur nul est interdit."),
    q(true, "Pour $f(x)=\\dfrac{5}{x^2-4}$, la condition d'existence donne $x\\neq 2$ et $x\\neq -2$.", "$x^2-4=0$ équivaut à $x^2=4$, soit $x=2$ ou $x=-2$."),
    q(false, "Pour $f(x)=\\dfrac{5}{x^2-4}$, le domaine de définition est $\\mathbb{R}\\setminus\\{2\\}$.", "Faux : $x^2-4$ s'annule aussi en $-2$ ; le domaine est $\\mathbb{R}\\setminus\\{-2\\,;2\\}$."),
    q(true, "Pour $f(x)=\\dfrac{3}{x^2+4}$, il n'y a aucune valeur interdite.", "$x^2\\ge 0$, donc $x^2+4\\ge 4>0$ : ce dénominateur ne s'annule jamais."),
    q(true, "Pour $f(x)=\\dfrac{x+1}{x^2-5x+6}$, il faut exclure $x=2$ et $x=3$.", "$x^2-5x+6=(x-2)(x-3)$ s'annule en $2$ et en $3$."),
    q(true, "Pour $f(x)=\\dfrac{7}{2x-6}$, il faut exclure $x=3$ uniquement.", "$2x-6=0$ donne $x=3$, seule valeur qui annule ce dénominateur."),
    q(false, "Pour $f(x)=\\dfrac{4}{x^2+2x+1}$, il faut exclure $x=1$ et $x=-1$.", "Faux : $x^2+2x+1=(x+1)^2$ ne s'annule qu'en $-1$ ; en $1$ il vaut $4$."),
    q(true, "Si le dénominateur est factorisé, $D(x)=(x-a)(x-b)$, la condition d'existence s'écrit $x\\neq a$ et $x\\neq b$.", "Un produit s'annule dès que l'un de ses facteurs s'annule."),
    q(true, "Si le dénominateur est du second degré et que son discriminant vérifie $\\Delta<0$, il ne s'annule pour aucun réel.", "$\\Delta<0$ signifie que l'équation $D(x)=0$ n'a aucune solution réelle."),
    q(false, "Pour $f(x)=\\dfrac{x-1}{x-1}$, le domaine est $\\mathbb{R}$, car l'expression se simplifie en $1$.", "Faux : la condition $x\\neq 1$ se lit sur l'expression d'origine, avant toute simplification ; le domaine est $\\mathbb{R}\\setminus\\{1\\}$."),
    q(false, "Pour $f(x)=\\dfrac{2}{(x-1)(x+4)}$, le domaine est $\\mathbb{R}\\setminus\\{-1\\,;4\\}$.", "Faux : les facteurs s'annulent en $x=1$ et en $x=-4$ ; le domaine est $\\mathbb{R}\\setminus\\{-4\\,;1\\}$."),
    q(true, "Pour $f(x)=\\dfrac{1}{x^2-1}+\\dfrac{2}{x-3}$, le domaine exclut $1$, $-1$ et $3$.", "$x^2-1$ s'annule en $\\pm 1$ et $x-3$ en $3$ : les trois valeurs sont interdites."),
    q(false, "Pour $f(x)=\\dfrac{1}{x^2-1}+\\dfrac{2}{x-3}$, il suffit d'exclure les valeurs interdites d'un seul des deux dénominateurs.", "Faux : chaque dénominateur impose sa propre condition, et toutes doivent être respectées."),
    q(true, "Pour une fraction dont le numérateur et le dénominateur sont des polynômes, la condition d'existence ne porte que sur le dénominateur.", "Un polynôme est défini pour tout réel : seul le dénominateur peut poser problème."),
    q(false, "Pour $f(x)=\\dfrac{x^2+1}{x+5}$, il n'y a aucune valeur interdite, car $x^2+1$ ne s'annule jamais.", "Faux : c'est le dénominateur $x+5$ qui compte ; il s'annule en $-5$."),
    q(false, "Le domaine de $f(x)=\\dfrac{x-2}{x^2-2x}$ est $\\mathbb{R}\\setminus\\{2\\}$.", "Faux : $x^2-2x=x(x-2)$ s'annule aussi en $0$ ; le domaine est $\\mathbb{R}\\setminus\\{0\\,;2\\}$."),
    q(false, "Le domaine de $f(x)=\\dfrac{3}{x^2+5}$ est $\\mathbb{R}\\setminus\\{-5\\}$.", "Faux : $x^2+5\\ge 5>0$ ne s'annule jamais ; le domaine est $\\mathbb{R}$."),
    q(true, "Pour trouver les valeurs interdites d'un dénominateur du second degré, on peut résoudre $D(x)=0$ avec le discriminant.", "C'est la méthode habituelle pour trouver les zéros d'un trinôme."),
    q(false, "Un dénominateur du second degré exclut toujours exactement deux valeurs.", "Faux : cela dépend de $\\Delta$ — deux valeurs si $\\Delta>0$, une si $\\Delta=0$, aucune si $\\Delta<0$."),
    q(true, "Pour $f(x)=\\dfrac{x}{x+7}$, le domaine est $\\mathbb{R}\\setminus\\{-7\\}$.", "Le dénominateur $x+7$ s'annule seulement en $-7$."),
    q(false, "Pour $f(x)=\\dfrac{x+7}{x}$, le domaine est $\\mathbb{R}\\setminus\\{-7\\}$.", "Faux : le dénominateur est $x$, qui s'annule en $0$ ; le domaine est $\\mathbb{R}\\setminus\\{0\\}$."),
    q(true, "Pour $f(x)=\\dfrac{1}{x^2-9}$, il faut exclure $3$ et $-3$.", "$x^2-9=0$ équivaut à $x^2=9$, soit $x=3$ ou $x=-3$."),
    q(false, "Pour $f(x)=\\dfrac{1}{x^2+9}$, il faut exclure $3$ et $-3$.", "Faux : $x^2+9\\ge 9>0$ ne s'annule jamais ; en $3$, il vaut $18$. Le domaine est $\\mathbb{R}$."),
    q(true, "Pour $f(x)=\\dfrac{2}{x(x+5)}$, le domaine est $\\mathbb{R}\\setminus\\{-5\\,;0\\}$.", "Le produit $x(x+5)$ s'annule en $0$ et en $-5$."),
    q(false, "Une valeur qui annule le numérateur d'une fraction est exclue du domaine.", "Faux : un numérateur nul donne une fraction nulle, ce qui est permis ; par exemple $\\dfrac{x-1}{x+2}$ vaut $0$ en $x=1$."),
    q(true, "Pour $f(x)=\\dfrac{3x}{4x-2}$, la valeur interdite est $x=\\dfrac{1}{2}$.", "$4x-2=0$ donne $x=\\dfrac{2}{4}=\\dfrac{1}{2}$."),
    q(false, "Pour $f(x)=\\dfrac{3x}{4x-2}$, la valeur interdite est $x=2$.", "Faux : en $x=2$, $4x-2=6\\neq 0$ ; la valeur interdite est $x=\\dfrac{1}{2}$."),
    q(true, "Pour $f(x)=\\dfrac{1}{(x-2)^2}$, seule la valeur $2$ est interdite.", "Un carré ne s'annule que si ce qu'il contient est nul : $x-2=0$, soit $x=2$."),
    q(false, "Pour $f(x)=\\dfrac{x-3}{x^2-9}$, $x=3$ appartient au domaine, puisque la fraction se simplifie.", "Faux : en $x=3$, le dénominateur $x^2-9$ vaut $0$ ; la condition se lit avant toute simplification."),
    q(true, "Le domaine de $f(x)=\\dfrac{5}{x^3}$ est $\\mathbb{R}\\setminus\\{0\\}$.", "$x^3=0$ seulement pour $x=0$."),
    q(false, "Pour $f(x)=\\dfrac{1}{x-1}-\\dfrac{1}{x+1}$, le domaine est $\\mathbb{R}\\setminus\\{1\\}$.", "Faux : le second dénominateur s'annule en $-1$ ; le domaine est $\\mathbb{R}\\setminus\\{-1\\,;1\\}$."),
    q(true, "Pour $f(x)=\\dfrac{x+2}{x^2-4x}$, les valeurs interdites sont $0$ et $4$.", "$x^2-4x=x(x-4)$ s'annule en $0$ et en $4$."),
    q(false, "Le domaine de $f(x)=\\dfrac{x^2-1}{3}$ est $\\mathbb{R}\\setminus\\{-1\\,;1\\}$.", "Faux : le dénominateur vaut toujours $3$ ; $-1$ et $1$ annulent le numérateur, ce qui est permis. Le domaine est $\\mathbb{R}$."),
    q(true, "Pour $f(x)=\\dfrac{1}{2x^2+x+1}$, on a $\\Delta=1-8<0$ : le domaine est $\\mathbb{R}$.", "Avec $\\Delta<0$, le dénominateur ne s'annule pour aucun réel."),
  ],

  // ==========================================================================
  // Domaine de définition — racines
  // ==========================================================================
  domaineRacines: [
    q(true, "Pour $f(x)=\\sqrt{3x-5}$, la condition d'existence est $3x-5\\ge 0$, soit $x\\ge \\dfrac{5}{3}$.", "On résout l'inégalité du radicande : $3x\\ge 5$."),
    q(false, "Pour $f(x)=\\sqrt{3x-5}$, la condition d'existence est $3x-5>0$, avec une inégalité stricte.", "Faux : une racine carrée est définie quand le radicande vaut $0$ ; la condition est $3x-5\\ge 0$."),
    q(true, "Pour $f(x)=\\sqrt{4-2x}$, le domaine de définition est $\\mathopen{]}{-\\infty}\\,;2]$.", "$4-2x\\ge 0$ équivaut à $x\\le 2$ (on divise par $-2$ : le sens change)."),
    q(false, "Pour $f(x)=\\sqrt{\\dfrac{N(x)}{D(x)}}$, il suffit d'étudier les signes de $N$ et de $D$, sans exclure les zéros de $D$.", "Faux : en un zéro de $D$, le quotient n'existe pas ; on l'exclut (double barre dans le tableau de signes), même si les signes autour conviennent."),
    q(true, "Pour $f(x)=\\sqrt{\\dfrac{N(x)}{D(x)}}$, la condition d'existence est : $D(x)\\neq 0$ et $\\dfrac{N(x)}{D(x)}\\ge 0$.", "Il faut que le quotient soit calculable et que son signe permette la racine carrée."),
    q(true, "Pour $f(x)=\\sqrt{\\dfrac{x-1}{x+2}}$, on exclut d'abord $-2$, puis on garde les valeurs où le quotient est positif ou nul.", "C'est la méthode pour la racine carrée d'un quotient."),
    q(false, "Pour $f(x)=\\sqrt{\\dfrac{x-1}{x+2}}$, le domaine est $\\mathopen{]}{-\\infty}\\,;-2]\\,\\cup\\,[1\\,;+\\infty\\mathclose{[}$.", "Faux : $-2$ annule le dénominateur et doit être exclu ; le domaine est $\\mathopen{]}{-\\infty}\\,;-2\\mathclose{[}\\,\\cup\\,[1\\,;+\\infty\\mathclose{[}$."),
    q(false, "Pour $f(x)=\\dfrac{N(x)}{\\sqrt{D(x)}}$, la condition d'existence est $D(x)\\ge 0$.", "Faux : la racine est au dénominateur, elle ne peut pas valoir $0$ ; il faut $D(x)>0$."),
    q(true, "Pour $f(x)=\\dfrac{5}{\\sqrt{x-3}}$, la condition d'existence est $x-3>0$, soit $x>3$.", "La racine est au dénominateur : elle doit être strictement positive."),
    q(false, "Pour $f(x)=\\dfrac{5}{\\sqrt{x-3}}$, $x=3$ appartient au domaine, car $\\sqrt{0}=0$ existe.", "Faux : $\\sqrt{0}=0$ existe, mais diviser par ce $0$ est impossible ; $3$ est exclu."),
    q(true, "Pour une racine d'indice impair, comme $\\sqrt[3]{\\phantom{x}}$, le radicande peut être négatif.", "Par exemple $\\sqrt[3]{-8}=-2$, car $(-2)^3=-8$."),
    q(true, "Pour $f(x)=\\dfrac{2}{\\sqrt[3]{x-1}}$, la seule condition est $x-1\\neq 0$.", "La racine cubique est toujours définie ; seule l'annulation du dénominateur pose problème."),
    q(false, "Pour $f(x)=\\dfrac{2}{\\sqrt[3]{x-1}}$, il faut exclure toutes les valeurs telles que $x-1<0$.", "Faux : une racine cubique accepte un radicande négatif ; on exclut seulement $x=1$."),
    q(true, "La fonction $x\\mapsto |x|$ est définie pour tout réel $x$.", "La valeur absolue a un sens pour tout réel, positif, négatif ou nul."),
    q(false, "La fonction $f(x)=|x-3|$ impose la condition $x-3\\ge 0$, comme une racine carrée.", "Faux : la valeur absolue est définie pour tout réel (par exemple $|-5|=5$) ; aucune condition."),
    q(false, "Pour $f(x)=\\sqrt{x^2-4x+4}$, le domaine est $[2\\,;+\\infty\\mathclose{[}$.", "Faux : $x^2-4x+4=(x-2)^2\\ge 0$ pour tout réel ; le domaine est $\\mathbb{R}$."),
    q(true, "Pour $f(x)=\\sqrt{x^2+1}$, le domaine est $\\mathbb{R}$.", "$x^2+1\\ge 1>0$ : le radicande n'est jamais négatif."),
    q(true, "Pour $f(x)=\\sqrt{x^2-9}$, le domaine est $\\mathopen{]}{-\\infty}\\,;-3]\\,\\cup\\,[3\\,;+\\infty\\mathclose{[}$.", "$x^2\\ge 9$ équivaut à $x\\le -3$ ou $x\\ge 3$."),
    q(false, "Le domaine de $f(x)=\\sqrt{\\dfrac{1}{x-2}}$ est $\\mathbb{R}\\setminus\\{2\\}$.", "Faux : pour $x<2$, le quotient est négatif et la racine n'existe pas ; le domaine est $\\mathopen{]}2\\,;+\\infty\\mathclose{[}$."),
    q(false, "Le domaine de $f(x)=\\dfrac{3}{\\sqrt[3]{2x+7}}$ exclut toutes les valeurs telles que $2x+7\\le 0$.", "Faux : la racine cubique accepte un radicande négatif ; seule $x=-\\dfrac{7}{2}$ est exclue, le domaine est $\\mathbb{R}\\setminus\\left\\{-\\dfrac{7}{2}\\right\\}$."),
    q(true, "Pour $f(x)=\\sqrt{x+4}$, le domaine est $[-4\\,;+\\infty\\mathclose{[}$.", "$x+4\\ge 0$ équivaut à $x\\ge -4$."),
    q(false, "Pour $f(x)=\\sqrt{x+4}$, le domaine est $[4\\,;+\\infty\\mathclose{[}$.", "Faux : $x+4\\ge 0$ donne $x\\ge -4$ ; par exemple $\\sqrt{0+4}=2$ existe."),
    q(true, "Pour $f(x)=\\sqrt{-x}$, le domaine est $\\mathopen{]}{-\\infty}\\,;0]$.", "$-x\\ge 0$ équivaut à $x\\le 0$ ; par exemple $\\sqrt{-(-9)}=3$."),
    q(false, "La fonction $f(x)=\\sqrt{-x}$ n'est définie pour aucun réel, à cause du signe moins.", "Faux : pour $x\\le 0$, $-x$ est positif ou nul ; par exemple $f(-4)=\\sqrt{4}=2$."),
    q(true, "Pour $f(x)=\\sqrt[4]{x-1}$, il faut $x-1\\ge 0$.", "Une racine d'indice pair (ici $4$) impose un radicande positif ou nul."),
    q(false, "Pour $f(x)=\\sqrt[5]{x-1}$, il faut $x-1\\ge 0$.", "Faux : une racine d'indice impair est définie pour tout radicande ; le domaine est $\\mathbb{R}$."),
    q(true, "Pour $f(x)=\\sqrt{x}+\\sqrt{2-x}$, le domaine est $[0\\,;2]$.", "Il faut à la fois $x\\ge 0$ et $2-x\\ge 0$, soit $0\\le x\\le 2$."),
    q(false, "Pour $f(x)=\\sqrt{x}+\\sqrt{2-x}$, le domaine est $\\mathopen{]}{-\\infty}\\,;2]$.", "Faux : $\\sqrt{x}$ impose aussi $x\\ge 0$ ; les deux conditions se combinent par intersection, ce qui donne $[0\\,;2]$."),
    q(true, "Pour $f(x)=\\dfrac{\\sqrt{x}}{x-4}$, le domaine est $[0\\,;4\\mathclose{[}\\,\\cup\\,\\mathopen{]}4\\,;+\\infty\\mathclose{[}$.", "$x\\ge 0$ pour la racine, et $x\\neq 4$ pour le dénominateur."),
    q(false, "Pour $f(x)=\\dfrac{\\sqrt{x}}{x+4}$, il faut retirer $-4$ de $[0\\,;+\\infty\\mathclose{[}$, ce qui coupe le domaine en deux.", "Faux : $-4$ n'est pas dans $[0\\,;+\\infty\\mathclose{[}$, il n'y a rien à retirer ; le domaine est $[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Pour $f(x)=\\dfrac{1}{\\sqrt{x}}$, le domaine est $\\mathopen{]}0\\,;+\\infty\\mathclose{[}$.", "La racine est au dénominateur : il faut $x>0$."),
    q(false, "Pour $f(x)=\\sqrt{x^2}$, le domaine est $[0\\,;+\\infty\\mathclose{[}$.", "Faux : $x^2\\ge 0$ pour tout réel ; par exemple $\\sqrt{(-3)^2}=3$. Le domaine est $\\mathbb{R}$."),
    q(true, "Pour $f(x)=\\sqrt{1-x^2}$, le domaine est $[-1\\,;1]$.", "$1-x^2\\ge 0$ équivaut à $x^2\\le 1$, soit $-1\\le x\\le 1$."),
    q(false, "En résolvant $-x+5\\ge 0$, on obtient $x\\ge 5$.", "Faux : $-x\\ge -5$ donne $x\\le 5$ (on multiplie par $-1$ : le sens change) ; en $x=6$, $-6+5<0$."),
    q(true, "Pour $f(x)=\\dfrac{x}{\\sqrt{x^2+1}}$, le domaine est $\\mathbb{R}$.", "$x^2+1\\ge 1>0$ : la racine existe et ne vaut jamais $0$."),
  ],

  // ==========================================================================
  // Décomposer une fonction composée
  // ==========================================================================
  decomposition: [
    q(true, "Pour $h(x)=\\sqrt{3x-5}$, on peut poser $g(x)=3x-5$ (intérieure) puis $f(x)=\\sqrt{x}$ (extérieure).", "On calcule d'abord $3x-5$, puis on en prend la racine carrée."),
    q(false, "Pour $h(x)=\\sqrt{3x-5}$, l'opération appliquée en dernier est l'affine $3x-5$.", "Faux : l'affine est calculée en premier (intérieure) ; la racine carrée est appliquée en dernier."),
    q(true, "Décomposer $h(x)=(2x+1)^2$ revient à poser $g(x)=2x+1$ (intérieure) puis $f(x)=x^2$ (extérieure).", "On calcule d'abord $2x+1$, puis on élève au carré."),
    q(false, "Pour $h(x)=(2x+1)^2$, la fonction carré est la fonction intérieure.", "Faux : on calcule d'abord $2x+1$ ; le carré est appliqué en dernier."),
    q(true, "Pour $h(x)=\\dfrac{1}{x+3}$, on peut poser $g(x)=x+3$ (intérieure) puis $f(x)=\\dfrac{1}{x}$ (extérieure).", "On calcule d'abord $x+3$, puis on en prend l'inverse."),
    q(true, "Pour $h(x)=\\sqrt[3]{5-x^2}$, on identifie $g(x)=5-x^2$ (intérieure) et $f(x)=\\sqrt[3]{x}$ (extérieure).", "On calcule d'abord $5-x^2$, puis sa racine cubique."),
    q(true, "Dans l'écriture $h(x)=f(g(x))$, c'est $g$ qui est appliquée en premier.", "$g$ agit d'abord sur $x$, puis $f$ agit sur le résultat."),
    q(false, "Pour $h(x)=\\sqrt{x^2+1}$, on peut poser $g(x)=\\sqrt{x}$ (intérieure) et $f(x)=x^2+1$ (extérieure).", "Faux : on calcule d'abord $x^2+1$ (intérieure), puis la racine carrée (extérieure)."),
    q(true, "Pour $h(x)=(x-4)^3$, la fonction extérieure est $x\\mapsto x^3$ et l'intérieure est $x\\mapsto x-4$.", "On calcule d'abord $x-4$, puis on élève au cube."),
    q(false, "Pour $h(x)=(x-4)^3$, le cube est appliqué avant l'affine $x-4$.", "Faux : on calcule d'abord $x-4$ ; le cube vient en dernier."),
    q(true, "Pour $h(x)=|2x-7|$, on peut poser $g(x)=2x-7$ (intérieure) et $f(x)=|x|$ (extérieure).", "On calcule d'abord $2x-7$, puis sa valeur absolue."),
    q(true, "Pour $h(x)=\\dfrac{1}{\\sqrt{x+1}}$, on applique dans l'ordre : l'affine $x+1$, la racine carrée, puis l'inverse.", "Pour $x=3$ : $x+1=4$, puis $\\sqrt{4}=2$, puis $\\dfrac{1}{2}$."),
    q(false, "Pour $h(x)=\\dfrac{1}{\\sqrt{x+1}}$, on applique d'abord l'inverse, puis la racine carrée, puis l'affine.", "Faux : c'est l'ordre inverse — l'affine d'abord, l'inverse en dernier."),
    q(false, "$h(x)=\\sqrt{2x+3}$ et $k(x)=2\\sqrt{x}+3$ sont deux écritures de la même fonction.", "Faux : dans $h$, l'affine vient avant la racine ; dans $k$, la racine vient d'abord. En $x=1$ : $h(1)=\\sqrt{5}$, $k(1)=5$."),
    q(false, "Pour $h(x)=\\dfrac{1}{x^2}+3$, la fonction extérieure est $x\\mapsto\\dfrac{1}{x}$.", "Faux : la dernière opération est l'ajout de $3$ ; la fonction extérieure est $x\\mapsto x+3$."),
    q(false, "$h(x)=\\left(\\sqrt{x}\\right)^2$ et $k(x)=x$ ont le même domaine de définition.", "Faux : la racine intérieure de $h$ impose $x\\ge 0$, alors que $k$ est définie sur $\\mathbb{R}$."),
    q(true, "Pour $h(x)=\\sqrt{x}+5$, on prend d'abord la racine carrée de $x$, puis on ajoute $5$.", "L'ajout de $5$ est l'opération la plus extérieure."),
    q(false, "$h(x)=\\sqrt{x+5}$ et $k(x)=\\sqrt{x}+5$ se décomposent dans le même ordre.", "Faux : dans $h$, on ajoute $5$ avant la racine ; dans $k$, c'est l'inverse."),
    q(true, "Pour $h(x)=\\sqrt[3]{x}+1$ et $k(x)=\\sqrt[3]{x+1}$, la fonction extérieure n'est pas la même.", "Pour $h$, la dernière opération est l'ajout de $1$ ; pour $k$, c'est la racine cubique."),
    q(false, "Une fonction composée se décompose toujours d'une seule façon.", "Faux : on peut regrouper ou séparer certaines étapes ; seul l'ordre des opérations est imposé, pas le découpage exact."),
    q(true, "Pour $h(x)=\\dfrac{1}{x^2+1}$, on peut poser $g(x)=x^2+1$ (intérieure) et $f(x)=\\dfrac{1}{x}$ (extérieure).", "On calcule d'abord $x^2+1$, puis on en prend l'inverse."),
    q(false, "Pour $h(x)=\\dfrac{1}{x^2+1}$, la fonction extérieure est $x\\mapsto x^2+1$.", "Faux : l'inverse est appliqué en dernier ; $x\\mapsto x^2+1$ est la fonction intérieure."),
    q(true, "$h(x)=5-\\sqrt[3]{|x|}$ se décompose en trois étages : la valeur absolue, puis la racine cubique, puis $t\\mapsto 5-t$.", "Pour $x=-8$ : $|-8|=8$, puis $\\sqrt[3]{8}=2$, puis $5-2=3$."),
    q(false, "Pour $h(x)=5-\\sqrt[3]{|x|}$, la première opération effectuée est « $5-$ ».", "Faux : « $5-$ » est la dernière opération ; on commence par la valeur absolue."),
    q(true, "Pour $h(x)=\\sqrt{|3x-5|+2}$, la dernière opération effectuée est la racine carrée.", "La racine porte sur tout le reste de l'expression."),
    q(false, "Pour $h(x)=\\sqrt{|3x-5|+2}$, l'étage qui suit la valeur absolue est la racine carrée.", "Faux : après la valeur absolue, on ajoute $2$ ; la racine vient ensuite."),
    q(true, "Pour $h(x)=(x^2-3)^4$, on peut poser $g(x)=x^2-3$ (intérieure) et $f(x)=x^4$ (extérieure).", "On calcule d'abord $x^2-3$, puis on l'élève à la puissance $4$."),
    q(false, "Pour $h(x)=3(x+1)^2$, la dernière opération effectuée est l'élévation au carré.", "Faux : on élève $x+1$ au carré, puis on multiplie par $3$ ; la multiplication vient en dernier."),
    q(true, "Pour $h(x)=3(x+1)^2$, on applique dans l'ordre : $x+1$, le carré, puis la multiplication par $3$.", "Pour $x=1$ : $1+1=2$, puis $2^2=4$, puis $3\\times 4=12$."),
    q(false, "Pour $h(x)=|x|-4$, on applique d'abord $x-4$, puis la valeur absolue.", "Faux : la valeur absolue porte sur $x$ seul ; on retire $4$ ensuite. Appliquer $x-4$ d'abord donnerait $|x-4|$."),
    q(true, "Si $g(x)=2x-1$ et $f(x)=\\sqrt{x}$, alors $(f\\circ g)(x)=\\sqrt{2x-1}$.", "$g$ agit d'abord, puis $f$ prend la racine du résultat."),
    q(false, "Si $g(x)=2x-1$ et $f(x)=\\sqrt{x}$, alors $(g\\circ f)(x)=\\sqrt{2x-1}$.", "Faux : $(g\\circ f)(x)=g(\\sqrt{x})=2\\sqrt{x}-1$."),
    q(true, "Pour vérifier une décomposition, on recompose les étages : on doit retrouver exactement l'expression de départ.", "Un étage oublié ou tronqué se voit alors immédiatement."),
    q(false, "Pour $h(x)=\\dfrac{2}{x-3}$, la fonction intérieure est $x\\mapsto\\dfrac{2}{x}$.", "Faux : on calcule d'abord $x-3$ (intérieure), puis $t\\mapsto\\dfrac{2}{t}$ (extérieure)."),
    q(true, "Dans $h=f\\circ u\\circ g$, la fonction $g$ est appliquée en premier et $f$ en dernier.", "On lit de droite à gauche : $h(x)=f(u(g(x)))$."),
  ],

  // ==========================================================================
  // Composer f et g — expressions et domaines
  // ==========================================================================
  composition: [
    q(true, "La notation $(f\\circ g)(x)$ signifie $f(g(x))$ : on calcule d'abord $g(x)$, puis on applique $f$.", "C'est la définition de la composée $f\\circ g$."),
    q(false, "La notation $(f\\circ g)(x)$ signifie $g(f(x))$.", "Faux : $(f\\circ g)(x)=f(g(x))$ ; c'est $g$ qui agit en premier."),
    q(true, "Avec $f(x)=x^2$ et $g(x)=x+1$, on a $(f\\circ g)(x)=(x+1)^2$.", "$f(g(x))=f(x+1)=(x+1)^2$."),
    q(false, "Avec $f(x)=x^2$ et $g(x)=x+1$, on a $(g\\circ f)(x)=(x+1)^2$.", "Faux : $(g\\circ f)(x)=g(x^2)=x^2+1$ ; en $x=1$, on trouve $2$ et non $4$."),
    q(true, "En général, $f\\circ g$ et $g\\circ f$ sont deux fonctions différentes.", "Changer l'ordre change l'opération faite en premier, donc en général le résultat."),
    q(true, "Avec $f(x)=2x+3$ et $g(x)=x-1$, on a $(f\\circ g)(x)=2x+1$.", "$f(x-1)=2(x-1)+3=2x+1$."),
    q(false, "Avec $f(x)=2x+3$ et $g(x)=x-1$, on a $(g\\circ f)(x)=2x+1$.", "Faux : $(g\\circ f)(x)=(2x+3)-1=2x+2$."),
    q(false, "Pour obtenir le domaine de $f\\circ g$, il suffit de prendre le domaine de $g$.", "Faux : il faut aussi que $g(x)$ appartienne au domaine de $f$ ; les deux conditions se combinent."),
    q(true, "$x$ appartient au domaine de $f\\circ g$ si $x\\in\\mathrm{dom}\\,g$ et $g(x)\\in\\mathrm{dom}\\,f$.", "$x$ doit permettre de calculer $g(x)$, puis $g(x)$ doit être une entrée valide pour $f$."),
    q(false, "Avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, le domaine de $f\\circ g$ est $\\mathbb{R}$, car $\\mathrm{dom}\\,g=\\mathbb{R}$.", "Faux : il faut aussi $x-4\\ge 0$ ; le domaine est $[4\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, le domaine de $f\\circ g$ est $[4\\,;+\\infty\\mathclose{[}$.", "La racine impose $x-4\\ge 0$, soit $x\\ge 4$."),
    q(true, "Avec $f(x)=\\dfrac{1}{x}$ et $g(x)=x-2$, le domaine de $f\\circ g$ est $\\mathbb{R}\\setminus\\{2\\}$.", "$(f\\circ g)(x)=\\dfrac{1}{x-2}$, défini sauf en $x=2$."),
    q(false, "Avec $g(x)=\\dfrac{1}{x}$ et $f(x)=x+3$, le domaine de $f\\circ g$ est $\\mathbb{R}$, car $f$ n'exclut aucune valeur.", "Faux : il faut d'abord $x\\in\\mathrm{dom}\\,g$, donc $x\\neq 0$ ; le domaine est $\\mathbb{R}\\setminus\\{0\\}$."),
    q(false, "Avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, on a $(f\\circ g)(2)=\\sqrt{2}-4$.", "Faux : $g(2)=-2$, qui n'appartient pas au domaine de $f$ ; $(f\\circ g)(2)$ n'existe pas."),
    q(false, "Avec $f(x)=\\dfrac{1}{x}$ et $g(x)=x+2$, on a $(g\\circ f)(x)=\\dfrac{1}{x+2}$.", "Faux : $(g\\circ f)(x)=g\\left(\\dfrac{1}{x}\\right)=\\dfrac{1}{x}+2$ ; c'est $(f\\circ g)(x)$ qui vaut $\\dfrac{1}{x+2}$."),
    q(true, "Le domaine de $f\\circ g$ peut être différent de celui de $g\\circ f$, avec les mêmes fonctions $f$ et $g$.", "Avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$ : $\\mathrm{dom}(f\\circ g)=[4\\,;+\\infty\\mathclose{[}$ et $\\mathrm{dom}(g\\circ f)=[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $f(x)=x^2$ et $g(x)=x-3$, on a $(f\\circ g)(2)=1$.", "$g(2)=-1$, puis $f(-1)=1$."),
    q(false, "Avec $f(x)=x^2$ et $g(x)=x-3$, l'égalité $(f\\circ g)(2)=(g\\circ f)(2)=1$ prouve que $f\\circ g=g\\circ f$.", "Faux : une égalité en un seul point ne prouve rien ; en $x=0$, $(f\\circ g)(0)=9$ et $(g\\circ f)(0)=-3$."),
    q(true, "Avec $f(x)=x^2$, on a $(f\\circ f)(x)=x^4$.", "$f(x^2)=(x^2)^2=x^4$."),
    q(false, "Avec $f(x)=x^2-1$, on a $(f\\circ f)(0)=-1$.", "Faux : $f(0)=-1$, puis $f(-1)=(-1)^2-1=0$ ; donc $(f\\circ f)(0)=0$."),
    q(true, "La composée de deux fonctions affines est une fonction affine.", "$m(m'x+p')+p=(mm')\\,x+(mp'+p)$ : c'est encore de la forme $Mx+P$."),
    q(false, "Avec $f(x)=3x+1$ et $g(x)=2x-5$, la pente de $f\\circ g$ vaut $3+2=5$.", "Faux : la pente d'une composée de deux affines est le produit des pentes, $3\\times 2=6$."),
    q(true, "Avec $f(x)=3x+1$ et $g(x)=2x-5$, la pente de $f\\circ g$ vaut $6$.", "$f(g(x))=3(2x-5)+1=6x-14$ : la pente est le produit $3\\times 2$."),
    q(true, "Avec $f(x)=x+2$ et $g(x)=x-7$, on a $f\\circ g=g\\circ f$.", "$(f\\circ g)(x)=x-5$ et $(g\\circ f)(x)=x-5$ : deux translations peuvent s'échanger."),
    q(false, "Si $f\\circ g=g\\circ f$ pour deux fonctions particulières, alors l'ordre d'une composition n'a jamais d'importance.", "Faux : avec $f(x)=x+1$ et $g(x)=x^2$, $(f\\circ g)(2)=5$ alors que $(g\\circ f)(2)=9$."),
    q(true, "Avec $f(x)=x^2+1$ et $g(x)=2x-3$, on a $(f\\circ g)(1)=2$.", "$g(1)=-1$, puis $f(-1)=1+1=2$."),
    q(false, "Avec $f(x)=x^2+1$ et $g(x)=2x-3$, on a $(g\\circ f)(1)=2$.", "Faux : $f(1)=2$, puis $g(2)=1$ ; donc $(g\\circ f)(1)=1$."),
    q(true, "Avec $f(x)=\\dfrac{1}{x}$, on a $(f\\circ f)(x)=x$ pour tout $x\\neq 0$.", "L'inverse de $\\dfrac{1}{x}$ est $x$."),
    q(false, "Avec $f(x)=\\dfrac{1}{x}$, le domaine de $f\\circ f$ est $\\mathbb{R}$, puisque $(f\\circ f)(x)=x$.", "Faux : il faut d'abord $x\\neq 0$ pour calculer $f(x)$ ; le domaine est $\\mathbb{R}\\setminus\\{0\\}$."),
    q(true, "Avec $f(x)=2x$ et $g(x)=x+3$, on a $(f\\circ g)(x)=2x+6$.", "$f(x+3)=2(x+3)=2x+6$."),
    q(false, "Avec $f(x)=2x$ et $g(x)=x+3$, on a $(f\\circ g)(x)=2x+3$.", "Faux : $2x+3$ est $(g\\circ f)(x)$ ; $(f\\circ g)(x)=2(x+3)=2x+6$."),
    q(true, "Avec $f(x)=x^3$ et $g(x)=x-1$, on a $(f\\circ g)(x)=(x-1)^3$.", "On remplace la variable de $f$ par $x-1$ tout entier."),
    q(false, "Avec $f(x)=x^3$ et $g(x)=x-1$, on a $(f\\circ g)(x)=x^3-1$.", "Faux : $x^3-1$ est $(g\\circ f)(x)$ ; en $x=2$, $(f\\circ g)(2)=1^3=1$ alors que $2^3-1=7$."),
    q(true, "Avec $f(x)=|x|$ et $g(x)=x-5$, on a $(f\\circ g)(2)=3$.", "$g(2)=-3$, puis $|-3|=3$."),
    q(false, "Avec $f(x)=|x|$ et $g(x)=x-5$, on a $(g\\circ f)(2)=3$.", "Faux : $f(2)=2$, puis $g(2)=-3$ ; donc $(g\\circ f)(2)=-3$."),
  ],

  // ==========================================================================
  // Domaine d'une composée — double condition et image
  // ==========================================================================
  domaineComposee: [
    q(true, "Pour $f\\circ g$, la première condition est $x\\in\\mathrm{dom}\\,g$.", "Sans elle, $g(x)$ n'existe même pas."),
    q(false, "Pour $f\\circ g$, la première condition est $x\\in\\mathrm{dom}\\,f$.", "Faux : c'est $g$ qui reçoit $x$ ; la première condition est $x\\in\\mathrm{dom}\\,g$, la seconde $g(x)\\in\\mathrm{dom}\\,f$."),
    q(true, "La deuxième condition pour $f\\circ g$ s'écrit $g(x)\\in\\mathrm{dom}\\,f$.", "La valeur $g(x)$ doit pouvoir être reçue par $f$."),
    q(false, "Pour obtenir $\\mathrm{dom}(f\\circ g)$, on réunit les $x$ qui vérifient la première condition et ceux qui vérifient la deuxième.", "Faux : les deux conditions doivent être vraies à la fois ; on prend leur intersection."),
    q(true, "Le domaine d'une composée peut être vide.", "C'est le cas quand l'image de la fonction intérieure ne rencontre jamais le domaine de l'extérieure."),
    q(false, "Si $f$ et $g$ ont chacune un domaine non vide, alors $f\\circ g$ aussi.", "Faux : avec $f(x)=\\sqrt{x-10}$ et $g(x)=-x^2$, $\\mathrm{dom}(f\\circ g)=\\varnothing$."),
    q(true, "Avec $f(x)=\\sqrt{x-10}$ et $g(x)=-x^2$, le domaine de $f\\circ g$ est $\\varnothing$.", "$-x^2\\le 0$ n'atteint jamais $[10\\,;+\\infty\\mathclose{[}$."),
    q(false, "Avec $f(x)=\\sqrt{x-10}$ et $g(x)=-x^2$, le domaine de $f\\circ g$ est $[10\\,;+\\infty\\mathclose{[}$.", "Faux : en $x=10$, $g(10)=-100$, hors de $\\mathrm{dom}\\,f$ ; aucun $x$ ne convient, le domaine est $\\varnothing$."),
    q(true, "Si l'image de $g$ ne rencontre jamais $\\mathrm{dom}\\,f$, alors $\\mathrm{dom}(f\\circ g)=\\varnothing$.", "Aucune valeur $g(x)$ ne peut entrer dans $f$."),
    q(false, "Le domaine de $f\\circ g$ se lit sur la formule simplifiée de $f(g(x))$.", "Faux : une simplification peut effacer une condition ; le domaine se lit sur les deux conditions."),
    q(true, "Avec $f(x)=\\dfrac{3}{x}$ et $g(x)=\\dfrac{7}{4x+6}$, la formule simplifiée $\\dfrac{12x+18}{7}$ se calcule en $x=-\\dfrac{3}{2}$, mais $-\\dfrac{3}{2}\\notin\\mathrm{dom}(f\\circ g)$.", "$g\\left(-\\dfrac{3}{2}\\right)$ n'existe pas : le dénominateur $4x+6$ s'y annule."),
    q(false, "Avec $f(t)=t^2$ et $g(x)=\\sqrt{x}$, on a $\\mathrm{dom}(f\\circ g)=\\mathbb{R}$, puisque $f(g(x))=x$.", "Faux : $g(x)=\\sqrt{x}$ impose $x\\ge 0$ ; $\\mathrm{dom}(f\\circ g)=[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $f(x)=\\dfrac{1}{x}$ et $g(x)=x^2+1$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "$g(x)\\ge 1$ ne vaut jamais $0$."),
    q(false, "Avec $f(x)=\\dfrac{1}{x}$ et $g(x)=x^2-1$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "Faux : $g(1)=0$ et $g(-1)=0$, où $f$ n'est pas définie ; le domaine est $\\mathbb{R}\\setminus\\{-1\\,;1\\}$."),
    q(true, "Avec $f(x)=\\sqrt{x}$ et $g(x)=x^2$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "$g(x)=x^2\\ge 0$ appartient toujours au domaine de la racine."),
    q(false, "Avec $f(x)=x^2$ et $g(x)=\\sqrt{x}$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "Faux : $g(x)=\\sqrt{x}$ impose déjà $x\\ge 0$ ; le domaine est $[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "L'image de $g(x)=x^2+3$ est $[3\\,;+\\infty\\mathclose{[}$.", "$x^2\\ge 0$, donc $g(x)\\ge 3$, avec $g(0)=3$ ; toutes les valeurs au-dessus sont atteintes."),
    q(false, "Avec $f(x)=\\sqrt{x-5}$ et $g(x)=x^2+3$, le domaine de $f\\circ g$ est $\\mathbb{R}$, car $g(x)\\ge 3$.", "Faux : il faut $g(x)\\ge 5$, pas seulement $g(x)\\ge 3$ ; par exemple $g(0)=3$ n'appartient pas à $[5\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $f(x)=\\sqrt{x-2}$ et $g(x)=x^2+3$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "$g(x)\\ge 3\\ge 2$ : la valeur $g(x)$ est toujours dans $[2\\,;+\\infty\\mathclose{[}$."),
    q(false, "Avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, on a $\\mathrm{dom}(g\\circ f)=[4\\,;+\\infty\\mathclose{[}$.", "Faux : $(g\\circ f)(x)=\\sqrt{x}-4$ n'exige que $x\\ge 0$ ; $\\mathrm{dom}(g\\circ f)=[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $f(x)=\\sqrt{-3x+6}$ et $g(x)=\\sqrt{-2x+4}$, le réel $1$ appartient à $\\mathrm{dom}(g\\circ f)$.", "$f(1)=\\sqrt{3}$, et $\\sqrt{3}\\le 2$ appartient à $\\mathrm{dom}\\,g=\\mathopen{]}{-\\infty}\\,;2]$."),
    q(false, "Avec $f(x)=\\sqrt{-3x+6}$ et $g(x)=\\sqrt{-2x+4}$, le réel $0$ appartient à $\\mathrm{dom}(g\\circ f)$.", "Faux : $f(0)=\\sqrt{6}>2$, hors de $\\mathrm{dom}\\,g=\\mathopen{]}{-\\infty}\\,;2]$."),
    q(true, "Si $\\mathrm{dom}\\,f=\\mathbb{R}$, alors $\\mathrm{dom}(f\\circ g)=\\mathrm{dom}\\,g$.", "La deuxième condition est toujours vraie : toute valeur $g(x)$ est acceptée par $f$."),
    q(false, "Si $\\mathrm{dom}\\,g=\\mathbb{R}$, alors $\\mathrm{dom}(f\\circ g)=\\mathrm{dom}\\,f$.", "Faux : avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, $\\mathrm{dom}(f\\circ g)=[4\\,;+\\infty\\mathclose{[}$, alors que $\\mathrm{dom}\\,f=[0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Le domaine de $f\\circ g$ est toujours inclus dans le domaine de $g$.", "La première condition exige $x\\in\\mathrm{dom}\\,g$."),
    q(false, "Le domaine de $f\\circ g$ est toujours inclus dans le domaine de $f$.", "Faux : avec $f(x)=\\sqrt{x}$ et $g(x)=-x$, on a $(f\\circ g)(-1)=\\sqrt{1}=1$, alors que $-1\\notin\\mathrm{dom}\\,f$."),
    q(true, "Avec $f(x)=\\dfrac{1}{x-2}$ et $g(x)=x+3$, il faut exclure $x=-1$ de $\\mathrm{dom}(f\\circ g)$.", "$g(-1)=2$, la valeur interdite de $f$."),
    q(false, "Avec $f(x)=\\dfrac{1}{x-2}$ et $g(x)=x+3$, il faut exclure $x=2$ de $\\mathrm{dom}(f\\circ g)$.", "Faux : $g(2)=5$ est accepté par $f$ ; la valeur à exclure est celle qui donne $g(x)=2$, soit $x=-1$."),
    q(true, "Avec $f(x)=\\sqrt{x}$ et $g(x)=-x^2-1$, le domaine de $f\\circ g$ est vide.", "$g(x)\\le -1<0$ pour tout $x$ : la racine ne peut jamais recevoir $g(x)$."),
    q(false, "Avec $f(x)=\\sqrt{x}$ et $g(x)=-x^2$, le domaine de $f\\circ g$ est vide.", "Faux : $g(0)=0$ et $\\sqrt{0}=0$ existe ; le domaine est $\\{0\\}$."),
    q(true, "Avec $f(x)=\\sqrt{x}$ et $g(x)=-x^2$, le domaine de $f\\circ g$ est $\\{0\\}$.", "$-x^2\\ge 0$ seulement pour $x=0$."),
    q(false, "Un domaine de composée réduit à un seul réel est forcément le signe d'une erreur de calcul.", "Faux : avec $f(x)=\\sqrt{x}$ et $g(x)=-x^2$, le domaine de $f\\circ g$ est bien $\\{0\\}$."),
    q(true, "Avec $f(x)=\\sqrt[3]{x}$, le domaine de $f\\circ g$ est égal au domaine de $g$.", "Une racine cubique accepte toute valeur $g(x)$ : seule la première condition compte."),
    q(false, "Avec $f(x)=\\sqrt{x}$ et $g(x)=\\sqrt[3]{x}$, le domaine de $f\\circ g$ est $\\mathbb{R}$.", "Faux : il faut $\\sqrt[3]{x}\\ge 0$, soit $x\\ge 0$ ; par exemple $g(-8)=-2$ n'a pas de racine carrée."),
    q(false, "Si $(f\\circ g)(a)$ n'existe pas, alors $a\\notin\\mathrm{dom}\\,g$.", "Faux : $g(a)$ peut exister mais tomber hors du domaine de $f$ ; avec $f(x)=\\sqrt{x}$ et $g(x)=x-4$, $g(2)=-2$ existe, mais $(f\\circ g)(2)$ n'existe pas."),
  ],

  // ==========================================================================
  // Lecture graphique de fonctions composées
  // ==========================================================================
  lectureGraphique: [
    q(true, "Pour lire $f(g(a))$, on lit d'abord $g(a)$ sur la courbe de $g$, puis l'image de ce nombre sur la courbe de $f$.", "C'est l'ordre imposé par $f(g(a))$ : $g$ agit en premier."),
    q(false, "Pour lire $g(f(a))$, la première courbe consultée est celle de $g$, car $g$ est écrite en premier.", "Faux : dans $g(f(a))$, c'est $f$ qui agit en premier ; on consulte d'abord la courbe de $f$."),
    q(true, "On lit $g(1)=3$ sur la courbe de $g$ et $f(3)=-2$ sur celle de $f$ : donc $(f\\circ g)(1)=-2$.", "$(f\\circ g)(1)=f(g(1))=f(3)=-2$."),
    q(false, "On lit $g(1)=3$ et $f(1)=5$ : donc $(f\\circ g)(1)=5$.", "Faux : $(f\\circ g)(1)=f(g(1))=f(3)$ ; la valeur $f(1)$ ne sert pas ici."),
    q(true, "On lit $f(2)=0$ et $g(0)=4$ : donc $(g\\circ f)(2)=4$.", "$(g\\circ f)(2)=g(f(2))=g(0)=4$."),
    q(false, "On lit $f(2)=0$ et $g(0)=4$ : donc $(f\\circ g)(2)=4$.", "Faux : ces lectures donnent $(g\\circ f)(2)$ ; pour $(f\\circ g)(2)=f(g(2))$, il faut d'abord lire $g(2)$."),
    q(true, "Si $g(a)$ n'appartient pas au domaine de $f$, alors $f(g(a))$ n'existe pas.", "La deuxième étape de la composition est impossible."),
    q(false, "Une valeur lue sur un graphique existe toujours : la lecture de $f(g(a))$ ne peut jamais aboutir à « n'existe pas ».", "Faux : si $g(a)$ tombe hors du domaine de $f$, $f(g(a))$ n'existe pas."),
    q(true, "Si $g(a)$ tombe hors de la portion tracée de la courbe de $f$, on ne peut pas lire $f(g(a))$ dans les limites du graphique donné.", "Le graphique ne montre pas de point d'abscisse $g(a)$ ; on ne peut conclure « n'existe pas » que si $g(a)$ est hors du domaine de $f$."),
    q(false, "Une fois $g(a)$ lu sur la courbe de $g$, ce nombre est déjà la valeur de $f(g(a))$.", "Faux : $g(a)$ n'est qu'une étape ; il faut encore lire son image sur la courbe de $f$."),
    q(true, "Si $g(a)$ tombe entre deux graduations, on estime sa valeur : cela ne rend pas $f(g(a))$ inexistant.", "Une lecture imprécise reste une lecture ; seule une valeur hors du domaine de $f$ rend la composée inexistante."),
    q(false, "Si $a$ n'appartient pas au domaine de $g$, on peut quand même lire $f(g(a))$ en partant directement de la courbe de $f$.", "Faux : sans $g(a)$, la première étape est impossible ; $f(g(a))$ n'existe pas."),
    q(true, "La valeur $g(a)$, lue en ordonnée sur la courbe de $g$, devient une abscisse sur la courbe de $f$.", "Le résultat de $g$ est l'entrée de $f$ : on le reporte sur l'axe des abscisses."),
    q(false, "La valeur $g(a)$ lue sur la courbe de $g$ se reporte sur l'axe des ordonnées de la courbe de $f$.", "Faux : $g(a)$ est l'entrée de $f$, donc une abscisse ; c'est $f(g(a))$ qui se lit en ordonnée."),
    q(true, "Lus sur les mêmes courbes, $(f\\circ g)(a)$ et $(g\\circ f)(a)$ peuvent donner deux résultats différents.", "L'ordre de lecture est inversé ; rien ne garantit le même résultat."),
    q(false, "Si $f(g(a))$ existe, alors $g(f(a))$ existe aussi.", "Faux : avec $f(x)=\\sqrt{x}$, $g(x)=x+4$ et $a=-3$, $f(g(-3))=f(1)=1$ existe, mais $f(-3)$ n'existe pas, donc $g(f(-3))$ non plus."),
    q(true, "On lit $g(-1)=2$ et $f(2)=2$ : donc $(f\\circ g)(-1)=2$.", "$(f\\circ g)(-1)=f(g(-1))=f(2)=2$."),
    q(false, "Si $g(a)=b$ et $f(b)=c$, alors $(g\\circ f)(a)=c$.", "Faux : ces deux lectures donnent $(f\\circ g)(a)=f(g(a))=f(b)=c$."),
    q(true, "Pour lire $(f\\circ f)(a)$, on lit $f(a)$, puis on lit sur la même courbe l'image de ce résultat.", "$(f\\circ f)(a)=f(f(a))$ : deux lectures successives sur la courbe de $f$."),
    q(false, "Pour que $(f\\circ g)(a)$ existe, il suffit que $a$ appartienne au domaine de $f$.", "Faux : il faut $a\\in\\mathrm{dom}\\,g$ et $g(a)\\in\\mathrm{dom}\\,f$."),
    q(true, "Pour lire $(g\\circ f)(a)$, on reporte $f(a)$ sur l'axe des abscisses du graphe de $g$.", "$f(a)$ est l'entrée de $g$ : c'est une abscisse pour la courbe de $g$."),
    q(true, "Si les courbes de $f$ et de $g$ sont dans le même repère, la droite $y=x$ permet de reporter $f(a)$ de l'axe des ordonnées vers l'axe des abscisses.", "Le point de la droite $y=x$ d'ordonnée $f(a)$ a aussi $f(a)$ pour abscisse."),
    q(false, "Pour reporter $f(a)$ avec la droite $y=x$, on part du point $(a\\,;f(a))$ et on trace une verticale jusqu'à la droite $y=x$.", "Faux : on trace une horizontale (l'ordonnée $f(a)$ ne change pas) jusqu'au point $(f(a)\\,;f(a))$, puis une verticale jusqu'à la courbe de $g$."),
    q(true, "On lit $f(-2)=1$ et $g(1)=-3$ : donc $(g\\circ f)(-2)=-3$.", "$(g\\circ f)(-2)=g(f(-2))=g(1)=-3$."),
    q(false, "On lit $f(-2)=1$ et $g(1)=-3$ : donc $(f\\circ g)(-2)=-3$.", "Faux : ces lectures donnent $(g\\circ f)(-2)$ ; pour $(f\\circ g)(-2)$, il faut d'abord lire $g(-2)$."),
    q(true, "Si le graphe complet de $g$ s'arrête en $x=4$ et que $f(a)=6$, alors $(g\\circ f)(a)$ n'existe pas.", "Le graphe étant complet, $6$ n'appartient pas au domaine de $g$."),
    q(false, "Si $f(a)=6$ tombe hors de la portion tracée du graphe de $g$, alors $(g\\circ f)(a)$ n'existe pas.", "Faux : $g$ peut être définie en $6$ sans que cette partie soit dessinée ; la valeur existe peut-être, mais n'est pas lisible sur ce graphique."),
    q(true, "Si $f(2)=4$ et que la courbe de $g$ passe par le point $(4\\,;1)$, alors $(g\\circ f)(2)=1$.", "$(g\\circ f)(2)=g(4)$, et le point $(4\\,;1)$ donne $g(4)=1$."),
    q(false, "Pour lire $(g\\circ f)(a)$, on lit d'abord $f(a)$ en abscisse sur la courbe de $f$.", "Faux : $a$ est l'abscisse de départ ; $f(a)$ se lit en ordonnée."),
    q(true, "Avec une seule courbe, $f(f(a))$ peut exister alors que $f(f(f(a)))$ n'existe pas.", "Par exemple si $f$ est définie sur $[0\\,;3]$ avec $f(0)=2$ et $f(2)=5$ : $f(f(0))=5$ existe, mais $f(5)$ n'existe pas."),
    q(false, "Si $a$ appartient au domaine de $f$, alors $(g\\circ f)(a)$ existe toujours.", "Faux : il faut encore que $f(a)$ appartienne au domaine de $g$."),
    q(true, "Si on lit $f(1)=3$ et $f(3)=0$, alors $(f\\circ f)(1)=0$.", "$(f\\circ f)(1)=f(f(1))=f(3)=0$."),
    q(false, "Si on lit $f(1)=3$ et $f(3)=0$, alors $(f\\circ f)(3)=0$.", "Faux : $(f\\circ f)(3)=f(f(3))=f(0)$, une valeur qu'il faudrait encore lire."),
    q(true, "Un point de la droite $y=x$ a la même abscisse et la même ordonnée.", "C'est la définition de cette droite : $y=x$."),
    q(false, "Pour lire $(g\\circ f)(a)$, les deux courbes doivent être tracées dans le même repère.", "Faux : on peut lire $f(a)$ sur un premier graphique, puis reporter cette valeur sur l'axe des abscisses d'un second."),
  ],

  // ==========================================================================
  // Problèmes en contexte
  // ==========================================================================
  problemesContexte: [
    q(true, "Le volume d'un cylindre de rayon $r$ et de hauteur $h$ vaut $V=\\pi r^2h$.", "C'est la formule du volume d'un cylindre."),
    q(true, "Dans $V=\\pi r^2h$, si l'on connaît $V$ et $r$, on isole $h$ : $h=\\dfrac{V}{\\pi r^2}$.", "On divise les deux membres par $\\pi r^2$."),
    q(false, "Dans $V=\\pi r^2h$, si l'on connaît $V$ et $h$, on isole $r$ : $r=\\dfrac{V}{\\pi h}$.", "Faux : on obtient $r^2=\\dfrac{V}{\\pi h}$, puis $r=\\sqrt{\\dfrac{V}{\\pi h}}$."),
    q(false, "Un cylindre de rayon $2$ et de hauteur $5$ a un volume $V=10\\pi$.", "Faux : $V=\\pi\\times 2^2\\times 5=20\\pi$ ; il ne faut pas oublier le carré du rayon."),
    q(true, "Un cylindre de volume $50\\pi$ et de hauteur $2$ a pour rayon $5$.", "$r^2=\\dfrac{50\\pi}{2\\pi}=25$, donc $r=5$."),
    q(false, "Le coût unitaire s'obtient en divisant la quantité produite par le coût total.", "Faux : c'est l'inverse, coût total divisé par la quantité."),
    q(true, "Si $50$ objets coûtent au total $400$ €, le coût unitaire est de $8$ € par objet.", "$400\\div 50=8$."),
    q(false, "Si le coût unitaire vaut $\\dfrac{C(x)}{x}$, doubler la quantité produite divise toujours le coût unitaire par $2$.", "Faux : seulement si le coût total est fixe ; avec $C(x)=10x$, le coût unitaire reste $10$ € quelle que soit la quantité."),
    q(true, "Si $10$ objets coûtent $300$ € et $30$ objets $500$ €, avec un coût total affine, le coût total augmente de $10$ € par objet supplémentaire.", "$\\dfrac{500-300}{30-10}=\\dfrac{200}{20}=10$."),
    q(false, "Si $10$ objets coûtent $300$ € et $30$ objets $500$ €, avec un coût total affine, le coût fixe vaut $300$ €.", "Faux : avec $C(x)=10x+b$ et $C(10)=300$, on trouve $b=200$ ; le coût fixe vaut $200$ €."),
    q(true, "Le coût total se décompose en un coût fixe et un coût variable, qui dépend de la quantité produite.", "C'est la structure d'une fonction de coût total."),
    q(true, "Le seuil de rentabilité est la quantité pour laquelle la recette égale le coût total.", "C'est la quantité où le bénéfice est nul : en dessous on perd de l'argent, au-dessus on en gagne."),
    q(false, "Le seuil de rentabilité est la quantité pour laquelle le bénéfice est maximal.", "Faux : au seuil de rentabilité, le bénéfice est nul, pas maximal."),
    q(true, "Si la recette vaut $25x$ et le coût total $15x+2\\,000$, le seuil de rentabilité est $x=200$.", "$25x=15x+2\\,000$ donne $10x=2\\,000$, soit $x=200$."),
    q(false, "Avec une recette $25x$ et un coût total $15x+2\\,000$, vendre $100$ unités rapporte un bénéfice positif.", "Faux : la recette vaut $2\\,500$ € et le coût $3\\,500$ € : c'est une perte de $1\\,000$ €."),
    q(true, "Si un énoncé donne certaines valeurs en euros et d'autres en milliers d'euros, il faut tout exprimer dans la même unité avant de calculer.", "Mélanger deux unités sans conversion fausse tous les résultats."),
    q(false, "Mélanger des euros et des milliers d'euros sans conversion ne pose pas de problème si la démarche est juste.", "Faux : les nombres obtenus sont faux, même avec une démarche correcte."),
    q(true, "Si le coût total est une fonction affine de la quantité, son coefficient directeur est le coût de chaque unité supplémentaire.", "Une pente constante : chaque unité de plus coûte exactement ce montant."),
    q(false, "Le point d'intersection des droites de recette et de coût total correspond au bénéfice maximal.", "Faux : en ce point, le bénéfice est nul (seuil de rentabilité)."),
    q(false, "Si l'énoncé donne le diamètre d'un cylindre, on l'utilise directement comme $r$ dans $V=\\pi r^2h$.", "Faux : le rayon vaut la moitié du diamètre ; il faut diviser par $2$ d'abord."),
    q(true, "Pour un bidon fermé de volume $V$ fixé, l'aire de métal est minimale quand la hauteur est égale au diamètre.", "C'est la démonstration du cours : l'aire est minimale en $r_0=\\sqrt[3]{\\dfrac{V}{2\\pi}}$, où $h=2r_0$."),
    q(false, "Pour un bidon fermé de volume $V$ fixé, l'aire de métal est minimale quand la hauteur est égale au rayon.", "Faux : au minimum, $h=2r$ ; la hauteur est égale au diamètre."),
    q(true, "L'aire totale d'un cylindre fermé de rayon $r$ et de hauteur $h$ vaut $2\\pi r^2+2\\pi rh$.", "Deux disques d'aire $\\pi r^2$ et une surface latérale d'aire $2\\pi rh$."),
    q(false, "L'aire totale d'un cylindre fermé de rayon $r$ et de hauteur $h$ vaut $\\pi r^2+2\\pi rh$.", "Faux : un cylindre fermé a deux disques, le fond et le couvercle : $2\\pi r^2+2\\pi rh$."),
    q(true, "Avec $q(b)=50+2b$ objets vendus et une recette $R(q)=12q$ (en euros), on a $(R\\circ q)(10)=840$.", "$q(10)=70$, puis $R(70)=12\\times 70=840$."),
    q(false, "Le coût unitaire $c(x)=\\dfrac{C(x)}{x}$ est la composée de $C$ et de $x\\mapsto x$.", "Faux : c'est un quotient — on divise la sortie $C(x)$ par l'entrée $x$, on n'enchaîne pas deux fonctions."),
    q(true, "Avec $c(x)=6+\\dfrac{200}{x}$, le coût total vaut $C(x)=6x+200$.", "$C(x)=x\\cdot c(x)=6x+200$."),
    q(false, "Avec $c(x)=6+\\dfrac{200}{x}$, le coût unitaire finit par descendre sous $6$ € si l'on produit assez.", "Faux : $\\dfrac{200}{x}>0$ pour $x>0$, donc $c(x)>6$ ; il s'approche de $6$ € sans jamais l'atteindre."),
    q(true, "Avec $c(x)=6+\\dfrac{200}{x}$, on a $c(100)=8$.", "$\\dfrac{200}{100}=2$, et $6+2=8$."),
    q(false, "Avec $h(r)=\\dfrac{1\\,000}{\\pi r^2}$, doubler le rayon divise la hauteur par $2$.", "Faux : $r^2$ est multiplié par $4$, donc la hauteur est divisée par $4$."),
    q(true, "Avec $h(r)=\\dfrac{1\\,000}{\\pi r^2}$, doubler le rayon divise la hauteur par $4$.", "$(2r)^2=4r^2$ : le dénominateur est multiplié par $4$."),
    q(false, "Dans le modèle $h(r)=\\dfrac{V}{\\pi r^2}$ d'un bidon, le domaine à retenir est $\\mathbb{R}\\setminus\\{0\\}$.", "Faux : un rayon est strictement positif ; le domaine du modèle est $\\mathopen{]}0\\,;+\\infty\\mathclose{[}$."),
    q(true, "Avec $c(x)=a+\\dfrac{b}{x}$, $c(10)=26$ et $c(40)=11$, soustraire les deux équations élimine $a$.", "$a+\\dfrac{b}{10}-\\left(a+\\dfrac{b}{40}\\right)=\\dfrac{b}{10}-\\dfrac{b}{40}$ : il ne reste que $b$."),
    q(false, "Avec un coût total $C(x)=0{,}1x^2+6x+160$ et un prix de vente de $16$ € par objet, le bénéfice vaut $B(x)=16x+0{,}1x^2+6x+160$.", "Faux : le bénéfice est la recette moins le coût total, $B(x)=16x-(0{,}1x^2+6x+160)$."),
    q(true, "Un bénéfice $B(x)=-0{,}1x^2+10x-160$ est positif entre ses deux racines.", "Le coefficient de $x^2$ est négatif : le trinôme est positif entre ses racines, négatif à l'extérieur."),
  ],
};
