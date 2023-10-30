// Retrieve recent updates from local storage on page load
const storedRecentUpdates = JSON.parse(localStorage.getItem("recentUpdates")) || {};
const recentUpdates = {};

// YouTube API Key
const apiKey = config.APIKEY;

// Check if a video is valid
const isVideoValid = async (videoID) => {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoID}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items && data.items.length > 0;
    } catch (error) {
        console.log("Failed to check video validity", error);
        return false;
    }
};

// Get the thumbnail URL for a video
const getVideoURL = async (videoID) => {
    const videoURL = `https://i3.ytimg.com/vi/${videoID}/sddefault.jpg`;
    if (await isVideoValid(videoID)) {
        return videoURL;
    } else {
        return null;
    }
};

// Save a video to local storage
const saveVideo = async (event) => {
    event.preventDefault();
    const videoIDInput = document.getElementById("videoID");
    const videoID = videoIDInput.value;

    if (videoID) {
        const validVideoURL = await getVideoURL(videoID);
        if (validVideoURL) {
            const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
            if (!storedVideoIDs.includes(videoID)) {
                storedVideoIDs.push(videoID);
                localStorage.setItem("youTubeVideoIDs", JSON.stringify(storedVideoIDs));
                console.log("Added Video URL: " + validVideoURL);
            } else {
                console.log("Video ID already exists");
            }
            videoIDInput.value = "";
            displayVideos();
        } else {
            console.log("Invalid Video ID");
        }
    }
};

// Delete a video from local storage
const deleteFromStorage = (event, videoID) => {
    event.stopPropagation();
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    const updatedVideoIDs = storedVideoIDs.filter(id => id !== videoID);
    localStorage.setItem("youTubeVideoIDs", JSON.stringify(updatedVideoIDs));
    console.log("Updated Video URLs:", updatedVideoIDs);
    displayVideos();
};

// Display videosIDs array in the console with every addition or deletion
const displayVideos = () => {
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    console.log("Stored Video IDs:", storedVideoIDs);
    generateCards(storedVideoIDs);
};

// Generate video cards with respective thumbnails within
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

// Callback when the YouTube API is ready
const onYouTubeIframeAPIReady = (videoID) => {
    const targetDiv = document.querySelector(`.identify${videoID}`);
    targetDiv.id = `targetDiv-${videoID}`;

    // Create a YouTube player by deleting the thumbnail and generating an iframe in its place
    player = new YT.Player(`targetDiv-${videoID}`, {
        height: '390',
        width: '640',
        videoId: videoID,
        playerVars: {},
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
};

// Callback when the player is ready; start playing video
const onPlayerReady = (event) => {
    event.target.playVideo();
};

// Current video player
let currentVideoPlayer = null;

// Callback when the player state changes; pause video
const onPlayerStateChange = (event) => {
    if (event.data == YT.PlayerState.PLAYING) {
        if (currentVideoPlayer && currentVideoPlayer !== event.target) {
            currentVideoPlayer.pauseVideo();
        }
        currentVideoPlayer = event.target;

        const videoID = currentVideoPlayer.getVideoData().video_id;

        // Log the live update timestamp every second when the video is playing
        const updateInterval = setInterval(() => {
            console.clear(); // Clear the console before every single update

            // Display the most recent time for each video
            for (const id in recentUpdates) {
                if (recentUpdates.hasOwnProperty(id)) {
                    console.log(`Video ID: ${id} `+`Most Recent Time: ${recentUpdates[id]}`);
                }
            }

            // Log the live update timestamp
            const currentTime = currentVideoPlayer.getCurrentTime();
            console.log(`Video ID: ${videoID} `+`Current Time: ${currentTime}`);

            // Store the most recent update for the video in the object
            recentUpdates[videoID] = currentTime;

            // Save the recent updates object to local storage
            localStorage.setItem("recentUpdates", JSON.stringify(recentUpdates));
        }, 1000); // Update every 1000 milliseconds (1 second)

        // Stop live updates when the video is paused
        currentVideoPlayer.addEventListener('onStateChange', (newState) => {
            if (newState.data == YT.PlayerState.PAUSED) {
                clearInterval(updateInterval);
            }
        });
    }
};

// Retrieve recent updates from local storage on page load
for (const videoID in storedRecentUpdates) {
    if (storedRecentUpdates.hasOwnProperty(videoID)) {
        recentUpdates[videoID] = storedRecentUpdates[videoID];
        console.log(`Video ID: ${videoID} `+`Most Recent Time: ${recentUpdates[videoID]}`);
    }
}


displayVideos(); // Display at startup
