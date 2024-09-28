import './App.css';
import Contact from './Components/contact';
import Message from './Components/message';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

function App() {
  const xhr = new XMLHttpRequest();
  let contacts = []
  const [contact, setContact] = useState([])
  const [message, setMessage] = useState([])
  let logreg = 'log'
  let regHead
  let loginHead
  let errorTxt
  let mainUserName
  let mainUserPass
  let mainUserID
  let mainUserTag
  let currentContactID
  let currentContactTag

  const socket = io('http://localhost:4000'); // Убедитесь, что этот URL соответствует вашему серверу

  useEffect(() => {
      // Слушаем событие, отправленное сервером
      socket.on('eventTriggered', (data) => {
        if(data.tag == '@'+mainUserTag) {
          updateHistory(mainUserName, mainUserID, data.tag, data.content, false)
        }
      })
      // Очистка эффекта при размонтировании
      return () => {
          socket.off('eventTriggered');
      };
  }, []);

  function sendMessage() {
    const messageInput = document.getElementById('msg-input')
    
    if(messageInput.value != '') {
      let content = messageInput.value
      messageInput.value = ''
      socket.emit('messageSended', { tag: currentContactTag, content: content });
      updateHistory(mainUserName, mainUserID, currentContactTag, content, false)
    }
  }

  function login() {
    const nameInput = document.getElementById('name-input')
    const passInput = document.getElementById('password-input')
    const tagInput = document.getElementById('tag-input')
    errorTxt = document.getElementById('error-txt')
    const addcBtn = document.getElementById('addc')

    mainUserName = nameInput.value
    mainUserPass = passInput.value
    mainUserTag = tagInput.value
    mainUserID = getId(mainUserName, mainUserPass, mainUserTag)

    const sendBtn = document.getElementById('send-btn')
    sendBtn.onclick = () => {sendMessage()}

    addcBtn.onclick = () => {addContact()}

    if(mainUserTag.includes('@')) {
      errorTxt.innerHTML = 'Введите тэг без @!'
    } else {
      if(logreg == 'log') {
        loadContacts(mainUserName, mainUserPass, mainUserTag)
      } else {
        xhr.open('GET', 'https://xeramiclub.ru/reg.php?name='+mainUserName+'&password='+mainUserPass+'&tag='+'@'+mainUserTag, false)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.send()
        
        let response = JSON.parse(xhr.response)

        if(response.state == true) {
          loadContacts(mainUserName, mainUserPass, mainUserTag)
        }
      }
    }
  }
  
  function loadContacts(name, password, tag) {
    const loginBox = document.getElementsByClassName('login-box')[0]

    console.log(mainUserName, mainUserID, mainUserTag)
    xhr.open('GET', 'https://xeramiclub.ru/contacts/server.php?name='+name+'&password='+password+'&tag='+'@'+tag, false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()
    
    let response = JSON.parse(xhr.response)

    if (response.state !== false) {
      const contactNames = []
      const contactLogos = []
      const contactIds = []
      const contactTags = []

      response.forEach(element => {
        contactNames.push(element.name)
        contactLogos.push(element.avatar)
        contactIds.push(element.id)
        contactTags.push(element.tag)
      });
      contacts = []
      for (let index = 0; index < contactNames.length; index++) {
        const name = contactNames[index]
        const avatar = contactLogos[index]
        const id = contactIds[index]
        const tag = contactTags[index]
        contacts.push(<Contact key={id} onClick={() => openChat(id, mainUserTag)} contactID={id} avatarURL={avatar} contactName={name}/>)
      }
      
      loginBox.style.display = 'none'
      setContact(contacts)
      
    } else {
      errorTxt.innerHTML = 'Неверный логин или пароль!'
    }
  }

  function getId(name, password, tag) {
    xhr.open('GET', 'https://xeramiclub.ru/getid.php?name='+name+'&password='+password+'&tag='+'@'+tag, false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()

    let response = JSON.parse(xhr.response)
    return response.id
  }

  function getTag(id) {
    xhr.open('GET', 'https://xeramiclub.ru/gettag.php?id='+id, false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()

    let response = JSON.parse(xhr.response)
    return response.tag
  }

  function openChat(contactId, tag, name, password) {
    xhr.open('GET', 'https://xeramiclub.ru/history/server.php?tag='+'@'+tag+'&contactId='+contactId, false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()
    
    let response = JSON.parse(xhr.response)
    currentContactID = contactId
    currentContactTag = getTag(currentContactID)

    const messages = []
    let inputMessages = response[contactId]
    inputMessages.forEach(element => {
      messages.push(<Message author={element.author} content={element.content} date={element.date}/>)
    });
    setMessage(messages)
  }

  function addContact() {
    const contactInput = document.getElementById('addc-input')
    const contactOutput = document.getElementById('addc-output')
    xhr.open('GET', 'https://xeramiclub.ru/addc.php?id='+mainUserID+'&tag='+contactInput.value, false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send()

    let response = JSON.parse(xhr.response)

    if(response.state == false) {
      contactOutput.innerHTML = 'Ошибка, попробуйсте снова!'
    } else {
      contactOutput.innerHTML = 'Контакт успешно добавлен!'
      loadContacts(mainUserName, mainUserPass, mainUserTag)
      updateHistory(mainUserName, mainUserID, contactInput.value, '', true)
    }
  }

  function updateHistory(name, id, tag, content, isFirst) {
    let data = {
      "name": name,
      "id": id,
      "contactTag": tag,
      "content": content,
    }

    xhr.open('POST', 'https://xeramiclub.ru/addh.php', false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify(data))

    if(!isFirst) {
      let response = JSON.parse(xhr.response)
      const messages = []
      let inputMessages = response[currentContactID]
      inputMessages.forEach(element => {
        messages.push(<Message author={element.author} content={element.content} date={element.date}/>)
      });
      setMessage(messages)
    }
  }

  return (
    <div className="container">
      <div className="top-bar">
        <h1 id="top-contact-name">Xeramic</h1>
      </div>
      <div className="left-bar-menu">
            <button className="back-btn">
                <img src="./images/left=point.png" />
            </button>
            <img src="./images/xeramic.png" class="my-avatar" />
        </div>
        <div className="left-bar">
            <div className="bar-header">
                <button id="menu-btn">☰</button>
                <input type="text" id='search-input' placeholder="Поиск" />
            </div>
            <div className="contacts-box">
                {contact}
            </div>
        </div>
        <div className='msg-box'>
          {message}
        </div>
        <div className="right-bar">
          <p id='addc-output'></p>
          <input type='text' id='addc-input'></input>
          <button id='addc'>+</button>
        </div>
        <div className="bottom-bar">
          <input type="text" id="msg-input" placeholder="Введите сообщение..."></input>
          <button id="send-btn">{'>'}</button>
        </div>
        <div className="login-box">
          <div id='reg-head'>
            <h1 className="login-text">Зарегестрируйте новый аккаунт.</h1>
            <p id='reg-txt'>Или <a onClick={() => {
              regHead = document.getElementById('reg-head')
              loginHead = document.getElementById('login-head')
              regHead.style.display = 'none'; 
              loginHead.style.display = 'block';
              logreg='log';}}>войдите</a> в существующий</p>
          </div>
          <div id='login-head'>
            <h1 className="login-text">Войдите в аккаунт.</h1>
            <p id='reg-txt'>Или <a onClick={() => {
              loginHead = document.getElementById('login-head')
              regHead = document.getElementById('reg-head')
              loginHead.style.display = 'none'; 
              regHead.style.display = 'block';
              logreg='reg';}}>зарегестрируйтесь</a></p>
          </div>
          <p id='error-txt'></p>
          <div className='name-bar'>
              <p className='enter-name'>Имя пользователя</p>
              <input type='text' id='name-input' placeholder='Введите имя...'></input>
          </div>
          <div className='tag-bar'>
              <p className='enter-tag'>Введите тэг (без @)</p>
              <input type='text' id='tag-input' placeholder='Введите уникальный тэг...'></input>
          </div>
          <div className='password-bar'>
              <p className='enter-password'>Пароль</p>
              <input type='password' id='password-input' placeholder='Введите пароль...'></input>
          </div>
          <button className='enter-login' id='login' onClick={() => login()}>Войти в аккаунт</button>
        </div>
    </div>
  );
}

export default App;