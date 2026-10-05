import { useState } from "react";
import { Katex } from "../components/Katex";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import { BoutonAide } from "./BoutonAide";

const LETTRES = ["A", "B", "C", "D", "E", "F"] as const;

const LARGEUR_MIN = 200;
const LARGEUR_MAX = 360;
const LARGEUR_PAR_DEFAUT = 280;

/** Même forme que `AideAvecLatex` exportée par chaque `ui6e/formatXxx.ts` concerné — jamais
 * importée d'un module précis (généricité du composant, voir en-tête ci-dessous), la compatibilité
 * structurelle TypeScript suffit à accepter n'importe laquelle des 5 sans conversion. */
interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  /** Nombre d'options du QCM (toujours 4 à ce jour, `candidats.length` de l'exercice — jamais figé
   * en dur ici pour rester généraliste). */
  nombreOptions: number;
  /** Rendu du graphique de l'option `index` (0-based) — fourni par l'appelant, qui connaît seul le
   * contrat `core6e/` de son générateur (`candidats`/`viewBox`). Reçoit `largeur`/`hauteur`,
   * mesurées UNE SEULE FOIS ici (`useLargeurConteneur`) et identiques pour les 4 options — jamais
   * mesurées indépendamment par option (garantirait un début de dérive de taille entre elles). */
  renderGraphique: (index: number, largeur: number, hauteur: number) => React.ReactNode;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number) => void;
}

/**
 * Couche présentation (6e) — corps commun de l'écran "QCM à options graphiques" (4 candidats déjà
 * mélangés à la génération par la Couche A, `indexCorrect` pointant vers celui mathématiquement
 * correct — ce composant ne connaît PAS `indexCorrect`, la vérification reste dans le
 * `moteur6e/sessionXxx.ts` de l'appelant, exactement comme avant cette refonte). Partagé par
 * `EtapeSelectionGraphiqueCyclo` (6gen5), `EtapeSelectionGraphiqueDeriveeExpo` (6gen8),
 * `EtapeSelectionGraphiqueEtudeFonction` (6gen11), `EtapeSelectionGraphiqueDeriveeLogarithme`
 * (6gen20) et `EtapeSelectionGraphiqueEtudeFonctionLog` (6gen21) — les 5 réutilisations trouvées du
 * même mécanisme "4 graphiques Mafs même échelle, 1 bon + 3 distracteurs, ordre randomisé à la
 * génération" sur ce chantier (audit exhaustif avant refonte, voir le rapport de session).
 *
 * **Refonte "graphiques non cliquables"** (remplace l'ancienne version où chaque graphique était
 * lui-même un `<button>` — `.options-grid-graphs`/`.graphe-option-btn`, retirés d'`App.css`) :
 * - Les 4 graphiques sont désormais de simples illustrations, lettrées A→D (`renderGraphique`),
 *   empilées verticalement PLEINE LARGEUR (`.graphes-qcm-liste`, jamais de grille multi-colonnes —
 *   à dessein, contrairement à l'ancienne convention 2 colonnes de `.options-grid-graphs`, qui
 *   n'a plus lieu d'être une fois les graphiques non interactifs). La lettre attribuée à chaque
 *   graphique EST sa position dans `candidats` (0→A, 1→B, ...), déjà randomisée à la génération —
 *   aucun nouveau mélange ici, seule la représentation (lettre plutôt que bouton cliquable) change.
 * - En dessous, 4 boutons de choix texte SÉPARÉS "A"/"B"/"C"/"D", `.options-grid-compact` (grille 2
 *   colonnes, convention standard boutons de choix du projet) — un clic ne fait que sélectionner
 *   (`.btn.toggle-active`), jamais valider directement. Bouton "Valider" obligatoire, inchangé.
 * - Feedback après Valider : uniquement le bouton lettre sélectionné passe en `.is-erronee` (rouge)
 *   si faux — même principe que tout QCM texte du chantier (`EtapeQcmComplexesAvances.tsx`,
 *   `6gen42`). Aucun feedback vert visible en pratique : comme sur CE même QCM texte de référence,
 *   une réponse correcte fait avancer la phase IMMÉDIATEMENT (`avancerPhase`/`soumettreEtapeTentatives`
 *   côté `moteur6e/`), ce composant est donc démonté avant qu'un état "vert" n'ait la moindre chance
 *   de s'afficher — comportement hérité du mécanisme de notation par tentatives, pas une régression
 *   de cette refonte (l'ancienne version graphique-cliquable ne montrait pas non plus de vert).
 * - Jamais de mise en évidence sur les graphiques eux-mêmes (ni bon en vert, ni mauvais en rouge) :
 *   toute l'information de correction vit sur les boutons lettre, les graphiques restent neutres.
 *
 * Largeur/hauteur des graphiques mesurées une seule fois ici (`useLargeurConteneur`, même hook que
 * `MafsGraphTransformation.tsx` etc., transversal 3 chantiers) et bornées `[200;360]` (défaut 280
 * avant la première mesure) — carrées (hauteur = largeur) comme l'étaient les anciennes vignettes
 * 150×150, simplement agrandies : `preserveAspectRatio={false}` étant déjà actif sur chaque
 * graphique (obligatoire, voir CLAUDE.md), le choix du ratio largeur/hauteur de la CARTE est
 * purement esthétique et n'affecte jamais la fidélité mathématique du tracé.
 */
export function EtapeSelectionGraphiqueQCM({
  nombreOptions,
  renderGraphique,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
}: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur;

  function valider() {
    if (choix === null) return;
    onValider(choix);
  }

  return (
    <div>
      <div className="graphes-qcm-liste" ref={wrapperRef}>
        {Array.from({ length: nombreOptions }, (_, index) => (
          <div className="graphe-qcm-carte" key={index}>
            <p className="graphe-qcm-label">{LETTRES[index]}</p>
            {renderGraphique(index, largeur, hauteur)}
          </div>
        ))}
      </div>

      <div className="options-grid-compact">
        {LETTRES.slice(0, nombreOptions).map((lettre, index) => (
          <button
            key={lettre}
            type="button"
            className={`btn${choix === index ? " toggle-active" : ""}${montrerErreurs && choix === index ? " is-erronee" : ""}`}
            onClick={() => setChoix(index)}
          >
            {lettre}
          </button>
        ))}
      </div>

      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
        Valider
      </button>

      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}

      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
