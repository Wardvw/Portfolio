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
                card.innerHTML = `
                    <div class="thumbnailContainer">
                        <a href="javascript:void(0);" onclick="handlePopupClick('${videoID}')">
                            <img class="thumbnail" src="${validVideoURL}" alt="Cover image for YouTube video with ID ${videoID}" data-videoID="${videoID}">
                            <button class="thumbnailDeleteButton" onclick="deleteFromStorage(event, '${videoID}')" title="Delete from collection">X</button>
                            <button class="loadTimeStampButton" onclick="loadTimeStamp(event, '${videoID}')" title="Load timestamp">Y</button>
                        </a>
                    </div>`;

                videosContainer.appendChild(card);
            }
        });
    });
};

const handlePopupClick = (videoID) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", `https://www.youtube.com/embed/${videoID}?autoplay=1`);
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");
    iframe.setAttribute("allowfullscreen", "true");

    const card = document.querySelector(`[data-videoID="${videoID}"]`).closest(".card");
    card.innerHTML = `
        <button class="deleteButton" onclick="deleteFromStorage(event, '${videoID}')" title="Delete">X</button>
        <button class="loadTimeStampButton" onclick="loadTimeStamp(event, '${videoID}')" title="Load timestamp">Y</button>
        <button class="saveTimeStampButton" onclick="saveTimeStamp(event, '${videoID}')" title="Save timestamp">Z</button>`;
    card.appendChild(iframe);
}

displayVideos(); //display at startup
