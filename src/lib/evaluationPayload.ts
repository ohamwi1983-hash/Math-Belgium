import type { Block, ChapterSection } from '../content/types'

/**
 * Pont vers le « Générateur d'évaluations » de plateforme-maths — /admin construit un payload
 * compact (identifiants seulement pour les exercices générés et le vrai/faux, plateforme-maths
 * ayant déjà ces données ; texte complet pour les questions ouvertes, dérivées ici du contenu déjà
 * écrit dans ce dépôt) et ouvre cette URL. Portée actuelle : seul 6e (6h), Chapitre 1 — Fonctions
 * réciproques & cyclométriques, est réellement câblé côté plateforme-maths (les autres
 * niveaux/chapitres restent sélectionnables dans le formulaire mais désactivés « bientôt »,
 * l'armature niveau/heures/chapitre étant pensée pour être générique dès ce lot).
 */

export const EVALUATION_BASE_URL_6E_6H = 'https://plateforme-maths.vercel.app/6e-6h/evaluation'

/** Niveau + nombre d'heures ne se combinent pas librement : seules ces 3 combinaisons existent
 * réellement dans les deux dépôts à ce jour (voir `LEVELS` dans `chaptersIndex.ts`). `null` = pas
 * encore de chantier plateforme-maths pour cette combinaison. */
export type NiveauCode = '4e' | '5e' | '6e'

export const HEURES_PAR_NIVEAU: Record<NiveauCode, string[]> = {
  '4e': [],
  '5e': ['4H', '5H', '6H'],
  '6e': ['4H', '5H', '6H'],
}

const NIVEAU_HEURES_VERS_LEVELSLUG: Record<string, string> = {
  '4e|': '4e',
  '5e|4H': '5e-4h',
  '6e|6H': '6e-6h',
}

export function resoudreLevelSlug(niveau: NiveauCode, heures: string): string | null {
  return NIVEAU_HEURES_VERS_LEVELSLUG[`${niveau}|${heures}`] ?? null
}

/** Sert au bloc titre imprimé (« Classe : 4G..... », « 4ème » du pied de page) — jamais le
 * « nombre d'heures » du chantier plateforme-maths ci-dessus (notion indépendante, voir
 * `HEURES_SEMAINE_DEFAUT`). */
export const NIVEAU_NUMERO: Record<NiveauCode, number> = { '4e': 4, '5e': 5, '6e': 6 }

/** Volume horaire hebdomadaire par défaut affiché « Mathématiques {X}h/sem » — valeur observée sur
 * un modèle réel par niveau, modifiable dans le formulaire (une classe précise peut différer). Sans
 * rapport avec `HEURES_PAR_NIVEAU` ci-dessus : celui-ci détermine quel chantier plateforme-maths
 * (donc quels générateurs) est utilisé, celui-là n'est qu'un texte affiché sur la copie. */
export const HEURES_SEMAINE_DEFAUT: Record<NiveauCode, string> = { '4e': '5', '5e': '4', '6e': '6' }

/** Seul ce chapitre a un « générateur d'évaluations » fonctionnel côté plateforme-maths — les
 * autres apparaissent dans le sélecteur mais restent désactivés. */
export const LEVELSLUG_FONCTIONNEL = '6e-6h'
export const CHAPITRE_FONCTIONNEL_SLUG = 'fonctions-reciproques-cyclometriques'
export const EVALUATION_BASE_URL = EVALUATION_BASE_URL_6E_6H

export type IdGenerateurPilote = '6gen1' | '6gen2' | '6gen3' | '6gen4' | '6gen5'

export interface SectionEvaluationConfig {
  sectionId: string
  generatorId: IdGenerateurPilote
  quizTheme: string
}

/** Correspondance section Math-Belgium ↔ générateur plateforme-maths ↔ thème de la banque vrai/faux
 * — établie à la main pour ce chapitre pilote (alignement 1:1 confirmé dans le code source de
 * plateforme-maths, voir `src/generateurs6e/quizFonctionsReciproquesCyclometriques/banque.ts`).
 * Chaque futur chapitre ajouté demandera sa propre table, construite au cas par cas. */
