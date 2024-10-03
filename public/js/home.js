document.addEventListener("click", async (e) => {
    if (e.target.closest("button")?.classList.contains("editarBtn")) {
        const el = e.target.closest("button");

        const tr = el.closest("tr");

        console.log(tr);

        const idAtual = tr.querySelector("#idAtual").value;

        const valorAtual = tr.children[1].textContent;
        const categoriaAtual = tr.children[2].textContent;
        const tipoAtual = tr.children[0].textContent;

        console.log(tipoAtual);

        if (tr.classList.contains("editando")) {
            const tipoEd = tr.querySelector("#tipoEd").value;
            const dataEd = tr.querySelector("#dataEd").value;
            const valorEd = tr.querySelector("#valorEd").value;
            const categoriaEd = tr.querySelector("#categoriaEd").value;

            console.log(tipoEd);
            console.log(dataEd);
            console.log(valorEd);
            console.log(categoriaEd);

            const response = await fetch(
                `https://financial-tracker-zeta.vercel.app/editar?tipoEd=${tipoEd}&categoriaEd=${categoriaEd}&valorEd=${valorEd}&dataEd=${dataEd}&idAtual=${idAtual}`
            );
            const data = await response.json();
            console.log(data);

            const date = new Date(data.data);

            tr.innerHTML = `<td class="${data.tipo}">${data.tipo}</td>
                                <td class="valor">${data.valor}</td>
                                <td>${data.categoria}</td>
                                <td>
                                    ${date.toLocaleString("pt-br", {
                                        year: "numeric",
                                        month: "numeric",
                                        day: "numeric",
                                    })}
                                </td>
                                <td class="deletarLinha">
                                    <form action="/deletar" method="post">
                                        <input
                                            type="hidden"
                                            name="idAtual"
                                            id="idAtual"
                                            value="${data.id}"
                                        />
                                        <button type="submit">
                                            <i class="bi bi-trash3-fill"></i>
                                        </button>
                                    </form>
    
                                    <button class="editarBtn">
                                        <i class="bi bi-pencil-fill"></i>
                                    </button>
                                </td>`;

            tr.classList.remove("editando");
            getSaldo();
            return;
        }

        tr.classList.add("editando");

        tr.children[0].innerHTML = `
            <select id="tipoEd">
                <option value="Entrada" ${
                    tipoAtual == "Entrada" ? "selected" : ""
                }>Entrada</option>
                <option value="Saída" ${
                    tipoAtual == "Saída" ? "selected" : ""
                }>Saída</option>
            </select>
            `;
        tr.children[1].innerHTML = `<input type="number" id="valorEd" value="${valorAtual}"/>`;
        tr.children[2].innerHTML = `<input type="text" id="categoriaEd" value="${categoriaAtual}"/>`;
        tr.children[3].innerHTML = `
            <input type="date" id="dataEd" />
            `;

        el.innerHTML = `<i class="bi bi-check-square-fill"></i>`;
    }
});

function getSaldo() {
    const saldo = document.querySelector("#saldo");
    const saidas = document.querySelectorAll(".Saída");
    const entradas = document.querySelectorAll(".Entrada");

    const saidasArr = [];
    const entradasArr = [];

    let entradasTotal;
    let saidasTotal;

    if (saidas.length > 0) {
        saidas.forEach((el) => {
            const valor = Number(
                el.closest("tr").querySelector(".valor").textContent
            );
            saidasArr.push(valor);
        });

        saidasTotal = saidasArr.reduce((acc, cur) => acc + cur);
        console.log(saidasTotal);
    }

    if (entradas.length > 0) {
        entradas.forEach((el) => {
            const valor = Number(
                el.closest("tr").querySelector(".valor").textContent
            );
            entradasArr.push(valor);
        });

        entradasTotal = entradasArr.reduce((acc, cur) => acc + cur);
        console.log(entradasTotal);
    }

    entradasTotal = entradasTotal || 0;
    saidasTotal = saidasTotal || 0;

    saldo.textContent = entradasTotal - saidasTotal;

    if (Number(saldo.textContent) > 0) {
        saldo.classList.remove("negativo");
        saldo.classList.add("positivo");
    } else {
        saldo.classList.add("negativo");
        saldo.classList.remove("positivo");
    }
}

getSaldo();
