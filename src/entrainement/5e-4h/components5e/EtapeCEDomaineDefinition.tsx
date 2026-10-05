import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceDomaineDefinition, SlotCE, SymboleCE } from "../core5e/domaineDefinition.types";
import type { ReponseCE } from "../moteur5e/verificationDomaineDefinition";
import { CONSIGNE_GENERALE_DOMAINE_DEFINITION, OPTIONS_SYMBOLE_CE, texteAideCE } from "../ui5e/formatDomaineDefinition";
import type { OptionPolynomeLatex } from "../ui5e/formatDomaineDefinition";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface LigneSaisie {
  /** Vide pour la famille "pasDeCE" (aucun vrai slot n'existe — `exercice.argumentLatex` sert de
   * label statique à la place, voir plus bas). */
  slotId: string;
  symbole: SymboleCE | null;
}

function optionsSlots(slots: SlotCE[]): OptionPolynomeLatex[] {
  const vues = new Set<string>();
  const options: OptionPolynomeLatex[] = [];
  for (const slot of slots) {
    for (const option of [{ id: slot.id, latex: slot.latex, texte: slot.texte }, ...(slot.decoys ?? [])]) {
      if (vues.has(option.id)) continue;
      vues.add(option.id);
      options.push(option);
    }
  }
  return options;
}

/** Vrai combobox natif (`<select>`) — un `<option>` HTML ne peut afficher que du texte brut,
 * jamais du KaTeX, d'où `OptionPolynomeLatex.texte` (dérivé de la même donnée que `.latex`,
 * jamais reconstruit en parsant du LaTeX). Marqué rouge (`.is-erronee`, même classe/convention que
 * `.text-input.is-erronee` ailleurs sur la plateforme) si la valeur actuellement sélectionnée vient
 * d'être jugée fausse après une tentative ratée. `placeholder` (optionnel) force un premier état
 * "non choisi", value=`""`, retiré de la liste dès qu'une vraie valeur est sélectionnée. */
function ComboboxTexte({
  options,
  valeur,
  onChange,
  erronee,
  ariaLabel,
  placeholder,
}: {
  options: OptionPolynomeLatex[];
  valeur: string;
  onChange: (id: string) => void;
  erronee?: boolean;
  ariaLabel: string;
  placeholder?: string;
}) {
  return (
    <select
      className={erronee ? "ce-select is-erronee" : "ce-select"}
      aria-label={ariaLabel}
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder && valeur === "" && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.texte}
        </option>
      ))}
    </select>
  );
}

interface Props {
  exercice: ExerciceDomaineDefinition;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  /** Bloc "données" redondant (f(x)), rendu juste APRÈS la consigne générale (A.9, ordre standard
   * des blocs) — jamais avant, contrairement au montage précédent d'`App5gen1.tsx`. */
  donnees: ReactNode;
  onValider: (reponse: ReponseCE) => void;
}

/**
 * Écran 1 — gate universel (point 1.8) "Cette fonction a-t-elle une condition d'existence ?" →
 * "Aucune CE" / "Au moins une CE", APPLICABLE À TOUTES LES FAMILLES (jamais limité à la seule
 * famille "pasDeCE" — `exercice.aucuneCE` est désormais un booléen transversal, voir point 1.10).
 * Cliquer "Au moins une CE" déplie le formulaire guidé (slot + symbole par ligne) — sauf si
 * `slots.length === 0` (seul cas possible : famille "pasDeCE"), où rien n'est à sélectionner.
 *
 * Mêmes conventions que le reste de la plateforme pour le gate lui-même (jamais une variante propre
 * à cet écran) : `.options-grid` + `.btn.toggle-active` (identique à `EtapeCE.tsx`/
 * `EtapeCEDirecte.tsx`, 4e). Chaque ligne combine 2 VRAIS combobox natifs (`<select>`,
 * `ComboboxTexte`) — jamais des boutons : le polynôme concerné (dès que plus d'une option est en
 * jeu — slots réels ET distracteurs confondus, sinon un simple label KaTeX statique) PUIS le type
 * d'inégalité (≠0/≥0/>0). Le bouton "Valider" est TOUJOURS affiché, désactivé tant que la réponse
 * n'est pas complète : sélectionner "Aucune CE" (ou "Au moins une CE") ne soumet jamais directement
 * — même principe que `EtapeCE.tsx`, où "Pas de CE" ne fait que choisir l'option, l'élève doit
 * ensuite cliquer "Valider" comme pour toute autre réponse.
 */