export const SECTIONS_EVALUATION_PILOTE: SectionEvaluationConfig[] = [
  { sectionId: 'reciproques', generatorId: '6gen1', quizTheme: 'injectiviteSurjectiviteBijectivite' },
  { sectionId: 'cyclometriques', generatorId: '6gen2', quizTheme: 'fonctionsCyclometriques' },
  { sectionId: 'equations', generatorId: '6gen3', quizTheme: 'equationsCyclometriques' },
  { sectionId: 'derivees', generatorId: '6gen4', quizTheme: 'deriveesCyclometriques' },
  { sectionId: 'graphiques', generatorId: '6gen5', quizTheme: 'graphiquesCyclometriques' },
]

/** Fragment texte/latex — même forme que `FragmentConsigne` côté plateforme-maths
 * (`src/ui/formatEquationDroite.ts`), pour que les questions ouvertes envoyées dans le payload s'y
 * rendent en vrai KaTeX plutôt qu'en texte brut. */
export interface FragmentTexte {
  type: 'texte' | 'latex'
  valeur: string
}

export interface QuestionOuverte {
  enonce: FragmentTexte[]
  corrige: FragmentTexte[][]
}

/** Découpe la mini-syntaxe `RichText` (`$latex$`, `**gras**`, voir `.claude/rules/
 * content-authoring.md`) en fragments texte/latex distincts — chaque segment `$...$` devient un
 * fragment `latex` (rendu KaTeX côté plateforme-maths), au lieu de laisser les signes `$` et le code
 * LaTeX brut s'afficher littéralement sur la copie imprimée. Le gras n'a pas d'équivalent dans
 * `FragmentTexte` et est donc aplati (délimiteurs retirés, texte conservé). */
function parseRichText(texte: string): FragmentTexte[] {
  const sansGras = texte.replace(/\*\*(.*?)\*\*/g, '$1')
  const morceaux = sansGras.split(/\$([^$]+)\$/g)
  const fragments: FragmentTexte[] = []
  morceaux.forEach((valeur, i) => {
    if (valeur === '') return
    fragments.push({ type: i % 2 === 1 ? 'latex' : 'texte', valeur })
  })
  return fragments.length > 0 ? fragments : [{ type: 'texte', valeur: '' }]
}

function extraireParagraphes(blocks: Block[]): FragmentTexte[][] {
  return blocks.filter((b): b is Extract<Block, { kind: 'para' }> => b.kind === 'para').map((b) => parseRichText(b.text))
}

/**
 * Phrasé soigné des questions « formules/démonstrations » du chapitre pilote — un simple label de
 * bloc recopié tel quel (ex. « Exemple résolu — décomposition de f ») n'est pas une consigne, juste
 * un titre. Chaque section a ici un énoncé écrit à la main par position (0-indexée, dans l'ordre
 * des blocs `exemple`/`exempleLibre` de la section), à la forme impérative attendue d'un énoncé
 * d'évaluation (« Démontre que… », « Démontre la relation suivante : … », etc.). Chaque futur
 * chapitre ajouté demandera sa propre liste, construite au cas par cas — une section absente de
 * cette table (ou un index sans entrée) retombe sur le label brut, voir `deriveQuestionsOuvertes`.
 */
