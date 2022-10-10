const api_url = 'https://api.themoviedb.org/3/movie/popular?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US&page=1'
const search_url = 'https://api.themoviedb.org/3/search/movie?api_key=a2949ba2bbc81404864f35921a20a1d0&query='
const img_path = 'https://image.tmdb.org/t/p/w1280';
const movies_section = document.querySelector('.movies-section');
const searchForm = document.querySelector('#search_form');
const loading = document.querySelector('.loader');
const fowardBtn = document.querySelector('#foward-btn');
const backwardBtn = document.querySelector('#backward-btn');
const page = document.querySelector('#pagination_page');

let nextPage;
let prevPage;
let currentPage;
let totalPages;
let lastUrl = '';

// On Website Load
window.addEventListener('load', () => {
    hideLoader();
});

// Get Movies Function
async function getMovies(url) {
    lastUrl = url;
    const res = await fetch(url);
    const data = await res.json();

    if(data.results.length !== 0) {
        currentPage = data.page;
        nextPage = currentPage + 1;
        prevPage = currentPage - 1;
        totalPages = data.total_pages;

        page.innerText = currentPage;

        if(currentPage <= 1) {
            backwardBtn.classList.add('disabled');
        } else if(currentPage >= totalPages) {
            fowardBtn.classList.add('disabled');
        } else {
            backwardBtn.classList.remove('disabled');
            fowardBtn.classList.remove('disabled')
        }

        displayLoader();

        setTimeout(() => {
            hideLoader();
        }, 50)

        displayMovie(data);

    } else {
        movies_section.innerHTML = `<h1>No Results Found</h1>`
    }
}

// Pagination button for foward
fowardBtn.addEventListener('click', () => {
    if(nextPage <= totalPages){
        pagination(nextPage);
      }
});

// Pagination button for backward
backwardBtn.addEventListener('click', () => {
    if(prevPage > 0) {
        pagination(prevPage);
    }
});

// Pagination
function pagination(page) {
    // Spliting url
    let urlSplit = lastUrl.split('?');
    // Spliting last array url from &
    let queryParams = urlSplit[1].split('&');
    // Spliting params to get page number
    let key = queryParams[queryParams.length -1].split('=');
    
    
    // Set page number key to string
    key[1] = page.toString();
    // Joining page and page number keys togethere
    let a = key.join('=');
    // Updating last param (page number) in query array
    queryParams[queryParams.length - 1] = a;
    // Joining last array url with &
    let b = queryParams.join('&');
    // Joining destructured url in one
    let url = urlSplit[0] +'?'+ b;
    
    // Calling new page
    getMovies(url);

}

// Hide Loader Function
function hideLoader() {
    setTimeout(() => {
        loading.style.display = 'none'
        setTimeout(() => {loading.style.opacity = 0}, 50)

        movies_section.style.display = 'flex';
        setTimeout(() => {movies_section.style.opacity = 1}, 50)
    }, 700)
}

// Display Loader Function
function displayLoader() {
    loading.style.display = 'block';
    setTimeout(() => {loading.style.opacity = 1}, 50)
    
    movies_section.style.display = 'none'
    setTimeout(() => {movies_section.style.opacity = 0}, 50)
}

// Search Movie
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let search = document.querySelector('#search');
    let searchText = search.value;
    
    if(searchText) {
        // Show Loader
        displayLoader();
            
        setTimeout(() => {
            // Hide Loader
            hideLoader();
            // Get Movies
            getMovies(search_url + searchText);
            
        }, 500);

        search.value = ''
    }
});

// Display Movie Function
function displayMovie(movies) {
    movies_section.innerHTML = '';

    movies.results.forEach(item => {
        const { title, poster_path, vote_average, id } = item;

            movies_section.innerHTML += `
                <div class="movie">
                    <div class="card-inner">
                        <div class="card front">
                            <img src="${img_path + poster_path}" alt="">
                            <div class="movie-info">
                                <h3>${title}</h3>
                                <span class="${getClassByRating(vote_average)}">${vote_average}</span>
                            </div>
                        </div>
                        <div class="card back" style="background-image: url('${img_path + poster_path}')">
                            <div class="overlay"></div>
                            <a href="#" id="movie-modal-${id}">Check</a>
                        </div>
                    </div>
                </div>
            `
    });

    openMovie(movies);
}

const movieModal = document.querySelector('.movie-modal');

// Open Movie Function
function openMovie(movies) {
    movies.results.forEach(movie => {
        const { title, poster_path, backdrop_path, overview, release_date, id } = movie;
        const modalBtn = document.querySelector(`#movie-modal-${id}`);

        modalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            movieModal.classList.add('show');
            
            setTimeout(() => {
                document.querySelector('html').style.overflow = 'hidden'
            }, 500)

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