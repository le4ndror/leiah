# LEIAH · IFCE Campus Maranguape

Site do **LEIAH — Laboratório de Eletrônica, Informática Aplicada e Humanidades**, laboratório de pesquisa interdisciplinar do IFCE Campus Maranguape.

🔗 **Acesse o site:** https://le4ndror.github.io/leiah/

---

## Sobre o projeto

Página única (one-page) com rolagem animada que apresenta o laboratório, suas frentes de pesquisa, sua história e sua equipe. O site é feito apenas com HTML, CSS e JavaScript puros, sem build e sem dependências instaláveis. As únicas bibliotecas externas (GSAP e plugins) são carregadas por CDN.

## Estrutura da página

A página é formada por três telas, ligadas por transições de scroll:

1. **Tela inicial** — marca LEIAH, bolhas interativas na palavra "Leiah" (clique para estourar) e zoom na palavra ao rolar.
2. **Timeline horizontal** — a trajetória do laboratório (2020 até hoje), que desliza na horizontal conforme o scroll.
3. **Portfólio do laboratório**, com as seções:
   - **Hero** — "Leiah" em destaque, menu e a cabeça-símbolo com efeito de ímã
   - **Faixa em movimento** — áreas de pesquisa
   - **O laboratório** — texto que acende letra por letra e números do ciclo
   - **Eixos** — os cinco eixos de pesquisa
   - **Em andamento** e **Concluídas** — cartões empilhados com bolsista, áreas e descrição de cada pesquisa
   - **Trajetória** — de 2020 ao ciclo atual, em detalhe
   - **Regras** — regras de convivência do laboratório
   - **Equipe** — docentes orientadores
   - **Contato e rodapé**

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura e conteúdo de todas as telas |
| `style.css` | Estilos da tela inicial, da timeline e das transições |
| `script.js` | Bolhas interativas, logo, timeline (GSAP), zoom e transições entre telas |
| `portfolio.css` | Estilos do portfólio (isolados sob a classe `.jk`) |
| `portfolio.js` | Animações do portfólio: faixa em movimento, texto letra por letra, ímã e cartões empilhados |
| `leiah-cabeca.png` | Imagem da cabeça-símbolo (hero e tela inicial) |
| `fundo.jpeg` | *(opcional)* imagem de fundo da tela inicial; sem ela, fica o fundo roxo |

> Mantenha todos os arquivos na **mesma pasta**, pois os caminhos são relativos.

## Tecnologias

- HTML5, CSS3 e JavaScript (ES6)
- [GSAP](https://gsap.com/) 3.13 com **ScrollTrigger** e **SplitText** (via CDN)
- Fontes: **Poppins** e **Kanit** (Google Fonts)
- Canvas 2D para as bolhas e os efeitos da cabeça

## Como rodar localmente

Não há instalação. Escolha uma das opções:

```bash
# opção 1: abrir o index.html direto no navegador

# opção 2: servidor local (recomendado)
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

É necessária conexão com a internet para carregar o GSAP e as fontes.

## Como publicar (GitHub Pages)

1. Envie todos os arquivos para a raiz do repositório.
2. Em **Settings → Pages**, selecione a branch (por exemplo `main`) e a pasta `/ (root)`.
3. O site fica disponível em https://le4ndror.github.io/leiah/

## Como editar o conteúdo

- **Textos do portfólio** (eixos, pesquisas, trajetória, regras, equipe): edite diretamente o `index.html`, dentro da seção correspondente (`#eixos`, `#projetos`, `#trajetoria`, `#regras`, `#equipe`).
- **Marcos da timeline horizontal**: edite as listas `topJourneyData` e `bottomJourneyData` no `script.js`.
- **Cores e estilo do portfólio**: `portfolio.css`. Cores da tela inicial e da timeline: `style.css`.
- **Velocidade do zoom inicial**: objeto `ZOOM` no `script.js`.

## Acessibilidade

- Respeita a preferência do sistema por **movimento reduzido** (`prefers-reduced-motion`): animações e transições são desativadas.
- Layout responsivo para celular, tablet e desktop.

## Contato

Coordenação do laboratório: **bessa.jessyca@ifce.edu.br**
IFCE Campus Maranguape — CE

---

© 2026 LEIAH · IFCE Campus Maranguape
