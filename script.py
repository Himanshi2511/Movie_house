import json
import sys
import os
import pickle
import numpy as np


def recommend(movie):
    try:
        index = movies[movies['title'] == movie].index[0]
        # print(movies)
        distances = sorted(list(enumerate(similarity[index])), reverse=True, key=lambda x: x[1])
        recommended_movie_id = []
        for i in distances[0:20]:
            # fetch the movie poster
            recommended_movie_id.append(movies.iloc[i[0]].movie_id)
            # recommended_movie_names.append(movies.iloc[i[0]].title)
        return recommended_movie_id
    except :
        print("Movie not found")

# print("I'm running here 1 :/")
# sys.stdout.flush()
movies = pickle.load(open('movie_list.pkl','rb'))
similarity = pickle.load(open('similarity.pkl','rb'))
data = recommend(sys.argv[1])



obj= {
    1:data
}

# print(data)

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

path = os.path.abspath("static")
with open(path+"/xyz.json", "w") as fp:
    json_string =  json.dump(obj,fp,indent=4,cls=NpEncoder)




 