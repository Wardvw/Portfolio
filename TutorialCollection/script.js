const isURLValid = (videoURL) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = videoURL;
    });
};

const getVideoURL = async (videoID) => {
    const videoURL = `https://i3.ytimg.com/vi/${videoID}/sddefault.jpg`;

    if (await isURLValid(videoURL)) {
        return videoURL;
    } else {
        return null;
    }
};

const openVideoInNewWindow = (videoURL) => {
    window.open(`https://www.youtube.com/watch?v=${videoURL}`);
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
        } else {
            console.log("Invalid Video ID");
        }
        videoIDInput.value = "";
        displayVideos();
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
    const videosContainer = document.querySelector("#videosContainer");
    videosContainer.innerHTML = "";

    storedVideoIDs.forEach(videoID => {
        getVideoURL(videoID).then((validVideoURL) => {
            if (validVideoURL) {
                const card = document.createElement("div");
                card.className = "card";

                card.innerHTML = `
                    <div class="thumbnail-container">
                        <a href="javascript:void(0);" onclick="openVideoInNewWindow('${videoID}')">
                            <img class="thumbnail" src="${validVideoURL}" alt="Cover image for YouTube video with ID ${videoID}">
                            <button class="deleteButton" onclick="deleteFromStorage(event, '${videoID}')">X</button>
                        </a>
                    </div>`;

                videosContainer.appendChild(card);
            }
        });
    });
};

displayVideos(); //display at startup