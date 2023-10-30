# YouTube Tutorial Saver App

This is a simple web application that lets you save YouTube tutorials. It provides a user-friendly interface and is built using HTML, CSS, and JavaScript. It also utilizes the YouTube Data API v3 and YouTube IFrame Player API.

## Functionalities

1. **Search by ID**: Users can search for a YouTube video by its ID, and the app will display its thumbnail.
2. **Add Videos**: If a valid video ID is entered, the app will automatically add the video to the video collection. It won't add it if the video already exists in the collection or if the entered ID doesn't correspond to a video.
3. **Local Storage**: The app stores valid video IDs in local storage. The collection is preserved through page reloads.
4. **Delete Videos**: Users can delete videos from the collection and remove their corresponding data from local storage by clicking the delete button on the corresponding video.
5. **Video Playback**: Resuming or starting a video will pause any already playing video to avoid simultaneous playback.
6. **Watch Progress**: The app allows users to save the watch progress of multiple videos. Even when the page is reloaded, the progress is preserved.

## Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### API
- YouTube Data API v3
- YouTube IFrame Player API

## Getting Started

To get started with this app, follow these steps:
1. Clone the repository.
2. Set up your YouTube API credentials and configure them in the app.
3. Open the `index.html` file in a web browser.
4. Start using the app to save and categorize your favorite YouTube tutorials.

## Acknowledgments

- The app uses the YouTube Data API and YouTube IFrame Player API for video retrieval and playback.