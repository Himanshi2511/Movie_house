import numpy as np
import pandas as pd
import ast
import nltk
import json
import pickle

movies = pd.read_csv('./static/dataset/tmdb_5000_movies.csv')
credits = pd.read_csv('./static/dataset/tmdb_5000_credits.csv') 

movies = movies.merge(credits,on='title')
movies = movies[['movie_id','title','overview','genres','keywords','cast']]

# print(movies['genres'][0])


# appending genres(Action,Fantasy...) and keywords(Future wars,space...) after converting in list
def convert(text):
    L = []
    for i in ast.literal_eval(text):
        L.append(i['name']) 
    return L 
movies.dropna(inplace=True)

movies['keywords'] = movies['keywords'].apply(convert)
movies['genres'] = movies['genres'].apply(convert)

# print(movies)

# Appending top 5 actor name from cast
def convert3(text):
    L = []
    counter = 0
    for i in ast.literal_eval(text):
        if counter < 3:
            L.append(i['name'])
        else :
            break
        counter+=1
    return L 

movies['cast'] = movies['cast'].apply(convert)

# print(movies.head())

# Removing spaces

def collapse(L):
    L1 = []
    for i in L:
        L1.append(i.replace(" ",""))
    return L1

movies['cast'] = movies['cast'].apply(collapse)
movies['genres'] = movies['genres'].apply(collapse)
movies['keywords'] = movies['keywords'].apply(collapse)

movies_tags = movies ## ### export
movies_exp = movies

movies_tags['overview'] = movies_tags['overview'].apply(lambda x:x.split())
# print(movies_tags['overview'])

movies_tags['tags'] = movies_tags['overview'] + movies_tags['genres'] + movies_tags['keywords'] + movies_tags['cast']


movies_tags = movies.drop(columns=['overview','genres','keywords','cast'])

movies_tags['tags'] = movies_tags['tags'].apply(lambda x: " ".join(x))

# function for stemming__________________
def stem(text):
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)

from nltk.stem.porter import PorterStemmer
ps = PorterStemmer()

movies_tags['tags'] = movies_tags['tags'].apply(stem)

# end _____________________


# print(movies_tags)

# converting movies to vector form


from sklearn.feature_extraction.text import CountVectorizer
cv = CountVectorizer(max_features=5000,stop_words='english')

vector = cv.fit_transform(movies_tags['tags']).toarray()

# vector.shape



from sklearn.metrics.pairwise import cosine_similarity

similarity = cosine_similarity(vector) #have to export
# already done ################################################################
# print(type(similarity))


movie_id_list = []
movie_id_list = movies['movie_id'] #export
movie_id_list = movie_id_list.to_json();
# print(movie_id_list)

movie_id_action = []            #export
movie_id_adventure = []         #export
movie_id_thriller = []          #export

for x in range(len(movies)):
    try:
        for element in movies.genres[x]:
            if "Action" in element:
                movie_id_action.append(movies.movie_id[x])
            if "Adventure" in element:
                movie_id_adventure.append(movies.movie_id[x])
            if "Thriller" in element:
                movie_id_thriller.append(movies.movie_id[x])
    except:
        print("Error occured!")

print(type(movie_id_action))
# movie_id_action= movie_id_action.tolist()
# movie_id_adventure = movie_id_adventure
# movie_id_thriller = movie_id_thriller


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

obj_json = {
    1:movie_id_list,
    2:movie_id_action,
    3:movie_id_adventure,
    4:movie_id_thriller
}




with open("movie_list.json", "w") as fp:
    json_string =  json.dump(obj_json,fp,indent=4,cls=NpEncoder)

################################################################################3

pickle.dump(movies,open('movie_list.pkl','wb'))
pickle.dump(similarity,open('similarity.pkl','wb'))


