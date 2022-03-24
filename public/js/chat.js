const socket=io()

const $messageForm=document.querySelector('#client_message')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationButton=document.querySelector('#client_location')
const $messages=document.querySelector('#messages')

const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const { username, room }=Qs.parse(location.search, { ignoreQueryPrefix:true })

const autoscroll=()=>{
    const $newMessage=$messages.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    const visibleHeight=$messages.offsetHeight

    const containerHeight=$messages.scrollHeight

    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset+1){
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('Message',(message)=>{
    console.log(message)
    
    const html=Mustache.render(messageTemplate, {
        username:message.username,
        textMessage:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{
    console.log(url)

    const html=Mustache.render(locationTemplate, {
        username:message.username,
        url:url.locationURL,
        createdAt:moment(url.createdAt).format('h:mm A')        
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users        
    })

    document.querySelector('#sideBar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    const clientMessage=e.target.elements.message.value

    $messageFormInput.value=''
    $messageFormInput.focus()
    $messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', clientMessage, (error)=>{
        $messageFormButton.removeAttribute('disabled')

        if(error){
            return console.log(error)
        }

        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your browser doesn\'t support geolocation')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location shared!')
            $locationButton.removeAttribute('disabled')
        })
    },(error)=>{
        console.log(error.message)
        $locationButton.removeAttribute('disabled')
    },{
        timeout:70000,
        enableHighAccuracy:true,
        maximumAge:60000
    })
})

socket.emit('join', { username, room }, (error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})