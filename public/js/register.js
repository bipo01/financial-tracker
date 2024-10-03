const registerForm = document.querySelector("#registerForm");
const name = document.querySelector("#name");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const passwordC = document.querySelector("#passwordC");

registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const passwordValue = password.value.trim();
    const passwordCValue = passwordC.value.trim();

    if (
        name.value.trim().length &&
        username.value.trim().length &&
        passwordValue.length &&
        passwordCValue.length
    ) {
        if (passwordValue.length >= 4) {
            if (passwordValue == passwordCValue) {
                registerForm.submit();
            } else {
                alert("As senhas estão diferentes!");
            }
        } else {
            alert("A senha deve ter pelo menos 4 dígitos!");
        }
    } else {
        alert("Preencha todos os campos!");
    }
});