const ENONCES_DEMONSTRATION: Record<string, string[]> = {
  reciproques: [
    "Démontre que si $f$ est injective, sa relation réciproque est une fonction.",
    "Démontre que, pour $f$ injective, $(f^{-1})^{-1} = f$, et que $g = f^{-1} \\iff f = g^{-1}$.",
    "Détermine l'expression de $f^{-1}$ pour $f(x) = \\dfrac{5}{x-1}$, en décomposant $f$ en une chaîne d'opérations élémentaires puis en la défaisant dans l'ordre inverse.",
    "Retrouve $f^{-1}$ pour $f(x) = \\dfrac{5}{x-1}$ par la méthode de la permutation (échanger $x$ et $y$, puis isoler $y$).",
    "Explique pourquoi $f : \\mathbb{R} \\to \\mathbb{R} : x \\mapsto x^2$ n'a pas de relation réciproque fonctionnelle, et détermine la réciproque de sa restriction à $\\mathbb{R}^+$.",
    "Pour $f(x) = x^3$, calcule $(\\sqrt[3]{x})'$ à l'aide du théorème de la dérivée d'une réciproque.",
    "Pour $f(x) = \\dfrac{5}{x-1}$ et $f^{-1}(x) = 1 + \\dfrac{5}{x}$, calcule $(f^{-1})'(-5)$ de deux façons différentes, et vérifie que les deux méthodes concordent.",
  ],
  cyclometriques: [
    'Démontre que arcsin est une fonction impaire.',
    "Démontre la relation suivante : $\\arccos(x) + \\arccos(-x) = \\pi$.",
    'Démontre que arctan est une fonction impaire.',
  ],
  equations: [
    "Démontre la relation suivante : $\\arcsin(x) + \\arccos(x) = \\pi/2$.",
    "Résous l'équation $\\arcsin(2x-1) = \\arcsin(x)$, en posant la condition d'existence.",
    "Résous l'équation $\\arccos(x^2-1) = \\arccos(1-x)$, en vérifiant si les solutions trouvées respectent la condition d'existence.",
  ],
  derivees: [
    "Démontre que $\\arcsin'(x) = \\dfrac{1}{\\sqrt{1-x^2}}$.",
    "Démontre que $\\arccos'(x) = -\\dfrac{1}{\\sqrt{1-x^2}}$, en utilisant l'identité $\\arccos(x) = \\pi/2 - \\arcsin(x)$.",
    "Démontre, sans utiliser l'identité complémentaire, que $\\arccos'(x) = -\\dfrac{1}{\\sqrt{1-x^2}}$.",
    "Démontre que $\\arctan'(x) = \\dfrac{1}{1+x^2}$.",
    'Démontre que arcsin n\'est dérivable ni en $1$, ni en $-1$.',
    "Calcule la dérivée de $\\arcsin(2x-1)$.",
  ],
  graphiques: [],
}

/**
 * Dérive TOUTES les questions ouvertes « formules/démonstrations » exploitables d'une section — un
 * bloc `exemple`/`exempleLibre` de premier niveau = une question. Une section sans aucun de ces
 * blocs (aucune formule/démonstration) renvoie un tableau vide, conformément à la règle donnée :
 * pas de question de ce type là où il n'y a ni formule ni démonstration. Le corrigé reste dérivé
 * mécaniquement du contenu du bloc (fiable) ; l'énoncé préfère le phrasé soigné de
 * `ENONCES_DEMONSTRATION` quand il existe, sinon retombe sur le label brut du bloc.
 */
export function deriveQuestionsOuvertes(section: ChapterSection): QuestionOuverte[] {
  const candidats = section.blocks.filter(
    (b): b is Extract<Block, { kind: 'exemple' } | { kind: 'exempleLibre' }> => b.kind === 'exemple' || b.kind === 'exempleLibre',
  )
  const enoncesSoignes = ENONCES_DEMONSTRATION[section.id]

  return candidats.map((candidat, index) => {
    const enonceSoigneTexte = enoncesSoignes?.[index]

    if (candidat.kind === 'exemple') {
      const enonceBrut = [candidat.badge, candidat.formula].filter(Boolean).join(' — ')
      const enonceTexte = enonceSoigneTexte ?? (enonceBrut || "Résous l'exercice suivant.")
      const etapes = candidat.steps.map((s) => parseRichText(`${s.tag} : ${s.text}`))
      const resultat = candidat.result.text ? [parseRichText(`${candidat.result.tag} : ${candidat.result.text}`)] : []
      return { enonce: parseRichText(enonceTexte), corrige: [...etapes, ...resultat] }
    }

    const enonceTexte = enonceSoigneTexte ?? (candidat.label || 'Justifie le raisonnement suivant.')
    const corrigeParagraphes = extraireParagraphes(candidat.blocks)
    const corrige = corrigeParagraphes.length > 0 ? corrigeParagraphes : [parseRichText('Voir le cours.')]
    return { enonce: parseRichText(enonceTexte), corrige }
  })
}

