import { useState } from "react";
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import {
  consigneEcran,
  consigneGenerale,
  formatTermesDonneesLatex,
  labelsChampsDecomposition,
  placeholdersChampsDecomposition,
  questionFinale,
  texteAideNiveau1,
  texteAideNiveau2,
} from "../ui5e/formatFonctionDerivee";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelFonctionDerivee } from "./EtatActuelFonctionDerivee";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceFonctionDerivee;
  /** Jamais "reglebase" ici — cet écran est sauté pour ce type (voir `sessionFonctionDerivee.ts`). */
  typeRetenu: Exclude<TypeDerivee, "reglebase">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: { champ1: string; champ2: string }) => void;
  diagnostiquer?: (reponse: { champ1: string; champ2: string }) => { champ1: StatutVerification; champ2: StatutVerification };
}

/** Écran "decomposer" — 2 champs texte libres, labellisés dynamiquement selon `typeRetenu`
 * ("u(x)="/"v(x)=" pour produit/quotient, "u(x)="/"g(u)=" pour composée) — même patron 2-champs/
 * 1-tentative-combinée que `EtapeDevelopperDerivee.tsx` (5gen26). Le champ1/champ2 générique est
 * mappé côté `App5gen27.tsx` vers `ReponseDecomposerUV`/`ReponseDecomposerComposee` selon
 * `typeRetenu`. */
export function EtapeDecomposerFonctionDerivee({ exercice, typeRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [champ1, setChamp1] = useState("");
  const [champ2, setChamp2] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = champ1.trim() !== "" && champ2.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const statuts = apresEchec && diagnostiquer && complet ? diagnostiquer({ champ1, champ2 }) : null;
  const aide2 = texteAideNiveau2("decomposer", typeRetenu);
  const [label1, label2] = labelsChampsDecomposition(typeRetenu);
  const [placeholder1, placeholder2] = placeholdersChampsDecomposition(typeRetenu);

  function valider() {
    if (!complet) return;
    const reponse = { champ1, champ2 };
    if (diagnostiquer) {
      const s = diagnostiquer(reponse);
      setDernierStatut(s.champ1 !== "correct" ? s.champ1 : s.champ2);
    }
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <p className="prompt-text">
        Objectif : calculer <Katex expression={questionFinale()} />.
      </p>
      <EtatActuelFonctionDerivee exercice={exercice} ecran="decomposer" typeRetenu={typeRetenu} />
      <p className="prompt-text">{consigneEcran("decomposer", typeRetenu)}</p>
      <ApercuExpressionLatex texte={champ1} label={label1} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={label1} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.champ1 !== "correct" ? " is-erronee" : ""}`}
          value={champ1}
          onChange={(e) => setChamp1(e.target.value)}
          placeholder={placeholder1}
        />
      </div>
      <ApercuExpressionLatex texte={champ2} label={label2} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={label2} />
        </label>
        <input
          type="text"
          className={`text-input${statuts && statuts.champ2 !== "correct" ? " is-erronee" : ""}`}
          value={champ2}
          onChange={(e) => setChamp2(e.target.value)}
          placeholder={placeholder2}
        />
      </div>
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
          <p>{texteAideNiveau1("decomposer", typeRetenu)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
