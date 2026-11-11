// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// systemPrompt() do artifact, copiado verbatim. Fica no SERVIDOR porque depende
// dos ~414 KB de texto do livro (lib/server/book/*.json), que nunca devem ir
// para o navegador, e porque é aqui que a chave de API é usada.
// @ts-nocheck
import REGRAS from '@/lib/oracle/data/regras.json';
import LIVROS from '@/lib/oracle/data/livros.json';
import SECULO from '@/lib/oracle/data/seculo.json';

export type BookText = { textos: Record<string, string>; geral: string };

export type PromptInput = {
  era: string;
  char: Record<string, any>;
  caso: Record<string, any>;
  cena: string;
  /** PdDs em cena, já formatados pelo cliente via fmtNpc(). */
  naCena: string[];
  /** Quando a resposta é a fala de um PdD. */
  npc?: { n: string; perfil: string } | null;
  /** Resumo rolante da crônica, quando já existe (memória longa). */
  resumo?: string;
  prefs: { tamanhoNarracao?: string; modeloIA?: string };
  book: BookText;
};

// Os globais do artifact, como em lib/oracle/logic.tsx.
const SV_REGRAS: any = REGRAS;
const SV_LIVROS: any = LIVROS;
const SV_SECULO: any = SECULO;

// ---------------------------------------------------------------- prelúdio
//
// O prelúdio inteiro do artifact, verbatim, porque systemPrompt() usa dele
// bem mais do que parece: stateOf, invList, hn, HAB_ERA, nomePapel, R()...
// Copiar a mao so' o que parece necessario era escolher a dedo o fecho de uma
// funcao alheia — e foi assim que o v3 quebrou, quando o designer passou a
// chamar mais tres helpers daqui. Nada no prelúdio toca DOM em tempo de
// carga (o que toca esta' dentro de corpo de funcao), entao roda no servidor.

const LS0 = 'sv-cronica-v2';
/* perfis: login simples (nome + PIN opcional), sem e-mail nem confirmação */
const SVP={ get(k,d){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){ return d; } }, put(k,v){ try{ v==null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v)); }catch(e){} },
  cur(){ return this.get('sv-perfil-atual',null); }, setCur(p){ this.put('sv-perfil-atual',p); }, list(){ return this.get('sv-perfis',[]); }, saveList(l){ this.put('sv-perfis',l); } };