/**
 * Banque de questions ouvertes de « compréhension » — distinctes des questions
 * formules/démonstrations ci-dessus (décision explicite de l'utilisateur : les deux catégories
 * coexistent, la compréhension s'ajoute plutôt que remplace). Entièrement écrites à la main, pas
 * dérivées d'un bloc de contenu : elles testent le POURQUOI et les liens entre notions d'un point
 * du chapitre, jamais la restitution d'une preuve ou d'un calcul déjà résolu dans le cours. Chaque
 * futur chapitre ajouté demandera sa propre liste (peut rester vide pour une section qui n'en a pas
 * encore).
 */
interface QuestionOuverteBrute {
  enonce: string
  corrige: string
}

const QUESTIONS_COMPREHENSION: Record<string, QuestionOuverteBrute[]> = {
  reciproques: [
    {
      enonce: "Pourquoi une fonction non injective ne peut-elle pas avoir de relation réciproque qui soit elle-même une fonction ?",
      corrige:
        "Un même x de Image(f) serait alors associé à plusieurs y distincts (tous ceux qui ont cette image par f) — ce qui contredit la définition d'une fonction, où chaque entrée n'a qu'une seule sortie. C'est exactement ce qui arrive pour f(x)=x² sur ℝ : x=1 a pour image 1, mais -1 aussi ; la relation réciproque associerait donc à la fois -1 et 1 à l'entrée 1.",
    },
    {
      enonce: 'Que représente géométriquement le graphe de f⁻¹ par rapport à celui de f, et pourquoi ?',
      corrige:
        "Le graphe de f⁻¹ est le symétrique du graphe de f par rapport à la droite y=x. Cela vient directement de la construction de la relation réciproque : chaque point (a;b) de f devient (b;a) sur f⁻¹ — abscisse et ordonnée échangées, exactement l'effet d'une symétrie par rapport à y=x.",
    },
    {
      enonce: "Pourquoi la restriction d'une fonction non injective à un intervalle plus petit peut-elle redevenir injective, et donc avoir une réciproque ?",
      corrige:
        "L'injectivité dépend du domaine considéré : réduire le domaine peut supprimer les paires de valeurs qui donnaient la même image. f(x)=x² n'est pas injective sur ℝ (1 et -1 ont la même image), mais sa restriction à ℝ⁺ l'est (deux réels positifs distincts ont toujours des carrés distincts) — c'est cette restriction qui a une réciproque, √x.",
    },
    {
      enonce: 'f⁻¹(x) et 1/f(x) désignent-ils la même chose ? Justifie.',
      corrige:
        "Non — ce sont deux objets sans aucun rapport, malgré la notation qui se ressemble. f⁻¹(x) est la valeur qui, par f, redonne x (la fonction réciproque) ; 1/f(x) est simplement l'inverse numérique de f(x). Pour f(x)=5/(x-1), f⁻¹(x)=1+5/x, alors que 1/f(x)=(x-1)/5 — deux expressions bien distinctes.",
    },
  ],
  cyclometriques: [
    {
      enonce: "Pourquoi sin, cos et tan n'ont-elles pas de réciproque sur ℝ tout entier ?",
      corrige:
        "Parce qu'elles sont périodiques : une infinité de valeurs de x donnent la même image (sin(0)=sin(π)=sin(2π)=0, par exemple). Elles ne sont donc jamais injectives sur ℝ tout entier, et sans injectivité, pas de relation réciproque qui soit une fonction.",
    },
    {
      enonce: "Sur quel critère choisit-on l'intervalle de restriction de sin, cos et tan pour construire arcsin, arccos et arctan ?",
      corrige:
        "Le plus court intervalle possible contenant 0 sur lequel la fonction redevient bijective — [−π/2;π/2] pour sin, [0;π] pour cos, ]−π/2;π/2[ pour tan. Un intervalle plus long recontiendrait plusieurs fois la même valeur (perte d'injectivité) ; mal centré, il ne contiendrait pas toute l'image.",
    },
    {
      enonce: 'Pourquoi peut-on dire que arcsin(1/2) est déjà connu depuis le cercle trigonométrique, sans calcul supplémentaire ?',
      corrige:
        "Une arcfonction pose la même question à l'envers : sin(π/6)=1/2 était déjà su, donc directement arcsin(1/2)=π/6 — chercher l'arc dont le sinus vaut x, c'est juste relire le cercle trigonométrique dans l'autre sens.",
    },
    {
      enonce: 'arccos(−x) est-il égal à −arccos(x) ? Justifie à partir de la parité de arccos.',
      corrige:
        "Non — contrairement à arcsin et arctan, arccos n'est pas impaire. La relation correcte est arccos(−x) = π − arccos(x), pas arccos(−x) = −arccos(x).",
    },
  ],
  equations: [
    {
      enonce: "Pourquoi la condition d'existence est-elle indispensable avant de résoudre une équation avec arcsin ou arccos, alors qu'elle ne l'est jamais pour arctan ?",
      corrige:
        "arcsin(u) et arccos(u) n'existent que si u∈[−1;1] — un domaine borné — alors qu'arctan(u) existe pour tout réel u. Poser la CE pour arcsin/arccos revient à vérifier que l'argument reste dans ce domaine restreint, une vérification qui n'a simplement pas lieu d'être pour arctan.",
    },
    {
      enonce: 'Pourquoi arcsin(A) = arcsin(B) ⟺ A = B, alors que ce n\'est PAS vrai pour sin (sin(A)=sin(B) n\'entraîne pas A=B en général) ?',
      corrige:
        "Parce que arcsin est injective sur son domaine [−1;1] — contrairement à sin sur ℝ tout entier, qui est périodique et prend chaque valeur une infinité de fois. C'est la restriction du domaine qui rend l'implication valide pour arcsin, là où sin ne la vérifie pas.",
    },
    {
      enonce: "Dans la méthode en 3 temps pour résoudre une équation avec des arcfonctions, pourquoi l'étape 3 (vérifier la CE) ne peut-elle jamais être sautée ?",
      corrige:
        "Résoudre l'équation simplifiée (étape 2) peut faire apparaître des solutions qui ne respectent pas la CE posée en étape 1 — arccos(x²−1)=arccos(1−x) le montre : x=−2 est une racine correcte de l'équation simplifiée, mais elle est hors CE et doit être rejetée, car arccos(3) n'existe tout simplement pas.",
    },
  ],
  derivees: [
    {
      enonce: 'Pourquoi la dérivée de arccos comporte-t-elle un signe moins, alors que celle de arcsin n\'en a pas ?',
      corrige:
        "Ce signe vient de la dérivée de cos, qui vaut −sin (alors que (sin)'=cos) — ce n'est pas un choix arbitraire du signe de la racine (positif dans les deux démonstrations). Il traduit un fait visible sur le graphe : arccos est décroissante, alors que arcsin est croissante.",
    },
    {
      enonce: 'Pourquoi arctan est-elle dérivable sur ℝ tout entier, alors que arcsin et arccos ne le sont que sur ]−1;1[ ?',
      corrige:
        "La dérivée de arctan, 1/(1+x²), a un dénominateur qui ne s'annule jamais. Celles de arcsin et arccos ont un dénominateur √(1−x²), qui s'annule en x=±1 — et on démontre par l'absurde qu'elles n'y sont effectivement pas dérivables, contrairement à arctan.",
    },
    {
      enonce: 'Le fait que la formule 1/√(1−x²) ne soit pas définie en x=±1 suffit-il à prouver que arcsin n\'y est pas dérivable ? Justifie.',
      corrige:
        "Non — une formule non définie en un point ne prouve rien à elle seule : elle vient d'un théorème dont les hypothèses ne sont pas vérifiées en ce point, et des hypothèses non vérifiées n'établissent jamais la non-dérivabilité. Seul un raisonnement par l'absurde direct établit réellement que arcsin n'est pas dérivable en ±1.",
    },
  ],
  graphiques: [
    {
      enonce: "Un graphe a un domaine non borné (ℝ tout entier) et deux asymptotes horizontales. De quelle arcfonction peut-il s'agir, et pourquoi ces deux critères suffisent-ils à trancher ?",
      corrige:
        "Il s'agit d'arctan — la seule des trois dont le domaine est ℝ tout entier (arcsin et arccos sont bornées à [−1;1]), et la seule à posséder des asymptotes horizontales (y=±π/2). Ces deux critères l'identifient sans ambiguïté, sans même observer le sens de variation.",
    },
    {
      enonce: 'Comment distinguer le graphe d\'arcsin de celui d\'arccos à partir du seul sens de variation ?',
      corrige:
        "arcsin est strictement croissante, arccos est strictement décroissante — le critère le plus rapide pour les distinguer, puisque les deux ont le même domaine borné [−1;1] (un domaine borné seul ne suffit donc pas à les différencier).",
    },
    {
      enonce: "Pourquoi un graphe au domaine borné à [−1;1] ne peut-il jamais correspondre à arctan ?",
      corrige:
        "Parce qu'arctan a pour domaine ℝ tout entier — jamais restreinte à [−1;1]. Un domaine borné à [−1;1] élimine donc automatiquement arctan et ne laisse que arcsin ou arccos, à départager ensuite par le sens de variation.",
    },
  ],
}