export function EtapeCEDomaineDefinition({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, donnees, onValider }: Props) {
  const slots: SlotCE[] = exercice.famille === "pasDeCE" ? [] : exercice.slots;
  const pasDeSlotReel = slots.length === 0;
  const options = optionsSlots(slots);
  /** Label statique du "polynôme concerné" pour la famille "pasDeCE" — l'argument seul de la
   * racine impaire/valeur absolue, jamais l'habillage complet de `fLatex`. */
  const argumentLatexPasDeCE = exercice.famille === "pasDeCE" ? exercice.argumentLatex : null;
  const [aBesoinDeCE, setABesoinDeCE] = useState<boolean | null>(null);
  const [lignes, setLignes] = useState<LigneSaisie[]>(() => [{ slotId: pasDeSlotReel ? "" : slots[0].id, symbole: null }]);
  const montrerErreurs = tentativesUtilisees > 0;
  const textesAide = texteAideCE(exercice);

  /** Même formulaire add-as-needed pour TOUTE famille, y compris "pasDeCE" (A.1,
   * `promptcorrectionsround2.md`) — l'ancienne condition `slots.length > 0` masquait entièrement le
   * formulaire pour cette famille, laissant "Valider" cliquable sans aucune saisie. Pour "pasDeCE",
   * le "polynôme concerné" est un LABEL statique (`exercice.argumentLatex`), jamais un champ libre
   * (retiré après retour utilisateur — un champ libre laissait croire qu'un vrai choix de
   * polynôme était possible, alors qu'il n'y en a qu'un seul, déjà connu). */
  const afficheFormulaire = aBesoinDeCE === true;
  const complet = aBesoinDeCE === false || (aBesoinDeCE === true && lignes.length > 0 && lignes.every((l) => l.symbole !== null));

  function ajouterLigne() {
    setLignes((arr) => [...arr, { slotId: pasDeSlotReel ? "" : slots[0].id, symbole: null }]);
  }

  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }

  function modifierSlot(i: number, slotId: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, slotId } : l)));
  }

  function modifierSymbole(i: number, symbole: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, symbole: symbole as SymboleCE } : l)));
  }

  function valider() {
    if (!complet) return;
    if (aBesoinDeCE === false) return onValider({ aucuneCE: true });
    onValider({ aucuneCE: false, lignes: lignes.map((l) => ({ slotId: l.slotId, symbole: l.symbole as SymboleCE })) });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_DOMAINE_DEFINITION}</p>
      {donnees}
      <p className="prompt-text">Cette fonction a-t-elle une condition d'existence ?</p>
      <div className="options-grid">
        <button type="button" className={aBesoinDeCE === false ? "btn toggle-active" : "btn"} onClick={() => setABesoinDeCE(false)}>
          Aucune CE
        </button>
        <button type="button" className={aBesoinDeCE === true ? "btn toggle-active" : "btn"} onClick={() => setABesoinDeCE(true)}>
          Au moins une CE
        </button>
      </div>
      {afficheFormulaire && (
        <div className="contenu-conditionnel">
          <p className="prompt-text">Écris la ou les conditions d'existence de f(x) (sans les résoudre).</p>
          {lignes.map((ligne, i) => {
            const slot = pasDeSlotReel ? null : (slots.find((s) => s.id === ligne.slotId) ?? slots[0]);
            return (
              <div key={i} className="liste-morceaux-ligne">
                <div className="ce-ligne-champs">
                  {pasDeSlotReel ? (
                    <span className="ce-slot-latex">
                      <Katex expression={argumentLatexPasDeCE as string} />
                    </span>
                  ) : options.length > 1 ? (
                    <ComboboxTexte
                      options={options}
                      valeur={ligne.slotId}
                      onChange={(id) => modifierSlot(i, id)}
                      ariaLabel="Expression concernée"
                    />
                  ) : (
                    <span className="ce-slot-latex">
                      <Katex expression={(slot as SlotCE).latex} />
                    </span>
                  )}
                  <ComboboxTexte
                    options={OPTIONS_SYMBOLE_CE}
                    valeur={ligne.symbole ?? ""}
                    onChange={(symbole) => modifierSymbole(i, symbole)}
                    erronee={montrerErreurs && (pasDeSlotReel || (ligne.symbole !== null && slot !== null && ligne.symbole !== slot.symboleAttendu))}
                    ariaLabel="Type d'inégalité"
                    placeholder="Choisis…"
                  />
                </div>
                {lignes.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer cette condition" onClick={() => retirerLigne(i)}>
                    ×
                  </button>
                )}
              </div>
            );
          })}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterLigne}>
            + Ajouter une condition
          </button>
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && textesAide.length > 0 && (
        <div className="aide-5e">
          <p>{textesAide[0]}</p>
          {niveauAide >= 2 && textesAide.length > 1 && <p>{textesAide[1]}</p>}
        </div>
      )}
    </div>
  );
}