function svSlug(t){ return String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40); }
async function svHash(t){ try{ const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('sv:'+t)); return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''); }catch(e){ let h=7; for(const ch of String(t)) h=(h*31+ch.charCodeAt(0))|0; return 'x'+h; } }
function lsKey(){ const p=SVP.cur(); return p&&p.slug?LS0+'::'+p.slug:LS0; }
const TABS = [['cronica','Crônica'],['caso','Caso'],['ficha','Ficha'],['elenco','Elenco'],['cidade','Cidade'],['seculo','Século'],['tutorial','Como jogar']];
/* nome do papel pronto: sinônimo do ofício + adjetivo da trilha (o id interno a.n não muda) */
const PAPEL_NOME={"Pena|Advogado": "Jurista Letrado", "Pena|Médico": "Clínico Ilustrado", "Pena|Jornalista": "Repórter Letrado", "Pena|Herdeiro": "Grã-fino Ilustrado", "Pena|Detetive": "Investigador Erudito", "Pena|Tira": "Policial Analítico", "Pena|Auditor": "Calculista Meticuloso", "Pena|Artista": "Pianista Erudito", "Pena|Pugilista": "Lutador Analítico", "Pena|Veterano": "Combatente Analítico", "Pena|Contrabandista": "Muambeiro Meticuloso", "Pena|Vigarista": "Embusteiro Meticuloso", "Distintivo|Advogado": "Jurista Nomeado", "Distintivo|Médico": "Legista Oficial", "Distintivo|Jornalista": "Setorista Credenciado", "Distintivo|Herdeiro": "Sucessor Nomeado", "Distintivo|Detetive": "Agente Licenciado", "Distintivo|Tira": "Policial Juramentado", "Distintivo|Auditor": "Perito Juramentado", "Distintivo|Artista": "Cantor Contratado", "Distintivo|Pugilista": "Lutador Contratado", "Distintivo|Veterano": "Combatente Condecorado", "Distintivo|Contrabandista": "Atravessador Autorizado", "Distintivo|Vigarista": "Trapaceiro Credenciado", "Navalha|Advogado": "Rábula Marginal", "Navalha|Médico": "Doutor Clandestino", "Navalha|Jornalista": "Repórter Desgarrado", "Navalha|Herdeiro": "Sucessor Desgarrado", "Navalha|Detetive": "Farejador Bruto", "Navalha|Tira": "Policial Clandestino", "Navalha|Auditor": "Cobrador Calejado", "Navalha|Artista": "Dançarina Avulsa", "Navalha|Pugilista": "Boxeador Calejado", "Navalha|Veterano": "Combatente Desgarrado", "Navalha|Contrabandista": "Atravessador Clandestino", "Navalha|Vigarista": "Trapaceiro Errante"};
const nomePapel = a => !a ? '' : a.papel ? a.papel : (a.epoca ? a.n : (PAPEL_NOME[a.grupo+'|'+(a.ocup||a.n)] || a.n));
const nomePapelDe = (era,n) => { const RR=(SV_REGRAS||{})[era]; const a=RR&&(RR.arquetipos||[]).find(x=>x.n===n); return a?nomePapel(a):n; };
/* kit de ofício (1934): ofício dá o kit; a trilha escolhe arma, veículo e QG; a motivação dá uma lembrança */
const KIT_OFICIO={"Advogado": ["pasta de couro com procurações em branco, Código Penal anotado e cartões de visita", ["Derringer .41 escondida na pasta", "Colt Pocket .32 com porte", "navalha de barbear no bolso do colete"], ["táxi da Yellow Cab com conta aberta", "Packard do escritório, com motorista", "o bonde da linha 4"], ["escritório no 3º andar do Edifício Halloway", "sala no Fórum, ao lado do cartório", "mesa do fundo no Café Palermo"]], "Médico": ["maleta preta com estetoscópio, bisturis, morfina e receituário", ["bisturi de bolso", "Colt Police Positive .38 da polícia", "Smith & Wesson .32 no fundo da maleta"], ["Ford Model A com placa de médico", "ambulância do Hospital Municipal, quando livre", "carona com o motorista da funerária"], ["consultório na Calle del Hospital", "sala do legista no porão da Central", "quartinho nos fundos de uma farmácia em Chinatown"]], "Jornalista": ["bloco de notas, câmera Speed Graphic com flash e crachá de imprensa", ["soco-inglês esquecido na gaveta", "Colt .25 de bolso", "cassetete de couro"], ["o bonde e as próprias pernas", "Chevrolet surrado da redação", "moto Indian Scout de segunda mão"], ["mesa no arquivo morto da Gazeta", "sala de imprensa da Central", "quarto 12 do Hotel Mirador, pago por semana"]], "Herdeiro": ["talão de cheques, carteirinha do clube e agenda com os telefones de White Hills", ["bengala com espada embutida", "Browning .25 cromada", "Luger que o tio trouxe da guerra"], ["Duesenberg da família", "Cadillac com chofer", "roadster vermelho penhorado duas vezes"], ["biblioteca da mansão em White Hills", "suíte no Grand Hotel", "quarto de pensão em Saint Edwiges"]], "Detetive": ["licença na parede, máquina de escrever, lupa, chaves mestras e uma garrafa na gaveta", ["Webley de bolso, quase nunca usado", "Colt .38 Detective Special com porte", ".45 sem registro"], ["táxi e boas solas", "Ford V8 do escritório", "Plymouth emprestado de um informante"], ["escritório no 2º andar, com porta de vidro fosco", "agência no Edifício Commerce", "quarto 7 do Motel Bayview"]], "Tira": ["distintivo, algemas, apito e caderneta de ocorrências", ["Colt .38 de serviço, só usado no estande", "Colt Official Police .38 e uma Thompson na viatura", ".38 de cano curto no tornozelo"], ["camionete da Polícia Técnica", "radiopatrulha Ford", "carro apreendido, sem placa"], ["laboratório da Polícia Técnica", "a Central, mesa da Homicídios", "banco do balcão no O’Rourke’s"]], "Auditor": ["pasta com apólices, máquina de somar portátil, lápis e régua", ["guarda-chuva com ponta de ferro", "Colt .32 da companhia", "soco-inglês no bolso do sobretudo"], ["o bonde", "Chevrolet da Pacific Mutual", "caminhão de mudanças do cunhado"], ["sala de arquivo da seguradora", "escritório da Pacific Mutual em Downtown", "mesa nos fundos de uma casa de penhores"]], "Artista": ["partituras, piteira, estojo de maquiagem e o contrato do clube", ["abridor de cartas de prata", "Derringer presa na liga", "navalha na bolsa"], ["táxi pago por um admirador", "carro do dono do clube", "o último bonde da noite"], ["quarto no andar de cima do clube", "camarim do Golden Slipper", "quarto de motel com o letreiro quebrado"]], "Pugilista": ["luvas, bandagens, toalha e a agenda do ginásio", ["os punhos e uma toalha molhada", "soco-inglês de latão", "taco de beisebol serrado"], ["bicicleta de entregador", "carro do empresário", "caminhão de gelo do primo"], ["academia do velho Kowalski", "vestiário da Arena Hall", "porão das lutas clandestinas"]], "Veterano": ["farda guardada, binóculo, mapa da cidade e as medalhas numa caixa", ["Colt M1911 de oficial", "fuzil Springfield com mira", "faca de trincheira"], ["motocicleta Harley do exército", "caminhão da Legião Americana", "carona em vagão de carga"], ["sala da Legião Americana", "posto da Guarda Nacional", "pensão de veteranos no Waterford"]], "Contrabandista": ["cartas náuticas, lanterna de sinais e livros-caixa em código", ["Colt .32 no bolso do casaco", "espingarda de cano duplo na cabine", "Thompson .45 embrulhada em lona"], ["lancha a motor de 12 metros", "caminhão de entregas com fundo falso", "lancha rápida, de luzes apagadas"], ["escritório do armazém no Píer 9", "sala da alfândega", "túnel sob o Café Palermo"]], "Vigarista": ["baralho marcado, dados viciados, cartões de visita falsos e um terno bom", ["caneta-tinteiro com lâmina", "Derringer no punho da camisa", "navalha e pernas rápidas"], ["táxi com o motorista comprado", "Packard alugado para impressionar", "o carro roubado da semana"], ["gráfica clandestina num porão", "suíte de hotel paga com cheque sem fundo", "quarto de motel pago por noite"]]};
const KIT_LEMB={"Justiça": "recorte de jornal do caso que ninguém resolveu", "Dinheiro": "envelope com a última parcela de uma dívida", "Vingança": "fotografia com um rosto riscado", "Redenção": "medalha de santo de alguém que você deixou na mão", "Curiosidade": "caderno com os casos que ainda não fecharam", "Lealdade": "isqueiro gravado de um velho parceiro", "Dever": "carta de recomendação que você nunca usou", "Amor": "fotografia de alguém que não está mais aqui", "Contrato": "cartão de visita de quem paga a conta", "Cruzada": "lista de nomes, metade riscada"};
const KIT_TRI={'Pena':0,'Distintivo':1,'Navalha':2};
/* 1994: ofícios do cinema pulp; trilhas Papo, Terno e Cano */
const SUG94={"Papo|Fiador": [["Fiador dos Esquecidos", "paga a fiança de quem ninguém vai buscar"], ["Fiador de Dez por Cento", "cobra a taxa, guarda o recibo e não pergunta mais nada"], ["Fiador Cansado", "dezenove anos de fianças; quer sair limpo de um último caso"], ["Fiador Apaixonado", "pagou a fiança de alguém e não conseguiu esquecer"]], "Terno|Fiador": [["Fiador do Juiz", "o tribunal confia nele e ele confia no tribunal"], ["Fiador da Família", "solta os rapazes do Chefão antes do café"], ["Fiador Arrependido", "assinou a fiança de quem matou depois"], ["Fiador de Arquivo", "sabe de cor a ficha de metade da cidade"]], "Cano|Fiador": [["Caçador de Fugitivos", "traz de volta quem fugiu, vivo e a tempo"], ["Caçador de Recompensa", "só sai de casa por dez por cento"], ["Caçador com Conta", "procura o mesmo fugitivo há anos"], ["Rastreador de Rodoviária", "conhece cada ônibus que sai da cidade às duas da manhã"]], "Papo|Balconista": [["Balconista Justiceiro", "decorou quem aluga o quê e sabe quem está mentindo"], ["Balconista Revendedor", "aluga fitas e vende o que não está na prateleira"], ["Balconista Fugitivo", "largou tudo por uma garota e uma mala"], ["Cinéfilo de Balcão", "vive dentro dos filmes e vê a cidade como um deles"]], "Terno|Balconista": [["Gerente Honesto", "fecha o caixa no centavo e não fecha os olhos"], ["Gerente de Rede", "bate a meta e vende o cadastro por fora"], ["Funcionário do Mês Caído", "perdeu o crachá por uma fita que não devia ter visto"], ["Arquivista de Cadastro", "descobre quem é alguém pelo que ele aluga"]], "Cano|Balconista": [["Pirata do Povo", "copia o que a televisão esconde e distribui de graça"], ["Camelô de Fitas", "vende de tudo na calçada da Strip"], ["Pirata Marcado", "gravou o que não devia e agora fugir é rotina"], ["Rato de Rádio", "escuta a frequência da polícia a noite toda"]], "Papo|Faxineiro": [["Resolvedor de Problemas", "chega em dez minutos e todo mundo obedece"], ["Faxineiro de Tarifa", "cobra por hora, com taxa de urgência"], ["Faxineiro com Consciência", "limpou uma cena que não devia e não esquece"], ["Faxineiro Perfeccionista", "não suporta um detalhe fora do lugar"]], "Terno|Faxineiro": [["Faxineiro de Confiança", "o Chefão liga para ele antes de ligar para o advogado"], ["Faxineiro da Folha", "está na folha de pagamento da Família"], ["Faxineiro em Dívida", "limpa para pagar um favor antigo"], ["Faxineiro de Smoking", "resolve problema de festa sem amassar o terno"]], "Cano|Faxineiro": [["Dono do Desmanche", "some com o carro antes de o dono perceber"], ["Prensa de Aluguel", "prensa qualquer coisa por um preço"], ["Coveiro Clandestino", "sabe onde estão os que ninguém procura"], ["Mecânico Curioso", "acha as coisas mais estranhas nos porta-malas"]], "Papo|Matador": [["Matador Pregador", "recita o versículo antes de decidir"], ["Matador de Hambúrguer", "discute o cardápio e cobra o serviço"], ["Matador em Retiro", "viu um milagre e quer largar a vida"], ["Matador Tagarela", "conversa sobre tudo, inclusive o que não devia"]], "Terno|Matador": [["Matador de Palavra", "faz o serviço e não toca em quem não está no contrato"], ["Matador de Terno Preto", "pontual, limpo e caro"], ["Matador Arrependido", "quer devolver a maleta e sair vivo"], ["Acompanhante da Esposa", "mandado levar a mulher do chefe para jantar"]], "Cano|Matador": [["Matador da Lista", "só caça quem fez mal a alguém"], ["Atirador de Aluguel", "atira para quem paga mais"], ["Matador Vingativo", "tem um nome riscado para cada noite ruim"], ["Casal na Estrada", "foge com quem ama e deixa um rastro"]], "Papo|Infiltrado": [["Dedo-duro Honesto", "conta à polícia só o que é verdade"], ["Informante Pago", "vende nomes por semana"], ["Dedo-duro Arrependido", "entregou um amigo e quer desfazer"], ["Ouvido de Bar", "sabe de tudo porque ninguém repara nele"]], "Terno|Infiltrado": [["Infiltrado Leal", "vai até o fim pela farda"], ["Agente de Dois Salários", "recebe da polícia e do bando"], ["Infiltrado Sangrando", "levou um tiro e ainda não pode contar quem é"], ["Ator do Departamento", "ensaia a história até acreditar nela"]], "Cano|Infiltrado": [["Ex-tira Solitário", "a polícia o esqueceu; ele não esqueceu o caso"], ["Infiltrado Vendido", "trocou de lado e não sabe mais qual é o seu"], ["Infiltrado Traído", "quer achar quem entregou a cobertura"], ["Infiltrado Apaixonado", "se apaixonou por alguém do bando"]], "Papo|Aeromoça": [["Aeromoça Testemunha", "viu o que acontecia na primeira classe"], ["Aeromoça de Recados", "leva bilhetes de passageiros por um envelope"], ["Aeromoça na Última Chance", "salário de fome e uma última jogada"], ["Aeromoça Poliglota", "fala quatro idiomas e escuta em todos"]], "Terno|Aeromoça": [["Comissária Exemplar", "a companhia confia nela e ela não esquece por quê"], ["Aeromoça Contrabandista", "traz cinquenta mil dólares na bolsa a cada voo"], ["Aeromoça Encurralada", "a Federal e o fornecedor querem a mesma coisa dela"], ["Aeromoça do Fiador", "alguém pagou a sua fiança e não pediu nada em troca"]], "Cano|Aeromoça": [["Mula Honesta", "entrega o pacote fechado e não abre"], ["Mula da Fronteira", "atravessa Tijuana e volta antes da janta"], ["Mula Fugitiva", "sumiu com a carga e precisa devolver"], ["Mula Curiosa", "abriu um pacote uma vez e não parou mais"]], "Papo|Boxeador": [["Treinador da Academia", "tira moleque da rua com luva e conversa"], ["Treinador de Apostas", "sabe quem cai e em que assalto"], ["Campeão Arruinado", "foi campeão; hoje ensina por café"], ["Treinador Leitor", "lê o adversário como um livro"]], "Terno|Boxeador": [["Pugilista de Palavra", "não entrega a luta que mandam perder"], ["Boxeador do Empresário", "luta onde o Chefão manda"], ["Boxeador Endividado", "precisa pagar a luta que não perdeu"], ["Boxeador do Relógio", "atravessa a cidade por um relógio de ouro"]], "Cano|Boxeador": [["Lutador de Estacionamento", "briga por quem não pode brigar"], ["Lutador de Rinha", "apanha por dinheiro nos fundos de Chinatown"], ["Boxeador Fugitivo", "venceu quando devia perder e fugiu"], ["Lutador de Kung Fu", "aprendeu na academia e viu filmes demais"]], "Papo|Assaltante": [["Golpista Robin Hood", "só rouba quem rouba"], ["Golpista de Lanchonete", "calcula o risco entre o café e o assalto"], ["Golpista Aposentado", "prometeu à namorada que era o último"], ["Golpista de Charada", "ama o plano mais que o dinheiro"]], "Terno|Assaltante": [["Profissional de Código", "não atira em civil e não deixa parceiro"], ["Assaltante de Diamantes", "o golpe do ano e a parte de cada um"], ["Sobrevivente do Bando", "o plano deu errado e alguém dedurou"], ["Assaltante de Codinome", "só conhece os parceiros pela cor"]], "Cano|Assaltante": [["Ladrão de Bairro", "rouba a loja de quem explora o bairro"], ["Assaltante de Balcão", "todo mundo no chão e ninguém se machuca"], ["Assaltante em Fuga", "foge para o México com o que sobrou"], ["Assaltante Apaixonado", "rouba ao lado de quem ama"]], "Papo|Traficante": [["Fornecedor Arrependido", "quer tirar uma cliente do buraco"], ["Fornecedor de Roupão", "entrega em White Hills e atende de pijama"], ["Ex-traficante em Dívida", "largou o pó e ainda paga"], ["Químico de Cozinha", "sabe o que tem em cada saquinho"]], "Terno|Traficante": [["Traficante de Regras", "não vende para criança e não batiza"], ["Gerente de Boca", "conta o dinheiro da Família toda noite"], ["Traficante Delator", "fala com a polícia para salvar a pele"], ["Traficante Colecionador", "troca mercadoria por discos, fitas e segredos"]], "Cano|Traficante": [["Guardião da Esquina", "protege a esquina do pó batizado"], ["Atravessador do Cais", "compra no cais e vende na Strip"], ["Traficante com Seringa", "guarda uma injeção de adrenalina para os amigos"], ["Traficante Viciado", "prova o que vende e quer saber de onde vem"]]};
const KIT94={"Fiador": ["pasta de fianças, bip, talão de recibos e cópias das fichas criminais", ["revólver .38 no porta-luvas", "Glock 17 com porte", "espingarda de cano serrado no banco de trás"], ["Cadillac Seville 1980 de segunda mão", "Lincoln Town Car do escritório", "picape Ford com grade no banco de trás"], ["escritório de fianças em frente ao Fórum", "sala no anexo da Delegacia Central", "mesa no bar em frente à rodoviária"]], "Balconista": ["fichário de clientes, walkman, câmera VHS e uma pilha de fitas atrasadas", ["taco de beisebol debaixo do balcão", "revólver .38 do gerente, no cofre", "Colt .45 comprada de um desconhecido no banheiro"], ["Pinto 1978 sem silencioso", "van da loja com o logotipo", "bicicleta e o ônibus da madrugada"], ["o balcão da Zachary Video", "sala da gerência da filial da Strip", "quartinho nos fundos da loja de quadrinhos"]], "Faxineiro": ["maleta com luvas, sacos, lençóis, desinfetante e um número de telefone", ["nenhuma: o telefone resolve", "Beretta 92 com silenciador", "pé de cabra e uma pá no porta-malas"], ["Acura NSX prateado", "Mercedes preta da Família", "guincho do ferro-velho"], ["mesa de canto no restaurante de um amigo", "o salão de sinuca do Chefão", "escritório do ferro-velho"]], "Matador": ["terno preto, gravata fina, maleta trancada e uma caderneta de endereços", ["revólver .357 Magnum", "pistola .45 com dois pentes e uma Uzi no porta-malas", "pistola sem número de série"], ["Chevy Nova 1974", "Malibu 1964 conversível", "Pontiac tirado de um estacionamento"], ["a lanchonete Hawthorne Grill", "o bar do Chefão", "quarto de motel pago por semana"]], "Infiltrado": ["documentos falsos, bip, gravador colado no peito e uma história ensaiada", ["revólver .38 de cano curto", "Smith & Wesson 5906 do departamento", "pistola tirada de um preso"], ["Mustang emprestado de um informante", "Crown Victoria descaracterizada", "carro com placa fria"], ["o bar onde o bando se encontra", "apartamento seguro da polícia", "armazém abandonado no cais"]], "Aeromoça": ["uniforme da companhia, bolsa com fundo falso, crachá da tripulação e passaporte carimbado", ["spray de pimenta na bolsa", "revólver .38 emprestado pelo fiador", "pistola .380 presa na meia"], ["Honda Civic 1985", "van da tripulação até o aeroporto", "carro alugado em nome de outra pessoa"], ["apartamento perto do aeroporto", "sala da tripulação no Terminal 2", "bar do hotel do aeroporto"]], "Boxeador": ["luvas, bandagens, roupão do clube e o relógio de ouro do pai", ["os punhos e uma conversa calma", "revólver .38 emprestado pelo empresário", "katana tirada de uma loja de penhores"], ["Honda Civic emprestado da namorada", "Cadillac do empresário", "chopper de alguém que não vai mais precisar"], ["academia de boxe do bairro", "vestiário do ginásio de lutas", "motel barato na saída da cidade"]], "Assaltante": ["planta do lugar, meia-calça, relógio acertado e a lista de codinomes", ["revólver de brinquedo que parece de verdade", "pistolas 9 mm limpas, do organizador", "escopeta calibre 12 e duas pistolas"], ["carro da namorada", "sedã roubado com placa trocada", "picape de fuga com tanque cheio"], ["mesa da janela na lanchonete", "depósito do organizador", "galpão abandonado na zona industrial"]], "Traficante": ["balança, saquinhos, bip, caderno de fiado e uma seringa de adrenalina na gaveta", ["nenhuma: a namorada guarda o .38", "submetralhadora da Família debaixo do sofá", "9 mm no cós da calça"], ["Mercedes 1978", "BMW apreendida e devolvida", "bicicleta e o orelhão da esquina"], ["casa de porta sempre aberta em White Hills", "apartamento de entrega no Waterford", "a esquina da Torre F"]]};
const KIT_LEMB94={"Justiça": "fita VHS com uma confissão que nenhum tribunal aceitou", "Dinheiro": "maleta trancada que você ainda não abriu", "Vingança": "lista com cinco nomes, dois riscados", "Redenção": "Bíblia de bolso de alguém que você não salvou", "Curiosidade": "caderno com placas de carro e horários", "Lealdade": "relógio de ouro de um velho parceiro", "Dever": "distintivo antigo de alguém da família", "Amor": "fita cassete gravada por alguém que foi embora"};
const KIT_TRI94={'Papo':0,'Terno':1,'Cano':2};
const TRI_34_94={'Pena':'Papo','Distintivo':'Terno','Navalha':'Cano'};
const PH={'1934':{fontes:['a filha Molly','o balcão do O’Rourke’s','a missa de domingo'],vicio:'Uísque irlandês',segredo:'Fui eu que entreguei o Danny aos Moretti.',regras:'Não atiro pelas costas. Não deixo criança no meio. Não aceito dinheiro de tira.',equip:'Escolha ofício e trilha para receber o kit.'},
 '1994':{fontes:['a irmã caçula, que ainda acredita em você','a lanchonete 24 horas da Strip','a sessão dupla de sexta'],vicio:'Bourbon e cigarro mentolado',segredo:'Fui eu que troquei a maleta no estacionamento.',regras:'Não atiro em quem está de joelhos. Não abro a maleta. Não falo com a Federal.',equip:'Escolha ofício e trilha para receber o kit de 1994.'}};
