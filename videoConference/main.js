let APP_ID = "c987605eb76e4dfb82928d0499fecaff"

let token = null;
let uid = String(Math.floor(Math.random() * 10000))
let client;
let channel;
 

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls:['stun:stun1.l.google.com:19302' , 'stun:stun2.l.google.com:19302']
        }
    ]
}
async function init() {
    client = await AgoraRTM.createInstance(APP_ID)
    await client.login({uid, token})

    channel = client.createChannel('main')
    await channel.join()

    channel.on('MemberJoined', handleUserJoined)

    client.on('MessageFromPeer', handleMessageFromPeer)

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    document.getElementById('user-1') = localStream;
}

let handleMessageFromPeer = async (message, MemberId) => {
    message =JSon.parse(message.text)
    console.log('Message:', message)
}

let handleUserJoined = async (MemberId) => {
    console.log('A new user joined the channel :' , MemberId)
    createOffer(MemberId);
}

async function createOffer(MemberId) {
    peerConnection = new RTCPeerConnection(servers)

    remoteStream = new MediaStream()
    document.getElementById('user-2').srcObject = remoteStream

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track,localStream)
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track)=> {
            remoteStream.addTrack (track )
        })
    }

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId)
        }
    }

        let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer)

    //console.log('Offer:', offer)
    client.sendMessageToPeer({text:JSON.stringify({'type':'offer','offer':offer})},MemberId)
}

 

init()




// import AC from 'agora-chat';
// const conn = new AC.connections({
//     appKey: '<your app key>',
// });
// const options = {
//     user: 'userID',
//     agoraToken: 'agoraToken',
// };
// conn.open(options);
// let option = {
//     chatType: 'singleChat',
//     type: 'txt',
//     to: 'userID',
//     msg: 'message content',
// };
// let msg = AC.message.create(option);
// conn.send(msg)
//     .then(() => {
//         console.log('send private text Success');
//     })
//     .catch((e) => {
//         console.log('Send private text error');
//     });