/** `[]` pour une section absente de la table — même convention que `deriveQuestionsOuvertes`. */
export function deriveQuestionsComprehension(sectionId: string): QuestionOuverte[] {
  const questions = QUESTIONS_COMPREHENSION[sectionId] ?? []
  return questions.map((q) => ({ enonce: parseRichText(q.enonce), corrige: [parseRichText(q.corrige)] }))
}

export type TypeQuestionEvaluation = 'demonstration' | 'comprehension' | 'vraiFaux' | 'exercice'
export type Processus = 1 | 2 | 3

export interface LigneSelection {
  sectionId: string
  processus: Processus
  type: TypeQuestionEvaluation
  /** 0 = ligne non incluse. */
  nombre: number
  /** Points par question (chaque question générée par cette ligne vaut ce nombre de points). */
  points: number
}

interface ItemPayload {
  processus: Processus
  titreSection: string
  points: number
  exercice?: { generatorId: IdGenerateurPilote; nombre: number }
  vraiFaux?: { theme: string; nombre: number }
  /** Une entrée par série anti-triche — voir `construireOuvertesParSerie`. */
  ouvertesParSerie?: QuestionOuverte[][]
}

/** Encode un objet JS en base64 sûr pour l'UTF-8 (accents français compris) — décodage symétrique
 * côté plateforme-maths (`decodeURIComponent(escape(atob(...)))`, voir `AppEvaluation6e.tsx`). */
