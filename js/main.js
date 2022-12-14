const api_url = 'https://api.themoviedb.org/3/movie/popular?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US&page=1'
const search_url = 'https://api.themoviedb.org/3/search/movie?api_key=a2949ba2bbc81404864f35921a20a1d0&query='
const img_path = 'https://image.tmdb.org/t/p/w1280';
const movies_section = document.querySelector('.movies-section');
const searchForm = document.querySelector('#search_form');
const loading = document.querySelector('.loader');
const fowardBtn = document.querySelector('#foward-btn');
const backwardBtn = document.querySelector('#backward-btn');
const page = document.querySelector('#pagination_page');
const movieModal = document.querySelector('.movie-modal');
const movieHeader = document.querySelector('.movie-header');
const movieReview = document.querySelector('.review');
const movieRecomended = document.querySelector('.recomended');
const backBtn = document.querySelector('#back-btn')

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
const getMovies = async url => {
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
        }
        else if(currentPage >= totalPages) {
            fowardBtn.classList.add('disabled');
        } else {
            backwardBtn.classList.remove('disabled');
            fowardBtn.classList.remove('disabled')
        }

        displayMovie(data);

        displayLoader();

        setTimeout(() => {
            hideLoader();
        }, 50)

    } else {
        movies_section.innerHTML = `<h1>No Results Found</h1>`
    }
}

// Pagination
const pagination = page => {
    // Spliting url
    let urlSplit = lastUrl.split('?');
    // Spliting last array url from &
    let queryParams = urlSplit[1].split('&');
    // Spliting params to get page number
    let key = queryParams[queryParams.length -1].split('=');
    
    if(key[0] != 'page') {
        url = lastUrl + '&page=' + page;
        getMovies(url)
    } else {
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
}

// Display Movie Function
const displayMovie = movies => {
    movies_section.innerHTML = '';

    movies.results.forEach(item => {
        const { title, poster_path, backdrop_path, vote_average, id } = item;

        if(poster_path != null && backdrop_path != null) {
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
        }
    });

    openMovie(movies);
    
}

// Get Recomended Movies
const recomendedMovies = async movie_id => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/recommendations?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US&page=1`)
    const data = await res.json();

    data.results.forEach(item => {
        const { poster_path, backdrop_path, overview, title, release_date, vote_average, id } = item

        if(poster_path != null) {
            movieRecomended.innerHTML += `
            <div class="movie">
                <div class="card-img">
                    <img src="${img_path + poster_path}" alt="">
                </div>
            </div>
        ` 
        }      
    })

    getRecomendedMovie(data)
}

// Get Recomended Movie
const getRecomendedMovie = data => {
    const movies = movieRecomended.querySelectorAll('.movie');

    movies.forEach((movie, index) => {
        movie.addEventListener('click', (e) => {
            let res = data.results.map(item => {
               return item
            })
            
            const { poster_path, backdrop_path, overview, title, release_date, vote_average, id } = res[index];

            movieHeader.innerHTML = `
                <div class="movie" style="background-image: url('${img_path + backdrop_path}')">
                    <div class="container">
                        <div class="overlay"></div>
                        <div class="movie-section">
                            <div class="movie-image">
                                <img src="${img_path + poster_path}" alt="">
                                <h3>Release date: ${release_date}</h3>
                            </div>
                            <div class="movie-info">
                                <h1>${title}</h1>
                                <p>${overview}</p>
                                <a href="#" target='_blank' id="${id}"><i class="fas fa-play"></i> Play Clip</a>
                            </div>
                        </div>
                    </div>
                </div> 
            `

            // Show Video
            getVideo(id);

            // Recomended Movies
            movieRecomended.innerHTML = '';
            recomendedMovies(id);

            // Movie Review
            movieReview.innerHTML = '';
            getReview(id);
        })
    })
}

// Get Movie Review
const getReview = async movie_id => {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/reviews?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US&page=1`);
    const data = await res.json();

    if(data.results.length !== 0) {
        data.results.forEach(item => {
            const { avatar_path, username } = item.author_details;
            let { content, created_at } = item;
    
            created_at = created_at.slice(0, 10);

            movieReview.innerHTML += `
                <div class="user-review" id="${movie_id}">
                    <div class="user-review-img">
                        <img src="${noProfileImge(img_path, avatar_path)}" >
                    </div>
                    <div class="user-review-content">
                        <h3>${username} <span>( ${created_at} )</span></h3>
                        <p>${content}</p>
                    </div>
                </div>
            `; 
        })
    } else {
        movieReview.innerHTML = '<h1>No reviews</h1>'
    }
    closeModal();
}

