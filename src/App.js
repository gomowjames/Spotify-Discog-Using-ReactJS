import {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';

const CLIENT_ID = "2c62e0da2a2544de94b866e56df4ee13"
const REDIRECT_URI = "http://localhost:3000"
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "token"

function App() {

  const [token, setToken] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [artists, setArtists] = useState("");
  const [albums, setAlbums] = useState(0);

  useEffect(() => {
      const hash = window.location.hash

      let token = window.localStorage.getItem("token")

      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
  
          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }
  
      setToken(token)
  
  }, [])

  function fetchData() {
    fetch('https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg', {
      method: 'GET',headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+token
      }})
    .then(response => response.json())
    .then(data => console.log(data));
  }

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  function searchArtists(e) {
    e.preventDefault();
    
    fetch(`https://api.spotify.com/v1/search?q=${searchTerm}&type=artist`, {
      method: 'GET',headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+token
      }})
    .then(response => response.json())
    .then(data => setArtists(data.artists.items))

    console.log(artists);
  }
  
  function getDiscog(id) {
    fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album`, {
      method: 'GET',headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer '+token
      }})
    .then(response => response.json())
    .catch( err => Error(err) )
    .then(data => setAlbums(data.items))
  }

  function displayAlbums() {
    let albumsArr = [...albums];
    albumsArr.reverse();

    return albumsArr.map( album => (
      <article key={album.id}>
        <img src={album.images[1].url} />
        <p>{ album.name }: {album.release_date}</p>
      </article>
    ));
  }

  const displayArtists = () => {

    let artistArr = [...artists];

    return artistArr.map( artist => (
      <article key={artist.id}>
        <h1>{ artist.name }</h1>
        <div>
        { artist.images.length ? <img width={"25%"} src={artist.images[0].url} alt=""/> : <div>No Image</div> }
        </div>
        <div style={{display:"block"}}>
          <button onClick={ () => { getDiscog(artist.id) } } >VIEW ALBUMS</button>
        </div>
      </article>
    ));
  }

  return (
    <div className="App">
        <header className="App-header">
          { !token ? 
            <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
          : <button onClick={ logout }>LOGOUT</button>
          } 
        </header>
  
        <main>
  
          <form onSubmit={searchArtists}>
            <input type={"text"} onChange={ e => setSearchTerm(e.target.value) } placeholder="Search for an artist or group"/>
            <button type={"submit"}>Search</button>
          </form>
          
          <section>
            { albums > 0 && displayAlbums() }
          </section>
  
          <section>
            { displayArtists() }
          </section>
        </main>
    </div>
  );
}

export default App;
