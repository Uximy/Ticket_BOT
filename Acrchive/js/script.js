document.addEventListener('DOMContentLoaded', function() {
    let userPopout = null;
    let clicked = false;
    let xPosition = 0;
    let yPosition = 0;

    function handleNameClick(event, {userName, avatarURL, discriminator, badge, createdAccount, countMessages}) {
        if (!clicked) {
            // Создаем новый экземпляр блока user-popout только если его еще нет
            if (!userPopout) {
                userPopout = document.createElement('div');
                userPopout.className = 'user-popout';

                // 14/01/2017
                const date = new Date(createdAccount);

                // Функция, чтобы добавить ноль перед числами меньше 10
                function addZero(num) {
                    return (num < 10 ? '0' : '') + num;
                }

                // Получение необходимых значений даты
                const day = addZero(date.getDate());
                const month = addZero(date.getMonth() + 1); // Месяцы в JavaScript начинаются с 0
                const year = date.getFullYear();

                // Формирование строки с новым форматом
                const formattedDate = `${day}/${month}/${year}`;
                // Добавляем вёрстку в user-popout
                userPopout.innerHTML = `
                    <div class="header-User">
                        <img src="${avatarURL}" alt="avatar">
                        <div class="details">
                            <div class="username">${userName}</div>
                            <div class="discriminator">${discriminator}</div>
                            <div class="badge">${badge != 'false' ? 'BOT' : ''}</div>
                        </div>
                    </div>
                    <div class="body">
                        <div class="field">
                            <div class="title">Account Creation Date</div>
                            <div class="value">${formattedDate}</div>
                        </div>
                        <div class="field">
                            <div class="title">Messages Count</div>
                            <div class="value">${countMessages}</div>
                        </div>
                    </div>
                `;
                
                // Вставляем блок user-popout в body
                document.body.appendChild(userPopout);
            }
            
            const rect = event.target.getBoundingClientRect();
            const popoutWidth = userPopout.offsetWidth;
            const popoutHeight = userPopout.offsetHeight;
            
            xPosition = Math.min(rect.right + 10, window.innerWidth - popoutWidth);
            // yPosition = Math.min(rect.top, window.innerHeight - popoutHeight - 15);
            yPosition = Math.min(event.pageY, window.innerHeight - popoutHeight - 15 + window.scrollY) - 5;

            userPopout.style.left = xPosition + 'px';
            userPopout.style.top = yPosition + 'px';
            
            // Добавляем класс mounted с задержкой для воспроизведения анимации
            setTimeout(() => {
                userPopout.classList.add('mounted');
            }, 100);

            clicked = true;
        } else {
            // Удаляем готовую вёрстку только если userPopout существует
            if (userPopout) {
                userPopout.remove();
                userPopout = null;
            }
            clicked = false;
        }
    }

    document.addEventListener('click', function(event) {
        if (userPopout) {
            const isClickInsidePopout = event.target.closest('.user-popout');
            if (!isClickInsidePopout && !event.target.classList.contains('user-name') && !event.target.classList.contains('bot-name')) {
                userPopout.remove();
                userPopout = null;
                clicked = false;
            }
        }
    });

    const userNames = document.querySelectorAll('.user-name, .bot-name');
    userNames.forEach(function(name) {
        name.addEventListener('click', (event) => {
            const userInfo = document.getElementById(`userName-${event.target.getAttribute('data-id')}`),
                userName = userInfo.getAttribute('data-userName'),
                avatarURL = userInfo.getAttribute('data-avatarURL'),
                discriminator = userInfo.getAttribute('data-discriminator'),
                badge = userInfo.getAttribute('data-badge'),
                createdAccount = userInfo.getAttribute('data-createdAccount'),
                countMessages = userInfo.getAttribute('data-countMessages');
            handleNameClick(event, {userName, avatarURL, discriminator, badge, createdAccount, countMessages})
        } );
        
    });
});