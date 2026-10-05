import type { ReactNode } from "react";
import { useState } from "react";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";

const LETTRES = ["A", "B", "C", "D", "E", "F", "G", "H"];

/** Réponse possible pour une ligne — voir `moteur5e/verificationAssociation.ts` pour `"aucune"`. */
type ChoixLigne = number | "aucune" | null;

interface Props {
  nombreItems: number;
  /** Rendu riche de l'élément numéroté `index` (0-based) — graphique Mafs, KaTeX, ou texte. */
  renderItem: (index: number) => ReactNode;
  /** Rendu riche du candidat lettré `index` (0-based). */
  renderCandidat: (index: number) => ReactNode;
  consigneGenerale: string;
  consigne: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (choixParItem: ChoixLigne[]) => void;
  /** Diagnostic PAR LIGNE — un booléen par élément numéroté, jamais un seul global. */
  diagnostiquer?: (choixParItem: ChoixLigne[]) => boolean[];
  texteAideNiveau1: string;
  texteAideNiveau2?: string;
  /** Option additionnelle ajoutée à CHAQUE menu déroulant, en plus des lettres — ex. "f' n'existe
   * pas ici" (5gen25, famille A avancée). Absente par défaut, comportement historique inchangé
   * pour toute réutilisation future de ce composant sans cette option. */
  libelleOptionSupplementaire?: string;
}

/**
 * Composant générique de matching "numéro ↔ lettre" — PAS de glisser-déposer (fragile sur tactile,
 * conflits de scroll, comportement inconsistant selon navigateur mobile). Les éléments numérotés
 * gardent leur rendu riche affiché normalement sur la page ; sous chaque élément numéroté, un
 * `<select>` natif liste les lettres disponibles (un `<option>` ne peut afficher que du texte brut —
 * impossible d'y faire rendre du KaTeX/un graphique, d'où le rendu riche affiché à côté, jamais dans
 * le menu). Vérification PAR LIGNE, chaque dropdown surligné en rouge indépendamment après une
 * tentative ratée — même convention que tout champ libre de la plateforme. Conçu pour être réutilisé
 * tel quel par de futurs générateurs nécessitant un matching (même esprit que
 * `EnsembleReelGuideBuilder`, réutilisé partout où une saisie d'ensemble de ℝ est nécessaire).
 */
export function ComposantAssociation({
  nombreItems,
  renderItem,
  renderCandidat,
  consigneGenerale,
  consigne,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  texteAideNiveau1,
  texteAideNiveau2,
  libelleOptionSupplementaire,
}: Props) {
  const [choix, setChoix] = useState<ChoixLigne[]>(() => Array(nombreItems).fill(null));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = choix.every((c) => c !== null);
  const correction = montrerErreurs && diagnostiquer && complet ? diagnostiquer(choix) : null;
  const lettres = LETTRES.slice(0, nombreItems);

  function modifier(i: number, valeur: string) {
    const v: ChoixLigne = valeur === "aucune" ? "aucune" : Number(valeur);
    setChoix((arr) => arr.map((c, j) => (j === i ? v : c)));
  }
  function valider() {
    if (!complet) return;
    onValider(choix);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="association-candidats-grid">
        {lettres.map((lettre, j) => (
          <div key={lettre} className="association-candidat">
            <p className="field-label field-label-minuscule">{lettre}</p>
            {renderCandidat(j)}
          </div>
        ))}
      </div>
      <p className="prompt-text">{consigne}</p>
      {Array.from({ length: nombreItems }, (_, i) => (
        <div key={i} className="association-item-ligne">
          <div className="association-item-contenu">
            <p className="field-label field-label-minuscule">{i + 1}</p>
            {renderItem(i)}
          </div>
          <select
            className={`ce-select${correction && correction[i] === false ? " is-erronee" : ""}`}
            aria-label={`Lettre correspondant à l'élément ${i + 1}`}
            value={choix[i] ?? ""}
            onChange={(e) => modifier(i, e.target.value)}
          >
            <option value="" disabled>
              Choisis…
            </option>
            {lettres.map((lettre, j) => (
              <option key={lettre} value={j}>
                {lettre}
              </option>
            ))}
            {libelleOptionSupplementaire && <option value="aucune">{libelleOptionSupplementaire}</option>}
          </select>
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1}</p>
          {niveauAide >= 2 && texteAideNiveau2 && <Katex expression={texteAideNiveau2} block />}
        </div>
      )}
    </div>
  );
}
