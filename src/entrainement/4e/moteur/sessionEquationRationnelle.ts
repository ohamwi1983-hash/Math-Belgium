/**
 * Couche B — moteur de session pour l'exercice "L'inconnue au dénominateur" (équations
 * rationnelles). Séquence ce → [simplifier] → isolement → [reconnaissance] → champ1 → champ2 →
 * racinesEtrangeres, générique sur `exercice.ce` (1 ou 2 valeurs), `exercice.fractionsSimplifiables`
 * et `equationIsolee.categorie` : ne teste jamais `exercice.construction` explicitement. La phase
 * "simplifier" est sautée quand `fractionsSimplifiables` est vide (voir `necessiteSimplification`
 * ci-dessous — prompt-3-simplifier-et-isolement-flexible.md). La phase "reconnaissance" est
 * sautée uniquement quand `categorie === "mise_en_evidence_generalisee"` (voir
 * `necessiteReconnaissance` ci-dessous — construction `deux_fractions_lineaires` sous-variantes
 * (a)/(b), prompt-2-cas3-degre1.md, même principe que la famille 5 de l'exercice "méthode la plus
 * rapide"). La phase "champ1" est sautée en plus quand `equationIsolee.enonce.a === 0` (chemin
 * linéaire, prompt-4-chemin-lineaire.md — voir `necessiteFactorisation` ci-dessous) : isolement
 * mène alors directement à champ2, où l'élève saisit deux fois la racine unique de l'équation
 * linéaire (même composant EtapeChamp2 que le cas quadratique, déjà conçu pour accepter une
 * racine double). Réutilise verifierIsolement/verifierChampPrincipal/verifierRacines de verification.ts
 * (exercice "méthode la plus rapide") telles quelles sur exercice.equationIsolee, et
 * verifierCE/verifierFractionSimplifiee/verifierRacinesEtrangeres de
 * verificationEquationRationnelle.ts pour les étapes propres à cet exercice. N'importe jamais rien
 * de src/generateurs : voir sessionEquationRationnelle.test.ts pour la preuve avec des générateurs
 * factices minimaux.
 */
import type { Categorie, Exercice } from "../core/generateur.types";
import type { ExerciceEquationRationnelle, GenerateurExerciceEquationRationnelle } from "../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../core/simplification.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierChampPrincipal, verifierFactorisationCasGeneral, verifierIsolement, verifierRacines } from "./verification";
import { diagnostiquerMiseEnEvidenceFraction, verifierSimplification } from "./verificationSimplification";
import { necessiteSimplification as necessiteReductionCoefficients } from "./simplificationEquation";
import { verifierCE, verifierFractionSimplifiee, verifierRacinesEtrangeres } from "./verificationEquationRationnelle";
import type { EtatSessionEquationRationnelle, ResultatExerciceEquationRationnelle } from "./typesEquationRationnelle";

const POINTS_DE_BASE = 100;

/** Sautée quand aucune fraction de l'énoncé n'est individuellement réductible (voir Couche A). */
function necessiteSimplification(exercice: ExerciceEquationRationnelle): boolean {
  return exercice.fractionsSimplifiables.length > 0;
}

/**
 * Cas 4a/4b uniquement (prompt-cas4a-4b.md) : la fraction de gauche embarque un P2 qui exige le
 * mécanisme riche reconnaissance/factorisation/racines avant de pouvoir simplifier — jamais sautée
 * (systématique par construction, contrairement à `necessiteSimplification` ci-dessus). La
 * présence de `fractionGauche` (jamais `exercice.construction`) décide.
 */
function necessiteSimplificationRiche(exercice: ExerciceEquationRationnelle): boolean {
  return exercice.fractionGauche !== undefined;
}

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Le P2 embarqué dans `exercice.fractionGauche` (numérateur pour le type "P2/P1", dénominateur pour "P1/P2"). */
function p2DeFractionGauche(exercice: ExerciceEquationRationnelle): Exercice {
  const fractionGauche = exercice.fractionGauche;
  if (!fractionGauche) throw new Error("p2DeFractionGauche : cet exercice n'a pas de fractionGauche");
  return estPolynomeLineaire(fractionGauche.numerateur) ? (fractionGauche.denominateur as Exercice) : (fractionGauche.numerateur as Exercice);
}

