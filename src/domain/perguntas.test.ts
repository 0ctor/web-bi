import { describe, expect, it } from 'vitest'
import {
    GRUPOS,
    PERGUNTAS,
    fatiaPercentual,
    frase,
    perguntasDoGrupo,
    respostaAceita,
    respostaInicial,
} from './perguntas'

const JARGÃO = ['sql', 'dimensão', 'dimensao', 'medida', 'kpi', 'cubo', 'dataset', 'query', 'dashboard']

describe('catálogo de perguntas', () => {
    it('fecha oito perguntas, sem id repetido', () => {
        expect(PERGUNTAS).toHaveLength(8)
        expect(new Set(PERGUNTAS.map((item) => item.id)).size).toBe(8)
    })

    it('cobre os três grupos do painel', () => {
        for (const grupo of GRUPOS) {
            expect(perguntasDoGrupo(grupo.id).length).toBeGreaterThan(0)
        }
    })

    it('fala com quem cuida da clínica, sem jargão de ferramenta', () => {
        const texto = PERGUNTAS.map(
            (item) => `${item.pergunta} ${item.explicacao}`,
        )
            .join(' ')
            .toLowerCase()
        for (const termo of JARGÃO) {
            expect(texto).not.toContain(termo)
        }
    })

    it('deixa o caixa com o financeiro e o restante com a agenda', () => {
        const caixa = PERGUNTAS.filter((item) => item.grupo === 'caixa')
        expect(caixa.map((item) => item.fonte)).toEqual(['financeiro'])
        expect(
            PERGUNTAS.filter((item) => item.grupo !== 'caixa').every(
                (item) => item.fonte === 'agenda',
            ),
        ).toBe(true)
    })
})

describe('resposta agregada', () => {
    const pronta = {
        status: 'pronto' as const,
        rotulo: '31 a 45',
        quantidade: 12,
        total: 30,
    }

    it('aceita contagem sem identificar pessoa', () => {
        expect(respostaAceita(pronta)).toBe(true)
        expect(respostaAceita({ status: 'sem_fonte', motivo: 'Ainda não.' })).toBe(true)
    })

    it('recusa nome, CPF, telefone e observação', () => {
        expect(respostaAceita({ ...pronta, cpf: '000' })).toBe(false)
        expect(respostaAceita({ ...pronta, paciente: { nome: 'Ana' } })).toBe(false)
        expect(respostaAceita({ ...pronta, telefone: '119999' })).toBe(false)
        expect(respostaAceita({ ...pronta, observacao: 'retorno' })).toBe(false)
    })

    it('recusa quantidade maior que o total', () => {
        expect(respostaAceita({ ...pronta, quantidade: 31, total: 30 })).toBe(false)
    })

    it('começa sem fonte, com motivo da agenda ou do financeiro', () => {
        const faixa = PERGUNTAS.find((item) => item.id === 'faixa-etaria')
        const caixa = PERGUNTAS.find((item) => item.id === 'entradas-mes')
        expect(faixa && respostaInicial(faixa).motivo).toContain('agenda')
        expect(caixa && respostaInicial(caixa).motivo).toContain('financeiro')
    })
})

describe('frase em português', () => {
    it('diz a faixa mais comum com a contagem', () => {
        const pergunta = PERGUNTAS.find((item) => item.id === 'faixa-etaria')!
        expect(
            frase(pergunta, {
                status: 'pronto',
                rotulo: '31 a 45',
                quantidade: 12,
                total: 30,
            }),
        ).toBe('A faixa mais comum é 31 a 45. São 12 de 30 pacientes neste mês.')
    })

    it('diz o valor que o financeiro enviou, sem recalcular', () => {
        const pergunta = PERGUNTAS.find((item) => item.id === 'entradas-mes')!
        expect(
            frase(pergunta, {
                status: 'pronto',
                rotulo: 'R$ 1.200,00',
                quantidade: 4,
                total: 4,
            }),
        ).toBe('Neste mês entrou R$ 1.200,00.')
    })

    it('repete o motivo quando a fonte ainda não enviou o resumo', () => {
        const pergunta = PERGUNTAS[0]
        expect(frase(pergunta, respostaInicial(pergunta))).toBe(
            'A agenda ainda não enviou este resumo.',
        )
    })

    it('calcula a fatia da barra e trata total zero', () => {
        expect(fatiaPercentual(12, 30)).toBe(40)
        expect(fatiaPercentual(0, 0)).toBe(0)
    })
})