function encoderPayload(payload: unknown): string {
  const json = JSON.stringify(payload)
  return btoa(unescape(encodeURIComponent(json)))
}

/** Choisit `nombre` éléments distincts au hasard (Fisher-Yates partiel) — même algorithme que
 * `piocherQuestions` côté plateforme-maths (`AppEvaluation6e.tsx`), dupliqué ici volontairement :
 * deux dépôts séparés, pas de code partagé entre eux. */
function piocherAleatoire<T>(banque: T[], nombre: number): T[] {
  const copie = [...banque]
  const n = Math.min(nombre, copie.length)
  for (let i = copie.length - 1; i > copie.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
  }
  return copie.slice(copie.length - n)
}

/** Construit une sélection de `nombre` questions ouvertes PAR SÉRIE — indépendamment randomisée
 * quand le vivier le permet (`banque.length > nombre`), pour que les séries anti-triche diffèrent
 * aussi sur les questions ouvertes, pas seulement sur les exercices générés/le vrai-faux (déjà
 * randomisés à la génération côté plateforme-maths). Vivier insuffisant : toutes les séries
 * reçoivent la même sélection (rien d'autre à distribuer). */
function construireOuvertesParSerie(banque: QuestionOuverte[], nombre: number, nombreSeries: number): QuestionOuverte[][] {
  if (banque.length <= nombre) {
    const selection = banque.slice(0, nombre)
    return Array.from({ length: nombreSeries }, () => selection)
  }
  return Array.from({ length: nombreSeries }, () => piocherAleatoire(banque, nombre))
}

