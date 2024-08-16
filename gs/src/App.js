import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Button, Form, Card } from "react-bootstrap";
import "./App.css";
import "@fontsource/montserrat/900.css"; // Defaults to weight 400

const CLIENT_ID = "e6e3c67c4d8d40158cca8c96aeb2e3ac";
const CLIENT_SECRET = "7cfcae5ffe764384a6331c88fe30a8c7";
const PLAYLIST_ID = "37i9dQZF1DXcZQSjptOQtk"; // Hot Hits Philippines Playlist

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [score, setScore] = useState(100);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Fetch the API access token
    const authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };

    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchTracks();
    }
  }, [accessToken]);

  const fetchTracks = async () => {
    const searchParameters = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const fetchedTracks = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/tracks`,
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => data.items.map((item) => item.track))
      .catch((error) => console.error("Error fetching tracks:", error));

    setTracks(fetchedTracks);
    selectRandomTrack(fetchedTracks); // Select a random track to start
  };

  const selectRandomTrack = (tracks) => {
    if (tracks.length === 0) return;

    const randomIndex = Math.floor(Math.random() * tracks.length);
    setCurrentTrack(tracks[randomIndex]);
    setAttempt(0);
    setScore(100);
    setFeedback("");
    setGuess("");
  };

  const handleGuess = () => {
    if (guess.toLowerCase() === currentTrack.name.toLowerCase()) {
      setFeedback(
        `Correct! The song was "${currentTrack.name}" by ${currentTrack.artists
          .map((artist) => artist.name)
          .join(", ")}.`
      );
    } else {
      nextAttempt();
    }
  };

  const nextAttempt = () => {
    if (attempt < 3) {
      setAttempt(attempt + 1);
      const newScore = score - (attempt === 0 ? 25 : attempt === 1 ? 25 : 25);
      setScore(newScore);
    } else {
      setFeedback(
        `Sorry, the correct answer was "${
          currentTrack.name
        }" by ${currentTrack.artists.map((artist) => artist.name).join(", ")}.`
      );
    }
  };

  const getSnippetDuration = () => {
    switch (attempt) {
      case 0:
        return 1000; // 1 sec
      case 1:
        return 3000; // 3 sec
      case 2:
        return 5000; // 5 sec
      case 3:
        return 15000; // 15 sec
      default:
        return 0;
    }
  };

  const playSnippet = () => {
    if (currentTrack && currentTrack.preview_url) {
      const audio = new Audio(currentTrack.preview_url);
      audio.play();
      setTimeout(() => audio.pause(), getSnippetDuration());
    }
  };

  return (
    <div className="background-image d-flex justify-content-center align-items-center min-vh-100 text-center text-white">
      <Container>
        <h1 className="text-xl mb-4">GUESS THE SONG</h1>
        {currentTrack && (
          <div className="border-top border-bottom border-1 border-dark p-3 mb-4">
            <Card.Title>{currentTrack.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {currentTrack.artists.map((artist) => artist.name).join(", ")}
            </Card.Subtitle>
            <Button variant="primary" className="mt-3" onClick={playSnippet}>
              Play Snippet
            </Button>
          </div>
        )}
        <Form>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter your guess..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
          </Form.Group>
          <Button variant="success" className="mt-3" onClick={handleGuess}>
            Submit Guess
          </Button>
        </Form>
        <p className="mt-3">Score: {score}</p>
        <p>{feedback}</p>
        {feedback && (
          <Button variant="primary" onClick={() => selectRandomTrack(tracks)}>
            Play Another Song
          </Button>
        )}
      </Container>
    </div>
  );
}

export default App;
