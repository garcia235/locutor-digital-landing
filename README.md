# Locutor Digital · Landing page

Landing page do **Locutor Digital**, plataforma enterprise de rádio indoor, automação de campanhas e IA para redes de varejo, da Studio Delf.

Conteúdo baseado na apresentação executiva enterprise (outubro de 2026). Visual construído seguindo a skill [landing-page-design](https://www.ui-skills.com/skills/elayadesign/landing-page-design).

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Página principal |
| `styles.css` | Tokens (espaçamento, tipografia, raio, movimento) e componentes |
| `main.js` | Onda do player, revelação no scroll, tagline palavra por palavra, menu mobile, formulário |
| `404.html` | Página de erro |
| `privacidade.html`, `termos.html` | Páginas legais (texto a definir) |
| `favicon.svg`, `og-image.png` | Ícone e imagem de compartilhamento |

Site estático, sem build. Para ver localmente:

```bash
python3 -m http.server 8000
```

## Antes de publicar

- **Formulário:** defina `FORM_ENDPOINT` no topo de `main.js` (Formspree, webhook do n8n ou endpoint próprio que aceite POST em JSON). Sem isso, o formulário valida os campos e avisa que o envio não está ativo.
- **Textos legais:** substitua o conteúdo provisório de `privacidade.html` e `termos.html`.
- **og:image:** quando houver domínio definitivo, troque `og-image.png` por URL absoluta nas meta tags de `index.html`.
