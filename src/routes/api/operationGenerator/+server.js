import { Configuration, OpenAIApi } from 'openai'
import { API_KEY } from '$env/static/private'
import { json } from '@sveltejs/kit'

const LEVEL = {
    FACIL: 'fácil',
    MEDIO: 'medio',
    DIFICIL: 'difícil'
}

// Función para interactuar con la API de ChatGPT
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    const { selectedLevel } = await request.json()
    const configuration = new Configuration({ 
        apiKey: API_KEY
    })
    const openai = new OpenAIApi(configuration)

    const messages = [{
        role: 'system',
        content: 'Eres una IA que devuelve una operación matemática y su resultado siempre número entero. El usuario te especifica la dificultad de la operación entre los signos `{{` y `}}`. Debes utilizar únicamente signos matemáticos.'
    }, {
        role: 'user',
        content: `Genera una operación matemática de nivel {{${LEVEL.FACIL}}}`
    }, {
        role: 'assistant',
        content: '3 + 4 = 7'
    }, {
        role: 'user',
        content: `Genera una operación matemática de nivel {{${LEVEL.MEDIO}}}`
    }, {
        role: 'assistant',
        content: '50 / 5 = 10'
    }, {
        role: 'user',
        content: `Genera una operación matemática de nivel {{${LEVEL.DIFICIL}}}`
    }, {
        role: 'assistant',
        content: '3^2 + 4^3 = 73'
    }]

    const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
            ...messages,
            {
                role: 'user',
                content: `Genera una operación matemática de nivel {{${selectedLevel}}}`
            }
        ],
        max_tokens: 35
    })
    
    let response = completion.data.choices[0]?.message?.content
    
    return json(response)
}