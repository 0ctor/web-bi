/**
 * Perguntas fechadas do painel da clínica.
 * A tela só exibe agregado. Nome, telefone, CPF e observação não entram na resposta.
 * O número, quando existir, vem da API dona do dado (agenda ou financeiro).
 */

export const GRUPOS = [
    { id: 'pacientes', titulo: 'Quem chega na clínica' },
    { id: 'agenda', titulo: 'Como está a agenda' },
    { id: 'caixa', titulo: 'Como está o caixa' },
] as const

export type GrupoId = (typeof GRUPOS)[number]['id']
export type Fonte = 'agenda' | 'financeiro'

export type Pergunta = {
    id: string
    grupo: GrupoId
    pergunta: string
    explicacao: string
    fonte: Fonte
    fonteRotulo: string
    /** Barra de proporção. Caixa em reais não usa barra de contagem. */
    barra: boolean
}

export const PERGUNTAS: readonly Pergunta[] = [
    {
        id: 'faixa-etaria',
        grupo: 'pacientes',
        pergunta: 'Qual idade aparece mais?',
        explicacao: 'A faixa de idade com mais pacientes neste mês.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'bairro',
        grupo: 'pacientes',
        pergunta: 'De qual bairro vem a maioria?',
        explicacao: 'O bairro mais frequente entre os pacientes deste mês.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'origem',
        grupo: 'pacientes',
        pergunta: 'Como a maioria chegou até a clínica?',
        explicacao: 'Indicação, Instagram, Google ou outro caminho já cadastrado.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'pacientes-novos',
        grupo: 'pacientes',
        pergunta: 'Quantos pacientes novos chegaram?',
        explicacao: 'Primeira vez na clínica, neste mês.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'faltas',
        grupo: 'agenda',
        pergunta: 'Quantos faltaram?',
        explicacao: 'Consultas marcadas em que a pessoa não veio, neste mês.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'horario',
        grupo: 'agenda',
        pergunta: 'Qual horário enche mais?',
        explicacao: 'O período do dia com mais consultas marcadas.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'servico',
        grupo: 'agenda',
        pergunta: 'Qual atendimento é o mais procurado?',
        explicacao: 'O serviço com mais marcações neste mês.',
        fonte: 'agenda',
        fonteRotulo: 'Vem da agenda',
        barra: true,
    },
    {
        id: 'entradas-mes',
        grupo: 'caixa',
        pergunta: 'Quanto entrou neste mês?',
        explicacao: 'A soma que o financeiro já contabilizou. O painel não recalcula.',
        fonte: 'financeiro',
        fonteRotulo: 'Vem do financeiro',
        barra: false,
    },
]

export type RespostaPronta = {
    status: 'pronto'
    rotulo: string
    quantidade: number
    total: number
}

export type RespostaSemFonte = {
    status: 'sem_fonte'
    motivo: string
}

export type Resposta = RespostaPronta | RespostaSemFonte

const CHAVES_PROIBIDAS = new Set([
    'nome',
    'cpf',
    'telefone',
    'email',
    'observacao',
    'observação',
    'paciente',
    'patient',
    'paciente_uuid',
    'patient_uuid',
])

function temChaveProibida(valor: unknown): boolean {
    if (!valor || typeof valor !== 'object') return false
    if (Array.isArray(valor)) return valor.some(temChaveProibida)
    return Object.entries(valor as Record<string, unknown>).some(
        ([chave, filho]) =>
            CHAVES_PROIBIDAS.has(chave.toLowerCase()) || temChaveProibida(filho),
    )
}

function inteiroNaoNegativo(valor: unknown): valor is number {
    return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0
}

/** Aceita só agregado. Qualquer identificador de pessoa invalida o payload. */
export function respostaAceita(valor: unknown): valor is Resposta {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) return false
    if (temChaveProibida(valor)) return false
    const registro = valor as Record<string, unknown>
    if (registro.status === 'sem_fonte') {
        return typeof registro.motivo === 'string' && registro.motivo.trim().length > 0
    }
    if (registro.status !== 'pronto') return false
    if (typeof registro.rotulo !== 'string' || registro.rotulo.trim().length === 0) {
        return false
    }
    if (!inteiroNaoNegativo(registro.quantidade) || !inteiroNaoNegativo(registro.total)) {
        return false
    }
    return registro.quantidade <= registro.total
}

export function respostaInicial(pergunta: Pergunta): RespostaSemFonte {
    const origem =
        pergunta.fonte === 'agenda'
            ? 'A agenda ainda não enviou este resumo.'
            : 'O financeiro ainda não enviou este resumo.'
    return { status: 'sem_fonte', motivo: origem }
}

export function fatiaPercentual(quantidade: number, total: number): number {
    if (total <= 0) return 0
    return Math.round((quantidade / total) * 100)
}

export function frase(pergunta: Pergunta, resposta: Resposta): string {
    if (resposta.status === 'sem_fonte') return resposta.motivo
    const { rotulo, quantidade, total } = resposta
    switch (pergunta.id) {
        case 'faixa-etaria':
            return `A faixa mais comum é ${rotulo}. São ${quantidade} de ${total} pacientes neste mês.`
        case 'bairro':
            return `O bairro mais comum é ${rotulo}. São ${quantidade} de ${total} pacientes neste mês.`
        case 'origem':
            return `A maioria chegou por ${rotulo}. São ${quantidade} de ${total} pacientes neste mês.`
        case 'pacientes-novos':
            return `${quantidade} pacientes novos neste mês, de ${total} pacientes atendidos.`
        case 'faltas':
            return `${quantidade} de ${total} consultas marcadas tiveram falta neste mês.`
        case 'horario':
            return `O horário que mais enche é ${rotulo}. São ${quantidade} de ${total} consultas neste mês.`
        case 'servico':
            return `O atendimento mais procurado é ${rotulo}. São ${quantidade} de ${total} marcações neste mês.`
        case 'entradas-mes':
            return `Neste mês entrou ${rotulo}.`
        default:
            return `${quantidade} de ${total}.`
    }
}

export function perguntasDoGrupo(grupoId: GrupoId): Pergunta[] {
    return PERGUNTAS.filter((pergunta) => pergunta.grupo === grupoId)
}