// Open Movie Function
const openMovie = movies => {
    movies.results.forEach(movie => {
        const { title, poster_path, backdrop_path, overview, release_date, id } = movie;
        const modalBtn = document.querySelector(`#movie-modal-${id}`);

        if(poster_path != null && backdrop_path != null) {
            modalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                movieModal.classList.add('show');
                
                setTimeout(() => {
                    document.querySelector('html').style.overflow = 'hidden'
                }, 500)
    
                movieHeader.innerHTML = `
                    <div class="movie" style="background-image: url('${img_path + backdrop_path}')">
                        <div class="container">
                            <div class="overlay"></div>
                            <div class="movie-section">
                                <div class="movie-image">
                                    <img src="${img_path + poster_path}" alt="">
                                    <h3>Release date: ${release_date}</h3>
                                </div>
                                <div class="movie-info">
                                    <h1>${title}</h1>
                                    <p>${overview}</p>
                                    <a href="#" target='_blank' id="${id}"><i class="fas fa-play"></i> Play Clip</a>
                                </div>
                            </div>
                        </div>
                    </div> 
                `
    
                // Show Video
                getVideo(id);
    
                // Review Section
                getReview(id);
    
                // Get Recomended Movies
                recomendedMovies(id)
    
                // Close Modal
                closeModal();
            })
        }
    })
}

// Get Video Function
const getVideo = async movie_id => {
    const video_url = `https://api.themoviedb.org/3/movie/${movie_id}/videos?api_key=a2949ba2bbc81404864f35921a20a1d0&language=en-US`;
    const res = await fetch(video_url);
    const data = await res.json();
    const playBtn = document.getElementById(`${movie_id}`);

    const max_videos = (data.results.length > 1) ? 1 : data.results.length;

    playBtn.addEventListener('click', () => {
        for(let i = 0; i < max_videos; i++) {
            playBtn.href = `https://youtube.com/embed/${data.results[i].key}`
        }
    })
}

// Pagination button for foward
fowardBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if(nextPage <= totalPages){
        pagination(nextPage);
    }      
});

// Pagination button for backward
backwardBtn.addEventListener('click', (e) => {
    e.preventDefault();

    if(prevPage > 0) {
        pagination(prevPage);
    }
});

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

            backBtn.classList.add('active')
            
        }, 500);

        search.value = ''
    }
});

// Hide Loader Function
const hideLoader = () => {
    setTimeout(() => {
        loading.style.display = 'none'
        setTimeout(() => {loading.style.opacity = 0}, 50)

        movies_section.style.display = 'flex';
        setTimeout(() => {movies_section.style.opacity = 1}, 50)
    }, 700)
}

// Display Loader Function
const displayLoader = () => {
    loading.style.display = 'block';
    setTimeout(() => {loading.style.opacity = 1}, 50)
    
    movies_section.style.display = 'none'
    setTimeout(() => {movies_section.style.opacity = 0}, 50)
}

// Close Modal Function
const closeModal = () => {
    let closeBtn = document.querySelector('#close-btn');

    closeBtn.addEventListener('click', () => {
        movieModal.classList.remove('show')
        document.querySelector('html').style.overflow = 'auto'        
    
        movieRecomended.innerHTML = '';
        movieReview.innerHTML = ''; 
    })
}

// Set profile image on users that dont have it
const noProfileImge = (path, img) => {
    if(img === null) { 
        return '../img/no-profile-image.jpg' 
    } else if(img.length < 40) {
        return path + img
    } else {
        return '../img/no-profile-image.jpg' 
    }
}

// Get Class By Rating Function
const getClassByRating = (rate) => {
    if(rate >= 8) {
        return 'green';
    } else if(rate >= 5) {
        return 'orange';
    } else {
        return 'red';
    }
}

getMovies(api_url);