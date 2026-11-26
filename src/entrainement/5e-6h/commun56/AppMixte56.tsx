import { useState } from "react";
import type { ReactNode } from "react";
import { AppEcransTrigo } from "../../5e-4h/components5e/AppEcransTrigo";
import type { ConfigAppEcrans } from "../../5e-4h/components5e/AppEcransTrigo";
import { genererAvecCode, lireCodeDepuisUrl } from "../../export/codeExercice";

/**
 * Appli « mixte » des copies enrichies 5e (6h) (chantier D) : les variantes d'origine gardent l'appli
 * copiée de la 5e (4h) ; les variantes AJOUTÉES EN FIN de catalogue (insérer des termes, données
 * arrondies, quatre termes, fractales, point fixe instable…) passent par le socle d'écrans partagé
 * (`AppEcransTrigo`). Cette appli tient l'exercice courant :
 * - premier exercice : `?code=` (QR code des feuilles) rejoué avec les MÊMES fonctions que l'adaptateur
 *   papier (`genererAvecCode(code, catalogue, genererLibreAdaptateur, genererVariante)`), sinon tirage
 *   `…Libre` (nouvelle variante une fois sur n) ;
 * - « Nouvel exercice » : nouveau tirage `…Libre` ; `SelecteurVarianteDev` : variante choisie (catalogue
 *   COMPLET, nouvelles variantes en fin de liste, des deux côtés).
 * Chaque exercice remonte l'appli concernée (`key`) : aucun état ne passe d'un exercice à l'autre.
 */

export interface ControleMixte {
  /** Catalogue complet (anciennes variantes puis nouvelles), pour `SelecteurVarianteDev`. */
  catalogue: { id: string; label: string }[];
  /** « Nouvel exercice » : la parente tire l'exercice suivant. */
  suivant: () => void;
  /** Variante forcée par le sélecteur. */
  variante: (id: string) => void;
}

export interface PropsAncienne<A> {
  /** Exercice imposé par la parente (absent : comportement d'origine de l'appli copiée). */
  premier?: A;
  controle?: ControleMixte;
}

interface Props<A, N, P extends string> {
  catalogue: { id: string; label: string }[];
  /** Tirage libre de l'ADAPTATEUR (anciennes variantes seulement) : sert à rejouer un `?code=` libre. */
  genererLibreAdaptateur: () => A;
  /** Tirage libre de l'appli (`…Libre`) : nouvelle variante une fois sur n. */
  genererLibre: () => A | N;
  genererVariante: (id: string) => A | N;
  estNouvelle: (x: A | N) => x is N;
  rendreAncienne: (props: PropsAncienne<A> & { key: number }) => ReactNode;
  /** Config du socle d'écrans pour les nouvelles variantes (sans `premierExercice` ni crochets). */
  configNouvelle: Omit<ConfigAppEcrans<N, P>, "premierExercice" | "auNouvelExercice" | "auChoixVariante" | "catalogue" | "genererLibre" | "genererVariante">;
  genererLibreNouvelle: () => N;
}

export function AppMixte56<A, N, P extends string>(props: Props<A, N, P>) {
  const [courant, setCourant] = useState<{ x: A | N; cle: number }>(() => {
    const code = lireCodeDepuisUrl();
    const x = code ? genererAvecCode<A | N>(code, props.catalogue, props.genererLibreAdaptateur, props.genererVariante) : props.genererLibre();
    return { x, cle: 0 };
  });
  const controle: ControleMixte = {
    catalogue: props.catalogue,
    suivant: () => setCourant((c) => ({ x: props.genererLibre(), cle: c.cle + 1 })),
    variante: (id) => setCourant((c) => ({ x: props.genererVariante(id), cle: c.cle + 1 })),
  };
  if (props.estNouvelle(courant.x)) {
    const x = courant.x;
    const config: ConfigAppEcrans<N, P> = {
      ...props.configNouvelle,
      catalogue: props.catalogue,
      genererLibre: props.genererLibreNouvelle,
      genererVariante: (id) => {
        const y = props.genererVariante(id);
        return props.estNouvelle(y) ? y : props.genererLibreNouvelle();
      },
      premierExercice: x,
      auNouvelExercice: () => {
        controle.suivant();
        return true;
      },
      auChoixVariante: (id) => {
        controle.variante(id);
        return true;
      },
    };
    return <AppEcransTrigo key={courant.cle} config={config} />;
  }
  return <>{props.rendreAncienne({ key: courant.cle, premier: courant.x as A, controle })}</>;
}
