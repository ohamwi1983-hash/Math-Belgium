-- =================================================================================================
-- Math-Belgium — « Mon ordre des chapitres » (professeur connecté)
-- =================================================================================================
--
-- À coller APRÈS 0010_page_classe.sql (il suppose 0001 et 0002 déjà exécutés : profils, réglages du
-- carnet `carnet_reglages` ; il ne touche à aucune autre table), dans l'éditeur SQL du projet
-- Supabase (SQL Editor → New query → coller TOUT ce fichier → Run). Idempotent : le relancer ne casse
-- rien et ne perd aucune donnée (colonnes `add column if not exists`, fonction `create or replace`,
-- contrainte ajoutée seulement si elle est absente, droits redonnés à l'identique). Aucune clé
-- secrète, aucun jeton, aucun mot de passe : rien à remplacer.
--
-- Résultat attendu : « Success. No rows returned ». Recharger /profil → « Mon ordre des chapitres »
-- (Supabase peut mettre quelques secondes à voir les nouvelles colonnes). Tant que ce fichier n'est
-- pas exécuté, le site marche comme avant (ordre du site, titres seuls sur les documents) et l'écran
-- affiche « Applique la migration 0011… ».
--
-- Décision du professeur (25/11/2026) : ses collègues ne suivent pas forcément les chapitres dans
-- l'ordre du site. Chaque professeur range, pour chaque année (4e, 5e 4h, 6e 6h), les chapitres dans
-- l'ordre où il les donne ; SES outils (carnet, page de classe, coffre, page de conception) et SES
-- documents suivent ce rangement et impriment SON numéro (« Chapitre 3 — Titre ») — jamais celui du
-- site. Sans rangement : titre seul.
--
-- Contenu (AUCUNE donnée d'élève : des identifiants de chapitres du site) :
--   carnet_reglages  + ordre_chapitres jsonb : NULL = ordre du site pour toutes les années ; sinon
--                      un objet { "4e": ["geometrie-dans-espace", …], "5e-4h": […] } — une clé par
--                      année rangée (8 au plus, « a-z 0-9 - »), une liste de 1 à 40 identifiants de
--                      chapitres distincts (« a-z 0-9 - », 80 caractères au plus) ; contrainte
--                      `carnet_reglages_ordre_chapitres_valide`. Une année absente = ordre du site ;
--                      un chapitre ajouté au site plus tard vient à la fin, dans l'ordre du site.
--                    + ordre_sans_numero boolean (faux) : « Ne pas numéroter mes documents » (titre
--                      seul même avec un ordre réglé).
--   RLS              inchangé : les politiques de 0002 couvrent déjà toutes les colonnes de cette
--                    table (proprietaire = auth.uid() et compte actif, pour TOUTES les opérations ;
--                    `anon` n'a aucun droit). Rien n'est ouvert à l'administrateur.
--
-- Pourquoi `carnet_reglages` plutôt que `profils` : ses droits sont donnés à la table entière (0002),
-- une nouvelle colonne y est donc couverte sans droit de colonne — relancer 0001 ou 0002 plus tard ne
-- retire rien, alors qu'un droit de colonne sur `profils` serait effacé par le `revoke all` de 0001.
-- =================================================================================================

-- -------------------------------------------------------------------------------------------------
-- Validité du rangement (pure, sans accès aux tables)
-- -------------------------------------------------------------------------------------------------
-- NULL accepté ; sinon un objet d'au plus 8 clés au format d'un niveau du site, chaque valeur un
-- tableau de 1 à 40 textes au format d'un identifiant de chapitre, sans doublon. Le `case` évalue
-- les conditions dans l'ordre : `jsonb_each` / `jsonb_array_elements` ne voient jamais autre chose
-- qu'un objet / des tableaux.
create or replace function public.ordre_chapitres_valide(j jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
           when j is null then true
           when jsonb_typeof(j) <> 'object' then false
           when (select count(*) from jsonb_object_keys(j)) > 8 then false
           when exists (
             select 1 from jsonb_each(j) e
              where e.key !~ '^[a-z0-9][a-z0-9-]{0,19}$'
                 or jsonb_typeof(e.value) <> 'array'
           ) then false
           when exists (
             select 1 from jsonb_each(j) e
              where jsonb_array_length(e.value) not between 1 and 40
           ) then false
           when exists (
             select 1 from jsonb_each(j) e, jsonb_array_elements(e.value) x
              where jsonb_typeof(x) <> 'string'
           ) then false
           when exists (
             select 1 from jsonb_each(j) e, jsonb_array_elements_text(e.value) s
              where s !~ '^[a-z0-9][a-z0-9-]{0,79}$'
           ) then false
           else not exists (
             select 1 from jsonb_each(j) e
              where (select count(distinct s) from jsonb_array_elements_text(e.value) s) <> jsonb_array_length(e.value)
           )
         end;
$$;

revoke all on function public.ordre_chapitres_valide(jsonb) from public, anon;
grant execute on function public.ordre_chapitres_valide(jsonb) to authenticated;

-- -------------------------------------------------------------------------------------------------
-- Colonnes
-- -------------------------------------------------------------------------------------------------

alter table public.carnet_reglages add column if not exists ordre_chapitres jsonb;
alter table public.carnet_reglages add column if not exists ordre_sans_numero boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conname = 'carnet_reglages_ordre_chapitres_valide' and conrelid = 'public.carnet_reglages'::regclass
  ) then
    alter table public.carnet_reglages add constraint carnet_reglages_ordre_chapitres_valide
      check (public.ordre_chapitres_valide(ordre_chapitres));
  end if;
end;
$$;

comment on column public.carnet_reglages.ordre_chapitres is
  'Mon ordre des chapitres : { niveau: [identifiants de chapitres] } ; NULL ou année absente = ordre du site.';
comment on column public.carnet_reglages.ordre_sans_numero is
  'Ne pas numéroter mes documents : titre du chapitre seul, même avec un ordre réglé.';

-- Droits et RLS : ceux de 0002 (aucun changement ; rappelés pour qu'une base où ils auraient été
-- modifiés à la main retrouve l'état attendu).
revoke all on public.carnet_reglages from anon;
grant select, insert, update, delete on public.carnet_reglages to authenticated;
alter table public.carnet_reglages enable row level security;

-- Supabase recharge son cache de schéma à chaque DDL ; on le demande quand même (sans effet ailleurs).
notify pgrst, 'reload schema';
