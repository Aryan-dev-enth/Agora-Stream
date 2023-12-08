const APP_ID = '4c27621eab9a4e52804641cac690ffad';
const TOKEN = '007eJxTYDimvsuwZ/a3gugFv6Q/bw3seiX1q2WWjtyW5f/b3yWxFRxXYDBJNjI3MzJMTUyyTDRJNTWyMDAxMzFMTkw2szRIS0tMYQwsTm0IZGT45OfNyMgAgSA+G0OYs4JjQQEDAwAsdSE0';
const CHANNEL = "VC App";

const client = AgoraRTC.createClient({
    "mode": "rtc",
    "codec": 'vp8'
})
let localTracks = []
let remoteUsers = {}

let isHost = false; // Variable to track if the local user is the host

let joinAndDisplayLocalStream = async () => {
    await client.join(APP_ID, CHANNEL, TOKEN, null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video-container" id="user-container-local">
        <div class="video-player" id="user-local">
    
        </div>
    </div>`;

    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

    localTracks[1].play(`user-local`);

    await client.publish([localTracks[0], localTracks[1]]);

    // Mark the local user as the host
    isHost = true;
}

let joinStream = async () => {
    await joinAndDisplayLocalStream();
    document.getElementById('join-btn').style.display = 'none';
    document.getElementById('stream-controls').style.display = 'flex';
}

let leaveStream = async () => {
    await client.leave();
    localTracks.forEach(track => track.close());
    document.getElementById('join-btn').style.display = 'block';
    document.getElementById('stream-controls').style.display = 'none';
    isHost = false; // Reset the host status when leaving
}

let handleUserJoined = async (user, mediaType) => {
    console.log("User Joined");

    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
        let player = document.getElementById(`user-container-${user.uid}`);
        if (player != null) {
            player.remove();
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
            <div class="video-player" id="user-${user.uid}">
    
            </div>
        </div>`;

        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);

        // Only play video if the local user is the host
        if (isHost) {
            user.videoTrack.play(`user-${user.uid}`);
        }
    }

    if (mediaType === 'audio') {
        // Always play audio regardless of host status
        user.audioTrack.play();
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream);
document.getElementById('leave-btn').addEventListener('click', leaveStream);

client.on('user-published', handleUserJoined);
