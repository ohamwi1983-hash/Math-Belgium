import { useState } from "react";
import type { ReactNode } from "react";
import type { ComparateurSeuil, CompositionDirigee } from "../core5e/composerFonctions.types";
import type { ReponseCondition } from "../moteur5e/verificationComposerFonctions";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { TOLERANCE_SEUIL } from "../moteur5e/verificationComposerFonctions";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { CONSIGNE_GENERALE_COMPOSER_FONCTIONS } from "../ui5e/formatComposerFonctions";

const OPTIONS_COMPARATEUR: { id: ComparateurSeuil; texte: string }[] = [
  { id: "ge", texte: "≥" },
  { id: "gt", texte: ">" },
  { id: "le", texte: "≤" },
  { id: "lt", texte: "<" },
  { id: "ne", texte: "≠" },
];

interface Ligne {
  comparateur: ComparateurSeuil | null;
  seuil: string;
}

interface Props {
  dir: CompositionDirigee;
  consigne: string;
  /** Bloc "données" persistant (f(x)/g(x)) — rendu juste APRÈS la consigne (A.9). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  texteAideNiveau1: string;
  latexAideNiveau2: string | null;
  termesEtatActuel?: string[];
  onValider: (reponse: ReponseCondition[]) => void;
}

function EtatActuelComposerFonctions({ termes }: { termes: string[] }) {
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/**
 * Écran B (D.4, riche uniquement) — pose 1 ou 2 conditions `interieure(x) ◇ seuil` (nombre FIXE,
 * connu à l'avance via `dir.conditions.length`, jamais add-as-needed) derrière un seul bouton
 * "Valider" — même patron "N lignes fixes, combobox comparateur + champ numérique" que l'écran CE
 * de 5gen1 (`EtapeCEDomaineDefinition.tsx`), réutilisant les mêmes classes CSS
 * (`.ce-ligne-champs`/`.ce-slot-latex`/`.ce-select`).
 */
export function EtapeConditionsComposerFonctions({ dir, consigne, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, texteAideNiveau1, latexAideNiveau2, termesEtatActuel, onValider }: Props) {
  const [lignes, setLignes] = useState<Ligne[]>(() => dir.conditions.map(() => ({ comparateur: null, seuil: "" })));
  const montrerErreurs = tentativesUtilisees > 0;

  function modifierComparateur(i: number, comparateur: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, comparateur: comparateur as ComparateurSeuil } : l)));
  }
  function modifierSeuil(i: number, seuil: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, seuil } : l)));
  }

  const valeurs = lignes.map((l) => parserNombreOuFraction(l.seuil));
  const complet = lignes.every((l, i) => l.comparateur !== null && valeurs[i] !== null);
  /** Chaque ligne compare son PROPRE seuil à `dir.conditions[i].seuil` (même index, même ordre que
   * la construction initiale de `lignes`) — champ diagnostiqué indépendamment de la ligne voisine
   * (A.2), recalculé à chaque rendu depuis la saisie actuelle. Le comparateur (select) reste hors
   * périmètre A.2 (pas un champ de saisie libre). */
  function seuilErronee(i: number): boolean {
    return montrerErreurs && (valeurs[i] === null || Math.abs((valeurs[i] as number) - dir.conditions[i].seuil) >= TOLERANCE_SEUIL);
  }

  function valider() {
    if (!complet) return;
    onValider(lignes.map((l, i) => ({ comparateur: l.comparateur as ComparateurSeuil, seuil: valeurs[i] as number })));
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_COMPOSER_FONCTIONS}</p>
      {donnees}
      {termesEtatActuel !== undefined && <EtatActuelComposerFonctions termes={termesEtatActuel} />}
      <p className="prompt-text">{consigne}</p>
      {lignes.map((ligne, i) => (
        <div key={i} className="ce-ligne-champs">
          <span className="ce-slot-latex">
            <Katex expression={`${dir.nomInterieure}(x)`} />
          </span>
          <select className="ce-select" aria-label="Comparateur" value={ligne.comparateur ?? ""} onChange={(e) => modifierComparateur(i, e.target.value)}>
            <option value="" disabled>
              Choisis…
            </option>
            {OPTIONS_COMPARATEUR.map((o) => (
              <option key={o.id} value={o.id}>
                {o.texte}
              </option>
            ))}
          </select>
          <input
            type="text"
            className={`text-input${seuilErronee(i) ? " is-erronee" : ""}`}
            placeholder="valeur"
            value={ligne.seuil}
            onChange={(e) => modifierSeuil(i, e.target.value)}
          />
        </div>
      ))}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1}</p>
          {niveauAide >= 2 && latexAideNiveau2 !== null && <Katex expression={latexAideNiveau2} block />}
        </div>
      )}
    </div>
  );
}
