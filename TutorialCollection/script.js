let enableLogging = true; // Turn off all console logging with one line of code
const logMessages = [];

const addLogMessage = (message) => {
    if (enableLogging) {
        logMessages.push(message); // All logs get pushed to an array instead of being logged
        console.log(message); // Log all entries of the array
    }
};

// Retrieve recent updates from local storage on page load
const storedRecentUpdates = JSON.parse(localStorage.getItem("recentUpdates")) || {};
const recentUpdates = {};

// YouTube API Key
const apiKey = config.APIKEY;

// Save video to local storage
const saveVideo = async (event) => {
    event.preventDefault();
    const videoIDInput = document.getElementById("videoID");
    const videoID = videoIDInput.value;

    if (videoID) { //if an ID has been put in the form
        const validVideoURL = await getVideoURL(videoID); //turn the ID into a URL
        if (validVideoURL) { //if videoURL has a valid video
            const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
            if (!storedVideoIDs.includes(videoID)) { //if URL isn't already in local storage
                storedVideoIDs.push(videoID); //push to array
                localStorage.setItem("youTubeVideoIDs", JSON.stringify(storedVideoIDs));// push array to local storage
                addLogMessage("Added Video URL: " + validVideoURL);
            } else {
                addLogMessage("Video ID already exists");
            }
            videoIDInput.value = ""; //empty form
            displayVideos();
        } else {
            addLogMessage("Invalid Video ID");
        }
    }
};

// Get the URL for a given ID
const getVideoURL = async (videoID) => {
    const videoURL = `https://i3.ytimg.com/vi/${videoID}/sddefault.jpg`;
    if (await isVideoValid(videoID)) { //Validate the URL by checking if there are matches
        return videoURL; //return videoURL if yes
    } else {
        return null; //return null if not
    }
};

//Validate the URL with Youtube Data API V3
const isVideoValid = async (videoID) => {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&part=snippet&id=${videoID}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data.items && data.items.length > 0; //return matches
    } catch (error) {
        addLogMessage("Failed to check video validity", error);
        return false;
    }
};

// Delete a video from local storage
const deleteFromStorage = (event, videoID) => {
    event.stopPropagation();
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    const updatedVideoIDs = storedVideoIDs.filter(id => id !== videoID);
    localStorage.setItem("youTubeVideoIDs", JSON.stringify(updatedVideoIDs));
    addLogMessage("Updated Video URLs:", updatedVideoIDs);
    displayVideos();
};

// Display videosIDs array in the console with every addition or deletion
const displayVideos = () => {
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    console.log(`Stored videoIDs: `, storedVideoIDs);
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
                link.className = `link`;
                link.href = "javascript:void(0);";
                link.onclick = () => onYouTubeIframeAPIReady(videoID);

                const thumbnail = document.createElement("img");
                thumbnail.id = `targetDiv-${videoID}`;
                thumbnail.className = "thumbnail"
                thumbnail.src = validVideoURL;
                thumbnail.alt = `Cover image for YouTube video with ID ${videoID}`;
                thumbnail.dataset.videoID = videoID;

                const deleteButton = document.createElement("button");
                deleteButton.className = "thumbnailDeleteButton";
                deleteButton.title = "Delete from collection";
                deleteButton.onclick = (event) => deleteFromStorage(event, videoID);
                deleteButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#000" stroke-width="2" d="M3,3 L21,21 M3,21 L21,3"></path></svg>`;

                const restartButton = document.createElement("button");
                restartButton.className = "restartButton";
                restartButton.title = "Restart video";
                restartButton.onclick = () => restartVideo(videoID);
                restartButton.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>`;

                link.appendChild(thumbnail);
                link.appendChild(deleteButton);
                link.appendChild(restartButton);

                thumbnailContainer.appendChild(link);
                card.appendChild(thumbnailContainer);

                videosContainer.appendChild(card);
            }
        });
    });
};

// Callback when the YouTube API is ready
const onYouTubeIframeAPIReady = (videoID) => {

    // Create a YouTube player by invoking the createPlayer function
    const startTime = recentUpdates[videoID] || 0; // Get the saved start time
    const roundedDownStartTime = parseInt(startTime); //You can't start a youtube video on a float; make it an integer
    createPlayer(videoID, roundedDownStartTime);
    addLogMessage("start time: " + roundedDownStartTime)
};

// Function to create a YouTube player
const createPlayer = (videoID, roundedDownStartTime) => {
    const player = new YT.Player(`targetDiv-${videoID}`, { //use targeted div from onYouTubeIframeAPIReady function
        height: '390',
        width: '640',
        videoId: videoID,
        playerVars: {
            start: roundedDownStartTime
        },
        events: {
            'onReady': (event) => {
                event.target.playVideo();
                onPlayerReady(event);
            },
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

// Define an object to store update intervals for each video
const updateIntervals = {};

// Callback when the player state changes; pause video
const onPlayerStateChange = (event) => {
    if (event.data == YT.PlayerState.PLAYING) {
        if (currentVideoPlayer && currentVideoPlayer !== event.target) {
            currentVideoPlayer.pauseVideo();
        }
        currentVideoPlayer = event.target;

        const videoID = currentVideoPlayer.getVideoData().video_id;

        // Clear the previous update interval for this video, if it exists
        if (updateIntervals[videoID]) {
            clearInterval(updateIntervals[videoID]);
        }

        // Log the live update timestamp every second when the video is playing
        updateIntervals[videoID] = setInterval(() => {
            if (enableLogging) {
                console.clear();
            }

            const currentTime = parseInt(currentVideoPlayer.getCurrentTime());
            addLogMessage(`Video ID: ${videoID}, current time: ${currentTime}`);

            // Store the most recent update for the video in the object
            recentUpdates[videoID] = currentTime;

            // Save the recent updates object to local storage
            localStorage.setItem("recentUpdates", JSON.stringify(recentUpdates));
        }, 1000);

        // Stop live updates when the video is paused
        currentVideoPlayer.addEventListener('onStateChange', (newState) => {
            if (newState.data == YT.PlayerState.PAUSED) {
                clearInterval(updateIntervals[videoID]);
            }
        });
    }
};


// Retrieve recent updates from local storage on page load
for (const videoID in storedRecentUpdates) {
    if (storedRecentUpdates.hasOwnProperty(videoID)) {
        recentUpdates[videoID] = storedRecentUpdates[videoID];
    }
}

const restartVideo = (videoID, validVideoURL) => {
    const iframeToRemove = document.querySelector(`#targetDiv-${videoID}`);
    if (iframeToRemove) {
        iframeToRemove.parentNode.removeChild(iframeToRemove);
    }

    // recentUpdates[videoID] = 0

    // const thumbnail = document.createElement("img");
    // thumbnail.className = `identify${videoID} thumbnail`;
    // thumbnail.src = validVideoURL;
    // thumbnail.alt = `Cover image for YouTube video with ID ${videoID}`;
    // thumbnail.dataset.videoID = videoID;

    // link = document.querySelector(`.link`)
    // link.appendChild(thumbnail);

    // generateCards(storedVideoIDs);
    
}

displayVideos(); // Display at startup