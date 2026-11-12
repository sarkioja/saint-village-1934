// GENERATED por tools/port-logic.mjs a partir de source/component.js — NAO EDITAR A MAO.
//
// O prelúdio e o corpo desta classe são o motor do artifact original, copiados
// verbatim. ts-nocheck é deliberado: o porte é validado pelo diff de pixels
// (tests/pixel) e pelos testes das marcações, não pelo compilador. Todo código
// NOVO do projeto (rotas, store, auth, automações) é tipado normalmente.
// @ts-nocheck
'use client';

import React, { Fragment } from 'react';
import OracleView from '@/components/generated/OracleView';
import REGRAS from './data/regras.json';
import LIVROS from './data/livros.json';
import SECULO from './data/seculo.json';
import { lerExtensoes, aplicarExtensoes, stripMarks } from './extensions';
import { SV_HAB_MIGRA, SV_HAB_REN } from './migra-habilidades';

// Os globais que o artifact lia de <script> no documento. Ver desglobalizar()
// em tools/port-logic.mjs.
const SV_REGRAS: any = REGRAS;
const SV_LIVROS: any = LIVROS;
const SV_SECULO: any = SECULO;
import type { Store, SaveShape } from './store';

type Props = {
  /** Persistência: localStorage na demo, API na conta. */
  store: Store;
  /** Estado inicial já carregado (SSR ou localStorage). */
  initial: SaveShape | null;
  /** Preferências do narrador, antes props fixos do artifact. */
  tamanhoNarracao?: 'curto' | 'medio' | 'longo';
  modeloIA?: 'haiku' | 'sonnet';
  /** Quantas entradas do log vão como histórico (o servidor impõe o teto). */
  historyTurns?: number;
  /** Mensagem exibida quando a cota diária estoura. */
  onQuota?: (msg: string) => void;
};


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


