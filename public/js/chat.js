const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlTemplate = document.querySelector('#url-template').innerHTML
const sidebarTemplate =document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix: true })

const autoscroll = ()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(urlTemplate,{
        username:url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('H:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('viesti',(viesti)=>{
    //debugger
    console.log(viesti)
    const html = Mustache.render(messageTemplate,{
        username: viesti.username,
        viesti: viesti.text,
        createdAt: moment(viesti.createdAt).format('H:mm',)
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const viesti = e.target.elements.message.value
    socket.emit('viesti',viesti,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('viesti toimitettu')
    })
})

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('Not for old farts')
    }
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        const osoite =  {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }
        socket.emit('locationMessage',osoite,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('osoite jaettu')
        })
    })
})


socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})