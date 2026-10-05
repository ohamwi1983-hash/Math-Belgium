/**
 * Couche core — contrat propre au premier générateur de la 5e FWB (4h), `5gen1` ("Domaine de
 * définition"). Indépendant de tout contrat 4e — voir CLAUDE.md, section "Chantier 5e FWB (4h)" :
 * aucun contrat/moteur partagé entre les deux chantiers.
 *
 * Un polynôme est représenté par ses coefficients par degré CROISSANT (`coeffs[i]` = coefficient
 * de x^i) — représentation générique unique, valable pour un facteur linéaire, quadratique ou
 * cubique, quelle que soit la forme dans laquelle il est AFFICHÉ à l'élève (`latex`, qui peut être
 * factorisé alors que `coeffs` reste toujours développé — seule `coeffs` sert à l'évaluation
 * numérique, jamais à l'affichage).
 */
export type Polynome = number[];

/** Les 6 familles du catalogue — tirage pondéré (voir `generateurs5e/domaineDefinition/`), jamais uniforme. */
export type FamilleDomaineDefinition =
  | "rationnelle"
  | "irrationnelleSimple"
  | "racineSurFraction"
  | "fractionSousRacine"
  | "pasDeCE"
  | "racineImpaireDenominateur";

/** Les 5 sous-cas de la famille "rationnelle" — doivent apparaître à fréquence comparable. */
export type SousCasRationnelle = "lineaireSimple" | "quadratiqueFactorisable" | "carreParfait" | "factoriseAvecCarre" | "vacuous";

/**
 * Un "slot" de condition d'existence : une sous-expression de f(x) qui porte une condition, déjà
 * identifiée à la génération — l'écran 1 est GUIDÉ (l'élève choisit parmi les slots existants +
 * un symbole, jamais de saisie LaTeX libre à parser, voir CLAUDE.md section 5gen1) : la CE de
 * l'écran 1 se limite donc à un identifiant de slot + un symbole choisi par bouton, jamais un
 * texte. `coeffs` sert à l'écran 2 (résolution) et à l'écran 3 (domf), jamais à l'écran 1
 * lui-même (comparaison structurelle pure, slot+symbole attendus vs choisis).
 */
export type RoleSlotCE = "denominateur" | "radicande";
export type SymboleCE = "≠" | "≥" | ">";

export interface SlotCE {
  id: string;
  role: RoleSlotCE;
  /** LaTeX de la sous-expression elle-même, affichée telle quelle dans f(x) — jamais retapée. */
  latex: string;
  /**
   * Version TEXTE BRUT (sans aucune commande LaTeX) de la même sous-expression — un `<option>`
   * HTML natif ne peut afficher que du texte, jamais du KaTeX (voir `EtapeCEDomaineDefinition.tsx`,
   * qui consomme ce champ pour le vrai `<select>` de choix du polynôme). Dérivée de la MÊME donnée
   * que `latex` à chaque site de construction — jamais reconstruite en parsant `latex`, qui serait
   * fragile ; identique caractère pour caractère à `latex` dans l'immense majorité des cas
   * (`formatPolynomeLatex` ne produit jamais de commande LaTeX — ni `\`, ni accolade — seulement des
   * chiffres/x/^/+/-/parenthèses, donc déjà un texte brut valide), sauf le radicande composé de
   * "fractionSousRacine" (`\dfrac{N}{D}`), dont le texte devient `(N)/(D)`.
   */
  texte: string;
  coeffs: Polynome;
  symboleAttendu: SymboleCE;
  /**
   * Options DISTRACTRICES additionnelles pour le combobox "à quel polynôme cette condition
   * se rapporte-t-elle ?" (point 1.9) — jamais de vraie réponse valide, seulement un choix
   * plausible mais faux (ex. le numérateur N seul, alors que la vraie condition porte sur le
   * dénominateur D, ou N/D combinés). Absent/vide : un seul slot reste affiché en LaTeX brut
   * (comportement historique), aucun combobox nécessaire. La vérification (`verifierCE`) reste
   * inchangée — un `id` de decoy ne correspond jamais à un `SlotCE.id` réel, donc jamais accepté.
   */
  decoys?: { id: string; latex: string; texte: string }[];
}

/**
 * Ensemble de R décrit de façon GUIDÉE (même principe que `FormeDomaine`/gen12-13 4e, réimplémenté
 * ici en propre à ce chantier plutôt qu'importé — voir CLAUDE.md section 5gen1) : jamais un texte
 * LaTeX libre à parser, toujours une forme + des pièces structurées. Type UNIFIÉ, réutilisé à la
 * fois pour la résolution d'une condition seule (écran 2 des familles "rationnelle"/
 * "irrationnelleSimple"/"racineImpaireDenominateur", où `domf === resolution` littéralement — une
 * seule condition résolue EST déjà le domf final) et pour le domf combiné final (écran 3) : les
 * deux écrans posent la même question de forme ("comment décrire cet ensemble de R ?"), seule la
 * SOURCE (une condition isolée vs plusieurs combinées) diffère.
 */
