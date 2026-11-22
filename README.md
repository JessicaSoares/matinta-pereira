# As Aventuras da Matinta — site

Versão local cinematográfica, sem build e sem dependências JavaScript. Abra index.html no navegador ou sirva a pasta com `python -m http.server 8086`.

## Mudanças — 22/11/2026

- Abertura com arte existente, logo do projeto, profundidade por cursor/scroll e partículas em canvas.
- Transformação Matinta/Rasga-Mortalha vinculada ao scroll, com botões alternativos.
- Assobio interativo com ondas, luzes e resposta textual. Áudio sintetizado opcional, habilitado por ação explícita; é uma prévia, não o áudio final do jogo.
- Vila ribeirinha com deslocamento suave e textos alinhados ao cânone atual. Promessa antes do resgate; retorno da fumaça; cobrança. Removida a caracterização de guardiã ambiental.
- Layout responsivo, foco de teclado, link para pular conteúdo, redução de movimento e som inicialmente desligado.
- Materiais copiados de images/ e de cenários existentes na raiz. Nenhuma mudança no projeto Unity.

## Validação

Sintaxe JavaScript validada com Node. Chrome local via CDP: desktop 1440×1000 e viewport móvel 390×844, sem overflow horizontal, erros de Console ou falhas na decodificação das imagens. Verificados seleção de forma, transformação por scroll, resposta do assobio, habilitação de áudio e redução de movimento. Capturas preview-*.png são locais e ignoradas pelo Git. qa-preview.py é um utilitário de conferência que usa Python padrão e um Chrome já iniciado na porta 9226, com servidor local na porta 8086.

## Pendências

Esta versão é local, sem envio ao GitHub ou publicação. A profundidade usa camadas 2D e transformações CSS 3D; não há modelos 3D/WebGL. As fontes externas têm fallback local. Ainda é necessário avaliar em aparelhos reais e ouvir/ajustar o assobio com o áudio definitivo do jogo. Os cenários e a arte de abertura são material de apresentação; não são capturas de gameplay.

### Correção de responsividade — 22/11/2026

A imagem final da vila mantinha a altura HTML de 724px ao reduzir a largura, deformando o cenário. Aplicado `height: auto` às imagens, com proporção 3:1 explícita na vila e preservação do enquadramento mobile. Títulos agora se ajustam entre 320px e 650px, botões de forma podem quebrar linha e o rodapé suporta telas estreitas.

Conferido no Chrome em larguras 320, 375, 390, 430, 768 e 1440px: proporção renderizada da vila igual à original (3:1), sem overflow horizontal e sem erros no Console. Captura local: preview-mobile-village.png.

### Mata em primeiro plano — 22/11/2026

Adicionadas quatro camadas decorativas na abertura, reutilizando os sheets transparentes de folhas e árvores do projeto via sprites CSS. Folhas com balanço leve e deslocamento em profundidades diferentes por scroll/cursor. Container decorativo com aria-hidden e pointer-events:none; conteúdo e botões permanecem acima das folhas. Redução de movimento desliga balanço e deslocamento. Ajustado o espaçamento da abertura em telas até 360px para manter o botão visível.

Chrome: verificados 1440×1000, 390×844 e 320×740, sem overflow horizontal; botão da abertura acessível por hit test; profundidade responde ao scroll e zera com redução de movimento; sem erros de Console. Assets carregados e capturas locais preview-forest-*.png. Sem publicação nesta etapa.

### Folhagens acompanhando o site — 22/11/2026

A camada de vegetação saiu da abertura e passou a ser fixa na viewport, acompanhando todas as seções. O deslocamento por scroll agora é oscilatório e limitado a 26px para as folhas não sumirem após a primeira tela. Máscara lateral deixa o centro livre; no celular, as folhas ficam mais discretas nas bordas. Preservados pointer-events:none, aria-hidden e redução de movimento.

Chrome: 1440×1000, 390×844 e 320×740, conferidas sete seções da abertura ao rodapé. Camada permanece na viewport, sem overflow horizontal; botão do assobio acessível; redução de movimento zera deslocamento; sem erros de Console. Capturas locais preview-forest-follow-*.png.

### Direção autoral, noite e personagens vivos — 22/11/2026

- Tipografia refeita com IM Fell English regular/itálica nos títulos e Alegreya Sans na leitura. Fontes hospedadas no projeto; licenças OFL em assets/fonts/. Nenhuma chamada ao Google Fonts em runtime. São fontes existentes, não uma fonte exclusiva desenhada para o jogo.
- Travessia noturna com lua ilustrada, nuvens, estrelas, floresta em camadas e Rasga-Mortalha animada, em posições conduzidas pelo scroll.
- Idle, transformação por scroll e voo usam frames originais do jogo, alinhados e reduzidos em três atlases (~3,7 MiB). prepare-animation.ps1 permite reconstruir os assets. Carregamento só perto das cenas; animação pausada fora da viewport, em aba oculta e com redução de movimento. Artes estáticas como fallback.
- Assobio acende a janela e a lanterna de uma casa ribeirinha, com pequenas respostas autorais em texto e áudio opcional. A resposta textual comunica o resultado também sem animação/som.
- Reflexos suaves no rio, textura sutil, encerramento com lua, seção que apresenta os gestos do jogo, navegação lateral por etapas e menu móvel acessível via teclado/Escape.
- Folhagens acompanham a página e mudam de intensidade por trecho. Todos os efeitos continuam decorativos, sem capturar cliques.

Validação: sintaxe JS conferida; Chrome em 1440×1000, 768×1024, 390×844 e 320×740, nove seções sem overflow horizontal. Fontes locais carregadas; atlases prontos; seletor de forma, janela acesa, resposta textual, áudio, menu móvel e redução de movimento conferidos. Capturas preview-autoral-*.png locais. Utilitário qa-art-direction.py complementa a conferência com interações e capturas.

