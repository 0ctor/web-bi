import { GRUPOS, frase, perguntasDoGrupo, respostaInicial, fatiaPercentual } from '@/domain/perguntas'
import type { Pergunta, Resposta } from '@/domain/perguntas'

function Barra({ quantidade, total }: { quantidade: number; total: number }) {
    const fatia = fatiaPercentual(quantidade, total)
    return (
        <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${fatia}%` }}
                />
            </div>
            <p className="mt-2 text-sm text-gray-500">{fatia}% do total deste mês</p>
        </div>
    )
}

function Cartao({ pergunta, resposta }: { pergunta: Pergunta; resposta: Resposta }) {
    return (
        <article className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {pergunta.fonteRotulo}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {pergunta.pergunta}
            </h3>
            <p className="mt-3 text-base text-gray-800 dark:text-gray-200">
                {frase(pergunta, resposta)}
            </p>
            {resposta.status === 'pronto' && pergunta.barra ? (
                <Barra quantidade={resposta.quantidade} total={resposta.total} />
            ) : null}
            <p className="mt-3 text-sm text-gray-500">{pergunta.explicacao}</p>
        </article>
    )
}

const Page = () => {
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-10 p-4 md:p-8">
            <header>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Painel da clínica
                </h1>
                <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-300">
                    Respostas prontas sobre este mês. Não é preciso montar gráfico
                    nem escolher campo.
                </p>
            </header>

            {GRUPOS.map((grupo) => (
                <section key={grupo.id} className="flex flex-col gap-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {grupo.titulo}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {perguntasDoGrupo(grupo.id).map((pergunta) => (
                            <Cartao
                                key={pergunta.id}
                                pergunta={pergunta}
                                resposta={respostaInicial(pergunta)}
                            />
                        ))}
                    </div>
                </section>
            ))}

            <p className="text-sm text-gray-500">
                Aqui aparece contagem, não nome, telefone, CPF nem prontuário.
                Cada número, quando a clínica já tiver movimento, vem da agenda ou
                do financeiro. Este painel não guarda ficha de paciente.
            </p>
        </div>
    )
}

export default Page
