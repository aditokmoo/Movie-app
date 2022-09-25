// API URL
const api_url = 'https://api.themoviedb.org/3/movie/popular?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US&page=1'
const search_url = 'https://api.themoviedb.org/3/search/movie?api_key=a2949ba2bbc81404864f35921a20a1d0&query='
const img_path = 'https://image.tmdb.org/t/p/w1280';
const movies_section = document.querySelector('.movies-section');
const searchForm = document.querySelector('#search_form');

// Loader
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');

    setTimeout(() => {
        loader.style.display = 'none'
        setTimeout(() => {loader.style.opacity = 0}, 50)
   
        movies_section.style.display = 'flex';
        setTimeout(() => {movies_section.style.opacity = 1}, 50)
    }, 50)
});

// Get Movies Function
async function getMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    
    displayMovie(data);
}

// Search Movie
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let search = document.querySelector('#search');
    let searchText = search.value;
    
    if(searchText) {
        getMovies(search_url + searchText);

        search.value = ''
    }

    setTimeout(() => {
        document.querySelector('.movies-section').scrollIntoView({
            behavior: 'smooth',
        });
    }, 700)
});

// Display Movie Function
function displayMovie(movies) {
    movies_section.innerHTML = '';

    movies.results.forEach(item => {
        const { title, poster_path, vote_average, id } = item;
        
        movies_section.innerHTML += `
            <div class="movie">
                <img src="${img_path + poster_path}" alt="">
                <div class="movie-info">
                    <h3>${title}</h3>
                    
                    <span class="${getClassByRating(vote_average)}">${vote_average}</span>
                </div>
                <div class="overview" style="background-image: url('${img_path + poster_path}')">
                    <div class="overlay"></div>
                    <a href="#" id="movie-modal-${id}">Check</a>
                </div>
            </div>
        `
    })

    openMovie(movies)
}

const movieModal = document.querySelector('.movie-modal')

// Open Movie Function
function openMovie(movies) {
    movies.results.forEach(movie => {
        const { title, poster_path, backdrop_path, overview, release_date, id } = movie;
        const modalBtn = document.querySelector(`#movie-modal-${id}`);

        modalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            movieModal.classList.add('show');
            document.querySelector('html').style.overflow = 'hidden'

            movieModal.innerHTML = `
                <i class="fas fa-times" id="close-btn"></i>
                <div class="movie" style="background-image: url('${img_path + backdrop_path}')">
                    <div class="container">
                        <div class="overlay"></div>
                        <div class="movie-section">
                            <img src="${img_path + poster_path}" alt="">
                            <h3>Release date: ${release_date}</h3>
                        </div>
                        <div class="movie-info">
                            <h1>${title}</h1>
                            <p>${overview}</p>
                            <a href="#"><i class="fas fa-play"></i> Play Clip</a>
                        </div>
                    </div>
                </div> 
            `

            closeModal();
        })
    })
}

// Close Modal Function
function closeModal() {
    let closeBtn = document.querySelector('#close-btn');

    closeBtn.addEventListener('click', () => {
        movieModal.classList.remove('show')
        document.querySelector('html').style.overflow = 'auto'
    })
}

// Get Class By Rating Function
function getClassByRating(rate) {
    if(rate >= 8) {
        return 'green';
    } else if(rate >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

getMovies(api_url);