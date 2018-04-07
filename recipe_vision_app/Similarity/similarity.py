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
    df = pd.read_csv('Similarity/df_similarity.csv')
    
    # convert to list of strings to dicts
    counterA = Counter(sample_str)

    # define a function to calculate the cosine similarity between two lists
    def counter_cosine_similarity(c1, c2):
        '''a function to calculate the cosine similarity between two lists'''
        terms = set(c1).union(c2)
        dotprod = sum(c1.get(k, 0) * c2.get(k, 0) for k in terms)
        magA = math.sqrt(sum(c1.get(k, 0)**2 for k in terms))
        magB = math.sqrt(sum(c2.get(k, 0)**2 for k in terms))
        return dotprod / (magA * magB)

    # Loop through each row and calculate the similarity score
    df["similarity_score"] = ""  # Create similarity score column
    for index, row in df.iterrows():
        # Reset value to zero
        row["similarity_score"] = 0
        try:
            # Set row value to the list via ast
            ingredients_list = ast.literal_eval(row['ingredient_list'])
            counterB = Counter(ingredients_list)
            score = counter_cosine_similarity(counterA,counterB)
            df.set_value(index,'similarity_score',score)
        except ZeroDivisionError:
            df.set_value(index,'similarity_score',0)       
                    
    # Convert the similarity_score column to float type before we sort
    df.similarity_score = df.similarity_score.astype(float)
    results_all = df.sort_values(by='similarity_score',ascending=False)

    # Extract only the relevant columns
    results = results_all[:4] # Pull four top recipes
    results = results[['urls','ingredients_refined','tags_refined','title','rating','preparation','similarity_score']]
    
    # reset the index
    results = results.reset_index(drop='index')
    
    # Convert the dictionary version of the dataframe
    return results.to_dict()


