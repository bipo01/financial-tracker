const lembrarCheckBox = document.querySelector("#lembrar");
const username = document.querySelector("#username");
const password = document.querySelector("#password");

if (localStorage.getItem("lembrar")) {
    lembrarCheckBox.checked = "true";
    username.value = localStorage.getItem("username");
    password.value = localStorage.getItem("password");
}

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (lembrarCheckBox.checked) {
        localStorage.setItem("username", username.value);
        localStorage.setItem("password", password.value);
        localStorage.setItem("lembrar", "true");
    } else {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        localStorage.removeItem("lembrar");
    }

    document.querySelector("form").submit();
});
