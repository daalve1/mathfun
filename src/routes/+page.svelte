<script>
    import confetti from "canvas-confetti"

    let fetchOperation = null
    let finished = false
    let selectedLevel
    let operation
    let secretNumber = null
    let userResponse = ''

    const LEVEL = [
        { 
            id: 'FACIL',
            value: 'Fácil' 
        },
        { 
            id: 'MEDIO',
            value: 'Medio'
        },
        {
            id: 'DIFICIL',
            value: 'Difícil'   
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
        start()
    }

    // Pinta palabra como incorrecta
    function incorrect() {
        
    }

    // Comprueba si la operacion es correcta
    function check() {
        if(userResponse === secretNumber) {
            getConfetti()
            return 
        }

        incorrect()
    }

    // Reinicializa las palabras/definiciones del juego
    function start() {
        fetchOperation = getOperation()

        const regexDigits = /\d+/g
        let match
        const digits = []

        fetchOperation.then(res => {
            while ((match = regexDigits.exec(res)) !== null) {
                digits.push({
                    digit: match[0],
                    index: match.index,
                })
            }

            const randomIndex = Math.floor(Math.random() * digits.length)
            const { digit, index } = digits[randomIndex]

            const aux = [...res]
            secretNumber = digit
            aux[index] = "???"
            operation = aux
        })
        .catch(error => {
            console.error('Error al obtener la operacion: ', error)
        })
    }

    function getConfetti() {
        var count = 200;
        var defaults = {
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
</script>

<main>
    <h1>MATHFUN</h1>
    
    <select bind:value={selectedLevel} on:change={() => refresh()}>
        {#each LEVEL as { id, value }}
            <option value={id}>{value}</option>
        {/each}
    </select>

    {#if !finished}
        {#if null != fetchOperation}
            {#await fetchOperation}
                <p>Cargando...</p>
            {:then data}
                <section>
                    {#each operation as o}
                        {#if o === '???'}
                            <input bind:value={userResponse}>
                        {:else}
                            {o}
                        {/if}
                    {/each}
                </section>

                {#if userResponse}
                    <button on:click={() => check()} class="check">check</button>
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
</main>

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
    }

    button {
        display: block;
        margin: 1em auto;
        padding: 20px 62px;
        text-transform: uppercase;
        background-color: #353535;
        color: white;
        border: 1px solid #3C6E71;
        border-radius: 6px;
        cursor: pointer;
    }

    button:hover {
        background-color: #3C6E71;
        color: white;
        border: 1px solid #353535;
    }

    section {
        font-size: 3em;
        display: flex;
        text-align: center;
        justify-content: center;
    }

    select {
        margin: 0 auto;
        display: flex;
        
    }
</style>