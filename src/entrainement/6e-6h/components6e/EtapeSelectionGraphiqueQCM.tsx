import { useState } from "react";
import { Katex } from "../components/Katex";
import { useLargeurConteneur } from "../components/useLargeurConteneur";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

const LETTRES = ["A", "B", "C", "D", "E", "F"] as const;

const LARGEUR_MIN = 200;
const LARGEUR_MAX = 360;
const LARGEUR_PAR_DEFAUT = 280;
/** Écart entre 2 cartes quand elles tiennent sur 2 colonnes. */
const ECART_COLONNES = 12;
/** Hauteur = 80 % de la largeur (au lieu d'un carré) : 4 graphiques empilés sur téléphone restaient
 * trop hauts pour garder le choix à portée de vue. `preserveAspectRatio={false}` étant actif sur
 * chaque graphique, ce ratio reste purement esthétique. */
const RATIO_HAUTEUR = 0.8;

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
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
 * - Sous CHAQUE graphique, son propre bouton de choix « Graphique A »… (`.options-grid-compact`,
 *   convention standard des boutons de choix) — le choix reste collé au graphique qu'il désigne
 *   (sur téléphone, une grille de lettres placée sous les 4 graphiques empilés obligeait à
 *   défiler loin du graphique choisi). Un clic ne fait que sélectionner (`.btn.toggle-active`),
 *   jamais valider directement. Bouton "Valider" obligatoire, inchangé. Les cartes passent sur 2
 *   colonnes dès que la largeur le permet (2 × `LARGEUR_MIN`).
 * - Feedback après Valider : uniquement le bouton du choix SOUMIS passe en `.is-erronee` (rouge)
 *   si faux — jamais un nouveau choix pas encore validé — même principe que tout QCM texte du chantier (`EtapeQcmComplexesAvances.tsx`,
 *   `6gen42`). Aucun feedback vert visible en pratique : comme sur CE même QCM texte de référence,
 *   une réponse correcte fait avancer la phase IMMÉDIATEMENT (`avancerPhase`/`soumettreEtapeTentatives`
 *   côté `moteur6e/`), ce composant est donc démonté avant qu'un état "vert" n'ait la moindre chance
 *   de s'afficher — comportement hérité du mécanisme de notation par tentatives, pas une régression
 *   de cette refonte (l'ancienne version graphique-cliquable ne montrait pas non plus de vert).
 * - Jamais de mise en évidence sur les graphiques eux-mêmes (ni bon en vert, ni mauvais en rouge) :
 *   toute l'information de correction vit sur les boutons lettre, les graphiques restent neutres.
 *
 * Largeur/hauteur des graphiques mesurées une seule fois ici (`useLargeurConteneur`, même hook que
 * `MafsGraphTransformation.tsx` etc., transversal 3 chantiers) : largeur de la colonne (1 ou 2
 * colonnes), plafonnée à 360 (défaut 280 avant la première mesure), hauteur = 80 % de la largeur
 * (`RATIO_HAUTEUR`) : `preserveAspectRatio={false}` étant déjà actif sur chaque
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
  validation,
}: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  /** Dernier choix SOUMIS — seul lui passe en rouge, jamais un nouveau choix pas encore validé. */
  const [choixSoumis, setChoixSoumis] = useState<number | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const refuse = (montrerErreurs || validation?.revele === true) && choixSoumis !== null;
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeurConteneur = largeurMesuree || LARGEUR_PAR_DEFAUT;
  const colonnes = largeurConteneur >= 2 * LARGEUR_MIN + ECART_COLONNES ? 2 : 1;
  const largeurColonne = (largeurConteneur - ECART_COLONNES * (colonnes - 1)) / colonnes;
  // Jamais plus large que la colonne réelle (pas de débordement sur un écran étroit), plafonnée à LARGEUR_MAX.
  const largeur = Math.round(Math.min(LARGEUR_MAX, largeurColonne));
  const hauteur = Math.round(largeur * RATIO_HAUTEUR);

  function valider() {
    if (choix === null) return;
    setChoixSoumis(choix);
    onValider(choix);
  }

  return (
    <div>
      <div
        className="graphes-qcm-liste"
        ref={wrapperRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))`, gap: ECART_COLONNES }}
      >
        {Array.from({ length: nombreOptions }, (_, index) => (
          <div className="graphe-qcm-carte" key={index}>
            <p className="graphe-qcm-label">{LETTRES[index]}</p>
            {renderGraphique(index, largeur, hauteur)}
            <div className="options-grid-compact" style={{ gridTemplateColumns: "1fr", marginTop: 6 }}>
              <button
                type="button"
                className={`btn${choix === index ? " toggle-active" : ""}${refuse && choix === index && choixSoumis === index ? " is-erronee" : ""}`}
                aria-pressed={choix === index}
                disabled={!!validation}
                onClick={() => setChoix(index)}
              >
                Graphique {LETTRES[index]}
              </button>
            </div>
          </div>
        ))}
      </div>

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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={choix === null} onClick={valider}>
          Valider
        </button>

        {montrerErreurs && (
          <p className="alert-error" role="alert">
            Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}

    </div>
  );
}
