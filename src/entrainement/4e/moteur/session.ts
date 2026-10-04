import type { Categorie, Exercice, GenerateurExercice } from "../core/generateur.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatSession, Phase, ReponseZeros, ResultatExercice } from "./types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { exerciceSimplifie, necessiteSimplification } from "./simplificationEquation";
import { verifierChampPrincipal, verifierIsolement, verifierSimplification, verifierZeros } from "./verification";

const POINTS_DE_BASE = 100;

/**
 * "mise_en_evidence_generalisee" (famille 5) ne passe jamais par la reconnaissance de méthode :
 * l'élève voit l'énoncé et va directement au champ de factorisation.
 */
function necessiteReconnaissance(exercice: Exercice): boolean {
  return exercice.categorie !== "mise_en_evidence_generalisee";
}

/**
 * L'étape d'isolement n'a de sens que si l'énoncé affiché n'est pas déjà littéralement
 * "... = 0" (prompt-generateurs123groupe.md, point 1 — corrige un bug où cette étape était liée
 * à `necessiteReconnaissance`, donc jamais offerte à la famille 5 "mise_en_evidence_generalisee"
 * même quand sa forme d'affichage `carre_egale_expression`, ex. `(x-2)^2=6x-12`, n'est justement
 * PAS déjà égalée à 0). Seules deux formes d'affichage sont déjà sous cette forme : `canonique`
 * (les 4 premières familles) et `composee` (famille 5, `(x+p)^2 ± k(x+p) = 0` — le second membre
 * y est déjà 0, seul un travail de factorisation reste à faire, pas d'isolement). Exception
 * historique conservée : `mise_en_evidence` fusionne toujours l'isolement avec l'étape de
 * factorisation (l'élève y travaille directement depuis l'énoncé de surface).
 */
function dejaEgaleAZero(exercice: Exercice): boolean {
  return exercice.formeAffichage === "canonique" || exercice.formeAffichage === "composee";
}

function necessiteIsolement(exercice: Exercice): boolean {
  return !dejaEgaleAZero(exercice) && exercice.categorie !== "mise_en_evidence";
}

/**
 * "developper" (gen1 "regroupe avant de développer", prompt du 27/09) : cas_general et
 * produit_remarquable ont besoin de a,b,c explicites (Δ / carré parfait c=(b/2)²) — invisibles
 * dans un produit x(x+b) laissé groupé mais non développé par l'isolement seul (voir
 * ui/formatEquation.ts::formatEquationIsoleeNonDeveloppee). Uniquement quand la forme de surface
 * garde effectivement une structure à développer (produit_egale_constante, seule forme non déjà
 * "ax²+bx" ou "ax²" brute pour ces deux catégories) — isolee_constante/isolee_carre n'ont rien à
 * développer, un second écran y serait redondant avec l'isolement qui vient de produire la même
 * chaîne.
 */
function necessiteDeveloppement(exercice: Exercice): boolean {
  return (
    (exercice.categorie === "cas_general" || exercice.categorie === "produit_remarquable") &&
    exercice.formeAffichage === "produit_egale_constante"
  );
}

/**
 * Étape suivant l'isolement (ou, s'il est absent, première étape de l'exercice) : la
 * reconnaissance sauf pour la famille 5, qui n'en a jamais — comportement inchangé, mais
 * désormais atteignable aussi bien directement (formeAffichage déjà =0) qu'après un isolement
 * (formeAffichage pas encore =0), les deux cas devant transitionner vers "champ1" pour cette
 * famille.
 */
function phaseApresIsolement(exercice: Exercice): Phase {
  return necessiteReconnaissance(exercice) ? "reconnaissance" : "champ1";
}

/** Étape suivant la simplification (ou, si absente, première étape de l'exercice). */
function phaseApresSimplification(exercice: Exercice): Phase {
  if (necessiteIsolement(exercice)) return "isolement";
  return phaseApresIsolement(exercice);
}

/**
 * Étape "simplification" (nouvelle) : précède désormais tout le reste quand
 * pgcd(|a|,|b|,|c|) > 1 (équation affichée avec un facteur commun, ex. 2x²-10x=0) — voir
 * simplificationEquation.ts. N'a lieu que pour les 4 catégories rationnelles (a=randomInt(1,4)) ;
 * jamais pour mise_en_evidence_generalisee ni les variantes irrationnelles (a=1 fixe dans les deux cas).
 */
function phaseInitiale(exercice: Exercice): Phase {
  if (necessiteSimplification(exercice)) return "simplification";
  return phaseApresSimplification(exercice);
}