export interface EnTeteEvaluation {
  numero: string
  date: string
  titre: string
  niveauLabel: string
  /** 4, 5 ou 6 — voir `NIVEAU_NUMERO`. */
  niveauNumero: number
  /** Texte affiché « Mathématiques {X}h/sem » — voir `HEURES_SEMAINE_DEFAUT`. */
  heuresSemaine: string
  calculatrice: 'interdite' | 'autorisee'
  /** Nombre de versions anti-triche à générer (>= 1, lettrées A, B, C...) — chacune indépendamment
   * randomisée (générateurs, vrai/faux, et questions ouvertes quand le vivier le permet). */
  nombreSeries: number
}

/**
 * Construit l'URL complète vers le générateur d'évaluations à partir de la sélection de
 * l'utilisateur — `null` si aucune ligne active (rien à générer). `sections` doit être les sections
 * RÉELLES du chapitre choisi (pour dériver les questions ouvertes) — voir `chaptersIndex.ts`.
 */
export function buildEvaluationUrl(entete: EnTeteEvaluation, lignes: LigneSelection[], sections: ChapterSection[]): string | null {
  const items: ItemPayload[] = []
  const nombreSeries = Math.max(1, entete.nombreSeries)

  for (const ligne of lignes) {
    if (ligne.nombre <= 0) continue
    const config = SECTIONS_EVALUATION_PILOTE.find((c) => c.sectionId === ligne.sectionId)
    const section = sections.find((s) => s.id === ligne.sectionId)
    if (!config || !section) continue

    const titreSection = `${section.number}. ${section.title}`

    if (ligne.type === 'exercice') {
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, exercice: { generatorId: config.generatorId, nombre: ligne.nombre } })
    } else if (ligne.type === 'vraiFaux') {
      items.push({ processus: ligne.processus, titreSection, points: ligne.points, vraiFaux: { theme: config.quizTheme, nombre: ligne.nombre } })
    } else {
      const banque = ligne.type === 'demonstration' ? deriveQuestionsOuvertes(section) : deriveQuestionsComprehension(section.id)
      const ouvertesParSerie = construireOuvertesParSerie(banque, ligne.nombre, nombreSeries)
      if (ouvertesParSerie[0].length > 0) items.push({ processus: ligne.processus, titreSection, points: ligne.points, ouvertesParSerie })
    }
  }

  if (items.length === 0) return null

  const base64 = encoderPayload({
    numero: entete.numero,
    date: entete.date,
    titre: entete.titre,
    niveauLabel: entete.niveauLabel,
    niveauNumero: entete.niveauNumero,
    heuresSemaine: entete.heuresSemaine,
    calculatrice: entete.calculatrice,
    nombreSeries,
    items,
  })
  return `${EVALUATION_BASE_URL}?d=${encodeURIComponent(base64)}`
}
