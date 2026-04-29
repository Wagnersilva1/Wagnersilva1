# Como fazer este design aparecer no seu perfil do GitHub

O GitHub mostra um README no perfil apenas quando o repositorio tem exatamente o mesmo nome do seu usuario.

Para o usuario `Wagnersilva1`, o repositorio precisa ser:

```text
Wagnersilva1/Wagnersilva1
```

## Passos

1. Crie um repositorio publico no GitHub chamado `Wagnersilva1`.
2. Coloque o arquivo `README.md` deste projeto na raiz desse repositorio.
3. Faca commit e push.

Comandos, se esta pasta for o repositorio correto:

```bash
git init
git add README.md PROFILE_SETUP.md
git commit -m "Add GitHub profile README"
git branch -M main
git remote add origin https://github.com/Wagnersilva1/Wagnersilva1.git
git push -u origin main
```

Se o repositorio remoto ja existir nesta pasta, use apenas:

```bash
git add README.md PROFILE_SETUP.md
git commit -m "Update GitHub profile README"
git push
```

## Observacao importante

Os arquivos `index.html`, `styles.css` e `app.js` podem funcionar como uma pagina separada, mas eles nao aparecem automaticamente no topo do perfil do GitHub. O perfil usa o `README.md`.