export type FormeEnsemble = "reel" | "prive_points" | "intervalles";

export interface MorceauEnsemble {
  inf: number | null;
  sup: number | null;
  infInclus: boolean;
  supInclus: boolean;
}

export interface EnsembleReelGuide {
  forme: FormeEnsemble;
  /** uniquement pour `forme === "prive_points"`, triés croissant. */
  points: number[];
  /** uniquement pour `forme === "intervalles"`, triés par borne inf croissante. */
  morceaux: MorceauEnsemble[];
}

/** Champs communs aux 6 familles. */
export interface ExerciceDomaineDefinitionCommun {
  /** LaTeX de f(x) tel qu'affiché à l'élève, dès l'écran 1 (traçabilité des coefficients). */
  fLatex: string;
  domf: EnsembleReelGuide;
  /**
   * true si la CE se résout structurellement à "toujours vraie" (aucune exclusion) — le gate de
   * l'écran 1 répond alors directement "Aucune CE", l'écran "resolution" est sauté, quelle que
   * soit la famille (principe unifié 1.10, transversal — jamais limité à la seule famille dédiée
   * "pasDeCE"). "Aucune CE" peut donc être la bonne réponse pour plusieurs raisons structurellement
   * différentes selon la famille tirée (dénominateur toujours >0, discriminant négatif, N/D de
   * même signe constant...) — voir chaque famille pour le détail. Toujours `true` pour la famille
   * "pasDeCE" elle-même (racine impaire isolée / valeur absolue, jamais de CE par nature).
   */
  aucuneCE: boolean;
}

export interface ExerciceRationnelle extends ExerciceDomaineDefinitionCommun {
  famille: "rationnelle";
  sousCas: SousCasRationnelle;
  slots: [SlotCE];
  /** identique à `domf` — une seule condition résolue EST déjà le domf final pour cette famille. */
  resolution: EnsembleReelGuide;
}

export interface ExerciceIrrationnelleSimple extends ExerciceDomaineDefinitionCommun {
  famille: "irrationnelleSimple";
  /** true si le radicande est quadratique (étude de signe), false si linéaire. */
  radicandeQuadratique: boolean;
  slots: [SlotCE];
  /** identique à `domf` — voir la note de `ExerciceRationnelle.resolution`. */
  resolution: EnsembleReelGuide;
}

/**
 * Structure de f(x) — 2 possibles (point 7) : `"racineSurD"` = √N/D (2 CE indépendantes, N≥0 ET
 * D≠0) ; `"nSurRacineD"` = N/√D (1 seule CE, D>0 STRICT — jamais juste D≥0 : le radicande est ici
 * au DÉNOMINATEUR, donc √D=0 annulerait la fraction, piège central de cette sous-variante).
 */
export type StructureRacineSurFraction = "racineSurD" | "nSurRacineD";

export interface ExerciceRacineSurFraction extends ExerciceDomaineDefinitionCommun {
  famille: "racineSurFraction";
  structure: StructureRacineSurFraction;
  radicandeQuadratique: boolean;
  /** vrai si l'exclusion du dénominateur tombe DANS l'intervalle solution du radicande (piège
   * central de la sous-variante "racineSurD" — sans objet pour "nSurRacineD", toujours `false`). */
  exclusionDansIntervalle: boolean;
  /** 2 slots pour "racineSurD" (radicande + dénominateur, CE indépendantes) ; 1 seul pour
   * "nSurRacineD" (le radicande, qui EST le dénominateur — condition stricte D>0). */
  slots: [SlotCE] | [SlotCE, SlotCE];
  /** résolution du radicande seul — pour "nSurRacineD", c'est déjà `domf` (comme toute famille à
   * 1 CE), la condition étant stricte (`>`, jamais `≥`). */
  resolutionRadicande: EnsembleReelGuide;
  /** valeur exclue par le dénominateur — UNIQUEMENT pour "racineSurD" (D linéaire, une seule
   * valeur exclue) ; `null` pour "nSurRacineD" (aucun dénominateur séparé, la condition D>0 EST
   * `resolutionRadicande`). */
  resolutionDenominateur: number | null;
}

/** Grille de signes attendue pour N(x)/D(x) ≥ 0 — mêmes 3 lignes/mêmes états que le gen6 4e
 * ("Inéquations rationnelles"), réutilise directement `ValeurCellule`/`ValeurCelluleQuotient`
 * (`src/core/signesProduit.types.ts`/`src/core/inequationRationnelle.types.ts`) — petits types
 * génériques à 3/4 états, sans dépendance au contrat 4e, même principe que `cyclerValeurCellule`
 * (voir CLAUDE.md section 5gen1, décision "import direct cross-chantier"). */
import type { ValeurCellule } from "../core/signesProduit.types";
import type { ValeurCelluleQuotient } from "../core/inequationRationnelle.types";

export interface GrilleQuotientDomf {
  ligneNumerateur: ValeurCellule[];
  ligneDenominateur: ValeurCellule[];
  ligneQuotient: ValeurCelluleQuotient[];
}

