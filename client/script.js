import bot from './assets/bot.svg'
import user from './assets/user.svg'
import React, { useState, useEffect } from 'react'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) 
{
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) 
{
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() 
{
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) 
{
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}


const handleSubmit = async (e) => 
{
    e.preventDefault()

    const data = new FormData(form)

    const userMessage = data.get('prompt')

     // Verifica se nella frase inserita dall'utente non è presente la parola "viaggio" o la parola "vacanza"
    if (!userMessage.includes("viaggio") && !userMessage.includes("vacanza")) 
    {
        // Se non è presente, mostra il messaggio "Non so rispondere a questa domanda" con la stessa animazione degli altri messaggi del bot

        // Aggiungi la chatstripe dell'utente
        chatContainer.innerHTML += chatStripe(false, userMessage);

        // Svuota la textarea
        form.reset();

        // Aggiungi la chatstripe del bot
        const uniqueId = generateUniqueId();
        chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

        // Porta lo scroll in fondo alla chat
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Prendi il div del messaggio del bot
        const messageDiv = document.getElementById(uniqueId);

        // Mostra il messaggio di caricamento
        loader(messageDiv);

        // Attendi che il messaggio "Non so rispondere a questa domanda" sia scritto con l'effetto di battitura
        setTimeout(() => {
        clearInterval(loadInterval);
        messageDiv.innerHTML = "";
        typeText(messageDiv, "Mi è consentito rispondere solo a domande inerenti a vacanze o viaggi.");
        }, 1000);

        return;
    }

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, userMessage)

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('https://mipeverytime.onrender.com', 
    {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) 
    {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n'
        
        console.log({parsedData})

        typeText(messageDiv, parsedData)
    } else 
    {
        const err = await response.text()

        setTimeout(() => {
            clearInterval(loadInterval);
            messageDiv.innerHTML = "";
            typeText(messageDiv, "Il server non risponde. Ricaricare la pagina.");
            }, 1000);
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => 
{
    if (e.keyCode === 13) 
    {
        handleSubmit(e)
    }
})



function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const [options, setOptions] = useState([])
  const [showOptions, setShowOptions] = useState(false)

  const handleSearch = event => {
    setSearchTerm(event.target.value)
  }

  useEffect(() => {
    if (!searchTerm) {
      setOptions([])
      setShowOptions(false)
      return
    }

    fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchTerm}&types=establishment&key=AIzaSyB-Aa2zaH2SW2gJeYxqdWRZGXzOWtez8_Q`
    )
      .then(response => response.json())
      .then(data => {
        setOptions(data.predictions.map(prediction => prediction.description))
        setShowOptions(true)
      })
  }, [searchTerm])

  return (
    <div className="SearchBar">
      <input type="text" value={searchTerm} onChange={handleSearch} style={{ textAlign: 'center' }} />
      {showOptions && (
        <ul className="options">
          {options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchBar