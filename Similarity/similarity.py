def get_recipes(sample_str):

    # import relevant libraries
    import pandas as pd
    import numpy as np
    from collections import Counter
    import nltk 
    from nltk.tokenize import sent_tokenize, word_tokenize
    from nltk.corpus import stopwords
    import ast
    import re
    import math

    #load the csv
    df = pd.read_csv('df_similaritly.csv')
    
    # convert to list of strings to dicts
    counterA = Counter(sample_str)
    counterB = Counter(df['ingredient_list'][0])
    
    # define a function to calculate the cosine similarity between two lists
    def counter_cosine_similarity(c1, c2):
        '''a function to calculate the cosine similarity between two lists'''
        terms = set(c1).union(c2)
        dotprod = sum(c1.get(k, 0) * c2.get(k, 0) for k in terms)
        magA = math.sqrt(sum(c1.get(k, 0)**2 for k in terms))
        magB = math.sqrt(sum(c2.get(k, 0)**2 for k in terms))
        return dotprod / (magA * magB)

    # create a column to store the similarites
    df['similarity_score']=""

    # loop through each row and calculate the similarity score
    for index, row in df.iterrows():
        try:
            counterB = Counter(row['ingredient_list'])
            score = counter_cosine_similarity(counterA,counterB)
            df.set_value(index,'similarity_score',score)
        except ZeroDivisionError:
            df.set_value(index,'similarity_score',0)
            
            
    # sort the dataframe by similarity, rating, and make it again scores and filter the top3
    results = df.sort_values(by=['similarity_score','rating','makeitagainscore'],ascending=[False,False,False])[:3]
    
    # extract only the relevant columns
    results = results[['urls','ingredients_refined','tags_refined','title','rating','preparation','similarity_score']]
    
    # reset the index
    results = results.reset_index(drop='index')
    
    # convert the result to json
    results_json = results.to_json(orient='index')
    
    return results_json