/**
 * Sautée uniquement pour la construction deux_fractions_lineaires sous-variantes (a)/(b) — le
 * facteur commun (P1_4 ou P1_3) n'a aucune raison de correspondre à l'une des 4 techniques
 * réelles, et cette catégorie sert justement à marquer "pas de reconnaissance" dans tout le projet
 * (même convention que necessiteReconnaissance, src/moteur/session.ts, exercice 1 famille 5).
 */
function necessiteReconnaissance(exercice: ExerciceEquationRationnelle): boolean {
  return exercice.equationIsolee.categorie !== "mise_en_evidence_generalisee";
}

/**
 * Sautée quand `equationIsolee.enonce.a===0` (équation linéaire bx+c=0, chemin linéaire —
 * prompt-4-chemin-lineaire.md, section 2) : aucune des 4 techniques ne s'applique à une équation
 * de degré 1, il n'y a donc rien à factoriser. Seule la construction `deux_fractions_lineaires`
 * sous-variante (a) peut produire a=0 (sa fraction droite, toujours proportionnelle, se réduit
 * intégralement à une constante une fois simplifiée — voir construireSousVarianteA.ts) ; les
 * autres constructions garantissent toutes un coefficient dominant non nul par construction. Le
 * moteur ne teste jamais `exercice.construction` : ce contrôle générique sur `a` suffit.
 */
function necessiteFactorisation(exercice: ExerciceEquationRationnelle): boolean {
  return exercice.equationIsolee.enonce.a !== 0;
}

const ETAT_TRANSITOIRE_VIERGE = {
  scoreCEExercice: null,
  scoreSimplifierExercice: null,
  scoreSimplifierReductionExercice: null,
  scoreSimplifierReconnaissanceExercice: null,
  simplifierCategorieRevelee: false,
  scoreSimplifierChamp1Exercice: null,
  scoreSimplifierChamp2Exercice: null,
  scoreSimplifierFactorisationExercice: null,
  scoreSimplifierFractionExercice: null,
  scoreIsolementExercice: null,
  scoreReconnaissanceExercice: null,
  categorieRevelee: false,
  scoreChampPrincipalExercice: null,
  scoreRacinesExercice: null,
  aideCeUtilisee: false,
  aideSimplifierReductionUtilisee: false,
  aideSimplifierChamp1Utilisee: false,
  aideSimplifierChamp2Utilisee: false,
  aideSimplifierFactorisationUtilisee: false,
  aideSimplifierFractionUtilisee: false,
  aideIsolementUtilisee: false,
  aideChamp1Utilisee: false,
  aideChamp2Utilisee: false,
} as const;

