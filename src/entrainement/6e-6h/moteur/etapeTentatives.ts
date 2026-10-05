/**
 * Couche B — brique générique réutilisable pour toute étape notée par tentatives.
 * Ne connaît rien du contenu vérifié (catégorie, forme factorisée, Δ, racines...) : reçoit
 * uniquement un callback de vérification et un callback de révélation fournis par l'appelant,
 * et gère exclusivement le comptage des tentatives, la pénalité et le score.
 *
 * Formule : réussite après k échecs → score = pointsDeBase - k*(pointsDeBase/tentativesMax)
 * (pointsDeBase plein si penaliteActivee=false). Échec après tentativesMax tentatives → score
 * exactement 0 et révélation, que la pénalité par tentative soit activée ou non : ce n'est pas
 * une pénalité, c'est l'absence de réponse correcte.
 */

export interface ReglagesEtape {
  pointsDeBase: number;
  tentativesMax: number;
  penaliteActivee: boolean;
}

export interface ConfigEtapeTentatives<TReponse> extends ReglagesEtape {
  verifier: (reponse: TReponse) => boolean;
  revelerReponse: () => void;
}

export interface EtatEtapeTentatives {
  tentativesUtilisees: number;
  terminee: boolean;
  reussie: boolean;
  revelee: boolean;
  /** null tant que l'étape n'est pas terminée */
  score: number | null;
}

export function demarrerEtapeTentatives(): EtatEtapeTentatives {
  return { tentativesUtilisees: 0, terminee: false, reussie: false, revelee: false, score: null };
}

export function soumettreEtapeTentatives<TReponse>(
  etat: EtatEtapeTentatives,
  reponse: TReponse,
  config: ConfigEtapeTentatives<TReponse>,
): EtatEtapeTentatives {
  if (etat.terminee) {
    throw new Error("soumettreEtapeTentatives : cette étape est déjà terminée");
  }

  if (config.verifier(reponse)) {
    const penalitePourTentative = config.pointsDeBase / config.tentativesMax;
    const score = config.penaliteActivee
      ? Math.max(0, config.pointsDeBase - etat.tentativesUtilisees * penalitePourTentative)
      : config.pointsDeBase;
    return { tentativesUtilisees: etat.tentativesUtilisees, terminee: true, reussie: true, revelee: false, score };
  }

  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  if (tentativesUtilisees >= config.tentativesMax) {
    config.revelerReponse();
    return { tentativesUtilisees, terminee: true, reussie: false, revelee: true, score: 0 };
  }
  return { tentativesUtilisees, terminee: false, reussie: false, revelee: false, score: null };
}
