# Painel da clínica (`web-bi`)

Produto de leitura para quem cuida da clínica ou do consultório. A tela responde
perguntas em português. Não há construtor de gráfico, dimensão, medida nem SQL.

## De onde veio o recorte

Ferramentas de consultório que a clínica pequena de fato abre — Jane, Cliniko,
SimplePractice, iClinic, Feegow, Shosp — entregam relatório pronto: faltas,
pacientes novos, origem, horário cheio, serviço mais marcado, o que entrou no
mês. O dono lê a frase. Não monta o gráfico.

Construtor (Metabase, Power BI e o cubo de alguns prontuários) fica de fora.
Consultório pequeno não opera isso no dia a dia.

Este painel fica nesse primeiro grupo, com menos telas: oito perguntas fechadas.

## O que cada vizinho continua sendo

| App | Papel |
|-----|--------|
| `web-agenda` | Opera o dia. Dona do agendamento e do cadastro usado nas contagens. |
| `web-financial` | Dona do que entrou. O painel não recalcula valor. |
| `web-crm` | Funil e campanha. |
| `web-export` | Portabilidade LGPD (pacote do tenant). Não é este painel. |
| `web-dashboard` | Arquivado. Este nome não reabre aquele produto. |

## Regras

1. Só leitura, no tenant da sessão. Este app não copia ficha de paciente para um banco próprio.
2. A resposta padrão é contagem ou um rótulo já agregado (`31 a 45`, `Centro`, `R$ 1.200,00`). Sem nome, telefone, CPF, e-mail ou observação clínica.
3. Lista com pessoa identificável não entra nesta versão.
4. Dado de saúde não sai da Octor para uma ferramenta externa de análise.
5. Enquanto a agenda ou o financeiro não enviarem o agregado, a carta diz isso em português. Não há número de exemplo.

## Perguntas da primeira versão

| Id | Pergunta | Fonte |
|----|----------|--------|
| `faixa-etaria` | Qual idade aparece mais? | agenda |
| `bairro` | De qual bairro vem a maioria? | agenda |
| `origem` | Como a maioria chegou até a clínica? | agenda |
| `pacientes-novos` | Quantos pacientes novos chegaram? | agenda |
| `faltas` | Quantos faltaram? | agenda |
| `horario` | Qual horário enche mais? | agenda |
| `servico` | Qual atendimento é o mais procurado? | agenda |
| `entradas-mes` | Quanto entrou neste mês? | financeiro |

O período é o mês civil, no fuso de quem usa a tela. O cálculo do agregado
ainda não está ligado: a carta fica em `sem_fonte` até a API dona do dado
existir.
