async function predict_action() {
  let html_ele1 = document.getElementById('first_action_c1')
  let html_ele2 = document.getElementById('first_action_c2')
  let html_data1 = ''
  let html_data2 = ''
  let movie_id = ""

  await fetch("../../xyz.json")
    .then((response1) => response1.json()
    )
    .then((data) => {
      data_obj = data[1];
      // console.log(data_obj)
      for (let i = 0; i < 3; i++) {
        movie_id = data_obj[i]
        // console.log(movie_id)
        tmdb_api = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=d4139ea8b8e52b7b30c4608c46d996e7`

        const xhr = new XMLHttpRequest;
        xhr.open("GET", tmdb_api, false);

        xhr.onload = function () {
          //console.log();
          let file = JSON.parse(this.responseText);
          // console.log(file)
          let item = `
                      <div class="col-md-4 mb-3">
                      <div class="card">  
                          <img class="img-fluid" alt="100%x280" src=https://image.tmdb.org/t/p/w500${file.poster_path}>
    
                          <div class="card-body">
                              <h2 class="card-title">${file.title}</h2>
                              <p class="card-text">${file.overview}</p>
          
                          </div>
          
                        </div>
                      </div>`

          html_data1 += item

        }


        xhr.send();
      }
      html_ele1.innerHTML = html_data1;

      for (let i = 3; i < 6; i++) {
        movie_id = data_obj[i]

        tmdb_api = `https://api.themoviedb.org/3/movie/${movie_id}?api_key=d4139ea8b8e52b7b30c4608c46d996e7`

        const xhr = new XMLHttpRequest;
        xhr.open("GET", tmdb_api, false);

        xhr.onload = function () {
          // console.log();
          let file = JSON.parse(this.responseText);
          // console.log(file)
          let item = `
                          <div class="col-md-4 mb-3">
                          <div class="card">  
                              <img class="img-fluid" alt="100%x280" src=https://image.tmdb.org/t/p/w500${file.poster_path}>
        
                              <div class="card-body">
                                  <h2 class="card-title">${file.title}</h2>
                                  <p class="card-text">${file.overview}</p>
              
                              </div>
              
                            </div>
                          </div>`

          html_data2 += item

        }


        xhr.send();
      }
    })


  html_ele2.innerHTML = html_data2;
}

predict_action();

