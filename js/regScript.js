function close() {
    const modalWindow = document.getElementsByClassName('modal-window')
    const screen = document.getElementById('screen')
    modalWindow.style.display = 'none'
    modalWindow.style.transform = 'translateY(100px)'
    modalWindow.style.opacity = '0'
    screen.style.display = 'none'
    screen.style.opacity = '0'
}
async function addUser() {
    let name = document.getElementById("name").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (!name || !password || !confirmPassword) {
        document.getElementById("result").innerText = "Заполните все поля!"
        const modalWindow = document.getElementsByClassName('modal-window')
        const screen = document.getElementById('screen')
        modalWindow.style.display = 'flex'
        modalWindow.style.transform = 'translateY(100px)'
        modalWindow.style.opacity = '1'
        screen.style.display = 'flex'
        screen.style.opacity = '1'
    } else if (password !== confirmPassword) {
        document.getElementById("result").innerText = "Пароли не совпадают!"
        const modalWindow = document.getElementsByClassName('modal-window')
        const screen = document.getElementById('screen')
        modalWindow.style.display = 'flex'
        modalWindow.style.transform = 'translateY(100px)'
        modalWindow.style.opacity = '1'
        screen.style.display = 'flex'
        screen.style.opacity = '1'
    }

    let userData = { name, password };

    try {
        let response = await fetch("http://127.0.0.1:8000/users/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            let data = await response.json();
            document.getElementById("result").innerText = "Пользователь добавлен: " + JSON.stringify(data);
        } else {
            let errorData = await response.json();
            document.getElementById("result").innerText = "Ошибка: " + errorData.detail;
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
        document.getElementById("result").innerText = "Ошибка соединения с сервером";
    }
}