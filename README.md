# Filtros Brasil — PDV App

Web app de gestão de campo para o programa Juntou Ganhou.

## Stack
- React 18 + Vite
- Supabase (banco + auth + storage)
- Vercel (deploy)

## Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 3. Iniciar
npm run dev
```

## Deploy
Push para `main` → Vercel faz deploy automático.

## Credenciais demo (sem Supabase configurado)
| E-mail | Perfil | Senha |
|--------|--------|-------|
| ednilson@filtrosbrasil.com.br | gestor | 123456 |
| jackeline@filtrosbrasil.com.br | promotora | 123456 |
| roberto@filtrosbrasil.com.br | representante | 123456 |
| admin@filtrosbrasil.com.br | admin | 123456 |
