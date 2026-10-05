import type {
  ExerciceFonctionReference,
  FamilleReference,
  GenerateurExerciceFonctionReference,
  ReglagesFamillesFonctionReference,
} from "../../core/fonctionsReference.types";

export const FAMILLES: FamilleReference[] = ["carre", "cube", "racine_carree", "racine_cubique", "inverse", "valeur_absolue"];

/**
 * Catalogue de métadonnées `{id,label}` (convention RETROFIT-variantes-generateurs.md /
 * CLAUDE.md, "Catalogue de variantes") — `id` réutilise directement `FamilleReference`, `label`
 * dupliqué depuis `src/ui/famillesReferenceLabels.ts` plutôt qu'importé (Couche A ne dépend jamais
 * de `src/ui/`, voir Architecture dans CLAUDE.md) : les deux doivent rester synchronisés à la main
 * si un libellé change, même principe de duplication assumée que le reste du projet pour de petits
 * artefacts (`ajusterAuRatio`, `coteFactorise`...).
 */
export interface VarianteFonctionReference {
  id: FamilleReference;
  label: string;
}

export const CATALOGUE_VARIANTES: VarianteFonctionReference[] = [
  { id: "carre", label: "Carré (x²)" },
  { id: "cube", label: "Cube (x³)" },
  { id: "racine_carree", label: "Racine carrée (√x)" },
  { id: "racine_cubique", label: "Racine cubique (∛x)" },
  { id: "inverse", label: "Inverse (1/x)" },
  { id: "valeur_absolue", label: "Valeur absolue (|x|)" },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Implémentation de la Couche A pour "Transformations graphiques — fonctions de référence"
 * (spec-fonctions-reference.md section 2) : une famille tirée uniformément parmi les 6. TH/TV
 * tirés indépendamment, entiers SIGNÉS dans [-5,5] (prompt-restructuration-formule-th-ch.md,
 * point 2 — alignés sur p/q du chapitre 1). EV/CV et EH/CH sont chacun tirés par EXCLUSIVITÉ
 * MUTUELLE (`prompt-simplification-generation.md`, point 2) — pour une paire donnée, une branche
 * est choisie en premier (équiprobable), puis un entier k dans [1,5] est tiré et affecté SEULEMENT
 * au curseur de cette branche, l'autre restant à sa valeur neutre (1) — plage remise à [1,5]
 * (`prompt-croix-et-elargissement-plage.md`, point 2, réduite un temps à [1,3] par
 * `prompt-reduction-plage-ch-eh-cv-ev.md` ; élargissement rendu sûr par les deux corrections
 * suivantes, déjà en place : la contrainte "un seul canal actif à la fois" élimine le risque
 * d'ambiguïté croisée entre les deux canaux, et le second point marqué (`pointUnitaire`, voir
 * Vérification) rend le champ équation résoluble exactement quelle que soit l'ampleur du facteur).
 * `prompt-canal-unique-et-second-point.md`, point 1 (option B) resserre encore cette contrainte **entre les deux paires** :
 * un seul des deux "canaux" — horizontal (`CH`/`EH`) ou vertical (`EV`/`CV`) — peut recevoir ce
 * tirage à la fois, l'autre canal restant entièrement neutre (`1,1`) ; `canalActif` est donc choisi
 * EN PREMIER (équiprobable), puis seule la paire du canal choisi subit le tirage par exclusivité
 * mutuelle interne décrit ci-dessus — jamais les deux paires tirées indépendamment comme avant.
 * Élimine par construction la possibilité que deux combinaisons différentes (une horizontale, une
 * verticale) produisent exactement la même courbe finale par coïncidence numérique : chaque courbe
 * générée a désormais une seule "origine" possible pour son facteur global. La vérification
 * holistique par échantillonnage (`verifierCurseursFonctionReference`/
 * `verifierEquationFonctionReference`) reste, elle, tout aussi permissive — cette restriction ne
 * change que ce qui est généré, jamais la façon de vérifier ; elle continue d'accepter n'importe
 * quelle combinaison mathématiquement équivalente, y compris une combinaison (canaux horizontal ET
 * vertical actifs simultanément) que ce générateur ne produit plus lui-même. SOX/SOY chacun un
 * booléen 50/50, indépendant — non concernés par cette restriction, orthogonaux aux deux canaux.
 */
/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — nommée `construireAvecFamille` plutôt que génériquement, l'id de variante
 * s'appelant justement `famille` dans tout ce module ; aucun alias supplémentaire n'a été ajouté
 * (déjà le nom historique, réutilisé tel quel par `creerGenerateurCaracteristiquesAlgebriques`,
 * treizième exercice, et par tous les tests existants).
 *
 * Construit un exercice pour une famille DÉJÀ choisie — extrait de
 * `genererExerciceFonctionReference` (`prompt-reglage-nombre-par-famille.md`) pour être réutilisé
 * par le mode "personnalisé" (voir `creerGenerateurFonctionReference` ci-dessous), qui doit forcer
 * la famille plutôt que la tirer, tout en gardant strictement inchangé le tirage des 7 autres
 * paramètres (TH/TV/CH/EH/EV/CV/SOX/SOY). `overrides?.th`/`overrides?.tv` (additifs, optionnels —
 * non fournis, comportement 100% inchangé, même principe que `racineImposee`/`aImpose` de
 * `secondDegre/categories/*.ts`) permettent de forcer TH et/ou TV plutôt que de les tirer — utilisé
 * par "Caractéristiques algébriques d'une fonction de référence" (`generateurs/
 * caracteristiquesAlgebriques/index.ts`) pour imposer TH=0 (catégorie "paire") ou TH=0 et TV=0
 * (catégorie "impaire") sans dupliquer le tirage des 7 autres paramètres.
 */
export function construireAvecFamille(famille: FamilleReference, overrides?: { th?: number; tv?: number }): ExerciceFonctionReference {
  const th = overrides?.th ?? randomInt(-5, 5);
  const tv = overrides?.tv ?? randomInt(-5, 5);

  let ev = 1;
  let cv = 1;
  let eh = 1;
  let ch = 1;

  const canalHorizontalActif = Math.random() < 0.5;
  if (canalHorizontalActif) {
    const brancheEH = Math.random() < 0.5;
    const kEhCh = randomInt(1, 5);
    eh = brancheEH ? kEhCh : 1;
    ch = brancheEH ? 1 : kEhCh;
  } else {
    const brancheEV = Math.random() < 0.5;
    const kEvCv = randomInt(1, 5);
    ev = brancheEV ? kEvCv : 1;
    cv = brancheEV ? 1 : kEvCv;
  }

  const sox = Math.random() < 0.5;
  const soy = Math.random() < 0.5;

  const exercice: ExerciceFonctionReference = { famille, th, tv, ch, eh, ev, cv, sox, soy };
  return exercice;
}

export const genererExerciceFonctionReference: GenerateurExerciceFonctionReference = () => {
  const famille = FAMILLES[randomInt(0, FAMILLES.length - 1)];
  return construireAvecFamille(famille);
};

/**
 * Construit la file des familles à générer pour le mode "personnalisé"
 * (`prompt-reglage-nombre-par-famille.md`) : `quantites[famille]` occurrences de chaque famille,
 * dans l'ordre canonique de `FAMILLES`, puis mélangée (Fisher-Yates, même principe que
 * `ordreTermes` de l'exercice "Analyse d'une fonction du second degré" ou l'ordre des facteurs de
 * l'exercice "Tableau de signes à plusieurs facteurs") — les exercices apparaissent donc dans un
 * ordre imprévisible, jamais groupés par famille, tout en respectant exactement les quantités
 * demandées. Exportée séparément de `creerGenerateurFonctionReference` pour être testée isolément
 * (répartition exacte, mélange réel) sans dépendre du mécanisme de file à état de ce dernier.
 */
export function construireFileFamillesMelangee(quantites: Record<FamilleReference, number>): FamilleReference[] {
  const file: FamilleReference[] = [];
  for (const famille of FAMILLES) {
    for (let i = 0; i < quantites[famille]; i++) {
      file.push(famille);
    }
  }
  for (let i = file.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [file[i], file[j]] = [file[j], file[i]];
  }
  return file;
}

/**
 * Fabrique de générateur pilotée par `ReglagesFamillesFonctionReference` — même principe que
 * `creerGenerateurInequationRationnelle` (exercice "Inéquations rationnelles",
 * `src/generateurs/inequationRationnelle/index.ts`) : capture le réglage dans une fermeture et
 * retourne un générateur sans argument, pour que la Couche B reste totalement agnostique de ce
 * réglage — elle continue d'appeler `generateur()` sans jamais connaître
 * `ReglagesFamillesFonctionReference`. Diverge du précédent sur un point : le mode "personnalisé"
 * exige un nombre EXACT d'exercices par famille sur toute la série, dans un ordre mélangé — une
 * garantie que le choix sans état de `choisirNiveau` (tirage uniforme à chaque appel) ne peut pas
 * offrir. La fermeture retournée est donc STATEFUL dans ce mode : la file mélangée est construite
 * une seule fois, à la création du générateur, puis consommée un élément à la fois à chaque appel
 * — c'est cette file (jamais un nouveau tirage à chaque appel) qui garantit les quantités exactes.
 * En mode "aléatoire", retourne `genererExerciceFonctionReference` tel quel, sans aucune
 * fermeture supplémentaire — comportement strictement inchangé.
 */
export function creerGenerateurFonctionReference(reglages: ReglagesFamillesFonctionReference): GenerateurExerciceFonctionReference {
  if (reglages.mode === "aleatoire") {
    return genererExerciceFonctionReference;
  }
  const file = construireFileFamillesMelangee(reglages.quantites);
  let index = 0;
  return () => {
    const famille = file[index % file.length];
    index += 1;
    return construireAvecFamille(famille);
  };
}