export function demarrerSession(reglages: ReglagesSession, generateur: GenerateurExercice): EtatSession {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    exerciceOriginal: exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    scoreSimplificationExercice: null,
    scoreIsolementExercice: null,
    isolementRevele: false,
    scoreDevelopperExercice: null,
    scoreReconnaissanceExercice: null,
    scoreChampPrincipalExercice: null,
    categorieRevelee: false,
    aideSimplificationUtilisee: false,
    aideIsolementUtilisee: false,
    aideDevelopperUtilisee: false,
    aideChamp1Utilisee: false,
    aideZerosUtilisee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSession): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/**
 * Étape "simplification" : ramener l'équation affichée à pgcd(|a|,|b|,|c|)=1. N'existe que si
 * necessiteSimplification(exercice) — voir phaseInitiale. Une fois confirmée, l'exercice courant
 * lui-même est remplacé par sa version réduite (exerciceSimplifie) : "tout le reste de l'écran se
 * fait sur base de la forme simplifiée" — isolement/reconnaissance/champ1/zéros travaillent alors
 * tous sur les coefficients réduits.
 */
export function soumettreReponseSimplification(etat: EtatSession, reponse: string): EtatSession {
  if (etat.terminee || etat.phase !== "simplification") {
    throw new Error("soumettreReponseSimplification : la session n'est pas à l'étape de simplification");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSimplification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const exerciceCourant = exerciceSimplifie(etat.exerciceCourant);

  return {
    ...etat,
    exerciceCourant,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresSimplification(exerciceCourant),
    scoreSimplificationExercice: etat.aideSimplificationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/**
 * Active le bouton "Aide" de l'étape "simplification" — révélation à sens unique (jamais de
 * retour à false pour cet exercice), applique ×0,5 au score final de cette étape dans
 * soumettreReponseSimplification, quel que soit le nombre de tentatives déjà utilisées ou à venir
 * (même principe que activerAideGrilleSolution, sessionSignesProduit.ts).
 */
export function activerAideSimplification(etat: EtatSession): EtatSession {
  if (etat.terminee || etat.phase !== "simplification") {
    throw new Error("activerAideSimplification : la session n'est pas à l'étape de simplification");
  }
  return { ...etat, aideSimplificationUtilisee: true };
}

/**
 * Étape "isolement" : ramener l'énoncé de surface (isolée/produit=constante/carre_egale_expression)
 * à ax²+bx+c=0. N'existe que si necessiteIsolement(exercice) — voir phaseInitiale.
 */
export function soumettreReponseIsolement(etat: EtatSession, reponse: string): EtatSession {
  if (etat.terminee || etat.phase !== "isolement") {
    throw new Error("soumettreReponseIsolement : la session n'est pas à l'étape d'isolement");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIsolement(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: necessiteDeveloppement(etat.exerciceCourant) ? "developper" : phaseApresIsolement(etat.exerciceCourant),
    scoreIsolementExercice: etat.aideIsolementUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    isolementRevele: etapeCourante.revelee,
  };
}

/**
 * Active le bouton "Aide" de l'étape "isolement" — même principe que activerAideSimplification
 * ci-dessus.
 */
export function activerAideIsolement(etat: EtatSession): EtatSession {
  if (etat.terminee || etat.phase !== "isolement") {
    throw new Error("activerAideIsolement : la session n'est pas à l'étape d'isolement");
  }
  return { ...etat, aideIsolementUtilisee: true };
}

/**
 * Étape "developper" (voir necessiteDeveloppement) : ramener l'équation groupée mais non
 * développée par l'isolement (ex. "x(x+4)+4=0") à ax²+bx+c=0 — même vérification que
 * "isolement" (verifierIsolement, permissive : accepte toute expression algébriquement
 * équivalente à enonce, développée ou non), seule la consigne/l'état actuel affichés diffèrent.
 */
export function soumettreReponseDevelopper(etat: EtatSession, reponse: string): EtatSession {
  if (etat.terminee || etat.phase !== "developper") {
    throw new Error("soumettreReponseDevelopper : la session n'est pas à l'étape de développement");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIsolement(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresIsolement(etat.exerciceCourant),
    scoreDevelopperExercice: etat.aideDevelopperUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/**
 * Active le bouton "Aide" de l'étape "developper" — même principe que activerAideSimplification
 * ci-dessus.
 */
export function activerAideDevelopper(etat: EtatSession): EtatSession {
  if (etat.terminee || etat.phase !== "developper") {
    throw new Error("activerAideDevelopper : la session n'est pas à l'étape de développement");
  }
  return { ...etat, aideDevelopperUtilisee: true };
}

/** Étape "reconnaissance" : choix de la catégorie parmi les 4. */
export function soumettreChoixCategorie(etat: EtatSession, choix: Categorie): EtatSession {
  if (etat.terminee || etat.phase !== "reconnaissance") {
    throw new Error("soumettreChoixCategorie : la session n'est pas à l'étape de reconnaissance");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === etat.exerciceCourant.categorie,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ1",
    scoreReconnaissanceExercice: etapeCourante.score,
    categorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "champ1" : "Factorise l'équation" ou "Δ =" selon la catégorie retenue à l'étape 1. */
export function soumettreReponseChamp1(etat: EtatSession, reponse: string): EtatSession {
  if (etat.terminee || etat.phase !== "champ1") {
    throw new Error("soumettreReponseChamp1 : la session n'est pas à l'étape du champ 1");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "champ2",
    scoreChampPrincipalExercice: etat.aideChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/**
 * Active le bouton "Aide" de l'étape "champ1" — même principe que activerAideSimplification
 * ci-dessus.
 */
export function activerAideChamp1(etat: EtatSession): EtatSession {
  if (etat.terminee || etat.phase !== "champ1") {
    throw new Error("activerAideChamp1 : la session n'est pas à l'étape du champ 1");
  }
  return { ...etat, aideChamp1Utilisee: true };
}

/** Clôture l'exercice en cours (résultat déjà construit) et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(etat: EtatSession, resultat: ResultatExercice): EtatSession {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const prochainExercice = etat.generateur();

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: prochainExercice,
    exerciceOriginal: prochainExercice,
    phase: phaseInitiale(prochainExercice),
    etapeCourante: demarrerEtapeTentatives(),
    scoreSimplificationExercice: null,
    scoreIsolementExercice: null,
    isolementRevele: false,
    scoreDevelopperExercice: null,
    scoreReconnaissanceExercice: null,
    scoreChampPrincipalExercice: null,
    categorieRevelee: false,
    aideSimplificationUtilisee: false,
    aideIsolementUtilisee: false,
    aideDevelopperUtilisee: false,
    aideChamp1Utilisee: false,
    aideZerosUtilisee: false,
  };
}

/**
 * Étape "champ2" ("Zéros" — prompt-generateurs123groupe.md, points 3 et 4) : compare toujours à la
 * vraie solution de l'exercice (exercice.solution.racines), jamais à la réponse — juste ou fausse
 * — donnée au champ 1. Clôture systématiquement l'exercice, y compris pour `cas_general` :
 * l'ancienne étape "Factorisation" (après Δ et les racines) a été retirée spécifiquement de ce
 * générateur — elle n'a pas lieu d'être ici, cette catégorie ne débouchant pas naturellement sur
 * une factorisation simple une fois les zéros déjà trouvés par la formule. Les 4 autres exercices
 * qui partagent ce même motif ("Factorisation après Δ", voir CLAUDE.md) ne sont pas concernés par
 * ce retrait, propre à ce seul générateur.
 */
export function soumettreReponseChamp2(etat: EtatSession, reponse: ReponseZeros): EtatSession {
  if (etat.terminee || etat.phase !== "champ2") {
    throw new Error("soumettreReponseChamp2 : la session n'est pas à l'étape des zéros");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseZeros>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierZeros(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const resultat: ResultatExercice = {
    categorie: etat.exerciceCourant.categorie,
    scoreSimplification: etat.scoreSimplificationExercice,
    scoreIsolement: etat.scoreIsolementExercice,
    scoreDevelopper: etat.scoreDevelopperExercice,
    scoreReconnaissance: etat.scoreReconnaissanceExercice,
    scoreChampPrincipal: etat.scoreChampPrincipalExercice as number,
    scoreZeros: etat.aideZerosUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number),
    categorieRevelee: etat.categorieRevelee,
  };

  return cloturerExerciceOuSuivant(etat, resultat);
}

/**
 * Active le bouton "Aide" de l'étape "Zéros" (phase "champ2") — même principe que
 * activerAideSimplification ci-dessus.
 */
export function activerAideZeros(etat: EtatSession): EtatSession {
  if (etat.terminee || etat.phase !== "champ2") {
    throw new Error("activerAideZeros : la session n'est pas à l'étape des zéros");
  }
  return { ...etat, aideZerosUtilisee: true };
}
