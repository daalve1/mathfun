<script>
    import confetti from "canvas-confetti"
    import Modal from "../components/Modal.svelte"

    let fetchOperation = null
    let finished = false
    let selectedLevel = 'FACIL'
    let operation
    let secretNumber = null
    let userResponse = ''
    let corrects = 0
    let attemps = 0
    let wrong = false
    let showModal = false
    let showSolution

    const LEVEL = [
        { 
            id: 'FACIL',
            value: 'EASY' 
        },
        { 
            id: 'MEDIO',
            value: 'MEDIUM'
        },
        {
            id: 'DIFICIL',
            value: 'DIFFICULT'   
        }
    ]

    // Función para obtener palabras con sus definiciones
    async function getOperation() {
        // Procesar la respuesta
        let response = await fetch('/api/operationGenerator', {
            method: 'POST',
            body: JSON.stringify({ selectedLevel }),
            headers: {
                'content-type': 'application/json'
            }
        })

        let completion = await response.json()

        return completion
    }

    // Reinializa las variables del juego
    function refresh() {
        userResponse = ''
        finished = false
        attemps = 0
        wrong = false

        start()
    }

    // Pinta palabra como incorrecta
    function incorrect() {
        wrong = true
        attemps++

        setTimeout(() => {
            wrong = false
        }, 1500)
    }

    // Comprueba si la operacion es correcta
    function check() {
        finished = userResponse === secretNumber

        if(finished) {
            getConfetti()
            return 
        }

        incorrect()
    }

    // Reinicializa las palabras/definiciones del juego
    function start() {
        fetchOperation = getOperation()

        const regexOperators = /\d+|\D+/g
        let match
        const operators = []
        const numbers = []

        fetchOperation.then(res => {
            let ocurrencies = 0

            while ((match = regexOperators.exec(res)) !== null) {
                ocurrencies++

                // Obtener todos los operandos y operadores
                operators.push({
                    string: match[0],
                    index: match.index,
                })

                // Obtener solo numeros
                if(match[0].match(/\d+/)) {
                    numbers.push({
                        number: match[0],
                        index: ocurrencies - 1
                    })
                }
            }

            const rand = Math.floor(Math.random() * numbers.length)
            const { number, index } = numbers[rand]

            secretNumber = number
            
            operators[index].string = operators[index].string.replace(number, '???')
            operation = operators
        })
        .catch(error => {
            console.error('Error al obtener la operacion: ', error)
        })
    }

    function getConfetti() {
        corrects++
        
        let count = 200;
        let defaults = {
            origin: { y: 0.7 }
        }

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }))
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        })
        fire(0.2, {
            spread: 60,
        })
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        })
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        })
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        })
    }

    showSolution = () => {
        userResponse = secretNumber
    }

    function changeLevel(newLevel) {
        selectedLevel = newLevel
        refresh()
    }
</script>

<div class="corrects">{corrects}</div>
<div class={wrong ? 'shake' : ''}>
    <h1>MATHFUN</h1>

    <div class="buttons">
        {#each LEVEL as {id, value}}
            <button class={`${id} ${selectedLevel == id ? 'selected' : ''}`} on:click={() => changeLevel(id)}>{value}</button>
        {/each}
    </div>

    <div class="content">
        {#if !finished}
            {#if null != fetchOperation}
                {#await fetchOperation}
                    <p>Cargando...</p>
                {:then data}
                    {#each operation as o}
                        {#if o.string === '???'}
                            <input bind:value={userResponse} class={wrong ? 'incorrect' : ''}>
                        {:else}
                            {o.string}
                        {/if}
                    {/each}
                    
                    {#if userResponse}
                        <button id="btnCheck" on:click={() => check()} class={`${finished ? '' : 'shake'} check`}>check</button>
                    {/if}

                    {#if attemps > 0}
                        <button on:click={() => showModal = true} class="reset">solution</button>
                    {/if}
                    <button on:click={() => refresh()} class="reset">rerun</button>
                {:catch error}
                    <p>An error occurred! {error}</p>
                    <button on:click={() => refresh()} class="reset">rerun</button>
                {/await}
            {:else}
                <button on:click={() => {start()}}>START</button>
            {/if}
        {:else}
            <h1>FINISHED</h1>
            <button on:click={() => refresh()} class="reset">rerun</button>
        {/if}

        <Modal bind:showModal bind:showSolution />
    </div>
</div>

<style>
    h1 {
        text-align: center;
        text-transform: uppercase;
        color: #353535;
    }

    input {
        width: 32px;
        height: 3em;
        text-align: center; 
        text-transform: uppercase;
        outline: none;
        border: 2px solid #353535;
        border-radius: 6px;
        cursor: pointer;
        top: -10px;
        position: relative;
    }

    button {
        padding: 20px 0px;
        text-transform: uppercase;
        background-color: #353535;
        color: white;
        border-radius: 6px;
        cursor: pointer;
        width: 150px;
    }

    .content {
        font-size: 3em;
        text-align: center;
        margin: 3em;
    }

    @keyframes shake {
		0% {
			transform: translateX(0px) translateY(0px);
		}
        20% {
			transform: translateX(2px) translateY(-1px);
		}
		40% {
			transform: translateX(-1px) translateY(1px);
		}
		60% {
			transform: translateX(1px) translateY(-2px);
		}
		80% {
			transform: translateX(-2px) translateY(1px);
		}
		100% {
			transform: translateX(0px) translateY(0px);
		}
	}

    .shake {
		animation: 400ms shake 2;
	}

    .corrects {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 2em;
    }

    .incorrect {
        border-color: red;
    }

    .buttons {
        display: flex; 
        flex-direction: row;
        text-align: center;
        justify-content: center;
        gap: 20px;
    }

    button.FACIL {
        border: 4px solid #84a98c;
        background-color: #84a98c;
    }

    button.MEDIO {
        border: 4px solid #b39c08;
        background-color: #b39c08;
    }

    button.DIFICIL {
        border: 4px solid #ae2012;
        background-color: #ae2012;
    }

    button.reset {
        border: 4px solid #353535;
    }

    button.selected, button.selected:hover {
        border: 4px solid #353535;
    }
</style>