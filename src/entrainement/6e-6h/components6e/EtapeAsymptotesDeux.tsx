import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseAsymptoteDirection, ReponseAsymptotes } from "../moteur6e/verificationEtudeFonctionExponentielle";
import type { DirectionLabel } from "../ui6e/formatEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionExponentielle";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function GroupeAsymptote({ label, etat, erreur, onChange }: { label: string; etat: ReponseAsymptoteDirection; erreur: boolean; onChange: (e: ReponseAsymptoteDirection) => void }) {
  return (
    <div className="field">
      <p className="field-label field-label-minuscule">
        <Katex expression={label} />
      </p>
      <div className="options-grid-compact">
        <button type="button" className={`btn ${etat.existe === false ? "toggle-active" : ""} ${erreur && etat.existe === false ? "is-erronee" : ""}`} onClick={() => onChange({ existe: false, texte: etat.texte })}>
          Aucune asymptote
        </button>
        <button type="button" className={`btn ${etat.existe === true ? "toggle-active" : ""} ${erreur && etat.existe === true ? "is-erronee" : ""}`} onClick={() => onChange({ existe: true, texte: etat.texte })}>
          Il y a une asymptote
        </button>
      </div>
      {etat.existe === true && (
        <>
          <ApercuExpressionLatex texte={etat.texte} />
          <input type="text" className={`text-input contenu-conditionnel ${erreur ? "is-erronee" : ""}`} value={etat.texte} placeholder="ex : y=0, x=3, y=-2x+1..." onChange={(e) => onChange({ existe: true, texte: e.target.value })} />
        </>
      )}
    </div>
  );
}

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  labels: DirectionLabel[];
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAsymptotes) => void;
}

/** Écran 3/6, "asymptotes" — familles A/C/D (2 directions). Réponse GUIDÉE (toggle "Aucune
 * asymptote"/"Il y a une asymptote" + champ texte libre `y=.../x=...` conditionnel — même patron
 * "Existe/N'existe pas" déjà établi ailleurs sur la plateforme, 5gen15 `EtapeSommeInfinie`) —
 * vérifiée par ÉQUIVALENCE NUMÉRIQUE de l'équation soumise (décision de conception explicite, voir
 * `core6e/etudeFonctionExponentielle.types.ts`). `App6gen11.tsx` doit le rendre avec
 * `key={indexExercice}`. `etatActuel` rappelle le domaine ET les limites CONFIRMÉS aux 2 écrans
 * précédents (voir `ui6e/formatEtudeFonctionExponentielle.ts::etatActuel`). */
export function EtapeAsymptotesDeux({ enonceLatex, consigneEcran, labels, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const VIDE: ReponseAsymptoteDirection = { existe: false, texte: "" };
  const [plusInfini, setPlusInfini] = useState<ReponseAsymptoteDirection & { touche?: boolean }>({ ...VIDE });
  const [moinsInfini, setMoinsInfini] = useState<ReponseAsymptoteDirection & { touche?: boolean }>({ ...VIDE });
  const [plusInfiniTouche, setPlusInfiniTouche] = useState(false);
  const [moinsInfiniTouche, setMoinsInfiniTouche] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;

  function complet(touche: boolean, e: ReponseAsymptoteDirection): boolean {
    return touche && (!e.existe || e.texte.trim() !== "");
  }

  function valider() {
    if (!complet(plusInfiniTouche, plusInfini) || !complet(moinsInfiniTouche, moinsInfini)) return;
    onValider({ type: "deux", plusInfini, moinsInfini });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <GroupeAsymptote
        label={labels[0].latex}
        etat={plusInfini}
        erreur={montrerErreurs}
        onChange={(e) => {
          setPlusInfini(e);
          setPlusInfiniTouche(true);
        }}
      />
      <GroupeAsymptote
        label={labels[1].latex}
        etat={moinsInfini}
        erreur={montrerErreurs}
        onChange={(e) => {
          setMoinsInfini(e);
          setMoinsInfiniTouche(true);
        }}
      />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet(plusInfiniTouche, plusInfini) || !complet(moinsInfiniTouche, moinsInfini)} onClick={valider}>
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
