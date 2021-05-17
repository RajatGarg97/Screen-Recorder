const { desktopCapturer, remote } = require('electron');
const { writeFile } = require('fs');

let mediaRecorder;
const recordedChunks = [];
const { Menu, dialog } = remote;

//Buttons
const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startbtn');
const stopBtn = document.getElementById('stopbtn');
const videoSelectBtn = document.getElementById('videoSelectionBtn');

videoSelectBtn.onclick = getVideoSources;

startBtn.onclick = e => {
	if (mediaRecorder) {
		mediaRecorder.start();
		startBtn.classList.add('is-danger');
		startBtn.innerText = 'Recording 📹'
	} else {
		alert('Duhh!🤦‍♂️ You forgot to choose the target screen')
	}
};

stopBtn.onclick = stopButton;

function stopButton(e) {
	if (mediaRecorder) {
		startBtn.classList.remove('is-danger');
		startBtn.innerText = 'Start 🚀'
		mediaRecorder.stop();
	} else {
		alert('Duhh!🤦‍♂️ You forgot to start recording')
	}
}

// Available Video Sources
async function getVideoSources() {
	const inputSources = await desktopCapturer.getSources({
		types: ['window', 'screen']
	});
	const videoOptionsMenu = Menu.buildFromTemplate(
		inputSources.map(source => {
			return {
				label: source.name,
				click: () => selectSource(source)
			};
		})
	);
	videoOptionsMenu.popup();
}

async function selectSource(source) {
	videoSelectBtn.innerText = source.name;
	const constraints = {
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: 'desktop',
				chromeMediaSourceId: source.id
			}
		}
	};
	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	videoElement.srcObject = stream;
	videoElement.play();
	const options = {
		mimeType: 'video/webm; codecs=vp9'
	};
	mediaRecorder = new MediaRecorder(stream, options);

	mediaRecorder.ondataavailable = handleDataAvailable;
	mediaRecorder.onstop = handleStop;
}

function handleDataAvailable(e) {
	try {
		recordedChunks.push(e.data);
		console.log('Data pushed into chunks');
	} catch (error) {
		console.log(error);
		stopButton(e);
	}
}

async function handleStop(e) {
	const blob = new Blob(recordedChunks, {
		type: 'video/webm; codecs=vp9'
	});
	const buffer = Buffer.from(await blob.arrayBuffer());
	const { filePath } = await dialog.showSaveDialog({
		buttonLabel: 'Save Video',
		defaultPath: `vid-${Date.now()}.webm`
	});
	console.log(filePath);
	if (filePath) {
		writeFile(filePath, buffer, () => console.log('Video saved successfully'));
	}
}