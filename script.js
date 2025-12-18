const peer = new Peer();
let localStream;
let currentCall;
let mediaRecorder;
let recordedChunks = [];

// Video elements
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

// Get User Media
navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;
});

// Peer Connection
peer.on('open', id => { document.getElementById('my-id').innerText = id; });
peer.on('call', call => {
    call.answer(localStream);
    call.on('stream', stream => { remoteVideo.srcObject = stream; });
    currentCall = call;
});

// Call Friend
function connectToFriend() {
    const friendId = document.getElementById('remote-id').value;
    const call = peer.call(friendId, localStream);
    call.on('stream', stream => { remoteVideo.srcObject = stream; });
    currentCall = call;
    
    // Connect Data for Chat
    const conn = peer.connect(friendId);
    setupChat(conn);
}

// ✨ NEW FEATURE: Filters
function applyFilter(filterType) {
    localVideo.className = "w-full h-full object-cover transition-all duration-500 " + filterType;
}

// 🔴 NEW FEATURE: Recording
function recordSession() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        alert("Recording saved to your downloads!");
    } else {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(localStream);
        mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "vibe-record.webm";
            a.click();
        };
        mediaRecorder.start();
        alert("Recording Started! 🔴");
    }
}

// Toggle Buttons
function toggleAudio() {
    const enabled = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !enabled;
    document.getElementById('audio-btn').classList.toggle('opacity-50');
}

function toggleVideo() {
    const enabled = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !enabled;
    document.getElementById('video-btn').classList.toggle('opacity-50');
}

// Screen Share
async function startScreenShare() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
    if (currentCall) {
        let videoSender = currentCall.peerConnection.getSenders().find(s => s.track.kind === 'video');
        videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
    }
}

// Basic Chat setup (simplified for demo)
function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value;
    if(msg) {
        const p = document.createElement('p');
        p.className = "bg-purple-500/20 p-2 rounded-xl border border-purple-500/30 self-end";
        p.innerText = "You: " + msg;
        document.getElementById('chat-box').appendChild(p);
        input.value = "";
    }
}
