<script>
	export let showModal
    export let showSolution

    let dialog

    $: if(dialog && showModal) dialog.showModal()
</script>

<dialog bind:this={dialog} 
    on:close={() => (showModal = false)}>

    <div>
        <h2>😭💔 Are you sure? 💔😭</h2>
    </div>
    <div>
        <button on:click={() => {
                dialog.close()
                showSolution()
            }}>Yes</button>
        <button on:click={() => dialog.close()}>No</button>
    </div>
</dialog>

<style>
    dialog {
		border-radius: 0.2em;
		border: none;
		padding: 1em;
        width: fit-content;
        border-radius: 12px;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.7);
	}

    dialog > div {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    button {
        margin: 1em 8px;
        padding: 20px 62px;
        text-transform: uppercase;
        background-color: #353535;
        color: white;
        border: 1px solid #3C6E71;
        border-radius: 6px;
        cursor: pointer;
    }

    dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
</style>
