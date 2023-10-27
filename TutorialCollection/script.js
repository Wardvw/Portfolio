const saveVideo = (event) => {
    event.preventDefault();
    const videoIDInput = document.getElementById("videoID");
    const videoID = videoIDInput.value;
    // console.log(videoId);

    if (videoID) {
        const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
        if (!storedVideoIDs.includes(videoID)) {
            storedVideoIDs.push(videoID);
            localStorage.setItem("youTubeVideoIDs", JSON.stringify(storedVideoIDs));
            console.log("Added ID: ", videoID);
        }
        else {
            console.log("VideoID already exists")
        }
        videoIDInput.value = "";
        displayVideos();
    }
}

const displayVideos = () => {
    const storedVideoIDs = JSON.parse(localStorage.getItem("youTubeVideoIDs")) || [];
    console.log("Stored Video IDs:", storedVideoIDs);
    generateCards(storedVideoIDs);
}

const generateCards = (storedVideoIDs) => {
    const videosContainer = document.querySelector("#videosContainer");
    videosContainer.innerHTML = '';

    storedVideoIDs.forEach(videoId => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `<p>${videoId}</p>`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "deleteButton";

        deleteButton.addEventListener("click", () => {
            const updatedVideoIDs = storedVideoIDs.filter(id => id !== videoId);//updated = stored - id of deletedbutton clicked
            localStorage.setItem('youTubeVideoIDs', JSON.stringify(updatedVideoIDs));//push to local storage
            console.log("Updated Video IDs:", updatedVideoIDs);
            generateCards(updatedVideoIDs);
        });

        card.appendChild(deleteButton);
        videosContainer.appendChild(card);
    });
};