const HAB_ERA={'1994':{'Criptografia':'Informática','Fotografia':'Foto e Vídeo','Mecânica':'Mecânica e Eletrônica','Briga de Rua':'Artes Marciais'}};
const hn=(era,k)=>(HAB_ERA[era]||{})[k]||k;
const IMP_RX=[[/os Ímpetos ficam intactos/g,'a Adrenalina fica intacta'],[/Não voltam sozinhos a cada caso: só se recuperam/g,'Não volta sozinha a cada caso: só se recupera'],[/Cada jogador tem os seus\./g,'Cada jogador tem a sua.'],[/(\d+) Ímpetos?/g,'$1 de Adrenalina'],[/\bum Ímpeto/g,'1 de Adrenalina'],[/\b(o|O) seu Ímpeto/g,'a sua Adrenalina'],[/\b(o|O)s? Ímpetos?/g,(m,a)=>(a==='O'?'A':'a')+' Adrenalina'],[/\bdo Ímpeto/g,'da Adrenalina'],[/Sem Ímpetos?/g,'Sem Adrenalina'],[/Ímpetos?/g,'Adrenalina'],[/IMPETOS?/g,'ADRENALINA']];
const impT=s=>(typeof s==='string'&&/mpeto|MPETO/.test(s))?IMP_RX.reduce((a,[r,b])=>a.replace(r,b),s):s;
const impDeep=(v,d=0)=>{ if(typeof v==='string') return impT(v); if(d>12||v==null||typeof v!=='object') return v; if(Array.isArray(v)) return v.map(x=>impDeep(x,d+1)); const pr=Object.getPrototypeOf(v); if(pr!==Object.prototype&&pr!==null) return v; const o={}; for(const k in v){ o[k]=(k==='char'||k==='caso')?v[k]:impDeep(v[k],d+1); } return o; };
const PH_ERA = era => PH[era]||PH['1934'];
const KIT_DA={'1934':[KIT_OFICIO,KIT_TRI,KIT_LEMB],'1994':[KIT94,KIT_TRI94,KIT_LEMB94]};
const trilhasDe = era => ((SV_REGRAS||{})[era]||{}).arquetiposGrandes || (SV_REGRAS||{}).comum.arquetiposGrandes || [];
const R = () => SV_REGRAS, L = () => SV_LIVROS, S = () => SV_SECULO;
const ERAS = ['1934','1994'];
const modsOf = e => (SV_REGRAS && SV_REGRAS[e] && SV_REGRAS[e].mods) || [];
const triCount = fios => { const E=new Set(), V=new Set(); (fios||[]).filter(f=>f.st==='firme').forEach(f=>{E.add(f.a+'|'+f.b);E.add(f.b+'|'+f.a);V.add(f.a);V.add(f.b);}); const v=[...V]; let n=0; for(let i=0;i<v.length;i++)for(let j=i+1;j<v.length;j++)for(let k=j+1;k<v.length;k++) if(E.has(v[i]+'|'+v[j])&&E.has(v[j]+'|'+v[k])&&E.has(v[i]+'|'+v[k])) n++; return n; };
const SV_ROLLS = [];
const rnd = n => { const v = 1 + Math.floor(Math.random()*n); if(SV_ROLLS.length<40) SV_ROLLS.push({n,v}); return v; };
const SV_PIPS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function svToast(msg){
  try{
    const old=document.querySelector('.sv-toast'); if(old) old.remove();
    const el=document.createElement('div'); el.className='sv-toast'; el.setAttribute('role','status'); el.textContent=msg;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.style.animation='none';
    document.body.appendChild(el); setTimeout(()=>el.remove(),2300);
  }catch(e){}
}
function svThrowDice(rolls){
  try{
    if(!rolls.length) return;
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let stage=document.getElementById('svd-stage');
    if(stage) stage.remove();
    stage=document.createElement('div'); stage.id='svd-stage'; stage.className='svd-stage';
    document.body.appendChild(stage);
    const W=window.innerWidth, H=window.innerHeight;
    const n=Math.min(rolls.length,10), S=n>4?54:n>1?64:78;
    const tx=W*(0.22+Math.random()*0.56), ty=H*(0.30+Math.random()*0.45);
    const fromLeft=Math.random()<0.5;
    const FACE={1:[0,0],6:[0,180],3:[0,-90],4:[0,90],2:[-90,0],5:[90,0]};
    const dur=1500;
    rolls.slice(0,10).forEach((r,i)=>{
      const ang=i*2.4, rad=n>1?S*0.62*Math.sqrt(i+0.6):0;
      const ex=tx+Math.cos(ang)*rad-S/2, ey=ty+Math.sin(ang)*rad-S/2;
      const sx=fromLeft?-S*2-Math.random()*80:W+S+Math.random()*80, sy=H*(0.55+Math.random()*0.5);
      const sh=document.createElement('div'); sh.className='svd-shadow'; sh.style.setProperty('--s',S+'px');
      const wrap=document.createElement('div'); wrap.className='svd-wrap'; wrap.style.setProperty('--s',S+'px');
      const cube=document.createElement('div'); cube.className=r.n===6?'svd-cube':'svd-chip';
      if(r.n===6){
        const core=['','rotateY(90deg)','rotateX(90deg)'].map(tf=>'<div class="svd-core" style="transform:'+tf+'"></div>').join('');
        const faces=[[1,'translateZ(var(--h))'],[6,'rotateY(180deg) translateZ(var(--h))'],[3,'rotateY(90deg) translateZ(var(--h))'],[4,'rotateY(-90deg) translateZ(var(--h))'],[2,'rotateX(90deg) translateZ(var(--h))'],[5,'rotateX(-90deg) translateZ(var(--h))']]
          .map(([v,tf])=>'<div class="svd-face" style="transform:'+tf+'">'+Array.from({length:9},(_,k)=>'<span class="svd-pip'+(SV_PIPS[v].includes(k)?(v===1?' on red':' on'):'')+'"></span>').join('')+'</div>').join('');
        cube.innerHTML=core+faces; cube.style.setProperty('--h',(S/2)+'px');
      } else {
        cube.innerHTML='<div class="svd-chipface">'+r.v+'</div><div class="svd-chipface back">'+r.v+'</div>';
      }
      wrap.appendChild(cube); stage.appendChild(sh); stage.appendChild(wrap);
      const L=(a,b,p)=>a+(b-a)*p;
      const path=[[0,0,1.9],[.40,.78,1],[.56,.9,1.24],[.72,.97,1],[.82,.99,1.08],[.9,1,1],[1,1,1]];
      const d=i*45;
      wrap.animate(path.map(([o,p,sc],k)=>({offset:o,transform:`translate(${L(sx,ex,p)}px,${L(sy,ey,p)}px) scale(${sc})`,easing:k%2===0?'cubic-bezier(.4,0,.9,.6)':'cubic-bezier(.1,.4,.6,1)'})),{duration:dur,delay:d,fill:'both'});
      sh.animate(path.map(([o,p,sc])=>{ const h=sc-1; return {offset:o,transform:`translate(${L(sx,ex,p)+6+h*70}px,${L(sy,ey,p)+10+h*90}px) scale(${1+h*0.55})`,opacity:Math.max(0.25,0.9-h*0.9),filter:`blur(${4+h*14}px)`}; }),{duration:dur,delay:d,fill:'both'});
      const rz=Math.round(Math.random()*360-180);
      if(r.n===6){
        const [fx,fy]=FACE[r.v];
        const kx=(2+Math.floor(Math.random()*2))*360*(Math.random()<.5?-1:1), ky=(3+Math.floor(Math.random()*2))*360*(Math.random()<.5?-1:1);
        cube.animate([
          {offset:0,transform:`rotateZ(${rz+400}deg) rotateX(${fx+kx}deg) rotateY(${fy+ky}deg)`},
          {offset:.4,transform:`rotateZ(${rz+120}deg) rotateX(${fx+kx*0.3}deg) rotateY(${fy+ky*0.35}deg)`},
          {offset:.75,transform:`rotateZ(${rz+14}deg) rotateX(${fx+(kx>0?28:-28)}deg) rotateY(${fy+(ky>0?22:-22)}deg)`},
          {offset:.9,transform:`rotateZ(${rz}deg) rotateX(${fx}deg) rotateY(${fy}deg)`},
          {offset:1,transform:`rotateZ(${rz}deg) rotateX(${fx}deg) rotateY(${fy}deg)`}
        ],{duration:dur,delay:d,fill:'both',easing:'cubic-bezier(.2,.6,.3,1)'});
      } else {
        cube.animate([{transform:`rotateZ(${rz+900}deg) rotateY(1440deg)`},{offset:.9,transform:`rotateZ(${rz}deg) rotateY(0deg)`},{transform:`rotateZ(${rz}deg) rotateY(0deg)`}],{duration:dur,delay:d,fill:'both',easing:'cubic-bezier(.2,.6,.3,1)'});
      }
    });
    const kill=()=>{ if(!stage.isConnected) return; stage.animate([{opacity:1},{opacity:0}],{duration:450,fill:'forwards'}).onfinish=()=>stage.remove(); };
    stage.addEventListener('click',kill);
    stage._t=setTimeout(kill,dur+3800);
  }catch(e){}
}
const pick = a => a[Math.floor(Math.random()*a.length)];
const uid = () => Math.random().toString(36).slice(2,9);
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const norm = s => (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
const sign = n => (n>0?'+':n<0?'−':'') + Math.abs(n);
function invList(era){ const r=R(); return [...(r[era].invAcad||r.comum.invAcad), ...(r[era].invInter||r.comum.invInter), ...(r[era].invInterExtra||[]), ...r[era].invTec]; }
function blankChar(era){ const inv={}; invList(era).forEach(k=>inv[k]=0); return {nome:'',conceito:'',arq:'',ori:'',mot:'',lado:'Contrato',inv,esp:[],saude:8,sf:8,med:8,imp:1,invGasto:{},adr:1,vicioTr:0,imprensa:0,ficha:0,ruido:0,medalha:'',anoNasc:'',lacoEra:'',lacoDe:'',herancas:'',testamento:'',antepassado:'',regras:'',fontes:'',fontesL:FONTE_TIPOS.map(()=>({t:'',perdida:false})),sfIni:8,vicio:'',segredo:'',equip:'',notas:''}; }
function blankCaso(){ return {titulo:'',premissa:'',segredo:'',pistas:[],provas:[],vant:[],prob:[],nec:4,fios:[],medalhaUsos:0,flash:false,jaVi:false}; }
function blankEra(era){ return {char:blankChar(era),log:[],caso:blankCaso(),cena:'',naCena:[],custom:[]}; }
const FONTE_TIPOS=['Pessoa','Lugar','Hábito'];
function fontesOf(c){ if(Array.isArray(c.fontesL)&&c.fontesL.length===3&&(c.fontesL.some(f=>f.t)||!String(c.fontes||'').trim())) return c.fontesL; const parts=String(c.fontes||'').split(/·|\n/).map(x=>x.replace(/\((pessoa|lugar|hábito)\)/i,'').trim()).filter(Boolean); return FONTE_TIPOS.map((t,i)=>({t:parts[i]||'',perdida:false})); }
const CAMPANHA={"1934": {"t": "A Cidade da Neblina", "b": "Choveu a semana inteira em Saint Village. A Lei Seca acabou, mas ninguém avisou os Moretti, e meu último cliente pagou adiantado. Ninguém paga adiantado por boa notícia."}, "1994": {"t": "Táxi e Cassino", "b": "O táxi 117 conhece todas as ruas de Saint Village, e o cassino conhece todos os taxistas. Hoje alguém esqueceu uma maleta no banco de trás. Não era para mim."}};
function migChar(c,era){ /* fichas salvas com nomes antigos de habilidade: converte para os definitivos */
  if(era==='1994'){ const RR=R()[era]; if(c.porta&&TRI_34_94[c.porta]) c={...c,porta:TRI_34_94[c.porta]}; if(c.arq&&!(RR.arquetipos||[]).some(a=>a.n===c.arq)){ const nn=(RR.arqMigra||{})[c.arq]; const a=nn&&RR.arquetipos.find(x=>x.n===nn); c={...c,arq:a?a.n:'',porta:a?a.grupo:(c.porta||''),oficio:a?(a.ocup||a.n):''}; } }
  if(!c.mot&&c.lado&&!(R()[era].mods||[]).includes('lado')) c={...c,mot:({Contrato:'Dinheiro',Cruzada:'Justiça'})[c.lado]||''};
  const M=SV_HAB_MIGRA, REN=SV_HAB_REN||{}; if(!M) return c;
  const all=invList(era), ger=R()[era].gerais;
  const oldInv=Object.keys(c.inv||{}).some(k=>!all.includes(k)&&(c.inv[k]||1)>1), oldEsp=(c.esp||[]).some(k=>!ger.includes(k));
  if(!oldInv&&!oldEsp) return c;
  const o={...c};
  if(oldInv){ const nw=M.inv(c.inv,[]); const inv={}; all.forEach(k=>inv[k]=nw[k]||1); o.inv=inv; const g={}; Object.keys(c.invGasto||{}).forEach(k=>{ const n=REN[k]||k; g[n]=(g[n]||0)+c.invGasto[k]; }); o.invGasto=g; }
  if(oldEsp) o.esp=M.esp(c.esp).slice(0,3);
  return o; }
function load(){ try{ const s=JSON.parse(localStorage.getItem(lsKey())); if(s&&s.eras){ if(s.eras['1999']) delete s.eras['1999']; if(s.era&&!(SV_REGRAS||{})[s.era]) s.era=null; const M=SV_HAB_MIGRA; if(M) Object.keys(s.eras).forEach(e=>{ const c=s.eras[e]&&s.eras[e].char; if(!c) return; if(c.inv) c.inv=Object.assign(blankChar(e).inv,M.inv(c.inv,[])); if(Array.isArray(c.esp)) c.esp=M.esp(c.esp).slice(0,3); if(c.invGasto){ const g={}; Object.keys(c.invGasto).forEach(k=>{ const n=(SV_HAB_REN||{})[k]||k; g[n]=(g[n]||0)+c.invGasto[k]; }); c.invGasto=g; } }); return s; } }catch(e){} return null; }
const stateOf = (v,kind) => kind==='saude' ? (v>0?'Inteiro':v>-6?'Ferido':v>-12?'Gravemente ferido':'Morto') : (v>0?'Intacto':v>-6?'Abalado':v>-12?'Por um fio':'Perdido');


/* Eram métodos da classe; aqui recebem a era em vez de lê-la do estado. */
function invBonus(era: any, c: any) {
  const RR = R()[era];
  if (!RR || !c || !c.arq) return {} as any;
  const oc = (RR.arquetipos || []).find((a: any) => a.n === c.arq);
  if (!oc || !oc.v) return {} as any;
  // Barras dobradas de propósito: isto vive dentro de um template literal, e
  // uma barra simples aqui chegaria ao arquivo gerado como letra solta.
  const nomes = invList(era), out: any = {}, re = /\+(\d+)\s+(?:pontos?\s+)?em\s+([^).,;:]+)/gi;
  let m: any;
  while ((m = re.exec(oc.v))) {
    const alvo = m[2].trim().toLowerCase();
    const k = nomes.find((n: any) => n.toLowerCase() === alvo || hn(era, n).toLowerCase() === alvo);
    if (k) out[k] = (out[k] || 0) + parseInt(m[1]);
  }
  return out;
}
const invEf = (era: any, c: any, k: any) => ((c.inv || {})[k] ?? 0) + (invBonus(era, c)[k] || 0);
const invRes = (era: any, c: any, k: any) =>
  Math.max(0, invEf(era, c, k) - 1 - ((c.invGasto || {})[k] || 0));

