# FilmSense

> Recomendações personalizadas de filmes com inteligência artificial treinada no browser.

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=flat&logo=angular)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.x-FF6F00?style=flat&logo=tensorflow)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat&logo=supabase)
![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=flat)

## Sobre o projeto

FilmSense é uma aplicação web de recomendação de filmes que utiliza uma rede neural treinada diretamente no browser para sugerir filmes com base no gosto pessoal do usuário. Quanto mais filmes você avalia, mais precisas ficam as recomendações.

Desenvolvido como projeto de portfólio durante a pós-graduação em Engenharia de IA Aplicada.

## Funcionalidades

- 🔍 Busca de filmes em tempo real via TMDB API
- ⭐ Avaliação de filmes com nota de 1 a 10
- 🤖 Recomendações personalizadas com rede neural (TensorFlow.js)
- 🔐 Autenticação com Google via Supabase
- 👤 Modo visitante para teste sem cadastro
- 🗑️ Gerenciamento de avaliações (editar e excluir)

## Como funciona o modelo de ML

O FilmSense usa **content-based filtering** — aprende quais características de filmes você tende a gostar com base nas suas avaliações.

### Pipeline

```
Suas avaliações (Supabase)
  → Extração de features (genres, ano, popularidade)
  → Treinamento da rede neural (TF.js no browser)
  → Inferência em filmes populares (TMDB)
  → Top 20 recomendações ordenadas por score previsto
```

### Arquitetura da rede

```
Input: 23 features
  - 19 gêneros (one-hot encoding)
  - ano de lançamento normalizado
  - popularidade normalizada
  - vote_average normalizado
  - vote_count normalizado

Dense(128, relu)
  ↓
Dense(16, relu)
  ↓
Dense(1, linear) → nota prevista (0–1)
```

### Limitação conhecida

Com menos de 10 filmes avaliados o modelo tende a overfitting. Com 30+ avaliações os resultados melhoram significativamente. O treino roda na thread principal — para datasets maiores, migrar para Web Worker é recomendado.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 17+ (Standalone) |
| ML | TensorFlow.js 4.x |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth (OAuth Google) |
| API de filmes | TMDB API |
| Estilização | SCSS |

## Estrutura do projeto

```
src/app/
├── components/
│   ├── navbar/           # Barra de navegação com busca
│   ├── search-bar/       # Input de busca com debounce
│   ├── rating-modal/     # Modal de avaliação com backdrop
│   ├── confirm-dialog/   # Dialog de confirmação de exclusão
│   └── recommendations/  # Seção de recomendações
├── pages/
│   ├── login/            # Tela de autenticação
│   └── home/             # Página principal
├── services/
│   ├── supabase.service.ts  # Auth + CRUD de avaliações
│   └── tmdb.service.ts      # Busca de filmes
├── ml/
│   ├── features.ts       # One-hot encoding e normalização
│   ├── model.ts          # Definição e treino da rede neural
│   └── recommend.ts      # Inferência e ranking
└── models/
    ├── rating.model.ts
    ├── tmdb.model.ts
    └── trainingdata.model.ts
```

## Instalação

### Pré-requisitos

- Node.js 18+
- Angular CLI: `npm install -g @angular/cli`
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [TMDB](https://www.themoviedb.org) (gratuita)

### Configuração

1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/filmsense.git
cd filmsense
```

2. Instale as dependências

```bash
npm install
```

3. Crie o arquivo de ambiente a partir do template

```bash
cp src/environments/environment.template.ts src/environments/environment.development.ts
```

4. Preencha as variáveis em `environment.development.ts`

```ts
export const environment = {
  production: false,
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseKey: 'sua-anon-key',
  tmdbToken: 'seu-token-tmdb'
};
```

5. Configure o banco no Supabase — execute o SQL abaixo no SQL Editor

```sql
create table ratings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  tmdb_id integer not null,
  title text not null,
  rating numeric(3,1) not null check (rating between 1 and 10),
  genres integer[] not null default '{}',
  release_year integer,
  popularity numeric,
  poster_path text,
  backdrop_path text,
  created_at timestamptz default now(),
  unique(user_id, tmdb_id)
);

alter table ratings enable row level security;

create policy "Usuário acessa só seus ratings"
on ratings for all
using (auth.uid() = user_id);
```

6. Rode o projeto

```bash
ng serve
```

Acesse `http://localhost:4200`

## Deploy

O projeto está configurado para deploy estático — compatível com Vercel, Netlify e GitHub Pages.

```bash
ng build --configuration production
```

Os arquivos gerados ficam em `dist/filmsense/browser/`.

## Variáveis de ambiente necessárias

| Variável | Onde obter |
|---|---|
| `supabaseUrl` | Supabase → Project Settings → Data API |
| `supabaseKey` | Supabase → Project Settings → API → anon public |
| `tmdbToken` | TMDB → Settings → API → Read Access Token |

## Autor

João Vitor Maganin — [LinkedIn](https://linkedin.com/in/joaomontemor/) · [GitHub](https://github.com/JoaoMaganin)

---

*Projeto desenvolvido durante a pós-graduação em Engenharia de IA Aplicada — 2026*