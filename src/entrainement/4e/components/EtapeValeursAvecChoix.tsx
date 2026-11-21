import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../ui/formatEquationDroite";
import { lireNombreSaisi } from "../ui/lireNombre";
import { ILLISIBLE_VECTEURS } from "../ui/retoursVecteurs";
import { PiedVecteurs } from "./PiedVecteurs";
import { RenduFragments } from "./RenduFragments";
import { useTentativeLisible } from "./RetourSaisie";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

export interface ReponseValeursAvecChoix {
  /** Choix fermé : « aucune valeur » (vrai) ou « au moins une » (faux). */
  aucune: boolean;
  valeurs: number[];
}

interface Props {
  enTete: ReactNode;
  question: ReactNode;
  libelleAucune: string;
  libelleAuMoins: string;
  placeholder: string;
  /** Choix déjà jugé par le moteur (une seule fois), `null` tant qu'il ne l'est pas. */
  choixFige: { choisi: boolean; correct: boolean } | null;
  /** Bonne réponse au choix fermé (affichée quand le choix figé était faux). */
  attenduAucune: boolean;
  messageChoixFaux: FragmentConsigne[];
  tentativesUtilisees: number;
  tentativesMax: number;
  aides: FragmentConsigne[][];
  onPremiereAide?: () => void;
  /** Première validation : le choix (et les valeurs s'il dit « au moins une ») ; ensuite : les
   * valeurs seules (`aucune` = faux). L'appli enchaîne les deux appels du moteur. */
  onValider: (reponse: ReponseValeursAvecChoix) => void;
  cible: (valeurs: number[]) => FragmentConsigne[] | null;
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran « aucune valeur / au moins une, puis les valeurs » (gen24 « paramètre au carré », gen26
 * « paramètre ») — audit 4e ch. 6, lot B (G3) : le choix fermé est jugé UNE fois puis figé (révélé
 * s'il était faux) ; les valeurs gardent les tentatives du réglage. Saisie illisible : aucune
 * tentative ; aides à deux niveaux.
 */
export function EtapeValeursAvecChoix(props: Props) {
  const { choixFige, attenduAucune, validation } = props;
  const [choix, setChoix] = useState<boolean | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);
  const saisie = useTentativeLisible<number[]>();

  const affiche = choixFige ? (choixFige.correct ? choixFige.choisi : attenduAucune) : choix;
  const montrerValeurs = affiche === false;
  const lues = valeurs.map(lireNombreSaisi);
  const complet = affiche === true || (affiche === false && valeurs.every((v) => v.trim() !== ""));
  const choixBloque = !!validation || choixFige !== null;

  function choisir(aucune: boolean) {
    setChoix(aucune);
    setValeurs([""]);
  }

  return (
    <div>
      {props.enTete}
      <p className="prompt-text">{props.question}</p>

      <div className="options-grid">
        <button disabled={choixBloque} type="button" className={affiche === true ? "btn toggle-active" : "btn"} onClick={() => choisir(true)}>
          {props.libelleAucune}
        </button>
        <button disabled={choixBloque} type="button" className={affiche === false ? "btn toggle-active" : "btn"} onClick={() => choisir(false)}>
          {props.libelleAuMoins}
        </button>
      </div>
      {choixFige !== null && !choixFige.correct && !validation && (
        <p className="alert-error" role="status">
          <span>
            <RenduFragments fragments={props.messageChoixFaux} />
          </span>
        </p>
      )}

      {montrerValeurs && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                disabled={!!validation}
                className="text-input"
                placeholder={props.placeholder}
                value={valeur}
                onChange={(e) => setValeurs(valeurs.map((v, i) => (i === index ? normaliserSigneMoins(e.target.value) : v)))}
                aria-label={`Valeur ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button disabled={!!validation} type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${index + 1}`} onClick={() => setValeurs(valeurs.filter((_, i) => i !== index))}>
                  ×
                </button>
              )}
            </div>
          ))}
          {valeurs.length < 2 && (
            <button disabled={!!validation} type="button" className="btn liste-morceaux-ajouter" onClick={() => setValeurs([...valeurs, ""])}>
              + Ajouter une valeur
            </button>
          )}
        </div>
      )}

      {!validation && (
        <PiedVecteurs
          aides={props.aides}
          onPremiereAide={props.onPremiereAide}
          complet={complet}
          saisie={saisie}
          reponse={() => (affiche === false ? lues.map((v) => v ?? Number.NaN) : [])}
          lisible={() => affiche === true || lues.every((v) => v !== null)}
          onValider={(v) => props.onValider({ aucune: affiche === true, valeurs: v })}
          texteIllisible={ILLISIBLE_VECTEURS.valeursX}
          tentativesUtilisees={props.tentativesUtilisees}
          tentativesMax={props.tentativesMax}
          cible={props.cible}
        />
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