export default class OracleLogic extends React.Component<Props, any> {
  state = Object.assign({ era:null, tab:'cronica', eras:{} }, load()||{}, this.props.initial||{}, { perfil:SVP.cur(), loginNome:'', loginPin:'', loginErr:'', nuvem:'', perfisNuvem:[],
    ready:false, draft:'', mode:'acao', talkTo:'', busy:false, soloHab:'Fôlego e Resistência', soloMod:0,
    gold:{gasto:0,dif:4}, danoArma:'2', qr:false, choqueI:'0', livre:{n:1}, diceRes:null,
    npcQ:'', npcReg:'', npcForm:{nome:'',papel:'',desc:''}, pistaDraft:'', provaDraft:'', provaPeso:'2', showSeg:false, fioA:'', fioB:'', fioRel:'', futuro:false, saltoEra:'' });
  logRef = React.createRef();
  // ---------- Mapa da cidade: navegação (arrastar, roda, + e −) ----------
  mapVp = null; mapInEl = null; _mapDrag = null;
  mapVpRef = el => { if(this.mapVp===el) return; if(this.mapVp) this.mapVp.removeEventListener('wheel',this.onMapWheel); this.mapVp=el; if(el){ el.addEventListener('wheel',this.onMapWheel,{passive:false}); setTimeout(()=>{ const s=this.state; const v=this.mapSet(s.mapZ==null?0:s.mapZ, s.mapX||0, s.mapY||0); if(v) this.mapApply(v,true); },0); } };
  mapInRef = el => { this.mapInEl = el; };
  mapSet(z,x,y){ const el=this.mapVp; if(!el) return null; const W=el.clientWidth, H=el.clientHeight; if(!W||!H) return null; const fz=Math.min(1,H/W); z=Math.max(fz,Math.min(6,z)); const cw=W*z, ch=W*z; x = cw<=W ? (W-cw)/2 : Math.min(0,Math.max(W-cw,x)); y = ch<=H ? (H-ch)/2 : Math.min(0,Math.max(H-ch,y)); return {z,x,y,fz}; }
  mapApply(v,commit){ if(this.mapInEl){ this.mapInEl.style.transform=`translate(${v.x}px,${v.y}px)`; this.mapInEl.style.width=(v.z*100)+'%'; } if(commit) this.setState({mapZ:v.z,mapX:v.x,mapY:v.y,mapFz:v.fz},()=>this.save()); }
  mapZoomAt(f,px,py){ const s=this.state, z=s.mapZ||1, x=s.mapX||0, y=s.mapY||0; const v0=this.mapSet(z*f,0,0); if(!v0) return; const k=v0.z/z; const v=this.mapSet(v0.z, px-(px-x)*k, py-(py-y)*k); if(v) this.mapApply(v,true); }
  mapZoomCenter(f){ const el=this.mapVp; if(el) this.mapZoomAt(f, el.clientWidth/2, el.clientHeight/2); }
  onMapWheel = ev => { ev.preventDefault(); const r=this.mapVp.getBoundingClientRect(); this.mapZoomAt(Math.exp(-ev.deltaY*0.0018), ev.clientX-r.left, ev.clientY-r.top); };
  _ptrs = new Map(); _pinch = null;
  onMapDown = ev => { this._ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY}); if(this._ptrs.size===2){ const [p,q]=[...this._ptrs.values()]; this._pinch={d:Math.hypot(p.x-q.x,p.y-q.y)||1,z:this.state.mapZ||1}; this._mapDrag=null; try{ ev.currentTarget.setPointerCapture(ev.pointerId); }catch(e){} return; } if(ev.pointerType==='mouse' && ev.button!==0) return; if(ev.target.closest && ev.target.closest('[data-maplabel]')) return; this._mapDrag={id:ev.pointerId,sx:ev.clientX,sy:ev.clientY,x:this.state.mapX||0,y:this.state.mapY||0,v:null}; try{ ev.currentTarget.setPointerCapture(ev.pointerId); }catch(e){} if(this.mapVp) this.mapVp.style.cursor='grabbing'; };
  onMapMove = ev => { if(this._ptrs.has(ev.pointerId)) this._ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY}); if(this._pinch && this._ptrs.size===2 && this.mapVp){ const [p,q]=[...this._ptrs.values()]; const r=this.mapVp.getBoundingClientRect(); const nd=Math.hypot(p.x-q.x,p.y-q.y); const target=this._pinch.z*nd/this._pinch.d; const cur=this.state.mapZ||1; this.mapZoomAt(target/cur,(p.x+q.x)/2-r.left,(p.y+q.y)/2-r.top); return; } const d=this._mapDrag; if(!d||d.id!==ev.pointerId) return; const v=this.mapSet(this.state.mapZ||1, d.x+ev.clientX-d.sx, d.y+ev.clientY-d.sy); if(v){ d.v=v; this.mapApply(v,false); } };
  onMapUp = ev => { this._ptrs.delete(ev.pointerId); if(this._ptrs.size<2) this._pinch=null; const d=this._mapDrag; if(!d) return; this._mapDrag=null; if(this.mapVp) this.mapVp.style.cursor='grab'; if(d.v) this.mapApply(d.v,true); };
  mapVals(s,era,d,SS,goRegion){
    const POS={'White Hills':[53.8,31.1],'Downtown':[68.9,31.8],'Chinatown':[65.3,28.3],'Saint Edwiges':[63.4,24.1],'Embarcadouro':[71.4,26.5],'Embarcadouro e Píer 9':[71.4,26.5],
      'Black Rock':[80.4,16.4],'Black Rock e a Ponte':[80.4,16.4],'Black Rock vazia':[80.4,16.4],'Monumental Island':[80.4,16.4],'Black Rock Bridge e o Pilar 3':[77.4,28.8],
      'Waterford':[62.1,51.3],'Distrito de Waterford':[62.1,51.3],'Estrada do Estreito':[43.5,25.2],'Owenfield':[68.8,45.1],'Monarch Heights':[65.2,58.6],'Vila da Guerra':[65.2,58.6],
      'Greenspring':[35.2,66.4],'Greenspring Streets e a Galleria':[35.2,66.4],'Hipódromo de San Ysidro':[40.0,42.9],'Rua Post':[54.9,35.8],
      'Fórum e a Sala 3':[67.1,35.8],'Praça do Fórum e o Palermo':[67.1,35.8],'Central da Rua Bush':[66.2,33.0],'Cine Golden Harvest':[64.6,30.4],
      'Estaleiro Harrow & Lyman':[72.1,37.2],'Freeway 480':[72.5,33.6],'A Trincheira':[72.5,33.6],'Cemitério de São Brendan':[57.6,46.4],
      'Estação Ferroviária Central':[70.9,42.0],'Esgotos e túneis':[64.0,40.0]};
    const RAD={'White Hills':5.5,'Downtown':3.6,'Chinatown':2.4,'Saint Edwiges':3,'Embarcadouro':3.2,'Black Rock':3.4,'Waterford':6,'Estrada do Estreito':5,'Owenfield':4,'Monarch Heights':5,'Greenspring':6.5,'Hipódromo de San Ysidro':3.5,'Estação Ferroviária Central':2.6,'Esgotos e túneis':2.4,'Black Rock Bridge e o Pilar 3':2.4};
    const OFF={'Saint Edwiges':[-30,-26],'Chinatown':[-40,6],'Embarcadouro':[52,-12],'Downtown':[34,18],'White Hills':[-34,-2],'Estação Ferroviária Central':[40,8],'Esgotos e túneis':[-46,0],'Black Rock':[0,-30]};
    const KEY={'Embarcadouro e Píer 9':'Embarcadouro','Estaleiro Harrow & Lyman':'Embarcadouro','Black Rock e a Ponte':'Black Rock','Black Rock vazia':'Black Rock','Monumental Island':'Black Rock',
      'Distrito de Waterford':'Waterford','Vila da Guerra':'Monarch Heights','Greenspring Streets e a Galleria':'Greenspring'};
    const ERAS=['1934','1994'];
    const mEra=(s.mapEra && s.mapEraOf===era) ? s.mapEra : era;
    const camY=mEra==='1999'?'1994':mEra;
    const regs=((L()[mEra]||{}).regioes)||[];
    const used=new Set(); const out=[];
    regs.forEach(r=>{ const p=POS[r.nome]; if(!p) return; used.add(KEY[r.nome]||r.nome); const sel=s.mapSel===r.nome; const cena=mEra===era&&d.cena===r.nome;
      const kk=KEY[r.nome]||r.nome, rad=RAD[kk]||3.5, of=OFF[kk]||[0,0]; out.push({real:true,ghost:false,n:r.nome,x:p[0],y:p[1],zs:'left:'+p[0]+'%;top:'+p[1]+'%;width:'+(rad*2)+'%;height:'+(rad*2)+'%;'+(cena?'border-color:rgba(179,38,44,.85);background:radial-gradient(circle,rgba(179,38,44,.18),rgba(179,38,44,.04) 70%,transparent 72%);':sel?'border-color:rgba(236,236,236,.9);background:radial-gradient(circle,rgba(236,236,236,.16),rgba(236,236,236,.04) 70%,transparent 72%);':''),lt:'translate(calc(-50% + '+of[0]+'px),calc(-50% + '+of[1]+'px))',
        bg:sel?'var(--sv-paper,#dedede)':'transparent', fg:sel?'var(--sv-bg,#131212)':'var(--sv-ink,#e0e0e0)',
        bd:cena?'#b3262c':(sel?'var(--sv-paper,#dedede)':'transparent'),
        pick:()=>this.setState({mapSel:sel?null:r.nome})}); });
    Object.entries(SS.camadas||{}).forEach(([k,v])=>{ if(used.has(k)) return; const p=POS[k]; if(!p||!v[camY]) return; out.push({real:false,ghost:true,n:k,t:v[camY],x:p[0],y:p[1]}); });
    const byEra=o=>o[mEra]||'';
    const PL=[
      {n:{'1934':'Café Palermo','1946':'Café Palermo','1974':'Palermo','1994':'Palermo 24h'},p:[68.3,30.3]},
      {n:{'1934':'Banca do Zack','1946':'Banca do Zack','1974':'Banca do Zack','1994':'Zachary Video'},p:[67.4,36.9]},
      {n:{'1934':'Galpão 14 · Píer 9','1946':'Galpão 14 · Píer 9','1974':'Galpão 14 · Píer 9','1994':'Galpão 14 · Píer 9'},p:[71.0,27.9]},
      {n:{'1934':'Túnel de 1853','1946':'Túnel de 1853','1974':'Túnel de 1853','1994':'Túnel de 1853'},p:[81.2,18.2]},
      {n:{'1934':'Golden Gate Motel · quarto 11','1946':'Golden Gate Motel · quarto 11','1974':'Golden Gate Motel · quarto 11','1994':'Golden Gate Motel · quarto 11'},p:[40.9,24.4]},
      {n:{'1934':'Pilar 3 (em obra)','1946':'Pilar 3','1974':'Pilar 3','1994':'Pilar 3'},p:[77.6,28.0]},
      {n:{'1934':'Igreja de São Brendan','1946':'Igreja de São Brendan','1974':'Igreja de São Brendan','1994':'Igreja de São Brendan'},p:[59.0,47.8]},
      {n:{'1934':'Mansão Ashcroft','1946':'Mansão Harrow','1974':'Mansão Harrow · a vela','1994':'Mansão Harrow · a vela'},p:[52.3,29.6]},
      {n:{'1934':'Hipódromo (Pemberton)','1946':'Hipódromo de San Ysidro','1974':'Hipódromo de San Ysidro'},p:[40.0,42.9]},
      {n:{'1994':'Refinaria Monarch'},p:[74.3,54.4]}
    ].map(o=>({n:byEra(o.n),x:o.p[0],y:o.p[1]})).filter(o=>o.n).map((o,i)=>({...o,i:String(i+1)}));
    const ST=[['Rua Grant',65.2,30.6,90],['Rua Stockton',64.0,30.6,90],['Rua Kearny',66.4,30.6,90],['Rua Montgomery',67.8,32.6,90],
      ['Rua Pacific',61.5,27.6,0],['Rua Jackson',61.5,28.4,0],['Rua Washington',61.5,29.2,0],['Rua Clay',61.5,30.0,0],['Rua Califórnia',61.5,31.0,0],['Rua Bush',61.5,32.2,0],['Rua Post',58.6,33.7,0],
      ['Rua Columbus',64.1,26.2,53],['Rua Dolores',58.0,52.5,90]];
    if(mEra==='1974'||mEra==='1994') ST.push(['Rua Magnólia',36.0,68.8,0]);
    const z=s.mapZ||1, fz=s.mapFz||z;
    const selR=regs.find(r=>r.nome===s.mapSel);
    const selKey=selR?(KEY[selR.nome]||selR.nome):'';
    const selCam=selR&&SS.camadas&&SS.camadas[selKey]?SS.camadas[selKey]:null;
    return {
      mapTf:`translate(${s.mapX||0}px,${s.mapY||0}px)`, mapW:String(z*100), mapEraLabel:mEra,
      mapEras:ERAS.map(e=>({e,on:e===mEra,off:e!==mEra,go:()=>this.setState({mapEra:e,mapEraOf:era,mapSel:null})})),
      mapRegions:out, mapPlaces:PL, mapStreets:ST.map(([n,x,y,rot])=>({n,x,y,rot})),
      mapShowPlaces:true, mapPlaceLbl:z>=fz*1.4, mapShowStreets:z>=Math.max(1.6,fz*2.6),
      mapZoomIn:()=>this.mapZoomCenter(1.6), mapZoomOut:()=>this.mapZoomCenter(1/1.6), mapReset:()=>{ const v=this.mapSet(0,0,0); if(v) this.mapApply(v,true); },
      mapVpRef:this.mapVpRef, mapInRef:this.mapInRef, onMapDown:this.onMapDown, onMapMove:this.onMapMove, onMapUp:this.onMapUp,
      mapHasSel:!!selR, mapNoSel:!selR, mapSelNome:selR?selR.nome:'', mapSelDono:selR&&selR.dono?('Quem manda: '+selR.dono):'', mapSelHasDono:!!(selR&&selR.dono),
      mapSelCamada:selCam?(selCam[camY]||''):'', mapSelHasCamada:!!(selCam&&selCam[camY]),
      mapSelCamadas:selCam?ERAS.filter(y=>y!=='1999'&&selCam[y]).map(y=>({y,t:selCam[y],on:y===camY,off:y!==camY})):[], mapSelHasCamadas:!!selCam,
      mapSelResumo:selR?(selR.resumo||''):'', mapSelLugares:selR?(selR.lugares||[]).map(([n,dd])=>({n,d:dd})):[], mapSelHasLugares:!!(selR&&(selR.lugares||[]).length),
      mapSelCanGo:!!selR&&mEra===era, mapSelOutra:!!selR&&mEra!==era,
      mapSelGo:()=>selR&&goRegion(selR.nome), mapSelSet:()=>selR&&this.upd(e=>({...e,cena:selR.nome})), mapSelClose:()=>this.setState({mapSel:null})
    };
  }

  componentDidMount(){
    (async()=>{ try{ if(!window.claude||!window.claude.use) return; const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]); if(!db||!user) return; const uid=await user.id(); if(!uid) return; this.__db=db; this.__uid=uid; this.cloudList();
      const p=this.state.perfil; if(p){ const c=await this.cloudGet(p.slug); const loc=(()=>{ try{ return JSON.parse(localStorage.getItem(lsKey())||'null'); }catch(e){ return null; } })(); if(c&&c.save){ try{ const cs=JSON.parse(c.save); if(!loc||(cs.savedAt||0)>(loc.savedAt||0)){ localStorage.setItem(lsKey(),c.save); this.setState(Object.assign({},load()||{})); } }catch(e){} } this.setState({nuvem:'Salvo na nuvem'}); this.cloudSync(); } }catch(e){} })();
    this._themed=this.state.era; this.applyTheme(this.state.era);
    const check=()=>{ if(R()&&L()&&S()){ this.setState({ready:true}); } else this._t=setTimeout(check,80); };
    check();
    this._onScroll=()=>{ try{ document.documentElement.classList.toggle('sv-scrolled', window.scrollY>80); if(!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)) document.documentElement.style.setProperty('--sv-py', Math.round(window.scrollY)+'px'); }catch(e){} };
    window.addEventListener('scroll',this._onScroll,{passive:true});
    try{ if(localStorage.getItem('sv-guide-off')) this.setState({guideOff:true}); }catch(e){}
  }
  componentWillUnmount(){ clearTimeout(this._t); window.removeEventListener('scroll',this._onScroll); this.applyTheme(null); }
  applyTheme(era){
    const TH={
      '1934':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#252423","--sv-bg2":"#0b0b0c","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e4e4e4","--sv-paperdim":"#595a5d","--sv-accent":"#5e5e5e","--sv-hicard":"#e4e4e4","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Special Elite',monospace"},
      '1946':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#212225","--sv-bg2":"#0c0b0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e0e0e0","--sv-paperdim":"#595a5d","--sv-accent":"#555555","--sv-hicard":"#e0e0e0","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Special Elite',monospace"},
      '1974':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#121213","--sv-bg1":"#232222","--sv-bg2":"#0b0b0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e0e0e0","--sv-paperdim":"#595a5d","--sv-accent":"#5e5e5e","--sv-hicard":"#e0e0e0","--sv-accent-soft":"#b9b9b9","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"},
      '1994':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#131012","--sv-bg1":"#1c1c1c","--sv-bg2":"#0b0a0b","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#e4e4e4","--sv-paperdim":"#4e4f52","--sv-accent":"#7a7a7a","--sv-hicard":"#e4e4e4","--sv-accent-soft":"#c7c7c7","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"},
      '1999':{"--sv-on-accent2":"#121213","--sv-accent2":"#b8b8b8","--sv-tab":"#b8b8b8","--sv-title":"#f3f3f3","--sv-display":"'Bebas Neue',sans-serif","--sv-hb":"1px solid #b8b8b8","--sv-bg":"#111317","--sv-bg1":"#172b34","--sv-bg2":"#0a0b0d","--sv-ink":"#d4d4d4","--sv-ink2":"#b6b6b6","--sv-paper":"#cccccc","--sv-paperdim":"#535a63","--sv-accent":"#6d6d6d","--sv-hicard":"#cccccc","--sv-accent-soft":"#c7c7c7","--sv-panel":"#161618","--sv-panel2":"#111113","--sv-line":"#2b2b2e","--sv-line2":"#434347","--sv-line3":"#1d1d1f","--sv-dim":"#959699","--sv-dim2":"#808186","--sv-type":"'Courier Prime',monospace","--sv-voice":"'Courier Prime',monospace"}
    };
    const keys=Object.keys(TH['1994']), T=TH[era], st=document.documentElement.style;
    keys.forEach(k=> T ? st.setProperty(k,T[k]) : st.removeProperty(k));
    document.body.style.background = T ? T['--sv-bg'] : '';
  }
  componentDidUpdate(pp, ps){
    try{
      const A=ps.era===this.state.era?this.cur(ps):null, B=this.cur();
      if(A&&B){
        const ca=A.caso||{}, cb=B.caso||{};
        if((cb.pistas||[]).length>(ca.pistas||[]).length) svToast('Pista anotada');
        else if((cb.provas||[]).length>(ca.provas||[]).length) svToast('Prova registrada');
        else if((cb.fios||[]).length>(ca.fios||[]).length) svToast('Fio ligado no mural');
        else if((B.custom||[]).length>(A.custom||[]).length) svToast('Novo nome no elenco');
        else if(B.cena!==A.cena && B.cena) svToast('Cena: '+B.cena);
      }
      if(ps.diceRes && this.state.diceRes && ps.diceRes.title===this.state.diceRes.title && !ps.diceRes.logged && this.state.diceRes.logged) svToast('Registrado na crônica');
    }catch(e){}
    if(ps.diceRes!==this.state.diceRes && this.state.diceRes && SV_ROLLS.length){ const r=SV_ROLLS.splice(0).filter(x=>x.n===6||x.n===8).slice(0,10); if(r.length){ svThrowDice(r); this.setState({lastRolls:r}); } } else if(ps.diceRes===this.state.diceRes){ SV_ROLLS.length=0; }
    if(this._themed!==this.state.era){ this._themed=this.state.era; this.applyTheme(this.state.era); }
    const el=this.logRef.current; const a=this.cur(ps), b=this.cur();
    if(el && (ps.busy!==this.state.busy || (a&&b&&a.log.length!==b.log.length) || ps.tab!==this.state.tab)) el.scrollTop=el.scrollHeight;
  }
  save(){ const {era,tab,eras,mapZ,mapX,mapY,mapFz,perfil}=this.state; if(!perfil) return; const snap={era,tab,eras,mapZ,mapX,mapY,mapFz,savedAt:Date.now()}; try{ localStorage.setItem(lsKey(), JSON.stringify(snap)); }catch(e){} this.gravarArquivo(snap); this.cloudSync(); }
  cloudSync(){ clearTimeout(this.__cs); this.__cs=setTimeout(async()=>{ const db=this.__db, uid=this.__uid, p=this.state.perfil; if(!db||!uid||!p) return;
      let data=null; try{ data=localStorage.getItem(lsKey()); }catch(e){} if(!data||data===this.__lastCloud) return;
      if(data.length>230000){ try{ const o=JSON.parse(data); Object.values(o.eras||{}).forEach(e=>{ if(e&&Array.isArray(e.log)) e.log=e.log.slice(-120); }); data=JSON.stringify(o); }catch(e){} }
      try{ await db.collection('data/users/'+uid).doc('perfil-'+p.slug).set({nome:p.nome,pin:p.pinHash||'',save:data,at:Date.now()}); this.__lastCloud=data; const d=new Date(); this.setState({nuvem:'Salvo na nuvem às '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}); }
      catch(e){ this.setState({nuvem:'Salvo neste navegador'}); } },1500); }
  async cloudGet(slug){ const db=this.__db, uid=this.__uid; if(!db||!uid) return null; try{ const sn=await db.collection('data/users/'+uid).doc('perfil-'+slug).get(); return sn.exists?sn.data():null; }catch(e){ return null; } }
  async cloudList(){ const db=this.__db, uid=this.__uid; if(!db||!uid) return; try{ const q=await db.collection('data/users/'+uid).get(); const L=q.docs.filter(d=>d.id.startsWith('perfil-')).map(d=>({slug:d.id.slice(7),nome:(d.data()||{}).nome||d.id.slice(7),pinHash:(d.data()||{}).pin||''})); this.setState({perfisNuvem:L}); }catch(e){} }
  async exportArquivo(){ const p=this.state.perfil; if(!p) return; let data=''; try{ data=localStorage.getItem(lsKey())||''; }catch(e){} if(!data){ svToast('Nada salvo ainda.'); return; }
      const pack=JSON.stringify({tipo:'saint-village-arquivo',v:1,nome:p.nome,slug:p.slug,pin:p.pinHash||'',save:JSON.parse(data),em:new Date().toISOString()});
      const fn='saint-village-'+p.slug+'.json';
      try{ const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null; if(dl){ await dl.save({filename:fn,data:pack}); return; } }catch(e){ if(e&&e.code&&e.code!=='unavailable') return; }
      try{ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([pack],{type:'application/json'})); a.download=fn; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },500); }catch(e){ svToast('Não foi possível exportar aqui.'); } }
  importArquivo(ev){ const f=ev.target.files&&ev.target.files[0]; ev.target.value=''; if(!f) return; const rd=new FileReader(); rd.onload=()=>{ try{ const o=JSON.parse(rd.result); if(!o||o.tipo!=='saint-village-arquivo'||!o.save||!o.slug) throw 0;
        const perfil={slug:o.slug,nome:o.nome||o.slug,pinHash:o.pin||''}; const list=SVP.list(); SVP.saveList([perfil,...list.filter(x=>x.slug!==o.slug)].slice(0,12));
        const save={...o.save,savedAt:Date.now()}; localStorage.setItem(LS0+'::'+o.slug,JSON.stringify(save));
        svToast('Arquivo de '+perfil.nome+' importado. Entre com esse nome.'); this.setState({loginNome:perfil.nome,loginPin:'',loginErr:''}); if(this.state.perfil&&this.state.perfil.slug===o.slug){ this.setState(Object.assign({},load()||{})); this.cloudSync(); }
      }catch(e){ svToast('Este arquivo não é um save do Saint Village.'); } }; rd.readAsText(f); }
  cur(s=this.state){ return s.era && s.eras ? s.eras[s.era] : null; }
  upd(fn){ this.setState(s=>{ const eras={...s.eras}; eras[s.era]=fn({...eras[s.era]}); return {eras}; }, ()=>this.save()); }
  setChar(patch){ this.upd(e=>({...e,char:{...e.char,...(typeof patch==='function'?patch(e.char):patch)}})); }
  setCaso(patch){ this.upd(e=>({...e,caso:{...e.caso,...(typeof patch==='function'?patch(e.caso):patch)}})); }
  addLog(entry){ const id=uid(); this.upd(e=>({...e,log:[...e.log,{id,...entry}]})); return id; }
  patchEntry(id, patch){ this.upd(e=>({...e,log:e.log.map(x=>x.id===id?{...x,...patch}:x)})); }
  setTab(tab){ if(tab==='dados') tab='cronica'; this.setState({tab},()=>this.save()); }
  pickEra(era){ this.setState(s=>{ const eras={...s.eras}; if(!eras[era]) eras[era]=blankEra(era); return {era, eras, tab:'cronica'}; },()=>this.save()); }

  allNpcs(){ const d=this.cur(); const book=(L()[this.state.era].npcs||[]).map((n,i)=>({...n,id:'b'+i})); const mine=(d.custom||[]).map(n=>({...n,id:'c'+n.cid,custom:true,r:n.r||'Criado por você'})); return [...book,...mine]; }
  npcById(id){ return this.allNpcs().find(n=>n.id===id); }
  fmtNpc(n){ return `${n.n} — ${n.p}${n.r?' ('+n.r+')':''}. ${n.d||''}${n.v?' Virtude: '+n.v:''}${n.pe?' Pecado: '+n.pe:''}${n.q?' Quer: '+n.q:''}${n.t?' Teme: '+n.t:''}${n.a?' Alianças: '+n.a:''}`; }
  fmt(e){
    if(e.k==='narr') return 'NARRADOR: '+e.text;
    if(e.k==='npc') return e.who.toUpperCase()+': '+e.text;
    if(e.k==='ask') return 'JOGADOR (pergunta fora de cena ao Diretor): '+e.text;
    if(e.k==='rule') return 'DIRETOR (esclarecimento de regras, fora de cena): '+e.text;
    if(e.k==='action') return 'PERSONAGEM (ação): '+e.text;
    if(e.k==='speech') return 'PERSONAGEM (fala'+(e.to?' para '+e.to:'')+'): "'+e.text+'"';
    return '['+e.who+'] '+e.text;
  }
  matchSkill(v){ const era=this.state.era, all=[...R()[era].gerais, ...invList(era)]; const n=norm(v); return all.find(k=>norm(k)===n) || all.find(k=>n.includes(norm(k))||norm(k).includes(n)) || v; }
  isGeral(k){ return R()[this.state.era].gerais.includes(k); }


  async narrate(instr, opts={}){
    if(this.state.busy) return;
    this.setState({busy:true});
    const d=this.cur();
    const streamId=uid();
    try{
      const res = await fetch('/api/narrate', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({
          era: this.state.era,
          instr,
          npcId: opts.npc ? opts.npc.id : null,
          npc: opts.npc ? {n:opts.npc.n, perfil:this.fmtNpc(opts.npc)} : null,
          char: d.char,
          caso: d.caso,
          cena: d.cena,
          naCena: d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)),
          history: d.log.slice(-(this.props.historyTurns||18)).map(e=>this.fmt(e)),
          resumo: d.caso && d.caso.resumo ? d.caso.resumo : '',
          prefs: {
            tamanhoNarracao: this.props.tamanhoNarracao || 'medio',
            modeloIA: this.props.modeloIA || 'haiku',
          },
        }),
      });

      if(res.status===429){
        const j = await res.json().catch(()=>({}));
        const msg = j.message || 'Os arquivos da cidade fecham à meia-noite. Volte amanhã.';
        this.addLog({k:'mech',who:'Arquivo',text:msg});
        if(this.props.onQuota) this.props.onQuota(msg);
        this.setState({busy:false});
        return;
      }
      if(!res.ok || !res.body) throw new Error('narrate ' + res.status);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf='', full='', opened=false;
      for(;;){
        const {value, done} = await reader.read();
        if(done) break;
        buf += dec.decode(value, {stream:true});
        let nl;
        while((nl = buf.indexOf('\n')) >= 0){
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl+1);
          if(!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if(!payload) continue;
          let ev; try{ ev = JSON.parse(payload); }catch(e){ continue; }
          if(ev.t==='delta'){
            full += ev.v;
            if(!opened){ opened=true; this.upd(e=>({...e,log:[...e.log,{id:streamId,k:'narr',who:opts.npc?opts.npc.n:'Narrador',text:stripMarks(full),streaming:true}]})); }
            else this.patchEntry(streamId, {text:stripMarks(full)});
          } else if(ev.t==='error'){
            throw new Error(ev.v || 'erro do narrador');
          } else if(ev.t==='done'){
            if(ev.v) full = ev.v;
          }
        }
      }

      if(opened) this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));

      // As marcações NOVAS (cena, caso, fio) saem do texto ANTES do motor
      // original — que segue intocado e recebe só o vocabulário dele — e são
      // gravadas DEPOIS, porque ingest() reescreve caso e cena por inteiro a
      // partir de uma leitura que fez antes de rodar.
      const ext = lerExtensoes(full||'');
      this.ingest(ext.texto, opts);
      aplicarExtensoes(ext, this);
      this.talvezResumir();
    }catch(err){
      this.upd(e=>({...e,log:e.log.filter(x=>x.id!==streamId)}));
      this.addLog({k:'mech',who:'Erro',text:'O narrador não respondeu. Tente de novo.'});
    }
    this.setState({busy:false});
  }

  /**
   * Modo "dúvida": pergunta de regras ao Diretor, fora de cena.
   *
   * Mesmo caminho da narração — o prompt (e o bloco de juiz) ficam no servidor,
   * onde estão o texto do livro e a chave. A resposta não passa pelo ingest():
   * não é cena, é arbitragem, e por isso não carrega marcação nenhuma.
   */
  async askDirector(q){
    if(this.state.busy) return;
    this.setState({busy:true});
    const d=this.cur();
    try{
      const res = await fetch('/api/duvida', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify({
          era: this.state.era,
          pergunta: q,
          char: d.char, caso: d.caso, cena: d.cena,
          naCena: d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>this.fmtNpc(n)),
          history: d.log.slice(-(this.props.historyTurns||18)).map(e=>this.fmt(e)),
          prefs: { modeloIA: this.props.modeloIA || 'haiku' },
        }),
      });
      if(res.status===429){ const j=await res.json().catch(()=>({}));
        this.addLog({k:'mech',who:'Arquivo',text:j.message||'Os arquivos da cidade fecham por hoje.'});
        this.setState({busy:false}); return; }
      if(!res.ok) throw new Error('duvida '+res.status);
      const j=await res.json();
      this.addLog({k:'rule',who:'Diretor · Regras',text:j.resposta||'Sem resposta. Reformule a pergunta.'});
    }catch(err){ this.addLog({k:'mech',who:'Erro',text:'O Diretor não respondeu. Tente de novo.'}); }
    this.setState({busy:false});
  }

  /**
   * Memória longa: a cada N turnos pede um parágrafo de resumo e o guarda no
   * caso. O prompt passa a levar resumo + histórico recente, em vez de só as
   * últimas entradas — o narrador para de esquecer o começo da crônica, e em
   * crônicas longas o custo cai.
   */
  async talvezResumir(){
    const d=this.cur(); if(!d) return;
    const narrativas=d.log.filter(e=>e.k==='narr'||e.k==='npc').length;
    const PASSO=12;
    if(narrativas < PASSO) return;
    if((d.caso.resumoEm||0) + PASSO > narrativas) return;
    try{
      const res=await fetch('/api/resumo',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({ era:this.state.era, anterior:d.caso.resumo||'',
          history:d.log.slice(-40).map(e=>this.fmt(e)),
          prefs:{modeloIA:this.props.modeloIA||'haiku'} })});
      if(!res.ok) return;
      const j=await res.json();
      if(j && j.resumo) this.setCaso({resumo:String(j.resumo), resumoEm:narrativas});
    }catch(e){ /* resumo e' melhoria, nao requisito: falhar aqui nao atrapalha a cena */ }
  }


  async doLogin(nomeIn,pinIn){
    const nome=String(nomeIn||'').trim().replace(/\s+/g,' '), slug=svSlug(nome), pin=String(pinIn||'').trim();
    if(nome.length<2||!slug){ this.setState({loginErr:'Escreva um nome com pelo menos 2 letras.'}); return; }
    if(pin&&!/^\d{4}$/.test(pin)){ this.setState({loginErr:'O PIN tem 4 números (ou deixe em branco).'}); return; }

    // Sem PIN nao ha' conta a abrir: segue o caminho local do artifact.
    if(!pin){ this.entrarLocal(nome,slug,''); return; }

    this.setState({busy:true});
    try{
      const res=await fetch('/api/perfil',{method:'POST',headers:{'content-type':'application/json'},
        body:JSON.stringify({nome,pin})});
      const j=await res.json().catch(()=>({}));

      if(res.status===503){ this.entrarLocal(nome,slug,''); this.setState({busy:false}); return; }
      if(!res.ok){
        // 400 'local' so' acontece sem PIN, que ja' foi tratado acima.
        this.setState({busy:false,loginErr:j.message||j.error||'Não foi possível entrar.'});
        return;
      }

      const perfil={slug:j.perfil.slug,nome:j.perfil.nome,pinHash:''};
      SVP.saveList([perfil,...SVP.list().filter(x=>x.slug!==perfil.slug)].slice(0,12));
      SVP.setCur(perfil);

      // O arquivo da conta manda sobre o que estiver neste navegador: quem
      // abre a cronica noutro aparelho tem de ver o progresso dela.
      let daNuvem=null, rev=0;
      try{ const r=await fetch('/api/arquivo'); if(r.ok){ const a=await r.json(); daNuvem=a.state; rev=a.rev||0; } }catch(e){}
      this.__rev=rev; this.__naNuvem=true;

      const local=(()=>{ try{ return JSON.parse(localStorage.getItem(lsKey())||'null'); }catch(e){ return null; } })();
      const base=daNuvem&&daNuvem.eras?daNuvem:(local||{});
      if(daNuvem&&daNuvem.eras){ try{ localStorage.setItem(lsKey(),JSON.stringify(daNuvem)); }catch(e){} }

      const st=Object.assign({era:null,tab:'cronica',eras:{},mapZ:undefined,mapX:undefined,mapY:undefined},load()||base);
      this.setState({...st,perfil,busy:false,loginErr:'',loginNome:'',loginPin:'',nuvem:'Salvo na nuvem'},
        ()=>{ this.applyTheme&&this.applyTheme(this.state.era); this.save(); });
    }catch(err){
      // Rede fora: entra local em vez de barrar o jogo.
      this.entrarLocal(nome,slug,'');
      this.setState({busy:false});
    }
  }

  /** Caminho do artifact: perfil neste navegador, sem servidor nenhum. */
  entrarLocal(nome,slug,pinHash){
    this.__naNuvem=false;
    const list=SVP.list(), known=list.find(x=>x.slug===slug);
    const perfil={slug,nome:known?known.nome:nome,pinHash:pinHash||''};
    SVP.saveList([perfil,...list.filter(x=>x.slug!==slug)].slice(0,12)); SVP.setCur(perfil);
    try{ const key=LS0+'::'+slug, legacy=localStorage.getItem(LS0); if(!localStorage.getItem(key)&&legacy&&!list.length) localStorage.setItem(key,legacy); }catch(e){}
    const st=Object.assign({era:null,tab:'cronica',eras:{},mapZ:undefined,mapX:undefined,mapY:undefined},load()||{});
    this.setState({...st,perfil,loginErr:'',loginNome:'',loginPin:'',nuvem:'Salvo neste navegador'},
      ()=>{ this.applyTheme&&this.applyTheme(this.state.era); this.save(); });
  }

  /**
   * Grava o arquivo na conta, agrupado: o jogo chama save() a cada setState, e
   * uma requisicao por tecla digitada seria absurdo. A gravacao local ja'
   * aconteceu antes desta chamada — isto e' a copia duravel.
   */
  gravarArquivo(snap){
    if(!this.__naNuvem) return;
    this.__pend=snap;
    clearTimeout(this.__gt);
    this.__gt=setTimeout(async()=>{
      if(this.__gInFlight||!this.__pend) return;
      const corpo=this.__pend; this.__pend=null; this.__gInFlight=true;
      try{
        const res=await fetch('/api/arquivo',{method:'PUT',headers:{'content-type':'application/json'},
          body:JSON.stringify({...corpo,rev:this.__rev||0})});
        if(res.status===409){
          // Outra aba ou outro aparelho gravou depois. Parar de escrever e'
          // melhor que passar por cima do progresso de la'.
          const j=await res.json().catch(()=>({}));
          this.__rev=j.rev||this.__rev; this.__naNuvem=false;
          this.setState({nuvem:'Aberto noutro lugar — recarregue'});
        } else if(res.ok){
          const j=await res.json().catch(()=>({}));
          if(typeof j.rev==='number') this.__rev=j.rev;
          this.setState({nuvem:'Salvo na nuvem'});
        }
      }catch(e){
        // Rede fora: devolve para a fila, o save local ja' garantiu a jogada.
        if(!this.__pend) this.__pend=corpo;
      }
      this.__gInFlight=false;
      if(this.__pend) this.gravarArquivo(this.__pend);
    },700);
  }

  doLogout(){
    clearTimeout(this.__cs); clearTimeout(this.__gt); this.__naNuvem=false; this.__pend=null;
    SVP.setCur(null); this.__lastCloud=null; this.__rev=0;
    fetch('/api/auth/logout',{method:'POST'}).catch(()=>{});
    this.setState({perfil:null,era:null,eras:{},loginNome:'',loginPin:'',loginErr:'',nuvem:''},
      ()=>this.applyTheme&&this.applyTheme(null));
  }

  ingest(text, opts){
    const era=this.state.era, d=this.cur();
    const ch={...d.char}; const caso={...d.caso,pistas:[...d.caso.pistas],provas:[...d.caso.provas],vant:[...d.caso.vant],prob:[...d.caso.prob]};
    const naCena=[...d.naCena]; const acts=[]; const fx=[]; const book=L()[era].npcs; const tri0=triCount(d.caso.fios);
    const clean = text.replace(/\[([^\[\]]{1,240})\]/g,(m,inner)=>{
      const i=inner.indexOf(':'); if(i<0) return m;
      let key=norm(inner.slice(0,i)).replace(/\s+/g,''); const val=inner.slice(i+1).trim();
      const neg=key.startsWith('-'); key=key.replace(/^[-+]/,'');
      const num=parseInt(val.replace(/[−–]/g,'-').replace(/[^\d+-]/g,''),10)||0;
      switch(key){
        case 'TESTE': { const [h,pp]=String(val).split('|'); const pm=(pp||'').replace(/^\s*problema\s*:?\s*/i,'').trim(); acts.push({t:'teste',v:this.matchSkill(h.trim()),prob:pm}); break; }
        case 'CHOQUE': acts.push({t:'choque',v:Math.abs(num)||2,culpa:/culpa/i.test(val)}); break;
        case 'BENEFICIO': acts.push({t:'benef',v:this.matchSkill(val)}); break;
        case 'SEGREDO': if(ch.segredo){ ch.segredoVelho=ch.segredo; ch.segredo=''; ch.imp=clamp((ch.imp||0)+1,0,3); acts.push({t:'choque',v:4,culpa:false}); fx.push('Segredo revelado · +1 Ímpeto · choque 4'); } break;
        case 'PISTA': caso.pistas.push({id:uid(),t:val}); fx.push('Pista anotada'); break;
        case 'PROVA': { const [t,p]=val.split('|'); caso.provas.push({id:uid(),t:t.trim(),peso:clamp(parseInt((p||'').replace(/\D/g,''))||1,1,3)}); fx.push('Prova registrada'); break; }
        case 'VANTAGEM': if(neg){ caso.vant=caso.vant.filter(x=>norm(x)!==norm(val)); fx.push('Vantagem descartada: '+val);} else if(!caso.vant.includes(val)){ caso.vant.push(val); fx.push('Vantagem: '+val);} break;
        case 'PROBLEMA': if(neg){ caso.prob=caso.prob.filter(x=>norm(x)!==norm(val)); fx.push('Problema descartado: '+val);} else if(!caso.prob.includes(val)){ caso.prob.push(val); fx.push('Problema: '+val);} break;
        case 'SAUDE': case 'VITALIDADE': ch.saude=clamp(ch.saude+num,-12,12); fx.push('Vitalidade '+sign(num)); break;
        case 'SANGUE-FRIO': case 'SANGUEFRIO': ch.sf=clamp(ch.sf+num,-12,12); fx.push('Sangue-Frio '+sign(num)); break;
        case 'INTEGRIDADE': case 'CODIGO': case 'MEDIDOR': ch.med=clamp(ch.med+num,0,10); fx.push(R()[era].medidor.n+' '+sign(num)); break;
        case 'IMPETO': case 'IMPETOS': case 'IMPULSO': case 'IMPULSOS': ch.imp=clamp(ch.imp+num,0,3); fx.push((era==='1994'?'Adrenalina ':'Ímpeto ')+sign(num)); break;
        case 'ADRENALINA': if((R()[era].mods||[]).includes('adr')){ ch.adr=clamp(ch.adr+num,0,3); fx.push('Adrenalina '+sign(num)); } else { ch.imp=clamp(ch.imp+num,0,3); fx.push((era==='1994'?'Adrenalina ':'Ímpeto ')+sign(num)); } break;
        case 'IMPRENSA': ch.imprensa=clamp(ch.imprensa+num,0,6); fx.push('Imprensa '+sign(num)); break;
        case 'FICHA': { const v0=ch.ficha||0; ch.ficha=clamp(v0+num,0,6); fx.push('Ficha '+sign(num)+(ch.ficha>=6&&v0<6?' · intimação na Sala 3':ch.ficha>=4&&v0<4?' · emprego, contrato ou licença perdidos':ch.ficha>=2&&v0<2?' · documentos pedidos na rua':'')); break; }
        case 'RUIDO': if(!(R()[this.state.era].mods||[]).includes('ruido')) break; ch.ruido=clamp((ch.ruido||0)+num,0,10); fx.push('Ruído '+sign(num)+' ('+ch.ruido+')'); break;
        case 'FIO': { const [n,st]=val.split('|'); const i=parseInt(n)-1; const f=(caso.fios||[])[i]; if(f){ const firme=/firme/i.test(st||''); caso.fios=caso.fios.map((x,j)=>j===i?{...x,st:firme?'firme':'cortado'}:x); fx.push('Fio '+(i+1)+': '+(firme?'firme':'cortado')); if(firme){ const vt='Fio firme: '+f.rel; if(!caso.vant.includes(vt)) caso.vant.push(vt); } } break; }
        case 'NPC': { const nv=norm(val); const idx=book.findIndex(n=>norm(n.n)===nv||norm(n.n).includes(nv)||nv.includes(norm(n.n).replace(/^(CAPITAO|TENENTE|PREFEITO|DR\.|JUIZ|PADRE|SARGENTO|DETETIVE|PROMOTOR) /,''))); if(idx>=0 && !naCena.includes('b'+idx)){ naCena.push('b'+idx); fx.push('Em cena: '+book[idx].n);} break; }
        default: return m;
      }
      return '';
    }).replace(/^#{1,6}\s*/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1').replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*/g,'$1$2').replace(/^\s*[-•]\s+/gm,'').replace(/^-{3,}$/gm,'').replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim();
    const entry = opts.npc ? {id:uid(),k:'npc',who:opts.npc.n,text:clean,acts} : {id:uid(),k:'narr',who:'Narrador',text:clean,acts};
    const reveal = triCount(caso.fios) > tri0; if(reveal) fx.push('Revelação: três Fios firmes fecham um triângulo');
    const extra = fx.length ? [{id:uid(),k:'mech',who:'Ficha',text:fx.join(' · ')}] : [];
    this.upd(e=>({...e,char:ch,caso,naCena,log:[...e.log,entry,...extra]}));
    if(reveal) setTimeout(()=>this.narrate('Três Fios firmes do Mural fecham um triângulo: entregue de graça a Revelação, a pista central que está atrás dos três (o nome de quem paga, o lugar onde a coisa está ou a data em que vai acontecer), com [PISTA: ...].'),160);
  }

  rollTest(hab, src){
    const era=this.state.era, c=this.cur().char;
    const esp=c.esp.includes(hab); const pb=(src&&src.prob)||''; const mod=(esp?1:0)-(c.saude<=0?1:0)-(c.sf<=0?1:0)-(pb?1:0)+(src&&src.mod||0);
    const r=rnd(6), tot=r+mod, res=tot<=2?'Revés':tot<=4?'Empate':'Avanço';
    const parts=[esp?'especialidade +1':'', c.saude<=0?'ferido −1':'', c.sf<=0?'abalado −1':'', pb?'problema “'+pb+'” −1':'', src&&src.mod?'mod '+sign(src.mod):''].filter(Boolean).join(', ');
    if(src && src.entryId!=null) this.markAct(src.entryId, src.actIdx);
    if(!(src&&src.narrate)){ const t0=`1d6 = ${r}${mod?' '+sign(mod):''}${parts?' ('+parts+')':''} → ${tot} · ${res}`; this.setState({diceRes:{title:'Teste solo · '+hab,big:res,detail:t0,logged:false,nar:`Teste de ${hab}: ${t0}.`}}); return; }
    const pend=[];
    if(res==='Empate' && c.imp>0) pend.push('impulso');
    if(modsOf(era).includes('adr') && c.adr>0 && res!=='Avanço') pend.push('adr');
    const roll={hab,r,mod,tot,res,nar:!!(src&&src.narrate)};
    const text=`1d6 = ${r}${mod?' '+sign(mod):''}${parts?' ('+parts+')':''} → ${tot} · ${res}`;
    if(pend.length){ pend.push('aceitar'); this.addLog({k:'mech',who:'Teste · '+hab,text,roll,pend}); }
    else { this.addLog({k:'mech',who:'Teste · '+hab,text,roll}); if(roll.nar) this.afterTest(roll,''); }
    this.setState({diceRes:{title:'Teste solo · '+hab,big:res,detail:text,logged:true,nar:`Teste de ${hab}: ${text}.`}});
  }
  resolvePend(entry, how){
    const c=this.cur().char; const roll={...entry.roll}; let note='';
    if(how==='impulso'){ this.setChar({imp:c.imp-1}); roll.res='Avanço'; note='gastou 1 Ímpeto para virar Empate em Avanço.'; }
    if(how==='adr'){ this.setChar({adr:c.adr-1}); roll.tot+=2; roll.res=roll.tot<=2?'Revés':roll.tot<=4?'Empate':'Avanço'; note='gastou 1 de Adrenalina: +2 depois do dado ('+roll.tot+').'; }
    if(how==='aceitar') note= roll.res==='Empate' ? 'aceitou o sucesso com custo.' : 'aceitou o resultado.';
    this.patchEntry(entry.id,{pend:null,text:entry.text+' → '+roll.res+(how==='aceitar'?'':' ('+note.replace(/\.$/,'')+')')});
    if(roll.nar) this.afterTest(roll,note); else this.setState({diceRes:{...this.state.diceRes,big:roll.res}});
  }
  afterTest(roll,note){
    const reg = roll.res==='Revés' ? 'Revés: a ação falha ou sai cara — imponha um Problema com [PROBLEMA: ...].' : roll.res==='Empate' ? 'Empate: consegue, com custo — um Problema leve ou uma complicação.' : 'Avanço: consegue; se a cena for importante, conceda uma [VANTAGEM: ...].';
    setTimeout(()=>this.narrate(`O personagem rolou ${roll.hab}: ${roll.r}${roll.mod?' '+sign(roll.mod):''} = ${roll.tot}. ${note} Resultado final: ${roll.res}. ${reg} Primeiro, em uma ou duas frases, explique ao jogador como a regra funcionou nesta rolagem: o dado, cada modificador aplicado e por quê, a faixa atingida (Revés 1–2, Empate 3–4, Avanço 5+) e o que ela significa; depois narre a consequência.`),40);
  }
  markAct(entryId, idx){ this.upd(e=>({...e,log:e.log.map(x=>x.id===entryId?{...x,acts:(x.acts||[]).map((a,i)=>i===idx?{...a,done:true}:a)}:x)})); }
  choqueDif(c, culpa){
    const era=this.state.era, pulp=modsOf(era).includes('adr'), integ=!modsOf(era).includes('codigo');
    let dif=4, why=[];
    if(!pulp && c.sf<=0){ dif=5; why.push('Abalado: contra 5'); }
    if(culpa && integ && !pulp){ if(c.med>=8){ dif=5; why.push('culpa com Integridade alta: contra 5'); } else if(c.med<=3){ dif=3; why.push('culpa com Integridade baixa: contra 3'); } }
    return {dif, why};
  }
  rollChoque(perda, src, culpa){
    const era=this.state.era, c=this.cur().char;
    const esp=c.esp.includes('Sangue-Frio'); const {dif,why}=this.choqueDif(c,culpa); const r=rnd(6), tot=r+(esp?1:0); const pass=tot>=dif;
    const loss = pass ? (modsOf(era).includes('adr')?Math.floor(perda/2):0) : perda;
    const sf=clamp(c.sf-loss,-12,12);
    if(src) this.markAct(src.entryId, src.actIdx);
    this.setChar({sf});
    const text=`1d6 = ${r}${esp?' +1':''} contra ${dif}${why.length?' ('+why.join('; ')+')':''} · ${pass?'passou':'falhou'} · perde ${loss} (Sangue-Frio ${sf}, ${stateOf(sf,'sf')})`;
    if(src) this.addLog({k:'mech',who:'Choque · perda '+perda,text});
    this.setState({diceRes:{title:'Choque de Sangue-Frio',big:pass?'Aguentou':'Falhou',detail:text,logged:!!src,nar:'Choque de Sangue-Frio: '+text+'.'}});
    if(src) setTimeout(()=>this.narrate(`Choque de Sangue-Frio (perda ${perda}): ${pass?'passou':'falhou'}, perdeu ${loss}; agora ${sf} (${stateOf(sf,'sf')}). Primeiro explique em uma frase a regra do choque (1d6 contra a Dificuldade, o que passar ou falhar custa) e como ela se aplicou agora; depois mostre o efeito interno em uma ou duas frases e siga a cena.`),40);
  }
  conf2(key,msg){ const now=Date.now(); if(this.__c2&&this.__c2.k===key&&now-this.__c2.t<5000){ this.__c2=null; return true; } this.__c2={k:key,t:now}; svToast(msg+' Clique de novo para confirmar.'); return false; }
  invBonus(c){ /* Benefício do papel que dá pontos em habilidade ("+2 em Barganha"): soma direto, sem sair dos 8 pontos */
    const era=this.state.era, RR=R()[era]; if(!RR||!c||!c.arq) return {};
    const oc=(RR.arquetipos||[]).find(a=>a.n===c.arq); if(!oc||!oc.v) return {};
    const nomes=invList(era), out={}, re=/\+(\d+)\s+(?:pontos?\s+)?em\s+([^).,;:]+)/gi; let m;
    while((m=re.exec(oc.v))){ const alvo=m[2].trim().toLowerCase(); const k=nomes.find(n=>n.toLowerCase()===alvo||hn(era,n).toLowerCase()===alvo); if(k) out[k]=(out[k]||0)+parseInt(m[1]); }
    return out; }
  invEf(c,k){ return ((c.inv||{})[k]??0)+(this.invBonus(c)[k]||0); }
  invRes(c,k){ return Math.max(0,this.invEf(c,k)-1-((c.invGasto||{})[k]||0)); }
  spendBenef(hab, src, via){
    const c=this.cur().char;
    if(c.saude<=0){ this.addLog({k:'mech',who:'Benefício · '+hab,text:'Ferido não paga benefícios investigativos. Trate a Vitalidade primeiro (Primeiros Socorros ou uma noite de descanso).'}); return; }
    if(via==='res'){
      const r=this.invRes(c,hab);
      if(r<=0){ this.addLog({k:'mech',who:'Reserva',text:'A reserva de '+hab+' acabou neste caso.'}); return; }
      this.markAct(src.entryId, src.actIdx); this.setChar(x=>({invGasto:{...(x.invGasto||{}),[hab]:((x.invGasto||{})[hab]||0)+1}}));
      this.addLog({k:'mech',who:'Benefício · '+hab,text:'1 ponto da reserva de '+hab+' gasto ('+(r-1)+' restante'+(r-1===1?'':'s')+'); os Ímpetos ficam intactos'});
      setTimeout(()=>this.narrate(`O personagem gasta 1 ponto da reserva de ${hab} para obter o benefício oferecido. Entregue um benefício concreto e útil, que mostre por que ele é bom nisso.`),40);
      return;
    }
    if(c.imp<=0){ this.addLog({k:'mech',who:'Ímpetos',text:'Sem Ímpetos para gastar.'}); return; }
    this.markAct(src.entryId, src.actIdx); this.setChar({imp:c.imp-1});
    this.addLog({k:'mech',who:'Benefício · '+hab,text:'1 Ímpeto gasto ('+(c.imp-1)+' restantes)'});
    setTimeout(()=>this.narrate(`O personagem gasta 1 Ímpeto em ${hab} para obter o benefício oferecido. Entregue um benefício concreto e útil.`),40);
  }

  rollGerador(){
    const era=this.state.era;
    if(era==='1934'){ const g=R()['1934'].gerador; const v={}; Object.keys(g).forEach(k=>v[k]=pick(g[k]));
      this.setCaso({premissa:`${v.cliente} contrata você: ${v.crime.toLowerCase()} — ${v.vitima.toLowerCase()}.`, segredo:`O culpado é ${v.culpado.toLowerCase()}, por ${v.motivo.toLowerCase()}; a reviravolta: ${v.reviravolta.toLowerCase()}.`});
    } else if(era!=='1994'){ const g=S().gerador; const v={}; ['cliente','crime','culpado','motivo','reviravolta'].forEach(k=>v[k]=pick(g[k]));
      this.setCaso({premissa:`${v.cliente} procura você: ${v.crime.toLowerCase()}.`, segredo:`O culpado é ${v.culpado.toLowerCase()}, por ${v.motivo.toLowerCase()}; a reviravolta: ${v.reviravolta.toLowerCase()}. Toque da era: ${g.toque[era]}`});
    } else { const regs=L()['1994'].regioes.filter(r=>r.gancho); const r=pick(regs); const opts=r.gancho.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/); const g=pick(opts.length>1?[opts.slice(0,Math.ceil(opts.length/2)).join(' '),opts.slice(Math.ceil(opts.length/2)).join(' ')]:opts);
      this.setCaso({premissa:g, segredo:''}); this.upd(e=>({...e,cena:r.nome}));
    }
    this.setState({showSeg:false});
  }
  openCase(){
    const d=this.cur(); if(!d.caso.premissa) this.rollGerador();
    if(!d.log.some(e=>e.k==='narr'||e.k==='npc')) this.upd(e=>({...e,log:e.log.filter(x=>x.k!=='mech')}));
    this.setTab('cronica');
    setTimeout(()=>{ const c=this.cur().caso;
      this.narrate(`Abra o caso (Ato 1 · o cliente) com uma cena de abertura marcante: comece pela cidade (manchete, rádio, clima da noite), apresente o personagem num lugar concreto de Saint Village e termine com uma pergunta — alguém morto, desaparecido ou pagando para descobrir algo. Premissa: ${c.premissa}. Se fizer sentido, sugira um título curto para o caso no fim com [PISTA: ...] apenas se houver pista real.`); },60);
  }

  loadCaso(k){
    this.setCaso({...blankCaso(), titulo:k.titulo, premissa:k.premissa, segredo:k.segredo||'', nec:k.nec||4});
    if(k.cena && L()[this.state.era].regioes.some(r=>r.nome===k.cena)) this.upd(e=>({...e,cena:k.cena}));
    this.setState({showSeg:false, tab:'caso'},()=>this.save());
  }
  fioTxt(f,i){ const P=this.cur().caso.pistas; const a=P.find(p=>p.id===f.a), b=P.find(p=>p.id===f.b); return `Fio ${i+1}: “${a?a.t:'?'}” ↔ “${b?b.t:'?'}” — ${f.rel}`; }
  verifyFio(i){ const d=this.cur(), c=d.char, f=(d.caso.fios||[])[i]; if(!f) return;
    if(c.imp<=0){ this.addLog({k:'mech',who:'Mural',text:'Sem Ímpetos para verificar o Fio.'}); return; }
    this.setChar({imp:c.imp-1}); this.addLog({k:'mech',who:'Mural',text:'Verificar · '+this.fioTxt(f,i)+' · 1 Ímpeto ('+(c.imp-1)+' restantes)'}); this.setTab('cronica');
    setTimeout(()=>this.narrate(`O personagem verifica no Mural o ${this.fioTxt(f,i)}, usando uma habilidade investigativa coerente (Contabilidade para o dinheiro, Vigilância para a fita, Faro para Mentiras para o depoimento). Responda com honestidade absoluta segundo a VERDADE OCULTA do caso: nunca minta sobre Fio verificado; se um dos Cartões foi plantado pela oposição, o Fio sai cortado. Mostre como ele descobre e termine com [FIO: ${i+1} | firme] ou [FIO: ${i+1} | cortado]. Se o Fio firme ligar um aliado ao inimigo, peça [CHOQUE: 3].`),60); }
  actFio(i){ const d=this.cur(), f=(d.caso.fios||[])[i]; if(!f) return; this.setTab('cronica');
    this.addLog({k:'action',text:'Age sobre o Fio solto · '+this.fioTxt(f,i)});
    setTimeout(()=>this.narrate(`O personagem age agora sobre o ${this.fioTxt(f,i)} sem tê-lo verificado (confronta alguém, invade, publica). Narre a ação. Se pela verdade oculta o Fio for falso, aplique a consequência pública — o inocente acusado, o processo, a matéria desmentida no telejornal das onze — com [SANGUE-FRIO: -2], [RUIDO: +2] e [FIO: ${i+1} | cortado]; se for verdadeiro, [FIO: ${i+1} | firme].`),60); }
  useMedalha(){ const d=this.cur(), c=d.char, n=(d.caso.medalhaUsos||0)+1;
    const esp=c.esp.includes('Sangue-Frio'), r=rnd(6), tot=r+(esp?1:0), pass=tot>=4, sf=pass?c.sf:clamp(c.sf-2,-12,12);
    const patch={sf}; if(n===3) patch.vicioTr=Math.min(3,c.vicioTr+1);
    this.setChar(patch); this.setCaso({medalhaUsos:n});
    this.addLog({k:'mech',who:'A Medalha · uso '+n,text:`${n===1?'+2 no próximo teste social diante de autoridade':'Já usada neste caso: abre a porta, sem o +2'} · Sangue-Frio 1d6 = ${r}${esp?' +1':''} contra 4 · ${pass?'aguentou':'falhou, perde 2'}${n===3?' · terceiro uso: uma dose de Vício':''}`});
    this.setTab('cronica');
    setTimeout(()=>this.narrate(`O personagem mostra a medalha (${c.medalha||'a medalha da guerra'}) a quem manda na cena. ${n===1?'A porta se abre: trate o próximo pedido social a essa autoridade, patrão ou padre como tendo +2.':'A medalha já foi usada neste caso: ela ainda impressiona, mas não dá bônus.'} ${pass?'Ele aguenta a lembrança.':'Narre um segundo de guerra no meio da cena: o cheiro, o barulho, o nome de alguém.'}`),60); }
  flashback(){ const era=this.state.era, d=this.cur(), c=d.char; if(!c.lacoEra||d.caso.flash) return;
    const adr=modsOf(era).includes('adr'); if(adr&&c.adr<1){ this.addLog({k:'mech',who:'Flashback geracional',text:'Sem Adrenalina para pagar o flashback.'}); return; }
    this.setChar(adr?{adr:c.adr-1}:{sf:clamp(c.sf-2,-12,12)}); this.setCaso({flash:true});
    this.addLog({k:'mech',who:'Flashback geracional',text:`Em ${c.lacoEra} · ${adr?'−1 de Adrenalina':'−2 de Sangue-Frio'}`}); this.setTab('cronica');
    setTimeout(()=>this.narrate(`FLASHBACK GERACIONAL: corte para ${c.lacoEra}. O jogador assume o antepassado (${c.lacoDe||'de quem herdou o Laço'}; ficha de antepassado: ${c.antepassado||'quatro investigativas com 2 e quatro gerais com 6, coerentes com a era e o ofício'}). Narre, no ritmo e nas regras daquela era, uma cena curta em que o antepassado deixa algo pronto para hoje, ligado ao caso atual. Não desfaça nada que a mesa já viu, não contradiga a cronologia e respeite a consciência do antepassado. Se a preparação exigir risco, peça [TESTE: ...]; se falhar, a coisa existe mas deu errado, e isso se narra no presente. Termine voltando a ${era} com o que ficou pronto.`),60); }
  jaVi(){ this.setCaso({jaVi:true}); this.addLog({k:'mech',who:'Envelhecer',text:'“Já vi isso antes” · uma vez por caso'}); this.setTab('cronica');
    setTimeout(()=>this.narrate('O personagem, com setenta anos ou mais, declara que já viu isso antes. Entregue uma pista central do caso sem que ele esteja no lugar certo, como uma lembrança de outra década que de repente encaixa. Marque [PISTA: ...].'),60); }
  jumpEra(target, heir){
    const from=this.state.era; if(!target||+target<=+from) return;
    const c=this.cur().char, RT=R()[target], ex=this.state.eras[target];
    if(ex && ex.char && ex.char.nome && !this.conf2('salto'+target,`Já existe ${ex.char.nome} em ${target}: a ficha de lá será substituída.`)) return;
    let nc;
    if(heir){ nc={...blankChar(target), lacoEra:from, lacoDe:c.nome||'', herancas:c.testamento||'', notas:`Herdeiro de ${c.nome||'um protagonista'} (${from}).`}; }
    else {
      const dec=Math.floor((+target - +from)/10), base=blankChar(target), inv={...base.inv};
      Object.keys(c.inv||{}).forEach(k=>{ if(k in inv) inv[k]=c.inv[k]; });
      inv['Pesquisa']=Math.min(4,(inv['Pesquisa']||1)+dec);
      const idade=c.anoNasc ? (+target - +c.anoNasc) : null;
      const toCod = !modsOf(from).includes('codigo') && modsOf(target).includes('codigo');
      const notas=[c.notas, `Salto de ${from} para ${target}: +${dec} em Pesquisa; mova até ${dec*2} pontos entre as gerais.`, idade!=null&&idade>=50?`Aos ${idade} anos: −1 de Fôlego e Resistência por década depois dos 50.`:'', idade!=null&&idade>=70?'Setenta anos ou mais: −1 de Vitalidade máxima por década; uma vez por caso, “já vi isso antes”.':'', toCod?'A Integridade virou Código: escreva as três regras numa cena.':''].filter(Boolean).join('\n');
      nc={...base,...c,inv,esp:c.esp.filter(k=>RT.gerais.includes(k)),saude:8,sf:Math.min(8,c.sf),imp:3,invGasto:{},adr:1,imprensa:0,ficha:0,ruido:0,vicioTr:0,ori:'',lado:c.lado||'Contrato',notas};
      if(target==='1994'){ const tr=TRI_34_94[nc.porta]||nc.porta||''; nc={...nc,porta:tr,arq:'',oficio:'',equip:'',equipAuto:'',notas:nc.notas+'\nEm 1994 a trilha '+(c.porta||'')+' virou '+tr+'. Escolha um ofício da década; o papel continua seu.'}; }
    }
    this.setState(s=>{ const eras={...s.eras}; eras[target]={...blankEra(target), char:nc}; return {era:target, eras, tab:'ficha', diceRes:null}; }, ()=>this.save());
  }

  renderVals(){ window.__svApp=this; { const e=this.state.era||'home'; if(window.__svEraSent!==e){ window.__svEraSent=e; setTimeout(()=>window.dispatchEvent(new CustomEvent('sv-era',{detail:e})),0); } } const v=this._renderVals(); return (this.state.era==='1994')?impDeep(v):v; }
  _renderVals(){
    const s=this.state;
    if(!s.ready) return {loading:true,noEra:false,hasEra:false};
    const perfisL=(()=>{ const m=new Map(); [...SVP.list(),...(s.perfisNuvem||[])].forEach(x=>{ if(x&&x.slug&&!m.has(x.slug)) m.set(x.slug,x); }); return [...m.values()].slice(0,8).map(x=>({nome:x.nome,pin:!!x.pinHash,go:()=>this.setState({loginNome:x.nome,loginPin:'',loginErr:''})})); })();
    if(!s.perfil) return {loading:false,noEra:true,hasEra:false,needLogin:true,loginCls:'sv-home-login',hasCards:false,loginNome:s.loginNome,loginPin:s.loginPin,loginErr:s.loginErr,hasLoginErr:!!s.loginErr,
      onLoginNome:ev=>this.setState({loginNome:ev.target.value,loginErr:''}), onLoginPin:ev=>this.setState({loginPin:ev.target.value.replace(/\D/g,'').slice(0,4),loginErr:''}),
      onLoginKey:ev=>{ if(ev.key==='Enter'){ ev.preventDefault(); this.doLogin(this.state.loginNome,this.state.loginPin); } }, doLogin:()=>this.doLogin(this.state.loginNome,this.state.loginPin),
      perfisL, hasPerfis:perfisL.length>0, nuvemOk:!!this.__db, nuvemNo:!this.__db, onImport:ev=>this.importArquivo(ev)};
    if(!s.era || !s.eras[s.era]) return {loading:false,noEra:true,hasEra:false,needLogin:false,loginCls:'',hasCards:true,perfilNome:s.perfil.nome,nuvem:s.nuvem||(this.__db?'Salvo na nuvem':'Salvo neste navegador'),doLogout:()=>this.doLogout(),doExport:()=>this.exportArquivo(),onImport:ev=>this.importArquivo(ev),pick1934:()=>this.pickEra('1934'),pick1994:()=>this.pickEra('1994')};
    const era=s.era, RR=R()[era], LL=L()[era], d=this.cur(), c=migChar({...blankChar(era),...d.char,inv:{...blankChar(era).inv,...d.char.inv}},era), caso={...blankCaso(),...d.caso}, is94=era==='1994', SS=S();
    const has=m=>(RR.mods||[]).includes(m);
    const tabIs=k=>s.tab===k;
    const INK='var(--sv-bg,#131212)';
    const mkCells=(key,min,max,boxMax,kind)=>{
      const v=c[key]||0, tok=(key==='imp'||key==='adr');
      const base='flex:1 1 0;min-width:0;height:16px;';
      const cell=(n,on,zone,txt)=>({t:txt,st:base+'display:flex;align-items:center;justify-content:center;box-sizing:border-box;font-family:Oswald,sans-serif;font-size:10px;letter-spacing:0;line-height:1;'+
        (on?'background:'+INK+';border:1px solid '+INK+';':zone?'background:#b3262c;border:1px solid #b3262c;':(kind&&n<=0?'background:rgba(127,127,127,0.1);border:1px solid transparent;':'background:rgba(127,127,127,0.24);border:1px solid transparent;'))});
      if(kind){ const out=[]; for(let n=max;n>=min;n--){ const cl=cell(n,n>0&&n<=v,n<=0&&n>=v,''); if(n===0) cl.st+='margin-left:8px;'; out.push(cl); } return out; }
      if(tok){ const slots=Math.max(boxMax,v); return Array.from({length:slots},(_,i)=>cell(i+1,i<v,false,'')); }
      return Array.from({length:boxMax},(_,i)=>cell(i+1,i<v,false,''));
    };
    const band=(t,w,last,gap,e)=>({t,e:e||'',hasE:!!e,st:'flex:'+w+' 1 0;min-width:0;border-left:1px solid rgba(19,18,18,0.45);padding:2px 0 0 5px;'+(gap?'margin-left:8px;':'')+(last?'text-align:right;border-left:0;padding-left:0;':'')+'overflow:hidden'});
    const mkBands=(key,kind)=>{
      if(kind==='saude') return [band('Inteiro',12,false,false,'normal'),band('Ferido',6,false,true,'−1 e sem benefício'),band('Grave',6,false,false,'não luta'),band('†',1,true)];
      if(kind==='sf') return [band('Intacto',12,false,false,'normal'),band('Abalado',6,false,true,'−1 nos testes'),band('Por um fio',6,false,false,'ganha cicatriz'),band('✕',1,true)];
      if(key==='med') return []; /* o nível atual já aparece no topo da escala */
      return [];
    };
    const mkTrack=(label,key,min,max,boxMax,kind,hint)=>({label,v:c[key],barW:'width:'+((kind?(max-min+1):Math.max(boxMax,c[key]||0))*19+(kind?8:0))+'px;max-width:100%;',cells:mkCells(key,min,max,boxMax,kind),bands:mkBands(key,kind),hasBands:mkBands(key,kind).length>0,vTxt:String(c[key]||0).replace('-','−'),state:kind?stateOf(c[key],kind):(key==='med'?(RR.medidor.niveis.find(([t])=>c.med>=t)||[0,''])[1]:c[key]+' / '+boxMax),hint,hasHint:!!hint,
      boxes:Array.from({length:boxMax},(_,i)=>({on:i<c[key],off:i>=c[key]})),
      inc:()=>this.setChar(x=>{ const v=clamp((x[key]||0)+1,min,max); return key==='sf'&&!(d.log||[]).length?{sf:v,sfIni:v}:{[key]:v}; }), dec:()=>this.setChar(x=>{ const v=clamp((x[key]||0)-1,min,max); return key==='sf'&&!(d.log||[]).length?{sf:v,sfIni:v}:{[key]:v}; })});
    const tracks=[mkTrack('Vitalidade','saude',-12,12,12,'saude',''),mkTrack('Sangue-Frio','sf',-12,12,12,'sf',''),mkTrack(RR.medidor.n,'med',0,10,10,null,has('codigo')?'Quebrar uma regra: −1 e choque 4':'Jogadas sujas funcionam, e custam'),mkTrack('Ímpetos','imp',0,3,3,null,'Começa em 1 · só volta agindo pela motivação contra si')];
    { const ti=tracks.find(t=>t.label==='Ímpetos'); if(ti){ ti.hasLegend=true;
      ti.gasta=[{t:'Empate (3–4) vira Avanço'},{t:'Benefício sem reserva'}];
      ti.ganha=[{t:has('codigo')?'Agir pelo Código contra si':'Agir pela motivação contra si'}]; } }
    { const tm=tracks.find(t=>t.label===RR.medidor.n); if(tm){ const nv=[...RR.medidor.niveis].sort((a,b)=>a[0]-b[0]); const EF=has('codigo')?['vira Personagem do Diretor','as regras têm preço','a primeira rachadura','já cedeu uma vez','as três regras de pé']:['vira Personagem do Diretor','alguém dá ordens','1×/caso uma sujeira antiga cobra','sem efeito','1×/caso um honesto ajuda'];
      tm.legend=nv.map(([t,n],i)=>{ const hi=i+1<nv.length?nv[i+1][0]-1:10; const on=c.med>=t&&c.med<=hi; return {t:n,r:t===hi?String(t):t+'–'+hi,e:EF[i]||'',st:on?'opacity:1;border-color:var(--sv-bg,#131212)':'opacity:.55'}; }); tm.hasLeg2=true; tm.hint=has('codigo')?'Quebrar uma regra: −1 e choque de 4':'Jogada suja: −1 a −3 e teste de culpa'; tm.hasHint=true; } }
    { const ti=tracks.find(t=>t.label==='Ímpetos'); if(ti){ ti.hasLegend=false; ti.legend=[{t:'Gaste',r:'1',e:'empate (3–4) vira Avanço',st:'opacity:1'},{t:'Gaste',r:'1',e:'benefício sem reserva',st:'opacity:1'},{t:'Ganhe',r:'+1',e:has('codigo')?'agir pelo Código contra si':'agir pela motivação contra si',st:'opacity:1'}]; ti.hasLeg2=true; ti.hint='Começa em 1, máximo 3'; ti.hasHint=true; } }
    const dk=st=>String(st||'').split('var(--sv-bg,#131212)').join('var(--sv-ink,#e0e0e0)').split('rgba(19,18,18,').join('rgba(224,224,224,');
    if(has('adr')) tracks.push(mkTrack('Adrenalina','adr',0,3,3,null,'+2 depois do dado, ação extra, flashback'));
    if(has('imprensa')) tracks.push(mkTrack('Imprensa','imprensa',0,6,6,null,'Cheio: você vira procurado'));
    if(has('ficha')) tracks.push(mkTrack('A Ficha','ficha',0,6,6,null,'2 documentos na rua · 4 perde o emprego · 6 intimação na Sala 3'));
    if(has('ruido')) tracks.push(mkTrack('O Ruído','ruido',0,10,10,null,'O Diretor gasta 2, 3, 4 ou 6 · varrer baixa 2'));
    tracks.forEach(t=>{ const v=t.v||0; let L=null; if(t.label==='Vitalidade') L=v>=1?['Inteiro','normal']:v>=-5?['Ferido','−1 e sem benefício']:v>=-11?['Grave','não luta']:['†','morte']; else if(t.label==='Sangue-Frio') L=v>=1?['Intacto','normal']:v>=-5?['Abalado','−1 nos testes']:v>=-11?['Por um fio','ganha cicatriz']:['✕','perdido']; else if(t.label===RR.medidor.n){ const on=(t.legend||[]).find(x=>/opacity:1/.test(x.st)); if(on) L=[on.t,on.e]; } else if(t.label==='Ímpetos') L=['Gaste','empate vira Avanço ou benefício sem reserva · ganhe agindo pela motivação contra si']; t.curT=L?L[0]:"";t.curE=L?L[1]:""; t.hasCurLeg=!!L; { /* barras da mini ficha na largura toda, com casas e vãos em pixels inteiros da tela (qualquer zoom) */ const n=(t.cells||[]).length, dpr=window.devicePixelRatio||1, T=Math.max(150,Math.floor(window.__svBarT||262)), TD=Math.floor(T*dpr), g25=Math.round(2*dpr), c25=Math.floor((TD-24*g25)/25), TOT=25*c25+24*g25; let gD=n===25?g25:Math.round((n>4?2:3)*dpr), cD=n===25?c25:0; if(n!==25){ for(let k=0;k<4*n;k++){ if((TOT-(n-1)*(gD+k))%n===0){ gD+=k; break; } } cD=Math.floor((TOT-(n-1)*gD)/n); } const W=+(cD/dpr).toFixed(4), G=+(gD/dpr).toFixed(4); t.trW='width:'+(+(TOT/dpr).toFixed(4))+'px;max-width:100%;'; t.cellsD=(t.cells||[]).map((x,i)=>({...x,st:dk(x.st).replace('flex:1 1 0;min-width:0;','flex:none;width:'+W+'px;margin-right:'+(i<n-1?G:0)+'px;').replace('margin-left:8px;','')})); } t.bandsD=(t.bands||[]).map(x=>({...x,st:dk(x.st)})); t.legendD=(t.legend||[]).map(x=>({...x,st:dk(x.st)})); });
    const field=k=>ev=>this.setChar({[k]:ev.target.value});
    const npcs=this.allNpcs();
    const send=()=>{ const txt=s.draft.trim(); if(!txt||s.busy) return; if(s.mode==='duvida'){ this.addLog({k:'ask',text:txt}); this.setState({draft:''}); setTimeout(()=>this.askDirector(txt),30); return; } const npc=s.mode==='fala'&&s.talkTo?this.npcById(s.talkTo):null;
      this.addLog(s.mode==='fala'?{k:'speech',text:txt,to:npc?npc.n:''}:{k:'action',text:txt}); this.setState({draft:''});
      if(npc && !d.naCena.includes(npc.id)) this.upd(e=>({...e,naCena:[...e.naCena,npc.id]}));
      setTimeout(()=>this.narrate(s.mode==='fala'?(npc?`O personagem diz a ${npc.n}: "${txt}". Responda como ${npc.n}.`:`O personagem diz em voz alta: "${txt}". Narre a reação.`):`O personagem tenta: ${txt}. Narre.`, {npc}),30); };
    const logView=d.log.map(e=>{
      const acts=[];
      (e.acts||[]).forEach((a,i)=>{ if(a.done) return; const src={entryId:e.id,actIdx:i,narrate:true};
        if(a.t==='teste') acts.push({label:'Rolar '+a.v+(c.esp.includes(a.v)?' (+1)':'')+(a.prob?' (−1 · '+a.prob+')':''),go:()=>this.rollTest(a.v,{...src,prob:a.prob})});
        if(a.t==='choque') acts.push({label:(a.culpa?'Choque de culpa':'Choque de Sangue-Frio')+' · perda '+a.v,go:()=>this.rollChoque(a.v,src,a.culpa)});
        if(a.t==='benef'){ const r=this.invRes(c,a.v); if(r>0) acts.push({label:'Usar reserva de '+a.v+' ('+r+')',go:()=>this.spendBenef(a.v,src,'res')}); acts.push({label:'Gastar 1 Ímpeto · '+a.v,go:()=>this.spendBenef(a.v,src)}); } });
      (e.pend||[]).forEach(p=>{ if(p==='impulso') acts.push({label:'Gastar Ímpeto → Avanço',go:()=>this.resolvePend(e,'impulso')}); if(p==='adr') acts.push({label:'+2 com Adrenalina',go:()=>this.resolvePend(e,'adr')}); if(p==='aceitar') acts.push({label:'Aceitar resultado',go:()=>this.resolvePend(e,'aceitar')}); });
      return {...e,acts,isNarr:e.k==='narr',isNpc:e.k==='npc',isMech:e.k==='mech',isPlayer:e.k==='action'||e.k==='speech',isAsk:e.k==='ask',isRule:e.k==='rule',
        who:e.k==='ask'?((c.nome||'Você')+' → Diretor'):e.k==='action'?(c.nome||'Você'):e.k==='speech'?((c.nome||'Você')+(e.to?' → '+e.to:'')):e.who, text:e.k==='speech'?'— '+e.text:(e.text||'').replace(/^#{1,6}\s*/gm,'').replace(/\*\*(.+?)\*\*/g,'$1').replace(/__(.+?)__/g,'$1')};
    });
    const regioes=LL.regioes;
    const metaOf=r=> era==='1934' ? `Dono: ${r.dono} · Dif. social ${r.dif} · Perigo à noite: ${r.perigo}` : (r.dono?'Quem manda: '+r.dono:'');
    const cenaR=regioes.find(r=>r.nome===d.cena);
    const goRegion=nome=>{ this.upd(e=>({...e,cena:nome})); this.setTab('cronica'); setTimeout(()=>this.narrate(`O personagem segue para ${nome}. Descreva a chegada como abertura de cena: um lugar concreto da região, quem está lá, o que essa pessoa quer.`),60); };
    const pesoTotal=caso.provas.reduce((a,p)=>a+p.peso,0);
    const V=caso.vant.length, P=caso.prob.length;
    const climax = V>P ? `Mais Vantagens que Problemas (${V} × ${P}): a verdade vence.` : V===P ? `Empate (${V} × ${P}): vence pela metade.` : `Mais Problemas que Vantagens (${V} × ${P}): a cidade vence.`;
    const climaxFull = climax + (c.med<=2 ? (has('codigo')?' Código vendido: alguém liga com um pedido que não se recusa.':' Integridade 2 ou menos: você aceita um acordo sujo no epílogo.') : '');
    const vpBlock=(title,key,sugs)=>({title, items:caso[key].map(t=>({t,del:()=>this.setCaso(x=>({[key]:x[key].filter(y=>y!==t)}))})), sugs:sugs.filter(t=>!caso[key].includes(t)).map(t=>({t,add:()=>this.setCaso(x=>({[key]:[...x[key],t]}))}))});
    const arqInfo=RR.arquetipos.find(a=>a.n===c.arq);
    const oriO = null; /* origem removida da ficha */
    const invAll=invList(era); const extras=invAll.reduce((a,k)=>a+Math.max(0,(c.inv[k]??0)),0); const POOL=30; const GVL=RR.gerais.map(k=>{const on=c.esp.includes(k); return {k,n:hn(era,k),desc:((RR.habDesc||{})[k]||''),on,off:!on,free:!on&&c.esp.length<3,locked:!on&&c.esp.length>=3,label:hn(era,k)+(on?' (+1)':''),toggle:()=>this.setChar(x=>({esp:on?x.esp.filter(y=>y!==k):(x.esp.length>=3?x.esp:[...x.esp,k])}))};}); const IVL=invAll.map(k=>{ const bon=this.invBonus(c)[k]||0, v=(c.inv[k]??0)+bon, tot=Math.max(0,v-1), left=this.invRes(c,k); return {k,n:hn(era,k),desc:((RR.habDesc||{})[k]||''),v,bon,hasBon:bon>0,bonTxt:'+'+bon+' do Benefício (não sai dos 8 pontos)',pips:tot>0?'●'.repeat(left)+'○'.repeat(tot-left):'',pipsShow:tot>0?'●'.repeat(left)+'○'.repeat(tot-left):'',pipsTitle:tot>0?('Reserva: '+left+' de '+tot+' neste caso'):(v===0?'Sem graduação: a pista central custa 1 Ímpeto':'Nível 1: pistas centrais garantidas, sem reserva'),hasPips:tot>0,zero:v===0,inc:()=>{ if(extras>=POOL||(c.inv[k]??0)>=3) return; this.setChar(x=>({inv:{...x.inv,[k]:(x.inv[k]??0)+1}})); },dec:()=>this.setChar(x=>({inv:{...x.inv,[k]:Math.max(0,(x.inv[k]??0)-1)}}))}; });
    const q=norm(s.npcQ);
    const npcFiltered=npcs.filter(n=>(!s.npcReg || (s.npcReg==='__cena'?d.naCena.includes(n.id): s.npcReg==='__meus'?n.custom: n.r===s.npcReg)) && (!q || norm(n.n+' '+n.p).includes(q)));
    const armas=RR.armas.map(([l,m],i)=>({i:String(i),label:l+' · 1d6'+(m?sign(m):'')}));
    const choques=RR.choques.map(([l,p],i)=>({i:String(i),label:l+' · perda '+p}));
    const setDice=(title,big,detail)=>this.setState({diceRes:{title,big:String(big),detail,logged:false,nar:title+': '+detail}});
    const tabelas0 = (era==='1934'||era==='1946')
      ? [{label:'Cicatriz · d8',go:()=>{const r=rnd(8); setDice('Cicatriz (ao ficar por um fio)',RR.cicatrizes[r-1],'d8 = '+r);}},{label:'Perseguição a pé · trecho d8',go:()=>{const t=['Rua cheia · Fôlego e Resistência 4','Varais e lençóis · Fôlego e Resistência 3','Escadaria · Fôlego e Resistência 5 subindo, 4 descendo','Mercado molhado · Fôlego e Resistência 4','Telhados · Fôlego e Resistência 5 para pular','Escada de incêndio · Fôlego e Resistência 4','Porão ou túnel · Furtividade 4','Beco sem saída · escalar (Fôlego e Resistência 5) ou lutar']; const r=rnd(8); setDice('Trecho da perseguição',r,t[r-1]);}},{label:'Barulho · 1 em 6',go:()=>{const r=rnd(6); setDice('A polícia chega?',r===1?'Sirenes':'Ainda não','d6 = '+r+' (a chance cresce a cada rodada de tiros)');}}]
      : [{label:'A Viúva · 3º round',go:()=>{const r=rnd(6); setDice('A Viúva entra?',r===6?'Ela entra':r===5?'Só se houver tira corrupto':'Não','d6 = '+r+' · 6 entra; 5 também, se houver policial corrupto na cena');}},{label:'Terreno · perseguição d6',go:()=>{const r=rnd(6); setDice('Terreno do round',r,RR.terreno[r-1]);}},{label:'Capangas fogem? d6',go:()=>{const r=rnd(6); setDice('Moral dos capangas',r<=3?'Fogem':'Ficam','d6 = '+r+' · 1–3 fogem');}}];
    const tabelas = (has('viuva')||era==='1934'||era==='1946') ? tabelas0 : tabelas0.filter(t=>!/Viúva/.test(t.label));
    const firmes=caso.fios.filter(f=>f.st==='firme').length, soltos=caso.fios.filter(f=>f.st==='solto').length, cortados=caso.fios.filter(f=>f.st==='cortado').length;
    const idade = c.anoNasc && /^\d{4}$/.test(String(c.anoNasc).trim()) ? (+era - +c.anoNasc) : null;
    const saltoOpts = ERAS.filter(e=>+e>+era).map(e=>({e,label:e+' · '+R()[e].sub}));
    const saltoSel = saltoOpts.some(o=>o.e===s.saltoEra) ? s.saltoEra : (saltoOpts[0]||{}).e;
    const showYear = y => s.futuro || +y <= +era;
    const splitLines = t => t.split('\n').map(l=>{const i=l.indexOf(':'); return i>0&&i<44?{h:l.slice(0,i),b:l.slice(i+1).trim()}:{h:'',b:l};});
    const pulp=has('adr'), med=RR.medidor.n, cod=has('codigo');
    const nivTxt=[...RR.medidor.niveis].sort((a,b)=>b[0]-a[0]).map(([t,n],i,arr)=>n+' '+(t===0?'0':(i===0?t+'–10':t+'–'+(arr[i-1][0]-1)))).join(' · ');
    const R_=(k,t)=>({k,t});
    const refView=[
      {n:'0',h:'Trilha, ofício e papel',items:[
        R_('Trilha','De onde vem o seu poder, e por qual trilha você segue. Em 1934: Pena (o que você sabe), Distintivo (quem o respalda) e Navalha (a rua e o próprio corpo). Em 1994 elas trocam de roupa: Papo, Terno e Cano.'),
        R_('Ofício','O trabalho do personagem. Doze em 1934, nove em 1994, cada um com uma trilha natural. O ofício sugere habilidades e dá o kit de equipamento.'),
        R_('Benefício e Desvantagem','Trilha × Ofício dá 36 pares em 1934 e 27 em 1994, e cada par traz um Benefício (+1 numa habilidade investigativa, que soma sozinho na ficha sem sair dos 30 pontos, e um efeito de regra uma vez por caso: +2 num teste, cura, Sangue-Frio, Peso de prova, benefício grátis ou Problema anulado) e uma Desvantagem (um custo de regra que o narrador aplica uma vez por caso: um Problema, 1 de Integridade, um choque de 3, 2 de Vitalidade, −1 nos testes de uma cena, uma prova a menos ou o Benefício desligado; muitas deixam você escolher entre dois custos). Valem para qualquer era.'),
        R_('Papel','É seu: duas palavras que dizem quem o personagem é nesse cruzamento. Herdeiro pela trilha do Distintivo: Sucessor Nomeado. Veterano pela trilha da Navalha: Combatente Desgarrado. A regra do nome: um sinônimo do ofício mais um adjetivo da trilha. O papel dá lore ao personagem e o narrador o usa na cena; ele não muda as regras.'),
        R_('Ofícios de 1994','Nove ofícios de uma palavra, tirados do cinema pulp: Fiador, Balconista e Faxineiro (Papo); Matador, Infiltrado e Aeromoça (Terno); Boxeador, Assaltante e Traficante (Cano). Cada ofício vale nas três trilhas, com Benefício e Desvantagem próprios. Quem salta de 1934 leva o papel e troca de ofício.')]},
      {n:'1',h:'Como uma cena anda',items:[
        R_('Você','Diz o que faz ou o que fala. Pode falar direto com um Personagem do Diretor que está em cena.'),
        R_('Investigar','Nunca rola dado. Se você procura no lugar certo com uma habilidade coerente, a pista central chega e vai para o caderno, na aba Caso.'),
        R_('Arriscar','Quando o resultado é incerto e o fracasso deixa a história mais interessante, o narrador para e aparece um botão de teste.'),
        R_('Problema ativo','Todo Problema no caderno pesa duas vezes: dá −1 nos testes em que atrapalha (um Problema por teste; o botão de rolar mostra qual) e conta contra você no clímax. Para tirá-lo do caderno, clique em resolver: gaste uma cena lidando com ele, ou pague 1 de reserva de uma habilidade investigativa coerente.')]},
      {n:'2',h:'O teste · 1d6 + modificadores',items:[
        R_('1–2 Revés','A ação falha ou sai cara. Você ganha um Problema.'),
        R_('3–4 Empate','Consegue, com um custo ou uma complicação.'),
        R_('5+ Avanço','Consegue. Numa cena importante, ganha uma Vantagem.'),
        R_('Modificadores','+1 se a habilidade é uma das suas três especialidades. −1 se está Ferido (Vitalidade 0 ou menos). −1 se está Abalado (Sangue-Frio 0 ou menos).'),
        R_('Depois do dado','Num Empate, gaste 1 Ímpeto para virar Avanço.'+(pulp?' Gaste 1 de Adrenalina para somar +2 ao total.':'')+' Ou aceite o resultado.')]},
      {n:'3',h:'Choque de Sangue-Frio',items:[
        R_('Quando','O narrador pede um choque de horror (o que você vê) ou de culpa (o que você faz). O número é a perda.'),
        R_('Como','1d6 contra 4, +1 se Sangue-Frio é uma especialidade.'+(pulp?'':' Se já está Abalado, contra 5.')),
        R_('Resultado',pulp?'Passou: perde metade. Falhou: perde tudo.':'Passou: não perde nada. Falhou: perde o valor do choque.')]
        .concat(pulp||cod?[]:[R_('Culpa',`Com ${med} 8 ou mais, contra 5: você ainda se importa. Com ${med} 3 ou menos, contra 3: já se acostumou.`)])
        .concat([R_('Exemplos','Briga violenta 2 · cadáver fresco 3 · criança morta 5 · ver alguém que você ama morrer 7.')])},
      {n:'4',h:'Ímpetos e reservas',items:[
        R_('Ímpetos','Todo investigador começa com 1, máximo 3. Não voltam sozinhos a cada caso: só se recuperam agindo pela motivação contra o próprio interesse.'),
        R_('Gaste 1 para','Virar um Empate em Avanço · pagar um benefício quando a habilidade não tem reserva'+(has('mural')?' · verificar um Fio no Mural':'')+'.'),
        R_('Recupere 1 ao','Agir '+(cod?'pelas regras do Código':'pela motivação')+' contra o próprio interesse: você precisa de dinheiro, mas uma questão de justiça o obriga a recusar. É a única forma de recuperar Ímpeto; aceitar um Problema ou uma Desvantagem não devolve. O narrador marca.'),
        R_('Reserva','Cada ponto investigativo acima de 1 paga um benefício naquela habilidade, sem gastar Ímpeto. Volta cheia a cada caso. Ferido não paga benefícios.')]},
      {n:'5',h:'Corpo, cabeça e consciência',items:[
        R_('Pontos iniciais','24 pontos para dividir entre Vitalidade, Sangue-Frio e '+med+' (sugestão 8, 8 e 8). O Ímpeto não sai desses pontos: todo investigador começa com 1.'),
        R_('Vitalidade','Vai de 12 a −12. O narrador marca o dano. 0 a −5 Ferido · −6 a −11 Grave: não luta · −12 morto.'),
        R_('Sangue-Frio','Vai de 12 a −12. 0 a −5 Abalado · −6 a −11 Por um fio: ganha uma cicatriz · −12 Perdido: sai de jogo.'),
        R_(med,`Vai de 0 a 10. ${nivTxt}. `+(cod?'Quebrar uma das três regras custa 1 e um choque de 4.':'Jogadas sujas funcionam, custam de 1 a 3 e pedem choque de culpa.')+' Com 2 ou menos, '+(cod?'alguém liga com um pedido que não se recusa.':'você aceita um acordo sujo no epílogo.')),
        R_('Segredo','Algo que o personagem fez ou sabe e que custaria caro. O narrador traz à tona uma vez, no pior momento: choque de Sangue-Frio de 4 e um Problema ligado a ele, mas o personagem ganha +1 Ímpeto. Depois, escreva um segredo novo.'),
        R_('Vício','Três doses por caso, cada uma +2 de Sangue-Frio na hora. A terceira é a recaída e o vício cobra (1d6): 1–2 Ressaca, −1 nos testes da próxima cena; 3 Dívida e 4 Visto, um Problema; 5 Língua solta, algo vaza; 6 Apagão, −1 Ímpeto. Fechar o caso enche a garrafa.')]},
      {n:'6',h:'Provas e clímax',items:[
        R_('Peso','Indício 1 · prova física, documento, testemunho ou laudo 2 · confissão 3. O Peso necessário depende de quem você acusa: ninguém importante 4, alguém com advogado 6, protegido 9, gente do topo 12.'),
        R_('Clímax','Compare Vantagens e Problemas. Mais Vantagens: a verdade vence. Empate: vence pela metade. Mais Problemas: a cidade vence.')]},
      {n:'7',h:'Jogando em grupo',items:[
        R_('Na mesa','O app é solo; o livro também se joga em grupo, com uma pessoa no papel do Diretor. Cada jogador monta a sua ficha com as mesmas regras.'),
        R_('Pistas','Toda habilidade investigativa com nível 1 em alguém do grupo garante a pista central para todos. Habilidade que ninguém tem custa 1 Ímpeto de quem tenta.'),
        R_('Ímpetos','Cada jogador tem os seus. Um jogador pode dar o seu Ímpeto a outro, narrando como ajudou.'),
        R_('Ritmo','O Diretor passa a vez a cada cena: quem não agiu na última cena fala primeiro na próxima.')]},
      {n:'8',h:'Glossário',items:[
        R_('Benefício','O que o seu papel faz sem teste, uma vez por caso, no limite escrito.'),
        R_('Desvantagem','A complicação do seu papel, que o narrador aplica uma vez por caso.'),
        R_('Diretor','Quem narra o mundo: o narrador do app ou a pessoa na mesa.'),
        R_('Especialidade','Uma habilidade geral escolhida na criação: +1 nos testes dela.'),
        R_('Fonte','Pessoa, lugar ou hábito que devolve 2 de Sangue-Frio ao fechar o caso.'),
        R_('Ímpeto','A moeda do investigador: começa em 1, máximo 3.'),
        R_('Limiar de acerto','O número que o atacante precisa tirar para acertar você: 3, ou 4 com especialidade em Fôlego e Resistência.'),
        R_('Ofício · Trilha · Papel','O trabalho, a origem do poder e as duas palavras que dizem quem você é nesse cruzamento.'),
        R_('Pista central','A pista sem a qual o caso não anda. Nunca se rola: chega para quem tem a habilidade certa em 1 ou mais.'),
        R_('Problema · Vantagem','Marcas do caso: o Revés traz um Problema, o Avanço pode trazer uma Vantagem. Problema ativo: −1 nos testes em que atrapalha, até ser resolvido.'),
        R_('Reserva','Os pontos de uma investigativa acima de 1. Cada um paga um benefício extra e volta cheio no próximo caso.'),
        R_('Revés · Empate · Avanço','O resultado do 1d6: 1–2 falha com Problema, 3–4 consegue com custo, 5+ consegue.'),
        R_('Segredo','O que você esconde. Vem à tona uma vez: choque de 4, um Problema e +1 Ímpeto.'),
        R_('Vício','A garrafa: três doses por caso de +2 de Sangue-Frio; a terceira é a recaída.')]}];
    const eraItems=[];
    if(has('ficha')) eraItems.push(R_('A Ficha','0 a 6. Sobe quando você é visto com quem a Comissão anota. Em 2, documentos pedidos na rua; em 4, perde o emprego; em 6, intimação na Sala 3.'));
    if(has('medalha')) eraItems.push(R_('A Medalha','Uma vez por caso, +2 num teste social diante de autoridade. Cada uso pede Sangue-Frio contra 4 (falha perde 2). Três usos no caso: um traço de vício.'));
    if(has('mural')) eraItems.push(R_('O Mural','Cada pista vira um Cartão. Ligue dois com um Fio. Verificar custa 1 Ímpeto e o narrador nunca mente: firme ou cortado. Agir sobre Fio solto que era falso: −2 de Sangue-Frio e Ruído +2. Três Fios firmes em triângulo dão uma pista central de graça.'));
    if(has('ruido')) eraItems.push(R_('O Ruído','0 a 10, o quanto a oposição ouviu. Sobe 1 por cena planejando em lugar não varrido, 2 ao agir sobre Fio cortado. O Diretor gasta 2 (chegam antes), 3 (testemunha levada), 4 (Cartão falso) ou 6 (ação direta).'));
    if(has('adr')) eraItems.push(R_('Adrenalina','0 a 3, começa a sessão em 1. Ganha com estilo: fala memorável, manobra arriscada que dá certo, vencer um impasse sem atirar. Gasta: +2 depois do dado, ação extra, flashback.'));
    if(has('imprensa')) eraItems.push(R_('Imprensa','0 a 6. Sobe quando você é filmado, fotografado ou citado. Cheia: você vira procurado.'));
    if(has('viuva')) eraItems.push(R_('A Viúva','No terceiro round de um combate, o narrador rola: com 6 ela entra, mata o mais corrupto e some. Choque 3. Uma vez por sessão.'));
    if(eraItems.length) refView.push({n:'9',h:'Regras desta era',items:eraItems});
    refView.forEach((r,i)=>r.n=String(i+1));
    const regrasView=RR.regras.split('\n').map(l=>{const i=l.indexOf(':'); return i>0&&i<40?{h:l.slice(0,i),b:l.slice(i+1).trim()}:{h:'',b:l};});
    const segredoView = s.showSeg ? caso.segredo : '•••••• (só o narrador sabe)';
    return {
      loading:false,noEra:false,hasEra:true, perfilNome:s.perfil?s.perfil.nome:'', nuvem:s.nuvem||(this.__db?'Salvo na nuvem':'Salvo neste navegador'), doLogout:()=>this.doLogout(), era, eraSub:RR.sub, eraTitulo:RR.titulo, is1934:era==='1934', is1994:is94, is1946:era==='1946', is1974:era==='1974', is1999:false, hasCodigo:has('codigo'), hasMural:has('mural'), hasMedalha:has('medalha'), pjLabel:RR.pj,
      changeEra:()=>this.setState({era:null,diceRes:null},()=>this.save()),
      tabs:TABS.map(([k,label],i)=>({label,num:String(i+1).padStart(2,'0'),active:s.tab===k,inactive:s.tab!==k,sep:k==='elenco',cls:i>=3?'sv-tab-c':'sv-tab-m',go:()=>this.setTab(k)})),
      bgLayers:(()=>{ /* fundo aleatório a cada troca de tela, com fade lento; na Crônica fica bem mais apagado para não disputar com o texto */ const L=[1,2,3,4,5,6,7,8].map(n=>'/fundos/noir'+n+'.jpg'); if(this.__bgTab!==s.tab||this.__bgCur==null){ let k=Math.floor(Math.random()*L.length); if(k===this.__bgCur) k=(k+1+Math.floor(Math.random()*(L.length-1)))%L.length; this.__bgCur=k; this.__bgTab=s.tab; } const op=s.tab==='cronica'?'0.16':'0.34'; return L.map((src,i)=>({src,op:i===this.__bgCur?op:'0',sc:i===this.__bgCur?'1.02':'1.06'})); })(),
      tabBg:({cronica:'/fundos/bar.jpg',caso:'/fundos/mesa.jpg',ficha:'/fundos/perseguicao.jpg',dados:'/fundos/briga.jpg',elenco:'/fundos/silhuetas.jpg',cidade:'/fundos/cais.jpg',seculo:'/fundo-eras.png',tutorial:'/fundos/mesa.jpg'})[s.tab]||'/fundos/cais.jpg',
      tabCronica:(tabIs('cronica')||s.tab==='dados'),tabCaso:tabIs('caso'),tabFicha:tabIs('ficha'),tabDados:false,tabElenco:tabIs('elenco'),tabCidade:tabIs('cidade'),tabSeculo:tabIs('seculo'),tabTutorial:tabIs('tutorial'),
      goFicha:()=>this.setTab('ficha'), goCaso:()=>this.setTab('caso'),
      // crônica
      logRef:this.logRef, logMaxH:(d.log.some(e=>e.k==='narr'||e.k==='npc'||e.k==='rule')||s.busy)?'64vh':'none', logOverflow:(d.log.some(e=>e.k==='narr'||e.k==='npc'||e.k==='rule')||s.busy)?'auto':'visible',logView: d.log.some(e=>e.k==='narr'||e.k==='npc'||e.k==='rule') ? logView : logView.filter(e=>!e.isMech), ...(()=>{ const fichaOk=!!((c.nome||'').trim()&&arqInfo), casoOk=!!(caso.titulo||'').trim(), cenaOk=d.log.some(e=>e.k==='narr'); const G=[[fichaOk,'Monte a ficha.','Nome, ofício e trilha bastam para começar.'],[casoOk,'Abra um caso.','Escolha um do livro ou deixe o narrador sortear.'],[cenaOk,'Jogue a primeira cena.','Escreva o que você faz e envie.']]; return {guiaShow:!(fichaOk&&casoOk&&cenaOk), guia:G.map(([ok,t,dd],i)=>({ok:ok?'true':'false',n:ok?'✓':String(i+1),t,d:dd}))}; })(), logEmpty:!d.log.some(e=>e.k==='narr'||e.k==='npc'||e.k==='rule')&&!s.busy, busy:s.busy,
      ...(()=>{ const AB={
          '1934':{k:'Saint Village apresenta',t:'Três da Manhã',sub:'no Café Palermo',l:'A chuva escorre pela escadaria do Fórum.',r:'MCMXXXIV'},
          '1994':{k:'Três e dez da manhã',t:'Palermo 24h',sub:'',l:'A única luz acesa na Rua Clay.',r:'MCMXCIV'}}[era]||{k:'',t:'',sub:'',l:'',r:''};
        const ct=(caso.titulo||'').trim(), cp=(caso.premissa||'').trim(), CP=CAMPANHA[era]||{t:AB.t,b:AB.l}, nCaso=(d.casosN||0)+1;
        const short=x=>x.length>150?x.slice(0,147).replace(/\s+\S*$/,'')+'…':x;
        if(ct) return {abCta:'O caso está aberto. Diga o que você faz, ou peça ao narrador a primeira cena.', abKicker:'Saint Village '+era+' · '+CP.t, abTitulo:ct, abSub:'', abHasSub:false, abLinha:cp?short(cp):(d.cena?'Cena: '+d.cena:CP.b), abCopy:`Caso nº ${nCaso} · ${AB.r}`};
        return {abCta:'Monte a ficha, escolha um caso na aba Caso ou deixe o narrador sortear um gancho do livro.', abKicker:'', abTitulo:CP.t, abSub:'', abHasSub:false, abLinha:CP.b, abCopy:(nCaso>1?`${nCaso-1} caso${nCaso>2?'s':''} fechado${nCaso>2?'s':''} · `:'')+`${AB.r} · Saint Village XX Century`}; })(),
      emptyLine: ({'1934':'Três da manhã no Café Palermo. A chuva escorre pela escadaria do Fórum.','1994':'Três e dez da manhã. O Palermo 24h é a única luz acesa na Clay.'})[era],
      openCase:()=>this.openCase(),
      askContinue:()=>this.narrate('Continue a cena: avance a situação um passo, com uma complicação ou um detalhe novo, sem agir pelo personagem.'),
      askClue:()=>{ this.setTab('cronica'); this.narrate('O jogador pede uma pista ou um gancho. Se o personagem estiver investigando algo, entregue a próxima pista central de forma concreta (marque com [PISTA: ...]); se não, apresente um gancho do livro ligado à região atual ou a uma facção, e mostre quem o traz.'); },
      askSummary:()=>this.narrate('Resuma a crônica até agora como um relatório datilografado: fatos, pistas, provas, Personagens do Diretor e pendências. Sem marcações.'),
      clearLog:()=>{ if(this.conf2('clearLog','Arquivar a crônica desta era? A ficha e o caso ficam.')) this.upd(e=>({...e,log:[]})); },
      modes:[['acao','Ação'],['fala','Fala'],['duvida','Perguntar ao Diretor']].map(([k,label])=>({label,active:s.mode===k,inactive:s.mode!==k,go:()=>this.setState({mode:k})})),
      modeFala:s.mode==='fala', talkTo:s.talkTo, onTalkTo:ev=>this.setState({talkTo:ev.target.value}),
      talkOptions:[...d.naCena.map(id=>this.npcById(id)).filter(Boolean), ...npcs.filter(n=>!d.naCena.includes(n.id))].map(n=>({id:n.id,nome:n.n+(d.naCena.includes(n.id)?' · em cena':'')})),
      draft:s.draft, onDraft:ev=>this.setState({draft:ev.target.value}),
      onDraftKey:ev=>{ if(ev.key==='Enter'&&!ev.shiftKey){ ev.preventDefault(); send(); } },
      sendLabel:s.busy?'Aguarde…':'Enviar', draftPh:s.mode==='fala'?'O que você diz?':s.mode==='duvida'?'O que você quer saber?':'O que você faz?', send,
      cena:d.cena, onCena:ev=>{ const v=ev.target.value; this.upd(e=>({...e,cena:v})); },
      regionOptions:regioes.map(r=>({nome:r.nome})), hasCenaMeta:!!cenaR, cenaMeta:cenaR?metaOf(cenaR):'',
      naCenaView:d.naCena.map(id=>this.npcById(id)).filter(Boolean).map(n=>({nome:n.n,remove:()=>this.upd(e=>({...e,naCena:e.naCena.filter(x=>x!==n.id)}))})),
      naCenaEmpty:d.naCena.length===0,
      fichaTitle:c.nome||('Novo '+RR.pj), tracks,
      vantN:V, probN:P, vantView:caso.vant.map(t=>({t})), probView:caso.prob.map(t=>({t,resolver:()=>{ if(s.busy) return; this.setTab('cronica'); setTimeout(()=>this.narrate(`O jogador quer resolver agora o Problema “${t}”. Pergunte em uma frase como ele lida com isso e ofereça os dois caminhos da regra: (a) gastar esta cena lidando com o Problema; (b) pagar 1 de reserva de uma habilidade investigativa coerente, marcando [BENEFICIO: Habilidade] para o pagamento. Se a ação proposta for incerta, peça um [TESTE: ...]. Quando o Problema estiver resolvido na ficção, marque [-PROBLEMA: ${t}].`),40); }})), ...(()=>{ const st=[
          {n:1,label:'Monte a ficha',done:!!(c.nome||'').trim(),go:()=>this.setTab('ficha')},
          {n:2,label:'Abra um caso',done:!!((caso.premissa||'').trim()||(caso.titulo||'').trim()),go:()=>this.setTab('caso')},
          {n:3,label:'Jogue a primeira cena',done:d.log.some(e=>e.k==='narr'),go:()=>this.setTab('cronica')},
          {n:4,label:'Role um dado',done:!!s.lastRolls||d.log.some(e=>e.k==='mech'),go:()=>this.setTab('dados')}].map(x=>({...x,todo:!x.done}));
        return {guideSteps:st, guideShow:!s.guideOff && st.some(x=>!x.done), guideClose:()=>{ try{ localStorage.setItem('sv-guide-off','1'); }catch(e){} this.setState({guideOff:true}); }}; })(),
      pistasN:caso.pistas.length, pistasVazias:!caso.pistas.length, provasVazias:!caso.provas.length, pesoTotal, caso,
      // caso
      geradorTitulo: is94?'Arquivo · gancho do livro':era==='1934'?'Dossiê · gerador de casos (1d8 × 6)':'Dossiê · gerador de casos do século (1d6 × 5) e o toque da era', geradorBtn: is94?'Sortear gancho de uma região':era==='1934'?'Rolar o gerador de casos':'Rolar o gerador do século',
      c_titulo:ev=>this.setCaso({titulo:ev.target.value}), c_premissa:ev=>this.setCaso({premissa:ev.target.value}), c_nec:ev=>this.setCaso({nec:parseInt(ev.target.value)}),
      rollGerador:()=>this.rollGerador(), hasSegredo:!!caso.segredo, segredoView, segredoBtn:s.showSeg?'Esconder':'Espiar (estraga o mistério)', toggleSegredo:()=>this.setState({showSeg:!s.showSeg}),
      newCase:()=>{ if(this.conf2('newCase','Fechar o caso? Pistas, provas, Vantagens e Problemas zeram; reservas e vício recomeçam.')){ this.setCaso(blankCaso()); this.setChar(has('ruido')?{invGasto:{},vicioTr:0,ruido:Math.max(0,(RR.arquetipos.find(a=>a.n===c.arq)||{}).ruido||0)}:{invGasto:{},vicioTr:0}); this.upd(e=>({...e,casosN:(e.casosN||0)+1})); { const F=fontesOf(c).filter(f=>f.t&&!f.perdida), teto=c.sfIni??8, ganho=Math.max(0,Math.min(F.length*2,teto-c.sf)); if(ganho>0) this.setChar({sf:c.sf+ganho}); this.addLog({k:'mech',who:'Fontes de Sangue-Frio',text:F.length?`${F.map(f=>f.t).join(', ')}: +${ganho} de Sangue-Frio (agora ${c.sf+ganho}, teto ${teto}).`:'Nenhuma Fonte de pé: o Sangue-Frio não volta entre os casos.'}); } } },
      pistasView:caso.pistas.map((p,i)=>({n:i+1,t:p.t,del:()=>this.setCaso(x=>({pistas:x.pistas.filter(y=>y.id!==p.id)}))})),
      pistaDraft:s.pistaDraft, onPistaDraft:ev=>this.setState({pistaDraft:ev.target.value}),
      addPista:()=>{ const t=s.pistaDraft.trim(); if(!t) return; this.setCaso(x=>({pistas:[...x.pistas,{id:uid(),t}]})); this.setState({pistaDraft:''}); },
      provasView:caso.provas.map(p=>({...p,del:()=>this.setCaso(x=>({provas:x.provas.filter(y=>y.id!==p.id)}))})),
      pesoPct:Math.min(100,Math.round(pesoTotal/caso.nec*100))+'%',
      provaDraft:s.provaDraft, onProvaDraft:ev=>this.setState({provaDraft:ev.target.value}), provaPeso:s.provaPeso, onProvaPeso:ev=>this.setState({provaPeso:ev.target.value}),
      addProva:()=>{ const t=s.provaDraft.trim(); if(!t) return; this.setCaso(x=>({provas:[...x.provas,{id:uid(),t,peso:parseInt(s.provaPeso)}]})); this.setState({provaDraft:''}); },
      vpBlocks:[vpBlock('Vantagens','vant',R().comum.vantagens),vpBlock('Problemas','prob',R().comum.problemas)], climax:climaxFull,
      // ficha
      char:c, poolNum:String((c.saude||0)+(c.sf||0)+(c.med||0)), poolTxt:'Divida 24 entre Vitalidade, Sangue-Frio e '+RR.medidor.n+'. Todo investigador começa com 1 Ímpeto.', ...(()=>{ const ofOf=a=>a.ocup||a.linhagem||a.n; const of=arqInfo?ofOf(arqInfo):(c.oficio||''), tr=arqInfo?arqInfo.grupo:(c.porta||''), KD=KIT_DA[era]||[], K=KD[0]&&KD[0][of], ti=KD[1]&&KD[1][tr], LB=KD[2]||{}; const mot=has('lado')?c.lado:c.mot; if(!K||ti==null) return {hasKit:false,noKit:true}; const rows=[{l:'Kit do ofício',t:K[0]},{l:'Arma',t:K[1][ti]},{l:'Veículo à disposição',t:K[2][ti]},{l:'QG',t:K[3][ti]}].concat(LB[mot]?[{l:'Lembrança',t:LB[mot]}]:[]); const txt=rows.map(x=>x.l+': '+x.t).join('\n'); const auto=(c.equipAuto||''); if((!(c.equip||'').trim()||c.equip===auto)&&c.equip!==txt){ clearTimeout(this.__kitT); this.__kitT=setTimeout(()=>this.setChar({equip:txt,equipAuto:txt}),0); } return {hasKit:true,noKit:false,kitRows:rows,kitTitulo:of+' · '+tr+(mot?' · '+mot:''),kitApply:()=>this.setChar(x=>({equip:(x.equip&&x.equip.trim()&&!x.equip.includes(K[0]))?(x.equip.trim()+'\n'+txt):txt}))}; })(), limiar:(c.esp||[]).includes('Fôlego e Resistência')?4:3, limiarTxt:(c.esp||[]).includes('Fôlego e Resistência')?'Com especialidade em Fôlego e Resistência. O atacante precisa tirar isso ou mais.':'O atacante precisa tirar isso ou mais. Sobe para 4 com especialidade em Fôlego e Resistência.', poolSug:'8 · 8 · 8', poolApply:()=>this.setChar({saude:8,sf:8,med:8,imp:1,sfIni:8}), prontos:RR.prontos.map((p,i)=>({i:String(i),nome:p.nome,arq:p.arq})),
      loadPronto:ev=>{ const p=RR.prontos[parseInt(ev.target.value)]; if(!p) return; const base=blankChar(era); Object.entries(p.inv).forEach(([k,v])=>{ if(k in base.inv) base.inv[k]=clamp(v,0,3); });
        const arq=RR.arquetipos.find(a=>a.n===p.arq)||{};
        this.setChar({...base,nome:p.nome,sfIni:p.sf||8,arq:p.arq,papel:p.papel||nomePapelDe(era,p.arq),porta:arq.grupo||'',oficio:arq.ocup||arq.linhagem||arq.n||'',equipAuto:'',ori:p.ori,mot:p.mot||({Contrato:'Dinheiro',Cruzada:'Justiça'})[p.lado]||'',lado:p.lado||'Contrato',conceito:p.conceito,esp:p.esp,vicio:p.vicio,fontes:p.fontes||'',segredo:p.segredo,equip:p.equip,regras:p.regras||'',med:p.codigo||arq.integ||7,adr:1,sf:p.sf||8,medalha:p.medalha||'',ficha:arq.ficha!=null?arq.ficha:0,ruido:arq.ruido>0?arq.ruido:0,fontes:p.fontes||'',...(p.heranca||{})}); },
      f_nome:field('nome'), f_conceito:field('conceito'), f_regras:field('regras'), f_fontes:field('fontes'), f_vicio:field('vicio'), f_segredo:field('segredo'), f_equip:field('equip'), f_notas:field('notas'),
      ...(()=>{ const ofOf=a=>a.ocup||a.linhagem||a.n; const GR=trilhasDe(era);
        const OFI=[...new Set(RR.arquetipos.filter(a=>!a.vertente&&!a.epoca).map(a=>a.n))];
        const porta=arqInfo?arqInfo.grupo:(c.porta||''); const oficio=arqInfo?ofOf(arqInfo):(c.oficio||'');
        const matches=(po,of)=>(po&&of)?RR.arquetipos.filter(a=>a.grupo===po&&ofOf(a)===of):[];
        const setArq=(a,extra)=>{ const q={...extra,arq:a?a.n:'',porta:a?a.grupo:(extra&&extra.porta)||'',oficio:a?ofOf(a):(extra&&extra.oficio)||''}; if(a){ if(a.integ) q.med=a.integ; if(a.ficha!=null) q.ficha=a.ficha; if(a.ruido>0) q.ruido=a.ruido; } this.setChar(q); };
        const pick=(po,of)=>{ const ms=matches(po,of).slice().sort((x,y)=>(x.epoca?1:0)-(y.epoca?1:0)); const keep=ms.find(a=>a.n===c.arq); setArq(keep||ms[0]||null,{porta:po,oficio:of}); };
        const SUG={"Pena|Advogado": [["Defensor dos Desvalidos", "cita jurisprudência de graça para quem não tem nada"], ["Consigliere de Gravata", "redige os contratos da família e lê as entrelinhas"], ["Jurista Caído", "já usou toga; quer de volta o que lhe tiraram"], ["Rato de Cartório", "lê escritura velha como quem lê romance policial"]], "Pena|Médico": [["Médico dos Pobres", "atende de graça na Calle del Hospital; o corpo nunca mente"], ["Doutor da Sociedade", "receita discrição para gente rica"], ["Cirurgião Cassado", "perdeu a licença numa mesa de operação e quer provar que não foi culpa"], ["Patologista Insone", "conversa com os mortos às três da manhã"]], "Pena|Jornalista": [["Cronista da Verdade", "escreve a matéria que ninguém quer publicar"], ["Colunista de Fofocas", "vende segredos de White Hills a centavo a linha"], ["Repórter Desonrado", "inventou uma fonte uma vez; agora precisa de uma verdade enorme"], ["Repórter de Arquivo", "vive no arquivo morto da Gazeta, entre recortes amarelados"]], "Pena|Herdeiro": [["Mecenas Justiceiro", "paga com a fortuna da família o que a polícia não faz"], ["Herdeiro Colecionador", "compra arte, compra silêncio, compra gente"], ["Primogênito Envergonhado", "quer limpar o nome que o pai sujou"], ["Diletante do Crime", "trata o mistério como o hobby mais caro da cidade"]], "Pena|Detetive": [["Detetive de Poltrona", "resolve o caso sem sair do escritório"], ["Consultor Particular", "cobra por hora e por dedução"], ["Detetive Obcecado", "tem um caso antigo que nunca fechou"], ["Decifrador de Enigmas", "não resiste a um quebra-cabeça"]], "Pena|Tira": [["Perito da Polícia Técnica", "a prova fala, ele escuta"], ["Escrivão de Confiança", "sabe o que entra e o que some do inquérito"], ["Inspetor Rebaixado", "mandado para o arquivo por acertar demais"], ["Datiloscopista", "para ele, uma impressão digital é uma assinatura"]], "Pena|Auditor": [["Contador Forense", "segue o dinheiro até a cova"], ["Guarda-livros da Família", "sabe onde cada centavo dorme"], ["Atuário Arrependido", "calculou a morte de um homem, e ela aconteceu"], ["Caçador de Fraudes", "vê um zero fora do lugar a dez metros"]], "Pena|Artista": [["Dramaturgo Engajado", "põe no palco o escândalo que o jornal abafou"], ["Pianista da Máfia", "toca no salão e escuta a mesa ao lado"], ["Compositor Esquecido", "roubaram sua música; quer o nome de volta"], ["Poeta da Madrugada", "coleciona histórias de bar para o próximo livro"]], "Pena|Pugilista": [["Treinador da Academia", "tira garoto da rua pelo ringue"], ["Empresário de Lutadores", "sabe quem cai em que assalto"], ["Campeão que Entregou", "vendeu a luta de 29 e nunca mais dormiu direito"], ["Estrategista de Ringue", "estuda o adversário como quem joga xadrez"]], "Pena|Veterano": [["Oficial de Inteligência", "a guerra acabou, o hábito de espionar não"], ["Intendente do Mercado Negro", "desviou suprimentos na guerra; agora desvia na paz"], ["Sobrevivente das Trincheiras", "deve a vida aos que não voltaram"], ["Criptógrafo de Guerra", "lê código em qualquer papel"]], "Pena|Contrabandista": [["Guarda-livros Delator", "guarda os livros-caixa do rum para o dia do julgamento"], ["Contador do Rum", "faz a contabilidade da Lei Seca"], ["Cartógrafo das Rotas", "desenhou as rotas do contrabando e agora quer apagá-las"], ["Colecionador de Enseadas", "conhece cada praia escondida da costa pelo nome"]], "Pena|Vigarista": [["Falsário dos Esquecidos", "falsifica papéis para quem a lei abandonou"], ["Gravador de Notas", "imprime dinheiro no porão"], ["Falsário Arrependido", "uma assinatura falsa mandou um inocente à forca"], ["Mestre dos Disfarces", "prefere ser outra pessoa"]], "Distintivo|Advogado": [["Promotor Incorruptível", "não aceita envelope"], ["Advogado do Sindicato", "defende quem paga a mensalidade"], ["Promotor em Desgraça", "um júri comprado; ele quer o comprador"], ["Assistente da Promotoria", "lê cada depoimento duas vezes"]], "Distintivo|Médico": [["Legista da Polícia", "assina o laudo que não se vende"], ["Médico do Clube", "trata os ferimentos de quem paga a anuidade"], ["Médico da Penitenciária", "viu demais em Black Rock"], ["Plantonista do Pronto-Socorro", "a madrugada traz todos os mistérios"]], "Distintivo|Jornalista": [["Setorista de Polícia", "tem mesa na sala de imprensa da Central"], ["Assessor do Prefeito", "escreve o que o prefeito quer ler"], ["Editor Rebaixado", "derrubado por uma manchete; quer a próxima"], ["Correspondente Credenciado", "entra onde o público não entra"]], "Distintivo|Herdeiro": [["Filantropo do Conselho", "usa a cadeira para limpar a cidade"], ["Herdeiro no Conselho", "vota com quem garante os dividendos"], ["Filho Pródigo", "volta para casa querendo consertar o que quebrou"], ["Patrono das Artes", "frequenta todas as estreias e todos os segredos"]], "Distintivo|Detetive": [["Detetive Licenciado", "licença na parede, uísque na gaveta"], ["Agente da Agência de Detetives", "terno, relatório e cliente corporativo"], ["Ex-Tira Particular", "saiu da polícia; a polícia não saiu dele"], ["Detetive de Hotel", "cada quarto é uma história"]], "Distintivo|Tira": [["Sargento Honesto", "o último que não está na folha"], ["Tira de Ronda", "conhece cada dono de bar pelo nome"], ["Detetive da Corregedoria", "caça tiras como os tiras caçam bandidos"], ["Patrulheiro Novato", "tudo na cidade ainda é novo e estranho"]], "Distintivo|Auditor": [["Inspetor de Sinistros", "a apólice não paga mentira"], ["Agente da Seguradora", "fecha o caso pelo menor preço"], ["Inspetor Implacável", "nunca esqueceu o golpe que lhe custou o emprego"], ["Investigador de Seguros", "viúva bonita, apólice dobrada"]], "Distintivo|Artista": [["Estrela do Rádio", "a voz que a cidade escuta às onze da noite"], ["Cantora do Clube", "contrato com o dono, segredos dos clientes"], ["Estrela Decadente", "já teve o nome no letreiro e quer de volta"], ["Crooner Romântico", "canta para uma mulher só, na plateia"]], "Distintivo|Pugilista": [["Campeão do Povo", "o bairro inteiro aposta nele"], ["Guarda-costas", "braço direito de quem paga"], ["Campeão Caído", "perdeu o cinturão e o respeito no mesmo assalto"], ["Galã dos Ringues", "foto na revista, fã na porta do vestiário"]], "Distintivo|Veterano": [["Herói Condecorado", "medalha no peito, cidade nas costas"], ["Oficial da Reserva", "presta serviço a quem tem patente"], ["Veterano Desiludido", "voltou para uma cidade que esqueceu dele"], ["Instrutor do Quartel", "ensina, observa, lembra"]], "Distintivo|Contrabandista": [["Fiscal da Alfândega", "o carimbo que não se compra"], ["Despachante do Cais", "o carimbo que se compra"], ["Agente Duplo do Porto", "trabalhou para os dois lados, e um deles quer acerto"], ["Inspetor de Cargas", "abre as caixas que ninguém abre"]], "Distintivo|Vigarista": [["Golpista dos Ricos", "rouba de quem rouba"], ["Golpista de Terno", "sorriso, cartão de visita e aperto de mão"], ["Corretor Falido", "perdeu tudo na Quebra e quer de volta de quem causou"], ["Conde de Mentira", "título falso, charme verdadeiro"]], "Navalha|Advogado": [["Defensor do Beco", "defende quem a cidade já condenou"], ["Rábula de Porta de Cadeia", "fiança na hora, honorário em dobro"], ["Advogado Expulso da Ordem", "sem carteira, com rancor"], ["Advogado de Botequim", "escritório na mesa do fundo"]], "Navalha|Médico": [["Médico de Beco", "costura ferido sem perguntar o nome"], ["Cirurgião da Máfia", "tira bala com a porta trancada"], ["Médico Viciado", "quer largar a morfina e a dívida"], ["Curandeiro de Chinatown", "ervas, agulhas e silêncio"]], "Navalha|Jornalista": [["Fotógrafo de Crime", "chega antes da ambulância"], ["Caçador de Flagrantes", "vende a foto para quem pagar mais"], ["Repórter Queimado", "nenhum jornal o contrata, mas ele tem uma história"], ["Fotógrafo da Madrugada", "a cidade às três da manhã é a única que interessa"]], "Navalha|Herdeiro": [["Herdeiro Deserdado", "trocou a mansão pela rua por uma questão de princípio"], ["Playboy Falido", "vive de fiado e de sobrenome"], ["Ovelha Negra", "voltou para cobrar a família"], ["Herdeiro Fugido", "fugiu de casa por amor, e o amor sumiu"]], "Navalha|Detetive": [["Detetive de Calçada", "o escritório é a rua"], ["Bisbilhoteiro de Aluguel", "flagra marido infiel por cinco dólares"], ["Detetive Cassado", "perdeu a licença, não a teimosia"], ["Caçador de Desaparecidos", "encontra quem não quer ser encontrado"]], "Navalha|Tira": [["Tira Infiltrado", "vive entre eles para derrubá-los"], ["Tira na Folha", "recebe dos Moretti toda primeira sexta-feira"], ["Tira Expulso", "distintivo arrancado, arma ainda no coldre"], ["Tira à Paisana", "ninguém sabe que é polícia, às vezes nem ele"]], "Navalha|Auditor": [["Recuperador de Bens", "busca o que roubaram dos pequenos"], ["Cobrador da Companhia", "a dívida chega antes da conta"], ["Caçador de Caloteiros", "um calote arruinou a sua vida"], ["Agiota de Esquina", "sabe quanto cada um deve, e por quê"]], "Navalha|Artista": [["Cantora de Porão", "canta o que a rua sente"], ["Dançarina de Salão", "dez centavos a dança, um segredo a mais"], ["Estrela Arruinada", "quer de volta o que a cidade tirou"], ["Artista de Rua", "vê tudo de cima de um caixote"]], "Navalha|Pugilista": [["Lutador do Bairro", "defende o quarteirão com os punhos"], ["Lutador de Porão", "luta clandestina, aposta alta"], ["Ex-Campeão Arruinado", "caiu no sexto assalto porque mandaram"], ["Brigão do Cais", "briga por esporte, por uma dama, por nada"]], "Navalha|Veterano": [["Sargento Reformado", "ainda protege os seus homens"], ["Soldado de Aluguel", "a guerra ensinou um ofício"], ["Desertor Arrependido", "fugiu uma vez e não vai fugir de novo"], ["Franco-atirador Solitário", "observa tudo pela mira"]], "Navalha|Contrabandista": [["Capitão de Lancha Honrado", "leva rum, nunca gente nem pó"], ["Capitão da Corrida do Rum", "a lancha mais rápida da baía, a quem pagar"], ["Contrabandista Arrependido", "largou as lanchas e carrega o que viu"], ["Rato do Cais", "conhece cada túnel e cada marinheiro"]], "Navalha|Vigarista": [["Robin Hood de Esquina", "tira dos ricos na mesa das três cartas"], ["Jogador Profissional", "baralho marcado, sorriso limpo"], ["Trapaceiro Jurado de Morte", "enganou a pessoa errada"], ["Mestre do Golpe", "arma o golpe pelo prazer da armação"]]}; const sgBase=(era==='1994'?SUG94:SUG)[porta+'|'+oficio]||[]; const MOTIX={'Justiça':0,'Dever':0,'Cruzada':0,'Dinheiro':1,'Lealdade':1,'Contrato':1,'Vingança':2,'Redenção':2,'Curiosidade':3,'Amor':3}; const motAtual=has('lado')?c.lado:c.mot; const mi=MOTIX[motAtual]; const sgOrd=sgBase.map((x,i)=>({n:x[0],tag:x[1],i})).sort((a,b)=>(a.i===mi?-1:0)-(b.i===mi?-1:0)); const sg=sgOrd.map(x=>({t:x.n,tag:x.tag,match:x.i===mi,sel:c.papel===x.n}));
        const pm=matches(porta,oficio);
        return {
          portaValue:porta, oficioValue:oficio,
          portaOptions:GR.map(g=>({n:g.n,label:g.n})),
          oficioOptions:OFI.map(n=>({n,label:n})),
          papelOptions:pm.map(a=>({n:a.n,label:nomePapel(a)+(a.epoca?' · de época':a.vertente?' · outra trilha':' · clássico')})),
          
          hasSug:sg.length>0, papelSug:sg.map(x=>({t:x.t,tag:x.tag,mark:x.match?'combina com '+motAtual:'',hasMark:x.match,bd:x.sel?'2px solid var(--sv-bg,#131212)':'1px solid rgba(19,18,18,0.35)',go:()=>this.setChar({papel:x.t})})),
          hasVariantes:pm.length>1, f_papel:ev=>this.setChar({papel:ev.target.value}),
          f_porta:ev=>pick(ev.target.value,oficio),
          f_oficio:ev=>pick(porta,ev.target.value),
          f_arq:ev=>{ const a=RR.arquetipos.find(x=>x.n===ev.target.value); a?setArq(a):setArq(null,{porta,oficio}); }
        }; })(),
      f_ori:field('ori'), arqOptions:RR.arquetipos,
      arqGroups:trilhasDe(era).map(g=>({g:g.n,items:RR.arquetipos.filter(a=>a.grupo===g.n).map((a,i)=>({a,i,k:a.epoca?0:a.consagrada?1:2})).sort((x,y)=>x.k-y.k||x.i-y.i).map(({a})=>({n:a.n,label:nomePapel(a)+(a.vertente?' · '+a.ocup:a.epoca?' · linhagem '+a.linhagem:' · '+a.n)}))})), oriLabel:'Bairro', hasOriField:false,
      oriOptions: era==='1934' ? RR.origens.map(o=>o.n) : regioes.map(r=>r.nome),
      motLabel: has('lado')?'Contrato ou Cruzada':'Motivação', motValue: has('lado')?c.lado:c.mot, motOptions: has('lado')?RR.lados:RR.motivacoes,
      f_mot:ev=>this.setChar(has('lado')?{lado:ev.target.value}:{mot:ev.target.value}),
      hasProntos:RR.prontos.length>0,
      hasCasosLivro:(RR.casos||[]).length>0, casosLivro:(RR.casos||[]).map(k=>({titulo:k.titulo,ano:k.ano,premissa:k.premissa,go:()=>this.loadCaso(k)})),
      hasGanchos:(RR.ganchos||[]).length>0, ganchos:(RR.ganchos||[]).map((g,i)=>({n:String(i+1),t:g,go:()=>{ this.setCaso({...blankCaso(),premissa:g}); this.setState({showSeg:false}); }})),
      pistaOpts:caso.pistas.map((p,i)=>({id:p.id,label:(i+1)+' · '+(p.t.length>56?p.t.slice(0,56)+'…':p.t)})),
      fioA:s.fioA, fioB:s.fioB, fioRel:s.fioRel, onFioA:ev=>this.setState({fioA:ev.target.value}), onFioB:ev=>this.setState({fioB:ev.target.value}), onFioRel:ev=>this.setState({fioRel:ev.target.value}),
      addFio:()=>{ if(!s.fioA||!s.fioB||s.fioA===s.fioB||!s.fioRel.trim()) return; this.setCaso(x=>({fios:[...(x.fios||[]),{id:uid(),a:s.fioA,b:s.fioB,rel:s.fioRel.trim(),st:'solto'}]})); this.setState({fioRel:''}); },
      fiosView:caso.fios.map((f,i)=>({n:String(i+1),txt:this.fioTxt(f,i).replace(/^Fio \d+: /,''),isFirme:f.st==='firme',isCortado:f.st==='cortado',isSolto:f.st==='solto',verify:()=>this.verifyFio(i),act:()=>this.actFio(i),del:()=>this.setCaso(x=>({fios:x.fios.filter(y=>y.id!==f.id)}))})),
      muralInfo:`${caso.pistas.length} Cartões · ${firmes} firmes · ${soltos} soltos · ${cortados} cortados · ${triCount(caso.fios)} triângulos · Ruído ${c.ruido||0}`,
      f_medalha:field('medalha'), medalhaUsos:String(caso.medalhaUsos||0), useMedalha:()=>this.useMedalha(),
      f_anoNasc:field('anoNasc'), f_lacoEra:field('lacoEra'), f_lacoDe:field('lacoDe'), f_herancas:field('herancas'), f_testamento:field('testamento'), f_antepassado:field('antepassado'),
      idadeLabel: idade!=null ? `${idade} anos em ${era}` : 'Anote o ano de nascimento para envelhecer entre as eras',
      canFlash:!!c.lacoEra && !caso.flash, doFlash:()=>this.flashback(), flashLabel:'Flashback geracional · '+(has('adr')?'1 de Adrenalina':'2 de Sangue-Frio'),
      canJaVi: idade!=null && idade>=70 && !caso.jaVi, doJaVi:()=>this.jaVi(),
      flashInfo: !c.lacoEra ? 'Com um Laço de Herança, uma vez por caso, você volta décadas e joga o antepassado que deixou algo pronto para hoje.' : caso.flash ? 'Flashback geracional já usado neste caso.' : `Uma vez por caso: “em ${c.lacoEra}…”`,
      hasSalto:saltoOpts.length>0, saltoOptions:saltoOpts, saltoEra:saltoSel, onSaltoEra:ev=>this.setState({saltoEra:ev.target.value}),
      jumpSame:()=>this.jumpEra(saltoSel,false), jumpHeir:()=>this.jumpEra(saltoSel,true),
      futuroLabel: s.futuro?'Esconder o futuro':'Mostrar o futuro (spoilers)', toggleFuturo:()=>this.setState({futuro:!s.futuro}),
      cronoLabel: s.futuro ? '1792–1994' : 'até '+era,
      seculoEras:SS.eras.map(([e,g,q])=>({e,g,q,atual:e===era,outra:e!==era,go:()=>this.pickEra(e)})),
      cronoView:SS.cronologia.filter(([a])=>showYear(a)).map(([a,t])=>({a,t})),
      testemunhasView:SS.testemunhas.map(([n,vida,viu,carrega])=>({n,vida,viu,carrega})),
      linhagensView:SS.linhagens.map(([fam,...cols])=>({fam,cols:cols.map((t,i)=>({y:['1934','1946','1974','1994'].at(i),t})).filter(x=>ERAS.includes(x.y)).filter(x=>showYear(x.y))})),
      camadasView:Object.entries(SS.camadas).map(([k,v])=>({k,cols:['1934','1994'].filter(showYear).map(y=>({y,t:v[y]}))})),
      ancorasView:SS.ancoras.map(([n,t])=>({n,t})),
      hasDestinos: s.futuro || era!=='1934', destinosView:SS.destinos.map(([n,t])=>({n,t})),
      vozesView:SS.vozes.map(([n,t])=>({n,t})),
      intermezzosView:SS.intermezzos.map(i=>({ano:i.ano,titulo:i.titulo,premissa:i.premissa,btn:i.era===era?'Carregar no caderno':'Jogar em '+i.era,go:()=>{ if(i.era===era) this.loadCaso(i); else { this.pickEra(i.era); setTimeout(()=>this.loadCaso(i),40); } }})),
      seculoRegras:splitLines(SS.regras),
      canoneView:SS.canone.replace(/^[^:]+:\s*/,'').split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/).map(t=>({t})),
      hasArqInfo:!!arqInfo, arqInfo:arqInfo||{},
      arqNomePapel:arqInfo?nomePapel(arqInfo):'', papelPh:arqInfo?('Papel do personagem · pronto: '+nomePapel(arqInfo)):'Papel do personagem', arqGrupo:arqInfo?(arqInfo.grupo||''):'',
      arqOrigem:arqInfo?((arqInfo.vertente?('Papel do ofício '+arqInfo.ocup+' por outra trilha. Mantém as habilidades sugeridas de '+arqInfo.ocup+'.'):arqInfo.epoca?('Ofício de época · linhagem '+arqInfo.linhagem+'.'):'Ofício na trilha natural.')+(arqInfo.filme?' No cinema: '+arqInfo.filme+'.':'')+(arqInfo.escolha?' Escolha: '+arqInfo.escolha+'.':'')):'',
      arqSugInv:((arqInfo&&arqInfo.inv)||'').split('·')[0].split(',').map(t=>t.trim()).filter(Boolean).map(t=>({t:hn(era,t)})),
      arqSugGer:(((arqInfo&&arqInfo.inv)||'').split('·')[1]||'').replace(/^\s*gerais:\s*/,'').split(',').map(t=>t.trim()).filter(Boolean).map(t=>({t:hn(era,t)})),
      hasSugGer:!!(((arqInfo&&arqInfo.inv)||'').split('·')[1]),
      oriRep:oriO?oriO.rep:'', oriPt:oriO?(oriO.pt?oriO.pt+' · +1 ponto':'—'):'', oriC:oriO?oriO.c:'', hasOriInfo:!!oriO, oriInfo:oriO?`${oriO.rep}${oriO.pt?'; 1 ponto grátis em '+oriO.pt:''}; contato: ${oriO.c}`:'',
      extrasLabel:`${extras} de 30 · máx. 3 numa`, extrasBar:'', extrasTxt:`${extras}/30`+(extras<30?` · faltam ${30-extras}`:''),
      invView:IVL, invGroups:(RR.gruposInv||[['Investigativas',invAll]]).map(([g,ks])=>({g,items:IVL.filter(o=>ks.includes(o.k))})), geraisGroups:(RR.gruposGerais||[['Gerais',RR.gerais]]).map(([g,ks])=>({g,items:GVL.filter(o=>ks.includes(o.k))})),
      espLabel:c.esp.length+' de 3',
      espSlots:[0,1,2].map(i=>({on:i<c.esp.length,off:i>=c.esp.length})),
      geraisView:GVL,
      segVelho:c.segredoVelho||'', hasSegVelho:!!c.segredoVelho, canRevelar:!!(c.segredo||'').trim(), revelarSeg:()=>{ const ch=this.cur().char; if(!(ch.segredo||'').trim()) return; if(!this.conf2('seg','Revelar o segredo agora?')) return; const old=ch.segredo; this.setChar({segredoVelho:old,segredo:'',imp:clamp((ch.imp||0)+1,0,3)}); this.addLog({k:'mech',who:'Segredo revelado',text:`“${old}” veio à tona. +1 Ímpeto, choque de Sangue-Frio (perda 4) e um Problema ligado ao segredo. Escreva um segredo novo quando quiser.`}); this.rollChoque(4,null); }, w1Imp:'1 Ímpeto', wImps:'Ímpetos', phVicio:PH_ERA(era).vicio, phSegredo:PH_ERA(era).segredo, phRegras:PH_ERA(era).regras, phEquip:PH_ERA(era).equip, fontesView:fontesOf(c).map((f,i)=>({tipo:FONTE_TIPOS[i],t:f.t,perdida:!!f.perdida,ok:!f.perdida,ph:PH_ERA(era).fontes[i],stLine:f.perdida?'text-decoration:line-through;opacity:.45':'',onT:ev=>{ const L=fontesOf(this.cur().char).map(x=>({...x})); L[i].t=ev.target.value; this.setChar({fontesL:L,fontes:L.map((x,j)=>x.t?x.t+' ('+FONTE_TIPOS[j].toLowerCase()+')':'').filter(Boolean).join(' · ')}); },toggle:()=>{ const L=fontesOf(this.cur().char).map(x=>({...x})); if(!L[i].t) return; L[i].perdida=!L[i].perdida; this.setChar({fontesL:L}); if(L[i].perdida){ this.addLog({k:'mech',who:'Fonte perdida',text:`${L[i].t} (${FONTE_TIPOS[i].toLowerCase()}): choque de Sangue-Frio, perda 4. Escolha uma Fonte nova quando a história permitir.`}); this.rollChoque(4,null); } }})), fontesCap:`Ao fechar o caso, cada Fonte de pé devolve +2 de Sangue-Frio, até o seu valor inicial (${c.sfIni??8}). O narrador pode ameaçar uma delas. Perder uma Fonte custa um choque de 4.`, vicioBoxes:[0,1,2].map(i=>({on:i<(c.vicioTr||0),off:i>=(c.vicioTr||0)})), vicioLabel:(c.vicioTr||0)>=3?'Garrafa vazia até o próximo caso':(c.vicioTr||0)===2?'Última dose · +2 e recaída':'Ceder ao vício · +2',
      useVicio:()=>{ const tr=c.vicioTr||0; if(tr>=3){ svToast('A garrafa está vazia até o próximo caso.'); return; }
        const n=tr+1, nome=c.vicio||'O vício'; this.setChar({sf:clamp(c.sf+2,-12,12),vicioTr:n});
        if(n<3){ this.addLog({k:'mech',who:'A Garrafa',text:`${nome}: +2 de Sangue-Frio · dose ${n} de 3`}); return; }
        const COB=[['Ressaca','−1 em todos os testes da próxima cena.'],['Ressaca','−1 em todos os testes da próxima cena.'],['Dívida','Problema: alguém vai cobrar o que o vício custou.'],['Visto','Problema: alguém viu você no lugar errado.'],['Língua solta','você falou demais: uma pista ou segredo vaza para alguém do caso.'],['Apagão','−1 Ímpeto (sem Ímpeto, −2 de Sangue-Frio).']];
        const r=rnd(6), [t,e]=COB[r-1];
        if(r===6){ if((c.imp||0)>0) this.setChar({imp:c.imp-1}); else this.setChar(x=>({sf:clamp(x.sf-2,-12,12)})); }
        this.addLog({k:'mech',who:'A Garrafa · Recaída',text:`${nome}: +2 de Sangue-Frio · terceira dose. O vício cobra (1d6 = ${r}): ${t} — ${e}`});
        setTimeout(()=>this.narrate(`RECAÍDA: o personagem cedeu ao vício (${nome}) pela terceira vez neste caso. O vício cobra agora: ${t} — ${e} Narre a cobrança em poucas linhas, concreta e ligada ao vício e ao caso, e aplique a marca correspondente (${r===3||r===4?'[PROBLEMA: ...]':r===1||r===2?'lembre o −1 na próxima cena':r===5?'o PD que soube de algo':'o Ímpeto já foi descontado'}). Não repita o efeito mecânico além do necessário.`),60); },
      resetLabel:s.confirmApagar?'Clique de novo para apagar':'Apagar ficha', resetChar:()=>{ if(!this.state.confirmApagar){ this.setState({confirmApagar:true}); clearTimeout(this.__apT); this.__apT=setTimeout(()=>this.setState({confirmApagar:false}),4000); return; } clearTimeout(this.__apT); this.setState({confirmApagar:false}); this.upd(e=>({...e,char:blankChar(era)})); svToast&&svToast('Ficha apagada'); },
      // dados
      soloHab:s.soloHab, onSoloHab:ev=>this.setState({soloHab:ev.target.value}), soloModLabel:sign(s.soloMod)||'0',
      soloModInc:()=>this.setState({soloMod:s.soloMod+1}), soloModDec:()=>this.setState({soloMod:s.soloMod-1}),
      rollSolo:()=>this.rollTest(s.soloHab,{mod:s.soloMod,narrate:false}),
      gold:s.gold, goldNeed:Math.max(1,(s.gold.dif||0)-(s.gold.gasto||0)), goldImpossivel:(s.gold.dif||0)-(s.gold.gasto||0)>6, goldCerto:(s.gold.dif||0)-(s.gold.gasto||0)<=1, goldNormal:((s.gold.dif||0)-(s.gold.gasto||0))>1&&((s.gold.dif||0)-(s.gold.gasto||0))<=6,
      lastDice:(s.lastRolls||[]).map(r=>({isD6:r.n===6,isD8:r.n!==6,v:r.v,pips:Array.from({length:9},(_,k)=>({on:r.n===6&&SV_PIPS[r.v].includes(k),off:!(r.n===6&&SV_PIPS[r.v].includes(k))}))})), hasLastDice:!!(s.lastRolls&&s.lastRolls.length), goldGInc:()=>this.setState({gold:{...s.gold,gasto:s.gold.gasto+1}}), goldGDec:()=>this.setState({gold:{...s.gold,gasto:Math.max(0,s.gold.gasto-1)}}),
      goldDInc:()=>this.setState({gold:{...s.gold,dif:Math.min(8,s.gold.dif+1)}}), goldDDec:()=>this.setState({gold:{...s.gold,dif:Math.max(2,s.gold.dif-1)}}),
      rollGold:()=>{ const r=rnd(6), t=r+s.gold.gasto; setDice('Regra de ouro',t>=s.gold.dif?'Conseguiu':'Falhou',`1d6 = ${r} + ${s.gold.gasto} gastos = ${t} contra Dificuldade ${s.gold.dif}`); },
      armas, danoArma:s.danoArma, onDanoArma:ev=>this.setState({danoArma:ev.target.value}), qrLabel:s.qr?'Queima-roupa +2 ✓':'Queima-roupa +2', toggleQR:()=>this.setState({qr:!s.qr}),
      rollDano:()=>{ const [l,m]=RR.armas[parseInt(s.danoArma)]; const r=rnd(6); const t=Math.max(0,r+m+(s.qr?2:0)); setDice('Dano · '+l,t,`1d6 = ${r}${m?' '+sign(m):''}${s.qr?' +2 queima-roupa':''} = ${t} de Vitalidade`); },
      choques, choqueI:s.choqueI, onChoque:ev=>this.setState({choqueI:ev.target.value}),
      rollChoqueSel:()=>this.rollChoque(RR.choques[parseInt(s.choqueI)][1],null),
      tabelas, livre:s.livre, livreInc:()=>this.setState({livre:{n:Math.min(10,s.livre.n+1)}}), livreDec:()=>this.setState({livre:{n:Math.max(1,s.livre.n-1)}}),
      rollD6:()=>{ const f=Array.from({length:s.livre.n},()=>rnd(6)); setDice(s.livre.n+'d6',f.reduce((a,b)=>a+b,0),f.join(' · ')); },
      rollD8:()=>{ const f=Array.from({length:s.livre.n},()=>rnd(8)); setDice(s.livre.n+'d8',f.reduce((a,b)=>a+b,0),f.join(' · ')); },
      diceRes:s.diceRes||{}, hasDiceRes:!!s.diceRes, noDiceRes:!s.diceRes, diceResNotLogged:!!s.diceRes&&!s.diceRes.logged,
      diceToLog:()=>{ const r=s.diceRes; if(!r) return; this.addLog({k:'mech',who:r.title,text:r.big+' · '+r.detail}); this.setState({diceRes:{...r,logged:true}}); },
      diceNarrate:()=>{ const r=s.diceRes; if(!r) return; if(!r.logged) this.addLog({k:'mech',who:r.title,text:r.big+' · '+r.detail}); this.setState({diceRes:{...r,logged:true}}); this.setTab('cronica'); setTimeout(()=>this.narrate(`O jogador rolou fora de um pedido seu — ${r.nar} Resultado: ${r.big}. Interprete na ficção atual e narre.`),50); },
      // elenco
      elencoCount:LL.npcs.length, npcQ:s.npcQ, onNpcQ:ev=>this.setState({npcQ:ev.target.value}), npcReg:s.npcReg, onNpcReg:ev=>this.setState({npcReg:ev.target.value}),
      npcView:npcFiltered.map(n=>{const inScene=d.naCena.includes(n.id); return {...n,inScene,hasQuad:!!(n.v||n.pe||n.q||n.t),custom:!!n.custom,toggleLabel:inScene?'Tirar de cena':'Pôr em cena',
        toggle:()=>this.upd(e=>({...e,naCena:inScene?e.naCena.filter(x=>x!==n.id):[...e.naCena,n.id]})),
        talk:()=>{ this.upd(e=>({...e,naCena:e.naCena.includes(n.id)?e.naCena:[...e.naCena,n.id]})); this.setState({tab:'cronica',mode:'fala',talkTo:n.id},()=>this.save()); },
        del:()=>this.upd(e=>({...e,custom:e.custom.filter(x=>'c'+x.cid!==n.id),naCena:e.naCena.filter(x=>x!==n.id)}))};}),
      npcForm:s.npcForm, n_nome:ev=>this.setState({npcForm:{...s.npcForm,nome:ev.target.value}}), n_papel:ev=>this.setState({npcForm:{...s.npcForm,papel:ev.target.value}}), n_desc:ev=>this.setState({npcForm:{...s.npcForm,desc:ev.target.value}}),
      addNpc:()=>{ const f=s.npcForm; if(!f.nome.trim()) return; this.upd(e=>({...e,custom:[...(e.custom||[]),{cid:uid(),n:f.nome.trim(),p:f.papel.trim()||'Desconhecido',d:f.desc.trim(),r:d.cena||''}]})); this.setState({npcForm:{nome:'',papel:'',desc:''}}); },
      genNpc:async()=>{ if(this.state.busy) return; this.setState({busy:true});
        try{
          const res=await fetch('/api/npc',{method:'POST',headers:{'content-type':'application/json'},
            body:JSON.stringify({era, cena:d.cena||'', evitar:npcs.map(n=>n.n).slice(-40),
              prefs:{modeloIA:this.props.modeloIA||'haiku'}})});
          if(res.status===429){ const q=await res.json().catch(()=>({}));
            this.addLog({k:'mech',who:'Arquivo',text:q.message||'Os arquivos da cidade fecham por hoje.'}); }
          else if(!res.ok){ throw new Error('npc '+res.status); }
          else { const j=await res.json();
            this.upd(e=>({...e,custom:[...(e.custom||[]),{cid:uid(),...j.npc,r:d.cena||''}]}));
            this.setState({npcReg:'__meus'}); }
        }catch(err){ this.addLog({k:'mech',who:'Erro',text:'Não foi possível gerar o NPC.'}); }
        this.setState({busy:false}); },
      // cidade
      ...this.mapVals(s,era,d,SS,goRegion),
      regionView:regioes.map(r=>{ const ns=LL.npcs.filter(n=>n.r===r.nome).map(n=>n.n); return {nome:r.nome,atual:d.cena===r.nome,meta:metaOf(r),resumo:r.resumo,lugares:(r.lugares||[]).map(([n,dd])=>({n,d:dd})),hasLugares:(r.lugares||[]).length>0,hasGancho:!!r.gancho,gancho:r.gancho,hasNpcs:ns.length>0,npcs:ns.join(', '),go:()=>goRegion(r.nome),set:()=>this.upd(e=>({...e,cena:r.nome}))}; }),
      // tutorial
      tutorial:[
        {n:'1',t:'O que é isto',d:`Um narrador e Diretor para jogar ${RR.titulo} sozinho. O narrador conhece as regras, as facções, as regiões e os Personagens do Diretor do livro, e lê o capítulo da região onde a cena acontece.`},
        {n:'2',t:'A regra do jogo solo',d:'O livro traz “Jogando a dois” (inspirado no GUMSHOE One-2-One). O app usa essa regra: todas as habilidades investigativas começam em 0 e você distribui 30 pontos (máx. 3 numa); nível 1 garante as pistas centrais, em 0 cada pista central custa 1 Ímpeto, e cada ponto acima de 1 é reserva para benefícios, três especialidades gerais e 24 pontos para dividir entre Vitalidade, Sangue-Frio e Integridade. Todo investigador começa com 1 Ímpeto.'+({'1934':'','1946':' Em 1946, a Ficha e a Medalha entram em jogo.','1974':' Em 1974, o Código, o Mural e o Ruído entram em jogo.','1994':' Em 1994, a moeda do investigador se chama Adrenalina, e a Viúva entra em jogo.'})[era]},
        {n:'3',t:'Monte a ficha',d:`Na Ficha, carregue um ${RR.pj.toLowerCase()} pronto do livro ou crie o seu: pano de fundo, papel, ${has('lado')?'bairro, Contrato ou Cruzada, as três regras do Código':has('codigo')?'bairro, motivação, as três regras do Código':era==='1934'?'motivação':'bairro, motivação'}, vício, fontes de Sangue-Frio e um segredo.`},
        {n:'4',t:'Abra um caso',d: !['1934','1994'].includes(era)?'Na aba Caso, carregue um Arquivo pronto ou um Intermezzo do livro, escolha um gancho da era ou role o gerador de casos do século. Você vê só a premissa; a verdade fica com o narrador.': is94?'Na aba Caso, sorteie um gancho do livro (dois por região) ou escreva sua premissa, e peça a abertura.':'Na aba Caso, role o gerador de casos do livro (cliente, crime, vítima, culpado, motivo, reviravolta). Você vê só a premissa; a verdade fica com o narrador.'},
        {n:'5',t:'Investigue, não role',d:'Diga o que você faz e onde procura. Pistas centrais nunca exigem rolagem: elas chegam e vão para o caderno. Quando o narrador oferecer um benefício extra, aparecem botões para pagar com a reserva da habilidade, se houver, ou com 1 Ímpeto.'},
        {n:'6',t:'Role quando houver risco',d:'Ações gerais incertas viram um botão de teste: 1d6 + modificadores. Revés (1–2) traz um Problema; Empate (3–4) consegue com custo, ou gaste um Ímpeto para virar Avanço; Avanço (5+) consegue e pode render uma Vantagem.'},
        {n:'7',t:'Pague o preço',d:`Choques de Sangue-Frio, dano e quedas de ${RR.medidor.n} são aplicados na ficha automaticamente. Ceder ao vício devolve 2 de Sangue-Frio; com três traços, ele cobra.`},
        {n:'8',t:'Converse e feche o caso',d:'No Elenco, ponha Personagens do Diretor em cena ou converse com eles: a IA assume a voz de cada um pelas quatro linhas. No clímax, mais Vantagens que Problemas, a verdade vence; o Peso das provas decide se ela sobrevive ao Fórum.'},
        {n:'9',t:'Jogue o século',d:'Na aba Século estão a cronologia, as famílias, as Testemunhas e o cânone que corrige os livros. Cada era guarda a própria crônica: trocar de era não apaga a outra.'}
      ],
      regrasView, refView
    };
  }

  /** DCLogic chamava renderVals() por fora; aqui a própria classe renderiza. */
  render(){
    return <OracleView v={this.renderVals()} />;
  }
}
