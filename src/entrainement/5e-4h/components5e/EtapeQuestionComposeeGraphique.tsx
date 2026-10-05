import { useState } from "react";
import type { ReactNode } from "react";
import type { QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import type { ReponseQuestionComposeeGraphique } from "../moteur5e/verificationComposeeGraphique";
import { CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE, consigneQuestion, labelChampResultat, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatComposeeGraphique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { BoutonAide } from "./BoutonAide";

interface Props {
  question: QuestionComposeeGraphique;
  /** Bloc "données" persistant (`PaireGraphesComposeeGraphique`, les 2 courbes) — rendu APRÈS la
   * consigne générale (A.2/A.9), la question spécifique venant ENSUITE (E.3 : "sous le deuxième
   * graphique, après les deux graphiques"). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQuestionComposeeGraphique) => void;
  /** Statut à 3 valeurs (A.1), calculé côté présentation pour différencier le message affiché après
   * une tentative échouée — optionnel, un appelant qui ne le fournit pas garde le message générique
   * historique. */
  diagnostiquer?: (reponse: ReponseQuestionComposeeGraphique) => StatutVerification;
}

/**
 * Un écran = une question, l'existence et la valeur du résultat final f(g(a)) — texte libre OU
 * "n'existe pas" (bascule dédiée plutôt qu'un champ qu'on laisserait vide). La valeur intermédiaire
 * g(a) n'est plus un champ soumis (retiré, retour utilisateur direct au-delà de la spec d'origine) :
 * l'élève la calcule mentalement, guidé par l'aide si besoin (`pointRevele`, révélé sur le graphe de
 * la fonction interne). Le champ résultat accepte tout nombre réel — négatifs et décimaux compris,
 * aucun clavier restreint imposé (E.4) — jamais un filtrage de caractères, la validation se fait
 * entièrement à la soumission (`diagnostiquer`).
 */
export function EtapeQuestionComposeeGraphique({ question, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  // `null` tant que l'élève n'a pas encore cliqué — aucun choix pré-sélectionné au début de chaque
  // question (retour utilisateur direct : "Existe" restait sélectionné par défaut).
  const [resultatExiste, setResultatExiste] = useState<boolean | null>(null);
  const [resultatValeur, setResultatValeur] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  const complet = resultatExiste !== null && (!resultatExiste || resultatValeur.trim() !== "");
  /** Recalculé à chaque rendu depuis la saisie actuelle (jamais depuis `dernierStatut`, figé à la
   * dernière soumission) — même convention que le pattern de référence 4e (A.2). Champ absent tant
   * que "Existe" n'est pas choisi, donc jamais erroné avant cet état. */
  const resultatValeurErronee =
    montrerErreurs &&
    resultatExiste === true &&
    diagnostiquer !== undefined &&
    diagnostiquer({ resultatExiste: true, resultatValeur }) !== "correct";

  function valider() {
    if (resultatExiste === null || !complet) return;
    const reponse: ReponseQuestionComposeeGraphique = {
      resultatExiste,
      resultatValeur: resultatExiste ? resultatValeur : null,
    };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE}</p>
      {donnees}
      <p className="prompt-text">{consigneQuestion(question)}</p>
      <div className="options-grid">
        <button type="button" className={`btn ${resultatExiste === false ? "toggle-active" : ""}`} onClick={() => setResultatExiste(false)}>
          N'existe pas
        </button>
        <button type="button" className={`btn ${resultatExiste === true ? "toggle-active" : ""}`} onClick={() => setResultatExiste(true)}>
          Existe
        </button>
      </div>
      {resultatExiste === true && (
        <div className="field-row contenu-conditionnel">
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">{labelChampResultat(question)}</label>
            <input
              type="text"
              className={`text-input${resultatValeurErronee ? " is-erronee" : ""}`}
              value={resultatValeur}
              onChange={(e) => setResultatValeur(e.target.value)}
            />
          </div>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(question)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2(question)}</p>}
        </div>
      )}
    </div>
  );
}
