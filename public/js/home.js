const addForm = document.querySelector("#addForm");
const deletarForm = document.querySelectorAll(".deletarForm");
let categoriasSet;
let myChart;
let myChart1;

addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const urlParams = new URLSearchParams(formData);

    const valor = addForm.querySelector("#valor").value;
    const categoria = addForm.querySelector("#categoria").value;

    if (!valor.trim() || !categoria.trim()) {
        return alert("Preencha todos os campos");
    }

    const response = await fetch(
        `https://financial-tracker-wine-phi.vercel.app/add`,
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
        const html = `<tr class="tr${el.tipo}">
            <td class="tipo ${el.tipo}">${el.tipo}</td>
            <td class="valor">${el.valor}</td>
            <td class="${el.categoria}">${el.categoria}</td>
            <td class="data mes${date.getMonth()} ano${date.getFullYear()}">
                 ${date.toLocaleString("pt-br", {
                     year: "numeric",
                     month: "numeric",
                     day: "numeric",
                 })}
            </td>
            <td class="deletarLinha">
                <form class="deletarForm" action="/deletar" method="post">
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

        tbody.insertAdjacentHTML("beforeend", html);

        const html1 = `<div class="allCategorias hidden">${el.categoria}</div>`;
        document
            .querySelector(".div-categorias")
            .insertAdjacentHTML("beforeend", html1);
    });

    getSaldo();
    createChart();
    classificar();
    setMesesAnos();
    addForm.reset();
});

document.addEventListener("click", async (e) => {
    if (e.target.closest("form")?.classList.contains("deletarForm")) {
        e.preventDefault();
        const tr = e.target.closest("tr");
        const idAtual = tr.querySelector("#idAtual").value;

        const formData = new FormData(e.target.closest("form"));
        const urlParams = new URLSearchParams(formData);

        const response = await fetch(
            `https://financial-tracker-wine-phi.vercel.app/deletar`,
            {
                method: "post",
                body: urlParams,
            }
        );
        const data = await response.json();

        tr.remove();

        const categoria = tr.children[2].textContent;
        document.querySelectorAll(".allCategorias").forEach((el) => {
            const categoriasExistentes = [];
            document.querySelectorAll("tbody tr").forEach((element) => {
                categoriasExistentes.push(
                    element.children[2].textContent.trim()
                );
            });

            if (!categoriasExistentes.includes(el.textContent.trim())) {
                el.remove();
            }
        });

        getSaldo();
        setCategories();
        createChart();
        classificar();
        setMesesAnos();

        const tbody = document.querySelector("tbody");
        if (!tbody.children.length) {
            myChart.destroy();
            document.querySelector("#myChart").classList.add("hidden");
        }
    }
    if (e.target.closest("button")?.classList.contains("editarBtn")) {
        const el = e.target.closest("button");

        const tr = el.closest("tr");

        const idAtual = tr.querySelector("#idAtual").value;

        const valorAtual = tr.children[1].textContent;
        const categoriaAtual = tr.children[2].textContent.trim();
        const tipoAtual = tr.children[0].textContent;

        console.log(categoriaAtual);
        const categoriaAtual1 = categoriaAtual;

        if (tr.classList.contains("editando")) {
            console.log("editando");
            const tipoEd = tr.querySelector("#tipoEd").value.trim();
            const dataEd = tr.querySelector("#dataEd").value.trim();
            const valorEd = tr.querySelector("#valorEd").value.trim();
            const categoriaEd = tr.querySelector("#categoriaEd").value.trim();

            document.querySelectorAll(".allCategorias").forEach((el) => {
                if (el.textContent.trim() == categoriaAtual) {
                    console.log(el);
                }
            });

            const response = await fetch(
                `https://financial-tracker-wine-phi.vercel.app/editar?tipoEd=${tipoEd}&categoriaEd=${categoriaEd}&valorEd=${valorEd}&dataEd=${dataEd}&idAtual=${idAtual}`
            );
            const data = await response.json();

            const date = new Date(data.data);

            tr.classList.remove(...tr.classList);
            tr.classList.add(`tr${data.tipo}`);
            tr.innerHTML = `<td class="tipo ${data.tipo}">${data.tipo}</td>
                                    <td class="valor">${data.valor}</td>
                                    <td class="${data.categoria}">${
                data.categoria
            }</td>
                                    <td class="data mes${date.getMonth()} ano${date.getFullYear()}">
                                        ${date.toLocaleString("pt-br", {
                                            year: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td class="deletarLinha">
                                        <form class="deletarForm" action="/deletar" method="post">
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
            createChart();
            classificar();
            setMesesAnos();
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
        getSaldo();
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
            if (
                !el.closest("tr").classList.contains("hidden") &&
                !el.closest("tr").classList.contains("hidden1") &&
                !el.closest("tr").classList.contains("hidden2") &&
                !el.closest("tr").classList.contains("hidden3")
            ) {
                const valor = Number(
                    el.closest("tr").querySelector(".valor").textContent
                );
                saidasArr.push(valor);
            }
        });

        if (saidasArr.length > 0) {
            saidasTotal = saidasArr.reduce((acc, cur) => acc + cur);
        }
    }

    if (entradas.length > 0) {
        entradas.forEach((el) => {
            if (
                !el.closest("tr").classList.contains("hidden") &&
                !el.closest("tr").classList.contains("hidden1") &&
                !el.closest("tr").classList.contains("hidden2") &&
                !el.closest("tr").classList.contains("hidden3")
            ) {
                const valor = Number(
                    el.closest("tr").querySelector(".valor").textContent
                );
                entradasArr.push(valor);
            }
        });

        if (entradasArr.length > 0) {
            entradasTotal = entradasArr.reduce((acc, cur) => acc + cur);
        }
    }

    entradasTotal = entradasTotal || 0;
    saidasTotal = saidasTotal || 0;

    saldo.textContent = entradasTotal - saidasTotal;

    if (Number(saldo.textContent) > 0) {
        saldo.classList.remove("negativo");
        saldo.classList.add("positivo");
    } else if (Number(saldo.textContent) == 0) {
        saldo.classList.remove("negativo");
        saldo.classList.remove("positivo");
    } else {
        saldo.classList.add("negativo");
        saldo.classList.remove("positivo");
    }
}

if (document.querySelector("table")) {
    getSaldo();
    createChart();
    setCategories();
    setMesesAnos();
}

function createChart() {
    setCategories();
    var xValues = [...categoriasSet];
    var yValues = [];

    categoriasSet.forEach((el) => {
        const valores = [];
        document.querySelectorAll(`.${el.trim()}`).forEach((el) => {
            const tr = el.closest("tr");

            const valor = tr.querySelector(".valor").textContent;
            valores.push(Number(valor));
        });
        const valorTotal = valores.reduce((acc, cur) => {
            return acc + cur;
        }, 0);
        yValues.push(valorTotal);
    });

    function randomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const rgb = `rgb(${r}, ${g}, ${b})`;

        if (barColors.includes(rgb)) {
            return randomColor();
        }

        barColors.push(rgb);
    }

    var barColors = [];

    categoriasSet.forEach((el) => {
        randomColor();
    });

    console.log(barColors);

    if (myChart) {
        myChart.destroy();
    }

    if (myChart1) {
        myChart1.destroy();
    }

    myChart = new Chart("myChart", {
        type: "pie",
        data: {
            labels: xValues,
            datasets: [
                {
                    backgroundColor: barColors,
                    data: yValues,
                },
            ],
        },
    });

    let entradasArr = [];
    let saidasArr = [];

    document.querySelectorAll(".Entrada").forEach((el) => {
        const valor = Number(
            el.closest("tr").querySelector(".valor").textContent
        );
        console.log(valor);
        entradasArr.push(valor);
    });

    document.querySelectorAll(".Saída").forEach((el) => {
        const valor = Number(
            el.closest("tr").querySelector(".valor").textContent
        );
        console.log(valor);
        saidasArr.push(valor);
    });

    let entradasTotal;
    let saidasTotal;

    if (entradasArr.length > 0) {
        entradasTotal = entradasArr.reduce((acc, cur) => {
            return acc + cur;
        }, 0);
    }
    if (saidasArr.length > 0) {
        saidasTotal = saidasArr.reduce((acc, cur) => {
            return acc + cur;
        }, 0);
    }

    console.log(entradasTotal);
    console.log(saidasTotal);

    entradasTotal = entradasTotal || 0;
    saidasTotal = saidasTotal || 0;

    const valorMax = entradasTotal + entradasTotal / 2;

    var xValues1 = ["Entradas", "Saídas"];
    var yValues1 = [entradasTotal, saidasTotal, 0];
    var barColors1 = ["green", "red"];

    myChart1 = new Chart("myChart1", {
        type: "bar",
        data: {
            labels: xValues1,
            datasets: [
                {
                    backgroundColor: barColors1,
                    data: yValues1,
                },
            ],
        },
        options: {
            legend: { display: false },
            title: {
                display: false,
            },
        },
    });

    const tbody = document.querySelector("tbody");

    document.querySelector("#myChart").classList.remove("hidden");
    document.querySelector("#myChart1").classList.remove("hidden");

    if (!tbody.children.length) {
        myChart.destroy();
        myChart1.destroy();
        document.querySelector("#myChart").classList.add("hidden");
        document.querySelector("#myChart1").classList.add("hidden");
    }
}

function setCategories() {
    let categoriasArray = [];
    document.querySelectorAll("tbody tr").forEach((el) => {
        const categoria = el.children[2].textContent.trim();
        categoriasArray.push(categoria);
    });

    categoriasArray.sort();

    categoriasSet = new Set(categoriasArray);

    document.querySelector(".filtrar").innerHTML = `
                    <div class="SaídaFiltro filtro selecionado">Saída</div>
                    <div class="EntradaFiltro filtro selecionado">Entrada</div>
                `;

    categoriasSet.forEach((el) => {
        const html = `<div class="filtro selecionado">${el.trim()}</div>`;

        document
            .querySelector(".filtrar")
            .insertAdjacentHTML("beforeend", html);
    });
}
if (document.querySelector("#classificar")) {
    document.querySelector("#classificar").addEventListener("input", () => {
        classificar();
    });
}

function classificar() {
    const classificado = Number(document.querySelector("#classificar").value);
    const datas = [];
    document.querySelectorAll("tbody tr").forEach((el, i) => {
        const dataStr = el.querySelector(".data").textContent.trim();
        const partesData = dataStr.split("/");
        const dataObj = new Date(
            `${partesData[2]},${partesData[1]},${partesData[0]}`
        );
        datas.push({
            data: dataObj,
            index: i,
            valor: Number(el.querySelector(".valor").textContent),
            row: el,
        });
    });

    switch (classificado) {
        case 1:
            datas.sort((a, b) => {
                return b.data - a.data;
            });
            break;

        case 2:
            datas.sort((a, b) => {
                return a.data - b.data;
            });

            break;
        case 3:
            datas.sort((a, b) => {
                return b.valor - a.valor;
            });

            break;
        case 4:
            datas.sort((a, b) => {
                return a.valor - b.valor;
            });

            break;

        default:
            break;
    }

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    datas.forEach((el) => {
        tbody.appendChild(el.row);
    });
}

function setMesesAnos() {
    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const meses = [];
    const anos = [];

    document.querySelectorAll("tbody tr .data").forEach((el) => {
        const partesData = el.textContent.trim().split("/");

        const mes = new Date(
            `${partesData[2]}-${partesData[1]}-${partesData[0]}`
        ).getMonth();
        const ano = new Date(
            `${partesData[2]}-${partesData[1]}-${partesData[0]}`
        ).getFullYear();

        meses.push(mes);
        anos.push(ano);
    });

    meses.sort((a, b) => a - b);
    anos.sort((a, b) => a - b);

    const mesesSet = new Set(meses);
    const anosSet = new Set(anos);

    document.querySelector(
        "#visualizarMeses"
    ).innerHTML = `<option value="todos">Todos</option>`;
    document.querySelector(
        "#visualizarAnos"
    ).innerHTML = `<option value="todos">Todos</option>`;

    mesesSet.forEach((el) => {
        const html = `<option value="${el}">${monthNames[el]}</option>`;
        document
            .querySelector("#visualizarMeses")
            .insertAdjacentHTML("beforeend", html);
    });

    anosSet.forEach((el) => {
        const html = `<option value="${el}">${el}</option>`;
        document
            .querySelector("#visualizarAnos")
            .insertAdjacentHTML("beforeend", html);
    });

    const visualizarMeses = document.querySelector("#visualizarMeses");
    visualizarMeses.addEventListener("input", () => {
        const mes = visualizarMeses.value;
        if (mes == "todos") {
            document.querySelectorAll("tbody tr").forEach((el) => {
                el.classList.remove("hidden2");
            });
            getSaldo();
            classificar();
            return;
        }

        document.querySelectorAll("tbody tr").forEach((el) => {
            if (!el.querySelector(`.mes${mes}`)) {
                return el.classList.add("hidden2");
            }

            el.classList.remove("hidden2");
        });
        getSaldo();
        classificar();
    });

    const visualizarAnos = document.querySelector("#visualizarAnos");
    visualizarAnos.addEventListener("input", () => {
        const ano = visualizarAnos.value;

        if (ano == "todos") {
            document.querySelectorAll("tbody tr").forEach((el) => {
                el.classList.remove("hidden3");
            });
            getSaldo();
            classificar();
            return;
        }

        document.querySelectorAll("tbody tr").forEach((el) => {
            if (!el.querySelector(`.ano${ano}`)) {
                return el.classList.add("hidden3");
            }

            el.classList.remove("hidden3");
        });
        getSaldo();
        classificar();
    });
}