/**
 * 4 sous-variantes (point 6) selon le degré de N et D — "N1D1" existant (les deux linéaires),
 * "N2D1"/"N1D2"/"N2D2" nouvelles. N et D toujours SANS facteur commun entre eux (pour ne jamais
 * masquer une exclusion par simplification, pas pour éviter de retomber sur une autre famille).
 */
export type SousVarianteFractionSousRacine = "N1D1" | "N2D1" | "N1D2" | "N2D2";

export interface ExerciceFractionSousRacine extends ExerciceDomaineDefinitionCommun {
  famille: "fractionSousRacine";
  sousVariante: SousVarianteFractionSousRacine;
  numerateur: Polynome;
  numerateurLatex: string;
  denominateur: Polynome;
  denominateurLatex: string;
  /** true ssi D(x) est quadratique à discriminant NÉGATIF (signe constant, jamais 0) — le
   * tableau de signes devient inutile (N≥0 seul décide), mais la CE reste réelle (piège de
   * raccourci signalé par le point 6, distinct du cas `aucuneCE`). */
  denominateurSansRacineReelle: boolean;
  /** racines RÉELLES distinctes (numérateur ET dénominateur confondus), triées croissant — peut
   * être vide (`aucuneCE === true`, N ET D tous deux sans racine réelle, de même signe constant —
   * 3e chemin vers "Aucune CE", point 6). */
  racines: number[];
  /** 2 slots de l'écran 1, TOUS DEUX REQUIS en lignes séparées (choix pédagogique délibéré — rendre
   * explicite ce que "N/D≥0" laisse implicite, jamais une simplification tolérée) : [0] "radicande"
   * — la condition composée "N/D≥0" (le quotient entier, jamais N ou D séparément ; `slots[0].decoys`
   * porte le seul choix distracteur restant "N seul" du combobox — `coeffs` vide, non consommé,
   * l'écran 1 est structurel, jamais évalué numériquement) ; [1] "denominateur" — "D≠0", requise en
   * PLUS de [0], même si mathématiquement IMPLIQUÉE par elle (N/D≥0 présuppose D≠0 pour être
   * définie) : `verifierCE` exige les 2 lignes, "N/D≥0" seul (sans "D≠0" séparée) est REJETÉ. */
  slots: [SlotCE, SlotCE];
  grille: GrilleQuotientDomf;
}

export type RaisonPasDeCE = "racineImpaire" | "valeurAbsolue";

export interface ExercicePasDeCE extends ExerciceDomaineDefinitionCommun {
  famille: "pasDeCE";
  raison: RaisonPasDeCE;
  /** LaTeX de l'argument SEUL de la racine impaire/valeur absolue (ex. "x+7"), sans l'habillage
   * `\sqrt[n]{...}`/`|...|` de `fLatex` — affiché en écran 1 (label statique, jamais un champ
   * libre) comme "polynôme concerné" de la ligne de condition, même convention visuelle que le
   * label `.ce-slot-latex` des autres familles à 1 slot, bien qu'aucun vrai slot n'existe ici. */
  argumentLatex: string;
}

/** Les 3 sous-cas pondérés du radicande D(x) quadratique (point 5) — "discriminantNegatif" ⇒
 * `aucuneCE === true` (D(x) toujours ≠0, conformément au principe unifié 1.10). */
export type SousCasDenominateurQuadratique = "racinesDistinctes" | "racineDouble" | "discriminantNegatif";

export interface ExerciceRacineImpaireDenominateur extends ExerciceDomaineDefinitionCommun {
  famille: "racineImpaireDenominateur";
  /** degré du radicande D(x) — 1 (existant) ou 2 (nouveau, 3 sous-cas pondérés). */
  denominateurDegre: 1 | 2;
  /** uniquement défini si `denominateurDegre === 2` ; `null` pour le degré 1. */
  sousCasDegre2: SousCasDenominateurQuadratique | null;
  /** degré du numérateur — k constante (0, existant, seul cas jusqu'ici) ou 1/2 (nouveaux) ;
   * n'introduit JAMAIS de CE supplémentaire (variation purement visuelle, point 5). */
  numerateurDegre: 0 | 1 | 2;
  /** CE toujours écrite en une seule ligne ("D(x)≠0"), quel que soit le degré du radicande — le
   * slot réel représente D ; `slot.decoys` porte le choix distracteur "N" du combobox, présent
   * UNIQUEMENT quand `numerateurDegre >= 1` (2 polynômes degré≥1 en jeu). */
  slots: [SlotCE];
  /** identique à `domf` — voir la note de `ExerciceRationnelle.resolution`. */
  resolution: EnsembleReelGuide;
}

export type ExerciceDomaineDefinition =
  | ExerciceRationnelle
  | ExerciceIrrationnelleSimple
  | ExerciceRacineSurFraction
  | ExerciceFractionSousRacine
  | ExercicePasDeCE
  | ExerciceRacineImpaireDenominateur;

export type GenerateurExerciceDomaineDefinition = () => ExerciceDomaineDefinition;
