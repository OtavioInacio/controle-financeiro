# 💰 Controle Financeiro

Aplicativo web simples e leve para controlar as finanças pessoais mês a mês: recebimentos, gastos fixos, cartões de crédito, empréstimos, dívidas e gastos diversos, tudo em um só lugar.

Feito com **HTML, CSS e JavaScript puros**, sem frameworks, sem dependências e sem back-end. Todos os dados ficam salvos no seu próprio navegador.

## ✨ Funcionalidades

- **Resumo do mês**: mostra quanto sobra (ou falta), total de recebimentos, total de saídas e quanto ainda falta pagar, com uma barra colorida que divide as saídas por categoria e o percentual de cada uma em relação ao que você recebeu.
- **Navegação entre meses**: avance ou volte no calendário, ou volte rapidamente para o mês atual.
- **Copiar do mês anterior**: traz recebimentos e gastos fixos do último mês registrado para começar um novo mês sem digitar tudo de novo.
- **Histórico**: lista dos últimos 12 meses registrados com entrada, saída e saldo de cada um.
- **Seis categorias**:
  | Categoria | Para que serve |
  |---|---|
  | Recebimentos | Salário, renda extra e tudo que entra |
  | Gastos fixos | Aluguel, luz, internet, assinaturas |
  | Cartões de crédito | Compras parceladas |
  | Empréstimos | Parcelas de empréstimos e financiamentos |
  | Dívidas | Dívidas com valor total, pagas aos poucos |
  | Diversos | Mercado, lazer, transporte e outros |
- **Parcelamentos automáticos** (cartões e empréstimos): informe quantas parcelas faltam e o item aparece automaticamente nos meses seguintes, com barra de progresso ("parcela 3 de 10"). Também é possível **quitar o restante** de uma vez.
- **Controle de dívidas**: cadastre uma vez, registre pagamentos parciais mês a mês, veja o status (*Não iniciada*, *Em andamento*, *Quase quitada*, *Quitada*), a porcentagem paga, o valor restante e uma estimativa de parcelas que faltam.
- **Marcar como pago/recebido** com um clique, e ver o quanto ainda falta pagar ou receber.
- **Tema claro e escuro** automático, de acordo com a preferência do sistema.
- **Responsivo**: menu lateral no desktop e abas roláveis no celular.
- **Acessível**: foco visível, `aria-label` nos botões e navegação por teclado (Enter adiciona itens).

## 🚀 Como usar

Não precisa instalar nada.

1. Clone o repositório:
   ```bash
   git clone https://github.com/OtavioInacio/controle-financeiro.git
   ```
2. Abra o arquivo `index.html` no navegador.

Ou, se preferir, sirva localmente:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

### Publicando no GitHub Pages

1. Vá em **Settings → Pages** no repositório.
2. Em **Source**, escolha a branch `main` e a pasta `/ (root)`.
3. Salve e acesse o link gerado.

## 🗂️ Estrutura do projeto

```
├── index.html   # Estrutura da página
├── style.css    # Estilos, temas claro/escuro e layout responsivo
└── script.js    # Lógica, renderização e armazenamento dos dados
```

## 💾 Sobre os dados

- Tudo é salvo no **`localStorage`** do navegador, na chave `controle-financeiro-v2`.
- Nenhuma informação é enviada para servidores.
- Os dados ficam **apenas naquele navegador e dispositivo**. Limpar os dados do navegador apaga as informações.
- Há um botão **"Apagar tudo"** no rodapé do Resumo (pede confirmação com um segundo clique).
- Dados da versão anterior (`controle-financeiro-v1`) são migrados automaticamente.

## 🛠️ Tecnologias

- HTML5
- CSS3 (variáveis CSS, Grid, Flexbox, `prefers-color-scheme`)
- JavaScript (ES6+)
- Fonte [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) via Google Fonts

## 🔮 Ideias futuras

- [ ] Exportar e importar dados (JSON/CSV)
- [ ] Gráficos de evolução mensal
- [ ] Categorias personalizadas
- [ ] Instalação como PWA e uso offline

## 🤝 Contribuindo

Sugestões e pull requests são bem-vindos:

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça o commit: `git commit -m "Adiciona minha feature"`
4. Envie: `git push origin minha-feature`
5. Abra um Pull Request

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais informações.