export function demarrerSessionEquationRationnelle(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceEquationRationnelle,
): EtatSessionEquationRationnelle {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "ce",
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionEquationRationnelle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function garderPhase(etat: EtatSessionEquationRationnelle, phase: EtatSessionEquationRationnelle["phase"], nomFonction: string): void {
  if (etat.terminee || etat.phase !== phase) {
    throw new Error(`${nomFonction} : la session n'est pas à l'étape ${phase}`);
  }
}

/**
 * Étape "ce" : toujours la première — les valeurs interdites à identifier, une pour la
 * construction un_denominateur, deux pour deux_denominateurs (générique sur `exercice.ce`).
 */
export function soumettreReponseCE(etat: EtatSessionEquationRationnelle, reponse: number[]): EtatSessionEquationRationnelle {
  garderPhase(etat, "ce", "soumettreReponseCE");

  const etapeCourante = soumettreEtapeTentatives<number[]>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCE(r, etat.exerciceCourant.ce),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: necessiteSimplificationRiche(etat.exerciceCourant)
      ? necessiteReductionCoefficients(p2DeFractionGauche(etat.exerciceCourant))
        ? "simplifierReduction"
        : "simplifierReconnaissance"
      : necessiteSimplification(etat.exerciceCourant)
        ? "simplifier"
        : "isolement",
    scoreCEExercice: etat.aideCeUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/**
 * Active le bouton "Aide" de l'étape "ce" — ne concerne que la variante `EtapeRacinesFlexibles`
 * (plusieurs CE) ; révélation à sens unique, ×0,5 sur le score.
 */
export function activerAideCe(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "ce", "activerAideCe");
  return { ...etat, aideCeUtilisee: true };
}

/**
 * Étape "simplifierReduction" (cas 4a/4b uniquement, quand pgcd(|a|,|b|,|c|)>1 sur le P2 de
 * fractionGauche — voir soumettreReponseCE) : demande de mettre ce P2 en évidence (facteur commun
 * conservé, visible — ex. "2(x^2-2x-24)"), jamais de le DIVISER par ce facteur : contrairement à
 * l'équation isolée elle-même ("...=0"), `fractionGauche` est une fraction (P2/P1 ou P1/P2) dont la
 * valeur doit rester exactement celle de l'énoncé — diviser SEULEMENT ce P2 la changerait
 * silencieusement (même bug que gen3, confirmé empiriquement sur gen3 — capture d'écran
 * utilisateur du 26/09). Ne modifie donc jamais `fractionGauche` : simplifierReconnaissance et la
 * suite continuent de travailler sur le P2 d'origine, exactement comme avant l'ajout de cette
 * étape.
 */
export function soumettreReponseSimplifierReduction(
  etat: EtatSessionEquationRationnelle,
  reponse: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierReduction", "soumettreReponseSimplifierReduction");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceFraction(p2DeFractionGauche(etat.exerciceCourant), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierReconnaissance",
    scoreSimplifierReductionExercice: etat.aideSimplifierReductionUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierReduction(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierReduction", "activerAideSimplifierReduction");
  return { ...etat, aideSimplifierReductionUtilisee: true };
}

/** Étape "simplifierReconnaissance" (cas 4a/4b uniquement) : choix de la catégorie parmi les 4, pour le P2 de fractionGauche. */
export function soumettreChoixSimplifierCategorie(
  etat: EtatSessionEquationRationnelle,
  choix: Categorie,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierReconnaissance", "soumettreChoixSimplifierCategorie");

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === p2DeFractionGauche(etat.exerciceCourant).categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierChamp1",
    scoreSimplifierReconnaissanceExercice: etapeCourante.score,
    simplifierCategorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "simplifierChamp1" (cas 4a/4b uniquement) : "Factorise" ou "Δ =" pour le P2 de fractionGauche. */
export function soumettreReponseSimplifierChamp1(
  etat: EtatSessionEquationRationnelle,
  reponse: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierChamp1", "soumettreReponseSimplifierChamp1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(p2DeFractionGauche(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierChamp2",
    scoreSimplifierChamp1Exercice: etat.aideSimplifierChamp1Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierChamp1(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierChamp1", "activerAideSimplifierChamp1");
  return { ...etat, aideSimplifierChamp1Utilisee: true };
}

/** Étape "simplifierChamp2" (cas 4a/4b uniquement) : racines du P2 de fractionGauche. */
export function soumettreReponseSimplifierChamp2(
  etat: EtatSessionEquationRationnelle,
  racines: [number, number],
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierChamp2", "soumettreReponseSimplifierChamp2");

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, p2DeFractionGauche(etat.exerciceCourant)),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: p2DeFractionGauche(etat.exerciceCourant).categorie === "cas_general" ? "simplifierFactorisation" : "simplifierFraction",
    scoreSimplifierChamp2Exercice: etat.aideSimplifierChamp2Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierChamp2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierChamp2(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierChamp2", "activerAideSimplifierChamp2");
  return { ...etat, aideSimplifierChamp2Utilisee: true };
}

/**
 * Étape "simplifierFactorisation" (cas 4a/4b, P2 de fractionGauche cas_general uniquement,
 * prompt-corrections-etat-actuel-et-duplication.md point 1) : a(x-x1)(x-x2) à partir des racines
 * trouvées à l'étape précédente — même step que le second passage (equationIsolee) et que
 * l'exercice 1.
 */
export function soumettreReponseSimplifierFactorisation(
  etat: EtatSessionEquationRationnelle,
  reponse: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierFactorisation", "soumettreReponseSimplifierFactorisation");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(p2DeFractionGauche(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplifierFraction",
    scoreSimplifierFactorisationExercice: etat.aideSimplifierFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierFactorisation(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierFactorisation", "activerAideSimplifierFactorisation");
  return { ...etat, aideSimplifierFactorisationUtilisee: true };
}

/**
 * Étape "simplifierFraction" (cas 4a/4b uniquement) : les 2 champs numérateur/dénominateur
 * simplifiés de `fractionGauche` — réutilise verifierSimplification telle quelle (exercice
 * "Simplifier"), déjà générique sur ExerciceSimplification (produit en croix + contrôle
 * structurel).
 */
export function soumettreReponseSimplifierFraction(
  etat: EtatSessionEquationRationnelle,
  numerateur: string,
  denominateur: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierFraction", "soumettreReponseSimplifierFraction");

  const fractionGauche = etat.exerciceCourant.fractionGauche;
  if (!fractionGauche) throw new Error("soumettreReponseSimplifierFraction : cet exercice n'a pas de fractionGauche");

  const etapeCourante = soumettreEtapeTentatives<[string, string]>(etat.etapeCourante, [numerateur, denominateur], {
    ...reglagesEtape(etat),
    verifier: ([n, d]) => verifierSimplification(fractionGauche, n, d),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "isolement",
    scoreSimplifierFractionExercice: etat.aideSimplifierFractionUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "simplifierFraction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplifierFraction(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifierFraction", "activerAideSimplifierFraction");
  return { ...etat, aideSimplifierFractionUtilisee: true };
}

/**
 * Étape "simplifier" (prompt-3-simplifier-et-isolement-flexible.md) : une réponse par fraction de
 * `exercice.fractionsSimplifiables`, dans le même ordre — vérifiée en un seul essai, tout ou rien
 * (même principe que le couple de racines de "champ2"). Réutilise verifierFractionSimplifiee
 * (produit en croix + contrôle structurel), déjà générique sur la fraction concernée.
 */
export function soumettreReponseSimplifier(
  etat: EtatSessionEquationRationnelle,
  reponses: Array<{ numerateur: string; denominateur: string }>,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "simplifier", "soumettreReponseSimplifier");

  const etapeCourante = soumettreEtapeTentatives<Array<{ numerateur: string; denominateur: string }>>(
    etat.etapeCourante,
    reponses,
    {
      ...reglagesEtape(etat),
      verifier: (r) =>
        r.length === etat.exerciceCourant.fractionsSimplifiables.length &&
        etat.exerciceCourant.fractionsSimplifiables.every((fraction, index) =>
          verifierFractionSimplifiee(fraction.numerateur, fraction.denominateur, r[index].numerateur, r[index].denominateur),
        ),
      revelerReponse: () => {},
    },
  );
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "isolement",
    scoreSimplifierExercice: etapeCourante.score,
  };
}

/** Étape "isolement" : éliminer le dénominateur, ramener à x²+bx+c=0 (même vérification que l'exercice 1). */
export function soumettreReponseIsolement(
  etat: EtatSessionEquationRationnelle,
  reponse: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "isolement", "soumettreReponseIsolement");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIsolement(etat.exerciceCourant.equationIsolee, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: !necessiteFactorisation(etat.exerciceCourant)
      ? "champ2"
      : necessiteReconnaissance(etat.exerciceCourant)
        ? "reconnaissance"
        : "champ1",
    scoreIsolementExercice: etat.aideIsolementUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "isolement" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideIsolement(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "isolement", "activerAideIsolement");
  return { ...etat, aideIsolementUtilisee: true };
}

/** Étape "reconnaissance" : choix de la catégorie parmi les 4, pour l'équation isolée. */
export function soumettreChoixCategorie(
  etat: EtatSessionEquationRationnelle,
  choix: Categorie,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "reconnaissance", "soumettreChoixCategorie");

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === etat.exerciceCourant.equationIsolee.categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ1",
    scoreReconnaissanceExercice: etapeCourante.score,
    categorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "champ1" : "Factorise l'équation" ou "Δ =" selon la catégorie retenue. */
export function soumettreReponseChamp1(
  etat: EtatSessionEquationRationnelle,
  reponse: string,
): EtatSessionEquationRationnelle {
  garderPhase(etat, "champ1", "soumettreReponseChamp1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(etat.exerciceCourant.equationIsolee, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ2",
    scoreChampPrincipalExercice: etat.aideChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "champ1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideChamp1(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "champ1", "activerAideChamp1");
  return { ...etat, aideChamp1Utilisee: true };
}

/**
 * Étape "champ2" : racines de l'équation isolée — clôture directement vers "racinesEtrangeres",
 * quelle que soit la catégorie. L'ancienne étape "factorisation" (second passage, a(x-x1)(x-x2)=0
 * à partir des racines déjà trouvées via Δ, cas_general uniquement) a été retirée
 * (promptgenerateur4equationRationnelle.md, point 4) : une fois Δ calculé et les racines
 * obtenues, refactoriser n'apporte plus rien — les solutions sont déjà connues. Retrait scopé au
 * second passage (equationIsolee) uniquement ; "simplifierFactorisation" (premier passage, P2 de
 * fractionGauche) reste inchangée.
 */
export function soumettreReponseChamp2(
  etat: EtatSessionEquationRationnelle,
  racines: [number, number],
): EtatSessionEquationRationnelle {
  garderPhase(etat, "champ2", "soumettreReponseChamp2");

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, etat.exerciceCourant.equationIsolee),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "racinesEtrangeres",
    scoreRacinesExercice: etat.aideChamp2Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "champ2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideChamp2(etat: EtatSessionEquationRationnelle): EtatSessionEquationRationnelle {
  garderPhase(etat, "champ2", "activerAideChamp2");
  return { ...etat, aideChamp2Utilisee: true };
}

/**
 * Étape "racinesEtrangeres" : finale, clôture l'exercice. Générique sur `exercice.ce` — pour la
 * construction un_denominateur, aucune racine ne viole jamais la CE (les deux sont toujours
 * valides) ; pour deux_denominateurs, x=p est toujours une racine étrangère systématique à
 * rejeter. Le code ne distingue jamais les deux cas explicitement, il compare toujours chaque
 * racine à l'ensemble complet des CE. `reponses` porte une entrée par racine **distincte**
 * (`racinesDistinctes`, verificationEquationRationnelle.ts — prompt-5-deduplication-racines-etrangeres.md) :
 * une seule pour une racine unique ou double (chemin linéaire, produit_remarquable), deux pour
 * deux racines réellement différentes.
 */
export function soumettreReponseRacinesEtrangeres(
  etat: EtatSessionEquationRationnelle,
  reponses: boolean[],
): EtatSessionEquationRationnelle {
  garderPhase(etat, "racinesEtrangeres", "soumettreReponseRacinesEtrangeres");

  const etapeCourante = soumettreEtapeTentatives<boolean[]>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    verifier: (r) =>
      verifierRacinesEtrangeres(etat.exerciceCourant.equationIsolee.solution.racines, r, etat.exerciceCourant.ce),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceEquationRationnelle = {
    categorie: etat.exerciceCourant.equationIsolee.categorie,
    scoreCE: etat.scoreCEExercice as number,
    aideCeUtilisee: etat.aideCeUtilisee,
    scoreSimplifier: etat.scoreSimplifierExercice,
    scoreSimplifierReduction: etat.scoreSimplifierReductionExercice,
    aideSimplifierReductionUtilisee: etat.aideSimplifierReductionUtilisee,
    scoreSimplifierReconnaissance: etat.scoreSimplifierReconnaissanceExercice,
    simplifierCategorieRevelee: etat.simplifierCategorieRevelee,
    scoreSimplifierChamp1: etat.scoreSimplifierChamp1Exercice,
    aideSimplifierChamp1Utilisee: etat.aideSimplifierChamp1Utilisee,
    scoreSimplifierChamp2: etat.scoreSimplifierChamp2Exercice,
    aideSimplifierChamp2Utilisee: etat.aideSimplifierChamp2Utilisee,
    scoreSimplifierFactorisation: etat.scoreSimplifierFactorisationExercice,
    aideSimplifierFactorisationUtilisee: etat.aideSimplifierFactorisationUtilisee,
    scoreSimplifierFraction: etat.scoreSimplifierFractionExercice,
    aideSimplifierFractionUtilisee: etat.aideSimplifierFractionUtilisee,
    scoreIsolement: etat.scoreIsolementExercice as number,
    aideIsolementUtilisee: etat.aideIsolementUtilisee,
    scoreReconnaissance: etat.scoreReconnaissanceExercice,
    categorieRevelee: etat.categorieRevelee,
    scoreChampPrincipal: etat.scoreChampPrincipalExercice,
    aideChamp1Utilisee: etat.aideChamp1Utilisee,
    scoreRacines: etat.scoreRacinesExercice as number,
    aideChamp2Utilisee: etat.aideChamp2Utilisee,
    scoreRacinesEtrangeres: etapeCourante.score as number,
  };

  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    phase: "ce",
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
  };
}
