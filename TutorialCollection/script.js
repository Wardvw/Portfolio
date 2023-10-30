// let done = false;
const apiKey = config.APIKEY;

const isVideoValid = async (videoID) => {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoID}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("fail", error);
        return false;
    }
}

const getVideoURL = async (videoID) => {
    const videoURL = `https://i3.ytimg.com/vi/${videoID}/sddefault.jpg`;

    if (await isVideoValid(videoID)) {
        return videoURL;
    } else {
        return null;
    }
};

const saveVideo = async (event) => {
    event.preventDefault();
    const videoIDInput = document.getElementById("videoID");
    const videoID = videoIDInput.value;

    if (videoID) { //when submitted
        const validVideoURL = await getVideoURL(videoID); //check if URL is valid
        if (validVideoURL) {
            const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
            if (!storedVideoIDs.includes(videoID)) { //check if URL is not a duplicate
                storedVideoIDs.push(videoID);
                localStorage.setItem("youTubeVideoIDs", JSON.stringify(storedVideoIDs)); //add to local storage
                console.log("Added Video URL: " + validVideoURL);
            } else {
                console.log("Video ID already exists");
            }
            videoIDInput.value = "";
            displayVideos();
            // location.reload(); // Reload the page
        } else {
            console.log("Invalid Video ID");
        }
    }
};


const deleteFromStorage = (event, videoID) => {
    event.stopPropagation();
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    const updatedVideoIDs = storedVideoIDs.filter(id => id !== videoID);
    localStorage.setItem("youTubeVideoIDs", JSON.stringify(updatedVideoIDs));
    console.log("Updated Video URLs:", updatedVideoIDs);
    displayVideos();
};

const displayVideos = () => {
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    console.log("Stored Video IDs:", storedVideoIDs);
    generateCards(storedVideoIDs);
};

const generateCards = (storedVideoIDs) => {
    const videosContainer = document.querySelector(".videosContainer");
    videosContainer.innerHTML = "";

    storedVideoIDs.forEach(videoID => {
        getVideoURL(videoID).then((validVideoURL) => {
            if (validVideoURL) {
                const card = document.createElement("div");
                card.className = "card";

                const thumbnailContainer = document.createElement("div");
                thumbnailContainer.className = "thumbnailContainer";

                const link = document.createElement("a");
                link.href = "javascript:void(0);";
                link.onclick = () => onYouTubeIframeAPIReady(videoID);

                const thumbnail = document.createElement("img");
                thumbnail.className = `identify${videoID} thumbnail`;
                thumbnail.src = validVideoURL;
                thumbnail.alt = `Cover image for YouTube video with ID ${videoID}`;
                thumbnail.dataset.videoID = videoID;

                const deleteButton = document.createElement("button");
                deleteButton.className = "thumbnailDeleteButton";
                deleteButton.title = "Delete from collection";
                deleteButton.onclick = (event) => deleteFromStorage(event, videoID);
                deleteButton.textContent = "X";

                const loadButton = document.createElement("button");
                loadButton.className = "loadTimeStampButton";
                loadButton.title = "Load timestamp";
                loadButton.onclick = (event) => loadTimeStamp(event, videoID);
                loadButton.textContent = "Y";

                link.appendChild(thumbnail);
                link.appendChild(deleteButton);
                link.appendChild(loadButton);

                thumbnailContainer.appendChild(link);
                card.appendChild(thumbnailContainer);

                videosContainer.appendChild(card);
            }
        });
    });
};

const onYouTubeIframeAPIReady = (videoID) => {
    const targetDiv = document.querySelector(`.identify${videoID}`);
    targetDiv.id = `targetDiv-${videoID}`;

    player = new YT.Player(`targetDiv-${videoID}`, {
        height: '390',
        width: '640',
        videoId: videoID,
        playerVars: { 
            rel: 0, 
            showinfo: 0, 
            ecver: 2 },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

const onPlayerReady = (event) => {
    event.target.playVideo();
};

let currentVideoPlayer = null;

const onPlayerStateChange = (event) => {
    if (event.data == YT.PlayerState.PLAYING) {
        if (currentVideoPlayer && currentVideoPlayer !== event.target) {
            currentVideoPlayer.pauseVideo();
        }
        currentVideoPlayer = event.target;
    }
};

displayVideos(); //display at startup
