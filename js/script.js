let reg = document.querySelector('.reg');
let auth = document.querySelector('.auth');

reg.style.display = 'flex';

function toggleForm() {
    if (reg.style.display === 'flex') {
        reg.style.display = 'none';
        auth.style.display = 'flex';
    } else {
        reg.style.display = 'flex';
        auth.style.display = 'none';
    }
}


function showModal() {
    const modalWindow = document.querySelector('.modal-window'); // Берём первый найденный элемент
    const screen = document.querySelector('.screen'); // Берём экран

    if (modalWindow && screen) {
        modalWindow.style.display = 'flex';
        modalWindow.style.transform = 'translateY(100px)';
        modalWindow.style.opacity = '1';

        screen.style.display = 'flex';
        screen.style.opacity = '1';
    } else {
        console.error('Modal window or screen not found');
    }
}

function closeModal() {
    const modalWindow = document.querySelector('.modal-window'); // Берём первый найденный элемент
    const screen = document.querySelector('.screen'); // Берём экран

    if (modalWindow && screen) {
        modalWindow.style.display = 'none';
        modalWindow.style.transform = 'translateY(-100px)';
        modalWindow.style.opacity = '0';

        screen.style.display = 'none';
        screen.style.opacity = '0';
    } else {
        console.error('Modal window or screen not found');
    }
}

async function checkUserExists(name) {
    try {
        let response = await fetch(`http://127.0.0.1:8000/users/${name}`);
        return response.ok; // true, если пользователь найден
    } catch (error) {
        console.error("Ошибка запроса:", error);
        return false;
    }
}

async function addUser() {
    let name = document.getElementById("name").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;
    let resultText = document.getElementById("result"); // Место для вывода сообщения

    if (!name || !password || !confirmPassword) {
        resultText.innerText = "Заполните все поля!";
        showModal();
        return;
    }
    if (password !== confirmPassword) {
        resultText.innerText = "Пароли не совпадают!";
        showModal();
        return;
    }
    if (await checkUserExists(name)) {
        resultText.innerText = "Пользователь уже существует!";
        showModal();
        return;
    }
    resultText.innerText = "Все данные заполнены верно.";
    showModal();

    // Добавляем обработчик закрытия модального окна, который отправит запрос
    document.querySelector('.close').onclick = async function() {
        closeModal();
        
        let userData = { name, password };

        try {
            let response = await fetch("http://127.0.0.1:8000/users/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                let data = await response.json();
                alert("Пользователь добавлен: " + JSON.stringify(data)); // Уведомление после закрытия окна
            } else {
                let errorData = await response.json();
                alert("Ошибка: " + errorData.detail);
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
            alert("Ошибка соединения с сервером");
        }
    };
}

async function authUser() {
    let authname = document.getElementById("authname").value;
    let authpassword = document.getElementById("authpassword").value;
    let resultText = document.getElementById("result");

    if (!authname || !authpassword) {
        resultText.innerText = "Заполните все поля!";
        showModal();
        return;
    }

    try {
        let response = await fetch("http://127.0.0.1:8000/auth/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: authname, password: authpassword })
        });

        let data = await response.json(); 
        console.log("Ответ сервера:", data); // Проверяем, что пришло от сервера

        if (response.ok) {
            alert("Добро пожаловать, " + data.user);
        } else {
            alert("Ошибка: " + data.detail);
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
        alert("Ошибка соединения с сервером");
    }
}