/** Era método da classe; aqui recebe as pistas do caso. */
function fioTxt(f: any, i: number, pistas: any[]) {
  const a = (pistas || []).find((p: any) => p.id === f.a);
  const b = (pistas || []).find((p: any) => p.id === f.b);
  return `Fio ${i + 1}: “${a ? a.t : '?'}” ↔ “${b ? b.t : '?'}” — ${f.rel}`;
}

/**
 * Monta o prompt de sistema do narrador.
 *
 * Devolve as duas metades separadas de propósito: `stable` é idêntico entre
 * turnos da mesma crônica na mesma região (~7.100 tokens) e por isso recebe
 * cache_control no adapter da Anthropic; `volatile` muda a cada turno.
 */
/**
 * Vira o narrador em juiz de regras, para o modo "dúvida" (askDirector).
 * Copiado verbatim do artifact; o designer o reescreve junto com o resto.
 */
export const PROMPT_JUIZ = `\n\nMODO ATUAL — PERGUNTA FORA DE CENA AO DIRETOR. Ignore as instruções anteriores de tom, de número de palavras e de marcações entre colchetes. Você NÃO está narrando: responde como juiz de regras e esclarecedor de cena, em português do Brasil, sem floreio, sem metáfora, sem suspense, sem ambientação poética. Frases curtas e objetivas, no máximo uns 140 palavras, texto corrido ou linhas curtas, sem markdown. Não avance a cena, não execute ações, não decida nada pelo personagem, não role dados e NUNCA escreva marcações entre colchetes.\nSe a pergunta for sobre o que se vê, ouve ou cheira na cena: descreva só fatos concretos e perceptíveis (lugar, pessoas em cena, objetos, saídas, luz, o que está fora do lugar), coerentes com o livro, o caso e a região. Se for curiosidade ou conhecimento do personagem sobre o lugar, a época ou a facção: responda com o que o livro e a cronologia sustentam; se o personagem não saberia, diga isso. Se for sobre fazer uma ação: diga se é possível; se for, indique se exige teste, qual habilidade GERAL, a rolagem (1d6 + modificadores aplicáveis da ficha; Revés 1–2, Empate 3–4, Avanço 5+) e o que está em jogo no Revés. Se for ação com habilidade investigativa ou pista central, lembre que não exige rolagem; diga qual habilidade e o que ela entrega ou o que o benefício extra custaria. Se a ação for impossível ou contrariar uma regra, diga qual regra. Não revele a VERDADE OCULTA nem pistas que o personagem ainda não obteria; se a resposta depender disso, diga que só se descobre em cena. Se a pergunta não for resolvida por regra ou por fato do livro, diga o que o Diretor decidiria e por quê, em uma frase.`;