Limites: animações e cenários apresentados são materiais do projeto, não capturas de gameplay. As falas da pequena cena da casa são texto autoral para o site. O áudio do assobio continua sintetizado. Aparelhos reais e Safari ainda não foram avaliados. A versão permanece local, sem publicação nem envio ao GitHub.

### Equipe — 22/11/2026

Criada a seção “Quem dá vida à Matinta”, antes do encerramento, com as seis integrantes dos cards fornecidos: Jéssica Soares, Rayda Lima, Lucila Bezerra, Mariana Ramos, Alyne Pacheco e Aline Verissimo. Retratos, nomes e funções foram preservados juntos em recortes por CSS dos cards originais, sem gerar ou retocar rostos. Cópias das imagens em assets/equipe/; originais da raiz intactos. Enquadramento de Aline ampliado para preservar o nome completo.

Biografias resumidas a partir dos textos dos cards, em details/summary nativo, com nomes e funções também acessíveis em texto. Três colunas no desktop, duas no tablet e uma no celular; sem efeitos adicionais sobre os retratos. Menu móvel e navegação lateral incluem a equipe. Folhagens mais discretas nesta seção.

Chrome: seis fotos carregadas; conferidos 1440, 768, 390 e 320px, sem overflow horizontal; biografias abrem e fecham nas quatro larguras; sem erros de Console. Recortes inspecionados visualmente em captura dos seis retratos e no celular. Corrigida também a leitura de frames WebSocket de 127 bytes no utilitário local de QA. Capturas locais preview-equipe-*.png. Nenhuma publicação ou envio ao GitHub.

### Cards compactos e interação por toque — 22/11/2026

Grade da equipe limitada a 870px no desktop (cards de até ~274px no viewport conferido), com três colunas também no tablet. No celular, faixa horizontal com scroll-snap suave por proximidade e cards de ~198–220px, preservando retratos e nomes. Biografias mantidas em controle “História” separado.

Retratos agora são botões nativos: inclinação de até seis graus por eixo, brilho localizado acompanhando cursor/toque e pequeno balanço ao ativar por clique, toque ou teclado. Não há captura de ponteiro nem bloqueio dos gestos nativos de rolagem. Inclinação é limpa ao sair, soltar, cancelar o gesto ou perder foco. Redução de movimento cancela o balanço e mantém apenas destaque visual.

Validação: sintaxe JS conferida; Chrome em 1440, 768, 390 e 320px, cards menores que 300px e sem overflow horizontal da página. Testados ativação do card, abertura/fechamento de biografias e redução de movimento. Gesto de toque horizontal real emulado via CDP desloca a faixa normalmente; Console sem erros. Capturas locais preview-equipe-play-*.png. Sem publicação.

### Site mais curto — 22/11/2026

Aplicada a revisão aprovada: removidos o link do GitHub, a seção “Um jogo de prestar atenção”, o marcador lateral de losangos e o encerramento extenso. Estrutura com cinco seções: abertura, promessa em dois parágrafos, transformação sob a lua, assobio na vila e equipe. Rodapé informa que o jogo está em desenvolvimento, sem inventar um novo canal de acompanhamento.

Lua, nuvens e floresta foram integradas à transformação/voo já existente; removida a cena noturna independente e seu canvas/controle extra. Vila virou ambientação da casa interativa, sem outra seção e sem repetir textos de território. Retirados círculos decorativos e frase extra da abertura; reduzidas textura e presença das folhagens fora da mata. Equipe compacta/interativa preservada. Navegação e utilitários de QA atualizados para os destinos restantes.

Validação: sintaxe JavaScript conferida; Chrome em 1440, 768, 390 e 320px. Cinco seções sem overflow horizontal; âncoras válidas; conteúdos removidos ausentes; seleção de forma/atlases, assobio/resposta, interação da equipe, biografias e redução de movimento conferidos; sem erros no Console. Capturas locais preview-enxuto-*.png. Versão local, sem publicação.

### Régua fixa de patrocínio PNAB — 22/11/2026

Adicionada faixa preta fixa no rodapé com a segunda linha (marcas brancas) da arte {2951766D-38D7-4462-90D4-F605EB00E90E}.png, copiada para assets/patrocinio-pnab.png. Mantidas ordem, desenho e proporções: PNAB, Secretaria de Cultura/Governo do Pará, Ministério da Cultura e Governo Federal/Brasil. Recorte por CSS preserva o arquivo original; não foram redesenhadas ou recoloridas marcas.

Desktop em uma linha; celular em dois grupos empilhados para legibilidade. Imagens com alternativas textuais. ResizeObserver reserva a altura exata no fim da página, incluindo safe area móvel. Ajustada a altura da cena sticky de transformação e sua legenda para permanecerem acima da faixa; indicador da abertura também reposicionado.

Validação: sintaxe JS conferida; Chrome em 1440×1000, 768×1024, 390×844 e 320×740. Faixa permanece na base da viewport, proporções preservadas, sem overflow horizontal; espaço final reservado e rodapé acessível; legenda sticky acima das marcas; imagens carregadas; sem erros no Console. Capturas locais preview-pnab-*.png. Versão local, sem publicação.

### Régua menor — 22/11/2026

Reduzida a largura das marcas à metade: 760→380px no desktop e 280→140px nos grupos móveis. Padding e espaçamento também reduzidos; preservadas as proporções e a reserva automática de espaço. Chrome: faixa com cerca de 59px no desktop e 98px no celular, sem overflow ou erros no Console.
