import { SiteHeader } from '../components/SiteHeader'
import { AppMethodeRapide } from '../entrainement/4e/AppMethodeRapide'
import '../entrainement/4e/entrainement-4e.css'

/** Page `/entrainement/4e/gen1` — premier générateur interactif porté depuis `plateforme-maths`
 * (pilote de fusion, voir conversation du 2026-10-04) : le code (core/moteur/générateurs/ui/
 * components) est copié tel quel sous `src/entrainement/4e/`, en conservant la structure relative
 * d'origine pour que ses imports internes n'aient jamais besoin d'être réécrits. Le CSS porté est
 * réécrit pour adopter le thème de Math-Belgium (jetons `--accent`/`--ink`/`--radius`... au lieu
 * des couleurs/rayons propres à plateforme-maths), scopé sous `.entrainement-4e` pour ne jamais
 * fuiter sur le reste du site — seules les classes réellement utilisées par ce générateur ont été
 * extraites de l'`App.css` d'origine (104 Ko, partagé par les 190 générateurs là-bas), pas la
 * feuille complète. Pas de bouton "Accueil" propre à ce générateur : le fil d'Ariane ci-dessous
 * fait déjà ce rôle, cohérent avec le reste du site. */
export function EntrainementGen1Page() {
  return (
    <>
      <SiteHeader
        breadcrumb={[
          { label: '4e', to: '/' },
          { label: 'Équations et inéquations du second degré', to: '/4e/equations-inequations-second-degre' },
          { label: "S'entraîner" },
        ]}
      />
      <div className="entrainement-4e">
        <AppMethodeRapide />
      </div>
    </>
  )
}
