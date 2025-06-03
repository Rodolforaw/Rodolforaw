-- Arquivo: supabase_schema.sql

-- ---------------------------------------------------------------------
-- Tabela de Perfis de Utilizador (para dados adicionais ao auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE, -- Chave estrangeira para auth.users
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  system_profile TEXT DEFAULT 'Global' NOT NULL, -- Perfil de visualização no sistema Construboard
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores podem ver o seu próprio perfil.
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

-- Política: Utilizadores podem atualizar o seu próprio perfil.
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Função para lidar com a criação de um perfil quando um novo utilizador se regista no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, system_profile)
  VALUES (new.id, new.email, 'Global'); -- Pode definir um perfil padrão diferente se desejar
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função handle_new_user após cada novo registo
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------
-- Tabela de Quadros Kanban (se for ter múltiplos quadros)
-- Por agora, vamos assumir um único quadro implícito, 
-- mas esta seria a estrutura para múltiplos quadros.
-- ---------------------------------------------------------------------
-- CREATE TABLE public.boards (
--   id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
--   title TEXT NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
-- );
-- ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can manage their own boards." ON public.boards 
--   FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Tabela de Listas Kanban
-- ---------------------------------------------------------------------
CREATE TABLE public.kanban_lists (
  id TEXT NOT NULL PRIMARY KEY, -- Ex: "list-1", "list-timestamp"
  -- board_id uuid NOT NULL REFERENCES public.boards ON DELETE CASCADE, -- Se usar múltiplos quadros
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE, -- Para associar a um utilizador se for um quadro pessoal
  title TEXT NOT NULL,
  card_order TEXT[] DEFAULT '{}'::TEXT[], -- Array de IDs de cartões, para manter a ordem
  position INTEGER NOT NULL, -- Ordem da lista no quadro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.kanban_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own lists." ON public.kanban_lists
  FOR ALL USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- Tabela de Cartões Kanban
-- ---------------------------------------------------------------------
CREATE TABLE public.kanban_cards (
  id TEXT NOT NULL PRIMARY KEY, -- Ex: "card-1", "card-timestamp"
  list_id TEXT NOT NULL REFERENCES public.kanban_lists ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  text TEXT NOT NULL,
  profile_visibility TEXT DEFAULT 'Global' NOT NULL, -- Perfil que pode ver este cartão
  label_color_hex TEXT, -- Cor da etiqueta em hexadecimal
  location_lat NUMERIC,
  location_lng NUMERIC,
  map_features JSONB DEFAULT '[]'::JSONB, -- Array de objetos GeoJSON para desenhos no mapa
  productivity_notes JSONB DEFAULT '[]'::JSONB, -- Array de strings ou objetos
  associated_materials JSONB DEFAULT '[]'::JSONB, -- Array de strings ou objetos
  position INTEGER NOT NULL, -- Ordem do cartão na lista
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

-- Política: Utilizadores podem gerir os seus próprios cartões.
-- E podem ver cartões "Global" ou do seu próprio perfil.
CREATE POLICY "Users can manage and view relevant cards." ON public.kanban_cards
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view global cards or cards matching their profile." ON public.kanban_cards
  FOR SELECT USING (
    auth.uid() = user_id OR
    profile_visibility = 'Global' OR
    profile_visibility = (SELECT system_profile FROM public.profiles WHERE id = auth.uid())
  );


-- ---------------------------------------------------------------------
-- Tabela de Tipos de Desenho (para o mapa)
-- Pode ser pré-populada ou gerenciada pelo admin
-- ---------------------------------------------------------------------
CREATE TABLE public.drawing_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT UNIQUE NOT NULL, -- Ex: "meio_fio", "drenagem_400"
  label TEXT NOT NULL,        -- Ex: "Linha - Meio Fio"
  shape TEXT NOT NULL,        -- Ex: "polyline", "marker", "polygon"
  default_color TEXT,       -- Ex: "#808080"
  user_id uuid REFERENCES auth.users ON DELETE SET NULL, -- Opcional, se tipos podem ser criados por utilizadores
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.drawing_types ENABLE ROW LEVEL SECURITY;
-- Política: Permitir leitura pública, mas apenas admins (ou utilizadores específicos) podem criar/modificar
CREATE POLICY "Public drawing types are viewable by everyone." ON public.drawing_types
  FOR SELECT USING (true);
-- Adicione políticas de INSERT/UPDATE/DELETE conforme necessário (ex: para admins)


-- ---------------------------------------------------------------------
-- Tabela de Cores/Etiquetas (para cartões e desenhos)
-- ---------------------------------------------------------------------
CREATE TABLE public.label_colors (
  id TEXT NOT NULL PRIMARY KEY, -- Ex: "color-1", "color-timestamp"
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  hex_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.label_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own label colors." ON public.label_colors
  FOR ALL USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Tabela de Mensagens/Recados
-- ---------------------------------------------------------------------
CREATE TABLE public.messages (
  id TEXT NOT NULL PRIMARY KEY, -- Ex: "msg-timestamp"
  sender_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  target_profile TEXT NOT NULL, -- "Global" ou um nome de perfil específico
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem criar mensagens. Utilizadores podem ler mensagens "Global" ou destinadas ao seu perfil.
CREATE POLICY "Admins can create messages." ON public.messages
  FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND system_profile = 'Admin') -- Assumindo que admin tem um perfil "Admin"
    -- Ou uma lógica mais granular baseada em roles do Supabase
  );

CREATE POLICY "Users can view relevant messages." ON public.messages
  FOR SELECT 
  USING (
    target_profile = 'Global' OR
    target_profile = (SELECT system_profile FROM public.profiles WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND system_profile = 'Admin') -- Admin vê tudo
  );
  
CREATE POLICY "Admins can delete any message." ON public.messages
  FOR DELETE
  USING (
     EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND system_profile = 'Admin')
  );


-- Dados Iniciais (Exemplos - Opcional)
-- Você pode inserir alguns dados iniciais aqui se desejar, por exemplo, para drawing_types
-- INSERT INTO public.drawing_types (value, label, shape, default_color) VALUES
--   ('meio_fio', 'Linha - Meio Fio', 'polyline', '#808080'),
--   ('boca_lobo', 'Marcador - Boca de Lobo', 'marker', '#FFA500');

