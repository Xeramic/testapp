import React from 'react';

function Login(props) {
    return (
        <div className="login-box">
            <h1 className="login-text">Войдите в аккаунт.</h1>
            <p id='reg-txt'>Или <a>зарегестрируйтесь</a></p>
            <p id='error-txt'></p>
            <div className='name-bar'>
                <a className='enter-name'>Имя пользователя</a>
                <input type='text' id='name-input' placeholder='Введите имя...'></input>
            </div>
            <div className='password-bar'>
                <a className='enter-password'>Пароль</a>
                <input type='text' id='password-input' placeholder='Введите пароль...'></input>
            </div>
            <button className='enter-login' id='login'>Войти в аккаунт</button>
        </div>
    )
}

export default Login