export function buildSystemPrompt(input: PromptInput): { stable: string; volatile: string; full: string } {
  const full = systemPromptBody(input);
  const MARK = '\nFICHA DO PERSONAGEM:';
  const at = full.indexOf(MARK);
  if (at < 0) return { stable: full, volatile: '', full };
  return { stable: full.slice(0, at), volatile: full.slice(at), full };
}

function systemPromptBody(input: PromptInput): string {
  const { era, prefs, book, npc } = input;
    const RR: any = (REGRAS as any)[era], SS: any = SECULO as any, med = RR.medidor.n;
    const LL: any = { ...(LIVROS as any)[era], textos: book.textos, geral: book.geral };
    const d: any = { char: input.char, caso: input.caso, cena: input.cena, naCena: input.naCena };
    const c: any = input.char;
    const has = (m: string) => (RR.mods||[]).includes(m);
    const tone = era==='1934'
      ? 'film noir investigativo de 1934 — fim da Lei Seca, fundo da Depressão — com a fotografia do cinema expressionista alemão: sombras duras, neblina, chuva, ângulos tortos. Frases curtas. Deixe os silêncios agirem.'
      : 'pulp fiction de 1994 — néon, televisão, crime, ironia e ação cinematográfica narrada como plano de filme. Toda descrição tem um cheiro, um som e uma coisa fora do lugar. Feche cenas de ação com uma imagem.';
    const words = {curto:'60 a 110', medio:'90 a 170', longo:'150 a 260'}[prefs.tamanhoNarracao||'medio'] || '90 a 170';
    const inv = Object.keys(c.inv).map(k=>[k,invEf(era, c,k)]).filter(([k,v])=>v>=1).map(([k,v])=>hn(era,k)+' '+v+(v>1?' (reserva '+invRes(era, c,k)+'/'+(v-1)+')':'')+((invBonus(era, c)[k])?' [inclui +'+invBonus(era, c)[k]+' do Benefício]':'')).join(', ');
    const extraFicha = [has('adr')?`Adrenalina ${c.adr}`:'', has('imprensa')?`Imprensa ${c.imprensa}/6`:'', has('ficha')?`Ficha ${c.ficha||0}/6`:'', has('medalha')&&c.medalha?`Medalha: ${c.medalha} (usos neste caso ${d.caso.medalhaUsos||0})`:'', has('ruido')?`Ruído ${c.ruido||0}/10`:'', has('codigo')?`regras do Código: ${c.regras||'—'}`:'', c.anoNasc?`nascido em ${c.anoNasc} (${+era - +c.anoNasc} anos)`:'', c.lacoEra?`Laço de Herança com ${c.lacoEra}${c.lacoDe?' (herdado de '+c.lacoDe+')':''}`:'', c.herancas?`Heranças: ${c.herancas}`:'', c.antepassado?`Antepassado: ${c.antepassado}`:''].filter(Boolean).map(x=>'; '+x).join('');
    const fiosTxt = has('mural') ? ' Mural: '+((d.caso.fios||[]).map((f,i)=>fioTxt(f,i,d.caso.pistas)+' ['+f.st+']').join(' | ')||'nenhum Fio')+'.' : '';
    const seculoTxt = `${SS.canone}\nCRONOLOGIA (o que já aconteceu antes de ${era}; nunca revele à mesa o que vem depois): ${SS.cronologia.filter(([a])=>+a<+era).map(([a,t])=>a+': '+t).join('; ')}.\nTESTEMUNHAS DO SÉCULO: ${SS.testemunhas.map(t=>t[0]+' ('+t[1]+'): viu '+t[2]+'; carrega '+t[3]).join('; ')}.\n${SS.regras}`;
    const oc=RR.arquetipos.find(a=>a.n===c.arq); const ocTxt=oc?`${nomePapel(oc)} (ofício ${oc.ocup||oc.linhagem||oc.n}; trilha ${oc.grupo||''}; ${oc.vertente?'papel do ofício '+oc.ocup+' por outra trilha':oc.epoca?'ofício de época, linhagem '+oc.linhagem:'ofício na trilha natural'}${oc.filme?'; inspirada em '+oc.filme:''}; Benefício: ${oc.v}; Desvantagem: ${oc.p})`:(c.arq||'sem papel');
    const ficha = `${c.nome||'Sem nome'}${c.papel?' — papel que o jogador deu ao personagem: '+c.papel:''} — ofício ${ocTxt}; ${has('lado')?'trabalha por '+c.lado:'motivação: '+(c.mot||'—')}. Pano de fundo (a história por trás do personagem): ${c.conceito||'—'}. Investigativas: ${inv||'nenhuma com graduação'}; sem graduação (0, pista central custa 1 Ímpeto): ${invList(era).filter(k=>invEf(era, c,k)<=0).join(', ')||'nenhuma'}. Especialidades gerais (+1): ${c.esp.join(', ')||'nenhuma'}. Limiar de acerto ${(c.esp||[]).includes('Fôlego e Resistência')?4:3} (quem ataca este personagem precisa tirar isso ou mais). Vitalidade ${c.saude} (${stateOf(c.saude,'saude')}); Sangue-Frio ${c.sf} (${stateOf(c.sf,'sf')}); ${med} ${c.med}; Ímpetos ${c.imp}${extraFicha}. Vício: ${c.vicio||'—'} (doses neste caso ${c.vicioTr||0}/3; a terceira é a recaída). Fontes de Sangue-Frio: ${fontesOf(c).filter(f=>f.t).map((f,j)=>f.t+(f.perdida?' (PERDIDA)':'')).join(', ')||'nenhuma'} (uma vez por caso você pode pôr uma Fonte de pé em risco, com consequência real). Equipamento: ${c.equip||'—'}. Segredo: ${c.segredo?c.segredo+' (ainda escondido: traga à tona UMA vez, no pior momento possível; ao revelar, marque [SEGREDO: revelado] e um [PROBLEMA: ...] ligado a ele)':'nenhum escondido agora'}${c.segredoVelho?'. Segredo já revelado antes: '+c.segredoVelho:''}.`;
    const caso = d.caso;
    const resumoTxt = input.resumo ? `\nO QUE JÁ ACONTECEU NESTA CRÔNICA (resumo; o histórico recente vem depois): ${input.resumo}\n` : '';
    const casoTxt = `Título: ${caso.titulo||'—'}. Premissa: ${caso.premissa||'(ainda não aberto)'}. ${caso.segredo?'VERDADE OCULTA (só o narrador sabe; revele aos poucos): '+caso.segredo+'.':''} Pistas já obtidas: ${caso.pistas.map(p=>p.t).join(' | ')||'nenhuma'}. Provas: ${caso.provas.map(p=>p.t+' (Peso '+p.peso+')').join(' | ')||'nenhuma'} — Peso necessário ${caso.nec}. Vantagens: ${caso.vant.join(', ')||'—'}. Problemas: ${caso.prob.join(', ')||'—'}.${fiosTxt}`;
    const naCena = d.naCena.join('\n') || '(ninguém definido)';
    const lista = LL.npcs.map(n=>n.n).join('; ');
    const regioesTxt = (LL.regioes||[]).map(r=>r.nome).join('; ');
    const reg = d.cena ? `REGIÃO DA CENA: ${d.cena}. Trecho do livro sobre ela (autoridade máxima para lugares, gente, rumores e regras locais):\n${(LL.textos[d.cena]||'').slice(0,11000)}` : 'REGIÃO DA CENA: não definida — escolha uma coerente com o caso e diga onde estamos.';
    let sys = `Você é o Diretor e narrador de uma crônica SOLO de ${RR.titulo} (${RR.sub}), criado por Felipe Malorgio sobre o GUMSHOE SRD. Siga fielmente o cenário e as regras abaixo; não invente regras novas. Tom: ${tone}
Escreva em português do Brasil, em segunda pessoa, ${words} palavras. Nunca decida ações, falas ou sentimentos do personagem do jogador. Termine sempre numa situação aberta. Texto corrido em prosa: não use markdown (nada de #, **, listas ou títulos); manchetes vão entre aspas.
${RR.habDesc?'O QUE CADA HABILIDADE COBRE: '+Object.entries(RR.habDesc).map(([k,v])=>k+' ('+v+')').join('; ')+'\n':''}${c.papel?`PAPEL DADO PELO JOGADOR: "${c.papel}". É a lore do personagem: use-o na cena como o mundo o enxerga. Personagens do Diretor o reconhecem, o apelidam, desconfiam ou o respeitam por causa dele, e o passado que o nome sugere pode aparecer em rumores, favores e dívidas. Cite-o com naturalidade, sem repetir em toda resposta. Ele não muda regras: Benefício e Desvantagem vêm do ofício.\n`:''}DESVANTAGEM DO PAPEL: traga a Desvantagem do papel do personagem para a cena pelo menos uma vez por caso. Aplique o custo escrito na Desvantagem e marque-o com a etiqueta certa ([INTEGRIDADE: -1], [CHOQUE: 3], [SAUDE: -2], [PROBLEMA: nome]...). Quando ela oferecer dois custos, apresente as duas opções e deixe o jogador escolher antes de aplicar. Benefício desligado vale até o fim do caso: não o conceda de novo. Aceitar uma Desvantagem ou um Problema não dá Ímpeto. Respeite o Benefício do papel: ele funciona sem teste, do jeito que está escrito.
Pistas centrais NUNCA exigem rolagem: quando o personagem investiga de forma coerente com uma habilidade de nível 1 ou mais, entregue a pista central. Se a habilidade coerente estiver em 0 (sem graduação), a pista central só sai pagando 1 Ímpeto: diga isso e, se ele aceitar, entregue a pista e marque [IMPETO: -1]; sem Ímpeto, ele precisa de outro caminho (alguém que saiba, outra habilidade coerente, outra cena). Nunca deixe o caso travar. Esconda o significado, nunca a pista. Ação incerta e arriscada com habilidade GERAL: descreva a tensão e PARE, pedindo o teste.

REGRAS:
${RR.regras}

O SÉCULO (Saint Village XX Century, Edição Omni):
${seculoTxt}

FACÇÕES E CIDADE (do livro):
${LL.geral.slice(0,7000)}

${reg}

REGIÕES DESTA ERA (nomes exatos): ${regioesTxt}

PERSONAGENS DO DIRETOR EM CENA (interprete-os pelas quatro linhas; ninguém se acha vilão):
${naCena}
Outros nomes do livro disponíveis: ${lista}

FICHA DO PERSONAGEM: ${ficha}
O CASO: ${casoTxt}${resumoTxt}

MARCAÇÕES — o app lê e aplica; escreva-as ao FINAL do texto, entre colchetes, só quando ocorrerem:
[TESTE: Habilidade geral] pede uma rolagem solo (1d6 + modificadores: Revés 1–2, Empate 3–4, Avanço 5+). Antes da marcação, explique ao jogador em uma ou duas frases a regra desta rolagem: que dado se rola, quais modificadores valem e por quê (especialidade +1; Ferido ou Abalado −1), o que cada faixa significa nesta situação e que o Ímpeto pode virar um Empate em Avanço. PROBLEMA ATIVO: se um Problema do caderno atrapalha diretamente esta ação (o tira que desconfia está na sala, o credor está em cena), escreva [TESTE: Habilidade geral | Problema: nome exato] e diga ao jogador que o Problema dá −1. No máximo um Problema por teste; não aplique se não houver ligação clara. Pare a cena aí.
[CHOQUE: N] choque de horror (o que o personagem vê), perda N; [CHOQUE: N | culpa] choque de culpa (o que ele faz). Antes da marcação, explique em uma frase a regra: 1d6 contra 4, +1 com especialidade em Sangue-Frio${modsOf(era).includes('adr')?'; passar perde metade, falhar perde tudo':'; contra 5 se já Abalado; na culpa, contra 5 com '+med+' 8 ou mais e contra 3 com '+med+' 3 ou menos; passar evita a perda, falhar perde N'} (use a tabela de horror/culpa${era==='1994'?'/fim do mundo':''}).
[BENEFICIO: Habilidade investigativa] oferece um benefício extra; explique em uma frase o que ele concede e que pagar é opcional. O benefício custa 1 ponto da reserva daquela habilidade (pontos acima de 1, listados como reforçadas) ou, sem reserva, 1 Ímpeto. Ofereça benefícios com mais frequência nas habilidades reforçadas: é nelas que o personagem é especialista.
[PISTA: frase curta] a cada pista central entregue.
[PROVA: descrição | Peso 1-3] quando o personagem obtém uma prova.
[VANTAGEM: nome] / [PROBLEMA: nome] / [-VANTAGEM: nome] / [-PROBLEMA: nome]. [SEGREDO: revelado] quando trouxer à tona o segredo do personagem (uma vez; o app dá +1 Ímpeto e pede o choque de 4).
[SAUDE: -N] dano sofrido. [${med==='Integridade'?'INTEGRIDADE':'CODIGO'}: -N] quando a regra mandar. [IMPETO: +1] SOMENTE quando o personagem agir pela motivação contra o próprio interesse (nunca por aceitar um Problema ou uma Desvantagem).${has('adr')?' [ADRENALINA: +1] quando a regra der Adrenalina.':''}${has('imprensa')?' [IMPRENSA: +1] quando o personagem for filmado, fotografado ou citado em público.':''}${has('ficha')?' [FICHA: +1] quando o personagem for visto com quem a Comissão anota, assinar petição, defender alguém no Fórum ou fizer a pergunta errada ao homem de terno; [FICHA: -1] quando prestar serviço visível ao Estado (e então [INTEGRIDADE: -1]).':''}${has('ruido')?' [RUIDO: +N] quando planejar em lugar não varrido ou agir sobre Fio cortado; [RUIDO: -N] quando tomar cuidado (varrer, lugar público e barulhento, telefone público). Gaste o Ruído como a oposição gastaria o que ouviu.':''}${has('mural')?' [FIO: n | firme] ou [FIO: n | cortado] ao verificar o Fio n do Mural. Cada pista central é um Cartão; com Ruído 4 ou mais, você pode entregar um Cartão falso como pista, sem avisar.':''}
[NPC: Nome exato] quando um Personagem do Diretor do livro entrar em cena.
[CENA: Nome exato da região] sempre que a cena mudar de região, e também no primeiro turno em que a região ainda não estiver definida. Use um dos nomes da lista REGIÕES DESTA ERA, escrito igual.
${caso.titulo && caso.premissa ? '' : '[CASO: Título curto | premissa em uma frase] quando o caso ganhar forma, para o app preencher a aba Caso. O que o jogador já escreveu não é sobrescrito.\n'}${has('mural') ? '[FIO-NOVO: pista | pista | relação em poucas palavras] quando duas pistas já anotadas se ligarem. Identifique cada pista pelo número dela na lista de pistas já obtidas, ou por um trecho literal do texto dela. O Fio nasce solto; quem o verifica é o jogador.\n' : ''}`;
    if(npc) sys += `\n\nNESTA RESPOSTA você fala como ${npc.n}. Responda sobretudo com a fala dele, entre travessões, em primeira pessoa, com voz própria e agenda própria; no máximo uma ou duas frases de gesto e ambiente. Ele pode mentir, negociar, se fechar. Perfil: ${npc.perfil}`;
    return era==='1994'?impT(sys):sys;
}
