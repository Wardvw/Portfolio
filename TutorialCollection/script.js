function saveVideo(event) {
    event.preventDefault();
    const videoIdInput = document.getElementById('videoId');
    const videoId = videoIdInput.value;
    console.log(videoId);

    if (videoId) {
        const storedVideoIds = JSON.parse(localStorage.getItem('youTubeVideoIds')) || [];
        if (!storedVideoIds.includes(videoId)) {
            storedVideoIds.push(videoId);
            localStorage.setItem('youTubeVideoIds', JSON.stringify(storedVideoIds));
        }
        videoIdInput.value = '';
        displayVideos();
    }
}

function displayVideos() {
    const storedVideoIds = JSON.parse(localStorage.getItem('youTubeVideoIds')) || [];
    console.log('Stored Video IDs:', storedVideoIds);
}