//Buttons
const videoElement = document.getElementById("videoFrame");
const startBtn = document.getElementById("startbtn");
const stopBtn = document.getElementById("stopbtn");
const videoSelectBtn = document.getElementById("videoSelectionBtn");

videoSelectBtn.onclick = getVideoSources;
const { desktopCapturer, remote } = require("electron");
const { Menu } = remote;

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
		});
	);
	videoOptionsMenu.popup();
}

