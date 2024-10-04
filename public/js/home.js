const addForm = document.querySelector("#addForm");
let allCategorias = document.querySelectorAll(".allCategorias");
let categoriasArr = [];

allCategorias.forEach((el) => {
    categoriasArr.push(el.textContent);
});

categoriasArr.sort();

const categoriasSet = new Set(categoriasArr);

categoriasSet.forEach((el) => {
    const html = `<div class="filtro selecionado">${el}</div>`;
    document.querySelector(".filtrar").insertAdjacentHTML("beforeend", html);
});

addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const urlParams = new URLSearchParams(formData);

    const response = await fetch(
        `https://financial-tracker-zeta.vercel.app/add`,
        {
            method: "post",
            body: urlParams,
        }
    );
    const data = await response.json();

    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";

    data.forEach((el) => {
        const date = new Date(el.data);
        const html = `<tr>
        <td class="tipo ${el.tipo}">${el.tipo}</td>
        <td class="valor">${el.valor}</td>
        <td class="${el.categoria}">${el.categoria}</td>
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
                    value="${el.id}"
                />
                <button type="submit">
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </form>

            <button class="editarBtn">
                <i class="bi bi-pencil-fill"></i>
            </button>
        </td>
    </tr>`;

        tbody.insertAdjacentHTML("afterbegin", html);
    });

    getSaldo();
    addForm.reset();
});

document.addEventListener("click", async (e) => {
    if (e.target.closest("button")?.classList.contains("editarBtn")) {
        const el = e.target.closest("button");

        const tr = el.closest("tr");

        const idAtual = tr.querySelector("#idAtual").value;

        const valorAtual = tr.children[1].textContent;
        const categoriaAtual = tr.children[2].textContent;
        const tipoAtual = tr.children[0].textContent;

        if (tr.classList.contains("editando")) {
            const tipoEd = tr.querySelector("#tipoEd").value;
            const dataEd = tr.querySelector("#dataEd").value;
            const valorEd = tr.querySelector("#valorEd").value;
            const categoriaEd = tr.querySelector("#categoriaEd").value;

            const response = await fetch(
                `https://financial-tracker-zeta.vercel.app/editar?tipoEd=${tipoEd}&categoriaEd=${categoriaEd}&valorEd=${valorEd}&dataEd=${dataEd}&idAtual=${idAtual}`
            );
            const data = await response.json();

            const date = new Date(data.data);

            tr.innerHTML = `<td class="tipo ${data.tipo}">${data.tipo}</td>
                                <td class="valor">${data.valor}</td>
                                <td class="${data.categoria}">${
                data.categoria
            }</td>
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

    if (e.target.classList.contains("filtro")) {
        const el = e.target;

        if (
            el.classList.contains("selecionado") &&
            !el.classList.contains("SaídaFiltro") &&
            !el.classList.contains("EntradaFiltro")
        ) {
            el.classList.remove("selecionado");
            document.querySelectorAll(`.${el.textContent}`).forEach((el) => {
                el.closest("tr").classList.add("hidden");
            });
        } else if (
            !el.classList.contains("selecionado") &&
            !el.classList.contains("SaídaFiltro") &&
            !el.classList.contains("EntradaFiltro")
        ) {
            el.classList.add("selecionado");
            document.querySelectorAll(`.${el.textContent}`).forEach((el) => {
                el.closest("tr").classList.remove("hidden");
            });
        }

        // Filtro de Saída
        else if (el.classList.contains("SaídaFiltro")) {
            if (el.classList.contains("selecionado")) {
                el.classList.remove("selecionado");
                document
                    .querySelectorAll(`.${el.textContent}`)
                    .forEach((el) => {
                        el.closest("tr").classList.add("hidden1");
                    });
            } else {
                el.classList.add("selecionado");
                document
                    .querySelectorAll(`.${el.textContent}`)
                    .forEach((el) => {
                        el.closest("tr").classList.remove("hidden1");
                    });
            }
        }

        // Filtro de Entrada
        else if (el.classList.contains("EntradaFiltro")) {
            if (el.classList.contains("selecionado")) {
                el.classList.remove("selecionado");
                document
                    .querySelectorAll(`.${el.textContent}`)
                    .forEach((el) => {
                        el.closest("tr").classList.add("hidden1");
                    });
            } else {
                el.classList.add("selecionado");
                document
                    .querySelectorAll(`.${el.textContent}`)
                    .forEach((el) => {
                        el.closest("tr").classList.remove("hidden1");
                    });
            }
        }
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
    }

    if (entradas.length > 0) {
        entradas.forEach((el) => {
            const valor = Number(
                el.closest("tr").querySelector(".valor").textContent
            );
            entradasArr.push(valor);
        });

        entradasTotal = entradasArr.reduce((acc, cur) => acc + cur);
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
